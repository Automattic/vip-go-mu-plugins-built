import {
	BlockPattern,
	__experimentalBlockPatternsList as BlockPatternsList,
} from '@wordpress/block-editor';
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PatternSelectionModalProps {
	supportedPatterns: BlockPattern[];
	onClickPattern: ( pattern: BlockPattern ) => void;
	onClose: () => void;
}

export function PatternSelectionModal( props: PatternSelectionModalProps ) {
	return (
		<Modal
			overlayClassName="remote-data-blocks-pattern__selection-modal"
			title={ __( 'Choose a pattern' ) }
			onRequestClose={ props.onClose }
			isFullScreen
		>
			<div className="remote-data-blocks-pattern__selection-content">
				<BlockPatternsList
					blockPatterns={ props.supportedPatterns }
					shownPatterns={ props.supportedPatterns }
					onClickPattern={ props.onClickPattern }
				/>
			</div>
		</Modal>
	);
}
