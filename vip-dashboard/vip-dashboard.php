<?php
/*
Plugin Name: VIP Dashboard
Plugin URI: http://vip.wordpress.com
Description: WordPress VIP Dashboard
Author: Scott Evans, Filipe Varela
Version: 1.0
Author URI: http://vip.wordpress.com
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: vip-dashboard
Domain Path: /languages/
*/

/**
 * Boot the new VIP Dashboard
 *
 * @return void
 */
function vip_dashboard_init() {

	require __DIR__ . '/plugins-ui/plugins-ui.php';

	// admin only
	if ( ! is_admin() )
		return;

	// Enable menu for all sites using a VIP and a8c sites
	add_action( 'admin_menu', 'wpcom_vip_admin_menu', 5 );
	add_action( 'admin_menu', 'wpcom_vip_rename_vip_menu_to_dashboard', 50 );

	// Remove standard WP plugins screen
	add_action( 'admin_menu', 'vip_dashboard_remove_menu_pages' );
	add_action( 'load-plugins.php', 'vip_dashboard_prevent_admin_access' );

}
add_action( 'plugins_loaded', 'vip_dashboard_init' );

/**
 * Register master stylesheet (compiled via gulp)
 *
 * @return void
 */
function vip_dashboard_admin_styles() {
	wp_register_style( 'vip-dashboard-style', plugins_url( '/assets/css/style.css', __FILE__ ) , '1.0' );
	wp_enqueue_style( 'vip-dashboard-style' );
}

/**
 * Register master JavaScript (compiled via gulp)
 *
 * @return void
 */
function vip_dashboard_admin_scripts() {
	wp_register_script( 'vip-dashboard-script', plugins_url( '/assets/js/vip-dashboard.js', __FILE__ ), array( 'jquery' ), '1.0', true );
	wp_enqueue_script( 'vip-dashboard-script' );
}

/**
 * Remove plugins menu item for all but vip_support
 *
 * @return void
 */
function vip_dashboard_remove_menu_pages() {
	remove_menu_page( 'plugins.php' );
}

/**
 * Limit plugins.php access to vip_support role
 *
 * @return void
 */
function vip_dashboard_prevent_admin_access() {
	$user = wp_get_current_user();

	if ( ! in_array( 'vip_support', $user->roles ) ) {
		wp_safe_redirect( esc_url( add_query_arg( array( 'page' => 'vip-plugins'), admin_url( 'admin.php' ) ) ) );
	}
}

/**
 * Output the dashboard page, an empty div for React to initialise against
 *
 * @return void
 */
function vip_dashboard_page() {

	$current_user = wp_get_current_user();
	$name         = $current_user->display_name;
	$email        = $current_user->user_email;
	$ajaxurl      = add_query_arg( array( '_wpnonce' => wp_create_nonce( 'vip-dashboard' ) ), untrailingslashit( admin_url( 'admin-ajax.php' ) ) );
	?>
	<div id="app"
		data-ajaxurl="<?php echo esc_url( $ajaxurl ); ?>"
		data-asseturl="<?php echo esc_attr( plugins_url( '/assets/', __FILE__ ) ); ?>"
		data-email="<?php echo esc_attr( $email ); ?>"
		data-name="<?php echo esc_attr( $name ); ?>"
		data-adminurl="<?php echo admin_url( 'admin.php' ); ?>"
	></div>
	<?php
}

/**
 * Support/Contact form handler - sent from React to admin-ajax
 *
 * @return json
 */
