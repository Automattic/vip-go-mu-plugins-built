<?php declare(strict_types = 1);

use RemoteDataBlocks\Editor\DataBinding\BlockBindings;

// Global variables provided by WordPress for block rendering:
// $attributes (array): The block attributes.
// $content (string): The block default content.
// $block (WP_Block): The block instance.

$pagination_links = BlockBindings::get_pagination_links( $block );

// Skip the rendering if there are no pagination links.
if ( empty( $pagination_links ) ) {
	return null;
}

$next_page_link = $pagination_links['next_page'] ?? null;
$next_page_link_label = 'Next';
$previous_page_link = $pagination_links['previous_page'] ?? null;
$previous_page_link_label = 'Previous';

?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<div class="remote-data-pagination">
		<?php if ( null === $previous_page_link ) : ?>
			<?php echo esc_html( $previous_page_link_label ); ?>
		<?php else : ?>
			<a href="<?php echo esc_url( $previous_page_link ); ?>">
				<?php echo esc_html( $previous_page_link_label ); ?>
			</a>
		<?php endif; ?>

		<?php if ( null === $next_page_link ) : ?>
			<?php echo esc_html( $next_page_link_label ); ?>
		<?php else : ?>
			<a href="<?php echo esc_url( $next_page_link ); ?>">
				<?php echo esc_html( $next_page_link_label ); ?>
			</a>
		<?php endif; ?>
	</div>
</div>
