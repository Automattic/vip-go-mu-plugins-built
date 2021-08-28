<?php

class EP_Debug_Bar_Query_Log {

	/**
	 * Setup the logging page
	 *
	 * @since 1.3
	 */
	public function setup() {
		if ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK ) { // Must be network admin in multisite.
			add_action( 'network_admin_menu', array( $this, 'action_admin_menu' ),11 );
		} else {
			add_action( 'admin_menu', array( $this, 'action_admin_menu' ), 11 );
		}

		add_action( 'ep_remote_request', array( $this, 'log_query' ), 10, 2 );
		add_action( 'admin_init', array( $this, 'action_admin_init' ) );
		add_action( 'admin_init', array( $this, 'maybe_clear_log' ) );
	}

	/**
	 * Save logging settings
	 * 
	 * @since 1.3
	 */
	public function action_admin_init() {

		//Save options for multisite
		if ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK && isset( $_POST['ep_enable_logging'] ) ) {
			check_admin_referer( 'ep-debug-options' );

			update_site_option( 'ep_enable_logging', (int) $_POST['ep_enable_logging'] );
		} else {
			register_setting( 'ep-debug', 'ep_enable_logging', 'intval' );
		}
	}

	/**
	 * Clear query log
	 *
	 * @since  1.3
	 */
	public function maybe_clear_log() {
		if ( empty( $_GET['ep_clear_query_log'] ) || ! wp_verify_nonce( $_GET['ep_clear_query_log'], 'ep_clear_query_log' ) ) {
			return;
		}

		if ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK ) {
			delete_site_option( 'ep_query_log' );
		} else {
			delete_option( 'ep_query_log' );
		}

		wp_redirect( remove_query_arg( 'ep_clear_query_log' ) );
	}

	/**
	 * Add options page
	 *
	 * @since 1.3
	 * @return void
	 */
	public function action_admin_menu() {
		add_submenu_page( 'elasticpress', esc_html__( 'Query Log', 'debug-bar' ), esc_html__( 'Query Log', 'debug-bar' ), 'manage_options', 'ep-query-log', array( $this, 'screen_options' ) );
	}

	/**
	 * Only log delete index error if not 2xx AND not 404
	 * 
	 * @param  array $query
	 * @since  1.3
	 * @return bool
	 */
	public function maybe_log_delete_index( $query ) {
		$response_code = wp_remote_retrieve_response_code( $query['request'] );

		return ( ( $response_code < 200 || $response_code > 299 ) && 404 !== $response_code );
	}

	/**
	 * Log all non-200 requests
	 * 
	 * @param  array $query
	 * @since  1.3
	 * @return bool
	 */
	public function is_query_error( $query ) {
		if ( is_wp_error( $query['request'] ) ) {
			return true;
		}
		
		$response_code = wp_remote_retrieve_response_code( $query['request'] );

		return ( $response_code < 200 || $response_code > 299 );
	}

	/**
	 * Conditionally save a query to the log which is stored in options. This is a big performance hit so be careful.
	 * 
	 * @param  array $query
	 * @param  string $type
	 * @since  1.3
	 */
	public function log_query( $query, $type ) {
		if ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK ) {
			$enabled = get_site_option( 'ep_enable_logging' );
		} else {
			$enabled = get_option( 'ep_enable_logging' );
		}

		if ( empty( $enabled ) ) {
			return;
		}

		/**
		 * This filter allows you to map query types to callables. If the callable returns true,
		 * that query will be logged.
		 * 
		 * @var    array
		 * @since  1.3
		 */
		$allowed_log_types = apply_filters( 'ep_debug_bar_allowed_log_types', array(
			'put_mapping'          => array( $this, 'is_query_error' ),
			'delete_network_alias' => array( $this, 'is_query_error' ),
			'create_network_alias' => array( $this, 'is_query_error' ),
			'bulk_index_posts'     => array( $this, 'is_query_error' ),
			'delete_index'         => array( $this, 'maybe_log_delete_index' ),
			'create_pipeline'      => array( $this, 'is_query_error' ),
			'get_pipeline'         => array( $this, 'is_query_error' ),
			'query'                => array( $this, 'is_query_error' ),
		), $query, $type );

		if ( isset( $allowed_log_types[ $type ] ) ) {
			$do_log = call_user_func( $allowed_log_types[ $type ], $query );

			if ( ! $do_log ) {
				return;
			}
		} else {
			return;
		}

		if ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK ) {
			$log = get_site_option( 'ep_query_log', array() );
		} else {
			$log = get_option( 'ep_query_log', array() );
		}

		$log[] = array(
			'query' => $query,
			'type' => $type,
		);

		if ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK ) {
			update_site_option( 'ep_query_log', $log );
		} else {
			update_option( 'ep_query_log', $log );
		}
	}

	/**
	 * Output query log page
	 * 
	 * @since 1.3
	 */
	public function screen_options() {
		if ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK ) {
			$log = get_site_option( 'ep_query_log', array() );
			$enabled = get_site_option( 'ep_enable_logging' );
		} else {
			$log = get_option( 'ep_query_log', array() );
			$enabled = get_option( 'ep_enable_logging' );
		}

		if ( is_array( $log ) ) {
			$log = array_reverse( $log );
		}

		$action = 'options.php';

		if ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK ) {
			$action = '';
		}
		?>

		<div class="wrap">
			<h2><?php esc_html_e( 'ElasticPress Query Log', 'debug-bar' ); ?></h2>

			<form action="<?php echo $action; ?>" method="post">
				<?php settings_fields( 'ep-debug' ); ?>
				<?php settings_errors(); ?>

				<table class="form-table">
					<tbody>
						<tr>
							<th scope="row"><label for="ep_enable_logging"><?php esc_html_e( 'Enable or disable query logging:', 'debug-bar' ); ?></label></th>
							<td>
								<select name="ep_enable_logging" id="ep_enable_logging">
									<option value="0"><?php esc_html_e( 'Disable', 'debug-bar' ); ?></option>
									<option <?php selected( 1, $enabled ); ?> value="1"><?php esc_html_e( 'Enable', 'debug-bar' ); ?></option>
								</select>
								<br>
								<span class="description"><?php _e( 'Note that query logging can have <strong>severe</strong> performance implications on your website. We generally recommend only enabling logging during dashboard indexing and disabling after.', 'debug-bar' ); ?></span>
							</td>
						</tr>
					</tbody>
				</table>

				<p class="submit">
					<input type="submit" name="submit" id="submit" class="button button-primary" value="<?php esc_html_e( 'Save Changes', 'debug-bar' ); ?>">
					
					<?php if ( ! empty( $log ) ) : ?>
						<a class="button" href="<?php echo esc_url( add_query_arg( array( 'ep_clear_query_log' => wp_create_nonce( 'ep_clear_query_log' ) ) ) ); ?>"><?php esc_html_e( 'Empty Log', 'debug-bar' ); ?></a>
					<?php endif; ?>
				</p>
			</form>

			<?php if ( empty( $log ) ) : ?>
				<p><?php esc_html_e( 'No queries to show', 'debug-bar' ); ?></p>
			<?php else : ?>

				<ol class="wpd-queries ep-queries-debug">
					<?php foreach ( $log as $log_entry ) :
						$query_time = ( ! empty( $log_entry['query']['time_start'] ) && ! empty( $log_entry['query']['time_finish'] ) ) ? $log_entry['query']['time_finish'] - $log_entry['query']['time_start'] : false;

						$result = wp_remote_retrieve_body( $log_entry['query']['request'] );
						$response = wp_remote_retrieve_response_code( $log_entry['query']['request'] );

						$class = $response < 200 || $response >= 300 ? 'ep-query-failed' : '';

						$curl_request = 'curl -X' . strtoupper( $log_entry['query']['args']['method'] );

						if ( ! empty( $log_entry['query']['args']['headers'] ) ) {
							foreach ( $log_entry['query']['args']['headers'] as $key => $value ) {
								$curl_request .= " -H '$key: $value'";
							}
						}

						if ( ! empty( $query['query']['args']['body'] ) ) {
							$curl_request .= " -d '" . json_encode( json_decode( $log_entry['query']['args']['body'], true ) ) . "'";
						}

						$curl_request .= " '" . $log_entry['query']['url'] . "'";

						?><li class="ep-query-debug hide-query-body hide-query-results hide-query-errors hide-query-args hide-query-headers <?php echo sanitize_html_class( $class ); ?>">
							<div class="ep-query-type">
								<strong><?php esc_html_e( 'Type:', 'debug-bar' ); ?></strong>
								<?php echo esc_html( $log_entry['type'] ); ?>
							</div>
							<div class="ep-query-host">
								<strong><?php esc_html_e( 'Host:', 'debug-bar' ); ?></strong>
								<?php echo esc_html( $log_entry['query']['host'] ); ?>
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
								<?php echo esc_url( $log_entry['query']['url'] ); ?>
							</div>

							<div class="ep-query-method">
								<strong><?php esc_html_e( 'Method:', 'debug-bar' ); ?></strong>
								<?php echo esc_html( $log_entry['query']['args']['method'] ); ?>
							</div>

							<?php if ( ! empty( $log_entry['query']['args']['headers'] ) ) : ?>
								<div clsas="ep-query-headers">
									<strong><?php esc_html_e( 'Headers:', 'debug-bar' ); ?> <div class="query-headers-toggle dashicons"></div></strong>
									<pre class="query-headers"><?php echo var_dump( $log_entry['query']['args']['headers'] ); ?></pre>
								</div>
							<?php endif; ?>

							<?php if ( ! empty( $log_entry['query']['query_args'] ) ) : ?>
								<div class="ep-query-args">
									<strong><?php esc_html_e( 'Query Args:', 'debug-bar' ); ?> <div class="query-args-toggle dashicons"></div></strong>
									<pre class="query-args"><?php echo var_dump( $log_entry['query']['query_args'] ); ?></pre>
								</div>
							<?php endif; ?>

							<?php if ( ! empty( $log_entry['query']['args']['body'] ) ) : ?>
								<div class="ep-query-body">
									<strong><?php esc_html_e( 'Query Body:', 'debug-bar' ); ?> <div class="query-body-toggle dashicons"></div></strong>
									<pre class="query-body"><?php echo esc_html( stripslashes( json_encode( json_decode( $log_entry['query']['args']['body'], true ), JSON_PRETTY_PRINT ) ) ); ?></pre>
								</div>
							<?php endif; ?>

							<?php if ( ! is_wp_error( $log_entry['query']['request'] ) ) : ?>

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
									<pre class="query-errors"><?php echo esc_html( stripslashes( json_encode( $log_entry['query']['request']->errors, JSON_PRETTY_PRINT ) ) ); ?></pre>
								</div>
							<?php endif; ?>
							<a class="copy-curl" data-request="<?php echo esc_attr( addcslashes( $curl_request, '"' ) ); ?>">Copy cURL Request</a>
						</li>
					<?php endforeach; ?>
				</ol>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
     * Return an instance of the current class, create one if it doesn't exist
     *
	 * @since 1.3
     * @return object
     */
    public static function factory() {
    	static $instance;

        if ( empty( $instance ) ) {
            $instance = new self();
            $instance->setup();
        }

        return $instance;
    }
}
