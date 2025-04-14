<?php declare(strict_types = 1);

namespace RemoteDataBlocks\PluginSettings;

use RemoteDataBlocks\Editor\Assets\Assets;
use RemoteDataBlocks\REST\DataSourceController;
use RemoteDataBlocks\REST\AuthController;
use RemoteDataBlocks\WpdbStorage\DataSourceCrud;
use RemoteDataBlocks\Store\DataSource\DataSourceConfigManager;
use RemoteDataBlocks\Telemetry\DataSourceTelemetry;
use function wp_get_environment_type;
use function wp_is_development_mode;
use function add_settings_error;

defined( 'ABSPATH' ) || exit();

class PluginSettings {
	public static function init(): void {
		add_action( 'admin_menu', [ __CLASS__, 'add_options_page' ] );
		add_action( 'admin_enqueue_scripts', [ __CLASS__, 'enqueue_settings_assets' ] );
		add_action( 'pre_update_option_' . DataSourceCrud::CONFIG_OPTION_NAME, [ __CLASS__, 'encrypt_option' ], 10, 2 );
		add_action( 'option_' . DataSourceCrud::CONFIG_OPTION_NAME, [ __CLASS__, 'decrypt_option' ], 10, 1 );
		add_action( 'rest_api_init', [ __CLASS__, 'init_rest_routes' ] );
	}

	public static function add_options_page(): void {
		add_options_page(
			__( 'Remote Data Blocks Settings', 'remote-data-blocks' ),
			__( 'Remote Data Blocks', 'remote-data-blocks' ),
			'manage_options',
			'remote-data-blocks-settings',
			[ __CLASS__, 'settings_page_content' ]
		);
	}

	public static function settings_page_content(): void {
		printf(
			'<div id="remote-data-blocks-settings-wrapper">
				<div id="remote-data-blocks-settings">%s</div>
			</div>',
			esc_html__( 'Loading…', 'remote-data-blocks' )
		);

		/**
		 * Track the view event.
		 */
		$configs = DataSourceConfigManager::get_all();
		DataSourceTelemetry::track_view( $configs );
	}

	public static function init_rest_routes(): void {
		$controller = new DataSourceController();
		$controller->register_routes();

		$auth_controller = new AuthController();
		$auth_controller->register_routes();
	}

	public static function enqueue_settings_assets( string $admin_page ): void {
		if ( 'settings_page_remote-data-blocks-settings' !== $admin_page ) {
			return;
		}

		Assets::enqueue_build_asset( 'remote-data-blocks-dataviews', 'dataviews' );
		Assets::enqueue_build_asset( 'remote-data-blocks-settings', 'settings', [ 'remote-data-blocks-dataviews' ] );

		wp_localize_script(
			'remote-data-blocks-settings',
			'REMOTE_DATA_BLOCKS_SETTINGS',
			[
				...( self::is_dev() ? self::get_build() : [] ),
				'version' => self::get_version(),
			]
		);
	}

	/**
	 * Get the current build information from the Git repository.
	 * - `branch` - The current branch / HEAD.
	 * - `hash` - The current commit hash.
	 *
	 * This function is only called in development mode by default
	 * (e.g. when `is_dev` returns true).
	 */
	public static function get_build(): array {
		$git_path = REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . '/.git';
		$head_path = $git_path . '/HEAD';
		if ( ! file_exists( $head_path ) ) {
			return [];
		}

		// phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
		$head_contents = file_get_contents( $head_path );
		if ( ! preg_match( '/^ref: (refs\/heads\/(.+))/', $head_contents, $matches ) ) {
			return [];
		}

		$ref = $matches[1];
		$branch = $matches[2];
		$ref_path = $git_path . '/' . $ref;

		if ( ! file_exists( $ref_path ) ) {
			return [];
		}

		// phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
		$hash = file_get_contents( $ref_path );
		return compact( 'branch', 'hash' );
	}

	/**
	 * Get the plugin version from the main plugin file.
	 */
	public static function get_version(): string {
		return REMOTE_DATA_BLOCKS__PLUGIN_VERSION;
	}

	/**
	 * Check if the current environment is development.
	 */
	public static function is_dev(): bool {
		return 'development' === wp_get_environment_type() && wp_is_development_mode( 'plugin' );
	}

	public static function encrypt_option( array $new_value, string|array|bool $old_value ): string|array|bool {
		$encryptor = new \RemoteDataBlocks\WpdbStorage\DataEncryption();

		try {
			return $encryptor->encrypt( wp_json_encode( $new_value ) );
		} catch ( \Exception $e ) {
			self::show_settings_error( __( 'Error encrypting remote-data-blocks settings.', 'remote-data-blocks' ) );

			return $old_value;
		}
	}

	public static function decrypt_option( string $value ): array {
		$decryptor = new \RemoteDataBlocks\WpdbStorage\DataEncryption();
		$is_error = false;

		try {
			$decrypted = $decryptor->decrypt( $value );

			if ( false === $decrypted ) {
				$is_error = true;
			}
		} catch ( \Exception $e ) {
			$is_error = true;
		}

		if ( $is_error ) {
			self::show_settings_error( __( 'Error decrypting remote-data-blocks settings.', 'remote-data-blocks' ) );
			return [];
		} else {
			return json_decode( $decrypted, true );
		}
	}

	private static function show_settings_error( string $message ): void {
		// Check that we have add_settings_error() available. This can be unavailable during wp-env startup.
		if ( is_admin() && function_exists( 'add_settings_error' ) ) {
			add_settings_error(
				'remote_data_blocks_settings',
				'decryption_error',
				$message
			);
		}
	}
}
