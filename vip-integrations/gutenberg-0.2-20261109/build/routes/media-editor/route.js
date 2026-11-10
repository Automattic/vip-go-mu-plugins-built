import { notFound } from "@wordpress/route";

// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/editor
var require_editor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.editor;
}));

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// routes/lock-unlock/index.ts
var import_core_data = require_core_data();
var import_data = require_data();
var import_html_entities = require_html_entities();
var import_i18n = require_i18n();
var import_editor = require_editor();
var import_private_apis = require_private_apis();
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/routes");

// routes/media-editor/route.ts
/**
* The stage only renders a form, so it requests the `form` of the entity view
* configuration alone. Must match the fields the stage requests, so both
* resolve under the same cache key.
*/
const VIEW_CONFIG_FIELDS = "form";
function getAttachmentId(id) {
	const attachmentId = parseInt(id, 10);
	if (Number.isNaN(attachmentId) || attachmentId <= 0) throw notFound();
	return attachmentId;
}
function getAttachmentTitle(attachment) {
	const title = typeof attachment.title === "string" ? attachment.title : attachment.title?.rendered || attachment.title?.raw;
	return title ? (0, import_html_entities.decodeEntities)(title) : (0, import_i18n.__)("Edit media");
}
/**
* Route configuration for the dedicated media editor screen.
*/
const route = {
	beforeLoad: async ({ params }) => {
		if (!window?.__experimentalMediaEditor) throw notFound();
		const attachmentId = getAttachmentId(params.id);
		try {
			if (!await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("postType", "attachment", attachmentId)) throw notFound();
		} catch {
			throw notFound();
		}
	},
	loader: async () => {
		await Promise.all([unlock((0, import_data.resolveSelect)(import_editor.store)).getEntityFields("postType", "attachment").catch(() => {}), unlock((0, import_data.resolveSelect)(import_core_data.store)).getViewConfig("postType", "attachment", { fields: VIEW_CONFIG_FIELDS }).catch(() => {})]);
	},
	title: async ({ params }) => {
		const attachmentId = getAttachmentId(params.id);
		const attachment = await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("postType", "attachment", attachmentId);
		return attachment ? getAttachmentTitle(attachment) : (0, import_i18n.__)("Edit media");
	}
};

export { route };