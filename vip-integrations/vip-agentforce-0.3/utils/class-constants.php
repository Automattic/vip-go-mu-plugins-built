<?php

namespace Automattic\VIP\Salesforce\Agentforce;

class Constants {
	const LOG_PLUGIN_NAME = 'vip-agentforce';
	const SUPPORTED_CMPS  = array( 'CookieYes', 'CookieBot', 'OneTrust', 'iubenda', 'Custom' );
	const DEFAULT_CMP     = 'Custom';

	const COOKIEYES_CATEGORIES       = array( 'necessary', 'functional', 'analytics', 'performance', 'advertisement' );
	const DEFAULT_COOKIEYES_CATEGORY = 'functional';

	const COOKIEBOT_CATEGORIES       = array( 'necessary', 'preferences', 'statistics', 'marketing' );
	const DEFAULT_COOKIEBOT_CATEGORY = 'marketing';

	/**
	 * Default OneTrust consent group ID
	 */
	const DEFAULT_ONETRUST_GROUP_ID = 'C0004';

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
