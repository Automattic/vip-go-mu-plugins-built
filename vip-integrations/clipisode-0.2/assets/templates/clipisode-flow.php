<?php
/**
 * Template for /clipisode-flow/{slug} — guest-facing invitation flow rendered
 * from the clipisode_screen CPT.
 *
 * This is the parallel "v2" pipeline being built alongside the legacy
 * /invitation/{slug} flow. The legacy URL keeps working unchanged while this
 * one is under construction; once IAPI screen transitions and upload survival
 * are wired up here we'll repoint /invitation/{slug} at this template.
 *
 * Step 9 wiring summary
 *   Saved screen content uses only plain core blocks (Group/Heading/Paragraph
 *   /Button) so the editor never throws "unexpected or invalid content".
 *   Three pieces of dynamic infrastructure live here, OUTSIDE the screen
 *   block content, so authors never have to deal with them:
 *
 *     • Hidden <input type="file"> elements (record + upload) — clicked
 *       imperatively by IAPI actions when the user taps Record / Upload.
 *     • Intro <video> overlay + tap-to-play SVG — only present when the
 *       topic has an intro_media_id, only mounted on the intro screen.
 *     • Terms modal — fullscreen white sheet with an X close, content
 *       sourced from the topic's brand_terms / custom_terms posts.
 *
 *   The render_block filter handles per-block IAPI directive injection
 *   (magic hrefs, scrim dim, goto buttons, host/topic placeholders).
 */

defined( 'ABSPATH' ) || exit;

global $wpdb;

$slug = sanitize_text_field( get_query_var( 'clipisode_invite' ) );

$links_table = $wpdb->prefix . 'clipisode_invitation_links';
$link        = $wpdb->get_row( $wpdb->prepare(
	"SELECT * FROM $links_table WHERE slug = %s", $slug
) );

if ( ! $link ) {
	status_header( 404 );
	echo '<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>Invitation not found.</h1></body></html>';
	exit;
}

if ( $link->status !== 'open' ) {
	// Stub closed-state response. Once the "closed" screen post has real
	// content (and optionally a redirect_url), this branch will render it
	// through the same do_blocks() path the open flow uses.
	echo '<!DOCTYPE html><html><head><title>Closed</title></head><body><h1>This invitation is no longer accepting replies.</h1></body></html>';
	exit;
}

$topics_table = $wpdb->prefix . 'clipisode_topics';
$topic        = $wpdb->get_row( $wpdb->prepare(
	"SELECT * FROM $topics_table WHERE id = %d", $link->topic_id
) );

if ( ! $topic || ! $topic->invitation_id ) {
	status_header( 404 );
	echo '<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>Topic not found.</h1></body></html>';
	exit;
}

$theme_id = (int) $topic->invitation_id;

// Social-app context for optional handle collection on the Name screen.
// Priority:
//   1) explicit ?network=x|twitter|instagram|ig query override
//   2) in-app browser UA sniff (Instagram/Twitter)
$social_network = '';
$network_param  = isset( $_GET['network'] )
	? sanitize_key( wp_unslash( (string) $_GET['network'] ) )
	: '';
if ( in_array( $network_param, [ 'instagram', 'ig' ], true ) ) {
	$social_network = 'instagram';
} elseif ( in_array( $network_param, [ 'x', 'twitter' ], true ) ) {
	$social_network = 'x';
}
if ( $social_network === '' ) {
	$user_agent = isset( $_SERVER['HTTP_USER_AGENT'] )
		? (string) wp_unslash( $_SERVER['HTTP_USER_AGENT'] )
		: '';
	if ( stripos( $user_agent, 'Instagram' ) !== false ) {
		$social_network = 'instagram';
	} elseif ( stripos( $user_agent, 'Twitter' ) !== false ) {
		$social_network = 'x';
	}
}
$social_network_label = $social_network === 'x'
	? 'X'
	: ( $social_network === 'instagram' ? 'Instagram' : '' );

// Topic intro video (clipisode_topics.intro_media_id → clipisode_media URL).
// When empty, the Intro screen keeps the editable gradient on the root Group.
$intro_video_url = '';
if ( ! empty( $topic->intro_media_id ) ) {
	$resolved = Clipisode_Media::get_url( (int) $topic->intro_media_id );
	if ( is_string( $resolved ) && $resolved !== '' ) {
		$intro_video_url = $resolved;
	}
}
Clipisode_Post_Types::set_flow_intro_video_url( $intro_video_url );

// Topic substitution context for placeholders inside block content.
// Tokens currently supported out of the box:
//   {host_name}       topic host display name
//   {topic_title}     topic title
//   {invitation_slug} public invitation code
//   {invitation_url}  full current invitation URL
//   {theme_asset_url} plugin URL prefix for default theme assets
//   {network}         social-app label (X or Instagram) when applicable
//                     (e.g. "{theme_asset_url}/images/logo.png")
//
// Looked up once per request and threaded through the render_block filter.
$invitation_url = home_url( trailingslashit( Clipisode_Invitation::get_prefix() . '/' . $slug ) );
$social_images = Clipisode_Invitation::get_social_images( $link, $topic );
$social_image_variants = $social_images['variants'] ?? [];
$ordered_social_images = Clipisode_Social_Meta::ordered_images(
	$social_image_variants,
	Clipisode_Social_Meta::request_user_agent()
);
$social_image = $social_image_variants['wide'] ?? ( $ordered_social_images[0] ?? null );
$social_image_url = $social_image['url'] ?? '';
$twitter_image = $social_image_variants['wide'] ?? $social_image;
$invitation_share_url = Clipisode_Invitation::get_share_url(
	$slug,
	(int) ( $social_images['id'] ?? 0 )
);
$social_description = Clipisode_Invitation::get_social_description( $topic );
Clipisode_Social_Meta::send_crawler_headers();
$theme_asset_url = plugins_url(
	'assets/themes/default',
	CLIPISODE_PLUGIN_DIR . 'clipisode.php'
);
Clipisode_Post_Types::set_flow_topic_context( [
	'host_name'       => (string) ( $topic->hosted_by ?? '' ),
	'topic_title'     => (string) ( $topic->title ?? '' ),
	'invitation_slug' => (string) $slug,
	'invitation_url'  => (string) $invitation_url,
	'network'         => (string) $social_network_label,
	'theme_asset_url' => (string) $theme_asset_url,
] );

// Terms modal content. Authors edit the terms inside wp-admin → Terms
// (clipisode_terms CPT) and link them to the topic via brand_terms_id /
// custom_terms_id. We render brand first, then custom (if both set), so
// the brand's mandatory legal copy is always above the topic-specific
// addendum. post_content is run through `the_content` filters so blocks
// inside the terms post still render (paragraphs, lists, etc.).
$terms_html_parts = [];
foreach ( [ 'brand_terms_id', 'custom_terms_id' ] as $field ) {
	$tid = isset( $topic->$field ) ? (int) $topic->$field : 0;
	if ( $tid <= 0 ) {
		continue;
	}
	$tp = get_post( $tid );
	if ( ! $tp || $tp->post_status !== 'publish' ) {
		continue;
	}
	$body = apply_filters( 'the_content', $tp->post_content );
	if ( is_string( $body ) && $body !== '' ) {
		$terms_html_parts[] = '<section class="clipisode-terms-section">'
			. '<h2 class="clipisode-terms-heading">' . esc_html( $tp->post_title ) . '</h2>'
			. $body
			. '</section>';
	}
}
$terms_html = implode( '', $terms_html_parts );
if ( $terms_html === '' ) {
	// Render a fallback so tapping the Terms link still produces a modal
	// (with a close X) when the topic has no terms posts attached. Better
	// UX than a "dead" link that swallows the tap with no response.
	$terms_html = '<section class="clipisode-terms-section">'
		. '<h2 class="clipisode-terms-heading">' . esc_html__( 'Terms', 'clipisode' ) . '</h2>'
		. '<p>' . esc_html__( 'No terms have been configured for this topic yet.', 'clipisode' ) . '</p>'
		. '</section>';
}

// Screen selection. ?screen=<type> lets us preview any screen directly;
// the default is "intro" on mobile and "intro_desktop" on desktop.
//
// SCREEN_TYPES are stored as underscored identifiers (e.g. "warning_silent")
// because that's the canonical form used as meta values on screen posts. URLs
// however are conventionally hyphenated, so we accept both hyphens and
// underscores in the query param and normalize to the underscore form before
// matching.
$raw_screen   = isset( $_GET['screen'] ) ? sanitize_key( wp_unslash( $_GET['screen'] ) ) : '';
$screen_param = str_replace( '-', '_', $raw_screen );
$screen_type  = $screen_param;

// Desktop detection. When the guest hits /clipisode-flow/<slug> on a
// non-touch device with no explicit ?screen=… we serve the Intro
// Desktop variant (video preview + QR code → "open this on your phone")
// instead of the mobile Intro. ?screen=… always wins so we can still
// phone-preview the desktop layout from a real phone. wp_is_mobile()
// is server-side UA sniffing, which is good enough for a "first paint
// goes to the right layout" call; client-side checks would race the
// initial render and cause a flash.
if ( $screen_type === '' ) {
	$screen_type = ( ! wp_is_mobile() ) ? 'intro_desktop' : 'intro';
}
if ( ! in_array( $screen_type, Clipisode_Post_Types::SCREEN_TYPES, true ) ) {
	$screen_type = 'intro';
}

// Auto-upgrade themes for any missing screen post. ensure_screen() is
// idempotent — it returns the existing post id when one is found and
// only inserts a new placeholder (sourced from
// assets/themes/default/{type}.html) when the post is genuinely absent.
//
// We loop over every entry in SCREEN_TYPES instead of gating on intro
// because:
//   - When we add a NEW screen type to the codebase (e.g. intro_desktop,
//     email) existing themes need their screen post seeded on next visit
//     without the host having to re-clone the theme.
//   - When a host trashes a single screen post from wp-admin, the next
//     public visit re-creates it from the latest .html template. This is
//     the documented "reset to defaults" recovery path: trash the post,
//     reload the URL.
foreach ( Clipisode_Post_Types::SCREEN_TYPES as $st_to_seed ) {
	Clipisode_Post_Types::ensure_screen( $theme_id, $st_to_seed );
}

// Collect all 10 screens up-front. We render every screen into the IAPI
// region so client-side transitions are instant (no fetch, no reload).
// Only the screen matching state.screen is visible at any time; the rest
// have the native `hidden` attribute set on the server (so there's no flash
// of all-10-screens before hydration) and IAPI manages visibility from
// there via data-wp-bind--hidden.
$screens     = [];
$screen_ids  = []; // Parallel map: screen_type → post ID. Used below to
                   // read sidebar-authored post meta (e.g. submit-button
                   // alternate labels on the Name screen).
foreach ( Clipisode_Post_Types::SCREEN_TYPES as $st ) {
	$sid = Clipisode_Post_Types::get_screen_post( $theme_id, $st );
	if ( $sid ) {
		$sp = get_post( $sid );
		$content = $sp ? $sp->post_content : '';
		// Heal stale screen content from earlier builds. Each branch is
		// idempotent: once the post is rewritten the marker string is
		// gone and subsequent requests short-circuit.
		if ( $st === 'intro' && $content !== '' ) {
			// Intro: heal Cover + Custom-HTML legacy serialisation.
			$content = Clipisode_Post_Types::migrate_legacy_intro_post( $sid, $content );
		}
		if ( ( $st === 'name' || $st === 'email' ) && $content !== '' ) {
			// Name / Email: the slot-Group approach (empty core/group
			// blocks used as PHP injection targets) was abandoned because
			// empty groups trigger the Gutenberg variation picker. Any
			// content containing those slot class names is stale; reset
			// to the current clean template which has only the author-
			// editable blocks (heading group + submit Buttons).
			$slot_marker = ( $st === 'name' )
				? 'clipisode-name-fileinfo-slot'
				: 'clipisode-email-input-slot';
			if ( str_contains( $content, $slot_marker ) ) {
				$template_path = CLIPISODE_PLUGIN_DIR
					. 'assets/themes/default/' . $st . '.html';
				$fresh = file_exists( $template_path )
					? file_get_contents( $template_path )
					: '';
				if ( $fresh !== '' ) {
					wp_update_post( [
						'ID'           => $sid,
						'post_content' => $fresh,
					] );
					$content = $fresh;
				}
			}
		}
		if ( $content !== '' ) {
			// Closed / warnings: older defaults shipped dark gradients +
			// forced white text. Reset only when we detect those exact
			// legacy markers so host-customized screens are preserved.
			$legacy_gradients = [
				'closed'          => 'linear-gradient(180deg,#1a1a1a 0%,#000000 100%)',
				'warning_camera'  => 'linear-gradient(180deg,#3a1a1a 0%,#000000 100%)',
				'warning_network' => 'linear-gradient(180deg,#3a2a1a 0%,#000000 100%)',
				'warning_silent'  => 'linear-gradient(180deg,#3a1a3a 0%,#000000 100%)',
				'warning_wide'    => 'linear-gradient(180deg,#1a3a3a 0%,#000000 100%)',
			];
			if (
				isset( $legacy_gradients[ $st ] )
				&& str_contains( $content, $legacy_gradients[ $st ] )
				&& str_contains( $content, 'style="color:#ffffff"' )
			) {
				$template_path = CLIPISODE_PLUGIN_DIR
					. 'assets/themes/default/' . $st . '.html';
				$fresh = file_exists( $template_path )
					? file_get_contents( $template_path )
					: '';
				if ( $fresh !== '' ) {
					wp_update_post( [
						'ID'           => $sid,
						'post_content' => $fresh,
					] );
					$content = $fresh;
				}
			}
		}
		$screens[ $st ]    = $content;
		$screen_ids[ $st ] = (int) $sid;
	} else {
		$screens[ $st ]    = '';
		$screen_ids[ $st ] = 0;
	}
}

if ( empty( $screens[ $screen_type ] ) ) {
	status_header( 404 );
	echo '<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>Screen not found for this theme.</h1></body></html>';
	exit;
}

