<?php
/**
 * Seeder Content_Generator class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Seeder;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Produces seeded post payloads as plain data structures.
 *
 * Houses the pure content and decision logic used by both the WP-CLI seeder
 * script (bin/seed-content.php) and integration tests that exercise the
 * import pipeline. The class writes nothing to the database — callers
 * translate the returned payload into wp_insert_post() arguments or a mocked
 * REST response as needed.
 */
class Content_Generator {

	/**
	 * Number of seconds in a day, mirroring WP's DAY_IN_SECONDS without
	 * requiring WordPress to be loaded.
	 */
	private const DAY_IN_SECONDS = 86400;

	/**
	 * Post meta key used to tag every payload as seeder-generated.
	 *
	 * Exposed so the seeder cleanup routine can locate previously inserted
	 * content without hardcoding the string in multiple places.
	 */
	public const SEEDER_META_KEY = '_seeder_generated';

	/**
	 * Post meta key that records the current revision number for a seeded
	 * post. Absent until the post is updated at least once.
	 */
	public const REVISION_META_KEY = '_seeder_revision';

	/**
	 * Marker comments wrapping the per-revision note appended to post
	 * content. Used to strip prior notes on subsequent updates so revisions
	 * don't accumulate.
	 */
	private const REVISION_MARKER_BEGIN = '<!-- seeder-rev-note -->';
	private const REVISION_MARKER_END   = '<!-- /seeder-rev-note -->';

	/**
	 * Available editor modes.
	 *
	 * @var list<string>
	 */
	private const VALID_EDITORS = array( 'gutenberg', 'classic', 'mixed' );

	/**
	 * Available image modes.
	 *
	 * @var list<string>
	 */
	private const VALID_IMAGES_MODES = array( '1', '2', '2-resized', 'auto' );

	/**
	 * Concrete image modes (no 'auto') used when rotating in auto mode.
	 *
	 * @var list<string>
	 */
	private const CONCRETE_IMAGE_MODES = array( '1', '2', '2-resized' );

	/**
	 * Color values cycled through for the seeder_color meta field.
	 *
	 * @var list<string>
	 */
	private const COLORS = array( 'red', 'green', 'blue', 'yellow' );

	/**
	 * Post type slug for generated posts (e.g. 'post', 'page', 'my_cpt').
	 *
	 * @var string
	 */
	private string $type;

	/**
	 * Editor mode: 'gutenberg', 'classic', or 'mixed'.
	 *
	 * @var string
	 */
	private string $editor;

	/**
	 * Image mode: '1', '2', '2-resized', or 'auto'.
	 *
	 * @var string
	 */
	private string $images_mode;

	/**
	 * Number of posts in the batch (used for date spread).
	 *
	 * @var int
	 */
	private int $count;

	/**
	 * Starting index of the batch (used for date spread).
	 *
	 * @var int
	 */
	private int $start;

	/**
	 * Additional days to shift dates further into the past.
	 *
	 * @var int
	 */
	private int $date_offset;

	/**
	 * Optional title prefix; an empty string disables prefixing.
	 *
	 * @var string
	 */
	private string $prefix;

	/**
	 * Reference Unix timestamp used as "now" for date calculations.
	 *
	 * @var int
	 */
	private int $reference_time;

	/**
	 * Base URL used to build absolute links in the payload.
	 *
	 * @var string
	 */
	private string $source_base_url;

