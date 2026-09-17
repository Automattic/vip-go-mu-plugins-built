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

	vip_workflows_warn_on_unreadable_list_result( $name, $args );

	return wp_register_ability( $name, $args );
}

/**
 * Warn when a list-shaped ability declares rows the UI will never find.
 *
 * `result_type => 'list'` is rendered through `resolveToolResult()`, whose
 * `rowsFrom()` reads `output.suggestions` and no other key. An ability that
 * returns its rows under a different name is not rendered wrongly — it is
 * rendered empty, and there is nothing anywhere to say why. The request
 * succeeds, the console is clean, the result row is stored with its summary
 * intact, and the modal shows a heading over nothing. For an ability that
 * writes, the write has already happened by the time the empty box appears, so
 * it reads as a hang rather than as a mistake.
 *
 * That is a contract worth stating out loud at registration, when the author is
 * looking, rather than leaving to be discovered from an empty modal.
 *
 * Checked against the declared `output_schema` rather than a real result: this
 * runs at registration, where no result exists yet. An ability that declares no
 * `output_schema` properties at all is left alone — that is a different
 * omission, and guessing at intent from silence would produce noise.
 *
 * @param string               $name Ability identifier.
 * @param array<string, mixed> $args Ability arguments.
 * @return void
 */
function vip_workflows_warn_on_unreadable_list_result( string $name, array $args ): void {
	if ( 'list' !== ( $args['meta']['result_type'] ?? '' ) ) {
		return;
	}

	$properties = $args['output_schema']['properties'] ?? null;

	if ( ! is_array( $properties ) || array() === $properties ) {
		return;
	}

	if ( array_key_exists( 'suggestions', $properties ) ) {
		return;
	}

	_doing_it_wrong(
		__FUNCTION__,
		sprintf(
			/* translators: 1: ability name, 2: the list of properties the ability declares instead. */
			esc_html__( 'Ability "%1$s" declares result_type "list" but no "suggestions" property in its output_schema, so the result will render as an empty list. List rows are read from output.suggestions and nowhere else; each row is an array of label, meta and href. Declared instead: %2$s.', 'vip-workflows' ),
			esc_html( $name ),
			esc_html( implode( ', ', array_keys( $properties ) ) )
		),
		'1.0.0'
	);
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
