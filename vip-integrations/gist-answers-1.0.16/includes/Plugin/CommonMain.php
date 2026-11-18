<?php
/**
 * Plugin features common to both the admin and frontend portions of the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Plugin;

use GistAnswers\Admin\AdminMain;
use GistAnswers\Admin\MenuItems\ToolsOptions;
use GistAnswers\API\Credentials;
use GistAnswers\API\Endpoint;
use GistAnswers\Model\GistSite;
use GistAnswers\Model\GistWidget;
use GistAnswers\Plugin\SidebarWidget;
use WP_Site;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin features common to both the admin and frontend portions of the Gist Answers plugin.
 */
final class CommonMain {

	public const ACTIVATION_FLAG = 'gist_answers_plugin_activated';

	private const ALLOW_SIDEBAR_ANSWER_WIDGET   = false;
	private const ALLOW_SIDEBAR_QUESTION_WIDGET = true;

	private const API_CONTACT_EMAIL_PARTS = array(
		'support',
		'gist.ai',
	);

	/**
	 * Class constructor.
	 *
	 * @return void
	 */
	public function __construct() {

		$this->enqueue_block_editor_styles();

		$this->refresh_publisher_data_for_block_editor();

		$this->refresh_widget_code_in_background();

		$this->register_block_category();

		// Registration order is the order the blocks appear in the block inserter.
		$this->register_question_block();
		$this->register_answer_block();

		$this->register_answer_widget();
		$this->register_question_widget();

		// Posts are saved, and WP-Cron runs, on requests that load either side of the plugin.
		AdminMain::register_ingestion_hooks();

		$this->forget_publisher_links_of_deleted_sites();

		if ( ToolsOptions::should_count_api_requests() ) {
			add_action( 'admin_footer', array( Endpoint::class, 'output_api_call_count' ) );
			add_action( 'wp_footer', array( Endpoint::class, 'output_api_call_count' ) );
		}

		$this->load_text_domain();
	}

	/**
	 * Enqueue widget styles for the block editor.
	 */
	private function enqueue_block_editor_styles(): void {
		add_action(
			'enqueue_block_assets',
			function () {
				wp_enqueue_style(
					'gist-answers-editor',
					GIST_ANSWERS_PLUGIN_URL . 'public/css/admin.css',
					array(),
					GIST_ANSWERS_VERSION,
				);
			},
		);
	}

	/**
	 * When a site is deleted from the network, forget which publisher it was linked to, so that publisher can be
	 * linked to another site. Also carry on rebuilding the network's map of linked publishers in the background.
	 *
	 * @return void
	 */
	private function forget_publisher_links_of_deleted_sites(): void {
		add_action(
			'wp_uninitialize_site',
			function ( $old_site ) {
				if ( $old_site instanceof WP_Site ) {
					Credentials::forget_publisher_link( intval( $old_site->blog_id ) );
				}
			},
		);

		add_action(
			Credentials::PUBLISHER_LINKS_REBUILD_CRON_HOOK,
			array( Credentials::class, 'continue_publisher_links_rebuild' ),
		);
	}

	/**
	 * Register the block category for Gist.ai Gutenberg blocks.
	 *
	 * @return void
	 */
	private function register_block_category(): void {
		add_filter(
			'block_categories_all',
			function ( $categories ) {

				$categories[] = array(
					'slug'  => 'gist-answers',
					'title' => __( 'Gist Answers', 'gist-answers' ),
				);

				return $categories;
			},
		);
	}

