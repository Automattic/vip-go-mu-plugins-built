/**
 * WordPress dependencies
 */
import { MenuGroup, MenuItem, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	Icon,
	check,
	moreHorizontal,
	people,
	reset,
	rotateLeft,
	seen,
} from '@wordpress/icons';
import { Telemetry } from '../../../js/telemetry/telemetry';

/**
 * Internal dependencies
 */
import { ClockIcon } from '../../common/icons/clock-icon';
import { SidebarSettings, useSettings } from '../../common/settings';
import { formatToImpreciseNumber } from '../../common/utils/number';
import { PerformanceStatPanel } from './component-panel';
import { PerformanceData } from './model';

/**
 * List of available data points to display in the Overview panel.
 *
 * @since 3.14.0
 */
const availableDataPoints = [
	{
		name: 'views',
		title: __( 'Page Views', 'wp-parsely' ),
		icon: seen,
	},
	{
		name: 'visitors',
		title: __( 'Visitors', 'wp-parsely' ),
		icon: people,
	},
	{
		name: 'avgEngaged',
		title: __( 'Avg. Engaged', 'wp-parsely' ),
		icon: <ClockIcon />,
	},
	{
		name: 'recirculation',
		title: __( 'Recirculation', 'wp-parsely' ),
		icon: rotateLeft,
		smallText: true,
	},
];

/**
 * Checks if a data point is visible in the sidebar settings.
 *
 * @since 3.14.0
 *
 * @param { SidebarSettings } settings The sidebar settings.
 * @param { string }          name     The name of the data point.
 *
 * @return { boolean } Whether the data point is visible.
 */
const isDataPointVisible = ( settings: SidebarSettings, name: string ): boolean => {
	return settings.PerformanceStats.VisibleDataPoints.includes( name );
};

/**
 * Props for the DataPoint component.
 *
 * @since 3.14.0
 */
type DataPointProps = {
	title: string;
	value: string;
	icon: JSX.Element;
	smallText?: boolean;
	isVisible?: boolean;
}

/**
 * A single data point to display in the Overview panel.
 *
 * @since 3.14.0
 *
 * @param { DataPointProps } props The component's props.
 *
 * @return { JSX.Element | null } The DataPoint JSX Element, or null if it's not visible.
 */
const DataPoint = (
	{ title, value, icon, smallText, isVisible = true }: Readonly<DataPointProps>
): JSX.Element | null => {
	if ( ! isVisible ) {
		return null;
	}

	return (
		<div className="data-point">
			<Icon size={ 24 } icon={ icon } />
			<span className="data-point-title">{ title }</span>
			<span className={ 'data-point-value' + ( smallText ? ' is-small' : '' ) }>{ value }</span>
		</div>
	);
};

/**
 * Props for the PerformanceDataPoints component.
 *
 * @since 3.14.0
 */
type PerformanceDataPointsProp = {
	dataPoints: DataPointProps[]
}

/**
 * A grid of data points to display in the Overview panel.
 *
 * @since 3.14.0
 *
 * @param { PerformanceDataPointsProp } props The component's props.
 */
const PerformanceDataPoints = (
	{ dataPoints }: Readonly<PerformanceDataPointsProp>
): JSX.Element => {
	return (
		<div className="performance-data-points">
			{ dataPoints.map( ( { title, value, icon, smallText, isVisible } ) => (
				<DataPoint
					key={ title }
					title={ title }
					value={ value }
					icon={ icon }
					smallText={ smallText }
					isVisible={ isVisible }
				/>
			) ) }
		</div>
	);
};

/**
 * Props for the OverviewMenu component.
 *
 * @since 3.14.0
 */
type OverviewMenuProps = {
	onClose: () => void;
}

/**
 * A dropdown menu for the Overview panel.
 *
 * @since 3.14.0
 *
 * @param { OverviewMenuProps } props The component's props.
 */
