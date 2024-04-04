/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import { store as coreStore, Taxonomy, User } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../@types/gutenberg/types';

export interface PostDataStore {
	authors: User[] | undefined;
	categories: Taxonomy[] | undefined;
	tags: Taxonomy[] | undefined;
	isReady: boolean;
}

/**
 * Hook to get the post data for the current post.
 *
 * @since 3.14.3
 *
 * @return { PostDataStore } The post data for the current post.
 */

export function usePostData(): PostDataStore {
	const { authors, categories, tags, isReady } = useSelect( ( select ) => {
		const { getEditedPostAttribute } = select( editorStore ) as GutenbergFunction;
		const { getEntityRecords } = select( coreStore );

		const authorId = getEditedPostAttribute( 'author' );
		const categoryIds = getEditedPostAttribute( 'categories' );
		const tagIds = getEditedPostAttribute( 'tags' );

		const authorRecords: User[] | undefined = getEntityRecords(
			'root', 'user', { include: [ authorId ] }
		) ?? undefined; // Coalescing null to undefined

		const categoryRecords: Taxonomy[] | undefined = getEntityRecords(
			'taxonomy', 'category', { include: categoryIds }
		) ?? undefined; // Coalescing null to undefined

		const tagRecords: Taxonomy[] | undefined = getEntityRecords(
			'taxonomy', 'post_tag', { include: tagIds }
		) ?? undefined; // Coalescing null to undefined

		const isPostDataReady: boolean = (
			authorRecords !== undefined &&
			categoryRecords !== undefined &&
			tagRecords !== undefined
		);

		return {
			authors: authorRecords,
			categories: categoryRecords,
			tags: tagRecords,
			isReady: isPostDataReady,
		};
	}, [] );

	return { authors, categories, tags, isReady };
}
