import { recordTracksEvent } from '@automattic/calypso-analytics';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { sendTracksEvent } from '@/blocks/remote-data-container/utils/tracks';
import { getTracksGlobalProperties } from '@/utils/localized-block-data';

vi.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( '@/utils/localized-block-data', () => ( {
	getTracksGlobalProperties: vi.fn(),
} ) );

describe( 'sendTracksEvent', () => {
	const defaultTracksGlobalProps: TracksGlobalProperties = {
		plugin_version: '0.2',

		// "Tracks" library properties.
		vip_env: 'local',
		vip_org: 1,
		is_vip_user: false,
		hosting_provider: 'vip',
		is_multisite: false,
		wp_version: '6.6',
		_ui: '1',
		_ut: 'anon',
	};

	beforeEach( () => {
		window.REMOTE_DATA_BLOCKS = {
			config: {},
			rest_url: '',
			tracks_global_properties: defaultTracksGlobalProps,
		};
		vi.clearAllMocks();
	} );

	it( 'should not record event if Tracks global properties is not defined', () => {
		window.REMOTE_DATA_BLOCKS = { config: {}, rest_url: '', tracks_global_properties: undefined };

		sendTracksEvent( 'field_shortcode', { action: 'value' } );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'should not track if vip_env is local', () => {
		sendTracksEvent( 'field_shortcode', { action: 'value' } );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'should call recordTracksEvent with the correct event name and properties', () => {
		vi.mocked( getTracksGlobalProperties ).mockReturnValue( {
			...defaultTracksGlobalProps,
			vip_env: 'production',
		} );

		sendTracksEvent( 'field_shortcode', { action: 'actionName' } );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'remotedatablocks_field_shortcode', {
			...defaultTracksGlobalProps,
			vip_env: 'production',
			action: 'actionName',
		} );
	} );
} );
