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

class WPCOM_Concat_Utils__Replace_Relative_Url__TestCase extends WP_UnitTestCase {
	function get_test_data() {
		return array(
			// Relative URL with double quotes.
			'relative_url_double_quotes' => array(
				'src:url("social-logos.eot?51b607ee5b5cb2a0e4517176475a424c");',
				'src:url(/social-logos.eot?51b607ee5b5cb2a0e4517176475a424c);',
			),
			// Relative URL with double quotes subdir.
			'relative_url_double_quotes_subdir' => array(
				'src:url("social-logos.eot?51b607ee5b5cb2a0e4517176475a424c");',
				'src:url(/mysite/social-logos.eot?51b607ee5b5cb2a0e4517176475a424c);',
				'/mysite',
			),
			// Relative URL with single quotes.
			'relative_url_single_quotes' => array(
				'src:url(\'social-logos.eot?51b607ee5b5cb2a0e4517176475a424c\');',
				'src:url(/social-logos.eot?51b607ee5b5cb2a0e4517176475a424c);'
			),
			// Relative URL with single quotes subdir.
			'relative_url_single_quotes_subdir' => array(
				'src:url(\'social-logos.eot?51b607ee5b5cb2a0e4517176475a424c\');',
				'src:url(/mysite/social-logos.eot?51b607ee5b5cb2a0e4517176475a424c);',
				'/mysite',
			),
			// Relative URL no quotation marks.
			'relative_url_no_quotes' => array(
				'src:url(social-logos.eot?51b607ee5b5cb2a0e4517176475a424c);',
				'src:url(/social-logos.eot?51b607ee5b5cb2a0e4517176475a424c);',
			),
			// Relative URL no quotation marks subdir.
			'relative_url_no_quotes_subdir' => array(
				'src:url(social-logos.eot?51b607ee5b5cb2a0e4517176475a424c);',
				'src:url(/mysite/social-logos.eot?51b607ee5b5cb2a0e4517176475a424c);',
				'/mysite',
			),
			// Absolute URL double quotes.
			'absolute_url_double_quotes' => array(
				'src:url("https://fonts.googleapis.com/path/to/file.css");',
				'src:url("https://fonts.googleapis.com/path/to/file.css");',
			),
			// Absolute URL single quotes.
			'absolute_url_single_quotes' => array(
				'src:url(\'https://fonts.googleapis.com/path/to/file.css\');',
				'src:url(\'https://fonts.googleapis.com/path/to/file.css\');',
			),
			// Absolute URL no quotes.
			'absolute_url_no_quotes' => array(
				'src:url(https://fonts.googleapis.com/path/to/file.css);',
				'src:url(https://fonts.googleapis.com/path/to/file.css);',
			),
			// Relative URL containing hashtag in double quotes.
			'relative_url_with_hashtag_double_quotes' => array(
				'src:url("social-logos.eot?#iefix");',
				'src:url(/social-logos.eot?#iefix);',
			),
			// Relative URL containing hashtag in double quotes subdir.
			'relative_url_with_hashtag_double_quotes_subdir' => array(
				'src:url("social-logos.eot?#iefix");',
				'src:url(/mysite/social-logos.eot?#iefix);',
				'/mysite',
			),
			// Relative URL contaiing hashtag in single quotes.
			'relative_url_with_hashtag_single_quotes' => array(
				'src:url(\'social-logos.eot?#iefix\');',
				'src:url(/social-logos.eot?#iefix);',
			),
			// Relative URL contaiing hashtag in single quotes subdir.
			'relative_url_with_hashtag_single_quotes_subdir' => array(
				'src:url(\'social-logos.eot?#iefix\');',
				'src:url(/mysite/social-logos.eot?#iefix);',
				'/mysite',
			),
			// Relative URL containig hashtag w/o quotes.
			'relative_url_with_hashtag_no_quotes' => array(
				'src:url(social-logos.eot?#iefix);',
				'src:url(/social-logos.eot?#iefix);',
			),
			// Relative URL containig hashtag w/o quotes subdir.
			'relative_url_with_hashtag_no_quotes_subdir' => array(
				'src:url(social-logos.eot?#iefix);',
				'src:url(/mysite/social-logos.eot?#iefix);',
				'/mysite',
			),
			// Relative URL starting with hashtag double quotes.
			'relative_url_starting_with_hashtag_double_quotes' => array(
				'src:url("#social-logos.eot")',
				'src:url("#social-logos.eot")',
			),
			// Relative URL starting with hashtag single quotes.
			'relative_url_starting_with_hashtag_single_quotes' => array(
				'src:url(\'#social-logos.eot\')',
				'src:url(\'#social-logos.eot\')',
			),
			// Relative URL starting with hashtag no quotes.
			'relative_url_starting_with_hashtag_no_quotes' => array(
				'src:url(#social-logos.eot)',
				'src:url(#social-logos.eot)',
			),
			// data: URL double quotes.
			'data_url_double_quotes' => array(
				'src:url(url("data:application/x-font-woff;charset=utf-8;base64,d09GRk9UVE8AAEZAAAoAAAAAfBAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAA9AAAQsUAAHZfa1y5A0ZGVE0AAEO8AAAAGQAAABx4Dt9ZT1MvMgAAQ9gAAABKAAAAYEC7Yj5jbWFwAABEJAAAAIUAAAG6pEWcoGhlYWQAAESsAAAALwAAADYHEbeJaGhlYQAARNwAAAAdAAAAJAOvAd5obXR4AABE/AAAADgAAABeCDEE521heHAAAEU0AAAABgAAAAYALVAAbmFtZQAARTwAAADrAAAB5koHYmpwb3N0AABGKAAAABYAAAAg/8MAGnicrZ13mJXFFfDn3XbvVnb37i596SC9d8uLDQyKFXtD7F0RYzSGay9LDCpqjB1REaPR2CXCFbGB2ACR3otLWdje5zu/M++9QGK+fH98Dzyz804vZ86cOtczKSnG87zsKTdMvmrStX2vveGKG6YYL8l45qTaFqZ2rFc7Lqn2hOTaVinTs7zibW36ZyUXd3vVZqUUZ5jWp+fbkpJEJCv04mW102p7pbZLat2inTG57ZJuzmtn+rSb2jLf9KfJsGlhikx709X0NoPMSOObsWaCmWjON5PN1eYmc5uZZu43fzYzzTNmlnndvG0+NPPNF+Zbs8ysNpvMTlNmqk2Tl+Jlevlea6+j18Pr5w2Vf2O8k6Zef9XxAwcM5M+gAQPcn+BrkPsz2P0Z6v4Mc3+Guz8j9c9AV2+gqzf")',
				'src:url(url("data:application/x-font-woff;charset=utf-8;base64,d09GRk9UVE8AAEZAAAoAAAAAfBAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAA9AAAQsUAAHZfa1y5A0ZGVE0AAEO8AAAAGQAAABx4Dt9ZT1MvMgAAQ9gAAABKAAAAYEC7Yj5jbWFwAABEJAAAAIUAAAG6pEWcoGhlYWQAAESsAAAALwAAADYHEbeJaGhlYQAARNwAAAAdAAAAJAOvAd5obXR4AABE/AAAADgAAABeCDEE521heHAAAEU0AAAABgAAAAYALVAAbmFtZQAARTwAAADrAAAB5koHYmpwb3N0AABGKAAAABYAAAAg/8MAGnicrZ13mJXFFfDn3XbvVnb37i596SC9d8uLDQyKFXtD7F0RYzSGay9LDCpqjB1REaPR2CXCFbGB2ACR3otLWdje5zu/M++9QGK+fH98Dzyz804vZ86cOtczKSnG87zsKTdMvmrStX2vveGKG6YYL8l45qTaFqZ2rFc7Lqn2hOTaVinTs7zibW36ZyUXd3vVZqUUZ5jWp+fbkpJEJCv04mW102p7pbZLat2inTG57ZJuzmtn+rSb2jLf9KfJsGlhikx709X0NoPMSOObsWaCmWjON5PN1eYmc5uZZu43fzYzzTNmlnndvG0+NPPNF+Zbs8ysNpvMTlNmqk2Tl+Jlevlea6+j18Pr5w2Vf2O8k6Zef9XxAwcM5M+gAQPcn+BrkPsz2P0Z6v4Mc3+Guz8j9c9AV2+gqzf")',
			),
			'data_url_single_quotes' => array(
				'src:url(url(\'data:application/x-font-woff;charset=utf-8;base64,d09GRk9UVE8AAEZAAAoAAAAAfBAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAA9AAAQsUAAHZfa1y5A0ZGVE0AAEO8AAAAGQAAABx4Dt9ZT1MvMgAAQ9gAAABKAAAAYEC7Yj5jbWFwAABEJAAAAIUAAAG6pEWcoGhlYWQAAESsAAAALwAAADYHEbeJaGhlYQAARNwAAAAdAAAAJAOvAd5obXR4AABE/AAAADgAAABeCDEE521heHAAAEU0AAAABgAAAAYALVAAbmFtZQAARTwAAADrAAAB5koHYmpwb3N0AABGKAAAABYAAAAg/8MAGnicrZ13mJXFFfDn3XbvVnb37i596SC9d8uLDQyKFXtD7F0RYzSGay9LDCpqjB1REaPR2CXCFbGB2ACR3otLWdje5zu/M++9QGK+fH98Dzyz804vZ86cOtczKSnG87zsKTdMvmrStX2vveGKG6YYL8l45qTaFqZ2rFc7Lqn2hOTaVinTs7zibW36ZyUXd3vVZqUUZ5jWp+fbkpJEJCv04mW102p7pbZLat2inTG57ZJuzmtn+rSb2jLf9KfJsGlhikx709X0NoPMSOObsWaCmWjON5PN1eYmc5uZZu43fzYzzTNmlnndvG0+NPPNF+Zbs8ysNpvMTlNmqk2Tl+Jlevlea6+j18Pr5w2Vf2O8k6Zef9XxAwcM5M+gAQPcn+BrkPsz2P0Z6v4Mc3+Guz8j9c9AV2+gqzf\')',
				'src:url(url(\'data:application/x-font-woff;charset=utf-8;base64,d09GRk9UVE8AAEZAAAoAAAAAfBAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAA9AAAQsUAAHZfa1y5A0ZGVE0AAEO8AAAAGQAAABx4Dt9ZT1MvMgAAQ9gAAABKAAAAYEC7Yj5jbWFwAABEJAAAAIUAAAG6pEWcoGhlYWQAAESsAAAALwAAADYHEbeJaGhlYQAARNwAAAAdAAAAJAOvAd5obXR4AABE/AAAADgAAABeCDEE521heHAAAEU0AAAABgAAAAYALVAAbmFtZQAARTwAAADrAAAB5koHYmpwb3N0AABGKAAAABYAAAAg/8MAGnicrZ13mJXFFfDn3XbvVnb37i596SC9d8uLDQyKFXtD7F0RYzSGay9LDCpqjB1REaPR2CXCFbGB2ACR3otLWdje5zu/M++9QGK+fH98Dzyz804vZ86cOtczKSnG87zsKTdMvmrStX2vveGKG6YYL8l45qTaFqZ2rFc7Lqn2hOTaVinTs7zibW36ZyUXd3vVZqUUZ5jWp+fbkpJEJCv04mW102p7pbZLat2inTG57ZJuzmtn+rSb2jLf9KfJsGlhikx709X0NoPMSOObsWaCmWjON5PN1eYmc5uZZu43fzYzzTNmlnndvG0+NPPNF+Zbs8ysNpvMTlNmqk2Tl+Jlevlea6+j18Pr5w2Vf2O8k6Zef9XxAwcM5M+gAQPcn+BrkPsz2P0Z6v4Mc3+Guz8j9c9AV2+gqzf\')',
			),
			// Absolute URL non-secure double quotes.
			'absolute_url_http_double_quotes' => array(
				'src:url("http://fonts.googleapis.com/path/to/file.css")',
				'src:url("http://fonts.googleapis.com/path/to/file.css")',
			),
			// Absolute URL non-secure single quotes.
			'absolute_url_http_single_quotes' => array(
				'src:url(\'http://fonts.googleapis.com/path/to/file.css\')',
				'src:url(\'http://fonts.googleapis.com/path/to/file.css\')',
			),
			// Absolute URL non-secure no quotes.
			'absolute_url_http_no_quotes' => array(
				'src:url(http://fonts.googleapis.com/path/to/file.css)',
				'src:url(http://fonts.googleapis.com/path/to/file.css)',
			),
			// Absolute URL containing hashtag
			'absolute_url_containig_hashtag' => array(
				'src:url(http://fonts.googleapis.com/path/to/file.css#iefix)',
				'src:url(http://fonts.googleapis.com/path/to/file.css#iefix)',
			),
		);
	}

	/**
	 * @dataProvider get_test_data
	 */
	function test__function( $test_string, $expected, $dirpath = '/' ) {
		$actual = WPCOM_Concat_Utils::relative_path_replace( $test_string, $dirpath );
		$this->assertSame( $expected, $actual );
	}
}
