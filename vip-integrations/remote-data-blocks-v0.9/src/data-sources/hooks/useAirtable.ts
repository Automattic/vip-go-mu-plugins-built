import { useDebounce } from '@wordpress/compose';
import { useEffect, useMemo, useCallback } from '@wordpress/element';

import { AirtableApi } from '@/data-sources/api-clients/airtable';
import { useQuery } from '@/hooks/useQuery';

export const useAirtableApiUserId = ( token: string ) => {
	const api = useMemo( () => new AirtableApi( token ), [ token ] );

	const userQueryFn = useCallback( async () => {
		if ( ! token ) {
			return null;
		}
		return api.whoAmI();
	}, [ api, token ] );

	const {
		data: userId,
		isLoading: fetchingUserId,
		error: userIdError,
		refetch: fetchUserId,
	} = useQuery( userQueryFn, { manualFetchOnly: true } );

	const debouncedFetchUserId = useDebounce( fetchUserId, 500 );
	useEffect( debouncedFetchUserId, [ token, debouncedFetchUserId ] );

	return { fetchingUserId, fetchUserId, userId, userIdError };
};

export const useAirtableApiBases = ( token: string, userId: string ) => {
	const api = useMemo( () => new AirtableApi( token ), [ token ] );

	const queryFn = useCallback( async () => {
		if ( ! userId ) {
			return null;
		}
		return api.getBases();
	}, [ api, userId ] );

	const {
		data: bases,
		isLoading: fetchingBases,
		error: basesError,
		refetch: fetchBases,
	} = useQuery( queryFn, { manualFetchOnly: true } );

	const debouncedFetchBases = useDebounce( fetchBases, 500 );
	useEffect( debouncedFetchBases, [ token, userId, debouncedFetchBases ] );

	return { bases, basesError, fetchBases, fetchingBases };
};

export const useAirtableApiTables = ( token: string, base: string ) => {
	const api = useMemo( () => new AirtableApi( token ), [ token ] );

	const queryFn = useCallback( async () => {
		if ( ! base ) {
			return null;
		}
		return api.getTables( base );
	}, [ api, base ] );

	const {
		data: tables,
		isLoading: fetchingTables,
		error: tablesError,
		refetch: fetchTables,
	} = useQuery( queryFn );

	return { fetchingTables, fetchTables, tables, tablesError };
};
