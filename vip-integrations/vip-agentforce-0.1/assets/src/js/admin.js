/**
 * Admin UI helpers for VIP Agentforce.
 */

(function () {
	/**
	 * Toggle consent-provider specific settings rows based on consent type.
	 *
	 * @return {void}
	 */
	function initConsentTypeFieldToggles() {
		const consentType = document.querySelector(
			'[name="vip_agentforce_consent_type"]'
		);

		if (!consentType) {
			return;
		}

		const oneTrustRow = document.getElementById('row_onetrust');
		const cookiebotRow = document.getElementById('row_cookiebot');
		const iubendaRow = document.getElementById('row_iubenda');

		const toggleRow = (row, shouldShow) => {
			if (!row) {
				return;
			}

			row.style.display = shouldShow ? '' : 'none';
		};

		const toggleFields = () => {
			toggleRow(oneTrustRow, consentType.value === 'OneTrust');
			toggleRow(cookiebotRow, consentType.value === 'CookieBot');
			toggleRow(iubendaRow, consentType.value === 'iubenda');
		};

		toggleFields();
		consentType.addEventListener('change', toggleFields);
	}

	if (document.readyState === 'loading') {
		document.addEventListener(
			'DOMContentLoaded',
			initConsentTypeFieldToggles
		);
		return;
	}

	initConsentTypeFieldToggles();
})();
