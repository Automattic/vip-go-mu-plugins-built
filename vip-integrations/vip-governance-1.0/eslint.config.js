const wpvip = require( '@automattic/eslint-plugin-wpvip' );

module.exports = [
	{
		ignores: [ 'build/**', 'node_modules/**', 'vendor/**', '**/*.php' ],
	},
	...wpvip.configs.javascript,
	...wpvip.configs.formatting,
	...wpvip.configs.testing,
	...wpvip.configs.react,
	...wpvip.configs.prettier,
	{
		languageOptions: {
			globals: {
				VIP_GOVERNANCE: 'readonly',
			},
		},
	},
];
