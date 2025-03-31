export type HttpAuthTypes = 'bearer' | 'basic' | 'api-key' | 'none';
export type HttpApiKeyDestination = 'header' | 'queryparams';

export interface BaseHttpAuth {
	type: HttpAuthTypes;
	value: string;
}

export interface HttpBearerAuth extends BaseHttpAuth {
	type: 'bearer';
}

export interface HttpBasicAuth extends BaseHttpAuth {
	type: 'basic';
}

export type HttpAuth = HttpBearerAuth | HttpBasicAuth | HttpApiKeyAuth | HttpNoAuth;

export interface HttpApiKeyAuth extends BaseHttpAuth {
	type: 'api-key';
	key: string;
	add_to: HttpApiKeyDestination;
}

export interface HttpNoAuth extends BaseHttpAuth {
	type: 'none';
}
