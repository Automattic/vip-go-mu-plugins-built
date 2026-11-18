<?php
/**
 * Gist Widget model class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Model;

use InvalidArgumentException;

use GistAnswers\API\Credentials;
use GistAnswers\API\Get\Publishers\Widgets\HTML;
use GistAnswers\Model\GistSite;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Gist Widget model class for the Gist Answers plugin.
 */
final class GistWidget {

	private const WIDGET_CACHE_TRANSIENT        = 'gist_answers_widget_cache_';
	private const WIDGET_CACHE_DURATION         = 5 * MINUTE_IN_SECONDS;
	private const WIDGET_FAILURE_CACHE_DURATION = MINUTE_IN_SECONDS;

	// How long the last valid widget code is still shown while it can't be refreshed (e.g., during an API outage).
	private const WIDGET_STALE_DURATION = DAY_IN_SECONDS;

	// Only one request at a time refreshes a widget's code; the lock expires by itself in case that request dies.
	private const WIDGET_REFRESH_LOCK          = 'gist_answers_widget_refresh_';
	private const WIDGET_REFRESH_LOCK_DURATION = 30;

	// The largest widget snippet accepted from the API, in bytes.
	private const MAX_SNIPPET_BYTES = 64 * KB_IN_BYTES;

	/**
	 * The WP-Cron hook that refreshes a widget's cached code in the background (with the widget ID as its argument).
	 *
	 * @var string
	 */
	public const WIDGET_REFRESH_CRON_HOOK = 'gist_answers_refresh_widget_code';

	/**
	 * The Gist.ai ID for this widget.
	 *
	 * @var string
	 */
	private string $id = '';

	/**
	 * The type of this widget (either `chat` or `search`).
	 *
	 * @var string
	 */
	private string $type = '';

	/**
	 * The name of this widget.
	 *
	 * @var string
	 */
	private string $name = '';

	/**
	 * The creation timestamp of this widget.
	 *
	 * @var integer
	 */
	private int $created = 0;

	/**
	 * The target chat widget or URL for this widget.
	 *
	 * @var string
	 */
	private string $target = '';

	/**
	 * Class constructor.
	 *
	 * @param object $widget The widget data object.
	 *
	 * @return void
	 */
	public function __construct( object $widget ) {

		$this->id     = trim( strval( $widget->id ?? '' ) );
		$this->type   = trim( strval( $widget->type ?? '' ) );
		$this->name   = trim( strval( $widget->name ?? '' ) );
		$this->target = trim( strval( $widget->target ?? '' ) );

		$this->validate_widget_type();

		$this->created = intval( $widget->created ?? 0 );
	}

	/**
	 * Validate the widget type.
	 *
	 * @return void
	 *
	 * @throws InvalidArgumentException If the widget type is invalid.
	 */
	private function validate_widget_type(): void {

		$valid_types = array( 'chat', 'search' );

		if ( ! in_array( $this->type, $valid_types, true ) ) {
			throw new InvalidArgumentException( sprintf( 'Invalid widget type: %s', esc_html( $this->type ) ) );
		}
	}

	/**
	 * Get the Gist.ai ID for this widget.
	 *
	 * @return string The Gist.ai ID.
	 */
	public function get_id(): string {
		return $this->id;
	}

	/**
	 * Get the type of this widget.
	 *
	 * @return string The widget type (`chat` or `search`).
	 */
	public function get_type(): string {
		return $this->type;
	}

	/**
	 * Get the name of this widget.
	 *
	 * @return string The widget name.
	 */
	public function get_name(): string {
		return $this->name;
	}

	/**
	 * Get the creation timestamp of this widget.
	 *
	 * @return int The creation timestamp.
	 */
	public function get_created(): int {
		return $this->created;
	}

	/**
	 * Get the target chat widget or URL for this widget.
	 *
	 * @return string The target chat widget or URL.
	 */
	public function get_target(): string {
		return $this->target;
	}

	/**
	 * Get the name of the transient that caches the code for a given Gist widget ID.
	 *
	 * @param string $widget_id The Gist widget ID.
	 *
	 * @return string The transient name.
	 */
	public static function get_cache_transient_name( string $widget_id ): string {
		return self::WIDGET_CACHE_TRANSIENT . $widget_id;
	}

