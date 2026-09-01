<?php
/**
 * Per-provider model catalog.
 *
 * Lists the text-generation models a provider supports, discovered from the
 * bundled AI Client model metadata (no API key required) and cached for 24h.
 * Used by the settings UI to populate the provider-scoped model dropdown and by
 * the controller to validate a saved selection.
 *
 * @package VIPWorkflows\AI
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

/**
 * Discovers and caches per-provider text-generation model ids.
 */
final class AiModels {

	private const CACHE_PREFIX = 'vip_workflows_ai_models_';

	/**
	 * Cache TTL — 24h, per the dynamic-discovery decision.
	 */
	private const CACHE_TTL = 86400;

	/**
	 * Get the text-generation model ids for a provider (cached 24h).
	 *
	 * @since 0.0.1
	 *
	 * @param  string $provider Provider id.
	 * @return string[] Model ids (may be empty when discovery is unavailable).
	 */
	public static function for_provider( string $provider ): array {
		$cached = get_transient( self::CACHE_PREFIX . $provider );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$models = self::discover( $provider );
		set_transient( self::CACHE_PREFIX . $provider, $models, self::CACHE_TTL );

		return $models;
	}

	/**
	 * Whether a model id is valid for a provider (per the discovered catalog).
	 *
	 * When the catalog is empty (discovery unavailable), any non-empty id is
	 * accepted so a working configuration is never rejected.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $provider Provider id.
	 * @param  string $model    Model id.
	 * @return bool
	 */
	public static function is_valid( string $provider, string $model ): bool {
		if ( '' === $model ) {
			return false;
		}
		$models = self::for_provider( $provider );
		return empty( $models ) ? true : in_array( $model, $models, true );
	}

	/**
	 * Clear a provider's cached catalog.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $provider Provider id.
	 * @return void
	 */
	public static function flush( string $provider ): void {
		delete_transient( self::CACHE_PREFIX . $provider );
	}

	/**
	 * Discover text-generation model ids from the provider's bundled metadata.
	 *
	 * @param  string $provider Provider id.
	 * @return string[] Canonical model ids (dated snapshots dropped), or [].
	 */
	private static function discover( string $provider ): array {
		try {
			if ( ! class_exists( 'WordPress\\AiClient\\AiClient' ) ) {
				return array();
			}

			$registry = \WordPress\AiClient\AiClient::defaultRegistry();
			$class    = ( is_object( $registry ) && method_exists( $registry, 'getProviderClassName' ) )
				? $registry->getProviderClassName( $provider )
				: null;

			if ( ! is_string( $class ) || ! class_exists( $class ) || ! method_exists( $class, 'modelMetadataDirectory' ) ) {
				return array();
			}

			$ids = array();
			foreach ( $class::modelMetadataDirectory()->listModelMetadata() as $meta ) {
				if ( ! self::supports_text_generation( $meta ) ) {
					continue;
				}
				$id = $meta->getId();
				// Drop dated snapshot ids (e.g. gpt-5.4-2026-03-05) to keep the
				// list to canonical aliases.
				if ( is_string( $id ) && '' !== $id && ! preg_match( '/-\d{4}-\d{2}-\d{2}$/', $id ) ) {
					$ids[ $id ] = true;
				}
			}

			$ids = array_keys( $ids );
			sort( $ids );
			return $ids;
		} catch ( \Throwable $e ) {
			return array();
		}
	}

	/**
	 * Whether a model metadata entry advertises the TEXT_GENERATION capability.
	 *
	 * @param  object $meta A WordPress\AiClient ModelMetadata instance.
	 * @return bool
	 */
	private static function supports_text_generation( object $meta ): bool {
		if ( ! method_exists( $meta, 'getSupportedCapabilities' ) ) {
			return false;
		}
		foreach ( $meta->getSupportedCapabilities() as $cap ) {
			// The capability is typically a PHP enum (its case name is what
			// identifies the capability, e.g. `text_generation`). Enum `->name`
			// and `->value` are magic — property_exists() returns false for them
			// — so detect enums explicitly and read them directly. Fall back to a
			// plain object property or a raw string. Compare case-insensitively so
			// a provider reporting the lowercase form is not silently dropped.
			$candidates = array();
			if ( $cap instanceof \UnitEnum ) {
				$candidates[] = $cap->name;
				if ( $cap instanceof \BackedEnum ) {
					$candidates[] = (string) $cap->value;
				}
			} elseif ( is_object( $cap ) && ( property_exists( $cap, 'name' ) || method_exists( $cap, '__get' ) ) ) {
				// Enum-like value objects (e.g. the AI Client's CapabilityEnum)
				// expose `name` via a magic getter, for which isset() is false —
				// so guard on __get, not isset().
				$candidates[] = (string) $cap->name;
			} elseif ( is_string( $cap ) ) {
				$candidates[] = $cap;
			}

			foreach ( $candidates as $candidate ) {
				if ( 'TEXT_GENERATION' === strtoupper( (string) $candidate ) ) {
					return true;
				}
			}
		}
		return false;
	}
}
