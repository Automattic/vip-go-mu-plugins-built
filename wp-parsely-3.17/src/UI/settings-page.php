<?php
/**
 * Views: Plugin settings view
 *
 * Shows the settings page.
 *
 * @package Parsely
 */

declare(strict_types=1);

namespace Parsely;

use Parsely\UI\Settings_Page;

/* translators: %s: Plugin version */
$parsely_version_string = sprintf( __( 'Version %s', 'wp-parsely' ), Parsely::VERSION );

/**
 * Variable.
 *
 * @var Settings_Page
 */
$wp_parsely_settings = $GLOBALS['parsely_settings_page'];
?>

<?php
if ( is_multisite() && is_main_site() ) {
	?>
		<div class="notice notice-info">
			<p><?php esc_html_e( 'Attention: this is the main site of your Multisite Network.', 'wp-parsely' ); ?></p>
		</div>
	<?php
}
?>

<div class="wrap">
	<h1 class="wp-heading-inline"><?php echo esc_html_e( 'Parse.ly Settings', 'wp-parsely' ); ?></h1>
	<span id="wp-parsely_version"><?php echo esc_html( $parsely_version_string ); ?></span>

	<?php $wp_parsely_settings->show_setting_tabs(); ?>

	<form name="parsely" method="post" action='options.php' novalidate hidden>
		<?php
		settings_fields( Parsely::OPTIONS_KEY );
		$wp_parsely_settings->show_setting_tabs_content();

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['e2e_parsely_skip_api_validate'] ) && 'y' === $_GET['e2e_parsely_skip_api_validate'] ) {
			?>
			<input type="hidden" name="e2e_parsely_skip_api_validate" value="y" />
			<?php
		}

		submit_button();
		?>
	</form>
</div>
