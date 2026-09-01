<?php
/**
 * Media Scout - Research Ability.
 *
 * Dedicated ability for finding visual and video assets. Runs all registered
 * media providers (Tavily images, Tavily videos, YouTube, AI generation, etc.).
 * Extensible via the `vip_workflows_media_providers` filter.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

use VIPWorkflows\Abilities\Availability;
use VIPWorkflows\Abilities\RequirementGroup;

/**
 * Media Scout.
 */
class MediaScout {

	/**
	 * Register as an ability.
	 */
	public static function register_ability(): void {
		vip_workflows_register_ability(
			'vip-workflows/media-scout',
			array(
				'label'               => __( 'Media Scout', 'vip-workflows' ),
				'description'         => __( 'Finds relevant images and videos from the web.', 'vip-workflows' ),
				'category'            => 'research',
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'project_id'    => array( 'type' => 'integer' ),
						'seed'          => array( 'type' => 'string' ),
						'seed_analysis' => array( 'type' => 'object' ),
						'query'         => array( 'type' => 'string' ),
					),
					'required'   => array( 'seed' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'cards'   => array( 'type' => 'array' ),
						'summary' => array( 'type' => 'string' ),
					),
				),
				'execute_callback'    => array( self::class, 'execute' ),
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'meta'                => array(
					'type'                  => 'research',
					'display_order'         => 30,
					'show_in_rest'          => true,
					'show_in_commands'      => false,
					'transition_eligible'   => false,
					'icon'                  => 'camera',
					'thinking_message'      => __( 'Searching for media...', 'vip-workflows' ),
					'success_message'       => __( 'Media search complete.', 'vip-workflows' ),
					'availability_callback' => array( self::class, 'check_availability' ),
				),
			)
		);
	}

	/**
	 * Check if any non-generative media provider is configured.
	 *
	 * Media Scout needs one search-backed provider, not all of them, so the
	 * unmet case is an `any` group naming every unconfigured candidate rather
	 * than several independent blockers. Satisfaction is settled here — the only
	 * layer with credential access — so a satisfied check returns bare `true`
	 * and no partially-satisfied group ever reaches a consumer.
	 *
	 * Generative providers are excluded from both branches: generating an image
	 * is not finding one, so a configured generator does not make this ability
	 * runnable.
	 *
	 * @since 0.0.1
	 *
	 * @return bool|Availability True when a provider is configured, otherwise the unmet requirements.
	 */
	public static function check_availability(): bool|Availability {
		$requirements = array();

		foreach ( self::get_providers() as $provider ) {
			if ( $provider->is_generative() ) {
				continue;
			}

			if ( $provider->is_configured() ) {
				return true;
			}

			// A provider predating the reason channel contributes no requirement,
			// which reports as "unavailable, reason unknown" rather than fataling.
			if ( $provider instanceof MediaProviderRequirements ) {
				$requirements[] = $provider->get_unmet_requirement();
			}
		}

		if ( empty( $requirements ) ) {
			return Availability::unmet();
		}

		return Availability::unmet( RequirementGroup::any( ...$requirements ) );
	}

	/**
	 * Execute the media search.
	 *
	 * @param  array $input Input parameters.
	 * @return array { cards: array, summary: string }
	 */
	public static function execute( array $input ): array {
		$seed          = $input['seed'] ?? '';
		$seed_analysis = $input['seed_analysis'] ?? array();
		$search_term   = ! empty( $input['query'] ) ? $input['query'] : $seed;
		$providers     = self::get_providers();

		$cards = array();

		foreach ( $providers as $provider ) {
			if ( ! $provider->is_configured() || $provider->is_generative() ) {
				continue;
			}

			$results = $provider->search_media( $search_term, 6, array( 'seed_analysis' => $seed_analysis ) );
			if ( is_wp_error( $results ) ) {
				continue;
			}

			foreach ( $results as $media ) {
				$media_type = $media['media_type'] ?? 'image';
				$cards[]    = array(
					'type'         => $media_type,
					'source_type'  => $media_type,
					'origin'       => 'search',
					'title'        => $media['title'] ?? '',
					'url'          => $media['source_url'] ?? $media['url'],
					'image'        => 'video' === $media_type ? ( $media['thumbnail'] ?? '' ) : $media['url'],
					'thumbnail'    => $media['thumbnail'] ?? null,
					'domain'       => $media['domain'] ?? '',
					'duration'     => $media['duration'] ?? null,
					'provider'     => $media['provider'] ?? $provider->get_id(),
					'is_generated' => $media['is_generated'] ?? false,
					'source'       => 'media-scout',
				);
			}
		}

		if ( empty( $cards ) ) {
			return array(
				'cards'   => array(),
				'summary' => __( 'No media found.', 'vip-workflows' ),
			);
		}

		$image_count = count( array_filter( $cards, fn( $c ) => 'image' === $c['type'] ) );
		$video_count = count( array_filter( $cards, fn( $c ) => 'video' === $c['type'] ) );

		$parts = array();
		if ( $image_count > 0 ) {
			/* translators: %d: number of images */
			$parts[] = sprintf( __( '%d images', 'vip-workflows' ), $image_count );
		}
		if ( $video_count > 0 ) {
			/* translators: %d: number of videos */
			$parts[] = sprintf( __( '%d videos', 'vip-workflows' ), $video_count );
		}

		/* translators: %s: comma-separated list of media counts */
		$summary = sprintf( __( 'Found %s from the web.', 'vip-workflows' ), implode( ', ', $parts ) );

		return array(
			'cards'   => $cards,
			'summary' => $summary,
		);
	}

	/**
	 * Generate media using a generative provider.
	 *
	 * @param  string $prompt  Generation prompt.
	 * @param  array  $context Seed analysis context.
	 * @return array { cards: array, summary: string } or WP_Error.
	 */
	public static function generate_media( string $prompt, array $context = array() ): array|\WP_Error {
		$providers = self::get_providers();

		foreach ( $providers as $provider ) {
			if ( ! $provider->is_generative() || ! $provider->is_configured() ) {
				continue;
			}

			$results = $provider->search_media( $prompt, 1, $context );
			if ( is_wp_error( $results ) ) {
				return $results;
			}

			if ( ! empty( $results ) ) {
				$media      = $results[0];
				$media_type = $media['media_type'] ?? 'image';

				return array(
					'cards'   => array(
						array(
							'type'         => $media_type,
							'source_type'  => $media_type,
							'origin'       => 'ai_generated',
							'title'        => $media['title'] ?? $prompt,
							'url'          => $media['url'],
							'image'        => $media['url'],
							'domain'       => $media['domain'] ?? 'AI Generated',
							'provider'     => $media['provider'] ?? $provider->get_id(),
							'is_generated' => true,
							'source'       => 'media-scout',
						),
					),
					'summary' => __( 'Generated 1 AI image.', 'vip-workflows' ),
				);
			}
		}

		return new \WP_Error( 'no_provider', __( 'No generative media provider available.', 'vip-workflows' ) );
	}

	/**
	 * Get all registered media providers.
	 *
	 * @return MediaProviderInterface[]
	 */
	public static function get_providers(): array {
		$providers = array(
			new TavilyImageProvider(),
			new TavilyVideoProvider(),
			new YouTubeVideoProvider(),
			new AiImageProvider(),
		);

		/**
		 * Filter the list of media providers for ideation.
		 *
		 * @param MediaProviderInterface[] $providers Registered media providers.
		 */
		return apply_filters( 'vip_workflows_media_providers', $providers );
	}
}
