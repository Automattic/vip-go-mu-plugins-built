<?php
/**
 * Settings Page class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Options;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings Page Class.
 */
final class Settings_Page {

	/**
	 * Renders the settings page.
	 */
	public function render(): void {
		$connected_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );
		$sync_mode          = get_option( Options::OPTION_SYNC_MODE, '' );

		// Basic auth credentials (development only).
		$username             = get_option( Options::OPTION_BASIC_AUTH_USERNAME, '' );
		$password_is_external = Options::is_constant_configured(
			Options::OPTION_BASIC_AUTH_PASSWORD
		);
		$password             = $password_is_external
			? ''
			: get_option( Options::OPTION_BASIC_AUTH_PASSWORD, '' );

		$show_import_fields = in_array(
			$sync_mode,
			array( Options::SYNC_MODE_IMPORT, Options::SYNC_MODE_BIDIRECTIONAL ),
			true
		);

		?>
		<div class="wrap" id="safe-publish-settings-page">
			<h1><?php esc_html_e( 'Safe Publish Settings', 'safe-publish' ); ?></h1>

			<?php settings_errors(); ?>

			<?php if ( '' === $sync_mode || '' === $connected_site_url ) : ?>
			<div class="notice notice-info">
				<p>
						<?php esc_html_e( 'Configure a Sync Mode and Connected Site URL to get started.', 'safe-publish' ); ?>
				</p>
			</div>
			<?php endif; ?>

			<?php if ( $show_import_fields ) : ?>
			<div
				id="safe-publish-auth-status-banner"
				class="safe-publish-auth-status-banner safe-publish-import-field-row"
				hidden
			></div>
			<?php endif; ?>

			<div class="safe-publish-admin-container">
				<div class="safe-publish-settings-section">
					<h2><?php esc_html_e( 'Configuration', 'safe-publish' ); ?></h2>

					<form method="post" action="options.php">
						<?php
						settings_fields( Options::SETTINGS_GROUP );
						do_settings_sections( Options::SETTINGS_GROUP );
						?>

						<table class="form-table">
							<tr>
								<th scope="row">
									<?php esc_html_e( 'Sync Mode', 'safe-publish' ); ?>
								</th>
								<td>
									<fieldset>
										<legend class="screen-reader-text">
											<?php esc_html_e( 'Sync Mode', 'safe-publish' ); ?>
										</legend>
										<label>
											<input
												type="radio"
												name="safe_publish_sync_mode"
												value="<?php echo esc_attr( Options::SYNC_MODE_EXPORT ); ?>"
												<?php checked( $sync_mode, Options::SYNC_MODE_EXPORT ); ?>
											/>
											<?php esc_html_e( 'Source - Content will come from this site.', 'safe-publish' ); ?>
										</label><br />
										<label>
											<input
												type="radio"
												name="safe_publish_sync_mode"
												value="<?php echo esc_attr( Options::SYNC_MODE_IMPORT ); ?>"
												<?php checked( $sync_mode, Options::SYNC_MODE_IMPORT ); ?>
											/>
											<?php esc_html_e( 'Destination - Content will be published to this site', 'safe-publish' ); ?>
										</label><br />
										<label>
											<input
												type="radio"
												name="safe_publish_sync_mode"
												value="<?php echo esc_attr( Options::SYNC_MODE_BIDIRECTIONAL ); ?>"
												<?php checked( $sync_mode, Options::SYNC_MODE_BIDIRECTIONAL ); ?>
											/>
											<?php esc_html_e( 'Bidirectional - Content syncs in both directions.', 'safe-publish' ); ?>
										</label>
									</fieldset>
								</td>
							</tr>

							<tr>
								<th scope="row">
									<label for="safe_publish_connected_site_url">
										<?php esc_html_e( 'Connected Site URL', 'safe-publish' ); ?>
									</label>
								</th>
								<td>
									<input
										type="url"
										id="safe_publish_connected_site_url"
										name="safe_publish_connected_site_url"
										value="<?php echo esc_attr( $connected_site_url ); ?>"
										class="regular-text"
										placeholder="<?php echo esc_attr__( 'https://example.com', 'safe-publish' ); ?>"
									/>
								</td>
							</tr>

