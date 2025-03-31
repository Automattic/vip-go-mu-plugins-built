import { BlockPattern } from '@wordpress/block-editor';
import { Button, Placeholder } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { blockDefault } from '@wordpress/icons';

import { PatternSelectionModal } from '@/blocks/remote-data-container/components/pattern-selection/PatternSelectionModal';
import { sendTracksEvent } from '@/blocks/remote-data-container/utils/tracks';
import { getBlockDataSourceType } from '@/utils/localized-block-data';

interface PatternSelectionProps {
	blockName: string;
	onCancel: () => void;
	onSelectPattern: ( pattern: BlockPattern ) => void;
	supportedPatterns: BlockPattern[];
}

export function PatternSelection( props: PatternSelectionProps ) {
	const [ showModal, setShowModal ] = useState< boolean >( false );

	function onClickPattern( pattern: BlockPattern ) {
		props.onSelectPattern( pattern );
		setShowModal( false );
		sendTracksEvent( 'add_block', {
			action: 'select_pattern',
			selected_option: 'select_from_list',
			data_source_type: getBlockDataSourceType( props.blockName ),
		} );
	}

	function onClose() {
		setShowModal( false );
	}

	function onClickManualEdit(): void {
		props.onCancel();
		sendTracksEvent( 'add_block', {
			action: 'select_pattern',
			selected_option: 'manual_edit',
			data_source_type: getBlockDataSourceType( props.blockName ),
		} );
	}

	if ( showModal ) {
		return (
			<PatternSelectionModal
				supportedPatterns={ props.supportedPatterns }
				onClickPattern={ onClickPattern }
				onClose={ onClose }
			/>
		);
	}

	return (
		<Placeholder icon={ blockDefault } label={ __( 'Choose a pattern to display your data' ) }>
			<Button onClick={ () => setShowModal( true ) } variant="primary">
				{ __( 'Choose a pattern' ) }
			</Button>
			<Button onClick={ onClickManualEdit } variant="secondary">
				{ __( 'Edit manually' ) }
			</Button>
		</Placeholder>
	);
}
