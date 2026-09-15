<?php
/**
 * Shortcode ID Rewriter class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Content;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rewrites source attachment IDs referenced inside shortcode attributes.
 *
 * The URL rewrite pipeline handles `<img src>` but not shortcode attrs, so
 * source IDs would otherwise leak through to dest and render against the wrong
 * (or no) attachment.
 *
 * Three families, resolved differently:
 *  - Caption (`[caption]`, `[wp_caption]`): The embedded `<img>` gives an
 *    `attachment_url_to_postid()` lookup target.
 *  - Gallery/playlist attachment lists (`ids`, `include`, `exclude`): Bare
 *    source attachment IDs with no embedded URL, resolved through an injected
 *    source-ID => dest-ID callable that sideloads the referenced media.
 *  - Gallery/playlist post reference (the singular `id`): A source POST whose
 *    attached media the shortcode renders, remapped to its destination post, or
 *    stripped when it names the importing post's own set.
 */
class Shortcode_ID_Rewriter {

	/**
	 * URL => attachment ID lookup. Defaults to WordPress' built-in
	 * attachment_url_to_postid(); tests inject a stub.
	 *
	 * @var callable
	 */
	private $url_to_id_lookup;

	/**
	 * Constructor.
	 *
	 * @param callable|null $url_to_id_lookup URL => attachment ID resolver,
	 *                                        or null for the WP default.
	 */
	public function __construct( ?callable $url_to_id_lookup = null ) {
		$this->url_to_id_lookup = $url_to_id_lookup ?? 'attachment_url_to_postid';
	}

	/**
	 * Rewrites every `[caption id="attachment_N"]<img ...>` so N becomes the
	 * dest attachment ID resolved from the embedded img's src. Captions
	 * whose img doesn't resolve (third-party, sideload failure,
	 * intermediate-size URL) are left unchanged.
	 *
	 * Assumes URL rewriting already ran — the img src is the dest URL by
	 * the time this regex sees it.
	 *
	 * @param string $content Post content with caption shortcodes.
	 * @return string Content with caption IDs rewritten.
	 */
	public function rewrite_caption_ids( string $content ): string {
		if ( '' === $content
			|| ( false === stripos( $content, '[caption' )
				&& false === stripos( $content, '[wp_caption' ) )
		) {
			return $content;
		}

		$result = preg_replace_callback(
			'#\[(caption|wp_caption)\b([^\]]*)\](.*?)\[/\1\]#is',
			array( $this, 'rewrite_caption_match' ),
			$content
		);

		return is_string( $result ) ? $result : $content;
	}

	/**
	 * Handler for a single caption-shortcode regex match.
	 *
	 * @param array<int, string> $matches Regex captures: [full, tag, attrs, body].
	 * @return string Rewritten match, or the original if no rewrite applies.
	 */
	private function rewrite_caption_match( array $matches ): string {
		$tag   = $matches[1];
		$attrs = $matches[2];
		$body  = $matches[3];

		if ( 1 !== preg_match(
			'/<img\b[^>]*\bsrc\s*=\s*(["\'])([^"\']+)\1/i',
			$body,
			$img_match
		) ) {
			return $matches[0];
		}

		$attachment_id = (int) call_user_func(
			$this->url_to_id_lookup,
			$img_match[2]
		);
		if ( $attachment_id <= 0 ) {
			return $matches[0];
		}

		$new_attrs = preg_replace(
			'/(?<![\w-])(id\s*=\s*["\']attachment_)\d+(["\'])/i',
			'${1}' . $attachment_id . '${2}',
			$attrs,
			1
		);

		if ( ! is_string( $new_attrs ) || $new_attrs === $attrs ) {
			return $matches[0];
		}

		return '[' . $tag . $new_attrs . ']' . $body . '[/' . $tag . ']';
	}

