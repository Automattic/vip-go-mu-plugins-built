document.addEventListener( 'DOMContentLoaded', (): void => {
	setActiveTab();
	window.addEventListener( 'hashchange', setActiveTab );
	document.querySelector( '.media-single-image button.browse' )?.addEventListener( 'click', selectImage );
} );

function setActiveTab(): void {
	const activeTab = location.hash !== '' ? location.hash.substring( 1 ) : 'basic-section';

	document.querySelectorAll( '.nav-tab' )?.forEach( ( t: Element ): void => {
		if ( t.classList.contains( activeTab + '-tab' ) ) {
			t.classList.add( 'nav-tab-active' );
		} else {
			t.classList.remove( 'nav-tab-active' );
		}
	} );

	document.querySelectorAll( '.tab-content' )?.forEach( ( t: Element ): void => {
		if ( t.classList.contains( activeTab ) ) {
			t.setAttribute( 'style', 'display: initial' );
		} else {
			t.setAttribute( 'style', 'display: none' );
		}
	} );

	const form = document.querySelector( 'form[name="parsely"]' );
	if ( form ) {
		form.removeAttribute( 'hidden' );
		form.setAttribute( 'action', `options.php#${ activeTab }` );
	}
}

function selectImage( event: Event ) {
	const optionName = ( event.target as HTMLButtonElement ).dataset.option;

	const imageFrame = window.wp.media( {
		multiple: false,
		library: {
			type: 'image',
		},
	} );

	imageFrame.on( 'select', function() {
		const url = imageFrame.state().get( 'selection' ).first().toJSON().url;
		const inputSelector: string = '#media-single-image-' + optionName + ' input.file-path';

		const inputElement: HTMLInputElement | null = document.querySelector( inputSelector );
		if ( inputElement ) {
			inputElement.value = url;
		}
	} );

	imageFrame.open();
}
