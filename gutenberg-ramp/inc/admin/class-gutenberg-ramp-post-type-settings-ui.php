<?php

class Gutenberg_Ramp_Post_Type_Settings_UI {

	/**
	 * @var Gutenberg_Ramp instance
	 */
	protected $gutenberg_ramp;

	/**
	 * Gutenberg_Ramp_Post_Type_Settings_UI constructor.
	 */
	public function __construct() {

		if ( ! current_user_can( 'administrator' ) ) {
			return;
		}

		$this->gutenberg_ramp = Gutenberg_Ramp::get_instance();
		$this->add_writing_settings_section();
	}

	/**
	 * This method will add a "Gutenberg Ramp" section to "Settings -> Writing"
	 */
	public function add_writing_settings_section() {

		register_setting(
			'writing',
			'gutenberg_ramp_post_types',
			[
				'sanitize_callback' => [ $this, 'sanitize_post_types_callback' ],
			]
		);

		add_settings_section(
			'gutenberg_ramp_post_types',
			esc_html__( 'Gutenberg Ramp', 'gutenberg-ramp' ),
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
		$supported_post_types = array_keys( $this->gutenberg_ramp->get_supported_post_types() );

		/**
		 * Validate & Sanitize
		 */
		$validated_post_types = [];
		foreach ( $post_types as $post_type ) {
			if ( in_array( $post_type, $supported_post_types, true ) ) {
				$validated_post_types[] = $post_type;
			} else {
				add_settings_error(
					'gutenberg_ramp_post_types',
					'gutenberg_ramp_post_types',
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
		$helper_enabled_post_types = (array) $this->gutenberg_ramp->get_criteria( 'post_types' );
		$validated_post_types      = array_diff( $validated_post_types, $helper_enabled_post_types );

		return $validated_post_types;
	}

	/**
	 * Render the "Gutenberg Ramp" section in the dashboard
	 */
	function render_settings_section() {

		$post_types                = $this->gutenberg_ramp->get_supported_post_types();
		$helper_enabled_post_types = (array) $this->gutenberg_ramp->get_criteria( 'post_types' );
		$enabled_post_types        = $this->gutenberg_ramp->get_enabled_post_types();
		?>
		<div class="gutenberg-ramp-description">
			<p>
				<?php esc_html_e( 'Use these settings to enable Gutenberg for specific post types.', 'gutenberg-ramp' ); ?>
			</p>
		</div>

		<table class="form-table">
			<tbody>
			<tr class="gutenberg-ramp-post-types">
				<th scope="row"><?php esc_html_e( 'Enable Gutenberg on', 'gutenberg-ramp' ); ?></th>
				<td>
					<fieldset>
						<legend class="screen-reader-text"><span><?php esc_html_e( 'Enable Gutenberg on', 'gutenberg-ramp' ); ?> </span></legend>

						<?php foreach ( $post_types as $slug => $label ) : ?>
							<?php $is_helper_enabled_post_type = in_array( $slug, $helper_enabled_post_types, true ); ?>

							<label for="rfg-post-type-<?php echo esc_attr( $slug ) ?>">

								<input name="gutenberg_ramp_post_types[]"
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
									<a href="https://github.com/Automattic/gutenberg-ramp#faqs"><?php esc_html_e( 'Why is this disabled?', 'gutenberg-ramp' ); ?></a>
								</small>
							<?php endif; ?>
							<br>

						<?php endforeach; ?>
					</fieldset>
				</td>
			</tr>
			</tbody>
		</table>

		<div class="gutenberg-ramp-description">
			<p>
				<?php printf(
					esc_html__( 'For more granular control you can use the %s function.', 'gutenberg-ramp' ),
					'<code>gutenberg_ramp_load_gutenberg()</code>'
				); ?>
				<a href="https://github.com/Automattic/gutenberg-ramp#faqs" target="_blank"><?php esc_html_e( 'Learn more', 'gutenberg-ramp' ); ?></a>
			</p>
		</div>
		<?php
	}


}