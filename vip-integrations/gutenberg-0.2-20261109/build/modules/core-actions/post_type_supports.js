// \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
		}
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// \0wp-global:@wordpress/primitives
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.primitives;
}));

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/icons/build-module/library/backup.mjs
var import_primitives = require_primitives();
var import_jsx_runtime = require_jsx_runtime();
var backup_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M7.59201 17.7565C8.8135 18.6933 10.3417 19.25 12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99593 4.75 12L4.75 14M14.75 14.75L12.25 12.25L12.25 8M2 12L4.75 14L7.5 12" })
});

// packages/icons/build-module/library/external.mjs
var external_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M9.5 6.25H6.5C5.80964 6.25 5.25 6.80964 5.25 7.5V17.5C5.25 18.1904 5.80964 18.75 6.5 18.75H16.5C17.1904 18.75 17.75 18.1904 17.75 17.5V14.5M11.5 12.5L18.75 5.25M12.5 5.25H18.75V11.5" })
});

// packages/icons/build-module/library/trash.mjs
var trash_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M5 7.5H7M19 7.5H17M17 7.5L16.1588 17.1733C16.069 18.2068 15.2038 19 14.1664 19H9.83363C8.79622 19 7.93102 18.2068 7.84115 17.1733L7 7.5M17 7.5H14.9897M7 7.5H9.01027M14.9897 7.5C14.8627 5.96012 13.5727 4.75 12 4.75C10.4273 4.75 9.13731 5.96012 9.01027 7.5M14.9897 7.5H9.01027" })
});

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/components
var require_components = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.components;
}));

// \0wp-global:@wordpress/patterns
var require_patterns = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.patterns;
}));

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// packages/core-actions/build-module/shared/utils.mjs
var import_element = require_element();
var import_components = require_components();
var import_patterns = require_patterns();
var import_html_entities = require_html_entities();
var import_i18n = require_i18n();
function isTemplate(post) {
	return post.type === "wp_template";
}
function isTemplatePart(post) {
	return post.type === "wp_template_part";
}
function isTemplateOrTemplatePart(p) {
	return p.type === "wp_template" || p.type === "wp_template_part";
}
function getItemTitle(item, fallback = (0, import_i18n.__)("(no title)")) {
	let title = "";
	if (typeof item.title === "string") title = (0, import_html_entities.decodeEntities)(item.title);
	else if (item.title && "rendered" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.rendered);
	else if (item.title && "raw" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.raw);
	return title || fallback;
}
/**
* Check if a template is removable.
*
* @param template The template entity to check.
* @return Whether the template is removable.
*/
function isTemplateRemovable(template) {
	if (!template) return false;
	return [template.source, template.source].includes("custom") && !Boolean(template.type === "wp_template" && template?.plugin) && !template.has_theme_file;
}

// \0wp-global:@wordpress/notices
var require_notices = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.notices;
}));

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// packages/core-actions/build-module/post_type_supports/delete-post/delete-post-with-notices.mjs
var import_notices = require_notices();
var import_core_data = require_core_data();
var import_data = require_data();
function getErrorMessagesFromPromises(allSettledResults) {
	const errorMessages = /* @__PURE__ */ new Set();
	if (allSettledResults.length === 1) {
		const typedError = allSettledResults[0];
		if (typedError.reason?.message) errorMessages.add(typedError.reason.message);
	} else {
		const failedPromises = allSettledResults.filter(({ status }) => status === "rejected");
		for (const failedPromise of failedPromises) {
			const typedError = failedPromise;
			if (typedError.reason?.message) errorMessages.add(typedError.reason.message);
		}
	}
	return errorMessages;
}
/**
* Deletes the posts permanently, then shows a notice with the outcome.
*
* @param posts                       The posts to delete.
* @param notice                      The messages of the notices.
* @param callbacks                   The callbacks.
* @param callbacks.onActionPerformed Called once the posts are deleted.
* @param callbacks.onActionError     Called when a post is not deleted.
*/
const deletePostWithNotices = async (posts, notice, callbacks) => {
	const { createSuccessNotice, createErrorNotice } = (0, import_data.dispatch)(import_notices.store);
	const { deleteEntityRecord } = (0, import_data.dispatch)(import_core_data.store);
	const allSettledResults = await Promise.allSettled(posts.map((post) => {
		return deleteEntityRecord("postType", post.type, post.id, { force: true }, { throwOnError: true });
	}));
	if (allSettledResults.every(({ status }) => status === "fulfilled")) {
		let successMessage;
		if (allSettledResults.length === 1) successMessage = notice.success.messages.getMessage(posts[0]);
		else successMessage = notice.success.messages.getBatchMessage(posts);
		createSuccessNotice(successMessage, {
			type: notice.success.type ?? "snackbar",
			id: notice.success.id
		});
		callbacks.onActionPerformed?.(posts);
	} else {
		const errorMessages = getErrorMessagesFromPromises(allSettledResults);
		let errorMessage = "";
		if (allSettledResults.length === 1) errorMessage = notice.error.messages.getMessage(errorMessages);
		else errorMessage = notice.error.messages.getBatchMessage(errorMessages);
		createErrorNotice(errorMessage, {
			type: notice.error.type ?? "snackbar",
			id: notice.error.id
		});
		callbacks.onActionError?.();
	}
};

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/core-actions/build-module/lock-unlock.mjs
var import_private_apis = require_private_apis();
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/core-actions");

