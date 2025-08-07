/**
 * External dependencies
 */
import jetpackAnalytics from '@automattic/jetpack-analytics';
import { Badge } from '@automattic/ui';
import '@automattic/ui/style.css';
/**
 * Internal dependencies
 */
import {
	CardHeader,
	Icon,
	ToggleControl,
	Tooltip,
	__experimentalHStack as HStack, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import PluginActionButton from './plugin-action-button';
/**
 * Types
 */
import type { IntegrationCardProps } from './index';
import type { MouseEvent } from 'react';

const IntegrationCardHeader = ( {
	title,
	description,
	icon,
	isExpanded,
	onToggle,
	cardData = {},
	toggleTooltip,
}: IntegrationCardProps ) => {
	const {
		isInstalled,
		isActive,
		isConnected,
		needsConnection,
		type,
		showHeaderToggle,
		headerToggleValue,
		isHeaderToggleEnabled,
		onHeaderToggleChange,
		toggleDisabledTooltip,
		setupBadge,
	} = cardData;
	const showPluginAction = type === 'plugin' && ( ! isInstalled || ! isActive );
	const showConnectedBadge = isConnected || ( isActive && ! needsConnection );
	const disableFormText = __( 'Disable for this form', 'jetpack-forms' );
	const enableFormText = __( 'Enable for this form', 'jetpack-forms' );

	const showPendingBadge = ! showPluginAction && ! isConnected && needsConnection;

	const installPluginActionLabel = __( 'Plugin needs install', 'jetpack-forms' );
	const activatePluginActionLabel = __( 'Plugin needs activation', 'jetpack-forms' );
	const pluginActionLabel = ! isInstalled ? installPluginActionLabel : activatePluginActionLabel;

	const getTooltipText = checked => {
		if ( toggleTooltip ) {
			return toggleTooltip;
		}

		if ( checked ) {
			return disableFormText;
		}

		return enableFormText;
	};

	const handleToggleChange = ( value: boolean ) => {
		jetpackAnalytics.tracks.recordEvent( 'jetpack_forms_integrations_card_toggle', {
			card: cardData.id,
			origin: 'block-editor',
			enabled: value,
		} );

		if ( onHeaderToggleChange ) {
			onHeaderToggleChange( value );
		}
	};

	const handleHeaderClick = ( e: MouseEvent< HTMLDivElement > ) => {
		// Without this, toggle click bubbles and opens/closes the card.
		if ( ( e.target as HTMLElement ).closest( '.components-form-toggle' ) ) {
			return;
		}

		onToggle();
	};

	return (
		<CardHeader onClick={ handleHeaderClick } className="integration-card__header">
			<div className="integration-card__header-content">
				<div className="integration-card__header-main">
					<div className="integration-card__service-icon-container">
						<Icon
							icon={ icon }
							className={ `integration-card__service-icon ${
								cardData.slug ? `integration-card__service-icon--${ cardData.slug }` : ''
							}` }
							size={ 30 }
						/>
					</div>
					<div className="integration-card__title-section">
						<h3 className="integration-card__title">{ title }</h3>
						{ description && (
							<span className="integration-card__description">{ description }</span>
						) }
						{ showPluginAction && (
							<Badge
								intent={ isInstalled && ! isActive ? 'warning' : 'default' }
								className="integration-card__plugin-badge"
							>
								{ pluginActionLabel }
							</Badge>
						) }
						{ showConnectedBadge && (
							<Badge intent="success" className="integration-card__connected-badge">
								{ __( 'Enabled', 'jetpack-forms' ) }
							</Badge>
						) }
						{ showPendingBadge &&
							( setupBadge || (
								<Badge intent="warning" className="integration-card__setup-badge">
									{ __( 'Needs connection', 'jetpack-forms' ) }
								</Badge>
							) ) }
					</div>
				</div>
				<HStack
					className="integration-card__header-actions"
					spacing="3"
					alignment="center"
					justify="end"
					expanded={ false }
				>
					{ showPluginAction && (
						<PluginActionButton
							slug={ cardData.slug }
							pluginFile={ cardData.pluginFile }
							isInstalled={ isInstalled }
							refreshStatus={ cardData.refreshStatus }
							trackEventName={ cardData.trackEventName }
						/>
					) }
					{ ! showPluginAction && showHeaderToggle && (
						<Tooltip
							text={
								! isHeaderToggleEnabled && toggleDisabledTooltip
									? toggleDisabledTooltip
									: getTooltipText( headerToggleValue )
							}
						>
							<span className="integration-card__toggle-tooltip-wrapper">
								<ToggleControl
									checked={ headerToggleValue && ( isActive || isConnected ) }
									onChange={ handleToggleChange }
									disabled={ ! isHeaderToggleEnabled || ! ( isActive || isConnected ) }
									__nextHasNoMarginBottom={ true }
								/>
							</span>
						</Tooltip>
					) }
					<Icon icon={ isExpanded ? chevronUp : chevronDown } />
				</HStack>
			</div>
		</CardHeader>
	);
};

export default IntegrationCardHeader;
