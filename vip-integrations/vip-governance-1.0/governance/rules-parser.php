<?php
/**
 * The rules parser engine
 *
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

use JsonException;
use Seld\JsonLint\JsonParser;
use Seld\JsonLint\ParsingException;
use stdClass;
use WP_Error;

defined( 'ABSPATH' ) || die();

/**
 * Class for parsing and validating governance rules.
 */
class RulesParser {
	private const ALLOWED_FEATURES = [ 'codeEditor', 'lockBlocks' ];
	private const BLOCK_NAME_REGEX = '/^(?:\*|[a-z][a-z0-9-]*\/(?:[a-z][a-z0-9-]*|\*))$/';

	// Update this when the rules schema changes.
	public const TYPE_TO_RULES_MAP = [
		'role'     => 'roles',
		'postType' => 'postTypes',
	];

	// Keep this order this way, as it's used for determining the priority of rules in governance-utilities.
	public const RULE_TYPES = [ 'postType', 'role', 'default' ];

	/**
	 * Parses and validates governance rules without returning non-fatal warnings.
	 *
	 * @param string $rules_content Contents of rules file.
	 *
	 * @return array|WP_Error
	 *
	 * @deprecated 1.0.17 Use RulesParser::parse_with_warnings() instead.
	 */
	public static function parse( string $rules_content ): array|WP_Error {
		_deprecated_function( __METHOD__, '1.0.17', __CLASS__ . '::parse_with_warnings()' );

		$result = self::parse_with_warnings( $rules_content );

		return is_wp_error( $result ) ? $result : $result['rules'];
	}

	/**
	 * Parse and normalize governance rules, including non-fatal warnings.
	 *
	 * @param string $rules_content Contents of rules file.
	 *
	 * @return array{rules: array, warnings: array}|WP_Error
	 */
	public static function parse_with_warnings( string $rules_content ): array|WP_Error {
		if ( '' === trim( $rules_content ) ) {
			// An empty file is an explicitly supported form of no rules.
			return self::create_parse_result();
		}

		$rules_parsed = self::parse_rules_from_json( $rules_content );
		if ( is_wp_error( $rules_parsed ) ) {
			return $rules_parsed;
		}

		if ( empty( $rules_parsed ) || ( $rules_parsed instanceof stdClass && [] === get_object_vars( $rules_parsed ) ) ) {
			// Retain the historical behavior for empty JSON values such as {}, [], false, and null.
			return self::create_parse_result();
		}

		if ( ! $rules_parsed instanceof stdClass ) {
			return new WP_Error( 'logic-invalid-root', __( 'Governance JSON should contain a root-level object.', 'vip-governance' ) );
		}

		return self::normalize_rules( $rules_parsed );
	}

	/**
	 * Validate JSON and decode it without discarding the distinction between JSON objects and arrays.
	 *
	 * @param string $rules_content Contents of rules file.
	 *
	 * @return mixed|WP_Error
	 */
	private static function parse_rules_from_json( string $rules_content ): mixed {
		try {
			return json_decode( $rules_content, false, 512, JSON_THROW_ON_ERROR );
		} catch ( JsonException $exception ) {
			// Native parsing failed. Use JsonParser to provide a more detailed error.
			$parser = new JsonParser();
			$result = $parser->lint( $rules_content, JsonParser::DETECT_KEY_CONFLICTS | JsonParser::VALIDATE_UTF8_ENCODING );

			if ( $result instanceof ParsingException ) {
				/* translators: %s: Technical data - JSON parsing error. */
				$error_message = sprintf( __( 'There was an error parsing JSON: %s', 'vip-governance' ), $result->getMessage() );
				return new WP_Error( 'parsing-error-from-json', $error_message, $result->getDetails() );
			}

			/* translators: %s: Technical data - JSON decoding error. */
			$error_message = sprintf( __( 'There was an error decoding JSON: %s', 'vip-governance' ), $exception->getMessage() );
			return new WP_Error( 'parsing-error-generic', $error_message );
		}
	}

