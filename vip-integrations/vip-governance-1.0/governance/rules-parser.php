<?php
/**
 * The rules parser engine
 *
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

use WP_Error;

use Seld\JsonLint\JsonParser;
use Seld\JsonLint\ParsingException;

/**
 * Class for parsing and validating governance rules.
 */
class RulesParser {
	// Update this when the rules schema changes.
	public const TYPE_TO_RULES_MAP = [
		'role'     => 'roles',
		'postType' => 'postTypes',
	];
	// Keep this order this way, as it's used for determing the priority of rules in governance-utilities.
	public const RULE_TYPES         = [ 'postType', 'role', 'default' ];
	private const RULE_KEYS_GENERAL = [ 'allowedFeatures', 'allowedBlocks', 'blockSettings' ];

	/**
	 * Parses and validates governance rules.
	 *
	 * @param string $rules_content Contents of rules file.
	 *
	 * @return array|WP_Error
	 *
	 * @access private
	 */
	public static function parse( $rules_content ) {
		if ( empty( $rules_content ) ) {
			// Allow an empty file to be valid for no rules.
			return [];
		}

		// Parse JSON from rules file.
		$rules_parsed = self::parse_rules_from_json( $rules_content );

		if ( is_wp_error( $rules_parsed ) ) {
			return $rules_parsed;
		} elseif ( empty( $rules_parsed ) ) {
			// Allow an empty object to be valid for no rules.
			return [];
		}

		// Validate governance rule logic.
		$rule_validation_result = self::validate_rule_logic( $rules_parsed );

		if ( is_wp_error( $rule_validation_result ) ) {
			return $rule_validation_result;
		}

		return $rules_parsed['rules'];
	}

	/**
	 * Given a JSON string, return an array of structured rules, or a WP_Error if parsing fails.
	 *
	 * @param string $rules_content Contents of rules file.
	 *
	 * @return array|WP_Error
	 */
	private static function parse_rules_from_json( $rules_content ) {
		$rules_parsed = json_decode( $rules_content, true );

		if ( null === $rules_parsed && JSON_ERROR_NONE !== json_last_error() ) {
			// PHP's JSON parsing failed. Use JsonParser to get a more detailed error.
			$parser = new JsonParser();
			$result = $parser->lint( $rules_content, JsonParser::DETECT_KEY_CONFLICTS | JsonParser::PARSE_TO_ASSOC );

			if ( $result instanceof ParsingException ) {
				/* translators: %s: Technical data - JSON parsing error */
				$error_message = sprintf( __( 'There was an error parsing JSON: %s', 'vip-governance' ), $result->getMessage() );
				return new WP_Error( 'parsing-error-from-json', $error_message, $result->getDetails() );
			} else {
				// If the parser failed to return an error, return default PHP error message.

				/* translators: %s: Technical data - JSON parsing error */
				$error_message = sprintf( __( 'There was an error decoding JSON: %s', 'vip-governance' ), json_last_error_msg() );
				return new WP_Error( 'parsing-error-generic', $error_message );
			}
		}

		if ( empty( $rules_parsed ) ) {
			// If parsed rules contain an empty object, treat this as a valid form of no rules.
			return [];
		}

		return $rules_parsed;
	}


	/**
	 * Evaluate parsed rules for logic errors, like multiple default rules or missing required keys.
	 * Returns true if validation succeeds, or a WP_Error indicating a logic error.
	 *
	 * @param array $rules_parsed Parsed contents of a governance rules file.
	 *
	 * @return true|WP_Error
	 */
	private static function validate_rule_logic( $rules_parsed ) {
		if ( ! isset( $rules_parsed['version'] ) || WPCOMVIP__GOVERNANCE__RULES_SCHEMA_VERSION !== $rules_parsed['version'] ) {
			/* translators: %s: Latest schema version, e.g. 0.2.0 */
			$error_message = sprintf( __( 'Governance JSON should have a root-level "version" key set to "%s".', 'vip-governance' ), WPCOMVIP__GOVERNANCE__RULES_SCHEMA_VERSION );
			return new WP_Error( 'logic-missing-version', $error_message );
		} elseif ( ! isset( $rules_parsed['rules'] ) ) {
			// If parsed rules contain values but no 'rules' key, return an error.
			return new WP_Error( 'logic-missing-rules', __( 'Governance JSON should have a root-level "rules" key.', 'vip-governance' ) );
		} elseif ( ! is_array( $rules_parsed['rules'] ) ) {
			return new WP_Error( 'logic-non-array-rules', __( 'Governance JSON "rules" key should be an array.', 'vip-governance' ) );
		}

		$rules              = $rules_parsed['rules'];
		$default_rule_index = null;

		foreach ( $rules as $rule_index => $rule ) {
			$rule_type    = $rule['type'] ?? null;
			$rule_ordinal = self::format_number_with_ordinal( $rule_index + 1 );

			if ( null === $rule_type || ! in_array( $rule_type, self::RULE_TYPES ) ) {
				$rule_types = self::format_array_to_keys( self::RULE_TYPES );
				/* translators: 1: Ordinal number of rule, e.g. 1st 2: Comma-separated list of rule types */
				$error_message = sprintf( __( '%1$s rule should have a "type" key set to one of these values: %2$s.', 'vip-governance' ), $rule_ordinal, $rule_types );
				return new WP_Error( 'logic-incorrect-rule-type', $error_message );
			}

			if ( 'default' === $rule_type ) {
				if ( null === $default_rule_index ) {
					$verify_rule_result = self::verify_default_rule( $rule );
					$default_rule_index = $rule_index;
				} else {
					// There's already a default rule defined, bubble an error.

					/* translators: 1: Ordinal number of rule, e.g. 1st */
					$error_message      = sprintf( __( 'Only one default rule is allowed, but the %s rule already contains a default rule.', 'vip-governance' ), self::format_number_with_ordinal( $default_rule_index + 1 ) );
					$verify_rule_result = new WP_Error( 'logic-rule-default-multiple', $error_message );
				}
			} else {
				$verify_rule_result = self::verify_type_rule( $rule );
			}

			if ( is_wp_error( $verify_rule_result ) ) {
				// Add rule index to error message.
				/* translators: 1: Ordinal number of rule, e.g. 1st 2: Error message for failed rule */
				$error_message = sprintf( __( 'Error parsing %1$s rule: %2$s', 'vip-governance' ), $rule_ordinal, $verify_rule_result->get_error_message() );
				return new WP_Error( $verify_rule_result->get_error_code(), $error_message );
			}
		}

		return true;
	}

