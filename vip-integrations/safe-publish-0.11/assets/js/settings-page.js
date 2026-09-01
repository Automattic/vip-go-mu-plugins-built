/**
 * Settings page behavior: Import-field toggling, connection testing, and the
 * auth-status banner.
 *
 * Reads the PHP-provided AJAX URL, nonce, import modes, and translated
 * strings from the window.safePublishSettingsData global, injected via
 * wp_add_inline_script().
 */
( function () {
	const settings    = window.safePublishSettingsData;
	const importModes = settings.importModes;
	const i18n        = settings.i18n;

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

		if ( ! connectedSiteUrl ) {
			resultEl.className   = 'notice notice-error inline';
			resultEl.textContent = i18n.enterUrlFirst;
			return;
		}

		const usernameEl = document.getElementById( 'safe_publish_basic_auth_username' );
		const passwordEl = document.getElementById( 'safe_publish_basic_auth_password' );

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
			.then( function ( response ) { return response.json(); } )
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
						: i18n.connectionFailed;
				}
			} )
			.catch( function () {
				resultEl.className   = 'notice notice-error inline';
				resultEl.textContent = i18n.networkError;
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

		testBtn.addEventListener( 'click', function () {
			testConnection( testBtn, resultEl, settings.ajaxUrl, settings.nonce );
		} );
	}

	/**
	 * Renders the auth probe result into the banner. The server
	 * supplies the message; status only sets the notice level and
	 * visibility.
	 *
	 * @param {HTMLElement} banner  Banner container element.
	 * @param {string}      status  Probe status string.
	 * @param {string}      message Server-rendered description.
	 */
	function renderAuthStatusBanner( banner, status, message ) {
		if ( 'authorized' === status ) {
			banner.hidden    = true;
			banner.className = 'safe-publish-auth-status-banner safe-publish-import-field-row';
			banner.innerHTML = '';
			return;
		}

		const level = ( 'unauthorized' === status || 'blocked' === status ) ? 'error' : 'warning';

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

		const fallback = i18n.statusUnavailable;

		const formData = new FormData();
		formData.append( 'action', 'safe_publish_auth_status' );
		formData.append( 'nonce', settings.nonce );

		fetch( settings.ajaxUrl, { method: 'POST', body: formData } )
			.then( function ( response ) { return response.json(); } )
			.then( function ( data ) {
				if ( data && data.success && data.data && data.data.status ) {
					renderAuthStatusBanner( banner, data.data.status, data.data.message );
				} else {
					renderAuthStatusBanner( banner, 'unreachable', fallback );
				}
			} )
			.catch( function () {
				renderAuthStatusBanner( banner, 'unreachable', fallback );
			} );
	}

	initImportFieldToggle();
	initTestConnectionButton();
	initAuthStatusBanner();
} )();
