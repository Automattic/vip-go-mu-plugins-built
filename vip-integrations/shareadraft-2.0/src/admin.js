/**
 * The Gmail-style "select all across pages" wiring on the Preview Links screen.
 *
 * The banner, the hidden shareadraft_all field, and the table markup are all rendered by
 * PreviewLinksAdminPage; this script only connects them. It is enqueued on
 * every load of that screen, but the banner is only rendered when there is more
 * than one page of links to offer, so bail quietly when it is absent.
 */
document.addEventListener( 'DOMContentLoaded', function () {
	const all = document.getElementById( 'shareadraft-all' );

	if ( ! all ) {
		return;
	}

	// A browser restoring form state on Back would otherwise bring back a
	// select-all the hidden banner no longer shows.
	all.value = '';

	const form = document.getElementById( 'shareadraft-links' );
	const banner = document.getElementById( 'shareadraft-select-all' );

	if ( ! form || ! banner ) {
		return;
	}

	const offer = document.getElementById( 'shareadraft-select-all-offer' );
	const active = document.getElementById( 'shareadraft-select-all-active' );
	const masters = [ 'cb-select-all-1', 'cb-select-all-2' ]
		.map( function ( id ) {
			return document.getElementById( id );
		} )
		.filter( Boolean );

	function reset() {
		all.value = '';
		banner.hidden = true;
		offer.hidden = false;
		active.hidden = true;
	}

	masters.forEach( function ( cb ) {
		cb.addEventListener( 'change', function () {
			if ( cb.checked ) {
				banner.hidden = false;
			} else {
				reset();
			}
		} );
	} );

	// Unticking any row narrows the selection again.
	form.addEventListener( 'change', function ( event ) {
		const input = event.target;
		if ( input.name === 'links[]' && ! input.checked ) {
			reset();
		}
	} );

	document
		.getElementById( 'shareadraft-select-all-btn' )
		.addEventListener( 'click', function () {
			all.value = '1';
			offer.hidden = true;
			active.hidden = false;
		} );

	document
		.getElementById( 'shareadraft-clear-selection-btn' )
		.addEventListener( 'click', function () {
			reset();
			form.querySelectorAll(
				'.check-column input[type=checkbox]'
			).forEach( function ( cb ) {
				cb.checked = false;
			} );
		} );
} );
