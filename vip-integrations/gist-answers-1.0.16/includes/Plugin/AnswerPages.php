<?php
/**
 * Answer pages tracking class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Plugin;

use WP_Query;

use GistAnswers\Admin\AdminMain;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Answer pages tracking class for the Gist Answers plugin.
 */
final class AnswerPages {

	private const ANSWER_PAGE_CREATION_ERRORS_TRANSIENT = 'gist_answers_create_answer_page_errors';
	private const ANSWER_PAGE_ADDITION_ERRORS_TRANSIENT = 'gist_answers_add_answer_page_errors';

	// Every transient this class sets (on each site, and network-wide on multisite), for the Danger Zone to delete.
	public const TRANSIENT_NAMES = array(
		self::ANSWER_PAGE_CREATION_ERRORS_TRANSIENT,
		self::ANSWER_PAGE_ADDITION_ERRORS_TRANSIENT,
	);

	private const HIDE_UNKNOWN_ITEMS = false;

	private const CONTENT_SUBSTRING_BATCH_SIZE = 100;

	/**
	 * Get the list of Answer Pages detected and stored by the plugin.
	 *
	 * @return array<object> Array of answer page objects.
	 */
	public static function get_detected(): array {

		$output = array();

		$flagged_post_ids = AdminMain::get_flagged_post_ids();

		foreach ( $flagged_post_ids as $post_id ) {

			$permalink = get_permalink( $post_id );

			$output[] = (object) array(
				'post_id'      => $post_id,
				'post_type'    => get_post_type( $post_id ),
				'post_title'   => get_the_title( $post_id ),
				'post_status'  => get_post_status( $post_id ),
				'source'       => AdminMain::get_flagged_post_source( $post_id ),
				'post_url'     => $permalink,
				'edit_url'     => get_edit_post_link( $post_id ),
				'relative_url' => untrailingslashit( wp_make_link_relative( $permalink ) ),
			);
		}

		$valid_post_types    = AdminMain::get_answer_page_types();
		$valid_post_statuses = AdminMain::get_answer_page_statuses();

		$output = array_filter(
			$output,
			function ( $item ) use ( $valid_post_types, $valid_post_statuses ) {
				return in_array( $item->post_type, $valid_post_types, true ) &&
					in_array( $item->post_status, $valid_post_statuses, true ) &&
					( ! self::HIDE_UNKNOWN_ITEMS || 'unknown' !== ( $item->source ?? null ) );
			},
		);

		usort(
			$output,
			function ( $a, $b ) {
				return $a->post_id <=> $b->post_id;
			},
		);

		return $output;
	}

	/**
	 * Store answer page creation errors as a transient for the next page load.
	 *
	 * @param array<object> $errors        Array of answer page creation error messages.
	 * @param object        $creation_data Object containing answer page creation data for the site.
	 *
	 * @return void
	 */
	public static function store_answer_page_creation_errors( array $errors, object $creation_data ): void {

		$output = (object) array(
			'errors' => $errors,
			'data'   => $creation_data,
		);

		if ( is_multisite() ) {
			set_site_transient( self::ANSWER_PAGE_CREATION_ERRORS_TRANSIENT, $output, 60 );
		} else {
			set_transient( self::ANSWER_PAGE_CREATION_ERRORS_TRANSIENT, $output, 60 );
		}
	}

	/**
	 * Get stored answer page creation errors for the current page load.
	 *
	 * @return object Object containing answer page creation data for the site, empty if none is stored.
	 */
	public static function get_answer_page_creation_errors(): object {

		if ( is_multisite() ) {

			$transient = get_site_transient( self::ANSWER_PAGE_CREATION_ERRORS_TRANSIENT );

			delete_site_transient( self::ANSWER_PAGE_CREATION_ERRORS_TRANSIENT );

		} else {

			$transient = get_transient( self::ANSWER_PAGE_CREATION_ERRORS_TRANSIENT );

			delete_transient( self::ANSWER_PAGE_CREATION_ERRORS_TRANSIENT );
		}

		return is_object( $transient ) ? $transient : (object) array();
	}

