<?php
/**
 * Tavily Search Provider.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Research\SearchProviders;

use VIPWorkflows\AI\Credentials;
use VIPWorkflows\API\AvailabilitySerializer;
use VIPWorkflows\Abilities\Requirement;
use VIPWorkflows\Abilities\RequirementFactory;
use VIPWorkflows\Integrations\Markdown;
use WP_Error;

/**
 * Tavily search provider implementation.
 */
class TavilyProvider implements SearchProviderInterface {


	/**
	 * API endpoint.
	 */
	private const API_URL = 'https://api.tavily.com/search';

	/**
	 * Get the identifier.
	 *
	 * @return string
	 */
	public function get_id(): string {
		return 'tavily';
	}

	/**
	 * Get the display name.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return __( 'Tavily', 'vip-workflows' );
	}

	/**
	 * Get the description.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'AI-powered search API optimized for LLMs and RAG applications. Includes content extraction.', 'vip-workflows' );
	}

	/**
	 * Check whether the provider is configured.
	 *
	 * @return bool
	 */
	public function is_configured(): bool {
		return ! empty( Credentials::get_instance()->api_key( 'tavily' ) );
	}

	/**
	 * Get the configuration error.
	 *
	 * Defers to the requirement factory rather than naming a screen. The wording
	 * has to differ by install — the Connectors backend has a credential screen
	 * and the legacy backend has none — and the factory is the one place that
	 * knows which. Naming a screen here is what produced the long-standing
	 * instruction to visit a page that never existed.
	 *
	 * `search()` wraps this string in a `WP_Error` an editor can see, so the
	 * message register has to be chosen rather than assumed: the admin register may
	 * name an admin screen or a `wp-config.php` constant, neither of which an
	 * `edit_posts`-only reader can act on. The choice reuses
	 * `AvailabilitySerializer::register_for_current_user()` so the plugin keeps
	 * exactly one line mapping a capability to a register.
	 *
	 * @return ?string
	 */
	public function get_configuration_error(): ?string {
		if ( $this->is_configured() ) {
			return null;
		}

		$requirement = RequirementFactory::missing_credential( $this->get_id(), $this->get_name() );

		// Flat text with no room for a link, so the admin register folds the
		// destination into the sentence; the user register never carries one.
		return Requirement::REGISTER_ADMIN === AvailabilitySerializer::register_for_current_user()
			? $requirement->get_admin_text()
			: $requirement->get_user_message();
	}

	/**
	 * Execute a search query.
	 *
	 * @param string $query       The search query.
	 * @param int    $max_results Maximum number of results to return.
	 * @return array|WP_Error Array of results or WP_Error on failure.
	 */
	public function search( string $query, int $max_results = 10 ) {
		if ( ! $this->is_configured() ) {
			return new WP_Error(
				'provider_not_configured',
				$this->get_configuration_error(),
				array( 'status' => 400 )
			);
		}

		$api_key = Credentials::get_instance()->api_key( 'tavily' );

		$response = wp_remote_post(
			self::API_URL,
			array(
				// phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout -- editor-initiated research assistant search expected to take time.
				'timeout' => 30,
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body'    => wp_json_encode(
					array(
						'api_key'             => $api_key,
						'query'               => $query,
						'max_results'         => $max_results,
						'include_raw_content' => true,
						'include_images'      => true,
					)
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return new WP_Error(
				'search_failed',
				/* translators: %s: search provider error message. */
				sprintf( __( 'Search failed: %s', 'vip-workflows' ), $response->get_error_message() ),
				array( 'status' => 500 )
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		$body        = wp_remote_retrieve_body( $response );
		$data        = json_decode( $body, true );

		if ( 200 !== $status_code ) {
			$error_msg = $data['detail'] ?? $data['error'] ?? __( 'Unknown error', 'vip-workflows' );
			return new WP_Error(
				'search_failed',
				/* translators: %s: search provider error message. */
				sprintf( __( 'Search failed: %s', 'vip-workflows' ), $error_msg ),
				array( 'status' => $status_code )
			);
		}

		return $this->transform_results( $data );
	}

	/**
	 * Transform results.
	 *
	 * @param array $data data.
	 * @return array
	 */
	private function transform_results( array $data ): array {
		$results = array();
		$images  = $data['images'] ?? array();

		if ( ! isset( $data['results'] ) || ! is_array( $data['results'] ) ) {
			return $results;
		}

		foreach ( $data['results'] as $index => $result ) {
			$url    = $result['url'] ?? '';
			$domain = '';
			if ( $url ) {
				$parsed = wp_parse_url( $url );
				$domain = $parsed['host'] ?? '';
			}

			$excerpt = Markdown::to_single_line(
				self::restore_elided_breaks( (string) ( $result['content'] ?? '' ) )
			);

			$image = isset( $images[ $index ] ) ? $images[ $index ] : null;

			$results[] = array(
				'url'          => $url,
				'title'        => $result['title'] ?? '',
				'domain'       => $domain,
				'excerpt'      => $excerpt,

				/*
				 * Kept as markdown. The detail modal renders it, the board card
				 * preview strips it for its own plain-text slot, and IdeationAnalyzer
				 * feeds it to prompts, where markdown reads no worse than prose.
				 * Flattening it here would discard structure every one of those
				 * consumers can now use.
				 */
				'content'      => $result['raw_content'] ?? $result['content'] ?? '',
				'image'        => $image,
				'published_at' => $result['published_date'] ?? null,
				'author'       => null,
				'source_type'  => 'article',
				'score'        => $result['score'] ?? null,
			);
		}

		return $results;
	}

	/**
	 * Turn Tavily's elision marker back into a line break.
	 *
	 * Tavily's `content` is a snippet assembled from passages it chose, joined
	 * with a literal `[...]` where it dropped text. That join destroys the line
	 * break the dropped text sat on, so a heading arrives mid-line — which is why
	 * `#### Half Dome Day Hike` reached editors with its hashes intact. A
	 * line-anchored heading rule cannot match it, and loosening the rule to strip
	 * `#` anywhere would eat `Issue #42` out of ordinary copy.
	 *
	 * Restoring the break is also the honest representation: text was removed
	 * there, and a paragraph boundary says so.
	 *
	 * @param  string $snippet Tavily snippet content.
	 * @return string Snippet with elisions as blank lines.
	 */
	private static function restore_elided_breaks( string $snippet ): string {
		return (string) preg_replace( '/\s*\[\s*\.\.\.\s*\]\s*/', "\n\n", $snippet );
	}
}
