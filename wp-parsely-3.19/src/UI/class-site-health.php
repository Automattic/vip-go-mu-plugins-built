<?php
/**
 * UI: Site Health
 *
 * Extends WordPress Core's site health with the plugin's debug information.
 *
 * @package Parsely
 * @since 3.4.0
 */

declare(strict_types=1);

namespace Parsely\UI;

use Parsely\Parsely;

/**
 * Provides debug information about the plugin.
 *
 * @since 3.4.0
 *
 * @phpstan-type Site_Health_Info array{
 *   parsely?: Parsely_Health_Info
 * }
 *
 * @phpstan-type Parsely_Health_Info array{
 *   label: string,
 *   description: string,
 *   show_count: bool,
 *   fields: array<string, mixed>,
 * }
 */
final class Site_Health {
	/**
	 * Instance of Parsely class.
	 *
	 * @var Parsely
	 */
	private $parsely;

	/**
	 * Constructor.
	 *
	 * @param Parsely $parsely Instance of Parsely class.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;
	}

	/**
	 * Registers the site health methods.
	 *
	 * @since 3.4.0
	 */
	public function run(): void {
		add_filter( 'site_status_tests', array( $this, 'check_site_id' ) );
		add_filter( 'debug_information', array( $this, 'options_debug_info' ) );
	}

	/**
	 * Adds a healthcheck function that tests whether the Site ID is set or not.
	 *
	 * @since 3.4.0
	 *
	 * @param array<string, mixed> $tests An associative array of direct and asynchronous tests.
	 * @return array<string, mixed>
	 */
	public function check_site_id( array $tests ): array {
		$test = function () {
			$result = array(
				'label'       => __( 'The Site ID is correctly set up', 'wp-parsely' ),
				'status'      => 'good',
				'badge'       => array(
					'label' => 'Parse.ly',
					'color' => 'green',
				),
				'description' => sprintf(
					'<p>%s</p>',
					__( 'Your Site ID uniquely represents your site within Parse.ly. It is required for the tracking to work correctly.', 'wp-parsely' )
				),
				'test'        => 'loopback_requests',
			);

			if ( $this->parsely->site_id_is_missing() ) {
				$result['status']  = 'critical';
				$result['label']   = __( 'You need to provide the Site ID', 'wp-parsely' );
				$result['actions'] = __( 'The site ID can be set in the <a href="/wp-admin/admin.php?page=parsely-settings">Parse.ly Settings Page</a>.', 'wp-parsely' );
			}

			return $result;
		};

		/**
		 * Variable.
		 *
		 * @var array<mixed>
		 */
		$direct            = $tests['direct'];
		$direct['parsely'] = array(
			'label' => __( 'Parse.ly Site ID', 'wp-parsely' ),
			'test'  => $test,
		);

		return $tests;
	}

	/**
	 * Adds the Parse.ly options to core's debug information array.
	 *
	 * @since 3.4.0
	 *
	 * @param Site_Health_Info $args The debug information to be added to the core information page.
	 * @return Site_Health_Info
	 */
	public function options_debug_info( $args ) {
		$options = $this->parsely->get_options();
		unset( $options['api_secret'], $options['metadata_secret'] );

		$args['parsely'] = array(
			'label'       => __( 'Parse.ly Options', 'wp-parsely' ),
			'description' => __( 'Shows the options stored in the database used by the wp-parsely plugin.', 'wp-parsely' ),
			'show_count'  => true,
		);

		foreach ( $options as $name => $value ) {
			$args['parsely']['fields'][ $name ] = array(
				'label' => $name,
				'value' => $value,
			);
		}

		return $args;
	}
}
