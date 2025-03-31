import { BaseControl, Button, Modal, __experimentalHStack as HStack } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { ItemList } from '@/blocks/remote-data-container/components/item-list/ItemList';
import { useModalState } from '@/blocks/remote-data-container/hooks/useModalState';
import { useRemoteData } from '@/blocks/remote-data-container/hooks/useRemoteData';
import { sendTracksEvent } from '@/blocks/remote-data-container/utils/tracks';
import { getBlockConfig, getBlockDataSourceType } from '@/utils/localized-block-data';
import { createQueryInputsFromRemoteDataResults } from '@/utils/remote-data';

interface DataViewsModalProps {
	className?: string;
	blockName: string;
	headerImage?: string;
	onSelect?: ( data: RemoteDataQueryInput[] ) => void;
	onSelectField?: ( data: FieldSelection, fieldValue: string ) => void;
	queryKey: string;
	renderTrigger?: ( props: { onClick: () => void } ) => React.ReactNode;
	title?: string;
}

export const DataViewsModal: React.FC< DataViewsModalProps > = props => {
	const { className, blockName, onSelect, onSelectField, queryKey, renderTrigger, title } = props;

	const blockConfig = getBlockConfig( blockName );

	// Multi-selected items
	const [ selection, setSelection ] = useState< RemoteDataApiResult[] >( [] );

	// Total selected items
	const itemCountLabel =
		selection.length > 1 ? __( 'items selected in total' ) : __( 'item selected in total' );

	const { close, isOpen, open } = useModalState();
	const {
		data,
		hasNextPage,
		loading,
		page,
		searchInput,
		setPage,
		setPerPage,
		setSearchInput,
		supportsSearch,
		totalItems,
		totalPages,
	} = useRemoteData( { blockName, fetchOnMount: true, queryKey } );

	// For selection, DataViews transacts only in IDs, so we provide the UUID from
	// the API response as a synthetic ID and map them to the full result.
	// DataViews is only "aware" of the data it is rendering, so we keep track of
	// selections from previous result pages in the selection state.
	const selectionIds = selection.map( item => item.uuid );
	const allIdsFromCurrentPage = data?.results?.map( result => result.uuid ) ?? [];

	function setSelectionIds( uuids: string[] ): void {
		const selectionIdsFromOtherPages = selectionIds.filter(
			uuid => ! allIdsFromCurrentPage.includes( uuid )
		);
		const newSelectionIds = Array.from(
			new Set< string >( [ ...selectionIdsFromOtherPages, ...uuids ] )
		);
		const newSelection = newSelectionIds
			.map(
				uuid =>
					data?.results?.find( result => uuid === result.uuid ) ??
					selection.find( result => uuid === result.uuid ) ??
					null
			)
			.filter( ( result ): result is RemoteDataApiResult => result !== null );
		setSelection( newSelection );
	}

	function save( results: RemoteDataApiResult[] ): void {
		if ( ! results.length ) {
			return;
		}

		onSelect?.( createQueryInputsFromRemoteDataResults( results ) );
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
					className={ `${ className } rdb-dataviews-bulk-actions-modal` }
					isFullScreen
					onRequestClose={ close }
					title={ blockConfig?.settings?.title ?? title }
				>
					<ItemList
						blockName={ blockName }
						hasNextPage={ hasNextPage ?? false }
						loading={ loading }
						onSelect={ save }
						onSelectField={ onSelectField }
						page={ page }
						results={ loading ? undefined : data?.results }
						searchInput={ searchInput }
						selectionIds={ selectionIds }
						setPage={ setPage }
						setPerPage={ setPerPage }
						setSearchInput={ setSearchInput }
						setSelectionIds={ setSelectionIds }
						supportsSearch={ supportsSearch }
						totalItems={ totalItems }
						totalPages={ totalPages }
					/>
					{ onSelect && ! loading && (
						<>
							{ selection.length > 1 && (
								<BaseControl
									className="rdb-dataviews-bulk-actions-footer__item-count-total"
									__nextHasNoMarginBottom
								>
									<BaseControl.VisualLabel style={ { marginBottom: '0' } }>
										{ selection.length } { itemCountLabel }
									</BaseControl.VisualLabel>
								</BaseControl>
							) }

							<HStack className="rdb-dataviews-bulk-actions-footer__selection-total">
								<Button
									disabled={ selection.length === 0 }
									onClick={ () => setSelectionIds( [] ) }
									variant="secondary"
								>
									{ __( 'Cancel' ) }
								</Button>
								<Button
									disabled={ selection.length === 0 }
									onClick={ () => save( selection ) }
									variant="primary"
								>
									{ __( 'Save' ) }
								</Button>
							</HStack>
						</>
					) }
				</Modal>
			) }
		</>
	);
};
