<?php
// phpcs:disable Generic.Files.OneObjectStructurePerFile.MultipleFound

namespace Automattic {

	use Memcached;

	class WP_Object_Cache {
		protected const FLUSH_GROUP        = 'WP_Object_Cache';
		protected const GLOBAL_FLUSH_GROUP = 'WP_Object_Cache_global';
		protected const FLUSH_KEY          = 'flush_nr_v1';

		/**
		 * @psalm-var array<string, array{found: bool, value: mixed}>
		 */
		protected array $cache = [];

		/** @var string[] */
		protected array $global_groups = [ self::GLOBAL_FLUSH_GROUP ];

		/** @var string[] */
		protected array $no_mc_groups = [];

		/**
		 * @var Memcached[]
		 * @psalm-var array<string, Memcached>
		 */
		protected array $mc = [];

		/** @var Memcached[] */
		protected array $default_mcs = [];

		public int $cache_hits   = 0;
		public int $cache_misses = 0;

		protected string $global_prefix;
		protected string $blog_prefix;
		protected string $key_salt;

		protected $flush_number        = [];
		protected $global_flush_number = null;

		private float $time_start = 0;
		private float $time_total = 0;

		public int $default_expiration = 0;
		public int $max_expiration     = 2592000; // 30 days

		/**
		 * @global array<string,array<string>>|array<int,string>|null $memcached_servers
		 * @global string $table_prefix
		 * @global int|numeric-string $blog_id
		 */
		public function __construct() {
			global $blog_id, $table_prefix;

			/** @var array<string,array<string>>|array<int,string>|null $memcached_servers  */
			global $memcached_servers;

			$ms = is_multisite();

			$this->global_prefix = $ms || defined( 'CUSTOM_USER_TABLE' ) && defined( 'CUSTOM_USER_META_TABLE' ) ? '' : $table_prefix;
			$this->blog_prefix   = (string) ( $ms ? $blog_id : $table_prefix );
			$this->key_salt      = self::salt_keys( WP_CACHE_KEY_SALT );

			$buckets = is_array( $memcached_servers ) ? $memcached_servers : [ 'default' => [ '127.0.0.1:11211' ] ];
			$this->set_up_memcached( $buckets );
		}

		public function add( $id, $data, $group = 'default', $expire = 0 ) {
			$key = $this->key( $id, $group );

			if ( is_object( $data ) ) {
				$data = clone $data;
			}

			if ( in_array( $group, $this->no_mc_groups, true ) ) {
				if ( ! isset( $this->cache[ $key ] ) ) {
					$this->cache[ $key ] = [
						'value' => $data,
						'found' => false,
					];

					return true;
				}

				return false;
			}

			if ( isset( $this->cache[ $key ]['value'] ) && false !== $this->cache[ $key ]['value'] ) {
				return false;
			}

			$mc     = $this->get_mc( $group );
			$expire = $this->get_expiration( $expire );
			$size   = self::get_data_size( $data );

			$this->timer_start();
			$result  = $mc->add( $key, $data, $expire );
			$elapsed = $this->timer_stop();

			$comment = '';
			if ( isset( $this->cache[ $key ] ) ) {
				$comment .= ' [lc already]';
			}

			if ( false === $result ) {
				$comment .= ' [mc already]';
			}

			$this->group_ops_stats( 'add', $key, $group, $size, $elapsed, $comment );

			if ( false !== $result ) {
				$this->cache[ $key ] = [
					'value' => $data,
					'found' => true,
				];
			} elseif ( false === $result && true === isset( $this->cache[ $key ]['value'] ) && false === $this->cache[ $key ]['value'] ) {
				/*
				 * Here we unset local cache if remote add failed and local cache value is equal to `false` in order
				 * to update the local cache anytime we get a new information from remote server. This way, the next
				 * cache get will go to remote server and will fetch recent data.
				 */
				unset( $this->cache[ $key ] );
			}

			return $result;
		}

		public function add_multiple( array $data, $group = '', $expire = 0 ) {
			$result = [];

			foreach ( $data as $key => $value ) {
				$result[ $key ] = $this->add( $key, $value, $group, $expire );
			}

			return $result;
		}