	/**
	 * Constructor.
	 *
	 * @param string $type            Post type slug.
	 * @param string $editor          Editor mode: 'gutenberg', 'classic', or 'mixed'.
	 * @param string $images_mode     Image mode: '1', '2', '2-resized', or 'auto'.
	 * @param int    $count           Number of posts in the batch.
	 * @param int    $start           Starting index of the batch.
	 * @param int    $date_offset     Days to shift all dates further into the past.
	 * @param string $prefix          Title prefix (no trailing space); empty
	 *                                string disables prefixing.
	 * @param int    $reference_time  Unix timestamp used as "now" for date math.
	 * @param string $source_base_url Base URL used when building absolute links;
	 *                                trailing slashes are trimmed.
	 *
	 * @throws \InvalidArgumentException When $editor or $images_mode is not
	 *                                   one of the supported values.
	 */
	public function __construct(
		string $type,
		string $editor,
		string $images_mode,
		int $count,
		int $start,
		int $date_offset,
		string $prefix,
		int $reference_time,
		string $source_base_url
	) {
		if ( ! in_array( $editor, self::VALID_EDITORS, true ) ) {
			throw new \InvalidArgumentException(
				esc_html(
					"Invalid editor '{$editor}'. "
					. 'Use: gutenberg, classic, or mixed.'
				)
			);
		}

		if ( ! in_array( $images_mode, self::VALID_IMAGES_MODES, true ) ) {
			throw new \InvalidArgumentException(
				esc_html(
					"Invalid images_mode '{$images_mode}'. "
					. 'Use: 1, 2, 2-resized, or auto.'
				)
			);
		}

		$this->type            = $type;
		$this->editor          = $editor;
		$this->images_mode     = $images_mode;
		$this->count           = max( 1, $count );
		$this->start           = max( 1, $start );
		$this->date_offset     = max( 0, $date_offset );
		$this->prefix          = $prefix;
		$this->reference_time  = $reference_time;
		$this->source_base_url = rtrim( $source_base_url, '/' );
	}

	/**
	 * Returns the seeder's canonical taxonomy/term configuration.
	 *
	 * Exposed as static so cleanup code can iterate the same set without
	 * needing a configured generator instance.
	 *
	 * @return array<string, array{field: string, terms: list<string>}>
	 */
	public static function term_config(): array {
		return array(
			'category' => array(
				'field' => 'name',
				'terms' => array(
					'Seeder Category A',
					'Seeder Category B',
					'Seeder Category C',
				),
			),
			'post_tag' => array(
				'field' => 'slug',
				'terms' => array(
					'seeder-alpha',
					'seeder-beta',
					'seeder-gamma',
					'seeder-delta',
				),
			),
		);
	}

	/**
	 * Resolves whether a given post index should use the block editor.
	 *
	 * @param int $index Post index (1-based).
	 * @return bool True for block editor, false for classic editor.
	 */
	public function resolve_editor( int $index ): bool {
		return match ( $this->editor ) {
			'gutenberg' => true,
			'classic'   => false,
			default     => 0 !== $index % 3, // 2/3 Gutenberg in mixed mode.
		};
	}

	/**
	 * Resolves the concrete image mode for a given post index.
	 *
	 * In 'auto' mode, cycles through the concrete modes so a batch covers
	 * all three image layouts.
	 *
	 * @param int $index Post index (1-based).
	 * @return string Resolved mode: '1', '2', or '2-resized'.
	 */
	public function resolve_image_mode( int $index ): string {
		if ( 'auto' !== $this->images_mode ) {
			return $this->images_mode;
		}

		$modes = self::CONCRETE_IMAGE_MODES;
		return $modes[ max( 0, $index - 1 ) % count( $modes ) ];
	}

	/**
	 * Resolves the post status for a given index.
	 *
	 * Rotates statuses so every batch of six covers publish, draft, and
	 * private at least once: publish by default, draft every 5th, private
	 * every 6th. A non-zero revision shifts the rotation so update mode
	 * surfaces status transitions for the migration to propagate.
	 *
	 * @param int $index    Post index (1-based).
	 * @param int $revision Revision number; 0 keeps create-mode rotation.
	 * @return string 'publish', 'draft', or 'private'.
	 */
	public function resolve_status( int $index, int $revision = 0 ): string {
		$rotated = $index + $revision;

		if ( 0 === $rotated % 6 ) {
			return 'private';
		}

		if ( 0 === $rotated % 5 ) {
			return 'draft';
		}

		return 'publish';
	}

