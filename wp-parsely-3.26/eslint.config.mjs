import wordpress from '@wordpress/eslint-plugin';
import jest from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: [ 'build/', 'vendor/', 'webpack.config.js' ],
	},
	...wordpress.configs[ 'recommended-with-formatting' ],
	jest.configs[ 'flat/recommended' ],
	...tseslint.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			jest: {
				version: 'latest',
			},
		},
		rules: {
			'@wordpress/i18n-text-domain': [
				'error',
				{
					allowedTextDomain: [ 'wp-parsely' ],
				},
			],
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/method-signature-style': 'error',
			// Skip ternaries and if statements: typescript-eslint 8 started reporting truthiness tests in both.
			'@typescript-eslint/prefer-nullish-coalescing': [
				'error',
				{
					ignoreIfStatements: true,
					ignoreTernaryTests: true,
				},
			],
			// Allow unused catch bindings, as typescript-eslint 6 did by default.
			'@typescript-eslint/no-unused-vars': [ 'error', { caughtErrors: 'none' } ],
			// Enabling TS rule and disabling Base rule as it can report incorrect errors.
			'no-shadow': 'off',
			'@typescript-eslint/no-shadow': 'error',
			// Don't require trailing commas in calls and parameter lists, which ESLint 8 didn't check.
			'comma-dangle': [
				'error',
				{
					arrays: 'always-multiline',
					objects: 'always-multiline',
					imports: 'always-multiline',
					exports: 'always-multiline',
					functions: 'ignore',
				},
			],
			// Keep checks the new presets no longer enable.
			'no-loss-of-precision': 'error',
			'jsx-a11y/heading-has-content': 'error',
			// Allow usage of Gutenberg experimental components.
			'@wordpress/no-unsafe-wp-apis': 'off',
			// Allow link tag in JSDocs.
			'jsdoc/check-tag-names': [ 'error', { definedTags: [ 'link' ] } ],
			// Allow `{Function}` and `any` in JSDoc; the TypeScript signatures carry the real types.
			'jsdoc/reject-any-type': 'off',
			'jsdoc/reject-function-type': 'off',
			// Disable import resolution checks for TypeScript files as TypeScript handles this.
			'import/named': 'off',
			'import/no-extraneous-dependencies': 'off',
			// Allow imports from @wordpress package build-types for TypeScript type definitions.
			'import/no-unresolved': [
				'error',
				{
					ignore: [ '@wordpress/.*/build-types/.*' ],
				},
			],
		},
	},
	{
		// Playwright fixtures call `use()`, which isn't a React hook.
		files: [ 'tests/e2e/**' ],
		rules: {
			'react-hooks/rules-of-hooks': 'off',
		},
	},
	{
		// tsconfig.json excludes this file, so lint it without type information.
		...tseslint.configs.disableTypeChecked,
		files: [ 'eslint.config.mjs' ],
	},
];
