/**
 * External dependencies
 */
import { Link } from 'react-router';

/**
 * WordPress dependencies
 */
import { DropdownMenu, MenuGroup, MenuItem, Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { HydratedPost } from '../../../../common/providers/base-wordpress-provider';
import { PostStats } from '../../../../common/providers/stats-provider';
import { getPostEditUrl } from '../../../../common/utils/post';
import { PostDetails } from './post-details';

/**
 * ActionDropdownProps type.
 *
 * @since 3.19.0
 */
type ActionDropdownProps = {
	post: HydratedPost;
};

/**
 * ActionDropdown component.
 *
 * Represents the action dropdown for each post in the PostsTable.
 *
 * @since 3.19.0
 *
 * @param {ActionDropdownProps} props The props for the ActionDropdown component.
 */
const ActionDropdown = ( { post }: ActionDropdownProps ): React.JSX.Element => (
	<DropdownMenu icon={ moreVertical } label={ __( 'Actions', 'wp-parsely' ) }>
		{ ( { onClose } ) => (
			<MenuGroup>
				<MenuItem
					onClick={ () => {
						window.open( post.link, '_blank', 'noopener,noreferrer' );
						onClose();
					} }
				>
					{ __( 'View', 'wp-parsely' ) }
				</MenuItem>
				<MenuItem
					onClick={ () => {
						window.open( getPostEditUrl( post.id ), '_blank', 'noopener,noreferrer' );
						onClose();
					} }
				>
					{ __( 'Edit', 'wp-parsely' ) }
				</MenuItem>
			</MenuGroup>
		) }
	</DropdownMenu>
);

/**
 * SinglePostRowProps type.
 *
 * @since 3.19.0
 */
type SinglePostRowProps = {
	post: HydratedPost;
	index: number;
	onPostClick?: ( post: HydratedPost ) => void;
	stats?: PostStats;
	compact: boolean;
	isLoadingStats: boolean;
	showStats?: boolean;
	showActions?: boolean;
	onErrorLoadingStats?: ( post: HydratedPost ) => void;
};

/**
 * SinglePostRow component.
 *
 * Represents a single post row in the PostsTable.
 *
 * @since 3.19.0
 *
 * @param {SinglePostRowProps} props The props for the SinglePostRow component.
 */
export const SinglePostRow = ( {
	post,
	index,
	onPostClick,
	stats,
	compact,
	isLoadingStats: initialIsLoadingStats,
	showStats = true,
	showActions = true,
	onErrorLoadingStats,
}: SinglePostRowProps ): React.JSX.Element => {
	const [ isLoadingStats, setIsLoadingStats ] = useState( initialIsLoadingStats );

	const viewsWithoutCommas = stats?.views?.replace( /\D/g, '' );
	const views = parseInt( viewsWithoutCommas ?? '0', 10 );
	const smartLinkViews = Number( stats?.campaign?.views ?? 0 );
	const nonSmartLinkViews = views - smartLinkViews;
	const trafficBoostPercentage = nonSmartLinkViews > 0 ? ( smartLinkViews / nonSmartLinkViews ) * 100 : 0;

	/**
	 * Handles when the stats have an error or are loading.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( undefined === stats && ! initialIsLoadingStats ) {
			onErrorLoadingStats?.( post );
			setIsLoadingStats( true );
		} else if ( undefined !== stats ) {
			setIsLoadingStats( false );
		}
	}, [ post, initialIsLoadingStats, stats, onErrorLoadingStats ] );

	return (
		<tr
			key={ post.id }
			className={ index % 2 === 0 ? 'row-even' : 'row-odd' }
			onClick={ () => onPostClick?.( post ) }
		>
			<td className="post-info">
				<PostDetails post={ post } />
			</td>
			{ ! compact && (
				<>
					{ showStats && (
						<td className="metrics">
							<div className="metrics-container">
								{ isLoadingStats && (
									<Spinner />
								) }
								{ ! isLoadingStats && views > 0 && (
									<div className="metric-views">
										{ views.toLocaleString() }
										{ smartLinkViews > 0 && (
											<span className="metric-change metric-change-positive">
												+{ smartLinkViews.toLocaleString() }
											</span>
										) }
									</div>
								) }
								{ ! isLoadingStats && trafficBoostPercentage > 0 && (
									<div className="metric-boost-percentage">
										{
										/* translators: %f is the boost percentage */
											sprintf( __( '%f%% BOOSTED', 'wp-parsely' ), trafficBoostPercentage.toFixed( 1 ) )
										}
									</div>
								) }
							</div>
						</td>
					) }
					{ showActions && (
						<td className="actions">
							<div className="boost-link-container">
								<Link
									to={ {
										pathname: `/traffic-boost/${ post.id }`,
									} }
									state={ {
										post,
									} }
								>
									{ __( 'Boost Traffic', 'wp-parsely' ) }
								</Link>
								{ /* Inbound/outbound link counts: Temporarily disabled for design */ }
								{ /* ( inboundLinks > 0 || outboundLinks > 0 ) && (
									<LinksOverview
										inboundLinks={ inboundLinks }
										outboundLinks={ outboundLinks }
									/>
								) */ }
							</div>
							<ActionDropdown post={ post } />
						</td>
					) }
				</>
			) }
		</tr>
	);
};
