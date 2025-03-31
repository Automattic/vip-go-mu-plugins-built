import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';

import { REMOTE_DATA_REST_API_URL } from '@/blocks/remote-data-container/config/constants';
import { usePaginationVariables } from '@/blocks/remote-data-container/hooks/usePaginationVariables';
import { useSearchVariables } from '@/blocks/remote-data-container/hooks/useSearchVariables';
import { memoizeFn } from '@/utils/function';
import { isQueryInputValid, validateQueryInput } from '@/utils/input-validation';
import { getBlockConfig } from '@/utils/localized-block-data';

export class RemoteDataFetchError extends Error {
	constructor( message: string, public cause: unknown ) {
		super( message );
	}
}

async function unmemoizedfetchRemoteData(
	requestData: RemoteDataApiRequest
): Promise< RemoteData | null > {
	const { body } = await apiFetch< RemoteDataApiResponse >( {
		url: REMOTE_DATA_REST_API_URL,
		method: 'POST',
		data: requestData,
	} );

	if ( ! body ) {
		return null;
	}

	return {
		blockName: body.block_name,
		metadata: body.metadata,
		pagination: body.pagination && {
			cursorNext: body.pagination.cursor_next,
			cursorPrevious: body.pagination.cursor_previous,
			hasNextPage: body.pagination.has_next_page,
			totalItems: body.pagination.total_items,
		},
		queryKey: body.query_key,
		queryInputs: body.query_inputs,
		resultId: body.result_id,
		results: body.results,
	};
}

const fetchRemoteData = memoizeFn< typeof unmemoizedfetchRemoteData >( unmemoizedfetchRemoteData );

interface UseRemoteData {
	data?: RemoteData;
	error?: Error;
	fetch: ( inputs: RemoteDataQueryInput[] ) => Promise< void >;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	loading: boolean;
	page: number;
	perPage?: number;
	reset: () => void;
	searchInput: string;
	setPage: ( page: number ) => void;
	setPerPage: ( perPage: number ) => void;
	setSearchInput: ( searchInput: string ) => void;
	supportsPagination: boolean;
	supportsPerPage: boolean;
	supportsSearch: boolean;
	totalItems?: number;
	totalPages?: number;
}

interface UseRemoteDataInput {
	blockName: string;
	externallyManagedRemoteData?: RemoteData;
	externallyManagedUpdateRemoteData?: ( remoteData?: RemoteData ) => void;
	fetchOnMount?: boolean;
	initialPage?: number;
	initialPerPage?: number;
	initialSearchInput?: string;
	onSuccess?: () => void;
	queryKey: string;
}

