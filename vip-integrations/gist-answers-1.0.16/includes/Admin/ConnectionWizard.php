<?php
/**
 * Connection wizard helper class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin;

use GistAnswers\Admin\MenuItems;
use GistAnswers\Admin\MenuItems\Dashboard;
use GistAnswers\Model\GistSite;
use GistAnswers\Plugin\Config;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Connection wizard helper class for the Gist Answers plugin.
 */
final class ConnectionWizard {

	/**
	 * Extract the connection data needed for rendering the connection wizard.
	 *
	 * @param GistSite $gist_site The Gist site data for this connection.
	 * @param string   $source    The source of the connection ('network' or 'single').
	 *
	 * @return object The required connection data.
	 */
	public static function extract_connection_data_from( GistSite $gist_site, string $source ): object {

		$blog_id = $gist_site->get_blog_id();
		$domain  = $gist_site->get_domain();

		$has_stored_api_token = $gist_site->has_stored_api_token();
		$has_valid_api_token  = $gist_site->has_valid_api_token();

		$api_token_response = $gist_site->get_api_token_response();
		$api_token_code     = isset( $api_token_response->code ) && ! empty( $api_token_response->code ) ? intval( $api_token_response->code ) : 200;
		$api_token_error    = is_object( $api_token_response->data ?? null ) ? ( $api_token_response->data->error ?? '' ) : '';

		$pubisher_group       = $gist_site->get_publisher_group();
		$publisher_group_name = $pubisher_group ? ( $pubisher_group->name ?? '' ) : '';

		$publisher      = $gist_site->get_publisher();
		$publisher_name = $publisher ? ( $publisher->name ?? '' ) : '';

		if ( 'network' === $source ) {
			$has_stored_publisher = true;
			$has_valid_publisher  = true;
		} else {
			$has_stored_publisher = $gist_site->has_stored_publisher();
			$has_valid_publisher  = $gist_site->has_valid_publisher();
		}

		$api_token_source = $gist_site->get_api_token_source();

		return (object) compact(
			'blog_id',
			'domain',
			'has_stored_api_token',
			'has_valid_api_token',
			'api_token_response',
			'api_token_code',
			'api_token_error',
			'pubisher_group',
			'publisher_group_name',
			'publisher',
			'publisher_name',
			'has_stored_publisher',
			'has_valid_publisher',
			'api_token_source',
		);
	}

