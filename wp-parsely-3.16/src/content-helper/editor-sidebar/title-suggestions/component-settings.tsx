/**
 * Internal dependencies
 */
import { Telemetry } from '../../../js/telemetry/telemetry';
import { getPersonaLabel, PersonaProp, PersonaSelector } from '../../common/components/persona-selector';
import { getToneLabel, ToneProp, ToneSelector } from '../../common/components/tone-selector';
import { SidebarSettings } from '../../common/settings';

/**
 * Props for the Title Suggestions Settings component.
 *
 * @since 3.13.0
 * @since 3.14.0 Removed isOpen prop.
 */
type TitleSuggestionsSettingsProps = {
	isLoading?: boolean,
	onPersonaChange: ( persona: PersonaProp | string ) => void,
	onSettingChange: (
		key: keyof SidebarSettings[ 'TitleSuggestions'],
		value: string|boolean
	) => void,
	onToneChange: ( tone: ToneProp | string ) => void,
	persona: PersonaProp,
	tone: ToneProp,
};

/**
 * Component that renders the settings for the Title Suggestions.
 *
 * @since 3.13.0
 * @since 3.14.0 Removed isOpen prop as the component is no longer collapsible.
 *
 * @param {TitleSuggestionsSettingsProps} props The component props.
 */
export const TitleSuggestionsSettings = ( {
	isLoading,
	onPersonaChange,
	onToneChange,
	persona,
	tone,
}: Readonly<TitleSuggestionsSettingsProps> ): React.JSX.Element => {
	return (
		<div className="title-suggestions-settings">
			<ToneSelector
				tone={ tone }
				value={ getToneLabel( tone ) }
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
				value={ getPersonaLabel( persona ) }
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
	);
};
