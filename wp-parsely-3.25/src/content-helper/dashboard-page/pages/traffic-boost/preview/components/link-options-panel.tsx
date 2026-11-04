/**
 * WordPress dependencies
 */
import {
	CheckboxControl,
	PanelBody,
	PanelRow,
	TextControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { HydratedPost } from '../../../../../common/providers/base-wordpress-provider';
import { TrafficBoostLink } from '../../provider';

/**
 * Props structure for LinkOptionsPanel.
 *
 * @since 3.19.0
 */
interface LinkOptionsPanelProps {
	post: HydratedPost;
	activeLink: TrafficBoostLink | null;
	onTextChange: ( value: string ) => void;
	onNewTabChange: ( value: boolean ) => void;
	onNofollowChange: ( value: boolean ) => void;
	linkText: string | null;
}

/**
 * Defines the state structure for LinkOptionsPanel.
 *
 * @since 3.19.0
 */
interface OptionsState {
	linkText: string;
	openInNewTab: boolean;
	nofollow: boolean;
	isOpen: boolean;
}

/**
 * Link options panel component for the Traffic Boost feature.
 * Displays link options for a selected post.
 *
 * Note: not in use currently.
 *
 * @since 3.19.0
 *
 * @param {LinkOptionsPanelProps} props The component's props.
 */
export const LinkOptionsPanel = ( {
	post,
	activeLink,
	onTextChange,
	onNewTabChange,
	onNofollowChange,
	linkText,
}: LinkOptionsPanelProps ): React.JSX.Element => {
	const [ options, setOptions ] = useState<OptionsState>( {
		linkText: linkText ?? activeLink?.smartLink?.text ?? '',
		openInNewTab: false,
		nofollow: false,
		isOpen: false,
	} );

	/**
	 * Updates the link text when the linkText prop changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		setOptions( ( prevOptions: OptionsState ) => ( {
			...prevOptions,
			linkText: linkText ?? '',
		} ) );
	}, [ linkText ] );

	/**
	 * Updates the link options when the active link changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		setOptions( ( prevOptions ) => ( {
			...prevOptions,
			linkText: activeLink?.smartLink?.text ?? '',
			isOpen: false,
		} ) );
	}, [ activeLink ] );

	return (
		<PanelBody
			className="traffic-boost-preview-footer-panel"
			title={ __( 'Link Options', 'wp-parsely' ) }
			initialOpen={ false }
			onToggle={ ( isOpen ) => setOptions( { ...options, isOpen } ) }
			opened={ options.isOpen }
		>
			<PanelRow>
				<TextControl
					label={ __( 'Text', 'wp-parsely' ) }
					value={ options.linkText }
					disabled={ true }
					__nextHasNoMarginBottom
					onChange={ ( value ) => {
						setOptions( { ...options, linkText: value } );
						onTextChange( value );
					} }
					help={ __( 'Select text in the post preview to change the link text', 'wp-parsely' ) }
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={ __( 'Link', 'wp-parsely' ) }
					__nextHasNoMarginBottom
					value={ post?.link }
					disabled={ true }
					onChange={ () => {} } // Disabled, so no need for implementation
				/>
			</PanelRow>
			<PanelRow className="panel-advanced-controls">
				<div className="panel-advanced-controls-header">
					{ __( 'Advanced', 'wp-parsely' ) }
				</div>
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ __( 'Open in new tab', 'wp-parsely' ) }
					checked={ options.openInNewTab }
					onChange={ ( value ) => {
						setOptions( { ...options, openInNewTab: value } );
						onNewTabChange( value );
					} }
				/>
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ __( 'Mark as nofollow', 'wp-parsely' ) }
					checked={ options.nofollow }
					onChange={ ( value ) => {
						setOptions( { ...options, nofollow: value } );
						onNofollowChange( value );
					} }
				/>
			</PanelRow>
		</PanelBody>
	);
};
