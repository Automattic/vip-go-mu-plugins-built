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
import { LeafIcon } from '../common/icons/leaf-icon';
import {
	Metric,
	Period,
	getMetricDescription,
	getPeriodDescription,
	isInEnum,
} from '../common/utils/constants';
import { VerifyCredentials } from '../common/verify-credentials';
import { PerformanceDetails } from './performance-details/component';
import { RelatedTopPostList } from './related-top-posts/component-list';
import { Telemetry } from '../../js/telemetry/telemetry';
import { TitleSuggestionsPanel } from './title-suggestions/component';

const BLOCK_PLUGIN_ID = 'wp-parsely-block-editor-sidebar';

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
 * Returns the Content Helper Editor Sidebar.
 *
 * @since 3.4.0
 *
 * @return {JSX.Element} The Content Helper Editor Sidebar.
 */
const ContentHelperEditorSidebar = (): JSX.Element => {
	const [ period, setPeriod ] = useState<Period>( Period.Days7 );
	const [ metric, setMetric ] = useState<Metric>( Metric.Views );
	const [ postData, setPostData ] = useState<SidebarPostData>( {
		authors: [], categories: [], tags: [],
	} );

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
							setPeriod( selection as Period );
							trackSettingsChange( 'period', { period: selection } );
						}
					} }
					value={ period }
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
							setMetric( selection as Metric );
							trackSettingsChange( 'metric', { metric: selection } );
						}
					} }
					value={ metric }
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
					initialOpen={ true }
					onToggle={ ( next ) => trackToggle( 'settings', next ) }
				>
					<Settings />
				</PanelBody>
			</Panel>
			<Panel>
				<PanelBody
					title={ __( 'Performance Details', 'wp-parsely' ) }
					initialOpen={ true }
					onToggle={ ( next ) => trackToggle( 'performance_details', next ) }
				>
					{
						<VerifyCredentials>
							<PerformanceDetails period={ period } />
						</VerifyCredentials>
					}
				</PanelBody>
			</Panel>
			<Panel>
				<PanelBody
					title={ __( 'Related Top Posts', 'wp-parsely' ) }
					initialOpen={ false }
					onToggle={ ( next ) => trackToggle( 'related_top_posts', next ) }
				>
					{
						<VerifyCredentials>
							<RelatedTopPostList
								period={ period }
								metric={ metric }
								postData={ postData }
							/>
						</VerifyCredentials>
					}
				</PanelBody>
			</Panel>
			<Panel>
				<PanelBody
					title={ __( 'Title Suggestions (Beta)', 'wp-parsely' ) }
					initialOpen={ false }
					onToggle={ ( next ) => trackToggle( 'title_suggestions', next ) }
				>
					{
						<VerifyCredentials>
							<TitleSuggestionsPanel />
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