	/**
	 * Rewrites the source attachment IDs in `[gallery]` and `[playlist]`
	 * shortcodes to their destination IDs, resolving each through $resolver.
	 *
	 * Only the CSV values of the `ids`, `include`, and `exclude` attributes are
	 * touched; order, whitespace, quoting, and every other byte are preserved.
	 * A token the resolver cannot map (it returns 0) is left in place. Each
	 * distinct source ID is resolved once per run.
	 *
	 * @param string   $content  Post content with gallery/playlist shortcodes.
	 * @param callable $resolver Source attachment ID => dest attachment ID, or 0
	 *                           when unresolved.
	 * @return string Content with the shortcode IDs rewritten.
	 */
	public function rewrite_media_shortcode_ids(
		string $content,
		callable $resolver
	): string {
		if ( '' === $content
			|| ( false === stripos( $content, '[gallery' )
				&& false === stripos( $content, '[playlist' ) )
		) {
			return $content;
		}

		$memo = array();

		$result = preg_replace_callback(
			'/' . get_shortcode_regex( array( 'gallery', 'playlist' ) ) . '/s',
			function ( array $matches ) use ( $resolver, &$memo ): string {
				// Escaped shortcode ([[gallery ...]]): Leave the literal alone.
				if ( '[' === $matches[1] && ']' === $matches[6] ) {
					return $matches[0];
				}

				$attrs     = $matches[3];
				$new_attrs = $this->rewrite_id_attr_csvs(
					$attrs,
					$resolver,
					$memo
				);

				if ( $new_attrs === $attrs ) {
					return $matches[0];
				}

				// Splice the rewritten attributes back in at their known offset
				// (after the opening bracket, escape char, and tag name),
				// leaving the rest of the match byte-for-byte.
				$attrs_offset = 1 + strlen( $matches[1] ) + strlen( $matches[2] );

				return substr_replace(
					$matches[0],
					$new_attrs,
					$attrs_offset,
					strlen( $attrs )
				);
			},
			$content
		);

		return is_string( $result ) ? $result : $content;
	}

	/**
	 * Rewrites the CSV values of the id-bearing shortcode attributes (`ids`,
	 * `include`, `exclude`) within a shortcode's attribute string, preserving
	 * the attribute name, separator, and quoting.
	 *
	 * Matches the quoted and unquoted attribute forms WordPress' shortcode
	 * parser accepts, not quoted-only.
	 *
	 * @param string          $attrs    Shortcode attribute string.
	 * @param callable        $resolver Source ID => dest ID resolver.
	 * @param array<int, int> $memo     Source ID => resolved dest ID cache.
	 * @return string Attribute string with the id CSVs rewritten.
	 */
	private function rewrite_id_attr_csvs(
		string $attrs,
		callable $resolver,
		array &$memo
	): string {
		// Bare values end at whitespace; get_shortcode_regex() already stripped
		// any `]` from $attrs.
		$pattern = '/(?<![\w-])((?:ids|include|exclude)\s*=\s*)'
			. '(?:"([^"]*)"|\'([^\']*)\'|([^\s\]]+))/i';

		$result = preg_replace_callback(
			$pattern,
			function ( array $matches ) use ( $resolver, &$memo ): string {
				if ( isset( $matches[2] ) && '' !== $matches[2] ) {
					$csv   = $matches[2];
					$quote = '"';
				} elseif ( isset( $matches[3] ) && '' !== $matches[3] ) {
					$csv   = $matches[3];
					$quote = "'";
				} elseif ( isset( $matches[4] ) && '' !== $matches[4] ) {
					$csv   = $matches[4];
					$quote = '';
				} else {
					return $matches[0];
				}

				return $matches[1] . $quote
					. $this->rewrite_csv_ids( $csv, $resolver, $memo )
					. $quote;
			},
			$attrs
		);

		return is_string( $result ) ? $result : $attrs;
	}

