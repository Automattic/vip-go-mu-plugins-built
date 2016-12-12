<?php

namespace Automattic\WP\Cron_Control;

class Main extends Singleton {
	/**
	 * PLUGIN SETUP
	 */

	/**
	 * Register hooks
	 */
	protected function class_init() {
		// Bail when plugin conditions aren't met
		if ( ! defined( '\WP_CRON_CONTROL_SECRET' ) ) {
			add_action( 'admin_notices', array( $this, 'admin_notice' ) );
			return;
		}

		// Load dependencies
		require __DIR__ . '/class-events.php';
		require __DIR__ . '/class-internal-events.php';
		require __DIR__ . '/class-rest-api.php';
		require __DIR__ . '/functions.php';
		require __DIR__ . '/wp-cli.php';

		// Block normal cron execution
		$this->set_constants();

		$block_action = did_action( 'muplugins_loaded' ) ? 'plugins_loaded' : 'muplugins_loaded';
		add_action( $block_action, array( $this, 'block_direct_cron' ) );
		remove_action( 'init', 'wp_cron' );

		add_filter( 'cron_request', array( $this, 'block_spawn_cron' ) );
	}

	/**
	 * Define constants that block Core's cron
	 *
	 * If a constant is already defined and isn't what we expect, log it
	 */
	private function set_constants() {
		$constants = array(
			'DISABLE_WP_CRON'   => true,
			'ALTERNATE_WP_CRON' => false,
		);

		foreach ( $constants as $constant => $expected_value ) {
			if ( defined( $constant ) ) {
				if ( constant( $constant ) !== $expected_value ) {
					error_log( sprintf( __( '%1$s: %2$s set to unexpected value; must be corrected for proper behaviour.', 'automattic-cron-control' ), 'Cron Control', $constant ) );
				}
			} else {
				define( $constant, $expected_value );
			}
		}
	}

	/**
	 * Block direct cron execution as early as possible
	 */
	public function block_direct_cron() {
		if ( false !== stripos( $_SERVER['REQUEST_URI'], '/wp-cron.php' ) || false !== stripos( $_SERVER['SCRIPT_NAME'], '/wp-cron.php' ) ) {
			status_header( 403 );
			wp_send_json_error( new \WP_Error( 'forbidden', sprintf( __( 'Normal cron execution is blocked when the %s plugin is active.', 'automattic-cron-control' ), 'Cron Control' ) ), array( 'status' => 400, ) );
		}
	}

	/**
	 * Block the `spawn_cron()` function
	 */
	public function block_spawn_cron( $spawn_cron_args ) {
		delete_transient( 'doing_cron' );

		$spawn_cron_args['url']  = '';
		$spawn_cron_args['key']  = '';
		$spawn_cron_args['args'] = array();

		return $spawn_cron_args;
	}

	/**
	 * Display an error if the plugin's conditions aren't met
	 */
	public function admin_notice() {
		?>
		<div class="notice notice-error">
			<p><?php printf( __( '<strong>%1$s</strong>: To use this plugin, define the constant %2$s.', 'automattic-cron-control' ), 'Cron Control', '<code>WP_CRON_CONTROL_SECRET</code>' ); ?></p>
		</div>
		<?php
	}
}
