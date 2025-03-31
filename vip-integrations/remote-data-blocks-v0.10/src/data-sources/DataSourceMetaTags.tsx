import { Icon, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRightSmall } from '@wordpress/icons';

import { ConfigSource } from '@/data-sources/constants';
import { DataSourceConfig } from '@/data-sources/types';
import './DataSourceList.scss';

interface DataSourceMetaTagsProps {
	source: DataSourceConfig;
}

interface DataSourceMetaTag {
	key: string;
	primaryValue: string;
	secondaryValue?: string;
}

const DataSourceDescriptor = ( props: DataSourceMetaTagsProps ) => {
	let tag: DataSourceMetaTag | undefined;

	switch ( props.source.service ) {
		case 'airtable':
			tag = {
				key: 'base',
				primaryValue: props.source.service_config.base?.name,
			};
			break;
		case 'shopify':
			tag = { key: 'store', primaryValue: props.source.service_config.store_name };
			break;
		case 'google-sheets':
			tag = {
				key: 'spreadsheet',
				primaryValue: props.source.service_config.spreadsheet.name ?? 'Google Sheet',
			};
			break;
	}

	if ( ! tag ) {
		return null;
	}

	return (
		<span key={ tag.key } className="data-source-meta">
			{ tag.primaryValue }
			{ tag.secondaryValue && (
				<>
					<Icon icon={ chevronRightSmall } style={ { fill: '#949494', verticalAlign: 'middle' } } />
					{ tag.secondaryValue }
				</>
			) }
		</span>
	);
};

const CodeBadge = () => {
	return (
		<Tooltip text={ __( 'This data source is configured in code.', 'remote-data-blocks' ) }>
			<span className="data-source-badge">Code</span>
		</Tooltip>
	);
};

const ConstantsBadge = () => {
	return (
		<Tooltip text={ __( 'This data source is configured in constants.', 'remote-data-blocks' ) }>
			<span className="data-source-badge">Constants</span>
		</Tooltip>
	);
};

const DataSourceMetaTags = ( props: DataSourceMetaTagsProps ) => {
	return (
		<>
			{ props.source.config_source === ConfigSource.CODE && <CodeBadge /> }
			{ props.source.config_source === ConfigSource.CONSTANTS && <ConstantsBadge /> }
			<DataSourceDescriptor source={ props.source } />
		</>
	);
};

export default DataSourceMetaTags;
