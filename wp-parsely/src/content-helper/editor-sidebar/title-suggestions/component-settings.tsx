/**
 * WordPress dependencies
 */
import { BaseControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../../js/telemetry/telemetry';
import { PersonaProp, PersonaSelector, getPersonaLabel } from '../../common/components/persona-selector';
import { ToneProp, ToneSelector, getToneLabel } from '../../common/components/tone-selector';
import { LeafIcon } from '../../common/icons/leaf-icon';
import { SidebarSettings } from '../editor-sidebar';

/**
 * Props for the Title Suggestions Settings component.
 *
 * @since 3.13.0
 */
type TitleSuggestionsSettingsProps = {
	isLoading?: boolean,
	isOpen: boolean,
	onPersonaChange: ( persona: PersonaProp | string ) => void,
	onSettingChange: ( key: keyof SidebarSettings, value: string|boolean ) => void,
	onToneChange: ( tone: ToneProp | string ) => void,
	persona: PersonaProp,
	tone: ToneProp,
};

/**
 * Component that renders the settings for the Title Suggestions.
 *
 * @since 3.13.0
 *
 * @param {TitleSuggestionsSettingsProps} props The component props.
 */
export const TitleSuggestionsSettings = ( {
	isLoading,
	isOpen,
	onPersonaChange,
	onSettingChange,
	onToneChange,
	persona,
	tone,
}: Readonly<TitleSuggestionsSettingsProps> ): JSX.Element => {
	const [ isSettingActive, setIsSettingActive ] = useState<boolean>( isOpen );

	const toggleSetting = () => {
		onSettingChange( 'TitleSuggestionsSettingsOpen', ! isSettingActive );
		setIsSettingActive( ! isSettingActive );
		Telemetry.trackEvent( 'title_suggestions_ai_settings_toggled', {
			is_active: ! isSettingActive,
		} );
	};

	return (
		<div className="parsely-write-titles-settings">
			<div className="parsely-write-titles-settings-header">
				<LeafIcon size={ 20 } />
				<BaseControl
					id="parsely-write-titles-settings"
					className="parsely-write-titles-settings-header-label"
					label={ __( 'Parse.ly AI Settings', 'wp-parsely' ) }>
					<Button
						label={ __( 'Change Tone & Persona', 'wp-parsely' ) }
						icon={ settings }
						onClick={ toggleSetting }
						isPressed={ isSettingActive }
						size="small"
					/>
				</BaseControl>
			</div>
			{ isSettingActive && (
				<div className="parsely-write-titles-settings-body">
					<ToneSelector
						tone={ tone }
						label={ getToneLabel( tone ) }
						onChange={ ( selectedTone ) => {
							onToneChange( selectedTone );
						} }
						onDropdownChange={ ( selectedTone ) => {
							Telemetry.trackEvent( 'title_suggestions_ai_tone_changed',
								{ tone: selectedTone }
							);
						} }
						disabled={ isLoading }
						allowCustom
					/>
					<PersonaSelector
						persona={ persona }
						label={ getPersonaLabel( persona ) }
						onChange={ ( selectedPersona ) => {
							onPersonaChange( selectedPersona );
						} }
						onDropdownChange={ ( selectedPersona ) => {
							Telemetry.trackEvent( 'title_suggestions_ai_persona_changed',
								{ persona: selectedPersona }
							);
						} }
						disabled={ isLoading }
						allowCustom
					/>
				</div>
			) }
		</div>
	);
};
