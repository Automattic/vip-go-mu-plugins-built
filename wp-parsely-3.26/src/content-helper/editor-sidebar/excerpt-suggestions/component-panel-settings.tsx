/**
 * WordPress dependencies
 */
import {
	RangeControl,
	SelectControl,
	TextControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../../js/telemetry/telemetry';
import {
	PARSELY_PERSONAS,
	PersonaProp,
} from '../../common/components/persona-selector';
import {
	PARSELY_TONES,
	ToneProp,
} from '../../common/components/tone-selector';
import {
	CUSTOM_VALUE,
	MAX_CUSTOM_VALUE_LENGTH,
} from '../../common/utils/constants';
import {
	MAX_EXCERPT_LENGTH,
	MIN_EXCERPT_LENGTH,
	SETTINGS_SAVE_DELAY,
} from './constants';

/**
 * An option of a tone or persona SelectControl.
 *
 * @since 3.24.0
 */
type SelectOption = {
	label: string,
	value: string,
};

/**
 * Converts a tone or persona metadata map into SelectControl options.
 *
 * @since 3.24.0
 *
 * @param {Record<string, {label: string}>} map The metadata map to convert.
 *
 * @return {SelectOption[]} The resulting options.
 */
const toOptions = (
	map: Record<string, { label: string }>
): SelectOption[] =>
	Object.entries( map ).map( ( [ value, { label } ] ) => ( { label, value } ) );

/**
 * The tone and persona options, computed once as their maps never change.
 *
 * @since 3.24.0
 */
const TONE_OPTIONS = toOptions( PARSELY_TONES );
const PERSONA_OPTIONS = toOptions( PARSELY_PERSONAS );

/**
 * Returns whether the given value is a custom (free-text) entry rather than
 * one of the predefined options.
 *
 * @since 3.24.0
 *
 * @param {string}         value   The current value.
 * @param {SelectOption[]} options The predefined options.
 *
 * @return {boolean} Whether the value is a custom entry.
 */
const isCustomValue = ( value: string, options: SelectOption[] ): boolean =>
	CUSTOM_VALUE === value ||
	! options.some( ( option ) => option.value === value );

/**
 * Holds a setting's value locally and persists changes after a delay.
 *
 * Every settings change triggers a REST request, so continuous controls (the
 * length slider, the custom tone/persona fields) must not persist on each
 * interaction. The pending value is flushed on unmount, which happens
 * whenever the settings popover closes.
 *
 * @since 3.24.0
 *
 * @param {string|number} value    The persisted value.
 * @param {Function}      onChange Callback that persists a value.
 *
 * @return {Array} The local value, and a setter taking an optional
 *                 `immediate` flag that persists without waiting.
 */
const useDebouncedSetting = <T extends string | number>(
	value: T,
	onChange: ( newValue: T ) => void
): [ T, ( newValue: T, immediate?: boolean ) => void ] => {
	const [ draft, setDraft ] = useState<T>( value );
	const draftRef = useRef<T>( draft );
	const onChangeRef = useRef( onChange );
	const savedRef = useRef<T>( value );

	// Sync after commit rather than during render, so a discarded render
	// cannot leave the refs pointing at values that were never committed.
	useEffect( () => {
		draftRef.current = draft;
		onChangeRef.current = onChange;
	} );

	const save = useCallback( ( newValue: T ) => {
		savedRef.current = newValue;
		onChangeRef.current( newValue );
	}, [] );
	const debouncedSave = useDebounce( save, SETTINGS_SAVE_DELAY );

	// `useDebounce` cancels pending calls on unmount, so flush them here.
	useEffect( () => () => {
		if ( draftRef.current !== savedRef.current ) {
			save( draftRef.current );
		}
	}, [ save ] );

	return [ draft, ( newValue: T, immediate: boolean = false ) => {
		setDraft( newValue );

		if ( immediate ) {
			debouncedSave.cancel();
			save( newValue );
			return;
		}

		debouncedSave( newValue );
	} ];
};

/**
 * Props for the CustomizableSelect component.
 *
 * @since 3.24.0
 */
type CustomizableSelectProps = {
	customLabel: string,
	disabled?: boolean,
	label: string,
	onChange: ( value: string ) => void,
	onSelect: ( value: string ) => void,
	options: SelectOption[],
	value: string,
};

/**
 * A SelectControl that reveals a free-text field when its custom option is
 * selected.
 *
 * The selected option and the custom text are held in local state, so that
 * typing a value matching a predefined key (such as `formal`) neither collapses
 * the text field nor loses keyboard focus. That only holds while the popover
 * stays open, as reopening it re-derives the selection from the stored value.
 * Changes to the custom text are debounced, as each one costs a REST request.
 *
 * @since 3.24.0
 *
 * @param {CustomizableSelectProps} props The component's props.
 */
const CustomizableSelect = ( {
	customLabel,
	disabled,
	label,
	onChange,
	onSelect,
	options,
	value,
}: Readonly<CustomizableSelectProps> ): React.JSX.Element => {
	const startsCustom = isCustomValue( value, options );

	const [ , setValue ] = useDebouncedSetting( value, onChange );
	const [ selected, setSelected ] = useState<string>(
		startsCustom ? CUSTOM_VALUE : value
	);
	const [ customText, setCustomText ] = useState<string>(
		startsCustom && CUSTOM_VALUE !== value ? value : ''
	);

	return (
		<VStack spacing={ 2 }>
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ label }
				value={ selected }
				options={ options }
				onChange={ ( selectedValue ) => {
					setSelected( selectedValue );
					setValue(
						CUSTOM_VALUE === selectedValue
							? customText || CUSTOM_VALUE
							: selectedValue,
						true
					);
					onSelect( selectedValue );
				} }
				disabled={ disabled }
			/>
			{ CUSTOM_VALUE === selected && (
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ customLabel }
					maxLength={ MAX_CUSTOM_VALUE_LENGTH }
					value={ customText }
					onChange={ ( text ) => {
						setCustomText( text );
						setValue( '' === text ? CUSTOM_VALUE : text );
					} }
					disabled={ disabled }
				/>
			) }
		</VStack>
	);
};

