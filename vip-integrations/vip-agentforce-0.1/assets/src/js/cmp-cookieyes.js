/**
 * CookieYes CMP integration for Agentforce.
 */

/**
 * Internal dependencies
 */
import { loadAgentforceSDK, unloadAgentforceSDK } from './cmp-manager';

// Check CookieYes consent and load/unload SDK
const checkCookieYesConsent = () => {
	try {
		const consent = typeof window.getCkyConsent === 'function' ? window.getCkyConsent() : null;
		if (
			consent &&
			consent.categories &&
			consent.categories.advertisement === true
		) {
			loadAgentforceSDK();
		} else {
			unloadAgentforceSDK();
		}
	} catch ( error ) {
		// Silent fail
	}
};

// On DOM ready, check consent
document.addEventListener( 'DOMContentLoaded', checkCookieYesConsent );

// Listen for CookieYes consent changes
document.addEventListener( 'cky-consent-updated', checkCookieYesConsent );
