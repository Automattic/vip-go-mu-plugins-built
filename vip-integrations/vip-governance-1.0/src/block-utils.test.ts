import { applyFilters } from '@wordpress/hooks';

import {
	doesBlockNameMatchBlockWildcard,
	isBlockAllowedByBlockWildcards,
	isBlockAllowedInHierarchy,
} from './block-utils';

jest.mock( '@wordpress/hooks', () => ( {
	applyFilters: jest.fn(),
} ) );

describe( 'blockUtils', () => {
	describe( 'isBlockAllowedInHierarchy', () => {
		describe( 'cascading mode', () => {
			beforeEach( () => {
				jest.mocked( applyFilters ).mockImplementation( () => true );
			} );

			it( 'should return true if the child block is a special core block', () => {
				const blockName = 'core/list-item';
				const parentBlockNames = [ 'core/list', 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/group', 'core/paragraph' ],
					blockSettings: {
						'core/media-text': {
							allowedBlocks: [ 'core/heading' ],
						},
					},
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( true );
			} );

			it( 'should return true if the child block is allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [ 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/group', 'core/paragraph' ],
					blockSettings: {
						'core/media-text': {
							allowedBlocks: [ 'core/heading' ],
						},
					},
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( true );
				expect( parentBlockNames ).toEqual( [ 'core/media-text' ] );
			} );

			it( 'should return false if the child block is not allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [ 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/group', 'core/paragraph' ],
					blockSettings: {
						'core/media-text': {
							allowedBlocks: [ 'core/image' ],
						},
					},
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );

			it( 'should return false if the child block is not allowed in the hierarchy per root rules', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [ 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/group', 'core/paragraph' ],
					blockSettings: {
						'core/media-text': {
							color: {
								text: true,
							},
						},
					},
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );

			it( 'keeps the documented nearest-parent-first order after a nested lookup', () => {
				const parentBlockNames = [ 'core/quote', 'core/group' ];

				isBlockAllowedInHierarchy( 'core/heading', parentBlockNames, {
					allowedBlocks: [ 'core/paragraph' ],
					blockSettings: {
						'core/group': {
							'core/quote': {
								allowedBlocks: [ 'core/heading' ],
							},
						},
					},
				} );

				expect( parentBlockNames ).toEqual( [ 'core/quote', 'core/group' ] );
			} );

			it( 'resolves nested allowedBlocks through repeated parent names', () => {
				expect(
					isBlockAllowedInHierarchy( 'core/heading', [ 'core/quote', 'core/group', 'core/group' ], {
						allowedBlocks: [ 'core/paragraph' ],
						blockSettings: {
							'core/group': {
								'core/group': {
									'core/quote': {
										allowedBlocks: [ 'core/heading' ],
									},
								},
							},
						},
					} )
				).toBe( true );
			} );

			it( 'should return true if the child block is allowed in the hierarchy with no blockSettings', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [ 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/heading', 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( true );
			} );

			it( 'should return false if the child block is not allowed in the hierarchy with no blockSettings', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [ 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );

			it( 'should return true if the root block is allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames: string[] = [];
				const governanceRules = {
					allowedBlocks: [ 'core/heading', 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( true );
			} );

			it( 'should return false if the root block is not allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames: string[] = [];
				const governanceRules = {
					allowedBlocks: [ 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );

			it( 'does not apply allowedBlocks declared under a wildcard parent', () => {
				const result = isBlockAllowedInHierarchy( 'core/heading', [ 'core/group' ], {
					allowedBlocks: [ 'core/group' ],
					blockSettings: {
						'core/*': {
							allowedBlocks: [ 'core/heading' ],
						},
					},
				} );

				expect( result ).toBe( false );
			} );
		} );

		describe( 'restrictive mode', () => {
			beforeEach( () => {
				jest.mocked( applyFilters ).mockImplementation( () => false );
			} );

			it( 'should return true if the child block is a special core block', () => {
				const blockName = 'core/list-item';
				const parentBlockNames = [ 'core/list', 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/group', 'core/paragraph' ],
					blockSettings: {
						'core/media-text': {
							allowedBlocks: [ 'core/heading' ],
						},
					},
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( true );
			} );

			it( 'should return true if the child block is allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [ 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/group', 'core/paragraph' ],
					blockSettings: {
						'core/media-text': {
							allowedBlocks: [ 'core/heading' ],
						},
					},
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( true );
			} );

			it( 'should return false if the child block is not allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [ 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/group', 'core/paragraph' ],
					blockSettings: {
						'core/media-text': {
							allowedBlocks: [ 'core/image' ],
						},
					},
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );

			it( 'should return false if the child block is allowed in the hierarchy with no blockSettings', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [ 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/heading', 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );

			it( 'should return false if the child block is not allowed in the hierarchy with no blockSettings', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [ 'core/media-text' ];
				const governanceRules = {
					allowedBlocks: [ 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );

			it( 'should return true if the root block is allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames: string[] = [];
				const governanceRules = {
					allowedBlocks: [ 'core/heading', 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( true );
			} );

			it( 'should return false if the root block is not allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames: string[] = [];
				const governanceRules = {
					allowedBlocks: [ 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );
		} );
	} );

	describe( 'isBlockAllowedByBlockWildcards', () => {
		it( 'should return true if the block name matches any of the rules', () => {
			const blockName = 'core/heading';
			const rules = [ 'core/heading', 'core/paragraph' ];

			const result = isBlockAllowedByBlockWildcards( blockName, rules );

			expect( result ).toBe( true );
		} );

		it( 'should return false if the block name does not match any rules', () => {
			const blockName = 'core/heading';
			const rules = [ 'core/paragraph' ];

			const result = isBlockAllowedByBlockWildcards( blockName, rules );

			expect( result ).toBe( false );
		} );
	} );

	describe( 'doesBlockNameMatchBlockWildcard', () => {
		it( 'should match every block for the standalone wildcard rule', () => {
			expect( doesBlockNameMatchBlockWildcard( 'core/heading', '*' ) ).toBeTruthy();
			expect( doesBlockNameMatchBlockWildcard( 'custom/product', '*' ) ).toBeTruthy();
		} );

		it( 'should not be null if the block name matches any of the wildcard rules', () => {
			const blockName = 'core/heading';
			const rules = 'core/*';

			const result = doesBlockNameMatchBlockWildcard( blockName, rules );

			expect( result ).toBeTruthy();
		} );

		it( 'should be null if the block name does not match any of the wildcard rules', () => {
			const blockName = 'custom/heading';
			const rules = 'core/*';

			const result = doesBlockNameMatchBlockWildcard( blockName, rules );

			expect( result ).toBeFalsy();
		} );

		it( 'preserves unanchored wildcard matching from existing rules', () => {
			expect( doesBlockNameMatchBlockWildcard( 'core/heading', 'core/*' ) ).toBeTruthy();
			expect( doesBlockNameMatchBlockWildcard( 'custom/core/heading', 'core/*' ) ).toBeTruthy();
		} );

		it( 'preserves regular-expression syntax in wildcard rules', () => {
			expect( doesBlockNameMatchBlockWildcard( 'core/heading', 'core/head*' ) ).toBeTruthy();
			expect( doesBlockNameMatchBlockWildcard( 'core/heading', '*heading' ) ).toBeTruthy();
			expect( doesBlockNameMatchBlockWildcard( 'core/heading', 'core/.+*' ) ).toBeTruthy();
		} );

		it( 'only expands the first wildcard for compatibility', () => {
			expect( () => doesBlockNameMatchBlockWildcard( 'core/heading', 'core/**' ) ).toThrow(
				SyntaxError
			);
		} );

		it( 'should return true if the block name matches any of the rules', () => {
			const blockName = 'core/heading';
			const rules = 'core/heading';

			const result = doesBlockNameMatchBlockWildcard( blockName, rules );

			expect( result ).toBeTruthy();
		} );

		it( 'should return false if the block name does not match any rules', () => {
			const blockName = 'core/heading';
			const rules = 'core/paragraph';

			const result = doesBlockNameMatchBlockWildcard( blockName, rules );

			expect( result ).toBeFalsy();
		} );
	} );
} );
