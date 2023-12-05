/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	ContentHelperErrorMessage,
	ContentHelperErrorMessageProps,
	EmptyCredentialsMessage,
} from './content-helper-error-message';

/**
 * Enumeration of all the possible errors that might get thrown or processed by
 * the Content Helper during error handling. All errors thrown by the Content
 * Helper should start with a "ch_" prefix.
 */
export enum ContentHelperErrorCode {
	CannotFormulateApiQuery = 'ch_cannot_formulate_api_query',
	FetchError = 'fetch_error', // apiFetch() failure, possibly caused by ad blocker.
	HttpRequestFailed = 'http_request_failed', // Parse.ly API is unreachable.
	ParselyApiForbidden = 403, // Intentionally without quotes.
	ParselyApiResponseContainsError = 'ch_response_contains_error',
	ParselyApiReturnedNoData = 'ch_parsely_api_returned_no_data',
	ParselyApiReturnedTooManyResults = 'ch_parsely_api_returned_too_many_results',
	ParselyApiUnauthorized = 401, // Intentionally without quotes.
	PluginCredentialsNotSetMessageDetected = 'parsely_credentials_not_set_message_detected',
	PluginSettingsApiSecretNotSet = 'parsely_api_secret_not_set',
	PluginSettingsSiteIdNotSet = 'parsely_site_id_not_set',
	PostIsNotPublished = 'ch_post_not_published',
}

/**
 * Extends the standard JS Error class for use with the Content Helper.
 *
 * @see https://github.com/microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
 */
export class ContentHelperError extends Error {
	protected code: ContentHelperErrorCode;
	protected hint: string | null = null;
	public retryFetch: boolean;

	constructor( message: string, code: ContentHelperErrorCode, prefix = __( 'Error: ', 'wp-parsely' ) ) {
		super( prefix + message );
		this.name = this.constructor.name;
		this.code = code;

		// Errors for which we should not retry a fetch operation.
		const noRetryFetchErrors: Array<ContentHelperErrorCode> = [
			ContentHelperErrorCode.ParselyApiForbidden,
			ContentHelperErrorCode.ParselyApiResponseContainsError,
			ContentHelperErrorCode.ParselyApiReturnedNoData,
			ContentHelperErrorCode.ParselyApiReturnedTooManyResults,
			ContentHelperErrorCode.ParselyApiUnauthorized,
			ContentHelperErrorCode.PluginCredentialsNotSetMessageDetected,
			ContentHelperErrorCode.PluginSettingsApiSecretNotSet,
			ContentHelperErrorCode.PluginSettingsSiteIdNotSet,
			ContentHelperErrorCode.PostIsNotPublished,
		];

		this.retryFetch = ! noRetryFetchErrors.includes( this.code );

		// Set the prototype explicitly.
		Object.setPrototypeOf( this, ContentHelperError.prototype );
	}

	/**
	 * Renders the error's message.
	 *
	 * @param {ContentHelperErrorMessageProps|null} props The props needed for the function.
	 *
	 * @return {JSX.Element} The resulting JSX Element.
	 */
	public Message( props: ContentHelperErrorMessageProps|null = null ): JSX.Element {
		// Handle cases where credentials are not set.
		const CredentialsNotSetErrorCodes = [
			ContentHelperErrorCode.PluginCredentialsNotSetMessageDetected,
			ContentHelperErrorCode.PluginSettingsSiteIdNotSet,
			ContentHelperErrorCode.PluginSettingsApiSecretNotSet,
		];
		if ( CredentialsNotSetErrorCodes.includes( this.code ) ) {
			return EmptyCredentialsMessage( props );
		}

		// Errors that need a hint.
		if ( this.code === ContentHelperErrorCode.FetchError ) {
			this.hint = this.Hint( __(
				'This error can sometimes be caused by ad-blockers or browser tracking protections. Please add this site to any applicable allow lists and try again.',
				'wp-parsely'
			) );
		}
		if ( this.code === ContentHelperErrorCode.ParselyApiForbidden ) {
			this.hint = this.Hint( __(
				"Please ensure that the Site ID and API Secret given in the plugin's settings are correct.",
				'wp-parsely'
			) );
		}
		if ( this.code === ContentHelperErrorCode.HttpRequestFailed ) {
			this.hint = this.Hint( __(
				'The Parse.ly API cannot be reached. Please verify that you are online.',
				'wp-parsely'
			) );
		}

		// Errors that need rephrasing.
		if ( this.code === ContentHelperErrorCode.ParselyApiUnauthorized ) {
			this.message = __(
				'This feature is accessible to select customers participating in its beta testing.',
				'wp-parsely'
			);
		}

		return (
			<ContentHelperErrorMessage
				className={ props?.className }
				testId="error">
				{ `<p>${ this.message }</p>${ this.hint ? this.hint : '' }` }
			</ContentHelperErrorMessage>
		);
	}

	/**
	 * Shows a hint in order to provide clarity in regards to the error.
	 *
	 * @param {string} hint The hint to display
	 */
	protected Hint( hint: string ): string {
		return `<p className="content-helper-error-message-hint" data-testid="content-helper-error-message-hint"><strong>${ __( 'Hint:', 'wp-parsely' ) }</strong> ${ hint }</p>`;
	}
}
