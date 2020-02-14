<?php

class EP_Debug_Bar_ElasticPress extends Debug_Bar_Panel {

	/**
	 * Panel menu title
	 */
	public $title;

	/**
	 * Initial debug bar stuff
	 */
	public function init() {
		$this->title( esc_html__( 'ElasticPress', 'debug-bar' ) );

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts_styles' ) );
	}

	/**
	 * Enqueue scripts for front end and admin
	 */
	public function enqueue_scripts_styles() {
		wp_enqueue_script( 'debug-bar-elasticpress', plugins_url( '../assets/js/main.js' , __FILE__ ), array( 'jquery' ), EP_DEBUG_VERSION, true );
		wp_enqueue_style( 'debug-bar-elasticpress', plugins_url( '../assets/css/main.css' , __FILE__ ), array(), EP_DEBUG_VERSION );
	}

	/**
	 * Show the menu item in Debug Bar.
	 */
	public function prerender() {
		$this->set_visible( true );
	}

	/**
	 * Show the contents of the panel
	 */
	public function render() {
		if ( ! defined( 'EP_VERSION' ) ) {
			esc_html_e( 'ElasticPress not activated.', 'debug-bar' );
			return;
		}

		if ( function_exists( 'ep_get_query_log' ) ) {
			$queries = ep_get_query_log();
		} else {
			if ( class_exists( '\ElasticPress\Elasticsearch' ) ) {
				$queries = \ElasticPress\Elasticsearch::factory()->get_query_log();
			} else {
				esc_html_e( 'ElasticPress not at least version 1.8.', 'debug-bar' );
				return;
			}
		}
		$total_query_time = 0;

		foreach ( $queries as $query ) {
			if ( ! empty( $query['time_start'] ) && ! empty( $query['time_finish'] ) ) {
				$total_query_time += ( $query['time_finish'] - $query['time_start'] );
			}
		}

		?>

		<h2><?php printf( __( '<span>Total ElasticPress Queries:</span> %d', 'debug-bar' ), count( $queries ) ); ?></h2>
		<h2><?php printf( __( '<span>Total Blocking ElasticPress Query Time:</span> %d ms', 'debug-bar' ), (int) ( $total_query_time * 1000 ) ); ?></h2><?php

		if ( empty( $queries ) ) :

			?><ol class="wpd-queries">
				<li><?php esc_html_e( 'No queries to show', 'debug-bar' ); ?></li>
			</ol><?php

		else :

			?><ol class="wpd-queries ep-queries-debug"><?php

				foreach ( $queries as $query ) :
					$query_time = ( ! empty( $query['time_start'] ) && ! empty( $query['time_finish'] ) ) ? $query['time_finish'] - $query['time_start'] : false;

					$result = wp_remote_retrieve_body( $query['request'] );
					$response = wp_remote_retrieve_response_code( $query['request'] );

					$class = $response < 200 || $response >= 300 ? 'ep-query-failed' : '';

					$curl_request = 'curl -X' . strtoupper( $query['args']['method'] );

					if ( ! empty( $query['args']['headers'] ) ) {
						foreach ( $query['args']['headers'] as $key => $value ) {
							$curl_request .= " -H '$key: $value'";
						}
					}

					if ( ! empty( $query['args']['body'] ) ) {
						$curl_request .= " -d '" . json_encode( json_decode( $query['args']['body'], true ) ) . "'";
					}

					$curl_request .= " '" . $query['url'] . "'";

					?><li class="ep-query-debug hide-query-body hide-query-results hide-query-errors hide-query-args hide-query-headers <?php echo sanitize_html_class( $class ); ?>">
						<div class="ep-query-host">
							<strong><?php esc_html_e( 'Host:', 'debug-bar' ); ?></strong>
							<?php echo esc_html( $query['host'] ); ?>
						</div>

						<div class="ep-query-time"><?php
							if ( ! empty( $query_time ) ) :
								printf( __( '<strong>Time Taken:</strong> %d ms', 'debug-bar' ), ( $query_time * 1000 ) );
							else :
								_e( '<strong>Time Taken:</strong> -', 'debug-bar' );
							endif;
						?></div>

						<div class="ep-query-url">
							<strong><?php esc_html_e( 'URL:', 'debug-bar' ); ?></strong>
							<?php echo esc_url( $query['url'] ); ?>
						</div>

						<div class="ep-query-method">
							<strong><?php esc_html_e( 'Method:', 'debug-bar' ); ?></strong>
							<?php echo esc_html( $query['args']['method'] ); ?>
						</div>

						<?php if ( ! empty( $query['args']['headers'] ) ) : ?>
							<div clsas="ep-query-headers">
								<strong><?php esc_html_e( 'Headers:', 'debug-bar' ); ?> <div class="query-headers-toggle dashicons"></div></strong>
								<pre class="query-headers"><?php echo var_dump( $query['args']['headers'] ); ?></pre>
							</div>
						<?php endif; ?>

						<?php if ( ! empty( $query['query_args'] ) ) : ?>
							<div clsas="ep-query-args">
								<strong><?php esc_html_e( 'Query Args:', 'debug-bar' ); ?> <div class="query-args-toggle dashicons"></div></strong>
								<pre class="query-args"><?php echo var_dump( $query['query_args'] ); ?></pre>
							</div>
						<?php endif; ?>

						<?php if ( ! empty( $query['args']['body'] ) ) : ?>
							<div clsas="ep-query-body">
								<strong><?php esc_html_e( 'Query Body:', 'debug-bar' ); ?> <div class="query-body-toggle dashicons"></div></strong>
								<pre class="query-body"><?php echo esc_html( stripslashes( json_encode( json_decode( $query['args']['body'], true ), JSON_PRETTY_PRINT ) ) ); ?></pre>
							</div>
						<?php endif; ?>

						<?php if ( ! is_wp_error( $query['request'] ) ) : ?>

							<div class="ep-query-response-code">
								<?php printf( __( '<strong>Query Response Code:</strong> HTTP %d', 'debug-bar' ), (int) $response ); ?>
							</div>

							<div class="ep-query-result">
								<strong><?php esc_html_e( 'Query Result:', 'debug-bar' ); ?> <div class="query-result-toggle dashicons"></div></strong>
								<pre class="query-results"><?php echo esc_html( stripslashes( json_encode( json_decode( $result, true ), JSON_PRETTY_PRINT ) ) ); ?></pre>
							</div>
						<?php else : ?>
							<div class="ep-query-response-code">
								<strong><?php esc_html_e( 'Query Response Code:', 'debug-bar' ); ?></strong> <?php esc_html_e( 'Request Error', 'debug-bar' ); ?>
							</div>
							<div clsas="ep-query-errors">
								<strong><?php esc_html_e( 'Errors:', 'debug-bar' ); ?> <div class="query-errors-toggle dashicons"></div></strong>
								<pre class="query-errors"><?php echo esc_html( stripslashes( json_encode( $query['request']->errors, JSON_PRETTY_PRINT ) ) ); ?></pre>
							</div>
						<?php endif; ?>
						<a class="copy-curl" data-request="<?php echo esc_attr( addcslashes( $curl_request, '"' ) ); ?>">Copy cURL Request</a>
					</li><?php
					
				endforeach;

			?></ol><?php

		endif;
	}

}
