=== Gutenberg Ramp ===
Contributors: automattic, mattoperry, justnorris, enigmaweb
Tags: gutenberg, ramp, classic editor, legacy editor, gutenberg ramp
Requires at least: 2.7
Tested up to: 4.9.5
Requires PHP: 5.5
Stable tag: trunk
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Restores legacy editor or enables Gutenberg selectively by post types or post ID.

== Description ==

Activating Gutenberg Ramp plugin adds a settings screen where you can enable Gutenberg selectively (for specific post types). For even greater control, you can specify Gutenberg loading behavior in code. Ramp works with both the plugin version of Gutenberg, and the core version, providing a seamless transition.

Visit Settings -> Writing to enable Gutenberg by post type. [Screenshots here](https://wordpress.org/plugins/ramp-for-gutenberg/#screenshots)

To enable Gutenberg for specific post IDs and for a more granular level of control, developers can use the `ramp_for_gutenberg_load_gutenberg()` function as outlined below.

== For Developers ==

Loading behaviour is controlled by the `ramp_for_gutenberg_load_gutenberg()` function, to be added in your theme `functions.php`. Calling this function without its single optional parameter causes Gutenberg to load on all post-edit screens. An optional associative array of criteria can be passed. The possible keys and values are:

* `load` (Int): `0|1`: never or always load Gutenberg
* `post_ids` (Array of post_ids): loads Gutenberg for the specified post_ids
* `post_types` (Array of post_types): loads Gutenberg for the specified post types.

== Code Examples ==

```
if ( function_exists( 'ramp_for_gutenberg_load_gutenberg' ) ) {
	ramp_for_gutenberg_load_gutenberg();
}
```

Load Gutenberg for all posts.

`ramp_for_gutenberg_load_gutenberg( [ 'load' => 0 ] );`

Do not load Gutenberg for any posts.

`ramp_for_gutenberg_load_gutenberg( [ 'post_ids' => [ 12, 13, 122 ] ] );`

Load Gutenberg for posts with ids 12, 13 and 122.

`ramp_for_gutenberg_load_gutenberg( [ 'post_types' => [ 'test', 'scratch' ], 'post_ids' => [ 12 ] ] );`

Load Gutenberg for post_id 12 and all posts of type test and scratch

== Advanced ==

The typical use case is as shown above, the parameters do not change except when theme code is updated.

If making more dynamic changes, note that the parameter supplied is persisted in a site option; when the parameters are changed in code, one page load is necessary to update the site option before the editor can use the new setting.

== Contributions ==

Contributions are welcome via our [GitHub repo.](https://github.com/Automattic/ramp-for-gutenberg)

== Installation ==

1. Install & activate the plugin through the WordPress 'Plugins' dashboard.
1. Visit Settings -> Writing to enable Gutenberg for specific post types like Pages, Posts, and any custom post types.  [Screenshots here](https://wordpress.org/plugins/ramp-for-gutenberg/#screenshots)
1. To enable Gutenberg for specific post IDs and for a more granular level of control, developers can use the `ramp_for_gutenberg_load_gutenberg()` function as [outlined here.](https://wordpress.org/plugins/ramp-for-gutenberg/)

== Frequently Asked Questions ==

= Why is a post type disabled (greyed out) on my settings screen? =

If you're seeing something greyed out, it means the `ramp_for_gutenberg_load_gutenberg()` function is already in your theme functions.php. If you want to use the wp-admin UI, remove the conflicting function from your functions.php file. 

= Some post types are not showing up on the settings screen =

Post types that are not compatible with Gutenberg will not show up. If you think you have found a false negative (posts in that post type DO work with Gutenberg, when Ramp plugin is deactivated) please report it as an issue on [GitHub here.](https://github.com/Automattic/ramp-for-gutenberg)

= The changes I'm making in functions.php are not showing up =

The parameter supplied in the function is persisted in a site option. Therefore, when the parameters are changed in code, *one page load is necessary* to update the site option before the editor can use the new setting.

= Can I contribute to this plugin? =

Absolutely! Please create issues and pull requests on [GitHub here.](https://github.com/Automattic/ramp-for-gutenberg)

== Screenshots ==

1. Settings for Gutenberg Ramp via Settings -> Writing

== Changelog ==

= 0.1 =
* initial test release

== Upgrade Notice ==

= 0.1 =
* intial test release
