import { getRedirectUrl } from '@automattic/jetpack-components';
import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import IntegrationCard from '../../blocks/contact-form/components/jetpack-integrations-modal/integration-card';
import AkismetIcon from '../../icons/akismet';
import type { IntegrationCardProps } from './types';

const AkismetDashboardCard = ( {
	isExpanded,
	onToggle,
	data,
	refreshStatus,
}: IntegrationCardProps ) => {
	const formSubmissionsUrl = data?.details?.formSubmissionsSpamUrl || '';
	const { isConnected: akismetActiveWithKey = false, settingsUrl = '' } = data || {};

	const cardData = {
		...data,
		showHeaderToggle: false, // Always off for dashboard
		isLoading: ! data || typeof data.isInstalled === 'undefined',
		refreshStatus,
		trackEventName: 'jetpack_forms_upsell_akismet_click',
		notInstalledMessage: createInterpolateElement(
			__(
				"Add one-click spam protection for your forms with <a>Akismet</a>. Simply install the plugin and you're set.",
				'jetpack-forms'
			),
			{
				a: <ExternalLink href={ getRedirectUrl( 'akismet-wordpress-org' ) } />,
			}
		),
		notActivatedMessage: __(
			'Akismet is installed. Just activate the plugin to start blocking spam.',
			'jetpack-forms'
		),
	};

	return (
		<IntegrationCard
			title={ __( 'Akismet Spam Protection', 'jetpack-forms' ) }
			description={ __( 'Akismet filters out form spam with 99% accuracy', 'jetpack-forms' ) }
			// @ts-expect-error: IntegrationCard icon prop accepts JSX.Element
			icon={ <AkismetIcon width={ 28 } height={ 28 } /> }
			isExpanded={ isExpanded }
			onToggle={ onToggle }
			cardData={ cardData }
			toggleTooltip={ __( 'We keep your forms protected', 'jetpack-forms' ) }
		>
			{ ! akismetActiveWithKey ? (
				<div>
					<p className="integration-card__description">
						{ createInterpolateElement(
							__(
								'Akismet is active. There is one step left. Please add your <a>Akismet key</a>.',
								'jetpack-forms'
							),
							{
								a: <ExternalLink href={ settingsUrl } />,
							}
						) }
					</p>
					<Button
						variant="secondary"
						href={ settingsUrl }
						target="_blank"
						rel="noopener noreferrer"
						__next40pxDefaultSize={ true }
					>
						{ __( 'Add Akismet key', 'jetpack-forms' ) }
					</Button>
				</div>
			) : (
				<div>
					<p className="integration-card__description">
						{ __( 'Your forms are automatically protected with Akismet.', 'jetpack-forms' ) }
					</p>
					<div className="integration-card__links">
						<Button
							variant="link"
							href={ formSubmissionsUrl }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ __( 'View spam', 'jetpack-forms' ) }
						</Button>
						<span>|</span>
						<Button variant="link" href={ settingsUrl } target="_blank" rel="noopener noreferrer">
							{ __( 'View stats and settings', 'jetpack-forms' ) }
						</Button>
						<span>|</span>
						<ExternalLink href={ getRedirectUrl( 'akismet-jetpack-forms-docs' ) }>
							{ __( 'Learn about Akismet', 'jetpack-forms' ) }
						</ExternalLink>
					</div>
				</div>
			) }
		</IntegrationCard>
	);
};

export default AkismetDashboardCard;