		/**
		 * @param string|string[] $groups
		 * @return void
		 */
		public function add_global_groups( $groups ) {
			if ( ! is_array( $groups ) ) {
				$groups = (array) $groups;
			}

			$this->global_groups = array_unique( array_merge( $this->global_groups, $groups ) );
		}

		/**
		 * @param string|string[] $groups
		 * @return void
		 */
		public function add_non_persistent_groups( $groups ) {
			if ( ! is_array( $groups ) ) {
				$groups = (array) $groups;
			}

			$this->no_mc_groups = array_unique( array_merge( $this->no_mc_groups, $groups ) );
		}

		public function incr( $id, $n = 1, $group = 'default' ) {
			$key = $this->key( $id, $group );
			$mc  = $this->get_mc( $group );

			$this->timer_start();
			$incremented = $mc->increment( $key, $n );
			$elapsed     = $this->timer_stop();

			$this->group_ops_stats( 'increment', $key, $group, null, $elapsed );

			$this->cache[ $key ] = [
				'value' => $incremented,
				'found' => false !== $incremented,
			];

			return $this->cache[ $key ]['value'];
		}

		public function decr( $id, $n = 1, $group = 'default' ) {
			$key = $this->key( $id, $group );
			$mc  = $this->get_mc( $group );

			$this->timer_start();
			$decremented = $mc->decrement( $key, $n );
			$elapsed     = $this->timer_stop();

			$this->group_ops_stats( 'decrement', $key, $group, null, $elapsed );

			$this->cache[ $key ] = [
				'value' => $decremented,
				'found' => false !== $decremented,
			];

			return $this->cache[ $key ]['value'];
		}

		public function close() {
			array_walk( $this->mc, fn ( Memcached $memcached ) => $memcached->quit() );
		}

		public function delete( $id, $group = 'default' ) {
			$key = $this->key( $id, $group );

			if ( in_array( $group, $this->no_mc_groups, true ) ) {
				$result = isset( $this->cache[ $key ] );
				unset( $this->cache[ $key ] );

				return $result;
			}

			$mc = $this->get_mc( $group );

			$this->timer_start();
			$result  = $mc->delete( $key );
			$elapsed = $this->timer_stop();

			$this->group_ops_stats( 'delete', $key, $group, null, $elapsed );

			// If the item does not exists, it could be because it has expired.
			// We unset it in this case to avoid returning stale results.
			if ( false !== $result || Memcached::RES_NOTFOUND === $mc->getResultCode() ) {
				unset( $this->cache[ $key ] );
			}

			return $result;
		}

		public function delete_multiple( array $keys, $group = '' ) {
			$result = [];

			if ( in_array( $group, $this->no_mc_groups, true ) ) {
				foreach ( $keys as $key ) {
					$real_key = $this->key( $key, $group );
					$result[] = isset( $this->cache[ $real_key ] );
					unset( $this->cache[ $real_key ] );
				}

				return $result;
			}

			$mc  = $this->get_mc( $group );
			$map = $this->map_keys( $keys, $group );
			$res = $mc->deleteMulti( array_keys( $map ) );

			foreach ( $res as $key => $deleted ) {
				$orig_key = $map[ $key ];

				$result[ $orig_key ] = true === $deleted;
				if ( true === $deleted || Memcached::RES_NOTFOUND === $deleted ) {
					unset( $this->cache[ $key ] );
				}
			}

			return $result;
		}

		public function flush() {
			$this->cache = [];

			$flush_number = $this->new_flush_number();

			$this->rotate_site_keys( $flush_number );
			if ( is_main_site() ) {
				$this->rotate_global_keys( $flush_number );
			}

			return true;
		}

		public function flush_runtime() {
			$this->cache = [];
		}

