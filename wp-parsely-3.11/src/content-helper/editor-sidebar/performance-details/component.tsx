/**
 * WordPress dependencies
 */
import { Button, Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ContentHelperError } from '../../common/content-helper-error';
import { Period, getPeriodDescription } from '../../common/utils/constants';
import { formatToImpreciseNumber } from '../../common/utils/number';
import { PerformanceData } from './model';
import { PerformanceDetailsProvider } from './provider';

// Number of attempts to fetch the data before displaying an error.
const FETCH_RETRIES = 1;

/**
 * Defines the props structure for PerformanceDetails.
 *
 * @since 3.11.0
 */
interface PerformanceDetailsProps {
	period: Period;
}

/**
 * Specifies props structure for PerformanceDetailsSections.
 */
interface PerformanceSectionProps extends PerformanceDetailsProps {
	data: PerformanceData;
}

/**
 * Outputs the current post's details or shows an error message on failure.
 *
 * @param {PerformanceDetailsProps} props The component's props.
 */
export function PerformanceDetails(
	{ period }: Readonly<PerformanceDetailsProps>
): JSX.Element {
	const [ loading, setLoading ] = useState<boolean>( true );
	const [ error, setError ] = useState<ContentHelperError>();
	const [ postDetails, setPostDetails ] = useState<PerformanceData>();

	useEffect( () => {
		const provider = new PerformanceDetailsProvider();

		const fetchPosts = async ( retries: number ) => {
			provider.getPerformanceDetails( period )
				.then( ( result ) => {
					setPostDetails( result );
					setLoading( false );
				} )
				.catch( async ( err ) => {
					if ( retries > 0 && err.retryFetch ) {
						await new Promise( ( r ) => setTimeout( r, 500 ) );
						await fetchPosts( retries - 1 );
					} else {
						setError( err );
						setLoading( false );
					}
				} );
		};

		setLoading( true );
		fetchPosts( FETCH_RETRIES );

		return (): void => {
			setError( undefined );
		};
	}, [ period ] );

	if ( error ) {
		return error.Message();
	}

	return (
		loading
			?	(
				<div className="parsely-spinner-wrapper" data-testid="parsely-spinner-wrapper">
					<Spinner />
				</div>
			)
			: (
				<PerformanceDetailsSections
					data={ postDetails as PerformanceData }
					period={ period }
				/>
			)
	);
}

/**
 * Outputs all the "Current Post Details" sections.
 *
 * @param {PerformanceSectionProps} props The props needed to populate the sections.
 */
function PerformanceDetailsSections(
	props: Readonly<PerformanceSectionProps>
): JSX.Element {
	return (
		<div className="performance-details-panel">
			<div className="section period">
				{ getPeriodDescription( props.period ) }
			</div>
			<GeneralPerformanceSection { ...props } />
			<ReferrerTypesSection { ...props } />
			<TopReferrersSection { ...props } />
			<ActionsSection { ...props } />
		</div>
	);
}

/**
 * Outputs the "General Performance" (Views, Visitors, Time) section.
 *
 * @param {PerformanceSectionProps} props The props needed to populate the section.
 */
function GeneralPerformanceSection(
	props: Readonly<PerformanceSectionProps>
): JSX.Element {
	const data = props.data;

	return (
		<div className="section general-performance">
			<table>
				<tbody>
					<tr>
						<td>{ formatToImpreciseNumber( data.views ) }</td>
						<td>{ formatToImpreciseNumber( data.visitors ) }</td>
						<td>{ data.avgEngaged }</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<th>{ __( 'Page Views', 'wp-parsely' ) }</th>
						<th>{ __( 'Visitors', 'wp-parsely' ) }</th>
						<th>{ __( 'Avg. Time', 'wp-parsely' ) }</th>
					</tr>
				</tfoot>
			</table>
		</div>
	);
}

/**
 * Outputs the "Referrer Types" section.
 *
 * @param {PerformanceSectionProps} props The props needed to populate the section.
 */
