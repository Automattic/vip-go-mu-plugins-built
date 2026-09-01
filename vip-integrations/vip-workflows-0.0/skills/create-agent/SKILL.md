---
name: create-vip-workflows-agent
description: >-
  Scaffold a VIP Workflows agent plugin. Use when the user wants to create
  a research agent, a story discovery source, an AI-stage agent, or a
  combined agent that provides multiple capabilities for VIP Workflows.
---
# Create a VIP Workflows Agent

An **agent** is a standalone WordPress plugin that extends VIP Workflows. All agents appear as cards on the unified **Integrations > Agents** tab. An agent can provide one or more of these capabilities:

- **Research** — runs *after* an editor has a seed, inside an ideation project. Returns cards (articles, discussions, media) that populate the project's mood board.
- **Discovery** — runs *before* an editor has a seed, on the ideation landing page. Returns story prompts that editors can click to spawn a new project.
- **Stage** — runs when a post enters an AI-owned workflow stage. Returns a pass/fail verdict the stage's routing map turns into an exit transition; execution errors follow the stage's optional error route or fail in place.

A single plugin can provide research only, discovery only, stage only, or a combination. See `docs/specs/shipped/unified-assistants-tab.md` for the underlying architecture.

## Decide the Shape First

Before writing any code, decide which capabilities the agent offers:

| Capability | When it runs | Returns | Registration hook | Required callbacks |
|------------|--------------|---------|-------------------|--------------------|
| **Research** | Inside a project (after seed) | Cards for mood board | `wp_abilities_api_init` | `execute_callback` |
| **Discovery** | Landing page (before seed) | Story prompts | `vip_workflows_register_discovery_providers` | `seed` + one or both of `recommend` / `search` (+ `filters` if `search`) |
| **Stage** | When a post enters an AI-owned workflow stage | `{ status: pass\|fail, summary }` | `vip_workflows_register_abilities` | `execute_callback` |

Discovery itself has two independent sub-features declared in the `features` array:

- **`recommend`** — returns a curated list for the landing page. Called on page load, no user query. Think "what's newsworthy right now."
- **`search`** — returns results matching a user query and filter selections, powering the "Browse more…" modal. Requires `filters` callback alongside.

A discovery provider can declare `recommend` only, `search` only, or both. Most full-featured sources do both.

## Stage Agents (AI-owned workflow stages)

A **stage agent** runs automatically when a post enters a workflow stage that has been marked as AI-owned. It inspects the post, optionally rewrites the content (saving a revision), and returns an outcome. The stage's routing table then maps that outcome to one of the stage's configured transitions — so the agent participates in transitions exactly like a human stage (bump back, advance to a human, or move on).

A stage agent is a normal ability plus an agent manifest. It has different requirements from research and discovery agents:

