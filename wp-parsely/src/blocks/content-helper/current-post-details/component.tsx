/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { Button, Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import CurrentPostDetailsProvider from './provider';
import { PostPerformanceData } from './post-performance-data';
import { ContentHelperError } from '../content-helper-error';

// Number of attempts to fetch the data before displaying an error.
const FETCH_RETRIES = 3;

/**
 * Specifies the form of component props.
 */
interface PostDetailsSectionProps {
	data: PostPerformanceData;
}

/**
 * Outputs the current post's details or shows an error message on failure.
 */
function CurrentPostDetails() {
	const [ loading, setLoading ] = useState<boolean>( true );
	const [ error, setError ] = useState<ContentHelperError>( null );
	const [ postDetailsData, setPostDetails ] = useState<PostPerformanceData>( null );
	const provider = new CurrentPostDetailsProvider();

	useEffect( () => {
		const fetchPosts = async ( retries: number ) => {
			provider.getCurrentPostDetails()
				.then( ( result ) => {
					setPostDetails( result );
					setLoading( false );
				} )
				.catch( async ( err ) => {
					if ( retries > 0 ) {
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
	}, [] );

	if ( error ) {
		return error.ProcessedMessage();
	}

	return (
		loading
			? <Spinner />
			: <CurrentPostDetailsSections data={ postDetailsData } />
	);
}

/**
 * Outputs all the "Current Post Details" sections.
 *
 * @param {PostDetailsSectionProps} props The props needed to populate the sections.
 */
function CurrentPostDetailsSections( props: PostDetailsSectionProps ) {
	return (
		<div className="current-post-details-panel">
			<DataPeriodSection { ...props } />
			<GeneralPerformanceSection { ...props } />
			<ReferrerTypesSection { ...props } />
			<TopReferrersSection { ...props } />
			<ActionsSection { ...props } />
		</div>
	);
}

/**
 * Outputs the "Period" section, which denotes the period for which data is
 * shown.
 *
 * @param {PostDetailsSectionProps} props The props needed to populate the section.
 */
function DataPeriodSection( props: PostDetailsSectionProps ) {
	const period = props.data.period;

	// Get the date (in short format) on which the period starts.
	const periodStart = Intl.DateTimeFormat(
		document.documentElement.lang,
		{ month: 'short', day: 'numeric' }
	).format( new Date( period.start ) );

	return (
		<div className="section period">
			{
				/* translators: Number of days for which data is being shown */
				sprintf( __( 'Last %d Days', 'wp-parsely' ), period.days )
			}
			<span>
				{
					/* translators: Period starting date in short format */
					sprintf( __( ' (%s - Today)', 'wp-parsely' ), periodStart )
				}
			</span>
		</div>
	);
}

/**
 * Outputs the "General Performance" (Views, Visitors, Time) section.
 *
 * @param {PostDetailsSectionProps} props The props needed to populate the section.
 */
function GeneralPerformanceSection( props: PostDetailsSectionProps ) {
	const data = props.data;

	return (
		<div className="section general-performance">
			<table>
				<tbody>
					<tr>
						<td>{ impreciseNumber( data.views ) }</td>
						<td>{ impreciseNumber( data.visitors ) }</td>
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
 * @param {PostDetailsSectionProps} props The props needed to populate the section.
 */
function ReferrerTypesSection( props: PostDetailsSectionProps ) {
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
							return <td key={ key }>{ impreciseNumber( value.views ) }</td>;
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
 * @param {PostDetailsSectionProps} props The props needed to populate the section.
 */
function TopReferrersSection( props: PostDetailsSectionProps ) {
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
								<td>{ impreciseNumber( value.views ) }</td>
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
 * @param {PostDetailsSectionProps} props The props needed to populate the section.
 */
function ActionsSection( props: PostDetailsSectionProps ) {
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
				href={ data.statsUrl } rel="noopener" target="_blank" variant="primary">
				{ __( 'View in Parse.ly', 'wp-parsely' ) }{ ariaOpensNewTab }
			</Button>
		</div>
	);
}

/**
 * Implements the "Imprecise Number" functionality of the Parse.ly dashboard.
 *
 * Note: This function is not made to process float numbers.
 *
 * @param {string} value          The number to process. It can be formatted.
 * @param {number} fractionDigits The number of desired fraction digits.
 * @param {string} glue           A string to put between the number and unit.
 * @return {string} The number formatted as an imprecise number.
 */
function impreciseNumber( value: string, fractionDigits = 1, glue = '' ): string {
	const number = parseInt( value.replace( /\D/g, '' ), 10 );

	if ( number < 1000 ) {
		return value;
	} else if ( number < 10000 ) {
		fractionDigits = 1;
	}

	const unitNames = {
		1000: 'k',
		'1,000,000': 'M',
		'1,000,000,000': 'B',
		'1,000,000,000,000': 'T',
		'1,000,000,000,000,000': 'Q',
	};
	let currentNumber = number;
	let currentNumberAsString = number.toString();
	let unit = '';
	let previousNumber = 0;

	Object.entries( unitNames ).forEach( ( [ thousands, suffix ] ) => {
		const thousandsInt = parseInt( thousands.replace( /\D/g, '' ), 10 );

		if ( number >= thousandsInt ) {
			currentNumber = number / thousandsInt;
			let precision = fractionDigits;

			// For over 10 units, we reduce the precision to 1 fraction digit.
			if ( currentNumber % 1 > 1 / previousNumber ) {
				precision = currentNumber > 10 ? 1 : 2;
			}

			// Precision override, where we want to show 2 fraction digits.
			const zeroes = parseFloat( currentNumber.toFixed( 2 ) ) === parseFloat( currentNumber.toFixed( 0 ) );
			precision = zeroes ? 0 : precision;
			currentNumberAsString = currentNumber.toFixed( precision );
			unit = suffix;
		}

		previousNumber = thousandsInt;
	} );

	return currentNumberAsString + glue + unit;
}

export default CurrentPostDetails;
