<?php
/**
 * Auth Admin UI class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Auth;

/**
 * Surfaces Safe Publish authentication status across wp-admin.
 *
 * Renders the shared-secret admin notice, registers the Site Health test,
 * and styles the Safe Publish MU-plugin entry on the plugins screen.
 */
class Auth_Admin_UI {

	/**
	 * Shared secret used to evaluate configuration status.
	 *
	 * @var string
	 */
	private string $shared_secret;

	/**
	 * Constructor.
	 *
	 * @param string $shared_secret Shared secret used to evaluate configuration status.
	 */
	public function __construct( string $shared_secret ) {
		$this->shared_secret = $shared_secret;
		add_action( 'admin_notices', array( $this, 'render_admin_notice' ) );
		add_filter( 'site_status_tests', array( $this, 'register_site_health_test' ) );
		add_filter( 'show_advanced_plugins', array( $this, 'enhance_mu_plugins_display' ), 10, 2 );
	}

	/**
	 * Renders the admin notice about authentication configuration status.
	 *
	 * Only displayed to administrators on the dashboard and plugins pages.
	 */
	public function render_admin_notice(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$screen = get_current_screen();

		if ( ! $screen || ! in_array( $screen->id, array( 'dashboard', 'plugins' ), true ) ) {
			return;
		}

		$secret_length = strlen( $this->shared_secret );

		if ( '' === $this->shared_secret ) {
			wp_admin_notice(
				__( 'Safe Publish Authentication: Shared secret not configured. Set the <code>SAFE_PUBLISH_SHARED_SECRET</code> environment variable to enable Safe Publish authentication.', 'safe-publish' ),
				array( 'type' => 'warning' )
			);
		} elseif ( $secret_length < 32 ) {
			wp_admin_notice(
				sprintf(
					/* translators: %d: Length of the shared secret in characters */
					__( 'Safe Publish Authentication: Shared secret is too short ( %d character secret). Use at least 32 characters for security.', 'safe-publish' ),
					absint( $secret_length )
				),
				array( 'type' => 'warning' )
			);
		} elseif ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			wp_admin_notice(
				sprintf(
					/* translators: %d: Length of the shared secret in characters */
					__( 'Safe Publish Authentication: Configured successfully ✅ ( %d character secret).', 'safe-publish' ),
					absint( $secret_length )
				),
				array(
					'dismissible' => true,
					'type'        => 'warning',
				)
			);
		}
	}

	/**
	 * Registers the Safe Publish authentication test with WordPress Site Health.
	 *
	 * @param array $tests Existing Site Health tests.
	 * @return array Modified tests array with Safe Publish auth test added.
	 */
	public function register_site_health_test( array $tests ): array {
		$tests['direct']['safe_publish_auth'] = array(
			'label' => __( 'Safe Publish Authentication Configuration', 'safe-publish' ),
			'test'  => array( $this, 'site_health_test' ),
		);

		return $tests;
	}

	/**
	 * Returns the Site Health test result for authentication configuration.
	 *
	 * @return array Site Health test result.
	 */
	public function site_health_test(): array {
		$secret_length = strlen( $this->shared_secret );

		if ( '' === $this->shared_secret ) {
			return array(
				'label'       => __( 'Safe Publish Authentication not configured', 'safe-publish' ),
				'status'      => 'recommended',
				'badge'       => array(
					'label' => __( 'Safe Publish', 'safe-publish' ),
					'color' => 'orange',
				),
				'description' => sprintf(
					'<p>%s</p>',
					__( 'The Safe Publish shared secret is not configured. If you plan to use Safe Publish, set the SAFE_PUBLISH_SHARED_SECRET environment variable.', 'safe-publish' )
				),
				'test'        => 'safe_publish_auth',
			);
		}

		if ( $secret_length < 32 ) {
			return array(
				'label'       => __( 'Safe Publish Authentication secret too short', 'safe-publish' ),
				'status'      => 'critical',
				'badge'       => array(
					'label' => __( 'Safe Publish', 'safe-publish' ),
					'color' => 'red',
				),
				'description' => sprintf(
					'<p>%s</p>',
					/* translators: %d: length of the shared secret in characters */
					sprintf( __( 'The Safe Publish shared secret is only %d characters long. For security, use at least 32 characters.', 'safe-publish' ), $secret_length )
				),
				'test'        => 'safe_publish_auth',
			);
		}

		return array(
			'label'       => __( 'Safe Publish Authentication configured correctly', 'safe-publish' ),
			'status'      => 'good',
			'badge'       => array(
				'label' => __( 'Safe Publish', 'safe-publish' ),
				'color' => 'green',
			),
			'description' => sprintf(
				'<p>%s</p>',
				/* translators: %d: length of the shared secret in characters */
				sprintf( __( 'Safe Publish authentication is properly configured with a %d-character shared secret.', 'safe-publish' ), $secret_length )
			),
			'test'        => 'safe_publish_auth',
		);
	}

	/**
	 * Enhances the MU-plugins display with custom styles for Safe Publish.
	 *
	 * @param bool   $show_advanced_plugins Whether to show advanced plugins.
	 * @param string $type                  Plugin type ('mustuse', 'dropins').
	 * @return bool Show advanced plugins value, unchanged.
	 */
	public function enhance_mu_plugins_display( bool $show_advanced_plugins, string $type ): bool {
		if ( 'mustuse' === $type && current_user_can( 'manage_options' ) ) {
			add_action( 'admin_footer', array( $this, 'add_mu_plugin_styles' ) );
		}

		return $show_advanced_plugins;
	}

	/**
	 * Outputs custom styles for MU-plugin display.
	 */
	public function add_mu_plugin_styles(): void {
		?>
		<style>
		.mu-plugin[data-plugin="safe-publish-auth.php"] {
			background-color: #f0f6fc;
			border-left: 4px solid #0073aa;
			padding: 10px;
		}
		.mu-plugin[data-plugin="safe-publish-auth.php"] .plugin-title strong {
			color: #0073aa;
		}
		</style>
		<?php
	}
}
