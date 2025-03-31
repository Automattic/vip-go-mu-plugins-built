import { SelectControl } from '@wordpress/components';
import { InputChangeCallback } from '@wordpress/components/build-types/input-control/types';
import { __ } from '@wordpress/i18n';
import { ChangeEvent } from 'react';

import { getAirtableOutputQueryMappingValues } from '@/data-sources/airtable/utils';
import { DataSourceForm } from '@/data-sources/components/DataSourceForm';
import { FieldsSelection } from '@/data-sources/components/FieldsSelection';
import PasswordInputControl from '@/data-sources/components/PasswordInputControl';
import { ConfigSource } from '@/data-sources/constants';
import {
	useAirtableApiBases,
	useAirtableApiTables,
	useAirtableApiUserId,
} from '@/data-sources/hooks/useAirtable';
import { useDataSources } from '@/data-sources/hooks/useDataSources';
import {
	AirtableConfig,
	AirtableServiceConfig,
	AirtableTableConfig,
	SettingsComponentProps,
} from '@/data-sources/types';
import { getConnectionMessage } from '@/data-sources/utils';
import { useForm } from '@/hooks/useForm';
import { AirtableIcon, AirtableIconWithText } from '@/settings/icons/AirtableIcon';
import { SelectOption } from '@/types/input';

const SERVICE_CONFIG_VERSION = 1;

const defaultSelectBaseOption: SelectOption = {
	disabled: true,
	label: __( 'Auto-filled on successful connection.', 'remote-data-blocks' ),
	value: '',
};