// packages/core-actions/build-module/post_type_supports/delete-post/action.mjs
const { PATTERN_TYPES: PATTERN_TYPES$1 } = unlock(import_patterns.privateApis);
const deletePost = {
	icon: trash_default,
	isEligible(post) {
		if (isTemplateOrTemplatePart(post)) return isTemplateRemovable(post);
		return post.type === PATTERN_TYPES$1.user;
	},
	RenderModal: ({ items, closeModal, onActionPerformed }) => {
		const [isBusy, setIsBusy] = (0, import_element.useState)(false);
		const isResetting = items.every((item) => isTemplateOrTemplatePart(item) && item?.has_theme_file);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
			spacing: "5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalText, { children: items.length > 1 ? (0, import_i18n.sprintf)((0, import_i18n._n)("Delete %d item?", "Delete %d items?", items.length), items.length) : (0, import_i18n.sprintf)((0, import_i18n._x)("Delete \"%s\"?", "template part"), getItemTitle(items[0])) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
				justify: "right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					variant: "tertiary",
					onClick: closeModal,
					disabled: isBusy,
					accessibleWhenDisabled: true,
					__next40pxDefaultSize: true,
					children: (0, import_i18n.__)("Cancel")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					variant: "primary",
					onClick: async () => {
						setIsBusy(true);
						await deletePostWithNotices(items, {
							success: { messages: {
								getMessage: (item) => {
									return isResetting ? (0, import_i18n.sprintf)((0, import_i18n.__)("\"%s\" reset."), (0, import_html_entities.decodeEntities)(getItemTitle(item))) : (0, import_i18n.sprintf)((0, import_i18n._x)("\"%s\" deleted.", "template part"), (0, import_html_entities.decodeEntities)(getItemTitle(item)));
								},
								getBatchMessage: () => {
									return isResetting ? (0, import_i18n.__)("Items reset.") : (0, import_i18n.__)("Items deleted.");
								}
							} },
							error: { messages: {
								getMessage: (error) => {
									if (error.size === 1) return [...error][0];
									return isResetting ? (0, import_i18n.__)("An error occurred while reverting the item.") : (0, import_i18n.__)("An error occurred while deleting the item.");
								},
								getBatchMessage: (errors) => {
									if (errors.size === 0) return isResetting ? (0, import_i18n.__)("An error occurred while reverting the items.") : (0, import_i18n.__)("An error occurred while deleting the items.");
									if (errors.size === 1) return isResetting ? (0, import_i18n.sprintf)((0, import_i18n.__)("An error occurred while reverting the items: %s"), [...errors][0]) : (0, import_i18n.sprintf)((0, import_i18n.__)("An error occurred while deleting the items: %s"), [...errors][0]);
									return isResetting ? (0, import_i18n.sprintf)((0, import_i18n.__)("Some errors occurred while reverting the items: %s"), [...errors].join(",")) : (0, import_i18n.sprintf)((0, import_i18n.__)("Some errors occurred while deleting the items: %s"), [...errors].join(","));
								}
							} }
						}, { onActionPerformed });
						setIsBusy(false);
						closeModal?.();
					},
					isBusy,
					disabled: isBusy,
					accessibleWhenDisabled: true,
					__next40pxDefaultSize: true,
					children: (0, import_i18n.__)("Delete")
				})]
			})]
		});
	}
};