// This hook fetches remote data and manages state for the requests.
//
// If you have another way to manage the state of the remote data, then you must
// pass in the data and a state updater function.
//
// Use case: You might be fetching data only to provide it to setAttributes,
// which is already reactive. Or you might be chaining multiple calls and
// don't need an intermediate state update / re-render.
export function useRemoteData( {
	blockName,
	externallyManagedRemoteData,
	externallyManagedUpdateRemoteData,
	fetchOnMount = false,
	initialPage,
	initialPerPage,
	initialSearchInput,
	onSuccess,
	queryKey,
}: UseRemoteDataInput ): UseRemoteData {
	const [ data, setData ] = useState< RemoteData >();
	const [ error, setError ] = useState< Error >();
	const [ loading, setLoading ] = useState< boolean >( false );

	const resolvedData = externallyManagedRemoteData ?? data;
	const resolvedUpdater = externallyManagedUpdateRemoteData ?? setData;
	const hasResolvedData = Boolean( resolvedData );

	const blockConfig = getBlockConfig( blockName );
	const query = blockConfig?.selectors?.find( selector => selector.query_key === queryKey );

	if ( ! query ) {
		// Here we intentionally throw an error instead of calling setError, because
		// this indicates a misconfiguration somewhere in our code, not a runtime /
		// query error.
		throw new Error( `Query not found for block "${ blockName }" and key "${ queryKey }".` );
	}

	// Overrides must be provided via externallyManagedRemoteData
	const enabledOverrides = externallyManagedRemoteData?.enabledOverrides ?? [];

	const inputVariables = query.inputs;

	const {
		hasNextPage,
		onFetch: onFetchForPagination,
		page,
		perPage,
		paginationQueryInput,
		supportsPagination,
		totalItems,
		totalPages,
		...paginationVariables
	} = usePaginationVariables( {
		initialPage,
		initialPerPage,
		inputVariables,
	} );
	const { hasSearchInput, searchQueryInput, searchInput, setSearchInput, supportsSearch } =
		useSearchVariables( {
			initialSearchInput,
			inputVariables,
		} );
	const managedQueryInput = { ...paginationQueryInput, ...searchQueryInput };

	// Search and pagination are "managed" input variables (this hook manages their
	// state), so we should refetch if those variables change. If the query fails,
	// the resulting error will be returned by this hook if there is valid search
	// input, then we should consider the query and can be inspected by the caller
	// to determine if or how to surface it to the user.
	//
	// If we add additional managed input variables (like filters), we'll need to
	// include them here.
	//
	// We only want to refetch if there was a previous successful fetch.
	const shouldFetchForManagedVariables = ! error && ( hasResolvedData || hasSearchInput );
	const shouldClearResolvedData = hasResolvedData && supportsSearch && ! hasSearchInput;

	useEffect( () => {
		if ( shouldClearResolvedData ) {
			resolvedUpdater( undefined );
			return;
		}

		if ( ! shouldFetchForManagedVariables ) {
			return;
		}

		void fetch( resolvedData?.queryInputs ?? [ {} ] );
	}, [ shouldClearResolvedData, shouldFetchForManagedVariables, page, perPage, searchInput ] );

	// Separately, some callers request an "optimistic" initial fetch. An example
	// would be DataViewsModal, which will display an initial list of items to
	// choose from if the query supports it. This is implemented in a separate
	// effect to avoid entangling the logic of initial fetch and refetch.
	//
	// This fetch may fail if the query input is invalid or incomplete, but as an
	// "optimistic" fetch, we don't want to surface that error to the user. So we
	// do a pre-validation and bail if we see that validation will not pass.
	//
	// The dependency array is empty because we only want to run this effect once.
	useEffect( () => {
		if ( ! fetchOnMount || ! isQueryInputValid( managedQueryInput, inputVariables ) ) {
			return;
		}

		void fetch( [ {} ] );
	}, [] );

	async function fetch( inputs: RemoteDataQueryInput[] ): Promise< void > {
		// If there are no inputs, there is nothing to fetch. Empty query inputs
		// must be represented by an empty object, e.g. `[ {} ]`.
		if ( 0 === inputs.length ) {
			resolvedUpdater( undefined );
			setError( new RemoteDataFetchError( 'Query input is empty', inputs ) );
			return;
		}

		// Only merge the managed query input if there is a single query input
		// (representing a collection query).
		if ( 1 === inputs.length ) {
			inputs[ 0 ] = { ...inputs[ 0 ], ...managedQueryInput };
		}

		const requestData: RemoteDataApiRequest = {
			block_name: blockName,
			query_key: queryKey,
			query_inputs: inputs,
		};

		try {
			inputs.forEach( input => validateQueryInput( input, inputVariables ) );
		} catch ( err: unknown ) {
			resolvedUpdater( undefined );
			setError( new RemoteDataFetchError( 'Query input is invalid', err ) );
			return;
		}

		setLoading( true );

		const remoteData = await fetchRemoteData( requestData ).catch( ( err: unknown ) => {
			setError( new RemoteDataFetchError( 'Request for remote data failed', err ) );
			return null;
		} );

		if ( ! remoteData ) {
			resolvedUpdater( undefined );
			setLoading( false );
			return;
		}

		onFetchForPagination( remoteData );
		resolvedUpdater( { enabledOverrides, ...remoteData } );
		setLoading( false );
		onSuccess?.();
	}

	function reset(): void {
		resolvedUpdater( undefined );
		setError( undefined );
		setLoading( false );
	}

	return {
		data: resolvedData,
		error,
		fetch,
		hasNextPage: hasNextPage ?? ( totalPages ? page < totalPages : supportsPagination ),
		hasPreviousPage: page > 1,
		loading,
		page,
		perPage,
		reset,
		searchInput,
		setSearchInput,
		supportsPagination,
		supportsSearch,
		totalItems: resolvedData?.pagination?.totalItems,
		totalPages,
		...paginationVariables,
	};
}
