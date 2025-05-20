/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { escapeHTML } from '@wordpress/escape-html';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ContentHelperError, ContentHelperErrorCode } from '../../../../../common/content-helper-error';
import { ContentHelperErrorMessage } from '../../../../../common/content-helper-error-message';
import { TrafficBoostLink } from '../../provider';
import { TrafficBoostSidebarTabs, TrafficBoostStore } from '../../store';
import InboundLinksTab from './tabs/inbound-links-tab';
import SuggestionsTab from './tabs/suggestions-tab';

/**
 * Defines the props structure for TabsContent.
 *
 * @since 3.19.0
 */
interface TabsContentProps {
	activeTab: { name: string };
	onSuggestionClick?: ( suggestion: TrafficBoostLink ) => void;
	onInboundLinkClick?: ( inboundLink: TrafficBoostLink ) => void;
	hardError?: ContentHelperError;
}

/**
 * Component that renders the content for each tab in the Traffic Boost sidebar.
 *
 * Displays different content based on the active tab:
 * - Suggestions tab shows recommended content to boost
 * - Inbound Links tab shows currently boosted content
 *
 * @since 3.19.0
 *
 * @param {TabsContentProps} props The component's props.
 */
export const TabsContent = ( {
	activeTab,
	onSuggestionClick,
	onInboundLinkClick,
	hardError,
}: TabsContentProps ): JSX.Element => {
	const { selectedLink, selectedTab } = useSelect( ( select ) => ( {
		selectedLink: select( TrafficBoostStore ).getSelectedLink(),
		selectedTab: select( TrafficBoostStore ).getSelectedTab(),
	} ), [] );

	const { setSelectedTab } = useDispatch( TrafficBoostStore );

	/**
	 * Sets the selected tab when the active tab changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		setSelectedTab( activeTab.name as TrafficBoostSidebarTabs );
	}, [ activeTab, setSelectedTab ] );

	/**
	 * Changes the selected tab depending on the selected link type.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( selectedLink?.isSuggestion ) {
			setSelectedTab( TrafficBoostSidebarTabs.SUGGESTIONS );
		} else if ( selectedLink && ! selectedLink.isSuggestion ) {
			setSelectedTab( TrafficBoostSidebarTabs.INBOUND_LINKS );
		}
	}, [ selectedLink, setSelectedTab ] );

	if ( hardError ) {
		let errorMessage = hardError.Message();

		if ( ContentHelperErrorCode.ParselySuggestionsApiNoAuthorization === hardError.code ) {
			const lobbyLink = sprintf(
				'<a href="%1$s" target="_blank" rel="noopener">%2$s</a>',
				'https://lobby.vip.wordpress.com/2025/05/19/introducing-traffic-boost-a-smarter-way-to-recirculate-your-content/',
				__( 'Traffic Boost', 'wp-parsely' )
			);

			const docsLink = sprintf(
				'<a href="%1$s" target="_blank" rel="noopener">%2$s</a>',
				'https://docs.wpvip.com/parse-ly/wp-parsely-features/traffic-boost/#Access',
				__( 'here', 'wp-parsely' )
			);

			const message = sprintf(
				escapeHTML(
					/* translators: %1$s: Lobby Post link, %2$s: VIP Documentation link */
					__(
						'%1$s is currently not enabled for your Site ID. Information about requesting access to Traffic Boost can be found %2$s.',
						'wp-parsely'
					)
				),
				lobbyLink,
				docsLink
			);

			errorMessage = <ContentHelperErrorMessage children={ message } />;
		}

		return (
			<div className="traffic-boost-suggestions-empty-state">
				{ errorMessage }
			</div>
		);
	}

	switch ( selectedTab ) {
		case TrafficBoostSidebarTabs.SUGGESTIONS:
			return <SuggestionsTab
				onSuggestionClick={ onSuggestionClick }
			/>;
		case TrafficBoostSidebarTabs.INBOUND_LINKS:
			return <InboundLinksTab
				onInboundLinkClick={ onInboundLinkClick }
			/>;
		default:
			return <div>{ __( 'Select a tab', 'wp-parsely' ) }</div>;
	}
};
