<?php

require __DIR__ . '/class.wpcom-vip-plugins-ui.php';

/**
 * The main function responsible for returning the one true WPCOM_VIP_Plugins_UI instance to functions everywhere.
 *
 * Use this function like you would a global variable, except without needing to declare the global.
 * Example: <?php $WPCOM_VIP_Plugins_UI = WPCOM_VIP_Plugins_UI(); ?>
 *
 * @return WPCOM_VIP_Plugins_UI The one true WPCOM_VIP_Plugins_UI Instance
 */
function WPCOM_VIP_Plugins_UI() {
	return WPCOM_VIP_Plugins_UI::instance();
}

// Start up the class immediately.
WPCOM_VIP_Plugins_UI();
