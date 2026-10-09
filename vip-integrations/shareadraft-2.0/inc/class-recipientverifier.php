<?php

namespace Automattic\ShareADraft;

/**
 * Proves a preview visitor controls one of a link's recipient addresses, via a
 * short emailed code.
 *
 * A code was chosen over an emailed magic link deliberately: corporate mail
 * scanners (Outlook SafeLinks and friends) prefetch links in inbound mail and
 * would consume a magic link before the human saw it, and a code is typed into
 * the browser that asked for it, so verification lands on the right device by
 * construction.
 *
 * The verifier never touches the link record. Challenges are keyed by the
 * token's hash and the address and stored hashed; guesses and code requests
 * are capped per (link, address) per window; success is remembered in a signed, stateless cookie — an HMAC over
 * (token hash, email, expiry) under the site's auth salt, so there is no
 * session table and nothing here to garbage-collect beyond transient expiry.
 * The cookie only ever *identifies* the visitor's proven address; whether that
 * address may still view is re-decided by {@see AccessPolicy} on every
 * request, against the link's current recipient list, expiry, and revocation —
 * which is why the cookie's own lifetime can be a lazy constant rather than
 * tracking the link's.
 */
final class RecipientVerifier {
	/** Digits in a verification code. */
	private const CODE_DIGITS = 6;

	/** How long a sent code stays redeemable. */
	public const CODE_TTL = 10 * MINUTE_IN_SECONDS;

	/**
	 * Guesses one address gets per window, however many codes it requests: a
	 * fresh code must not bring a fresh budget, or re-requesting would multiply
	 * the odds of guessing.
	 */
	private const MAX_ATTEMPTS = 5;

	/** Codes one address can request per window, so the form cannot spam a reviewer. */
	private const MAX_REQUESTS = 3;

	/** The fixed window both caps apply over, starting at its first use. */
	public const WINDOW = 15 * MINUTE_IN_SECONDS;

	/**
	 * Verification cookie lifetime. A backstop only — comfortably longer than
	 * the longest offered link lifetime (matching the slot cookie's reasoning);
	 * the link's own expiry is enforced by the policy on every request.
	 */
	private const COOKIE_TTL = WEEK_IN_SECONDS;

	private const COOKIE_PREFIX    = 'shareadraft_recipient_';
	private const CHALLENGE_PREFIX = 'shareadraft_otp_';
	private const REQUESTS_PREFIX  = 'shareadraft_otp_req_';
	private const ATTEMPTS_PREFIX  = 'shareadraft_otp_try_';
	private const CACHE_GROUP      = 'shareadraft';

	/**
	 * Send a code, but only after the response has left for the client.
	 *
	 * The email form answers a listed and an unlisted address with identical
	 * copy, and an unlisted address sends nothing — but sending inline would
	 * still leak membership through response *time*, since only a listed
	 * address pays for the transient writes and the SMTP handoff. Deferring
	 * the send to shutdown, and flushing the response first where the SAPI
	 * allows it, makes both paths answer alike. It also means the reviewer
	 * sees the "code sent" page before the mail handshake rather than after.
	 */
	public function queue_code( Token $token, string $email ): void {
		add_action(
			'shutdown',
			function () use ( $token, $email ): void {
				// On PHP-FPM (the VIP platform among others) this flushes the
				// response and closes the connection, so the work below is
				// invisible to a visitor timing the form. Elsewhere the
				// deferral alone still narrows the gap to end-of-request work.
				if ( function_exists( 'fastcgi_finish_request' ) ) {
					fastcgi_finish_request();
				}

				$this->send_code( $token, $email );
			}
		);
	}

