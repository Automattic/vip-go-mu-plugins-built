<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\DataSource;

use RemoteDataBlocks\Config\ArraySerializableInterface;

/**
 * DataSourceInterface
 *
 * Interface used to define a Remote Data Blocks Data Source. It defines the
 * properties of a data source that will be shared by queries against that
 * data source.
 *
 * If you are a WPVIP customer, data sources are automatically provided by VIP.
 * Only implement this interface if you have additional custom data sources.
 */
interface DataSourceInterface extends ArraySerializableInterface {
	/**
	 * Get a unique human-readable name for this data source.
	 *
	 * This method should return a display name for the data source that can be
	 * used in user interfaces or for identification purposes.
	 *
	 * @return string The display name of the data source.
	 */
	public function get_display_name(): string;

	/**
	 * An optional image URL that can represent the data source in the block editor
	 * (e.g., in modals or in the block inspector).
	 *
	 * @return string|null The image URL or null if not set.
	 */
	public function get_image_url(): ?string;

	/**
	 * Get a name for the underlying service for this data source
	 *
	 * @return string|null The service name of the data source.
	 */
	public function get_service_name(): ?string;
}
