import { getNestedSettingPaths, getNestedSetting } from './nested-governance-loader';

describe( 'getNestedSettingPaths', () => {
	describe( 'getNestedSettingPaths', () => {
		it( 'should return the nested setting paths given the nested settings', () => {
			const result = getNestedSettingPaths( getTestNestedSettings() );
			expect( result ).toEqual( {
				'core/heading': {
					'color.palette': true,
					'color.palette.theme': true,
				},
				'core/paragraph': {
					'color.palette': true,
					'color.palette.theme': true,
				},
			} );
		} );
	} );

	describe( 'getNestedSetting', () => {
		it( 'should return the nested setting found at the top level', () => {
			const result = getNestedSetting(
				[ 'core/heading' ],
				'color.palette.theme',
				getTestNestedSettings()
			);
			expect( result ).toEqual( {
				depth: 1,
				value: [
					{
						color: '#FFFFF',
						name: 'Primary',
						slug: 'primary',
					},
				],
			} );
		} );

		it( 'should return the nested setting found deep inside a nested block', () => {
			const result = getNestedSetting(
				[ 'core/media-text', 'core/quote', 'core/paragraph' ],
				'color.palette.theme',
				getTestNestedSettings()
			);
			expect( result ).toEqual( {
				depth: 3,
				value: [
					{
						color: '#F00001',
						name: 'Tertiary',
						slug: 'tertiary',
					},
				],
			} );
		} );
	} );
} );

function getTestNestedSettings() {
	return {
		'core/heading': {
			color: {
				palette: {
					theme: [
						{
							color: '#FFFFF',
							name: 'Primary',
							slug: 'primary',
						},
					],
				},
			},
		},
		'core/quote': {
			allowedBlocks: [ 'core/paragraph' ],
			'core/paragraph': {
				color: {
					palette: {
						theme: [
							{
								color: '#F00000',
								name: 'Secondary',
								slug: 'secondary',
							},
						],
					},
				},
			},
		},
		'core/media-text': {
			allowedBlocks: [ 'core/heading', 'core/paragraph' ],
			'core/heading': {
				color: {
					palette: {
						theme: [
							{
								color: '#FFFFF',
								name: 'Primary',
								slug: 'primary',
							},
						],
					},
				},
			},
			'core/quote': {
				allowedBlocks: [ 'core/paragraph' ],
				'core/paragraph': {
					color: {
						palette: {
							theme: [
								{
									color: '#F00001',
									name: 'Tertiary',
									slug: 'tertiary',
								},
							],
						},
					},
				},
			},
		},
	};
}
