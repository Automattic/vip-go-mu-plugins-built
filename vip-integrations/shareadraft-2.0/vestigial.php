<?php
/**
 * Links made with Share a Draft 1.x.
 *
 * Share a Draft 1.x kept every shared draft in one option, keyed by the ID of
 * the user who shared it, and opened a draft for anyone whose URL carried
 * `?shareadraft=<key>`. Those links keep working until they expire, and each
 * owner can review and delete theirs on a legacy screen under Posts. Nothing
 * here extends a link or makes a new one; that is the block editor's job now.
 *
 * Everything for this lives in this file and depends on nothing else in the
 * plugin, so removing it in 2.1.0 means deleting this file and the two lines
 * in shareadraft.php that load it.
 *
 * @package shareadraft
 */

namespace Automattic\ShareADraft\Vestigial;

use WP_Post;
use WP_Query;

/** The option 1.x stored its shares in: [ user_id => [ 'shared' => list of shares ] ]. */
const OPTION = 'ShareADraft_options';

/** The query variable a 1.x link carries its key in. */
const QUERY_VAR = 'shareadraft';

/** The 1.x admin page slug, kept so existing bookmarks still land on the screen. */
const PAGE = 'shareadraft/shareadraft.php';

/**
 * Hook in only when 1.x left shares behind, so a site that never used it pays
 * nothing beyond reading an autoloaded option.
 */
