/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TrafficBoostLink } from '../../../provider';
import { TrafficBoostStore } from '../../../store';
import { LinksList } from '../links-list/links-list';

/**
 * Defines the props structure for InboundLinksTab.
 *
 * @since 3.19.0
 */
interface InboundLinksTabProps {
	onInboundLinkClick?: ( inboundLink: TrafficBoostLink ) => void;
}

/**
 * Component that renders the inbound links tab.
 *
 * @since 3.19.0
 *
 * @param {InboundLinksTabProps} props The props for the InboundLinksTab component.
 */
const InboundLinksTab = ( {
	onInboundLinkClick,
}: InboundLinksTabProps ): React.JSX.Element => {
	const {
		selectedLink,
		inboundLinks,
		currentPage,
		itemsPerPage,
		isLoadingInboundLinks,
	} = useSelect( ( select ) => ( {
		selectedLink: select( TrafficBoostStore ).getSelectedLink(),
		inboundLinks: select( TrafficBoostStore ).getInboundLinks(),
		currentPage: select( TrafficBoostStore ).getInboundLinksPage(),
		itemsPerPage: select( TrafficBoostStore ).getInboundLinksItemsPerPage(),
		isLoadingInboundLinks: select( TrafficBoostStore ).isLoadingInboundLinks(),
	} ), [] );

	const {
		setInboundLinksItemsPerPage,
		setInboundLinksPage,
	} = useDispatch( TrafficBoostStore );

	return (
		<LinksList
			isLoading={ isLoadingInboundLinks }
			links={ inboundLinks }
			onClick={ onInboundLinkClick }
			activeLink={ ! selectedLink?.isSuggestion ? selectedLink : null }
			currentPage={ currentPage }
			itemsPerPage={ itemsPerPage }
			onPageChange={ setInboundLinksPage }
			onItemsPerPageChange={ setInboundLinksItemsPerPage }
			renderEmptyState={ () => (
				<div className="traffic-boost-suggestions-empty-state">
					<p>{ __( 'This post has no inbound links.', 'wp-parsely' ) }</p>
				</div>
			) }
		/>
	);
};

export default InboundLinksTab;
