import { __ } from '@wordpress/i18n';

import { CustomFormFieldToken } from '@/data-sources/components/CustomFormFieldToken';

interface FieldsSelectionProps {
	selectedFields: string[];
	availableFields: string[];
	onFieldsChange: ( fields: string[] ) => void;
	disabled?: boolean;
	customHelpText?: string | null;
	label?: string;
}

export const FieldsSelection = ( {
	selectedFields,
	availableFields,
	onFieldsChange,
	customHelpText,
	disabled = false,
	label,
}: FieldsSelectionProps ) => {
	return (
		<CustomFormFieldToken
			label={ label ?? __( 'Fields', 'remote-data-blocks' ) }
			onChange={ selection => {
				let newFields: string[];
				if ( selection.includes( 'Select All' ) ) {
					newFields = Array.from( new Set( availableFields ) );
				} else if ( selection.includes( 'Deselect All' ) ) {
					newFields = [];
				} else {
					newFields = Array.from(
						new Set(
							selection
								.filter( item => item !== 'Select All' && item !== 'Deselect All' )
								.map( item => ( 'object' === typeof item ? item.value : item ) )
						)
					);
				}
				onFieldsChange( newFields );
			} }
			suggestions={ [
				...( selectedFields.length === availableFields.length
					? [ 'Deselect All' ]
					: [ 'Select All' ] ),
				...availableFields,
			] }
			value={ selectedFields }
			__experimentalValidateInput={ input =>
				availableFields.includes( input ) || input === 'Select All' || input === 'Deselect All'
			}
			__nextHasNoMarginBottom
			__experimentalExpandOnFocus
			__next40pxDefaultSize
			disabled={ disabled }
			customHelpText={ customHelpText }
		/>
	);
};
