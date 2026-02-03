<?php
/**
 * Assets class.
 */

namespace Automattic\VIP\Salesforce\Agentforce\Cmp;

use Automattic\VIP\Salesforce\Agentforce\Constants;
use Automattic\VIP\Salesforce\Agentforce\Utils\Configs;
use Automattic\VIP\Salesforce\Agentforce\Utils\Traits\Singleton;
use Automattic\VIP\Salesforce\Agentforce\Utils\Traits\WithPluginPaths;

/**
 * Class Assets
 */
class Assets {

	use Singleton;
	use WithPluginPaths;

	/**
	 * Construct method.
	 */
	protected function __construct() {
		$this->setup_hooks();
	}

	/**
	 * To setup action/filter.
	 *
	 * @return void
	 */
	protected function setup_hooks() {

		/**
		 * Action
		 */
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_consent_scripts' ) );
	}

	/**
	 * To enqueue scripts and styles.
	 *
	 * @return void
	 */
	public function enqueue_scripts() {

		wp_register_script(
			'vip-agentforce-script',
			$this->get_integration_url() . '/assets/build/js/main.js',
			array(),
			filemtime( $this->get_integration_path() . '/assets/build/js/main.js' ),
			true
		);

		wp_register_style(
			'vip-agentforce-style',
			$this->get_integration_url() . '/assets/build/css/main.css',
			array(),
			filemtime( $this->get_integration_path() . '/assets/build/css/main.css' )
		);

		wp_enqueue_script( 'vip-agentforce-script' );
		wp_enqueue_style( 'vip-agentforce-style' );
	}

	/**
	 * To enqueue scripts and styles. in admin.
	 *
	 * @return void
	 */
	public function admin_enqueue_scripts() {

		wp_register_script(
			'vip-agentforce-script',
			$this->get_integration_url() . '/assets/build/js/admin.js',
			array(),
			filemtime( $this->get_integration_path() . '/assets/build/js/admin.js' ),
			true
		);

		wp_register_style(
			'vip-agentforce-style',
			$this->get_integration_url() . '/assets/build/css/admin.css',
			array(),
			filemtime( $this->get_integration_path() . '/assets/build/css/admin.css' )
		);

		wp_enqueue_script( 'vip-agentforce-script' );
		wp_enqueue_style( 'vip-agentforce-style' );
	}


	/**
	 * Enqueue the consent script based on the selected consent type.
	 *
	 * @return void
	 */
	public function enqueue_consent_scripts() {
		if ( ! Configs::is_js_sdk_activated() ) {
			return;
		}
		$salesforce_sdk_url = Configs::get_js_sdk_url();
		$consent_type       = get_option( 'vip_agentforce_consent_type', Constants::DEFAULT_CMP );
		$integration_path   = $this->get_integration_path();

		if ( ! in_array( $consent_type, Constants::SUPPORTED_CMPS, true ) ) {
			return;
		}
		$consent_script_filename_no_ext = 'cmp' . strtolower( $consent_type );
		$script_handle                  = 'vip-af-' . strtolower( $consent_type ) . '-consent';

		$script_file = $consent_script_filename_no_ext . '.js';

		// phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable
		$library_asset_file = include $integration_path . '/assets/build/js/' . $consent_script_filename_no_ext . '.asset.php';

		// fallback values in case there are issues with the asset file.
		if ( ! is_array( $library_asset_file ) ) {
			$script_path        = $integration_path . '/assets/build/js/' . $script_file;
			$library_asset_file = array(
				'dependencies' => array(),
				// TODO support a generic VIP_AGENTFORCE_VERSION constant that is tied to the plugin version and the release process
				'version'      => is_readable( $script_path ) ? filemtime( $script_path ) : false,
			);
		}

		wp_register_script(
			$script_handle,
			$this->get_integration_url() . '/assets/build/js/' . $script_file,
			$library_asset_file['dependencies'],
			$library_asset_file['version'],
			true
		);

		$localize_data = array(
			'sdkUrl' => esc_url( $salesforce_sdk_url ),
		);

		// we're late loading the options to make sure we load them only if needed.
		if ( 'OneTrust' === $consent_type ) {
			$onetrust_group_id        = get_option( 'vip_agentforce_onetrust_group_id', Constants::DEFAULT_ONETRUST_GROUP_ID );
			$localize_data['groupId'] = $onetrust_group_id;
		} elseif ( 'CookieBot' === $consent_type ) {
			$cookiebot_category                 = get_option( 'vip_agentforce_cookiebot_category', Constants::DEFAULT_COOKIEBOT_CATEGORY );
			$localize_data['cookiebotCategory'] = $cookiebot_category;
		} elseif ( 'iubenda' === $consent_type ) {
			$iubenda_purpose_id                = get_option( 'vip_agentforce_iubenda_category', Constants::DEFAULT_IUBENDA_PURPOSE_ID );
			$localize_data['iubendaPurposeId'] = $iubenda_purpose_id;
		}

		wp_localize_script(
			$script_handle,
			'vipAgentforceConsentData',
			$localize_data
		);

		wp_enqueue_script( $script_handle );
	}
}
