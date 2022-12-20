<?php

class Object_Cache extends Automattic\WP_Object_Cache {
	public function key( $key, $group ): string {
		return parent::key( $key, $group );
	}

	public function flush_prefix( $group ): string {
		return parent::flush_prefix( $group );
	}

	public static function salt_keys( string $key_salt ): string {
		return parent::salt_keys( $key_salt );
	}

	public function &__get( string $property ) {
		return $this->$property;
	}

	/**
	 * @psalm-param array-key $key
	 */
	public function has_cache_entry( $key ): bool {
		return isset( $this->cache[ $key ] );
	}

	/**
	 * @psalm-param array-key $key
	 */
	public function get_cache_entry( $key ): ?array {
		return $this->cache[ $key ] ?? null;
	}

	public function clear_non_peristent_groups(): void {
		$this->no_mc_groups = [];
	}

	public function get_non_persistent_groups(): array {
		return $this->no_mc_groups;
	}

	public function reset_flush_number(): void {
		$this->flush_number = [];
	}

	public function set_global_flush_number( int $number ): void {
		$this->global_flush_number = $number;
	}

	public function get_flush_group(): string {
		return self::FLUSH_GROUP;
	}

	public function get_global_flush_group(): string {
		return self::GLOBAL_FLUSH_GROUP;
	}

	public function get_flush_key(): string {
		return self::FLUSH_KEY;
	}
}
