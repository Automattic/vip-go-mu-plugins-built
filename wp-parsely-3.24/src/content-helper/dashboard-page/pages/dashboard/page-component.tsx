/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SettingsProvider, TrafficBoostSettings } from '../../../common/settings';
import { VerifyCredentials } from '../../../common/verify-credentials';
import { PageBody, PageContainer, PostsTable } from '../../components';
import { DashboardHeading } from '../../components/typography-components';
import './dashboard.scss';
import { DashboardHeader } from './header-component';

/**
 * Gets the settings from the passed JSON.
 *
 * If missing settings or invalid values are detected, they get set to their
 * defaults.
 *
 * @since 3.19.0
 *
 * @param {string} settingsJson The JSON containing the settings.
 *
 * @return {TrafficBoostSettings} The resulting settings object.
 */
const getSettingsFromJson = ( settingsJson: string ): TrafficBoostSettings => {
	// Default settings object.
	const defaultSettings: TrafficBoostSettings = {
		Setting1: 'Hello World!',
	};

	// If the settings are empty, try to get them from the global variable.
	if ( '' === settingsJson ) {
		settingsJson = window.wpParselyContentHelperSettings;
	}

	let parsedSettings: TrafficBoostSettings;

	try {
		parsedSettings = JSON.parse( settingsJson );
	} catch ( e ) {
		// Return defaults when parsing failed or the string is empty.
		return defaultSettings;
	}

	// Merge parsed settings with default settings.
	const mergedSettings = { ...defaultSettings, ...parsedSettings };

	// Fix invalid values if any are found.
	if ( typeof mergedSettings.Setting1 !== 'string' ) {
		mergedSettings.Setting1 = defaultSettings.Setting1;
	}

	return mergedSettings;
};

/**
 * The main dashboard page component.
 *
 * @since 3.19.0
 */
export const DashboardPage = (): React.JSX.Element => {
	const [ currentPage, setCurrentPage ] = useState<number>( 1 );
	return (
		<SettingsProvider
			endpoint="traffic-boost"
			defaultSettings={ getSettingsFromJson( window.wpParselyContentHelperSettings ) }
		>
			<VerifyCredentials>
				<PageContainer name="dashboard">
					<DashboardHeader />
					<PageBody>
						<DashboardHeading>{ __( 'Recent Posts', 'wp-parsely' ) } </DashboardHeading>
						<p>
							{ __(
								'Here’s what you’ve published lately. Let’s see if we can improve its performance!',
								'wp-parsely'
							) }
						</p>
						<PostsTable
							currentPage={ currentPage }
							setCurrentPage={ setCurrentPage }
							query={ {
								status: 'publish',
								per_page: 5,
							} }
						/>
					</PageBody>
				</PageContainer>
			</VerifyCredentials>
		</SettingsProvider>
	);
};
