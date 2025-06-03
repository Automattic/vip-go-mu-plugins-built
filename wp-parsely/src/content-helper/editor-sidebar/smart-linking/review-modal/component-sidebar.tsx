/**
 * WordPress dependencies
 */
import { KeyboardShortcuts, MenuItem, TabPanel } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Telemetry } from '../../../../js/telemetry/telemetry';

/**
 * Internal dependencies
 */
import { AiIcon } from '../../../common/icons/ai-icon';
import { InboundSmartLink, SmartLink } from '../provider';

type ReviewModalSidebarProps = {
	activeLink: SmartLink | null,
	inboundLinks: InboundSmartLink[] | null,
	outboundLinks: SmartLink[] | null,
	setSelectedLink: ( link: SmartLink ) => void,
};

/**
 * Sidebar component for the review modal.
 *
 * @since 3.16.0
 *
 * @param {ReviewModalSidebarProps} props The component props.
 */
export const ReviewModalSidebar = ( {
	activeLink,
	outboundLinks,
	inboundLinks,
	setSelectedLink,
}: ReviewModalSidebarProps ): React.JSX.Element => {
	const sidebarRef = useRef<HTMLDivElement>( null );
	const itemRefs = useRef<( HTMLButtonElement | null )[]>( [] );
	const [ allLinks, setAllLinks ] = useState<SmartLink[]>( [] );

	useEffect( () => {
		if ( outboundLinks && inboundLinks ) {
			setAllLinks( [ ...outboundLinks, ...inboundLinks ] );
		}
	}, [ inboundLinks, outboundLinks ] );

	/**
	 * Handles the scroll of the sidebar to the active link.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		if ( activeLink ) {
			const activeIndex = allLinks?.findIndex( ( link ) => link.uid === activeLink.uid );

			if ( activeIndex !== undefined && activeIndex !== -1 && sidebarRef.current && itemRefs.current[ activeIndex ] ) {
				const sidebar = sidebarRef.current;
				const activeItem = itemRefs.current[ activeIndex ];

				if ( activeItem ) {
					activeItem.focus();

					if ( activeIndex === 0 ) {
						sidebar.scrollTop = 0;
						return;
					}
					const sidebarRect = sidebar.getBoundingClientRect();
					const activeItemRect = activeItem.getBoundingClientRect();

					// Check if the active item is out of view.
					if ( activeItemRect.top < sidebarRect.top || activeItemRect.bottom > sidebarRect.bottom ) {
						// Scroll only if the active item is out of view.
						sidebar.scrollTop = activeItem.offsetTop - sidebar.offsetTop;
					}
				}
			}
		}
	}, [ activeLink, allLinks ] );

	/**
	 * Handles the tab press to move to the next tab.
	 *
	 * @since 3.16.0
	 */
	const handleTabPress = () => {
		// Move to the next tab considering that the active tab has the data-active-item attribute.
		const activeTab = document.querySelector( '.smart-linking-review-sidebar-tabs [data-active-item]' );
		let nextTab = activeTab?.nextElementSibling;

		// If there is no next tab, move to the first tab.
		if ( ! nextTab ) {
			nextTab = document.querySelector( '.smart-linking-review-sidebar-tabs [role="tab"]' );
		}

		if ( nextTab ) {
			( nextTab as HTMLElement ).click();
		}
	};

	const label = (
		<span className="smart-linking-menu-label">
			{ __( 'NEW', 'wp-parsely' ) }
			<AiIcon />
		</span>
	);

	// Build the tabs array.
	let tabs = [];

	if ( outboundLinks && outboundLinks.length > 0 ) {
		tabs.push( {
			name: 'outbound',
			title: __( 'Outbound', 'wp-parsely' ),
		} );
	}

	if ( inboundLinks && inboundLinks.length > 0 ) {
		tabs.push( {
			name: 'inbound',
			title: __( 'Inbound', 'wp-parsely' ),
		} );
	}

	let initialTabName = 'outbound';

	// Change the titles of the tabs to the extended titles if there are no links.
	tabs = tabs.filter( ( tab ) => {
		if ( tab.name === 'outbound' && inboundLinks && inboundLinks.length === 0 ) {
			tab.title = __( 'Outbound Smart Links', 'wp-parsely' );
			initialTabName = 'outbound';
		}
		if ( tab.name === 'inbound' && outboundLinks && outboundLinks.length === 0 ) {
			tab.title = __( 'Inbound Smart Links', 'wp-parsely' );
			initialTabName = 'inbound';
		}
		return tab;
	} );

	return (
		<div className="smart-linking-review-sidebar" ref={ sidebarRef }>
			<KeyboardShortcuts shortcuts={ {
				tab: () => handleTabPress(),
				'shift+tab': () => handleTabPress(),
			} } />
			<TabPanel
				className="smart-linking-review-sidebar-tabs"
				initialTabName={ initialTabName }
				tabs={ tabs }
				onSelect={ ( tabName: string ) => {
					// If outbound, select the first outbound link.
					if ( tabName === 'outbound' && outboundLinks && outboundLinks.length > 0 ) {
						setSelectedLink( outboundLinks[ 0 ] );
					}
					// If inbound, select the first inbound link.
					if ( tabName === 'inbound' && inboundLinks && inboundLinks.length > 0 ) {
						setSelectedLink( inboundLinks[ 0 ] );
					}

					Telemetry.trackEvent( 'smart_linking_modal_tab_selected', {
						tab: tabName,
						total_inbound: inboundLinks?.length ?? 0,
						total_outbound: outboundLinks?.length ?? 0,
					} );
				} }
			>
				{ ( tab ) => (
					<>
						{ tab.name === 'outbound' && (
							<>
								{ ! outboundLinks || outboundLinks.length === 0 ? (
									<> { __( 'No outbound links found.', 'wp-parsely' ) }</>
								) : (
									( outboundLinks.map( ( link, index ) => (
										<MenuItem
											key={ link.uid }
											ref={ ( el ) => {
												itemRefs.current[ index ] = el;
											} }
											className={ activeLink?.uid === link.uid ? 'is-selected' : '' }
											role="menuitemradio"
											isSelected={ activeLink?.uid === link.uid }
											onClick={ () => setSelectedLink( link ) }
										>
											<span className="smart-linking-menu-item">{ link.text }</span>
											{ ! link.applied && label }
										</MenuItem>
									) ) )
								) }
							</>
						) }
						{ tab.name === 'inbound' && (
							<>
								<div className="review-sidebar-tip">
									{ __( 'This section shows external posts that link back to the current post.', 'wp-parsely' ) }
								</div>
								{ ! inboundLinks || inboundLinks.length === 0 ? (
									<> { __( 'No inbound links found.', 'wp-parsely' ) }</>
								) : (
									( inboundLinks.map( ( link, index ) => (
										<MenuItem
											key={ link.uid }
											ref={ ( el ) => {
												itemRefs.current[ ( outboundLinks ? outboundLinks.length : 0 ) + index ] = el;
											} }
											className={ activeLink?.uid === link.uid ? 'is-selected' : '' }
											role="menuitemradio"
											isSelected={ activeLink?.uid === link.uid }
											onClick={ () => setSelectedLink( link ) }
										>
											<span className="smart-linking-menu-item">{ link.post_data?.title }</span>
										</MenuItem>
									) ) )
								) }
							</>
						) }
					</>
				) }
			</TabPanel>
		</div>
	);
};
