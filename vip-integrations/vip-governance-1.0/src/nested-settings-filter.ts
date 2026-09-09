import { doesBlockNameMatchBlockWildcard } from './block-matching';

import type { BlockEditorSelectors, BlockName, BlockSettings, ClientId } from './types';

const ALLOWED_BLOCKS_KEY = 'allowedBlocks';

export interface NestedSettingRules {
	pathsByBlock: Map< BlockName, Set< string > >;
	settings: BlockSettings;
}

interface ResolveForBlockNamesOptions {
	blockNames: BlockName[];
	defaultValue: unknown;
	path: string;
	rules: NestedSettingRules;
}

interface ResolveNestedSettingOptions
	extends Omit< ResolveForBlockNamesOptions, 'blockNames' >,
		BlockEditorSelectors {
	clientId: ClientId;
	currentBlockName?: BlockName;
}

export interface NestedSettingResult {
	depth: number;
	value: unknown;
}

function isRecord( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null && ! Array.isArray( value );
}

function addSettingPaths( value: unknown, prefix: string, paths: Set< string > ): void {
	if ( typeof value !== 'object' || value === null ) {
		return;
	}

	for ( const [ key, childValue ] of Object.entries( value ) ) {
		const path = `${ prefix }${ key }`;
		paths.add( path );

		if ( isRecord( childValue ) ) {
			addSettingPaths( childValue, `${ path }.`, paths );
		}
	}
}

/** Index visual/editor setting paths by their final block name or wildcard. */
export function createNestedSettingRules( settings: BlockSettings ): NestedSettingRules {
	const pathsByBlock: NestedSettingRules[ 'pathsByBlock' ] = new Map();

	const visit = ( nestedSettings: BlockSettings, currentBlock?: BlockName ) => {
		for ( const [ key, value ] of Object.entries( nestedSettings ) ) {
			if ( key === ALLOWED_BLOCKS_KEY ) {
				continue;
			}

			if ( ( key.includes( '/' ) || key === '*' ) && isRecord( value ) ) {
				visit( value, key );
			} else if ( currentBlock ) {
				const paths = pathsByBlock.get( currentBlock ) ?? new Set();
				addSettingPaths( value, `${ key }.`, paths );
				pathsByBlock.set( currentBlock, paths );
			}
		}
	};

	visit( settings );
	return { pathsByBlock, settings };
}

function deepGet( value: unknown, path: string | string[] ): unknown {
	const keys = Array.isArray( path )
		? path
		: path
				.replace( /(\[(\d)\])/g, '.$2' )
				.replace( /^\./, '' )
				.split( '.' );

	if ( keys.length === 0 ) {
		return value;
	}

	if ( typeof value !== 'object' || value === null ) {
		return undefined;
	}

	const [ key, ...remainingPath ] = keys;
	return key in value
		? deepGet( ( value as Record< string, unknown > )[ key ], remainingPath )
		: undefined;
}

/** Resolve an exact-name setting from a nearest-block-first hierarchy. */
export function getNestedSetting(
	blockNamePath: BlockName[],
	normalizedPath: string,
	settings: BlockSettings,
	result: NestedSettingResult = { depth: 0, value: undefined },
	depth = 1
): NestedSettingResult {
	if ( blockNamePath.length === 0 ) {
		return result;
	}

	const currentBlockName = blockNamePath.at( -1 );
	if ( currentBlockName === undefined ) {
		return result;
	}

	const remainingBlockNames = blockNamePath.slice( 0, -1 );
	const candidate = settings[ currentBlockName ];
	const blockSettings = isRecord( candidate ) ? candidate : undefined;

	if ( remainingBlockNames.length === 0 ) {
		const value = deepGet( blockSettings, normalizedPath );
		return value !== undefined && depth >= result.depth ? { depth, value } : result;
	}

	if ( blockSettings ) {
		result = getNestedSetting(
			remainingBlockNames,
			normalizedPath,
			blockSettings,
			result,
			depth + 1
		);
	}

	return getNestedSetting( remainingBlockNames, normalizedPath, settings, result, depth );
}

/** Return block names from the current block through the root ancestor. */
export function getBlockNamePath(
	clientId: ClientId,
	getBlockParents: BlockEditorSelectors[ 'getBlockParents' ],
	getBlockName: BlockEditorSelectors[ 'getBlockName' ],
	currentBlockName?: BlockName
): BlockName[] {
	return [
		currentBlockName ?? getBlockName( clientId ),
		...getBlockParents( clientId, true ).map( getBlockName ),
	].filter( ( blockName ): blockName is BlockName => blockName !== undefined );
}

function unwrapThemeValue( value: unknown ): unknown {
	return isRecord( value ) && value.theme ? value.theme : value;
}

/** Resolve a governed value for an already resolved block-name hierarchy. */
export function resolveSettingForBlockNames( {
	blockNames,
	defaultValue,
	path,
	rules,
}: ResolveForBlockNamesOptions ): unknown {
	const currentBlockName = blockNames[ 0 ];

	if ( ! currentBlockName ) {
		return defaultValue;
	}

	if ( rules.pathsByBlock.get( currentBlockName )?.has( path ) ) {
		return unwrapThemeValue( getNestedSetting( blockNames, path, rules.settings ).value );
	}

	for ( const [ blockPattern, settingPaths ] of rules.pathsByBlock ) {
		if (
			blockPattern.includes( '*' ) &&
			settingPaths.has( path ) &&
			doesBlockNameMatchBlockWildcard( currentBlockName, blockPattern )
		) {
			const normalizedBlockNames = [ ...blockNames ];
			normalizedBlockNames[ 0 ] = blockPattern;
			return unwrapThemeValue(
				getNestedSetting( normalizedBlockNames, path, rules.settings ).value
			);
		}
	}

	return defaultValue;
}

/** Resolve the legacy-precedence setting for a block editor client ID. */
export function resolveNestedSetting( {
	clientId,
	currentBlockName,
	defaultValue,
	getBlockName,
	getBlockParents,
	path,
	rules,
}: ResolveNestedSettingOptions ): unknown {
	return resolveSettingForBlockNames( {
		blockNames: getBlockNamePath( clientId, getBlockParents, getBlockName, currentBlockName ),
		defaultValue,
		path,
		rules,
	} );
}