1. **Input contract** — take `post_id`; read the post through `VIPWorkflows\Abilities\Agents\StageAgent::read_post()` so permissions and empty-content errors match core stage agents.
2. **Stage metadata** — set `meta.stage_eligible => true` and include `'stage'` in `meta.supports` alongside `'workflow'`. The Sequence editor's agent picker and `/vip-workflows/v1/abilities?context=stage` only list abilities with both signals.
3. **Agent manifest** — register on `vip_workflows_register_assistant_meta` with `capabilities => array( 'stage' )`. This marks the card as **Available in AI stage** only when the referenced ability is also stage-eligible.
4. **Output contract** — return `{ status, summary, ... }` where `status` is either `pass` or `fail`. Stage agents make a binary editorial judgment: return `pass` when the post is safe to continue on the success path, or `fail` (with a clear `summary`/`issues` payload) when it should not. Return a `WP_Error` on failure; the runner routes that through the stage's `error` destination.
5. **Mutability contract** — read-only agents should declare `annotations.readonly => true`. Mutating agents must write through `StageAgent`: use `StageAgent::write_content()` to rewrite the body, or `StageAgent::write_block_notes()` to annotate blocks with native editorial notes (`comment_type => 'note'`, anchored via the block's `metadata.noteId`). Both sanitize content and attribute the change to the acting user. A note-writing agent is not read-only (`annotations.readonly => false`). Native notes render in the editor's Comments panel for post types that declare `editor => notes` support (`post`/`page` do by default; a custom type needs `add_post_type_support( $type, 'notes' )`).

**Routing** (authored on the stage, not the agent): `agent.routing = { pass, fail, error }`, where each value is a status key that must be one of that stage's configured transitions. Every key is optional, `error` included: when `error` is routed, the runner sends a `WP_Error`, an invalid contract result, or any unrouted outcome there; without it, an errored run fails in place and the editor offers a "go back to the previous stage" action. The engine (`StageAgentRunner`) runs the agent asynchronously on stage entry, gates human transitions while it runs (and while it sits failed with a go-back available), and performs the exit transition as the agent — humans can only ever take the routed destinations.

In the Sequence editor these are authored on the canvas, not in a form: choosing an agent in the stage inspector is what makes the stage AI-owned, and the node then carries three colored source handles — green `pass`, red `fail`, amber `error`. Dragging one onto another stage sets that outcome's destination and creates the transition it travels on. The inspector reads the routes back but does not edit them.

**An AI stage's other transitions are disabled.** The agent owns the way out, so any transition no outcome routes along is inert: `StatusManager::get_available_transitions()` withholds it (the block editor offers no buttons while the agent works), and the canvas draws it dashed and grey. Nothing is deleted — the transition keeps its roles, tools, and notifications, and goes live again the moment an outcome is routed along it or the agent is taken off the stage. The withholding is scoped to a run actually being in flight: a failed run, or a stage that gained its agent while posts were already sitting in it, hands the transitions back rather than stranding the post.

> Audit logging and revision attribution for agent stages are tracked separately.

> **Agent stages are not reproducible.** `StageAgent::generate()` requests no sampling temperature and offers no way to ask for one, so identical inputs may produce different output — including a different `pass`/`fail` verdict on the same post. Mechanical stages (reformatting, tag sanity) briefly pinned temperature to 0 and did promise stable output; that promise is withdrawn. Newer Claude models refuse any request carrying the option, answering with HTTP 400 rather than ignoring it, and the AI Client's model metadata cannot be used to send it selectively — the Anthropic provider applies one hardcoded option list to every model it enumerates, advertising `temperature` as supported even where the API rejects it. Sending it only to models believed to accept it would be a guess, so it is not sent at all. Do not write an agent whose correctness depends on run-to-run stability.

## Requirements

Before starting, gather from the user:

1. **Shape** — research, discovery, stage, or a combination?
2. **For discovery** — does it support `recommend`, `search`, or both?
3. **For stage** — read-only or mutating? A binary `pass`/`fail` judgment, and what data should appear in the result payload?
4. **For stage** — what post inputs and settings does it need? Stage agents should always require `post_id`; optional settings belong in the agent's `settings_schema` or in the stage's `agent.settings`.
5. **Data source** — what API or service? (e.g., Reddit, PubMed, Foresight News, a wire service, an internal CMS, or an AI prompt over the current post)
6. **Plugin slug** — e.g., `workflow-agent-reddit`, `workflow-agent-copy-edit`, or `workflow-qwoted` for combined
7. **Namespaced IDs** — ability ID like `workflow-agent-reddit/reddit` (research), `workflow-agent-copy-edit/copy-edit` (stage), or provider slug like `my-news-source` (discovery)
8. **Icon** — an icon slug (e.g. `'search'`, `'calendar'`), from the set in
   `src/admin/components/ideation/assistant-icon.js`. Not an emoji: the admin
   renders these through `@wordpress/icons`, and an unknown slug renders nothing.
9. **Credentials?** — does it need an API key? Determines `settings_schema` and `availability_callback` / `is_configured`. Where does the key come from — the agent's own card fields (`RequirementFactory::in_card()`), a service the plugin reads through `VIPWorkflows\AI\Credentials` (`RequirementFactory::missing_credential()`), or nowhere the user can act on (`unsupported_environment()` / `dependency()`)? See [Availability](#availability)

## Plugin Structure

```
workflow-{name}/
  workflow-{name}.php   # Main plugin file (single file is fine for most agents)
```

The plugin directory lives alongside `vip-workflows/` in the same parent directory (not inside it).

Naming conventions (not enforced, but keep things scannable):

- Research-only: `workflow-agent-{name}` (e.g., `workflow-agent-wikipedia`)
- Stage-only: `workflow-agent-{name}` (e.g., `workflow-agent-copy-edit`)
- Discovery-only: `workflow-discovery-{name}` (e.g., `workflow-discovery-newswire`)
- Both: `workflow-{name}` (e.g., `workflow-qwoted`)

## Boilerplate: Research-Only

Use this when the agent only runs during ideation on the mood board.

```php
<?php
/**
 * Plugin Name: Workflow Agent: {Display Name}
 * Description: Research agent that searches {data source} during ideation.
 * Version: 1.0.0
 * Requires Plugins: vip-workflows
 * Text Domain: workflow-agent-{name}
 *
 * @package WorkflowAgent{PascalName}
 */

declare( strict_types=1 );

namespace WorkflowAgent{PascalName};

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_abilities_api_init', __NAMESPACE__ . '\register' );

function register(): void {
    if ( ! function_exists( 'vip_workflows_register_ability' ) ) {
        return;
    }

    vip_workflows_register_ability(
        'workflow-agent-{name}/{slug}',
        array(
            'label'               => __( '{Display Name}', 'workflow-agent-{name}' ),
            'description'         => __( '{One-line description of what this searches.}', 'workflow-agent-{name}' ),
            'category'            => 'research',
            'input_schema'        => array(
                'type'       => 'object',
                'properties' => array(
                    'seed'          => array( 'type' => 'string' ),
                    'seed_analysis' => array( 'type' => 'object' ),
                    'project_id'    => array( 'type' => 'integer' ),
                    'query'         => array( 'type' => 'string' ),
                    'brand_context' => array( 'type' => 'array' ),
                ),
                'required'   => array( 'seed' ),
            ),
            'output_schema'       => array(
                'type'       => 'object',
                'properties' => array(
                    'cards'   => array( 'type' => 'array' ),
                    'summary' => array( 'type' => 'string' ),
                ),
            ),
            'execute_callback'    => __NAMESPACE__ . '\execute',
            'permission_callback' => function () {
                return current_user_can( 'edit_posts' );
            },
            'meta'                => array(
                'type'             => 'research',
                'display_order'    => 50,
                'show_in_rest'     => true,
                'icon'             => 'search',
                'thinking_message' => __( 'Searching {source}...', 'workflow-agent-{name}' ),
                'success_message'  => __( '{Source} search complete.', 'workflow-agent-{name}' ),
                // Uncomment if the agent needs configuration:
                // 'settings_schema'  => array(
                //     'api_key' => array(
                //         'type'     => 'string',
                //         'label'    => 'API Key',
                //         'required' => true,
                //         'secret'   => true,
                //     ),
                //     'max_results' => array(
                //         'type'    => 'integer',
                //         'label'   => 'Max Results',
                //         'default' => 10,
                //         'minimum' => 1,
                //         'maximum' => 50,
                //     ),
                // ),
                // See the Availability section below for the callback body.
                // 'availability_callback' => __NAMESPACE__ . '\check_availability',
            ),
        )
    );
}

/**
 * Execute the research search.
 *
 * When `query` is present (manual follow-up), search that term directly.
 * Otherwise use targeted search_queries from seed analysis, falling back
 * to the raw seed only if analysis produced nothing.
 *
 * @param array $input { seed: string, seed_analysis: array, query?: string, brand_context?: array }
 * @return array { cards: array, summary: string }
 */
function execute( array $input ): array {
    $seed_analysis = $input['seed_analysis'] ?? array();

    if ( ! empty( $input['query'] ) ) {
        $queries = array( $input['query'] );
    } else {
        $queries = $seed_analysis['search_queries'] ?? array();
        if ( empty( $queries ) ) {
            $queries = array( $input['seed'] ?? '' );
        }
    }

    $queries = array_filter( $queries );
    if ( empty( $queries ) ) {
        return array( 'cards' => array(), 'summary' => 'No search query provided.' );
    }

    $all_cards = array();
    foreach ( array_slice( $queries, 0, 3 ) as $query ) {
        $all_cards = array_merge( $all_cards, search_source( $query ) );
    }

    return array(
        'cards'   => $all_cards,
        'summary' => sprintf( 'Found %d results.', count( $all_cards ) ),
    );
}

function search_source( string $query ): array {
    $url      = add_query_arg( array( 'q' => $query ), 'https://api.example.com/search' );
    $response = wp_remote_get( $url, array( 'timeout' => 10 ) );

    if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
        return array();
    }

    $body    = json_decode( wp_remote_retrieve_body( $response ), true );
    $results = $body['results'] ?? array();
    $cards   = array();

    foreach ( array_slice( $results, 0, 10 ) as $item ) {
        $cards[] = array(
            'type'        => 'article',
            'source_type' => 'article',
            'origin'      => '{name}',
            'title'       => $item['title'] ?? '',
            'url'         => $item['url'] ?? '',
            'excerpt'     => $item['description'] ?? '',
            'content'     => $item['body'] ?? '',
            'domain'      => '{domain.com}',
            'author'      => $item['author'] ?? null,
            'date'        => $item['date'] ?? null,
            'image'       => $item['image'] ?? null,
            'source'      => '{name}',
        );
    }

    return $cards;
}
```

### Research Card Fields

Every card **must** include:
- `source_type` — `'article'`, `'image'`, `'video'`, `'discussion'`, or `'document'`
- `origin` — identifies where this card came from (your source name)
- `title` — display title
- `url` — link to the original source

Recommended: `excerpt`, `content`, `domain`, `author`, `date`, `image`, `score`, `source`.

**These fields are the card's identity.** A stored source's id is derived from
the card — the URL when it has one, otherwise `title` plus `content` — so
returning the same card on a later run updates nothing and inserts nothing
rather than adding a duplicate. Two consequences for your agent:

- Return a stable `url` for anything that has one. A URL that changes between
  runs (a cache-busting query param, a session id) forks into a new card
  each time.
- If your agent generates content rather than finding it, put the full body in
  `content`. Cards with no URL are identified by title plus body, so two
  generated cards that differ only in a field you left out will collapse into
  one and the second will be silently dropped.

Optional grouping: if your agent returns related cards (e.g., an article + its comments), give them the same `group_id` string. The mood board will render them as a linked pair.

## Boilerplate: Stage-Capable

Use this when the agent only runs as an AI-owned workflow stage.

```php
<?php
/**
 * Plugin Name: Workflow Agent: {Display Name}
 * Description: Stage-capable agent that {describes what it checks or rewrites}.
 * Version: 1.0.0
 * Requires Plugins: vip-workflows
 * Text Domain: workflow-agent-{name}
 *
 * @package WorkflowAgent{PascalName}
 */

declare( strict_types=1 );

namespace WorkflowAgent{PascalName};

use VIPWorkflows\Abilities\Agents\StageAgent;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'vip_workflows_register_abilities', __NAMESPACE__ . '\register' );
add_action( 'vip_workflows_register_assistant_meta', __NAMESPACE__ . '\register_agent_meta' );

function register(): void {
    if ( ! function_exists( 'vip_workflows_register_ability' ) || ! class_exists( StageAgent::class ) ) {
        return;
    }

    vip_workflows_register_ability(
        'workflow-agent-{name}/{slug}',
        array(
            'label'               => __( '{Display Name}', 'workflow-agent-{name}' ),
            'description'         => __( '{One-line description.}', 'workflow-agent-{name}' ),
            'category'            => 'vip-workflows',
            'input_schema'        => array(
                'type'                 => 'object',
                'additionalProperties' => false,
                'properties'           => array(
                    'post_id' => array(
                        'type'        => 'integer',
                        'description' => __( 'The post ID for this agent.', 'workflow-agent-{name}' ),
                    ),
                ),
                'required'             => array( 'post_id' ),
            ),
            'output_schema'       => array(
                'type'                 => 'object',
                'additionalProperties' => false,
                'required'             => array( 'status', 'summary' ),
                'properties'           => array(
                    'status'  => array(
                        'type' => 'string',
                        'enum' => array( 'pass', 'fail' ),
                    ),
                    'summary' => array( 'type' => 'string' ),
                    'issues'  => array( 'type' => 'array' ),
                ),
            ),
            'execute_callback'    => __NAMESPACE__ . '\execute',
            'permission_callback' => function () {
                return current_user_can( 'edit_posts' );
            },
            'meta'                => array(
                'type'                => 'agent',
                'show_in_rest'        => true,
                'show_in_commands'    => false,
                'transition_eligible' => false,
                'icon'                => 'search',
                'supports'            => array( 'workflow', 'stage' ),
                'stage_eligible'      => true,
                'annotations'         => array(
                    'readonly'    => true,
                    'destructive' => false,
                    'idempotent'  => true,
                ),
            ),
        )
    );
}

function register_agent_meta( $registry ): void {
    $registry->register(
        'workflow-agent-{name}',
        array(
            'label'        => __( '{Display Name}', 'workflow-agent-{name}' ),
            'description'  => __( '{One-line description.}', 'workflow-agent-{name}' ),
            'icon'         => 'search',
            'ability_ids'  => array( 'workflow-agent-{name}/{slug}' ),
            'capabilities' => array( 'stage' ),
        )
    );
}

function execute( ?array $input = null ) {
    $input   = $input ?? array();
    $post_id = (int) ( $input['post_id'] ?? 0 );

    if ( ! $post_id ) {
        return new \WP_Error( 'missing_post_id', __( 'A post_id is required.', 'workflow-agent-{name}' ) );
    }

    $post = StageAgent::read_post( $post_id );
    if ( is_wp_error( $post ) ) {
        return $post;
    }

    // Build your prompt or deterministic check from $post['title'] and $post['content'].
    // Return StageAgent::result( 'pass', '...' ) or StageAgent::result( 'fail', '...', array( 'issues' => $issues ) ).
}
```

The unified agent REST entry will include `capabilities: [ 'stage' ]` and `available_in_ai_stage: true` when the ability is registered and stage-eligible.

## Boilerplate: Discovery-Only

Use this when the agent only surfaces prompts on the landing page.

```php
<?php
/**
 * Plugin Name: Workflow Discovery: {Display Name}
 * Description: Story discovery provider that surfaces prompts from {data source}.
 * Version: 1.0.0
 * Requires Plugins: vip-workflows
 * Text Domain: workflow-discovery-{name}
 *
 * @package WorkflowDiscovery{PascalName}
 */

declare( strict_types=1 );

namespace WorkflowDiscovery{PascalName};

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'vip_workflows_register_discovery_providers', __NAMESPACE__ . '\register' );

function register( $registry ): void {
    $registry->register( '{provider-slug}', array(
        'label'       => __( '{Display Name}', 'workflow-discovery-{name}' ),
        'description' => __( '{One-line description of what this provider surfaces.}', 'workflow-discovery-{name}' ),
        'icon'        => 'search',
        'features'    => array( 'recommend', 'search' ), // keep only what you implement
        'callbacks'   => array(
            'recommend' => __NAMESPACE__ . '\get_recommendations', // required if 'recommend' in features
            'search'    => __NAMESPACE__ . '\search',              // required if 'search' in features
            'filters'   => __NAMESPACE__ . '\get_filters',         // required if 'search' in features
            'seed'      => __NAMESPACE__ . '\generate_seed',       // always required
        ),
        // Uncomment if credentials are needed. See the Availability section below
        // for the callback body.
        // 'availability_callback' => __NAMESPACE__ . '\check_availability',
    ) );
}

/**
 * Return curated prompts for the landing page.
 *
 * Called on page load with the provider's saved settings.
 * Return up to 6 prompts. Cache aggressively (see Caching section).
 *
 * @param array $config Provider settings (categories, regions, etc.).
 * @return array Array of story prompt arrays.
 */
function get_recommendations( array $config ): array {
    $response = wp_remote_get( 'https://api.example.com/upcoming', array( 'timeout' => 10 ) );

    if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
        return array();
    }

    $body    = json_decode( wp_remote_retrieve_body( $response ), true );
    $results = $body['items'] ?? array();

    return array_map( __NAMESPACE__ . '\normalize_prompt', array_slice( $results, 0, 6 ) );
}

/**
 * Search for prompts matching user criteria.
 *
 * @param array $params { text: string, filters: array<string, mixed> }
 * @return array Array of story prompt arrays.
 */
function search( array $params ): array {
    $text    = $params['text'] ?? '';
    $filters = $params['filters'] ?? array();

    $url      = add_query_arg( array( 'q' => $text ), 'https://api.example.com/search' );
    $response = wp_remote_get( $url, array( 'timeout' => 10 ) );

    if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
        return array();
    }

    $body    = json_decode( wp_remote_retrieve_body( $response ), true );
    $results = $body['items'] ?? array();

    return array_map( __NAMESPACE__ . '\normalize_prompt', $results );
}

/**
 * Return search filter definitions for the modal UI.
 *
 * Supported types: 'select', 'multi_select', 'date_range'.
 * Return an empty array if the provider has no filters but supports search.
 */
function get_filters(): array {
    return array(
        array(
            'key'     => 'category',
            'label'   => __( 'Category', 'workflow-discovery-{name}' ),
            'type'    => 'select',
            'options' => array(
                array( 'value' => 'all', 'label' => 'All categories' ),
            ),
        ),
        // array(
        //     'key'     => 'date_range',
        //     'label'   => __( 'Date range', 'workflow-discovery-{name}' ),
        //     'type'    => 'date_range',
        //     'default' => array( 'from' => 'today', 'to' => '+90 days' ),
        // ),
    );
}

/**
 * Compose a seed string from a selected prompt.
 *
 * Called when an editor clicks a prompt card. The returned string becomes
 * the seed for a new ideation project. Include the most relevant context
 * your data source provides.
 */
function generate_seed( array $prompt ): string {
    $parts = array( $prompt['title'] );

    if ( ! empty( $prompt['description'] ) ) {
        $parts[] = $prompt['description'];
    }
    if ( ! empty( $prompt['date'] ) ) {
        $parts[] = sprintf( 'Scheduled for %s.', date( 'F j, Y', strtotime( $prompt['date'] ) ) );
    }
    if ( ! empty( $prompt['tags'] ) ) {
        $parts[] = sprintf( 'Topics: %s.', implode( ', ', $prompt['tags'] ) );
    }

    return implode( ' ', $parts );
}

function normalize_prompt( array $item ): array {
    return array(
        'id'          => '{provider-slug}-' . ( $item['id'] ?? '' ),
        'provider'    => '{provider-slug}',
        'title'       => $item['title'] ?? '',
        'description' => $item['description'] ?? '',
        'url'         => $item['url'] ?? '',
        'date'        => $item['date'] ?? null,
        'date_end'    => $item['date_end'] ?? null,
        'tags'        => $item['tags'] ?? array(),
        'importance'  => $item['importance'] ?? 'normal',
        'meta'        => $item['meta'] ?? array(),
    );
}
```

### Story Prompt Shape

Every prompt **must** include:
- `id` — provider-namespaced unique identifier (e.g., `foresight-703721`)
- `provider` — the provider slug
- `title` — display title

Recommended: `description`, `url`, `date`, `date_end`, `tags`, `importance`, `meta`.

`importance` is provider-defined. The UI renders badges based on it (`key_event`, `top_story`, `normal`) but does not enforce a universal scale. `meta` is freeform and provider-specific — use it for structured data your seed generation or settings UI needs (event types, regions, contacts, embargo info, etc.).

## Boilerplate: Research + Discovery

Use this when one plugin provides both capabilities (e.g., Qwoted surfaces journalist requests as prompts *and* finds expert sources during research).

Register both independently, then declare a unified agent manifest so the Agents tab renders a single card covering both with a shared label, icon, description, and settings form.

```php
<?php
/**
 * Plugin Name: Workflow {Display Name}
 * Description: {Short description combining both capabilities.}
 * Version: 1.0.0
 * Requires Plugins: vip-workflows
 * Text Domain: workflow-{name}
 *
 * @package Workflow{PascalName}
 */

declare( strict_types=1 );

namespace Workflow{PascalName};

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Register the research ability.
add_action( 'wp_abilities_api_init', __NAMESPACE__ . '\register_ability' );

function register_ability(): void {
    if ( ! function_exists( 'vip_workflows_register_ability' ) ) {
        return;
    }

    vip_workflows_register_ability(
        'workflow-{name}/{ability-slug}',
        array(
            'label'               => __( '{Display Name}', 'workflow-{name}' ),
            'description'         => __( '{Research description.}', 'workflow-{name}' ),
            'category'            => 'research',
            // ... input_schema, output_schema, execute_callback, permission_callback
            'meta'                => array(
                'type'         => 'research',
                'show_in_rest' => true,
                'icon'         => 'search',
            ),
        )
    );
}

// Register the discovery provider.
add_action( 'vip_workflows_register_discovery_providers', __NAMESPACE__ . '\register_provider' );

function register_provider( $registry ): void {
    $registry->register( '{provider-slug}', array(
        'label'     => __( '{Display Name}', 'workflow-{name}' ),
        'icon'      => 'search',
        'features'  => array( 'recommend', 'search' ),
        'callbacks' => array(
            'recommend' => __NAMESPACE__ . '\get_recommendations',
            'search'    => __NAMESPACE__ . '\search_prompts',
            'filters'   => __NAMESPACE__ . '\get_filters',
            'seed'      => __NAMESPACE__ . '\generate_seed',
        ),
    ) );
}

// Declare the unified manifest so both appear as a single card.
add_action( 'vip_workflows_register_assistant_meta', __NAMESPACE__ . '\register_assistant_meta' );

function register_assistant_meta( $registry ): void {
    $registry->register( 'workflow-{name}', array(
        'label'           => __( '{Display Name}', 'workflow-{name}' ),
        'description'     => __( 'Expert sources and story prompts from {source}.', 'workflow-{name}' ),
        'icon'            => 'search',
        'ability_ids'     => array( 'workflow-{name}/{ability-slug}' ),
        'provider_slugs'  => array( '{provider-slug}' ),
        'settings_schema' => array(
            'api_key' => array(
                'type'     => 'string',
                'label'    => 'API Key',
                'required' => true,
                'secret'   => true,
            ),
        ),
    ) );
}
```

Without a manifest, the two registrations would show up as two separate cards. The manifest is only needed when one plugin spans both capabilities. Single-capability plugins are auto-detected and need no manifest.

## Availability

An agent that needs configuration declares an `availability_callback` — in `meta` for an ability, as a top-level key for a discovery provider. Write it against the structured shape from the start: returning a bare `false` gets the card a generic "required settings are not configured" line that names nothing and links nowhere.

**Return either:**

| Return value | Meaning |
|---|---|
| `true` | Dependencies are met. Return this the moment they are — including when only one member of an `any` group is satisfied. |
| `VIPWorkflows\Abilities\Availability::unmet( ... )` | Dependencies are not met, carrying the unmet requirements. |
| `false` | Legacy shape. Still supported and silent, but the card can only render the generic line. |

**The callback owns satisfaction.** It is the only code with credential access, so nothing downstream re-derives it: a requirement group contains *only* unmet members, and `Availability::unmet()` is never returned for a dependency that is actually satisfied.

**Build requirements with `RequirementFactory`**, not by hand. Hand-construction means supplying an id, a kind, two message registers, source attribution, and a destination; the factory derives all of it, and resolves the destination against the install rather than hardcoding a screen that may not exist. Construct a `Requirement` directly only when no factory fits — for example a key read from your own `wp-config.php` constant, which needs `Destination::none()` naming that constant.

| Factory method | Use when |
|---|---|
| `in_card( $id, $admin_reason, $user_message, $hint, $sources )` | The key is entered in the agent's own card fields (`settings_schema`). This is the usual case for a third-party agent. |
| `missing_credential( $service, $service_label, $sources )` | The key is one the plugin reads through `VIPWorkflows\AI\Credentials`. Derives everything from the service slug, and resolves to Settings → Connectors or to the `wp-config.php` constant name depending on the install. |
| `dependency( $id, $admin_reason, $user_message, $sources )` | A prerequisite other than a credential is missing (e.g. no provider is registered). |
| `unsupported_environment( $id, $admin_reason, $user_message, $sources )` | The environment cannot support the capability, so there is nothing to configure. |

Group members with `RequirementGroup::all()` when every one is needed, or `RequirementGroup::any()` when one is enough — an `any` group renders as a single "configure at least one of" block rather than N separate blockers.

```php
use VIPWorkflows\Abilities\Availability;
use VIPWorkflows\Abilities\RequirementFactory;
use VIPWorkflows\Abilities\RequirementGroup;

/**
 * Whether this agent's dependencies are met, and what is missing if not.
 *
 * Registered as the `availability_callback` for both the ability and the
 * discovery provider. Sharing one callback means both contribute the same
 * requirement id, so the card renders one row listing both capabilities.
 */
function check_availability(): bool|Availability {
    if ( is_configured() ) {
        return true;
    }

    return Availability::unmet(
        RequirementGroup::all(
            RequirementFactory::in_card(
                'settings:workflow-{name}',
                __( '{Display Name} sign-in details are missing. Add the API key below.', 'workflow-{name}' ),
                __( '{Display Name} is not connected. Ask an administrator to connect it.', 'workflow-{name}' ),
                __( 'Complete the API key field below.', 'workflow-{name}' ),
                array( __( '{Display Name}', 'workflow-{name}' ) )
            )
        )
    );
}

function is_configured(): bool {
    $settings = \VIPWorkflows\Abilities\AbilitySettings::get_instance();
    $options  = $settings->get_options( 'workflow-agent-{name}/{slug}' );

    return ! empty( $options['api_key'] );
}
```

**Two message registers, and you must supply both.** Agent execution is gated on `edit_posts`, while the Agents screen and Settings → Connectors both require `manage_options`. The `$admin_reason` may name a screen; the `$user_message` must not — it is what an editor sees mid-workflow, and pointing them at a page they cannot open is a dead instruction. Which register is emitted is decided at the read boundary, not by you.

Note the separation the Agents card preserves: **enabled** is an admin preference, **available** is whether dependencies are satisfied. Returning `false` from `availability_callback` does not disable an agent, and an admin disabling an agent does not make it unavailable.

## Settings UI (Optional)

If the agent needs configuration, there are two paths:

**Schema-based (recommended).** Declare `settings_schema` — in the ability `meta` for research-only, in the provider config for discovery-only, or in the unified manifest for both. The Agents tab auto-renders the form via `SchemaSettings`. No JS needed.

**Fully custom React UI.** Inject a component via the unified JS filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'vipWorkflows.assistantSettings',
    'workflow-{name}',
    ( component, assistant, { disabled, onHasChangesChange, onSaveRef } ) => {
        // Match on your ability id, not on `assistant.slug`. An entry slug is
        // derived, and only a manifest controls its own: an agent with no
        // manifest gets a slug built from its whole ability id
        // (`workflow-{name}-{slug}`), so a slug comparison silently stops
        // matching. Ability ids are yours and never change under you.
        if ( ! assistant.ability_ids?.includes( 'workflow-{name}/{slug}' ) ) {
            return component;
        }

        return (
            <SettingsForm
                assistant={ assistant }
                disabled={ disabled }
                onHasChangesChange={ onHasChangesChange }
                onSaveRef={ onSaveRef }
            />
        );
    }
);
```

The filter receives the full unified agent entry (`slug`, `capabilities`, `ability_ids`, `provider_slugs`, `options`, `settings_schema`, …) plus a callbacks object. The card always passes that object, on every path, so destructure it directly — it is never `undefined`. It carries three members:

- `disabled` (`bool`) — the agent is switched off.
- `onHasChangesChange( bool )` — drives the Save button's enabled state.
- `onSaveRef( fn )` — registers a handler invoked when the user clicks Save.

**You must honor `disabled`.** Everything your component renders describes how the agent behaves when it runs, so a switched-off agent offers none of it: pass `disabled` to every control, and never report `true` through `onHasChangesChange` while it is set. The card can only switch off the controls it renders itself, and your component replaces those outright — a component that ignores the flag lets a reader configure and save an agent that never runs, which is exactly the bug the flag exists to close. The Enabled toggle stays live; it is the way back.

Settings persist via `POST /vip-workflows/v1/assistants/{slug}/settings` with `{ enabled?: bool, options?: object }`. The registry writes through to the underlying legacy options (`vip_workflows_ability_settings[ability_id]`, `vip_discovery_provider_settings`, `vip_discovery_provider_{slug}`), so existing consumers keep working unchanged.

The legacy `vipWorkflows.assistantSettingsComponent` (research) and `vip_workflows_discovery_provider_settings` (discovery) filters are still honored for backward compatibility, but new code should always use `vipWorkflows.assistantSettings`. Both carry the same obligation: the legacy assistants filter receives the same three-member callbacks object, and the legacy discovery filter returns a component *type* that the card renders with a `disabled` prop alongside `providerSlug`.

## Caching

Cache external API responses server-side using WordPress transients:

- Research search results: 5–15 min TTL (keyed by query)
- Discovery recommendations: 15–30 min TTL
- Discovery search results: 5–10 min TTL (keyed by query + filters hash)
- Filter definitions: 24 hour TTL (taxonomy data changes rarely)
- Auth tokens: cache until expiry minus a buffer

## Registration Rules

**Research ability:**
- Ability name **must** be namespaced: `plugin-slug/ability-slug`
- `category` must be `'research'`
- `meta.type` must be `'research'`
- `meta.show_in_rest` must be `true`
- Hook into `wp_abilities_api_init` (not `init`)
- Guard with `function_exists( 'vip_workflows_register_ability' )` so the plugin degrades gracefully

**Discovery provider:**
- Provider slug must be unique across all plugins
- `features` must contain `'recommend'` and/or `'search'`
- If `recommend` is declared, the `recommend` callback must be callable
- If `search` is declared, both `search` and `filters` callbacks must be callable
- The `seed` callback is always required
- Hook into `vip_workflows_register_discovery_providers` (receives the registry instance)
- `availability_callback` is optional; if omitted the provider is always considered available. When present it should return `true` or an `Availability` — see [Availability](#availability)

**Unified manifest (multi-capability plugins):**
- `slug` must match the plugin's directory/text-domain slug
- `ability_ids` must reference abilities the plugin actually registers
- `provider_slugs` must reference providers the plugin actually registers
- `capabilities` may include `'stage'` when the plugin has at least one registered stage-eligible ability; the registry ignores unsupported manifest claims
- Hook into `vip_workflows_register_assistant_meta` (receives the registry instance)

**Stage ability:**
- Ability name **must** be namespaced: `plugin-slug/ability-slug`
- `category` should be `'vip-workflows'`
- `meta.type` must be `'agent'`
- `meta.supports` must include both `'workflow'` and `'stage'`
- `meta.stage_eligible` must be `true`
- `input_schema` must require `post_id`
- `output_schema` must require `status` and `summary`, with `status` limited to `pass` and `fail`
- Hook into `vip_workflows_register_abilities` so core stage helpers are already loaded
- Register a manifest on `vip_workflows_register_assistant_meta` with `capabilities => array( 'stage' )` so the Agents card is marked available in AI stages when the ability metadata also qualifies
- Read-only agents should declare `annotations.readonly => true`; mutating agents must write through `StageAgent::write_content()` (rewrite the body) or `StageAgent::write_block_notes()` (attach native block notes), and declare `annotations.readonly => false`

## Testing

1. Place the plugin directory alongside `vip-workflows/`.
2. Activate it in WordPress admin.
3. Go to **Integrations > Agents** to verify it appears as a single card and can be enabled.
4. Configure any settings, then:
   - **Research:** Create a new ideation project and confirm the agent runs on the mood board.
   - **Stage:** Open a Sequence, select a stage node, and confirm the agent appears in the inspector's Agent picker; choosing it turns the node purple and gives it the three outcome handles.
   - **Stage:** Drag each outcome handle onto a destination stage, then save and reload the Sequence to confirm `agent.ability_id`, `agent.settings`, and `agent.routing` persist.
   - **Stage:** Transition a post into the AI-owned stage and confirm the runner stores the result and routes by `pass`, `fail`, or `error`.
   - **Discovery (recommend):** Visit the Ideation landing page and confirm curated prompts appear.
   - **Discovery (search):** Click "Browse more…" to open the search modal and test queries + filters.
   - **Discovery (prompt selection):** Click a prompt and confirm a new project is created with the expected seed text.
