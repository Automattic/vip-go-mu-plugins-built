<?php
/**
 * "Questions" admin menu item class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin\MenuItems;

use GistAnswers\Admin\ConnectionWizard;
use GistAnswers\Admin\MenuItems\MenuSubitem;
use GistAnswers\API\Credentials;
use GistAnswers\Model\GistSite;
use GistAnswers\Plugin\GistURLs;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * "Questions" admin menu item class for the Gist Answers plugin.
 */
final class Questions extends MenuSubitem {

	/**
	 * Class constructor.
	 *
	 * @param bool $in_submenu      Whether this menu item is a subitem.
	 * @param bool $is_network_menu Whether this menu item is in the network menu.
	 *
	 * @return void
	 */
	public function __construct( bool $in_submenu, bool $is_network_menu = false ) {
		parent::__construct( self::class, $in_submenu, $is_network_menu );
	}

	/**
	 * Data to be passed to the template for rendering.
	 *
	 * @return object Object containing data to be passed to the template.
	 */
	protected function with(): object {

		Credentials::refresh_publisher_data_if_stale();

		$source = 'submenu';

		$gist_site = GistSite::get();

		return (object) array(
			'source'              => $source,
			'iframe_url'          => GistURLs::get_cms_iframe_url( $this->slug ),
			'wizard_content_data' => ConnectionWizard::get_wizard_content_data_for( $gist_site, $source ),
		);
	}
}
