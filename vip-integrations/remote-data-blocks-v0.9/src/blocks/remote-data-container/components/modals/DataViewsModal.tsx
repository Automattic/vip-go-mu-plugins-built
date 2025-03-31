import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { ItemList } from '@/blocks/remote-data-container/components/item-list/ItemList';
import { useModalState } from '@/blocks/remote-data-container/hooks/useModalState';
import { useRemoteData } from '@/blocks/remote-data-container/hooks/useRemoteData';
import { sendTracksEvent } from '@/blocks/remote-data-container/utils/tracks';
import {
	getBlockAvailableBindings,
	getBlockConfig,
	getBlockDataSourceType,
} from '@/utils/localized-block-data';

interface DataViewsModalProps {
	className?: string;
	blockName: string;
	headerImage?: string;
	onSelect?: ( data: RemoteDataQueryInput ) => void;
	onSelectField?: ( data: FieldSelection, fieldValue: string ) => void;
	queryKey: string;
	renderTrigger?: ( props: { onClick: () => void } ) => React.ReactNode;
	title?: string;
}

export const DataViewsModal: React.FC< DataViewsModalProps > = props => {
	const { className, blockName, onSelect, onSelectField, queryKey, renderTrigger, title } = props;

	const blockConfig = getBlockConfig( blockName );
	const availableBindings = getBlockAvailableBindings( blockName );

	const { close, isOpen, open } = useModalState();
	const {
		data,
		loading,
		page,
		searchInput,
		setPage,
		setSearchInput,
		supportsSearch,
		totalItems,
		totalPages,
	} = useRemoteData( { blockName, fetchOnMount: true, queryKey } );

	function onSelectItem( input: RemoteDataQueryInput ): void {
		onSelect?.( input );
		sendTracksEvent( 'add_block', {
			action: 'select_item',
			selected_option: 'search_from_list',
			data_source_type: getBlockDataSourceType( blockName ),
		} );
		close();
	}

	const triggerElement = renderTrigger ? (
		renderTrigger( { onClick: open } )
	) : (
		<Button variant="primary" onClick={ open }>
			{ __( 'Choose' ) }
		</Button>
	);

	return (
		<>
			{ triggerElement }
			{ isOpen && (
				<Modal
					className={ className }
					isFullScreen
					onRequestClose={ close }
					title={ title ?? blockConfig?.settings?.title }
				>
					<ItemList
						availableBindings={ availableBindings }
						blockName={ blockName }
						loading={ loading }
						onSelect={ onSelect ? onSelectItem : close }
						onSelectField={ onSelectField }
						page={ page }
						remoteData={ data }
						searchInput={ searchInput }
						setPage={ setPage }
						setSearchInput={ setSearchInput }
						supportsSearch={ supportsSearch }
						totalItems={ totalItems }
						totalPages={ totalPages }
					/>
				</Modal>
			) }
		</>
	);
};
