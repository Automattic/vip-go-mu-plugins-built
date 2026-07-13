<?php
/**
 * Hi there, VIP dev!
 *
 * vip-config.php is where you put things you'd usually put in wp-config.php. Don't worry about database settings
 * and such, we've taken care of that for you. This is a good place to define a constant or something of that
 * nature. However, consider using environment variables for anything sensitive or environment-specific:
 *
 * @see https://docs.wpvip.com/infrastructure/environments/manage-environment-variables/
 *
 * WARNING: This file is loaded very early (immediately after `wp-config.php`), which means that most WordPress APIs,
 *   classes, and functions are not available. The code below should be limited to pure PHP.
 *
 * @see https://docs.wpvip.com/wordpress-skeleton/vip-config-directory/
 *
 * Happy coding!
 *
 * - The WordPress VIP Team
 **/

/**
 * Limit the number of revisions retained per post.
 *
 * By default, all revisions are retained. Use this constant to reduce the number of revisions retained per post.
 *
 * Feel free to adjust the value depending on your use cases (e.g. posts with a very high revision count can result in performance issues).
 *
 * @see https://docs.wpvip.com/wordpress-on-vip/post-revisions/
 *
 */
/*
if ( ! defined( 'WP_POST_REVISIONS' ) ) {
	define( 'WP_POST_REVISIONS', 100 );
}
*/

/**
 * The VIP_JETPACK_IS_PRIVATE constant is enabled by default in non-production environments.
 *
 * It disables programmatic access to content via the WordPress.com REST API and Jetpack Search;
 * subscriptions via the WordPress.com Reader; and syndication via the WordPress.com Firehose.
 *
 * You can disable "private" mode (e.g. for testing) in non-production environment by setting the constant to `false` below (or just by removing the lines).
 *
 * @see https://docs.wpvip.com/wordpress-on-vip/jetpack/content-distribution/
 */
if ( ! defined( 'VIP_JETPACK_IS_PRIVATE' ) &&
	defined( 'VIP_GO_APP_ENVIRONMENT' ) &&
	'production' !== VIP_GO_APP_ENVIRONMENT ) {
	define( 'VIP_JETPACK_IS_PRIVATE', true );
}

/**
 * Disable New Relic Browser instrumentation.
 *
 * By default, the New Relic extension automatically enables Browser instrumentation.
 *
 * This injects some New Relic specific javascript onto all pages on the VIP Platform.
 *
 * This isn't always desireable (e.g. impacts performance) so let's turn it off.
 *
 * If you would like to enable Browser instrumentation, please remove the lines below.
 *
 * @see https://docs.newrelic.com/docs/apm/agents/php-agent/features/browser-monitoring-php-agent/#disable
 * @see https://docs.wpvip.com/performance/new-relic/
 */
if ( function_exists( 'newrelic_disable_autorum' ) ) {
	newrelic_disable_autorum();
}

/**
 * Set WP_DEBUG to true for all local or non-production VIP environments to ensure
 * _doing_it_wrong() notices display in Query Monitor. This also changes the error_reporting level to E_ALL.
 *
 * @see https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/#wp_debug
 */
if ( ( ! defined( 'VIP_GO_APP_ENVIRONMENT' ) || ( defined( 'VIP_GO_APP_ENVIRONMENT' ) && 'production' !== VIP_GO_APP_ENVIRONMENT ) )
	&& ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', true );
}
