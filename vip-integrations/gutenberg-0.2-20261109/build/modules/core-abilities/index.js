import { registerAbility, registerAbilityCategory } from "@wordpress/abilities";

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

// \0wp-global:@wordpress/api-fetch
var require_api_fetch = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.apiFetch;
}));

// \0wp-global:@wordpress/url
var require_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.url;
}));

// packages/core-abilities/build-module/index.mjs
var import_api_fetch = /* @__PURE__ */ __toESM(require_api_fetch(), 1);
var import_url = require_url();
/**
* API endpoint constants.
*/
const API_BASE = "/wp-abilities/v1";
const ABILITIES_ENDPOINT = `${API_BASE}/abilities`;
const CATEGORIES_ENDPOINT = `${API_BASE}/categories`;
/**
* Creates a serverCallback function for a WordPress REST API ability.
*
* @param ability The ability to create a callback for.
* @return The serverCallback function.
*/
function createServerCallback(ability) {
	return async (input) => {
		let method = "POST";
		if (!!ability.meta?.annotations?.readonly) method = "GET";
		else if (!!ability.meta?.annotations?.destructive && !!ability.meta?.annotations?.idempotent) method = "DELETE";
		let path = `${ABILITIES_ENDPOINT}/${ability.name}/run`;
		const options = { method };
		if (["GET", "DELETE"].includes(method) && input !== null && input !== void 0) path = (0, import_url.addQueryArgs)(path, { input });
		else if (method === "POST" && input !== null && input !== void 0) options.data = { input };
		return (0, import_api_fetch.default)({
			path,
			...options
		});
	};
}
/**
* Fetches and registers all ability categories from WordPress.
*/
async function initializeCategories() {
	try {
		const categories = await (0, import_api_fetch.default)({ path: (0, import_url.addQueryArgs)(CATEGORIES_ENDPOINT, {
			per_page: -1,
			context: "edit"
		}) });
		if (categories && Array.isArray(categories)) for (const category of categories) registerAbilityCategory(category.slug, {
			label: category.label,
			description: category.description,
			meta: { annotations: { serverRegistered: true } }
		});
	} catch (error) {
		console.error("Failed to fetch ability categories:", error);
	}
}
/**
* Fetches and registers all abilities from WordPress.
*/
async function initializeAbilities() {
	try {
		const abilities = await (0, import_api_fetch.default)({ path: (0, import_url.addQueryArgs)(ABILITIES_ENDPOINT, {
			per_page: -1,
			context: "edit"
		}) });
		if (abilities && Array.isArray(abilities)) for (const ability of abilities) registerAbility({
			...ability,
			callback: createServerCallback(ability),
			meta: { annotations: {
				...ability.meta?.annotations,
				serverRegistered: true
			} }
		});
	} catch (error) {
		console.error("Failed to fetch abilities:", error);
	}
}
/**
* Initialize WordPress abilities integration.
*/
async function initialize() {
	await initializeCategories();
	await initializeAbilities();
}
const ready = initialize();

export { ready };
//# sourceMappingURL=index.js.map