	/**
	 * Get the code for a given Gist widget ID.
	 *
	 * The code is cached for WIDGET_CACHE_DURATION. Once that has passed, the cached code is still returned (for up to
	 * WIDGET_STALE_DURATION), and a WP-Cron event refreshes it in the background, so that no page view waits on the
	 * API. Only when nothing is cached does a request fetch the code itself, and then only one request at a time does
	 * so; the others leave the widget out rather than call the API too.
	 *
	 * @param string $widget_id The Gist widget ID.
	 *
	 * @return object The widget code object, with `header_snippet` and `body_snippet` strings; will be empty if the
	 *                widget code cannot be retrieved.
	 */
	public static function get_widget_code( string $widget_id ): object {

		$entry = self::get_cache_entry( $widget_id );

		if ( is_object( $entry ) ) {

			if ( $entry->fresh_until <= time() && Utilities::acquire_lock( self::get_refresh_lock_name( $widget_id ), self::WIDGET_REFRESH_LOCK_DURATION ) ) {
				self::schedule_widget_code_refresh( $widget_id );
			}

			return $entry->code;
		}

		if ( ! Utilities::acquire_lock( self::get_refresh_lock_name( $widget_id ), self::WIDGET_REFRESH_LOCK_DURATION ) ) {
			return (object) array();
		}

		$widget_code = self::refresh_widget_code( $widget_id );

		Utilities::release_lock( self::get_refresh_lock_name( $widget_id ) );

		return $widget_code;
	}

	/**
	 * Fetch the code for a given Gist widget ID from the API, and cache it.
	 *
	 * Only valid widget code replaces what is cached. If the API rejects the request (the token was revoked, or the
	 * widget no longer exists), the widget is cached as "no widget" briefly. If the API couldn't be reached, or sent
	 * something that isn't valid widget code, the last valid code (if any) is kept, and the refresh is tried again
	 * after WIDGET_FAILURE_CACHE_DURATION.
	 *
	 * @param string $widget_id The Gist widget ID.
	 *
	 * @return object The widget code object (see get_widget_code()).
	 */
	public static function refresh_widget_code( string $widget_id ): object {

		$transient_name = self::get_cache_transient_name( $widget_id );

		$previous = self::get_cache_entry( $widget_id );

		$publisher_id = GistSite::get()->get_publisher_id();

		$response = '' === $publisher_id ? null : ( new HTML( $publisher_id, $widget_id ) )->response();

		$widget_code = 200 === ( $response->code ?? 0 ) ? self::validate_widget_code( $response->data ?? null ) : null;

		$now = time();

		if ( is_object( $widget_code ) ) {

			set_transient(
				$transient_name,
				(object) array(
					'code'        => $widget_code,
					'fresh_until' => $now + self::WIDGET_CACHE_DURATION,
					'stale_until' => $now + self::WIDGET_STALE_DURATION,
				),
				self::WIDGET_STALE_DURATION
			);

			return $widget_code;
		}

		$is_rejected = '' === $publisher_id || in_array( $response->code ?? 0, array( 401, 403, 404 ), true );

		// A failure is cached as "no widget" briefly, so that every page view doesn't block on the API while it is
		// unavailable.
		if ( $is_rejected || ! is_object( $previous ) || empty( (array) $previous->code ) ) {

			set_transient(
				$transient_name,
				(object) array(
					'code'        => (object) array(),
					'fresh_until' => $now + self::WIDGET_FAILURE_CACHE_DURATION,
					'stale_until' => $now + self::WIDGET_FAILURE_CACHE_DURATION,
				),
				self::WIDGET_FAILURE_CACHE_DURATION
			);

			return (object) array();
		}

		set_transient(
			$transient_name,
			(object) array(
				'code'        => $previous->code,
				'fresh_until' => min( $now + self::WIDGET_FAILURE_CACHE_DURATION, $previous->stale_until ),
				'stale_until' => $previous->stale_until,
			),
			max( 1, $previous->stale_until - $now )
		);

		return $previous->code;
	}

	/**
	 * Get the cache entry for a given Gist widget ID, if there is a valid one.
	 *
	 * @param string $widget_id The Gist widget ID.
	 *
	 * @return object|null With `code` (see get_widget_code()), `fresh_until` (when it should be refreshed), and
	 *                     `stale_until` (when it may no longer be shown), or null if nothing valid is cached.
	 */
	private static function get_cache_entry( string $widget_id ): ?object {

		$entry = get_transient( self::get_cache_transient_name( $widget_id ) );

		if ( ! is_object( $entry ) || ! is_int( $entry->fresh_until ?? null ) || ! is_int( $entry->stale_until ?? null ) || $entry->stale_until <= time() ) {
			return null;
		}

		$code = is_object( $entry->code ?? null ) && empty( (array) $entry->code ) ? (object) array() : self::validate_widget_code( $entry->code ?? null );

		if ( ! is_object( $code ) ) {
			return null;
		}

		$entry->code = $code;

		return $entry;
	}

