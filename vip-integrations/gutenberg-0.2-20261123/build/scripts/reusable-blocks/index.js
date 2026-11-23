(function(exports, _wordpress_data, _wordpress_deprecated) {

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

// packages/reusable-blocks/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		__experimentalConvertBlockToStatic: () => __experimentalConvertBlockToStatic,
		__experimentalConvertBlocksToReusable: () => __experimentalConvertBlocksToReusable,
		__experimentalDeleteReusableBlock: () => __experimentalDeleteReusableBlock,
		__experimentalSetEditingReusableBlock: () => __experimentalSetEditingReusableBlock
	}, 1);
	/**
	* Returns a no-op thunk. This package is deprecated and converting reusable
	* blocks is now handled elsewhere, but the action remains for backward
	* compatibility.
	*/
	const __experimentalConvertBlockToStatic = () => () => {
		(0, _wordpress_deprecated.default)("wp.data.dispatch( 'core/reusable-blocks' ).__experimentalConvertBlockToStatic", { since: "7.1" });
	};
	/**
	* Returns a no-op thunk. This package is deprecated and converting blocks into
	* patterns is now handled elsewhere, but the action remains for backward
	* compatibility.
	*/
	const __experimentalConvertBlocksToReusable = () => async () => {
		(0, _wordpress_deprecated.default)("wp.data.dispatch( 'core/reusable-blocks' ).__experimentalConvertBlocksToReusable", { since: "7.1" });
	};
	/**
	* Returns a no-op thunk. This package is deprecated and deleting reusable
	* blocks is now handled elsewhere, but the action remains for backward
	* compatibility.
	*/
	const __experimentalDeleteReusableBlock = () => async () => {
		(0, _wordpress_deprecated.default)("wp.data.dispatch( 'core/reusable-blocks' ).__experimentalDeleteReusableBlock", { since: "7.1" });
	};
	/**
	* Returns a no-op action object. This package is deprecated and tracking the
	* editing state of reusable blocks is no longer handled here, but the action
	* remains for backward compatibility.
	*
	* @param {string}  clientId  The clientID of the reusable block to target.
	* @param {boolean} isEditing Whether the block should be in editing state.
	*
	* @return {Object} Action object.
	*/
	function __experimentalSetEditingReusableBlock(clientId, isEditing) {
		(0, _wordpress_deprecated.default)("wp.data.dispatch( 'core/reusable-blocks' ).__experimentalSetEditingReusableBlock", { since: "7.1" });
		return {
			type: "SET_EDITING_REUSABLE_BLOCK",
			clientId,
			isEditing
		};
	}

// packages/reusable-blocks/build-module/store/reducer.mjs
/**
	* Deprecated reusable blocks store state kept only so the
	* `core/reusable-blocks` store can still be registered for backward
	* compatibility.
	*/
	const DEFAULT_STATE = { isEditingReusableBlock: {} };
	/**
	* Reducer that preserves the default state without responding to actions.
	*
	* @param {Object} state Current state.
	*
	* @return {Object} Current state.
	*/
	function reducer(state = DEFAULT_STATE) {
		return state;
	}

// packages/reusable-blocks/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({ __experimentalIsEditingReusableBlock: () => __experimentalIsEditingReusableBlock }, 1);
	/**
	* Returns false because the deprecated reusable blocks package no longer tracks
	* editing state.
	*
	* @return {boolean} Whether the reusable block is in the editing state.
	*/
	function __experimentalIsEditingReusableBlock() {
		(0, _wordpress_deprecated.default)("wp.data.select( 'core/reusable-blocks' ).__experimentalIsEditingReusableBlock", { since: "7.1" });
		return false;
	}

// packages/reusable-blocks/build-module/store/index.mjs
/**
	* Store definition for the reusable blocks namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*
	* @type {Object}
	*/
	const store = (0, _wordpress_data.createReduxStore)("core/reusable-blocks", {
		actions: actions_exports,
		reducer,
		selectors: selectors_exports
	});
	(0, _wordpress_data.register)(store);

// packages/reusable-blocks/build-module/components/reusable-blocks-menu-items/index.mjs
/**
	* Deprecated no-op ReusableBlocksMenuItems component.
	*
	* @return {null} Nothing.
	*/
	function ReusableBlocksMenuItems() {
		(0, _wordpress_deprecated.default)("wp.reusableBlocks.ReusableBlocksMenuItems", { since: "7.1" });
		return null;
	}

exports.ReusableBlocksMenuItems = ReusableBlocksMenuItems;
exports.store = store;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).reusableBlocks = exports;
return exports;
})({}, window.wp.data, window.wp.deprecated);
//# sourceMappingURL=index.js.map