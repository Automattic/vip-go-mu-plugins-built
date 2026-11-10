---
name: create-vip-workflows-tool
description: >-
  Scaffold a VIP Workflows editorial tool plugin. Use when the user wants to
  create a custom content analysis tool, validator, or checker for VIP Workflows.
---
# Create a VIP Workflows Editorial Tool

Editorial tools run against post content during workflow transitions or on demand from the editor sidebar. Each tool is a standalone WordPress plugin that registers an ability with the Abilities API.

## Requirements

Before starting, gather from the user:
1. **What does the tool check?** -- e.g., readability, brand compliance, SEO, fact-checking
2. **Plugin slug** -- e.g., `workflow-tool-readability`
3. **Ability ID** -- namespaced, e.g., `workflow-tool-readability/readability-checker`
4. **Does it call an external API?** -- determines settings/availability patterns
5. **Should it run on workflow transitions?** -- determines `transition_eligible` meta

## Plugin Structure

```
workflow-tool-{name}/
  workflow-tool-{name}.php          # Main plugin file
  includes/
    class-{name}-checker.php        # Tool logic (register + execute)
```

The plugin directory lives alongside `vip-workflows/` in the same parent directory.

## Boilerplate

### Main plugin file: `workflow-tool-{name}/workflow-tool-{name}.php`

```php
<?php
/**
 * Plugin Name: Workflow {Display Name}
 * Description: {What this tool does, in one sentence.}
 * Version: 1.0.0
 * Requires Plugins: vip-workflows
 * Text Domain: workflow-tool-{name}
 *
 * @package WorkflowTool{PascalName}
 */

declare( strict_types=1 );

namespace WorkflowTool{PascalName};

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

require_once __DIR__ . '/includes/class-{name}-checker.php';

add_action( 'wp_abilities_api_init', array( {PascalName}Checker::class, 'register' ) );
```

### Checker class: `workflow-tool-{name}/includes/class-{name}-checker.php`

```php
<?php
declare( strict_types=1 );

namespace WorkflowTool{PascalName};

class {PascalName}Checker {

    public static function register(): void {
        if ( ! function_exists( 'vip_workflows_register_ability' ) ) {
            return;
        }

        vip_workflows_register_ability(
            'workflow-tool-{name}/{slug}',
            array(
                'label'               => __( '{Display Name}', 'workflow-tool-{name}' ),
                'description'         => __( '{One-line description.}', 'workflow-tool-{name}' ),
                'category'            => 'vip-workflows',
                'input_schema'        => self::get_input_schema(),
                'output_schema'       => self::get_output_schema(),
                'execute_callback'    => array( self::class, 'execute' ),
                'permission_callback' => array( self::class, 'can_execute' ),
                'meta'                => array(
                    'show_in_rest'        => true,
                    'icon'                => 'search',
                    'type'                => 'validator',
                    'supports'            => array( 'workflow' ),
                    'transition_eligible' => true,   // expose "Can be used in transitions" admin toggle
                    'show_in_commands'    => false,  // set true to expose "Show in Command Palette" admin toggle
                    'settings_schema'     => array(
                        'threshold' => array(
                            'type'        => 'integer',
                            'default'     => 80,
                            'label'       => 'Score threshold',
                            'description' => 'Minimum score to pass.',
                            'minimum'     => 0,
                            'maximum'     => 100,
                            'enforceable' => true, // shows soft/hard check mode pill
                        ),
                        // 'api_key' => array(
                        //     'type'     => 'string',
                        //     'label'    => 'API Key',
                        //     'required' => true,
                        //     'secret'   => true,
                        // ),
                    ),
                    'annotations'         => array(
                        'readonly'    => true,
                        'destructive' => false,
                        'idempotent'  => true,
                    ),
                    // See "Availability" below for the callback body.
                    // 'availability_callback' => array( self::class, 'check_availability' ),
                ),
            )
        );
    }

    public static function can_execute(): bool {
        return current_user_can( 'edit_posts' );
    }

    private static function get_input_schema(): array {
        return array(
            'type'       => 'object',
            'properties' => array(
                'post_id' => array( 'type' => 'integer' ),
            ),
            'required'   => array( 'post_id' ),
        );
    }

    private static function get_output_schema(): array {
        return array(
            'type'       => 'object',
            'properties' => array(
                'score'   => array( 'type' => 'number' ),
                'summary' => array( 'type' => 'string' ),
                'issues'  => array( 'type' => 'array' ),
            ),
        );
    }

    /**
     * Execute the tool against a post.
     *
     * @param array $input { post_id: int }
     * @return array { score: float, summary: string, issues: array }
     */
    public static function execute( array $input ): array {
        $post_id = $input['post_id'] ?? 0;
        $post    = get_post( $post_id );

        if ( ! $post ) {
            return array(
                'score'   => 0,
                'summary' => 'Post not found.',
                'issues'  => array(),
            );
        }

        // Read saved settings from AbilitySettings (not from $input).
        $settings  = \VIPWorkflows\Abilities\AbilitySettings::get_instance()
            ->get_options( 'workflow-tool-{name}/{slug}' );
        $threshold = $settings['threshold'] ?? 80;

        $content = wp_strip_all_tags( $post->post_content );

        $issues = self::analyze( $content );

        $score = empty( $issues ) ? 100 : max( 0, 100 - ( count( $issues ) * 10 ) );

        return array(
            'score'   => $score,
            'summary' => empty( $issues )
                ? 'All checks passed.'
                : sprintf( 'Found %d issues.', count( $issues ) ),
            'issues'  => $issues,
        );
    }

    /**
     * Analyze content and return issues.
     *
     * @param string $content Plain text content.
     * @return array Array of issue arrays with 'rule', 'message', 'severity'.
     */
    private static function analyze( string $content ): array {
        $issues = array();

        // Replace with your actual checks. Example:
        // if ( str_word_count( $content ) < 300 ) {
        //     $issues[] = array(
        //         'rule'     => 'minimum-length',
        //         'message'  => 'Content is below the minimum word count of 300.',
        //         'severity' => 'warning',
        //     );
        // }

        return $issues;
    }
}
```

