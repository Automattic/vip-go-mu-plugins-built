<?php

/**
 * YAML frontmatter generation for markdown output.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Generates YAML frontmatter with post metadata.
 *
 * @package Content_For_Agents
 */
class Frontmatter {

	/**
	 * Build YAML frontmatter for a post.
	 *
	 * @param int|WP_Post $post   Post ID or post object.
	 * @param string      $markdown Optional. Markdown body for description fallback.
	 * @return string YAML frontmatter (including --- delimiters).
	 */
	public function build( $post, $markdown = '' ) {
		$post = get_post( $post );
		if ( ! $post ) {
			return "---\n---\n\n";
		}

		$data = array(
			'title'       => $this->get_title( $post ),
			'description' => $this->get_description( $post, $markdown ),
			'date'        => get_the_date( 'Y-m-d', $post ),
			'authors'     => $this->get_authors( $post ),
			'url'         => get_permalink( $post ),
			'categories'  => $this->get_categories( $post ),
			'tags'        => $this->get_tags( $post ),
		);

		$data = apply_filters( 'content_for_agents_frontmatter', $data, $post );

		// Remove empty values.
		$data = array_filter( $data, fn( $v ) => '' !== $v && array() !== $v && null !== $v );

		$yaml = $this->to_yaml( $data );
		return "---\n" . $yaml . "---\n\n";
	}

	/**
	 * Get post title.
	 *
	 * @param WP_Post $post Post object.
	 * @return string
	 */
	protected function get_title( $post ) {
		return html_entity_decode( get_the_title( $post ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	/**
	 * Get description (excerpt or first paragraph of markdown).
	 *
	 * @param WP_Post $post    Post object.
	 * @param string  $markdown Markdown body.
	 * @return string
	 */
	protected function get_description( $post, $markdown = '' ) {
		$excerpt = get_the_excerpt( $post );
		if ( $excerpt ) {
			return html_entity_decode( wp_strip_all_tags( $excerpt ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		}
		if ( $markdown ) {
			$first = preg_split( "/\n\n+/", trim( $markdown ), 2 );
			if ( ! empty( $first[0] ) ) {
				return html_entity_decode( wp_trim_words( $first[0], 40 ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
			}
		}
		return '';
	}

	/**
	 * Get authors for the post.
	 *
	 * @param WP_Post $post Post object.
	 * @return array List of author entries.
	 */
	protected function get_authors( $post ) {
		$authors = array();

		// Filters are expected to return arrays of entries with at minimum a `name`
		// key, and optionally `job_title` and `link` (e.g. from an author plugin).
		$bylines = apply_filters( 'content_for_agents_authors', array(), $post );
		if ( ! empty( $bylines ) ) {
			foreach ( $bylines as $byline ) {
				if ( is_string( $byline ) ) {
					$authors[] = array( 'name' => $byline );
					continue;
				}

				$entry = array( 'name' => $byline['name'] ?? '' );

				foreach ( array( 'job_title', 'link' ) as $field ) {
					if ( ! empty( $byline[ $field ] ) ) {
						$entry[ $field ] = $byline[ $field ];
					}
				}

				$authors[] = $entry;
			}
		}

		if ( empty( $authors ) ) {
			$author = get_user_by( 'id', $post->post_author );
			$name   = $author ? $author->display_name : '';
			if ( $name ) {
				$authors[] = array( 'name' => $name );
			} else {
				$authors[] = array( 'name' => html_entity_decode( get_bloginfo( 'name' ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
			}
		}

		return $authors;
	}

	/**
	 * Get categories for the post.
	 *
	 * @param WP_Post $post Post object.
	 * @return array Category names.
	 */
	protected function get_categories( $post ) {
		$terms = get_the_category( $post->ID );
		return array_map( fn( $t ) => html_entity_decode( $t->name, ENT_QUOTES | ENT_HTML5, 'UTF-8' ), false === $terms ? array() : $terms );
	}

	/**
	 * Get tags for the post.
	 *
	 * @param WP_Post $post Post object.
	 * @return array Tag names.
	 */
	protected function get_tags( $post ) {
		$terms = get_the_tags( $post->ID );
		return array_map( fn( $t ) => html_entity_decode( $t->name, ENT_QUOTES | ENT_HTML5, 'UTF-8' ), false === $terms ? array() : $terms );
	}

	/**
	 * Serialize metadata as YAML mappings, lists and scalar values.
	 *
	 * Quoted JSON strings are also valid YAML strings. Using the core encoder
	 * preserves newlines, control characters and string types without a library.
	 * Objects, resources and excessive nesting are outside this filter contract.
	 *
	 * @param array $data Metadata mapping or list.
	 * @param int   $depth Current nesting depth.
	 * @return string YAML with a trailing newline.
	 * @throws \InvalidArgumentException For unsupported metadata values.
	 */
	protected function to_yaml( $data, int $depth = 0 ) {
		if ( $depth > 32 ) {
			throw new \InvalidArgumentException( 'Frontmatter nesting exceeds 32 levels.' );
		}
		$lines = array();
		$list  = array_is_list( $data );
		foreach ( $data as $key => $value ) {
			$prefix = $list ? '-' : $this->encode_yaml_scalar( (string) $key ) . ':';
			if ( is_array( $value ) && array() !== $value ) {
				$nested  = rtrim( $this->to_yaml( $value, $depth + 1 ), "\n" );
				$lines[] = $prefix . "\n  " . str_replace( "\n", "\n  ", $nested );
				continue;
			}
			if ( ! is_scalar( $value ) && null !== $value && array() !== $value ) {
				throw new \InvalidArgumentException( 'Frontmatter values must be scalars, null, or arrays.' );
			}
			$encoded = $this->encode_yaml_scalar( $value );
			$lines[] = $prefix . ' ' . $encoded;
		}
		return implode( "\n", $lines ) . "\n";
	}
	/** Encode YAML scalars without JSON surrogate pairs or literal C1 controls. */
	private function encode_yaml_scalar( $value ): string {
		$encoded = wp_json_encode( $value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		if ( false === $encoded ) {
			throw new \InvalidArgumentException( 'Frontmatter contains a value that cannot be encoded.' );
		}
		return preg_replace_callback(
			'/[\x{007f}-\x{009f}]/u',
			static function ( $matches ) {
				return "\x7f" === $matches[0] ? '\u007f' : substr( wp_json_encode( $matches[0] ), 1, -1 );
			},
			$encoded
		);
	}
}
