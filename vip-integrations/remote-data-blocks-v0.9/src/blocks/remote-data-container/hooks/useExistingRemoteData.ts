import { BlockEditorStoreSelectors, store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

import { getBlocksConfig } from '@/utils/localized-block-data';

// In contrast to `useRemoteData`, this hook is used to retrieve existing remote
// from all blocks in the editors. This is useful when we want to display a list
// of data that has already been fetched and stored in block attributes.
export function useExistingRemoteData(): RemoteData[] {
	const { getBlocksByName, getBlocksByClientId } = useSelect< BlockEditorStoreSelectors >(
		blockEditorStore,
		[]
	);

	return Object.keys( getBlocksConfig() ).flatMap( blockName => {
		const blocks = getBlocksByName( blockName );

		return blocks
			.map( clientId => {
				const block = getBlocksByClientId< RemoteDataBlockAttributes >( clientId )[ 0 ];
				return block?.attributes?.remoteData;
			} )
			.filter( ( maybeRemoteData ): maybeRemoteData is RemoteData => Boolean( maybeRemoteData ) );
	} );
}
