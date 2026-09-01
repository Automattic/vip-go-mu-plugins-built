<?php
/**
 * Prompt Registry.
 *
 * Singleton registry for configurable AI system prompts. Each prompt is
 * registered with a stable id, label, group, default text, and the variables it
 * supports. Call sites resolve a prompt via get(), which returns the admin
 * override when present (else the registered default) with {variables}
 * substituted. Extensions register prompts via the
 * `vip_workflows_register_prompts` action.
 *
 * Resolution intentionally stops at override-or-default + variable substitution.
 * Call sites that wrap a legacy `apply_filters()` prompt hook (e.g. the
 * MediaProcessor image/PDF/summary filters) apply that filter around the value
 * returned here, so existing filter names and signatures stay intact.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

/**
 * Registry of configurable system prompts.
 */
class PromptRegistry {

	/**
	 * Output kinds a prompt may declare.
	 *
	 * `markdown` means the response is rendered as formatted text by
	 * `renderMarkdown()` in the admin UI. Only kinds listed here are accepted; an
	 * unrecognised one is a typo that would otherwise register as "no kind at
	 * all" and silently do nothing.
	 */
	private const OUTPUT_KINDS = array( 'markdown' );

	/**
	 * Appended to every `markdown` prompt when it is resolved.
	 *
	 * Models reach for markdown unprompted whether or not a prompt asks, and the
	 * summaries genuinely have structure worth keeping — a list of park
	 * designations really is a list. So the fix is to render it, and this exists
	 * to tell the model that formatting is welcome rather than to fence it in:
	 * renderMarkdown() handles headings, emphasis, both kinds of list, links,
	 * images, quotes, code, rules and simple tables.
	 *
	 * Only raw HTML is ruled out, because it is the one thing the renderer shows
	 * as literal characters by design — React escapes string children, which is
	 * what makes rendering untrusted output safe in the first place.
	 *
	 * Appended at resolve time rather than baked into each `default` so that it
	 * survives a user editing the prompt in the settings UI — the editable text is
	 * the part they own, this is the output contract the code depends on.
	 */
	private const MARKDOWN_DIRECTIVE = "\n\nYou may use markdown for structure — headings, "
		. 'bold and italic, bulleted and numbered lists, links, block quotes, tables and code '
		. 'blocks are all rendered. Separate paragraphs with a blank line. Do not use raw HTML; '
		. 'it is shown to the reader as literal characters rather than rendered.';

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Registered prompt definitions keyed by id.
	 *
	 * @var array<string, array>
	 */
	private array $prompts = array();

	/**
	 * Whether the registration hook has fired.
	 *
	 * @var bool
	 */
	private bool $initialized = false;

	/**
	 * Construct the registry.
	 */
	private function __construct() {}

	/**
	 * Get the singleton instance.
	 *
	 * @since 0.0.1
	 *
	 * @return self
	 */
	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Ensure prompts have been collected from core and extensions.
	 */
	private function maybe_init(): void {
		if ( $this->initialized ) {
			return;
		}
		$this->initialized = true;

		/**
		 * Fires to let plugins register configurable prompts.
		 *
		 * @param PromptRegistry $registry The registry instance.
		 */
		do_action( 'vip_workflows_register_prompts', $this );
	}

