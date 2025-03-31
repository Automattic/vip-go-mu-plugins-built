export function isObjectWithStringKeys( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null && ! Array.isArray( value );
}

export function removeNullValuesFromObject< ValueType >(
	obj: Record< string, ValueType | null >
): Record< string, ValueType > {
	return Object.fromEntries< ValueType >(
		Object.entries( obj ).filter( ( entry ): entry is [ string, ValueType ] => entry[ 1 ] !== null )
	);
}
