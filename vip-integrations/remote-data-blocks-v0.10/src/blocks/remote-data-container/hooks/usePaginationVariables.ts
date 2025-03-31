import { useState } from '@wordpress/element';

import {
	PAGINATION_CURSOR_NEXT_VARIABLE_TYPE,
	PAGINATION_CURSOR_PREVIOUS_VARIABLE_TYPE,
	PAGINATION_CURSOR_VARIABLE_TYPE,
	PAGINATION_OFFSET_VARIABLE_TYPE,
	PAGINATION_PAGE_VARIABLE_TYPE,
	PAGINATION_PER_PAGE_VARIABLE_TYPE,
} from '@/blocks/remote-data-container/config/constants';

interface UsePaginationVariables {
	hasNextPage?: boolean;
	onFetch: ( remoteData: RemoteData ) => void;
	page: number;
	paginationQueryInput: RemoteDataQueryInput;
	perPage?: number;
	setPage: ( page: number ) => void;
	setPerPage: ( perPage: number ) => void;
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

interface PaginationCursors {
	next?: string;
	previous?: string;
}

export enum PaginationType {
	CURSOR_SIMPLE = 'cursor_simple',
	CURSOR = 'cursor',
	OFFSET = 'offset',
	NONE = 'none',
	PAGE = 'page',
}

export function usePaginationVariables( {
	initialPage = 1,
	initialPerPage,
	inputVariables,
}: UsePaginationVariablesInput ): UsePaginationVariables {
	const [ paginationData, setPaginationData ] = useState< RemoteDataPagination >();
	const [ page, setPage ] = useState< number >( initialPage );
	const [ perPage, setPerPage ] = useState< number | null >( initialPerPage ?? null );
	const [ cursors, setCursors ] = useState< PaginationCursors >( {} );

	const cursorVariable = inputVariables?.find(
		input => input.type === PAGINATION_CURSOR_VARIABLE_TYPE
	);
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
	const nonFirstPage = page > 1;
	const calculatedPerPage = perPage ?? paginationData?.perPage ?? 10;

	// These will be amended below.
	let hasNextPage = Boolean( paginationData?.hasNextPage ?? paginationData?.cursorNext );
	let paginationType = PaginationType.NONE;
	let setPageFn: ( page: number ) => void = () => {};

	if ( cursorVariable ) {
		paginationType = PaginationType.CURSOR_SIMPLE;
		setPageFn = setPageForCursorPagination;
		Object.assign( paginationQueryInput, {
			[ cursorVariable.slug ]: cursors.next ?? cursors.previous,
		} );
	} else if ( cursorNextVariable && cursorPreviousVariable ) {
		paginationType = PaginationType.CURSOR;
		setPageFn = setPageForCursorPagination;
		Object.assign( paginationQueryInput, {
			[ cursorNextVariable.slug ]: cursors.next,
			[ cursorPreviousVariable.slug ]: cursors.previous,
		} );
	} else if ( offsetVariable ) {
		paginationType = PaginationType.OFFSET;
		setPageFn = setPage;
		if ( nonFirstPage ) {
			Object.assign( paginationQueryInput, {
				[ offsetVariable.slug ]: ( page - 1 ) * calculatedPerPage,
			} );
		}
	} else if ( pageVariable ) {
		paginationType = PaginationType.PAGE;
		setPageFn = setPage;
		Object.assign( paginationQueryInput, { [ pageVariable.slug ]: page } );
	}

	if ( perPageVariable && perPage ) {
		Object.assign( paginationQueryInput, { [ perPageVariable.slug ]: perPage } );
	}

	const supportsPagination = paginationType !== PaginationType.NONE;
	const totalItems = paginationData?.totalItems;
	const totalPages = totalItems ? Math.ceil( totalItems / calculatedPerPage ) : undefined;

	if ( totalPages && page < totalPages ) {
		hasNextPage = true;
	}

	function onFetch( remoteData: RemoteData ): void {
		if ( ! supportsPagination ) {
			return;
		}

		setPaginationData( {
			perPage: perPage ?? remoteData.results.length,
			...remoteData.pagination,
		} );
	}

	// With cursor pagination, we can only go one page at a time.
	function setPageForCursorPagination( newPage: number ): void {
		// if page has gone up, we want to use nextCursor and set aside the current cursor as the previous one
		// if the page has gone down, we want to use previousCursor and set aside the current cursor as the next one
		if ( newPage > page ) {
			setPage( Math.min( totalPages ?? page + 1, page + 1 ) );
			setCursors( {
				next: paginationData?.cursorNext ?? cursors.next,
				previous: undefined,
			} );
			return;
		}

		if ( newPage < page ) {
			setPage( Math.max( 1, page - 1 ) );
			setCursors( {
				next: undefined,
				previous: paginationData?.cursorPrevious ?? cursors.previous,
			} );
		}
	}

	return {
		hasNextPage,
		onFetch,
		page,
		paginationQueryInput,
		perPage: perPage ?? paginationData?.perPage,
		setPage: setPageFn,
		setPerPage: supportsPagination ? setPerPage : () => {},
		supportsPagination,
		supportsPerPage: Boolean( perPageVariable ),
		totalItems,
		totalPages,
	};
}
