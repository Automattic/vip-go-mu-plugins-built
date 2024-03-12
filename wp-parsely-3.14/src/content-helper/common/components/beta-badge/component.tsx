import { __ } from '@wordpress/i18n';
import '../../css/common.scss';

/**
 * Properties for the BetaBadge component.
 */
type BetaBadgeProps = {
	/**
	 * The text to display in the badge. If not provided, defaults to 'Beta'.
	 */
	text?: string;

	/**
	 * The color of the badge. If not provided, defaults to 'var(--parsely-green)'.
	 */
	color?: string;

	/**
	 * The size of the badge text. If not provided, defaults to '0.75rem'.
	 */
	fontSize?: string;
};

/**
 * The BetaBadge component displays a badge with the specified text, color, and size.
 *
 * @since 3.13.0
 *
 * @param {BetaBadgeProps} props - The properties for the BetaBadge component.
 *
 * @return {JSX.Element} The BetaBadge component.
 */
export const BetaBadge = ( {
	text = __( 'Beta', 'wp-parsely' ),
	color = 'var(--parsely-green)',
	fontSize = '0.75rem',
}: Readonly<BetaBadgeProps> ): JSX.Element => {
	const badgeStyle = {
		backgroundColor: color,
		fontSize,
	};

	return (
		<div className="wp-parsely-beta-badge" style={ badgeStyle }>
			{ text }
		</div>
	);
};
