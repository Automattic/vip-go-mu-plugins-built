/**
 * Internal dependencies
 */
import { addQueryArgs } from '@wordpress/url';
import { ContentHelperError, ContentHelperErrorCode } from '../content-helper-error';
import { BaseProvider } from './base-provider';

/**
 * Type definition for the authorization request parameters.
 *
 * @since 3.19.0
 */
interface AuthRequestParams {
	auth_scope: 'suggestions_api' | 'traffic_boost';
}

/**
 * Type definition for the authorization request's response.
 *
 * @since 3.19.0
 */
export interface AuthResponse {
	code: number;
	message: string;
}

export class CheckAuthProvider extends BaseProvider {
	/**
	 * The singleton instance of the CheckAuthProvider.
	 *
	 * @since 3.19.0
	 */
	private static instance: CheckAuthProvider;

	/**
	 * Returns the singleton instance of the CheckAuthProvider.
	 *
	 * @since 3.19.0
	 *
	 * @return {CheckAuthProvider} The singleton instance.
	 */
	public static getInstance(): CheckAuthProvider {
		if ( ! this.instance ) {
			this.instance = new CheckAuthProvider();
		}

		return this.instance;
	}

	/**
	 * Returns whether the Site ID is authorized to use the Suggestions API or
	 * Suggestions API feature.
	 *
	 * @since 3.19.0
	 *
	 * @param {AuthRequestParams} args The request parameters.
	 *
	 * @return {Promise<AuthResponse>} Whether the Site ID is authorized.
	 */
	public async getAuthorizationResponse( args: AuthRequestParams ): Promise<AuthResponse> {
		let response: AuthResponse = { code: 0, message: '' };

		try {
			response = await this.fetch<AuthResponse>( {
				method: 'POST',
				path: addQueryArgs(
					'/wp-parsely/v2/content-helper/check-auth', {
						...args,
					} ),
			} );
		} catch ( error: unknown ) {
			if ( error instanceof ContentHelperError ) {
				throw error;
			}

			if ( error instanceof Error ) {
				throw new ContentHelperError(
					error.message,
					ContentHelperErrorCode.UnknownError
				);
			}
		}

		return response;
	}
}
