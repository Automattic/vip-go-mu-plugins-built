import { SelectControl, TextareaControl } from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { DataSourceForm } from '@/data-sources/components/DataSourceForm';
import { FieldsSelection } from '@/data-sources/components/FieldsSelection';
import { GOOGLE_SHEETS_API_SCOPES, ConfigSource } from '@/data-sources/constants';
import { useDataSources } from '@/data-sources/hooks/useDataSources';
import {
	useGoogleSheetsWithFields,
	useGoogleSpreadsheetsOptions,
} from '@/data-sources/hooks/useGoogleApi';
import { useGoogleAuth } from '@/data-sources/hooks/useGoogleAuth';
import {
	DataSourceQueryMappingValue,
	GoogleSheetsConfig,
	GoogleSheetsServiceConfig,
	GoogleSheetsSheetConfig,
	SettingsComponentProps,
} from '@/data-sources/types';
import { getConnectionMessage } from '@/data-sources/utils';
import { useForm, ValidationRules } from '@/hooks/useForm';
import { GoogleSheetsIcon, GoogleSheetsIconWithText } from '@/settings/icons/GoogleSheetsIcon';
import { GoogleServiceAccountKey } from '@/types/google';
import { SelectOption } from '@/types/input';
import { safeParseJSON } from '@/utils/string';

const SERVICE_CONFIG_VERSION = 1;

const defaultSelectOption: SelectOption = {
	disabled: true,
	label: __( 'Select an option', 'remote-data-blocks' ),
	value: '',
};

const validationRules: ValidationRules< GoogleSheetsServiceConfig > = {
	credentials: ( state: Partial< GoogleSheetsServiceConfig > ) => {
		if ( ! state.credentials ) {
			return __(
				'Please provide valid credentials JSON for the service account to connect to Google Sheets.',
				'remote-data-blocks'
			);
		}

		return null;
	},
};

