/**
 * External dependencies
 */
import {
	activateTheme,
	visitAdminPage,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	setSiteKeys,
	startUpTest,
	waitForWpAdmin,
} from '../utils';

const deactivatedPluginWidgetText = 'The Parse.ly Site ID and Parse.ly API Secret fields need to be populated on the Parse.ly settings page for this widget to work.';

const closeWidgetScreenModal = () => page.keyboard.press( 'Escape' );

const insertParselyWidget = async () => {
	await page.waitForTimeout( 500 );
	await page.click( '.block-editor-button-block-appender' );
	await page.waitForTimeout( 500 );
	await page.keyboard.type( 'parse.ly recommended widget' );
	await page.keyboard.press( 'Tab' );
	await page.keyboard.press( 'Tab' );
	await page.keyboard.press( 'Enter' );
	await page.waitForTimeout( 500 );
};

const getNonActiveWidgetText = async () => {
	const [ h3 ] = await page.$x( "//h3[contains(., 'Parse.ly Recommended Widget')]" );

	const widgetContent = await page.evaluateHandle( ( el ) => el.nextElementSibling, h3 );
	return page.evaluate( ( el ) => el.textContent, widgetContent );
};

describe( 'Recommended widget', () => {
	beforeAll( async () => {
		page.on( 'dialog', async function( dialog ) {
			await dialog.accept();
		} );

		await startUpTest();
		await activateTheme( 'twentytwentyone' );
	} );

	afterAll( async () => {
		await activateTheme( 'twentytwentytwo' );
	} );

	it( 'Widget should be available but inactive without api key and secret', async () => {
		await setSiteKeys( '' );

		await visitAdminPage( '/widgets.php', '' );
		await waitForWpAdmin();

		await closeWidgetScreenModal();
		await insertParselyWidget();

		expect( await getNonActiveWidgetText() ).toContain( deactivatedPluginWidgetText );
	} );

	it( 'Widget should be available but inactive without api secret', async () => {
		await setSiteKeys();

		await visitAdminPage( '/widgets.php', '' );
		await waitForWpAdmin();

		await closeWidgetScreenModal();
		await insertParselyWidget();

		expect( await getNonActiveWidgetText() ).toContain( deactivatedPluginWidgetText );
	} );
} );
