import { defineConfig, PlaywrightTestConfig } from '@playwright/test';

const baseConfig =
	require( '@wordpress/scripts/config/playwright.config.js' ) as PlaywrightTestConfig; // eslint-disable-line @typescript-eslint/no-var-requires

const config = defineConfig( {
	...baseConfig,
	testDir: './tests/e2e',
} );

export default config;
