<?php
/**
 * Rewrite Rules Inspector class
 *
 * @package automattic\rewrite-rules-inspector
 * @since 1.3.0
 */

/**
 * Main class for the plugin.
 *
 * @since 1.0.0
 */
class Rewrite_Rules_Inspector {

	/**
	 * Which admin menu parent the Rewrite Rules Inspector page will appear under. Default is Tools.
	 *
	 * @var string $parent_slug
	 */
	public $parent_slug = 'tools.php';

	/**
	 * Rewrite Rules Inspector page slug.
	 *
	 * @var string $page_slug
	 */
	public $page_slug = 'rewrite-rules-inspector';

	/**
	 * Capability needed to view the Rewrite Rules Inspector page.
	 *
	 * @var string $view_cap
	 */
	public $view_cap = 'manage_options';

	/**
	 * Whether or not users can flush the rewrite rules from this tool.
	 *
	 * @var bool $flushing_enabled
	 */
	public $flushing_enabled = true;

	/**
	 * Sources of rules.
	 *
	 * @var array $sources
	 */
	public $sources = array();

	/**
	 * Run the integration.
	 *
	 * @since 1.3.0
	 */
	public function run() {
		// This plugin only runs in the admin, but we need it initialized on init.
		add_action( 'init', array( $this, 'action_init' ) );
	}

	/**
	 * Initialize the plugin.
	 *
	 * @since 1.0.0
	 */
	public function action_init() {
		if ( ! is_admin() ) {
			return;
		}

		add_action( 'admin_menu', array( $this, 'action_admin_menu' ) );

		// Allow the view to be placed elsewhere than tools.php.
		$this->parent_slug = apply_filters( 'rri_parent_slug', $this->parent_slug );

		// Whether or not users can flush the rewrite rules from this tool.
		$this->flushing_enabled = apply_filters( 'rri_flushing_enabled', $this->flushing_enabled );

		// User actions available for the rewrite rules page.
		if ( isset( $_GET['page'], $_GET['action'] ) && $_GET['page'] === $this->page_slug && 'download-rules' === $_GET['action'] ) {
			add_action( 'admin_init', array( $this, 'download_rules' ) );
		} elseif ( isset( $_GET['page'], $_GET['action'] ) && $_GET['page'] === $this->page_slug && 'flush-rules' === $_GET['action'] ) {
			add_action( 'admin_init', array( $this, 'flush_rules' ) );
		} elseif ( isset( $_GET['page'], $_GET['message'] ) && $_GET['page'] === $this->page_slug && 'flush-success' === $_GET['message'] ) {
			add_action( 'admin_notices', array( $this, 'action_admin_notices' ) );
		}
	}

	/**
	 * Add our sub-menu page to the VIP dashboard navigation.
	 *
	 * @since 1.0.0
	 */
	public function action_admin_menu() {
		add_submenu_page( $this->parent_slug, __( 'Rewrite Rules Inspector', 'rewrite-rules-inspector' ), __( 'Rewrite Rules', 'rewrite-rules-inspector' ), $this->view_cap, $this->page_slug, array( $this, 'view_rules' ) );
	}

	/**
	 * Show a message when you've successfully flushed your rewrite rules.
	 *
	 * @since 1.1.0
	 */
	public function action_admin_notices() {
		echo '<div class="message updated"><p>' . esc_html__( 'Rewrite rules flushed.', 'rewrite-rules-inspector' ) . '</p></div>';
	}

