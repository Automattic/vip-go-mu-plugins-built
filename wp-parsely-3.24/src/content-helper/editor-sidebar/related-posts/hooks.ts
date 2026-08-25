/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import { store as coreStore, Taxonomy, User } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../@types/gutenberg/types';

/**
 * Defines the states of post data as handled in the usePostData() function.
 *
 * - When `undefined`, the data is still being fetched.
 * - When `null`, an error has occurred before fetching the data.
 * - When an array, the data has been fetched and is available.
 *
 * @since 3.14.3
 * @since 3.14.4 Renamed to PostData from PostDataStore.
 */
interface PostData {
	authors: User[] | null | undefined;
	categories: Taxonomy[] | null | undefined;
	tags: Taxonomy[] | null | undefined;
	isReady: boolean;
}

/**
 * Hook to get the post data for the current post.
 *
 * Note: in some rare cases this function could process or return unexpected
 * data due to Gutenberg functions not working as expected. Consumers should
 * validate the data before using it.
 *
 * @since 3.14.3
 * @since 3.14.4 Implemented checks to reduce risk of invalid data being processed.
 * @since 3.16.2 Added `isLoading` and `hasResolved` to check if the data is still being fetched or if it
 *               has been resolved.
 *
 * @see https://github.com/Parsely/wp-parsely/issues/2423
 *
 * @return {PostData} The post data for the current post.
 */
export function usePostData(): PostData {
	const [ postData, setPostData ] = useState<PostData>( {
		authors: undefined,
		categories: undefined,
		tags: undefined,
		isReady: false,
	} );

	/**
	 * Fetches the post attributes from the editor.
	 * This includes the author, categories, and tags, and if the data is not available, it will be set to `null`.
	 *
	 * @since 3.14.4
	 * @since 3.16.2 Added `isLoading` and `hasResolved` to check if the data is still being fetched or if it
	 *               has been resolved.
	 */
	const postAttributes = useSelect( ( select ) => {
		// @ts-ignore `hasFinishedResolution` and `isResolving` are not part of the core-data store type.
		const { getEntityRecords, hasFinishedResolution, isResolving } = select( coreStore );

		const editor = select( 'core/editor' ) as GutenbergFunction;
		const authorId = editor.getEditedPostAttribute( 'author' );
		const categoryIds = editor.getEditedPostAttribute( 'categories' );
		const tagIds = editor.getEditedPostAttribute( 'tags' );

		let authorRecords: User[] | null | undefined;
		let categoryRecords: Taxonomy[] | null | undefined;
		let tagRecords: Taxonomy[] | null | undefined;

		if ( Number.isInteger( authorId ) ) {
			authorRecords = getEntityRecords(
				'root', 'user', { include: [ authorId ], context: 'view' }
			) ?? undefined; // Coalescing null to undefined
		} else {
			authorRecords = null;
		}

		if ( Array.isArray( categoryIds ) && categoryIds.length > 0 &&
			categoryIds.every( Number.isInteger )
		) {
			categoryRecords = getEntityRecords(
				'taxonomy', 'category', { include: categoryIds, context: 'view' }
			) ?? undefined; // Coalescing null to undefined
		} else {
			categoryRecords = null;
		}

		if ( Array.isArray( tagIds ) && tagIds.length > 0 &&
			tagIds.every( Number.isInteger )
		) {
			tagRecords = getEntityRecords(
				'taxonomy', 'post_tag', { include: tagIds, context: 'view' }
			) ?? undefined; // Coalescing null to undefined
		} else {
			tagRecords = null;
		}

		// Check if the data is still being fetched.
		const isLoading = (
			isResolving( 'getEntityRecords', [ 'root', 'user', { include: [ authorId ], context: 'view' } ] ) ||
			isResolving( 'getEntityRecords', [ 'taxonomy', 'category', { include: categoryIds, context: 'view' } ] ) ||
			isResolving( 'getEntityRecords', [ 'taxonomy', 'post_tag', { include: tagIds, context: 'view' } ] )
		);

		// Check if all the data has been resolved. If the data is not available, it will be set to `null`,
		// so it is considered resolved.
		const hasResolved = (
			( hasFinishedResolution( 'getEntityRecords', [ 'root', 'user', { include: [ authorId ], context: 'view' } ] ) ||
				authorRecords === null ) &&
			( hasFinishedResolution( 'getEntityRecords', [ 'taxonomy', 'category', { include: categoryIds, context: 'view' } ] ) ||
				categoryRecords === null ) &&
			( hasFinishedResolution( 'getEntityRecords', [ 'taxonomy', 'post_tag', { include: tagIds, context: 'view' } ] ) ||
				tagRecords === null )
		);

		return { authorRecords, categoryRecords, tagRecords, isLoading, hasResolved };
	}, [] );

	/**
	 * Sets the post data when all the data is ready.
	 * This is done when all the data is fetched and resolved.
	 *
	 * @since 3.16.2
	 */
	useEffect( () => {
		const {
			authorRecords,
			categoryRecords,
			tagRecords,
			isLoading,
			hasResolved,
		} = postAttributes;

		const isPostDataReady: boolean = hasResolved && ! isLoading;

		if ( isPostDataReady ) {
			setPostData( {
				authors: authorRecords,
				categories: categoryRecords,
				tags: tagRecords,
				isReady: true,
			} );
		}
	}, [ postAttributes ] );

	return postData;
}
