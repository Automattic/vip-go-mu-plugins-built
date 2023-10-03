/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
( () => {
	function showRulesForRuleType() {
		const roleSelector = document.getElementById( 'user-role-selector' );
		const rolePicked = roleSelector?.value ?? null;

		const postTypeSelector = document.getElementById( 'post-type-selector' );
		const postTypePicked = postTypeSelector?.value ?? null;

		if ( ( rolePicked || postTypePicked ) && window.wp && window.wp.apiRequest ) {
			dataToBeSent = {};
			if ( rolePicked ) {
				dataToBeSent.role = rolePicked;
			}

			if ( postTypePicked ) {
				dataToBeSent.postType = postTypePicked;
			}

			document.querySelector( '.vip-governance-query-spinner' ).classList.add( 'is-active' );
			window.wp
				.apiRequest( {
					path: `/vip-governance/v1/rules`,
					data: dataToBeSent,
				} )
				.done( rules => {
					document.getElementById( 'json' ).textContent = JSON.stringify( rules, undefined, 4 );
					document.getElementById( 'json' ).hidden = false;
				} )
				.fail( error => {
					document.getElementById( 'json' ).textContent = error.responseJSON.message;
					document.getElementById( 'json' ).hidden = false;
				} )
				.complete( () => {
					document.querySelector( '.vip-governance-query-spinner' ).classList.remove( 'is-active' );
				} );
		}
	}

	const roleSelector = document.getElementById( 'user-role-selector' );

	if ( roleSelector ) {
		// Reset to the default value on refresh
		roleSelector.value = '';

		roleSelector.addEventListener( 'change', () => {
			const postTypePicked = document.getElementById( 'post-type-selector' )?.value ?? null;
			if ( roleSelector.value ) {
				document.getElementById( 'view-rules-button' ).style.display = 'inline';
			} else if ( ! postTypePicked ) {
				document.getElementById( 'view-rules-button' ).style.display = 'none';
				document.getElementById( 'json' ).hidden = true;
			}
		} );
	}

	const postTypeSelector = document.getElementById( 'post-type-selector' );

	if ( postTypeSelector ) {
		// Reset to the default value on refresh
		postTypeSelector.value = '';

		postTypeSelector.addEventListener( 'change', () => {
			const rolePicked = document.getElementById( 'user-role-selector' )?.value ?? null;
			if ( postTypeSelector.value ) {
				document.getElementById( 'view-rules-button' ).style.display = 'inline';
			} else if ( ! rolePicked ) {
				document.getElementById( 'view-rules-button' ).style.display = 'none';
				document.getElementById( 'json' ).hidden = true;
			}
		} );
	}

	const viewButton = document.getElementById( 'view-rules-button' );

	if ( viewButton ) {
		viewButton.style.display = 'none';

		viewButton.addEventListener( 'click', showRulesForRuleType );
	}
} )();