	/**
	 * Resolves the post date for a given index.
	 *
	 * Spreads posts over the last 90 days (oldest first), then shifts the
	 * whole batch further back by $date_offset days. Returned in UTC so
	 * tests with a fixed reference_time get deterministic output.
	 *
	 * @param int $index Post index (1-based).
	 * @return string Date formatted as 'Y-m-d H:i:s' (UTC).
	 */
	public function resolve_date( int $index ): string {
		$days_ago  = (int) round(
			( $this->start + $this->count - 1 - $index )
				* 90 / max( 1, $this->count )
		) + $this->date_offset;
		$timestamp = $this->reference_time - $days_ago * self::DAY_IN_SECONDS;

		return gmdate( 'Y-m-d H:i:s', $timestamp );
	}

	/**
	 * Returns the compact image label used in post titles.
	 *
	 * @param string $mode      Resolved image mode: '1', '2', or '2-resized'.
	 * @param int    $img_count Number of image references actually provided.
	 * @return string Label such as '1P', '2P', or '2PR'.
	 */
	public function image_label( string $mode, int $img_count ): string {
		$base = "{$img_count}P";
		return '2-resized' === $mode ? "{$base}R" : $base;
	}

	/**
	 * Builds the title for a given index.
	 *
	 * @param int    $index         Post index (1-based).
	 * @param bool   $use_gutenberg True if the post will use the block editor.
	 * @param string $mode          Resolved image mode.
	 * @param int    $img_count     Number of image references provided.
	 * @return string Post title.
	 */
	public function title(
		int $index,
		bool $use_gutenberg,
		string $mode,
		int $img_count
	): string {
		$prefix       = '' !== $this->prefix ? $this->prefix . ' ' : '';
		$editor_label = $use_gutenberg ? '' : ' C';
		$img_label    = $this->image_label( $mode, $img_count );

		return $prefix . ucfirst( $this->type )
			. " {$index}{$editor_label} - {$img_label}";
	}

	/**
	 * Builds the slug for a given index.
	 *
	 * @param int $index Post index (1-based).
	 * @return string Post slug.
	 */
	public function slug( int $index ): string {
		return "seeder-{$this->type}-{$index}";
	}

	/**
	 * Builds the excerpt for a given index.
	 *
	 * @param int $index Post index (1-based).
	 * @return string Post excerpt.
	 */
	public function excerpt( int $index ): string {
		return "Excerpt for seeded {$this->type} number {$index}.";
	}

	/**
	 * Produces Gutenberg block markup with a heading, paragraphs, optional
	 * image blocks, and a list.
	 *
	 * @param int                               $index      Post index.
	 * @param list<array{id: int, url: string}> $image_refs Image references.
	 * @return string Block markup.
	 */
	public function gutenberg_content( int $index, array $image_refs ): string {
		$content  = "<!-- wp:heading {\"level\":2} -->\n"
			. "<h2 class=\"wp-block-heading\">Heading for post {$index}</h2>\n"
			. '<!-- /wp:heading -->';
		$content .= "\n\n<!-- wp:paragraph -->\n"
			. "<p>This is seeded post number {$index}. "
			. "It uses the block editor.</p>\n"
			. '<!-- /wp:paragraph -->';
		$content .= "\n\n<!-- wp:paragraph -->\n"
			. '<p>Second paragraph with additional content for testing the '
			. "import process and URL rewriting.</p>\n"
			. '<!-- /wp:paragraph -->';

		foreach ( $image_refs as $image ) {
			$id  = $image['id'];
			$url = $image['url'];

			$content .= "\n\n<!-- wp:image {\"id\":{$id},"
				. "\"sizeSlug\":\"large\"} -->\n";
			$content .= '<figure class="wp-block-image size-large">';
			$content .= '<img src="' . esc_url( $url )
				. '" alt="" class="wp-image-' . absint( $id ) . '"/>';
			$content .= "</figure>\n";
			$content .= '<!-- /wp:image -->';
		}

		$content .= "\n\n<!-- wp:paragraph -->\n"
			. '<p>Third paragraph, appearing after any images, for additional '
			. "import testing coverage.</p>\n"
			. '<!-- /wp:paragraph -->';
		$content .= "\n\n<!-- wp:list -->\n"
			. '<ul class="wp-block-list"><li>List item one</li>'
			. "<li>List item two</li><li>List item three</li></ul>\n"
			. '<!-- /wp:list -->';

		return $content;
	}

