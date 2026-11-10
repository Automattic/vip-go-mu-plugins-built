<?php
/**
 * Media Provider Interface.
 *
 * Contract for pluggable media sources (images, videos) in the ideation
 * workspace. Providers can search for existing media or generate new assets.
 *
 * Internal providers implement this directly. External plugins hook into
 * `vip_workflows_media_providers` and return instances of this interface.
 *
 * This interface is frozen with respect to required methods. Because external
 * plugins supply implementations through a public filter, adding a method here
 * would fatal every third-party provider on upgrade. New capabilities are
 * therefore additive and optional: see `MediaProviderRequirements`, which lets a
 * provider explain *why* `is_configured()` is false, and which callers probe for
 * with `instanceof`.
 *
 * @package VIPWorkflows
 *
 * @see MediaProviderRequirements
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

interface MediaProviderInterface {

	/**
	 * Unique provider identifier.
	 *
	 * @return string e.g. 'tavily-images', 'youtube', 'openai-dalle'.
	 */
	public function get_id(): string;

	/**
	 * Human-readable name.
	 *
	 * @return string
	 */
	public function get_name(): string;

	/**
	 * Whether this provider is configured and ready.
	 *
	 * @return bool
	 */
	public function is_configured(): bool;

	/**
	 * Whether this provider generates media (vs. searching existing).
	 *
	 * @return bool
	 */
	public function is_generative(): bool;

	/**
	 * Search or generate media assets.
	 *
	 * @param string $query       Search terms or generation prompt.
	 * @param int    $max_results Max results to return.
	 * @param array  $context     Optional context (seed_analysis, etc.).
	 * @return array|\WP_Error Array of media results or WP_Error.
	 *
	 * Result format:
	 * [
	 *     [
	 *         'url'          => string,       // Media URL (image src or video page).
	 *         'title'        => string,       // Caption or alt text.
	 *         'source_url'   => string|null,  // Page the media is from (null for generated).
	 *         'domain'       => string,       // Source domain or provider name.
	 *         'thumbnail'    => string|null,  // Thumbnail URL (for videos).
	 *         'media_type'   => string,       // 'image' or 'video'.
	 *         'duration'     => string|null,  // Video duration (e.g. "3:45").
	 *         'width'        => int|null,
	 *         'height'       => int|null,
	 *         'provider'     => string,       // Provider ID.
	 *         'is_generated' => bool,         // True if AI-generated.
	 *     ],
	 * ]
	 */
	public function search_media( string $query, int $max_results = 8, array $context = array() );
}
