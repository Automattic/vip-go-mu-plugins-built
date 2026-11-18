<?php
/**
 * Activation form template for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
$field = is_object( $field ?? null ) ? $field : (object) array();

$id          = $field->id ?? null;
$type        = $field->type ?? null;
$label       = $field->label ?? null;
$prefill     = $field->prefill ?? null;
$required    = $field->required ?? null;
$readonly    = $field->readonly ?? null;
$placeholder = $field->placeholder ?? null;
$options     = $field->options ?? null;
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<div class="gist-answers-admin-form-field <?php echo ( $required ? 'gist-answers-admin-form-field-required' : '' ); ?>">
	<label for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></label>

	<?php
	// phpcs:disable Squiz.PHP.NonExecutableCode.Unreachable -- Multiple false positives here; there is no executable code after any of the break statements.
	switch ( $type ) :
		default:
			break;
		?>

		<?php
		case 'hidden':
			?>
			<input
				type="hidden"
				id="<?php echo esc_attr( $id ); ?>"
				name="<?php echo esc_attr( $id ); ?>"
				value="<?php echo esc_attr( $prefill ); ?>"
			>

			<?php break; ?>

		<?php
		case 'checkbox':
			?>
			<input
				type="checkbox"
				id="<?php echo esc_attr( $id ); ?>"
				name="<?php echo esc_attr( $id ); ?>"
				<?php echo ( $prefill ? 'checked' : '' ); ?>
			>

			<?php break; ?>

		<?php
		case 'select':
			?>
			<select
				id="<?php echo esc_attr( $id ); ?>"
				name="<?php echo esc_attr( $id ); ?>"
				<?php echo ( $required ? 'required' : '' ); ?>
				<?php echo ( $readonly ? 'readonly' : '' ); ?>
			>
				<option value=""><?php esc_html_e( 'Select an option', 'gist-answers' ); ?> &hellip;</option>

				<?php if ( is_array( $options ) ) : ?>
					<?php foreach ( $options as $option_value => $option_label ) : // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only. ?>
						<option value="<?php echo esc_attr( $option_value ); ?>" <?php echo ( $prefill === $option_value || 1 === count( $options ) ? 'selected' : '' ); ?>>
							<?php echo esc_html( $option_label ); ?>
						</option>
					<?php endforeach; ?>
				<?php endif; ?>
			</select>

			<?php break; ?>

		<?php
		case 'text':
			?>
			<input
				type="text"
				id="<?php echo esc_attr( $id ); ?>"
				name="<?php echo esc_attr( $id ); ?>"
				placeholder="<?php echo esc_attr( $placeholder ); ?>"
				autocomplete="off"
				<?php echo ( $required ? 'required' : '' ); ?>
				<?php echo ( $readonly ? 'readonly' : '' ); ?>
				value="<?php echo esc_attr( $prefill ); ?>"
			>

			<?php break; ?>
		<?php
		endswitch;
		// phpcs:enable Squiz.PHP.NonExecutableCode.Unreachable
	?>
</div><!-- .gist-answers-admin-form-field -->
