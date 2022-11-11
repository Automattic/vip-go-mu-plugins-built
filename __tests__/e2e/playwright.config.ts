/**
 * External dependencies
 */
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    retries: 1,
    globalSetup: require.resolve( './lib/global-setup' ),
    timeout: 60000,
    reporter: process.env.CI ? [ [ 'github' ], [ 'junit', { outputFile: 'results.xml' } ] ] : 'line',
    reportSlowTests: null,
    workers: process.env.CI ? 1 : undefined,
    use: {
        headless: process.env.DEBUG_TESTS !== 'true',
        viewport: { width: 1280, height: 1000 },
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        storageState: 'e2eStorageState.json',
        baseURL: process.env.E2E_BASE_URL ? process.env.E2E_BASE_URL : 'http://e2e-test-site.vipdev.lndo.site',
    },
};

export default config;