	/**
	 * Normalize rules while retaining errors for unrecoverable root-level problems.
	 *
	 * @param stdClass $rules_parsed Parsed contents of a governance rules file.
	 *
	 * @return array|WP_Error
	 */
	private static function normalize_rules( stdClass $rules_parsed ): array|WP_Error {
		if ( ! property_exists( $rules_parsed, 'version' ) || WPCOMVIP__GOVERNANCE__RULES_SCHEMA_VERSION !== $rules_parsed->version ) {
			/* translators: %s: Latest schema version, e.g. 1.0.0. */
			$error_message = sprintf( __( 'Governance JSON should have a root-level "version" key set to "%s".', 'vip-governance' ), WPCOMVIP__GOVERNANCE__RULES_SCHEMA_VERSION );
			return new WP_Error( 'logic-missing-version', $error_message );
		}

		if ( ! property_exists( $rules_parsed, 'rules' ) ) {
			return new WP_Error( 'logic-missing-rules', __( 'Governance JSON should have a root-level "rules" key.', 'vip-governance' ) );
		}

		if ( ! is_array( $rules_parsed->rules ) ) {
			return new WP_Error( 'logic-non-array-rules', __( 'Governance JSON "rules" key should be an array.', 'vip-governance' ) );
		}

		$warnings           = [];
		$root_properties    = get_object_vars( $rules_parsed );
		$unknown_root_keys  = array_diff( array_keys( $root_properties ), [ '$schema', 'version', 'rules' ] );
		$normalized_rules   = [];
		$default_rule_index = null;

		if ( array_key_exists( '$schema', $root_properties ) && ! is_string( $root_properties['$schema'] ) ) {
			$warnings[] = __( 'Removed invalid root-level "$schema" metadata.', 'vip-governance' );
		}

		foreach ( $unknown_root_keys as $unknown_root_key ) {
			/* translators: %s: Unsupported root-level property name. */
			$warnings[] = sprintf( __( 'Removed unsupported root-level property "%s".', 'vip-governance' ), $unknown_root_key );
		}

		foreach ( $rules_parsed->rules as $rule_index => $rule ) {
			$rule_ordinal = self::format_number_with_ordinal( $rule_index + 1 );

			if ( ! $rule instanceof stdClass ) {
				/* translators: %s: Ordinal number of a rule, e.g. 3rd. */
				$warnings[] = sprintf( __( '%s rule: dropped because it is not an object.', 'vip-governance' ), $rule_ordinal );
				continue;
			}

			$rule_type = $rule->type ?? null;
			if ( ! is_string( $rule_type ) || ! in_array( $rule_type, self::RULE_TYPES, true ) ) {
				/* translators: %s: Ordinal number of a rule, e.g. 3rd. */
				$warnings[] = sprintf( __( '%s rule: dropped because it has no valid type.', 'vip-governance' ), $rule_ordinal );
				continue;
			}

			if ( 'default' === $rule_type ) {
				if ( null !== $default_rule_index ) {
					/* translators: %s: Ordinal number of the first default rule, e.g. 1st. */
					$error_message = sprintf( __( 'Only one default rule is allowed, but the %s rule already contains a default rule.', 'vip-governance' ), self::format_number_with_ordinal( $default_rule_index + 1 ) );
					return new WP_Error( 'logic-rule-default-multiple', $error_message );
				}

				$default_rule_index = $rule_index;
			}

			$normalized_rule = self::normalize_rule( $rule, $rule_type, $rule_ordinal, $warnings );
			if ( null === $normalized_rule ) {
				continue;
			}

			$normalized_rules[] = $normalized_rule;
		}

		return self::create_parse_result( $normalized_rules, $warnings );
	}

