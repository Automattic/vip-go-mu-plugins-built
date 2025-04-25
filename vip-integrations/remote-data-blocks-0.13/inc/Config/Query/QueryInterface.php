<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\Query;

use RemoteDataBlocks\Config\ArraySerializableInterface;
use RemoteDataBlocks\Config\DataSource\DataSourceInterface;
use WP_Error;

/**
 * QueryInterface interface
 *
 */
interface QueryInterface extends ArraySerializableInterface {
	public function execute( array $input_variables ): array|WP_Error;
	public function execute_batch( array $array_of_input_variables ): array|WP_Error;
	public function get_data_source(): DataSourceInterface|QueryInterface;
	public function get_image_url(): ?string;
	public function get_input_schema(): array;
	public function get_output_schema(): array;
	public function get_pagination_schema(): ?array;
}
