const wpvip = require( '@automattic/eslint-plugin-wpvip' );

module.exports = [
	{
		ignores: [ 'build/**', 'node_modules/**', 'vendor/**', '**/*.php' ],
	},
	...wpvip.configs.javascript,
	...wpvip.configs.formatting,
	...wpvip.configs.testing,
	...wpvip.configs.react,
	...wpvip.configs.typescript,
	...wpvip.configs.prettier,
	{
		languageOptions: {
			globals: {
				document: 'readonly',
				URLSearchParams: 'readonly',
				VIP_GOVERNANCE: 'readonly',
			},
		},
	},
];
