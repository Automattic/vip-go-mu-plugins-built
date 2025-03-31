import { SelectControl, TextControl } from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { DataSourceForm } from '@/data-sources/components/DataSourceForm';
import { ConfigSource } from '@/data-sources/constants';
import { useDataSources } from '@/data-sources/hooks/useDataSources';
import { useSalesforceD2CAuth } from '@/data-sources/hooks/useSalesforceD2CAuth';
import {
	SalesforceD2CConfig,
	SalesforceD2CServiceConfig,
	SettingsComponentProps,
} from '@/data-sources/types';
import { getConnectionMessage } from '@/data-sources/utils';
import { useForm, ValidationRules } from '@/hooks/useForm';
import SalesforceCommerceD2CIcon from '@/settings/icons/SalesforceCommerceD2CIcon';
import { SelectOption } from '@/types/input';

const SERVICE_CONFIG_VERSION = 1;

const defaultSelectOption: SelectOption = {
	disabled: true,
	label: __( 'Select an option', 'remote-data-blocks' ),
	value: '',
};

const validationRules: ValidationRules< SalesforceD2CServiceConfig > = {
	client_id: ( state: Partial< SalesforceD2CServiceConfig > ) => {
		if ( ! state.client_id ) {
			return __( 'Please provide a valid client ID.', 'remote-data-blocks' );
		}

		return null;
	},

	client_secret: ( state: Partial< SalesforceD2CServiceConfig > ) => {
		if ( ! state.client_secret ) {
			return __( 'Please provide a valid client secret.', 'remote-data-blocks' );
		}

		return null;
	},

	domain: ( state: Partial< SalesforceD2CServiceConfig > ) => {
		if ( ! state.domain ) {
			return __(
				'Please provide a valid domain. Example: https://scomhello123usa456org.lightning.force.com will have a valid domain of scomhello123usa456org.',
				'remote-data-blocks'
			);
		}

		return null;
	},
};

