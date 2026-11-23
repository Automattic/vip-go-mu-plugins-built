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

// routes/post-new/route.ts
var import_data = require_data();
var import_core_data = require_core_data();
/**
* Route configuration for creating a new post.
*/
const route = {
	title: async ({ params }) => {
		const postType = await (0, import_data.resolveSelect)(import_core_data.store).getPostType(params.type);
		return postType?.labels?.add_new_item || postType?.labels?.add_new;
	},
	async canvas(context) {
		const { params } = context;
		const newPost = await (0, import_data.dispatch)(import_core_data.store).saveEntityRecord("postType", params.type, {
			title: "Auto Draft",
			content: "",
			status: "auto-draft"
		});
		return {
			postType: params.type,
			postId: String(newPost.id)
		};
	}
};

export { route };