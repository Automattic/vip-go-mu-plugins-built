/**
 * External dependencies.
 */
import {
	activatePlugin,
	createNewPost,
	ensureSidebarOpened,
	findSidebarPanelToggleButtonWithTitle,
	loginUser,
	visitAdminPage,
} from '@wordpress/e2e-test-utils';

export const PLUGIN_VERSION = '3.6.1';

export const waitForWpAdmin = () => page.waitForSelector( 'body.wp-admin' );

/**
 * Sets the value of a TextBox by typing the value into it.
 *
 * @param {string} id    The TextBox's ID.
 * @param {string} value The value to be written into the TextBox.
 * @return {Promise<void>}
 */
export const setTextBoxValue = async ( id, value ) => {
	await page.focus( '#' + id );
	await page.evaluate( ( elementId ) => {
		document.getElementById( elementId ).value = '';
	}, id );
	await page.keyboard.type( value );
};

/**
 * Sets the Site ID and API Secret to the given values, using the plugin's
 * settings page.
 *
 * @param {string} siteId    The site ID to be saved to the database.
 * @param {string} apiSecret The API Secret to be saved to the database.
 * @return {Promise<void>}
 */
export const setSiteKeys = async ( siteId = 'e2etest.example.com', apiSecret = '' ) => {
	await visitAdminPage( '/options-general.php', '?page=parsely' );

	await setTextBoxValue( 'apikey', siteId );
	await setTextBoxValue( 'api_secret', apiSecret );

	await page.click( 'input#submit' );
	await waitForWpAdmin();
};

/**
 * Sets a new display name for the current WordPress user.
 *
 * @param {string} firstName The user's first name.
 * @param {string} lastName  The user's last name.
 * @return {Promise<void>}
 */
export const setUserDisplayName = async ( firstName, lastName ) => {
	await visitAdminPage( '/profile.php' );

	await setTextBoxValue( 'first_name', firstName );
	await setTextBoxValue( 'last_name', lastName );

	// Tab out and give some time for the Display Name dropdown to populate.
	await page.keyboard.press( 'Tab' );
	await page.waitForTimeout( 250 );

	// Select the full name if a last name has been given.
	await page.evaluate( () => document.getElementById( 'display_name' ).selectedIndex = 0 );
	if ( lastName.length > 0 ) {
		await page.evaluate( () => document.getElementById( 'display_name' ).selectedIndex = 3 );
	}

	await page.click( 'input#submit' );
	await waitForWpAdmin();
};

/**
 * Inserts a new record into the specified taxonomy.
 *
 * @param {string} recordName   The newly inserted record's name.
 * @param {string} taxonomyType The taxonomy type (e.g. 'category' or 'post_tag).
 * @return {Promise<void>}
 */
export const insertRecordIntoTaxonomy = async ( recordName, taxonomyType ) => {
	await visitAdminPage( 'edit-tags.php', '?taxonomy=' + taxonomyType );

	await setTextBoxValue( 'tag-name', recordName );

	await page.click( 'input#submit' );
	await waitForWpAdmin();
};

/**
 * Gets the message returned by the Content Helper according to the various
 * conditions passed to the function.
 *
 * @param {string} category Name of the category to select in the Post Editor.
 * @param {string} tag      Name of the tag to select in the Post Editor.
 * @param {number} timeout  Milliseconds to wait after category/tag selection.
 * @return {Promise<string>} The message returned by the Content Helper.
 */