// packages/core-actions/build-module/post_type_supports/duplicate-post/action.mjs
const duplicatePost = {
	isEligible({ status }) {
		return status !== "trash";
	},
	RenderModal: ({ items, closeModal, onActionPerformed }) => {
		const [item, setItem] = (0, import_element.useState)({
			...items[0],
			title: (0, import_i18n.sprintf)((0, import_i18n._x)("%s (Copy)", "post"), getItemTitle(items[0]))
		});
		const [isCreatingPage, setIsCreatingPage] = (0, import_element.useState)(false);
		const { saveEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
		const { createSuccessNotice, createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
		async function createPage(event) {
			event.preventDefault();
			if (isCreatingPage) return;
			const newItemObject = {
				status: "draft",
				title: item.title,
				slug: item.title || (0, import_i18n.__)("No title"),
				comment_status: item.comment_status,
				content: typeof item.content === "string" ? item.content : item.content.raw,
				excerpt: typeof item.excerpt === "string" ? item.excerpt : item.excerpt?.raw,
				meta: item.meta,
				parent: item.parent,
				password: item.password,
				template: item.template,
				format: item.format,
				featured_media: item.featured_media,
				menu_order: item.menu_order,
				ping_status: item.ping_status
			};
			const assignablePropertiesPrefix = "wp:action-assign-";
			Object.keys(item?._links || {}).filter((property) => property.startsWith(assignablePropertiesPrefix)).map((property) => property.slice(17)).forEach((property) => {
				if (item.hasOwnProperty(property)) newItemObject[property] = item[property];
			});
			setIsCreatingPage(true);
			try {
				const newItem = await saveEntityRecord("postType", item.type, newItemObject, { throwOnError: true });
				createSuccessNotice((0, import_i18n.sprintf)((0, import_i18n.__)("\"%s\" successfully created."), getItemTitle(newItem)), {
					id: "duplicate-post-action",
					type: "snackbar"
				});
				if (onActionPerformed) onActionPerformed([newItem]);
			} catch (error) {
				const typedError = error;
				const errorMessage = typedError.message && typedError.code !== "unknown_error" ? typedError.message : (0, import_i18n.__)("An error occurred while duplicating the page.");
				createErrorNotice(errorMessage, { type: "snackbar" });
			} finally {
				setIsCreatingPage(false);
				closeModal?.();
			}
		}
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: createPage,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
				spacing: 3,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalInputControl, {
					label: (0, import_i18n.__)("Title"),
					placeholder: (0, import_i18n.__)("No title"),
					value: getItemTitle(item),
					onChange: (value) => setItem((prev) => ({
						...prev,
						title: value || (0, import_i18n.__)("No title")
					}))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
					spacing: 2,
					justify: "end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
						variant: "tertiary",
						onClick: closeModal,
						__next40pxDefaultSize: true,
						children: (0, import_i18n.__)("Cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
						variant: "primary",
						type: "submit",
						isBusy: isCreatingPage,
						"aria-disabled": isCreatingPage,
						__next40pxDefaultSize: true,
						children: (0, import_i18n._x)("Duplicate", "action label")
					})]
				})]
			})
		});
	}
};

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

