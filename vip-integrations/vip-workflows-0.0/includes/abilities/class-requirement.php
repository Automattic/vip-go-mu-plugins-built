<?php
/**
 * A single unmet dependency of an ability or provider.
 *
 * Carries two message registers rather than one string. The admin register may
 * name a destination; the user register never does, because agent execution is
 * gated on `edit_posts` while the Agents screen and Settings → Connectors both
 * require `manage_options` — telling an editor to visit a screen they cannot
 * open is a dead instruction. Which register is emitted is decided where a
 * requirement is serialized, not where it is authored.
 *
 * @package VIPWorkflows\Abilities
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

/**
 * An unmet requirement, attributed to the sources that need it.
 */
final class Requirement {

	/**
	 * A credential (API key) is missing.
	 */
	public const KIND_MISSING_CREDENTIAL = 'missing_credential';

	/**
	 * The environment cannot support this capability (e.g. a class is absent).
	 */
	public const KIND_UNSUPPORTED_ENVIRONMENT = 'unsupported_environment';

	/**
	 * A prerequisite other than a credential is missing (e.g. no provider registered).
	 */
	public const KIND_DEPENDENCY = 'dependency';

	/**
	 * Register for readers who can reach admin settings.
	 */
	public const REGISTER_ADMIN = 'admin';

	/**
	 * Register for readers who cannot reach admin settings.
	 */
	public const REGISTER_USER = 'user';

	/**
	 * Stable identity, derived from the underlying service rather than the
	 * translated text, so dedupe survives translation.
	 *
	 * @var string
	 */
	private string $id;

	/**
	 * Requirement kind (one of the KIND_* constants).
	 *
	 * @var string
	 */
	private string $kind;

	/**
	 * Reason shown to a reader who can reach admin settings.
	 *
	 * @var string
	 */
	private string $admin_reason;

	/**
	 * Reason shown to a reader who cannot. Must not name an admin screen.
	 *
	 * @var string
	 */
	private string $user_message;

	/**
	 * Where this requirement can be satisfied.
	 *
	 * @var Destination
	 */
	private Destination $destination;

	/**
	 * Labels of the abilities/providers that need this requirement.
	 *
	 * @var string[]
	 */
	private array $sources;

	/**
	 * Construct a requirement.
	 *
	 * @param string      $id           Stable identity (e.g. "credential:tavily").
	 * @param string      $kind         One of the KIND_* constants.
	 * @param string      $admin_reason Reason for admin readers.
	 * @param string      $user_message Reason for non-admin readers.
	 * @param Destination $destination  Where to satisfy it.
	 * @param string[]    $sources      Labels needing this requirement.
	 */
	public function __construct(
		string $id,
		string $kind,
		string $admin_reason,
		string $user_message,
		Destination $destination,
		array $sources = array()
	) {
		$this->id           = $id;
		$this->kind         = $kind;
		$this->admin_reason = $admin_reason;
		$this->user_message = $user_message;
		$this->destination  = $destination;
		$this->sources      = array_values( array_unique( $sources ) );
	}

	/**
	 * Get the stable identity.
	 *
	 * @since 0.0.1
	 *
	 * @return string
	 */
	public function get_id(): string {
		return $this->id;
	}

	/**
	 * Get the requirement kind.
	 *
	 * @since 0.0.1
	 *
	 * @return string One of the KIND_* constants.
	 */
	public function get_kind(): string {
		return $this->kind;
	}

	/**
	 * Get the admin-register reason.
	 *
	 * @since 0.0.1
	 *
	 * @return string
	 */
	public function get_admin_reason(): string {
		return $this->admin_reason;
	}

	/**
	 * Get the user-register message.
	 *
	 * @since 0.0.1
	 *
	 * @return string
	 */
	public function get_user_message(): string {
		return $this->user_message;
	}

	/**
	 * Get the destination.
	 *
	 * @since 0.0.1
	 *
	 * @return Destination
	 */
	public function get_destination(): Destination {
		return $this->destination;
	}

	/**
	 * Get the sources needing this requirement.
	 *
	 * @since 0.0.1
	 *
	 * @return string[]
	 */
	public function get_sources(): array {
		return $this->sources;
	}

	/**
	 * The admin-register reason with the destination folded in as one sentence.
	 *
	 * For surfaces that render flat text and cannot offer a link — a `WP_Error`
	 * message, a log line — so the reader still learns where to go. A surface that
	 * renders the destination itself should use `get_admin_reason()` plus the
	 * destination, not this.
	 *
	 * @since 0.0.1
	 *
	 * @return string
	 */
	public function get_admin_text(): string {
		$hint = $this->destination->get_hint();

		if ( '' === $hint ) {
			return $this->admin_reason;
		}

		return $this->admin_reason . ' ' . $hint;
	}

	/**
	 * Return a copy with additional sources unioned in.
	 *
	 * Used when the same underlying requirement arrives from more than one
	 * ability or provider, so the card can render one row naming every
	 * capability that needs it.
	 *
	 * @since 0.0.1
	 *
	 * @param  string[] $sources Additional source labels.
	 * @return self A new instance; the receiver is unchanged.
	 */
	public function with_sources( array $sources ): self {
		return new self(
			$this->id,
			$this->kind,
			$this->admin_reason,
			$this->user_message,
			$this->destination,
			array_merge( $this->sources, $sources )
		);
	}

	/**
	 * Serialize for the given message register.
	 *
	 * The user register omits both the reason and the destination, so neither an
	 * admin URL nor admin-only wording can reach a reader who cannot act on it.
	 * That also decides the destination's credentials URL, which travels inside it:
	 * an editor is told to ask an administrator, and pairing that with a sign-up
	 * link would invite them to open an account whose values they have no screen to
	 * store — the settings fields are `manage_options`. Obtaining credentials is
	 * part of the administrator's job, so it stays in the administrator's register.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $register REGISTER_ADMIN or REGISTER_USER.
	 * @return array<string, mixed>
	 */
	public function to_array( string $register ): array {
		$payload = array(
			'id'      => $this->id,
			'kind'    => $this->kind,
			'sources' => $this->sources,
		);

		if ( self::REGISTER_ADMIN === $register ) {
			$payload['reason']      = $this->admin_reason;
			$payload['destination'] = $this->destination->to_array();

			return $payload;
		}

		$payload['message'] = $this->user_message;

		return $payload;
	}
}
