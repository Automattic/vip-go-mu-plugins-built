import { notFound } from "@wordpress/route";

// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// \0wp-global:@wordpress/preferences
var require_preferences = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.preferences;
}));

// packages/views/build-module/preference-keys.mjs
var import_data = require_data();
var import_core_data = require_core_data();
var import_i18n = require_i18n();
var import_element = require_element();
var import_preferences = require_preferences();
/**
* Generates a unique preference key for a DataViews view.
*
* @param kind The entity kind (e.g., 'postType', 'root')
* @param name The specific entity name (e.g., 'post', 'user', 'site')
* @param slug The specific entity slug (e.g., 'category', 'post', 'all')
* @return The preference key string
*/
function generatePreferenceKey(kind, name, slug) {
	return `dataviews-${kind}-${name}-${slug}`;
}

// packages/views/build-module/resolve-view.mjs
/**
* `page` and `search` are URL-managed: the URL is their only source. They are
* never persisted, and no other layer may configure them — an absent URL param
* is indistinguishable from the user having cleared the value, so any fallback
* would resurrect a cleared search on the next read.
*/
const QUERY_PARAMS = ["page", "search"];
function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
* Copies a layer without the URL-managed properties.
*
* @param layer The layer to copy.
* @return A copy of the layer with `page` and `search` removed.
*/
function withoutQueryParams(layer) {
	const result = isPlainObject(layer) ? { ...layer } : {};
	for (const key of QUERY_PARAMS) delete result[key];
	return result;
}
/**
* Merges a layer on top of another, recursing into plain objects so the upper
* layer only takes over the leaves it declares. Arrays and scalars are leaves:
* they are replaced wholesale.
*
* Nested properties (`layout.styles.<field>.width`, `groupBy.direction`,
* `sort.direction`) are merged leaf by leaf: a shallow merge would let a layer
* that only declares one leaf wipe every sibling the layers below provide.
*
* @param lower The layer to merge into.
* @param upper The layer to merge on top.
* @return The merged layer.
*/
function mergeLayer(lower, upper) {
	const result = { ...lower };
	for (const key of Object.keys(upper)) {
		const value = upper[key];
		const current = result[key];
		result[key] = isPlainObject(current) && isPlainObject(value) ? mergeLayer(current, value) : value;
	}
	return result;
}
function getLockedFilters(overrides) {
	return (overrides?.filters ?? []).filter((filter) => filter.isLocked);
}
/**
* Hoists the locked filters an override provides to the front of the view's
* filters, replacing any same-field filter. Locked filters are not the user's
* to change, so they are pinned in place instead of taking part in the layer
* resolution.
*
* @param view      The view to apply the locked filters to.
* @param overrides The active view overrides.
* @return The view with the locked filters applied.
*/
function applyLockedFilters(view, overrides) {
	const locked = getLockedFilters(overrides);
	if (locked.length === 0) return view;
	const rest = (view.filters ?? []).filter((filter) => !locked.some((f) => f.field === filter.field));
	return {
		...view,
		filters: [...locked, ...rest]
	};
}
/**
* The user's persisted modifications that still apply.
*
* A persisted `type` that `defaultLayouts` does not offer is dropped: DataViews
* renders nothing for a layout it is not given, and the preference may predate
* the current set of layouts (a screen that used to offer the list layout, say,
* and no longer does). The type then resolves out of the layers below, and the
* other modifications are kept. Without `defaultLayouts` every type is offered.
*
* `true` is a valid entry, so the check mirrors DataViews': an entry counts as
* long as it is truthy.
*
* @param persistedView  The user's persisted modifications.
* @param defaultLayouts The layouts on offer, keyed by layout type.
* @return The modifications that apply, or `undefined` when there are none.
*/
function getApplicablePersistedView(persistedView, defaultLayouts) {
	if (!persistedView || persistedView.type === void 0 || !defaultLayouts || defaultLayouts[persistedView.type]) return persistedView;
	const { type, ...rest } = persistedView;
	return Object.keys(rest).length > 0 ? rest : void 0;
}
/**
* Resolves the layers below the user's modifications — what a modification has
* to differ from to count as one. The layout type selects which entry of
* `defaultLayouts` applies, so the base only makes sense relative to a type.
*
* @param layers        The layers to resolve.
* @param effectiveType The layout type to resolve the base at.
* @return The resolved base view.
*/
function resolveBaseView(layers, effectiveType) {
	const { defaultView, defaultLayouts, activeViewOverrides } = layers;
	const layoutDefaults = defaultLayouts?.[effectiveType];
	return applyLockedFilters([layoutDefaults, activeViewOverrides].reduce((lower, upper) => mergeLayer(lower, withoutQueryParams(upper)), withoutQueryParams(defaultView)), activeViewOverrides);
}
/**
* Resolves a view out of its layers. Later layers override earlier ones:
*
* 1. `defaultView`
* 2. `defaultLayouts` (for the effective type)
* 3. `activeViewOverrides`
* 4. the user's persisted modifications (see `getApplicablePersistedView`)
* 5. the URL query params (`page` and `search` only)
*
* @param args See `ResolveViewArgs`.
* @return The resolved `view`.
*/
function resolveView(args) {
	const { defaultView, defaultLayouts, activeViewOverrides, page, search } = args;
	const persistedView = getApplicablePersistedView(args.persistedView, defaultLayouts);
	return {
		...applyLockedFilters(mergeLayer(resolveBaseView(args, persistedView?.type ?? activeViewOverrides?.type ?? defaultView?.type), withoutQueryParams(persistedView)), activeViewOverrides),
		page: Number(page ?? 1),
		search: search ?? ""
	};
}

