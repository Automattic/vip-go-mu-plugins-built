<?php

namespace Automattic\VIP\Salesforce\Agentforce;

class Constants {
	const LOG_PLUGIN_NAME = 'vip-agentforce';
	const SUPPORTED_CMPS  = array( 'CookieYes', 'CookieBot', 'OneTrust', 'iubenda', 'Custom' );
	const DEFAULT_CMP     = 'Custom';

	/**
	 * Default OneTrust consent group ID
	 */
	const DEFAULT_ONETRUST_GROUP_ID = 'C0004';

	/**
	 * Default Cookiebot category
	 */
	const DEFAULT_COOKIEBOT_CATEGORY = 'marketing';

	/**
	 * Default iubenda Purpose ID
	 */
	const DEFAULT_IUBENDA_PURPOSE_ID = '5';
}