	/**
	 * Refresh this site's stored publisher data in the background when the block editor loads.
	 *
	 * The blocks' widget dropdowns are built from the stored data, which is otherwise only refreshed on the plugin's
	 * own admin screens, so widgets created in Gist Answers since then would be missing from them. Loading the editor
	 * only schedules a WP-Cron event to refresh it (at most once a minute), rather
	 * than holding up the editor with an API request, so new widgets appear the next time the editor loads.
	 *
	 * @return void
	 */
	private function refresh_publisher_data_for_block_editor(): void {

		add_action(
			'enqueue_block_editor_assets',
			array( Credentials::class, 'schedule_publisher_data_refresh' ),
		);

		add_action(
			Credentials::PUBLISHER_REFRESH_CRON_HOOK,
			function () {
				if ( Credentials::has_valid_api_token() ) {
					Credentials::refresh_publisher_data();
				}
			},
		);
	}

	/**
	 * Refresh a widget's cached code in the background when its WP-Cron event runs (see
	 * GistWidget::get_widget_code()).
	 *
	 * @return void
	 */
	private function refresh_widget_code_in_background(): void {
		add_action(
			GistWidget::WIDGET_REFRESH_CRON_HOOK,
			array( GistWidget::class, 'handle_widget_code_refresh' ),
		);
	}

	/**
	 * Register the Gutenberg answer block for Gist.ai.
	 *
	 * @return void
	 */
	private function register_answer_block(): void {
		add_action(
			'init',
			function () {

				$block_type = register_block_type(
					GIST_ANSWERS_PLUGIN_DIR . 'blocks/answer-widget',
					array(
						'render_callback' => array( $this, 'render_answer_block' ),
					),
				);

				if ( ! empty( $block_type ) && is_admin() ) {
					$this->enqueue_block_editor_assets_for( $block_type );
				}
			}
		);
	}

	/**
	 * Register the Gutenberg question block for Gist.ai.
	 *
	 * @return void
	 */
	private function register_question_block(): void {
		add_action(
			'init',
			function () {

				$block_type = register_block_type(
					GIST_ANSWERS_PLUGIN_DIR . 'blocks/question-widget',
					array(
						'render_callback' => array( $this, 'render_question_block' ),
					),
				);

				if ( ! empty( $block_type ) && is_admin() ) {
					$this->enqueue_block_editor_assets_for( $block_type );
				}
			}
		);
	}