## Availability

A tool that needs configuration -- an API key, an external service, a plugin that may not be installed -- declares `meta.availability_callback`. `AbilityExecutor` gates execution on it, and the Tools page shows the result.

Write it against the structured shape from the start. Returning a bare `false` still works and is still silent, but it discards the reason: the surface can then only say that *something* is unconfigured, naming nothing and linking nowhere.

```php
use VIPWorkflows\Abilities\Availability;
use VIPWorkflows\Abilities\RequirementFactory;
use VIPWorkflows\Abilities\RequirementGroup;

/**
 * Whether this tool's dependencies are met, and what is missing if not.
 *
 * @return bool|Availability True when configured, otherwise the unmet requirements.
 */
public static function check_availability(): bool|Availability {
    $settings = \VIPWorkflows\Abilities\AbilitySettings::get_instance();
    $options  = $settings->get_options( 'workflow-tool-{name}/{slug}' );

    if ( ! empty( $options['api_key'] ) ) {
        return true;
    }

    return Availability::unmet(
        RequirementGroup::all(
            RequirementFactory::in_card(
                'settings:workflow-tool-{name}',
                __( '{Display Name} has no API key. Add it in the tool settings below.', 'workflow-tool-{name}' ),
                __( '{Display Name} is not connected. Ask an administrator to connect it.', 'workflow-tool-{name}' ),
                __( 'Complete the API key field below.', 'workflow-tool-{name}' ),
                array( __( '{Display Name}', 'workflow-tool-{name}' ) )
            )
        )
    );
}
```

Rules:

