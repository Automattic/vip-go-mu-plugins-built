<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Snippet;

use JsonSerializable;
use RemoteDataBlocks\WpdbStorage\DataSourceCrud;
use RemoteDataBlocks\Integrations\Airtable\AirtableIntegration;
use RemoteDataBlocks\Integrations\Google\Sheets\GoogleSheetsIntegration;
use RemoteDataBlocks\Integrations\Shopify\ShopifyIntegration;
use RemoteDataBlocks\Integrations\SalesforceD2C\SalesforceD2CIntegration;
use WP_Error;

class Snippet implements JsonSerializable {
	public function __construct(
		private string $name,
		private string $code,
	) {}

	public function jsonSerialize(): array {
		return [
			'name' => $this->name,
			'code' => $this->code,
		];
	}

	/**
	 * Generate snippets for a data source.
	 *
	 * @param string $uuid The UUID of the data source.
	 * @return array<Snippet>|WP_Error The snippets.
	 */
	public static function generate_snippets( string $uuid ): array|WP_Error {
		$data_source = DataSourceCrud::get_inflated_config_by_uuid( $uuid );

		if ( is_wp_error( $data_source ) ) {
			return $data_source;
		}

		$data_source_config = $data_source->to_array();
		$service = $data_source_config['service'];

		switch ( $service ) {
			case REMOTE_DATA_BLOCKS_SHOPIFY_SERVICE:
				$snippets = ShopifyIntegration::get_block_registration_snippets( $data_source_config );
				break;
			case REMOTE_DATA_BLOCKS_AIRTABLE_SERVICE:
				$snippets = AirtableIntegration::get_block_registration_snippets( $data_source_config );
				break;
			case REMOTE_DATA_BLOCKS_GOOGLE_SHEETS_SERVICE:
				$snippets = GoogleSheetsIntegration::get_block_registration_snippets( $data_source_config );
				break;
			case REMOTE_DATA_BLOCKS_SALESFORCE_D2C_SERVICE:
				$snippets = SalesforceD2CIntegration::get_block_registration_snippets( $data_source_config );
				break;
			default:
				return new WP_Error( 'invalid_service', __( 'Invalid service', 'remote-data-blocks' ) );
		}

		return array_map( [ __CLASS__, 'strip_template_comments' ], $snippets );
	}

	protected static function strip_template_comments( Snippet $snippet ): Snippet {
		// Match PHPDoc blocks that contain @template tags and any preceding blank lines
		$updated_code = preg_replace(
			'/\n*\/\*\*\s*\n\s*\*\s*@template-.*?\*\/\n*/s',
			"\n\n",
			$snippet->code
		);

		return new Snippet( $snippet->name, $updated_code );
	}
}
