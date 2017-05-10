<?php

class WPCOM_Concat_Utils__Is_External_Url__TestCase extends WP_UnitTestCase {
	function get_test_data() {
		return array(
			// External
			'single_site__external_url' => array(
				'https://fonts.googleapis.com/path/to/file.css',
				'https://example.com',
				false,
			),
			
			'subdir_site__external_url' => array(
				'https://fonts.googleapis.com/path/to/file.css',
				'https://example.com/mysite',
				false,
			),

			// Interal: Full URL
			'single_site__internal_url' => array(
				'https://example.com/wp-content/plugins/plugin/style.css',
				'https://example.com',
				true,
			),

			'single_site_trailingslash__internal_url' => array(
				'https://example.com/wp-content/plugins/plugin/style.css',
				'https://example.com/',
				true,
			),


			'subdir_site__internal_subdir_url' => array(
				'https://example.com/mysite/wp-content/plugins/plugin/style.css',
				'https://example.com/mysite',
				true,
			),

			'subdir_site__internal_root_url' => array(
				'https://example.com/wp-content/plugins/plugin/style.css',
				'https://example.com/mysite',
				false,
			),

			// Internal: absolute (i.e. no host, /wp-content/path/to/file.css)
			'single_site__internal_absolute_url' => array(
				'/wp-content/plugins/plugin/style.css',
				'https://example.com',
				true,
			),

			'subdir_site__internal_absolute_url' => array(
				'/wp-content/plugins/plugin/style.css',
				'https://example.com/mysite',
				true,
			),
		);
	}

	/**
	 * @dataProvider get_test_data
	 */
	function test__function( $test_url, $site_url, $expected ) {
		$actual = WPCOM_Concat_Utils::is_internal_url( $test_url, $site_url );

		$this->assertSame( $expected, $actual );
	}
}