	/**
	 * Rewrites each purely numeric token in a comma-separated ID list to its
	 * resolved destination ID, leaving separators, whitespace, and any
	 * non-numeric or unresolved token untouched.
	 *
	 * @param string          $csv      Comma-separated attachment ID list.
	 * @param callable        $resolver Source ID => dest ID resolver.
	 * @param array<int, int> $memo     Source ID => resolved dest ID cache.
	 * @return string The rewritten list.
	 */
	private function rewrite_csv_ids(
		string $csv,
		callable $resolver,
		array &$memo
	): string {
		$tokens = explode( ',', $csv );

		foreach ( $tokens as $index => $token ) {
			if ( 1 !== preg_match( '/^(\s*)(\d+)(\s*)$/', $token, $parts ) ) {
				continue;
			}

			$source_id = (int) $parts[2];

			if ( ! isset( $memo[ $source_id ] ) ) {
				$memo[ $source_id ] = (int) call_user_func( $resolver, $source_id );
			}

			if ( $memo[ $source_id ] > 0 ) {
				$tokens[ $index ] = $parts[1] . $memo[ $source_id ] . $parts[3];
			}
		}

		return implode( ',', $tokens );
	}

	/**
	 * Collects the attachment IDs a content's gallery and playlist shortcodes
	 * reference through their ids and include attributes.
	 *
	 * The `exclude` attribute is omitted: It removes an attachment from the
	 * rendered set rather than referencing it.
	 *
	 * @param string $content Content to scan.
	 * @return int[] Referenced attachment IDs, deduplicated.
	 */
	public function collect_shortcode_attachment_ids( string $content ): array {
		if ( '' === $content
			|| ( false === stripos( $content, '[gallery' )
				&& false === stripos( $content, '[playlist' ) )
		) {
			return array();
		}

		if ( false === preg_match_all(
			'/' . get_shortcode_regex( array( 'gallery', 'playlist' ) ) . '/s',
			$content,
			$shortcodes,
			PREG_SET_ORDER
		) ) {
			return array();
		}

		$ids = array();

		foreach ( $shortcodes as $shortcode ) {
			// Escaped shortcode ([[gallery ...]]): Not rendered, so skip.
			if ( '[' === $shortcode[1] && ']' === $shortcode[6] ) {
				continue;
			}

			$this->collect_id_attr_csvs( $shortcode[3], $ids );
		}

		return array_values( array_unique( $ids ) );
	}

	/**
	 * Extracts the numeric tokens from the ids and include attribute CSVs
	 * within a shortcode's attribute string.
	 *
	 * @param string $attrs Shortcode attribute string.
	 * @param int[]  $ids   Collected IDs, appended to by reference.
	 */
	private function collect_id_attr_csvs( string $attrs, array &$ids ): void {
		$pattern = '/(?<![\w-])(?:ids|include)\s*=\s*'
			. '(?:"([^"]*)"|\'([^\']*)\'|([^\s\]]+))/i';

		if ( 1 > preg_match_all( $pattern, $attrs, $selectors, PREG_SET_ORDER ) ) {
			return;
		}

		foreach ( $selectors as $selector ) {
			$csv = $selector[1];
			if ( '' === $csv && isset( $selector[2] ) ) {
				$csv = $selector[2];
			}
			if ( '' === $csv && isset( $selector[3] ) ) {
				$csv = $selector[3];
			}

			foreach ( explode( ',', $csv ) as $token ) {
				$token = trim( $token );
				if ( '' !== $token && ctype_digit( $token ) ) {
					$ids[] = (int) $token;
				}
			}
		}
	}

