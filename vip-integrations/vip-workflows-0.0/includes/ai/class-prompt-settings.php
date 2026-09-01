<?php
/**
 * Prompt override storage.
 *
 * Persists admin overrides for registered AI system prompts in a single option,
 * keyed by prompt id. Mirrors AbilitySettings, but stores only override text —
 * defaults live in the PromptRegistry, never here.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

/**
 * Stores per-prompt override text.
 */
class PromptSettings {

	/**
	 * Option name for storing prompt overrides.
	 */
	private const OPTION_NAME = 'vip_workflows_prompts';

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Cached overrides keyed by prompt id.
	 *
	 * @var array<string, string>|null
	 */
	private ?array $overrides = null;

	/**
	 * Get singleton instance.
	 *
	 * @since 0.0.1
	 *
	 * @return self
	 */
	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Get all stored overrides.
	 *
	 * A non-array stored value is a data-integrity problem (the option was
	 * corrupted out of band), not "no overrides". Surface it to operators and
	 * via a hook, then fall back to an empty set for the rest of the request so
	 * the app stays usable rather than fatal.
	 *
	 * @since 0.0.1
	 *
	 * @return array<string, string> Map of prompt id => override text.
	 */
	public function get_all(): array {
		if ( null === $this->overrides ) {
			$stored = get_option( self::OPTION_NAME, array() );

			if ( ! is_array( $stored ) ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging of a data-integrity problem.
				error_log( '[VIP Workflows] ' . self::OPTION_NAME . ' option is corrupted (expected array, got ' . gettype( $stored ) . '); ignoring stored prompt overrides.' );

				/**
				 * Fires when the prompt-overrides option is found corrupted.
				 *
				 * Lets a site observe or repair a malformed `vip_workflows_prompts`
				 * option instead of having the corruption silently masked.
				 *
				 * @since 0.0.1
				 *
				 * @param mixed $stored The malformed stored value.
				 */
				do_action( 'vip_workflows_prompts_option_corrupted', $stored );

				$stored = array();
			}

			$this->overrides = $stored;
		}
		return $this->overrides;
	}

	/**
	 * Get the override for a prompt, or null when none is set.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $prompt_id Prompt id.
	 * @return string|null Override text, or null when unset.
	 */
	public function get_override( string $prompt_id ): ?string {
		$all = $this->get_all();
		return $all[ $prompt_id ] ?? null;
	}

	/**
	 * Set (or clear) the override for a prompt.
	 *
	 * An empty or whitespace-only value clears the override (reset to default).
	 * The in-request cache is only updated after the option write succeeds, so a
	 * failed persist does not leave callers reading a value that was never saved.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $prompt_id Prompt id.
	 * @param  string $text      Override text; empty clears the override.
	 * @return bool True on success (including a no-op when unchanged), false if the write failed.
	 */
	public function set_override( string $prompt_id, string $text ): bool {
		if ( '' === trim( $text ) ) {
			return $this->delete_override( $prompt_id );
		}

		$all = $this->get_all();
		if ( array_key_exists( $prompt_id, $all ) && $all[ $prompt_id ] === $text ) {
			// Unchanged — nothing to persist, and update_option() would report
			// false for an identical value. Treat as success.
			return true;
		}

		$all[ $prompt_id ] = $text;
		if ( ! $this->persist( $all ) ) {
			return false;
		}

		$this->overrides = $all;
		return true;
	}

	/**
	 * Delete the override for a prompt (reset to default).
	 *
	 * Explicit unset — overrides are never merged, so a delete must remove the
	 * key rather than relying on merge semantics. The cache is only updated after
	 * a successful write.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $prompt_id Prompt id.
	 * @return bool True on success (including a no-op when already unset), false if the write failed.
	 */
	public function delete_override( string $prompt_id ): bool {
		$all = $this->get_all();
		if ( ! array_key_exists( $prompt_id, $all ) ) {
			return true;
		}

		unset( $all[ $prompt_id ] );
		if ( ! $this->persist( $all ) ) {
			return false;
		}

		$this->overrides = $all;
		return true;
	}

	/**
	 * Clear the in-request cache.
	 *
	 * @since 0.0.1
	 *
	 * @return void
	 */
	public function clear_cache(): void {
		$this->overrides = null;
	}

	/**
	 * Persist the full override map.
	 *
	 * Centralizes the storage policy: the option is written with autoload
	 * disabled, since override text can be large and is only read on the admin
	 * settings surface and at AI call sites, never on every page load.
	 *
	 * @since 0.0.1
	 *
	 * @param  array<string, string> $all Full override map to store.
	 * @return bool True if the option was written.
	 */
	private function persist( array $all ): bool {
		return update_option( self::OPTION_NAME, $all, false );
	}
}
