=== Facebook ===
Contributors: Facebook, automattic, niallkennedy, mattwkelly, rgharpuray, ngfeldman, jamesgpearce, ravi.grover, danielbachhuber, gigawats, eosgood, Otto42, colmdoyle, zazinteractive
Tags: Facebook, comments, social, friends, like, like button, social plugins, facebook platform, page, posts, sidebar, plugin, open graph
Requires at least: 3.3
Tested up to: 3.5.1
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Stable tag: 1.3

Add Facebook social plugins and the ability to publish new posts to a Facebook Timeline or Facebook Page. Official Facebook plugin.

== Description ==

The Facebook plugin for WordPress adds Facebook social plugins to your WordPress site. Associate your WordPress site with a free Facebook application identifier to enable advanced features such as automatically sharing new posts to an author's Facebook Timeline or your site's Facebook Page. This plugin is developed by Facebook with extra support for popular plugins and themes, custom post types, and custom post statuses.

= Features =

* [Open Graph protocol](http://ogp.me/) markup optimizes your content for social sharing and rich story previews on Facebook, Twitter, Google+, Mixi, and more. Display large images, link to author pages, and improve story distribution through social news feeds.
* [Facebook Insights](http://www.facebook.com/insights) support for Facebook accounts associated with a Facebook application. Track rich audience data powered by Facebook profiles (age, location, language) and see how your content is shared on Facebook.
* Add [Like](https://developers.facebook.com/docs/reference/plugins/like/), [send](https://developers.facebook.com/docs/reference/plugins/send/), and [follow](https://developers.facebook.com/docs/reference/plugins/follow/) buttons to every post to help your site's readers share content with friends or stay connected to future content shared by your site on Facebook.
* Enable the [Facebook Comments Box social plugin](https://developers.facebook.com/docs/reference/plugins/comments/) to encourage new comments from logged-in Facebook users and his or her Facebook friends. Comments associated with a post are sorted according to social signals including friend networks, most liked, or the most active discussion threads. Advanced features include moderation, blacklisted words, automatic grammar correction, and login support for AOL, Microsoft, and Yahoo! accounts.
* [Like Box](https://developers.facebook.com/docs/reference/plugins/like-box/) displays recent activity from your Facebook Page and encourages new Like actions.
* [Recommendations Bar](https://developers.facebook.com/docs/reference/plugins/recommendationsbar/) helps visitors discover additional content on your site by recommending posts and encouraging Like shares.
* [Recommendations Box](https://developers.facebook.com/docs/reference/plugins/recommendations/) suggests related posts in a configurable widget.
* Configure your Facebook application for Open Graph action news publishing support for improved Facebook distribution of author Timeline stories and news-specific highlights.
* Mention Facebook friends and Facebook pages in a custom message posted to your Timeline with your post.
* Customize and extend the plugin through custom actions and filters.

= Shortcodes =

Add a [Like Button](https://developers.facebook.com/docs/reference/plugins/like/) or a [Send Button](https://developers.facebook.com/docs/reference/plugins/send/) using a shortcode inside your post or evaluated from within your theme. You may override site-level options with shortcode attributes defined on the social plugin's page.

* `[facebook_like_button]`
* `[facebook_send_button]`

= Contributing code =

The development [source code for this plugin is available on Facebook's GitHub account](https://github.com/facebook/wordpress). [Pull Requests](https://github.com/facebook/wordpress/pulls) and code discussion welcome.

== Installation ==

1. Install Facebook for WordPress either via the WordPress.org plugin directory, or by uploading the files to your server (in the `/wp-content/plugins/` directory).
1. After activating the plugin, you will be asked to set up your Facebook application or enter existing credentials copied from the [Facebook Developers site](http://developers.facebook.com/apps/).
1. Publishing to Facebook Timeline requires a Facebook application with an approved publish action with tags, user message, and explicitly shared action permissions. See the [Facebook for WordPress help page](https://developers.facebook.com/wordpress/) for more information.
1. That's it. You're ready to go!

== Screenshots ==

1. Facebook settings screen
2. Mention Facebook friends and pages in a custom message posted to your Timeline
3. Create a custom message published to your Facebook Timeline or Page alongside a summary of your new post
4. The resulting post published on the author's Timeline
5. Encourage social activity by adding Facebook social plugins before and after your posts
6. Facebook social plugins are available as WordPress widgets
7. Customized Like Box and Recommendations Box social plugins displayed as WordPress widgets
8. Facebook Insights showing demographics for your domain

== Custom actions & filters ==

= Actions =

* `facebook_notify_plugin_conflicts` - executes code to notify site administrators of possible conflicts with other plugins by iterating through a list of all installed plugins and highlighting known conflicts at the time the Facebook plugin for WordPress was released. Some publishers may wish to remove this check for efficiency.
* `facebook_settings_before_header_$hook_suffix` - add content to a settings page before the main page header section
* `facebook_settings_after_header_$hook_suffix` - add content to a settings page after the main page header section
* `facebook_settings_footer_$hook_suffix` - add content to a settings page below the wrapper div
* `facebook_comment_form_before` - comment form [pluggable action](http://codex.wordpress.org/Function_Reference/comment_form#Pluggable_actions "WordPress comment form pluggable action") replacing the WordPress `comment_form()` equivalent action `comment_form_before`
* `facebook_comment_form_after` - comment form [pluggable action](http://codex.wordpress.org/Function_Reference/comment_form#Pluggable_actions "WordPress comment form pluggable action") replacing the WordPress `comment_form()` equivalent action `comment_form_after`

= Filters =

* `facebook_features` - limit the plugin features available on your site
* `fb_conflicting_plugins` - add or remove plugin URLs used by the plugin to warn against potential conflicts
* `facebook_jssdk_init_options` - customize arguments sent to the [FB.init](https://developers.facebook.com/docs/reference/javascript/FB.init/) function of the Facebook JavaScript SDK
* `facebook_jssdk_init_extras` - add extra JavaScript to the `fbAsyncInit` JavaScript function called after the Facebook JavaScript SDK is loaded
* `facebook_content_filter_priority` - choose the priority of Facebook social plugin filters attached to `the_content` filter. Affects where Facebook content is output on your page relative to other plugins attached to `the_content`
* `fb_locale` - directly define your site locale based on the list of [Facebook locale mappings](https://developers.facebook.com/docs/internationalization/)
* `facebook_excerpt_length` - choose a custom length, in words, of a post excerpt generated for use in the Open Graph protocol description. default: 55
* `facebook_excerpt_more` - string appearing at the end of a truncated excerpt string. default: "&hellip;"
* `fb_rel_canonical` - customize the canonical URL used by Facebook for a post. Affects Open Graph protocol URL definitions, URL references sent in Open Graph actions, and more. default: result of `get_permalink()`
* `facebook_comment_schema_org` - override output of search engine friendly comments content using [Schema.org microdata markup](http://googlewebmastercentral.blogspot.com/2011/06/introducing-schemaorg-search-engines.html)
* `facebook_comments_number_more` - override the default "% Comments" text used to generate a client-side comments number. similar to WordPress' [comments_number](http://codex.wordpress.org/Function_Reference/comments_number) more parameter.
* `facebook_anchor_target` - customize the [browsing context name](http://www.whatwg.org/specs/web-apps/current-work/multipage/browsers.html#browsing-context-names) used for links to Facebook output alongside your post such as mentions. default: `_blank`
* `facebook_mentions_classes` - add or remove HTML classes from the parent HTML div element of mentions links
* `fb_meta_tags` - Customize Open Graph protocol markup before it is output to the page
* `facebook_ogp_prefixed` - true to always use prefixed properties (og:title) or false to use full IRI properties (http://ogp.me/ns#title)
* `facebook_rdfa_mappings` - array of RDFa references with desired prefix. Used to remap Open Graph protocol properties from a full IRI to a prefix
* `facebook_wp_comments_title` - set a custom title for the Facebook comments template
* `facebook_wp_list_comments` - customize the arguments sent to `wp_list_comments` for display of WordPress comments inside the Facebook comments template
* `facebook_comments_wrapper` - override the display of Facebook comments fetched from Facebook servers for display on the page. default: noscript. set to an empty string to prevent fetch and inclusion
* `fb_get_user_meta` - fetch a user meta value by attaching to this filter, bypassing the WordPress user meta API
* `fb_update_user_meta` - update a user meta value by attaching to this filter, bypassing the WordPress user meta API
* `fb_delete_user_meta` - delete a user meta value by attaching to this filter, bypassing the WordPress user meta API

== Frequently Asked Questions ==

= How do I sign up for a Facebook application ID for my website? =

You may create a new Facebook application or edit your existing Facebook application through the [Facebook Developers application interface](https://developers.facebook.com/apps/).

= How do I change the image that appears for my posts shared on Facebook? =

The plugin generates [Open Graph protocol](http://ogp.me/) markup for your site's webpages including an explicitly-specified image for posts with an associated [post thumbnail](http://codex.wordpress.org/Post_Thumbnails). Your plugin or theme may define additional images through the `fb_meta_tags` filter. If a post thumbnail image exists your additional image will be an alternate for stories shared through a pasted link. Unattended story summaries use the first defined image. [support sticky](http://wordpress.org/support/topic/customize-open-graph-protocol-for-your-site-or-network)

= I do not like the summary of my posts shared to Facebook =

Facebook generates a story summary for pasted links and new posts sent to your Timeline or Page based on metadata found on your page. The Facebook plugin for WordPress generates Open Graph protocol metadata to assist Facebook's understanding of your webpages. The [Facebook URL debugger](https://developers.facebook.com/tools/debug) provides a view into Facebook's representation of your webpage and relevant extracted metadata. Test URLs of interest in the debugger to better understand how your page might be represented on Facebook.

= How do I moderate comments and add reviewers? =

The [Comment Moderation Tool](https://developers.facebook.com/tools/comments) allows you to customize your Facebook application's moderators, blacklisted words, external logins, and more.

= Does Facebook Comments work with my existing WordPress comments? =

The [Comments Box social plugin](https://developers.facebook.com/docs/reference/plugins/comments/) is meant to replace the WordPress commenting system with a more social, client-side experience. We do not currently support synchronizing comments stored on Facebook with comments stored in your WordPress database. Posts with existing WordPress comments will display those comments followed by the Facebook Comments Box.

= What additional configuration steps do I need to complete to enable an Open Graph action for my Facebook application? =

Visit the [Facebook plugin for WordPress getting started page](https://developers.facebook.com/wordpress/) for more details and screenshots of each step in the process. You will need to create an Open Graph action-object pair for your Facebook application: publish a post. You will need to submit the new publish action for approval with support for [action capabilities](https://developers.facebook.com/docs/submission-process/opengraph/guidelines/action-properties/ "Facebook action capabilities") allowing custom messages on an author's Timeline, mentioning Facebook friends and Facebook pages within that message, and marking the new post as explicitly shared.

= I setup my social plugin but nothing happened =

Some social plugins require a URL representing a specific Facebook feature: the Follow button accepts a person's Timeline URL; the Like Box accepts a Page URL. Try configuring similar parameters through the appropriate [Facebook social plugins](https://developers.facebook.com/docs/plugins/) page to view a preview of what to expect on your WordPress site after a successful configuration.

= My site content is Spanish. Why does Facebook display social plugin text in English? =

The Facebook plugin for WordPress examines [your WordPress locale](http://codex.wordpress.org/Function_Reference/get_locale) and chooses the most appropriate match from a list of [Facebook locales](https://developers.facebook.com/docs/internationalization/). You can act directly on the `fb_locale` filter for more exact control.

It's possible another plugin (or your theme) including an English version of the Facebook JavaScript SDK before the Facebook plugin for WordPress tried to include the Spanish version of the same SDK. View source on the affected page and search for "connect.facebook.net" to locate multiple possible attempts to load the Facebook JavaScript SDK.



== Upgrade Notice ==

= 1.3 =
Opt-in to the advanced features of Open Graph publishing after successful Facebook application configuration. Comments Box moved to comments template, overriding your theme's comments template for enabled post types. Existing WordPress comments displayed above Comments Box.

= 1.2.3 =
Publish to Page with app access token. Improved custom post type support. Improved publish author validation.

= 1.2.2 =
Improve performance of settings migration from old versions of the plugin.

= 1.2.1 =
Fixes an issue with author pages and Open Graph protocol.

= 1.2 =
App access token support. Mention tagging support. Explicit sharing to Facebook Timeline and/or Facebook Page.

= 1.1.11 =
Like Box widget. Improved locale selector. Bugfix publishing to a Facebook Page.

= 1.1.10 =
Improved string comparison functions for some installs. Improved support for sites without registered sidebars.

= 1.1.9 =
Subscribe Button is now Follow Button. Google Analytics social action tracking support. Gallery images included in Open Graph protocol markup.

= 1.1.8 =
Bugfix for post context on a comments filter.

= 1.1.7 =
Improved comment filters. Add post author as Comment Box admin/moderator. Hide settings error displayed if no output functions exist.

= 1.1.6 =
Debug page, og: prefixed Open Graph protocol properties, Shortcode API support for Like and Send buttons, comments improvements.

= 1.1.5 =
Fix comments enabled option improperly set on comments settings save when no post types selected.

= 1.1.4 =
Comments number filter available on all contexts when comments box enabled for one or more post types.

= 1.1.3 =
Fix recommendations bar issue and PHP issue affecting 5.2.4 - 5.2.8 installs.

= 1.1.2 =
Improved compatibility with PHP 5.2 installations. Recommendations Bar fix.

= 1.1 =
Custom post types and status support. Rewritten settings pages. Longer-lived Facebook access tokens. Async JavaScript loading. Threaded comment support.

= 1.0.2 =
Improve site performance when cURL not installed or SSL not available. Removed post meta boxes when social publishing features not enabled.

= 1.0.1 =
Security fixes. Improved customization and debugging of settings. l10n and i18n fixes.

== Changelog ==

= 1.3 =
* Open Graph posting is now an advanced feature configured through a site's Social Publisher settings page. Applications without an approved Publish action can post to an author's Timeline feed with more limited functionality and story promotion.
* Comments Box moved to comments_template, overriding your theme's default comments template. Existing WordPress comments are displayed above the Comments Box.
* Added ability to disable fetching Facebook comments from Facebook servers for inclusion on the page inside a noscript element for improved SEO. See the `facebook_comments_wrapper` filter for more details.
* Set a custom sort order for Comments Box comments: social, chronological, or reverse chronological.
* Do not fetch Facebook user status or set a site cookie for default Facebook JavaScript SDK loads on the site frontend.

= 1.2.3 =
* Post to Facebook Page using Facebook application access token
* Do not display social publisher meta boxes or publish flow if post type not explicitly public
* Improved local validators for publish flow

= 1.2.2 =
* Improve performance of settings migration from old versions of the plugin

= 1.2.1 =
* Fix: Properly display Open Graph protocol data on author page

= 1.2 =
* Post to Timeline now uses an [app access token](https://developers.facebook.com/docs/concepts/login/access-tokens-and-types/#appaccess) to communicate with Facebook servers without needing an active Facebook user session. Improves XML-RPC compatibility and wp-admin performance
* The Facebook PHP SDK is now loaded as needed, not with every admin request
* [Mention tagging](https://developers.facebook.com/docs/technical-guides/opengraph/mention-tagging/) Facebook friends and Facebook pages replaces previous mention meta boxes for friends and pages
* Removed mention display alongside a post. Mentions are constructed in a custom Facebook message
* Associate a WordPress account with a Facebook account from the edit profile page

= 1.1.11 =
* Added [Like Box](https://developers.facebook.com/docs/reference/plugins/like-box/) widget for Facebook Page promotion
* New locale selector provides more extensible code
* Social publisher settings page inline help
* Fixed bug publishing to a Facebook Page

= 1.1.10 =
* Do not compare strings when needle longer than haystack
* Test if expected widget files and classes exist before registering a widget. Fixes possible cache conflict

= 1.1.9 =
* Support social action tracking in Google Analytics. Includes [Google Analyticator](http://wordpress.org/extend/plugins/google-analyticator/) and [Google Analytics for WordPress](http://wordpress.org/extend/plugins/google-analytics-for-wordpress/) support
* Facebook Subscribe Button is now known as Follow Button
* Add gallery images to Open Graph protocol images array if gallery shortcode present
* Update to Facebook PHP SDK 3.2.2
* WordPress 3.5 color picker support in Recommendations Box and Activity Feed plugins
* Fix incorrectly referenced admin menu icon file locations in minified version of icons.css

= 1.1.8 =
* Bugfix: use the post global object instead of get_post on a comments filter

= 1.1.7 =
* Comments Box - overrides of WordPress comment system applied at the post level, allowing more fine-grained control of comments by post type or mixed in a single loop
* Comments Box - declare post author with `moderate_comments` capability an admin of the individual page, granting comment moderation capabilities on Facebook for the post
* Hide settings error display if function is not yet defined

= 1.1.6 =
* [Open Graph protocol](http://ogp.me/) data output in prefixed form (e.g. og:title) instead of full IRI. You may declare your preference to always use a prefix in the future using the `facebook_ogp_prefixed` filter
* Debug page displays your plugin configuration, author accounts associated with a Facebook account, and server information for troubleshooting
* [Shortcode](http://codex.wordpress.org/Shortcode_API) support for Like Button and Send Button output
* Comments Box may be disabled for a specific post when post comments are marked closed in WordPress and no comments are stored on Facebook
* Application id and secret are verified on Facebook servers, generating an app access token for future use
* Async JavaScript loader support for concatenated script loader configurations
* Fixed an issue with Comments Box color scheme preference never saving a "dark" preference value
* JavaScript files renamed to .js and .min.js to match WP Core 3.5 convention (see [Core #21633](http://core.trac.wordpress.org/ticket/21633) )
* Includes Facebook PHP SDK 3.2.1 and its new SSL certificate chain fallback

= 1.1.5 =
* Delete comments enabled option on plugin's settings comments page save when no comments selected.

= 1.1.4 =

* Comment counts powered by Facebook available in all page contexts when comments box social plugin enabled for one or more post types
* Subscribe button settings fix
* Recommendations Bar max age setting fix

= 1.1.3 =

* PHP issue affecting 5.2.4 - 5.2.8 installs
* Properly save number of articles setting for recommendations bar
* Add explicit Open Graph protocol URL for front page and home

= 1.1.2 =

* Improve PHP 5.2 compatibility
* Fix minimum number of seconds before recommendations bar shown
* properly reference widget ids for stats

= 1.1 =

* Supports public [custom post types](http://codex.wordpress.org/Post_Types) and [custom post status](http://codex.wordpress.org/Function_Reference/register_post_status)
* [Facebook JavaScript SDK](https://developers.facebook.com/docs/reference/javascript/) loads asynchronously after pageload
* Settings page broken into multiple settings pages with [WordPress Settings API](http://codex.wordpress.org/Settings_API) support
* Choose to display social plugins and mentions on your homepage, archive pages, or individual post types
* Comments markup appearing in noscript wrappers now include [Schema.org comment markup](http://schema.org/UserComments) by default
* Added threaded comment support for noscript fallback markup
* Updated [Facebook PHP SDK](https://github.com/facebook/facebook-php-sdk/) to version 3.2
* New social plugins builder helps correct mistakes before they happen and only include markup on your pages capable of interpretation by the Facebook JavaScript SDK
* Mention links open in a new browsing context by default
* Post mentions are displayed inside their meta boxes after save
* Strings pass through translation functions, opening up future translation support
* Fixed mixed-content warnings thrown when Facebook images displayed on a page
* Uninstall script removes site and user options when the plugin is uninstalled through the WordPress administrative interface
* [Contextual help menus](http://codex.wordpress.org/Administration_Panels#Help) display helpful information alongside settings choices
* High-DPI icon support for administration menu

= 1.0.2 =

* Fixed issue where some sites were extremely slow as a result of installing the plugin (due to cURL not being installed).
* Added warning and actively disable portions of the plugin if SSL not installed.
* Fixed bug in social publishing.
* Added logic to disable meta boxes/publishing if social publishing is disabled.
* Fixed forever loading issue on FB settings page if no active user exists.
* Added proper escaping.
* Added global settings to set whether social plugins show on all posts, all pages, both, or neither. Done for like button, subscribe button, send button, comments, and recommendations bar.
* Added per-post/page settings for showing/hiding social plugins.
* Fixed poorly formatted description that was being set when publishing to friends' and Pages' feeds.
* Added notification if plugins that are potentially conflicting are installed.
* Added suggestions for what to enter in fields in the new user experience.
* Bug fixes to ensure everything works on mobile (including support for WPTouch).
* Bug fixes to Pages drop down on the Facebook settings page.
* Removed the need to create PHP sessions, relying on user meta/transients now.

= 1.0.1 =

* Comment count bug fix.
* Comments width bug fix.
* Like, send, subscribe: fixed incorrect hrefs for homepage buttons.
* Added like/send button to settings page (spread the word!).
* Changed minimum and maximum supported WP versions.
* Security fix in the admin control panel.
* Fixed issue with publishing a post/page if there isn't a thumbnail defined.
* Changed auto-completes to play nice with UTF-8.
* Moved extended access token function to Facebook_WP class.
* Added debug link on settings page that outputs debug information.
* Lots of i18n fixes.
* Added easier debugging of Facebook API errors.
* Added better logged in state detection in admin UI, depending on if the user has authenticated and given certain permissions.
* Fixed publishing a post if no friends or pages mentioned.
* Theme fixes to prevent like and mentions bar from showing up in the wrong place.
* Fixed configure link on plugins page.
* Fixes for bugs happening on 404 page.
* Bug fix for if a WP admin removes the app via facebook.com.
* Added status messages for what was/wasn't posted to Facebook as part of a Post/Page being taken live.
* Added functionality to disable publishing to a page if access token fails.
* Clearer error messages for certain scenarios (like inability to post to a friend of page's Timeline because of privacy settings.
* Fixed conflicts with Power Editor and extraneous text being added to og:description.  Thanks to Angelo Mandato ([support mention](http://wordpress.org/support/topic/plugin-facebook-plugin-conflicts-with-powerpress))

= 1.0 =

* Launch.