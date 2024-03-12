/**
 * WordPress dependencies
 */
import {
	Panel,
	TabPanel,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { PluginSidebar } from '@wordpress/edit-post';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chartBar as ChartIcon } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../js/telemetry/telemetry';
import { EditIcon } from '../common/icons/edit-icon';
import { LeafIcon } from '../common/icons/leaf-icon';
import {
	SettingsProvider,
	SidebarSettings,
	useSettings,
} from '../common/settings';
import {
	Metric,
	Period,
	PostFilterType,
	isInEnum,
} from '../common/utils/constants';
import {
	DEFAULT_MAX_LINKS,
	DEFAULT_MAX_LINK_WORDS,
	initSmartLinking,
} from './smart-linking/smart-linking';
import { SidebarPerformanceTab } from './tabs/sidebar-performance-tab';
import { SidebarToolsTab } from './tabs/sidebar-tools-tab';

const BLOCK_PLUGIN_ID = 'wp-parsely-block-editor-sidebar';

export type OnSettingChangeFunction = ( key: keyof SidebarSettings, value: string | boolean | number ) => void;

/**
 * Defines the data structure exposed by the Sidebar about the currently opened
 * Post.
 *
 * @since 3.11.0
 */
export interface SidebarPostData {
	authors: string[];
	categories: string[];
	tags: string[];
}

/**
 * Gets the settings from the passed JSON.
 *
 * If missing settings or invalid values are detected, they get set to their
 * defaults. This function prevents crashes when settings cannot be fetched or
 * they happen to be corrupt.
 *
 * @since 3.13.0
 *
 * @param {string} settingsJson The JSON containing the settings.
 *
 * @return {SidebarSettings} The resulting settings object.
 */
export const getSettingsFromJson = ( settingsJson: string = '' ): SidebarSettings => {
	// Default settings object.
	const defaultSettings: SidebarSettings = {
		InitialTabName: 'tools',
		PerformanceStatsSettings: {
			Period: Period.Days7,
			VisiblePanels: [ 'overview', 'categories', 'referrers' ],
			VisibleDataPoints: [ 'views', 'visitors', 'avgEngaged', 'recirculation' ],
		},
		RelatedPostsFilterBy: PostFilterType.Unavailable,
		RelatedPostsFilterValue: '',
		RelatedPostsMetric: Metric.Views,
		RelatedPostsOpen: false,
		RelatedPostsPeriod: Period.Days7,
		SmartLinkingMaxLinks: DEFAULT_MAX_LINKS,
		SmartLinkingMaxLinkWords: DEFAULT_MAX_LINK_WORDS,
		SmartLinkingOpen: false,
		TitleSuggestionsSettings: {
			Open: false,
			Tone: 'neutral',
			Persona: 'journalist',
		},
	};

	// If the settings are empty, try to get them from the global variable.
	if ( '' === settingsJson ) {
		settingsJson = window.wpParselyContentHelperSettings;
	}

	let parsedSettings: SidebarSettings;
	try {
		parsedSettings = JSON.parse( settingsJson );
	} catch ( e ) {
		// Return defaults when parsing failed or the string is empty.
		return defaultSettings;
	}

	// Merge parsed settings with default settings.
	const mergedSettings = { ...defaultSettings, ...parsedSettings };

	// Fix invalid values if any are found.
	if ( typeof mergedSettings.InitialTabName !== 'string' ) {
		mergedSettings.InitialTabName = defaultSettings.InitialTabName;
	}
	if ( typeof mergedSettings.PerformanceStatsSettings !== 'object' ) {
		mergedSettings.PerformanceStatsSettings = defaultSettings.PerformanceStatsSettings;
	}
	if ( ! isInEnum( mergedSettings.PerformanceStatsSettings.Period, Period ) ) {
		mergedSettings.PerformanceStatsSettings.Period = defaultSettings.PerformanceStatsSettings.Period;
	}
	if ( ! Array.isArray( mergedSettings.PerformanceStatsSettings.VisiblePanels ) ) {
		mergedSettings.PerformanceStatsSettings.VisiblePanels = defaultSettings.PerformanceStatsSettings.VisiblePanels;
	}
	if ( ! Array.isArray( mergedSettings.PerformanceStatsSettings.VisibleDataPoints ) ) {
		mergedSettings.PerformanceStatsSettings.VisibleDataPoints = defaultSettings.PerformanceStatsSettings.VisibleDataPoints;
	}
	if ( ! isInEnum( mergedSettings.RelatedPostsFilterBy, PostFilterType ) ) {
		mergedSettings.RelatedPostsFilterBy = defaultSettings.RelatedPostsFilterBy;
	}
	if ( typeof mergedSettings.RelatedPostsFilterValue !== 'string' ) {
		mergedSettings.RelatedPostsFilterValue = defaultSettings.RelatedPostsFilterValue;
	}
	if ( ! isInEnum( mergedSettings.RelatedPostsMetric, Metric ) ) {
		mergedSettings.RelatedPostsMetric = defaultSettings.RelatedPostsMetric;
	}
	if ( typeof mergedSettings.RelatedPostsOpen !== 'boolean' ) {
		mergedSettings.RelatedPostsOpen = defaultSettings.RelatedPostsOpen;
	}
	if ( ! isInEnum( mergedSettings.RelatedPostsPeriod, Period ) ) {
		mergedSettings.RelatedPostsPeriod = defaultSettings.RelatedPostsPeriod;
	}
	if ( typeof mergedSettings.SmartLinkingMaxLinks !== 'number' ) {
		mergedSettings.SmartLinkingMaxLinks = defaultSettings.SmartLinkingMaxLinks;
	}
	if ( typeof mergedSettings.SmartLinkingMaxLinkWords !== 'number' ) {
		mergedSettings.SmartLinkingMaxLinkWords = defaultSettings.SmartLinkingMaxLinkWords;
	}
	if ( typeof mergedSettings.SmartLinkingOpen !== 'boolean' ) {
		mergedSettings.SmartLinkingOpen = defaultSettings.SmartLinkingOpen;
	}
	if ( typeof mergedSettings.TitleSuggestionsSettings !== 'object' ) {
		mergedSettings.TitleSuggestionsSettings = defaultSettings.TitleSuggestionsSettings;
	}
	if ( typeof mergedSettings.TitleSuggestionsSettings.Open !== 'boolean' ) {
		mergedSettings.TitleSuggestionsSettings.Open = defaultSettings.TitleSuggestionsSettings.Open;
	}
	if ( typeof mergedSettings.TitleSuggestionsSettings.Tone !== 'string' ) {
		mergedSettings.TitleSuggestionsSettings.Tone = defaultSettings.TitleSuggestionsSettings.Tone;
	}
	if ( typeof mergedSettings.TitleSuggestionsSettings.Persona !== 'string' ) {
		mergedSettings.TitleSuggestionsSettings.Persona = defaultSettings.TitleSuggestionsSettings.Persona;
	}

	return mergedSettings;
};

