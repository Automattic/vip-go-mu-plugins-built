/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { dispatch } from '@wordpress/data';
import {
	ContentHelperErrorMessage,
	ContentHelperErrorMessageProps,
	EmptyCredentialsMessage,
} from './content-helper-error-message';

/**
 * Enumeration of all the possible errors that might get thrown or processed by
 * Content Intelligence during error handling. All errors thrown by Content
 * Intelligence should start with a "ch_" prefix.
 */
export enum ContentHelperErrorCode {
	AccessToFeatureDisabled = 'ch_access_to_feature_disabled',
	FetchError = 'fetch_error', // apiFetch() failure, possibly caused by ad blocker.
	HttpRequestFailed = 'http_request_failed', // Parse.ly API is unreachable.
	ParselyAborted = 'ch_parsely_aborted', // The request was aborted.
	ParselyApiForbidden = '403',
	ParselyApiResponseContainsError = 'ch_response_contains_error',
	ParselyApiReturnedNoData = 'ch_parsely_api_returned_no_data',
	ParselyApiReturnedTooManyResults = 'ch_parsely_api_returned_too_many_results',
	PluginCredentialsNotSetMessageDetected = 'parsely_credentials_not_set_message_detected',
	PluginSettingsApiSecretNotSet = 'parsely_api_secret_not_set',
	PluginSettingsSiteIdNotSet = 'parsely_site_id_not_set',
	PostIsNotPublished = 'ch_post_not_published',
	UnknownError = 'ch_unknown_error',

	// Suggestions API.
	ParselySuggestionsApiAuthUnavailable = 'AUTH_UNAVAILABLE', // HTTP Code 503.
	ParselySuggestionsApiNoAuthentication = 'NO_AUTHENTICATION', // HTTP Code 401.
	ParselySuggestionsApiNoAuthorization = 'NO_AUTHORIZATION', // HTTP Code 403.
	ParselySuggestionsApiNoData = 'NO_DATA', // HTTP Code 507.
	ParselySuggestionsApiNoDataManualLinking = 'NO_DATA_MANUAL_LINKING', // HTTP Code 507.
	ParselySuggestionsApiOpenAiError = 'OPENAI_ERROR', // HTTP Code 500.
	ParselySuggestionsApiOpenAiSchema = 'OPENAI_SCHEMA', // HTTP Code 507.
	ParselySuggestionsApiOpenAiUnavailable = 'OPENAI_UNAVAILABLE', // HTTP Code 500.
	ParselySuggestionsApiResponseValidationError = 'RESPONSE_VALIDATION_ERROR', // HTTP Code 500.
	ParselySuggestionsApiSchemaError = 'SCHEMA_ERROR', // HTTP Code 422.
	ParselySuggestionsInvalidRequest = 'INVALID_REQUEST', // HTTP Code 400.
}

/**
 * Extends the standard JS Error class for use with Content Intelligence.
 *
 * @see https://github.com/microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
 */
export class ContentHelperError extends Error {
	public code: ContentHelperErrorCode;
	protected hint: string | null = null;
	public retryFetch: boolean;

	constructor(
		message: string,
		code: ContentHelperErrorCode,
		messagePrefix: string = __( 'Error:', 'wp-parsely' )
	) {
		// Avoid double message prefix.
		if ( message.startsWith( messagePrefix ) ) {
			messagePrefix = '';
		}

		// If the error code is not a string, convert it to a string.
		if ( typeof code !== 'string' ) {
			code = String( code ) as ContentHelperErrorCode;
		}

		// Initialization.
		super( messagePrefix.length > 0 ? `${ messagePrefix } ${ message }` : message );
		this.name = this.constructor.name;
		this.code = code;

		// Errors for which we should retry fetch operations. We call them soft
		// errors as they will not terminate execution.
		const softErrors: Array<ContentHelperErrorCode> = [
			// Generic HTTP/Fetch errors.
			ContentHelperErrorCode.FetchError,
			ContentHelperErrorCode.HttpRequestFailed,

			// Suggestions API errors that can be caused by network issues or
			// due to the non-deterministic nature of LLMs.
			ContentHelperErrorCode.ParselySuggestionsApiAuthUnavailable,
			ContentHelperErrorCode.ParselySuggestionsApiOpenAiError,
			ContentHelperErrorCode.ParselySuggestionsApiOpenAiSchema,
			ContentHelperErrorCode.ParselySuggestionsApiOpenAiUnavailable,
			ContentHelperErrorCode.ParselySuggestionsApiSchemaError,
		];

		this.retryFetch = softErrors.includes( this.code );

		// Set the prototype explicitly.
		Object.setPrototypeOf( this, ContentHelperError.prototype );

		this.CustomizeErrorMessaging();
	}

