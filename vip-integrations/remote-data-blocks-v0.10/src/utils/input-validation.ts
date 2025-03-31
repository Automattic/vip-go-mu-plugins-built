export enum QueryValidationErrorType {
	MissingRequiredInput = 'missing_required_input',
}

export class QueryInputValidationError extends Error {
	constructor(
		message: string,
		public type: QueryValidationErrorType,
		public affectedInputVariables: InputVariable[]
	) {
		super( message );
	}
}

/**
 * Validate remote data query input.
 *
 * TODO: Additional type validation beyond required fields.
 *
 * @throws {Error} If query input is invalid or missing required variables.
 */
export function validateQueryInput(
	queryInput: RemoteDataQueryInput,
	inputVariables: InputVariable[]
): boolean {
	const requiredInputVariables = inputVariables.filter( input => input.required );

	// Ensure query input is not missing required variables. We define "missing"
	// as any nullish value. An empty string or boolean `false`, for example, are
	// not nullish.
	const missingRequiredInputVariables = requiredInputVariables.filter(
		input => null === ( queryInput[ input.slug ] ?? null )
	);

	if ( missingRequiredInputVariables.length ) {
		throw new QueryInputValidationError(
			'Missing required query input variables',
			QueryValidationErrorType.MissingRequiredInput,
			missingRequiredInputVariables
		);
	}

	return true;
}

/**
 * Wrapper around `validateQueryInput` that returns a boolean instead of throwing
 * an error.
 */
export function isQueryInputValid(
	queryInput: RemoteDataQueryInput,
	inputVariables: InputVariable[]
): boolean {
	try {
		validateQueryInput( queryInput, inputVariables );
		return true;
	} catch ( error ) {
		return false;
	}
}