/**
 * Returns the Content Helper Editor Sidebar.
 *
 * @since 3.4.0
 *
 * @return {JSX.Element} The Content Helper Editor Sidebar.
 */
const ContentHelperEditorSidebar = (): JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();

	/**
	 * Track sidebar opening.
	 *
	 * @since 3.12.0
	 */
	const activeComplementaryArea = useSelect( ( select ) => {
		// @ts-ignore getActiveComplementaryArea exists in the interface store.
		return select( 'core/interface' ).getActiveComplementaryArea( 'core/edit-post' );
	}, [ ] );

	useEffect( () => {
		if ( activeComplementaryArea === 'wp-parsely-block-editor-sidebar/wp-parsely-content-helper' ) {
			Telemetry.trackEvent( 'editor_sidebar_opened' );
		}
	}, [ activeComplementaryArea ] );

	/**
	 * Track sidebar panel opening and closing.
	 *
	 * @since 3.12.0
	 *
	 * @param {string}  panel The panel name.
	 * @param {boolean} next  Whether the panel is open or closed.
	 */
	const trackToggle = ( panel: string, next: boolean ): void => {
		if ( next ) {
			Telemetry.trackEvent( 'editor_sidebar_panel_opened', { panel } );
		} else {
			Telemetry.trackEvent( 'editor_sidebar_panel_closed', { panel } );
		}
	};

	return (
		<PluginSidebar icon={ <LeafIcon className="wp-parsely-sidebar-icon" /> }
			name="wp-parsely-content-helper"
			className="wp-parsely-content-helper"
			title={ __( 'Parse.ly', 'wp-parsely' ) }
		>
			<SettingsProvider
				endpoint="editor-sidebar-settings"
				defaultSettings={ getSettingsFromJson() }
			>
				<Panel className="wp-parsely-sidebar-main-panel">
					<TabPanel
						className="wp-parsely-sidebar-tabs"
						initialTabName={ settings.InitialTabName }
						tabs={ [
							{
								icon: <EditIcon />,
								name: 'tools',
								title: __( 'Tools', 'wp-parsely' ),
							},
							{
								icon: ChartIcon,
								name: 'performance',
								title: __( 'Performance', 'wp-parsely' ),
							},
						] }
						onSelect={ ( tabName ) => {
							setSettings( { ...settings, InitialTabName: tabName } );
							Telemetry.trackEvent( 'editor_sidebar_tab_selected', { tab: tabName } );
						} }
					>
						{ ( tab ) => (
							<>
								{ tab.name === 'tools' && (
									<SidebarToolsTab trackToggle={ trackToggle } />
								) }
								{ tab.name === 'performance' && (
									<SidebarPerformanceTab
										period={ settings.PerformanceStatsSettings.Period }
									/>
								) }
							</>
						) }
					</TabPanel>
				</Panel>
			</SettingsProvider>
		</PluginSidebar>
	);
};

// Registering Plugin to WordPress Block Editor.
registerPlugin( BLOCK_PLUGIN_ID, {
	icon: LeafIcon,
	render: () => (
		<SettingsProvider
			endpoint="editor-sidebar-settings"
			defaultSettings={ getSettingsFromJson() }
		>
			<ContentHelperEditorSidebar />
		</SettingsProvider>
	),
} );

// Initialize Smart Linking.
initSmartLinking();
