<?php

namespace Automattic\VIP\Salesforce\Agentforce;

class Constants {
	const LOG_PLUGIN_NAME = 'vip-agentforce';
	const SUPPORTED_CMPS  = array( 'CookieYes', 'Cookiebot', 'OneTrust', 'iubenda', 'Custom' );
	const DEFAULT_CMP     = 'Custom';

	/**
	 * Stored consent type values that have since been renamed, mapped to their
	 * current value.
	 *
	 * The consent type is persisted in `vip_agentforce_consent_type`, so renaming a
	 * value orphans every site already holding the old one. Without this map they
	 * would fail validation, silently fall back to the default CMP, and lose the
	 * consent gating they configured.
	 */
	const LEGACY_CMP_ALIASES = array( 'CookieBot' => 'Cookiebot' );

	const COOKIEYES_CATEGORIES       = array( 'necessary', 'functional', 'analytics', 'performance', 'advertisement' );
	const DEFAULT_COOKIEYES_CATEGORY = 'functional';

	const COOKIEBOT_CATEGORIES = array( 'necessary', 'preferences', 'statistics', 'marketing' );

	/**
	 * Default Cookiebot category.
	 *
	 * "preferences" is Cookiebot's equivalent of the functional bucket the other CMP
	 * defaults target. The agent is a support widget, not an advertising integration.
	 */
	const DEFAULT_COOKIEBOT_CATEGORY = 'preferences';

	/**
	 * Default OneTrust consent group ID.
	 *
	 * C0003 is "Functional Cookies" in OneTrust's stock template. Group IDs are
	 * renameable per customer, so this is a starting point rather than a safe
	 * assumption - confirm the site's own group IDs before relying on it.
	 */
	const DEFAULT_ONETRUST_GROUP_ID = 'C0003';

	/**
	 * Default iubenda Purpose ID.
	 *
	 * Purpose 2 is Functionality, used for live chat and support widgets.
	 */
	const DEFAULT_IUBENDA_PURPOSE_ID = '2';

	/**
	 * Salesforce-owned domain suffixes the Agentforce embed URLs may point at (bootstrap
	 * script, Experience Cloud site, and SCRT2 messaging endpoint).
	 * Extend via the `vip_agentforce_allowed_bootstrap_hosts` filter for custom domains.
	 */
	const ALLOWED_BOOTSTRAP_HOST_SUFFIXES = array(
		'salesforce.com',
		'force.com',
		'my.site.com',
		'salesforce-sites.com',
		'salesforce-scrt.com',
	);
}