// Track click on the link itself, not on individual screen views, so the
// click count stays comparable with the legacy /invitation/{slug} flow.
$wpdb->query( $wpdb->prepare(
	"UPDATE $links_table SET clicks = clicks + 1 WHERE id = %d", $link->id
) );

// Upload nonce keyed to this slug. Same shape the legacy
// /invitation/{slug} flow used (action == 'clipisode_upload_' . $slug)
// so Clipisode_Invitation::upload_video() and ::submit_reply() validate
// it without changes. We hand it to the IAPI store below; store.js sends
// it in the FormData body of every POST so wp_verify_nonce() succeeds.
$upload_nonce = wp_create_nonce( 'clipisode_upload_' . $slug );

// REST root with trailing slash so store.js can do `state.restUrl +
// 'invitation/upload'` without worrying about whether WP returned a
// pretty-permalink form or the index.php?rest_route= fallback.
$rest_url = trailingslashit( rest_url( 'clipisode/v1/' ) );

// Submit-button label set. Pattern B from the multi-state-button design
// notes: one VANILLA core/button block in name.html (className
// "clipisode-name-submit") whose visible text is the IDLE label, plus
// four alternate labels stored as POST META on the Name screen post.
//
// Why post meta and not custom block attributes: registering extra
// attributes on core/button broke the editor with "Block contains
// unexpected or invalid content" because WP's validator could not
// round-trip the serialised save() output reliably. Keeping the button
// block vanilla and storing the labels in meta sidesteps that entirely
// — the editor extension (assets/editor/name-submit-labels.js) writes
// to meta via useEntityProp instead of setAttributes.
//
// We pull the alt labels here, run them through the same
// apply_flow_placeholders() the rest of the screen content uses (so
// authors can write things like "Sending to {host_name}…" in any
// language), and seed them into IAPI state. store.js's
// submitButtonLabel getter picks the right one by submitStatus.
$labels = [
	'idle'       => __( 'Save my reply', 'clipisode' ),
	'pending'    => __( 'Waiting for upload…', 'clipisode' ),
	'submitting' => __( 'Sending…', 'clipisode' ),
	'error'      => __( 'Try again', 'clipisode' ),
	'done'       => __( 'Sent', 'clipisode' ),
];
// Idle label still comes from the button's visible text in the saved
// block markup, because that's what the author types into the canvas
// and there's no value in duplicating it into meta.
if ( ! empty( $screens['name'] ) ) {
	$name_html = $screens['name'];
	if ( preg_match( '#<div\b[^>]*\bclipisode-name-submit\b[^>]*>(.*?)</div>#si', $name_html, $div_m ) ) {
		if ( preg_match( '#<a\b[^>]*>(.*?)</a>#si', $div_m[1], $a_m ) ) {
			$raw_idle = wp_strip_all_tags( $a_m[1] );
			$raw_idle = trim( html_entity_decode( $raw_idle, ENT_QUOTES, 'UTF-8' ) );
			if ( $raw_idle !== '' ) {
				$labels['idle'] = $raw_idle;
			}
		}
	}
}
// Alt labels come from post meta on the Name screen post. SUBMIT_LABEL_META_KEYS
// is the canonical map (state-key → meta-key). Empty meta values fall
// back to the English defaults declared above so the public flow always
// has something to render.
$name_screen_id = isset( $screen_ids['name'] ) ? (int) $screen_ids['name'] : 0;
if ( $name_screen_id > 0 ) {
	foreach ( Clipisode_Post_Types::SUBMIT_LABEL_META_KEYS as $state_key => $meta_key ) {
		$value = (string) get_post_meta( $name_screen_id, $meta_key, true );
		if ( $value !== '' ) {
			$labels[ $state_key ] = $value;
		}
	}
}
// Run every label through the same {host_name} / {topic_title}
// substitution we apply to block content, so authors can write things
// like "Sending to {host_name}…" if they want.
foreach ( $labels as $label_key => $label_value ) {
	$labels[ $label_key ] = Clipisode_Post_Types::apply_flow_placeholders( $label_value );
}
// Name-screen progress label template. Authors edit the editor-only
// preview paragraph text ("Uploading… {pct}%"); we extract that
// from the saved Name screen content and pass it into state so the live
// upload label can replace {pct} on each progress tick.
$upload_progress_template = __( 'Uploading… {pct}%', 'clipisode' );
$name_markup_for_progress = isset( $screens['name'] ) ? (string) $screens['name'] : '';
$name_has_handle_preview = false;
if (
	$name_markup_for_progress !== ''
	&& preg_match(
		'#class="[^"]*\bclipisode-name-handle-input-preview\b[^"]*"#i',
		$name_markup_for_progress
	)
) {
	$name_has_handle_preview = true;
}
if (
	$name_markup_for_progress !== ''
	&& preg_match(
		'#<p[^>]*class="[^"]*\bclipisode-name-progress-preview\b[^"]*"[^>]*>(.*?)</p>#is',
		$name_markup_for_progress,
		$m_progress
	)
) {
	$candidate = trim(
		wp_strip_all_tags(
			html_entity_decode(
				(string) $m_progress[1],
				ENT_QUOTES | ENT_HTML5,
				'UTF-8'
			)
		)
	);
	if ( $candidate !== '' ) {
		$upload_progress_template = $candidate;
	}
}
$upload_progress_template = Clipisode_Post_Types::apply_flow_placeholders( $upload_progress_template );

// Name-screen visual progress style (track/fill/height/radius).
// These are authored on the editor-only preview blocks in name.html and
// mirrored into the runtime-injected progress bar so the live UI matches.
$name_progress_height      = '8px';
$name_progress_track_color = '#e5e7eb';
$name_progress_fill_color  = '#3964b0';
$name_progress_radius      = '999px';
$name_progress_pin         = 'none';
if ( $name_markup_for_progress !== '' ) {
	if (
		preg_match(
			'#<div[^>]*class="([^"]*\bclipisode-name-progress-track-preview\b[^"]*)"[^>]*>#i',
			$name_markup_for_progress,
			$m_progress_track_class
		)
	) {
		$pin_class = (string) $m_progress_track_class[1];
		if ( str_contains( $pin_class, 'clipisode-pin-top' ) ) {
			$name_progress_pin = 'top';
		} elseif ( str_contains( $pin_class, 'clipisode-pin-bottom' ) ) {
			$name_progress_pin = 'bottom';
		}
	}

	$extract_css_prop = static function ( string $style, array $properties ): string {
		foreach ( $properties as $property ) {
			if ( preg_match( '/(?:^|;)\s*' . preg_quote( $property, '/' ) . '\s*:\s*([^;]+)/i', $style, $m_style_prop ) ) {
				return trim( (string) $m_style_prop[1] );
			}
		}
		return '';
	};
	$sanitize_css_prop = static function ( string $property, string $value ): string {
		if ( trim( $value ) === '' ) {
			return '';
		}
		$raw_decl  = $property . ':' . $value . ';';
		$safe_decl = function_exists( 'safecss_filter_attr' )
			? safecss_filter_attr( $raw_decl )
			: wp_strip_all_tags( $raw_decl );
		if ( ! is_string( $safe_decl ) || trim( $safe_decl ) === '' ) {
			return '';
		}
		if ( preg_match( '/' . preg_quote( $property, '/' ) . '\s*:\s*([^;]+)/i', $safe_decl, $m_safe_prop ) !== 1 ) {
			return '';
		}
		return trim( (string) $m_safe_prop[1] );
	};
	$extract_sanitized_css = static function ( string $style, array $properties ) use ( $extract_css_prop, $sanitize_css_prop ): string {
		foreach ( $properties as $property ) {
			$raw_value  = $extract_css_prop( $style, [ $property ] );
			$safe_value = $sanitize_css_prop( $property, $raw_value );
			if ( $safe_value !== '' ) {
				return $safe_value;
			}
		}
		return '';
	};

	if (
		preg_match(
			'#<div[^>]*class="[^"]*\bclipisode-name-progress-track-preview\b[^"]*"[^>]*style="([^"]*)"[^>]*>#i',
			$name_markup_for_progress,
			$m_progress_track_style
		)
	) {
		$track_style = html_entity_decode(
			(string) $m_progress_track_style[1],
			ENT_QUOTES | ENT_HTML5,
			'UTF-8'
		);
		$height_candidate = $extract_sanitized_css( $track_style, [ 'height', 'min-height' ] );
		if ( $height_candidate !== '' ) {
			$name_progress_height = $height_candidate;
		}
		$radius_candidate = $extract_sanitized_css( $track_style, [ 'border-radius' ] );
		if ( $radius_candidate !== '' ) {
			$name_progress_radius = $radius_candidate;
		}
		$track_candidate = $extract_sanitized_css( $track_style, [ 'background-color', 'background' ] );
		if ( $track_candidate !== '' ) {
			$name_progress_track_color = $track_candidate;
		}
	}
	if (
		preg_match(
			'#<div[^>]*class="[^"]*\bclipisode-name-progress-fill-preview\b[^"]*"[^>]*style="([^"]*)"[^>]*>#i',
			$name_markup_for_progress,
			$m_progress_fill_style
		)
	) {
		$fill_style = html_entity_decode(
			(string) $m_progress_fill_style[1],
			ENT_QUOTES | ENT_HTML5,
			'UTF-8'
		);
		$fill_candidate = $extract_sanitized_css( $fill_style, [ 'background-color', 'background' ] );
		if ( $fill_candidate !== '' ) {
			$name_progress_fill_color = $fill_candidate;
		}
	}
}
$name_progress_inline_style = '--clipisode-progress-height:' . $name_progress_height . ';'
	. '--clipisode-progress-track:' . $name_progress_track_color . ';'
	. '--clipisode-progress-fill:' . $name_progress_fill_color . ';'
	. '--clipisode-progress-radius:' . $name_progress_radius . ';'
	. '--clipisode-progress-fill-radius:' . $name_progress_radius . ';';
$name_progress_style_attr = ' style="' . esc_attr( $name_progress_inline_style ) . '"';
$name_progress_class     = 'clipisode-name-progress';
if ( $name_progress_pin === 'top' ) {
	$name_progress_class .= ' clipisode-name-progress--pin-top';
} elseif ( $name_progress_pin === 'bottom' ) {
	$name_progress_class .= ' clipisode-name-progress--pin-bottom';
}

// Initial state for the IAPI store. The runtime will merge this with any
// state declared client-side in store.js.
//   slug / screen / visited / path → diagnostic / current screen
//   intro video heartbeats        → drive scrim fade + play icon visibility
//   terms / reply file fields     → modal + handoff to Name screen
//   upload* / submit* / replyName → Name-screen form + background upload
//   restUrl / uploadNonce / restNonce → endpoint and request nonces
//   labels                        → submit-button label set, see Pattern B above
wp_interactivity_state( 'clipisode/flow', [
	'slug'           => $slug,
	'screen'         => $screen_type,
	'visited'        => 0,
	'path'           => '',
	'introVideoUrl'  => $intro_video_url,
	'hasIntroVideo'  => ( $intro_video_url !== '' ),
	'videoPlaying'   => false,
	'termsOpen'      => false,
	'replyFileName'  => '',
	'replyFileSize'  => 0,
	'replyFileType'  => '',
	'replyName'      => '',
	'replyHandle'    => '',
	'replyEmail'     => '',
	'replyMediaId'   => 0,
	'uploadPercent'  => 0,
	'uploadStatus'   => 'idle',
	'uploadError'    => '',
	'submitStatus'   => 'idle',
	'submitError'    => '',
	'emailError'     => '',
	'pendingSubmit'  => false,
	'socialNetwork'  => $social_network,
	'handleEnabled'  => $name_has_handle_preview,
	'uploadProgressTemplate' => $upload_progress_template,
	'restUrl'        => $rest_url,
	'uploadNonce'    => $upload_nonce,
	'restNonce'      => wp_create_nonce( 'wp_rest' ),
	'labels'         => $labels,
	'hasEmailScreen' => isset( $screens['email'] ) && $screens['email'] !== '',
] );

// Shared typography/theme assets (font registry + theme.css).
Clipisode_Post_Types::enqueue_default_theme_style();

// Register and enqueue the IAPI module. We register inline here rather than
// on a wp_enqueue_scripts hook because this template only loads when the
// clipisode_flow query var is set, so the guard is implicit. This flow
// updates its screens in place and does not use the client-side router.
//
// Version is filemtime() of the actual file on disk so Studio Safari (and
// any other aggressive cache) reliably pulls the latest store.js whenever
// we save a JS edit. Falls back to a static string if filemtime fails.
$store_path    = CLIPISODE_PLUGIN_DIR . 'assets/flow/store.js';
$store_version = file_exists( $store_path ) ? (string) filemtime( $store_path ) : '0.1.0';
wp_register_script_module(
	'clipisode/flow',
	plugins_url( 'assets/flow/store.js', CLIPISODE_PLUGIN_DIR . 'clipisode.php' ),
	[ '@wordpress/interactivity' ],
	$store_version
);
wp_enqueue_script_module( '@wordpress/interactivity' );
wp_enqueue_script_module( 'clipisode/flow' );

// Desktop intro screen needs the bundled QR-code generator (built from
// src/qr/view.ts via wp-scripts → build/qr/view.js, which exposes
// window.clipisodeQr). We enqueue it as a CLASSIC script (not a script
// module) on purpose: the QR file uses the standard wp-scripts UMD
// output shape and we want it loaded without IAPI's hydration guarantees
// — the inline init below just needs the global to exist before it
// runs. Loading it only on the desktop screen avoids dragging ~24 KB
// of QR code onto every mobile guest.
//
// Version comes from view.asset.php (the file wp-scripts generates next
// to view.js with the auto-rotated cache-bust hash). If it's missing for
// some reason — e.g. the user hasn't run npm run build yet — we still
// enqueue with a static fallback so the absence is loud (the inline
// init will log a console.error when window.clipisodeQr stays
// undefined) instead of silently 404'ing.
if ( $screen_type === 'intro_desktop' ) {
	$qr_asset_path = CLIPISODE_PLUGIN_DIR . 'build/qr/view.asset.php';
	$qr_script_url = plugins_url( 'build/qr/view.js', CLIPISODE_PLUGIN_DIR . 'clipisode.php' );
	$qr_version    = '0.1.0';
	if ( file_exists( $qr_asset_path ) ) {
		$qr_asset = include $qr_asset_path;
		if ( is_array( $qr_asset ) && ! empty( $qr_asset['version'] ) ) {
			$qr_version = (string) $qr_asset['version'];
		}
	}
	wp_enqueue_script(
		'clipisode-qr',
		$qr_script_url,
		[],
		$qr_version,
		[ 'in_footer' => false, 'strategy' => 'defer' ]
	);
}

