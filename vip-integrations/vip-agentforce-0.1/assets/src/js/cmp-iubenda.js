/**
 * iubenda CMP integration for Agentforce SDK
 *
 * REQUIRED CONFIGURATION:
 * For this plugin to work correctly with iubenda, you must add the following
 * callback to your existing iubenda configuration:
 *
 * Add this to your existing _iub.csConfiguration object:
 *
 * "callback": {
 *   "onPreferenceExpressed": function(preference) {
 *     document.dispatchEvent(new CustomEvent('iubendaPreferenceUpdate', { detail: preference }));
 *   }
 * }
 *
 * Example - if your existing config looks like this:
 * var _iub = _iub || [];
 * _iub.csConfiguration = {
 *   "siteId": 1234567,
 *   "cookiePolicyId": 7654321,
 *   "lang": "en",
 *   "storage": {"useSiteId": true}
 * };
 *
 * Update it to include the callback:
 * var _iub = _iub || [];
 * _iub.csConfiguration = {
 *   "siteId": 1234567,
 *   "cookiePolicyId": 7654321,
 *   "lang": "en",
 *   "storage": {"useSiteId": true},
 *   "callback": {
 *     "onPreferenceExpressed": function(preference) {
 *       document.dispatchEvent(new CustomEvent('iubendaPreferenceUpdate', { detail: preference }));
 *     }
 *   }
 * };
 *
 * The callback dispatches a custom event 'iubendaPreferenceUpdate' that this
 * plugin listens for to determine when to load/unload the Agentforce SDK
 * based on the configured purpose ID consent status.
 */

/**
 * Internal dependencies
 */
import { loadAgentforceSDK, unloadAgentforceSDK } from './cmp-manager';

// Get the configured purpose ID from the localized data (default to 5 - Marketing)
const PURPOSE_ID =
	(window.vipAgentforceConsentData && window.vipAgentforceConsentData.iubendaPurposeId) || '5';

// Checks iubenda consent and loads/unloads SDK
const checkIubendaConsent = preference => {
	// If preference is passed directly (from event), use it
	if (preference?.purposes) {
		// Check if the configured purpose ID has consent
		if (preference.purposes[PURPOSE_ID] === true) {
			loadAgentforceSDK();
		} else {
			unloadAgentforceSDK();
		}
		return;
	}

	// Fallback: check global _iub object if available
	if (window._iub?.cs?.api?.getPreferences) {
		try {
			const preferences = window._iub.cs.api.getPreferences();
			if (preferences?.purposes?.[PURPOSE_ID] === true) {
				loadAgentforceSDK();
			} else {
				unloadAgentforceSDK();
			}
		} catch (error) {
			// Silent fail.
		}
	}
};

// Listen for iubenda custom preference update event
document.addEventListener('iubendaPreferenceUpdate', event => {
	if (event.detail) {
		checkIubendaConsent(event.detail);
	}
});
