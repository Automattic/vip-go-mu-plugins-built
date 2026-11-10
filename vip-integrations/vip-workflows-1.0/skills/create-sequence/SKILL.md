---
name: create-vip-workflows-sequence
description: >-
  Author a VIP Workflows editorial workflow (a "sequence") as JSON and create it
  without the UI. Use when the user wants to design, script, or import a workflow
  through the REST API or the Abilities API / MCP rather than the graph editor.
---
# Author a VIP Workflows Sequence Without the UI

A workflow is a **sequence**: a JSON config of stages, transitions, required tools, role permissions, transition inputs (assignments), and metadata fields. You can author one entirely without the graph editor. The reliable path is a loop:

**introspect -> draft -> validate -> create -> activate.**

## 1. Introspect

- `GET /wp-json/vip-workflows/v1/sequences/options` -> the post types a sequence may attach to, and the phase-transition graph.
- The `vip-workflows/get-sequences` ability -> the **active** sequences: id, name, type, and a stage summary (key, label, region, entry flag). Two limits to know: draft sequences are not listed at all (every import lands as a draft, so use the id the import returned), and the stage summary omits transitions, tools, roles, inputs, agents and metadata fields — a config built from it would have stages with no exits. Use it to find a sequence, not to copy one.
- To copy an existing sequence's full config, `GET /wp-json/vip-workflows/v1/sequences/{id}/export` -> the WRAPPED envelope with every field (section 4).
- The `vip-workflows/create-sequence` and `vip-workflows/validate-sequence` ability input schemas describe every field; read them before drafting.

## 2. Draft from the canonical starter

Start from this valid, dependency-free Draft -> Review -> Published starter and adapt it. It is the FLAT shape (section 4), ready for `create-sequence` as-is. If you have the plugin source to hand, the same file ships at `includes/sequences/templates/editorial-basic.json`, and `docs/examples/` holds a fuller pipeline in both shapes.

```json
{
	"name": "Editorial Basic",
	"type": "workflow",
	"post_types": [ "post" ],
	"settings": {
		"allow_skip": false
	},
	"statuses": [
		{
			"key": "draft",
			"label": "Draft",
			"status": "draft",
			"region_entry": true,
			"transitions": [
				{ "to": "review", "label": "Submit for review" }
			]
		},
		{
			"key": "review",
			"label": "In review",
			"status": "draft",
			"transitions": [
				{ "to": "published", "label": "Approve" },
				{ "to": "draft", "label": "Request changes" }
			]
		},
		{
			"key": "published",
			"label": "Published",
			"status": "publish",
			"region_entry": true,
			"is_terminal": true,
			"transitions": []
		}
	],
	"metadata_fields": [
		{
			"key": "seo_focus_keyword",
			"label": "SEO focus keyword",
			"type": "text",
			"required": false,
			"searchable": true
		}
	]
}
```

For an agent-driven stage, export a sequence that already has one, or copy the pattern in the plugin source at `vip-workflows/tests/fixtures/ai-copy-desk-workflow.json` (a WRAPPED file: lift the stage out of `config.statuses`).

## 3. The region model (the part that trips people up)

Every stage declares a **core status region** in its `status` field: one of `draft`, `pending`, `private`, `publish`. This is *not* the same as the workflow stage — the stage lives in post meta, the region is where WordPress keeps the post's publish status while it sits at that stage. An absent `status` defaults to `draft`; a value outside the four is **rejected**.

Each **region you use** needs exactly **one** `region_entry: true` stage — the checkpoint where a core-driven status change (the Publish button, a scheduled publish) re-seats the post. If a region names none, the first stage in that region (config order) is auto-marked. Declaring more than one `region_entry` in the same region is rejected. `region_entry` is not a constraint on transition targets — any transition may target any defined stage.

## 4. FLAT vs WRAPPED shapes

There are two on-the-wire shapes. Use the right one for the channel:

- **FLAT** — top-level `name` + `statuses` (plus `type`, `description`, `post_types`, `settings`, `metadata_fields`). This is the request body for `POST /wp-json/vip-workflows/v1/sequences` and the input of the `vip-workflows/create-sequence` ability. The starter above is FLAT.
- **WRAPPED** — the envelope `{ "type", "name", "description", "config": { "statuses", ... } }`. It is what `GET /sequences/{id}/export` emits, and what import consumes — but **not as the body itself**. Both import channels take the envelope as the value of a `sequence_json` parameter:
  - `POST /wp-json/vip-workflows/v1/sequences/import` with body `{ "sequence_json": { ...envelope... } }`;
  - the `vip-workflows/import-sequence` ability with input `{ "sequence_json": { ...envelope... }, "name": "optional override" }`.

  So to re-import an export, wrap the exported document in `sequence_json`.

The `statuses`/`post_types`/`settings`/`metadata_fields` payload is identical in both; only the envelope differs. Feeding a WRAPPED envelope to create, an envelope to import without the `sequence_json` wrapper, or a FLAT body to import all fail.

## 5. Field reference (quick)

- **Stage**: `key` (unique, `sanitize_key`), `label`, `status` (region, above), `region_entry` (bool), optional `is_terminal` / `is_initial`, `transitions[]`.
- **Transition**: `to` (must be a defined stage — no dangling targets), `label`, optional `required_tools[]` (ability IDs, e.g. `vip-workflows/readability`), `allowed_roles[]` (role slugs that may make the move), `inputs[]`.
- **Transition input / assignment**: at most one `{ "type": "assignment", "meta_key", "assignee_type", "label" }` per transition; `meta_key` must be unique across the whole sequence. Import regenerates these keys.
- **Metadata field**: `key` (`^[a-z0-9_]+$`), `label`, `type` (one of `text`, `textarea`, `select`, `date`, `user`), `required`, `searchable`; a `select` needs a non-empty `options[]`. A `required` field is enforced only on transitions that cross into the `publish` region.
- **Agent stage**: `agent: { "ability_id" (registered + stage-eligible), "settings": {}, "routing": { "pass", "fail", "error" } }`; each routing target must be a `to` of that stage's own transitions.

## 6. Validate before you write

Call `vip-workflows/validate-sequence` (read-only, idempotent) with your proposed `config` (or a stored `sequence_id`). It reproduces the exact write gate and reports what is wrong plus the normalized result. Fix every reported error and re-run until it returns valid. Retired note inputs (`textarea`, `text`) are removed before validating, as import removes them, and listed in `notes`; create and update refuse them, so leave them out of what you write.

## 7. Create, then activate

- `vip-workflows/create-sequence` (or `POST /sequences`, FLAT) creates the sequence and defaults it to **active**. Pass `status: "draft"` to stage it first.
- `vip-workflows/import-sequence` (or `POST /sequences/import`), with the WRAPPED envelope under `sequence_json`, always creates a **draft** — then call `vip-workflows/activate-sequence` with `active: true` to make it live. Activation is refused if the stored config is invalid.
- `vip-workflows/update-sequence` (or `PUT /sequences/{id}`) is a **full replacement**: any field you omit is cleared. Read/validate the stored config first.

From PHP (`wp eval-file`, an activation hook, a migration) call the same abilities with `wp_get_ability( 'vip-workflows/create-sequence' )->execute( $config )`. The plugin source carries a worked example at `vip-workflows/tests/fixtures/import-ai-copy-desk.php`.

The create, update, import, activate and validate abilities all require `manage_options` (validate is read-only but returns the full stored configuration); export and options require only `edit_posts`.

## 8. Verify

`GET /sequences/{id}` to confirm the stored config, open a post of an attached post type to see the stages, and `GET /sequences/{id}/stats` for per-stage counts.