export const SalesforceD2CSettings = ( {
	mode,
	uuid,
	config,
}: SettingsComponentProps< SalesforceD2CConfig > ) => {
	const { onSave } = useDataSources< SalesforceD2CConfig >( false );

	const { state, handleOnChange, validState } = useForm< SalesforceD2CServiceConfig >( {
		initialValues: config?.service_config ?? {
			__version: SERVICE_CONFIG_VERSION,
			enable_blocks: true,
		},
		validationRules,
	} );

	const [ storeOptions, setStoreOptions ] = useState< SelectOption[] >( [
		{
			...defaultSelectOption,
			label: __( 'Auto-filled on successful connection.', 'remote-data-blocks' ),
		},
	] );

	const { stores, fetchingStores, storesError } = useSalesforceD2CAuth(
		state.domain ?? '',
		state.client_id ?? '',
		state.client_secret ?? ''
	);

	const onSaveClick = async () => {
		if ( ! validState ) {
			return;
		}

		const data: SalesforceD2CConfig = {
			service: 'salesforce-d2c',
			service_config: validState,
			uuid: uuid ?? null,
			config_source: ConfigSource.STORAGE,
		};

		return onSave( data, mode );
	};

	const onDomainChange = ( value: string ) => {
		if ( ! value ) {
			handleOnChange( 'domain', '' );
			handleOnChange( 'store_id', '' );
			return;
		}

		const lighteningUrlPattern = /^https?:\/\/([^.]+)\.lightning\.force\.com$/;

		const lighteningMatch = value.match( lighteningUrlPattern );

		if ( lighteningMatch ) {
			handleOnChange( 'domain', lighteningMatch[ 1 ] );
			handleOnChange( 'store_id', '' );
			return;
		}

		const salesforceUrlPattern = /^https?:\/\/([^.]+)\.my\.salesforce\.com$/;
		const salesforceMatch = value.match( salesforceUrlPattern );

		if ( salesforceMatch ) {
			handleOnChange( 'domain', salesforceMatch[ 1 ] );
			handleOnChange( 'store_id', '' );
			return;
		}

		handleOnChange( 'domain', value );
		handleOnChange( 'store_id', '' );
	};

	const onClientIDChange = ( value: string ) => {
		handleOnChange( 'client_id', value );
		handleOnChange( 'store_id', '' );
	};

	const onClientSecretChange = ( value: string ) => {
		handleOnChange( 'client_secret', value );
		handleOnChange( 'store_id', '' );
	};

	const onStoreIDChange = ( value: string ) => {
		const selectedStore = stores?.find( store => store.id === value );
		handleOnChange( 'store_id', selectedStore?.id ?? '' );
	};

	const credentialsHelpText = useMemo( () => {
		if ( fetchingStores ) {
			return __( 'Checking credentials...', 'remote-data-blocks' );
		} else if ( storesError ) {
			const errorMessage = storesError.message ?? __( 'Unknown error', 'remote-data-blocks' );
			return getConnectionMessage(
				'error',
				__( 'Failed to generate token using provided credentials: ', 'remote-data-blocks' ) +
					' ' +
					errorMessage
			);
		} else if ( stores ) {
			return getConnectionMessage(
				'success',
				__( 'Credentials are valid. Stores fetched successfully.', 'remote-data-blocks' )
			);
		}
		return __( 'The client secret for your Salesforce D2C instance.', 'remote-data-blocks' );
	}, [ fetchingStores, stores, storesError ] );

	const shouldAllowSubmit = state.store_id && state.store_id !== '';

	useEffect( () => {
		if ( ! stores?.length ) {
			return;
		}

		setStoreOptions( [
			{
				...defaultSelectOption,
				label: __( 'Select a store', 'remote-data-blocks' ),
			},
			...( stores ?? [] ).map( ( { name, id } ) => ( {
				label: name,
				value: id,
			} ) ),
		] );
	}, [ stores ] );

	return (
		<DataSourceForm onSave={ onSaveClick }>
			<DataSourceForm.Setup
				canProceed={ Boolean( stores && stores.length > 0 ) }
				displayName={ state.display_name ?? '' }
				handleOnChange={ handleOnChange }
				heading={ {
					icon: SalesforceCommerceD2CIcon,
					width: '100px',
					height: '75px',
					verticalAlign: 'text-top',
				} }
				inputIcon={ SalesforceCommerceD2CIcon }
				uuid={ uuid }
			>
				<TextControl
					type="text"
					label={ __( 'Domain', 'remote-data-blocks' ) }
					onChange={ onDomainChange }
					value={ state.domain ?? '' }
					help={
						<>
							{ __( 'Example: https://' ) }
							<strong>{ __( 'your-domain' ) }</strong>
							{ __( '.lightning.force.com' ) }
							{ __( ' or ' ) }
							{ __( 'https://' ) }
							<strong>{ __( 'your-domain' ) }</strong>
							{ __( '.my.salesforce.com' ) }
						</>
					}
					autoComplete="off"
					__nextHasNoMarginBottom
				/>

				<TextControl
					label={ __( 'Client ID', 'remote-data-blocks' ) }
					onChange={ onClientIDChange }
					value={ state.client_id ?? '' }
					help={ __( 'The client ID for your Salesforce D2C instance.', 'remote-data-blocks' ) }
					autoComplete="off"
					__nextHasNoMarginBottom
				/>

				<TextControl
					label={ __( 'Client Secret', 'remote-data-blocks' ) }
					onChange={ onClientSecretChange }
					value={ state.client_secret ?? '' }
					help={ credentialsHelpText }
					autoComplete="off"
					__nextHasNoMarginBottom
				/>
			</DataSourceForm.Setup>
			<DataSourceForm.Scope canProceed={ Boolean( shouldAllowSubmit ) }>
				<SelectControl
					id="store_id"
					label={ __( 'Store', 'remote-data-blocks' ) }
					value={ state.store_id ?? '' }
					onChange={ onStoreIDChange }
					options={ storeOptions }
					help={ __( 'Select a store', 'remote-data-blocks' ) }
					disabled={ fetchingStores || ! storeOptions?.length }
					__nextHasNoMarginBottom
				/>
			</DataSourceForm.Scope>
			<DataSourceForm.Blocks
				handleOnChange={ handleOnChange }
				hasEnabledBlocks={ Boolean( state.enable_blocks ) }
			/>
		</DataSourceForm>
	);
};
