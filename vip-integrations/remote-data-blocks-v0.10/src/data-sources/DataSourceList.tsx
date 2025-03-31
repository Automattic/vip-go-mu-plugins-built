import {
	__experimentalConfirmDialog as ConfirmDialog,
	ExternalLink,
	Icon,
	Placeholder,
	TabPanel,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';

import CodeSnippet from './components/CodeSnippet';
import { BaseModal } from '@/blocks/remote-data-container/components/modals/BaseModal';
import { useModalState } from '@/blocks/remote-data-container/hooks/useModalState';
import DataSourceMetaTags from '@/data-sources/DataSourceMetaTags';
import {
	ConfigSource,
	SUPPORTED_SERVICES,
	SUPPORTED_SERVICES_LABELS,
} from '@/data-sources/constants';
import { useDataSources } from '@/data-sources/hooks/useDataSources';
import { DataSourceConfig } from '@/data-sources/types';
import { useSettingsContext } from '@/settings/hooks/useSettingsNav';
import { AirtableIcon } from '@/settings/icons/AirtableIcon';
import { GoogleSheetsIcon } from '@/settings/icons/GoogleSheetsIcon';
import HttpIcon from '@/settings/icons/HttpIcon';
import SalesforceCommerceD2CIcon from '@/settings/icons/SalesforceCommerceD2CIcon';
import { ShopifyIcon } from '@/settings/icons/ShopifyIcon';

import type { Action, Field, View } from '@wordpress/dataviews/wp';

import './DataSourceList.scss';

const DataSourceList = () => {
	const {
		dataSources,
		loadingDataSources,
		deleteDataSource,
		deleteMultipleDataSources,
		fetchDataSources,
		getDataSourceSnippet,
		addDataSource,
		showSnackbar,
	} = useDataSources();
	const [ dataSourceToDelete, setDataSourceToDelete ] = useState<
		DataSourceConfig | DataSourceConfig[] | null
	>( null );
	const [ codeSnippets, setCodeSnippets ] = useState<
		{
			name: string;
			code: string;
		}[]
	>( [] );
	const [ currentSource, setCurrentSource ] = useState< DataSourceConfig | null >( null );
	const { close, isOpen, open } = useModalState();
	const { pushState } = useSettingsContext();

	const onCancelDeleteDialog = () => {
		setDataSourceToDelete( null );
	};

	const onDeleteDataSource = ( source: DataSourceConfig | DataSourceConfig[] ) =>
		setDataSourceToDelete( source );

	const onEditDataSource = ( uuidToEdit: string ) => {
		const newUrl = new URL( window.location.href );
		newUrl.searchParams.set( 'editDataSource', uuidToEdit );
		pushState( newUrl );
	};

	const onConfirmDeleteDataSource = async ( source: DataSourceConfig | DataSourceConfig[] ) => {
		if ( Array.isArray( source ) ) {
			await deleteMultipleDataSources( source );
		} else {
			await deleteDataSource( source );
		}
		setDataSourceToDelete( null );
		await fetchDataSources().catch( () => null );
	};

	const getServiceLabel = ( service: ( typeof SUPPORTED_SERVICES )[ number ] ) => {
		// eslint-disable-next-line security/detect-object-injection
		return SUPPORTED_SERVICES_LABELS[ service ] ?? 'HTTP';
	};

	const getServiceIcon = (
		service: ( typeof SUPPORTED_SERVICES )[ number ]
	): React.ReactElement => {
		switch ( service ) {
			case 'airtable':
				return AirtableIcon;
			case 'shopify':
				return ShopifyIcon;
			case 'google-sheets':
				return GoogleSheetsIcon;
			case 'salesforce-d2c':
				return SalesforceCommerceD2CIcon;
			default:
				return HttpIcon;
		}
	};

	const [ view, setView ] = useState< View >( {
		type: 'table',
		perPage: 10,
		page: 1,
		search: '',
		fields: [ 'display_name', 'service', 'meta' ],
		filters: [],
		layout: {},
	} );

	const fields: Field< DataSourceConfig >[] = [
		{
			id: 'display_name',
			label: __( 'Source', 'remote-data-blocks' ),
			enableGlobalSearch: true,
			render: ( { item }: { item: DataSourceConfig } ) => {
				return (
					<>
						<Icon
							icon={ getServiceIcon( item.service ) }
							style={ { marginRight: '16px', verticalAlign: 'text-bottom' } }
						/>
						{ item.service_config.display_name }
					</>
				);
			},
		},
		{
			id: 'service',
			label: __( 'Service', 'remote-data-blocks' ),
			enableGlobalSearch: true,
			elements: SUPPORTED_SERVICES.map( service => ( {
				value: service,
				label: getServiceLabel( service ),
			} ) ),
		},
		{
			id: 'meta',
			label: __( 'Meta', 'remote-data-blocks' ),
			enableGlobalSearch: true,
			render: ( { item }: { item: DataSourceConfig } ) => <DataSourceMetaTags source={ item } />,
		},
	];

	// filter, sort and paginate data
	const { DataViews, filterSortAndPaginate } = window.LockedPrivateDataViews;
	const { data: shownData, paginationInfo } = filterSortAndPaginate( dataSources, view, fields );

	const defaultLayouts = {
		table: {},
	};

	const isItemEligibleForActions = ( item: DataSourceConfig ) => {
		return item.config_source === ConfigSource.STORAGE;
	};

	const actions: Action< DataSourceConfig >[] = [
		{
			id: 'edit',
			label: __( 'Edit', 'remote-data-blocks' ),
			icon: 'edit',
			isPrimary: true,
			isEligible: isItemEligibleForActions,
			callback: ( [ item ]: DataSourceConfig[] ) => {
				if ( item?.uuid ) {
					onEditDataSource( item.uuid );
				}
			},
		},
		{
			id: 'copy',
			label: __( 'Copy UUID', 'remote-data-blocks' ),
			icon: 'copy',
			isEligible: isItemEligibleForActions,
			callback: ( [ item ]: DataSourceConfig[] ) => {
				if ( item && item.uuid ) {
					navigator.clipboard
						.writeText( item.uuid )
						.then( () => {
							showSnackbar(
								'success',
								__( 'Copied data source UUID to the clipboard.', 'remote-data-blocks' )
							);
						} )
						.catch( () =>
							showSnackbar( 'error', __( 'Failed to copy to clipboard.', 'remote-data-blocks' ) )
						);
				}
			},
		},
		{
			id: 'delete',
			label: __( 'Delete', 'remote-data-blocks' ),
			icon: 'trash',
			isDestructive: true,
			isEligible: isItemEligibleForActions,
			callback: ( items: DataSourceConfig[] ) => {
				if ( items.length === 1 ) {
					if ( items[ 0 ] ) {
						onDeleteDataSource( items[ 0 ] );
					}
				} else if ( items.length > 1 ) {
					onDeleteDataSource( items );
				}
			},
			supportsBulk: true,
		},
		{
			id: 'duplicate',
			label: __( 'Duplicate', 'remote-data-blocks' ),
			isEligible: isItemEligibleForActions,
			callback: ( [ item ]: DataSourceConfig[] ) => {
				if ( item ) {
					const duplicatedSource = {
						...item,
						uuid: null,
						service: item.service,
						service_config: {
							...item.service_config,
							display_name: item.service_config.display_name + __( ' copy', 'remote-data-blocks' ),
						} as DataSourceConfig[ 'service_config' ],
					};
					addDataSource( duplicatedSource as DataSourceConfig )
						.then( result => {
							if ( result && result.uuid ) {
								return onEditDataSource( result.uuid );
							}
						} )
						.catch( () => {
							showSnackbar(
								'error',
								__( 'Failed to duplicate data source.', 'remote-data-blocks' )
							);
						} );
				}
			},
		},
		{
			id: 'view-code',
			label: __( 'View Code', 'remote-data-blocks' ),
			isEligible: isItemEligibleForActions,
			callback: ( [ item ]: DataSourceConfig[] ) => {
				if ( item?.uuid ) {
					setCurrentSource( item );
					getDataSourceSnippet( item.uuid )
						.then( snippets => {
							if ( snippets ) {
								setCodeSnippets( snippets );
								open();
							}
						} )
						.catch( () => {
							showSnackbar( 'error', __( 'Failed to load code snippets.', 'remote-data-blocks' ) );
						} );
				}
			},
		},
	];

	if ( dataSources.length === 0 ) {
		return (
			<Placeholder
				icon={ info }
				label={ __( 'No data source found.', 'remote-data-blocks' ) }
				instructions={ __(
					'Use the "Connect New" button to add a data source.',
					'remote-data-blocks'
				) }
			/>
		);
	}

	return (
		<>
			<DataViews
				actions={ actions }
				data={ shownData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				paginationInfo={ paginationInfo }
				defaultLayouts={ defaultLayouts }
				getItemId={ ( item: DataSourceConfig ) => item.uuid ?? `not-persisted-${ Math.random() }` }
				isLoading={ loadingDataSources }
			/>
			{ dataSourceToDelete && (
				<ConfirmDialog
					confirmButtonText={ __( 'Confirm', 'remote-data-blocks' ) }
					onCancel={ () => onCancelDeleteDialog() }
					onConfirm={ () => void onConfirmDeleteDataSource( dataSourceToDelete ) }
					size="medium"
					title={ __( 'Delete Data Source', 'remote-data-blocks' ) }
				>
					{ Array.isArray( dataSourceToDelete )
						? __(
								'Are you sure you want to delete the selected data sources?',
								'remote-data-blocks'
						  )
						: sprintf(
								__( 'Are you sure you want to delete %s data source "%s"?', 'remote-data-blocks' ),
								getServiceLabel( dataSourceToDelete.service ),
								dataSourceToDelete.service_config.display_name
						  ) }
				</ConfirmDialog>
			) }
			{ codeSnippets && isOpen && (
				<BaseModal
					className="rdb-settings-page_data-source-code-snippet-modal"
					icon={ getServiceIcon( currentSource?.service ?? 'generic-http' ) }
					title={ __(
						`${ currentSource?.service_config.display_name }: Data Source Code`,
						'remote-data-blocks'
					) }
					onClose={ () => {
						close();
						setCodeSnippets( [] ); // Clear snippets when closing
					} }
				>
					<>
						<p style={ { marginBottom: '16px', padding: '0 8px' } }>
							{ __(
								"Below, you'll find the code used to register the block(s) for this data source, which can be used as a reference for extending the data source.\nTo get started, copy the code below and add it to your plugin directory. "
							) }
							<ExternalLink href="https://remotedatablocks.com/docs/extending/index/">
								{ __( 'Learn more about extending', 'remote-data-blocks' ) }
							</ExternalLink>
						</p>
						<TabPanel
							className="rdb-settings-page_data-source-code-snippet"
							tabs={ codeSnippets.map( ( { name } ) => ( {
								name,
								title: name,
							} ) ) }
						>
							{ tab => {
								return (
									<CodeSnippet
										code={ codeSnippets.find( snippet => snippet.name === tab.name )?.code ?? '' }
									/>
								);
							} }
						</TabPanel>
					</>
				</BaseModal>
			) }
		</>
	);
};

export default DataSourceList;
