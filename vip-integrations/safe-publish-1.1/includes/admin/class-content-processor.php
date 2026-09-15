<?php
/**
 * Content Processor class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Content\Content_Media_Processor;
use Safe_Publish\Content\Shortcode_ID_Rewriter;
use Safe_Publish\Content\Shortcode_Media_Rewriter;
use Safe_Publish\Media\Media_Importer;
use Safe_Publish\Utils\Auth_Credential_Provider;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Reconcile_Outcome;
use Safe_Publish\Validators\URL_Validator;
use WP_Error;
use WP_HTML_Tag_Processor;
use WP_Post;
use WP_Post_Type;
use WP_Taxonomy;
use WP_Term;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles content transformation, media import, and URL replacement.
 */
class Content_Processor {

	/**
	 * Post meta recording the unix timestamp at which a stale block reference was
	 * repointed in place by a retry.
	 *
	 * @var string
	 */
	public const META_REF_REPOINTED_AT = '_safe_publish_block_ref_repointed_at';

	/**
	 * Post meta recording the unix timestamp at which a stale gallery/playlist
	 * post reference was repointed in place by a retry.
	 *
	 * @var string
	 */
	public const META_GALLERY_REF_REPOINTED_AT = '_safe_publish_gallery_ref_repointed_at';

	/**
	 * Block-name => list of post-ID attrs, optionally gated on sibling attrs
	 * (e.g. core/navigation-link.id only when kind=post-type) and optionally
	 * naming a url_attr to re-derive from the resolved destination id.
	 *
	 * Deliberately curated: Only attrs known to hold a source post/term
	 * reference are remapped; a permalink in any other attr is host-swapped
	 * only, by design.
	 *
	 * @var array<string, list<array{attr:string, gated_by?: array<string,string>, url_attr?: string}>>
	 */
	private const POST_ID_BLOCK_ATTRS = array(
		'core/block'              => array(
			array( 'attr' => 'ref' ),
		),
		'core/navigation'         => array(
			array( 'attr' => 'ref' ),
		),
		'core/navigation-link'    => array(
			array(
				'attr'     => 'id',
				'gated_by' => array( 'kind' => 'post-type' ),
				'url_attr' => 'url',
			),
		),
		'core/navigation-submenu' => array(
			array(
				'attr'     => 'id',
				'gated_by' => array( 'kind' => 'post-type' ),
				'url_attr' => 'url',
			),
		),
	);

	/**
	 * Block-name => list of term-ID attrs; same shape as POST_ID_BLOCK_ATTRS.
	 *
	 * @var array<string, list<array{attr:string, gated_by?: array<string,string>, url_attr?: string}>>
	 */
	private const TERM_ID_BLOCK_ATTRS = array(
		'core/navigation-link'    => array(
			array(
				'attr'     => 'id',
				'gated_by' => array( 'kind' => 'taxonomy' ),
				'url_attr' => 'url',
			),
		),
		'core/navigation-submenu' => array(
			array(
				'attr'     => 'id',
				'gated_by' => array( 'kind' => 'taxonomy' ),
				'url_attr' => 'url',
			),
		),
	);

	/**
	 * Media Importer instance.
	 *
	 * @var Media_Importer
	 */
	private Media_Importer $media_importer;

	/**
	 * Content Media Processor instance.
	 *
	 * @var Content_Media_Processor
	 */
	private Content_Media_Processor $content_media_processor;

	/**
	 * Shortcode ID Rewriter instance.
	 *
	 * @var Shortcode_ID_Rewriter
	 */
	private Shortcode_ID_Rewriter $shortcode_id_rewriter;

	/**
	 * Shortcode Media Rewriter instance.
	 *
	 * @var Shortcode_Media_Rewriter
	 */
	private Shortcode_Media_Rewriter $shortcode_media_rewriter;

	/**
	 * Media files that failed to import, keyed by source URL.
	 *
	 * @var array<string, string> URL => originating block name.
	 */
	private array $failed_media = array();

	/**
	 * Media URLs that could not be processed, typically due to malformed HTML,
	 * keyed by source URL.
	 *
	 * @var array<string, string> URL => originating block name.
	 */
	private array $unprocessable_media = array();

	/**
	 * Warnings raised during the current run (e.g. unmapped block IDs).
	 *
	 * @var array<array<string, mixed>>
	 */
	private array $warnings = array();

	/**
	 * Constructs the Content_Processor instance.
	 *
	 * @param Media_Importer                $media_importer           Media importer.
	 * @param Content_Media_Processor       $content_media_processor  Content media processor.
	 * @param Shortcode_ID_Rewriter         $shortcode_id_rewriter    Shortcode ID rewriter.
	 * @param Shortcode_Media_Rewriter|null $shortcode_media_rewriter Rewriter, or null.
	 */
	public function __construct(
		Media_Importer $media_importer,
		Content_Media_Processor $content_media_processor,
		Shortcode_ID_Rewriter $shortcode_id_rewriter,
		?Shortcode_Media_Rewriter $shortcode_media_rewriter = null
	) {
		$this->media_importer           = $media_importer;
		$this->content_media_processor  = $content_media_processor;
		$this->shortcode_id_rewriter    = $shortcode_id_rewriter;
		$this->shortcode_media_rewriter = $shortcode_media_rewriter
			?? self::default_shortcode_media_rewriter( $media_importer );
	}

	/**
	 * Builds the shortcode media rewriter used when none is injected.
	 *
	 * @param Media_Importer $media_importer Importer the rewriter delegates to.
	 * @return Shortcode_Media_Rewriter
	 */
	private static function default_shortcode_media_rewriter(
		Media_Importer $media_importer
	): Shortcode_Media_Rewriter {
		return new Shortcode_Media_Rewriter(
			static fn ( string $url, string $source_site_url ): string|false|null =>
				$media_importer->import_source_media( $url, $source_site_url )
		);
	}

	/**
	 * Processes post content by importing media and replacing URLs.
	 *
	 * Detects whether content uses Gutenberg blocks and applies the appropriate
	 * processing strategy. Replaces source URLs in the content after processing.
	 *
	 * @param string               $content         Post content to process.
	 * @param string               $source_site_url Source site URL.
	 * @param array<string, mixed> $context         Optional batch state. Recognized keys:
	 *                                              `session_id_map` (bulk source => dest post IDs),
	 *                                              `library_metadata_map` (source URL => library
	 *                                              metadata), `attached_media` (bare gallery/playlist
	 *                                              attached-media set), `source_post_id` (importing
	 *                                              post's source ID, for the gallery id self check),
	 *                                              and `auth_credentials` (source REST auth for
	 *                                              shortcode ID resolution).
	 * @return string|WP_Error Processed content, or WP_Error on failure.
	 */
	public function process_content(
		string $content,
		string $source_site_url,
		array $context = array()
	): string|WP_Error {
		$this->failed_media        = array();
		$this->unprocessable_media = array();
		$this->warnings            = array();
		$this->media_importer->reset_newly_created_attachment_ids();

		$session_id_map = isset( $context['session_id_map'] )
			&& is_array( $context['session_id_map'] )
			? $context['session_id_map']
			: array();

		$this->media_importer->set_library_metadata_map(
			isset( $context['library_metadata_map'] )
				&& is_array( $context['library_metadata_map'] )
				? $context['library_metadata_map']
				: array()
		);

		if ( $this->is_gutenberg_content( $content ) ) {
			$processed_content = $this->process_gutenberg_blocks(
				$content,
				$source_site_url,
				$session_id_map
			);
		} else {
			$processed_content = $this->content_media_processor->process_content(
				$content,
				$source_site_url,
				''
			);
		}

		// Rewrite caption-family shortcode IDs after URL rewriting so the
		// embedded img src points at the dest attachment for lookup.
		$processed_content = $this->shortcode_id_rewriter->rewrite_caption_ids( $processed_content );

		// Rewrite gallery/playlist shortcode IDs, which the media pass can't
		// reach: Bare source attachment IDs with no URL to sideload from.
		$processed_content = $this->rewrite_media_shortcode_ids(
			$processed_content,
			$source_site_url,
			$context
		);

		// Collect cross-post gallery/playlist references before the id remap
		// rewrites their source ids to destination ids.
		$referenced = $this->shortcode_id_rewriter->collect_cross_post_references(
			$processed_content,
			isset( $context['source_post_id'] ) ? (int) $context['source_post_id'] : 0
		);

		// Remap or strip the singular gallery/playlist `id` post reference.
		$processed_content = $this->rewrite_gallery_post_references(
			$processed_content,
			$source_site_url,
			$context
		);

		// Pull each referenced post's rendered set so the remapped shortcode
		// fills on the destination.
		$this->import_referenced_media_sets(
			$referenced,
			$source_site_url,
			$context
		);

		// Import the bare [gallery]/[playlist] attached set (no rewrite).
		$this->import_attached_media_set( $context, $source_site_url );

		// Import [audio]/[video] shortcode media before replace_source_urls(),
		// so download failures are recorded rather than masked by the swap.
		$processed_content = $this->shortcode_media_rewriter->rewrite_shortcode_media(
			$processed_content,
			$source_site_url
		);

		// Merge failures from content_media_processor (used in both the
		// Gutenberg and non-Gutenberg paths).
		$this->failed_media = self::merge_media_map(
			$this->failed_media,
			$this->content_media_processor->get_failed_media()
		);

		$this->failed_media = self::merge_media_map(
			$this->failed_media,
			$this->shortcode_media_rewriter->get_failed_media()
		);

		$this->unprocessable_media = self::merge_media_map(
			$this->unprocessable_media,
			$this->content_media_processor->get_unprocessable_media()
		);

		// The per-block markup pass can't see block-level download failures.
		$this->unprocessable_media = array_diff_key(
			$this->unprocessable_media,
			$this->failed_media
		);

		$this->content_media_processor->reset_failed_media();
		$this->content_media_processor->reset_unprocessable_media();
		$this->shortcode_media_rewriter->reset_failed_media();

		return $this->replace_source_urls( $processed_content, $source_site_url );
	}

