/**
 * External dependencies.
 */
import {
	render,
	screen,
	within,
} from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Internal dependencies.
 */
import ParselyRecommendations from '../../../../src/blocks/recommendations/components/parsely-recommendations';
import ParselyRecommendationsList from '../../../../src/blocks/recommendations/components/parsely-recommendations-list';
import ParselyRecommendationsTitle from '../../../../src/blocks/recommendations/components/parsely-recommendations-title';
import RecommendationsStore from '../../../../src/blocks/recommendations/recommendations-store';

/**
 * Verifies that the Block's structure remains consistent and correct
 * when loading one or multiple results, while using different options.
 *
 * API data is mocked in the Initializations section above and is passed
 * into the Block using the `recommendations` prop.
 */
describe( 'Recommendations Block', () => {
	it( 'should display loading text when starting', () => {
		render(
			<RecommendationsStore>
				<ParselyRecommendations />
			</RecommendationsStore>
		);

		const loadingText = screen.getByText( /Loading/i );

		expect( loadingText ).toBeVisible();
	} );

	it( 'should load one recommendation without image', () => {
		expect( verifyBlockStructure( 1, 'One item without image' ) ).toBeTruthy();
	} );

	it( 'should load one recommendation with image', () => {
		expect( verifyBlockStructure( 1, 'One item with image', 'original' ) ).toBeTruthy();
	} );

	it( 'should load one recommendation with thumbnail', () => {
		expect( verifyBlockStructure( 1, 'One item with thumbnail', 'thumbnail' ) ).toBeTruthy();
	} );

	it( 'should load multiple recommendations without image', () => {
		expect( verifyBlockStructure( 2, 'Two items without image' ) ).toBeTruthy();
	} );

	it( 'should load multiple recommendations with image', () => {
		expect( verifyBlockStructure( 2, 'Two items with image', 'original' ) ).toBeTruthy();
	} );

	it( 'should load multiple recommendations with thumbnail', () => {
		expect( verifyBlockStructure( 2, 'Two items with thumbnail', 'thumbnail' ) ).toBeTruthy();
	} );
} );

/**
 * Renders the Recommendations Block and verifies its structure.
 *
 * @param {number} resultCount How many data results should be fetched.
 * @param {string} blockTitle  The title the Block should have.
 * @param {string} imageStyle  Style of Image. Can be 'original', thumbnail or ''.
 * @return {true} Always returns true if end of function is reached.
 */
function verifyBlockStructure( resultCount, blockTitle, imageStyle = '' ) {
	// Expect valid image value and generate render props.
	expect( [ '', 'original', 'thumbnail' ].includes( imageStyle ) ).toBeTruthy();
	const showImages = imageStyle === '' ? false : true;
	const apiData = getApiData( resultCount );

	// Render the Block.
	render(
		<RecommendationsStore>
			<ParselyRecommendationsTitle title={ blockTitle } />
			<ParselyRecommendationsList imagestyle={ imageStyle } showimages={ showImages } recommendations={ apiData } />
		</RecommendationsStore>
	);

	// Verify Block title text and class.
	expect( screen.getByText( blockTitle ) ).toHaveClass( 'parsely-recommendations-list-title' );

	// Verify <ul> class.
	expect( screen.getByRole( 'list' ) ).toHaveClass( 'parsely-recommendations-list' );

	// Verify <li> item count.
	const listItems = screen.getAllByRole( 'listitem' );
	expect( listItems.length ).toBe( apiData.length );

	// Iterate through every <li> item.
	listItems.forEach( ( listItem, index ) => {
		// Initializations.
		const listItemLink = within( listItem ).getByRole( 'link' );
		const listItemText = within( listItem ).getByText( `Article ${ index }` );
		const listItemImage = within( listItem ).queryByRole( 'img' );

		// The <li> should contain an <a>, which should contain the Recommendation's
		// title and a correct "href" attribute.
		expect( listItem ).toContainElement( listItemLink );
		expect( listItemLink ).toContainElement( listItemText );
		expect( listItemLink ).toHaveProperty( 'href', `https://example.com/article-${ index }/` );

		// If the <a> contains an image, it should have a correct "src" attribute.
		if ( imageStyle === '' ) {
			expect( listItemLink ).not.toContainElement( listItemImage );
		} else {
			expect( listItemLink ).toContainElement( listItemImage );
			expect( listItemImage ).toHaveProperty( 'src', `https://example.com/${ imageStyle }-${ index }.jpg` );
		}

		// Verify class names.
		expect( listItem ).not.toHaveClass(); // <li> items don't have a class.
		expect( listItemLink ).toHaveClass( 'parsely-recommendations-link' );
		expect( listItemText ).toHaveClass( 'components-card__body components-card-body parsely-recommendations-cardbody' );
	} );

	return true;
}

/**
 * Generates and returns mocked data to simulate the Parse.ly related API. The
 * data is not random for testability.
 *
 * @param {number} resultCount How many results to fetch (like the API's limit parameter).
 * @return {Array<object>} The generated data.
 */
function getApiData( resultCount ) {
	const results = [];

	for ( let i = 0; i < resultCount; i++ ) {
		results.push(
			{
				author: 'John Doe',
				authors: [ 'John Doe', 'Jane Doe' ],
				full_content_word_count: 0,
				image_url: `https://example.com/original-${ i }.jpg`,
				metadata: null,
				pub_date: '2022-03-14T13:14:00',
				section: 'Articles',
				tags: [ 'parsely_smart:entity:Tag 1', 'parsely_smart:iab:Tag 2' ],
				thumb_url_medium: `https://example.com/thumbnail-${ i }.jpg`,
				title: `Article ${ i }`,
				url: `https://example.com/article-${ i }/`,
			},
		);
	}

	return results;
}
