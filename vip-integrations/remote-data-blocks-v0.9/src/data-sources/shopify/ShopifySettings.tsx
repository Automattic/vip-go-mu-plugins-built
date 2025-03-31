import { TextControl } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { DataSourceForm } from '../components/DataSourceForm';
import PasswordInputControl from '@/data-sources/components/PasswordInputControl';
import { ConfigSource } from '@/data-sources/constants';
import { useDataSources } from '@/data-sources/hooks/useDataSources';
import { useShopifyShopName } from '@/data-sources/hooks/useShopify';
import { SettingsComponentProps, ShopifyConfig, ShopifyServiceConfig } from '@/data-sources/types';
import { useForm } from '@/hooks/useForm';
import { ShopifyIcon, ShopifyIconWithText } from '@/settings/icons/ShopifyIcon';

const SERVICE_CONFIG_VERSION = 1;

export const ShopifySettings = ( {
	mode,
	uuid,
	config,
}: SettingsComponentProps< ShopifyConfig > ) => {
	const { onSave } = useDataSources< ShopifyConfig >( false );

	const { state, handleOnChange, validState } = useForm< ShopifyServiceConfig >( {
		initialValues: config?.service_config ?? {
			__version: SERVICE_CONFIG_VERSION,
			enable_blocks: true,
		},
	} );

	const { shopName, connectionMessage } = useShopifyShopName(
		state.store_name ?? '',
		state.access_token ?? ''
	);

	const shouldAllowSubmit = useMemo( () => {
		return state.store_name && state.access_token;
	}, [ state.store_name, state.access_token ] );

	const onTokenInputChange = ( token: string | undefined ) => {
		handleOnChange( 'access_token', token ?? '' );
	};

	const onShopNameChange = ( shopNameInput: string | undefined ) => {
		if ( ! shopNameInput ) {
			handleOnChange( 'store_name', '' );
			return;
		}
		const urlPattern = /^https?:\/\/([^.]+)\.myshopify\.com$/;
		const match = shopNameInput.match( urlPattern );
		const extractedShopName = match ? match[ 1 ] : shopNameInput;
		handleOnChange( 'store_name', extractedShopName ?? '' );
	};

	const onSaveClick = async () => {
		if ( ! validState ) {
			return;
		}

		const data: ShopifyConfig = {
			service: 'shopify',
			service_config: validState,
			uuid: uuid ?? null,
			config_source: ConfigSource.STORAGE,
		};

		return onSave( data, mode );
	};

	return (
		<DataSourceForm onSave={ onSaveClick }>
			<DataSourceForm.Setup
				canProceed={ Boolean( shouldAllowSubmit ) }
				displayName={ state.display_name ?? '' }
				handleOnChange={ handleOnChange }
				heading={ { icon: ShopifyIconWithText, width: '102px', height: '32px' } }
				inputIcon={ ShopifyIcon }
				uuid={ uuid }
			>
				<TextControl
					type="url"
					label={ __( 'myshopify.com domain name', 'remote-data-blocks' ) }
					onChange={ onShopNameChange }
					value={ state.store_name ?? '' }
					placeholder="your-shop-name"
					help={
						<>
							{ __( 'Example: https://' ) }
							<strong>{ __( 'your-shop-name' ) }</strong>
							{ __( '.myshopify.com' ) }
						</>
					}
					autoComplete="off"
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<PasswordInputControl
					label={ __( 'Access Token', 'remote-data-blocks' ) }
					onChange={ onTokenInputChange }
					value={ state.access_token }
					help={ connectionMessage }
				/>
				<TextControl
					label={ __( 'Store Name', 'remote-data-blocks' ) }
					placeholder={ __( 'Auto-filled on successful connection.', 'remote-data-blocks' ) }
					value={ shopName ?? '' }
					onChange={ () => {} }
					tabIndex={ -1 }
					readOnly
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</DataSourceForm.Setup>
			<DataSourceForm.Blocks
				handleOnChange={ handleOnChange }
				hasEnabledBlocks={ Boolean( state.enable_blocks ) }
			/>
		</DataSourceForm>
	);
};
