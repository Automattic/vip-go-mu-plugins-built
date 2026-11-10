(function(exports, _wordpress_api_fetch, _wordpress_data, _wordpress_deprecated) {

"use strict";
// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
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

_wordpress_api_fetch = __toESM(_wordpress_api_fetch, 1);
_wordpress_deprecated = __toESM(_wordpress_deprecated, 1);

// packages/data-controls/build-module/index.mjs
/**
	* Dispatches a control action for triggering an api fetch call.
	*
	* @param {Object} request Arguments for the fetch request.
	*
	* @example
	* ```js
	* import { apiFetch } from '@wordpress/data-controls';
	*
	* // Action generator using apiFetch
	* export function* myAction() {
	* 	const path = '/v2/my-api/items';
	* 	const items = yield apiFetch( { path } );
	* 	// do something with the items.
	* }
	* ```
	*
	* @return {Object} The control descriptor.
	*/
	function apiFetch(request) {
		return {
			type: "API_FETCH",
			request
		};
	}
	/**
	* Control for resolving a selector in a registered data store.
	* Alias for the `resolveSelect` built-in control in the `@wordpress/data` package.
	*
	* @param storeNameOrDescriptor The store object or identifier.
	* @param selectorName          The selector name.
	* @param args                  Arguments passed without change to the `@wordpress/data` control.
	*/
	function select(storeNameOrDescriptor, selectorName, ...args) {
		(0, _wordpress_deprecated.default)("`select` control in `@wordpress/data-controls`", {
			since: "5.7",
			alternative: "built-in `resolveSelect` control in `@wordpress/data`"
		});
		return _wordpress_data.controls.resolveSelect(storeNameOrDescriptor, selectorName, ...args);
	}
	/**
	* Control for calling a selector in a registered data store.
	* Alias for the `select` built-in control in the `@wordpress/data` package.
	*
	* @param storeNameOrDescriptor The store object or identifier.
	* @param selectorName          The selector name.
	* @param args                  Arguments passed without change to the `@wordpress/data` control.
	*/
	function syncSelect(storeNameOrDescriptor, selectorName, ...args) {
		(0, _wordpress_deprecated.default)("`syncSelect` control in `@wordpress/data-controls`", {
			since: "5.7",
			alternative: "built-in `select` control in `@wordpress/data`"
		});
		return _wordpress_data.controls.select(storeNameOrDescriptor, selectorName, ...args);
	}
	/**
	* Control for dispatching an action in a registered data store.
	* Alias for the `dispatch` control in the `@wordpress/data` package.
	*
	* @param storeNameOrDescriptor The store object or identifier.
	* @param actionName            The action name.
	* @param args                  Arguments passed without change to the `@wordpress/data` control.
	*/
	function dispatch(storeNameOrDescriptor, actionName, ...args) {
		(0, _wordpress_deprecated.default)("`dispatch` control in `@wordpress/data-controls`", {
			since: "5.7",
			alternative: "built-in `dispatch` control in `@wordpress/data`"
		});
		return _wordpress_data.controls.dispatch(storeNameOrDescriptor, actionName, ...args);
	}
	/**
	* Dispatches a control action for awaiting on a promise to be resolved.
	*
	* @param {Object} promise Promise to wait for.
	*
	* @example
	* ```js
	* import { __unstableAwaitPromise } from '@wordpress/data-controls';
	*
	* // Action generator using apiFetch
	* export function* myAction() {
	* 	const promise = getItemsAsync();
	* 	const items = yield __unstableAwaitPromise( promise );
	* 	// do something with the items.
	* }
	* ```
	*
	* @return {Object} The control descriptor.
	*/
	const __unstableAwaitPromise = function(promise) {
		return {
			type: "AWAIT_PROMISE",
			promise
		};
	};
	/**
	* The default export is what you use to register the controls with your custom
	* store.
	*
	* @example
	* ```js
	* import { controls } from '@wordpress/data-controls';
	* import { registerStore } from '@wordpress/data';
	* import reducer from './reducer';
	* import * as selectors from './selectors';
	* import * as actions from './actions';
	* import * as resolvers from './resolvers';
	*
	* registerStore( 'my-custom-store', {
	* reducer,
	* controls,
	* actions,
	* selectors,
	* resolvers,
	* } );
	* ```
	* @return {Object} An object for registering the default controls with the
	* store.
	*/
	const controls = {
		AWAIT_PROMISE({ promise }) {
			return promise;
		},
		API_FETCH({ request }) {
			return (0, _wordpress_api_fetch.default)(request);
		}
	};

exports.__unstableAwaitPromise = __unstableAwaitPromise;
exports.apiFetch = apiFetch;
exports.controls = controls;
exports.dispatch = dispatch;
exports.select = select;
exports.syncSelect = syncSelect;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).dataControls = exports;
return exports;
})({}, window.wp.apiFetch, window.wp.data, window.wp.deprecated);
//# sourceMappingURL=index.js.map