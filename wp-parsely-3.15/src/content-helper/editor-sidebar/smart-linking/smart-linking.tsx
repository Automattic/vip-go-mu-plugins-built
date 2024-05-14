/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { compose, createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { __ } from '@wordpress/i18n';
import { Telemetry } from '../../../js/telemetry/telemetry';
import { LeafIcon } from '../../common/icons/leaf-icon';
import { SettingsProvider, SidebarSettings, useSettings } from '../../common/settings';
import { VerifyCredentials } from '../../common/verify-credentials';
import { getSettingsFromJson } from '../editor-sidebar';
import { SmartLinkingPanel, SmartLinkingPanelContext } from './component';
import { initBlockOverlay } from './component-block-overlay';
import './smart-linking.scss';

export const DEFAULT_MAX_LINKS = 10;

export const DEFAULT_MAX_LINK_WORDS = 4;

/**
 * Higher order component to add the settings provider to the block edit component.
 * This is required to provide the settings to the smart linking panel.
 *
 * @since 3.14.0
 */
const withSettingsProvider = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( props.name !== 'core/paragraph' ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<SettingsProvider
				endpoint="editor-sidebar-settings"
				defaultSettings={ getSettingsFromJson() }
			>
				<BlockEdit { ...props } />
			</SettingsProvider>
		);
	};
}, 'withSettingsProvider' );

/**
 * Smart linking inspector control panel component.
 *
 * @since 3.14.0
 */
const SmartLinkingInspectorControlPanel = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( ! props.isSelected || props.name !== 'core/paragraph' ) {
			return <BlockEdit { ...props } />;
		}

		const { settings, setSettings } = useSettings<SidebarSettings>();
		return (
			<>
				<BlockEdit { ...props } />
				{ /* @ts-ignore */ }
				<InspectorControls group="list">
					<PanelBody
						title={ __( 'Smart Linking (Beta)', 'wp-parsely' ) }
						initialOpen={ settings.SmartLinking.Open }
						className="wp-parsely-panel wp-parsely-smart-linking-panel"
						icon={ <LeafIcon /> }
						onToggle={ ( next ) => {
							setSettings(
								{
									SmartLinking: {
										...settings.SmartLinking,
										Open: next,
									},
								}
							);
							Telemetry.trackEvent( 'smart_linking_block_inspector_panel_toggled', { open: next } );
						} }
					>
						<VerifyCredentials>
							<SmartLinkingPanel
								selectedBlockClientId={ props.clientId }
								context={ SmartLinkingPanelContext.BlockInspector }
							/>
						</VerifyCredentials>
					</PanelBody>
				</InspectorControls>
			</>
		);
	};
}, 'withSmartLinkingPanel' );

/**
 * The smart linking panel with settings provider.
 * This is the final component that is added to the block inspector.
 *
 * @since 3.14.0
 */
const SmartLinkingPanelWithSettingsProvider = compose(
	withSettingsProvider,
	SmartLinkingInspectorControlPanel
);

/**
 * Initializes the smart linking, by adding the smart linking panel to the paragraph block.
 * Also registers the block overlay container.
 *
 * @since 3.14.0
 */
export const initSmartLinking = (): void => {
	/**
	 * Add smart linking inspector control panel to paragraph block.
	 */
	addFilter(
		'editor.BlockEdit',
		'wpparsely/smart-linking-inspector-control-panel',
		SmartLinkingPanelWithSettingsProvider
	);

	/**
	 * Initialize the block overlay component.
	 */
	initBlockOverlay();
};
