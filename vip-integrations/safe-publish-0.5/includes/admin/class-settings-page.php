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

				<script>
				( function () {
					const importModes = [ '<?php echo esc_js( Options::SYNC_MODE_IMPORT ); ?>', '<?php echo esc_js( Options::SYNC_MODE_BIDIRECTIONAL ); ?>' ];

					/**
					 * Toggles visibility of form rows that are only relevant in Import
					 * or Bidirectional sync mode.
					 */
					function toggleImportFields() {
						const selected = document.querySelector( 'input[name="safe_publish_sync_mode"]:checked' );
						const show = selected && importModes.indexOf( selected.value ) !== -1;
						document.querySelectorAll( '.safe-publish-import-field-row' ).forEach( function ( row ) {
							row.classList.toggle( 'hidden', ! show );
						} );
					}

					/**
					 * Wires up the Sync Mode radio buttons to show/hide Import-only fields.
					 */
					function initImportFieldToggle() {
						document.querySelectorAll( 'input[name="safe_publish_sync_mode"]' ).forEach( function ( radio ) {
							radio.addEventListener( 'change', toggleImportFields );
						} );
					}

					/**
					 * POSTs a test connection request using the current live values from
					 * the Connected Site URL, Username, and Password fields, and shows
					 * the result inline.
					 *
					 * @param {HTMLButtonElement} testBtn  Button element, disabled while testing.
					 * @param {HTMLElement}       resultEl Element where the result message is rendered.
					 * @param {string}            ajaxUrl  WordPress AJAX endpoint URL.
					 * @param {string}            nonce    Nonce for the safe_publish_ajax_nonce action.
					 */
					function testConnection( testBtn, resultEl, ajaxUrl, nonce ) {
						const connectedSiteUrl = document.getElementById( 'safe_publish_connected_site_url' ).value;
						const usernameEl       = document.getElementById( 'safe_publish_basic_auth_username' );
						const passwordEl       = document.getElementById( 'safe_publish_basic_auth_password' );

						if ( ! connectedSiteUrl ) {
							resultEl.className   = 'notice notice-error inline';
							resultEl.textContent = "<?php echo esc_js( __( 'Please enter a Connected Site URL first.', 'safe-publish' ) ); ?>";
							return;
						}

						testBtn.disabled     = true;
						resultEl.textContent = '';
						resultEl.className   = '';

						const formData = new FormData();
						formData.append( 'action', 'safe_publish_test_connection' );
						formData.append( 'nonce', nonce );
						formData.append( 'connected_site_url', connectedSiteUrl );
						if ( usernameEl && ! usernameEl.dataset.configuredExternally ) {
							formData.append( 'username', usernameEl.value );
						}
						if ( passwordEl && ! passwordEl.dataset.configuredExternally ) {
							formData.append( 'password', passwordEl.value );
						}

						fetch( ajaxUrl, { method: 'POST', body: formData } )
							.then( function ( r ) { return r.json(); } )
							.then( function ( data ) {
								if ( data.success && data.data ) {
									const msg = data.data.response_time
										? data.data.message + ' (Response time: ' + data.data.response_time + 'ms)'
										: data.data.message;
									resultEl.className   = data.data.success ? 'notice notice-success inline' : 'notice notice-error inline';
									resultEl.textContent = msg;
								} else {
									resultEl.className   = 'notice notice-error inline';
									resultEl.textContent = data.data && data.data.message
										? data.data.message
										: "<?php echo esc_js( __( 'Connection test failed.', 'safe-publish' ) ); ?>";
								}
							} )
							.catch( function () {
								resultEl.className   = 'notice notice-error inline';
								resultEl.textContent = "<?php echo esc_js( __( 'Network error occurred during connection test.', 'safe-publish' ) ); ?>";
							} )
							.finally( function () {
								testBtn.disabled = false;
							} );
					}

					/**
					 * Wires up the Test Connection button to call testConnection() on click.
					 */
					function initTestConnectionButton() {
						const testBtn  = document.getElementById( 'safe-publish-test-connection' );
						const resultEl = document.getElementById( 'safe-publish-test-connection-result' );

						if ( ! testBtn || ! resultEl ) {
							return;
						}

						const ajaxUrl = "<?php echo esc_js( admin_url( 'admin-ajax.php' ) ); ?>";
						const nonce   = "<?php echo esc_js( wp_create_nonce( 'safe_publish_ajax_nonce' ) ); ?>";

						testBtn.addEventListener( 'click', function () {
							testConnection( testBtn, resultEl, ajaxUrl, nonce );
						} );
					}

					/**
					 * Renders the cached auth probe status into the banner element.
					 *
					 * @param {HTMLElement} banner Banner container element.
					 * @param {string}      status Probe status string from the AJAX response.
					 */
					function renderAuthStatusBanner( banner, status ) {
						if ( 'authorized' === status ) {
							banner.hidden    = true;
							banner.className = 'safe-publish-auth-status-banner safe-publish-import-field-row';
							banner.innerHTML = '';
							return;
						}

						let level   = 'warning';
						let message = '';

						if ( 'unauthorized' === status ) {
							level   = 'error';
							message = "<?php echo esc_js( __( 'Connected site rejected the shared secret. Set SAFE_PUBLISH_SHARED_SECRET in wp-config.php on both sites to the same value (at least 16 characters).', 'safe-publish' ) ); ?>";
						} else if ( 'unreachable' === status ) {
							message = "<?php echo esc_js( __( 'Connected site could not be reached. Verify the connected site URL and that the site is online.', 'safe-publish' ) ); ?>";
						} else {
							message = "<?php echo esc_js( __( 'Connected site URL is not configured.', 'safe-publish' ) ); ?>";
						}

						banner.hidden    = false;
						banner.className = 'safe-publish-auth-status-banner safe-publish-import-field-row notice notice-' + level + ' inline';
						banner.innerHTML = '<p></p>';
						banner.querySelector( 'p' ).textContent = message;
					}

					/**
					 * Fetches the cached auth probe status and renders the banner.
					 */
					function initAuthStatusBanner() {
						const banner = document.getElementById( 'safe-publish-auth-status-banner' );

						if ( ! banner ) {
							return;
						}

						const ajaxUrl = "<?php echo esc_js( admin_url( 'admin-ajax.php' ) ); ?>";
						const nonce   = "<?php echo esc_js( wp_create_nonce( 'safe_publish_ajax_nonce' ) ); ?>";

						const formData = new FormData();
						formData.append( 'action', 'safe_publish_auth_status' );
						formData.append( 'nonce', nonce );

						fetch( ajaxUrl, { method: 'POST', body: formData } )
							.then( function ( r ) { return r.json(); } )
							.then( function ( data ) {
								if ( data && data.success && data.data && data.data.status ) {
									renderAuthStatusBanner( banner, data.data.status );
								} else {
									renderAuthStatusBanner( banner, 'unreachable' );
								}
							} )
							.catch( function () {
								renderAuthStatusBanner( banner, 'unreachable' );
							} );
					}

					initImportFieldToggle();
					initTestConnectionButton();
					initAuthStatusBanner();
				} )();
				</script>
				</div>
			</div>
		</div>
		<?php
	}
}
