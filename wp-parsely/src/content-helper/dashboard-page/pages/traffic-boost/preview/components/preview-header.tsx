/**
 * WordPress imports
 */
import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { desktop, edit, external, moreVertical } from '@wordpress/icons';

/**
 * Internal imports
 */
import { LeafIcon } from '../../../../../common/icons/leaf-icon';
import { HydratedPost } from '../../../../../common/providers/base-wordpress-provider';
import { TrafficBoostLink } from '../../provider';
import { isExternalURL } from '../utils';
import { LinkCounter } from './link-counter';

/**
 * Props structure for VerticalMoreMenu.
 *
 * @since 3.19.0
 */
interface VerticalMoreMenuProps {
	post: HydratedPost;
	onEditClick: ( post: HydratedPost ) => void;
	onViewInNewTabClick: ( post: HydratedPost ) => void;
	onViewInParseLyClick: ( post: HydratedPost ) => void;
}

/**
 * VerticalMoreMenu component.
 *
 * This component is used to display a dropdown menu with actions for a post.
 *
 * @since 3.19.0
 *
 * @param {VerticalMoreMenuProps} props The component's props.
 */
const VerticalMoreMenu = ( {
	post,
	onEditClick,
	onViewInNewTabClick,
	onViewInParseLyClick,
}: VerticalMoreMenuProps ): React.JSX.Element => {
	/**
	 * Handles the click event for the dropdown menu items.
	 *
	 * @since 3.19.0
	 *
	 * @param {string}   type    The type of action to perform.
	 * @param {Function} onClose The function to call when the action is performed.
	 */
	const onClickHandler = ( type: string, onClose: () => void ) => {
		switch ( type ) {
			case 'edit':
				onEditClick( post );
				break;
			case 'view-in-new-tab':
				onViewInNewTabClick( post );
				break;
			case 'view-in-parse-ly':
				onViewInParseLyClick( post );
				break;
		}
		onClose();
	};

	return (
		<DropdownMenu icon={ moreVertical } iconSize={ 24 } label={ __( 'Actions', 'wp-parsely' ) }>
			{ ( { onClose } ) => (
				<MenuGroup>
					<MenuItem icon={ edit } onClick={ () => onClickHandler( 'edit', onClose ) }>
						{ __( 'Edit Post', 'wp-parsely' ) }
					</MenuItem>
					<MenuItem icon={ external } onClick={ () => onClickHandler( 'view-in-new-tab', onClose ) }>
						{ __( 'View post in a new tab', 'wp-parsely' ) }
					</MenuItem>
					<MenuItem icon={ <LeafIcon /> } onClick={ () => onClickHandler( 'view-in-parse-ly', onClose ) }>
						{ __( 'View in Parse.ly', 'wp-parsely' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};

/**
 * Props structure for PreviewHeader.
 *
 * @since 3.19.0
 */
interface PreviewHeaderProps {
	isLoading: boolean;
	activeLink: TrafficBoostLink | null;
	onOpenPostInNewTab: () => void;
	onOpenPostEditor: () => void;
	onOpenParselyDashboard: () => void;
	isFrontendPreview: boolean;
	setIsFrontendPreview: ( value: boolean ) => void;
}

/**
 * Preview header component for the Traffic Boost feature.
 * Displays preview header for a selected post.
 *
 * @since 3.19.0
 *
 * @param {PreviewHeaderProps} props The component's props.
 */
export const PreviewHeader = ( {
	isLoading,
	activeLink,
	isFrontendPreview,
	setIsFrontendPreview,
	onOpenPostEditor,
	onOpenPostInNewTab,
	onOpenParselyDashboard,
}: PreviewHeaderProps ): React.JSX.Element => {
	/**
	 * Toggles the frontend preview state.
	 *
	 * @since 3.19.0
	 */
	const onToggleFrontendPreview = () => {
		setIsFrontendPreview( ! isFrontendPreview );
	};

	/**
	 * Toggles the frontend preview state when the active link is external,
	 * so that the iframe is not displayed.
	 *
	 * This prevents issues with cross-origin requests.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( activeLink && isExternalURL( activeLink ) ) {
			setIsFrontendPreview( false );
		}
	}, [ activeLink, setIsFrontendPreview ] );

	if ( ! activeLink ) {
		return <></>;
	}

	return (
		<div className="traffic-boost-preview-header">
			<div className="traffic-boost-preview-info">
				<div className="traffic-boost-preview-info-title">
					<div dangerouslySetInnerHTML={ { __html: activeLink?.targetPost?.title.rendered } } />
				</div>
				<LinkCounter
					post={ activeLink.targetPost }
					selectedLinkType={ null }
				/>
			</div>
			<div className="traffic-boost-preview-actions">
				{ ! isExternalURL( activeLink ) && false && (
					<Button
						icon={ desktop }
						isPressed={ isFrontendPreview }
						disabled={ isLoading }
						iconSize={ 24 }
						onClick={ onToggleFrontendPreview }
						label={ __( 'Toggle Frontend Preview', 'wp-parsely' ) }
					/>
				) }
				<VerticalMoreMenu
					post={ activeLink.targetPost }
					onEditClick={ onOpenPostEditor }
					onViewInNewTabClick={ onOpenPostInNewTab }
					onViewInParseLyClick={ onOpenParselyDashboard }
				/>
			</div>
		</div>
	);
};
