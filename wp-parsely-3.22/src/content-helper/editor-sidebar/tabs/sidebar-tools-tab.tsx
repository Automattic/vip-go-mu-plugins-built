/**
 * WordPress dependencies
 */
import { Button, Icon, Panel, PanelBody } from '@wordpress/components';
import { PostTypeSupportCheck } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useSelect } from '@wordpress/data';
import { external } from '@wordpress/icons';
import { GutenbergFunction } from '../../../@types/gutenberg/types';
import { SidebarSettings, useSettings } from '../../common/settings';
import { ContentHelperPermissions } from '../../common/utils/permissions';
import { VerifyCredentials } from '../../common/verify-credentials';
import { PostExcerptSuggestions } from '../excerpt-suggestions/component-panel';
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
 * Renders the Tools tab in the Content Intelligence sidebar.
 *
 * @since 3.14.0
 *
 * @param {SidebarToolsTabProps} props The component's props.
 */
export const SidebarToolsTab = (
	{ trackToggle, permissions }: Readonly<SidebarToolsTabProps>
): React.JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();

	const { postId, postStatus } = useSelect( ( select ) => {
		const { getCurrentPostId, getEditedPostAttribute } =
			select( 'core/editor' ) as GutenbergFunction;

		return {
			postId: getCurrentPostId() ?? 0,
			postStatus: getEditedPostAttribute( 'status' ) ?? 'draft',
		};
	}, [] );

	const trackableStatuses = window.wpParselyTrackableStatuses ?? [ 'publish' ];
	const isPostTrackable = trackableStatuses.includes( postStatus );

	return (
		<Panel>
			{ permissions.TitleSuggestions &&
				<PanelBody
					title={ __( 'Title Suggestions', 'wp-parsely' ) }
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

			{
				permissions.ExcerptSuggestions &&
				<PostTypeSupportCheck supportKeys="excerpt">
					<PanelBody
						title={ __( 'Excerpt Suggestions', 'wp-parsely' ) }
						initialOpen={ settings.ExcerptSuggestions.Open }
						onToggle={ ( next ) => {
							setSettings( {
								ExcerptSuggestions: {
									...settings.ExcerptSuggestions,
									Open: next,
								},
							} );
							trackToggle( 'excerpt_suggestions', next );
						} }
					>
						<VerifyCredentials>
							<PostExcerptSuggestions />
						</VerifyCredentials>
					</PanelBody>
				</PostTypeSupportCheck>
			}

			{ permissions.SmartLinking &&
				<PanelBody
					title={ __( 'Smart Linking', 'wp-parsely' ) }
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

			{ postId > 0 && isPostTrackable && permissions.TrafficBoost &&
				<Button
					className="boost-engagement"
					href={ `/wp-admin/admin.php?page=parsely-dashboard-page#/engagement-boost/${ postId }` }
					rel="noopener"
					target="_blank"
					variant="secondary"
				>
					{ __( 'Boost Engagement', 'wp-parsely' ) }
					<Icon icon={ external } size={ 18 } className="parsely-external-link-icon" />
				</Button>
			}
		</Panel>
	);
};
