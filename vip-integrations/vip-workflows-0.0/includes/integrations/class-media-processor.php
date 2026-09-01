<?php
/**
 * Media Processor - Generic AI processing for images, audio, video, and PDFs.
 *
 * Provides core processing logic that can be used by both pitch assets
 * and research sources. Does NOT handle storage - returns results for
 * the caller to store as needed.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use VIPWorkflows\AI\PromptRegistry;
use VIPWorkflows\AI\Credentials;
use VIPWorkflows\AI\AiInference;
use VIPWorkflows\Abilities\AiAvailability;
use WP_Error;

/**
 * Media processor class.
 */
class MediaProcessor {


	/**
	 * Maximum file size for Whisper API (25MB).
	 */
	public const MAX_WHISPER_SIZE = 25 * 1024 * 1024;


	/**
	 * Check if AI is configured.
	 *
	 * Asks about the admin-selected provider, which is what three of this class's
	 * four processing paths use: `analyze_image()`, `process_pdf()` and
	 * `summarize_text()` all resolve their model through `AiInference`. The
	 * previous check named OpenAI, so a site running another provider was refused
	 * outright — and pointed at "Settings → AI Services", a screen that does not
	 * exist.
	 *
	 * Transcription is the exception and is deliberately *not* covered here:
	 * `call_whisper_api()` posts directly to OpenAI's endpoint, so it is
	 * OpenAI-only no matter what the site has selected, and it keeps its own key
	 * check. Gating the whole class on OpenAI to accommodate it would block image
	 * and PDF analysis that would have worked.
	 *
	 * @return true|WP_Error True if configured, WP_Error otherwise.
	 */
	public function check_configuration(): true|WP_Error {
		if ( AiAvailability::is_configured() ) {
			return true;
		}

		return new WP_Error( 'ai_not_configured', AiAvailability::unconfigured_notice() );
	}

	/**
	 * Process a file based on its mime type.
	 *
	 * @param string $file_path Full path to the file.
	 * @param string $mime_type File mime type.
	 * @return array|WP_Error Processing result or error.
	 */
	public function process_file( string $file_path, string $mime_type ) {
		$config_check = $this->check_configuration();
		if ( is_wp_error( $config_check ) ) {
			return $config_check;
		}

		if ( ! file_exists( $file_path ) ) {
			return new WP_Error( 'file_not_found', __( 'File not found.', 'vip-workflows' ) );
		}

		$path_error = UploadsPathGuard::validate( $file_path );
		if ( is_wp_error( $path_error ) ) {
			return $path_error;
		}

		if ( str_starts_with( $mime_type, 'image/' ) ) {
			return $this->analyze_image( $file_path, $mime_type );
		}

		if ( str_starts_with( $mime_type, 'audio/' ) || str_starts_with( $mime_type, 'video/' ) ) {
			return $this->transcribe_audio_video( $file_path );
		}

		if ( 'application/pdf' === $mime_type ) {
			return $this->process_pdf( $file_path, $mime_type );
		}

		return new WP_Error(
			'unsupported_type',
			/* translators: %s: MIME type of the uploaded file. */
			sprintf( __( 'Unsupported file type: %s', 'vip-workflows' ), $mime_type )
		);
	}

	/**
	 * Analyze an image using GPT-4o Vision.
	 *
	 * @param string $file_path Full path to the image.
	 * @param string $mime_type Image mime type.
	 * @return array|WP_Error Analysis result.
	 */
	public function analyze_image( string $file_path, string $mime_type ) {
		// Resolve the admin-configurable default, then apply the existing filter.
		$prompt = apply_filters(
			'vip_workflows_ai_image_prompt',
			PromptRegistry::get_instance()->get( 'media/image-analysis' )
		);

		try {
			$file = new \WordPress\AiClient\Files\DTO\File( $file_path, $mime_type );

			/*
			 * The media variant of the image prompt asks for three labelled sections — a
			 * detailed description of people, objects and setting; key details including
			 * any text visible in the image and notable data points; and editorial notes
			 * on relevance and rights concerns — so it produces appreciably more than the
			 * one-line ideation variant. "Thorough but concise" across three sections
			 * models at roughly 500-700 tokens.
			 *
			 * 2,000 above the floor covers a dense or text-heavy image, where the
			 * transcribed text alone can dominate the reply. The previous 1500 sat below
			 * the reasoning cost, so nothing was reaching the content channel.
			 */
			$analysis = \WordPress\AiClient\AiClient::prompt( $prompt )
				->withFile( $file )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( LlmTextGenerator::bounded_max_tokens( LlmTextGenerator::THINKING_FLOOR + 2000 ) )
				->generateText();

			return array(
				'type'        => 'image',
				'content'     => $analysis,
				'summary'     => $this->extract_first_paragraph( $analysis ),
				'processed_at' => current_time( 'mysql' ),
			);

		} catch ( \Exception $e ) {
			return new WP_Error( 'image_analysis_failed', $e->getMessage() );
		}
	}

