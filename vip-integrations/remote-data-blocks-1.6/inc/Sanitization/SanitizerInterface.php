<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Sanitization;

/**
 * Interface for providing data sanitization.
 *
 * @see Sanitizer for an implementation
 */
interface SanitizerInterface {
	/**
	 * Constructor.
	 */
	public function __construct( array $schema );

	/**
	 * Sanitize data according to a schema.
	 *
	 *
	 * @return mixed The sanitized data.
	 */
	public function sanitize( mixed $data ): mixed;
}
