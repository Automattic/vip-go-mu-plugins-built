<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\AdminNotices;

use Psr\Log\LogLevel;
use RemoteDataBlocks\Logging\LoggerManager;
use function add_action;

defined( 'ABSPATH' ) || exit();

class AdminNotices {
	/**
	 * An in-memory store for log messages used for display in an admin notice.
	 *
	 * @var array<int, array<string, string>>
	 */
	private static array $log_store = [];

	/**
	 * Log level threshold that must be met for user to see an admin notice.
	 */
	private static string $log_level_threshold = LogLevel::ERROR;

	/**
	 * The number limit of messages to display in the admin notice.
	 */
	private static int $message_display_limit = 3;

	/**
	 * Initialize the logger and provide WordPress hooks.
	 */
	public static function init(): void {
		add_action( 'wpcomvip_log', [ __CLASS__, 'store_log' ], 10, 3 );
		add_action( 'admin_notices', [ __CLASS__, 'admin_notices' ], 10, 0 );
	}

	public static function store_log( string $namespace, string $log_level, string $message ): void {
		if ( LoggerManager::$log_namespace !== $namespace ) {
			return;
		}

		if ( ! LoggerManager::instance()->is_log_level_higher( $log_level, self::$log_level_threshold ) ) {
			return;
		}

		self::$log_store[] = [
			'level' => $log_level,
			'message' => $message,
		];
	}

	/**
	 * Display an admin notice if there are non-
	 */
	public static function admin_notices(): void {
		if ( empty( self::$log_store ) ) {
			return;
		}

		// Get the first 3 messages.
		$recent_messages = array_slice( self::$log_store, 0, self::$message_display_limit );
		$overflow_count = count( self::$log_store ) - self::$message_display_limit;

		// Provide instructions depending on whether Query Monitor is active.
		$instructions = defined( 'QM_VERSION' ) ? 'Please review Query Monitor’s “Logs” panel for more information.' : 'Please install the Query Monitor plugin and review the “Logs” panel for more information.';

		?>
		<div class="notice notice-error">
			<h3>Remote Data Blocks Errors</h3>
			<ul>
		<?php

		foreach ( $recent_messages as $message ) {
			printf( '<li><strong>%s</strong>: %s</li>', esc_html( strtoupper( $message['level'] ) ), esc_html( $message['message'] ) );
		}

		if ( $overflow_count > 0 ) {
			printf( '<li><em>... and %d more</em></li>', intval( $overflow_count ) );
		}

		?>
			<p><?php echo esc_html( $instructions ); ?></p>
		</div>
		<?php
	}
}
