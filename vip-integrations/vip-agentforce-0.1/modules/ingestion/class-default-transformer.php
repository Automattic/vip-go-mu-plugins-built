<?php
/**
 * Default post transformer for ingestion.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

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

		$site_id = defined( 'VIP_GO_APP_ID' ) ? (string) VIP_GO_APP_ID : '0';
		$blog_id = (string) get_current_blog_id();
		$post_id = (string) $post->ID;

		$site_id_blog_id         = $site_id . '_' . $blog_id;
		$site_id_blog_id_post_id = $site_id_blog_id . '_' . $post_id;

		return new Ingestion_Post_Record(
			[
				'site_id'                 => $site_id,
				'blog_id'                 => $blog_id,
				'post_id'                 => $post_id,
				'site_id_blog_id'         => $site_id_blog_id,
				'site_id_blog_id_post_id' => $site_id_blog_id_post_id,
				'published'               => 'publish' === $post->post_status,
				'last_published_at'       => self::format_date( $post->post_date_gmt ),
				'last_modified_at'        => self::format_date( $post->post_modified_gmt ),
				'title'                   => $post->post_title,
				'content'                 => $post->post_content,
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
