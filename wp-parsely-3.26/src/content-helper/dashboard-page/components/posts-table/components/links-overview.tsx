/**
 * WordPress dependencies
 */
import { Icon, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { external } from '@wordpress/icons';

/**
 * The props for the LinksOverview component.
 *
 * @since 3.19.0
 */
type LinksOverviewProps = {
	inboundLinks: number;
	outboundLinks: number;
};

/**
 * Displays the inbound and outbound links for a post.
 *
 * @since 3.19.0
 *
 * @param {LinksOverviewProps} props The props for the LinksOverview component.
 */
export const LinksOverview = ( { inboundLinks, outboundLinks }: LinksOverviewProps ) => {
	return (
		<div className="boost-link-status">
			{ inboundLinks > 0 ? (
				<Tooltip text={ __( 'Inbound Links', 'wp-parsely' ) } >
					<div className={ `boost-inbound ${ inboundLinks > 0 ? '' : 'hidden' }` }>
						<Icon size={ 16 } icon={ external } className="boost-link-status-icon-inbound" />
						{ inboundLinks }
					</div>
				</Tooltip>
			) : (
				<div className={ `boost-inbound hidden` }>
					<Icon size={ 16 } icon={ external } className="boost-link-status-icon-inbound" />
				</div>
			) }

			{ outboundLinks > 0 ? (
				<Tooltip text={ __( 'Outbound Links', 'wp-parsely' ) } >
					<div className={ `boost-outbound ${ outboundLinks > 0 ? '' : 'hidden' }` }>
						<Icon size={ 16 } icon={ external } className="boost-link-status-icon-outbound" />
						{ outboundLinks }
					</div>
				</Tooltip>
			) : (
				<div className={ `boost-outbound hidden` }>
					<Icon size={ 16 } icon={ external } className="boost-link-status-icon-outbound" />
				</div>
			) }
		</div>
	);
};
