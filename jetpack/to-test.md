## 4.1

### SSO

- **We've completely redesigned and refactored Jetpack's [SSO Module](https://jetpack.com/support/sso/).** It would be great if you could use the module as much as possible, with different users, in different browsers, and different roles on your site. The additional options mentioned at the bottom of [this page](https://jetpack.com/support/sso/) should still work.

### Carousel

- Carousel now uses smaller images in the Carousel view when the full-size image is very large. To test this, try creating new galleries with different image sizes (small, medium, large, and very large), and make sure all images are displayed properly in the Carousel view.

### Comments

- We've improved the way comment avatars were stored and displayed. To test, try leaving comments while logged in, logged out, from Twitter, Facebook, Google+, or WordPress.com, and make sure all avatars are always displayed properly.

### Contact Form

- We've changed the way that contact forms are titled- please use the forms and make sure that responses show up correctly in your wp-admin
- We've added an unread count to the feedback menu item in your wp-admin/ -- keep in mind that this resets to 0 when you view the page. Test it out, make sure it works!

### Custom Content Types

- We've added Portfolio options to the Customizer. To test this, enable a theme like [Illustratr](https://wordpress.org/themes/illustratr/) that supports Portfolios, and then head over to the Customizer to change some options.
- We fixed some issues with the Restaurant Menus Post Type. To test this, you can follow the instructions [here](https://github.com/Automattic/jetpack/issues/3407#issue-133327324) when using a theme that supports Jetpack's Restaurant Menus, like [Auberge](https://wordpress.org/themes/auberge/).

### Custom CSS

- It is now possible to use multiple `display` properties in Custom CSS. You can follow the instructions [here](https://github.com/Automattic/jetpack/issues/4176) to test.
- We fixed a memory issue with Custom CSS on sites with a very large amount of CSS revisions. To test this, try saving new CSS changes a few times on your site, and make sure you can still access those changes thanks to the Revisions links below the Save button in the Custom CSS editor.

### General

- We cleaned up and restyled jetpack related banner notices to match Core notification styles.
- We've improved our connection process. Previously, you sometimes had to specify a port number for your site when using HTTPS, otherwise Jetpack wasn't properly connected to WordPress.com. From now on, Jetpack will take care of that for you. To test, you can try removing `_SERVER['SERVER_PORT'] = 443;` from a site that uses HTTPS with CloudFlare, for example. When removing this, you should still be able to use features relying on the WordPress.com connection, like [the Post Editor on WordPress.com](https://wordpress.com/post/).
- We fixed Fatal Errors occuring when Jetpack was activated alongside other plugins using an old `Bitly` class, such as old versions of the official Bitly plugin. To test this, try using Jetpack alongside an old version of that plugin.
- We improved the connection process when HTTPS isn't properly configured on a site before it's connected to WordPress.com. To test, you can follow the instructions [here](https://github.com/Automattic/jetpack/pull/3816).

### JSON API

- We updated several API endpoints to match WordPress.com endpoints, with a focus on SAL (Site Abstraction Layer). To test, you can try using several features from the WordPress.com desktop apps or from WordPress.com to manage your Jetpack site, and make sure everything works properly. You should be able to change site settings, publish and update posts and pages, update plugins, customize your theme...
- We added support for custom taxonomies, to prepare for the upcoming custom post types features in Calypso. You can follow the instructions [here](https://github.com/Automattic/jetpack/pull/4128) to test things.

### Photon

- Starting in 4.0.4, we modified image sizes to match a theme's `$content_width` value. Unfortunately that's not always desired when a theme inserts images outside of the post content. To test our fix, you can follow the instructions [here](https://github.com/Automattic/jetpack/pull/4226#issuecomment-228783037).

### Publicize

- We've added a new filter, `jetpack_publicize_capability`, allowing you to give Publicize capabilities to more users. You can read more about it [here](https://github.com/Automattic/jetpack/pull/3740).

### Sharing

- Make sure your sharing buttons display as expected
- Add Telegram and WhatsApp buttons and make sure they operate properly

### Shortcodes

- New Untappd shortcode. To test: Shortcodes enabled, test `[untappd-menu location="65" menu="3355a50d-600d-4956-9491-dd0ac2582053"]`
- Recipes: new shortcodes and options to create more detailed recipes. To test, you can follow the instructions in [this support document](https://en.support.wordpress.com/recipes/).
- VideoPress: use HTML5 videos when using the `freedom` shortcode parameter. To test, try using the `force_flash` and `freedom` parameters when inserting VideoPress shortcodes, and check that the video is displayed according to your settings.
- VideoPress: we've made some changes to the shortcode modal, available when inserting and editing a VideoPress video in the Visual Editor. To test, you can play with shortcode options for a video you've inserted by clicking on the little Pencil icon appearing above the video.
- Audio: we have completely removed the Audio shortcode, as audio players have been part of WordPress Core for some time, and we didn't include our shortcode for all versions of WordPress above 3.6. To test, try [inserting Audio shortcodes](https://codex.wordpress.org/Audio_Shortcode) into your posts, and make sure no error appears.

### Sitemaps

- We made some changes to avoid PHP notices when one of your posts included a slideshow. To test, you can follow the instructions [here](https://github.com/Automattic/jetpack/pull/4068).
- Sitemaps also support permalinks using `index.php` now. You can follow the instructions [here](https://github.com/Automattic/jetpack/pull/4093) for your tests.

### Support

- We've improved the self-help tools available in the Jetpack Debug menu. To test, you can go to the Jetpack Menu in your dashboard, scroll down, click on "Debug", and make sure there are no errors on the page or in your logs. You should also be able to use the Contact Form to send debug information to the Jetpack Support team.

### Tiled Galleries

- In some cases, like when specific concatenating plugin were used to minify and reorder JavaScript resources, Tiled Galleries would give JavaScript errors, as explained [here](https://github.com/Automattic/jetpack/issues/4179). You should now be able to display Tiled Galleries without any issues.

### Widgets

- We've refactored the Contact Info Widget to improve performance. To test, try adding and editing options of a Contact Info Widget.
- We now use Photon to resize images in the Gallery Widget, thus improving performance of that widget. To test it, add a Gallery widget to your sidebar, set it to use Tiles, and make sure the images are displayed properly and use Photon (i.e. use the `i*.wpcom` domain).
- You can now set the top posts widget to look at traffic for more than the last 10 days. Try cranking up that setting and make sure nothing breaks.
- Image Widget: Image dimensions are now saved properly when you first add an image URL to the Image Widget. To test the fix, you can follow the instructions [here](https://github.com/Automattic/jetpack/issues/4218).
- Contact Info Widget: Google Maps [made some changes to their API a few days ago](https://developers.google.com/maps/documentation/javascript/get-api-key). As a result, domains that weren't using the API before June 22, 1016, will need an API key to display the map included in the Contact Info Widget. To test this change, you can add the following to a functionality plugin on your site, and make sure the map is displayed properly.
```php
function jeherve_google_maps_key() {
	// Grab your own Google Maps API Key here: https://developers.google.com/maps/documentation/javascript/get-api-key
        return 'xxxx';
}
  //add_filter( 'jetpack_google_maps_api_key', 'jehegoogle_maps_key';
```
- Twitter now supports several types of Widgets. We've made some changes to our Twitter Timeline Widget to accept one more widget type, in addition to the old and soon to be deprecated Twittter IDs. To test, try the following:
 	1. Go to [https://twitter.com/settings/widgets](https://twitter.com/settings/widgets)
	2. Pick an existing Widget, edit it, and copy the Widget ID.
	3. Back in your dashboard, create a new Twitter Timeline Widget with that Widget ID. It should work.
	4. Drag another Twitter Timeline Widget to the sidebar, and select the 'Profile' Widget type.
	5. Try entering a Twitter username, and see if that works properly.
