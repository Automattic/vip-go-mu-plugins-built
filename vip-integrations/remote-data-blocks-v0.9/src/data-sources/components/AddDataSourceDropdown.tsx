import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { SUPPORTED_SERVICES_LABELS } from '@/data-sources/constants';
import { useSettingsContext } from '@/settings/hooks/useSettingsNav';
import { AirtableIcon } from '@/settings/icons/AirtableIcon';
import { GoogleSheetsIcon } from '@/settings/icons/GoogleSheetsIcon';
import HttpIcon from '@/settings/icons/HttpIcon';
import SalesforceCommerceD2CIcon from '@/settings/icons/SalesforceCommerceD2CIcon';
import { ShopifyIcon } from '@/settings/icons/ShopifyIcon';

import '../DataSourceList.scss';

export const AddDataSourceDropdown = () => {
	const { pushState } = useSettingsContext();

	function onAddDataSource( dataSource: string ) {
		const newUrl = new URL( window.location.href );
		newUrl.searchParams.set( 'addDataSource', dataSource );
		pushState( newUrl );
	}

	return (
		<DropdownMenu
			className="rdb-settings-page_add-data-source-dropdown"
			icon={ null }
			label={ __( 'Connect new data source', 'remote-data-blocks' ) }
			popoverProps={ {
				offset: 8,
			} }
			text={ __( 'Connect New', 'remote-data-blocks' ) }
			toggleProps={ {
				className: 'rdb-settings-page_add-data-source-btn',
				variant: 'primary',
				showTooltip: false,
				__next40pxDefaultSize: true,
			} }
			children={ ( { onClose } ) => (
				<MenuGroup>
					{ [
						{
							icon: AirtableIcon,
							label: SUPPORTED_SERVICES_LABELS.airtable,
							value: 'airtable',
						},
						{
							icon: GoogleSheetsIcon,
							label: SUPPORTED_SERVICES_LABELS[ 'google-sheets' ],
							value: 'google-sheets',
						},
						{
							icon: ShopifyIcon,
							label: SUPPORTED_SERVICES_LABELS.shopify,
							value: 'shopify',
						},
						{
							icon: SalesforceCommerceD2CIcon,
							label: SUPPORTED_SERVICES_LABELS[ 'salesforce-d2c' ],
							value: 'salesforce-d2c',
						},
						{
							icon: HttpIcon,
							label: SUPPORTED_SERVICES_LABELS[ 'generic-http' ],
							value: 'generic-http',
						},
					].map( ( { icon, label, value } ) => (
						<div key={ value } className="rdb-settings-page_add-data-source-btn-wrapper">
							<MenuItem
								className={ `rdb-settings-page_add-data-source-btn-${ value }` }
								icon={ icon }
								iconPosition="left"
								onClick={ () => {
									onAddDataSource( value );
									onClose();
								} }
							>
								{ label }
							</MenuItem>
						</div>
					) ) }
				</MenuGroup>
			) }
		/>
	);
};
