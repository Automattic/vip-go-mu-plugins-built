/**
 * Internal dependencies
 */
import {
	Panel,
} from '@wordpress/components';
import { Period } from '../../common/utils/constants';
import { VerifyCredentials } from '../../common/verify-credentials';
import { PerformanceStats } from '../performance-stats/component';

/**
 * SidebarPerformanceTab component props.
 *
 * @since 3.14.0
 */
type SidebarPerformanceTabProps = {
	period: Period;
}

/**
 * SidebarPerformanceTab component.
 * Renders the Performance tab in the Content Helper Sidebar.
 *
 * @since 3.14.0
 *
 * @param {SidebarPerformanceTabProps} props The component's props.
 *
 * @return {import('react').JSX.Element} The SidebarPerformanceTab JSX Element.
 */
export const SidebarPerformanceTab = (
	{ period }: Readonly<SidebarPerformanceTabProps>
): React.JSX.Element => {
	return (
		<Panel>
			<VerifyCredentials>
				<PerformanceStats period={ period } />
			</VerifyCredentials>
		</Panel>
	);
};