		public function get( $id, $group = 'default', $force = false, &$found = null ) {
			$key   = $this->key( $id, $group );
			$mc    = $this->get_mc( $group );
			$found = true;

			if ( isset( $this->cache[ $key ] ) && ( ! $force || in_array( $group, $this->no_mc_groups, true ) ) ) {
				$value = is_object( $this->cache[ $key ]['value'] ) ? clone $this->cache[ $key ]['value'] : $this->cache[ $key ]['value'];
				$found = $this->cache[ $key ]['found'];

				$this->group_ops_stats( 'get_local', $key, $group, null, null, 'local' );
			} elseif ( in_array( $group, $this->no_mc_groups, true ) ) {
				$value = false;
				$found = false;

				$this->cache[ $key ] = [
					'value' => false,
					'found' => false,
				];

				$this->group_ops_stats( 'get_local', $key, $group, null, null, 'not_in_local' );
			} else {
				$this->timer_start();
				$value   = $mc->get( $key );
				$elapsed = $this->timer_stop();
				$found   = false !== $value || Memcached::RES_SUCCESS === $mc->getResultCode();

				$this->cache[ $key ] = [
					'value' => $value,
					'found' => $found,
				];

				if ( false === $found ) {
					$this->group_ops_stats( 'get', $key, $group, null, $elapsed, 'not_in_memcache' );
				} else {
					$this->group_ops_stats( 'get', $key, $group, self::get_data_size( $value ), $elapsed, 'memcache' );
				}
			}

			return $value;
		}

		public function get_multiple( $keys, $group = 'default', $force = false ) {
			$mc    = $this->get_mc( $group );
			$no_mc = in_array( $group, $this->no_mc_groups, true );

			$uncached_keys = [];
			$return        = [];
			$return_cache  = [];

			foreach ( $keys as $id ) {
				$key = $this->key( $id, $group );

				if ( isset( $this->cache[ $key ] ) && ( ! $force || $no_mc ) ) {
					$value         = $this->cache[ $key ]['found'] ? $this->cache[ $key ]['value'] : false;
					$return[ $id ] = is_object( $value ) ? clone $value : $value;
				} elseif ( $no_mc ) {
					$return[ $id ]        = false;
					$return_cache[ $key ] = [
						'value' => false,
						'found' => false,
					];
				} else {
					$uncached_keys[ $id ] = $key;
				}
			}

			if ( $uncached_keys ) {
				$this->timer_start();
				$uncached_keys_list = array_values( $uncached_keys );
				$values             = $mc->getMulti( $uncached_keys_list );
				$elapsed            = $this->timer_stop();

				$this->group_ops_stats( 'get_multiple', $uncached_keys_list, $group, null, $elapsed );

				if ( false === $values ) {
					$values = [];
				}

				foreach ( $uncached_keys as $id => $key ) {
					$found = array_key_exists( $key, $values );
					$value = $found ? $values[ $key ] : false;

					$return[ $id ]        = $value;
					$return_cache[ $key ] = [
						'value' => $value,
						'found' => $found,
					];
				}
			}

			$this->cache = array_merge( $this->cache, $return_cache );
			return $return;
		}

		public function replace( $id, $data, $group = 'default', $expire = 0 ) {
			$key = $this->key( $id, $group );
			if ( is_object( $data ) ) {
				$data = clone $data;
			}

			if ( in_array( $group, $this->no_mc_groups, true ) ) {
				if ( isset( $this->cache[ $key ] ) ) {
					$this->cache[ $key ] = [
						'value' => $data,
						'found' => false,
					];

					return true;
				}

				return false;
			}

			$expire = $this->get_expiration( $expire );
			$mc     = $this->get_mc( $group );

			$this->timer_start();
			$result  = $mc->replace( $key, $data, $expire );
			$elapsed = $this->timer_stop();

			$this->group_ops_stats( 'replace', $key, $group, self::get_data_size( $data ), $elapsed );

			if ( false !== $result ) {
				$this->cache[ $key ] = [
					'value' => $data,
					'found' => true,
				];
			} elseif ( Memcached::RES_NOTFOUND === $mc->getResultCode() ) {
				unset( $this->cache[ $key ] );
			}

			return $result;
		}

