/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { HydratedPost } from '../../../../../common/providers/base-wordpress-provider';
import { TrafficBoostStore } from '../../store';

/**
 * Represents the type of link.
 *
 * @since 3.19.0
 */
export type LinkType = 'external' | 'internal' | 'smart';

/**
 * Represents the links for a post.
 *
 * @since 3.19.0
 */
export interface PostLinks extends Record<LinkType, HTMLAnchorElement[]> {
	total: number;
}

/**
 * The shape of the link counter object.
 *
 * @since 3.19.0
 */
type LinkCount = {
	[key in LinkType]: number;
}

/**
 * Props for the LinkCounter component.
 *
 * @since 3.19.0
 */
interface LinkCounterProps {
	post: HydratedPost;
	onLinkTypeClick?: ( type: LinkType | null ) => void;
	selectedLinkType: LinkType | null;
}

/**
 * Component that displays a counter for different types of links.
 *
 * @since 3.19.0
 *
 * @param {LinkCounterProps} props The component's props.
 */
export const LinkCounter = ( {
	post,
	onLinkTypeClick,
	selectedLinkType: initialSelectedLinkType,
}: LinkCounterProps ): React.JSX.Element => {
	const [ selectedLinkType, setSelectedLinkType ] = useState<LinkType | null>( initialSelectedLinkType );
	const [ links, setLinks ] = useState<LinkCount>( {
		external: 0,
		internal: 0,
		smart: 0,
	} );

	const storePreviewLinkType = useSelect( ( select ) => select( TrafficBoostStore ).getPreviewLinkType(), [] );
	const { setPreviewLinkType } = useDispatch( TrafficBoostStore );

	useEffect( () => {
		const postContent = post.content.raw;
		const siteUrl = new URL( post.link ).hostname;

		// Create a new DOMParser instance.
		const parser = new DOMParser();
		const doc = parser.parseFromString( postContent, 'text/html' );
		const allLinks = doc.querySelectorAll( 'a' );

		// Filter out links that have no text.
		const linksWithText = Array.from( allLinks ).filter( ( link ) => link.textContent?.trim() !== '' );

		// Classify the links into external, internal, and smart.
		// Smart links contain the data-smartlink attribute.
		const smartLinks = linksWithText.filter( ( link ) => link.hasAttribute( 'data-smartlink' ) );

		// Internal links contain the site URL in the href attribute.
		const internalLinks = linksWithText.filter( ( link ) => link.href.includes( siteUrl ) );

		// External links are links that do not contain the site URL in the href attribute.
		const externalLinks = linksWithText.filter( ( link ) => ! link.href.includes( siteUrl ) );

		setLinks( {
			external: externalLinks.length,
			internal: internalLinks.length,
			smart: smartLinks.length,
		} );
	}, [ post ] );

	/**
	 * Sets the selected link type and preview link type when the initial selected link type changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		setSelectedLinkType( initialSelectedLinkType );
		setPreviewLinkType( initialSelectedLinkType );
	}, [ initialSelectedLinkType, setPreviewLinkType ] );

	/**
	 * Updates the selected link type when changed externally via the store.
	 *
	 * @since 3.20.1
	 */
	useEffect( () => {
		if ( storePreviewLinkType !== selectedLinkType ) {
			setSelectedLinkType( storePreviewLinkType );
		}
	}, [ selectedLinkType, storePreviewLinkType ] );

	/**
	 * Handles click events on link type buttons.
	 *
	 * @since 3.19.0
	 *
	 * @param {LinkType} type The type of link that was clicked.
	 */
	const handleLinkTypeClick = ( type: LinkType ) => {
		let newSelectedLinkType: LinkType | null = type;

		// If the same link type is clicked again, reset the selected link type.
		if ( selectedLinkType === type ) {
			newSelectedLinkType = null;
		}

		setSelectedLinkType( newSelectedLinkType );
		setPreviewLinkType( newSelectedLinkType );

		onLinkTypeClick?.( newSelectedLinkType );
	};

	/**
	 * Checks if a link type is currently selected.
	 *
	 * @since 3.19.0
	 *
	 * @param {LinkType} type The type to check.
	 *
	 * @return {boolean} Whether the type is selected.
	 */
	const isSelected = ( type: LinkType ) => selectedLinkType === type;

	const totalLinks = links.external + links.internal + links.smart;

	return (
		<div className="traffic-boost-preview-info-links">
			<div className="traffic-boost-preview-info-links-summary">
				{ totalLinks > 0 ? (
					<>
						{ sprintf(
							/* translators: %d: number of outbound links */
							__( 'Contains %d outbound links:', 'wp-parsely' ),
							totalLinks
						) }
					</>
				) : (
					<>
						{ __( 'This post has no outbound links.', 'wp-parsely' ) }
					</>
				) }
			</div>
			<div className="traffic-boost-preview-info-links-counter">
				{ links.external > 0 && (
					<Button
						variant="secondary"
						isPressed={ isSelected( 'external' ) }
						onClick={ () => handleLinkTypeClick( 'external' ) }
					>
						{ sprintf(
							/* translators: %d: number of outbound links */
							__( '%d external', 'wp-parsely' ),
							links.external
						) }
					</Button>
				) }
				{ links.internal > 0 && (
					<Button
						variant="secondary"
						isPressed={ isSelected( 'internal' ) }
						onClick={ () => handleLinkTypeClick( 'internal' ) }
					>
						{ sprintf(
							/* translators: %d: number of internal links */
							__( '%d internal', 'wp-parsely' ),
							links.internal
						) }
					</Button>
				) }
				{ links.smart > 0 && (
					<Button
						variant="secondary"
						isPressed={ isSelected( 'smart' ) }
						onClick={ () => handleLinkTypeClick( 'smart' ) }
					>
						{ sprintf(
							/* translators: %d: number of smart links */
							__( '%d Smart Links', 'wp-parsely' ),
							links.smart
						) }
					</Button>
				) }
			</div>
		</div>
	);
};
