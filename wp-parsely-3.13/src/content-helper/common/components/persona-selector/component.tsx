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
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, chevronRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { PersonIcon } from '../../icons/person-icon';

/**
 * List of the available personas.
 * Each persona has a label and an emoji.
 *
 * @since 3.13.0
 */
export const PARSELY_PERSONAS = {
	journalist: {
		label: __( 'Journalist', 'wp-parsely' ),
		emoji: '📰',
	},
	editorialWriter: {
		label: __( 'Editorial Writer', 'wp-parsely' ),
		emoji: '✍️',
	},
	investigativeReporter: {
		label: __( 'Investigative Reporter', 'wp-parsely' ),
		emoji: '🕵️',
	},
	techAnalyst: {
		label: __( 'Tech Analyst', 'wp-parsely' ),
		emoji: '💻',
	},
	businessAnalyst: {
		label: __( 'Business Analyst', 'wp-parsely' ),
		emoji: '📈',
	},
	culturalCommentator: {
		label: __( 'Cultural Commentator', 'wp-parsely' ),
		emoji: '🌍',
	},
	scienceCorrespondent: {
		label: __( 'Science Correspondent', 'wp-parsely' ),
		emoji: '🔬',
	},
	politicalAnalyst: {
		label: __( 'Political Analyst', 'wp-parsely' ),
		emoji: '🏛️',
	},
	healthWellnessAdvocate: {
		label: __( 'Health and Wellness Advocate', 'wp-parsely' ),
		emoji: '🍏',
	},
	environmentalJournalist: {
		label: __( 'Environmental Journalist', 'wp-parsely' ),
		emoji: '🌳',
	},
	custom: {
		label: __( 'Use a custom persona', 'wp-parsely' ),
		emoji: '🔧',
	},
};

export type PersonaProp = keyof typeof PARSELY_PERSONAS | string;
type FixedPersonaProp = keyof typeof PARSELY_PERSONAS;

const PERSONAS_LIST = Object.keys( PARSELY_PERSONAS ) as PersonaProp[];

/**
 * Returns the label for a given persona.
 *
 * @since 3.13.0
 *
 * @param {PersonaProp} persona The persona to get the label for.
 *
 * @return {string} The label for the given persona.
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
): JSX.Element => {
	const [ customPersona, setCustomPersona ] = useState<string>( '' );
	return (
		<div className="parsely-persona-selector-custom">
			<TextControl
				value={ customPersona || value }
				onChange={ ( newPersona ) => {
					onChange( newPersona );
					setCustomPersona( newPersona );
				} }
				help={ __( 'Enter a custom persona', 'wp-parsely' ) }
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
	label = __( 'Select a persona', 'wp-parsely' ),
	onChange,
	onDropdownChange,
	disabled = false,
	allowCustom = false,
}: Readonly<PersonaSelectorProps> ): JSX.Element => {
	return (
		<Disabled isDisabled={ disabled }>
			<DropdownMenu
				label={ __( 'Persona', 'wp-parsely' ) }
				icon={ PersonIcon }
				className={ 'parsely-persona-selector-dropdown' + ( disabled ? ' is-disabled' : '' ) }
				popoverProps={ {
					className: 'wp-parsely-popover',
				} }
				toggleProps={ {
					children: (
						<>
							<div className="parsely-persona-selector-label">
								{ label }
							</div>
							<Icon icon={ chevronRight } />
						</>
					),
				} }
			>
				{ ( { onClose } ) => (
					<MenuGroup label={ __( 'Select a persona', 'wp-parsely' ) }>
						<>
							{ PERSONAS_LIST.map( ( singlePersona ) => {
								if ( ! allowCustom && singlePersona === 'custom' ) {
									return null;
								}

								const personaData = PARSELY_PERSONAS[ singlePersona as FixedPersonaProp ];
								return (
									<MenuItem
										key={ singlePersona }
										isSelected={ singlePersona === persona }
										className={ singlePersona === persona ? 'is-selected' : '' }
										role="menuitemradio"
										onClick={ () => {
											onDropdownChange?.( singlePersona as FixedPersonaProp );
											onChange( singlePersona );
											onClose();
										} }
									>
										{ personaData.emoji } { personaData.label }
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
