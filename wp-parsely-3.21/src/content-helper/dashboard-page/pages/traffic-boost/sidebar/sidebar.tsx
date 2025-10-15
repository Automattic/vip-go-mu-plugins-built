/**
 * External dependencies
 */
import { useNavigate } from 'react-router';

/**
 * WordPress dependencies
 */
import { TabPanel } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ContentHelperError } from '../../../../common/content-helper-error';
import { TrafficBoostLink } from '../provider';
import { TrafficBoostSidebarTabs, TrafficBoostStore } from '../store';
import { SidebarHeader } from './components/header';
import { TabsContent } from './components/tabs-content';
import './sidebar.scss';

/**
 * Defines the props structure for TrafficBoostSidebar.
 *
 * @since 3.19.0
 */
interface TrafficBoostSidebarProps {
    onLinkClick?: ( link: TrafficBoostLink ) => void;
	hardError?: ContentHelperError;
}

/**
 * Sidebar component for the Traffic Boost feature.
 * Displays post details, stats, and manages boost links functionality.
 *
 * @since 3.19.0
 *
 * @param {TrafficBoostSidebarProps} props The component's props.
 */
export const TrafficBoostSidebar = ( {
	onLinkClick, hardError,
}: TrafficBoostSidebarProps ): React.JSX.Element => {
	const navigate = useNavigate();

	const {
		post,
		isLoadingPost,
		selectedTab,
		suggestions,
		inboundLinks,
	} = useSelect( ( select ) => ( {
		post: select( TrafficBoostStore ).getCurrentPost(),
		selectedTab: select( TrafficBoostStore ).getSelectedTab(),
		suggestions: select( TrafficBoostStore ).getSuggestions(),
		inboundLinks: select( TrafficBoostStore ).getInboundLinks(),
		isLoadingPost: select( TrafficBoostStore ).isLoadingPost(),
	} ), [] );

	const { setSelectedTab } = useDispatch( TrafficBoostStore );

	/**
	 * Handles tab counters updates in the UI.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		const updateTabCount = (
			tabSelector: string,
			count: number
		) => {
			const tab = document.querySelector( tabSelector );
			if ( ! tab ) {
				return;
			}

			// Remove the tab count if there are no items.
			if ( count <= 0 ) {
				const counter = tab.querySelector( '.tab-count' );
				if ( counter ) {
					counter.remove();
				}
				return;
			}

			let counter = tab.querySelector( '.tab-count' ) as HTMLElement;
			if ( ! counter ) {
				counter = document.createElement( 'span' );
				counter.className = 'tab-count';
				tab.appendChild( counter );
			}
			counter.textContent = count.toString();
		};

		updateTabCount( '.components-tab-panel__tabs-item.suggestions-tab', suggestions.length );
		updateTabCount( '.components-tab-panel__tabs-item.inbound-links-tab', inboundLinks.length );
	}, [ inboundLinks, inboundLinks.length, suggestions.length ] );

	/**
	 * Whenever the selected tab changes, selects it by simulating a click.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		const tab = document.querySelector( `.traffic-boost-sidebar-tabs .${ selectedTab }-tab` ) as HTMLElement;
		if ( tab ) {
			tab.click();
		}
	}, [ selectedTab ] );

	return (
		<div className="traffic-boost-sidebar">
			<SidebarHeader
				isLoading={ isLoadingPost }
				onBackClick={ () => navigate( '/engagement-boost' ) }
				post={ post ?? undefined }
			/>

			<div className="traffic-boost-sidebar-content">
				<TabPanel
					className="traffic-boost-sidebar-tabs"
					tabs={ [
						{
							name: TrafficBoostSidebarTabs.SUGGESTIONS,
							title: __( 'Suggested Sources', 'wp-parsely' ),
							className: 'traffic-boost-tab suggestions-tab',
						},
						{
							name: TrafficBoostSidebarTabs.INBOUND_LINKS,
							title: __( 'Inbound Links', 'wp-parsely' ),
							className: 'traffic-boost-tab inbound-links-tab',
						},
					] }
					onSelect={ ( tab: string ) => setSelectedTab( tab as TrafficBoostSidebarTabs ) }
				>
					{ ( tab ) => <TabsContent
						activeTab={ tab }
						onSuggestionClick={ onLinkClick }
						onInboundLinkClick={ onLinkClick }
						hardError={ hardError }
					/> }
				</TabPanel>
			</div>
		</div>
	);
};