		public function set( $id, $data, $group = 'default', $expire = 0 ) {
			$key = $this->key( $id, $group );

			if ( is_object( $data ) ) {
				$data = clone $data;
			}

			$this->cache[ $key ] = [
				'value' => $data,
				'found' => false, // Set to false as not technically found in memcache at this point.
			];

			if ( in_array( $group, $this->no_mc_groups, true ) ) {
				$this->group_ops_stats( 'set_local', $key, $group, null, null );
				return true;
			}

			$expire = $this->get_expiration( $expire );
			$mc     = $this->get_mc( $group );
			$size   = self::get_data_size( $data );

			$this->timer_start();
			$result  = $mc->set( $key, $data, $expire );
			$elapsed = $this->timer_stop();
			$this->group_ops_stats( 'set', $key, $group, $size, $elapsed );
			
			$this->cache[ $key ]['found'] = $result;
			return $result;
		}

		public function set_multiple( array $data, $group = '', $expire = 0 ) {
			$result = [];
			// Memcached::setMulti() returns bool, WordPress wants an array
			foreach ( $data as $key => $value ) {
				$result[ $key ] = $this->set( $key, $value, $group, $expire );
			}

			return $result;
		}

		public function switch_to_blog( $blog_id ) {
			global $table_prefix;

			$blog_id = (int) $blog_id;

			$this->blog_prefix = (string) ( is_multisite() ? $blog_id : $table_prefix );
		}

		public function reset() {
			_deprecated_function( __FUNCTION__, '3.5.0', 'WP_Object_Cache::switch_to_blog()' );
			foreach ( array_keys( $this->cache ) as $group ) {
				if ( ! isset( $this->global_groups[ $group ] ) ) {
					unset( $this->cache[ $group ] );
				}
			}
		}

		private function map_keys( array $keys, $group ): array {
			$result = [];
			foreach ( $keys as $key ) {
				$result[ $this->key( $key, $group ) ] = $key;
			}

			return $result;
		}

		/**
		 * @psalm-param array<string,array<string>>|array<int,string> $buckets
		 */
		private function set_up_memcached( array $buckets ): void {
			/** @psalm-suppress TypeDoesNotContainType */
			$options = [
				Memcached::OPT_BINARY_PROTOCOL => true,
				Memcached::OPT_SERIALIZER      => Memcached::HAVE_IGBINARY && extension_loaded( 'igbinary' ) ? Memcached::SERIALIZER_IGBINARY : Memcached::SERIALIZER_PHP,
				Memcached::OPT_CONNECT_TIMEOUT => 1000,
			];

			if ( is_int( key( $buckets ) ) ) {
				$buckets = [
					'default' => $buckets,
				];
			}

			/** @psalm-var array<string,array<string>> $buckets */
			foreach ( $buckets as $bucket => $addresses ) {
				$memcached           = new Memcached();
				$this->mc[ $bucket ] = $memcached;

				if ( ! $memcached->getServerList() ) {
					/** @psalm-var list<array{string,int,int}> $servers */
					$servers = [];

					foreach ( $addresses as $address ) {
						if ( 'unix://' == substr( $address, 0, 7 ) ) {
							$node = substr( $address, 7 );
							$port = 0;
						} else {
							$items = explode( ':', $address, 2 );
							$node  = $items[0];
							$port  = isset( $items[1] ) ? intval( $items[1] ) : 11211;
						}

						$servers[] = [ $node, $port, 1 ];
					}

					$memcached->addServers( $servers );
				}

				if ( 'default' === $bucket ) {
					$this->default_mcs[] = $memcached;
				}

				$memcached->setOptions( $options );
			}
		}

		protected static function salt_keys( string $key_salt ): string {
			return $key_salt ? $key_salt . ':' : '';
		}

		/**
		 * @param int|string $key
		 * @param int|string $group
		 * @return string
		 */
		protected function key( $key, $group ): string {
			if ( empty( $group ) ) {
				$group = 'default';
			}

			$result = sprintf(
				'%s%s%s:%s:%s',
				$this->key_salt,
				$this->flush_prefix( $group ),
				array_search( $group, $this->global_groups ) !== false ? $this->global_prefix : $this->blog_prefix,
				$group,
				$key
			);

			return preg_replace( '/\\s+/', '', $result );
		}

		/**
		 * @param string $group
		 * @return string
		 */
		protected function flush_prefix( $group ): string {
			if ( self::FLUSH_GROUP === $group || self::GLOBAL_FLUSH_GROUP === $group ) {
				$number = '_';
			} elseif ( false !== array_search( $group, $this->global_groups ) ) {
				$number = $this->get_global_flush_number();
			} else {
				$number = $this->get_blog_flush_number();
			}

			return $number . ':';
		}

