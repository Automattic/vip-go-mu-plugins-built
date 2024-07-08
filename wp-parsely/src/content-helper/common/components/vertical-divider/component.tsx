/**
 * WordPress dependencies
 */
import { Rect, SVG } from '@wordpress/components';

/**
 * Returns a vertical divider component.
 *
 * @since 3.14.0
 * @since 3.16.0 Moved from `RelatedPostItem` and `TitleSuggestion`.
 *
 * @return {import('react').JSX.Element} The vertical divider component.
 */
export const VerticalDivider = (): JSX.Element => {
	return (
		<SVG xmlns="http://www.w3.org/2000/svg" width="1" height="40" viewBox="0 0 1 40" fill="none">
			<Rect width="1" height="40" fill="#cccccc" />
		</SVG>
	);
};
