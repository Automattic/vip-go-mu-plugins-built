import { dispatch, select } from '@wordpress/data';
import { addFilter, applyFilters } from '@wordpress/hooks';

import { setupBlockLocking } from './block-locking';
import { isBlockAllowedInHierarchy } from './block-utils';
import { setupGovernance } from './editor';
import { resolveNestedSetting } from './nested-settings-filter';

import type { GovernanceRuntimeConfig } from './types';

jest.mock( '@wordpress/block-editor', () => ( { store: 'core/block-editor' } ) );
jest.mock( '@wordpress/data', () => ( { dispatch: jest.fn(), select: jest.fn() } ) );
jest.mock( '@wordpress/hooks', () => ( { addFilter: jest.fn(), applyFilters: jest.fn() } ) );
jest.mock( '@wordpress/i18n', () => ( { __: jest.fn( ( value: string ) => value ) } ) );
jest.mock( '@wordpress/notices', () => ( { store: 'core/notices' } ) );
jest.mock( './block-locking', () => ( { setupBlockLocking: jest.fn() } ) );
jest.mock( './block-utils', () => ( { isBlockAllowedInHierarchy: jest.fn() } ) );
jest.mock( './nested-settings-filter', () => ( {
	createNestedSettingRules: jest.fn( () => ( { pathsByBlock: new Map(), settings: {} } ) ),
	resolveNestedSetting: jest.fn(),
} ) );

const config: GovernanceRuntimeConfig = {
	error: false,
	governanceRules: {
		allowedBlocks: [ 'core/paragraph' ],
		allowedFeatures: [],
		blockSettings: {},
	},
	nestedSettings: {},
	urlSettingsPage: '/wp-admin/admin.php?page=vip-block-governance',
};

type FilterCallback = ( ...args: unknown[] ) => unknown;

function getRegisteredFilter( hookName: string ): FilterCallback {
	const filterCall = jest.mocked( addFilter ).mock.calls.find( call => call[ 0 ] === hookName );
	if ( ! filterCall ) {
		throw new Error( `Filter ${ hookName } was not registered.` );
	}

	return filterCall[ 2 ] as FilterCallback;
}

describe( 'setupGovernance', () => {
	const createErrorNotice = jest.fn( () => Promise.resolve() );
	const getBlockName = jest.fn( ( clientId: string ) => {
		return clientId === 'ancestor' ? 'core/group' : 'core/quote';
	} );
	const getBlockParents = jest.fn( () => [ 'ancestor' ] );

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( dispatch ).mockReturnValue( { createErrorNotice } );
		jest.mocked( select ).mockReturnValue( { getBlockName, getBlockParents } as never );
	} );

	it( 'shows a settings action and registers no filters when configuration failed', () => {
		setupGovernance( { ...config, error: 'Rules failed to load.' } );

		expect( createErrorNotice ).toHaveBeenCalledWith( 'Rules failed to load.', {
			id: 'wpcomvip-governance-error',
			isDismissible: true,
			actions: [
				{
					label: 'Open governance settings',
					url: config.urlSettingsPage,
				},
			],
		} );
		expect( addFilter ).not.toHaveBeenCalled();
	} );

	it( 'preserves an insertion veto from WordPress without evaluating governance', () => {
		setupGovernance( config );
		const insertionFilter = getRegisteredFilter( 'blockEditor.__unstableCanInsertBlockType' );

		expect(
			insertionFilter( false, { name: 'core/heading' }, undefined, {
				getBlock: jest.fn(),
			} )
		).toBe( false );
		expect( isBlockAllowedInHierarchy ).not.toHaveBeenCalled();
	} );

	it( 'passes the nearest-parent-first hierarchy through the public insertion filter', () => {
		jest.mocked( isBlockAllowedInHierarchy ).mockReturnValue( true );
		jest.mocked( applyFilters ).mockReturnValue( false );
		setupGovernance( config );
		const insertionFilter = getRegisteredFilter( 'blockEditor.__unstableCanInsertBlockType' );

		expect(
			insertionFilter( true, { name: 'core/heading' }, 'parent', {
				getBlock: () => ( { clientId: 'parent', name: 'core/quote' } ),
			} )
		).toBe( false );
		expect( isBlockAllowedInHierarchy ).toHaveBeenCalledWith(
			'core/heading',
			[ 'core/quote', 'core/group' ],
			config.governanceRules
		);
		expect( applyFilters ).toHaveBeenCalledWith(
			'vip_governance__is_block_allowed_for_insertion',
			true,
			'core/heading',
			[ 'core/quote', 'core/group' ],
			config.governanceRules
		);
	} );

	it( 'registers nested settings and block locking while preserving missing block names', () => {
		setupGovernance( config );
		const settingsFilter = getRegisteredFilter( 'blockEditor.useSetting.before' );

		expect( settingsFilter( 'original', 'color.text', 'current', undefined ) ).toBe( 'original' );
		expect( resolveNestedSetting ).not.toHaveBeenCalled();
		expect( setupBlockLocking ).toHaveBeenCalledWith( config.governanceRules );
	} );
} );
