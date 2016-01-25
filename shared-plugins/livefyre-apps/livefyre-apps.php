<?php
/*
Plugin Name: Livefyre Apps
Plugin URI: http://www.livefyre.com/
Description: Livefyre Apps combines social media functionality with your Wordpress site in real-time.  
Version: 1.2
Author: Livefyre, Inc.
Author URI: http://www.livefyre.com/
 */

/**
 * Define plugin constants
 */
define('LFAPPS__PLUGIN_PATH', dirname( __FILE__ ) . DIRECTORY_SEPARATOR);
define('LFAPPS__PLUGIN_URL', plugin_dir_url( __FILE__ ));
define('LFAPPS__VERSION', '1.1');
define('LFAPPS__PROTOCOL', isset($_SERVER['HTTPS']) && !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http');
define('LFAPPS__MIN_PHP_VERSION', '5.3');
/*
 * Perform PHP version check
 */
if(version_compare(phpversion(), LFAPPS__MIN_PHP_VERSION) === -1) {
    function lfapps_php_version_notice() {
        ?>
        <div class="error">
            <p><?php esc_html_e('Livefyre Apps: You must have PHP Version ' . LFAPPS__MIN_PHP_VERSION . ' or higher to run Livefyre Apps! Current PHP version: ' . phpversion(), 'lfapps'); ?></p>
        </div>
        <?php
    }
    add_action( 'admin_notices', 'lfapps_php_version_notice' );
} else {
    /**
     * Load Main Class
     */
    require_once ( LFAPPS__PLUGIN_PATH . '/Livefyre_Apps.php' );
    add_action( 'init', array( 'Livefyre_Apps', 'init' ) );

    /**
     * Load Admin Class if inside wp-admin
     */
    if(is_admin()) {
        require_once( LFAPPS__PLUGIN_PATH . "/Livefyre_Apps_Admin.php" );  
        add_action( 'admin_init', array('Livefyre_Apps_Admin', 'init_settings'));
        add_action( 'init', array( 'Livefyre_Apps_Admin', 'init' ) );
    }
}