// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// packages/core-actions/build-module/shared/utils.mjs
var import_html_entities = require_html_entities();
var import_i18n = require_i18n();
function getItemTitle(item, fallback = (0, import_i18n.__)("(no title)")) {
	let title = "";
	if (typeof item.title === "string") title = (0, import_html_entities.decodeEntities)(item.title);
	else if (item.title && "rendered" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.rendered);
	else if (item.title && "raw" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.raw);
	return title || fallback;
}

// packages/core-actions/build-module/shared/has-action-link.mjs
/**
* A copy of `hasActionLink()` of `@wordpress/fields`: whether the post's
* `_links` include the given `wp:action-*` relation.
*
* A record without `_links` (a bulk edit form has no record) is treated as
* allowed, so only an explicit absence of the action hides a control.
*
* @param item   The post.
* @param action The link relation, e.g. `wp:action-publish`.
* @return Whether the action link is present.
*/
function hasActionLink(item, action) {
	if (!item._links) return true;
	return !!item._links[action];
}

// \0wp-global:@wordpress/components
var require_components = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.components;
}));

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/notices
var require_notices = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.notices;
}));

// packages/core-actions/build-module/page/refetch-pages.mjs
var import_components = require_components();
var import_data = require_data();
var import_notices = require_notices();
var import_core_data = require_core_data();
/**
* Requests pages again, so their `action-*` REST links follow a change of the
* site settings the links depend on, such as the homepage.
*
* The pages are requested through `getEntityRecords`, whose records replace
* the ones in the store, so every list and editor showing them updates.
*
* @param registry The data registry.
* @param ids      The ids of the pages. Unset ids, such as a `0` setting, are
*                 skipped.
* @return A promise resolving once the pages are stored.
*/
async function refetchPages(registry, ids) {
	const include = [...new Set(ids.filter(Boolean))];
	if (!include.length) return;
	const query = { include };
	registry.dispatch(import_core_data.store).invalidateResolution("getEntityRecords", [
		"postType",
		"page",
		query
	]);
	await registry.resolveSelect(import_core_data.store).getEntityRecords("postType", "page", query);
}

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/core-actions/build-module/page/set-site-page-modal.mjs
var import_jsx_runtime = require_jsx_runtime();
/**
* The modal of the actions assigning a page to a site setting, the homepage
* or the posts page: it asks for confirmation, saves the setting, and
* requests the pages whose action links depend on the setting again.
*/
function SetSitePageModal({ setting, items, closeModal, getText, submitLabel, successNotice, errorNotice }) {
	const [item] = items;
	const { siteSettings, currentPage, isSaving } = (0, import_data.useSelect)((select) => {
		const { getEntityRecord, isSavingEntityRecord } = select(import_core_data.store);
		const settings = getEntityRecord("root", "site");
		const currentId = settings?.[setting];
		return {
			siteSettings: settings,
			currentPage: currentId ? getEntityRecord("postType", "page", currentId) : void 0,
			isSaving: isSavingEntityRecord("root", "site")
		};
	}, [setting]);
	const registry = (0, import_data.useRegistry)();
	const { saveEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
	const { createSuccessNotice, createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
	async function onSubmit(event) {
		event.preventDefault();
		const previousId = siteSettings?.[setting];
		try {
			await saveEntityRecord("root", "site", {
				[setting]: item.id,
				show_on_front: "page"
			}, { throwOnError: true });
		} catch (error) {
			const typedError = error;
			const errorMessage = typedError.message && typedError.code !== "unknown_error" ? typedError.message : errorNotice;
			createErrorNotice(errorMessage, { type: "snackbar" });
			closeModal?.();
			return;
		}
		createSuccessNotice(successNotice, { type: "snackbar" });
		closeModal?.();
		try {
			await refetchPages(registry, [item.id, previousId]);
		} catch {}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		onSubmit,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
			spacing: "5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalText, { children: getText({
				pageTitle: getItemTitle(item, ""),
				currentPage,
				siteSettings
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
				justify: "right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					__next40pxDefaultSize: true,
					variant: "tertiary",
					onClick: () => {
						closeModal?.();
					},
					disabled: isSaving,
					accessibleWhenDisabled: true,
					children: (0, import_i18n.__)("Cancel")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					__next40pxDefaultSize: true,
					variant: "primary",
					type: "submit",
					disabled: isSaving,
					accessibleWhenDisabled: true,
					children: submitLabel
				})]
			})]
		})
	});
}

// packages/core-actions/build-module/page/set-as-homepage/action.mjs
/**
* The question of the modal, with a warning about the current homepage, or
* about the latest posts the site shows instead of one.
*/
const getText$1 = ({ pageTitle, currentPage, siteSettings }) => {
	let warning = "";
	if ("posts" === siteSettings?.show_on_front) warning = (0, import_i18n.__)("This will replace the current homepage which is set to display latest posts.");
	else if (currentPage) warning = (0, import_i18n.sprintf)((0, import_i18n.__)("This will replace the current homepage: \"%s\""), getItemTitle(currentPage, ""));
	return (0, import_i18n.sprintf)((0, import_i18n.__)("Set \"%1$s\" as the site homepage? %2$s"), pageTitle, warning).trim();
};
const setAsHomepage = {
	isEligible(post) {
		return post.status === "publish" && hasActionLink(post, "wp:action-set-homepage");
	},
	RenderModal: ({ items, closeModal }) => {
		const submitLabel = (0, import_i18n.__)("Set homepage");
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetSitePageModal, {
			setting: "page_on_front",
			items,
			closeModal,
			getText: getText$1,
			submitLabel,
			successNotice: (0, import_i18n.__)("Homepage updated."),
			errorNotice: (0, import_i18n.__)("An error occurred while setting the homepage.")
		});
	}
};

// packages/core-actions/build-module/page/set-as-posts-page/action.mjs
/**
* The question of the modal, with a warning about the current posts page, or
* about the latest posts the page will show.
*/
const getText = ({ pageTitle, currentPage }) => (0, import_i18n.sprintf)((0, import_i18n.__)("Set \"%1$s\" as the posts page? %2$s"), pageTitle, currentPage ? (0, import_i18n.sprintf)((0, import_i18n.__)("This will replace the current posts page: \"%s\""), getItemTitle(currentPage, "")) : (0, import_i18n.__)("This page will show the latest posts."));
const setAsPostsPage = {
	isEligible(post) {
		return post.status === "publish" && hasActionLink(post, "wp:action-set-posts-page");
	},
	RenderModal: ({ items, closeModal }) => {
		const submitLabel = (0, import_i18n.__)("Set posts page");
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetSitePageModal, {
			setting: "page_for_posts",
			items,
			closeModal,
			getText,
			submitLabel,
			successNotice: (0, import_i18n.__)("Posts page updated."),
			errorNotice: (0, import_i18n.__)("An error occurred while setting the posts page.")
		});
	}
};

// packages/core-actions/build-module/page/index.mjs
const actions = {
	"set-as-homepage": setAsHomepage,
	"set-as-posts-page": setAsPostsPage
};

export { actions as default };
//# sourceMappingURL=page.js.map