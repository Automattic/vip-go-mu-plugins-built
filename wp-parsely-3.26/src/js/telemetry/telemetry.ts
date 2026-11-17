declare global {
	/**
	 * The global object containing the telemetry data.
	 *
	 * @since 3.12.0
	 */
	const wpParselyTracksTelemetry: {
		version: string,
		vipgo_env?: string,
		user: {
			type: string,
			id: string,
		}
	};

	interface Window {
		/**
		 * Singleton instance of the Telemetry class.
		 * This is attached to the global `window` object to ensure that the same instance
		 * is used across different ES modules in the application.
		 *
		 * @since 3.12.0
		 */
		wpParselyTelemetryInstance: Telemetry;
		_tkq: EventProps[];
	}
}

/**
 * Event properties.
 *
 * @since 3.12.0
 */
export type EventProps = {
	[ key: string ]: string|number|boolean;
}

/**
 * Telemetry class.
 *
 * @since 3.12.0
 */
export class Telemetry {
	/**
	 * The prefix used for all events.
	 *
	 * @since 3.12.0
	 * @access private
	 */
	private static readonly TRACKS_PREFIX = 'wpparsely_';

	/**
	 * The regex used to validate event names.
	 *
	 * @since 3.12.0
	 * @access private
	 */
	private static readonly EVENT_NAME_REGEX = /^(([a-z0-9]+)_){2}([a-z0-9_]+)$/;

	/**
	 * The regex used to validate event properties.
	 *
	 * @since 3.12.0
	 * @access private
	 */
	private static readonly PROPERTY_REGEX = /^[a-z_][a-z0-9_]*$/;

	/**
	 * The queue of events to be tracked.
	 *
	 * @since 3.12.0
	 * @access private
	 */
	private _tkq: ( string | object )[] = [];

	/**
	 * Whether the tracking library has been loaded.
	 *
	 * @since 3.12.0
	 * @access protected
	 */
	protected isLoaded: boolean = false;

	/**
	 * Whether the tracking is enabled.
	 * Looks for the `wpParselyTracksTelemetry` global object. If it exists, telemetry is enabled.
	 *
	 * @since 3.12.0
	 * @access protected
	 */
	protected isEnabled: boolean = false;

	/**
	 * Private constructor to prevent direct object creation.
	 * This is necessary because this class is a singleton.
	 *
	 * @since 3.12.0
	 */
	private constructor() {
		if ( typeof wpParselyTracksTelemetry !== 'undefined' ) {
			this.isEnabled = true;
			this.loadTrackingLibrary();
		}
	}

	/**
	 * Returns the singleton instance of the Telemetry class.
	 * If the instance does not exist, it is created.
	 *
	 * @since 3.12.0
	 *
	 * @return {Telemetry} The singleton instance of the Telemetry class.
	 */
	public static getInstance(): Telemetry {
		if ( ! window.wpParselyTelemetryInstance ) {
			Object.defineProperty( window, 'wpParselyTelemetryInstance', {
				value: new Telemetry(),
				writable: false,
				configurable: false,
				enumerable: false, // This makes it not show up in console enumerations.
			} );
		}
		return window.wpParselyTelemetryInstance;
	}

	/**
	 * Loads the tracking library.
	 *
	 * @since 3.12.0
	 */
	private loadTrackingLibrary(): void {
		const script = document.createElement( 'script' );
		script.async = true;
		script.src = '//stats.wp.com/w.js';
		script.onload = () => {
			this.isLoaded = true;
			this._tkq = window._tkq || [];
		};
		document.head.appendChild( script );
	}

	/**
	 * Tracks an event.
	 * This method is static, so it can be called directly from the class.
	 * It first checks if the telemetry is enabled, and if not, it bails.
	 * Then, ensures that the telemetry library is loaded by calling `waitUntilLoaded`.
	 * Finally, it calls the `trackEvent` method on the singleton instance of the Telemetry class.
	 *
	 * @since 3.12.0
	 *
	 * @param {string}     eventName  The name of the event to track.
	 * @param {EventProps} properties The properties of the event to track.
	 *
	 * @return {Promise<void>}        A Promise that resolves when the event has been tracked.
	 */
	public static async trackEvent( eventName: string, properties: EventProps = {} ): Promise<void> {
		const telemetry: Telemetry = Telemetry.getInstance();

		// If telemetry is not enabled, bail.
		if ( ! telemetry.isTelemetryEnabled() ) {
			return;
		}

		await Telemetry.waitUntilLoaded();
		telemetry.trackEvent( eventName, properties );
	}

