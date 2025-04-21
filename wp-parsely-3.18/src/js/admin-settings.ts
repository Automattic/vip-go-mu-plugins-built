document.addEventListener( 'DOMContentLoaded', (): void => {
	addContentHelperTabEventHandlers();
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

/**
 * Adds the necessary event handlers to the Content Helper tab.
 *
 * @since 3.16.0
 */
function addContentHelperTabEventHandlers(): void {
	// Selector for the checkbox that enables/disables all AI features.
	const aiFeaturesCheckbox = document.querySelector<HTMLInputElement>(
		'input#content_helper_ai_features_enabled'
	);

	// Selector for the checkboxes that enable/disable individual AI features.
	const featureCheckboxes = document.querySelectorAll<HTMLInputElement>(
		'input#content_helper_smart_linking_enabled, ' +
		'input#content_helper_title_suggestions_enabled, ' +
		'input#content_helper_excerpt_suggestions_enabled'
	);

	// Selector for all fieldsets in the Content Helper section.
	const fieldsets = document.querySelectorAll(
		'div.content-helper-section fieldset'
	);

	// Event handlers.
	enableAllFormFieldsOnSubmit();
	updateAllFeatureSections(); // Must run on load to update the UI.

	aiFeaturesCheckbox?.addEventListener( 'change', (): void => {
		updateAllFeatureSections();
	} );

	featureCheckboxes.forEach( ( checkbox ): void => {
		checkbox.addEventListener( 'change', (): void => {
			updateFeatureSection( checkbox );
		} );
	} );

	/**
	 * Turns on/off all AI feature sections in the UI.
	 *
	 * @since 3.16.0
	 */
	function updateAllFeatureSections(): void {
		if ( ! aiFeaturesCheckbox ) {
			return;
		}

		if ( aiFeaturesCheckbox.checked ) {
			// Enable all applicable fieldsets.
			fieldsets.forEach( ( fieldset: Element ): void => {
				setDisabled( fieldset, false );

				featureCheckboxes.forEach( ( checkbox ): void => {
					updateFeatureSection( checkbox );
				} );
			} );
		} else {
			// Disable all fieldsets.
			fieldsets.forEach( ( fieldset: Element ): void => {
				if ( ! fieldset.querySelector( `#${ aiFeaturesCheckbox.id }` ) ) {
					setDisabled( fieldset );
				}
			} );

			// Disable "Enabled" labels.
			document.querySelectorAll( 'label.prevent-disable' )
				.forEach( ( label: Element ): void => {
					setPreventDisable( label, false );
				} );
		}
	}

	/**
	 * Turns on/off a specific feature section in the UI.
	 *
	 * @since 3.16.0
	 *
	 * @param {HTMLInputElement} checkbox The checkbox controlling the feature.
	 */
	function updateFeatureSection( checkbox: HTMLInputElement ): void {
		const userRolesFieldset = checkbox
			.closest( 'fieldset' )?.nextSibling?.nextSibling as HTMLElement;

		if ( checkbox.checked ) {
			setDisabled( [ checkbox, userRolesFieldset ], false );
		} else {
			setDisabled( userRolesFieldset );

			// Keep enabled styling on "Enabled" labels for visibility.
			const enabledLabel = checkbox.parentElement as HTMLLabelElement;
			setPreventDisable( enabledLabel );
		}
	}

	/**
	 * Allows or prevents an element from being shown as disabled.
	 *
	 * This is done by injecting a class into the element, which is used in CSS.
	 *
	 * @since 3.16.0
	 *
	 * @param {Element} element The target element.
	 * @param {boolean} status  true to prevent disabled style, false to allow.
	 */
	function setPreventDisable( element: Element, status: boolean = true ): void {
		if ( status ) {
			element.classList.add( 'prevent-disable' );
		} else {
			element.classList.remove( 'prevent-disable' );
		}
	}

	/**
	 * Sets the disabled attribute on an element.
	 *
	 * @since 3.16.0
	 *
	 * @param {Element | Element[]} element The target element.
	 * @param {boolean}             status  true to disable, false to enable.
	 */
	function setDisabled( element: Element | Element[], status: boolean = true ): void {
		if ( ! Array.isArray( element ) ) {
			element = [ element ];
		}

		element.forEach( ( el: Element ): void => {
			if ( status ) {
				el.setAttribute( 'disabled', 'disabled' );
			} else {
				el.removeAttribute( 'disabled' );
			}
		} );
	}

	/**
	 * Allows the form to post its whole data.
	 *
	 * When elements are disabled, they are not included when submitting the
	 * form, resulting in missing data.
	 *
	 * This workaround removes any disabled attribute so the form can submit its
	 * whole data. It also prevents styling changes while the data is being
	 * submitted, in order to avoid visual glitches.
	 *
	 * @since 3.16.0
	 */
	function enableAllFormFieldsOnSubmit(): void {
		document.querySelector( '.wp-admin form[name="parsely"]' )
			?.addEventListener( 'submit', (): void => {
				const baseSelector = '.wp-admin .content-helper-section fieldset';

				document.querySelectorAll( `${ baseSelector }[disabled]` )
					.forEach( ( fieldset: Element ): void => {
						// Style the whole setting table row as disabled.
						fieldset.parentElement?.parentElement?.classList.add(
							'disabled-before-posting'
						);

						// Avoid disabled checkbox styling changes.
						fieldset.querySelectorAll(
							`${ baseSelector } label input[type="checkbox"]`
						).forEach( ( input: Element ): void => {
							input.classList.add( 'disabled' );
						} );

						fieldset.removeAttribute( 'disabled' );
					} );
			} );
	}
}
