/**
 * WordPress dependencies
 */
import { Button, Dashicon, Rect, SVG, Tooltip } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, copySmall, link, seen } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { LeafIcon } from '../../common/icons/leaf-icon';
import { escapeRegExp } from '../../common/utils/functions';
import { PostListItemMetric, PostListItemProps } from '../../common/utils/post';

/**
 * Returns a vertical divider.
 *
 * @since 3.14.0
 */
const VerticalDivider = (): JSX.Element => {
	return (
		<SVG xmlns="http://www.w3.org/2000/svg" width="1" height="40" viewBox="0 0 1 40" fill="none">
			<Rect width="1" height="40" fill="#cccccc" />
		</SVG>
	);
};

/**
 * Returns a single related post item.
 *
 * @since 3.14.0
 *
 * @param {PostListItemProps} props The component's props.
 */
export const RelatedPostItem = (
	{ metric, post, postContent }: Readonly<PostListItemProps>
): JSX.Element => {
	const { createNotice } = useDispatch( 'core/notices' );

	/**
	 * Checks if a hyperlink is present in the content by using a regular expression.
	 *
	 * @since 3.14.1
	 *
	 * @param {string} content
	 * @param {string} rawUrl
	 *
	 * @return {boolean} Whether the link is present in the content.
	 */
	const isLinkPresentInContent = ( content: string, rawUrl: string ): boolean => {
		const escapedUrl = escapeRegExp( rawUrl );
		const regexPattern = new RegExp(
			`<a [^>]*href=["'](http:\/\/|https:\/\/)?.*${ escapedUrl }.*["'][^>]*>`,
			'i'
		);

		return regexPattern.test( content );
	};

	const isLinked = postContent && isLinkPresentInContent( postContent, post.rawUrl );

	return (
		<div className="related-post-single" data-testid="related-post-single">
			<div className="related-post-title">
				<a href={ post.url } target="_blank" rel="noreferrer">
					<span className="screen-reader-text">
						{ __( 'View on website (opens new tab)', 'wp-parsely' ) }
					</span>
					{ post.title }
				</a>
			</div>
			<div className="related-post-actions">
				<div className="related-post-info">
					<div>
						<div className="related-post-metric">
							<PostListItemMetric
								metric={ metric }
								post={ post }
								viewsIcon={ <Icon icon={ seen } /> }
								avgEngagedIcon={ <Dashicon icon="clock" size={ 24 } /> }
							/>
						</div>
						{ isLinked && (
							<div className="related-post-linked">
								<Tooltip
									text={ __( 'This post is linked in the content', 'wp-parsely' ) }
								>
									<Icon icon={ link } size={ 24 } />
								</Tooltip>
							</div>
						) }
					</div>
					<VerticalDivider />
					<div>
						<Button
							icon={ copySmall }
							iconSize={ 24 }
							onClick={ () => {
								navigator.clipboard.writeText( post.rawUrl ).then( () => {
									createNotice(
										'success',
										__( 'URL copied to clipboard', 'wp-parsely' ),
										{
											type: 'snackbar',
										}
									);
								} );
							}	}
							label={ __( 'Copy URL to clipboard', 'wp-parsely' ) }
						/>
						<Button
							icon={ <LeafIcon /> }
							iconSize={ 18 }
							href={ post.dashUrl }
							target={ '_blank' }
							label={ __( 'View in Parse.ly', 'wp-parsely' ) }
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
