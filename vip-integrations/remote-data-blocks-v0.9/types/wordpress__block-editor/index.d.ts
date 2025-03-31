import '@wordpress/block-editor';
import { BlockAttributes, BlockInstance } from '@wordpress/blocks';
import { ReactElement } from '@wordpress/element/build-types/serialize';

/**
 * The types provided by @types/wordpress__block-editor are out of date.
 */

declare module '@wordpress/block-editor' {
	function BlockContextProvider( props: { children: ReactElement; value: object } ): JSX.Element;

	function useBlockEditContext(): {
		clientId: string;
		[ key: string ]: unknown;
	};

	function __experimentalUseBlockPreview( props: {
		blocks: BlockInstance[];
		props: object;
	} ): object;

	function __experimentalBlockPatternsList( props: {
		blockPatterns: BlockPattern[];
		onClickPattern: ( pattern: BlockPattern, blocks: BlockInstance[] ) => void;
		shownPatterns: BlockPattern[];
	} ): JSX.Element;

	// Incomplete type for our use case.
	interface BlockPattern {
		blocks: BlockInstance< RemoteDataInnerBlockAttributes >[];
		blockTypes?: string[];
		id?: number;
		name: string;
		source: string;
		syncStatus: string;
		title: string;
	}

	interface BlockEditorStoreActions {
		replaceInnerBlocks: ( clientId: string, blocks: BlockInstance[] ) => Promise< void >;
		selectBlock: ( clientId: string, initialPosition?: number? ) => Promise< void >;
	}

	interface BlockEditorStoreSelectors {
		__experimentalGetAllowedPatterns: ( clientId: string ) => BlockPattern[];
		getBlocks: < T extends BlockAttributes >( clientId: string ) => BlockInstance< T >[];
		getBlocksByClientId: < T extends BlockAttributes >( clientId: string ) => BlockInstance< T >[];
		getBlocksByName: ( name: string ) => string[];
		getPatternsByBlockTypes: ( name: string | string[], clientId?: string ) => BlockPattern[];
		getSettings: () => EditorSettings;
	}
}
