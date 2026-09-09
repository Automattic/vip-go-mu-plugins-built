const RULES_ENDPOINT = '/vip-governance/v1/rules';

type RulesRequest = ( options: { path: string } ) => Promise< unknown >;

interface RulesViewerOptions {
	request: RulesRequest;
	root?: Document;
}

type RequestData = Record< string, string >;

function getErrorMessage( error: unknown, fallback: string ): string {
	if ( error instanceof Error && error.message ) {
		return error.message;
	}

	if (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof error.message === 'string' &&
		error.message
	) {
		return error.message;
	}

	return fallback;
}

/** Initialize the role and post type rules viewer on the plugin settings page. */
export function initializeRulesViewer( { root = document, request }: RulesViewerOptions ): void {
	const roleSelector = root.getElementById( 'user-role-selector' );
	const postTypeSelector = root.getElementById( 'post-type-selector' );
	const viewButton = root.getElementById( 'view-rules-button' );
	const spinner = root.querySelector( '.vip-governance-query-spinner' );
	const output = root.getElementById( 'json' );

	if (
		! ( roleSelector instanceof HTMLSelectElement ) ||
		! ( postTypeSelector instanceof HTMLSelectElement ) ||
		! ( viewButton instanceof HTMLButtonElement ) ||
		! ( spinner instanceof HTMLElement ) ||
		! ( output instanceof HTMLElement )
	) {
		return;
	}

	const getRequestData = (): RequestData => {
		const data: RequestData = {};

		if ( roleSelector.value ) {
			data.role = roleSelector.value;
		}

		if ( postTypeSelector.value ) {
			data.postType = postTypeSelector.value;
		}

		return data;
	};

	const updateControls = () => {
		const hasSelection = Object.keys( getRequestData() ).length > 0;
		viewButton.hidden = ! hasSelection;

		if ( ! hasSelection ) {
			output.hidden = true;
		}
	};

	const showOutput = ( value: string ) => {
		output.textContent = value;
		output.hidden = false;
	};

	const handleRequest = async () => {
		const data = getRequestData();

		if ( Object.keys( data ).length === 0 ) {
			return;
		}

		spinner.hidden = false;
		spinner.classList.add( 'is-active' );

		try {
			const rules = await request( {
				path: `${ RULES_ENDPOINT }?${ new URLSearchParams( data ) }`,
			} );

			showOutput( JSON.stringify( rules, null, 4 ) );
		} catch ( error ) {
			showOutput(
				getErrorMessage( error, output.dataset.errorMessage ?? 'Unable to load rules.' )
			);
		} finally {
			spinner.hidden = true;
			spinner.classList.remove( 'is-active' );
		}
	};

	roleSelector.addEventListener( 'change', updateControls );
	postTypeSelector.addEventListener( 'change', updateControls );
	viewButton.addEventListener( 'click', () => {
		void handleRequest();
	} );

	roleSelector.value = '';
	postTypeSelector.value = '';
	updateControls();
}
