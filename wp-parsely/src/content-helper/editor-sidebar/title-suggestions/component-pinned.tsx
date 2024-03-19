/**
 * WordPress dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { pinSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../../js/telemetry/telemetry';
import { TitleSuggestion } from './component-title-suggestion';
import { Title, TitleType } from './store';

/**
 * Props for the Pinned Title Suggestions component.
 *
 * @since 3.14.0
 */
type PinnedTitleSuggestionsProps = {
	pinnedTitles: Title[];
	isOpen: boolean;
};

/**
 * Renders the Pinned Title Suggestions panel.
 *
 * @since 3.14.0
 *
 * @param {PinnedTitleSuggestionsProps} props The component's props.
 */
export const PinnedTitleSuggestions = ( {
	pinnedTitles,
	isOpen,
}: Readonly<PinnedTitleSuggestionsProps> ): JSX.Element => {
	const [ isCollapsed, setIsCollapsed ] = useState<boolean>( isOpen );

	/**
	 * Toggles the collapse state of the panel.
	 *
	 * @since 3.14.0
	 */
	const toggleCollapse = () => {
		setIsCollapsed( ! isCollapsed );
		Telemetry.trackEvent( 'title_suggestions_pinned_toggled', {
			is_open: ! isCollapsed,
			pinned_titles: pinnedTitles.length,
		} );
	};

	return (
		<Panel className="wp-parsely-pinned-suggestions">
			<PanelBody
				className="wp-parsely-collapsible-panel"
				icon={ pinSmall }
				title={ __( 'Pinned', 'wp-parsely' ) }
				onToggle={ toggleCollapse }
				opened={ isCollapsed }>
				<div className="title-suggestions-container">
					{ pinnedTitles.map( ( title ) => (
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
