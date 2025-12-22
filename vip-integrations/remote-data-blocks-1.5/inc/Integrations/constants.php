<?php declare(strict_types = 1);

namespace RemoteDataBlocks;

define( 'REMOTE_DATA_BLOCKS_AIRTABLE_SERVICE', 'airtable' );
define( 'REMOTE_DATA_BLOCKS_GENERIC_HTTP_SERVICE', 'generic-http' );
define( 'REMOTE_DATA_BLOCKS_GITHUB_SERVICE', 'github' );
define( 'REMOTE_DATA_BLOCKS_GOOGLE_SHEETS_SERVICE', 'google-sheets' );
define( 'REMOTE_DATA_BLOCKS_SHOPIFY_SERVICE', 'shopify' );
define( 'REMOTE_DATA_BLOCKS_MOCK_SERVICE', 'mock' );

define( 'REMOTE_DATA_BLOCKS__SERVICES', [
	REMOTE_DATA_BLOCKS_AIRTABLE_SERVICE,
	REMOTE_DATA_BLOCKS_GENERIC_HTTP_SERVICE,
	REMOTE_DATA_BLOCKS_GITHUB_SERVICE,
	REMOTE_DATA_BLOCKS_GOOGLE_SHEETS_SERVICE,
	REMOTE_DATA_BLOCKS_SHOPIFY_SERVICE,
] );

const REMOTE_DATA_BLOCKS__DATA_SOURCE_CLASSMAP = [
	REMOTE_DATA_BLOCKS_AIRTABLE_SERVICE => \RemoteDataBlocks\Integrations\Airtable\AirtableDataSource::class,
	REMOTE_DATA_BLOCKS_GENERIC_HTTP_SERVICE => \RemoteDataBlocks\Integrations\GenericHttp\GenericHttpDataSource::class,
	REMOTE_DATA_BLOCKS_GITHUB_SERVICE => \RemoteDataBlocks\Integrations\GitHub\GitHubDataSource::class,
	REMOTE_DATA_BLOCKS_GOOGLE_SHEETS_SERVICE => \RemoteDataBlocks\Integrations\Google\Sheets\GoogleSheetsDataSource::class,
	REMOTE_DATA_BLOCKS_SHOPIFY_SERVICE => \RemoteDataBlocks\Integrations\Shopify\ShopifyDataSource::class,
	REMOTE_DATA_BLOCKS_MOCK_SERVICE => \RemoteDataBlocks\Tests\Mocks\MockDataSource::class,
];
