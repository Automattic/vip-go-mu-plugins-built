<?php
/**
 * "Dashboard" admin menu item class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin\MenuItems;

use GistAnswers\Admin\ConnectionWizard;
use GistAnswers\Admin\MenuItems\MenuSubitem;
use GistAnswers\API\Credentials;
use GistAnswers\Model\GistSite;
use GistAnswers\Plugin\CommonMain;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * "Dashboard" admin menu item class for the Gist Answers plugin.
 */
final class Dashboard extends MenuSubitem {

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

		$source = 'single';

		$gist_site = GistSite::get();

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- False positive; these are read-only UI flags.
		$connected_flag = intval( $_GET['connected'] ?? 0 );
		$activated_flag = intval( $_GET['activated'] ?? 0 );
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		$wizard_content_data = ConnectionWizard::get_wizard_content_data_for( $gist_site, $source, $connected_flag );

		$is_connected = 'connected' === ( $wizard_content_data->status ?? '' );

		$page_title = $is_connected ?
			__( 'Dashboard', 'gist-answers' ) :
			__( 'Welcome to Gist Answers', 'gist-answers' );

		return (object) array(
			'source'              => $source,
			'page_title'          => $page_title,
			'explainer_text'      => $is_connected ? sprintf(
				// translators: %s is a mailto link to the Gist Answers support email address.
				__( 'When you activate your WordPress site, Gist Answers will start ingesting its content. Contact %s with any questions.', 'gist-answers' ),
				CommonMain::get_api_contact_mailto_link(),
			) : '',
			'gist_site'           => $gist_site,
			'wizard_content_data' => $wizard_content_data,
			'error_message'       => $this->get_activation_error_message( $activated_flag ),
		);
	}

	/**
	 * Get the activation error message based on the activated flag.
	 *
	 * @param int $activated_flag The activated flag from the query string.
	 *
	 * @return string The activation error message, or an empty string if no error.
	 */
	private function get_activation_error_message( $activated_flag ): string {

		if ( -1 === $activated_flag ) {

			$errors = GistSite::get_site_activation_errors();
			$errors = is_object( $errors ) ? $errors->errors ?? array() : array();

			return $errors[0] ?? '';
		}

		return '';
	}
}
