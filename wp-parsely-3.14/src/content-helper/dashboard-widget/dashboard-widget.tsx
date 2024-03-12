/**
 * WordPress dependencies
 */
import { createRoot, render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { VerifyCredentials } from '../common/verify-credentials';
import { TopPosts } from './components/top-posts';
import { SettingsProvider, TopPostsSettings } from '../common/settings';
import { isInEnum, Metric, Period } from '../common/utils/constants';

/**
 * Gets the settings from the passed JSON.
 *
 * If missing settings or invalid values are detected, they get set to their
 * defaults.
 *
 * @since 3.13.0
 * @since 3.14.0 Moved from `content-helper/dashboard-widget/dashboard-widget.tsx`.
 *
 * @param {string} settingsJson The JSON containing the settings.
 *
 * @return {TopPostsSettings} The resulting settings object.
 */
const getSettingsFromJson = ( settingsJson: string ): TopPostsSettings => {
	let parsedSettings: TopPostsSettings;

	try {
		parsedSettings = JSON.parse( settingsJson );
	} catch ( e ) {
		// Return defaults when parsing failed or the string is empty.
		return {
			Metric: Metric.Views,
			Period: Period.Days7,
		};
	}

	// Fix invalid values if any are found.
	if ( ! isInEnum( parsedSettings?.Metric, Metric ) ) {
		parsedSettings.Metric = Metric.Views;
	}
	if ( ! isInEnum( parsedSettings?.Period, Period ) ) {
		parsedSettings.Period = Period.Days7;
	}

	return parsedSettings;
};

window.addEventListener(
	'load',
	function() {
		const container = document.querySelector( '#wp-parsely-dashboard-widget > .inside' );

		if ( null !== container ) {
			const component =
				<SettingsProvider
					endpoint="dashboard-widget-settings"
					defaultSettings={ getSettingsFromJson( window.wpParselyContentHelperSettings ) }
				>
					<VerifyCredentials>
						<TopPosts />
					</VerifyCredentials>
				</SettingsProvider>;

			if ( createRoot ) {
				createRoot( container ).render( component );
			} else {
				render( component, container );
			}
		}
	},
	false
);