	/**
	 * Validate the widget code returned by the API.
	 *
	 * @param mixed $data The decoded response data.
	 *
	 * @return object|null The widget code, with only its `header_snippet` and `body_snippet` strings, or null if the
	 *                     data isn't valid widget code (e.g., an error, the wrong types, or snippets that are too long).
	 */
	private static function validate_widget_code( mixed $data ): ?object {

		if ( ! is_object( $data ) || ! empty( $data->error ?? null ) ) {
			return null;
		}

		$header_snippet = $data->header_snippet ?? '';
		$body_snippet   = $data->body_snippet ?? null;

		if ( ! is_string( $header_snippet ) || ! is_string( $body_snippet ) || '' === trim( $body_snippet ) ) {
			return null;
		}

		if ( strlen( $header_snippet ) > self::MAX_SNIPPET_BYTES || strlen( $body_snippet ) > self::MAX_SNIPPET_BYTES ) {
			return null;
		}

		return (object) array(
			'header_snippet' => $header_snippet,
			'body_snippet'   => $body_snippet,
		);
	}

	/**
	 * Get the name of the lock held while a given Gist widget's code is being refreshed.
	 *
	 * @param string $widget_id The Gist widget ID.
	 *
	 * @return string The lock name.
	 */
	private static function get_refresh_lock_name( string $widget_id ): string {
		return self::WIDGET_REFRESH_LOCK . $widget_id;
	}

	/**
	 * Schedule a WP-Cron event that refreshes a given Gist widget's code in the background, unless one already is.
	 *
	 * @param string $widget_id The Gist widget ID.
	 *
	 * @return void
	 */
	private static function schedule_widget_code_refresh( string $widget_id ): void {
		if ( false === wp_next_scheduled( self::WIDGET_REFRESH_CRON_HOOK, array( $widget_id ) ) ) {
			wp_schedule_single_event( time(), self::WIDGET_REFRESH_CRON_HOOK, array( $widget_id ) );
		}
	}

	/**
	 * The WP-Cron event that refreshes a given Gist widget's code (see schedule_widget_code_refresh()).
	 *
	 * Only the widgets of the publisher linked to this site are refreshed, so that a widget that has been removed
	 * isn't fetched again.
	 *
	 * @param mixed $widget_id The Gist widget ID.
	 *
	 * @return void
	 */
	public static function handle_widget_code_refresh( mixed $widget_id ): void {

		$widget_id = is_string( $widget_id ) ? $widget_id : '';

		if ( in_array( $widget_id, Credentials::get_stored_widget_ids(), true ) && Credentials::has_valid_api_token() ) {
			self::refresh_widget_code( $widget_id );
		}

		Utilities::release_lock( self::get_refresh_lock_name( $widget_id ) );
	}

	/**
	 * Schedule the background refresh of every widget of this site's publisher whose code isn't cached yet, so that
	 * the first page views that show a new widget (e.g., after the site's widgets change) don't wait on the API.
	 *
	 * @return void
	 */
	public static function prewarm_widget_code(): void {
		foreach ( Credentials::get_stored_widget_ids() as $widget_id ) {
			if ( ! is_object( self::get_cache_entry( $widget_id ) ) ) {
				self::schedule_widget_code_refresh( $widget_id );
			}
		}
	}