	/**
	 * Format the number with ordinal suffix, without the PHP number formatter. That doesn't work on all systems.
	 *
	 * Taken from https://stackoverflow.com/a/3110033.
	 *
	 * @param int $number Number to format.
	 * @return string Formatted number with ordinal suffix.
	 */
	private static function format_number_with_ordinal( $number ) {
		$ends = array( 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th' );
		if ( ( $number % 100 ) >= 11 && ( $number % 100 ) <= 13 ) {
			return $number . 'th';
		} else {
			return $number . $ends[ $number % 10 ];
		}
	}

	/**
	 * Returns true if the given 'default'-type rule is valid, or a WP_Error otherwise.
	 *
	 * @param array $rule Parsed rule.
	 *
	 * @return true|WP_Error
	 */
	private static function verify_default_rule( $rule ) {
		if ( count( $rule ) === 1 ) {
			$rule_keys = self::format_array_to_keys( self::RULE_KEYS_GENERAL );

			/* translators: %s: Comma-separate list of valid rule keys */
			$error_message = sprintf( __( 'This default rule is empty. Add additional keys (%s) to make it functional.', 'vip-governance' ), $rule_keys );
			return new WP_Error( 'logic-rule-empty', $error_message );
		}

		foreach ( self::TYPE_TO_RULES_MAP as $type => $types ) {
			if ( isset( $rule[ $types ] ) ) {
				/* translators: %s: Comma-separate list of valid rule keys */
				$error_message = sprintf( __( '"default"-type rule should not contain "%1$s" key. Default rules apply to all %2$s.', 'vip-governance' ), $types, $type );
				return new WP_Error( 'logic-rule-default-type', $error_message );
			}
		}

		return true;
	}

	/**
	 * Returns true if the given type rule is valid, or a WP_Error otherwise.
	 *
	 * @param array $rule Parsed rule.
	 *
	 * @return true|WP_Error
	 */
	private static function verify_type_rule( $rule ) {
		$type_to_be_checked = self::TYPE_TO_RULES_MAP[ $rule['type'] ];

		if ( ! isset( $rule[ $type_to_be_checked ] ) || ! is_array( $rule[ $type_to_be_checked ] ) || empty( $rule[ $type_to_be_checked ] ) ) {
			$rule_keys = self::format_array_to_keys( self::RULE_KEYS_GENERAL );

			/* translators: %s: Comma-separate list of valid rule keys */
			$error_message = sprintf( __( '"%1$s"-type rules require a "%2$s" key containing an array of applicable "%3$s".', 'vip-governance' ), $rule['type'], $type_to_be_checked, $type_to_be_checked );
			return new WP_Error( 'logic-rule-type-missing-valid-types', $error_message );
		}

		if ( count( $rule ) === 2 ) {
			$rule_keys = self::format_array_to_keys( self::RULE_KEYS_GENERAL );

			/* translators: %s: Comma-separate list of valid rule keys */
			$error_message = sprintf( __( 'This rule doesn\'t apply any settings to the given type. Add additional keys (%s) to make it functional.', 'vip-governance' ), $rule_keys );
			return new WP_Error( 'logic-rule-empty', $error_message );
		}

		return true;
	}

	/**
	 * Format an array into a quoted, comma-separated list of keys for display.
	 * e.g. [ 'default', 'role' ] => '"default", "role"'.
	 *
	 * @param array $input_array Parsed rule.
	 *
	 * @return string Comma-separated list of quoted keys.
	 */
	private static function format_array_to_keys( $input_array ) {
		return implode( ', ', array_map( function ( $item ) {
			return sprintf( '"%s"', $item );
		}, $input_array ) );
	}
}
