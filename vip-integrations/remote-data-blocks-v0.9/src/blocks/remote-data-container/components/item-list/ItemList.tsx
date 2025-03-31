import { useInstanceId } from '@wordpress/compose';
import { Action, DataViews, View } from '@wordpress/dataviews/wp';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { ItemListField } from '@/blocks/remote-data-container/components/item-list/ItemListField';
import { usePatterns } from '@/blocks/remote-data-container/hooks/usePatterns';
import { removeNullValuesFromObject } from '@/utils/type-narrowing';

function getResultsWithId( results: RemoteDataResult[], instanceId: string ): RemoteDataResult[] {
	return ( results ?? [] ).map( ( result: RemoteDataResult ) => {
		const parsedItem = removeNullValuesFromObject( result );

		if ( parsedItem.id ) {
			return parsedItem;
		}

		// ensure each result has an 'id' key
		const idKey = Object.keys( parsedItem ).find( key => /(^|_)(id)$/i.test( key ) );
		return {
			...parsedItem,
			id: idKey ? parsedItem[ idKey ] : instanceId,
		};
	} );
}

interface ItemListProps {
	availableBindings: Record< string, RemoteDataBinding >;
	blockName: string;
	loading: boolean;
	onSelect: ( data: RemoteDataQueryInput ) => void;
	onSelectField?: ( data: FieldSelection, fieldValue: string ) => void;
	page: number;
	perPage?: number;
	remoteData?: RemoteData;
	searchInput: string;
	setPage: ( newPage: number ) => void;
	setSearchInput: ( newValue: string ) => void;
	supportsSearch: boolean;
	totalItems?: number;
	totalPages?: number;
}

export function ItemList( props: ItemListProps ) {
	const {
		availableBindings,
		blockName,
		loading,
		onSelect,
		onSelectField,
		page,
		perPage,
		remoteData,
		searchInput,
		setPage,
		setSearchInput,
		supportsSearch,
		totalItems,
		totalPages,
	} = props;
	const { defaultPattern: pattern } = usePatterns( blockName );
	const instanceId = useInstanceId( ItemList, blockName );

	const results = remoteData?.results ?? [];
	const data = loading ? [] : getResultsWithId( results ?? [], instanceId );

	// get fields from results data to use as columns
	const fieldNames: string[] = Array.from(
		new Set(
			data
				?.flatMap( item => Object.keys( item ) )
				.filter(
					key => key in availableBindings && availableBindings[ key ]?.type !== 'id' // filter out ID fields to hide from table
				)
		)
	);

	// Find title field from availableBindings by checking type
	const titleField = Object.entries( availableBindings ).find(
		( [ _, binding ] ) => binding.type === 'string' && binding.name.toLowerCase() === 'title'
	)?.[ 0 ];

	// Find media field from availableBindings by checking type
	const mediaField = Object.entries( availableBindings ).find(
		( [ _, binding ] ) => binding.type === 'image_url'
	)?.[ 0 ];

	const fields = fieldNames.map( field => ( {
		id: field,
		label: availableBindings[ field ]?.name ?? field,
		enableGlobalSearch: true,
		getValue: ( { item }: { item: RemoteDataResult } ) => item[ field ]?.toString() ?? '',
		render: ( { item }: { item: RemoteDataResult } ) => (
			<ItemListField
				blockName={ blockName }
				field={ field }
				item={ item }
				mediaField={ mediaField }
				onSelect={ onSelect }
				onSelectField={ onSelectField }
				remoteData={ remoteData }
			/>
		),
		enableSorting: field !== mediaField,
	} ) );

	// hide media and title fields from table view if defined to avoid duplication
	const tableFields = fieldNames.filter( field => field !== mediaField && field !== titleField );

	const [ view, setView ] = useState< View >( {
		type: 'table' as const,
		perPage: perPage ?? data.length,
		page,
		search: searchInput,
		fields: tableFields,
		filters: [],
		layout: {},
		titleField,
		mediaField,
	} );

	function onChangeView( newView: View ) {
		setPage( newView.page ?? 1 );
		setSearchInput( newView.search ?? '' );
		setView( newView );
	}

	const defaultLayouts = mediaField
		? {
				table: {},
				grid: {},
		  }
		: { table: {} };

	// Hide actions for field shortcode selection
	const chooseItemAction = {
		id: 'choose',
		icon: <>{ __( 'Choose' ) }</>,
		isPrimary: true,
		label: '',
		callback: ( items: RemoteDataResult[] ) => {
			items.map( item => onSelect( item ) );
		},
	};
	const actions: Action< RemoteDataResult >[] = onSelectField ? [] : [ chooseItemAction ];

	return (
		<DataViews< RemoteDataResult >
			actions={ actions }
			data={ data }
			defaultLayouts={ defaultLayouts }
			fields={ fields }
			getItemId={ ( item: { id?: string } ) => item.id || '' }
			isLoading={ loading || ! pattern || ! results }
			isItemClickable={ () => true }
			onClickItem={ item => onSelect( item ) }
			onChangeView={ onChangeView }
			paginationInfo={ {
				totalItems: totalItems ?? data.length,
				totalPages: totalPages ?? 1,
			} }
			search={ supportsSearch }
			view={ view }
		/>
	);
}
