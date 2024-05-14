/**
 * WordPress dependencies
 */
import { SelectControl, Spinner } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getMetricDescription, isInEnum, Metric } from '../../common/utils/constants';
import { PerformanceStatPanel } from './component-panel';
import { PerformanceData } from './model';

/**
 * PerformanceReferrersPanel component props.
 *
 * @since 3.14.0
 */
type PerformanceReferrersPanelProps = {
	data: PerformanceData;
	isLoading: boolean;
}

/**
 * The Referrers panel for the Performance Stats Sidebar.
 *
 * @since 3.14.0
 *
 * @param {PerformanceReferrersPanelProps} props The component's props.
 *
 * @return {JSX.Element} The PerformanceReferrersPanel JSX Element.
 */
export const PerformanceReferrersPanel = ( {
	data,
	isLoading,
}: Readonly<PerformanceReferrersPanelProps> ): JSX.Element => {
	const [ metric, setMetric ] = useState<Metric>( Metric.Views );
	const [ isOpen, setIsOpen ] = useState<boolean>( false );

	/* translators: %s: metric description */
	const subtitle = sprintf( __( 'By %s', 'wp-parsely' ), getMetricDescription( metric ) );
	return (
		<PerformanceStatPanel
			title={ __( 'Referrers', 'wp-parsely' ) }
			subtitle={ subtitle }
			level={ 3 }
			isOpen={ isOpen }
			onClick={ () => setIsOpen( ! isOpen ) }
		>
			{ isOpen && (
				<div className="panel-settings">
					<SelectControl
						value={ metric }
						prefix={ __( 'By: ', 'wp-parsely' ) }
						onChange={ ( selection ) => {
							if ( isInEnum( selection, Metric ) ) {
								setMetric( selection as Metric );
							}
						} }
					>
						{ Object.values( Metric ).map( ( value ) => (
							<option key={ value } value={ value } disabled={ 'avg_engaged' === value }>
								{ getMetricDescription( value ) }
								{ 'avg_engaged' === value && __( ' (coming soon)', 'wp-parsely' ) }
							</option>
						) ) }
					</SelectControl>
				</div>
			) }
			{ isLoading ? (
				<div className="parsely-spinner-wrapper" data-testid="parsely-spinner-wrapper">
					<Spinner />
				</div>
			) : (
				<div className="referrers-list">
					{ Object.entries( data.referrers.top ).map( ( [ key, value ] ) => {
						if ( key === 'totals' ) {
							return null;
						}

						let referrerUrl = key;
						if ( key === 'direct' ) {
							referrerUrl = __( 'Direct', 'wp-parsely' );
						}

						/* translators: %s: Percentage value, %%: Escaped percent sign */
						const ariaLabel = sprintf( __( '%s%%', 'wp-parsely' ), value.viewsPercentage ); // eslint-disable-line @wordpress/valid-sprintf

						return (
							<div key={ key } className="referrers-row">
								<div className="referrers-row-title">
									<span>{ referrerUrl }</span>
								</div>
								<div className="referrers-row-bar">
									<div
										aria-label={ ariaLabel }
										className="percentage-bar"
										style={ { '--bar-fill': value.viewsPercentage + '%' } as React.CSSProperties }
									></div>
								</div>
								<div className="referrers-row-value">
									<span>{ value.views }</span>
								</div>
							</div>
						);
					} ) }
				</div>
			) }
		</PerformanceStatPanel>
	);
};
