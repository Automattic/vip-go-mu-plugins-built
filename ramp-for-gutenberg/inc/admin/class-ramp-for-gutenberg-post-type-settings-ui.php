<?php

class Ramp_For_Gutenberg_Post_Type_Settings_UI {

	/**
	 * @var Ramp_For_Gutenberg instance
	 */
	protected $ramp_for_gutenberg;

	/**
	 * Ramp_For_Gutenberg_Post_Type_Settings_UI constructor.
	 */
	public function __construct() {

		if ( ! current_user_can( 'administrator' ) ) {
			return;
		}

		$this->ramp_for_gutenberg = Ramp_For_Gutenberg::get_instance();
		$this->add_writing_settings_section();
	}

	/**
	 * This method will add a "Ramp for Gutenberg" section to "Settings -> Writing"
	 */
	public function add_writing_settings_section() {

		register_setting(
			'writing',
			'ramp_for_gutenberg_post_types',
			[
				'sanitize_callback' => [ $this, 'sanitize_post_types_callback' ],
			]
		);

		add_settings_section(
			'ramp_for_gutenberg_post_types',
			esc_html__( 'Ramp for Gutenberg', 'ramp-for-gutenberg' ),
			[ $this, 'render_settings_section' ],
			'writing'
		);
	}

	/**
	 * Make sure that only supported post types are saved as Gutenberg-enabled
	 * Used as a callback for `register_setting`
	 *
	 * @param $post_types
	 *
	 * @return array
	 */
	public function sanitize_post_types_callback( $post_types ) {

		$post_types           = array_unique( (array) $post_types );
		$supported_post_types = array_keys( $this->ramp_for_gutenberg->get_supported_post_types() );

		/**
		 * Validate & Sanitize
		 */
		$validated_post_types = [];
		foreach ( $post_types as $post_type ) {
			if ( in_array( $post_type, $supported_post_types, true ) ) {
				$validated_post_types[] = $post_type;
			} else {
				add_settings_error(
					'ramp_for_gutenberg_post_types',
					'ramp_for_gutenberg_post_types',
					sprintf( esc_html__( "Can't enable Gutenberg for post type \"%s\"" ), sanitize_title( $post_type ) )
				);
			}
		}

		/*
		 * Don't store post types enabled through the helper function
		 *
		 * Even though `disabled` attribute prevents data from being submitted to server
		 * This is just going to make sure it accidentally doesn't fall through
		 */
		$helper_enabled_post_types = (array) $this->ramp_for_gutenberg->get_criteria( 'post_types' );
		$validated_post_types      = array_diff( $validated_post_types, $helper_enabled_post_types );

		return $validated_post_types;
	}

	/**
	 * Render the "Ramp for Gutenberg" section in the dashboard
	 */
	function render_settings_section() {

		$post_types                = $this->ramp_for_gutenberg->get_supported_post_types();
		$helper_enabled_post_types = (array) $this->ramp_for_gutenberg->get_criteria( 'post_types' );
		$enabled_post_types        = $this->ramp_for_gutenberg->get_enabled_post_types();
		?>
		<div class="ramp-for-gutenberg-description">
			<p>
				<?php esc_html_e( 'Use these settings to enable Gutenberg for specific post types.', 'ramp-for-gutenberg' ); ?>
			</p>
		</div>

		<table class="form-table">
			<tbody>
			<tr class="ramp-for-gutenberg-post-types">
				<th scope="row"><?php esc_html_e( 'Enable Gutenberg on', 'ramp-for-gutenberg' ); ?></th>
				<td>
					<fieldset>
						<legend class="screen-reader-text"><span><?php esc_html_e( 'Enable Gutenberg on', 'ramp-for-gutenberg' ); ?> </span></legend>

						<?php foreach ( $post_types as $slug => $label ) : ?>
							<?php $is_helper_enabled_post_type = in_array( $slug, $helper_enabled_post_types, true ); ?>

							<label for="rfg-post-type-<?php echo esc_attr( $slug ) ?>">

								<input name="ramp_for_gutenberg_post_types[]"
									   type="checkbox"
									   id="rfg-post-type-<?php echo esc_attr( $slug ) ?>"
										<?php
										// maybe display "checked"attribute?
										checked( in_array( $slug, $enabled_post_types, true ), true );

										// maybe display "disabled" attribute?
										if ( $is_helper_enabled_post_type ) {
											echo ' disabled ';
										}
										?>
									   value="<?php echo esc_attr( $slug ) ?>">

								<span><?php echo esc_html( $label ) ?></span>
							</label>
							<?php if ( $is_helper_enabled_post_type ): ?>
								<small style="margin-left: 1rem;">
									<a href="https://github.com/Automattic/ramp-for-gutenberg#faqs"><?php esc_html_e( 'Why is this disabled?', 'ramp-for-gutenberg' ); ?></a>
								</small>
							<?php endif; ?>
							<br>

						<?php endforeach; ?>
					</fieldset>
				</td>
			</tr>
			</tbody>
		</table>

		<div class="ramp-for-gutenberg-description">
			<p>
				<?php printf(
					esc_html__( 'For more granular control you can use the %s function.', 'ramp-for-gutenberg' ),
					'<code>ramp_for_gutenberg_load_gutenberg()</code>'
				); ?>
				<a href="https://github.com/Automattic/ramp-for-gutenberg#faqs" target="_blank"><?php esc_html_e( 'Learn more', 'ramp-for-gutenberg' ); ?></a>
			</p>
		</div>
		<?php
	}


}