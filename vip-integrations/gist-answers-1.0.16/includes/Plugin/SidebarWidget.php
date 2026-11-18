<?php
/**
 * Classic sidebar widget for rendering Gist.ai widgets.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Plugin;

use InvalidArgumentException;
use WP_Widget;

use GistAnswers\Plugin\CommonMain;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Classic sidebar widget for Gist.ai answer/question widgets.
 */
final class SidebarWidget extends WP_Widget {

	/**
	 * Widget type.
	 *
	 * @var string
	 */
	private string $type;

	/**
	 * Constructor.
	 *
	 * @param string $type Widget type: answer or question.
	 *
	 * @throws InvalidArgumentException If the widget type is invalid.
	 */
	public function __construct( string $type ) {

		$type = match ( $type ) {
			'answer'   => 'answer',
			'question' => 'question',
			default    => '',
		};

		if ( empty( $type ) ) {
			throw new InvalidArgumentException( "Invalid widget type; must be 'answer' or 'question'" );
		}

		$this->type = $type;

		$label = ( 'answer' === $type )
			? __( 'Gist Answer Widget', 'gist-answers' )
			: __( 'Gist Question Widget', 'gist-answers' );

		$description = ( 'answer' === $type )
			? __( 'Displays a Gist Answer Widget.', 'gist-answers' )
			: __( 'Displays a Gist Question Widget.', 'gist-answers' );

		parent::__construct(
			'gist_answers_' . $type . '_widget',
			$label,
			array(
				'classname'                   => 'gist-answers-' . $type . '-widget',
				'description'                 => $description,
				'customize_selective_refresh' => true,
			),
		);
	}

	/**
	 * Render the widget frontend output.
	 *
	 * @param array<mixed> $args     Display arguments.
	 * @param array<mixed> $instance Saved widget instance.
	 *
	 * @return void
	 */
	public function widget( $args, $instance ): void {

		if ( wp_is_serving_rest_request() ) {

			$type = $this->type;

			require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/widget-placeholder.php';

			return;
		}

		$widget_id  = sanitize_text_field( $instance['widgetId'] ?? '' );
		$class_name = sanitize_text_field( $args['class'] ?? '' );

		if ( ! empty( $class_name ) ) {
			$before_widget = sprintf( '<div class="%s">', esc_attr( $class_name ) );
			$after_widget  = '</div>';
		} else {
			$before_widget = '';
			$after_widget  = '';
		}

		echo wp_kses_post( $args['before_widget'] ?? '' );
		echo wp_kses_post( $before_widget );

		gist_answers_render_widget(
			array(
				'type' => $this->type,
				'id'   => $widget_id,
			)
		);

		echo wp_kses_post( $after_widget );
		echo wp_kses_post( $args['after_widget'] ?? '' );
	}

	/**
	 * Render the widget admin form.
	 *
	 * @param array<mixed> $instance Saved widget instance.
	 *
	 * @return void
	 */
	public function form( $instance ): void {

		$widget_field_id   = $this->get_field_id( 'widgetId' );
		$widget_field_name = $this->get_field_name( 'widgetId' );
		$widget_id         = sanitize_text_field( $instance['widgetId'] ?? '' );

		$widget_options = CommonMain::get_widget_options_for( $this->type ?? '' );

		?>

		<p>
			<label for="<?php echo esc_attr( $widget_field_id ); ?>">
				<?php esc_html_e( 'Widget', 'gist-answers' ); ?>
			</label>

			<select
				class="widefat"
				id="<?php echo esc_attr( $widget_field_id ); ?>"
				name="<?php echo esc_attr( $widget_field_name ); ?>"
				required
			>
				<?php foreach ( $widget_options as $widget ) : ?>
					<option
						value="<?php echo esc_attr( $widget['value'] ); ?>"
						<?php selected( $widget_id, (string) $widget['value'] ); ?>
					>
						<?php echo esc_html( $widget['label'] ); ?>
					</option>
				<?php endforeach; ?>
			</select>
		</p>

		<?php
	}

	/**
	 * Sanitize widget settings before saving.
	 *
	 * @param array<mixed> $new_instance New widget instance.
	 * @param array<mixed> $old_instance Old widget instance.
	 *
	 * @return array<mixed> Sanitized widget instance data.
	 */
	public function update( $new_instance, $old_instance ): array { // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable -- The $old_instance parameter is required by the WP_Widget::update() signature.
		return array(
			'widgetId' => sanitize_text_field( $new_instance['widgetId'] ?? '' ),
		);
	}
}
