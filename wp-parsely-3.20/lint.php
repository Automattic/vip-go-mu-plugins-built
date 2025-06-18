<?php
/**
 * Small linter that can detect and fix some code style violations
 *
 * Usage:
 *  php lint.php // Show errors.
 *  php lint.php --fix // Auto-fix errors where supported.
 *
 * @since 3.18.0
 */

// Configuration.
$config = array(
	new Lint_Rule(
		'Two or more consecutive empty lines found',
		'/(\r?\n){3,}/',
		'/\.(php|js|css|html|scss|yml|md|ts|tsx|sh|json)$/',
		"\n\n"
	),
	new Lint_Rule(
		'One or more empty lines between closing brackets found',
		'/(\})\n{2,}(\})/',
		'/\.(php|js|css|html|scss|yml|md|ts|tsx|sh|json)$/',
		"$1\n$2"
	),
);

// Run the rules and display any errors.
foreach ( $config as $rule ) {
	$errors = $rule->run( in_array( '--fix', $argv ) );

	if ( '' !== $errors ) {
		$exit_code = 1;
		echo $errors;
	}
}

exit( $exit_code ?? 0 );

/**
 * A class representing a linting rule.
 *
 * @since 3.18.0
 */
class Lint_Rule {
	/**
	 * @var string Error message to display when this linting rule is violated.
	 */
	private $error_message;

	/**
	 * @var string Regex pattern used for rule violation detection.
	 */
	private $error_pattern;

	/**
	 * @var string Regex pattern used to specify the files to search in.
	 */
	private $include_files;

	/**
	 * @var string|null Optional regex pattern used to auto-fix the violation.
	 */
	private $fix_pattern;

	/**
	 * @var array<string> Directories to exclude from search.
	 */
	private $exclude_dirs;

	/**
	 * @var array<string> Array of errors found when running the rule.
	 */
	private $errors = array();

	/**
	 * Constructor.
	 *
	 * @since 3.18.0
	 *
	 * @param string        $error_message The error message to display.
	 * @param string        $error_pattern The regex matching the rule violation.
	 * @param string        $include_files The regex matching the files to search in.
	 * @param string|null   $fix_pattern   The regex to fix any violations (optional).
	 * @param array<string> $exclude_dirs  The directories to exclude from search.
	 */
	public function __construct(
		string $error_message,
		string $error_pattern,
		string $include_files,
		string $fix_pattern = null,
		array $exclude_dirs = array( 'artifacts', 'build', 'vendor', 'node_modules' )
	) {
		$this->error_message = $error_message;
		$this->error_pattern = $error_pattern;
		$this->include_files = $include_files;
		$this->fix_pattern   = $fix_pattern;
		$this->exclude_dirs  = $exclude_dirs;
	}

	/**
	 * Runs the rule to detect or auto-fix any violations.
	 *
	 * @since 3.18.0
	 *
	 * @param bool $auto_fix_mode Whether violations should be auto-fixed.
	 * @return string The violations found, or an empty string.
	 */
	public function run( $auto_fix_mode ): string {
		$base_dir = __DIR__ . '/';
		$iterator = $this->create_iterator( $this->exclude_dirs );

		// Iterate over the directories and files.
		foreach ( $iterator as $file ) {
			// Check if the item is a file that should be checked.
			if ( $file->isFile() && preg_match( $this->include_files, $file->getFilename() ) ) {
				$file_content = file_get_contents( $file->getPathname() );

				// Check for rule violations.
				if ( preg_match_all( $this->error_pattern, $file_content, $matches, PREG_OFFSET_CAPTURE ) ) {
					$relative_path = str_replace( $base_dir, '', $file->getPathname() );

					// Auto-fix or log the issue.
					if ( $auto_fix_mode && null !== $this->fix_pattern ) {
						$fixed_content = preg_replace( $this->error_pattern, $this->fix_pattern, $file_content );

						if ( null === $fixed_content ) {
							$this->errors[] = "Error while trying to lint {$relative_path}.";
						}

						if ( false === file_put_contents( $file->getPathname(), $fixed_content ) ) {
							$this->errors[] = "Failed to save fix for {$relative_path}.";
						}
					} else {
						foreach ( $matches[0] as $match ) {
							$line_number    = substr_count( substr( $file_content, 0, $match[1] ), "\n" ) + 1;
							$this->errors[] = "{$relative_path} \033[90m(line {$line_number})\033[0m";
						}
					}
				}
			}
		}

		if ( empty( $this->errors ) ) {
			return '';
		}

		$output = "\033[31mERROR: {$this->error_message}.\033[0m\n";
		if ( null !== $this->fix_pattern ) {
			$output .= "\033[33mAuto-fixable with the --fix parameter.\033[0m\n";
		}
		$output .= "\033[36mYou can use the {$this->error_pattern} regex to find the offending code.\033[0m\n\n";

		foreach ( $this->errors as $error ) {
			$output .= " - {$error}\n";
		}

		return $output . "\n\n";
	}

	/**
	 * Creates an iterator that iterates across the project's folder structure,
	 * skipping excluded directories.
	 *
	 * @since 3.18.0
	 *
	 * @return RecursiveIteratorIterator
	 */
	private function create_iterator(): RecursiveIteratorIterator {
		return new RecursiveIteratorIterator(
			new RecursiveCallbackFilterIterator(
				new RecursiveDirectoryIterator( __DIR__, RecursiveDirectoryIterator::SKIP_DOTS ),
				function ( $current, $key, $iterator ) {
					if ( $iterator->hasChildren() && in_array( $current->getFilename(), $this->exclude_dirs ) ) {
						return false; // Skip excluded directories.
					}

					return true;
				}
			),
			RecursiveIteratorIterator::SELF_FIRST
		);
	}
}

// phpcs:ignoreFile
