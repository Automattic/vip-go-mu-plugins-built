/*
 * External dependencies
 */
import {
	getContext,
	store,
	getConfig,
	withSyncEvent as originalWithSyncEvent,
} from '@wordpress/interactivity';
/*
 * Internal dependencies
 */
import { validateField, isEmptyValue } from '../../contact-form/js/validate-helper';
import { focusNextInput, dispatchSubmitEvent, submitForm } from './shared';

const withSyncEvent =
	originalWithSyncEvent ||
	( cb =>
		( ...args ) =>
			cb( ...args ) );

const NAMESPACE = 'jetpack/form';
const config = getConfig( NAMESPACE );
let errorTimeout = null;

const updateField = ( fieldId, value, showFieldError = false ) => {
	const context = getContext();
	let field = context.fields[ fieldId ];

	if ( ! field ) {
		const { fieldType, fieldLabel, fieldValue, fieldIsRequired, fieldExtra } = context;
		registerField( fieldId, fieldType, fieldLabel, fieldValue, fieldIsRequired, fieldExtra );
		field = context.fields[ fieldId ];
	}
	if ( field ) {
		const { type, isRequired, extra } = field;
		field.value = value;
		field.error = validateField( type, value, isRequired, extra );
		field.showFieldError = showFieldError;
	}
};

const setSubmissionData = ( data = [] ) => {
	const context = getContext();

	context.submissionData = data;

	// This cannot be a derived state because it needs to be defined on the backend for first render to avoid hydration errors.
	context.formattedSubmissionData = data.map( item => ( {
		label: maybeAddColonToLabel( item.label ),
		value: maybeTransformValue( item.value ),
	} ) );
};

const registerField = (
	fieldId,
	type,
	label = '',
	value = '',
	isRequired = false,
	extra = null
) => {
	const context = getContext();

	if ( ! context.fields[ fieldId ] ) {
		context.fields[ fieldId ] = {
			id: fieldId,
			type,
			label,
			value,
			isRequired,
			extra,
			error: validateField( type, value, isRequired, extra ),
			step: context?.step ? context.step : 1,
		};
	}
};

const getError = field => {
	if ( field.type === 'number' ) {
		if ( field.error === 'invalid_min_number' ) {
			return config.error_types.invalid_min_number.replace( '%d', field.extra.min );
		}

		if ( field.error === 'invalid_max_number' ) {
			return config.error_types.invalid_max_number.replace( '%d', field.extra.max );
		}
	}

	return config.error_types && config.error_types[ field.error ];
};

const maybeAddColonToLabel = label => {
	const formattedLabel = label ? label : null;

	if ( ! formattedLabel ) {
		return null;
	}

	return formattedLabel.endsWith( '?' ) ? formattedLabel : formattedLabel.replace( /:$/, '' ) + ':';
};

const maybeTransformValue = value => {
	// For file upload fields, we want to show the file name and size
	if ( value?.name && value?.size ) {
		return value.name + ' (' + value.size + ')';
	}

	return value;
};

