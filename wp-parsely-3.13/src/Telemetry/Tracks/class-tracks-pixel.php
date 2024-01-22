<?php
/**
 * Telemetry: Tracks Pixel class
 *
 * @package Parsely\Telemetry
 * @since   3.12.0
 */

declare(strict_types=1);

namespace Parsely\Telemetry;

use WP_Error;

use function Parsely\Utils\get_timestamp;

/**
 * Handles all operations related to the Tracks pixel.
 *
 * @since 3.12.0
 */
class Tracks_Pixel {
	/**
	 * Base URL of the Tracks pixel.
	 */
	protected const PIXEL_BASE_URL = 'https://pixel.wp.com/t.gif';

	/**
	 * Class singleton instance.
	 *
	 * @var ?Tracks_Pixel
	 */
	protected static $instance = null;

	/**
	 * Events queued to be sent to the Tracks pixel.
	 *
	 * @var array<Tracks_Event>
	 */
	protected $events = array();

	/**
	 * Constructor.
	 *
	 * @since 3.12.0
	 */
	public function __construct() {
		// Track events asynchronously (inject pixels in the footer).
		add_action( 'admin_footer', array( $this, 'render_tracking_pixels' ) );
		// Synchronously track any remaining events that could not be added to
		// the footer.
		add_action( 'shutdown', array( $this, 'record_remaining_events' ) );
	}

	/**
	 * Instantiates the singleton.
	 *
	 * @since 3.12.0
	 *
	 * @return Tracks_Pixel
	 */
	public static function instance(): Tracks_Pixel {
		if ( is_null( self::$instance ) ) {
			self::$instance = new Tracks_Pixel();
		}

		return self::$instance;
	}

	/**
	 * Enqueues an event to be recorded asynchronously.
	 *
	 * @since 3.12.0
	 *
	 * @param Tracks_Event $event The event to record.
	 * @return bool|WP_Error True if the event was enqueued for recording.
	 *                       False if the event is not recordable.
	 *                       WP_Error if the event is generating an error.
	 */
	public function record_event_asynchronously( Tracks_Event $event ) {
		$is_event_recordable = $event->is_recordable();

		if ( true !== $is_event_recordable ) {
			return $is_event_recordable;
		}

		self::instance()->events[] = $event;

		return true;
	}

	/**
	 * Records an event synchronously (using a GET request).
	 *
	 * @since 3.12.0
	 *
	 * @param Tracks_Event $event The event to record.
	 * @return bool|WP_Error True if recording the event succeeded.
	 *                       False if the event is not recordable.
	 *                       WP_Error if any error occurred.
	 */
	public function record_event_synchronously( Tracks_Event $event ) {
		$is_event_recordable = $event->is_recordable();

		if ( true !== $is_event_recordable ) {
			return $is_event_recordable;
		}

		$pixel_url = self::instance()->generate_pixel_url( $event );

		if ( null === $pixel_url ) {
			return new WP_Error(
				'invalid_pixel',
				'cannot generate tracks pixel for given input',
				array( 'status' => 400 )
			);
		}

		// Add the Request Timestamp and URL terminator just before the HTTP
		// request.
		$pixel_url .= '&_rt=' . get_timestamp() . '&_=_';

		$request = wp_safe_remote_get(
			$pixel_url,
			array(
				'blocking'    => false,
				'redirection' => 2,
				'httpversion' => '1.1',
				'timeout'     => 1,
			)
		);

		if ( is_wp_error( $request ) ) {
			return $request;
		}

		return true;
	}

	/**
	 * Outputs a Tracks pixel for every registered event.
	 *
	 * @since 3.12.0
	 */
	public function render_tracking_pixels(): void {
		foreach ( $this->events as $event ) {
			$pixel_url = $this->generate_pixel_url( $event );

			if ( null === $pixel_url ) {
				continue;
			}

			echo '<img style="position: fixed;" src="', esc_url( $pixel_url ), '" />';
		}

		$this->events = array();
	}

	/**
	 * Generates a Tracks pixel URL that will record an event when accessed.
	 *
	 * @since 3.12.0
	 *
	 * @param Tracks_Event $event The event for which to generate the pixel URL.
	 * @return ?string The pixel URL or null if an error occurred.
	 */
	protected function generate_pixel_url( Tracks_Event $event ): ?string {
		$event_data = $event->get_data();

		if ( is_wp_error( $event_data ) ) {
			return null;
		}

		$args = get_object_vars( $event_data );

		// Request Timestamp and URL Terminator must be added just before the
		// HTTP request or not at all.
		unset( $args['_rt'], $args['_'] );

		return esc_url_raw(
			self::PIXEL_BASE_URL . '?' . http_build_query( $args )
		);
	}

	/**
	 * Records any remaining events synchronously.
	 *
	 * @since 3.12.0
	 */
	public function record_remaining_events(): void {
		foreach ( $this->events as $event ) {
			self::instance()->record_event_synchronously( $event );
		}
	}
}