// packages/core-actions/build-module/post_type_supports/move-to-trash/action.mjs
const trashPost = {
	icon: trash_default,
	isEligible(item) {
		if (item.type === "wp_template_part" || item.type === "wp_block") return false;
		if (item.type === "wp_template" && typeof item.id === "string") return false;
		return !!item.status && !["auto-draft", "trash"].includes(item.status) && item.permissions?.delete && hasActionLink(item, "wp:action-trash");
	},
	RenderModal: ({ items, closeModal, onActionPerformed }) => {
		const [isBusy, setIsBusy] = (0, import_element.useState)(false);
		const { createSuccessNotice, createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
		const { deleteEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
			spacing: "5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalText, { children: items.length === 1 ? (0, import_i18n.sprintf)((0, import_i18n.__)("Are you sure you want to move \"%s\" to the trash?"), getItemTitle(items[0])) : (0, import_i18n.sprintf)((0, import_i18n._n)("Are you sure you want to move %d item to the trash ?", "Are you sure you want to move %d items to the trash ?", items.length), items.length) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
				justify: "right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					__next40pxDefaultSize: true,
					variant: "tertiary",
					onClick: closeModal,
					disabled: isBusy,
					accessibleWhenDisabled: true,
					children: (0, import_i18n.__)("Cancel")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					__next40pxDefaultSize: true,
					variant: "primary",
					onClick: async () => {
						setIsBusy(true);
						const promiseResult = await Promise.allSettled(items.map((item) => deleteEntityRecord("postType", item.type, item.id.toString(), {}, { throwOnError: true })));
						if (promiseResult.every(({ status }) => status === "fulfilled")) {
							let successMessage;
							if (promiseResult.length === 1) successMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("\"%s\" moved to the trash."), getItemTitle(items[0]));
							else successMessage = (0, import_i18n.sprintf)((0, import_i18n._n)("%d item moved to the trash.", "%d items moved to the trash.", items.length), items.length);
							createSuccessNotice(successMessage, {
								type: "snackbar",
								id: "move-to-trash-action"
							});
						} else {
							let errorMessage;
							if (promiseResult.length === 1) {
								const typedError = promiseResult[0];
								if (typedError.reason?.message) errorMessage = typedError.reason.message;
								else errorMessage = (0, import_i18n.__)("An error occurred while moving the item to the trash.");
							} else {
								const errorMessages = /* @__PURE__ */ new Set();
								const failedPromises = promiseResult.filter(({ status }) => status === "rejected");
								for (const failedPromise of failedPromises) {
									const typedError = failedPromise;
									if (typedError.reason?.message) errorMessages.add(typedError.reason.message);
								}
								if (errorMessages.size === 0) errorMessage = (0, import_i18n.__)("An error occurred while moving the items to the trash.");
								else if (errorMessages.size === 1) errorMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("An error occurred while moving the item to the trash: %s"), [...errorMessages][0]);
								else errorMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("Some errors occurred while moving the items to the trash: %s"), [...errorMessages].join(","));
							}
							createErrorNotice(errorMessage, { type: "snackbar" });
						}
						if (onActionPerformed) onActionPerformed(items);
						setIsBusy(false);
						closeModal?.();
					},
					isBusy,
					disabled: isBusy,
					accessibleWhenDisabled: true,
					children: (0, import_i18n._x)("Trash", "verb")
				})]
			})]
		});
	}
};

// packages/core-actions/build-module/post_type_supports/order-pages/action.mjs
function isItemValid(item) {
	return typeof item.menu_order === "number" && Number.isInteger(item.menu_order);
}
function ReorderModal({ items, closeModal, onActionPerformed }) {
	const [item, setItem] = (0, import_element.useState)(items[0]);
	const { editEntityRecord, saveEditedEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
	const { createSuccessNotice, createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
	const isValid = isItemValid(item);
	async function onOrder(event) {
		event.preventDefault();
		if (!isValid) return;
		try {
			await editEntityRecord("postType", item.type, item.id, { menu_order: item.menu_order });
			closeModal?.();
			await saveEditedEntityRecord("postType", item.type, item.id, { throwOnError: true });
			createSuccessNotice((0, import_i18n.__)("Order updated."), { type: "snackbar" });
			onActionPerformed?.(items);
		} catch (error) {
			const typedError = error;
			const errorMessage = typedError.message && typedError.code !== "unknown_error" ? typedError.message : (0, import_i18n.__)("An error occurred while updating the order");
			createErrorNotice(errorMessage, { type: "snackbar" });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		onSubmit: onOrder,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
			spacing: "5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: (0, import_i18n.__)("Determines the order of pages. Pages with the same order value are sorted alphabetically. Negative order values are supported.") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalInputControl, {
					label: (0, import_i18n.__)("Order"),
					type: "number",
					value: typeof item.menu_order === "number" && Number.isInteger(item.menu_order) ? String(item.menu_order) : "",
					onChange: (value) => {
						const parsed = parseInt(value, 10);
						setItem({
							...item,
							menu_order: isNaN(parsed) ? void 0 : parsed
						});
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
					justify: "right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
						__next40pxDefaultSize: true,
						variant: "tertiary",
						onClick: () => {
							closeModal?.();
						},
						children: (0, import_i18n.__)("Cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
						__next40pxDefaultSize: true,
						variant: "primary",
						type: "submit",
						accessibleWhenDisabled: true,
						disabled: !isValid,
						children: (0, import_i18n.__)("Save")
					})]
				})
			]
		})
	});
}
const reorderPage = {
	isEligible({ status }) {
		return status !== "trash";
	},
	RenderModal: ReorderModal
};

