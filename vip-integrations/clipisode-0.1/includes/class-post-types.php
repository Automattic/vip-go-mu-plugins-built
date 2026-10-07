<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Post_Types {

	const TERMS_TYPE_META = '_clipisode_terms_type';

	const DEFAULT_INVITATION_META = '_clipisode_default_invitation';

	const DEFAULT_PREVIEW_META = '_clipisode_default_preview';

	const SCREEN_TYPE_META = '_clipisode_screen_type';

	const SCREEN_REDIRECT_META = '_clipisode_screen_redirect_url';

	const RENDERER_THEME_META = 'clipisode_renderer_theme';

	/**
	 * Site option storing the attachment id of the default Clipisode
	 * logo (assets/themes/default/icon.png imported into the Media
	 * Library on plugin activation). Used by default_screen_content()
	 * to substitute the {logo_id} placeholder in starter HTML so the
	 * core/image block markup is byte-for-byte valid (specifically the
	 * required wp-image-N class on the <img> tag).
	 */
	const DEFAULT_LOGO_OPTION = 'clipisode_default_logo_attachment_id';

	/**
	 * Site option storing the attachment id of the default QR
	 * placeholder image (assets/editor/sample/sample-qr.png imported
	 * into the Media Library). Same treatment as DEFAULT_LOGO_OPTION:
	 * the desktop intro screen embeds a real core/image block whose
	 * {qr_id}/{qr_url} placeholders are substituted at seed time, so
	 * authors can resize, pad, border, and reorder the QR placeholder
	 * via standard image-block controls. The public renderer detects
	 * the figure (by class clipisode-introd-qr-image) and replaces
	 * its <img> with the live QR canvas mount at request time, so the
	 * placeholder image is never shown to guests.
	 */
	const DEFAULT_QR_OPTION = 'clipisode_default_qr_attachment_id';

	/**
	 * Font registry (single source of truth for invitation typography).
	 *
	 * This powers all three typography surfaces:
	 *   1) Gutenberg font-family picker options for clipisode_screen posts
	 *   2) CSS custom properties consumed by assets/themes/default/theme.css
	 *   3) Remote font stylesheet URL enqueued for editor + guest flow
	 *
	 * Add a custom font by updating ONE entry:
	 *   - slug               stable Gutenberg preset id
	 *   - label              shown in the editor font-family dropdown
	 *   - font_family        CSS stack applied via theme.css vars/rules
	 *   - font_weight        SINGLE default weight used by theme.css vars/rules
	 *   - google_css2_family Google Fonts css2 family descriptor
	 *                        (omit if self-hosting fonts)
	 *
	 * If a new role is introduced beyond heading/body, also wire it into
	 * font_registry_css_variables() and theme.css selectors.
	 */
	const FONT_REGISTRY = [
		'heading' => [
			'slug'               => 'clipisode-heading',
			'label'              => 'Fira Sans Extra Bold (Heading)',
			'font_family'        => '"Fira Sans", -apple-system, BlinkMacSystemFont, "Roboto", sans-serif',
			'font_weight'        => '800',
			'google_css2_family' => 'Fira+Sans:wght@800',
		],
		'body'    => [
			'slug'               => 'clipisode-body',
			'label'              => 'Open Sans (Body)',
			'font_family'        => '"Open Sans", -apple-system, BlinkMacSystemFont, "Roboto", sans-serif',
			'font_weight'        => '400',
			'google_css2_family' => 'Open+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700',
		],
	];

	/**
	 * Layout registry (single source of truth for mobile readability).
	 *
	 * These values drive the shared CSS variables used across screens for:
	 *   - left/right safe gutters on narrow/tall phone browsers
	 *   - readable max content width on wide phone browsers
	 *
	 * Update values here to tune layout globally across guest flow + editor.
	 */
	const LAYOUT_REGISTRY = [
		'mobile_gutter'      => '20px',
		'mobile_content_max' => '420px',
	];

	/**
	 * Submit-button alternate labels. Authored in the block editor's
	 * sidebar (assets/editor/name-submit-labels.js) and stored as POST
	 * META on the Name screen post — NOT as block attributes on
	 * core/button — because that's what triggered "Block contains
	 * unexpected or invalid content" the moment WP's validator
	 * compared its serialised save() output to the saved markup. By
	 * keeping the button itself vanilla and stashing the labels in
	 * meta, the button block survives every editor round-trip
	 * unchanged.
	 *
	 * Keys are intentionally unprefixed (no leading underscore) so REST
	 * exposes them without an explicit auth_callback override and the
	 * sidebar can read/write via the standard /wp/v2/clipisode_screen
	 * endpoint.
	 */
	const SUBMIT_LABEL_META_KEYS = [
		'pending'    => 'clipisode_label_pending',
		'submitting' => 'clipisode_label_submitting',
		'error'      => 'clipisode_label_error',
		'done'       => 'clipisode_label_done',
	];

	const SCREEN_TYPES = [
		'intro',
		'intro_desktop',
		'name',
		'email',
		'success',
		'closed',
		'warning_camera',
		'warning_network',
		'warning_silent',
		'warning_wide',
	];

	/**
	 * Guest flow only: public URL of the current topic's intro video, resolved
	 * from `intro_media_id` before `do_blocks()` in clipisode-flow.php. Used
	 * by the render_block filter to inject a real video element when set;
	 * when empty, the intro Cover's block-defined gradient is shown.
	 *
	 * @var string|null Null when the flow context has not been set this request.
	 */
	private static ?string $flow_intro_video_url = null;

	/**
	 * Guest flow only: per-request topic context used to substitute string
	 * placeholders like {host_name} / {topic_title} into block content as it
	 * renders. Set by clipisode-flow.php after looking up the topic; reset
	 * after the response so the next request starts clean.
	 *
	 * Keys (string -> string):
	 *   host_name   → topic.hosted_by
	 *   topic_title → topic.title
	 *
	 * @var array<string,string>|null
	 */
	private static ?array $flow_topic_context = null;

	/**
	 * @param string $url Sanitized public URL, or empty string when the topic
	 *                    has no intro video.
	 */
	public static function set_flow_intro_video_url( string $url ): void {
		self::$flow_intro_video_url = $url;
	}

	public static function get_flow_intro_video_url(): string {
		return self::$flow_intro_video_url ?? '';
	}

	public static function reset_flow_intro_video_url(): void {
		self::$flow_intro_video_url = null;
	}

	/**
	 * @param array<string,string> $context
	 */
	public static function set_flow_topic_context( array $context ): void {
		self::$flow_topic_context = $context;
	}

	/**
	 * @return array<string,string>
	 */
	public static function get_flow_topic_context(): array {
		return self::$flow_topic_context ?? [];
	}

	public static function reset_flow_topic_context(): void {
		self::$flow_topic_context = null;
	}

	/**
	 * Replaces {host_name} / {topic_title} tokens (and a small set of other
	 * known keys) inside a string with the current topic's values. Used in
	 * the render_block filter so authors can drop placeholders into any
	 * core/paragraph or core/heading and have them resolved at request time.
	 *
	 * Replacement values are run through esc_html() so an evil topic title
	 * can't smuggle script tags into the rendered screen.
	 */
	public static function apply_flow_placeholders( string $html ): string {
		$ctx = self::get_flow_topic_context();
		if ( empty( $ctx ) ) {
			return $html;
		}
		foreach ( $ctx as $key => $value ) {
			$token = '{' . $key . '}';
			if ( str_contains( $html, $token ) ) {
				$html = str_replace( $token, esc_html( (string) $value ), $html );
			}
		}
		return $html;
	}

	/**
	 * Imports plugin/clipisode/assets/themes/default/icon.png into the
	 * WordPress Media Library and stores the resulting attachment id
	 * in the DEFAULT_LOGO_OPTION site option.
	 *
	 * Idempotent: if the option is already set and points to a real
	 * attachment, the function returns the existing id without doing
	 * any work. Safe to call from anywhere — activation hook, lazy
	 * runtime check, manual admin tool.
	 *
	 * If the file is missing on disk, the function logs to debug.log
	 * (when WP_DEBUG is on) and returns 0. Callers should treat 0 as
	 * "import failed" and surface that visibly rather than substituting
	 * a fallback that masks the problem.
	 *
	 * Returns the attachment id on success, 0 on failure.
	 */
	public static function ensure_default_logo_attachment(): int {
		$existing = (int) get_option( self::DEFAULT_LOGO_OPTION, 0 );
		if ( $existing > 0 && get_post( $existing ) ) {
			return $existing;
		}

		$source = CLIPISODE_PLUGIN_DIR . 'assets/themes/default/icon.png';
		if ( ! file_exists( $source ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[clipisode] Default logo source missing: ' . $source );
			}
			return 0;
		}

		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		// Copy the source into the uploads directory so WordPress
		// owns the canonical copy. The plugin's icon.png is the
		// source of truth, but the Media Library expects files
		// inside wp-content/uploads.
		$uploads = wp_upload_dir();
		if ( ! empty( $uploads['error'] ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[clipisode] wp_upload_dir error: ' . $uploads['error'] );
			}
			return 0;
		}

		$dest_filename = wp_unique_filename( $uploads['path'], 'clipisode-default-logo.png' );
		$dest_path     = trailingslashit( $uploads['path'] ) . $dest_filename;
		if ( ! copy( $source, $dest_path ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[clipisode] Failed to copy logo to uploads: ' . $dest_path );
			}
			return 0;
		}

		$attachment_id = wp_insert_attachment(
			[
				'guid'           => trailingslashit( $uploads['url'] ) . $dest_filename,
				'post_mime_type' => 'image/png',
				'post_title'     => 'Clipisode Default Logo',
				'post_content'   => '',
				'post_status'    => 'inherit',
			],
			$dest_path
		);

		if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[clipisode] wp_insert_attachment failed for logo' );
			}
			return 0;
		}

		$metadata = wp_generate_attachment_metadata( $attachment_id, $dest_path );
		wp_update_attachment_metadata( $attachment_id, $metadata );

		update_option( self::DEFAULT_LOGO_OPTION, (int) $attachment_id, false );

		return (int) $attachment_id;
	}

	/**
	 * Imports plugin/clipisode/assets/editor/sample/sample-qr.png into
	 * the WordPress Media Library and stores the resulting attachment
	 * id in the DEFAULT_QR_OPTION site option.
	 *
	 * Mirror of ensure_default_logo_attachment() — same idempotent
	 * import pattern, same self-healing behaviour. Used by the
	 * intro_desktop screen to render a placeholder QR image authors
	 * can resize / style with standard core/image block controls.
	 *
	 * Returns the attachment id on success, 0 on failure.
	 */
	public static function ensure_default_qr_attachment(): int {
		$existing = (int) get_option( self::DEFAULT_QR_OPTION, 0 );
		if ( $existing > 0 && get_post( $existing ) ) {
			return $existing;
		}

		$source = CLIPISODE_PLUGIN_DIR . 'assets/editor/sample/sample-qr.png';
		if ( ! file_exists( $source ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[clipisode] Default QR source missing: ' . $source );
			}
			return 0;
		}

		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$uploads = wp_upload_dir();
		if ( ! empty( $uploads['error'] ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[clipisode] wp_upload_dir error: ' . $uploads['error'] );
			}
			return 0;
		}

		$dest_filename = wp_unique_filename( $uploads['path'], 'clipisode-default-qr.png' );
		$dest_path     = trailingslashit( $uploads['path'] ) . $dest_filename;
		if ( ! copy( $source, $dest_path ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[clipisode] Failed to copy QR to uploads: ' . $dest_path );
			}
			return 0;
		}

		$attachment_id = wp_insert_attachment(
			[
				'guid'           => trailingslashit( $uploads['url'] ) . $dest_filename,
				'post_mime_type' => 'image/png',
				'post_title'     => 'Clipisode Default QR Placeholder',
				'post_content'   => '',
				'post_status'    => 'inherit',
			],
			$dest_path
		);

		if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[clipisode] wp_insert_attachment failed for QR' );
			}
			return 0;
		}

		$metadata = wp_generate_attachment_metadata( $attachment_id, $dest_path );
		wp_update_attachment_metadata( $attachment_id, $metadata );

		update_option( self::DEFAULT_QR_OPTION, (int) $attachment_id, false );

		return (int) $attachment_id;
	}

	public static function register(): void {
		// `clipisode_invite` is the Theme container CPT. A Theme owns
		// a tree of clipisode_screen children (intro, intro_desktop,
		// name, email, success, closed, warnings); a Topic points at
		// a Theme via topic.invitation_id, and the public flow
		// renderer assembles screens by walking from invitation_link
		// → topic → invitation_id → child screens.
		//
		// `editor` support was dropped when the v1 stage blocks (the
		// clipisode/invitation-flow + invitation-desktop / -landing /
		// -record / -thanks tree) were retired in favour of the
		// clipisode_screen-driven model. The Theme post itself has no
		// authorable block content — the children do — so there's
		// nothing for the block editor to edit on this post type.
		// Keeping `title` support means Themes still have human
		// names. See docs/specs/shipped/kill-v1-invitation-flow.md.
		register_post_type( 'clipisode_invite', [
			'labels'              => [
				'name'               => 'Themes',
				'singular_name'      => 'Theme',
				'add_new_item'       => 'Add New Theme',
				'edit_item'          => 'Edit Theme',
				'new_item'           => 'New Theme',
				'view_item'          => 'View Theme',
				'search_items'       => 'Search Themes',
				'not_found'          => 'No themes found.',
				'not_found_in_trash' => 'No themes found in Trash.',
				'menu_name'          => 'Themes',
			],
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_in_nav_menus'   => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'rest_base'           => 'clipisode-themes',
			'supports'            => [ 'title' ],
			'capability_type'     => 'post',
			'has_archive'         => false,
			'rewrite'             => false,
		] );

		register_post_type( 'clipisode_preview', [
			'labels'              => [
				'name'               => 'Preview Layouts',
				'singular_name'      => 'Preview Layout',
				'add_new_item'       => 'Add New Preview Layout',
				'edit_item'          => 'Edit Preview Layout',
				'new_item'           => 'New Preview Layout',
				'view_item'          => 'View Preview Layout',
				'search_items'       => 'Search Preview Layouts',
				'not_found'          => 'No preview layouts found.',
				'not_found_in_trash' => 'No preview layouts found in Trash.',
				'menu_name'          => 'Preview Layouts',
			],
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_in_nav_menus'   => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'rest_base'           => 'clipisode-previews',
			'supports'            => [ 'title', 'editor' ],
			'capability_type'     => 'post',
			'has_archive'         => false,
			'rewrite'             => false,
		] );

		register_post_type( 'clipisode_terms', [
			'labels'              => [
				'name'               => 'Terms',
				'singular_name'      => 'Terms',
				'add_new_item'       => 'Add New Terms',
				'edit_item'          => 'Edit Terms',
				'new_item'           => 'New Terms',
				'view_item'          => 'View Terms',
				'search_items'       => 'Search Terms',
				'not_found'          => 'No terms found.',
				'not_found_in_trash' => 'No terms found in Trash.',
				'menu_name'          => 'Terms',
			],
			'public'              => false,
			'publicly_queryable'  => true,
			'exclude_from_search' => true,
			'show_in_nav_menus'   => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'rest_base'           => 'clipisode-terms',
			'supports'            => [ 'title', 'editor', 'revisions' ],
			'capability_type'     => 'post',
			'has_archive'         => false,
			'rewrite'             => false,
		] );

		register_post_type( 'clipisode_screen', [
			'labels'              => [
				'name'               => 'Screens',
				'singular_name'      => 'Screen',
				'add_new_item'       => 'Add New Screen',
				'edit_item'          => 'Edit Screen',
				'new_item'           => 'New Screen',
				'view_item'          => 'View Screen',
				'search_items'       => 'Search Screens',
				'not_found'          => 'No screens found.',
				'not_found_in_trash' => 'No screens found in Trash.',
				'menu_name'          => 'Screens',
			],
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_in_nav_menus'   => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'rest_base'           => 'clipisode-screens',
			'supports'            => [ 'title', 'editor', 'custom-fields' ],
			'capability_type'     => 'post',
			'has_archive'         => false,
			'rewrite'             => false,
			'hierarchical'        => true,
		] );

		register_post_meta( 'clipisode_terms', self::TERMS_TYPE_META, [
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => true,
			'default'      => 'custom',
		] );

		register_post_meta( 'clipisode_invite', self::RENDERER_THEME_META, [
			'type'          => 'string',
			'single'        => true,
			'show_in_rest'  => true,
			'default'       => 'default',
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		] );

		register_post_meta( 'clipisode_screen', self::SCREEN_TYPE_META, [
			'type'          => 'string',
			'single'        => true,
			'show_in_rest'  => true,
			'default'       => '',
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		] );

		register_post_meta( 'clipisode_screen', self::SCREEN_REDIRECT_META, [
			'type'          => 'string',
			'single'        => true,
			'show_in_rest'  => true,
			'default'       => '',
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		] );

		// Submit-button alternate labels. Registered for ALL clipisode_screen
		// posts (cheap), but only the Name screen's editor surfaces them in
		// the sidebar (the editor extension keys off the selected button's
		// className). Empty default lets the public flow's PHP fall back to
		// the English baseline ("Waiting for upload…", "Sending…", etc.) so
		// authors who don't open the panel get sensible defaults.
		foreach ( self::SUBMIT_LABEL_META_KEYS as $meta_key ) {
			register_post_meta( 'clipisode_screen', $meta_key, [
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => true,
				'default'       => '',
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			] );
		}

		add_filter( 'wp_unique_post_slug', [ __CLASS__, 'prefix_terms_slug' ], 10, 4 );
		add_action( 'save_post_clipisode_terms', [ __CLASS__, 'ensure_terms_type_meta' ] );
		add_filter( 'template_include', [ __CLASS__, 'terms_template' ] );
		add_filter( 'pre_trash_post', [ __CLASS__, 'force_delete_screen_posts' ], 10, 2 );

		// Debug-mode-only admin tools surfaced on the Screens list page.
		// See render_screen_admin_tools_notice() / handle_*_admin_action().
		add_action( 'admin_notices', [ __CLASS__, 'render_screen_admin_tools_notice' ] );
		add_action( 'admin_post_clipisode_reseed_screens', [ __CLASS__, 'handle_reseed_screens_admin_action' ] );
		add_action( 'admin_post_clipisode_reimport_logo', [ __CLASS__, 'handle_reimport_logo_admin_action' ] );
		add_action( 'admin_post_clipisode_reimport_qr',   [ __CLASS__, 'handle_reimport_qr_admin_action' ] );
	}

	/**
	 * Renders a notice banner with debug-mode admin tools above the
	 * Screens list page (edit.php?post_type=clipisode_screen).
	 *
	 * Only renders when:
	 *   - The current admin screen IS the Screens list (not the Add New
	 *     screen, not a single screen edit, not any other CPT list).
	 *   - The clipisode_debug_mode option is truthy.
	 *   - The current user has manage_options capability.
	 *
	 * Outside debug mode the banner is hidden so authors using the
	 * plugin in production never see internal-iteration tools they
	 * shouldn't be touching.
	 */
	public static function render_screen_admin_tools_notice(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		if ( ! get_option( 'clipisode_debug_mode', false ) ) {
			return;
		}

		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || $screen->id !== 'edit-clipisode_screen' ) {
			return;
		}

		// One-time success/error notice from the previous request, if
		// the user just clicked a button. We pass status via a query
		// arg so the notice survives the redirect after admin_post.
		$result = isset( $_GET['clipisode_tool_result'] )
			? sanitize_key( wp_unslash( $_GET['clipisode_tool_result'] ) )
			: '';
		$detail = isset( $_GET['clipisode_tool_detail'] )
			? sanitize_text_field( wp_unslash( $_GET['clipisode_tool_detail'] ) )
			: '';

		if ( $result === 'reseed_ok' ) {
			$count = (int) $detail;
			$msg   = sprintf(
				/* translators: %d: number of screens recreated */
				_n(
					'Recreated %d missing screen.',
					'Recreated %d missing screens.',
					$count,
					'clipisode'
				),
				$count
			);
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $msg ) . '</p></div>';
		} elseif ( $result === 'reseed_fail' ) {
			echo '<div class="notice notice-error is-dismissible"><p>'
				. esc_html__( 'Reseed failed. Check debug.log for details.', 'clipisode' )
				. '</p></div>';
		} elseif ( $result === 'logo_ok' ) {
			$id  = (int) $detail;
			$msg = sprintf(
				/* translators: %d: attachment id */
				__( 'Re-imported the default logo as attachment #%d.', 'clipisode' ),
				$id
			);
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $msg ) . '</p></div>';
		} elseif ( $result === 'logo_fail' ) {
			echo '<div class="notice notice-error is-dismissible"><p>'
				. esc_html__( 'Logo re-import failed. Check debug.log for details.', 'clipisode' )
				. '</p></div>';
		} elseif ( $result === 'qr_ok' ) {
			$id  = (int) $detail;
			$msg = sprintf(
				/* translators: %d: attachment id */
				__( 'Re-imported the default QR placeholder as attachment #%d.', 'clipisode' ),
				$id
			);
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $msg ) . '</p></div>';
		} elseif ( $result === 'qr_fail' ) {
			echo '<div class="notice notice-error is-dismissible"><p>'
				. esc_html__( 'QR placeholder re-import failed. Check debug.log for details.', 'clipisode' )
				. '</p></div>';
		}

		$reseed_url      = wp_nonce_url(
			admin_url( 'admin-post.php?action=clipisode_reseed_screens' ),
			'clipisode_reseed_screens'
		);
		$reimport_logo_url = wp_nonce_url(
			admin_url( 'admin-post.php?action=clipisode_reimport_logo' ),
			'clipisode_reimport_logo'
		);
		$reimport_qr_url = wp_nonce_url(
			admin_url( 'admin-post.php?action=clipisode_reimport_qr' ),
			'clipisode_reimport_qr'
		);

		echo '<div class="notice notice-info">'
			. '<p><strong>' . esc_html__( 'Clipisode debug tools', 'clipisode' ) . '</strong></p>'
			. '<p>'
			. '<a href="' . esc_url( $reseed_url ) . '" class="button">'
			. esc_html__( 'Reseed missing screens', 'clipisode' )
			. '</a> '
			. '<a href="' . esc_url( $reimport_logo_url ) . '" class="button">'
			. esc_html__( 'Re-import default logo', 'clipisode' )
			. '</a> '
			. '<a href="' . esc_url( $reimport_qr_url ) . '" class="button">'
			. esc_html__( 'Re-import QR placeholder', 'clipisode' )
			. '</a>'
			. '</p>'
			. '<p class="description">'
			. esc_html__( 'Reseed walks the default theme and recreates any screen posts that are missing from the database. Re-import buttons delete the cached attachment id and import the source file fresh from disk (icon.png for the logo, sample-qr.png for the QR placeholder).', 'clipisode' )
			. '</p>'
			. '</div>';
	}

	/**
	 * Handler for the "Reseed missing screens" admin button.
	 *
	 * Walks the default theme and calls ensure_screen() for every
	 * screen type. ensure_screen() is idempotent — existing posts are
	 * left alone, only missing ones get recreated from disk. Redirects
	 * back to the Screens list with a status query arg so the notice
	 * banner can show a one-shot success/error message.
	 */
	public static function handle_reseed_screens_admin_action(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to do that.', 'clipisode' ), 403 );
		}
		check_admin_referer( 'clipisode_reseed_screens' );

		// Look up the default theme without going through
		// ensure_default_invitation(), which would call
		// seed_default_screens() as a side effect and steal our
		// chance to count what was missing. If no default theme
		// exists yet, we fall back to ensure_default_invitation()
		// to bootstrap one (and the counting becomes inaccurate,
		// which is acceptable for the bootstrap edge case — the
		// success message still reflects what got created, since
		// "all 10 screens are new" is true on bootstrap).
		$theme_id = (int) self::get_default_invitation_id();
		$bootstrapped = false;
		if ( $theme_id <= 0 ) {
			$theme_id     = self::ensure_default_invitation();
			$bootstrapped = true;
		}

		if ( $theme_id <= 0 ) {
			wp_safe_redirect( add_query_arg(
				[
					'post_type'             => 'clipisode_screen',
					'clipisode_tool_result' => 'reseed_fail',
				],
				admin_url( 'edit.php' )
			) );
			exit;
		}

		if ( $bootstrapped ) {
			// Bootstrap path already seeded everything; report
			// the full set as recreated.
			$missing_before = count( self::SCREEN_TYPES );
		} else {
			// Normal path: count missing screens before the
			// reseed, then run the seeder.
			$missing_before = 0;
			foreach ( self::SCREEN_TYPES as $screen_type ) {
				if ( ! self::get_screen_post( $theme_id, $screen_type ) ) {
					$missing_before++;
				}
			}
			self::seed_default_screens( $theme_id );
		}

		wp_safe_redirect( add_query_arg(
			[
				'post_type'             => 'clipisode_screen',
				'clipisode_tool_result' => 'reseed_ok',
				'clipisode_tool_detail' => (string) $missing_before,
			],
			admin_url( 'edit.php' )
		) );
		exit;
	}

	/**
	 * Handler for the "Re-import default logo" admin button.
	 *
	 * Deletes the cached attachment id and (optionally) the existing
	 * Media Library entry, then re-runs ensure_default_logo_attachment()
	 * to import a fresh copy from disk. Useful when the user changes
	 * icon.png and wants the new version to flow through to seeded
	 * screens. Existing screen posts that already reference the old
	 * attachment id are NOT updated — the user should reseed them
	 * separately if they want the new logo in the markup.
	 */
	public static function handle_reimport_logo_admin_action(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to do that.', 'clipisode' ), 403 );
		}
		check_admin_referer( 'clipisode_reimport_logo' );

		// Delete the previously imported attachment if it still exists,
		// so the Media Library doesn't accumulate orphans on every
		// re-import. The user can always restore from disk; the
		// canonical source is the plugin's icon.png.
		$old_id = (int) get_option( self::DEFAULT_LOGO_OPTION, 0 );
		if ( $old_id > 0 && get_post( $old_id ) ) {
			wp_delete_attachment( $old_id, true );
		}
		delete_option( self::DEFAULT_LOGO_OPTION );

		$new_id = self::ensure_default_logo_attachment();

		wp_safe_redirect( add_query_arg(
			[
				'post_type'             => 'clipisode_screen',
				'clipisode_tool_result' => $new_id > 0 ? 'logo_ok' : 'logo_fail',
				'clipisode_tool_detail' => (string) $new_id,
			],
			admin_url( 'edit.php' )
		) );
		exit;
	}

	/**
	 * Handler for the "Re-import QR placeholder" admin button.
	 *
	 * Mirror of handle_reimport_logo_admin_action() — same workflow,
	 * different option / source file. Useful when the user replaces
	 * sample-qr.png and wants the new image to flow through to
	 * newly-seeded desktop intro screens.
	 */
	public static function handle_reimport_qr_admin_action(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to do that.', 'clipisode' ), 403 );
		}
		check_admin_referer( 'clipisode_reimport_qr' );

		$old_id = (int) get_option( self::DEFAULT_QR_OPTION, 0 );
		if ( $old_id > 0 && get_post( $old_id ) ) {
			wp_delete_attachment( $old_id, true );
		}
		delete_option( self::DEFAULT_QR_OPTION );

		$new_id = self::ensure_default_qr_attachment();

		wp_safe_redirect( add_query_arg(
			[
				'post_type'             => 'clipisode_screen',
				'clipisode_tool_result' => $new_id > 0 ? 'qr_ok' : 'qr_fail',
				'clipisode_tool_detail' => (string) $new_id,
			],
			admin_url( 'edit.php' )
		) );
		exit;
	}

	/**
	 * Converts "Move to Trash" into immediate permanent deletion for
	 * clipisode_screen posts.
	 *
	 * Trash is the right UX for content posts (blog posts, pages) where
	 * users may want to undo a deletion. For screen posts the seeder
	 * owns the lifecycle: creating from disk on first load, accepting
	 * author edits in place, recreating on disk-content updates after
	 * deletion. A trashed-but-not-deleted screen post sits invisibly
	 * blocking the seeder from running, which has no useful purpose
	 * and confuses developers iterating on starter HTML.
	 *
	 * Returning a non-null value short-circuits the wp_trash_post()
	 * flow; we substitute wp_delete_post( $post_id, true ) and return
	 * its result so the caller sees the deletion succeed.
	 */
	public static function force_delete_screen_posts( $check, $post ) {
		if ( ! $post || $post->post_type !== 'clipisode_screen' ) {
			return $check;
		}
		return wp_delete_post( (int) $post->ID, true );
	}

	public static function ensure_terms_type_meta( int $post_id ): void {
		if ( ! metadata_exists( 'post', $post_id, self::TERMS_TYPE_META ) ) {
			update_post_meta( $post_id, self::TERMS_TYPE_META, 'custom' );
		}
	}

	public static function prefix_terms_slug( string $slug, int $post_id, string $post_status, string $post_type ): string {
		if ( 'clipisode_terms' === $post_type && 0 !== strpos( $slug, 'clipisode-' ) ) {
			return 'clipisode-' . $slug;
		}
		return $slug;
	}

	public static function terms_template( string $template ): string {
		if ( is_singular( 'clipisode_terms' ) ) {
			return CLIPISODE_PLUGIN_DIR . 'assets/templates/terms-single.php';
		}
		return $template;
	}

	public static function get_brand_terms_id(): ?int {
		$posts = get_posts( [
			'post_type'   => 'clipisode_terms',
			'post_status' => 'publish',
			'numberposts' => 1,
			'meta_key'    => self::TERMS_TYPE_META,
			'meta_value'  => 'brand',
		] );

		return $posts ? (int) $posts[0]->ID : null;
	}

	public static function get_default_invitation_id(): ?int {
		$posts = get_posts( [
			'post_type'   => 'clipisode_invite',
			'post_status' => 'publish',
			'numberposts' => 1,
			'meta_key'    => self::DEFAULT_INVITATION_META,
			'meta_value'  => '1',
		] );

		return $posts ? (int) $posts[0]->ID : null;
	}

	/**
	 * @return array<string,array<string,mixed>>
	 */
	public static function renderer_theme_registry(): array {
		$themes = apply_filters( 'clipisode_themes', [] );
		if ( ! is_array( $themes ) ) {
			$themes = [];
		}
		$out = [];
		foreach ( $themes as $slug => $theme ) {
			$k = sanitize_key( (string) $slug );
			if ( $k === '' ) {
				continue;
			}
			$out[ $k ] = is_array( $theme ) ? $theme : [];
		}
		return $out;
	}

	private static function normalize_renderer_theme_candidate( string $raw ): string {
		$raw = strtolower( trim( $raw ) );
		if ( $raw === '' ) {
			return '';
		}
		$normalized = preg_replace( '/[^a-z0-9]/', '', $raw );
		return is_string( $normalized ) ? $normalized : '';
	}

	private static function default_renderer_theme_slug(): string {
		$registry = self::renderer_theme_registry();
		if ( isset( $registry['default'] ) ) {
			return 'default';
		}
		$first = array_key_first( $registry );
		return is_string( $first ) && $first !== '' ? $first : 'default';
	}

	private static function guess_renderer_theme_slug_from_invitation( int $invitation_id ): string {
		$post = get_post( $invitation_id );
		if ( ! $post ) {
			return self::default_renderer_theme_slug();
		}
		$registry = self::renderer_theme_registry();
		if ( empty( $registry ) ) {
			return self::default_renderer_theme_slug();
		}

		$normalized_map = [];
		foreach ( array_keys( $registry ) as $slug ) {
			$n = self::normalize_renderer_theme_candidate( (string) $slug );
			if ( $n !== '' && ! isset( $normalized_map[ $n ] ) ) {
				$normalized_map[ $n ] = (string) $slug;
			}
		}

		$candidates = [
			self::normalize_renderer_theme_candidate( (string) $post->post_name ),
			self::normalize_renderer_theme_candidate( (string) $post->post_title ),
		];
		foreach ( $candidates as $candidate ) {
			if ( $candidate !== '' && isset( $normalized_map[ $candidate ] ) ) {
				return $normalized_map[ $candidate ];
			}
		}

		return self::default_renderer_theme_slug();
	}

	public static function resolve_renderer_theme_slug( string $raw_slug, int $invitation_id = 0 ): string {
		$registry = self::renderer_theme_registry();
		$slug = sanitize_key( $raw_slug );
		if ( $slug !== '' && isset( $registry[ $slug ] ) ) {
			return $slug;
		}
		if ( $invitation_id > 0 ) {
			$guess = self::guess_renderer_theme_slug_from_invitation( $invitation_id );
			if ( isset( $registry[ $guess ] ) ) {
				return $guess;
			}
		}
		return self::default_renderer_theme_slug();
	}

	public static function invitation_renderer_theme( int $invitation_id ): string {
		if ( $invitation_id <= 0 ) {
			return self::default_renderer_theme_slug();
		}
		$raw = (string) get_post_meta( $invitation_id, self::RENDERER_THEME_META, true );
		$resolved = self::resolve_renderer_theme_slug( $raw, $invitation_id );
		if ( $raw !== $resolved ) {
			update_post_meta( $invitation_id, self::RENDERER_THEME_META, $resolved );
		}
		return $resolved;
	}

	public static function ensure_default_invitation(): int {
		// Theme posts have no authorable block content. The
		// clipisode_invite CPT lost `editor` support when the v1
		// stage blocks were retired (see
		// docs/specs/shipped/kill-v1-invitation-flow.md). The
		// screen children are the editable surface, not the Theme
		// post itself. We seed empty post_content so the post
		// exists as a database row that other tables can foreign-
		// key against (topics.invitation_id) and that
		// seed_default_screens() can parent screens under.
		$content = '';

		$theme_id = 0;
		$existing = self::get_default_invitation_id();
		if ( $existing ) {
			// An existing default-theme post is always reused
			// in-place. Earlier versions auto-rewrote post_content
			// when it didn't match the expected shape, but with
			// editor support gone that branch can never fire from
			// author edits — only from upgrades that change the
			// seed format, and those should be explicit.
			$theme_id = $existing;
		} else {
			$post_id = wp_insert_post( [
				'post_type'    => 'clipisode_invite',
				'post_title'   => 'Default',
				'post_content' => $content,
				'post_status'  => 'publish',
			] );

			if ( ! is_wp_error( $post_id ) && $post_id ) {
				update_post_meta( $post_id, self::DEFAULT_INVITATION_META, '1' );
				$theme_id = (int) $post_id;
			}
		}

		if ( $theme_id > 0 ) {
			self::invitation_renderer_theme( $theme_id );
			self::seed_default_screens( $theme_id );
		}

		return $theme_id;
	}

	public static function seed_default_screens( int $theme_id ): array {
		$result = [];
		foreach ( self::SCREEN_TYPES as $screen_type ) {
			$result[ $screen_type ] = self::ensure_screen( $theme_id, $screen_type );
		}
		return $result;
	}

	/**
	 * Returns the live (non-trashed) screen post id for a theme + type, or
	 * null if none exists.
	 *
	 * Trashed posts are intentionally excluded so that trashing a screen
	 * post triggers reseeding from disk on the next page load, which is
	 * the natural way to iterate on starter HTML content during
	 * development. Without this filter, trashing leaves the post
	 * invisible in the UI but still findable by the seeder, so the
	 * seeder treats it as "exists" and never creates the fresh version.
	 */
	public static function get_screen_post( int $theme_id, string $screen_type ): ?int {
		if ( $theme_id <= 0 || ! in_array( $screen_type, self::SCREEN_TYPES, true ) ) {
			return null;
		}

		$ids = get_posts( [
			'post_type'   => 'clipisode_screen',
			'post_status' => [ 'publish', 'draft', 'pending', 'private' ],
			'numberposts' => 1,
			'post_parent' => $theme_id,
			'meta_key'    => self::SCREEN_TYPE_META,
			'meta_value'  => $screen_type,
			'fields'      => 'ids',
		] );

		return $ids ? (int) $ids[0] : null;
	}

	/**
	 * Returns ids of trashed screen posts for a theme + type. Used by
	 * ensure_screen() to permanently delete orphans before creating a
	 * fresh post, so the database never ends up with duplicate screens
	 * of the same type under the same theme.
	 */
	private static function get_trashed_screen_posts( int $theme_id, string $screen_type ): array {
		if ( $theme_id <= 0 || ! in_array( $screen_type, self::SCREEN_TYPES, true ) ) {
			return [];
		}

		$ids = get_posts( [
			'post_type'   => 'clipisode_screen',
			'post_status' => 'trash',
			'numberposts' => -1,
			'post_parent' => $theme_id,
			'meta_key'    => self::SCREEN_TYPE_META,
			'meta_value'  => $screen_type,
			'fields'      => 'ids',
		] );

		return array_map( 'intval', $ids );
	}

	public static function ensure_screen( int $theme_id, string $screen_type, string $content = '' ): int {
		if ( $theme_id <= 0 || ! in_array( $screen_type, self::SCREEN_TYPES, true ) ) {
			return 0;
		}

		$existing = self::get_screen_post( $theme_id, $screen_type );
		if ( $existing ) {
			self::ensure_screen_post_title( $existing, $screen_type );
			return $existing;
		}

		// Before creating a fresh post, permanently delete any trashed
		// twins of the same type under the same theme. Otherwise a
		// later restore-from-trash would leave the database with two
		// posts matching get_screen_post()'s lookup, and the seeder
		// would non-deterministically pick one.
		foreach ( self::get_trashed_screen_posts( $theme_id, $screen_type ) as $trashed_id ) {
			wp_delete_post( $trashed_id, true );
		}

		if ( '' === $content ) {
			$content = self::default_screen_content( $screen_type );
		}

		$post_id = wp_insert_post( [
			'post_type'    => 'clipisode_screen',
			'post_parent'  => $theme_id,
			'post_title'   => self::screen_title( $screen_type ),
			'post_content' => $content,
			'post_status'  => 'publish',
		] );

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			return 0;
		}

		update_post_meta( $post_id, self::SCREEN_TYPE_META, $screen_type );

		return (int) $post_id;
	}

	/**
	 * Backfills the internal post_title for screen posts that were created
	 * while title support was disabled. The title remains hidden in the
	 * canvas UI (via editor CSS), but Gutenberg can still show it in the
	 * top command/header context instead of "No title • Screen".
	 */
	private static function ensure_screen_post_title( int $post_id, string $screen_type ): void {
		if ( $post_id <= 0 || ! in_array( $screen_type, self::SCREEN_TYPES, true ) ) {
			return;
		}
		$post = get_post( $post_id );
		if ( ! $post || $post->post_type !== 'clipisode_screen' ) {
			return;
		}
		if ( trim( (string) $post->post_title ) !== '' ) {
			return;
		}
		wp_update_post( [
			'ID'         => $post_id,
			'post_title' => self::screen_title( $screen_type ),
		] );
	}

	/**
	 * Repairs a legacy heading mismatch that causes Gutenberg recovery prompts:
	 * heading block attrs may say "level":1 while the saved markup is <h2>.
	 * We trust the saved tag and sync the block attr level to that tag.
	 */
	private static function sync_heading_levels_with_markup( array $blocks, bool &$changed ): array {
		foreach ( $blocks as $idx => $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}
			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$block['innerBlocks'] = self::sync_heading_levels_with_markup( $block['innerBlocks'], $changed );
			}
			if ( ( $block['blockName'] ?? '' ) !== 'core/heading' ) {
				$blocks[ $idx ] = $block;
				continue;
			}

			$class_name = (string) ( $block['attrs']['className'] ?? '' );
			$is_target  = str_contains( $class_name, 'clipisode-name-heading' )
				|| str_contains( $class_name, 'clipisode-intro-title' );
			if ( ! $is_target ) {
				$blocks[ $idx ] = $block;
				continue;
			}

			$inner_html = (string) ( $block['innerHTML'] ?? '' );
			if ( $inner_html === '' && ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
				$inner_html = implode(
					'',
					array_filter(
						$block['innerContent'],
						static fn ( $part ): bool => is_string( $part )
					)
				);
			}
			if ( preg_match( '/<h([1-6])\b/i', $inner_html, $m ) !== 1 ) {
				$blocks[ $idx ] = $block;
				continue;
			}

			$tag_level     = (int) $m[1];
			$current_level = isset( $block['attrs']['level'] ) ? (int) $block['attrs']['level'] : 2;
			if ( $current_level !== $tag_level ) {
				if ( ! isset( $block['attrs'] ) || ! is_array( $block['attrs'] ) ) {
					$block['attrs'] = [];
				}
				$block['attrs']['level'] = $tag_level;
				$changed                 = true;
			}

			$blocks[ $idx ] = $block;
		}

		return $blocks;
	}

	/**
	 * Auto-heals legacy intro/name heading level mismatches before the editor
	 * reads post content, preventing "Block contains unexpected or invalid
	 * content" prompts on load.
	 */
	private static function migrate_legacy_screen_heading_levels( int $post_id, string $screen_type, string $current_content ): string {
		if ( $post_id <= 0 || ! in_array( $screen_type, [ 'intro', 'name' ], true ) ) {
			return $current_content;
		}
		if ( trim( $current_content ) === '' ) {
			return $current_content;
		}

		$blocks = parse_blocks( $current_content );
		if ( ! is_array( $blocks ) || empty( $blocks ) ) {
			return $current_content;
		}

		$changed = false;
		$blocks  = self::sync_heading_levels_with_markup( $blocks, $changed );
		if ( ! $changed ) {
			return $current_content;
		}

		$fresh = serialize_blocks( $blocks );
		if ( ! is_string( $fresh ) || trim( $fresh ) === '' ) {
			return $current_content;
		}

		$updated = wp_update_post(
			[
				'ID'           => $post_id,
				'post_content' => $fresh,
			],
			true
		);
		if ( is_wp_error( $updated ) ) {
			return $current_content;
		}

		return $fresh;
	}

	/**
	 * Picks a screen target from an Additional class list like
	 * "clipisode-goto-name" or "is-style-outline clipisode-goto-warning_silent".
	 */
	public static function parse_clipisode_goto_target( string $classes ): ?string {
		if ( ! preg_match( '/\bclipisode-goto-([a-z0-9_]+)\b/', $classes, $m ) ) {
			return null;
		}
		$t = $m[1];
		return in_array( $t, self::SCREEN_TYPES, true ) ? $t : null;
	}

	/**
	 * Injects data-wp-on--click and data-wp-context onto the first
	 * wp-block-button__link (or a bare <a>/<button> used as the CTA) so
	 * guest flow navigation works with core/button in the block editor.
	 */
	private static function inject_clipisode_goto_button( string $html, string $target ): string {
		$ctx         = wp_json_encode( [ 'target' => $target ], JSON_UNESCAPED_SLASHES );
		$injection = ' data-wp-on--click="actions.goTo" data-wp-context="' . esc_attr( $ctx ) . '"';
		$out       = preg_replace(
			'/<a(\s+[^>]*\bclass="[^"]*wp-block-button__link)/',
			'<a' . $injection . '$1',
			$html,
			1,
			$cnt
		);
		if ( $cnt > 0 && is_string( $out ) ) {
			return $out;
		}
		$out2 = preg_replace(
			'/<button(\s+[^>]*\bclass="[^"]*wp-block-button__link)/',
			'<button' . $injection . ' type="button" $1',
			$html,
			1,
			$cnt2
		);
		if ( $cnt2 > 0 && is_string( $out2 ) ) {
			return $out2;
		}
		// No wp-block-button__link class (e.g. minimal markup) — first <a> only.
		$out3 = preg_replace( '/<a(\s)/', '<a' . $injection . '$1', $html, 1, $cnt3 );
		return $cnt3 > 0 && is_string( $out3 ) ? $out3 : $html;
	}

	/**
	 * Mapping from "magic" anchor hrefs to render-time rewrite rules.
	 * Authors drop <a href="#record"> / <a href="#upload"> / <a href="#terms">
	 * into any Paragraph, Heading, or Button and the render filter wires
	 * them up to the right behavior without the author having to know
	 * about IAPI.
	 *
	 * Two rewrite kinds:
	 *   - 'file': replace the <a> with a <label for="..."> pointing at one
	 *     of the hidden file inputs. Native HTML label→input pairing fires
	 *     the file picker reliably on iOS Safari, where programmatic
	 *     .click() on a hidden file input via a delegated synthetic click
	 *     event is unreliable. The native gesture chain stays intact, no
	 *     JS is needed for the file dialog itself, and IAPI only sees the
	 *     resulting `change` event on the input.
	 *   - 'iapi': keep the <a> and inject data-wp-on--click="<action>".
	 *     Used for #terms (the modal toggle is a state flip, not a
	 *     gesture-bound browser dialog, so synthetic events are fine).
	 *
	 * Kept tight (3 keys) to avoid accidentally rewriting unrelated `#`
	 * anchors a theme might be using for in-page jumps.
	 */
	private const FLOW_MAGIC_HREFS = [
		'#record' => [ 'kind' => 'file', 'for' => 'clipisode-record-input' ],
		'#upload' => [ 'kind' => 'file', 'for' => 'clipisode-upload-input' ],
		'#terms'  => [ 'kind' => 'iapi', 'action' => 'actions.openTerms' ],
	];

	/**
	 * Applies one FLOW_MAGIC_HREFS entry to a block's rendered HTML.
	 *
	 * For 'file' magic hrefs, rewrites <a ... href="#record" ...>LABEL</a>
	 * to <label for="clipisode-record-input" ...>LABEL</label>, dropping
	 * the href entirely (labels don't navigate) and preserving every
	 * other attribute (including class, so wp-block-button__link styling
	 * carries over). The negative lookahead on data-clipisode-magic
	 * keeps the rewrite idempotent against nested render passes.
	 *
	 * For 'iapi' magic hrefs, injects data-wp-on--click on the <a>
	 * (idempotent via a separate negative lookahead on data-wp-on--click).
	 *
	 * Anchors are not nested in valid HTML, so a non-greedy `[\s\S]*?`
	 * inner-content match between <a ...> and </a> is safe here.
	 */
	private static function rewrite_magic_href( string $html, string $href, array $cfg ): string {
		$quoted = preg_quote( $href, '/' );

		if ( ( $cfg['kind'] ?? '' ) === 'file' ) {
			$for_attr = esc_attr( (string) ( $cfg['for'] ?? '' ) );
			if ( $for_attr === '' ) {
				return $html;
			}

			$pattern = '/<a\b(?![^>]*?data-clipisode-magic)([^>]*?)\s+href=(["\'])'
				. $quoted
				. '\2([^>]*?)>([\s\S]*?)<\/a>/i';
			$rewrite = '<label data-clipisode-magic="1" for="' . $for_attr . '"$1$3>$4</label>';

			$out = preg_replace( $pattern, $rewrite, $html );
			return is_string( $out ) ? $out : $html;
		}

		// 'iapi' kind — inject data-wp-on--click on the existing <a>.
		$action  = (string) ( $cfg['action'] ?? '' );
		if ( $action === '' ) {
			return $html;
		}
		$pattern = '/<a\b(?![^>]*data-wp-on--click)([^>]*?\bhref=(["\'])'
			. $quoted
			. '\2[^>]*?)>/i';
		$rewrite = '<a data-wp-on--click="' . $action . '"$1>';

		$out = preg_replace( $pattern, $rewrite, $html );
		return is_string( $out ) ? $out : $html;
	}

	/**
	 * Guest flow render-time mutator. Hooked on `render_block` and only
	 * active inside the public invitation request (gated by the
	 * clipisode_invite query var, set by Clipisode_Invitation::register_rewrite()).
	 * Responsibilities, in order:
	 *
	 *   1. Substitute {host_name} / {topic_title} placeholders into any
	 *      core/paragraph or core/heading content using the per-request
	 *      topic context set by clipisode-flow.php.
	 *   2. Bind magic hrefs (#record, #upload, #terms) on any <a> in the
	 *      block to the matching IAPI action. Authors keep editing those
	 *      links as ordinary RichText links in the editor — the rewrite
	 *      only happens on the public flow.
	 *   3. Fall through to the existing clipisode-goto-<screen_type> class
	 *      convention for buttons that just transition between screens.
	 *   4. Add data-wp-class--clipisode-dimmed on .clipisode-intro-top /
	 *      .clipisode-intro-bottom Group blocks so the scrims fade out
	 *      while the intro video plays.
	 *
	 * Everything that used to need a wp:cover or wp:html block (intro
	 * video, play button, scrim layering) now lives in the flow template
	 * + plugin CSS, so we can keep the saved block markup down to plain
	 * core blocks the editor reliably round-trips.
	 */
	public static function filter_flow_block_directives( string $block_content, array $block ): string {
		if ( ! get_query_var( 'clipisode_invite' ) ) {
			return $block_content;
		}

		$block_name = (string) ( $block['blockName'] ?? '' );

		// 1. Topic placeholder substitution. Cheap str_replace for the few
		// supported keys; a no-op when the content doesn't contain a token.
		if ( in_array( $block_name, [ 'core/paragraph', 'core/heading' ], true ) ) {
			$block_content = self::apply_flow_placeholders( $block_content );
		}

		// 2. Magic hrefs. Two rewrite kinds — see FLOW_MAGIC_HREFS docblock
		// for the iOS rationale on why file-pickers need labels.
		foreach ( self::FLOW_MAGIC_HREFS as $href => $cfg ) {
			$block_content = self::rewrite_magic_href( $block_content, $href, $cfg );
		}

		// 3. clipisode-goto-<screen_type> on a button → in-flow transition.
		if ( $block_name === 'core/button' ) {
			$class_name = (string) ( $block['attrs']['className'] ?? '' );
			$target     = self::parse_clipisode_goto_target( $class_name );
			if ( $target === null ) {
				$target = self::parse_clipisode_goto_target( $block_content );
			}
			if ( $target !== null ) {
				$block_content = self::inject_clipisode_goto_button( $block_content, $target );
			}
		}

		// 4. Intro top/bottom scrim fade while video plays. Group blocks
		// only; we look at both the saved className attribute and the
		// rendered content (themes may strip className from attrs).
		if ( $block_name === 'core/group' ) {
			$class_name = (string) ( $block['attrs']['className'] ?? '' );
			$is_scrim   = str_contains( $class_name, 'clipisode-intro-top' )
				|| str_contains( $class_name, 'clipisode-intro-bottom' )
				|| (
					$class_name === ''
					&& (
						str_contains( $block_content, 'clipisode-intro-top' )
						|| str_contains( $block_content, 'clipisode-intro-bottom' )
					)
				);
			if ( $is_scrim ) {
				$out = preg_replace(
					'/<div /',
					'<div data-wp-class--clipisode-dimmed="state.videoPlaying" ',
					$block_content,
					1
				);
				if ( is_string( $out ) ) {
					$block_content = $out;
				}
			}
		}

		return $block_content;
	}

	/**
	 * Resolves the starter block markup for a given screen type.
	 *
	 * Looks first for assets/themes/default/<screen_type>.html relative to
	 * the plugin root. Files that exist there are the source of truth for
	 * the default theme's screens; editing them and reseeding is how we
	 * iterate on screen designs. Screens we haven't designed yet fall back
	 * to a one-paragraph placeholder so the seeder still produces all 10
	 * posts.
	 *
	 * All non-block HTML comments are stripped before returning, both
	 * leading file-level documentation AND inline notes between block
	 * markers. Anything that isn't a recognized <!-- wp:* --> /
	 * <!-- /wp:* --> marker would otherwise be parsed as a freeform
	 * Classic block by Gutenberg, which trips block validation and
	 * shows the editor's "recover this content" prompt.
	 */
	private static function default_screen_content( string $screen_type ): string {
		$file = CLIPISODE_PLUGIN_DIR . "assets/themes/default/{$screen_type}.html";
		if ( file_exists( $file ) ) {
			$content = file_get_contents( $file );
			if ( $content !== false && trim( $content ) !== '' ) {
				$content = self::strip_doc_comments( $content );
				return self::substitute_seed_tokens( $content );
			}
		}

		$label = self::screen_title( $screen_type );
		return "<!-- wp:paragraph --><p>{$label} (placeholder)</p><!-- /wp:paragraph -->";
	}

	/**
	 * Substitutes seed-time placeholder tokens in starter HTML with
	 * site-specific values.
	 *
	 * Tokens:
	 *   - {logo_id} / {logo_url}   the attachment id and public URL of
	 *                              the default logo (from
	 *                              DEFAULT_LOGO_OPTION, set by
	 *                              ensure_default_logo_attachment()).
	 *                              Used inside the core/image block
	 *                              for the desktop intro logo.
	 *   - {qr_id} / {qr_url}       the attachment id and public URL of
	 *                              the default QR placeholder image
	 *                              (from DEFAULT_QR_OPTION, set by
	 *                              ensure_default_qr_attachment()).
	 *                              Used inside the core/image block
	 *                              that the desktop intro flow's QR
	 *                              slot was promoted into so authors
	 *                              can resize / pad / border / move
	 *                              the QR placeholder via standard
	 *                              image-block controls. The public
	 *                              renderer detects the figure and
	 *                              swaps the <img> for the live QR
	 *                              canvas mount at request time.
	 *
	 * Both pairs use the same wp-image-N class + id-attribute pattern
	 * Gutenberg's core/image validator requires; tokens missing from
	 * the starter HTML are simply not replaced.
	 *
	 * If the underlying option is missing (activation didn't run or
	 * failed), the helpers ensure_default_*_attachment() self-heal
	 * by importing on demand. If THAT fails, tokens are left as
	 * literal strings so the failure is visible in the editor as an
	 * explicit broken-image rather than silently substituting fallback
	 * values that mask the problem.
	 *
	 * Note: this runs only at seed time (when ensure_screen() inserts
	 * a new post). Author edits are stored verbatim in post_content
	 * and never re-substituted.
	 */
	private static function substitute_seed_tokens( string $content ): string {
		$replacements = [];

		// Logo. Self-heal if the option is missing or points at a
		// deleted attachment.
		$logo_id = (int) get_option( self::DEFAULT_LOGO_OPTION, 0 );
		if ( $logo_id <= 0 || ! get_post( $logo_id ) ) {
			$logo_id = self::ensure_default_logo_attachment();
		}
		if ( $logo_id > 0 ) {
			$logo_url = (string) wp_get_attachment_url( $logo_id );
			if ( $logo_url !== '' ) {
				$replacements['{logo_id}']  = (string) $logo_id;
				$replacements['{logo_url}'] = $logo_url;
			}
		}

		// QR placeholder. Same self-healing pattern.
		$qr_id = (int) get_option( self::DEFAULT_QR_OPTION, 0 );
		if ( $qr_id <= 0 || ! get_post( $qr_id ) ) {
			$qr_id = self::ensure_default_qr_attachment();
		}
		if ( $qr_id > 0 ) {
			$qr_url = (string) wp_get_attachment_url( $qr_id );
			if ( $qr_url !== '' ) {
				$replacements['{qr_id}']  = (string) $qr_id;
				$replacements['{qr_url}'] = $qr_url;
			}
		}

		if ( empty( $replacements ) ) {
			return $content;
		}

		return strtr( $content, $replacements );
	}

	/**
	 * Strips ALL non-block HTML comments from starter content.
	 *
	 * Block comments (<!-- wp:* --> and <!-- /wp:* -->) are preserved,
	 * since those ARE the block markers Gutenberg parses. Any other
	 * <!-- ... --> comment, whether at the top of the file or between
	 * blocks, is removed before the content is stored as post_content.
	 *
	 * Why: Gutenberg's block parser treats anything between block
	 * markers that isn't itself a marker as freeform / Classic block
	 * content. A developer-facing doc comment between blocks shows up
	 * in the editor's List View as a "Classic" entry and breaks block
	 * validation when it appears mid-block. Stripping all non-block
	 * comments lets us keep human-readable notes in the starter HTML
	 * files without leaking them into post_content.
	 *
	 * Behavior intentionally aggressive: this runs once at seed time,
	 * never on author-edited post_content, so we don't have to worry
	 * about preserving comments authors might have added themselves.
	 *
	 * Implementation note: the regex uses a negative lookahead to
	 * skip block comments (which start with `wp:` or `/wp:` after
	 * optional whitespace). Trailing whitespace after a stripped
	 * comment is also collapsed to a single newline so consecutive
	 * blocks stay on adjacent lines instead of leaving large gaps.
	 */
	private static function strip_doc_comments( string $content ): string {
		$out = preg_replace(
			'/<!--(?!\s*\/?wp:)[\s\S]*?-->\s*/',
			'',
			$content
		);
		if ( ! is_string( $out ) ) {
			$out = $content;
		}
		// Collapse runs of blank lines that the comment stripping
		// might have left behind, but preserve single newlines so
		// the result remains readable in the database.
		$out = preg_replace( "/\n{3,}/", "\n\n", $out );
		return is_string( $out ) ? ltrim( $out ) : $content;
	}

	/**
	 * Loads the theme's preview-values.json (sample values for tokens
	 * like {topic_title}, {host_name}, etc.) and returns it as a
	 * token => string map for the editor preview simulator.
	 *
	 * The JSON file supports two value shapes:
	 *
	 *   1. Plain strings — used as-is.
	 *
	 *      "host_name": "Sarah Chen"
	 *
	 *   2. Templates with {variable} interpolation — variables are
	 *      resolved against the same map (after plain strings are
	 *      loaded) plus a small set of plugin-derived built-ins
	 *      that the JSON can't know:
	 *
	 *        {site_url}             home_url() of the current site
	 *        {invitation_prefix}    Clipisode_Invitation::get_prefix()
	 *        {short_url_base}       Clipisode_Invitation::get_short_url_base()
	 *                               (empty string until the short-URL
	 *                                feature is configured; see
	 *                                docs/specs/planned/short-invitation-urls.md)
	 *
	 *      "invitation_url": "{site_url}/{invitation_prefix}/{invitation_slug}/"
	 *
	 *      Any unknown {variable} or empty resolution short-circuits
	 *      the template to an empty string, which the editor JS
	 *      treats the same as a missing key (raw token stays visible
	 *      in the canvas, surfacing the misconfiguration).
	 *
	 *   3. Optional fallback — a value that's an array shaped like
	 *      `{ "template": "...", "fallback": "{other_key}" }` resolves
	 *      to its template if non-empty, otherwise to the resolved
	 *      `fallback` value. Lets {invitation_short_url} degrade to
	 *      {invitation_url} when no short-URL base is configured,
	 *      without requiring callers to know the difference.
	 *
	 * The editor JS (preview-values.js) consumes the final flat map
	 * via wp_localize_script. It doesn't know or care which entries
	 * were plain, templated, or fall-throughs.
	 *
	 * Returns an empty array if the file is missing or malformed; the
	 * editor JS treats that as "no preview" and silently leaves raw
	 * tokens in place.
	 */
	private static function load_theme_preview_values(): array {
		$path = CLIPISODE_PLUGIN_DIR . 'assets/themes/default/preview-values.json';
		if ( ! file_exists( $path ) ) {
			return [];
		}
		$raw = file_get_contents( $path );
		if ( ! is_string( $raw ) || $raw === '' ) {
			return [];
		}
		$decoded = json_decode( $raw, true );
		if ( ! is_array( $decoded ) ) {
			return [];
		}

		// Pass 1: harvest plain string/numeric values into the
		// resolution context, leaving template / fallback shapes
		// untouched in the source array for pass 2 to handle.
		$context = self::preview_value_builtins();
		foreach ( $decoded as $key => $value ) {
			if ( ! is_string( $key ) ) {
				continue;
			}
			if ( is_string( $value ) || is_int( $value ) || is_float( $value ) ) {
				$context[ $key ] = (string) $value;
			}
		}

		// Pass 2: resolve templated values and fallback shapes against
		// the context built in pass 1. We allow templated values to
		// reference each other; the resolver runs each template up
		// to a small recursion limit to handle one-level chaining
		// (e.g. {invitation_short_url} fallback -> {invitation_url}).
		foreach ( $decoded as $key => $value ) {
			if ( ! is_string( $key ) ) {
				continue;
			}
			if ( is_array( $value ) ) {
				$resolved = self::resolve_preview_template_with_fallback( $value, $context );
				if ( $resolved !== null ) {
					$context[ $key ] = $resolved;
				}
				continue;
			}
			if ( is_string( $value ) && strpos( $value, '{' ) !== false ) {
				// A plain string that contains an interpolation token.
				// Re-resolve and overwrite the pass-1 entry.
				$resolved = self::interpolate_preview_value( $value, $context );
				$context[ $key ] = $resolved;
			}
		}

		// Strip built-ins back out of the returned map — they were
		// only there to feed interpolation. The editor doesn't need
		// to know about {site_url} or {invitation_prefix}; those are
		// implementation details of how URL-shaped previews are
		// constructed.
		foreach ( array_keys( self::preview_value_builtins() ) as $builtin_key ) {
			unset( $context[ $builtin_key ] );
		}

		// Drop any final entry that resolved to empty string. The
		// editor JS treats a missing key the same as a configured
		// empty: raw token stays visible. Better to surface the
		// misconfiguration than render a half-resolved sample.
		return array_filter( $context, function ( $v ) {
			return is_string( $v ) && $v !== '';
		} );
	}

	/**
	 * Plugin-derived variables available to preview-values.json
	 * templates as built-ins. Theme developers can reference any of
	 * these inside a {var} template and the resolver fills them in
	 * at request time.
	 *
	 * - site_url:           home_url(). Tracks domain changes.
	 * - invitation_prefix:  Clipisode_Invitation::get_prefix(). Tracks
	 *                       admin-configured invitation route changes.
	 * - short_url_base:     Clipisode_Invitation::get_short_url_base()
	 *                       when defined and non-empty; otherwise
	 *                       empty string. Drives the
	 *                       {invitation_short_url} fallback shape.
	 *
	 * Returning a flat array keeps the resolver path simple: pass 1
	 * seeds the context with these, pass 2 unifies them with the JSON
	 * values during interpolation.
	 */
	private static function preview_value_builtins(): array {
		$builtins = [
			'site_url'           => home_url( '' ),
			'invitation_prefix'  => '',
			'short_url_base'     => '',
		];
		if ( class_exists( 'Clipisode_Invitation' ) ) {
			$builtins['invitation_prefix'] = (string) Clipisode_Invitation::get_prefix();
			if ( method_exists( 'Clipisode_Invitation', 'get_short_url_base' ) ) {
				$builtins['short_url_base'] = (string) Clipisode_Invitation::get_short_url_base();
			}
		}
		// Strip a trailing slash from site_url so templates like
		// "{site_url}/{invitation_prefix}/..." don't double up. Same
		// for short_url_base.
		$builtins['site_url']       = rtrim( $builtins['site_url'], '/' );
		$builtins['short_url_base'] = rtrim( $builtins['short_url_base'], '/' );
		return $builtins;
	}

	/**
	 * Resolves {variable} substrings in $template against the $context
	 * map. Variables that don't resolve (missing key, empty string)
	 * cause the entire template to return empty string — the caller
	 * uses that signal to drop the entry from the final preview map.
	 *
	 * Recursion is bounded at 3 passes, which is enough for the
	 * common case (template references a key that itself was
	 * templated, e.g. {invitation_short_url} -> {invitation_url} ->
	 * {site_url}/{invitation_prefix}/{invitation_slug}/) without
	 * creating an unbounded loop on a circular reference.
	 */
	private static function interpolate_preview_value( string $template, array $context, int $depth = 0 ): string {
		if ( $depth >= 3 ) {
			return '';
		}
		if ( strpos( $template, '{' ) === false ) {
			return $template;
		}
		$any_unresolved = false;
		$out = preg_replace_callback(
			'/\{([a-z_][a-z0-9_]*)\}/i',
			function ( $m ) use ( $context, $depth, &$any_unresolved ) {
				$key = $m[1];
				if ( ! array_key_exists( $key, $context ) ) {
					$any_unresolved = true;
					return '';
				}
				$val = $context[ $key ];
				if ( ! is_string( $val ) || $val === '' ) {
					$any_unresolved = true;
					return '';
				}
				if ( strpos( $val, '{' ) !== false ) {
					$resolved = self::interpolate_preview_value( $val, $context, $depth + 1 );
					if ( $resolved === '' ) {
						$any_unresolved = true;
					}
					return $resolved;
				}
				return $val;
			},
			$template
		);
		if ( ! is_string( $out ) || $any_unresolved ) {
			return '';
		}
		return $out;
	}

	/**
	 * Resolves a `{ "template": "...", "fallback": "..." }` shape
	 * from preview-values.json. Returns the resolved template if
	 * non-empty, else the resolved fallback (which itself may be
	 * a plain value or another template). Returns null when both
	 * legs resolve empty so the caller can drop the entry.
	 */
	private static function resolve_preview_template_with_fallback( array $shape, array $context ) {
		$template = isset( $shape['template'] ) && is_string( $shape['template'] )
			? $shape['template']
			: '';
		if ( $template !== '' ) {
			$resolved = self::interpolate_preview_value( $template, $context );
			if ( $resolved !== '' ) {
				return $resolved;
			}
		}
		$fallback = isset( $shape['fallback'] ) && is_string( $shape['fallback'] )
			? $shape['fallback']
			: '';
		if ( $fallback !== '' ) {
			$resolved = self::interpolate_preview_value( $fallback, $context );
			if ( $resolved !== '' ) {
				return $resolved;
			}
		}
		return null;
	}

	/**
	 * Constrains the block editor canvas width when editing a clipisode_screen
	 * post so what the editor sees matches what a guest sees on a phone.
	 *
	 * Mobile screens (everything except intro_desktop) get a 414px-wide canvas,
	 * which is comfortably wider than iPhone 14 Pro (393pt) and accommodates
	 * the wider iPhone Pro Max (430pt) and most Androids. The intro_desktop
	 * screen - which is shown to guests opening the link on a laptop - gets a
	 * 1280px canvas instead.
	 *
	 * Hooked on `enqueue_block_assets`, which fires both in the editor chrome
	 * and INSIDE the iframed canvas. We attach the inline style to the
	 * `wp-block-library` handle since that's loaded in the iframe; the rules
	 * use selectors that only match inside the canvas (.editor-styles-wrapper
	 * is the iframe's body class) so they're inert in the chrome.
	 *
	 * The earlier attempt used `block_editor_settings_all` to push CSS through
	 * the editor settings' `styles` array. That works for the site editor but
	 * doesn't reliably reach post-edit iframe canvases in WP 6.9.
	 *
	 * Hooked from clipisode.php on `enqueue_block_assets`.
	 */
	/**
	 * Resolves the post type of the post currently being edited in wp-admin.
	 *
	 * Looks at $_GET['post'] (post.php?post=<id>&action=edit) first; if that's
	 * empty (post-new.php) it falls back to $_GET['post_type']. Returns an
	 * empty string when neither is present, which the callers treat as "not
	 * an edit-screen request, bail."
	 */
	private static function current_screen_post_type(): string {
		$post_id = isset( $_GET['post'] ) ? (int) $_GET['post'] : 0;
		if ( $post_id ) {
			$post = get_post( $post_id );
			if ( $post ) {
				return $post->post_type;
			}
		}
		if ( isset( $_GET['post_type'] ) ) {
			return sanitize_key( wp_unslash( $_GET['post_type'] ) );
		}
		return '';
	}

	/**
	 * block_editor_settings_all filter for clipisode_screen posts.
	 *
	 * Adds FONT_REGISTRY font-family presets, maps size steps S/M to 12px/16px
	 * (small + medium slugs), and appends a small Clipisode color palette so
	 * typography and text/background picks stay usable in the iframe canvas.
	 *
	 * @param array<string,mixed> $settings
	 * @param mixed               $editor_context
	 * @return array<string,mixed>
	 */
	public static function filter_screen_editor_font_settings( array $settings, $editor_context ): array {
		$post_type = '';
		if ( is_object( $editor_context ) && isset( $editor_context->post ) && $editor_context->post instanceof WP_Post ) {
			$post_type = (string) $editor_context->post->post_type;
		}
		if ( $post_type === '' ) {
			$post_type = self::current_screen_post_type();
		}
		if ( $post_type !== 'clipisode_screen' ) {
			return $settings;
		}

		$fonts = self::screen_editor_font_presets();
		if ( ! empty( $fonts ) ) {
			$settings['fontFamilies'] = self::merge_font_family_setting(
				$settings['fontFamilies'] ?? [],
				$fonts
			);

			if ( ! isset( $settings['typography'] ) || ! is_array( $settings['typography'] ) ) {
				$settings['typography'] = [];
			}
			$settings['typography']['fontFamilies'] = self::merge_font_family_setting(
				$settings['typography']['fontFamilies'] ?? [],
				$fonts
			);

			if ( ! isset( $settings['__experimentalFeatures'] ) || ! is_array( $settings['__experimentalFeatures'] ) ) {
				$settings['__experimentalFeatures'] = [];
			}
			if ( ! isset( $settings['__experimentalFeatures']['typography'] ) || ! is_array( $settings['__experimentalFeatures']['typography'] ) ) {
				$settings['__experimentalFeatures']['typography'] = [];
			}

			$settings['__experimentalFeatures']['typography']['fontFamilies'] = self::merge_font_family_setting(
				$settings['__experimentalFeatures']['typography']['fontFamilies'] ?? [],
				$fonts
			);
		}

		if ( ! isset( $settings['typography'] ) || ! is_array( $settings['typography'] ) ) {
			$settings['typography'] = [];
		}
		if ( ! isset( $settings['__experimentalFeatures'] ) || ! is_array( $settings['__experimentalFeatures'] ) ) {
			$settings['__experimentalFeatures'] = [];
		}
		if ( ! isset( $settings['__experimentalFeatures']['typography'] ) || ! is_array( $settings['__experimentalFeatures']['typography'] ) ) {
			$settings['__experimentalFeatures']['typography'] = [];
		}

		// Map invitation body size steps: S = 12px, M = 16px (small / medium slugs).
		$settings['typography']['fontSizes'] = self::merge_clipisode_screen_editor_font_sizes(
			$settings['typography']['fontSizes'] ?? []
		);
		$settings['__experimentalFeatures']['typography']['fontSizes'] = self::merge_clipisode_screen_editor_font_sizes(
			$settings['__experimentalFeatures']['typography']['fontSizes'] ?? []
		);

		$clipisode_palette = self::clipisode_screen_editor_color_presets();
		if ( $clipisode_palette !== [] ) {
			if ( isset( $settings['colors'] ) && is_array( $settings['colors'] ) ) {
				$settings['colors'] = array_merge( $settings['colors'], $clipisode_palette );
			} else {
				$settings['colors'] = $clipisode_palette;
			}
			if ( ! isset( $settings['color'] ) || ! is_array( $settings['color'] ) ) {
				$settings['color'] = [];
			}
			if ( ! isset( $settings['color']['palette'] ) || ! is_array( $settings['color']['palette'] ) ) {
				$settings['color']['palette'] = [];
			}
			$settings['color']['palette'] = array_merge( $settings['color']['palette'], $clipisode_palette );
		}

		// Force-enable color, spacing, border, and dimensions controls
		// for screen posts regardless of what the active site theme's
		// theme.json declares. Twenty Twenty-Five (the current default
		// WordPress theme) ships with several of these turned off,
		// which strips the entire Color panel from core/group blocks
		// in the sidebar — authors clicking the Card or Root group
		// see only Layout / Position / Advanced. Pushing the
		// capabilities through __experimentalFeatures restores the
		// controls without modifying the active theme.
		//
		// We only flip the FEATURE flags on. We don't push our own
		// presets for spacing/border/dimensions; whatever defaults
		// Gutenberg ships with are fine. The color palette merge
		// above is the only preset injection.
		$features = $settings['__experimentalFeatures'] ?? [];
		if ( ! is_array( $features ) ) {
			$features = [];
		}

		$color = $features['color'] ?? [];
		if ( ! is_array( $color ) ) {
			$color = [];
		}
		$color['background']      = true;
		$color['text']             = true;
		$color['link']             = true;
		$color['heading']          = true;
		$color['button']           = true;
		$color['custom']           = true;
		$color['customGradient']   = true;
		$color['defaultPalette']   = true;
		$color['defaultGradients'] = true;
		$features['color']         = $color;

		$spacing = $features['spacing'] ?? [];
		if ( ! is_array( $spacing ) ) {
			$spacing = [];
		}
		$spacing['padding']    = true;
		$spacing['margin']     = true;
		$spacing['blockGap']   = true;
		$spacing['units']      = [ 'px', 'em', 'rem', '%' ];
		$features['spacing']   = $spacing;

		$border = $features['border'] ?? [];
		if ( ! is_array( $border ) ) {
			$border = [];
		}
		$border['color']  = true;
		$border['radius'] = true;
		$border['style']  = true;
		$border['width']  = true;
		$features['border'] = $border;

		$dimensions = $features['dimensions'] ?? [];
		if ( ! is_array( $dimensions ) ) {
			$dimensions = [];
		}
		$dimensions['minHeight']  = true;
		$features['dimensions']   = $dimensions;

		$settings['__experimentalFeatures'] = $features;

		return $settings;
	}

	/**
	 * Font size presets for clipisode_screen: S and M match the two body sizes
	 * used on invitation screens (12px and 16px).
	 *
	 * @param array<int,array<string,mixed>> $sizes
	 * @return array<int,array<string,mixed>>
	 */
	/**
	 * Replaces / adds the five-step size scale Gutenberg's font-size
	 * picker exposes for clipisode_screen posts.
	 *
	 * Authors see S / M / L / XL / XXL in the sidebar; Gutenberg
	 * stores the choice as `style.typography.fontSize` on the block,
	 * which renders as inline CSS. Because the inline rule has
	 * specificity 1,0,0 (style attribute) and beats most class
	 * selectors, the chosen size flows through to the canvas and the
	 * public flow without any class-based override fighting.
	 *
	 * Per-class typography rules elsewhere in this file MUST NOT use
	 * `font-size: NNpx !important` if we want this picker to work —
	 * !important elevates a class selector to beat the inline style.
	 * The convention in this codebase is: per-class rules pin
	 * margin/padding/color/text-align with !important, and pin
	 * font-size WITHOUT !important so the picker (or block-level
	 * inline style) can override.
	 *
	 * The previous implementation only filled in S and M, leaving
	 * L/XL/XXL undefined and letting the active site theme provide
	 * them — which produced the symptom that picking L/XL did
	 * nothing visible (theme didn't define them) while picking XXL
	 * sometimes shrank text (theme did define it but at a smaller
	 * size than our base rule). Defining all five centrally fixes
	 * both.
	 */
	private static function merge_clipisode_screen_editor_font_sizes( array $sizes ): array {
		$patch = [
			'small'    => [
				'name' => __( 'S — small copy (12px)', 'clipisode' ),
				'size' => '12px',
			],
			'medium'   => [
				'name' => __( 'M — body (16px)', 'clipisode' ),
				'size' => '16px',
			],
			'large'    => [
				'name' => __( 'L — emphasis (22px)', 'clipisode' ),
				'size' => '22px',
			],
			'x-large'  => [
				'name' => __( 'XL — heading (32px)', 'clipisode' ),
				'size' => '32px',
			],
			'xx-large' => [
				'name' => __( 'XXL — hero (48px)', 'clipisode' ),
				'size' => '48px',
			],
		];
		$found = array_fill_keys( array_keys( $patch ), false );
		foreach ( $sizes as $i => $entry ) {
			if ( ! is_array( $entry ) || ! isset( $entry['slug'] ) ) {
				continue;
			}
			$slug = (string) $entry['slug'];
			if ( isset( $patch[ $slug ] ) ) {
				$sizes[ $i ] = array_merge( $entry, $patch[ $slug ], [ 'slug' => $slug ] );
				$found[ $slug ] = true;
			}
		}
		foreach ( $patch as $slug => $def ) {
			if ( empty( $found[ $slug ] ) ) {
				$sizes[] = array_merge( [ 'slug' => $slug ], $def );
			}
		}
		return $sizes;
	}

	/**
	 * @return array<int,array{name:string,slug:string,color:string}>
	 */
	private static function clipisode_screen_editor_color_presets(): array {
		return [
			[
				'name'  => __( 'Body text', 'clipisode' ),
				'slug'  => 'clipisode-body',
				'color' => '#111111',
			],
			[
				'name'  => __( 'Label / muted', 'clipisode' ),
				'slug'  => 'clipisode-label',
				'color' => '#6b7280',
			],
			[
				'name'  => __( 'Clipisode blue (buttons)', 'clipisode' ),
				'slug'  => 'clipisode-blue',
				'color' => '#3964b0',
			],
			[
				'name'  => __( 'Link', 'clipisode' ),
				'slug'  => 'clipisode-link',
				'color' => '#396554',
			],
		];
	}

	/**
	 * @return array<string,array<string,string>>
	 */
	public static function font_registry(): array {
		$fonts = apply_filters( 'clipisode_font_registry', self::FONT_REGISTRY );
		return is_array( $fonts ) ? $fonts : self::FONT_REGISTRY;
	}

	/**
	 * @return array<string,string>
	 */
	public static function layout_registry(): array {
		$layout = apply_filters( 'clipisode_layout_registry', self::LAYOUT_REGISTRY );
		return is_array( $layout ) ? $layout : self::LAYOUT_REGISTRY;
	}

	public static function font_registry_stylesheet_url(): string {
		$families = [];
		foreach ( self::font_registry() as $entry ) {
			if ( ! is_array( $entry ) ) {
				continue;
			}
			$family = isset( $entry['google_css2_family'] ) ? trim( (string) $entry['google_css2_family'] ) : '';
			if ( $family !== '' && ! in_array( $family, $families, true ) ) {
				$families[] = $family;
			}
		}
		if ( empty( $families ) ) {
			return '';
		}
		$query_parts = [];
		foreach ( $families as $family ) {
			$query_parts[] = 'family=' . $family;
		}
		$query_parts[] = 'display=swap';
		return 'https://fonts.googleapis.com/css2?' . implode( '&', $query_parts );
	}

	public static function font_registry_css_variables(): string {
		$fonts = self::font_registry();
		$heading = ( isset( $fonts['heading'] ) && is_array( $fonts['heading'] ) ) ? $fonts['heading'] : [];
		$body    = ( isset( $fonts['body'] ) && is_array( $fonts['body'] ) ) ? $fonts['body'] : [];

		$heading_family = isset( $heading['font_family'] ) ? trim( (string) $heading['font_family'] ) : '';
		$body_family    = isset( $body['font_family'] ) ? trim( (string) $body['font_family'] ) : '';
		$heading_weight = self::normalize_font_weight(
			isset( $heading['font_weight'] ) ? (string) $heading['font_weight'] : '',
			'700'
		);
		$body_weight    = self::normalize_font_weight(
			isset( $body['font_weight'] ) ? (string) $body['font_weight'] : '',
			'400'
		);

		if ( $heading_family === '' || $body_family === '' ) {
			return '';
		}

		return ':root{'
			. '--clipisode-invite-heading-font-family:' . $heading_family . ';'
			. '--clipisode-invite-heading-font-weight:' . $heading_weight . ';'
			. '--clipisode-invite-body-font-family:' . $body_family . ';'
			. '--clipisode-invite-body-font-weight:' . $body_weight . ';'
			. '}';
	}

	private static function normalize_font_weight( string $raw, string $fallback ): string {
		$raw = trim( $raw );
		if ( $raw === '' ) {
			return $fallback;
		}
		$normalized = strtolower( $raw );
		if ( $normalized === 'normal' || $normalized === 'bold' ) {
			return $normalized;
		}
		if ( preg_match( '/([1-9]00)/', $raw, $m ) ) {
			return (string) $m[1];
		}
		return $fallback;
	}

	public static function layout_registry_css_variables(): string {
		$layout = self::layout_registry();
		$mobile_gutter = isset( $layout['mobile_gutter'] ) ? trim( (string) $layout['mobile_gutter'] ) : '';
		$mobile_content_max = isset( $layout['mobile_content_max'] ) ? trim( (string) $layout['mobile_content_max'] ) : '';
		if ( $mobile_gutter === '' || $mobile_content_max === '' ) {
			return '';
		}
		return ':root{'
			. '--clipisode-mobile-gutter:' . $mobile_gutter . ';'
			. '--clipisode-mobile-content-max:' . $mobile_content_max . ';'
			. '}';
	}

	/**
	 * Enqueues the shared invitation theme stylesheet plus any remote font
	 * stylesheet declared by FONT_REGISTRY, then injects CSS variables derived
	 * from FONT_REGISTRY + LAYOUT_REGISTRY so theme.css and flow CSS can stay
	 * role-based instead of hardcoding family names / phone gutters / content
	 * widths in multiple files.
	 */
	public static function enqueue_default_theme_style(): void {
		$theme_css_path = CLIPISODE_PLUGIN_DIR . 'assets/themes/default/theme.css';
		if ( ! file_exists( $theme_css_path ) ) {
			return;
		}

		$deps = [];
		$font_stylesheet_url = self::font_registry_stylesheet_url();
		if ( $font_stylesheet_url !== '' ) {
			wp_enqueue_style(
				'clipisode-default-theme-fonts',
				$font_stylesheet_url,
				[],
				null
			);
			$deps[] = 'clipisode-default-theme-fonts';
		}

		wp_enqueue_style(
			'clipisode-default-theme-style',
			plugins_url( 'assets/themes/default/theme.css', CLIPISODE_PLUGIN_DIR . 'clipisode.php' ),
			$deps,
			(string) filemtime( $theme_css_path )
		);

		$vars_css = self::font_registry_css_variables() . self::layout_registry_css_variables();
		if ( $vars_css !== '' ) {
			wp_add_inline_style( 'clipisode-default-theme-style', $vars_css );
		}
	}

	/**
	 * @return array<int,array{slug:string,name:string,fontFamily:string}>
	 */
	private static function screen_editor_font_presets(): array {
		$out = [];
		foreach ( self::font_registry() as $entry ) {
			if ( ! is_array( $entry ) ) {
				continue;
			}
			$slug   = isset( $entry['slug'] ) ? trim( (string) $entry['slug'] ) : '';
			$label  = isset( $entry['label'] ) ? trim( (string) $entry['label'] ) : '';
			$family = isset( $entry['font_family'] ) ? trim( (string) $entry['font_family'] ) : '';
			if ( $slug === '' || $label === '' || $family === '' ) {
				continue;
			}
			$out[] = [
				'slug'       => $slug,
				'name'       => $label,
				'fontFamily' => $family,
			];
		}
		return $out;
	}

	/**
	 * Merges Clipisode font presets into either of these WP settings shapes:
	 *   1) list form: [ { slug, name, fontFamily }, ... ]
	 *   2) origin map: { theme: [...], custom: [...], default: [...] }
	 *
	 * @param mixed                              $value
	 * @param array<int,array<string,mixed>>    $fonts
	 * @return array<string,mixed>|array<int,array<string,mixed>>
	 */
	private static function merge_font_family_setting( $value, array $fonts ): array {
		if ( ! is_array( $value ) ) {
			return $fonts;
		}
		$is_assoc = ! empty( $value ) && array_keys( $value ) !== range( 0, count( $value ) - 1 );
		if ( $is_assoc ) {
			$value['theme'] = self::merge_font_presets(
				( isset( $value['theme'] ) && is_array( $value['theme'] ) ) ? $value['theme'] : [],
				$fonts
			);
			return $value;
		}
		return self::merge_font_presets( $value, $fonts );
	}

	/**
	 * @param array<int,array<string,mixed>> $existing
	 * @param array<int,array<string,mixed>> $incoming
	 * @return array<int,array<string,mixed>>
	 */
	private static function merge_font_presets( array $existing, array $incoming ): array {
		$index = [];
		foreach ( $existing as $i => $preset ) {
			if ( is_array( $preset ) && isset( $preset['slug'] ) ) {
				$index[ (string) $preset['slug'] ] = $i;
			}
		}
		foreach ( $incoming as $preset ) {
			if ( ! is_array( $preset ) || ! isset( $preset['slug'] ) ) {
				continue;
			}
			$slug = (string) $preset['slug'];
			if ( isset( $index[ $slug ] ) ) {
				$existing[ $index[ $slug ] ] = $preset;
			} else {
				$existing[]      = $preset;
				$index[ $slug ] = count( $existing ) - 1;
			}
		}
		return array_values( $existing );
	}

	/**
	 * Block editor extensions that only ship on clipisode_screen edit
	 * screens. Currently:
	 *
	 *   - name-submit-labels.js: adds the "Submit button — alternate
	 *     labels" InspectorControls panel for any core/button instance
	 *     with className "clipisode-name-submit". See the file's
	 *     docblock for the storage + rendering pattern.
	 *   - name-progress-controls.js: adds a focused InspectorControls
	 *     panel for the Name screen progress-track preview block so
	 *     authors can set pin position, bar thickness, track colour,
	 *     and fill colour without unlocking nested blocks.
	 *
	 * Hooked from clipisode.php on `enqueue_block_editor_assets`. We
	 * scope by post type because the script registers global filters on
	 * core/button — even though the panel only renders for the marker
	 * class, registering attribute extensions is a write-once-affects-
	 * all operation per editor session and we want it inert outside of
	 * our own post type.
	 */
	public static function enqueue_block_editor_extensions(): void {
		if ( ! is_admin() ) {
			return;
		}
		if ( self::current_screen_post_type() !== 'clipisode_screen' ) {
			return;
		}

		$src  = plugins_url( 'assets/editor/name-submit-labels.js', CLIPISODE_PLUGIN_DIR . 'clipisode.php' );
		$path = CLIPISODE_PLUGIN_DIR . 'assets/editor/name-submit-labels.js';
		// filemtime() so Studio Safari (and any aggressive cache) reliably
		// pulls the latest extension whenever we edit the file.
		$ver  = file_exists( $path ) ? (string) filemtime( $path ) : '0.1.0';

		wp_enqueue_script(
			'clipisode-name-submit-labels',
			$src,
			[
				'wp-hooks',
				'wp-element',
				'wp-block-editor',
				'wp-components',
				'wp-compose',
				// wp-core-data ships useEntityProp; the editor extension binds
				// the alternate-label TextControls to post meta via that hook
				// rather than block attributes (block attributes broke editor
				// validation — see the extension's docblock).
				'wp-core-data',
				// wp-data ships useSelect; needed to resolve the current post
				// type before passing it to useEntityProp.
				'wp-data',
				'wp-i18n',
			],
			$ver,
			true
		);
		$progress_src  = plugins_url( 'assets/editor/name-progress-controls.js', CLIPISODE_PLUGIN_DIR . 'clipisode.php' );
		$progress_path = CLIPISODE_PLUGIN_DIR . 'assets/editor/name-progress-controls.js';
		$progress_ver  = file_exists( $progress_path ) ? (string) filemtime( $progress_path ) : '0.1.0';
		wp_enqueue_script(
			'clipisode-name-progress-controls',
			$progress_src,
			[
				'wp-hooks',
				'wp-element',
				'wp-block-editor',
				'wp-components',
				'wp-compose',
				'wp-data',
				'wp-i18n',
			],
			$progress_ver,
			true
		);

		// Token preview simulator. Swaps {topic_title}/{host_name}/etc. in
		// the editor canvas for sample values from preview-values.json so
		// authors can see realistic-length copy while laying out screens.
		// The currently selected block keeps showing raw tokens (so editing
		// them works normally); every other block shows the swapped preview.
		// Defaults ON; persisted per-browser via localStorage. See
		// assets/editor/preview-values.js.
		$preview_src    = plugins_url( 'assets/editor/preview-values.js', CLIPISODE_PLUGIN_DIR . 'clipisode.php' );
		$preview_path   = CLIPISODE_PLUGIN_DIR . 'assets/editor/preview-values.js';
		$preview_ver    = file_exists( $preview_path ) ? (string) filemtime( $preview_path ) : '0.1.0';
		$preview_values = self::load_theme_preview_values();
		wp_enqueue_script(
			'clipisode-preview-values',
			$preview_src,
			[
				'wp-hooks',
				'wp-element',
				'wp-block-editor',
				'wp-components',
				'wp-compose',
				'wp-data',
				'wp-edit-post',
				'wp-plugins',
				'wp-i18n',
			],
			$preview_ver,
			true
		);
		wp_add_inline_script(
			'clipisode-preview-values',
			'window.clipisodeThemePreviewValues = ' . wp_json_encode( $preview_values ) . ';',
			'before'
		);

		// Screen posts are layout canvases, not blog posts. Hide the post-title
		// UI in the block-editor chrome so authors can see the full mobile
		// viewport without the large title field stealing vertical space.
		wp_add_inline_style(
			'wp-edit-blocks',
			'.post-type-clipisode_screen .editor-post-title,'
			. '.post-type-clipisode_screen .editor-post-title__block,'
			. '.post-type-clipisode_screen .edit-post-visual-editor__post-title-wrapper,'
			. '.post-type-clipisode_screen .block-editor-post-title{display:none !important;}'
		);
	}

	public static function enqueue_screen_editor_canvas_styles(): void {
		if ( ! is_admin() ) {
			return;
		}

		$post_type = self::current_screen_post_type();
		if ( $post_type !== 'clipisode_screen' ) {
			return;
		}
		$post_id = isset( $_GET['post'] ) ? (int) $_GET['post'] : 0;
		$screen_type = $post_id ? (string) get_post_meta( $post_id, self::SCREEN_TYPE_META, true ) : '';
		if ( $post_id > 0 && $screen_type !== '' ) {
			self::ensure_screen_post_title( $post_id, $screen_type );
			$post = get_post( $post_id );
			if ( $post ) {
				self::migrate_legacy_screen_heading_levels( $post_id, $screen_type, (string) $post->post_content );
			}
		}

		// Shared typography/theme assets (font registry + theme.css) used by
		// both guest flow and editor canvas.
		self::enqueue_default_theme_style();

		// Primary signal is the screen_type meta. If that's missing or
		// wrong (older posts created before intro_desktop existed, or
		// posts whose meta got wiped during migration), fall back to
		// inferring from the post slug — the seeder names desktop
		// screens with "intro_desktop" or "intro-desktop" patterns,
		// and titles include "(Desktop)" parenthetical. Without this
		// fallback the canvas defaults to 414px mobile width and the
		// two-column desktop layout collapses into a vertical mess.
		$is_desktop = ( $screen_type === 'intro_desktop' );
		if ( ! $is_desktop && $post_id > 0 ) {
			$post = get_post( $post_id );
			if ( $post ) {
				$slug   = (string) $post->post_name;
				$title  = (string) $post->post_title;
				$haystack = strtolower( $slug . ' ' . $title );
				if (
					strpos( $haystack, 'intro_desktop' ) !== false
					|| strpos( $haystack, 'intro-desktop' ) !== false
					|| strpos( $haystack, '(desktop)' ) !== false
				) {
					$is_desktop = true;
				}
			}
		}
		$max_width = $is_desktop ? '1280px' : '414px';

		// Sample asset URLs used as background images in the editor canvas
		// so authors see realistic placeholders for runtime-only content
		// (Clipisode logo, QR code, intro video) rather than dashed
		// "[ Logo ]" hint boxes. The sample assets ship in
		// assets/editor/sample/ and are never enqueued on the public flow
		// — they exist purely for the WYSIWYG editor preview.
		$sample_logo  = plugins_url( 'assets/editor/sample/clipisode-mark.png',     CLIPISODE_PLUGIN_DIR . 'clipisode.php' );
		$sample_video = plugins_url( 'assets/editor/sample/sample-video-portrait.svg', CLIPISODE_PLUGIN_DIR . 'clipisode.php' );

		// Sample invitation URL used in the desktop URL-slot CSS
		// pseudo-element. Pulled from preview-values.json so the
		// hostname tracks home_url() and the path tracks
		// Clipisode_Invitation::get_prefix() automatically — the
		// value is the same one the in-canvas {invitation_url} token
		// resolves to.
		//
		// Stripped of the http(s):// prefix and trailing slash for
		// compact display in the slot. The leading scheme would
		// double the visual weight of the URL inside the small
		// rounded pill, so we drop it the same way browsers
		// occasionally do in their address bar.
		//
		// TODO: this duplicates the {invitation_url} preview pipeline
		// at the CSS level. The cleaner long-term fix is to render
		// the URL slot's contents as a real block (paragraph or
		// span containing literal {invitation_url}) inside
		// intro_desktop.html, let the preview-values simulator swap
		// the token like every other text token, and drop this
		// pseudo-element entirely. Tracked as part of a future
		// "unify the URL slot with the preview pipeline" cleanup.
		$preview_invitation_url = '';
		$preview_values_for_canvas = self::load_theme_preview_values();
		if ( isset( $preview_values_for_canvas['invitation_url'] ) ) {
			$preview_invitation_url = (string) $preview_values_for_canvas['invitation_url'];
		}
		$preview_invitation_display = preg_replace( '#^https?://#i', '', $preview_invitation_url );
		$preview_invitation_display = is_string( $preview_invitation_display ) ? rtrim( $preview_invitation_display, '/' ) : '';
		// CSS string content: only single quotes and backslashes need
		// escaping. URLs don't contain those, but be defensive.
		$preview_invitation_display_css = str_replace(
			[ '\\', "'" ],
			[ '\\\\', "\\'" ],
			$preview_invitation_display
		);
		// Mobile uses iPhone-shape (~844px portrait stage). Desktop uses a
		// 16:10 laptop short side. min-height (not fixed height) so the canvas
		// can still grow when authored content overflows the phone — the
		// editor user always sees their full block list rather than having
		// some clipped off.
		$min_height = $is_desktop ? '720px' : '844px';

		// !important is unfortunately required because WP's own iframe canvas
		// styles set max-width / margin via CSS variables with high specificity.
		// The grey body background makes the empty space outside the canvas
		// visually distinct from the white "phone" canvas itself.
		$css = "/* clipisode_screen editor canvas constraint */
body.editor-styles-wrapper {
	background-color: #e8e8e8 !important;
	padding: 20px 0 !important;
}
body.editor-styles-wrapper > .is-root-container,
body.editor-styles-wrapper > .wp-block-post-content,
body.editor-styles-wrapper > .block-editor-block-list__layout {
	max-width: {$max_width} !important;
	margin-left: auto !important;
	margin-right: auto !important;
	background-color: #ffffff !important;
	box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 8px 30px rgba(0, 0, 0, 0.08) !important;
	border-radius: 4px !important;
	padding: 24px 16px !important;
	box-sizing: border-box !important;
	min-height: {$min_height} !important;
	position: relative;
}
/* Global text-element baseline. Pins font-size to 16px and font-weight
 * to 400 as the floor so blocks rendered without explicit typography
 * (paragraphs, list items, form labels) match the public flow body
 * style by default. NOT !important on font-size: an author who picks
 * a size in the sidebar gets an inline style attribute on the block
 * with higher specificity than this class-level rule, so the picker
 * choice wins the cascade. The earlier !important version defeated
 * the size picker outright; the workaround was a font-size unset
 * !important rule targeting four of the five has-NN-font-size
 * classes, which had its own bugs (XXL not covered) and was deleted
 * along with the !important here. */
body.editor-styles-wrapper .wp-block p,
body.editor-styles-wrapper .wp-block li,
body.editor-styles-wrapper .wp-block label:not(.wp-block-button__link),
body.editor-styles-wrapper .wp-block input,
body.editor-styles-wrapper .wp-block span {
	font-size: 16px;
	font-weight: 400;
}
body.editor-styles-wrapper .wp-block p strong,
body.editor-styles-wrapper .wp-block p b,
body.editor-styles-wrapper .wp-block li strong,
body.editor-styles-wrapper .wp-block li b,
body.editor-styles-wrapper .wp-block label strong,
body.editor-styles-wrapper .wp-block label b,
body.editor-styles-wrapper .wp-block span strong,
body.editor-styles-wrapper .wp-block span b {
	font-weight: 700;
}
/* Token preview swaps used to be wrapped in
 * <span class=\"clipisode-preview-token\"> by preview-values.js so we
 * could pin font inheritance against the .wp-block span baseline.
 * That approach was abandoned: inserting an element into a RichText
 * subtree desynced Gutenberg's internal model from the DOM and
 * corrupted typing in previewed blocks. The script now does plain-
 * text replacement (no element insertion), so there's no preview
 * span class to style. The text-node baseline rules above already
 * apply correctly to the swapped text since it lives directly inside
 * the heading / paragraph / etc. element. */";

		// Intro screen: paint a faux phone-shape inside the editor canvas so
		// the author can see the rough WYSIWYG of the public flow without
		// us having to ship a custom block. The root .clipisode-intro-root
		// Group already paints the gradient (its own block sidebar drives
		// it); we just stretch it edge-to-edge inside the canvas, push the
		// top and bottom Groups to the corners, and approximate the public
		// flow's typography / button shape.
		//
		// Several `margin: 0 !important` resets target the gap WordPress
		// otherwise leaves between the canvas top edge and the first
		// block (default block spacing + appender area). Without them
		// the gradient starts ~16-24px below the top of the white phone
		// frame and breaks the illusion.
		if ( $screen_type === 'intro' ) {
			$css .= '

/* Make the root Group fill the canvas like it does in the public flow.   */
/* The 24px/16px canvas padding from the rule above is removed so we can  */
/* paint the gradient edge-to-edge, and the various default block-spacing */
/* gaps are zeroed so the gradient is flush with the canvas top.          */
/* margin: 0 auto keeps the canvas horizontally centred inside the body   */
/* (the earlier `margin: 0` killed centering and snapped it to the left). */
body.editor-styles-wrapper > .is-root-container,
body.editor-styles-wrapper > .wp-block-post-content,
body.editor-styles-wrapper > .block-editor-block-list__layout {
	padding: 0 !important;
	margin: 0 auto !important;
	overflow: hidden !important;
}
body.editor-styles-wrapper .block-editor-block-list__layout > *:first-child,
body.editor-styles-wrapper .wp-block-post-content > *:first-child,
body.editor-styles-wrapper .is-root-container > *:first-child {
	margin-top: 0 !important;
}
body.editor-styles-wrapper .block-editor-block-list__layout > *:last-child,
body.editor-styles-wrapper .wp-block-post-content > *:last-child,
body.editor-styles-wrapper .is-root-container > *:last-child {
	margin-bottom: 0 !important;
}
/* Hide the trailing block-list appender (the "+" affordance below the    */
/* last block) that adds ~20px of empty white space at the bottom of the  */
/* canvas. Intro is a fixed structure: authors edit the existing groups,  */
/* they do not add new top-level blocks below them.                       */
body.editor-styles-wrapper .block-editor-block-list-appender,
body.editor-styles-wrapper .block-list-appender,
body.editor-styles-wrapper .block-editor-default-block-appender {
	display: none !important;
}
/* Match the canvas min-height so the gradient fills edge-to-edge with no */
/* trailing white below it. The 844px figure mirrors the iPhone-shape     */
/* canvas constraint set on .is-root-container above.                     */
/*                                                                        */
/* The intro root paints two layers via the box-shadow + background       */
/* stack: the editor-only sample video poster sits BEHIND the author      */
/* gradient (which the root Group still owns via its block sidebar) so    */
/* authors can see how their gradient + scrim choices read against an     */
/* actual video frame. The poster is a darkened SVG hint that always      */
/* says SAMPLE so no one mistakes it for the real topic video.            */
body.editor-styles-wrapper .clipisode-intro-root {
	min-height: 844px;
	margin: 0 !important;
	position: relative;
	color: #ffffff;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
';
			$css .= "body.editor-styles-wrapper .clipisode-intro-root::before {
	content: '';
	position: absolute;
	inset: 0;
	background: url('{$sample_video}') center / cover no-repeat;
	opacity: 0.55;
	z-index: 0;
	pointer-events: none;
}
";
			$css .= '/* Top + bottom Groups already declare z-index: 2 + position: relative
 * below, which puts them above the ::before sample so the gradient
 * scrims paint on top of the sample video as they do on the public
 * flow. */
body.editor-styles-wrapper .clipisode-intro-root .clipisode-intro-top,
body.editor-styles-wrapper .clipisode-intro-root .clipisode-intro-bottom {
	width: 100% !important;
	position: relative;
	z-index: 2;
	margin-top: 0 !important;
	margin-bottom: 0 !important;
	margin-block-start: 0 !important;
	margin-block-end: 0 !important;
}

/* Drop shadow on every text element so authors see the same legibility   */
/* the guest gets when an intro video plays behind the scrims. Scoped to  */
/* descendants of the intro root so it does not leak into chrome / lists. */
body.editor-styles-wrapper .clipisode-intro-root,
body.editor-styles-wrapper .clipisode-intro-root p,
body.editor-styles-wrapper .clipisode-intro-root h1,
body.editor-styles-wrapper .clipisode-intro-root h2,
body.editor-styles-wrapper .clipisode-intro-root a {
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
}

body.editor-styles-wrapper .clipisode-intro-host {
	font-size: 16px;
	font-weight: 400;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: rgba(255, 255, 255, 1);
	margin: 0 0 0.35em 0 !important;
}
/* See clipisode-introd-title for the rationale: heading-class
 * rules deliberately omit font-size/font-weight so the heading-
 * level dropdown drives the visual size. */
body.editor-styles-wrapper .clipisode-intro-title,
body.editor-styles-wrapper .clipisode-intro-title.wp-block-heading {
	color: #ffffff;
	line-height: 1.15 !important;
	margin: 0 !important;
}

/* Record button — compact, ~1/3 width, centred. The Buttons block uses */
/* layout=flex with justify-content:center so the single button row is  */
/* horizontally centred; the button itself gets a min-width hint so it  */
/* lands close to a third of the canvas regardless of label length.     */
body.editor-styles-wrapper .clipisode-intro-bottom .wp-block-buttons {
	display: flex;
	justify-content: center;
	width: 100%;
	margin: 0;
}
body.editor-styles-wrapper .clipisode-intro-bottom .wp-block-button {
	width: auto !important;
	margin: 0 !important;
}
body.editor-styles-wrapper .clipisode-intro-bottom .wp-block-button__link {
	display: inline-block;
	min-width: 33%;
	text-align: center;
	padding: 8px 16px !important;
	border-radius: 8px !important;
	font-weight: 700;
	font-size: 16px;
	box-sizing: border-box;
}
/* Record button — Clipisode blue (#3964b0) with white text, matching   */
/* the legacy invitation page. The block sidebar still lets the author  */
/* override colour/border via core/button controls, but this is the    */
/* default look out of the box.                                         */
body.editor-styles-wrapper .clipisode-intro-record .wp-block-button__link {
	background: #3964b0 !important;
	color: #ffffff !important;
	text-shadow: none;
}

/* Upload sentence is an inline paragraph link (not a button). Match the */
/* size of the terms paragraph so the row reads as supporting copy.     */
/* Both the editor (<a>) and the public flow (<label> after the magic-  */
/* href rewrite) get the same underlined-link treatment.                */
body.editor-styles-wrapper .clipisode-intro-upload,
body.editor-styles-wrapper p.clipisode-intro-upload {
	color: rgba(255, 255, 255, 1);
	font-size: 12px;
	font-weight: 400;
	margin: 8px 0 0 0 !important;
}
body.editor-styles-wrapper .clipisode-intro-upload label[for] {
	color: rgba(138, 181, 242, 1);
	text-decoration: underline !important;
	cursor: pointer;
}
body.editor-styles-wrapper .clipisode-intro-upload a {
	color: rgba(138, 181, 242, 1);
	text-decoration: underline !important;
	cursor: pointer;
}

body.editor-styles-wrapper .clipisode-intro-terms,
body.editor-styles-wrapper p.clipisode-intro-terms {
	color: rgba(255, 255, 255, 1);
	font-size: 12px;
	font-weight: 400;
	margin: 4px 0 0 0 !important;
}
body.editor-styles-wrapper .clipisode-intro-terms a {
	color: rgba(138, 181, 242, 1);
}
';
		}

		// Intro Desktop editor canvas. Light-theme card layout matching
		// the public-flow desktop screen. Authors see the editable
		// pieces (heading / instructions / QR helper) AND realistic
		// SAMPLE visuals in the four empty slot Groups: a real
		// Clipisode mark, a representative QR code, the sample URL
		// text styled like the live one, and the sample video poster
		// in the left column. Authors can size + style every slot via
		// the standard block sidebar; the dynamic content (real URL,
		// real QR for the request URL, topic intro video) gets PHP-
		// injected at request time.
		if ( $is_desktop ) {
			$css .= "

/* Canvas container: sit inside whatever width the editor iframe gives
 * us. Don't force width:100% — the iframe runs in a 'desktop preview'
 * mode that reports a much wider viewport than the visible pane, and
 * setting width:100% there makes the canvas overflow horizontally by
 * thousands of pixels. Leaving width unset lets the container shrink
 * to the visible viewport while max-width:1280px caps it on truly
 * wide displays. */
body.editor-styles-wrapper > .is-root-container,
body.editor-styles-wrapper > .wp-block-post-content,
body.editor-styles-wrapper > .block-editor-block-list__layout {
	padding: 0 !important;
	margin: 0 auto !important;
	background: #f3f4f6 !important;
	max-width: 1280px !important;
}
/* Top-level block wrappers (.wp-block) inherit theme.json's
 * contentSize as max-width (~620px on default themes), squeezing the
 * Root into a narrow column. Override max-width here, but NOT width:
 * an explicit width:100% interacts badly with the desktop-preview
 * iframe's reported viewport. */
body.editor-styles-wrapper .is-root-container > .wp-block,
body.editor-styles-wrapper .wp-block-post-content > .wp-block,
body.editor-styles-wrapper .block-editor-block-list__layout > .wp-block {
	max-width: none !important;
	margin-left: 0 !important;
	margin-right: 0 !important;
}
body.editor-styles-wrapper .block-editor-block-list__layout > *:first-child,
body.editor-styles-wrapper .wp-block-post-content > *:first-child,
body.editor-styles-wrapper .is-root-container > *:first-child {
	margin-top: 0 !important;
}
body.editor-styles-wrapper .block-editor-block-list__layout > *:last-child,
body.editor-styles-wrapper .wp-block-post-content > *:last-child,
body.editor-styles-wrapper .is-root-container > *:last-child {
	margin-bottom: 0 !important;
}
body.editor-styles-wrapper .block-editor-block-list-appender,
body.editor-styles-wrapper .block-list-appender,
body.editor-styles-wrapper .block-editor-default-block-appender {
	display: none !important;
}
/* Root: stretch to the canvas's available width without forcing
 * width:100% (which interacts badly with the desktop-preview iframe).
 * The parent .wp-block already has max-width:none from above, so the
 * Root will naturally fill the canvas up to the canvas's own
 * max-width:1280px cap. */
/* Card height drives everything else. The left column is a 9:16
 * portrait video fixed to the card's inner height; the right column
 * is forced to the same width as the left so the two halves of the
 * card are visually balanced. The card's overall width is therefore
 * (left.width + right.width + gap + padding), which collapses to
 * roughly 2 * (height * 9/16) + chrome.
 *
 * The card height tracks the editor viewport (90vh) but is capped so
 * the layout stops growing on huge displays. */
body.editor-styles-wrapper .clipisode-introd-root {
	max-width: none !important;
	margin: 0 !important;
	background: #f3f4f6;
	color: #111827;
	padding: 24px !important;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}
body.editor-styles-wrapper .clipisode-introd-card {
	width: auto !important;
	max-width: none !important;
	height: min(90vh, 800px) !important;
	margin: 0 auto !important;
	background: #ffffff;
	border-radius: 18px;
	box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
	display: flex !important;
	flex-direction: row !important;
	align-items: stretch !important;
	flex-wrap: nowrap !important;
	gap: 24px !important;
	padding: 24px !important;
	box-sizing: border-box;
}
/* Left column: 9:16 portrait, full card-content height. Width is
 * implied by aspect-ratio, so the left column auto-sizes to
 * (card.innerHeight * 9 / 16). */
body.editor-styles-wrapper .clipisode-introd-left {
	flex: 0 0 auto;
	height: 100% !important;
	aspect-ratio: 9 / 16;
	width: auto;
	background: #111827 url('{$sample_video}') center / cover no-repeat;
	border-radius: 12px;
	position: relative;
	overflow: hidden;
}
/* Right column: matches the left column's width by sharing its
 * aspect-ratio + 100% height, so the card's two halves are
 * dimensionally balanced regardless of viewport size. Content inside
 * is centered both axes so the logo / title / QR don't drift around
 * as the height changes. */
body.editor-styles-wrapper .clipisode-introd-right {
	flex: 0 0 auto;
	height: 100% !important;
	aspect-ratio: 9 / 16;
	width: auto;
	min-width: 0;
	display: flex !important;
	flex-direction: column !important;
	align-items: center !important;
	justify-content: center !important;
	text-align: center;
	gap: 12px !important;
	padding: 24px !important;
	box-sizing: border-box;
}
/* Logo: real core/image block in the markup with icon.png as the
 * default. No background-image, no fixed width — the image carries
 * its own height (64px) inline and width auto, so the rendered
 * preview matches what guests see. Authors can replace the image
 * via the block toolbar's Replace button. */
body.editor-styles-wrapper .clipisode-introd-logo {
	margin: 0 !important;
}
body.editor-styles-wrapper .clipisode-introd-logo img {
	display: block;
}
/* URL slot: render the sample URL string in the same monospace +
 * underline treatment the public flow uses for the live URL. The
 * displayed URL is sourced from preview-values.json's resolved
 * {invitation_url} token (so the hostname is whatever home_url()
 * returns and the path is whatever the configured invitation
 * prefix is) and stripped of its http(s):// scheme + trailing slash
 * for compact display inside the rounded pill. */
body.editor-styles-wrapper .clipisode-introd-url-slot {
	margin: 0 !important;
	padding: 8px 12px !important;
	background: rgba(15, 23, 42, 0.04) !important;
	border-radius: 8px !important;
	color: rgba(138, 181, 242, 1);
	font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
	font-size: 16px;
	min-height: 32px;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
}
body.editor-styles-wrapper .clipisode-introd-url-slot::before {
	content: '{$preview_invitation_display_css}';
	text-decoration: underline;
}
/* QR placeholder: a real core/image block in the markup so authors
 * can resize, pad, border, and reorder it via standard image
 * controls. The seeded image points at sample-qr.png imported on
 * activation; the public renderer replaces the figure with the
 * live QR canvas mount at request time. We DO NOT pin width /
 * height on the figure here — Gutenberg's image-block resize
 * handle stores the chosen width as inline style on the <img>,
 * and forcing dimensions through this rule would defeat the
 * resize control. We only zero the figure margin for visual
 * consistency with the rest of the right column. */
body.editor-styles-wrapper figure.clipisode-introd-qr-image {
	margin: 0 !important;
}
/* Editable text inside the card. We deliberately do NOT pin
 * font-size or font-weight on the title here. The heading-level
 * dropdown (H1 / H2 / H3 …) needs to visibly change the title's
 * size, and a class-level font-size rule beats the heading tag's
 * own size (class specificity is higher than element specificity).
 * Letting the active site theme's h1/h2/h3 rules win means the
 * dropdown actually controls the size, and the size picker (S /
 * M / L / XL / XXL) still works because inline style beats class.
 * Color, line-height, margin, and alignment are NOT
 * level-sensitive, so they stay pinned. */
body.editor-styles-wrapper .clipisode-introd-title,
body.editor-styles-wrapper .clipisode-introd-title.wp-block-heading {
	color: #111827 !important;
	line-height: 1.25 !important;
	margin: 0 !important;
	text-align: center !important;
}
body.editor-styles-wrapper .clipisode-introd-instructions {
	color: #4b5563 !important;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.5 !important;
	margin: 0 !important;
	text-align: center !important;
	max-width: 360px;
}
body.editor-styles-wrapper .clipisode-introd-instructions strong {
	color: #111827 !important;
}
body.editor-styles-wrapper .clipisode-introd-qr-helper {
	color: #4b5563 !important;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.4 !important;
	margin: 0 !important;
	text-align: center !important;
	max-width: 320px;
}
";
		}

		// Name-screen editor canvas. Uses real, locked preview blocks for
		// file info/progress/input/error instead of pseudo-element boxes so
		// selection outlines behave naturally in Gutenberg and the canvas
		// stays close to the live guest layout.
		if ( $screen_type === 'name' ) {
			$css .= '

body.editor-styles-wrapper > .is-root-container,
body.editor-styles-wrapper > .wp-block-post-content,
body.editor-styles-wrapper > .block-editor-block-list__layout {
	padding: 24px var(--clipisode-mobile-gutter) !important;
	margin: 0 auto !important;
	background: #ffffff !important;
	color: #111111;
	position: relative;
}
body.editor-styles-wrapper .clipisode-name-root {
	color: inherit;
	width: min(100%, var(--clipisode-mobile-content-max));
	margin-left: auto !important;
	margin-right: auto !important;
}
body.editor-styles-wrapper .clipisode-name-fileinfo-preview,
body.editor-styles-wrapper .clipisode-name-progress-track-preview,
body.editor-styles-wrapper .clipisode-name-progress-label-preview,
body.editor-styles-wrapper .clipisode-field-label-row-preview,
body.editor-styles-wrapper .clipisode-name-input-preview,
body.editor-styles-wrapper .clipisode-name-handle-input-preview,
body.editor-styles-wrapper .clipisode-name-handle-instructions-preview,
body.editor-styles-wrapper .clipisode-name-submit-wrap,
body.editor-styles-wrapper .clipisode-name-error-preview {
	width: min(100%, var(--clipisode-mobile-content-max));
	margin-left: auto !important;
	margin-right: auto !important;
}
body.editor-styles-wrapper .clipisode-name-heading,
body.editor-styles-wrapper .clipisode-name-heading.wp-block-heading {
	margin: 0 0 8px 0 !important;
}
body.editor-styles-wrapper .clipisode-name-instructions {
	margin: 8px 0 !important;
	line-height: 1.45 !important;
	font-weight: 400;
}
body.editor-styles-wrapper .clipisode-name-handle-instructions-preview {
	margin: 8px 0 !important;
	line-height: 1.45 !important;
	font-weight: 400;
	color: #111111 !important;
}
body.editor-styles-wrapper .clipisode-name-root a:not(.wp-block-button__link) {
	color: rgba(57, 101, 76, 1);
	text-decoration: underline !important;
}
body.editor-styles-wrapper .clipisode-name-fileinfo-preview {
	margin: 16px 0 0 0 !important;
	color: #111111;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.4 !important;
}
body.editor-styles-wrapper .clipisode-field-label-row-preview {
	margin: 8px 0 4px 0 !important;
	display: flex !important;
	align-items: center !important;
	justify-content: space-between !important;
	gap: 8px !important;
}
body.editor-styles-wrapper .clipisode-field-label-preview {
	margin: 0 !important;
	font-size: 16px;
	font-weight: 700;
	line-height: 1.3 !important;
	color: #6b7280 !important;
}
body.editor-styles-wrapper .clipisode-field-label-right-preview {
	margin-left: auto !important;
	text-align: right !important;
}
body.editor-styles-wrapper .clipisode-name-progress-track-preview {
	margin: 10px 0 0 0 !important;
	overflow: hidden;
	position: relative;
}
body.editor-styles-wrapper .clipisode-name-progress-track-preview.clipisode-pin-top {
	position: absolute !important;
	top: 0;
	left: 0;
	right: 0;
	width: 100% !important;
	max-width: none !important;
	margin: 0 !important;
	z-index: 20;
	border-radius: 0 !important;
	box-sizing: border-box;
}
body.editor-styles-wrapper .clipisode-name-progress-track-preview.clipisode-pin-bottom {
	position: absolute !important;
	bottom: 0;
	left: 0;
	right: 0;
	width: 100% !important;
	max-width: none !important;
	margin: 0 !important;
	z-index: 20;
	border-radius: 0 !important;
	box-sizing: border-box;
}
body.editor-styles-wrapper .clipisode-name-progress-fill-preview {
	margin: 0 !important;
	width: 35%;
	height: 100%;
	min-height: inherit;
	border-radius: inherit;
	pointer-events: none;
}
body.editor-styles-wrapper .clipisode-name-progress-track-preview.clipisode-pin-top .clipisode-name-progress-fill-preview,
body.editor-styles-wrapper .clipisode-name-progress-track-preview.clipisode-pin-bottom .clipisode-name-progress-fill-preview {
	border-radius: 999px !important;
}
body.editor-styles-wrapper .clipisode-name-progress-label-preview {
	margin: 0 !important;
	color: #111111;
	font-size: 16px;
	font-weight: 400;
	letter-spacing: 0.02em;
}
body.editor-styles-wrapper .clipisode-name-input-preview {
	margin: 6px 0 0 0 !important;
	padding: 14px 16px;
	background: #ffffff;
	border: 1px solid rgba(17, 17, 17, 0.18);
	border-radius: 8px;
	color: #111111;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.2;
}
body.editor-styles-wrapper .clipisode-name-handle-input-preview {
	margin: 6px 0 0 0 !important;
	padding: 14px 16px;
	background: #ffffff;
	border: 1px solid rgba(17, 17, 17, 0.18);
	border-radius: 8px;
	color: #111111;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.2;
}
body.editor-styles-wrapper .clipisode-social-only-preview {
	position: relative;
}
body.editor-styles-wrapper .clipisode-social-only-preview:hover::after,
body.editor-styles-wrapper .clipisode-social-only-preview:focus-within::after {
	content: "Appears only in social app contexts (Instagram, X, etc.).";
	position: absolute;
	left: 0;
	bottom: calc(100% + 6px);
	max-width: min(260px, 92vw);
	padding: 6px 8px;
	border-radius: 6px;
	background: rgba(17, 24, 39, 0.94);
	color: #ffffff;
	font-size: 12px;
	font-weight: 600;
	line-height: 1.3;
	pointer-events: none;
	white-space: normal;
	z-index: 30;
	box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}
body.editor-styles-wrapper .clipisode-name-error-preview {
	margin: 8px 0 !important;
	color:rgb(204, 0, 0);
	font-size: 16px;
	font-weight: 400;
	line-height: 1.35 !important;
}
body.editor-styles-wrapper .clipisode-name-submit-wrap {
	margin-top: 16px !important;
}
body.editor-styles-wrapper .clipisode-name-submit .wp-block-button__link {
	background: #3964b0;
	color: #ffffff;
	border-radius: 8px;
	padding: 14px 16px;
	font-size: 17px;
	font-weight: 700;
	text-align: center;
	display: block;
	width: 100%;
	box-sizing: border-box;
}
';
		}

		// Email-screen editor canvas. Like Name, this uses real preview
		// blocks (email input + opt-ins) rather than pseudo-element art so
		// block hover/selection does not produce floating artifacts.
		if ( $screen_type === 'email' ) {
			$css .= '

body.editor-styles-wrapper > .is-root-container,
body.editor-styles-wrapper > .wp-block-post-content,
body.editor-styles-wrapper > .block-editor-block-list__layout {
	padding: 20px var(--clipisode-mobile-gutter) !important;
	margin: 0 auto !important;
	/* Email is an overlay modal over Name. Use a 10% black dimmer over
	 * white so the canvas communicates "overlay over another screen". */
	background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), #ffffff !important;
	color: #111111;
}
body.editor-styles-wrapper .clipisode-email-root {
	color: inherit;
	min-height: 0;
	margin: 96px auto 0 !important;
	width: min(100%, var(--clipisode-mobile-content-max));
	display: flex;
	flex-direction: column;
	border-radius: 14px;
	border: 1px solid rgba(17, 17, 17, 0.14);
	box-shadow: 0 16px 44px rgba(0, 0, 0, 0.35);
	overflow: hidden;
}
body.editor-styles-wrapper .clipisode-email-root:not(.has-background) {
	background: #ffffff !important;
	color: #111111;
}
body.editor-styles-wrapper .clipisode-email-heading,
body.editor-styles-wrapper .clipisode-email-heading.wp-block-heading {
	margin: 0 0 4px 0 !important;
	line-height: 1.2 !important;
}
body.editor-styles-wrapper .clipisode-email-instructions {
	margin: 8px 0 !important;
	font-size: 16px;
	line-height: 1.45;
	font-weight: 400;
}
body.editor-styles-wrapper .clipisode-email-root .clipisode-field-label-row-preview {
	margin: 8px 0 4px 0 !important;
	display: flex !important;
	align-items: center !important;
	justify-content: space-between !important;
	gap: 8px !important;
	width: 100%;
}
body.editor-styles-wrapper .clipisode-email-root .clipisode-field-label-preview {
	margin: 0 !important;
	font-size: 16px;
	font-weight: 700;
	line-height: 1.3 !important;
	color: #6b7280 !important;
}
body.editor-styles-wrapper .clipisode-email-root .clipisode-field-label-right-preview {
	margin-left: auto !important;
	text-align: right !important;
}
body.editor-styles-wrapper .clipisode-email-input-preview {
	margin: 6px 0 0 0 !important;
	padding: 14px 16px;
	background: #ffffff;
	border: 1px solid rgba(17, 17, 17, 0.18);
	border-radius: 8px;
	color: #111111;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.2;
}
body.editor-styles-wrapper .clipisode-email-optin-preview {
	margin: 6px 0 0 0 !important;
	color: #111111;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.3 !important;
}
body.editor-styles-wrapper .clipisode-email-submit-wrap {
	margin-top: 12px !important;
}
body.editor-styles-wrapper .clipisode-email-submit .wp-block-button__link {
	background: #3964b0;
	color: #ffffff;
	border-radius: 8px;
	padding: 14px 16px;
	font-size: 17px;
	font-weight: 700;
	text-align: center;
	display: block;
	width: 100%;
	box-sizing: border-box;
}
body.editor-styles-wrapper .clipisode-email-skip,
body.editor-styles-wrapper p.clipisode-email-skip {
	color: #111111;
	font-size: 16px;
	font-weight: 400;
	margin: 12px 0 0 0 !important;
	text-align: center !important;
}
body.editor-styles-wrapper .clipisode-email-skip a,
body.editor-styles-wrapper .clipisode-email-root a:not(.wp-block-button__link) {
	color: rgba(138, 181, 242, 1);
	text-decoration: underline !important;
}
';
		}

		// Success-screen editor canvas: light baseline with centered
		// mark + heading + message + action button row. The screen is
		// rooted in a core/cover block so authors can pick a stretched-
		// to-cover background image (or solid colour, or gradient) from
		// the standard sidebar without us shipping a custom block.
		//
		// Cover wraps children in .wp-block-cover__inner-container, so
		// the flex-centering layout that used to sit on the root must
		// move one level deeper. The root keeps min-height + width
		// constraints so the canvas mimics the public flow's mobile
		// content frame; the inner container does the column-center
		// stack of mark / heading / message / buttons.
		if ( $screen_type === 'success' ) {
			$css .= "

body.editor-styles-wrapper > .is-root-container,
body.editor-styles-wrapper > .wp-block-post-content,
body.editor-styles-wrapper > .block-editor-block-list__layout {
	padding: 8px var(--clipisode-mobile-gutter) !important;
	margin: 0 auto !important;
	background: #ffffff !important;
	color: #111111;
}
body.editor-styles-wrapper .clipisode-success-root {
	color: inherit;
	min-height: 780px;
	width: min(100%, var(--clipisode-mobile-content-max));
	margin-left: auto !important;
	margin-right: auto !important;
}
/* Cover defaults to 1.5em padding on the inner container; we zero
 * it so authors get the same gutter the rest of the screens have.
 * The flex column layout then centres mark / heading / message /
 * buttons exactly as it did when the root was a plain Group. */
body.editor-styles-wrapper .clipisode-success-root .wp-block-cover__inner-container {
	padding: 0 !important;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px !important;
	text-align: center;
	min-height: inherit;
	width: 100%;
}

/* Success mark slot: real Clipisode mark painted as a background.
 * 96px lands as a confident hero glyph without competing with the
 * heading; authors can resize via the slot Group Dimensions
 * sidebar. The slot is locked from being moved (lock.move:true) but
 * is now author-removable (lock.remove:false) so a host running a
 * sponsor ad can strip it out and leave a Cover/Group background
 * on the success screen. The slot carries a 0-height locked
 * core/spacer (clipisode-success-slot-filler) so the Gutenberg
 * pick-a-layout UI does not fire for what looks like an empty
 * Group; the public renderer strips the spacer div before render
 * (see clipisode-flow.php slot-filler strip). */
body.editor-styles-wrapper .clipisode-success-mark-slot {
	margin: 0 0 8px 0 !important;
	padding: 0 !important;
	background: url('{$sample_logo}') center / contain no-repeat !important;
	width: 96px;
	height: 96px;
	align-self: center;
}

body.editor-styles-wrapper .clipisode-success-heading,
body.editor-styles-wrapper .clipisode-success-heading.wp-block-heading {
	line-height: 1.15 !important;
	margin: 0 !important;
	text-align: center !important;
}
body.editor-styles-wrapper .clipisode-success-message {
	color: #111111;
	font-size: 16px;
	line-height: 1.45 !important;
	margin: 0 !important;
	text-align: center !important;
	max-width: 320px;
}
body.editor-styles-wrapper .clipisode-success-root a:not(.wp-block-button__link) {
	color: rgba(138, 181, 242, 1);
	text-decoration: underline !important;
}
body.editor-styles-wrapper .clipisode-success-actions {
	margin-top: 16px !important;
	width: 100%;
}
body.editor-styles-wrapper .clipisode-success-action .wp-block-button__link {
	background: #3964b0;
	color: #ffffff;
	border-radius: 8px !important;
	padding: 14px 16px !important;
	font-size: 17px;
	font-weight: 700;
	text-align: center !important;
	display: block !important;
	min-width: 240px;
	box-sizing: border-box !important;
}
";
		}

		// Closed/warning editor canvas: keep all text fully opaque and
		// normalize action buttons to the same blue used by Intro Record.
		if ( in_array( $screen_type, [ 'closed', 'warning_camera', 'warning_network', 'warning_silent', 'warning_wide' ], true ) ) {
			$css .= '

body.editor-styles-wrapper > .is-root-container,
body.editor-styles-wrapper > .wp-block-post-content,
body.editor-styles-wrapper > .block-editor-block-list__layout {
	padding: 8px var(--clipisode-mobile-gutter) !important;
	margin: 0 auto !important;
	background: #ffffff !important;
	color: #111111;
}
body.editor-styles-wrapper .clipisode-closed-root,
body.editor-styles-wrapper .clipisode-warning-root {
	color: #111111;
}
body.editor-styles-wrapper .clipisode-warning-message,
body.editor-styles-wrapper .clipisode-closed-message {
	color: #111111;
	margin: 8px 0 !important;
}
body.editor-styles-wrapper .clipisode-warning-root p,
body.editor-styles-wrapper .clipisode-closed-root p {
	margin-top: 8px !important;
	margin-bottom: 8px !important;
}
body.editor-styles-wrapper .clipisode-warning-root a:not(.wp-block-button__link),
body.editor-styles-wrapper .clipisode-closed-root a:not(.wp-block-button__link) {
	color: rgba(138, 181, 242, 1);
	text-decoration: underline !important;
}
body.editor-styles-wrapper .clipisode-warning-root .wp-block-buttons,
body.editor-styles-wrapper .clipisode-closed-root .wp-block-buttons {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 10px;
	width: min(100%, var(--clipisode-mobile-content-max));
	margin-left: auto !important;
	margin-right: auto !important;
}
body.editor-styles-wrapper .clipisode-warning-root .wp-block-button,
body.editor-styles-wrapper .clipisode-closed-root .wp-block-button {
	width: 100%;
	margin: 0 !important;
}
body.editor-styles-wrapper .clipisode-warning-root .wp-block-button__link,
body.editor-styles-wrapper .clipisode-closed-root .wp-block-button__link {
	display: block !important;
	width: 100% !important;
	padding: 14px 16px !important;
	border: 0 !important;
	border-radius: 8px !important;
	background: #3964b0 !important;
	color: #ffffff !important;
	font-size: 17px;
	font-weight: 700;
	line-height: 1.3 !important;
	text-align: center !important;
	box-sizing: border-box !important;
}
';
		}

		wp_add_inline_style( 'wp-block-library', $css );
	}

	/**
	 * Recovery hook for `intro` screen posts whose content drifted from the
	 * current default-theme template in ways the block editor handles
	 * poorly. Two cases are healed today:
	 *
	 *   1. Legacy Cover + Custom-HTML serialisation, which the editor
	 *      rejected as "unexpected or invalid content" — we replace it
	 *      with the fresh Group-based template.
	 *   2. A leading Classic / freeform block produced when an earlier
	 *      version of intro.html shipped with a top-of-file <!-- ... -->
	 *      doc comment. WordPress parses anything before the first
	 *      <!-- wp:* --> as a Classic block, and it shows up as a stray
	 *      "Classic" entry at the top of the List View. We detect the
	 *      shape by looking for non-block leading content and rewrite.
	 *
	 * Safe to keep around indefinitely — once a screen has been re-saved
	 * by the editor (or auto-rewritten here once), the markers are gone
	 * and subsequent calls short-circuit. Idempotent.
	 *
	 * Returns the (possibly updated) post content so callers can use the
	 * value without an extra DB read.
	 */
	public static function migrate_legacy_intro_post( int $post_id, string $current_content ): string {
		$is_legacy = (
			str_contains( $current_content, 'wp:cover' )
			&& str_contains( $current_content, 'clipisode-intro-cover' )
		);

		// Leading non-wp HTML comment ⇒ Classic block in List View.
		if ( ! $is_legacy ) {
			$trimmed = ltrim( $current_content );
			if ( $trimmed !== '' && preg_match( '/^<!--(?!\s*\/?wp:)/', $trimmed ) ) {
				$is_legacy = true;
			}
		}

		// Catch any other freeform leading content — anything before the
		// first <!-- wp: --> token that isn't whitespace would render as
		// a Classic block. Cheaper than fully parsing the post.
		if ( ! $is_legacy ) {
			$wp_pos = strpos( $current_content, '<!-- wp:' );
			if ( $wp_pos === false ) {
				$is_legacy = false; // Nothing to migrate; skip.
			} elseif ( trim( substr( $current_content, 0, $wp_pos ) ) !== '' ) {
				$is_legacy = true;
			}
		}

		if ( ! $is_legacy ) {
			return $current_content;
		}

		$fresh = self::default_screen_content( 'intro' );
		if ( $fresh === '' || $fresh === $current_content ) {
			return $current_content;
		}

		$updated = wp_update_post( [
			'ID'           => $post_id,
			'post_content' => $fresh,
		], true );
		if ( is_wp_error( $updated ) ) {
			return $current_content;
		}
		return $fresh;
	}

	private static function screen_title( string $screen_type ): string {
		$titles = [
			'intro'           => 'Intro',
			'intro_desktop'   => 'Intro (Desktop)',
			'name'            => 'Name',
			'email'           => 'Email',
			'success'         => 'Success',
			'closed'          => 'Closed',
			'warning_camera'  => 'Warning: Camera',
			'warning_network' => 'Warning: Network',
			'warning_silent'  => 'Warning: Silent',
			'warning_wide'    => 'Warning: Wide',
		];
		return $titles[ $screen_type ] ?? ucfirst( str_replace( '_', ' ', $screen_type ) );
	}

	public static function get_default_preview_id(): ?int {
		$posts = get_posts( [
			'post_type'   => 'clipisode_preview',
			'post_status' => 'publish',
			'numberposts' => 1,
			'meta_key'    => self::DEFAULT_PREVIEW_META,
			'meta_value'  => '1',
		] );

		return $posts ? (int) $posts[0]->ID : null;
	}

	public static function ensure_default_preview(): int {
		$content = <<<'BLOCKS'
<!-- wp:clipisode/preview-flow -->
<!-- wp:clipisode/preview-element {"type":"player","lock":{"remove":true}} /-->
<!-- wp:clipisode/preview-element {"type":"name","lock":{"remove":true}} /-->
<!-- wp:clipisode/preview-element {"type":"topic-info","lock":{"remove":true}} /-->
<!-- wp:clipisode/preview-element {"type":"cta","lock":{"remove":true}} /-->
<!-- /wp:clipisode/preview-flow -->
BLOCKS;

		$existing = self::get_default_preview_id();
		if ( $existing ) {
			$post = get_post( $existing );
			if ( $post && str_contains( $post->post_content, 'wp:clipisode/preview-flow' ) ) {
				return $existing;
			}
			wp_update_post( [
				'ID'           => $existing,
				'post_content' => $content,
			] );
			return $existing;
		}

		$post_id = wp_insert_post( [
			'post_type'    => 'clipisode_preview',
			'post_title'   => 'Default',
			'post_content' => $content,
			'post_status'  => 'publish',
		] );

		update_post_meta( $post_id, self::DEFAULT_PREVIEW_META, '1' );

		return $post_id;
	}

	public static function ensure_brand_terms(): int {
		$existing = self::get_brand_terms_id();
		if ( $existing ) {
			return $existing;
		}

		$template_path = CLIPISODE_PLUGIN_DIR . 'assets/templates/default-brand-terms.html';
		$content       = file_exists( $template_path )
			? file_get_contents( $template_path )
			: '<p>By submitting a video you grant the brand a perpetual, worldwide license to use your submission.</p>';

		$brand_name = get_bloginfo( 'name' ) ?: 'the Company';
		$content    = str_replace( '{{BRAND}}', esc_html( $brand_name ), $content );

		$post_id = wp_insert_post( [
			'post_type'    => 'clipisode_terms',
			'post_title'   => 'Brand Terms',
			'post_content' => $content,
			'post_status'  => 'publish',
		] );

		update_post_meta( $post_id, self::TERMS_TYPE_META, 'brand' );

		return $post_id;
	}
}
