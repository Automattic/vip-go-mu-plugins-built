/**
 * Internal dependencies
 */
import { TrafficBoostLink } from '../provider';

/**
 * Checks if a URL is external.
 *
 * @since 3.19.0
 *
 * @param {TrafficBoostLink} link The link to check.
 *
 * @return {boolean} True if the URL is external, false otherwise.
 */
export const isExternalURL = ( link: TrafficBoostLink ): boolean => {
	try {
		const urlToCheck = new URL( link.targetPost.link );
		const currentURL = new URL( window.location.href );

		return urlToCheck.hostname !== currentURL.hostname;
	} catch ( e ) {
		// If URL parsing fails, consider it external for safety.
		return true;
	}
};

/**
 * The class name used to mark the content area in the preview.
 *
 * @since 3.19.0
 */
const PARSELY_PREVIEW_MARKER_CLASS = 'wp-parsely-preview-marker';

/**
 * Gets the content area element from the document.
 *
 * It tries to get the content area by checking for the PARSELY_PREVIEW_MARKER_CLASS.
 * The content area is the element that contains the marker as a child.
 *
 * @since 3.19.0
 *
 * @param {Document} document The document to get the content area from.
 *
 * @return {Element | null} The content area element or null if not found.
 */
export const getContentArea = ( document: Document ): Element | null => {
	// Get the content area by checking for the PARSELY_PREVIEW_MARKER_CLASS.
	const contentArea = document.querySelector( `.${ PARSELY_PREVIEW_MARKER_CLASS }` );
	if ( ! contentArea ) {
		return null;
	}

	// If found, get the parent element.
	const parentElement = contentArea.parentElement;
	if ( ! parentElement ) {
		return null;
	}

	return parentElement;
};
