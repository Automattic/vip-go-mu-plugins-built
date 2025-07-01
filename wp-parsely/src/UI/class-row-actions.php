<?php
/**
 * UI: Row actions class.
 *
 * @package Parsely
 * @since   2.6.0
 */

declare(strict_types=1);

namespace Parsely\UI;

use Parsely\Parsely;
use Parsely\Dashboard_Link;
use Parsely\Permissions;
use WP_Post;

/**
 * Handles the post/page row actions.
 *
 * @since 2.6.0
 * @since 3.19.0 Added Traffic Boost link.
 */
final class Row_Actions {
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
	 * Registers action and filter hook callbacks.
	 *
	 * @since 2.6.0
	 */
	public function run(): void {
		/**
		 * Filter whether row action links are enabled or not.
		 *
		 * @since 2.6.0
		 *
		 * @param bool $enabled True if enabled, false if not.
		 */
		if ( apply_filters( 'wp_parsely_enable_row_action_links', true ) ) {
			add_filter( 'post_row_actions', array( $this, 'row_actions_add_parsely_link' ), 10, 2 );
			add_filter( 'page_row_actions', array( $this, 'row_actions_add_parsely_link' ), 10, 2 );
			add_filter( 'post_row_actions', array( $this, 'row_actions_add_traffic_boost_link' ), 10, 2 );
			add_filter( 'page_row_actions', array( $this, 'row_actions_add_traffic_boost_link' ), 10, 2 );
		}
	}

	/**
	 * Includes a link to the statistics page for an article in the wp-admin
	 * Posts List.
	 *
	 * If the post object is the "front page," this will include the main
	 * dashboard link instead.
	 *
	 * @since 2.6.0
	 *
	 * @see https://developer.wordpress.org/reference/hooks/page_row_actions/
	 *
	 * @param array<string, string> $actions The existing list of actions.
	 * @param WP_Post               $post    The individual post object the actions apply to.
	 * @return array<string, string> The amended list of actions.
	 */
	public function row_actions_add_parsely_link( array $actions, WP_Post $post ): array {
		if ( ! Dashboard_Link::can_show_link( $post, $this->parsely ) ) {
			return $actions;
		}

		$url = Dashboard_Link::generate_url( $post, $this->parsely->get_site_id(), 'wp-admin-posts-list', 'wp-admin' );
		if ( '' !== $url ) {
			$actions['find_in_parsely'] = $this->generate_link_to_parsely( $post, $url );
		}

		return $actions;
	}

	/**
	 * Generates the HTML link to Parse.ly.
	 *
	 * @since 2.6.0
	 * @since 3.1.2 Added `url` parameter.
	 *
	 * @param WP_Post $post Which post object or ID to add link to.
	 * @param string  $url Generated URL for the post.
	 * @return string The HTML for the link to Parse.ly.
	 */
	private function generate_link_to_parsely( WP_Post $post, string $url ): string {
		return sprintf(
			'<a href="%1$s" aria-label="%2$s">%3$s</a>',
			esc_url( $url ),
			esc_attr( $this->generate_aria_label_for_post( $post ) ),
			esc_html__( 'Parse.ly&nbsp;Stats', 'wp-parsely' )
		);
	}

	/**
	 * Generates ARIA label content.
	 *
	 * @since 2.6.0
	 *
	 * @param WP_Post $post Which post object or ID to generate the ARIA label for.
	 * @return string ARIA label content.
	 */
	private function generate_aria_label_for_post( WP_Post $post ): string {
		return sprintf(
			/* translators: Post title */
			__( 'Go to Parse.ly stats for "%s"', 'wp-parsely' ),
			$post->post_title
		);
	}

	/**
	 * Adds a link to Traffic Boost in the row actions.
	 *
	 * If the user doesn't have permission to use Traffic Boost, or if the post
	 * is a draft, private, future, pending, or trash, the link is not added.
	 *
	 * @since 3.19.0
	 *
	 * @param array<string, string> $actions The existing list of actions.
	 * @param WP_Post               $post    The individual post object the actions apply to.
	 * @return array<string, string> The amended list of actions.
	 */
	public function row_actions_add_traffic_boost_link( array $actions, WP_Post $post ): array {
		if ( ! Permissions::current_user_can_use_pch_feature(
			'traffic_boost',
			$this->parsely->get_options()['content_helper']
		) ) {
			return $actions;
		}

		// Disable for posts that are draft, private, future, pending, or trash.
		$non_public_statuses = array( 'draft', 'private', 'future', 'pending', 'trash' );
		if ( in_array( $post->post_status, $non_public_statuses, true ) &&
			! Parsely::post_has_trackable_status( $post ) ) {
			return $actions;
		}

		$actions['traffic_boost'] = $this->generate_link_to_traffic_boost( $post );
		return $actions;
	}

