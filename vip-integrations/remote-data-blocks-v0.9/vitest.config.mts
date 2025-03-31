import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig( {
	resolve: {
		alias: {
			'@': path.resolve( __dirname, 'src/' ),
		},
	},
	test: {
		environment: 'happy-dom',
		exclude: [ '**/build/**', '**/node_modules/**', '**/vendor/**', '**/tests/e2e/**' ],
		setupFiles: [ './tests/src/vitest.setup.ts' ],
		coverage: {
			reporter: 'clover',
			reportsDirectory: './coverage/vitest',
		},
	},
} );
