import { useDebounce } from '@wordpress/compose';
import { useCallback, useEffect } from '@wordpress/element';

import { getSalesforceD2CStores } from '@/data-sources/api-clients/auth';
import { useQuery } from '@/hooks/useQuery';

export const useSalesforceD2CAuth = ( domain: string, clientId: string, clientSecret: string ) => {
	const queryFn = useCallback( async () => {
		if ( ! domain || ! clientId || ! clientSecret ) {
			return null;
		}

		// Only proceed if the domain is valid, which is that it should not be a full url.
		const invalidDomainPattern = /^(https?:\/\/|www\.)|[\\/\\]/;
		if ( invalidDomainPattern.test( domain ) ) {
			throw new Error( 'Invalid domain provided' );
		}

		return getSalesforceD2CStores( domain, clientId, clientSecret );
	}, [ domain, clientId, clientSecret ] );

	const {
		data: stores,
		isLoading: fetchingStores,
		error: storesError,
		refetch: fetchStores,
	} = useQuery( queryFn, { manualFetchOnly: true } );

	const debouncedFetchStores = useDebounce( fetchStores, 500 );
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect( debouncedFetchStores, [ domain, clientId, clientSecret ] );

	return { stores, fetchingStores, fetchStores, storesError };
};
