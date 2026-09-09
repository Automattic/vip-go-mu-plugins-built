import { initializeRulesViewer } from './rules-viewer';

const SETTINGS_MARKUP = `
	<select id="user-role-selector">
		<option value="">Any role</option>
		<option value="editor">Editor</option>
	</select>
	<select id="post-type-selector">
		<option value="">Any post type</option>
		<option value="page">Page</option>
	</select>
	<button id="view-rules-button" type="button">View rules</button>
	<span class="vip-governance-query-spinner" hidden></span>
	<pre id="json" data-error-message="Unable to load governance rules." hidden></pre>
`;

const roleSelector = () => document.getElementById( 'user-role-selector' ) as HTMLSelectElement;
const postTypeSelector = () => document.getElementById( 'post-type-selector' ) as HTMLSelectElement;
const viewButton = () => document.getElementById( 'view-rules-button' ) as HTMLButtonElement;
const spinner = () => document.querySelector( '.vip-governance-query-spinner' ) as HTMLElement;
const output = () => document.getElementById( 'json' ) as HTMLElement;

describe( 'initializeRulesViewer', () => {
	beforeEach( () => {
		document.body.innerHTML = SETTINGS_MARKUP;
	} );

	it( 'only shows the action when at least one filter is selected', () => {
		initializeRulesViewer( { request: jest.fn() } );

		expect( viewButton().hidden ).toBe( true );
		roleSelector().value = 'editor';
		roleSelector().dispatchEvent( new Event( 'change' ) );

		expect( viewButton().hidden ).toBe( false );
	} );

	it( 'resets browser-restored selections during initialization', () => {
		roleSelector().value = 'editor';
		postTypeSelector().value = 'page';

		initializeRulesViewer( { request: jest.fn() } );

		expect( roleSelector().value ).toBe( '' );
		expect( postTypeSelector().value ).toBe( '' );
		expect( viewButton().hidden ).toBe( true );
	} );

	it( 'requests and displays rules for both selected filters', async () => {
		const request = jest.fn().mockResolvedValue( { allowedBlocks: [ 'core/paragraph' ] } );
		initializeRulesViewer( { request } );

		roleSelector().value = 'editor';
		postTypeSelector().value = 'page';
		viewButton().click();

		await Promise.resolve();
		await Promise.resolve();

		expect( request ).toHaveBeenCalledWith( {
			path: '/vip-governance/v1/rules?role=editor&postType=page',
		} );
		expect( output().textContent ).toBe(
			JSON.stringify( { allowedBlocks: [ 'core/paragraph' ] }, null, 4 )
		);
	} );

	it( 'displays a useful request error and restores the spinner', async () => {
		const request = jest.fn().mockRejectedValue( {
			code: 'rest_forbidden',
			message: 'Request failed',
		} );
		initializeRulesViewer( { request } );

		roleSelector().value = 'editor';
		viewButton().click();

		expect( spinner().hidden ).toBe( false );

		await Promise.resolve();
		await Promise.resolve();

		expect( output().textContent ).toBe( 'Request failed' );
		expect( spinner().hidden ).toBe( true );
	} );

	it( 'uses the localized fallback when a request has no error message', async () => {
		const request = jest.fn().mockRejectedValue( {} );
		initializeRulesViewer( { request } );

		roleSelector().value = 'editor';
		viewButton().click();

		await Promise.resolve();
		await Promise.resolve();

		expect( output().textContent ).toBe( 'Unable to load governance rules.' );
	} );

	it( 'does nothing when the settings markup is not present', () => {
		document.body.innerHTML = '';

		expect( () => initializeRulesViewer( { request: jest.fn() } ) ).not.toThrow();
	} );
} );