- **The callback owns satisfaction.** Return `true` as soon as the dependencies are met; an `Availability::unmet()` carries *only* unmet requirements, and nothing downstream re-evaluates them.
- **A tool that generates text with AI does not write its own check.** Generate through `VIPWorkflows\AI\AiInference::get_instance()->model()`, never by naming a provider class, and gate with `VIPWorkflows\Abilities\AiAvailability::for_selected_provider( $sources )`. That pair is the whole contract: the check resolves exactly the three conditions the resolver needs — the selected provider registered with the WordPress AI Client, its credential, and a chosen model — so the gate and the generation call cannot disagree. Naming a provider yourself is how a Claude-configured site ends up being told to go get an OpenAI key. `for_provider( $provider, $sources )` exists for the rare tool that genuinely requires one specific vendor. Do not call `AiClient::isConfigured()` in an availability callback — it makes a live request, and availability is read on every Tools-page load.
- **`AiInference::model()` returns null when the selection is unresolvable.** There is no fallback to another vendor. Bail with a `WP_Error` rather than passing null to `usingModel()`.
- **Build requirements with `RequirementFactory`,** not by hand. Use `in_card()` when the value is entered in the tool's own `settings_schema` fields; `missing_credential( $service, $service_label, $sources )` when the key is one the plugin reads through `VIPWorkflows\AI\Credentials`, which resolves the destination against the install instead of hardcoding a screen; `dependency()` when a prerequisite other than a credential is missing (e.g. a required plugin is not installed); `unsupported_environment()` when nothing can be configured to fix it.
- **Supply both message registers.** The admin reason may name a screen; the user message must not, because tools execute under `edit_posts` while admin settings require `manage_options`. The register is chosen where the requirement is read, not where it is authored.
- Group with `RequirementGroup::all()`, or `RequirementGroup::any()` when satisfying one member is enough -- an `any` group renders as one "configure at least one of" block.
- Returning `false` remains valid for a tool with nothing useful to say. It produces the generic line, with no diagnostic.

## Registration Rules

- The ability name **must** be namespaced with a slash: `plugin-slug/ability-slug`. Never use `sanitize_key()` on ability IDs (it strips slashes).
- `category` must be `'vip-workflows'`
- **`meta.type` is required** for the tool to appear in Integrations > Tools. Use `'check'` for validation tools, `'helper'` for content generators, `'validator'` for analysis tools, `'agent'` for AI Agent.
- `meta.transition_eligible = true` if the tool should run during workflow or phase transitions
- `meta.show_in_commands = true` to expose the "Show in Command Palette (⌘K)" toggle in Integrations > Tools; admins control the actual value per-site. Omit or set `false` for tools that should never appear in the palette.
- Hook into `wp_abilities_api_init`
- Guard with `function_exists( 'vip_workflows_register_ability' )`
- For **phase transition tools** (ideation to pitch/editorial): the input receives `project_id` (not `post_id`). Do not use `current_user_can( 'edit_post', ... )` in `permission_callback` because ideation CPTs use custom capabilities. Validate input and return `true`.

## Output Contract

**Declare what your tool returns.** Set `meta.result_type` to one of three values.
The result modal switches on that declaration rather than inspecting your output
keys, so a shape it has never seen still renders correctly.

Do not skip this. Before `result_type` existed the modal guessed by probing keys
in priority order, and every new shape either matched no key and rendered an empty
modal or matched the wrong key and applied the wrong value to a field. A tool that
declares nothing still falls back to that guessing.

### `result_type => 'report'` — a verdict with findings

For checks. Also the shape a transition gate reads.

- `status` (string) -- `'pass'`, `'warning'` or `'fail'`. **Always set it.** Omitting
  it means "no verdict", which is not the same as failing.
- `score` (number, 0-100) -- optional
- `summary` (string) -- one line about the result
- `issues` (array) -- each issue has `rule`, `message`, `severity` (`'error'`, `'warning'`, `'info'`)

### `result_type => 'value'` — one value that replaces a field

For generators: an excerpt, a rewritten paragraph.

- `excerpt` or `content` (string) -- the value itself
- `summary` (string) -- optional

Pair it with `meta.apply_field` naming the field the value belongs in, or the
writer gets no way to use it.

### `result_type => 'list'` — several options to choose from

For suggestions: alternative headlines, related links.

- `suggestions` (array) -- one of two row shapes:
  - a **plain string**, when the row *is* a value a field can be set to (an
    alternative headline)
  - `array( 'label' => …, 'meta' => …, 'href' => … )`, when the row points
    somewhere instead (a suggested link, whose label is anchor text)
- `summary` (string) -- one line above the list

Only plain-string rows get an apply action, because only they are a value. Set
`apply_field` for those.

### `summary` is never a value

It is the line *about* a result. It is displayed, never applied. A tool that
returned `'5 suggested headlines.'` as its summary once had that written into a
post title, because the modal treated the summary as content to apply.

## Testing

1. Place the plugin directory alongside `vip-workflows/`
2. Activate it in WordPress admin
3. Go to Integrations > Tools to verify it appears
4. Open a post in the editor; the tool should appear in the sidebar
