<?php
/**
 * GuidelineContextProvider - Canonical AI-facing guideline reader.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

/**
 * Reads editorial guideline context from the WordPress Knowledge storage.
 *
 * Guidelines live in the `wp_knowledge` post type introduced by Gutenberg and
 * headed for Core (see WordPress/gutenberg#77230). Each guideline scope is one
 * `guideline`-typed row addressed by a `guideline-{scope}` slug, with the text
 * in `post_content`; per-block guidelines are `guideline-block-*` rows whose
 * canonical block name is the row title. VIP Workflows does not own guideline
 * storage.
 *
 * Rows are read directly rather than through `/wp/v2/knowledge` because that
 * route is capability-gated on `read_knowledge_items` and returns 401 without a
 * current user — guideline context is also assembled from cron, Action
 * Scheduler jobs, and WP-CLI, where no user is set.
 */
class GuidelineContextProvider {

	/**
	 * Knowledge post type that stores guideline rows.
	 */
	private const POST_TYPE = 'wp_knowledge';

	/**
	 * Taxonomy identifying what kind of knowledge a row holds.
	 */
	private const TYPE_TAXONOMY = 'wp_knowledge_type';

	/**
	 * Taxonomy term marking a row as a guideline.
	 */
	private const TYPE_TERM = 'guideline';

	/**
	 * Slug prefix reserved for guideline rows.
	 */
	private const SLUG_PREFIX = 'guideline-';

	/**
	 * Slug prefix for the multi-row `blocks` scope.
	 */
	private const BLOCK_SLUG_PREFIX = 'guideline-block-';

	/**
	 * Upper bound on guideline rows read in one pass.
	 *
	 * A site has one row per registered scope plus one per block with its own
	 * guidelines, so this is far above any realistic configuration while still
	 * keeping the query bounded.
	 */
	private const MAX_ROWS = 100;

	/**
	 * Integration faults already reported this request, keyed by message.
	 *
	 * Guideline context is gathered several times over a single ideation run, so
	 * one broken integration would otherwise report itself in dozens of identical
	 * copies. Mirrors the de-duplication in `LlmTextGenerator`.
	 *
	 * @var array<string, true>
	 */
	private static array $reported = array();

	/**
	 * Gather guideline markdown for AI context.
	 *
	 * @param int $category_id Deprecated. Category-scoped guidelines are owned by Gutenberg/Core.
	 * @return string Combined guideline text.
	 */
	public static function gather_context( int $category_id = 0 ): string {
		$guidelines = self::get_guidelines_text();
		$context    = ( '' === $guidelines )
			? 'No guideline context available.'
			: "=== Content Guidelines ===\n{$guidelines}";

		/**
		 * Filters the editorial guideline context injected into AI prompts.
		 *
		 * Fires at the canonical source, so it applies to every text consumer:
		 * ideation draft generation (via DraftBuilder) and the ideation brand
		 * context (via IdeationOrchestrator). Return the value unchanged to keep
		 * default behavior. The empty state is the literal string
		 * 'No guideline context available.'.
		 *
		 * @param string $context     Guideline packet text, or the empty-state sentinel.
		 * @param int    $category_id Optional category ID supplied by the caller.
		 */
		return (string) apply_filters( 'vip_workflows_guideline_context', $context, $category_id );
	}

	/**
	 * Get canonical guideline rules for validation tools.
	 *
	 * @param int $post_id Optional post ID for post/block-aware guideline packets.
	 * @return array<int, array{name: string, rule: string}>
	 */
	public static function get_editorial_alignment_rules( int $post_id = 0 ): array {
		$packet_text = self::get_guidelines_text();

		$rules = ( '' === $packet_text )
			? array()
			: array(
				array(
					'name' => __( 'Content Guidelines', 'vip-workflows' ),
					'rule' => $packet_text,
				),
			);

		/**
		 * Filters the editorial alignment rules validated by the Editorial
		 * Alignment Checker. Return the value unchanged to keep default behavior.
		 *
		 * @param array<int, array{name: string, rule: string}> $rules   Rule definitions.
		 * @param int                                            $post_id Optional post ID supplied by the caller.
		 */
		return (array) apply_filters( 'vip_workflows_editorial_alignment_rules', $rules, $post_id );
	}

