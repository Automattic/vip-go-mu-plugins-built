/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Enumeration of all the possible errors that might get thrown or processed by
 * the Content Helper during error handling. All errors thrown by the Content
 * Helper should start with a "ch_" prefix.
 */
export enum ContentHelperErrorCode {
	CannotFormulateApiQuery = 'ch_cannot_formulate_api_query',
	FetchError = 'fetch_error', // apiFetch() failure, possibly caused by ad blocker.
	ParselyApiForbidden = '403',
	ParselyApiResponseContainsError = 'ch_response_contains_error',
	ParselyApiReturnedNoData = 'ch_parsely_api_returned_no_data',
	ParselyApiReturnedTooManyResults = 'ch_parsely_api_returned_too_many_results',
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
	protected prefix: string;
	protected hint: JSX.Element = null;

	constructor( message: string, code: ContentHelperErrorCode, prefix = __( 'Error: ', 'wp-parsely' ) ) {
		super( prefix + message );
		this.name = this.constructor.name;
		this.code = code;

		// Set the prototype explicitly.
		Object.setPrototypeOf( this, ContentHelperError.prototype );
	}

	public ProcessedMessage( className = '' ): JSX.Element {
		// Errors that need to display the "Contact Us" message.
		const contactUsErrorCodes = [
			ContentHelperErrorCode.PluginSettingsSiteIdNotSet,
			ContentHelperErrorCode.PluginSettingsApiSecretNotSet,
		];
		if ( contactUsErrorCodes.includes( this.code ) ) {
			return this.ContactUsMessage();
		}

		// Errors that need a hint.
		if ( this.code === ContentHelperErrorCode.FetchError ) {
			this.hint = this.Hint( __(
				'This error can be sometimes caused by ad-blockers or browser tracking protections. Please add this site to any applicable allow lists and try again.',
				'wp-parsely'
			) );
		}
		if ( this.code === ContentHelperErrorCode.ParselyApiForbidden ) {
			this.hint = this.Hint( __(
				"Please ensure that the Site ID within the plugin's settings is correct.",
				'wp-parsely'
			) );
		}

		return (
			<>
				<p className={ className } data-testid="error">
					{ this.message }
				</p>
				{ this.hint }
			</>
		);
	}

	/**
	 * "Contact Us" component that we display in place of certain errors.
	 */
	protected ContactUsMessage(): JSX.Element {
		return (
			<div className="parsely-contact-us parsely-top-posts-descr" data-testid="parsely-contact-us">
				<p>
					{ /* eslint-disable-next-line react/jsx-no-target-blank */ }
					<a href="https://www.parse.ly/contact" target="_blank" rel="noopener">
						{ __( 'Contact us', 'wp-parsely' ) + ' ' }
					</a>
					{ __( 'about advanced plugin features and the Parse.ly dashboard.', 'wp-parsely' ) }
				</p>
				<p>
					{ __(
						'Existing Parse.ly customers can enable this feature by setting their Site ID and API Secret in',
						'wp-parsely'
					) + ' ' }
					{ /* eslint-disable-next-line react/jsx-no-target-blank */ }
					<a href="/wp-admin/options-general.php?page=parsely" target="_blank" rel="noopener">
						{ __( 'wp-parsely options.', 'wp-parsely' ) }
					</a>
				</p>
			</div>
		);
	}

	/**
	 * Shows a hint in order to provide clarity in regards to the error.
	 *
	 * @param {string} hint The hint to display
	 */
	protected Hint( hint: string ): JSX.Element {
		return (
			<p className="parsely-error-hint" data-testid="parsely-error-hint">
				<strong>{ __( 'Hint:', 'wp-parsely' ) }</strong> { hint }
			</p>
		);
	}
}
