export const isNonEmptyObj = ( obj: unknown ): boolean =>
	typeof obj === 'object' && obj !== null && Object.keys( obj ).length > 0;

export const constructObjectWithValues = < T >(
	keys: string[],
	defaultValue: T
): Record< string, T > => {
	return Object.fromEntries( keys.map( key => [ key, defaultValue ] ) );
};
