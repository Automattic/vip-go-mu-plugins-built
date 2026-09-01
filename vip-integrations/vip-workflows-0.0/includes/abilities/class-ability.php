<?php
/**
 * Ability class - extends WP Core's WP_Ability.
 *
 * Adds VIP Workflows-specific extensions:
 * - availability_callback for runtime dependency checks
 * - display_order for UI sorting
 * - icon, thinking_message, success_message for frontend display
 *
 * All custom properties live in `meta` to stay compatible with Core's
 * strict property validation. Register with ability_class => Ability::class
 * so Core instantiates this subclass directly.
 *
 * @package VIPWorkflows
 * @see     WP_Ability
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

/**
 * Ability.
 */
class Ability extends \WP_Ability {


	/**
	 * Icon.
	 *
	 * @var string
	 */
	protected string $icon;
	/**
	 * Thinking message.
	 *
	 * @var string
	 */
	protected string $thinking_message;
	/**
	 * Success message.
	 *
	 * @var string
	 */
	protected string $success_message;

	/**
	 * Availability callback.
	 *
	 * @var callable|null
	 */
	protected $availability_callback;

	/**
	 * Construct the Ability instance.
	 *
	 * @param string $name name.
	 * @param array  $args args.
	 */
	public function __construct( string $name, array $args ) {
		parent::__construct( $name, $args );

		$this->icon                  = $this->meta['icon'] ?? 'tool';
		$this->thinking_message      = $this->meta['thinking_message'] ?? __( 'Processing...', 'vip-workflows' );
		$this->success_message       = $this->meta['success_message'] ?? __( 'Completed successfully.', 'vip-workflows' );
		$this->availability_callback = $this->meta['availability_callback'] ?? null;
	}

	/**
	 * Check if the ability's runtime dependencies are met.
	 *
	 * @return bool True if available (or no availability_callback set).
	 */
	public function is_available(): bool {
		return $this->get_availability()->is_available();
	}

	/**
	 * Resolve the ability's dependencies, with the reasons any are unmet.
	 *
	 * The callback may return an `Availability` instance to explain what is
	 * missing and where to fix it, or a plain bool as before. Every other return
	 * type is coerced to bool exactly as it always was, so no existing
	 * third-party callback changes behavior or emits a diagnostic.
	 *
	 * Not cached: a credential can be configured mid-request, and the Agents
	 * screen re-reads availability immediately after a save.
	 *
	 * @since 0.0.1
	 *
	 * @return Availability
	 */
	public function get_availability(): Availability {
		if ( ! is_callable( $this->availability_callback ) ) {
			return Availability::available();
		}

		return Availability::from_callback_return( call_user_func( $this->availability_callback ) );
	}

	/**
	 * Get display order for UI sorting.
	 *
	 * @return int Display order (lower = earlier). Defaults to 100.
	 */
	public function get_display_order(): int {
		return (int) ( $this->meta['display_order'] ?? 100 );
	}

	/**
	 * Get the icon.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return $this->icon;
	}

	/**
	 * Get the thinking message.
	 *
	 * @return string
	 */
	public function get_thinking_message(): string {
		return $this->thinking_message;
	}

	/**
	 * Get the success message.
	 *
	 * @return string
	 */
	public function get_success_message(): string {
		return $this->success_message;
	}

	/**
	 * Convert to array for API responses.
	 *
	 * @return array
	 */
	public function to_array(): array {
		return array(
			'name'             => $this->get_name(),
			'label'            => $this->get_label(),
			'description'      => $this->get_description(),
			'category'         => $this->get_category(),
			'icon'             => $this->icon,
			'thinking_message' => $this->thinking_message,
			'success_message'  => $this->success_message,
			'input_schema'     => $this->get_input_schema(),
			'output_schema'    => $this->get_output_schema(),
			'meta'             => $this->get_meta(),
		);
	}
}
