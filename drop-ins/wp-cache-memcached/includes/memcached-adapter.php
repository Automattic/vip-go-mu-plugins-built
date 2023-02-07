<?php

namespace Automattic\Memcached;

/**
 * Utilizes the PHP Memcached extension.
 * @see https://www.php.net/manual/en/book.memcached.php
 */
class Memcached_Adapter implements Adapter_Interface {
	/** @psalm-var array<string, \Memcached> */
	private array $connections = [];

	/** @psalm-var array<int, \Memcached> */
	private array $default_connections = [];

	/** @psalm-var array<array{host: string, port: string}> */
	private array $connection_errors = [];

	/**
	 * @psalm-param array<string,array<string>>|array<int,string> $memcached_servers
	 *
	 * @return void
	 */
	public function __construct( array $memcached_servers ) {
		if ( is_int( key( $memcached_servers ) ) ) {
			$memcached_servers = [ 'default' => $memcached_servers ];
		}

		/** @psalm-var array<string,array<string>> $memcached_servers */
		foreach ( $memcached_servers as $bucket => $addresses ) {
			$servers = [];

			foreach ( $addresses as $address ) {
				$parsed_address = $this->parse_address( $address );
				$server_weight  = 1;

				$servers[] = [ $parsed_address['node'], $parsed_address['port'], $server_weight ];

				// Prepare individual connections to servers in the default bucket for flush_number redundancy.
				if ( 'default' === $bucket ) {
					$memcached = new \Memcached();
					$memcached->addServer( $parsed_address['node'], $parsed_address['port'], $server_weight );
					$memcached->setOptions( $this->get_config_options() );

					$this->default_connections[] = $memcached;
				}
			}

			$this->connections[ $bucket ] = new \Memcached();
			$this->connections[ $bucket ]->addServers( $servers );
			$this->connections[ $bucket ]->setOptions( $this->get_config_options() );
		}
	}

	/*
	|--------------------------------------------------------------------------
	| Connection-related adapter methods.
	|--------------------------------------------------------------------------
	*/

	/**
	 * Get a list of all connection pools, indexed by group name.
	 *
	 * @psalm-return array<string, \Memcached>
	 */
	public function get_connections() {
		return $this->connections;
	}

	/**
	 * Get a connection for each individual default server.
	 *
	 * @psalm-return array<int, \Memcached>
	 */
	public function get_default_connections() {
		return $this->default_connections;
	}

	/**
	 * Get list of servers with connection errors.
	 *
	 * @psalm-return array<array{host: string, port: string}>
	 */
	public function &get_connection_errors() {
		// Not supported atm. We could look at Memcached::getResultCode() after each call,
		// looking for MEMCACHED_CONNECTION_FAILURE for example.
		// But it wouldn't tell us the exact host/port that failed.
		// Memcached::getStats() is another possibility, though not the same behavior-wise.
		return $this->connection_errors;
	}

	/**
	 * Close the memcached connections.
	 *
	 * @return void
	 */
	public function close_connections() {
		foreach ( $this->connections as $connection ) {
			$connection->quit();
		}
	}

	/*
	|--------------------------------------------------------------------------
	| Main adapter methods for memcached server interactions.
	|--------------------------------------------------------------------------
	*/

	/**
	 * Add an item under a new key.
	 *
	 * @param string $key              The full key, including group & flush prefixes.
	 * @param string $connection_group The group, used to find the right connection pool.
	 * @param mixed  $data             The contents to store in the cache.
	 * @param int    $expiration       When to expire the cache contents, in seconds.
	 *
	 * @return boolean True on success, false on failure.
	 */
	public function add( $key, $connection_group, $data, $expiration ) {
		$mc = $this->get_connection( $connection_group );
		return $mc->add( $key, $data, $expiration );
	}

	/**
	 * Replace the item under an existing key.
	 *
	 * @param string $key              The full key, including group & flush prefixes.
	 * @param string $connection_group The group, used to find the right connection pool.
	 * @param mixed  $data             The contents to store in the cache.
	 * @param int    $expiration       When to expire the cache contents, in seconds.
	 *
	 * @return boolean True on success, false on failure.
	 */
	public function replace( $key, $connection_group, $data, $expiration ) {
		$mc = $this->get_connection( $connection_group );
		return $mc->replace( $key, $data, $expiration );
	}

	/**
	 * Store an item.
	 *
	 * @param string $key              The full key, including group & flush prefixes.
	 * @param string $connection_group The group, used to find the right connection pool.
	 * @param mixed  $data             The contents to store in the cache.
	 * @param int    $expiration       When to expire the cache contents, in seconds.
	 *
	 * @return boolean True on success, false on failure.
	 */
	public function set( $key, $connection_group, $data, $expiration ) {
		$mc = $this->get_connection( $connection_group );
		return $mc->set( $key, $data, $expiration );
	}

	/**
	 * Retrieve an item.
	 *
	 * @param string $key              The full key, including group & flush prefixes.
	 * @param string $connection_group The group, used to find the right connection pool.
	 *
	 * @return array{value: mixed, found: bool}
	 */
	public function get( $key, $connection_group ) {
		$mc = $this->get_connection( $connection_group );
		/** @psalm-suppress MixedAssignment */
		$value = $mc->get( $key );

		return [
			'value' => $value,
			'found' => \Memcached::RES_NOTFOUND !== $mc->getResultCode(),
		];
	}