/**
 * Props for the Excerpt Suggestions Settings component.
 *
 * @since 3.17.0
 */
type ExcerptSuggestionsSettingsProps = {
	isLoading?: boolean,
	length: number,
	onLengthChange: ( length: number ) => void,
	onPersonaChange: ( persona: PersonaProp | string ) => void,
	onToneChange: ( tone: ToneProp | string ) => void,
	persona: PersonaProp,
	tone: ToneProp,
};

/**
 * Component that renders the settings for Excerpt Suggestions.
 *
 * The settings are rendered inside the settings popover, using core controls.
 *
 * @since 3.17.0
 * @since 3.24.0 Converted into settings popover content using core controls.
 *
 * @param {ExcerptSuggestionsSettingsProps} props The component's props.
 */
export const ExcerptSuggestionsSettings = ( {
	isLoading,
	length,
	onLengthChange,
	onPersonaChange,
	onToneChange,
	persona,
	tone,
}: Readonly<ExcerptSuggestionsSettingsProps> ): React.JSX.Element => {
	// The slider must stay responsive while its persisted value is debounced.
	const [ lengthDraft, setLengthDraft ] = useDebouncedSetting(
		length, onLengthChange
	);

	return (
		<VStack spacing={ 4 }>
			<RangeControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				value={ lengthDraft }
				onChange={ ( value ) => {
					if ( undefined === value ) {
						return;
					}

					setLengthDraft( value );
				} }
				label={ __( 'Desired length (characters)', 'wp-parsely' ) }
				min={ MIN_EXCERPT_LENGTH }
				max={ MAX_EXCERPT_LENGTH }
				disabled={ isLoading }
			/>

			<CustomizableSelect
				label={ __( 'Tone', 'wp-parsely' ) }
				customLabel={ __( 'Custom tone', 'wp-parsely' ) }
				value={ tone }
				options={ TONE_OPTIONS }
				onChange={ onToneChange }
				onSelect={ ( selectedTone ) => {
					Telemetry.trackEvent( 'excerpt_generator_ai_tone_changed',
						{ selectedTone }
					);
				} }
				disabled={ isLoading }
			/>

			<CustomizableSelect
				label={ __( 'Persona', 'wp-parsely' ) }
				customLabel={ __( 'Custom persona', 'wp-parsely' ) }
				value={ persona }
				options={ PERSONA_OPTIONS }
				onChange={ onPersonaChange }
				onSelect={ ( selectedPersona ) => {
					Telemetry.trackEvent( 'excerpt_generator_ai_persona_changed',
						{ persona: selectedPersona }
					);
				} }
				disabled={ isLoading }
			/>
		</VStack>
	);
};