show_admin_bar( false );

$clipisode_flow_show_debug = isset( $_GET['clipisode_debug'] ) && '1' === (string) sanitize_text_field( wp_unslash( $_GET['clipisode_debug'] ) );
if ( ! $clipisode_flow_show_debug && defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY ) {
	$clipisode_flow_show_debug = true;
}
$clipisode_flow_show_debug = apply_filters( 'clipisode_flow_show_debug', $clipisode_flow_show_debug );

// Inline SVG used both for the centre play glyph and for the modal close
// X glyph. Keeping them as constants here so the markup below stays scannable.
$play_svg  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 314.068 314.068" width="80" height="80" aria-hidden="true"><path fill="#ffffff" d="M293.002,78.53C249.646,3.435,153.618-22.296,78.529,21.068C3.434,64.418-22.298,160.442,21.066,235.534c43.35,75.095,139.375,100.83,214.465,57.47C310.627,249.639,336.371,153.62,293.002,78.53z M219.834,265.801c-60.067,34.692-136.894,14.106-171.576-45.973C13.568,159.761,34.161,82.935,94.23,48.26c60.071-34.69,136.894-14.106,171.578,45.971C300.493,154.307,279.906,231.117,219.834,265.801z M213.555,150.652l-82.214-47.949c-7.492-4.374-13.535-0.877-13.493,7.789l0.421,95.174c0.038,8.664,6.155,12.191,13.669,7.851l81.585-47.103C221.029,162.082,221.045,155.026,213.555,150.652z"/></svg>';
$close_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M18.3 5.71L12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.3 1.41 1.41 6.3-6.3 6.3 6.3 1.41-1.41-6.3-6.3 6.3-6.3z"/></svg>';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<meta name="robots" content="noindex, nofollow">
	<title><?php echo esc_html( $topic->title ); ?> — <?php bloginfo( 'name' ); ?></title>
	<meta name="description" content="<?php echo esc_attr( $social_description ); ?>">
	<meta property="og:type" content="website">
	<meta property="og:title" content="<?php echo esc_attr( $topic->title ); ?>">
	<meta property="og:description" content="<?php echo esc_attr( $social_description ); ?>">
	<meta property="og:url" content="<?php echo esc_url( $invitation_share_url ); ?>">
	<?php if ( ! empty( $ordered_social_images ) ) : ?>
		<?php foreach ( $ordered_social_images as $social_meta_image ) : ?>
			<meta property="og:image" content="<?php echo esc_url( $social_meta_image['url'] ); ?>">
			<meta property="og:image:secure_url" content="<?php echo esc_url( $social_meta_image['url'] ); ?>">
			<meta property="og:image:type" content="<?php echo esc_attr( $social_meta_image['type'] ); ?>">
			<meta property="og:image:width" content="<?php echo esc_attr( (string) $social_meta_image['width'] ); ?>">
			<meta property="og:image:height" content="<?php echo esc_attr( (string) $social_meta_image['height'] ); ?>">
			<meta property="og:image:alt" content="<?php echo esc_attr( sprintf( 'Social preview for %s', $topic->title ) ); ?>">
		<?php endforeach; ?>
		<link rel="image_src" href="<?php echo esc_url( $ordered_social_images[0]['url'] ); ?>">
		<meta itemprop="image" content="<?php echo esc_url( $ordered_social_images[0]['url'] ); ?>">
		<meta name="twitter:card" content="summary_large_image">
		<meta name="twitter:image" content="<?php echo esc_url( $twitter_image['url'] ); ?>">
		<meta name="twitter:image:alt" content="<?php echo esc_attr( sprintf( 'Social preview for %s', $topic->title ) ); ?>">
	<?php else : ?>
		<meta name="twitter:card" content="summary">
	<?php endif; ?>
	<meta name="twitter:title" content="<?php echo esc_attr( $topic->title ); ?>">
	<meta name="twitter:description" content="<?php echo esc_attr( $social_description ); ?>">
	<style>
		/*
		 * App-shell lock. We want the flow to feel like a native app:
		 * no body scroll, no rubber-band, no URL-bar-induced viewport jumps,
		 * no gap above content from the default 8px body margin or a stray
		 * admin-bar push. The pattern is:
		 *
		 *   html, body          -> zero margin/padding, fill the viewport
		 *   body.clipisode-flow -> position:fixed inset:0, overflow:hidden
		 *   IAPI region wrapper -> position:absolute inset:0 (fills body)
		 *   each screen section -> position:absolute inset:0 (stacked)
		 *
		 * Because all 10 sections are stacked at the same coordinates and
		 * only one isn't [hidden], the active screen owns the entire
		 * viewport. Screen content can use `height: 100%` confidently
		 * (vs. 100vh which jitters on iOS Safari as the URL bar shows
		 * and hides). overscroll-behavior:none kills the iOS rubber-band
		 * pull-to-refresh that would otherwise reveal the body backdrop.
		 *
		 * The !important on html/body resets defends against theme.json
		 * and admin-bar styles leaking in via wp_head().
		 */
		html, body {
			margin: 0 !important;
			padding: 0 !important;
			height: 100%;
		}
		body.clipisode-flow {
			position: fixed;
			inset: 0;
			overflow: hidden;
			overscroll-behavior: none;
			-webkit-tap-highlight-color: transparent;
			background: #ffffff;
			/* Mobile spacing vars are injected from
			 * Clipisode_Post_Types::LAYOUT_REGISTRY via
			 * enqueue_default_theme_style(). */
		}
		body.clipisode-flow > [data-wp-interactive="clipisode/flow"] {
			position: absolute;
			inset: 0;
		}
		/*
		 * Screen crossfade.
		 *
		 * All ten screens render into the DOM at page load. Only the
		 * one matching state.screen is .is-active. CSS handles a 300ms
		 * opacity crossfade between them. We deliberately do NOT use
		 * the [hidden] attribute (which sets display: none) — display
		 * can't be transitioned, so swapping it would be the jarring
		 * blink the host wants to avoid.
		 *
		 * Inactive screens get visibility: hidden + pointer-events:
		 * none so they don't catch taps or steal focus, even though
		 * they're still in the layout. The visibility transition has a
		 * 300ms delay on the way out so the element stays interactive
		 * exactly as long as it's visually present, and 0ms on the way
		 * in so the incoming screen accepts taps as soon as it begins
		 * fading up.
		 *
		 * is-active is set both server-side (via the active-class
		 * helper below, so the first paint matches state.screen with
		 * no flash of "all screens stacked at opacity 0") and client-
		 * side (via data-wp-class--is-active, which IAPI toggles when
		 * state.screen changes).
		 */
		.clipisode-flow-screen {
			position: absolute;
			inset: 0;
			overflow: hidden;
			opacity: 0;
			visibility: hidden;
			pointer-events: none;
			transition: opacity 300ms ease, visibility 0s linear 300ms;
		}
		.clipisode-flow-screen.is-active {
			opacity: 1;
			visibility: visible;
			pointer-events: auto;
			transition: opacity 300ms ease, visibility 0s linear 0s;
		}
		body.clipisode-flow .clipisode-flow-screen p,
		body.clipisode-flow .clipisode-flow-screen li,
		body.clipisode-flow .clipisode-flow-screen label:not(.wp-block-button__link),
		body.clipisode-flow .clipisode-flow-screen input,
		body.clipisode-flow .clipisode-flow-screen span {
			font-size: 16px;
			font-weight: 400;
		}
		/* Editor-only placeholder blocks should never render to guests.
		 * They exist only to make the block editor canvas WYSIWYG for
		 * runtime-injected fields (name/email inputs, progress, opt-ins). */
		body.clipisode-flow .clipisode-editor-only {
			display: none !important;
		}

		/*
		 * Intro screen layout.
		 *
		 * The intro is now built from plain core/group blocks (no Cover,
		 * no Custom HTML) so the editor reliably round-trips its own
		 * markup. The root Group paints the editable gradient (or solid
		 * color / image) via its own block sidebar and we just stretch
		 * it edge-to-edge inside the screen and lock it to flex column
		 * with space-between so the top and bottom Groups pin to the
		 * corners. Author edits to padding / gap / text follow through
		 * the way they do in any normal Group block.
		 */
		body.clipisode-flow .clipisode-flow-screen-intro .clipisode-intro-root {
			position: absolute;
			inset: 0;
			min-height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			color: #ffffff;
			overflow: hidden;
			/* isolation: isolate forces a fresh stacking context on
			 * the root so its gradient background can't end up
			 * painting over the absolutely-positioned video child.
			 * Without it, position: absolute alone (no z-index) does
			 * NOT create a stacking context, and the resulting
			 * compositing order on Android Chrome is unreliable —
			 * the audible-but-invisible-video bug. */
			isolation: isolate;
		}
		body.clipisode-flow .clipisode-intro-top,
		body.clipisode-flow .clipisode-intro-bottom {
			position: relative;
			z-index: 3;
			width: 100% !important;
			max-width: none !important;
			margin-top: 0 !important;
			margin-bottom: 0 !important;
			margin-block-start: 0 !important;
			margin-block-end: 0 !important;
			margin-left: 0 !important;
			margin-right: 0 !important;
			box-sizing: border-box;
			transition: opacity 250ms ease;
		}
		body.clipisode-flow .clipisode-intro-top.clipisode-dimmed,
		body.clipisode-flow .clipisode-intro-bottom.clipisode-dimmed {
			opacity: 0;
			pointer-events: none;
		}

		/* Topic intro video.
		 *
		 * Two-element trick:
		 *   .clipisode-intro-video-wrap   stacking context + GPU layer + tap target
		 *   .clipisode-intro-video        bare full-bleed media element
		 *
		 * The wrap div, not the video itself, carries the compositing
		 * properties (isolation: isolate creates a stacking context;
		 * transform: translateZ(0) + will-change: transform promote it
		 * to its own GPU compositing layer). This is the fix for the
		 * Android Chrome "audio plays but no picture" symptom: the
		 * video element renders into the wrap's compositing layer,
		 * cleanly above the gradient that paints on .clipisode-intro-
		 * root, regardless of whether Android picks SurfaceView or
		 * TextureView for the underlying decoder.
		 *
		 * The wrap is ALSO the click target for togglePlayback. The
		 * play button sits inside the wrap as a visual-only child
		 * (pointer-events: none) so taps on it bubble to the wrap.
		 * Scrims at z-index: 3 sit above the wrap and cleanly own
		 * their own clicks (Record/Upload/Terms) — no full-screen
		 * tap interceptor that some Android Chrome versions let
		 * swallow scrim taps if the stacking context is borderline.
		 */
		body.clipisode-flow .clipisode-intro-video-wrap {
			position: absolute;
			inset: 0;
			z-index: 1;
			isolation: isolate;
			transform: translateZ(0);
			-webkit-transform: translateZ(0);
			will-change: transform;
			-webkit-backface-visibility: hidden;
			backface-visibility: hidden;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		body.clipisode-flow .clipisode-intro-video {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
			background: transparent;
			pointer-events: none;
		}

		/* Hidden file inputs. We position them offscreen rather than use  */
		/* `display: none` (the HTML `hidden` attribute) because iOS       */
		/* Safari refuses to open a file picker for a display:none file   */
		/* input — even when triggered via a native <label for="...">.    */
		/* opacity 0 + 1px size keeps them invisible without taking them  */
		/* out of the layout in a way iOS rejects.                         */
		body.clipisode-flow .clipisode-file-input {
			position: absolute;
			left: -9999px;
			top: -9999px;
			width: 1px;
			height: 1px;
			opacity: 0;
			pointer-events: none;
		}

		/* Centre play-button glyph (only mounted when intro_media_id     */
		/* resolves). Lives inside .clipisode-intro-video-wrap and is    */
		/* pointer-events: none so taps anywhere in the wrap bubble to   */
		/* the wrap's togglePlayback handler — including taps on the     */
		/* button itself. The wrap is below the scrims (z-index: 1 vs    */
		/* scrims at z-index: 3) so scrim buttons are unambiguously      */
		/* above this tap region.                                         */
		body.clipisode-flow .clipisode-intro-play-button {
			background: transparent;
			border: 0;
			padding: 0;
			margin: 0;
			pointer-events: none;
			filter: drop-shadow(0 6px 24px rgba(0, 0, 0, 0.5));
			transition: opacity 250ms ease;
		}
		body.clipisode-flow .clipisode-intro-play-button.is-hidden {
			opacity: 0;
		}

		/*
		 * Intro typography — small bold uppercase host line above a big
		 * topic title. Selectors are scoped to .clipisode-flow so normal
		 * Heading/Paragraph blocks elsewhere on the WP site are unaffected.
		 *
		 * Every text descendant of .clipisode-intro-root gets a soft
		 * drop-shadow (text-shadow) so copy stays legible whether the
		 * background is the gradient fallback or a topic intro video.
		 * The button link itself overrides text-shadow to none so the
		 * dark "Record a reply" label on a white pill stays crisp.
		 */
		body.clipisode-flow .clipisode-intro-root,
		body.clipisode-flow .clipisode-intro-root p,
		body.clipisode-flow .clipisode-intro-root h1,
		body.clipisode-flow .clipisode-intro-root h2,
		body.clipisode-flow .clipisode-intro-root a {
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
		}
		body.clipisode-flow .clipisode-intro-host {
			margin: 0 0 0.35em 0;
			font-size: 16px;
			font-weight: 400;
			letter-spacing: 0.12em;
			text-transform: none;
			color: rgba(255, 255, 255, 1);
		}
		body.clipisode-flow .clipisode-intro-title,
		body.clipisode-flow h1.clipisode-intro-title {
			margin: 0;
			color: #ffffff;
			font-size: 34px;
			line-height: 1.15;
			font-weight: 700;
		}

		/*
		 * Record button. Compact pill, ~1/3 of the screen width, centred
		 * inside the Buttons row. Tight 8px padding per design — the
		 * button stays small enough not to dominate the bottom of the
		 * frame. min-width: 33% lets longer button labels grow past a
		 * third while keeping the floor.
		 */
		body.clipisode-flow .clipisode-intro-bottom .wp-block-buttons {
			display: flex;
			justify-content: center;
			width: 100%;
			margin: 0;
		}
		body.clipisode-flow .clipisode-intro-bottom .wp-block-button {
			width: auto;
			margin: 0;
		}
		body.clipisode-flow .clipisode-intro-bottom .wp-block-button__link {
			display: inline-block;
			min-width: 33%;
			text-align: center;
			padding: 8px 16px;
			border-radius: 8px;
			font-weight: 700;
			font-size: 16px;
			box-sizing: border-box;
			box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
		}
		/* Record CTA fill — Clipisode blue (#3964b0) with white text.    */
		/* The render_block magic-href rewrite turns the inner <a> into a */
		/* <label for="clipisode-record-input">, so we style both         */
		/* descendants here so the look is identical between the editor  */
		/* (still <a>) and the public flow (now <label>).                 */
		body.clipisode-flow .clipisode-intro-record .wp-block-button__link,
		body.clipisode-flow .clipisode-intro-record label.wp-block-button__link {
			background: #3964b0;
			color: #ffffff;
			text-shadow: none;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}
		body.clipisode-flow .clipisode-intro-record label.wp-block-button__link:active {
			background: #2f558e;
		}

		/*
		 * Upload + terms rows. Both are plain paragraphs with an inline
		 * link. The upload link has been rewritten to a <label> by the
		 * magic-href filter so it natively triggers the file picker —
		 * styling has to cover both the editor's <a> form and the public
		 * flow's <label> form so the look is consistent.
		 */
		body.clipisode-flow .clipisode-intro-upload,
		body.clipisode-flow p.clipisode-intro-upload {
			margin: 12px 0 0 0;
			color: rgba(255, 255, 255, 1);
			font-size: 12px;
			font-weight: 400;
			line-height: 1.4;
			text-align: center;
		}
		body.clipisode-flow .clipisode-intro-upload a,
		body.clipisode-flow .clipisode-intro-upload label[for] {
			color: rgba(138, 181, 242, 1);
			text-decoration: underline;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}
		body.clipisode-flow .clipisode-intro-terms,
		body.clipisode-flow p.clipisode-intro-terms {
			margin: 8px 0 0 0;
			color: rgba(255, 255, 255, 1);
			font-size: 12px;
			font-weight: 400;
			line-height: 1.4;
			text-align: center;
		}
		body.clipisode-flow .clipisode-intro-terms a {
			color: rgba(138, 181, 242, 1);
			text-decoration: underline;
			cursor: pointer;
		}

		/*
		 * Terms modal. A flat fullscreen sheet — white background, dark
		 * text, X close in the top-right. Hidden by default via the
		 * native `hidden` attribute (so no flash before hydration); IAPI
		 * toggles it via data-wp-bind--hidden="!state.termsOpen".
		 *
		 * The sheet itself scrolls when terms are long; touch-action and
		 * overscroll-behavior keep that scroll local to the sheet so it
		 * doesn't bubble out and rubber-band the underlying app shell.
		 */
		.clipisode-terms-modal {
			position: fixed;
			inset: 0;
			z-index: 1000;
			background: #ffffff;
			color: #1a1a1a;
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
			overscroll-behavior: contain;
			touch-action: pan-y;
		}
		.clipisode-terms-modal[hidden] {
			display: none !important;
		}
		.clipisode-terms-close {
			position: sticky;
			top: 0;
			margin-left: auto;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 44px;
			height: 44px;
			background: rgba(255, 255, 255, 1);
			backdrop-filter: blur(6px);
			border: 0;
			color: #1a1a1a;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
			z-index: 2;
		}
		.clipisode-terms-close:active {
			background: #f0f0f0;
		}
		.clipisode-terms-content {
			padding: 0 20px 16px;
			max-width: 640px;
			margin: 0 auto;
			line-height: 1.55;
			font-size: 16px;
		}
		.clipisode-terms-content h1,
		.clipisode-terms-content h2 {
			line-height: 1.25;
		}
		.clipisode-terms-content a {
			color: rgba(138, 181, 242, 1);
			text-decoration: underline;
		}
		.clipisode-terms-content h2.clipisode-terms-heading {
			margin-top: 0;
			padding-top: 8px;
		}
		.clipisode-terms-content .clipisode-terms-section + .clipisode-terms-section {
			margin-top: 24px;
			padding-top: 24px;
			border-top: 1px solid #ececec;
		}

		.clipisode-flow-debug {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			padding: 8px 12px 16px;
			background: rgba(0, 0, 0, 0.85);
			color: #fff;
			font: 12px/1.4 -apple-system, system-ui, sans-serif;
			z-index: 99999;
		}
		.clipisode-flow-debug > div + div {
			margin-top: 6px;
			display: flex;
			flex-wrap: wrap;
			gap: 4px;
		}
		.clipisode-flow-debug code {
			background: rgba(255, 255, 255, 0.15);
			padding: 1px 6px;
			border-radius: 3px;
		}
		.clipisode-flow-debug button {
			padding: 4px 8px;
			border: 1px solid #888;
			border-radius: 4px;
			background: #f7f7f7;
			color: #000;
			cursor: pointer;
			font-size: 11px;
			white-space: nowrap;
		}

		/* ----- Name screen form -----------------------------------------
		 * Layout strategy mirrors the intro screen: the screen <section>
		 * already covers the viewport, the block content (heading + a
		 * short instructional paragraph) lives in the upper third, and
		 * the form widgets float underneath it, full-bleed minus 20px of
		 * safe-area padding. blockGap on the form drives vertical
		 * rhythm so each piece can be hidden / shown via data-wp-bind
		 * without needing margin reshuffles. ---------------------------- */
		body.clipisode-flow .clipisode-flow-screen-name {
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			position: relative;
			padding: 8px var(--clipisode-mobile-gutter) 16px;
			background: #ffffff;
			color: #111111;
			z-index: 10;
		}
		body.clipisode-flow .clipisode-name-root {
			width: min(100%, var(--clipisode-mobile-content-max));
			margin-left: auto;
			margin-right: auto;
		}
		/*
		 * Name screen form layout.
		 *
		 * The form is a single flex column whose children appear in
		 * visual order:
		 *   heading + instructions Group  (editor block)
		 *   file info                     (PHP, injected at render)
		 *   progress + label              (PHP, injected at render)
		 *   name input                    (PHP, injected at render)
		 *   submit button                 (editor block)
		 *   error                         (PHP, injected at render)
		 *
		 * The runtime widgets are injected into the rendered HTML between
		 * the heading Group and submit Buttons block. DOM order equals
		 * visual order, so keyboard tab flow stays natural.
		 */
		body.clipisode-flow .clipisode-name-form {
			display: flex;
			flex-direction: column;
			gap: 12px;
			width: min(100%, var(--clipisode-mobile-content-max));
			margin: 24px auto 0;
		}
		body.clipisode-flow .clipisode-name-fileinfo {
			margin: 0;
			color: #111111;
			font-size: 16px;
			font-weight: 400;
			line-height: 1.4;
		}
		body.clipisode-flow .clipisode-name-fileinfo[hidden] {
			display: none !important;
		}
		body.clipisode-flow .clipisode-name-progress {
			--clipisode-progress-height: 8px;
			--clipisode-progress-track: #e5e7eb;
			--clipisode-progress-fill: #3964b0;
			--clipisode-progress-radius: 999px;
			--clipisode-progress-fill-radius: var(--clipisode-progress-radius);
			height: var(--clipisode-progress-height);
			width: 100%;
			background: var(--clipisode-progress-track);
			border-radius: var(--clipisode-progress-radius);
			overflow: hidden;
		}
		body.clipisode-flow .clipisode-name-progress.clipisode-name-progress--pin-top {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			width: 100%;
			z-index: 12;
			border-radius: 0;
		}
		body.clipisode-flow .clipisode-name-progress.clipisode-name-progress--pin-bottom {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			width: 100%;
			z-index: 12;
			border-radius: 0;
		}
		body.clipisode-flow .clipisode-name-progress[hidden] {
			display: none !important;
		}
		body.clipisode-flow .clipisode-name-progress-bar {
			height: 100%;
			width: 0%;
			background: var(--clipisode-progress-fill);
			border-radius: var(--clipisode-progress-fill-radius);
			transition: width 0.2s ease-out;
		}
		body.clipisode-flow .clipisode-name-progress-label {
			margin: 0;
			color: #111111;
			font-size: 16px;
			font-weight: 400;
			line-height: 1.4;
			letter-spacing: 0.02em;
		}
		body.clipisode-flow .clipisode-field-control {
			display: flex;
			flex-direction: column;
			gap: 6px;
			width: 100%;
		}
		body.clipisode-flow .clipisode-name-handle-field {
			display: flex;
			flex-direction: column;
			gap: 8px;
			width: 100%;
		}
		body.clipisode-flow .clipisode-name-instructions,
		body.clipisode-flow .clipisode-email-instructions,
		body.clipisode-flow .clipisode-name-handle-instructions {
			margin-top: 8px;
			margin-bottom: 8px;
		}
		body.clipisode-flow .clipisode-field-label-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			margin: 0;
			width: 100%;
		}
		body.clipisode-flow .clipisode-field-label {
			margin: 0;
			font-size: 16px;
			font-weight: 700;
			line-height: 1.3;
			color: #6b7280;
		}
		body.clipisode-flow .clipisode-field-label-right {
			margin-left: auto;
			text-align: right;
		}
		body.clipisode-flow .clipisode-name-handle-instructions {
			color: #111111;
			font-size: 16px;
			font-weight: 400;
			line-height: 1.45;
		}
		body.clipisode-flow .clipisode-name-root a:not(.wp-block-button__link) {
			color: rgba(138, 181, 242, 1);
			text-decoration: underline;
		}
		body.clipisode-flow .clipisode-name-progress-label[hidden] {
			display: none !important;
		}
		body.clipisode-flow .clipisode-name-input,
		body.clipisode-flow .clipisode-name-handle-input,
		body.clipisode-flow .clipisode-email-input {
			-webkit-appearance: none;
			appearance: none;
			width: 100%;
			padding: 14px 16px;
			border: 1px solid rgba(17, 17, 17, 0.2);
			border-radius: 8px;
			background: #ffffff;
			color: #111111;
			font-size: 16px; /* ≥16px stops iOS auto-zoom on focus. */
			font-weight: 400;
			line-height: 1.3;
			box-sizing: border-box;
		}
		body.clipisode-flow .clipisode-name-input:focus,
		body.clipisode-flow .clipisode-name-handle-input:focus,
		body.clipisode-flow .clipisode-email-input:focus {
			outline: 2px solid #3964b0;
			outline-offset: 1px;
			background: #ffffff;
		}
		/*
		 * Submit button (Pattern B).
		 *
		 * The visible <a> is rendered by core/button via name.html;
		 * PHP injects IAPI directives into it at render time. We
		 * style the rendered button to match the original hardcoded
		 * one (Clipisode blue, white text, full-width pill). Authors
		 * can override the colour / radius / spacing via the block
		 * sidebar; these rules are the floor.
		 */
		body.clipisode-flow .clipisode-name-submit-wrap {
			margin: 0 !important;
			width: 100%;
		}
		body.clipisode-flow .clipisode-name-submit-wrap .wp-block-button {
			margin: 0;
			width: 100%;
		}
		body.clipisode-flow .clipisode-name-submit .wp-block-button__link {
			display: block;
			width: 100%;
			padding: 14px 16px;
			border: 0;
			border-radius: 8px;
			background: #3964b0;
			color: #ffffff;
			font-size: 17px;
			font-weight: 700;
			line-height: 1.3;
			text-align: center;
			text-decoration: none;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
			box-sizing: border-box;
			transition: background 0.15s ease-out, opacity 0.15s ease-out;
		}
		body.clipisode-flow .clipisode-name-submit .wp-block-button__link:active {
			background: #2c4f8c;
		}
		body.clipisode-flow .clipisode-name-submit .wp-block-button__link.is-disabled,
		body.clipisode-flow .clipisode-name-submit .wp-block-button__link[aria-disabled="true"] {
			background: rgba(57, 100, 176, 0.5);
			cursor: not-allowed;
			opacity: 0.7;
		}
		/* Pending pulse: applied via data-wp-class--is-pending while
		 * the submit is queued behind an in-flight upload. Slow,
		 * gentle opacity oscillation makes the wait state visible
		 * even on devices where the label change alone is too quick
		 * to register. Pointer-events stays on so a re-tap is
		 * idempotent, not blocked. */
		body.clipisode-flow .clipisode-name-submit .wp-block-button__link.is-pending {
			background: #3964b0;
			opacity: 1;
			cursor: progress;
			animation: clipisode-pending-pulse 1.6s ease-in-out infinite;
		}
		@keyframes clipisode-pending-pulse {
			0%, 100% { opacity: 1; }
			50%      { opacity: 0.55; }
		}
		@media (prefers-reduced-motion: reduce) {
			body.clipisode-flow .clipisode-name-submit .wp-block-button__link.is-pending {
				animation: none;
				opacity: 0.85;
			}
		}
		body.clipisode-flow .clipisode-name-error {
			margin: 8px 0;
			color:rgb(204, 0, 0);
			font-size: 16px;
			font-weight: 400;
			line-height: 1.35;
			text-align: center;
		}
		body.clipisode-flow .clipisode-name-error[hidden] {
			display: none !important;
		}

		/* ----- Intro Desktop screen ------------------------------------
		 * "Watch + scan" card layout matching the desktop reference
		 * mockup: white viewport, centred white card, portrait video
		 * on the left taking ~85vh, a vertical stack on the right
		 * with logo / title / instruction / URL / QR-helper / QR.
		 *
		 * Authoring vs. injection.
		 *   The editor markup defines a .clipisode-introd-card with
		 *   .clipisode-introd-left + .clipisode-introd-right inside.
		 *   Four pieces are author-controlled (real core blocks):
		 *     - the logo (core/image, default icon.png, replaceable)
		 *     - the heading and instructions paragraph
		 *     - the QR-helper paragraph
		 *     - the QR placeholder (core/image, replaced at render
		 *       time with the live QR canvas mount; authors can
		 *       resize / pad / border / move it via standard image
		 *       block controls; lock prevents removal so the public
		 *       flow always finds a target to inject into)
		 *   One piece is PHP-injected into a templateLocked slot
		 *   inside the right column:
		 *     .clipisode-introd-url-slot    (the live invitation URL)
		 *   The QR figure is matched by class
		 *   (.clipisode-introd-qr-image) and its full markup —
		 *   figure + inner <img> — is replaced with the QR mount.
		 *   The left column is NOT templateLocked: authors may add
		 *   their own blocks, and PHP appends the topic intro video
		 *   below whatever they put there.
		 *
		 * Visual rules.
		 *   - Card sized to fit a portrait video at 85vh, with the
		 *     right column matching the video's height.
		 *   - Light theme: dark text on white, no text-shadow.
		 *   - Aspect-ratio 9/16 on the video slot keeps proportions
		 *     stable even when the topic has no intro video yet.
		 * ---------------------------------------------------------- */
		body.clipisode-flow .clipisode-flow-screen-intro_desktop,
		body.clipisode-flow .clipisode-flow-screen-intro-desktop {
			overflow: auto; /* desktop is fine to scroll if window < layout. */
			background: #ffffff;
		}
		body.clipisode-flow .clipisode-introd-root {
			position: absolute;
			inset: 0;
			min-height: 100%;
			background: #ffffff;
			color: #111827;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding: 24px;
		}
		body.clipisode-flow .clipisode-introd-card {
			width: 100%;
			max-width: 1080px;
			background: #ffffff;
			border-radius: 18px;
			box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
			display: flex !important;
			flex-direction: row !important;
			align-items: stretch !important;
			justify-content: stretch !important;
			flex-wrap: nowrap !important;
			overflow: hidden;
			padding: 24px !important;
			gap: 24px !important;
		}
		body.clipisode-flow .clipisode-introd-left {
			flex: 0 0 auto;
			width: clamp(280px, 38vw, 480px);
			height: min(85vh, 854px);
			position: relative;
			background: #000000;
			border-radius: 12px;
			overflow: hidden;
		}
		body.clipisode-flow .clipisode-introd-video-mount {
			position: absolute;
			inset: 0;
			background: #000000;
		}
		body.clipisode-flow .clipisode-introd-video {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
			background: #000000;
		}
		body.clipisode-flow .clipisode-introd-video-play {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 88px;
			height: 88px;
			border: 0;
			padding: 0;
			background: transparent;
			cursor: pointer;
			z-index: 2;
			filter: drop-shadow(0 6px 24px rgba(0, 0, 0, 0.5));
			transition: opacity 200ms ease, transform 150ms ease;
		}
		body.clipisode-flow .clipisode-introd-video-play.is-hidden {
			opacity: 0;
			pointer-events: none;
		}
		body.clipisode-flow .clipisode-introd-video-play:active {
			transform: translate(-50%, -50%) scale(0.95);
		}
		body.clipisode-flow .clipisode-introd-video-fallback {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: rgba(255, 255, 255, 1);
			font-size: 16px;
			font-weight: 400;
			padding: 16px;
			text-align: center;
		}
		body.clipisode-flow .clipisode-introd-right {
			flex: 1 1 auto;
			min-width: 0;
			display: flex !important;
			flex-direction: column !important;
			align-items: center !important;
			justify-content: center !important;
			text-align: center;
			gap: 12px !important;
			padding: 24px !important;
		}
		/* Logo: real wp:image block in intro_desktop.html with        */
		/* icon.png as the default. Sizing is set inline on the <img>  */
		/* element (height:64px;width:auto) so the image preserves its */
		/* natural aspect ratio when authors replace it with a wider   */
		/* or narrower logo. We deliberately do NOT constrain the      */
		/* container here — adding width/height rules would override   */
		/* the inline style and squish replacement logos.              */
		body.clipisode-flow .clipisode-introd-logo {
			margin: 0;
		}
		/* Heading + paragraph copy is authored in the editor. We just */
		/* tighten typography and remove the dark-theme text-shadow.   */
		body.clipisode-flow .clipisode-introd-title {
			margin: 0 !important;
			font-size: clamp(22px, 2.4vw, 28px);
			line-height: 1.25;
			font-weight: 700;
			color: #111827;
			text-shadow: none;
		}
		body.clipisode-flow .clipisode-introd-instructions {
			margin: 0 !important;
			font-size: 16px;
			font-weight: 400;
			line-height: 1.5;
			color: #4b5563;
			max-width: 360px;
			text-shadow: none;
		}
		body.clipisode-flow .clipisode-introd-instructions strong {
			color: #111827;
		}
		body.clipisode-flow .clipisode-introd-continue .wp-block-button__link {
			background: #1d4ed8;
			color: #ffffff;
			text-decoration: none;
		}
		/* URL slot. PHP fills with the bare host+path of the invite   */
		/* link in a bold, click-to-select-friendly chunk of text.     */
		body.clipisode-flow .clipisode-introd-url-slot {
			margin: 4px 0 !important;
		}
		body.clipisode-flow .clipisode-introd-url {
			display: inline-block;
			font-size: 16px;
			font-weight: 400;
			color: rgba(138, 181, 242, 1);
			text-decoration: none;
			padding: 4px 0;
			letter-spacing: 0.01em;
			word-break: break-all;
		}
		body.clipisode-flow .clipisode-introd-qr-helper {
			margin: 0 !important;
			font-size: 16px;
			font-weight: 400;
			line-height: 1.4;
			color: #4b5563;
			max-width: 320px;
			text-shadow: none;
		}
		/* QR mount. The desktop intro screen seeds a core/image block
		 * (.clipisode-introd-qr-image) in the editor as a placeholder
		 * authors can resize / pad / border / move; the renderer
		 * replaces that figure with this <div> at request time. The
		 * dimensions are pinned so layout doesn't reflow when the
		 * canvas hydrates. */
		body.clipisode-flow .clipisode-introd-qr {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 180px;
			height: 180px;
			margin: 12px auto 0;
			background: #ffffff;
			border-radius: 12px;
			padding: 8px;
			box-sizing: border-box;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		}
		/* The bundled qrcode.js drops a <canvas data-clipisode-qr> in
		 * here on hydration. Sizing the canvas explicitly keeps it from
		 * blowing past the 164px (180 - 2*8 padding) inner area on
		 * displays where the library returns a larger native size. */
		body.clipisode-flow .clipisode-introd-qr canvas[data-clipisode-qr] {
			display: block;
			width: 100%;
			height: 100%;
			max-width: 100%;
			max-height: 100%;
		}
		/* Visible only when JS hasn't filled the slot yet. We hide it
		 * the moment a canvas appears so authors don't see a flash of
		 * helper text behind the QR. */
		body.clipisode-flow .clipisode-introd-qr-fallback {
			font-size: 16px;
			font-weight: 400;
			line-height: 1.3;
			color: #555555;
			text-align: center;
			padding: 0 6px;
		}
		body.clipisode-flow .clipisode-introd-qr:has(canvas[data-clipisode-qr]) .clipisode-introd-qr-fallback {
			display: none;
		}
		@media (max-width: 880px) {
			body.clipisode-flow .clipisode-introd-card {
				flex-direction: column !important;
				padding: 16px !important;
			}
			body.clipisode-flow .clipisode-introd-left {
				width: min(100%, 360px);
				height: auto;
				aspect-ratio: 9 / 16;
				margin: 0 auto;
			}
			body.clipisode-flow .clipisode-introd-right {
				padding: 16px !important;
			}
		}

		/* ----- Closed / warning / email screens ------------------------
		 * Shared baseline: light surface by default, centred readable
		 * content width, and full-width action buttons. Authors can
		 * still override background + text styles in block controls. */
		body.clipisode-flow .clipisode-closed-root,
		body.clipisode-flow .clipisode-warning-root {
			position: absolute;
			inset: 0;
			min-height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			color: #111111;
		}
		body.clipisode-flow .clipisode-closed-root > *,
		body.clipisode-flow .clipisode-warning-root > * {
			width: min(100%, var(--clipisode-mobile-content-max));
			margin-left: auto !important;
			margin-right: auto !important;
		}
		body.clipisode-flow .clipisode-warning-heading,
		body.clipisode-flow .clipisode-closed-heading {
			margin: 0 0 8px 0;
			font-size: 28px;
			line-height: 1.2;
			font-weight: 700;
		}
		body.clipisode-flow .clipisode-warning-message,
		body.clipisode-flow .clipisode-closed-message {
			margin: 8px 0;
			font-size: 16px;
			font-weight: 400;
			line-height: 1.45;
			color: #111111;
		}
		body.clipisode-flow .clipisode-warning-root a:not(.wp-block-button__link),
		body.clipisode-flow .clipisode-closed-root a:not(.wp-block-button__link) {
			color: rgba(138, 181, 242, 1);
			text-decoration: underline;
		}
		body.clipisode-flow .clipisode-warning-root .wp-block-buttons,
		body.clipisode-flow .clipisode-closed-root .wp-block-buttons {
			display: flex;
			flex-direction: column;
			gap: 10px;
			align-items: stretch;
			width: 100%;
		}
		body.clipisode-flow .clipisode-warning-root .wp-block-button,
		body.clipisode-flow .clipisode-closed-root .wp-block-button {
			width: 100%;
		}
		body.clipisode-flow .clipisode-warning-root .wp-block-button__link,
		body.clipisode-flow .clipisode-closed-root .wp-block-button__link {
			display: block;
			width: 100%;
			padding: 14px 16px;
			border-radius: 8px;
			font-weight: 700;
			text-align: center;
			text-shadow: none;
			box-sizing: border-box;
		}
		body.clipisode-flow .clipisode-warning-root .is-style-fill .wp-block-button__link,
		body.clipisode-flow .clipisode-closed-root .is-style-fill .wp-block-button__link {
			background: #3964b0;
			color: #ffffff;
			border: 0;
		}
		body.clipisode-flow .clipisode-warning-root .is-style-outline .wp-block-button__link,
		body.clipisode-flow .clipisode-closed-root .is-style-outline .wp-block-button__link {
			background: #3964b0;
			color: #ffffff;
			border: 0;
		}

		/* ----- Email overlay (on top of Name) ------------------------- */
		body.clipisode-flow .clipisode-flow-screen-email {
			z-index: 20;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px var(--clipisode-mobile-gutter);
			background: rgba(0, 0, 0, 0.1);
		}
		body.clipisode-flow .clipisode-flow-screen-email .clipisode-email-root {
			position: relative;
			inset: auto;
			min-height: 0;
			width: min(100%, var(--clipisode-mobile-content-max));
			max-height: min(100%, 760px);
			overflow: auto;
			border-radius: 14px;
			border: 1px solid rgba(0, 0, 0, 0.12);
			box-shadow: 0 16px 44px rgba(0, 0, 0, 0.35);
			color: #111111;
		}
		/* Fallback card fill when the root group has no explicit
		 * background style. If the author sets a background in the block
		 * sidebar, `.has-background` wins and this fallback is ignored. */
		body.clipisode-flow .clipisode-flow-screen-email .clipisode-email-root:not(.has-background) {
			background: #ffffff;
		}
		body.clipisode-flow .clipisode-email-form {
			display: flex;
			flex-direction: column;
			gap: 12px;
			width: min(100%, var(--clipisode-mobile-content-max));
			margin: 0 auto;
		}
		body.clipisode-flow .clipisode-email-error {
			margin: 8px 0;
			color: rgb(204, 0, 0);
			font-size: 16px;
			font-weight: 400;
			line-height: 1.35;
			text-align: left;
		}
		body.clipisode-flow .clipisode-email-error[hidden] {
			display: none !important;
		}
		body.clipisode-flow .clipisode-email-submit-wrap {
			margin-top: 12px !important;
		}
		body.clipisode-flow .clipisode-email-submit-wrap .wp-block-button {
			margin: 0;
			width: 100%;
		}
		body.clipisode-flow .clipisode-email-submit .wp-block-button__link {
			display: block;
			width: 100%;
			padding: 14px 16px;
			border: 0;
			border-radius: 8px;
			background: #3964b0;
			color: #ffffff;
			font-size: 17px;
			font-weight: 700;
			line-height: 1.3;
			text-align: center;
			text-decoration: none;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
			box-sizing: border-box;
		}
		body.clipisode-flow .clipisode-email-submit .wp-block-button__link:active {
			background: #2c4f8c;
		}
		body.clipisode-flow .clipisode-email-skip,
		body.clipisode-flow p.clipisode-email-skip {
			color: #111111;
			font-size: 16px;
			font-weight: 400;
			line-height: 1.4;
			margin: 12px 0 0 0;
			text-align: center;
		}
		body.clipisode-flow .clipisode-email-skip a,
		body.clipisode-flow .clipisode-email-root a:not(.wp-block-button__link) {
			color: rgba(138, 181, 242, 1);
			text-decoration: underline;
		}

		/* ----- Success screen -------------------------------------------
		 *
		 * The success screen is rooted in a core/cover block so authors
		 * can pick a stretched-to-cover background (image, gradient, or
		 * solid colour) via the standard block sidebar. Cover wraps its
		 * children in .wp-block-cover__inner-container; we zero out
		 * Cover's default 1.5em padding on that container so the screen
		 * frame's gutter (set on .clipisode-flow-screen-success below)
		 * stays the single source of truth for horizontal spacing.
		 *
		 * The Cover root itself just inherits the existing width-min
		 * rule — Cover renders as <div class="wp-block-cover ...
		 * clipisode-success-root">, so the selector keeps matching.
		 */
		body.clipisode-flow .clipisode-flow-screen-success {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: stretch;
			padding: 8px var(--clipisode-mobile-gutter);
			background: #ffffff;
			color: #111111;
			text-align: center;
		}
		body.clipisode-flow .clipisode-success-root {
			width: min(100%, var(--clipisode-mobile-content-max));
			margin-left: auto;
			margin-right: auto;
		}
		body.clipisode-flow .clipisode-success-root .wp-block-cover__inner-container {
			padding: 0;
			width: 100%;
		}
		body.clipisode-flow .clipisode-success-actions .wp-block-button {
			margin: 0;
			width: 100%;
		}
		body.clipisode-flow .clipisode-success-action .wp-block-button__link {
			display: block;
			width: 100%;
			padding: 14px 16px;
			border: 0;
			border-radius: 8px;
			background: #3964b0;
			color: #ffffff;
			font-size: 17px;
			font-weight: 700;
			line-height: 1.3;
			text-align: center;
			text-decoration: none;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
			box-sizing: border-box;
		}
		body.clipisode-flow .clipisode-success-action .wp-block-button__link:active {
			background: #2c4f8c;
		}
		body.clipisode-flow .clipisode-success-root a:not(.wp-block-button__link) {
			color: rgba(138, 181, 242, 1);
			text-decoration: underline;
		}
	</style>
	<?php Clipisode_Social_Meta::print_filtered_wp_head(); ?>