							<tr class="safe-publish-import-field-row<?php echo $show_import_fields ? '' : ' hidden'; ?>">
								<th scope="row">
									<?php esc_html_e( 'Basic Auth Credentials', 'safe-publish' ); ?>
								</th>
								<td>
									<p class="description">
										<?php esc_html_e( 'Only needed if the connected site is protected by HTTP Basic Authentication. Leave blank otherwise.', 'safe-publish' ); ?>
									</p><br />
									<label for="safe_publish_basic_auth_username" class="screen-reader-text">
										<?php esc_html_e( 'Basic Auth Username', 'safe-publish' ); ?>
									</label>
									<input
										type="text"
										id="safe_publish_basic_auth_username"
										name="safe_publish_basic_auth_username"
										value="<?php echo esc_attr( $username ); ?>"
										class="regular-text"
										placeholder="<?php echo esc_attr__( 'Username', 'safe-publish' ); ?>"
										autocomplete="username"
									/>
									<br />
									<label for="safe_publish_basic_auth_password" class="screen-reader-text">
										<?php esc_html_e( 'Basic Auth Password', 'safe-publish' ); ?>
									</label>
									<?php if ( $password_is_external ) : ?>
										<input
											type="text"
											id="safe_publish_basic_auth_password"
											value="<?php echo esc_attr__( 'Configured externally', 'safe-publish' ); ?>"
											class="regular-text"
											readonly
											aria-readonly="true"
											data-configured-externally="1"
											autocomplete="off"
											style="margin-top: 4px;"
										/>
									<?php else : ?>
										<input
											type="password"
											id="safe_publish_basic_auth_password"
											name="safe_publish_basic_auth_password"
											value="<?php echo esc_attr( $password ); ?>"
											class="regular-text"
											placeholder="<?php echo esc_attr__( 'Password', 'safe-publish' ); ?>"
											autocomplete="current-password"
											style="margin-top: 4px;"
										/>
									<?php endif; ?>
									
								</td>
							</tr>

							<tr class="safe-publish-import-field-row<?php echo $show_import_fields ? '' : ' hidden'; ?>">
								<th scope="row"><?php esc_html_e( 'Test current connection settings', 'safe-publish' ); ?></th>
								<td>
									<button type="button" id="safe-publish-test-connection" class="button button-secondary">
										<?php esc_html_e( 'Test Connection', 'safe-publish' ); ?>
									</button>
									<div id="safe-publish-test-connection-result" style="margin-top: 8px; max-width: 500px; padding: 10px;"></div>
								</td>
							</tr>

						</table>

					<?php submit_button(); ?>
				</form>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Enqueues the settings page script and its data global.
	 */
	public function enqueue_assets(): void {
		if ( ! is_admin() ) {
			return;
		}

		$data = array(
			'importModes' => array(
				Options::SYNC_MODE_IMPORT,
				Options::SYNC_MODE_BIDIRECTIONAL,
			),
			'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
			'nonce'       => wp_create_nonce( 'safe_publish_ajax_nonce' ),
			'i18n'        => array(
				'enterUrlFirst'     => __(
					'Please enter a Connected Site URL first.',
					'safe-publish'
				),
				'connectionFailed'  => __(
					'Connection test failed.',
					'safe-publish'
				),
				'networkError'      => __(
					'Network error while testing the connection.',
					'safe-publish'
				),
				'statusUnavailable' => __(
					'Could not check the connection status. Reload the page to try again.',
					'safe-publish'
				),
			),
		);

		$json = wp_json_encode( $data );

		if ( false === $json ) {
			return;
		}

		wp_enqueue_script(
			'safe-publish-settings-script',
			SAFE_PUBLISH_PLUGIN_URL . 'assets/js/settings-page.js',
			array(),
			SAFE_PUBLISH_VERSION,
			true
		);

		wp_add_inline_script(
			'safe-publish-settings-script',
			'window.safePublishSettingsData = ' . $json . ';',
			'before'
		);
	}
}
