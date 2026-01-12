<?php
/**
 * Headline Testing feature class
 *
 * @package Parsely
 * @since   3.21.0
 */

declare(strict_types=1);

namespace Parsely;

/**
 * Handles the Headline Testing feature functionality.
 *
 * @since 3.21.0
 *
 * @phpstan-import-type Parsely_Options_Headline_Testing from Parsely
 */
class Headline_Testing {
	/**
	 * Instance of Parsely class.
	 *
	 * @var Parsely
	 */
	protected $parsely;

	/**
	 * Data attributes to be added to the one-line script tag.
	 *
	 * @var array<string>
	 */
	private $data_attributes = array();

	/**
	 * Constructor.
	 *
	 * @since 3.21.0
	 *
	 * @param Parsely $parsely Instance of Parsely class.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;
	}

	/**
	 * Registers the Headline Testing feature.
	 *
	 * @since 3.21.0
	 */
	public function run(): void {
		if ( false === $this->can_enable_feature() ) {
			return;
		}

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_headline_testing_script' ) );
	}

	/**
	 * Returns whether the Headline Testing feature can be enabled.
	 *
	 * @since 3.21.0
	 *
	 * @return bool True if the feature can be enabled, false otherwise.
	 */
	public function can_enable_feature(): bool {
		$options = $this->parsely->get_options();

		return true === $options['headline_testing']['enabled'] &&
			'' !== $this->parsely->get_site_id();
	}

	/**
	 * Enqueues the Headline Testing script, in accordance to the
	 * installation_method option.
	 *
	 * @since 3.21.0
	 */
	public function enqueue_headline_testing_script(): void {
		$options = $this->parsely->get_options();
		$site_id = $this->parsely->get_site_id();

		$headline_testing_options = $options['headline_testing'];
		$installation_method      = $headline_testing_options['installation_method'];

		if ( 'one_line' === $installation_method ) {
			$this->enqueue_one_line_script( $headline_testing_options, $site_id );
		} else {
			$this->enqueue_advanced_script( $headline_testing_options, $site_id );
		}
	}

	/**
	 * Enqueues the one-line snippet script.
	 *
	 * @since 3.21.0
	 *
	 * @param Parsely_Options_Headline_Testing $options The headline testing options.
	 * @param string                           $site_id The Parse.ly site ID.
	 */
	private function enqueue_one_line_script( $options, string $site_id ): void {
		$script_url = 'https://experiments.parsely.com/vip-experiments.js?apiKey=' . rawurlencode( $site_id );

		// Build data attributes string.
		$data_attributes = array();

		if ( $options['enable_live_updates'] ) {
			$data_attributes[] = 'data-enable-live-updates="true"';

			$timeout = absint( $options['live_update_timeout'] );
			if ( 30000 !== $timeout ) {
				$data_attributes[] = 'data-live-update-timeout="' . esc_attr( (string) $timeout ) . '"';
			}
		}

		if ( $options['allow_after_content_load'] ) {
			$data_attributes[] = 'data-allow-after-content-load="true"';
		}

		// Store data attributes and add filter to modify the script tag.
		if ( count( $data_attributes ) > 0 ) {
			$this->data_attributes = $data_attributes;

			if ( false === has_filter(
				'script_loader_tag',
				array( $this, 'add_data_attributes_to_script_tag' )
			) ) {
				add_filter(
					'script_loader_tag',
					array( $this, 'add_data_attributes_to_script_tag' ),
					10,
					2
				);
			}
		}

		// Register and enqueue the script.
		wp_register_script(
			'parsely-headline-testing-one-line',
			$script_url,
			array(),
			PARSELY_VERSION,
			false
		);

		wp_enqueue_script( 'parsely-headline-testing-one-line' );
	}

	/**
	 * Adds data attributes to the one-line script tag.
	 *
	 * @since 3.21.0
	 *
	 * @param string $tag    The script tag.
	 * @param string $handle The script handle.
	 * @return string The modified script tag.
	 */
	public function add_data_attributes_to_script_tag( string $tag, string $handle ): string {
		if ( 'parsely-headline-testing-one-line' === $handle ) {
			// Insert data attributes before the closing > of the script tag.
			$tag = str_replace( '></script>', ' ' . implode( ' ', $this->data_attributes ) . '></script>', $tag );
		}

		return $tag;
	}

	/**
	 * Enqueues the advanced installation script.
	 *
	 * @since 3.21.0
	 *
	 * @param Parsely_Options_Headline_Testing $options The headline testing options.
	 * @param string                           $site_id The Parse.ly site ID.
	 */
	private function enqueue_advanced_script( $options, string $site_id ): void {
		$config_options = array();

		if ( $options['enable_flicker_control'] ) {
			$config_options[] = 'enableFlickerControl: true';
		}

		if ( $options['enable_live_updates'] ) {
			$config_options[] = 'enableLiveUpdates: true';

			$timeout          = absint( $options['live_update_timeout'] );
			$config_options[] = 'liveUpdateTimeout: ' . $timeout;
		}

		if ( $options['allow_after_content_load'] ) {
			$config_options[] = 'allowAfterContentLoad: true';
		}

		$config_str = count( $config_options ) > 0 ? ', {' . implode( ', ', $config_options ) . '}' : '';

		$script_content = '!function(){"use strict";var e=window.VIP_EXP=window.VIP_EXP||{config:{}};e.loadVIPExp=function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};t&&(e.config=n,e.config.apikey=t,function(e){if(!e)return;var t="https://experiments.parsely.com/vip-experiments.js"+"?apiKey=".concat(e),n=document.createElement("script");n.src=t,n.type="text/javascript",n.fetchPriority="high";var i=document.getElementsByTagName("script")[0];i&&i.parentNode&&i.parentNode.insertBefore(n,i)}(t),n.enableFlickerControl&&function(){var t,n;if(null!==(t=performance)&&void 0!==t&&null!==(n=t.getEntriesByName)&&void 0!==n&&null!==(n=n.call(t,"first-contentful-paint"))&&void 0!==n&&n[0])return;var i="vipexp-fooc-prevention";e.config.disableFlickerControl=function(){var e=document.getElementById(i);null!=e&&e.parentNode&&e.parentNode.removeChild(e)};var o=document.createElement("style");o.setAttribute("type","text/css"),o.appendChild(document.createTextNode("body { visibility: hidden; }")),o.id=i,document.head.appendChild(o),window.setTimeout(e.config.disableFlickerControl,500)}())},e.loadVIPExp("' . esc_js( $site_id ) . '"' . $config_str . ')}();';

		// Register and enqueue the inline script.
		wp_register_script(
			'parsely-headline-testing-advanced',
			'',
			array(),
			PARSELY_VERSION,
			false
		);

		wp_add_inline_script( 'parsely-headline-testing-advanced', $script_content );
		wp_enqueue_script( 'parsely-headline-testing-advanced' );
	}
}
