<?php
/**
 * Default post transformer for ingestion.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Configs;

/**
 * Provides a default implementation for transforming WP_Post to Ingestion_Post_Record.
 *
 * This transformer hooks into vip_agentforce_transform_post at priority 10.
 * Developers can:
 * - Use this as-is for basic transformation
 * - Add filters at higher priority to modify the record after this runs
 * - Remove this filter entirely and implement custom transformation
 */
class Default_Transformer {
	/**
	 * Maximum JSON-encoded byte length of the ingested `content` field.
	 *
	 * Data 360's (Data Cloud) streaming Ingestion API rejects any request whose
	 * payload exceeds ~200 KB — the gateway returns a plain 403 before the
	 * request ever reaches Data Cloud. Raw post_content on large pages (e.g. a
	 * Gutenberg page packed with block markup and inline SVG) can run 250–400 KB,
	 * and JSON-escaping that HTML inflates it further. We reduce content to plain
	 * text and cap it well under the limit so a single record can never exceed it.
	 *
	 * Measured against the encoded length, not the raw one: the API sizes the
	 * body that Ingestion_API_Client::send() builds, and wp_json_encode escapes
	 * every non-ASCII character to \uXXXX. A 3-byte CJK character encodes to 6
	 * bytes and a 4-byte emoji to 12, so a raw-byte cap of this size would let
	 * 150 KB of Japanese text serialize to 300 KB and hit the same 403. The
	 * remaining headroom covers the record's other fields and JSON structure.
	 */
	private const MAX_CONTENT_BYTES = 150000;

	/**
	 * Initialize the transformer.
	 */
	public static function init(): void {
		add_filter( 'vip_agentforce_transform_post', [ __CLASS__, 'transform' ], 10, 2 );
	}

	/**
	 * Transform a WP_Post into an Ingestion_Post_Record.
	 *
	 * @param Ingestion_Post_Record|null $record Existing record (null if first transformer).
	 * @param \WP_Post                   $post   The post to transform.
	 * @return Ingestion_Post_Record The transformed record.
	 */
	public static function transform( ?Ingestion_Post_Record $record, \WP_Post $post ): Ingestion_Post_Record {
		// If a previous filter already created a record, return it unchanged.
		if ( $record instanceof Ingestion_Post_Record ) {
			return $record;
		}

		$site_id                  = defined( 'VIP_GO_APP_ID' ) ? (string) VIP_GO_APP_ID : '0';
		$blog_id                  = (string) get_current_blog_id();
		$post_id                  = (string) $post->ID;
		$identity_site_id_blog_id = $site_id . '_' . $blog_id;
		$filter_site_id_blog_id   = Configs::get_site_key();

		if ( '' === $filter_site_id_blog_id ) {
			$filter_site_id_blog_id = $identity_site_id_blog_id;
		}

		$site_id_blog_id_post_id = $identity_site_id_blog_id . '_' . $post_id;

		return new Ingestion_Post_Record(
			[
				'site_id'                 => $site_id,
				'blog_id'                 => $blog_id,
				'post_id'                 => $post_id,
				'site_id_blog_id'         => $filter_site_id_blog_id,
				'site_id_blog_id_post_id' => $site_id_blog_id_post_id,
				'published'               => 'publish' === $post->post_status,
				'last_published_at'       => self::format_date( $post->post_date_gmt ),
				'last_modified_at'        => self::format_date( $post->post_modified_gmt ),
				'title'                   => $post->post_title,
				'content'                 => self::prepare_content( $post->post_content ),
				'excerpt'                 => $post->post_excerpt,
				'categories'              => self::get_categories( $post->ID ),
				'tags'                    => self::get_tags( $post->ID ),
				'author'                  => self::get_author_name( $post->post_author ),
				'url'                     => get_permalink( $post ),
				'post_type'               => $post->post_type,
				'post_status'             => $post->post_status,
			]
		);
	}

