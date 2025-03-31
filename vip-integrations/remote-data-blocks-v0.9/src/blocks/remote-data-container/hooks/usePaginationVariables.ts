import { useState } from '@wordpress/element';

import {
	PAGINATION_CURSOR_NEXT_VARIABLE_TYPE,
	PAGINATION_CURSOR_PREVIOUS_VARIABLE_TYPE,
	PAGINATION_OFFSET_VARIABLE_TYPE,
	PAGINATION_PAGE_VARIABLE_TYPE,
	PAGINATION_PER_PAGE_VARIABLE_TYPE,
} from '@/blocks/remote-data-container/config/constants';

interface UsePaginationVariables {
	onFetch: ( remoteData: RemoteData ) => void;
	page: number;
	paginationQueryInput: RemoteDataQueryInput;
	perPage?: number;
	setPage: ( page: number ) => void;
	setPerPage: ( perPage: number ) => void;
	supportsCursorPagination: boolean;
	supportsOffsetPagination: boolean;
	supportsPagePagination: boolean;
	supportsPagination: boolean;
	supportsPerPage: boolean;
	totalItems?: number;
	totalPages?: number;
}

interface UsePaginationVariablesInput {
	initialPage?: number;
	initialPerPage?: number;
	inputVariables: InputVariable[];
}

export function usePaginationVariables( {
	initialPage = 1,
	initialPerPage,
	inputVariables,
}: UsePaginationVariablesInput ): UsePaginationVariables {
	const [ paginationData, setPaginationData ] = useState< RemoteDataPagination >();
	const [ page, setPage ] = useState< number >( initialPage );
	const [ perPage, setPerPage ] = useState< number | null >( initialPerPage ?? null );

	const cursorNextVariable = inputVariables?.find(
		input => input.type === PAGINATION_CURSOR_NEXT_VARIABLE_TYPE
	);
	const cursorPreviousVariable = inputVariables?.find(
		input => input.type === PAGINATION_CURSOR_PREVIOUS_VARIABLE_TYPE
	);
	const offsetVariable = inputVariables?.find(
		input => input.type === PAGINATION_OFFSET_VARIABLE_TYPE
	);
	const pageVariable = inputVariables?.find(
		input => input.type === PAGINATION_PAGE_VARIABLE_TYPE
	);
	const perPageVariable = inputVariables?.find(
		input => input.type === PAGINATION_PER_PAGE_VARIABLE_TYPE
	);

	const paginationQueryInput: RemoteDataQueryInput = {};

	// These will be amended below.
	let supportsCursorPagination = false;
	let supportsOffsetPagination = false;
	let supportsPagePagination = false;
	let setPageFn: ( page: number ) => void = () => {};

	if ( cursorNextVariable && cursorPreviousVariable ) {
		setPageFn = setPageForCursorPagination;
		supportsCursorPagination = true;
		Object.assign( paginationQueryInput, {
			[ cursorNextVariable.slug ]: paginationData?.cursorNext,
			[ cursorPreviousVariable.slug ]: paginationData?.cursorPrevious,
		} );
	} else if ( offsetVariable && perPage ) {
		setPageFn = setPage;
		supportsOffsetPagination = true;
		Object.assign( paginationQueryInput, { [ offsetVariable.slug ]: page * perPage } );
	} else if ( pageVariable ) {
		setPageFn = setPage;
		supportsPagePagination = true;
		Object.assign( paginationQueryInput, { [ pageVariable.slug ]: page } );
	}

	if ( perPageVariable && perPage ) {
		Object.assign( paginationQueryInput, { [ perPageVariable.slug ]: perPage } );
	}

	const supportsPagination =
		supportsCursorPagination || supportsPagePagination || supportsOffsetPagination;
	const totalItems = paginationData?.totalItems;
	const totalPages = totalItems && perPage ? Math.ceil( totalItems / perPage ) : undefined;

	function onFetch( remoteData: RemoteData ): void {
		if ( ! supportsPagination ) {
			return;
		}

		setPaginationData( remoteData.pagination );

		// We need a perPage value to calculate the total pages, so inpsect the results.
		if ( ! perPage && remoteData.results.length ) {
			setPerPage( remoteData.results.length );
		}
	}

	// With cursor pagination, we can only go one page at a time.
	function setPageForCursorPagination( newPage: number ): void {
		if ( newPage > page ) {
			if ( totalPages ) {
				setPage( Math.min( totalPages, page + 1 ) );
				return;
			}

			setPage( page + 1 );
			return;
		}

		if ( newPage < page ) {
			setPage( Math.max( 1, page - 1 ) );
		}
	}

	return {
		onFetch,
		page,
		paginationQueryInput,
		perPage: perPage ?? undefined,
		setPage: setPageFn,
		setPerPage: supportsPagination ? setPerPage : () => {},
		supportsCursorPagination,
		supportsOffsetPagination,
		supportsPagePagination,
		supportsPagination,
		supportsPerPage: Boolean( perPageVariable ),
		totalItems,
		totalPages,
	};
}
