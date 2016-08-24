/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { connectModuleOptions } from 'components/module-settings/connect-module-options';

export function ModuleSettingsForm( InnerComponent ) {
	const SettingsForm = React.createClass( {
		getInitialState() {
			return {
				options: {}
			}
		},
		onOptionChange( event ) {
			const optionName = event.target.name;
			let optionValue;
			// Get the option value from the `checked` property if present.
			if ( event.target.type === 'checkbox' ) {
				optionValue = typeof event.target.checked !== 'undefined'
					? event.target.checked
					: event.target.value;
			}
			if ( event.target.type === 'radio' ) {
				optionValue = event.target.value;
			}

			this.updateFormStateOptionValue( optionName, optionValue );
		},
		updateFormStateOptionValue( optionName, optionValue ) {
			const newOptions = {
				...this.state.options,
				[ optionName ]: optionValue
			};
			this.setState( { options: newOptions } );
			return true;
		},
		onSubmit( event ) {
			event.preventDefault();
			this.props.updateOptions( this.state.options );
		},
		getOptionValue( optionName ) {
			const currentValue = this.props.getOptionCurrentValue( this.props.module.module, optionName );
			return typeof this.state.options[ optionName ] !== 'undefined'
				? this.state.options[ optionName ]
				: currentValue;
		},
		isDirty() {
			return !! Object.keys( this.state.options ).length;
		},
		render() {
			return(
				<InnerComponent
					getOptionValue={ this.getOptionValue }
					onSubmit={ this.onSubmit }
					onOptionChange={ this.onOptionChange }
					updateFormStateOptionValue={ this.updateFormStateOptionValue }
					isDirty={ this.isDirty }
					{ ...this.props } />
			);
		}
	} );
	return connectModuleOptions( SettingsForm );
}