	/**
	 * Transcribe audio or video using Whisper API and summarize.
	 *
	 * Transcription requires OpenAI specifically — `call_whisper_api()` posts to
	 * OpenAI's endpoint directly and honors no provider selection — so it can fail
	 * on a site whose selected provider is configured and working. The summary step
	 * that follows does go through the selected provider.
	 *
	 * @param string $file_path Full path to the audio/video file.
	 * @return array|WP_Error Transcription and summary result.
	 */
	public function transcribe_audio_video( string $file_path ) {
		// Check file size.
		$file_size = filesize( $file_path );
		if ( $file_size > self::MAX_WHISPER_SIZE ) {
			return new WP_Error(
				'file_too_large',
				sprintf(
					/* translators: %d: maximum transcription file size in megabytes. */
					__( 'File is too large for transcription. Maximum size is %dMB.', 'vip-workflows' ),
					self::MAX_WHISPER_SIZE / ( 1024 * 1024 )
				)
			);
		}

		// Get transcript from Whisper.
		$transcript = $this->call_whisper_api( $file_path );
		if ( is_wp_error( $transcript ) ) {
			return $transcript;
		}

		// Generate summary.
		$summary = $this->summarize_text( $transcript, 'audio/video transcript' );

		return array(
			'type'        => 'transcript',
			'content'     => $transcript,
			'summary'     => is_wp_error( $summary ) ? null : $summary,
			'processed_at' => current_time( 'mysql' ),
		);
	}

	/**
	 * Process a PDF file by sending it directly to the AI model.
	 *
	 * @param string $file_path Full path to the PDF.
	 * @param string $mime_type PDF mime type.
	 * @return array|WP_Error Extraction and summary result.
	 */
	public function process_pdf( string $file_path, string $mime_type ) {
		// Resolve the admin-configurable default, then apply the existing filter.
		$prompt = apply_filters(
			'vip_workflows_media_pdf_prompt',
			PromptRegistry::get_instance()->get( 'media/pdf-analysis' )
		);

		try {
			$file = new \WordPress\AiClient\Files\DTO\File( $file_path, $mime_type );

			/*
			 * The one ceiling here that the reply dominates outright, and the only one
			 * bounded by the input rather than by the task: past a 2-3 paragraph summary
			 * the prompt asks for "the full text content of the document", so what the
			 * model wants to write is however long the PDF is. This number is therefore a
			 * cap on how much of a document can be extracted, and no value makes every
			 * PDF fit.
			 *
			 * 10,000 above the floor leaves roughly 10,000 tokens — about 40,000
			 * characters — of extracted text once reasoning is paid for, against the
			 * ~16,000 characters the previous 4000 allowed before reasoning left it none
			 * at all. Not raised further because the AI Client's terminal call is not
			 * streamed: a larger non-streamed budget trades a truncated extraction, which
			 * is reported as one, for an HTTP timeout, which is not.
			 */
			$response = \WordPress\AiClient\AiClient::prompt( $prompt )
				->withFile( $file )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( LlmTextGenerator::bounded_max_tokens( LlmTextGenerator::THINKING_FLOOR + 10000 ) )
				->generateText();

			$parsed = $this->parse_pdf_response( $response );

			return array(
				'type'         => 'document',
				'content'      => $parsed['content'],
				'summary'      => $parsed['summary'],
				'key_points'   => $parsed['key_points'],
				'processed_at' => current_time( 'mysql' ),
			);

		} catch ( \Exception $e ) {
			return new WP_Error( 'pdf_analysis_failed', $e->getMessage() );
		}
	}

	/**
	 * Call the OpenAI Whisper API for transcription.
	 *
	 * @param string $file_path Full path to the audio/video file.
	 * @return string|WP_Error Transcript text or error.
	 */
	private function call_whisper_api( string $file_path ): string|WP_Error {
		$api_key = Credentials::get_instance()->api_key( 'openai' );
		if ( ! $api_key ) {
			return new WP_Error( 'no_api_key', __( 'OpenAI API key not configured.', 'vip-workflows' ) );
		}

		$boundary = wp_generate_password( 24, false );

		// Build multipart form data.
		$body  = '';
		$body .= '--' . $boundary . "\r\n";
		$body .= 'Content-Disposition: form-data; name="model"' . "\r\n\r\n";
		$body .= 'whisper-1' . "\r\n";
		$body .= '--' . $boundary . "\r\n";
		$body .= 'Content-Disposition: form-data; name="file"; filename="' . basename( $file_path ) . '"' . "\r\n";
		$body .= 'Content-Type: ' . mime_content_type( $file_path ) . "\r\n\r\n";
		$body .= file_get_contents( $file_path ) . "\r\n";
		$body .= '--' . $boundary . '--' . "\r\n";

		$response = wp_remote_post(
			'https://api.openai.com/v1/audio/transcriptions',
			array(
				// phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout -- Whisper transcription runs in an async source-processing job.
				'timeout' => 120,
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'multipart/form-data; boundary=' . $boundary,
				),
				'body'    => $body,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $body['error'] ) ) {
			return new WP_Error( 'whisper_error', $body['error']['message'] ?? __( 'Transcription failed.', 'vip-workflows' ) );
		}