	/**
	 * Read published guideline rows and format them for LLM consumption.
	 *
	 * Returns an empty string in three situations, only one of which is worth
	 * reporting:
	 *
	 * - No scope registry. Gutenberg is inactive, predates Guidelines, or the
	 *   feature is switched off — guidelines were never going to work here, so
	 *   this stays silent rather than nagging every site that does not run it.
	 * - A registry, but no guideline rows. The site simply has not written any.
	 *   A legitimate empty state, also silent.
	 * - A registry, but the storage underneath it does not answer. Guidelines
	 *   *should* be working and are not, which is the case worth surfacing —
	 *   see `report_fault()`.
	 *
	 * @return string Formatted guideline text.
	 */
	private static function get_guidelines_text(): string {
		// The scope registry is the tell for whether Gutenberg's guidelines
		// module is loaded at all: it ships in the same file as the storage, and
		// it is the documented public API. No registry means the feature is not
		// running on this site, so nothing below is a fault.
		$scopes = self::get_scopes();
		if ( empty( $scopes ) ) {
			return '';
		}

		if ( ! function_exists( 'post_type_exists' ) || ! post_type_exists( self::POST_TYPE ) ) {
			self::report_fault(
				sprintf(
					'The guideline scope registry is present but the "%s" post type is not registered. Guidelines will not reach AI prompts.',
					self::POST_TYPE
				)
			);
			return '';
		}

		$rows = get_posts(
			array(
				'post_type'              => self::POST_TYPE,
				// Gutenberg's own Settings page reads only the published row for
				// a slug. Draft/private rows and the suffixed duplicates
				// `wp_unique_post_slug()` creates (`guideline-copy-2`) are dead
				// data there, so surfacing them here would feed the model text
				// the site owner cannot see.
				'post_status'            => 'publish',
				'numberposts'            => self::MAX_ROWS,
				'orderby'                => 'title',
				'order'                  => 'ASC',
				'no_found_rows'          => true,
				'update_post_term_cache' => false,
				'update_post_meta_cache' => false,
				'tax_query'              => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
					array(
						'taxonomy' => self::TYPE_TAXONOMY,
						'field'    => 'slug',
						'terms'    => self::TYPE_TERM,
					),
				),
			)
		);

		// No rows is the ordinary "nobody has written guidelines yet" state.
		if ( empty( $rows ) ) {
			return '';
		}

