<?php
/**
 * Audit event read service.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Closure;
use Safe_Publish\Utils\Audit_Log_Table;
use Safe_Publish\Utils\Datetime_Sanitizer;

/**
 * Queries and formats audit events for authorized callers.
 */
final class Audit_Read_Service {

	/**
	 * Supported level filters.
	 *
	 * @var string[]
	 */
	public const KNOWN_LEVELS = array( 'info', 'warning', 'error' );

	private const MAX_PER_PAGE     = 100;
	private const DEFAULT_PER_PAGE = 25;

	/**
	 * @var Closure(array): array
	 */
	private Closure $query;

	/**
	 * @var Closure(array): int
	 */
	private Closure $count;

	/**
	 * Sets the audit table read operations.
	 *
	 * @param (Closure(array): array)|null $query Queries decoded audit rows.
	 * @param (Closure(array): int)|null   $count Counts matching audit rows.
	 */
	public function __construct(
		?Closure $query = null,
		?Closure $count = null
	) {
		$this->query = $query ?? Audit_Log_Table::get_events( ... );
		$this->count = $count ?? Audit_Log_Table::count( ... );
	}

	/**
	 * Returns a filtered page of audit events without transport side effects.
	 *
	 * The caller handles authorization and unslashes text fields. Unknown
	 * channels match no rows; unsupported levels and invalid dates are dropped.
	 *
	 * @param array $input {
	 *     Optional audit filters and pagination.
	 *
	 *     @type string[]   $channels     Channel filters.
	 *     @type string[]   $levels       Supported level filters.
	 *     @type string     $event_search Unslashed event substring.
	 *     @type string     $after        ISO datetime or calendar day.
	 *     @type string     $before       Upper bound; days are inclusive.
	 *     @type int|string $page         One-based page index. Default 1.
	 *     @type int|string $per_page     Page size: 1-100, default 25.
	 * }
	 * @return array{items: list<array>, total: int} Audit events and count.
	 */
	public function get_events( array $input ): array {
		$query_args = $this->build_query_args( $input );

		$rows  = ( $this->query )( $query_args );
		$total = ( $this->count )( $query_args );

		$items = array_map(
			static function ( array $row ): array {
				$data    = is_array( $row['data'] ) ? $row['data'] : array();
				$created = (string) $row['created_at_gmt'];

				return array(
					'id'                 => (int) $row['id'],
					'channel'            => (string) $row['channel'],
					'level'              => (string) $row['level'],
					'event'              => (string) $row['event'],
					'date'               => Datetime_Sanitizer::gmt_to_iso8601(
						$created
					),
					'actor_user_id'      => (int) (
						$data['actor_user_id'] ?? 0
					),
					'actor_display_name' => (string) (
						$data['actor_display_name'] ?? ''
					),
					'actor_source'       => (string) (
						$data['actor_source'] ?? ''
					),
					// Cast to object so empty payloads serialize as `{}` (JSON
					// object), matching the AuditEvent.data type the React side
					// expects rather than the `[]` PHP emits for empty arrays.
					'data'               => (object) $data,
				);
			},
			$rows
		);

		return array(
			'items' => $items,
			'total' => $total,
		);
	}

	/**
	 * Translates raw request input into Audit_Log_Table query args. Drops
	 * filters that resolve to empty so the SQL stays minimal and the index
	 * on `created_at_gmt` can serve the unfiltered default view.
	 *
	 * @param array $input Input with unslashed text fields.
	 * @return array Args suitable for Audit_Log_Table::get_events()/count().
	 */
	private function build_query_args( array $input ): array {
		$args = array();

		$channels = is_array( $input['channels'] ?? null )
			? array_values(
				array_filter( array_map( 'sanitize_key', $input['channels'] ) )
			)
			: array();
		if ( array() !== $channels ) {
			$args['channel'] = $channels;
		}

		$levels = is_array( $input['levels'] ?? null )
			? array_values(
				array_intersect(
					array_map( 'sanitize_key', $input['levels'] ),
					self::KNOWN_LEVELS
				)
			)
			: array();
		if ( array() !== $levels ) {
			$args['level'] = $levels;
		}

		if (
			is_string( $input['event_search'] ?? null )
			&& '' !== $input['event_search']
			&& '0' !== $input['event_search']
		) {
			$args['event_type'] = sanitize_text_field( $input['event_search'] );
		}

		foreach ( array(
			'after'  => false,
			'before' => true,
		) as $key => $ceiling ) {
			if ( ! isset( $input[ $key ] ) ) {
				continue;
			}
			$date = Datetime_Sanitizer::sanitize_iso_datetime(
				sanitize_text_field( $input[ $key ] ),
				$ceiling
			);
			if ( is_string( $date ) ) {
				$args[ $key . '_gmt' ] = $date;
			}
		}

		$per_page = absint( $input['per_page'] ?? self::DEFAULT_PER_PAGE );
		$per_page = min( max( $per_page, 1 ), self::MAX_PER_PAGE );

		$page = max( absint( $input['page'] ?? 1 ), 1 );

		$args['limit']  = $per_page;
		$args['offset'] = ( $page - 1 ) * $per_page;

		return $args;
	}
}
