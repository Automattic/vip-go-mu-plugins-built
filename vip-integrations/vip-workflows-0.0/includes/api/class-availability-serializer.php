<?php
/**
 * Capability-aware serialization of an `Availability` at a REST boundary.
 *
 * `Availability::to_array()` takes the message register as an argument on
 * purpose: the same requirement set has to read differently for someone who can
 * open Settings → Connectors and someone who cannot. Choosing that register is
 * therefore a decision every REST surface must make, and making it four separate
 * times is how an admin URL eventually leaks to an `edit_posts` caller — a later
 * edit to any single controller would be enough. This class owns the decision
 * once so there is exactly one line in the plugin that maps a capability to a
 * register. A caller whose audience is not the current request's user states its
 * register instead of inferring one — see `serialize_for_register()`.
 *
 * It lives in `VIPWorkflows\API` rather than `VIPWorkflows\Abilities` because the
 * capability gate is a property of the read boundary, not of the requirement:
 * the value objects deliberately know nothing about who is asking. It is a small
 * dedicated class rather than a method on `UtilityController` because that
 * controller registers routes (`/url-meta`) and is not a static utility bag.
 *
 * It also owns the *register-free* shape used when a runtime failure has to be
 * stored (`to_persistable()`). Stored state has no reader, so it must not carry
 * either register's wording — see that method for why.
 *
 * @package VIPWorkflows\API
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Abilities\Availability;
use VIPWorkflows\Abilities\Destination;
use VIPWorkflows\Abilities\Requirement;
use VIPWorkflows\Abilities\RequirementGroup;

/**
 * Serializes availability for whoever is reading the response.
 */
final class AvailabilitySerializer {

	/**
	 * The capability that separates the two message registers.
	 *
	 * The Agents screen and Settings → Connectors both require `manage_options`,
	 * while agent execution only requires `edit_posts`. A reader without this
	 * capability cannot act on an admin destination, so they never receive one.
	 */
	public const ADMIN_CAPABILITY = 'manage_options';

	/**
	 * Not instantiable; the register decision is stateless.
	 */
	private function __construct() {}

	/**
	 * The message register appropriate to the current user.
	 *
	 * Request-bound callers only. `current_user_can()` answers for whoever the
	 * request is authenticated as, so a caller with no bound user — cron, Action
	 * Scheduler, WP-CLI — is silently answered "no" and gets the user register
	 * with no way to say otherwise. Those callers know their own audience and must
	 * name the register explicitly via `serialize_for_register()`.
	 *
	 * @since 0.0.1
	 *
	 * @return string Requirement::REGISTER_ADMIN or ::REGISTER_USER.
	 */
	public static function register_for_current_user(): string {
		return current_user_can( self::ADMIN_CAPABILITY )
			? Requirement::REGISTER_ADMIN
			: Requirement::REGISTER_USER;
	}

	/**
	 * Serialize an availability result for the current user's register.
	 *
	 * Always returns the full structure, including when nothing is unmet — an
	 * available source serializes as an empty `groups` list rather than `null`,
	 * so a client never has to distinguish "no requirements" from "key absent".
	 *
	 * @since 0.0.1
	 *
	 * @param  Availability $availability Structured availability result.
	 * @return array<string, mixed>
	 */
	public static function serialize( Availability $availability ): array {
		return $availability->to_array( self::register_for_current_user() );
	}

	/**
	 * Serialize an availability result for a named register.
	 *
	 * For callers that cannot ask `current_user_can()` a meaningful question — a
	 * cron event, an Action Scheduler job, WP-CLI, or anything else writing output
	 * for an audience other than the current request's user. Such a caller has no
	 * bound user, so `register_for_current_user()` would hand it the user register
	 * by default and give it no way to say otherwise.
	 *
	 * Callers that *are* request-bound must keep using `serialize()`: choosing the
	 * register by hand at a REST boundary is how an admin URL eventually reaches an
	 * `edit_posts` reader.
	 *
	 * @since 0.0.1
	 *
	 * @param  Availability $availability Structured availability result.
	 * @param  string       $register     Requirement::REGISTER_ADMIN or ::REGISTER_USER.
	 * @return array<string, mixed>
	 */
	public static function serialize_for_register( Availability $availability, string $register ): array {
		return $availability->to_array( $register );
	}

	/**
	 * Serialize the "nothing is unmet" result.
	 *
	 * Used by surfaces that must emit the key for sources with no structured
	 * availability channel at all — a plain `WP_Ability` cannot report
	 * requirements, and omitting the key there would make every consumer branch
	 * on its presence.
	 *
	 * @since 0.0.1
	 *
	 * @return array<string, mixed>
	 */
	public static function serialize_available(): array {
		return self::serialize( Availability::available() );
	}