	/**
	 * Enqueue the block editor assets for the given registered block.
	 *
	 * @param object $block_type The registered block object.
	 *
	 * @return void
	 */
	private function enqueue_block_editor_assets_for( object $block_type ): void {

		add_action(
			'enqueue_block_editor_assets',
			function () use ( $block_type ) {

				$widget_options = self::get_widget_options_for( $block_type->name ?? '' );

				$preview_html = self::get_placeholder_html( str_replace( 'gist-answers/', '', strval( $block_type->name ?? '' ) ), true );

				$js_script = sprintf(
					"if ( window.wp && window.wp.blocks ) {
						const el = window.wp.element.createElement;
						const useBlockProps = window.wp.blockEditor.useBlockProps;
						const InspectorControls = window.wp.blockEditor.InspectorControls;
						const PanelBody = window.wp.components.PanelBody;
						const SelectControl = window.wp.components.SelectControl;
						const ServerSideRender = window.wp.serverSideRender || 'div';
						const widgetOptions = %s;
						const previewHtml = %s;

						window.wp.blocks.registerBlockType( '%s', {
							title: '%s',
							icon: '%s',
							category: '%s',
							attributes: %s,
							example: %s,

							edit: function( props ) {
								function onChangeWidgetId( newId ) {
									props.setAttributes( {
										widgetId: newId,
									} );
								}

								const blockProps = useBlockProps();

								// The block inserter's hover preview (see the block's example) shows the placeholder.
								if ( props.attributes.preview ) {
									return el( 'div', Object.assign( {}, blockProps, { dangerouslySetInnerHTML: { __html: previewHtml } } ) );
								}

								return [
									el(
										InspectorControls,
										{ key: 'controls' },
										el(
											PanelBody,
											{
												title: 'Widget Settings',
												initialOpen: true,
											},
											el( SelectControl, {
												label: 'Widget',
												value: props.attributes.widgetId || '',
												options: widgetOptions,
												onChange: onChangeWidgetId,
											} ),
										),
									),
									el(
										'div',
										blockProps,
										el( ServerSideRender, {
											block: '%s',
											attributes: props.attributes,
										} ),
									)
								];
							},

							save: function() {
								return null;
							},
						} );
					}",
					wp_json_encode( array_values( $widget_options ) ),
					wp_json_encode( $preview_html ),
					esc_js( $block_type->name ?? '' ),
					esc_js( $block_type->title ?? '' ),
					esc_js( $block_type->icon ?? '' ),
					esc_js( $block_type->category ?? '' ),
					wp_json_encode( $block_type->attributes ?? array() ),
					wp_json_encode( $block_type->example ?? null ),
					esc_js( $block_type->name ?? '' )
				);

				wp_add_inline_script( 'wp-edit-post', $js_script );
			}
		);
	}

	/**
	 * Get the widget options for the given block type (designated by its name).
	 *
	 * @param string $block_name The name of the block type (e.g., 'gist-answers/answer-widget').
	 *
	 * @return array<mixed> Array of widget options, each containing 'label' and 'value' keys.
	 */
	public static function get_widget_options_for( string $block_name ): array {

		$block_name = match ( $block_name ) {
			'answer'                => 'answer',
			'question'              => 'question',
			'gist-answers/answer'   => 'answer',
			'gist-answers/question' => 'question',
			default                 => null,
		};

		$gist_site = GistSite::get();

		switch ( $block_name ) {
			case 'answer':
				$widgets = $gist_site->get_chat_widgets();
				break;

			case 'question':
				$widgets = $gist_site->get_search_widgets();
				break;

			default:
				$widgets = null;
				break;
		}

		if ( is_array( $widgets ) && count( $widgets ) > 0 ) {
			$widgets = array_map(
				function ( $widget ) {
					return array(
						'label' => strval( $widget->get_name() ),
						'value' => strval( $widget->get_id() ),
					);
				},
				$widgets,
			);
		}

		$label_text = match ( $block_name ) {
			'answer' => __( 'Auto-detect (recommended)', 'gist-answers' ),
			default  => __( 'Select a widget', 'gist-answers' ) . ' ...',
		};

		return is_array( $widgets ) && count( $widgets ) > 0 ?
				array_merge(
					array(
						array(
							'label' => $label_text,
							'value' => '',
						),
					),
					$widgets,
				) :
				array(
					array(
						'label' => __( 'No widgets available', 'gist-answers' ),
						'value' => '',
					),
				);
	}

	/**
	 * Get the editor placeholder markup for a widget block.
	 *
	 * @param string $type       The widget type ('answer' or 'question').
	 * @param bool   $is_preview Optional. Whether this is for the block inserter's hover preview. Defaults to false.
	 *
	 * @return string The placeholder HTML.
	 */
	private static function get_placeholder_html( string $type, bool $is_preview = false ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter -- $type and $is_preview are read by the required template.

		ob_start();

		require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/widget-placeholder.php';

		return strval( ob_get_clean() );
	}

	/**
	 * Render callback for the Gutenberg answer block.
	 *
	 * @param array<mixed> $attributes Block attributes.
	 *
	 * @return string HTML output for the block.
	 */
	public function render_answer_block( array $attributes ): string {

		if ( wp_is_serving_rest_request() ) {
			return self::get_placeholder_html( 'answer' );
		}

		$widget_id  = sanitize_text_field( $attributes['widgetId'] ?? '' );
		$class_name = sanitize_text_field( $attributes['className'] ?? '' );

		if ( ! empty( $class_name ) ) {
			$before_widget = sprintf( '<div class="%s">', esc_attr( $class_name ) );
			$after_widget  = '</div>';
		} else {
			$before_widget = '';
			$after_widget  = '';
		}

		return $before_widget . gist_answers_render_widget(
			array(
				'type' => 'answer',
				'id'   => $widget_id,
				'echo' => false,
			)
		) . $after_widget;
	}

	/**
	 * Render callback for the Gutenberg question block.
	 *
	 * @param array<mixed> $attributes Block attributes.
	 *
	 * @return string HTML output for the block.
	 */
	public function render_question_block( array $attributes ): string {

		if ( wp_is_serving_rest_request() ) {
			return self::get_placeholder_html( 'question' );
		}

		$widget_id  = sanitize_text_field( $attributes['widgetId'] ?? '' );
		$class_name = sanitize_text_field( $attributes['className'] ?? '' );

		if ( ! empty( $class_name ) ) {
			$before_widget = sprintf( '<div class="%s">', esc_attr( $class_name ) );
			$after_widget  = '</div>';
		} else {
			$before_widget = '';
			$after_widget  = '';
		}

		return $before_widget . gist_answers_render_widget(
			array(
				'type' => 'question',
				'id'   => $widget_id,
				'echo' => false,
			)
		) . $after_widget;
	}

	/**
	 * Register the sidebar answer widget for Gist.ai.
	 *
	 * @return void
	 */
	private function register_answer_widget(): void {
		if ( self::ALLOW_SIDEBAR_ANSWER_WIDGET ) {
			add_action(
				'widgets_init',
				function () {
					register_widget( new SidebarWidget( 'answer' ) );
				},
			);
		}
	}

	/**
	 * Register the sidebar question widget for Gist.ai.
	 *
	 * @return void
	 */
	private function register_question_widget(): void {
		if ( self::ALLOW_SIDEBAR_QUESTION_WIDGET ) {
			add_action(
				'widgets_init',
				function () {
					register_widget( new SidebarWidget( 'question' ) );
				},
			);
		}
	}

	/**
	 * Load the plugin text domain for translations.
	 *
	 * @return void
	 */
	private function load_text_domain(): void {

		// phpcs:disable Squiz.PHP.CommentedOutCode.Found -- Per PHPCS: load_plugin_textdomain() has been discouraged since WordPress version 4.6. When your plugin is hosted on WordPress.org, you no longer need to manually include this function call for translations under your plugin slug. WordPress will automatically load the translations for you as needed.

		/*
		Leaving this for posterity. See note directly above.
		add_action(
			'init',
			function () {
				load_plugin_textdomain( 'gist-answers', false, './languages' );
			},
		);
		*/

		// phpcs:enable Squiz.PHP.CommentedOutCode.Found
	}

	/**
	 * Get the API contact email address for the plugin.
	 *
	 * @return string The API contact email address.
	 */
	public static function get_api_contact_email(): string {
		return implode( '@', self::API_CONTACT_EMAIL_PARTS );
	}

	/**
	 * Get the API contact mail-to link for the plugin.
	 *
	 * @return string The API contact mail-to link.
	 */
	public static function get_api_contact_mailto_link(): string {

		$email_address = self::get_api_contact_email();

		return '<a href="mailto:' . $email_address . '">' . $email_address . '</a>';
	}

	/**
	 * Get the list of required form templates for the plugin.
	 *
	 * @return array<string> Array of required form template filenames.
	 */
	public static function get_required_form_templates(): array {
		return array(
			'gist-connection',
		);
	}

	/**
	 * Get the list of required partial templates for the plugin.
	 *
	 * @return array<string> Array of required partial template filenames.
	 */
	public static function get_required_partial_templates(): array {
		return array(
			'activation-modal',
			'admin-form-field',
			'admin-loader',
			'admin-site-card',
			'alert-modal',
			'connection-wizard',
			'logo-header',
			'network-hub-list',
			'network-hub-pagination',
			'network-hub-search',
			'popup-iframe',
			'refresh-statuses-button',
			'svg-tooltip',
			'tools-options-danger-zone',
			'tools-options-developer',
			'widget-placeholder',
		);
	}
}