	/**
	 * Get an inline script that logs the given message to the browser console.
	 *
	 * The message is JSON-encoded (with HTML-sensitive characters escaped), so values in it, such as widget IDs and
	 * targets from shortcode or block attributes, can't break out of the string or the script tag.
	 *
	 * @param string $level   The console method to use: `warn` or `error`.
	 * @param string $message The message to log (empty to log nothing).
	 *
	 * @return string The script tag, or an empty string if there is no message.
	 */
	private static function get_console_script( string $level, string $message ): string {

		if ( '' === $message ) {
			return '';
		}

		$level = 'warn' === $level ? 'warn' : 'error';

		return '<script>console.' . $level . '(' . wp_json_encode( $message, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ')</script>';
	}

	/**
	 * Truncate a Gist widget ID for display purposes.
	 *
	 * @param string $id The Gist widget ID.
	 *
	 * @return string The truncated ID.
	 */
	public static function truncate_widget_id( string $id ): string {

		$id_parts = explode( '-', $id );

		if ( count( $id_parts ) > 3 ) {

			$output_parts = array(
				$id_parts[0] ?? '...',
				$id_parts[1] ?? '...',
				substr( $id_parts[2] ?? '...', 0, 4 ) . '...' . substr( $id_parts[ count( $id_parts ) - 1 ] ?? '...', -4 ),
			);

		} else {
			$output_parts = array( '' );
		}

		return implode( '-', $output_parts );
	}

	/**
	 * Get the Gist widget ID for a given page slug.
	 *
	 * @param string $page_slug The page slug.
	 *
	 * @return string The Gist widget ID; will be empty if no widget ID is found for the given page slug.
	 */
	public static function get_chat_widget_id_for_page( string $page_slug ): string {

		$page_slug = trim( $page_slug, '/' );
		$page_slug = strtolower( $page_slug );

		$gist_site = GistSite::get();

		foreach ( $gist_site->get_chat_widgets() as $widget ) {

			$widget_slug = $widget->get_name();
			$widget_slug = trim( $widget_slug, '/' );
			$widget_slug = strtolower( $widget_slug );

			if ( $widget_slug === $page_slug ) {
				return $widget->get_id();
			}
		}

		return '';
	}

	/**
	 * Get the page slug for the given Gist widget ID.
	 *
	 * @param string $widget_id The Gist chat/question widget ID.
	 *
	 * @return string The page slug; will be empty if no page slug is found for the given widget ID.
	 */
	public static function get_page_slug_for_chat_widget_id( string $widget_id ): string {

		$gist_site = GistSite::get();

		foreach ( $gist_site->get_chat_widgets() as $widget ) {
			if ( $widget->get_id() === $widget_id ) {

				$widget_slug = $widget->get_name();
				$widget_slug = trim( $widget_slug, '/' );
				$widget_slug = strtolower( $widget_slug );

				return $widget_slug;
			}
		}

		return '';
	}

	/**
	 * Sanitize the shortcode args for gist_answers_render_widget().
	 *
	 * @param mixed $args The function args.
	 *
	 * @return array<mixed> The sanitized args.
	 */
	public static function sanitize_args( mixed $args ): array {

		$args = is_object( $args ) ? get_object_vars( $args ) : $args;
		$args = is_array( $args ) ? $args : array();

		return $args;
	}

	/**
	 * Sanitize the widget type for gist_answers_render_widget().
	 *
	 * @param array<mixed> $args The function args.
	 *
	 * @return string The sanitized widget type.
	 */
	public static function sanitize_args_type( array $args ): string {

		$type = strval( $args['type'] ?? '' );
		$type = sanitize_text_field( $type );
		$type = strtolower( $type );

		// Accept the alternative names for each widget type.
		return match ( $type ) {
			'chat', 'answers'      => 'answer',
			'search', 'questions'  => 'question',
			default                => $type,
		};
	}

	/**
	 * Sanitize the widget ID for gist_answers_render_widget().
	 *
	 * @param array<mixed> $args The function args.
	 *
	 * @return string The sanitized widget ID.
	 */
	public static function sanitize_args_id( array $args ): string {

		$id = strval( $args['id'] ?? '' );
		$id = sanitize_text_field( $id );

		// Widget IDs only ever contain letters, digits, hyphens, and underscores (e.g., `chat-widget-<uuid>`).
		return preg_replace( '/[^A-Za-z0-9_-]/', '', $id );
	}

	/**
	 * Sanitize the echo argument for gist_answers_render_widget().
	 *
	 * @param array<mixed> $args The function args.
	 *
	 * @return bool The sanitized echo argument.
	 */
	public static function sanitize_args_echo( array $args ): bool {
		return isset( $args['echo'] ) ? boolval( $args['echo'] ) : true;
	}

	/**
	 * Sanitize the target slug for gist_answers_render_widget().
	 *
	 * @param array|null $args The function args; pass null to get the current page's slug.
	 *
	 * @return string The sanitized target slug.
	 */
	public static function sanitize_args_target( array|null $args = null ): string {

		$args = is_array( $args ) ? $args : array();

		$target = strval( $args['target'] ?? '' );
		$target = sanitize_text_field( $target );

		// A target is a page path (e.g., `/answers`), so keep only the characters a URL path can contain.
		$target = preg_replace( '#[^A-Za-z0-9/_.~%-]#', '', $target );

		if ( empty( $target ) ) {

			$page_url = Utilities::get_current_page_url();

			if ( defined( 'GIST_ANSWERS_DEVELOPMENT_MODE' ) && GIST_ANSWERS_DEVELOPMENT_MODE && function_exists( 'gist_answers_update_local_host' ) ) {
				$page_url = gist_answers_update_local_host( $page_url );
			}

			$target = Utilities::get_page_slug_from_url( $page_url );
		}

		$target = strtolower( $target );
		$target = trim( $target, '/' );

		return $target;
	}

	/**
	 * Get console warning message(s) for gist_answers_render_widget(), if necessary based on the given data.
	 *
	 * @param string $type              The widget type.
	 * @param string $id                The widget ID.
	 * @param string $target            The target page slug.
	 * @param string $target_id         The target widget ID for the given page slug.
	 * @param string $original_id       The original widget ID provided to gist_answers_render_widget().
	 * @param string $original_target   The original target page slug provided to gist_answers_render_widget().
	 * @param string $current_page_slug The current page slug.
	 * @param string $intended_target   The intended page slug target for the widget.
	 *
	 * @return string The console warning message(s); will be empty if no warnings are necessary.
	 */
	public static function maybe_get_console_warning_for(
		string $type,
		string $id,
		string $target,
		string $target_id,
		string $original_id,
		string $original_target,
		string $current_page_slug,
		string $intended_target,
	): string {

		switch ( $type ) {
			case 'answer':
				if ( ! empty( $original_id ) ) {

					$truncated_id_1 = self::truncate_widget_id( $original_id );
					$truncated_id_2 = self::truncate_widget_id( $id );

					if ( ! empty( $original_target ) ) {
						if ( $intended_target !== $original_target ) {
							if ( $original_id !== $id ) {

								$message = sprintf(
									"Widget type '%s' with ID '%s' does not match target '%s' or current page slug '%s'; widget ID '%s' was rendered instead",
									$type,
									$truncated_id_1,
									$intended_target ? $intended_target : '/',
									$current_page_slug ? $current_page_slug : '/',
									$truncated_id_2,
								);

							} elseif ( $current_page_slug !== $intended_target ) {

									$message = sprintf(
										"Widget type '%s' with ID '%s' does not match target '%s' or current page slug '%s'",
										$type,
										$truncated_id_1,
										$original_target ? $original_target : '/',
										$current_page_slug ? $current_page_slug : '/',
									);

							} else {

								$message = sprintf(
									"Widget type '%s' with ID '%s' does not match target '%s'",
									$type,
									$truncated_id_1,
									$original_target ? $original_target : '/',
								);
							}
						} elseif ( $original_id !== $id ) {

							if ( $current_page_slug !== $intended_target ) {

								$message = sprintf(
									"Widget type '%s' with ID '%s' does not match target '%s' or current page slug '%s'; widget ID '%s' was rendered instead",
									$type,
									$truncated_id_1,
									$intended_target ? $intended_target : '/',
									$current_page_slug ? $current_page_slug : '/',
									$truncated_id_2,
								);

							} else {

								$message = sprintf(
									"Widget type '%s' with ID '%s' does not match target '%s'; widget ID '%s' was rendered instead",
									$type,
									$truncated_id_1,
									$intended_target ? $intended_target : '/',
									$truncated_id_2,
								);
							}
						} elseif ( $current_page_slug !== $intended_target ) {

									$message = sprintf(
										"Widget type '%s' with ID '%s' and target '%s' does not match current page slug '%s'",
										$type,
										$truncated_id_1,
										$intended_target ? $intended_target : '/',
										$current_page_slug ? $current_page_slug : '/',
									);
						}
					} elseif ( $target !== $intended_target ) {

							$message = sprintf(
								"Widget type '%s' with ID '%s' does not match current page slug '%s'",
								$type,
								$truncated_id_1,
								$current_page_slug ? $current_page_slug : '/',
							);

					} elseif ( $original_id !== $id ) {

						$message = sprintf(
							"Widget type '%s' with ID '%s' does not match current page slug '%s'; widget ID '%s' was rendered instead",
							$type,
							$truncated_id_1,
							$current_page_slug ? $current_page_slug : '/',
							$truncated_id_2,
						);
					}
				} elseif ( ! empty( $original_target ) ) {

					if ( $intended_target !== $current_page_slug ) {

						$message = sprintf(
							"Widget type '%s' with target '%s' does not match current page slug '%s'",
							$type,
							$intended_target ? $intended_target : '/',
							$current_page_slug ? $current_page_slug : '/',
						);

					} elseif ( $original_target !== $current_page_slug ) {

						$message = sprintf(
							"Widget type '%s' with target '%s' does not match current page slug '%s'",
							$type,
							$original_target ? $original_target : '/',
							$current_page_slug ? $current_page_slug : '/',
						);
					}
				}
				break;

			case 'question':
				if ( ! empty( $original_target ) ) {

					$message = sprintf(
						"Parameter 'target' is ignored for widget type '%s'",
						$type,
					);
				}
				break;
		}

		$message = ! empty( $message ?? null ) ? "Gist Answers: {$message}" : '';

		return self::get_console_script( 'warn', $message );
	}

	/**
	 * Get console error message(s) for gist_answers_render_widget(), if necessary based on the given data.
	 *
	 * @param string $type              The widget type.
	 * @param string $id                The widget ID.
	 * @param string $target            The target page slug.
	 * @param string $target_id         The target widget ID for the given page slug.
	 * @param string $original_id       The original widget ID provided to gist_answers_render_widget().
	 * @param string $original_target   The original target page slug provided to gist_answers_render_widget().
	 * @param string $current_page_slug The current page slug.
	 * @param string $intended_target   The intended page slug target for the widget.
	 *
	 * @return string The console error message(s); will be empty if no errors are necessary.
	 */
	public static function maybe_get_console_error_for( // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- Keeping this for consistency with maybe_get_console_warning_for() and for future use if needed.
		string $type,
		string $id,
		string $target,
		string $target_id,
		string $original_id,
		string $original_target,
		string $current_page_slug,
		string $intended_target, // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable -- Keeping this for consistency with maybe_get_console_warning_for() and for future use if needed.
	): string {

		switch ( $type ) {
			case 'answer':
				if ( ! empty( $original_id ) ) {

					$truncated_id = self::truncate_widget_id( $original_id );

					if ( ! empty( $original_target ) ) {
						if ( $current_page_slug !== $original_target ) {

							$message = sprintf(
								"No widget HTML is available for type '%s' with ID '%s', target '%s', or current page slug '%s'",
								$type,
								$truncated_id,
								$original_target ? $original_target : '/',
								$current_page_slug ? $current_page_slug : '/',
							);

						} else {

							$message = sprintf(
								"No widget HTML is available for type '%s' with ID '%s' or target '%s'",
								$type,
								$truncated_id,
								$original_target ? $original_target : '/',
							);
						}
					} else {

						$message = sprintf(
							"No widget HTML is available for type '%s' with ID '%s' or current page slug '%s'",
							$type,
							$truncated_id,
							$current_page_slug ? $current_page_slug : '/',
						);
					}
				} elseif ( ! empty( $original_target ) ) {

					if ( $current_page_slug !== $original_target ) {

						$message = sprintf(
							"No widget HTML is available for type '%s' with target '%s' or current page slug '%s'",
							$type,
							$original_target ? $original_target : '/',
							$current_page_slug ? $current_page_slug : '/',
						);

					} else {

						$message = sprintf(
							"No widget HTML is available for type '%s' with target '%s'",
							$type,
							$original_target ? $original_target : '/',
						);
					}
				} else {

						$message = sprintf(
							"No widget HTML is available for type '%s' with current page slug '%s'",
							$type,
							$target ? $target : '/',
						);
				}
				break;

			case 'question':
				if ( ! empty( $original_id ) ) {

					$truncated_id = self::truncate_widget_id( $original_id );

					$message = sprintf(
						"No widget HTML is available for type '%s' with ID '%s'",
						$type,
						$truncated_id,
					);

				} else {

					$message = sprintf(
						"No ID was specified for widget type '%s'",
						$type,
					);
				}
				break;

			default:
				$message = 'A valid widget type was not provided';
				break;
		}

		$message = ! empty( $message ?? null ) ? "Gist Answers: {$message}; the widget was not rendered" : '';

		return self::get_console_script( 'error', $message );
	}
}
