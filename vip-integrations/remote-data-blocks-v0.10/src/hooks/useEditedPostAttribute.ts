import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

// The @types/wordpress__editor package declares a module against best practice,
// so we are unable to extend those types in our own declaration file like we do
// for other @wordpress packages:
//
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/fa6fad261048474f99b80698cae5170a6c37de0d/types/wordpress__editor/index.d.ts#L14-L15
type GetEditedPostAttribute = < T >( attributeName: string ) => T | undefined;
type PostAttributeSelector< T > = ( getEditedPostAttribute: GetEditedPostAttribute ) => T;

interface EditorStoreSelectors {
	// Not all properties of Post | Page are included, so widen to string and
	// allow caller to provide the return type.
	getEditedPostAttribute: GetEditedPostAttribute;
}

/**
 * Provides access to post attributes. Inspect `wp.data.select('core/editor').getCurrentPost()`
 * to see what's available as a post attribute.
 */
export function useEditedPostAttribute< T >( selector: PostAttributeSelector< T > ): T {
	return useSelect< EditorStoreSelectors, T >( select => {
		const { getEditedPostAttribute } = select( editorStore );

		return selector( getEditedPostAttribute );
	}, [] );
}
