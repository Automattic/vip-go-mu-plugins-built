import { get } from 'lodash';

/**
 * Find the list of nestedPaths that can be found in the block settings, so that
 * it's faster to find out if a deeper nested setting exists or not.
 *
 * @param {Object} nestedSettings the nestedSettings found from the governance rules.
 * @param {Object} nestedMetadata the nestedMetadata object that's to be populated with the paths.
 * @param {String} currentBlock the current nested block name being processed.
 * @returns {Object} Map of the block name along with the nested paths that can be found inside.
 */
export function getNestedSettingPaths( nestedSettings, nestedMetadata = {}, currentBlock = false ) {
	const SETTINGS_TO_SKIP = [ 'allowedBlocks' ];
	for ( const [ settingKey, settingValue ] of Object.entries( nestedSettings ) ) {
		if ( SETTINGS_TO_SKIP.includes( settingKey ) ) {
			continue;
		}

		const isNestedBlock = settingKey.includes( '/' );

		if ( isNestedBlock ) {
			// This setting contains another block, look at the child for metadata
			Object.entries( nestedSettings ).forEach( ( [ blockName, blockNestedSettings ] ) => {
				if ( ! SETTINGS_TO_SKIP.includes( blockName ) ) {
					getNestedSettingPaths( blockNestedSettings, nestedMetadata, blockName );
				}
			} );
		} else if ( currentBlock !== false ) {
			// This is a leaf block, add setting paths to nestedMetadata
			const settingPaths = flattenSettingPaths( settingValue, `${ settingKey }.` );

			// eslint-disable-next-line security/detect-object-injection
			nestedMetadata[ currentBlock ] = {
				// eslint-disable-next-line security/detect-object-injection
				...( nestedMetadata[ currentBlock ] ?? {} ),
				...settingPaths,
			};
		}
	}

	return nestedMetadata;
}

/**
 * Find block settings nested in other block settings.
 *
 * Given an array of blocks names from the top level of the editor to the
 * current block (`blockNamePath`), return the value for the deepest-nested
 * settings value that applies to the current block.
 *
 * If two setting values share the same nesting depth, use the last one that
 * occurs in settings (like CSS).
 *
 * @param {string[]} blockNamePath  Block names representing the path to the
 *                                  current block from the top level of the
 *                                  block editor.
 * @param {string}   normalizedPath Path to the setting being retrieved.
 * @param {Object}   settings       Object containing all block settings.
 * @param {Object}   result         Optional. Object with keys `depth` and
 *                                  `value` used to track current most-nested
 *                                  setting.
 * @param {number}   depth          Optional. The current recursion depth used
 *                                  to calculate the most-nested setting.
 * @return {Object}                 Object with keys `depth` and `value`.
 *                                  Destructure the `value` key for the result.
 */
export function getNestedSetting(
	blockNamePath,
	normalizedPath,
	settings,
	result = { depth: 0, value: undefined },
	depth = 1
) {
	const [ currentBlockName, ...remainingBlockNames ] = blockNamePath;
	// eslint-disable-next-line security/detect-object-injection
	const blockSettings = settings[ currentBlockName ];

	if ( remainingBlockNames.length === 0 ) {
		const settingValue = get( blockSettings, normalizedPath );

		if ( settingValue !== undefined && depth >= result.depth ) {
			result.depth = depth;
			result.value = settingValue;
		}

		return result;
	} else if ( blockSettings !== undefined ) {
		// Recurse into the parent block's settings
		result = getNestedSetting(
			remainingBlockNames,
			normalizedPath,
			blockSettings,
			result,
			depth + 1
		);
	}

	// Continue down the array of blocks
	return getNestedSetting( remainingBlockNames, normalizedPath, settings, result, depth );
}

/**
 * Flatten a nested object into a map of paths.
 * @param {Object} settings The settings value that is to be flattened.
 * @param {String} prefix The key for the settings value.
 * @returns {Object} the flattened settings object.
 */
function flattenSettingPaths( settings, prefix = '' ) {
	const result = {};

	Object.entries( settings ).forEach( ( [ key, value ] ) => {
		const isRegularObject = typeof value === 'object' && !! value && ! Array.isArray( value );

		if ( isRegularObject ) {
			result[ `${ prefix }${ key }` ] = true;
			Object.assign( result, flattenSettingPaths( value, `${ prefix }${ key }.` ) );
		} else {
			result[ `${ prefix }${ key }` ] = true;
		}
	} );

	return result;
}
