import { useInnerBlocksProps } from '@wordpress/block-editor';

// Conditionally render inner blocks if this member of the loop is active.
export function LoopTemplateInnerBlocks( { isActive }: { isActive: boolean } ) {
	const innerBlocksProps = useInnerBlocksProps();

	if ( ! isActive ) {
		return null;
	}

	return <li { ...innerBlocksProps } />;
}
