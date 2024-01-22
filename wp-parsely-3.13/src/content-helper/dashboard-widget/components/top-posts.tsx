/**
 * WordPress dependencies
 */
import { Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../../js/telemetry/telemetry';
import { ContentHelperError } from '../../common/content-helper-error';
import { useSaveSettings } from '../../common/hooks/useSaveSettings';
import { Select } from '../../common/select';
import {
	Metric,
	Period,
	getMetricDescription,
	getPeriodDescription,
	isInEnum,
} from '../../common/utils/constants';
import { PostData } from '../../common/utils/post';
import { DashboardWidgetProvider, TOP_POSTS_DEFAULT_LIMIT } from '../provider';
import { TopPostListItem } from './top-posts-list-item';

const FETCH_RETRIES = 1;

/**
 * Defines the settings structure for the TopPosts component.
 *
 * @since 3.13.0
 */
export interface TopPostsSettings {
	Metric: Metric;
	Period: Period;
}

/**
 * Gets the settings from the passed JSON.
 *
 * If missing settings or invalid values are detected, they get set to their
 * defaults.
 *
 * @since 3.13.0
 *
 * @param {string} settingsJson The JSON containing the settings.
 *
 * @return {TopPostsSettings} The resulting settings object.
 */
const getSettingsFromJson = ( settingsJson: string ): TopPostsSettings => {
	let parsedSettings: TopPostsSettings;

	try {
		parsedSettings = JSON.parse( settingsJson );
	} catch ( e ) {
		// Return defaults when parsing failed or the string is empty.
		return {
			Metric: Metric.Views,
			Period: Period.Days7,
		};
	}

	// Fix invalid values if any are found.
	if ( ! isInEnum( parsedSettings?.Metric, Metric ) ) {
		parsedSettings.Metric = Metric.Views;
	}
	if ( ! isInEnum( parsedSettings?.Period, Period ) ) {
		parsedSettings.Period = Period.Days7;
	}

	return parsedSettings;
};

/**
 * List of the top posts.
 *
 * @since 3.7.0
 */
export function TopPosts(): JSX.Element {
	const [ settings, setSettings ] = useState<TopPostsSettings>(
		getSettingsFromJson( window.wpParselyContentHelperSettings )
	);
	const [ loading, setLoading ] = useState<boolean>( true );
	const [ error, setError ] = useState<ContentHelperError>();
	const [ posts, setPosts ] = useState<PostData[]>( [] );
	const [ page, setPage ] = useState<number>( 1 );

	/**
	 * Saves the settings into the WordPress database whenever a setting change
	 * occurs.
	 *
	 * @since 3.13.0
	 */
	useSaveSettings( 'dashboard-widget-settings', settings );

	/**
	 * Fetches the top posts.
	 *
	 * @since 3.7.0
	 */
	useEffect( () => {
		const provider = new DashboardWidgetProvider();

		const fetchPosts = async ( retries: number ) => {
			provider.getTopPosts( settings, page )
				.then( ( result ): void => {
					setPosts( result );
					setLoading( false );
				} )
				.catch( async ( err ) => {
					if ( retries > 0 && err.retryFetch ) {
						await new Promise( ( r ) => setTimeout( r, 500 ) );
						await fetchPosts( retries - 1 );
					} else {
						setLoading( false );
						setError( err );
					}
				} );
		};

		setLoading( true );
		fetchPosts( FETCH_RETRIES );

		return (): void => {
			setLoading( false );
			setPosts( [] );
			setError( undefined );
		};
	}, [ settings, page ] );

	/**
	 * Tracks the filter changes.
	 *
	 * @since 3.12.0
	 *
	 * @param {string} filter The filter name.
	 * @param {Object} props  The filter properties.
	 */
	const trackFilterChanges = ( filter: string, props: object ): void => {
		Telemetry.trackEvent( 'dash_widget_filter_changed', { filter, ...props } );
	};

	const filters :JSX.Element = (
		<div className="parsely-top-posts-filters">
			<Select
				defaultValue={ settings.Period }
				items={
					Object.values( Period ).map(
						( value ) => [ value, getPeriodDescription( value ) ]
					)
				}
				onChange={ ( event ) => {
					if ( isInEnum( event.target.value, Period ) ) {
						setSettings( {
							...settings,
							Period: event.target.value as Period,
						} );
						trackFilterChanges( 'period', { period: event.target.value } );
						setPage( 1 );
					}
				} }
			/>
			<Select
				defaultValue={ settings.Metric }
				items={
					Object.values( Metric ).map(
						( value ) => [ value, getMetricDescription( value ) ]
					)
				}
				onChange={ ( event ) => {
					if ( isInEnum( event.target.value, Metric ) ) {
						setSettings( {
							...settings,
							Metric: event.target.value as Metric,
						} );
						trackFilterChanges( 'metric', { metric: event.target.value } );
						setPage( 1 );
					}
				} }
			/>
		</div>
	);

	const navigation: JSX.Element = (
		<div className="parsely-top-posts-navigation">
			<button
				className="parsely-top-posts-navigation-prev"
				disabled={ page <= 1 }
				aria-label={ __( 'Previous page', 'wp-parsely' ) }
				onClick={ () => {
					setPage( page - 1 );
					Telemetry.trackEvent( 'dash_widget_navigation', {
						navigation: 'previous',
						to_page: page - 1,
					} );
				} }
			>
				{ __( '<< Previous', 'wp-parsely' ) }
			</button>
			{
				sprintf( /* translators: 1: Current page */
					__( 'Page %1$d', 'wp-parsely' ),
					page
				)
			}
			<button
				className="parsely-top-posts-navigation-next"
				disabled={ ! loading && posts.length < TOP_POSTS_DEFAULT_LIMIT }
				aria-label={ __( 'Next page', 'wp-parsely' ) }
				onClick={ () => {
					setPage( page + 1 );
					Telemetry.trackEvent( 'dash_widget_navigation', {
						navigation: 'next',
						to_page: page + 1,
					} );
				} }
			>
				{ __( 'Next >>', 'wp-parsely' ) }
			</button>
		</div>
	);

	// Show error message.
	if ( error ) {
		return (
			<>
				{ filters }
				{ error.Message() }
				{ page > 1 && navigation }
			</>
		);
	}

	const spinner: JSX.Element = (
		<div className="parsely-spinner-wrapper"><Spinner /></div>
	);

	return (
		<>
			{ filters }
			{
				loading ? ( spinner ) : (
					<ol className="parsely-top-posts" style={ { counterReset: 'item ' + ( ( page - 1 ) * TOP_POSTS_DEFAULT_LIMIT ) } }>
						{ posts.map( ( post: PostData ): JSX.Element =>
							<TopPostListItem
								key={ post.id }
								metric={ settings.Metric }
								post={ post }
							/>
						) }
					</ol>
				)
			}
			{ ( posts.length >= TOP_POSTS_DEFAULT_LIMIT || page > 1 ) && navigation }
		</>
	);
}