	/**
	 * Retrieve multiple items.
	 *
	 * @param array<string> $keys      List of keys to retrieve.
	 * @param string $connection_group The group, used to find the right connection pool.
	 *
	 * @return array<mixed>|false Will not return anything in the array for unfound keys.
	 */
	public function get_multiple( $keys, $connection_group ) {
		$mc = $this->get_connection( $connection_group );
		/** @psalm-suppress MixedAssignment */
		$result = $mc->getMulti( $keys );

		return is_array( $result ) ? $result : false;
	}

	/**
	 * Delete an item.
	 *
	 * @param string $key              The full key, including group & flush prefixes.
	 * @param string $connection_group The group, used to find the right connection pool.
	 *
	 * @return boolean
	 */
	public function delete( $key, $connection_group ) {
		$mc = $this->get_connection( $connection_group );
		return $mc->delete( $key );
	}

	/**
	 * Delete multiple items.
	 *
	 * @param string[] $keys           Array of the full key, including group & flush prefixes.
	 * @param string $connection_group The group, used to find the right connection pool.
	 *
	 * @return array<string, boolean>
	 */
	public function delete_multiple( $keys, $connection_group ) {
		$mc      = $this->get_connection( $connection_group );
		$results = $mc->deleteMulti( $keys );

		$return = [];
		/** @psalm-suppress MixedAssignment */
		foreach ( $results as $key => $result ) {
			// deleteMulti() returns true on success, but one of the Memcached::RES_* constants if failed.
			$return[ (string) $key ] = true === $result;
		}

		return $return;
	}

	/**
	 * Increment numeric item's value.
	 *
	 * @param string $key              The full key, including group & flush prefixes.
	 * @param string $connection_group The group, used to find the right connection pool.
	 * @param int    $offset           The amount by which to increment the item's value.
	 *
	 * @return false|int The new item's value on success or false on failure.
	 */
	public function increment( $key, $connection_group, $offset ) {
		$mc = $this->get_connection( $connection_group );
		return $mc->increment( $key, $offset );
	}

	/**
	 * Decrement numeric item's value.
	 *
	 * @param string $key              The full key, including group & flush prefixes.
	 * @param string $connection_group The group, used to find the right connection pool.
	 * @param int    $offset           The amount by which to decrement the item's value.
	 *
	 * @return false|int The new item's value on success or false on failure.
	 */
	public function decrement( $key, $connection_group, $offset ) {
		$mc = $this->get_connection( $connection_group );
		return $mc->decrement( $key, $offset );
	}

	/**
	 * Set a key across all default memcached servers.
	 *
	 * @param string $key               The full key, including group & flush prefixes.
	 * @param mixed  $data              The contents to store in the cache.
	 * @param int    $expiration        When to expire the cache contents, in seconds.
	 * @param ?int[]  $servers_to_update Specific default servers to update.
	 *
	 * @return void
	 */
	public function set_with_redundancy( $key, $data, $expiration, $servers_to_update = null ) {
		foreach ( $this->default_connections as $index => $mc ) {
			if ( is_null( $servers_to_update ) || in_array( $index, $servers_to_update, true ) ) {
				$mc->set( $key, $data, $expiration );
			}
		}
	}

	/**
	 * Get a key across all default memcached servers.
	 *
	 * @param string $key   The full key, including group & flush prefixes.
	 *
	 * @return array<mixed> The array index refers to the same index of the memcached server in the default array.
	 */
	public function get_with_redundancy( $key ) {
		$values = [];

		foreach ( $this->default_connections as $index => $mc ) {
			/** @psalm-suppress MixedAssignment */
			$values[ $index ] = $mc->get( $key );
		}

		return $values;
	}

	/*
	|--------------------------------------------------------------------------
	| Utils.
	|--------------------------------------------------------------------------
	*/

	/**
	 * @param int|string $group
	 * @return \Memcached
	 */
	private function get_connection( $group ) {
		return $this->connections[ (string) $group ] ?? $this->connections['default'];
	}

	/**
	 * @param string $address
	 * @psalm-return array{node: string, port: int}
	 */
	private function parse_address( string $address ): array {
		$default_port = 11211;

		if ( 'unix://' == substr( $address, 0, 7 ) ) {
			// Note: This slighly differs from the memcache adapater, as memcached wants unix:// stripped off.
			$node = substr( $address, 7 );
			$port = 0;
		} else {
			$items = explode( ':', $address, 2 );
			$node  = $items[0];
			$port  = isset( $items[1] ) ? intval( $items[1] ) : $default_port;
		}

		return [
			'node' => $node,
			'port' => $port,
		];
	}

	private function get_config_options(): array {
		/** @psalm-suppress TypeDoesNotContainType */
		$serializer = \Memcached::HAVE_IGBINARY && extension_loaded( 'igbinary' ) ? \Memcached::SERIALIZER_IGBINARY : \Memcached::SERIALIZER_PHP;

		// TODO: Check memcached.compression_threshold / memcached.compression_factor
		// These are all TBD still.
		return [
			\Memcached::OPT_BINARY_PROTOCOL => false,
			\Memcached::OPT_SERIALIZER      => $serializer,
			\Memcached::OPT_CONNECT_TIMEOUT => 1000,
			\Memcached::OPT_COMPRESSION     => true,
			\Memcached::OPT_TCP_NODELAY     => true,
			\Memcached::OPT_NO_BLOCK        => true,
		];
	}
}