	/**
	 * Rewrites gallery/playlist shortcode attachment IDs to their destination
	 * IDs, sideloading the referenced source media by ID.
	 *
	 * A source ID that cannot be resolved (deleted on the source, or private
	 * without auth) is left in place and recorded as an unmapped-reference
	 * warning. A resolved URL that fails to download is recorded as a media
	 * failure so the import aborts, consistent with every other failed
	 * sideload.
	 *
	 * @param string               $content         Processed post content.
	 * @param string               $source_site_url Source site URL.
	 * @param array<string, mixed> $context         process_content() context;
	 *                                              reads `auth_credentials`.
	 * @return string Content with shortcode IDs rewritten.
	 */
	private function rewrite_media_shortcode_ids(
		string $content,
		string $source_site_url,
		array $context
	): string {
		$auth = isset( $context['auth_credentials'] )
			&& is_array( $context['auth_credentials'] )
			? $context['auth_credentials']
			: array();

		$resolver = function ( int $source_id ) use ( $source_site_url, $auth ): int {
			$dest_id = $this->media_importer->import_source_media_by_id(
				$source_id,
				$source_site_url,
				$auth
			);

			if ( null === $dest_id ) {
				$this->warnings[] = array(
					'type'      => 'unmapped_shortcode_reference',
					'source_id' => $source_id,
				);

				return 0;
			}

			if ( false === $dest_id ) {
				$key                        = sprintf(
					'gallery/playlist shortcode attachment ID %d',
					$source_id
				);
				$this->failed_media[ $key ] = '';

				return 0;
			}

			return $dest_id;
		};

		return $this->shortcode_id_rewriter->rewrite_media_shortcode_ids(
			$content,
			$resolver
		);
	}

	/**
	 * Remaps the singular gallery/playlist `id` post reference to its
	 * destination, or strips it when it names the importing post's own set.
	 *
	 * The reference is resolved like a block reference: The in-batch session
	 * map first, then a source-scoped lookup for a post imported in an earlier
	 * session. An unresolved reference is left in place and recorded as a
	 * retryable warning so a later retry can remap it.
	 *
	 * @param string               $content         Processed post content.
	 * @param string               $source_site_url Source site URL.
	 * @param array<string, mixed> $context         process_content() context; reads
	 *                                              `session_id_map` and `source_post_id`.
	 * @return string Content with the singular id reference rewritten.
	 */
	private function rewrite_gallery_post_references(
		string $content,
		string $source_site_url,
		array $context
	): string {
		$session_id_map = isset( $context['session_id_map'] )
			&& is_array( $context['session_id_map'] )
			? $context['session_id_map']
			: array();

		$self_source_id = isset( $context['source_post_id'] )
			? (int) $context['source_post_id']
			: 0;

		$lookup_site_url = URL_Validator::normalize_site_url_with_path(
			$source_site_url
		);

		$resolver = function ( int $source_id ) use (
			$session_id_map,
			$lookup_site_url
		): int {
			$dest_id = $this->resolve_gallery_post_reference(
				$source_id,
				$session_id_map,
				$lookup_site_url
			);

			if ( 0 === $dest_id ) {
				$this->warnings[] = array(
					'type'      => 'unmapped_gallery_reference',
					'source_id' => $source_id,
				);
			}

			return $dest_id;
		};

		return $this->shortcode_id_rewriter->rewrite_gallery_post_reference(
			$content,
			$resolver,
			$self_source_id
		);
	}

	/**
	 * Resolves a cross-post gallery/playlist source id to its destination post
	 * id via the in-batch session map, then a source-scoped lookup.
	 *
	 * @param int            $source_id       Referenced source post ID.
	 * @param array<int,int> $session_id_map  In-batch source => dest post IDs.
	 * @param string         $lookup_site_url Path-bearing source identity.
	 * @return int Destination post ID, or 0 when not imported.
	 */
	private function resolve_gallery_post_reference(
		int $source_id,
		array $session_id_map,
		string $lookup_site_url
	): int {
		if ( isset( $session_id_map[ $source_id ] ) ) {
			return (int) $session_id_map[ $source_id ];
		}

		$map = $this->lookup_destination_post_ids(
			array( $source_id => true ),
			$lookup_site_url
		);

		return isset( $map[ $source_id ] ) ? (int) $map[ $source_id ] : 0;
	}

	/**
	 * Pulls the rendered set each cross-post [gallery id="B"]/[playlist id="B"]
	 * reference imports, so the remapped shortcode fills on the destination.
	 *
	 * B is resolved like the id remap; an unimported B is skipped, having
	 * already been recorded as a retryable warning by the remap. Each pulled
	 * item records its source parent, which the persist-time forward pass
	 * parents to dest-B.
	 *
	 * @param list<array{tag: string, type: string, source_id: int}> $referenced      Collected references.
	 * @param string                                                 $source_site_url Source site URL.
	 * @param array<string, mixed>                                   $context         process_content() context.
	 */
	private function import_referenced_media_sets(
		array $referenced,
		string $source_site_url,
		array $context
	): void {
		if ( array() === $referenced ) {
			return;
		}

		$session_id_map = isset( $context['session_id_map'] )
			&& is_array( $context['session_id_map'] )
			? $context['session_id_map']
			: array();

		$auth = isset( $context['auth_credentials'] )
			&& is_array( $context['auth_credentials'] )
			? $context['auth_credentials']
			: array();

		$lookup_site_url = URL_Validator::normalize_site_url_with_path(
			$source_site_url
		);

		foreach ( $referenced as $ref ) {
			$dest_id = $this->resolve_gallery_post_reference(
				$ref['source_id'],
				$session_id_map,
				$lookup_site_url
			);

			if ( 0 === $dest_id ) {
				continue;
			}

			$this->pull_referenced_set(
				$ref,
				$dest_id,
				$source_site_url,
				$auth,
				false
			);
		}
	}

	/**
	 * Sideloads a referenced post's rendered set for one shortcode, applying
	 * the source menu_order. A dangling or failed item is skipped, not fatal.
	 * $parent_to_dest parents each item to the referenced post, for the retry
	 * path that runs outside the persist-time forward pass.
	 *
	 * @param array{tag: string, type: string, source_id: int} $ref             Collected reference.
	 * @param int                                              $dest_post_id    Destination referenced post.
	 * @param string                                           $source_site_url Source site URL.
	 * @param array                                            $auth            Source REST auth credentials.
	 * @param bool                                             $parent_to_dest  Parent each item to dest.
	 */
	private function pull_referenced_set(
		array $ref,
		int $dest_post_id,
		string $source_site_url,
		array $auth,
		bool $parent_to_dest
	): void {
		$dest_post = get_post( $dest_post_id );

		if ( ! ( $dest_post instanceof WP_Post ) ) {
			return;
		}

		// Import preserves the post type slug, so B's source REST base resolves
		// from the destination post's type.
		$set = $this->media_importer->fetch_referenced_media_set(
			$ref['source_id'],
			$dest_post->post_type,
			self::reference_mime_group( $ref ),
			$source_site_url,
			$auth
		);

		foreach ( $set as $item ) {
			$dest_id = $this->media_importer->import_source_media_by_id(
				$item['id'],
				$source_site_url,
				$auth
			);

			if ( ! is_int( $dest_id ) ) {
				continue;
			}

			$this->apply_referenced_menu_order( $dest_id, $item['menu_order'] );

			if ( $parent_to_dest ) {
				$this->parent_attachment( $dest_id, $dest_post_id );
			}
		}
	}

	/**
	 * Maps a collected reference to the attachment media type its shortcode
	 * renders: image for a gallery, audio or video for a playlist. Mirrors
	 * wp_playlist_shortcode, coercing any non-audio playlist type to video.
	 *
	 * @param array{tag: string, type: string, source_id: int} $ref Collected reference.
	 * @return string Media type group: image, audio, or video.
	 */
	private static function reference_mime_group( array $ref ): string {
		if ( 'playlist' !== $ref['tag'] ) {
			return 'image';
		}

		$type = '' === $ref['type'] ? 'audio' : $ref['type'];

		return 'audio' === $type ? 'audio' : 'video';
	}