	/**
	 * Normalize one rule, or drop it when it cannot have any effect.
	 *
	 * @param stdClass $rule Parsed rule.
	 * @param string   $rule_type Valid rule type.
	 * @param string   $rule_ordinal Ordinal position of the rule.
	 * @param array    $warnings Non-fatal warnings collected while parsing.
	 *
	 * @return array|null
	 */
	private static function normalize_rule( stdClass $rule, string $rule_type, string $rule_ordinal, array &$warnings ): ?array {
		$rule_properties = get_object_vars( $rule );
		$normalized      = [ 'type' => $rule_type ];
		$allowed_keys    = [ 'type', 'allowedBlocks', 'allowedFeatures', 'blockSettings' ];

		if ( 'default' !== $rule_type ) {
			$applicability_key    = self::TYPE_TO_RULES_MAP[ $rule_type ];
			$applicability_values = null;
			$allowed_keys[]       = $applicability_key;
			if ( array_key_exists( $applicability_key, $rule_properties ) ) {
				$list_changes         = [];
				$applicability_values = self::normalize_string_list( $rule_properties[ $applicability_key ], null, $list_changes );
				self::add_string_list_warnings( $rule_ordinal, $applicability_key, $list_changes, $warnings );
			}
			if ( empty( $applicability_values ) ) {
				/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Rule applicability property, either roles or postTypes. */
				$warnings[] = sprintf( __( '%1$s rule: dropped because it has no valid %2$s.', 'vip-governance' ), $rule_ordinal, $applicability_key );
				return null;
			}
			$normalized[ $applicability_key ] = $applicability_values;
		} else {
			foreach ( self::TYPE_TO_RULES_MAP as $applicability_key ) {
				if ( array_key_exists( $applicability_key, $rule_properties ) ) {
					/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Inapplicable property name. */
					$warnings[] = sprintf( __( '%1$s rule: removed "%2$s" because default rules apply to everyone.', 'vip-governance' ), $rule_ordinal, $applicability_key );
				}
				$allowed_keys[] = $applicability_key;
			}
		}

		foreach ( array_diff( array_keys( $rule_properties ), $allowed_keys ) as $unknown_key ) {
			/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Unsupported property name. */
			$warnings[] = sprintf( __( '%1$s rule: removed unsupported property "%2$s".', 'vip-governance' ), $rule_ordinal, $unknown_key );
		}

		if ( array_key_exists( 'allowedBlocks', $rule_properties ) ) {
			$list_changes   = [];
			$allowed_blocks = self::normalize_string_list( $rule_properties['allowedBlocks'], null, $list_changes );
			self::add_string_list_warnings( $rule_ordinal, 'allowedBlocks', $list_changes, $warnings );
			if ( null !== $allowed_blocks ) {
				$normalized['allowedBlocks'] = $allowed_blocks;
			}
		}

		if ( array_key_exists( 'allowedFeatures', $rule_properties ) ) {
			$list_changes     = [];
			$allowed_features = self::normalize_string_list( $rule_properties['allowedFeatures'], self::ALLOWED_FEATURES, $list_changes );
			self::add_string_list_warnings( $rule_ordinal, 'allowedFeatures', $list_changes, $warnings );
			if ( null !== $allowed_features ) {
				$normalized['allowedFeatures'] = $allowed_features;
			}
		}

		if ( array_key_exists( 'blockSettings', $rule_properties ) ) {
			if ( $rule_properties['blockSettings'] instanceof stdClass ) {
				$block_settings = self::normalize_block_settings( $rule_properties['blockSettings'], true, $rule_ordinal, $warnings );
				if ( [] !== get_object_vars( $block_settings ) ) {
					$normalized['blockSettings'] = self::convert_objects_to_arrays( $block_settings );
				}
			} else {
				/* translators: %s: Ordinal number of a rule, e.g. 3rd. */
				$warnings[] = sprintf( __( '%s rule: removed invalid blockSettings.', 'vip-governance' ), $rule_ordinal );
			}
		}

		$required_key_count = 'default' === $rule_type ? 1 : 2;
		if ( count( $normalized ) <= $required_key_count ) {
			/* translators: %s: Ordinal number of a rule, e.g. 3rd. */
			$warnings[] = sprintf( __( '%s rule: dropped because it has no usable governance settings.', 'vip-governance' ), $rule_ordinal );
			return null;
		}

		return $normalized;
	}

