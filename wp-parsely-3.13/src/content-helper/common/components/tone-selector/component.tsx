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
import { Icon, chevronRight, megaphone } from '@wordpress/icons';

/**
 * List of the available tones.
 * Each tone has a label and an emoji.
 *
 * @since 3.13.0
 */
export const PARSELY_TONES = {
	neutral: {
		label: __( 'Neutral', 'wp-parsely' ),
		emoji: '😐',
	},
	formal: {
		label: __( 'Formal', 'wp-parsely' ),
		emoji: '🎩',
	},
	humorous: {
		label: __( 'Humorous', 'wp-parsely' ),
		emoji: '😂',
	},
	confident: {
		label: __( 'Confident', 'wp-parsely' ),
		emoji: '😎',
	},
	provocative: {
		label: __( 'Provocative', 'wp-parsely' ),
		emoji: '😈',
	},
	serious: {
		label: __( 'Serious', 'wp-parsely' ),
		emoji: '🧐',
	},
	inspirational: {
		label: __( 'Inspirational', 'wp-parsely' ),
		emoji: '✨',
	},
	skeptical: {
		label: __( 'Skeptical', 'wp-parsely' ),
		emoji: '🤨',
	},
	conversational: {
		label: __( 'Conversational', 'wp-parsely' ),
		emoji: '💬',
	},
	analytical: {
		label: __( 'Analytical', 'wp-parsely' ),
		emoji: '🤓',
	},
	custom: {
		label: __( 'Use a custom tone', 'wp-parsely' ),
		emoji: '🔧',
	},
};

export type ToneProp = keyof typeof PARSELY_TONES | string;
type FixedToneProp = keyof typeof PARSELY_TONES;

const TONE_LIST = Object.keys( PARSELY_TONES ) as ToneProp[];

/**
 * Returns the label for a given tone.
 *
 * @since 3.13.0
 *
 * @param {ToneProp} tone The tone to get the label for.
 *
 * @return {string} The label for the given tone.
 */
export const getLabel = ( tone: ToneProp ): string => {
	if ( tone === 'custom' || tone === '' ) {
		return PARSELY_TONES.custom.label;
	}

	if ( isCustomTone( tone ) ) {
		return tone;
	}

	return PARSELY_TONES[ tone as FixedToneProp ].label;
};

/**
 * Returns whether a given tone is a custom tone.
 *
 * @since 3.13.0
 *
 * @param {ToneProp} tone
 *
 * @return {boolean} Whether the given tone is a custom tone.
 */
export const isCustomTone = ( tone: ToneProp ): boolean => {
	return ! TONE_LIST.includes( tone ) || tone === 'custom';
};

/**
 * Properties for the CustomTone component.
 *
 * @since 3.13.0
 */
type CustomToneProps = {
	value: string,
	onChange: ( tone: string ) => void
}

/**
 * Custom Tone component.
 *
 * Allows the user to enter a custom tone.
 *
 * @since 3.13.0
 *
 * @param {CustomToneProps} props The properties for the CustomTone component.
 */
const CustomTone = (
	{ value, onChange }: Readonly<CustomToneProps>
): JSX.Element => {
	const [ customTone, setCustomTone ] = useState<string>( '' );
	return (
		<div className="parsely-tone-selector-custom">
			<TextControl
				value={ customTone || value }
				onChange={ ( newTone ) => {
					onChange( newTone );
					setCustomTone( newTone );
				} }
				help={ __( 'Enter a custom tone', 'wp-parsely' ) }
			/>
		</div>
	);
};

/**
 * Properties for the ToneSelector component.
 *
 * @since 3.13.0
 */
type ToneSelectorProps = {
	tone: ToneProp | string;
	onChange: ( tone: ToneProp | string ) => void;
	onDropdownChange?: ( tone: ToneProp ) => void;
	disabled?: boolean;
	label?: string;
	allowCustom?: boolean;
};

/**
 * Tone Selector dropdown menu.
 *
 * Allows the user to select a tone for their AI generated content.
 *
 * @since 3.13.0
 *
 * @param {ToneSelectorProps} props The properties for the ToneSelector component.
 */
export const ToneSelector = ( {
	tone,
	label = __( 'Select a tone', 'wp-parsely' ),
	onChange,
	onDropdownChange,
	disabled = false,
	allowCustom = false,
}: Readonly<ToneSelectorProps> ): JSX.Element => {
	return (
		<Disabled isDisabled={ disabled }>
			<DropdownMenu
				label={ __( 'Tone', 'wp-parsely' ) }
				icon={ megaphone }
				className={ 'parsely-tone-selector-dropdown' + ( disabled ? ' is-disabled' : '' ) }
				popoverProps={ {
					className: 'wp-parsely-popover',
				} }
				toggleProps={ {
					children: (
						<>
							<div className="parsely-tone-selector-label">
								{ label }
							</div>
							<Icon icon={ chevronRight } />
						</>
					),
				} }
			>
				{ ( { onClose } ) => (
					<MenuGroup label={ __( 'Select a tone', 'wp-parsely' ) }>
						<>
							{ TONE_LIST.map( ( singleTone ) => {
								if ( ! allowCustom && singleTone === 'custom' ) {
									return null;
								}

								const toneData = PARSELY_TONES[ singleTone as FixedToneProp ];

								return (
									<MenuItem
										key={ singleTone }
										isSelected={ singleTone === tone }
										className={ singleTone === tone ? 'is-selected' : '' }
										role="menuitemradio"
										onClick={ () => {
											onDropdownChange?.( singleTone as FixedToneProp );
											onChange( singleTone );
											onClose();
										} }
									>
										{ toneData.emoji } { toneData.label }
									</MenuItem>
								);
							} ) }
						</>
					</MenuGroup>
				) }
			</DropdownMenu>
			{
				allowCustom && isCustomTone( tone ) && (
					<CustomTone
						onChange={ ( currentTone ) => {
							if ( '' === currentTone ) {
								onChange( 'custom' );
								return;
							}

							onChange( currentTone );
						}	}
						value={ tone === 'custom' ? '' : tone }
					/>
				)
			}
		</Disabled>
	);
};