</head>
<body class="clipisode-flow clipisode-flow-screen-<?php echo esc_attr( str_replace( '_', '-', $screen_type ) ); ?>">
<div
	data-wp-interactive="clipisode/flow"
	data-wp-init="callbacks.init"
>

<?php
// Offscreen file inputs — present once for the whole flow, reused by every
// screen's Record / Upload triggers. The Intro screen's Record / Upload
// affordances are <label for="clipisode-{record|upload}-input"> elements
// produced by the render_block magic-href rewrite; tapping them opens
// the corresponding picker via the native HTML label→input pairing
// (no JS .click() needed).
//
// We deliberately position the inputs offscreen rather than using the
// HTML `hidden` attribute (== `display: none`). iOS Safari refuses to
// open a file picker for a `display: none` <input type="file"> — the
// label tap silently no-ops. Offscreen + width/height/opacity 0 keeps
// the input "visible enough" for the gesture chain while staying
// invisible to the user.
//
// `accept="video/*"` constrains the OS picker to videos. `capture="user"`
// on the record input hints iOS / Android to open the camera in front-
// facing record mode straight away; the upload input omits `capture` so
// mobile OSes show the gallery / Files.app picker. Desktop Safari ignores
// `capture` entirely and shows a plain file dialog, which is fine.
?>
<input type="file" id="clipisode-record-input" class="clipisode-file-input" accept="video/*" capture="user" data-wp-on--change="actions.handleFileChosen">
<input type="file" id="clipisode-upload-input" class="clipisode-file-input" accept="video/*" data-wp-on--change="actions.handleFileChosen">

