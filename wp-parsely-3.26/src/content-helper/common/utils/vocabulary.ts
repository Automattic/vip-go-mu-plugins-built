/**
 * A tone or persona entry, as consumed by the selector components.
 *
 * @since 3.24.0
 */
export type VocabularyEntry = {
	label: string,
	icon?: React.JSX.Element,
};

/**
 * Converts a value => label record injected by PHP into selector metadata.
 *
 * PHP is the single source of the predefined tones and personas, so that the
 * plugin's settings page can offer the same choices as the editor. The record
 * is absent on screens that do not inject it, in which case only the custom
 * entry defined by the selector remains.
 *
 * @since 3.24.0
 *
 * @param {Record<string, string>|undefined} labels The injected labels.
 *
 * @return {Record<string, VocabularyEntry>} The selector metadata.
 */
export const toMetadata = (
	labels: Record<string, string> | undefined
): Record<string, VocabularyEntry> => {
	if ( ! labels || 'object' !== typeof labels ) {
		return {};
	}

	return Object.fromEntries(
		Object.entries( labels ).map( ( [ value, label ] ) => [ value, { label } ] )
	);
};
