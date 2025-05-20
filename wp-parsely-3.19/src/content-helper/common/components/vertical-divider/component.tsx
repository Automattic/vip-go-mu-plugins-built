/**
 * WordPress dependencies
 */
import { Rect, SVG } from '@wordpress/components';

/**
 * Props structure for VerticalDivider.
 *
 * @since 3.19.0
 */
interface VerticalDividerProps {
	size?: number;
}

/**
 * Returns a vertical divider component.
 *
 * @since 3.14.0
 * @since 3.16.0 Moved from `RelatedPostItem` and `TitleSuggestion`.
 * @since 3.19.0 Added size prop.
 *
 * @param {VerticalDividerProps} props The component's props.
 *
 * @return {import('react').JSX.Element} The vertical divider component.
 */
export const VerticalDivider = ( { size = 40 }: VerticalDividerProps ): JSX.Element => {
	return (
		<SVG xmlns="http://www.w3.org/2000/svg" width="1" height={ size } viewBox={ `0 0 1 ${ size }` } fill="none">
			<Rect width="1" height={ size } fill="#cccccc" />
		</SVG>
	);
};
