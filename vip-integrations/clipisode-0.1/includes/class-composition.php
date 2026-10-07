<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Composition {

	private const FPS = 30;

	public static function sanitize( mixed $value ): array|WP_Error {
		if ( ! is_array( $value ) || ! isset( $value['settings'], $value['clips'] ) || ! is_array( $value['settings'] ) || ! is_array( $value['clips'] ) || ! array_is_list( $value['clips'] ) ) {
			return self::invalid( 'Composition settings and clips are required.' );
		}
		$theme = self::theme( $value['settings']['themeId'] ?? null );
		return is_wp_error( $theme ) ? $theme : self::sanitize_theme( $value, $theme );
	}

	public static function themes(): array|WP_Error {
		$path = CLIPISODE_PLUGIN_DIR . 'assets/composition-themes.json';
		if ( ! is_readable( $path ) ) {
			return self::invalid( 'The composition theme schema is unavailable.' );
		}
		$schema = json_decode( file_get_contents( $path ), true );
		if ( ! is_array( $schema ) || ! isset( $schema['themes'] ) || ! is_array( $schema['themes'] ) ) {
			return self::invalid( 'The composition theme schema is invalid.' );
		}
		return $schema['themes'];
	}

	private static function theme( mixed $id ): array|WP_Error {
		$themes = self::themes();
		if ( is_wp_error( $themes ) ) {
			return $themes;
		}
		foreach ( $themes as $theme ) {
			if ( $theme['id'] === $id ) {
				return $theme;
			}
		}
		return self::invalid( 'Unknown composition theme.' );
	}

	private static function sanitize_theme( array $value, array $theme ): array|WP_Error {
		$settings = $value['settings'];
		if ( ! isset( $settings['format'] ) || ! in_array( $settings['format'], [ 'portrait', 'square', 'landscape' ], true ) ) {
			return self::invalid( 'Invalid composition format.' );
		}
		$clips = [];
		$ids = [];
		$tag_counts = [];
		$tag_definitions = array_column( $theme['tags'], null, 'id' );
		foreach ( $value['clips'] as $clip ) {
			if ( ! is_array( $clip ) || ! isset( $clip['id'] ) || ! is_string( $clip['id'] ) || ! preg_match( '/^[a-zA-Z0-9_-]+$/', $clip['id'] ) || isset( $ids[ $clip['id'] ] ) ) {
				return self::invalid( 'Every clip must have a unique ID.' );
			}
			$ids[ $clip['id'] ] = true;
			if ( array_diff( array_keys( $clip ), [ 'id', 'mediaId', 'role', 'name', 'url', 'duration', 'trimStart', 'trimEnd', 'included', 'tags', 'values', 'slotId' ] ) ) {
				return self::invalid( 'Unknown clip property.' );
			}
			if ( array_key_exists( 'slotId', $clip ) && ! is_string( $clip['slotId'] ) ) {
				return self::invalid( 'Invalid sequence spot.' );
			}
			if ( ! isset( $clip['mediaId'] ) || ! is_int( $clip['mediaId'] ) || $clip['mediaId'] <= 0 || ! Clipisode_Media::get_video_url( $clip['mediaId'] ) ) {
				return self::invalid( 'Every clip must reference an available video.' );
			}
			if ( ! isset( $clip['role'] ) || ! in_array( $clip['role'], [ 'intro', 'reply' ], true ) || ! isset( $clip['name'] ) || ! is_string( $clip['name'] ) || ! isset( $clip['included'] ) || ! is_bool( $clip['included'] ) ) {
				return self::invalid( 'Invalid clip role, name, or inclusion setting.' );
			}
			foreach ( [ 'duration', 'trimStart', 'trimEnd' ] as $key ) {
				if ( ! isset( $clip[ $key ] ) || ! self::is_number( $clip[ $key ] ) ) {
					return self::invalid( 'Clip durations and trims must be numbers.' );
				}
			}
			if ( $clip['duration'] <= 0 || $clip['trimStart'] < 0 || $clip['trimEnd'] <= $clip['trimStart'] || $clip['trimEnd'] > $clip['duration'] ) {
				return self::invalid( 'Clip trims must select a positive range within the source duration.' );
			}
			if ( round( $clip['trimEnd'] * self::FPS ) <= round( $clip['trimStart'] * self::FPS ) ) {
				return self::invalid( 'Clip trims must include at least one frame.' );
			}
			$tags = array_key_exists( 'tags', $clip ) ? $clip['tags'] : [];
			if ( ! self::string_list( $tags ) ) {
				return self::invalid( 'Clip tags must be a list of unique strings.' );
			}
			$exclusive = [];
			foreach ( $tags as $tag ) {
				if ( ! isset( $tag_definitions[ $tag ] ) ) {
					return self::invalid( "Unknown clip tag: $tag." );
				}
				$definition = $tag_definitions[ $tag ];
				if ( ! empty( $definition['roles'] ) && ! in_array( $clip['role'], $definition['roles'], true ) ) {
					return self::invalid( "The tag $tag is not available for this clip role." );
				}
				if ( isset( $definition['exclusiveGroup'] ) ) {
					if ( isset( $exclusive[ $definition['exclusiveGroup'] ] ) ) {
						return self::invalid( 'This clip has mutually exclusive tags.' );
					}
					$exclusive[ $definition['exclusiveGroup'] ] = true;
				}
				$tag_counts[ $tag ] = ( $tag_counts[ $tag ] ?? 0 ) + 1;
				if ( isset( $definition['maxClips'] ) && $tag_counts[ $tag ] > $definition['maxClips'] ) {
					return self::invalid( "Too many clips use the tag $tag." );
				}
			}
			$values = array_key_exists( 'values', $clip ) ? $clip['values'] : [];
			if ( $values instanceof stdClass ) {
				$values = (array) $values;
			}
			if ( ! is_array( $values ) || ( $values && array_is_list( $values ) ) ) {
				return self::invalid( 'Clip values must be a field map.' );
			}
			$clips[] = [
				'id' => $clip['id'], 'mediaId' => $clip['mediaId'], 'role' => $clip['role'],
				'name' => sanitize_text_field( $clip['name'] ), 'duration' => (float) $clip['duration'],
				'trimStart' => (float) $clip['trimStart'], 'trimEnd' => (float) $clip['trimEnd'],
				'included' => $clip['included'], 'tags' => $tags, 'values' => $values,
			];
			if ( isset( $clip['slotId'] ) ) {
				$clips[ count( $clips ) - 1 ]['slotId'] = $clip['slotId'];
			}
		}
		$slots = $theme['timeline']['mediaSlots'];
		$slot_ids = array_column( $slots, null, 'id' );
		$slot_counts = [];
		$slot_included_counts = [];
		$slot_modes = [];
		foreach ( $clips as $clip ) {
			if ( isset( $clip['slotId'] ) && ! isset( $slot_ids[ $clip['slotId'] ] ) ) {
				return self::invalid( 'Unavailable sequence spot.' );
			}
			$slot = null;
			foreach ( $slots as $candidate ) {
				if ( isset( $candidate['tag'] ) && in_array( $candidate['tag'], $clip['tags'], true ) ) {
					$slot = $candidate;
					break;
				}
			}
			if ( ! $slot && isset( $clip['slotId'] ) ) {
				$slot = $slot_ids[ $clip['slotId'] ];
			}
			if ( ! $slot ) {
				foreach ( $slots as $candidate ) {
					if ( 'sequence' === $candidate['mode'] ) {
						$slot = $candidate;
						break;
					}
				}
			}
			if ( ! $slot ) {
				return self::invalid( 'The theme has no sequence spot for this clip.' );
			}
			if ( isset( $slot['roles'] ) && ! in_array( $clip['role'], $slot['roles'], true ) ) {
				return self::invalid( "This clip role is unavailable in {$slot['label']}." );
			}
			$slot_modes[ $clip['id'] ] = $slot['mode'];
			$slot_counts[ $slot['id'] ] = ( $slot_counts[ $slot['id'] ] ?? 0 ) + 1;
			if ( $clip['included'] ) {
				$slot_included_counts[ $slot['id'] ] = ( $slot_included_counts[ $slot['id'] ] ?? 0 ) + 1;
			}
		}
		foreach ( $slots as $slot ) {
			$count = $slot_counts[ $slot['id'] ] ?? 0;
			if ( isset( $slot['maxClips'] ) && $count > $slot['maxClips'] ) {
				return self::invalid( "Too many clips are assigned to {$slot['label']}." );
			}
			if ( isset( $slot['minClips'] ) && ( $slot_included_counts[ $slot['id'] ] ?? 0 ) < $slot['minClips'] ) {
				return self::invalid( "{$slot['label']} needs more included clips." );
			}
		}

		$fields = self::fields( $theme, 'composition' );
		$values = $settings;
		unset( $values['themeId'], $values['format'] );
		$clean = self::sanitize_fields( $values, $fields, 'composition', $settings, $clips );
		if ( is_wp_error( $clean ) ) {
			return $clean;
		}
		$clean = array_merge( [ 'themeId' => $theme['id'], 'format' => $settings['format'] ], $clean );
		$effective_settings = array_replace( self::defaults( $fields ), $clean );
		$clip_fields = self::fields( $theme, 'clip' );
		foreach ( $clips as &$clip ) {
			$values = self::sanitize_fields( $clip['values'], $clip_fields, 'clip', $effective_settings, $clips, $clip );
			if ( is_wp_error( $values ) ) {
				return $values;
			}
			$clip['values'] = (object) $values;
		}
		unset( $clip );

		$has_segment = false;
		foreach ( [ 'title', 'ending' ] as $kind ) {
			$card = $theme['timeline'][ $kind ] ?? null;
			if ( $card && ! empty( $effective_settings[ $card['enabledField'] ] ) ) {
				$duration = $effective_settings[ $card['durationField'] ] ?? null;
				if ( ! self::is_number( $duration ) || round( $duration * self::FPS ) < 1 ) {
					return self::invalid( "The $kind card must include at least one frame." );
				}
				$has_segment = true;
			}
		}
		foreach ( $clips as $clip ) {
			$has_segment = $has_segment || ( $clip['included'] && 'sequence' === $slot_modes[ $clip['id'] ] );
		}
		if ( ! $has_segment ) {
			return self::invalid( 'The composition must include a video or a title or ending card.' );
		}
		return [ 'settings' => $clean, 'clips' => $clips ];
	}

	private static function fields( array $theme, string $scope ): array {
		$fields = [];
		foreach ( $theme['groups'] as $group ) {
			if ( $group['scope'] !== $scope ) {
				continue;
			}
			foreach ( $group['fields'] as $field ) {
				$fields[ $field['id'] ] = [ 'field' => $field, 'appliesTo' => $group['appliesTo'] ?? [] ];
			}
		}
		return $fields;
	}

	private static function defaults( array $fields ): array {
		$result = [];
		foreach ( $fields as $id => $definition ) {
			$result[ $id ] = $definition['field']['default'];
		}
		return $result;
	}

	private static function sanitize_fields( array $values, array $fields, string $scope, array $settings, array $clips, ?array $clip = null ): array|WP_Error {
		foreach ( $values as $id => $value ) {
			if ( ! isset( $fields[ $id ] ) ) {
				return self::invalid( "Unknown $scope field: $id." );
			}
		}
		$clean = [];
		foreach ( $values as $id => $value ) {
			$validated = self::sanitize_field( $value, $fields[ $id ]['field'], $clips );
			if ( is_wp_error( $validated ) ) {
				return $validated;
			}
			$clean[ $id ] = $validated;
		}
		$effective = array_replace( self::defaults( $fields ), $clean );
		$composition_values = 'composition' === $scope ? array_replace( $settings, $effective ) : $settings;
		foreach ( $fields as $id => $definition ) {
			$field = $definition['field'];
			if ( array_key_exists( $id, $clean ) || ! empty( $field['optional'] ) || ( $clip && ! self::matches( $clip, $definition['appliesTo'] ) ) ) {
				continue;
			}
			$when = $field['when'] ?? null;
			if ( $when ) {
				$when_scope = $when['scope'] ?? $scope;
				$context = 'composition' === $when_scope ? $composition_values : ( $clip ? $effective : [] );
				$actual = $context[ $when['field'] ] ?? null;
				$expected = $when['equals'];
				$equal = self::is_number( $actual ) && self::is_number( $expected ) ? (float) $actual === (float) $expected : $actual === $expected;
				if ( ! $equal ) {
					continue;
				}
			}
			return self::invalid( "Missing required $scope field: $id." );
		}
		return $clean;
	}

	private static function sanitize_field( mixed $value, array $field, array $clips ): mixed {
		$id = $field['id'];
		if ( null === $value && ! empty( $field['optional'] ) ) {
			return null;
		}
		switch ( $field['type'] ) {
			case 'text':
			case 'textarea':
				if ( is_string( $value ) ) {
					return 'textarea' === $field['type'] ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );
				}
				break;
			case 'toggle':
				if ( is_bool( $value ) ) {
					return $value;
				}
				break;
			case 'number':
			case 'range':
				if ( ! self::is_number( $value ) || ( isset( $field['min'] ) && $value < $field['min'] ) || ( isset( $field['max'] ) && $value > $field['max'] ) ) {
					break;
				}
				if ( isset( $field['step'] ) ) {
					$steps = ( $value - ( $field['min'] ?? 0 ) ) / $field['step'];
					if ( abs( $steps - round( $steps ) ) > 0.00000001 ) {
						break;
					}
				}
				return $value;
			case 'color':
				if ( is_string( $value ) && preg_match( '/^#[a-fA-F0-9]{6}$/', $value ) ) {
					return strtolower( $value );
				}
				break;
			case 'image':
				if ( ! is_string( $value ) ) {
					break;
				}
				if ( '' === $value ) {
					return '';
				}
				if ( ! in_array( strtolower( (string) wp_parse_url( $value, PHP_URL_SCHEME ) ), [ 'http', 'https' ], true ) ) {
					break;
				}
				$url = esc_url_raw( $value, [ 'http', 'https' ] );
				if ( $url && wp_parse_url( $url, PHP_URL_HOST ) ) {
					return $url;
				}
				break;
			case 'select':
			case 'clip':
			case 'multiselect':
				$choices = array_column( $field['options'] ?? [], 'value' );
				if ( 'clip' === $field['type'] || isset( $field['source'] ) ) {
					$choices = array_column( array_filter( $clips, fn( $clip ) => $clip['included'] && self::matches( $clip, $field['source']['filter'] ?? [] ) ), 'id' );
				}
				if ( 'multiselect' === $field['type'] ) {
					if ( self::string_list( $value ) && ! array_diff( $value, $choices ) ) {
						return $value;
					}
				} elseif ( is_string( $value ) && in_array( $value, $choices, true ) ) {
					return $value;
				}
				break;
		}
		return self::invalid( "Invalid value for field: $id." );
	}

	private static function matches( array $clip, array $filter ): bool {
		return ( empty( $filter['roles'] ) || in_array( $clip['role'], $filter['roles'], true ) )
			&& ( empty( $filter['tags'] ) || (bool) array_intersect( $clip['tags'], $filter['tags'] ) );
	}

	public static function resolve( string $json ): array|WP_Error {
		$composition = json_decode( $json, true );
		if ( ! is_array( $composition ) || ! isset( $composition['settings'], $composition['clips'] ) || ! is_array( $composition['settings'] ) || ! is_array( $composition['clips'] ) ) {
			return self::invalid( 'The saved composition is invalid.' );
		}
		$theme = self::theme( $composition['settings']['themeId'] ?? null );
		if ( is_wp_error( $theme ) ) {
			return $theme;
		}
		$fields = self::fields( $theme, 'composition' );
		$composition['settings'] = array_intersect_key( $composition['settings'], array_merge( [ 'themeId' => true, 'format' => true ], $fields ) );
		$composition['settings'] = self::optional_defaults( $composition['settings'], $fields );
		$clip_fields = self::fields( $theme, 'clip' );
		foreach ( $composition['clips'] as &$clip ) {
			$url = Clipisode_Media::get_video_url( (int) $clip['mediaId'] );
			if ( ! $url ) {
				return self::invalid( 'A source video in this composition is no longer available.' );
			}
			$clip['url'] = $url;
			$clip['tags'] = $clip['tags'] ?? [];
			$values = array_intersect_key( $clip['values'] ?? [], $clip_fields );
			$clip['values'] = (object) self::optional_defaults( $values, $clip_fields );
		}
		unset( $clip );
		return $composition;
	}

	private static function optional_defaults( array $values, array $fields ): array {
		foreach ( $fields as $id => $definition ) {
			if ( ! array_key_exists( $id, $values ) && ! empty( $definition['field']['optional'] ) ) {
				$values[ $id ] = $definition['field']['default'];
			}
		}
		return $values;
	}

	private static function string_list( mixed $value ): bool {
		return is_array( $value ) && array_is_list( $value ) && count( array_filter( $value, 'is_string' ) ) === count( $value ) && count( array_unique( $value ) ) === count( $value );
	}

	private static function is_number( mixed $value ): bool {
		return ( is_int( $value ) || is_float( $value ) ) && is_finite( (float) $value );
	}

	private static function invalid( string $message ): WP_Error {
		return new WP_Error( 'invalid_composition', $message );
	}
}