function vip_contact_form_handler() {

	// check for required fields and nonce
	if ( !isset( $_POST['body'], $_POST['subject'], $_GET['_wpnonce'] ) ) {

		$return = array(
			'status'=> 'error',
			'message' => __( 'Please complete all required fields.', 'vip-dashboard' )
		);
		echo json_encode( $return );
		die();
	}

	// check nonce is valid
	if ( !wp_verify_nonce( $_GET['_wpnonce'], 'vip-dashboard' ) ) {

		$return = array(
			'status'=> 'error',
			'message' => __( 'Security check failed. Make sure you should be doing this, and try again.', 'vip-dashboard' )
		);
		echo json_encode( $return );
		die();
	}

	// settings
	$vipsupportemailaddy  = 'vip-support@wordpress.com';
	$cc_headers_to_kayako = '';

	// default values
	$sendemail    = true;                  // Should we send an e-mail? Tracks errors.
	$emailsent    = false;                 // Tracks wp_mail() results
	$new_tmp_name = false;                 // For an attachment
	$current_user = wp_get_current_user(); // Current user

	// name & email
	$name          = ( ! empty( $_POST['name']  ) ) ? strip_tags( stripslashes( $_POST['name']  ) ) : $current_user->display_name;
	$email         = ( ! empty( $_POST['email'] ) ) ? strip_tags( stripslashes( $_POST['email'] ) ) : $current_user->user_email;

	// check for valid email
	if ( !is_email( $email ) ) {
		$return = array(
			'status'=> 'error',
			'message' => __( 'Please enter a valid email for your ticket.', 'vip-dashboard' )
		);
		echo json_encode( $return );
		die();
	}

	// subject, group, & priority
	$subject       = ( ! empty( $_POST['subject']  ) ) ? strip_tags( stripslashes( $_POST['subject']  ) ) : '';
	$group         = ( ! empty( $_POST['type']     ) ) ? strip_tags( stripslashes( $_POST['type']     ) ) : 'Technical';
	$priority      = ( ! empty( $_POST['priority'] ) ) ? strip_tags( stripslashes( $_POST['priority'] ) ) : 'Medium';

	// cc
	$ccemail       = ( ! empty( $_POST['cc'] ) ) ? strip_tags( stripslashes( $_POST['cc'] ) ) : '';
	$temp_ccemails = explode( ',', $ccemail );
	$temp_ccemails = array_filter( array_map( 'trim', $temp_ccemails ) );
	$ccemails      = array();
	if ( !empty( $temp_ccemails ) ) {
		foreach ( array_values( $temp_ccemails ) as $value ) {
			if ( is_email( $value ) ) {
				$ccemails[] = $value;
			}
		}
	}
	$ccemails = apply_filters( 'vip_contact_form_cc', $ccemails );

	if ( count( $ccemails ) )
		$cc_headers_to_kayako .= 'CC: ' . implode( ',', $ccemails ) . "\r\n";

	// check subject is not empty
	if ( empty( $subject ) ) {
		$return = array(
			'status'=> 'error',
			'message' => __( 'Please enter a descriptive subject for your ticket.', 'vip-dashboard' )
		);
		echo json_encode( $return );
		die();
	}

	// check body is not empty
	if ( $_POST['body'] == '' ) {
		$return = array(
			'status'=> 'error',
			'message' => __( 'Please enter a detailed description of your issue.', 'vip-dashboard' )
		);
		echo json_encode( $return );
		die();
	}

	if ( 'Emergency' === $priority )
		$subject = sprintf( '[%s] %s', $priority, $subject );

	$content = stripslashes( $_POST['body'] ) . "\n\n--- Ticket Details --- \n";

	// priority
	if ( ! empty( $_POST['vipsupport-priority'] ) )
		$content .= "\nPriority: " . $priority;

	$content .= "\nUser: " . $current_user->user_login . ' | ' . $current_user->display_name;

	// VIP DB
	$theme = wp_get_theme();
	$content .= "\nSite Name: " . get_bloginfo( 'name' );
	$content .= "\nSite URLs: " . site_url() . ' | ' . admin_url();
	$content .= "\nTheme: " . get_option( 'stylesheet' ) . ' | '. $theme->get( 'Name' ) ;

	// added for VIPv2
	$content .= "\nPlatform: VIPv2";

	// send date and time
	$content .= sprintf( "\n\nSent from %s on %s", home_url(), date( 'c', current_time( 'timestamp', 1 ) ) );

	// attachments - currently not in use of VIPv2
	$attachments = array();
	if ( ! empty( $_FILES['vipsupport-attachment'] ) && 4 != $_FILES['vipsupport-attachment']['error'] ) {
		if ( 0 != $_FILES['vipsupport-attachment']['error'] || empty( $_FILES['vipsupport-attachment']['tmp_name'] ) ) {
			$sendemail = false;

			switch ( $_FILES['vipsupport-attachment']['error'] ) {
				case 1:
				case 2:
					$max_upload_size = vip_dashboard_contact_form_get_max_upload_size();
					add_settings_error( 'vipsupport', 'attachment_error', sprintf( 'Your uploaded file was too large. Our ticketing system can only accept files up to %s big. Try using <a href="http://www.dropbox.com/">Dropbox</a>, <a href="https://www.yousendit.com/">YouSendIt</a>, or hosting it on a FTP server instead.', $max_upload_size['human'] ), 'error' );
					break;
				case 3:
					add_settings_error( 'vipsupport', 'attachment_error', 'Your uploaded file only partially uploaded. Please try again.', 'error' );
					break;
				default;
					add_settings_error( 'vipsupport', 'attachment_error', 'There was an error with the attachment upload.', 'error' );
			}
		} else {
			// We need the filename to be correct
			// Don't forget to delete the file manually when done since it's been renamed!
			$new_tmp_name = str_replace(
				basename( $_FILES['vipsupport-attachment']['tmp_name'] ),
				$_FILES['vipsupport-attachment']['name'],
				$_FILES['vipsupport-attachment']['tmp_name']
			);
			rename( $_FILES['vipsupport-attachment']['tmp_name'], $new_tmp_name );
			$attachments = array( $new_tmp_name );
		}
	}

	// send the email and unlink upload if required
	$headers = "From: \"$name\" <$email>\r\n";
	if ( wp_mail( $vipsupportemailaddy, $subject, $content, $headers . $cc_headers_to_kayako, $attachments ) ) {

		if ( $new_tmp_name )
			unlink( $new_tmp_name );

		$return = array(
			'status'=> 'success',
			'message' => __( 'Your support request is on its way, we will be in touch soon.', 'vip-dashboard' )
		);
		echo json_encode( $return );
		die();

	} else {

		if ( $new_tmp_name )
			unlink( $new_tmp_name );

		$manual_link = vip_echo_mailto_vip_hosting( __( 'Please send in a request manually.', 'vip-dashboard' ), false );
		$return = array(
			'status'=> 'error',
			'message' => sprintf( __( 'There was an error sending the support request. %1$s', 'vip-dashboard' ),  $manual_link )
		);
		echo json_encode( $return );
		die();
	}

	die();
}
add_action( 'wp_ajax_vip_contact', 'vip_contact_form_handler' );