// packages/core-actions/build-module/post_type_supports/permanently-delete/action.mjs
const permanentlyDeletePost = {
	icon: trash_default,
	isEligible(item) {
		if (isTemplateOrTemplatePart(item) || item.type === "wp_block") return false;
		const { status, permissions } = item;
		if (!status || status === "auto-draft" || !permissions?.delete) return false;
		return status === "trash" || !hasActionLink(item, "wp:action-trash");
	},
	RenderModal: ({ items, closeModal, onActionPerformed }) => {
		const [isBusy, setIsBusy] = (0, import_element.useState)(false);
		const { createSuccessNotice, createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
		const { deleteEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
			spacing: "5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalText, { children: items.length > 1 ? (0, import_i18n.sprintf)((0, import_i18n._n)("Are you sure you want to permanently delete %d item?", "Are you sure you want to permanently delete %d items?", items.length), items.length) : (0, import_i18n.sprintf)((0, import_i18n.__)("Are you sure you want to permanently delete \"%s\"?"), (0, import_html_entities.decodeEntities)(getItemTitle(items[0]))) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
				justify: "right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					variant: "tertiary",
					onClick: closeModal,
					disabled: isBusy,
					accessibleWhenDisabled: true,
					__next40pxDefaultSize: true,
					children: (0, import_i18n.__)("Cancel")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					variant: "primary",
					onClick: async () => {
						setIsBusy(true);
						const promiseResult = await Promise.allSettled(items.map((post) => deleteEntityRecord("postType", post.type, post.id, { force: true }, { throwOnError: true })));
						if (promiseResult.every(({ status }) => status === "fulfilled")) {
							let successMessage;
							if (promiseResult.length === 1) successMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("\"%s\" permanently deleted."), getItemTitle(items[0]));
							else successMessage = (0, import_i18n.__)("The items were permanently deleted.");
							createSuccessNotice(successMessage, {
								type: "snackbar",
								id: "permanently-delete-post-action"
							});
							onActionPerformed?.(items);
						} else {
							let errorMessage;
							if (promiseResult.length === 1) {
								const typedError = promiseResult[0];
								if (typedError.reason?.message) errorMessage = typedError.reason.message;
								else errorMessage = (0, import_i18n.__)("An error occurred while permanently deleting the item.");
							} else {
								const errorMessages = /* @__PURE__ */ new Set();
								const failedPromises = promiseResult.filter(({ status }) => status === "rejected");
								for (const failedPromise of failedPromises) {
									const typedError = failedPromise;
									if (typedError.reason?.message) errorMessages.add(typedError.reason.message);
								}
								if (errorMessages.size === 0) errorMessage = (0, import_i18n.__)("An error occurred while permanently deleting the items.");
								else if (errorMessages.size === 1) errorMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("An error occurred while permanently deleting the items: %s"), [...errorMessages][0]);
								else errorMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("Some errors occurred while permanently deleting the items: %s"), [...errorMessages].join(","));
							}
							createErrorNotice(errorMessage, { type: "snackbar" });
						}
						setIsBusy(false);
						closeModal?.();
					},
					isBusy,
					disabled: isBusy,
					accessibleWhenDisabled: true,
					__next40pxDefaultSize: true,
					children: (0, import_i18n.__)("Delete permanently")
				})]
			})]
		});
	}
};

