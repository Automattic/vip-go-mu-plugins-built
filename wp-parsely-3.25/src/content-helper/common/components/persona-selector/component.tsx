/**
 * WordPress dependencies
 */
import {
	Disabled,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	TextControl,
} from '@wordpress/components';
import { useDebounce, useInstanceId } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, pencil } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { MoreArrow } from '../../icons/more-arrow';
import { MAX_CUSTOM_VALUE_LENGTH } from '../../utils/constants';
import { toMetadata, VocabularyEntry } from '../../utils/vocabulary';

/**
 * Represents a single persona in the PARSELY_PERSONAS list.
 *
 * @since 3.14.0
 */
type PersonaMetadata = VocabularyEntry;

/**
 * List of the available personas.
 * Each persona has a label and an optional icon.
 *
 * The predefined personas come from PHP, which is their single source, so that
 * the plugin's settings page can offer the same choices. The custom persona is
 * defined here, as it is a UI affordance rather than part of the vocabulary,
 * and carries an icon that PHP cannot express.
 *
 * @since 3.13.0
 * @since 3.24.0 The predefined personas are supplied by PHP.
 */
export const PARSELY_PERSONAS: Record<string, PersonaMetadata> = {
	...toMetadata( window.wpParselyContentHelperPersonas ),
	custom: {
		label: __( 'Custom Persona', 'wp-parsely' ),
		icon: pencil,
	},
};

export type PersonaProp = keyof typeof PARSELY_PERSONAS | string;
type FixedPersonaProp = keyof typeof PARSELY_PERSONAS;

const PERSONAS_LIST = Object.keys( PARSELY_PERSONAS ) as PersonaProp[];

/**
 * Returns the value for a given persona.
 *
 * @since 3.13.0
 *
 * @param {PersonaProp} persona The persona to get the label for.
 *
 * @return {string} The value for the given persona.
 */
export const getLabel = ( persona: PersonaProp ): string => {
	if ( persona === 'custom' || persona === '' ) {
		return PARSELY_PERSONAS.custom.label;
	}

	if ( isCustomPersona( persona ) ) {
		return persona;
	}

	return PARSELY_PERSONAS[ persona as FixedPersonaProp ].label;
};

/**
 * Returns whether a given persona is a custom persona.
 *
 * @since 3.13.0
 *
 * @param {PersonaProp} persona
 *
 * @return {boolean} Whether the given persona is a custom persona.
 */
export const isCustomPersona = ( persona: PersonaProp ): boolean => {
	return ! PERSONAS_LIST.includes( persona ) || persona === 'custom';
};

/**
 * Properties for the CustomPersona component.
 *
 * @since 3.13.0
 */
type CustomPersonaProps = {
	value: string,
	onChange: ( persona: string ) => void
}

/**
 * CustomPersona component.
 *
 * Allows the user to enter a custom persona.
 *
 * @since 3.13.0
 *
 * @param {CustomPersonaProps} props The properties for the CustomPersona component.
 */
const CustomPersona = (
	{ value, onChange }: Readonly<CustomPersonaProps>
): React.JSX.Element => {
	const [ customPersona, setCustomPersona ] = useState<string>( '' );
	const debouncedOnChange = useDebounce( onChange, 500 );

	return (
		<div className="parsely-persona-selector-custom">
			<TextControl
				value={ customPersona || value }
				placeholder={ __( 'Enter a custom persona…', 'wp-parsely' ) }
				onChange={ ( newPersona ) => {
					// If the persona is empty, set it to an empty string, and avoid debouncing.
					if ( '' === newPersona ) {
						onChange( '' );
						setCustomPersona( '' );
						return;
					}
					if ( newPersona.length > MAX_CUSTOM_VALUE_LENGTH ) {
						newPersona = newPersona.slice( 0, MAX_CUSTOM_VALUE_LENGTH );
					}
					debouncedOnChange( newPersona );
					setCustomPersona( newPersona );
				} }
			/>
		</div>
	);
};

/**
 * Properties for the PersonaSelector component.
 *
 * @since 3.13.0
 */
type PersonaSelectorProps = {
	persona: PersonaProp;
	onChange: ( persona: PersonaProp ) => void;
	onDropdownChange?: ( persona: PersonaProp ) => void;
	disabled?: boolean;
	value?: string;
	label?: string;
	allowCustom?: boolean;
};

/**
 * Persona Selector dropdown menu.
 *
 * Allows the user to select the persona for their AI generated content.
 *
 * @since 3.13.0
 *
 * @param {PersonaSelectorProps} props The properties for the PersonaSelector component.
 */
export const PersonaSelector = ( {
	persona,
	value = __( 'Select a persona…', 'wp-parsely' ),
	label = __( 'Persona', 'wp-parsely' ),
	onChange,
	onDropdownChange,
	disabled = false,
	allowCustom = false,
}: Readonly<PersonaSelectorProps> ): React.JSX.Element => {
	const togglePropsId = `parsely-persona-selector-${ useInstanceId( PersonaSelector ) }`;

	return (
		<Disabled isDisabled={ disabled }>
			{ label && <label htmlFor={ togglePropsId } className="wp-parsely-editor-sidebar-label">
				{ label }
			</label> }
			<DropdownMenu
				label={ __( 'Persona', 'wp-parsely' ) }
				className={ 'parsely-persona-selector-dropdown' + ( disabled ? ' is-disabled' : '' ) }
				popoverProps={ {
					className: 'wp-parsely-popover',
				} }
				toggleProps={ {
					id: togglePropsId,
					children: (
						<>
							<div className="parsely-persona-selector-label">
								{ isCustomPersona( persona ) ? PARSELY_PERSONAS.custom.label : value }
							</div>
							<MoreArrow />
						</>
					),
				} }
			>
				{ ( { onClose } ) => (
					<MenuGroup label={ __( 'Persona', 'wp-parsely' ) }>
						<>
							{ PERSONAS_LIST.map( ( singlePersona ) => {
								if ( ! allowCustom && singlePersona === 'custom' ) {
									return null;
								}

								const personaData = PARSELY_PERSONAS[ singlePersona as FixedPersonaProp ];
								const isSelected = singlePersona === persona || ( isCustomPersona( persona ) && singlePersona === 'custom' );
								return (
									<MenuItem
										key={ singlePersona }
										isSelected={ isSelected }
										className={ isSelected ? 'is-selected' : '' }
										role="menuitemradio"
										onClick={ () => {
											onDropdownChange?.( singlePersona as FixedPersonaProp );
											onChange( singlePersona );
											onClose();
											// Focus the input when the custom persona is selected.
											if ( singlePersona === 'custom' ) {
												// Wait for the input to be rendered.
												setTimeout( () => {
													const inputElement = document.querySelector( `.parsely-persona-selector-custom input` ) as HTMLInputElement;
													if ( inputElement ) {
														inputElement.focus();
													}
												}, 0 );
											}
										} }
									>
										{ personaData.icon && <Icon icon={ personaData.icon } /> }
										{ personaData.label }
									</MenuItem>
								);
							} ) }
						</>
					</MenuGroup>
				) }
			</DropdownMenu>
			{
				allowCustom && isCustomPersona( persona ) && (
					<CustomPersona
						onChange={ ( currentPersona ) => {
							if ( '' === currentPersona ) {
								onChange( 'custom' );
								return;
							}

							onChange( currentPersona );
						}	}
						value={ persona === 'custom' ? '' : persona }
					/>
				)
			}
		</Disabled>
	);
};
