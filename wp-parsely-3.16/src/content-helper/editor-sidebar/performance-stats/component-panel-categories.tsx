/**
 * WordPress dependencies
 */
import { SelectControl, Spinner, Tooltip } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getMetricDescription, isInEnum, Metric } from '../../common/utils/constants';
import { formatToImpreciseNumber } from '../../common/utils/number';
import { PerformanceStatPanel } from './component-panel';
import { PerformanceData } from './model';

/**
 * PerformanceCategoriesPanel component props.
 *
 * @since 3.14.0
 */
type PerformanceCategoriesPanelProps = {
	data: PerformanceData;
	isLoading: boolean;
}

/**
 * The PerformanceCategoriesPanel component.
 *
 * Renders the Categories panel in the Performance tab.
 *
 * @since 3.14.0
 *
 * @param {PerformanceCategoriesPanelProps} props The component's props.
 *
 * @return {import('react').JSX.Element} The PerformanceCategoriesPanel JSX Element.
 */
export const PerformanceCategoriesPanel = ( {
	data,
	isLoading,
}: Readonly<PerformanceCategoriesPanelProps> ): React.JSX.Element => {
	const [ metric, setMetric ] = useState<Metric>( Metric.Views );
	const [ isOpen, setIsOpen ] = useState<boolean>( false );

	// Remove unneeded totals to simplify upcoming map() calls.
	if ( ! isLoading ) {
		delete data.referrers.types[ 'totals' as unknown as number ];
	}

	// Returns an internationalized referrer title based on the passed key.
	const getKeyTitle = ( key: string ): string => {
		switch ( key ) {
			case 'social': return __( 'Social', 'wp-parsely' );
			case 'search': return __( 'Search', 'wp-parsely' );
			case 'other': return __( 'Other', 'wp-parsely' );
			case 'internal': return __( 'Internal', 'wp-parsely' );
			case 'direct': return __( 'Direct', 'wp-parsely' );
		}

		return key;
	};

	/* translators: %s: metric description */
	const subtitle = sprintf( __( 'By %s', 'wp-parsely' ), getMetricDescription( metric ) );
	return (
		<PerformanceStatPanel
			title={ __( 'Categories', 'wp-parsely' ) }
			level={ 3 }
			subtitle={ subtitle }
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
				<div>
					<div className="multi-percentage-bar">
						{ Object.entries( data.referrers.types ).map( ( [ key, value ] ) => {
							const ariaLabel = sprintf(
								/* translators: 1: Referrer type, 2: Percentage value, %%: Escaped percent sign */
								__( '%1$s: %2$s%%', 'wp-parsely' ),
								getKeyTitle( key ),
								value.viewsPercentage,
							);

							return (
								<Tooltip
									/* translators: %s: percentage value */
									text={ `${ getKeyTitle( key ) } - ${ sprintf( __( '%s%%', 'wp-parsely' ), value.viewsPercentage ) }` } // eslint-disable-line @wordpress/valid-sprintf
									delay={ 150 }
									key={ key }
								>
									<div
										aria-label={ ariaLabel }
										className={ 'bar-fill ' + key }
										style={ { width: value.viewsPercentage + '%' } }
									></div>
								</Tooltip>
							);
						} ) }
					</div>
					<div className="percentage-bar-labels">
						{ Object.entries( data.referrers.types ).map( ( [ key, value ] ) => (
							<div className={ 'single-label ' + key } key={ key }>
								<div className={ 'label-color ' + key }></div>
								<div className="label-text">{ getKeyTitle( key ) }</div>
								<div className="label-value">{ formatToImpreciseNumber( value.views ) }</div>
							</div>
						) ) }
					</div>
				</div>
			) }
		</PerformanceStatPanel>
	);
};
