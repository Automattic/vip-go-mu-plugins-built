import {
	createNestedSettingRules,
	getNestedSetting,
	resolveNestedSetting,
} from './nested-settings-filter';

import type { BlockSettings } from './types';

describe( 'nested settings filter', () => {
	const namesById: Record< string, string > = {
		root: 'core/group',
		parent: 'core/quote',
		current: 'core/heading',
	};
	const getBlockName = jest.fn( ( id: string ) => namesById[ id ] );

	function resolve(
		nestedSettings: BlockSettings,
		options: {
			getBlockName?: ( id: string ) => string | undefined;
			getBlockParents?: () => string[];
			path?: string;
		} = {}
	) {
		return resolveNestedSetting( {
			defaultValue: 'original',
			path: 'color.text',
			clientId: 'current',
			rules: createNestedSettingRules( nestedSettings ),
			getBlockParents: () => [ 'root' ],
			getBlockName,
			...options,
		} );
	}

	it( 'prefers an exact block rule over a wildcard at the same depth', () => {
		expect(
			resolve( {
				'core/*': { color: { text: false } },
				'core/heading': { color: { text: true } },
			} )
		).toBe( true );
	} );

	it( 'applies a wildcard block setting when no exact rule exists', () => {
		expect(
			resolve( {
				'core/*': { color: { text: false } },
			} )
		).toBe( false );
	} );

	it( 'returns the original value when no governed path applies', () => {
		expect(
			resolve( { 'core/*': { color: { text: false } } }, { path: 'typography.dropCap' } )
		).toBe( 'original' );
	} );

	it( 'uses the deepest exact setting in the current hierarchy', () => {
		const hierarchyNames: Record< string, string > = {
			root: 'core/group',
			parent: 'core/quote',
			current: 'core/paragraph',
		};

		expect(
			resolve(
				{
					'core/paragraph': { color: { text: true } },
					'core/group': {
						'core/quote': {
							'core/paragraph': { color: { text: false } },
						},
					},
				},
				{
					getBlockParents: () => [ 'parent', 'root' ],
					getBlockName: ( id: string ) => hierarchyNames[ id ],
				}
			)
		).toBe( false );
	} );

	it( 'uses the deepest setting when ancestor block names repeat', () => {
		const hierarchyNames: Record< string, string > = {
			root: 'core/group',
			parent: 'core/group',
			current: 'core/paragraph',
		};

		expect(
			resolve(
				{
					'core/paragraph': { color: { text: true } },
					'core/group': {
						'core/group': {
							'core/paragraph': { color: { text: false } },
						},
					},
				},
				{
					getBlockParents: () => [ 'parent', 'root' ],
					getBlockName: ( id: string ) => hierarchyNames[ id ],
				}
			)
		).toBe( false );
	} );

	it( 'uses the later setting when matching paths have equal depth', () => {
		const hierarchyNames: Record< string, string > = {
			root: 'core/group',
			parent: 'core/quote',
			current: 'core/paragraph',
		};

		expect(
			resolve(
				{
					'core/group': {
						'core/paragraph': { color: { text: true } },
					},
					'core/quote': {
						'core/paragraph': { color: { text: false } },
					},
				},
				{
					getBlockParents: () => [ 'parent', 'root' ],
					getBlockName: ( id: string ) => hierarchyNames[ id ],
				}
			)
		).toBe( false );
	} );

	it( 'ignores a missing ancestor name while resolving nested settings', () => {
		const hierarchyNames: Record< string, string > = {
			root: 'core/group',
			current: 'core/heading',
		};

		expect(
			resolve(
				{
					'core/group': {
						'core/heading': { color: { text: false } },
					},
				},
				{
					getBlockParents: () => [ 'missing', 'root' ],
					getBlockName: ( id: string ) => hierarchyNames[ id ],
				}
			)
		).toBe( false );
	} );

	it( 'preserves a root exact rule instead of using a deeper wildcard rule', () => {
		expect(
			resolve(
				{
					'core/heading': { color: { text: true } },
					'core/quote': {
						'core/*': { color: { text: false } },
					},
				},
				{ getBlockParents: () => [ 'parent' ] }
			)
		).toBe( true );
	} );

	it( 'preserves the legacy limitation on wildcard ancestors', () => {
		const hierarchyNames: Record< string, string > = {
			root: 'core/group',
			current: 'core/paragraph',
		};

		expect(
			resolve(
				{
					'core/*': {
						'core/paragraph': { color: { text: false } },
					},
				},
				{ getBlockName: ( id: string ) => hierarchyNames[ id ] }
			)
		).toBeUndefined();
	} );

	it( 'uses the first matching wildcard declaration', () => {
		expect(
			resolve( {
				'*': { color: { text: true } },
				'core/*': { color: { text: false } },
			} )
		).toBe( true );
	} );

	it( 'unwraps the theme value expected by the WordPress settings API', () => {
		const palette = [ { color: '#fff', name: 'White', slug: 'white' } ];

		expect(
			resolve(
				{
					'core/heading': { color: { palette: { theme: palette } } },
				},
				{ path: 'color.palette' }
			)
		).toBe( palette );
	} );

	it( 'preserves the legacy limitation on top-level primitive settings', () => {
		expect(
			resolve(
				{
					'core/heading': { useRootPaddingAwareAlignments: true },
				},
				{ path: 'useRootPaddingAwareAlignments' }
			)
		).toBe( 'original' );
	} );

	it( 'returns an array setting without changing its value', () => {
		const units = [ 'px', 'rem', '%' ];

		expect(
			resolve(
				{
					'core/heading': { spacing: { units } },
				},
				{ path: 'spacing.units' }
			)
		).toBe( units );
	} );

	it( 'preserves exact-name nested allowedBlocks traversal', () => {
		const settings = {
			'core/group': {
				allowedBlocks: [ 'core/heading' ],
				'core/quote': { allowedBlocks: [ 'core/paragraph' ] },
			},
		};

		expect( getNestedSetting( [ 'core/quote', 'core/group' ], 'allowedBlocks', settings ) ).toEqual(
			{ depth: 2, value: [ 'core/paragraph' ] }
		);
	} );

	it( 'preserves bracket path lookup compatibility', () => {
		expect(
			getNestedSetting( [ 'core/group' ], 'items[0].enabled', {
				'core/group': { items: [ { enabled: true } ] },
			} ).value
		).toBe( true );
	} );

	it( 'preserves the documented wildcard limitation for parent allowedBlocks', () => {
		expect(
			getNestedSetting( [ 'core/group' ], 'allowedBlocks', {
				'core/*': { allowedBlocks: [ 'core/paragraph' ] },
			} )
		).toEqual( { depth: 0, value: undefined } );
	} );
} );
