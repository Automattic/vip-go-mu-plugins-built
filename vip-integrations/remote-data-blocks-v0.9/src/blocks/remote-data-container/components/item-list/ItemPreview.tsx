import { __experimentalUseBlockPreview as useBlockPreview } from '@wordpress/block-editor';
import { BlockInstance } from '@wordpress/blocks';
import { memo } from '@wordpress/element';

interface ItemPreviewProps {
	blocks: BlockInstance[];
	isHidden?: boolean;
	onSelect: () => void;
}

// Use the experimental block preview hook to render a preview of blocks when
// they are not being actively edited. This preview is not interactive and are
// not "real" blocks so they don't show up in the outline view.
//
// We hide the preview for the blocks that are being edited so they don't
// duplicate.
//
// This is a mimick of the PostTemplate component from Gutenberg core.
export function UnmemoizedItemPreview( props: ItemPreviewProps ) {
	const { blocks, isHidden = false, onSelect } = props;
	const blockPreviewProps = useBlockPreview( { blocks, props: {} } );

	const style = {
		cursor: 'pointer',
		display: isHidden ? 'none' : undefined,
		listStyle: 'none',
	};

	return (
		<li
			{ ...blockPreviewProps }
			onClick={ onSelect }
			onKeyDown={ onSelect }
			// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
			role="button"
			style={ style }
			tabIndex={ 0 }
		/>
	);
}

export const ItemPreview = memo( UnmemoizedItemPreview );
