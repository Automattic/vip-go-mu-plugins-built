/**
 * Internal dependencies
 */
import { CUSTOM_VALUE } from './constants';

/**
 * The suggestion features that expose site-wide generation defaults.
 *
 * @since 3.24.0
 */
export type DefaultsFeature = 'excerptSuggestions' | 'titleSuggestions';

/**
 * Returns a feature's site-wide default for the given setting.
 *
 * PHP resolves these from the plugin's settings and injects them. Read at call
 * time rather than at module load, so a screen that injects them late is still
 * served.
 *
 * @since 3.24.0
 *
 * @param {DefaultsFeature}  feature  The feature to read the default of.
 * @param {'persona'|'tone'} setting  The setting to read.
 * @param {string}           fallback The value to use when none was injected.
 *
 * @return {string} The site-wide default.
 */
export const getSiteDefault = (
	feature: DefaultsFeature,
	setting: 'persona' | 'tone',
	fallback: string
): string => {
	const value = window.wpParselyContentHelperDefaults?.[ feature ]?.[ setting ];

	return 'string' === typeof value && '' !== value ? value : fallback;
};

/**
 * Resolves a stored tone or persona into the value to generate with.
 *
 * The custom sentinel means "Custom" was selected without a value entered, so
 * it carries no value of its own. The site's default stands in rather than the
 * shipped one, which would ignore how the site is configured.
 *
 * @since 3.24.0
 *
 * @param {string}           stored  The user's stored value.
 * @param {DefaultsFeature}  feature The feature being generated for.
 * @param {'persona'|'tone'} setting The setting being resolved.
 * @param {string}           shipped The default to use when the site injects none.
 *
 * @return {string} The value to send with the generation request.
 */
export const forGeneration = (
	stored: string,
	feature: DefaultsFeature,
	setting: 'persona' | 'tone',
	shipped: string
): string => {
	if ( CUSTOM_VALUE !== stored && '' !== stored ) {
		return stored;
	}

	return getSiteDefault( feature, setting, shipped );
};
