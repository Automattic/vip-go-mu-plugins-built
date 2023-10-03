import { applyFilters } from '@wordpress/hooks';
import {
	isBlockAllowedInHierarchy,
	isBlockAllowedByBlockRegexes,
	doesBlockNameMatchBlockRegex,
} from './block-utils';

jest.mock( '@wordpress/hooks', () => ( {
	applyFilters: jest.fn(),
} ) );

describe( 'blockUtils', () => {
	describe( 'isBlockAllowedInHierarchy', () => {
		describe( 'cascading mode', () => {
			beforeEach( () => {
				applyFilters.mockImplementation( () => true );
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
				const parentBlockNames = [];
				const governanceRules = {
					allowedBlocks: [ 'core/heading', 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( true );
			} );

			it( 'should return false if the root block is not allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [];
				const governanceRules = {
					allowedBlocks: [ 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );
		} );

		describe( 'restrictive mode', () => {
			beforeEach( () => {
				applyFilters.mockImplementation( () => false );
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
				const parentBlockNames = [];
				const governanceRules = {
					allowedBlocks: [ 'core/heading', 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( true );
			} );

			it( 'should return false if the root block is not allowed in the hierarchy', () => {
				const blockName = 'core/heading';
				const parentBlockNames = [];
				const governanceRules = {
					allowedBlocks: [ 'core/paragraph' ],
				};

				const result = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

				expect( result ).toBe( false );
			} );
		} );
	} );

	describe( 'isBlockAllowedByBlockRegexes', () => {
		it( 'should return true if the block name matches any of the rules', () => {
			const blockName = 'core/heading';
			const rules = [ 'core/heading', 'core/paragraph' ];

			const result = isBlockAllowedByBlockRegexes( blockName, rules );

			expect( result ).toBe( true );
		} );

		it( 'should return false if the block name does not match any rules', () => {
			const blockName = 'core/heading';
			const rules = [ 'core/paragraph' ];

			const result = isBlockAllowedByBlockRegexes( blockName, rules );

			expect( result ).toBe( false );
		} );
	} );

	describe( 'doesBlockNameMatchBlockRegex', () => {
		it( 'should not be null if the block name matches any of the regex rules', () => {
			const blockName = 'core/heading';
			const rules = 'core/*';

			const result = doesBlockNameMatchBlockRegex( blockName, rules );

			expect( result ).toBeTruthy();
		} );

		it( 'should be null if the block name does not match any of the regex rules', () => {
			const blockName = 'custom/heading';
			const rules = 'core/*';

			const result = doesBlockNameMatchBlockRegex( blockName, rules );

			expect( result ).toBeFalsy();
		} );

		it( 'should return true if the block name matches any of the rules', () => {
			const blockName = 'core/heading';
			const rules = 'core/heading';

			const result = doesBlockNameMatchBlockRegex( blockName, rules );

			expect( result ).toBeTruthy();
		} );

		it( 'should return false if the block name does not match any rules', () => {
			const blockName = 'core/heading';
			const rules = 'core/paragraph';

			const result = doesBlockNameMatchBlockRegex( blockName, rules );

			expect( result ).toBeFalsy();
		} );
	} );
} );