<?php foreach ( $screens as $st => $content ) : ?>
	<?php if ( $content !== '' ) : ?>
	<?php
	// is-active is set server-side for the screen that matches state.screen
	// at first paint, then driven by IAPI on every subsequent transition
	// via data-wp-class--is-active. Doing both means the first render is
	// stable (no flash of all-screens-stacked-at-opacity-0) AND every
	// client-side transition gets the 300ms crossfade defined in CSS.
	$active_class = ( $st === $screen_type ) ? ' is-active' : '';
	?>
	<section
		class="clipisode-flow-screen clipisode-flow-screen-<?php echo esc_attr( str_replace( '_', '-', $st ) ); ?><?php echo esc_attr( $active_class ); ?>"
		data-wp-context='<?php echo esc_attr( wp_json_encode( [ 'matches' => $st ] ) ); ?>'
		data-wp-class--is-active="state.isActiveScreen"
	>
		<?php
		// Render the screen's editable blocks. For intro_desktop we then
		// post-process the rendered HTML to fill the empty slot groups
		// (logo / URL / QR / video) the editor markup defines but leaves
		// empty by design — so the dynamic / brand-marked / topic-data-
		// dependent pieces can't be accidentally edited away. For name
		// we wire the author-edited submit button (Pattern B) to IAPI:
		// inject data-wp-on--click + state bindings + data-wp-text into
		// the inner <a> so submitButtonLabel can swap the visible text
		// per state (idle / pending / submitting / error / done) while
		// the static markup still carries the author's IDLE label as a
		// no-flash first paint.
		$rendered_content = do_blocks( $content );
		if ( $st === 'name' ) {
			$rendered_content = preg_replace_callback(
				'#(<div\b[^>]*\bclipisode-name-submit\b[^>]*>\s*)<a\b([^>]*)>#i',
				function ( $m ) {
					$a_attrs = $m[2];
					// Strip any author-added href so we control navigation.
					$a_attrs = preg_replace( '/\s+href="[^"]*"/i', '', $a_attrs );
					return $m[1]
						. '<a href="#"'
						. $a_attrs
						. ' role="button"'
						. ' data-wp-on--click="actions.submitReply"'
						. ' data-wp-bind--aria-disabled="!state.canSubmit"'
						. ' data-wp-class--is-pending="state.isSubmitPending"'
						. ' data-wp-class--is-disabled="!state.canSubmit"'
						. ' data-wp-text="state.submitButtonLabel"'
						. '>';
				},
				$rendered_content,
				1
			);
		}
		if ( $st === 'intro_desktop' ) {
			$current_url = $invitation_url;
			$display_url = preg_replace( '#^https?://#', '', $current_url );

			$url_html = '<a class="clipisode-introd-url" href="'
				. esc_url( $current_url ) . '">'
				. esc_html( $display_url ) . '</a>';

			// QR mount. Render an empty <div> with the URL stamped on a
			// data-attribute; the bundled qrcode.js library (loaded
			// below as build/qr/view.js → window.clipisodeQr) reads it
			// and inserts a <canvas> on hydration. We deliberately do
			// NOT call any third-party QR service — the previous
			// api.qrserver.com URL bound the desktop screen to a
			// network dependency for something that is purely
			// deterministic given the URL. Bundling the encoder keeps
			// us offline-capable in WP Studio and avoids leaking the
			// invitation slug to a third party at every desktop view.
			//
			// aria-label gives the spot a semantic identity for screen
			// readers since the canvas itself is just a bitmap. The
			// "Loading…" text inside is the visible-on-no-JS fallback
			// — JS replaces the inner text on hydration, so users with
			// the bundle disabled at least see something explanatory
			// instead of an empty box.
			$qr_html = '<div class="clipisode-introd-qr"'
				. ' data-clipisode-qr-url="' . esc_attr( $current_url ) . '"'
				. ' role="img"'
				. ' aria-label="' . esc_attr__( 'QR code linking to this invitation', 'clipisode' ) . '">'
				. '<span class="clipisode-introd-qr-fallback">'
				. esc_html__( 'Open this URL on your phone.', 'clipisode' )
				. '</span>'
				. '</div>';

			if ( $intro_video_url !== '' ) {
				$video_html = '<div class="clipisode-introd-video-mount">'
					. '<video class="clipisode-introd-video" '
					. 'playsinline webkit-playsinline preload="metadata" '
					. 'disableremoteplayback>'
					. '<source src="' . esc_url( $intro_video_url )
					. '" type="video/mp4">'
					. '</video>'
					. '<button type="button" class="clipisode-introd-video-play" '
					. 'aria-label="' . esc_attr__( 'Play intro video', 'clipisode' ) . '">'
					. $play_svg
					. '</button>'
					. '</div>';
			} else {
				$video_html = '<div class="clipisode-introd-video-fallback">'
					. esc_html__( 'No intro video for this topic.', 'clipisode' )
					. '</div>';
			}

			// Strip editor-only "slot filler" spacers before slot
			// injection. The starter HTML embeds an invisible
			// core/spacer (height:0) inside each slot Group so
			// Gutenberg's empty-Group variation picker UI doesn't
			// fire in the editor. On the public side those spacers
			// are pure noise — PHP wants to inject real content into
			// otherwise-empty slot divs.
			//
			// do_blocks() already ran above, so block-comment markers
			// are stripped; only the rendered <div class="wp-block-
			// spacer ...slot-filler..."></div> remains. We strip
			// those rendered divs so the slot-injection step below
			// sees the parent slot Group as serialized-empty.
			//
			// The selector matches any spacer whose class ends in
			// "slot-filler" — clipisode-introd-slot-filler on the
			// desktop intro, clipisode-success-slot-filler on the
			// success screen, and any future screens that use the
			// same trick get covered for free. We don't need a
			// per-screen list because screen posts only contain
			// Clipisode markup; there's no risk of matching another
			// plugin's spacer.
			$rendered_content = preg_replace(
				'#<div[^>]*class="[^"]*\bslot-filler\b[^"]*"[^>]*></div>\s*#',
				'',
				$rendered_content
			);

			// URL slot is an empty Group locked with templateLock:"all"
			// in intro_desktop.html, so authors can't put blocks inside
			// it. We OVERWRITE its (always-empty) inner HTML with the
			// dynamic URL link. The regex matches the serialized empty
			// <div class="wp-block-group ...slot-class..."></div> with
			// optional whitespace between the tags.
			$pattern = '#(<div[^>]*class="[^"]*\bclipisode-introd-url-slot\b[^"]*"[^>]*>)\s*(</div>)#';
			$rendered_content = preg_replace(
				$pattern,
				'$1' . $url_html . '$2',
				$rendered_content,
				1
			);

			// QR is now a real core/image block in the editor (so authors
			// can resize / pad / border / move it via standard image
			// controls), not an empty Group slot. The block renders as
			// <figure class="...clipisode-introd-qr-image..."><img .../></figure>;
			// we replace the entire figure with the QR mount div, since
			// the canvas + JS hydration owns the box's dimensions and a
			// nested <img> wrapped in a figure would just confuse the
			// public CSS that targets .clipisode-introd-qr directly.
			//
			// Width / alignment authors set in the sidebar live on the
			// figure as inline style and class. Those don't survive
			// the swap — but that's intentional: the QR mount has its
			// own size / alignment rules from the public theme.css and
			// from the image-block author intent isn't a useful signal
			// for the live QR (which is always a fixed-aspect canvas).
			// If we ever want author width/alignment to flow through,
			// the cleanest move is to lift those attributes off the
			// figure here and re-apply them as inline style / classes
			// on the mount div.
			$qr_pattern = '#<figure[^>]*class="[^"]*\bclipisode-introd-qr-image\b[^"]*"[^>]*>.*?</figure>#s';
			$rendered_content = preg_replace(
				$qr_pattern,
				$qr_html,
				$rendered_content,
				1
			);

			// Left column is NOT templateLocked: authors may add their own
			// blocks (a caption, an extra heading, etc.) into it. We
			// APPEND the topic intro video markup just before the closing
			// </div> of the left column, so author-added blocks render
			// above and the video renders below.
			//
			// Walking matched <div> pairs by hand because nested Groups
			// inside the left column are valid (the Group's templateLock
			// is "all" only on the URL/QR slots; the left column allows
			// arbitrary children). Start at the opening tag of the slot,
			// then scan forward incrementing depth on every <div and
			// decrementing on every </div>; the </div> that brings depth
			// back to 0 is the slot's own closing tag.
			$slot_class = 'clipisode-introd-left';
			$open_re    = '#<div[^>]*class="[^"]*\b'
				. preg_quote( $slot_class, '#' )
				. '\b[^"]*"[^>]*>#';
			if ( preg_match( $open_re, $rendered_content, $m, PREG_OFFSET_CAPTURE ) ) {
				$start = $m[0][1] + strlen( $m[0][0] );
				$len   = strlen( $rendered_content );
				$depth = 1;
				$i     = $start;
				while ( $i < $len && $depth > 0 ) {
					$next_open  = strpos( $rendered_content, '<div', $i );
					$next_close = strpos( $rendered_content, '</div>', $i );
					if ( $next_close === false ) {
						break;
					}
					if ( $next_open !== false && $next_open < $next_close ) {
						$depth++;
						$i = $next_open + 4;
					} else {
						$depth--;
						if ( $depth === 0 ) {
							$rendered_content = substr( $rendered_content, 0, $next_close )
								. $video_html
								. substr( $rendered_content, $next_close );
							break;
						}
						$i = $next_close + 6;
					}
				}
			}
		}
		if ( $st === 'intro' && $intro_video_url !== '' ) {
			$intro_video_html = '<div class="clipisode-intro-video-wrap"'
				. ' data-wp-on--click="actions.togglePlayback">'
				. '<video class="clipisode-intro-video"'
				. ' playsinline'
				. ' webkit-playsinline'
				. ' muted'
				. ' preload="auto"'
				. ' disableremoteplayback'
				. ' disablepictureinpicture'
				. ' data-wp-on--play="actions.onIntroVideoPlay"'
				. ' data-wp-on--pause="actions.onIntroVideoPause"'
				. ' data-wp-on--ended="actions.onIntroVideoEnded">'
				. '<source src="' . esc_url( $intro_video_url ) . '" type="video/mp4">'
				. '</video>'
				. '<button type="button"'
				. ' class="clipisode-intro-play-button"'
				. ' aria-label="' . esc_attr__( 'Play intro video', 'clipisode' ) . '"'
				. ' data-wp-class--is-hidden="state.videoPlaying">'
				. $play_svg
				. '</button>'
				. '</div>';

			// Mount the video layer INSIDE the intro root group so stacking
			// order is deterministic: video (z1) under scrims (z3). The
			// earlier sibling mount could swallow scrim taps on iOS/Chrome.
			$with_intro_video = preg_replace(
				'#(<div\b[^>]*class="[^"]*\bclipisode-intro-root\b[^"]*"[^>]*>)#',
				'$1' . $intro_video_html,
				$rendered_content,
				1,
				$intro_video_count
			);
			if ( is_string( $with_intro_video ) && $intro_video_count > 0 ) {
				$rendered_content = $with_intro_video;
			} else {
				// Defensive fallback: never drop the intro video if the
				// template markup shape changes unexpectedly.
				$rendered_content .= $intro_video_html;
			}
		}
		// For the Name screen we split the rendered block content at the
		// submit-button boundary, injecting the PHP form widgets between
		// the heading Group and the button. name.html has no slot Groups
		// (empty core/group blocks trigger Gutenberg variation pickers);
		// instead we split on the first <div> that carries the class
		// "clipisode-name-submit-wrap". Everything before that div gets
		// the file-info, progress, and input inserted after it; the
		// error paragraph goes after the button. The whole lot is wrapped
		// in the <form> so Enter-key submission works via
		// data-wp-on--submit on the form element.
		if ( $st === 'name' ) {
			$fileinfo_html = '<p class="clipisode-name-fileinfo"'
				. ' data-wp-bind--hidden="!state.showFileInfo">'
				. esc_html__( 'Replying with', 'clipisode' ) . ' '
				. '<span data-wp-text="state.replyFileName"></span>'
				. '</p>';

			$progress_html = '<div class="' . esc_attr( $name_progress_class ) . '"'
				. $name_progress_style_attr
				. ' data-wp-bind--hidden="!state.showProgress"'
				. ' role="progressbar"'
				. ' aria-label="' . esc_attr__( 'Upload progress', 'clipisode' ) . '">'
				. '<div class="clipisode-name-progress-bar"'
				. ' data-wp-style--width="state.uploadPercentCss"></div>'
				. '</div>'
				. '<p class="clipisode-name-progress-label"'
				. ' data-wp-text="state.uploadProgressLabel"'
				. ' data-wp-bind--hidden="!state.showProgress"></p>';

			$name_input_placeholder = __( 'Your name', 'clipisode' );
			$name_input_inline     = '';
			$name_field_label_left  = '';
			$name_field_label_right = '';
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-name-field-label-left-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_name_label_left
				)
			) {
				$candidate_label_left = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_name_label_left[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				if ( $candidate_label_left !== '' ) {
					$name_field_label_left = $candidate_label_left;
				}
			}
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-name-field-label-right-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_name_label_right
				)
			) {
				$candidate_label_right = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_name_label_right[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				if ( $candidate_label_right !== '' ) {
					$name_field_label_right = $candidate_label_right;
				}
			}
			$name_field_label_left  = Clipisode_Post_Types::apply_flow_placeholders( $name_field_label_left );
			$name_field_label_right = Clipisode_Post_Types::apply_flow_placeholders( $name_field_label_right );
			$name_show_handle = false;
			if (
				preg_match(
					'#class="[^"]*\bclipisode-name-handle-input-preview\b[^"]*"#i',
					$rendered_content
				)
			) {
				$name_show_handle = true;
			}
			$handle_input_placeholder = __( '@yourhandle', 'clipisode' );
			$handle_input_inline      = '';
			$handle_label_left        = '';
			$handle_label_right       = '';
			$handle_help_text         = '';
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-name-handle-label-left-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_handle_label_left
				)
			) {
				$candidate_handle_label_left = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_handle_label_left[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				if ( $candidate_handle_label_left !== '' ) {
					$handle_label_left = $candidate_handle_label_left;
				}
			}
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-name-handle-label-right-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_handle_label_right
				)
			) {
				$candidate_handle_label_right = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_handle_label_right[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				$handle_label_right = $candidate_handle_label_right;
			}
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-name-handle-input-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_handle_placeholder
				)
			) {
				$candidate_handle_placeholder = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_handle_placeholder[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				if ( $candidate_handle_placeholder !== '' ) {
					$handle_input_placeholder = $candidate_handle_placeholder;
				}
			}
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-name-handle-input-preview\b[^"]*"[^>]*style="([^"]*)"[^>]*>#i',
					$rendered_content,
					$m_handle_input_style
				)
			) {
				$raw_handle_style = html_entity_decode(
					(string) $m_handle_input_style[1],
					ENT_QUOTES | ENT_HTML5,
					'UTF-8'
				);
				$safe_handle_style = function_exists( 'safecss_filter_attr' )
					? safecss_filter_attr( $raw_handle_style )
					: wp_strip_all_tags( $raw_handle_style );
				if ( trim( $safe_handle_style ) !== '' ) {
					$handle_input_inline = ' style="' . esc_attr( $safe_handle_style ) . '"';
				}
			}
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-name-handle-instructions-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_handle_help
				)
			) {
				$candidate_handle_help = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_handle_help[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				if ( $candidate_handle_help !== '' ) {
					$handle_help_text = $candidate_handle_help;
				}
			}
			$handle_label_left        = Clipisode_Post_Types::apply_flow_placeholders( $handle_label_left );
			$handle_label_right       = Clipisode_Post_Types::apply_flow_placeholders( $handle_label_right );
			$handle_input_placeholder = Clipisode_Post_Types::apply_flow_placeholders( $handle_input_placeholder );
			$handle_help_text         = Clipisode_Post_Types::apply_flow_placeholders( $handle_help_text );
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-name-input-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_name_placeholder
				)
			) {
				$candidate_placeholder = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_name_placeholder[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				if ( $candidate_placeholder !== '' ) {
					$name_input_placeholder = $candidate_placeholder;
				}
			}
			$name_input_placeholder = Clipisode_Post_Types::apply_flow_placeholders( $name_input_placeholder );
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-name-input-preview\b[^"]*"[^>]*style="([^"]*)"[^>]*>#i',
					$rendered_content,
					$m_name_input_style
				)
			) {
				$raw_style = html_entity_decode(
					(string) $m_name_input_style[1],
					ENT_QUOTES | ENT_HTML5,
					'UTF-8'
				);
				$safe_style = function_exists( 'safecss_filter_attr' )
					? safecss_filter_attr( $raw_style )
					: wp_strip_all_tags( $raw_style );
				if ( trim( $safe_style ) !== '' ) {
					$name_input_inline = ' style="' . esc_attr( $safe_style ) . '"';
				}
			}

			$name_input_id = 'clipisode-name-input';
			$name_label_html = '';
			if ( $name_field_label_left !== '' || $name_field_label_right !== '' ) {
				$name_label_html = '<div class="clipisode-field-label-row">';
				if ( $name_field_label_left !== '' ) {
					$name_label_html .= '<label class="clipisode-field-label clipisode-field-label-left" for="' . esc_attr( $name_input_id ) . '">'
						. esc_html( $name_field_label_left ) . '</label>';
				}
				if ( $name_field_label_right !== '' ) {
					$name_label_html .= '<span class="clipisode-field-label clipisode-field-label-right">'
						. esc_html( $name_field_label_right ) . '</span>';
				}
				$name_label_html .= '</div>';
			}

			$handle_input_id   = 'clipisode-handle-input';
			$handle_label_html = '';
			if ( $name_show_handle && ( $handle_label_left !== '' || $handle_label_right !== '' ) ) {
				$handle_label_html = '<div class="clipisode-field-label-row">';
				if ( $handle_label_left !== '' ) {
					$handle_label_html .= '<label class="clipisode-field-label clipisode-field-label-left" for="' . esc_attr( $handle_input_id ) . '">'
						. esc_html( $handle_label_left ) . '</label>';
				}
				if ( $handle_label_right !== '' ) {
					$handle_label_html .= '<span class="clipisode-field-label clipisode-field-label-right">'
						. esc_html( $handle_label_right ) . '</span>';
				}
				$handle_label_html .= '</div>';
			}
			$handle_help_html = '';
			if ( $name_show_handle && $handle_help_text !== '' ) {
				$handle_help_html = '<p class="clipisode-name-handle-instructions">'
					. esc_html( $handle_help_text )
					. '</p>';
			}

			$input_html = '<input type="text" class="clipisode-name-input"'
				. $name_input_inline
				. ' id="' . esc_attr( $name_input_id ) . '"'
				. ' name="name"'
				. ' placeholder="' . esc_attr( $name_input_placeholder ) . '"'
				. ' autocomplete="given-name"'
				. ' autocapitalize="words"'
				. ' maxlength="120"'
				. ' data-wp-on--input="actions.onNameInput"'
				. ' data-wp-bind--value="state.replyName"'
				. ' />';
			$handle_input_html = '';
			if ( $name_show_handle ) {
				$handle_input_html = '<input type="text" class="clipisode-name-handle-input"'
					. $handle_input_inline
					. ' id="' . esc_attr( $handle_input_id ) . '"'
					. ' name="social_handle"'
					. ' placeholder="' . esc_attr( $handle_input_placeholder ) . '"'
					. ' autocapitalize="off"'
					. ' autocorrect="off"'
					. ' maxlength="120"'
					. ' data-wp-on--input="actions.onHandleInput"'
					. ' data-wp-bind--value="state.replyHandle"'
					. ' />';
			}
			$name_field_html = '<div class="clipisode-field-control">'
				. $name_label_html
				. $input_html
				. '</div>';
			$handle_field_html = '';
			if ( $name_show_handle ) {
				$handle_field_html = '<div class="clipisode-name-handle-field"'
					. ' data-wp-bind--hidden="!state.showHandleFields">'
					. $handle_help_html
					. '<div class="clipisode-field-control">'
					. $handle_label_html
					. $handle_input_html
					. '</div>'
					. '</div>';
			}

			$error_html = '<p class="clipisode-name-error"'
				. ' data-wp-text="state.errorMessage"'
				. ' data-wp-bind--hidden="!state.showError"'
				. ' role="alert"></p>';

			// Split at the opening <div> of .clipisode-name-submit-wrap.
			// preg_split with PREG_SPLIT_DELIM_CAPTURE returns 3 parts:
			//   [0] everything before the opening tag,
			//   [1] the captured opening tag itself,
			//   [2] everything after it (the button innards + closing tag).
			$parts = preg_split(
				'#(<div[^>]*class="[^"]*\bclipisode-name-submit-wrap\b[^"]*"[^>]*>)#',
				$rendered_content,
				2,
				PREG_SPLIT_DELIM_CAPTURE
			);

			$before_button  = $parts[0] ?? $rendered_content;
			$button_open    = $parts[1] ?? '';
			$button_rest    = $parts[2] ?? '';
			?>
			<form
				class="clipisode-name-form"
				data-wp-on--submit="actions.submitReply"
				novalidate
			>
				<?php
				echo $before_button;
				echo $fileinfo_html . $progress_html . $name_field_html . $handle_field_html;
				echo $button_open . $button_rest;
				echo $error_html;
				?>
			</form>
			<?php
		} elseif ( $st === 'email' ) {
			$email_input_placeholder = __( 'you@example.com', 'clipisode' );
			$email_input_inline      = '';
			$email_label_left        = '';
			$email_label_right       = '';
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-email-field-label-left-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_email_label_left
				)
			) {
				$candidate_email_label_left = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_email_label_left[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				if ( $candidate_email_label_left !== '' ) {
					$email_label_left = $candidate_email_label_left;
				}
			}
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-email-field-label-right-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_email_label_right
				)
			) {
				$candidate_email_label_right = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_email_label_right[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				$email_label_right = $candidate_email_label_right;
			}
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-email-input-preview\b[^"]*"[^>]*>(.*?)</p>#is',
					$rendered_content,
					$m_email_placeholder
				)
			) {
				$candidate_email_placeholder = trim(
					wp_strip_all_tags(
						html_entity_decode(
							(string) $m_email_placeholder[1],
							ENT_QUOTES | ENT_HTML5,
							'UTF-8'
						)
					)
				);
				if ( $candidate_email_placeholder !== '' ) {
					$email_input_placeholder = $candidate_email_placeholder;
				}
			}
			if (
				preg_match(
					'#<p[^>]*class="[^"]*\bclipisode-email-input-preview\b[^"]*"[^>]*style="([^"]*)"[^>]*>#i',
					$rendered_content,
					$m_email_input_style
				)
			) {
				$raw_email_style = html_entity_decode(
					(string) $m_email_input_style[1],
					ENT_QUOTES | ENT_HTML5,
					'UTF-8'
				);
				$safe_email_style = function_exists( 'safecss_filter_attr' )
					? safecss_filter_attr( $raw_email_style )
					: wp_strip_all_tags( $raw_email_style );
				if ( trim( $safe_email_style ) !== '' ) {
					$email_input_inline = ' style="' . esc_attr( $safe_email_style ) . '"';
				}
			}
			$email_label_left        = Clipisode_Post_Types::apply_flow_placeholders( $email_label_left );
			$email_label_right       = Clipisode_Post_Types::apply_flow_placeholders( $email_label_right );
			$email_input_placeholder = Clipisode_Post_Types::apply_flow_placeholders( $email_input_placeholder );

			$email_input_id = 'clipisode-email-input';
			$email_label_html = '';
			if ( $email_label_left !== '' || $email_label_right !== '' ) {
				$email_label_html = '<div class="clipisode-field-label-row">';
				if ( $email_label_left !== '' ) {
					$email_label_html .= '<label class="clipisode-field-label clipisode-field-label-left" for="' . esc_attr( $email_input_id ) . '">'
						. esc_html( $email_label_left ) . '</label>';
				}
				if ( $email_label_right !== '' ) {
					$email_label_html .= '<span class="clipisode-field-label clipisode-field-label-right">'
						. esc_html( $email_label_right ) . '</span>';
				}
				$email_label_html .= '</div>';
			}
			$email_input_html = '<input type="email" class="clipisode-email-input"'
				. $email_input_inline
				. ' id="' . esc_attr( $email_input_id ) . '"'
				. ' name="email"'
				. ' placeholder="' . esc_attr( $email_input_placeholder ) . '"'
				. ' autocomplete="email"'
				. ' inputmode="email"'
				. ' maxlength="190"'
				. ' data-wp-on--input="actions.onEmailInput"'
				. ' data-wp-bind--value="state.replyEmail"'
				. ' />';
			$email_field_html = '<div class="clipisode-field-control">'
				. $email_label_html
				. $email_input_html
				. '</div>';
			$email_error_html = '<p class="clipisode-email-error"'
				. ' data-wp-text="state.emailError"'
				. ' data-wp-bind--hidden="!state.showEmailError"'
				. ' role="alert"></p>';

			$rendered_content = preg_replace_callback(
				'#(<div\b[^>]*\bclipisode-email-submit\b[^>]*>\s*)<a\b([^>]*)>#i',
				static function( array $m ): string {
					$attrs = $m[2];
					if ( stripos( $attrs, 'data-wp-on--click=' ) === false ) {
						$attrs .= ' data-wp-on--click="actions.submitEmail"';
					}
					$attrs = preg_replace( '/\shref=([\'"]).*?\1/i', '', $attrs );
					if ( stripos( $attrs, 'href=' ) === false ) {
						$attrs .= ' href="#email-submit"';
					}
					$attrs = trim( preg_replace( '/\s+/', ' ', $attrs ) );
					return $m[1] . '<a ' . $attrs . '>';
				},
				$rendered_content,
				1
			);
			if ( ! is_string( $rendered_content ) ) {
				$rendered_content = '';
			}
			$rendered_content = preg_replace_callback(
				'#(<p\b[^>]*class="[^"]*\bclipisode-email-skip\b[^"]*"[^>]*>\s*)<a\b([^>]*)>#i',
				static function( array $m ): string {
					$attrs = $m[2];
					if ( stripos( $attrs, 'data-wp-on--click=' ) === false ) {
						$attrs .= ' data-wp-on--click="actions.skipEmail"';
					}
					$attrs = preg_replace( '/\shref=([\'"]).*?\1/i', '', $attrs );
					$attrs .= ' href="#skip-email"';
					$attrs = trim( preg_replace( '/\s+/', ' ', $attrs ) );
					return $m[1] . '<a ' . $attrs . '>';
				},
				$rendered_content,
				1
			);
			if ( ! is_string( $rendered_content ) ) {
				$rendered_content = '';
			}

			$email_parts = preg_split(
				'#(<div[^>]*class="[^"]*\bclipisode-email-submit-wrap\b[^"]*"[^>]*>)#',
				$rendered_content,
				2,
				PREG_SPLIT_DELIM_CAPTURE
			);
			$email_before_submit = $email_parts[0] ?? $rendered_content;
			$email_submit_open   = $email_parts[1] ?? '';
			$email_submit_rest   = $email_parts[2] ?? '';
			?>
			<form
				class="clipisode-email-form"
				data-wp-on--submit="actions.submitEmail"
				novalidate
			>
				<?php
				echo $email_before_submit;
				echo $email_field_html;
				echo $email_submit_open . $email_submit_rest;
				echo $email_error_html;
				?>
			</form>
			<?php
		} else {
			echo $rendered_content;
		}
		?>

		<?php
		// Intro video layer is injected into $rendered_content above so it
		// mounts inside .clipisode-intro-root (stable z-index ordering with
		// scrims / buttons) instead of as a sibling overlay.
		?>

		<?php
		// Name-screen form is now emitted by the rendered-content branch
		// above so the editor-authored blocks (heading + instructions +
		// the Pattern-B submit button) live INSIDE the form. The PHP-
		// rendered widgets (file info, progress bar, name input, error)
		// follow the rendered content; CSS .clipisode-name-form rules
		// use `order` to interleave them visually so the input lands
		// between the instructions and the button.
		//
		// Why the form moved out of this section: the submit button is
		// now an editor block (.clipisode-name-submit), so for it to
		// participate in the same <form>'s submit handler the form has
		// to wrap the rendered block content rather than sit alongside.
		?>
	</section>
	<?php endif; ?>