	/**
	 * Email a fresh code for this link to the address. Once the mail is handed
	 * off, it replaces any code still outstanding; a failed handoff leaves the
	 * earlier code redeemable.
	 *
	 * The caller is responsible for only asking on behalf of a listed recipient
	 * (see {@see PreviewLinkService::is_recipient()}); this method's own guard
	 * is the per-address request cap, and it sends nothing while the address is
	 * out of guesses, since that code could not be redeemed. Returns false when
	 * either said no or the mail could not be handed off — callers must show
	 * the same neutral message either way, so the form never confirms which
	 * addresses are listed.
	 */
	public function send_code( Token $token, string $email ): bool {
		$email = strtolower( $email );
		$now   = time();

		if (
			$this->tally( self::ATTEMPTS_PREFIX . $this->challenge_suffix( $token, $email ) ) >= self::MAX_ATTEMPTS
			|| $this->bump( self::REQUESTS_PREFIX . $this->challenge_suffix( $token, $email ), $now ) > self::MAX_REQUESTS
		) {
			return false;
		}

		$code = str_pad( (string) random_int( 0, 10 ** self::CODE_DIGITS - 1 ), self::CODE_DIGITS, '0', STR_PAD_LEFT );

		$subject = sprintf(
			/* translators: 1: site name, 2: the verification code. */
			__( '[%1$s] %2$s is your preview access code', 'shareadraft' ),
			wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
			$code
		);

		// Naming the domain, and saying nobody will ever ask for the code, are
		// the two checks a reviewer can apply to a phishing imitation of this
		// email — which, unlike the real thing, has to carry a link somewhere.
		$message = sprintf(
			/* translators: 1: the verification code, 2: the site's domain, 3: number of minutes the code stays valid. */
			__(
				'Enter this code on %2$s to open the preview you were invited to review: %1$s

The code is valid for %3$d minutes and only works on the page where you requested it. Never share it with anyone — nobody legitimate will ask you for it. If you were not expecting this email, you can ignore it.',
				'shareadraft'
			),
			$code,
			(string) wp_parse_url( home_url(), PHP_URL_HOST ),
			self::CODE_TTL / MINUTE_IN_SECONDS
		);

		/**
		 * Filters the verification-code email before it is sent, for sites that
		 * want their own wording or branding. The code itself is embedded in
		 * both strings, so a callback replacing them wholesale must interpolate
		 * the passed code.
		 *
		 * @param array{subject: string, message: string} $mail  Subject and plain-text body.
		 * @param string                                  $email The recipient address.
		 * @param string                                  $code  The verification code.
		 */
		/** @var mixed $mail */
		$mail = apply_filters(
			'shareadraft_verification_email',
			[
				'subject' => $subject,
				'message' => $message,
			],
			$email,
			$code
		);

		if ( is_array( $mail ) && isset( $mail['subject'], $mail['message'] ) && is_string( $mail['subject'] ) && is_string( $mail['message'] ) ) {
			$subject = $mail['subject'];
			$message = $mail['message'];
		}

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_mail_wp_mail -- One short code email per human request, capped by the per-address window above; nothing bulk. On VIP wp_mail already routes through the platform's managed mail path.
		if ( ! wp_mail( $email, $subject, $message ) ) {
			// Keep any earlier code: it may already be in the reviewer's inbox,
			// and replacing it with one that never left would strand them.
			return false;
		}

		set_transient(
			$this->challenge_key( $token, $email ),
			[
				// Hashed at rest, like the token itself: a peek at the options
				// table must not hand over a working code.
				'code_hash'  => $this->hmac( $code ),
				'expires_at' => $now + self::CODE_TTL,
			],
			self::CODE_TTL
		);

		return true;
	}

	/**
	 * Redeem a code. True voids the challenge and means the visitor has proved
	 * control of the address; the caller should follow with
	 * {@see RecipientVerifier::remember_verified()}. Every guess spends one of
	 * the address's attempts for the window; once they are gone, even the right
	 * code is refused until the window ends.
	 */
	public function verify_code( Token $token, string $email, string $code ): bool {
		$email = strtolower( $email );
		$key   = $this->challenge_key( $token, $email );

		$challenge = get_transient( $key );

		if (
			! is_array( $challenge )
			|| ! isset( $challenge['code_hash'], $challenge['expires_at'] )
			|| ! is_string( $challenge['code_hash'] )
			|| ! is_numeric( $challenge['expires_at'] )
			|| time() >= (int) $challenge['expires_at']
		) {
			delete_transient( $key );

			return false;
		}

		// Count the guess before checking it. Reading the count, checking, and
		// then writing it back would let a burst of parallel guesses all read
		// the same count and all be checked.
		if ( $this->bump( self::ATTEMPTS_PREFIX . $this->challenge_suffix( $token, $email ), time() ) > self::MAX_ATTEMPTS ) {
			return false;
		}

		if ( hash_equals( $challenge['code_hash'], $this->hmac( $code ) ) ) {
			delete_transient( $key );

			return true;
		}

		return false;
	}

	/**
	 * Hand this browser the signed cookie that says "this visitor has proved
	 * control of this address, for this link".
	 */
	public function remember_verified( Token $token, string $email ): void {
		$email   = strtolower( $email );
		$expires = time() + self::COOKIE_TTL;
		$name    = $this->cookie_name( $token );
		$value   = implode(
			'.',
			[
				(string) $expires,
				$this->encode_email( $email ),
				$this->signature( $token, $email, $expires ),
			]
		);

		if ( ! headers_sent() ) {
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.cookies_setcookie -- Preview requests carry a unique token query string and are sent with nocache headers, so they are never page-cached; see PreviewGate.
			setcookie(
				$name,
				$value,
				[
					'expires'  => $expires,
					'path'     => '/',
					'secure'   => is_ssl(),
					'httponly' => true,
					'samesite' => 'Lax',
				]
			);
		}

		// Reflect it immediately so the redirect target of this same request
		// (or a second query) sees the verified state.
		// phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___COOKIE -- Uncached preview request; see above.
		$_COOKIE[ $name ] = $value;
	}

