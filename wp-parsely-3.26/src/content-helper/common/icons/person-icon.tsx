/**
 * WordPress dependencies
 */
import { G, Path, SVG } from '@wordpress/components';

/**
 * Person Icon.
 *
 * @since 3.13.0
 */
export const PersonIcon = () => (
	<SVG
		aria-hidden="true"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<G transform="matrix(1, 0, 0, 1, 1.7763568394002505e-15, 0)" />
		<Path
			d="M 16.693 6.167 A 4.541 4.541 0 0 1 12.152 10.708 A 4.541 4.541 0 0 1 7.611 6.167 A 4.541 4.541 0 0 1 12.152 1.626 A 4.541 4.541 0 0 1 16.693 6.167 Z"
			style={ {
				fill: 'rgba(216, 216, 216, 0)',
				fillOpacity: 0,
				strokeWidth: '2.5px',
				stroke: 'rgb(0, 0, 0)',
			} }
		/>
		<Path
			d="M 3.016 23.76 L 3.0135 22.4385 C 3.0109999999999997 21.117 3.0060000000000002 18.474 3.3204999999999996 16.911 C 3.635 15.347999999999999 4.268999999999999 14.865 7.068666666666666 14.6235 C 9.868333333333332 14.382 14.833666666666666 14.382 17.585833333333333 14.658 C 20.337999999999997 14.934 20.877 15.485999999999999 21.1465 17.0435 C 21.416 18.601 21.416 21.164 21.416 22.4455 L 21.416 23.727"
			style={ {
				fillOpacity: 0,
				fill: 'rgb(255, 255, 255)',
				strokeWidth: '2.5px',
				stroke: 'rgb(0, 0, 0)',
			} }
		/>
	</SVG>
);
