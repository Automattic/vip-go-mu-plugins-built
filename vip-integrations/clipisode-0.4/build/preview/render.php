<?php
defined( 'ABSPATH' ) || exit;

$wrapper = get_block_wrapper_attributes( [
	'class' => 'cp-preview-root',
] );

echo "<div $wrapper>$content</div>";
