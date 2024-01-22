/**
 * WordPress dependencies
 */
import { Panel, PanelBody, SelectControl } from '@wordpress/components';
// eslint-disable-next-line import/named
import { Taxonomy, User, store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { PluginSidebar } from '@wordpress/edit-post';
import { store as editorStore } from '@wordpress/editor';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../js/telemetry/telemetry';
import { BetaBadge } from '../common/components/beta-badge';
import { PARSELY_PERSONAS } from '../common/components/persona-selector';
import { PARSELY_TONES } from '../common/components/tone-selector';
import { useSaveSettings } from '../common/hooks/useSaveSettings';
import { LeafIcon } from '../common/icons/leaf-icon';
import {
	Metric,
	Period,
	PostFilterType,
	getMetricDescription,
	getPeriodDescription,
	isInEnum,
} from '../common/utils/constants';
import { VerifyCredentials } from '../common/verify-credentials';
import { PerformanceDetails } from './performance-details/component';
import { RelatedTopPostList } from './related-top-posts/component-list';
import { TitleSuggestionsPanel } from './title-suggestions/component';

const BLOCK_PLUGIN_ID = 'wp-parsely-block-editor-sidebar';

/**
 * Defines the settings structure for the ContentHelperEditorSidebar component.
 *
 * @since 3.13.0
 */
export interface SidebarSettings {
	PerformanceDetailsOpen: boolean;
	RelatedTopPostsFilterBy: string;
	RelatedTopPostsFilterValue: string;
	RelatedTopPostsOpen: boolean;
	SettingsMetric: Metric;
	SettingsOpen: boolean;
	SettingsPeriod: Period;
	TitleSuggestionsOpen: boolean;
	TitleSuggestionsPersona: string;
	TitleSuggestionsSettingsOpen: boolean;
	TitleSuggestionsTone: string;
}

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
 * Defines typings for some non-exported Gutenberg functions to avoid
 * intellisense errors in function calls.
 *
 * This can be removed once Gutenberg provides typings for these functions.
 *
 * @since 3.11.0
 */
interface GutenbergFunction {
	getEditedPostAttribute( attribute: string ): number[];
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
const getSettingsFromJson = ( settingsJson: string ): SidebarSettings => {
	let parsedSettings: SidebarSettings;

	try {
		parsedSettings = JSON.parse( settingsJson );
	} catch ( e ) {
		// Return defaults when parsing failed or the string is empty.
		return {
			PerformanceDetailsOpen: true,
			RelatedTopPostsFilterBy: PostFilterType.Unavailable,
			RelatedTopPostsFilterValue: '',
			RelatedTopPostsOpen: false,
			SettingsMetric: Metric.Views,
			SettingsOpen: true,
			SettingsPeriod: Period.Days7,
			TitleSuggestionsOpen: false,
			TitleSuggestionsPersona: PARSELY_PERSONAS.journalist.label,
			TitleSuggestionsSettingsOpen: false,
			TitleSuggestionsTone: PARSELY_TONES.neutral.label,
		};
	}

	// Fix invalid values if any are found.
	if ( typeof parsedSettings?.PerformanceDetailsOpen !== 'boolean' ) {
		parsedSettings.PerformanceDetailsOpen = true;
	}
	if ( ! isInEnum( parsedSettings?.RelatedTopPostsFilterBy, PostFilterType ) ) {
		parsedSettings.RelatedTopPostsFilterBy = PostFilterType.Unavailable;
	}
	if ( typeof parsedSettings?.RelatedTopPostsFilterValue !== 'string' ) {
		parsedSettings.RelatedTopPostsFilterValue = '';
	}
	if ( typeof parsedSettings?.RelatedTopPostsOpen !== 'boolean' ) {
		parsedSettings.RelatedTopPostsOpen = false;
	}
	if ( ! isInEnum( parsedSettings?.SettingsMetric, Metric ) ) {
		parsedSettings.SettingsMetric = Metric.Views;
	}
	if ( typeof parsedSettings?.SettingsOpen !== 'boolean' ) {
		parsedSettings.SettingsOpen = true;
	}
	if ( ! isInEnum( parsedSettings?.SettingsPeriod, Period ) ) {
		parsedSettings.SettingsPeriod = Period.Days7;
	}
	if ( typeof parsedSettings?.TitleSuggestionsOpen !== 'boolean' ) {
		parsedSettings.TitleSuggestionsOpen = false;
	}
	if ( typeof parsedSettings?.TitleSuggestionsPersona !== 'string' ) {
		parsedSettings.TitleSuggestionsPersona = PARSELY_PERSONAS.journalist.label;
	}
	if ( typeof parsedSettings?.TitleSuggestionsSettingsOpen !== 'boolean' ) {
		parsedSettings.TitleSuggestionsSettingsOpen = false;
	}
	if ( typeof parsedSettings?.TitleSuggestionsTone !== 'string' ) {
		parsedSettings.TitleSuggestionsTone = PARSELY_TONES.neutral.label;
	}

	return parsedSettings;
};

/**
 * Returns the Content Helper Editor Sidebar.
 *
 * @since 3.4.0
 *
 * @return {JSX.Element} The Content Helper Editor Sidebar.
 */
const ContentHelperEditorSidebar = (): JSX.Element => {
	const [ settings, setSettings ] = useState<SidebarSettings>(
		getSettingsFromJson( window.wpParselyContentHelperSettings )
	);
	const [ postData, setPostData ] = useState<SidebarPostData>( {
		authors: [], categories: [], tags: [],
	} );

	/**
	 * Updates all filter settings.
	 *
	 * @since 3.13.0
	 *
	 * @param {PostFilterType} filter The new filter type.
	 * @param {string}         value  The new filter value.
	 */
	const handleRelatedTopPostsFilterChange = (
		filter: PostFilterType, value: string
	): void => {
		setSettings( {
			...settings,
			RelatedTopPostsFilterBy: filter,
			RelatedTopPostsFilterValue: value,
		} );
	};

	/**
	 * Updates the passed setting.
	 *
	 * @since 3.13.0
	 *
	 * @param {keyof SidebarSettings} setting The setting to be updated.
	 * @param {string|boolean}        value   The new settings value.
	 */
	const handleSettingChange = (
		setting: keyof SidebarSettings, value: string|boolean
	): void => {
		setSettings( { ...settings, [ setting ]: value } );
	};

	/**
	 * Returns the current Post's ID, tags and categories.
	 *
	 * @since 3.11.0
	 */
	const { authors, categories, tags } = useSelect( ( select ) => {
		const { getEditedPostAttribute } = select( editorStore ) as GutenbergFunction;
		const { getEntityRecords } = select( coreStore );

		const authorRecords: User[] | null = getEntityRecords(
			'root', 'user', { include: getEditedPostAttribute( 'author' ) }
		);

		const categoryRecords: Taxonomy[] | null = getEntityRecords(
			'taxonomy', 'category', { include: getEditedPostAttribute( 'categories' ) }
		);

		const tagRecords: Taxonomy[]|null = getEntityRecords(
			'taxonomy', 'post_tag', { include: getEditedPostAttribute( 'tags' ) }
		);

		return {
			authors: authorRecords,
			categories: categoryRecords,
			tags: tagRecords,
		};
	}, [] );

	/**
	 * Returns the current Post's tag names.
	 *
	 * @since 3.11.0
	 */
	const tagNames = useMemo( () => {
		return tags ? tags.map( ( t ) => t.name ) : [];
	}, [ tags ] );

	/**
	 * Returns the current Post's category names.
	 *
	 * @since 3.11.0
	 */
	const categoryNames = useMemo( () => {
		return categories ? categories.map( ( c ) => c.name ) : [];
	}, [ categories ] );

	/**
	 * Returns the current Post's author names.
	 *
	 * @since 3.11.0
	 */
	const authorNames = useMemo( () => {
		return authors ? authors.map( ( a ) => a.name ) : [];
	}, [ authors ] );

	/**
	 * Saves the settings into the WordPress database whenever a setting change
	 * occurs.
	 *
	 * @since 3.13.0
	 */
	useSaveSettings( 'editor-sidebar-settings', settings );

	useEffect( () => {
		setPostData( {
			authors: authorNames,
			tags: tagNames,
			categories: categoryNames,
		} );
	}, [ authorNames, tagNames, categoryNames ] );

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

	/**
	 * Track sidebar settings change.
	 *
	 * @since 3.12.0
	 *
	 * @param {string} filter The filter name.
	 * @param {Object} props  The filter properties.
	 */
	const trackSettingsChange = ( filter: string, props: object ): void => {
		Telemetry.trackEvent( 'editor_sidebar_settings_changed', { filter, ...props } );
	};

	/**
	 * Returns the settings pane of the Content Helper Sidebar.
	 *
	 * @since 3.11.0
	 *
	 * @return {JSX.Element} The settings pane of the Content Helper Sidebar.
	 */
	const Settings = (): JSX.Element => {
		return (
			<>
				<SelectControl
					label={ __( 'Period', 'wp-parsely' ) }
					onChange={ ( selection ) => {
						if ( isInEnum( selection, Period ) ) {
							setSettings( {
								...settings,
								SettingsPeriod: selection as Period,
							} );
							trackSettingsChange( 'period', { period: selection } );
						}
					} }
					value={ settings.SettingsPeriod }
				>
					{
						Object.values( Period ).map( ( value ) =>
							<option key={ value } value={ value }>
								{ getPeriodDescription( value ) }
							</option>
						)
					}
				</SelectControl>
				<SelectControl
					label={ __( 'Metric', 'wp-parsely' ) }
					onChange={ ( selection ) => {
						if ( isInEnum( selection, Metric ) ) {
							setSettings( {
								...settings,
								SettingsMetric: selection as Metric,
							} );
							trackSettingsChange( 'metric', { metric: selection } );
						}
					} }
					value={ settings.SettingsMetric }
				>
					{
						Object.values( Metric ).map( ( value ) =>
							<option key={ value } value={ value }>
								{ getMetricDescription( value ) }
							</option>
						)
					}
				</SelectControl>
			</>
		);
	};

	return (
		<PluginSidebar icon={ <LeafIcon /> }
			name="wp-parsely-content-helper"
			className="wp-parsely-content-helper"
			title={ __( 'Parse.ly Editor Sidebar', 'wp-parsely' ) }
		>
			<Panel>
				<PanelBody
					title={ __( 'Settings', 'wp-parsely' ) }
					initialOpen={ settings.SettingsOpen }
					onToggle={ ( next ) => {
						setSettings( { ...settings, SettingsOpen: next } );
						trackToggle( 'settings', next );
					} }
				>
					<Settings />
				</PanelBody>
			</Panel>
			<Panel>
				<PanelBody
					title={ __( 'Performance Details', 'wp-parsely' ) }
					initialOpen={ settings.PerformanceDetailsOpen }
					onToggle={ ( next ) => {
						setSettings( {
							...settings, PerformanceDetailsOpen: next,
						} );
						trackToggle( 'performance_details', next );
					} }
				>
					{
						<VerifyCredentials>
							<PerformanceDetails
								period={ settings.SettingsPeriod }
							/>
						</VerifyCredentials>
					}
				</PanelBody>
			</Panel>
			<Panel>
				<PanelBody
					title={ __( 'Related Top Posts', 'wp-parsely' ) }
					initialOpen={ settings.RelatedTopPostsOpen }
					onToggle={ ( next ) => {
						setSettings( {
							...settings, RelatedTopPostsOpen: next,
						} );
						trackToggle( 'related_top_posts', next );
					} }
				>
					{
						<VerifyCredentials>
							<RelatedTopPostList
								initialFilter={ {
									type: settings.RelatedTopPostsFilterBy as PostFilterType,
									value: settings.RelatedTopPostsFilterValue,
								} }
								metric={ settings.SettingsMetric }
								onFilterChange={ handleRelatedTopPostsFilterChange }
								period={ settings.SettingsPeriod }
								postData={ postData }
							/>
						</VerifyCredentials>
					}
				</PanelBody>
			</Panel>
			<Panel>
				<PanelBody
					icon={ <BetaBadge /> }
					title={ __( 'Title Suggestions', 'wp-parsely' ) }
					initialOpen={ settings.TitleSuggestionsOpen }
					onToggle={ ( next ) => {
						setSettings( {
							...settings, TitleSuggestionsOpen: next,
						} );
						trackToggle( 'title_suggestions', next );
					} }
				>
					{
						<VerifyCredentials>
							<TitleSuggestionsPanel
								initialPersona={ settings.TitleSuggestionsPersona }
								initialSettingsOpen={ settings.TitleSuggestionsSettingsOpen }
								initialTone={ settings.TitleSuggestionsTone }
								onSettingChange={ handleSettingChange }
							/>
						</VerifyCredentials>
					}
				</PanelBody>
			</Panel>
		</PluginSidebar>
	);
};

// Registering Plugin to WordPress Block Editor.
registerPlugin( BLOCK_PLUGIN_ID, {
	icon: LeafIcon,
	render: ContentHelperEditorSidebar,
} );
