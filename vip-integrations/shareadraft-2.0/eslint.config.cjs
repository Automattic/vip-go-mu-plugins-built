/**
 * The @wordpress/scripts default config plus one settings block.
 *
 * The @wordpress/* packages the editor script imports are deliberately NOT in
 * package.json: the build extracts every import to a WordPress-provided global
 * (see build/index.asset.php), so installing them would add hundreds of
 * packages to the lockfile that never ship and never run. Listing them as
 * core modules tells ESLint's import rules the environment provides them.
 */
const defaultConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	...defaultConfig,
	{
		settings: {
			'import/core-modules': [
				'@wordpress/api-fetch',
				'@wordpress/components',
				'@wordpress/core-data',
				'@wordpress/data',
				'@wordpress/editor',
				'@wordpress/element',
				'@wordpress/i18n',
				'@wordpress/plugins',
			],
		},
	},
];
