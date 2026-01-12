/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { HydratedPost } from '../../../../../common/providers/base-wordpress-provider';
import { PostDetailsSidebar } from './post-details';

/**
 * Defines the props structure for SidebarHeader.
 *
 * @since 3.19.0
 */
interface SidebarHeaderProps {
	onBackClick: () => void;
	isLoading: boolean;
	post?: HydratedPost;
}

/**
 * Header component for the Traffic Boost sidebar.
 *
 * @since 3.19.0
 *
 * @param {SidebarHeaderProps} props The component's props.
 */
export const SidebarHeader = ( { onBackClick, isLoading, post }: SidebarHeaderProps ): React.JSX.Element => (
	<div className="traffic-boost-sidebar-header">
		<div className="traffic-boost-sidebar-header-nav">
			<Button icon={ chevronLeft } onClick={ onBackClick }>
				{ __( 'Back', 'wp-parsely' ) }
			</Button>
		</div>

		<div className="traffic-boost-sidebar-inner">
			<PostDetailsSidebar post={ post } isLoading={ isLoading } />
		</div>
	</div>
);
