<?php
/**
 * Media Provider Requirements — optional reason channel for media providers.
 *
 * `MediaProviderInterface::is_configured()` answers *whether* a provider can
 * run but never *why not*, so Media Scout could only ever report a bare
 * "unavailable". This companion interface adds the missing reason channel.
 *
 * It is deliberately a separate, optional interface rather than a new method on
 * `MediaProviderInterface`. That interface is a public contract: external
 * plugins return their own implementations through the
 * `vip_workflows_media_providers` filter, and adding a required method would
 * fatal every one of them on upgrade. Callers therefore probe with `instanceof`
 * and treat its absence as "unavailable, reason unknown" — the same shape a
 * legacy bool `false` availability callback produces.
 *
 * Implementations are only consulted when `is_configured()` is false, so
 * `get_unmet_requirement()` may assume the provider is unconfigured.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

use VIPWorkflows\Abilities\Requirement;

/**
 * A media provider that can explain why it is not configured.
 */
interface MediaProviderRequirements {

	/**
	 * Describe the unmet requirement blocking this provider.
	 *
	 * Build it with `VIPWorkflows\Abilities\RequirementFactory` rather than by
	 * hand, so the destination resolves against the active credential backend
	 * instead of hardcoding a screen that may not exist on this install.
	 *
	 * Only called when `is_configured()` returns false.
	 *
	 * @since 0.0.1
	 *
	 * @return Requirement The unmet requirement, attributed to this provider.
	 */
	public function get_unmet_requirement(): Requirement;
}