	/**
	 * Normalize block settings and remove unusable governance-specific values.
	 *
	 * @param stdClass $block_settings Block settings object.
	 * @param bool     $top_level Whether these settings are keyed only by block name.
	 * @param string   $rule_ordinal Ordinal position of the rule.
	 * @param array    $warnings Non-fatal warnings collected while parsing.
	 * @param string   $path Dot-separated block settings path.
	 *
	 * @return stdClass
	 */
	private static function normalize_block_settings( stdClass $block_settings, bool $top_level, string $rule_ordinal, array &$warnings, string $path = 'blockSettings' ): stdClass {
		$normalized = new stdClass();

		foreach ( get_object_vars( $block_settings ) as $property => $value ) {
			$is_block_name = 1 === preg_match( self::BLOCK_NAME_REGEX, $property );

			if ( $top_level && ! $is_block_name ) {
				/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Invalid block settings path. */
				$warnings[] = sprintf( __( '%1$s rule: removed invalid blockSettings entry "%2$s".', 'vip-governance' ), $rule_ordinal, $path . '.' . $property );
				continue;
			}

			if ( 'allowedBlocks' === $property ) {
				$list_changes   = [];
				$allowed_blocks = self::normalize_string_list( $value, null, $list_changes );
				self::add_string_list_warnings( $rule_ordinal, $path . '.allowedBlocks', $list_changes, $warnings );
				if ( null !== $allowed_blocks ) {
					$normalized->{$property} = $allowed_blocks;
				}
				continue;
			}

			if ( $is_block_name ) {
				if ( ! $value instanceof stdClass ) {
					/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Invalid block settings path. */
					$warnings[] = sprintf( __( '%1$s rule: removed invalid blockSettings entry "%2$s".', 'vip-governance' ), $rule_ordinal, $path . '.' . $property );
					continue;
				}

				$nested_settings = self::normalize_block_settings( $value, false, $rule_ordinal, $warnings, $path . '.' . $property );
				if ( [] !== get_object_vars( $nested_settings ) ) {
					$normalized->{$property} = $nested_settings;
				}
				continue;
			}

			// Other nested properties are theme.json settings and intentionally unrestricted.
			$normalized->{$property} = $value;
		}

		return $normalized;
	}

	/**
	 * Normalize a scalar or array into a unique list of allowed strings.
	 *
	 * @param mixed      $value Values to normalize.
	 * @param array|null $allowed_values Optional allowlist.
	 * @param array      $changes Details of corrections made while normalizing.
	 *
	 * @return array|null Null when the input has no safely inferable list form.
	 */
	private static function normalize_string_list( mixed $value, ?array $allowed_values = null, array &$changes = [] ): ?array {
		$changes = [
			'converted'   => false,
			'invalidType' => false,
			'invalid'     => 0,
			'unsupported' => 0,
			'duplicates'  => 0,
		];

		if ( is_string( $value ) ) {
			$value                = [ $value ];
			$changes['converted'] = true;
		} elseif ( ! is_array( $value ) ) {
			$changes['invalidType'] = true;
			return null;
		}

		$was_empty          = [] === $value;
		$original_count     = count( $value );
		$value              = array_filter( $value, 'is_string' );
		$changes['invalid'] = $original_count - count( $value );
		if ( null !== $allowed_values ) {
			$string_count           = count( $value );
			$value                  = array_filter( $value, static fn ( string $item ): bool => in_array( $item, $allowed_values, true ) );
			$changes['unsupported'] = $string_count - count( $value );
		}
		if ( empty( $value ) && ! $was_empty ) {
			return null;
		}

		$unique_values         = array_unique( $value, SORT_STRING );
		$changes['duplicates'] = count( $value ) - count( $unique_values );

		return array_values( $unique_values );
	}

