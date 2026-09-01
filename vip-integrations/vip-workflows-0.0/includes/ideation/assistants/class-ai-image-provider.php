<?php
/**
 * AI Image Provider.
 *
 * Generates images via OpenAI's DALL-E / gpt-image models using the
 * WordPress AI Client. Generated images are saved to the WP Media Library.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

use VIPWorkflows\AI\Credentials;
use VIPWorkflows\Abilities\Requirement;
use VIPWorkflows\Abilities\RequirementFactory;
use VIPWorkflows\Integrations\SsrfGuard;
use WP_Error;

/**
 * Ai Image Provider.
 */
class AiImageProvider implements MediaProviderInterface, MediaProviderRequirements {

	/**
	 * Get the identifier.
	 *
	 * @return string
	 */
	public function get_id(): string {
		return 'openai-dalle';
	}

	/**
	 * Get the display name.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return __( 'AI Generated (OpenAI)', 'vip-workflows' );
	}

	/**
	 * Check whether the provider is configured.
	 *
	 * Genuinely OpenAI-specific, and deliberately not routed through
	 * `AiAvailability`: `search_media()` calls `generateImage()`, an image
	 * capability this plugin only has through OpenAI, and it names no model. The
	 * text-generation check additionally requires a *text* model to be chosen for
	 * the provider, which has nothing to do with generating an image — asking it
	 * here would refuse image generation over an unrelated setting.
	 *
	 * Asks `Credentials` rather than `AiClient::isConfigured()`, which validates
	 * the key by listing models over the network. This runs on every media-provider
	 * read, and a key's validity is not something a configuration check can answer
	 * without a round trip.
	 *
	 * @return bool
	 */
	public function is_configured(): bool {
		if ( ! $this->has_ai_client() ) {
			return false;
		}

		return Credentials::get_instance()->has_key( 'openai' );
	}

	/**
	 * Whether this environment ships the WordPress AI client.
	 *
	 * Its own method so both the configured check and the requirement report ask
	 * the same question, and so a test can simulate an environment without it.
	 *
	 * @since 0.0.1
	 *
	 * @return bool
	 */
	protected function has_ai_client(): bool {
		return class_exists( '\WordPress\AiClient\AiClient' );
	}

	/**
	 * Describe the unmet requirement blocking this provider.
	 *
	 * An absent AI client is an environment problem with nothing to configure, so
	 * it reports `unsupported_environment` and no destination — pointing a site
	 * owner at a credential screen would be a dead end. Once the client is
	 * present, the only remaining gap is the OpenAI credential, which does have a
	 * destination.
	 *
	 * @since 0.0.1
	 *
	 * @return Requirement
	 */
	public function get_unmet_requirement(): Requirement {
		if ( ! $this->has_ai_client() ) {
			return RequirementFactory::unsupported_environment(
				'dependency:ai-client',
				__( 'The WordPress AI client is not available on this site, so images cannot be generated.', 'vip-workflows' ),
				__( 'AI image generation is not available on this site.', 'vip-workflows' ),
				array( $this->get_name() )
			);
		}

		return RequirementFactory::missing_credential( 'openai', 'OpenAI', array( $this->get_name() ) );
	}

	/**
	 * Check whether the provider generates media.
	 *
	 * @return bool
	 */
	public function is_generative(): bool {
		return true;
	}

	/**
	 * Search for media.
	 *
	 * @param string $query Search query.
	 * @param int    $max_results max results.
	 * @param array  $context context.
	 */
	public function search_media( string $query, int $max_results = 1, array $context = array() ) {
		if ( ! $this->is_configured() ) {
			return new WP_Error( 'not_configured', 'OpenAI not configured.' );
		}

		try {
			$file = \WordPress\AiClient\AiClient::prompt( $query )
				->generateImage();

			$base64_data = $file->getBase64Data();
			if ( empty( $base64_data ) && $file->getUrl() ) {
				$url = $file->getUrl();

				$validation = SsrfGuard::validate( $url );
				if ( is_wp_error( $validation ) ) {
					// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- SSRF rejection audit logging.
					error_log(
						sprintf(
							'[vip-workflows] AI image URL rejected by SSRF guard: %s (%s)',
							$validation->get_error_code(),
							$validation->get_error_message()
						)
					);
					return new WP_Error(
						'ssrf_rejected',
						__( 'AI provider returned a URL outside the approved egress allowlist.', 'vip-workflows' )
					);
				}

				return array(
					array(
						'url'          => $url,
						'title'        => $query,
						'source_url'   => null,
						'domain'       => 'AI Generated',
						'thumbnail'    => null,
						'media_type'   => 'image',
						'duration'     => null,
						'width'        => null,
						'height'       => null,
						'provider'     => $this->get_id(),
						'is_generated' => true,
					),
				);
			}

			// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
			$image_data = base64_decode( $base64_data );
			$mime_type  = $file->getMimeType();
			$extension  = 'image/png' === $mime_type ? 'png' : 'webp';
			$filename   = 'ideation-ai-' . wp_generate_password( 8, false ) . '.' . $extension;

			$attachment_id = $this->save_to_media_library( $image_data, $filename, $mime_type );
			if ( is_wp_error( $attachment_id ) ) {
				return $attachment_id;
			}

			$url = wp_get_attachment_url( $attachment_id );

			return array(
				array(
					'url'           => $url,
					'title'         => $query,
					'source_url'    => null,
					'domain'        => 'AI Generated',
					'thumbnail'     => null,
					'media_type'    => 'image',
					'duration'      => null,
					'width'         => null,
					'height'        => null,
					'provider'      => $this->get_id(),
					'is_generated'  => true,
					'attachment_id' => $attachment_id,
				),
			);
		} catch ( \Exception $e ) {
			return new WP_Error( 'generation_failed', $e->getMessage() );
		}
	}

	/**
	 * Save to media library.
	 *
	 * @param string $data data.
	 * @param string $filename filename.
	 * @param string $mime_type mime type.
	 * @return int|\WP_Error
	 */
	private function save_to_media_library( string $data, string $filename, string $mime_type ): int|\WP_Error {
		$upload = wp_upload_bits( $filename, null, $data );
		if ( ! empty( $upload['error'] ) ) {
			return new WP_Error( 'upload_failed', $upload['error'] );
		}

		$attachment = array(
			'post_mime_type' => $mime_type,
			'post_title'     => sanitize_file_name( pathinfo( $filename, PATHINFO_FILENAME ) ),
			'post_content'   => '',
			'post_status'    => 'inherit',
		);

		$id = wp_insert_attachment( $attachment, $upload['file'] );
		if ( is_wp_error( $id ) ) {
			return $id;
		}

		require_once ABSPATH . 'wp-admin/includes/image.php';
		$metadata = wp_generate_attachment_metadata( $id, $upload['file'] );
		wp_update_attachment_metadata( $id, $metadata );

		return $id;
	}
}