	/**
	 * Get the rewrite rules for the current view.
	 *
	 * @since 1.0.0
	 */
	public function get_rules() {
		global $wp_rewrite;

		$rewrite_rules_array = array();
		$rewrite_rules       = get_option( 'rewrite_rules' );
		if ( ! $rewrite_rules ) {
			$rewrite_rules = array();
		}
		// Track down which rewrite rules are associated with which methods by breaking it down.
		$rewrite_rules_by_source             = array();
		$rewrite_rules_by_source['post']     = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->permalink_structure, EP_PERMALINK );
		$rewrite_rules_by_source['date']     = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->get_date_permastruct(), EP_DATE );
		$rewrite_rules_by_source['root']     = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->root . '/', EP_ROOT );
		$rewrite_rules_by_source['comments'] = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->root . $wp_rewrite->comments_base, EP_COMMENTS, true, true, true, false );
		$rewrite_rules_by_source['search']   = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->get_search_permastruct(), EP_SEARCH );
		$rewrite_rules_by_source['author']   = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->get_author_permastruct(), EP_AUTHORS );
		$rewrite_rules_by_source['page']     = $wp_rewrite->page_rewrite_rules();

		// Extra permastructs including tags, categories, etc.
		foreach ( $wp_rewrite->extra_permastructs as $permastructname => $permastruct ) {
			if ( is_array( $permastruct ) ) {
				// Pre 3.4 compat.
				if ( count( $permastruct ) === 2 ) {
					$rewrite_rules_by_source[ $permastructname ] = $wp_rewrite->generate_rewrite_rules( $permastruct[0], $permastruct[1] );
				} else {
					$rewrite_rules_by_source[ $permastructname ] = $wp_rewrite->generate_rewrite_rules( $permastruct['struct'], $permastruct['ep_mask'], $permastruct['paged'], $permastruct['feed'], $permastruct['forcomments'], $permastruct['walk_dirs'], $permastruct['endpoints'] );
				}
			} else {
				$rewrite_rules_by_source[ $permastructname ] = $wp_rewrite->generate_rewrite_rules( $permastruct, EP_NONE );
			}
		}

		// Apply the filters used in core just in case.
		foreach ( $rewrite_rules_by_source as $source => $rules ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- core hook.
			$rewrite_rules_by_source[ $source ] = apply_filters( $source . '_rewrite_rules', $rules );
			if ( 'post_tag' === $source ) {
				// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core hook.
				$rewrite_rules_by_source[ $source ] = apply_filters( 'tag_rewrite_rules', $rules );
			}
		}

		foreach ( $rewrite_rules as $rule => $rewrite ) {
			$rewrite_rules_array[ $rule ]['rewrite'] = $rewrite;
			foreach ( $rewrite_rules_by_source as $source => $rules ) {
				if ( array_key_exists( $rule, $rules ) ) {
					$rewrite_rules_array[ $rule ]['source'] = $source;
				}
			}
			if ( ! isset( $rewrite_rules_array[ $rule ]['source'] ) ) {
				$rewrite_rules_array[ $rule ]['source'] = apply_filters( 'rewrite_rules_inspector_source', 'other', $rule, $rewrite );
			}
		}

		// Find any rewrite rules that should've been generated but weren't.
		$maybe_missing       = $wp_rewrite->rewrite_rules();
		$missing_rules       = array();
		$rewrite_rules_array = array_reverse( $rewrite_rules_array, true );
		foreach ( $maybe_missing as $rule => $rewrite ) {
			if ( ! array_key_exists( $rule, $rewrite_rules_array ) ) {
				$rewrite_rules_array[ $rule ] = array(
					'rewrite' => $rewrite,
					'source'  => 'missing',
				);
			}
		}
		// Prepend rules so it's obvious.
		$rewrite_rules_array = array_reverse( $rewrite_rules_array, true );

		// Allow static sources of rewrite rules to override, etc.
		$rewrite_rules_array = apply_filters( 'rri_rewrite_rules', $rewrite_rules_array );
		// Set the sources used in our filtering.
		$sources = array( 'all' );
		foreach ( $rewrite_rules_array as $rule => $data ) {
			$sources[] = $data['source'];
		}
		$this->sources = array_unique( $sources );

		if ( ! empty( $_GET['s'] ) ) {
			$match_path                = wp_parse_url( esc_url( $_GET['s'] ), PHP_URL_PATH );
			$wordpress_subdir_for_site = wp_parse_url( home_url(), PHP_URL_PATH );
			if ( ! empty( $wordpress_subdir_for_site ) ) {
				$match_path = str_replace( $wordpress_subdir_for_site, '', $match_path );
			}
			$match_path = ltrim( $match_path, '/' );
		}

		$should_filter_by_source = ! empty( $_GET['source'] ) && 'all' !== $_GET['source'] && in_array( $_GET['source'], $this->sources, true );

		// Filter based on match or source if necessary.
		foreach ( $rewrite_rules_array as $rule => $data ) {
			// If we're searching rules based on URL and there's no match, don't return it.
			if ( ! empty( $match_path ) && ! preg_match( "#^$rule#", $match_path ) ) {
				unset( $rewrite_rules_array[ $rule ] );
			} elseif ( $should_filter_by_source && $data['source'] !== $_GET['source'] ) {
				unset( $rewrite_rules_array[ $rule ] );
			}
		}

		// Return our array of rewrite rules to be used.
		return $rewrite_rules_array;
	}

	/**
	 * View the rewrite rules for the site.
	 *
	 * @since 1.0.0
	 */
	public function view_rules() {
		$rules = $this->get_rules();

		// Bump view stats or do something else on page load.
		do_action( 'rri_view_rewrite_rules', $rules );

		$wp_list_table = new Rewrite_Rules_Inspector_List_Table( $rules );
		$wp_list_table->prepare_items();

		?>
		<style>
			#the-list tr.type-sunrise,
			#the-list tr.type-custom {
				background-color: #eec7f0;
			}
			#the-list tr.type-sunrise td,
			#the-list tr.type-custom td {
				border-top-color: #f4e6f5;
				border-bottom-color: #efbbf2;
			}
			#the-list tr.source-missing {
				background-color: #f7a8a9;
			}
			#the-list tr.type-missing td {
				border-top-color: #fecfd0;
				border-bottom-color: #f99b9d;
			}
		</style>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

			<?php
			$missing_count = 0;
			foreach ( $rules as $rule ) {
				if ( 'missing' === $rule['source'] ) {
					$missing_count++;
				}
			}

			if ( empty( $rules ) ) {
				$error_message = apply_filters( 'rri_message_no_rules', __( 'No rewrite rules yet, try flushing.', 'rewrite-rules-inspector' ) );
				echo '<div class="message error"><p>' . wp_kses_post( $error_message ) . '</p></div>';
			} elseif ( in_array( 'missing', $this->sources, true ) ) {
				/* translators: %d: Count of missing rewrite rules */
				$error_message = apply_filters( 'rri_message_missing_rules', sprintf( _n( '%d rewrite rule may be missing, try flushing.', '%d rewrite rules may be missing, try flushing.', $missing_count, 'rewrite-rules-inspector' ), $missing_count ) );
				echo '<div class="message error"><p>' . wp_kses_post( $error_message ) . '</p></div>';
			}
			?>

			<?php if ( ! empty( $_GET['s'] ) ) : ?>
				<p>
					<?php
					/* translators: %s: Count of rewrite rules */
					printf( wp_kses_post( __( 'A listing of all %1$s rewrite rules for this site that match "<a target="_blank" href="%2$s">%2$s</a>"', 'rewrite-rules-inspector' ) ), count( $wp_list_table->items ), esc_url( $_GET['s'] ) );
					?>
				</p>
			<?php else : ?>
				<p>
					<?php
					/* translators: %s: Count of rewrite rules */
					printf( esc_html__( 'A listing of all %1$s rewrite rules for this site.', 'rewrite-rules-inspector' ), count( $wp_list_table->items ) );
					?>
				</p>
			<?php endif; ?>

			<?php $wp_list_table->display(); ?>

		</div>
		<?php
	}

	/**
	 * Process a user's request to download a set of the rewrite rules.
	 *
	 * Prompts a download of the current set of rules as a text file by
	 * setting the header. Respects current filter rules.
	 *
	 * @since 1.0.0
	 */
	public function download_rules() {
		// Check nonce and permissions.
		check_admin_referer( 'download-rules' );
		if ( ! current_user_can( $this->view_cap ) ) {
			wp_die( esc_html__( 'You do not have permissions to perform this action.', 'rewrite-rules-inspector' ) );
		}

		// Get the rewrite rules and prompt the user to download them.
		// File is saved as YYYYMMDD.themename.rewriterules.txt.
		$theme_name = sanitize_key( get_option( 'stylesheet' ) );
		$filename   = gmdate( 'Ymd' ) . '.' . $theme_name . '.rewriterules.txt';
		header( 'Content-Type: text/plain' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );

		$rewrite_rules   = $this->get_rules();
		$rules_to_export = array();
		foreach ( $rewrite_rules as $rule => $data ) {
			$rules_to_export[ $rule ] = $data['rewrite'];
		}
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped,WordPress.PHP.DevelopmentFunctions.error_log_var_export
		echo var_export( $rules_to_export, true );
		exit;
	}

	/**
	 * Allow a user to flush rewrite rules for their site.
	 *
	 * @since 1.0.0
	 */
	public function flush_rules() {
		global $plugin_page;

		// Check nonce and permissions.
		check_admin_referer( 'flush-rules' );
		if ( ! $this->flushing_enabled || ! current_user_can( $this->view_cap ) ) {
			wp_die( esc_html__( 'You do not have permissions to perform this action.', 'rewrite-rules-inspector' ) );
		}

		wp_cache_delete( 'rewrite_rules', 'options' );
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules
		flush_rewrite_rules( false );
		do_action( 'rri_flush_rules' );

		// Woo hoo!
		$args = array(
			'message' => 'flush-success',
		);
		wp_safe_redirect( add_query_arg( $args, menu_page_url( $plugin_page, false ) ) );
		exit;
	}
}
