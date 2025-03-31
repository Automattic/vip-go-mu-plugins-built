import { useCallback, useRef, useState } from '@wordpress/element';

export function useDebouncedState< T >(
	delayInMs: number,
	initialValue: T
): [ T, ( value: T ) => void ] {
	const timer = useRef< NodeJS.Timeout | null >( null );
	const [ value, setValue ] = useState< T >( initialValue );

	const debouncedSetValue = useCallback( ( newValue: T ) => {
		if ( timer.current ) {
			clearTimeout( timer.current );
		}

		timer.current = setTimeout( () => {
			setValue( newValue );
		}, delayInMs );
	}, [] );

	return [ value, debouncedSetValue ];
}
