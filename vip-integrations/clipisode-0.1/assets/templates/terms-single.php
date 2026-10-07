<?php
defined( 'ABSPATH' ) || exit;

the_post();
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?php the_title(); ?> — <?php bloginfo( 'name' ); ?></title>
<style>
	body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; color: #1d2327; line-height: 1.7; font-size: 15px; }
	h1 { font-size: 24px; font-weight: 700; margin: 0 0 24px; }
</style>
</head>
<body>
	<h1><?php the_title(); ?></h1>
	<?php the_content(); ?>
</body>
</html>
