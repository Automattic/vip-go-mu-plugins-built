<?php
/**
 * Ability result repository.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

/**
 * Database operations for ability results.
 */
class AbilityResultRepository {


	/**
	 * Get table name.
	 *
	 * @return string
	 */
	private function get_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'vip_ability_results';
	}

	/**
	 * Save a result.
	 *
	 * @param  AbilityResult $result The result to save.
	 * @return AbilityResult Result with ID set.
	 */
	public function save( AbilityResult $result ): AbilityResult {
		global $wpdb;

		/*
		 * One JSON column backs several fields, so everything that is not the
		 * ability's own schema-shaped output travels under an underscore-prefixed
		 * reserved key and is stripped again on the way out. That keeps `output` in
		 * memory equal to what the ability declared, whether the row was just built
		 * or just read.
		 */
		$result_data = $result->output;
		if ( null !== $result->error ) {
			$result_data['_error'] = $result->error;
		}
		if ( ! empty( $result->unmet_requirements ) ) {
			$result_data['_unmet_requirements'] = $result->unmet_requirements;
		}

		$data = array(
			'ability_id'  => $result->ability_id,
			'post_id'     => $result->post_id,
			'success'     => $result->success ? 1 : 0,
			'summary'     => $result->summary,
			'result_data' => wp_json_encode( $result_data ),
			'duration_ms' => $result->duration_ms,
			'created_by'  => $result->created_by ? $result->created_by : get_current_user_id(),
			'created_at'  => $result->created_at ? $result->created_at : current_time( 'mysql' ),
		);

		$wpdb->insert( $this->get_table(), $data );
		$result->id = (int) $wpdb->insert_id;

		return $result;
	}

	/**
	 * Find results by post ID.
	 *
	 * @param  int         $post_id    Post ID.
	 * @param  string|null $ability_id Filter by ability.
	 * @param  int         $limit      Max results.
	 * @return array<AbilityResult>
	 */
	public function find_by_post( int $post_id, ?string $ability_id = null, int $limit = 10 ): array {
		global $wpdb;

		$sql    = "SELECT * FROM {$this->get_table()} WHERE post_id = %d";
		$params = array( $post_id );

		if ( $ability_id ) {
			$sql     .= ' AND ability_id = %s';
			$params[] = $ability_id;
		}

		$sql     .= ' ORDER BY created_at DESC LIMIT %d';
		$params[] = $limit;

		$rows = $wpdb->get_results(
			$wpdb->prepare( $sql, ...$params ) // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		);

		return array_map( array( $this, 'hydrate' ), $rows ? $rows : array() );
	}

	/**
	 * Find by ID.
	 *
	 * @param  int $id Result ID.
	 * @return AbilityResult|null
	 */
	public function find( int $id ): ?AbilityResult {
		global $wpdb;

		$row = $wpdb->get_row(
			$wpdb->prepare(
				'SELECT * FROM %i WHERE id = %d',
				$this->get_table(),
				$id
			)
		);

		return $row ? $this->hydrate( $row ) : null;
	}

	/**
	 * Delete old results.
	 *
	 * @param  int $days_old Delete results older than this many days.
	 * @return int Number of rows deleted.
	 */
	public function cleanup( int $days_old = 30 ): int {
		global $wpdb;

		return (int) $wpdb->query(
			$wpdb->prepare(
				'DELETE FROM %i WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)',
				$this->get_table(),
				$days_old
			)
		);
	}

	/**
	 * Hydrate a result from database row.
	 *
	 * @param  object $row Database row.
	 * @return AbilityResult
	 */
	private function hydrate( object $row ): AbilityResult {
		$result = new AbilityResult();

		$result->id          = (int) $row->id;
		$result->ability_id  = $row->ability_id;
		$result->post_id     = $row->post_id ? (int) $row->post_id : null;
		$result->success     = (bool) $row->success;
		$result->summary     = $row->summary ?? '';
		$result->duration_ms = (int) $row->duration_ms;
		$result->created_by  = (int) $row->created_by;
		$result->created_at  = $row->created_at;

		$decoded = json_decode( $row->result_data ?? '{}', true );
		$decoded = $decoded ? $decoded : array();

		$result->error              = $decoded['_error'] ?? null;
		$result->unmet_requirements = (array) ( $decoded['_unmet_requirements'] ?? array() );
		unset( $decoded['_error'], $decoded['_unmet_requirements'] );
		$result->output             = $decoded;

		return $result;
	}
}
