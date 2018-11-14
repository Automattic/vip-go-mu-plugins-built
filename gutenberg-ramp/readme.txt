=== Gutenberg Ramp ===
Contributors: automattic, mattoperry, justnorris, enigmaweb
Tags: gutenberg, ramp, classic editor, legacy editor, gutenberg ramp
Requires at least: 4.9.8
Tested up to: 5.0
Requires PHP: 5.5
Stable tag: 1.1.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Restores legacy editor or enables Gutenberg selectively by post types or post ID.

== Description ==

Activating Gutenberg Ramp plugin adds a settings screen where you can enable Gutenberg selectively (for specific post types). For even greater control, you can specify Gutenberg loading behavior in code. Ramp works with both the plugin version of Gutenberg, and the core version, providing a seamless transition.

Visit Settings -> Writing to enable Gutenberg by post type. [Screenshots here](https://wordpress.org/plugins/gutenberg-ramp/#screenshots)

To enable Gutenberg for specific post IDs and for a more granular level of control, developers can use the `gutenberg_ramp_load_gutenberg()` function as outlined below.

== For Developers ==

Loading behaviour is controlled by the `gutenberg_ramp_load_gutenberg()` function, to be added in your theme `functions.php`. Calling this function without its single optional parameter causes Gutenberg to load on all post-edit screens. An optional associative array of criteria can be passed. The possible keys and values are:

* `load` (Int): `0|1`: never or always load Gutenberg
* `post_ids` (Array of post_ids): loads Gutenberg for the specified post_ids
* `post_types` (Array of post_types): loads Gutenberg for the specified post types.

== Code Examples ==

Load Gutenberg for all posts:

<code>
if ( function_exists( 'gutenberg_ramp_load_gutenberg' ) ) {
	gutenberg_ramp_load_gutenberg();
}
</code>


Never load Gutenberg:

<code>
gutenberg_ramp_load_gutenberg( false );

// Alternatively, you can use the load key to always disable Gutenberg:
gutenberg_ramp_load_gutenberg( [ 'load' => 0 ] );
</code>


Load Gutenberg only for posts with ids 12, 13 and 122:

<code>
gutenberg_ramp_load_gutenberg( [ 'post_ids' => [ 12, 13, 122 ] ] );
</code>


Load Gutenberg for `post_id: 12` and all posts of type `test` and `scratch`:

<code>
gutenberg_ramp_load_gutenberg(
	[
		'post_types' => [ 'test', 'scratch' ],
		'post_ids'   => [ 12 ],
	]
);
</code>

== Contributions ==

Contributions are welcome via our [GitHub repo.](https://github.com/Automattic/gutenberg-ramp)

== Installation ==

1. Install & activate the plugin through the WordPress 'Plugins' dashboard.
1. Visit Settings -> Writing to enable Gutenberg for specific post types like Pages, Posts, and any custom post types.  [Screenshots here](https://wordpress.org/plugins/gutenberg-ramp/#screenshots)
1. To enable Gutenberg for specific post IDs and for a more granular level of control, developers can use the `gutenberg_ramp_load_gutenberg()` function as [outlined here.](https://wordpress.org/plugins/gutenberg-ramp/)

== Frequently Asked Questions ==

= Why is a post type disabled (greyed out) on my settings screen? =

If you're seeing something greyed out, it means the `gutenberg_ramp_load_gutenberg()` function is already in your theme functions.php. If you want to use the wp-admin UI, remove the conflicting function from your functions.php file.

= Some post types are not showing up on the settings screen =

Post types that are not compatible with Gutenberg will not show up. If you think you have found a false negative (posts in that post type DO work with Gutenberg, when Ramp plugin is deactivated) please report it as an issue on [GitHub here.](https://github.com/Automattic/gutenberg-ramp)

= Can I contribute to this plugin? =

Absolutely! Please create issues and pull requests on [GitHub here.](https://github.com/Automattic/gutenberg-ramp)

== Screenshots ==

1. Settings for Gutenberg Ramp via Settings -> Writing

== Changelog ==

= 1.1.0 =
* prepares Gutenberg Ramp for WordPress 5.0 release
* deprecates support for Gutenberg Plugin versions older than 3.5
* no longer caches load decision in `gutenberg_ramp_load_critera` option
* removed  `gutenberg_ramp_option_name` filter
* adds unsupported post types notice
* adds support for multiple function calls to `gutenberg_ramp_load_gutenberg()`

= 1.0.0 =
* initial release

== Upgrade Notice ==

= 1.1.0 =
1.1.0 is a major upgrade preparing Gutenberg Ramp for WordPress 5.0 release. Upgrade prior to 5.0 is recommended to ensure seamless transition.

= 1.0.0 =
* initial release
