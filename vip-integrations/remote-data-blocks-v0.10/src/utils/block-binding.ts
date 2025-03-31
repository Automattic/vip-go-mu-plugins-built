import { BLOCK_BINDING_SOURCE } from '@/config/constants';
import { getRemoteDataResultValue } from '@/utils/remote-data';
import { getClassName } from '@/utils/string';
import { isObjectWithStringKeys } from '@/utils/type-narrowing';

import type { BlockPattern } from '@wordpress/block-editor';
import type { BlockInstance } from '@wordpress/blocks';

function getAttributeValue( attributes: unknown, key: string | undefined | null ): string {
	if ( ! key || ! isObjectWithStringKeys( attributes ) ) {
		return '';
	}

	// This .toString() call is important to handle RichTextData objects. We may
	// set the attribute value as a string, but once loaded by the editor, it will
	// be a RichTextData object. Currently, .toString() proxies to .toHTMLString():
	//
	// https://github.com/WordPress/gutenberg/blob/7bca2fadddde7b2b2f62823b8a4b81378f117412/packages/rich-text/src/create.js#L157
	return attributes[ key ]?.toString() ?? '';
}

function getExpectedAttributeValue(
	result?: RemoteDataApiResult,
	args?: RemoteDataBlockBindingArgs
): string | null {
	if ( ! args?.field || ! result?.result?.[ args.field ] ) {
		return null;
	}

	// See comment on toString() in getAttributeValue.
	let expectedValue = getRemoteDataResultValue( result, args.field );
	if ( args.label ) {
		const labelClass = getClassName( 'block-label' );
		expectedValue = `<span class="${ labelClass }">${ args.label }</span> ${ expectedValue }`;
	}

	return expectedValue;
}

export function getBoundAttributeEntries(
	attributes: RemoteDataInnerBlockAttributes,
	remoteDataBlockName: string
): [ string, RemoteDataBlockBinding ][] {
	return Object.entries( attributes.metadata?.bindings ?? {} ).filter(
		( [ _target, binding ] ) =>
			binding.source === BLOCK_BINDING_SOURCE && binding.args?.block === remoteDataBlockName
	);
}

export function getBoundBlockClassName(
	attributes: RemoteDataInnerBlockAttributes,
	remoteDataBlockName: string
): string {
	const existingClassNames = ( attributes.className ?? '' )
		.split( /\s/ )
		.filter( className => ! className.startsWith( 'rdb-block-data-' ) );
	const classNames = new Set< string | undefined >( [
		...existingClassNames,
		...getBoundAttributeEntries( attributes, remoteDataBlockName ).map( ( [ _target, binding ] ) =>
			getClassName( `block-data-${ binding.args.field }` )
		),
	] );

	return Array.from( classNames.values() ).filter( Boolean ).join( ' ' );
}

export function getMismatchedAttributes(
	attributes: RemoteDataInnerBlockAttributes,
	results: RemoteDataApiResult[],
	remoteDataBlockName: string,
	index = 0
): Partial< RemoteDataInnerBlockAttributes > {
	return Object.fromEntries(
		getBoundAttributeEntries( attributes, remoteDataBlockName )
			.map( ( [ target, binding ] ) => [
				target,
				getExpectedAttributeValue( results[ index ], binding.args ),
			] )
			.filter(
				( [ target, value ] ) => null !== value && value !== getAttributeValue( attributes, target )
			)
	) as Partial< RemoteDataInnerBlockAttributes >;
}

/**
 * Recursively determine if a block or its inner blocks have any block bindings.
 */
export function hasBlockBinding(
	block: BlockInstance< RemoteDataInnerBlockAttributes >,
	remoteDataBlockName: string
): boolean {
	if ( getBoundAttributeEntries( block.attributes, remoteDataBlockName ).length > 0 ) {
		return true;
	}

	return (
		block.innerBlocks?.some( innerBlock => hasBlockBinding( innerBlock, remoteDataBlockName ) ) ??
		false
	);
}

export function hasRemoteDataChanged( one?: RemoteData, two?: RemoteData ): boolean {
	if ( ! one || ! two ) {
		return true;
	}

	// Remove result ID and metadata properties from comparison. Compare results
	// separately to remove UUID.
	const { metadata: _removed1, resultId: _removed2, results: results1, ...clean1 } = one;
	const { metadata: _removed3, resultId: _removed4, results: results2, ...clean2 } = two;

	const cleanedResults1 = results1.map( ( { uuid: _removed, ...result } ) => result );
	const cleanedResults2 = results2.map( ( { uuid: _removed, ...result } ) => result );

	if ( JSON.stringify( cleanedResults1 ) !== JSON.stringify( cleanedResults2 ) ) {
		return true;
	}

	return JSON.stringify( clean1 ) !== JSON.stringify( clean2 );
}

/**
 * Determine if a block pattern is a synced pattern / resuable block.
 */
export function isSyncedPattern( pattern: BlockPattern ): boolean {
	return Boolean( pattern.id && pattern.syncStatus !== 'unsynced' );
}
