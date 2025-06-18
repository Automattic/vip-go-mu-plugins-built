/**
 * WordPress dependencies
 */
import { __experimentalHeading as Heading } from '@wordpress/components';
import { HeadingProps } from '@wordpress/components/build-types/heading/types';

/**
 * The DashboardHeading component.
 *
 * @since 3.19.0
 */
export type DashboardHeadingProps = {
	children: React.ReactNode;
	props?: HeadingProps
};

/**
 * The DashboardHeading component.
 *
 * Can be used to render a heading in the dashboard. and it is a
 * wrapper around the Heading component from the WordPress components package.
 *
 * @since 3.19.0
 *
 * @param {DashboardHeadingProps} props The component's props.
 */
export const DashboardHeading = ( { children, ...props }: DashboardHeadingProps ) => {
	return (
		<Heading
			className="parsely-dashboard-header"
			{ ...props }>
			{ children }
		</Heading>
	);
};