<?php endforeach; ?>

<div class="clipisode-terms-modal" data-wp-bind--hidden="!state.termsOpen" hidden>
	<button
		type="button"
		class="clipisode-terms-close"
		aria-label="<?php esc_attr_e( 'Close terms', 'clipisode' ); ?>"
		data-wp-on--click="actions.closeTerms"
	><?php echo $close_svg; // Inline SVG markup; no user data. ?></button>
	<div class="clipisode-terms-content"><?php echo $terms_html; // KSES is applied by the_content filter chain. ?></div>
</div>

<?php
// Inline, dependency-free bootstrap for the intro screen. Runs even when
// the IAPI module fails to load (e.g. iOS Safari without import-map
// support, or any future module-pipeline regression). Two jobs:
//
//   1. First-frame poster. The <video> ships paused (no autoplay) so
//      it doesn't surprise the guest with silent playback. We seek to
//      ~0.05s on loadedmetadata, which on most browsers forces a
//      decode of the first GOP and paints a real frame on the
//      compositor surface. We listen on both loadedmetadata and
//      loadeddata because browsers vary on which one fires first with
//      a usable readyState. Idempotent — the seek only runs while
//      currentTime is still essentially 0.
//
//      Some Android Chrome / GPU combinations don't paint the seeked
//      frame until the user actually taps play. That's a tolerable
//      degradation: the gradient + centre play button still read as
//      a clear "tap to start" UX. We considered a muted-autoplay-then-
//      pause workaround for that; it produced a perceived "loop" on
//      iPhone (silent autoplay → guest taps → audible playback → ends
//      → guest reflexively taps again → audible playback again) and
//      was abandoned.
//
//   2. Record/Upload fallback. The label→input pairing always opens the
//      file picker natively, so this fallback only has to move to the
//      Name screen once a file is chosen. When IAPI IS alive, its
//      data-wp-on--change handler fires first, stamps
//      data-clipisode-iapi-handled on the input, and this fallback
//      no-ops. Race-safe in either firing order.
?>
<script>
(function () {
	var v = document.querySelector( '.clipisode-intro-video' );
	if ( v ) {
		var seek = function () {
			try {
				if ( v.paused && v.currentTime < 0.04 ) {
					v.currentTime = 0.05;
				}
			} catch ( err ) {
				/* iOS sometimes throws if seek runs before the buffer
				 * is ready; the loadeddata handler will retry. */
			}
		};
		if ( v.readyState >= 1 ) {
			seek();
		}
		v.addEventListener( 'loadedmetadata', seek, { once: true } );
		v.addEventListener( 'loadeddata', seek, { once: true } );

		/* Codec / decoder diagnostic. The most common Android-Chrome
		 * "audio plays but no picture" cause is a video container that
		 * Android can't hardware-decode (HEVC from Mac screen capture,
		 * VP9 via certain transcoders, etc.). The browser silently
		 * routes audio through, paints nothing, and never throws a
		 * visible error. Logging the readable codec hints + any
		 * MediaError to console gives us a real signal next time we
		 * remote-debug a phone. Cheap, non-blocking. */
		v.addEventListener( 'error', function () {
			try {
				var err = v.error || {};
				console.warn( '[clipisode] intro video error',
					'code=' + ( err.code || 'n/a' ),
					'msg=' + ( err.message || 'n/a' ),
					'src=' + ( v.currentSrc || 'n/a' )
				);
			} catch ( e ) { /* noop */ }
		} );
		v.addEventListener( 'loadedmetadata', function () {
			try {
				console.info( '[clipisode] intro video loaded',
					'w=' + ( v.videoWidth || 0 ),
					'h=' + ( v.videoHeight || 0 ),
					'dur=' + ( v.duration || 0 ).toFixed( 2 ),
					'src=' + ( v.currentSrc || 'n/a' )
				);
			} catch ( e ) { /* noop */ }
		}, { once: true } );
	}

	var HANDLED_ATTR = 'data-clipisode-iapi-handled';
	function onPicked( e ) {
		var input = e && e.target;
		if ( ! input || input.hasAttribute( HANDLED_ATTR ) ) {
			return;
		}
		var file = input.files && input.files[ 0 ];
		if ( ! file ) {
			return;
		}
		window.__clipisodeReplyFile = file;
		// Mirror the IAPI active-screen pattern: toggle the .is-active
		// class instead of the hidden attribute so the same CSS
		// crossfade applies even when this fallback runs (IAPI dead).
		var screens = document.querySelectorAll( '.clipisode-flow-screen' );
		for ( var i = 0; i < screens.length; i++ ) {
			screens[ i ].classList.remove( 'is-active' );
		}
		var target = document.querySelector( '.clipisode-flow-screen-name' );
		if ( target ) {
			target.classList.add( 'is-active' );
		}
	}
	[ 'clipisode-record-input', 'clipisode-upload-input' ].forEach( function ( id ) {
		var el = document.getElementById( id );
		if ( el ) {
			el.addEventListener( 'change', onPicked );
		}
	} );

	/* Desktop intro video: tap-to-play with a custom overlay button.
	 * The desktop layout is light-theme and visually fixed, so we
	 * keep this fully outside the IAPI store — a vanilla play / pause
	 * toggle with no shared state. The overlay <button> sits centred
	 * over .clipisode-introd-video; clicking either of them or the
	 * surrounding video-mount toggles play / pause. The overlay gets
	 * .is-hidden while the video is playing and reappears on `ended`
	 * so a guest can replay without hunting for browser controls. */
	var dv = document.querySelector( '.clipisode-introd-video' );
	var dp = document.querySelector( '.clipisode-introd-video-play' );
	if ( dv && dp ) {
		var togglePlay = function ( e ) {
			if ( e && typeof e.preventDefault === 'function' ) {
				e.preventDefault();
			}
			if ( dv.paused ) {
				var p = dv.play();
				dp.classList.add( 'is-hidden' );
				if ( p && typeof p.catch === 'function' ) {
					p.catch( function () {
						dp.classList.remove( 'is-hidden' );
					} );
				}
			} else {
				dv.pause();
				dp.classList.remove( 'is-hidden' );
			}
		};
		dp.addEventListener( 'click', togglePlay );
		dv.addEventListener( 'click', togglePlay );
		dv.addEventListener( 'ended', function () {
			dp.classList.remove( 'is-hidden' );
		} );
		dv.addEventListener( 'pause', function () {
			dp.classList.remove( 'is-hidden' );
		} );
		dv.addEventListener( 'play', function () {
			dp.classList.add( 'is-hidden' );
		} );
	}

	/* Desktop QR. The slot div carries the URL to encode on
	 * data-clipisode-qr-url; we pass it into window.clipisodeQr.toCanvas
	 * the moment the bundle is ready. The bundle dispatches a
	 * 'clipisode-qr-ready' CustomEvent on window when it loads, but it
	 * may have already fired by the time this inline IIFE runs (e.g.
	 * cached defer script), so we also do an immediate check.
	 *
	 * Why no IAPI integration: the QR is purely a derived value of
	 * the current page URL. It never needs to react to state changes,
	 * never has hover/click behaviour, and shouldn't be re-rendered
	 * during screen transitions. Keeping it on a vanilla event
	 * listener avoids both the WP 6.9 hydration race and the cost of
	 * threading a third script module into the IAPI graph. */
	var qrSlot = document.querySelector( '.clipisode-introd-qr[data-clipisode-qr-url]' );
	if ( qrSlot ) {
		var renderQr = function () {
			if ( ! window.clipisodeQr ) {
				return false;
			}
			var url = qrSlot.getAttribute( 'data-clipisode-qr-url' );
			if ( ! url ) {
				return false;
			}
			window.clipisodeQr.toCanvas( qrSlot, url, {
				width: 164,
				margin: 1,
				color: { dark: '#0a1d4a', light: '#ffffff' },
			} );
			return true;
		};
		if ( ! renderQr() ) {
			window.addEventListener( 'clipisode-qr-ready', renderQr, { once: true } );
			// Belt-and-braces: poll briefly in case the CustomEvent
			// constructor failed in the bundle (very old WebViews).
			var tries = 0;
			var poll = setInterval( function () {
				if ( renderQr() || ++tries > 20 ) {
					clearInterval( poll );
					if ( tries > 20 && typeof console !== 'undefined' ) {
						console.error(
							'[clipisode] QR bundle never loaded — did you run `npm run build`?'
						);
					}
				}
			}, 150 );
		}
	}
} )();
</script>

