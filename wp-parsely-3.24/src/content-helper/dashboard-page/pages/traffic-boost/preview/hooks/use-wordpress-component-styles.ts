/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Injects WordPress component styles into a document.
 *
 * @since 3.20.0
 *
 * @return {Object} An object containing the injectWordpressComponentStyles function.
 */
export const useWordpressComponentStyles = () => {
	const injectWordpressComponentStyles = useCallback( ( iframeDocument: Document ) => {
		const urlWpComponents = window?.wpParselyDependencies?.urlWpComponents;

		if ( ! urlWpComponents ) {
			console.error( 'WordPress component styles URL not found' ); // eslint-disable-line no-console
			return;
		}

		let wordpressComponentStyling: HTMLLinkElement | null = iframeDocument.querySelector( 'link[data-wp-parsely-component-styles]' );

		if ( wordpressComponentStyling === null ) {
			// Inject WordPress components styles.
			wordpressComponentStyling = iframeDocument.createElement( 'link' );
			wordpressComponentStyling.rel = 'stylesheet';
			wordpressComponentStyling.href = urlWpComponents;
			wordpressComponentStyling.setAttribute( 'data-wp-parsely-component-styles', 'true' );
			iframeDocument.head.appendChild( wordpressComponentStyling );
		}
	}, [] );

	return {
		injectWordpressComponentStyles,
	};
};
