/**
 * WordPress dependencies
 */
import {
	Button,
	DropdownMenu,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';

/**
 * PerformanceStatPanel component props.
 *
 * @since 3.14.0
 */
type PerformanceStatPanelProps = {
	title: string;
	icon?: JSX.Element;
	subtitle?: string;
	level?: Parameters<typeof Heading>[0]['level'];
	children: ReactNode;
	controls?: Parameters<typeof DropdownMenu>[0]['controls'];
	dropdownChildren?: Parameters<typeof DropdownMenu>[0]['children'];
	onClick?: () => void;
	isOpen?: boolean;
	isLoading?: boolean;
}

/**
 * The PerformanceStatPanel component.
 * This component is the raw panel used to display performance stats.
 *
 * If `dropdownChildren` is set, it will be used as the DropdownMenu.
 * if `controls` is set, it will be used to render the DropdownMenu.
 *
 * @since 3.14.0
 *
 * @param {PerformanceStatPanelProps} props The component's props.
 *
 * @return {JSX.Element} The PerformanceStatPanel JSX Element.
 */
export const PerformanceStatPanel = (
	{ title,
		icon,
		subtitle,
		level = 2,
		children,
		controls,
		onClick,
		isOpen,
		isLoading,
		dropdownChildren }: Readonly<PerformanceStatPanelProps>
): JSX.Element => {
	return (
		<div className="performance-stat-panel">
			<HStack className={ 'panel-header level-' + level }>
				<Heading level={ level }>{ title }</Heading>
				{ subtitle && ! isOpen &&
					<span className="panel-subtitle">{ subtitle }</span>
				}
				{ ( controls && ! dropdownChildren ) && (
					<DropdownMenu
						icon={ icon }
						label={ __( 'Settings', 'wp-parsely' ) }
						className="panel-settings-button"
						controls={ controls }
					/>
				) }
				{ dropdownChildren && (
					<DropdownMenu
						icon={ icon }
						label={ __( 'Settings', 'wp-parsely' ) }
						className="panel-settings-button"
						children={ dropdownChildren }
					/>
				) }
				{ icon && ! dropdownChildren && ! controls && (
					<Button
						icon={ icon }
						className="panel-settings-button"
						isPressed={ isOpen }
						onClick={ onClick }
					/>
				) }
			</HStack>
			<div className="panel-body">
				{ isLoading ? (
					<div
						className="parsely-spinner-wrapper"
						data-testid="parsely-spinner-wrapper"
					>
						<Spinner />
					</div>
				) : ( children ) }
			</div>
		</div>
	);
};
