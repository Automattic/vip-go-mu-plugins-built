<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Formatting;

use Symfony\Component\VarExporter\VarExporter;

/**
 * StringFormatter class.
 */
final class StringFormatter {
	/**
	 * Adds proper indentation to a string.
	 *
	 * @param string $str The string to indent.
	 * @param array  $options The options for the indentation.
	 *     @type bool   $skip_first_line      Whether to skip indenting the first line.
	 *     @type int    $indent_count         Number of indentation characters to use.
	 *     @type string $indent_char          Character to use for indentation.
	 * @return string Indented string.
	 */
	public static function indent_string( string $str, array $options = [] ): string {
		$skip_first_line = $options['skip_first_line'] ?? false;
		$indent_count = $options['indent_count'] ?? 1;
		$indent_char = $options['indent_char'] ?? "\t";

		$lines = explode( "\n", $str );
		$result = [];

		if ( $skip_first_line ) {
			if ( count( $lines ) <= 1 ) {
				return $str;
			}

			// Keep first line as is
			$result[] = array_shift( $lines );
		}

		// Add indentation to remaining lines
		$indent = str_repeat( $indent_char, $indent_count );
		foreach ( $lines as $line ) {
			$result[] = $indent . $line;
		}

		return implode( "\n", $result );
	}

	/**
	 * Export an array as code.
	 *
	 * @param array $array The array to export.
	 * @param int $additional_indents The number of additional indents to add. This can be useful
	 *                                when exported code is nested inside other code.
	 * @return string The exported code.
	 */
	public static function export_array_as_code( array $array, int $additional_indents = 0 ): string {
		$exported_array = VarExporter::export( $array );

		if ( $additional_indents > 0 ) {
			$exported_array = self::indent_string(
				$exported_array,
				[
					'indent_count' => $additional_indents,
					'indent_char' => "\t", 
					'skip_first_line' => true,
				]
			);
		}

		/**
		 * Replace 4 spaces indents with tabs
		 * This required because Symfony VarExporter exports PSR-2 compatible code
		 * which uses 4 spaces for indents and we use tabs in the codebase.
		 */
		$four_spaces = str_repeat( ' ', 4 );
		return preg_replace( 
			'/' . preg_quote( $four_spaces, '/' ) . '/',
			"\t",
			$exported_array
		);
	}

	/**
	 * Converts an array of strings into a valid PHP function name.
	 * 
	 * @param array<string> $parts Array of strings to convert.
	 * @return string A valid PHP function name.
	 */
	public static function normalize_function_name( array $parts ): string {
		// Filter out empty strings and trim whitespace
		$parts = array_filter( array_map( 'trim', $parts ) );
		
		// Join parts with underscore and convert to lowercase
		$name = strtolower( implode( '__', $parts ) );
		
		// Replace spaces with underscores
		$name = str_replace( ' ', '_', $name );
		
		// Replace any non-alphanumeric characters (except underscores) with empty string
		$name = preg_replace( '/[^a-z0-9_ ]/', '', $name );
		
		// Ensure the function name starts with a letter or underscore
		if ( preg_match( '/^[0-9]/', $name ) ) {
			$name = '_' . $name;
		}
		
		return $name;
	}
}
