<?php

namespace Automattic\VIP\Helpers\WP_CLI_DB;

use Automattic\VIP\Environment;
use Exception;

class Config {
	private bool $enabled      = false;
	private bool $allow_writes = false;
	private bool $is_sandbox   = false;
	private bool $is_local     = false;
	private bool $is_batch     = false;

	public function __construct() {
		$this->is_local = ( defined( 'VIP_GO_APP_ENVIRONMENT' ) && constant( 'VIP_GO_APP_ENVIRONMENT' ) === 'local' ) || ( defined( 'WP_ENVIRONMENT_TYPE' ) && constant( 'WP_ENVIRONMENT_TYPE' ) === 'local' );
		// We can't check via constants since they are not set yet
		$this->is_sandbox = class_exists( Environment::class ) && Environment::is_sandbox_container( gethostname(), getenv() );
		$this->is_batch   = class_exists( Environment::class ) && Environment::is_batch_container( gethostname(), getenv() );

		$this->enabled      = $this->is_batch || $this->is_sandbox || ( defined( 'WPVIP_ENABLE_WP_DB' ) && 1 === constant( 'WPVIP_ENABLE_WP_DB' ) );
		$this->allow_writes = defined( 'WPVIP_ENABLE_WP_DB_WRITES' ) && 1 === constant( 'WPVIP_ENABLE_WP_DB_WRITES' );
	}

	public function enabled(): bool {
		return $this->enabled;
	}

	public function allow_writes(): bool {
		return $this->allow_writes;
	}

	public function is_sandbox(): bool {
		return $this->is_sandbox;
	}

	public function is_local(): bool {
		return $this->is_local;
	}

	public function is_batch(): bool {
		return $this->is_batch;
	}

	public function set_allow_writes( bool $allow ): void {
		$this->allow_writes = $allow;
	}

	/**
	 * Get the database server from the environment.
	 */
	public function get_database_server(): DB_Server {
		global $db_servers;

		if ( ! $this->enabled ) {
			throw new Exception( 'The db command is not currently supported in this environment.' );
		}

		if ( ! is_array( $db_servers ) ) {
			throw new Exception( 'The database configuration is missing.' );
		}

		if ( empty( $db_servers ) ) {
			throw new Exception( 'The database configuration is empty.' );
		}

		$server_objects = array_map(
			function ( $server_tuple ) {
				if ( ! is_array( $server_tuple ) ) {
					return false;
				}
				return new DB_Server( ...$server_tuple );
			},
			$db_servers
		);

		$filtered_server_objects = array_filter( $server_objects, function ( $candidate ) {
			return $candidate instanceof DB_Server &&
				$candidate->can_read() && ! (
					$candidate->can_write() && ! $this->allow_writes()
				);
		} );

		if ( ! $filtered_server_objects ) {
			$filtered_server_objects = [
				$server_objects[0],
			];
		}

		// Sort the replicas in ascending order of the write priority (if allowed), else sort by read priority.
		usort( $filtered_server_objects, function ( $c0, $c1 ) {
			if ( $this->allow_writes() ) {
				return $c0->write_priority() <=> $c1->write_priority();
			}
			return $c0->read_priority() <=> $c1->read_priority();
		} );

		return end( $filtered_server_objects );
	}
}