		private function get_global_flush_number() {
			if ( ! isset( $this->global_flush_number ) ) {
				$this->global_flush_number = $this->get_flush_number( self::GLOBAL_FLUSH_GROUP );
			}

			return $this->global_flush_number;
		}

		private function get_blog_flush_number() {
			if ( ! isset( $this->flush_number[ $this->blog_prefix ] ) ) {
				$this->flush_number[ $this->blog_prefix ] = $this->get_flush_number( self::FLUSH_GROUP );
			}

			return $this->flush_number[ $this->blog_prefix ];
		}

		private function set_flush_number( $value, $group ) {
			$key    = $this->key( self::FLUSH_KEY, $group );
			$expire = 0;
			$size   = 19;

			foreach ( $this->default_mcs as $mc ) {
				$this->timer_start();
				$mc->set( $key, $value, $expire );
				$elapsed = $this->timer_stop();
				$this->group_ops_stats( 'set_flush_number', $key, $group, $size, $elapsed, 'replication' );
			}
		}

		/**
		 * @param string $group
		 */
		private function get_flush_number( $group ) {
			$flush_number = $this->get_max_flush_number( $group );
			if ( empty( $flush_number ) ) {
				$flush_number = static::new_flush_number();
				$this->set_flush_number( $flush_number, $group );
			}

			return $flush_number;
		}

		private static function new_flush_number(): int {
			return (int) ( microtime( true ) * 1e6 );
		}

		/**
		 * @param string $group
		 * @return mixed|false
		 */
		private function get_max_flush_number( $group ) {
			$key    = $this->key( self::FLUSH_KEY, $group );
			$values = [];
			$size   = 19;

			foreach ( $this->default_mcs as $i => $mc ) {
				$this->timer_start();
				$values[ $i ] = $mc->get( $key );
				$elapsed      = $this->timer_stop();

				if ( empty( $values[ $i ] ) ) {
					$this->group_ops_stats( 'get_flush_number', $key, $group, null, $elapsed, 'not_in_memcache' );
				} else {
					$this->group_ops_stats( 'get_flush_number', $key, $group, $size, $elapsed, 'memcache' );
				}
			}

			$max = max( $values );

			if ( $max <= 0 ) {
				return false;
			}

			$expire = 0;
			foreach ( $this->default_mcs as $i => $mc ) {
				if ( $values[ $i ] < $max ) {
					$this->timer_start();
					$mc->set( $key, $max, $expire );
					$elapsed = $this->timer_stop();
					$this->group_ops_stats( 'set_flush_number', $key, $group, $size, $elapsed, 'replication_repair' );
				}
			}

			return $max;
		}

		private function rotate_site_keys( int $flush_number ): void {
			$this->set_flush_number( $flush_number, self::FLUSH_GROUP );
			$this->flush_number[ $this->blog_prefix ] = $flush_number;
		}

		public function rotate_global_keys( int $flush_number ): void {
			$this->set_flush_number( $flush_number, self::GLOBAL_FLUSH_GROUP );
			$this->global_flush_number = $flush_number;
		}

		private function get_mc( $group ): Memcached {
			return $this->mc[ $group ] ?? $this->mc['default'];
		}

		/**
		 * @param mixed $data
		 * @return int
		 * @psalm-return 0|positive-int
		 */
		private static function get_data_size( $data ): int {
			if ( is_string( $data ) ) {
				return strlen( $data );
			}

			// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
			return strlen( serialize( $data ) );
		}

		private function timer_start(): void {
			$this->time_start = microtime( true );
		}

		private function timer_stop(): float {
			$time_total        = microtime( true ) - $this->time_start;
			$this->time_total += $time_total;
			return $time_total;
		}

		/**
		 * @psalm-param int|numeric-string|float $expire
		 */
		private function get_expiration( $expire ): int {
			$expire = intval( $expire );
			if ( $expire <= 0 || $expire > $this->max_expiration ) {
				$expire = $this->default_expiration;
			}

			return $expire;
		}

