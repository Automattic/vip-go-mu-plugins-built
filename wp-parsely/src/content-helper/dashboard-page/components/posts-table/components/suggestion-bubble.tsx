/**
 * External dependencies
 */
import { useNavigate } from 'react-router';

/**
 * WordPress dependencies
 */
import { Tooltip } from '@wordpress/components';
import { _n, sprintf } from '@wordpress/i18n';

/**
 * Type definition for the SuggestionBubble component.
 *
 * @since 3.19.0
 */
type SuggestionBubbleProps = {
	postId: number;
	numberOfSuggestions: number;
};

/**
 * SuggestionBubble component.
 *
 * Used to display the number of pending suggestions for a post.
 *
 * @since 3.19.0
 *
 * @param {SuggestionBubbleProps} props The props for the SuggestionBubble component.
 */
export const SuggestionBubble = ( { postId, numberOfSuggestions }: SuggestionBubbleProps ) => {
	const navigate = useNavigate();

	/**
	 * Handles the click event on the suggestion bubble.
	 *
	 * @since 3.19.0
	 */
	const handleClick = () => {
		navigate( `/engagement-boost/${ postId }` );
	};

	const pendingSuggestionsText = sprintf( /* translators: 1: Number of suggestions generated on this post */
		_n( '%d pending suggestion', '%d pending suggestions', numberOfSuggestions, 'wp-parsely' ),
		numberOfSuggestions
	);

	return (
		<Tooltip
			text={ pendingSuggestionsText }
			className="suggestion-bubble"
		>
			<button
				className="suggestion-bubble"
				onClick={ handleClick }
			>
				<span className="suggestion-bubble-number">{ numberOfSuggestions }</span>
			</button>
		</Tooltip>
	);
};