const { state } = store( NAMESPACE, {
	state: {
		get fieldHasErrors() {
			const context = getContext();
			const fieldId = context.fieldId;
			const field = context.fields[ fieldId ] || {};

			// Don't show is_required untill the user first tries to submit the form.
			if ( ! context.showErrors && field.error && field.error === 'is_required' ) {
				return false;
			}

			return ( context.showErrors || field.showFieldError ) && field.error && field.error !== 'yes';
		},

		get isFormEmpty() {
			const context = getContext();
			// If this is a multistep form (identified by the presence of `maxSteps` in context),
			// we never want to treat the form as completely empty. Treat it as not empty so that
			// the `invalid_form_empty` message is never shown for multistep forms.
			if ( context?.maxSteps && context.maxSteps > 0 ) {
				return false;
			}

			return ! Object.values( context.fields ).some( field => ! isEmptyValue( field.value ) );
		},

		get isFieldEmpty() {
			const context = getContext();
			const fieldId = context.fieldId;
			const field = context.fields[ fieldId ] || {};
			return isEmptyValue( field?.value );
		},

		get hasFieldValue() {
			return ! state.isFieldEmpty;
		},

		get isSubmitting() {
			const context = getContext();
			return context.isSubmitting;
		},

		get isAriaDisabled() {
			return state.isSubmitting;
		},

		get errorMessage() {
			const context = getContext();
			const fieldId = context.fieldId;
			const field = context.fields[ fieldId ] || {};

			if ( ! ( context.showErrors || field.showFieldError ) || ! field.error ) {
				return '';
			}

			return getError( field );
		},

		get isFormValid() {
			if ( state.isFormEmpty ) {
				return false;
			}
			const context = getContext();
			if ( context.isMultiStep ) {
				// For multistep forms, we only validate fields that are part of the current step.
				return ! Object.values( context.fields ).some(
					field => field.error !== 'yes' && field.step === context.currentStep
				);
			}
			return ! Object.values( context.fields ).some( field => field.error !== 'yes' );
		},

		get showFormErrors() {
			const context = getContext();

			return ! state.isFormValid && context.showErrors;
		},

		get showSubmissionError() {
			const context = getContext();

			return !! context.submissionError && ! state.showFormErrors;
		},

		get getFormErrorMessage() {
			if ( state.isFormEmpty ) {
				const context = getContext();
				// Never show the "form empty" error for multistep forms.
				if ( context.isMultiStep ) {
					return config.error_types.invalid_form_empty;
				}
			}
			return config.error_types.invalid_form;
		},

		get getErrorList() {
			const errors = [];
			if ( state.isFormEmpty ) {
				return errors;
			}
			const context = getContext();
			if ( context.showErrors ) {
				Object.values( context.fields ).forEach( field => {
					if ( context.isMultiStep && field.step !== context.currentStep ) {
						return;
					}
					if ( field.error && field.error !== 'yes' ) {
						errors.push( {
							anchor: '#' + field.id,
							label: field.label + ' : ' + getError( field ),
							id: field.id,
						} );
					}
				} );
			}
			return errors;
		},

		get getFieldValue() {
			const context = getContext();
			const fieldId = context.fieldId;
			const field = context.fields[ fieldId ];
			return field?.value || '';
		},
	},

	actions: {
		updateFieldValue: ( fieldId, value ) => {
			updateField( fieldId, value );
		},

		// prevents the number field value from being changed by non-numeric values
		handleNumberKeyPress: withSyncEvent( event => {
			// Allow only numbers, decimal point and minus sign.
			if ( ! /^[0-9.]*$/.test( event.key ) ) {
				event.preventDefault();
			}
			// check if it has multiple decimal points
			if ( event.key === '.' && event.target.value.includes( '.' ) ) {
				event.preventDefault();
			}
		} ),

		onFieldChange: event => {
			let value = event.target.value;
			const context = getContext();
			const fieldId = context.fieldId;

			if ( context.fieldType === 'checkbox' ) {
				value = event.target.checked ? '1' : '';
			}

			updateField( fieldId, value );
		},

		onMultipleFieldChange: event => {
			const context = getContext();
			const fieldId = context.fieldId;
			const field = context.fields[ fieldId ];
			const value = event.target.value;
			let newValues = [ ...( field.value || [] ) ];

			if ( event.target.checked ) {
				newValues.push( value );
			} else {
				newValues = newValues.filter( v => v !== value );
			}

			updateField( fieldId, newValues );
		},

		onFieldBlur: event => {
			const context = getContext();
			updateField( context.fieldId, event.target.value, true );
		},

		onFormReset: () => {
			const context = getContext();
			context.fields = [];
			context.showErrors = false;

			// Dispatch custom events to reset all fields
			const formElement = document.getElementById( context.elementId );

			if ( formElement ) {
				const fieldWrappers = formElement.querySelectorAll( '[data-wp-on--jetpack-form-reset]' );

				fieldWrappers.forEach( wrapper => {
					wrapper.dispatchEvent( new CustomEvent( 'jetpack-form-reset', { bubbles: false } ) );
				} );
			}

			if ( context.isMultiStep ) {
				context.currentStep = 1;
			}
		},

		onFormSubmit: withSyncEvent( function* ( event ) {
			const context = getContext();

			if ( ! state.isFormValid ) {
				context.showErrors = true;
				event.preventDefault();
				event.stopPropagation();

				return;
			}

			if ( context.isMultiStep && context.currentStep < context.maxSteps ) {
				// If this is a multistep form and the current input is not the last in the step,
				// we don't want to submit the form, but rather advance to the next step.
				context.currentStep += 1;
				context.showErrors = false;

				event.preventDefault();
				event.stopPropagation();
				const formHash = context.formHash;

				setTimeout( () => {
					focusNextInput( formHash );
				}, 100 );

				return;
			}

			context.isSubmitting = true;

			if ( context.useAjax ) {
				event.preventDefault();
				event.stopPropagation();
				context.submissionError = null;

				const { success, error, data, refreshArgs } = yield submitForm( context.formHash );

				if ( success ) {
					setSubmissionData( data );
					context.submissionSuccess = true;

					if ( refreshArgs ) {
						const url = new URL( window.location.href );
						url.searchParams.set( 'contact-form-id', refreshArgs[ 'contact-form-id' ] );
						url.searchParams.set( 'contact-form-sent', refreshArgs[ 'contact-form-sent' ] );
						url.searchParams.set( 'contact-form-hash', refreshArgs[ 'contact-form-hash' ] );
						url.searchParams.set( '_wpnonce', refreshArgs._wpnonce );
						window.history.replaceState( null, '', url.toString() );
					}
				} else {
					context.submissionError = error;

					if ( errorTimeout ) {
						clearTimeout( errorTimeout );
					}

					errorTimeout = setTimeout( () => {
						context.submissionError = null;
					}, 5000 );

					setSubmissionData( [] );
				}

				context.isSubmitting = false;
			}
		} ),

		onKeyDownTextarea: withSyncEvent( event => {
			if ( ! ( event.key === 'Enter' && event.shiftKey ) ) {
				return;
			}
			// Prevent the default behavior of adding a new line.
			event.preventDefault();
			event.stopPropagation();

			const context = getContext();

			dispatchSubmitEvent( context.formHash );
		} ),

		scrollIntoView: withSyncEvent( event => {
			const context = getContext();

			const element = document.querySelector( context.item.anchor );

			if ( element ) {
				element.focus( { preventScroll: true } );
				element.scrollIntoView( { behavior: 'smooth' } );
				event.preventDefault();
				return;
			}
			const findName = context.item.anchor.substring( 1 );
			// If the anchor is a hash, we need to find the element with that ID.
			const anchorElement = document.querySelector( '[name="' + findName + '"]' );
			if ( anchorElement ) {
				anchorElement.focus( { preventScroll: true } );
				anchorElement.scrollIntoView( { behavior: 'smooth' } );
				event.preventDefault();
				return;
			}

			// If the element is not found, we can log an error or handle it as needed.
			const fieldset = document.getElementById( findName + '-label' );
			if ( fieldset ) {
				fieldset.querySelector( 'input' ).focus( { preventScroll: true } );
				fieldset.scrollIntoView( { behavior: 'smooth' } );
				event.preventDefault();
			}
		} ),

		goBack: () => {
			const context = getContext();

			const form = document.getElementById( context.elementId );

			form?.reset?.();
			setSubmissionData( [] );
			context.submissionError = null;
			context.hasClickedBack = true;
			context.submissionSuccess = false;

			// Remove the refresh args from the URL.
			const url = new URL( window.location.href );
			url.searchParams.delete( 'contact-form-id' );
			url.searchParams.delete( 'contact-form-sent' );
			url.searchParams.delete( 'contact-form-hash' );
			url.searchParams.delete( '_wpnonce' );
			window.history.replaceState( null, '', url.toString() );
		},
	},

	callbacks: {
		initializeField() {
			const context = getContext();
			const { fieldId, fieldType, fieldLabel, fieldValue, fieldIsRequired, fieldExtra } = context;
			registerField( fieldId, fieldType, fieldLabel, fieldValue, fieldIsRequired, fieldExtra );
		},

		scrollToWrapper() {
			const context = getContext();

			if ( context.submissionSuccess || context.hasClickedBack ) {
				const wrapperElement = document.getElementById( `contact-form-${ context.formId }` );
				wrapperElement?.scrollIntoView( { behavior: 'smooth' } );
				context.hasClickedBack = false;
			}
		},
	},
} );
