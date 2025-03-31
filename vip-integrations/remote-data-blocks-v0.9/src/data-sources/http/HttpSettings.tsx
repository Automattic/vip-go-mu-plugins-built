import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { DataSourceForm } from '../components/DataSourceForm';
import { HttpAuthSettingsInput } from '@/data-sources/components/HttpAuthSettingsInput';
import { ConfigSource } from '@/data-sources/constants';
import { useDataSources } from '@/data-sources/hooks/useDataSources';
import { HttpAuth } from '@/data-sources/http/types';
import { HttpConfig, HttpServiceConfig, SettingsComponentProps } from '@/data-sources/types';
import { useForm } from '@/hooks/useForm';
import HttpIcon from '@/settings/icons/HttpIcon';

const SERVICE_CONFIG_VERSION = 1;

function computeAuthState( updatedAuth: Partial< HttpServiceConfig[ 'auth' ] > ): HttpAuth {
	let auth: HttpAuth;

	if ( updatedAuth?.type === 'api-key' ) {
		auth = {
			type: 'api-key',
			value: updatedAuth.value ?? '',
			key: updatedAuth.key ?? '',
			add_to: updatedAuth.add_to ?? 'header',
		};
	} else {
		auth = {
			type: updatedAuth?.type ?? 'none',
			value: updatedAuth?.value ?? '',
		};
	}

	return auth;
}

export const HttpSettings = ( { mode, uuid, config }: SettingsComponentProps< HttpConfig > ) => {
	const { state, handleOnChange, validState } = useForm< HttpServiceConfig >( {
		initialValues: config?.service_config ?? {
			__version: SERVICE_CONFIG_VERSION,
			auth: computeAuthState( {} ),
		},
	} );

	const { onSave } = useDataSources< HttpConfig >( false );

	let shouldAllowSubmit: boolean = Boolean(
		state.endpoint && state.auth?.type && state.auth?.value
	);
	if ( state.auth?.type === 'api-key' ) {
		shouldAllowSubmit = shouldAllowSubmit && Boolean( state.auth?.key && state.auth?.add_to );
	} else if ( state.auth?.type === 'none' ) {
		shouldAllowSubmit = Boolean( state.endpoint );
	}

	const handleAuthOnChange = ( id: string, value: unknown ): void => {
		handleOnChange( 'auth', computeAuthState( { ...state.auth, [ id ]: value } ) );
	};

	const onSaveClick = async () => {
		if ( ! validState || ! shouldAllowSubmit ) {
			return;
		}

		const httpConfig: HttpConfig = {
			service: 'generic-http',
			service_config: validState,
			uuid: uuid ?? null,
			config_source: ConfigSource.STORAGE,
		};

		return onSave( httpConfig, mode );
	};

	return (
		<DataSourceForm onSave={ onSaveClick }>
			<DataSourceForm.Setup
				canProceed={ shouldAllowSubmit }
				displayName={ state.display_name ?? '' }
				handleOnChange={ handleOnChange }
				heading={ { label: __( 'Connect HTTP Data Source', 'remote-data-blocks' ) } }
				inputIcon={ HttpIcon }
				uuid={ uuid }
			>
				<TextControl
					type="url"
					id="url"
					label={ __( 'URL', 'remote-data-blocks' ) }
					value={ state.endpoint ?? '' }
					onChange={ value => handleOnChange( 'endpoint', value ) }
					autoComplete="off"
					__next40pxDefaultSize
					help={ __( 'The URL for the HTTP endpoint.', 'remote-data-blocks' ) }
					__nextHasNoMarginBottom
				/>

				<HttpAuthSettingsInput auth={ state.auth } onChange={ handleAuthOnChange } />
			</DataSourceForm.Setup>
		</DataSourceForm>
	);
};
