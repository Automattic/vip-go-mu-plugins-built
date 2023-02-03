/**
 * Internal dependencies.
 */
import {
	getTopRelatedPostsMessage,
	setSiteKeys,
	startUpTest,
} from '../../../utils';

/**
 * Tests for the errors presented by the Content Helper.
 */
describe( 'Content Helper', () => {
	const contactMessage = 'Contact us about advanced plugin features and the Parse.ly dashboard.';

	/**
	 * Logs in to WordPress and activates the Parse.ly plugin.
	 */
	beforeAll( async () => {
		await startUpTest();
	} );

	/**
	 * Verifies that the Content Helper will display an error when an invalid
	 * Site ID is provided.
	 */
	it( 'Should display an error when an invalid Site ID is provided', async () => {
		await setSiteKeys( 'e2etest.example.com', 'test' );

		expect( await getTopRelatedPostsMessage() ).toMatch( 'Error: Forbidden' );
	} );

	/**
	 * Verifies that the Content Helper will display a "Contact Us" message when
	 * the Site ID and API Secret are not provided.
	 */
	it( 'Should display a "Contact Us" message when the Site ID and API Secret are not provided', async () => {
		await setSiteKeys( '', '' );

		expect( await getTopRelatedPostsMessage() ).toMatch( contactMessage );
	} );

	/**
	 * Verifies that the Content Helper will display a "Contact Us" message when
	 * only the Site ID is provided.
	 */
	it( 'Should display a "Contact Us" message when only the Site ID is provided', async () => {
		await setSiteKeys( 'blog.parsely.com', '' );

		expect( await getTopRelatedPostsMessage() ).toMatch( contactMessage );
	} );

	/**
	 * Verifies that the Content Helper will display a "Contact Us" message when
	 * only the API Secret is provided.
	 */
	it( 'Should display a "Contact Us" message when only the API Secret is provided', async () => {
		await setSiteKeys( '', 'test' );

		expect( await getTopRelatedPostsMessage() ).toMatch( contactMessage );
	} );

	/**
	 * Verifies that the Content Helper will not display a "Contact Us" message
	 * when both the Site ID and API Secret are provided.
	 */
	it( 'Should not display a "Contact Us" message when both the Site ID and API Secret are provided', async () => {
		await setSiteKeys( 'blog.parsely.com', 'test' );

		expect( await getTopRelatedPostsMessage() ).not.toMatch( contactMessage );
	} );
} );
