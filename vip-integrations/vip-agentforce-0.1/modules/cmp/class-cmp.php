<?php
/**
 * Plugin manifest class.
 */

namespace Automattic\VIP\Salesforce\Agentforce\Cmp;

use Automattic\VIP\Salesforce\Agentforce\Utils\Traits\Singleton;

/**
 * Class Cmp
 */
class Cmp {

	use Singleton;

	/**
	 * Construct method.
	 */
	protected function __construct() {

		// Load plugin classes.
		Assets::get_instance();
		Settings_Page::get_instance();
		Agentforce::get_instance();
	}
}
