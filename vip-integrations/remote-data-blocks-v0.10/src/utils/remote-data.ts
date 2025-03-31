/**
 * Create an array of RemoteDataApiResult objects from an array of plain flat objects.
 */
function createRemoteDataResult(
	obj: Record< string, unknown >,
	uuid: string
): RemoteDataApiResult {
	return {
		result: Object.fromEntries(
			Object.entries( obj ).map( ( [ key, value ] ) => [
				key,
				{
					name: key,
					type: 'string',
					value,
				},
			] )
		),
		uuid,
	};
}

function isResultMigrated( result: object ): result is RemoteDataApiResult {
	return (
		Object.prototype.hasOwnProperty.call( result, 'result' ) &&
		Object.prototype.hasOwnProperty.call( result, 'uuid' )
	);
}

export function createRemoteDataResults(
	objs: Record< string, unknown >[]
): RemoteDataApiResult[] {
	return objs.map( ( obj, num ) => createRemoteDataResult( obj, `${ num }` ) );
}

/**
 * Create an array of query inputs from an array of remote data results. This is
 * useful when the user has selected items and you want to create the corresponding
 * query inputs.
 */
export function createQueryInputsFromRemoteDataResults(
	results: RemoteDataApiResult[]
): RemoteDataQueryInput[] {
	return results.map( result =>
		Object.fromEntries(
			Object.entries( result.result ).map( ( [ key, value ] ) => [ key, value.value ] )
		)
	);
}

/**
 * Get a remote data result string value by its field name.
 */
export function getRemoteDataResultValue(
	result: RemoteDataApiResult | undefined,
	field: string,
	defaultValue = ''
): string {
	// eslint-disable-next-line security/detect-object-injection
	return result?.result[ field ]?.value?.toString() ?? defaultValue;
}

/**
 * Get the string value of the first result matching a specific type.
 */
export function getFirstRemoteDataResultValueByType(
	result: RemoteDataApiResult,
	type: string,
	defaultValue = ''
): string {
	return (
		Object.values( result.result )
			.find( field => field.type === type )
			?.value?.toString() ?? defaultValue
	);
}

/**
 * Migrate remote data results from the transformed flat object to the format
 * returned by the API.
 */
export function migrateRemoteData( remoteData?: RemoteData ): RemoteData | undefined {
	if ( ! remoteData ) {
		return;
	}

	const { queryInput, results, ...rest } = remoteData;

	const migratedResults = results?.map( ( result, num ) => {
		const resultValue = result.result ?? {};

		if ( isResultMigrated( result ) ) {
			return result;
		}

		return createRemoteDataResult( resultValue, `${ num }` );
	} );

	return {
		...rest,
		queryInputs: remoteData.queryInputs ?? ( queryInput ? [ queryInput ] : [ {} ] ),
		results: migratedResults,
	};
}
