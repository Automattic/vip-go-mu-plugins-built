import { useEntityProp } from '@wordpress/core-data';

type UseEntityPropReturnValue = [
	// This is the post meta for the "saved" version of this post. It's not currently
	// updated in real-time.
	Record< string, unknown >,

	// We can use this function to update the post meta if needed.
	( meta: Record< string, unknown > ) => void,

	// This is the "fullValue" of post meta from the REST API, containing "raw"
	// and "rendered" values.
	Record< string, unknown >
];

export interface UsePostMetaReturnValue {
	postMeta: UseEntityPropReturnValue[ 0 ];
	updatePostMeta: UseEntityPropReturnValue[ 1 ];
}

export function usePostMeta( postId: number, postType: string ): UsePostMetaReturnValue {
	const [ postMeta, updatePostMeta ] = useEntityProp(
		'postType',
		postType,
		'meta',
		postId
	) as UseEntityPropReturnValue;

	return { postMeta, updatePostMeta };
}