	/**
	 * The address this browser has proved control of for this link, or null.
	 *
	 * Forgery is not possible without the site's auth salt: the value carries
	 * an HMAC over (token hash, email, expiry), verified in constant time.
	 * Whether the proven address is still on the link's recipient list is
	 * deliberately not decided here — that belongs to {@see AccessPolicy}, so
	 * removing a recipient locks them out on their next request.
	 */
	public function verified_email( Token $token ): ?string {
		$name = $this->cookie_name( $token );

		// phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___COOKIE -- Uncached preview request; see PreviewGate.
		if ( ! isset( $_COOKIE[ $name ] ) ) {
			return null;
		}

		// Read raw: the value is authenticated by HMAC below, and sanitising
		// first could alter the exact bytes the signature covers. A cookie
		// name ending in `[]` makes PHP hand back an array, hence the check.
		/** @var mixed $raw_cookie */
		// phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___COOKIE, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.ValidatedSanitizedInput.MissingUnslash -- HMAC-verified before any use; a tampered value simply fails the signature.
		$raw_cookie = $_COOKIE[ $name ];

		if ( ! is_string( $raw_cookie ) ) {
			return null;
		}

		$parts = explode( '.', $raw_cookie );

		if ( 3 !== count( $parts ) ) {
			return null;
		}

		[ $expires_raw, $email_encoded, $signature ] = $parts;

		$expires = (int) $expires_raw;
		$email   = $this->decode_email( $email_encoded );

		if ( null === $email || time() >= $expires ) {
			return null;
		}

		if ( ! hash_equals( $this->signature( $token, $email, $expires ), $signature ) ) {
			return null;
		}

		return $email;
	}

	/**
	 * Add one to a counter and return its new value. The counter resets
	 * {@see RecipientVerifier::WINDOW} after its first bump; later bumps do not
	 * stretch the window.
	 *
	 * With a persistent object cache (always the case on VIP) this is an atomic
	 * add-then-increment, so parallel requests each get a distinct value and
	 * none can slip under a cap. A counter evicted between the two calls reads
	 * as over any cap: refusing once beats counting from zero.
	 */
	private function bump( string $key, int $now ): int {
		if ( wp_using_ext_object_cache() ) {
			// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined -- WINDOW is 15 minutes.
			wp_cache_add( $key, 0, self::CACHE_GROUP, self::WINDOW );
			$count = wp_cache_incr( $key, 1, self::CACHE_GROUP );

			return is_int( $count ) ? $count : PHP_INT_MAX;
		}

		// ponytail: read-then-write, so parallel requests can undercount on a host
		// without a persistent object cache; a conditional UPDATE on the options
		// row would close it if standalone hosts ever need that.
		[ $count, $resets_at ] = $this->stored_window( $key, $now );

		// The window start lives in the payload, since re-saving the transient
		// resets its TTL clock.
		set_transient(
			$key,
			[
				'count'     => $count + 1,
				'resets_at' => $resets_at,
			],
			self::WINDOW
		);

		return $count + 1;
	}

	/**
	 * A counter's current value, without adding to it.
	 */
	private function tally( string $key ): int {
		if ( wp_using_ext_object_cache() ) {
			$count = wp_cache_get( $key, self::CACHE_GROUP );

			return is_numeric( $count ) ? (int) $count : 0;
		}

		return $this->stored_window( $key, time() )[0];
	}

	/**
	 * The transient fallback's count and window end, or a fresh window if it
	 * is missing, malformed, or over.
	 *
	 * @return array{int, int}
	 */
	private function stored_window( string $key, int $now ): array {
		$window = get_transient( $key );

		if (
			is_array( $window )
			&& isset( $window['count'], $window['resets_at'] )
			&& is_numeric( $window['count'] )
			&& is_numeric( $window['resets_at'] )
			&& $now < (int) $window['resets_at']
		) {
			return [ (int) $window['count'], (int) $window['resets_at'] ];
		}

		return [ 0, $now + self::WINDOW ];
	}

	private function challenge_key( Token $token, string $email ): string {
		return self::CHALLENGE_PREFIX . $this->challenge_suffix( $token, $email );
	}

	/**
	 * Keys a challenge to (link, address) without putting either in an option
	 * name: a hash prefix identifies the link (as the gate's cookie name does)
	 * and the address is hashed to a fixed, option-name-safe length.
	 */
	private function challenge_suffix( Token $token, string $email ): string {
		return substr( $token->hash(), 0, 20 ) . '_' . md5( $email );
	}

	/**
	 * Like the gate's slot cookie, the name identifies the link (so one browser
	 * can hold verifications for several links); the security lives in the
	 * signed value.
	 */
	private function cookie_name( Token $token ): string {
		return self::COOKIE_PREFIX . substr( $token->hash(), 0, 20 );
	}

	private function signature( Token $token, string $email, int $expires ): string {
		return $this->hmac( $token->hash() . '|' . $email . '|' . $expires );
	}

	private function hmac( string $data ): string {
		return hash_hmac( 'sha256', $data, wp_salt( 'auth' ) );
	}

	/**
	 * Emails travel base64url-encoded inside the cookie so the `.` separators
	 * and `=` padding of the raw address cannot break parsing.
	 */
	private function encode_email( string $email ): string {
		return rtrim( strtr( base64_encode( $email ), '+/', '-_' ), '=' );
	}

	private function decode_email( string $encoded ): ?string {
		$decoded = base64_decode( strtr( $encoded, '-_', '+/' ), true );

		return false === $decoded || '' === $decoded ? null : $decoded;
	}
}
