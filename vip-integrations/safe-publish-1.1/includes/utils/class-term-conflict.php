<?php
/**
 * Term Conflict value object.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

use WP_Term;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Immutable record of one term field an import could not write.
 *
 * One named constructor per reason, so a reason and its field cannot drift
 * apart. Both strings land in the stored degradation detail, and the reason
 * picks the message the admin screens render, so changing either strands the
 * rows already recorded.
 */
final class Term_Conflict {

	/**
	 * Taxonomy the term belongs to.
	 *
	 * @var string
	 */
	public readonly string $taxonomy;

	/**
	 * Term name, falling back to the slug and then the ID, so the degradation
	 * this becomes never reports nothing.
	 *
	 * @var string
	 */
	public readonly string $term_name;

	/**
	 * Term slug.
	 *
	 * @var string
	 */
	public readonly string $term_slug;

	/**
	 * Source term ID the record carried.
	 *
	 * @var int
	 */
	public readonly int $source_term_id;

	/**
	 * Field, or comma-separated fields, left unwritten.
	 *
	 * @var string
	 */
	public readonly string $field;

	/**
	 * Why the write was skipped or failed.
	 *
	 * @var string
	 */
	public readonly string $reason;

	/**
	 * Constructs the conflict. Use the named constructors instead of calling
	 * this directly.
	 *
	 * @param WP_Term $term           Term being reconciled.
	 * @param int     $source_term_id Source term ID the record carries.
	 * @param string  $field          Field, or fields, left unwritten.
	 * @param string  $reason         Why the write was skipped or failed.
	 */
	private function __construct(
		WP_Term $term,
		int $source_term_id,
		string $field,
		string $reason
	) {
		$name = '' !== $term->name
			? (string) $term->name
			: (string) $term->slug;

		$this->taxonomy       = (string) $term->taxonomy;
		$this->term_name      = '' !== $name ? $name : '#' . $term->term_id;
		$this->term_slug      = (string) $term->slug;
		$this->source_term_id = $source_term_id;
		$this->field          = $field;
		$this->reason         = $reason;
	}

	/**
	 * Builds a conflict for a rename another term already blocks.
	 *
	 * @param WP_Term $term           Term being reconciled.
	 * @param int     $source_term_id Source term ID the record carries.
	 * @return self
	 */
	public static function name_taken(
		WP_Term $term,
		int $source_term_id
	): self {
		return new self( $term, $source_term_id, 'name', 'name_taken' );
	}

	/**
	 * Builds a conflict for a source parent that maps to no destination term.
	 *
	 * @param WP_Term $term           Term being reconciled.
	 * @param int     $source_term_id Source term ID the record carries.
	 * @return self
	 */
	public static function parent_unresolved(
		WP_Term $term,
		int $source_term_id
	): self {
		return new self(
			$term,
			$source_term_id,
			'parent',
			'parent_unresolved'
		);
	}

	/**
	 * Builds a conflict for a parent that is the term itself or one of its
	 * descendants.
	 *
	 * @param WP_Term $term           Term being reconciled.
	 * @param int     $source_term_id Source term ID the record carries.
	 * @return self
	 */
	public static function parent_loop(
		WP_Term $term,
		int $source_term_id
	): self {
		return new self( $term, $source_term_id, 'parent', 'parent_loop' );
	}

	/**
	 * Builds a conflict for the fields a failed term update left unwritten.
	 *
	 * @param WP_Term $term           Term being reconciled.
	 * @param int     $source_term_id Source term ID the record carries.
	 * @param string  $fields         Comma-separated fields the update carried.
	 * @return self
	 */
	public static function update_failed(
		WP_Term $term,
		int $source_term_id,
		string $fields
	): self {
		return new self( $term, $source_term_id, $fields, 'update_failed' );
	}
}