// eslint-disable-next-line complexity
export const AirtableSettings = ( {
	mode,
	uuid,
	config,
}: SettingsComponentProps< AirtableConfig > ) => {
	const { onSave } = useDataSources< AirtableConfig >( false );

	const { state, handleOnChange, validState } = useForm< AirtableServiceConfig >( {
		initialValues: config?.service_config ?? {
			__version: SERVICE_CONFIG_VERSION,
			enable_blocks: true,
		},
	} );
	const { fetchingUserId, userId, userIdError } = useAirtableApiUserId( state.access_token ?? '' );
	const { bases, basesError, fetchingBases } = useAirtableApiBases(
		state.access_token ?? '',
		userId ?? ''
	);
	const { fetchingTables, tables, tablesError } = useAirtableApiTables(
		state.access_token ?? '',
		state.base?.id ?? ''
	);

	const availableTables = tables?.length ? tables?.map( table => table.name ) : [];
	const selectedTables = state.tables?.map( table => table.name ) ?? [];

	const baseOptions = [
		{
			...defaultSelectBaseOption,
			label: __( 'Select a base', 'remote-data-blocks' ),
		},
		...( bases ?? [] ).map( ( { name, id } ) => ( { label: name, value: id } ) ),
	];

	const onSaveClick = async () => {
		if ( ! validState || ! selectedTables?.length ) {
			return;
		}

		const airtableConfig: AirtableConfig = {
			service: 'airtable',
			service_config: validState,
			uuid: uuid ?? null,
			config_source: ConfigSource.STORAGE,
		};

		return onSave( airtableConfig, mode );
	};

	const onTokenInputChange: InputChangeCallback = ( token: string | undefined ) => {
		handleOnChange( 'access_token', token ?? '' );
		handleOnChange( 'tables', [] );
		handleOnChange( 'base', undefined );
	};

	const onBaseChange = ( value: string, extra?: { event?: ChangeEvent< HTMLSelectElement > } ) => {
		if ( extra?.event ) {
			const { id } = extra.event.target;
			if ( id === 'base' ) {
				const selectedBase = bases?.find( base => base.id === value );
				handleOnChange( 'base', { id: value, name: selectedBase?.name ?? '' } );
				handleOnChange( 'tables', [] );
				return;
			}

			handleOnChange( id, value );
		}
	};

	const onTablesChange = ( tablesNames: string[] ) => {
		let newTables: AirtableTableConfig[] = [];

		if ( tables?.length ) {
			newTables = tables
				?.filter( table => tablesNames.includes( table.name ) )
				.map( table => ( {
					id: table.id,
					name: table.name,
					output_query_mappings: getAirtableOutputQueryMappingValues( table.fields ),
				} ) );
		}

		handleOnChange( 'tables', newTables );
	};

	let connectionMessage: React.ReactNode = (
		<span>
			<a href="https://support.airtable.com/docs/creating-personal-access-tokens" target="_label">
				{ __( 'How do I get my token?', 'remote-data-blocks' ) }
			</a>
		</span>
	);

	if ( fetchingUserId ) {
		connectionMessage = __( 'Validating connection...', 'remote-data-blocks' );
	} else if ( userIdError ) {
		connectionMessage = getConnectionMessage(
			'error',
			__( 'Connection failed. Please verify your access token.', 'remote-data-blocks' )
		);
	} else if ( userId ) {
		connectionMessage = getConnectionMessage(
			'success',
			__( 'Connection successful.', 'remote-data-blocks' )
		);
	}

	const shouldAllowContinue = userId !== null;
	const shouldAllowSubmit =
		bases !== null && tables !== null && Boolean( state.base ) && Boolean( selectedTables?.length );

	let basesHelpText: React.ReactNode = 'Select a base from which to fetch data.';
	if ( userId ) {
		if ( basesError ) {
			basesHelpText = __(
				'Failed to fetch bases. Please check that your access token has the `schema.bases:read` Scope.'
			);
		} else if ( fetchingBases ) {
			basesHelpText = __( 'Fetching bases...' );
		} else if ( bases?.length === 0 ) {
			basesHelpText = __( 'No bases found.' );
		}
	}

	let tablesHelpText: string = __( 'Auto-filled on valid base.', 'remote-data-blocks' );
	if ( bases?.length && state.base ) {
		if ( tablesError ) {
			tablesHelpText = __(
				'Failed to fetch tables. Please check that your access token has the `schema.tables:read` Scope.',
				'remote-data-blocks'
			);
		} else if ( fetchingTables ) {
			tablesHelpText = __( 'Fetching tables...', 'remote-data-blocks' );
		} else if ( ! tables?.length ) {
			tablesHelpText = __( 'No tables found', 'remote-data-blocks' );
		} else {
			tablesHelpText = __( 'Select tables to attach with this data source.', 'remote-data-blocks' );
		}
	}

	return (
		<>
			<DataSourceForm onSave={ onSaveClick }>
				<DataSourceForm.Setup
					displayName={ state.display_name ?? '' }
					handleOnChange={ handleOnChange }
					heading={ { icon: AirtableIconWithText, width: '113.81px', height: '25px' } }
					inputIcon={ AirtableIcon }
					canProceed={ shouldAllowContinue }
					uuid={ uuid }
				>
					<PasswordInputControl
						label={ __( 'Access Token', 'remote-data-blocks' ) }
						onChange={ onTokenInputChange }
						value={ state.access_token }
						help={ connectionMessage }
					/>
				</DataSourceForm.Setup>
				<DataSourceForm.Scope canProceed={ shouldAllowSubmit }>
					<SelectControl
						id="base"
						label={ __( 'Base', 'remote-data-blocks' ) }
						value={ state.base?.id ?? '' }
						onChange={ onBaseChange }
						options={ baseOptions }
						help={ basesHelpText }
						disabled={ fetchingBases || ! bases?.length }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<FieldsSelection
						label={ __( 'Tables', 'remote-data-blocks' ) }
						customHelpText={ tablesHelpText }
						selectedFields={ selectedTables }
						availableFields={ availableTables }
						disabled={ ! availableTables?.length }
						onFieldsChange={ onTablesChange }
					/>
				</DataSourceForm.Scope>
				<DataSourceForm.Blocks
					handleOnChange={ handleOnChange }
					hasEnabledBlocks={ Boolean( state.enable_blocks ) }
				/>
			</DataSourceForm>
		</>
	);
};