	/**
	 * Produces classic editor HTML with a heading, paragraphs, optional
	 * inline images (first wrapped in a [caption] shortcode), and a list.
	 *
	 * @param int                               $index      Post index.
	 * @param list<array{id: int, url: string}> $image_refs Image references.
	 * @return string HTML content.
	 */
	public function classic_content( int $index, array $image_refs ): string {
		$content  = "<h2>Heading for post {$index}</h2>";
		$content .= "\n<p>This is seeded post number {$index}. "
			. 'It uses the classic editor.</p>';
		$content .= "\n<p>Second paragraph with additional content for testing "
			. 'the import process and URL rewriting.</p>';

		$first = true;

		foreach ( $image_refs as $image ) {
			$id  = $image['id'];
			$url = $image['url'];

			if ( $first ) {
				$content .= "\n[caption id=\"attachment_{$id}\" "
					. 'align="aligncenter" width="800"]';
				$content .= '<img src="' . esc_url( $url )
					. '" alt="Seeded image" width="800" height="600" />';
				$content .= " Caption for seeded image {$index}.[/caption]";
				$first    = false;
			} else {
				$content .= "\n<p><img src=\"" . esc_url( $url )
					. '" alt="Seeded image" /></p>';
			}
		}

		$content .= "\n<p>Third paragraph, appearing after any images, for "
			. 'additional import testing coverage.</p>';
		$content .= "\n<ul>\n<li>List item one</li>\n"
			. "<li>List item two</li>\n<li>List item three</li>\n</ul>";

		return $content;
	}

	/**
	 * Returns the meta values seeded for a given index.
	 *
	 * Includes the SEEDER_META_KEY tag so consumers can mark inserted posts
	 * for later cleanup. A non-zero revision shifts the rotating color and
	 * priority values and records the revision number so update mode
	 * surfaces meta changes for the migration to propagate.
	 *
	 * @param int $index    Post index (1-based).
	 * @param int $revision Revision number; 0 keeps create-mode values.
	 * @return array<string, string|int> Meta key => value.
	 */
	public function meta_values( int $index, int $revision = 0 ): array {
		$rotated     = $index + $revision;
		$color_index = max( 0, $rotated ) % count( self::COLORS );

		$values = array(
			self::SEEDER_META_KEY => '1',
			'seeder_color'        => self::COLORS[ $color_index ],
			'seeder_priority'     => ( $rotated % 10 ) + 1,
		);

		if ( $revision > 0 ) {
			$values[ self::REVISION_META_KEY ] = (string) $revision;
		}

		return $values;
	}

	/**
	 * Returns the term assignments seeded for a given index.
	 *
	 * Rotates two terms per taxonomy from term_config(). The caller is
	 * responsible for filtering out taxonomies that don't apply to the
	 * target post type. A non-zero revision shifts the rotation so update
	 * mode surfaces taxonomy changes for the migration to propagate.
	 *
	 * @param int $index    Post index (1-based).
	 * @param int $revision Revision number; 0 keeps create-mode rotation.
	 * @return array<string, list<string>> Taxonomy => list of term values
	 *                                     (names or slugs per term_config()).
	 */
	public function term_assignments( int $index, int $revision = 0 ): array {
		$assignments = array();
		$rotated     = $index + $revision;

		foreach ( self::term_config() as $taxonomy => $config ) {
			$terms = $config['terms'];
			$n     = count( $terms );

			if ( 0 === $n ) {
				continue;
			}

			$assignments[ $taxonomy ] = array(
				$terms[ $rotated % $n ],
				$terms[ ( $rotated + 1 ) % $n ],
			);
		}

		return $assignments;
	}

