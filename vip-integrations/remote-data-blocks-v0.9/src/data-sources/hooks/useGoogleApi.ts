import { useDebounce } from '@wordpress/compose';
import { useEffect, useMemo, useCallback } from '@wordpress/element';

import { GoogleApi } from '@/data-sources/api-clients/google';
import { useQuery } from '@/hooks/useQuery';

export const useGoogleSpreadsheetsOptions = ( token: string | null ) => {
	const api = useMemo( () => new GoogleApi( token ), [ token ] );

	const queryFn = useCallback( async () => {
		if ( ! token ) {
			return null;
		}
		return api.getSpreadsheetsOptions();
	}, [ api, token ] );

	const {
		data: spreadsheets,
		isLoading: isLoadingSpreadsheets,
		error: errorSpreadsheets,
		refetch: refetchSpreadsheets,
	} = useQuery( queryFn, { manualFetchOnly: true } );

	const debouncedFetchSpreadsheets = useDebounce( refetchSpreadsheets, 500 );
	useEffect( debouncedFetchSpreadsheets, [ token, debouncedFetchSpreadsheets ] );

	return { spreadsheets, isLoadingSpreadsheets, errorSpreadsheets, refetchSpreadsheets };
};

export const useGoogleSheetsWithFields = ( token: string | null, spreadsheetId: string ) => {
	const api = useMemo( () => new GoogleApi( token ), [ token ] );

	const queryFn = useCallback( async () => {
		if ( ! token || ! spreadsheetId ) {
			return null;
		}
		return api.getSheetsWithFieldNames( spreadsheetId );
	}, [ api, token, spreadsheetId ] );

	const {
		data: sheetsWithFields,
		isLoading: isLoadingSheets,
		error: errorSheets,
	} = useQuery( queryFn );

	const sheets = sheetsWithFields
		? Array.from( sheetsWithFields.values() ).map( sheet => ( {
				id: sheet.id,
				name: sheet.name,
		  } ) )
		: null;

	return { sheets, sheetsWithFields, isLoadingSheets, errorSheets };
};
