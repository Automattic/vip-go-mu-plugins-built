/**
 * Agentforce CMP Custom Script.
 */
/**
 * Internal dependencies
 */
import { loadAgentforceSDK, unloadAgentforceSDK } from './cmp-manager';

window.AgentforceCMP = {
	loadSDK: loadAgentforceSDK,
	unloadSDK: unloadAgentforceSDK,
	isConsentGranted: () => !! window.AFConsentGranted,
};
