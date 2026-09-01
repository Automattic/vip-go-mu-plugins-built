<?php
/**
 * Abilities API functions.
 *
 * Wraps the WordPress core Abilities API (provided by WordPress 7.0+ core) with
 * VIP Workflows extensions. Uses ability_class so Core instantiates our Ability subclass
 * directly, giving every VIP-registered ability is_available(),
 * get_display_order(), and other extensions without a parallel registry.
 *
 * @package VIPWorkflows
 * @see     WP_Ability
 * @see     VIPWorkflows\Abilities\Ability
 */

declare( strict_types=1 );

use VIPWorkflows\Abilities\Ability;

/**
 * Register a VIP Workflows ability.
 *
 * Delegates to wp_register_ability() with ability_class set to our Ability
 * subclass. Core instantiates our class, so wp_get_ability() returns an
 * object with is_available(), get_display_order(), etc.
 *
 * Custom properties (icon, thinking_message, success_message,
 * availability_callback) belong in the `meta` array, not as top-level args.
 *
 * @param string $name Namespaced ability identifier (e.g. 'vip-workflows/web-researcher').
 * @param array  $args Ability arguments per WP_Ability, with custom properties in meta.
 * @return \WP_Ability|null The registered Ability instance, or null on failure.
 */
function vip_workflows_register_ability( string $name, array $args ): ?\WP_Ability {
	$args['ability_class'] = Ability::class;

	return wp_register_ability( $name, $args );
}

/**
 * Get an ability by name.
 *
 * @param  string $name Ability identifier.
 * @return \WP_Ability|null
 */
function vip_workflows_get_ability( string $name ): ?\WP_Ability {
	return wp_get_ability( $name );
}

/**
 * Get all registered abilities.
 *
 * @return \WP_Ability[]
 */
function vip_workflows_get_abilities(): array {
	return wp_get_abilities();
}

/**
 * Check if an ability is registered.
 *
 * @param  string $name Ability identifier.
 * @return bool
 */
function vip_workflows_has_ability( string $name ): bool {
	return wp_has_ability( $name );
}

/**
 * Execute an ability.
 *
 * @param  string $name  Ability identifier.
 * @param  array  $input Input parameters.
 * @return mixed Result of execution.
 * @throws \Exception If ability not found.
 */
function vip_workflows_execute_ability( string $name, array $input = array() ) {
	$ability = vip_workflows_get_ability( $name );

	if ( ! $ability ) {
		throw new \Exception(
			/* translators: %s: ability name. */
			sprintf( esc_html__( 'Ability "%s" not found.', 'vip-workflows' ), esc_html( $name ) )
		);
	}

	return $ability->execute( $input );
}

/**
 * Unregister an ability.
 *
 * @param  string $name Ability identifier.
 * @return \WP_Ability|null The unregistered ability, or null if not found.
 */
function vip_workflows_unregister_ability( string $name ): ?\WP_Ability {
	return wp_unregister_ability( $name );
}