	/**
	 * Applies a pulled item's source menu_order to its destination attachment,
	 * so a dedup hit from an earlier import still renders in the referenced
	 * post's order. A direct write, made only when the order differs, so it
	 * creates no revision or timestamp churn.
	 *
	 * @param int $attachment_id Destination attachment.
	 * @param int $menu_order    Source menu_order to apply.
	 */
	private function apply_referenced_menu_order(
		int $attachment_id,
		int $menu_order
	): void {
		$attachment = get_post( $attachment_id );

		if (
			! ( $attachment instanceof WP_Post )
			|| (int) $attachment->menu_order === $menu_order
		) {
			return;
		}

		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			$wpdb->posts,
			array( 'menu_order' => $menu_order ),
			array( 'ID' => $attachment_id )
		);
		clean_post_cache( $attachment_id );
	}

	/**
	 * Parents a freshly pulled attachment to the referenced post via a direct
	 * write, so it creates no revision and no timestamp churn. Only unattached
	 * media is parented, leaving a dedup hit already parented alone.
	 *
	 * @param int $attachment_id Attachment to parent.
	 * @param int $parent_id     Destination referenced post.
	 */
	private function parent_attachment( int $attachment_id, int $parent_id ): void {
		$attachment = get_post( $attachment_id );

		if (
			! ( $attachment instanceof WP_Post )
			|| 0 !== (int) $attachment->post_parent
		) {
			return;
		}

		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			$wpdb->posts,
			array( 'post_parent' => $parent_id ),
			array( 'ID' => $attachment_id )
		);
		clean_post_cache( $attachment_id );
	}

	/**
	 * Imports the attached-media set a bare [gallery]/[playlist] renders,
	 * sideloading each item by source id. That records its source parent, which
	 * the import resolves to this post at persist time, and applies the source
	 * menu_order so the set renders in order. No content is rewritten: Once
	 * parented, core renders the shortcode from the post's children.
	 *
	 * A dangling source ref (null) or a failed sideload (false) is skipped rather
	 * than aborting the post, unlike the [gallery ids=] path; the media importer
	 * already logs a failed sideload.
	 *
	 * @param array<string, mixed> $context         process_content() context; reads
	 *                                              `attached_media` and `auth_credentials`.
	 * @param string               $source_site_url Source site URL.
	 */
	private function import_attached_media_set(
		array $context,
		string $source_site_url
	): void {
		$attached_media = isset( $context['attached_media'] )
			&& is_array( $context['attached_media'] )
			? $context['attached_media']
			: array();

		if ( array() === $attached_media ) {
			return;
		}

		$auth = isset( $context['auth_credentials'] )
			&& is_array( $context['auth_credentials'] )
			? $context['auth_credentials']
			: array();

		foreach ( $attached_media as $item ) {
			$source_id = isset( $item['id'] ) ? (int) $item['id'] : 0;

			if ( 0 === $source_id ) {
				continue;
			}

			$dest_id = $this->media_importer->import_source_media_by_id(
				$source_id,
				$source_site_url,
				$auth
			);

			if ( ! is_int( $dest_id ) ) {
				continue;
			}

			$menu_order = isset( $item['menu_order'] ) ? (int) $item['menu_order'] : 0;
			$this->media_importer->set_new_attachment_menu_order(
				$dest_id,
				$menu_order
			);
		}
	}

	/**
	 * Returns warnings collected during the most recent process_content() run.
	 *
	 * @return array<array<string, mixed>> Warnings list.
	 */
	public function get_warnings(): array {
		return $this->warnings;
	}

	/**
	 * Checks if content contains Gutenberg blocks.
	 *
	 * @param string $content Post content.
	 * @return bool True if content contains blocks.
	 */
	public function is_gutenberg_content( string $content ): bool {
		return false !== strpos( $content, '<!-- wp:' );
	}

	/**
	 * Processes Gutenberg blocks and imports media.
	 *
	 * @param string         $content         Post content with blocks.
	 * @param string         $source_site_url Source site URL.
	 * @param array<int,int> $session_id_map  Source post ID => destination post ID
	 *                                        for the in-flight bulk batch.
	 * @return string Processed content.
	 */
	private function process_gutenberg_blocks(
		string $content,
		string $source_site_url,
		array $session_id_map = array()
	): string {
		if ( empty( $content ) ) {
			return $content;
		}

		$blocks = parse_blocks( $content );

		if ( empty( $blocks ) ) {
			return $content;
		}

		$needs_media_processing = $this->content_needs_processing( $content );
		$needs_id_remap         = $this->content_has_id_reference_blocks( $blocks );

		if ( ! $needs_media_processing && ! $needs_id_remap ) {
			return $content;
		}

		if ( $needs_media_processing ) {
			$blocks = array_map(
				function ( $block ) use ( $source_site_url ) {
					return $this->process_single_block( $block, $source_site_url );
				},
				$blocks
			);
		}

		if ( $needs_id_remap ) {
			$blocks = $this->process_block_id_references(
				$blocks,
				$source_site_url,
				$session_id_map
			);
		}

		return serialize_blocks( $blocks );
	}

	/**
	 * Replaces source site URLs with current site URLs in content.
	 *
	 * Uses string replacement instead of DOM parsing to avoid altering
	 * markup (entity encoding, self-closing tags, whitespace, etc.).
	 *
	 * @param string $content         Content to process.
	 * @param string $source_site_url Source site URL (scheme://host).
	 * @return string|WP_Error Content with URLs replaced, or WP_Error on failure.
	 */
	public function replace_source_urls( string $content, string $source_site_url ): string|WP_Error {
		if ( empty( $content ) || empty( $source_site_url ) ) {
			return $content;
		}

		$current_site_url = get_site_url();
		$source_host      = wp_parse_url( $source_site_url, PHP_URL_HOST );
		$current_host     = wp_parse_url( $current_site_url, PHP_URL_HOST );

		// Skip if URLs are the same.
		if ( $source_host === $current_host ) {
			return $content;
		}

		// Skip if the source host doesn't appear in the content.
		if ( false === strpos( $content, $source_host ) ) {
			return $content;
		}

		// Match both http and https variants of the source URL so that legacy
		// http:// references are also replaced. The lookahead prevents partial
		// domain matches (e.g., "source.example.com" must not match inside
		// "source.example.company.com").
		$pattern = '/https?:\/\/' . preg_quote( $source_host, '/' )
			. '(?=[^a-zA-Z0-9.]|$)/';

		$result = preg_replace( $pattern, $current_site_url, $content );

		if ( null === $result ) {
			return new WP_Error(
				'url_replacement_failed',
				__(
					'Failed to replace source site URLs in content.',
					'safe-publish'
				)
			);
		}

		return $result;
	}

	/**
	 * Deletes all attachments created during the current processing run.
	 *
	 * Called when an import is aborted to clean up partially-downloaded
	 * attachments that would otherwise be orphaned in the media library.
	 *
	 * @return int[] IDs of attachments WordPress did not delete.
	 */
	public function delete_newly_created_media(): array {
		return $this->media_importer->delete_newly_created_attachments();
	}

	/**
	 * Returns the media files that failed to import.
	 *
	 * @return array<string, string> URL => originating block name.
	 */
	public function get_failed_media(): array {
		return $this->failed_media;
	}

	/**
	 * Returns a formatted error message if any media files failed to import, or
	 * null if there were no failures.
	 *
	 * @return string|null Error message, or null if no failures.
	 */
	public function get_failed_media_error_message(): ?string {
		if ( array() === $this->failed_media ) {
			return null;
		}

		return sprintf(
			/* translators: 1: number of failed media files, 2: comma-separated list of failed media file URLs, each optionally followed by the originating block name in parentheses */
			__( 'Import failed: %1$d media file(s) could not be downloaded: %2$s', 'safe-publish' ),
			count( $this->failed_media ),
			self::format_media_list( $this->failed_media )
		);
	}

	/**
	 * Returns media URLs that could not be processed due to malformed HTML in
	 * the source content.
	 *
	 * @return array<string, string> URL => originating block name.
	 */
	public function get_unprocessable_media(): array {
		return $this->unprocessable_media;
	}

	/**
	 * Returns a formatted error message if any media URLs could not be
	 * processed due to malformed HTML, or null if there were none.
	 *
	 * @return string|null Error message, or null.
	 */
	public function get_unprocessable_media_error_message(): ?string {
		if ( array() === $this->unprocessable_media ) {
			return null;
		}

		return sprintf(
			/* translators: 1: number of unprocessable media URLs, 2: comma-separated list of URLs, each optionally followed by the originating block name in parentheses */
			__( 'Import failed: %1$d media URL(s) could not be processed because the surrounding HTML markup is malformed (e.g. unclosed quotes). Fix the markup on the source site and retry: %2$s', 'safe-publish' ),
			count( $this->unprocessable_media ),
			self::format_media_list( $this->unprocessable_media )
		);
	}

	/**
	 * Merges a media map into a base map, keyed by URL.
	 *
	 * On a URL collision the base label wins unless it is empty, so a known
	 * originating block name is never overwritten by an empty one. Keying by
	 * URL preserves the per-URL dedup.
	 *
	 * @param array<string, string> $base     Base map, URL => block name.
	 * @param array<string, string> $incoming Map to merge in.
	 * @return array<string, string> Merged map.
	 */
	private static function merge_media_map( array $base, array $incoming ): array {
		foreach ( $incoming as $url => $block_name ) {
			$existing = $base[ $url ] ?? '';
			if ( '' === $existing ) {
				$base[ $url ] = $block_name;
			}
		}

		return $base;
	}

	/**
	 * Formats a media map as a comma-separated list. Each URL is followed by its
	 * originating block name in parentheses, or left bare when the name is empty.
	 *
	 * @param array<string, string> $media_map Map of URL => block name.
	 * @return string Comma-separated list of media entries.
	 */
	private static function format_media_list( array $media_map ): string {
		$entries = array();

		foreach ( $media_map as $url => $block_name ) {
			$entries[] = '' === $block_name
				? $url
				: sprintf( '%s (%s)', $url, $block_name );
		}

		return implode( ', ', $entries );
	}

	/**
	 * Processes a single Gutenberg block, descending into any inner blocks.
	 *
	 * @param array  $block           Block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_single_block( array $block, string $source_site_url ): array {
		// Top-level classic HTML parses to a null block name; core/freeform is
		// its delimited equivalent.
		if (
			null === $block['blockName']
			|| 'core/freeform' === $block['blockName']
		) {
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		switch ( $block['blockName'] ) {
			case 'core/image':
				$block = $this->process_image_block( $block, $source_site_url );
				break;

			case 'core/gallery':
				$block = $this->process_gallery_block( $block, $source_site_url );
				break;

			case 'core/video':
			case 'core/audio':
				$block = $this->process_media_block(
					$block,
					$source_site_url,
					self::string_attr( $block, 'src' ),
					'src',
					'id'
				);
				break;

			case 'core/cover':
				$block = $this->process_media_block(
					$block,
					$source_site_url,
					self::string_attr( $block, 'url' ),
					'url',
					'id'
				);
				break;

			case 'core/file':
				$block = $this->process_media_block(
					$block,
					$source_site_url,
					self::string_attr( $block, 'href' ),
					'href',
					'id'
				);
				break;

			case 'core/media-text':
				$block = $this->process_media_block(
					$block,
					$source_site_url,
					$this->extract_media_text_src( $block ),
					null,
					'mediaId'
				);
				break;

			case 'core/embed':
			case 'core-embed/youtube':
			case 'core-embed/vimeo':
			case 'core-embed/twitter':
			case 'core-embed/instagram':
			case 'core/paragraph':
			case 'core/heading':
			case 'core/list':
			case 'core/quote':
				// These blocks carry media only in their inner content.
				$block = $this->process_block_inner_html(
					$block,
					$source_site_url
				);
				break;

			case 'core/html':
				$block = $this->process_html_block( $block, $source_site_url );
				break;

			default:
				// Process URL values in block attrs for custom/third-party
				// blocks, then the inner markup for media/links. Skip
				// blocks whose URL attrs are page/term links (handled by
				// process_block_id_references) — sideloading them as media
				// would download HTML and abort the import on a false failure.
				if (
					isset( $block['attrs'] ) && array() !== $block['attrs']
					&& ! isset( self::POST_ID_BLOCK_ATTRS[ $block['blockName'] ] )
					&& ! isset( self::TERM_ID_BLOCK_ATTRS[ $block['blockName'] ] )
				) {
					$block['attrs'] = $this->replace_urls_in_attrs(
						$block['attrs'],
						$source_site_url,
						$block
					);
				}

				$block = $this->process_block_inner_html(
					$block,
					$source_site_url
				);
				break;
		}

		// Descend into container blocks so nested media is imported. Gallery
		// walks its own inner blocks above.
		if ( 'core/gallery' !== $block['blockName'] ) {
			$block = $this->process_inner_blocks( $block, $source_site_url );
		}

		return $block;
	}

	/**
	 * Routes a container's inner blocks back through process_single_block() so
	 * media nested at any depth is imported.
	 *
	 * @param array  $block           Block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Block with processed inner blocks.
	 */
	private function process_inner_blocks( array $block, string $source_site_url ): array {
		if (
			! isset( $block['innerBlocks'] )
			|| ! is_array( $block['innerBlocks'] )
			|| array() === $block['innerBlocks']
		) {
			return $block;
		}

		foreach ( $block['innerBlocks'] as $index => $inner_block ) {
			$block['innerBlocks'][ $index ] = $this->process_single_block(
				$inner_block,
				$source_site_url
			);
		}

		return $block;
	}

	/**
	 * Processes image block to import media and update block attributes.
	 *
	 * @param array  $block           Image block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_image_block( array $block, string $source_site_url ): array {
		$original_url = '';

		// First try to get URL from block attributes.
		if ( ! empty( $block['attrs']['url'] ) ) {
			$original_url = $block['attrs']['url'];
		} elseif ( ! empty( $block['innerHTML'] ) ) {
			// Extract URL from innerHTML img src attribute.
			$original_url = $this->extract_img_src_from_html( $block['innerHTML'] );
		}

		if ( empty( $original_url ) ) {
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		$attachment_id = $this->media_importer->import_source_media_as_attachment(
			$original_url,
			$source_site_url
		);

		if ( null === $attachment_id ) {
			// Third-party src — leave attrs unchanged but still process
			// innerHTML so any source-domain anchor hrefs get sideloaded.
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		if ( false === $attachment_id ) {
			$this->failed_media[ $original_url ] = $block['blockName'];
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		$new_url = wp_get_attachment_url( $attachment_id );

		if ( false === $new_url ) {
			$this->failed_media[ $original_url ] = $block['blockName'];
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		// Initialize attrs if it doesn't exist.
		if ( ! isset( $block['attrs'] ) ) {
			$block['attrs'] = array();
		}

		// Update block attributes with local URL and attachment ID.
		$block['attrs']['url'] = $new_url;
		$block['attrs']['id']  = $attachment_id;

		// Also update other common image attributes that might reference the URL.
		if ( isset( $block['attrs']['src'] ) ) {
			$block['attrs']['src'] = $new_url;
		}

		$url_with_parameters = Media_Importer::reapply_query_parameters( $original_url, $new_url );

		// Update innerHTML with the appropriate URL for correct rendering.
		if ( ! empty( $block['innerHTML'] ) ) {
			$updated_html       = $this->update_img_src_in_html( $block['innerHTML'], $original_url, $url_with_parameters );
			$updated_html       = $this->update_wp_image_class( $updated_html, $attachment_id );
			$block['innerHTML'] = $updated_html;
		}

		// Update innerContent array if it exists (used by serialize_blocks).
		if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
			foreach ( $block['innerContent'] as $index => $content ) {
				if ( is_string( $content ) ) {
					$updated_content                 = $this->update_img_src_in_html( $content, $original_url, $url_with_parameters );
					$updated_content                 = $this->update_wp_image_class( $updated_content, $attachment_id );
					$block['innerContent'][ $index ] = $updated_content;
				}
			}
		}

		return $this->process_block_inner_html( $block, $source_site_url );
	}

	/**
	 * Processes gallery block to import media from all contained images.
	 *
	 * @param array  $block           Gallery block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_gallery_block( array $block, string $source_site_url ): array {
		// Handle traditional gallery format with images in attributes.
		if ( ! empty( $block['attrs']['images'] ) && is_array( $block['attrs']['images'] ) ) {
			foreach ( $block['attrs']['images'] as $index => $image ) {
				if ( empty( $image['url'] ) ) {
					continue;
				}

				$original_url  = $image['url'];
				$attachment_id = $this->media_importer->import_source_media_as_attachment(
					$original_url,
					$source_site_url
				);

				if ( null === $attachment_id ) {
					continue; // Third-party src — skip this image's attrs.
				}

				if ( false === $attachment_id ) {
					$this->failed_media[ $original_url ] = $block['blockName'];
					continue;
				}

				$new_url = wp_get_attachment_url( $attachment_id );

				if ( false === $new_url ) {
					$this->failed_media[ $original_url ] = $block['blockName'];
					continue;
				}

				// Update block attributes.
				$block['attrs']['images'][ $index ]['url'] = $new_url;
				$block['attrs']['images'][ $index ]['id']  = $attachment_id;

				$url_with_parameters = Media_Importer::reapply_query_parameters( $original_url, $new_url );

				// Update innerHTML with the appropriate URL for correct rendering.
				if ( ! empty( $block['innerHTML'] ) ) {
					$updated_html       = $this->update_img_src_in_html( $block['innerHTML'], $original_url, $url_with_parameters );
					$updated_html       = $this->update_wp_image_class( $updated_html, $attachment_id );
					$block['innerHTML'] = $updated_html;
				}

				// Update innerContent array if it exists (used by serialize_blocks).
				if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
					foreach ( $block['innerContent'] as $content_index => $content ) {
						if ( is_string( $content ) ) {
							$updated_content                         = $this->update_img_src_in_html( $content, $original_url, $url_with_parameters );
							$updated_content                         = $this->update_wp_image_class( $updated_content, $attachment_id );
							$block['innerContent'][ $content_index ] = $updated_content;
						}
					}
				}
			}
		}

		// Handle block-based gallery format with innerBlocks containing image blocks.
		if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
			foreach ( $block['innerBlocks'] as $index => $inner_block ) {
				if ( ! empty( $inner_block['blockName'] ) && 'core/image' === $inner_block['blockName'] ) {
					$block['innerBlocks'][ $index ] = $this->process_image_block( $inner_block, $source_site_url );
				} else {
					$block['innerBlocks'][ $index ] = $this->process_single_block( $inner_block, $source_site_url );
				}
			}

			// Update innerContent array to reflect any changes in innerBlocks.
			if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
				$new_inner_content = array();
				$inner_block_index = 0;

				foreach ( $block['innerContent'] as $content ) {
					if ( is_null( $content ) ) {
						// null values represent positions where inner blocks should be inserted.
						if ( isset( $block['innerBlocks'][ $inner_block_index ] ) ) {
							$new_inner_content[] = null; // Keep the null placeholder.
							++$inner_block_index;
						}
					} else {
						// String content remains as is.
						$new_inner_content[] = $content;
					}
				}

				$block['innerContent'] = $new_inner_content;
			}
		}

		return $this->process_block_inner_html( $block, $source_site_url );
	}

	/**
	 * Imports a block's source media and points its attachment-id attr at the
	 * new destination attachment.
	 *
	 * The media URL is resolved by the caller because its location varies: It is
	 * a block attr for most blocks (src, url, href) but is sourced from innerHTML
	 * for core/media-text, whose mediaUrl attr is not stored in the block. A
	 * third-party (null) or failed (false) import leaves the attrs untouched.
	 *
	 * @param array       $block           Block data.
	 * @param string      $source_site_url Source site URL.
	 * @param string      $media_url       Source media URL to import.
	 * @param string|null $url_attr        Attr to set to the local URL, or null
	 *                                     when the block stores no URL attr.
	 * @param string      $id_attr         Attr to set to the attachment ID.
	 * @return array Processed block.
	 */
	private function process_media_block(
		array $block,
		string $source_site_url,
		string $media_url,
		?string $url_attr,
		string $id_attr
	): array {
		if ( '' === $media_url ) {
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		$attachment_id = $this->media_importer->import_source_media_as_attachment(
			$media_url,
			$source_site_url
		);

		if ( null === $attachment_id ) {
			// Third-party media — leave attrs unchanged but still process
			// innerHTML so any source-domain anchor hrefs get sideloaded.
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		if ( false === $attachment_id ) {
			$this->failed_media[ $media_url ] = $block['blockName'];
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		$new_url = wp_get_attachment_url( $attachment_id );

		if ( false === $new_url ) {
			$this->failed_media[ $media_url ] = $block['blockName'];
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		if ( null !== $url_attr ) {
			$block['attrs'][ $url_attr ] = $new_url;
		}
		$block['attrs'][ $id_attr ] = $attachment_id;

		$url_with_parameters = Media_Importer::reapply_query_parameters(
			$media_url,
			$new_url
		);

		if ( ! empty( $block['innerHTML'] ) ) {
			$block['innerHTML'] = str_replace(
				$media_url,
				$url_with_parameters,
				$block['innerHTML']
			);
		}

		if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
			foreach ( $block['innerContent'] as $index => $content ) {
				if ( is_string( $content ) ) {
					$block['innerContent'][ $index ] = str_replace(
						$media_url,
						$url_with_parameters,
						$content
					);
				}
			}
		}

		return $this->process_block_inner_html( $block, $source_site_url );
	}

	/**
	 * Returns a core/media-text block's media src, read from the first img or
	 * video in its innerHTML. The block stores mediaUrl as an HTML-sourced attr,
	 * so it is absent from the parsed block attrs.
	 *
	 * @param array $block Block data.
	 * @return string Media src, or '' when none is present.
	 */
	private function extract_media_text_src( array $block ): string {
		$html = $block['innerHTML'] ?? '';
		if ( ! is_string( $html ) || '' === $html ) {
			return '';
		}

		$processor = new WP_HTML_Tag_Processor( $html );
		while ( $processor->next_tag() ) {
			if ( ! in_array( $processor->get_tag(), array( 'IMG', 'VIDEO' ), true ) ) {
				continue;
			}

			$src = $processor->get_attribute( 'src' );
			if ( is_string( $src ) && '' !== $src ) {
				return $src;
			}
		}

		return '';
	}

	/**
	 * Returns a block attr as a string, or '' when absent or not a string.
	 *
	 * @param array  $block Block data.
	 * @param string $attr  Attr name.
	 * @return string Attr value, or ''.
	 */
	private static function string_attr( array $block, string $attr ): string {
		$value = $block['attrs'][ $attr ] ?? '';
		return is_string( $value ) ? $value : '';
	}

	/**
	 * Processes HTML block to import media.
	 *
	 * @param array  $block           HTML block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_html_block( array $block, string $source_site_url ): array {
		if ( ! empty( $block['attrs']['content'] ) ) {
			$block['attrs']['content'] = $this->content_media_processor->process_content(
				$block['attrs']['content'],
				$source_site_url,
				$block['blockName']
			);
		}

		return $this->process_block_inner_html( $block, $source_site_url );
	}

	/**
	 * Rewrites media and file links in a block's innerHTML and innerContent.
	 *
	 * Both are processed because serialize_blocks() rebuilds the body from
	 * innerContent, so an innerHTML-only rewrite would be discarded.
	 *
	 * @param array  $block           Block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Block with processed HTML.
	 */
	private function process_block_inner_html( array $block, string $source_site_url ): array {
		// Classic/freeform blocks have a null name; default the label to ''.
		$block_name = $block['blockName'] ?? '';

		if ( ! empty( $block['innerHTML'] ) ) {
			$block['innerHTML'] = $this->content_media_processor->process_content(
				$block['innerHTML'],
				$source_site_url,
				$block_name
			);
		}

		if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
			foreach ( $block['innerContent'] as $index => $content ) {
				if ( is_string( $content ) ) {
					$block['innerContent'][ $index ] = $this->content_media_processor->process_content(
						$content,
						$source_site_url,
						$block_name
					);
				}
			}
		}

		return $block;
	}

	/**
	 * Extracts image src attribute from HTML content.
	 *
	 * @param string $html HTML content.
	 * @return string Extracted src URL or empty string if not found.
	 */
	private function extract_img_src_from_html( string $html ): string {
		if ( empty( $html ) ) {
			return '';
		}

		// Use DOMDocument for safe HTML parsing.
		$dom = new \DOMDocument();

		// Suppress errors for malformed HTML and use UTF-8 encoding.
		$previous_use_errors = libxml_use_internal_errors( true );
		$dom->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		libxml_use_internal_errors( $previous_use_errors );

		$images = $dom->getElementsByTagName( 'img' );

		if ( $images->length > 0 ) {
			$img = $images->item( 0 ); // Get the first image.
			if ( $img instanceof \DOMElement ) {
				$src = $img->getAttribute( 'src' );

				if ( ! empty( $src ) ) {
					return trim( $src );
				}
			}
		}

		// Fallback to regex if DOMDocument fails.
		if ( preg_match( '/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', $html, $matches ) ) {
			return trim( $matches[1] );
		}

		return '';
	}

	/**
	 * Updates image src attribute in HTML content.
	 *
	 * @param string $html    HTML content.
	 * @param string $old_url Old image URL to replace.
	 * @param string $new_url New image URL.
	 * @return ?string Updated HTML content.
	 */
	private function update_img_src_in_html( string $html, string $old_url, string $new_url ): ?string {
		if ( empty( $html ) || empty( $old_url ) || empty( $new_url ) ) {
			return $html;
		}

		// Use a targeted regex to replace only the src attribute value.
		$pattern     = '/(<img[^>]+src=["\'])' . preg_quote( $old_url, '/' ) . '(["\'][^>]*>)/i';
		$replacement = '${1}' . $new_url . '${2}';

		$updated_html = preg_replace( $pattern, $replacement, $html );

		if ( null !== $updated_html && $updated_html !== $html ) {
			return $updated_html;
		}

		// Fallback to simple string replacement.
		return str_replace( $old_url, $new_url, $html );
	}

	/**
	 * Updates wp-image class with new attachment ID.
	 *
	 * @param string $html              HTML content.
	 * @param int    $new_attachment_id New attachment ID.
	 * @return string Updated HTML content.
	 */
	private function update_wp_image_class( string $html, int $new_attachment_id ): string {
		if ( empty( $html ) || empty( $new_attachment_id ) ) {
			return $html;
		}

		// Pattern to match wp-image-{number} class.
		$pattern     = '/wp-image-\d+/';
		$replacement = 'wp-image-' . $new_attachment_id;

		$updated_html = preg_replace( $pattern, $replacement, $html );

		// If no existing wp-image class found, add it to the img tag.
		if ( $updated_html === $html && strpos( $html, '<img' ) !== false ) {
			// Add wp-image class to img tag that doesn't have one.
			$pattern      = '/(<img[^>]+class=["\'])([^"\']*?)(["\'][^>]*>)/i';
			$replacement  = '${1}${2} wp-image-' . $new_attachment_id . '${3}';
			$updated_html = preg_replace( $pattern, $replacement, $html );

			// If img tag has no class attribute at all, add one.
			if ( $updated_html === $html ) {
				$pattern      = '/(<img[^>]+)(\s*\/?>)/i';
				$replacement  = '${1} class="wp-image-' . $new_attachment_id . '"${2}';
				$updated_html = preg_replace( $pattern, $replacement, $html );
			}
		}

		return $updated_html ? $updated_html : $html;
	}

	/**
	 * Recursively replaces source-domain media URLs in block attrs.
	 *
	 * Walks all string values in $attrs. For each value that is a valid URL
	 * on the source domain, the URL is sideloaded and replaced with the local
	 * attachment URL. Matching occurrences in $block['innerHTML'] and
	 * $block['innerContent'] are also updated so they stay consistent.
	 *
	 * @param array  $attrs           Attributes array to walk (possibly nested).
	 * @param string $source_site_url Source site URL.
	 * @param array  $block           Block data; updated by reference for
	 *                                innerHTML and innerContent.
	 * @return array Updated attributes array.
	 */
	private function replace_urls_in_attrs(
		array $attrs,
		string $source_site_url,
		array &$block
	): array {
		foreach ( $attrs as $key => $value ) {
			if ( is_array( $value ) ) {
				$attrs[ $key ] = $this->replace_urls_in_attrs(
					$value,
					$source_site_url,
					$block
				);
			} elseif (
				is_string( $value ) &&
				filter_var( $value, FILTER_VALIDATE_URL ) &&
				$this->content_media_processor
					->has_uploadable_file_extension( $value )
			) {
				// Only sideload attrs that look like a media file. A media-looking
				// URL that downloads to a page (e.g. a .pdf permalink serving
				// HTML) is left as a link rather than recorded as a failure.
				$attachment_id = $this->media_importer
					->import_source_media_as_attachment( $value, $source_site_url, true );

				if ( null === $attachment_id ) {
					continue; // Third-party, non-source, or not media — leave unchanged.
				}

				if ( false === $attachment_id ) {
					$this->failed_media[ $value ] = $block['blockName'];
					continue;
				}

				$new_url = wp_get_attachment_url( $attachment_id );

				if ( false === $new_url ) {
					$this->failed_media[ $value ] = $block['blockName'];
					continue;
				}

				$attrs[ $key ] = $new_url;

				if ( isset( $block['innerHTML'] ) && '' !== $block['innerHTML'] ) {
					$block['innerHTML'] = str_replace(
						$value,
						$new_url,
						$block['innerHTML']
					);
				}

				if (
					isset( $block['innerContent'] ) &&
					is_array( $block['innerContent'] ) &&
					array() !== $block['innerContent']
				) {
					foreach ( $block['innerContent'] as $idx => $content ) {
						if ( is_string( $content ) ) {
							$block['innerContent'][ $idx ] = str_replace(
								$value,
								$new_url,
								$content
							);
						}
					}
				}
			}
		}

		return $attrs;
	}

	/**
	 * Whether the content contains HTTP URLs, the trigger for the media/URL
	 * transformation. Only that pass depends on this check; block-ID remapping
	 * is gated separately by content_has_id_reference_blocks().
	 *
	 * @param string $content Content to check.
	 * @return bool True when the content contains an HTTP URL.
	 */
	private function content_needs_processing( string $content ): bool {
		return false !== strpos( $content, 'http' );
	}

	/**
	 * True when the block tree contains any block name registered for
	 * post- or term-ID remapping.
	 *
	 * @param array<array<string, mixed>> $blocks Parsed block tree.
	 * @return bool
	 */
	private function content_has_id_reference_blocks( array $blocks ): bool {
		foreach ( $blocks as $block ) {
			$name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			if ( '' !== $name && (
				isset( self::POST_ID_BLOCK_ATTRS[ $name ] )
				|| isset( self::TERM_ID_BLOCK_ATTRS[ $name ] )
			) ) {
				return true;
			}

			if (
				isset( $block['innerBlocks'] )
				&& is_array( $block['innerBlocks'] )
				&& array() !== $block['innerBlocks']
				&& $this->content_has_id_reference_blocks( $block['innerBlocks'] )
			) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Rewrites post-/term-ID block attrs from source to destination IDs.
	 *
	 * Two-pass: Collect unresolved IDs, bulk-lookup per kind, apply on a
	 * second walk. Unmapped IDs stay in place with a warning. For nav-link and
	 * submenu blocks the link url is re-derived from the resolved destination
	 * id; replace_source_urls still swaps the host for any url left untouched.
	 *
	 * @param array<array<string, mixed>> $blocks          Parsed block tree.
	 * @param string                      $source_site_url Source site URL.
	 * @param array<int,int>              $session_id_map  Source post ID => destination post ID
	 *                                                     for the in-flight bulk batch.
	 * @return array<array<string, mixed>> Mutated block tree.
	 */
	private function process_block_id_references(
		array $blocks,
		string $source_site_url,
		array $session_id_map
	): array {
		$collected = array(
			'post' => array(),
			'term' => array(),
		);
		$this->collect_id_references( $blocks, $session_id_map, $collected );

		// Path-bearing identity, matching how the source meta is stored.
		$lookup_site_url = URL_Validator::normalize_site_url_with_path(
			$source_site_url
		);

		$post_map = $this->lookup_destination_post_ids(
			$collected['post'],
			$lookup_site_url
		);
		$post_map = $session_id_map + $post_map;

		$term_map = $this->lookup_destination_term_ids(
			$collected['term'],
			$lookup_site_url
		);

		return $this->apply_id_references( $blocks, $post_map, $term_map );
	}

	/**
	 * Repoints one stale block reference in a post to its now-resolvable
	 * destination ID.
	 *
	 * Targeted counterpart to the import-time remap: It repoints only the attrs
	 * matching $target_ref and $target_kind, leaving resolved siblings
	 * untouched, and persists without a revision or post_modified bump. Link
	 * urls are re-derived alongside the ID where the block rule carries one.
	 *
	 * @param int    $affected_post_id Post holding the stale reference.
	 * @param int    $target_ref       Source id to repoint.
	 * @param string $target_kind      'post' or 'term'.
	 * @param string $source_site_url  Source identity scoping the lookup.
	 * @return Reconcile_Outcome Resolved when repointed; target_absent,
	 *                           write_failed, or unresolved otherwise.
	 */
	public function repoint_block_reference(
		int $affected_post_id,
		int $target_ref,
		string $target_kind,
		string $source_site_url
	): Reconcile_Outcome {
		if ( $target_ref <= 0 ) {
			return Reconcile_Outcome::unresolved( 'Invalid target reference.' );
		}

		$dest_id = $this->resolve_target_ref(
			$target_ref,
			$target_kind,
			$source_site_url
		);

		if ( 0 === $dest_id ) {
			return Reconcile_Outcome::target_absent(
				sprintf(
					'Target %1$s %2$d is not imported on the destination.',
					$target_kind,
					$target_ref
				)
			);
		}

		$post = get_post( $affected_post_id );

		if ( ! $post instanceof WP_Post || '' === $post->post_content ) {
			return Reconcile_Outcome::unresolved(
				'Affected post is missing or has no content.'
			);
		}

		$registry = 'term' === $target_kind
			? self::TERM_ID_BLOCK_ATTRS
			: self::POST_ID_BLOCK_ATTRS;

		$changed = false;
		$blocks  = $this->repoint_refs(
			parse_blocks( $post->post_content ),
			$registry,
			$target_kind,
			$target_ref,
			$dest_id,
			$changed
		);

		if ( ! $changed ) {
			return Reconcile_Outcome::unresolved(
				'No matching reference found in the post content.'
			);
		}

		$persisted = $this->persist_repointed_content(
			$affected_post_id,
			serialize_blocks( $blocks )
		);

		if ( ! $persisted ) {
			return Reconcile_Outcome::write_failed(
				'Failed to persist the repointed content.'
			);
		}

		clean_post_cache( $affected_post_id );
		update_post_meta( $affected_post_id, self::META_REF_REPOINTED_AT, time() );

		return Reconcile_Outcome::resolved();
	}

	/**
	 * Repoints one stale gallery/playlist `id` post reference to its now-
	 * resolvable destination, rewriting the persisted content in place.
	 *
	 * Targeted counterpart to the import-time remap: It rewrites only the `id`
	 * matching $target_ref and persists without a revision or post_modified
	 * bump.
	 *
	 * @param int    $affected_post_id Post holding the stale reference.
	 * @param int    $target_ref       Source post ID to repoint.
	 * @param string $source_site_url  Source identity scoping the lookup.
	 * @return Reconcile_Outcome Resolved when repointed; target_absent,
	 *                           write_failed, or unresolved otherwise.
	 */
	public function repoint_gallery_reference(
		int $affected_post_id,
		int $target_ref,
		string $source_site_url
	): Reconcile_Outcome {
		if ( $target_ref <= 0 ) {
			return Reconcile_Outcome::unresolved( 'Invalid target reference.' );
		}

		$dest_id = $this->resolve_target_ref(
			$target_ref,
			'post',
			$source_site_url
		);

		if ( 0 === $dest_id ) {
			return Reconcile_Outcome::target_absent(
				sprintf(
					'Target post %d is not imported on the destination.',
					$target_ref
				)
			);
		}

		$post = get_post( $affected_post_id );

		if ( ! $post instanceof WP_Post || '' === $post->post_content ) {
			return Reconcile_Outcome::unresolved(
				'Affected post is missing or has no content.'
			);
		}

		// Resolve only the target ref (self=0, so nothing is stripped). The
		// matched flag — not a text diff — drives resolution, so a dest id
		// equal to the source id still resolves.
		$matched  = false;
		$resolver = static function ( int $source_id ) use ( $target_ref, $dest_id, &$matched ): int {
			if ( $source_id !== $target_ref ) {
				return 0;
			}

			$matched = true;
			return $dest_id;
		};

		$new_content = $this->shortcode_id_rewriter->rewrite_gallery_post_reference(
			$post->post_content,
			$resolver,
			0
		);

		if ( ! $matched ) {
			return Reconcile_Outcome::unresolved(
				'No matching reference found in the post content.'
			);
		}

		// B is now imported; pull the set the reference renders and parent it
		// to dest-B.
		$this->pull_referenced_sets_for_retry(
			$post->post_content,
			$target_ref,
			$dest_id,
			$source_site_url
		);

		// Ref already correct (dest id equals the source id): Nothing to persist.
		if ( $new_content === $post->post_content ) {
			return Reconcile_Outcome::resolved();
		}

		if ( ! $this->persist_repointed_content( $affected_post_id, $new_content ) ) {
			return Reconcile_Outcome::write_failed(
				'Failed to persist the repointed content.'
			);
		}

		clean_post_cache( $affected_post_id );
		update_post_meta(
			$affected_post_id,
			self::META_GALLERY_REF_REPOINTED_AT,
			time()
		);

		return Reconcile_Outcome::resolved();
	}

	/**
	 * Pulls and parents the rendered set for every reference to a now-imported
	 * post, for the retry. Auth is read directly, since the retry runs outside
	 * an import session's threaded context.
	 *
	 * @param string $content         Affected post content, before the repoint.
	 * @param int    $target_ref      Source post ID being repointed.
	 * @param int    $dest_post_id    Its destination post ID.
	 * @param string $source_site_url Source site URL.
	 */
	private function pull_referenced_sets_for_retry(
		string $content,
		int $target_ref,
		int $dest_post_id,
		string $source_site_url
	): void {
		$auth = Auth_Credential_Provider::get_credentials();

		$references = $this->shortcode_id_rewriter->collect_cross_post_references(
			$content,
			0
		);

		foreach ( $references as $ref ) {
			if ( $ref['source_id'] !== $target_ref ) {
				continue;
			}

			$this->pull_referenced_set(
				$ref,
				$dest_post_id,
				$source_site_url,
				$auth,
				true
			);
		}
	}

	/**
	 * Resolves a source ref to its destination ID via the same source-scoped
	 * lookups the import uses.
	 *
	 * @param int    $target_ref      Source id.
	 * @param string $target_kind     'post' or 'term'.
	 * @param string $source_site_url Source identity to scope by.
	 * @return int Destination ID, or 0 when it does not resolve.
	 */
	private function resolve_target_ref(
		int $target_ref,
		string $target_kind,
		string $source_site_url
	): int {
		$lookup_site_url = URL_Validator::normalize_site_url_with_path(
			$source_site_url
		);
		$source_ids      = array( $target_ref => true );

		$map = 'term' === $target_kind
			? $this->lookup_destination_term_ids( $source_ids, $lookup_site_url )
			: $this->lookup_destination_post_ids( $source_ids, $lookup_site_url );

		return isset( $map[ $target_ref ] ) ? (int) $map[ $target_ref ] : 0;
	}

	/**
	 * Resolves source refs to destination ids, one batch per kind, via the same
	 * lookups repoint_block_reference uses so a resolvability check matches Retry.
	 *
	 * @param array<int, true> $post_refs       Set of source post ids (keys).
	 * @param array<int, true> $term_refs       Set of source term ids (keys).
	 * @param string           $source_site_url Source identity to scope by.
	 * @return array{post: array<int, int>, term: array<int, int>} Source-id to
	 *                                                              destination-id
	 *                                                              maps per kind.
	 */
	public function map_target_refs(
		array $post_refs,
		array $term_refs,
		string $source_site_url
	): array {
		$lookup_site_url = URL_Validator::normalize_site_url_with_path(
			$source_site_url
		);

		return array(
			'post' => $this->lookup_destination_post_ids(
				$post_refs,
				$lookup_site_url
			),
			'term' => $this->lookup_destination_term_ids(
				$term_refs,
				$lookup_site_url
			),
		);
	}

	/**
	 * Recursively repoints registered id-bearing attrs whose value equals
	 * $target_ref to $dest_id, honoring each attr's kind gating. When a rule
	 * names a url_attr, the link url is re-derived from $dest_id too.
	 *
	 * @param array<array<string, mixed>>                                                                 $blocks     Block tree.
	 * @param array<string, list<array{attr:string, gated_by?: array<string,string>, url_attr?: string}>> $registry   Attr rules for the target kind.
	 * @param string                                                                                      $kind       'post' or 'term'.
	 * @param int                                                                                         $target_ref Source id to match.
	 * @param int                                                                                         $dest_id    Destination id to write.
	 * @param bool                                                                                        $changed    Set true, by reference, on any repoint.
	 * @return array<array<string, mixed>> Mutated tree.
	 */
	private function repoint_refs(
		array $blocks,
		array $registry,
		string $kind,
		int $target_ref,
		int $dest_id,
		bool &$changed
	): array {
		foreach ( $blocks as $i => $block ) {
			$name  = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			$attrs = isset( $block['attrs'] ) && is_array( $block['attrs'] )
				? $block['attrs']
				: array();

			foreach ( $registry[ $name ] ?? array() as $rule ) {
				if ( ! self::gate_passes( $rule, $attrs ) ) {
					continue;
				}

				$value = $attrs[ $rule['attr'] ] ?? null;
				if ( is_numeric( $value ) && (int) $value === $target_ref ) {
					$attrs[ $rule['attr'] ] = $dest_id;

					if ( isset( $rule['url_attr'] ) ) {
						$attrs = $this->rederive_link_url(
							$attrs,
							$rule['url_attr'],
							$dest_id,
							$kind
						);
					}

					$blocks[ $i ]['attrs'] = $attrs;
					$changed               = true;
				}
			}

			if (
				isset( $block['innerBlocks'] )
				&& is_array( $block['innerBlocks'] )
				&& array() !== $block['innerBlocks']
			) {
				$blocks[ $i ]['innerBlocks'] = $this->repoint_refs(
					$block['innerBlocks'],
					$registry,
					$kind,
					$target_ref,
					$dest_id,
					$changed
				);
			}
		}

		return $blocks;
	}

	/**
	 * Persists repointed content via a direct write, bypassing wp_update_post so
	 * the system touch-up creates no revision and leaves post_modified intact.
	 * Isolated so tests can force a write failure.
	 *
	 * @param int    $post_id     Post to update.
	 * @param string $new_content Serialized block content.
	 * @return bool True when the row was updated.
	 */
	protected function persist_repointed_content(
		int $post_id,
		string $new_content
	): bool {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = $wpdb->update(
			$wpdb->posts,
			array( 'post_content' => $new_content ),
			array( 'ID' => $post_id )
		);

		return false !== $result;
	}

	/**
	 * Walks the block tree and accumulates source post/term IDs that need to
	 * be looked up. IDs already resolvable via the session map skip the
	 * lookup pass.
	 *
	 * @param array<array<string, mixed>>                         $blocks         Block tree.
	 * @param array<int,int>                                      $session_id_map In-batch post-ID map.
	 * @param array{post: array<int,true>, term: array<int,true>} $collected      Accumulator (by reference).
	 */
	private function collect_id_references(
		array $blocks,
		array $session_id_map,
		array &$collected
	): void {
		foreach ( $blocks as $block ) {
			$name  = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			$attrs = isset( $block['attrs'] ) && is_array( $block['attrs'] )
				? $block['attrs']
				: array();

			foreach ( self::matching_refs( self::POST_ID_BLOCK_ATTRS, $name, $attrs ) as $id ) {
				if ( ! isset( $session_id_map[ $id ] ) ) {
					$collected['post'][ $id ] = true;
				}
			}

			foreach ( self::matching_refs( self::TERM_ID_BLOCK_ATTRS, $name, $attrs ) as $id ) {
				$collected['term'][ $id ] = true;
			}

			if (
				isset( $block['innerBlocks'] )
				&& is_array( $block['innerBlocks'] )
				&& array() !== $block['innerBlocks']
			) {
				$this->collect_id_references(
					$block['innerBlocks'],
					$session_id_map,
					$collected
				);
			}
		}
	}

	/**
	 * Returns the source IDs a block exposes per the given registry, after
	 * gating attrs (e.g. `kind`) have been checked.
	 *
	 * @param array<string, list<array{attr:string, gated_by?: array<string,string>, url_attr?: string}>> $registry Block-name => list of attr rules.
	 * @param string                                                                                      $name     Block name.
	 * @param array<string, mixed>                                                                        $attrs    Block attrs.
	 * @return list<int> Positive source IDs.
	 */
	private static function matching_refs(
		array $registry,
		string $name,
		array $attrs
	): array {
		if ( '' === $name || ! isset( $registry[ $name ] ) ) {
			return array();
		}

		$ids = array();
		foreach ( $registry[ $name ] as $rule ) {
			if ( ! self::gate_passes( $rule, $attrs ) ) {
				continue;
			}

			$value = $attrs[ $rule['attr'] ] ?? null;
			$id    = is_numeric( $value ) ? (int) $value : 0;
			if ( $id > 0 ) {
				$ids[] = $id;
			}
		}

		return $ids;
	}

	/**
	 * Reports whether a block attr rule's gating attrs (e.g. kind) all match.
	 *
	 * @param array{attr:string, gated_by?: array<string,string>, url_attr?: string} $rule  Attr rule.
	 * @param array<string, mixed>                                                   $attrs Block attrs.
	 * @return bool True when the rule applies to the block.
	 */
	private static function gate_passes( array $rule, array $attrs ): bool {
		if ( ! isset( $rule['gated_by'] ) ) {
			return true;
		}

		foreach ( $rule['gated_by'] as $gate_attr => $gate_value ) {
			if ( ( $attrs[ $gate_attr ] ?? null ) !== $gate_value ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Looks up destination post IDs for a set of source post IDs scoped to the
	 * caller's source site via paired META_SOURCE_POST_ID/META_SOURCE_SITE_URL
	 * postmeta. Returns a source-ID => destination-ID map.
	 *
	 * @param array<int, true> $source_ids      Set of source post IDs (keys).
	 * @param string           $source_site_url Path-bearing source site identity.
	 * @return array<int, int> Source-ID => destination-ID.
	 */
	private function lookup_destination_post_ids(
		array $source_ids,
		string $source_site_url
	): array {
		if ( array() === $source_ids || '' === $source_site_url ) {
			return array();
		}

		$ids   = array_keys( $source_ids );
		$posts = get_posts(
			array(
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'             => array(
					'relation' => 'AND',
					array(
						'key'     => Options::META_SOURCE_POST_ID,
						'value'   => $ids,
						'compare' => 'IN',
					),
					array(
						'key'   => Options::META_SOURCE_SITE_URL,
						'value' => $source_site_url,
					),
				),
				// Not 'any': It omits exclude_from_search post types.
				'post_type'              => array_keys( get_post_types() ),
				'post_status'            => 'any',
				'posts_per_page'         => count( $ids ),
				'suppress_filters'       => false,
				'update_post_term_cache' => false,
			)
		);

		$map = array();
		foreach ( $posts as $post ) {
			$source_id = absint(
				get_post_meta( $post->ID, Options::META_SOURCE_POST_ID, true )
			);
			if ( $source_id > 0 && ! isset( $map[ $source_id ] ) ) {
				$map[ $source_id ] = (int) $post->ID;
			}
		}

		return $map;
	}

	/**
	 * Looks up destination term IDs for a set of source term IDs scoped to the
	 * caller's source site URL via paired META_SOURCE_TERM_ID/URL term meta.
	 *
	 * Queries termmeta directly to avoid get_terms()'s taxonomy IN clause —
	 * pointless at our selectivity (paired-meta narrows to a tiny result set)
	 * and degrades on sites with thousands of registered taxonomies.
	 *
	 * @param array<int, true> $source_ids      Set of source term IDs (keys).
	 * @param string           $source_site_url Exact source site URL stored as
	 *                                          paired meta.
	 * @return array<int, int> Source-ID => destination-ID.
	 */
	private function lookup_destination_term_ids(
		array $source_ids,
		string $source_site_url
	): array {
		if ( array() === $source_ids || '' === $source_site_url ) {
			return array();
		}

		global $wpdb;

		$ids          = array_keys( $source_ids );
		$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

		$prepare_args = array_merge(
			array( Options::META_SOURCE_TERM_ID ),
			array_map( 'intval', $ids ),
			array( Options::META_SOURCE_TERM_URL, $source_site_url )
		);

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT tm_id.term_id AS term_id,
						tm_id.meta_value AS source_id
				 FROM {$wpdb->termmeta} tm_id
				 INNER JOIN {$wpdb->termmeta} tm_url
					 ON tm_url.term_id = tm_id.term_id
				 WHERE tm_id.meta_key = %s
					 AND tm_id.meta_value IN ($placeholders)
					 AND tm_url.meta_key = %s
					 AND tm_url.meta_value = %s",
				...$prepare_args
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber

		if ( ! is_array( $rows ) || array() === $rows ) {
			return array();
		}

		// Prime the term cache so downstream get_term() calls are free.
		$term_ids = array_map(
			static fn( $row ): int => (int) $row->term_id,
			$rows
		);
		_prime_term_caches( $term_ids );

		$map = array();
		foreach ( $rows as $row ) {
			$source_id = absint( $row->source_id );
			if ( $source_id > 0 && ! isset( $map[ $source_id ] ) ) {
				$map[ $source_id ] = (int) $row->term_id;
			}
		}

		return $map;
	}

	/**
	 * Second-pass walk: Applies the post/term ID maps to the block tree.
	 * Unmapped references are left untouched and recorded as warnings so the
	 * admin can fix them up after publishing dependencies.
	 *
	 * @param array<array<string, mixed>> $blocks   Block tree.
	 * @param array<int,int>              $post_map Source-ID => destination-ID.
	 * @param array<int,int>              $term_map Source-ID => destination-ID.
	 * @return array<array<string, mixed>> Mutated tree.
	 */
	private function apply_id_references(
		array $blocks,
		array $post_map,
		array $term_map
	): array {
		foreach ( $blocks as $i => $block ) {
			$name  = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			$attrs = isset( $block['attrs'] ) && is_array( $block['attrs'] )
				? $block['attrs']
				: array();

			$attrs = $this->rewrite_attrs(
				$attrs,
				$name,
				self::POST_ID_BLOCK_ATTRS,
				$post_map,
				'post'
			);
			$attrs = $this->rewrite_attrs(
				$attrs,
				$name,
				self::TERM_ID_BLOCK_ATTRS,
				$term_map,
				'term'
			);

			if ( array() !== $attrs ) {
				$blocks[ $i ]['attrs'] = $attrs;
			}

			if (
				isset( $block['innerBlocks'] )
				&& is_array( $block['innerBlocks'] )
				&& array() !== $block['innerBlocks']
			) {
				$blocks[ $i ]['innerBlocks'] = $this->apply_id_references(
					$block['innerBlocks'],
					$post_map,
					$term_map
				);
			}
		}

		return $blocks;
	}

	/**
	 * Rewrites the registered attrs on a single block using the given map.
	 * When a rule names a url_attr, the link url is re-derived from the
	 * resolved destination id. Logs a warning for each matched attr whose
	 * source ID was not resolvable so the admin can surface and fix it.
	 *
	 * @param array<string, mixed>                                                                        $attrs    Block attrs.
	 * @param string                                                                                      $name     Block name.
	 * @param array<string, list<array{attr:string, gated_by?: array<string,string>, url_attr?: string}>> $registry Block-name => list of attr rules.
	 * @param array<int,int>                                                                              $id_map   Source-ID => destination-ID.
	 * @param string                                                                                      $kind     'post' or 'term'.
	 * @return array<string, mixed> Mutated attrs.
	 */
	private function rewrite_attrs(
		array $attrs,
		string $name,
		array $registry,
		array $id_map,
		string $kind
	): array {
		if ( '' === $name || ! isset( $registry[ $name ] ) ) {
			return $attrs;
		}

		foreach ( $registry[ $name ] as $rule ) {
			if ( isset( $rule['gated_by'] ) ) {
				foreach ( $rule['gated_by'] as $gate_attr => $gate_value ) {
					if ( ( $attrs[ $gate_attr ] ?? null ) !== $gate_value ) {
						continue 2;
					}
				}
			}

			$value     = $attrs[ $rule['attr'] ] ?? null;
			$source_id = is_numeric( $value ) ? (int) $value : 0;
			if ( $source_id <= 0 ) {
				continue;
			}

			if ( isset( $id_map[ $source_id ] ) ) {
				$dest_id                = (int) $id_map[ $source_id ];
				$attrs[ $rule['attr'] ] = $dest_id;

				if ( isset( $rule['url_attr'] ) ) {
					$attrs = $this->rederive_link_url(
						$attrs,
						$rule['url_attr'],
						$dest_id,
						$kind
					);
				}
			} else {
				$this->warnings[] = array(
					'type'      => 'unmapped_block_reference',
					'kind'      => $kind,
					'block'     => $name,
					'source_id' => $source_id,
				);
			}
		}

		return $attrs;
	}

	/**
	 * Re-derives a nav-link/submenu url from its resolved destination id so the
	 * href matches where the target lives (e.g. /about -> /about-2 after a slug
	 * collision). Posts resolve via get_permalink, terms via get_term_link.
	 *
	 * The source url's query is carried over with post/term identity vars
	 * removed (so a plain-permalink source's stale id cannot override the new
	 * path) and its fragment preserved. Draft, pending, and auto-draft post
	 * targets are left alone: Their slug is not final, so re-deriving would
	 * store a temporary url.
	 *
	 * @param array<string, mixed> $attrs    Block attrs.
	 * @param string               $url_attr Attr holding the link url.
	 * @param int                  $dest_id  Resolved destination id.
	 * @param string               $kind     'post' or 'term'.
	 * @return array<string, mixed> Attrs with the url re-derived when applicable.
	 */
	private function rederive_link_url(
		array $attrs,
		string $url_attr,
		int $dest_id,
		string $kind
	): array {
		$current = $attrs[ $url_attr ] ?? null;
		if ( ! is_string( $current ) || '' === $current ) {
			return $attrs;
		}

		if ( 'term' !== $kind && $this->is_unpublished_post( $dest_id ) ) {
			return $attrs;
		}

		$permalink = 'term' === $kind
			? get_term_link( $dest_id )
			: get_permalink( $dest_id );

		if ( ! is_string( $permalink ) ) {
			return $attrs;
		}

		$result = $permalink;

		$query = $this->portable_query( $current, $dest_id, $kind );
		if ( '' !== $query ) {
			$separator = false === strpos( $permalink, '?' ) ? '?' : '&';
			$result   .= $separator . $query;
		}

		$fragment = wp_parse_url( $current, PHP_URL_FRAGMENT );
		if ( is_string( $fragment ) && '' !== $fragment ) {
			$result .= '#' . $fragment;
		}

		$attrs[ $url_attr ] = $result;

		return $attrs;
	}

	/**
	 * Whether a post target is unpublished, so its permalink is not yet final.
	 *
	 * @param int $post_id Destination post id.
	 * @return bool True for draft, pending, or auto-draft posts.
	 */
	private function is_unpublished_post( int $post_id ): bool {
		return in_array(
			get_post_status( $post_id ),
			array( 'draft', 'pending', 'auto-draft' ),
			true
		);
	}

	/**
	 * Returns the source url's query with the target's identity vars removed,
	 * keeping portable params (e.g. lang, utm, orderby). Stripping the identity
	 * vars stops a plain-permalink source's stale id from overriding the
	 * re-derived destination path.
	 *
	 * @param string $url     Source url to read the query from.
	 * @param int    $dest_id Resolved destination id.
	 * @param string $kind    'post' or 'term'.
	 * @return string Filtered query (no leading '?'), or '' when none remains.
	 */
	private function portable_query( string $url, int $dest_id, string $kind ): string {
		$query = wp_parse_url( $url, PHP_URL_QUERY );
		if ( ! is_string( $query ) || '' === $query ) {
			return '';
		}

		$args = array();
		wp_parse_str( $query, $args );

		foreach ( $this->identity_query_vars( $dest_id, $kind ) as $var ) {
			unset( $args[ $var ] );
		}

		return http_build_query( $args );
	}

	/**
	 * Lists the query vars WordPress uses to identify the target post or term,
	 * including the destination type's registered query var, so they can be
	 * stripped from a re-derived url.
	 *
	 * @param int    $dest_id Resolved destination id.
	 * @param string $kind    'post' or 'term'.
	 * @return list<string> Identity query var names.
	 */
	private function identity_query_vars( int $dest_id, string $kind ): array {
		if ( 'term' === $kind ) {
			$vars = array( 'cat', 'tag', 'taxonomy', 'term' );
			$term = get_term( $dest_id );
			if ( $term instanceof WP_Term ) {
				$taxonomy = get_taxonomy( $term->taxonomy );
				if ( $taxonomy instanceof WP_Taxonomy && is_string( $taxonomy->query_var ) ) {
					$vars[] = $taxonomy->query_var;
				}
			}

			return $vars;
		}

		$vars = array( 'p', 'page_id', 'attachment_id', 'post_type' );
		$post = get_post( $dest_id );
		if ( $post instanceof WP_Post ) {
			$type = get_post_type_object( $post->post_type );
			if ( $type instanceof WP_Post_Type && is_string( $type->query_var ) ) {
				$vars[] = $type->query_var;
			}
		}

		return $vars;
	}
}
