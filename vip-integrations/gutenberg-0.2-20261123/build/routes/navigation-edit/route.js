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

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// routes/navigation-edit/route.ts
var import_data = require_data();
var import_core_data = require_core_data();
var import_html_entities = require_html_entities();
var import_i18n = require_i18n();
const NAVIGATION_POST_TYPE = "wp_navigation";
const route = {
	beforeLoad: async ({ params }) => {
		const navigationId = parseInt(params.id, 10);
		if (Number.isNaN(navigationId)) throw notFound();
		if (!(await (0, import_data.resolveSelect)(import_core_data.store).getCurrentTheme())?.is_block_theme) throw notFound();
		try {
			if (!await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("postType", NAVIGATION_POST_TYPE, navigationId)) throw notFound();
		} catch {
			throw notFound();
		}
	},
	title: async ({ params }) => {
		const navigationId = parseInt(params.id);
		const navigation = await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("postType", NAVIGATION_POST_TYPE, navigationId);
		if (navigation?.title?.rendered) return (0, import_html_entities.decodeEntities)(navigation.title.rendered);
		if (navigation?.title?.raw) return navigation.title.raw;
		return (0, import_i18n.__)("Navigation");
	},
	canvas: async ({ params }) => {
		const postId = parseInt(params.id);
		return {
			postType: NAVIGATION_POST_TYPE,
			postId,
			isPreview: true
		};
	},
	loader: async ({ params }) => {
		const navigationId = parseInt(params.id);
		await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("postType", NAVIGATION_POST_TYPE, navigationId);
	}
};

export { route };