// packages/core-actions/build-module/post_type_supports/rename-post/action.mjs
const { PATTERN_TYPES } = unlock(import_patterns.privateApis);
const renamePost = {
	isEligible(post) {
		if (post.status === "trash") return false;
		if (!["wp_template", "wp_template_part"].includes(post.type)) return post.permissions?.update;
		if (isTemplate(post)) return isTemplateRemovable(post) && post.is_custom && post.permissions?.update;
		if (isTemplatePart(post)) return post.source === "custom" && !post?.has_theme_file && post.permissions?.update;
		return post.type === PATTERN_TYPES.user && post.permissions?.update;
	},
	RenderModal: ({ items, closeModal, onActionPerformed }) => {
		const [item] = items;
		const [title, setTitle] = (0, import_element.useState)(() => getItemTitle(item, ""));
		const { editEntityRecord, saveEditedEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
		const { createSuccessNotice, createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
		async function onRename(event) {
			event.preventDefault();
			try {
				await editEntityRecord("postType", item.type, item.id, { title });
				setTitle("");
				closeModal?.();
				await saveEditedEntityRecord("postType", item.type, item.id, { throwOnError: true });
				createSuccessNotice((0, import_i18n.__)("Name updated"), { type: "snackbar" });
				onActionPerformed?.(items);
			} catch (error) {
				const typedError = error;
				const errorMessage = typedError.message && typedError.code !== "unknown_error" ? typedError.message : (0, import_i18n.__)("An error occurred while updating the name");
				createErrorNotice(errorMessage, { type: "snackbar" });
			}
		}
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: onRename,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
				spacing: "5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.TextControl, {
					label: (0, import_i18n.__)("Name"),
					value: title,
					onChange: setTitle,
					required: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
					justify: "right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
						__next40pxDefaultSize: true,
						variant: "tertiary",
						onClick: () => {
							closeModal?.();
						},
						children: (0, import_i18n.__)("Cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
						__next40pxDefaultSize: true,
						variant: "primary",
						type: "submit",
						children: (0, import_i18n.__)("Save")
					})]
				})]
			})
		});
	}
};

// \0wp-global:@wordpress/blocks
var require_blocks = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blocks;
}));

// \0wp-global:@wordpress/url
var require_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.url;
}));

// \0wp-global:@wordpress/api-fetch
var require_api_fetch = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.apiFetch;
}));