	/**
	 * Remaps the singular gallery/playlist `id` post reference to its
	 * destination, or strips it when it names the importing post's own set.
	 *
	 * `[gallery id="B"]` renders another post B's attached media. A cross-post
	 * reference is resolved through $resolver and rewritten in place; an
	 * unresolvable id (resolver returns 0) is left for a later retry. An id
	 * equal to $self_source_id is stripped so core's current-post default
	 * renders the imported attached set. The `ids`/`include`/`exclude`
	 * attachment lists are left to rewrite_media_shortcode_ids().
	 *
	 * @param string   $content        Post content with gallery/playlist shortcodes.
	 * @param callable $resolver       Source post ID => dest post ID, or 0 when
	 *                                 unresolved.
	 * @param int      $self_source_id Importing post's source ID; an id equal to it
	 *                                 is stripped, not remapped.
	 * @return string Content with the singular id references rewritten.
	 */
	public function rewrite_gallery_post_reference(
		string $content,
		callable $resolver,
		int $self_source_id
	): string {
		if ( '' === $content
			|| ( false === stripos( $content, '[gallery' )
				&& false === stripos( $content, '[playlist' ) )
		) {
			return $content;
		}

		$memo = array();

		$result = preg_replace_callback(
			'/' . get_shortcode_regex( array( 'gallery', 'playlist' ) ) . '/s',
			function ( array $matches ) use ( $resolver, $self_source_id, &$memo ): string {
				// Escaped shortcode ([[gallery ...]]): Leave the literal alone.
				if ( '[' === $matches[1] && ']' === $matches[6] ) {
					return $matches[0];
				}

				$attrs = $matches[3];

				// Core ignores the singular id when an ids/include selector is
				// present, so a post reference there is inert.
				if ( self::has_id_list_selector( $attrs ) ) {
					return $matches[0];
				}

				$new_attrs = $this->rewrite_id_attr(
					$attrs,
					$resolver,
					$self_source_id,
					$memo
				);

				if ( $new_attrs === $attrs ) {
					return $matches[0];
				}

				// Splice the rewritten attrs back at their offset (after the
				// bracket, escape char, and tag name), rest byte-for-byte.
				$attrs_offset = 1 + strlen( $matches[1] ) + strlen( $matches[2] );

				return substr_replace(
					$matches[0],
					$new_attrs,
					$attrs_offset,
					strlen( $attrs )
				);
			},
			$content
		);

		return is_string( $result ) ? $result : $content;
	}

	/**
	 * Extracts the cross-post gallery/playlist references a post renders: Each
	 * live [gallery id="B"]/[playlist id="B"] whose singular id names another
	 * post (not self) and carries no ids/include/exclude selector.
	 *
	 * Escaped literals, self references, and selector-bearing shortcodes are
	 * skipped, matching rewrite_gallery_post_reference.
	 *
	 * @param string $content        Post content to scan.
	 * @param int    $self_source_id Importing post's source ID; a matching id is
	 *                               its own set, not a cross-post reference.
	 * @return list<array{tag: string, type: string, source_id: int}> References.
	 */
	public function collect_cross_post_references(
		string $content,
		int $self_source_id
	): array {
		if ( '' === $content
			|| ( false === stripos( $content, '[gallery' )
				&& false === stripos( $content, '[playlist' ) )
		) {
			return array();
		}

		$count = preg_match_all(
			'/' . get_shortcode_regex( array( 'gallery', 'playlist' ) ) . '/s',
			$content,
			$matches,
			PREG_SET_ORDER
		);

		if ( ! is_int( $count ) || 0 === $count ) {
			return array();
		}

		$refs = array();

		foreach ( $matches as $match ) {
			// Escaped [[gallery]] literal, not a live shortcode.
			if ( '[' === $match[1] && ']' === ( $match[6] ?? '' ) ) {
				continue;
			}

			$attrs = $match[3];

			// Core ignores the singular id when an ids/include selector is set.
			if ( self::has_id_list_selector( $attrs ) ) {
				continue;
			}

			$source_id = self::singular_id_value( $attrs );

			if ( $source_id <= 0 || $source_id === $self_source_id ) {
				continue;
			}

			$refs[] = array(
				'tag'       => $match[2],
				'type'      => 'playlist' === $match[2]
					? self::attr_value( $attrs, 'type' )
					: '',
				'source_id' => $source_id,
			);
		}

		return $refs;
	}

	/**
	 * Returns the numeric singular `id` attribute value, or 0 when absent or
	 * not a bare integer. Matches the id form rewrite_id_attr rewrites.
	 *
	 * @param string $attrs Shortcode attribute string.
	 * @return int Positive source post ID, or 0.
	 */
	private static function singular_id_value( string $attrs ): int {
		if ( 1 !== preg_match(
			'/(?<![\w-])id\s*=\s*(?:"(\d+)"|\'(\d+)\'|(\d+)(?![\w-]))/i',
			$attrs,
			$m
		) ) {
			return 0;
		}

		return (int) ( ( $m[1] ?? '' ) . ( $m[2] ?? '' ) . ( $m[3] ?? '' ) );
	}