function ReferrerTypesSection(
	props: Readonly<PerformanceSectionProps>
): JSX.Element {
	const data = props.data;

	// Remove unneeded totals to simplify upcoming map() calls.
	delete data.referrers.types[ 'totals' as unknown as number ];

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

	return (
		<div className="section referrer-types">
			<div className="section-title">{ __( 'Referrers (Page Views)', 'wp-parsely' ) }</div>

			<div className="multi-percentage-bar">{
				Object.entries( data.referrers.types ).map( ( [ key, value ] ) => {
					const ariaLabel = sprintf(
						/* translators: 1: Referrer type, 2: Percentage value, %%: Escaped percent sign */
						__( '%1$s: %2$s%%', 'wp-parsely' ),
						getKeyTitle( key ), value.viewsPercentage
					);

					return (
						<div aria-label={ ariaLabel }
							className={ 'bar-fill ' + key } key={ key }
							style={ { width: value.viewsPercentage + '%' } }>
						</div>
					);
				} ) }
			</div>

			<table>
				<thead>
					<tr>{
						Object.keys( data.referrers.types ).map( ( key ) => {
							return <th key={ key }>{ getKeyTitle( key ) }</th>;
						} ) }
					</tr>
				</thead>
				<tbody>
					<tr>{
						Object.entries( data.referrers.types ).map( ( [ key, value ] ) => {
							return <td key={ key }>{ formatToImpreciseNumber( value.views ) }</td>;
						} ) }
					</tr>
				</tbody>
			</table>
		</div>
	);
}

/**
 * Outputs the "Top Referrers" section.
 *
 * @param {PerformanceSectionProps} props The props needed to populate the section.
 */
function TopReferrersSection(
	props: Readonly<PerformanceSectionProps>
): JSX.Element {
	const data = props.data;
	let totalViewsPercentage = 0;

	return (
		<div className="section top-referrers">
			<table>
				<thead>
					<tr>
						<th scope="col">{ __( 'Top Referrers', 'wp-parsely' ) }</th>
						<th colSpan={ 2 } scope="colgroup">{ __( 'Page Views', 'wp-parsely' ) }</th>
					</tr>
				</thead>
				<tbody>{
					Object.entries( data.referrers.top ).map( ( [ key, value ] ) => {
						if ( key === 'totals' ) {
							totalViewsPercentage = Number( value.viewsPercentage );
							return null;
						}

						let referrerUrl = key;
						if ( key === 'direct' ) {
							referrerUrl = __( 'Direct', 'wp-parsely' );
						}

						/* translators: %s: Percentage value, %%: Escaped percent sign */
						const ariaLabel = sprintf( __( '%s%%', 'wp-parsely' ), value.viewsPercentage ); // eslint-disable-line @wordpress/valid-sprintf

						return (
							<tr key={ key }>
								<th scope="row">{ referrerUrl }</th>
								<td>
									<div aria-label={ ariaLabel }
										className="percentage-bar"
										style={ { '--bar-fill': value.viewsPercentage + '%' } as React.CSSProperties }>
									</div>
								</td>
								<td>{ formatToImpreciseNumber( value.views ) }</td>
							</tr>
						);
					} )
				}
				</tbody>
			</table>
			<div> {
				/* translators: %s: Percentage value, %%: Escaped percent sign */
				sprintf( _n( // eslint-disable-line @wordpress/valid-sprintf
					'%s%% of views came from top referrers.',
					'%s%% of views came from top referrers.',
					totalViewsPercentage, 'wp-parsely' ), totalViewsPercentage
				)
			}
			</div>
		</div>
	);
}

/**
 * Outputs the "Actions" section.
 *
 * @param {PerformanceSectionProps} props The props needed to populate the section.
 */
function ActionsSection(
	props: Readonly<PerformanceSectionProps>
): JSX.Element {
	const data = props.data;
	const ariaOpensNewTab = <span className="screen-reader-text"> {
		__( '(opens in new tab)', 'wp-parsely' ) }
	</span>;

	return (
		<div className="section actions">
			<Button
				href={ data.url } rel="noopener" target="_blank" variant="secondary">
				{ __( 'Visit Post', 'wp-parsely' ) }{ ariaOpensNewTab }
			</Button>
			<Button
				href={ data.dashUrl } rel="noopener" target="_blank" variant="primary">
				{ __( 'View in Parse.ly', 'wp-parsely' ) }{ ariaOpensNewTab }
			</Button>
		</div>
	);
}
