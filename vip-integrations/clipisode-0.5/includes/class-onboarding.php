<?php

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.DB.DirectDatabaseQuery -- Clipisode entities live in custom tables; progress must reflect current persisted content.

class Clipisode_Onboarding {

	private const OPTION = 'clipisode_onboarding';

	public function register_routes(): void {
		register_rest_route( 'clipisode/v1', '/onboarding', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_state' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'update_state' ],
				'permission_callback' => [ $this, 'check_permission' ],
			],
		] );
	}

	public function check_permission(): bool {
		return current_user_can( 'manage_options' );
	}

	private static function preferences(): array {
		global $wpdb;
		// get_user_option() can read an unprefixed network value. This guide is strictly site-local.
		$value = get_user_meta( get_current_user_id(), $wpdb->get_blog_prefix() . self::OPTION, true );
		return is_array( $value ) ? $value : [ 'dismissed' => false, 'topic_id' => null, 'output_id' => null ];
	}

	public static function state(): array {
		global $wpdb;
		$preferences = self::preferences();
		$topic_id    = (int) ( $preferences['topic_id'] ?? 0 );
		$output_id   = (int) ( $preferences['output_id'] ?? 0 );
		$state       = [
			'dismissed'    => (bool) $preferences['dismissed'],
			'topic_id'     => $topic_id ?: null,
			'output_id'    => $output_id ?: null,
			'topic_title'  => '',
			'stage'        => 1,
			'reply_count'  => 0,
			'approved_count' => 0,
			'missing_topic' => false,
			'missing_output' => false,
			'watch_url'    => null,
			'video_url'    => null,
			'next_url'     => admin_url( 'admin.php?page=clipisode' ),
		];
		if ( ! $topic_id ) {
			return $state;
		}
		$topic = $wpdb->get_row( $wpdb->prepare( 'SELECT id, title FROM %i WHERE id = %d', $wpdb->prefix . 'clipisode_topics', $topic_id ) );
		if ( ! $topic ) {
			$state['missing_topic'] = true;
			return $state;
		}
		$state['topic_title'] = $topic->title;
		$state['stage']       = 2;
		$state['next_url']    = admin_url( 'admin.php?page=clipisode#/' . $topic_id );
		$counts = $wpdb->get_row( $wpdb->prepare(
			"SELECT COUNT(*) AS replies, SUM(CASE WHEN status = 'approved' AND media_id IS NOT NULL THEN 1 ELSE 0 END) AS approved FROM %i WHERE topic_id = %d",
			$wpdb->prefix . 'clipisode_replies', $topic_id
		) );
		$state['reply_count']    = (int) $counts->replies;
		$state['approved_count'] = (int) $counts->approved;
		if ( $state['approved_count'] ) {
			$state['stage'] = 3;
		}
		if ( ! $output_id ) {
			return $state;
		}
		$output = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d AND topic_id = %d', $wpdb->prefix . 'clipisode_outputs', $output_id, $topic_id ) );
		if ( ! $output ) {
			$state['missing_output'] = true;
			return $state;
		}
		if ( null === $output->composition ) {
			return $state;
		}
		$state['stage']    = 4;
		$state['next_url'] = admin_url( 'admin.php?page=clipisode-clipisodes#/compose/' . $output_id );
		// A previous MP4 may still be available after editing; it does not complete the new composition.
		if ( Clipisode_Renderer::has_current_export( $output ) ) {
			$state['video_url'] = Clipisode_Media::get_url( (int) $output->media_id );
			$state['watch_url'] = Clipisode_Preview::get_url( $output_id, (int) $output->media_id, $output->slug );
			if ( $state['video_url'] && $state['watch_url'] ) {
				$state['stage'] = 5;
			}
		}
		return $state;
	}

	public function get_state(): WP_REST_Response {
		return new WP_REST_Response( self::state() );
	}

	public function update_state( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$preferences = self::preferences();
		$action      = $request->get_param( 'action' );
		switch ( $action ) {
			case 'start':
				$preferences = [ 'dismissed' => false, 'topic_id' => null, 'output_id' => null ];
				break;
			case 'dismiss':
				$preferences['dismissed'] = true;
				break;
			case 'resume':
				$preferences['dismissed'] = false;
				break;
			case 'select':
				$topic_id  = $request->get_param( 'topic_id' );
				$output_id = $request->get_param( 'output_id' );
				if ( ! is_int( $topic_id ) || $topic_id <= 0 || ! $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM %i WHERE id = %d', $wpdb->prefix . 'clipisode_topics', $topic_id ) ) ) {
					return new WP_REST_Response( [ 'message' => 'Choose an existing topic to continue.' ], 400 );
				}
				if ( null !== $output_id && ( ! is_int( $output_id ) || $output_id <= 0 || ! $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM %i WHERE id = %d AND topic_id = %d AND composition IS NOT NULL', $wpdb->prefix . 'clipisode_outputs', $output_id, $topic_id ) ) ) ) {
					return new WP_REST_Response( [ 'message' => 'The saved video must belong to this topic.' ], 400 );
				}
				$preferences = [ 'dismissed' => true === $request->get_param( 'show_guide' ) ? false : $preferences['dismissed'], 'topic_id' => $topic_id, 'output_id' => $output_id ];
				break;
			default:
				return new WP_REST_Response( [ 'message' => 'Unknown guide action.' ], 400 );
		}
		if ( $preferences !== self::preferences() && ! update_user_option( get_current_user_id(), self::OPTION, $preferences, false ) ) {
			return new WP_REST_Response( [ 'message' => 'Your work is saved, but guide progress could not be saved. Please retry.' ], 500 );
		}
		return $this->get_state();
	}

	public function register_widget(): void {
		if ( ! $this->check_permission() || self::preferences()['dismissed'] ) {
			return;
		}
		wp_add_dashboard_widget( 'clipisode_get_started', __( 'Create with Clipisode', 'clipisode' ), [ $this, 'render_widget' ] );
		wp_add_inline_style( 'dashboard', '#clipisode_get_started .clipisode-dashboard-welcome{padding:8px 4px}#clipisode_get_started strong{font-size:17px;line-height:1.4}#clipisode_get_started ol{display:grid;grid-template-columns:1fr 1fr;gap:12px 28px;margin:20px 0 20px 20px}#clipisode_get_started .button-primary{margin-top:4px}' );
	}

	public function render_widget(): void {
		$state = self::state();
		$labels = [ 1 => 'Create a topic', 2 => 'Collect a reply', 3 => 'Make your video', 4 => 'Export and share' ];
		?>
		<div class="clipisode-dashboard-welcome">
			<p><strong><?php echo esc_html( $state['topic_title'] ?: __( 'Your next video starts with a question.', 'clipisode' ) ); ?></strong></p>
			<p><?php esc_html_e( 'Ask a question, collect video replies, and turn them into a video. We’ll walk you through it using your own content.', 'clipisode' ); ?></p>
			<ol><?php foreach ( $labels as $step => $label ) : ?><li><?php echo esc_html( $label . ( $step < $state['stage'] ? ' ✓' : '' ) ); ?></li><?php endforeach; ?></ol>
			<p><a class="button button-primary" href="<?php echo esc_url( $state['next_url'] ); ?>"><?php echo esc_html( 5 === $state['stage'] ? __( 'Your Clipisode is ready', 'clipisode' ) : ( $state['topic_id'] && ! $state['missing_topic'] ? __( 'Continue your Clipisode', 'clipisode' ) : __( 'Get started', 'clipisode' ) ) ); ?></a></p>
		</div>
		<?php
	}
}