export const getTopRelatedPostsMessage = async ( category = null, tag = null, timeout = 500 ) => {
	// Selectors
	const addCategoryButton = 'button.components-button.editor-post-taxonomies__hierarchical-terms-add.is-link';
	const pluginButton = 'button[aria-label="Parse.ly Content Helper"]';
	const contentHelperMessage = '.wp-parsely-content-helper div.components-panel__body.is-opened .parsely-top-posts-descr';

	// Run basic operations.
	await createNewPost();
	await ensureSidebarOpened();
	await page.waitForTimeout( 1000 );

	// Select/add category in the Post Editor.
	if ( category !== null ) {
		const categoryToggleButton = await findSidebarPanelToggleButtonWithTitle( 'Categories' );
		await categoryToggleButton.click();
		await page.waitForTimeout( 500 );
		await page.click( addCategoryButton );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.type( category );
		await page.keyboard.press( 'Enter' );
		await categoryToggleButton.click();
	}

	// Select/add tag in the Post Editor.
	if ( tag !== null ) {
		const tagToggleButton = await findSidebarPanelToggleButtonWithTitle( 'Tags' );
		await tagToggleButton.click();
		await page.keyboard.press( 'Tab' );
		await page.keyboard.type( tag );
		await page.keyboard.press( 'Enter' );
		await tagToggleButton.click();
	}

	// Add a delay to wait for taxonomy selection/saving.
	if ( category !== null || tag !== null ) {
		await page.waitForTimeout( timeout );
	}

	// Show the Content Helper and get the displayed message.
	await page.waitForSelector( pluginButton );
	await page.click( pluginButton );
	const topRelatedPostsButton = await findSidebarPanelToggleButtonWithTitle( 'Related Top-Performing Posts' );
	await topRelatedPostsButton.click();
	await page.waitForSelector( contentHelperMessage );
	await page.waitForFunction( // Wait for Content Helper message to appear.
		'document.querySelector("' + contentHelperMessage + '").innerText.length > 0',
		{ polling: 'mutation', timeout: 5000 }
	);
	const text = await page.$eval( contentHelperMessage, ( element ) => element.textContent );

	return text;
};

export const checkH2DoesNotExist = async ( text ) => {
	const [ h2 ] = await page.$x( `//h2[contains(text(), "${ text }")]` );
	return h2 === undefined;
};

/**
 * Sets the visible sections in the array to their values `true` for visible and `false` for not visible.
 *
 * @param {Object} sections Dictionary containing the desired sections to change. Currently, `recrawl` and `advanced`.
 * @return {Promise<void>}
 */
export const selectScreenOptions = async ( sections ) => {
	const [ button ] = await page.$x( '//button[@id="show-settings-link"]' );
	await button.click();

	await page.waitForSelector( '#requires-recrawl' );

	const recrawlInput = await page.$( '#requires-recrawl' );
	const isRecrawlChecked = await ( await recrawlInput.getProperty( 'checked' ) ).jsonValue();
	if ( ( sections.recrawl && ! isRecrawlChecked ) || ( ! sections.recrawl && isRecrawlChecked ) ) {
		await recrawlInput.click();
	}

	const advancedInput = await page.$( '#advanced' );
	const isAdvancedChecked = await ( await advancedInput.getProperty( 'checked' ) ).jsonValue();
	if ( ( sections.advanced && ! isAdvancedChecked ) || ( ! sections.advanced && isAdvancedChecked ) ) {
		await advancedInput.click();
	}

	const [ input ] = await page.$x( '//p[contains(@class, \'submit\')]//input[contains(@name, \'screen-options-apply\')]' );
	await input.click();

	await waitForWpAdmin();
};

/**
 * Saves settings in the settings page and forces a hard refresh.
 *
 * @return {Promise<void>}
 */
export const saveSettingsAndHardRefresh = async () => {
	await page.click( '#submit' );
	await page.waitForSelector( '#submit' );
	await page.evaluate( () => {
		location.reload( true );
	} );
	await page.waitForSelector( '#submit' );
};

/**
 * Performs preparatory actions before starting the tests.
 *
 * @return {Promise<void>}
 */
export const startUpTest = async () => {
	await loginUser();
	await activatePlugin( 'wp-parsely' );
	await waitForWpAdmin();
};

/**
 * Returns whether the passed arrays are equal.
 *
 * This function is meant to compare very simple arrays.Please don't use it to
 * compare arrays that contain objects, or that are complex or large.
 *
 * @param {Array<string>} array1
 * @param {Array<string>} array2
 * @return {boolean} Whether the passed arrays are equal.
 */
export const arraysEqual = ( array1, array2 ) => JSON.stringify( array1 ) === JSON.stringify( array2 );
