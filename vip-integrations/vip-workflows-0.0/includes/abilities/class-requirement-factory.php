<?php
/**
 * Builders for the common requirement shapes.
 *
 * Hand-constructing a requirement means supplying a stable id, a kind, two
 * message registers, source attribution, and a backend-resolved destination —
 * enough friction that an extension author would rationally keep returning a
 * bare bool, leaving the richer card UX first-party-only. These builders derive
 * all of it from a service slug so the structured return is shorter than the
 * bool it replaces, and so the in-repo providers stay DRY.
 *
 * @package VIPWorkflows\Abilities
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

use VIPWorkflows\AI\Credentials;

/**
 * Named constructors for requirement shapes.
 */
final class RequirementFactory {

	/**
	 * Prefix for credential-backed requirement ids.
	 */
	private const CREDENTIAL_ID_PREFIX = 'credential:';

	/**
	 * A missing API key, with its destination resolved against the active backend.
	 *
	 * The destination differs by install: the Connectors backend has an admin
	 * screen to link to, while the legacy backend has no credential UI at all, so
	 * the only honest instruction there is the `wp-config.php` constant name.
	 * Hardcoding a link would reintroduce the dead-destination bug this exists to
	 * fix.
	 *
	 * A service this plugin does not manage credentials for — anything outside
	 * `Credentials`, which is reachable because callers pass third-party provider
	 * ids — has neither a constant to name nor a connector to link to. Saying so
	 * is the only honest answer: emitting the empty constant name would render
	 * "Set the  constant in wp-config.php", and the Connectors link would point at
	 * a connector that does not exist.
	 *
	 * @since 0.0.1
	 *
	 * @param  string   $service       Logical service id (e.g. 'tavily').
	 * @param  string   $service_label Display name (e.g. 'Tavily').
	 * @param  string[] $sources       Labels of the abilities/providers needing it.
	 * @return Requirement
	 */
	public static function missing_credential( string $service, string $service_label, array $sources = array() ): Requirement {
		$credentials = Credentials::get_instance();

		if ( '' === $credentials->constant_name( $service ) ) {
			return new Requirement(
				self::CREDENTIAL_ID_PREFIX . $service,
				Requirement::KIND_MISSING_CREDENTIAL,
				sprintf(
					/* translators: %s: service display name, e.g. "My Source". */
					__( '%s is not connected. VIP Workflows does not manage this service\'s credentials, so the plugin that provides it must supply its own configuration.', 'vip-workflows' ),
					$service_label
				),
				sprintf(
					/* translators: %s: service display name, e.g. "My Source". */
					__( '%s is not connected. Ask an administrator to connect it.', 'vip-workflows' ),
					$service_label
				),
				Destination::none(),
				$sources
			);
		}

		/*
		 * The reason names the gap; the destination says where to close it. Keeping
		 * them separate is what lets a surface that renders a link avoid repeating
		 * the location in prose, while a flat-text consumer can still compose both
		 * via Requirement::get_admin_text().
		 */
		$admin_reason = sprintf(
			/* translators: %s: service display name, e.g. "Tavily". */
			__( '%s is not connected.', 'vip-workflows' ),
			$service_label
		);

		if ( $credentials->has_admin_credential_ui() ) {
			$destination = Destination::admin_url(
				admin_url( 'options-connectors.php' ),
				__( 'Settings → Connectors', 'vip-workflows' ),
				__( 'Add its API key in Settings → Connectors.', 'vip-workflows' )
			);
		} else {
			$destination = Destination::none(
				sprintf(
					/* translators: %s: PHP constant name, e.g. "VIP_WORKFLOWS_TAVILY_KEY". */
					__( 'This site has no credential screen, so set the %s constant in wp-config.php.', 'vip-workflows' ),
					$credentials->constant_name( $service )
				)
			);
		}

		return new Requirement(
			self::CREDENTIAL_ID_PREFIX . $service,
			Requirement::KIND_MISSING_CREDENTIAL,
			$admin_reason,
			sprintf(
				/* translators: %s: service display name, e.g. "Tavily". */
				__( '%s is not connected. Ask an administrator to connect it.', 'vip-workflows' ),
				$service_label
			),
			$destination,
			$sources
		);
	}

	/**
	 * A capability the environment cannot support, so there is nothing to configure.
	 *
	 * @since 0.0.1
	 *
	 * @param  string   $id           Stable identity (e.g. 'dependency:ai-client').
	 * @param  string   $admin_reason Reason for admin readers.
	 * @param  string   $user_message Reason for non-admin readers.
	 * @param  string[] $sources      Labels of the abilities/providers needing it.
	 * @return Requirement
	 */
	public static function unsupported_environment( string $id, string $admin_reason, string $user_message, array $sources = array() ): Requirement {
		return new Requirement(
			$id,
			Requirement::KIND_UNSUPPORTED_ENVIRONMENT,
			$admin_reason,
			$user_message,
			Destination::none(),
			$sources
		);
	}

	/**
	 * A missing prerequisite other than a credential (e.g. no provider registered).
	 *
	 * @since 0.0.1
	 *
	 * @param  string   $id           Stable identity (e.g. 'dependency:search-provider').
	 * @param  string   $admin_reason Reason for admin readers.
	 * @param  string   $user_message Reason for non-admin readers.
	 * @param  string[] $sources      Labels of the abilities/providers needing it.
	 * @return Requirement
	 */
	public static function dependency( string $id, string $admin_reason, string $user_message, array $sources = array() ): Requirement {
		return new Requirement(
			$id,
			Requirement::KIND_DEPENDENCY,
			$admin_reason,
			$user_message,
			Destination::none(),
			$sources
		);
	}

	/**
	 * A requirement satisfied by the agent card's own settings fields.
	 *
	 * @since 0.0.1
	 *
	 * A service whose credentials are obtained off-site — signed up for rather than
	 * generated in wp-admin — may name where, so an administrator looking at "sign-in
	 * details are missing" is not left to search for the provider themselves.
	 * Connector-backed services get that link from core's `credentials_url`; a
	 * service core cannot model as a connector has nowhere else to declare it.
	 *
	 * @param  string   $id              Stable identity (e.g. 'settings:foresight').
	 * @param  string   $admin_reason    Reason for admin readers.
	 * @param  string   $user_message    Reason for non-admin readers.
	 * @param  string   $hint            Instruction pointing at the card's fields.
	 * @param  string[] $sources         Labels of the abilities/providers needing it.
	 * @param  string   $credentials_url External URL where the credentials can be obtained.
	 * @return Requirement
	 */
	public static function in_card( string $id, string $admin_reason, string $user_message, string $hint, array $sources = array(), string $credentials_url = '' ): Requirement {
		return new Requirement(
			$id,
			Requirement::KIND_MISSING_CREDENTIAL,
			$admin_reason,
			$user_message,
			Destination::in_card( $hint, $credentials_url ),
			$sources
		);
	}
}
