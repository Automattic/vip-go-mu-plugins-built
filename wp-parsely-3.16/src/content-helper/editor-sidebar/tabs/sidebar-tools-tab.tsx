/**
 * WordPress dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SidebarSettings, useSettings } from '../../common/settings';
import { ContentHelperPermissions } from '../../common/utils/permissions';
import { VerifyCredentials } from '../../common/verify-credentials';
import { RelatedPostsPanel } from '../related-posts/component';
import { SmartLinkingPanel, SmartLinkingPanelContext } from '../smart-linking/component';
import { TitleSuggestionsPanel } from '../title-suggestions/component';

/**
 * SidebarToolsTab component props.
 *
 * @since 3.14.0
 */
type SidebarToolsTabProps = {
	trackToggle: ( panel: string, next: boolean ) => void
	permissions: ContentHelperPermissions;
}

/**
 * SidebarToolsTab component.
 * Renders the Tools tab in the Content Helper sidebar.
 *
 * @since 3.14.0
 *
 * @param {SidebarToolsTabProps} props The component's props.
 */
export const SidebarToolsTab = (
	{ trackToggle, permissions }: Readonly<SidebarToolsTabProps>
): React.JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();

	return (
		<Panel>
			{ permissions.TitleSuggestions &&
				<PanelBody
					title={ __( 'Title Suggestions (Beta)', 'wp-parsely' ) }
					initialOpen={ settings.TitleSuggestions.Open }
					onToggle={ ( next ) => {
						setSettings( {
							TitleSuggestions: {
								...settings.TitleSuggestions,
								Open: next,
							},
						} );
						trackToggle( 'title_suggestions', next );
					} }
				>
					<VerifyCredentials>
						<TitleSuggestionsPanel />
					</VerifyCredentials>
				</PanelBody>
			}

			{ permissions.SmartLinking &&
				<PanelBody
					title={ __( 'Smart Linking (Beta)', 'wp-parsely' ) }
					initialOpen={ settings.SmartLinking.Open }
					onToggle={ ( next ) => {
						setSettings( {
							SmartLinking: {
								...settings.SmartLinking,
								Open: next,
							},
						} );
						trackToggle( 'smart_linking', next );
					} }
				>
					<VerifyCredentials>
						<SmartLinkingPanel
							context={ SmartLinkingPanelContext.ContentHelperSidebar }
							permissions={ permissions }
						/>
					</VerifyCredentials>
				</PanelBody>
			}

			<PanelBody
				title={ __( 'Related Posts', 'wp-parsely' ) }
				initialOpen={ settings.RelatedPosts.Open }
				onToggle={ ( next ) => {
					setSettings( {
						RelatedPosts: {
							...settings.RelatedPosts,
							Open: next,
						},
					} );
					trackToggle( 'related_top_posts', next );
				} }
			>
				{
					<VerifyCredentials>
						<RelatedPostsPanel />
					</VerifyCredentials>
				}
			</PanelBody>
		</Panel>
	);
};