	/**
	 * Returns a shortcode attribute value across the quoted and unquoted forms
	 * WordPress' parser accepts, or '' when absent.
	 *
	 * @param string $attrs Shortcode attribute string.
	 * @param string $name  Attribute name.
	 * @return string Attribute value, or ''.
	 */
	private static function attr_value( string $attrs, string $name ): string {
		$pattern = '/(?<![\w-])' . preg_quote( $name, '/' )
			. '\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s\]]+))/i';

		if ( 1 !== preg_match( $pattern, $attrs, $m ) ) {
			return '';
		}

		return ( $m[1] ?? '' ) . ( $m[2] ?? '' ) . ( $m[3] ?? '' );
	}

	/**
	 * Rewrites or strips the singular `id` attribute in a shortcode's attribute
	 * string. A self reference is stripped with its leading whitespace; another
	 * post's id is resolved and rewritten in place, preserving quoting; an
	 * unresolvable id is left untouched.
	 *
	 * @param string          $attrs          Shortcode attribute string.
	 * @param callable        $resolver       Source post ID => dest post ID.
	 * @param int             $self_source_id Importing post's own source ID.
	 * @param array<int, int> $memo           Source ID => resolved dest ID cache.
	 * @return string Attribute string with the id reference rewritten or stripped.
	 */
	private function rewrite_id_attr(
		string $attrs,
		callable $resolver,
		int $self_source_id,
		array &$memo
	): string {
		$pattern = '/(\s*)(?<![\w-])(id\s*=\s*)(?:"(\d+)"|\'(\d+)\'|(\d+)(?![\w-]))/i';

		$result = preg_replace_callback(
			$pattern,
			function ( array $matches ) use ( $resolver, $self_source_id, &$memo ): string {
				if ( isset( $matches[3] ) && '' !== $matches[3] ) {
					$source_id = (int) $matches[3];
					$quote     = '"';
				} elseif ( isset( $matches[4] ) && '' !== $matches[4] ) {
					$source_id = (int) $matches[4];
					$quote     = "'";
				} elseif ( isset( $matches[5] ) && '' !== $matches[5] ) {
					$source_id = (int) $matches[5];
					$quote     = '';
				} else {
					return $matches[0];
				}

				if ( $source_id <= 0 ) {
					return $matches[0];
				}

				// Self reference: Strip the redundant id so core's current-post
				// default renders the imported attached set.
				if ( $source_id === $self_source_id ) {
					return '';
				}

				if ( ! isset( $memo[ $source_id ] ) ) {
					$memo[ $source_id ] = (int) call_user_func( $resolver, $source_id );
				}

				if ( $memo[ $source_id ] <= 0 ) {
					return $matches[0];
				}

				return $matches[1] . $matches[2] . $quote . $memo[ $source_id ] . $quote;
			},
			$attrs,
			1
		);

		return is_string( $result ) ? $result : $attrs;
	}

	/**
	 * Whether the attributes carry a non-empty ids or include selector, which
	 * makes core render that explicit set and ignore the singular id. Mirrors
	 * core's ! empty() gate; exclude is not gated, as core still honors id in
	 * the exclude branch.
	 *
	 * @param string $attrs Shortcode attribute string.
	 * @return bool True when ids or include selects an explicit set.
	 */
	private static function has_id_list_selector( string $attrs ): bool {
		$count = preg_match_all(
			'/(?<![\w-])(?:ids|include)\s*=\s*'
				. '(?:"([^"]*)"|\'([^\']*)\'|([^\s\]]+))/i',
			$attrs,
			$matches,
			PREG_SET_ORDER
		);

		if ( ! is_int( $count ) || 0 === $count ) {
			return false;
		}

		foreach ( $matches as $match ) {
			$value = ( $match[1] ?? '' ) . ( $match[2] ?? '' ) . ( $match[3] ?? '' );
			if ( '' !== $value && '0' !== $value ) {
				return true;
			}
		}

		return false;
	}
}
