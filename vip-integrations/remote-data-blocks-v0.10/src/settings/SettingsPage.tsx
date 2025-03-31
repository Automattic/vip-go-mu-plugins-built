import { Button, ExternalLink, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';

import DataSourceList from '@/data-sources/DataSourceList';
import DataSourceSettings from '@/data-sources/DataSourceSettings';
import { AddDataSourceDropdown } from '@/data-sources/components/AddDataSourceDropdown';
import Notices from '@/settings/Notices';
import { SettingsContext, useDataSourceRouter } from '@/settings/hooks/useSettingsNav';

const SettingsPage = () => {
	const settingsContext = useDataSourceRouter();

	const addOrEditScreen = [ 'addDataSource', 'editDataSource' ].includes( settingsContext.screen );

	return (
		<div className="rdb-settings-page">
			<Notices />

			<SettingsContext.Provider value={ settingsContext }>
				<div className="rdb-settings-page_header">
					{ addOrEditScreen ? (
						<HStack justify="flex-start">
							<Button icon={ chevronLeft } onClick={ () => settingsContext.goToMainScreen() } />
							<HStack>
								<h2>
									{ __(
										`${
											[ 'addDataSource' ].includes( settingsContext.screen ) ? 'New ' : 'Edit'
										} Data Source`,
										'remote-data-blocks'
									) }
								</h2>
								<HStack expanded={ false } justify="flex-end" spacing={ 3 }>
									<div id="rdb-settings-page-form-save-button" />
									<div id="rdb-settings-page-form-settings" />
								</HStack>
							</HStack>
						</HStack>
					) : (
						<>
							<h1>{ __( 'Data sources', 'remote-data-blocks' ) }</h1>
							<p>
								{ __(
									'Add and manage data sources used for blocks and content across your site. '
								) }
								<ExternalLink href="https://remotedatablocks.com/">
									{ __( 'Learn more', 'remote-data-blocks' ) }
								</ExternalLink>
							</p>
							<AddDataSourceDropdown />
						</>
					) }
				</div>
				<div
					className={ `rdb-settings-page_content ${
						addOrEditScreen ? 'rdb-settings-page_add-edit' : 'rdb-settings-page_sources'
					}` }
				>
					{ addOrEditScreen ? <DataSourceSettings /> : <DataSourceList /> }
				</div>
			</SettingsContext.Provider>
		</div>
	);
};

export default SettingsPage;