/**
 * Generate a manual email link if the send fails
 *
 * @param  string $linkText
 * @param  bool $echo
 * @return html
 */
function vip_echo_mailto_vip_hosting( $linkText = 'Send an email to VIP Hosting.', $echo = true ) {

	$current_user = get_currentuserinfo();

	$name = '';
	if ( isset( $_POST['name'] ) ) {
		$name = sanitize_text_field( $_POST['name'] );
	} else if ( isset( $current_user->display_name ) ) {
		$name = $current_user->display_name;
	}

	$useremail = '';
	if ( isset( $_POST['email'] ) && is_email( $_POST['email'] ) ) {
		$useremail = sanitize_email( $_POST['email'] );
	} else if ( isset( $current_user->user_email ) ) {
		$name = $current_user->user_email;
	}

	$email  = "\n\n--\n";
	$email .= "Name: " . $name . "\n";
	$email .= "Email: " . $useremail . "\n";
	$email .= "URL: " . home_url() . "\n";
	$email .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";
	$email .= "Server: " . php_uname( 'n' ) . "\n";
	$email .= "Browser: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
	$email .= "Platform: VIPv2";

	$url = add_query_arg( array( 'subject' => __( 'Descriptive subject please', 'vip-dashboard' ), 'body' => rawurlencode( $email ) ), 'mailto:vip-support@wordpress.com' );

	// $url not escaped on output as email formatting is borked by esc_url:
	// https://core.trac.wordpress.org/ticket/31632
	$html = '<a href="' . $url . '">' . esc_html( $linkText )  . '</a>';

	if ( $echo )
		echo $html;

	return $html;
}

function wpcom_vip_admin_menu() {
	$vip_page_slug = 'vip-dashboard';
	$vip_page_cap  = 'publish_posts';

	if ( ! current_user_can( $vip_page_cap ) )
		return;

	$page = add_menu_page( __( 'VIP Dashboard' ), __( 'VIP' ), $vip_page_cap, $vip_page_slug, 'vip_dashboard_page', 'dashicons-tickets' );

	// Add hooks to initialize the Dashboard
	add_action( 'admin_print_styles-' . $page, 'vip_dashboard_admin_styles' );
	add_action( 'admin_print_scripts-' . $page, 'vip_dashboard_admin_scripts' );

	// Needed to move up VIP between Dashboard and Store
	add_filter( 'custom_menu_order', '__return_true'  );
	add_filter( 'menu_order',        'wpcom_vip_menu_order' );
}

function wpcom_vip_rename_vip_menu_to_dashboard() {
	global $submenu;

	// Rename the first (auto-added) entry in the Dashboard. Kinda hacky, but the menu doesn't have any filters
	if ( isset( $submenu['vip-dashboard'][0][0] ) )
		$submenu['vip-dashboard'][0][0] = __( 'Dashboard' );
}

function wpcom_vip_menu_order( $menu_ord ) {
	// Bail if some other plugin nooped the menu
	if ( empty( $menu_ord ) )
		return false;

	// Define local variables
	$vip_order     = array();
	$previous_item = false;

	// Get the index of our custom separator
	$vip_dash  = 'vip-dashboard';
	$dash_menu = 'index.php';

	foreach ( $menu_ord as $item ) {
		if ( $dash_menu == $previous_item ) {
			$vip_order[] = $vip_dash;
			$vip_order[] = $item;
			unset( $menu_ord[$vip_dash] );
		} elseif ( $item != $vip_dash ) {
			$vip_order[] = $item;
		}

		$previous_item = $item;
	}

	return $vip_order;
}
