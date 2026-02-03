/**
 * OneTrust CMP integration for Agentforce SDK.
 */

/**
 * Internal dependencies
 */
import { loadAgentforceSDK, unloadAgentforceSDK } from './cmp-manager';

// Get the consent group ID from the localized data
// The backend default is defined in Assets::DEFAULT_ONETRUST_GROUP_ID
const CONSENT_GROUP_ID =
	(window.vipAgentforceConsentData && window.vipAgentforceConsentData.groupId) || '';

const hasConsent = () => {
	if (typeof window.OnetrustActiveGroups === 'string') {
		const groups = window.OnetrustActiveGroups.split(',');
		return groups.includes(CONSENT_GROUP_ID);
	}
	return false;
};

const checkOneTrustConsent = () => {
	if (hasConsent()) {
		loadAgentforceSDK();
	} else {
		unloadAgentforceSDK();
	}
};

// Extend the global OptanonWrapper function
const originalOptanonWrapper = window.OptanonWrapper || function () {};
window.OptanonWrapper = function () {
	// Call the original wrapper if it exists
	originalOptanonWrapper();

	// Check consent after OneTrust is fully loaded
	checkOneTrustConsent();
};

// Listen for OneTrust consent changes
document.addEventListener('OneTrustGroupsUpdated', checkOneTrustConsent);

// Also listen via the official API when available
// This provides redundancy in case the event listener doesn't catch all changes
if (typeof OneTrust !== 'undefined' && typeof OneTrust.OnConsentChanged === 'function') {
	OneTrust.OnConsentChanged(checkOneTrustConsent);
}
