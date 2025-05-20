/**
 * Internal dependencies
 */
import { Telemetry } from '../../../js/telemetry/telemetry';
import {
	getPersonaLabel,
	PersonaProp,
	PersonaSelector,
} from '../../common/components/persona-selector';
import {
	getToneLabel,
	ToneProp,
	ToneSelector,
} from '../../common/components/tone-selector';
import {
	ExcerptSuggestionsSettings as Settings,
} from '../../common/settings';

/**
 * Props for the Excerpt Suggestions Settings component.
 *
 * @since 3.17.0
 */
type ExcerptSuggestionsSettingsProps = {
	isLoading?: boolean,
	onPersonaChange: ( persona: PersonaProp | string ) => void,
	onSettingChange: (
		key: keyof Settings,
		value: string|boolean
	) => void,
	onToneChange: ( tone: ToneProp | string ) => void,
	persona: PersonaProp,
	tone: ToneProp,
};

/**
 * Component that renders the settings for Excerpt Suggestions.
 *
 * @since 3.17.0
 *
 * @param {ExcerptSuggestionsSettingsProps} props The component's props.
 */
export const ExcerptSuggestionsSettings = ( {
	isLoading,
	onPersonaChange,
	onToneChange,
	persona,
	tone,
}: Readonly<ExcerptSuggestionsSettingsProps> ): React.JSX.Element => {
	return (
		<div className="excerpt-suggestions-settings">
			<ToneSelector
				tone={ tone }
				value={ getToneLabel( tone ) }
				onChange={ ( selectedTone ) => {
					onToneChange( selectedTone );
				} }
				onDropdownChange={ ( selectedTone ) => {
					Telemetry.trackEvent( 'excerpt_generator_ai_tone_changed',
						{ selectedTone }
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
					Telemetry.trackEvent( 'excerpt_generator_ai_persona_changed',
						{ persona: selectedPersona }
					);
				} }
				disabled={ isLoading }
				allowCustom
			/>
		</div>
	);
};
