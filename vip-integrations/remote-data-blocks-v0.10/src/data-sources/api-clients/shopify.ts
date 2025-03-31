import { __, sprintf } from '@wordpress/i18n';

export class ShopifyApi {
	constructor( private store: string, private token: string ) {}

	private getGraphqlEndpointUrl() {
		if ( ! this.store ) {
			throw new Error( 'No store provided' );
		}
		return `https://${ this.store }.myshopify.com/api/2024-07/graphql.json`;
	}

	private getAuthHeaders() {
		if ( ! this.token ) {
			throw new Error( 'No token provided' );
		}

		return {
			'Content-Type': 'application/json',
			'X-Shopify-Storefront-Access-Token': this.token,
		};
	}

	private async query< T >( query: string, options: RequestInit = {} ): Promise< T > {
		const url = this.getGraphqlEndpointUrl();

		const response = await fetch( url, {
			...options,
			method: 'POST',
			headers: {
				...( options.headers ?? {} ),
				...this.getAuthHeaders(),
			},
			body: JSON.stringify( { query } ),
		} );

		if ( ! response.ok ) {
			const errorText = `${ response.status } - ${ await response.text() }`;
			throw new Error( `[Shopify API] ${ sprintf( __( 'Error: %s' ), errorText ) }` );
		}

		return response.json() as Promise< T >;
	}

	public async shopName(): Promise< string > {
		const result = await this.query< { data?: { shop?: { name: string } } } >(
			`query {
                shop {
                    name
                }
            }`
		);
		return result.data?.shop?.name ?? '';
	}
}
