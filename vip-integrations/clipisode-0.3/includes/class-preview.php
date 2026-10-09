<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Preview {

	public static function get_prefix(): string {
		$prefix = get_option( 'clipisode_preview_prefix', 'clipisode' );
		return trim( $prefix, '/' );
	}

	public static function get_url( int $output_id, ?int $media_id, ?string $slug ): ?string {
		if ( ! $media_id || ! $slug ) {
			return null;
		}
		$prefix = self::get_prefix();
		return home_url( "$prefix/$output_id/$media_id/$slug" );
	}

	public static function sanitize_prefix( string $value ): string {
		$value = sanitize_title( trim( $value, '/' ) );
		return $value ?: 'clipisode';
	}

	public function register_blocks(): void {
		register_block_type( CLIPISODE_PLUGIN_DIR . 'build/preview' );
		register_block_type( CLIPISODE_PLUGIN_DIR . 'build/preview-element' );
	}

	public function register_rewrite(): void {
		$prefix = self::get_prefix();
		add_rewrite_rule(
			'^' . preg_quote( $prefix, '/' ) . '/(\d+)/(\d+)/([a-zA-Z0-9_-]+)/?$',
			'index.php?clipisode_preview_id=$matches[1]&clipisode_preview_media=$matches[2]&clipisode_preview_slug=$matches[3]',
			'top'
		);
	}

	public function add_query_vars( array $vars ): array {
		$vars[] = 'clipisode_preview_id';
		$vars[] = 'clipisode_preview_media';
		$vars[] = 'clipisode_preview_slug';
		return $vars;
	}

	public function template_include( string $template ): string {
		$id = get_query_var( 'clipisode_preview_id' );
		if ( ! $id ) {
			return $template;
		}
		return CLIPISODE_PLUGIN_DIR . 'assets/templates/preview.php';
	}
}
