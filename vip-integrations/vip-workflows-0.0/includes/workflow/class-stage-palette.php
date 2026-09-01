<?php
/**
 * Shared stage color palette.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

/**
 * The qualitative collaboration palette every stage and status color comes from.
 *
 * Seven fixed slots, for CATEGORICAL color only — "which stage is this", "which
 * status is this" — where the hue tells one item apart from another and carries
 * no judgement. Semantic color (a tool passed or failed, a notification's
 * severity, an error state) does NOT belong here: that stays on the WPDS
 * semantic tokens, which is what makes it keep its meaning across themes.
 *
 * The same palette is declared in JS, in src/admin/utils/stage-palette.js, where
 * the sequence editor's color picker reads it. PHP cannot import that module and
 * the module cannot be generated from this class without a build step, so the
 * values exist once per language. Rather than leave the two to drift,
 * tests/phpunit/Unit/StagePaletteTest.php parses the JS file and asserts the two
 * lists match slot for slot — editing either side fails the unit suite until the
 * other side agrees. Within PHP this class is the only place the values live;
 * nothing else may repeat a palette hex.
 */
final class StagePalette {

	/**
	 * The seven slots, in slot order. Names are the ones the editor's picker
	 * shows, so a hex here and a label there describe the same color.
	 */
	public const PURPLE  = '#C36EFF';
	public const PINK    = '#FF51A8';
	public const ORANGE  = '#E4780A';
	public const MAGENTA = '#FF35EE';
	public const GREEN   = '#879F11';
	public const TEAL    = '#46A494';
	public const BLUE    = '#00A2C3';

	/**
	 * Slot order — the order the picker lists them in, and the order
	 * self::at() cycles through.
	 */
	public const SLOTS = array(
		self::PURPLE,
		self::PINK,
		self::ORANGE,
		self::MAGENTA,
		self::GREEN,
		self::TEAL,
		self::BLUE,
	);

	/**
	 * The color for a stage or status whose own color is not set.
	 *
	 * Slot 1, matching DEFAULT_STAGE_COLOR in stage-palette.js so a stage the
	 * server colored and one the editor colored can never disagree.
	 */
	public const DEFAULT_COLOR = self::PURPLE;

	/**
	 * Pick a slot by position, cycling so adjacent items stay distinct.
	 *
	 * The PHP twin of paletteColorAt() in stage-palette.js: a seeded sequence
	 * and one built stage-by-stage in the editor come out the same colors.
	 *
	 * @param  int $index Zero-based position.
	 * @return string Hex color.
	 */
	public static function at( int $index ): string {
		$count = count( self::SLOTS );

		return self::SLOTS[ ( ( $index % $count ) + $count ) % $count ];
	}

	/**
	 * The color for a core WordPress post status.
	 *
	 * Used for posts outside any workflow — the calendar, the no-workflow Kanban
	 * columns — so that a plain draft and a workflow stage are tinted from the
	 * same palette instead of two unrelated sets of hexes.
	 *
	 * Where the palette has a hue that matches what wp-admin has always used for
	 * a status, the mapping keeps it (pending amber -> Orange, future blue ->
	 * Blue, publish green -> Green). `draft` and `private` were both grays, which
	 * the palette has no equivalent for, so they take distinct remaining slots.
	 *
	 * A status that is not one of core's five — a status a CPT registered, say —
	 * is not a data-integrity problem, just an unmapped category, so it gets the
	 * default slot rather than an error.
	 *
	 * @param  string $status Core post status.
	 * @return string Hex color.
	 */
	public static function for_post_status( string $status ): string {
		$colors = array(
			'draft'   => self::TEAL,
			'pending' => self::ORANGE,
			'future'  => self::BLUE,
			'publish' => self::GREEN,
			'private' => self::MAGENTA,
		);

		return $colors[ $status ] ?? self::DEFAULT_COLOR;
	}
}
