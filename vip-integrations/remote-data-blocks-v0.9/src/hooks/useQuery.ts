import { useState, useEffect, useCallback } from '@wordpress/element';

type QueryFunction< T > = () => Promise< T >;

interface QueryResult< T > {
	data: T | null;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

interface QueryOptions {
	manualFetchOnly: boolean;
}

const defaultOptions: QueryOptions = {
	manualFetchOnly: false,
};

export function useQuery< T >(
	queryFn: QueryFunction< T >,
	options: QueryOptions = defaultOptions
): QueryResult< T > {
	const [ data, setData ] = useState< T | null >( null );
	const [ isLoading, setIsLoading ] = useState< boolean >( false );
	const [ error, setError ] = useState< Error | null >( null );

	const fetchData = useCallback( async () => {
		setData( null );
		setIsLoading( true );
		setError( null );
		try {
			const result = await queryFn();
			setData( result );
		} catch ( err ) {
			setData( null );
			setError( err instanceof Error ? err : new Error( 'An error occurred' ) );
		} finally {
			setIsLoading( false );
		}
	}, [ queryFn ] );

	useEffect( () => {
		if ( options.manualFetchOnly ) {
			return;
		}

		void fetchData();
	}, [ fetchData, options.manualFetchOnly ] );

	const refetch = useCallback( () => {
		void fetchData();
	}, [ fetchData ] );

	return { data, isLoading, error, refetch };
}
