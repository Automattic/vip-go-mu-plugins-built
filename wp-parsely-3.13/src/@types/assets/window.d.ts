/**
 * WordPress dependencies
 */
import type { _Hooks } from '@wordpress/hooks/build-types/createHooks';

export { };

declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		wp: any;

		/**
		 * Parsely Options
		 */
		PARSELY?: {
			config?: {
				uuid: string,
				parsely_site_uuid: string,
			},
			autotrack?: boolean,
			onload?: () => unknown,
			onReady?: () => unknown,
		},

		wpParselyContentHelperSettings: string;
		wpParselyDisableAutotrack?: boolean;
		wpParselyEmptyCredentialsMessage: string;
		wpParselyHooks?: _Hooks;
		wpParselyPostsStatsResponse: string;
		wpParselySiteId: string,

		/**
		 * Jetpack Editor Initial State.
		 * This is required for the Excerpt Generator feature to know if Jetpack
		 * AI Content Lens is available and enabled.
		 *
		 * @since 3.13.0
		 *
		 * @see https://github.com/Automattic/jetpack/blob/4eb6a42833879b30aa2a7f4c82e44fc094307de3/projects/plugins/jetpack/extensions/plugins/ai-content-lens/editor.js#L16
		 */
		Jetpack_Editor_Initial_State?: {
			available_blocks: {
				[key: string]: {
					available: boolean,
					unavailable_reason?: string,
					details: [],
				};
			};
		};
	}

}
