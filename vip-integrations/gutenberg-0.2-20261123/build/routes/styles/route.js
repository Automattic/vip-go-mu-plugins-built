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

// \0wp-global:@wordpress/url
var require_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.url;
}));

// routes/styles/previewed-theme.ts
var import_data = require_data();
var import_core_data = require_core_data();
var import_html_entities = require_html_entities();
var import_i18n = require_i18n();
var import_url = require_url();
const THEME_PREVIEW_ADMIN_PAGE = "theme-preview-wp-admin";
const previewedStylesheet = (() => {
	const value = (0, import_url.getQueryArg)(window.location.href, "wp_theme_preview");
	return typeof value === "string" ? value : "";
})();
function getPreviewedStylesheet() {
	return previewedStylesheet;
}
/**
* Whether this route is rendered on the standalone theme preview admin page,
* rather than inside the site editor.
*/
function isThemePreviewAdminPage() {
	return new URLSearchParams(window.location.search).get("page") === THEME_PREVIEW_ADMIN_PAGE;
}
/**
* Formats the screen title for a previewed theme.
*
* @param themeName The previewed theme's decoded name, when known.
*/
function getPreviewTitle(themeName) {
	return themeName ? (0, import_i18n.sprintf)((0, import_i18n.__)("Previewing %s"), themeName) : (0, import_i18n.__)("Theme Preview");
}

// routes/styles/route.ts
async function isBlockTheme() {
	return !!(await (0, import_data.resolveSelect)(import_core_data.store).getCurrentTheme())?.is_block_theme;
}
/**
* Route configuration for styles.
*
* The route also serves the theme preview page, rendering the same screen
* for the theme named by the `wp_theme_preview` query parameter, which Core
* resolves on every request — REST requests included. See
* `gutenberg_get_theme_preview_url()` for the full account.
*/
const route = {
	beforeLoad: () => {
		if (isThemePreviewAdminPage() && !getPreviewedStylesheet()) throw notFound();
	},
	title: async () => {
		if (!getPreviewedStylesheet()) return (0, import_i18n.__)("Styles");
		const theme = await (0, import_data.resolveSelect)(import_core_data.store).getCurrentTheme();
		return getPreviewTitle(theme?.name?.rendered ? (0, import_html_entities.decodeEntities)(theme.name.rendered) : void 0);
	},
	stage: isBlockTheme,
	async canvas(context) {
		if (context.search.preview === "stylebook" || !await isBlockTheme()) return null;
		return {
			isPreview: true,
			renderingMode: "template-locked"
		};
	}
};

export { route };