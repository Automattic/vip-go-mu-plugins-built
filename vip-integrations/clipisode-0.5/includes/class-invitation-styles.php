<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Invitation_Styles {

	/**
	 * The site owns typography and block styling. Tokens cover the runtime
	 * controls that have no WordPress block or theme.json element of their own.
	 */
	public static function tokens( int $theme_id ): array {
		$styles = wp_get_global_styles( [], [ 'transforms' => [ 'resolve-variables' ] ] );
		$tokens = [
			'background' => 'inherit',
			'text'       => 'inherit',
			'link'       => 'currentColor',
			'accent'     => 'currentColor',
			'border'     => 'currentColor',
			'radius'     => '0.5rem',
		];
		$paths = [
			'background' => [ 'color', 'background' ],
			'text'       => [ 'color', 'text' ],
			'link'       => [ 'elements', 'link', 'color', 'text' ],
			'accent'     => [ 'elements', 'button', 'color', 'background' ],
			'radius'     => [ 'elements', 'button', 'border', 'radius' ],
		];
		foreach ( $paths as $key => $path ) {
			$value = _wp_array_get( $styles, $path );
			if ( is_string( $value ) && $value !== '' ) {
				$tokens[ $key ] = $value;
			}
		}
		$button = wp_get_global_styles( [], [ 'block_name' => 'core/button', 'transforms' => [ 'resolve-variables' ] ] );
		foreach ( [ 'accent' => [ 'color', 'background' ], 'radius' => [ 'border', 'radius' ] ] as $key => $path ) {
			$value = _wp_array_get( $button, $path );
			if ( is_string( $value ) && $value !== '' ) {
				$tokens[ $key ] = $value;
			}
		}

		$custom = _wp_array_get( wp_get_global_settings(), [ 'custom', 'clipisode', 'invitation' ], [] );
		if ( is_array( $custom ) ) {
			$tokens = array_replace( $tokens, array_intersect_key( $custom, $tokens ) );
		}

		/**
		 * Customize a Clipisode invitation theme in both the guest flow and
		 * screen editor. $theme_id is the parent clipisode_invite post ID.
		 */
		return apply_filters( 'clipisode_invitation_style_tokens', $tokens, $theme_id );
	}

	public static function css_variables( int $theme_id ): string {
		$css = '';
		foreach ( self::tokens( $theme_id ) as $name => $value ) {
			$properties = [
				'background' => 'background-color',
				'text'       => 'color',
				'link'       => 'color',
				'accent'     => 'color',
				'border'     => 'color',
				'radius'     => 'border-radius',
			];
			if ( ! isset( $properties[ $name ] ) || ! is_string( $value ) ) {
				continue;
			}
			$property = $properties[ $name ];
			$safe = safecss_filter_attr( $property . ':' . $value );
			if ( preg_match( '/^' . preg_quote( $property, '/' ) . '\s*:\s*([^;]+);?$/', $safe, $match ) ) {
				$css .= '--clipisode-invitation-' . $name . ':' . $match[1] . ';';
			}
		}
		return ':root{' . $css . '}';
	}
}
