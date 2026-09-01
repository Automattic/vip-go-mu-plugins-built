<?php
/**
 * Uninstall script.
 *
 * @package VIPWorkflows
 */

// Exit if accessed directly or not during uninstall.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Load the schema class to drop tables.
require_once __DIR__ . '/includes/database/class-schema.php';

$schema = new \VIPWorkflows\Database\Schema();
$schema->uninstall();

// Delete options.
delete_option( 'vip_workflows_db_version' );