	/**
	 * Reduce post content to plain text and cap its size for ingestion.
	 *
	 * Salesforce's streaming Ingestion API rejects any request whose JSON body
	 * exceeds 200 KB per request. Raw post_content on large pages can exceed
	 * that on its own, and JSON-escaping the HTML inflates it further, so the
	 * gateway returns a plain 403 before Data Cloud ever sees the record.
	 *
	 * Stripping Gutenberg block markup and HTML/SVG both keeps records under the
	 * limit and improves semantic search, which indexes readable text rather
	 * than markup. A hard byte cap guarantees a single record can never exceed
	 * the API limit even for an unusually long article.
	 *
	 * Block boundaries survive as line breaks: tags are removed edge to edge, so
	 * `<p>Alpha</p><p>Beta</p>` would otherwise collapse to `AlphaBeta`. Keeping
	 * one newline per block preserves the document's structure for chunking at a
	 * cost of a single byte per block.
	 *
	 * Link targets, image alt text and image sources are carried over as text
	 * before the tags go, so an agent can still cite a source, describe an image
	 * or point at one.
	 *
	 * @param string $raw Raw post_content.
	 * @return string Plain-text content, capped to MAX_CONTENT_BYTES once encoded.
	 */
	private static function prepare_content( string $raw ): string {
		// Gutenberg delimiters become line breaks, so blocks whose markup is
		// self-closing (separators, images, embeds) still separate their neighbours.
		$text = self::replace_or_keep( '/<!--\s*\/?wp:.*?-->/s', "\n", $raw );

		// Images run before links so a linked image keeps its own text rather
		// than reducing to nothing.
		$text = self::replace_images_with_text( $text );
		$text = self::append_link_targets( $text );

		// Same for block-level HTML, which covers classic content and any markup
		// authored inside a block. Both ends of the tag, so text that abuts an
		// opening tag — an image's alt text before a paragraph, say — is broken
		// off too. Runs of line breaks collapse below.
		$text = self::replace_or_keep( '#<br\s*/?>|</?(?:p|div|li|h[1-6]|tr|td|th|dt|dd|pre|section|article|aside|header|footer|blockquote|figure|figcaption)\b[^>]*>#i', "\n", $text );

		// Removes the remaining tags plus the contents of script/style and any
		// inline SVG's markup.
		$text = wp_strip_all_tags( $text );

		// Decoding last, so markup an author escaped to write *about* it survives
		// as the text a reader sees. Decoding first would hand `&lt;script&gt;x&lt;/script&gt;`
		// to wp_strip_all_tags, which drops script contents, and the sample would
		// vanish from the index. The cap runs after either way, so this only
		// affects what gets indexed, never the request size.
		$text = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );

		// Collapse spacing runs, but keep the line breaks added above.
		$text = self::replace_or_keep( '/[^\S\n]+/u', ' ', $text );
		$text = trim( self::replace_or_keep( '/\s*\n\s*/u', "\n", $text ) );