export const GoogleSheetsSettings = ( {
	mode,
	uuid,
	config,
}: SettingsComponentProps< GoogleSheetsConfig > ) => {
	const [ rawCredentials, setRawCredentials ] = useState< string >(
		config?.service_config?.credentials
			? JSON.stringify( config?.service_config?.credentials, null, 2 )
			: ''
	);

	const { onSave } = useDataSources< GoogleSheetsConfig >( false );

	const { state, errors, handleOnChange, validState } = useForm< GoogleSheetsServiceConfig >( {
		initialValues: config?.service_config ?? {
			__version: SERVICE_CONFIG_VERSION,
			enable_blocks: true,
		},
		validationRules,
	} );

	const [ spreadsheetOptions, setSpreadsheetOptions ] = useState< SelectOption[] >( [
		{
			...defaultSelectOption,
			label: __( 'Auto-filled on successful connection.', 'remote-data-blocks' ),
		},
	] );

	const { fetchingToken, token, tokenError } = useGoogleAuth(
		JSON.stringify( state.credentials ) ?? '',
		GOOGLE_SHEETS_API_SCOPES
	);
	const { spreadsheets, isLoadingSpreadsheets, errorSpreadsheets } =
		useGoogleSpreadsheetsOptions( token );
	const { sheets, sheetsWithFields, isLoadingSheets, errorSheets } = useGoogleSheetsWithFields(
		token,
		state.spreadsheet?.id ?? ''
	);

	const availableSheets = sheets?.length ? sheets?.map( sheet => sheet.name ) : [];
	const selectedSheets = state.sheets?.map( sheet => sheet.name ) ?? [];

	const onSaveClick = async () => {
		if ( ! validState ) {
			return;
		}

		const data: GoogleSheetsConfig = {
			service: 'google-sheets',
			service_config: validState,
			uuid: uuid ?? null,
			config_source: ConfigSource.STORAGE,
		};

		return onSave( data, mode );
	};

	const onCredentialsChange = ( nextValue: string ) => {
		setRawCredentials( nextValue );
		const credentials = safeParseJSON< GoogleServiceAccountKey >( nextValue );
		handleOnChange( 'credentials', credentials ?? undefined );
		handleOnChange( 'sheets', [] );
		handleOnChange( 'spreadsheet' );
	};

	const onSpreadsheetChange = ( value: string ) => {
		const selectedSpreadsheet = spreadsheets?.find( spreadsheet => spreadsheet.value === value );
		handleOnChange( 'spreadsheet', { id: value, name: selectedSpreadsheet?.label ?? '' } );
		handleOnChange( 'sheets', [] );
	};

	const onSheetsChange = ( sheetNames: string[] ) => {
		let newSheets: GoogleSheetsSheetConfig[] = [];

		if ( sheetNames.length ) {
			newSheets = sheetNames
				.map( name => {
					const sheet = sheetsWithFields?.get( name );

					if ( ! sheet ) {
						return null;
					}

					const outputQueryMappings: DataSourceQueryMappingValue[] = sheet.fields.map( field => ( {
						key: field,
						name: field,
						path: `$["${ field }"]`,
						type: 'string',
					} ) );

					return {
						id: `${ sheet.id }`,
						name: sheet.name,
						output_query_mappings: outputQueryMappings,
					};
				} )
				.filter( Boolean ) as GoogleSheetsSheetConfig[];
		}

		handleOnChange( 'sheets', newSheets );
	};

	const credentialsHelpText = useMemo( () => {
		if ( fetchingToken ) {
			return __( 'Checking credentials...', 'remote-data-blocks' );
		} else if ( errors.credentials ) {
			return errors.credentials;
		} else if ( tokenError ) {
			const errorMessage = tokenError.message ?? __( 'Unknown error', 'remote-data-blocks' );
			return getConnectionMessage(
				'error',
				__( 'Failed to generate token using provided credentials: ', 'remote-data-blocks' ) +
					' ' +
					errorMessage
			);
		} else if ( token ) {
			return getConnectionMessage(
				'success',
				__( 'Credentials are valid. Token generated successfully.', 'remote-data-blocks' )
			);
		}
		return __(
			'Please provide credentials JSON to connect to Google Sheets.',
			'remote-data-blocks'
		);
	}, [ fetchingToken, token, tokenError, errors.credentials ] );

	const shouldAllowSubmit = state.spreadsheet && state.sheets?.length;

	const spreadsheetHelpText = useMemo( () => {
		if ( token ) {
			if ( errorSpreadsheets ) {
				const errorMessage =
					errorSpreadsheets?.message ?? __( 'Unknown error', 'remote-data-blocks' );
				return __( 'Failed to fetch spreadsheets.', 'remote-data-blocks' ) + ' ' + errorMessage;
			} else if ( isLoadingSpreadsheets ) {
				return __( 'Fetching spreadsheets...', 'remote-data-blocks' );
			} else if ( spreadsheets?.length === 0 ) {
				return __( 'No spreadsheets found', 'remote-data-blocks' );
			}
		}

		return __( 'Select a spreadsheet from which to fetch data.', 'remote-data-blocks' );
	}, [ token, errorSpreadsheets, isLoadingSpreadsheets, spreadsheets ] );

	useEffect( () => {
		if ( ! spreadsheets?.length ) {
			return;
		}

		setSpreadsheetOptions( [
			{
				...defaultSelectOption,
				label: __( 'Select a spreadsheet', 'remote-data-blocks' ),
			},
			...( spreadsheets ?? [] ).map( ( { label, value } ) => ( { label, value } ) ),
		] );
	}, [ spreadsheets ] );

	const getSheetsHelpText = () => {
		if ( token && state.spreadsheet ) {
			if ( errorSheets ) {
				const errorMessage = errorSheets?.message ?? __( 'Unknown error', 'remote-data-blocks' );
				return __( 'Failed to fetch sheets.', 'remote-data-blocks' ) + ' ' + errorMessage;
			}

			if ( isLoadingSheets ) {
				return __( 'Fetching sheets...', 'remote-data-blocks' );
			}

			if ( ! sheets?.length ) {
				return __( 'No sheets found', 'remote-data-blocks' );
			}

			return __( 'Select sheets to attach with this data source.', 'remote-data-blocks' );
		}

		return __( 'Auto-filled on valid spreadsheet.', 'remote-data-blocks' );
	};

	return (
		<DataSourceForm onSave={ onSaveClick }>
			<DataSourceForm.Setup
				canProceed={ Boolean( token ) }
				displayName={ state.display_name ?? '' }
				handleOnChange={ handleOnChange }
				heading={ {
					icon: GoogleSheetsIconWithText,
					width: '191px',
					height: '32px',
					verticalAlign: 'text-top',
				} }
				inputIcon={ GoogleSheetsIcon }
				uuid={ uuid }
			>
				<TextareaControl
					label={ __( 'Credentials', 'remote-data-blocks' ) }
					value={ rawCredentials }
					onChange={ onCredentialsChange }
					help={ credentialsHelpText }
					rows={ 10 }
					className="code-input"
					__nextHasNoMarginBottom
				/>
			</DataSourceForm.Setup>
			<DataSourceForm.Scope canProceed={ Boolean( shouldAllowSubmit ) }>
				<SelectControl
					id="spreadsheet"
					label={ __( 'Spreadsheet', 'remote-data-blocks' ) }
					value={ state.spreadsheet?.id ?? '' }
					onChange={ onSpreadsheetChange }
					options={ spreadsheetOptions }
					help={ spreadsheetHelpText }
					disabled={ fetchingToken || ! spreadsheets?.length }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>

				<FieldsSelection
					label={ __( 'Sheets', 'remote-data-blocks' ) }
					selectedFields={ selectedSheets }
					availableFields={ availableSheets }
					onFieldsChange={ onSheetsChange }
					disabled={ ! availableSheets?.length }
					customHelpText={ getSheetsHelpText() }
				/>
			</DataSourceForm.Scope>
			<DataSourceForm.Blocks
				handleOnChange={ handleOnChange }
				hasEnabledBlocks={ Boolean( state.enable_blocks ) }
			/>
		</DataSourceForm>
	);
};
