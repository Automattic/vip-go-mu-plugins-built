<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Admin {

	public function register_menus(): void {
		$hook = add_menu_page(
			'Clipisode',
			'Clipisode',
			'manage_options',
			'clipisode',
			[ $this, 'render_page' ],
			CLIPISODE_PLUGIN_URL . 'assets/images/clipisode.png',
			30
		);

		add_submenu_page( 'clipisode', 'Topics', 'Topics', 'manage_options', 'clipisode', [ $this, 'render_page' ] );
		add_submenu_page( 'clipisode', 'Replies', 'Replies', 'manage_options', 'clipisode-replies', [ $this, 'render_page' ] );
		add_submenu_page( 'clipisode', 'Clipisodes', 'Clipisodes', 'manage_options', 'clipisode-clipisodes', [ $this, 'render_page' ] );
		add_submenu_page( 'clipisode', 'Media', 'Media', 'manage_options', 'clipisode-media', [ $this, 'render_page' ] );
		add_submenu_page( 'clipisode', 'Themes', 'Themes', 'manage_options', 'clipisode-themes', [ $this, 'render_page' ] );
		add_submenu_page( 'clipisode', 'Screens', 'Screens', 'manage_options', 'edit.php?post_type=clipisode_screen' );
		add_submenu_page( 'clipisode', 'Settings', 'Settings', 'manage_options', 'clipisode-settings', [ $this, 'render_page' ] );

		add_action( "admin_print_styles-$hook", [ $this, 'enqueue_assets' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'maybe_enqueue' ] );
		add_action( 'admin_init', [ $this, 'redirect_cpt_list' ] );
		add_action( 'admin_head', [ $this, 'menu_icon_css' ] );
	}

	public function redirect_cpt_list(): void {
		global $pagenow;
		if ( $pagenow === 'edit.php' && isset( $_GET['post_type'] ) ) {
			$type = $_GET['post_type'];
			if ( $type === 'clipisode_invite' ) {
				wp_safe_redirect( admin_url( 'admin.php?page=clipisode-themes' ) );
				exit;
			}
			if ( $type === 'clipisode_preview' ) {
				wp_safe_redirect( admin_url( 'admin.php?page=clipisode-themes' ) );
				exit;
			}
		}
	}

	public function maybe_enqueue( string $hook_suffix ): void {
		$screen = get_current_screen();
		if ( ! $screen || strpos( $screen->id, 'clipisode' ) === false ) {
			return;
		}
		$this->enqueue_assets();
	}

	public function enqueue_assets(): void {
		static $enqueued = false;
		if ( $enqueued ) {
			return;
		}
		$enqueued = true;

		$asset_file = CLIPISODE_PLUGIN_DIR . 'build/index.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'clipisode-admin',
			CLIPISODE_PLUGIN_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'clipisode-admin',
			CLIPISODE_PLUGIN_URL . 'build/index.css',
			[ 'wp-components' ],
			$asset['version']
		);

		$config = [
			'page'                  => isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : 'clipisode',
			'home_url'              => esc_url_raw( home_url( '/' ) ),
			'rest_root'             => esc_url_raw( rest_url() ),
			'nonce'                 => wp_create_nonce( 'wp_rest' ),
			'invitation_prefix'     => Clipisode_Invitation::get_prefix(),
			'preview_prefix'        => Clipisode_Preview::get_prefix(),
			'debug_mode'            => (bool) get_option( 'clipisode_debug_mode', false ),
			'remotion_license_key'  => defined( 'CLIPISODE_REMOTION_LICENSE_KEY' ) ? (string) CLIPISODE_REMOTION_LICENSE_KEY : null,
			'remotion_is_production' => 'production' === wp_get_environment_type(),
		];
		$composition_themes = Clipisode_Composition::themes();
		if ( is_wp_error( $composition_themes ) ) {
			throw new RuntimeException( $composition_themes->get_error_message() );
		}
		$config['composition_themes'] = $composition_themes;
		wp_add_inline_script( 'clipisode-admin', 'window.clipisodeAdmin = ' . wp_json_encode( $config ) . ';', 'before' );
	}

	public function render_page(): void {
		echo '<div id="clipisode-root"></div>';
	}

	public function menu_icon_css(): void {
		?>
		<style>
			#toplevel_page_clipisode .wp-menu-image img {
				width: 20px;
				height: 20px;
				padding: 7px 0 0;
			}
		</style>
		<?php
	}
}