	/**
	 * Register a configurable prompt.
	 *
	 * @since 0.0.1
	 *
	 * @param string $id   Unique prompt id (e.g. 'ai-agent/system-post').
	 * @param array  $args {
	 *     Prompt definition.
	 *
	 *     @type string   $label       Human-readable label (required).
	 *     @type string   $default     Default prompt text (required).
	 *     @type string   $group       Group label for the settings UI. Default 'General'.
	 *     @type string   $description Optional help text.
	 *     @type string[] $variables   Variable names the template supports (without braces).
	 *     @type string   $output      Output kind. 'markdown' appends the supported-subset
	 *                                directive at resolve time, for responses the admin UI
	 *                                renders as formatted text. Omit for anything parsed by
	 *                                code rather than shown to a reader.
	 * }
	 * @return bool True if registered, false if the id is taken or invalid.
	 */
	public function register( string $id, array $args ): bool {
		// Ids are interpolated into the REST route (?P<id>[a-z0-9_/-]+) and the
		// admin fetch path, so constrain them to the same canonical format at
		// registration. Anything else would register but be un-saveable.
		if ( ! preg_match( '#^[a-z0-9_/-]+$#', $id ) ) {
			_doing_it_wrong(
				__METHOD__,
				sprintf( 'Prompt id "%s" must match [a-z0-9_/-].', esc_html( $id ) ),
				'0.0.1'
			);
			return false;
		}

		if ( isset( $this->prompts[ $id ] ) ) {
			_doing_it_wrong(
				__METHOD__,
				sprintf( 'Prompt "%s" is already registered.', esc_html( $id ) ),
				'1.0.0'
			);
			return false;
		}

		foreach ( array( 'label', 'default' ) as $key ) {
			if ( ! isset( $args[ $key ] ) || '' === $args[ $key ] ) {
				_doing_it_wrong(
					__METHOD__,
					sprintf( 'Prompt "%1$s" is missing required key "%2$s".', esc_html( $id ), esc_html( $key ) ),
					'1.0.0'
				);
				return false;
			}
		}

		$output = (string) ( $args['output'] ?? '' );

		if ( '' !== $output && ! in_array( $output, self::OUTPUT_KINDS, true ) ) {
			_doing_it_wrong(
				__METHOD__,
				sprintf(
					'Prompt "%1$s" declares unknown output kind "%2$s"; expected one of %3$s.',
					esc_html( $id ),
					esc_html( $output ),
					esc_html( implode( ', ', self::OUTPUT_KINDS ) )
				),
				'0.0.1'
			);
			return false;
		}

		$this->prompts[ $id ] = array(
			'id'          => $id,
			'label'       => (string) $args['label'],
			'default'     => (string) $args['default'],
			'group'       => (string) ( $args['group'] ?? 'General' ),
			'description' => (string) ( $args['description'] ?? '' ),
			'variables'   => array_values( (array) ( $args['variables'] ?? array() ) ),
			'output'      => $output,
		);

		return true;
	}

	/**
	 * Whether a prompt id is registered.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $id Prompt id.
	 * @return bool
	 */
	public function has( string $id ): bool {
		$this->maybe_init();
		return isset( $this->prompts[ $id ] );
	}

	/**
	 * Get a prompt definition (label, default, group, description, variables).
	 *
	 * @since 0.0.1
	 *
	 * @param  string $id Prompt id.
	 * @return array|null The definition, or null if not registered.
	 */
	public function get_definition( string $id ): ?array {
		$this->maybe_init();
		return $this->prompts[ $id ] ?? null;
	}

	/**
	 * Get all registered prompt definitions.
	 *
	 * @since 0.0.1
	 *
	 * @return array<string, array>
	 */
	public function get_all(): array {
		$this->maybe_init();
		return $this->prompts;
	}

	/**
	 * Resolve a prompt for use at a call site.
	 *
	 * Returns the stored override when set, otherwise the registered default,
	 * with {variable} placeholders substituted from $vars. An unregistered id
	 * is a programming error: it signals via _doing_it_wrong and returns an
	 * empty string rather than silently falling back to an inline literal.
	 *
	 * @since 0.0.1
	 *
	 * @param  string                $id   Prompt id.
	 * @param  array<string, scalar> $vars Variable values keyed by name (without braces).
	 * @return string Resolved prompt text.
	 */
	public function get( string $id, array $vars = array() ): string {
		$definition = $this->get_definition( $id );

		if ( null === $definition ) {
			_doing_it_wrong(
				__METHOD__,
				sprintf( 'Prompt "%s" is not registered.', esc_html( $id ) ),
				'1.0.0'
			);
			return '';
		}

		$override = PromptSettings::get_instance()->get_override( $id );
		$text     = ( null !== $override && '' !== $override ) ? $override : $definition['default'];

		if ( 'markdown' === ( $definition['output'] ?? '' ) ) {
			$text .= self::MARKDOWN_DIRECTIVE;
		}

		return $this->substitute( $text, $vars );
	}

	/**
	 * Substitute {name} placeholders with their values.
	 *
	 * @param  string                $text Template text.
	 * @param  array<string, scalar> $vars Values keyed by name.
	 * @return string
	 */
	private function substitute( string $text, array $vars ): string {
		if ( empty( $vars ) ) {
			return $text;
		}

		$replacements = array();
		foreach ( $vars as $name => $value ) {
			$replacements[ '{' . $name . '}' ] = (string) $value;
		}

		return strtr( $text, $replacements );
	}

	/**
	 * Reset the registry (test isolation helper).
	 *
	 * @since 0.0.1
	 *
	 * @return void
	 */
	public function reset(): void {
		$this->prompts     = array();
		$this->initialized = false;
	}
}
