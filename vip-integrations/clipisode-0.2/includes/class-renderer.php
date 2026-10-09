<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Renderer {

	private const ACTIVE = [ 'queued', 'rendering', 'uploading' ];

	public static function job( int $output_id ): ?array {
		$value = get_option( 'clipisode_render_' . $output_id );
		return is_array( $value ) ? $value : null;
	}

	public static function is_active( int $output_id ): bool {
		$job = self::job( $output_id );
		return $job && in_array( $job['status'], self::ACTIVE, true );
	}

	public static function forget( int $output_id ): void {
		delete_option( 'clipisode_render_' . $output_id );
	}

	public static function start( int $output_id ): WP_REST_Response {
		global $wpdb;
		if ( self::is_active( $output_id ) ) {
			$status = self::status( $output_id );
			if ( $status->get_status() >= 400 ) {
				return $status;
			}
			if ( self::is_active( $output_id ) ) {
				return self::error( 'This Clipisode already has a render in progress.', 409 );
			}
		}
		if ( ! self::configured() ) {
			return self::error( 'The local renderer is not configured. Set CLIPISODE_RENDERER_URL and CLIPISODE_RENDERER_TOKEN in wp-config.php.', 503 );
		}
		if ( false === $wpdb->query( 'START TRANSACTION' ) ) {
			return self::error( 'The render could not be started.', 500 );
		}
		$output = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}clipisode_outputs WHERE id = %d FOR UPDATE", $output_id ) );
		if ( ! $output || ! $output->composition ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( 'A saved composition is required before rendering.', 404 );
		}
		wp_cache_delete( 'clipisode_render_' . $output_id, 'options' );
		if ( self::is_active( $output_id ) ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( 'This Clipisode already has a render in progress.', 409 );
		}
		$composition = Clipisode_Composition::resolve( $output->composition );
		if ( is_wp_error( $composition ) ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( $composition->get_error_message(), 409 );
		}
		$themes = Clipisode_Composition::themes();
		if ( is_wp_error( $themes ) ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( $themes->get_error_message(), 409 );
		}
		foreach ( $themes as $theme ) {
			if ( $theme['id'] === $composition['settings']['themeId'] ) {
				$composition['themeDefinition'] = $theme;
				break;
			}
		}
		$token = wp_generate_password( 48, false );
		if ( false === $wpdb->update( $wpdb->prefix . 'clipisode_outputs', [ 'upload_token' => $token ], [ 'id' => $output_id ] ) ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( 'The render upload could not be authorized.', 500 );
		}
		$remote = self::request( 'POST', '/renders', [
			'outputId'    => $output_id,
			'composition' => $composition,
			'callbackUrl' => add_query_arg( 'token', $token, rest_url( 'clipisode/v1/outputs/' . $output_id . '/upload' ) ),
		] );
		if ( is_wp_error( $remote ) ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( $remote->get_error_message(), 503 );
		}
		if ( 'queued' !== $remote['status'] ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( 'The local renderer did not queue the render.', 502 );
		}
		$job = array_merge( $remote, [ 'composition_hash' => hash( 'sha256', $output->composition ) ] );
		if ( ! update_option( 'clipisode_render_' . $output_id, $job, false ) || false === $wpdb->query( 'COMMIT' ) ) {
			$wpdb->query( 'ROLLBACK' );
			wp_cache_delete( 'clipisode_render_' . $output_id, 'options' );
			return self::error( 'The render job could not be saved.', 500 );
		}
		return new WP_REST_Response( self::public_status( $job, $output ), 202 );
	}

	public static function status( int $output_id ): WP_REST_Response {
		global $wpdb;
		$output = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}clipisode_outputs WHERE id = %d", $output_id ) );
		if ( ! $output ) {
			return self::error( 'Output not found.', 404 );
		}
		$job = self::job( $output_id );
		if ( ! $job || ! in_array( $job['status'], self::ACTIVE, true ) ) {
			// Shared option caches may expose completion before the upload transaction commits.
			if ( false === $wpdb->query( 'START TRANSACTION' ) ) {
				return self::error( 'The render status could not be read.', 500 );
			}
			$output = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}clipisode_outputs WHERE id = %d FOR UPDATE", $output_id ) );
			wp_cache_delete( 'clipisode_render_' . $output_id, 'options' );
			$job = self::job( $output_id );
			$wpdb->query( 'ROLLBACK' );
			return $output
				? new WP_REST_Response( self::public_status( $job, $output ) )
				: self::error( 'Output not found.', 404 );
		}
		$remote = self::request( 'GET', '/renders/' . rawurlencode( $job['id'] ) );
		if ( is_wp_error( $remote ) ) {
			if ( 'render_missing' !== $remote->get_error_code() ) {
				return self::error( $remote->get_error_message(), 503 );
			}
			$remote = [ 'id' => $job['id'], 'status' => 'error', 'progress' => 0, 'error' => 'The local renderer no longer has this job. Start a new render.' ];
		}
		// Serialize status writes with uploads and new jobs so progress cannot overwrite completion.
		if ( false === $wpdb->query( 'START TRANSACTION' ) ) {
			return self::error( 'The render status could not be saved.', 500 );
		}
		$output = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}clipisode_outputs WHERE id = %d FOR UPDATE", $output_id ) );
		if ( ! $output ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( 'Output not found.', 404 );
		}
		wp_cache_delete( 'clipisode_render_' . $output_id, 'options' );
		$current = self::job( $output_id );
		if ( ! $current || $current['id'] !== $job['id'] || ! in_array( $current['status'], self::ACTIVE, true ) ) {
			$wpdb->query( 'ROLLBACK' );
			return new WP_REST_Response( self::public_status( $current, $output ) );
		}
		if ( 'done' === $remote['status'] ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( 'The renderer finished without a confirmed video upload.', 502 );
		}
		if ( $remote['id'] !== $job['id'] ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( 'The local renderer returned the wrong job.', 502 );
		}
		$job = array_merge( $current, $remote );
		if ( $job !== $current && ! update_option( 'clipisode_render_' . $output_id, $job, false ) ) {
			$wpdb->query( 'ROLLBACK' );
			return self::error( 'The render status could not be saved.', 500 );
		}
		if ( false === $wpdb->query( 'COMMIT' ) ) {
			$wpdb->query( 'ROLLBACK' );
			wp_cache_delete( 'clipisode_render_' . $output_id, 'options' );
			return self::error( 'The render status could not be saved.', 500 );
		}
		return new WP_REST_Response( self::public_status( $job, $output ) );
	}

	public static function validate_upload( object $output ): ?WP_Error {
		$job = self::job( (int) $output->id );
		if ( ! $job || ! in_array( $job['status'], self::ACTIVE, true ) ) {
			return new WP_Error( 'render_inactive', 'This output has no active render.' );
		}
		if ( ! hash_equals( $job['composition_hash'], hash( 'sha256', $output->composition ) ) ) {
			return new WP_Error( 'render_changed', 'The composition changed after this render started. Render the saved composition again.' );
		}
		return null;
	}

	public static function complete( int $output_id ): bool {
		$job = self::job( $output_id );
		$job['status'] = 'done';
		$job['progress'] = 1;
		$job['error'] = null;
		return update_option( 'clipisode_render_' . $output_id, $job, false );
	}

	public static function complete_browser( int $output_id, string $composition_hash ): bool {
		return update_option( 'clipisode_render_' . $output_id, [
			'id'               => 'browser-' . wp_generate_password( 24, false ),
			'backend'          => 'browser',
			'status'           => 'done',
			'progress'         => 1,
			'error'            => null,
			'composition_hash' => $composition_hash,
		], false );
	}

	private static function public_status( ?array $job, object $output ): array {
		return [
			'id'       => $job ? $job['id'] : null,
			'status'   => $job ? $job['status'] : 'idle',
			'progress' => $job ? $job['progress'] : 0,
			'error'    => $job ? $job['error'] : null,
			'url'      => $output->media_id ? Clipisode_Media::get_url( (int) $output->media_id ) : null,
			'external_available' => self::configured(),
		];
	}

	private static function configured(): bool {
		return defined( 'CLIPISODE_RENDERER_URL' ) && defined( 'CLIPISODE_RENDERER_TOKEN' ) && CLIPISODE_RENDERER_URL && CLIPISODE_RENDERER_TOKEN;
	}

	private static function request( string $method, string $path, ?array $body = null ): array|WP_Error {
		if ( ! self::configured() ) {
			return new WP_Error( 'renderer_unconfigured', 'The local renderer is not configured.' );
		}
		$args = [
			'method'  => $method,
			'timeout' => 10,
			'headers' => [ 'Authorization' => 'Bearer ' . CLIPISODE_RENDERER_TOKEN, 'Content-Type' => 'application/json' ],
		];
		if ( null !== $body ) {
			$args['body'] = wp_json_encode( $body );
		}
		$response = wp_remote_request( rtrim( CLIPISODE_RENDERER_URL, '/' ) . $path, $args );
		if ( is_wp_error( $response ) ) {
			return new WP_Error( 'renderer_unavailable', 'The local renderer is unavailable. Start the renderer service and retry.' );
		}
		$status = wp_remote_retrieve_response_code( $response );
		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( 404 === $status && 'GET' === $method ) {
			return new WP_Error( 'render_missing', 'The render job was not found.' );
		}
		if ( $status < 200 || $status >= 300 ) {
			$message = isset( $data['message'] ) && is_string( $data['message'] ) ? sanitize_text_field( $data['message'] ) : 'The local renderer rejected the request.';
			return new WP_Error( 'renderer_error', $message );
		}
		if ( ! is_array( $data ) || ! isset( $data['id'], $data['status'], $data['progress'] ) || ! is_string( $data['id'] ) || '' === $data['id'] || ! in_array( $data['status'], [ 'queued', 'rendering', 'uploading', 'done', 'error' ], true ) || ! is_numeric( $data['progress'] ) || $data['progress'] < 0 || $data['progress'] > 1 || ! array_key_exists( 'error', $data ) || ( null !== $data['error'] && ! is_string( $data['error'] ) ) ) {
			return new WP_Error( 'renderer_invalid', 'The local renderer returned an invalid response.' );
		}
		return [ 'id' => $data['id'], 'status' => $data['status'], 'progress' => (float) $data['progress'], 'error' => $data['error'] ];
	}

	private static function error( string $message, int $status ): WP_REST_Response {
		return new WP_REST_Response( [ 'message' => $message ], $status );
	}
}
