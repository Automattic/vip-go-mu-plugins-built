<?php
/*
 Plugin Name: Cron Control
 Plugin URI:
 Description: Execute WordPress cron events in parallel, using a custom post type for event storage.
 Author: Erick Hitter, Automattic
 Version: 1.0
 Text Domain: automattic-cron-control
 */

namespace Automattic\WP\Cron_Control;

// Load basics needed to instantiate plugin
require __DIR__ . '/includes/constants.php';
require __DIR__ . '/includes/utils.php';
require __DIR__ . '/includes/abstract-class-singleton.php';
require __DIR__ . '/includes/class-lock.php';

// For data consistency, ensure alternate data store is always loaded
require __DIR__ . '/includes/class-cron-options-cpt.php';

// Instantiate main plugin class, which checks environment and loads remaining classes when appropriate
require __DIR__ . '/includes/class-main.php';
Main::instance();