	/**
	 * Generates the HTML link to Traffic Boost, with the Parse.ly icon.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_Post $post The individual post object the actions apply to.
	 * @return string The HTML for the link to Traffic Boost.
	 */
	private function generate_link_to_traffic_boost( WP_Post $post ): string {
		$parsely_icon      = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA2MCA2NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjMWQyMzI3IiBkPSJNMjMuNzIsNTEuNTNjMC0uMTgsMC0uMzQtLjA2LS41MmExMy4xMSwxMy4xMSwwLDAsMC0yLjEtNS41M0ExNC43NCwxNC43NCwwLDAsMCwxOS4xMiw0M2MtLjI3LS4yMS0uNS0uMTEtLjUxLjIybC0uMjQsMy40MmMwLC4zMy0uMzguMzUtLjQ5LDBsLTEuNS00LjhhMS40LDEuNCwwLDAsMC0uNzctLjc4LDIzLjkxLDIzLjkxLDAsMCwwLTMuMS0uODRjLTEuMzgtLjI0LTMuMzktLjM5LTMuMzktLjM5LS4zNCwwLS40NS4yMS0uMjUuNDlsMi4wNiwzLjc2Yy4yLjI3LDAsLjU0LS4yOS4zM2wtNC41MS0zLjZhMy42OCwzLjY4LDAsMCwwLTIuODYtLjQ4Yy0xLC4xNi0yLjQ0LjQ2LTIuNDQuNDZhLjY4LjY4LDAsMCwwLS4zOS4yNS43My43MywwLDAsMC0uMTQuNDVTLjQxLDQzLC41NCw0NGEzLjYzLDMuNjMsMCwwLDAsMS4yNSwyLjYyTDYuNDgsNTBjLjI4LjIuMDkuNDktLjIzLjM3bC00LjE4LS45NGMtLjMyLS4xMi0uNSwwLS40LjM3LDAsMCwuNjksMS44OSwxLjMxLDMuMTZhMjQsMjQsMCwwLDAsMS42NiwyLjc0LDEuMzQsMS4zNCwwLDAsMCwxLC41Mmw1LC4xM2MuMzMsMCwuNDEuMzguMS40OEw3LjUxLDU4Yy0uMzEuMS0uMzQuMzUtLjA3LjU1YTE0LjI5LDE0LjI5LDAsMCwwLDMuMDUsMS42NiwxMy4wOSwxMy4wOSwwLDAsMCw1LjkuNSwyNS4xMywyNS4xMywwLDAsMCw0LjM0LTEsOS41NSw5LjU1LDAsMCwxLS4wOC0xLjIsOS4zMiw5LjMyLDAsMCwxLDMuMDctNi45MSI+PC9wYXRoPjxwYXRoIGZpbGw9IiMxZDIzMjciIGQ9Ik01OS43LDQxLjUzYS43My43MywwLDAsMC0uMTQtLjQ1LjY4LjY4LDAsMCwwLS4zOS0uMjVzLTEuNDMtLjMtMi40NC0uNDZhMy42NCwzLjY0LDAsMCwwLTIuODYuNDhsLTQuNTEsMy42Yy0uMjYuMjEtLjQ5LS4wNi0uMjktLjMzbDIuMDYtMy43NmMuMi0uMjguMDktLjQ5LS4yNS0uNDksMCwwLTIsLjE1LTMuMzkuMzlhMjMuOTEsMjMuOTEsMCwwLDAtMy4xLjg0LDEuNCwxLjQsMCwwLDAtLjc3Ljc4bC0xLjUsNC44Yy0uMTEuMzItLjQ4LjMtLjQ5LDBsLS4yNC0zLjQyYzAtLjMzLS4yNC0uNDMtLjUxLS4yMmExNC43NCwxNC43NCwwLDAsMC0yLjQ0LDIuNDdBMTMuMTEsMTMuMTEsMCwwLDAsMzYuMzQsNTFjMCwuMTgsMCwuMzQtLjA2LjUyYTkuMjYsOS4yNiwwLDAsMSwzLDguMSwyNC4xLDI0LjEsMCwwLDAsNC4zNCwxLDEzLjA5LDEzLjA5LDAsMCwwLDUuOS0uNSwxNC4yOSwxNC4yOSwwLDAsMCwzLjA1LTEuNjZjLjI3LS4yLjI0LS40NS0uMDctLjU1bC0zLjIyLTEuMTdjLS4zMS0uMS0uMjMtLjQ3LjEtLjQ4bDUtLjEzYTEuMzgsMS4zOCwwLDAsMCwxLS41MkEyNC42LDI0LjYsMCwwLDAsNTcsNTIuOTJjLjYxLTEuMjcsMS4zMS0zLjE2LDEuMzEtMy4xNi4xLS4zMy0uMDgtLjQ5LS40LS4zN2wtNC4xOC45NGMtLjMyLjEyLS41MS0uMTctLjIzLS4zN2w0LjY5LTMuMzRBMy42MywzLjYzLDAsMCwwLDU5LjQ2LDQ0Yy4xMy0xLC4yNC0yLjQ3LjI0LTIuNDciPjwvcGF0aD48cGF0aCBmaWxsPSIjMWQyMzI3IiBkPSJNNDYuNSwyNS42MWMwLS41My0uMzUtLjcyLS44LS40M2wtNC44NiwyLjY2Yy0uNDUuMjgtLjU2LS4yNy0uMjMtLjY5bDQuNjYtNi4yM2EyLDIsMCwwLDAsLjI4LTEuNjgsMzYuNTEsMzYuNTEsMCwwLDAtMi4xOS00Ljg5LDM0LDM0LDAsMCwwLTIuODEtMy45NGMtLjMzLS40MS0uNzQtLjM1LS45MS4xNmwtMi4yOCw1LjY4Yy0uMTYuNS0uNi40OC0uNTktLjA1bC4yOC04LjkzYTIuNTQsMi41NCwwLDAsMC0uNjYtMS42NFMzNSw0LjI3LDMzLjg4LDMuMjcsMzAuNzguNjksMzAuNzguNjlhMS4yOSwxLjI5LDAsMCwwLTEuNTQsMHMtMS44OCwxLjQ5LTMuMTIsMi41OS0yLjQ4LDIuMzUtMi40OCwyLjM1QTIuNSwyLjUsMCwwLDAsMjMsNy4yN2wuMjcsOC45M2MwLC41My0uNDEuNTUtLjU4LjA1bC0yLjI5LTUuNjljLS4xNy0uNS0uNTctLjU2LS45MS0uMTRhMzUuNzcsMzUuNzcsMCwwLDAtMyw0LjIsMzUuNTUsMzUuNTUsMCwwLDAtMiw0LjYyLDIsMiwwLDAsMCwuMjcsMS42N2w0LjY3LDYuMjRjLjMzLjQyLjIzLDEtLjIyLjY5bC00Ljg3LTIuNjZjLS40NS0uMjktLjgyLS4xLS44Mi40M2ExOC42LDE4LjYsMCwwLDAsLjgzLDUuMDcsMjAuMTYsMjAuMTYsMCwwLDAsNS4zNyw3Ljc3YzMuMTksMyw1LjkzLDcuOCw3LjQ1LDExLjA4QTkuNiw5LjYsMCwwLDEsMzAsNDkuMDlhOS4zMSw5LjMxLDAsMCwxLDIuODYuNDVjMS41Mi0zLjI4LDQuMjYtOC4xMSw3LjQ0LTExLjA5YTIwLjQ2LDIwLjQ2LDAsMCwwLDUuMDktNywxOSwxOSwwLDAsMCwxLjExLTUuODIiPjwvcGF0aD48cGF0aCBmaWxsPSIjMWQyMzI3IiBkPSJNMzYuMTIsNTguNDRBNi4xMiw2LjEyLDAsMSwxLDMwLDUyLjMyYTYuMTEsNi4xMSwwLDAsMSw2LjEyLDYuMTIiPjwvcGF0aD48L3N2Zz4=';
		$traffic_boost_url = admin_url( 'admin.php?page=parsely-dashboard-page#/engagement-boost/' . $post->ID );

		return sprintf(
			'<a href="%1$s" aria-label="%2$s" style="white-space:nowrap;">
				<span style="display:inline-flex; align-items:center;">
					%3$s
					<img src="%4$s" alt="" style="width:14px; height:14px; margin-left:2px; display:inline-block;">
				</span>
			</a>',
			esc_url( $traffic_boost_url ),
			esc_attr( $this->generate_aria_label_for_post( $post ) ),
			esc_html__( 'Boost Engagement', 'wp-parsely' ),
			esc_attr( $parsely_icon )
		);
	}
}
