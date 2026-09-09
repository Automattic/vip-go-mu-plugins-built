import { useBlockEditingMode } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useContext } from '@wordpress/element';
import { addFilter, applyFilters } from '@wordpress/hooks';

import {
	createGovernedBlockEdit,
	isBlockAllowedForEditing,
	setupBlockLocking,
	type BlockEditProps,
} from './block-locking';
import { isBlockAllowedInHierarchy } from './block-utils';

import type { ReactElement } from 'react';

jest.mock( '@wordpress/block-editor', () => ( {
	store: 'core/block-editor',
	useBlockEditingMode: jest.fn(),
} ) );

jest.mock( '@wordpress/components', () => ( {
	Disabled: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/element', () => ( {
	createContext: jest.fn( () => ( { Provider: jest.fn() } ) ),
	useContext: jest.fn(),
} ) );

jest.mock( '@wordpress/hooks', () => ( {
	addFilter: jest.fn(),
	applyFilters: jest.fn(),
} ) );

jest.mock( './block-utils', () => ( {
	isBlockAllowedInHierarchy: jest.fn(),
} ) );

describe( 'block locking', () => {
	type ProviderElement = ReactElement< { value: boolean; children: ReactElement } >;

	const governanceRules = { allowedBlocks: [ 'core/paragraph' ] };
	const props = { clientId: 'current', name: 'core/heading' };

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useSelect ).mockReturnValue( [ 'core/group' ] );
		jest.mocked( useContext ).mockReturnValue( false );
	} );

	it( 'applies the public editing filter to the hierarchy decision', () => {
		jest.mocked( isBlockAllowedInHierarchy ).mockReturnValue( false );
		jest.mocked( applyFilters ).mockReturnValue( true );

		expect(
			isBlockAllowedForEditing( 'core/heading', [ 'core/group' ], governanceRules, false )
		).toBe( true );
		expect( applyFilters ).toHaveBeenCalledWith(
			'vip_governance__is_block_allowed_for_editing',
			false,
			'core/heading',
			[ 'core/group' ],
			governanceRules
		);
	} );

	it( 'allows a child to inherit an existing parent lock without reevaluating it', () => {
		expect(
			isBlockAllowedForEditing( 'core/heading', [ 'core/group' ], governanceRules, true )
		).toBe( true );
		expect( isBlockAllowedInHierarchy ).not.toHaveBeenCalled();
		expect( applyFilters ).not.toHaveBeenCalled();
	} );

	it( 'keeps allowed blocks editable without adding a redundant provider', () => {
		jest.mocked( isBlockAllowedInHierarchy ).mockReturnValue( true );
		jest.mocked( applyFilters ).mockReturnValue( true );
		const BlockEdit = jest.fn( () => null );
		const GovernedBlockEdit = createGovernedBlockEdit( BlockEdit, governanceRules ) as (
			blockProps: BlockEditProps
		) => ReactElement;

		const result = GovernedBlockEdit( props );

		expect( useBlockEditingMode ).toHaveBeenCalledWith( undefined );
		expect( result.type ).toBe( BlockEdit );
	} );

	it( 'disables a governed block and propagates the locked state', () => {
		jest.mocked( isBlockAllowedInHierarchy ).mockReturnValue( false );
		jest.mocked( applyFilters ).mockReturnValue( false );
		const BlockEdit = jest.fn( () => null );
		const GovernedBlockEdit = createGovernedBlockEdit( BlockEdit, governanceRules ) as (
			blockProps: BlockEditProps
		) => ProviderElement;

		const result = GovernedBlockEdit( props );

		expect( useBlockEditingMode ).toHaveBeenCalledWith( 'disabled' );
		expect( result.props.value ).toBe( true );
		const disabledElement = result.props.children as ReactElement< {
			children: ReactElement< { style: Record< string, string | number > } >;
		} >;
		expect( disabledElement.props.children.props.style ).toEqual( {
			opacity: 0.6,
			backgroundColor: '#eee',
			border: '2px dashed #999',
		} );
	} );

	it( 'registers the Gutenberg BlockEdit wrapper once', () => {
		setupBlockLocking( governanceRules );

		expect( addFilter ).toHaveBeenCalledWith(
			'editor.BlockEdit',
			'wpcomvip-governance/with-disabled-blocks',
			expect.any( Function )
		);
	} );
} );
