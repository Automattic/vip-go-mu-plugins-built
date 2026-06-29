<?php
/**
 * Topological_Sorter utility class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Orders nodes by parent-before-child via Kahn's algorithm.
 *
 * Used by the bulk import flow to ensure source parents are processed before
 * their children within a single batch, so the destination parent post exists
 * by the time its child looks it up.
 *
 * Cycles terminate the algorithm naturally: any node that never reaches
 * in-degree zero is returned in the leftover bucket so the caller can route
 * those items through the normal unresolvable-parent path.
 */
class Topological_Sorter {

	/**
	 * Sorts a parent map so each entry's parent (when also in the map) appears
	 * before the entry itself.
	 *
	 * Nodes whose parent is 0 or whose parent is not in the input map are
	 * treated as roots for this batch. Edges are added only between nodes that
	 * both appear in the input.
	 *
	 * Input order is preserved across ties so callers see a stable output.
	 *
	 * @param array<int, int> $parent_map Node ID => parent node ID (0 when the
	 *                                    node is top-level in this batch).
	 * @return array{sorted: list<int>, leftover: list<int>} Sorted node IDs in
	 *                                    dependency order, followed by any
	 *                                    cycle members that could not be
	 *                                    ordered.
	 */
	public static function sort( array $parent_map ): array {
		$children  = array();
		$in_degree = array();

		foreach ( array_keys( $parent_map ) as $node ) {
			$in_degree[ $node ] = 0;
		}

		foreach ( $parent_map as $node => $parent ) {
			if ( 0 === $parent ) {
				continue;
			}
			if ( ! array_key_exists( $parent, $parent_map ) ) {
				continue;
			}
			if ( ! isset( $children[ $parent ] ) ) {
				$children[ $parent ] = array();
			}
			$children[ $parent ][] = $node;
			++$in_degree[ $node ];
		}

		$queue = array();
		foreach ( array_keys( $parent_map ) as $node ) {
			if ( 0 === $in_degree[ $node ] ) {
				$queue[] = $node;
			}
		}

		$sorted = array();
		while ( $queue ) {
			$node     = array_shift( $queue );
			$sorted[] = $node;

			if ( ! isset( $children[ $node ] ) ) {
				continue;
			}

			foreach ( $children[ $node ] as $child ) {
				--$in_degree[ $child ];
				if ( 0 === $in_degree[ $child ] ) {
					$queue[] = $child;
				}
			}
		}

		$leftover = array();
		foreach ( array_keys( $parent_map ) as $node ) {
			if ( $in_degree[ $node ] > 0 ) {
				$leftover[] = $node;
			}
		}

		return array(
			'sorted'   => $sorted,
			'leftover' => $leftover,
		);
	}
}
