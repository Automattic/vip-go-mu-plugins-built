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
	 * To enqueue scripts and styles in admin.
	 *
	 * @param string $hook_suffix The current admin page hook suffix.
	 * @return void
	 */
	public function admin_enqueue_scripts( string $hook_suffix = '' ): void {
		if ( 'toplevel_page_vip-agentforce-settings' !== $hook_suffix ) {
			return;
		}

		$admin_script_asset_path = $this->get_integration_path() . '/assets/build/js/admin.asset.php';
		$admin_script_path       = $this->get_integration_path() . '/assets/build/js/admin.js';
		$admin_style_path        = $this->get_integration_path() . '/assets/build/css/admin.css';

		if ( ! is_readable( $admin_script_asset_path ) ) {
			wp_die( esc_html__( 'The admin asset file is missing. Run `npm run build` to generate it.', 'vip-agentforce' ) );
		}

		if ( ! is_readable( $admin_script_path ) ) {
			wp_die( esc_html__( 'The admin script file is missing. Run `npm run build` to generate it.', 'vip-agentforce' ) );
		}

		// phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable
		$admin_script_asset = include $admin_script_asset_path;

		if ( ! is_array( $admin_script_asset ) || ! isset( $admin_script_asset['dependencies'], $admin_script_asset['version'] ) ) {
			wp_die( esc_html__( 'The admin asset metadata is invalid. Run `npm run build` to regenerate it.', 'vip-agentforce' ) );
		}

		wp_register_script(
			'vip-agentforce-script',
			$this->get_integration_url() . '/assets/build/js/admin.js',
			$admin_script_asset['dependencies'],
			$admin_script_asset['version'],
			array(
				'in_footer' => true,
			)
		);

		wp_set_script_translations(
			'vip-agentforce-script',
			'vip-agentforce',
			$this->get_integration_path() . '/languages'
		);

		if ( is_readable( $admin_style_path ) ) {
			wp_register_style(
				'vip-agentforce-style',
				$this->get_integration_url() . '/assets/build/css/admin.css',
				array_values(
					array_filter(
						$admin_script_asset['dependencies'],
						function ( $style ) {
							return wp_style_is( $style, 'registered' );
						}
					)
				),
				filemtime( $admin_style_path )
			);

			wp_enqueue_style( 'vip-agentforce-style' );
		}

		wp_enqueue_script( 'vip-agentforce-script' );
	}


	/**
	 * Enqueue the consent script based on the selected consent type.
	 *
	 * @return void
	 */
	public function enqueue_consent_scripts() {
		$debug_preview = $this->is_debug_preview_enabled();
		if ( ! $debug_preview && ! Configs::is_js_sdk_activated() ) {
			return;
		}
		$parsed_embedding_script = $this->parse_embedding_script( Configs::get_embedding_script() );
		if ( null === $parsed_embedding_script ) {
			return;
		}

		$consent_type     = $this->get_consent_type_for_request( $debug_preview );
		$integration_path = $this->get_integration_path();

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

		$prechat_fields = Configs::get_prechat_fields();

		$localize_data = array(
			'embedding' => array(
				'bootstrapSrc' => $parsed_embedding_script['bootstrap_src'],
			),
		);

		if ( ! empty( $prechat_fields ) ) {
			$localize_data['prechatFields'] = $prechat_fields;
		}

		// we're late loading the options to make sure we load them only if needed.
		if ( 'CookieYes' === $consent_type ) {
			$cookieyes_category                 = get_option( 'vip_agentforce_cookieyes_category', Constants::DEFAULT_COOKIEYES_CATEGORY );
			$localize_data['cookieyesCategory'] = Settings_Page::get_instance()->validate_cookieyes_category( $cookieyes_category );
		} elseif ( 'OneTrust' === $consent_type ) {
			$onetrust_group_id        = get_option( 'vip_agentforce_onetrust_group_id', Constants::DEFAULT_ONETRUST_GROUP_ID );
			$localize_data['groupId'] = $onetrust_group_id;
		} elseif ( 'CookieBot' === $consent_type ) {
			$cookiebot_category                 = get_option( 'vip_agentforce_cookiebot_category', Constants::DEFAULT_COOKIEBOT_CATEGORY );
			$localize_data['cookiebotCategory'] = Settings_Page::get_instance()->validate_cookiebot_category( $cookiebot_category );
		} elseif ( 'iubenda' === $consent_type ) {
			$iubenda_purpose_id                = get_option( 'vip_agentforce_iubenda_category', Constants::DEFAULT_IUBENDA_PURPOSE_ID );
			$localize_data['iubendaPurposeId'] = $iubenda_purpose_id;
		}

		wp_localize_script(
			$script_handle,
			'vipAgentforceConsentData',
			$localize_data
		);

		$inline_script_added = wp_add_inline_script(
			$script_handle,
			$parsed_embedding_script['inline_init_js'],
			'before'
		);

		if ( false === $inline_script_added ) {
			return;
		}

		if ( $debug_preview ) {
			wp_add_inline_script(
				$script_handle,
				'if ( window.AgentforceCMP && typeof window.AgentforceCMP.loadSDK === "function" ) { window.AgentforceCMP.loadSDK(); }',
				'after'
			);
		}

		wp_enqueue_script( $script_handle );
	}

	/**
	 * Determine which CMP integration to run for the current request.
	 *
	 * @param bool $debug_preview_enabled Whether debug preview mode is enabled.
	 * @return string
	 */
	private function get_consent_type_for_request( bool $debug_preview_enabled ): string {
		if ( $debug_preview_enabled ) {
			return 'Custom';
		}

		$consent_type = get_option( 'vip_agentforce_consent_type', Constants::DEFAULT_CMP );
		if ( ! is_string( $consent_type ) || '' === $consent_type ) {
			return Constants::DEFAULT_CMP;
		}

		return $consent_type;
	}

	/**
	 * Whether the request is using debug preview mode.
	 *
	 * @return bool
	 */
	private function is_debug_preview_enabled(): bool {
		if ( ! is_user_logged_in() || ! $this->current_user_can_debug_preview() ) {
			return false;
		}

		$debug_value = '';
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Read-only query param for preview mode.
		if ( isset( $_GET['vip_agentforce_debug'] ) ) {
			$debug_value = sanitize_text_field( wp_unslash( $_GET['vip_agentforce_debug'] ) );
		}
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		return 'true' === strtolower( $debug_value );
	}

	/**
	 * Whether current user can use Agentforce debug preview mode.
	 *
	 * @return bool
	 */
	private function current_user_can_debug_preview(): bool {
		$allowed_capabilities = apply_filters(
			'vip_agentforce_debug_preview_capabilities',
			array( 'manage_options' )
		);

		if ( ! is_array( $allowed_capabilities ) || empty( $allowed_capabilities ) ) {
			$allowed_capabilities = array( 'manage_options' );
		}

		foreach ( $allowed_capabilities as $capability ) {
			if ( ! is_string( $capability ) ) {
				continue;
			}

			$capability = trim( $capability );
			if ( '' === $capability ) {
				continue;
			}

			// phpcs:ignore WordPress.WP.Capabilities.Undetermined -- Capability list is filterable and validated as non-empty strings.
			if ( current_user_can( $capability ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns whether a valid embedding script is available in integration config.
	 *
	 * @return bool
	 */
	public function has_valid_embedding_script(): bool {
		return null !== $this->parse_embedding_script( Configs::get_embedding_script() );
	}

	/**
	 * Parse embedding script config and extract required runtime values.
	 *
	 * @param string $embedding_script Raw embedding script snippet.
	 * @return array{inline_init_js: string, bootstrap_src: string}|null
	 */
	private function parse_embedding_script( string $embedding_script ): ?array {
		$embedding_script = trim( $embedding_script );


		if ( '' === $embedding_script ) {
			return null;
		}

		if ( ! preg_match_all( '/<script\b([^>]*)>(.*?)<\/script>/is', $embedding_script, $script_tag_matches, PREG_SET_ORDER ) ) {
			return null;
		}

		if ( 2 !== count( $script_tag_matches ) ) {
			return null;
		}

		$non_script_content = preg_replace( '/<script\b([^>]*)>(.*?)<\/script>/is', '', $embedding_script );
		if ( ! is_string( $non_script_content ) || '' !== trim( $non_script_content ) ) {
			return null;
		}

		$first_script_tag  = $script_tag_matches[0];
		$second_script_tag = $script_tag_matches[1];

		$first_attributes  = $first_script_tag[1];
		$first_body        = trim( $first_script_tag[2] );
		$second_attributes = $second_script_tag[1];
		$second_body       = trim( $second_script_tag[2] );

		// First script must be inline and second script must be external without body content.
		if ( 1 === preg_match( '/\bsrc=(["\'])(.*?)\1/i', $first_attributes ) ) {
			return null;
		}
		if ( '' === $first_body || '' !== $second_body ) {
			return null;
		}

		if ( 1 !== preg_match( '/\bsrc=(["\'])(.*?)\1/i', $second_attributes, $src_match ) ) {
			return null;
		}

		$bootstrap_src = esc_url_raw( trim( $src_match[2] ) );

		if ( '' === $bootstrap_src || ! $this->is_valid_salesforce_url( $bootstrap_src ) ) {
			return null;
		}

		// Do not trust the pasted inline script. Extract only its parameters, validate
		// them, and rebuild the init script from a fixed template so no attacker-supplied
		// JavaScript from the snippet can run on the front end.
		$params = $this->parse_inline_init_params( $first_body );
		if ( null === $params ) {
			return null;
		}

		return array(
			'inline_init_js' => $this->build_inline_init_script( $params ),
			'bootstrap_src'  => $bootstrap_src,
		);
	}

	/**
	 * Extract and validate the Agentforce init parameters from the pasted inline script.
	 *
	 * Only these parameters are trusted from the snippet; everything else in the body is
	 * discarded and the script is rebuilt by build_inline_init_script().
	 *
	 * @param string $inline_body Inline (first) script body.
	 * @return array{org_id: string, deployment_name: string, site_url: string, scrt_url: string, language: string}|null
	 */
	private function parse_inline_init_params( string $inline_body ): ?array {
		// Pull the org id, deployment name and site URL from the three positional string
		// arguments of the bootstrap init call, plus its trailing settings object.
		if ( 1 !== preg_match(
			'/embeddedservice_bootstrap\.init\(\s*(["\'])(.*?)\1\s*,\s*(["\'])(.*?)\3\s*,\s*(["\'])(.*?)\5\s*,\s*\{(.*?)\}\s*\)/is',
			$inline_body,
			$init_match
		) ) {
			return null;
		}

		$org_id          = trim( $init_match[2] );
		$deployment_name = trim( $init_match[4] );
		$site_url        = esc_url_raw( trim( $init_match[6] ) );
		$settings_block  = $init_match[7];

		if ( 1 !== preg_match( '/\bscrt2URL\s*:\s*(["\'])(.*?)\1/is', $settings_block, $scrt_match ) ) {
			return null;
		}
		$scrt_url = esc_url_raw( trim( $scrt_match[2] ) );

		$language = '';
		if ( 1 === preg_match( '/embeddedservice_bootstrap\.settings\.language\s*=\s*(["\'])(.*?)\1/is', $inline_body, $language_match ) ) {
			$language = trim( $language_match[2] );
		}

		if ( 1 !== preg_match( '/^[A-Za-z0-9]{15,18}$/', $org_id ) ) {
			return null;
		}
		if ( 1 !== preg_match( '/^[A-Za-z0-9_]+$/', $deployment_name ) ) {
			return null;
		}
		if ( ! $this->is_valid_salesforce_url( $site_url ) || ! $this->is_valid_salesforce_url( $scrt_url ) ) {
			return null;
		}
		if ( '' !== $language && 1 !== preg_match( '/^[A-Za-z_-]{2,}$/', $language ) ) {
			return null;
		}

		return array(
			'org_id'          => $org_id,
			'deployment_name' => $deployment_name,
			'site_url'        => $site_url,
			'scrt_url'        => $scrt_url,
			'language'        => $language,
		);
	}

	/**
	 * Build the inline init script from validated parameters using a fixed template.
	 *
	 * Values are embedded with wp_json_encode so they are emitted as safe JS string
	 * literals and cannot break out of the template.
	 *
	 * @param array{org_id: string, deployment_name: string, site_url: string, scrt_url: string, language: string} $params Validated parameters.
	 * @return string
	 */
	private function build_inline_init_script( array $params ): string {
		$language_line = '';
		if ( '' !== $params['language'] ) {
			$language_line = sprintf(
				"\t\t\tembeddedservice_bootstrap.settings.language = %s;\n",
				wp_json_encode( $params['language'] )
			);
		}

		return sprintf(
			"function initEmbeddedMessaging() {\n" .
			"\ttry {\n" .
			'%s' .
			"\t\tembeddedservice_bootstrap.init(\n" .
			"\t\t\t%s,\n" .
			"\t\t\t%s,\n" .
			"\t\t\t%s,\n" .
			"\t\t\t{\n" .
			"\t\t\t\tscrt2URL: %s\n" .
			"\t\t\t}\n" .
			"\t\t);\n" .
			"\t} catch (err) {\n" .
			"\t\tconsole.error('Error loading Embedded Messaging: ', err);\n" .
			"\t}\n" .
			'}',
			$language_line,
			wp_json_encode( $params['org_id'] ),
			wp_json_encode( $params['deployment_name'] ),
			wp_json_encode( $params['site_url'] ),
			wp_json_encode( $params['scrt_url'] )
		);
	}

	/**
	 * Validate a Salesforce embed URL: HTTPS, on the Salesforce-owned suffix allowlist,
	 * and (when an instance URL is configured) belonging to that org.
	 *
	 * @param string $url Candidate URL.
	 * @return bool
	 */
	private function is_valid_salesforce_url( string $url ): bool {
		$parts = wp_parse_url( $url );
		if ( ! is_array( $parts ) ) {
			return false;
		}

		$scheme = $parts['scheme'] ?? '';
		if ( ! is_string( $scheme ) || 'https' !== strtolower( $scheme ) ) {
			return false;
		}

		$host = $parts['host'] ?? '';
		if ( ! is_string( $host ) || '' === trim( $host ) ) {
			return false;
		}

		return $this->is_allowed_bootstrap_host( strtolower( trim( $host ) ) );
	}

	/**
	 * Whether a host is an allowed Agentforce bootstrap host.
	 *
	 * Two layers: the host must sit under a Salesforce-owned domain suffix, and —
	 * when a Salesforce instance URL is configured — it must also belong to that
	 * org. The org pin stops a snippet from loading the bootstrap from another
	 * tenant's site on a shared Salesforce domain (e.g. `*.my.site.com`).
	 *
	 * @param string $host Lowercased, trimmed host.
	 * @return bool
	 */
	private function is_allowed_bootstrap_host( string $host ): bool {
		/**
		 * Filters the domain suffixes the Agentforce bootstrap script may be served from.
		 *
		 * @param string[] $allowed_suffixes Salesforce-owned domain suffixes (e.g. "my.site.com").
		 */
		$allowed_suffixes = apply_filters(
			'vip_agentforce_allowed_bootstrap_hosts',
			Constants::ALLOWED_BOOTSTRAP_HOST_SUFFIXES
		);

		if ( ! is_array( $allowed_suffixes ) ) {
			return false;
		}

		$suffix_allowed = false;
		foreach ( $allowed_suffixes as $suffix ) {
			if ( ! is_string( $suffix ) ) {
				continue;
			}

			$suffix = strtolower( ltrim( trim( $suffix ), '.' ) );
			if ( '' === $suffix ) {
				continue;
			}

			if ( $host === $suffix || str_ends_with( $host, '.' . $suffix ) ) {
				$suffix_allowed = true;
				break;
			}
		}

		if ( ! $suffix_allowed ) {
			return false;
		}

		// Pin the bootstrap host to the configured org's My Domain label when we
		// can derive one. Without an instance URL there is nothing to pin against,
		// so the suffix allowlist stands on its own.
		$org_label = $this->get_configured_org_label();
		if ( '' === $org_label ) {
			return true;
		}

		return $this->extract_org_label( $host ) === $org_label;
	}

	/**
	 * The Salesforce org label the bootstrap host is pinned to, derived from the
	 * configured instance (My Domain) URL. Empty when none is configured.
	 *
	 * @return string
	 */
	private function get_configured_org_label(): string {
		$instance_url = Configs::get_salesforce_instance_url();
		if ( '' === $instance_url ) {
			return '';
		}

		$org_label = $this->extract_org_label( $this->host_from_value( $instance_url ) );

		/**
		 * Filters the Salesforce org label the Agentforce bootstrap host is pinned to.
		 *
		 * Derived from the configured instance URL's My Domain label, with any sandbox
		 * or site qualifier stripped. Return an empty string to disable the org pin and
		 * fall back to the domain-suffix allowlist alone (e.g. for an Experience Cloud
		 * site whose host does not match the My Domain name).
		 *
		 * @param string $org_label    Derived org label (e.g. "acme").
		 * @param string $instance_url Configured Salesforce instance URL.
		 */
		$org_label = apply_filters( 'vip_agentforce_bootstrap_org_label', $org_label, $instance_url );

		return is_string( $org_label ) ? strtolower( trim( $org_label ) ) : '';
	}

	/**
	 * Extract the host from a URL, or accept a bare host when no scheme is present.
	 *
	 * @param string $value URL or host string.
	 * @return string Lowercased host, or empty string.
	 */
	private function host_from_value( string $value ): string {
		$value = trim( $value );
		if ( '' === $value ) {
			return '';
		}

		$parts = wp_parse_url( $value );
		if ( is_array( $parts ) && isset( $parts['host'] ) && is_string( $parts['host'] ) && '' !== $parts['host'] ) {
			return strtolower( $parts['host'] );
		}

		// No scheme: wp_parse_url puts a bare host in `path`. Strip any path segment.
		$host = strtolower( $value );
		$host = strtok( $host, '/' );

		return false === $host ? '' : $host;
	}

	/**
	 * The org label of a host: its first DNS label with any Salesforce sandbox or
	 * site qualifier stripped (e.g. `acme--dev.sandbox.my.site.com` -> `acme`).
	 *
	 * @param string $host Host name.
	 * @return string
	 */
	private function extract_org_label( string $host ): string {
		$host = strtolower( trim( $host ) );
		if ( '' === $host ) {
			return '';
		}

		$first_label = strtok( $host, '.' );
		if ( false === $first_label ) {
			return '';
		}

		return explode( '--', $first_label )[0];
	}
}