		private function group_ops_stats( string $op, $keys, ?string $group, ?int $size, ?float $time, string $comment = '' ) {
			// Do nothing for now
		}

		public function __set( $prop, $value ) {
			if ( 'cache' === $prop ) {
				$this->$prop = $value;
			}
		}
	}
}

namespace {
	if ( defined( 'WP_INSTALLING' ) && WP_INSTALLING ) {
		require_once ABSPATH . WPINC . '/cache.php';
	} else {
		if ( ! defined( 'WP_CACHE_KEY_SALT' ) ) {
			define( 'WP_CACHE_KEY_SALT', '' );
		}

		/**
		 * Sets up Object Cache Global and assigns it.
		 *
		 * @global WP_Object_Cache $wp_object_cache
		 * @return void
		 */
		function wp_cache_init() {
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$GLOBALS['wp_object_cache'] = new namespace\WP_Object_Cache();
		}

		/**
		 * Adds data to the cache, if the cache key doesn't already exist.
		 *
		 * @see WP_Object_Cache::add()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param int|string $key    The cache key to use for retrieval later.
		 * @param mixed      $data   The data to add to the cache.
		 * @param string     $group  Optional. The group to add the cache to. Enables the same key
		 *                           to be used across groups. Default empty.
		 * @param int        $expire Optional. When the cache data should expire, in seconds.
		 *                           Default 0 (no expiration).
		 * @return bool True on success, false if cache key and group already exist.
		 * @psalm-suppress RedundantCast
		 */
		function wp_cache_add( $key, $data, $group = '', $expire = 0 ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->add( $key, $data, $group, (int) $expire );
		}

		/**
		 * Adds multiple values to the cache in one call.
		 *
		 * @see WP_Object_Cache::add_multiple()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param array  $data   Array of keys and values to be set.
		 * @param string $group  Optional. Where the cache contents are grouped. Default empty.
		 * @param int    $expire Optional. When to expire the cache contents, in seconds.
		 *                       Default 0 (no expiration).
		 * @return bool[] Array of return values, grouped by key. Each value is either
		 *                true on success, or false if cache key and group already exist.
		 * @psalm-param mixed[] $data
		 * @psalm-suppress RedundantCast
		 */
		function wp_cache_add_multiple( array $data, $group = '', $expire = 0 ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->add_multiple( $data, $group, (int) $expire );
		}

		/**
		 * Replaces the contents of the cache with new data.
		 *
		 * @see WP_Object_Cache::replace()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param int|string $key    The key for the cache data that should be replaced.
		 * @param mixed      $data   The new data to store in the cache.
		 * @param string     $group  Optional. The group for the cache data that should be replaced.
		 *                           Default empty.
		 * @param int        $expire Optional. When to expire the cache contents, in seconds.
		 *                           Default 0 (no expiration).
		 * @return bool True if contents were replaced, false if original value does not exist.
		 * @psalm-suppress RedundantCast
		 */
		function wp_cache_replace( $key, $data, $group = '', $expire = 0 ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->replace( $key, $data, $group, (int) $expire );
		}

		/**
		 * Saves the data to the cache.
		 *
		 * Differs from wp_cache_add() and wp_cache_replace() in that it will always write data.
		 *
		 * @see WP_Object_Cache::set()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param int|string $key    The cache key to use for retrieval later.
		 * @param mixed      $data   The contents to store in the cache.
		 * @param string     $group  Optional. Where to group the cache contents. Enables the same key
		 *                           to be used across groups. Default empty.
		 * @param int        $expire Optional. When to expire the cache contents, in seconds.
		 *                           Default 0 (no expiration).
		 * @return bool True on success, false on failure.
		 * @psalm-suppress RedundantCast
		 */
		function wp_cache_set( $key, $data, $group = '', $expire = 0 ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			if ( ! defined( 'WP_INSTALLING' ) ) {
				return $wp_object_cache->set( $key, $data, $group, (int) $expire );
			}

			return $wp_object_cache->delete( $key, $group );
		}

		/**
		 * Sets multiple values to the cache in one call.
		 *
		 * @see WP_Object_Cache::set_multiple()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param array  $data   Array of keys and values to be set.
		 * @param string $group  Optional. Where the cache contents are grouped. Default empty.
		 * @param int    $expire Optional. When to expire the cache contents, in seconds.
		 *                       Default 0 (no expiration).
		 * @return bool[] Array of return values, grouped by key. Each value is either
		 *                true on success, or false on failure.
		 * @psalm-param mixed[] $data
		 * @psalm-suppress RedundantCast
		 */
		function wp_cache_set_multiple( array $data, $group = '', $expire = 0 ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			if ( ! defined( 'WP_INSTALLING' ) ) {
				return $wp_object_cache->set_multiple( $data, $group, (int) $expire );
			}

			return $wp_object_cache->delete_multiple( array_keys( $data ), $group );
		}

		/**
		 * Retrieves the cache contents from the cache by key and group.
		 *
		 * @see WP_Object_Cache::get()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param int|string $key   The key under which the cache contents are stored.
		 * @param string     $group Optional. Where the cache contents are grouped. Default empty.
		 * @param bool       $force Optional. Whether to force an update of the local cache
		 *                          from the persistent cache. Default false.
		 * @param bool       $found Optional. Whether the key was found in the cache (passed by reference).
		 *                          Disambiguates a return of false, a storable value. Default null.
		 * @return mixed|false The cache contents on success, false on failure to retrieve contents.
		 */
		function wp_cache_get( $key, $group = '', $force = false, &$found = null ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->get( $key, $group, $force, $found );
		}

		/**
		 * Retrieves multiple values from the cache in one call.
		 *
		 * @see WP_Object_Cache::get_multiple()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param array  $keys  Array of keys under which the cache contents are stored.
		 * @param string $group Optional. Where the cache contents are grouped. Default empty.
		 * @param bool   $force Optional. Whether to force an update of the local cache
		 *                      from the persistent cache. Default false.
		 * @return array Array of return values, grouped by key. Each value is either
		 *               the cache contents on success, or false on failure.
		 * @psalm-param (int|string)[] $keys
		 * @psalm-return mixed[]
		 */
		function wp_cache_get_multiple( $keys, $group = '', $force = false ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->get_multiple( $keys, $group, $force );
		}

		/**
		 * Removes the cache contents matching key and group.
		 *
		 * @see WP_Object_Cache::delete()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param int|string $key   What the contents in the cache are called.
		 * @param string     $group Optional. Where the cache contents are grouped. Default empty.
		 * @return bool True on successful removal, false on failure.
		 */
		function wp_cache_delete( $key, $group = '' ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->delete( $key, $group );
		}

		/**
		 * Deletes multiple values from the cache in one call.
		 *
		 * @see WP_Object_Cache::delete_multiple()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param array  $keys  Array of keys under which the cache to deleted.
		 * @param string $group Optional. Where the cache contents are grouped. Default empty.
		 * @return bool[] Array of return values, grouped by key. Each value is either
		 *                true on success, or false if the contents were not deleted.
		 * @psalm-param (int|string)[] $keys
		 */
		function wp_cache_delete_multiple( array $keys, $group = '' ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->delete_multiple( $keys, $group );
		}

		/**
		 * Increments numeric cache item's value.
		 *
		 * @see WP_Object_Cache::incr()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param int|string $key    The key for the cache contents that should be incremented.
		 * @param int        $offset Optional. The amount by which to increment the item's value.
		 *                           Default 1.
		 * @param string     $group  Optional. The group the key is in. Default empty.
		 * @return int|false The item's new value on success, false on failure.
		 * @psalm-suppress RedundantCast
		 */
		function wp_cache_incr( $key, $offset = 1, $group = '' ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->incr( $key, (int) $offset, $group );
		}

		/**
		 * Decrements numeric cache item's value.
		 *
		 * @see WP_Object_Cache::decr()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param int|string $key    The cache key to decrement.
		 * @param int        $offset Optional. The amount by which to decrement the item's value.
		 *                           Default 1.
		 * @param string     $group  Optional. The group the key is in. Default empty.
		 * @return int|false The item's new value on success, false on failure.
		 * @psalm-suppress RedundantCast
		 */
		function wp_cache_decr( $key, $offset = 1, $group = '' ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->decr( $key, (int) $offset, $group );
		}

		/**
		 * Removes all cache items.
		 *
		 * @see WP_Object_Cache::flush()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @return bool True on success, false on failure.
		 */
		function wp_cache_flush() {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->flush();
		}

		/**
		 * Removes all cache items from the in-memory runtime cache.
		 *
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @return bool True on success, false on failure.
		 */
		function wp_cache_flush_runtime() {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->flush_runtime();
		}

		/**
		 * Closes the cache.
		 *
		 * @return bool
		 */
		function wp_cache_close() {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			return $wp_object_cache->close();
		}

		/**
		 * Adds a group or set of groups to the list of global groups.
		 *
		 * @see WP_Object_Cache::add_global_groups()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param string|string[] $groups A group or an array of groups to add.
		 * @return void
		 */
		function wp_cache_add_global_groups( $groups ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			$wp_object_cache->add_global_groups( $groups );
		}

		/**
		 * Adds a group or set of groups to the list of non-persistent groups.
		 *
		 * @since 2.6.0
		 *
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param string|string[] $groups A group or an array of groups to add.
		 * @return void
		 */
		function wp_cache_add_non_persistent_groups( $groups ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			$wp_object_cache->add_non_persistent_groups( $groups );
		}

		/**
		 * Switches the internal blog ID.
		 *
		 * This changes the blog id used to create keys in blog specific groups.
		 *
		 * @since 3.5.0
		 *
		 * @see WP_Object_Cache::switch_to_blog()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param int $blog_id Site ID.
		 * @return void
		 * @psalm-suppress RedundantCast
		 */
		function wp_cache_switch_to_blog( $blog_id ) {
			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			$wp_object_cache->switch_to_blog( (int) $blog_id );
		}

		/**
		 * Resets internal cache keys and structures.
		 *
		 * If the cache back end uses global blog or site IDs as part of its cache keys,
		 * this function instructs the back end to reset those keys and perform any cleanup
		 * since blog or site IDs have changed since cache init.
		 *
		 * This function is deprecated. Use wp_cache_switch_to_blog() instead of this
		 * function when preparing the cache for a blog switch. For clearing the cache
		 * during unit tests, consider using wp_cache_init(). wp_cache_init() is not
		 * recommended outside of unit tests as the performance penalty for using it is high.
		 *
		 * @deprecated 3.5.0 Use wp_cache_switch_to_blog()
		 * @see WP_Object_Cache::reset()
		 *
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 * @return void
		 */
		function wp_cache_reset() {
			_deprecated_function( __FUNCTION__, '3.5.0', 'wp_cache_switch_to_blog()' );

			/** @var \Automattic\WP_Object_Cache $wp_object_cache */
			global $wp_object_cache;

			$wp_object_cache->reset();
		}

		/**
		 * Removes all cache items in a group, if the object cache implementation supports it.
		 *
		 * Before calling this function, always check for group flushing support using the
		 * `wp_cache_supports( 'flush_group' )` function.
		 *
		 * @since 6.1.0
		 *
		 * @see WP_Object_Cache::flush_group()
		 * @global WP_Object_Cache $wp_object_cache Object cache global instance.
		 *
		 * @param string $group Name of group to remove from cache.
		 * @return bool True if group was flushed, false otherwise.
		 */
		function wp_cache_flush_group( $group ) {
			return false;
		}

		/**
		 * Determines whether the object cache implementation supports a particular feature.
		 *
		 * @since 6.1.0
		 *
		 * @param string $feature Name of the feature to check for. Possible values include:
		 *                        'add_multiple', 'set_multiple', 'get_multiple', 'delete_multiple',
		 *                        'flush_runtime', 'flush_group'.
		 * @return bool True if the feature is supported, false otherwise.
		 */
		function wp_cache_supports( $feature ) {
			switch ( $feature ) {
				case 'add_multiple':
				case 'set_multiple':
				case 'get_multiple':
				case 'delete_multiple':
				case 'flush_runtime':
					return true;

				default:
					return false;
			}
		}

		/** @psalm-suppress DuplicateClass */
		class WP_Object_Cache extends \Automattic\WP_Object_Cache {}
	}
}