	/**
	 * Store answer page addition errors as a transient for the next page load.
	 *
	 * @param array<object> $errors        Array of answer page addition error messages.
	 * @param object        $addition_data Object containing answer page addition data for the site.
	 *
	 * @return void
	 */
	public static function store_answer_page_addition_errors( array $errors, object $addition_data ): void {

		$output = (object) array(
			'errors' => $errors,
			'data'   => $addition_data,
		);

		if ( is_multisite() ) {
			set_site_transient( self::ANSWER_PAGE_ADDITION_ERRORS_TRANSIENT, $output, 60 );
		} else {
			set_transient( self::ANSWER_PAGE_ADDITION_ERRORS_TRANSIENT, $output, 60 );
		}
	}

	/**
	 * Get stored answer page addition errors for the current page load.
	 *
	 * @return object Object containing answer page addition data for the site, empty if none is stored.
	 */
	public static function get_answer_page_addition_errors(): object {

		if ( is_multisite() ) {

			$transient = get_site_transient( self::ANSWER_PAGE_ADDITION_ERRORS_TRANSIENT );

			delete_site_transient( self::ANSWER_PAGE_ADDITION_ERRORS_TRANSIENT );

		} else {

			$transient = get_transient( self::ANSWER_PAGE_ADDITION_ERRORS_TRANSIENT );

			delete_transient( self::ANSWER_PAGE_ADDITION_ERRORS_TRANSIENT );
		}

		return is_object( $transient ) ? $transient : (object) array();
	}

	/**
	 * Get the list of post IDs that contain answer widget blocks.
	 *
	 * @return array<int> The list of post IDs that contain answer widget blocks.
	 */
	public static function get_post_ids_with_gist_answer_block(): array {
		return self::get_post_ids_with_content_substring( '<!-- wp:gist-answers/answer' );
	}

	/**
	 * Get the list of post IDs that contain question widget blocks.
	 *
	 * @return array<int> The list of post IDs that contain question widget blocks.
	 */
	public static function get_post_ids_with_gist_question_block(): array {
		return self::get_post_ids_with_content_substring( '<!-- wp:gist-answers/question' );
	}

	/**
	 * Get the list of post IDs that contain Gist widget shortcodes.
	 *
	 * @return array<int> The list of post IDs that contain Gist widget shortcodes.
	 */
	public static function get_post_ids_with_gist_shortcode(): array {
		return self::get_post_ids_with_content_substring( '[gist_answers_render_widget' );
	}

	/**
	 * Get the list of post IDs that contain a specific substring in their content.
	 *
	 * @param string $substring The substring to search for in post content.
	 *
	 * @return array<int> The list of post IDs that contain the specified substring in their content.
	 */
	public static function get_post_ids_with_content_substring( string $substring ): array {

		$post_ids = array();
		$page     = 1;

		do {
			$query = new WP_Query(
				array(
					'post_type'              => get_post_types(),
					'post_status'            => get_post_stati(),
					'fields'                 => 'ids',
					'posts_per_page'         => self::CONTENT_SUBSTRING_BATCH_SIZE,
					'paged'                  => $page,
					'orderby'                => 'ID',
					'order'                  => 'ASC',
					'no_found_rows'          => true,
					'cache_results'          => false,
					'update_post_meta_cache' => false,
					'update_post_term_cache' => false,
					's'                      => '"' . $substring . '"',
					'search_columns'         => array( 'post_content' ),
				)
			);

			$batch_ids   = is_array( $query->posts ?? null ) ? $query->posts : array();
			$batch_count = count( $batch_ids );
			$post_ids    = array_merge( $post_ids, $batch_ids );

			++$page;
		} while ( self::CONTENT_SUBSTRING_BATCH_SIZE === $batch_count );

		return $post_ids;
	}
}