		return $body['text'] ?? '';
	}

	/**
	 * Summarize text content using GPT.
	 *
	 * @param string $text        Text to summarize.
	 * @param string $content_type Description of content type for prompt.
	 * @return string|WP_Error Summary or error.
	 */
	private function summarize_text( string $text, string $content_type = 'content' ): string|WP_Error {
		// Resolve the admin-configurable instruction with the content type
		// substituted, append the content, then apply the existing filter.
		$instruction = PromptRegistry::get_instance()->get(
			'media/text-summary',
			array( 'content_type' => $content_type )
		);
		$prompt = apply_filters(
			'vip_workflows_ai_summary_prompt',
			$instruction . "\n\nContent:\n" . $text,
			$content_type
		);

		try {
			/*
			 * The prompt fixes the reply's length rather than leaving it to the input:
			 * 2-3 concise paragraphs, whatever the size of the transcript being
			 * summarized. That is roughly 250-400 tokens, comfortably inside the floor's
			 * own headroom, so nothing is added on top. The previous 500 was ample for
			 * the paragraphs and an eighth of the reasoning that precedes them.
			 */
			$summary = \WordPress\AiClient\AiClient::prompt( $prompt )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( LlmTextGenerator::bounded_max_tokens( LlmTextGenerator::THINKING_FLOOR ) )
				->generateText();

			return $summary;

		} catch ( \Exception $e ) {
			return new WP_Error( 'summarization_failed', $e->getMessage() );
		}
	}

	/**
	 * Parse structured PDF response into summary, content, and key points.
	 *
	 * @param string $response AI response.
	 * @return array{summary: string, content: string, key_points: array}
	 */
	private function parse_pdf_response( string $response ): array {
		$summary    = '';
		$key_points = array();
		$content    = '';

		if ( preg_match( '/SUMMARY:\s*\n(.*?)(?=EXTRACTED TEXT:|$)/si', $response, $matches ) ) {
			$summary = trim( $matches[1] );
		}

		if ( preg_match( '/EXTRACTED TEXT:\s*\n(.*)$/si', $response, $matches ) ) {
			$content = trim( $matches[1] );
		}

		if ( empty( $summary ) && empty( $content ) ) {
			$content = $response;
			$summary = $this->extract_first_paragraph( $response );
		}

		return array(
			'summary'    => $summary,
			'key_points' => $key_points,
			'content'    => $content,
		);
	}

	/**
	 * Extract first paragraph as a simple summary.
	 *
	 * @param string $text Full text.
	 * @return string First paragraph.
	 */
	private function extract_first_paragraph( string $text ): string {
		$paragraphs = preg_split( '/\n\s*\n/', $text, 2 );
		$first      = trim( $paragraphs[0] ?? '' );

		// Limit length.
		if ( mb_strlen( $first ) > 500 ) {
			$first = mb_substr( $first, 0, 500 ) . '...';
		}

		return $first;
	}

	/**
	 * Get supported mime types for upload.
	 *
	 * @return array Associative array of type => mime types.
	 */
	public static function get_supported_types(): array {
		return array(
			'image'    => array( 'image/jpeg', 'image/png', 'image/gif', 'image/webp' ),
			'audio'    => array( 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mp4' ),
			'video'    => array( 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo' ),
			'document' => array( 'application/pdf' ),
		);
	}

	/**
	 * Check if a mime type is supported.
	 *
	 * @param string $mime_type Mime type to check.
	 * @return bool True if supported.
	 */
	public static function is_supported( string $mime_type ): bool {
		foreach ( self::get_supported_types() as $types ) {
			if ( in_array( $mime_type, $types, true ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Get the source type for a mime type.
	 *
	 * @param string $mime_type Mime type.
	 * @return string Source type (image, audio, video, document).
	 */
	public static function get_source_type( string $mime_type ): string {
		if ( str_starts_with( $mime_type, 'image/' ) ) {
			return 'image';
		}
		if ( str_starts_with( $mime_type, 'audio/' ) ) {
			return 'audio';
		}
		if ( str_starts_with( $mime_type, 'video/' ) ) {
			return 'video';
		}
		if ( 'application/pdf' === $mime_type ) {
			return 'document';
		}
		return 'document';
	}
}
