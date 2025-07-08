/**
 * External dependencies
 */
import { CardBody, Spinner } from '@wordpress/components';
/**
 * Types
 */
import type { IntegrationCardProps } from './index';

type IntegrationCardBodyProps = Pick<
	IntegrationCardProps,
	'isExpanded' | 'children' | 'cardData'
>;

const IntegrationCardBody = ( {
	isExpanded,
	children,
	cardData = {},
}: IntegrationCardBodyProps ) => {
	if ( ! isExpanded ) {
		return null;
	}

	const { notInstalledMessage, notActivatedMessage, isInstalled, isActive, isLoading, type } =
		cardData;

	const isPlugin = type === 'plugin';
	const isService = type === 'service';
	const showPluginInstallMessage = isPlugin && ! isInstalled;
	const showPluginActivateMessage = isPlugin && isInstalled && ! isActive;
	const showContent = ( isPlugin && isInstalled && isActive ) || isService;

	if ( isLoading ) {
		return (
			<CardBody>
				<Spinner />
			</CardBody>
		);
	}

	return (
		<CardBody>
			{ showPluginInstallMessage && (
				<p className="integration-card__description">{ notInstalledMessage }</p>
			) }
			{ showPluginActivateMessage && (
				<p className="integration-card__description">{ notActivatedMessage }</p>
			) }
			{ showContent && children }
		</CardBody>
	);
};

export default IntegrationCardBody;
