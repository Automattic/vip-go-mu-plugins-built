/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ContentHelperError, ContentHelperErrorCode } from './content-helper-error';

/**
 * The response structure of the API.
 *
 * @since 3.15.0
 */
export interface ContentHelperAPIResponse<T> {
	error?: Error;
	message?: string;
	data: T;
}

/**
 * The result of the getOrCreateController method.
 *
 * @since 3.15.0
 */
type GetAbortControllerResult = {
	abortController: AbortController;
	abortId: string;
};

/**
 * Base class for all providers.
 *
 * Provides a common interface for fetching data from the API, with support
 * for cancelling requests.
 *
 * @since 3.15.0
 */
export abstract class BaseProvider {
	/**
	 * A map of AbortControllers used to cancel fetch requests.
	 *
	 * @since 3.15.0
	 */
	private abortControllers: Map<string, AbortController> = new Map();

	/**
	 * Protected empty constructor to prevent instantiation.
	 *
	 * @since 3.15.0
	 */
	protected constructor() {} // eslint-disable-line no-useless-constructor

	/**
	 * Cancels the fetch request.
	 *
	 * If an ID is provided, it cancels the request with that ID.
	 * If no ID is provided, it cancels the most recent request.
	 *
	 * @since 3.15.0
	 *
	 * @param {string?} id The (optional) ID of the request to cancel.
	 */
	public cancelRequest( id?: string ): void {
		// If an ID is provided, cancel the request with that ID.
		if ( id ) {
			const controller = this.abortControllers.get( id );

			if ( controller ) {
				controller.abort();
				this.abortControllers.delete( id );
			}

			return;
		}

		// Otherwise, cancel the most recent request.
		const lastKey = Array.from( this.abortControllers.keys() ).pop();
		if ( lastKey ) {
			const controller = this.abortControllers.get( lastKey );

			if ( controller ) {
				controller.abort();
				this.abortControllers.delete( lastKey );
			}
		}
	}

	/**
	 * Cancels all fetch requests for the provider.
	 *
	 * @since 3.15.0
	 */
	public cancelAll(): void {
		this.abortControllers.forEach( ( controller ) => controller.abort() );
		this.abortControllers.clear();
	}

	/**
	 * Private method to manage creating and storing AbortControllers.
	 *
	 * @since 3.15.0
	 *
	 * @param {string?} id The (optional) ID of the request.
	 *
	 * @return {GetAbortControllerResult} The AbortController and its ID.
	 */
	private getOrCreateController( id?: string ): GetAbortControllerResult {
		if ( id && this.abortControllers.has( id ) ) {
			return {
				abortController: this.abortControllers.get( id )!,
				abortId: id,
			};
		}

		// If no ID is provided, generate one.
		const abortId = id ?? 'auto-' + Date.now();
		// Create a new AbortController.
		const controller = new AbortController();
		// Store the AbortController.
		this.abortControllers.set( abortId, controller );

		return {
			abortController: controller,
			abortId,
		};
	}

	/**
	 * Fetches data from the API. Either resolves with the data or rejects with
	 * an error.
	 *
	 * This method is a wrapper around apiFetch() that automatically adds the
	 * AbortController signal.
	 *
	 * @since 3.15.0
	 *
	 * @param {APIFetchOptions} options The options to pass to apiFetch
	 * @param {string?}         id      The (optional) ID of the request
	 *
	 * @return {Promise<ContentHelperAPIResponse<any>>} The fetched data
	 */
	protected async fetch<T>( options: APIFetchOptions, id?: string ): Promise<T> {
		const { abortController, abortId } = this.getOrCreateController( id );
		options.signal = abortController.signal;

		try {
			const response = await apiFetch<ContentHelperAPIResponse<T>>( options );

			// Validate API side errors.
			if ( response.error ) {
				return Promise.reject(
					new ContentHelperError(
						response.error.message,
						ContentHelperErrorCode.ParselyApiResponseContainsError,
					),
				);
			}

			return response.data;
		} catch ( wpError: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			if ( wpError.name === 'AbortError' ) {
				return Promise.reject(
					new ContentHelperError(
						__( 'The operation was aborted.', 'wp-parsely' ),
						ContentHelperErrorCode.ParselyAborted,
					),
				);
			}

			let errorMessage = wpError.message;
			// The error message might be an object with multiple messages.
			if ( typeof wpError.message === 'object' && wpError.message[ 0 ].msg ) {
				errorMessage = wpError.message[ 0 ].msg;
			}

			return Promise.reject( new ContentHelperError( errorMessage, wpError.code ) );
		} finally {
			// Clean-up the AbortController after a successful request.
			this.abortControllers.delete( abortId );
		}
	}
}
