export { escapeRegExp } from '../../common/utils/functions';

/**
 * Finds all text nodes in an element that contain a given search text and are not within an anchor tag.
 * This is useful for finding text nodes that should be linked.
 *
 * @since 3.14.1
 *
 * @param {HTMLElement} element    - The element to search within.
 * @param {string}      searchText - The text to search for.
 *
 * @return {Node[]} The text nodes that match the search text and are not within an anchor tag.
 */
export function findTextNodesNotInAnchor( element: HTMLElement, searchText: string ): Node[] {
	const walker = document.createTreeWalker( element, NodeFilter.SHOW_TEXT, {
		acceptNode: ( node ) => {
			if ( ! node.textContent || ! node.textContent.includes( searchText ) ) {
				return NodeFilter.FILTER_REJECT;
			}
			let parent = node.parentNode;
			while ( parent && parent !== element ) {
				if ( parent.nodeName === 'A' ) {
					return NodeFilter.FILTER_REJECT;
				}
				parent = parent.parentNode;
			}
			return NodeFilter.FILTER_ACCEPT;
		},
	} );

	const textNodes = [];
	let node;
	while ( ( node = walker.nextNode() ) ) {
		textNodes.push( node );
	}
	return textNodes;
}
