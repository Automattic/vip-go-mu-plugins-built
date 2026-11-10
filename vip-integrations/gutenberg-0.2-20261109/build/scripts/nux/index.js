(function(exports, _wordpress_deprecated, _wordpress_data) {

"use strict";
// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) {
			__defProp(target, name, {
				get: all[name],
				enumerable: true
			});
		}
		if (!no_symbols) {
			__defProp(target, Symbol.toStringTag, { value: "Module" });
		}
		return target;
	};
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

_wordpress_deprecated = __toESM(_wordpress_deprecated, 1);

// packages/nux/build-module/store/reducer.mjs
/**
	* Deprecated NUX store state kept only so the core/nux store can still be
	* registered for backward compatibility.
	*/
	const DEFAULT_STATE = {
		guides: [],
		preferences: {
			areTipsEnabled: false,
			dismissedTips: {}
		}
	};
	/**
	* Reducer that preserves state without responding to actions.
	*
	* @param {Object} state Current state.
	*
	* @return {Object} Current state.
	*/
	function reducer(state = DEFAULT_STATE) {
		return state;
	}

// packages/nux/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		disableTips: () => disableTips,
		dismissTip: () => dismissTip,
		enableTips: () => enableTips,
		triggerGuide: () => triggerGuide
	}, 1);
	/**
	* Returns a no-op action object. This package is deprecated and no longer
	* displays tips, but the action remains for backward compatibility.
	*
	* @param {string[]} tipIds Which tips would have been shown in the guide.
	*
	* @return {Object} Action object.
	*/
	function triggerGuide(tipIds) {
		return {
			type: "TRIGGER_GUIDE",
			tipIds
		};
	}
	/**
	* Returns a no-op action object. This package is deprecated and no longer
	* displays tips, but the action remains for backward compatibility.
	*
	* @param {string} id The tip that would have been dismissed.
	*
	* @return {Object} Action object.
	*/
	function dismissTip(id) {
		return {
			type: "DISMISS_TIP",
			id
		};
	}
	/**
	* Returns a no-op action object. This package is deprecated and no longer
	* displays tips, but the action remains for backward compatibility.
	*
	* @return {Object} Action object.
	*/
	function disableTips() {
		return { type: "DISABLE_TIPS" };
	}
	/**
	* Returns a no-op action object. This package is deprecated and no longer
	* displays tips, but the action remains for backward compatibility.
	*
	* @return {Object} Action object.
	*/
	function enableTips() {
		return { type: "ENABLE_TIPS" };
	}

// packages/nux/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		areTipsEnabled: () => areTipsEnabled,
		getAssociatedGuide: () => getAssociatedGuide,
		isTipVisible: () => isTipVisible
	}, 1);
	/**
	* An object containing information about a guide.
	*
	* @typedef {Object} NUXGuideInfo
	* @property {string[]} tipIds       Which tips the guide contains.
	* @property {?string}  currentTipId The guide's currently showing tip.
	* @property {?string}  nextTipId    The guide's next tip to show.
	*/
	/**
	* Returns null because the deprecated NUX package no longer displays guides.
	*
	* @return {null} No associated guide.
	*/
	function getAssociatedGuide() {
		return null;
	}
	/**
	* Returns false because the deprecated NUX package no longer displays tips.
	*
	* @return {boolean} Whether or not the given tip is showing.
	*/
	function isTipVisible() {
		return false;
	}
	/**
	* Returns false because the deprecated NUX package no longer displays tips.
	*
	* @return {boolean} Whether tips are globally enabled.
	*/
	function areTipsEnabled() {
		return false;
	}

// packages/nux/build-module/store/index.mjs
	const STORE_NAME = "core/nux";
	/**
	* Store definition for the nux namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*
	* @type {Object}
	*/
	const store = (0, _wordpress_data.createReduxStore)(STORE_NAME, {
		reducer,
		actions: actions_exports,
		selectors: selectors_exports,
		persist: ["preferences"]
	});
	(0, _wordpress_data.registerStore)(STORE_NAME, {
		reducer,
		actions: actions_exports,
		selectors: selectors_exports,
		persist: ["preferences"]
	});

// packages/nux/build-module/components/dot-tip/index.mjs
/**
	* Deprecated no-op DotTip component.
	*
	* @return {null} Nothing.
	*/
	function DotTip() {
		return null;
	}

// packages/nux/build-module/index.mjs
	(0, _wordpress_deprecated.default)("wp.nux", {
		since: "5.4",
		hint: "wp.components.Guide can be used to show a user guide.",
		version: "6.2"
	});

exports.DotTip = DotTip;
exports.store = store;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).nux = exports;
return exports;
})({}, window.wp.deprecated, window.wp.data);
//# sourceMappingURL=index.js.map