	/**
	 * Get the content data needed for rendering the connection wizard.
	 *
	 * @param object $connection_data   The extracted connection data object.
	 * @param string $source            The source of the connection ('network' or 'single').
	 * @param int    $connected_flag    Flag indicating if the site was connected.
	 *
	 * @return object The content data needed for rendering the connection wizard.
	 */
	public static function get_wizard_content_data_from( object $connection_data, string $source, int $connected_flag ): object {

		$override_server_status = false;

		$show_wizard = true;

		$post_data = null;

		$can_hide_wizard = false;

		$message = '';
		$status  = 'error';

		$hide_connection_form = 'database' !== ( $connection_data->api_token_source ?? '' );

		if ( 'vip' === ( $connection_data->api_token_source ?? '' ) && ! $connection_data->has_stored_api_token ) {

			$message = sprintf(
				// translators: %1$s is the VIP config constant name; %2$s is a comma-separated list of missing config field names.
				__( 'This site\'s Gist API connection is managed by WordPress VIP, but its configuration (%1$s) is incomplete. Missing: %2$s. Finish setting up the Gist Answers integration in the VIP Dashboard.', 'gist-answers' ),
				'<code>' . esc_html( Config::CONSTANT_NAME ) . '</code>',
				esc_html( implode( ', ', Config::from_constant()->missing_fields() ) ),
			);

			$status = 'warning';

			$hide_connection_form = true;

		} elseif ( -1 === $connected_flag ) {

			$message = __( 'The API token you entered is not valid. Please enter a new token.', 'gist-answers' );
			$status  = 'error';

			add_action(
				'admin_footer',
				function () {
					?>
					<script>
						addEventListener( 'DOMContentLoaded', () => {
							window.gistAnswersAdmin.removeStatusFlag( 'connected' );
						} );
					</script>
					<?php
				},
			);

		} elseif ( $connection_data->has_stored_api_token && 401 === $connection_data->api_token_code ) {

			switch ( $connection_data->api_token_source ?? '' ) {
				case 'vip':
					$message = __( 'The API token provided by WordPress VIP is no longer valid. Update the Gist Answers integration\'s configuration in the VIP Dashboard.', 'gist-answers' );

					$hide_connection_form = true;

					break;

				case 'environment':
					$message = __( 'The API token stored in your server environment is no longer valid. Please contact your server administrator to update the token.', 'gist-answers' );

					$hide_connection_form = true;

					break;

				case 'constant':
					$message = __( 'The API token stored in your WordPress configuration is no longer valid. Please contact your site administrator to update the token.', 'gist-answers' );

					$hide_connection_form = true;

					break;

				default:
					if ( is_multisite() && 'network' !== $source ) {

						if ( is_super_admin() ) {
							$message = sprintf(
								// translators: %s is the URL to the Network Hub.
								__( 'The stored API token is no longer valid. Please visit the <a href="%s">Network Dashboard</a> to update your API token.', 'gist-answers' ),
								esc_url( MenuItems::get_admin_menu_url_for_network() ),
							);
						} else {
							$message = __( 'The stored API token is no longer valid.  Please contact your network administrator to update the API token.', 'gist-answers' );
						}

						$hide_connection_form = true;

					} else {
						$message = __( 'The stored API token is no longer valid. Please enter your new token below.', 'gist-answers' );
					}

					$status = 'error';

					break;
			}

			$status = 'error';

		} elseif ( 200 !== $connection_data->api_token_code && 401 !== $connection_data->api_token_code ) {

			$message = __( 'The Gist API server is currently unreachable. Please try again later.', 'gist-answers' );
			$status  = 'warning';

			$server_message_a = ( $connection_data->api_token_code >= 400 && $connection_data->api_token_code <= 599 ) ? sprintf(
				// translators: %d is the HTTP status code returned by the Gist API server.
				__( 'Status code: %d', 'gist-answers' ),
				$connection_data->api_token_code,
			) . '.' : '';

			$server_message_b = ! empty( $connection_data->api_token_error ) ? trim( $connection_data->api_token_error, '.' ) . '.' : '';

			if ( ! empty( $server_message_a ) || ! empty( $server_message_b ) ) {
				$message .= ' (' . trim( $server_message_a . ' ' . $server_message_b ) . ')';
			}

			$hide_connection_form = true;

		} elseif ( $connection_data->has_valid_api_token && $connection_data->has_valid_publisher ) {

			$status = 'connected';

			$can_hide_wizard = true;

			if ( 1 === $connected_flag ) {

				add_action(
					'admin_footer',
					function () {
						?>
						<script>
							addEventListener( 'DOMContentLoaded', () => {
								window.gistAnswersAdmin.removeStatusFlag( 'connected' );
							} );
						</script>
						<?php
					},
				);

			} else {
				$show_wizard = false;
			}
		} elseif ( $connection_data->has_valid_api_token && 'submenu' === $source ) {

			$message = sprintf(
				// translators: %s is the URL to the Gist Answers "Dashboard" page.
				__( 'This site has not been activated. Visit the Gist Answers <a href="%s">Dashboard</a> to activate your site', 'gist-answers' ),
				esc_url( Dashboard::get_admin_menu_url() ),
			);

			$status = 'warning';

			$hide_connection_form = true;

		} elseif ( $connection_data->has_valid_api_token ) {

			$status = 'connected';

			$show_wizard = false;

		} elseif ( is_multisite() && 'network' !== $source ) {

			if ( is_super_admin() ) {
				$message = sprintf(
					// translators: %s is the URL to the Network Hub.
					__( 'Please visit the <a href="%s">Network Dashboard</a> to enter your API token.', 'gist-answers' ),
					esc_url( MenuItems::get_admin_menu_url_for_network() ),
				);
			} else {
				$message = __( 'Please contact your network administrator to add your API token.', 'gist-answers' );
			}

			$status = 'error';

			$hide_connection_form = true;
		}

		return (object) compact(
			'source',
			'override_server_status',
			'show_wizard',
			'can_hide_wizard',
			'message',
			'status',
			'post_data',
			'hide_connection_form',
		);
	}

	/**
	 * Add the connection status data to the wizard content data from the connection data.
	 *
	 * @param object $wizard_content_data The wizard content data object.
	 * @param object $connection_data     The connection data object.
	 *
	 * @return object The updated wizard content data with connection status information.
	 */
	public static function add_connection_status_data_to( object $wizard_content_data, object $connection_data ): object {

		$wizard_content_data->server_code  = $connection_data->api_token_code ?? 0;
		$wizard_content_data->server_error = $connection_data->api_token_error ?? '';

		$wizard_content_data->api_token_source = $connection_data->api_token_source ?? '';

		return $wizard_content_data;
	}

	/**
	 * Create the connection wizard content data based on the given data.
	 *
	 * @param GistSite $gist_site         The Gist site data for this connection.
	 * @param string   $source            The source of the connection (e.g., 'network' or 'single').
	 * @param int      $connected_flag    Optional flag indicating if the site was connected.
	 */
	public static function get_wizard_content_data_for( GistSite $gist_site, string $source, int $connected_flag = 0 ): object {

		$connection_data = self::extract_connection_data_from( $gist_site, $source );

		$wizard_content_data = self::get_wizard_content_data_from( $connection_data, $source, $connected_flag );

		if ( $wizard_content_data->override_server_status ) {
			$connection_data->api_token_code  = 200;
			$connection_data->api_token_error = null;
		}

		return self::add_connection_status_data_to( $wizard_content_data, $connection_data );
	}
}
