<?php
/**
 * Logo header template for the Gist Answers plugin admin menus.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

use GistAnswers\Admin\AdminMain;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
$source         = strval( $source ?? '' );
$page_title     = strval( $page_title ?? '' );
$explainer_text = strval( $explainer_text ?? '' );
$aux_button     = is_object( $aux_button ?? null ) ? $aux_button : null;

$environment = match ( Utilities::get_build_environment_slug() ) {
	'local-dev' => 'Local dev',
	'staging'   => 'Staging API',
	default     => '',
};
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<div class="gist-answers-admin-menu-header">
	<div class="gist-answers-admin-menu-header-row">
		<?php echo wp_kses_post( AdminMain::get_logo_img() ); ?>

		<?php if ( ! empty( $environment ) ) : ?>
			<span class="gist-answers-admin-menu-environment"><?php echo esc_html( $environment ); ?></span>
		<?php endif; ?>
	</div><!-- .gist-answers-admin-menu-header-row -->

	<div class="gist-answers-admin-menu-header-row">
		<?php if ( ! empty( $page_title ) ) : ?>
			<h1 class="gist-answers-admin-menu-main-heading"><?php echo esc_html( $page_title ); ?></h1>
		<?php endif; ?>

		<?php if ( is_object( $aux_button ) ) : ?>
			<?php // phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only. ?>
			<?php $button_label = strval( $aux_button->label ?? '' ); ?>
			<?php $button_action = strval( $aux_button->action ?? '' ); ?>
			<?php // phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited ?>

			<?php if ( ! empty( $button_label ) && ! empty( $button_action ) ) : ?>
				<button class="gist-answers-button-compact gist-answers-admin-aux-button" onclick="<?php echo esc_attr( $button_action ); ?>">
					<?php echo esc_html( $button_label ); ?>
				</button>
			<?php endif; ?>
		<?php endif; ?>

		<?php if ( ! empty( $explainer_text ) ) : ?>
			<p class="gist-answers-admin-menu-explainer"><?php echo wp_kses_post( $explainer_text ); ?></p>
		<?php endif; ?>
	</div><!-- .gist-answers-admin-menu-header-row -->
</div>
