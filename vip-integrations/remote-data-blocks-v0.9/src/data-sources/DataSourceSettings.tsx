import { __ } from '@wordpress/i18n';

import { AirtableSettings } from '@/data-sources/airtable/AirtableSettings';
import { GoogleSheetsSettings } from '@/data-sources/google-sheets/GoogleSheetsSettings';
import { useDataSources } from '@/data-sources/hooks/useDataSources';
import { HttpSettings } from '@/data-sources/http/HttpSettings';
import { SalesforceD2CSettings } from '@/data-sources/salesforce-d2c/SalesforceD2CSettings';
import { ShopifySettings } from '@/data-sources/shopify/ShopifySettings';
import { useSettingsContext } from '@/settings/hooks/useSettingsNav';

import './DataSourceSettings.scss';

interface DataSourceEditSettings {
	uuid: string;
}

const DataSourceEditSettings = ( { uuid }: DataSourceEditSettings ) => {
	const { dataSources, loadingDataSources } = useDataSources();

	if ( loadingDataSources ) {
		return <>{ __( 'Loading data source...', 'remote-data-blocks' ) }</>;
	}

	const dataSource = dataSources.find( source => source.uuid === uuid );

	if ( ! dataSource ) {
		return <>{ __( 'Data Source not found.', 'remote-data-blocks' ) }</>;
	} else if ( 'airtable' === dataSource.service ) {
		return <AirtableSettings mode="edit" uuid={ uuid } config={ dataSource } />;
	} else if ( 'generic-http' === dataSource.service ) {
		return <HttpSettings mode="edit" uuid={ uuid } config={ dataSource } />;
	} else if ( 'google-sheets' === dataSource.service ) {
		return <GoogleSheetsSettings mode="edit" uuid={ uuid } config={ dataSource } />;
	} else if ( 'shopify' === dataSource.service ) {
		return <ShopifySettings mode="edit" uuid={ uuid } config={ dataSource } />;
	} else if ( 'salesforce-d2c' === dataSource.service ) {
		return <SalesforceD2CSettings mode="edit" uuid={ uuid } config={ dataSource } />;
	}

	return <>{ __( 'Service not (yet) supported.', 'remote-data-blocks' ) }</>;
};

const DataSourceSettings = () => {
	const { screen, service, uuid } = useSettingsContext();
	const mode = screen === 'addDataSource' ? 'add' : 'edit';

	if ( 'add' === mode ) {
		if ( 'airtable' === service ) {
			return <AirtableSettings mode="add" />;
		} else if ( 'generic-http' === service ) {
			return <HttpSettings mode="add" />;
		} else if ( 'google-sheets' === service ) {
			return <GoogleSheetsSettings mode="add" />;
		} else if ( 'shopify' === service ) {
			return <ShopifySettings mode="add" />;
		} else if ( 'salesforce-d2c' === service ) {
			return <SalesforceD2CSettings mode="add" />;
		}
		return <>{ __( 'Service not (yet) supported.', 'remote-data-blocks' ) }</>;
	}

	if ( ! uuid ) {
		return <>{ __( 'Data Source not found.', 'remote-data-blocks' ) }</>;
	}

	return <DataSourceEditSettings uuid={ uuid } />;
};
export default DataSourceSettings;
