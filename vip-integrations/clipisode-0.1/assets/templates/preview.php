<?php
/**
 * Template for /{prefix}/{id}/{media_id}/{slug} — public clipisode preview page.
 *
 * Validates all three URL segments match a single clipisode_outputs row,
 * loads the preview layout CPT post, injects the output ID, and renders via do_blocks().
 */

defined( 'ABSPATH' ) || exit;

global $wpdb;

$output_id = (int) get_query_var( 'clipisode_preview_id' );
$media_id  = (int) get_query_var( 'clipisode_preview_media' );
$slug      = sanitize_text_field( get_query_var( 'clipisode_preview_slug' ) );

$outputs_table = $wpdb->prefix . 'clipisode_outputs';
$output = $wpdb->get_row( $wpdb->prepare(
	"SELECT * FROM $outputs_table WHERE id = %d AND media_id = %d AND slug = %s",
	$output_id, $media_id, $slug
) );

if ( ! $output ) {
	status_header( 404 );
	echo '<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>Clipisode not found.</h1></body></html>';
	exit;
}

$video_url = Clipisode_Media::get_url( (int) $output->media_id );
if ( ! $video_url ) {
	status_header( 404 );
	echo '<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>Video not available.</h1></body></html>';
	exit;
}

$topic = null;
if ( $output->topic_id ) {
	$topics_table = $wpdb->prefix . 'clipisode_topics';
	$topic = $wpdb->get_row( $wpdb->prepare(
		"SELECT * FROM $topics_table WHERE id = %d", $output->topic_id
	) );
}

$preview_id = Clipisode_Post_Types::get_default_preview_id();
if ( ! $preview_id ) {
	$preview_id = Clipisode_Post_Types::ensure_default_preview();
}

$preview_post = get_post( $preview_id );
if ( ! $preview_post ) {
	status_header( 500 );
	echo '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Preview layout not found.</h1></body></html>';
	exit;
}

$content    = $preview_post->post_content;
$safe_id    = (int) $output->id;

if ( preg_match( '/<!-- wp:clipisode\/preview-flow \{.*?"outputId"/', $content ) ) {
	$content = preg_replace(
		'/("outputId"\s*:\s*)\d+/',
		'${1}' . $safe_id,
		$content,
		1
	);
} elseif ( preg_match( '/<!-- wp:clipisode\/preview-flow \{/', $content ) ) {
	$content = preg_replace(
		'/(<!-- wp:clipisode\/preview-flow \{)/',
		'$1"outputId":' . $safe_id . ',',
		$content,
		1
	);
} else {
	$content = preg_replace(
		'/<!-- wp:clipisode\/preview-flow -->/',
		'<!-- wp:clipisode/preview-flow {"outputId":' . $safe_id . '} -->',
		$content,
		1
	);
}

show_admin_bar( false );
$rendered = do_blocks( $content );

$og_title       = esc_attr( $output->name );
$og_description = '';
if ( $topic ) {
	$parts = array_filter( [ $topic->title, $topic->hosted_by ? 'hosted by ' . $topic->hosted_by : '' ] );
	$og_description = esc_attr( implode( ', ', $parts ) );
}
$og_url   = esc_url( home_url( Clipisode_Preview::get_prefix() . '/' . $output->id . '/' . $output->media_id . '/' . $output->slug ) );
$og_image = '';
if ( $topic && ! empty( $topic->social_image_media_id ) ) {
	$og_image = Clipisode_Media::get_url( (int) $topic->social_image_media_id );
}
if ( ! $og_image ) {
	$og_image = plugins_url( 'assets/images/clipisode.png', CLIPISODE_PLUGIN_DIR . 'clipisode.php' );
}
$og_image = esc_url( $og_image );

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<title><?php echo esc_html( $output->name ); ?> — <?php bloginfo( 'name' ); ?></title>
	<meta property="og:type" content="video.other">
	<meta property="og:title" content="<?php echo $og_title; ?>">
<?php if ( $og_description ) : ?>
	<meta property="og:description" content="<?php echo $og_description; ?>">
<?php endif; ?>
	<meta property="og:url" content="<?php echo $og_url; ?>">
	<meta property="og:image" content="<?php echo $og_image; ?>">
	<meta property="og:video" content="<?php echo esc_url( $video_url ); ?>">
	<meta property="og:video:type" content="video/mp4">
	<meta name="twitter:card" content="player">
	<meta name="twitter:title" content="<?php echo $og_title; ?>">
<?php if ( $og_description ) : ?>
	<meta name="twitter:description" content="<?php echo $og_description; ?>">
<?php endif; ?>
	<meta name="twitter:image" content="<?php echo $og_image; ?>">
	<meta name="twitter:player" content="<?php echo $og_url; ?>">
	<?php wp_head(); ?>
</head>
<body>
<?php echo $rendered; ?>
<?php wp_footer(); ?>
</body>
</html>
