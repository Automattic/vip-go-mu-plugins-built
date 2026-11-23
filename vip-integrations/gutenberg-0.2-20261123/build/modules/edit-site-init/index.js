import { store } from "@wordpress/boot";

// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/primitives
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.primitives;
}));

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/icons/build-module/library/home.mjs
var import_primitives = require_primitives();
var import_jsx_runtime = require_jsx_runtime();
var home_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M13.75 19.25H19.25V8.5L12 5L4.75 8.5V19.25H10.25M13.75 19.25V13.7H10.25V19.25M13.75 19.25H10.25" })
});

// packages/icons/build-module/library/layout.mjs
var layout_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M9.75 19.25H18C18.6904 19.25 19.25 18.6904 19.25 18V9.75M9.75 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V9.75M9.75 19.25V9.75M19.25 9.75V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V9.75M19.25 9.75H9.75M9.75 9.75H4.75" })
});

// packages/icons/build-module/library/navigation.mjs
var navigation_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M9 16L13.5 12.8421L15 8L10.5 11.1579L9 16Z",
		fill: "currentColor",
		stroke: "none"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M4.75 12C4.75 7.99593 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12Z",
		strokeLinejoin: "round"
	})]
});

// packages/icons/build-module/library/page.mjs
var page_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M8.5 8.25H15.5M8.5 11.75H15.5M8.5 15.25H15.5M18.25 18V6C18.25 5.30964 17.6904 4.75 17 4.75H7C6.30964 4.75 5.75 5.30964 5.75 6L5.75 18C5.75 18.6904 6.30964 19.25 7 19.25H17C17.6904 19.25 18.25 18.6904 18.25 18Z" })
});

// packages/icons/build-module/library/site-logo.mjs
var site_logo_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M5.07325 14.1472L8.71429 12L12.5 13.3333L15.75 11C15.75 11 17.934 11.9169 19.2032 12.8281M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z",
		strokeLinejoin: "round"
	})
});

// packages/icons/build-module/library/styles.mjs
var styles_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 4.75C7.99594 4.75 4.75 7.99593 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25L12 4.75Z",
		fill: "currentColor",
		stroke: "none"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25Z",
		strokeLinejoin: "round"
	})]
});

// packages/icons/build-module/library/symbol-filled.mjs
var symbol_filled_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M15.2071 6.20711L20.2929 11.2929C20.6834 11.6834 20.6834 12.3166 20.2929 12.7071L15.2071 17.7929C14.8166 18.1834 14.1834 18.1834 13.7929 17.7929L8.70711 12.7071C8.31658 12.3166 8.31658 11.6834 8.70711 11.2929L13.7929 6.20711C14.1834 5.81658 14.8166 5.81658 15.2071 6.20711Z",
		fill: "currentColor"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M9.5 5.5L3.70711 11.2929C3.31658 11.6834 3.31658 12.3166 3.70711 12.7071L9.5 18.5" })]
});

// packages/icons/build-module/library/symbol.mjs
var symbol_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M15.2071 6.20711L20.2929 11.2929C20.6834 11.6834 20.6834 12.3166 20.2929 12.7071L15.2071 17.7929C14.8166 18.1834 14.1834 18.1834 13.7929 17.7929L8.70711 12.7071C8.31658 12.3166 8.31658 11.6834 8.70711 11.2929L13.7929 6.20711C14.1834 5.81658 14.8166 5.81658 15.2071 6.20711Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M9.5 5.5L3.70711 11.2929C3.31658 11.6834 3.31658 12.3166 3.70711 12.7071L9.5 18.5" })]
});

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/preferences
var require_preferences = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.preferences;
}));

// packages/edit-site-init/build-module/index.mjs
var import_data = require_data();
var import_preferences = require_preferences();
/**
* Initialize edit-site menu items with icons.
* This function is mandatory - all init modules must export 'init'.
*/
async function init() {
	Object.entries({
		home: { icon: home_default },
		identity: { icon: site_logo_default },
		styles: { icon: styles_default },
		navigation: { icon: navigation_default },
		pages: { icon: page_default },
		templateParts: { icon: symbol_filled_default },
		patterns: { icon: symbol_default },
		templates: { icon: layout_default }
	}).forEach(([id, { icon }]) => {
		(0, import_data.dispatch)(store).updateMenuItem(id, { icon });
	});
	const entityLinks = {
		default: {
			list: "/types/{type}",
			edit: "/types/{type}/edit/{id}"
		},
		wp_template: { list: "/templates" },
		wp_template_part: { list: "/template-parts" },
		wp_block: { list: "/patterns" },
		wp_navigation: { list: "/navigation" }
	};
	Object.entries(entityLinks).forEach(([postType, links]) => {
		(0, import_data.dispatch)(store).registerEntityLinks(postType, {
			...entityLinks.default,
			...links
		});
	});
	(0, import_data.dispatch)(import_preferences.store).setDefaults("core", {
		allowRightClickOverrides: true,
		enableChoosePatternModal: true,
		showBlockBreadcrumbs: true
	});
}

export { init };
//# sourceMappingURL=index.js.map