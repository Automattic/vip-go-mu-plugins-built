<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\Google\Sheets;

use RemoteDataBlocks\Integrations\GenericHttp\GenericHttpDataSource;
use RemoteDataBlocks\Integrations\Google\Auth\GoogleAuth;
use RemoteDataBlocks\Validation\Types;

class GoogleSheetsDataSource extends GenericHttpDataSource {
	protected const SERVICE_NAME = REMOTE_DATA_BLOCKS_GOOGLE_SHEETS_SERVICE;
	protected const SERVICE_SCHEMA_VERSION = 1;

	protected static function get_service_config_schema(): array {
		return Types::object( [
			'__version' => Types::integer(),
			'credentials' => Types::object( [
				'type' => Types::string(),
				'project_id' => Types::string(),
				'private_key_id' => Types::string(),
				'private_key' => Types::skip_sanitize( Types::string() ),
				'client_email' => Types::email_address(),
				'client_id' => Types::string(),
				'auth_uri' => Types::url(),
				'token_uri' => Types::url(),
				'auth_provider_x509_cert_url' => Types::url(),
				'client_x509_cert_url' => Types::url(),
				'universe_domain' => Types::string(),
			] ),
			'display_name' => Types::string(),
			'enable_blocks' => Types::nullable( Types::boolean() ),
			'spreadsheet' => Types::object( [
				'id' => Types::id(),
				'name' => Types::nullable( Types::string() ),
			] ),
			'sheets' => Types::list_of(
				Types::object( [
					'id' => Types::string(),
					'name' => Types::string(),
					'output_query_mappings' => Types::list_of(
						Types::object( [
							'key' => Types::string(),
							'name' => Types::nullable( Types::string() ),
							'path' => Types::nullable( Types::json_path() ),
							'type' => Types::nullable( Types::string() ),
						] )
					),
				] )
			),
		] );
	}

	protected static function map_service_config( array $service_config ): array {
		return [
			'display_name' => $service_config['display_name'],
			'endpoint' => sprintf(
				'https://sheets.googleapis.com/v4/spreadsheets/%s',
				$service_config['spreadsheet']['id']
			),
			'request_headers' => function () use ( $service_config ): array {
				$access_token = GoogleAuth::generate_token_from_service_account_key(
					$service_config['credentials'],
					GoogleAuth::GOOGLE_SHEETS_SCOPES
				);

				return [
					'Authorization' => sprintf( 'Bearer %s', $access_token ),
					'Content-Type' => 'application/json',
				];
			},
		];
	}

	public static function preprocess_list_response( array $response_data ): array {
		if ( isset( $response_data['values'] ) && is_array( $response_data['values'] ) ) {
			$values = $response_data['values'];
			$columns = array_shift( $values ); // Get column names from first row

			$response_data['values'] = array_map(
				function ( $row, $index ) use ( $columns ) {
					$row = self::modify_row_to_match_columns( $row, $columns );
					$combined = array_combine( $columns, $row );
					$combined['RowId'] = $index + 1; // Add row_id field, starting from 1
					return $combined;
				},
				$values,
				array_keys( $values )
			);
		}

		return $response_data;
	}

	public static function preprocess_get_response( array $response_data, array $input_variables ): array {
		$selected_row = null;
		$row_id = $input_variables['row_id'];

		if ( isset( $response_data['values'] ) && is_array( $response_data['values'] ) ) {
			$values = $response_data['values'];
			$columns = array_shift( $values ); // Get column names from first row

			// if the values are now empty, give back $selected_row as null
			// This can happen if rows are deleted in the sheet after they
			// have been used in a remote data block.
			if ( empty( $values ) ) {
				return [];
			}

			$raw_selected_row = $values[ $row_id - 1 ];
			if ( is_array( $raw_selected_row ) ) {
				$raw_selected_row = self::modify_row_to_match_columns( $raw_selected_row, $columns );
				$selected_row = array_combine( $columns, $raw_selected_row );
				$selected_row['RowId'] = $row_id;
			}
		}

		return $selected_row;
	}

	private static function modify_row_to_match_columns( array $row, array $columns ): array {
		if ( count( $row ) < count( $columns ) ) {
			// If the selected row has fewer elements than the columns, pad the row with empty strings.
			// This accounts for the case where more columns are added to the sheet, after it was mapped.
			$row = array_pad( $row, count( $columns ), '' );
		} elseif ( count( $row ) > count( $columns ) ) {
			// If the selected row has more elements than the columns, slice the row to match the number of columns.
			// This accounts for the case where columns are deleted from the sheet, after they were mapped.
			$row = array_slice( $row, 0, count( $columns ) );
		}

		return $row;
	}
}
