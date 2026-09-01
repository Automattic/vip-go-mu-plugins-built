<?php
/**
 * The structured result of an availability check.
 *
 * Widens the historic bool `availability_callback` contract without breaking it.
 * A callback may return:
 *
 *   - an `Availability` instance — the structured shape, carrying the unmet
 *     requirements that explain *why* the ability cannot run and *where* to fix it;
 *   - a `RequirementGroup`, a bare `Requirement`, or an array of either — a
 *     callback that reached for the structured shape and stopped short. Reported
 *     via `_doing_it_wrong()` and treated as unmet, because coercing it to bool
 *     would report *available* with the dependencies never checked;
 *   - anything else — coerced to bool exactly as before, so the long tail of
 *     third-party callbacks returning `true`/`false`/`1`/`null` keeps working
 *     with no diagnostic and no behavior change.
 *
 * Because the structured shape is a type rather than an array convention, a
 * legacy callback returning an array of plain values can never be mistaken for
 * it — such an array stays truthy-coerced, as it is today.
 *
 * @package VIPWorkflows\Abilities
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

/**
 * Whether an ability's dependencies are met, and what is missing if not.
 */
final class Availability {

	/**
	 * Whether the dependencies are met.
	 *
	 * @var bool
	 */
	private bool $available;

	/**
	 * Unmet requirement groups. Always empty when available.
	 *
	 * @var RequirementGroup[]
	 */
	private array $groups;

	/**
	 * Use the named constructors instead.
	 *
	 * @param bool               $available Whether dependencies are met.
	 * @param RequirementGroup[] $groups    Unmet requirement groups.
	 */
	private function __construct( bool $available, array $groups ) {
		$this->available = $available;
		$this->groups    = array_values( $groups );
	}

	/**
	 * Dependencies are met; nothing to report.
	 *
	 * @since 0.0.1
	 *
	 * @return self
	 */
	public static function available(): self {
		return new self( true, array() );
	}

	/**
	 * Dependencies are not met.
	 *
	 * Passing no groups is valid and means "unavailable, reason unknown" — the
	 * shape a legacy bool `false` produces.
	 *
	 * @since 0.0.1
	 *
	 * @param  RequirementGroup ...$groups Unmet requirement groups.
	 * @return self
	 */
	public static function unmet( RequirementGroup ...$groups ): self {
		return new self( false, $groups );
	}

	/**
	 * Normalize whatever an `availability_callback` returned.
	 *
	 * @since 0.0.1
	 *
	 * @param  mixed $value The callback's return value.
	 * @return self
	 */
	public static function from_callback_return( $value ): self {
		if ( $value instanceof self ) {
			return $value;
		}

		$near_miss = self::describe_near_miss( $value );

		if ( null !== $near_miss ) {
			_doing_it_wrong(
				__METHOD__,
				sprintf(
					'An availability_callback returned %s. Wrap it: return Availability::unmet( $group, ... ) for unmet dependencies, or Availability::available() when they are met. Treating the ability as unavailable until it does.',
					esc_html( $near_miss )
				),
				'1.0.0'
			);

			return self::unmet();
		}

		return $value ? self::available() : self::unmet();
	}

	/**
	 * Name the return shape when a callback reached for this contract and stopped short.
	 *
	 * Failing closed here is safe *only* because `RequirementGroup` and
	 * `Requirement` did not exist before this contract shipped: no callback
	 * written against the historic bool API can produce one, so nothing that used
	 * to work changes meaning. That is the whole justification for the asymmetry
	 * with the legacy long tail below, which keeps coercing to bool silently —
	 * a bool, `null`, an int, a string or an array of anything else is
	 * indistinguishable from a callback that predates this class, and must stay
	 * so.
	 *
	 * A near miss coerced to bool would be *truthy*, so the ability would report
	 * available with its dependencies unchecked. That is the failure mode this
	 * detection exists to remove.
	 *
	 * @since 0.0.1
	 *
	 * @param  mixed $value The callback's return value.
	 * @return string|null Human-readable description of the near miss, or null when
	 *                     the value belongs to the legacy long tail.
	 */
	private static function describe_near_miss( $value ): ?string {
		if ( $value instanceof RequirementGroup ) {
			return 'a RequirementGroup';
		}

		if ( $value instanceof Requirement ) {
			return 'a bare Requirement';
		}

		if ( is_array( $value ) ) {
			foreach ( $value as $item ) {
				if ( $item instanceof RequirementGroup ) {
					return 'an array of RequirementGroup objects';
				}

				if ( $item instanceof Requirement ) {
					return 'an array of Requirement objects';
				}
			}
		}

		return null;
	}

	/**
	 * Whether the dependencies are met.
	 *
	 * @since 0.0.1
	 *
	 * @return bool
	 */
	public function is_available(): bool {
		return $this->available;
	}

	/**
	 * Get the unmet requirement groups.
	 *
	 * @since 0.0.1
	 *
	 * @return RequirementGroup[]
	 */
	public function get_groups(): array {
		return $this->groups;
	}

	/**
	 * Get every unmet requirement, flattened across groups.
	 *
	 * @since 0.0.1
	 *
	 * @return Requirement[]
	 */
	public function get_requirements(): array {
		$requirements = array();

		foreach ( $this->groups as $group ) {
			foreach ( $group->get_requirements() as $requirement ) {
				$requirements[] = $requirement;
			}
		}

		return $requirements;
	}

	/**
	 * Serialize for the given message register.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $register Requirement::REGISTER_ADMIN or ::REGISTER_USER.
	 * @return array<string, mixed>
	 */
	public function to_array( string $register ): array {
		return array(
			'available' => $this->available,
			'groups'    => array_map(
				static function ( RequirementGroup $group ) use ( $register ): array {
					return $group->to_array( $register );
				},
				$this->groups
			),
		);
	}
}
