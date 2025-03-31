import { useDebounce } from '@wordpress/compose';
import { useEffect, useCallback, useMemo } from '@wordpress/element';

import { getGoogleAuthTokenFromServiceAccount } from '@/data-sources/api-clients/auth';
import { useQuery } from '@/hooks/useQuery';
import { GoogleServiceAccountKey } from '@/types/google';
import { safeParseJSON } from '@/utils/string';

export const useGoogleAuth = ( serviceAccountKeyString: string, scopes: string[] ) => {
	const serviceAccountKey = useMemo( () => {
		return safeParseJSON< GoogleServiceAccountKey >( serviceAccountKeyString );
	}, [ serviceAccountKeyString ] );

	const queryFn = useCallback( async () => {
		if ( ! serviceAccountKey ) {
			return null;
		}
		return getGoogleAuthTokenFromServiceAccount( serviceAccountKey, scopes );
	}, [ serviceAccountKey, scopes ] );

	const {
		data: token,
		isLoading: fetchingToken,
		error: tokenError,
		refetch: fetchToken,
	} = useQuery( queryFn, { manualFetchOnly: true } );

	const debouncedFetchToken = useDebounce( fetchToken, 500 );
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect( debouncedFetchToken, [ serviceAccountKeyString ] );

	return { token, fetchingToken, fetchToken, tokenError };
};
