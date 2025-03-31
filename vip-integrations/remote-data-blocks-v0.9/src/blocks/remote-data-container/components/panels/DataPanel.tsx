import {
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	ButtonGroup,
	PanelBody,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { sendTracksEvent } from '@/blocks/remote-data-container/utils/tracks';
import { getBlockDataSourceType } from '@/utils/localized-block-data';

interface DataPanelProps {
	refreshRemoteData: () => void;
	remoteData: RemoteData;
	resetRemoteData: () => void;
}

export function DataPanel( props: DataPanelProps ) {
	const { refreshRemoteData, remoteData, resetRemoteData } = props;

	const [ isResetConfirmOpen, setResetConfirmOpen ] = useState< boolean >( false );

	function onRefreshRemoteData(): void {
		refreshRemoteData();
		sendTracksEvent( 'remote_data_container_actions', {
			action: 'refresh_block_data',
			data_source_type: getBlockDataSourceType( remoteData.blockName ),
		} );
	}

	function resetBlock(): void {
		resetRemoteData();
		setResetConfirmOpen( false );
		sendTracksEvent( 'remote_data_container_actions', {
			action: 'reset_block_data',
			data_source_type: getBlockDataSourceType( remoteData.blockName ),
		} );
	}

	if ( ! remoteData ) {
		return null;
	}

	return (
		<PanelBody title={ __( 'Remote data management', 'remote-data-blocks' ) }>
			<ButtonGroup>
				<Button
					onClick={ onRefreshRemoteData }
					style={ {
						marginRight: '10px',
					} }
					variant="primary"
				>
					{ __( 'Refresh', 'remote-data-blocks' ) }
				</Button>
				<Button
					isDestructive={ true }
					onClick={ () => setResetConfirmOpen( true ) }
					variant="secondary"
				>
					{ __( 'Reset Block', 'remote-data-blocks' ) }
				</Button>
				{ isResetConfirmOpen && (
					<ConfirmDialog
						isOpen={ isResetConfirmOpen }
						confirmButtonText={ __( 'Reset Block', 'remote-data-blocks' ) }
						onCancel={ () => setResetConfirmOpen( false ) }
						onConfirm={ resetBlock }
						style={ {
							maxWidth: '20em',
						} }
					>
						{ __(
							'Are you sure you want to reset the block? This will remove all remote data and reset the block to its initial state.',
							'remote-data-blocks'
						) }
					</ConfirmDialog>
				) }
			</ButtonGroup>
		</PanelBody>
	);
}
