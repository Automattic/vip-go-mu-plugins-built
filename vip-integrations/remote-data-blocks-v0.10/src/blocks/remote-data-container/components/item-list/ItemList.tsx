import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { ItemListField } from '@/blocks/remote-data-container/components/item-list/ItemListField';
import {
	ID_FIELD_TYPES,
	IMAGE_URL_FIELD_TYPES,
} from '@/blocks/remote-data-container/config/constants';
import { usePatterns } from '@/blocks/remote-data-container/hooks/usePatterns';
import { getRemoteDataResultValue } from '@/utils/remote-data';

import type { Action, View } from '@wordpress/dataviews/wp';

export interface ItemListProps {
	blockName: string;
	hasNextPage: boolean;
	loading: boolean;
	onSelect?: ( results: RemoteDataApiResult[] ) => void;
	onSelectField?: ( data: FieldSelection, fieldValue: string ) => void;
	page: number;
	perPage?: number;
	results?: RemoteDataApiResult[];
	searchInput: string;
	selectionIds: string[];
	setPage: ( newPage: number ) => void;
	setPerPage: ( newPerPage: number ) => void;
	setSearchInput: ( newValue: string ) => void;
	setSelectionIds: ( ids: string[] ) => void;
	supportsSearch: boolean;
	totalItems?: number;
	totalPages?: number;
}

export function ItemList( props: ItemListProps ) {
	const {
		blockName,
		hasNextPage,
		loading,
		onSelect,
		onSelectField,
		page,
		perPage,
		results = [],
		searchInput,
		selectionIds,
		setPage,
		setPerPage,
		setSearchInput,
		setSelectionIds,
		supportsSearch,
		totalItems,
		totalPages,
	} = props;
	const { DataViews } = window.LockedPrivateDataViews;
	const { defaultPattern: pattern } = usePatterns( blockName );

	// Get fields from the first result, if present.
	const firstResult = results?.[ 0 ]?.result ?? {};

	// Filter out ID fields from columns.
	const fieldNames: string[] = Object.entries( firstResult )
		.filter( ( [ _slug, data ] ) => ! ID_FIELD_TYPES.includes( data.type ) )
		.map( ( [ slug ] ) => slug );

	// Find title field from by checking type
	const titleField = Object.entries( firstResult ).find(
		( [ _slug, data ] ) => data.type === 'title'
	)?.[ 0 ];

	// Find media field from availableBindings by checking type
	const mediaField = Object.entries( firstResult ).find( ( [ _slug, data ] ) =>
		IMAGE_URL_FIELD_TYPES.includes( data.type )
	)?.[ 0 ];

	const fields = fieldNames.map( field => ( {
		id: field,
		label: firstResult[ field ]?.name ?? field,
		enableGlobalSearch: true,
		getValue: ( { item }: { item: RemoteDataApiResult } ) =>
			getRemoteDataResultValue( item, field ),
		render: ( { item }: { item: RemoteDataApiResult } ) => (
			<ItemListField
				blockName={ blockName }
				field={ field }
				item={ item }
				mediaField={ mediaField }
				onSelectField={ onSelectField }
			/>
		),
		enableSorting: field !== mediaField,
	} ) );

	// hide media and title fields from table view if defined to avoid duplication
	const tableFields = fieldNames.filter( field => field !== mediaField && field !== titleField );

	const [ view, setView ] = useState< View >( {
		type: 'table' as const,
		perPage: perPage ?? results.length,
		page,
		search: searchInput,
		fields: tableFields,
		filters: [],
		layout: {},
		titleField,
		mediaField,
	} );

	useEffect( () => {
		setView( currentView => ( {
			...currentView,
			fields: tableFields,
			mediaField,
			titleField,
		} ) );
	}, [ [ mediaField, titleField, ...tableFields ].join( ';' ) ] );

	function onChangeView( newView: View ) {
		setPage( newView.page ?? 1 );
		setPerPage( newView.perPage ?? perPage ?? results.length );
		setSearchInput( newView.search ?? '' );
		setView( newView );
	}

	const defaultLayouts = mediaField
		? {
				table: {},
				grid: {},
		  }
		: { table: {} };

	const chooseItemAction = {
		id: 'choose',
		icon: <>{ __( 'Choose' ) }</>,
		isPrimary: true,
		label: '',
		callback: ( items: RemoteDataApiResult[] ) => {
			onSelect?.( items );
		},
		supportsBulk: true,
	};

	// Only show the action if onSelect is defined and there are results.
	let actions: Action< RemoteDataApiResult >[] = [];
	if ( onSelect && results?.length ) {
		actions = [ chooseItemAction ];
	}

	return (
		<>
			<DataViews< RemoteDataApiResult >
				actions={ actions }
				data={ results }
				defaultLayouts={ defaultLayouts }
				fields={ fields }
				getItemId={ ( item: RemoteDataApiResult ) => item.uuid }
				isLoading={ loading || ! pattern || ! results }
				isItemClickable={ () => true }
				onChangeSelection={ setSelectionIds }
				onChangeView={ onChangeView }
				paginationInfo={ {
					totalItems: totalItems ?? results.length,
					totalPages: totalPages ?? ( hasNextPage ? page + 1 : Math.max( 1, page ) ),
				} }
				search={ supportsSearch }
				selection={ selectionIds }
				view={ view }
			/>
		</>
	);
}
