/**
 * External dependencies
 */
import {
	createURL,
	visitAdminPage,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	selectScreenOptions,
	setSiteKeys,
	setUserDisplayName,
	startUpTest,
	waitForWpAdmin,
} from '../utils';

const setMetadataFormat = async ( format ) => {
	await visitAdminPage( '/options-general.php', '?page=parsely' );
	await waitForWpAdmin();

	const selectedMetadataFormat = await page.$( `#meta_type_${ format }`, format );
	await selectedMetadataFormat.click();

	const submitButton = await page.$( `form[name="parsely"] #submit` );
	await submitButton.click();

	await waitForWpAdmin();
};

describe( 'Front end metadata insertion', () => {
	beforeAll( async () => {
		await startUpTest();
		await setSiteKeys();
		await selectScreenOptions( { recrawl: true, advanced: false } );

		// Reset display name to compare metadata with default values.
		await setUserDisplayName( 'admin', '' );
	} );

	it( 'Should insert JSON LD on homepage', async () => {
		await setMetadataFormat( 'json_ld' );

		await page.goto( createURL( '/' ) );

		const content = await page.content();

		expect( content ).toContain( '<script type="application/ld+json">{"@context":"https:\\/\\/schema.org","@type":"WebPage","headline":"wp-parsely","url":"http:\\/\\/localhost:8889"}</script>' );

		expect( content ).not.toContain( '<meta name="parsely-title" ' );
	} );

	it( 'Should insert JSON LD on post page', async () => {
		await setMetadataFormat( 'json_ld' );

		await page.goto( createURL( '/', '?p=1' ) );

		const content = await page.content();

		expect( content ).toContain( '<script type="application/ld+json">' );
		expect( content ).toContain( '{"@context":"https:\\/\\/schema.org","@type":"NewsArticle","headline":"Hello world!","url":"http:\\/\\/localhost:8889\\/?p=1","mainEntityOfPage":{"@type":"WebPage","@id":"http:\\/\\/localhost:8889\\/?p=1"},"thumbnailUrl":"","image":{"@type":"ImageObject","url":""},"articleSection":"Uncategorized","author":[{"@type":"Person","name":"admin"}],"creator":["admin"],"publisher":{"@type":"Organization","name":"wp-parsely","logo":""},"keywords":[],"' );

		expect( content ).not.toContain( '<meta name="parsely-title" ' );
	} );

	it( 'Should insert repeated metas on homepage', async () => {
		await setMetadataFormat( 'repeated_metas' );

		await page.goto( createURL( '/' ) );

		const content = await page.content();

		expect( content ).toContain( '<meta name="parsely-title" content="wp-parsely">' );
		expect( content ).toContain( '<meta name="parsely-link" content="http://localhost:8889">' );
		expect( content ).toContain( '<meta name="parsely-type" content="index">' );

		expect( content ).not.toContain( '<script type="application/ld+json">' );
	} );

	it( 'Should insert repeated metas on post page', async () => {
		await setMetadataFormat( 'repeated_metas' );

		await page.goto( createURL( '/', '?p=1' ) );

		const content = await page.content();

		expect( content ).toContain( '<meta name="parsely-title" content="Hello world!">' );
		expect( content ).toContain( '<meta name="parsely-link" content="http://localhost:8889/?p=1">' );
		expect( content ).toContain( '<meta name="parsely-type" content="post">' );
		expect( content ).toMatch( /<meta name="parsely-pub-date" content=".*Z">/ );
		expect( content ).toContain( '<meta name="parsely-section" content="Uncategorized">' );
		expect( content ).toContain( '<meta name="parsely-author" content="admin">' );

		expect( content ).not.toContain( '<script type="application/ld+json">' );
	} );
} );
