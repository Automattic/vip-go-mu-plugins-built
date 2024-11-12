/**
 * WordPress dependencies
 */
import {
	Panel,
	TabPanel,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { PluginSidebar } from '../../@types/gutenberg/wrapper';
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
import { getContentHelperPermissions } from '../common/utils/permissions';
import { initExcerptSuggestions } from './excerpt-suggestions/excerpt-suggestions';
import {
	DEFAULT_MAX_LINKS,
	initSmartLinking,
} from './smart-linking/smart-linking';
import { SidebarPerformanceTab } from './tabs/sidebar-performance-tab';
import { SidebarToolsTab } from './tabs/sidebar-tools-tab';

const BLOCK_PLUGIN_ID = 'wp-parsely-block-editor-sidebar';
export { BLOCK_PLUGIN_ID as PARSELY_SIDEBAR_PLUGIN_ID };

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
		PerformanceStats: {
			Period: Period.Days7,
			VisiblePanels: [ 'overview', 'categories', 'referrers' ],
			VisibleDataPoints: [ 'views', 'visitors', 'avgEngaged', 'recirculation' ],
		},
		RelatedPosts: {
			FilterBy: PostFilterType.Unavailable,
			FilterValue: '',
			Metric: Metric.Views,
			Open: false,
			Period: Period.Days7,
		},
		SmartLinking: {
			MaxLinks: DEFAULT_MAX_LINKS,
			Open: false,
		},
		TitleSuggestions: {
			Open: false,
			Tone: 'neutral',
			Persona: 'journalist',
		},
		ExcerptSuggestions: {
			Open: false,
			Persona: 'journalist',
			Tone: 'neutral',
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
	if ( typeof mergedSettings.PerformanceStats !== 'object' ) {
		mergedSettings.PerformanceStats = defaultSettings.PerformanceStats;
	}
	if ( ! isInEnum( mergedSettings.PerformanceStats.Period, Period ) ) {
		mergedSettings.PerformanceStats.Period = defaultSettings.PerformanceStats.Period;
	}
	if ( ! Array.isArray( mergedSettings.PerformanceStats.VisiblePanels ) ) {
		mergedSettings.PerformanceStats.VisiblePanels = defaultSettings.PerformanceStats.VisiblePanels;
	}
	if ( ! Array.isArray( mergedSettings.PerformanceStats.VisibleDataPoints ) ) {
		mergedSettings.PerformanceStats.VisibleDataPoints = defaultSettings.PerformanceStats.VisibleDataPoints;
	}
	if ( typeof mergedSettings.RelatedPosts !== 'object' ) {
		mergedSettings.RelatedPosts = defaultSettings.RelatedPosts;
	}
	if ( ! isInEnum( mergedSettings.RelatedPosts.FilterBy, PostFilterType ) ) {
		mergedSettings.RelatedPosts.FilterBy = defaultSettings.RelatedPosts.FilterBy;
	}
	if ( typeof mergedSettings.RelatedPosts.FilterValue !== 'string' ) {
		mergedSettings.RelatedPosts.FilterValue = defaultSettings.RelatedPosts.FilterValue;
	}
	if ( ! isInEnum( mergedSettings.RelatedPosts.Metric, Metric ) ) {
		mergedSettings.RelatedPosts.Metric = defaultSettings.RelatedPosts.Metric;
	}
	if ( typeof mergedSettings.RelatedPosts.Open !== 'boolean' ) {
		mergedSettings.RelatedPosts.Open = defaultSettings.RelatedPosts.Open;
	}
	if ( ! isInEnum( mergedSettings.RelatedPosts.Period, Period ) ) {
		mergedSettings.RelatedPosts.Period = defaultSettings.RelatedPosts.Period;
	}
	if ( typeof mergedSettings.SmartLinking !== 'object' ) {
		mergedSettings.SmartLinking = defaultSettings.SmartLinking;
	}
	if ( typeof mergedSettings.SmartLinking.MaxLinks !== 'number' ) {
		mergedSettings.SmartLinking.MaxLinks = defaultSettings.SmartLinking.MaxLinks;
	}
	if ( typeof mergedSettings.SmartLinking.Open !== 'boolean' ) {
		mergedSettings.SmartLinking.Open = defaultSettings.SmartLinking.Open;
	}
	if ( typeof mergedSettings.TitleSuggestions !== 'object' ) {
		mergedSettings.TitleSuggestions = defaultSettings.TitleSuggestions;
	}
	if ( typeof mergedSettings.TitleSuggestions.Open !== 'boolean' ) {
		mergedSettings.TitleSuggestions.Open = defaultSettings.TitleSuggestions.Open;
	}
	if ( typeof mergedSettings.TitleSuggestions.Tone !== 'string' ) {
		mergedSettings.TitleSuggestions.Tone = defaultSettings.TitleSuggestions.Tone;
	}
	if ( typeof mergedSettings.TitleSuggestions.Persona !== 'string' ) {
		mergedSettings.TitleSuggestions.Persona = defaultSettings.TitleSuggestions.Persona;
	}
	if ( typeof mergedSettings.ExcerptSuggestions !== 'object' ) {
		mergedSettings.ExcerptSuggestions = defaultSettings.ExcerptSuggestions;
	}
	if ( typeof mergedSettings.ExcerptSuggestions.Open !== 'boolean' ) {
		mergedSettings.ExcerptSuggestions.Open = defaultSettings.ExcerptSuggestions.Open;
	}
	if ( typeof mergedSettings.ExcerptSuggestions.Tone !== 'string' ) {
		mergedSettings.ExcerptSuggestions.Tone = defaultSettings.ExcerptSuggestions.Tone;
	}
	if ( typeof mergedSettings.ExcerptSuggestions.Persona !== 'string' ) {
		mergedSettings.ExcerptSuggestions.Persona = defaultSettings.ExcerptSuggestions.Persona;
	}

	return mergedSettings;
};

/**
 * Returns the Content Helper Editor Sidebar.
 *
 * @since 3.4.0
 *
 * @return {import('react').JSX.Element} The Content Helper Editor Sidebar.
 */
const ContentHelperEditorSidebar = (): React.JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();
	const permissions = getContentHelperPermissions();

	/**
	 * Track sidebar opening.
	 *
	 * @since 3.12.0
	 */
	const activeComplementaryArea = useSelect( ( select ) => {
		// By checking for the PluginSidebar, we can determine if the new unified editor is being used, and that the
		// WordPress version is 6.6 or higher.
		if ( window.wp.editor?.PluginSidebar ) {
			// @ts-ignore getActiveComplementaryArea exists in the interface store.
			return select( 'core/interface' ).getActiveComplementaryArea( 'core' );
		}

		// Fallback for WordPress <= 6.5.
		// See https://make.wordpress.org/core/2024/03/05/unification-of-the-site-and-post-editors-in-6-5/
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
				endpoint="editor-sidebar"
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
									<SidebarToolsTab
										permissions={ permissions }
										trackToggle={ trackToggle }
									/>
								) }
								{ tab.name === 'performance' && (
									<SidebarPerformanceTab
										period={ settings.PerformanceStats.Period }
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

// Initialize Excerpt Suggestions.
if ( initExcerptSuggestions ) {
	initExcerptSuggestions();
}

// Registering Plugin to WordPress Block Editor.
registerPlugin( BLOCK_PLUGIN_ID, {
	icon: LeafIcon,
	render: () => (
		<SettingsProvider
			endpoint="editor-sidebar"
			defaultSettings={ getSettingsFromJson() }
		>
			<ContentHelperEditorSidebar />
		</SettingsProvider>
	),
} );

// Initialize Smart Linking.
domReady( () => {
	if ( initSmartLinking ) {
		initSmartLinking();
	}
} );
