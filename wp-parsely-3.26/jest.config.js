// eslint-disable-next-line @typescript-eslint/no-require-imports
const baseConfig = require( '@wordpress/scripts/config/jest-unit.config' );

module.exports = {
	...baseConfig,
	silent: false,
	verbose: true,
	globals: { TextEncoder, TextDecoder },
	setupFiles: [ './jest.setup.js' ],
	transform: {
		'\\.mjs$': 'babel-jest',
	},
	transformIgnorePatterns: [
		'node_modules/(?!(.+/node_modules/)?(client-zip|marked|parsel-js|uuid|@wordpress/theme)/)',
	],
};
