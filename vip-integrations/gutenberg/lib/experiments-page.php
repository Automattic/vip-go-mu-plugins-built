<?php
/**
 * Bootstrapping the Gutenberg experiments page.
 *
 * @package gutenberg
 */

if ( ! function_exists( 'the_gutenberg_experiments' ) ) {
	/**
	 * The main entry point for the Gutenberg experiments page.
	 *
	 * @since 6.3.0
	 */
	function the_gutenberg_experiments() {
		?>
		<div
			id="experiments-editor"
			class="wrap"
		>
		<h1><?php echo __( 'Experimental settings', 'gutenberg' ); ?></h1>
		<?php settings_errors(); ?>
		<form method="post" action="options.php">
			<?php settings_fields( 'gutenberg-experiments' ); ?>
			<?php do_settings_sections( 'gutenberg-experiments' ); ?>
			<?php submit_button(); ?>
		</form>
		</div>
		<?php
	}
}

/**
 * Set up the experiments settings.
 *
 * @since 6.3.0
 */
function gutenberg_initialize_experiments_settings() {
	add_settings_section(
		'gutenberg_experiments_section',
		// The empty string ensures the render function won't output a h2.
		'',
		'gutenberg_display_experiment_section',
		'gutenberg-experiments'
	);

	add_settings_field(
		'gutenberg-block-experiments',
		__( 'Blocks: add experimental blocks', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables experimental blocks on a rolling basis as they are developed.<p class="description">(Warning: these blocks may have significant changes during development that cause validation errors and display issues.)</p>', 'gutenberg' ),
			'id'    => 'gutenberg-block-experiments',
		)
	);

	add_settings_field(
		'gutenberg-form-blocks',
		__( 'Blocks: add Form and input blocks', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables new blocks to allow building forms. You are likely to experience UX issues that are being addressed.', 'gutenberg' ),
			'id'    => 'gutenberg-form-blocks',
		)
	);

	add_settings_field(
		'gutenberg-grid-interactivity',
		__( 'Blocks: add Grid interactivity', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables enhancements to the Grid block that let you move and resize items in the editor canvas.', 'gutenberg' ),
			'id'    => 'gutenberg-grid-interactivity',
		)
	);

	add_settings_field(
		'gutenberg-no-tinymce',
		__( 'Blocks: disable TinyMCE and Classic block', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Disables the TinyMCE and Classic block.', 'gutenberg' ),
			'id'    => 'gutenberg-no-tinymce',
		)
	);

	add_settings_field(
		'gutenberg-media-processing',
		__( 'Client-side media processing', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables client-side media processing to leverage the browser\'s capabilities to handle tasks like image resizing and compression.', 'gutenberg' ),
			'id'    => 'gutenberg-media-processing',
		)
	);

	add_settings_field(
		'gutenberg-block-comment',
		__( 'Collaboration: add block level comments', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables multi-user block level commenting.', 'gutenberg' ),
			'id'    => 'gutenberg-block-comment',
		)
	);

	add_settings_field(
		'gutenberg-sync-collaboration',
		__( 'Collaboration: enable real-time collaboration', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables real-time collaboration between peers.', 'gutenberg' ),
			'id'    => 'gutenberg-sync-collaboration',
		)
	);

	add_settings_field(
		'gutenberg-color-randomizer',
		__( 'Color randomizer', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables the Global Styles color randomizer in the Site Editor; a utility that lets you mix the current color palette pseudo-randomly.', 'gutenberg' ),
			'id'    => 'gutenberg-color-randomizer',
		)
	);

	add_settings_field(
		'gutenberg-custom-dataviews',
		__( 'Data Views: add Custom Views', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables the ability to add, edit, and save custom views when in the Site Editor.', 'gutenberg' ),
			'id'    => 'gutenberg-custom-dataviews',
		)
	);

	add_settings_field(
		'gutenberg-new-posts-dashboard',
		__( 'Data Views: enable for Posts', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables a redesigned posts dashboard accessible through a submenu item in the Gutenberg plugin.', 'gutenberg' ),
			'id'    => 'gutenberg-new-posts-dashboard',
		)
	);

	add_settings_field(
		'gutenberg-quick-edit-dataviews',
		__( 'Data Views: add Quick Edit', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables access to a Quick Edit panel in the Site Editor Pages experience.', 'gutenberg' ),
			'id'    => 'gutenberg-quick-edit-dataviews',
		)
	);

	add_settings_field(
		'gutenberg-editor-write-mode',
		__( 'Simplified site editing', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables Write mode in the Site Editor for a simplified editing experience.', 'gutenberg' ),
			'id'    => 'gutenberg-editor-write-mode',
		)
	);

	add_settings_field(
		'gutenberg-full-page-client-side-navigation',
		__( 'Interactivity API: Full-page client-side navigation', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'Enables full-page client-side navigation, powered by the Interactivity API.', 'gutenberg' ),
			'id'    => 'gutenberg-full-page-client-side-navigation',
		)
	);

	add_settings_field(
		'gutenberg-content-only-pattern-insertion',
		__( 'contentOnly: Make patterns contentOnly by default upon insertion', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label' => __( 'When patterns are inserted, default to a simplified content only mode for editing pattern content.', 'gutenberg' ),
			'id'    => 'gutenberg-content-only-pattern-insertion',
		)
	);

	register_setting(
		'gutenberg-experiments',
		'gutenberg-experiments'
	);
}

add_action( 'admin_init', 'gutenberg_initialize_experiments_settings' );

/**
 * Display a checkbox field for a Gutenberg experiment.
 *
 * @since 6.3.0
 *
 * @param array $args ( $label, $id ).
 */
function gutenberg_display_experiment_field( $args ) {
	$options = get_option( 'gutenberg-experiments' );
	$value   = isset( $options[ $args['id'] ] ) ? 1 : 0;
	?>
		<label for="<?php echo $args['id']; ?>">
			<input type="checkbox" name="<?php echo 'gutenberg-experiments[' . $args['id'] . ']'; ?>" id="<?php echo $args['id']; ?>" value="1" <?php checked( 1, $value ); ?> />
			<?php echo $args['label']; ?>
		</label>
	<?php
}

/**
 * Display the experiments section.
 *
 * @since 6.3.0
 */
function gutenberg_display_experiment_section() {
	?>
	<p><?php echo __( "The block editor includes experimental features that are usable while they're in development. Select the ones you'd like to enable. These features are likely to change, so avoid using them in production.", 'gutenberg' ); ?></p>

	<?php
}
