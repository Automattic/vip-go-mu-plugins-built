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

// packages/views/build-module/use-view.mjs
var import_core_data = require_core_data();
var import_i18n = require_i18n();
var import_element = require_element();
var import_data = require_data();
var import_preferences = require_preferences();

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/views/build-module/lock-unlock.mjs
var import_private_apis = require_private_apis();
const { lock: lock$1, unlock: unlock$1 } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/views");

// routes/lock-unlock/index.ts
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/routes");

// routes/navigation-list/view-utils.ts
const NAVIGATION_POST_TYPE$1 = "wp_navigation";
/**
* Resolves the server-provided view configuration for the navigation post
* type, for use in the route loader that runs outside React (where
* `useViewConfig` is unavailable).
*
* @return The entity view configuration.
*/
async function loadNavigationViewConfig() {
	const config = await unlock((0, import_data.resolveSelect)(import_core_data.store)).getViewConfig("postType", NAVIGATION_POST_TYPE$1);
	return {
		default_view: config?.default_view,
		default_layouts: config?.default_layouts,
		view_list: config?.view_list
	};
}

// routes/navigation-list/route.ts
const NAVIGATION_POST_TYPE = "wp_navigation";
const PRELOADED_NAVIGATION_MENUS_QUERY = {
	per_page: -1,
	status: ["publish", "draft"],
	order: "desc",
	orderby: "date"
};
const route = {
	async beforeLoad() {
		if (!(await (0, import_data.resolveSelect)(import_core_data.store).getCurrentTheme())?.is_block_theme) throw notFound();
	},
	title: () => (0, import_i18n.__)("Navigation"),
	canvas: async ({ search }) => {
		const firstNavigation = (await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecords("postType", NAVIGATION_POST_TYPE, PRELOADED_NAVIGATION_MENUS_QUERY))?.[0];
		if (!firstNavigation) return {
			postType: NAVIGATION_POST_TYPE,
			isPreview: true
		};
		const postId = search.ids ? parseInt(search.ids[0]) : firstNavigation.id;
		return {
			postType: NAVIGATION_POST_TYPE,
			postId,
			isPreview: true
		};
	},
	loader: async () => {
		await Promise.all([
			loadNavigationViewConfig(),
			(0, import_data.resolveSelect)(import_core_data.store).getEntityRecords("postType", NAVIGATION_POST_TYPE, PRELOADED_NAVIGATION_MENUS_QUERY),
			(0, import_data.resolveSelect)(import_core_data.store).canUser("create", {
				kind: "postType",
				name: NAVIGATION_POST_TYPE
			}),
			(0, import_data.resolveSelect)(import_core_data.store).getPostType(NAVIGATION_POST_TYPE),
			(0, import_data.resolveSelect)(import_core_data.store).getEntityRecords("root", "user", { per_page: -1 })
		]);
	}
};

export { route };