	/**
	 * Customizes error messages and hints for clarity, or to provide tailored
	 * messages when specific errors occur.
	 *
	 * This also allows for the internationalization of errors/hints.
	 *
	 * @since 3.20.8
	 */
	protected CustomizeErrorMessaging(): void {
		// Errors that need rephrasing.
		if ( this.code === ContentHelperErrorCode.AccessToFeatureDisabled ) {
			this.message = __(
				'Access to this feature is disabled by the site\'s administration.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiNoAuthorization ) {
			this.message = __(
				'This AI-powered feature is opt-in. To gain access, please submit a request ' +
				'<a href="https://wpvip.com/content-helper/#content-helper-form" target="_blank" rel="noopener">here</a>.',
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
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiSchemaError ||
			this.code === ContentHelperErrorCode.ParselySuggestionsInvalidRequest
		) {
			this.message = __(
				'The Parse.ly API returned a validation error. Please try again with different parameters.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiNoData ||
			this.code === ContentHelperErrorCode.ParselySuggestionsApiNoDataManualLinking
		) {
			this.message = __(
				'The Parse.ly API couldn\'t find any relevant data to fulfill the request.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiOpenAiSchema ||
			this.code === ContentHelperErrorCode.ParselySuggestionsApiResponseValidationError
		) {
			this.message = __(
				'The Parse.ly API returned an incorrect response.',
				'wp-parsely'
			);
		} else if ( this.code === ContentHelperErrorCode.ParselySuggestionsApiAuthUnavailable ) {
			this.message = __(
				'The Parse.ly API is currently unavailable. Please try again later.',
				'wp-parsely'
			);
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
	}

	/**
	 * Shows a hint in order to provide clarity in regards to the error.
	 *
	 * @param {string} hint The hint to display
	 */
	protected Hint( hint: string ): string {
		return `<p className="content-helper-error-message-hint" data-testid="content-helper-error-message-hint"><strong>${ __( 'Hint:', 'wp-parsely' ) }</strong> ${ hint }</p>`;
	}

	/**
	 * Renders the error's message.
	 *
	 * @param {ContentHelperErrorMessageProps|null} props The props needed for the function.
	 *
	 * @return {import('react').JSX.Element} The resulting JSX Element.
	 */
	public Message( props: ContentHelperErrorMessageProps|null = null ): React.JSX.Element {
		// Handle cases where credentials are not set.
		const CredentialsNotSetErrorCodes = [
			ContentHelperErrorCode.PluginCredentialsNotSetMessageDetected,
			ContentHelperErrorCode.PluginSettingsSiteIdNotSet,
			ContentHelperErrorCode.PluginSettingsApiSecretNotSet,
		];
		if ( CredentialsNotSetErrorCodes.includes( this.code ) ) {
			return EmptyCredentialsMessage( props );
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
	 * Creates an error Snackbar Notice, unless the error message contains links.
	 *
	 * @since 3.16.0
	 *
	 * @link https://github.com/Parsely/wp-parsely/issues/2424#issuecomment-2196196232
	 */
	public createErrorSnackbar(): void {
		if ( /<a.*?>/.test( this.message ) ) {
			return;
		}

		// @ts-ignore
		dispatch( 'core/notices' ).createNotice(
			'error',
			this.message,
			{
				type: 'snackbar',
			}
		);
	}
}
