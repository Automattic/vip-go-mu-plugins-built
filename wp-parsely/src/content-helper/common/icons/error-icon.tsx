/**
 * WordPress dependencies
 */
import { Path, SVG } from '@wordpress/primitives';

/**
 * Error icon component.
 *
 * @since 3.19.0
 */
export const ErrorIcon = (): JSX.Element => (
	<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="48" height="48" aria-hidden="true" focusable="false">
		<Path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12.218 5.377a.25.25 0 0 0-.436 0l-7.29 12.96a.25.25 0 0 0 .218.373h14.58a.25.25 0 0 0 .218-.372l-7.29-12.96Zm-1.743-.735c.669-1.19 2.381-1.19 3.05 0l7.29 12.96a1.75 1.75 0 0 1-1.525 2.608H4.71a1.75 1.75 0 0 1-1.525-2.608l7.29-12.96ZM12.75 17.46h-1.5v-1.5h1.5v1.5Zm-1.5-3h1.5v-5h-1.5v5Z"
		/>
	</SVG>
);
