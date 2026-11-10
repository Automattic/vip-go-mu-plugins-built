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

// routes/post-edit/route.ts
var import_data = require_data();
var import_core_data = require_core_data();
var import_html_entities = require_html_entities();
var import_i18n = require_i18n();
const TEMPLATE_POST_TYPES = ["wp_template", "wp_template_part"];
function getPostId(params) {
	const id = params["*"];
	if (!id) throw notFound();
	try {
		return decodeURIComponent(id);
	} catch {
		return id;
	}
}
/**
* Route configuration for post edit.
*/
const route = {
	beforeLoad: async ({ params }) => {
		const postId = getPostId(params);
		if (!TEMPLATE_POST_TYPES.includes(params.type) && !/^\d+$/.test(postId)) throw notFound();
		try {
			const [postType, post] = await Promise.all([(0, import_data.resolveSelect)(import_core_data.store).getPostType(params.type), (0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("postType", params.type, postId)]);
			if (!postType || !post) throw notFound();
		} catch {
			throw notFound();
		}
	},
	title: async ({ params }) => {
		const postId = getPostId(params);
		const post = await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("postType", params.type, postId);
		if (post?.title?.rendered) return (0, import_html_entities.decodeEntities)(post.title.rendered);
		if (post?.title?.raw) return post.title.raw;
		return (await (0, import_data.resolveSelect)(import_core_data.store).getPostType(params.type))?.labels?.edit_item || (0, import_i18n.__)("Edit");
	},
	async canvas(context) {
		const { params } = context;
		const postId = getPostId(params);
		return {
			postType: params.type,
			postId
		};
	},
	async loader(context) {
		const { params, search } = context;
		if (search.selectedBlock) (0, import_data.dispatch)(import_core_data.store).editEntityRecord("postType", params.type, getPostId(params), { selection: {
			selectionStart: { clientId: search.selectedBlock },
			selectionEnd: { clientId: search.selectedBlock }
		} }, { undoIgnore: true });
	}
};

export { route };