// packages/core-actions/build-module/post_type_supports/reset-post/action.mjs
var import_blocks = require_blocks();
var import_url = require_url();
var import_api_fetch = /* @__PURE__ */ __toESM(require_api_fetch(), 1);
const isTemplateRevertable = (templateOrTemplatePart) => {
	if (!templateOrTemplatePart) return false;
	return templateOrTemplatePart.source === "custom" && (Boolean(templateOrTemplatePart?.plugin) || templateOrTemplatePart?.has_theme_file);
};
/**
*  Copied - pasted from https://github.com/WordPress/gutenberg/blob/bf1462ad37d4637ebbf63270b9c244b23c69e2a8/packages/editor/src/store/private-actions.js#L233-L365
*
* @param {Object}  template            The template to revert.
* @param {Object}  [options]
* @param {boolean} [options.allowUndo] Whether to allow the user to undo
*                                      reverting the template. Default true.
*/
const revertTemplate = async (template, { allowUndo = true } = {}) => {
	const noticeId = "edit-site-template-reverted";
	(0, import_data.dispatch)(import_notices.store).removeNotice(noticeId);
	if (!isTemplateRevertable(template)) {
		(0, import_data.dispatch)(import_notices.store).createErrorNotice((0, import_i18n.__)("This template is not revertable."), { type: "snackbar" });
		return;
	}
	try {
		const templateEntityConfig = (0, import_data.select)(import_core_data.store).getEntityConfig("postType", template.type);
		if (!templateEntityConfig) {
			(0, import_data.dispatch)(import_notices.store).createErrorNotice((0, import_i18n.__)("The editor has encountered an unexpected error. Please reload."), { type: "snackbar" });
			return;
		}
		const fileTemplatePath = (0, import_url.addQueryArgs)(`${templateEntityConfig.baseURL}/${template.id}`, {
			context: "edit",
			source: template.origin
		});
		const fileTemplate = await (0, import_api_fetch.default)({ path: fileTemplatePath });
		if (!fileTemplate) {
			(0, import_data.dispatch)(import_notices.store).createErrorNotice((0, import_i18n.__)("The editor has encountered an unexpected error. Please reload."), { type: "snackbar" });
			return;
		}
		const serializeBlocks = ({ blocks: blocksForSerialization = [] }) => (0, import_blocks.__unstableSerializeAndClean)(blocksForSerialization);
		const edited = (0, import_data.select)(import_core_data.store).getEditedEntityRecord("postType", template.type, template.id);
		(0, import_data.dispatch)(import_core_data.store).editEntityRecord("postType", template.type, template.id, {
			content: serializeBlocks,
			blocks: edited.blocks,
			source: "custom"
		}, { undoIgnore: true });
		const blocks = (0, import_blocks.parse)(fileTemplate?.content?.raw);
		(0, import_data.dispatch)(import_core_data.store).editEntityRecord("postType", template.type, fileTemplate.id, {
			content: serializeBlocks,
			blocks,
			source: "theme"
		});
		if (allowUndo) {
			const undoRevert = () => {
				(0, import_data.dispatch)(import_core_data.store).editEntityRecord("postType", template.type, edited.id, {
					content: serializeBlocks,
					blocks: edited.blocks,
					source: "custom"
				});
			};
			(0, import_data.dispatch)(import_notices.store).createSuccessNotice((0, import_i18n.__)("Template reset."), {
				type: "snackbar",
				id: noticeId,
				actions: [{
					label: (0, import_i18n.__)("Undo"),
					onClick: undoRevert
				}]
			});
		}
	} catch (error) {
		const errorMessage = error.message && error.code !== "unknown_error" ? error.message : (0, import_i18n.__)("Template revert failed. Please reload.");
		(0, import_data.dispatch)(import_notices.store).createErrorNotice(errorMessage, { type: "snackbar" });
	}
};
const resetPostAction = {
	isEligible: (item) => {
		return isTemplateOrTemplatePart(item) && item?.source === "custom" && (Boolean(item.type === "wp_template" && item?.plugin) || item?.has_theme_file);
	},
	icon: backup_default,
	RenderModal: ({ items, closeModal, onActionPerformed }) => {
		const [isBusy, setIsBusy] = (0, import_element.useState)(false);
		const { saveEditedEntityRecord } = (0, import_data.useDispatch)(import_core_data.store);
		const { createSuccessNotice, createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
		const onConfirm = async () => {
			try {
				for (const template of items) {
					await revertTemplate(template, { allowUndo: false });
					await saveEditedEntityRecord("postType", template.type, template.id);
				}
				createSuccessNotice(items.length > 1 ? (0, import_i18n.sprintf)((0, import_i18n.__)("%d items reset."), items.length) : (0, import_i18n.sprintf)((0, import_i18n.__)("\"%s\" reset."), getItemTitle(items[0])), {
					type: "snackbar",
					id: "revert-template-action"
				});
			} catch (error) {
				let fallbackErrorMessage;
				if (items[0].type === "wp_template") fallbackErrorMessage = items.length === 1 ? (0, import_i18n.__)("An error occurred while reverting the template.") : (0, import_i18n.__)("An error occurred while reverting the templates.");
				else fallbackErrorMessage = items.length === 1 ? (0, import_i18n.__)("An error occurred while reverting the template part.") : (0, import_i18n.__)("An error occurred while reverting the template parts.");
				const typedError = error;
				const errorMessage = typedError.message && typedError.code !== "unknown_error" ? typedError.message : fallbackErrorMessage;
				createErrorNotice(errorMessage, { type: "snackbar" });
			}
		};
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
			spacing: "5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalText, { children: (0, import_i18n.__)("Reset to default and clear all customizations?") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
				justify: "right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					__next40pxDefaultSize: true,
					variant: "tertiary",
					onClick: closeModal,
					disabled: isBusy,
					accessibleWhenDisabled: true,
					children: (0, import_i18n.__)("Cancel")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
					__next40pxDefaultSize: true,
					variant: "primary",
					onClick: async () => {
						setIsBusy(true);
						await onConfirm();
						onActionPerformed?.(items);
						setIsBusy(false);
						closeModal?.();
					},
					isBusy,
					disabled: isBusy,
					accessibleWhenDisabled: true,
					children: (0, import_i18n.__)("Reset")
				})]
			})]
		});
	}
};