<?php if ( $clipisode_flow_show_debug ) : ?>
<aside class="clipisode-flow-debug" aria-label="Debug">
	<div>
		slug: <code data-wp-text="state.slug"></code>
		&nbsp;screen: <code data-wp-text="state.screen"></code>
		&nbsp;path: <code data-wp-text="state.path"></code>
		&nbsp;inits: <code data-wp-text="state.visited"></code>
		&nbsp;terms: <code data-wp-text="state.termsOpen"></code>
		&nbsp;file: <code data-wp-text="state.replyFileName"></code>
	</div>
	<div>
		<?php foreach ( Clipisode_Post_Types::SCREEN_TYPES as $st ) : ?>
			<button
				type="button"
				data-wp-context='<?php echo esc_attr( wp_json_encode( [ 'target' => $st ] ) ); ?>'
				data-wp-on--click="actions.goTo"
			><?php echo esc_html( str_replace( '_', '-', $st ) ); ?></button>
		<?php endforeach; ?>
		<button type="button" data-wp-on--click="actions.openTerms">open terms</button>
	</div>
</aside>
<?php endif; ?>
</div>
<?php
Clipisode_Post_Types::reset_flow_intro_video_url();
Clipisode_Post_Types::reset_flow_topic_context();
wp_footer();
?>
</body>
</html>
