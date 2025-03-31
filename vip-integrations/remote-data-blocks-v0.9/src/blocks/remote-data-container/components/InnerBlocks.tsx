import { InnerBlocks as CoreInnerBlocks } from '@wordpress/block-editor';
import { BlockInstance } from '@wordpress/blocks';

import { LoopTemplate } from '@/blocks/remote-data-container/components/loop-template/LoopTemplate';

interface InnerBlocksProps {
	blockConfig: BlockConfig;
	getInnerBlocks: ( result: RemoteDataResult ) => BlockInstance< RemoteDataInnerBlockAttributes >[];
	remoteData: RemoteData;
}

export function InnerBlocks( props: InnerBlocksProps ) {
	const {
		blockConfig: { loop },
		getInnerBlocks,
		remoteData,
	} = props;

	if ( loop ) {
		return <LoopTemplate getInnerBlocks={ getInnerBlocks } remoteData={ remoteData } />;
	}

	return <CoreInnerBlocks renderAppender={ CoreInnerBlocks.DefaultBlockAppender } />;
}
