<?php
/**
 * Removes everything Share a Draft stored when the plugin is deleted.
 *
 * Preview links hold reviewers' email addresses, so they must not outlive the
 * plugin. Deactivation already clears the scheduled jobs; they are cleared again
 * here in case the plugin was deleted without being deactivated first.
 *
 * Runs without the plugin loaded, so the names are spelled out rather than read
 * from the classes that own them.
 *
 * @package shareadraft
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$vip_shareadraft_uninstall_site = static function (): void {
	delete_post_meta_by_key( '_shareadraft_token' );
	delete_post_meta_by_key( '_shareadraft_uses' );

	foreach ( [ 'shareadraft_disabled', 'shareadraft_gc_cursor', 'shareadraft_gc_last_run', 'shareadraft_bulk_revoke_jobs', 'ShareADraft_options' ] as $option ) {
		delete_option( $option );
	}

	wp_clear_scheduled_hook( 'shareadraft_prune_links' );
	wp_clear_scheduled_hook( 'shareadraft_bulk_revoke' );
};

if ( is_multisite() ) {
	$vip_shareadraft_site_ids = get_sites(
		[
			'fields' => 'ids',
			'number' => 0,
		]
	);

	foreach ( $vip_shareadraft_site_ids as $vip_shareadraft_site_id ) {
		switch_to_blog( (int) $vip_shareadraft_site_id );
		$vip_shareadraft_uninstall_site();
		restore_current_blog();
	}
} else {
	$vip_shareadraft_uninstall_site();
}

// The admin table's per-page screen option is stored against each user.
delete_metadata( 'user', 0, 'shareadraft_links_per_page', '', true );