		return self::cap_encoded_size( $text );
	}

	/**
	 * Replace each `<img>` with its alt text and source, as `alt (image: src)`.
	 *
	 * Stripping the tag outright loses the only readable description of the
	 * image, and an image that is a block's whole content (a linked thumbnail,
	 * say) would leave nothing behind at all. The source rides along for the same
	 * reason link targets do: an image an agent cannot address is an image it can
	 * never show. Labelled, so it reads as an image rather than a page — the file
	 * extension isn't a reliable tell on a CDN URL.
	 *
	 * Padding with spaces keeps the text from fusing with the words either side;
	 * the later whitespace pass collapses the padding.
	 *
	 * @param string $html Post content.
	 * @return string Content with images reduced to text.
	 */
	private static function replace_images_with_text( string $html ): string {
		return self::replace_callback_or_keep(
			'/<img\b[^>]*>/i',
			static function ( array $img ): string {
				$alt = self::get_attribute( $img[0], 'alt' );
				$src = self::get_attribute( $img[0], 'src' );

				// Inline base64 images address nothing and would spend the whole
				// content budget on one image.
				if ( 0 === stripos( $src, 'data:' ) ) {
					$src = '';
				}

				$parts = array_filter( [ $alt, '' === $src ? '' : '(image: ' . $src . ')' ] );

				return [] === $parts ? '' : ' ' . implode( ' ', $parts ) . ' ';
			},
			$html
		);
	}

	/**
	 * Append each link's target to its text, as `text (url)`.
	 *
	 * Link text alone tells an agent that a source exists but not where it is,
	 * so the target rides along in the text where retrieval can surface it.
	 *
	 * @param string $html Post content.
	 * @return string Content with link targets inlined.
	 */
	private static function append_link_targets( string $html ): string {
		return self::replace_callback_or_keep(
			'#<a\b([^>]*)>(.*?)</a>#is',
			static function ( array $link ): string {
				$href = self::get_attribute( $link[1], 'href' );
				$text = $link[2];

				// Skip in-page anchors, which point nowhere outside the post, and
				// links whose text is already the URL, which need no repeat.
				if ( '' === $href || '#' === $href[0] || trim( wp_strip_all_tags( $text ) ) === $href ) {
					return $text;
				}

				return $text . ' (' . $href . ')';
			},
			$html
		);
	}

	/**
	 * Read a quoted attribute value out of a tag.
	 *
	 * Quoted values only: that is what the block editor, the classic editor and
	 * kses all emit. $name is a literal from this class, never user input.
	 *
	 * @param string $tag  Tag markup, or the attribute section of one.
	 * @param string $name Attribute name.
	 * @return string Attribute value, or '' when absent.
	 */
	private static function get_attribute( string $tag, string $name ): string {
		if ( 1 !== preg_match( '/\b' . $name . '\s*=\s*("|\')(.*?)\1/is', $tag, $match ) ) {
			return '';
		}

		return trim( $match[2] );
	}

	/**
	 * Trim text until its JSON-encoded form fits MAX_CONTENT_BYTES.
	 *
	 * Escaping is uneven — an ASCII byte encodes to one byte, a CJK character to
	 * six, an emoji to twelve — so there's no fixed ratio to divide by. Scale the
	 * cut by the inflation we actually measured and re-check. Every pass strictly
	 * shortens the string, so this terminates, and in practice settles in one or
	 * two passes.
	 *
	 * @param string $text Plain-text content.
	 * @return string Content whose encoded length is within MAX_CONTENT_BYTES.
	 */
	private static function cap_encoded_size( string $text ): string {
		$encoded = self::encoded_length( $text );

		while ( '' !== $text && $encoded > self::MAX_CONTENT_BYTES ) {
			$target = (int) floor( strlen( $text ) * ( self::MAX_CONTENT_BYTES / $encoded ) );

			// Never let a rounding artefact stall the loop.
			$target = min( $target, strlen( $text ) - 1 );
			$text   = $target > 0 ? self::cut_bytes( $text, $target ) : '';

			$encoded = self::encoded_length( $text );
		}

		return $text;
	}

	/**
	 * Byte length of a string once JSON-encoded, excluding its quotes.
	 *
	 * @param string $text Text to measure.
	 * @return int Encoded byte length.
	 */
	private static function encoded_length( string $text ): int {
		$json = wp_json_encode( $text );

		// Invalid UTF-8 can't be encoded at all. Assume the worst case so the cap
		// still errs towards trimming rather than shipping something unbounded.
		return false === $json ? strlen( $text ) * 6 : strlen( $json ) - 2;
	}

	/**
	 * Cut a string to at most $bytes bytes.
	 *
	 * mb_strcut trims on a byte boundary without splitting a multibyte character;
	 * fall back to substr if mbstring is unavailable (byte-exact, may split a
	 * trailing multibyte char).
	 *
	 * @param string $text  Text to cut.
	 * @param int    $bytes Maximum byte length.
	 * @return string The cut string.
	 */
	private static function cut_bytes( string $text, int $bytes ): string {
		return function_exists( 'mb_strcut' )
			? mb_strcut( $text, 0, $bytes, 'UTF-8' )
			: substr( $text, 0, $bytes );
	}

	/**
	 * Run preg_replace, keeping the subject when the pattern fails.
	 *
	 * preg_replace returns null on a PCRE error — a backtrack or recursion limit
	 * on a very large input, or invalid UTF-8 under the /u modifier. Casting that
	 * to a string would silently ingest blank content, so keep what we had.
	 *
	 * @param string $pattern     Pattern to match.
	 * @param string $replacement Replacement string.
	 * @param string $subject     Subject to search.
	 * @return string Replaced subject, or the original subject on a PCRE error.
	 */
	private static function replace_or_keep( string $pattern, string $replacement, string $subject ): string {
		$result = preg_replace( $pattern, $replacement, $subject );

		return is_string( $result ) ? $result : $subject;
	}

	/**
	 * Run preg_replace_callback, keeping the subject when the pattern fails.
	 *
	 * Same guard as replace_or_keep: a PCRE error returns null, and casting that
	 * to a string would blank the content.
	 *
	 * @param string   $pattern  Pattern to match.
	 * @param callable $callback Replacement callback.
	 * @param string   $subject  Subject to search.
	 * @return string Replaced subject, or the original subject on a PCRE error.
	 */
	private static function replace_callback_or_keep( string $pattern, callable $callback, string $subject ): string {
		$result = preg_replace_callback( $pattern, $callback, $subject );

		return is_string( $result ) ? $result : $subject;
	}

	/**
	 * Format a WordPress date string to ISO 8601 format.
	 *
	 * @param string $date WordPress date string (Y-m-d H:i:s format).
	 * @return string ISO 8601 formatted date.
	 */
	private static function format_date( string $date ): string {
		$datetime = \DateTime::createFromFormat( 'Y-m-d H:i:s', $date, new \DateTimeZone( 'UTC' ) );
		if ( false === $datetime ) {
			return '';
		}
		return $datetime->format( 'c' );
	}

	/**
	 * Get comma-separated category names for a post.
	 *
	 * @param int $post_id Post ID.
	 * @return string Comma-separated category names.
	 */
	private static function get_categories( int $post_id ): string {
		$categories = get_the_category( $post_id );
		if ( empty( $categories ) || is_wp_error( $categories ) ) {
			return '';
		}
		return implode( ', ', wp_list_pluck( $categories, 'name' ) );
	}

	/**
	 * Get comma-separated tag names for a post.
	 *
	 * @param int $post_id Post ID.
	 * @return string Comma-separated tag names.
	 */
	private static function get_tags( int $post_id ): string {
		$tags = get_the_tags( $post_id );
		if ( empty( $tags ) || is_wp_error( $tags ) ) {
			return '';
		}
		return implode( ', ', wp_list_pluck( $tags, 'name' ) );
	}

	/**
	 * Get the display name for an author.
	 *
	 * @param int|string $author_id Author user ID.
	 * @return string Author display name.
	 */
	private static function get_author_name( $author_id ): string {
		$author = get_userdata( (int) $author_id );
		if ( false === $author ) {
			return '';
		}
		return $author->display_name;
	}
}

Default_Transformer::init();