function bootstrap(): void {
	if ( [] === shares() ) {
		return;
	}

	if ( is_admin() ) {
		add_action( 'admin_init', __NAMESPACE__ . '\\prune_expired' );
		add_action( 'admin_init', __NAMESPACE__ . '\\maybe_delete' );
		add_action( 'admin_menu', __NAMESPACE__ . '\\register_page' );
		return;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Bearer link key, checked against stored shares; read-only.
	if ( isset( $_GET[ QUERY_VAR ] ) ) {
		add_filter( 'posts_results', __NAMESPACE__ . '\\unlock_shared_draft', 10, 2 );
		add_filter( 'the_posts', __NAMESPACE__ . '\\restore_shared_draft', 10, 2 );
	}
}

/**
 * Every well-formed share, grouped by the user who made it. Users left with no
 * shares are dropped: 1.x wrote an empty entry for anyone who opened wp-admin.
 *
 * @return array<int, list<array{id: int, expires: int, key: string}>>
 */
function shares(): array {
	$stored = get_option( OPTION );
	if ( ! is_array( $stored ) ) {
		return [];
	}

	$all = [];
	foreach ( $stored as $user_id => $options ) {
		if ( ! is_array( $options ) || ! isset( $options['shared'] ) || ! is_array( $options['shared'] ) ) {
			continue;
		}

		$shares = [];
		/** @var mixed $share */
		foreach ( $options['shared'] as $share ) {
			if ( ! is_array( $share ) || ! isset( $share['id'], $share['expires'], $share['key'] ) || ! is_numeric( $share['id'] ) || ! is_numeric( $share['expires'] ) || ! is_scalar( $share['key'] ) ) {
				continue;
			}

			$shares[] = [
				'id'      => (int) $share['id'],
				'expires' => (int) $share['expires'],
				'key'     => (string) $share['key'],
			];
		}

		if ( [] !== $shares ) {
			$all[ (int) $user_id ] = $shares;
		}
	}

	return $all;
}

/**
 * Store the shares back in the 1.x shape, or delete the option once none are
 * left, which also switches this file off for good.
 *
 * @param array<int, list<array{id: int, expires: int, key: string}>> $all Shares by user.
 */
function save( array $all ): void {
	$all = array_filter( $all );

	if ( [] === $all ) {
		delete_option( OPTION );
		return;
	}

	$stored = [];
	foreach ( $all as $user_id => $shares ) {
		$stored[ $user_id ] = [ 'shared' => $shares ];
	}

	update_option( OPTION, $stored );
}

/**
 * A share's post, provided the share is still live and the post still exists.
 *
 * @param array{id: int, expires: int, key: string} $share A share.
 */
function live_post( array $share ): ?WP_Post {
	if ( $share['expires'] < time() ) {
		return null;
	}

	$post = get_post( $share['id'] );

	return $post instanceof WP_Post ? $post : null;
}

/**
 * Drop expired shares on an admin request, writing only when something changed.
 * Orphans cost a post lookup each, so the legacy screen prunes those itself.
 */
function prune_expired(): void {
	$all  = shares();
	$now  = time();
	$kept = array_map(
		static fn ( array $shares ): array => array_values(
			array_filter( $shares, static fn ( array $share ): bool => $share['expires'] >= $now )
		),
		$all
	);

	if ( $kept !== $all ) {
		save( $kept );
	}
}

/**
 * Remember the draft a valid 1.x link names, before WP_Query hides it from a
 * logged-out visitor; restore_shared_draft() puts it back afterwards.
 *
 * This is how 1.x did it. The post keeps its real status, so WordPress does not
 * treat it as published: marking it published instead would send the visitor
 * through a canonical redirect to a permalink that a draft does not have.
 *
 * @param mixed    $posts Posts loaded by the query (array of WP_Post on success).
 * @param WP_Query $query The query being run.
 * @return mixed
 */
function unlock_shared_draft( $posts, WP_Query $query ) {
	if ( ! $query->is_main_query() || ! is_array( $posts ) || 1 !== count( $posts ) || ! $posts[0] instanceof WP_Post ) {
		return $posts;
	}

	$post   = $posts[0];
	$status = get_post_status_object( $post->post_status );
	if ( null !== $status && $status->public ) {
		return $posts;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Bearer link key, checked against stored shares; read-only.
	$key = isset( $_GET[ QUERY_VAR ] ) && is_scalar( $_GET[ QUERY_VAR ] ) ? sanitize_text_field( wp_unslash( (string) $_GET[ QUERY_VAR ] ) ) : '';
	if ( '' === $key ) {
		return $posts;
	}

	foreach ( shares() as $shares ) {
		foreach ( $shares as $share ) {
			if ( $share['id'] === (int) $post->ID && $share['expires'] >= time() && hash_equals( $share['key'], $key ) ) {
				send_headers();
				shared_draft( $post );
				return $posts;
			}
		}
	}

	return $posts;
}

/**
 * Give the main query back the draft remembered by unlock_shared_draft(), once
 * WP_Query has filtered it out for a logged-out visitor.
 *
 * @param mixed    $posts Posts the query is about to return.
 * @param WP_Query $query The query being run.
 * @return mixed
 */
function restore_shared_draft( $posts, WP_Query $query ) {
	if ( ! $query->is_main_query() ) {
		return $posts;
	}

	$post = shared_draft();
	shared_draft( null );

	return [] === $posts && null !== $post ? [ $post ] : $posts;
}

/**
 * The draft a valid link unlocked for this request, carried from posts_results
 * to the_posts. Pass a post (or null) to set it.
 *
 * @param WP_Post|null $post The post to remember.
 */
function shared_draft( ?WP_Post $post = null ): ?WP_Post {
	/** @var WP_Post|null $remembered */
	static $remembered = null;

	if ( func_num_args() > 0 ) {
		$remembered = $post;
	}

	return $remembered;
}

/**
 * Keep a shared draft out of caches and search engines.
 */
function send_headers(): void {
	add_filter( 'wp_robots', 'wp_robots_no_robots' );

	if ( headers_sent() ) {
		return;
	}

	nocache_headers();
	header( 'X-Robots-Tag: noindex, nofollow, noarchive, nosnippet', true );
	header( 'Referrer-Policy: no-referrer', true );
}

/**
 * The current user's live shares, with their posts.
 *
 * @return list<array{share: array{id: int, expires: int, key: string}, post: WP_Post}>
 */
function current_user_shares(): array {
	$rows = [];
	foreach ( shares()[ get_current_user_id() ] ?? [] as $share ) {
		$post = live_post( $share );
		if ( null !== $post ) {
			$rows[] = [
				'share' => $share,
				'post'  => $post,
			];
		}
	}

	return $rows;
}

/**
 * Show the legacy screen only to someone who still has a live 1.x link.
 */
function register_page(): void {
	if ( [] === current_user_shares() ) {
		return;
	}

	$hook = add_submenu_page(
		'edit.php',
		__( 'Share a Draft (Old)', 'shareadraft' ),
		__( 'Share a Draft (Old)', 'shareadraft' ),
		'edit_posts',
		PAGE,
		__NAMESPACE__ . '\\render_page'
	);

	if ( false !== $hook ) {
		add_action( 'load-' . $hook, __NAMESPACE__ . '\\prune_orphans' );
		add_action( 'load-' . $hook, __NAMESPACE__ . '\\enqueue_assets' );
	}
}

/**
 * Drop shares whose post has since been deleted.
 */
function prune_orphans(): void {
	$all  = shares();
	$kept = array_map(
		static fn ( array $shares ): array => array_values(
			array_filter( $shares, static fn ( array $share ): bool => get_post( $share['id'] ) instanceof WP_Post )
		),
		$all
	);

	if ( $kept !== $all ) {
		save( $kept );
	}
}

/**
 * Handle a Delete link from the legacy screen. Runs on admin_init, before the
 * menu exists, so deleting someone's last link can send them elsewhere rather
 * than to a screen that is no longer registered.
 */
function maybe_delete(): void {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Routing only; the nonce is checked below before anything changes.
	if ( ! isset( $_GET['page'], $_GET['action'], $_GET['key'] ) || PAGE !== $_GET['page'] || 'delete' !== $_GET['action'] || ! is_string( $_GET['key'] ) ) {
		return;
	}

	check_admin_referer( 'shareadraft-delete' );

	delete_share( is_string( $_GET['key'] ) ? sanitize_text_field( wp_unslash( $_GET['key'] ) ) : '' );

	$destination = [] === current_user_shares()
		? admin_url( 'edit.php' )
		: add_query_arg(
			[
				'page'    => PAGE,
				'deleted' => 1,
			],
			admin_url( 'edit.php' )
		);

	wp_safe_redirect( $destination );
	exit;
}

/**
 * Delete one of the current user's shares by its key. A key that is not theirs
 * is ignored, so nobody can delete another user's link.
 *
 * @param string $key The share's key.
 * @return bool Whether a share was deleted.
 */
function delete_share( string $key ): bool {
	$user_id = get_current_user_id();
	$all     = shares();

	foreach ( $all[ $user_id ] ?? [] as $index => $share ) {
		if ( ! hash_equals( $share['key'], $key ) ) {
			continue;
		}

		if ( null !== get_post( $share['id'] ) && ! current_user_can( 'edit_post', $share['id'] ) ) {
			wp_die( esc_html__( 'Sorry, you are not allowed to delete links to posts you cannot edit.', 'shareadraft' ), 403 );
		}

		unset( $all[ $user_id ][ $index ] );
		$all[ $user_id ] = array_values( $all[ $user_id ] );
		save( $all ); // @phpstan-ignore argument.type (array_values() has just re-indexed this user's shares into a list.)

		return true;
	}

	return false;
}

/**
 * The copy-to-clipboard button's script, announced to screen readers.
 */
function enqueue_assets(): void {
	wp_enqueue_script( 'wp-a11y' );
	wp_add_inline_script(
		'wp-a11y',
		sprintf(
			'document.addEventListener( "click", function ( event ) {
				var button = event.target.closest( ".shareadraft-old-copy" );
				if ( ! button || ! navigator.clipboard ) {
					return;
				}
				navigator.clipboard.writeText( button.dataset.url ).then( function () {
					wp.a11y.speak( %s );
					button.textContent = %s;
				} );
			} );',
			(string) wp_json_encode( __( 'Link copied to the clipboard.', 'shareadraft' ) ),
			(string) wp_json_encode( __( 'Copied', 'shareadraft' ) )
		)
	);
}

