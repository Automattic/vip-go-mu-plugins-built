/**
 * WordPress dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { PluginSidebar } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { LeafIcon } from '../common/icons/leaf-icon';
import { VerifyCredentials } from '../common/verify-credentials';
import { PerformanceDetails } from './performance-details/component';
import { RelatedTopPostList } from './related-top-posts/component-list';

const BLOCK_PLUGIN_ID = 'wp-parsely-block-editor-sidebar';

const renderSidebar = () => (
	<PluginSidebar icon={ <LeafIcon /> } name="wp-parsely-content-helper" className="wp-parsely-content-helper" title={ __( 'Parse.ly Editor Sidebar', 'wp-parsely' ) }>
		<Panel>
			<PanelBody title={ __( 'Performance Details', 'wp-parsely' ) } initialOpen={ true }>
				{
					<VerifyCredentials>
						<PerformanceDetails />
					</VerifyCredentials>
				}
			</PanelBody>
		</Panel>
		<Panel>
			<PanelBody title={ __( 'Related Top Posts', 'wp-parsely' ) } initialOpen={ false }>
				{
					<VerifyCredentials>
						<RelatedTopPostList />
					</VerifyCredentials>
				}
			</PanelBody>
		</Panel>
	</PluginSidebar>
);

// Registering Plugin to WordPress Block Editor.
registerPlugin( BLOCK_PLUGIN_ID, {
	icon: LeafIcon,
	render: renderSidebar,
} );
