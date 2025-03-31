import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

import { CONTAINER_CLASS_NAME } from '@/blocks/remote-data-container/config/constants';

export function Save() {
	const blockProps = useBlockProps.save( {
		className: CONTAINER_CLASS_NAME,
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}