	/**
	 * The register-free shape to store when a runtime gate blocks an execution.
	 *
	 * `AbilityExecutor` and `IdeationOrchestrator` write their gate outcome into
	 * durable storage — `wp_vip_ability_results` and ideation post meta — which
	 * outlives the request that produced it and has no reader at write time.
	 * Rendering a sentence there would freeze one audience's wording: on a fresh
	 * install the person running ideation is usually the administrator, so the
	 * user register would tell them to ask an administrator, and the admin
	 * register would hand an editor a `/wp-admin/` instruction they cannot act
	 * on. Neither can be upgraded by a later read.
	 *
	 * So only requirement *identity* is stored — the stable id, the kind, and the
	 * source attribution. Both message registers stay derivable from the live
	 * availability at read time, where the reader is known: see
	 * `IdeationOrchestrator::add_reader_availability()`.
	 *
	 * @since 0.0.1
	 *
	 * @param  Availability $availability Structured availability result.
	 * @return array<int, array<string, mixed>> Groups, each with its satisfaction
	 *                                         mode and identity-only requirements.
	 *                                         Empty for a legacy bool `false`.
	 */
	public static function to_persistable( Availability $availability ): array {
		return array_map(
			static function ( RequirementGroup $group ): array {
				return array(
					'satisfy'      => $group->get_satisfy(),
					'requirements' => array_map(
						static function ( Requirement $requirement ): array {
							return array(
								'id'      => $requirement->get_id(),
								'kind'    => $requirement->get_kind(),
								'sources' => $requirement->get_sources(),
							);
						},
						$group->get_requirements()
					),
				);
			},
			$availability->get_groups()
		);
	}

	/**
	 * JSON schema for the serialized shape.
	 *
	 * Describes the union of both registers: `reason` and `destination` appear
	 * only in the admin register, `message` only in the user register, and none
	 * of the three is required.
	 *
	 * @since 0.0.1
	 *
	 * @return array<string, mixed>
	 */
	public static function get_schema(): array {
		return array(
			'description' => __( 'Structured availability: whether dependencies are met, and the unmet requirements if not.', 'vip-workflows' ),
			'type'        => 'object',
			'context'     => array( 'view', 'edit' ),
			'readonly'    => true,
			'properties'  => array(
				'available' => array(
					'description' => __( 'Whether every dependency is satisfied.', 'vip-workflows' ),
					'type'        => 'boolean',
				),
				'groups'    => array(
					'description' => __( 'Unmet requirement groups. Empty when available.', 'vip-workflows' ),
					'type'        => 'array',
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'satisfy'      => array(
								'description' => __( 'Whether every requirement in the group must be satisfied, or any one of them.', 'vip-workflows' ),
								'type'        => 'string',
								'enum'        => array( RequirementGroup::SATISFY_ALL, RequirementGroup::SATISFY_ANY ),
							),
							'requirements' => array(
								'type'  => 'array',
								'items' => array(
									'type'       => 'object',
									'properties' => array(
										'id'          => array(
											'description' => __( 'Stable requirement identity, used to deduplicate across sources.', 'vip-workflows' ),
											'type'        => 'string',
										),
										'kind'        => array(
											'description' => __( 'What class of dependency is missing.', 'vip-workflows' ),
											'type'        => 'string',
											'enum'        => array(
												Requirement::KIND_MISSING_CREDENTIAL,
												Requirement::KIND_UNSUPPORTED_ENVIRONMENT,
												Requirement::KIND_DEPENDENCY,
											),
										),
										'sources'     => array(
											'description' => __( 'Labels of the capabilities that need this requirement.', 'vip-workflows' ),
											'type'        => 'array',
											'items'       => array( 'type' => 'string' ),
										),
										'reason'      => array(
											'description' => __( 'Admin register only: what is missing.', 'vip-workflows' ),
											'type'        => 'string',
										),
										'message'     => array(
											'description' => __( 'User register only: what is missing, phrased for a reader who cannot reach admin settings.', 'vip-workflows' ),
											'type'        => 'string',
										),
										'destination' => array(
											'description' => __( 'Admin register only: where the requirement can be satisfied.', 'vip-workflows' ),
											'type'        => 'object',
											'properties'  => array(
												'kind'  => array(
													'type' => 'string',
													'enum' => array(
														Destination::KIND_ADMIN_URL,
														Destination::KIND_IN_CARD,
														Destination::KIND_NONE,
													),
												),
												'url'   => array(
													'description' => __( 'Absolute URL. Empty unless the kind is admin_url.', 'vip-workflows' ),
													'type'        => 'string',
												),
												'label' => array(
													'description' => __( 'Link label. Empty when there is no URL.', 'vip-workflows' ),
													'type'        => 'string',
												),
												'hint'  => array(
													'description' => __( 'Instruction shown when there is nowhere to link.', 'vip-workflows' ),
													'type'        => 'string',
												),
												'credentials_url' => array(
													'description' => __( 'External URL where the credentials can be obtained. Empty when the service does not name one.', 'vip-workflows' ),
													'type'        => 'string',
												),
											),
										),
									),
								),
							),
						),
					),
				),
			),
		);
	}
}