		return self::format_rows( $rows, $scopes );
	}

	/**
	 * Report an integration fault once per request.
	 *
	 * Reserved for the case where guidelines are configured to work and do not —
	 * never for a site that simply is not running the feature. Guideline context
	 * degrades to a sentinel string rather than an error, so without this a
	 * reshape of the upstream storage empties every AI prompt in silence, which
	 * is exactly how the removal of `/wp/v2/content-guidelines` went unnoticed.
	 *
	 * Routed through `_doing_it_wrong()`, which honours `WP_DEBUG` — so this is
	 * a developer-facing signal on a site being worked on, not log noise in
	 * production.
	 *
	 * @param string $message Description of the fault.
	 */
	private static function report_fault( string $message ): void {
		if ( isset( self::$reported[ $message ] ) ) {
			return;
		}

		self::$reported[ $message ] = true;

		_doing_it_wrong( __CLASS__ . '::gather_context', esc_html( $message ), '1.0.0' );
	}

	/**
	 * Read the guideline scope registry.
	 *
	 * The registry is the source of truth for which scopes exist, their
	 * human-readable titles, and their order — and it is extensible, so plugins
	 * that register a scope get their guidelines picked up here for free.
	 *
	 * @return array<string, array{title?: string, order?: int}> Slug-keyed scopes.
	 */
	private static function get_scopes(): array {
		if ( ! function_exists( 'wp_guideline_scopes' ) ) {
			return array();
		}

		$scopes = wp_guideline_scopes();

		return is_array( $scopes ) ? $scopes : array();
	}

	/**
	 * Group guideline rows by scope and render them as markdown sections.
	 *
	 * @param array<int, \WP_Post>                              $rows   Guideline rows.
	 * @param array<string, array{title?: string, order?: int}> $scopes Scope registry.
	 * @return string Formatted text.
	 */
	private static function format_rows( array $rows, array $scopes ): string {
		$by_scope = array();
		$matched  = 0;

		foreach ( $rows as $row ) {
			$scope = self::scope_from_slug( (string) $row->post_name, $scopes );
			if ( null === $scope ) {
				continue;
			}

			++$matched;

			$text = trim( (string) $row->post_content );
			if ( '' === $text ) {
				continue;
			}

			// Per-block rows are the one multi-row scope, and each carries its
			// own heading: the canonical block name is kept in the row title
			// (Gutenberg's insert guard re-stamps every other scope's title from
			// the registry, but deliberately leaves block titles alone).
			$heading = ( self::is_block_row( (string) $row->post_name, $scopes ) )
				? sprintf( 'Block: %s', (string) $row->post_title )
				: (string) ( $scopes[ $scope ]['title'] ?? $scope );

			$by_scope[ $scope ][] = "## {$heading}\n{$text}";
		}

		// Guideline-typed rows exist, yet not one of them is addressed by a slug
		// this reader recognizes — so the slug model here no longer matches the
		// one upstream is writing. Rows that matched but were blank are not a
		// fault, which is why this counts matches rather than sections.
		if ( 0 === $matched ) {
			self::report_fault(
				sprintf(
					'Found %d published guideline row(s), but none map to a registered scope. The "%s" slug model may have changed upstream.',
					count( $rows ),
					self::SLUG_PREFIX
				)
			);
			return '';
		}

		if ( empty( $by_scope ) ) {
			return '';
		}

		// Present sections in the same order the site owner sees them on
		// Settings → Guidelines.
		uksort(
			$by_scope,
			static function ( string $a, string $b ) use ( $scopes ): int {
				return ( (int) ( $scopes[ $a ]['order'] ?? 0 ) ) <=> ( (int) ( $scopes[ $b ]['order'] ?? 0 ) );
			}
		);

		$sections = array();
		foreach ( $by_scope as $scope_sections ) {
			foreach ( $scope_sections as $section ) {
				$sections[] = $section;
			}
		}

		return implode( "\n\n", $sections );
	}

	/**
	 * Resolve the scope that owns a guideline row slug.
	 *
	 * Mirrors Gutenberg's documented slug model: a slug matching a registered
	 * scope key is that scope, and any other `guideline-block-*` slug belongs to
	 * the `blocks` scope while it is registered. Gutenberg's own resolver is
	 * marked `@access private`, so the rule is applied here against the public
	 * `wp_guideline_scopes()` registry rather than called directly.
	 *
	 * @param string                                            $slug   Row slug.
	 * @param array<string, array{title?: string, order?: int}> $scopes Scope registry.
	 * @return string|null Scope key, or null when the slug maps to no registered scope.
	 */
	private static function scope_from_slug( string $slug, array $scopes ): ?string {
		if ( ! str_starts_with( $slug, self::SLUG_PREFIX ) ) {
			return null;
		}

		// A slug matching a registered scope key wins, so a scope keyed like
		// `block-foo` resolves to itself instead of being swallowed by `blocks`.
		$scope = substr( $slug, strlen( self::SLUG_PREFIX ) );
		if ( isset( $scopes[ $scope ] ) ) {
			return $scope;
		}

		if ( self::is_block_row( $slug, $scopes ) ) {
			return 'blocks';
		}

		return null;
	}

	/**
	 * Check whether a slug is a per-block guideline row.
	 *
	 * @param string                                            $slug   Row slug.
	 * @param array<string, array{title?: string, order?: int}> $scopes Scope registry.
	 * @return bool
	 */
	private static function is_block_row( string $slug, array $scopes ): bool {
		if ( ! isset( $scopes['blocks'] ) ) {
			return false;
		}

		// A registered scope key always wins over the per-block namespace.
		if ( isset( $scopes[ substr( $slug, strlen( self::SLUG_PREFIX ) ) ] ) ) {
			return false;
		}

		return str_starts_with( $slug, self::BLOCK_SLUG_PREFIX )
			&& strlen( $slug ) > strlen( self::BLOCK_SLUG_PREFIX );
	}
}
