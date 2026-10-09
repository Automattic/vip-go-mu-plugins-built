<?php

namespace Automattic\ShareADraft;

/**
 * A preview token secret.
 *
 * The plaintext value is what travels in the shareable URL. It is never stored:
 * the repository persists only {@see Token::hash()}, so a database leak does not
 * hand an attacker a set of working links. Comparison is constant-time.
 */
final class Token {
	/**
	 * Length, in bytes, of the random secret. 32 bytes = 256 bits of entropy,
	 * rendered as 64 hexadecimal characters.
	 */
	private const BYTES = 32;

	private string $value;

	private function __construct( string $value ) {
		$this->value = $value;
	}

	/**
	 * Mint a fresh, cryptographically-random token.
	 */
	public static function generate(): self {
		return new self( bin2hex( random_bytes( self::BYTES ) ) );
	}

	/**
	 * Wrap a token value received from an untrusted source (e.g. a request URL).
	 *
	 * No validation happens here: an invalid value simply fails the constant-time
	 * comparison in {@see Token::hash()} against any stored hash.
	 */
	public static function from_string( string $value ): self {
		return new self( $value );
	}

	/**
	 * The plaintext secret. Only ever placed in the shareable URL, never stored.
	 */
	public function value(): string {
		return $this->value;
	}

	/**
	 * The at-rest representation: a SHA-256 hash of the secret. This is what the
	 * repository stores and compares.
	 */
	public function hash(): string {
		return hash( 'sha256', $this->value );
	}
}
