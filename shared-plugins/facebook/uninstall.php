<?php
/**
 * Remove data written by the Facebook plugin for WordPress after an administrative user clicks "Delete" from the plugin management page in wp-admin.
 *
 * @since 1.1
 * @todo post meta data
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) )
	exit();

if ( ! class_exists( 'Facebook_User' ) )
	require_once( dirname(__FILE__) . '/facebook-user.php' );

// user data
$__user_id = get_current_user_id();
foreach ( array('state', 'code', 'access_token', 'user_id', 'fb_data', 'facebook_timeline_disabled') as $meta_key ) {
	Facebook_User::delete_user_meta( $__user_id, $meta_key );
}
unset( $__user_id );

// site options
$__options = array(
	'fb_options', // did not delete the old options on migration in case we needed to rerun
	'facebook_application',
	'facebook_comments',
	'facebook_comments_enabled',
	'facebook_like_button',
	'facebook_recommendations_bar',
	'facebook_send_button',
	'facebook_mentions',
	'facebook_publish_page',
	'facebook_follow_button',
	'facebook_home_features',
	'facebook_archive_features'
);

$__public_post_types = get_post_types( array( 'public' => true ) );
foreach ( $__public_post_types as $post_type ) {
	$__options[] = 'facebook_' . $post_type . '_features';
}
unset( $__public_post_types );

foreach ( $__options as $option_name ) {
	delete_option( $option_name );
}
unset( $__options );
?>