/**
 * The legacy screen: the current user's 1.x links, each with a way to delete it.
 */
function render_page(): void {
	echo '<div class="wrap">';
	printf( '<h1>%s</h1>', esc_html__( 'Share a Draft (Old)', 'shareadraft' ) );

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Display-only flag set by our own redirect.
	if ( isset( $_GET['deleted'] ) ) {
		printf( '<div class="notice notice-success is-dismissible"><p>%s</p></div>', esc_html__( 'Link deleted.', 'shareadraft' ) );
	}

	printf(
		'<p>%s</p>',
		wp_kses(
			sprintf(
				/* translators: %s: URL of the Preview Links screen. */
				__( 'These links were made with an earlier version of Share a Draft. Each keeps working until it expires, and you can delete any you no longer need. To share a draft now, open it in the block editor and use the Share a Draft panel; links made that way are listed under <a href="%s">Preview Links</a>.', 'shareadraft' ),
				esc_url( admin_url( 'admin.php?page=shareadraft' ) )
			),
			[ 'a' => [ 'href' => [] ] ]
		)
	);

	echo '<table class="wp-list-table widefat fixed striped"><thead><tr>';
	foreach ( [ __( 'Title', 'shareadraft' ), __( 'Link', 'shareadraft' ), __( 'Expires', 'shareadraft' ), __( 'Actions', 'shareadraft' ) ] as $heading ) {
		printf( '<th scope="col">%s</th>', esc_html( $heading ) );
	}
	echo '</tr></thead><tbody>';

	foreach ( current_user_shares() as $row ) {
		$share = $row['share'];
		$post  = $row['post'];
		$url   = add_query_arg(
			[
				'p'       => $post->ID,
				QUERY_VAR => $share['key'],
			],
			home_url( '/' )
		);

		$delete_url = wp_nonce_url(
			add_query_arg(
				[
					'page'   => PAGE,
					'action' => 'delete',
					'key'    => $share['key'],
				],
				admin_url( 'edit.php' )
			),
			'shareadraft-delete'
		);

		printf(
			'<tr><td>%1$s</td><td><a href="%2$s">%3$s</a> <button type="button" class="button-link shareadraft-old-copy" data-url="%2$s">%4$s</button></td><td><time datetime="%5$s">%6$s</time></td><td><a href="%7$s">%8$s</a></td></tr>',
			esc_html( get_the_title( $post ) ),
			esc_url( $url ),
			esc_html( $url ),
			esc_html__( 'Copy', 'shareadraft' ),
			esc_attr( gmdate( 'c', $share['expires'] ) ),
			/* translators: %s: human-readable duration, e.g. "2 hours" */
			esc_html( sprintf( __( 'in %s', 'shareadraft' ), human_time_diff( time(), $share['expires'] ) ) ),
			esc_url( $delete_url ),
			esc_html__( 'Delete', 'shareadraft' )
		);
	}

	echo '</tbody></table></div>';
}
