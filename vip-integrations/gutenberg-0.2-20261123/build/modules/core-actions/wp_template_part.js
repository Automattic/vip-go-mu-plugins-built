// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/notices
var require_notices = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.notices;
}));

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// \0wp-global:@wordpress/blocks
var require_blocks = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blocks;
}));

// \0wp-global:@wordpress/patterns
var require_patterns = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.patterns;
}));

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/core-actions/build-module/lock-unlock.mjs
var import_data = require_data();
var import_i18n = require_i18n();
var import_notices = require_notices();
var import_element = require_element();
var import_blocks = require_blocks();
var import_patterns = require_patterns();
var import_private_apis = require_private_apis();
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/core-actions");

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// packages/core-actions/build-module/shared/utils.mjs
var import_html_entities = require_html_entities();
function getItemTitle(item, fallback = (0, import_i18n.__)("(no title)")) {
	let title = "";
	if (typeof item.title === "string") title = (0, import_html_entities.decodeEntities)(item.title);
	else if (item.title && "rendered" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.rendered);
	else if (item.title && "raw" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.raw);
	return title || fallback;
}

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/core-actions/build-module/wp_template_part/duplicate-template-part/action.mjs
var import_jsx_runtime = require_jsx_runtime();
const { CreateTemplatePartModalContents } = unlock(import_patterns.privateApis);
/**
* This action is used to duplicate a template part.
*/
const duplicateTemplatePart = {
	isEligible: (item) => item.type === "wp_template_part",
	RenderModal: ({ items, closeModal }) => {
		const [item] = items;
		const blocks = (0, import_element.useMemo)(() => {
			return item.blocks ?? (0, import_blocks.parse)(typeof item.content === "string" ? item.content : item.content.raw, { __unstableSkipMigrationLogs: true });
		}, [item.content, item.blocks]);
		const { createSuccessNotice } = (0, import_data.useDispatch)(import_notices.store);
		function onTemplatePartSuccess(templatePart) {
			createSuccessNotice((0, import_i18n.sprintf)((0, import_i18n._x)("\"%s\" duplicated.", "template part"), getItemTitle(templatePart)), {
				type: "snackbar",
				id: "edit-site-patterns-success"
			});
			closeModal?.();
		}
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTemplatePartModalContents, {
			blocks,
			defaultArea: item.area,
			defaultTitle: (0, import_i18n.sprintf)((0, import_i18n._x)("%s (Copy)", "template part"), getItemTitle(item)),
			onCreate: onTemplatePartSuccess,
			onError: closeModal,
			confirmLabel: (0, import_i18n._x)("Duplicate", "action label"),
			closeModal: closeModal ?? (() => {})
		});
	}
};

// packages/core-actions/build-module/wp_template_part/index.mjs
const actions = { "duplicate-template-part": duplicateTemplatePart };

export { actions as default };
//# sourceMappingURL=wp_template_part.js.map