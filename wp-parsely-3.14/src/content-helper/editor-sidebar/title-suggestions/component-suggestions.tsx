/**
 * WordPress dependencies
 */
import { Panel, PanelBody, Spinner } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../../js/telemetry/telemetry';
import { AiIcon } from '../../common/icons/ai-icon';
import { TitleSuggestion } from './component-title-suggestion';
import { Title, TitleType } from './store';

/**
 * Props for the Title Suggestions component.
 *
 * @since 3.14.0
 */
type TitleSuggestionsProps = {
	suggestions: Title[];
	isOpen: boolean;
	isLoading?: boolean;
};

/**
 * Renders the Title Suggestions collapsible panel.
 *
 * @since 3.14.0
 *
 * @param {TitleSuggestionsProps} props The component's props.
 */
export const TitleSuggestions = ( {
	suggestions,
	isOpen,
	isLoading = false,
}: Readonly<TitleSuggestionsProps> ): JSX.Element => {
	const [ isCollapsed, setIsCollapsed ] = useState<boolean>( isOpen );

	/**
	 * Toggles the collapse state of the panel.
	 *
	 * @since 3.14.0
	 */
	const toggleCollapse = () => {
		setIsCollapsed( ! isCollapsed );
		Telemetry.trackEvent( 'title_suggestions_toggle', {
			isOpen: ! isCollapsed,

		} );
	};

	return (
		<Panel className="wp-parsely-title-suggestions">
			<PanelBody
				className="wp-parsely-collapsible-panel"
				title={ __( 'Suggestions', 'wp-parsely' ) }
				icon={ <AiIcon className="components-panel__icon" /> }
				onToggle={ toggleCollapse }
				opened={ isCollapsed }>
				<div className="title-suggestions-container">
					{ isLoading && (
						<div className={ 'wp-parsely-loading-overlay' }>
							<Spinner />
							{ __( 'Loading…', 'wp-parsely' ) }
						</div>
					) }
					{ suggestions.map( ( title ) => (
						<TitleSuggestion
							key={ title.title }
							title={ title }
							type={ TitleType.PostTitle }
						/>
					) ) }
				</div>
			</PanelBody>
		</Panel>
	);
};
