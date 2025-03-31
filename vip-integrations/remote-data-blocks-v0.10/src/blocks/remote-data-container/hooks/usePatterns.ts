import {
	BlockEditorStoreActions,
	BlockEditorStoreSelectors,
	BlockPattern,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { BlockInstance, cloneBlock, createBlock } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';

import {
	getBoundAttributeEntries,
	getMismatchedAttributes,
	hasBlockBinding,
	isSyncedPattern,
} from '@/utils/block-binding';
import { getBlockConfig } from '@/utils/localized-block-data';

export function cloneBlockWithAttributes(
	block: BlockInstance,
	attributes: RemoteDataApiResult,
	remoteDataBlockName: string
): BlockInstance {
	const mismatchedAttributes = getMismatchedAttributes(
		block.attributes,
		[ attributes ],
		remoteDataBlockName
	);
	const newInnerBlocks = block.innerBlocks?.map( innerBlock =>
		cloneBlockWithAttributes( innerBlock, attributes, remoteDataBlockName )
	);

	return cloneBlock( block, mismatchedAttributes, newInnerBlocks );
}

export function usePatterns( remoteDataBlockName: string, rootClientId: string = '' ) {
	const { patterns } = getBlockConfig( remoteDataBlockName ) ?? {};
	const { replaceInnerBlocks } = useDispatch< BlockEditorStoreActions >( blockEditorStore );

	const { getBlocks, getPatternsByBlockTypes, allowedPatterns } = useSelect<
		BlockEditorStoreSelectors,
		Pick< BlockEditorStoreSelectors, 'getBlocks' | 'getPatternsByBlockTypes' > & {
			allowedPatterns: BlockPattern[];
		}
	>(
		select => {
			const store = select( blockEditorStore );
			return {
				getBlocks: store.getBlocks,
				getPatternsByBlockTypes: store.getPatternsByBlockTypes,
				allowedPatterns: store.__experimentalGetAllowedPatterns( rootClientId ) ?? [],
			};
		},
		[ remoteDataBlockName, rootClientId ]
	);

	// Extract patterns with defined roles
	const patternsByBlockTypes = getPatternsByBlockTypes( remoteDataBlockName );
	const defaultPattern = patternsByBlockTypes.find( ( { name } ) => name === patterns?.default );
	const innerBlocksPattern = patternsByBlockTypes.find(
		( { name } ) => name === patterns?.inner_blocks
	);

	const returnValue = {
		defaultPattern,
		getInnerBlocks: (
			result: RemoteDataApiResult
		): BlockInstance< RemoteDataInnerBlockAttributes >[] => {
			return getBlocks< RemoteDataInnerBlockAttributes >( rootClientId ).map( block =>
				cloneBlockWithAttributes( block, result, remoteDataBlockName )
			);
		},
		getSupportedPatterns: ( result?: RemoteDataApiResult ): BlockPattern[] => {
			const supportedPatterns = allowedPatterns.filter(
				pattern =>
					pattern?.blockTypes?.includes( remoteDataBlockName ) ||
					pattern.blocks.some( block => hasBlockBinding( block, remoteDataBlockName ) )
			);

			// If no result is provided, return the supported patterns as is.
			if ( ! result ) {
				return supportedPatterns;
			}

			// Clone the pattern blocks and inject the provided result data so that
			// it can be previewed.
			return supportedPatterns.map( pattern => ( {
				...pattern,
				blocks: pattern.blocks.map( block =>
					cloneBlockWithAttributes( block, result, remoteDataBlockName )
				),
			} ) );
		},
		innerBlocksPattern,
		insertPatternBlocks: ( pattern: BlockPattern ): void => {
			// If the pattern is a synced pattern, insert it directly.
			if ( isSyncedPattern( pattern ) ) {
				const syncedPattern = createBlock( 'core/block', { ref: pattern.id } );
				replaceInnerBlocks( rootClientId, [ syncedPattern ] ).catch( () => {} );
				return;
			}

			// Clone the pattern blocks with bindings to allow the user to make changes.
			// We always insert a single representation of the pattern, even if it is a
			// collection. The InnerBlocksLoop component will handle rendering the rest
			// of the collection.
			const patternBlocks =
				pattern.blocks.map( block => {
					const boundAttributes = getBoundAttributeEntries( block.attributes, remoteDataBlockName );

					if ( ! boundAttributes.length ) {
						return block;
					}

					return cloneBlock( block );
				} ) ?? [];

			replaceInnerBlocks( rootClientId, patternBlocks ).catch( () => {} );
		},
		resetInnerBlocks: (): void => {
			replaceInnerBlocks( rootClientId, [] ).catch( () => {} );
		},
	};

	return returnValue;
}