// packages/views/build-module/load-view.mjs
/**
* Async function for loading view state in route loaders.
*
* Resolves the same layers `useView` does, so a route loader and the hook that
* takes over from it agree on the view.
*
* @param config                     Configuration object for loading the view.
* @param config.kind                Entity kind (e.g., 'postType', 'taxonomy', 'root').
* @param config.name                Specific entity name.
* @param config.slug                View identifier.
* @param config.defaultView         Default view configuration.
* @param config.defaultLayouts      Default layout configurations keyed by layout type.
* @param config.activeViewOverrides View overrides applied on top but never persisted.
* @param config.queryParams         Object with `page` and/or `search` from URL.
* @return Promise resolving to the loaded view object.
*/
async function loadView(config) {
	const { kind, name, slug, defaultView, defaultLayouts, activeViewOverrides, queryParams } = config;
	const preferenceKey = generatePreferenceKey(kind, name, slug);
	const persistedView = (0, import_data.select)(import_preferences.store).get("core/views", preferenceKey);
	return resolveView({
		defaultView,
		defaultLayouts,
		activeViewOverrides,
		persistedView,
		page: queryParams?.page,
		search: queryParams?.search
	});
}

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/views/build-module/lock-unlock.mjs
var import_private_apis = require_private_apis();
const { lock: lock$1, unlock: unlock$1 } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/views");

// routes/lock-unlock/index.ts
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/routes");

// routes/template-part-list/view-utils.ts
const TEMPLATE_PART_POST_TYPE = "wp_template_part";
/**
* Resolves the server-provided view configuration for the template part
* post type, for use in the route loader that runs outside React (where
* `useViewConfig` is unavailable).
*
* @return The entity view configuration.
*/
async function loadTemplatePartViewConfig() {
	const config = await unlock((0, import_data.resolveSelect)(import_core_data.store)).getViewConfig("postType", TEMPLATE_PART_POST_TYPE);
	return {
		default_view: config?.default_view,
		default_layouts: config?.default_layouts,
		view_list: config?.view_list
	};
}
async function ensureView(area, search) {
	const { default_view: defaultView, default_layouts: defaultLayouts, view_list: viewList } = await loadTemplatePartViewConfig();
	if (!defaultView) throw new Error(`Missing view configuration for the ${TEMPLATE_PART_POST_TYPE} post type.`);
	return loadView({
		kind: "postType",
		name: TEMPLATE_PART_POST_TYPE,
		slug: "default-new",
		defaultView,
		defaultLayouts,
		activeViewOverrides: viewList?.find((v) => v.slug === area)?.view ?? {},
		queryParams: search
	});
}
function viewToQuery(view) {
	const result = { per_page: -1 };
	const areaFilter = view.filters?.find((filter) => filter.field === "area");
	if (areaFilter) result.area = areaFilter.value;
	return result;
}

// routes/template-part-list/route.ts
/**
* Route configuration for template part list.
*/
const route = {
	async beforeLoad() {
		const supports = (await (0, import_data.resolveSelect)(import_core_data.store).getCurrentTheme())?.theme_supports;
		if (!supports?.["block-templates"] && !supports?.["block-template-parts"]) throw notFound();
	},
	title: () => (0, import_i18n.__)("Template Parts"),
	async canvas(context) {
		const { params, search } = context;
		const view = await ensureView(params.area, {
			page: search.page,
			search: search.search
		});
		if (view.type !== "list") return;
		if (search.postIds && search.postIds.length > 0) return {
			postType: "wp_template_part",
			postId: search.postIds[0].toString(),
			isPreview: true
		};
		const query = viewToQuery(view);
		const posts = await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecords("postType", "wp_template_part", query);
		if (posts && posts.length > 0) return {
			postType: "wp_template_part",
			postId: posts[0].id.toString(),
			isPreview: true
		};
	}
};

export { route };