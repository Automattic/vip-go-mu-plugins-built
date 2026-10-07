<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Media {

	const META_KEY = '_clipisode_managed';

	const ALLOWED_EXTENSIONS = [ 'mp4', 'mov', 'webm', 'm4v' ];

	const ALLOWED_MIME_TYPES = [
		'video/mp4',
		'video/quicktime',
		'video/webm',
		'video/x-m4v',
	];

	const MAX_FILE_SIZE = 83886080; // 80 MB

	public function register_hooks(): void {
		add_filter( 'ajax_query_attachments_args', [ $this, 'hide_from_media_grid' ] );
		add_action( 'pre_get_posts', [ $this, 'hide_from_media_list' ] );
	}

	public function hide_from_media_grid( array $query ): array {
		$query['meta_query']   = $query['meta_query'] ?? [];
		$query['meta_query'][] = [
			'key'     => self::META_KEY,
			'compare' => 'NOT EXISTS',
		];
		return $query;
	}

	public function hide_from_media_list( WP_Query $query ): void {
		global $pagenow;
		if ( 'upload.php' !== $pagenow ) {
			return;
		}
		if ( 'attachment' !== $query->get( 'post_type' ) ) {
			return;
		}

		$meta_query   = $query->get( 'meta_query' ) ?: [];
		$meta_query[] = [
			'key'     => self::META_KEY,
			'compare' => 'NOT EXISTS',
		];
		$query->set( 'meta_query', $meta_query );
	}

	/**
	 * Create a media record from an uploaded file ($_FILES key).
	 *
	 * @return array{ id: int, url: string }|WP_Error
	 */
	public static function create( string $type, string $label, string $upload_key = 'video' ) {
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$attachment_id = media_handle_upload( $upload_key, 0 );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		update_post_meta( $attachment_id, self::META_KEY, '1' );

		return self::insert_row( $type, $label, $attachment_id );
	}

	/**
	 * Create a media record by sideloading from a remote URL.
	 *
	 * @return array{ id: int, url: string }|WP_Error
	 */
	public static function create_from_sideload( string $type, string $label, array $file_array ) {
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$attachment_id = media_handle_sideload( $file_array, 0 );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		update_post_meta( $attachment_id, self::META_KEY, '1' );

		return self::insert_row( $type, $label, $attachment_id );
	}

	/**
	 * Delete a media record and its children. Removes WP attachment for local storage.
	 */
	public static function delete( int $id ): void {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_media';

		$children = $wpdb->get_col( $wpdb->prepare(
			"SELECT id FROM $table WHERE parent_id = %d", $id
		) );
		foreach ( $children as $child_id ) {
			self::delete( (int) $child_id );
		}

		$media = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		if ( ! $media ) {
			return;
		}

		if ( $media->storage === 'local' && $media->attachment_id ) {
			wp_delete_attachment( (int) $media->attachment_id, true );
		}

		$wpdb->delete( $table, [ 'id' => $id ] );
	}

	/**
	 * Resolve a media ID to a public URL.
	 */
	public static function get_url( int $id ): ?string {
		global $wpdb;
		$media = $wpdb->get_row( $wpdb->prepare(
			"SELECT storage, attachment_id FROM {$wpdb->prefix}clipisode_media WHERE id = %d", $id
		) );
		if ( ! $media ) {
			return null;
		}

		if ( $media->storage === 'local' && $media->attachment_id ) {
			return wp_get_attachment_url( (int) $media->attachment_id ) ?: null;
		}

		return null;
	}

	public static function get_video_url( int $id ): ?string {
		global $wpdb;
		$media = $wpdb->get_row( $wpdb->prepare(
			"SELECT type, mime_type FROM {$wpdb->prefix}clipisode_media WHERE id = %d", $id
		) );
		if ( ! $media || 'video' !== $media->type || ! in_array( $media->mime_type, self::ALLOWED_MIME_TYPES, true ) ) {
			return null;
		}
		return self::get_url( $id );
	}

	public static function get_filename( int $id ): ?string {
		global $wpdb;
		$media = $wpdb->get_row( $wpdb->prepare(
			"SELECT storage, attachment_id, path FROM {$wpdb->prefix}clipisode_media WHERE id = %d", $id
		) );
		if ( ! $media ) {
			return null;
		}

		if ( $media->storage === 'local' && $media->attachment_id ) {
			$file = get_attached_file( (int) $media->attachment_id );
			return $file ? basename( $file ) : null;
		}

		return $media->path ? basename( $media->path ) : null;
	}

	private static function insert_row( string $type, string $label, int $attachment_id ): array|WP_Error {
		global $wpdb;

		$path      = get_post_meta( $attachment_id, '_wp_attached_file', true );
		$post      = get_post( $attachment_id );
		$file_path = get_attached_file( $attachment_id );

		$inserted = $wpdb->insert( $wpdb->prefix . 'clipisode_media', [
			'type'          => $type,
			'label'         => $label,
			'storage'       => 'local',
			'path'          => $path,
			'attachment_id' => $attachment_id,
			'mime_type'     => $post->post_mime_type,
			'file_size'     => $file_path ? filesize( $file_path ) : null,
		] );
		if ( false === $inserted ) {
			wp_delete_attachment( $attachment_id, true );
			return new WP_Error( 'media_storage_failed', 'The uploaded media could not be saved.' );
		}

		return [
			'id'  => (int) $wpdb->insert_id,
			'url' => wp_get_attachment_url( $attachment_id ),
		];
	}
}
