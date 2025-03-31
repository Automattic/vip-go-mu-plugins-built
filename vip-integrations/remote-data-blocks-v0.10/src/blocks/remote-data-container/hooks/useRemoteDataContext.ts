import { useContext } from '@wordpress/element';

import { REMOTE_DATA_CONTEXT_KEY } from '@/blocks/remote-data-container/config/constants';
import { LoopIndexContext } from '@/blocks/remote-data-container/context/LoopIndexContext';
import { PATTERN_BLOCK_TYPE_POST_META_KEY } from '@/config/constants';
import { useEditedPostAttribute } from '@/hooks/useEditedPostAttribute';
import { getBlockConfig } from '@/utils/localized-block-data';

export interface RemoteDataContext {
	index: number;
	remoteData?: RemoteData;
}

export function useRemoteDataContext( context: Record< string, unknown > ): RemoteDataContext {
	// If we are editing a pattern and that pattern has been associated with a
	// remote data block, we need to inject some example remote data into the
	// block that blocks can bind to.
	const { postMeta, postType } = useEditedPostAttribute( getEditedPostAttribute => ( {
		postMeta: getEditedPostAttribute< Record< string, unknown > >( 'meta' ) ?? {},
		postType: getEditedPostAttribute< string >( 'type' ) ?? '',
	} ) );
	const { index } = useContext( LoopIndexContext );

	if ( 'wp_block' === postType ) {
		const remoteDataBlockName = String( postMeta[ PATTERN_BLOCK_TYPE_POST_META_KEY ] ?? '' );
		const blockConfig = getBlockConfig( remoteDataBlockName );

		if ( blockConfig ) {
			return {
				index,
				remoteData: {
					blockName: remoteDataBlockName,
					metadata: {},
					queryInputs: [],
					queryKey: 'Example Query Key',
					resultId: '',
					results: [
						{
							// Example result for patterns.
							result: Object.fromEntries(
								Object.entries( blockConfig.availableBindings ).map( ( [ key, value ] ) => [
									key,
									{
										name: value.name,
										type: value.type,
										value: value.name,
									},
								] )
							),
							uuid: 'Example Entity ID',
						},
					],
				},
			};
		}
	}

	return {
		index,
		remoteData: context[ REMOTE_DATA_CONTEXT_KEY ] as RemoteData | undefined,
	};
}