	/**
	 * Waits until the telemetry library is loaded.
	 * This method is static, so it can be called directly from the class.
	 * It checks every 100ms if the telemetry library is loaded, and resolves when it is.
	 * If the library is not loaded after 10 seconds, it rejects.
	 *
	 * @since 3.12.0
	 *
	 * @return {Promise<void>} A Promise that resolves when the telemetry library is loaded.
	 */
	public static waitUntilLoaded(): Promise<void> {
		return new Promise( ( resolve, reject ) => {
			const telemetry: Telemetry = Telemetry.getInstance();

			if ( ! telemetry.isTelemetryEnabled() ) {
				reject( 'Telemetry not enabled' );
				return;
			}

			if ( telemetry.isLoaded ) {
				resolve();
				return;
			}

			let timeout = 0;

			const interval = setInterval( () => {
				if ( telemetry.isLoaded ) {
					clearInterval( interval );
					resolve();
				}

				timeout += 100;

				if ( timeout >= 10000 ) {
					clearInterval( interval );
					reject( 'Telemetry library not loaded' );
				}
			}, 100 );
		} );
	}

	/**
	 * Tracks an event.
	 * This method is called by the static `trackEvent` method.
	 * It first checks if the telemetry library is loaded.
	 * Then, it validates the event name and the event properties.
	 * Finally, it pushes the event to the `_tkq` array.
	 *
	 * @since 3.12.0
	 *
	 * @param {string}     eventName  The name of the event to track.
	 * @param {EventProps} properties The properties of the event to track.
	 */
	private trackEvent( eventName: string, properties: EventProps ): void {
		if ( ! this.isLoaded ) {
			// eslint-disable-next-line no-console
			console.error( 'Error tracking event: Telemetry not loaded' );
			return;
		}

		// Validate if the event name has the correct prefix, if not, append it.
		if ( eventName.indexOf( Telemetry.TRACKS_PREFIX ) !== 0 ) {
			eventName = Telemetry.TRACKS_PREFIX + eventName;
		}

		// Validate the event name.
		if ( ! this.isEventNameValid( eventName ) ) {
			// eslint-disable-next-line no-console
			console.error( 'Error tracking event: Invalid event name' );
			return;
		}

		properties = this.prepareProperties( properties );

		// Push the event to the queue.
		this._tkq?.push( [ 'recordEvent', eventName, properties ] );
	}

	/**
	 * Checks if the telemetry is enabled.
	 *
	 * @since 3.12.0
	 */
	public isTelemetryEnabled(): boolean {
		return this.isEnabled;
	}

	/**
	 * Checks if a property is valid.
	 * A property is valid if it matches the PROPERTY_REGEX.
	 *
	 * @since 3.12.0
	 *
	 * @param {string} property The property to check.
	 *
	 * @return {boolean} `true` if the property is valid, `false` otherwise.
	 */
	private isProprietyValid( property: string ): boolean {
		return Telemetry.PROPERTY_REGEX.test( property );
	}

	/**
	 * Checks if an event name is valid.
	 * An event name is valid if it matches the EVENT_NAME_REGEX.
	 *
	 * @since 3.12.0
	 *
	 * @param {string} eventName The event name to check.
	 *
	 * @return {boolean} `true` if the event name is valid, `false` otherwise.
	 */
	private isEventNameValid( eventName: string ): boolean {
		return Telemetry.EVENT_NAME_REGEX.test( eventName );
	}

	/**
	 * Prepares the properties of an event.
	 * This method sanitizes the properties, sets the `parsely_version` property,
	 * and sets user-specific properties if they exist.
	 *
	 * @since 3.12.0
	 *
	 * @param {EventProps} properties The properties to prepare.
	 *
	 * @return {EventProps} The prepared properties.
	 */
	private prepareProperties( properties: EventProps ): EventProps {
		properties = this.sanitizeProperties( properties );

		properties.parsely_version = wpParselyTracksTelemetry.version;

		// Set user-specific properties.
		if ( wpParselyTracksTelemetry.user ) {
			properties._ut = wpParselyTracksTelemetry.user.type;
			properties._ui = wpParselyTracksTelemetry.user.id;
		}

		// If VIP environment, set the vipgo_env property.
		if ( wpParselyTracksTelemetry.vipgo_env ) {
			properties.vipgo_env = wpParselyTracksTelemetry.vipgo_env;
		}

		return this.sanitizeProperties( properties );
	}

	/**
	 * Sanitizes the properties of an event.
	 * This method creates a new object and copies over all valid properties
	 * from the original properties.
	 *
	 * @since 3.12.0
	 *
	 * @param {EventProps} properties The properties to sanitize.
	 *
	 * @return {EventProps} The sanitized properties.
	 */
	private sanitizeProperties( properties: EventProps ): EventProps {
		const sanitizedProperties: EventProps = {};

		Object.keys( properties ).forEach( ( property: string ) => {
			if ( this.isProprietyValid( property ) ) {
				sanitizedProperties[ property ] = properties[ property ];
			}
		} );

		return sanitizedProperties;
	}
}

export const trackEvent = Telemetry.trackEvent;
