/**
 * External dependencies.
 */
import {
	enablePageDialogAccept,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies.
 */
import {
	getTopRelatedPostsMessage,
	insertRecordIntoTaxonomy,
	setSiteKeys,
	setUserDisplayName,
	startUpTest,
} from '../../../utils';

/**
 * Tests for the Content Helper filters.
 */
describe( 'Content Helper filters', () => {
	/**
	 * Prevents browser from locking with dialogs, logs in to WordPress,
	 * activates the Parse.ly plugin, and sets valid site keys.
	 */
	beforeAll( async () => {
		enablePageDialogAccept();
		await startUpTest();
		await setSiteKeys( 'blog.parsely.com', 'test' );
	} );

	/**
	 * Verifies that the Content Helper attempts to fetch results when a Site ID
	 * and API Secret are provided.
	 */
	it( 'Should attempt to fetch results when a Site ID and API Secret are provided', async () => {
		await setUserDisplayName( 'admin', '' );

		expect( await getTopRelatedPostsMessage() ).toMatch( `The Parse.ly API did not return any results for top-performing posts by author "admin".` );
	} );

	/**
	 * Verifies that the Content Helper respects the author > category > tag
	 * filter prioritization order, with author being the weakest and tag the
	 * strongest.
	 *
	 * Note: This test inserts the category/tag into the database before
	 * selecting it in the WordPress Post Editor.
	 */
	it( 'Should be prioritized in the correct order', async () => {
		const firstName = 'Andrew';
		const lastName = 'Montalenti';
		const categoryName = 'Parse.ly Tech';
		const tagName = 'changelog';

		await setUserDisplayName( firstName, lastName );
		await insertRecordIntoTaxonomy( categoryName, 'category' );
		await insertRecordIntoTaxonomy( tagName, 'post_tag' );

		// Author.
		expect( await getTopRelatedPostsMessage() ).toMatch( `Top-performing posts by author "${ firstName } ${ lastName }" in last 3 days.` );

		// Author + category.
		expect( await getTopRelatedPostsMessage( categoryName ) ).toMatch( `Top-performing posts in category "${ categoryName }" in last 3 days.` );

		// Author + tag.
		expect( await getTopRelatedPostsMessage( null, tagName ) ).toMatch( `Top-performing posts with tag "${ tagName }" in last 3 days.` );

		// Author + category + tag.
		expect( await getTopRelatedPostsMessage( categoryName, tagName ) ).toMatch( `Top-performing posts with tag "${ tagName }" in last 3 days.` );
	} );

	/**
	 * Verifies that the Content Helper will work correctly when a new taxonomy
	 * is added from within the WordPress Post Editor.
	 *
	 * Note: This test does not insert the taxonomy into the database before
	 * selecting it in the WordPress Post Editor. As such, a delay in
	 * intercepting the new value is expected, since it must first be stored
	 * into the database and then picked up by the Content Helper.
	 */
	it( 'Should work correctly when a taxonomy is added from within the WordPress Post Editor', async () => {
		const categoryName = 'Parse.ly Tips';

		expect( await getTopRelatedPostsMessage( categoryName, null, 2000 ) ).toMatch( `Top-performing posts in category "${ categoryName }" in last 3 days.` );
	} );
} );