// packages/core-actions/build-module/post_type_supports/restore/action.mjs
const restorePost = {
	icon: backup_default,
	isEligible(item) {
		return !isTemplateOrTemplatePart(item) && item.type !== "wp_block" && item.status === "trash" && item.permissions?.update;
	},
	async callback(posts, { registry, onActionPerformed }) {
		const { createSuccessNotice, createErrorNotice } = registry.dispatch(import_notices.store);
		const { editEntityRecord, saveEditedEntityRecord } = registry.dispatch(import_core_data.store);
		await Promise.allSettled(posts.map((post) => {
			return editEntityRecord("postType", post.type, post.id, { status: "draft" });
		}));
		const promiseResult = await Promise.allSettled(posts.map((post) => {
			return saveEditedEntityRecord("postType", post.type, post.id, { throwOnError: true });
		}));
		if (promiseResult.every(({ status }) => status === "fulfilled")) {
			let successMessage;
			if (posts.length === 1) successMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("\"%s\" has been restored."), getItemTitle(posts[0]));
			else if (posts[0].type === "page") successMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("%d pages have been restored."), posts.length);
			else successMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("%d posts have been restored."), posts.length);
			createSuccessNotice(successMessage, {
				type: "snackbar",
				id: "restore-post-action"
			});
			if (onActionPerformed) onActionPerformed(posts);
		} else {
			let errorMessage;
			if (promiseResult.length === 1) {
				const typedError = promiseResult[0];
				if (typedError.reason?.message) errorMessage = typedError.reason.message;
				else errorMessage = (0, import_i18n.__)("An error occurred while restoring the post.");
			} else {
				const errorMessages = /* @__PURE__ */ new Set();
				const failedPromises = promiseResult.filter(({ status }) => status === "rejected");
				for (const failedPromise of failedPromises) {
					const typedError = failedPromise;
					if (typedError.reason?.message) errorMessages.add(typedError.reason.message);
				}
				if (errorMessages.size === 0) errorMessage = (0, import_i18n.__)("An error occurred while restoring the posts.");
				else if (errorMessages.size === 1) errorMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("An error occurred while restoring the posts: %s"), [...errorMessages][0]);
				else errorMessage = (0, import_i18n.sprintf)((0, import_i18n.__)("Some errors occurred while restoring the posts: %s"), [...errorMessages].join(","));
			}
			createErrorNotice(errorMessage, { type: "snackbar" });
		}
	}
};

// packages/core-actions/build-module/post_type_supports/view-post/action.mjs
const viewPost = {
	icon: external_default,
	isEligible(post) {
		return post.status !== "trash";
	},
	callback(posts, { onActionPerformed }) {
		const post = posts[0];
		window.open(post?.link, "_blank");
		if (onActionPerformed) onActionPerformed(posts);
	}
};

// packages/core-actions/build-module/post_type_supports/view-post-revisions/action.mjs
const viewPostRevisions = {
	label(items) {
		const revisionsCount = items[0]._links?.["version-history"]?.[0]?.count ?? 0;
		return (0, import_i18n.sprintf)((0, import_i18n.__)("View revisions (%d)"), revisionsCount);
	},
	isEligible(post) {
		if (post.status === "trash") return false;
		const lastRevisionId = post?._links?.["predecessor-version"]?.[0]?.id ?? null;
		const revisionsCount = post?._links?.["version-history"]?.[0]?.count ?? 0;
		return !!lastRevisionId && revisionsCount > 1;
	},
	callback(posts, { onActionPerformed }) {
		const post = posts[0];
		const href = (0, import_url.addQueryArgs)("revision.php", { revision: post?._links?.["predecessor-version"]?.[0]?.id });
		document.location.href = href;
		if (onActionPerformed) onActionPerformed(posts);
	}
};

// packages/core-actions/build-module/post_type_supports/index.mjs
const actions = {
	"delete-post": deletePost,
	"duplicate-post": duplicatePost,
	"move-to-trash": trashPost,
	"order-pages": reorderPage,
	"permanently-delete": permanentlyDeletePost,
	"rename-post": renamePost,
	"reset-post": resetPostAction,
	restore: restorePost,
	"view-post": viewPost,
	"view-post-revisions": viewPostRevisions
};

export { actions as default };
//# sourceMappingURL=post_type_supports.js.map