	/**
	 * Builds a complete payload for the post at the given index.
	 *
	 * The payload is editor- and image-mode-aware. Callers supply image
	 * references (id + URL) for whatever number of images the configured
	 * image mode implies — the generator will embed them and pick the first
	 * one as the featured media.
	 *
	 * @param int                               $index      Post index (1-based).
	 * @param list<array{id: int, url: string}> $image_refs Image references.
	 * @return array{
	 *     title: string,
	 *     slug: string,
	 *     link: string,
	 *     content: string,
	 *     excerpt: string,
	 *     post_type: string,
	 *     status: string,
	 *     date: string,
	 *     meta: array<string, string|int>,
	 *     terms: array<string, list<string>>,
	 *     featured_media: int,
	 * } Payload describing the seeded post.
	 */
	public function generate( int $index, array $image_refs ): array {
		$use_gutenberg = $this->resolve_editor( $index );
		$image_mode    = $this->resolve_image_mode( $index );
		$img_count     = count( $image_refs );
		$slug          = $this->slug( $index );

		$content = $use_gutenberg
			? $this->gutenberg_content( $index, $image_refs )
			: $this->classic_content( $index, $image_refs );

		return array(
			'title'          => $this->title(
				$index,
				$use_gutenberg,
				$image_mode,
				$img_count
			),
			'slug'           => $slug,
			'link'           => $this->source_base_url . '/' . $slug,
			'content'        => $content,
			'excerpt'        => $this->excerpt( $index ),
			'post_type'      => $this->type,
			'status'         => $this->resolve_status( $index ),
			'date'           => $this->resolve_date( $index ),
			'meta'           => $this->meta_values( $index ),
			'terms'          => $this->term_assignments( $index ),
			'featured_media' => $image_refs[0]['id'] ?? 0,
		);
	}

	/**
	 * Returns the post index encoded in a seeder slug, or null if the slug
	 * doesn't match the seeder format.
	 *
	 * @param string $slug Post slug to parse.
	 * @return int|null Index, or null when the slug isn't seeder-shaped.
	 */
	public static function extract_index_from_slug( string $slug ): ?int {
		if ( ! str_starts_with( $slug, 'seeder-' ) ) {
			return null;
		}

		if ( 1 === preg_match( '/-(\d+)$/', $slug, $matches ) ) {
			return (int) $matches[1];
		}

		return null;
	}

	/**
	 * Returns the given value with the trailing revision suffix updated.
	 *
	 * Strips any existing " (rev N)" suffix and appends a fresh one when
	 * $revision is positive. Revision 0 simply strips, returning the value
	 * to its create-mode form.
	 *
	 * @param string $value    Current title or excerpt.
	 * @param int    $revision Target revision number.
	 * @return string Value with the revision suffix applied.
	 */
	public static function apply_revision_suffix(
		string $value,
		int $revision
	): string {
		$stripped = (string) preg_replace(
			'/\s*\(rev \d+\)\s*$/',
			'',
			$value
		);

		return $revision > 0
			? $stripped . " (rev {$revision})"
			: $stripped;
	}

	/**
	 * Returns the post content with the revision note replaced.
	 *
	 * The revision note is wrapped in HTML marker comments so it can be
	 * located and replaced without disturbing the rest of the body. Works
	 * for both block and classic content.
	 *
	 * @param string $content  Current post content.
	 * @param int    $revision Target revision number.
	 * @return string Content with the revision note applied.
	 */
	public static function apply_revision_to_content(
		string $content,
		int $revision
	): string {
		$pattern  = '/\s*' . preg_quote( self::REVISION_MARKER_BEGIN, '/' )
			. '.*?' . preg_quote( self::REVISION_MARKER_END, '/' ) . '/s';
		$stripped = (string) preg_replace( $pattern, '', $content );

		if ( 0 === $revision ) {
			return $stripped;
		}

		return $stripped . "\n\n" . self::REVISION_MARKER_BEGIN
			. "\n<p>Revision {$revision} update notice.</p>\n"
			. self::REVISION_MARKER_END;
	}
}
