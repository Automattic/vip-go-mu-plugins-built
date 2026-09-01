<?php
/**
 * A set of unmet requirements sharing a satisfaction rule.
 *
 * The satisfaction mode is what keeps OR-shaped dependencies honest. Media Scout
 * needs Tavily *or* YouTube, so a flat list of requirements would render three
 * individually-phrased hard blockers when the user only has to satisfy one.
 *
 * A group contains only *unmet* members. Satisfaction is evaluated by the
 * availability callback — the only layer with credential access — which returns
 * a bare `true` when its dependencies are met, so no consumer ever re-derives it.
 *
 * @package VIPWorkflows\Abilities
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

/**
 * A group of unmet requirements plus how it can be satisfied.
 */
final class RequirementGroup {

	/**
	 * Every requirement in the group must be satisfied.
	 */
	public const SATISFY_ALL = 'all';

	/**
	 * Any one requirement in the group satisfies it.
	 */
	public const SATISFY_ANY = 'any';

	/**
	 * Satisfaction mode (SATISFY_ALL or SATISFY_ANY).
	 *
	 * @var string
	 */
	private string $satisfy;

	/**
	 * The unmet requirements in this group.
	 *
	 * @var Requirement[]
	 */
	private array $requirements;

	/**
	 * Use the named constructors instead.
	 *
	 * @param string        $satisfy      Satisfaction mode.
	 * @param Requirement[] $requirements Unmet requirements.
	 */
	private function __construct( string $satisfy, array $requirements ) {
		$this->satisfy      = $satisfy;
		$this->requirements = array_values( $requirements );
	}

	/**
	 * A group where every requirement must be satisfied.
	 *
	 * @since 0.0.1
	 *
	 * @param  Requirement ...$requirements Unmet requirements.
	 * @return self
	 */
	public static function all( Requirement ...$requirements ): self {
		return new self( self::SATISFY_ALL, $requirements );
	}

	/**
	 * A group where satisfying any one member is enough.
	 *
	 * @since 0.0.1
	 *
	 * @param  Requirement ...$requirements Unmet requirements.
	 * @return self
	 */
	public static function any( Requirement ...$requirements ): self {
		return new self( self::SATISFY_ANY, $requirements );
	}

	/**
	 * Get the satisfaction mode.
	 *
	 * @since 0.0.1
	 *
	 * @return string SATISFY_ALL or SATISFY_ANY.
	 */
	public function get_satisfy(): string {
		return $this->satisfy;
	}

	/**
	 * Get the unmet requirements.
	 *
	 * @since 0.0.1
	 *
	 * @return Requirement[]
	 */
	public function get_requirements(): array {
		return $this->requirements;
	}

	/**
	 * Return a copy carrying a different requirement set.
	 *
	 * Used by aggregation, which dedupes requirements across sources but must
	 * preserve each group's satisfaction mode.
	 *
	 * @since 0.0.1
	 *
	 * @param  Requirement[] $requirements Replacement requirements.
	 * @return self
	 */
	public function with_requirements( array $requirements ): self {
		return new self( $this->satisfy, $requirements );
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
			'satisfy'      => $this->satisfy,
			'requirements' => array_map(
				static function ( Requirement $requirement ) use ( $register ): array {
					return $requirement->to_array( $register );
				},
				$this->requirements
			),
		);
	}
}
