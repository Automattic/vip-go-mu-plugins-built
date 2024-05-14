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
	ParselyAborted = 'ch_parsely_aborted', // The request was aborted.
	ParselyApiForbidden = 403, // Intentionally without quotes.
	ParselyApiResponseContainsError = 'ch_response_contains_error',
	ParselyApiReturnedNoData = 'ch_parsely_api_returned_no_data',
	ParselyApiReturnedTooManyResults = 'ch_parsely_api_returned_too_many_results',
	PluginCredentialsNotSetMessageDetected = 'parsely_credentials_not_set_message_detected',
	PluginSettingsApiSecretNotSet = 'parsely_api_secret_not_set',
	PluginSettingsSiteIdNotSet = 'parsely_site_id_not_set',
	PostIsNotPublished = 'ch_post_not_published',

	// Suggestions API.
	ParselySuggestionsApiAuthUnavailable = 'AUTH_UNAVAILABLE', // HTTP Code 503.
	ParselySuggestionsApiNoAuthentication = 'NO_AUTHENTICATION', // HTTP Code 401.
	ParselySuggestionsApiNoAuthorization = 'NO_AUTHORIZATION', // HTTP Code 403.
	ParselySuggestionsApiNoData = 'NO_DATA', // HTTP Code 507.
	ParselySuggestionsApiOpenAiError = 'OPENAI_ERROR', // HTTP Code 500.
	ParselySuggestionsApiOpenAiSchema = 'OPENAI_SCHEMA', // HTTP Code 507.
	ParselySuggestionsApiOpenAiUnavailable = 'OPENAI_UNAVAILABLE', // HTTP Code 500.
	ParselySuggestionsApiSchemaError = 'SCHEMA_ERROR', // HTTP Code 422.
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
			ContentHelperErrorCode.PluginCredentialsNotSetMessageDetected,
			ContentHelperErrorCode.PluginSettingsApiSecretNotSet,
			ContentHelperErrorCode.PluginSettingsSiteIdNotSet,
			ContentHelperErrorCode.PostIsNotPublished,

			// Don't perform any fetch retries for the Suggestions API due to
			// its time-consuming operations.
			ContentHelperErrorCode.ParselySuggestionsApiAuthUnavailable,
			ContentHelperErrorCode.ParselySuggestionsApiNoAuthentication,
			ContentHelperErrorCode.ParselySuggestionsApiNoAuthorization,
			ContentHelperErrorCode.ParselySuggestionsApiNoData,
			ContentHelperErrorCode.ParselySuggestionsApiSchemaError,
		];

		this.retryFetch = ! noRetryFetchErrors.includes( this.code );

		// Set the prototype explicitly.
		Object.setPrototypeOf( this, ContentHelperError.prototype );

		// Errors that need rephrasing.
		if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiNoAuthorization ) {
			this.message = __(
				'This AI-powered feature is opt-in. To gain access, please submit a request ' +
				'<a href="https://wpvip.com/parsely-content-helper/" target="_blank" rel="noreferrer">here</a>.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiOpenAiError ||
			this.code === ContentHelperErrorCode.ParselySuggestionsApiOpenAiUnavailable ) {
			this.message = __(
				'The Parse.ly API returned an internal server error. Please retry with a different input, or try again later.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.HttpRequestFailed &&
			this.message.includes( 'cURL error 28' ) ) {
			this.message = __(
				'The Parse.ly API did not respond in a timely manner. Please try again later.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiSchemaError ) {
			this.message = __(
				'The Parse.ly API returned a validation error. Please try again with different parameters.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiNoData ) {
			this.message = __(
				'The Parse.ly API couldn\'t find any relevant data to fulfill the request. Please retry with a different input.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiOpenAiSchema ) {
			this.message = __(
				'The Parse.ly API returned an incorrect response. Please try again later.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiAuthUnavailable ) {
			this.message = __(
				'The Parse.ly API is currently unavailable. Please try again later.',
				'wp-parsely'
			);
		}
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
		if ( this.code === ContentHelperErrorCode.ParselyApiForbidden ||
			this.code === ContentHelperErrorCode.ParselySuggestionsApiNoAuthentication ) {
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
