/**
 * External dependencies.
 */
import {
	createNewPost,
	enablePageDialogAccept,
	ensureSidebarOpened,
	insertBlock,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies.
 */
import {
	arraysEqual,
	setSiteKeys,
	startUpTest,
} from '../../../utils';

/**
 * Tests for the Recommendations Block's settings functionality.
 */
describe( 'Recommendations Block', () => {
	/**
	 * Prevents browser from locking with dialogs, logs in to WordPress,
	 * and activates the Parse.ly plugin.
	 */
	beforeAll( async () => {
		enablePageDialogAccept();
		await startUpTest();
	} );

	/**
	 * Verifies that the Block works correctly when changing settings.
	 */
	it( 'Should update correctly when any options are changed', async () => {
		await setSiteKeys( 'wpvip.com' );
		await createNewPost();
		await insertBlock( 'Parse.ly' );

		// Verify Block default values.
		await page.waitForSelector( '.parsely-recommendations-list' );
		expect( await getTitleText() ).toMatch( 'Related Content' );
		expect( await getResultCount() ).toBe( 3 );
		expect( await resultsContainImage() ).toBe( true );

		// Open sidebar to start changing settings.
		await ensureSidebarOpened();
		const [ titleInput ] = await page.$x( "//label[contains(., 'Title')]/following-sibling::input" );
		const [ openLinksInNewTabLabel ] = await page.$x( "//label[contains(., 'Open Links in New Tab')]" );
		const [ showImagesLabel ] = await page.$x( "//label[contains(., 'Show Images')]" );
		const [ thumbnailImagesLabel ] = await page.$x( "//label[contains(., 'Thumbnail from Parse.ly')]" );

		// Verify that changing "Title" works.
		await titleInput.click( { clickCount: 3 } );
		await titleInput.type( 'Test' );
		expect( await getTitleText() ).toBe( 'Test' );

		// Verify that changing "Maximum Results" works.
		const [ maximumResultsLabel ] = await page.$x( "//label[contains(., 'Maximum Results')]" );
		await maximumResultsLabel.press( 'Tab' );
		await page.keyboard.type( '5' );
		await page.waitForFunction(
			'document.querySelectorAll(".parsely-recommendations-list > li").length === 5',
			{ polling: 'mutation', timeout: 3000 }
		);

		// Verify that toggling "Open Links in New Tab" works.
		const internalLinkTargets = await getLinkTargets();
		internalLinkTargets.forEach( function( link ) {
			expect( arraysEqual( link, [ '_self', '' ] ) ).toBe( true );
		} );
		await openLinksInNewTabLabel.click();
		const externalLinkTargets = await getLinkTargets();
		externalLinkTargets.forEach( function( link ) {
			expect( arraysEqual( link, [ '_blank', 'noopener' ] ) ).toBe( true );
		} );

		// For images, verify that original and thumbnail "src" attributes are different.
		const originalImagesUrls = await getResultImageUrls();
		await thumbnailImagesLabel.click();
		expect( arraysEqual( originalImagesUrls, await getResultImageUrls() ) ).toBe( false );

		// Verify that toggling "Show Images" works.
		await showImagesLabel.click( );
		expect( await resultsContainImage() ).toBe( false );
	} );
} );

/**
 * Returns the Block's title text.
 *
 * @return {Promise<string>} The Block's title text.
 */
async function getTitleText() {
	return page.$eval( '.parsely-recommendations-list-title', ( element ) => element.textContent );
}

/**
 * Returns the number of results displayed within the Block.
 *
 * @return {Promise<number>} The number of results displayed within the Block.
 */
async function getResultCount() {
	return page.$$eval( '.parsely-recommendations-list > li', ( element ) => element.length );
}

/**
 * Returns whether the Block contains one or more images.
 *
 * @return {Promise<boolean>} Whether the Block contains one or more images.
 */
async function resultsContainImage() {
	return ( await page.$( '.parsely-recommendations-image' ) ) !== null;
}

/**
 * Returns the "src" attribute of all images contained within the Block.
 *
 * @return {Promise<Array<string>>} The "src" attribute of all images contained within the Block.
 */
async function getResultImageUrls() {
	return page.$$eval( '.parsely-recommendations-image', ( imgs ) => imgs.map( ( img ) => img.getAttribute( 'src' ) ) );
}

/**
 * Returns the "target" and "rel" attribute of all links contained within the Block.
 *
 * @return {Promise<Array<string, string>>} The "target" and "rel" attributes of all links contained within the Block.
 */
async function getLinkTargets() {
	return page.$$eval( '.parsely-recommendations-link', ( links ) => links.map(
		( link ) => [ link.getAttribute( 'target' ), link.getAttribute( 'rel' ) ] )
	);
}
