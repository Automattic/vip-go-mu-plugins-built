<?php
/**
 * Sequence repository.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Sequences;

use VIPWorkflows\Database\Schema;

/**
 * Repository for sequence database operations.
 */
class SequenceRepository {


	/**
	 * Object-cache group holding sequence reads.
	 *
	 * Public so a writer that bypasses this repository — the schema migration that
	 * replays stored configs through the write gate with direct SQL — can invalidate
	 * the same group instead of hardcoding the name a second time.
	 */
	public const CACHE_GROUP = 'vip_sequences';

	/**
	 * Key holding the cache generation, bumped to invalidate the group.
	 */
	private const VERSION_KEY = 'cache_version';

	/**
	 * The generation for this request, once read.
	 *
	 * Cleared by flush_cache(). Deliberately per-request rather than per-instance:
	 * the bug this versioning fixes is about two *requests* disagreeing, and a
	 * request that bumps mid-flight must not keep writing under the old salt from
	 * a second repository instance.
	 *
	 * @var int|null
	 */
	private static ?int $cache_version = null;

	/**
	 * Get table name.
	 *
	 * @return string
	 */
	private function get_table(): string {
		return Schema::get_table_name( 'sequences' );
	}

	/**
	 * Find a sequence by ID.
	 *
	 * @param  int $id Sequence ID.
	 * @return Sequence|null
	 */
	public function find( int $id ): ?Sequence {
		$cache_key = self::cache_key( 'sequence_' . $id );
		$cached    = wp_cache_get( $cache_key, self::CACHE_GROUP );

		if ( false !== $cached ) {
			return $cached ? $cached : null;
		}

		global $wpdb;

		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$this->get_table()} WHERE id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$id
			)
		);

		$sequence = $row ? Sequence::from_row( $row ) : null;
		wp_cache_set( $cache_key, $sequence ? $sequence : '', self::CACHE_GROUP );

		return $sequence;
	}

	/**
	 * Preload multiple sequences by ID in a single query.
	 * Populates the object cache so subsequent find() calls are free.
	 *
	 * @param  int[] $ids Sequence IDs.
	 * @return Sequence[] Keyed by ID.
	 */
	public function preload( array $ids ): array {
		$ids = array_unique( array_filter( array_map( 'intval', $ids ) ) );
		if ( empty( $ids ) ) {
			return array();
		}

		$uncached = array();
		$result   = array();

		$cached_sequences = wp_cache_get_multiple(
			array_map( static fn ( int $id ): string => self::cache_key( 'sequence_' . $id ), $ids ),
			self::CACHE_GROUP
		);

		foreach ( $ids as $id ) {
			$cache_key = self::cache_key( 'sequence_' . $id );
			$cached = $cached_sequences[ $cache_key ];
			if ( false !== $cached ) {
				if ( $cached instanceof Sequence ) {
					$result[ $id ] = $cached;
				}
			} else {
				$uncached[] = $id;
			}
		}

		if ( ! empty( $uncached ) ) {
			global $wpdb;

			$placeholders = implode( ',', array_fill( 0, count( $uncached ), '%d' ) );
			$rows         = $wpdb->get_results(
				$wpdb->prepare(
					// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $placeholders is a list of %d built via array_fill above.
					"SELECT * FROM %i WHERE id IN ({$placeholders})",
					$this->get_table(),
					...$uncached
				)
			);

			$found_ids     = array();
			$cache_entries = array();
			foreach ( $rows as $row ) {
				$sequence                                  = Sequence::from_row( $row );
				$cache_key                                 = self::cache_key( 'sequence_' . $sequence->id );
				$result[ $sequence->id ]                   = $sequence;
				$found_ids[]                               = $sequence->id;
				$cache_entries[ $cache_key ]               = $sequence;
			}

			foreach ( $uncached as $id ) {
				if ( ! in_array( $id, $found_ids, true ) ) {
					$cache_entries[ self::cache_key( 'sequence_' . $id ) ] = '';
				}
			}

			wp_cache_set_multiple( $cache_entries, self::CACHE_GROUP );
		}

		return $result;
	}

	/**
	 * Find a sequence by UUID.
	 *
	 * @param  string $uuid Sequence UUID.
	 * @return Sequence|null
	 */
	public function find_by_uuid( string $uuid ): ?Sequence {
		global $wpdb;

		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$this->get_table()} WHERE uuid = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$uuid
			)
		);

		return $row ? Sequence::from_row( $row ) : null;
	}

	/**
	 * Find a sequence by slug (latest active version).
	 *
	 * @param  string $slug Sequence slug.
	 * @return Sequence|null
	 */
	public function find_by_slug( string $slug ): ?Sequence {
		global $wpdb;

		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$this->get_table()} WHERE slug = %s AND status = 'active' ORDER BY version DESC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$slug
			)
		);

		return $row ? Sequence::from_row( $row ) : null;
	}

	/**
	 * Whether a slug is already taken for a given type, regardless of status.
	 *
	 * Used for create-time dedup: the unique key is (type, slug, version), so a
	 * draft/archived row with the same slug still collides — find_by_slug()'s
	 * active-only filter misses those and would surface a misleading insert error.
	 *
	 * @param  string $slug Slug to check.
	 * @param  string $type Sequence type.
	 * @return bool
	 */
	public function slug_exists( string $slug, string $type ): bool {
		global $wpdb;

		$count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$this->get_table()} WHERE slug = %s AND type = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$slug,
				$type
			)
		);

		return (int) $count > 0;
	}

	/**
	 * Find a specific version of a sequence.
	 *
	 * @param  string $slug    Sequence slug.
	 * @param  int    $version Version number.
	 * @return Sequence|null
	 */
	public function find_version( string $slug, int $version ): ?Sequence {
		global $wpdb;

		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$this->get_table()} WHERE slug = %s AND version = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$slug,
				$version
			)
		);

		return $row ? Sequence::from_row( $row ) : null;
	}

	/**
	 * Get all sequences.
	 *
	 * @param  array $args Query arguments.
	 * @return Sequence[]
	 */
	public function get_all( array $args = array() ): array {
		$cache_key = self::cache_key( 'all_' . md5( wp_json_encode( $args ) ) );
		$cached    = wp_cache_get( $cache_key, self::CACHE_GROUP );

		if ( false !== $cached ) {
			return $cached;
		}

		global $wpdb;

		$defaults = array(
			'type'         => null, // Filter by type (workflow, phase).
			'status'       => null,
			'latest_only'  => true, // Only return the latest version of each sequence.
			'orderby'      => 'name',
			'order'        => 'ASC',
		);

		$args = wp_parse_args( $args, $defaults );

		$where  = array( '1=1' );
		$values = array();

		if ( $args['type'] ) {
			$where[]  = 'b.type = %s';
			$values[] = $args['type'];
		}

		if ( $args['status'] ) {
			$where[]  = 'b.status = %s';
			$values[] = $args['status'];
		}

		$where_clause = implode( ' AND ', $where );

		// Build query.
		//
		// Placeholders only — no value is ever interpolated into the SQL here, so
		// the whole statement is prepared exactly once, at the end. The subquery
		// used to be prepared separately and then passed through prepare() again
		// as part of the outer query. That double pass was safe in practice (WP
		// escapes literal `%` between passes) but it is a trap: it reads as if
		// values reach the SQL string, and it needed two phpcs suppressions that
		// would have hidden a genuine unprepared query from the linter.
		//
		// Subquery placeholders bind before the WHERE clause's, so its values
		// lead $prepare_values.
		$prepare_values = array();

		if ( $args['latest_only'] ) {
			$type_filter = '';
			if ( $args['type'] ) {
				$type_filter      = 'WHERE type = %s';
				$prepare_values[] = $args['type'];
			}

			$subquery = "SELECT type, slug, MAX(version) as max_version FROM {$this->get_table()} {$type_filter} GROUP BY type, slug";
			$query    = "SELECT b.* FROM {$this->get_table()} b
                        INNER JOIN ({$subquery}) latest ON b.type = latest.type AND b.slug = latest.slug AND b.version = latest.max_version
                        WHERE {$where_clause}";
		} else {
			$query = "SELECT * FROM {$this->get_table()} b WHERE {$where_clause}";
		}

		$prepare_values = array_merge( $prepare_values, $values );

		// Add ordering. Both halves are constrained to a fixed set rather than
		// bound, because a placeholder cannot stand in for an identifier.
		$allowed_orderby = array( 'name', 'created_at', 'updated_at', 'slug', 'type' );
		$orderby         = in_array( $args['orderby'], $allowed_orderby, true ) ? $args['orderby'] : 'name';
		$order           = 'DESC' === strtoupper( $args['order'] ) ? 'DESC' : 'ASC';
		$query          .= " ORDER BY b.{$orderby} {$order}";

		$rows = empty( $prepare_values )
			? $wpdb->get_results( $query ) // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- No placeholders: every fragment above is a literal or allowlisted identifier.
			: $wpdb->get_results( $wpdb->prepare( $query, $prepare_values ) ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $query is placeholders-only; values bind here.

		$sequences = array_map( array( Sequence::class, 'from_row' ), $rows );

		wp_cache_set( $cache_key, $sequences, self::CACHE_GROUP );

		$cache_entries = array();
		foreach ( $sequences as $sequence ) {
			$cache_entries[ self::cache_key( 'sequence_' . $sequence->id ) ] = $sequence;
		}

		if ( ! empty( $cache_entries ) ) {
			wp_cache_set_multiple( $cache_entries, self::CACHE_GROUP );
		}

		return $sequences;
	}

	/**
	 * Get all workflow sequences.
	 *
	 * @param  array $args Query arguments.
	 * @return Sequence[]
	 */
	public function get_workflow_sequences( array $args = array() ): array {
		return $this->get_all( array_merge( $args, array( 'type' => Sequence::TYPE_WORKFLOW ) ) );
	}

	/**
	 * Get all phase sequences.
	 *
	 * @param  array $args Query arguments.
	 * @return Sequence[]
	 */
	public function get_phase_sequences( array $args = array() ): array {
		return $this->get_all( array_merge( $args, array( 'type' => Sequence::TYPE_PHASE ) ) );
	}

	/**
	 * Get the active phase sequence.
	 *
	 * @return Sequence|null
	 */
	public function get_active_phase_sequence(): ?Sequence {
		$sequences = $this->get_phase_sequences( array( 'status' => 'active' ) );
		return $sequences[0] ?? null;
	}

	/**
	 * Get active sequences.
	 *
	 * @return Sequence[]
	 */
	public function get_active(): array {
		return $this->get_all( array( 'status' => 'active' ) );
	}

	/**
	 * Create a new sequence.
	 *
	 * @param  string $name        Sequence name.
	 * @param  string $slug        Sequence slug.
	 * @param  string $description Sequence description.
	 * @param  array  $config      Sequence configuration.
	 * @param  int    $created_by  User ID who created it.
	 * @param  string $type        Sequence type (workflow or phase).
	 * @return int|false The new ID or false on failure.
	 */
	public function create( string $name, string $slug, string $description, array $config, int $created_by, string $type = Sequence::TYPE_WORKFLOW ): int|false {
		global $wpdb;

		// The single write-time gate: rejects a malformed stage graph and returns
		// the normalized config (sanitized keys, defaulted regions, region entries).
		// Persist the RETURNED config — every write path (create/update, import,
		// seeder) flows through here.
		$config = Sequence::prepare_config_for_write( $config, $type );

		$now = current_time( 'mysql' );

		$data = array(
			'uuid'        => wp_generate_uuid4(),
			'type'        => $type,
			'name'        => $name,
			'slug'        => sanitize_title( $slug ),
			'description' => $description,
			'version'     => 1,
			'status'      => 'active',
			'config'      => wp_json_encode( $config ),
			'created_by'  => $created_by,
			'created_at'  => $now,
			'updated_at'  => $now,
		);

		$result = $wpdb->insert( $this->get_table(), $data );

		if ( $result ) {
			$this->flush_cache();
		}

		return $result ? $wpdb->insert_id : false;
	}

	/**
	 * Update a sequence in place.
	 *
	 * @param  int   $id   Sequence ID.
	 * @param  array $data Data to update.
	 * @return int|false Sequence ID or false on failure.
	 */
	public function update( int $id, array $data ): int|false {
		global $wpdb;

		$existing = $this->find( $id );
		if ( ! $existing ) {
			return false;
		}

		$update_data = array(
			'updated_at' => current_time( 'mysql' ),
		);

		if ( isset( $data['name'] ) ) {
			$update_data['name'] = $data['name'];
		}
		if ( isset( $data['description'] ) ) {
			$update_data['description'] = $data['description'];
		}
		if ( isset( $data['config'] ) ) {
			// The single write-time gate: rejects a malformed stage graph and returns
			// the normalized config to persist. Type comes from the existing row — a
			// sequence's type is immutable, so an update can't switch a workflow into
			// a phase to skip the stage-graph rules.
			$update_data['config'] = wp_json_encode( Sequence::prepare_config_for_write( $data['config'], $existing->type ) );
		}
		if ( isset( $data['status'] ) ) {
			$update_data['status'] = $data['status'];
		}

		$result = $wpdb->update(
			$this->get_table(),
			$update_data,
			array( 'id' => $id )
		);

		if ( false !== $result ) {
			$this->flush_cache();
		}

		return false !== $result ? $id : false;
	}

	/**
	 * Repair a sequence whose stages predate the status-region write gate.
	 *
	 * A sequence stored before the stage x status matrix landed has stages with
	 * no `status` region, and every read of one throws (see
	 * Sequence::get_stages_missing_region). Rather than defaulting the region at
	 * read time — which would be exactly the silent fallback the architecture
	 * forbids — this replays the stored config through the SAME write gate every
	 * other write path uses. The gate normalizes a missing region to 'draft' (the
	 * least privileged region: a stage repaired into it can never publish by
	 * accident) and still rejects anything else malformed.
	 *
	 * Replaying alone is not enough. A row old enough to have no regions is old
	 * enough to predate the rule that a stage holds at most one transition per
	 * target, so the gate rejects it for a duplicate and the author's escape hatch
	 * fails on precisely the sequences it exists for. So the config first goes
	 * through Sequence::collapse_duplicate_transitions(), which keeps the first
	 * transition to a target and names every one it removed.
	 *
	 * Everything else the gate rejects — duplicate stage keys, a dangling target,
	 * two checkpoints in one region — has no inferable answer, and the returned
	 * WP_Error carries the gate's own message so the author knows which stage or
	 * transition to open.
	 *
	 * What the collapse had to remove comes back with the ID. A repair that drops
	 * an edge the author drew has to say so — a silent deletion is the thing these
	 * repairs exist to end — so the report travels to the REST layer and on to the
	 * editor rather than being thrown away here.
	 *
	 * Deliberately explicit and author-triggered: the Sequence editor surfaces
	 * the affected stages and the author chooses to repair.
	 *
	 * @param  int $id Sequence ID.
	 * @return array{id: int, dropped: array}|false|\WP_Error
	 *               The sequence ID with the collapse's report (see
	 *               Sequence::collapse_duplicate_transitions), false on write
	 *               failure, or WP_Error when the sequence is absent or the config
	 *               cannot be normalized.
	 */
	public function repair_stage_regions( int $id ): array|false|\WP_Error {
		$sequence = $this->find( $id );
		if ( ! $sequence ) {
			return new \WP_Error(
				'sequence_not_found',
				__( 'Sequence not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		if ( empty( $sequence->get_stages_missing_region() ) ) {
			// Nothing to repair is a caller error, not a silent success: the UI
			// only offers this action when stages are actually missing regions.
			return new \WP_Error(
				'nothing_to_repair',
				__( 'Every stage in this sequence already has a status region.', 'vip-workflows' ),
				array( 'status' => 409 )
			);
		}

		try {
			$repair = Sequence::collapse_duplicate_transitions( $sequence->config, $sequence->type );

			$updated = $this->update( $id, array( 'config' => $repair['config'] ) );

			if ( false === $updated ) {
				return false;
			}

			return array(
				'id'      => $updated,
				'dropped' => $repair['dropped'],
			);
		} catch ( \InvalidArgumentException $e ) {
			// The config is malformed in a way no repair can infer — the author has
			// to fix it in the editor. The gate's message names the offending stage
			// or transition, so it is passed through rather than replaced with a
			// generic failure.
			return new \WP_Error(
				'sequence_invalid',
				sprintf(
					/* translators: %s: validation error from the sequence write gate. */
					__( 'This sequence needs a change only you can make before it can be repaired: %s', 'vip-workflows' ),
					$e->getMessage()
				),
				array( 'status' => 400 )
			);
		}
	}

	/**
	 * Archive a sequence.
	 *
	 * @param  int $id Sequence ID.
	 * @return bool
	 */
	public function archive( int $id ): bool {
		global $wpdb;

		$result = $wpdb->update(
			$this->get_table(),
			array(
				'status'     => 'archived',
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $id )
		);

		if ( false !== $result ) {
			$this->flush_cache();
		}

		return false !== $result;
	}

	/**
	 * Delete a sequence.
	 *
	 * @param  int $id Sequence ID.
	 * @return bool
	 */
	public function delete( int $id ): bool {
		global $wpdb;

		$result = $wpdb->delete(
			$this->get_table(),
			array( 'id' => $id ),
			array( '%d' )
		);

		if ( false !== $result ) {
			$this->flush_cache();
		}

		return false !== $result;
	}

	/**
	 * Flush all sequence caches.
	 */
	private function flush_cache(): void {
		/*
		 * wp_cache_flush_group() is optional, and the drop-ins that matter do not
		 * implement it — on a memcached-backed site it returns false and flushes
		 * nothing. That made every save a no-op as far as readers were concerned:
		 * the row changed, the cache did not, and the sequence editor and the
		 * stage-agent runner both carried on serving the previous configuration.
		 * It reads as "my change would not stick".
		 *
		 * So the group flush is attempted, and when the drop-in declines, the
		 * version salt in every key is bumped instead. That invalidates the whole
		 * group in one write without needing to enumerate keys — which is not
		 * possible for the `all_*` entries, since they are hashes of their
		 * arguments.
		 */
		// Whichever branch runs below moves the generation on, so the memo cannot
		// be carried past this point.
		self::$cache_version = null;

		if ( true === wp_cache_flush_group( self::CACHE_GROUP ) ) {
			return;
		}

		/*
		 * incr, not read-then-write: two saves landing together would otherwise
		 * read the same number and write the same number, and one of them would
		 * not invalidate anything. incr returns false when the key is absent —
		 * evicted, or never seeded — which seeds a generation instead.
		 */
		if ( false === wp_cache_incr( self::VERSION_KEY, 1, self::CACHE_GROUP ) ) {
			wp_cache_set( self::VERSION_KEY, self::seed_version(), self::CACHE_GROUP );
		}
	}

	/**
	 * The current cache generation.
	 *
	 * Memoized per request: this is called once per key construction, and
	 * `preload()` and `get_all()` build a key per sequence in a loop — so
	 * without it, preloading twenty sequences costs twenty round-trips to the
	 * object cache purely to compute names.
	 *
	 * @return int
	 */
	private static function cache_version(): int {
		if ( null !== self::$cache_version ) {
			return self::$cache_version;
		}

		$version = wp_cache_get( self::VERSION_KEY, self::CACHE_GROUP );

		if ( is_numeric( $version ) ) {
			self::$cache_version = (int) $version;

			return self::$cache_version;
		}

		/*
		 * Seeded, never defaulted to a fixed number. The version key lives in
		 * the same evictable cache it versions, so a fixed default would send
		 * readers back to a generation whose stale entries are still cached —
		 * reviving exactly the data a bump was meant to retire, intermittently.
		 * A fresh seed is only ever a cold cache.
		 */
		self::$cache_version = self::seed_version();

		wp_cache_set( self::VERSION_KEY, self::$cache_version, self::CACHE_GROUP );

		return self::$cache_version;
	}

	/**
	 * A collision-resistant numeric cache generation.
	 *
	 * Use the lower half of the integer range so subsequent increments retain
	 * ample headroom.
	 *
	 * @return int
	 */
	private static function seed_version(): int {
		return random_int( 1, intdiv( PHP_INT_MAX, 2 ) );
	}

	/**
	 * Namespace a cache key to the current generation.
	 *
	 * @param string $key Unversioned key.
	 * @return string
	 */
	private static function cache_key( string $key ): string {
		return 'v' . self::cache_version() . '_' . $key;
	}

	/**
	 * Get all versions of a sequence.
	 *
	 * @param  string $slug Sequence slug.
	 * @return Sequence[]
	 */
	public function get_versions( string $slug ): array {
		global $wpdb;

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$this->get_table()} WHERE slug = %s ORDER BY version DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$slug
			)
		);

		return array_map( array( Sequence::class, 'from_row' ), $rows );
	}
}
