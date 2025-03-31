import { __, sprintf } from '@wordpress/i18n';

import {
	AirtableBasesResult,
	AirtableBase,
	AirtableBaseSchema,
	AirtableTable,
} from '@/data-sources/airtable/types';

export class AirtableApi {
	private static BASE_URL = 'https://api.airtable.com/v0';

	constructor( private token: string ) {}

	private getAuthHeaders() {
		if ( ! this.token ) {
			throw new Error( 'No token provided' );
		}

		return {
			Authorization: `Bearer ${ this.token }`,
		};
	}

	private async fetchApi< T >( path: string, options: RequestInit = {} ): Promise< T > {
		const url = `${ AirtableApi.BASE_URL.trim().replace( /\/$/, '' ) }/${ path
			.trim()
			.replace( /^\//, '' ) }`;

		const response = await fetch( url, {
			...options,
			headers: {
				...( options.headers ?? {} ),
				...this.getAuthHeaders(),
			},
		} );

		if ( ! response.ok ) {
			const errorText = `${ response.status } - ${ await response.text() }`;
			throw new Error( `[Airtable API] ${ sprintf( __( 'Error: %s' ), errorText ) }` );
		}

		return response.json() as Promise< T >;
	}

	public async whoAmI(): Promise< string > {
		const result = await this.fetchApi< { id?: string } >( '/meta/whoami' );
		return result.id ?? '';
	}

	public async getBases(): Promise< AirtableBase[] > {
		const result = await this.fetchApi< AirtableBasesResult >( '/meta/bases' );
		return result.bases ?? [];
	}

	private async getBaseSchemas( baseId: string ): Promise< AirtableBaseSchema > {
		const result = await this.fetchApi< AirtableBaseSchema >( `/meta/bases/${ baseId }/tables` );
		return result ?? { tables: [] };
	}

	public async getTables( baseId: string ): Promise< AirtableTable[] > {
		const baseSchema = await this.getBaseSchemas( baseId );
		return baseSchema?.tables ?? [];
	}
}