	/**
	 * Add warnings for corrections made to a string-list property.
	 *
	 * @param string $rule_ordinal Ordinal position of the rule.
	 * @param string $property Property path being normalized.
	 * @param array  $changes Details of corrections made while normalizing.
	 * @param array  $warnings Non-fatal warnings collected while parsing.
	 *
	 * @return void
	 */
	private static function add_string_list_warnings( string $rule_ordinal, string $property, array $changes, array &$warnings ): void {
		if ( $changes['converted'] ) {
			/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Property path. */
			$warnings[] = sprintf( __( '%1$s rule: converted %2$s to an array.', 'vip-governance' ), $rule_ordinal, $property );
		}

		if ( $changes['invalidType'] ) {
			/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Property path. */
			$warnings[] = sprintf( __( '%1$s rule: removed invalid %2$s.', 'vip-governance' ), $rule_ordinal, $property );
		}

		if ( $changes['invalid'] > 0 ) {
			$warnings[] = sprintf(
				/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Number of values removed. 3: Property path. */
				_n( '%1$s rule: removed %2$d invalid %3$s value.', '%1$s rule: removed %2$d invalid %3$s values.', $changes['invalid'], 'vip-governance' ),
				$rule_ordinal,
				$changes['invalid'],
				$property
			);
		}

		if ( $changes['unsupported'] > 0 ) {
			$warnings[] = sprintf(
				/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Number of values removed. 3: Property path. */
				_n( '%1$s rule: removed %2$d unsupported %3$s value.', '%1$s rule: removed %2$d unsupported %3$s values.', $changes['unsupported'], 'vip-governance' ),
				$rule_ordinal,
				$changes['unsupported'],
				$property
			);
		}

		if ( $changes['duplicates'] > 0 ) {
			$warnings[] = sprintf(
				/* translators: 1: Ordinal number of a rule, e.g. 3rd. 2: Number of values removed. 3: Property path. */
				_n( '%1$s rule: removed %2$d duplicate %3$s value.', '%1$s rule: removed %2$d duplicate %3$s values.', $changes['duplicates'], 'vip-governance' ),
				$rule_ordinal,
				$changes['duplicates'],
				$property
			);
		}
	}

	/**
	 * Create a successful parser result.
	 *
	 * @param array $rules Normalized governance rules.
	 * @param array $warnings Non-fatal parser warnings.
	 *
	 * @return array{rules: array, warnings: array}
	 */
	private static function create_parse_result( array $rules = [], array $warnings = [] ): array {
		return [
			'rules'    => $rules,
			'warnings' => $warnings,
		];
	}

	/**
	 * Recursively convert native decoded objects to the associative arrays expected by consumers.
	 *
	 * @param mixed $value Native decoded JSON value.
	 *
	 * @return mixed
	 */
	private static function convert_objects_to_arrays( mixed $value ): mixed {
		if ( $value instanceof stdClass ) {
			$value = get_object_vars( $value );
		}

		if ( ! is_array( $value ) ) {
			return $value;
		}

		return array_map( [ __CLASS__, 'convert_objects_to_arrays' ], $value );
	}

	/**
	 * Format a number with its ordinal suffix.
	 *
	 * @param int $number Number to format.
	 *
	 * @return string
	 */
	private static function format_number_with_ordinal( int $number ): string {
		$ends = [ 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th' ];
		if ( ( $number % 100 ) >= 11 && ( $number % 100 ) <= 13 ) {
			return $number . 'th';
		}

		return $number . $ends[ $number % 10 ];
	}
}