const OverviewMenu = (
	{ onClose }: Readonly<OverviewMenuProps>
): JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();

	/**
	 * Toggles a data point's visibility in the sidebar settings.
	 *
	 * @since 3.14.0
	 *
	 * @param { string } dataPoint The name of the data point.
	 */
	const toggleDataPoint = ( dataPoint: string ): void => {
		// Check if the dataPoint is in the settings.PerformanceStats.VisibleDataPoints array
		// If it is, remove it with setSettings, if not, add it.
		if ( isDataPointVisible( settings, dataPoint ) ) {
			setSettings( {
				PerformanceStats: {
					...settings.PerformanceStats,
					VisibleDataPoints: settings.PerformanceStats.VisibleDataPoints.filter(
						( p ) => p !== dataPoint
					),
				},
			} );
			Telemetry.trackEvent( 'editor_sidebar_performance_datapoint_hidden',
				{ datapoint: dataPoint }
			);
		} else {
			setSettings( {
				PerformanceStats: {
					...settings.PerformanceStats,
					VisibleDataPoints: [ ...settings.PerformanceStats.VisibleDataPoints, dataPoint ],
				},
			} );
			Telemetry.trackEvent( 'editor_sidebar_performance_datapoint_shown',
				{ datapoint: dataPoint }
			);
		}
	};

	/**
	 * Handles a click on a menu item.
	 *
	 * @since 3.14.0
	 *
	 * @param { string } selection
	 */
	const onClick = ( selection: string ): void => {
		toggleDataPoint( selection );
		onClose();
	};

	/**
	 * Resets all data points to their default visibility.
	 *
	 * @since 3.14.0
	 */
	const resetAll = (): void => {
		setSettings( {
			PerformanceStats: {
				...settings.PerformanceStats,
				VisibleDataPoints: [ 'views', 'visitors', 'avgEngaged', 'recirculation' ],
			},
		} );
		Telemetry.trackEvent( 'editor_sidebar_performance_datapoints_reset' );
		onClose();
	};

	return (
		<>
			<MenuGroup label={ __( 'Performance Stats', 'wp-parsely' ) }>
				{ availableDataPoints.map( ( value ) => (
					<MenuItem
						key={ value.name }
						icon={ isDataPointVisible( settings, value.name ) ? check : reset }
						onClick={ () => onClick( value.name ) }
					>
						<Icon icon={ value.icon } />
						{ value.title }
					</MenuItem>
				) ) }
			</MenuGroup>
			<MenuGroup>
				<MenuItem onClick={ resetAll }>
					{ __( 'Reset all', 'wp-parsely' ) }
				</MenuItem>
			</MenuGroup>
		</>
	);
};

/**
 * Props for the PerformanceOverviewPanel component.
 *
 * @since 3.14.0
 */
type PerformanceOverviewPanelProps = {
	data: PerformanceData;
	isLoading?: boolean;
}

/**
 * The Overview panel for the Performance Stats Sidebar.
 *
 * @since 3.14.0
 *
 * @param { PerformanceOverviewPanelProps } props The component's props.
 */
export const PerformanceOverviewPanel = ( {
	data,
	isLoading = false,
}: Readonly<PerformanceOverviewPanelProps> ): JSX.Element => {
	const { settings } = useSettings<SidebarSettings>();

	let dataPointsWithValues: DataPointProps[] = [];
	if ( ! isLoading ) {
		dataPointsWithValues = availableDataPoints.map( ( dataPoint ) => {
			let value;
			switch ( dataPoint.name ) {
				case 'views':
					value = formatToImpreciseNumber( data.views );
					break;
				case 'visitors':
					value = formatToImpreciseNumber( data.visitors );
					break;
				case 'avgEngaged':
					value = data.avgEngaged;
					break;
				default:
					value = __( 'Coming soon!', 'wp-parsely' );
					break;
			}
			return {
				...dataPoint,
				value,
				isVisible: isDataPointVisible( settings, dataPoint.name ),
			};
		} );
	}

	return (
		<PerformanceStatPanel
			title={ __( 'Overview', 'wp-parsely' ) }
			level={ 3 }
			icon={ moreHorizontal }
			dropdownChildren={ ( { onClose } ) => <OverviewMenu onClose={ onClose } /> }
		>
			{ ( isLoading ? (
				<div className="parsely-spinner-wrapper" data-testid="parsely-spinner-wrapper">
					<Spinner />
				</div>
			) : (
				<PerformanceDataPoints dataPoints={ dataPointsWithValues } />
			) ) }
		</PerformanceStatPanel>
	);
};
