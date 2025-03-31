import apiFetch from '@wordpress/api-fetch';

import { REST_BASE_AUTH } from '@/data-sources/constants';
import { SalesforceD2CWebStoreRecord, SalesforceD2CWebStoresResponse } from '@/data-sources/types';
import { GoogleServiceAccountKey } from '@/types/google';

export async function getGoogleAuthTokenFromServiceAccount(
	serviceAccountKey: GoogleServiceAccountKey,
	scopes: string[]
): Promise< string > {
	const requestBody = {
		type: serviceAccountKey.type,
		scopes,
		credentials: serviceAccountKey,
	};

	const response = await apiFetch< { token: string } >( {
		path: `${ REST_BASE_AUTH }/google/token`,
		method: 'POST',
		data: requestBody,
	} );

	return response.token;
}

export async function getSalesforceD2CStores(
	domain: string,
	clientId: string,
	clientSecret: string
): Promise< SalesforceD2CWebStoreRecord[] > {
	const requestBody = {
		domain,
		clientId,
		clientSecret,
	};

	const response = await apiFetch< SalesforceD2CWebStoresResponse >( {
		path: `${ REST_BASE_AUTH }/salesforce-d2c/stores`,
		method: 'POST',
		data: requestBody,
	} );

	return response.webstores;
}
