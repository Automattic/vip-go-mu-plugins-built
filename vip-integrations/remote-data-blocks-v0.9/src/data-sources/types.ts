import { SUPPORTED_SERVICES, ConfigSource } from '@/data-sources/constants';
import { HttpAuth } from '@/data-sources/http/types';
import { StringIdName } from '@/types/common';
import { GoogleServiceAccountKey } from '@/types/google';

export type DataSourceType = ( typeof SUPPORTED_SERVICES )[ number ];

interface BaseServiceConfig extends Record< string, unknown > {
	__version: number;
	display_name: string;
	enable_blocks: boolean;
}
interface BaseDataSourceConfig<
	ServiceName extends DataSourceType,
	ServiceConfig extends BaseServiceConfig
> {
	service: ServiceName;
	service_config: ServiceConfig;
	uuid: string | null;
	config_source: ConfigSource;
}

export interface DataSourceQueryMappingValue {
	key: string;
	name?: string;
	path?: string;
	type?: string;
	prefix?: string;
}

export interface AirtableTableConfig extends StringIdName {
	output_query_mappings: DataSourceQueryMappingValue[];
}

export interface AirtableServiceConfig extends BaseServiceConfig {
	access_token: string;
	base: StringIdName;
	tables: AirtableTableConfig[];
}

export interface GoogleSheetsSheetConfig extends StringIdName {
	output_query_mappings: DataSourceQueryMappingValue[];
}

export interface GoogleSheetsServiceConfig extends BaseServiceConfig {
	credentials: GoogleServiceAccountKey;
	spreadsheet: StringIdName;
	sheets: GoogleSheetsSheetConfig[];
}

export interface HttpServiceConfig extends BaseServiceConfig {
	auth?: HttpAuth;
	endpoint: string;
}

export interface SalesforceD2CStoreConfig extends StringIdName {
	output_query_mappings: DataSourceQueryMappingValue[];
}

export interface SalesforceD2CServiceConfig extends BaseServiceConfig {
	client_id: string;
	client_secret: string;
	store_id: string;
	domain: string;
}

export interface SalesforceD2CWebStoreRecord {
	/** The name of the WebStore */
	name: string;
	/** The unique identifier for the WebStore */
	id: string;
}

export interface SalesforceD2CWebStoresResponse {
	webstores: SalesforceD2CWebStoreRecord[];
}

export interface ShopifyServiceConfig extends BaseServiceConfig {
	access_token: string;
	store_name: string;
}

export type AirtableConfig = BaseDataSourceConfig< 'airtable', AirtableServiceConfig >;
export type GoogleSheetsConfig = BaseDataSourceConfig< 'google-sheets', GoogleSheetsServiceConfig >;
export type HttpConfig = BaseDataSourceConfig< 'generic-http', HttpServiceConfig >;
export type SalesforceD2CConfig = BaseDataSourceConfig<
	'salesforce-d2c',
	SalesforceD2CServiceConfig
>;
export type ShopifyConfig = BaseDataSourceConfig< 'shopify', ShopifyServiceConfig >;

export type DataSourceConfig =
	| AirtableConfig
	| GoogleSheetsConfig
	| HttpConfig
	| SalesforceD2CConfig
	| ShopifyConfig;

export type SettingsComponentProps< T extends DataSourceConfig > = {
	mode: 'add' | 'edit';
	uuid?: string;
	config?: T;
};
