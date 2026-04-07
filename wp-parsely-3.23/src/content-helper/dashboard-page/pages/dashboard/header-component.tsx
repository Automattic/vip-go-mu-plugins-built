/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { Icon, link } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { PageHeader } from '../../components';

/**
 * Header summary component.
 *
 * Renders a summary of the site performance.
 *
 * @since 3.19.0
 */
const HeaderSummary = (): React.JSX.Element => {
	return (
		<div className="dashboard-header-summary">
			<div className="summary-info">
				<div className="summary-title">Today is an exceptional day.</div>
				<div className="summary-text">75% more traffic than last week</div>
				<div className="summary-text">Yesterday was the 33rd best Tuesday, 214th overall.</div>
			</div>
			<div className="summary-button">
				<Button variant="secondary">View more in Parse.ly</Button>
			</div>
		</div>
	);
};

/**
 * Type definition for the HeaderCard component.
 *
 * @since 3.19.0
 */
type HeaderCardProps = {
	title?: string;
	icon?: React.JSX.Element;
	value?: string;
	change?: string;
	down?: boolean;
	className?: string;
};

/**
 * Single stat card component.
 *
 * @since 3.19.0
 *
 * @param {HeaderCardProps} props The component's props.
 */
const StatCard = (
	{ title, value, change, down = false, icon, className }: Readonly<HeaderCardProps>
): React.JSX.Element => {
	const changeIcon = down ? '↓' : '↑';

	return (
		<div className={ 'header-stat-card' + ( className ? ' ' + className : '' ) }>
			{ title &&
				<div className="card-title">
					{ icon && <Icon size={ 16 } icon={ icon } /> }
					{ title }
				</div>
			}
			{ value &&
				<div className="card-value">
					{ value }
					{ change && <div className={ `card-change ${ down ? 'down' : '' }` }>{ changeIcon }{ change }</div> }
				</div>
			}
		</div>
	);
};

/**
 * Dashboard header component.
 *
 * Renders the header of the main dashboard page.
 *
 * @since 3.19.0
 */
export const DashboardHeader = (): React.JSX.Element => {
	return (
		<div className="dashboard-header-background">
			<PageHeader className="dashboard-header">
				<HeaderSummary />
				<div className="dashboard-header-stats">
					<div className="stats-top">
						<StatCard className="stat-intro" title="Parse.ly Working For You" />
						<StatCard title="Engagement Boost" value="14%" icon={ link } />
						<StatCard title="Smart Link Clicks" value="784" icon={ link } />
					</div>
					{ [
						{ title: 'Page Views', value: '4.6K', change: '24%' },
						{ title: 'Visitors', value: '1.5K', change: '25%' },
						{ title: 'Minutes', value: '32', change: '40%' },
						{ title: 'Avg. Time', value: '32', change: '40%', down: true },
						{ title: 'Soc. Interactions', value: '32', change: '40%' },
						{ title: 'New Posts', value: '2', change: '40%' },
					].map( ( metric, index ) => (
						<StatCard key={ index } { ...metric } />
					) ) }
				</div>
			</PageHeader>
		</div>
	);
};
