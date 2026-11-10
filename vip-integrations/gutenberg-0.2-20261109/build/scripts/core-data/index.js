(function(exports, _wordpress_data, _wordpress_compose, _wordpress_undo_manager, _wordpress_api_fetch, _wordpress_hooks, _wordpress_warning, _wordpress_blocks, _wordpress_i18n, _wordpress_block_editor, _wordpress_private_apis, _wordpress_rich_text, _wordpress_url, _wordpress_deprecated, _wordpress_notices, _wordpress_html_entities, _wordpress_element, react_jsx_runtime, _wordpress_primitives, _wordpress_components) {

"use strict";
// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
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

_wordpress_api_fetch = __toESM(_wordpress_api_fetch, 1);
_wordpress_warning = __toESM(_wordpress_warning, 1);
_wordpress_deprecated = __toESM(_wordpress_deprecated, 1);

// node_modules/.store/fast-deep-equal@3.1.3-Dk0kpzcWCOUHE1bkOO2LLA/node_modules/fast-deep-equal/es6/index.js
	var require_es6 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = function equal(a, b) {
			if (a === b) return true;
			if (a && b && typeof a == "object" && typeof b == "object") {
				if (a.constructor !== b.constructor) return false;
				var length, i, keys;
				if (Array.isArray(a)) {
					length = a.length;
					if (length != b.length) return false;
					for (i = length; i-- !== 0;) if (!equal(a[i], b[i])) return false;
					return true;
				}
				if (a instanceof Map && b instanceof Map) {
					if (a.size !== b.size) return false;
					for (i of a.entries()) if (!b.has(i[0])) return false;
					for (i of a.entries()) if (!equal(i[1], b.get(i[0]))) return false;
					return true;
				}
				if (a instanceof Set && b instanceof Set) {
					if (a.size !== b.size) return false;
					for (i of a.entries()) if (!b.has(i[0])) return false;
					return true;
				}
				if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
					length = a.length;
					if (length != b.length) return false;
					for (i = length; i-- !== 0;) if (a[i] !== b[i]) return false;
					return true;
				}
				if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
				if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
				if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
				keys = Object.keys(a);
				length = keys.length;
				if (length !== Object.keys(b).length) return false;
				for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
				for (i = length; i-- !== 0;) {
					var key = keys[i];
					if (!equal(a[key], b[key])) return false;
				}
				return true;
			}
			return a !== a && b !== b;
		};
	}));

// packages/core-data/build-module/utils/clear-unchanged-edits.mjs
	var import_es6 = /* @__PURE__ */ __toESM(require_es6(), 1);
	/**
	* Returns a copy of `edits` where any value equal to its persisted counterpart
	* is set to `undefined`. The edits reducer treats `undefined` as a signal to
	* drop the edit, so the property is no longer considered dirty.
	*
	* @param edits           Edits keyed by property name.
	* @param persistedRecord Persisted entity record to compare against.
	*
	* @return Edits with unchanged properties set to `undefined`.
	*/
	function clearUnchangedEdits(edits, persistedRecord) {
		if (!persistedRecord) return edits;
		return Object.fromEntries(Object.entries(edits).map(([key, value]) => {
			const persisted = persistedRecord[key]?.raw ?? persistedRecord[key];
			return [key, (0, import_es6.default)(value, persisted) ? void 0 : value];
		}));
	}

// packages/core-data/build-module/utils/conservative-map-item.mjs
	function conservativeMapItem(item, nextItem) {
		if (!item) return nextItem;
		let hasChanges = false;
		const result = {};
		for (const key in nextItem) if ((0, import_es6.default)(item[key], nextItem[key])) result[key] = item[key];
		else {
			hasChanges = true;
			result[key] = nextItem[key];
		}
		if (!hasChanges) return item;
		for (const key in item) if (!result.hasOwnProperty(key)) result[key] = item[key];
		return result;
	}

// packages/core-data/build-module/utils/get-normalized-comma-separable.mjs
	function getNormalizedCommaSeparable(value) {
		if (typeof value === "string") return value.split(",");
		else if (Array.isArray(value)) return value;
		return null;
	}

// packages/core-data/build-module/utils/set-nested-value.mjs
/**
	* Sets the value at path of object.
	* If a portion of path doesn’t exist, it’s created.
	* Arrays are created for missing index properties while objects are created
	* for all other missing properties.
	*
	* Path is specified as either:
	* - a string of properties, separated by dots, for example: "x.y".
	* - an array of properties, for example `[ 'x', 'y' ]`.
	*
	* This function intentionally mutates the input object.
	*
	* Inspired by _.set().
	*
	* @see https://lodash.com/docs/4.17.15#set
	*
	* @todo Needs to be deduplicated with its copy in `@wordpress/edit-site`.
	*
	* @param object Object to modify
	* @param path   Path of the property to set.
	* @param value  Value to set.
	*/
	function setNestedValue(object, path, value) {
		if (!object || typeof object !== "object") return object;
		const normalizedPath = Array.isArray(path) ? path : path.split(".");
		normalizedPath.reduce((acc, key, idx) => {
			if (acc[key] === void 0) {
				if (Number.isInteger(normalizedPath[idx + 1])) acc[key] = [];
				else acc[key] = {};
			}
			if (idx === normalizedPath.length - 1) acc[key] = value;
			return acc[key];
		}, object);
		return object;
	}

// packages/core-data/build-module/utils/get-filtered-item.mjs
/**
	* Cache of items to a map of the normalized `_fields` they were projected with
	* and the resulting projection. Keying on the item rather than on the state
	* keeps the cache alive across unrelated state updates, and lets it be
	* collected along with the item it projects.
	*/
	const filteredItemCache = /* @__PURE__ */ new WeakMap();
	/**
	* Returns the item reduced to the requested `_fields`. Caches the result per
	* item (by reference) and per field set (by value), so that:
	*
	* `getFilteredItem( item, 'id' ) === getFilteredItem( item, [ 'id' ] )`
	*
	* @param item    Item to filter.
	* @param _fields Fields to keep, as a comma-separated string or an array of paths.
	*
	* @return Item containing only the requested fields.
	*/
	function getFilteredItem(item, _fields) {
		const fields = getNormalizedCommaSeparable(_fields) ?? [];
		const fieldsKey = fields.join(",");
		let itemCache = filteredItemCache.get(item);
		if (itemCache) {
			const filtered = itemCache.get(fieldsKey);
			if (filtered !== void 0) return filtered;
		} else if (item !== null && typeof item === "object") {
			itemCache = /* @__PURE__ */ new Map();
			filteredItemCache.set(item, itemCache);
		}
		const filteredItem = {};
		for (let f = 0; f < fields.length; f++) {
			const field = fields[f].split(".");
			let value = item;
			field.forEach((fieldName) => {
				value = value?.[fieldName];
			});
			setNestedValue(filteredItem, field, value);
		}
		itemCache?.set(fieldsKey, filteredItem);
		return filteredItem;
	}

// packages/core-data/build-module/utils/if-matching-action.mjs
/**
	* A higher-order reducer creator which invokes the original reducer only if
	* the dispatching action matches the given predicate, **OR** if state is
	* initializing (undefined).
	*
	* @param isMatch Function predicate for allowing reducer call.
	*
	* @return Higher-order reducer.
	*/
	const ifMatchingAction = (isMatch) => (reducer) => (state, action) => {
		if (state === void 0 || isMatch(action)) return reducer(state, action);
		return state;
	};

// packages/core-data/build-module/utils/forward-resolver.mjs
/**
	* Higher-order function which forward the resolution to another resolver with the same arguments.
	*
	* @param resolverName forwarded resolver.
	*
	* @return Enhanced resolver.
	*/
	const forwardResolver = (resolverName) => (...args) => async ({ resolveSelect }) => {
		await resolveSelect[resolverName](...args);
	};

// packages/core-data/build-module/utils/replace-action.mjs
/**
	* Higher-order reducer creator which substitutes the action object before
	* passing to the original reducer.
	*
	* @param replacer Function mapping original action to replacement.
	*
	* @return Higher-order reducer.
	*/
	const replaceAction = (replacer) => (reducer) => (state, action) => {
		return reducer(state, replacer(action));
	};

// packages/core-data/build-module/utils/with-weak-map-cache.mjs
/**
	* Given a function, returns an enhanced function which caches the result and
	* tracks in WeakMap. The result is only cached if the original function is
	* passed a valid object-like argument (requirement for WeakMap key).
	*
	* @param fn Original function.
	*
	* @return Enhanced caching function.
	*/
	function withWeakMapCache(fn) {
		const cache = /* @__PURE__ */ new WeakMap();
		return (key) => {
			let value;
			if (cache.has(key)) value = cache.get(key);
			else {
				value = fn(key);
				if (key !== null && typeof key === "object") cache.set(key, value);
			}
			return value;
		};
	}

// packages/core-data/build-module/utils/get-nested-value.mjs
/**
	* Helper util to return a value from a certain path of the object.
	* Path is specified as either:
	* - a string of properties, separated by dots, for example: "x.y".
	* - an array of properties, for example `[ 'x', 'y' ]`.
	* You can also specify a default value in case the result is nullish.
	*
	* @param object       Input object.
	* @param path         Path to the object property.
	* @param defaultValue Default value if the value at the specified path is undefined.
	* @return Value of the object property at the specified path.
	*/
	function getNestedValue(object, path, defaultValue) {
		if (!object || typeof object !== "object" || typeof path !== "string" && !Array.isArray(path)) return object;
		const normalizedPath = Array.isArray(path) ? path : path.split(".");
		let value = object;
		normalizedPath.forEach((fieldName) => {
			value = value?.[fieldName];
		});
		return value !== void 0 ? value : defaultValue;
	}

// packages/core-data/build-module/utils/is-numeric-id.mjs
/**
	* Checks argument to determine if it's a numeric ID.
	* For example, '123' is a numeric ID, but '123abc' is not.
	*
	* @param id the argument to determine if it's a numeric ID.
	* @return true if the string is a numeric ID, false otherwise.
	*/
	function isNumericID(id) {
		return /^\s*\d+\s*$/.test(id);
	}

// packages/core-data/build-module/utils/user-permissions.mjs
	const ALLOWED_RESOURCE_ACTIONS = [
		"create",
		"read",
		"update",
		"delete"
	];
	function getUserPermissionsFromAllowHeader(allowedMethods) {
		const permissions = {};
		for (const [actionName, methodName] of Object.entries({
			create: "POST",
			read: "GET",
			update: "PUT",
			delete: "DELETE"
		})) permissions[actionName] = allowedMethods ? allowedMethods.includes(methodName) : false;
		return permissions;
	}
	function getUserPermissionCacheKey(action, resource, id) {
		return (typeof resource === "object" ? [
			action,
			resource.kind,
			resource.name,
			resource.id
		] : [
			action,
			resource,
			id
		]).filter(Boolean).join("/");
	}

// packages/core-data/build-module/utils/receive-intermediate-results.mjs
	const RECEIVE_INTERMEDIATE_RESULTS = Symbol("RECEIVE_INTERMEDIATE_RESULTS");

// packages/core-data/build-module/utils/normalize-query-for-resolution.mjs
/**
	* Returns a copy of `query` filtered to only the keys that affect resolution
	* identity (`context` and `_fields`), or `undefined` when none are present.
	* This mirrors the normalisation that the data store applies when keying
	* resolved records, so that `finishResolutions` receives args that match the
	* keys used by callers who omit pagination params.
	*
	* @param query The raw query object.
	* @return Normalised query or undefined.
	*/
	function normalizeQueryForResolution(query) {
		if (!query) return;
		const entries = Object.entries(query).filter(([k, v]) => (k === "context" || k === "_fields") && v !== void 0 && v !== null);
		return entries.length > 0 ? Object.fromEntries(entries) : void 0;
	}

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/map.js
/**
	* Utility module to work with key-value stores.
	*
	* @module map
	*/
	/**
	* @template K
	* @template V
	* @typedef {Map<K,V>} GlobalMap
	*/
	/**
	* Creates a new Map instance.
	*
	* @function
	* @return {Map<any, any>}
	*
	* @function
	*/
	const create$7 = () => /* @__PURE__ */ new Map();
	/**
	* Copy a Map object into a fresh Map object.
	*
	* @function
	* @template K,V
	* @param {Map<K,V>} m
	* @return {Map<K,V>}
	*/
	const copy = (m) => {
		const r = create$7();
		m.forEach((v, k) => {
			r.set(k, v);
		});
		return r;
	};
	/**
	* Get map property. Create T if property is undefined and set T on map.
	*
	* ```js
	* const listeners = map.setIfUndefined(events, 'eventName', set.create)
	* listeners.add(listener)
	* ```
	*
	* @function
	* @template {Map<any, any>} MAP
	* @template {MAP extends Map<any,infer V> ? function():V : unknown} CF
	* @param {MAP} map
	* @param {MAP extends Map<infer K,any> ? K : unknown} key
	* @param {CF} createT
	* @return {ReturnType<CF>}
	*/
	const setIfUndefined = (map, key, createT) => {
		let set = map.get(key);
		if (set === void 0) map.set(key, set = createT());
		return set;
	};
	/**
	* Creates an Array and populates it with the content of all key-value pairs using the `f(value, key)` function.
	*
	* @function
	* @template K
	* @template V
	* @template R
	* @param {Map<K,V>} m
	* @param {function(V,K):R} f
	* @return {Array<R>}
	*/
	const map = (m, f) => {
		const res = [];
		for (const [key, value] of m) res.push(f(value, key));
		return res;
	};
	/**
	* Tests whether any key-value pairs pass the test implemented by `f(value, key)`.
	*
	* @todo should rename to some - similarly to Array.some
	*
	* @function
	* @template K
	* @template V
	* @param {Map<K,V>} m
	* @param {function(V,K):boolean} f
	* @return {boolean}
	*/
	const any = (m, f) => {
		for (const [key, value] of m) if (f(value, key)) return true;
		return false;
	};

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/set.js
/**
	* Utility module to work with sets.
	*
	* @module set
	*/
	const create$6 = () => /* @__PURE__ */ new Set();

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/array.js
/**
	* Return the last element of an array. The element must exist
	*
	* @template L
	* @param {ArrayLike<L>} arr
	* @return {L}
	*/
	const last = (arr) => arr[arr.length - 1];
	/**
	* Append elements from src to dest
	*
	* @template M
	* @param {Array<M>} dest
	* @param {Array<M>} src
	*/
	const appendTo = (dest, src) => {
		for (let i = 0; i < src.length; i++) dest.push(src[i]);
	};
	/**
	* Transforms something array-like to an actual Array.
	*
	* @function
	* @template T
	* @param {ArrayLike<T>|Iterable<T>} arraylike
	* @return {T}
	*/
	const from = Array.from;
	/**
	* True iff condition holds on every element in the Array.
	*
	* @function
	* @template {ArrayLike<any>} ARR
	*
	* @param {ARR} arr
	* @param {ARR extends ArrayLike<infer S> ? ((value:S, index:number, arr:ARR) => boolean) : any} f
	* @return {boolean}
	*/
	const every$1 = (arr, f) => {
		for (let i = 0; i < arr.length; i++) if (!f(arr[i], i, arr)) return false;
		return true;
	};
	/**
	* True iff condition holds on some element in the Array.
	*
	* @function
	* @template {ArrayLike<any>} ARR
	*
	* @param {ARR} arr
	* @param {ARR extends ArrayLike<infer S> ? ((value:S, index:number, arr:ARR) => boolean) : never} f
	* @return {boolean}
	*/
	const some = (arr, f) => {
		for (let i = 0; i < arr.length; i++) if (f(arr[i], i, arr)) return true;
		return false;
	};
	/**
	* @template T
	* @param {number} len
	* @param {function(number, Array<T>):T} f
	* @return {Array<T>}
	*/
	const unfold = (len, f) => {
		const array = new Array(len);
		for (let i = 0; i < len; i++) array[i] = f(i, array);
		return array;
	};
	const isArray = Array.isArray;

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/observable.js
/**
	* Observable class prototype.
	*
	* @module observable
	*/
	/**
	* Handles named events.
	* @experimental
	*
	* This is basically a (better typed) duplicate of Observable, which will replace Observable in the
	* next release.
	*
	* @template {{[key in keyof EVENTS]: function(...any):void}} EVENTS
	*/
	var ObservableV2 = class {
		constructor() {
			/**
			* Some desc.
			* @type {Map<string, Set<any>>}
			*/
			this._observers = create$7();
		}
		/**
		* @template {keyof EVENTS & string} NAME
		* @param {NAME} name
		* @param {EVENTS[NAME]} f
		*/
		on(name, f) {
			setIfUndefined(this._observers, name, create$6).add(f);
			return f;
		}
		/**
		* @template {keyof EVENTS & string} NAME
		* @param {NAME} name
		* @param {EVENTS[NAME]} f
		*/
		once(name, f) {
			/**
			* @param  {...any} args
			*/
			const _f = (...args) => {
				this.off(name, _f);
				f(...args);
			};
			this.on(name, _f);
		}
		/**
		* @template {keyof EVENTS & string} NAME
		* @param {NAME} name
		* @param {EVENTS[NAME]} f
		*/
		off(name, f) {
			const observers = this._observers.get(name);
			if (observers !== void 0) {
				observers.delete(f);
				if (observers.size === 0) this._observers.delete(name);
			}
		}
		/**
		* Emit a named event. All registered event listeners that listen to the
		* specified name will receive the event.
		*
		* @todo This should catch exceptions
		*
		* @template {keyof EVENTS & string} NAME
		* @param {NAME} name The event name.
		* @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
		*/
		emit(name, args) {
			return from((this._observers.get(name) || create$7()).values()).forEach((f) => f(...args));
		}
		destroy() {
			this._observers = create$7();
		}
	};
	/* c8 ignore start */
	/**
	* Handles named events.
	*
	* @deprecated
	* @template N
	*/
	var Observable = class {
		constructor() {
			/**
			* Some desc.
			* @type {Map<N, any>}
			*/
			this._observers = create$7();
		}
		/**
		* @param {N} name
		* @param {function} f
		*/
		on(name, f) {
			setIfUndefined(this._observers, name, create$6).add(f);
		}
		/**
		* @param {N} name
		* @param {function} f
		*/
		once(name, f) {
			/**
			* @param  {...any} args
			*/
			const _f = (...args) => {
				this.off(name, _f);
				f(...args);
			};
			this.on(name, _f);
		}
		/**
		* @param {N} name
		* @param {function} f
		*/
		off(name, f) {
			const observers = this._observers.get(name);
			if (observers !== void 0) {
				observers.delete(f);
				if (observers.size === 0) this._observers.delete(name);
			}
		}
		/**
		* Emit a named event. All registered event listeners that listen to the
		* specified name will receive the event.
		*
		* @todo This should catch exceptions
		*
		* @param {N} name The event name.
		* @param {Array<any>} args The arguments that are applied to the event listener.
		*/
		emit(name, args) {
			return from((this._observers.get(name) || create$7()).values()).forEach((f) => f(...args));
		}
		destroy() {
			this._observers = create$7();
		}
	};
	/* c8 ignore end */

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/math.js
/**
	* Common Math expressions.
	*
	* @module math
	*/
	const floor = Math.floor;
	const abs = Math.abs;
	/**
	* @function
	* @param {number} a
	* @param {number} b
	* @return {number} The smaller element of a and b
	*/
	const min = (a, b) => a < b ? a : b;
	/**
	* @function
	* @param {number} a
	* @param {number} b
	* @return {number} The bigger element of a and b
	*/
	const max = (a, b) => a > b ? a : b;
	const isNaN$2 = Number.isNaN;
	/**
	* Check whether n is negative, while considering the -0 edge case. While `-0 < 0` is false, this
	* function returns true for -0,-1,,.. and returns false for 0,1,2,...
	* @param {number} n
	* @return {boolean} Wether n is negative. This function also distinguishes between -0 and +0
	*/
	const isNegativeZero = (n) => n !== 0 ? n < 0 : 1 / n < 0;

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/binary.js
/**
	* Binary data constants.
	*
	* @module binary
	*/
	/**
	* n-th bit activated.
	*
	* @type {number}
	*/
	const BIT1 = 1;
	const BIT2 = 2;
	const BIT3 = 4;
	const BIT4 = 8;
	const BIT6 = 32;
	const BIT7 = 64;
	const BIT8 = 128;
	const BITS5 = 31;
	const BITS6 = 63;
	const BITS7 = 127;
	/**
	* @type {number}
	*/
	const BITS31 = 2147483647;

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/number.js
/**
	* Utility helpers for working with numbers.
	*
	* @module number
	*/
	const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
	const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
	/* c8 ignore next */
	const isInteger = Number.isInteger || ((num) => typeof num === "number" && isFinite(num) && floor(num) === num);
	const isNaN$1 = Number.isNaN;
	const parseInt$1 = Number.parseInt;

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/string.js
/**
	* Utility module to work with strings.
	*
	* @module string
	*/
	const fromCharCode = String.fromCharCode;
	const fromCodePoint = String.fromCodePoint;
	/**
	* The largest utf16 character.
	* Corresponds to Uint8Array([255, 255]) or charcodeof(2x2^8)
	*/
	const MAX_UTF16_CHARACTER = fromCharCode(65535);
	/**
	* @param {string} s
	* @return {string}
	*/
	const toLowerCase = (s) => s.toLowerCase();
	const trimLeftRegex = /^\s*/g;
	/**
	* @param {string} s
	* @return {string}
	*/
	const trimLeft = (s) => s.replace(trimLeftRegex, "");
	const fromCamelCaseRegex = /([A-Z])/g;
	/**
	* @param {string} s
	* @param {string} separator
	* @return {string}
	*/
	const fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, (match) => `${separator}${toLowerCase(match)}`));
	/**
	* @param {string} str
	* @return {Uint8Array<ArrayBuffer>}
	*/
	const _encodeUtf8Polyfill = (str) => {
		const encodedString = unescape(encodeURIComponent(str));
		const len = encodedString.length;
		const buf = new Uint8Array(len);
		for (let i = 0; i < len; i++) buf[i] = encodedString.codePointAt(i);
		return buf;
	};
	/* c8 ignore next */
	const utf8TextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
	/**
	* @param {string} str
	* @return {Uint8Array<ArrayBuffer>}
	*/
	const _encodeUtf8Native = (str) => utf8TextEncoder.encode(str);
	/**
	* @param {string} str
	* @return {Uint8Array}
	*/
	/* c8 ignore next */
	const encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;
	/* c8 ignore next */
	let utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8", {
		fatal: true,
		ignoreBOM: true
	});
	/* c8 ignore start */
	if (utf8TextDecoder && utf8TextDecoder.decode(/* @__PURE__ */ new Uint8Array()).length === 1)
 /* c8 ignore next */
	utf8TextDecoder = null;
	/**
	* @param {string} source
	* @param {number} n
	*/
	const repeat = (source, n) => unfold(n, () => source).join("");

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/encoding.js
/**
	* Efficient schema-less binary encoding with support for variable length encoding.
	*
	* Use [lib0/encoding] with [lib0/decoding]. Every encoding function has a corresponding decoding function.
	*
	* Encodes numbers in little-endian order (least to most significant byte order)
	* and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
	* which is also used in Protocol Buffers.
	*
	* ```js
	* // encoding step
	* const encoder = encoding.createEncoder()
	* encoding.writeVarUint(encoder, 256)
	* encoding.writeVarString(encoder, 'Hello world!')
	* const buf = encoding.toUint8Array(encoder)
	* ```
	*
	* ```js
	* // decoding step
	* const decoder = decoding.createDecoder(buf)
	* decoding.readVarUint(decoder) // => 256
	* decoding.readVarString(decoder) // => 'Hello world!'
	* decoding.hasContent(decoder) // => false - all data is read
	* ```
	*
	* @module encoding
	*/
	/**
	* A BinaryEncoder handles the encoding to an Uint8Array.
	*/
	var Encoder = class {
		constructor() {
			this.cpos = 0;
			this.cbuf = /* @__PURE__ */ new Uint8Array(100);
			/**
			* @type {Array<Uint8Array>}
			*/
			this.bufs = [];
		}
	};
	/**
	* @function
	* @return {Encoder}
	*/
	const createEncoder = () => new Encoder();
	/**
	* The current length of the encoded data.
	*
	* @function
	* @param {Encoder} encoder
	* @return {number}
	*/
	const length = (encoder) => {
		let len = encoder.cpos;
		for (let i = 0; i < encoder.bufs.length; i++) len += encoder.bufs[i].length;
		return len;
	};
	/**
	* Transform to Uint8Array.
	*
	* @function
	* @param {Encoder} encoder
	* @return {Uint8Array<ArrayBuffer>} The created ArrayBuffer.
	*/
	const toUint8Array = (encoder) => {
		const uint8arr = new Uint8Array(length(encoder));
		let curPos = 0;
		for (let i = 0; i < encoder.bufs.length; i++) {
			const d = encoder.bufs[i];
			uint8arr.set(d, curPos);
			curPos += d.length;
		}
		uint8arr.set(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
		return uint8arr;
	};
	/**
	* Verify that it is possible to write `len` bytes wtihout checking. If
	* necessary, a new Buffer with the required length is attached.
	*
	* @param {Encoder} encoder
	* @param {number} len
	*/
	const verifyLen = (encoder, len) => {
		const bufferLen = encoder.cbuf.length;
		if (bufferLen - encoder.cpos < len) {
			encoder.bufs.push(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos));
			encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
			encoder.cpos = 0;
		}
	};
	/**
	* Write one byte to the encoder.
	*
	* @function
	* @param {Encoder} encoder
	* @param {number} num The byte that is to be encoded.
	*/
	const write = (encoder, num) => {
		const bufferLen = encoder.cbuf.length;
		if (encoder.cpos === bufferLen) {
			encoder.bufs.push(encoder.cbuf);
			encoder.cbuf = new Uint8Array(bufferLen * 2);
			encoder.cpos = 0;
		}
		encoder.cbuf[encoder.cpos++] = num;
	};
	/**
	* Write one byte as an unsigned integer.
	*
	* @function
	* @param {Encoder} encoder
	* @param {number} num The number that is to be encoded.
	*/
	const writeUint8 = write;
	/**
	* Write a variable length unsigned integer. Max encodable integer is 2^53.
	*
	* @function
	* @param {Encoder} encoder
	* @param {number} num The number that is to be encoded.
	*/
	const writeVarUint = (encoder, num) => {
		while (num > 127) {
			write(encoder, 128 | 127 & num);
			num = floor(num / 128);
		}
		write(encoder, 127 & num);
	};
	/**
	* Write a variable length integer.
	*
	* We use the 7th bit instead for signaling that this is a negative number.
	*
	* @function
	* @param {Encoder} encoder
	* @param {number} num The number that is to be encoded.
	*/
	const writeVarInt = (encoder, num) => {
		const isNegative = isNegativeZero(num);
		if (isNegative) num = -num;
		write(encoder, (num > 63 ? 128 : 0) | (isNegative ? 64 : 0) | 63 & num);
		num = floor(num / 64);
		while (num > 0) {
			write(encoder, (num > 127 ? 128 : 0) | 127 & num);
			num = floor(num / 128);
		}
	};
	/**
	* A cache to store strings temporarily
	*/
	const _strBuffer = /* @__PURE__ */ new Uint8Array(3e4);
	const _maxStrBSize = _strBuffer.length / 3;
	/**
	* Write a variable length string.
	*
	* @function
	* @param {Encoder} encoder
	* @param {String} str The string that is to be encoded.
	*/
	const _writeVarStringNative = (encoder, str) => {
		if (str.length < _maxStrBSize) {
			/* c8 ignore next */
			const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
			writeVarUint(encoder, written);
			for (let i = 0; i < written; i++) write(encoder, _strBuffer[i]);
		} else writeVarUint8Array(encoder, encodeUtf8(str));
	};
	/**
	* Write a variable length string.
	*
	* @function
	* @param {Encoder} encoder
	* @param {String} str The string that is to be encoded.
	*/
	const _writeVarStringPolyfill = (encoder, str) => {
		const encodedString = unescape(encodeURIComponent(str));
		const len = encodedString.length;
		writeVarUint(encoder, len);
		for (let i = 0; i < len; i++) write(encoder, encodedString.codePointAt(i));
	};
	/**
	* Write a variable length string.
	*
	* @function
	* @param {Encoder} encoder
	* @param {String} str The string that is to be encoded.
	*/
	/* c8 ignore next */
	const writeVarString = utf8TextEncoder && utf8TextEncoder.encodeInto ? _writeVarStringNative : _writeVarStringPolyfill;
	/**
	* Write the content of another Encoder.
	*
	* @TODO: can be improved!
	*        - Note: Should consider that when appending a lot of small Encoders, we should rather clone than referencing the old structure.
	*                Encoders start with a rather big initial buffer.
	*
	* @function
	* @param {Encoder} encoder The enUint8Arr
	* @param {Encoder} append The BinaryEncoder to be written.
	*/
	const writeBinaryEncoder = (encoder, append) => writeUint8Array(encoder, toUint8Array(append));
	/**
	* Append fixed-length Uint8Array to the encoder.
	*
	* @function
	* @param {Encoder} encoder
	* @param {Uint8Array} uint8Array
	*/
	const writeUint8Array = (encoder, uint8Array) => {
		const bufferLen = encoder.cbuf.length;
		const cpos = encoder.cpos;
		const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
		const rightCopyLen = uint8Array.length - leftCopyLen;
		encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
		encoder.cpos += leftCopyLen;
		if (rightCopyLen > 0) {
			encoder.bufs.push(encoder.cbuf);
			encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
			encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
			encoder.cpos = rightCopyLen;
		}
	};
	/**
	* Append an Uint8Array to Encoder.
	*
	* @function
	* @param {Encoder} encoder
	* @param {Uint8Array} uint8Array
	*/
	const writeVarUint8Array = (encoder, uint8Array) => {
		writeVarUint(encoder, uint8Array.byteLength);
		writeUint8Array(encoder, uint8Array);
	};
	/**
	* Create an DataView of the next `len` bytes. Use it to write data after
	* calling this function.
	*
	* ```js
	* // write float32 using DataView
	* const dv = writeOnDataView(encoder, 4)
	* dv.setFloat32(0, 1.1)
	* // read float32 using DataView
	* const dv = readFromDataView(encoder, 4)
	* dv.getFloat32(0) // => 1.100000023841858 (leaving it to the reader to find out why this is the correct result)
	* ```
	*
	* @param {Encoder} encoder
	* @param {number} len
	* @return {DataView}
	*/
	const writeOnDataView = (encoder, len) => {
		verifyLen(encoder, len);
		const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
		encoder.cpos += len;
		return dview;
	};
	/**
	* @param {Encoder} encoder
	* @param {number} num
	*/
	const writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);
	/**
	* @param {Encoder} encoder
	* @param {number} num
	*/
	const writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);
	/**
	* @param {Encoder} encoder
	* @param {bigint} num
	*/
	const writeBigInt64 = (encoder, num) => writeOnDataView(encoder, 8).setBigInt64(0, num, false);
	const floatTestBed = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(4));
	/**
	* Check if a number can be encoded as a 32 bit float.
	*
	* @param {number} num
	* @return {boolean}
	*/
	const isFloat32 = (num) => {
		floatTestBed.setFloat32(0, num);
		return floatTestBed.getFloat32(0) === num;
	};
	/**
	* @typedef {Array<AnyEncodable>} AnyEncodableArray
	*/
	/**
	* @typedef {undefined|null|number|bigint|boolean|string|{[k:string]:AnyEncodable}|AnyEncodableArray|Uint8Array} AnyEncodable
	*/
	/**
	* Encode data with efficient binary format.
	*
	* Differences to JSON:
	* • Transforms data to a binary format (not to a string)
	* • Encodes undefined, NaN, and ArrayBuffer (these can't be represented in JSON)
	* • Numbers are efficiently encoded either as a variable length integer, as a
	*   32 bit float, as a 64 bit float, or as a 64 bit bigint.
	*
	* Encoding table:
	*
	* | Data Type           | Prefix   | Encoding Method    | Comment |
	* | ------------------- | -------- | ------------------ | ------- |
	* | undefined           | 127      |                    | Functions, symbol, and everything that cannot be identified is encoded as undefined |
	* | null                | 126      |                    | |
	* | integer             | 125      | writeVarInt        | Only encodes 32 bit signed integers |
	* | float32             | 124      | writeFloat32       | |
	* | float64             | 123      | writeFloat64       | |
	* | bigint              | 122      | writeBigInt64      | |
	* | boolean (false)     | 121      |                    | True and false are different data types so we save the following byte |
	* | boolean (true)      | 120      |                    | - 0b01111000 so the last bit determines whether true or false |
	* | string              | 119      | writeVarString     | |
	* | object<string,any>  | 118      | custom             | Writes {length} then {length} key-value pairs |
	* | array<any>          | 117      | custom             | Writes {length} then {length} json values |
	* | Uint8Array          | 116      | writeVarUint8Array | We use Uint8Array for any kind of binary data |
	*
	* Reasons for the decreasing prefix:
	* We need the first bit for extendability (later we may want to encode the
	* prefix with writeVarUint). The remaining 7 bits are divided as follows:
	* [0-30]   the beginning of the data range is used for custom purposes
	*          (defined by the function that uses this library)
	* [31-127] the end of the data range is used for data encoding by
	*          lib0/encoding.js
	*
	* @param {Encoder} encoder
	* @param {AnyEncodable} data
	*/
	const writeAny = (encoder, data) => {
		switch (typeof data) {
			case "string":
				write(encoder, 119);
				writeVarString(encoder, data);
				break;
			case "number":
				if (isInteger(data) && abs(data) <= 2147483647) {
					write(encoder, 125);
					writeVarInt(encoder, data);
				} else if (isFloat32(data)) {
					write(encoder, 124);
					writeFloat32(encoder, data);
				} else {
					write(encoder, 123);
					writeFloat64(encoder, data);
				}
				break;
			case "bigint":
				write(encoder, 122);
				writeBigInt64(encoder, data);
				break;
			case "object":
				if (data === null) write(encoder, 126);
				else if (isArray(data)) {
					write(encoder, 117);
					writeVarUint(encoder, data.length);
					for (let i = 0; i < data.length; i++) writeAny(encoder, data[i]);
				} else if (data instanceof Uint8Array) {
					write(encoder, 116);
					writeVarUint8Array(encoder, data);
				} else {
					write(encoder, 118);
					const keys = Object.keys(data);
					writeVarUint(encoder, keys.length);
					for (let i = 0; i < keys.length; i++) {
						const key = keys[i];
						writeVarString(encoder, key);
						writeAny(encoder, data[key]);
					}
				}
				break;
			case "boolean":
				write(encoder, data ? 120 : 121);
				break;
			default: write(encoder, 127);
		}
	};
	/**
	* Now come a few stateful encoder that have their own classes.
	*/
	/**
	* Basic Run Length Encoder - a basic compression implementation.
	*
	* Encodes [1,1,1,7] to [1,3,7,1] (3 times 1, 1 time 7). This encoder might do more harm than good if there are a lot of values that are not repeated.
	*
	* It was originally used for image compression. Cool .. article http://csbruce.com/cbm/transactor/pdfs/trans_v7_i06.pdf
	*
	* @note T must not be null!
	*
	* @template T
	*/
	var RleEncoder = class extends Encoder {
		/**
		* @param {function(Encoder, T):void} writer
		*/
		constructor(writer) {
			super();
			/**
			* The writer
			*/
			this.w = writer;
			/**
			* Current state
			* @type {T|null}
			*/
			this.s = null;
			this.count = 0;
		}
		/**
		* @param {T} v
		*/
		write(v) {
			if (this.s === v) this.count++;
			else {
				if (this.count > 0) writeVarUint(this, this.count - 1);
				this.count = 1;
				this.w(this, v);
				this.s = v;
			}
		}
	};
	/**
	* @param {UintOptRleEncoder} encoder
	*/
	const flushUintOptRleEncoder = (encoder) => {
		if (encoder.count > 0) {
			writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
			if (encoder.count > 1) writeVarUint(encoder.encoder, encoder.count - 2);
		}
	};
	/**
	* Optimized Rle encoder that does not suffer from the mentioned problem of the basic Rle encoder.
	*
	* Internally uses VarInt encoder to write unsigned integers. If the input occurs multiple times, we write
	* write it as a negative number. The UintOptRleDecoder then understands that it needs to read a count.
	*
	* Encodes [1,2,3,3,3] as [1,2,-3,3] (once 1, once 2, three times 3)
	*/
	var UintOptRleEncoder = class {
		constructor() {
			this.encoder = new Encoder();
			/**
			* @type {number}
			*/
			this.s = 0;
			this.count = 0;
		}
		/**
		* @param {number} v
		*/
		write(v) {
			if (this.s === v) this.count++;
			else {
				flushUintOptRleEncoder(this);
				this.count = 1;
				this.s = v;
			}
		}
		/**
		* Flush the encoded state and transform this to a Uint8Array.
		*
		* Note that this should only be called once.
		*/
		toUint8Array() {
			flushUintOptRleEncoder(this);
			return toUint8Array(this.encoder);
		}
	};
	/**
	* @param {IntDiffOptRleEncoder} encoder
	*/
	const flushIntDiffOptRleEncoder = (encoder) => {
		if (encoder.count > 0) {
			const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1);
			writeVarInt(encoder.encoder, encodedDiff);
			if (encoder.count > 1) writeVarUint(encoder.encoder, encoder.count - 2);
		}
	};
	/**
	* A combination of the IntDiffEncoder and the UintOptRleEncoder.
	*
	* The count approach is similar to the UintDiffOptRleEncoder, but instead of using the negative bitflag, it encodes
	* in the LSB whether a count is to be read. Therefore this Encoder only supports 31 bit integers!
	*
	* Encodes [1, 2, 3, 2] as [3, 1, 6, -1] (more specifically [(1 << 1) | 1, (3 << 0) | 0, -1])
	*
	* Internally uses variable length encoding. Contrary to normal UintVar encoding, the first byte contains:
	* * 1 bit that denotes whether the next value is a count (LSB)
	* * 1 bit that denotes whether this value is negative (MSB - 1)
	* * 1 bit that denotes whether to continue reading the variable length integer (MSB)
	*
	* Therefore, only five bits remain to encode diff ranges.
	*
	* Use this Encoder only when appropriate. In most cases, this is probably a bad idea.
	*/
	var IntDiffOptRleEncoder = class {
		constructor() {
			this.encoder = new Encoder();
			/**
			* @type {number}
			*/
			this.s = 0;
			this.count = 0;
			this.diff = 0;
		}
		/**
		* @param {number} v
		*/
		write(v) {
			if (this.diff === v - this.s) {
				this.s = v;
				this.count++;
			} else {
				flushIntDiffOptRleEncoder(this);
				this.count = 1;
				this.diff = v - this.s;
				this.s = v;
			}
		}
		/**
		* Flush the encoded state and transform this to a Uint8Array.
		*
		* Note that this should only be called once.
		*/
		toUint8Array() {
			flushIntDiffOptRleEncoder(this);
			return toUint8Array(this.encoder);
		}
	};
	/**
	* Optimized String Encoder.
	*
	* Encoding many small strings in a simple Encoder is not very efficient. The function call to decode a string takes some time and creates references that must be eventually deleted.
	* In practice, when decoding several million small strings, the GC will kick in more and more often to collect orphaned string objects (or maybe there is another reason?).
	*
	* This string encoder solves the above problem. All strings are concatenated and written as a single string using a single encoding call.
	*
	* The lengths are encoded using a UintOptRleEncoder.
	*/
	var StringEncoder = class {
		constructor() {
			/**
			* @type {Array<string>}
			*/
			this.sarr = [];
			this.s = "";
			this.lensE = new UintOptRleEncoder();
		}
		/**
		* @param {string} string
		*/
		write(string) {
			this.s += string;
			if (this.s.length > 19) {
				this.sarr.push(this.s);
				this.s = "";
			}
			this.lensE.write(string.length);
		}
		toUint8Array() {
			const encoder = new Encoder();
			this.sarr.push(this.s);
			this.s = "";
			writeVarString(encoder, this.sarr.join(""));
			writeUint8Array(encoder, this.lensE.toUint8Array());
			return toUint8Array(encoder);
		}
	};

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/error.js
/**
	* Error helpers.
	*
	* @module error
	*/
	/**
	* @param {string} s
	* @return {Error}
	*/
	/* c8 ignore next */
	const create$5 = (s) => new Error(s);
	/**
	* @throws {Error}
	* @return {never}
	*/
	/* c8 ignore next 3 */
	const methodUnimplemented = () => {
		throw create$5("Method unimplemented");
	};
	/**
	* @throws {Error}
	* @return {never}
	*/
	/* c8 ignore next 3 */
	const unexpectedCase = () => {
		throw create$5("Unexpected case");
	};

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/decoding.js
/**
	* Efficient schema-less binary decoding with support for variable length encoding.
	*
	* Use [lib0/decoding] with [lib0/encoding]. Every encoding function has a corresponding decoding function.
	*
	* Encodes numbers in little-endian order (least to most significant byte order)
	* and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
	* which is also used in Protocol Buffers.
	*
	* ```js
	* // encoding step
	* const encoder = encoding.createEncoder()
	* encoding.writeVarUint(encoder, 256)
	* encoding.writeVarString(encoder, 'Hello world!')
	* const buf = encoding.toUint8Array(encoder)
	* ```
	*
	* ```js
	* // decoding step
	* const decoder = decoding.createDecoder(buf)
	* decoding.readVarUint(decoder) // => 256
	* decoding.readVarString(decoder) // => 'Hello world!'
	* decoding.hasContent(decoder) // => false - all data is read
	* ```
	*
	* @module decoding
	*/
	const errorUnexpectedEndOfArray = create$5("Unexpected end of array");
	const errorIntegerOutOfRange = create$5("Integer out of Range");
	/**
	* A Decoder handles the decoding of an Uint8Array.
	* @template {ArrayBufferLike} [Buf=ArrayBufferLike]
	*/
	var Decoder = class {
		/**
		* @param {Uint8Array<Buf>} uint8Array Binary data to decode
		*/
		constructor(uint8Array) {
			/**
			* Decoding target.
			*
			* @type {Uint8Array<Buf>}
			*/
			this.arr = uint8Array;
			/**
			* Current decoding position.
			*
			* @type {number}
			*/
			this.pos = 0;
		}
	};
	/**
	* @function
	* @template {ArrayBufferLike} Buf
	* @param {Uint8Array<Buf>} uint8Array
	* @return {Decoder<Buf>}
	*/
	const createDecoder = (uint8Array) => new Decoder(uint8Array);
	/**
	* @function
	* @param {Decoder} decoder
	* @return {boolean}
	*/
	const hasContent = (decoder) => decoder.pos !== decoder.arr.length;
	/**
	* Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
	*
	* Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
	*            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
	*
	* @function
	* @template {ArrayBufferLike} Buf
	* @param {Decoder<Buf>} decoder The decoder instance
	* @param {number} len The length of bytes to read
	* @return {Uint8Array<Buf>}
	*/
	const readUint8Array = (decoder, len) => {
		const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
		decoder.pos += len;
		return view;
	};
	/**
	* Read variable length Uint8Array.
	*
	* Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
	*            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
	*
	* @function
	* @template {ArrayBufferLike} Buf
	* @param {Decoder<Buf>} decoder
	* @return {Uint8Array<Buf>}
	*/
	const readVarUint8Array = (decoder) => readUint8Array(decoder, readVarUint(decoder));
	/**
	* Read one byte as unsigned integer.
	* @function
	* @param {Decoder} decoder The decoder instance
	* @return {number} Unsigned 8-bit integer
	*/
	const readUint8 = (decoder) => decoder.arr[decoder.pos++];
	/**
	* Read unsigned integer (32bit) with variable length.
	* 1/8th of the storage is used as encoding overhead.
	*  * numbers < 2^7 is stored in one bytlength
	*  * numbers < 2^14 is stored in two bylength
	*
	* @function
	* @param {Decoder} decoder
	* @return {number} An unsigned integer.length
	*/
	const readVarUint = (decoder) => {
		let num = 0;
		let mult = 1;
		const len = decoder.arr.length;
		while (decoder.pos < len) {
			const r = decoder.arr[decoder.pos++];
			num = num + (r & 127) * mult;
			mult *= 128;
			if (r < 128) return num;
			/* c8 ignore start */
			if (num > MAX_SAFE_INTEGER) throw errorIntegerOutOfRange;
		}
		throw errorUnexpectedEndOfArray;
	};
	/**
	* Read signed integer (32bit) with variable length.
	* 1/8th of the storage is used as encoding overhead.
	*  * numbers < 2^7 is stored in one bytlength
	*  * numbers < 2^14 is stored in two bylength
	* @todo This should probably create the inverse ~num if number is negative - but this would be a breaking change.
	*
	* @function
	* @param {Decoder} decoder
	* @return {number} An unsigned integer.length
	*/
	const readVarInt = (decoder) => {
		let r = decoder.arr[decoder.pos++];
		let num = r & 63;
		let mult = 64;
		const sign = (r & 64) > 0 ? -1 : 1;
		if ((r & 128) === 0) return sign * num;
		const len = decoder.arr.length;
		while (decoder.pos < len) {
			r = decoder.arr[decoder.pos++];
			num = num + (r & 127) * mult;
			mult *= 128;
			if (r < 128) return sign * num;
			/* c8 ignore start */
			if (num > MAX_SAFE_INTEGER) throw errorIntegerOutOfRange;
		}
		throw errorUnexpectedEndOfArray;
	};
	/**
	* We don't test this function anymore as we use native decoding/encoding by default now.
	* Better not modify this anymore..
	*
	* Transforming utf8 to a string is pretty expensive. The code performs 10x better
	* when String.fromCodePoint is fed with all characters as arguments.
	* But most environments have a maximum number of arguments per functions.
	* For effiency reasons we apply a maximum of 10000 characters at once.
	*
	* @function
	* @param {Decoder} decoder
	* @return {String} The read String.
	*/
	/* c8 ignore start */
	const _readVarStringPolyfill = (decoder) => {
		let remainingLen = readVarUint(decoder);
		if (remainingLen === 0) return "";
		else {
			let encodedString = String.fromCodePoint(readUint8(decoder));
			if (--remainingLen < 100) while (remainingLen--) encodedString += String.fromCodePoint(readUint8(decoder));
			else while (remainingLen > 0) {
				const nextLen = remainingLen < 1e4 ? remainingLen : 1e4;
				const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
				decoder.pos += nextLen;
				encodedString += String.fromCodePoint.apply(null, bytes);
				remainingLen -= nextLen;
			}
			return decodeURIComponent(escape(encodedString));
		}
	};
	/* c8 ignore stop */
	/**
	* @function
	* @param {Decoder} decoder
	* @return {String} The read String
	*/
	const _readVarStringNative = (decoder) => utf8TextDecoder.decode(readVarUint8Array(decoder));
	/**
	* Read string of variable length
	* * varUint is used to store the length of the string
	*
	* @function
	* @param {Decoder} decoder
	* @return {String} The read String
	*
	*/
	/* c8 ignore next */
	const readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;
	/**
	* @param {Decoder} decoder
	* @param {number} len
	* @return {DataView}
	*/
	const readFromDataView = (decoder, len) => {
		const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
		decoder.pos += len;
		return dv;
	};
	/**
	* @param {Decoder} decoder
	*/
	const readFloat32 = (decoder) => readFromDataView(decoder, 4).getFloat32(0, false);
	/**
	* @param {Decoder} decoder
	*/
	const readFloat64 = (decoder) => readFromDataView(decoder, 8).getFloat64(0, false);
	/**
	* @param {Decoder} decoder
	*/
	const readBigInt64 = (decoder) => readFromDataView(decoder, 8).getBigInt64(0, false);
	/**
	* @type {Array<function(Decoder):any>}
	*/
	const readAnyLookupTable = [
		(decoder) => void 0,
		(decoder) => null,
		readVarInt,
		readFloat32,
		readFloat64,
		readBigInt64,
		(decoder) => false,
		(decoder) => true,
		readVarString,
		(decoder) => {
			const len = readVarUint(decoder);
			/**
			* @type {Object<string,any>}
			*/
			const obj = {};
			for (let i = 0; i < len; i++) {
				const key = readVarString(decoder);
				obj[key] = readAny(decoder);
			}
			return obj;
		},
		(decoder) => {
			const len = readVarUint(decoder);
			const arr = [];
			for (let i = 0; i < len; i++) arr.push(readAny(decoder));
			return arr;
		},
		readVarUint8Array
	];
	/**
	* @param {Decoder} decoder
	*/
	const readAny = (decoder) => readAnyLookupTable[127 - readUint8(decoder)](decoder);
	/**
	* T must not be null.
	*
	* @template T
	*/
	var RleDecoder = class extends Decoder {
		/**
		* @param {Uint8Array} uint8Array
		* @param {function(Decoder):T} reader
		*/
		constructor(uint8Array, reader) {
			super(uint8Array);
			/**
			* The reader
			*/
			this.reader = reader;
			/**
			* Current state
			* @type {T|null}
			*/
			this.s = null;
			this.count = 0;
		}
		read() {
			if (this.count === 0) {
				this.s = this.reader(this);
				if (hasContent(this)) this.count = readVarUint(this) + 1;
				else this.count = -1;
			}
			this.count--;
			return this.s;
		}
	};
	var UintOptRleDecoder = class extends Decoder {
		/**
		* @param {Uint8Array} uint8Array
		*/
		constructor(uint8Array) {
			super(uint8Array);
			/**
			* @type {number}
			*/
			this.s = 0;
			this.count = 0;
		}
		read() {
			if (this.count === 0) {
				this.s = readVarInt(this);
				const isNegative = isNegativeZero(this.s);
				this.count = 1;
				if (isNegative) {
					this.s = -this.s;
					this.count = readVarUint(this) + 2;
				}
			}
			this.count--;
			return this.s;
		}
	};
	var IntDiffOptRleDecoder = class extends Decoder {
		/**
		* @param {Uint8Array} uint8Array
		*/
		constructor(uint8Array) {
			super(uint8Array);
			/**
			* @type {number}
			*/
			this.s = 0;
			this.count = 0;
			this.diff = 0;
		}
		/**
		* @return {number}
		*/
		read() {
			if (this.count === 0) {
				const diff = readVarInt(this);
				const hasCount = diff & 1;
				this.diff = floor(diff / 2);
				this.count = 1;
				if (hasCount) this.count = readVarUint(this) + 2;
			}
			this.s += this.diff;
			this.count--;
			return this.s;
		}
	};
	var StringDecoder = class {
		/**
		* @param {Uint8Array} uint8Array
		*/
		constructor(uint8Array) {
			this.decoder = new UintOptRleDecoder(uint8Array);
			this.str = readVarString(this.decoder);
			/**
			* @type {number}
			*/
			this.spos = 0;
		}
		/**
		* @return {string}
		*/
		read() {
			const end = this.spos + this.decoder.read();
			const res = this.str.slice(this.spos, end);
			this.spos = end;
			return res;
		}
	};

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/webcrypto.js
	const subtle = crypto.subtle;
	const getRandomValues = crypto.getRandomValues.bind(crypto);

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/random.js
	const uint32 = () => getRandomValues(/* @__PURE__ */ new Uint32Array(1))[0];
	const uuidv4Template = "10000000-1000-4000-8000-100000000000";
	/**
	* @return {string}
	*/
	const uuidv4 = () => uuidv4Template.replace(
		/[018]/g,
		/** @param {number} c */
		(c) => (c ^ uint32() & 15 >> c / 4).toString(16)
	);

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/time.js
/**
	* Return current unix time.
	*
	* @return {number}
	*/
	const getUnixTime = Date.now;

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/promise.js
/**
	* @template T
	* @callback PromiseResolve
	* @param {T|PromiseLike<T>} [result]
	*/
	/**
	* @template T
	* @param {function(PromiseResolve<T>,function(Error):void):any} f
	* @return {Promise<T>}
	*/
	const create$4 = (f) => new Promise(f);
	/**
	* `Promise.all` wait for all promises in the array to resolve and return the result
	* @template {unknown[] | []} PS
	*
	* @param {PS} ps
	* @return {Promise<{ -readonly [P in keyof PS]: Awaited<PS[P]> }>}
	*/
	const all = Promise.all.bind(Promise);

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/conditions.js
/**
	* Often used conditions.
	*
	* @module conditions
	*/
	/**
	* @template T
	* @param {T|null|undefined} v
	* @return {T|null}
	*/
	/* c8 ignore next */
	const undefinedToNull = (v) => v === void 0 ? null : v;

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/storage.js
/**
	* Isomorphic variable storage.
	*
	* Uses LocalStorage in the browser and falls back to in-memory storage.
	*
	* @module storage
	*/
	/* c8 ignore start */
	var VarStoragePolyfill = class {
		constructor() {
			this.map = /* @__PURE__ */ new Map();
		}
		/**
		* @param {string} key
		* @param {any} newValue
		*/
		setItem(key, newValue) {
			this.map.set(key, newValue);
		}
		/**
		* @param {string} key
		*/
		getItem(key) {
			return this.map.get(key);
		}
	};
	/* c8 ignore stop */
	/**
	* @type {any}
	*/
	let _localStorage = new VarStoragePolyfill();
	let usePolyfill = true;
	/* c8 ignore start */
	try {
		if (typeof localStorage !== "undefined" && localStorage) {
			_localStorage = localStorage;
			usePolyfill = false;
		}
	} catch (e) {}
	/* c8 ignore stop */
	/**
	* This is basically localStorage in browser, or a polyfill in nodejs
	*/
	/* c8 ignore next */
	const varStorage = _localStorage;

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/trait/equality.js
	const EqualityTraitSymbol = Symbol("Equality");
	/**
	* @typedef {{ [EqualityTraitSymbol]:(other:EqualityTrait)=>boolean }} EqualityTrait
	*/
	/**
	*
	* Utility function to compare any two objects.
	*
	* Note that it is expected that the first parameter is more specific than the latter one.
	*
	* @example js
	*     class X { [traits.EqualityTraitSymbol] (other) { return other === this }  }
	*     class X2 { [traits.EqualityTraitSymbol] (other) { return other === this }, x2 () { return 2 }  }
	*     // this is fine
	*     traits.equals(new X2(), new X())
	*     // this is not, because the left type is less specific than the right one
	*     traits.equals(new X(), new X2())
	*
	* @template {EqualityTrait} T
	* @param {NoInfer<T>} a
	* @param {T} b
	* @return {boolean}
	*/
	const equals = (a, b) => a === b || !!a?.[EqualityTraitSymbol]?.(b) || false;

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/object.js
/**
	* @param {any} o
	* @return {o is { [k:string]:any }}
	*/
	const isObject$1 = (o) => typeof o === "object";
	/**
	* Object.assign
	*/
	const assign = Object.assign;
	/**
	* @param {Object<string,any>} obj
	*/
	const keys = Object.keys;
	/**
	* @template V
	* @param {{[k:string]:V}} obj
	* @param {function(V,string):any} f
	*/
	const forEach = (obj, f) => {
		for (const key in obj) f(obj[key], key);
	};
	/**
	* @param {Object<string,any>} obj
	* @return {number}
	*/
	const size = (obj) => keys(obj).length;
	/**
	* @param {Object|null|undefined} obj
	*/
	const isEmpty = (obj) => {
		for (const _k in obj) return false;
		return true;
	};
	/**
	* @template {{ [key:string|number|symbol]: any }} T
	* @param {T} obj
	* @param {(v:T[keyof T],k:keyof T)=>boolean} f
	* @return {boolean}
	*/
	const every = (obj, f) => {
		for (const key in obj) if (!f(obj[key], key)) return false;
		return true;
	};
	/**
	* Calls `Object.prototype.hasOwnProperty`.
	*
	* @param {any} obj
	* @param {string|number|symbol} key
	* @return {boolean}
	*/
	const hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
	/**
	* @param {Object<string,any>} a
	* @param {Object<string,any>} b
	* @return {boolean}
	*/
	const equalFlat = (a, b) => a === b || size(a) === size(b) && every(a, (val, key) => (val !== void 0 || hasProperty(b, key)) && equals(b[key], val));
	/**
	* Make an object immutable. This hurts performance and is usually not needed if you perform good
	* coding practices.
	*/
	const freeze = Object.freeze;
	/**
	* Make an object and all its children immutable.
	* This *really* hurts performance and is usually not needed if you perform good coding practices.
	*
	* @template {any} T
	* @param {T} o
	* @return {Readonly<T>}
	*/
	const deepFreeze = (o) => {
		for (const key in o) {
			const c = o[key];
			if (typeof c === "object" || typeof c === "function") deepFreeze(o[key]);
		}
		return freeze(o);
	};

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/function.js
/**
	* Calls all functions in `fs` with args. Only throws after all functions were called.
	*
	* @param {Array<function>} fs
	* @param {Array<any>} args
	*/
	const callAll = (fs, args, i = 0) => {
		try {
			for (; i < fs.length; i++) fs[i](...args);
		} finally {
			if (i < fs.length) callAll(fs, args, i + 1);
		}
	};
	/**
	* @template A
	*
	* @param {A} a
	* @return {A}
	*/
	const id = (a) => a;
	/* c8 ignore start */
	/**
	* @param {any} a
	* @param {any} b
	* @return {boolean}
	*/
	const equalityDeep = (a, b) => {
		if (a === b) return true;
		if (a == null || b == null || a.constructor !== b.constructor && (a.constructor || Object) !== (b.constructor || Object)) return false;
		if (a[EqualityTraitSymbol] != null) return a[EqualityTraitSymbol](b);
		switch (a.constructor) {
			case ArrayBuffer:
				a = new Uint8Array(a);
				b = new Uint8Array(b);
			case Uint8Array:
				if (a.byteLength !== b.byteLength) return false;
				for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
				break;
			case Set:
				if (a.size !== b.size) return false;
				for (const value of a) if (!b.has(value)) return false;
				break;
			case Map:
				if (a.size !== b.size) return false;
				for (const key of a.keys()) if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) return false;
				break;
			case void 0:
			case Object:
				if (size(a) !== size(b)) return false;
				for (const key in a) if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) return false;
				break;
			case Array:
				if (a.length !== b.length) return false;
				for (let i = 0; i < a.length; i++) if (!equalityDeep(a[i], b[i])) return false;
				break;
			default: return false;
		}
		return true;
	};
	/**
	* @template V
	* @template {V} OPTS
	*
	* @param {V} value
	* @param {Array<OPTS>} options
	*/
	const isOneOf = (value, options) => options.includes(value);

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/environment.js
/**
	* Isomorphic module to work access the environment (query params, env variables).
	*
	* @module environment
	*/
	/* c8 ignore next 2 */
	const isNode = typeof process !== "undefined" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
	/* c8 ignore next */
	const isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && !isNode;
	/* c8 ignore next 3 */
	const isMac = typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;
	/**
	* @type {Map<string,string>}
	*/
	let params;
	const args = [];
	/* c8 ignore start */
	const computeParams = () => {
		if (params === void 0) {
			if (isNode) {
				params = create$7();
				const pargs = process.argv;
				let currParamName = null;
				for (let i = 0; i < pargs.length; i++) {
					const parg = pargs[i];
					if (parg[0] === "-") {
						if (currParamName !== null) params.set(currParamName, "");
						currParamName = parg;
					} else if (currParamName !== null) {
						params.set(currParamName, parg);
						currParamName = null;
					} else args.push(parg);
				}
				if (currParamName !== null) params.set(currParamName, "");
			} else if (typeof location === "object") {
				params = create$7();
				(location.search || "?").slice(1).split("&").forEach((kv) => {
					if (kv.length !== 0) {
						const [key, value] = kv.split("=");
						params.set(`--${fromCamelCase(key, "-")}`, value);
						params.set(`-${fromCamelCase(key, "-")}`, value);
					}
				});
			} else params = create$7();
		}
		return params;
	};
	/* c8 ignore stop */
	/**
	* @param {string} name
	* @return {boolean}
	*/
	/* c8 ignore next */
	const hasParam = (name) => computeParams().has(name);
	/**
	* @param {string} name
	* @return {string|null}
	*/
	/* c8 ignore next 4 */
	const getVariable = (name) => isNode ? undefinedToNull(process.env[name.toUpperCase().replaceAll("-", "_")]) : undefinedToNull(varStorage.getItem(name));
	/**
	* @param {string} name
	* @return {boolean}
	*/
	/* c8 ignore next 2 */
	const hasConf = (name) => hasParam("--" + name) || getVariable(name) !== null;
	/* c8 ignore next */
	const production = hasConf("production");
	/* c8 ignore next 2 */
	const forceColor = isNode && isOneOf(process.env.FORCE_COLOR, [
		"true",
		"1",
		"2"
	]);
	/* c8 ignore start */
	/**
	* Color is enabled by default if the terminal supports it.
	*
	* Explicitly enable color using `--color` parameter
	* Disable color using `--no-color` parameter or using `NO_COLOR=1` environment variable.
	* `FORCE_COLOR=1` enables color and takes precedence over all.
	*/
	const supportsColor = forceColor || !hasParam("--no-colors") && !hasConf("no-color") && (!isNode || process.stdout.isTTY) && (!isNode || hasParam("--color") || getVariable("COLORTERM") !== null || (getVariable("TERM") || "").includes("color"));
	/* c8 ignore stop */

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/buffer.js
/**
	* Utility functions to work with buffers (Uint8Array).
	*
	* @module buffer
	*/
	/**
	* @param {number} len
	*/
	const createUint8ArrayFromLen = (len) => new Uint8Array(len);
	/**
	* Create Uint8Array with initial content from buffer
	*
	* @param {ArrayBuffer} buffer
	* @param {number} byteOffset
	* @param {number} length
	*/
	const createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length) => new Uint8Array(buffer, byteOffset, length);
	/* c8 ignore start */
	/**
	* @param {Uint8Array} bytes
	* @return {string}
	*/
	const toBase64Browser = (bytes) => {
		let s = "";
		for (let i = 0; i < bytes.byteLength; i++) s += fromCharCode(bytes[i]);
		return btoa(s);
	};
	/* c8 ignore stop */
	/**
	* @param {Uint8Array} bytes
	* @return {string}
	*/
	const toBase64Node = (bytes) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64");
	/* c8 ignore start */
	/**
	* @param {string} s
	* @return {Uint8Array<ArrayBuffer>}
	*/
	const fromBase64Browser = (s) => {
		const a = atob(s);
		const bytes = createUint8ArrayFromLen(a.length);
		for (let i = 0; i < a.length; i++) bytes[i] = a.charCodeAt(i);
		return bytes;
	};
	/* c8 ignore stop */
	/**
	* @param {string} s
	*/
	const fromBase64Node = (s) => {
		const buf = Buffer.from(s, "base64");
		return createUint8ArrayViewFromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength);
	};
	/* c8 ignore next */
	const toBase64 = isBrowser ? toBase64Browser : toBase64Node;
	/* c8 ignore next */
	const fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;
	/**
	* Copy the content of an Uint8Array view to a new ArrayBuffer.
	*
	* @param {Uint8Array} uint8Array
	* @return {Uint8Array}
	*/
	const copyUint8Array = (uint8Array) => {
		const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
		newBuf.set(uint8Array);
		return newBuf;
	};

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/pair.js
/**
	* Working with value pairs.
	*
	* @module pair
	*/
	/**
	* @template L,R
	*/
	var Pair = class {
		/**
		* @param {L} left
		* @param {R} right
		*/
		constructor(left, right) {
			this.left = left;
			this.right = right;
		}
	};
	/**
	* @template L,R
	* @param {L} left
	* @param {R} right
	* @return {Pair<L,R>}
	*/
	const create$3 = (left, right) => new Pair(left, right);

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/prng.js
/**
	* Generates a single random bool.
	*
	* @param {PRNG} gen A random number generator.
	* @return {Boolean} A random boolean
	*/
	const bool = (gen) => gen.next() >= .5;
	/**
	* Generates a random integer with 53 bit resolution.
	*
	* @param {PRNG} gen A random number generator.
	* @param {Number} min The lower bound of the allowed return values (inclusive).
	* @param {Number} max The upper bound of the allowed return values (inclusive).
	* @return {Number} A random integer on [min, max]
	*/
	const int53 = (gen, min, max) => floor(gen.next() * (max + 1 - min) + min);
	/**
	* Generates a random integer with 32 bit resolution.
	*
	* @param {PRNG} gen A random number generator.
	* @param {Number} min The lower bound of the allowed return values (inclusive).
	* @param {Number} max The upper bound of the allowed return values (inclusive).
	* @return {Number} A random integer on [min, max]
	*/
	const int32 = (gen, min, max) => floor(gen.next() * (max + 1 - min) + min);
	/**
	* @deprecated
	* Optimized version of prng.int32. It has the same precision as prng.int32, but should be preferred when
	* openaring on smaller ranges.
	*
	* @param {PRNG} gen A random number generator.
	* @param {Number} min The lower bound of the allowed return values (inclusive).
	* @param {Number} max The upper bound of the allowed return values (inclusive). The max inclusive number is `binary.BITS31-1`
	* @return {Number} A random integer on [min, max]
	*/
	const int31 = (gen, min, max) => int32(gen, min, max);
	/**
	* @param {PRNG} gen
	* @return {string} A single letter (a-z)
	*/
	const letter = (gen) => fromCharCode(int31(gen, 97, 122));
	/**
	* @param {PRNG} gen
	* @param {number} [minLen=0]
	* @param {number} [maxLen=20]
	* @return {string} A random word (0-20 characters) without spaces consisting of letters (a-z)
	*/
	const word = (gen, minLen = 0, maxLen = 20) => {
		const len = int31(gen, minLen, maxLen);
		let str = "";
		for (let i = 0; i < len; i++) str += letter(gen);
		return str;
	};
	/**
	* Returns one element of a given array.
	*
	* @param {PRNG} gen A random number generator.
	* @param {Array<T>} array Non empty Array of possible values.
	* @return {T} One of the values of the supplied Array.
	* @template T
	*/
	const oneOf = (gen, array) => array[int31(gen, 0, array.length - 1)];
	/* c8 ignore stop */

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/schema.js
/**
	* @experimental WIP
	*
	* Simple & efficient schemas for your data.
	*/
	/**
	* @typedef {string|number|bigint|boolean|null|undefined|symbol} Primitive
	*/
	/**
	* @typedef {{ [k:string|number|symbol]: any }} AnyObject
	*/
	/**
	* @template T
	* @typedef {T extends Schema<infer X> ? X : T} Unwrap
	*/
	/**
	* @template T
	* @typedef {T extends Schema<infer X> ? X : T} TypeOf
	*/
	/**
	* @template {readonly unknown[]} T
	* @typedef {T extends readonly [Schema<infer First>, ...infer Rest] ? [First, ...UnwrapArray<Rest>] : [] } UnwrapArray
	*/
	/**
	* @template T
	* @typedef {T extends Schema<infer S> ? Schema<S> : never} CastToSchema
	*/
	/**
	* @template {unknown[]} Arr
	* @typedef {Arr extends [...unknown[], infer L] ? L : never} TupleLast
	*/
	/**
	* @template {unknown[]} Arr
	* @typedef {Arr extends [...infer Fs, unknown] ? Fs : never} TuplePop
	*/
	/**
	* @template {readonly unknown[]} T
	* @typedef {T extends []
	*   ? {}
	*   : T extends [infer First]
	*   ? First
	*   : T extends [infer First, ...infer Rest]
	*   ? First & Intersect<Rest>
	*   : never
	* } Intersect
	*/
	const schemaSymbol = Symbol("0schema");
	var ValidationError = class {
		constructor() {
			/**
			* Reverse errors
			* @type {Array<{ path: string?, expected: string, has: string, message: string? }>}
			*/
			this._rerrs = [];
		}
		/**
		* @param {string?} path
		* @param {string} expected
		* @param {string} has
		* @param {string?} message
		*/
		extend(path, expected, has, message = null) {
			this._rerrs.push({
				path,
				expected,
				has,
				message
			});
		}
		toString() {
			const s = [];
			for (let i = this._rerrs.length - 1; i > 0; i--) {
				const r = this._rerrs[i];
				/* c8 ignore next */
				s.push(repeat(" ", (this._rerrs.length - i) * 2) + `${r.path != null ? `[${r.path}] ` : ""}${r.has} doesn't match ${r.expected}. ${r.message}`);
			}
			return s.join("\n");
		}
	};
	/**
	* @param {any} a
	* @param {any} b
	* @return {boolean}
	*/
	const shapeExtends = (a, b) => {
		if (a === b) return true;
		if (a == null || b == null || a.constructor !== b.constructor) return false;
		if (a[EqualityTraitSymbol]) return equals(a, b);
		if (isArray(a)) return every$1(a, (aitem) => some(b, (bitem) => shapeExtends(aitem, bitem)));
		else if (isObject$1(a)) return every(a, (aitem, akey) => shapeExtends(aitem, b[akey]));
		/* c8 ignore next */
		return false;
	};
	/**
	* @template T
	* @implements {equalityTraits.EqualityTrait}
	*/
	var Schema = class {
		/**
		* If true, the more things are added to the shape the more objects this schema will accept (e.g.
		* union). By default, the more objects are added, the the fewer objects this schema will accept.
		* @protected
		*/
		static _dilutes = false;
		/**
		* @param {Schema<any>} other
		*/
		extends(other) {
			let [a, b] = [this.shape, other.shape];
			if (this.constructor._dilutes) [b, a] = [a, b];
			return shapeExtends(a, b);
		}
		/**
		* Overwrite this when necessary. By default, we only check the `shape` property which every shape
		* should have.
		* @param {Schema<any>} other
		*/
		equals(other) {
			return this.constructor === other.constructor && equalityDeep(this.shape, other.shape);
		}
		[schemaSymbol]() {
			return true;
		}
		/**
		* @param {object} other
		*/
		[EqualityTraitSymbol](other) {
			return this.equals(other);
		}
		/**
		* Use `schema.validate(obj)` with a typed parameter that is already of typed to be an instance of
		* Schema. Validate will check the structure of the parameter and return true iff the instance
		* really is an instance of Schema.
		*
		* @param {T} o
		* @return {boolean}
		*/
		validate(o) {
			return this.check(o);
		}
		/* c8 ignore start */
		/**
		* Similar to validate, but this method accepts untyped parameters.
		*
		* @param {any} _o
		* @param {ValidationError} [_err]
		* @return {_o is T}
		*/
		check(_o, _err) {
			methodUnimplemented();
		}
		/* c8 ignore stop */
		/**
		* @type {Schema<T?>}
		*/
		get nullable() {
			return $union(this, $null);
		}
		/**
		* @type {$Optional<Schema<T>>}
		*/
		get optional() {
			return new $Optional(this);
		}
		/**
		* Cast a variable to a specific type. Returns the casted value, or throws an exception otherwise.
		* Use this if you know that the type is of a specific type and you just want to convince the type
		* system.
		*
		* **Do not rely on these error messages!**
		* Performs an assertion check only if not in a production environment.
		*
		* @template OO
		* @param {OO} o
		* @return {Extract<OO, T> extends never ? T : (OO extends Array<never> ? T : Extract<OO,T>)}
		*/
		cast(o) {
			assert(o, this);
			return o;
		}
		/**
		* EXPECTO PATRONUM!! 🪄
		* This function protects against type errors. Though it may not work in the real world.
		*
		* "After all this time?"
		* "Always." - Snape, talking about type safety
		*
		* Ensures that a variable is a a specific type. Returns the value, or throws an exception if the assertion check failed.
		* Use this if you know that the type is of a specific type and you just want to convince the type
		* system.
		*
		* Can be useful when defining lambdas: `s.lambda(s.$number, s.$void).expect((n) => n + 1)`
		*
		* **Do not rely on these error messages!**
		* Performs an assertion check if not in a production environment.
		*
		* @param {T} o
		* @return {o extends T ? T : never}
		*/
		expect(o) {
			assert(o, this);
			return o;
		}
	};
	/**
	* @template {(new (...args:any[]) => any) | ((...args:any[]) => any)} Constr
	* @typedef {Constr extends ((...args:any[]) => infer T) ? T : (Constr extends (new (...args:any[]) => any) ? InstanceType<Constr> : never)} Instance
	*/
	/**
	* @template {(new (...args:any[]) => any) | ((...args:any[]) => any)} C
	* @extends {Schema<Instance<C>>}
	*/
	var $ConstructedBy = class extends Schema {
		/**
		* @param {C} c
		* @param {((o:Instance<C>)=>boolean)|null} check
		*/
		constructor(c, check) {
			super();
			this.shape = c;
			this._c = check;
		}
		/**
		* @param {any} o
		* @param {ValidationError} [err]
		* @return {o is C extends ((...args:any[]) => infer T) ? T : (C extends (new (...args:any[]) => any) ? InstanceType<C> : never)} o
		*/
		check(o, err = void 0) {
			const c = o?.constructor === this.shape && (this._c == null || this._c(o));
			/* c8 ignore next */
			!c && err?.extend(null, this.shape.name, o?.constructor.name, o?.constructor !== this.shape ? "Constructor match failed" : "Check failed");
			return c;
		}
	};
	/**
	* @template {(new (...args:any[]) => any) | ((...args:any[]) => any)} C
	* @param {C} c
	* @param {((o:Instance<C>) => boolean)|null} check
	* @return {CastToSchema<$ConstructedBy<C>>}
	*/
	const $constructedBy = (c, check = null) => new $ConstructedBy(c, check);
	const $$constructedBy = $constructedBy($ConstructedBy);
	/**
	* Check custom properties on any object. You may want to overwrite the generated Schema<any>.
	*
	* @extends {Schema<any>}
	*/
	var $Custom = class extends Schema {
		/**
		* @param {(o:any) => boolean} check
		*/
		constructor(check) {
			super();
			/**
			* @type {(o:any) => boolean}
			*/
			this.shape = check;
		}
		/**
		* @param {any} o
		* @param {ValidationError} err
		* @return {o is any}
		*/
		check(o, err) {
			const c = this.shape(o);
			/* c8 ignore next */
			!c && err?.extend(null, "custom prop", o?.constructor.name, "failed to check custom prop");
			return c;
		}
	};
	/**
	* @param {(o:any) => boolean} check
	* @return {Schema<any>}
	*/
	const $custom = (check) => new $Custom(check);
	const $$custom = $constructedBy($Custom);
	/**
	* @template {Primitive} T
	* @extends {Schema<T>}
	*/
	var $Literal = class extends Schema {
		/**
		* @param {Array<T>} literals
		*/
		constructor(literals) {
			super();
			this.shape = literals;
		}
		/**
		*
		* @param {any} o
		* @param {ValidationError} [err]
		* @return {o is T}
		*/
		check(o, err) {
			const c = this.shape.some((a) => a === o);
			/* c8 ignore next */
			!c && err?.extend(null, this.shape.join(" | "), o.toString());
			return c;
		}
	};
	/**
	* @template {Primitive[]} T
	* @param {T} literals
	* @return {CastToSchema<$Literal<T[number]>>}
	*/
	const $literal = (...literals) => new $Literal(literals);
	const $$literal = $constructedBy($Literal);
	/**
	* @template {Array<string|Schema<string|number>>} Ts
	* @typedef {Ts extends [] ? `` : (Ts extends [infer T] ? (Unwrap<T> extends (string|number) ? Unwrap<T> : never) : (Ts extends [infer T1, ...infer Rest] ? `${Unwrap<T1> extends (string|number) ? Unwrap<T1> : never}${Rest extends Array<string|Schema<string|number>> ? CastStringTemplateArgsToTemplate<Rest> : never}` : never))} CastStringTemplateArgsToTemplate
	*/
	/**
	* @param {string} str
	* @return {string}
	*/
	const _regexEscape = RegExp.escape || ((str) => str.replace(/[().|&,$^[\]]/g, (s) => "\\" + s));
	/**
	* @param {string|Schema<any>} s
	* @return {string[]}
	*/
	const _schemaStringTemplateToRegex = (s) => {
		if ($string.check(s)) return [_regexEscape(s)];
		if ($$literal.check(s)) return s.shape.map((v) => v + "");
		if ($$number.check(s)) return ["[+-]?\\d+.?\\d*"];
		if ($$string.check(s)) return [".*"];
		if ($$union.check(s)) return s.shape.map(_schemaStringTemplateToRegex).flat(1);
		/* c8 ignore next 2 */
		unexpectedCase();
	};
	/**
	* @template {Array<string|Schema<string|number>>} T
	* @extends {Schema<CastStringTemplateArgsToTemplate<T>>}
	*/
	var $StringTemplate = class extends Schema {
		/**
		* @param {T} shape
		*/
		constructor(shape) {
			super();
			this.shape = shape;
			this._r = new RegExp("^" + shape.map(_schemaStringTemplateToRegex).map((opts) => `(${opts.join("|")})`).join("") + "$");
		}
		/**
		* @param {any} o
		* @param {ValidationError} [err]
		* @return {o is CastStringTemplateArgsToTemplate<T>}
		*/
		check(o, err) {
			const c = this._r.exec(o) != null;
			/* c8 ignore next */
			!c && err?.extend(null, this._r.toString(), o.toString(), "String doesn't match string template.");
			return c;
		}
	};
	const $$stringTemplate = $constructedBy($StringTemplate);
	const isOptionalSymbol = Symbol("optional");
	/**
	* @template {Schema<any>} S
	* @extends Schema<Unwrap<S>|undefined>
	*/
	var $Optional = class extends Schema {
		/**
		* @param {S} shape
		*/
		constructor(shape) {
			super();
			this.shape = shape;
		}
		/**
		* @param {any} o
		* @param {ValidationError} [err]
		* @return {o is (Unwrap<S>|undefined)}
		*/
		check(o, err) {
			const c = o === void 0 || this.shape.check(o);
			/* c8 ignore next */
			!c && err?.extend(null, "undefined (optional)", "()");
			return c;
		}
		get [isOptionalSymbol]() {
			return true;
		}
	};
	const $$optional = $constructedBy($Optional);
	/**
	* @extends Schema<never>
	*/
	var $Never = class extends Schema {
		/**
		* @param {any} _o
		* @param {ValidationError} [err]
		* @return {_o is never}
		*/
		check(_o, err) {
			/* c8 ignore next */
			err?.extend(null, "never", typeof _o);
			return false;
		}
	};
	/**
	* @type {Schema<never>}
	*/
	const $never = new $Never();
	const $$never = $constructedBy($Never);
	/**
	* @template {{ [key: string|symbol|number]: Schema<any> }} S
	* @typedef {{ [Key in keyof S as S[Key] extends $Optional<Schema<any>> ? Key : never]?: S[Key] extends $Optional<Schema<infer Type>> ? Type : never } & { [Key in keyof S as S[Key] extends $Optional<Schema<any>> ? never : Key]: S[Key] extends Schema<infer Type> ? Type : never }} $ObjectToType
	*/
	/**
	* @template {{[key:string|symbol|number]: Schema<any>}} S
	* @extends {Schema<$ObjectToType<S>>}
	*/
	var $Object = class $Object extends Schema {
		/**
		* @param {S} shape
		* @param {boolean} partial
		*/
		constructor(shape, partial = false) {
			super();
			/**
			* @type {S}
			*/
			this.shape = shape;
			this._isPartial = partial;
		}
		static _dilutes = true;
		/**
		* @type {Schema<Partial<$ObjectToType<S>>>}
		*/
		get partial() {
			return new $Object(this.shape, true);
		}
		/**
		* @param {any} o
		* @param {ValidationError} err
		* @return {o is $ObjectToType<S>}
		*/
		check(o, err) {
			if (o == null) {
				/* c8 ignore next */
				err?.extend(null, "object", "null");
				return false;
			}
			return every(this.shape, (vv, vk) => {
				const c = this._isPartial && !hasProperty(o, vk) || vv.check(o[vk], err);
				!c && err?.extend(vk.toString(), vv.toString(), typeof o[vk], "Object property does not match");
				return c;
			});
		}
	};
	/**
	* @template S
	* @typedef {Schema<{ [Key in keyof S as S[Key] extends $Optional<Schema<any>> ? Key : never]?: S[Key] extends $Optional<Schema<infer Type>> ? Type : never } & { [Key in keyof S as S[Key] extends $Optional<Schema<any>> ? never : Key]: S[Key] extends Schema<infer Type> ? Type : never }>} _ObjectDefToSchema
	*/
	/**
	* @template {{ [key:string|symbol|number]: Schema<any> }} S
	* @param {S} def
	* @return {_ObjectDefToSchema<S> extends Schema<infer S> ? Schema<{ [K in keyof S]: S[K] }> : never}
	*/
	const $object = (def) => new $Object(def);
	const $$object = $constructedBy($Object);
	/**
	* @type {Schema<{[key:string]: any}>}
	*/
	const $objectAny = $custom((o) => o != null && (o.constructor === Object || o.constructor == null));
	/**
	* @template {Schema<string|number|symbol>} Keys
	* @template {Schema<any>} Values
	* @extends {Schema<{ [key in Unwrap<Keys>]: Unwrap<Values> }>}
	*/
	var $Record = class extends Schema {
		/**
		* @param {Keys} keys
		* @param {Values} values
		*/
		constructor(keys, values) {
			super();
			this.shape = {
				keys,
				values
			};
		}
		/**
		* @param {any} o
		* @param {ValidationError} err
		* @return {o is { [key in Unwrap<Keys>]: Unwrap<Values> }}
		*/
		check(o, err) {
			return o != null && every(o, (vv, vk) => {
				const ck = this.shape.keys.check(vk, err);
				/* c8 ignore next */
				!ck && err?.extend(vk + "", "Record", typeof o, ck ? "Key doesn't match schema" : "Value doesn't match value");
				return ck && this.shape.values.check(vv, err);
			});
		}
	};
	/**
	* @template {Schema<string|number|symbol>} Keys
	* @template {Schema<any>} Values
	* @param {Keys} keys
	* @param {Values} values
	* @return {CastToSchema<$Record<Keys,Values>>}
	*/
	const $record = (keys, values) => new $Record(keys, values);
	const $$record = $constructedBy($Record);
	/**
	* @template {Schema<any>[]} S
	* @extends {Schema<{ [Key in keyof S]: S[Key] extends Schema<infer Type> ? Type : never }>}
	*/
	var $Tuple = class extends Schema {
		/**
		* @param {S} shape
		*/
		constructor(shape) {
			super();
			this.shape = shape;
		}
		/**
		* @param {any} o
		* @param {ValidationError} err
		* @return {o is { [K in keyof S]: S[K] extends Schema<infer Type> ? Type : never }}
		*/
		check(o, err) {
			return o != null && every(this.shape, (vv, vk) => {
				const c = vv.check(o[vk], err);
				/* c8 ignore next */
				!c && err?.extend(vk.toString(), "Tuple", typeof vv);
				return c;
			});
		}
	};
	/**
	* @template {Array<Schema<any>>} T
	* @param {T} def
	* @return {CastToSchema<$Tuple<T>>}
	*/
	const $tuple = (...def) => new $Tuple(def);
	const $$tuple = $constructedBy($Tuple);
	/**
	* @template {Schema<any>} S
	* @extends {Schema<Array<S extends Schema<infer T> ? T : never>>}
	*/
	var $Array = class extends Schema {
		/**
		* @param {Array<S>} v
		*/
		constructor(v) {
			super();
			/**
			* @type {Schema<S extends Schema<infer T> ? T : never>}
			*/
			this.shape = v.length === 1 ? v[0] : new $Union(v);
		}
		/**
		* @param {any} o
		* @param {ValidationError} [err]
		* @return {o is Array<S extends Schema<infer T> ? T : never>} o
		*/
		check(o, err) {
			const c = isArray(o) && every$1(o, (oi) => this.shape.check(oi));
			/* c8 ignore next */
			!c && err?.extend(null, "Array", "");
			return c;
		}
	};
	/**
	* @template {Array<Schema<any>>} T
	* @param {T} def
	* @return {Schema<Array<T extends Array<Schema<infer S>> ? S : never>>}
	*/
	const $array = (...def) => new $Array(def);
	const $$array = $constructedBy($Array);
	/**
	* @type {Schema<Array<any>>}
	*/
	const $arrayAny = $custom((o) => isArray(o));
	/**
	* @template T
	* @extends {Schema<T>}
	*/
	var $InstanceOf = class extends Schema {
		/**
		* @param {new (...args:any) => T} constructor
		* @param {((o:T) => boolean)|null} check
		*/
		constructor(constructor, check) {
			super();
			this.shape = constructor;
			this._c = check;
		}
		/**
		* @param {any} o
		* @param {ValidationError} err
		* @return {o is T}
		*/
		check(o, err) {
			const c = o instanceof this.shape && (this._c == null || this._c(o));
			/* c8 ignore next */
			!c && err?.extend(null, this.shape.name, o?.constructor.name);
			return c;
		}
	};
	/**
	* @template T
	* @param {new (...args:any) => T} c
	* @param {((o:T) => boolean)|null} check
	* @return {Schema<T>}
	*/
	const $instanceOf = (c, check = null) => new $InstanceOf(c, check);
	const $$instanceOf = $constructedBy($InstanceOf);
	const $$schema = $instanceOf(Schema);
	/**
	* @template {Schema<any>[]} Args
	* @typedef {(...args:UnwrapArray<TuplePop<Args>>)=>Unwrap<TupleLast<Args>>} _LArgsToLambdaDef
	*/
	/**
	* @template {Array<Schema<any>>} Args
	* @extends {Schema<_LArgsToLambdaDef<Args>>}
	*/
	var $Lambda = class extends Schema {
		/**
		* @param {Args} args
		*/
		constructor(args) {
			super();
			this.len = args.length - 1;
			this.args = $tuple(...args.slice(-1));
			this.res = args[this.len];
		}
		/**
		* @param {any} f
		* @param {ValidationError} err
		* @return {f is _LArgsToLambdaDef<Args>}
		*/
		check(f, err) {
			const c = f.constructor === Function && f.length <= this.len;
			/* c8 ignore next */
			!c && err?.extend(null, "function", typeof f);
			return c;
		}
	};
	const $$lambda = $constructedBy($Lambda);
	/**
	* @type {Schema<Function>}
	*/
	const $function = $custom((o) => typeof o === "function");
	/**
	* @template {Array<Schema<any>>} T
	* @extends {Schema<Intersect<UnwrapArray<T>>>}
	*/
	var $Intersection = class extends Schema {
		/**
		* @param {T} v
		*/
		constructor(v) {
			super();
			/**
			* @type {T}
			*/
			this.shape = v;
		}
		/**
		* @param {any} o
		* @param {ValidationError} [err]
		* @return {o is Intersect<UnwrapArray<T>>}
		*/
		check(o, err) {
			const c = every$1(this.shape, (check) => check.check(o, err));
			/* c8 ignore next */
			!c && err?.extend(null, "Intersectinon", typeof o);
			return c;
		}
	};
	const $$intersect = $constructedBy($Intersection, (o) => o.shape.length > 0);
	/**
	* @template S
	* @extends {Schema<S>}
	*/
	var $Union = class extends Schema {
		static _dilutes = true;
		/**
		* @param {Array<Schema<S>>} v
		*/
		constructor(v) {
			super();
			this.shape = v;
		}
		/**
		* @param {any} o
		* @param {ValidationError} [err]
		* @return {o is S}
		*/
		check(o, err) {
			const c = some(this.shape, (vv) => vv.check(o, err));
			err?.extend(null, "Union", typeof o);
			return c;
		}
	};
	/**
	* @template {Array<any>} T
	* @param {T} schemas
	* @return {CastToSchema<$Union<Unwrap<ReadSchema<T>>>>}
	*/
	const $union = (...schemas) => schemas.findIndex(($s) => $$union.check($s)) >= 0 ? $union(...schemas.map(($s) => $($s)).map(($s) => $$union.check($s) ? $s.shape : [$s]).flat(1)) : schemas.length === 1 ? schemas[0] : new $Union(schemas);
	const $$union = $constructedBy($Union);
	const _t = () => true;
	/**
	* @type {Schema<any>}
	*/
	const $any = $custom(_t);
	const $$any = $constructedBy($Custom, (o) => o.shape === _t);
	/**
	* @type {Schema<bigint>}
	*/
	const $bigint = $custom((o) => typeof o === "bigint");
	const $$bigint = $custom((o) => o === $bigint);
	/**
	* @type {Schema<symbol>}
	*/
	const $symbol = $custom((o) => typeof o === "symbol");
	const $$symbol = $custom((o) => o === $symbol);
	/**
	* @type {Schema<number>}
	*/
	const $number = $custom((o) => typeof o === "number");
	const $$number = $custom((o) => o === $number);
	/**
	* @type {Schema<string>}
	*/
	const $string = $custom((o) => typeof o === "string");
	const $$string = $custom((o) => o === $string);
	/**
	* @type {Schema<boolean>}
	*/
	const $boolean = $custom((o) => typeof o === "boolean");
	const $$boolean = $custom((o) => o === $boolean);
	/**
	* @type {Schema<undefined>}
	*/
	const $undefined = $literal(void 0);
	const $$undefined = $constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === void 0);
	/**
	* @type {Schema<void>}
	*/
	const $void = $literal(void 0);
	const $null = $literal(null);
	const $$null = $constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === null);
	const $uint8Array = $constructedBy(Uint8Array);
	const $$uint8Array = $constructedBy($ConstructedBy, (o) => o.shape === Uint8Array);
	/**
	* @type {Schema<Primitive>}
	*/
	const $primitive = $union($number, $string, $null, $undefined, $bigint, $boolean, $symbol);
	/**
	* @typedef {JSON[]} JSONArray
	*/
	/**
	* @typedef {Primitive|JSONArray|{ [key:string]:JSON }} JSON
	*/
	/**
	* @type {Schema<null|number|string|boolean|JSON[]|{[key:string]:JSON}>}
	*/
	const $json = (() => {
		const $jsonArr = $array($any);
		const $jsonRecord = $record($string, $any);
		const $json = $union($number, $string, $null, $boolean, $jsonArr, $jsonRecord);
		$jsonArr.shape = $json;
		$jsonRecord.shape.values = $json;
		return $json;
	})();
	/**
	* @template {any} IN
	* @typedef {IN extends Schema<any> ? IN
	*   : (IN extends string|number|boolean|null ? Schema<IN>
	*     : (IN extends new (...args:any[])=>any ? Schema<InstanceType<IN>>
	*       : (IN extends any[] ? Schema<{ [K in keyof IN]: Unwrap<ReadSchema<IN[K]>> }[number]>
	*       : (IN extends object ? (_ObjectDefToSchema<{[K in keyof IN]:ReadSchema<IN[K]>}> extends Schema<infer S> ? Schema<{ [K in keyof S]: S[K] }> : never)
	*         : never)
	*         )
	*       )
	*     )
	* } ReadSchemaOld
	*/
	/**
	* @template {any} IN
	* @typedef {[Extract<IN,Schema<any>>,Extract<IN,string|number|boolean|null>,Extract<IN,new (...args:any[])=>any>,Extract<IN,any[]>,Extract<Exclude<IN,Schema<any>|string|number|boolean|null|(new (...args:any[])=>any)|any[]>,object>] extends [infer Schemas, infer Primitives, infer Constructors, infer Arrs, infer Obj]
	*   ? Schema<
	*       (Schemas extends Schema<infer S> ? S : never)
	*     | Primitives
	*     | (Constructors extends new (...args:any[])=>any ? InstanceType<Constructors> : never)
	*     | (Arrs extends any[] ? { [K in keyof Arrs]: Unwrap<ReadSchema<Arrs[K]>> }[number] : never)
	*     | (Obj extends object ? Unwrap<(_ObjectDefToSchema<{[K in keyof Obj]:ReadSchema<Obj[K]>}> extends Schema<infer S> ? Schema<{ [K in keyof S]: S[K] }> : never)> : never)>
	*   : never
	* } ReadSchema
	*/
	/**
	* @typedef {ReadSchema<{x:42}|{y:99}|Schema<string>|[1,2,{}]>} Q
	*/
	/**
	* @template IN
	* @param {IN} o
	* @return {ReadSchema<IN>}
	*/
	const $ = (o) => {
		if ($$schema.check(o)) return o;
		else if ($objectAny.check(o)) {
			/**
			* @type {any}
			*/
			const o2 = {};
			for (const k in o) o2[k] = $(o[k]);
			return $object(o2);
		} else if ($arrayAny.check(o)) return $union(...o.map($));
		else if ($primitive.check(o)) return $literal(o);
		else if ($function.check(o)) return $constructedBy(o);
		/* c8 ignore next */
		unexpectedCase();
	};
	/* c8 ignore start */
	/**
	* Assert that a variable is of this specific type.
	* The assertion check is only performed in non-production environments.
	*
	* @type {<T>(o:any,schema:Schema<T>) => asserts o is T}
	*/
	const assert = production ? () => {} : (o, schema) => {
		const err = new ValidationError();
		if (!schema.check(o, err)) throw create$5(`Expected value to be of type ${schema.constructor.name}.\n${err.toString()}`);
	};
	/* c8 ignore end */
	/**
	* @template In
	* @template Out
	* @typedef {{ if: Schema<In>, h: (o:In,state?:any)=>Out }} Pattern
	*/
	/**
	* @template {Pattern<any,any>} P
	* @template In
	* @typedef {ReturnType<Extract<P,Pattern<In extends number ? number : (In extends string ? string : In),any>>['h']>} PatternMatchResult
	*/
	/**
	* @todo move this to separate library
	* @template {any} [State=undefined]
	* @template {Pattern<any,any>} [Patterns=never]
	*/
	var PatternMatcher = class {
		/**
		* @param {Schema<State>} [$state]
		*/
		constructor($state) {
			/**
			* @type {Array<Patterns>}
			*/
			this.patterns = [];
			this.$state = $state;
		}
		/**
		* @template P
		* @template R
		* @param {P} pattern
		* @param {(o:NoInfer<Unwrap<ReadSchema<P>>>,s:State)=>R} handler
		* @return {PatternMatcher<State,Patterns|Pattern<Unwrap<ReadSchema<P>>,R>>}
		*/
		if(pattern, handler) {
			this.patterns.push({
				if: $(pattern),
				h: handler
			});
			return this;
		}
		/**
		* @template R
		* @param {(o:any,s:State)=>R} h
		*/
		else(h) {
			return this.if($any, h);
		}
		/**
		* @return {State extends undefined
		*   ? <In extends Unwrap<Patterns['if']>>(o:In,state?:undefined)=>PatternMatchResult<Patterns,In>
		*   : <In extends Unwrap<Patterns['if']>>(o:In,state:State)=>PatternMatchResult<Patterns,In>}
		*/
		done() {
			return (o, s) => {
				for (let i = 0; i < this.patterns.length; i++) {
					const p = this.patterns[i];
					if (p.if.check(o)) return p.h(o, s);
				}
				throw create$5("Unhandled pattern");
			};
		}
	};
	/**
	* @template [State=undefined]
	* @param {State} [state]
	* @return {PatternMatcher<State extends undefined ? undefined : Unwrap<ReadSchema<State>>>}
	*/
	const match = (state) => new PatternMatcher(state);
	/**
	* Helper function to generate a (non-exhaustive) sample set from a gives schema.
	*
	* @type {<T>(o:T,gen:prng.PRNG)=>T}
	*/
	const _random = match($any).if($$number, (_o, gen) => int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER)).if($$string, (_o, gen) => word(gen)).if($$boolean, (_o, gen) => bool(gen)).if($$bigint, (_o, gen) => BigInt(int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER))).if($$union, (o, gen) => random(gen, oneOf(gen, o.shape))).if($$object, (o, gen) => {
		/**
		* @type {any}
		*/
		const res = {};
		for (const k in o.shape) {
			let prop = o.shape[k];
			if ($$optional.check(prop)) {
				if (bool(gen)) continue;
				prop = prop.shape;
			}
			res[k] = _random(prop, gen);
		}
		return res;
	}).if($$array, (o, gen) => {
		const arr = [];
		const n = int32(gen, 0, 42);
		for (let i = 0; i < n; i++) arr.push(random(gen, o.shape));
		return arr;
	}).if($$literal, (o, gen) => {
		return oneOf(gen, o.shape);
	}).if($$null, (o, gen) => {
		return null;
	}).if($$lambda, (o, gen) => {
		const res = random(gen, o.res);
		return () => res;
	}).if($$any, (o, gen) => random(gen, oneOf(gen, [
		$number,
		$string,
		$null,
		$undefined,
		$bigint,
		$boolean,
		$array($number),
		$record($union("a", "b", "c"), $number)
	]))).if($$record, (o, gen) => {
		/**
		* @type {any}
		*/
		const res = {};
		const keysN = int53(gen, 0, 3);
		for (let i = 0; i < keysN; i++) {
			const key = random(gen, o.shape.keys);
			res[key] = random(gen, o.shape.values);
		}
		return res;
	}).done();
	/**
	* @template S
	* @param {prng.PRNG} gen
	* @param {S} schema
	* @return {Unwrap<ReadSchema<S>>}
	*/
	const random = (gen, schema) => _random($(schema), gen);

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/dom.js
/* c8 ignore start */
	/**
	* @type {Document}
	*/
	const doc = typeof document !== "undefined" ? document : {};
	/**
	* @type {$.Schema<DocumentFragment>}
	*/
	const $fragment = $custom((el) => el.nodeType === DOCUMENT_FRAGMENT_NODE);
	const domParser = typeof DOMParser !== "undefined" ? new DOMParser() : null;
	/**
	* @type {$.Schema<Element>}
	*/
	const $element = $custom((el) => el.nodeType === ELEMENT_NODE);
	/**
	* @type {$.Schema<Text>}
	*/
	const $text = $custom((el) => el.nodeType === TEXT_NODE);
	/**
	* @param {Map<string,string>} m
	* @return {string}
	*/
	const mapToStyleString = (m) => map(m, (value, key) => `${key}:${value};`).join("");
	const ELEMENT_NODE = doc.ELEMENT_NODE;
	const TEXT_NODE = doc.TEXT_NODE;
	const CDATA_SECTION_NODE = doc.CDATA_SECTION_NODE;
	const COMMENT_NODE = doc.COMMENT_NODE;
	const DOCUMENT_NODE = doc.DOCUMENT_NODE;
	const DOCUMENT_TYPE_NODE = doc.DOCUMENT_TYPE_NODE;
	const DOCUMENT_FRAGMENT_NODE = doc.DOCUMENT_FRAGMENT_NODE;
	/**
	* @type {$.Schema<Node>}
	*/
	const $node = $custom((el) => el.nodeType === DOCUMENT_NODE);
	/* c8 ignore stop */

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/symbol.js
/**
	* Utility module to work with EcmaScript Symbols.
	*
	* @module symbol
	*/
	/**
	* Return fresh symbol.
	*/
	const create$2 = Symbol;

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/logging.common.js
	const BOLD = create$2();
	const UNBOLD = create$2();
	const BLUE = create$2();
	const GREY = create$2();
	const GREEN = create$2();
	const RED = create$2();
	const PURPLE = create$2();
	const ORANGE = create$2();
	const UNCOLOR = create$2();
	/* c8 ignore start */
	/**
	* @param {Array<undefined|string|Symbol|Object|number|function():any>} args
	* @return {Array<string|object|number|undefined>}
	*/
	const computeNoColorLoggingArgs = (args) => {
		if (args.length === 1 && args[0]?.constructor === Function) args = args[0]();
		const strBuilder = [];
		const logArgs = [];
		let i = 0;
		for (; i < args.length; i++) {
			const arg = args[i];
			if (arg === void 0) break;
			else if (arg.constructor === String || arg.constructor === Number) strBuilder.push(arg);
			else if (arg.constructor === Object) break;
		}
		if (i > 0) logArgs.push(strBuilder.join(""));
		for (; i < args.length; i++) {
			const arg = args[i];
			if (!(arg instanceof Symbol)) logArgs.push(arg);
		}
		return logArgs;
	};
	let lastLoggingTime = getUnixTime();
	/* c8 ignore stop */

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/logging.js
/**
	* Isomorphic logging module with support for colors!
	*
	* @module logging
	*/
	/**
	* @type {Object<Symbol,pair.Pair<string,string>>}
	*/
	const _browserStyleMap = {
		[BOLD]: create$3("font-weight", "bold"),
		[UNBOLD]: create$3("font-weight", "normal"),
		[BLUE]: create$3("color", "blue"),
		[GREEN]: create$3("color", "green"),
		[GREY]: create$3("color", "grey"),
		[RED]: create$3("color", "red"),
		[PURPLE]: create$3("color", "purple"),
		[ORANGE]: create$3("color", "orange"),
		[UNCOLOR]: create$3("color", "black")
	};
	/**
	* @param {Array<string|Symbol|Object|number|function():any>} args
	* @return {Array<string|object|number>}
	*/
	/* c8 ignore start */
	const computeBrowserLoggingArgs = (args) => {
		if (args.length === 1 && args[0]?.constructor === Function) args = args[0]();
		const strBuilder = [];
		const styles = [];
		const currentStyle = create$7();
		/**
		* @type {Array<string|Object|number>}
		*/
		let logArgs = [];
		let i = 0;
		for (; i < args.length; i++) {
			const arg = args[i];
			const style = _browserStyleMap[arg];
			if (style !== void 0) currentStyle.set(style.left, style.right);
			else {
				if (arg === void 0) break;
				if (arg.constructor === String || arg.constructor === Number) {
					const style = mapToStyleString(currentStyle);
					if (i > 0 || style.length > 0) {
						strBuilder.push("%c" + arg);
						styles.push(style);
					} else strBuilder.push(arg);
				} else break;
			}
		}
		if (i > 0) {
			logArgs = styles;
			logArgs.unshift(strBuilder.join(""));
		}
		for (; i < args.length; i++) {
			const arg = args[i];
			if (!(arg instanceof Symbol)) logArgs.push(arg);
		}
		return logArgs;
	};
	/* c8 ignore stop */
	/* c8 ignore start */
	const computeLoggingArgs = supportsColor ? computeBrowserLoggingArgs : computeNoColorLoggingArgs;
	/* c8 ignore stop */
	/**
	* @param {Array<string|Symbol|Object|number>} args
	*/
	const print = (...args) => {
		console.log(...computeLoggingArgs(args));
		/* c8 ignore next */
		vconsoles.forEach((vc) => vc.print(args));
	};
	/* c8 ignore start */
	/**
	* @param {Array<string|Symbol|Object|number>} args
	*/
	const warn = (...args) => {
		console.warn(...computeLoggingArgs(args));
		args.unshift(ORANGE);
		vconsoles.forEach((vc) => vc.print(args));
	};
	const vconsoles = create$6();

// node_modules/.store/lib0@0.2.117-AWthJenbqlRhwK8dg2Xkww/node_modules/lib0/iterator.js
/**
	* @template T
	* @param {function():IteratorResult<T>} next
	* @return {IterableIterator<T>}
	*/
	const createIterator = (next) => ({
		/**
		* @return {IterableIterator<T>}
		*/
		[Symbol.iterator]() {
			return this;
		},
		next
	});
	/**
	* @template T
	* @param {Iterator<T>} iterator
	* @param {function(T):boolean} filter
	*/
	const iteratorFilter = (iterator, filter) => createIterator(() => {
		let res;
		do
			res = iterator.next();
		while (!res.done && !filter(res.value));
		return res;
	});
	/**
	* @template T,M
	* @param {Iterator<T>} iterator
	* @param {function(T):M} fmap
	*/
	const iteratorMap = (iterator, fmap) => createIterator(() => {
		const { done, value } = iterator.next();
		return {
			done,
			value: done ? void 0 : fmap(value)
		};
	});

// node_modules/.store/yjs@13.6.29-TJYJpNVE3l2_hFsy5BI5FA/node_modules/yjs/dist/yjs.mjs
	var yjs_exports = /* @__PURE__ */ __exportAll({
		AbsolutePosition: () => AbsolutePosition,
		AbstractConnector: () => AbstractConnector,
		AbstractStruct: () => AbstractStruct,
		AbstractType: () => AbstractType,
		Array: () => YArray,
		ContentAny: () => ContentAny,
		ContentBinary: () => ContentBinary,
		ContentDeleted: () => ContentDeleted,
		ContentDoc: () => ContentDoc,
		ContentEmbed: () => ContentEmbed,
		ContentFormat: () => ContentFormat,
		ContentJSON: () => ContentJSON,
		ContentString: () => ContentString,
		ContentType: () => ContentType,
		Doc: () => Doc,
		GC: () => GC,
		ID: () => ID,
		Item: () => Item,
		Map: () => YMap,
		PermanentUserData: () => PermanentUserData,
		RelativePosition: () => RelativePosition,
		Skip: () => Skip,
		Snapshot: () => Snapshot,
		Text: () => YText,
		Transaction: () => Transaction,
		UndoManager: () => UndoManager,
		UpdateDecoderV1: () => UpdateDecoderV1,
		UpdateDecoderV2: () => UpdateDecoderV2,
		UpdateEncoderV1: () => UpdateEncoderV1,
		UpdateEncoderV2: () => UpdateEncoderV2,
		XmlElement: () => YXmlElement,
		XmlFragment: () => YXmlFragment,
		XmlHook: () => YXmlHook,
		XmlText: () => YXmlText,
		YArrayEvent: () => YArrayEvent,
		YEvent: () => YEvent,
		YMapEvent: () => YMapEvent,
		YTextEvent: () => YTextEvent,
		YXmlEvent: () => YXmlEvent,
		applyUpdate: () => applyUpdate,
		applyUpdateV2: () => applyUpdateV2,
		cleanupYTextFormatting: () => cleanupYTextFormatting,
		compareIDs: () => compareIDs,
		compareRelativePositions: () => compareRelativePositions,
		convertUpdateFormatV1ToV2: () => convertUpdateFormatV1ToV2,
		convertUpdateFormatV2ToV1: () => convertUpdateFormatV2ToV1,
		createAbsolutePositionFromRelativePosition: () => createAbsolutePositionFromRelativePosition,
		createDeleteSet: () => createDeleteSet,
		createDeleteSetFromStructStore: () => createDeleteSetFromStructStore,
		createDocFromSnapshot: () => createDocFromSnapshot,
		createID: () => createID,
		createRelativePositionFromJSON: () => createRelativePositionFromJSON,
		createRelativePositionFromTypeIndex: () => createRelativePositionFromTypeIndex,
		createSnapshot: () => createSnapshot,
		decodeRelativePosition: () => decodeRelativePosition,
		decodeSnapshot: () => decodeSnapshot,
		decodeSnapshotV2: () => decodeSnapshotV2,
		decodeStateVector: () => decodeStateVector,
		decodeUpdate: () => decodeUpdate,
		decodeUpdateV2: () => decodeUpdateV2,
		diffUpdate: () => diffUpdate,
		diffUpdateV2: () => diffUpdateV2,
		emptySnapshot: () => emptySnapshot,
		encodeRelativePosition: () => encodeRelativePosition,
		encodeSnapshot: () => encodeSnapshot,
		encodeSnapshotV2: () => encodeSnapshotV2,
		encodeStateAsUpdate: () => encodeStateAsUpdate,
		encodeStateAsUpdateV2: () => encodeStateAsUpdateV2,
		encodeStateVector: () => encodeStateVector,
		encodeStateVectorFromUpdate: () => encodeStateVectorFromUpdate,
		encodeStateVectorFromUpdateV2: () => encodeStateVectorFromUpdateV2,
		equalDeleteSets: () => equalDeleteSets,
		equalSnapshots: () => equalSnapshots,
		findIndexSS: () => findIndexSS,
		findRootTypeKey: () => findRootTypeKey,
		getItem: () => getItem,
		getItemCleanEnd: () => getItemCleanEnd,
		getItemCleanStart: () => getItemCleanStart,
		getState: () => getState,
		getTypeChildren: () => getTypeChildren,
		isDeleted: () => isDeleted,
		isParentOf: () => isParentOf,
		iterateDeletedStructs: () => iterateDeletedStructs,
		logType: () => logType,
		logUpdate: () => logUpdate,
		logUpdateV2: () => logUpdateV2,
		mergeDeleteSets: () => mergeDeleteSets,
		mergeUpdates: () => mergeUpdates,
		mergeUpdatesV2: () => mergeUpdatesV2,
		obfuscateUpdate: () => obfuscateUpdate,
		obfuscateUpdateV2: () => obfuscateUpdateV2,
		parseUpdateMeta: () => parseUpdateMeta,
		parseUpdateMetaV2: () => parseUpdateMetaV2,
		readUpdate: () => readUpdate$1,
		readUpdateV2: () => readUpdateV2,
		relativePositionToJSON: () => relativePositionToJSON,
		snapshot: () => snapshot,
		snapshotContainsUpdate: () => snapshotContainsUpdate,
		transact: () => transact,
		tryGc: () => tryGc,
		typeListToArraySnapshot: () => typeListToArraySnapshot,
		typeMapGetAllSnapshot: () => typeMapGetAllSnapshot,
		typeMapGetSnapshot: () => typeMapGetSnapshot
	}, 1);
	/**
	* This is an abstract interface that all Connectors should implement to keep them interchangeable.
	*
	* @note This interface is experimental and it is not advised to actually inherit this class.
	*       It just serves as typing information.
	*
	* @extends {ObservableV2<any>}
	*/
	var AbstractConnector = class extends ObservableV2 {
		/**
		* @param {Doc} ydoc
		* @param {any} awareness
		*/
		constructor(ydoc, awareness) {
			super();
			this.doc = ydoc;
			this.awareness = awareness;
		}
	};
	var DeleteItem = class {
		/**
		* @param {number} clock
		* @param {number} len
		*/
		constructor(clock, len) {
			/**
			* @type {number}
			*/
			this.clock = clock;
			/**
			* @type {number}
			*/
			this.len = len;
		}
	};
	/**
	* We no longer maintain a DeleteStore. DeleteSet is a temporary object that is created when needed.
	* - When created in a transaction, it must only be accessed after sorting, and merging
	*   - This DeleteSet is send to other clients
	* - We do not create a DeleteSet when we send a sync message. The DeleteSet message is created directly from StructStore
	* - We read a DeleteSet as part of a sync/update message. In this case the DeleteSet is already sorted and merged.
	*/
	var DeleteSet = class {
		constructor() {
			/**
			* @type {Map<number,Array<DeleteItem>>}
			*/
			this.clients = /* @__PURE__ */ new Map();
		}
	};
	/**
	* Iterate over all structs that the DeleteSet gc's.
	*
	* @param {Transaction} transaction
	* @param {DeleteSet} ds
	* @param {function(GC|Item):void} f
	*
	* @function
	*/
	const iterateDeletedStructs = (transaction, ds, f) => ds.clients.forEach((deletes, clientid) => {
		const structs = transaction.doc.store.clients.get(clientid);
		if (structs != null) {
			const lastStruct = structs[structs.length - 1];
			const clockState = lastStruct.id.clock + lastStruct.length;
			for (let i = 0, del = deletes[i]; i < deletes.length && del.clock < clockState; del = deletes[++i]) iterateStructs(transaction, structs, del.clock, del.len, f);
		}
	});
	/**
	* @param {Array<DeleteItem>} dis
	* @param {number} clock
	* @return {number|null}
	*
	* @private
	* @function
	*/
	const findIndexDS = (dis, clock) => {
		let left = 0;
		let right = dis.length - 1;
		while (left <= right) {
			const midindex = floor((left + right) / 2);
			const mid = dis[midindex];
			const midclock = mid.clock;
			if (midclock <= clock) {
				if (clock < midclock + mid.len) return midindex;
				left = midindex + 1;
			} else right = midindex - 1;
		}
		return null;
	};
	/**
	* @param {DeleteSet} ds
	* @param {ID} id
	* @return {boolean}
	*
	* @private
	* @function
	*/
	const isDeleted = (ds, id) => {
		const dis = ds.clients.get(id.client);
		return dis !== void 0 && findIndexDS(dis, id.clock) !== null;
	};
	/**
	* @param {DeleteSet} ds
	*
	* @private
	* @function
	*/
	const sortAndMergeDeleteSet = (ds) => {
		ds.clients.forEach((dels) => {
			dels.sort((a, b) => a.clock - b.clock);
			let i, j;
			for (i = 1, j = 1; i < dels.length; i++) {
				const left = dels[j - 1];
				const right = dels[i];
				if (left.clock + left.len >= right.clock) left.len = max(left.len, right.clock + right.len - left.clock);
				else {
					if (j < i) dels[j] = right;
					j++;
				}
			}
			dels.length = j;
		});
	};
	/**
	* @param {Array<DeleteSet>} dss
	* @return {DeleteSet} A fresh DeleteSet
	*/
	const mergeDeleteSets = (dss) => {
		const merged = new DeleteSet();
		for (let dssI = 0; dssI < dss.length; dssI++) dss[dssI].clients.forEach((delsLeft, client) => {
			if (!merged.clients.has(client)) {
				/**
				* @type {Array<DeleteItem>}
				*/
				const dels = delsLeft.slice();
				for (let i = dssI + 1; i < dss.length; i++) appendTo(dels, dss[i].clients.get(client) || []);
				merged.clients.set(client, dels);
			}
		});
		sortAndMergeDeleteSet(merged);
		return merged;
	};
	/**
	* @param {DeleteSet} ds
	* @param {number} client
	* @param {number} clock
	* @param {number} length
	*
	* @private
	* @function
	*/
	const addToDeleteSet = (ds, client, clock, length) => {
		setIfUndefined(ds.clients, client, () => []).push(new DeleteItem(clock, length));
	};
	const createDeleteSet = () => new DeleteSet();
	/**
	* @param {StructStore} ss
	* @return {DeleteSet} Merged and sorted DeleteSet
	*
	* @private
	* @function
	*/
	const createDeleteSetFromStructStore = (ss) => {
		const ds = createDeleteSet();
		ss.clients.forEach((structs, client) => {
			/**
			* @type {Array<DeleteItem>}
			*/
			const dsitems = [];
			for (let i = 0; i < structs.length; i++) {
				const struct = structs[i];
				if (struct.deleted) {
					const clock = struct.id.clock;
					let len = struct.length;
					if (i + 1 < structs.length) for (let next = structs[i + 1]; i + 1 < structs.length && next.deleted; next = structs[++i + 1]) len += next.length;
					dsitems.push(new DeleteItem(clock, len));
				}
			}
			if (dsitems.length > 0) ds.clients.set(client, dsitems);
		});
		return ds;
	};
	/**
	* @param {DSEncoderV1 | DSEncoderV2} encoder
	* @param {DeleteSet} ds
	*
	* @private
	* @function
	*/
	const writeDeleteSet = (encoder, ds) => {
		writeVarUint(encoder.restEncoder, ds.clients.size);
		from(ds.clients.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, dsitems]) => {
			encoder.resetDsCurVal();
			writeVarUint(encoder.restEncoder, client);
			const len = dsitems.length;
			writeVarUint(encoder.restEncoder, len);
			for (let i = 0; i < len; i++) {
				const item = dsitems[i];
				encoder.writeDsClock(item.clock);
				encoder.writeDsLen(item.len);
			}
		});
	};
	/**
	* @param {DSDecoderV1 | DSDecoderV2} decoder
	* @return {DeleteSet}
	*
	* @private
	* @function
	*/
	const readDeleteSet = (decoder) => {
		const ds = new DeleteSet();
		const numClients = readVarUint(decoder.restDecoder);
		for (let i = 0; i < numClients; i++) {
			decoder.resetDsCurVal();
			const client = readVarUint(decoder.restDecoder);
			const numberOfDeletes = readVarUint(decoder.restDecoder);
			if (numberOfDeletes > 0) {
				const dsField = setIfUndefined(ds.clients, client, () => []);
				for (let i = 0; i < numberOfDeletes; i++) dsField.push(new DeleteItem(decoder.readDsClock(), decoder.readDsLen()));
			}
		}
		return ds;
	};
	/**
	* @todo YDecoder also contains references to String and other Decoders. Would make sense to exchange YDecoder.toUint8Array for YDecoder.DsToUint8Array()..
	*/
	/**
	* @param {DSDecoderV1 | DSDecoderV2} decoder
	* @param {Transaction} transaction
	* @param {StructStore} store
	* @return {Uint8Array|null} Returns a v2 update containing all deletes that couldn't be applied yet; or null if all deletes were applied successfully.
	*
	* @private
	* @function
	*/
	const readAndApplyDeleteSet = (decoder, transaction, store) => {
		const unappliedDS = new DeleteSet();
		const numClients = readVarUint(decoder.restDecoder);
		for (let i = 0; i < numClients; i++) {
			decoder.resetDsCurVal();
			const client = readVarUint(decoder.restDecoder);
			const numberOfDeletes = readVarUint(decoder.restDecoder);
			const structs = store.clients.get(client) || [];
			const state = getState(store, client);
			for (let i = 0; i < numberOfDeletes; i++) {
				const clock = decoder.readDsClock();
				const clockEnd = clock + decoder.readDsLen();
				if (clock < state) {
					if (state < clockEnd) addToDeleteSet(unappliedDS, client, state, clockEnd - state);
					let index = findIndexSS(structs, clock);
					/**
					* We can ignore the case of GC and Delete structs, because we are going to skip them
					* @type {Item}
					*/
					let struct = structs[index];
					if (!struct.deleted && struct.id.clock < clock) {
						structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
						index++;
					}
					while (index < structs.length) {
						struct = structs[index++];
						if (struct.id.clock < clockEnd) {
							if (!struct.deleted) {
								if (clockEnd < struct.id.clock + struct.length) structs.splice(index, 0, splitItem(transaction, struct, clockEnd - struct.id.clock));
								struct.delete(transaction);
							}
						} else break;
					}
				} else addToDeleteSet(unappliedDS, client, clock, clockEnd - clock);
			}
		}
		if (unappliedDS.clients.size > 0) {
			const ds = new UpdateEncoderV2();
			writeVarUint(ds.restEncoder, 0);
			writeDeleteSet(ds, unappliedDS);
			return ds.toUint8Array();
		}
		return null;
	};
	/**
	* @param {DeleteSet} ds1
	* @param {DeleteSet} ds2
	*/
	const equalDeleteSets = (ds1, ds2) => {
		if (ds1.clients.size !== ds2.clients.size) return false;
		for (const [client, deleteItems1] of ds1.clients.entries()) {
			const deleteItems2 = ds2.clients.get(client);
			if (deleteItems2 === void 0 || deleteItems1.length !== deleteItems2.length) return false;
			for (let i = 0; i < deleteItems1.length; i++) {
				const di1 = deleteItems1[i];
				const di2 = deleteItems2[i];
				if (di1.clock !== di2.clock || di1.len !== di2.len) return false;
			}
		}
		return true;
	};
	/**
	* @module Y
	*/
	const generateNewClientId = uint32;
	/**
	* @typedef {Object} DocOpts
	* @property {boolean} [DocOpts.gc=true] Disable garbage collection (default: gc=true)
	* @property {function(Item):boolean} [DocOpts.gcFilter] Will be called before an Item is garbage collected. Return false to keep the Item.
	* @property {string} [DocOpts.guid] Define a globally unique identifier for this document
	* @property {string | null} [DocOpts.collectionid] Associate this document with a collection. This only plays a role if your provider has a concept of collection.
	* @property {any} [DocOpts.meta] Any kind of meta information you want to associate with this document. If this is a subdocument, remote peers will store the meta information as well.
	* @property {boolean} [DocOpts.autoLoad] If a subdocument, automatically load document. If this is a subdocument, remote peers will load the document as well automatically.
	* @property {boolean} [DocOpts.shouldLoad] Whether the document should be synced by the provider now. This is toggled to true when you call ydoc.load()
	*/
	/**
	* @typedef {Object} DocEvents
	* @property {function(Doc):void} DocEvents.destroy
	* @property {function(Doc):void} DocEvents.load
	* @property {function(boolean, Doc):void} DocEvents.sync
	* @property {function(Uint8Array, any, Doc, Transaction):void} DocEvents.update
	* @property {function(Uint8Array, any, Doc, Transaction):void} DocEvents.updateV2
	* @property {function(Doc):void} DocEvents.beforeAllTransactions
	* @property {function(Transaction, Doc):void} DocEvents.beforeTransaction
	* @property {function(Transaction, Doc):void} DocEvents.beforeObserverCalls
	* @property {function(Transaction, Doc):void} DocEvents.afterTransaction
	* @property {function(Transaction, Doc):void} DocEvents.afterTransactionCleanup
	* @property {function(Doc, Array<Transaction>):void} DocEvents.afterAllTransactions
	* @property {function({ loaded: Set<Doc>, added: Set<Doc>, removed: Set<Doc> }, Doc, Transaction):void} DocEvents.subdocs
	*/
	/**
	* A Yjs instance handles the state of shared data.
	* @extends ObservableV2<DocEvents>
	*/
	var Doc = class Doc extends ObservableV2 {
		/**
		* @param {DocOpts} opts configuration
		*/
		constructor({ guid = uuidv4(), collectionid = null, gc = true, gcFilter = () => true, meta = null, autoLoad = false, shouldLoad = true } = {}) {
			super();
			this.gc = gc;
			this.gcFilter = gcFilter;
			this.clientID = generateNewClientId();
			this.guid = guid;
			this.collectionid = collectionid;
			/**
			* @type {Map<string, AbstractType<YEvent<any>>>}
			*/
			this.share = /* @__PURE__ */ new Map();
			this.store = new StructStore();
			/**
			* @type {Transaction | null}
			*/
			this._transaction = null;
			/**
			* @type {Array<Transaction>}
			*/
			this._transactionCleanups = [];
			/**
			* @type {Set<Doc>}
			*/
			this.subdocs = /* @__PURE__ */ new Set();
			/**
			* If this document is a subdocument - a document integrated into another document - then _item is defined.
			* @type {Item?}
			*/
			this._item = null;
			this.shouldLoad = shouldLoad;
			this.autoLoad = autoLoad;
			this.meta = meta;
			/**
			* This is set to true when the persistence provider loaded the document from the database or when the `sync` event fires.
			* Note that not all providers implement this feature. Provider authors are encouraged to fire the `load` event when the doc content is loaded from the database.
			*
			* @type {boolean}
			*/
			this.isLoaded = false;
			/**
			* This is set to true when the connection provider has successfully synced with a backend.
			* Note that when using peer-to-peer providers this event may not provide very useful.
			* Also note that not all providers implement this feature. Provider authors are encouraged to fire
			* the `sync` event when the doc has been synced (with `true` as a parameter) or if connection is
			* lost (with false as a parameter).
			*/
			this.isSynced = false;
			this.isDestroyed = false;
			/**
			* Promise that resolves once the document has been loaded from a persistence provider.
			*/
			this.whenLoaded = create$4((resolve) => {
				this.on("load", () => {
					this.isLoaded = true;
					resolve(this);
				});
			});
			const provideSyncedPromise = () => create$4((resolve) => {
				/**
				* @param {boolean} isSynced
				*/
				const eventHandler = (isSynced) => {
					if (isSynced === void 0 || isSynced === true) {
						this.off("sync", eventHandler);
						resolve();
					}
				};
				this.on("sync", eventHandler);
			});
			this.on("sync", (isSynced) => {
				if (isSynced === false && this.isSynced) this.whenSynced = provideSyncedPromise();
				this.isSynced = isSynced === void 0 || isSynced === true;
				if (this.isSynced && !this.isLoaded) this.emit("load", [this]);
			});
			/**
			* Promise that resolves once the document has been synced with a backend.
			* This promise is recreated when the connection is lost.
			* Note the documentation about the `isSynced` property.
			*/
			this.whenSynced = provideSyncedPromise();
		}
		/**
		* Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
		*
		* `load()` might be used in the future to request any provider to load the most current data.
		*
		* It is safe to call `load()` multiple times.
		*/
		load() {
			const item = this._item;
			if (item !== null && !this.shouldLoad) transact(
				/** @type {any} */
				item.parent.doc,
				(transaction) => {
					transaction.subdocsLoaded.add(this);
				},
				null,
				true
			);
			this.shouldLoad = true;
		}
		getSubdocs() {
			return this.subdocs;
		}
		getSubdocGuids() {
			return new Set(from(this.subdocs).map((doc) => doc.guid));
		}
		/**
		* Changes that happen inside of a transaction are bundled. This means that
		* the observer fires _after_ the transaction is finished and that all changes
		* that happened inside of the transaction are sent as one message to the
		* other peers.
		*
		* @template T
		* @param {function(Transaction):T} f The function that should be executed as a transaction
		* @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
		* @return T
		*
		* @public
		*/
		transact(f, origin = null) {
			return transact(this, f, origin);
		}
		/**
		* Define a shared data type.
		*
		* Multiple calls of `ydoc.get(name, TypeConstructor)` yield the same result
		* and do not overwrite each other. I.e.
		* `ydoc.get(name, Y.Array) === ydoc.get(name, Y.Array)`
		*
		* After this method is called, the type is also available on `ydoc.share.get(name)`.
		*
		* *Best Practices:*
		* Define all types right after the Y.Doc instance is created and store them in a separate object.
		* Also use the typed methods `getText(name)`, `getArray(name)`, ..
		*
		* @template {typeof AbstractType<any>} Type
		* @example
		*   const ydoc = new Y.Doc(..)
		*   const appState = {
		*     document: ydoc.getText('document')
		*     comments: ydoc.getArray('comments')
		*   }
		*
		* @param {string} name
		* @param {Type} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
		* @return {InstanceType<Type>} The created type. Constructed with TypeConstructor
		*
		* @public
		*/
		get(name, TypeConstructor = AbstractType) {
			const type = setIfUndefined(this.share, name, () => {
				const t = new TypeConstructor();
				t._integrate(this, null);
				return t;
			});
			const Constr = type.constructor;
			if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
				if (Constr === AbstractType) {
					const t = new TypeConstructor();
					t._map = type._map;
					type._map.forEach(
						/** @param {Item?} n */
						(n) => {
							for (; n !== null; n = n.left) n.parent = t;
						}
					);
					t._start = type._start;
					for (let n = t._start; n !== null; n = n.right) n.parent = t;
					t._length = type._length;
					this.share.set(name, t);
					t._integrate(this, null);
					return t;
				} else throw new Error(`Type with the name ${name} has already been defined with a different constructor`);
			}
			return type;
		}
		/**
		* @template T
		* @param {string} [name]
		* @return {YArray<T>}
		*
		* @public
		*/
		getArray(name = "") {
			return this.get(name, YArray);
		}
		/**
		* @param {string} [name]
		* @return {YText}
		*
		* @public
		*/
		getText(name = "") {
			return this.get(name, YText);
		}
		/**
		* @template T
		* @param {string} [name]
		* @return {YMap<T>}
		*
		* @public
		*/
		getMap(name = "") {
			return this.get(name, YMap);
		}
		/**
		* @param {string} [name]
		* @return {YXmlElement}
		*
		* @public
		*/
		getXmlElement(name = "") {
			return this.get(name, YXmlElement);
		}
		/**
		* @param {string} [name]
		* @return {YXmlFragment}
		*
		* @public
		*/
		getXmlFragment(name = "") {
			return this.get(name, YXmlFragment);
		}
		/**
		* Converts the entire document into a js object, recursively traversing each yjs type
		* Doesn't log types that have not been defined (using ydoc.getType(..)).
		*
		* @deprecated Do not use this method and rather call toJSON directly on the shared types.
		*
		* @return {Object<string, any>}
		*/
		toJSON() {
			/**
			* @type {Object<string, any>}
			*/
			const doc = {};
			this.share.forEach((value, key) => {
				doc[key] = value.toJSON();
			});
			return doc;
		}
		/**
		* Emit `destroy` event and unregister all event handlers.
		*/
		destroy() {
			this.isDestroyed = true;
			from(this.subdocs).forEach((subdoc) => subdoc.destroy());
			const item = this._item;
			if (item !== null) {
				this._item = null;
				const content = item.content;
				content.doc = new Doc({
					guid: this.guid,
					...content.opts,
					shouldLoad: false
				});
				content.doc._item = item;
				transact(
					/** @type {any} */
					item.parent.doc,
					(transaction) => {
						const doc = content.doc;
						if (!item.deleted) transaction.subdocsAdded.add(doc);
						transaction.subdocsRemoved.add(this);
					},
					null,
					true
				);
			}
			this.emit("destroyed", [true]);
			this.emit("destroy", [this]);
			super.destroy();
		}
	};
	var DSDecoderV1 = class {
		/**
		* @param {decoding.Decoder} decoder
		*/
		constructor(decoder) {
			this.restDecoder = decoder;
		}
		resetDsCurVal() {}
		/**
		* @return {number}
		*/
		readDsClock() {
			return readVarUint(this.restDecoder);
		}
		/**
		* @return {number}
		*/
		readDsLen() {
			return readVarUint(this.restDecoder);
		}
	};
	var UpdateDecoderV1 = class extends DSDecoderV1 {
		/**
		* @return {ID}
		*/
		readLeftID() {
			return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
		}
		/**
		* @return {ID}
		*/
		readRightID() {
			return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
		}
		/**
		* Read the next client id.
		* Use this in favor of readID whenever possible to reduce the number of objects created.
		*/
		readClient() {
			return readVarUint(this.restDecoder);
		}
		/**
		* @return {number} info An unsigned 8-bit integer
		*/
		readInfo() {
			return readUint8(this.restDecoder);
		}
		/**
		* @return {string}
		*/
		readString() {
			return readVarString(this.restDecoder);
		}
		/**
		* @return {boolean} isKey
		*/
		readParentInfo() {
			return readVarUint(this.restDecoder) === 1;
		}
		/**
		* @return {number} info An unsigned 8-bit integer
		*/
		readTypeRef() {
			return readVarUint(this.restDecoder);
		}
		/**
		* Write len of a struct - well suited for Opt RLE encoder.
		*
		* @return {number} len
		*/
		readLen() {
			return readVarUint(this.restDecoder);
		}
		/**
		* @return {any}
		*/
		readAny() {
			return readAny(this.restDecoder);
		}
		/**
		* @return {Uint8Array}
		*/
		readBuf() {
			return copyUint8Array(readVarUint8Array(this.restDecoder));
		}
		/**
		* Legacy implementation uses JSON parse. We use any-decoding in v2.
		*
		* @return {any}
		*/
		readJSON() {
			return JSON.parse(readVarString(this.restDecoder));
		}
		/**
		* @return {string}
		*/
		readKey() {
			return readVarString(this.restDecoder);
		}
	};
	var DSDecoderV2 = class {
		/**
		* @param {decoding.Decoder} decoder
		*/
		constructor(decoder) {
			/**
			* @private
			*/
			this.dsCurrVal = 0;
			this.restDecoder = decoder;
		}
		resetDsCurVal() {
			this.dsCurrVal = 0;
		}
		/**
		* @return {number}
		*/
		readDsClock() {
			this.dsCurrVal += readVarUint(this.restDecoder);
			return this.dsCurrVal;
		}
		/**
		* @return {number}
		*/
		readDsLen() {
			const diff = readVarUint(this.restDecoder) + 1;
			this.dsCurrVal += diff;
			return diff;
		}
	};
	var UpdateDecoderV2 = class extends DSDecoderV2 {
		/**
		* @param {decoding.Decoder} decoder
		*/
		constructor(decoder) {
			super(decoder);
			/**
			* List of cached keys. If the keys[id] does not exist, we read a new key
			* from stringEncoder and push it to keys.
			*
			* @type {Array<string>}
			*/
			this.keys = [];
			readVarUint(decoder);
			this.keyClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
			this.clientDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
			this.leftClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
			this.rightClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
			this.infoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
			this.stringDecoder = new StringDecoder(readVarUint8Array(decoder));
			this.parentInfoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
			this.typeRefDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
			this.lenDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
		}
		/**
		* @return {ID}
		*/
		readLeftID() {
			return new ID(this.clientDecoder.read(), this.leftClockDecoder.read());
		}
		/**
		* @return {ID}
		*/
		readRightID() {
			return new ID(this.clientDecoder.read(), this.rightClockDecoder.read());
		}
		/**
		* Read the next client id.
		* Use this in favor of readID whenever possible to reduce the number of objects created.
		*/
		readClient() {
			return this.clientDecoder.read();
		}
		/**
		* @return {number} info An unsigned 8-bit integer
		*/
		readInfo() {
			return this.infoDecoder.read();
		}
		/**
		* @return {string}
		*/
		readString() {
			return this.stringDecoder.read();
		}
		/**
		* @return {boolean}
		*/
		readParentInfo() {
			return this.parentInfoDecoder.read() === 1;
		}
		/**
		* @return {number} An unsigned 8-bit integer
		*/
		readTypeRef() {
			return this.typeRefDecoder.read();
		}
		/**
		* Write len of a struct - well suited for Opt RLE encoder.
		*
		* @return {number}
		*/
		readLen() {
			return this.lenDecoder.read();
		}
		/**
		* @return {any}
		*/
		readAny() {
			return readAny(this.restDecoder);
		}
		/**
		* @return {Uint8Array}
		*/
		readBuf() {
			return readVarUint8Array(this.restDecoder);
		}
		/**
		* This is mainly here for legacy purposes.
		*
		* Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
		*
		* @return {any}
		*/
		readJSON() {
			return readAny(this.restDecoder);
		}
		/**
		* @return {string}
		*/
		readKey() {
			const keyClock = this.keyClockDecoder.read();
			if (keyClock < this.keys.length) return this.keys[keyClock];
			else {
				const key = this.stringDecoder.read();
				this.keys.push(key);
				return key;
			}
		}
	};
	var DSEncoderV1 = class {
		constructor() {
			this.restEncoder = createEncoder();
		}
		toUint8Array() {
			return toUint8Array(this.restEncoder);
		}
		resetDsCurVal() {}
		/**
		* @param {number} clock
		*/
		writeDsClock(clock) {
			writeVarUint(this.restEncoder, clock);
		}
		/**
		* @param {number} len
		*/
		writeDsLen(len) {
			writeVarUint(this.restEncoder, len);
		}
	};
	var UpdateEncoderV1 = class extends DSEncoderV1 {
		/**
		* @param {ID} id
		*/
		writeLeftID(id) {
			writeVarUint(this.restEncoder, id.client);
			writeVarUint(this.restEncoder, id.clock);
		}
		/**
		* @param {ID} id
		*/
		writeRightID(id) {
			writeVarUint(this.restEncoder, id.client);
			writeVarUint(this.restEncoder, id.clock);
		}
		/**
		* Use writeClient and writeClock instead of writeID if possible.
		* @param {number} client
		*/
		writeClient(client) {
			writeVarUint(this.restEncoder, client);
		}
		/**
		* @param {number} info An unsigned 8-bit integer
		*/
		writeInfo(info) {
			writeUint8(this.restEncoder, info);
		}
		/**
		* @param {string} s
		*/
		writeString(s) {
			writeVarString(this.restEncoder, s);
		}
		/**
		* @param {boolean} isYKey
		*/
		writeParentInfo(isYKey) {
			writeVarUint(this.restEncoder, isYKey ? 1 : 0);
		}
		/**
		* @param {number} info An unsigned 8-bit integer
		*/
		writeTypeRef(info) {
			writeVarUint(this.restEncoder, info);
		}
		/**
		* Write len of a struct - well suited for Opt RLE encoder.
		*
		* @param {number} len
		*/
		writeLen(len) {
			writeVarUint(this.restEncoder, len);
		}
		/**
		* @param {any} any
		*/
		writeAny(any) {
			writeAny(this.restEncoder, any);
		}
		/**
		* @param {Uint8Array} buf
		*/
		writeBuf(buf) {
			writeVarUint8Array(this.restEncoder, buf);
		}
		/**
		* @param {any} embed
		*/
		writeJSON(embed) {
			writeVarString(this.restEncoder, JSON.stringify(embed));
		}
		/**
		* @param {string} key
		*/
		writeKey(key) {
			writeVarString(this.restEncoder, key);
		}
	};
	var DSEncoderV2 = class {
		constructor() {
			this.restEncoder = createEncoder();
			this.dsCurrVal = 0;
		}
		toUint8Array() {
			return toUint8Array(this.restEncoder);
		}
		resetDsCurVal() {
			this.dsCurrVal = 0;
		}
		/**
		* @param {number} clock
		*/
		writeDsClock(clock) {
			const diff = clock - this.dsCurrVal;
			this.dsCurrVal = clock;
			writeVarUint(this.restEncoder, diff);
		}
		/**
		* @param {number} len
		*/
		writeDsLen(len) {
			if (len === 0) unexpectedCase();
			writeVarUint(this.restEncoder, len - 1);
			this.dsCurrVal += len;
		}
	};
	var UpdateEncoderV2 = class extends DSEncoderV2 {
		constructor() {
			super();
			/**
			* @type {Map<string,number>}
			*/
			this.keyMap = /* @__PURE__ */ new Map();
			/**
			* Refers to the next unique key-identifier to me used.
			* See writeKey method for more information.
			*
			* @type {number}
			*/
			this.keyClock = 0;
			this.keyClockEncoder = new IntDiffOptRleEncoder();
			this.clientEncoder = new UintOptRleEncoder();
			this.leftClockEncoder = new IntDiffOptRleEncoder();
			this.rightClockEncoder = new IntDiffOptRleEncoder();
			this.infoEncoder = new RleEncoder(writeUint8);
			this.stringEncoder = new StringEncoder();
			this.parentInfoEncoder = new RleEncoder(writeUint8);
			this.typeRefEncoder = new UintOptRleEncoder();
			this.lenEncoder = new UintOptRleEncoder();
		}
		toUint8Array() {
			const encoder = createEncoder();
			writeVarUint(encoder, 0);
			writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
			writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
			writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
			writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
			writeVarUint8Array(encoder, toUint8Array(this.infoEncoder));
			writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
			writeVarUint8Array(encoder, toUint8Array(this.parentInfoEncoder));
			writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
			writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
			writeUint8Array(encoder, toUint8Array(this.restEncoder));
			return toUint8Array(encoder);
		}
		/**
		* @param {ID} id
		*/
		writeLeftID(id) {
			this.clientEncoder.write(id.client);
			this.leftClockEncoder.write(id.clock);
		}
		/**
		* @param {ID} id
		*/
		writeRightID(id) {
			this.clientEncoder.write(id.client);
			this.rightClockEncoder.write(id.clock);
		}
		/**
		* @param {number} client
		*/
		writeClient(client) {
			this.clientEncoder.write(client);
		}
		/**
		* @param {number} info An unsigned 8-bit integer
		*/
		writeInfo(info) {
			this.infoEncoder.write(info);
		}
		/**
		* @param {string} s
		*/
		writeString(s) {
			this.stringEncoder.write(s);
		}
		/**
		* @param {boolean} isYKey
		*/
		writeParentInfo(isYKey) {
			this.parentInfoEncoder.write(isYKey ? 1 : 0);
		}
		/**
		* @param {number} info An unsigned 8-bit integer
		*/
		writeTypeRef(info) {
			this.typeRefEncoder.write(info);
		}
		/**
		* Write len of a struct - well suited for Opt RLE encoder.
		*
		* @param {number} len
		*/
		writeLen(len) {
			this.lenEncoder.write(len);
		}
		/**
		* @param {any} any
		*/
		writeAny(any) {
			writeAny(this.restEncoder, any);
		}
		/**
		* @param {Uint8Array} buf
		*/
		writeBuf(buf) {
			writeVarUint8Array(this.restEncoder, buf);
		}
		/**
		* This is mainly here for legacy purposes.
		*
		* Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
		*
		* @param {any} embed
		*/
		writeJSON(embed) {
			writeAny(this.restEncoder, embed);
		}
		/**
		* Property keys are often reused. For example, in y-prosemirror the key `bold` might
		* occur very often. For a 3d application, the key `position` might occur very often.
		*
		* We cache these keys in a Map and refer to them via a unique number.
		*
		* @param {string} key
		*/
		writeKey(key) {
			const clock = this.keyMap.get(key);
			if (clock === void 0) {
				/**
				* @todo uncomment to introduce this feature finally
				*
				* Background. The ContentFormat object was always encoded using writeKey, but the decoder used to use readString.
				* Furthermore, I forgot to set the keyclock. So everything was working fine.
				*
				* However, this feature here is basically useless as it is not being used (it actually only consumes extra memory).
				*
				* I don't know yet how to reintroduce this feature..
				*
				* Older clients won't be able to read updates when we reintroduce this feature. So this should probably be done using a flag.
				*
				*/
				this.keyClockEncoder.write(this.keyClock++);
				this.stringEncoder.write(key);
			} else this.keyClockEncoder.write(clock);
		}
	};
	/**
	* @module encoding
	*/
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {Array<GC|Item>} structs All structs by `client`
	* @param {number} client
	* @param {number} clock write structs starting with `ID(client,clock)`
	*
	* @function
	*/
	const writeStructs = (encoder, structs, client, clock) => {
		clock = max(clock, structs[0].id.clock);
		const startNewStructs = findIndexSS(structs, clock);
		writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
		encoder.writeClient(client);
		writeVarUint(encoder.restEncoder, clock);
		const firstStruct = structs[startNewStructs];
		firstStruct.write(encoder, clock - firstStruct.id.clock);
		for (let i = startNewStructs + 1; i < structs.length; i++) structs[i].write(encoder, 0);
	};
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {StructStore} store
	* @param {Map<number,number>} _sm
	*
	* @private
	* @function
	*/
	const writeClientsStructs = (encoder, store, _sm) => {
		const sm = /* @__PURE__ */ new Map();
		_sm.forEach((clock, client) => {
			if (getState(store, client) > clock) sm.set(client, clock);
		});
		getStateVector(store).forEach((_clock, client) => {
			if (!_sm.has(client)) sm.set(client, 0);
		});
		writeVarUint(encoder.restEncoder, sm.size);
		from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
			writeStructs(encoder, store.clients.get(client), client, clock);
		});
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder The decoder object to read data from.
	* @param {Doc} doc
	* @return {Map<number, { i: number, refs: Array<Item | GC> }>}
	*
	* @private
	* @function
	*/
	const readClientsStructRefs = (decoder, doc) => {
		/**
		* @type {Map<number, { i: number, refs: Array<Item | GC> }>}
		*/
		const clientRefs = create$7();
		const numOfStateUpdates = readVarUint(decoder.restDecoder);
		for (let i = 0; i < numOfStateUpdates; i++) {
			const numberOfStructs = readVarUint(decoder.restDecoder);
			/**
			* @type {Array<GC|Item>}
			*/
			const refs = new Array(numberOfStructs);
			const client = decoder.readClient();
			let clock = readVarUint(decoder.restDecoder);
			clientRefs.set(client, {
				i: 0,
				refs
			});
			for (let i = 0; i < numberOfStructs; i++) {
				const info = decoder.readInfo();
				switch (31 & info) {
					case 0: {
						const len = decoder.readLen();
						refs[i] = new GC(createID(client, clock), len);
						clock += len;
						break;
					}
					case 10: {
						const len = readVarUint(decoder.restDecoder);
						refs[i] = new Skip(createID(client, clock), len);
						clock += len;
						break;
					}
					default: {
						/**
						* The optimized implementation doesn't use any variables because inlining variables is faster.
						* Below a non-optimized version is shown that implements the basic algorithm with
						* a few comments
						*/
						const cantCopyParentInfo = (info & (64 | 128)) === 0;
						const struct = new Item(createID(client, clock), null, (info & 128) === 128 ? decoder.readLeftID() : null, null, (info & 64) === 64 ? decoder.readRightID() : null, cantCopyParentInfo ? decoder.readParentInfo() ? doc.get(decoder.readString()) : decoder.readLeftID() : null, cantCopyParentInfo && (info & 32) === 32 ? decoder.readString() : null, readItemContent(decoder, info));
						refs[i] = struct;
						clock += struct.length;
					}
				}
			}
		}
		return clientRefs;
	};
	/**
	* Resume computing structs generated by struct readers.
	*
	* While there is something to do, we integrate structs in this order
	* 1. top element on stack, if stack is not empty
	* 2. next element from current struct reader (if empty, use next struct reader)
	*
	* If struct causally depends on another struct (ref.missing), we put next reader of
	* `ref.id.client` on top of stack.
	*
	* At some point we find a struct that has no causal dependencies,
	* then we start emptying the stack.
	*
	* It is not possible to have circles: i.e. struct1 (from client1) depends on struct2 (from client2)
	* depends on struct3 (from client1). Therefore the max stack size is equal to `structReaders.length`.
	*
	* This method is implemented in a way so that we can resume computation if this update
	* causally depends on another update.
	*
	* @param {Transaction} transaction
	* @param {StructStore} store
	* @param {Map<number, { i: number, refs: (GC | Item)[] }>} clientsStructRefs
	* @return { null | { update: Uint8Array, missing: Map<number,number> } }
	*
	* @private
	* @function
	*/
	const integrateStructs = (transaction, store, clientsStructRefs) => {
		/**
		* @type {Array<Item | GC>}
		*/
		const stack = [];
		let clientsStructRefsIds = from(clientsStructRefs.keys()).sort((a, b) => a - b);
		if (clientsStructRefsIds.length === 0) return null;
		const getNextStructTarget = () => {
			if (clientsStructRefsIds.length === 0) return null;
			let nextStructsTarget = clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
			while (nextStructsTarget.refs.length === nextStructsTarget.i) {
				clientsStructRefsIds.pop();
				if (clientsStructRefsIds.length > 0) nextStructsTarget = clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
				else return null;
			}
			return nextStructsTarget;
		};
		let curStructsTarget = getNextStructTarget();
		if (curStructsTarget === null) return null;
		/**
		* @type {StructStore}
		*/
		const restStructs = new StructStore();
		const missingSV = /* @__PURE__ */ new Map();
		/**
		* @param {number} client
		* @param {number} clock
		*/
		const updateMissingSv = (client, clock) => {
			const mclock = missingSV.get(client);
			if (mclock == null || mclock > clock) missingSV.set(client, clock);
		};
		/**
		* @type {GC|Item}
		*/
		let stackHead = curStructsTarget.refs[curStructsTarget.i++];
		const state = /* @__PURE__ */ new Map();
		const addStackToRestSS = () => {
			for (const item of stack) {
				const client = item.id.client;
				const inapplicableItems = clientsStructRefs.get(client);
				if (inapplicableItems) {
					inapplicableItems.i--;
					restStructs.clients.set(client, inapplicableItems.refs.slice(inapplicableItems.i));
					clientsStructRefs.delete(client);
					inapplicableItems.i = 0;
					inapplicableItems.refs = [];
				} else restStructs.clients.set(client, [item]);
				clientsStructRefsIds = clientsStructRefsIds.filter((c) => c !== client);
			}
			stack.length = 0;
		};
		while (true) {
			if (stackHead.constructor !== Skip) {
				const offset = setIfUndefined(state, stackHead.id.client, () => getState(store, stackHead.id.client)) - stackHead.id.clock;
				if (offset < 0) {
					stack.push(stackHead);
					updateMissingSv(stackHead.id.client, stackHead.id.clock - 1);
					addStackToRestSS();
				} else {
					const missing = stackHead.getMissing(transaction, store);
					if (missing !== null) {
						stack.push(stackHead);
						/**
						* @type {{ refs: Array<GC|Item>, i: number }}
						*/
						const structRefs = clientsStructRefs.get(missing) || {
							refs: [],
							i: 0
						};
						if (structRefs.refs.length === structRefs.i) {
							updateMissingSv(missing, getState(store, missing));
							addStackToRestSS();
						} else {
							stackHead = structRefs.refs[structRefs.i++];
							continue;
						}
					} else if (offset === 0 || offset < stackHead.length) {
						stackHead.integrate(transaction, offset);
						state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
					}
				}
			}
			if (stack.length > 0) stackHead = stack.pop();
			else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) stackHead = curStructsTarget.refs[curStructsTarget.i++];
			else {
				curStructsTarget = getNextStructTarget();
				if (curStructsTarget === null) break;
				else stackHead = curStructsTarget.refs[curStructsTarget.i++];
			}
		}
		if (restStructs.clients.size > 0) {
			const encoder = new UpdateEncoderV2();
			writeClientsStructs(encoder, restStructs, /* @__PURE__ */ new Map());
			writeVarUint(encoder.restEncoder, 0);
			return {
				missing: missingSV,
				update: encoder.toUint8Array()
			};
		}
		return null;
	};
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {Transaction} transaction
	*
	* @private
	* @function
	*/
	const writeStructsFromTransaction = (encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState);
	/**
	* Read and apply a document update.
	*
	* This function has the same effect as `applyUpdate` but accepts a decoder.
	*
	* @param {decoding.Decoder} decoder
	* @param {Doc} ydoc
	* @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
	* @param {UpdateDecoderV1 | UpdateDecoderV2} [structDecoder]
	*
	* @function
	*/
	const readUpdateV2 = (decoder, ydoc, transactionOrigin, structDecoder = new UpdateDecoderV2(decoder)) => transact(ydoc, (transaction) => {
		transaction.local = false;
		let retry = false;
		const doc = transaction.doc;
		const store = doc.store;
		const ss = readClientsStructRefs(structDecoder, doc);
		const restStructs = integrateStructs(transaction, store, ss);
		const pending = store.pendingStructs;
		if (pending) {
			for (const [client, clock] of pending.missing) if (clock < getState(store, client)) {
				retry = true;
				break;
			}
			if (restStructs) {
				for (const [client, clock] of restStructs.missing) {
					const mclock = pending.missing.get(client);
					if (mclock == null || mclock > clock) pending.missing.set(client, clock);
				}
				pending.update = mergeUpdatesV2([pending.update, restStructs.update]);
			}
		} else store.pendingStructs = restStructs;
		const dsRest = readAndApplyDeleteSet(structDecoder, transaction, store);
		if (store.pendingDs) {
			const pendingDSUpdate = new UpdateDecoderV2(createDecoder(store.pendingDs));
			readVarUint(pendingDSUpdate.restDecoder);
			const dsRest2 = readAndApplyDeleteSet(pendingDSUpdate, transaction, store);
			if (dsRest && dsRest2) store.pendingDs = mergeUpdatesV2([dsRest, dsRest2]);
			else store.pendingDs = dsRest || dsRest2;
		} else store.pendingDs = dsRest;
		if (retry) {
			const update = store.pendingStructs.update;
			store.pendingStructs = null;
			applyUpdateV2(transaction.doc, update);
		}
	}, transactionOrigin, false);
	/**
	* Read and apply a document update.
	*
	* This function has the same effect as `applyUpdate` but accepts a decoder.
	*
	* @param {decoding.Decoder} decoder
	* @param {Doc} ydoc
	* @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
	*
	* @function
	*/
	const readUpdate$1 = (decoder, ydoc, transactionOrigin) => readUpdateV2(decoder, ydoc, transactionOrigin, new UpdateDecoderV1(decoder));
	/**
	* Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
	*
	* This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
	*
	* @param {Doc} ydoc
	* @param {Uint8Array} update
	* @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
	* @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
	*
	* @function
	*/
	const applyUpdateV2 = (ydoc, update, transactionOrigin, YDecoder = UpdateDecoderV2) => {
		const decoder = createDecoder(update);
		readUpdateV2(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
	};
	/**
	* Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
	*
	* This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
	*
	* @param {Doc} ydoc
	* @param {Uint8Array} update
	* @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
	*
	* @function
	*/
	const applyUpdate = (ydoc, update, transactionOrigin) => applyUpdateV2(ydoc, update, transactionOrigin, UpdateDecoderV1);
	/**
	* Write all the document as a single update message. If you specify the state of the remote client (`targetStateVector`) it will
	* only write the operations that are missing.
	*
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {Doc} doc
	* @param {Map<number,number>} [targetStateVector] The state of the target that receives the update. Leave empty to write all known structs
	*
	* @function
	*/
	const writeStateAsUpdate = (encoder, doc, targetStateVector = /* @__PURE__ */ new Map()) => {
		writeClientsStructs(encoder, doc.store, targetStateVector);
		writeDeleteSet(encoder, createDeleteSetFromStructStore(doc.store));
	};
	/**
	* Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
	* only write the operations that are missing.
	*
	* Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
	*
	* @param {Doc} doc
	* @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
	* @param {UpdateEncoderV1 | UpdateEncoderV2} [encoder]
	* @return {Uint8Array}
	*
	* @function
	*/
	const encodeStateAsUpdateV2 = (doc, encodedTargetStateVector = new Uint8Array([0]), encoder = new UpdateEncoderV2()) => {
		const targetStateVector = decodeStateVector(encodedTargetStateVector);
		writeStateAsUpdate(encoder, doc, targetStateVector);
		const updates = [encoder.toUint8Array()];
		if (doc.store.pendingDs) updates.push(doc.store.pendingDs);
		if (doc.store.pendingStructs) updates.push(diffUpdateV2(doc.store.pendingStructs.update, encodedTargetStateVector));
		if (updates.length > 1) {
			if (encoder.constructor === UpdateEncoderV1) return mergeUpdates(updates.map((update, i) => i === 0 ? update : convertUpdateFormatV2ToV1(update)));
			else if (encoder.constructor === UpdateEncoderV2) return mergeUpdatesV2(updates);
		}
		return updates[0];
	};
	/**
	* Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
	* only write the operations that are missing.
	*
	* Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
	*
	* @param {Doc} doc
	* @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
	* @return {Uint8Array}
	*
	* @function
	*/
	const encodeStateAsUpdate = (doc, encodedTargetStateVector) => encodeStateAsUpdateV2(doc, encodedTargetStateVector, new UpdateEncoderV1());
	/**
	* Read state vector from Decoder and return as Map
	*
	* @param {DSDecoderV1 | DSDecoderV2} decoder
	* @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
	*
	* @function
	*/
	const readStateVector = (decoder) => {
		const ss = /* @__PURE__ */ new Map();
		const ssLength = readVarUint(decoder.restDecoder);
		for (let i = 0; i < ssLength; i++) {
			const client = readVarUint(decoder.restDecoder);
			const clock = readVarUint(decoder.restDecoder);
			ss.set(client, clock);
		}
		return ss;
	};
	/**
	* Read decodedState and return State as Map.
	*
	* @param {Uint8Array} decodedState
	* @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
	*
	* @function
	*/
	/**
	* Read decodedState and return State as Map.
	*
	* @param {Uint8Array} decodedState
	* @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
	*
	* @function
	*/
	const decodeStateVector = (decodedState) => readStateVector(new DSDecoderV1(createDecoder(decodedState)));
	/**
	* @param {DSEncoderV1 | DSEncoderV2} encoder
	* @param {Map<number,number>} sv
	* @function
	*/
	const writeStateVector = (encoder, sv) => {
		writeVarUint(encoder.restEncoder, sv.size);
		from(sv.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
			writeVarUint(encoder.restEncoder, client);
			writeVarUint(encoder.restEncoder, clock);
		});
		return encoder;
	};
	/**
	* @param {DSEncoderV1 | DSEncoderV2} encoder
	* @param {Doc} doc
	*
	* @function
	*/
	const writeDocumentStateVector = (encoder, doc) => writeStateVector(encoder, getStateVector(doc.store));
	/**
	* Encode State as Uint8Array.
	*
	* @param {Doc|Map<number,number>} doc
	* @param {DSEncoderV1 | DSEncoderV2} [encoder]
	* @return {Uint8Array}
	*
	* @function
	*/
	const encodeStateVectorV2 = (doc, encoder = new DSEncoderV2()) => {
		if (doc instanceof Map) writeStateVector(encoder, doc);
		else writeDocumentStateVector(encoder, doc);
		return encoder.toUint8Array();
	};
	/**
	* Encode State as Uint8Array.
	*
	* @param {Doc|Map<number,number>} doc
	* @return {Uint8Array}
	*
	* @function
	*/
	const encodeStateVector = (doc) => encodeStateVectorV2(doc, new DSEncoderV1());
	/**
	* General event handler implementation.
	*
	* @template ARG0, ARG1
	*
	* @private
	*/
	var EventHandler = class {
		constructor() {
			/**
			* @type {Array<function(ARG0, ARG1):void>}
			*/
			this.l = [];
		}
	};
	/**
	* @template ARG0,ARG1
	* @returns {EventHandler<ARG0,ARG1>}
	*
	* @private
	* @function
	*/
	const createEventHandler = () => new EventHandler();
	/**
	* Adds an event listener that is called when
	* {@link EventHandler#callEventListeners} is called.
	*
	* @template ARG0,ARG1
	* @param {EventHandler<ARG0,ARG1>} eventHandler
	* @param {function(ARG0,ARG1):void} f The event handler.
	*
	* @private
	* @function
	*/
	const addEventHandlerListener = (eventHandler, f) => eventHandler.l.push(f);
	/**
	* Removes an event listener.
	*
	* @template ARG0,ARG1
	* @param {EventHandler<ARG0,ARG1>} eventHandler
	* @param {function(ARG0,ARG1):void} f The event handler that was added with
	*                     {@link EventHandler#addEventListener}
	*
	* @private
	* @function
	*/
	const removeEventHandlerListener = (eventHandler, f) => {
		const l = eventHandler.l;
		const len = l.length;
		eventHandler.l = l.filter((g) => f !== g);
		if (len === eventHandler.l.length) console.error("[yjs] Tried to remove event handler that doesn't exist.");
	};
	/**
	* Call all event listeners that were added via
	* {@link EventHandler#addEventListener}.
	*
	* @template ARG0,ARG1
	* @param {EventHandler<ARG0,ARG1>} eventHandler
	* @param {ARG0} arg0
	* @param {ARG1} arg1
	*
	* @private
	* @function
	*/
	const callEventHandlerListeners = (eventHandler, arg0, arg1) => callAll(eventHandler.l, [arg0, arg1]);
	var ID = class {
		/**
		* @param {number} client client id
		* @param {number} clock unique per client id, continuous number
		*/
		constructor(client, clock) {
			/**
			* Client id
			* @type {number}
			*/
			this.client = client;
			/**
			* unique per client id, continuous number
			* @type {number}
			*/
			this.clock = clock;
		}
	};
	/**
	* @param {ID | null} a
	* @param {ID | null} b
	* @return {boolean}
	*
	* @function
	*/
	const compareIDs = (a, b) => a === b || a !== null && b !== null && a.client === b.client && a.clock === b.clock;
	/**
	* @param {number} client
	* @param {number} clock
	*
	* @private
	* @function
	*/
	const createID = (client, clock) => new ID(client, clock);
	/**
	* @param {encoding.Encoder} encoder
	* @param {ID} id
	*
	* @private
	* @function
	*/
	const writeID = (encoder, id) => {
		writeVarUint(encoder, id.client);
		writeVarUint(encoder, id.clock);
	};
	/**
	* Read ID.
	* * If first varUint read is 0xFFFFFF a RootID is returned.
	* * Otherwise an ID is returned
	*
	* @param {decoding.Decoder} decoder
	* @return {ID}
	*
	* @private
	* @function
	*/
	const readID = (decoder) => createID(readVarUint(decoder), readVarUint(decoder));
	/**
	* The top types are mapped from y.share.get(keyname) => type.
	* `type` does not store any information about the `keyname`.
	* This function finds the correct `keyname` for `type` and throws otherwise.
	*
	* @param {AbstractType<any>} type
	* @return {string}
	*
	* @private
	* @function
	*/
	const findRootTypeKey = (type) => {
		for (const [key, value] of type.doc.share.entries()) if (value === type) return key;
		throw unexpectedCase();
	};
	/**
	* Check if `parent` is a parent of `child`.
	*
	* @param {AbstractType<any>} parent
	* @param {Item|null} child
	* @return {Boolean} Whether `parent` is a parent of `child`.
	*
	* @private
	* @function
	*/
	const isParentOf = (parent, child) => {
		while (child !== null) {
			if (child.parent === parent) return true;
			child = child.parent._item;
		}
		return false;
	};
	/**
	* Convenient helper to log type information.
	*
	* Do not use in productive systems as the output can be immense!
	*
	* @param {AbstractType<any>} type
	*/
	const logType = (type) => {
		const res = [];
		let n = type._start;
		while (n) {
			res.push(n);
			n = n.right;
		}
		console.log("Children: ", res);
		console.log("Children content: ", res.filter((m) => !m.deleted).map((m) => m.content));
	};
	var PermanentUserData = class {
		/**
		* @param {Doc} doc
		* @param {YMap<any>} [storeType]
		*/
		constructor(doc, storeType = doc.getMap("users")) {
			/**
			* @type {Map<string,DeleteSet>}
			*/
			const dss = /* @__PURE__ */ new Map();
			this.yusers = storeType;
			this.doc = doc;
			/**
			* Maps from clientid to userDescription
			*
			* @type {Map<number,string>}
			*/
			this.clients = /* @__PURE__ */ new Map();
			this.dss = dss;
			/**
			* @param {YMap<any>} user
			* @param {string} userDescription
			*/
			const initUser = (user, userDescription) => {
				/**
				* @type {YArray<Uint8Array>}
				*/
				const ds = user.get("ds");
				const ids = user.get("ids");
				const addClientId = (clientid) => this.clients.set(clientid, userDescription);
				ds.observe(
					/** @param {YArrayEvent<any>} event */
					(event) => {
						event.changes.added.forEach((item) => {
							item.content.getContent().forEach((encodedDs) => {
								if (encodedDs instanceof Uint8Array) this.dss.set(userDescription, mergeDeleteSets([this.dss.get(userDescription) || createDeleteSet(), readDeleteSet(new DSDecoderV1(createDecoder(encodedDs)))]));
							});
						});
					}
				);
				this.dss.set(userDescription, mergeDeleteSets(ds.map((encodedDs) => readDeleteSet(new DSDecoderV1(createDecoder(encodedDs))))));
				ids.observe(
					/** @param {YArrayEvent<any>} event */
					(event) => event.changes.added.forEach((item) => item.content.getContent().forEach(addClientId))
				);
				ids.forEach(addClientId);
			};
			storeType.observe((event) => {
				event.keysChanged.forEach((userDescription) => initUser(storeType.get(userDescription), userDescription));
			});
			storeType.forEach(initUser);
		}
		/**
		* @param {Doc} doc
		* @param {number} clientid
		* @param {string} userDescription
		* @param {Object} conf
		* @param {function(Transaction, DeleteSet):boolean} [conf.filter]
		*/
		setUserMapping(doc, clientid, userDescription, { filter = () => true } = {}) {
			const users = this.yusers;
			let user = users.get(userDescription);
			if (!user) {
				user = new YMap();
				user.set("ids", new YArray());
				user.set("ds", new YArray());
				users.set(userDescription, user);
			}
			user.get("ids").push([clientid]);
			users.observe((_event) => {
				setTimeout(() => {
					const userOverwrite = users.get(userDescription);
					if (userOverwrite !== user) {
						user = userOverwrite;
						this.clients.forEach((_userDescription, clientid) => {
							if (userDescription === _userDescription) user.get("ids").push([clientid]);
						});
						const encoder = new DSEncoderV1();
						const ds = this.dss.get(userDescription);
						if (ds) {
							writeDeleteSet(encoder, ds);
							user.get("ds").push([encoder.toUint8Array()]);
						}
					}
				}, 0);
			});
			doc.on(
				"afterTransaction",
				/** @param {Transaction} transaction */
				(transaction) => {
					setTimeout(() => {
						const yds = user.get("ds");
						const ds = transaction.deleteSet;
						if (transaction.local && ds.clients.size > 0 && filter(transaction, ds)) {
							const encoder = new DSEncoderV1();
							writeDeleteSet(encoder, ds);
							yds.push([encoder.toUint8Array()]);
						}
					});
				}
			);
		}
		/**
		* @param {number} clientid
		* @return {any}
		*/
		getUserByClientId(clientid) {
			return this.clients.get(clientid) || null;
		}
		/**
		* @param {ID} id
		* @return {string | null}
		*/
		getUserByDeletedId(id) {
			for (const [userDescription, ds] of this.dss.entries()) if (isDeleted(ds, id)) return userDescription;
			return null;
		}
	};
	/**
	* A relative position is based on the Yjs model and is not affected by document changes.
	* E.g. If you place a relative position before a certain character, it will always point to this character.
	* If you place a relative position at the end of a type, it will always point to the end of the type.
	*
	* A numeric position is often unsuited for user selections, because it does not change when content is inserted
	* before or after.
	*
	* ```Insert(0, 'x')('a|bc') = 'xa|bc'``` Where | is the relative position.
	*
	* One of the properties must be defined.
	*
	* @example
	*   // Current cursor position is at position 10
	*   const relativePosition = createRelativePositionFromIndex(yText, 10)
	*   // modify yText
	*   yText.insert(0, 'abc')
	*   yText.delete(3, 10)
	*   // Compute the cursor position
	*   const absolutePosition = createAbsolutePositionFromRelativePosition(y, relativePosition)
	*   absolutePosition.type === yText // => true
	*   console.log('cursor location is ' + absolutePosition.index) // => cursor location is 3
	*
	*/
	var RelativePosition = class {
		/**
		* @param {ID|null} type
		* @param {string|null} tname
		* @param {ID|null} item
		* @param {number} assoc
		*/
		constructor(type, tname, item, assoc = 0) {
			/**
			* @type {ID|null}
			*/
			this.type = type;
			/**
			* @type {string|null}
			*/
			this.tname = tname;
			/**
			* @type {ID | null}
			*/
			this.item = item;
			/**
			* A relative position is associated to a specific character. By default
			* assoc >= 0, the relative position is associated to the character
			* after the meant position.
			* I.e. position 1 in 'ab' is associated to character 'b'.
			*
			* If assoc < 0, then the relative position is associated to the character
			* before the meant position.
			*
			* @type {number}
			*/
			this.assoc = assoc;
		}
	};
	/**
	* @param {RelativePosition} rpos
	* @return {any}
	*/
	const relativePositionToJSON = (rpos) => {
		const json = {};
		if (rpos.type) json.type = rpos.type;
		if (rpos.tname) json.tname = rpos.tname;
		if (rpos.item) json.item = rpos.item;
		if (rpos.assoc != null) json.assoc = rpos.assoc;
		return json;
	};
	/**
	* @param {any} json
	* @return {RelativePosition}
	*
	* @function
	*/
	const createRelativePositionFromJSON = (json) => new RelativePosition(json.type == null ? null : createID(json.type.client, json.type.clock), json.tname ?? null, json.item == null ? null : createID(json.item.client, json.item.clock), json.assoc == null ? 0 : json.assoc);
	var AbsolutePosition = class {
		/**
		* @param {AbstractType<any>} type
		* @param {number} index
		* @param {number} [assoc]
		*/
		constructor(type, index, assoc = 0) {
			/**
			* @type {AbstractType<any>}
			*/
			this.type = type;
			/**
			* @type {number}
			*/
			this.index = index;
			this.assoc = assoc;
		}
	};
	/**
	* @param {AbstractType<any>} type
	* @param {number} index
	* @param {number} [assoc]
	*
	* @function
	*/
	const createAbsolutePosition = (type, index, assoc = 0) => new AbsolutePosition(type, index, assoc);
	/**
	* @param {AbstractType<any>} type
	* @param {ID|null} item
	* @param {number} [assoc]
	*
	* @function
	*/
	const createRelativePosition = (type, item, assoc) => {
		let typeid = null;
		let tname = null;
		if (type._item === null) tname = findRootTypeKey(type);
		else typeid = createID(type._item.id.client, type._item.id.clock);
		return new RelativePosition(typeid, tname, item, assoc);
	};
	/**
	* Create a relativePosition based on a absolute position.
	*
	* @param {AbstractType<any>} type The base type (e.g. YText or YArray).
	* @param {number} index The absolute position.
	* @param {number} [assoc]
	* @return {RelativePosition}
	*
	* @function
	*/
	const createRelativePositionFromTypeIndex = (type, index, assoc = 0) => {
		let t = type._start;
		if (assoc < 0) {
			if (index === 0) return createRelativePosition(type, null, assoc);
			index--;
		}
		while (t !== null) {
			if (!t.deleted && t.countable) {
				if (t.length > index) return createRelativePosition(type, createID(t.id.client, t.id.clock + index), assoc);
				index -= t.length;
			}
			if (t.right === null && assoc < 0) return createRelativePosition(type, t.lastId, assoc);
			t = t.right;
		}
		return createRelativePosition(type, null, assoc);
	};
	/**
	* @param {encoding.Encoder} encoder
	* @param {RelativePosition} rpos
	*
	* @function
	*/
	const writeRelativePosition = (encoder, rpos) => {
		const { type, tname, item, assoc } = rpos;
		if (item !== null) {
			writeVarUint(encoder, 0);
			writeID(encoder, item);
		} else if (tname !== null) {
			writeUint8(encoder, 1);
			writeVarString(encoder, tname);
		} else if (type !== null) {
			writeUint8(encoder, 2);
			writeID(encoder, type);
		} else throw unexpectedCase();
		writeVarInt(encoder, assoc);
		return encoder;
	};
	/**
	* @param {RelativePosition} rpos
	* @return {Uint8Array}
	*/
	const encodeRelativePosition = (rpos) => {
		const encoder = createEncoder();
		writeRelativePosition(encoder, rpos);
		return toUint8Array(encoder);
	};
	/**
	* @param {decoding.Decoder} decoder
	* @return {RelativePosition}
	*
	* @function
	*/
	const readRelativePosition = (decoder) => {
		let type = null;
		let tname = null;
		let itemID = null;
		switch (readVarUint(decoder)) {
			case 0:
				itemID = readID(decoder);
				break;
			case 1:
				tname = readVarString(decoder);
				break;
			case 2: type = readID(decoder);
		}
		const assoc = hasContent(decoder) ? readVarInt(decoder) : 0;
		return new RelativePosition(type, tname, itemID, assoc);
	};
	/**
	* @param {Uint8Array} uint8Array
	* @return {RelativePosition}
	*/
	const decodeRelativePosition = (uint8Array) => readRelativePosition(createDecoder(uint8Array));
	/**
	* @param {StructStore} store
	* @param {ID} id
	*/
	const getItemWithOffset = (store, id) => {
		const item = getItem(store, id);
		return {
			item,
			diff: id.clock - item.id.clock
		};
	};
	/**
	* Transform a relative position to an absolute position.
	*
	* If you want to share the relative position with other users, you should set
	* `followUndoneDeletions` to false to get consistent results across all clients.
	*
	* When calculating the absolute position, we try to follow the "undone deletions". This yields
	* better results for the user who performed undo. However, only the user who performed the undo
	* will get the better results, the other users don't know which operations recreated a deleted
	* range of content. There is more information in this ticket: https://github.com/yjs/yjs/issues/638
	*
	* @param {RelativePosition} rpos
	* @param {Doc} doc
	* @param {boolean} followUndoneDeletions - whether to follow undone deletions - see https://github.com/yjs/yjs/issues/638
	* @return {AbsolutePosition|null}
	*
	* @function
	*/
	const createAbsolutePositionFromRelativePosition = (rpos, doc, followUndoneDeletions = true) => {
		const store = doc.store;
		const rightID = rpos.item;
		const typeID = rpos.type;
		const tname = rpos.tname;
		const assoc = rpos.assoc;
		let type = null;
		let index = 0;
		if (rightID !== null) {
			if (getState(store, rightID.client) <= rightID.clock) return null;
			const res = followUndoneDeletions ? followRedone(store, rightID) : getItemWithOffset(store, rightID);
			const right = res.item;
			if (!(right instanceof Item)) return null;
			type = right.parent;
			if (type._item === null || !type._item.deleted) {
				index = right.deleted || !right.countable ? 0 : res.diff + (assoc >= 0 ? 0 : 1);
				let n = right.left;
				while (n !== null) {
					if (!n.deleted && n.countable) index += n.length;
					n = n.left;
				}
			}
		} else {
			if (tname !== null) type = doc.get(tname);
			else if (typeID !== null) {
				if (getState(store, typeID.client) <= typeID.clock) return null;
				const { item } = followUndoneDeletions ? followRedone(store, typeID) : { item: getItem(store, typeID) };
				if (item instanceof Item && item.content instanceof ContentType) type = item.content.type;
				else return null;
			} else throw unexpectedCase();
			if (assoc >= 0) index = type._length;
			else index = 0;
		}
		return createAbsolutePosition(type, index, rpos.assoc);
	};
	/**
	* @param {RelativePosition|null} a
	* @param {RelativePosition|null} b
	* @return {boolean}
	*
	* @function
	*/
	const compareRelativePositions = (a, b) => a === b || a !== null && b !== null && a.tname === b.tname && compareIDs(a.item, b.item) && compareIDs(a.type, b.type) && a.assoc === b.assoc;
	var Snapshot = class {
		/**
		* @param {DeleteSet} ds
		* @param {Map<number,number>} sv state map
		*/
		constructor(ds, sv) {
			/**
			* @type {DeleteSet}
			*/
			this.ds = ds;
			/**
			* State Map
			* @type {Map<number,number>}
			*/
			this.sv = sv;
		}
	};
	/**
	* @param {Snapshot} snap1
	* @param {Snapshot} snap2
	* @return {boolean}
	*/
	const equalSnapshots = (snap1, snap2) => {
		const ds1 = snap1.ds.clients;
		const ds2 = snap2.ds.clients;
		const sv1 = snap1.sv;
		const sv2 = snap2.sv;
		if (sv1.size !== sv2.size || ds1.size !== ds2.size) return false;
		for (const [key, value] of sv1.entries()) if (sv2.get(key) !== value) return false;
		for (const [client, dsitems1] of ds1.entries()) {
			const dsitems2 = ds2.get(client) || [];
			if (dsitems1.length !== dsitems2.length) return false;
			for (let i = 0; i < dsitems1.length; i++) {
				const dsitem1 = dsitems1[i];
				const dsitem2 = dsitems2[i];
				if (dsitem1.clock !== dsitem2.clock || dsitem1.len !== dsitem2.len) return false;
			}
		}
		return true;
	};
	/**
	* @param {Snapshot} snapshot
	* @param {DSEncoderV1 | DSEncoderV2} [encoder]
	* @return {Uint8Array}
	*/
	const encodeSnapshotV2 = (snapshot, encoder = new DSEncoderV2()) => {
		writeDeleteSet(encoder, snapshot.ds);
		writeStateVector(encoder, snapshot.sv);
		return encoder.toUint8Array();
	};
	/**
	* @param {Snapshot} snapshot
	* @return {Uint8Array}
	*/
	const encodeSnapshot = (snapshot) => encodeSnapshotV2(snapshot, new DSEncoderV1());
	/**
	* @param {Uint8Array} buf
	* @param {DSDecoderV1 | DSDecoderV2} [decoder]
	* @return {Snapshot}
	*/
	const decodeSnapshotV2 = (buf, decoder = new DSDecoderV2(createDecoder(buf))) => {
		return new Snapshot(readDeleteSet(decoder), readStateVector(decoder));
	};
	/**
	* @param {Uint8Array} buf
	* @return {Snapshot}
	*/
	const decodeSnapshot = (buf) => decodeSnapshotV2(buf, new DSDecoderV1(createDecoder(buf)));
	/**
	* @param {DeleteSet} ds
	* @param {Map<number,number>} sm
	* @return {Snapshot}
	*/
	const createSnapshot = (ds, sm) => new Snapshot(ds, sm);
	const emptySnapshot = createSnapshot(createDeleteSet(), /* @__PURE__ */ new Map());
	/**
	* @param {Doc} doc
	* @return {Snapshot}
	*/
	const snapshot = (doc) => createSnapshot(createDeleteSetFromStructStore(doc.store), getStateVector(doc.store));
	/**
	* @param {Item} item
	* @param {Snapshot|undefined} snapshot
	*
	* @protected
	* @function
	*/
	const isVisible = (item, snapshot) => snapshot === void 0 ? !item.deleted : snapshot.sv.has(item.id.client) && (snapshot.sv.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot.ds, item.id);
	/**
	* @param {Transaction} transaction
	* @param {Snapshot} snapshot
	*/
	const splitSnapshotAffectedStructs = (transaction, snapshot) => {
		const meta = setIfUndefined(transaction.meta, splitSnapshotAffectedStructs, create$6);
		const store = transaction.doc.store;
		if (!meta.has(snapshot)) {
			snapshot.sv.forEach((clock, client) => {
				if (clock < getState(store, client)) getItemCleanStart(transaction, createID(client, clock));
			});
			iterateDeletedStructs(transaction, snapshot.ds, (_item) => {});
			meta.add(snapshot);
		}
	};
	/**
	* @example
	*  const ydoc = new Y.Doc({ gc: false })
	*  ydoc.getText().insert(0, 'world!')
	*  const snapshot = Y.snapshot(ydoc)
	*  ydoc.getText().insert(0, 'hello ')
	*  const restored = Y.createDocFromSnapshot(ydoc, snapshot)
	*  assert(restored.getText().toString() === 'world!')
	*
	* @param {Doc} originDoc
	* @param {Snapshot} snapshot
	* @param {Doc} [newDoc] Optionally, you may define the Yjs document that receives the data from originDoc
	* @return {Doc}
	*/
	const createDocFromSnapshot = (originDoc, snapshot, newDoc = new Doc()) => {
		if (originDoc.gc) throw new Error("Garbage-collection must be disabled in `originDoc`!");
		const { sv, ds } = snapshot;
		const encoder = new UpdateEncoderV2();
		originDoc.transact((transaction) => {
			let size = 0;
			sv.forEach((clock) => {
				if (clock > 0) size++;
			});
			writeVarUint(encoder.restEncoder, size);
			for (const [client, clock] of sv) {
				if (clock === 0) continue;
				if (clock < getState(originDoc.store, client)) getItemCleanStart(transaction, createID(client, clock));
				const structs = originDoc.store.clients.get(client) || [];
				const lastStructIndex = findIndexSS(structs, clock - 1);
				writeVarUint(encoder.restEncoder, lastStructIndex + 1);
				encoder.writeClient(client);
				writeVarUint(encoder.restEncoder, 0);
				for (let i = 0; i <= lastStructIndex; i++) structs[i].write(encoder, 0);
			}
			writeDeleteSet(encoder, ds);
		});
		applyUpdateV2(newDoc, encoder.toUint8Array(), "snapshot");
		return newDoc;
	};
	/**
	* @param {Snapshot} snapshot
	* @param {Uint8Array} update
	* @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
	*/
	const snapshotContainsUpdateV2 = (snapshot, update, YDecoder = UpdateDecoderV2) => {
		const updateDecoder = new YDecoder(createDecoder(update));
		const lazyDecoder = new LazyStructReader(updateDecoder, false);
		for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) if ((snapshot.sv.get(curr.id.client) || 0) < curr.id.clock + curr.length) return false;
		const mergedDS = mergeDeleteSets([snapshot.ds, readDeleteSet(updateDecoder)]);
		return equalDeleteSets(snapshot.ds, mergedDS);
	};
	/**
	* @param {Snapshot} snapshot
	* @param {Uint8Array} update
	*/
	const snapshotContainsUpdate = (snapshot, update) => snapshotContainsUpdateV2(snapshot, update, UpdateDecoderV1);
	var StructStore = class {
		constructor() {
			/**
			* @type {Map<number,Array<GC|Item>>}
			*/
			this.clients = /* @__PURE__ */ new Map();
			/**
			* @type {null | { missing: Map<number, number>, update: Uint8Array }}
			*/
			this.pendingStructs = null;
			/**
			* @type {null | Uint8Array}
			*/
			this.pendingDs = null;
		}
	};
	/**
	* Return the states as a Map<client,clock>.
	* Note that clock refers to the next expected clock id.
	*
	* @param {StructStore} store
	* @return {Map<number,number>}
	*
	* @public
	* @function
	*/
	const getStateVector = (store) => {
		const sm = /* @__PURE__ */ new Map();
		store.clients.forEach((structs, client) => {
			const struct = structs[structs.length - 1];
			sm.set(client, struct.id.clock + struct.length);
		});
		return sm;
	};
	/**
	* @param {StructStore} store
	* @param {number} client
	* @return {number}
	*
	* @public
	* @function
	*/
	const getState = (store, client) => {
		const structs = store.clients.get(client);
		if (structs === void 0) return 0;
		const lastStruct = structs[structs.length - 1];
		return lastStruct.id.clock + lastStruct.length;
	};
	/**
	* @param {StructStore} store
	* @param {GC|Item} struct
	*
	* @private
	* @function
	*/
	const addStruct = (store, struct) => {
		let structs = store.clients.get(struct.id.client);
		if (structs === void 0) {
			structs = [];
			store.clients.set(struct.id.client, structs);
		} else {
			const lastStruct = structs[structs.length - 1];
			if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) throw unexpectedCase();
		}
		structs.push(struct);
	};
	/**
	* Perform a binary search on a sorted array
	* @param {Array<Item|GC>} structs
	* @param {number} clock
	* @return {number}
	*
	* @private
	* @function
	*/
	const findIndexSS = (structs, clock) => {
		let left = 0;
		let right = structs.length - 1;
		let mid = structs[right];
		let midclock = mid.id.clock;
		if (midclock === clock) return right;
		let midindex = floor(clock / (midclock + mid.length - 1) * right);
		while (left <= right) {
			mid = structs[midindex];
			midclock = mid.id.clock;
			if (midclock <= clock) {
				if (clock < midclock + mid.length) return midindex;
				left = midindex + 1;
			} else right = midindex - 1;
			midindex = floor((left + right) / 2);
		}
		throw unexpectedCase();
	};
	/**
	* Expects that id is actually in store. This function throws or is an infinite loop otherwise.
	*
	* @param {StructStore} store
	* @param {ID} id
	* @return {GC|Item}
	*
	* @private
	* @function
	*/
	const find = (store, id) => {
		/**
		* @type {Array<GC|Item>}
		*/
		const structs = store.clients.get(id.client);
		return structs[findIndexSS(structs, id.clock)];
	};
	/**
	* Expects that id is actually in store. This function throws or is an infinite loop otherwise.
	* @private
	* @function
	*/
	const getItem = find;
	/**
	* @param {Transaction} transaction
	* @param {Array<Item|GC>} structs
	* @param {number} clock
	*/
	const findIndexCleanStart = (transaction, structs, clock) => {
		const index = findIndexSS(structs, clock);
		const struct = structs[index];
		if (struct.id.clock < clock && struct instanceof Item) {
			structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
			return index + 1;
		}
		return index;
	};
	/**
	* Expects that id is actually in store. This function throws or is an infinite loop otherwise.
	*
	* @param {Transaction} transaction
	* @param {ID} id
	* @return {Item}
	*
	* @private
	* @function
	*/
	const getItemCleanStart = (transaction, id) => {
		const structs = transaction.doc.store.clients.get(id.client);
		return structs[findIndexCleanStart(transaction, structs, id.clock)];
	};
	/**
	* Expects that id is actually in store. This function throws or is an infinite loop otherwise.
	*
	* @param {Transaction} transaction
	* @param {StructStore} store
	* @param {ID} id
	* @return {Item}
	*
	* @private
	* @function
	*/
	const getItemCleanEnd = (transaction, store, id) => {
		/**
		* @type {Array<Item>}
		*/
		const structs = store.clients.get(id.client);
		const index = findIndexSS(structs, id.clock);
		const struct = structs[index];
		if (id.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) structs.splice(index + 1, 0, splitItem(transaction, struct, id.clock - struct.id.clock + 1));
		return struct;
	};
	/**
	* Replace `item` with `newitem` in store
	* @param {StructStore} store
	* @param {GC|Item} struct
	* @param {GC|Item} newStruct
	*
	* @private
	* @function
	*/
	const replaceStruct = (store, struct, newStruct) => {
		const structs = store.clients.get(struct.id.client);
		structs[findIndexSS(structs, struct.id.clock)] = newStruct;
	};
	/**
	* Iterate over a range of structs
	*
	* @param {Transaction} transaction
	* @param {Array<Item|GC>} structs
	* @param {number} clockStart Inclusive start
	* @param {number} len
	* @param {function(GC|Item):void} f
	*
	* @function
	*/
	const iterateStructs = (transaction, structs, clockStart, len, f) => {
		if (len === 0) return;
		const clockEnd = clockStart + len;
		let index = findIndexCleanStart(transaction, structs, clockStart);
		let struct;
		do {
			struct = structs[index++];
			if (clockEnd < struct.id.clock + struct.length) findIndexCleanStart(transaction, structs, clockEnd);
			f(struct);
		} while (index < structs.length && structs[index].id.clock < clockEnd);
	};
	/**
	* A transaction is created for every change on the Yjs model. It is possible
	* to bundle changes on the Yjs model in a single transaction to
	* minimize the number on messages sent and the number of observer calls.
	* If possible the user of this library should bundle as many changes as
	* possible. Here is an example to illustrate the advantages of bundling:
	*
	* @example
	* const ydoc = new Y.Doc()
	* const map = ydoc.getMap('map')
	* // Log content when change is triggered
	* map.observe(() => {
	*   console.log('change triggered')
	* })
	* // Each change on the map type triggers a log message:
	* map.set('a', 0) // => "change triggered"
	* map.set('b', 0) // => "change triggered"
	* // When put in a transaction, it will trigger the log after the transaction:
	* ydoc.transact(() => {
	*   map.set('a', 1)
	*   map.set('b', 1)
	* }) // => "change triggered"
	*
	* @public
	*/
	var Transaction = class {
		/**
		* @param {Doc} doc
		* @param {any} origin
		* @param {boolean} local
		*/
		constructor(doc, origin, local) {
			/**
			* The Yjs instance.
			* @type {Doc}
			*/
			this.doc = doc;
			/**
			* Describes the set of deleted items by ids
			* @type {DeleteSet}
			*/
			this.deleteSet = new DeleteSet();
			/**
			* Holds the state before the transaction started.
			* @type {Map<Number,Number>}
			*/
			this.beforeState = getStateVector(doc.store);
			/**
			* Holds the state after the transaction.
			* @type {Map<Number,Number>}
			*/
			this.afterState = /* @__PURE__ */ new Map();
			/**
			* All types that were directly modified (property added or child
			* inserted/deleted). New types are not included in this Set.
			* Maps from type to parentSubs (`item.parentSub = null` for YArray)
			* @type {Map<AbstractType<YEvent<any>>,Set<String|null>>}
			*/
			this.changed = /* @__PURE__ */ new Map();
			/**
			* Stores the events for the types that observe also child elements.
			* It is mainly used by `observeDeep`.
			* @type {Map<AbstractType<YEvent<any>>,Array<YEvent<any>>>}
			*/
			this.changedParentTypes = /* @__PURE__ */ new Map();
			/**
			* @type {Array<AbstractStruct>}
			*/
			this._mergeStructs = [];
			/**
			* @type {any}
			*/
			this.origin = origin;
			/**
			* Stores meta information on the transaction
			* @type {Map<any,any>}
			*/
			this.meta = /* @__PURE__ */ new Map();
			/**
			* Whether this change originates from this doc.
			* @type {boolean}
			*/
			this.local = local;
			/**
			* @type {Set<Doc>}
			*/
			this.subdocsAdded = /* @__PURE__ */ new Set();
			/**
			* @type {Set<Doc>}
			*/
			this.subdocsRemoved = /* @__PURE__ */ new Set();
			/**
			* @type {Set<Doc>}
			*/
			this.subdocsLoaded = /* @__PURE__ */ new Set();
			/**
			* @type {boolean}
			*/
			this._needFormattingCleanup = false;
		}
	};
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {Transaction} transaction
	* @return {boolean} Whether data was written.
	*/
	const writeUpdateMessageFromTransaction = (encoder, transaction) => {
		if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) return false;
		sortAndMergeDeleteSet(transaction.deleteSet);
		writeStructsFromTransaction(encoder, transaction);
		writeDeleteSet(encoder, transaction.deleteSet);
		return true;
	};
	/**
	* If `type.parent` was added in current transaction, `type` technically
	* did not change, it was just added and we should not fire events for `type`.
	*
	* @param {Transaction} transaction
	* @param {AbstractType<YEvent<any>>} type
	* @param {string|null} parentSub
	*/
	const addChangedTypeToTransaction = (transaction, type, parentSub) => {
		const item = type._item;
		if (item === null || item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted) setIfUndefined(transaction.changed, type, create$6).add(parentSub);
	};
	/**
	* @param {Array<AbstractStruct>} structs
	* @param {number} pos
	* @return {number} # of merged structs
	*/
	const tryToMergeWithLefts = (structs, pos) => {
		let right = structs[pos];
		let left = structs[pos - 1];
		let i = pos;
		for (; i > 0; right = left, left = structs[--i - 1]) {
			if (left.deleted === right.deleted && left.constructor === right.constructor) {
				if (left.mergeWith(right)) {
					if (right instanceof Item && right.parentSub !== null && right.parent._map.get(right.parentSub) === right)
 /** @type {AbstractType<any>} */ right.parent._map.set(right.parentSub, left);
					continue;
				}
			}
			break;
		}
		const merged = pos - i;
		if (merged) structs.splice(pos + 1 - merged, merged);
		return merged;
	};
	/**
	* @param {DeleteSet} ds
	* @param {StructStore} store
	* @param {function(Item):boolean} gcFilter
	*/
	const tryGcDeleteSet = (ds, store, gcFilter) => {
		for (const [client, deleteItems] of ds.clients.entries()) {
			const structs = store.clients.get(client);
			for (let di = deleteItems.length - 1; di >= 0; di--) {
				const deleteItem = deleteItems[di];
				const endDeleteItemClock = deleteItem.clock + deleteItem.len;
				for (let si = findIndexSS(structs, deleteItem.clock), struct = structs[si]; si < structs.length && struct.id.clock < endDeleteItemClock; struct = structs[++si]) {
					const struct = structs[si];
					if (deleteItem.clock + deleteItem.len <= struct.id.clock) break;
					if (struct instanceof Item && struct.deleted && !struct.keep && gcFilter(struct)) struct.gc(store, false);
				}
			}
		}
	};
	/**
	* @param {DeleteSet} ds
	* @param {StructStore} store
	*/
	const tryMergeDeleteSet = (ds, store) => {
		ds.clients.forEach((deleteItems, client) => {
			const structs = store.clients.get(client);
			for (let di = deleteItems.length - 1; di >= 0; di--) {
				const deleteItem = deleteItems[di];
				const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
				for (let si = mostRightIndexToCheck, struct = structs[si]; si > 0 && struct.id.clock >= deleteItem.clock; struct = structs[si]) si -= 1 + tryToMergeWithLefts(structs, si);
			}
		});
	};
	/**
	* @param {DeleteSet} ds
	* @param {StructStore} store
	* @param {function(Item):boolean} gcFilter
	*/
	const tryGc = (ds, store, gcFilter) => {
		tryGcDeleteSet(ds, store, gcFilter);
		tryMergeDeleteSet(ds, store);
	};
	/**
	* @param {Array<Transaction>} transactionCleanups
	* @param {number} i
	*/
	const cleanupTransactions = (transactionCleanups, i) => {
		if (i < transactionCleanups.length) {
			const transaction = transactionCleanups[i];
			const doc = transaction.doc;
			const store = doc.store;
			const ds = transaction.deleteSet;
			const mergeStructs = transaction._mergeStructs;
			try {
				sortAndMergeDeleteSet(ds);
				transaction.afterState = getStateVector(transaction.doc.store);
				doc.emit("beforeObserverCalls", [transaction, doc]);
				/**
				* An array of event callbacks.
				*
				* Each callback is called even if the other ones throw errors.
				*
				* @type {Array<function():void>}
				*/
				const fs = [];
				transaction.changed.forEach((subs, itemtype) => fs.push(() => {
					if (itemtype._item === null || !itemtype._item.deleted) itemtype._callObserver(transaction, subs);
				}));
				fs.push(() => {
					transaction.changedParentTypes.forEach((events, type) => {
						if (type._dEH.l.length > 0 && (type._item === null || !type._item.deleted)) {
							events = events.filter((event) => event.target._item === null || !event.target._item.deleted);
							events.forEach((event) => {
								event.currentTarget = type;
								event._path = null;
							});
							events.sort((event1, event2) => event1.path.length - event2.path.length);
							fs.push(() => {
								callEventHandlerListeners(type._dEH, events, transaction);
							});
						}
					});
					fs.push(() => doc.emit("afterTransaction", [transaction, doc]));
					fs.push(() => {
						if (transaction._needFormattingCleanup) cleanupYTextAfterTransaction(transaction);
					});
				});
				callAll(fs, []);
			} finally {
				if (doc.gc) tryGcDeleteSet(ds, store, doc.gcFilter);
				tryMergeDeleteSet(ds, store);
				transaction.afterState.forEach((clock, client) => {
					const beforeClock = transaction.beforeState.get(client) || 0;
					if (beforeClock !== clock) {
						const structs = store.clients.get(client);
						const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
						for (let i = structs.length - 1; i >= firstChangePos;) i -= 1 + tryToMergeWithLefts(structs, i);
					}
				});
				for (let i = mergeStructs.length - 1; i >= 0; i--) {
					const { client, clock } = mergeStructs[i].id;
					const structs = store.clients.get(client);
					const replacedStructPos = findIndexSS(structs, clock);
					if (replacedStructPos + 1 < structs.length) {
						if (tryToMergeWithLefts(structs, replacedStructPos + 1) > 1) continue;
					}
					if (replacedStructPos > 0) tryToMergeWithLefts(structs, replacedStructPos);
				}
				if (!transaction.local && transaction.afterState.get(doc.clientID) !== transaction.beforeState.get(doc.clientID)) {
					print(ORANGE, BOLD, "[yjs] ", UNBOLD, RED, "Changed the client-id because another client seems to be using it.");
					doc.clientID = generateNewClientId();
				}
				doc.emit("afterTransactionCleanup", [transaction, doc]);
				if (doc._observers.has("update")) {
					const encoder = new UpdateEncoderV1();
					if (writeUpdateMessageFromTransaction(encoder, transaction)) doc.emit("update", [
						encoder.toUint8Array(),
						transaction.origin,
						doc,
						transaction
					]);
				}
				if (doc._observers.has("updateV2")) {
					const encoder = new UpdateEncoderV2();
					if (writeUpdateMessageFromTransaction(encoder, transaction)) doc.emit("updateV2", [
						encoder.toUint8Array(),
						transaction.origin,
						doc,
						transaction
					]);
				}
				const { subdocsAdded, subdocsLoaded, subdocsRemoved } = transaction;
				if (subdocsAdded.size > 0 || subdocsRemoved.size > 0 || subdocsLoaded.size > 0) {
					subdocsAdded.forEach((subdoc) => {
						subdoc.clientID = doc.clientID;
						if (subdoc.collectionid == null) subdoc.collectionid = doc.collectionid;
						doc.subdocs.add(subdoc);
					});
					subdocsRemoved.forEach((subdoc) => doc.subdocs.delete(subdoc));
					doc.emit("subdocs", [
						{
							loaded: subdocsLoaded,
							added: subdocsAdded,
							removed: subdocsRemoved
						},
						doc,
						transaction
					]);
					subdocsRemoved.forEach((subdoc) => subdoc.destroy());
				}
				if (transactionCleanups.length <= i + 1) {
					doc._transactionCleanups = [];
					doc.emit("afterAllTransactions", [doc, transactionCleanups]);
				} else cleanupTransactions(transactionCleanups, i + 1);
			}
		}
	};
	/**
	* Implements the functionality of `y.transact(()=>{..})`
	*
	* @template T
	* @param {Doc} doc
	* @param {function(Transaction):T} f
	* @param {any} [origin=true]
	* @return {T}
	*
	* @function
	*/
	const transact = (doc, f, origin = null, local = true) => {
		const transactionCleanups = doc._transactionCleanups;
		let initialCall = false;
		/**
		* @type {any}
		*/
		let result = null;
		if (doc._transaction === null) {
			initialCall = true;
			doc._transaction = new Transaction(doc, origin, local);
			transactionCleanups.push(doc._transaction);
			if (transactionCleanups.length === 1) doc.emit("beforeAllTransactions", [doc]);
			doc.emit("beforeTransaction", [doc._transaction, doc]);
		}
		try {
			result = f(doc._transaction);
		} finally {
			if (initialCall) {
				const finishCleanup = doc._transaction === transactionCleanups[0];
				doc._transaction = null;
				if (finishCleanup) cleanupTransactions(transactionCleanups, 0);
			}
		}
		return result;
	};
	var StackItem = class {
		/**
		* @param {DeleteSet} deletions
		* @param {DeleteSet} insertions
		*/
		constructor(deletions, insertions) {
			this.insertions = insertions;
			this.deletions = deletions;
			/**
			* Use this to save and restore metadata like selection range
			*/
			this.meta = /* @__PURE__ */ new Map();
		}
	};
	/**
	* @param {Transaction} tr
	* @param {UndoManager} um
	* @param {StackItem} stackItem
	*/
	const clearUndoManagerStackItem = (tr, um, stackItem) => {
		iterateDeletedStructs(tr, stackItem.deletions, (item) => {
			if (item instanceof Item && um.scope.some((type) => type === tr.doc || isParentOf(type, item))) keepItem(item, false);
		});
	};
	/**
	* @param {UndoManager} undoManager
	* @param {Array<StackItem>} stack
	* @param {'undo'|'redo'} eventType
	* @return {StackItem?}
	*/
	const popStackItem = (undoManager, stack, eventType) => {
		/**
		* Keep a reference to the transaction so we can fire the event with the changedParentTypes
		* @type {any}
		*/
		let _tr = null;
		const doc = undoManager.doc;
		const scope = undoManager.scope;
		transact(doc, (transaction) => {
			while (stack.length > 0 && undoManager.currStackItem === null) {
				const store = doc.store;
				const stackItem = stack.pop();
				/**
				* @type {Set<Item>}
				*/
				const itemsToRedo = /* @__PURE__ */ new Set();
				/**
				* @type {Array<Item>}
				*/
				const itemsToDelete = [];
				let performedChange = false;
				iterateDeletedStructs(transaction, stackItem.insertions, (struct) => {
					if (struct instanceof Item) {
						if (struct.redone !== null) {
							let { item, diff } = followRedone(store, struct.id);
							if (diff > 0) item = getItemCleanStart(transaction, createID(item.id.client, item.id.clock + diff));
							struct = item;
						}
						if (!struct.deleted && scope.some((type) => type === transaction.doc || isParentOf(type, struct))) itemsToDelete.push(struct);
					}
				});
				iterateDeletedStructs(transaction, stackItem.deletions, (struct) => {
					if (struct instanceof Item && scope.some((type) => type === transaction.doc || isParentOf(type, struct)) && !isDeleted(stackItem.insertions, struct.id)) itemsToRedo.add(struct);
				});
				itemsToRedo.forEach((struct) => {
					performedChange = redoItem(transaction, struct, itemsToRedo, stackItem.insertions, undoManager.ignoreRemoteMapChanges, undoManager) !== null || performedChange;
				});
				for (let i = itemsToDelete.length - 1; i >= 0; i--) {
					const item = itemsToDelete[i];
					if (undoManager.deleteFilter(item)) {
						item.delete(transaction);
						performedChange = true;
					}
				}
				undoManager.currStackItem = performedChange ? stackItem : null;
			}
			transaction.changed.forEach((subProps, type) => {
				if (subProps.has(null) && type._searchMarker) type._searchMarker.length = 0;
			});
			_tr = transaction;
		}, undoManager);
		const res = undoManager.currStackItem;
		if (res != null) {
			const changedParentTypes = _tr.changedParentTypes;
			undoManager.emit("stack-item-popped", [{
				stackItem: res,
				type: eventType,
				changedParentTypes,
				origin: undoManager
			}, undoManager]);
			undoManager.currStackItem = null;
		}
		return res;
	};
	/**
	* @typedef {Object} UndoManagerOptions
	* @property {number} [UndoManagerOptions.captureTimeout=500]
	* @property {function(Transaction):boolean} [UndoManagerOptions.captureTransaction] Do not capture changes of a Transaction if result false.
	* @property {function(Item):boolean} [UndoManagerOptions.deleteFilter=()=>true] Sometimes
	* it is necessary to filter what an Undo/Redo operation can delete. If this
	* filter returns false, the type/item won't be deleted even it is in the
	* undo/redo scope.
	* @property {Set<any>} [UndoManagerOptions.trackedOrigins=new Set([null])]
	* @property {boolean} [ignoreRemoteMapChanges] Experimental. By default, the UndoManager will never overwrite remote changes. Enable this property to enable overwriting remote changes on key-value changes (Y.Map, properties on Y.Xml, etc..).
	* @property {Doc} [doc] The document that this UndoManager operates on. Only needed if typeScope is empty.
	*/
	/**
	* @typedef {Object} StackItemEvent
	* @property {StackItem} StackItemEvent.stackItem
	* @property {any} StackItemEvent.origin
	* @property {'undo'|'redo'} StackItemEvent.type
	* @property {Map<AbstractType<YEvent<any>>,Array<YEvent<any>>>} StackItemEvent.changedParentTypes
	*/
	/**
	* Fires 'stack-item-added' event when a stack item was added to either the undo- or
	* the redo-stack. You may store additional stack information via the
	* metadata property on `event.stackItem.meta` (it is a `Map` of metadata properties).
	* Fires 'stack-item-popped' event when a stack item was popped from either the
	* undo- or the redo-stack. You may restore the saved stack information from `event.stackItem.meta`.
	*
	* @extends {ObservableV2<{'stack-item-added':function(StackItemEvent, UndoManager):void, 'stack-item-popped': function(StackItemEvent, UndoManager):void, 'stack-cleared': function({ undoStackCleared: boolean, redoStackCleared: boolean }):void, 'stack-item-updated': function(StackItemEvent, UndoManager):void }>}
	*/
	var UndoManager = class extends ObservableV2 {
		/**
		* @param {Doc|AbstractType<any>|Array<AbstractType<any>>} typeScope Limits the scope of the UndoManager. If this is set to a ydoc instance, all changes on that ydoc will be undone. If set to a specific type, only changes on that type or its children will be undone. Also accepts an array of types.
		* @param {UndoManagerOptions} options
		*/
		constructor(typeScope, { captureTimeout = 500, captureTransaction = (_tr) => true, deleteFilter = () => true, trackedOrigins = /* @__PURE__ */ new Set([null]), ignoreRemoteMapChanges = false, doc = isArray(typeScope) ? typeScope[0].doc : typeScope instanceof Doc ? typeScope : typeScope.doc } = {}) {
			super();
			/**
			* @type {Array<AbstractType<any> | Doc>}
			*/
			this.scope = [];
			this.doc = doc;
			this.addToScope(typeScope);
			this.deleteFilter = deleteFilter;
			trackedOrigins.add(this);
			this.trackedOrigins = trackedOrigins;
			this.captureTransaction = captureTransaction;
			/**
			* @type {Array<StackItem>}
			*/
			this.undoStack = [];
			/**
			* @type {Array<StackItem>}
			*/
			this.redoStack = [];
			/**
			* Whether the client is currently undoing (calling UndoManager.undo)
			*
			* @type {boolean}
			*/
			this.undoing = false;
			this.redoing = false;
			/**
			* The currently popped stack item if UndoManager.undoing or UndoManager.redoing
			*
			* @type {StackItem|null}
			*/
			this.currStackItem = null;
			this.lastChange = 0;
			this.ignoreRemoteMapChanges = ignoreRemoteMapChanges;
			this.captureTimeout = captureTimeout;
			/**
			* @param {Transaction} transaction
			*/
			this.afterTransactionHandler = (transaction) => {
				if (!this.captureTransaction(transaction) || !this.scope.some((type) => transaction.changedParentTypes.has(type) || type === this.doc) || !this.trackedOrigins.has(transaction.origin) && (!transaction.origin || !this.trackedOrigins.has(transaction.origin.constructor))) return;
				const undoing = this.undoing;
				const redoing = this.redoing;
				const stack = undoing ? this.redoStack : this.undoStack;
				if (undoing) this.stopCapturing();
				else if (!redoing) this.clear(false, true);
				const insertions = new DeleteSet();
				transaction.afterState.forEach((endClock, client) => {
					const startClock = transaction.beforeState.get(client) || 0;
					const len = endClock - startClock;
					if (len > 0) addToDeleteSet(insertions, client, startClock, len);
				});
				const now = getUnixTime();
				let didAdd = false;
				if (this.lastChange > 0 && now - this.lastChange < this.captureTimeout && stack.length > 0 && !undoing && !redoing) {
					const lastOp = stack[stack.length - 1];
					lastOp.deletions = mergeDeleteSets([lastOp.deletions, transaction.deleteSet]);
					lastOp.insertions = mergeDeleteSets([lastOp.insertions, insertions]);
				} else {
					stack.push(new StackItem(transaction.deleteSet, insertions));
					didAdd = true;
				}
				if (!undoing && !redoing) this.lastChange = now;
				iterateDeletedStructs(
					transaction,
					transaction.deleteSet,
					/** @param {Item|GC} item */
					(item) => {
						if (item instanceof Item && this.scope.some((type) => type === transaction.doc || isParentOf(type, item))) keepItem(item, true);
					}
				);
				/**
				* @type {[StackItemEvent, UndoManager]}
				*/
				const changeEvent = [{
					stackItem: stack[stack.length - 1],
					origin: transaction.origin,
					type: undoing ? "redo" : "undo",
					changedParentTypes: transaction.changedParentTypes
				}, this];
				if (didAdd) this.emit("stack-item-added", changeEvent);
				else this.emit("stack-item-updated", changeEvent);
			};
			this.doc.on("afterTransaction", this.afterTransactionHandler);
			this.doc.on("destroy", () => {
				this.destroy();
			});
		}
		/**
		* Extend the scope.
		*
		* @param {Array<AbstractType<any> | Doc> | AbstractType<any> | Doc} ytypes
		*/
		addToScope(ytypes) {
			const tmpSet = new Set(this.scope);
			ytypes = isArray(ytypes) ? ytypes : [ytypes];
			ytypes.forEach((ytype) => {
				if (!tmpSet.has(ytype)) {
					tmpSet.add(ytype);
					if (ytype instanceof AbstractType ? ytype.doc !== this.doc : ytype !== this.doc) warn("[yjs#509] Not same Y.Doc");
					this.scope.push(ytype);
				}
			});
		}
		/**
		* @param {any} origin
		*/
		addTrackedOrigin(origin) {
			this.trackedOrigins.add(origin);
		}
		/**
		* @param {any} origin
		*/
		removeTrackedOrigin(origin) {
			this.trackedOrigins.delete(origin);
		}
		clear(clearUndoStack = true, clearRedoStack = true) {
			if (clearUndoStack && this.canUndo() || clearRedoStack && this.canRedo()) this.doc.transact((tr) => {
				if (clearUndoStack) {
					this.undoStack.forEach((item) => clearUndoManagerStackItem(tr, this, item));
					this.undoStack = [];
				}
				if (clearRedoStack) {
					this.redoStack.forEach((item) => clearUndoManagerStackItem(tr, this, item));
					this.redoStack = [];
				}
				this.emit("stack-cleared", [{
					undoStackCleared: clearUndoStack,
					redoStackCleared: clearRedoStack
				}]);
			});
		}
		/**
		* UndoManager merges Undo-StackItem if they are created within time-gap
		* smaller than `options.captureTimeout`. Call `um.stopCapturing()` so that the next
		* StackItem won't be merged.
		*
		*
		* @example
		*     // without stopCapturing
		*     ytext.insert(0, 'a')
		*     ytext.insert(1, 'b')
		*     um.undo()
		*     ytext.toString() // => '' (note that 'ab' was removed)
		*     // with stopCapturing
		*     ytext.insert(0, 'a')
		*     um.stopCapturing()
		*     ytext.insert(0, 'b')
		*     um.undo()
		*     ytext.toString() // => 'a' (note that only 'b' was removed)
		*
		*/
		stopCapturing() {
			this.lastChange = 0;
		}
		/**
		* Undo last changes on type.
		*
		* @return {StackItem?} Returns StackItem if a change was applied
		*/
		undo() {
			this.undoing = true;
			let res;
			try {
				res = popStackItem(this, this.undoStack, "undo");
			} finally {
				this.undoing = false;
			}
			return res;
		}
		/**
		* Redo last undo operation.
		*
		* @return {StackItem?} Returns StackItem if a change was applied
		*/
		redo() {
			this.redoing = true;
			let res;
			try {
				res = popStackItem(this, this.redoStack, "redo");
			} finally {
				this.redoing = false;
			}
			return res;
		}
		/**
		* Are undo steps available?
		*
		* @return {boolean} `true` if undo is possible
		*/
		canUndo() {
			return this.undoStack.length > 0;
		}
		/**
		* Are redo steps available?
		*
		* @return {boolean} `true` if redo is possible
		*/
		canRedo() {
			return this.redoStack.length > 0;
		}
		destroy() {
			this.trackedOrigins.delete(this);
			this.doc.off("afterTransaction", this.afterTransactionHandler);
			super.destroy();
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	*/
	function* lazyStructReaderGenerator(decoder) {
		const numOfStateUpdates = readVarUint(decoder.restDecoder);
		for (let i = 0; i < numOfStateUpdates; i++) {
			const numberOfStructs = readVarUint(decoder.restDecoder);
			const client = decoder.readClient();
			let clock = readVarUint(decoder.restDecoder);
			for (let i = 0; i < numberOfStructs; i++) {
				const info = decoder.readInfo();
				if (info === 10) {
					const len = readVarUint(decoder.restDecoder);
					yield new Skip(createID(client, clock), len);
					clock += len;
				} else if ((31 & info) !== 0) {
					const cantCopyParentInfo = (info & (64 | 128)) === 0;
					const struct = new Item(createID(client, clock), null, (info & 128) === 128 ? decoder.readLeftID() : null, null, (info & 64) === 64 ? decoder.readRightID() : null, cantCopyParentInfo ? decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID() : null, cantCopyParentInfo && (info & 32) === 32 ? decoder.readString() : null, readItemContent(decoder, info));
					yield struct;
					clock += struct.length;
				} else {
					const len = decoder.readLen();
					yield new GC(createID(client, clock), len);
					clock += len;
				}
			}
		}
	}
	var LazyStructReader = class {
		/**
		* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
		* @param {boolean} filterSkips
		*/
		constructor(decoder, filterSkips) {
			this.gen = lazyStructReaderGenerator(decoder);
			/**
			* @type {null | Item | Skip | GC}
			*/
			this.curr = null;
			this.done = false;
			this.filterSkips = filterSkips;
			this.next();
		}
		/**
		* @return {Item | GC | Skip |null}
		*/
		next() {
			do
				this.curr = this.gen.next().value || null;
			while (this.filterSkips && this.curr !== null && this.curr.constructor === Skip);
			return this.curr;
		}
	};
	/**
	* @param {Uint8Array} update
	*
	*/
	const logUpdate = (update) => logUpdateV2(update, UpdateDecoderV1);
	/**
	* @param {Uint8Array} update
	* @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
	*
	*/
	const logUpdateV2 = (update, YDecoder = UpdateDecoderV2) => {
		const structs = [];
		const updateDecoder = new YDecoder(createDecoder(update));
		const lazyDecoder = new LazyStructReader(updateDecoder, false);
		for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) structs.push(curr);
		print("Structs: ", structs);
		const ds = readDeleteSet(updateDecoder);
		print("DeleteSet: ", ds);
	};
	/**
	* @param {Uint8Array} update
	*
	*/
	const decodeUpdate = (update) => decodeUpdateV2(update, UpdateDecoderV1);
	/**
	* @param {Uint8Array} update
	* @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
	*
	*/
	const decodeUpdateV2 = (update, YDecoder = UpdateDecoderV2) => {
		const structs = [];
		const updateDecoder = new YDecoder(createDecoder(update));
		const lazyDecoder = new LazyStructReader(updateDecoder, false);
		for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) structs.push(curr);
		return {
			structs,
			ds: readDeleteSet(updateDecoder)
		};
	};
	var LazyStructWriter = class {
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		*/
		constructor(encoder) {
			this.currClient = 0;
			this.startClock = 0;
			this.written = 0;
			this.encoder = encoder;
			/**
			* We want to write operations lazily, but also we need to know beforehand how many operations we want to write for each client.
			*
			* This kind of meta-information (#clients, #structs-per-client-written) is written to the restEncoder.
			*
			* We fragment the restEncoder and store a slice of it per-client until we know how many clients there are.
			* When we flush (toUint8Array) we write the restEncoder using the fragments and the meta-information.
			*
			* @type {Array<{ written: number, restEncoder: Uint8Array }>}
			*/
			this.clientStructs = [];
		}
	};
	/**
	* @param {Array<Uint8Array>} updates
	* @return {Uint8Array}
	*/
	const mergeUpdates = (updates) => mergeUpdatesV2(updates, UpdateDecoderV1, UpdateEncoderV1);
	/**
	* @param {Uint8Array} update
	* @param {typeof DSEncoderV1 | typeof DSEncoderV2} YEncoder
	* @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} YDecoder
	* @return {Uint8Array}
	*/
	const encodeStateVectorFromUpdateV2 = (update, YEncoder = DSEncoderV2, YDecoder = UpdateDecoderV2) => {
		const encoder = new YEncoder();
		const updateDecoder = new LazyStructReader(new YDecoder(createDecoder(update)), false);
		let curr = updateDecoder.curr;
		if (curr !== null) {
			let size = 0;
			let currClient = curr.id.client;
			let stopCounting = curr.id.clock !== 0;
			let currClock = stopCounting ? 0 : curr.id.clock + curr.length;
			for (; curr !== null; curr = updateDecoder.next()) {
				if (currClient !== curr.id.client) {
					if (currClock !== 0) {
						size++;
						writeVarUint(encoder.restEncoder, currClient);
						writeVarUint(encoder.restEncoder, currClock);
					}
					currClient = curr.id.client;
					currClock = 0;
					stopCounting = curr.id.clock !== 0;
				}
				if (curr.constructor === Skip) stopCounting = true;
				if (!stopCounting) currClock = curr.id.clock + curr.length;
			}
			if (currClock !== 0) {
				size++;
				writeVarUint(encoder.restEncoder, currClient);
				writeVarUint(encoder.restEncoder, currClock);
			}
			const enc = createEncoder();
			writeVarUint(enc, size);
			writeBinaryEncoder(enc, encoder.restEncoder);
			encoder.restEncoder = enc;
			return encoder.toUint8Array();
		} else {
			writeVarUint(encoder.restEncoder, 0);
			return encoder.toUint8Array();
		}
	};
	/**
	* @param {Uint8Array} update
	* @return {Uint8Array}
	*/
	const encodeStateVectorFromUpdate = (update) => encodeStateVectorFromUpdateV2(update, DSEncoderV1, UpdateDecoderV1);
	/**
	* @param {Uint8Array} update
	* @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} YDecoder
	* @return {{ from: Map<number,number>, to: Map<number,number> }}
	*/
	const parseUpdateMetaV2 = (update, YDecoder = UpdateDecoderV2) => {
		/**
		* @type {Map<number, number>}
		*/
		const from = /* @__PURE__ */ new Map();
		/**
		* @type {Map<number, number>}
		*/
		const to = /* @__PURE__ */ new Map();
		const updateDecoder = new LazyStructReader(new YDecoder(createDecoder(update)), false);
		let curr = updateDecoder.curr;
		if (curr !== null) {
			let currClient = curr.id.client;
			let currClock = curr.id.clock;
			from.set(currClient, currClock);
			for (; curr !== null; curr = updateDecoder.next()) {
				if (currClient !== curr.id.client) {
					to.set(currClient, currClock);
					from.set(curr.id.client, curr.id.clock);
					currClient = curr.id.client;
				}
				currClock = curr.id.clock + curr.length;
			}
			to.set(currClient, currClock);
		}
		return {
			from,
			to
		};
	};
	/**
	* @param {Uint8Array} update
	* @return {{ from: Map<number,number>, to: Map<number,number> }}
	*/
	const parseUpdateMeta = (update) => parseUpdateMetaV2(update, UpdateDecoderV1);
	/**
	* This method is intended to slice any kind of struct and retrieve the right part.
	* It does not handle side-effects, so it should only be used by the lazy-encoder.
	*
	* @param {Item | GC | Skip} left
	* @param {number} diff
	* @return {Item | GC}
	*/
	const sliceStruct = (left, diff) => {
		if (left.constructor === GC) {
			const { client, clock } = left.id;
			return new GC(createID(client, clock + diff), left.length - diff);
		} else if (left.constructor === Skip) {
			const { client, clock } = left.id;
			return new Skip(createID(client, clock + diff), left.length - diff);
		} else {
			const leftItem = left;
			const { client, clock } = leftItem.id;
			return new Item(createID(client, clock + diff), null, createID(client, clock + diff - 1), null, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
		}
	};
	/**
	*
	* This function works similarly to `readUpdateV2`.
	*
	* @param {Array<Uint8Array>} updates
	* @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
	* @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
	* @return {Uint8Array}
	*/
	const mergeUpdatesV2 = (updates, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
		if (updates.length === 1) return updates[0];
		const updateDecoders = updates.map((update) => new YDecoder(createDecoder(update)));
		let lazyStructDecoders = updateDecoders.map((decoder) => new LazyStructReader(decoder, true));
		/**
		* @todo we don't need offset because we always slice before
		* @type {null | { struct: Item | GC | Skip, offset: number }}
		*/
		let currWrite = null;
		const updateEncoder = new YEncoder();
		const lazyStructEncoder = new LazyStructWriter(updateEncoder);
		while (true) {
			lazyStructDecoders = lazyStructDecoders.filter((dec) => dec.curr !== null);
			lazyStructDecoders.sort(
				/** @type {function(any,any):number} */
				(dec1, dec2) => {
					if (dec1.curr.id.client === dec2.curr.id.client) {
						const clockDiff = dec1.curr.id.clock - dec2.curr.id.clock;
						if (clockDiff === 0) return dec1.curr.constructor === dec2.curr.constructor ? 0 : dec1.curr.constructor === Skip ? 1 : -1;
						else return clockDiff;
					} else return dec2.curr.id.client - dec1.curr.id.client;
				}
			);
			if (lazyStructDecoders.length === 0) break;
			const currDecoder = lazyStructDecoders[0];
			const firstClient = currDecoder.curr.id.client;
			if (currWrite !== null) {
				let curr = currDecoder.curr;
				let iterated = false;
				while (curr !== null && curr.id.clock + curr.length <= currWrite.struct.id.clock + currWrite.struct.length && curr.id.client >= currWrite.struct.id.client) {
					curr = currDecoder.next();
					iterated = true;
				}
				if (curr === null || curr.id.client !== firstClient || iterated && curr.id.clock > currWrite.struct.id.clock + currWrite.struct.length) continue;
				if (firstClient !== currWrite.struct.id.client) {
					writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
					currWrite = {
						struct: curr,
						offset: 0
					};
					currDecoder.next();
				} else if (currWrite.struct.id.clock + currWrite.struct.length < curr.id.clock) {
					if (currWrite.struct.constructor === Skip) currWrite.struct.length = curr.id.clock + curr.length - currWrite.struct.id.clock;
					else {
						writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
						const diff = curr.id.clock - currWrite.struct.id.clock - currWrite.struct.length;
						currWrite = {
							struct: new Skip(createID(firstClient, currWrite.struct.id.clock + currWrite.struct.length), diff),
							offset: 0
						};
					}
				} else {
					const diff = currWrite.struct.id.clock + currWrite.struct.length - curr.id.clock;
					if (diff > 0) {
						if (currWrite.struct.constructor === Skip) currWrite.struct.length -= diff;
						else curr = sliceStruct(curr, diff);
					}
					if (!currWrite.struct.mergeWith(curr)) {
						writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
						currWrite = {
							struct: curr,
							offset: 0
						};
						currDecoder.next();
					}
				}
			} else {
				currWrite = {
					struct: currDecoder.curr,
					offset: 0
				};
				currDecoder.next();
			}
			for (let next = currDecoder.curr; next !== null && next.id.client === firstClient && next.id.clock === currWrite.struct.id.clock + currWrite.struct.length && next.constructor !== Skip; next = currDecoder.next()) {
				writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
				currWrite = {
					struct: next,
					offset: 0
				};
			}
		}
		if (currWrite !== null) {
			writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
			currWrite = null;
		}
		finishLazyStructWriting(lazyStructEncoder);
		const dss = updateDecoders.map((decoder) => readDeleteSet(decoder));
		const ds = mergeDeleteSets(dss);
		writeDeleteSet(updateEncoder, ds);
		return updateEncoder.toUint8Array();
	};
	/**
	* @param {Uint8Array} update
	* @param {Uint8Array} sv
	* @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
	* @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
	*/
	const diffUpdateV2 = (update, sv, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
		const state = decodeStateVector(sv);
		const encoder = new YEncoder();
		const lazyStructWriter = new LazyStructWriter(encoder);
		const decoder = new YDecoder(createDecoder(update));
		const reader = new LazyStructReader(decoder, false);
		while (reader.curr) {
			const curr = reader.curr;
			const currClient = curr.id.client;
			const svClock = state.get(currClient) || 0;
			if (reader.curr.constructor === Skip) {
				reader.next();
				continue;
			}
			if (curr.id.clock + curr.length > svClock) {
				writeStructToLazyStructWriter(lazyStructWriter, curr, max(svClock - curr.id.clock, 0));
				reader.next();
				while (reader.curr && reader.curr.id.client === currClient) {
					writeStructToLazyStructWriter(lazyStructWriter, reader.curr, 0);
					reader.next();
				}
			} else while (reader.curr && reader.curr.id.client === currClient && reader.curr.id.clock + reader.curr.length <= svClock) reader.next();
		}
		finishLazyStructWriting(lazyStructWriter);
		const ds = readDeleteSet(decoder);
		writeDeleteSet(encoder, ds);
		return encoder.toUint8Array();
	};
	/**
	* @param {Uint8Array} update
	* @param {Uint8Array} sv
	*/
	const diffUpdate = (update, sv) => diffUpdateV2(update, sv, UpdateDecoderV1, UpdateEncoderV1);
	/**
	* @param {LazyStructWriter} lazyWriter
	*/
	const flushLazyStructWriter = (lazyWriter) => {
		if (lazyWriter.written > 0) {
			lazyWriter.clientStructs.push({
				written: lazyWriter.written,
				restEncoder: toUint8Array(lazyWriter.encoder.restEncoder)
			});
			lazyWriter.encoder.restEncoder = createEncoder();
			lazyWriter.written = 0;
		}
	};
	/**
	* @param {LazyStructWriter} lazyWriter
	* @param {Item | GC} struct
	* @param {number} offset
	*/
	const writeStructToLazyStructWriter = (lazyWriter, struct, offset) => {
		if (lazyWriter.written > 0 && lazyWriter.currClient !== struct.id.client) flushLazyStructWriter(lazyWriter);
		if (lazyWriter.written === 0) {
			lazyWriter.currClient = struct.id.client;
			lazyWriter.encoder.writeClient(struct.id.client);
			writeVarUint(lazyWriter.encoder.restEncoder, struct.id.clock + offset);
		}
		struct.write(lazyWriter.encoder, offset);
		lazyWriter.written++;
	};
	/**
	* Call this function when we collected all parts and want to
	* put all the parts together. After calling this method,
	* you can continue using the UpdateEncoder.
	*
	* @param {LazyStructWriter} lazyWriter
	*/
	const finishLazyStructWriting = (lazyWriter) => {
		flushLazyStructWriter(lazyWriter);
		const restEncoder = lazyWriter.encoder.restEncoder;
		/**
		* Now we put all the fragments together.
		* This works similarly to `writeClientsStructs`
		*/
		writeVarUint(restEncoder, lazyWriter.clientStructs.length);
		for (let i = 0; i < lazyWriter.clientStructs.length; i++) {
			const partStructs = lazyWriter.clientStructs[i];
			/**
			* Works similarly to `writeStructs`
			*/
			writeVarUint(restEncoder, partStructs.written);
			writeUint8Array(restEncoder, partStructs.restEncoder);
		}
	};
	/**
	* @param {Uint8Array} update
	* @param {function(Item|GC|Skip):Item|GC|Skip} blockTransformer
	* @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} YDecoder
	* @param {typeof UpdateEncoderV2 | typeof UpdateEncoderV1 } YEncoder
	*/
	const convertUpdateFormat = (update, blockTransformer, YDecoder, YEncoder) => {
		const updateDecoder = new YDecoder(createDecoder(update));
		const lazyDecoder = new LazyStructReader(updateDecoder, false);
		const updateEncoder = new YEncoder();
		const lazyWriter = new LazyStructWriter(updateEncoder);
		for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) writeStructToLazyStructWriter(lazyWriter, blockTransformer(curr), 0);
		finishLazyStructWriting(lazyWriter);
		const ds = readDeleteSet(updateDecoder);
		writeDeleteSet(updateEncoder, ds);
		return updateEncoder.toUint8Array();
	};
	/**
	* @typedef {Object} ObfuscatorOptions
	* @property {boolean} [ObfuscatorOptions.formatting=true]
	* @property {boolean} [ObfuscatorOptions.subdocs=true]
	* @property {boolean} [ObfuscatorOptions.yxml=true] Whether to obfuscate nodeName / hookName
	*/
	/**
	* @param {ObfuscatorOptions} obfuscator
	*/
	const createObfuscator = ({ formatting = true, subdocs = true, yxml = true } = {}) => {
		let i = 0;
		const mapKeyCache = create$7();
		const nodeNameCache = create$7();
		const formattingKeyCache = create$7();
		const formattingValueCache = create$7();
		formattingValueCache.set(null, null);
		/**
		* @param {Item|GC|Skip} block
		* @return {Item|GC|Skip}
		*/
		return (block) => {
			switch (block.constructor) {
				case GC:
				case Skip: return block;
				case Item: {
					const item = block;
					const content = item.content;
					switch (content.constructor) {
						case ContentDeleted: break;
						case ContentType:
							if (yxml) {
								const type = content.type;
								if (type instanceof YXmlElement) type.nodeName = setIfUndefined(nodeNameCache, type.nodeName, () => "node-" + i);
								if (type instanceof YXmlHook) type.hookName = setIfUndefined(nodeNameCache, type.hookName, () => "hook-" + i);
							}
							break;
						case ContentAny: {
							const c = content;
							c.arr = c.arr.map(() => i);
							break;
						}
						case ContentBinary: {
							const c = content;
							c.content = new Uint8Array([i]);
							break;
						}
						case ContentDoc: {
							const c = content;
							if (subdocs) {
								c.opts = {};
								c.doc.guid = i + "";
							}
							break;
						}
						case ContentEmbed: {
							const c = content;
							c.embed = {};
							break;
						}
						case ContentFormat: {
							const c = content;
							if (formatting) {
								c.key = setIfUndefined(formattingKeyCache, c.key, () => i + "");
								c.value = setIfUndefined(formattingValueCache, c.value, () => ({ i }));
							}
							break;
						}
						case ContentJSON: {
							const c = content;
							c.arr = c.arr.map(() => i);
							break;
						}
						case ContentString: {
							const c = content;
							c.str = repeat(i % 10 + "", c.str.length);
							break;
						}
						default: unexpectedCase();
					}
					if (item.parentSub) item.parentSub = setIfUndefined(mapKeyCache, item.parentSub, () => i + "");
					i++;
					return block;
				}
				default: unexpectedCase();
			}
		};
	};
	/**
	* This function obfuscates the content of a Yjs update. This is useful to share
	* buggy Yjs documents while significantly limiting the possibility that a
	* developer can on the user. Note that it might still be possible to deduce
	* some information by analyzing the "structure" of the document or by analyzing
	* the typing behavior using the CRDT-related metadata that is still kept fully
	* intact.
	*
	* @param {Uint8Array} update
	* @param {ObfuscatorOptions} [opts]
	*/
	const obfuscateUpdate = (update, opts) => convertUpdateFormat(update, createObfuscator(opts), UpdateDecoderV1, UpdateEncoderV1);
	/**
	* @param {Uint8Array} update
	* @param {ObfuscatorOptions} [opts]
	*/
	const obfuscateUpdateV2 = (update, opts) => convertUpdateFormat(update, createObfuscator(opts), UpdateDecoderV2, UpdateEncoderV2);
	/**
	* @param {Uint8Array} update
	*/
	const convertUpdateFormatV1ToV2 = (update) => convertUpdateFormat(update, id, UpdateDecoderV1, UpdateEncoderV2);
	/**
	* @param {Uint8Array} update
	*/
	const convertUpdateFormatV2ToV1 = (update) => convertUpdateFormat(update, id, UpdateDecoderV2, UpdateEncoderV1);
	const errorComputeChanges = "You must not compute changes after the event-handler fired.";
	/**
	* @template {AbstractType<any>} T
	* YEvent describes the changes on a YType.
	*/
	var YEvent = class {
		/**
		* @param {T} target The changed type.
		* @param {Transaction} transaction
		*/
		constructor(target, transaction) {
			/**
			* The type on which this event was created on.
			* @type {T}
			*/
			this.target = target;
			/**
			* The current target on which the observe callback is called.
			* @type {AbstractType<any>}
			*/
			this.currentTarget = target;
			/**
			* The transaction that triggered this event.
			* @type {Transaction}
			*/
			this.transaction = transaction;
			/**
			* @type {Object|null}
			*/
			this._changes = null;
			/**
			* @type {null | Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
			*/
			this._keys = null;
			/**
			* @type {null | Array<{ insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any> }>}
			*/
			this._delta = null;
			/**
			* @type {Array<string|number>|null}
			*/
			this._path = null;
		}
		/**
		* Computes the path from `y` to the changed type.
		*
		* @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
		*
		* The following property holds:
		* @example
		*   let type = y
		*   event.path.forEach(dir => {
		*     type = type.get(dir)
		*   })
		*   type === event.target // => true
		*/
		get path() {
			return this._path || (this._path = getPathTo(this.currentTarget, this.target));
		}
		/**
		* Check if a struct is deleted by this event.
		*
		* In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
		*
		* @param {AbstractStruct} struct
		* @return {boolean}
		*/
		deletes(struct) {
			return isDeleted(this.transaction.deleteSet, struct.id);
		}
		/**
		* @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
		*/
		get keys() {
			if (this._keys === null) {
				if (this.transaction.doc._transactionCleanups.length === 0) throw create$5(errorComputeChanges);
				const keys = /* @__PURE__ */ new Map();
				const target = this.target;
				this.transaction.changed.get(target).forEach((key) => {
					if (key !== null) {
						const item = target._map.get(key);
						/**
						* @type {'delete' | 'add' | 'update'}
						*/
						let action;
						let oldValue;
						if (this.adds(item)) {
							let prev = item.left;
							while (prev !== null && this.adds(prev)) prev = prev.left;
							if (this.deletes(item)) {
								if (prev !== null && this.deletes(prev)) {
									action = "delete";
									oldValue = last(prev.content.getContent());
								} else return;
							} else if (prev !== null && this.deletes(prev)) {
								action = "update";
								oldValue = last(prev.content.getContent());
							} else {
								action = "add";
								oldValue = void 0;
							}
						} else if (this.deletes(item)) {
							action = "delete";
							oldValue = last(
								/** @type {Item} */
								item.content.getContent()
							);
						} else return;
						keys.set(key, {
							action,
							oldValue
						});
					}
				});
				this._keys = keys;
			}
			return this._keys;
		}
		/**
		* This is a computed property. Note that this can only be safely computed during the
		* event call. Computing this property after other changes happened might result in
		* unexpected behavior (incorrect computation of deltas). A safe way to collect changes
		* is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
		*
		* @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
		*/
		get delta() {
			return this.changes.delta;
		}
		/**
		* Check if a struct is added by this event.
		*
		* In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
		*
		* @param {AbstractStruct} struct
		* @return {boolean}
		*/
		adds(struct) {
			return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0);
		}
		/**
		* This is a computed property. Note that this can only be safely computed during the
		* event call. Computing this property after other changes happened might result in
		* unexpected behavior (incorrect computation of deltas). A safe way to collect changes
		* is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
		*
		* @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
		*/
		get changes() {
			let changes = this._changes;
			if (changes === null) {
				if (this.transaction.doc._transactionCleanups.length === 0) throw create$5(errorComputeChanges);
				const target = this.target;
				const added = create$6();
				const deleted = create$6();
				/**
				* @type {Array<{insert:Array<any>}|{delete:number}|{retain:number}>}
				*/
				const delta = [];
				changes = {
					added,
					deleted,
					delta,
					keys: this.keys
				};
				if (this.transaction.changed.get(target).has(null)) {
					/**
					* @type {any}
					*/
					let lastOp = null;
					const packOp = () => {
						if (lastOp) delta.push(lastOp);
					};
					for (let item = target._start; item !== null; item = item.right) if (item.deleted) {
						if (this.deletes(item) && !this.adds(item)) {
							if (lastOp === null || lastOp.delete === void 0) {
								packOp();
								lastOp = { delete: 0 };
							}
							lastOp.delete += item.length;
							deleted.add(item);
						}
					} else if (this.adds(item)) {
						if (lastOp === null || lastOp.insert === void 0) {
							packOp();
							lastOp = { insert: [] };
						}
						lastOp.insert = lastOp.insert.concat(item.content.getContent());
						added.add(item);
					} else {
						if (lastOp === null || lastOp.retain === void 0) {
							packOp();
							lastOp = { retain: 0 };
						}
						lastOp.retain += item.length;
					}
					if (lastOp !== null && lastOp.retain === void 0) packOp();
				}
				this._changes = changes;
			}
			return changes;
		}
	};
	/**
	* Compute the path from this type to the specified target.
	*
	* @example
	*   // `child` should be accessible via `type.get(path[0]).get(path[1])..`
	*   const path = type.getPathTo(child)
	*   // assuming `type instanceof YArray`
	*   console.log(path) // might look like => [2, 'key1']
	*   child === type.get(path[0]).get(path[1])
	*
	* @param {AbstractType<any>} parent
	* @param {AbstractType<any>} child target
	* @return {Array<string|number>} Path to the target
	*
	* @private
	* @function
	*/
	const getPathTo = (parent, child) => {
		const path = [];
		while (child._item !== null && child !== parent) {
			if (child._item.parentSub !== null) path.unshift(child._item.parentSub);
			else {
				let i = 0;
				let c = child._item.parent._start;
				while (c !== child._item && c !== null) {
					if (!c.deleted && c.countable) i += c.length;
					c = c.right;
				}
				path.unshift(i);
			}
			child = child._item.parent;
		}
		return path;
	};
	/**
	* https://docs.yjs.dev/getting-started/working-with-shared-types#caveats
	*/
	const warnPrematureAccess = () => {
		warn("Invalid access: Add Yjs type to a document before reading data.");
	};
	const maxSearchMarker = 80;
	/**
	* A unique timestamp that identifies each marker.
	*
	* Time is relative,.. this is more like an ever-increasing clock.
	*
	* @type {number}
	*/
	let globalSearchMarkerTimestamp = 0;
	var ArraySearchMarker = class {
		/**
		* @param {Item} p
		* @param {number} index
		*/
		constructor(p, index) {
			p.marker = true;
			this.p = p;
			this.index = index;
			this.timestamp = globalSearchMarkerTimestamp++;
		}
	};
	/**
	* @param {ArraySearchMarker} marker
	*/
	const refreshMarkerTimestamp = (marker) => {
		marker.timestamp = globalSearchMarkerTimestamp++;
	};
	/**
	* This is rather complex so this function is the only thing that should overwrite a marker
	*
	* @param {ArraySearchMarker} marker
	* @param {Item} p
	* @param {number} index
	*/
	const overwriteMarker = (marker, p, index) => {
		marker.p.marker = false;
		marker.p = p;
		p.marker = true;
		marker.index = index;
		marker.timestamp = globalSearchMarkerTimestamp++;
	};
	/**
	* @param {Array<ArraySearchMarker>} searchMarker
	* @param {Item} p
	* @param {number} index
	*/
	const markPosition = (searchMarker, p, index) => {
		if (searchMarker.length >= maxSearchMarker) {
			const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
			overwriteMarker(marker, p, index);
			return marker;
		} else {
			const pm = new ArraySearchMarker(p, index);
			searchMarker.push(pm);
			return pm;
		}
	};
	/**
	* Search marker help us to find positions in the associative array faster.
	*
	* They speed up the process of finding a position without much bookkeeping.
	*
	* A maximum of `maxSearchMarker` objects are created.
	*
	* This function always returns a refreshed marker (updated timestamp)
	*
	* @param {AbstractType<any>} yarray
	* @param {number} index
	*/
	const findMarker = (yarray, index) => {
		if (yarray._start === null || index === 0 || yarray._searchMarker === null) return null;
		const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => abs(index - a.index) < abs(index - b.index) ? a : b);
		let p = yarray._start;
		let pindex = 0;
		if (marker !== null) {
			p = marker.p;
			pindex = marker.index;
			refreshMarkerTimestamp(marker);
		}
		while (p.right !== null && pindex < index) {
			if (!p.deleted && p.countable) {
				if (index < pindex + p.length) break;
				pindex += p.length;
			}
			p = p.right;
		}
		while (p.left !== null && pindex > index) {
			p = p.left;
			if (!p.deleted && p.countable) pindex -= p.length;
		}
		while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
			p = p.left;
			if (!p.deleted && p.countable) pindex -= p.length;
		}
		if (marker !== null && abs(marker.index - pindex) < p.parent.length / maxSearchMarker) {
			overwriteMarker(marker, p, pindex);
			return marker;
		} else return markPosition(yarray._searchMarker, p, pindex);
	};
	/**
	* Update markers when a change happened.
	*
	* This should be called before doing a deletion!
	*
	* @param {Array<ArraySearchMarker>} searchMarker
	* @param {number} index
	* @param {number} len If insertion, len is positive. If deletion, len is negative.
	*/
	const updateMarkerChanges = (searchMarker, index, len) => {
		for (let i = searchMarker.length - 1; i >= 0; i--) {
			const m = searchMarker[i];
			if (len > 0) {
				/**
				* @type {Item|null}
				*/
				let p = m.p;
				p.marker = false;
				while (p && (p.deleted || !p.countable)) {
					p = p.left;
					if (p && !p.deleted && p.countable) m.index -= p.length;
				}
				if (p === null || p.marker === true) {
					searchMarker.splice(i, 1);
					continue;
				}
				m.p = p;
				p.marker = true;
			}
			if (index < m.index || len > 0 && index === m.index) m.index = max(index, m.index + len);
		}
	};
	/**
	* Accumulate all (list) children of a type and return them as an Array.
	*
	* @param {AbstractType<any>} t
	* @return {Array<Item>}
	*/
	const getTypeChildren = (t) => {
		t.doc ?? warnPrematureAccess();
		let s = t._start;
		const arr = [];
		while (s) {
			arr.push(s);
			s = s.right;
		}
		return arr;
	};
	/**
	* Call event listeners with an event. This will also add an event to all
	* parents (for `.observeDeep` handlers).
	*
	* @template EventType
	* @param {AbstractType<EventType>} type
	* @param {Transaction} transaction
	* @param {EventType} event
	*/
	const callTypeObservers = (type, transaction, event) => {
		const changedType = type;
		const changedParentTypes = transaction.changedParentTypes;
		while (true) {
			setIfUndefined(changedParentTypes, type, () => []).push(event);
			if (type._item === null) break;
			type = type._item.parent;
		}
		callEventHandlerListeners(changedType._eH, event, transaction);
	};
	/**
	* @template EventType
	* Abstract Yjs Type class
	*/
	var AbstractType = class {
		constructor() {
			/**
			* @type {Item|null}
			*/
			this._item = null;
			/**
			* @type {Map<string,Item>}
			*/
			this._map = /* @__PURE__ */ new Map();
			/**
			* @type {Item|null}
			*/
			this._start = null;
			/**
			* @type {Doc|null}
			*/
			this.doc = null;
			this._length = 0;
			/**
			* Event handlers
			* @type {EventHandler<EventType,Transaction>}
			*/
			this._eH = createEventHandler();
			/**
			* Deep event handlers
			* @type {EventHandler<Array<YEvent<any>>,Transaction>}
			*/
			this._dEH = createEventHandler();
			/**
			* @type {null | Array<ArraySearchMarker>}
			*/
			this._searchMarker = null;
		}
		/**
		* @return {AbstractType<any>|null}
		*/
		get parent() {
			return this._item ? this._item.parent : null;
		}
		/**
		* Integrate this type into the Yjs instance.
		*
		* * Save this struct in the os
		* * This type is sent to other client
		* * Observer functions are fired
		*
		* @param {Doc} y The Yjs instance
		* @param {Item|null} item
		*/
		_integrate(y, item) {
			this.doc = y;
			this._item = item;
		}
		/**
		* @return {AbstractType<EventType>}
		*/
		_copy() {
			throw methodUnimplemented();
		}
		/**
		* Makes a copy of this data type that can be included somewhere else.
		*
		* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
		*
		* @return {AbstractType<EventType>}
		*/
		clone() {
			throw methodUnimplemented();
		}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} _encoder
		*/
		_write(_encoder) {}
		/**
		* The first non-deleted item
		*/
		get _first() {
			let n = this._start;
			while (n !== null && n.deleted) n = n.right;
			return n;
		}
		/**
		* Creates YEvent and calls all type observers.
		* Must be implemented by each type.
		*
		* @param {Transaction} transaction
		* @param {Set<null|string>} _parentSubs Keys changed on this type. `null` if list was modified.
		*/
		_callObserver(transaction, _parentSubs) {
			if (!transaction.local && this._searchMarker) this._searchMarker.length = 0;
		}
		/**
		* Observe all events that are created on this type.
		*
		* @param {function(EventType, Transaction):void} f Observer function
		*/
		observe(f) {
			addEventHandlerListener(this._eH, f);
		}
		/**
		* Observe all events that are created by this type and its children.
		*
		* @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
		*/
		observeDeep(f) {
			addEventHandlerListener(this._dEH, f);
		}
		/**
		* Unregister an observer function.
		*
		* @param {function(EventType,Transaction):void} f Observer function
		*/
		unobserve(f) {
			removeEventHandlerListener(this._eH, f);
		}
		/**
		* Unregister an observer function.
		*
		* @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
		*/
		unobserveDeep(f) {
			removeEventHandlerListener(this._dEH, f);
		}
		/**
		* @abstract
		* @return {any}
		*/
		toJSON() {}
	};
	/**
	* @param {AbstractType<any>} type
	* @param {number} start
	* @param {number} end
	* @return {Array<any>}
	*
	* @private
	* @function
	*/
	const typeListSlice = (type, start, end) => {
		type.doc ?? warnPrematureAccess();
		if (start < 0) start = type._length + start;
		if (end < 0) end = type._length + end;
		let len = end - start;
		const cs = [];
		let n = type._start;
		while (n !== null && len > 0) {
			if (n.countable && !n.deleted) {
				const c = n.content.getContent();
				if (c.length <= start) start -= c.length;
				else {
					for (let i = start; i < c.length && len > 0; i++) {
						cs.push(c[i]);
						len--;
					}
					start = 0;
				}
			}
			n = n.right;
		}
		return cs;
	};
	/**
	* @param {AbstractType<any>} type
	* @return {Array<any>}
	*
	* @private
	* @function
	*/
	const typeListToArray = (type) => {
		type.doc ?? warnPrematureAccess();
		const cs = [];
		let n = type._start;
		while (n !== null) {
			if (n.countable && !n.deleted) {
				const c = n.content.getContent();
				for (let i = 0; i < c.length; i++) cs.push(c[i]);
			}
			n = n.right;
		}
		return cs;
	};
	/**
	* @param {AbstractType<any>} type
	* @param {Snapshot} snapshot
	* @return {Array<any>}
	*
	* @private
	* @function
	*/
	const typeListToArraySnapshot = (type, snapshot) => {
		const cs = [];
		let n = type._start;
		while (n !== null) {
			if (n.countable && isVisible(n, snapshot)) {
				const c = n.content.getContent();
				for (let i = 0; i < c.length; i++) cs.push(c[i]);
			}
			n = n.right;
		}
		return cs;
	};
	/**
	* Executes a provided function on once on every element of this YArray.
	*
	* @param {AbstractType<any>} type
	* @param {function(any,number,any):void} f A function to execute on every element of this YArray.
	*
	* @private
	* @function
	*/
	const typeListForEach = (type, f) => {
		let index = 0;
		let n = type._start;
		type.doc ?? warnPrematureAccess();
		while (n !== null) {
			if (n.countable && !n.deleted) {
				const c = n.content.getContent();
				for (let i = 0; i < c.length; i++) f(c[i], index++, type);
			}
			n = n.right;
		}
	};
	/**
	* @template C,R
	* @param {AbstractType<any>} type
	* @param {function(C,number,AbstractType<any>):R} f
	* @return {Array<R>}
	*
	* @private
	* @function
	*/
	const typeListMap = (type, f) => {
		/**
		* @type {Array<any>}
		*/
		const result = [];
		typeListForEach(type, (c, i) => {
			result.push(f(c, i, type));
		});
		return result;
	};
	/**
	* @param {AbstractType<any>} type
	* @return {IterableIterator<any>}
	*
	* @private
	* @function
	*/
	const typeListCreateIterator = (type) => {
		let n = type._start;
		/**
		* @type {Array<any>|null}
		*/
		let currentContent = null;
		let currentContentIndex = 0;
		return {
			[Symbol.iterator]() {
				return this;
			},
			next: () => {
				if (currentContent === null) {
					while (n !== null && n.deleted) n = n.right;
					if (n === null) return {
						done: true,
						value: void 0
					};
					currentContent = n.content.getContent();
					currentContentIndex = 0;
					n = n.right;
				}
				const value = currentContent[currentContentIndex++];
				if (currentContent.length <= currentContentIndex) currentContent = null;
				return {
					done: false,
					value
				};
			}
		};
	};
	/**
	* @param {AbstractType<any>} type
	* @param {number} index
	* @return {any}
	*
	* @private
	* @function
	*/
	const typeListGet = (type, index) => {
		type.doc ?? warnPrematureAccess();
		const marker = findMarker(type, index);
		let n = type._start;
		if (marker !== null) {
			n = marker.p;
			index -= marker.index;
		}
		for (; n !== null; n = n.right) if (!n.deleted && n.countable) {
			if (index < n.length) return n.content.getContent()[index];
			index -= n.length;
		}
	};
	/**
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {Item?} referenceItem
	* @param {Array<Object<string,any>|Array<any>|boolean|number|null|string|Uint8Array>} content
	*
	* @private
	* @function
	*/
	const typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
		let left = referenceItem;
		const doc = transaction.doc;
		const ownClientId = doc.clientID;
		const store = doc.store;
		const right = referenceItem === null ? parent._start : referenceItem.right;
		/**
		* @type {Array<Object|Array<any>|number|null>}
		*/
		let jsonContent = [];
		const packJsonContent = () => {
			if (jsonContent.length > 0) {
				left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentAny(jsonContent));
				left.integrate(transaction, 0);
				jsonContent = [];
			}
		};
		content.forEach((c) => {
			if (c === null) jsonContent.push(c);
			else switch (c.constructor) {
				case Number:
				case Object:
				case Boolean:
				case Array:
				case String:
					jsonContent.push(c);
					break;
				default:
					packJsonContent();
					switch (c.constructor) {
						case Uint8Array:
						case ArrayBuffer:
							left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentBinary(new Uint8Array(c)));
							left.integrate(transaction, 0);
							break;
						case Doc:
							left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentDoc(c));
							left.integrate(transaction, 0);
							break;
						default: if (c instanceof AbstractType) {
							left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentType(c));
							left.integrate(transaction, 0);
						} else throw new Error("Unexpected content type in insert operation");
					}
			}
		});
		packJsonContent();
	};
	const lengthExceeded = () => create$5("Length exceeded!");
	/**
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {number} index
	* @param {Array<Object<string,any>|Array<any>|number|null|string|Uint8Array>} content
	*
	* @private
	* @function
	*/
	const typeListInsertGenerics = (transaction, parent, index, content) => {
		if (index > parent._length) throw lengthExceeded();
		if (index === 0) {
			if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, index, content.length);
			return typeListInsertGenericsAfter(transaction, parent, null, content);
		}
		const startIndex = index;
		const marker = findMarker(parent, index);
		let n = parent._start;
		if (marker !== null) {
			n = marker.p;
			index -= marker.index;
			if (index === 0) {
				n = n.prev;
				index += n && n.countable && !n.deleted ? n.length : 0;
			}
		}
		for (; n !== null; n = n.right) if (!n.deleted && n.countable) {
			if (index <= n.length) {
				if (index < n.length) getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
				break;
			}
			index -= n.length;
		}
		if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, startIndex, content.length);
		return typeListInsertGenericsAfter(transaction, parent, n, content);
	};
	/**
	* Pushing content is special as we generally want to push after the last item. So we don't have to update
	* the search marker.
	*
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {Array<Object<string,any>|Array<any>|number|null|string|Uint8Array>} content
	*
	* @private
	* @function
	*/
	const typeListPushGenerics = (transaction, parent, content) => {
		let n = (parent._searchMarker || []).reduce((maxMarker, currMarker) => currMarker.index > maxMarker.index ? currMarker : maxMarker, {
			index: 0,
			p: parent._start
		}).p;
		if (n) while (n.right) n = n.right;
		return typeListInsertGenericsAfter(transaction, parent, n, content);
	};
	/**
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {number} index
	* @param {number} length
	*
	* @private
	* @function
	*/
	const typeListDelete = (transaction, parent, index, length) => {
		if (length === 0) return;
		const startIndex = index;
		const startLength = length;
		const marker = findMarker(parent, index);
		let n = parent._start;
		if (marker !== null) {
			n = marker.p;
			index -= marker.index;
		}
		for (; n !== null && index > 0; n = n.right) if (!n.deleted && n.countable) {
			if (index < n.length) getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
			index -= n.length;
		}
		while (length > 0 && n !== null) {
			if (!n.deleted) {
				if (length < n.length) getItemCleanStart(transaction, createID(n.id.client, n.id.clock + length));
				n.delete(transaction);
				length -= n.length;
			}
			n = n.right;
		}
		if (length > 0) throw lengthExceeded();
		if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, startIndex, -startLength + length);
	};
	/**
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {string} key
	*
	* @private
	* @function
	*/
	const typeMapDelete = (transaction, parent, key) => {
		const c = parent._map.get(key);
		if (c !== void 0) c.delete(transaction);
	};
	/**
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {string} key
	* @param {Object|number|null|Array<any>|string|Uint8Array|AbstractType<any>} value
	*
	* @private
	* @function
	*/
	const typeMapSet = (transaction, parent, key, value) => {
		const left = parent._map.get(key) || null;
		const doc = transaction.doc;
		const ownClientId = doc.clientID;
		let content;
		if (value == null) content = new ContentAny([value]);
		else switch (value.constructor) {
			case Number:
			case Object:
			case Boolean:
			case Array:
			case String:
			case Date:
			case BigInt:
				content = new ContentAny([value]);
				break;
			case Uint8Array:
				content = new ContentBinary(value);
				break;
			case Doc:
				content = new ContentDoc(value);
				break;
			default: if (value instanceof AbstractType) content = new ContentType(value);
			else throw new Error("Unexpected content type");
		}
		new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
	};
	/**
	* @param {AbstractType<any>} parent
	* @param {string} key
	* @return {Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined}
	*
	* @private
	* @function
	*/
	const typeMapGet = (parent, key) => {
		parent.doc ?? warnPrematureAccess();
		const val = parent._map.get(key);
		return val !== void 0 && !val.deleted ? val.content.getContent()[val.length - 1] : void 0;
	};
	/**
	* @param {AbstractType<any>} parent
	* @return {Object<string,Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined>}
	*
	* @private
	* @function
	*/
	const typeMapGetAll = (parent) => {
		/**
		* @type {Object<string,any>}
		*/
		const res = {};
		parent.doc ?? warnPrematureAccess();
		parent._map.forEach((value, key) => {
			if (!value.deleted) res[key] = value.content.getContent()[value.length - 1];
		});
		return res;
	};
	/**
	* @param {AbstractType<any>} parent
	* @param {string} key
	* @return {boolean}
	*
	* @private
	* @function
	*/
	const typeMapHas = (parent, key) => {
		parent.doc ?? warnPrematureAccess();
		const val = parent._map.get(key);
		return val !== void 0 && !val.deleted;
	};
	/**
	* @param {AbstractType<any>} parent
	* @param {string} key
	* @param {Snapshot} snapshot
	* @return {Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined}
	*
	* @private
	* @function
	*/
	const typeMapGetSnapshot = (parent, key, snapshot) => {
		let v = parent._map.get(key) || null;
		while (v !== null && (!snapshot.sv.has(v.id.client) || v.id.clock >= (snapshot.sv.get(v.id.client) || 0))) v = v.left;
		return v !== null && isVisible(v, snapshot) ? v.content.getContent()[v.length - 1] : void 0;
	};
	/**
	* @param {AbstractType<any>} parent
	* @param {Snapshot} snapshot
	* @return {Object<string,Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined>}
	*
	* @private
	* @function
	*/
	const typeMapGetAllSnapshot = (parent, snapshot) => {
		/**
		* @type {Object<string,any>}
		*/
		const res = {};
		parent._map.forEach((value, key) => {
			/**
			* @type {Item|null}
			*/
			let v = value;
			while (v !== null && (!snapshot.sv.has(v.id.client) || v.id.clock >= (snapshot.sv.get(v.id.client) || 0))) v = v.left;
			if (v !== null && isVisible(v, snapshot)) res[key] = v.content.getContent()[v.length - 1];
		});
		return res;
	};
	/**
	* @param {AbstractType<any> & { _map: Map<string, Item> }} type
	* @return {IterableIterator<Array<any>>}
	*
	* @private
	* @function
	*/
	const createMapIterator = (type) => {
		type.doc ?? warnPrematureAccess();
		return iteratorFilter(
			type._map.entries(),
			/** @param {any} entry */
			(entry) => !entry[1].deleted
		);
	};
	/**
	* @module YArray
	*/
	/**
	* Event that describes the changes on a YArray
	* @template T
	* @extends YEvent<YArray<T>>
	*/
	var YArrayEvent = class extends YEvent {};
	/**
	* A shared Array implementation.
	* @template T
	* @extends AbstractType<YArrayEvent<T>>
	* @implements {Iterable<T>}
	*/
	var YArray = class YArray extends AbstractType {
		constructor() {
			super();
			/**
			* @type {Array<any>?}
			* @private
			*/
			this._prelimContent = [];
			/**
			* @type {Array<ArraySearchMarker>}
			*/
			this._searchMarker = [];
		}
		/**
		* Construct a new YArray containing the specified items.
		* @template {Object<string,any>|Array<any>|number|null|string|Uint8Array} T
		* @param {Array<T>} items
		* @return {YArray<T>}
		*/
		static from(items) {
			/**
			* @type {YArray<T>}
			*/
			const a = new YArray();
			a.push(items);
			return a;
		}
		/**
		* Integrate this type into the Yjs instance.
		*
		* * Save this struct in the os
		* * This type is sent to other client
		* * Observer functions are fired
		*
		* @param {Doc} y The Yjs instance
		* @param {Item} item
		*/
		_integrate(y, item) {
			super._integrate(y, item);
			this.insert(0, this._prelimContent);
			this._prelimContent = null;
		}
		/**
		* @return {YArray<T>}
		*/
		_copy() {
			return new YArray();
		}
		/**
		* Makes a copy of this data type that can be included somewhere else.
		*
		* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
		*
		* @return {YArray<T>}
		*/
		clone() {
			/**
			* @type {YArray<T>}
			*/
			const arr = new YArray();
			arr.insert(0, this.toArray().map((el) => el instanceof AbstractType ? el.clone() : el));
			return arr;
		}
		get length() {
			this.doc ?? warnPrematureAccess();
			return this._length;
		}
		/**
		* Creates YArrayEvent and calls observers.
		*
		* @param {Transaction} transaction
		* @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
		*/
		_callObserver(transaction, parentSubs) {
			super._callObserver(transaction, parentSubs);
			callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
		}
		/**
		* Inserts new content at an index.
		*
		* Important: This function expects an array of content. Not just a content
		* object. The reason for this "weirdness" is that inserting several elements
		* is very efficient when it is done as a single operation.
		*
		* @example
		*  // Insert character 'a' at position 0
		*  yarray.insert(0, ['a'])
		*  // Insert numbers 1, 2 at position 1
		*  yarray.insert(1, [1, 2])
		*
		* @param {number} index The index to insert content at.
		* @param {Array<T>} content The array of content
		*/
		insert(index, content) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeListInsertGenerics(transaction, this, index, content);
			});
			else
 /** @type {Array<any>} */ this._prelimContent.splice(index, 0, ...content);
		}
		/**
		* Appends content to this YArray.
		*
		* @param {Array<T>} content Array of content to append.
		*
		* @todo Use the following implementation in all types.
		*/
		push(content) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeListPushGenerics(transaction, this, content);
			});
			else
 /** @type {Array<any>} */ this._prelimContent.push(...content);
		}
		/**
		* Prepends content to this YArray.
		*
		* @param {Array<T>} content Array of content to prepend.
		*/
		unshift(content) {
			this.insert(0, content);
		}
		/**
		* Deletes elements starting from an index.
		*
		* @param {number} index Index at which to start deleting elements
		* @param {number} length The number of elements to remove. Defaults to 1.
		*/
		delete(index, length = 1) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeListDelete(transaction, this, index, length);
			});
			else
 /** @type {Array<any>} */ this._prelimContent.splice(index, length);
		}
		/**
		* Returns the i-th element from a YArray.
		*
		* @param {number} index The index of the element to return from the YArray
		* @return {T}
		*/
		get(index) {
			return typeListGet(this, index);
		}
		/**
		* Transforms this YArray to a JavaScript Array.
		*
		* @return {Array<T>}
		*/
		toArray() {
			return typeListToArray(this);
		}
		/**
		* Returns a portion of this YArray into a JavaScript Array selected
		* from start to end (end not included).
		*
		* @param {number} [start]
		* @param {number} [end]
		* @return {Array<T>}
		*/
		slice(start = 0, end = this.length) {
			return typeListSlice(this, start, end);
		}
		/**
		* Transforms this Shared Type to a JSON object.
		*
		* @return {Array<any>}
		*/
		toJSON() {
			return this.map((c) => c instanceof AbstractType ? c.toJSON() : c);
		}
		/**
		* Returns an Array with the result of calling a provided function on every
		* element of this YArray.
		*
		* @template M
		* @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
		* @return {Array<M>} A new array with each element being the result of the
		*                 callback function
		*/
		map(f) {
			return typeListMap(this, f);
		}
		/**
		* Executes a provided function once on every element of this YArray.
		*
		* @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
		*/
		forEach(f) {
			typeListForEach(this, f);
		}
		/**
		* @return {IterableIterator<T>}
		*/
		[Symbol.iterator]() {
			return typeListCreateIterator(this);
		}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		*/
		_write(encoder) {
			encoder.writeTypeRef(YArrayRefID);
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
	*
	* @private
	* @function
	*/
	const readYArray = (_decoder) => new YArray();
	/**
	* @module YMap
	*/
	/**
	* @template T
	* @extends YEvent<YMap<T>>
	* Event that describes the changes on a YMap.
	*/
	var YMapEvent = class extends YEvent {
		/**
		* @param {YMap<T>} ymap The YArray that changed.
		* @param {Transaction} transaction
		* @param {Set<any>} subs The keys that changed.
		*/
		constructor(ymap, transaction, subs) {
			super(ymap, transaction);
			this.keysChanged = subs;
		}
	};
	/**
	* @template MapType
	* A shared Map implementation.
	*
	* @extends AbstractType<YMapEvent<MapType>>
	* @implements {Iterable<[string, MapType]>}
	*/
	var YMap = class YMap extends AbstractType {
		/**
		*
		* @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
		*/
		constructor(entries) {
			super();
			/**
			* @type {Map<string,any>?}
			* @private
			*/
			this._prelimContent = null;
			if (entries === void 0) this._prelimContent = /* @__PURE__ */ new Map();
			else this._prelimContent = new Map(entries);
		}
		/**
		* Integrate this type into the Yjs instance.
		*
		* * Save this struct in the os
		* * This type is sent to other client
		* * Observer functions are fired
		*
		* @param {Doc} y The Yjs instance
		* @param {Item} item
		*/
		_integrate(y, item) {
			super._integrate(y, item);
			/** @type {Map<string, any>} */ this._prelimContent.forEach((value, key) => {
				this.set(key, value);
			});
			this._prelimContent = null;
		}
		/**
		* @return {YMap<MapType>}
		*/
		_copy() {
			return new YMap();
		}
		/**
		* Makes a copy of this data type that can be included somewhere else.
		*
		* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
		*
		* @return {YMap<MapType>}
		*/
		clone() {
			/**
			* @type {YMap<MapType>}
			*/
			const map = new YMap();
			this.forEach((value, key) => {
				map.set(key, value instanceof AbstractType ? value.clone() : value);
			});
			return map;
		}
		/**
		* Creates YMapEvent and calls observers.
		*
		* @param {Transaction} transaction
		* @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
		*/
		_callObserver(transaction, parentSubs) {
			callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
		}
		/**
		* Transforms this Shared Type to a JSON object.
		*
		* @return {Object<string,any>}
		*/
		toJSON() {
			this.doc ?? warnPrematureAccess();
			/**
			* @type {Object<string,MapType>}
			*/
			const map = {};
			this._map.forEach((item, key) => {
				if (!item.deleted) {
					const v = item.content.getContent()[item.length - 1];
					map[key] = v instanceof AbstractType ? v.toJSON() : v;
				}
			});
			return map;
		}
		/**
		* Returns the size of the YMap (count of key/value pairs)
		*
		* @return {number}
		*/
		get size() {
			return [...createMapIterator(this)].length;
		}
		/**
		* Returns the keys for each element in the YMap Type.
		*
		* @return {IterableIterator<string>}
		*/
		keys() {
			return iteratorMap(
				createMapIterator(this),
				/** @param {any} v */
				(v) => v[0]
			);
		}
		/**
		* Returns the values for each element in the YMap Type.
		*
		* @return {IterableIterator<MapType>}
		*/
		values() {
			return iteratorMap(
				createMapIterator(this),
				/** @param {any} v */
				(v) => v[1].content.getContent()[v[1].length - 1]
			);
		}
		/**
		* Returns an Iterator of [key, value] pairs
		*
		* @return {IterableIterator<[string, MapType]>}
		*/
		entries() {
			return iteratorMap(
				createMapIterator(this),
				/** @param {any} v */
				(v) => [v[0], v[1].content.getContent()[v[1].length - 1]]
			);
		}
		/**
		* Executes a provided function on once on every key-value pair.
		*
		* @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
		*/
		forEach(f) {
			this.doc ?? warnPrematureAccess();
			this._map.forEach((item, key) => {
				if (!item.deleted) f(item.content.getContent()[item.length - 1], key, this);
			});
		}
		/**
		* Returns an Iterator of [key, value] pairs
		*
		* @return {IterableIterator<[string, MapType]>}
		*/
		[Symbol.iterator]() {
			return this.entries();
		}
		/**
		* Remove a specified element from this YMap.
		*
		* @param {string} key The key of the element to remove.
		*/
		delete(key) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeMapDelete(transaction, this, key);
			});
			else
 /** @type {Map<string, any>} */ this._prelimContent.delete(key);
		}
		/**
		* Adds or updates an element with a specified key and value.
		* @template {MapType} VAL
		*
		* @param {string} key The key of the element to add to this YMap
		* @param {VAL} value The value of the element to add
		* @return {VAL}
		*/
		set(key, value) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeMapSet(transaction, this, key, value);
			});
			else
 /** @type {Map<string, any>} */ this._prelimContent.set(key, value);
			return value;
		}
		/**
		* Returns a specified element from this YMap.
		*
		* @param {string} key
		* @return {MapType|undefined}
		*/
		get(key) {
			return typeMapGet(this, key);
		}
		/**
		* Returns a boolean indicating whether the specified key exists or not.
		*
		* @param {string} key The key to test.
		* @return {boolean}
		*/
		has(key) {
			return typeMapHas(this, key);
		}
		/**
		* Removes all elements from this YMap.
		*/
		clear() {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				this.forEach(function(_value, key, map) {
					typeMapDelete(transaction, map, key);
				});
			});
			else
 /** @type {Map<string, any>} */ this._prelimContent.clear();
		}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		*/
		_write(encoder) {
			encoder.writeTypeRef(YMapRefID);
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
	*
	* @private
	* @function
	*/
	const readYMap = (_decoder) => new YMap();
	/**
	* @module YText
	*/
	/**
	* @param {any} a
	* @param {any} b
	* @return {boolean}
	*/
	const equalAttrs = (a, b) => a === b || typeof a === "object" && typeof b === "object" && a && b && equalFlat(a, b);
	var ItemTextListPosition = class {
		/**
		* @param {Item|null} left
		* @param {Item|null} right
		* @param {number} index
		* @param {Map<string,any>} currentAttributes
		*/
		constructor(left, right, index, currentAttributes) {
			this.left = left;
			this.right = right;
			this.index = index;
			this.currentAttributes = currentAttributes;
		}
		/**
		* Only call this if you know that this.right is defined
		*/
		forward() {
			if (this.right === null) unexpectedCase();
			switch (this.right.content.constructor) {
				case ContentFormat:
					if (!this.right.deleted) updateCurrentAttributes(this.currentAttributes, this.right.content);
					break;
				default: if (!this.right.deleted) this.index += this.right.length;
			}
			this.left = this.right;
			this.right = this.right.right;
		}
	};
	/**
	* @param {Transaction} transaction
	* @param {ItemTextListPosition} pos
	* @param {number} count steps to move forward
	* @return {ItemTextListPosition}
	*
	* @private
	* @function
	*/
	const findNextPosition = (transaction, pos, count) => {
		while (pos.right !== null && count > 0) {
			switch (pos.right.content.constructor) {
				case ContentFormat:
					if (!pos.right.deleted) updateCurrentAttributes(pos.currentAttributes, pos.right.content);
					break;
				default: if (!pos.right.deleted) {
					if (count < pos.right.length) getItemCleanStart(transaction, createID(pos.right.id.client, pos.right.id.clock + count));
					pos.index += pos.right.length;
					count -= pos.right.length;
				}
			}
			pos.left = pos.right;
			pos.right = pos.right.right;
		}
		return pos;
	};
	/**
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {number} index
	* @param {boolean} useSearchMarker
	* @return {ItemTextListPosition}
	*
	* @private
	* @function
	*/
	const findPosition = (transaction, parent, index, useSearchMarker) => {
		const currentAttributes = /* @__PURE__ */ new Map();
		const marker = useSearchMarker ? findMarker(parent, index) : null;
		if (marker) {
			const pos = new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes);
			return findNextPosition(transaction, pos, index - marker.index);
		} else {
			const pos = new ItemTextListPosition(null, parent._start, 0, currentAttributes);
			return findNextPosition(transaction, pos, index);
		}
	};
	/**
	* Negate applied formats
	*
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {ItemTextListPosition} currPos
	* @param {Map<string,any>} negatedAttributes
	*
	* @private
	* @function
	*/
	const insertNegatedAttributes = (transaction, parent, currPos, negatedAttributes) => {
		while (currPos.right !== null && (currPos.right.deleted === true || currPos.right.content.constructor === ContentFormat && equalAttrs(
			negatedAttributes.get(
				/** @type {ContentFormat} */
				currPos.right.content.key
			),
			/** @type {ContentFormat} */
			currPos.right.content.value
		))) {
			if (!currPos.right.deleted) negatedAttributes.delete(
				/** @type {ContentFormat} */
				currPos.right.content.key
			);
			currPos.forward();
		}
		const doc = transaction.doc;
		const ownClientId = doc.clientID;
		negatedAttributes.forEach((val, key) => {
			const left = currPos.left;
			const right = currPos.right;
			const nextFormat = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
			nextFormat.integrate(transaction, 0);
			currPos.right = nextFormat;
			currPos.forward();
		});
	};
	/**
	* @param {Map<string,any>} currentAttributes
	* @param {ContentFormat} format
	*
	* @private
	* @function
	*/
	const updateCurrentAttributes = (currentAttributes, format) => {
		const { key, value } = format;
		if (value === null) currentAttributes.delete(key);
		else currentAttributes.set(key, value);
	};
	/**
	* @param {ItemTextListPosition} currPos
	* @param {Object<string,any>} attributes
	*
	* @private
	* @function
	*/
	const minimizeAttributeChanges = (currPos, attributes) => {
		while (true) {
			if (currPos.right === null) break;
			else if (currPos.right.deleted || currPos.right.content.constructor === ContentFormat && equalAttrs(
				attributes[currPos.right.content.key] ?? null,
				/** @type {ContentFormat} */
				currPos.right.content.value
			));
			else break;
			currPos.forward();
		}
	};
	/**
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {ItemTextListPosition} currPos
	* @param {Object<string,any>} attributes
	* @return {Map<string,any>}
	*
	* @private
	* @function
	**/
	const insertAttributes = (transaction, parent, currPos, attributes) => {
		const doc = transaction.doc;
		const ownClientId = doc.clientID;
		const negatedAttributes = /* @__PURE__ */ new Map();
		for (const key in attributes) {
			const val = attributes[key];
			const currentVal = currPos.currentAttributes.get(key) ?? null;
			if (!equalAttrs(currentVal, val)) {
				negatedAttributes.set(key, currentVal);
				const { left, right } = currPos;
				currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
				currPos.right.integrate(transaction, 0);
				currPos.forward();
			}
		}
		return negatedAttributes;
	};
	/**
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {ItemTextListPosition} currPos
	* @param {string|object|AbstractType<any>} text
	* @param {Object<string,any>} attributes
	*
	* @private
	* @function
	**/
	const insertText = (transaction, parent, currPos, text, attributes) => {
		currPos.currentAttributes.forEach((_val, key) => {
			if (attributes[key] === void 0) attributes[key] = null;
		});
		const doc = transaction.doc;
		const ownClientId = doc.clientID;
		minimizeAttributeChanges(currPos, attributes);
		const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
		const content = text.constructor === String ? new ContentString(text) : text instanceof AbstractType ? new ContentType(text) : new ContentEmbed(text);
		let { left, right, index } = currPos;
		if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, currPos.index, content.getLength());
		right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
		right.integrate(transaction, 0);
		currPos.right = right;
		currPos.index = index;
		currPos.forward();
		insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
	};
	/**
	* @param {Transaction} transaction
	* @param {AbstractType<any>} parent
	* @param {ItemTextListPosition} currPos
	* @param {number} length
	* @param {Object<string,any>} attributes
	*
	* @private
	* @function
	*/
	const formatText = (transaction, parent, currPos, length, attributes) => {
		const doc = transaction.doc;
		const ownClientId = doc.clientID;
		minimizeAttributeChanges(currPos, attributes);
		const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
		iterationLoop: while (currPos.right !== null && (length > 0 || negatedAttributes.size > 0 && (currPos.right.deleted || currPos.right.content.constructor === ContentFormat))) {
			if (!currPos.right.deleted) switch (currPos.right.content.constructor) {
				case ContentFormat: {
					const { key, value } = currPos.right.content;
					const attr = attributes[key];
					if (attr !== void 0) {
						if (equalAttrs(attr, value)) negatedAttributes.delete(key);
						else {
							if (length === 0) break iterationLoop;
							negatedAttributes.set(key, value);
						}
						currPos.right.delete(transaction);
					} else currPos.currentAttributes.set(key, value);
					break;
				}
				default:
					if (length < currPos.right.length) getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length));
					length -= currPos.right.length;
			}
			currPos.forward();
		}
		if (length > 0) {
			let newlines = "";
			for (; length > 0; length--) newlines += "\n";
			currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new ContentString(newlines));
			currPos.right.integrate(transaction, 0);
			currPos.forward();
		}
		insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
	};
	/**
	* Call this function after string content has been deleted in order to
	* clean up formatting Items.
	*
	* @param {Transaction} transaction
	* @param {Item} start
	* @param {Item|null} curr exclusive end, automatically iterates to the next Content Item
	* @param {Map<string,any>} startAttributes
	* @param {Map<string,any>} currAttributes
	* @return {number} The amount of formatting Items deleted.
	*
	* @function
	*/
	const cleanupFormattingGap = (transaction, start, curr, startAttributes, currAttributes) => {
		/**
		* @type {Item|null}
		*/
		let end = start;
		/**
		* @type {Map<string,ContentFormat>}
		*/
		const endFormats = create$7();
		while (end && (!end.countable || end.deleted)) {
			if (!end.deleted && end.content.constructor === ContentFormat) {
				const cf = end.content;
				endFormats.set(cf.key, cf);
			}
			end = end.right;
		}
		let cleanups = 0;
		let reachedCurr = false;
		while (start !== end) {
			if (curr === start) reachedCurr = true;
			if (!start.deleted) {
				const content = start.content;
				switch (content.constructor) {
					case ContentFormat: {
						const { key, value } = content;
						const startAttrValue = startAttributes.get(key) ?? null;
						if (endFormats.get(key) !== content || startAttrValue === value) {
							start.delete(transaction);
							cleanups++;
							if (!reachedCurr && (currAttributes.get(key) ?? null) === value && startAttrValue !== value) {
								if (startAttrValue === null) currAttributes.delete(key);
								else currAttributes.set(key, startAttrValue);
							}
						}
						if (!reachedCurr && !start.deleted) updateCurrentAttributes(currAttributes, content);
						break;
					}
				}
			}
			start = start.right;
		}
		return cleanups;
	};
	/**
	* @param {Transaction} transaction
	* @param {Item | null} item
	*/
	const cleanupContextlessFormattingGap = (transaction, item) => {
		while (item && item.right && (item.right.deleted || !item.right.countable)) item = item.right;
		const attrs = /* @__PURE__ */ new Set();
		while (item && (item.deleted || !item.countable)) {
			if (!item.deleted && item.content.constructor === ContentFormat) {
				const key = item.content.key;
				if (attrs.has(key)) item.delete(transaction);
				else attrs.add(key);
			}
			item = item.left;
		}
	};
	/**
	* This function is experimental and subject to change / be removed.
	*
	* Ideally, we don't need this function at all. Formatting attributes should be cleaned up
	* automatically after each change. This function iterates twice over the complete YText type
	* and removes unnecessary formatting attributes. This is also helpful for testing.
	*
	* This function won't be exported anymore as soon as there is confidence that the YText type works as intended.
	*
	* @param {YText} type
	* @return {number} How many formatting attributes have been cleaned up.
	*/
	const cleanupYTextFormatting = (type) => {
		let res = 0;
		transact(type.doc, (transaction) => {
			let start = type._start;
			let end = type._start;
			let startAttributes = create$7();
			const currentAttributes = copy(startAttributes);
			while (end) {
				if (end.deleted === false) switch (end.content.constructor) {
					case ContentFormat:
						updateCurrentAttributes(currentAttributes, end.content);
						break;
					default:
						res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
						startAttributes = copy(currentAttributes);
						start = end;
				}
				end = end.right;
			}
		});
		return res;
	};
	/**
	* This will be called by the transaction once the event handlers are called to potentially cleanup
	* formatting attributes.
	*
	* @param {Transaction} transaction
	*/
	const cleanupYTextAfterTransaction = (transaction) => {
		/**
		* @type {Set<YText>}
		*/
		const needFullCleanup = /* @__PURE__ */ new Set();
		const doc = transaction.doc;
		for (const [client, afterClock] of transaction.afterState.entries()) {
			const clock = transaction.beforeState.get(client) || 0;
			if (afterClock === clock) continue;
			iterateStructs(transaction, doc.store.clients.get(client), clock, afterClock, (item) => {
				if (!item.deleted && item.content.constructor === ContentFormat && item.constructor !== GC) needFullCleanup.add(
					/** @type {any} */
					item.parent
				);
			});
		}
		transact(doc, (t) => {
			iterateDeletedStructs(transaction, transaction.deleteSet, (item) => {
				if (item instanceof GC || !item.parent._hasFormatting || needFullCleanup.has(item.parent)) return;
				const parent = item.parent;
				if (item.content.constructor === ContentFormat) needFullCleanup.add(parent);
				else cleanupContextlessFormattingGap(t, item);
			});
			for (const yText of needFullCleanup) cleanupYTextFormatting(yText);
		});
	};
	/**
	* @param {Transaction} transaction
	* @param {ItemTextListPosition} currPos
	* @param {number} length
	* @return {ItemTextListPosition}
	*
	* @private
	* @function
	*/
	const deleteText = (transaction, currPos, length) => {
		const startLength = length;
		const startAttrs = copy(currPos.currentAttributes);
		const start = currPos.right;
		while (length > 0 && currPos.right !== null) {
			if (currPos.right.deleted === false) switch (currPos.right.content.constructor) {
				case ContentType:
				case ContentEmbed:
				case ContentString:
					if (length < currPos.right.length) getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length));
					length -= currPos.right.length;
					currPos.right.delete(transaction);
			}
			currPos.forward();
		}
		if (start) cleanupFormattingGap(transaction, start, currPos.right, startAttrs, currPos.currentAttributes);
		const parent = (currPos.left || currPos.right).parent;
		if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, currPos.index, -startLength + length);
		return currPos;
	};
	/**
	* The Quill Delta format represents changes on a text document with
	* formatting information. For more information visit {@link https://quilljs.com/docs/delta/|Quill Delta}
	*
	* @example
	*   {
	*     ops: [
	*       { insert: 'Gandalf', attributes: { bold: true } },
	*       { insert: ' the ' },
	*       { insert: 'Grey', attributes: { color: '#cccccc' } }
	*     ]
	*   }
	*
	*/
	/**
	* Attributes that can be assigned to a selection of text.
	*
	* @example
	*   {
	*     bold: true,
	*     font-size: '40px'
	*   }
	*
	* @typedef {Object} TextAttributes
	*/
	/**
	* @extends YEvent<YText>
	* Event that describes the changes on a YText type.
	*/
	var YTextEvent = class extends YEvent {
		/**
		* @param {YText} ytext
		* @param {Transaction} transaction
		* @param {Set<any>} subs The keys that changed
		*/
		constructor(ytext, transaction, subs) {
			super(ytext, transaction);
			/**
			* Whether the children changed.
			* @type {Boolean}
			* @private
			*/
			this.childListChanged = false;
			/**
			* Set of all changed attributes.
			* @type {Set<string>}
			*/
			this.keysChanged = /* @__PURE__ */ new Set();
			subs.forEach((sub) => {
				if (sub === null) this.childListChanged = true;
				else this.keysChanged.add(sub);
			});
		}
		/**
		* @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
		*/
		get changes() {
			if (this._changes === null) {
				/**
				* @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string|AbstractType<any>|object, delete?:number, retain?:number}>}}
				*/
				const changes = {
					keys: this.keys,
					delta: this.delta,
					added: /* @__PURE__ */ new Set(),
					deleted: /* @__PURE__ */ new Set()
				};
				this._changes = changes;
			}
			return this._changes;
		}
		/**
		* Compute the changes in the delta format.
		* A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
		*
		* @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
		*
		* @public
		*/
		get delta() {
			if (this._delta === null) {
				const y = this.target.doc;
				/**
				* @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
				*/
				const delta = [];
				transact(y, (transaction) => {
					const currentAttributes = /* @__PURE__ */ new Map();
					const oldAttributes = /* @__PURE__ */ new Map();
					let item = this.target._start;
					/**
					* @type {string?}
					*/
					let action = null;
					/**
					* @type {Object<string,any>}
					*/
					const attributes = {};
					/**
					* @type {string|object}
					*/
					let insert = "";
					let retain = 0;
					let deleteLen = 0;
					const addOp = () => {
						if (action !== null) {
							/**
							* @type {any}
							*/
							let op = null;
							switch (action) {
								case "delete":
									if (deleteLen > 0) op = { delete: deleteLen };
									deleteLen = 0;
									break;
								case "insert":
									if (typeof insert === "object" || insert.length > 0) {
										op = { insert };
										if (currentAttributes.size > 0) {
											op.attributes = {};
											currentAttributes.forEach((value, key) => {
												if (value !== null) op.attributes[key] = value;
											});
										}
									}
									insert = "";
									break;
								case "retain":
									if (retain > 0) {
										op = { retain };
										if (!isEmpty(attributes)) op.attributes = assign({}, attributes);
									}
									retain = 0;
							}
							if (op) delta.push(op);
							action = null;
						}
					};
					while (item !== null) {
						switch (item.content.constructor) {
							case ContentType:
							case ContentEmbed:
								if (this.adds(item)) {
									if (!this.deletes(item)) {
										addOp();
										action = "insert";
										insert = item.content.getContent()[0];
										addOp();
									}
								} else if (this.deletes(item)) {
									if (action !== "delete") {
										addOp();
										action = "delete";
									}
									deleteLen += 1;
								} else if (!item.deleted) {
									if (action !== "retain") {
										addOp();
										action = "retain";
									}
									retain += 1;
								}
								break;
							case ContentString:
								if (this.adds(item)) {
									if (!this.deletes(item)) {
										if (action !== "insert") {
											addOp();
											action = "insert";
										}
										insert += item.content.str;
									}
								} else if (this.deletes(item)) {
									if (action !== "delete") {
										addOp();
										action = "delete";
									}
									deleteLen += item.length;
								} else if (!item.deleted) {
									if (action !== "retain") {
										addOp();
										action = "retain";
									}
									retain += item.length;
								}
								break;
							case ContentFormat: {
								const { key, value } = item.content;
								if (this.adds(item)) {
									if (!this.deletes(item)) {
										const curVal = currentAttributes.get(key) ?? null;
										if (!equalAttrs(curVal, value)) {
											if (action === "retain") addOp();
											if (equalAttrs(value, oldAttributes.get(key) ?? null)) delete attributes[key];
											else attributes[key] = value;
										} else if (value !== null) item.delete(transaction);
									}
								} else if (this.deletes(item)) {
									oldAttributes.set(key, value);
									const curVal = currentAttributes.get(key) ?? null;
									if (!equalAttrs(curVal, value)) {
										if (action === "retain") addOp();
										attributes[key] = curVal;
									}
								} else if (!item.deleted) {
									oldAttributes.set(key, value);
									const attr = attributes[key];
									if (attr !== void 0) {
										if (!equalAttrs(attr, value)) {
											if (action === "retain") addOp();
											if (value === null) delete attributes[key];
											else attributes[key] = value;
										} else if (attr !== null) item.delete(transaction);
									}
								}
								if (!item.deleted) {
									if (action === "insert") addOp();
									updateCurrentAttributes(currentAttributes, item.content);
								}
								break;
							}
						}
						item = item.right;
					}
					addOp();
					while (delta.length > 0) {
						const lastOp = delta[delta.length - 1];
						if (lastOp.retain !== void 0 && lastOp.attributes === void 0) delta.pop();
						else break;
					}
				});
				this._delta = delta;
			}
			return this._delta;
		}
	};
	/**
	* Type that represents text with formatting information.
	*
	* This type replaces y-richtext as this implementation is able to handle
	* block formats (format information on a paragraph), embeds (complex elements
	* like pictures and videos), and text formats (**bold**, *italic*).
	*
	* @extends AbstractType<YTextEvent>
	*/
	var YText = class YText extends AbstractType {
		/**
		* @param {String} [string] The initial value of the YText.
		*/
		constructor(string) {
			super();
			/**
			* Array of pending operations on this type
			* @type {Array<function():void>?}
			*/
			this._pending = string !== void 0 ? [() => this.insert(0, string)] : [];
			/**
			* @type {Array<ArraySearchMarker>|null}
			*/
			this._searchMarker = [];
			/**
			* Whether this YText contains formatting attributes.
			* This flag is updated when a formatting item is integrated (see ContentFormat.integrate)
			*/
			this._hasFormatting = false;
		}
		/**
		* Number of characters of this text type.
		*
		* @type {number}
		*/
		get length() {
			this.doc ?? warnPrematureAccess();
			return this._length;
		}
		/**
		* @param {Doc} y
		* @param {Item} item
		*/
		_integrate(y, item) {
			super._integrate(y, item);
			try {
				/** @type {Array<function>} */ this._pending.forEach((f) => f());
			} catch (e) {
				console.error(e);
			}
			this._pending = null;
		}
		_copy() {
			return new YText();
		}
		/**
		* Makes a copy of this data type that can be included somewhere else.
		*
		* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
		*
		* @return {YText}
		*/
		clone() {
			const text = new YText();
			text.applyDelta(this.toDelta());
			return text;
		}
		/**
		* Creates YTextEvent and calls observers.
		*
		* @param {Transaction} transaction
		* @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
		*/
		_callObserver(transaction, parentSubs) {
			super._callObserver(transaction, parentSubs);
			const event = new YTextEvent(this, transaction, parentSubs);
			callTypeObservers(this, transaction, event);
			if (!transaction.local && this._hasFormatting) transaction._needFormattingCleanup = true;
		}
		/**
		* Returns the unformatted string representation of this YText type.
		*
		* @public
		*/
		toString() {
			this.doc ?? warnPrematureAccess();
			let str = "";
			/**
			* @type {Item|null}
			*/
			let n = this._start;
			while (n !== null) {
				if (!n.deleted && n.countable && n.content.constructor === ContentString) str += n.content.str;
				n = n.right;
			}
			return str;
		}
		/**
		* Returns the unformatted string representation of this YText type.
		*
		* @return {string}
		* @public
		*/
		toJSON() {
			return this.toString();
		}
		/**
		* Apply a {@link Delta} on this shared YText type.
		*
		* @param {Array<any>} delta The changes to apply on this element.
		* @param {object}  opts
		* @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
		*
		*
		* @public
		*/
		applyDelta(delta, { sanitize = true } = {}) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				const currPos = new ItemTextListPosition(null, this._start, 0, /* @__PURE__ */ new Map());
				for (let i = 0; i < delta.length; i++) {
					const op = delta[i];
					if (op.insert !== void 0) {
						const ins = !sanitize && typeof op.insert === "string" && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === "\n" ? op.insert.slice(0, -1) : op.insert;
						if (typeof ins !== "string" || ins.length > 0) insertText(transaction, this, currPos, ins, op.attributes || {});
					} else if (op.retain !== void 0) formatText(transaction, this, currPos, op.retain, op.attributes || {});
					else if (op.delete !== void 0) deleteText(transaction, currPos, op.delete);
				}
			});
			else
 /** @type {Array<function>} */ this._pending.push(() => this.applyDelta(delta));
		}
		/**
		* Returns the Delta representation of this YText type.
		*
		* @param {Snapshot} [snapshot]
		* @param {Snapshot} [prevSnapshot]
		* @param {function('removed' | 'added', ID):any} [computeYChange]
		* @return {any} The Delta representation of this type.
		*
		* @public
		*/
		toDelta(snapshot, prevSnapshot, computeYChange) {
			this.doc ?? warnPrematureAccess();
			/**
			* @type{Array<any>}
			*/
			const ops = [];
			const currentAttributes = /* @__PURE__ */ new Map();
			const doc = this.doc;
			let str = "";
			let n = this._start;
			function packStr() {
				if (str.length > 0) {
					/**
					* @type {Object<string,any>}
					*/
					const attributes = {};
					let addAttributes = false;
					currentAttributes.forEach((value, key) => {
						addAttributes = true;
						attributes[key] = value;
					});
					/**
					* @type {Object<string,any>}
					*/
					const op = { insert: str };
					if (addAttributes) op.attributes = attributes;
					ops.push(op);
					str = "";
				}
			}
			const computeDelta = () => {
				while (n !== null) {
					if (isVisible(n, snapshot) || prevSnapshot !== void 0 && isVisible(n, prevSnapshot)) switch (n.content.constructor) {
						case ContentString: {
							const cur = currentAttributes.get("ychange");
							if (snapshot !== void 0 && !isVisible(n, snapshot)) {
								if (cur === void 0 || cur.user !== n.id.client || cur.type !== "removed") {
									packStr();
									currentAttributes.set("ychange", computeYChange ? computeYChange("removed", n.id) : { type: "removed" });
								}
							} else if (prevSnapshot !== void 0 && !isVisible(n, prevSnapshot)) {
								if (cur === void 0 || cur.user !== n.id.client || cur.type !== "added") {
									packStr();
									currentAttributes.set("ychange", computeYChange ? computeYChange("added", n.id) : { type: "added" });
								}
							} else if (cur !== void 0) {
								packStr();
								currentAttributes.delete("ychange");
							}
							str += n.content.str;
							break;
						}
						case ContentType:
						case ContentEmbed: {
							packStr();
							/**
							* @type {Object<string,any>}
							*/
							const op = { insert: n.content.getContent()[0] };
							if (currentAttributes.size > 0) {
								const attrs = {};
								op.attributes = attrs;
								currentAttributes.forEach((value, key) => {
									attrs[key] = value;
								});
							}
							ops.push(op);
							break;
						}
						case ContentFormat: if (isVisible(n, snapshot)) {
							packStr();
							updateCurrentAttributes(currentAttributes, n.content);
						}
					}
					n = n.right;
				}
				packStr();
			};
			if (snapshot || prevSnapshot) transact(doc, (transaction) => {
				if (snapshot) splitSnapshotAffectedStructs(transaction, snapshot);
				if (prevSnapshot) splitSnapshotAffectedStructs(transaction, prevSnapshot);
				computeDelta();
			}, "cleanup");
			else computeDelta();
			return ops;
		}
		/**
		* Insert text at a given index.
		*
		* @param {number} index The index at which to start inserting.
		* @param {String} text The text to insert at the specified position.
		* @param {TextAttributes} [attributes] Optionally define some formatting
		*                                    information to apply on the inserted
		*                                    Text.
		* @public
		*/
		insert(index, text, attributes) {
			if (text.length <= 0) return;
			const y = this.doc;
			if (y !== null) transact(y, (transaction) => {
				const pos = findPosition(transaction, this, index, !attributes);
				if (!attributes) {
					attributes = {};
					pos.currentAttributes.forEach((v, k) => {
						attributes[k] = v;
					});
				}
				insertText(transaction, this, pos, text, attributes);
			});
			else
 /** @type {Array<function>} */ this._pending.push(() => this.insert(index, text, attributes));
		}
		/**
		* Inserts an embed at a index.
		*
		* @param {number} index The index to insert the embed at.
		* @param {Object | AbstractType<any>} embed The Object that represents the embed.
		* @param {TextAttributes} [attributes] Attribute information to apply on the
		*                                    embed
		*
		* @public
		*/
		insertEmbed(index, embed, attributes) {
			const y = this.doc;
			if (y !== null) transact(y, (transaction) => {
				const pos = findPosition(transaction, this, index, !attributes);
				insertText(transaction, this, pos, embed, attributes || {});
			});
			else
 /** @type {Array<function>} */ this._pending.push(() => this.insertEmbed(index, embed, attributes || {}));
		}
		/**
		* Deletes text starting from an index.
		*
		* @param {number} index Index at which to start deleting.
		* @param {number} length The number of characters to remove. Defaults to 1.
		*
		* @public
		*/
		delete(index, length) {
			if (length === 0) return;
			const y = this.doc;
			if (y !== null) transact(y, (transaction) => {
				deleteText(transaction, findPosition(transaction, this, index, true), length);
			});
			else
 /** @type {Array<function>} */ this._pending.push(() => this.delete(index, length));
		}
		/**
		* Assigns properties to a range of text.
		*
		* @param {number} index The position where to start formatting.
		* @param {number} length The amount of characters to assign properties to.
		* @param {TextAttributes} attributes Attribute information to apply on the
		*                                    text.
		*
		* @public
		*/
		format(index, length, attributes) {
			if (length === 0) return;
			const y = this.doc;
			if (y !== null) transact(y, (transaction) => {
				const pos = findPosition(transaction, this, index, false);
				if (pos.right === null) return;
				formatText(transaction, this, pos, length, attributes);
			});
			else
 /** @type {Array<function>} */ this._pending.push(() => this.format(index, length, attributes));
		}
		/**
		* Removes an attribute.
		*
		* @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
		*
		* @param {String} attributeName The attribute name that is to be removed.
		*
		* @public
		*/
		removeAttribute(attributeName) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeMapDelete(transaction, this, attributeName);
			});
			else
 /** @type {Array<function>} */ this._pending.push(() => this.removeAttribute(attributeName));
		}
		/**
		* Sets or updates an attribute.
		*
		* @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
		*
		* @param {String} attributeName The attribute name that is to be set.
		* @param {any} attributeValue The attribute value that is to be set.
		*
		* @public
		*/
		setAttribute(attributeName, attributeValue) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeMapSet(transaction, this, attributeName, attributeValue);
			});
			else
 /** @type {Array<function>} */ this._pending.push(() => this.setAttribute(attributeName, attributeValue));
		}
		/**
		* Returns an attribute value that belongs to the attribute name.
		*
		* @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
		*
		* @param {String} attributeName The attribute name that identifies the
		*                               queried value.
		* @return {any} The queried attribute value.
		*
		* @public
		*/
		getAttribute(attributeName) {
			return typeMapGet(this, attributeName);
		}
		/**
		* Returns all attribute name/value pairs in a JSON Object.
		*
		* @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
		*
		* @return {Object<string, any>} A JSON Object that describes the attributes.
		*
		* @public
		*/
		getAttributes() {
			return typeMapGetAll(this);
		}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		*/
		_write(encoder) {
			encoder.writeTypeRef(YTextRefID);
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
	* @return {YText}
	*
	* @private
	* @function
	*/
	const readYText = (_decoder) => new YText();
	/**
	* @module YXml
	*/
	/**
	* Define the elements to which a set of CSS queries apply.
	* {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors|CSS_Selectors}
	*
	* @example
	*   query = '.classSelector'
	*   query = 'nodeSelector'
	*   query = '#idSelector'
	*
	* @typedef {string} CSS_Selector
	*/
	/**
	* Dom filter function.
	*
	* @callback domFilter
	* @param {string} nodeName The nodeName of the element
	* @param {Map} attributes The map of attributes.
	* @return {boolean} Whether to include the Dom node in the YXmlElement.
	*/
	/**
	* Represents a subset of the nodes of a YXmlElement / YXmlFragment and a
	* position within them.
	*
	* Can be created with {@link YXmlFragment#createTreeWalker}
	*
	* @public
	* @implements {Iterable<YXmlElement|YXmlText|YXmlElement|YXmlHook>}
	*/
	var YXmlTreeWalker = class {
		/**
		* @param {YXmlFragment | YXmlElement} root
		* @param {function(AbstractType<any>):boolean} [f]
		*/
		constructor(root, f = () => true) {
			this._filter = f;
			this._root = root;
			/**
			* @type {Item}
			*/
			this._currentNode = root._start;
			this._firstCall = true;
			root.doc ?? warnPrematureAccess();
		}
		[Symbol.iterator]() {
			return this;
		}
		/**
		* Get the next node.
		*
		* @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
		*
		* @public
		*/
		next() {
			/**
			* @type {Item|null}
			*/
			let n = this._currentNode;
			let type = n && n.content && n.content.type;
			if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) do {
				type = n.content.type;
				if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) n = type._start;
				else while (n !== null) {
					/**
					* @type {Item | null}
					*/
					const nxt = n.next;
					if (nxt !== null) {
						n = nxt;
						break;
					} else if (n.parent === this._root) n = null;
					else n = n.parent._item;
				}
			} while (n !== null && (n.deleted || !this._filter(
				/** @type {ContentType} */
				n.content.type
			)));
			this._firstCall = false;
			if (n === null) return {
				value: void 0,
				done: true
			};
			this._currentNode = n;
			return {
				value: /** @type {any} */ n.content.type,
				done: false
			};
		}
	};
	/**
	* Represents a list of {@link YXmlElement}.and {@link YXmlText} types.
	* A YxmlFragment is similar to a {@link YXmlElement}, but it does not have a
	* nodeName and it does not have attributes. Though it can be bound to a DOM
	* element - in this case the attributes and the nodeName are not shared.
	*
	* @public
	* @extends AbstractType<YXmlEvent>
	*/
	var YXmlFragment = class YXmlFragment extends AbstractType {
		constructor() {
			super();
			/**
			* @type {Array<any>|null}
			*/
			this._prelimContent = [];
		}
		/**
		* @type {YXmlElement|YXmlText|null}
		*/
		get firstChild() {
			const first = this._first;
			return first ? first.content.getContent()[0] : null;
		}
		/**
		* Integrate this type into the Yjs instance.
		*
		* * Save this struct in the os
		* * This type is sent to other client
		* * Observer functions are fired
		*
		* @param {Doc} y The Yjs instance
		* @param {Item} item
		*/
		_integrate(y, item) {
			super._integrate(y, item);
			this.insert(0, this._prelimContent);
			this._prelimContent = null;
		}
		_copy() {
			return new YXmlFragment();
		}
		/**
		* Makes a copy of this data type that can be included somewhere else.
		*
		* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
		*
		* @return {YXmlFragment}
		*/
		clone() {
			const el = new YXmlFragment();
			el.insert(0, this.toArray().map((item) => item instanceof AbstractType ? item.clone() : item));
			return el;
		}
		get length() {
			this.doc ?? warnPrematureAccess();
			return this._prelimContent === null ? this._length : this._prelimContent.length;
		}
		/**
		* Create a subtree of childNodes.
		*
		* @example
		* const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
		* for (let node in walker) {
		*   // `node` is a div node
		*   nop(node)
		* }
		*
		* @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
		*                          returns a Boolean indicating whether the child
		*                          is to be included in the subtree.
		* @return {YXmlTreeWalker} A subtree and a position within it.
		*
		* @public
		*/
		createTreeWalker(filter) {
			return new YXmlTreeWalker(this, filter);
		}
		/**
		* Returns the first YXmlElement that matches the query.
		* Similar to DOM's {@link querySelector}.
		*
		* Query support:
		*   - tagname
		* TODO:
		*   - id
		*   - attribute
		*
		* @param {CSS_Selector} query The query on the children.
		* @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
		*
		* @public
		*/
		querySelector(query) {
			query = query.toUpperCase();
			const next = new YXmlTreeWalker(this, (element) => element.nodeName && element.nodeName.toUpperCase() === query).next();
			if (next.done) return null;
			else return next.value;
		}
		/**
		* Returns all YXmlElements that match the query.
		* Similar to Dom's {@link querySelectorAll}.
		*
		* @todo Does not yet support all queries. Currently only query by tagName.
		*
		* @param {CSS_Selector} query The query on the children
		* @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
		*
		* @public
		*/
		querySelectorAll(query) {
			query = query.toUpperCase();
			return from(new YXmlTreeWalker(this, (element) => element.nodeName && element.nodeName.toUpperCase() === query));
		}
		/**
		* Creates YXmlEvent and calls observers.
		*
		* @param {Transaction} transaction
		* @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
		*/
		_callObserver(transaction, parentSubs) {
			callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
		}
		/**
		* Get the string representation of all the children of this YXmlFragment.
		*
		* @return {string} The string representation of all children.
		*/
		toString() {
			return typeListMap(this, (xml) => xml.toString()).join("");
		}
		/**
		* @return {string}
		*/
		toJSON() {
			return this.toString();
		}
		/**
		* Creates a Dom Element that mirrors this YXmlElement.
		*
		* @param {Document} [_document=document] The document object (you must define
		*                                        this when calling this method in
		*                                        nodejs)
		* @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
		*                                             are presented in the DOM
		* @param {any} [binding] You should not set this property. This is
		*                               used if DomBinding wants to create a
		*                               association to the created DOM type.
		* @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
		*
		* @public
		*/
		toDOM(_document = document, hooks = {}, binding) {
			const fragment = _document.createDocumentFragment();
			if (binding !== void 0) binding._createAssociation(fragment, this);
			typeListForEach(this, (xmlType) => {
				fragment.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
			});
			return fragment;
		}
		/**
		* Inserts new content at an index.
		*
		* @example
		*  // Insert character 'a' at position 0
		*  xml.insert(0, [new Y.XmlText('text')])
		*
		* @param {number} index The index to insert content at
		* @param {Array<YXmlElement|YXmlText>} content The array of content
		*/
		insert(index, content) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeListInsertGenerics(transaction, this, index, content);
			});
			else this._prelimContent.splice(index, 0, ...content);
		}
		/**
		* Inserts new content at an index.
		*
		* @example
		*  // Insert character 'a' at position 0
		*  xml.insert(0, [new Y.XmlText('text')])
		*
		* @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
		* @param {Array<YXmlElement|YXmlText>} content The array of content
		*/
		insertAfter(ref, content) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				const refItem = ref && ref instanceof AbstractType ? ref._item : ref;
				typeListInsertGenericsAfter(transaction, this, refItem, content);
			});
			else {
				const pc = this._prelimContent;
				const index = ref === null ? 0 : pc.findIndex((el) => el === ref) + 1;
				if (index === 0 && ref !== null) throw create$5("Reference item not found");
				pc.splice(index, 0, ...content);
			}
		}
		/**
		* Deletes elements starting from an index.
		*
		* @param {number} index Index at which to start deleting elements
		* @param {number} [length=1] The number of elements to remove. Defaults to 1.
		*/
		delete(index, length = 1) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeListDelete(transaction, this, index, length);
			});
			else this._prelimContent.splice(index, length);
		}
		/**
		* Transforms this YArray to a JavaScript Array.
		*
		* @return {Array<YXmlElement|YXmlText|YXmlHook>}
		*/
		toArray() {
			return typeListToArray(this);
		}
		/**
		* Appends content to this YArray.
		*
		* @param {Array<YXmlElement|YXmlText>} content Array of content to append.
		*/
		push(content) {
			this.insert(this.length, content);
		}
		/**
		* Prepends content to this YArray.
		*
		* @param {Array<YXmlElement|YXmlText>} content Array of content to prepend.
		*/
		unshift(content) {
			this.insert(0, content);
		}
		/**
		* Returns the i-th element from a YArray.
		*
		* @param {number} index The index of the element to return from the YArray
		* @return {YXmlElement|YXmlText}
		*/
		get(index) {
			return typeListGet(this, index);
		}
		/**
		* Returns a portion of this YXmlFragment into a JavaScript Array selected
		* from start to end (end not included).
		*
		* @param {number} [start]
		* @param {number} [end]
		* @return {Array<YXmlElement|YXmlText>}
		*/
		slice(start = 0, end = this.length) {
			return typeListSlice(this, start, end);
		}
		/**
		* Executes a provided function on once on every child element.
		*
		* @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
		*/
		forEach(f) {
			typeListForEach(this, f);
		}
		/**
		* Transform the properties of this type to binary and write it to an
		* BinaryEncoder.
		*
		* This is called when this Item is sent to a remote peer.
		*
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
		*/
		_write(encoder) {
			encoder.writeTypeRef(YXmlFragmentRefID);
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
	* @return {YXmlFragment}
	*
	* @private
	* @function
	*/
	const readYXmlFragment = (_decoder) => new YXmlFragment();
	/**
	* @typedef {Object|number|null|Array<any>|string|Uint8Array|AbstractType<any>} ValueTypes
	*/
	/**
	* An YXmlElement imitates the behavior of a
	* https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element
	*
	* * An YXmlElement has attributes (key value pairs)
	* * An YXmlElement has childElements that must inherit from YXmlElement
	*
	* @template {{ [key: string]: ValueTypes }} [KV={ [key: string]: string }]
	*/
	var YXmlElement = class YXmlElement extends YXmlFragment {
		constructor(nodeName = "UNDEFINED") {
			super();
			this.nodeName = nodeName;
			/**
			* @type {Map<string, any>|null}
			*/
			this._prelimAttrs = /* @__PURE__ */ new Map();
		}
		/**
		* @type {YXmlElement|YXmlText|null}
		*/
		get nextSibling() {
			const n = this._item ? this._item.next : null;
			return n ? n.content.type : null;
		}
		/**
		* @type {YXmlElement|YXmlText|null}
		*/
		get prevSibling() {
			const n = this._item ? this._item.prev : null;
			return n ? n.content.type : null;
		}
		/**
		* Integrate this type into the Yjs instance.
		*
		* * Save this struct in the os
		* * This type is sent to other client
		* * Observer functions are fired
		*
		* @param {Doc} y The Yjs instance
		* @param {Item} item
		*/
		_integrate(y, item) {
			super._integrate(y, item);
			this._prelimAttrs.forEach((value, key) => {
				this.setAttribute(key, value);
			});
			this._prelimAttrs = null;
		}
		/**
		* Creates an Item with the same effect as this Item (without position effect)
		*
		* @return {YXmlElement}
		*/
		_copy() {
			return new YXmlElement(this.nodeName);
		}
		/**
		* Makes a copy of this data type that can be included somewhere else.
		*
		* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
		*
		* @return {YXmlElement<KV>}
		*/
		clone() {
			/**
			* @type {YXmlElement<KV>}
			*/
			const el = new YXmlElement(this.nodeName);
			const attrs = this.getAttributes();
			forEach(attrs, (value, key) => {
				el.setAttribute(key, value);
			});
			el.insert(0, this.toArray().map((v) => v instanceof AbstractType ? v.clone() : v));
			return el;
		}
		/**
		* Returns the XML serialization of this YXmlElement.
		* The attributes are ordered by attribute-name, so you can easily use this
		* method to compare YXmlElements
		*
		* @return {string} The string representation of this type.
		*
		* @public
		*/
		toString() {
			const attrs = this.getAttributes();
			const stringBuilder = [];
			const keys = [];
			for (const key in attrs) keys.push(key);
			keys.sort();
			const keysLen = keys.length;
			for (let i = 0; i < keysLen; i++) {
				const key = keys[i];
				stringBuilder.push(key + "=\"" + attrs[key] + "\"");
			}
			const nodeName = this.nodeName.toLocaleLowerCase();
			return `<${nodeName}${stringBuilder.length > 0 ? " " + stringBuilder.join(" ") : ""}>${super.toString()}</${nodeName}>`;
		}
		/**
		* Removes an attribute from this YXmlElement.
		*
		* @param {string} attributeName The attribute name that is to be removed.
		*
		* @public
		*/
		removeAttribute(attributeName) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeMapDelete(transaction, this, attributeName);
			});
			else
 /** @type {Map<string,any>} */ this._prelimAttrs.delete(attributeName);
		}
		/**
		* Sets or updates an attribute.
		*
		* @template {keyof KV & string} KEY
		*
		* @param {KEY} attributeName The attribute name that is to be set.
		* @param {KV[KEY]} attributeValue The attribute value that is to be set.
		*
		* @public
		*/
		setAttribute(attributeName, attributeValue) {
			if (this.doc !== null) transact(this.doc, (transaction) => {
				typeMapSet(transaction, this, attributeName, attributeValue);
			});
			else
 /** @type {Map<string, any>} */ this._prelimAttrs.set(attributeName, attributeValue);
		}
		/**
		* Returns an attribute value that belongs to the attribute name.
		*
		* @template {keyof KV & string} KEY
		*
		* @param {KEY} attributeName The attribute name that identifies the
		*                               queried value.
		* @return {KV[KEY]|undefined} The queried attribute value.
		*
		* @public
		*/
		getAttribute(attributeName) {
			return typeMapGet(this, attributeName);
		}
		/**
		* Returns whether an attribute exists
		*
		* @param {string} attributeName The attribute name to check for existence.
		* @return {boolean} whether the attribute exists.
		*
		* @public
		*/
		hasAttribute(attributeName) {
			return typeMapHas(this, attributeName);
		}
		/**
		* Returns all attribute name/value pairs in a JSON Object.
		*
		* @param {Snapshot} [snapshot]
		* @return {{ [Key in Extract<keyof KV,string>]?: KV[Key]}} A JSON Object that describes the attributes.
		*
		* @public
		*/
		getAttributes(snapshot) {
			return snapshot ? typeMapGetAllSnapshot(this, snapshot) : typeMapGetAll(this);
		}
		/**
		* Creates a Dom Element that mirrors this YXmlElement.
		*
		* @param {Document} [_document=document] The document object (you must define
		*                                        this when calling this method in
		*                                        nodejs)
		* @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
		*                                             are presented in the DOM
		* @param {any} [binding] You should not set this property. This is
		*                               used if DomBinding wants to create a
		*                               association to the created DOM type.
		* @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
		*
		* @public
		*/
		toDOM(_document = document, hooks = {}, binding) {
			const dom = _document.createElement(this.nodeName);
			const attrs = this.getAttributes();
			for (const key in attrs) {
				const value = attrs[key];
				if (typeof value === "string") dom.setAttribute(key, value);
			}
			typeListForEach(this, (yxml) => {
				dom.appendChild(yxml.toDOM(_document, hooks, binding));
			});
			if (binding !== void 0) binding._createAssociation(dom, this);
			return dom;
		}
		/**
		* Transform the properties of this type to binary and write it to an
		* BinaryEncoder.
		*
		* This is called when this Item is sent to a remote peer.
		*
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
		*/
		_write(encoder) {
			encoder.writeTypeRef(YXmlElementRefID);
			encoder.writeKey(this.nodeName);
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {YXmlElement}
	*
	* @function
	*/
	const readYXmlElement = (decoder) => new YXmlElement(decoder.readKey());
	/**
	* @extends YEvent<YXmlElement|YXmlText|YXmlFragment>
	* An Event that describes changes on a YXml Element or Yxml Fragment
	*/
	var YXmlEvent = class extends YEvent {
		/**
		* @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
		* @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
		*                   child list changed.
		* @param {Transaction} transaction The transaction instance with which the
		*                                  change was created.
		*/
		constructor(target, subs, transaction) {
			super(target, transaction);
			/**
			* Whether the children changed.
			* @type {Boolean}
			* @private
			*/
			this.childListChanged = false;
			/**
			* Set of all changed attributes.
			* @type {Set<string>}
			*/
			this.attributesChanged = /* @__PURE__ */ new Set();
			subs.forEach((sub) => {
				if (sub === null) this.childListChanged = true;
				else this.attributesChanged.add(sub);
			});
		}
	};
	/**
	* You can manage binding to a custom type with YXmlHook.
	*
	* @extends {YMap<any>}
	*/
	var YXmlHook = class YXmlHook extends YMap {
		/**
		* @param {string} hookName nodeName of the Dom Node.
		*/
		constructor(hookName) {
			super();
			/**
			* @type {string}
			*/
			this.hookName = hookName;
		}
		/**
		* Creates an Item with the same effect as this Item (without position effect)
		*/
		_copy() {
			return new YXmlHook(this.hookName);
		}
		/**
		* Makes a copy of this data type that can be included somewhere else.
		*
		* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
		*
		* @return {YXmlHook}
		*/
		clone() {
			const el = new YXmlHook(this.hookName);
			this.forEach((value, key) => {
				el.set(key, value);
			});
			return el;
		}
		/**
		* Creates a Dom Element that mirrors this YXmlElement.
		*
		* @param {Document} [_document=document] The document object (you must define
		*                                        this when calling this method in
		*                                        nodejs)
		* @param {Object.<string, any>} [hooks] Optional property to customize how hooks
		*                                             are presented in the DOM
		* @param {any} [binding] You should not set this property. This is
		*                               used if DomBinding wants to create a
		*                               association to the created DOM type
		* @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
		*
		* @public
		*/
		toDOM(_document = document, hooks = {}, binding) {
			const hook = hooks[this.hookName];
			let dom;
			if (hook !== void 0) dom = hook.createDom(this);
			else dom = document.createElement(this.hookName);
			dom.setAttribute("data-yjs-hook", this.hookName);
			if (binding !== void 0) binding._createAssociation(dom, this);
			return dom;
		}
		/**
		* Transform the properties of this type to binary and write it to an
		* BinaryEncoder.
		*
		* This is called when this Item is sent to a remote peer.
		*
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
		*/
		_write(encoder) {
			encoder.writeTypeRef(YXmlHookRefID);
			encoder.writeKey(this.hookName);
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {YXmlHook}
	*
	* @private
	* @function
	*/
	const readYXmlHook = (decoder) => new YXmlHook(decoder.readKey());
	/**
	* Represents text in a Dom Element. In the future this type will also handle
	* simple formatting information like bold and italic.
	*/
	var YXmlText = class YXmlText extends YText {
		/**
		* @type {YXmlElement|YXmlText|null}
		*/
		get nextSibling() {
			const n = this._item ? this._item.next : null;
			return n ? n.content.type : null;
		}
		/**
		* @type {YXmlElement|YXmlText|null}
		*/
		get prevSibling() {
			const n = this._item ? this._item.prev : null;
			return n ? n.content.type : null;
		}
		_copy() {
			return new YXmlText();
		}
		/**
		* Makes a copy of this data type that can be included somewhere else.
		*
		* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
		*
		* @return {YXmlText}
		*/
		clone() {
			const text = new YXmlText();
			text.applyDelta(this.toDelta());
			return text;
		}
		/**
		* Creates a Dom Element that mirrors this YXmlText.
		*
		* @param {Document} [_document=document] The document object (you must define
		*                                        this when calling this method in
		*                                        nodejs)
		* @param {Object<string, any>} [hooks] Optional property to customize how hooks
		*                                             are presented in the DOM
		* @param {any} [binding] You should not set this property. This is
		*                               used if DomBinding wants to create a
		*                               association to the created DOM type.
		* @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
		*
		* @public
		*/
		toDOM(_document = document, hooks, binding) {
			const dom = _document.createTextNode(this.toString());
			if (binding !== void 0) binding._createAssociation(dom, this);
			return dom;
		}
		toString() {
			return this.toDelta().map((delta) => {
				const nestedNodes = [];
				for (const nodeName in delta.attributes) {
					const attrs = [];
					for (const key in delta.attributes[nodeName]) attrs.push({
						key,
						value: delta.attributes[nodeName][key]
					});
					attrs.sort((a, b) => a.key < b.key ? -1 : 1);
					nestedNodes.push({
						nodeName,
						attrs
					});
				}
				nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
				let str = "";
				for (let i = 0; i < nestedNodes.length; i++) {
					const node = nestedNodes[i];
					str += `<${node.nodeName}`;
					for (let j = 0; j < node.attrs.length; j++) {
						const attr = node.attrs[j];
						str += ` ${attr.key}="${attr.value}"`;
					}
					str += ">";
				}
				str += delta.insert;
				for (let i = nestedNodes.length - 1; i >= 0; i--) str += `</${nestedNodes[i].nodeName}>`;
				return str;
			}).join("");
		}
		/**
		* @return {string}
		*/
		toJSON() {
			return this.toString();
		}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		*/
		_write(encoder) {
			encoder.writeTypeRef(YXmlTextRefID);
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {YXmlText}
	*
	* @private
	* @function
	*/
	const readYXmlText = (decoder) => new YXmlText();
	var AbstractStruct = class {
		/**
		* @param {ID} id
		* @param {number} length
		*/
		constructor(id, length) {
			this.id = id;
			this.length = length;
		}
		/**
		* @type {boolean}
		*/
		get deleted() {
			throw methodUnimplemented();
		}
		/**
		* Merge this struct with the item to the right.
		* This method is already assuming that `this.id.clock + this.length === this.id.clock`.
		* Also this method does *not* remove right from StructStore!
		* @param {AbstractStruct} right
		* @return {boolean} whether this merged with right
		*/
		mergeWith(right) {
			return false;
		}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
		* @param {number} offset
		* @param {number} encodingRef
		*/
		write(encoder, offset, encodingRef) {
			throw methodUnimplemented();
		}
		/**
		* @param {Transaction} transaction
		* @param {number} offset
		*/
		integrate(transaction, offset) {
			throw methodUnimplemented();
		}
	};
	const structGCRefNumber = 0;
	/**
	* @private
	*/
	var GC = class extends AbstractStruct {
		get deleted() {
			return true;
		}
		delete() {}
		/**
		* @param {GC} right
		* @return {boolean}
		*/
		mergeWith(right) {
			if (this.constructor !== right.constructor) return false;
			this.length += right.length;
			return true;
		}
		/**
		* @param {Transaction} transaction
		* @param {number} offset
		*/
		integrate(transaction, offset) {
			if (offset > 0) {
				this.id.clock += offset;
				this.length -= offset;
			}
			addStruct(transaction.doc.store, this);
		}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			encoder.writeInfo(structGCRefNumber);
			encoder.writeLen(this.length - offset);
		}
		/**
		* @param {Transaction} transaction
		* @param {StructStore} store
		* @return {null | number}
		*/
		getMissing(transaction, store) {
			return null;
		}
	};
	var ContentBinary = class ContentBinary {
		/**
		* @param {Uint8Array} content
		*/
		constructor(content) {
			this.content = content;
		}
		/**
		* @return {number}
		*/
		getLength() {
			return 1;
		}
		/**
		* @return {Array<any>}
		*/
		getContent() {
			return [this.content];
		}
		/**
		* @return {boolean}
		*/
		isCountable() {
			return true;
		}
		/**
		* @return {ContentBinary}
		*/
		copy() {
			return new ContentBinary(this.content);
		}
		/**
		* @param {number} offset
		* @return {ContentBinary}
		*/
		splice(offset) {
			throw methodUnimplemented();
		}
		/**
		* @param {ContentBinary} right
		* @return {boolean}
		*/
		mergeWith(right) {
			return false;
		}
		/**
		* @param {Transaction} transaction
		* @param {Item} item
		*/
		integrate(transaction, item) {}
		/**
		* @param {Transaction} transaction
		*/
		delete(transaction) {}
		/**
		* @param {StructStore} store
		*/
		gc(store) {}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			encoder.writeBuf(this.content);
		}
		/**
		* @return {number}
		*/
		getRef() {
			return 3;
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2 } decoder
	* @return {ContentBinary}
	*/
	const readContentBinary = (decoder) => new ContentBinary(decoder.readBuf());
	var ContentDeleted = class ContentDeleted {
		/**
		* @param {number} len
		*/
		constructor(len) {
			this.len = len;
		}
		/**
		* @return {number}
		*/
		getLength() {
			return this.len;
		}
		/**
		* @return {Array<any>}
		*/
		getContent() {
			return [];
		}
		/**
		* @return {boolean}
		*/
		isCountable() {
			return false;
		}
		/**
		* @return {ContentDeleted}
		*/
		copy() {
			return new ContentDeleted(this.len);
		}
		/**
		* @param {number} offset
		* @return {ContentDeleted}
		*/
		splice(offset) {
			const right = new ContentDeleted(this.len - offset);
			this.len = offset;
			return right;
		}
		/**
		* @param {ContentDeleted} right
		* @return {boolean}
		*/
		mergeWith(right) {
			this.len += right.len;
			return true;
		}
		/**
		* @param {Transaction} transaction
		* @param {Item} item
		*/
		integrate(transaction, item) {
			addToDeleteSet(transaction.deleteSet, item.id.client, item.id.clock, this.len);
			item.markDeleted();
		}
		/**
		* @param {Transaction} transaction
		*/
		delete(transaction) {}
		/**
		* @param {StructStore} store
		*/
		gc(store) {}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			encoder.writeLen(this.len - offset);
		}
		/**
		* @return {number}
		*/
		getRef() {
			return 1;
		}
	};
	/**
	* @private
	*
	* @param {UpdateDecoderV1 | UpdateDecoderV2 } decoder
	* @return {ContentDeleted}
	*/
	const readContentDeleted = (decoder) => new ContentDeleted(decoder.readLen());
	/**
	* @param {string} guid
	* @param {Object<string, any>} opts
	*/
	const createDocFromOpts = (guid, opts) => new Doc({
		guid,
		...opts,
		shouldLoad: opts.shouldLoad || opts.autoLoad || false
	});
	/**
	* @private
	*/
	var ContentDoc = class ContentDoc {
		/**
		* @param {Doc} doc
		*/
		constructor(doc) {
			if (doc._item) console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid.");
			/**
			* @type {Doc}
			*/
			this.doc = doc;
			/**
			* @type {any}
			*/
			const opts = {};
			this.opts = opts;
			if (!doc.gc) opts.gc = false;
			if (doc.autoLoad) opts.autoLoad = true;
			if (doc.meta !== null) opts.meta = doc.meta;
		}
		/**
		* @return {number}
		*/
		getLength() {
			return 1;
		}
		/**
		* @return {Array<any>}
		*/
		getContent() {
			return [this.doc];
		}
		/**
		* @return {boolean}
		*/
		isCountable() {
			return true;
		}
		/**
		* @return {ContentDoc}
		*/
		copy() {
			return new ContentDoc(createDocFromOpts(this.doc.guid, this.opts));
		}
		/**
		* @param {number} offset
		* @return {ContentDoc}
		*/
		splice(offset) {
			throw methodUnimplemented();
		}
		/**
		* @param {ContentDoc} right
		* @return {boolean}
		*/
		mergeWith(right) {
			return false;
		}
		/**
		* @param {Transaction} transaction
		* @param {Item} item
		*/
		integrate(transaction, item) {
			this.doc._item = item;
			transaction.subdocsAdded.add(this.doc);
			if (this.doc.shouldLoad) transaction.subdocsLoaded.add(this.doc);
		}
		/**
		* @param {Transaction} transaction
		*/
		delete(transaction) {
			if (transaction.subdocsAdded.has(this.doc)) transaction.subdocsAdded.delete(this.doc);
			else transaction.subdocsRemoved.add(this.doc);
		}
		/**
		* @param {StructStore} store
		*/
		gc(store) {}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			encoder.writeString(this.doc.guid);
			encoder.writeAny(this.opts);
		}
		/**
		* @return {number}
		*/
		getRef() {
			return 9;
		}
	};
	/**
	* @private
	*
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {ContentDoc}
	*/
	const readContentDoc = (decoder) => new ContentDoc(createDocFromOpts(decoder.readString(), decoder.readAny()));
	/**
	* @private
	*/
	var ContentEmbed = class ContentEmbed {
		/**
		* @param {Object} embed
		*/
		constructor(embed) {
			this.embed = embed;
		}
		/**
		* @return {number}
		*/
		getLength() {
			return 1;
		}
		/**
		* @return {Array<any>}
		*/
		getContent() {
			return [this.embed];
		}
		/**
		* @return {boolean}
		*/
		isCountable() {
			return true;
		}
		/**
		* @return {ContentEmbed}
		*/
		copy() {
			return new ContentEmbed(this.embed);
		}
		/**
		* @param {number} offset
		* @return {ContentEmbed}
		*/
		splice(offset) {
			throw methodUnimplemented();
		}
		/**
		* @param {ContentEmbed} right
		* @return {boolean}
		*/
		mergeWith(right) {
			return false;
		}
		/**
		* @param {Transaction} transaction
		* @param {Item} item
		*/
		integrate(transaction, item) {}
		/**
		* @param {Transaction} transaction
		*/
		delete(transaction) {}
		/**
		* @param {StructStore} store
		*/
		gc(store) {}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			encoder.writeJSON(this.embed);
		}
		/**
		* @return {number}
		*/
		getRef() {
			return 5;
		}
	};
	/**
	* @private
	*
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {ContentEmbed}
	*/
	const readContentEmbed = (decoder) => new ContentEmbed(decoder.readJSON());
	/**
	* @private
	*/
	var ContentFormat = class ContentFormat {
		/**
		* @param {string} key
		* @param {Object} value
		*/
		constructor(key, value) {
			this.key = key;
			this.value = value;
		}
		/**
		* @return {number}
		*/
		getLength() {
			return 1;
		}
		/**
		* @return {Array<any>}
		*/
		getContent() {
			return [];
		}
		/**
		* @return {boolean}
		*/
		isCountable() {
			return false;
		}
		/**
		* @return {ContentFormat}
		*/
		copy() {
			return new ContentFormat(this.key, this.value);
		}
		/**
		* @param {number} _offset
		* @return {ContentFormat}
		*/
		splice(_offset) {
			throw methodUnimplemented();
		}
		/**
		* @param {ContentFormat} _right
		* @return {boolean}
		*/
		mergeWith(_right) {
			return false;
		}
		/**
		* @param {Transaction} _transaction
		* @param {Item} item
		*/
		integrate(_transaction, item) {
			const p = item.parent;
			p._searchMarker = null;
			p._hasFormatting = true;
		}
		/**
		* @param {Transaction} transaction
		*/
		delete(transaction) {}
		/**
		* @param {StructStore} store
		*/
		gc(store) {}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			encoder.writeKey(this.key);
			encoder.writeJSON(this.value);
		}
		/**
		* @return {number}
		*/
		getRef() {
			return 6;
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {ContentFormat}
	*/
	const readContentFormat = (decoder) => new ContentFormat(decoder.readKey(), decoder.readJSON());
	/**
	* @private
	*/
	var ContentJSON = class ContentJSON {
		/**
		* @param {Array<any>} arr
		*/
		constructor(arr) {
			/**
			* @type {Array<any>}
			*/
			this.arr = arr;
		}
		/**
		* @return {number}
		*/
		getLength() {
			return this.arr.length;
		}
		/**
		* @return {Array<any>}
		*/
		getContent() {
			return this.arr;
		}
		/**
		* @return {boolean}
		*/
		isCountable() {
			return true;
		}
		/**
		* @return {ContentJSON}
		*/
		copy() {
			return new ContentJSON(this.arr);
		}
		/**
		* @param {number} offset
		* @return {ContentJSON}
		*/
		splice(offset) {
			const right = new ContentJSON(this.arr.slice(offset));
			this.arr = this.arr.slice(0, offset);
			return right;
		}
		/**
		* @param {ContentJSON} right
		* @return {boolean}
		*/
		mergeWith(right) {
			this.arr = this.arr.concat(right.arr);
			return true;
		}
		/**
		* @param {Transaction} transaction
		* @param {Item} item
		*/
		integrate(transaction, item) {}
		/**
		* @param {Transaction} transaction
		*/
		delete(transaction) {}
		/**
		* @param {StructStore} store
		*/
		gc(store) {}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			const len = this.arr.length;
			encoder.writeLen(len - offset);
			for (let i = offset; i < len; i++) {
				const c = this.arr[i];
				encoder.writeString(c === void 0 ? "undefined" : JSON.stringify(c));
			}
		}
		/**
		* @return {number}
		*/
		getRef() {
			return 2;
		}
	};
	/**
	* @private
	*
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {ContentJSON}
	*/
	const readContentJSON = (decoder) => {
		const len = decoder.readLen();
		const cs = [];
		for (let i = 0; i < len; i++) {
			const c = decoder.readString();
			if (c === "undefined") cs.push(void 0);
			else cs.push(JSON.parse(c));
		}
		return new ContentJSON(cs);
	};
	const isDevMode = getVariable("node_env") === "development";
	var ContentAny = class ContentAny {
		/**
		* @param {Array<any>} arr
		*/
		constructor(arr) {
			/**
			* @type {Array<any>}
			*/
			this.arr = arr;
			isDevMode && deepFreeze(arr);
		}
		/**
		* @return {number}
		*/
		getLength() {
			return this.arr.length;
		}
		/**
		* @return {Array<any>}
		*/
		getContent() {
			return this.arr;
		}
		/**
		* @return {boolean}
		*/
		isCountable() {
			return true;
		}
		/**
		* @return {ContentAny}
		*/
		copy() {
			return new ContentAny(this.arr);
		}
		/**
		* @param {number} offset
		* @return {ContentAny}
		*/
		splice(offset) {
			const right = new ContentAny(this.arr.slice(offset));
			this.arr = this.arr.slice(0, offset);
			return right;
		}
		/**
		* @param {ContentAny} right
		* @return {boolean}
		*/
		mergeWith(right) {
			this.arr = this.arr.concat(right.arr);
			return true;
		}
		/**
		* @param {Transaction} transaction
		* @param {Item} item
		*/
		integrate(transaction, item) {}
		/**
		* @param {Transaction} transaction
		*/
		delete(transaction) {}
		/**
		* @param {StructStore} store
		*/
		gc(store) {}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			const len = this.arr.length;
			encoder.writeLen(len - offset);
			for (let i = offset; i < len; i++) {
				const c = this.arr[i];
				encoder.writeAny(c);
			}
		}
		/**
		* @return {number}
		*/
		getRef() {
			return 8;
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {ContentAny}
	*/
	const readContentAny = (decoder) => {
		const len = decoder.readLen();
		const cs = [];
		for (let i = 0; i < len; i++) cs.push(decoder.readAny());
		return new ContentAny(cs);
	};
	/**
	* @private
	*/
	var ContentString = class ContentString {
		/**
		* @param {string} str
		*/
		constructor(str) {
			/**
			* @type {string}
			*/
			this.str = str;
		}
		/**
		* @return {number}
		*/
		getLength() {
			return this.str.length;
		}
		/**
		* @return {Array<any>}
		*/
		getContent() {
			return this.str.split("");
		}
		/**
		* @return {boolean}
		*/
		isCountable() {
			return true;
		}
		/**
		* @return {ContentString}
		*/
		copy() {
			return new ContentString(this.str);
		}
		/**
		* @param {number} offset
		* @return {ContentString}
		*/
		splice(offset) {
			const right = new ContentString(this.str.slice(offset));
			this.str = this.str.slice(0, offset);
			const firstCharCode = this.str.charCodeAt(offset - 1);
			if (firstCharCode >= 55296 && firstCharCode <= 56319) {
				this.str = this.str.slice(0, offset - 1) + "�";
				right.str = "�" + right.str.slice(1);
			}
			return right;
		}
		/**
		* @param {ContentString} right
		* @return {boolean}
		*/
		mergeWith(right) {
			this.str += right.str;
			return true;
		}
		/**
		* @param {Transaction} transaction
		* @param {Item} item
		*/
		integrate(transaction, item) {}
		/**
		* @param {Transaction} transaction
		*/
		delete(transaction) {}
		/**
		* @param {StructStore} store
		*/
		gc(store) {}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
		}
		/**
		* @return {number}
		*/
		getRef() {
			return 4;
		}
	};
	/**
	* @private
	*
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {ContentString}
	*/
	const readContentString = (decoder) => new ContentString(decoder.readString());
	/**
	* @type {Array<function(UpdateDecoderV1 | UpdateDecoderV2):AbstractType<any>>}
	* @private
	*/
	const typeRefs = [
		readYArray,
		readYMap,
		readYText,
		readYXmlElement,
		readYXmlFragment,
		readYXmlHook,
		readYXmlText
	];
	const YArrayRefID = 0;
	const YMapRefID = 1;
	const YTextRefID = 2;
	const YXmlElementRefID = 3;
	const YXmlFragmentRefID = 4;
	const YXmlHookRefID = 5;
	const YXmlTextRefID = 6;
	/**
	* @private
	*/
	var ContentType = class ContentType {
		/**
		* @param {AbstractType<any>} type
		*/
		constructor(type) {
			/**
			* @type {AbstractType<any>}
			*/
			this.type = type;
		}
		/**
		* @return {number}
		*/
		getLength() {
			return 1;
		}
		/**
		* @return {Array<any>}
		*/
		getContent() {
			return [this.type];
		}
		/**
		* @return {boolean}
		*/
		isCountable() {
			return true;
		}
		/**
		* @return {ContentType}
		*/
		copy() {
			return new ContentType(this.type._copy());
		}
		/**
		* @param {number} offset
		* @return {ContentType}
		*/
		splice(offset) {
			throw methodUnimplemented();
		}
		/**
		* @param {ContentType} right
		* @return {boolean}
		*/
		mergeWith(right) {
			return false;
		}
		/**
		* @param {Transaction} transaction
		* @param {Item} item
		*/
		integrate(transaction, item) {
			this.type._integrate(transaction.doc, item);
		}
		/**
		* @param {Transaction} transaction
		*/
		delete(transaction) {
			let item = this.type._start;
			while (item !== null) {
				if (!item.deleted) item.delete(transaction);
				else if (item.id.clock < (transaction.beforeState.get(item.id.client) || 0)) transaction._mergeStructs.push(item);
				item = item.right;
			}
			this.type._map.forEach((item) => {
				if (!item.deleted) item.delete(transaction);
				else if (item.id.clock < (transaction.beforeState.get(item.id.client) || 0)) transaction._mergeStructs.push(item);
			});
			transaction.changed.delete(this.type);
		}
		/**
		* @param {StructStore} store
		*/
		gc(store) {
			let item = this.type._start;
			while (item !== null) {
				item.gc(store, true);
				item = item.right;
			}
			this.type._start = null;
			this.type._map.forEach(
				/** @param {Item | null} item */
				(item) => {
					while (item !== null) {
						item.gc(store, true);
						item = item.left;
					}
				}
			);
			this.type._map = /* @__PURE__ */ new Map();
		}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			this.type._write(encoder);
		}
		/**
		* @return {number}
		*/
		getRef() {
			return 7;
		}
	};
	/**
	* @private
	*
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @return {ContentType}
	*/
	const readContentType = (decoder) => new ContentType(typeRefs[decoder.readTypeRef()](decoder));
	/**
	* @todo This should return several items
	*
	* @param {StructStore} store
	* @param {ID} id
	* @return {{item:Item, diff:number}}
	*/
	const followRedone = (store, id) => {
		/**
		* @type {ID|null}
		*/
		let nextID = id;
		let diff = 0;
		let item;
		do {
			if (diff > 0) nextID = createID(nextID.client, nextID.clock + diff);
			item = getItem(store, nextID);
			diff = nextID.clock - item.id.clock;
			nextID = item.redone;
		} while (nextID !== null && item instanceof Item);
		return {
			item,
			diff
		};
	};
	/**
	* Make sure that neither item nor any of its parents is ever deleted.
	*
	* This property does not persist when storing it into a database or when
	* sending it to other peers
	*
	* @param {Item|null} item
	* @param {boolean} keep
	*/
	const keepItem = (item, keep) => {
		while (item !== null && item.keep !== keep) {
			item.keep = keep;
			item = item.parent._item;
		}
	};
	/**
	* Split leftItem into two items
	* @param {Transaction} transaction
	* @param {Item} leftItem
	* @param {number} diff
	* @return {Item}
	*
	* @function
	* @private
	*/
	const splitItem = (transaction, leftItem, diff) => {
		const { client, clock } = leftItem.id;
		const rightItem = new Item(createID(client, clock + diff), leftItem, createID(client, clock + diff - 1), leftItem.right, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
		if (leftItem.deleted) rightItem.markDeleted();
		if (leftItem.keep) rightItem.keep = true;
		if (leftItem.redone !== null) rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
		leftItem.right = rightItem;
		if (rightItem.right !== null) rightItem.right.left = rightItem;
		transaction._mergeStructs.push(rightItem);
		if (rightItem.parentSub !== null && rightItem.right === null)
 /** @type {AbstractType<any>} */ rightItem.parent._map.set(rightItem.parentSub, rightItem);
		leftItem.length = diff;
		return rightItem;
	};
	/**
	* @param {Array<StackItem>} stack
	* @param {ID} id
	*/
	const isDeletedByUndoStack = (stack, id) => some(
		stack,
		/** @param {StackItem} s */
		(s) => isDeleted(s.deletions, id)
	);
	/**
	* Redoes the effect of this operation.
	*
	* @param {Transaction} transaction The Yjs instance.
	* @param {Item} item
	* @param {Set<Item>} redoitems
	* @param {DeleteSet} itemsToDelete
	* @param {boolean} ignoreRemoteMapChanges
	* @param {import('../utils/UndoManager.js').UndoManager} um
	*
	* @return {Item|null}
	*
	* @private
	*/
	const redoItem = (transaction, item, redoitems, itemsToDelete, ignoreRemoteMapChanges, um) => {
		const doc = transaction.doc;
		const store = doc.store;
		const ownClientID = doc.clientID;
		const redone = item.redone;
		if (redone !== null) return getItemCleanStart(transaction, redone);
		let parentItem = item.parent._item;
		/**
		* @type {Item|null}
		*/
		let left = null;
		/**
		* @type {Item|null}
		*/
		let right;
		if (parentItem !== null && parentItem.deleted === true) {
			if (parentItem.redone === null && (!redoitems.has(parentItem) || redoItem(transaction, parentItem, redoitems, itemsToDelete, ignoreRemoteMapChanges, um) === null)) return null;
			while (parentItem.redone !== null) parentItem = getItemCleanStart(transaction, parentItem.redone);
		}
		const parentType = parentItem === null ? item.parent : /** @type {ContentType} */ parentItem.content.type;
		if (item.parentSub === null) {
			left = item.left;
			right = item;
			while (left !== null) {
				/**
				* @type {Item|null}
				*/
				let leftTrace = left;
				while (leftTrace !== null && leftTrace.parent._item !== parentItem) leftTrace = leftTrace.redone === null ? null : getItemCleanStart(transaction, leftTrace.redone);
				if (leftTrace !== null && leftTrace.parent._item === parentItem) {
					left = leftTrace;
					break;
				}
				left = left.left;
			}
			while (right !== null) {
				/**
				* @type {Item|null}
				*/
				let rightTrace = right;
				while (rightTrace !== null && rightTrace.parent._item !== parentItem) rightTrace = rightTrace.redone === null ? null : getItemCleanStart(transaction, rightTrace.redone);
				if (rightTrace !== null && rightTrace.parent._item === parentItem) {
					right = rightTrace;
					break;
				}
				right = right.right;
			}
		} else {
			right = null;
			if (item.right && !ignoreRemoteMapChanges) {
				left = item;
				while (left !== null && left.right !== null && (left.right.redone || isDeleted(itemsToDelete, left.right.id) || isDeletedByUndoStack(um.undoStack, left.right.id) || isDeletedByUndoStack(um.redoStack, left.right.id))) {
					left = left.right;
					while (left.redone) left = getItemCleanStart(transaction, left.redone);
				}
				if (left && left.right !== null) return null;
			} else left = parentType._map.get(item.parentSub) || null;
		}
		const nextClock = getState(store, ownClientID);
		const nextId = createID(ownClientID, nextClock);
		const redoneItem = new Item(nextId, left, left && left.lastId, right, right && right.id, parentType, item.parentSub, item.content.copy());
		item.redone = nextId;
		keepItem(redoneItem, true);
		redoneItem.integrate(transaction, 0);
		return redoneItem;
	};
	/**
	* Abstract class that represents any content.
	*/
	var Item = class Item extends AbstractStruct {
		/**
		* @param {ID} id
		* @param {Item | null} left
		* @param {ID | null} origin
		* @param {Item | null} right
		* @param {ID | null} rightOrigin
		* @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
		* @param {string | null} parentSub
		* @param {AbstractContent} content
		*/
		constructor(id, left, origin, right, rightOrigin, parent, parentSub, content) {
			super(id, content.getLength());
			/**
			* The item that was originally to the left of this item.
			* @type {ID | null}
			*/
			this.origin = origin;
			/**
			* The item that is currently to the left of this item.
			* @type {Item | null}
			*/
			this.left = left;
			/**
			* The item that is currently to the right of this item.
			* @type {Item | null}
			*/
			this.right = right;
			/**
			* The item that was originally to the right of this item.
			* @type {ID | null}
			*/
			this.rightOrigin = rightOrigin;
			/**
			* @type {AbstractType<any>|ID|null}
			*/
			this.parent = parent;
			/**
			* If the parent refers to this item with some kind of key (e.g. YMap, the
			* key is specified here. The key is then used to refer to the list in which
			* to insert this item. If `parentSub = null` type._start is the list in
			* which to insert to. Otherwise it is `parent._map`.
			* @type {String | null}
			*/
			this.parentSub = parentSub;
			/**
			* If this type's effect is redone this type refers to the type that undid
			* this operation.
			* @type {ID | null}
			*/
			this.redone = null;
			/**
			* @type {AbstractContent}
			*/
			this.content = content;
			/**
			* bit1: keep
			* bit2: countable
			* bit3: deleted
			* bit4: mark - mark node as fast-search-marker
			* @type {number} byte
			*/
			this.info = this.content.isCountable() ? 2 : 0;
		}
		/**
		* This is used to mark the item as an indexed fast-search marker
		*
		* @type {boolean}
		*/
		set marker(isMarked) {
			if ((this.info & 8) > 0 !== isMarked) this.info ^= 8;
		}
		get marker() {
			return (this.info & 8) > 0;
		}
		/**
		* If true, do not garbage collect this Item.
		*/
		get keep() {
			return (this.info & 1) > 0;
		}
		set keep(doKeep) {
			if (this.keep !== doKeep) this.info ^= 1;
		}
		get countable() {
			return (this.info & 2) > 0;
		}
		/**
		* Whether this item was deleted or not.
		* @type {Boolean}
		*/
		get deleted() {
			return (this.info & 4) > 0;
		}
		set deleted(doDelete) {
			if (this.deleted !== doDelete) this.info ^= 4;
		}
		markDeleted() {
			this.info |= 4;
		}
		/**
		* Return the creator clientID of the missing op or define missing items and return null.
		*
		* @param {Transaction} transaction
		* @param {StructStore} store
		* @return {null | number}
		*/
		getMissing(transaction, store) {
			if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= getState(store, this.origin.client)) return this.origin.client;
			if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= getState(store, this.rightOrigin.client)) return this.rightOrigin.client;
			if (this.parent && this.parent.constructor === ID && this.id.client !== this.parent.client && this.parent.clock >= getState(store, this.parent.client)) return this.parent.client;
			if (this.origin) {
				this.left = getItemCleanEnd(transaction, store, this.origin);
				this.origin = this.left.lastId;
			}
			if (this.rightOrigin) {
				this.right = getItemCleanStart(transaction, this.rightOrigin);
				this.rightOrigin = this.right.id;
			}
			if (this.left && this.left.constructor === GC || this.right && this.right.constructor === GC) this.parent = null;
			else if (!this.parent) {
				if (this.left && this.left.constructor === Item) {
					this.parent = this.left.parent;
					this.parentSub = this.left.parentSub;
				} else if (this.right && this.right.constructor === Item) {
					this.parent = this.right.parent;
					this.parentSub = this.right.parentSub;
				}
			} else if (this.parent.constructor === ID) {
				const parentItem = getItem(store, this.parent);
				if (parentItem.constructor === GC) this.parent = null;
				else this.parent = parentItem.content.type;
			}
			return null;
		}
		/**
		* @param {Transaction} transaction
		* @param {number} offset
		*/
		integrate(transaction, offset) {
			if (offset > 0) {
				this.id.clock += offset;
				this.left = getItemCleanEnd(transaction, transaction.doc.store, createID(this.id.client, this.id.clock - 1));
				this.origin = this.left.lastId;
				this.content = this.content.splice(offset);
				this.length -= offset;
			}
			if (this.parent) {
				if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
					/**
					* @type {Item|null}
					*/
					let left = this.left;
					/**
					* @type {Item|null}
					*/
					let o;
					if (left !== null) o = left.right;
					else if (this.parentSub !== null) {
						o = this.parent._map.get(this.parentSub) || null;
						while (o !== null && o.left !== null) o = o.left;
					} else o = this.parent._start;
					/**
					* @type {Set<Item>}
					*/
					const conflictingItems = /* @__PURE__ */ new Set();
					/**
					* @type {Set<Item>}
					*/
					const itemsBeforeOrigin = /* @__PURE__ */ new Set();
					while (o !== null && o !== this.right) {
						itemsBeforeOrigin.add(o);
						conflictingItems.add(o);
						if (compareIDs(this.origin, o.origin)) {
							if (o.id.client < this.id.client) {
								left = o;
								conflictingItems.clear();
							} else if (compareIDs(this.rightOrigin, o.rightOrigin)) break;
						} else if (o.origin !== null && itemsBeforeOrigin.has(getItem(transaction.doc.store, o.origin))) {
							if (!conflictingItems.has(getItem(transaction.doc.store, o.origin))) {
								left = o;
								conflictingItems.clear();
							}
						} else break;
						o = o.right;
					}
					this.left = left;
				}
				if (this.left !== null) {
					const right = this.left.right;
					this.right = right;
					this.left.right = this;
				} else {
					let r;
					if (this.parentSub !== null) {
						r = this.parent._map.get(this.parentSub) || null;
						while (r !== null && r.left !== null) r = r.left;
					} else {
						r = this.parent._start;
						/** @type {AbstractType<any>} */ this.parent._start = this;
					}
					this.right = r;
				}
				if (this.right !== null) this.right.left = this;
				else if (this.parentSub !== null) {
					/** @type {AbstractType<any>} */ this.parent._map.set(this.parentSub, this);
					if (this.left !== null) this.left.delete(transaction);
				}
				if (this.parentSub === null && this.countable && !this.deleted)
 /** @type {AbstractType<any>} */ this.parent._length += this.length;
				addStruct(transaction.doc.store, this);
				this.content.integrate(transaction, this);
				addChangedTypeToTransaction(transaction, this.parent, this.parentSub);
				if (this.parent._item !== null && this.parent._item.deleted || this.parentSub !== null && this.right !== null) this.delete(transaction);
			} else new GC(this.id, this.length).integrate(transaction, 0);
		}
		/**
		* Returns the next non-deleted item
		*/
		get next() {
			let n = this.right;
			while (n !== null && n.deleted) n = n.right;
			return n;
		}
		/**
		* Returns the previous non-deleted item
		*/
		get prev() {
			let n = this.left;
			while (n !== null && n.deleted) n = n.left;
			return n;
		}
		/**
		* Computes the last content address of this Item.
		*/
		get lastId() {
			return this.length === 1 ? this.id : createID(this.id.client, this.id.clock + this.length - 1);
		}
		/**
		* Try to merge two items
		*
		* @param {Item} right
		* @return {boolean}
		*/
		mergeWith(right) {
			if (this.constructor === right.constructor && compareIDs(right.origin, this.lastId) && this.right === right && compareIDs(this.rightOrigin, right.rightOrigin) && this.id.client === right.id.client && this.id.clock + this.length === right.id.clock && this.deleted === right.deleted && this.redone === null && right.redone === null && this.content.constructor === right.content.constructor && this.content.mergeWith(right.content)) {
				const searchMarker = this.parent._searchMarker;
				if (searchMarker) searchMarker.forEach((marker) => {
					if (marker.p === right) {
						marker.p = this;
						if (!this.deleted && this.countable) marker.index -= this.length;
					}
				});
				if (right.keep) this.keep = true;
				this.right = right.right;
				if (this.right !== null) this.right.left = this;
				this.length += right.length;
				return true;
			}
			return false;
		}
		/**
		* Mark this Item as deleted.
		*
		* @param {Transaction} transaction
		*/
		delete(transaction) {
			if (!this.deleted) {
				const parent = this.parent;
				if (this.countable && this.parentSub === null) parent._length -= this.length;
				this.markDeleted();
				addToDeleteSet(transaction.deleteSet, this.id.client, this.id.clock, this.length);
				addChangedTypeToTransaction(transaction, parent, this.parentSub);
				this.content.delete(transaction);
			}
		}
		/**
		* @param {StructStore} store
		* @param {boolean} parentGCd
		*/
		gc(store, parentGCd) {
			if (!this.deleted) throw unexpectedCase();
			this.content.gc(store);
			if (parentGCd) replaceStruct(store, this, new GC(this.id, this.length));
			else this.content = new ContentDeleted(this.length);
		}
		/**
		* Transform the properties of this type to binary and write it to an
		* BinaryEncoder.
		*
		* This is called when this Item is sent to a remote peer.
		*
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
		* @param {number} offset
		*/
		write(encoder, offset) {
			const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
			const rightOrigin = this.rightOrigin;
			const parentSub = this.parentSub;
			const info = this.content.getRef() & 31 | (origin === null ? 0 : 128) | (rightOrigin === null ? 0 : 64) | (parentSub === null ? 0 : 32);
			encoder.writeInfo(info);
			if (origin !== null) encoder.writeLeftID(origin);
			if (rightOrigin !== null) encoder.writeRightID(rightOrigin);
			if (origin === null && rightOrigin === null) {
				const parent = this.parent;
				if (parent._item !== void 0) {
					const parentItem = parent._item;
					if (parentItem === null) {
						const ykey = findRootTypeKey(parent);
						encoder.writeParentInfo(true);
						encoder.writeString(ykey);
					} else {
						encoder.writeParentInfo(false);
						encoder.writeLeftID(parentItem.id);
					}
				} else if (parent.constructor === String) {
					encoder.writeParentInfo(true);
					encoder.writeString(parent);
				} else if (parent.constructor === ID) {
					encoder.writeParentInfo(false);
					encoder.writeLeftID(parent);
				} else unexpectedCase();
				if (parentSub !== null) encoder.writeString(parentSub);
			}
			this.content.write(encoder, offset);
		}
	};
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @param {number} info
	*/
	const readItemContent = (decoder, info) => contentRefs[info & 31](decoder);
	/**
	* A lookup map for reading Item content.
	*
	* @type {Array<function(UpdateDecoderV1 | UpdateDecoderV2):AbstractContent>}
	*/
	const contentRefs = [
		() => {
			unexpectedCase();
		},
		readContentDeleted,
		readContentJSON,
		readContentBinary,
		readContentString,
		readContentEmbed,
		readContentFormat,
		readContentType,
		readContentAny,
		readContentDoc,
		() => {
			unexpectedCase();
		}
	];
	const structSkipRefNumber = 10;
	/**
	* @private
	*/
	var Skip = class extends AbstractStruct {
		get deleted() {
			return true;
		}
		delete() {}
		/**
		* @param {Skip} right
		* @return {boolean}
		*/
		mergeWith(right) {
			if (this.constructor !== right.constructor) return false;
			this.length += right.length;
			return true;
		}
		/**
		* @param {Transaction} transaction
		* @param {number} offset
		*/
		integrate(transaction, offset) {
			unexpectedCase();
		}
		/**
		* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
		* @param {number} offset
		*/
		write(encoder, offset) {
			encoder.writeInfo(structSkipRefNumber);
			writeVarUint(encoder.restEncoder, this.length - offset);
		}
		/**
		* @param {Transaction} transaction
		* @param {StructStore} store
		* @return {null | number}
		*/
		getMissing(transaction, store) {
			return null;
		}
	};
	/** eslint-env browser */
	const glo = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
	const importIdentifier = "__ $YJS$ __";
	if (glo[importIdentifier] === true)
 /**
	* Dear reader of this message. Please take this seriously.
	*
	* If you see this message, make sure that you only import one version of Yjs. In many cases,
	* your package manager installs two versions of Yjs that are used by different packages within your project.
	* Another reason for this message is that some parts of your project use the commonjs version of Yjs
	* and others use the EcmaScript version of Yjs.
	*
	* This often leads to issues that are hard to debug. We often need to perform constructor checks,
	* e.g. `struct instanceof GC`. If you imported different versions of Yjs, it is impossible for us to
	* do the constructor checks anymore - which might break the CRDT algorithm.
	*
	* https://github.com/yjs/yjs/issues/438
	*/
	console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
	glo[importIdentifier] = true;

// node_modules/.store/y-protocols@1.0.7-LCrc4ked9I2BIv1vBZfNXw/node_modules/y-protocols/awareness.js
	const outdatedTimeout = 3e4;
	/**
	* @typedef {Object} MetaClientState
	* @property {number} MetaClientState.clock
	* @property {number} MetaClientState.lastUpdated unix timestamp
	*/
	/**
	* The Awareness class implements a simple shared state protocol that can be used for non-persistent data like awareness information
	* (cursor, username, status, ..). Each client can update its own local state and listen to state changes of
	* remote clients. Every client may set a state of a remote peer to `null` to mark the client as offline.
	*
	* Each client is identified by a unique client id (something we borrow from `doc.clientID`). A client can override
	* its own state by propagating a message with an increasing timestamp (`clock`). If such a message is received, it is
	* applied if the known state of that client is older than the new state (`clock < newClock`). If a client thinks that
	* a remote client is offline, it may propagate a message with
	* `{ clock: currentClientClock, state: null, client: remoteClient }`. If such a
	* message is received, and the known clock of that client equals the received clock, it will override the state with `null`.
	*
	* Before a client disconnects, it should propagate a `null` state with an updated clock.
	*
	* Awareness states must be updated every 30 seconds. Otherwise the Awareness instance will delete the client state.
	*
	* @extends {Observable<string>}
	*/
	var Awareness = class extends Observable {
		/**
		* @param {Y.Doc} doc
		*/
		constructor(doc) {
			super();
			this.doc = doc;
			/**
			* @type {number}
			*/
			this.clientID = doc.clientID;
			/**
			* Maps from client id to client state
			* @type {Map<number, Object<string, any>>}
			*/
			this.states = /* @__PURE__ */ new Map();
			/**
			* @type {Map<number, MetaClientState>}
			*/
			this.meta = /* @__PURE__ */ new Map();
			this._checkInterval = setInterval(() => {
				const now = getUnixTime();
				if (this.getLocalState() !== null && 3e4 / 2 <= now - this.meta.get(this.clientID).lastUpdated) this.setLocalState(this.getLocalState());
				/**
				* @type {Array<number>}
				*/
				const remove = [];
				this.meta.forEach((meta, clientid) => {
					if (clientid !== this.clientID && 3e4 <= now - meta.lastUpdated && this.states.has(clientid)) remove.push(clientid);
				});
				if (remove.length > 0) removeAwarenessStates(this, remove, "timeout");
			}, floor(outdatedTimeout / 10));
			doc.on("destroy", () => {
				this.destroy();
			});
			this.setLocalState({});
		}
		destroy() {
			this.emit("destroy", [this]);
			this.setLocalState(null);
			super.destroy();
			clearInterval(this._checkInterval);
		}
		/**
		* @return {Object<string,any>|null}
		*/
		getLocalState() {
			return this.states.get(this.clientID) || null;
		}
		/**
		* @param {Object<string,any>|null} state
		*/
		setLocalState(state) {
			const clientID = this.clientID;
			const currLocalMeta = this.meta.get(clientID);
			const clock = currLocalMeta === void 0 ? 0 : currLocalMeta.clock + 1;
			const prevState = this.states.get(clientID);
			if (state === null) this.states.delete(clientID);
			else this.states.set(clientID, state);
			this.meta.set(clientID, {
				clock,
				lastUpdated: getUnixTime()
			});
			const added = [];
			const updated = [];
			const filteredUpdated = [];
			const removed = [];
			if (state === null) removed.push(clientID);
			else if (prevState == null) {
				if (state != null) added.push(clientID);
			} else {
				updated.push(clientID);
				if (!equalityDeep(prevState, state)) filteredUpdated.push(clientID);
			}
			if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) this.emit("change", [{
				added,
				updated: filteredUpdated,
				removed
			}, "local"]);
			this.emit("update", [{
				added,
				updated,
				removed
			}, "local"]);
		}
		/**
		* @param {string} field
		* @param {any} value
		*/
		setLocalStateField(field, value) {
			const state = this.getLocalState();
			if (state !== null) this.setLocalState({
				...state,
				[field]: value
			});
		}
		/**
		* @return {Map<number,Object<string,any>>}
		*/
		getStates() {
			return this.states;
		}
	};
	/**
	* Mark (remote) clients as inactive and remove them from the list of active peers.
	* This change will be propagated to remote clients.
	*
	* @param {Awareness} awareness
	* @param {Array<number>} clients
	* @param {any} origin
	*/
	const removeAwarenessStates = (awareness, clients, origin) => {
		const removed = [];
		for (let i = 0; i < clients.length; i++) {
			const clientID = clients[i];
			if (awareness.states.has(clientID)) {
				awareness.states.delete(clientID);
				if (clientID === awareness.clientID) {
					const curMeta = awareness.meta.get(clientID);
					awareness.meta.set(clientID, {
						clock: curMeta.clock + 1,
						lastUpdated: getUnixTime()
					});
				}
				removed.push(clientID);
			}
		}
		if (removed.length > 0) {
			awareness.emit("change", [{
				added: [],
				updated: [],
				removed
			}, origin]);
			awareness.emit("update", [{
				added: [],
				updated: [],
				removed
			}, origin]);
		}
	};

// packages/sync/build-module/config.mjs
/**
	* CRDT documents can hold meta information in a map. This map exists only in
	* memory and is not synced or persisted. This key can be used to indicate that
	* a (temporary) document has been loaded from persistence.
	*/
	const CRDT_DOC_META_PERSISTENCE_KEY = "fromPersistence";
	/**
	* Root-level key for the map that holds the entity record data.
	*/
	const CRDT_RECORD_MAP_KEY = "document";
	/**
	* Root-level key for the map that holds the state information about the CRDT
	* document itself.
	*/
	const CRDT_STATE_MAP_KEY = "state";
	/**
	* Y.Map key representing the timestamp of the last user-facing entity save.
	*/
	const CRDT_STATE_MAP_SAVED_AT_KEY = "savedAt";
	/**
	* Y.Map key representing the Y.Doc client ID of the user who performed the
	* last user-facing entity save.
	*/
	const CRDT_STATE_MAP_SAVED_BY_KEY = "savedBy";
	/**
	* Y.Map key representing the version of the CRDT document schema.
	*/
	const CRDT_STATE_MAP_VERSION_KEY = "version";
	/**
	* Origin string for CRDT document changes originating from the local editor.
	*/
	const LOCAL_EDITOR_ORIGIN = "gutenberg";
	/**
	* Origin string for CRDT document changes originating from the sync manager.
	*/
	const LOCAL_SYNC_MANAGER_ORIGIN = "syncManager";
	/**
	* Origin string for CRDT document changes that should be synced but not
	* recorded in the undo history (e.g. status changes during publish).
	*
	* This origin is intentionally NOT included in the UndoManager's
	* `trackedOrigins`, so changes made with this origin will be applied to
	* the CRDT document (and synced to peers) without creating undo levels.
	*/
	const LOCAL_UNDO_IGNORED_ORIGIN = "gutenberg-undo-ignored";

// packages/sync/build-module/errors.mjs
	let ConnectionErrorCode = /* @__PURE__ */ function(ConnectionErrorCode) {
		ConnectionErrorCode["AUTHENTICATION_FAILED"] = "authentication-failed";
		ConnectionErrorCode["CONNECTION_EXPIRED"] = "connection-expired";
		ConnectionErrorCode["CONNECTION_LIMIT_EXCEEDED"] = "connection-limit-exceeded";
		ConnectionErrorCode["DOCUMENT_SIZE_LIMIT_EXCEEDED"] = "document-size-limit-exceeded";
		ConnectionErrorCode["PROTOCOL_MISMATCH"] = "protocol-mismatch";
		ConnectionErrorCode["UNKNOWN_ERROR"] = "unknown-error";
		return ConnectionErrorCode;
	}({});
	var ConnectionError = class extends Error {
		code;
		constructor(code = "unknown-error", message) {
			super(message);
			this.code = code;
			this.name = "ConnectionError";
		}
	};

// packages/sync/build-module/performance.mjs
/**
	* Wraps a function and logs the time it takes to execute.
	*
	* @param fn - The function to be wrapped.
	*/
	function logPerformanceTiming(fn) {
		return function(...args) {
			const start = performance.now();
			const result = fn.apply(this, args);
			const end = performance.now();
			console.log(`[SyncManager][performance]: ${fn.name} took ${(end - start).toFixed(2)} ms`);
			return result;
		};
	}
	/**
	* A pass-through function that invokes the provided function with its arguments
	* without moidyfing its type.
	*
	* @param fn - The function to be invoked.
	*/
	function passThru(fn) {
		return ((...args) => fn(...args));
	}

// node_modules/.store/y-protocols@1.0.7-LCrc4ked9I2BIv1vBZfNXw/node_modules/y-protocols/sync.js
/**
	* @module sync-protocol
	*/
	/**
	* @typedef {Map<number, number>} StateMap
	*/
	/**
	* Core Yjs defines two message types:
	* • YjsSyncStep1: Includes the State Set of the sending client. When received, the client should reply with YjsSyncStep2.
	* • YjsSyncStep2: Includes all missing structs and the complete delete set. When received, the client is assured that it
	*   received all information from the remote client.
	*
	* In a peer-to-peer network, you may want to introduce a SyncDone message type. Both parties should initiate the connection
	* with SyncStep1. When a client received SyncStep2, it should reply with SyncDone. When the local client received both
	* SyncStep2 and SyncDone, it is assured that it is synced to the remote client.
	*
	* In a client-server model, you want to handle this differently: The client should initiate the connection with SyncStep1.
	* When the server receives SyncStep1, it should reply with SyncStep2 immediately followed by SyncStep1. The client replies
	* with SyncStep2 when it receives SyncStep1. Optionally the server may send a SyncDone after it received SyncStep2, so the
	* client knows that the sync is finished.  There are two reasons for this more elaborated sync model: 1. This protocol can
	* easily be implemented on top of http and websockets. 2. The server should only reply to requests, and not initiate them.
	* Therefore it is necessary that the client initiates the sync.
	*
	* Construction of a message:
	* [messageType : varUint, message definition..]
	*
	* Note: A message does not include information about the room name. This must to be handled by the upper layer protocol!
	*
	* stringify[messageType] stringifies a message definition (messageType is already read from the bufffer)
	*/
	const messageYjsSyncStep1 = 0;
	const messageYjsSyncStep2 = 1;
	const messageYjsUpdate = 2;
	/**
	* Create a sync step 1 message based on the state of the current shared document.
	*
	* @param {encoding.Encoder} encoder
	* @param {Y.Doc} doc
	*/
	const writeSyncStep1 = (encoder, doc) => {
		writeVarUint(encoder, 0);
		const sv = encodeStateVector(doc);
		writeVarUint8Array(encoder, sv);
	};
	/**
	* @param {encoding.Encoder} encoder
	* @param {Y.Doc} doc
	* @param {Uint8Array} [encodedStateVector]
	*/
	const writeSyncStep2 = (encoder, doc, encodedStateVector) => {
		writeVarUint(encoder, 1);
		writeVarUint8Array(encoder, encodeStateAsUpdate(doc, encodedStateVector));
	};
	/**
	* Read SyncStep1 message and reply with SyncStep2.
	*
	* @param {decoding.Decoder} decoder The reply to the received message
	* @param {encoding.Encoder} encoder The received message
	* @param {Y.Doc} doc
	*/
	const readSyncStep1 = (decoder, encoder, doc) => writeSyncStep2(encoder, doc, readVarUint8Array(decoder));
	/**
	* Read and apply Structs and then DeleteStore to a y instance.
	*
	* @param {decoding.Decoder} decoder
	* @param {Y.Doc} doc
	* @param {any} transactionOrigin
	* @param {(error:Error)=>any} [errorHandler]
	*/
	const readSyncStep2 = (decoder, doc, transactionOrigin, errorHandler) => {
		try {
			applyUpdate(doc, readVarUint8Array(decoder), transactionOrigin);
		} catch (error) {
			if (errorHandler != null) errorHandler(error);
			console.error("Caught error while handling a Yjs update", error);
		}
	};
	/**
	* Read and apply Structs and then DeleteStore to a y instance.
	*
	* @param {decoding.Decoder} decoder
	* @param {Y.Doc} doc
	* @param {any} transactionOrigin
	* @param {(error:Error)=>any} [errorHandler]
	*/
	const readUpdate = readSyncStep2;
	/**
	* @param {decoding.Decoder} decoder A message received from another client
	* @param {encoding.Encoder} encoder The reply message. Does not need to be sent if empty.
	* @param {Y.Doc} doc
	* @param {any} transactionOrigin
	* @param {(error:Error)=>any} [errorHandler] Optional error handler that catches errors when reading Yjs messages.
	*/
	const readSyncMessage = (decoder, encoder, doc, transactionOrigin, errorHandler) => {
		const messageType = readVarUint(decoder);
		switch (messageType) {
			case 0:
				readSyncStep1(decoder, encoder, doc);
				break;
			case 1:
				readSyncStep2(decoder, doc, transactionOrigin, errorHandler);
				break;
			case 2:
				readUpdate(decoder, doc, transactionOrigin, errorHandler);
				break;
			default: throw new Error("Unknown message type");
		}
		return messageType;
	};

// packages/sync/build-module/providers/http-polling/config.mjs
	const ERROR_RETRY_DELAYS_SOLO_MS = [
		2e3,
		4e3,
		8e3,
		12e3
	];
	const ERROR_RETRY_DELAYS_WITH_COLLABORATORS_MS = [
		1e3,
		2e3,
		4e3,
		8e3
	];
	const DISCONNECT_DIALOG_RETRY_MS = 3e4;
	const MANUAL_RETRY_INTERVAL_MS = 15e3;
	const MAX_UPDATE_SIZE_IN_BYTES = Math.floor(262144) * 3;
	const MAX_SYNC_REQUEST_BODY_SIZE_IN_BYTES = 15728640;
	const MIN_SYNC_REQUEST_BODY_SIZE_LIMIT_IN_BYTES = 2097152;
	const DEFAULT_POLLING_INTERVAL_IN_MS = 4e3;
	const DEFAULT_POLLING_INTERVAL_WITH_COLLABORATORS_IN_MS = 1e3;
	function getFilteredPollingInterval(hookName, defaultInterval) {
		const filteredInterval = (0, _wordpress_hooks.applyFilters)(hookName, defaultInterval);
		if (typeof filteredInterval !== "number" || !Number.isFinite(filteredInterval) || filteredInterval <= 0) return defaultInterval;
		return Math.min(filteredInterval, defaultInterval);
	}
	const POLLING_INTERVAL_IN_MS = getFilteredPollingInterval("sync.pollingManager.pollingInterval", DEFAULT_POLLING_INTERVAL_IN_MS);
	const POLLING_INTERVAL_WITH_COLLABORATORS_IN_MS = getFilteredPollingInterval("sync.pollingManager.pollingIntervalWithCollaborators", DEFAULT_POLLING_INTERVAL_WITH_COLLABORATORS_IN_MS);
	const POLLING_INTERVAL_BACKGROUND_TAB_IN_MS = 25e3;

// packages/sync/build-module/providers/http-polling/types.mjs
/**
	* Update types for the sync protocol:
	* - sync_step1: State vector announcement
	* - sync_step2: Acknowledgment, missing updates response
	* - update: Regular document update (persisted until save)
	* - compaction: Merged updates using Y.mergeUpdates replacing all prior updates
	*/
	let SyncUpdateType = /* @__PURE__ */ function(SyncUpdateType) {
		SyncUpdateType["COMPACTION"] = "compaction";
		SyncUpdateType["SYNC_STEP_1"] = "sync_step1";
		SyncUpdateType["SYNC_STEP_2"] = "sync_step2";
		SyncUpdateType["UPDATE"] = "update";
		return SyncUpdateType;
	}({});

// packages/sync/build-module/providers/http-polling/utils.mjs
	const SYNC_API_PATH = "/wp-sync/v1/updates";
	function uint8ArrayToBase64(data) {
		let binary = "";
		const len = data.byteLength;
		for (let i = 0; i < len; i++) binary += String.fromCharCode(data[i]);
		return globalThis.btoa(binary);
	}
	function base64ToUint8Array(base64) {
		const binaryString = globalThis.atob(base64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
		return bytes;
	}
	function createSyncUpdate(data, type) {
		return {
			data: uint8ArrayToBase64(data),
			type
		};
	}
	function createUpdateQueue(initial = [], paused = true) {
		let isPaused = paused;
		const updates = [...initial];
		return {
			add(update) {
				updates.push(update);
			},
			addBulk(bulkUpdates) {
				if (0 === bulkUpdates.length) return;
				updates.push(...bulkUpdates);
			},
			clear() {
				updates.splice(0, updates.length);
			},
			get() {
				if (isPaused) return [];
				return updates.splice(0, updates.length);
			},
			pause() {
				isPaused = true;
			},
			peek() {
				if (isPaused) return [];
				return [...updates];
			},
			restore(restoredUpdates) {
				const filtered = restoredUpdates.filter((u) => u.type !== SyncUpdateType.COMPACTION);
				if (0 === filtered.length) return;
				updates.unshift(...filtered);
			},
			restoreExact(restoredUpdates) {
				if (0 === restoredUpdates.length) return;
				updates.unshift(...restoredUpdates);
			},
			resume() {
				isPaused = false;
			},
			size() {
				return updates.length;
			},
			take(count) {
				if (isPaused || count <= 0) return [];
				return updates.splice(0, count);
			}
		};
	}
	/**
	* Post a sync update and receive updates the client is missing.
	*
	* @param payload The sync payload including data and after cursor
	* @return The sync server response
	*/
	function postSyncUpdate(payload) {
		return (0, _wordpress_api_fetch.default)({
			method: "POST",
			path: SYNC_API_PATH,
			data: payload
		});
	}
	/**
	* Fire-and-forget variant of postSyncUpdate. Uses `keepalive` so the
	* request survives page unload, and errors are silently ignored.
	*
	* @param payload The sync payload to send.
	*/
	function postSyncUpdateNonBlocking(payload) {
		if (payload.rooms.length === 0) return;
		(0, _wordpress_api_fetch.default)({
			method: "POST",
			path: SYNC_API_PATH,
			data: payload,
			keepalive: true
		}).catch(() => {});
	}
	/**
	* Parse an integer from an unknown value, returning a default if parsing fails.
	*
	* @param value        The value to parse as an integer.
	* @param defaultValue The default value to return if parsing fails.
	* @return The parsed integer or the default value.
	*/
	function intValueOrDefault(value, defaultValue) {
		const intValue = parseInt(String(value), 10);
		return isNaN(intValue) ? defaultValue : intValue;
	}
	/**
	* Take `size` items from `items` starting at `offset`, wrapping around the
	* end of the list. Returns the selected window and the offset to use on the
	* next call (advanced by `size`).
	*
	* @param items  The list to rotate through.
	* @param offset The starting index. Values larger than `items.length` are
	*               wrapped (modulo).
	* @param size   The maximum number of items to include in the window. The
	*               window may be shorter if `size` exceeds `items.length`.
	*/
	function rotateWindow(items, offset, size) {
		if (items.length === 0) return {
			window: [],
			nextOffset: 0
		};
		const start = (offset % items.length + items.length) % items.length;
		return {
			window: [...items.slice(start), ...items.slice(0, start)].slice(0, Math.max(0, size)),
			nextOffset: (start + Math.max(0, size)) % items.length
		};
	}

// packages/sync/build-module/providers/http-polling/polling-manager.mjs
	const POLLING_MANAGER_ORIGIN = "polling-manager";
	/**
	* Check if an error is a forbidden (403) response from the WordPress REST
	* API. These errors have a `data.status` property set by WP_Error.
	*
	* @param error The caught error to inspect.
	*/
	function isForbiddenError(error) {
		return error?.data?.status === 403;
	}
	/**
	* Check if an error is the sync server's deterministic request-body-size
	* rejection. The server rejects this before the sync handler stores updates, so
	* the client can safely retry the exact same updates in smaller request bodies.
	*
	* @param error The caught error to inspect.
	*/
	function isRequestBodyTooLargeError(error) {
		return error?.data?.status === 413 && error?.code === "rest_sync_body_too_large";
	}
	/**
	* Check if an error is the sync server's protocol mismatch signal. This
	* indicates the client is running an outdated version of the code that is
	* incompatible with the server, and the user should refresh to recover.
	*
	* @param error The caught error to inspect.
	*/
	function isProtocolMismatchError(error) {
		return error?.code === "rest_sync_protocol_mismatch";
	}
	/**
	* Handle a 403 from the sync endpoint. Silently unregisters the affected
	* rooms listed in the error data, and restores pending updates for the
	* remaining rooms so they retry on the next poll cycle.
	*
	* If the error does not include room details, it is treated as a generic auth
	* failure and all rooms are unregistered.
	*
	* @param error          The forbidden error, narrowed via isForbiddenError.
	* @param requestedRooms The rooms that were in the failing request.
	*/
	function handleForbiddenError(error, requestedRooms) {
		const requestedRoomNames = new Set(requestedRooms.map((room) => room.room));
		const forbiddenRooms = Array.isArray(error.data.rooms) ? error.data.rooms.filter((room) => requestedRoomNames.has(room)) : [];
		if (forbiddenRooms.length > 0) {
			for (const room of forbiddenRooms) {
				const state = roomStates.get(room);
				if (state) {
					state.log("Permission denied, unregistering room", { error }, "error", true);
					unregisterRoom(room, { sendDisconnectSignal: false });
				}
			}
			for (const room of requestedRooms) {
				if (forbiddenRooms.includes(room.room)) continue;
				if (!roomStates.has(room.room)) continue;
				const remainingState = roomStates.get(room.room);
				if (room.updates.length > 0) remainingState.updateQueue.restore(room.updates);
			}
		} else {
			const rooms = [...roomStates.keys()];
			for (const room of rooms) {
				const state = roomStates.get(room);
				if (state) {
					state.log("Permission denied, unregistering room", { error }, "error", true);
					unregisterRoom(room, { sendDisconnectSignal: false });
				}
			}
		}
	}
	const roomStates = /* @__PURE__ */ new Map();
	/**
	* Create a compaction update by merging existing updates. This preserves
	* the original operation metadata (client IDs, logical clocks) so that
	* Yjs deduplication works correctly when the compaction is applied.
	*
	* Deprecated: The server is moving towards full state updates for compaction.
	*
	* @param updates The updates to merge
	*/
	function createDeprecatedCompactionUpdate(updates) {
		const mergeable = updates.filter((u) => [SyncUpdateType.COMPACTION, SyncUpdateType.UPDATE].includes(u.type)).map((u) => base64ToUint8Array(u.data));
		return createSyncUpdate(mergeUpdatesV2(mergeable), SyncUpdateType.COMPACTION);
	}
	/**
	* Create sync step 1 update (announce our state vector).
	*
	* @param doc The Yjs document
	*/
	function createSyncStep1Update(doc) {
		const encoder = createEncoder();
		writeSyncStep1(encoder, doc);
		return createSyncUpdate(toUint8Array(encoder), SyncUpdateType.SYNC_STEP_1);
	}
	/**
	* Create sync step 2 update (acknowledge sync step 1).
	*
	* @param doc   The Yjs document
	* @param step1 The sync step 1 update received
	*/
	function createSyncStep2Update(doc, step1) {
		const decoder = createDecoder(step1);
		const encoder = createEncoder();
		readSyncMessage(decoder, encoder, doc, POLLING_MANAGER_ORIGIN);
		return createSyncUpdate(toUint8Array(encoder), SyncUpdateType.SYNC_STEP_2);
	}
	/**
	* Process an incoming awareness update from the server.
	*
	* @param state     The awareness state received
	* @param awareness The local Awareness instance
	*/
	function processAwarenessUpdate(state, awareness) {
		const currentStates = awareness.getStates();
		const added = /* @__PURE__ */ new Set();
		const updated = /* @__PURE__ */ new Set();
		const removed = new Set(Array.from(currentStates.keys()).filter((clientId) => !state[clientId]));
		Object.entries(state).forEach(([clientIdString, awarenessState]) => {
			const clientId = Number(clientIdString);
			if (clientId === awareness.clientID) return;
			if (null === awarenessState) {
				currentStates.delete(clientId);
				removed.add(clientId);
				return;
			}
			if (!currentStates.has(clientId)) {
				currentStates.set(clientId, awarenessState);
				added.add(clientId);
				return;
			}
			const currentState = currentStates.get(clientId);
			if (JSON.stringify(currentState) !== JSON.stringify(awarenessState)) {
				currentStates.set(clientId, awarenessState);
				updated.add(clientId);
			}
		});
		if (added.size + updated.size > 0) awareness.emit("change", [{
			added: Array.from(added),
			updated: Array.from(updated),
			removed: []
		}]);
		if (removed.size > 0) removeAwarenessStates(awareness, Array.from(removed), POLLING_MANAGER_ORIGIN);
	}
	/**
	* Process an incoming sync / document update based on its type.
	*
	* @param update The typed update received
	* @param doc    The Yjs document
	* @return A response update if needed (e.g., sync_step2 in response to sync_step1)
	*/
	function processDocUpdate(update, doc) {
		const data = base64ToUint8Array(update.data);
		switch (update.type) {
			case SyncUpdateType.SYNC_STEP_1: return createSyncStep2Update(doc, data);
			case SyncUpdateType.SYNC_STEP_2: {
				const decoder = createDecoder(data);
				const encoder = createEncoder();
				readSyncMessage(decoder, encoder, doc, POLLING_MANAGER_ORIGIN);
				return;
			}
			case SyncUpdateType.COMPACTION:
			case SyncUpdateType.UPDATE: applyUpdateV2(doc, data, POLLING_MANAGER_ORIGIN);
		}
	}
	/**
	* Check whether the awareness state exceeds the configured connection limit.
	*
	* @param awareness The awareness state from the server response.
	* @param roomState The room state corresponding to the awareness state
	* @return True if a peer limit has been exceeded.
	*/
	function checkConnectionLimit(awareness, roomState) {
		if (!roomState.isPrimaryRoom || hasCheckedConnectionLimit) return false;
		hasCheckedConnectionLimit = true;
		const maxClientsPerRoom = (0, _wordpress_hooks.applyFilters)("sync.pollingProvider.maxClientsPerRoom", 3, roomState.room);
		const clientCount = Object.keys(awareness).length;
		const validatedLimit = intValueOrDefault(maxClientsPerRoom, 3);
		if (clientCount > validatedLimit) {
			roomState.log("Connection limit exceeded", {
				clientCount,
				maxClientsPerRoom: validatedLimit,
				room: roomState.room
			});
			return true;
		}
		return false;
	}
	let areListenersRegistered = false;
	let consecutiveFailures = 0;
	let hasCheckedConnectionLimit = false;
	let isManualRetry = false;
	let hasCollaborators = false;
	let isActiveBrowser = "visible" === document.visibilityState;
	let isPolling = false;
	let isUnloadPending = false;
	let pollInterval = POLLING_INTERVAL_IN_MS;
	let pollingTimeoutId = null;
	let syncRequestBodySizeLimit = MAX_SYNC_REQUEST_BODY_SIZE_IN_BYTES;
	let roomOverflowOffset = 0;
	/**
	* Mark that a page unload has been requested. This fires on
	* `beforeunload` which happens before the browser aborts in-flight
	* fetches, allowing us to distinguish poll failures caused by
	* navigation from genuine server errors in the catch block.
	*
	* If the user cancels the unload (e.g. by dismissing a "Save Changes?" dialog),
	* the flag is reset at the start of the next poll cycle so that polling can
	* resume.
	*/
	function handleBeforeUnload() {
		isUnloadPending = true;
	}
	/**
	* Send a disconnect signal for all registered rooms when the page is
	* being unloaded. Uses `sendBeacon` so the request survives navigation.
	*/
	function handlePageHide() {
		const rooms = Array.from(roomStates.entries()).map(([room, state]) => ({
			after: 0,
			awareness: null,
			client_id: state.clientId,
			room,
			updates: []
		}));
		for (let i = 0; i < rooms.length; i += 50) postSyncUpdateNonBlocking({ rooms: rooms.slice(i, i + 50) });
	}
	/**
	* Hangle change in visibility state of browser tab.
	*
	* Used to trigger a slow down of the collaboration syncs when the
	* browser tab becomes inactive (either the user switches tabs or the
	* screen saver comes on).
	*
	* Fires on the document's visibilitychange event.
	*/
	function handleVisibilityChange() {
		const wasActive = isActiveBrowser;
		isActiveBrowser = document.visibilityState === "visible";
		if (isActiveBrowser && !wasActive) {
			if (pollingTimeoutId) {
				clearTimeout(pollingTimeoutId);
				pollingTimeoutId = null;
				poll();
			}
		}
	}
	/**
	* Select which rooms to include in the next sync request.
	*
	* The server caps requests at MAX_ROOMS_PER_REQUEST rooms. When fewer rooms are
	* registered than the cap, every room is included on every poll. When the cap
	* is exceeded, the primary room is sent on every poll (so the main document
	* stays fully synced) and the remaining overflow rooms are rotated across
	* successive polls so each one is included (at a reduced frequency).
	*
	* Rooms that are skipped on a given poll keep their queued updates; the updates
	* are drained on the next poll that includes them.
	*
	* @return The RoomStates to include in this request, in send order.
	*/
	function selectRoomsForRequest() {
		const allRooms = Array.from(roomStates.values());
		if (allRooms.length <= 50) return allRooms;
		const primaryRoom = allRooms.find((state) => state.isPrimaryRoom);
		const overflowRooms = allRooms.filter((state) => state !== primaryRoom);
		const overflowSlotsPerRequest = 50 - (primaryRoom ? 1 : 0);
		const { window: overflowSlice, nextOffset } = rotateWindow(overflowRooms, roomOverflowOffset, overflowSlotsPerRequest);
		roomOverflowOffset = nextOffset;
		if (primaryRoom) return [primaryRoom, ...overflowSlice];
		return overflowSlice;
	}
	const textEncoder = new TextEncoder();
	function getJsonByteLength(value) {
		return textEncoder.encode(JSON.stringify(value)).byteLength;
	}
	function createPayloadRoom(state, updates = []) {
		return {
			after: state.endCursor ?? 0,
			awareness: state.localAwarenessState,
			client_id: state.clientId,
			room: state.room,
			updates
		};
	}
	function getUpdatePayloadSizeDelta(existingUpdateCount, update) {
		return (existingUpdateCount === 0 ? 0 : 1) + getJsonByteLength(update);
	}
	function buildPayloadForRequest(selectedRoomStates) {
		const payload = { rooms: [] };
		const roomsInRequest = [];
		for (const state of selectedRoomStates) {
			const room = createPayloadRoom(state);
			const candidate = { rooms: [...payload.rooms, room] };
			if (payload.rooms.length > 0 && getJsonByteLength(candidate) > syncRequestBodySizeLimit) break;
			payload.rooms.push(room);
			roomsInRequest.push(state);
		}
		const pendingUpdates = roomsInRequest.map((state) => state.updateQueue.peek());
		const sentUpdateCounts = roomsInRequest.map(() => 0);
		let payloadSize = getJsonByteLength(payload);
		let addedUpdate = true;
		while (addedUpdate) {
			addedUpdate = false;
			for (let i = 0; i < roomsInRequest.length; i++) {
				const update = pendingUpdates[i][sentUpdateCounts[i]];
				if (!update) continue;
				const sizeDelta = getUpdatePayloadSizeDelta(sentUpdateCounts[i], update);
				if (payloadSize + sizeDelta > syncRequestBodySizeLimit) continue;
				sentUpdateCounts[i]++;
				payloadSize += sizeDelta;
				addedUpdate = true;
			}
		}
		for (let i = 0; i < roomsInRequest.length; i++) payload.rooms[i].updates = roomsInRequest[i].updateQueue.take(sentUpdateCounts[i]);
		return {
			payload,
			roomsInRequest
		};
	}
	function restoreExactUpdates(payload) {
		for (const room of payload.rooms) {
			if (!roomStates.has(room.room) || room.updates.length === 0) continue;
			roomStates.get(room.room).updateQueue.restoreExact(room.updates);
		}
	}
	function poll() {
		isPolling = true;
		pollingTimeoutId = null;
		async function start() {
			if (0 === roomStates.size) {
				isPolling = false;
				return;
			}
			isUnloadPending = false;
			const { payload, roomsInRequest } = buildPayloadForRequest(selectRoomsForRequest());
			roomsInRequest.forEach((state) => {
				state.onStatusChange({ status: "connecting" });
			});
			try {
				const { rooms } = await postSyncUpdate(payload);
				consecutiveFailures = 0;
				isManualRetry = false;
				syncRequestBodySizeLimit = MAX_SYNC_REQUEST_BODY_SIZE_IN_BYTES;
				roomsInRequest.forEach((state) => {
					if (roomStates.get(state.room) !== state) return;
					state.onStatusChange({ status: "connected" });
				});
				hasCollaborators = false;
				rooms.forEach((room) => {
					if (!roomStates.has(room.room)) return;
					const roomState = roomStates.get(room.room);
					roomState.endCursor = room.end_cursor;
					if (checkConnectionLimit(room.awareness, roomState)) {
						roomState.onStatusChange({
							status: "disconnected",
							error: new ConnectionError(ConnectionErrorCode.CONNECTION_LIMIT_EXCEEDED, "Connection limit exceeded")
						});
						unregisterRoom(room.room);
						return;
					}
					roomState.processAwarenessUpdate(room.awareness);
					if (roomState.isPrimaryRoom && Object.keys(room.awareness).length > 1) {
						hasCollaborators = true;
						roomStates.forEach((state) => {
							state.updateQueue.resume();
						});
					}
					const responseUpdates = [];
					for (const update of room.updates) try {
						const response = roomState.processDocUpdate(update);
						if (response) responseUpdates.push(response);
					} catch (error) {
						roomState.log("Failed to apply sync update", {
							error,
							update
						}, "error", true);
					}
					roomState.updateQueue.addBulk(responseUpdates);
					if (room.should_compact) {
						roomState.log("Server requested compaction update");
						roomState.updateQueue.clear();
						roomState.updateQueue.add(roomState.createCompactionUpdate());
					} else if (room.compaction_request) {
						roomState.log("Server requested (old) compaction update");
						roomState.updateQueue.add(createDeprecatedCompactionUpdate(room.compaction_request));
					}
				});
				if (isActiveBrowser && hasCollaborators) pollInterval = POLLING_INTERVAL_WITH_COLLABORATORS_IN_MS;
				else if (isActiveBrowser) pollInterval = POLLING_INTERVAL_IN_MS;
				else pollInterval = POLLING_INTERVAL_BACKGROUND_TAB_IN_MS;
			} catch (error) {
				if (isForbiddenError(error)) {
					handleForbiddenError(error, payload.rooms);
					if (roomStates.size === 0) {
						isPolling = false;
						return;
					}
				} else if (isRequestBodyTooLargeError(error)) {
					syncRequestBodySizeLimit = Math.max(MIN_SYNC_REQUEST_BODY_SIZE_LIMIT_IN_BYTES, Math.floor(syncRequestBodySizeLimit / 2));
					pollInterval = hasCollaborators ? ERROR_RETRY_DELAYS_WITH_COLLABORATORS_MS[0] : ERROR_RETRY_DELAYS_SOLO_MS[0];
					restoreExactUpdates(payload);
					for (const room of payload.rooms) {
						if (!roomStates.has(room.room)) continue;
						roomStates.get(room.room).log("Sync request body too large, retrying with smaller batches", {
							error,
							nextPoll: pollInterval,
							syncRequestBodySizeLimit
						}, "error", true);
					}
				} else if (isProtocolMismatchError(error)) {
					const affectedRooms = [...roomStates.entries()];
					for (const [, state] of affectedRooms) state.onStatusChange({
						status: "disconnected",
						error: new ConnectionError(ConnectionErrorCode.PROTOCOL_MISMATCH, "Protocol mismatch between client and server")
					});
					for (const [room] of affectedRooms) unregisterRoom(room, { sendDisconnectSignal: false });
					isPolling = false;
					return;
				} else {
					consecutiveFailures++;
					const retrySchedule = hasCollaborators ? ERROR_RETRY_DELAYS_WITH_COLLABORATORS_MS : ERROR_RETRY_DELAYS_SOLO_MS;
					if (consecutiveFailures <= retrySchedule.length) pollInterval = retrySchedule[consecutiveFailures - 1];
					else pollInterval = DISCONNECT_DIALOG_RETRY_MS;
					if (isManualRetry) {
						pollInterval = MANUAL_RETRY_INTERVAL_MS;
						isManualRetry = false;
					}
					for (const room of payload.rooms) {
						if (!roomStates.has(room.room)) continue;
						const state = roomStates.get(room.room);
						if (room.updates.length > 0 && state.endCursor > 0) {
							state.updateQueue.clear();
							state.updateQueue.add(state.createCompactionUpdate());
						} else if (room.updates.length > 0) state.updateQueue.restore(room.updates);
						state.log("Error posting sync update, will retry with backoff", {
							error,
							nextPoll: pollInterval
						}, "error", true);
					}
					if (!isUnloadPending) {
						const backgroundRetriesFailed = consecutiveFailures > retrySchedule.length;
						roomsInRequest.forEach((state) => {
							if (roomStates.get(state.room) !== state) return;
							state.onStatusChange({
								status: "disconnected",
								canManuallyRetry: true,
								consecutiveFailures,
								backgroundRetriesFailed,
								willAutoRetryInMs: pollInterval
							});
						});
					}
				}
			}
			pollingTimeoutId = setTimeout(poll, pollInterval);
		}
		start();
	}
	function registerRoom({ room, doc, awareness, log, onStatusChange }) {
		if (roomStates.has(room)) return;
		const updateQueue = createUpdateQueue([createSyncStep1Update(doc)]);
		/**
		* Connection limits are enforced on the first entity to be loaded for sync.
		* This is an inelegant solution to a hard problem: This sync provider and the
		* sync package in general intentionally have no knowledge of the individual
		* entities being synced.
		*
		* Let's say a user opens a document (Entity A) for editing. If you asked the
		* user what they are doing, they would reply "I'm editing Entity A." You might
		* say that Entity A is "primary."
		*
		* However, the action of editing Entity A also triggers the loading of a
		* collection of document categories (Entity B) and another document (Entity C)
		* that is embedded in Entity A. You might therefore say that Entity B and
		* Entity C are "secondary" in this session.
		*
		* Meanwhile, a different user opens Entity C for editing, which also triggers
		* the loading of Entity B. In this session, Entity C is "primary" and Entity B
		* is "secondary."
		*
		* How do we enforce limits? The intuitive answer is that we only want to count
		* connections when the entity is "primary." However, we have no ability to
		* detect this. A document might be loaded as a primary entity in one session
		* and a secondary entity in another.
		*
		* In practice, we can consider the first-loaded entity as "primary" and use it
		* to enforce our connection limit. This is an imperfect assumption of consumer
		* behavior.
		*
		* How might this approach be improved? We could develop some way to annotate
		* entity loading so that the consumer can indicate which entity is primary.
		*/
		const isPrimaryRoom = 0 === roomStates.size;
		function onAwarenessUpdate() {
			roomState.localAwarenessState = awareness.getLocalState() ?? {};
		}
		function onDocUpdate(update, origin) {
			if (POLLING_MANAGER_ORIGIN === origin) return;
			if (update.byteLength > 786432) {
				const state = roomStates.get(room);
				if (!state) return;
				state.log("Document size limit exceeded", {
					maxUpdateSizeInBytes: MAX_UPDATE_SIZE_IN_BYTES,
					updateSizeInBytes: update.byteLength
				});
				state.onStatusChange({
					status: "disconnected",
					error: new ConnectionError(ConnectionErrorCode.DOCUMENT_SIZE_LIMIT_EXCEEDED, "Document size limit exceeded")
				});
				unregisterRoom(room);
				return;
			}
			updateQueue.add(createSyncUpdate(update, SyncUpdateType.UPDATE));
		}
		function unregister() {
			doc.off("updateV2", onDocUpdate);
			awareness.off("change", onAwarenessUpdate);
			updateQueue.clear();
		}
		const roomState = {
			clientId: doc.clientID,
			createCompactionUpdate: () => createSyncUpdate(encodeStateAsUpdateV2(doc), SyncUpdateType.COMPACTION),
			endCursor: 0,
			isPrimaryRoom,
			localAwarenessState: awareness.getLocalState() ?? {},
			log,
			onStatusChange,
			processAwarenessUpdate: (state) => processAwarenessUpdate(state, awareness),
			processDocUpdate: (update) => processDocUpdate(update, doc),
			room,
			unregister,
			updateQueue
		};
		doc.on("updateV2", onDocUpdate);
		awareness.on("change", onAwarenessUpdate);
		roomStates.set(room, roomState);
		if (!areListenersRegistered) {
			window.addEventListener("beforeunload", handleBeforeUnload);
			window.addEventListener("pagehide", handlePageHide);
			document.addEventListener("visibilitychange", handleVisibilityChange);
			areListenersRegistered = true;
		}
		if (!isPolling) poll();
	}
	function unregisterRoom(room, { sendDisconnectSignal = true } = {}) {
		const state = roomStates.get(room);
		if (state) {
			if (sendDisconnectSignal) {
				const rooms = [{
					after: 0,
					awareness: null,
					client_id: state.clientId,
					room,
					updates: []
				}];
				postSyncUpdateNonBlocking({ rooms });
			}
			state.unregister();
			roomStates.delete(room);
		}
		if (0 === roomStates.size && areListenersRegistered) {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			window.removeEventListener("pagehide", handlePageHide);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			areListenersRegistered = false;
			hasCheckedConnectionLimit = false;
			consecutiveFailures = 0;
			roomOverflowOffset = 0;
			syncRequestBodySizeLimit = MAX_SYNC_REQUEST_BODY_SIZE_IN_BYTES;
		}
	}
	/**
	* Immediately retry the sync connection by cancelling any pending
	* timeout and triggering a new poll. If the retry fails, the next
	* auto-retry waits 15s (MANUAL_RETRY_INTERVAL_MS) instead of the
	* usual 30s, then falls back to 30s for subsequent auto-retries.
	*/
	function retryNow() {
		isManualRetry = true;
		if (pollingTimeoutId) {
			clearTimeout(pollingTimeoutId);
			pollingTimeoutId = null;
			poll();
		}
	}
	/**
	* Immediately retries the sync connection instead of waiting for the next
	* automatic retry. See `retryNow`.
	*/
	function retrySyncConnection() {
		pollingManager.retryNow();
	}
	const pollingManager = {
		registerRoom,
		retryNow,
		unregisterRoom
	};

// packages/sync/build-module/providers/http-polling/http-polling-provider.mjs
/**
	* Yjs provider that uses HTTP polling for real-time synchronization. It manages
	* document updates and awareness states through a central sync server.
	*/
	var HttpPollingProvider = class extends ObservableV2 {
		options;
		awareness;
		status = "disconnected";
		constructor(options) {
			super();
			this.options = options;
			this.log("Initializing", { room: options.room });
			this.awareness = options.awareness ?? new Awareness(options.ydoc);
			this.connect();
		}
		/**
		* Connect to the endpoint and initialize sync.
		*/
		connect() {
			this.log("Connecting");
			pollingManager.registerRoom({
				room: this.options.room,
				doc: this.options.ydoc,
				awareness: this.awareness,
				log: this.log,
				onStatusChange: this.emitStatus
			});
		}
		/**
		* Destroy the provider and cleanup resources.
		*/
		destroy() {
			this.disconnect();
			super.destroy();
		}
		/**
		* Disconnect the provider and allow reconnection later.
		*/
		disconnect() {
			this.log("Disconnecting");
			pollingManager.unregisterRoom(this.options.room);
			this.emitStatus({ status: "disconnected" });
		}
		/**
		* Emit connection status, passing the full object through so that
		* additional fields (e.g. `willAutoRetryInMs`) are preserved for consumers.
		*
		* @param connectionStatus The connection status object
		*/
		emitStatus = (connectionStatus) => {
			const { status } = connectionStatus;
			const error = status === "disconnected" ? connectionStatus.error : void 0;
			if (this.status === status && !error) return;
			if (status === "connecting" && this.status !== "disconnected") return;
			this.log("Status change", {
				status,
				error
			});
			this.status = status;
			this.emit("status", [connectionStatus]);
		};
		/**
		* Log debug messages if debugging is enabled.
		*
		* @param message    The debug message
		* @param debug      Additional debug information
		* @param errorLevel The console method to use for logging
		* @param force      Whether to force logging regardless of debug setting
		*/
		log = (message, debug = {}, errorLevel = "log", force = false) => {
			if (!this.options.debug && !force) return;
			(console[errorLevel] || console.log)(`[${this.constructor.name}]: ${message}`, {
				room: this.options.room,
				...debug
			});
		};
	};
	/**
	* Create a provider creator function for the HttpPollingProvider
	*/
	function createHttpPollingProvider() {
		return async ({ awareness, objectType, objectId, ydoc }) => {
			const provider = new HttpPollingProvider({
				awareness,
				room: objectId ? `${objectType}:${objectId}` : objectType,
				ydoc
			});
			return {
				destroy: () => provider.destroy(),
				on: (event, callback) => {
					provider.on(event, callback);
				}
			};
		};
	}

// packages/sync/build-module/providers/index.mjs
	let providerCreators = null;
	/**
	* Returns the default provider creators. HTTP polling is the default when
	* real-time collaboration is enabled.
	*
	* @return {ProviderCreator[]} Creator functions for Yjs providers.
	*/
	function getDefaultProviderCreators() {
		return window.__experimentalEnableRealTimeCollaboration ? [createHttpPollingProvider()] : [];
	}
	/**
	* Type guard to ensure filter return values are functions.
	*
	* @param {unknown} creator
	* @return {boolean} Whether the argument is a function
	*/
	function isProviderCreator(creator) {
		return "function" === typeof creator;
	}
	/**
	* Get the current Yjs provider creators, allowing plugins to filter the array.
	*
	* @return {ProviderCreator[]} Creator functions for Yjs providers.
	*/
	function getProviderCreators() {
		if (providerCreators) return providerCreators;
		if (!window.__experimentalEnableRealTimeCollaboration) return [];
		/**
		* Filter the available provider creators.
		*/
		const filteredProviderCreators = (0, _wordpress_hooks.applyFilters)("sync.providers", getDefaultProviderCreators());
		if (!Array.isArray(filteredProviderCreators)) {
			providerCreators = [];
			return providerCreators;
		}
		providerCreators = filteredProviderCreators.filter(isProviderCreator);
		return providerCreators;
	}

// packages/sync/build-module/undo-manager.mjs
/**
	* Creates the undo history of one synced entity, backed by a Yjs undo manager.
	* It gives this peer its own undo/redo stack for the entity's CRDT document,
	* without undoing changes made by other peers.
	*
	* Yjs tracks changes on its own: every local transaction on the map either
	* opens a new undo level or merges into the current one. Each new level is
	* reported through `onUndoLevelOpened`.
	*
	* Yjs destroys its undo manager with the document, so there is nothing to
	* clean up when the entity is unloaded.
	*
	* @param ydoc                       The entity's CRDT document.
	* @param ymap                       The Yjs map to track.
	* @param handlers                   Handlers for the document.
	* @param handlers.addUndoMeta       Handler to add metadata to undo items.
	* @param handlers.onUndoLevelOpened Handler for new undo levels.
	* @param handlers.restoreUndoMeta   Handler to restore metadata from undo items.
	*/
	function createEntityUndoManager(ydoc, ymap, handlers) {
		let isApplyingHistory = false;
		const yUndoManager = new UndoManager(ymap, {
			captureTimeout: 500,
			trackedOrigins: /* @__PURE__ */ new Set([LOCAL_EDITOR_ORIGIN])
		});
		yUndoManager.on("stack-item-added", (event) => {
			handlers.addUndoMeta(ydoc, event.stackItem.meta);
			if ("undo" === event.type && !isApplyingHistory) handlers.onUndoLevelOpened?.();
		});
		yUndoManager.on("stack-item-popped", (event) => {
			handlers.restoreUndoMeta(ydoc, event.stackItem.meta);
		});
		const applyHistory = (type) => {
			isApplyingHistory = true;
			try {
				return null !== ("undo" === type ? yUndoManager.undo() : yUndoManager.redo());
			} finally {
				isApplyingHistory = false;
			}
		};
		return {
			clearRedo: () => yUndoManager.clear(false, true),
			hasRedo: () => yUndoManager.canRedo(),
			hasUndo: () => yUndoManager.canUndo(),
			redo: () => applyHistory("redo"),
			stopCapturing: () => yUndoManager.stopCapturing(),
			undo: () => applyHistory("undo")
		};
	}

// packages/sync/build-module/crdt-snapshot.mjs
/**
	* Encodes a document's state as a portable Yjs snapshot.
	*
	* A `Y.Snapshot` is a state vector plus a delete set. Together those fully
	* determine a Yjs document's content, so the result is a complete description
	* of what this document held at the time of the call, without any of the
	* content itself. It is used to record what an autosave captured so that
	* another session can later verify its own document contains at least as much.
	*
	* @param {CRDTDoc} ydoc CRDT document.
	* @return {string} Base64-encoded snapshot.
	*/
	function encodeDocSnapshot(ydoc) {
		return toBase64(encodeSnapshotV2(snapshot(ydoc)));
	}
	/**
	* Determines whether `ydoc` contains everything a snapshot describes.
	* Unlike a bare state vector, this proves deletions are present too.
	*
	* Garbage collection does not affect the result: GC replaces runs of deleted
	* items with `GC` structs that are still marked deleted, so they remain in the
	* delete set.
	*
	* @param {CRDTDoc} ydoc            CRDT document.
	* @param {string}  encodedSnapshot Base64-encoded snapshot from `encodeDocSnapshot`.
	* @return {boolean} Whether the document contains everything the snapshot describes.
	*/
	function docContainsSnapshot(ydoc, encodedSnapshot) {
		let snapshot$1;
		try {
			snapshot$1 = decodeSnapshotV2(fromBase64(encodedSnapshot));
		} catch {
			return false;
		}
		const localSnapshot = snapshot(ydoc);
		for (const [client, clock] of snapshot$1.sv) if ((localSnapshot.sv.get(client) ?? 0) < clock) return false;
		const copiedDeleteSet = snapshot(ydoc).ds;
		const mergedDeleteSet = mergeDeleteSets([copiedDeleteSet, snapshot$1.ds]);
		return equalDeleteSets(localSnapshot.ds, mergedDeleteSet);
	}

// packages/sync/build-module/utils.mjs
/**
	* Creates a new Y.Doc instance with the given document metadata.
	*
	* @param {DocumentMeta} documentMeta Optional metadata to associate with the
	*                                    document. Metadata is not persisted.
	*/
	function createYjsDoc(documentMeta = {}) {
		const metaMap = new Map(Object.entries(documentMeta));
		return new Doc({ meta: metaMap });
	}
	/**
	* Initializes a Y.Doc instance with the necessary CRDT state for our use case.
	*
	* @param {Y.Doc} ydoc Y.Doc instance to initialize.
	*/
	function initializeYjsDoc(ydoc) {
		ydoc.getMap(CRDT_STATE_MAP_KEY).set(CRDT_STATE_MAP_VERSION_KEY, 1);
	}
	/**
	* Record that the entity was saved by a user-facing entity save in the CRDT
	* document metadata. Background CRDT snapshots should not update this marker.
	*
	* @param {CRDTDoc} ydoc CRDT document.
	*/
	function markEntityAsSaved(ydoc) {
		const recordMeta = ydoc.getMap(CRDT_STATE_MAP_KEY);
		recordMeta.set(CRDT_STATE_MAP_SAVED_AT_KEY, Date.now());
		recordMeta.set(CRDT_STATE_MAP_SAVED_BY_KEY, ydoc.clientID);
	}
	function pseudoRandomID() {
		return Math.floor(Math.random() * 1e9);
	}
	function serializeCrdtDoc(crdtDoc) {
		const tempDoc = createYjsDoc();
		applyUpdateV2(tempDoc, encodeStateAsUpdateV2(crdtDoc));
		const compactedUpdate = encodeStateAsUpdateV2(tempDoc);
		tempDoc.destroy();
		return JSON.stringify({
			document: toBase64(compactedUpdate),
			updateId: pseudoRandomID()
		});
	}
	function deserializeCrdtDoc(serializedCrdtDoc) {
		try {
			const { document } = JSON.parse(serializedCrdtDoc);
			const ydoc = createYjsDoc({ [CRDT_DOC_META_PERSISTENCE_KEY]: true });
			const yupdate = fromBase64(document);
			applyUpdateV2(ydoc, yupdate);
			ydoc.clientID = pseudoRandomID();
			return ydoc;
		} catch {
			return null;
		}
	}

// packages/sync/build-module/manager.mjs
/**
	* Get the entity ID for the given object type and object ID.
	*
	* @param {ObjectType}    objectType Object type.
	* @param {ObjectID|null} objectId   Object ID.
	*/
	function getEntityId(objectType, objectId) {
		return `${objectType}_${objectId}`;
	}
	/**
	* The sync manager orchestrates the lifecycle of syncing entity records. It
	* creates Yjs documents, connects to providers, creates awareness instances,
	* and coordinates with the `core-data` store.
	*
	* @param debug Whether to enable performance and debug logging.
	*/
	function createSyncManager(debug = false) {
		const debugWrap = debug ? logPerformanceTiming : passThru;
		const collectionStates = /* @__PURE__ */ new Map();
		const entityStates = /* @__PURE__ */ new Map();
		/**
		* The undo history of the loaded entities. Each entity has its own undo
		* manager, in which Yjs tracks the changes to its document, so core-data
		* does not record them itself. It learns about each level Yjs opens
		* through the record's `onUndoLevelOpened` handler, keeps that level in
		* its own undo manager next to the records of entities that are not
		* synced, and delegates it back here, for that entity, when it is the one
		* to undo or redo.
		*/
		const undoManager = {
			undo(objectType, objectId) {
				flushPendingCRDTDocUpdates();
				return entityStates.get(getEntityId(objectType, objectId))?.undoManager.undo() ?? false;
			},
			redo(objectType, objectId) {
				flushPendingCRDTDocUpdates();
				return entityStates.get(getEntityId(objectType, objectId))?.undoManager.redo() ?? false;
			},
			hasUndo() {
				return [...entityStates.values()].some((entityState) => entityState.undoManager.hasUndo());
			},
			hasRedo() {
				return [...entityStates.values()].some((entityState) => entityState.undoManager.hasRedo());
			},
			stopCapturing() {
				flushPendingCRDTDocUpdates();
				entityStates.forEach((entityState) => entityState.undoManager.stopCapturing());
			},
			clearRedo() {
				flushPendingCRDTDocUpdates();
				entityStates.forEach((entityState) => entityState.undoManager.clearRedo());
			}
		};
		/**
		* Log debug messages if debugging is enabled.
		*
		* @param component The component or context related to the log message
		* @param message   The debug message
		* @param entityId  The entity ID related to the log message
		* @param context   Additional debug context
		*/
		function log(component, message, entityId, context = {}) {
			if (!debug) return;
			console.log(`[SyncManager][${component}]: ${message}`, {
				...context,
				entityId
			});
		}
		/**
		* Load an entity for syncing and manage its lifecycle.
		*
		* @param {SyncConfig}     syncConfig Sync configuration for the object type.
		* @param {ObjectType}     objectType Object type.
		* @param {ObjectID}       objectId   Object ID.
		* @param {ObjectData}     record     Entity record representing this object type.
		* @param {RecordHandlers} handlers   Handlers for updating and fetching the record.
		*/
		async function loadEntity(syncConfig, objectType, objectId, record, handlers) {
			const providerCreators = getProviderCreators();
			const entityId = getEntityId(objectType, objectId);
			if (0 === providerCreators.length) {
				log("loadEntity", "no providers, skipping", entityId);
				return;
			}
			if (entityStates.has(entityId)) {
				log("loadEntity", "already loaded", entityId);
				return;
			}
			if (false === syncConfig.shouldSync?.(objectType, objectId)) {
				log("loadEntity", "shouldSync false, skipping", entityId);
				return;
			}
			log("loadEntity", "loading", entityId);
			handlers = {
				addUndoMeta: debugWrap(handlers.addUndoMeta),
				editRecord: debugWrap(handlers.editRecord),
				getEditedRecord: debugWrap(handlers.getEditedRecord),
				onStatusChange: debugWrap(handlers.onStatusChange),
				persistCRDTDoc: debugWrap(handlers.persistCRDTDoc),
				refetchRecord: debugWrap(handlers.refetchRecord),
				restoreUndoMeta: debugWrap(handlers.restoreUndoMeta),
				onUndoLevelOpened: handlers.onUndoLevelOpened ? debugWrap(handlers.onUndoLevelOpened) : void 0
			};
			const ydoc = createYjsDoc({ objectType });
			const recordMap = ydoc.getMap(CRDT_RECORD_MAP_KEY);
			const stateMap = ydoc.getMap(CRDT_STATE_MAP_KEY);
			const now = Date.now();
			let hasObserversAttached = false;
			let isEntityUnloaded = false;
			const unload = () => {
				log("loadEntity", "unloading", entityId);
				isEntityUnloaded = true;
				providerResults?.forEach((result) => result.destroy());
				handlers.onStatusChange(null);
				if (hasObserversAttached) {
					recordMap.unobserveDeep(onRecordUpdate);
					stateMap.unobserve(onStateMapUpdate);
				}
				ydoc.destroy();
				entityStates.delete(entityId);
			};
			const awareness = syncConfig.createAwareness?.(ydoc, objectId);
			const onRecordUpdate = (_events, transaction) => {
				if (transaction.local && !(transaction.origin instanceof UndoManager)) return;
				internal.updateEntityRecord(objectType, objectId);
			};
			const onStateMapUpdate = (event, transaction) => {
				if (transaction.local) return;
				event.keysChanged.forEach((key) => {
					switch (key) {
						case CRDT_STATE_MAP_SAVED_AT_KEY:
							const savedAt = stateMap.get(CRDT_STATE_MAP_SAVED_AT_KEY);
							if ("number" === typeof savedAt && savedAt > now) {
								log("loadEntity", "refetching record", entityId);
								handlers.refetchRecord().catch(() => {});
							}
					}
				});
			};
			const { addUndoMeta, onUndoLevelOpened, restoreUndoMeta } = handlers;
			const entityUndoManager = createEntityUndoManager(ydoc, recordMap, {
				addUndoMeta,
				restoreUndoMeta,
				onUndoLevelOpened: () => {
					entityStates.forEach((other) => {
						if (other.undoManager !== entityUndoManager) {
							other.undoManager.stopCapturing();
							other.undoManager.clearRedo();
						}
					});
					onUndoLevelOpened?.();
				}
			});
			let providerResults;
			const entityState = {
				awareness,
				handlers,
				objectId,
				objectType,
				syncConfig,
				undoManager: entityUndoManager,
				unload,
				ydoc
			};
			entityStates.set(entityId, entityState);
			log("loadEntity", "connecting", entityId);
			providerResults = await Promise.all(providerCreators.map(async (create) => {
				const provider = await create({
					objectType,
					objectId,
					ydoc,
					awareness,
					Y: yjs_exports
				});
				provider.on("status", handlers.onStatusChange);
				return provider;
			}));
			if (isEntityUnloaded) {
				log("loadEntity", "unloaded during connect, aborting", entityId);
				providerResults.forEach((result) => result.destroy());
				return;
			}
			initializeYjsDoc(ydoc);
			internal.applyPersistedCrdtDoc(objectType, objectId, record);
			recordMap.observeDeep(onRecordUpdate);
			stateMap.observe(onStateMapUpdate);
			hasObserversAttached = true;
		}
		/**
		* Load a collection for syncing and manage its lifecycle.
		*
		* @param {SyncConfig}         syncConfig Sync configuration for the object type.
		* @param {ObjectType}         objectType Object type.
		* @param {CollectionHandlers} handlers   Handlers for updating the collection.
		*/
		async function loadCollection(syncConfig, objectType, handlers) {
			const providerCreators = getProviderCreators();
			const entityId = getEntityId(objectType, null);
			if (0 === providerCreators.length) {
				log("loadCollection", "no providers, skipping", entityId);
				return;
			}
			if (collectionStates.has(objectType)) {
				log("loadCollection", "already loaded", entityId);
				return;
			}
			if (false === syncConfig.shouldSync?.(objectType, null)) {
				log("loadCollection", "shouldSync false, skipping", entityId);
				return;
			}
			log("loadCollection", "loading", entityId);
			const ydoc = createYjsDoc({
				collection: true,
				objectType
			});
			const stateMap = ydoc.getMap(CRDT_STATE_MAP_KEY);
			const now = Date.now();
			let hasObserversAttached = false;
			let isCollectionUnloaded = false;
			const unload = () => {
				log("loadCollection", "unloading", entityId);
				isCollectionUnloaded = true;
				providerResults?.forEach((result) => result.destroy());
				handlers.onStatusChange(null);
				if (hasObserversAttached) stateMap.unobserve(onStateMapUpdate);
				ydoc.destroy();
				collectionStates.delete(objectType);
			};
			const onStateMapUpdate = (event, transaction) => {
				if (transaction.local) return;
				event.keysChanged.forEach((key) => {
					switch (key) {
						case CRDT_STATE_MAP_SAVED_AT_KEY:
							const newValue = stateMap.get(CRDT_STATE_MAP_SAVED_AT_KEY);
							if ("number" === typeof newValue && newValue > now) handlers.refetchRecords().catch(() => {});
					}
				});
			};
			const awareness = syncConfig.createAwareness?.(ydoc);
			let providerResults;
			const collectionState = {
				awareness,
				handlers,
				syncConfig,
				unload,
				ydoc
			};
			collectionStates.set(objectType, collectionState);
			log("loadCollection", "connecting", entityId);
			providerResults = await Promise.all(providerCreators.map(async (create) => {
				const provider = await create({
					awareness,
					objectType,
					objectId: null,
					ydoc,
					Y: yjs_exports
				});
				provider.on("status", handlers.onStatusChange);
				return provider;
			}));
			if (isCollectionUnloaded) {
				log("loadCollection", "unloaded during connect, aborting", entityId);
				providerResults.forEach((result) => result.destroy());
				return;
			}
			stateMap.observe(onStateMapUpdate);
			hasObserversAttached = true;
			initializeYjsDoc(ydoc);
		}
		/**
		* Whether an entity was loaded for syncing and has not been unloaded.
		*
		* @param {ObjectType} objectType Object type.
		* @param {ObjectID}   objectId   Object ID.
		*/
		function isLoaded(objectType, objectId) {
			return entityStates.has(getEntityId(objectType, objectId));
		}
		/**
		* Unload an entity, stop syncing, destroy its in-memory state, and trigger an
		* update of the collection.
		*
		* @param {ObjectType} objectType Object type to discard.
		* @param {ObjectID}   objectId   Object ID to discard, or null for collections.
		*/
		function unloadEntity(objectType, objectId) {
			const entityId = getEntityId(objectType, objectId);
			log("unloadEntity", "unloading", entityId);
			entityStates.get(entityId)?.unload();
			updateCRDTDoc(objectType, null, {}, origin, { isSave: true });
		}
		/**
		* Unload all loaded entities, stopping all syncing.
		*/
		function unloadAll() {
			log("unloadAll", "unloading all entities", "all");
			for (const [, entityState] of [...entityStates]) entityState.unload();
			entityStates.clear();
			for (const [, collectionState] of [...collectionStates]) collectionState.unload();
			collectionStates.clear();
		}
		/**
		* Get the awareness instance for the given object type and object ID, if supported.
		*
		* @template {Awareness} State
		* @param {ObjectType}    objectType Object type.
		* @param {ObjectID|null} objectId   Object ID.
		* @return {State | undefined} The awareness instance, or undefined if not supported.
		*/
		function getAwareness(objectType, objectId) {
			const entityId = getEntityId(objectType, objectId);
			const entityState = entityStates.get(entityId);
			if (!entityState || !entityState.awareness) return;
			return entityState.awareness;
		}
		/**
		* Load and inspect the persisted CRDT document. If supported and it exists,
		* compare it against the current entity record. If there are differences,
		* apply the changes from the entity record.
		*
		* @param {ObjectType} objectType Object type.
		* @param {ObjectID}   objectId   Object ID.
		* @param {ObjectData} record     Entity record representing this object type.
		*/
		function _applyPersistedCrdtDoc(objectType, objectId, record) {
			const entityId = getEntityId(objectType, objectId);
			const entityState = entityStates.get(entityId);
			if (!entityState) {
				log("applyPersistedCrdtDoc", "no entity state", entityId);
				return;
			}
			const { handlers, syncConfig: { applyChangesToCRDTDoc, getChangesFromCRDTDoc, getPersistedCRDTDoc }, ydoc: targetDoc } = entityState;
			const serialized = getPersistedCRDTDoc?.(record);
			const tempDoc = serialized ? deserializeCrdtDoc(serialized) : null;
			if (!tempDoc) {
				log("applyPersistedCrdtDoc", "no persisted doc", entityId);
				targetDoc.transact(() => {
					applyChangesToCRDTDoc(targetDoc, record);
					handlers.persistCRDTDoc();
				}, LOCAL_SYNC_MANAGER_ORIGIN);
				return;
			}
			const update = encodeStateAsUpdateV2(tempDoc);
			applyUpdateV2(targetDoc, update);
			const invalidations = getChangesFromCRDTDoc(tempDoc, record);
			const invalidatedKeys = Object.keys(invalidations);
			tempDoc.destroy();
			if (0 === invalidatedKeys.length) {
				log("applyPersistedCrdtDoc", "valid persisted doc", entityId);
				return;
			}
			log("applyPersistedCrdtDoc", "invalidated keys", entityId, { invalidatedKeys });
			const changes = invalidatedKeys.reduce((acc, key) => Object.assign(acc, { [key]: record[key] }), {});
			targetDoc.transact(() => {
				applyChangesToCRDTDoc(targetDoc, changes);
				handlers.persistCRDTDoc();
			}, LOCAL_SYNC_MANAGER_ORIGIN);
		}
		/**
		* Update CRDT document with changes from the local store.
		*
		* @param {ObjectType}               objectType             Object type.
		* @param {ObjectID}                 objectId               Object ID.
		* @param {Partial< ObjectData >}    changes                Updates to make.
		* @param {string}                   origin                 The source of change.
		* @param {SyncManagerUpdateOptions} options                Optional flags for the update.
		* @param {boolean}                  options.isSave         Whether this update represents a user-facing entity save.
		* @param {boolean}                  options.isNewUndoLevel Whether to create a new undo level for this change. Defaults to false.
		*/
		function updateCRDTDoc(objectType, objectId, changes, origin, options = {}) {
			const { isSave = false, isNewUndoLevel = false } = options;
			const entityId = getEntityId(objectType, objectId);
			const entityState = entityStates.get(entityId);
			const collectionState = collectionStates.get(objectType);
			if (entityState) {
				const { syncConfig, ydoc } = entityState;
				if (isNewUndoLevel) undoManager.stopCapturing();
				ydoc.transact(() => {
					log("updateCRDTDoc", "applying changes", entityId, { changedKeys: Object.keys(changes) });
					syncConfig.applyChangesToCRDTDoc(ydoc, changes);
					if (isSave) markEntityAsSaved(ydoc);
				}, origin);
			}
			if (collectionState && isSave) collectionState.ydoc.transact(() => {
				markEntityAsSaved(collectionState.ydoc);
			}, origin);
		}
		const pendingCRDTDocUpdates = [];
		let isFlushingCRDTDocUpdates = false;
		function flushPendingCRDTDocUpdates() {
			if (isFlushingCRDTDocUpdates) return;
			isFlushingCRDTDocUpdates = true;
			try {
				while (pendingCRDTDocUpdates.length > 0) {
					const args = pendingCRDTDocUpdates.shift();
					if (args) updateCRDTDoc(...args);
				}
			} finally {
				isFlushingCRDTDocUpdates = false;
			}
		}
		function deferUpdateCRDTDoc(...args) {
			pendingCRDTDocUpdates.push(args);
			setTimeout(flushPendingCRDTDocUpdates, 0);
		}
		function updateOrDefer(objectType, objectId, changes, origin, options = {}) {
			if ((getAwareness(objectType, objectId)?.getStates().size ?? 0) > 1) {
				flushPendingCRDTDocUpdates();
				updateCRDTDoc(objectType, objectId, changes, origin, options);
				return;
			}
			deferUpdateCRDTDoc(objectType, objectId, changes, origin, options);
		}
		/**
		* Encode the current state of an entity's CRDT document as a snapshot.
		*
		* The result describes what the document holds right now without including
		* any content. It is recorded alongside an autosave so another session can
		* later verify its own document contains everything the autosave captured.
		*
		* @param {ObjectType} objectType Object type.
		* @param {ObjectID}   objectId   Object ID.
		* @return {string|undefined} Base64-encoded snapshot, or undefined when the
		*                            entity is not loaded.
		*/
		function getEntitySnapshot(objectType, objectId) {
			const entityId = getEntityId(objectType, objectId);
			const entityState = entityStates.get(entityId);
			if (!entityState) {
				log("getEntitySnapshot", "no entity state", entityId);
				return;
			}
			flushPendingCRDTDocUpdates();
			return encodeDocSnapshot(entityState.ydoc);
		}
		/**
		* Determine whether an entity's CRDT document contains everything a
		* snapshot describes.
		*
		* Returns `false` when the entity is not loaded or the snapshot cannot be
		* decoded, so callers fail open and surface the autosave.
		*
		* @param {ObjectType} objectType      Object type.
		* @param {ObjectID}   objectId        Object ID.
		* @param {string}     encodedSnapshot Base64-encoded snapshot.
		* @return {boolean} Whether the document contains the snapshotted state.
		*/
		function entityContainsSnapshot(objectType, objectId, encodedSnapshot) {
			const entityId = getEntityId(objectType, objectId);
			const entityState = entityStates.get(entityId);
			if (!entityState) return false;
			flushPendingCRDTDocUpdates();
			return docContainsSnapshot(entityState.ydoc, encodedSnapshot);
		}
		/**
		* Update the entity record in the local store with changes from the CRDT
		* document.
		*
		* @param {ObjectType} objectType Object type of record to update.
		* @param {ObjectID}   objectId   Object ID of record to update.
		*/
		async function _updateEntityRecord(objectType, objectId) {
			const entityId = getEntityId(objectType, objectId);
			const entityState = entityStates.get(entityId);
			if (!entityState) {
				log("updateEntityRecord", "no entity state", entityId);
				return;
			}
			const { handlers, syncConfig, ydoc } = entityState;
			const changes = syncConfig.getChangesFromCRDTDoc(ydoc, await handlers.getEditedRecord());
			const changedKeys = Object.keys(changes);
			if (0 === changedKeys.length) return;
			log("updateEntityRecord", "changes", entityId, { changedKeys });
			handlers.editRecord(changes);
		}
		/**
		* Create object meta to persist the CRDT document in the entity record.
		*
		* @param {ObjectType} objectType Object type.
		* @param {ObjectID}   objectId   Object ID.
		*/
		async function createPersistedCRDTDoc(objectType, objectId) {
			const entityId = getEntityId(objectType, objectId);
			const entityState = entityStates.get(entityId);
			if (!entityState?.ydoc) return null;
			flushPendingCRDTDocUpdates();
			return serializeCrdtDoc(entityState.ydoc);
		}
		const internal = {
			applyPersistedCrdtDoc: debugWrap(_applyPersistedCrdtDoc),
			updateEntityRecord: debugWrap(_updateEntityRecord)
		};
		return {
			createPersistedCRDTDoc: debugWrap(createPersistedCRDTDoc),
			entityContainsSnapshot: debugWrap(entityContainsSnapshot),
			getAwareness,
			getEntitySnapshot: debugWrap(getEntitySnapshot),
			isLoaded,
			load: debugWrap(loadEntity),
			loadCollection: debugWrap(loadCollection),
			undoManager,
			unload: debugWrap(unloadEntity),
			unloadAll: debugWrap(unloadAll),
			update: debugWrap(updateOrDefer)
		};
	}

// node_modules/.store/diff@8.0.4-eS1ZVYhaFC9fHfWvV2-kIQ/node_modules/diff/libesm/diff/base.js
	var Diff = class {
		diff(oldStr, newStr, options = {}) {
			let callback;
			if (typeof options === "function") {
				callback = options;
				options = {};
			} else if ("callback" in options) callback = options.callback;
			const oldString = this.castInput(oldStr, options);
			const newString = this.castInput(newStr, options);
			const oldTokens = this.removeEmpty(this.tokenize(oldString, options));
			const newTokens = this.removeEmpty(this.tokenize(newString, options));
			return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
		}
		diffWithOptionsObj(oldTokens, newTokens, options, callback) {
			var _a;
			const done = (value) => {
				value = this.postProcess(value, options);
				if (callback) {
					setTimeout(function() {
						callback(value);
					}, 0);
					return;
				} else return value;
			};
			const newLen = newTokens.length, oldLen = oldTokens.length;
			let editLength = 1;
			let maxEditLength = newLen + oldLen;
			if (options.maxEditLength != null) maxEditLength = Math.min(maxEditLength, options.maxEditLength);
			const maxExecutionTime = (_a = options.timeout) !== null && _a !== void 0 ? _a : Infinity;
			const abortAfterTimestamp = Date.now() + maxExecutionTime;
			const bestPath = [{
				oldPos: -1,
				lastComponent: void 0
			}];
			let newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
			if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
			let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
			const execEditLength = () => {
				for (let diagonalPath = Math.max(minDiagonalToConsider, -editLength); diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
					let basePath;
					const removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
					if (removePath) bestPath[diagonalPath - 1] = void 0;
					let canAdd = false;
					if (addPath) {
						const addPathNewPos = addPath.oldPos - diagonalPath;
						canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
					}
					const canRemove = removePath && removePath.oldPos + 1 < oldLen;
					if (!canAdd && !canRemove) {
						bestPath[diagonalPath] = void 0;
						continue;
					}
					if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) basePath = this.addToPath(addPath, true, false, 0, options);
					else basePath = this.addToPath(removePath, false, true, 1, options);
					newPos = this.extractCommon(basePath, newTokens, oldTokens, diagonalPath, options);
					if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) return done(this.buildValues(basePath.lastComponent, newTokens, oldTokens)) || true;
					else {
						bestPath[diagonalPath] = basePath;
						if (basePath.oldPos + 1 >= oldLen) maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
						if (newPos + 1 >= newLen) minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
					}
				}
				editLength++;
			};
			if (callback) (function exec() {
				setTimeout(function() {
					if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) return callback(void 0);
					if (!execEditLength()) exec();
				}, 0);
			})();
			else while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
				const ret = execEditLength();
				if (ret) return ret;
			}
		}
		addToPath(path, added, removed, oldPosInc, options) {
			const last = path.lastComponent;
			if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) return {
				oldPos: path.oldPos + oldPosInc,
				lastComponent: {
					count: last.count + 1,
					added,
					removed,
					previousComponent: last.previousComponent
				}
			};
			else return {
				oldPos: path.oldPos + oldPosInc,
				lastComponent: {
					count: 1,
					added,
					removed,
					previousComponent: last
				}
			};
		}
		extractCommon(basePath, newTokens, oldTokens, diagonalPath, options) {
			const newLen = newTokens.length, oldLen = oldTokens.length;
			let oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
			while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1], options)) {
				newPos++;
				oldPos++;
				commonCount++;
				if (options.oneChangePerToken) basePath.lastComponent = {
					count: 1,
					previousComponent: basePath.lastComponent,
					added: false,
					removed: false
				};
			}
			if (commonCount && !options.oneChangePerToken) basePath.lastComponent = {
				count: commonCount,
				previousComponent: basePath.lastComponent,
				added: false,
				removed: false
			};
			basePath.oldPos = oldPos;
			return newPos;
		}
		equals(left, right, options) {
			if (options.comparator) return options.comparator(left, right);
			else return left === right || !!options.ignoreCase && left.toLowerCase() === right.toLowerCase();
		}
		removeEmpty(array) {
			const ret = [];
			for (let i = 0; i < array.length; i++) if (array[i]) ret.push(array[i]);
			return ret;
		}
		castInput(value, options) {
			return value;
		}
		tokenize(value, options) {
			return Array.from(value);
		}
		join(chars) {
			return chars.join("");
		}
		postProcess(changeObjects, options) {
			return changeObjects;
		}
		get useLongestToken() {
			return false;
		}
		buildValues(lastComponent, newTokens, oldTokens) {
			const components = [];
			let nextComponent;
			while (lastComponent) {
				components.push(lastComponent);
				nextComponent = lastComponent.previousComponent;
				delete lastComponent.previousComponent;
				lastComponent = nextComponent;
			}
			components.reverse();
			const componentLen = components.length;
			let componentPos = 0, newPos = 0, oldPos = 0;
			for (; componentPos < componentLen; componentPos++) {
				const component = components[componentPos];
				if (!component.removed) {
					if (!component.added && this.useLongestToken) {
						let value = newTokens.slice(newPos, newPos + component.count);
						value = value.map(function(value, i) {
							const oldValue = oldTokens[oldPos + i];
							return oldValue.length > value.length ? oldValue : value;
						});
						component.value = this.join(value);
					} else component.value = this.join(newTokens.slice(newPos, newPos + component.count));
					newPos += component.count;
					if (!component.added) oldPos += component.count;
				} else {
					component.value = this.join(oldTokens.slice(oldPos, oldPos + component.count));
					oldPos += component.count;
				}
			}
			return components;
		}
	};

// node_modules/.store/diff@8.0.4-eS1ZVYhaFC9fHfWvV2-kIQ/node_modules/diff/libesm/diff/character.js
	var CharacterDiff = class extends Diff {};
	const characterDiff = new CharacterDiff();
	function diffChars(oldStr, newStr, options) {
		return characterDiff.diff(oldStr, newStr, options);
	}

// node_modules/.store/diff@8.0.4-eS1ZVYhaFC9fHfWvV2-kIQ/node_modules/diff/libesm/util/string.js
	function longestCommonPrefix(str1, str2) {
		let i = 0;
		for (; i < str1.length && i < str2.length; i++) if (str1[i] != str2[i]) return str1.slice(0, i);
		return str1.slice(0, i);
	}
	function longestCommonSuffix(str1, str2) {
		let i;
		if (!str1 || !str2 || str1[str1.length - 1] != str2[str2.length - 1]) return "";
		for (i = 0; i < str1.length && i < str2.length; i++) if (str1[str1.length - (i + 1)] != str2[str2.length - (i + 1)]) return str1.slice(-i);
		return str1.slice(-i);
	}
	function replacePrefix(string, oldPrefix, newPrefix) {
		if (string.slice(0, oldPrefix.length) != oldPrefix) throw Error(`string ${JSON.stringify(string)} doesn't start with prefix ${JSON.stringify(oldPrefix)}; this is a bug`);
		return newPrefix + string.slice(oldPrefix.length);
	}
	function replaceSuffix(string, oldSuffix, newSuffix) {
		if (!oldSuffix) return string + newSuffix;
		if (string.slice(-oldSuffix.length) != oldSuffix) throw Error(`string ${JSON.stringify(string)} doesn't end with suffix ${JSON.stringify(oldSuffix)}; this is a bug`);
		return string.slice(0, -oldSuffix.length) + newSuffix;
	}
	function removePrefix(string, oldPrefix) {
		return replacePrefix(string, oldPrefix, "");
	}
	function removeSuffix(string, oldSuffix) {
		return replaceSuffix(string, oldSuffix, "");
	}
	function maximumOverlap(string1, string2) {
		return string2.slice(0, overlapCount(string1, string2));
	}
	function overlapCount(a, b) {
		let startA = 0;
		if (a.length > b.length) startA = a.length - b.length;
		let endB = b.length;
		if (a.length < b.length) endB = a.length;
		const map = Array(endB);
		let k = 0;
		map[0] = 0;
		for (let j = 1; j < endB; j++) {
			if (b[j] == b[k]) map[j] = map[k];
			else map[j] = k;
			while (k > 0 && b[j] != b[k]) k = map[k];
			if (b[j] == b[k]) k++;
		}
		k = 0;
		for (let i = startA; i < a.length; i++) {
			while (k > 0 && a[i] != b[k]) k = map[k];
			if (a[i] == b[k]) k++;
		}
		return k;
	}
	/**
	* Split a string into segments using a word segmenter, merging consecutive
	* segments if they are both whitespace segments. Whitespace segments can
	* appear adjacent to one another for two reasons:
	* - newlines always get their own segment
	* - where a diacritic is attached to a whitespace character in the text, the
	*   segment ends after the diacritic, so e.g. " \u0300 " becomes two segments.
	* This function therefore runs the segmenter's .segment() method and then
	* merges consecutive segments of whitespace into a single part.
	*/
	function segment(string, segmenter) {
		const parts = [];
		for (const segmentObj of Array.from(segmenter.segment(string))) {
			const segment = segmentObj.segment;
			if (parts.length && /\s/.test(parts[parts.length - 1]) && /\s/.test(segment)) parts[parts.length - 1] += segment;
			else parts.push(segment);
		}
		return parts;
	}
	function trailingWs(string, segmenter) {
		if (segmenter) return leadingAndTrailingWs(string, segmenter)[1];
		let i;
		for (i = string.length - 1; i >= 0; i--) if (!string[i].match(/\s/)) break;
		return string.substring(i + 1);
	}
	function leadingWs(string, segmenter) {
		if (segmenter) return leadingAndTrailingWs(string, segmenter)[0];
		const match = string.match(/^\s*/);
		return match ? match[0] : "";
	}
	function leadingAndTrailingWs(string, segmenter) {
		if (!segmenter) return [leadingWs(string), trailingWs(string)];
		if (segmenter.resolvedOptions().granularity != "word") throw new Error("The segmenter passed must have a granularity of \"word\"");
		const segments = segment(string, segmenter);
		const firstSeg = segments[0];
		const lastSeg = segments[segments.length - 1];
		return [/\s/.test(firstSeg) ? firstSeg : "", /\s/.test(lastSeg) ? lastSeg : ""];
	}

// node_modules/.store/diff@8.0.4-eS1ZVYhaFC9fHfWvV2-kIQ/node_modules/diff/libesm/diff/word.js
	const extendedWordChars = "a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}";
	const tokenizeIncludingWhitespace = new RegExp(`[${extendedWordChars}]+|\\s+|[^${extendedWordChars}]`, "ug");
	var WordDiff = class extends Diff {
		equals(left, right, options) {
			if (options.ignoreCase) {
				left = left.toLowerCase();
				right = right.toLowerCase();
			}
			return left.trim() === right.trim();
		}
		tokenize(value, options = {}) {
			let parts;
			if (options.intlSegmenter) {
				const segmenter = options.intlSegmenter;
				if (segmenter.resolvedOptions().granularity != "word") throw new Error("The segmenter passed must have a granularity of \"word\"");
				parts = segment(value, segmenter);
			} else parts = value.match(tokenizeIncludingWhitespace) || [];
			const tokens = [];
			let prevPart = null;
			parts.forEach((part) => {
				if (/\s/.test(part)) {
					if (prevPart == null) tokens.push(part);
					else tokens.push(tokens.pop() + part);
				} else if (prevPart != null && /\s/.test(prevPart)) {
					if (tokens[tokens.length - 1] == prevPart) tokens.push(tokens.pop() + part);
					else tokens.push(prevPart + part);
				} else tokens.push(part);
				prevPart = part;
			});
			return tokens;
		}
		join(tokens) {
			return tokens.map((token, i) => {
				if (i == 0) return token;
				else return token.replace(/^\s+/, "");
			}).join("");
		}
		postProcess(changes, options) {
			if (!changes || options.oneChangePerToken) return changes;
			let lastKeep = null;
			let insertion = null;
			let deletion = null;
			changes.forEach((change) => {
				if (change.added) insertion = change;
				else if (change.removed) deletion = change;
				else {
					if (insertion || deletion) dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, change, options.intlSegmenter);
					lastKeep = change;
					insertion = null;
					deletion = null;
				}
			});
			if (insertion || deletion) dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, null, options.intlSegmenter);
			return changes;
		}
	};
	const wordDiff = new WordDiff();
	function dedupeWhitespaceInChangeObjects(startKeep, deletion, insertion, endKeep, segmenter) {
		if (deletion && insertion) {
			const [oldWsPrefix, oldWsSuffix] = leadingAndTrailingWs(deletion.value, segmenter);
			const [newWsPrefix, newWsSuffix] = leadingAndTrailingWs(insertion.value, segmenter);
			if (startKeep) {
				const commonWsPrefix = longestCommonPrefix(oldWsPrefix, newWsPrefix);
				startKeep.value = replaceSuffix(startKeep.value, newWsPrefix, commonWsPrefix);
				deletion.value = removePrefix(deletion.value, commonWsPrefix);
				insertion.value = removePrefix(insertion.value, commonWsPrefix);
			}
			if (endKeep) {
				const commonWsSuffix = longestCommonSuffix(oldWsSuffix, newWsSuffix);
				endKeep.value = replacePrefix(endKeep.value, newWsSuffix, commonWsSuffix);
				deletion.value = removeSuffix(deletion.value, commonWsSuffix);
				insertion.value = removeSuffix(insertion.value, commonWsSuffix);
			}
		} else if (insertion) {
			if (startKeep) {
				const ws = leadingWs(insertion.value, segmenter);
				insertion.value = insertion.value.substring(ws.length);
			}
			if (endKeep) {
				const ws = leadingWs(endKeep.value, segmenter);
				endKeep.value = endKeep.value.substring(ws.length);
			}
		} else if (startKeep && endKeep) {
			const newWsFull = leadingWs(endKeep.value, segmenter), [delWsStart, delWsEnd] = leadingAndTrailingWs(deletion.value, segmenter);
			const newWsStart = longestCommonPrefix(newWsFull, delWsStart);
			deletion.value = removePrefix(deletion.value, newWsStart);
			const newWsEnd = longestCommonSuffix(removePrefix(newWsFull, newWsStart), delWsEnd);
			deletion.value = removeSuffix(deletion.value, newWsEnd);
			endKeep.value = replacePrefix(endKeep.value, newWsFull, newWsEnd);
			startKeep.value = replaceSuffix(startKeep.value, newWsFull, newWsFull.slice(0, newWsFull.length - newWsEnd.length));
		} else if (endKeep) {
			const endKeepWsPrefix = leadingWs(endKeep.value, segmenter);
			const deletionWsSuffix = trailingWs(deletion.value, segmenter);
			const overlap = maximumOverlap(deletionWsSuffix, endKeepWsPrefix);
			deletion.value = removeSuffix(deletion.value, overlap);
		} else if (startKeep) {
			const startKeepWsSuffix = trailingWs(startKeep.value, segmenter);
			const deletionWsPrefix = leadingWs(deletion.value, segmenter);
			const overlap = maximumOverlap(startKeepWsSuffix, deletionWsPrefix);
			deletion.value = removePrefix(deletion.value, overlap);
		}
	}
	var WordsWithSpaceDiff = class extends Diff {
		tokenize(value) {
			const regex = new RegExp(`(\\r?\\n)|[${extendedWordChars}]+|[^\\S\\n\\r]+|[^${extendedWordChars}]`, "ug");
			return value.match(regex) || [];
		}
	};
	const wordsWithSpaceDiff = new WordsWithSpaceDiff();

// node_modules/.store/diff@8.0.4-eS1ZVYhaFC9fHfWvV2-kIQ/node_modules/diff/libesm/diff/line.js
	var LineDiff = class extends Diff {
		constructor() {
			super(...arguments);
			this.tokenize = tokenize$1;
		}
		equals(left, right, options) {
			if (options.ignoreWhitespace) {
				if (!options.newlineIsToken || !left.includes("\n")) left = left.trim();
				if (!options.newlineIsToken || !right.includes("\n")) right = right.trim();
			} else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
				if (left.endsWith("\n")) left = left.slice(0, -1);
				if (right.endsWith("\n")) right = right.slice(0, -1);
			}
			return super.equals(left, right, options);
		}
	};
	const lineDiff = new LineDiff();
	function diffLines(oldStr, newStr, options) {
		return lineDiff.diff(oldStr, newStr, options);
	}
	function tokenize$1(value, options) {
		if (options.stripTrailingCr) value = value.replace(/\r\n/g, "\n");
		const retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
		if (!linesAndNewlines[linesAndNewlines.length - 1]) linesAndNewlines.pop();
		for (let i = 0; i < linesAndNewlines.length; i++) {
			const line = linesAndNewlines[i];
			if (i % 2 && !options.newlineIsToken) retLines[retLines.length - 1] += line;
			else retLines.push(line);
		}
		return retLines;
	}

// node_modules/.store/diff@8.0.4-eS1ZVYhaFC9fHfWvV2-kIQ/node_modules/diff/libesm/diff/sentence.js
	function isSentenceEndPunct(char) {
		return char == "." || char == "!" || char == "?";
	}
	var SentenceDiff = class extends Diff {
		tokenize(value) {
			var _a;
			const result = [];
			let tokenStartI = 0;
			for (let i = 0; i < value.length; i++) {
				if (i == value.length - 1) {
					result.push(value.slice(tokenStartI));
					break;
				}
				if (isSentenceEndPunct(value[i]) && value[i + 1].match(/\s/)) {
					result.push(value.slice(tokenStartI, i + 1));
					i = tokenStartI = i + 1;
					while ((_a = value[i + 1]) === null || _a === void 0 ? void 0 : _a.match(/\s/)) i++;
					result.push(value.slice(tokenStartI, i + 1));
					tokenStartI = i + 1;
				}
			}
			return result;
		}
	};
	const sentenceDiff = new SentenceDiff();

// node_modules/.store/diff@8.0.4-eS1ZVYhaFC9fHfWvV2-kIQ/node_modules/diff/libesm/diff/css.js
	var CssDiff = class extends Diff {
		tokenize(value) {
			return value.split(/([{}:;,]|\s+)/);
		}
	};
	const cssDiff = new CssDiff();

// node_modules/.store/diff@8.0.4-eS1ZVYhaFC9fHfWvV2-kIQ/node_modules/diff/libesm/diff/json.js
	var JsonDiff = class extends Diff {
		constructor() {
			super(...arguments);
			this.tokenize = tokenize$1;
		}
		get useLongestToken() {
			return true;
		}
		castInput(value, options) {
			const { undefinedReplacement, stringifyReplacer = (k, v) => typeof v === "undefined" ? undefinedReplacement : v } = options;
			return typeof value === "string" ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), null, "  ");
		}
		equals(left, right, options) {
			return super.equals(left.replace(/,([\r\n])/g, "$1"), right.replace(/,([\r\n])/g, "$1"), options);
		}
	};
	const jsonDiff = new JsonDiff();
	function canonicalize(obj, stack, replacementStack, replacer, key) {
		stack = stack || [];
		replacementStack = replacementStack || [];
		if (replacer) obj = replacer(key === void 0 ? "" : key, obj);
		let i = 0;
		for (; i < stack.length; i += 1) if (stack[i] === obj) return replacementStack[i];
		let canonicalizedObj;
		if ("[object Array]" === Object.prototype.toString.call(obj)) {
			stack.push(obj);
			canonicalizedObj = new Array(obj.length);
			replacementStack.push(canonicalizedObj);
			for (i = 0; i < obj.length; i += 1) canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, String(i));
			stack.pop();
			replacementStack.pop();
			return canonicalizedObj;
		}
		if (obj && obj.toJSON) obj = obj.toJSON();
		if (typeof obj === "object" && obj !== null) {
			stack.push(obj);
			canonicalizedObj = {};
			replacementStack.push(canonicalizedObj);
			const sortedKeys = [];
			let key;
			for (key in obj)
 /* istanbul ignore else */
			if (Object.prototype.hasOwnProperty.call(obj, key)) sortedKeys.push(key);
			sortedKeys.sort();
			for (i = 0; i < sortedKeys.length; i += 1) {
				key = sortedKeys[i];
				canonicalizedObj[key] = canonicalize(obj[key], stack, replacementStack, replacer, key);
			}
			stack.pop();
			replacementStack.pop();
		} else canonicalizedObj = obj;
		return canonicalizedObj;
	}

// node_modules/.store/diff@8.0.4-eS1ZVYhaFC9fHfWvV2-kIQ/node_modules/diff/libesm/diff/array.js
	var ArrayDiff = class extends Diff {
		tokenize(value) {
			return value.slice();
		}
		join(value) {
			return value;
		}
		removeEmpty(value) {
			return value;
		}
	};
	const arrayDiff = new ArrayDiff();

// packages/sync/build-module/quill-delta/AttributeMap.mjs
	function cloneDeep$1(value) {
		return JSON.parse(JSON.stringify(value));
	}
	let AttributeMap;
	(function(_AttributeMap) {
		function compose(a = {}, b = {}, keepNull = false) {
			if (typeof a !== "object") a = {};
			if (typeof b !== "object") b = {};
			let attributes = cloneDeep$1(b);
			if (!keepNull) attributes = Object.keys(attributes).reduce((copy, key) => {
				if (attributes[key] !== null || attributes[key] !== void 0) copy[key] = attributes[key];
				return copy;
			}, {});
			for (const key in a) if (a[key] !== void 0 && b[key] === void 0) attributes[key] = a[key];
			return Object.keys(attributes).length > 0 ? attributes : void 0;
		}
		_AttributeMap.compose = compose;
		function diff(a = {}, b = {}) {
			if (typeof a !== "object") a = {};
			if (typeof b !== "object") b = {};
			const attributes = Object.keys(a).concat(Object.keys(b)).reduce((attrs, key) => {
				if (!(0, import_es6.default)(a[key], b[key])) attrs[key] = b[key] === void 0 ? null : b[key];
				return attrs;
			}, {});
			return Object.keys(attributes).length > 0 ? attributes : void 0;
		}
		_AttributeMap.diff = diff;
		function invert(attr = {}, base = {}) {
			attr = attr || {};
			const baseInverted = Object.keys(base).reduce((memo, key) => {
				if (base[key] !== attr[key] && attr[key] !== void 0) memo[key] = base[key];
				return memo;
			}, {});
			return Object.keys(attr).reduce((memo, key) => {
				if (attr[key] !== base[key] && base[key] === void 0) memo[key] = null;
				return memo;
			}, baseInverted);
		}
		_AttributeMap.invert = invert;
		function transform(a, b, priority = false) {
			if (typeof a !== "object") return b;
			if (typeof b !== "object") return;
			if (!priority) return b;
			const attributes = Object.keys(b).reduce((attrs, key) => {
				if (a[key] === void 0) attrs[key] = b[key];
				return attrs;
			}, {});
			return Object.keys(attributes).length > 0 ? attributes : void 0;
		}
		_AttributeMap.transform = transform;
	})(AttributeMap || (AttributeMap = {}));
	var AttributeMap_default = AttributeMap;

// packages/sync/build-module/quill-delta/Op.mjs
	let Op;
	(function(_Op) {
		function length(op) {
			if (typeof op.delete === "number") return op.delete;
			else if (typeof op.retain === "number") return op.retain;
			else if (typeof op.retain === "object" && op.retain !== null) return 1;
			return typeof op.insert === "string" ? op.insert.length : 1;
		}
		_Op.length = length;
	})(Op || (Op = {}));
	var Op_default = Op;

// packages/sync/build-module/quill-delta/OpIterator.mjs
	var Iterator$1 = class {
		ops;
		index;
		offset;
		constructor(ops) {
			this.ops = ops;
			this.index = 0;
			this.offset = 0;
		}
		hasNext() {
			return this.peekLength() < Infinity;
		}
		next(length) {
			if (!length) length = Infinity;
			const nextOp = this.ops[this.index];
			if (nextOp) {
				const offset = this.offset;
				const opLength = Op_default.length(nextOp);
				if (length >= opLength - offset) {
					length = opLength - offset;
					this.index += 1;
					this.offset = 0;
				} else this.offset += length;
				if (typeof nextOp.delete === "number") return { delete: length };
				const retOp = {};
				if (nextOp.attributes) retOp.attributes = nextOp.attributes;
				if (typeof nextOp.retain === "number") retOp.retain = length;
				else if (typeof nextOp.retain === "object" && nextOp.retain !== null) retOp.retain = nextOp.retain;
				else if (typeof nextOp.insert === "string") retOp.insert = nextOp.insert.substr(offset, length);
				else retOp.insert = nextOp.insert;
				return retOp;
			}
			return { retain: Infinity };
		}
		peek() {
			return this.ops[this.index];
		}
		peekLength() {
			if (this.ops[this.index]) return Op_default.length(this.ops[this.index]) - this.offset;
			return Infinity;
		}
		peekType() {
			const op = this.ops[this.index];
			if (op) {
				if (typeof op.delete === "number") return "delete";
				else if (typeof op.retain === "number" || typeof op.retain === "object" && op.retain !== null) return "retain";
				return "insert";
			}
			return "retain";
		}
		rest() {
			if (!this.hasNext()) return [];
			else if (this.offset === 0) return this.ops.slice(this.index);
			const offset = this.offset;
			const index = this.index;
			const next = this.next();
			const rest = this.ops.slice(this.index);
			this.offset = offset;
			this.index = index;
			return [next].concat(rest);
		}
	};

// packages/sync/build-module/quill-delta/Delta.mjs
	function cloneDeep(value) {
		return JSON.parse(JSON.stringify(value));
	}
	const NULL_CHARACTER = String.fromCharCode(0);
	const STRING_TOO_LARGE_THRESHOLD = 1e4;
	/**
	* Normalize diff changes so that `count` reflects UTF-16 code-unit length
	* rather than grapheme-cluster count (which diffChars may return when
	* Intl.Segmenter is available, e.g. diff v8+).
	*
	* @param changes - The array of changes from diffChars.
	* @return The changes with `count` normalized to UTF-16 code-unit length.
	*/
	function normalizeChangeCounts(changes) {
		return changes.map((change) => ({
			...change,
			count: change.value.length
		}));
	}
	const getEmbedTypeAndData = (a, b) => {
		if (typeof a !== "object" || a === null) throw new Error(`cannot retain a ${typeof a}`);
		if (typeof b !== "object" || b === null) throw new Error(`cannot retain a ${typeof b}`);
		const embedType = Object.keys(a)[0];
		if (!embedType || embedType !== Object.keys(b)[0]) throw new Error(`embed types not matched: ${embedType} != ${Object.keys(b)[0]}`);
		return [
			embedType,
			a[embedType],
			b[embedType]
		];
	};
	var Delta = class Delta {
		static Op = Op_default;
		static OpIterator = Iterator$1;
		static AttributeMap = AttributeMap_default;
		static handlers = {};
		static registerEmbed(embedType, handler) {
			this.handlers[embedType] = handler;
		}
		static unregisterEmbed(embedType) {
			delete this.handlers[embedType];
		}
		static getHandler(embedType) {
			const handler = this.handlers[embedType];
			if (!handler) throw new Error(`no handlers for embed type "${embedType}"`);
			return handler;
		}
		ops;
		constructor(ops) {
			if (Array.isArray(ops)) this.ops = ops;
			else if (ops !== null && ops !== void 0 && Array.isArray(ops.ops)) this.ops = ops.ops;
			else this.ops = [];
		}
		insert(arg, attributes) {
			const newOp = {};
			if (typeof arg === "string" && arg.length === 0) return this;
			newOp.insert = arg;
			if (attributes !== null && attributes !== void 0 && typeof attributes === "object" && Object.keys(attributes).length > 0) newOp.attributes = attributes;
			return this.push(newOp);
		}
		delete(length) {
			if (length <= 0) return this;
			return this.push({ delete: length });
		}
		retain(length, attributes) {
			if (typeof length === "number" && length <= 0) return this;
			const newOp = { retain: length };
			if (attributes !== null && attributes !== void 0 && typeof attributes === "object" && Object.keys(attributes).length > 0) newOp.attributes = attributes;
			return this.push(newOp);
		}
		push(newOp) {
			let index = this.ops.length;
			let lastOp = this.ops[index - 1];
			newOp = cloneDeep(newOp);
			if (typeof lastOp === "object") {
				if (typeof newOp.delete === "number" && typeof lastOp.delete === "number") {
					this.ops[index - 1] = { delete: lastOp.delete + newOp.delete };
					return this;
				}
				if (typeof lastOp.delete === "number" && newOp.insert !== null && newOp.insert !== void 0) {
					index -= 1;
					lastOp = this.ops[index - 1];
					if (typeof lastOp !== "object") {
						this.ops.unshift(newOp);
						return this;
					}
				}
				if ((0, import_es6.default)(newOp.attributes, lastOp.attributes)) {
					if (typeof newOp.insert === "string" && typeof lastOp.insert === "string") {
						this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
						if (typeof newOp.attributes === "object") this.ops[index - 1].attributes = newOp.attributes;
						return this;
					} else if (typeof newOp.retain === "number" && typeof lastOp.retain === "number") {
						this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
						if (typeof newOp.attributes === "object") this.ops[index - 1].attributes = newOp.attributes;
						return this;
					}
				}
			}
			if (index === this.ops.length) this.ops.push(newOp);
			else this.ops.splice(index, 0, newOp);
			return this;
		}
		chop() {
			const lastOp = this.ops[this.ops.length - 1];
			if (lastOp && typeof lastOp.retain === "number" && !lastOp.attributes) this.ops.pop();
			return this;
		}
		filter(predicate) {
			return this.ops.filter(predicate);
		}
		forEach(predicate) {
			this.ops.forEach(predicate);
		}
		map(predicate) {
			return this.ops.map(predicate);
		}
		partition(predicate) {
			const passed = [];
			const failed = [];
			this.forEach((op) => {
				(predicate(op) ? passed : failed).push(op);
			});
			return [passed, failed];
		}
		reduce(predicate, initialValue) {
			return this.ops.reduce(predicate, initialValue);
		}
		changeLength() {
			return this.reduce((length, elem) => {
				if (elem.insert) return length + Op_default.length(elem);
				else if (elem.delete) return length - elem.delete;
				return length;
			}, 0);
		}
		length() {
			return this.reduce((length, elem) => {
				return length + Op_default.length(elem);
			}, 0);
		}
		slice(start = 0, end = Infinity) {
			const ops = [];
			const iter = new Iterator$1(this.ops);
			let index = 0;
			while (index < end && iter.hasNext()) {
				let nextOp;
				if (index < start) nextOp = iter.next(start - index);
				else {
					nextOp = iter.next(end - index);
					ops.push(nextOp);
				}
				index += Op_default.length(nextOp);
			}
			return new Delta(ops);
		}
		compose(other) {
			const thisIter = new Iterator$1(this.ops);
			const otherIter = new Iterator$1(other.ops);
			const ops = [];
			const firstOther = otherIter.peek();
			if (firstOther !== null && firstOther !== void 0 && typeof firstOther.retain === "number" && (firstOther.attributes === null || firstOther.attributes === void 0)) {
				let firstLeft = firstOther.retain;
				while (thisIter.peekType() === "insert" && thisIter.peekLength() <= firstLeft) {
					firstLeft -= thisIter.peekLength();
					ops.push(thisIter.next());
				}
				if (firstOther.retain - firstLeft > 0) otherIter.next(firstOther.retain - firstLeft);
			}
			const delta = new Delta(ops);
			while (thisIter.hasNext() || otherIter.hasNext()) if (otherIter.peekType() === "insert") delta.push(otherIter.next());
			else if (thisIter.peekType() === "delete") delta.push(thisIter.next());
			else {
				const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
				const thisOp = thisIter.next(length);
				const otherOp = otherIter.next(length);
				if (otherOp.retain) {
					const newOp = {};
					if (typeof thisOp.retain === "number") newOp.retain = typeof otherOp.retain === "number" ? length : otherOp.retain;
					else if (typeof otherOp.retain === "number") {
						if (thisOp.retain === null || thisOp.retain === void 0) newOp.insert = thisOp.insert;
						else newOp.retain = thisOp.retain;
					} else {
						const action = thisOp.retain === null || thisOp.retain === void 0 ? "insert" : "retain";
						const [embedType, thisData, otherData] = getEmbedTypeAndData(thisOp[action], otherOp.retain);
						const handler = Delta.getHandler(embedType);
						newOp[action] = { [embedType]: handler.compose(thisData, otherData, action === "retain") };
					}
					const attributes = AttributeMap_default.compose(thisOp.attributes, otherOp.attributes, typeof thisOp.retain === "number");
					if (attributes) newOp.attributes = attributes;
					delta.push(newOp);
					if (!otherIter.hasNext() && (0, import_es6.default)(delta.ops[delta.ops.length - 1], newOp)) {
						const rest = new Delta(thisIter.rest());
						return delta.concat(rest).chop();
					}
				} else if (typeof otherOp.delete === "number" && (typeof thisOp.retain === "number" || typeof thisOp.retain === "object" && thisOp.retain !== null)) delta.push(otherOp);
			}
			return delta.chop();
		}
		concat(other) {
			const delta = new Delta(this.ops.slice());
			if (other.ops.length > 0) {
				delta.push(other.ops[0]);
				delta.ops = delta.ops.concat(other.ops.slice(1));
			}
			return delta;
		}
		diff(other) {
			if (this.ops === other.ops) return new Delta();
			const strings = this.deltasToStrings(other);
			const diffResult = normalizeChangeCounts(diffChars(strings[0], strings[1]));
			const thisIter = new Iterator$1(this.ops);
			const otherIter = new Iterator$1(other.ops);
			return this.convertChangesToDelta(diffResult, thisIter, otherIter).chop();
		}
		eachLine(predicate, newline = "\n") {
			const iter = new Iterator$1(this.ops);
			let line = new Delta();
			let i = 0;
			while (iter.hasNext()) {
				if (iter.peekType() !== "insert") return;
				const thisOp = iter.peek();
				const start = Op_default.length(thisOp) - iter.peekLength();
				const index = typeof thisOp.insert === "string" ? thisOp.insert.indexOf(newline, start) - start : -1;
				if (index < 0) line.push(iter.next());
				else if (index > 0) line.push(iter.next(index));
				else {
					if (predicate(line, iter.next(1).attributes || {}, i) === false) return;
					i += 1;
					line = new Delta();
				}
			}
			if (line.length() > 0) predicate(line, {}, i);
		}
		invert(base) {
			const inverted = new Delta();
			this.reduce((baseIndex, op) => {
				if (op.insert) inverted.delete(Op_default.length(op));
				else if (typeof op.retain === "number" && (op.attributes === null || op.attributes === void 0)) {
					inverted.retain(op.retain);
					return baseIndex + op.retain;
				} else if (op.delete || typeof op.retain === "number") {
					const length = op.delete || op.retain;
					base.slice(baseIndex, baseIndex + length).forEach((baseOp) => {
						if (op.delete) inverted.push(baseOp);
						else if (op.retain && op.attributes) inverted.retain(Op_default.length(baseOp), AttributeMap_default.invert(op.attributes, baseOp.attributes));
					});
					return baseIndex + length;
				} else if (typeof op.retain === "object" && op.retain !== null) {
					const slice = base.slice(baseIndex, baseIndex + 1);
					const baseOp = new Iterator$1(slice.ops).next();
					const [embedType, opData, baseOpData] = getEmbedTypeAndData(op.retain, baseOp.insert);
					const handler = Delta.getHandler(embedType);
					inverted.retain({ [embedType]: handler.invert(opData, baseOpData) }, AttributeMap_default.invert(op.attributes, baseOp.attributes));
					return baseIndex + 1;
				}
				return baseIndex;
			}, 0);
			return inverted.chop();
		}
		transform(arg, priority = false) {
			priority = !!priority;
			if (typeof arg === "number") return this.transformPosition(arg, priority);
			const other = arg;
			const thisIter = new Iterator$1(this.ops);
			const otherIter = new Iterator$1(other.ops);
			const delta = new Delta();
			while (thisIter.hasNext() || otherIter.hasNext()) if (thisIter.peekType() === "insert" && (priority || otherIter.peekType() !== "insert")) delta.retain(Op_default.length(thisIter.next()));
			else if (otherIter.peekType() === "insert") delta.push(otherIter.next());
			else {
				const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
				const thisOp = thisIter.next(length);
				const otherOp = otherIter.next(length);
				if (thisOp.delete) continue;
				else if (otherOp.delete) delta.push(otherOp);
				else {
					const thisData = thisOp.retain;
					const otherData = otherOp.retain;
					let transformedData = typeof otherData === "object" && otherData !== null ? otherData : length;
					if (typeof thisData === "object" && thisData !== null && typeof otherData === "object" && otherData !== null) {
						const embedType = Object.keys(thisData)[0];
						if (embedType === Object.keys(otherData)[0]) {
							const handler = Delta.getHandler(embedType);
							if (handler) transformedData = { [embedType]: handler.transform(thisData[embedType], otherData[embedType], priority) };
						}
					}
					delta.retain(transformedData, AttributeMap_default.transform(thisOp.attributes, otherOp.attributes, priority));
				}
			}
			return delta.chop();
		}
		transformPosition(index, priority = false) {
			priority = !!priority;
			const thisIter = new Iterator$1(this.ops);
			let offset = 0;
			while (thisIter.hasNext() && offset <= index) {
				const length = thisIter.peekLength();
				const nextType = thisIter.peekType();
				thisIter.next();
				if (nextType === "delete") {
					index -= Math.min(length, index - offset);
					continue;
				} else if (nextType === "insert" && (offset < index || !priority)) index += length;
				offset += length;
			}
			return index;
		}
		/**
		* Given a Delta and a cursor position, do a diff and attempt to adjust
		* the diff to place insertions or deletions at the cursor position.
		*
		* @todo There are at least a few known cases where this produces a corrupted
		*       diff. When this is fixed, it should not be necessary to verify that the
		*       transformed diff applies cleanly.
		*
		* @see import("@wordpress/core-data/src/utils/crdt-blocks").mergeRichTextUpdate()
		*
		* @param other             - The other Delta to diff against.
		* @param cursorAfterChange - The cursor position index after the change.
		* @return A Delta that attempts to place insertions or deletions at the cursor position.
		*/
		diffWithCursor(other, cursorAfterChange) {
			if (this.ops === other.ops) return new Delta();
			const strings = this.deltasToStrings(other);
			if (Math.max(...strings.map((str) => str.length)) > STRING_TOO_LARGE_THRESHOLD) {
				const diffResult = normalizeChangeCounts(diffLines(strings[0], strings[1]));
				const thisIterLarge = new Iterator$1(this.ops);
				const otherIterLarge = new Iterator$1(other.ops);
				return this.convertChangesToDelta(diffResult, thisIterLarge, otherIterLarge).chop();
			} else if (cursorAfterChange === null) return this.diff(other);
			let diffs = normalizeChangeCounts(diffChars(strings[0], strings[1]));
			let lastDiffPosition = 0;
			const adjustedDiffs = [];
			for (let i = 0; i < diffs.length; i++) {
				const diff = diffs[i];
				const segmentStart = lastDiffPosition;
				const segmentEnd = lastDiffPosition + (diff.count ?? 0);
				const isCursorInSegment = cursorAfterChange > segmentStart && cursorAfterChange <= segmentEnd;
				const isUnchangedSegment = !diff.added && !diff.removed;
				const isRemovalSegment = diff.removed && !diff.added;
				const nextDiff = diffs[i + 1];
				const isNextDiffAnInsert = nextDiff && nextDiff.added && !nextDiff.removed;
				if (isUnchangedSegment && isCursorInSegment && isNextDiffAnInsert) {
					const movedSegments = this.tryMoveInsertionToCursor(diff, nextDiff, cursorAfterChange, segmentStart);
					if (movedSegments) {
						adjustedDiffs.push(...movedSegments);
						i++;
						lastDiffPosition = segmentEnd;
						continue;
					}
				}
				if (isRemovalSegment) {
					const movedSegments = this.tryMoveDeletionToCursor(diff, adjustedDiffs, cursorAfterChange, lastDiffPosition);
					if (movedSegments) {
						adjustedDiffs.pop();
						adjustedDiffs.push(...movedSegments);
						lastDiffPosition += diff.count ?? 0;
						continue;
					}
				}
				adjustedDiffs.push(diff);
				if (!diff.added) lastDiffPosition += diff.count ?? 0;
			}
			diffs = adjustedDiffs;
			const thisIter = new Iterator$1(this.ops);
			const otherIter = new Iterator$1(other.ops);
			return this.convertChangesToDelta(diffs, thisIter, otherIter).chop();
		}
		/**
		* Try to move an insertion operation from after an unchanged segment to the cursor position within it.
		* This is a "look-ahead" strategy.
		*
		* @param diff              - The current unchanged diff segment.
		* @param nextDiff          - The next diff segment (expected to be an insertion).
		* @param cursorAfterChange - The cursor position after the change.
		* @param segmentStart      - The start position of the current segment.
		* @return An array of adjusted diff segments if the insertion was successfully moved, null otherwise.
		*/
		tryMoveInsertionToCursor(diff, nextDiff, cursorAfterChange, segmentStart) {
			const nextDiffInsert = nextDiff.value;
			const insertLength = nextDiffInsert.length;
			const insertOffset = cursorAfterChange - segmentStart - insertLength;
			if (!(diff.value.substring(insertOffset, insertOffset + nextDiffInsert.length) === nextDiffInsert)) return null;
			const beforeCursor = diff.value.substring(0, insertOffset);
			const afterCursor = diff.value.substring(insertOffset);
			const result = [];
			if (beforeCursor.length > 0) result.push({
				value: beforeCursor,
				count: beforeCursor.length,
				added: false,
				removed: false
			});
			result.push(nextDiff);
			if (afterCursor.length > 0) result.push({
				value: afterCursor,
				count: afterCursor.length,
				added: false,
				removed: false
			});
			return result;
		}
		/**
		* Try to move a deletion operation to the cursor position by looking back at the previous unchanged segment.
		* This is a "look-back" strategy.
		*
		* @param diff              - The current deletion diff segment.
		* @param adjustedDiffs     - The array of previously processed diff segments.
		* @param cursorAfterChange - The cursor position after the change.
		* @param lastDiffPosition  - The position in the document up to (but not including) the current diff.
		* @return An array of adjusted diff segments if the deletion was successfully moved, null otherwise.
		*/
		tryMoveDeletionToCursor(diff, adjustedDiffs, cursorAfterChange, lastDiffPosition) {
			const prevDiff = adjustedDiffs[adjustedDiffs.length - 1];
			if (!prevDiff || prevDiff.added || prevDiff.removed) return null;
			const prevSegmentStart = lastDiffPosition - (prevDiff.count ?? 0);
			if (cursorAfterChange < prevSegmentStart || cursorAfterChange >= lastDiffPosition) return null;
			const deletedChars = diff.value;
			const deleteOffset = cursorAfterChange - prevSegmentStart;
			if (!(prevDiff.value.substring(deleteOffset, deleteOffset + deletedChars.length) === deletedChars)) return null;
			const beforeCursor = prevDiff.value.substring(0, deleteOffset);
			const atAndAfterCursor = prevDiff.value.substring(deleteOffset);
			const deletionLength = diff.count ?? 0;
			const afterDeletion = atAndAfterCursor.substring(deletionLength);
			const result = [];
			if (beforeCursor.length > 0) result.push({
				value: beforeCursor,
				count: beforeCursor.length,
				added: false,
				removed: false
			});
			result.push(diff);
			if (afterDeletion.length > 0) result.push({
				value: afterDeletion,
				count: afterDeletion.length,
				added: false,
				removed: false
			});
			return result;
		}
		/**
		* Convert two Deltas to string representations for diffing.
		*
		* @param other - The other Delta to convert.
		* @return A tuple of [thisString, otherString].
		*/
		deltasToStrings(other) {
			return [this, other].map((delta) => {
				return delta.map((op) => {
					if (op.insert !== null || op.insert !== void 0) return typeof op.insert === "string" ? op.insert : NULL_CHARACTER;
					throw new Error("diff() called " + (delta === other ? "on" : "with") + " non-document");
				}).join("");
			});
		}
		/**
		* Process diff changes and convert them to Delta operations.
		*
		* @param changes   - The array of changes from the diff algorithm.
		* @param thisIter  - Iterator for this Delta's operations.
		* @param otherIter - Iterator for the other Delta's operations.
		* @return A Delta containing the processed diff operations.
		*/
		convertChangesToDelta(changes, thisIter, otherIter) {
			const retDelta = new Delta();
			changes.forEach((component) => {
				let length = component.count ?? 0;
				while (length > 0) {
					let opLength = 0;
					if (component.added) {
						opLength = Math.min(otherIter.peekLength(), length);
						retDelta.push(otherIter.next(opLength));
					} else if (component.removed) {
						opLength = Math.min(length, thisIter.peekLength());
						thisIter.next(opLength);
						retDelta.delete(opLength);
					} else {
						opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
						const thisOp = thisIter.next(opLength);
						const otherOp = otherIter.next(opLength);
						if ((0, import_es6.default)(thisOp.insert, otherOp.insert)) retDelta.retain(opLength, AttributeMap_default.diff(thisOp.attributes, otherOp.attributes));
						else retDelta.push(otherOp).delete(opLength);
					}
					length -= opLength;
				}
			});
			return retDelta;
		}
	};

// packages/core-data/build-module/entity-sync.mjs
	let registeredManager;
	/**
	* Registers the entity sync manager. Only one can be active. The first
	* registration wins: a later call with a different manager is ignored and
	* warns in development. To swap managers, unregister the current one first.
	*
	* @param manager The manager to register.
	* @return A function that unregisters this manager. When the registration
	*         was ignored because another manager is active, it does nothing.
	*/
	function registerEntitySyncManager(manager) {
		if (registeredManager && registeredManager !== manager) {
			(0, _wordpress_warning.default)("registerEntitySyncManager: an entity sync manager is already registered. The new manager was ignored.");
			return () => {};
		}
		registeredManager = manager;
		return () => {
			if (registeredManager === manager) registeredManager = void 0;
		};
	}
	/**
	* Returns the registered entity sync manager, if any.
	*
	* @return The manager, or undefined when none is registered.
	*/
	function getEntitySyncManager() {
		return registeredManager;
	}

// node_modules/.store/tslib@2.8.1-LT-dxu1EkVy7OUDyVf5glQ/node_modules/tslib/tslib.es6.mjs
	var __assign = function() {
		__assign = Object.assign || function __assign(t) {
			for (var s, i = 1, n = arguments.length; i < n; i++) {
				s = arguments[i];
				for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
			}
			return t;
		};
		return __assign.apply(this, arguments);
	};

// node_modules/.store/lower-case@2.0.2-5YZP5nczP5_f_8Vt5KBPjA/node_modules/lower-case/dist.es2015/index.js
/**
	* Lower case as a function.
	*/
	function lowerCase(str) {
		return str.toLowerCase();
	}

// node_modules/.store/no-case@3.0.4-R4Hzt6qn-erEsTak7ojDpg/node_modules/no-case/dist.es2015/index.js
	var DEFAULT_SPLIT_REGEXP = [/([a-z0-9])([A-Z])/g, /([A-Z])([A-Z][a-z])/g];
	var DEFAULT_STRIP_REGEXP = /[^A-Z0-9]+/gi;
	/**
	* Normalize the string into something other libraries can manipulate easier.
	*/
	function noCase(input, options) {
		if (options === void 0) options = {};
		var _a = options.splitRegexp, splitRegexp = _a === void 0 ? DEFAULT_SPLIT_REGEXP : _a, _b = options.stripRegexp, stripRegexp = _b === void 0 ? DEFAULT_STRIP_REGEXP : _b, _c = options.transform, transform = _c === void 0 ? lowerCase : _c, _d = options.delimiter, delimiter = _d === void 0 ? " " : _d;
		var result = replace(replace(input, splitRegexp, "$1\0$2"), stripRegexp, "\0");
		var start = 0;
		var end = result.length;
		while (result.charAt(start) === "\0") start++;
		while (result.charAt(end - 1) === "\0") end--;
		return result.slice(start, end).split("\0").map(transform).join(delimiter);
	}
	/**
	* Replace `re` in the input string with the replacement value.
	*/
	function replace(input, re, value) {
		if (re instanceof RegExp) return input.replace(re, value);
		return re.reduce(function(input, re) {
			return input.replace(re, value);
		}, input);
	}

// node_modules/.store/pascal-case@3.1.2-khtSA9hpCTEVLYfMgyRdoA/node_modules/pascal-case/dist.es2015/index.js
	function pascalCaseTransform(input, index) {
		var firstChar = input.charAt(0);
		var lowerChars = input.substr(1).toLowerCase();
		if (index > 0 && firstChar >= "0" && firstChar <= "9") return "_" + firstChar + lowerChars;
		return "" + firstChar.toUpperCase() + lowerChars;
	}
	function pascalCase(input, options) {
		if (options === void 0) options = {};
		return noCase(input, __assign({
			delimiter: "",
			transform: pascalCaseTransform
		}, options));
	}

// node_modules/.store/camel-case@4.1.2-5Gz5buNb7xjdcDcS4uJ7xw/node_modules/camel-case/dist.es2015/index.js
	function camelCaseTransform(input, index) {
		if (index === 0) return input.toLowerCase();
		return pascalCaseTransform(input, index);
	}
	function camelCase(input, options) {
		if (options === void 0) options = {};
		return pascalCase(input, __assign({ transform: camelCaseTransform }, options));
	}

// node_modules/.store/upper-case-first@2.0.2-gj8G2jcL821LJ7crhULHjQ/node_modules/upper-case-first/dist.es2015/index.js
/**
	* Upper case the first character of an input string.
	*/
	function upperCaseFirst(input) {
		return input.charAt(0).toUpperCase() + input.substr(1);
	}

// node_modules/.store/capital-case@1.0.4-EVMMP2kRcoYmFbV1LUR_-w/node_modules/capital-case/dist.es2015/index.js
	function capitalCaseTransform(input) {
		return upperCaseFirst(input.toLowerCase());
	}
	function capitalCase(input, options) {
		if (options === void 0) options = {};
		return noCase(input, __assign({
			delimiter: " ",
			transform: capitalCaseTransform
		}, options));
	}

// packages/core-data/build-module/awareness/config.mjs
/**
	* Delay in milliseconds before removing a collaborator from presence indicators.
	*/
	const REMOVAL_DELAY_IN_MS = 5e3;

// packages/core-data/build-module/awareness/utils.mjs
/**
	* Get the browser name from the user agent.
	* @return The browser name.
	*/
	function getBrowserName() {
		const userAgent = window.navigator.userAgent;
		let browserName = "Unknown";
		if (userAgent.includes("Firefox")) browserName = "Firefox";
		else if (userAgent.includes("Edg")) browserName = "Microsoft Edge";
		else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) browserName = "Chrome";
		else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browserName = "Safari";
		else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) browserName = "Internet Explorer";
		else if (userAgent.includes("Opera") || userAgent.includes("OPR")) browserName = "Opera";
		return browserName;
	}
	function areMapsEqual(map1, map2, comparatorFn) {
		if (map1.size !== map2.size) return false;
		for (const [key, value1] of map1.entries()) {
			if (!map2.has(key)) return false;
			if (!comparatorFn(value1, map2.get(key))) return false;
		}
		return true;
	}
	/**
	* Check if two collaborator infos are equal.
	*
	* @param collaboratorInfo1 - The first collaborator info.
	* @param collaboratorInfo2 - The second collaborator info.
	* @return True if the collaborator infos are equal, false otherwise.
	*/
	function areCollaboratorInfosEqual(collaboratorInfo1, collaboratorInfo2) {
		if (!collaboratorInfo1 || !collaboratorInfo2) return collaboratorInfo1 === collaboratorInfo2;
		if (Object.keys(collaboratorInfo1).length !== Object.keys(collaboratorInfo2).length) return false;
		return Object.entries(collaboratorInfo1).every(([key, value]) => {
			return value === collaboratorInfo2[key];
		});
	}
	function hasValidAvatarUrls(value) {
		if ("object" !== typeof value || null === value || Array.isArray(value)) return false;
		return [
			"24",
			"48",
			"96"
		].every((size) => !(size in value) || "string" === typeof value[size]);
	}
	/**
	* Check that awareness information contains the fields required to present a
	* collaborator. Awareness is supplied by peers, so its runtime shape cannot be
	* guaranteed by the local TypeScript type.
	*
	* @param value - The collaborator information to check.
	* @return Whether the collaborator can be presented safely.
	*/
	function isCollaboratorInfo(value) {
		if ("object" !== typeof value || null === value) return false;
		return "id" in value && "name" in value && "slug" in value && "browserType" in value && "enteredAt" in value && (null === value.id || "number" === typeof value.id && Number.isInteger(value.id) && value.id > 0) && "string" === typeof value.name && "" !== value.name.trim() && "string" === typeof value.slug && (!("avatar_urls" in value) || hasValidAvatarUrls(value.avatar_urls)) && "string" === typeof value.browserType && "number" === typeof value.enteredAt && Number.isFinite(value.enteredAt);
	}
	/**
	* Generate a collaborator info object from a current collaborator.
	*
	* @param currentCollaborator - The current collaborator, when available.
	* @param clientId            - The Yjs client ID used for fallback identity.
	* @return The collaborator info object.
	*/
	function generateCollaboratorInfo(currentCollaborator, clientId) {
		const presentationInfo = {
			browserType: getBrowserName(),
			enteredAt: Date.now()
		};
		if ("object" === typeof currentCollaborator && currentCollaborator) {
			const user = currentCollaborator;
			if ("id" in user && "name" in user) {
				const collaboratorInfo = {
					...presentationInfo,
					..."avatar_urls" in user && hasValidAvatarUrls(user.avatar_urls) ? { avatar_urls: user.avatar_urls } : {},
					id: user.id,
					name: user.name,
					slug: "slug" in user && "string" === typeof user.slug ? user.slug : ""
				};
				if (isCollaboratorInfo(collaboratorInfo) && null !== collaboratorInfo.id) return collaboratorInfo;
			}
		}
		return {
			...presentationInfo,
			id: null,
			name: "Anonymous User",
			slug: `anonymous-${clientId}`
		};
	}
	function getRecordValue(obj, key) {
		if ("object" === typeof obj && null !== obj && key in obj) return obj[key];
		return null;
	}
	function getTypedKeys(obj) {
		return Object.keys(obj);
	}

// packages/core-data/build-module/awareness/typed-awareness.mjs
/**
	* Extended Awareness class with typed state accessors.
	*/
	var TypedAwareness = class extends Awareness {
		/**
		* Get the states from an awareness document.
		*/
		getStates() {
			return super.getStates();
		}
		/**
		* Get a local state field from an awareness document.
		* @param field
		*/
		getLocalStateField(field) {
			const state = this.getLocalState();
			return getRecordValue(state, field);
		}
		/**
		* Set a local state field on an awareness document.
		* @param field
		* @param value
		*/
		setLocalStateField(field, value) {
			super.setLocalStateField(field, value);
		}
	};

// packages/core-data/build-module/awareness/awareness-state.mjs
	var AwarenessWithEqualityChecks = class extends TypedAwareness {
		/** OVERRIDDEN METHODS */
		/**
		* Set a local state field on an awareness document. Calling this method may
		* trigger rerenders of any subscribed components.
		*
		* Equality checks are provided by the abstract `equalityFieldChecks` property.
		* @param field - The field to set.
		* @param value - The value to set.
		*/
		setLocalStateField(field, value) {
			if (this.isFieldEqual(field, value, this.getLocalStateField(field) ?? void 0)) return;
			super.setLocalStateField(field, value);
		}
		/** CUSTOM METHODS */
		/**
		* Determine if a field value has changed using the provided equality checks.
		* @param field  - The field to check.
		* @param value1 - The first value to compare.
		* @param value2 - The second value to compare.
		*/
		isFieldEqual(field, value1, value2) {
			if ([
				"clientId",
				"isConnected",
				"isMe"
			].includes(field)) return value1 === value2;
			if (field in this.equalityFieldChecks) {
				const fn = this.equalityFieldChecks[field];
				return fn(value1, value2);
			}
			throw new Error(`No equality check implemented for awareness state field "${field.toString()}".`);
		}
		/**
		* Determine if two states are equal by comparing each field using the
		* provided equality checks.
		* @param state1 - The first state to compare.
		* @param state2 - The second state to compare.
		*/
		isStateEqual(state1, state2) {
			return [.../* @__PURE__ */ new Set([...getTypedKeys(state1), ...getTypedKeys(state2)])].every((field) => {
				const value1 = state1[field];
				const value2 = state2[field];
				return this.isFieldEqual(field, value1, value2);
			});
		}
	};
	/**
	* Abstract class to manage awareness and allow external code to subscribe to
	* state updates.
	*/
	var AwarenessState = class extends AwarenessWithEqualityChecks {
		/** CUSTOM PROPERTIES */
		/**
		* Whether the setUp method has been called, to avoid running it multiple
		* times.
		*/
		hasSetupRun = false;
		/**
		* We keep track of all seen states during the current session for two reasons:
		*
		* 1. So that we can represent recently disconnected collaborators in our UI, even
		*    after they have been removed from the awareness document.
		* 2. So that we can provide debug information about all collaborators seen during
		*    the session.
		*/
		disconnectedCollaborators = /* @__PURE__ */ new Set();
		seenStates = /* @__PURE__ */ new Map();
		/**
		* Hold a snapshot of the previous awareness state allows us to compare the
		* state values and avoid unnecessary updates to subscribers.
		*/
		previousSnapshot = /* @__PURE__ */ new Map();
		stateSubscriptions = [];
		/**
		* In some cases, we may want to throttle setting local state fields to avoid
		* overwhelming the awareness document with rapid updates. At the same time, we
		* want to ensure that when we read our own state locally, we get the latest
		* value -- even if it hasn't yet been set on the awareness instance.
		*/
		myThrottledState = {};
		throttleTimeouts = /* @__PURE__ */ new Map();
		/** CUSTOM METHODS */
		/**
		* Set up the awareness state. This method is idempotent and will only run
		* once. Subclasses should override `onSetUp()` instead of this method to
		* add their own setup logic.
		*
		* This is defined as a readonly arrow function property to prevent
		* subclasses from overriding it.
		*/
		setUp = () => {
			if (this.hasSetupRun) return;
			this.hasSetupRun = true;
			this.onSetUp();
			this.on("change", ({ added, removed, updated }) => {
				[...added, ...updated].forEach((id) => {
					this.disconnectedCollaborators.delete(id);
				});
				removed.forEach((id) => {
					this.disconnectedCollaborators.add(id);
					setTimeout(() => {
						this.disconnectedCollaborators.delete(id);
						this.updateSubscribers(true);
					}, REMOVAL_DELAY_IN_MS);
				});
				this.updateSubscribers();
			});
		};
		/**
		* Get the most recent state from the last processed change event.
		*
		* @return An array of EnhancedState< State >.
		*/
		getCurrentState() {
			return Array.from(this.previousSnapshot.values());
		}
		/**
		* Get all seen states in this session to enable debug reporting.
		*/
		getSeenStates() {
			return this.seenStates;
		}
		/**
		* Allow external code to subscribe to awareness state changes.
		* @param callback - The callback to subscribe to.
		*/
		onStateChange(callback) {
			this.stateSubscriptions.push(callback);
			return () => {
				this.stateSubscriptions = this.stateSubscriptions.filter((cb) => cb !== callback);
			};
		}
		/**
		* Set a local state field on an awareness document with throttle. See caveats
		* of this.setLocalStateField.
		* @param field - The field to set.
		* @param value - The value to set.
		* @param wait  - The wait time in milliseconds.
		*/
		setThrottledLocalStateField(field, value, wait) {
			this.setLocalStateField(field, value);
			this.throttleTimeouts.set(field, setTimeout(() => {
				this.throttleTimeouts.delete(field);
				if (this.myThrottledState[field]) {
					this.setLocalStateField(field, this.myThrottledState[field]);
					delete this.myThrottledState[field];
				}
			}, wait));
		}
		/**
		* Set the current collaborator's connection status as awareness state.
		* @param isConnected - The connection status.
		*/
		setConnectionStatus(isConnected) {
			if (isConnected) this.disconnectedCollaborators.delete(this.clientID);
			else this.disconnectedCollaborators.add(this.clientID);
			this.updateSubscribers(true);
		}
		/**
		* Update all subscribed listeners with the latest awareness state.
		* @param forceUpdate - Whether to force an update.
		*/
		updateSubscribers(forceUpdate = false) {
			if (!this.stateSubscriptions.length) return;
			const states = this.getStates();
			this.seenStates = new Map([...this.seenStates.entries(), ...states.entries()]);
			const updatedStates = new Map([...this.disconnectedCollaborators, ...states.keys()].filter((clientId) => {
				return Object.keys(this.seenStates.get(clientId) ?? {}).length > 0;
			}).map((clientId) => {
				const rawState = this.seenStates.get(clientId);
				const isConnected = !this.disconnectedCollaborators.has(clientId);
				const isMe = clientId === this.clientID;
				const myState = isMe ? this.myThrottledState : {};
				return [clientId, {
					...rawState,
					...myState,
					clientId,
					isConnected,
					isMe
				}];
			}));
			if (!forceUpdate) {
				if (areMapsEqual(this.previousSnapshot, updatedStates, this.isStateEqual.bind(this))) return;
			}
			this.previousSnapshot = updatedStates;
			this.stateSubscriptions.forEach((callback) => {
				callback(Array.from(updatedStates.values()));
			});
		}
	};

// packages/core-data/build-module/name.mjs
/**
	* The reducer key used by core data in store registration.
	* This is defined in a separate file to avoid cycle-dependency
	*/
	const STORE_NAME = "core";

// packages/core-data/build-module/awareness/base-awareness.mjs
	var BaseAwarenessState = class extends AwarenessState {
		onSetUp() {
			this.setCurrentCollaboratorInfo();
		}
		/**
		* Set the current collaborator info in the local state.
		*/
		async setCurrentCollaboratorInfo() {
			let currentUser;
			try {
				currentUser = await (0, _wordpress_data.resolveSelect)(STORE_NAME).getCurrentUser();
			} catch {}
			this.setLocalStateField("collaboratorInfo", generateCollaboratorInfo(currentUser, this.clientID));
		}
	};
	const baseEqualityFieldChecks = { collaboratorInfo: areCollaboratorInfosEqual };
	var BaseAwareness = class extends BaseAwarenessState {
		equalityFieldChecks = baseEqualityFieldChecks;
	};

// packages/core-data/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/core-data");

// packages/core-data/build-module/awareness/block-lookup.mjs
/**
	* Find the block Y.Map that contains a nested Yjs type.
	*
	* Rich-text attributes are often stored directly at attributes.content, but
	* blocks can also store rich text deeper inside object or array attributes.
	* Walk upward until we find the block map instead of assuming a fixed parent
	* depth.
	*
	* @param yType - The nested Yjs type to start from.
	* @return The containing block Y.Map, or null if no block ancestor exists.
	*/
	function getContainingBlockYMap(yType) {
		let current = yType;
		while (current) {
			const parent = current.parent;
			if (parent instanceof YMap && parent.parent instanceof YArray && parent.get("clientId") !== void 0 && parent.get("innerBlocks") instanceof YArray) return parent;
			current = parent instanceof AbstractType ? parent : null;
		}
		return null;
	}
	/**
	* Given a Y.Map within a Ydoc, traverse up the Yjs block tree to compute the
	* index path from the root.
	*
	* For example, the second inner block of the first root block returns [0, 1].
	*
	* @param yType - The Yjs block Y.Map to start from.
	* @return The index path from root, or null if traversal fails.
	*/
	function getBlockPathInYdoc(yType) {
		const path = [];
		let current = yType;
		while (current) {
			const parentArray = current.parent;
			if (!parentArray || !(parentArray instanceof YArray)) return null;
			let index = -1;
			for (let i = 0; i < parentArray.length; i++) if (parentArray.get(i) === current) {
				index = i;
				break;
			}
			if (index === -1) return null;
			path.unshift(index);
			const grandparent = parentArray.parent;
			if (grandparent instanceof YMap && grandparent.get("clientId") !== void 0) current = grandparent;
			else break;
		}
		return path;
	}
	/**
	* Navigate the block-editor store's block tree by an index path
	* and return the local block's clientId.
	*
	* @param path   - The index path, e.g. [0, 1] for blocks[0].innerBlocks[1].
	* @param blocks - The tree of block-editor store post contentblocks.
	* @return The local block clientId, or null if the path is invalid.
	*/
	function resolveBlockClientIdByPath(path, blocks) {
		if (path.length === 0) return null;
		for (let i = 0; i < path.length; i++) {
			const block = blocks[path[i]];
			if (!block) return null;
			if (i === path.length - 1) return block.clientId;
			blocks = block.innerBlocks;
		}
		return null;
	}
	/**
	* Find the post content blocks to use as the navigation root.
	*
	* In template mode, the block tree contains template parts wrapping a
	* core/post-content block. The Yjs document only stores the post content
	* blocks, so we need to find the core/post-content block and use
	* getClientIdsTree(clientId) to retrieve its inner blocks from the store.
	*
	* Uses the private getClientIdsTree selector which depends only on
	* state.blocks.order, avoiding unnecessary re-renders when block
	* attributes change (which would happen with getBlocks()).
	*
	* @return The blocks that correspond to the Yjs document root.
	*/
	function usePostContentBlocks() {
		return (0, _wordpress_data.useSelect)((select) => {
			const { getBlocksByName, getClientIdsTree } = unlock(select(_wordpress_block_editor.store));
			const [postContentClientId] = getBlocksByName("core/post-content");
			return getClientIdsTree(postContentClientId ?? "");
		}, []);
	}

// packages/core-data/build-module/utils/crdt-utils.mjs
/**
	* Get or create a root-level Map for the given Y.Doc. Use this instead of
	* doc.getMap() for additional type safety.
	*
	* @param doc Y.Doc
	* @param key Map key
	*/
	function getRootMap(doc, key) {
		return doc.getMap(key);
	}
	/**
	* Create a new Y.Map (provided with YMapWrap type), optionally initialized with
	* data. Use this instead of `new Y.Map()` for additional type safety.
	*
	* @param partial Partial data to initialize the map with.
	*/
	function createYMap(partial = {}) {
		return new YMap(Object.entries(partial));
	}
	/**
	* Type guard to check if a value is a Y.Map without losing type information.
	*
	* @param value Value to check.
	*/
	function isYMap(value) {
		return value instanceof YMap;
	}
	/**
	* Brand a number as an offset into a RichText’s text content.
	*
	* @param offset The rich-text offset to brand.
	* @return The branded rich-text offset.
	*/
	function asRichTextOffset(offset) {
		return offset;
	}
	/**
	* Brand a number as a string index into serialized HTML.
	*
	* @param index The HTML string index to brand.
	* @return The branded HTML string index.
	*/
	function asHtmlStringIndex(index) {
		return index;
	}
	/**
	* Resolve a selection attribute key to a Y.Text value.
	*
	* RichText identifiers are normally top-level block attribute keys, but nested
	* rich-text fields can provide a dot path such as `body.0.cells.0.content`.
	*
	* @param attributes   The block attributes map.
	* @param attributeKey The top-level attribute key or nested attribute path.
	* @return The matching Y.Text, or null if the path is not a rich-text field.
	*/
	function getYTextByAttributeKey(attributes, attributeKey) {
		const directValue = attributes.get(attributeKey);
		if (directValue instanceof YText) return directValue;
		let value = attributes;
		for (const pathPart of attributeKey.split(".")) if (value instanceof YMap) value = value.get(pathPart);
		else if (value instanceof YArray) {
			const index = Number.parseInt(pathPart, 10);
			if (!Number.isSafeInteger(index) || index < 0 || index.toString() !== pathPart) return null;
			value = value.get(index);
		} else return null;
		return value instanceof YText ? value : null;
	}
	/**
	* Given a block ID and a Y.Doc, find the block in the document.
	*
	* @param blockId The block ID to find
	* @param ydoc    The Y.Doc to find the block in
	* @return The block, or null if the block is not found
	*/
	function findBlockByClientIdInDoc(blockId, ydoc) {
		const blocks = getRootMap(ydoc, CRDT_RECORD_MAP_KEY).get("blocks");
		if (!(blocks instanceof YArray)) return null;
		return findBlockByClientIdInBlocks(blockId, blocks);
	}
	const MARKER_START = 57344;
	/**
	* Pick a marker character that does not appear in `text`. Returns the marker
	* or `null` if all candidates are present (extremely unlikely in practice).
	*
	* @param text The string to check for existing marker characters.
	*/
	function pickMarker(text) {
		for (let code = MARKER_START; code < 57360; code++) {
			const candidate = String.fromCharCode(code);
			if (!text.includes(candidate)) return candidate;
		}
		return null;
	}
	/**
	* Convert an HTML character index (counting tag characters) to a rich-text
	* offset (counting only text characters). Used on read paths where Y.Text
	* resolves to an HTML index but the block editor expects a text offset.
	*
	* @param html      The full HTML string from Y.Text.
	* @param htmlIndex The HTML character index.
	* @return The corresponding rich-text offset.
	*/
	function htmlIndexToRichTextOffset(html, htmlIndex) {
		if (!html.includes("<") && !html.includes("&")) return asRichTextOffset(htmlIndex);
		const marker = pickMarker(html);
		if (!marker) return asRichTextOffset(htmlIndex);
		const withMarker = html.slice(0, htmlIndex) + marker + html.slice(htmlIndex);
		const markerPos = (0, _wordpress_rich_text.create)({ html: withMarker }).text.indexOf(marker);
		return asRichTextOffset(markerPos === -1 ? htmlIndex : markerPos);
	}
	/**
	* Convert a rich-text offset (counting only text characters) to an HTML
	* character index (counting tag characters). Used on write paths where the
	* block editor provides a text offset but Y.Text expects an HTML index.
	*
	* @param html           The full HTML string from Y.Text.
	* @param richTextOffset The rich-text text offset.
	* @return The corresponding HTML character index.
	*/
	function richTextOffsetToHtmlIndex(html, richTextOffset) {
		if (!html.includes("<") && !html.includes("&")) return asHtmlStringIndex(richTextOffset);
		const marker = pickMarker(html);
		if (!marker) return asHtmlStringIndex(richTextOffset);
		const value = (0, _wordpress_rich_text.create)({ html });
		const markerValue = (0, _wordpress_rich_text.create)({ text: marker });
		if (value.formats[richTextOffset]) markerValue.formats[0] = value.formats[richTextOffset];
		const withMarker = (0, _wordpress_rich_text.insert)(value, markerValue, richTextOffset, richTextOffset);
		const markerIndex = (0, _wordpress_rich_text.toHTMLString)({ value: withMarker }).indexOf(marker);
		return asHtmlStringIndex(markerIndex === -1 ? richTextOffset : markerIndex);
	}
	function findBlockByClientIdInBlocks(blockId, blocks) {
		for (const block of blocks) {
			if (block.get("clientId") === blockId) return block;
			const innerBlocks = block.get("innerBlocks");
			if (innerBlocks && innerBlocks.length > 0) {
				const innerBlock = findBlockByClientIdInBlocks(blockId, innerBlocks);
				if (innerBlock) return innerBlock;
			}
		}
		return null;
	}

// packages/core-data/build-module/utils/crdt-user-selections.mjs
/**
	* The type of selection.
	*/
	let SelectionType = /* @__PURE__ */ function(SelectionType) {
		SelectionType["None"] = "none";
		SelectionType["Cursor"] = "cursor";
		SelectionType["SelectionInOneBlock"] = "selection-in-one-block";
		SelectionType["SelectionInMultipleBlocks"] = "selection-in-multiple-blocks";
		SelectionType["WholeBlock"] = "whole-block";
		return SelectionType;
	}({});
	/**
	* The direction of a text selection, indicating where the caret sits.
	*/
	let SelectionDirection = /* @__PURE__ */ function(SelectionDirection) {
		/** The caret is at the end of the selection (default / left-to-right). */
		SelectionDirection["Forward"] = "f";
		/** The caret is at the start of the selection (right-to-left). */
		SelectionDirection["Backward"] = "b";
		return SelectionDirection;
	}({});
	/**
	* Converts WordPress block editor selection to a SelectionState.
	*
	* Uses getBlockPathForLocalClientId to locate blocks in the Yjs document by
	* their tree position (index path) rather than clientId, since clientIds may
	* differ between the block-editor store and the Yjs document (e.g. in "Show
	* Template" mode).
	*
	* @param selectionStart             - The start position of the selection
	* @param selectionEnd               - The end position of the selection
	* @param yDoc                       - The Yjs document
	* @param options                    - Optional parameters
	* @param options.selectionDirection - The direction of the selection (forward or backward)
	* @return The SelectionState
	*/
	function getSelectionState(selectionStart, selectionEnd, yDoc, options) {
		const { selectionDirection } = options ?? {};
		const yBlocks = getRootMap(yDoc, CRDT_RECORD_MAP_KEY).get("blocks");
		const isSelectionEmpty = Object.keys(selectionStart).length === 0;
		const noSelection = { type: "none" };
		if (isSelectionEmpty || !yBlocks) return noSelection;
		const isSelectionInOneBlock = selectionStart.clientId === selectionEnd.clientId;
		const isCursorOnly = isSelectionInOneBlock && selectionStart.offset === selectionEnd.offset;
		if (isSelectionInOneBlock && selectionStart.offset === void 0 && selectionEnd.offset === void 0) {
			const path = getBlockPathForLocalClientId(selectionStart.clientId);
			const blockPosition = path ? createRelativePositionForBlockPath(path, yBlocks) : null;
			if (!blockPosition) return noSelection;
			return {
				type: "whole-block",
				blockPosition
			};
		} else if (isCursorOnly) {
			const cursorPosition = getCursorPosition(selectionStart, yBlocks);
			if (!cursorPosition) return noSelection;
			return {
				type: "cursor",
				cursorPosition
			};
		} else if (isSelectionInOneBlock) {
			const cursorStartPosition = getCursorPosition(selectionStart, yBlocks);
			const cursorEndPosition = getCursorPosition(selectionEnd, yBlocks);
			if (!cursorStartPosition || !cursorEndPosition) return noSelection;
			return {
				type: "selection-in-one-block",
				cursorStartPosition,
				cursorEndPosition,
				selectionDirection
			};
		}
		const startEndpoint = getSelectionEndpoint(selectionStart, yBlocks);
		const endEndpoint = getSelectionEndpoint(selectionEnd, yBlocks);
		if (!startEndpoint || !endEndpoint) return noSelection;
		return {
			type: "selection-in-multiple-blocks",
			startEndpoint,
			endEndpoint,
			selectionDirection
		};
	}
	/**
	* Get the cursor position from a selection.
	*
	* @param selection - The selection.
	* @param blocks    - The blocks to search through.
	* @return The cursor position, or null if not found.
	*/
	function getCursorPosition(selection, blocks) {
		const path = getBlockPathForLocalClientId(selection.clientId);
		const block = path ? findBlockByPath(path, blocks) : null;
		if (!block || !selection.attributeKey || void 0 === selection.offset) return null;
		const attributes = block.get("attributes");
		const currentYText = attributes ? getYTextByAttributeKey(attributes, selection.attributeKey) : null;
		if (!(currentYText instanceof YText)) return null;
		return {
			relativePosition: createRelativePositionFromTypeIndex(currentYText, richTextOffsetToHtmlIndex(currentYText.toString(), asRichTextOffset(selection.offset))),
			absoluteOffset: selection.offset,
			attributeKey: selection.attributeKey
		};
	}
	/**
	* Build a SelectionEndpoint for one side of a multi-block selection.
	*
	* WHY two shapes: Yjs relative positions must be anchored to the right node
	* type. If the block has a RichText field with a known character offset, we
	* anchor to a Y.Text position (CursorEndpoint) so the cursor survives
	* concurrent text edits. If there is no text offset (whole-block selection,
	* or a block type with no RichText), we anchor to the block's index slot in
	* its parent Y.Array (WholeBlockEndpoint) so it survives block insertions and
	* deletions above or below it.
	*
	* @param selection - The WPBlockSelection for this side.
	* @param blocks    - The root-level Yjs blocks array.
	* @return A SelectionEndpoint, or null if the block cannot be located in Yjs.
	*/
	function getSelectionEndpoint(selection, blocks) {
		const cursorPosition = getCursorPosition(selection, blocks);
		if (cursorPosition) return {
			type: "cursor",
			cursorPosition
		};
		const path = getBlockPathForLocalClientId(selection.clientId);
		const blockPosition = path ? createRelativePositionForBlockPath(path, blocks) : null;
		if (blockPosition) return {
			type: "whole-block",
			blockPosition
		};
		return null;
	}
	/**
	* Resolves a local block-editor clientId to its index path relative to the
	* post content blocks. This allows finding the corresponding block in the Yjs
	* document even when clientIds differ (e.g. in "Show Template" mode where
	* blocks are cloned).
	*
	* In template mode, the block tree includes template parts and wrapper blocks
	* around a core/post-content block. The Yjs document only contains the post
	* content blocks, so we stop the upward walk when the parent is
	* core/post-content (its inner blocks correspond to the Yjs root blocks).
	*
	* @param clientId - The local block-editor clientId to resolve.
	* @return The index path from root, or null if not resolvable.
	*/
	function getBlockPathForLocalClientId(clientId) {
		const { getBlockIndex, getBlockRootClientId, getBlockName } = (0, _wordpress_data.select)(_wordpress_block_editor.store);
		const path = [];
		let current = clientId;
		while (current) {
			const index = getBlockIndex(current);
			if (index === -1) return null;
			path.unshift(index);
			const parent = getBlockRootClientId(current);
			if (!parent) break;
			if (getBlockName(parent) === "core/post-content") break;
			current = parent;
		}
		return path.length > 0 ? path : null;
	}
	/**
	* Find a block by navigating a tree index path in the Yjs block hierarchy.
	*
	* @param path   - The index path, e.g. [0, 1] for blocks[0].innerBlocks[1].
	* @param blocks - The root-level Yjs blocks array.
	* @return The block Y.Map if found, null otherwise.
	*/
	function findBlockByPath(path, blocks) {
		let currentBlocks = blocks;
		for (let i = 0; i < path.length; i++) {
			if (path[i] >= currentBlocks.length) return null;
			const block = currentBlocks.get(path[i]);
			if (!block) return null;
			if (i === path.length - 1) return block;
			currentBlocks = block.get("innerBlocks") ?? new YArray();
		}
		return null;
	}
	/**
	* Create a Y.RelativePosition for a block by navigating a tree index path.
	*
	* @param path   - The index path, e.g. [0, 1] for blocks[0].innerBlocks[1].
	* @param blocks - The root-level Yjs blocks array.
	* @return A Y.RelativePosition for the block, or null if the path is invalid.
	*/
	function createRelativePositionForBlockPath(path, blocks) {
		let currentBlocks = blocks;
		for (let i = 0; i < path.length; i++) {
			if (path[i] >= currentBlocks.length) return null;
			if (i === path.length - 1) return createRelativePositionFromTypeIndex(currentBlocks, path[i]);
			currentBlocks = currentBlocks.get(path[i])?.get("innerBlocks") ?? new YArray();
		}
		return null;
	}
	/**
	* Check if two selection states are equal.
	*
	* @param selection1 - The first selection state.
	* @param selection2 - The second selection state.
	* @return True if the selection states are equal, false otherwise.
	*/
	function areSelectionsStatesEqual(selection1, selection2) {
		if (selection1.type !== selection2.type) return false;
		switch (selection1.type) {
			case "none": return true;
			case "cursor": return areCursorPositionsEqual(selection1.cursorPosition, selection2.cursorPosition);
			case "selection-in-one-block": return areCursorPositionsEqual(selection1.cursorStartPosition, selection2.cursorStartPosition) && areCursorPositionsEqual(selection1.cursorEndPosition, selection2.cursorEndPosition) && selection1.selectionDirection === selection2.selectionDirection;
			case "selection-in-multiple-blocks": return areEndpointsEqual(selection1.startEndpoint, selection2.startEndpoint) && areEndpointsEqual(selection1.endEndpoint, selection2.endEndpoint) && selection1.selectionDirection === selection2.selectionDirection;
			case "whole-block": return compareRelativePositions(selection1.blockPosition, selection2.blockPosition);
			default: return false;
		}
	}
	/**
	* Check if two SelectionEndpoints are equal.
	*
	* Endpoints of different kinds (cursor vs whole-block) are never equal.
	*
	* @param ep1 - First endpoint.
	* @param ep2 - Second endpoint.
	* @return True if the endpoints represent the same position.
	*/
	function areEndpointsEqual(ep1, ep2) {
		if (ep1.type !== ep2.type) return false;
		if (ep1.type === "cursor" && ep2.type === "cursor") return areCursorPositionsEqual(ep1.cursorPosition, ep2.cursorPosition);
		return compareRelativePositions(ep1.blockPosition, ep2.blockPosition);
	}
	/**
	* Check if two cursor positions are equal.
	*
	* @param cursorPosition1 - The first cursor position.
	* @param cursorPosition2 - The second cursor position.
	* @return True if the cursor positions are equal, false otherwise.
	*/
	function areCursorPositionsEqual(cursorPosition1, cursorPosition2) {
		const isRelativePositionEqual = compareRelativePositions(cursorPosition1.relativePosition, cursorPosition2.relativePosition);
		const isAbsoluteOffsetEqual = cursorPosition1.absoluteOffset === cursorPosition2.absoluteOffset;
		return isRelativePositionEqual && isAbsoluteOffsetEqual;
	}

// packages/core-data/build-module/awareness/post-editor-awareness.mjs
	var PostEditorAwareness = class extends BaseAwarenessState {
		kind;
		name;
		postId;
		equalityFieldChecks = {
			...baseEqualityFieldChecks,
			editorState: this.areEditorStatesEqual
		};
		constructor(doc, kind, name, postId) {
			super(doc);
			this.kind = kind;
			this.name = name;
			this.postId = postId;
		}
		onSetUp() {
			super.onSetUp();
			this.subscribeToCollaboratorSelectionChanges();
		}
		/**
		* Subscribe to collaborator selection changes and update the selection state.
		*/
		subscribeToCollaboratorSelectionChanges() {
			const { getSelectionStart, getSelectionEnd, getSelectedBlocksInitialCaretPosition } = (0, _wordpress_data.select)(_wordpress_block_editor.store);
			let selectionStart = getSelectionStart();
			let selectionEnd = getSelectionEnd();
			let localCursorTimeout = null;
			let selectionBeforeDebounce = null;
			(0, _wordpress_data.subscribe)(() => {
				const newSelectionStart = getSelectionStart();
				const newSelectionEnd = getSelectionEnd();
				if (newSelectionStart === selectionStart && newSelectionEnd === selectionEnd) return;
				if (!selectionBeforeDebounce) selectionBeforeDebounce = {
					start: selectionStart,
					end: selectionEnd
				};
				selectionStart = newSelectionStart;
				selectionEnd = newSelectionEnd;
				const initialPosition = getSelectedBlocksInitialCaretPosition();
				this.updateSelectionInEntityRecord(selectionStart, selectionEnd, initialPosition);
				if (localCursorTimeout) clearTimeout(localCursorTimeout);
				localCursorTimeout = setTimeout(() => {
					const selectionStateOptions = {};
					if (selectionBeforeDebounce) {
						selectionStateOptions.selectionDirection = detectSelectionDirection(selectionBeforeDebounce.start, selectionBeforeDebounce.end, selectionStart, selectionEnd);
						selectionBeforeDebounce = null;
					}
					const selectionState = getSelectionState(selectionStart, selectionEnd, this.doc, selectionStateOptions);
					this.setThrottledLocalStateField("editorState", { selection: selectionState }, 100);
				}, 5);
			});
		}
		/**
		* Update the entity record with the current collaborator's selection.
		*
		* @param selectionStart  - The start position of the selection.
		* @param selectionEnd    - The end position of the selection.
		* @param initialPosition - The initial position of the selection.
		*/
		async updateSelectionInEntityRecord(selectionStart, selectionEnd, initialPosition) {
			const edits = { selection: {
				selectionStart,
				selectionEnd,
				initialPosition
			} };
			(0, _wordpress_data.dispatch)(STORE_NAME).editEntityRecord(this.kind, this.name, this.postId, edits, { undoIgnore: true });
		}
		/**
		* Check if two editor states are equal.
		*
		* @param state1 - The first editor state.
		* @param state2 - The second editor state.
		* @return True if the editor states are equal, false otherwise.
		*/
		areEditorStatesEqual(state1, state2) {
			if (!state1 || !state2) return state1 === state2;
			if (!state1.selection || !state2.selection) return state1.selection === state2.selection;
			return areSelectionsStatesEqual(state1.selection, state2.selection);
		}
		/**
		* Resolve a selection state to a text index and block client ID.
		*
		* For text-based selections, navigates up from the resolved Y.Text via
		* AbstractType.parent to find the containing block, then resolves the
		* local clientId via the block's tree path.
		* For WholeBlock selections, resolves the block's relative position and
		* then finds the local clientId via tree path.
		*
		* Tree-path resolution is used instead of reading the clientId directly
		* from the Yjs block because the local block-editor store may use different
		* clientIds (e.g. in "Show Template" mode where blocks are cloned).
		*
		* @param selection - The selection state.
		* @param blocks    - The tree of block-editor store post content blocks.
		* @return The rich-text offset and block client ID, or nulls if not resolvable.
		*/
		convertSelectionStateToAbsolute(selection, blocks) {
			if (selection.type === SelectionType.None) return {
				richTextOffset: null,
				localClientId: null,
				attributeKey: null
			};
			if (selection.type === SelectionType.WholeBlock) {
				const absolutePos = createAbsolutePositionFromRelativePosition(selection.blockPosition, this.doc);
				let localClientId = null;
				if (absolutePos && absolutePos.type instanceof YArray) {
					const block = absolutePos.type.get(absolutePos.index);
					if (block instanceof YMap) {
						const path = getBlockPathInYdoc(block);
						localClientId = path ? resolveBlockClientIdByPath(path, blocks) : null;
					}
				}
				return {
					richTextOffset: null,
					localClientId,
					attributeKey: null
				};
			}
			if (selection.type === SelectionType.SelectionInMultipleBlocks) return {
				richTextOffset: null,
				localClientId: null,
				attributeKey: null
			};
			const cursorPos = "cursorPosition" in selection ? selection.cursorPosition : selection.cursorStartPosition;
			const absolutePosition = createAbsolutePositionFromRelativePosition(cursorPos.relativePosition, this.doc);
			if (!absolutePosition) return {
				richTextOffset: null,
				localClientId: null,
				attributeKey: null
			};
			const yType = getContainingBlockYMap(absolutePosition.type);
			const path = yType ? getBlockPathInYdoc(yType) : null;
			const localClientId = path ? resolveBlockClientIdByPath(path, blocks) : null;
			return {
				richTextOffset: htmlIndexToRichTextOffset(absolutePosition.type.toString(), asHtmlStringIndex(absolutePosition.index)),
				localClientId,
				attributeKey: cursorPos.attributeKey ?? null
			};
		}
		/**
		* Type guard to check if a struct is a Y.Item (not Y.GC)
		* @param struct - The struct to check.
		* @return True if the struct is a Y.Item, false otherwise.
		*/
		isYItem(struct) {
			return "content" in struct;
		}
		/**
		* Get data for debugging, using the awareness state.
		*
		* @return {YDocDebugData} The debug data.
		*/
		getDebugData() {
			const ydoc = this.doc;
			const docData = Object.fromEntries(Array.from(ydoc.share, ([key, value]) => [key, value.toJSON()]));
			const collaboratorMapData = new Map(Array.from(this.getSeenStates().entries()).filter(([, collaboratorState]) => isCollaboratorInfo(collaboratorState.collaboratorInfo)).map(([clientId, collaboratorState]) => [String(clientId), {
				name: collaboratorState.collaboratorInfo.name,
				wpUserId: collaboratorState.collaboratorInfo.id
			}]));
			const serializableClientItems = {};
			ydoc.store.clients.forEach((structs, clientId) => {
				const items = structs.filter(this.isYItem);
				serializableClientItems[clientId] = items.map((item) => {
					const { left, right, ...rest } = item;
					return {
						...rest,
						left: left ? {
							id: left.id,
							length: left.length,
							origin: left.origin,
							content: left.content
						} : null,
						right: right ? {
							id: right.id,
							length: right.length,
							origin: right.origin,
							content: right.content
						} : null
					};
				});
			});
			return {
				doc: docData,
				clients: serializableClientItems,
				collaboratorMap: Object.fromEntries(collaboratorMapData)
			};
		}
	};
	/**
	* Detect the direction of a selection change by comparing old and new edges.
	*
	* When the user extends a selection backward (e.g. Shift+Left), the
	* selectionStart edge moves while selectionEnd stays fixed, so the caret
	* is at the start.  The reverse is true for forward extension.
	*
	* @param prevStart - The previous selectionStart.
	* @param prevEnd   - The previous selectionEnd.
	* @param newStart  - The new selectionStart.
	* @param newEnd    - The new selectionEnd.
	* @return The detected direction, defaulting to Forward when indeterminate.
	*/
	function detectSelectionDirection(prevStart, prevEnd, newStart, newEnd) {
		const startMoved = !areBlockSelectionsEqual(prevStart, newStart);
		const endMoved = !areBlockSelectionsEqual(prevEnd, newEnd);
		if (startMoved && !endMoved) return SelectionDirection.Backward;
		return SelectionDirection.Forward;
	}
	/**
	* Compare two WPBlockSelection objects by value.
	*
	* @param a - First selection.
	* @param b - Second selection.
	* @return True if all fields are equal.
	*/
	function areBlockSelectionsEqual(a, b) {
		return a.clientId === b.clientId && a.attributeKey === b.attributeKey && a.offset === b.offset;
	}

// node_modules/.store/uuid@14.0.2-ALlTd6-Rf9bZs703d7TIjQ/node_modules/uuid/dist/stringify.js
	const byteToHex = [];
	for (let i = 0; i < 256; ++i) byteToHex.push((i + 256).toString(16).slice(1));
	function unsafeStringify(arr, offset = 0) {
		return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
	}

// node_modules/.store/uuid@14.0.2-ALlTd6-Rf9bZs703d7TIjQ/node_modules/uuid/dist/rng.js
	const rnds8 = /* @__PURE__ */ new Uint8Array(16);
	function rng() {
		return crypto.getRandomValues(rnds8);
	}

// node_modules/.store/uuid@14.0.2-ALlTd6-Rf9bZs703d7TIjQ/node_modules/uuid/dist/v4.js
	function v4(options, buf, offset) {
		if (!buf && !options && crypto.randomUUID) return crypto.randomUUID();
		return _v4(options, buf, offset);
	}
	function _v4(options, buf, offset) {
		options = options || {};
		const rnds = options.random ?? options.rng?.() ?? rng();
		if (rnds.length < 16) throw new Error("Random bytes length must be >= 16");
		rnds[6] = rnds[6] & 15 | 64;
		rnds[8] = rnds[8] & 63 | 128;
		if (buf) {
			offset = offset || 0;
			if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
			for (let i = 0; i < 16; ++i) buf[offset + i] = rnds[i];
			return buf;
		}
		return unsafeStringify(rnds);
	}

// packages/core-data/build-module/utils/crdt-text.mjs
	const RICH_TEXT_CACHE_MAX_SIZE = 500;
	/**
	* Returns a function that converts HTML strings to RichTextData instances,
	* using a FIFO cache bounded by `maxSize` to avoid re-parsing identical
	* strings. Repeated calls with the same string return the cached instance
	* without re-running the HTML parser and DOM traversal.
	*
	* @param maxSize Maximum number of entries to hold in the cache.
	* @return A cached version of RichTextData.fromHTMLString.
	*/
	function createRichTextDataCache(maxSize) {
		const cache = /* @__PURE__ */ new Map();
		return function(value) {
			const cached = cache.get(value);
			if (cached) return cached;
			const result = _wordpress_rich_text.RichTextData.fromHTMLString(value);
			if (cache.size >= maxSize) cache.delete(cache.keys().next().value);
			cache.set(value, result);
			return result;
		};
	}
	const getCachedRichTextData = createRichTextDataCache(RICH_TEXT_CACHE_MAX_SIZE);

// packages/core-data/build-module/utils/crdt-blocks.mjs
	const serializableBlocksCache = /* @__PURE__ */ new WeakMap();
	/**
	* Recursively walk an attribute value and convert any RichTextData instances
	* to their string (HTML) representation. This is necessary for array-type and
	* object-type attributes, which can contain nested RichTextData.
	*
	* @param value The attribute value to serialize.
	* @return The value with all RichTextData instances replaced by strings.
	*/
	function serializeAttributeValue(value) {
		if (value instanceof _wordpress_rich_text.RichTextData) return value.valueOf();
		if (Array.isArray(value)) return value.map(serializeAttributeValue);
		if (value && typeof value === "object") {
			const result = {};
			for (const [k, v] of Object.entries(value)) result[k] = serializeAttributeValue(v);
			return result;
		}
		return value;
	}
	function makeBlockAttributesSerializable(blockName, attributes) {
		const newAttributes = { ...attributes };
		for (const [key, value] of Object.entries(attributes)) {
			if (isLocalAttribute(blockName, key)) {
				delete newAttributes[key];
				continue;
			}
			newAttributes[key] = serializeAttributeValue(value);
		}
		return newAttributes;
	}
	/**
	* Recursively removes properties which cannot be serialized from a list of block objects.
	*
	* @param blocks Eemove unserializable properties from each block object in this set.
	* @return Copies of the provided blocks without the unserializable properties.
	*/
	function makeBlocksSerializable(blocks) {
		return blocks.map((block) => {
			const { name, innerBlocks, attributes, validationIssues, ...rest } = block;
			return {
				...rest,
				name,
				attributes: makeBlockAttributesSerializable(name, attributes),
				innerBlocks: makeBlocksSerializable(innerBlocks)
			};
		});
	}
	/**
	* Recursively walk an attribute value and convert any strings that correspond
	* to rich-text schema nodes into RichTextData instances. This is the inverse
	* of serializeAttributeValue and handles nested structures like table cells.
	*
	* @param schema The attribute type definition for this value.
	* @param value  The attribute value from CRDT (toJSON).
	* @return The value with rich-text strings replaced by RichTextData.
	*/
	function deserializeAttributeValue(schema, value) {
		if (schema?.type === "rich-text" && typeof value === "string") return getCachedRichTextData(value);
		if (Array.isArray(value)) return value.map((item) => deserializeAttributeValue(schema, item));
		if (value && typeof value === "object") {
			const result = {};
			for (const [key, innerValue] of Object.entries(value)) result[key] = deserializeAttributeValue(schema?.query?.[key], innerValue);
			return result;
		}
		return value;
	}
	/**
	* Convert blocks from their CRDT-serialized form back to the runtime form
	* expected by the block editor. Rich-text attributes are stored as Y.Text in
	* the CRDT document, which serializes to plain strings via toJSON(). This
	* function restores them to RichTextData instances so that block edit
	* components that rely on RichTextData methods (e.g. `.text`) work correctly.
	*
	* @param blocks Blocks as extracted from the CRDT document via toJSON().
	* @return Blocks with rich-text attributes restored to RichTextData.
	*/
	function deserializeBlockAttributes(blocks) {
		return blocks.map((block) => {
			const { name, innerBlocks, attributes, ...rest } = block;
			const newAttributes = { ...attributes };
			for (const [key, value] of Object.entries(attributes)) {
				const schema = getBlockAttributeSchema(name, key);
				if (schema) newAttributes[key] = deserializeAttributeValue(schema, value);
			}
			return {
				...rest,
				name,
				attributes: newAttributes,
				innerBlocks: deserializeBlockAttributes(innerBlocks ?? [])
			};
		});
	}
	/**
	* @param {any}   gblock
	* @param {Y.Map} yblock
	*/
	function areBlocksEqual(gblock, yblock) {
		const yblockAsJson = yblock.toJSON();
		const overwrites = {
			innerBlocks: null,
			clientId: null
		};
		const res = (0, import_es6.default)(Object.assign({}, gblock, overwrites), Object.assign({}, yblockAsJson, overwrites));
		const inners = gblock.innerBlocks || [];
		const yinners = yblock.get("innerBlocks");
		return res && inners.length === yinners?.length && inners.every((block, i) => areBlocksEqual(block, yinners.get(i)));
	}
	function createNewYAttributeMap(blockName, attributes) {
		return new YMap(Object.entries(attributes).map(([attributeName, attributeValue]) => {
			return [attributeName, createNewYAttributeValue(blockName, attributeName, attributeValue)];
		}));
	}
	function createNewYAttributeValue(blockName, attributeName, attributeValue) {
		return createYValueFromSchema(getBlockAttributeSchema(blockName, attributeName), attributeValue);
	}
	/**
	* Recursively create the appropriate Y.js type for a value based on its
	* block-attribute schema.
	*
	* - `rich-text`          -> Y.Text
	* - `array`  with query  -> Y.Array of Y.Maps
	* - `object` with query  -> Y.Map
	* - anything else        -> plain value (unchanged)
	*
	* @param schema The attribute type definition.
	* @param value  The plain JS value to convert.
	* @return A Y.js type or the original value.
	*/
	function createYValueFromSchema(schema, value) {
		if (!schema) return value;
		if (schema.type === "rich-text") return new YText(value?.toString() ?? "");
		if (schema.type === "array" && schema.query && Array.isArray(value)) {
			const query = schema.query;
			const yArray = new YArray();
			yArray.insert(0, value.map((item) => createYMapFromQuery(query, item)));
			return yArray;
		}
		if (schema.type === "object" && schema.query && isRecord(value)) return createYMapFromQuery(schema.query, value);
		return value;
	}
	/**
	* Type guard that narrows `unknown` to `Record< string, unknown >`.
	*
	* @param value Value to check.
	* @return True if `value` is a non-null, non-array object.
	*/
	function isRecord(value) {
		return !!value && typeof value === "object" && !Array.isArray(value);
	}
	/**
	* Create a Y.Map from a plain object, using a query schema to decide which
	* properties should become nested Y.js types (Y.Text, Y.Array, Y.Map).
	*
	* @param query The query schema defining the properties.
	* @param obj   The plain object to convert.
	* @return A Y.Map with typed values.
	*/
	function createYMapFromQuery(query, obj) {
		if (!isRecord(obj)) return new YMap();
		const entries = Object.entries(obj).map(([key, val]) => {
			const subSchema = query[key];
			return [key, createYValueFromSchema(subSchema, val)];
		});
		return new YMap(entries);
	}
	function createNewYBlock(block) {
		return createYMap(Object.fromEntries(Object.entries(block).map(([key, value]) => {
			switch (key) {
				case "attributes": return [key, createNewYAttributeMap(block.name, value)];
				case "innerBlocks": {
					const innerBlocks = new YArray();
					if (!Array.isArray(value)) return [key, innerBlocks];
					innerBlocks.insert(0, value.map((innerBlock) => createNewYBlock(innerBlock)));
					return [key, innerBlocks];
				}
				default: return [key, value];
			}
		})));
	}
	/**
	* Merge incoming block data into the local Y.Doc.
	* This function is called to sync local block changes to a shared Y.Doc.
	*
	* @param yblocks         The blocks in the local Y.Doc.
	* @param incomingBlocks  Gutenberg blocks being synced.
	* @param attributeCursor When provided, describes a selection cursor falling within a
	*                        RichText field associated with a specific block and attribute.
	*                        Derived from the changes that produced the blocks.
	* @param options         Optional settings for the merge operation.
	*/
	function mergeCrdtBlocks(yblocks, incomingBlocks, attributeCursor, options = {}) {
		if (!serializableBlocksCache.has(incomingBlocks)) serializableBlocksCache.set(incomingBlocks, makeBlocksSerializable(incomingBlocks));
		const incomingBlocksToSync = serializableBlocksCache.get(incomingBlocks) ?? [];
		const numOfCommonEntries = Math.min(incomingBlocksToSync.length ?? 0, yblocks.length);
		let left = 0;
		let right = 0;
		for (; left < numOfCommonEntries && areBlocksEqual(incomingBlocksToSync[left], yblocks.get(left)); left++);
		for (; right < numOfCommonEntries - left && areBlocksEqual(incomingBlocksToSync[incomingBlocksToSync.length - right - 1], yblocks.get(yblocks.length - right - 1)); right++);
		const numOfUpdatesNeeded = numOfCommonEntries - left - right;
		const numOfInsertionsNeeded = Math.max(0, incomingBlocksToSync.length - yblocks.length);
		const numOfDeletionsNeeded = Math.max(0, yblocks.length - incomingBlocksToSync.length);
		for (let i = 0; i < numOfUpdatesNeeded; i++, left++) {
			const incomingYBlock = incomingBlocksToSync[left];
			const localYBlock = yblocks.get(left);
			Object.entries(incomingYBlock).forEach(([incomingBlockProperty, incomingBlockPropertyValue]) => {
				switch (incomingBlockProperty) {
					case "attributes": {
						const localAttributes = localYBlock.get(incomingBlockProperty);
						const incomingAttributes = incomingBlockPropertyValue;
						if (!localAttributes) {
							localYBlock.set(incomingBlockProperty, createNewYAttributeMap(incomingYBlock.name, incomingAttributes));
							break;
						}
						Object.entries(incomingAttributes).forEach(([incomingAttributeName, incomingAttributeValue]) => {
							const currentAttribute = localAttributes?.get(incomingAttributeName);
							const isExpectedType = isExpectedAttributeType(incomingYBlock.name, incomingAttributeName, currentAttribute);
							const isYType = currentAttribute instanceof AbstractType;
							if (!isExpectedType || isYType || !(0, import_es6.default)(currentAttribute, incomingAttributeValue)) updateYBlockAttribute(incomingYBlock.name, incomingYBlock.clientId, incomingAttributeName, incomingAttributeValue, localAttributes, attributeCursor);
						});
						localAttributes.forEach((_attrValue, attrName) => {
							if (!incomingBlockPropertyValue.hasOwnProperty(attrName)) localAttributes.delete(attrName);
						});
						break;
					}
					case "innerBlocks": {
						let yInnerBlocks = localYBlock.get(incomingBlockProperty);
						if (!(yInnerBlocks instanceof YArray)) {
							yInnerBlocks = new YArray();
							localYBlock.set(incomingBlockProperty, yInnerBlocks);
						}
						mergeCrdtBlocks(yInnerBlocks, incomingBlockPropertyValue ?? [], attributeCursor, options);
						break;
					}
					case "clientId":
						if (options.preserveClientIds) break;
						if (incomingBlockPropertyValue !== localYBlock.get(incomingBlockProperty)) localYBlock.set(incomingBlockProperty, incomingBlockPropertyValue);
						break;
					default: if (!(0, import_es6.default)(incomingYBlock[incomingBlockProperty], localYBlock.get(incomingBlockProperty))) localYBlock.set(incomingBlockProperty, incomingBlockPropertyValue);
				}
			});
			localYBlock.forEach((_v, k) => {
				if (!incomingYBlock.hasOwnProperty(k)) localYBlock.delete(k);
			});
		}
		yblocks.delete(left, numOfDeletionsNeeded);
		for (let i = 0; i < numOfInsertionsNeeded; i++, left++) {
			const newBlock = [createNewYBlock(incomingBlocksToSync[left])];
			yblocks.insert(left, newBlock);
		}
		const knownClientIds = /* @__PURE__ */ new Set();
		for (let j = 0; j < yblocks.length; j++) {
			const yblock = yblocks.get(j);
			let clientId = yblock.get("clientId");
			if (!clientId) continue;
			if (knownClientIds.has(clientId)) {
				clientId = v4();
				yblock.set("clientId", clientId);
			}
			knownClientIds.add(clientId);
		}
	}
	/**
	* Compare a plain array element against a Y.Map element for equality.
	* Used by the left-right sweep diff in mergeYArray.
	*
	* @param newElement The plain object from the incoming array.
	* @param yElement   The Y.Map element from the existing Y.Array.
	* @return True if the elements are deeply equal.
	*/
	function areArrayElementsEqual(newElement, yElement) {
		if (yElement instanceof YMap && isRecord(newElement)) return (0, import_es6.default)(newElement, yElement.toJSON());
		return (0, import_es6.default)(newElement, yElement);
	}
	/**
	* Merge an incoming plain array into an existing Y.Array in-place.
	*
	* Uses the same left-right sweep diff approach as mergeCrdtBlocks:
	* equal elements are skipped from both ends, then the middle section
	* is updated, deleted, or inserted as needed. This preserves existing
	* Y.Map/Y.Text objects for unchanged elements, so concurrent edits
	* to those elements are not lost.
	*
	* @param yArray         The existing Y.Array to update.
	* @param newValue       The new plain array to merge into the Y.Array.
	* @param schema         The attribute schema (must have `query`).
	* @param cursorPosition The local cursor position for rich-text delta merges.
	* @param cursorScope    The selected block attribute scope for rich-text cursor hints.
	*/
	function mergeYArray(yArray, newValue, schema, cursorPosition, cursorScope) {
		if (!schema.query) return;
		const query = schema.query;
		const numOfCommonEntries = Math.min(newValue.length, yArray.length);
		let left = 0;
		let right = 0;
		for (; left < numOfCommonEntries && areArrayElementsEqual(newValue[left], yArray.get(left)); left++);
		for (; right < numOfCommonEntries - left && areArrayElementsEqual(newValue[newValue.length - right - 1], yArray.get(yArray.length - right - 1)); right++);
		const numOfUpdatesNeeded = numOfCommonEntries - left - right;
		for (let i = 0; i < numOfUpdatesNeeded; i++) {
			const currentElement = yArray.get(left + i);
			const newElement = newValue[left + i];
			if (currentElement instanceof YMap && isRecord(newElement)) mergeYMapValues(currentElement, newElement, query, cursorPosition, cursorScope);
			else {
				yArray.delete(0, yArray.length);
				yArray.insert(0, newValue.map((item) => createYMapFromQuery(query, item)));
				return;
			}
		}
		const numOfDeletionsNeeded = Math.max(0, yArray.length - newValue.length);
		if (numOfDeletionsNeeded > 0) yArray.delete(left + numOfUpdatesNeeded, numOfDeletionsNeeded);
		const numOfInsertionsNeeded = Math.max(0, newValue.length - yArray.length);
		if (numOfInsertionsNeeded > 0) {
			const insertAt = left + numOfUpdatesNeeded;
			const itemsToInsert = new Array(numOfInsertionsNeeded);
			for (let i = 0; i < numOfInsertionsNeeded; i++) itemsToInsert[i] = createYMapFromQuery(query, newValue[insertAt + i]);
			yArray.insert(insertAt, itemsToInsert);
		}
	}
	/**
	* Merge a single value into a Y.Map entry, using the attribute schema to
	* decide how to merge.
	*
	* If the current value is already a matching Y.js type (Y.Text, Y.Array,
	* Y.Map), the update is merged in-place so concurrent edits are preserved.
	* Otherwise the value is replaced wholesale.
	*
	* @param schema         The attribute type definition for this value.
	* @param newVal         The new value to merge into the Y.Map entry.
	* @param yMap           The Y.Map that owns this entry.
	* @param key            The key of this entry in the Y.Map.
	* @param cursorPosition The cursor position for rich-text delta merges from the updated value.
	* @param cursorScope    Indicates a specific block and attribute associated with the editor;
	*                       determines whether the cursor should be updated based on the change.
	*/
	function mergeYValue(schema, newVal, yMap, key, cursorPosition, cursorScope) {
		const currentVal = yMap.get(key);
		if (schema?.type === "rich-text" && typeof newVal === "string" && currentVal instanceof YText) mergeRichTextUpdate(currentVal, newVal, resolveRichTextCursorPosition(cursorPosition, cursorScope, newVal));
		else if (schema?.type === "array" && schema.query && Array.isArray(newVal) && currentVal instanceof YArray) mergeYArray(currentVal, newVal, schema, cursorPosition, cursorScope);
		else if (schema?.type === "object" && schema.query && isRecord(newVal) && currentVal instanceof YMap) mergeYMapValues(currentVal, newVal, schema.query, cursorPosition, cursorScope);
		else {
			const newYValue = createYValueFromSchema(schema, newVal);
			if (newYValue !== newVal || !(0, import_es6.default)(currentVal, newVal)) yMap.set(key, newYValue);
		}
	}
	/**
	* Merge an incoming plain object into an existing Y.Map in-place, using
	* the query schema to decide how each property should be merged.
	*
	* Properties present in the Y.Map but absent from `newObj` are deleted.
	*
	* @param yMap           The existing Y.Map to update.
	* @param newObj         The new plain object to merge into the Y.Map.
	* @param query          The query schema defining property types.
	* @param cursorPosition The local cursor position for rich-text delta merges.
	* @param cursorScope    The selected block attribute scope for rich-text cursor hints.
	*/
	function mergeYMapValues(yMap, newObj, query, cursorPosition, cursorScope) {
		for (const [key, newVal] of Object.entries(newObj)) mergeYValue(query[key], newVal, yMap, key, cursorPosition, cursorScope);
		for (const key of yMap.keys()) if (!Object.hasOwn(newObj, key)) yMap.delete(key);
	}
	/**
	* Update a single attribute on a Yjs block attributes map (currentAttributes).
	*
	* @param blockName         The block type name, e.g. 'core/paragraph'.
	* @param clientId          The local clientId for the block being merged.
	* @param attributeName     The name of the attribute to update, e.g. 'content'.
	* @param attributeValue    The new value for the attribute.
	* @param currentAttributes The Y.Map holding the block's current attributes.
	* @param newCursorPosition The cursor position for rich-text delta merges from the updated value.
	*                          Notably, this may not correspond to the attribute being edited and is
	*                          used to determine if any cursors need shifting in response to the change.
	*/
	function updateYBlockAttribute(blockName, clientId, attributeName, attributeValue, currentAttributes, newCursorPosition) {
		mergeYValue(getBlockAttributeSchema(blockName, attributeName), attributeValue, currentAttributes, attributeName, newCursorPosition, {
			attributeKey: attributeName,
			clientId
		});
	}
	/**
	* When the provided cursor falls within the given block and attribute’s scope,
	* returns an index into the RichText’s serialized HTML where the cursor falls.
	*
	* The cursor scope constrains resolution to ensure that indices are only reported
	* when a cursor falls within the block and attribute being updated, since the
	* attributes being updated may not always be the ones where a cursor presently falls.
	*
	* Returned index measures JS string lengths, thus is counted in UTF-16 code units
	* and contains the syntax characters making up HTML tags, comments, character
	* references, and other non-plaintext content.
	*
	* @param cursorPosition Description of the cursor in the new value.
	* @param cursorScope    Cursors should only be updated if they fall within this
	*                       specific block and attribute.
	* @param updatedValue   New RichText value potentially containing cursor.
	* @return String length into serialized HTML for RichText instance where cursor falls.
	*/
	function resolveRichTextCursorPosition(cursorPosition, cursorScope, updatedValue) {
		return cursorPosition && cursorPosition.clientId === cursorScope.clientId && cursorPosition.attributeKey === cursorScope.attributeKey && "number" === typeof cursorPosition.offset && Number.isInteger(cursorPosition.offset) ? richTextOffsetToHtmlIndex(updatedValue, asRichTextOffset(cursorPosition.offset)) : null;
	}
	let cachedBlockAttributeSchemas;
	/**
	* Get the attribute type definition for a block attribute.
	*
	* @param blockName     The name of the block, e.g. 'core/paragraph'.
	* @param attributeName The name of the attribute, e.g. 'content'.
	* @return The type definition of the attribute.
	*/
	function getBlockAttributeSchema(blockName, attributeName) {
		if (!cachedBlockAttributeSchemas) {
			cachedBlockAttributeSchemas = /* @__PURE__ */ new Map();
			for (const blockType of (0, _wordpress_blocks.getBlockTypes)()) cachedBlockAttributeSchemas.set(blockType.name, new Map(Object.entries(blockType.attributes ?? {}).map(([name, definition]) => {
				const { role, type, query } = definition;
				return [name, {
					role,
					type,
					query
				}];
			})));
		}
		return cachedBlockAttributeSchemas.get(blockName)?.get(attributeName);
	}
	/**
	* Check if an attribute value is the expected type.
	*
	* @param blockName      The name of the block, e.g. 'core/paragraph'.
	* @param attributeName  The name of the attribute, e.g. 'content'.
	* @param attributeValue The current attribute value.
	* @return True if the attribute type is expected, false otherwise.
	*/
	function isExpectedAttributeType(blockName, attributeName, attributeValue) {
		const schema = getBlockAttributeSchema(blockName, attributeName);
		if (schema?.type === "rich-text") return attributeValue instanceof YText;
		if (schema?.type === "string") return typeof attributeValue === "string";
		if (schema?.type === "array" && schema.query) return attributeValue instanceof YArray;
		if (schema?.type === "object" && schema.query) return attributeValue instanceof YMap;
		return true;
	}
	/**
	* Given a block name and attribute key, return true if the attribute is local
	* and should not be synced.
	*
	* @param blockName     The name of the block, e.g. 'core/image'.
	* @param attributeName The name of the attribute to check, e.g. 'blob'.
	* @return True if the attribute is local, false otherwise.
	*/
	function isLocalAttribute(blockName, attributeName) {
		return "local" === getBlockAttributeSchema(blockName, attributeName)?.role;
	}
	let localDoc;
	/**
	* Given a Y.Text object and an updated string value, diff the new value and
	* apply the delta to the Y.Text.
	*
	* @param blockYText      The Y.Text to update.
	* @param updatedValue    The updated value.
	* @param htmlCursorIndex The cursor index in the updated HTML string.
	*/
	function mergeRichTextUpdate(blockYText, updatedValue, htmlCursorIndex = null) {
		const currentValueAsDelta = new Delta(blockYText.toDelta());
		const updatedValueAsDelta = new Delta([{ insert: updatedValue }]);
		const deltaDiff = currentValueAsDelta.diffWithCursor(updatedValueAsDelta, htmlCursorIndex);
		/**
		* When there is no cursor involved, or when the diff is able to shuffle properly
		* around the cursor then apply that already-computed diff.
		*
		* However, `diffWithCursor()` currently fails in certain cases, producing corrupted
		* output. In these cases, fall back to the raw diff as that will apply cleanly,
		* even if it provides a less meaningful diff.
		*
		* @see Delta.diffWithCursor()
		*/
		const safeDiff = htmlCursorIndex === null || isDeltaVerificationMatch(blockYText, deltaDiff, updatedValue) ? deltaDiff : currentValueAsDelta.diff(updatedValueAsDelta);
		blockYText.applyDelta(safeDiff.ops);
	}
	/**
	* Verify that applying a delta to an existing Y.Text object produces the expected
	* output string.
	*
	* A stale, mis-scoped, or corrupted Delta will mutate a text value to the wrong
	* output string. This function applies the given Delta and indicates whether it
	* produces the given expected output string value.
	*
	* @param blockYText    The current Y.Text before applying the candidate delta.
	* @param delta         The candidate delta.
	* @param expectedValue The exact string expected after applying the delta.
	* @return Whether the candidate delta produces the expected value.
	*/
	function isDeltaVerificationMatch(blockYText, delta, expectedValue) {
		if (!localDoc) localDoc = new Doc();
		const verificationYText = localDoc.getText("verification-text");
		verificationYText.delete(0, verificationYText.length);
		verificationYText.insert(0, blockYText.toString());
		verificationYText.applyDelta(delta.ops);
		return verificationYText.toString() === expectedValue;
	}

// packages/core-data/build-module/utils/block-selection-history.mjs
	const SELECTION_HISTORY_DEFAULT_SIZE = 5;
	let YSelectionType = /* @__PURE__ */ function(YSelectionType) {
		YSelectionType["RelativeSelection"] = "RelativeSelection";
		YSelectionType["BlockSelection"] = "BlockSelection";
		return YSelectionType;
	}({});
	/**
	* This function is used to track recent block selections to help in restoring
	* a user's selection after an undo or redo operation.
	*
	* Maintains a history array for previous selections, which can be used for
	* backup restoration locations.
	* @param ydoc
	* @param historySize
	*/
	function createBlockSelectionHistory(ydoc, historySize = SELECTION_HISTORY_DEFAULT_SIZE) {
		let history = [];
		/**
		* Get the block history including current selection.
		*/
		const getSelectionHistory = () => {
			return history.slice(0);
		};
		/**
		* Update the selection history with a new selection.
		* @param newSelection
		*/
		const updateSelection = (newSelection) => {
			if (!newSelection?.selectionStart?.clientId || !newSelection?.selectionEnd?.clientId) return;
			const { selectionStart, selectionEnd } = newSelection;
			const start = convertWPBlockSelectionToSelection(selectionStart, ydoc);
			const end = convertWPBlockSelectionToSelection(selectionEnd, ydoc);
			addToHistory({
				start,
				end
			});
		};
		/**
		* Add a selection to the history, maintaining only the last `historySize` unique selections.
		* New selections are added to the front.
		* Removes any existing entries with the same start and end block combination.
		* @param yFullSelection
		*/
		const addToHistory = (yFullSelection) => {
			const startClientId = yFullSelection.start.clientId;
			const endClientId = yFullSelection.end.clientId;
			history = history.filter((entry) => {
				return !(entry.start.clientId === startClientId && entry.end.clientId === endClientId);
			});
			history.unshift(yFullSelection);
			if (history.length > historySize + 1) history = history.slice(0, historySize + 1);
		};
		return {
			getSelectionHistory,
			updateSelection
		};
	}
	/**
	* Convert a WPBlockSelection to a YSelection.
	* @param selection
	* @param ydoc
	* @return A YSelection object.
	*/
	function convertWPBlockSelectionToSelection(selection, ydoc) {
		const clientId = selection.clientId;
		const attributes = findBlockByClientIdInDoc(clientId, ydoc)?.get("attributes");
		const attributeKey = selection.attributeKey;
		let changedYText = null;
		if (attributeKey && attributes) changedYText = getYTextByAttributeKey(attributes, attributeKey);
		if (!(changedYText instanceof YText) || !attributeKey || !clientId) return {
			type: "BlockSelection",
			clientId
		};
		const offset = selection.offset ?? 0;
		return {
			type: "RelativeSelection",
			attributeKey,
			relativePosition: createRelativePositionFromTypeIndex(changedYText, richTextOffsetToHtmlIndex(changedYText.toString(), asRichTextOffset(offset))),
			clientId,
			offset
		};
	}

// packages/core-data/build-module/utils/crdt-selection.mjs
	const selectionHistoryMap = /* @__PURE__ */ new WeakMap();
	/**
	* Get or create a BlockSelectionHistory instance for a given Y.Doc.
	*
	* @param ydoc The Y.Doc to get the selection history for
	* @return The BlockSelectionHistory instance
	*/
	function getBlockSelectionHistory(ydoc) {
		let history = selectionHistoryMap.get(ydoc);
		if (!history) {
			history = createBlockSelectionHistory(ydoc);
			selectionHistoryMap.set(ydoc, history);
		}
		return history;
	}
	function getSelectionHistory(ydoc) {
		return getBlockSelectionHistory(ydoc).getSelectionHistory();
	}
	function updateSelectionHistory(ydoc, wpSelection) {
		return getBlockSelectionHistory(ydoc).updateSelection(wpSelection);
	}
	/**
	* Convert a YSelection to a WPBlockSelection.
	* @param ySelection The YSelection (relative) to convert
	* @param ydoc       The Y.Doc to convert the selection to a block selection for
	* @return The converted WPBlockSelection, or null if the conversion fails
	*/
	function convertYSelectionToBlockSelection(ySelection, ydoc) {
		if (ySelection.type === YSelectionType.RelativeSelection) {
			const { relativePosition, attributeKey, clientId } = ySelection;
			const absolutePosition = createAbsolutePositionFromRelativePosition(relativePosition, ydoc);
			if (absolutePosition) return {
				clientId,
				attributeKey,
				offset: htmlIndexToRichTextOffset(absolutePosition.type.toString(), asHtmlStringIndex(absolutePosition.index))
			};
		} else if (ySelection.type === YSelectionType.BlockSelection) return {
			clientId: ySelection.clientId,
			attributeKey: void 0,
			offset: void 0
		};
		return null;
	}
	/**
	* Convert a YFullSelection to a WPSelection by resolving relative positions
	* and verifying the blocks exist in the document.
	* @param yFullSelection The YFullSelection to convert
	* @param ydoc           The Y.Doc to resolve positions against
	* @return The converted WPSelection, or null if the conversion fails
	*/
	function convertYFullSelectionToWPSelection(yFullSelection, ydoc) {
		const { start, end } = yFullSelection;
		const startBlock = findBlockByClientIdInDoc(start.clientId, ydoc);
		const endBlock = findBlockByClientIdInDoc(end.clientId, ydoc);
		if (!startBlock || !endBlock) return null;
		const startBlockSelection = convertYSelectionToBlockSelection(start, ydoc);
		const endBlockSelection = convertYSelectionToBlockSelection(end, ydoc);
		if (startBlockSelection === null || endBlockSelection === null) return null;
		return {
			selectionStart: startBlockSelection,
			selectionEnd: endBlockSelection
		};
	}
	/**
	* Given a Y.Doc and a selection history, find the most recent selection
	* that exists in the document. Skip any selections that are not in the document.
	* @param ydoc             The Y.Doc to find the selection in
	* @param selectionHistory The selection history to check
	* @return The most recent selection that exists in the document, or null if no selection exists.
	*/
	function findSelectionFromHistory(ydoc, selectionHistory) {
		for (const positionToTry of selectionHistory) {
			const result = convertYFullSelectionToWPSelection(positionToTry, ydoc);
			if (result !== null) return result;
		}
		return null;
	}
	/**
	* Restore the selection to the most recent selection in history that is
	* available in the document.
	* @param selectionHistory The selection history to restore
	* @param ydoc             The Y.Doc where blocks are stored
	*/
	function restoreSelection(selectionHistory, ydoc) {
		const selectionToRestore = findSelectionFromHistory(ydoc, selectionHistory);
		if (selectionToRestore === null) return;
		const { getBlock } = (0, _wordpress_data.select)(_wordpress_block_editor.store);
		const { resetSelection } = (0, _wordpress_data.dispatch)(_wordpress_block_editor.store);
		const { selectionStart, selectionEnd } = selectionToRestore;
		if (selectionStart.clientId === selectionEnd.clientId) {
			const block = getBlock(selectionStart.clientId);
			const isBlockEmpty = block && (0, _wordpress_blocks.isUnmodifiedBlock)(block);
			if (0 === selectionStart.offset && 0 === selectionEnd.offset && isBlockEmpty && !selectionStart.attributeKey && !selectionEnd.attributeKey) resetSelection({ clientId: selectionStart.clientId }, { clientId: selectionEnd.clientId }, 0);
			else resetSelection(selectionStart, selectionEnd, 0);
		} else resetSelection(selectionEnd, selectionEnd, 0);
	}
	/**
	* If the latest selection has been shifted by remote edits, resolve and return
	* it as a WPSelection. Returns null when the history is empty or neither
	* endpoint has moved.
	*
	* @param ydoc             The Y.Doc to resolve positions against
	* @param selectionHistory The selection history to check
	* @return The shifted WPSelection, or null if nothing moved.
	*/
	function getShiftedSelection(ydoc, selectionHistory) {
		if (selectionHistory.length === 0) return null;
		const { start, end } = selectionHistory[0];
		if (start.type === YSelectionType.BlockSelection || end.type === YSelectionType.BlockSelection) return null;
		const selectionStart = convertYSelectionToBlockSelection(start, ydoc);
		const selectionEnd = convertYSelectionToBlockSelection(end, ydoc);
		if (!selectionStart || !selectionEnd) return null;
		const startShifted = selectionStart.offset !== start.offset;
		const endShifted = selectionEnd.offset !== end.offset;
		if (!startShifted && !endShifted) return null;
		return {
			selectionStart,
			selectionEnd
		};
	}

// packages/core-data/build-module/utils/crdt.mjs
	const POST_META_KEY_FOR_CRDT_DOC_PERSISTENCE = "_crdt_document";
	const disallowedPostMetaKeys = /* @__PURE__ */ new Set([POST_META_KEY_FOR_CRDT_DOC_PERSISTENCE]);
	const unsyncedTaxonomyProperties = /* @__PURE__ */ new Set([
		"id",
		"count",
		"link",
		"taxonomy",
		"_links",
		"_embedded"
	]);
	/**
	* Given a set of local changes to a taxonomy term, apply those changes
	* to the local Y.Doc.
	*
	* @param {CRDTDoc}               ydoc
	* @param {Partial< ObjectData >} changes
	* @return {void}
	*/
	function applyTaxonomyChangesToCRDTDoc(ydoc, changes) {
		const ymap = getRootMap(ydoc, CRDT_RECORD_MAP_KEY);
		Object.entries(changes).forEach(([key, newValue]) => {
			if (unsyncedTaxonomyProperties.has(key)) return;
			if ("function" === typeof newValue) return;
			const currentValue = ymap.get(key);
			updateMapValue(ymap, key, currentValue, newValue);
		});
	}
	/**
	* Given a set of local changes to a post record, apply those changes to the
	* local Y.Doc.
	*
	* @param {CRDTDoc}     ydoc
	* @param {PostChanges} changes
	* @param {Set<string>} syncedProperties
	* @return {void}
	*/
	function applyPostChangesToCRDTDoc(ydoc, changes, syncedProperties) {
		const ymap = getRootMap(ydoc, CRDT_RECORD_MAP_KEY);
		Object.keys(changes).forEach((key) => {
			if (!syncedProperties.has(key)) return;
			const newValue = changes[key];
			if ("function" === typeof newValue) return;
			switch (key) {
				case "blocks": {
					const newCursorPosition = parseCursorSelection(changes.selection);
					const rawContent = getRawValue(changes.content);
					if (!newValue && typeof rawContent === "string") {
						mergeContentWithoutBlocks(ymap, rawContent, newCursorPosition);
						break;
					} else if (!newValue) {
						ymap.set(key, void 0);
						break;
					}
					let currentBlocks = ymap.get(key);
					if (!(currentBlocks instanceof YArray)) {
						currentBlocks = new YArray();
						ymap.set(key, currentBlocks);
					}
					mergeCrdtBlocks(currentBlocks, newValue, newCursorPosition);
					break;
				}
				case "content":
				case "excerpt":
				case "title": {
					const currentValue = ymap.get(key);
					let rawValue = getRawValue(newValue);
					if (key === "title" && !currentValue?.toString() && "Auto Draft" === rawValue) rawValue = "";
					if (currentValue instanceof YText) mergeRichTextUpdate(currentValue, rawValue ?? "");
					else {
						const newYText = new YText(rawValue ?? "");
						ymap.set(key, newYText);
					}
					break;
				}
				case "meta": {
					let metaMap = ymap.get("meta");
					if (!isYMap(metaMap)) {
						metaMap = createYMap();
						ymap.set("meta", metaMap);
					}
					Object.entries(newValue ?? {}).forEach(([metaKey, metaValue]) => {
						if (disallowedPostMetaKeys.has(metaKey)) return;
						updateMapValue(metaMap, metaKey, metaMap.get(metaKey), metaValue);
					});
					break;
				}
				case "slug": {
					if (!newValue) break;
					const currentValue = ymap.get(key);
					updateMapValue(ymap, key, currentValue, newValue);
					break;
				}
				default: {
					const currentValue = ymap.get(key);
					updateMapValue(ymap, key, currentValue, newValue);
				}
			}
		});
		if (changes.selection) {
			const selection = changes.selection;
			setTimeout(() => {
				updateSelectionHistory(ydoc, selection);
			}, 0);
		}
	}
	/**
	* Derive blocks from a raw content string and merge them into the post's
	* blocks Y.Array. Used when a caller dispatches a change with `blocks:
	* undefined` alongside new content,  most notably the Code Editor's
	* per-keystroke dispatch.
	*
	* @param ymap           The post's root Y.Map.
	* @param rawContent     The raw HTML content to parse.
	* @param cursorPosition Cursor position derived from the change's selection,
	*                       used by mergeCrdtBlocks for rich-text cursor hints.
	*/
	function mergeContentWithoutBlocks(ymap, rawContent, cursorPosition) {
		let currentBlocks = ymap.get("blocks");
		if (!(currentBlocks instanceof YArray)) {
			currentBlocks = new YArray();
			ymap.set("blocks", currentBlocks);
		}
		mergeCrdtBlocks(currentBlocks, (0, _wordpress_blocks.parse)(rawContent), cursorPosition, { preserveClientIds: true });
	}
	/**
	* Only returns a selection object if it describes a selection within a block, with
	* a cursor inside a RichText field associated with one of that block’s attributes.
	*
	* @param selection Selection object which might represent a selection within a block,
	*                  within a RichText field associated with a particular attribute of
	*                  that block, or none at all.
	*/
	function parseCursorSelection(selection) {
		const selectionStart = selection?.selectionStart;
		return selectionStart?.clientId && selectionStart.attributeKey && "number" === typeof selectionStart.offset && Number.isInteger(selectionStart.offset) ? {
			attributeKey: selectionStart.attributeKey,
			clientId: selectionStart.clientId,
			offset: asRichTextOffset(selectionStart.offset)
		} : null;
	}
	function getTaxonomyChangesFromCRDTDoc(crdtDoc, editedRecord) {
		const docRecord = getRootMap(crdtDoc, CRDT_RECORD_MAP_KEY).toJSON();
		return Object.fromEntries(Object.entries(docRecord).filter(([key, newValue]) => !unsyncedTaxonomyProperties.has(key) && haveValuesChanged(editedRecord?.[key], newValue)));
	}
	/**
	* Given a local Y.Doc that *may* contain changes from remote peers, compare
	* against the local record and determine if there are changes (edits) we want
	* to dispatch.
	*
	* @param {CRDTDoc}     ydoc
	* @param {Post}        editedRecord
	* @param {Set<string>} syncedProperties
	* @return {Partial<PostChanges>} The changes that should be applied to the local record.
	*/
	function getPostChangesFromCRDTDoc(ydoc, editedRecord, syncedProperties) {
		const ymap = getRootMap(ydoc, CRDT_RECORD_MAP_KEY);
		let allowedMetaChanges = {};
		const changes = Object.fromEntries(Object.entries(ymap.toJSON()).filter(([key, newValue]) => {
			if (!syncedProperties.has(key)) return false;
			const currentValue = editedRecord[key];
			switch (key) {
				case "blocks":
					if (ydoc.meta?.get("fromPersistence") && editedRecord.content) {
						const blocksJson = ymap.get("blocks")?.toJSON() ?? [];
						return (0, _wordpress_blocks.__unstableSerializeAndClean)(blocksJson).trim() !== getRawValue(editedRecord.content);
					}
					return true;
				case "date":
					if (null === currentValue || editedRecord.modified === currentValue) return false;
					return haveValuesChanged(currentValue, newValue);
				case "meta": {
					const currentMeta = currentValue ?? {};
					allowedMetaChanges = Object.fromEntries(Object.entries(newValue ?? {}).filter(([metaKey]) => {
						if (disallowedPostMetaKeys.has(metaKey)) return false;
						return metaKey in currentMeta;
					}));
					return haveValuesChanged(currentValue, {
						...currentMeta,
						...allowedMetaChanges
					});
				}
				case "status":
					if ("auto-draft" === newValue) return false;
					return haveValuesChanged(currentValue, newValue);
				case "content":
				case "excerpt":
				case "title": return haveValuesChanged(getRawValue(currentValue), newValue);
				default: return haveValuesChanged(currentValue, newValue);
			}
		}));
		if (changes.blocks) changes.blocks = deserializeBlockAttributes(changes.blocks);
		if (changes.blocks && !changes.content) {
			const capturedBlocks = changes.blocks;
			changes.content = () => (0, _wordpress_blocks.__unstableSerializeAndClean)(capturedBlocks);
		}
		if ("object" === typeof changes.meta) changes.meta = {
			...editedRecord.meta,
			...allowedMetaChanges
		};
		const selectionHistory = getSelectionHistory(ydoc);
		const shiftedSelection = getShiftedSelection(ydoc, selectionHistory);
		if (shiftedSelection) changes.selection = {
			...shiftedSelection,
			initialPosition: 0
		};
		return changes;
	}
	/**
	* Syncs editable taxonomy term fields while leaving read-only REST data local.
	*/
	const taxonomySyncConfig = {
		applyChangesToCRDTDoc: applyTaxonomyChangesToCRDTDoc,
		createAwareness: (ydoc) => new BaseAwareness(ydoc),
		getChangesFromCRDTDoc: getTaxonomyChangesFromCRDTDoc
	};
	/**
	* This default collection sync config can be used to sync entity collections
	* (e.g., block comments) where we are not interested in merging changes at the
	* individual record level, but instead want to replace the entire collection
	* when changes are detected.
	*/
	const defaultCollectionSyncConfig = {
		applyChangesToCRDTDoc: () => {},
		getChangesFromCRDTDoc: () => ({}),
		shouldSync: (_, objectId) => null === objectId
	};
	/**
	* Extract the raw string value from a property that may be a string or an object
	* with a `raw` property (`RenderedText`).
	*
	* @param {unknown} value The value to extract from.
	* @return {string|undefined} The raw string value, or undefined if it could not be determined.
	*/
	function getRawValue(value) {
		if ("string" === typeof value) return value;
		if (value && "object" === typeof value && "raw" in value && "string" === typeof value.raw) return value.raw;
	}
	function haveValuesChanged(currentValue, newValue) {
		return !(0, import_es6.default)(currentValue, newValue);
	}
	function updateMapValue(map, key, currentValue, newValue) {
		if (void 0 === newValue) {
			map.delete(key);
			return;
		}
		if (haveValuesChanged(currentValue, newValue)) map.set(key, newValue);
	}

// packages/core-data/build-module/entities.mjs
	const POST_RAW_ATTRIBUTES = [
		"title",
		"excerpt",
		"content"
	];
	const blocksTransientEdits = { blocks: {
		read: (record) => (0, _wordpress_blocks.parse)(record.content?.raw ?? ""),
		write: (record) => ({ content: (0, _wordpress_blocks.__unstableSerializeAndClean)(record.blocks) })
	} };
	const rootEntitiesConfig = [
		{
			label: (0, _wordpress_i18n.__)("Base"),
			kind: "root",
			key: false,
			name: "__unstableBase",
			baseURL: "/",
			baseURLParams: { _fields: [
				"description",
				"generate_animated_image_subsizes",
				"gmt_offset",
				"home",
				"image_max_bit_depth",
				"image_sizes",
				"image_size_threshold",
				"image_strip_meta",
				"name",
				"site_icon",
				"site_icon_url",
				"site_logo",
				"timezone_string",
				"url",
				"page_for_posts",
				"page_on_front",
				"show_on_front"
			].join(",") },
			plural: "__unstableBases",
			supportsPagination: false
		},
		{
			label: (0, _wordpress_i18n.__)("Post Type"),
			name: "postType",
			kind: "root",
			key: "slug",
			baseURL: "/wp/v2/types",
			baseURLParams: { context: "edit" },
			plural: "postTypes",
			supportsPagination: false
		},
		{
			name: "media",
			kind: "root",
			baseURL: "/wp/v2/media",
			baseURLParams: { context: "edit" },
			plural: "mediaItems",
			label: (0, _wordpress_i18n.__)("Media"),
			rawAttributes: [
				"caption",
				"title",
				"description"
			],
			supportsPagination: true
		},
		{
			name: "taxonomy",
			kind: "root",
			key: "slug",
			baseURL: "/wp/v2/taxonomies",
			baseURLParams: { context: "edit" },
			plural: "taxonomies",
			label: (0, _wordpress_i18n.__)("Taxonomy"),
			supportsPagination: false
		},
		{
			name: "sidebar",
			kind: "root",
			baseURL: "/wp/v2/sidebars",
			baseURLParams: { context: "edit" },
			plural: "sidebars",
			transientEdits: { blocks: true },
			label: (0, _wordpress_i18n.__)("Widget areas"),
			supportsPagination: false
		},
		{
			name: "widget",
			kind: "root",
			baseURL: "/wp/v2/widgets",
			baseURLParams: { context: "edit" },
			plural: "widgets",
			transientEdits: { blocks: true },
			label: (0, _wordpress_i18n.__)("Widgets"),
			supportsPagination: false
		},
		{
			name: "widgetType",
			kind: "root",
			baseURL: "/wp/v2/widget-types",
			baseURLParams: { context: "edit" },
			plural: "widgetTypes",
			label: (0, _wordpress_i18n.__)("Widget types"),
			supportsPagination: false
		},
		{
			label: (0, _wordpress_i18n.__)("User"),
			name: "user",
			kind: "root",
			baseURL: "/wp/v2/users",
			getTitle: (record) => record?.name || record?.slug,
			baseURLParams: { context: "edit" },
			plural: "users",
			supportsPagination: true
		},
		{
			name: "comment",
			kind: "root",
			baseURL: "/wp/v2/comments",
			baseURLParams: { context: "edit" },
			plural: "comments",
			label: (0, _wordpress_i18n.__)("Comment"),
			supportsPagination: true,
			...globalThis.window?.__experimentalEnableRealTimeCollaboration ? { syncConfig: defaultCollectionSyncConfig } : {}
		},
		{
			name: "menu",
			kind: "root",
			baseURL: "/wp/v2/menus",
			baseURLParams: { context: "edit" },
			plural: "menus",
			label: (0, _wordpress_i18n.__)("Menu"),
			supportsPagination: true
		},
		{
			name: "menuItem",
			kind: "root",
			baseURL: "/wp/v2/menu-items",
			baseURLParams: { context: "edit" },
			plural: "menuItems",
			label: (0, _wordpress_i18n.__)("Menu Item"),
			rawAttributes: ["title"],
			supportsPagination: true
		},
		{
			name: "menuLocation",
			kind: "root",
			baseURL: "/wp/v2/menu-locations",
			baseURLParams: { context: "edit" },
			plural: "menuLocations",
			label: (0, _wordpress_i18n.__)("Menu Location"),
			key: "name",
			supportsPagination: false
		},
		{
			label: (0, _wordpress_i18n.__)("Global Styles"),
			name: "globalStyles",
			kind: "root",
			baseURL: "/wp/v2/global-styles",
			baseURLParams: { context: "edit" },
			plural: "globalStylesVariations",
			getTitle: () => (0, _wordpress_i18n.__)("Custom Styles"),
			getRevisionsUrl: (parentId, revisionId) => `/wp/v2/global-styles/${parentId}/revisions${revisionId ? "/" + revisionId : ""}`,
			supportsPagination: true
		},
		{
			label: (0, _wordpress_i18n.__)("Themes"),
			name: "theme",
			kind: "root",
			baseURL: "/wp/v2/themes",
			baseURLParams: { context: "edit" },
			plural: "themes",
			key: "stylesheet",
			supportsPagination: false
		},
		{
			label: (0, _wordpress_i18n.__)("Plugins"),
			name: "plugin",
			kind: "root",
			baseURL: "/wp/v2/plugins",
			baseURLParams: { context: "edit" },
			plural: "plugins",
			key: "plugin",
			supportsPagination: false
		},
		{
			label: (0, _wordpress_i18n.__)("Status"),
			name: "status",
			kind: "root",
			baseURL: "/wp/v2/statuses",
			baseURLParams: { context: "edit" },
			plural: "statuses",
			key: "slug",
			supportsPagination: false
		},
		{
			label: (0, _wordpress_i18n.__)("Font Collections"),
			name: "fontCollection",
			kind: "root",
			baseURL: "/wp/v2/font-collections",
			baseURLParams: { context: "view" },
			plural: "fontCollections",
			key: "slug",
			supportsPagination: true
		},
		{
			label: (0, _wordpress_i18n.__)("Icons"),
			name: "icon",
			kind: "root",
			baseURL: "/wp/v2/icons",
			baseURLParams: { context: "view" },
			plural: "icons",
			key: "name",
			supportsPagination: false
		},
		{
			label: (0, _wordpress_i18n.__)("Icon Collections"),
			name: "iconCollection",
			kind: "root",
			baseURL: "/wp/v2/icon-collections",
			baseURLParams: { context: "view" },
			plural: "iconCollections",
			key: "slug",
			supportsPagination: false
		}
	];
	const deprecatedEntities = { root: { media: {
		since: "6.9",
		alternative: {
			kind: "postType",
			name: "attachment"
		}
	} } };
	const additionalEntityConfigLoaders = [
		{
			kind: "postType",
			loadEntities: loadPostTypeEntities
		},
		{
			kind: "taxonomy",
			loadEntities: loadTaxonomyEntities
		},
		{
			kind: "root",
			name: "site",
			plural: "sites",
			loadEntities: loadSiteEntity
		}
	];
	/**
	* Apply extra edits before persisting a post type.
	*
	* @param persistedRecord Already persisted Post
	* @param edits           Edits.
	* @param name            Post type name.
	* @param isTemplate      Whether the post type is a template.
	* @return Updated edits.
	*/
	const prePersistPostType = async (persistedRecord, edits, name, isTemplate) => {
		const newEdits = {};
		if (!isTemplate && persistedRecord?.status === "auto-draft") {
			if (!edits.status && !newEdits.status) newEdits.status = "draft";
			if ((!edits.title || edits.title === "Auto Draft") && !newEdits.title && (!persistedRecord?.title || persistedRecord?.title === "Auto Draft")) newEdits.title = "";
		}
		return newEdits;
	};
	/**
	* Returns the list of post type entities.
	*
	* @return Entities promise
	*/
	async function loadPostTypeEntities() {
		const postTypesPromise = (0, _wordpress_api_fetch.default)({ path: "/wp/v2/types?context=view" });
		const taxonomiesPromise = window.__experimentalEnableRealTimeCollaboration ? (0, _wordpress_api_fetch.default)({ path: "/wp/v2/taxonomies?context=view" }) : Promise.resolve({});
		const [postTypes, taxonomies] = await Promise.all([postTypesPromise, taxonomiesPromise]);
		return Object.entries(postTypes ?? {}).map(([name, postType]) => {
			const isTemplate = ["wp_template", "wp_template_part"].includes(name);
			const namespace = postType?.rest_namespace ?? "wp/v2";
			const syncedProperties = /* @__PURE__ */ new Set([
				"author",
				"blocks",
				"content",
				"comment_status",
				"date",
				"excerpt",
				"featured_media",
				"format",
				"meta",
				"ping_status",
				"slug",
				"status",
				"sticky",
				"template",
				"title",
				...postType.taxonomies?.map((taxonomy) => taxonomies?.[taxonomy]?.rest_base)?.filter(Boolean) ?? []
			]);
			const entity = {
				kind: "postType",
				baseURL: `/${namespace}/${postType.rest_base}`,
				baseURLParams: { context: "edit" },
				name,
				label: postType.name,
				transientEdits: {
					...blocksTransientEdits,
					selection: true
				},
				mergedEdits: { meta: true },
				rawAttributes: POST_RAW_ATTRIBUTES,
				getTitle: (record) => (record?.title)?.rendered || record?.title || (isTemplate ? capitalCase(record.slug ?? "") : String(record.id)),
				__unstablePrePersist: (persistedRecord, edits) => prePersistPostType(persistedRecord, edits, name, isTemplate),
				__unstable_rest_base: postType.rest_base,
				supportsPagination: !isTemplate,
				getRevisionsUrl: (parentId, revisionId) => `/${namespace}/${postType.rest_base}/${parentId}/revisions${revisionId ? "/" + revisionId : ""}`,
				revisionKey: isTemplate ? "wp_id" : "id"
			};
			if (!window.__experimentalEnableRealTimeCollaboration) return entity;
			entity.syncConfig = {
				supportsPersistence: true,
				/**
				* Apply changes from the local editor to the local CRDT document so
				* that those changes can be synced to other peers (via the provider).
				*
				* @param crdtDoc
				* @param changes
				*/
				applyChangesToCRDTDoc: (crdtDoc, changes) => applyPostChangesToCRDTDoc(crdtDoc, changes, syncedProperties),
				/**
				* Create the awareness instance for the entity's CRDT document.
				*
				* @param ydoc
				* @param objectId
				* @return Awareness instance
				*/
				createAwareness: (ydoc, objectId) => {
					return new PostEditorAwareness(ydoc, "postType", name, parseInt(objectId, 10));
				},
				/**
				* Extract changes from a CRDT document that can be used to update the
				* local editor state.
				*
				* @param crdtDoc
				* @param editedRecord
				* @return Changes to record
				*/
				getChangesFromCRDTDoc: (crdtDoc, editedRecord) => getPostChangesFromCRDTDoc(crdtDoc, editedRecord, syncedProperties),
				/**
				* Extract changes from a CRDT document that can be used to update the
				* local editor state.
				*
				* @param record
				* @return Changes to record
				*/
				getPersistedCRDTDoc: (record) => {
					return (record?.meta)?.["_crdt_document"] || null;
				},
				shouldSync: () => !(Array.isArray(window._wpCollaborationDisabledPostTypes) && window._wpCollaborationDisabledPostTypes.includes(name))
			};
			return entity;
		});
	}
	/**
	* Returns the list of the taxonomies entities.
	*
	* @return Entities promise
	*/
	async function loadTaxonomyEntities() {
		const taxonomies = await (0, _wordpress_api_fetch.default)({ path: "/wp/v2/taxonomies?context=view" });
		return Object.entries(taxonomies ?? {}).map(([name, taxonomy]) => {
			const entity = {
				kind: "taxonomy",
				baseURL: `/${taxonomy?.rest_namespace ?? "wp/v2"}/${taxonomy.rest_base}`,
				baseURLParams: { context: "edit" },
				name,
				label: taxonomy.name,
				getTitle: (record) => record?.name,
				supportsPagination: true
			};
			if (window.__experimentalEnableRealTimeCollaboration) entity.syncConfig = taxonomySyncConfig;
			return entity;
		});
	}
	/**
	* Returns the Site entity.
	*
	* @return Entity promise
	*/
	async function loadSiteEntity() {
		const entity = {
			label: (0, _wordpress_i18n.__)("Site"),
			name: "site",
			kind: "root",
			key: false,
			baseURL: "/wp/v2/settings",
			supportsPagination: false,
			meta: {}
		};
		const site = await (0, _wordpress_api_fetch.default)({
			path: entity.baseURL,
			method: "OPTIONS"
		});
		const labels = {};
		Object.entries(site?.schema?.properties ?? {}).forEach(([key, value]) => {
			if (typeof value === "object" && value.title) labels[key] = value.title;
		});
		return [{
			...entity,
			meta: { labels }
		}];
	}
	/**
	* Returns the entity's getter method name given its kind and name or plural name.
	*
	* @example
	* ```js
	* const nameSingular = getMethodName( 'root', 'theme', 'get' );
	* // nameSingular is getRootTheme
	*
	* const namePlural = getMethodName( 'root', 'themes', 'set' );
	* // namePlural is setRootThemes
	* ```
	*
	* @param kind   Entity kind.
	* @param name   Entity name or plural name.
	* @param prefix Function prefix.
	*
	* @return Method name
	*/
	const getMethodName = (kind, name, prefix = "get") => {
		return `${prefix}${kind === "root" ? "" : pascalCase(kind)}${pascalCase(name)}`;
	};

// packages/core-data/build-module/sync.mjs
/**
	* Key under which an autosave records the CRDT snapshot describing its
	* content. Used both as the REST autosave request parameter and as the key in
	* the local (sessionStorage) autosave backup.
	*
	* This string must match CRDT_SNAPSHOT_PARAM in
	* Gutenberg_REST_Autosaves_Controller on the PHP side.
	*/
	const CRDT_AUTOSAVE_SNAPSHOT_KEY = "crdt_snapshot";
	let syncManager;
	function getSyncManager() {
		if (syncManager) return syncManager;
		if (!globalThis.window?.__experimentalEnableRealTimeCollaboration) return;
		syncManager = createSyncManager();
		return syncManager;
	}
	/**
	* Return whether a sync manager has already been created. Use this when you
	* only want to interact with an existing sync manager (e.g. to tear it down),
	* without `getSyncManager()` bootstrapping one if none exists.
	*/
	function hasSyncManager() {
		return Boolean(syncManager);
	}
	/**
	* Encode a synced entity's current CRDT state as a snapshot. Returns undefined
	* when the entity is not being synced.
	*
	* @param {string}        kind     Entity kind.
	* @param {string}        name     Entity name.
	* @param {string|number} recordId Record ID.
	* @return {string|undefined} Base64-encoded snapshot.
	*/
	function getEntitySnapshot(kind, name, recordId) {
		if (!hasSyncManager()) return;
		return getSyncManager()?.getEntitySnapshot(`${kind}/${name}`, `${recordId}`);
	}
	/**
	* Determine whether a synced entity's CRDT document contains everything the
	* given snapshot describes. Returns false when the entity is not being synced
	* or the snapshot cannot be decoded, so callers fail open.
	*
	* @param {string}        kind            Entity kind.
	* @param {string}        name            Entity name.
	* @param {string|number} recordId        Record ID.
	* @param {string}        encodedSnapshot Base64-encoded snapshot.
	* @return {boolean} Whether the document contains the snapshotted state.
	*/
	function entityContainsSnapshot(kind, name, recordId, encodedSnapshot) {
		if (!hasSyncManager()) return false;
		return getSyncManager()?.entityContainsSnapshot(`${kind}/${name}`, `${recordId}`, encodedSnapshot) ?? false;
	}
	function getServerMutatedMetaFields(updatedMeta, persistedMeta, syncedMeta) {
		const baseline = {
			...persistedMeta,
			...syncedMeta
		};
		return Object.fromEntries(Object.entries(updatedMeta ?? {}).filter(([key, value]) => {
			if (key === "_crdt_document") return false;
			return !(0, import_es6.default)(value, baseline[key]);
		}));
	}
	/**
	* The fields of a save response that differ from what the client sent (or
	* held before the save): the changes the server made on its own, which the
	* shared document must learn about.
	*
	* @param updatedRecord   The save response.
	* @param persistedRecord The record before the save.
	* @param syncedChanges   The edits that were sent.
	* @return The server-mutated fields.
	*/
	function getServerMutatedFields(updatedRecord, persistedRecord, syncedChanges) {
		return Object.fromEntries(Object.entries(updatedRecord).flatMap(([key, value]) => {
			if (key === "meta") {
				const serverMutatedMeta = getServerMutatedMetaFields(value, persistedRecord.meta, syncedChanges.meta);
				return Object.keys(serverMutatedMeta).length ? [[key, serverMutatedMeta]] : [];
			}
			const baseline = key in syncedChanges ? syncedChanges[key] : persistedRecord[key];
			return !(0, import_es6.default)(getRawValue(value) ?? value, getRawValue(baseline) ?? baseline) ? [[key, value]] : [];
		}));
	}
	const defaultDataAccess = {
		select: _wordpress_data.select,
		dispatch: _wordpress_data.dispatch,
		resolveSelect: _wordpress_data.resolveSelect
	};
	function toObjectId(recordId) {
		return recordId;
	}
	/**
	* The entity sync manager that adapts core-data's entity sync interface
	* (`entity-sync.ts`) to the `@wordpress/sync` manager, so the real-time
	* collaboration experiment keeps working exactly as before through the
	* interface. Registered at load time when the experiment is on.
	*
	* @param data How to reach the core-data store; defaults to the default
	*             registry.
	* @return The manager to register.
	*/
	function createDefaultEntitySyncManager(data = defaultDataAccess) {
		const getSyncConfig = (kind, name) => data.select(STORE_NAME).getEntityConfig(kind, name)?.syncConfig;
		return {
			shouldSync(kind, name) {
				return Boolean(getSyncManager() && getSyncConfig(kind, name));
			},
			isLoaded(kind, name, recordId) {
				if (!hasSyncManager()) return false;
				return Boolean(getSyncManager()?.isLoaded(`${kind}/${name}`, toObjectId(recordId)));
			},
			load(kind, name, recordId, record, handlers) {
				const syncConfig = getSyncConfig(kind, name);
				const manager = getSyncManager();
				if (!syncConfig || !manager) return;
				return manager.load(syncConfig, `${kind}/${name}`, toObjectId(recordId), record, createRecordHandlers(data, kind, name, recordId, syncConfig, handlers));
			},
			loadCollection(kind, name, handlers) {
				const syncConfig = getSyncConfig(kind, name);
				const manager = getSyncManager();
				if (!syncConfig || !manager) return;
				return manager.loadCollection(syncConfig, `${kind}/${name}`, createCollectionHandlers(data, kind, name, handlers));
			},
			update(kind, name, recordId, edits, options) {
				if (!getSyncConfig(kind, name)) return;
				getSyncManager()?.update(`${kind}/${name}`, toObjectId(recordId), edits, getEditOrigin(options), { isNewUndoLevel: isNewUndoLevel(options) });
			},
			beforeSave(kind, name, recordId, edits, context) {
				if (!getSyncConfig(kind, name)) return;
				return beforeSave(kind, name, recordId, edits, context);
			},
			afterSave(kind, name, recordId, context) {
				if (!getSyncConfig(kind, name)) return;
				const { savedRecord, persistedRecord, edits } = context;
				const syncChanges = persistedRecord ? getServerMutatedFields(savedRecord, persistedRecord, edits) : savedRecord;
				getSyncManager()?.update(`${kind}/${name}`, void 0 === recordId ? null : toObjectId(recordId), syncChanges, LOCAL_UNDO_IGNORED_ORIGIN, { isSave: true });
			},
			unload(kind, name, recordId) {
				if (!getSyncConfig(kind, name)) return;
				getSyncManager()?.unload(`${kind}/${name}`, toObjectId(recordId));
			},
			unloadAll() {
				if (hasSyncManager()) getSyncManager()?.unloadAll();
			},
			get undoHistory() {
				if (!hasSyncManager()) return;
				const undoManager = getSyncManager()?.undoManager;
				if (!undoManager) return;
				return {
					undo: (kind, name, recordId) => undoManager.undo(`${kind}/${name}`, toObjectId(recordId)),
					redo: (kind, name, recordId) => undoManager.redo(`${kind}/${name}`, toObjectId(recordId)),
					stopCapturing: () => undoManager.stopCapturing(),
					clearRedo: () => undoManager.clearRedo()
				};
			}
		};
	}
	function getEditOrigin(options) {
		return options.undoIgnore ? LOCAL_UNDO_IGNORED_ORIGIN : LOCAL_EDITOR_ORIGIN;
	}
	function isNewUndoLevel(options) {
		return options.undoIgnore ? false : !options.isCached;
	}
	async function beforeSave(kind, name, recordId, edits, { persistedRecord, isAutosave }) {
		const manager = getSyncManager();
		if (!manager) return;
		const objectType = `${kind}/${name}`;
		const objectId = toObjectId(recordId);
		if (persistedRecord) manager.update(objectType, objectId, edits, LOCAL_UNDO_IGNORED_ORIGIN);
		if (isAutosave) {
			const snapshot = manager.getEntitySnapshot(objectType, objectId);
			return snapshot ? { [CRDT_AUTOSAVE_SNAPSHOT_KEY]: snapshot } : void 0;
		}
		if ("postType" !== kind || !persistedRecord) return;
		const serializedDoc = await manager.createPersistedCRDTDoc(objectType, toObjectId(persistedRecord.id));
		if (!serializedDoc) return;
		return { meta: {
			...edits.meta,
			[POST_META_KEY_FOR_CRDT_DOC_PERSISTENCE]: serializedDoc
		} };
	}
	function createRecordHandlers(data, kind, name, recordId, syncConfig, handlers) {
		return {
			editRecord: handlers.editRecord,
			getEditedRecord: handlers.getEditedRecord,
			refetchRecord: handlers.refetchRecord,
			onUndoLevelOpened: handlers.onUndoLevelOpened,
			onStatusChange: (status) => {
				unlock(data.dispatch(STORE_NAME)).setSyncConnectionStatus(kind, name, recordId, status);
			},
			persistCRDTDoc: () => {
				if (!syncConfig.supportsPersistence) return;
				return data.resolveSelect(STORE_NAME).getEditedEntityRecord(kind, name, recordId).then(async (editedRecord) => {
					const { meta, status } = editedRecord;
					if ("auto-draft" === status || !meta) return;
					const entityId = editedRecord[data.select("core").getEntityConfig(kind, name)?.key || "id"];
					await saveCRDTDoc(`${kind}/${name}`, toObjectId(entityId));
				});
			},
			addUndoMeta: (ydoc, meta) => {
				const selectionHistory = getSelectionHistory(ydoc);
				if (selectionHistory) meta.set("selectionHistory", selectionHistory);
			},
			restoreUndoMeta: (ydoc, meta) => {
				const selectionHistory = meta.get("selectionHistory");
				if (selectionHistory) setTimeout(() => {
					restoreSelection(selectionHistory, ydoc);
				}, 0);
			}
		};
	}
	function createCollectionHandlers(data, kind, name, handlers) {
		return {
			refetchRecords: handlers.refetchRecords,
			onStatusChange: (status) => {
				unlock(data.dispatch(STORE_NAME)).setSyncConnectionStatus(kind, name, null, status);
			}
		};
	}
	if (globalThis.window?.__experimentalEnableRealTimeCollaboration) registerEntitySyncManager(createDefaultEntitySyncManager());

// packages/core-data/build-module/utils/save-crdt-doc.mjs
	const SYNC_SAVE_API_PATH = "/wp-sync/v1/save";
	const saveCRDTDocQueues = /* @__PURE__ */ new Map();
	async function serializeAndSaveCRDTDoc(objectType, objectId, room) {
		const serializedDoc = await getSyncManager()?.createPersistedCRDTDoc(objectType, objectId);
		if (!serializedDoc) return;
		await (0, _wordpress_api_fetch.default)({
			path: SYNC_SAVE_API_PATH,
			method: "POST",
			data: {
				room,
				doc: serializedDoc
			}
		});
	}
	/**
	* Persist the current CRDT document through the sync /save endpoint.
	*
	* @param objectType Object type.
	* @param objectId   Object ID.
	*/
	async function saveCRDTDoc(objectType, objectId) {
		const room = `${objectType}:${objectId}`;
		const currentSave = (saveCRDTDocQueues.get(room) || Promise.resolve()).catch(() => {}).then(() => serializeAndSaveCRDTDoc(objectType, objectId, room));
		saveCRDTDocQueues.set(room, currentSave);
		try {
			await currentSave;
		} finally {
			if (saveCRDTDocQueues.get(room) === currentSave) saveCRDTDocQueues.delete(room);
		}
	}

// packages/core-data/build-module/utils/get-pagination-meta.mjs
/**
	* Returns the pagination metadata reported by a collection response. Endpoints
	* that don't paginate send no headers, in which case the totals are unknown.
	*
	* @param headers Response headers.
	*/
	function getPaginationMeta(headers) {
		const totalItems = parseInt(headers.get("X-WP-Total") ?? "");
		const totalPages = parseInt(headers.get("X-WP-TotalPages") ?? "");
		return {
			totalItems: Number.isFinite(totalItems) ? totalItems : null,
			totalPages: Number.isFinite(totalPages) ? totalPages : null
		};
	}

// packages/core-data/build-module/queried-data/get-query-parts.mjs
/**
	* Given a query object, returns an object of parts, including pagination
	* details (`page` and `perPage`, or default values). All other properties are
	* encoded into a stable (idempotent) `stableKey` value.
	*
	* @param query Optional query object.
	*
	* @return Query parts.
	*/
	function getQueryParts(query) {
		const parts = {
			stableKey: "",
			page: 1,
			perPage: 10,
			offset: null,
			fields: null,
			include: null,
			context: "default"
		};
		const keys = Object.keys(query).sort();
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			let value = query[key];
			switch (key) {
				case "page":
					parts[key] = Number(value);
					break;
				case "per_page":
					parts.perPage = Number(value);
					break;
				case "offset": {
					const numericOffset = Number(value);
					if (Number.isFinite(numericOffset)) parts.offset = numericOffset;
					break;
				}
				case "context":
					parts.context = value;
					break;
				default:
					if (key === "_fields") {
						parts.fields = getNormalizedCommaSeparable(value) ?? [];
						value = parts.fields.join();
					}
					if (key === "include") {
						if (typeof value === "number") value = value.toString();
						parts.include = (getNormalizedCommaSeparable(value) ?? []).map(Number);
						value = parts.include.join();
					}
					parts.stableKey += (parts.stableKey ? "&" : "") + (0, _wordpress_url.addQueryArgs)("", { [key]: value }).slice(1);
			}
		}
		return parts;
	}
	var get_query_parts_default = withWeakMapCache(getQueryParts);

// packages/core-data/build-module/queried-data/reducer.mjs
	function getContextFromAction(action) {
		const { query } = action;
		if (!query) return "default";
		return get_query_parts_default(query).context;
	}
	/**
	* Returns a merged array of item IDs, given details of the received paginated
	* items. The array is sparse-like with `undefined` entries where holes exist.
	*
	* @param itemIds         Original item IDs (default empty array).
	* @param nextItemIds     Item IDs to merge.
	* @param options         Options object.
	* @param options.page    Page of items merged.
	* @param options.offset  Offset of items merged.
	* @param options.perPage Number of items per page.
	*
	* @return Merged array of item IDs.
	*/
	function getMergedItemIds(itemIds = [], nextItemIds, { page = 1, offset, perPage = 10 } = {}) {
		if (perPage === -1) return nextItemIds;
		const nextItemIdsStartIndex = offset ?? (page - 1) * perPage;
		const nextItemIdsRange = Math.max(perPage, nextItemIds.length);
		const size = Math.max(itemIds.length, nextItemIdsStartIndex + nextItemIds.length);
		const mergedItemIds = new Array(size);
		for (let i = 0; i < size; i++) if (i >= nextItemIdsStartIndex && i < nextItemIdsStartIndex + nextItemIdsRange) mergedItemIds[i] = nextItemIds[i - nextItemIdsStartIndex];
		else mergedItemIds[i] = itemIds[i];
		return mergedItemIds;
	}
	/**
	* Helper function to filter out entities with certain IDs.
	* Entities are keyed by their ID.
	*
	* @param entities Entity objects, keyed by entity ID.
	* @param ids      Entity IDs to filter out.
	*
	* @return Filtered entities.
	*/
	function removeEntitiesById(entities, ids) {
		return Object.fromEntries(Object.entries(entities).filter(([id]) => !ids.some((itemId) => {
			if (Number.isInteger(itemId)) return itemId === +id;
			return itemId === id;
		})));
	}
	/**
	* Reducer tracking items state, keyed by ID. Items are assumed to be normal,
	* where identifiers are common across all queries.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Next state.
	*/
	function items(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_ITEMS": {
				const context = getContextFromAction(action);
				const key = action.key || "id";
				const itemsList = Array.isArray(action.items) ? action.items : [action.items];
				return {
					...state,
					[context]: {
						...state[context],
						...Object.fromEntries(itemsList.map((item) => [item?.[key], conservativeMapItem(state?.[context]?.[item?.[key]], item)]))
					}
				};
			}
			case "REMOVE_ITEMS": return Object.fromEntries(Object.entries(state).map(([itemId, contextState]) => [itemId, removeEntitiesById(contextState, action.itemIds)]));
		}
		return state;
	}
	/**
	* Reducer tracking item completeness, keyed by ID. A complete item is one for
	* which all fields are known. This is used in supporting `_fields` queries,
	* where not all properties associated with an entity are necessarily returned.
	* In such cases, completeness is used as an indication of whether it would be
	* safe to use queried data for a non-`_fields`-limited request.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Next state.
	*/
	function itemIsComplete(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_ITEMS": {
				const context = getContextFromAction(action);
				const { query, key = "id" } = action;
				const itemsList = Array.isArray(action.items) ? action.items : [action.items];
				const queryParts = query ? get_query_parts_default(query) : {};
				const isCompleteQuery = !query || !Array.isArray(queryParts.fields);
				return {
					...state,
					[context]: {
						...state[context],
						...itemsList.reduce((result, item) => {
							const itemId = item?.[key];
							result[itemId] = state?.[context]?.[itemId] || isCompleteQuery;
							return result;
						}, {})
					}
				};
			}
			case "REMOVE_ITEMS": return Object.fromEntries(Object.entries(state).map(([itemId, contextState]) => [itemId, removeEntitiesById(contextState, action.itemIds)]));
		}
		return state;
	}
	/**
	* Reducer tracking queries state, keyed by stable query key. Each reducer
	* query object includes `itemIds` and `requestingPageByPerPage`.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Next state.
	*/
	const receiveQueries = (0, _wordpress_compose.compose)([
		ifMatchingAction((action) => "query" in action && Array.isArray(action.items)),
		replaceAction((action) => {
			if (action.query) return {
				...action,
				...get_query_parts_default(action.query)
			};
			return action;
		}),
		(0, _wordpress_data.keyedReducer)("context"),
		(0, _wordpress_data.keyedReducer)("stableKey")
	])((state = {}, action) => {
		if (action.type !== "RECEIVE_ITEMS") return state;
		const key = action.key ?? "id";
		return {
			itemIds: getMergedItemIds(state.itemIds, action.items.map((item) => item?.[key]).filter(Boolean), {
				page: action.page,
				offset: action.offset,
				perPage: action.perPage
			}),
			meta: action.meta
		};
	});
	/**
	* Removes items from a query's item IDs, keeping the pagination metadata in
	* sync. Every removed item the query listed was counted by the endpoint in
	* `totalItems`, so the total shrinks by that many. Nothing else refreshes the
	* totals until the next fetch, and a consumer whose page has just emptied
	* would otherwise keep requesting a page that no longer exists.
	*
	* `totalPages` can't be recomputed here — the page size that produced the
	* `X-WP-TotalPages` header isn't known to the reducer — so it is reset to
	* `null` ("unknown") rather than left next to a fresh `totalItems` it no
	* longer matches. Queries that set `per_page` are unaffected: the selectors
	* derive their page count from `totalItems` and never read the header value.
	*
	* @param queryItems   Query state, with `itemIds` and optional `meta`.
	* @param removedItems Removed item IDs, as object keys.
	*
	* @return Updated query state.
	*/
	function removeQueryItems(queryItems, removedItems) {
		const itemIds = queryItems.itemIds.filter((itemId) => !removedItems[itemId]);
		const removedCount = queryItems.itemIds.length - itemIds.length;
		if (removedCount === 0) return queryItems;
		const nextQueryItems = {
			...queryItems,
			itemIds
		};
		if (Number.isFinite(queryItems.meta?.totalItems)) nextQueryItems.meta = {
			...queryItems.meta,
			totalItems: Math.max(0, queryItems.meta.totalItems - removedCount),
			totalPages: null
		};
		return nextQueryItems;
	}
	/**
	* Reducer tracking queries state.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Next state.
	*/
	const queries = (state = {}, action) => {
		switch (action.type) {
			case "RECEIVE_ITEMS": return receiveQueries(state, action);
			case "REMOVE_ITEMS":
				const removedItems = action.itemIds.reduce((result, itemId) => {
					result[itemId] = true;
					return result;
				}, {});
				return Object.fromEntries(Object.entries(state).map(([queryGroup, contextQueries]) => [queryGroup, Object.fromEntries(Object.entries(contextQueries).map(([query, queryItems]) => [query, removeQueryItems(queryItems, removedItems)]))]));
			default: return state;
		}
	};
	var reducer_default$1 = (0, _wordpress_data.combineReducers)({
		items,
		itemIsComplete,
		queries
	});

// packages/core-data/build-module/queried-data/actions.mjs
/**
	* Returns an action object used in signalling that items have been received.
	*
	* @param items Items received.
	* @param edits Optional edits to reset.
	* @param meta  Meta information about pagination.
	*
	* @return Action object.
	*/
	function receiveItems(items, edits, meta) {
		return {
			type: "RECEIVE_ITEMS",
			items,
			persistedEdits: edits,
			meta
		};
	}
	/**
	* Returns an action object used in signalling that entity records have been
	* deleted and they need to be removed from entities state.
	*
	* @param kind            Kind of the removed entities.
	* @param name            Name of the removed entities.
	* @param records         Record IDs of the removed entities.
	* @param invalidateCache Controls whether we want to invalidate the cache.
	* @return Action object.
	*/
	function removeItems(kind, name, records, invalidateCache = false) {
		return {
			type: "REMOVE_ITEMS",
			itemIds: Array.isArray(records) ? records : [records],
			kind,
			name,
			invalidateCache
		};
	}
	/**
	* Returns an action object used in signalling that queried data has been
	* received.
	*
	* @param items Queried items received.
	* @param query Optional query object.
	* @param edits Optional edits to reset.
	* @param meta  Meta information about pagination.
	*
	* @return Action object.
	*/
	function receiveQueriedItems(items, query = {}, edits, meta) {
		return {
			...receiveItems(items, edits, meta),
			query
		};
	}

// node_modules/.store/equivalent-key-map@0.2.2-x2CcnsHOWgXkLrIdkTeNmg/node_modules/equivalent-key-map/equivalent-key-map.js
	var require_equivalent_key_map = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		function _typeof(obj) {
			if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") _typeof = function(obj) {
				return typeof obj;
			};
			else _typeof = function(obj) {
				return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
			};
			return _typeof(obj);
		}
		function _classCallCheck(instance, Constructor) {
			if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
		}
		function _defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}
		function _createClass(Constructor, protoProps, staticProps) {
			if (protoProps) _defineProperties(Constructor.prototype, protoProps);
			if (staticProps) _defineProperties(Constructor, staticProps);
			return Constructor;
		}
		/**
		* Given an instance of EquivalentKeyMap, returns its internal value pair tuple
		* for a key, if one exists. The tuple members consist of the last reference
		* value for the key (used in efficient subsequent lookups) and the value
		* assigned for the key at the leaf node.
		*
		* @param {EquivalentKeyMap} instance EquivalentKeyMap instance.
		* @param {*} key                     The key for which to return value pair.
		*
		* @return {?Array} Value pair, if exists.
		*/
		function getValuePair(instance, key) {
			var _map = instance._map, _arrayTreeMap = instance._arrayTreeMap, _objectTreeMap = instance._objectTreeMap;
			if (_map.has(key)) return _map.get(key);
			var properties = Object.keys(key).sort();
			var map = Array.isArray(key) ? _arrayTreeMap : _objectTreeMap;
			for (var i = 0; i < properties.length; i++) {
				var property = properties[i];
				map = map.get(property);
				if (map === void 0) return;
				var propertyValue = key[property];
				map = map.get(propertyValue);
				if (map === void 0) return;
			}
			var valuePair = map.get("_ekm_value");
			if (!valuePair) return;
			_map.delete(valuePair[0]);
			valuePair[0] = key;
			map.set("_ekm_value", valuePair);
			_map.set(key, valuePair);
			return valuePair;
		}
		/**
		* Variant of a Map object which enables lookup by equivalent (deeply equal)
		* object and array keys.
		*/
		var EquivalentKeyMap = /*#__PURE__*/ function() {
			/**
			* Constructs a new instance of EquivalentKeyMap.
			*
			* @param {Iterable.<*>} iterable Initial pair of key, value for map.
			*/
			function EquivalentKeyMap(iterable) {
				_classCallCheck(this, EquivalentKeyMap);
				this.clear();
				if (iterable instanceof EquivalentKeyMap) {
					var iterablePairs = [];
					iterable.forEach(function(value, key) {
						iterablePairs.push([key, value]);
					});
					iterable = iterablePairs;
				}
				if (iterable != null) for (var i = 0; i < iterable.length; i++) this.set(iterable[i][0], iterable[i][1]);
			}
			/**
			* Accessor property returning the number of elements.
			*
			* @return {number} Number of elements.
			*/
			_createClass(EquivalentKeyMap, [
				{
					key: "set",
					/**
					* Add or update an element with a specified key and value.
					*
					* @param {*} key   The key of the element to add.
					* @param {*} value The value of the element to add.
					*
					* @return {EquivalentKeyMap} Map instance.
					*/
					value: function set(key, value) {
						if (key === null || _typeof(key) !== "object") {
							this._map.set(key, value);
							return this;
						}
						var properties = Object.keys(key).sort();
						var valuePair = [key, value];
						var map = Array.isArray(key) ? this._arrayTreeMap : this._objectTreeMap;
						for (var i = 0; i < properties.length; i++) {
							var property = properties[i];
							if (!map.has(property)) map.set(property, new EquivalentKeyMap());
							map = map.get(property);
							var propertyValue = key[property];
							if (!map.has(propertyValue)) map.set(propertyValue, new EquivalentKeyMap());
							map = map.get(propertyValue);
						}
						var previousValuePair = map.get("_ekm_value");
						if (previousValuePair) this._map.delete(previousValuePair[0]);
						map.set("_ekm_value", valuePair);
						this._map.set(key, valuePair);
						return this;
					}
				},
				{
					key: "get",
					value: function get(key) {
						if (key === null || _typeof(key) !== "object") return this._map.get(key);
						var valuePair = getValuePair(this, key);
						if (valuePair) return valuePair[1];
					}
				},
				{
					key: "has",
					value: function has(key) {
						if (key === null || _typeof(key) !== "object") return this._map.has(key);
						return getValuePair(this, key) !== void 0;
					}
				},
				{
					key: "delete",
					value: function _delete(key) {
						if (!this.has(key)) return false;
						this.set(key, void 0);
						return true;
					}
				},
				{
					key: "forEach",
					value: function forEach(callback) {
						var _this = this;
						var thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this;
						this._map.forEach(function(value, key) {
							if (key !== null && _typeof(key) === "object") value = value[1];
							callback.call(thisArg, value, key, _this);
						});
					}
				},
				{
					key: "clear",
					value: function clear() {
						this._map = /* @__PURE__ */ new Map();
						this._arrayTreeMap = /* @__PURE__ */ new Map();
						this._objectTreeMap = /* @__PURE__ */ new Map();
					}
				},
				{
					key: "size",
					get: function get() {
						return this._map.size;
					}
				}
			]);
			return EquivalentKeyMap;
		}();
		module.exports = EquivalentKeyMap;
	}));

// packages/core-data/build-module/queried-data/selectors.mjs
	var import_equivalent_key_map = /* @__PURE__ */ __toESM(require_equivalent_key_map(), 1);
	/**
	* Cache of state keys to EquivalentKeyMap where the inner map tracks queries
	* to their resulting items set. WeakMap allows garbage collection on expired
	* state references.
	*/
	const queriedItemsCacheByState = /* @__PURE__ */ new WeakMap();
	/**
	* Returns items for a given query, or null if the items are not known.
	*
	* @param state                      State object.
	* @param query                      Optional query.
	* @param options                    Optional pagination options.
	* @param options.supportsPagination Whether the entity supports pagination. Default true.
	*
	* @return Query items.
	*/
	function getQueriedItemsUncached(state, query, options = {}) {
		const { supportsPagination = true } = options;
		const { stableKey, page, perPage, offset: queryOffset, include, fields, context } = get_query_parts_default(query);
		const itemIds = state.queries?.[context]?.[stableKey]?.itemIds;
		if (!itemIds) return null;
		const isPaginated = supportsPagination && perPage !== -1;
		const startOffset = isPaginated ? queryOffset ?? (page - 1) * perPage : 0;
		const endOffset = isPaginated ? Math.min(startOffset + perPage, itemIds.length) : itemIds.length;
		if (isPaginated && itemIds.length < startOffset + perPage) {
			const totalItems = state.queries[context][stableKey].meta?.totalItems;
			if (Number.isFinite(totalItems) && itemIds.length < totalItems) return null;
		}
		const items = [];
		for (let i = startOffset; i < endOffset; i++) {
			const itemId = itemIds[i];
			if (Array.isArray(include) && !include.includes(itemId)) continue;
			if (itemId === void 0) continue;
			if (!state.items[context]?.hasOwnProperty(itemId)) return null;
			const item = state.items[context][itemId];
			let filteredItem;
			if (Array.isArray(fields)) {
				filteredItem = {};
				for (let f = 0; f < fields.length; f++) {
					const field = fields[f].split(".");
					let value = item;
					field.forEach((fieldName) => {
						value = value?.[fieldName];
					});
					setNestedValue(filteredItem, field, value);
				}
			} else {
				if (!state.itemIsComplete[context]?.[itemId]) return null;
				filteredItem = item;
			}
			items.push(filteredItem);
		}
		return items;
	}
	/**
	* Returns items for a given query, or null if the items are not known. Caches
	* result per state (by reference) and per query (by deep equality), so that:
	*
	* `getQueriedItems( state, {} ) === getQueriedItems( state, {} )`
	*
	* @param state                      State object.
	* @param query                      Optional query.
	* @param options                    Optional pagination options.
	* @param options.supportsPagination Whether the entity supports pagination. Default true.
	*
	* @return Query items.
	*/
	function getQueriedItems(state, query = {}, options = {}) {
		let queriedItemsCache = queriedItemsCacheByState.get(state);
		if (queriedItemsCache) {
			const queriedItems = queriedItemsCache.get(query);
			if (queriedItems !== void 0) return queriedItems;
		} else {
			queriedItemsCache = new import_equivalent_key_map.default();
			queriedItemsCacheByState.set(state, queriedItemsCache);
		}
		const items = getQueriedItemsUncached(state, query, options);
		queriedItemsCache.set(query, items);
		return items;
	}
	function getQueriedTotalItems(state, query = {}) {
		const { stableKey, context } = get_query_parts_default(query);
		return state.queries?.[context]?.[stableKey]?.meta?.totalItems ?? null;
	}
	function getQueriedTotalPages(state, query = {}) {
		const { stableKey, context } = get_query_parts_default(query);
		return state.queries?.[context]?.[stableKey]?.meta?.totalPages ?? null;
	}

// packages/core-data/build-module/reducer.mjs
/**
	* Reducer managing authors state. Keyed by id.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function users(state = {
		byId: {},
		queries: {}
	}, action) {
		switch (action.type) {
			case "RECEIVE_USER_QUERY": return {
				byId: {
					...state.byId,
					...action.users.reduce((newUsers, user) => ({
						...newUsers,
						[user.id]: user
					}), {})
				},
				queries: {
					...state.queries,
					[action.queryID]: action.users.map((user) => user.id)
				}
			};
		}
		return state;
	}
	/**
	* Reducer managing current user state.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function currentUser(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_CURRENT_USER": return action.currentUser;
		}
		return state;
	}
	/**
	* Reducer managing the current theme.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function currentTheme(state = void 0, action) {
		switch (action.type) {
			case "RECEIVE_CURRENT_THEME": return action.currentTheme.stylesheet;
		}
		return state;
	}
	/**
	* Reducer managing the current global styles id.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function currentGlobalStylesId(state = void 0, action) {
		switch (action.type) {
			case "RECEIVE_CURRENT_GLOBAL_STYLES_ID": return action.id;
		}
		return state;
	}
	/**
	* Reducer managing the theme base global styles.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function themeBaseGlobalStyles(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_THEME_GLOBAL_STYLES": return {
				...state,
				[action.stylesheet]: action.globalStyles
			};
		}
		return state;
	}
	/**
	* Reducer managing the theme global styles variations.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function themeGlobalStyleVariations(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_THEME_GLOBAL_STYLE_VARIATIONS": return {
				...state,
				[action.stylesheet]: action.variations
			};
		}
		return state;
	}
	const withMultiEntityRecordEdits = (reducer) => (state, action) => {
		if (action.type === "UNDO" || action.type === "REDO") {
			const { record } = action;
			let newState = state;
			record.forEach(({ id, changes }) => {
				const { kind, name, recordId } = id;
				const persistedRecord = state?.queriedData?.items?.default?.[recordId];
				const edits = Object.fromEntries(Object.entries(changes).map(([key, value]) => [key, action.type === "UNDO" ? value.from : value.to]));
				newState = reducer(newState, {
					type: "EDIT_ENTITY_RECORD",
					kind,
					name,
					recordId,
					edits: clearUnchangedEdits(edits, persistedRecord)
				});
			});
			return newState;
		}
		return reducer(state, action);
	};
	/**
	* Higher Order Reducer for a given entity config. It supports:
	*
	*  - Fetching
	*  - Editing
	*  - Saving
	*
	* @param entityConfig Entity config.
	*
	* @return Reducer.
	*/
	function entity(entityConfig) {
		return (0, _wordpress_compose.compose)([
			withMultiEntityRecordEdits,
			ifMatchingAction((action) => action.name && action.kind && action.name === entityConfig.name && action.kind === entityConfig.kind),
			replaceAction((action) => {
				return {
					key: entityConfig.key || "id",
					...action
				};
			})
		])((0, _wordpress_data.combineReducers)({
			queriedData: reducer_default$1,
			edits: (state = {}, action) => {
				switch (action.type) {
					case "RECEIVE_ITEMS":
						if ((action?.query?.context ?? "default") !== "default") return state;
						const nextState = { ...state };
						const itemsList = Array.isArray(action.items) ? action.items : [action.items];
						for (const record of itemsList) {
							const recordId = record?.[action.key];
							const edits = nextState[recordId];
							if (!edits) continue;
							const nextEdits = Object.keys(edits).reduce((acc, key) => {
								if (!(0, import_es6.default)(edits[key], record[key]?.raw ?? record[key]) && (!action.persistedEdits || !(0, import_es6.default)(edits[key], action.persistedEdits[key]))) acc[key] = edits[key];
								return acc;
							}, {});
							if (Object.keys(nextEdits).length) nextState[recordId] = nextEdits;
							else delete nextState[recordId];
						}
						return nextState;
					case "EDIT_ENTITY_RECORD":
						const nextEdits = {
							...state[action.recordId],
							...action.edits
						};
						Object.keys(nextEdits).forEach((key) => {
							if (nextEdits[key] === void 0) delete nextEdits[key];
						});
						return {
							...state,
							[action.recordId]: nextEdits
						};
				}
				return state;
			},
			saving: (state = {}, action) => {
				switch (action.type) {
					case "SAVE_ENTITY_RECORD_START":
					case "SAVE_ENTITY_RECORD_FINISH": return {
						...state,
						[action.recordId]: {
							pending: action.type === "SAVE_ENTITY_RECORD_START",
							error: action.error,
							isAutosave: action.isAutosave
						}
					};
				}
				return state;
			},
			deleting: (state = {}, action) => {
				switch (action.type) {
					case "DELETE_ENTITY_RECORD_START":
					case "DELETE_ENTITY_RECORD_FINISH": return {
						...state,
						[action.recordId]: {
							pending: action.type === "DELETE_ENTITY_RECORD_START",
							error: action.error
						}
					};
				}
				return state;
			},
			revisions: (state = {}, action) => {
				if (action.type === "RECEIVE_ITEM_REVISIONS") {
					const recordKey = action.recordKey;
					delete action.recordKey;
					const newState = reducer_default$1(state[recordKey], {
						...action,
						type: "RECEIVE_ITEMS"
					});
					return {
						...state,
						[recordKey]: newState
					};
				}
				if (action.type === "REMOVE_ITEMS") return Object.fromEntries(Object.entries(state).filter(([id]) => !action.itemIds.some((itemId) => {
					if (Number.isInteger(itemId)) return itemId === +id;
					return itemId === id;
				})));
				return state;
			}
		}));
	}
	/**
	* Reducer keeping track of the registered entities.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function entitiesConfig$1(state = rootEntitiesConfig, action) {
		switch (action.type) {
			case "ADD_ENTITIES": return [...state, ...action.entities];
		}
		return state;
	}
	/**
	* Reducer keeping track of the registered entities config and data.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	const entities = (state = {}, action) => {
		const newConfig = entitiesConfig$1(state.config, action);
		let entitiesDataReducer = state.reducer;
		if (!entitiesDataReducer || newConfig !== state.config) {
			const entitiesByKind = newConfig.reduce((acc, record) => {
				const { kind } = record;
				if (!acc[kind]) acc[kind] = [];
				acc[kind].push(record);
				return acc;
			}, {});
			entitiesDataReducer = (0, _wordpress_data.combineReducers)(Object.fromEntries(Object.entries(entitiesByKind).map(([kind, subEntities]) => {
				return [kind, (0, _wordpress_data.combineReducers)(Object.fromEntries(subEntities.map((entityConfig) => [entityConfig.name, entity(entityConfig)])))];
			})));
		}
		const newData = entitiesDataReducer(state.records, action);
		if (newData === state.records && newConfig === state.config && entitiesDataReducer === state.reducer) return state;
		return {
			reducer: entitiesDataReducer,
			records: newData,
			config: newConfig
		};
	};
	function undoManager(state = (0, _wordpress_undo_manager.createUndoManager)()) {
		return state;
	}
	function undoManagerReference(state = {}, action) {
		switch (action.type) {
			case "RECORD_SYNC_UNDO_LEVEL": return {};
		}
		return state;
	}
	function editsReference(state = {}, action) {
		switch (action.type) {
			case "EDIT_ENTITY_RECORD":
			case "UNDO":
			case "REDO": return {};
		}
		return state;
	}
	/**
	* Reducer managing embed preview data.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function embedPreviews(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_EMBED_PREVIEW":
				const { url, preview } = action;
				return {
					...state,
					[url]: preview
				};
		}
		return state;
	}
	/**
	* State which tracks whether the user can perform an action on a REST
	* resource.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function userPermissions(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_USER_PERMISSION": return {
				...state,
				[action.key]: action.isAllowed
			};
			case "RECEIVE_USER_PERMISSIONS": return {
				...state,
				...action.permissions
			};
		}
		return state;
	}
	/**
	* Reducer returning autosaves keyed by their parent's post id.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function autosaves(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_AUTOSAVES":
				const { postId, autosaves: autosavesData } = action;
				return {
					...state,
					[postId]: autosavesData
				};
		}
		return state;
	}
	function blockPatterns(state = [], action) {
		switch (action.type) {
			case "RECEIVE_BLOCK_PATTERNS": return action.patterns;
		}
		return state;
	}
	function blockPatternCategories(state = [], action) {
		switch (action.type) {
			case "RECEIVE_BLOCK_PATTERN_CATEGORIES": return action.categories;
		}
		return state;
	}
	function userPatternCategories(state = [], action) {
		switch (action.type) {
			case "RECEIVE_USER_PATTERN_CATEGORIES": return action.patternCategories;
		}
		return state;
	}
	function navigationFallbackId(state = null, action) {
		switch (action.type) {
			case "RECEIVE_NAVIGATION_FALLBACK_ID": return action.fallbackId;
		}
		return state;
	}
	/**
	* Reducer managing the theme global styles revisions.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function themeGlobalStyleRevisions(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_THEME_GLOBAL_STYLE_REVISIONS": return {
				...state,
				[action.currentId]: action.revisions
			};
		}
		return state;
	}
	/**
	* Reducer managing the template lookup per query.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function defaultTemplates(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_DEFAULT_TEMPLATE": return {
				...state,
				[JSON.stringify(action.query)]: action.templateId
			};
		}
		return state;
	}
	/**
	* Reducer returning an object of registered post meta.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function registeredPostMeta(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_REGISTERED_POST_META": return {
				...state,
				[action.postType]: action.registeredPostMeta
			};
		}
		return state;
	}
	/**
	* Reducer managing editor settings.
	*
	* @param state  Current state.
	* @param action Action object.
	*
	* @return Updated state.
	*/
	function editorSettings(state = null, action) {
		switch (action.type) {
			case "RECEIVE_EDITOR_SETTINGS": return action.settings;
		}
		return state;
	}
	/**
	* Reducer managing editor assets.
	*
	* @param state  Current state.
	* @param action Action object.
	*
	* @return Updated state.
	*/
	function editorAssets(state = null, action) {
		switch (action.type) {
			case "RECEIVE_EDITOR_ASSETS": return action.assets;
		}
		return state;
	}
	/**
	* Reducer managing sync connection states for entities.
	* Keyed by "kind/name:id" (e.g., "postType/post:123").
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function syncConnectionStatuses(state = {}, action) {
		switch (action.type) {
			case "SET_SYNC_CONNECTION_STATUS": {
				const key = `${action.kind}/${action.name}:${action.key}`;
				return {
					...state,
					[key]: action.status
				};
			}
			case "CLEAR_SYNC_CONNECTION_STATUS": {
				const key = `${action.kind}/${action.name}:${action.key}`;
				const { [key]: _, ...rest } = state;
				return rest;
			}
		}
		return state;
	}
	/**
	* Reducer managing whether collaboration is supported.
	*
	* Default to true, as collaboration is supported by default
	* unless explicitly disabled due to unsupported conditions
	* such as metaboxes.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function collaborationSupported(state = true, action) {
		switch (action.type) {
			case "SET_COLLABORATION_SUPPORTED": return action.supported;
			case "SET_SYNC_CONNECTION_STATUS":
				if (ConnectionErrorCode.DOCUMENT_SIZE_LIMIT_EXCEEDED === action.status?.error?.code) return false;
				return state;
		}
		return state;
	}
	/**
	* Reducer managing view configs, keyed by `kind/name`.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function viewConfigs(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_VIEW_CONFIG": {
				const key = `${action.kind}/${action.name}`;
				return {
					...state,
					[key]: {
						...state[key],
						...action.config
					}
				};
			}
		}
		return state;
	}
	/**
	* Reducer managing the fields configs, keyed by kind, then name.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function fieldsConfigs(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_FIELDS_CONFIG": return {
				...state,
				[action.kind]: {
					...state[action.kind],
					[action.name]: action.config
				}
			};
		}
		return state;
	}
	/**
	* Reducer managing the actions configs, keyed by kind, then name.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function entityActionsConfigs(state = {}, action) {
		switch (action.type) {
			case "RECEIVE_ENTITY_ACTIONS_CONFIG": return {
				...state,
				[action.kind]: {
					...state[action.kind],
					[action.name]: action.config
				}
			};
		}
		return state;
	}
	var reducer_default = (0, _wordpress_data.combineReducers)({
		users,
		currentTheme,
		currentGlobalStylesId,
		currentUser,
		themeGlobalStyleVariations,
		themeBaseGlobalStyles,
		themeGlobalStyleRevisions,
		entities,
		editsReference,
		undoManagerReference,
		undoManager,
		embedPreviews,
		userPermissions,
		autosaves,
		blockPatterns,
		blockPatternCategories,
		userPatternCategories,
		navigationFallbackId,
		defaultTemplates,
		registeredPostMeta,
		editorSettings,
		editorAssets,
		syncConnectionStatuses,
		collaborationSupported,
		viewConfigs,
		fieldsConfigs,
		entityActionsConfigs
	});

// packages/core-data/build-module/utils/log-entity-deprecation.mjs
	let loggedAlready = false;
	/**
	* Logs a deprecation warning for an entity, if it's deprecated.
	*
	* @param kind                            The kind of the entity.
	* @param name                            The name of the entity.
	* @param functionName                    The name of the function that was called with a deprecated entity.
	* @param options                         The options for the deprecation warning.
	* @param options.alternativeFunctionName The name of the alternative function that should be used instead.
	* @param options.isShorthandSelector     Whether the function is a shorthand selector.
	*/
	function logEntityDeprecation(kind, name, functionName, { alternativeFunctionName, isShorthandSelector = false } = {}) {
		const deprecation = deprecatedEntities[kind]?.[name];
		if (!deprecation) return;
		if (!loggedAlready) {
			const { alternative } = deprecation;
			const message = isShorthandSelector ? `'${functionName}'` : `The '${kind}', '${name}' entity (used via '${functionName}')`;
			let alternativeMessage = `the '${alternative.kind}', '${alternative.name}' entity`;
			if (alternativeFunctionName) alternativeMessage += ` via the '${alternativeFunctionName}' function`;
			(0, _wordpress_deprecated.default)(message, {
				...deprecation,
				alternative: alternativeMessage
			});
		}
		loggedAlready = true;
		setTimeout(() => {
			loggedAlready = false;
		}, 0);
	}

// packages/core-data/build-module/private-selectors.mjs
	var private_selectors_exports = /* @__PURE__ */ __exportAll({
		getBlockPatternsForPostType: () => getBlockPatternsForPostType,
		getEditorAssets: () => getEditorAssets$1,
		getEditorSettings: () => getEditorSettings$1,
		getEntityActionsConfig: () => getEntityActionsConfig$1,
		getEntityRecordPermissions: () => getEntityRecordPermissions,
		getEntityRecordsPermissions: () => getEntityRecordsPermissions,
		getEntitySyncConnectionStatus: () => getEntitySyncConnectionStatus,
		getFieldsConfig: () => getFieldsConfig$1,
		getHomePage: () => getHomePage,
		getNavigationFallbackId: () => getNavigationFallbackId$1,
		getPostsPageId: () => getPostsPageId,
		getRegisteredPostMeta: () => getRegisteredPostMeta$1,
		getSyncConnectionStatus: () => getSyncConnectionStatus,
		getTemplateId: () => getTemplateId,
		getUndoManager: () => getUndoManager,
		getViewConfig: () => getViewConfig$1,
		isCollaborationSupported: () => isCollaborationSupported
	}, 1);
	const EMPTY_OBJECT$3 = {};
	/**
	* Returns the undo manager holding the entity records edits history.
	*
	* @param state State tree.
	*
	* @return The undo manager.
	*/
	function getUndoManager(state) {
		return state.undoManager;
	}
	/**
	* Retrieve the fallback Navigation.
	*
	* @param state Data state.
	* @return The ID for the fallback Navigation post.
	*/
	function getNavigationFallbackId$1(state) {
		return state.navigationFallbackId;
	}
	const getBlockPatternsForPostType = (0, _wordpress_data.createRegistrySelector)((select) => (0, _wordpress_data.createSelector)((state, postType) => select(STORE_NAME).getBlockPatterns().filter(({ postTypes }) => !postTypes || Array.isArray(postTypes) && postTypes.includes(postType)), () => [select(STORE_NAME).getBlockPatterns()]));
	/**
	* Returns the entity records permissions for the given entity record ids.
	*/
	const getEntityRecordsPermissions = (0, _wordpress_data.createRegistrySelector)((select) => (0, _wordpress_data.createSelector)((state, kind, name, ids) => {
		return (Array.isArray(ids) ? ids : [ids]).map((id) => ({
			delete: select(STORE_NAME).canUser("delete", {
				kind,
				name,
				id
			}),
			update: select(STORE_NAME).canUser("update", {
				kind,
				name,
				id
			})
		}));
	}, (state) => [state.userPermissions]));
	/**
	* Returns the entity record permissions for the given entity record id.
	*
	* @param state Data state.
	* @param kind  Entity kind.
	* @param name  Entity name.
	* @param id    Entity record id.
	*
	* @return The entity record permissions.
	*/
	function getEntityRecordPermissions(state, kind, name, id) {
		logEntityDeprecation(kind, name, "getEntityRecordPermissions");
		return getEntityRecordsPermissions(state, kind, name, id)[0];
	}
	/**
	* Returns the registered post meta fields for a given post type.
	*
	* @param state    Data state.
	* @param postType Post type.
	*
	* @return Registered post meta fields.
	*/
	function getRegisteredPostMeta$1(state, postType) {
		return state.registeredPostMeta?.[postType] ?? {};
	}
	function normalizePageId(value) {
		if (!value || !["number", "string"].includes(typeof value)) return null;
		if (Number(value) === 0) return null;
		return value.toString();
	}
	const getHomePage = (0, _wordpress_data.createRegistrySelector)((select) => (0, _wordpress_data.createSelector)(() => {
		const siteData = select(STORE_NAME).getEntityRecord("root", "__unstableBase");
		if (!siteData) return null;
		const homepageId = siteData?.show_on_front === "page" ? normalizePageId(siteData.page_on_front) : null;
		if (homepageId) return {
			postType: "page",
			postId: homepageId
		};
		const frontPageTemplateId = select(STORE_NAME).getDefaultTemplateId({ slug: "front-page" });
		if (frontPageTemplateId) return {
			postType: "wp_template",
			postId: frontPageTemplateId
		};
		if (frontPageTemplateId === "") return EMPTY_OBJECT$3;
		return null;
	}, (state) => [
		getEntityRecord$1(state, "root", "site"),
		getEntityRecord$1(state, "root", "__unstableBase"),
		getDefaultTemplateId$1(state, { slug: "front-page" })
	]));
	const getPostsPageId = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		const siteData = select(STORE_NAME).getEntityRecord("root", "__unstableBase");
		return siteData?.show_on_front === "page" ? normalizePageId(siteData.page_for_posts) : null;
	});
	const getTemplateId = (0, _wordpress_data.createRegistrySelector)((select) => (state, postType, postId) => {
		const homepage = unlock(select(STORE_NAME)).getHomePage();
		if (!homepage) return;
		if (postType === "page" && postType === homepage?.postType && postId.toString() === homepage?.postId) {
			const templates = select(STORE_NAME).getEntityRecords("postType", "wp_template", { per_page: -1 });
			if (!templates) return;
			const id = templates.find(({ slug }) => slug === "front-page")?.id;
			if (id) return id;
		}
		const editedEntity = select(STORE_NAME).getEditedEntityRecord("postType", postType, postId);
		if (!editedEntity) return;
		const postsPageId = unlock(select(STORE_NAME)).getPostsPageId();
		if (postType === "page" && postsPageId === postId.toString()) return select(STORE_NAME).getDefaultTemplateId({ slug: "home" });
		const currentTemplateSlug = editedEntity.template;
		if (currentTemplateSlug) {
			const currentTemplate = select(STORE_NAME).getEntityRecords("postType", "wp_template", { per_page: -1 })?.find(({ slug }) => slug === currentTemplateSlug);
			if (currentTemplate) return currentTemplate.id;
		}
		let slugToCheck;
		if (editedEntity.slug) slugToCheck = postType === "page" ? `${postType}-${editedEntity.slug}` : `single-${postType}-${editedEntity.slug}`;
		else slugToCheck = postType === "page" ? "page" : `single-${postType}`;
		return select(STORE_NAME).getDefaultTemplateId({ slug: slugToCheck });
	});
	/**
	* Returns the editor settings.
	*
	* @param state Data state.
	* @return Editor settings object or null if not loaded.
	*/
	function getEditorSettings$1(state) {
		return state.editorSettings;
	}
	/**
	* Returns the editor assets.
	*
	* @param state Data state.
	* @return Editor assets object or null if not loaded.
	*/
	function getEditorAssets$1(state) {
		return state.editorAssets;
	}
	/**
	* Returns whether collaboration is supported.
	*
	* @param state Data state.
	* @return Whether collaboration is supported.
	*/
	function isCollaborationSupported(state) {
		return state.collaborationSupported;
	}
	/**
	* Returns the view configuration for the given entity type.
	*
	* An optional fourth argument (e.g. `{ fields }`) may be passed when selecting;
	* it is consumed by the `getViewConfig` resolver to request a subset of the
	* config via the REST API `_fields` parameter and does not affect what is read
	* here. Partial responses are merged in the reducer, so the returned object may
	* accumulate properties across requests for the same entity.
	*
	* @param state Data state.
	* @param kind  Entity kind.
	* @param name  Entity name.
	*
	* @return The view configuration or undefined if not loaded.
	*/
	function getViewConfig$1(state, kind, name) {
		return state.viewConfigs?.[`${kind}/${name}`] ?? {
			default_view: void 0,
			default_layouts: void 0,
			view_list: void 0,
			form: void 0
		};
	}
	/**
	* Returns the fields registered on the server for the given entity, as the
	* `/wp/v2/entity-fields` REST API route returns them.
	*
	* @param state Data state.
	* @param kind  Entity kind.
	* @param name  Entity name.
	*
	* @return The fields config, or undefined if not loaded.
	*/
	function getFieldsConfig$1(state, kind, name) {
		return state.fieldsConfigs?.[kind]?.[name];
	}
	/**
	* Returns the actions registered on the server for the given entity, as the
	* `/wp/v2/entity-actions` REST API route returns them: the serializable part of each
	* action, and the script modules providing their JavaScript parts.
	*
	* @param state Data state.
	* @param kind  Entity kind.
	* @param name  Entity name.
	*
	* @return The actions config, or undefined if not loaded.
	*/
	function getEntityActionsConfig$1(state, kind, name) {
		return state.entityActionsConfigs?.[kind]?.[name];
	}
	/**
	* Returns the current sync connection status across all entities. Prioritizes
	* disconnected states, then connecting, then connected.
	*
	* @param state Data state.
	*
	* @return The current sync connection state, prioritized by importance.
	*/
	function getSyncConnectionStatus(state) {
		if (!state.syncConnectionStatuses) return;
		const PRIORITIZED_STATUSES = [
			"disconnected",
			"connecting",
			"connected"
		];
		let coalesced;
		for (const status of Object.values(state.syncConnectionStatuses)) if (!coalesced || PRIORITIZED_STATUSES.indexOf(status.status) < PRIORITIZED_STATUSES.indexOf(coalesced.status)) coalesced = status;
		return coalesced;
	}
	/**
	* Returns the sync connection status for a single entity, or undefined if
	* the entity is not being synced or no provider has reported a status yet.
	*
	* @param state    Data state.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Record ID.
	*
	* @return The sync connection status for the entity.
	*/
	function getEntitySyncConnectionStatus(state, kind, name, recordId) {
		return state.syncConnectionStatuses?.[`${kind}/${name}:${recordId}`];
	}

// packages/core-data/build-module/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		__experimentalGetCurrentGlobalStylesId: () => __experimentalGetCurrentGlobalStylesId$1,
		__experimentalGetCurrentThemeBaseGlobalStyles: () => __experimentalGetCurrentThemeBaseGlobalStyles$1,
		__experimentalGetCurrentThemeGlobalStylesVariations: () => __experimentalGetCurrentThemeGlobalStylesVariations$1,
		__experimentalGetDirtyEntityRecords: () => __experimentalGetDirtyEntityRecords,
		__experimentalGetEntitiesBeingSaved: () => __experimentalGetEntitiesBeingSaved,
		__experimentalGetEntityRecordNoResolver: () => __experimentalGetEntityRecordNoResolver,
		canUser: () => canUser$1,
		canUserEditEntityRecord: () => canUserEditEntityRecord$1,
		getAuthors: () => getAuthors$1,
		getAutosave: () => getAutosave$1,
		getAutosaves: () => getAutosaves$1,
		getBlockPatternCategories: () => getBlockPatternCategories$1,
		getBlockPatterns: () => getBlockPatterns$1,
		getCurrentTheme: () => getCurrentTheme$1,
		getCurrentThemeGlobalStylesRevisions: () => getCurrentThemeGlobalStylesRevisions$1,
		getCurrentUser: () => getCurrentUser$1,
		getDefaultTemplateId: () => getDefaultTemplateId$1,
		getEditedEntityRecord: () => getEditedEntityRecord$1,
		getEmbedPreview: () => getEmbedPreview$1,
		getEntitiesByKind: () => getEntitiesByKind,
		getEntitiesConfig: () => getEntitiesConfig$1,
		getEntity: () => getEntity,
		getEntityConfig: () => getEntityConfig,
		getEntityRecord: () => getEntityRecord$1,
		getEntityRecordEdits: () => getEntityRecordEdits,
		getEntityRecordNonTransientEdits: () => getEntityRecordNonTransientEdits,
		getEntityRecords: () => getEntityRecords$1,
		getEntityRecordsTotalItems: () => getEntityRecordsTotalItems$1,
		getEntityRecordsTotalPages: () => getEntityRecordsTotalPages$1,
		getLastEntityDeleteError: () => getLastEntityDeleteError,
		getLastEntitySaveError: () => getLastEntitySaveError,
		getRawEntityRecord: () => getRawEntityRecord$1,
		getRedoEdit: () => getRedoEdit,
		getReferenceByDistinctEdits: () => getReferenceByDistinctEdits,
		getRevision: () => getRevision$1,
		getRevisions: () => getRevisions$1,
		getThemeSupports: () => getThemeSupports$1,
		getUndoEdit: () => getUndoEdit,
		getUserPatternCategories: () => getUserPatternCategories$1,
		getUserQueryResults: () => getUserQueryResults,
		hasEditsForEntityRecord: () => hasEditsForEntityRecord,
		hasEntityRecord: () => hasEntityRecord,
		hasEntityRecords: () => hasEntityRecords,
		hasFetchedAutosaves: () => hasFetchedAutosaves,
		hasRedo: () => hasRedo,
		hasRevision: () => hasRevision,
		hasUndo: () => hasUndo,
		isAutosavingEntityRecord: () => isAutosavingEntityRecord,
		isDeletingEntityRecord: () => isDeletingEntityRecord,
		isPreviewEmbedFallback: () => isPreviewEmbedFallback,
		isRequestingEmbedPreview: () => isRequestingEmbedPreview,
		isSavingEntityRecord: () => isSavingEntityRecord
	}, 1);
	/**
	* Shared reference to an empty object for cases where it is important to avoid
	* returning a new object reference on every invocation, as in a connected or
	* other pure component which performs `shouldComponentUpdate` check on props.
	* This should be used as a last resort, since the normalized data should be
	* maintained by the reducer result in state.
	*/
	const EMPTY_OBJECT$2 = {};
	/**
	* Returns true if a request is in progress for embed preview data, or false
	* otherwise.
	*
	* @param state Data state.
	* @param url   URL the preview would be for.
	*
	* @return Whether a request is in progress for an embed preview.
	*/
	const isRequestingEmbedPreview = (0, _wordpress_data.createRegistrySelector)((select) => (state, url) => {
		return select(STORE_NAME).isResolving("getEmbedPreview", [url]);
	});
	/**
	* Returns all available authors.
	*
	* @deprecated since 11.3. Callers should use `select( 'core' ).getUsers({ who: 'authors' })` instead.
	*
	* @param      state Data state.
	* @param      query Optional object of query parameters to
	*                   include with request. For valid query parameters see the [Users page](https://developer.wordpress.org/rest-api/reference/users/) in the REST API Handbook and see the arguments for [List Users](https://developer.wordpress.org/rest-api/reference/users/#list-users) and [Retrieve a User](https://developer.wordpress.org/rest-api/reference/users/#retrieve-a-user).
	* @return Authors list.
	*/
	function getAuthors$1(state, query) {
		(0, _wordpress_deprecated.default)("select( 'core' ).getAuthors()", {
			since: "5.9",
			alternative: "select( 'core' ).getUsers({ who: 'authors' })"
		});
		const path = (0, _wordpress_url.addQueryArgs)("/wp/v2/users/?who=authors&per_page=100", query);
		return getUserQueryResults(state, path);
	}
	/**
	* Returns the current user.
	*
	* @param state Data state.
	*
	* @return Current user object.
	*/
	function getCurrentUser$1(state) {
		return state.currentUser;
	}
	/**
	* Returns all the users returned by a query ID.
	*
	* @param state   Data state.
	* @param queryID Query ID.
	*
	* @return Users list.
	*/
	const getUserQueryResults = (0, _wordpress_data.createSelector)((state, queryID) => {
		return (state.users.queries[queryID] ?? []).map((id) => state.users.byId[id]);
	}, (state, queryID) => [state.users.queries[queryID], state.users.byId]);
	/**
	* Returns the loaded entities for the given kind.
	*
	* @deprecated since WordPress 6.0. Use getEntitiesConfig instead
	* @param      state Data state.
	* @param      kind  Entity kind.
	*
	* @return Array of entities with config matching kind.
	*/
	function getEntitiesByKind(state, kind) {
		(0, _wordpress_deprecated.default)("wp.data.select( 'core' ).getEntitiesByKind()", {
			since: "6.0",
			alternative: "wp.data.select( 'core' ).getEntitiesConfig()"
		});
		return getEntitiesConfig$1(state, kind);
	}
	/**
	* Returns the loaded entities for the given kind.
	*
	* @param state Data state.
	* @param kind  Entity kind.
	*
	* @return Array of entities with config matching kind.
	*/
	const getEntitiesConfig$1 = (0, _wordpress_data.createSelector)((state, kind) => state.entities.config.filter((entity) => entity.kind === kind), (state, kind) => state.entities.config);
	/**
	* Returns the entity config given its kind and name.
	*
	* @deprecated since WordPress 6.0. Use getEntityConfig instead
	* @param      state Data state.
	* @param      kind  Entity kind.
	* @param      name  Entity name.
	*
	* @return Entity config
	*/
	function getEntity(state, kind, name) {
		(0, _wordpress_deprecated.default)("wp.data.select( 'core' ).getEntity()", {
			since: "6.0",
			alternative: "wp.data.select( 'core' ).getEntityConfig()"
		});
		return getEntityConfig(state, kind, name);
	}
	/**
	* Returns the entity config given its kind and name.
	*
	* @param state Data state.
	* @param kind  Entity kind.
	* @param name  Entity name.
	*
	* @return Entity config
	*/
	function getEntityConfig(state, kind, name) {
		logEntityDeprecation(kind, name, "getEntityConfig");
		return state.entities.config?.find((config) => config.kind === kind && config.name === name);
	}
	/**
	* Returns the Entity's record object by key. Returns `null` if the value is not
	* yet received, undefined if the value entity is known to not exist, or the
	* entity object if it exists and is received.
	*
	* @param state    State tree
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Is omitted for keyless entities.
	* @param query    Optional query. If requesting specific
	*                 fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available "Retrieve a [Entity kind]".
	*
	* @return Record.
	*/
	const getEntityRecord$1 = ((state, kind, name, recordId, query) => {
		logEntityDeprecation(kind, name, "getEntityRecord");
		const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
		if (!queriedState) return;
		const context = query?.context ?? "default";
		if (!query || !query._fields) {
			if (!queriedState.itemIsComplete[context]?.[recordId]) return;
			return queriedState.items[context][recordId];
		}
		const item = queriedState.items[context]?.[recordId];
		if (!item) return item;
		return getFilteredItem(item, query._fields);
	});
	/**
	* Normalizes `recordKey`s that look like numeric IDs to numbers.
	*
	* @param args EntityRecordArgs the selector arguments.
	* @return EntityRecordArgs the normalized arguments.
	*/
	getEntityRecord$1.normalizeArgs = (args) => {
		const newArgs = [...args];
		const recordKey = newArgs?.[2];
		newArgs[2] = isNumericID(recordKey) ? Number(recordKey) : recordKey;
		return newArgs;
	};
	/**
	* Returns true if a record has been received for the given set of parameters, or false otherwise.
	*
	* Note: This action does not trigger a request for the entity record from the API
	* if it's not available in the local state.
	*
	* @param state    State tree
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Is omitted for keyless entities.
	* @param query    Optional query.
	*
	* @return Whether an entity record has been received.
	*/
	function hasEntityRecord(state, kind, name, recordId, query) {
		const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
		if (!queriedState) return false;
		const context = query?.context ?? "default";
		if (!query || !query._fields) return !!queriedState.itemIsComplete[context]?.[recordId];
		const item = queriedState.items[context]?.[recordId];
		if (!item) return false;
		const fields = getNormalizedCommaSeparable(query._fields) ?? [];
		for (let i = 0; i < fields.length; i++) {
			const path = fields[i].split(".");
			let value = item;
			for (let p = 0; p < path.length; p++) {
				const part = path[p];
				if (!value || !Object.hasOwn(value, part)) return false;
				value = value[part];
			}
		}
		return true;
	}
	/**
	* Returns the Entity's record object by key. Doesn't trigger a resolver nor requests the entity records from the API if the entity record isn't available in the local state.
	*
	* @param state    State tree
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Record ID.
	*
	* @return Record.
	*/
	function __experimentalGetEntityRecordNoResolver(state, kind, name, recordId) {
		return getEntityRecord$1(state, kind, name, recordId);
	}
	/**
	* Returns the entity's record object by key,
	* with its attributes mapped to their raw values.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Is omitted for keyless entities.
	*
	* @return Object with the entity's raw attributes.
	*/
	const getRawEntityRecord$1 = (0, _wordpress_data.createSelector)((state, kind, name, recordId) => {
		logEntityDeprecation(kind, name, "getRawEntityRecord");
		const record = getEntityRecord$1(state, kind, name, recordId);
		const config = getEntityConfig(state, kind, name);
		if (!record || !config?.rawAttributes?.length) return record;
		return Object.fromEntries(Object.keys(record).map((key) => {
			if (config.rawAttributes.includes(key)) {
				const rawValue = record[key]?.raw;
				return [key, rawValue !== void 0 ? rawValue : record[key]];
			}
			return [key, record[key]];
		}));
	}, (state, kind, name, recordId, query) => {
		const context = query?.context ?? "default";
		return [
			state.entities.config,
			state.entities.records?.[kind]?.[name]?.queriedData?.items[context]?.[recordId],
			state.entities.records?.[kind]?.[name]?.queriedData?.itemIsComplete[context]?.[recordId]
		];
	});
	/**
	* Returns true if records have been received for the given set of parameters,
	* or false otherwise.
	*
	* @param state State tree
	* @param kind  Entity kind.
	* @param name  Entity name.
	* @param query Optional terms query. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for "List [Entity kind]s".
	*
	* @return  Whether entity records have been received.
	*/
	function hasEntityRecords(state, kind, name, query) {
		logEntityDeprecation(kind, name, "hasEntityRecords");
		return Array.isArray(getEntityRecords$1(state, kind, name, query));
	}
	/**
	* Returns the Entity's records.
	*
	* @param state State tree
	* @param kind  Entity kind.
	* @param name  Entity name.
	* @param query Optional terms query. If requesting specific
	*              fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for "List [Entity kind]s".
	*
	* @return Records.
	*/
	const getEntityRecords$1 = ((state, kind, name, query) => {
		logEntityDeprecation(kind, name, "getEntityRecords");
		const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
		if (!queriedState) return null;
		return getQueriedItems(queriedState, query, { supportsPagination: !!getEntityConfig(state, kind, name)?.supportsPagination });
	});
	/**
	* Returns the Entity's total available records for a given query (ignoring pagination).
	*
	* @param state State tree
	* @param kind  Entity kind.
	* @param name  Entity name.
	* @param query Optional terms query. If requesting specific
	*              fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for "List [Entity kind]s".
	*
	* @return number | null.
	*/
	const getEntityRecordsTotalItems$1 = (state, kind, name, query) => {
		logEntityDeprecation(kind, name, "getEntityRecordsTotalItems");
		const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
		if (!queriedState) return null;
		return getQueriedTotalItems(queriedState, query);
	};
	/**
	* Returns the number of available pages for the given query.
	*
	* @param state State tree
	* @param kind  Entity kind.
	* @param name  Entity name.
	* @param query Optional terms query. If requesting specific
	*              fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for "List [Entity kind]s".
	*
	* @return number | null.
	*/
	const getEntityRecordsTotalPages$1 = (state, kind, name, query) => {
		logEntityDeprecation(kind, name, "getEntityRecordsTotalPages");
		const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
		if (!queriedState) return null;
		if (!getEntityConfig(state, kind, name)?.supportsPagination || query?.per_page === -1) return 1;
		const totalItems = getQueriedTotalItems(queriedState, query);
		if (!totalItems) return totalItems;
		if (!query?.per_page) return getQueriedTotalPages(queriedState, query);
		return Math.ceil(totalItems / query.per_page);
	};
	/**
	* Returns the list of dirty entity records.
	*
	* @param state State tree.
	*
	* @return The list of updated records
	*/
	const __experimentalGetDirtyEntityRecords = (0, _wordpress_data.createSelector)((state) => {
		const { entities: { records } } = state;
		const dirtyRecords = [];
		Object.keys(records).forEach((kind) => {
			Object.keys(records[kind]).forEach((name) => {
				const primaryKeys = Object.keys(records[kind][name].edits).filter((primaryKey) => getEntityRecord$1(state, kind, name, primaryKey) && hasEditsForEntityRecord(state, kind, name, primaryKey));
				if (primaryKeys.length) {
					const entityConfig = getEntityConfig(state, kind, name);
					primaryKeys.forEach((primaryKey) => {
						const entityRecord = getEditedEntityRecord$1(state, kind, name, primaryKey);
						dirtyRecords.push({
							key: entityRecord ? entityRecord[entityConfig.key || "id"] : void 0,
							title: entityConfig?.getTitle?.(entityRecord) || "",
							name,
							kind
						});
					});
				}
			});
		});
		return dirtyRecords;
	}, (state) => [state.entities.records]);
	/**
	* Returns the list of entities currently being saved.
	*
	* @param state State tree.
	*
	* @return The list of records being saved.
	*/
	const __experimentalGetEntitiesBeingSaved = (0, _wordpress_data.createSelector)((state) => {
		const { entities: { records } } = state;
		const recordsBeingSaved = [];
		Object.keys(records).forEach((kind) => {
			Object.keys(records[kind]).forEach((name) => {
				const primaryKeys = Object.keys(records[kind][name].saving).filter((primaryKey) => isSavingEntityRecord(state, kind, name, primaryKey));
				if (primaryKeys.length) {
					const entityConfig = getEntityConfig(state, kind, name);
					primaryKeys.forEach((primaryKey) => {
						const entityRecord = getEditedEntityRecord$1(state, kind, name, primaryKey);
						recordsBeingSaved.push({
							key: entityRecord ? entityRecord[entityConfig.key || "id"] : void 0,
							title: entityConfig?.getTitle?.(entityRecord) || "",
							name,
							kind
						});
					});
				}
			});
		});
		return recordsBeingSaved;
	}, (state) => [state.entities.records]);
	/**
	* Returns the specified entity record's edits.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Is omitted for keyless entities.
	*
	* @return The entity record's edits.
	*/
	function getEntityRecordEdits(state, kind, name, recordId) {
		logEntityDeprecation(kind, name, "getEntityRecordEdits");
		return state.entities.records?.[kind]?.[name]?.edits?.[String(recordId)];
	}
	/**
	* Returns the specified entity record's non transient edits.
	*
	* Transient edits don't create an undo level, and
	* are not considered for change detection.
	* They are defined in the entity's config.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Is omitted for keyless entities.
	*
	* @return The entity record's non transient edits.
	*/
	const getEntityRecordNonTransientEdits = (0, _wordpress_data.createSelector)((state, kind, name, recordId) => {
		logEntityDeprecation(kind, name, "getEntityRecordNonTransientEdits");
		const { transientEdits } = getEntityConfig(state, kind, name) || {};
		const edits = getEntityRecordEdits(state, kind, name, recordId) || {};
		if (!transientEdits) return edits;
		return Object.keys(edits).reduce((acc, key) => {
			if (!transientEdits[key]) acc[key] = edits[key];
			return acc;
		}, {});
	}, (state, kind, name, recordId) => [state.entities.config, state.entities.records?.[kind]?.[name]?.edits?.[String(recordId)]]);
	/**
	* Returns true if the specified entity record has edits,
	* and false otherwise.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Is omitted for keyless entities.
	*
	* @return Whether the entity record has edits or not.
	*/
	function hasEditsForEntityRecord(state, kind, name, recordId) {
		logEntityDeprecation(kind, name, "hasEditsForEntityRecord");
		return isSavingEntityRecord(state, kind, name, recordId) || Object.keys(getEntityRecordNonTransientEdits(state, kind, name, recordId)).length > 0;
	}
	/**
	* Returns the specified entity record, merged with its edits.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Is omitted for keyless entities.
	*
	* @return The entity record, merged with its edits.
	*/
	const getEditedEntityRecord$1 = (0, _wordpress_data.createSelector)((state, kind, name, recordId) => {
		logEntityDeprecation(kind, name, "getEditedEntityRecord");
		const raw = getRawEntityRecord$1(state, kind, name, recordId);
		const edited = getEntityRecordEdits(state, kind, name, recordId);
		if (!raw && !edited) return false;
		return {
			...raw,
			...edited
		};
	}, (state, kind, name, recordId, query) => {
		const context = query?.context ?? "default";
		return [
			state.entities.config,
			state.entities.records?.[kind]?.[name]?.queriedData.items[context]?.[recordId],
			state.entities.records?.[kind]?.[name]?.queriedData.itemIsComplete[context]?.[recordId],
			state.entities.records?.[kind]?.[name]?.edits?.[String(recordId)]
		];
	});
	/**
	* Returns true if the specified entity record is autosaving, and false otherwise.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Record ID.
	*
	* @return Whether the entity record is autosaving or not.
	*/
	function isAutosavingEntityRecord(state, kind, name, recordId) {
		logEntityDeprecation(kind, name, "isAutosavingEntityRecord");
		const { pending, isAutosave } = state.entities.records?.[kind]?.[name]?.saving?.[recordId] ?? {};
		return Boolean(pending && isAutosave);
	}
	/**
	* Returns true if the specified entity record is saving, and false otherwise.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Is omitted for keyless entities.
	*
	* @return Whether the entity record is saving or not.
	*/
	function isSavingEntityRecord(state, kind, name, recordId) {
		logEntityDeprecation(kind, name, "isSavingEntityRecord");
		return state.entities.records?.[kind]?.[name]?.saving?.[String(recordId)]?.pending ?? false;
	}
	/**
	* Returns true if the specified entity record is deleting, and false otherwise.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Record ID.
	*
	* @return Whether the entity record is deleting or not.
	*/
	function isDeletingEntityRecord(state, kind, name, recordId) {
		logEntityDeprecation(kind, name, "isDeletingEntityRecord");
		return state.entities.records?.[kind]?.[name]?.deleting?.[String(recordId)]?.pending ?? false;
	}
	/**
	* Returns the specified entity record's last save error.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Is omitted for keyless entities.
	*
	* @return The entity record's save error.
	*/
	function getLastEntitySaveError(state, kind, name, recordId) {
		logEntityDeprecation(kind, name, "getLastEntitySaveError");
		return state.entities.records?.[kind]?.[name]?.saving?.[String(recordId)]?.error;
	}
	/**
	* Returns the specified entity record's last delete error.
	*
	* @param state    State tree.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Record ID.
	*
	* @return The entity record's save error.
	*/
	function getLastEntityDeleteError(state, kind, name, recordId) {
		logEntityDeprecation(kind, name, "getLastEntityDeleteError");
		return state.entities.records?.[kind]?.[name]?.deleting?.[recordId]?.error;
	}
	/**
	* Returns the previous edit from the current undo offset
	* for the entity records edits history, if any.
	*
	* @deprecated since 6.3
	*
	* @param      state State tree.
	*
	* @return The edit.
	*/
	function getUndoEdit(state) {
		(0, _wordpress_deprecated.default)("select( 'core' ).getUndoEdit()", { since: "6.3" });
	}
	/**
	* Returns the next edit from the current undo offset
	* for the entity records edits history, if any.
	*
	* @deprecated since 6.3
	*
	* @param      state State tree.
	*
	* @return The edit.
	*/
	function getRedoEdit(state) {
		(0, _wordpress_deprecated.default)("select( 'core' ).getRedoEdit()", { since: "6.3" });
	}
	/**
	* Returns true if there is a previous edit from the current undo offset
	* for the entity records edits history, and false otherwise.
	*
	* @param state State tree.
	*
	* @return Whether there is a previous edit or not.
	*/
	function hasUndo(state) {
		return getUndoManager(state).hasUndo();
	}
	/**
	* Returns true if there is a next edit from the current undo offset
	* for the entity records edits history, and false otherwise.
	*
	* @param state State tree.
	*
	* @return Whether there is a next edit or not.
	*/
	function hasRedo(state) {
		return getUndoManager(state).hasRedo();
	}
	/**
	* Return the current theme.
	*
	* @param state Data state.
	*
	* @return The current theme.
	*/
	function getCurrentTheme$1(state) {
		if (!state.currentTheme) return null;
		return getEntityRecord$1(state, "root", "theme", state.currentTheme);
	}
	/**
	* Return the ID of the current global styles object.
	*
	* @param state Data state.
	*
	* @return The current global styles ID.
	*/
	function __experimentalGetCurrentGlobalStylesId$1(state) {
		return state.currentGlobalStylesId;
	}
	/**
	* Return theme supports data in the index.
	*
	* @param state Data state.
	*
	* @return Index data.
	*/
	function getThemeSupports$1(state) {
		return getCurrentTheme$1(state)?.theme_supports ?? EMPTY_OBJECT$2;
	}
	/**
	* Returns the embed preview for the given URL.
	*
	* @param state Data state.
	* @param url   Embedded URL.
	*
	* @return Undefined if the preview has not been fetched, otherwise, the preview fetched from the embed preview API.
	*/
	function getEmbedPreview$1(state, url) {
		return state.embedPreviews[url];
	}
	/**
	* Determines if the returned preview is an oEmbed link fallback.
	*
	* WordPress can be configured to return a simple link to a URL if it is not embeddable.
	* We need to be able to determine if a URL is embeddable or not, based on what we
	* get back from the oEmbed preview API.
	*
	* @param state Data state.
	* @param url   Embedded URL.
	*
	* @return Is the preview for the URL an oEmbed link fallback.
	*/
	function isPreviewEmbedFallback(state, url) {
		const preview = state.embedPreviews[url];
		const oEmbedLinkCheck = "<a href=\"" + url + "\">" + url + "</a>";
		if (!preview) return false;
		return preview.html === oEmbedLinkCheck;
	}
	/**
	* Returns whether the current user can perform the given action on the given
	* REST resource.
	*
	* Calling this may trigger an OPTIONS request to the REST API via the
	* `canUser()` resolver.
	*
	* https://developer.wordpress.org/rest-api/reference/
	*
	* @param state    Data state.
	* @param action   Action to check. One of: 'create', 'read', 'update', 'delete'.
	* @param resource Entity resource to check. Accepts entity object `{ kind: 'postType', name: 'attachment', id: 1 }`
	*                 or REST base as a string - `media`.
	* @param id       Optional ID of the rest resource to check.
	*
	* @return Whether or not the user can perform the action,
	*                             or `undefined` if the OPTIONS request is still being made.
	*/
	function canUser$1(state, action, resource, id) {
		const isEntity = typeof resource === "object";
		if (isEntity && (!resource.kind || !resource.name)) return false;
		if (isEntity) logEntityDeprecation(resource.kind, resource.name, "canUser");
		const key = getUserPermissionCacheKey(action, resource, id);
		return state.userPermissions[key];
	}
	/**
	* Returns whether the current user can edit the given entity.
	*
	* Calling this may trigger an OPTIONS request to the REST API via the
	* `canUser()` resolver.
	*
	* https://developer.wordpress.org/rest-api/reference/
	*
	* @param state    Data state.
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Record's id.
	* @return Whether or not the user can edit,
	* or `undefined` if the OPTIONS request is still being made.
	*/
	function canUserEditEntityRecord$1(state, kind, name, recordId) {
		(0, _wordpress_deprecated.default)(`wp.data.select( 'core' ).canUserEditEntityRecord()`, {
			since: "6.7",
			alternative: `wp.data.select( 'core' ).canUser( 'update', { kind, name, id } )`
		});
		return canUser$1(state, "update", {
			kind,
			name,
			id: recordId
		});
	}
	/**
	* Returns the latest autosaves for the post.
	*
	* May return multiple autosaves since the backend stores one autosave per
	* author for each post.
	*
	* @param state    State tree.
	* @param postType The type of the parent post.
	* @param postId   The id of the parent post.
	*
	* @return An array of autosaves for the post, or undefined if there is none.
	*/
	function getAutosaves$1(state, postType, postId) {
		return state.autosaves[postId];
	}
	/**
	* Returns the autosave for the post and author.
	*
	* @param state    State tree.
	* @param postType The type of the parent post.
	* @param postId   The id of the parent post.
	* @param authorId The id of the author.
	*
	* @return The autosave for the post and author.
	*/
	function getAutosave$1(state, postType, postId, authorId) {
		if (authorId === void 0) return;
		return state.autosaves[postId]?.find((autosave) => autosave.author === authorId);
	}
	/**
	* Returns true if the REST request for autosaves has completed.
	*
	* @param state    State tree.
	* @param postType The type of the parent post.
	* @param postId   The id of the parent post.
	*
	* @return True if the REST request was completed. False otherwise.
	*/
	const hasFetchedAutosaves = (0, _wordpress_data.createRegistrySelector)((select) => (state, postType, postId) => {
		return select(STORE_NAME).hasFinishedResolution("getAutosaves", [postType, postId]);
	});
	/**
	* Returns a new reference when edited values have changed. This is useful in
	* inferring where an edit has been made between states by comparison of the
	* return values using strict equality.
	*
	* @example
	*
	* ```
	* const hasEditOccurred = (
	*    getReferenceByDistinctEdits( beforeState ) !==
	*    getReferenceByDistinctEdits( afterState )
	* );
	* ```
	*
	* @param state Editor state.
	*
	* @return A value whose reference will change only when an edit occurs.
	*/
	function getReferenceByDistinctEdits(state) {
		return state.editsReference;
	}
	/**
	* Retrieve the current theme's base global styles
	*
	* @param state Editor state.
	*
	* @return The Global Styles object.
	*/
	function __experimentalGetCurrentThemeBaseGlobalStyles$1(state) {
		const currentTheme = getCurrentTheme$1(state);
		if (!currentTheme) return null;
		return state.themeBaseGlobalStyles[currentTheme.stylesheet];
	}
	/**
	* Return the ID of the current global styles object.
	*
	* @param state Data state.
	*
	* @return The current global styles ID.
	*/
	function __experimentalGetCurrentThemeGlobalStylesVariations$1(state) {
		const currentTheme = getCurrentTheme$1(state);
		if (!currentTheme) return null;
		return state.themeGlobalStyleVariations[currentTheme.stylesheet];
	}
	/**
	* Retrieve the list of registered block patterns.
	*
	* @param state Data state.
	*
	* @return Block pattern list.
	*/
	function getBlockPatterns$1(state) {
		return state.blockPatterns;
	}
	/**
	* Retrieve the list of registered block pattern categories.
	*
	* @param state Data state.
	*
	* @return Block pattern category list.
	*/
	function getBlockPatternCategories$1(state) {
		return state.blockPatternCategories;
	}
	/**
	* Retrieve the registered user pattern categories.
	*
	* @param state Data state.
	*
	* @return User patterns category array.
	*/
	function getUserPatternCategories$1(state) {
		return state.userPatternCategories;
	}
	/**
	* Returns the revisions of the current global styles theme.
	*
	* @deprecated since WordPress 6.5.0. Callers should use `select( 'core' ).getRevisions( 'root', 'globalStyles', ${ recordKey } )` instead, where `recordKey` is the id of the global styles parent post.
	*
	* @param      state Data state.
	*
	* @return The current global styles.
	*/
	function getCurrentThemeGlobalStylesRevisions$1(state) {
		(0, _wordpress_deprecated.default)("select( 'core' ).getCurrentThemeGlobalStylesRevisions()", {
			since: "6.5.0",
			alternative: "select( 'core' ).getRevisions( 'root', 'globalStyles', ${ recordKey } )"
		});
		const currentGlobalStylesId = __experimentalGetCurrentGlobalStylesId$1(state);
		if (!currentGlobalStylesId) return null;
		return state.themeGlobalStyleRevisions[currentGlobalStylesId];
	}
	/**
	* Returns the default template use to render a given query.
	*
	* @param state Data state.
	* @param query Query.
	*
	* @return The default template id for the given query.
	*/
	function getDefaultTemplateId$1(state, query) {
		return state.defaultTemplates[JSON.stringify(query)];
	}
	/**
	* Returns an entity's revisions.
	*
	* @param state     State tree
	* @param kind      Entity kind.
	* @param name      Entity name.
	* @param recordKey The key of the entity record whose revisions you want to fetch.
	* @param query     Optional query. If requesting specific
	*                  fields, fields must always include the ID. For valid query parameters see revisions schema in [the REST API Handbook](https://developer.wordpress.org/rest-api/reference/). Then see the arguments available "Retrieve a [Entity kind]".
	*
	* @return Record.
	*/
	const getRevisions$1 = (state, kind, name, recordKey, query) => {
		logEntityDeprecation(kind, name, "getRevisions");
		const queriedStateRevisions = state.entities.records?.[kind]?.[name]?.revisions?.[recordKey];
		if (!queriedStateRevisions) return null;
		return getQueriedItems(queriedStateRevisions, query);
	};
	/**
	* Returns true if a revision has been received for the given set of parameters,
	* or false otherwise.
	*
	* Note: This does not trigger a request for the revision from the API
	* if it's not available in the local state.
	*
	* @param state       State tree
	* @param kind        Entity kind.
	* @param name        Entity name.
	* @param recordKey   The key of the entity record whose revision you want to check.
	* @param revisionKey The revision's key.
	* @param query       Optional query.
	*
	* @return Whether a revision has been received.
	*/
	function hasRevision(state, kind, name, recordKey, revisionKey, query) {
		const queriedState = state.entities.records?.[kind]?.[name]?.revisions?.[recordKey];
		if (!queriedState) return false;
		const context = query?.context ?? "default";
		if (!query || !query._fields) return !!queriedState.itemIsComplete[context]?.[revisionKey];
		const item = queriedState.items[context]?.[revisionKey];
		if (!item) return false;
		const fields = getNormalizedCommaSeparable(query._fields) ?? [];
		for (let i = 0; i < fields.length; i++) {
			const path = fields[i].split(".");
			let value = item;
			for (let p = 0; p < path.length; p++) {
				const part = path[p];
				if (!value || !Object.hasOwn(value, part)) return false;
				value = value[part];
			}
		}
		return true;
	}
	/**
	* Returns a single, specific revision of a parent entity.
	*
	* @param state       State tree
	* @param kind        Entity kind.
	* @param name        Entity name.
	* @param recordKey   The key of the entity record whose revisions you want to fetch.
	* @param revisionKey The revision's key.
	* @param query       Optional query. If requesting specific
	*                    fields, fields must always include the ID. For valid query parameters see revisions schema in [the REST API Handbook](https://developer.wordpress.org/rest-api/reference/). Then see the arguments available "Retrieve a [entity kind]".
	*
	* @return Record.
	*/
	const getRevision$1 = (state, kind, name, recordKey, revisionKey, query) => {
		logEntityDeprecation(kind, name, "getRevision");
		const queriedState = state.entities.records?.[kind]?.[name]?.revisions?.[recordKey];
		if (!queriedState) return;
		const context = query?.context ?? "default";
		if (!query || !query._fields) {
			if (!queriedState.itemIsComplete[context]?.[revisionKey]) return;
			return queriedState.items[context][revisionKey];
		}
		const item = queriedState.items[context]?.[revisionKey];
		if (!item) return item;
		return getFilteredItem(item, query._fields);
	};

// packages/core-data/build-module/batch/default-processor.mjs
/**
	* Maximum number of requests to place in a single batch request. Obtained by
	* sending a preflight OPTIONS request to /batch/v1/.
	*/
	let maxItems = null;
	function chunk(arr, chunkSize) {
		const tmp = [...arr];
		const cache = [];
		while (tmp.length) cache.push(tmp.splice(0, chunkSize));
		return cache;
	}
	/**
	* Default batch processor. Sends its input requests to /batch/v1.
	*
	* @param requests List of API requests to perform at once.
	*
	* @return Promise that resolves to a list of objects containing
	*         either `output` (if that request was successful) or `error`
	*         (if not ).
	*/
	async function defaultProcessor(requests) {
		if (maxItems === null) maxItems = (await (0, _wordpress_api_fetch.default)({
			path: "/batch/v1",
			method: "OPTIONS"
		})).endpoints[0].args.requests.maxItems;
		const results = [];
		for (const batchRequests of chunk(requests, maxItems)) {
			const batchResponse = await (0, _wordpress_api_fetch.default)({
				path: "/batch/v1",
				method: "POST",
				data: {
					validation: "require-all-validate",
					requests: batchRequests.map((request) => ({
						path: request.path,
						body: request.data,
						method: request.method,
						headers: request.headers
					}))
				}
			});
			let batchResults;
			if (batchResponse.failed) batchResults = batchResponse.responses.map((response) => ({ error: response?.body }));
			else batchResults = batchResponse.responses.map((response) => {
				const result = {};
				if (response.status >= 200 && response.status < 300) result.output = response.body;
				else result.error = response.body;
				return result;
			});
			results.push(...batchResults);
		}
		return results;
	}

// packages/core-data/build-module/batch/create-batch.mjs
	function createBatch(processor = defaultProcessor) {
		let lastId = 0;
		let queue = [];
		const pending = new ObservableSet();
		return {
			/**
			* Adds an input to the batch and returns a promise that is resolved or
			* rejected when the input is processed by `batch.run()`.
			*
			* You may also pass a thunk which allows inputs to be added
			* asynchronously.
			*
			* ```
			* // Both are allowed:
			* batch.add( { path: '/v1/books', ... } );
			* batch.add( ( add ) => add( { path: '/v1/books', ... } ) );
			* ```
			*
			* If a thunk is passed, `batch.run()` will pause until either:
			*
			* - The thunk calls its `add` argument, or;
			* - The thunk returns a promise and that promise resolves, or;
			* - The thunk returns a non-promise.
			*
			* @param inputOrThunk Input to add or thunk to execute.
			*
			* @return If given an input, returns a promise that
			*         is resolved or rejected when the batch is
			*         processed. If given a thunk, returns the return
			*         value of that thunk.
			*/
			add(inputOrThunk) {
				const id = ++lastId;
				pending.add(id);
				const add = (input) => new Promise((resolve, reject) => {
					queue.push({
						input,
						resolve,
						reject
					});
					pending.delete(id);
				});
				if (typeof inputOrThunk === "function") return Promise.resolve(inputOrThunk(add)).finally(() => {
					pending.delete(id);
				});
				return add(inputOrThunk);
			},
			/**
			* Runs the batch. This calls `batchProcessor` and resolves or rejects
			* all promises returned by `add()`.
			*
			* @return A promise that resolves to a boolean that is true
			*         if the processor returned no errors.
			*/
			async run() {
				if (pending.size) await new Promise((resolve) => {
					const unsubscribe = pending.subscribe(() => {
						if (!pending.size) {
							unsubscribe();
							resolve(void 0);
						}
					});
				});
				let results;
				try {
					results = await processor(queue.map(({ input }) => input));
					if (results.length !== queue.length) throw new Error("run: Array returned by processor must be same size as input array.");
				} catch (error) {
					for (const { reject } of queue) reject(error);
					throw error;
				}
				let isSuccess = true;
				results.forEach((result, key) => {
					const queueItem = queue[key];
					if (result?.error) {
						queueItem?.reject(result.error);
						isSuccess = false;
					} else queueItem?.resolve(result?.output ?? result);
				});
				queue = [];
				return isSuccess;
			}
		};
	}
	var ObservableSet = class {
		set;
		subscribers;
		constructor(...args) {
			this.set = new Set(...args);
			this.subscribers = /* @__PURE__ */ new Set();
		}
		get size() {
			return this.set.size;
		}
		add(value) {
			this.set.add(value);
			this.subscribers.forEach((subscriber) => subscriber());
			return this;
		}
		delete(value) {
			const isSuccess = this.set.delete(value);
			this.subscribers.forEach((subscriber) => subscriber());
			return isSuccess;
		}
		subscribe(subscriber) {
			this.subscribers.add(subscriber);
			return () => {
				this.subscribers.delete(subscriber);
			};
		}
	};

// packages/core-data/build-module/utils/sync-undo-levels.mjs
	let syncUndoLevelCount = 0;
	/**
	* Creates the undo record that stands in for one of the sync manager's undo
	* levels of a record. Its changes carry a running count so the record is
	* never considered empty; they are never applied to an entity.
	*
	* The `isSyncUndoLevel` key keeps the id distinct from the record's own id,
	* so the undo manager never merges an edit to the record into a placeholder.
	*
	* @param kind     Kind of the record.
	* @param name     Name of the record.
	* @param recordId Id of the record.
	*
	* @return The record.
	*/
	function createSyncUndoLevelRecord(kind, name, recordId) {
		syncUndoLevelCount += 1;
		return [{
			id: {
				kind,
				name,
				recordId,
				isSyncUndoLevel: true
			},
			changes: { level: {
				from: syncUndoLevelCount - 1,
				to: syncUndoLevelCount
			} }
		}];
	}
	function isSyncUndoLevel(changes) {
		return "string" !== typeof changes.id && true === changes.id.isSyncUndoLevel;
	}
	/**
	* Reads the record an entry of the undo history belongs to from its id.
	*
	* @param id The id of the entry.
	*
	* @return The record, or undefined when the id does not name one.
	*/
	function getRecordReference(id) {
		if ("string" === typeof id) return;
		const { kind, name, recordId } = id;
		if ("string" !== typeof kind || "string" !== typeof name) return;
		if ("string" !== typeof recordId && "number" !== typeof recordId) return;
		return {
			kind,
			name,
			recordId
		};
	}
	function isLoadedRecord(syncManager, record) {
		if (!record) return false;
		return Boolean(syncManager?.isLoaded?.(record.kind, record.name, record.recordId));
	}
	/**
	* Records an edit to entities the sync manager does not sync, or, without a
	* record, closes the current undo level.
	*
	* @param undoManager core-data's undo manager.
	* @param syncManager The registered entity sync manager.
	* @param record      The record of changes; omit it to close the current undo
	*                    level.
	* @param isStaged    Whether to merge the changes into the current undo level
	*                    instead of opening a new one.
	*/
	function recordEntityEdit(undoManager, syncManager, record, isStaged = false) {
		const undoHistory = syncManager?.undoHistory;
		undoHistory?.stopCapturing();
		undoHistory?.clearRedo();
		if (!record) {
			undoManager.addRecord();
			return;
		}
		if (isStaged && undoManager.hasRedo()) undoManager.addRecord();
		undoManager.addRecord(record, isStaged);
	}
	/**
	* Takes the next level off the history and applies its sync manager part.
	*
	* @param undoManager core-data's undo manager.
	* @param syncManager The registered entity sync manager.
	* @param type        Which direction to move in.
	*
	* @return The level. Undefined when the history is exhausted.
	*/
	function popUndoLevel(undoManager, syncManager, type) {
		const undoHistory = syncManager?.undoHistory;
		let record;
		if ("undo" === type) record = undoManager.undo();
		else record = undoManager.redo();
		if (!record) return;
		const changes = record.filter((entry) => !isSyncUndoLevel(entry) && !isLoadedRecord(syncManager, getRecordReference(entry.id)));
		const syncLevel = record.find(isSyncUndoLevel);
		let syncLevelRecord;
		if (syncLevel) syncLevelRecord = getRecordReference(syncLevel.id);
		let didApplySyncLevel = false;
		if (undoHistory && syncLevelRecord && isLoadedRecord(syncManager, syncLevelRecord)) {
			const { kind, name, recordId } = syncLevelRecord;
			didApplySyncLevel = undoHistory[type](kind, name, recordId);
		}
		return {
			changes,
			didApply: changes.length > 0 || didApplySyncLevel
		};
	}
	/**
	* Undoes or redoes the next level of the history.
	*
	* A level whose entities are no longer reachable is skipped: a sync manager
	* level whose document was unloaded, or a record for an entity that has become
	* synced since it was recorded (its shared document never saw the change, so
	* applying the record would fork the two).
	*
	* @param undoManager core-data's undo manager.
	* @param syncManager The registered entity sync manager.
	* @param type        Which direction to move in.
	*
	* @return The changes to apply to the store. Empty when the level belonged to
	*         the sync manager, which applies it through its documents. Undefined
	*         when nothing is left to move.
	*/
	function applyUndoLevel(undoManager, syncManager, type) {
		syncManager?.undoHistory?.stopCapturing();
		let level = popUndoLevel(undoManager, syncManager, type);
		while (level && !level.didApply) level = popUndoLevel(undoManager, syncManager, type);
		if (!level) return;
		syncManager?.undoHistory?.stopCapturing();
		return level.changes;
	}

// packages/core-data/build-module/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		__experimentalBatch: () => __experimentalBatch,
		__experimentalReceiveCurrentGlobalStylesId: () => __experimentalReceiveCurrentGlobalStylesId,
		__experimentalReceiveThemeBaseGlobalStyles: () => __experimentalReceiveThemeBaseGlobalStyles,
		__experimentalReceiveThemeGlobalStyleVariations: () => __experimentalReceiveThemeGlobalStyleVariations,
		__experimentalSaveSpecifiedEntityEdits: () => __experimentalSaveSpecifiedEntityEdits,
		__unstableCreateUndoLevel: () => __unstableCreateUndoLevel,
		addEntities: () => addEntities,
		clearEntityRecordEdits: () => clearEntityRecordEdits,
		deleteEntityRecord: () => deleteEntityRecord,
		editEntityRecord: () => editEntityRecord,
		receiveAutosaves: () => receiveAutosaves,
		receiveCurrentTheme: () => receiveCurrentTheme,
		receiveCurrentUser: () => receiveCurrentUser,
		receiveDefaultTemplateId: () => receiveDefaultTemplateId,
		receiveEmbedPreview: () => receiveEmbedPreview,
		receiveEntityRecords: () => receiveEntityRecords,
		receiveNavigationFallbackId: () => receiveNavigationFallbackId,
		receiveRevisions: () => receiveRevisions,
		receiveThemeGlobalStyleRevisions: () => receiveThemeGlobalStyleRevisions,
		receiveThemeSupports: () => receiveThemeSupports,
		receiveUploadPermissions: () => receiveUploadPermissions,
		receiveUserPermission: () => receiveUserPermission,
		receiveUserPermissions: () => receiveUserPermissions,
		receiveUserQuery: () => receiveUserQuery,
		redo: () => redo,
		saveEditedEntityRecord: () => saveEditedEntityRecord,
		saveEntityRecord: () => saveEntityRecord,
		undo: () => undo
	}, 1);
	function addTitleToAutoDraft(record) {
		return record.status === "auto-draft" ? {
			...record,
			title: ""
		} : record;
	}
	/**
	* Returns an action object used in signalling that authors have been received.
	* Ignored from documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param queryID Query ID.
	* @param users   Users received.
	*
	* @return Action object.
	*/
	function receiveUserQuery(queryID, users) {
		return {
			type: "RECEIVE_USER_QUERY",
			users: Array.isArray(users) ? users : [users],
			queryID
		};
	}
	/**
	* Returns an action used in signalling that the current user has been received.
	* Ignored from documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param currentUser Current user object.
	*
	* @return Action object.
	*/
	function receiveCurrentUser(currentUser) {
		return {
			type: "RECEIVE_CURRENT_USER",
			currentUser
		};
	}
	/**
	* Returns an action object used in adding new entities.
	*
	* @param entities Entities received.
	*
	* @return Action object.
	*/
	function addEntities(entities) {
		return {
			type: "ADD_ENTITIES",
			entities
		};
	}
	/**
	* Returns an action object used in signalling that entity records have been received.
	*
	* @param kind            Kind of the received entity record.
	* @param name            Name of the received entity record.
	* @param records         Records received.
	* @param query           Query Object.
	* @param invalidateCache Should invalidate query caches.
	* @param edits           Edits to reset.
	* @param meta            Meta information about pagination.
	* @return Action object.
	*/
	function receiveEntityRecords(kind, name, records, query = void 0, invalidateCache = false, edits = void 0, meta = void 0) {
		if (kind === "postType") records = Array.isArray(records) ? records.map(addTitleToAutoDraft) : addTitleToAutoDraft(records);
		let action;
		if (query) action = receiveQueriedItems(records, query, edits, meta);
		else action = receiveItems(records, edits, meta);
		return {
			...action,
			kind,
			name,
			invalidateCache
		};
	}
	/**
	* Returns an action object used in signalling that the current theme has been received.
	* Ignored from documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param currentTheme The current theme.
	*
	* @return Action object.
	*/
	function receiveCurrentTheme(currentTheme) {
		return {
			type: "RECEIVE_CURRENT_THEME",
			currentTheme
		};
	}
	/**
	* Returns an action object used in signalling that the current global styles id has been received.
	* Ignored from documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param currentGlobalStylesId The current global styles id.
	*
	* @return Action object.
	*/
	function __experimentalReceiveCurrentGlobalStylesId(currentGlobalStylesId) {
		return {
			type: "RECEIVE_CURRENT_GLOBAL_STYLES_ID",
			id: currentGlobalStylesId
		};
	}
	/**
	* Returns an action object used in signalling that the theme base global styles have been received
	* Ignored from documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param stylesheet   The theme's identifier
	* @param globalStyles The global styles object.
	*
	* @return Action object.
	*/
	function __experimentalReceiveThemeBaseGlobalStyles(stylesheet, globalStyles) {
		return {
			type: "RECEIVE_THEME_GLOBAL_STYLES",
			stylesheet,
			globalStyles
		};
	}
	/**
	* Returns an action object used in signalling that the theme global styles variations have been received.
	* Ignored from documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param stylesheet The theme's identifier
	* @param variations The global styles variations.
	*
	* @return Action object.
	*/
	function __experimentalReceiveThemeGlobalStyleVariations(stylesheet, variations) {
		return {
			type: "RECEIVE_THEME_GLOBAL_STYLE_VARIATIONS",
			stylesheet,
			variations
		};
	}
	/**
	* Returns an action object used in signalling that the index has been received.
	*
	* @deprecated since WP 5.9, this is not useful anymore, use the selector directly.
	*
	* @return Action object.
	*/
	function receiveThemeSupports() {
		(0, _wordpress_deprecated.default)("wp.data.dispatch( 'core' ).receiveThemeSupports", { since: "5.9" });
		return { type: "DO_NOTHING" };
	}
	/**
	* Returns an action object used in signalling that the theme global styles CPT post revisions have been received.
	* Ignored from documentation as it's internal to the data store.
	*
	* @deprecated since WordPress 6.5.0. Callers should use `dispatch( 'core' ).receiveRevision` instead.
	*
	* @ignore
	*
	* @param      currentId The post id.
	* @param      revisions The global styles revisions.
	*
	* @return Action object.
	*/
	function receiveThemeGlobalStyleRevisions(currentId, revisions) {
		(0, _wordpress_deprecated.default)("wp.data.dispatch( 'core' ).receiveThemeGlobalStyleRevisions()", {
			since: "6.5.0",
			alternative: "wp.data.dispatch( 'core' ).receiveRevisions"
		});
		return {
			type: "RECEIVE_THEME_GLOBAL_STYLE_REVISIONS",
			currentId,
			revisions
		};
	}
	/**
	* Returns an action object used in signalling that the preview data for
	* a given URl has been received.
	* Ignored from documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param url     URL to preview the embed for.
	* @param preview Preview data.
	*
	* @return Action object.
	*/
	function receiveEmbedPreview(url, preview) {
		return {
			type: "RECEIVE_EMBED_PREVIEW",
			url,
			preview
		};
	}
	/**
	* Action triggered to delete an entity record.
	*
	* @param kind                    Kind of the deleted entity.
	* @param name                    Name of the deleted entity.
	* @param recordId                Record ID of the deleted entity.
	* @param query                   Special query parameters for the
	*                                DELETE API call.
	* @param options                 Delete options.
	* @param options.__unstableFetch Internal use only. Function to
	*                                call instead of `apiFetch()`.
	*                                Must return a promise.
	* @param options.throwOnError    If false, this action suppresses all
	*                                the exceptions. Defaults to false.
	*/
	const deleteEntityRecord = (kind, name, recordId, query, { __unstableFetch = _wordpress_api_fetch.default, throwOnError = false } = {}) => async ({ dispatch, resolveSelect }) => {
		logEntityDeprecation(kind, name, "deleteEntityRecord");
		const entityConfig = (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.kind === kind && config.name === name);
		let error;
		let deletedRecord = false;
		if (!entityConfig) return;
		const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, [
			"entities",
			"records",
			kind,
			name,
			recordId
		], { exclusive: true });
		try {
			dispatch({
				type: "DELETE_ENTITY_RECORD_START",
				kind,
				name,
				recordId
			});
			let hasError = false;
			const { baseURL } = entityConfig;
			try {
				let path = `${baseURL}/${recordId}`;
				if (query) path = (0, _wordpress_url.addQueryArgs)(path, query);
				deletedRecord = await __unstableFetch({
					path,
					method: "DELETE"
				});
				await dispatch(removeItems(kind, name, recordId, true));
				getEntitySyncManager()?.unload(kind, name, recordId);
			} catch (_error) {
				hasError = true;
				error = _error;
			}
			dispatch({
				type: "DELETE_ENTITY_RECORD_FINISH",
				kind,
				name,
				recordId,
				error
			});
			if (hasError && throwOnError) throw error;
			return deletedRecord;
		} finally {
			dispatch.__unstableReleaseStoreLock(lock);
		}
	};
	/**
	* Returns an action object that triggers an
	* edit to an entity record.
	*
	* @param kind               Kind of the edited entity record.
	* @param name               Name of the edited entity record.
	* @param recordId           Pass `undefined` for keyless entities.
	* @param edits              The edits.
	* @param options            Options for the edit.
	* @param options.undoIgnore Whether to ignore the edit in undo history or not.
	* @param options.isCached   Whether the edit is transient (e.g. typing). Transient
	*                           edits are staged and eventually merged into the
	*                           preceding undo level instead of creating a new one.
	*
	* @return Action object.
	*/
	const editEntityRecord = (kind, name, recordId, edits, { undoIgnore, isCached } = {}) => ({ select, dispatch }) => {
		logEntityDeprecation(kind, name, "editEntityRecord");
		const fieldEdits = edits;
		const entityConfig = select.getEntityConfig(kind, name);
		if (!entityConfig) throw new Error(`The entity being edited (${kind}, ${name}) does not have a loaded config.`);
		const { mergedEdits = {} } = entityConfig;
		const record = select.getRawEntityRecord(kind, name, recordId);
		const editedRecord = select.getEditedEntityRecord(kind, name, recordId);
		const editsWithMerges = Object.keys(fieldEdits).reduce((acc, key) => {
			acc[key] = mergedEdits[key] ? {
				...editedRecord[key],
				...fieldEdits[key]
			} : fieldEdits[key];
			return acc;
		}, {});
		const edit = {
			kind,
			name,
			recordId,
			edits: clearUnchangedEdits(editsWithMerges, record)
		};
		const syncManager = getEntitySyncManager();
		syncManager?.update(kind, name, recordId, editsWithMerges, {
			isCached: Boolean(isCached),
			undoIgnore: Boolean(undoIgnore)
		});
		if (!undoIgnore && !syncManager?.isLoaded?.(kind, name, recordId)) recordEntityEdit(select.getUndoManager(), syncManager, [{
			id: {
				kind,
				name,
				recordId
			},
			changes: Object.keys(fieldEdits).reduce((acc, key) => {
				acc[key] = {
					from: editedRecord[key],
					to: fieldEdits[key]
				};
				return acc;
			}, {})
		}], isCached);
		dispatch({
			type: "EDIT_ENTITY_RECORD",
			...edit
		});
	};
	/**
	* Action triggered to clear all edits from
	* an entity record.
	*
	* @param kind     Kind of the entity.
	* @param name     Name of the entity.
	* @param recordId Is omitted for keyless entities.
	*
	* @return Action object.
	*/
	const clearEntityRecordEdits = (kind, name, recordId) => ({ select, dispatch }) => {
		const entityConfig = select.getEntityConfig(kind, name);
		logEntityDeprecation(kind, name, "clearEntityRecordEdits");
		if (!entityConfig) throw new Error(`The entity being edited (${kind}, ${name}) does not have a loaded config.`);
		const currentEdits = select.getEntityRecordEdits(kind, name, recordId);
		if (!currentEdits) return;
		dispatch({
			type: "EDIT_ENTITY_RECORD",
			kind,
			name,
			recordId,
			edits: Object.keys(currentEdits).reduce((acc, key) => {
				acc[key] = void 0;
				return acc;
			}, {})
		});
	};
	/**
	* Action triggered to undo the last edit to
	* an entity record, if any.
	*/
	const undo = () => ({ select, dispatch }) => {
		const undoRecord = applyUndoLevel(select.getUndoManager(), getEntitySyncManager(), "undo");
		if (!undoRecord) return;
		dispatch({
			type: "UNDO",
			record: undoRecord
		});
	};
	/**
	* Action triggered to redo the last undone
	* edit to an entity record, if any.
	*/
	const redo = () => ({ select, dispatch }) => {
		const redoRecord = applyUndoLevel(select.getUndoManager(), getEntitySyncManager(), "redo");
		if (!redoRecord) return;
		dispatch({
			type: "REDO",
			record: redoRecord
		});
	};
	/**
	* Forces the creation of a new undo level.
	*
	* @return Action object.
	*/
	const __unstableCreateUndoLevel = () => ({ select }) => {
		recordEntityEdit(select.getUndoManager(), getEntitySyncManager());
	};
	/**
	* Action triggered to save an entity record.
	*
	* @param kind                    Kind of the received entity.
	* @param name                    Name of the received entity.
	* @param record                  Record to be saved.
	* @param options                 Saving options.
	* @param options.isAutosave      Whether this is an autosave.
	* @param options.__unstableFetch Internal use only. Function to
	*                                call instead of `apiFetch()`.
	*                                Must return a promise.
	* @param options.throwOnError    If false, this action suppresses all
	*                                the exceptions. Defaults to false.
	*/
	const saveEntityRecord = (kind, name, record, { isAutosave = false, __unstableFetch = _wordpress_api_fetch.default, throwOnError = false } = {}) => async ({ select, resolveSelect, dispatch }) => {
		logEntityDeprecation(kind, name, "saveEntityRecord");
		const entityConfig = (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.kind === kind && config.name === name);
		if (!entityConfig) return;
		const entityIdKey = entityConfig.key ?? "id";
		const recordId = record[entityIdKey];
		const isNewRecord = !!entityIdKey && !recordId;
		const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, [
			"entities",
			"records",
			kind,
			name,
			recordId || v4()
		], { exclusive: true });
		try {
			for (const [key, value] of Object.entries(record)) if (typeof value === "function") {
				const evaluatedValue = value(select.getEditedEntityRecord(kind, name, recordId));
				dispatch.editEntityRecord(kind, name, recordId, { [key]: evaluatedValue }, { undoIgnore: true });
				record[key] = evaluatedValue;
			}
			dispatch({
				type: "SAVE_ENTITY_RECORD_START",
				kind,
				name,
				recordId,
				isAutosave
			});
			let updatedRecord;
			let error;
			let hasError = false;
			const { baseURL } = entityConfig;
			try {
				const path = `${baseURL}${recordId ? "/" + recordId : ""}`;
				const persistedRecord = !isNewRecord ? select.getRawEntityRecord(kind, name, recordId) : {};
				const syncManager = getEntitySyncManager();
				const syncEdits = isNewRecord ? void 0 : await syncManager?.beforeSave?.(kind, name, recordId, record, {
					persistedRecord,
					isAutosave
				});
				if (isAutosave) {
					const merged = {
						...persistedRecord,
						...record
					};
					const data = [
						"title",
						"excerpt",
						"content",
						"meta"
					].reduce((acc, key) => {
						if (key in merged) acc[key] = merged[key];
						return acc;
					}, { status: merged.status === "auto-draft" ? "draft" : void 0 });
					updatedRecord = await __unstableFetch({
						path: `${path}/autosaves`,
						method: "POST",
						data: {
							...data,
							...syncEdits
						}
					});
					if (persistedRecord.id === updatedRecord.id) {
						let newRecord = {
							...persistedRecord,
							...data,
							...updatedRecord
						};
						newRecord = Object.keys(newRecord).reduce((acc, key) => {
							if ([
								"title",
								"excerpt",
								"content",
								"meta"
							].includes(key)) acc[key] = newRecord[key];
							else if (key === "status") acc[key] = persistedRecord.status === "auto-draft" && newRecord.status === "draft" ? newRecord.status : persistedRecord.status;
							else acc[key] = persistedRecord[key];
							return acc;
						}, {});
						dispatch.receiveEntityRecords(kind, name, newRecord, void 0, true);
					} else dispatch.receiveAutosaves(persistedRecord.id, updatedRecord);
				} else {
					let edits = {
						...record,
						...syncEdits
					};
					if (entityConfig.__unstablePrePersist) edits = {
						...edits,
						...await entityConfig.__unstablePrePersist(persistedRecord, edits)
					};
					updatedRecord = await __unstableFetch({
						path,
						method: recordId ? "PUT" : "POST",
						data: edits
					});
					dispatch.receiveEntityRecords(kind, name, updatedRecord, void 0, true, record);
					syncManager?.afterSave?.(kind, name, recordId, {
						savedRecord: updatedRecord,
						persistedRecord: isNewRecord ? void 0 : persistedRecord,
						edits: record
					});
				}
			} catch (_error) {
				hasError = true;
				error = _error;
			}
			dispatch({
				type: "SAVE_ENTITY_RECORD_FINISH",
				kind,
				name,
				recordId,
				error,
				isAutosave
			});
			if (hasError && throwOnError) throw error;
			return updatedRecord;
		} finally {
			dispatch.__unstableReleaseStoreLock(lock);
		}
	};
	/**
	* Runs multiple core-data actions at the same time using one API request.
	*
	* Example:
	*
	* ```
	* const [ savedRecord, updatedRecord, deletedRecord ] =
	*   await dispatch( 'core' ).__experimentalBatch( [
	*     ( { saveEntityRecord } ) => saveEntityRecord( 'root', 'widget', widget ),
	*     ( { saveEditedEntityRecord } ) => saveEntityRecord( 'root', 'widget', 123 ),
	*     ( { deleteEntityRecord } ) => deleteEntityRecord( 'root', 'widget', 123, null ),
	*   ] );
	* ```
	*
	* @param requests Array of functions which are invoked simultaneously.
	*                 Each function is passed an object containing
	*                 `saveEntityRecord`, `saveEditedEntityRecord`, and
	*                 `deleteEntityRecord`.
	*
	* @return A promise that resolves to an array containing the return
	*         values of each function given in `requests`.
	*/
	const __experimentalBatch = ((requests) => async ({ dispatch }) => {
		const batch = createBatch();
		const api = {
			saveEntityRecord(kind, name, record, options) {
				return batch.add((add) => dispatch.saveEntityRecord(kind, name, record, {
					...options,
					__unstableFetch: add
				}));
			},
			saveEditedEntityRecord(kind, name, recordId, options) {
				return batch.add((add) => dispatch.saveEditedEntityRecord(kind, name, recordId, {
					...options,
					__unstableFetch: add
				}));
			},
			deleteEntityRecord(kind, name, recordId, query, options) {
				return batch.add((add) => dispatch.deleteEntityRecord(kind, name, recordId, query, {
					...options,
					__unstableFetch: add
				}));
			}
		};
		const resultPromises = requests.map((request) => request(api));
		const [, ...results] = await Promise.all([batch.run(), ...resultPromises]);
		return results;
	});
	/**
	* Action triggered to save an entity record's edits.
	*
	* @param kind     Kind of the entity.
	* @param name     Name of the entity.
	* @param recordId Is omitted for keyless entities.
	* @param options  Saving options.
	*/
	const saveEditedEntityRecord = (kind, name, recordId, options) => async ({ select, dispatch, resolveSelect }) => {
		logEntityDeprecation(kind, name, "saveEditedEntityRecord");
		if (!select.hasEditsForEntityRecord(kind, name, recordId)) return;
		const entityConfig = (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.kind === kind && config.name === name);
		if (!entityConfig) return;
		const entityIdKey = entityConfig.key || "id";
		const edits = select.getEntityRecordNonTransientEdits(kind, name, recordId);
		const record = {
			[entityIdKey]: recordId,
			...edits
		};
		return await dispatch.saveEntityRecord(kind, name, record, options);
	};
	/**
	* Action triggered to save only specified properties for the entity.
	*
	* @param kind        Kind of the entity.
	* @param name        Name of the entity.
	* @param recordId    ID of the record.
	* @param itemsToSave List of entity properties or property paths to save.
	* @param options     Saving options.
	*/
	const __experimentalSaveSpecifiedEntityEdits = (kind, name, recordId, itemsToSave, options) => async ({ select, dispatch, resolveSelect }) => {
		logEntityDeprecation(kind, name, "__experimentalSaveSpecifiedEntityEdits");
		if (!select.hasEditsForEntityRecord(kind, name, recordId)) return;
		const edits = select.getEntityRecordNonTransientEdits(kind, name, recordId);
		const editsToSave = {};
		for (const item of itemsToSave) setNestedValue(editsToSave, item, getNestedValue(edits, item));
		const entityIdKey = (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.kind === kind && config.name === name)?.key || "id";
		if (recordId) editsToSave[entityIdKey] = recordId;
		return await dispatch.saveEntityRecord(kind, name, editsToSave, options);
	};
	/**
	* Returns an action object used in signalling that Upload permissions have been received.
	*
	* @deprecated since WP 5.9, use receiveUserPermission instead.
	*
	* @param      hasUploadPermissions Does the user have permission to upload files?
	*
	* @return Action object.
	*/
	function receiveUploadPermissions(hasUploadPermissions) {
		(0, _wordpress_deprecated.default)("wp.data.dispatch( 'core' ).receiveUploadPermissions", {
			since: "5.9",
			alternative: "receiveUserPermission"
		});
		return receiveUserPermission("create/media", hasUploadPermissions);
	}
	/**
	* Returns an action object used in signalling that the current user has
	* permission to perform an action on a REST resource.
	* Ignored from documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param key       A key that represents the action and REST resource.
	* @param isAllowed Whether or not the user can perform the action.
	*
	* @return Action object.
	*/
	function receiveUserPermission(key, isAllowed) {
		return {
			type: "RECEIVE_USER_PERMISSION",
			key,
			isAllowed
		};
	}
	/**
	* Returns an action object used in signalling that the current user has
	* permission to perform an action on a REST resource. Ignored from
	* documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param permissions An object where keys represent
	*                    actions and REST resources, and
	*                    values indicate whether the user
	*                    is allowed to perform the
	*                    action.
	*
	* @return Action object.
	*/
	function receiveUserPermissions(permissions) {
		return {
			type: "RECEIVE_USER_PERMISSIONS",
			permissions
		};
	}
	/**
	* Returns an action object used in signalling that the autosaves for a
	* post have been received.
	* Ignored from documentation as it's internal to the data store.
	*
	* @ignore
	*
	* @param postId    The id of the post that is parent to the autosave.
	* @param autosaves An array of autosaves or singular autosave object.
	*
	* @return Action object.
	*/
	function receiveAutosaves(postId, autosaves) {
		return {
			type: "RECEIVE_AUTOSAVES",
			postId,
			autosaves: Array.isArray(autosaves) ? autosaves : [autosaves]
		};
	}
	/**
	* Returns an action object signalling that the fallback Navigation
	* Menu id has been received.
	*
	* @param fallbackId the id of the fallback Navigation Menu
	* @return Action object.
	*/
	function receiveNavigationFallbackId(fallbackId) {
		return {
			type: "RECEIVE_NAVIGATION_FALLBACK_ID",
			fallbackId
		};
	}
	/**
	* Returns an action object used to set the template for a given query.
	*
	* @param query      The lookup query.
	* @param templateId The resolved template id.
	*
	* @return Action object.
	*/
	function receiveDefaultTemplateId(query, templateId) {
		return {
			type: "RECEIVE_DEFAULT_TEMPLATE",
			query,
			templateId
		};
	}
	/**
	* Action triggered to receive revision items.
	*
	* @param kind            Kind of the received entity record revisions.
	* @param name            Name of the received entity record revisions.
	* @param recordKey       The key of the entity record whose revisions you want to fetch.
	* @param records         Revisions received.
	* @param query           Query Object.
	* @param invalidateCache Should invalidate query caches.
	* @param meta            Meta information about pagination.
	*/
	const receiveRevisions = (kind, name, recordKey, records, query, invalidateCache = false, meta) => async ({ dispatch, resolveSelect }) => {
		logEntityDeprecation(kind, name, "receiveRevisions");
		dispatch({
			type: "RECEIVE_ITEM_REVISIONS",
			key: (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.kind === kind && config.name === name)?.revisionKey ?? "id",
			items: records,
			recordKey,
			meta,
			query,
			kind,
			name,
			invalidateCache
		});
	};

// packages/core-data/build-module/private-actions.mjs
	var private_actions_exports = /* @__PURE__ */ __exportAll({
		editMediaEntity: () => editMediaEntity,
		receiveEditorAssets: () => receiveEditorAssets,
		receiveEditorSettings: () => receiveEditorSettings,
		receiveEntityActionsConfig: () => receiveEntityActionsConfig,
		receiveFieldsConfig: () => receiveFieldsConfig,
		receiveRegisteredPostMeta: () => receiveRegisteredPostMeta,
		receiveViewConfig: () => receiveViewConfig,
		recordSyncUndoLevel: () => recordSyncUndoLevel,
		saveDirtyEntities: () => saveDirtyEntities,
		setCollaborationSupported: () => setCollaborationSupported,
		setSyncConnectionStatus: () => setSyncConnectionStatus
	}, 1);
	/**
	* Returns an action object used in signalling that the registered post meta
	* fields for a post type have been received.
	*
	* @param postType           Post type slug.
	* @param registeredPostMeta Registered post meta.
	*
	* @return Action object.
	*/
	function receiveRegisteredPostMeta(postType, registeredPostMeta) {
		return {
			type: "RECEIVE_REGISTERED_POST_META",
			postType,
			registeredPostMeta
		};
	}
	/**
	* Duplicates a media (attachment) entity record and, optionally, modifies it.
	*
	* @param recordId                Entity record ID.
	* @param edits                   Edits to apply to the record.
	* @param options                 Options object.
	* @param options.__unstableFetch Custom fetch function.
	* @param options.throwOnError    Whether to throw an error if the request fails.
	*
	* @return Promise resolving to the updated record.
	*/
	const editMediaEntity = (recordId, edits = {}, { __unstableFetch = _wordpress_api_fetch.default, throwOnError = false } = {}) => async ({ dispatch, resolveSelect }) => {
		if (!recordId) return;
		const kind = "postType";
		const name = "attachment";
		const entityConfig = (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.kind === kind && config.name === name);
		if (!entityConfig) return;
		const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, [
			"entities",
			"records",
			kind,
			name,
			recordId
		], { exclusive: true });
		let updatedRecord;
		let error;
		let hasError = false;
		try {
			dispatch({
				type: "SAVE_ENTITY_RECORD_START",
				kind,
				name,
				recordId
			});
			try {
				const newRecord = await __unstableFetch({
					path: `${entityConfig.baseURL}/${recordId}/edit`,
					method: "POST",
					data: { ...edits }
				});
				if (newRecord) {
					dispatch.receiveEntityRecords(kind, name, newRecord, void 0, true, void 0, void 0);
					updatedRecord = newRecord;
				}
			} catch (e) {
				error = e;
				hasError = true;
			}
			dispatch({
				type: "SAVE_ENTITY_RECORD_FINISH",
				kind,
				name,
				recordId,
				error
			});
			if (hasError && throwOnError) throw error;
			return updatedRecord;
		} finally {
			dispatch.__unstableReleaseStoreLock(lock);
		}
	};
	/**
	* Returns an action object used to receive editor settings.
	*
	* @param settings Editor settings object.
	*
	* @return Action object.
	*/
	function receiveEditorSettings(settings) {
		return {
			type: "RECEIVE_EDITOR_SETTINGS",
			settings
		};
	}
	/**
	* Returns an action object used to receive editor assets.
	*
	* @param assets Editor assets object.
	*
	* @return Action object.
	*/
	function receiveEditorAssets(assets) {
		return {
			type: "RECEIVE_EDITOR_ASSETS",
			assets
		};
	}
	/**
	* Returns an action object used to set whether collaboration is supported.
	* When set to false, also disconnects all sync entities.
	*
	* @param supported Whether collaboration is supported.
	*
	* @return Action object.
	*/
	const setCollaborationSupported = (supported) => ({ dispatch }) => {
		dispatch({
			type: "SET_COLLABORATION_SUPPORTED",
			supported
		});
		if (!supported) getEntitySyncManager()?.unloadAll();
	};
	/**
	* Returns an action object used to receive view config.
	*
	* @param kind   Entity kind.
	* @param name   Entity name.
	* @param config View config object.
	*
	* @return Action object.
	*/
	function receiveViewConfig(kind, name, config) {
		return {
			type: "RECEIVE_VIEW_CONFIG",
			kind,
			name,
			config
		};
	}
	/**
	* Returns an action object used to receive the fields config of an entity.
	*
	* @param kind   Entity kind.
	* @param name   Entity name.
	* @param config Fields config, as returned by the `/wp/v2/entity-fields` route.
	*
	* @return Action object.
	*/
	function receiveFieldsConfig(kind, name, config) {
		return {
			type: "RECEIVE_FIELDS_CONFIG",
			kind,
			name,
			config
		};
	}
	/**
	* Returns an action object used to receive the actions config of an entity.
	*
	* @param kind   Entity kind.
	* @param name   Entity name.
	* @param config Actions config, as returned by the `/wp/v2/entity-actions` route.
	*
	* @return Action object.
	*/
	function receiveEntityActionsConfig(kind, name, config) {
		return {
			type: "RECEIVE_ENTITY_ACTIONS_CONFIG",
			kind,
			name,
			config
		};
	}
	/**
	* Records that the entity sync manager opened a new undo level for a record
	* it syncs, so the level takes its place in core-data's undo history next to
	* the edits core-data records itself.
	*
	* @param kind     Kind of the record.
	* @param name     Name of the record.
	* @param recordId Id of the record.
	*/
	const recordSyncUndoLevel = (kind, name, recordId) => ({ select, dispatch }) => {
		select.getUndoManager().addRecord(createSyncUndoLevelRecord(kind, name, recordId));
		dispatch({ type: "RECORD_SYNC_UNDO_LEVEL" });
	};
	/**
	* Returns an action object used to set the sync connection status for an entity or collection.
	*
	* @param kind   Kind of the entity.
	* @param name   Name of the entity.
	* @param key    The entity key, or null for collections.
	* @param status The connection state object or null on unload.
	*
	* @return Action object.
	*/
	function setSyncConnectionStatus(kind, name, key, status) {
		if (!status) return {
			type: "CLEAR_SYNC_CONNECTION_STATUS",
			kind,
			name,
			key
		};
		return {
			type: "SET_SYNC_CONNECTION_STATUS",
			kind,
			name,
			key,
			status
		};
	}
	/**
	* Save entity records marked as dirty.
	*
	* @param options                      Options for the action.
	* @param options.onSave               Callback when saving happens.
	* @param options.dirtyEntityRecords   Array of dirty entities.
	* @param options.entitiesToSkip       Array of entities to skip saving.
	* @param options.close                Callback when the actions is called. It should be consolidated with `onSave`.
	* @param options.successNoticeContent Optional custom success notice content. Defaults to 'Site updated.'.
	*/
	const saveDirtyEntities = ({ onSave, dirtyEntityRecords = [], entitiesToSkip = [], close, successNoticeContent } = {}) => ({ registry }) => {
		const PUBLISH_ON_SAVE_ENTITIES = [{
			kind: "postType",
			name: "wp_navigation"
		}];
		const saveNoticeId = "site-editor-save-success";
		const homeUrl = registry.select(STORE_NAME).getEntityRecord("root", "__unstableBase")?.home;
		registry.dispatch(_wordpress_notices.store).removeNotice(saveNoticeId);
		const entitiesToSave = dirtyEntityRecords.filter(({ kind, name, key, property }) => {
			return !entitiesToSkip.some((elt) => elt.kind === kind && elt.name === name && elt.key === key && elt.property === property);
		});
		close?.(entitiesToSave);
		const siteItemsToSave = [];
		const pendingSavedRecords = [];
		entitiesToSave.forEach(({ kind, name, key, property }) => {
			if ("root" === kind && "site" === name) siteItemsToSave.push(property);
			else {
				if (PUBLISH_ON_SAVE_ENTITIES.some((typeToPublish) => typeToPublish.kind === kind && typeToPublish.name === name)) registry.dispatch(STORE_NAME).editEntityRecord(kind, name, key, { status: "publish" });
				pendingSavedRecords.push(registry.dispatch(STORE_NAME).saveEditedEntityRecord(kind, name, key, { throwOnError: true }).catch(ensureError));
			}
		});
		if (siteItemsToSave.length) pendingSavedRecords.push(registry.dispatch(STORE_NAME).__experimentalSaveSpecifiedEntityEdits("root", "site", void 0, siteItemsToSave, { throwOnError: true }).catch(ensureError));
		registry.dispatch(_wordpress_block_editor.store).__unstableMarkLastChangeAsPersistent();
		return Promise.all(pendingSavedRecords).then(async (values) => {
			if (onSave) await onSave();
			return values;
		}).then((values) => {
			const errors = values.filter((v) => v instanceof Error);
			if (errors.length) {
				const firstMessage = errors.find((e) => e.message)?.message;
				registry.dispatch(_wordpress_notices.store).createErrorNotice((0, _wordpress_html_entities.decodeEntities)(firstMessage || (0, _wordpress_i18n.__)("Saving failed.")), {
					type: "snackbar",
					id: saveNoticeId
				});
			} else registry.dispatch(_wordpress_notices.store).createSuccessNotice(successNoticeContent || (0, _wordpress_i18n.__)("Site updated."), {
				type: "snackbar",
				id: saveNoticeId,
				actions: [{
					label: (0, _wordpress_i18n.__)("View site"),
					url: homeUrl,
					openInNewTab: true
				}]
			});
		}).catch((error) => registry.dispatch(_wordpress_notices.store).createErrorNotice((0, _wordpress_html_entities.decodeEntities)(error?.message || (0, _wordpress_i18n.__)("Saving failed.")), {
			type: "snackbar",
			id: saveNoticeId
		}));
		function ensureError(error) {
			if (error instanceof Error) return error;
			let message;
			if (!error) {} else if (typeof error.message === "string") message = error.message;
			else if (typeof error === "string") message = error;
			else if (Object.hasOwn(error, "toString") && typeof error.toString === "function") {
				const result = error.toString();
				if (typeof result === "string") message = result;
			}
			return new Error(message, { cause: error });
		}
	};

// packages/core-data/build-module/fetch/__experimental-fetch-link-suggestions.mjs
/**
	* Fetches link suggestions from the WordPress API.
	*
	* WordPress does not support searching multiple tables at once, e.g. posts and terms, so we
	* perform multiple queries at the same time and then merge the results together.
	*
	* @param search
	* @param searchOptions
	* @param editorSettings
	*
	* @example
	* ```js
	* import { __experimentalFetchLinkSuggestions as fetchLinkSuggestions } from '@wordpress/core-data';
	*
	* //...
	*
	* export function initialize( id, settings ) {
	*
	* settings.__experimentalFetchLinkSuggestions = (
	*     search,
	*     searchOptions
	* ) => fetchLinkSuggestions( search, searchOptions, settings );
	* ```
	*/
	async function fetchLinkSuggestions(search, searchOptions = {}, editorSettings = {}) {
		const { type, subtype, preferTypes, page, perPage = searchOptions.isInitialSuggestions ? 3 : 20 } = searchOptions.isInitialSuggestions && searchOptions.initialSuggestionsSearchOptions ? {
			...searchOptions,
			...searchOptions.initialSuggestionsSearchOptions
		} : searchOptions;
		const { disablePostFormats = false } = editorSettings;
		const queries = [];
		if (!type || type === "post") queries.push((0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/wp/v2/search", {
			search,
			page,
			per_page: perPage,
			type: "post",
			subtype
		}) }).then((results) => {
			return results.map((result) => {
				return {
					id: result.id,
					url: result.url,
					title: (0, _wordpress_html_entities.decodeEntities)(result.title || "") || (0, _wordpress_i18n.__)("(no title)"),
					type: result.subtype || result.type,
					kind: "post-type"
				};
			});
		}).catch(() => []));
		if (!type || type === "term") queries.push((0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/wp/v2/search", {
			search,
			page,
			per_page: perPage,
			type: "term",
			subtype
		}) }).then((results) => {
			return results.map((result) => {
				return {
					id: result.id,
					url: result.url,
					title: (0, _wordpress_html_entities.decodeEntities)(result.title || "") || (0, _wordpress_i18n.__)("(no title)"),
					type: result.subtype || result.type,
					kind: "taxonomy"
				};
			});
		}).catch(() => []));
		if (!disablePostFormats && (!type || type === "post-format")) queries.push((0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/wp/v2/search", {
			search,
			page,
			per_page: perPage,
			type: "post-format",
			subtype
		}) }).then((results) => {
			return results.map((result) => {
				return {
					id: result.id,
					url: result.url,
					title: (0, _wordpress_html_entities.decodeEntities)(result.title || "") || (0, _wordpress_i18n.__)("(no title)"),
					type: result.subtype || result.type,
					kind: "taxonomy"
				};
			});
		}).catch(() => []));
		if (!type || type === "attachment") queries.push((0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/wp/v2/media", {
			search,
			page,
			per_page: perPage
		}) }).then((results) => {
			return results.map((result) => {
				return {
					id: result.id,
					url: result.source_url,
					title: (0, _wordpress_html_entities.decodeEntities)(result.title.rendered || "") || (0, _wordpress_i18n.__)("(no title)"),
					type: result.type,
					kind: "media"
				};
			});
		}).catch(() => []));
		let results = (await Promise.all(queries)).flat();
		results = results.filter((result) => !!result.id);
		return sortResults({
			results,
			search,
			preferTypes
		});
	}
	/**
	* How well a title answers what was typed.
	*
	* The search is compared as the string it was typed as, not word by word: a title contains it when
	* the whole string appears somewhere in the title, and beginning with it is the clearest sign the
	* title is the thing being looked for.
	*
	* @param title
	* @param search
	*
	* @return Whether the title contains the search, and whether it begins with it.
	*/
	function getTitleMatch(title, search) {
		const plain = (text) => (text ?? "").toLowerCase().trim().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, "\"");
		const haystack = plain(title);
		const needle = plain(search);
		if (!haystack || !needle) return {
			contains: false,
			begins: false
		};
		return {
			contains: haystack.includes(needle),
			begins: haystack.startsWith(needle)
		};
	}
	/**
	* The order result types are ranked in, most wanted first.
	*
	* A link is usually to content, then to a taxonomy. A post format is a way of styling a post
	* rather than somewhere to go, and an attachment is a file rather than a destination, so those
	* come last in the order they already had: on a site with a large media library they otherwise
	* crowd out what was being looked for. See https://github.com/WordPress/gutenberg/issues/63683.
	*
	* Deliberately no finer than the search types themselves. Nothing general can be said about
	* whether a page is a better answer than a post, and ranking by search type means every custom
	* post type counts as content and every custom taxonomy counts as a taxonomy without being named.
	*/
	const TYPE_ORDER = [
		"post",
		"term",
		"post-format",
		"attachment"
	];
	/**
	* Which search type a result belongs to.
	*
	* Results name themselves by post type or taxonomy slug, so the search type they came back from
	* has to be recovered from the kind.
	*
	* @param result
	*
	* @return The search type.
	*/
	function getSearchType(result) {
		if (result.kind === "media") return "attachment";
		if (result.type === "post-format") return "post-format";
		return result.kind === "taxonomy" ? "term" : "post";
	}
	/**
	* Where a result's type ranks.
	*
	* Earlier entries in `TYPE_ORDER` rank higher, and anything a caller prefers outranks the usual
	* order entirely. The comparisons before this one come first, so a title that plainly answers the
	* search still outranks a better-placed type that barely does.
	*
	* @param result
	* @param preferTypes
	*
	* @return The rank of the result's type, the highest ranking first.
	*/
	function getTypeRank(result, preferTypes = []) {
		const searchType = getSearchType(result);
		const preferred = preferTypes.findIndex((entry) => typeof entry === "string" ? entry === searchType : entry.type === searchType && entry.subtype === result.type);
		if (preferred !== -1) return TYPE_ORDER.length + (preferTypes.length - preferred);
		return TYPE_ORDER.length - TYPE_ORDER.indexOf(searchType);
	}
	/**
	* How many of the words typed a title holds.
	*
	* A word counts whether it stands alone or sits inside a longer one, so "coffeehouse" holds
	* "coffee".
	*
	* @param title
	* @param searchTokens
	*
	* @return How many of the words typed appear in the title.
	*/
	function countWordsFound(title, searchTokens) {
		const titleTokens = tokenize(title || "");
		return searchTokens.filter((searchToken) => titleTokens.some((titleToken) => titleToken.includes(searchToken))).length;
	}
	/**
	* How much of the search a title covers.
	*
	* Counts how much of the search the title covers, not how much of the title the search covers: a
	* title is not a worse answer for having more words in it, and saying the same word twice does not
	* make it a better one.
	*
	* Example scoring for title "Caterpillars are great"
	*   cat                = 2.5    3 characters of the 12 in "caterpillars"
	*   cater              = 4.17   5 of the 12
	*   caterpillars       = 10     the whole word
	*   great caterpillars = 10     whole word match
	*
	* @param title
	* @param searchTokens
	*
	* @return 10 when every word typed is in the title whole, less relative to the number of
	*         characters of a matched word.
	*/
	function getCoverage(title, searchTokens) {
		if (!title || !searchTokens.length) return 0;
		const titleTokens = tokenize(title);
		return searchTokens.reduce((total, searchToken) => {
			return total + titleTokens.reduce((most, titleToken) => titleToken.includes(searchToken) ? Math.max(most, searchToken.length / titleToken.length) : most, 0);
		}, 0) / searchTokens.length * 10;
	}
	/**
	* Sort search results by relevance to the given query.
	*
	* Sorting is necessary as we're querying multiple endpoints and merging the results. For example
	* a taxonomy title might be more relevant than a post title, but by default taxonomy results will
	* be ordered after less relevant body content matches.
	*
	* Ordering is done by a series of comparisons. Let's assume a search of "coffee beans":
	*
	* 1. Number of word matches in the title: "coffee beans" matches above "coffee" in the title with
	*    "beans" in the body text of the post
	* 2. Ordering of the title matches. "The best coffee beans today" will match above "For the best
	*    coffee, you need the best beans" because of the separation between words
	* 3. Content Type: content > taxonomies > post formats > media
	* 4. Starting with search: "Coffee beans, lightly roasted" will rank above "The freshest coffee
	*    beans"
	* 5. Percentage of matched word: "cat" ranks the title "Cats" above the title "Caterpillar" since
	*    cat is 75% of "Cats" and only 27% of "Caterpillar"
	*
	* @param options
	* @param options.results
	* @param options.search
	* @param options.preferTypes
	*/
	function sortResults({ results, search, preferTypes }) {
		const searchTokens = tokenize(search);
		const scored = results.map((result) => ({
			result,
			found: countWordsFound(result.title, searchTokens),
			...getTitleMatch(result.title, search),
			type: getTypeRank(result, preferTypes),
			score: getCoverage(result.title, searchTokens)
		}));
		scored.sort((a, b) => b.found - a.found || Number(b.contains) - Number(a.contains) || b.type - a.type || Number(b.begins) - Number(a.begins) || b.score - a.score);
		return scored.map(({ result }) => result);
	}
	/**
	* Turns text into an array of tokens, with whitespace and punctuation removed.
	*
	* For example, `"I'm having a ball."` becomes `[ "im", "having", "a", "ball" ]`.
	*
	* @param text
	*/
	function tokenize(text) {
		return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
	}

// packages/core-data/build-module/fetch/__experimental-fetch-url-data.mjs
/**
	* A simple in-memory cache for requests.
	* This avoids repeat HTTP requests which may be beneficial
	* for those wishing to preserve low-bandwidth.
	*/
	const CACHE = /* @__PURE__ */ new Map();
	/**
	* Fetches data about a remote URL.
	* eg: <title> tag, favicon...etc.
	*
	* @async
	* @param url     the URL to request details from.
	* @param options any options to pass to the underlying fetch.
	* @example
	* ```js
	* import { __experimentalFetchUrlData as fetchUrlData } from '@wordpress/core-data';
	*
	* //...
	*
	* export function initialize( id, settings ) {
	*
	* settings.__experimentalFetchUrlData = (
	* url
	* ) => fetchUrlData( url );
	* ```
	* @return Remote URL data.
	*/
	const fetchUrlData = async (url, options = {}) => {
		const endpoint = "/wp-block-editor/v1/url-details";
		const args = { url: (0, _wordpress_url.prependHTTP)(url) };
		if (!(0, _wordpress_url.isURL)(url)) return Promise.reject(`${url} is not a valid URL.`);
		const protocol = (0, _wordpress_url.getProtocol)(url);
		if (!protocol || !(0, _wordpress_url.isValidProtocol)(protocol) || !protocol.startsWith("http") || !/^https?:\/\/[^\/\s]/i.test(url)) return Promise.reject(`${url} does not have a valid protocol. URLs must be "http" based`);
		if (CACHE.has(url)) return CACHE.get(url);
		return (0, _wordpress_api_fetch.default)({
			path: (0, _wordpress_url.addQueryArgs)(endpoint, args),
			...options
		}).then((res) => {
			CACHE.set(url, res);
			return res;
		});
	};

// packages/core-data/build-module/fetch/index.mjs
	async function fetchBlockPatterns() {
		const restPatterns = await (0, _wordpress_api_fetch.default)({ path: "/wp/v2/block-patterns/patterns" });
		if (!restPatterns) return [];
		return restPatterns.map((pattern) => Object.fromEntries(Object.entries(pattern).map(([key, value]) => [camelCase(key), value])));
	}

// packages/core-data/build-module/parsed-blocks-cache.mjs
/**
	* Shared cache of blocks parsed from an entity's `content` string. Populated
	* both eagerly by the `getEntityRecord` resolver (when the sync manager
	* parses content for transient edits) and lazily by `useEntityBlockEditor`.
	*
	* A parse result is a function of the content and of the block types
	* registered at the time: a block whose type is not registered yet is
	* dropped or replaced, not kept. The cache is therefore two levels — the
	* outer one keyed by the registered block types list, the inner one by
	* `kind:name:id`, holding the blocks with the `content` string they were
	* parsed from as the remaining validator. A record resolved before the
	* editor's assets have registered the block types — a resolver can run
	* that early — lands under a list that registration then replaces.
	*
	* The outer level is a WeakMap keyed by the list itself: the blocks store
	* memoizes it until a type is added or removed, then produces a new one and
	* drops the old, taking every entry parsed against it with it. Nothing is
	* invalidated by hand and nothing stale is retained.
	*/
	const caches = /* @__PURE__ */ new WeakMap();
	function getCacheKey(kind, name, id) {
		return `${kind}:${name}:${id}`;
	}
	/**
	* Returns the registered block types, from the registry `parse` reads.
	*
	* Block types are registered on the default registry, so the cache is
	* partitioned by that registry's list rather than one from the registry
	* hosting the entities.
	*
	* @return Registered block types.
	*/
	function getBlockTypes$1() {
		return (0, _wordpress_data.select)(_wordpress_blocks.store).getBlockTypes();
	}
	/**
	* Returns the blocks cached for an entity, if they were parsed from the
	* given content with the block types registered right now.
	*
	* @param kind    Entity kind.
	* @param name    Entity name.
	* @param id      Record ID.
	* @param content The record's current `content` string.
	*
	* @return The cached blocks, or undefined without a valid
	*         entry.
	*/
	function getCachedBlocks(kind, name, id, content) {
		const cached = caches.get(getBlockTypes$1())?.get(getCacheKey(kind, name, id));
		if (cached && cached.content === content) return cached.blocks;
	}
	/**
	* Caches the blocks parsed for an entity, under the block types they were
	* parsed with.
	*
	* @param kind    Entity kind.
	* @param name    Entity name.
	* @param id      Record ID.
	* @param content The `content` string the blocks were parsed
	*                from.
	* @param blocks  The parsed blocks.
	*/
	function setCachedBlocks(kind, name, id, content, blocks) {
		const blockTypes = getBlockTypes$1();
		let cache = caches.get(blockTypes);
		if (!cache) {
			cache = /* @__PURE__ */ new Map();
			caches.set(blockTypes, cache);
		}
		cache.set(getCacheKey(kind, name, id), {
			content,
			blocks
		});
	}

// packages/core-data/build-module/resolvers.mjs
	var resolvers_exports = /* @__PURE__ */ __exportAll({
		__experimentalGetCurrentGlobalStylesId: () => __experimentalGetCurrentGlobalStylesId,
		__experimentalGetCurrentThemeBaseGlobalStyles: () => __experimentalGetCurrentThemeBaseGlobalStyles,
		__experimentalGetCurrentThemeGlobalStylesVariations: () => __experimentalGetCurrentThemeGlobalStylesVariations,
		canUser: () => canUser,
		canUserEditEntityRecord: () => canUserEditEntityRecord,
		getAuthors: () => getAuthors,
		getAutosave: () => getAutosave,
		getAutosaves: () => getAutosaves,
		getBlockPatternCategories: () => getBlockPatternCategories,
		getBlockPatterns: () => getBlockPatterns,
		getCurrentTheme: () => getCurrentTheme,
		getCurrentThemeGlobalStylesRevisions: () => getCurrentThemeGlobalStylesRevisions,
		getCurrentUser: () => getCurrentUser,
		getDefaultTemplateId: () => getDefaultTemplateId,
		getEditedEntityRecord: () => getEditedEntityRecord,
		getEditorAssets: () => getEditorAssets,
		getEditorSettings: () => getEditorSettings,
		getEmbedPreview: () => getEmbedPreview,
		getEntitiesConfig: () => getEntitiesConfig,
		getEntityActionsConfig: () => getEntityActionsConfig,
		getEntityRecord: () => getEntityRecord,
		getEntityRecords: () => getEntityRecords,
		getEntityRecordsTotalItems: () => getEntityRecordsTotalItems,
		getEntityRecordsTotalPages: () => getEntityRecordsTotalPages,
		getFieldsConfig: () => getFieldsConfig,
		getNavigationFallbackId: () => getNavigationFallbackId,
		getRawEntityRecord: () => getRawEntityRecord,
		getRegisteredPostMeta: () => getRegisteredPostMeta,
		getRevision: () => getRevision,
		getRevisions: () => getRevisions,
		getThemeSupports: () => getThemeSupports,
		getUserPatternCategories: () => getUserPatternCategories,
		getViewConfig: () => getViewConfig
	}, 1);
	/**
	* Requests authors from the REST API.
	*
	* @param query Optional object of query parameters to
	*              include with request.
	*/
	const getAuthors = (query) => async ({ dispatch }) => {
		const path = (0, _wordpress_url.addQueryArgs)("/wp/v2/users/?who=authors&per_page=100", query);
		const users = await (0, _wordpress_api_fetch.default)({ path });
		dispatch.receiveUserQuery(path, users);
	};
	/**
	* Requests the current user from the REST API.
	*/
	const getCurrentUser = () => async ({ dispatch }) => {
		const currentUser = await (0, _wordpress_api_fetch.default)({ path: "/wp/v2/users/me" });
		dispatch.receiveCurrentUser(currentUser);
	};
	/**
	* Requests an entity's record from the REST API.
	*
	* @param kind  Entity kind.
	* @param name  Entity name.
	* @param key   Record's key
	* @param query Optional object of query parameters to
	*              include with request. If requesting specific
	*              fields, fields must always include the ID.
	*/
	const getEntityRecord = (kind, name, key = "", query) => async ({ select, dispatch, registry, resolveSelect }) => {
		const entityConfig = (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.name === name && config.kind === kind);
		if (!entityConfig) return;
		const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, [
			"entities",
			"records",
			kind,
			name,
			key
		], { exclusive: false });
		try {
			if (query !== void 0 && query._fields) query = {
				...query,
				_fields: [.../* @__PURE__ */ new Set([...getNormalizedCommaSeparable(query._fields) || [], entityConfig.key || "id"])].join()
			};
			if (query !== void 0 && query._fields) {
				if (select.hasEntityRecord(kind, name, key, query)) return;
			}
			const { baseURL } = entityConfig;
			const path = (0, _wordpress_url.addQueryArgs)(baseURL + (key ? "/" + key : ""), {
				...entityConfig.baseURLParams,
				...query
			});
			const response = await (0, _wordpress_api_fetch.default)({
				path,
				parse: false
			});
			const record = await response.json();
			const permissions = getUserPermissionsFromAllowHeader(response.headers?.get("allow"));
			const receiveUserPermissionArgs = {};
			for (const action of ALLOWED_RESOURCE_ACTIONS) receiveUserPermissionArgs[getUserPermissionCacheKey(action, {
				kind,
				name,
				id: key
			})] = permissions[action];
			const canUserResolutionsArgs = [[{
				kind,
				name,
				id: key
			}]];
			const syncManager = select?.isCollaborationSupported?.() === false ? void 0 : getEntitySyncManager();
			if (syncManager && isNumericID(key) && !query && false !== syncManager.shouldSync?.(kind, name, key)) {
				const recordWithTransients = { ...record };
				Object.entries(entityConfig.transientEdits ?? {}).filter(([propName, transientConfig]) => void 0 === recordWithTransients[propName] && transientConfig && "object" === typeof transientConfig && "read" in transientConfig && "function" === typeof transientConfig.read).forEach(([propName, transientConfig]) => {
					recordWithTransients[propName] = transientConfig.read(recordWithTransients);
				});
				if (recordWithTransients.blocks && typeof recordWithTransients.content?.raw === "string") setCachedBlocks(kind, name, key, recordWithTransients.content.raw, recordWithTransients.blocks);
				syncManager.load(kind, name, key, recordWithTransients, {
					editRecord: (edits, options = {}) => {
						if (!Object.keys(edits).length) return;
						dispatch({
							type: "EDIT_ENTITY_RECORD",
							kind,
							name,
							recordId: key,
							edits,
							meta: { undo: void 0 },
							options
						});
					},
					getEditedRecord: async () => await resolveSelect.getEditedEntityRecord(kind, name, key),
					refetchRecord: async () => {
						dispatch.receiveEntityRecords(kind, name, await (0, _wordpress_api_fetch.default)({
							path,
							parse: true
						}), query);
					},
					onUndoLevelOpened: () => {
						dispatch.recordSyncUndoLevel(kind, name, key);
					}
				});
			}
			registry.batch(() => {
				dispatch.receiveEntityRecords(kind, name, record, query);
				dispatch.receiveUserPermissions(receiveUserPermissionArgs);
				dispatch.finishResolutions("canUser", canUserResolutionsArgs);
			});
		} finally {
			dispatch.__unstableReleaseStoreLock(lock);
		}
	};
	getEntityRecord.shouldInvalidate = (action, kind, name) => {
		return kind === "root" && name === "site" && (action.type === "RECEIVE_ITEMS" && action.persistedEdits && action.persistedEdits.status !== "auto-draft" || action.type === "REMOVE_ITEMS") && action.kind === "postType" && action.name === "wp_template";
	};
	/**
	* Requests an entity's record from the REST API.
	*/
	const getRawEntityRecord = forwardResolver("getEntityRecord");
	/**
	* Requests an entity's record from the REST API.
	*/
	const getEditedEntityRecord = forwardResolver("getEntityRecord");
	/**
	* Requests the entity's records from the REST API.
	*
	* @param kind  Entity kind.
	* @param name  Entity name.
	* @param query Query Object. If requesting specific fields, fields
	*              must always include the ID.
	*/
	const getEntityRecords = (kind, name, query = {}) => async ({ dispatch, registry, resolveSelect }) => {
		const entityConfig = (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.name === name && config.kind === kind);
		if (!entityConfig) return;
		const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, [
			"entities",
			"records",
			kind,
			name
		], { exclusive: false });
		const rawQuery = { ...query };
		const key = entityConfig.key || "id";
		function getResolutionsArgs(records, recordsQuery) {
			const normalizedQuery = normalizeQueryForResolution(recordsQuery);
			return records.filter((record) => record?.[key]).map((record) => [
				kind,
				name,
				record[key],
				normalizedQuery
			]);
		}
		try {
			if (query._fields) query = {
				...query,
				_fields: [.../* @__PURE__ */ new Set([...getNormalizedCommaSeparable(query._fields) || [], key])].join()
			};
			const { baseURL } = entityConfig;
			const path = (0, _wordpress_url.addQueryArgs)(baseURL, {
				...entityConfig.baseURLParams,
				...query
			});
			let records = [], meta;
			if (entityConfig.supportsPagination && query.per_page !== -1) {
				const response = await (0, _wordpress_api_fetch.default)({
					path,
					parse: false
				});
				records = Object.values(await response.json());
				meta = getPaginationMeta(response.headers);
			} else if (query.per_page === -1 && query[RECEIVE_INTERMEDIATE_RESULTS] === true) {
				let page = 1;
				let totalPages;
				do {
					const response = await (0, _wordpress_api_fetch.default)({
						path: (0, _wordpress_url.addQueryArgs)(path, {
							page,
							per_page: 100
						}),
						parse: false
					});
					const pageRecords = Object.values(await response.json());
					const pageMeta = getPaginationMeta(response.headers);
					totalPages = pageMeta.totalPages ?? 1;
					if (!meta) meta = {
						totalItems: pageMeta.totalItems,
						totalPages: 1
					};
					records.push(...pageRecords);
					registry.batch(() => {
						dispatch.receiveEntityRecords(kind, name, records, query, false, void 0, meta);
						dispatch.finishResolutions("getEntityRecord", getResolutionsArgs(pageRecords, rawQuery));
					});
					page++;
				} while (page <= totalPages);
			} else {
				records = Object.values(await (0, _wordpress_api_fetch.default)({ path }));
				meta = {
					totalItems: records.length,
					totalPages: 1
				};
			}
			if (-1 === query.per_page) getEntitySyncManager()?.loadCollection?.(kind, name, { refetchRecords: async () => {
				dispatch.receiveEntityRecords(kind, name, await (0, _wordpress_api_fetch.default)({
					path,
					parse: true
				}), query);
			} });
			if (query._fields) records = records.map((record) => {
				query._fields.split(",").forEach((field) => {
					if (!record.hasOwnProperty(field)) record[field] = void 0;
				});
				return record;
			});
			registry.batch(() => {
				dispatch.receiveEntityRecords(kind, name, records, query, false, void 0, meta);
				const targetHints = records.filter((record) => !!record?.[key] && !!record?._links?.self?.[0]?.targetHints?.allow).map((record) => ({
					id: record[key],
					permissions: getUserPermissionsFromAllowHeader(record._links.self[0].targetHints.allow)
				}));
				const canUserResolutionsArgs = [];
				const receiveUserPermissionArgs = {};
				for (const targetHint of targetHints) {
					canUserResolutionsArgs.push([{
						kind,
						name,
						id: targetHint.id
					}]);
					for (const action of ALLOWED_RESOURCE_ACTIONS) receiveUserPermissionArgs[getUserPermissionCacheKey(action, {
						kind,
						name,
						id: targetHint.id
					})] = targetHint.permissions[action];
				}
				if (targetHints.length > 0) {
					dispatch.receiveUserPermissions(receiveUserPermissionArgs);
					dispatch.finishResolutions("canUser", canUserResolutionsArgs);
				}
				dispatch.finishResolutions("getEntityRecord", getResolutionsArgs(records, rawQuery));
				dispatch.__unstableReleaseStoreLock(lock);
			});
		} catch {
			dispatch.__unstableReleaseStoreLock(lock);
		}
	};
	getEntityRecords.shouldInvalidate = (action, kind, name) => {
		return (action.type === "RECEIVE_ITEMS" || action.type === "REMOVE_ITEMS") && action.invalidateCache && kind === action.kind && name === action.name;
	};
	/**
	* Requests the total number of entity records.
	*/
	const getEntityRecordsTotalItems = forwardResolver("getEntityRecords");
	/**
	* Requests the number of available pages for the given query.
	*/
	const getEntityRecordsTotalPages = forwardResolver("getEntityRecords");
	/**
	* Requests the current theme.
	*/
	const getCurrentTheme = () => async ({ dispatch, resolveSelect }) => {
		const activeThemes = await resolveSelect.getEntityRecords("root", "theme", { status: "active" });
		dispatch.receiveCurrentTheme(activeThemes[0]);
	};
	/**
	* Requests theme supports data from the index.
	*/
	const getThemeSupports = forwardResolver("getCurrentTheme");
	/**
	* Requests a preview from the Embed API.
	*
	* @param url URL to get the preview for.
	*/
	const getEmbedPreview = (url) => async ({ dispatch }) => {
		try {
			const embedProxyResponse = await (0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/oembed/1.0/proxy", { url }) });
			dispatch.receiveEmbedPreview(url, embedProxyResponse);
		} catch {
			dispatch.receiveEmbedPreview(url, false);
		}
	};
	/**
	* Checks whether the current user can perform the given action on the given
	* REST resource.
	*
	* @param resource Entity resource to check. Accepts entity object `{ kind: 'postType', name: 'attachment', id: 1 }`
	*                 or REST base as a string - `media`.
	* @param id       ID of the rest resource to check.
	*/
	const canUser = (resource, id) => async ({ dispatch, resolveSelect }) => {
		let resourcePath = null;
		if (typeof resource === "object") {
			if (!resource.kind || !resource.name) throw new Error("The entity resource object is not valid.");
			const entityConfig = (await resolveSelect.getEntitiesConfig(resource.kind)).find((config) => config.name === resource.name && config.kind === resource.kind);
			if (!entityConfig) return;
			resourcePath = entityConfig.baseURL + (resource.id ? "/" + resource.id : "");
		} else resourcePath = `/wp/v2/${resource}` + (id ? "/" + id : "");
		let response;
		try {
			response = await (0, _wordpress_api_fetch.default)({
				path: resourcePath,
				method: "OPTIONS",
				parse: false
			});
		} catch {
			return;
		}
		const permissions = getUserPermissionsFromAllowHeader(response.headers?.get("allow"));
		const receiveUserPermissionArgs = {};
		for (const action of ALLOWED_RESOURCE_ACTIONS) receiveUserPermissionArgs[getUserPermissionCacheKey(action, resource, id)] = permissions[action];
		dispatch.receiveUserPermissions(receiveUserPermissionArgs);
	};
	/**
	* One OPTIONS request returns the permissions for every action, so the action
	* is left out of the key and all four `canUser` calls for a resource share a
	* single resolver run.
	*
	* @param action   Action the selector was called with.
	* @param resource Entity resource to check.
	* @param id       ID of the rest resource to check.
	*
	* @return The cache key arguments.
	*/
	canUser.getResolutionArgs = (action, resource, id) => [resource, id];
	/**
	* Checks whether the current user can perform the given action on the given
	* REST resource.
	*
	* @param kind     Entity kind.
	* @param name     Entity name.
	* @param recordId Record's id.
	*/
	const canUserEditEntityRecord = (kind, name, recordId) => async ({ resolveSelect }) => {
		await resolveSelect.canUser("update", {
			kind,
			name,
			id: recordId
		});
	};
	/**
	* Request autosave data from the REST API.
	*
	* @param postType The type of the parent post.
	* @param postId   The id of the parent post.
	*/
	const getAutosaves = (postType, postId) => async ({ dispatch, resolveSelect }) => {
		const { rest_base: restBase, rest_namespace: restNamespace = "wp/v2", supports } = await resolveSelect.getPostType(postType);
		if (!supports?.autosave) return;
		const autosaves = await (0, _wordpress_api_fetch.default)({ path: `/${restNamespace}/${restBase}/${postId}/autosaves?context=edit` });
		if (autosaves && autosaves.length) dispatch.receiveAutosaves(postId, autosaves);
	};
	/**
	* Request autosave data from the REST API.
	*
	* This resolver exists to ensure the underlying autosaves are fetched via
	* `getAutosaves` when a call to the `getAutosave` selector is made.
	*
	* @param postType The type of the parent post.
	* @param postId   The id of the parent post.
	*/
	const getAutosave = (postType, postId) => async ({ resolveSelect }) => {
		await resolveSelect.getAutosaves(postType, postId);
	};
	const __experimentalGetCurrentGlobalStylesId = () => async ({ dispatch, resolveSelect }) => {
		const globalStylesURL = ((await resolveSelect.getEntityRecords("root", "theme", { status: "active" }))?.[0])?._links?.["wp:user-global-styles"]?.[0]?.href;
		if (!globalStylesURL) return;
		const matches = globalStylesURL.match(/\/(\d+)(?:\?|$)/);
		const id = matches ? Number(matches[1]) : null;
		if (id) dispatch.__experimentalReceiveCurrentGlobalStylesId(id);
	};
	const __experimentalGetCurrentThemeBaseGlobalStyles = () => async ({ resolveSelect, dispatch }) => {
		const currentTheme = await resolveSelect.getCurrentTheme();
		const themeGlobalStyles = await (0, _wordpress_api_fetch.default)({ path: `/wp/v2/global-styles/themes/${currentTheme.stylesheet}?context=view` });
		dispatch.__experimentalReceiveThemeBaseGlobalStyles(currentTheme.stylesheet, themeGlobalStyles);
	};
	const __experimentalGetCurrentThemeGlobalStylesVariations = () => async ({ resolveSelect, dispatch }) => {
		const currentTheme = await resolveSelect.getCurrentTheme();
		const variations = await (0, _wordpress_api_fetch.default)({ path: `/wp/v2/global-styles/themes/${currentTheme.stylesheet}/variations?context=view` });
		dispatch.__experimentalReceiveThemeGlobalStyleVariations(currentTheme.stylesheet, variations);
	};
	/**
	* Fetches and returns the revisions of the current global styles theme.
	*/
	const getCurrentThemeGlobalStylesRevisions = () => async ({ resolveSelect, dispatch }) => {
		const globalStylesId = await resolveSelect.__experimentalGetCurrentGlobalStylesId();
		const revisionsURL = (globalStylesId ? await resolveSelect.getEntityRecord("root", "globalStyles", globalStylesId) : void 0)?._links?.["version-history"]?.[0]?.href;
		if (revisionsURL) {
			const revisions = (await (0, _wordpress_api_fetch.default)({ url: revisionsURL }))?.map((revision) => Object.fromEntries(Object.entries(revision).map(([key, value]) => [camelCase(key), value])));
			dispatch.receiveThemeGlobalStyleRevisions(globalStylesId, revisions);
		}
	};
	getCurrentThemeGlobalStylesRevisions.shouldInvalidate = (action) => {
		return action.type === "SAVE_ENTITY_RECORD_FINISH" && action.kind === "root" && !action.error && action.name === "globalStyles";
	};
	const getBlockPatterns = () => async ({ dispatch }) => {
		dispatch({
			type: "RECEIVE_BLOCK_PATTERNS",
			patterns: await fetchBlockPatterns()
		});
	};
	const getBlockPatternCategories = () => async ({ dispatch }) => {
		dispatch({
			type: "RECEIVE_BLOCK_PATTERN_CATEGORIES",
			categories: await (0, _wordpress_api_fetch.default)({ path: "/wp/v2/block-patterns/categories" })
		});
	};
	const getUserPatternCategories = () => async ({ dispatch, resolveSelect }) => {
		dispatch({
			type: "RECEIVE_USER_PATTERN_CATEGORIES",
			patternCategories: (await resolveSelect.getEntityRecords("taxonomy", "wp_pattern_category", {
				per_page: -1,
				_fields: "id,name,description,slug",
				context: "view"
			}))?.map((userCategory) => ({
				...userCategory,
				label: (0, _wordpress_html_entities.decodeEntities)(userCategory.name),
				name: userCategory.slug
			})) || []
		});
	};
	const getNavigationFallbackId = () => async ({ dispatch, select, registry }) => {
		const fallback = await (0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/wp-block-editor/v1/navigation-fallback", { _embed: true }) });
		const record = fallback?._embedded?.self;
		registry.batch(() => {
			dispatch.receiveNavigationFallbackId(fallback?.id);
			if (!record) return;
			const invalidateNavigationQueries = !select.getEntityRecord("postType", "wp_navigation", fallback.id);
			dispatch.receiveEntityRecords("postType", "wp_navigation", record, void 0, invalidateNavigationQueries);
			dispatch.finishResolution("getEntityRecord", [
				"postType",
				"wp_navigation",
				fallback.id
			]);
		});
	};
	const getDefaultTemplateId = (query) => async ({ dispatch, registry, resolveSelect }) => {
		const template = await (0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/wp/v2/templates/lookup", query) });
		await resolveSelect.getEntitiesConfig("postType");
		const id = template?.id;
		registry.batch(() => {
			dispatch.receiveDefaultTemplateId(query, id || "");
			if (id) {
				template.id = id;
				dispatch.receiveEntityRecords("postType", template.type, template);
				dispatch.finishResolution("getEntityRecord", [
					"postType",
					template.type,
					id
				]);
			}
		});
	};
	/**
	* Requests an entity's revisions from the REST API.
	*
	* @param kind      Entity kind.
	* @param name      Entity name.
	* @param recordKey The key of the entity record whose revisions you want to fetch.
	* @param query     Optional object of query parameters to
	*                  include with request. If requesting specific
	*                  fields, fields must always include the ID.
	*/
	const getRevisions = (kind, name, recordKey, query = {}) => async ({ dispatch, resolveSelect }) => {
		const entityConfig = (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.name === name && config.kind === kind);
		if (!entityConfig) return;
		const rawQuery = { ...query };
		const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, [
			"entities",
			"records",
			kind,
			name,
			recordKey,
			"revisions"
		], { exclusive: false });
		try {
			if (query._fields) query = {
				...query,
				_fields: [.../* @__PURE__ */ new Set([...getNormalizedCommaSeparable(query._fields) || [], entityConfig.revisionKey || "id"])].join()
			};
			const path = (0, _wordpress_url.addQueryArgs)(entityConfig.getRevisionsUrl(recordKey), query);
			let records, response;
			const meta = {};
			const isPaginated = entityConfig.supportsPagination && query.per_page !== -1;
			try {
				response = await (0, _wordpress_api_fetch.default)({
					path,
					parse: !isPaginated
				});
			} catch {
				return;
			}
			if (response) {
				if (isPaginated) {
					records = Object.values(await response.json());
					meta.totalItems = getPaginationMeta(response.headers).totalItems;
				} else records = Object.values(response);
				if (query._fields) records = records.map((record) => {
					query._fields.split(",").forEach((field) => {
						if (!record.hasOwnProperty(field)) record[field] = void 0;
					});
					return record;
				});
				await dispatch.receiveRevisions(kind, name, recordKey, records, query, false, meta);
				const key = entityConfig.revisionKey || "id";
				const normalizedQuery = normalizeQueryForResolution(rawQuery);
				const resolutionsArgs = records.filter((record) => record[key]).map((record) => [
					kind,
					name,
					recordKey,
					record[key],
					normalizedQuery
				]);
				dispatch.finishResolutions("getRevision", resolutionsArgs);
			}
		} finally {
			dispatch.__unstableReleaseStoreLock(lock);
		}
	};
	getRevisions.shouldInvalidate = (action, kind, name, recordKey) => action.type === "SAVE_ENTITY_RECORD_FINISH" && name === action.name && kind === action.kind && !action.error && recordKey === action.recordId;
	/**
	* Requests a specific Entity revision from the REST API.
	*
	* @param kind        Entity kind.
	* @param name        Entity name.
	* @param recordKey   The key of the entity record whose revisions you want to fetch.
	* @param revisionKey The revision's key.
	* @param query       Optional object of query parameters to
	*                    include with request. If requesting specific
	*                    fields, fields must always include the ID.
	*/
	const getRevision = (kind, name, recordKey, revisionKey, query) => async ({ select, dispatch, resolveSelect }) => {
		const entityConfig = (await resolveSelect.getEntitiesConfig(kind)).find((config) => config.name === name && config.kind === kind);
		if (!entityConfig) return;
		if (query !== void 0 && query._fields) query = {
			...query,
			_fields: [.../* @__PURE__ */ new Set([...getNormalizedCommaSeparable(query._fields) || [], entityConfig.revisionKey || "id"])].join()
		};
		const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, [
			"entities",
			"records",
			kind,
			name,
			recordKey,
			"revisions",
			revisionKey
		], { exclusive: false });
		try {
			if (select.hasRevision(kind, name, recordKey, revisionKey, query)) return;
			const path = (0, _wordpress_url.addQueryArgs)(entityConfig.getRevisionsUrl(recordKey, revisionKey), query);
			let record;
			try {
				record = await (0, _wordpress_api_fetch.default)({ path });
			} catch {
				return;
			}
			if (record) await dispatch.receiveRevisions(kind, name, recordKey, record, query);
		} finally {
			dispatch.__unstableReleaseStoreLock(lock);
		}
	};
	/**
	* Requests a specific post type options from the REST API.
	*
	* @param postType Post type slug.
	*/
	const getRegisteredPostMeta = (postType) => async ({ dispatch, resolveSelect }) => {
		let options;
		try {
			const { rest_namespace: restNamespace = "wp/v2", rest_base: restBase } = await resolveSelect.getPostType(postType) || {};
			options = await (0, _wordpress_api_fetch.default)({
				path: `${restNamespace}/${restBase}/?context=edit`,
				method: "OPTIONS"
			});
		} catch {
			return;
		}
		if (options) dispatch.receiveRegisteredPostMeta(postType, options?.schema?.properties?.meta?.properties);
	};
	/**
	* Requests entity configs for the given kind from the REST API.
	*
	* @param kind Entity kind.
	*/
	const getEntitiesConfig = (kind) => async ({ dispatch }) => {
		const loader = additionalEntityConfigLoaders.find((l) => l.kind === kind);
		if (!loader) return;
		try {
			const configs = await loader.loadEntities();
			if (!configs.length) return;
			dispatch.addEntities(configs);
		} catch {}
	};
	/**
	* Requests editor settings from the REST API.
	*/
	const getEditorSettings = () => async ({ dispatch }) => {
		const settings = await (0, _wordpress_api_fetch.default)({ path: "/wp-block-editor/v1/settings" });
		dispatch.receiveEditorSettings(settings);
	};
	/**
	* Requests editor assets from the REST API.
	*/
	const getEditorAssets = () => async ({ dispatch }) => {
		const assets = await (0, _wordpress_api_fetch.default)({ path: "/wp-block-editor/v1/assets" });
		dispatch.receiveEditorAssets(assets);
	};
	/**
	* Requests view config for a given entity type from the REST API.
	*
	* @param kind           Entity kind.
	* @param name           Entity name.
	* @param options        Optional options.
	* @param options.fields Optional subset of top-level config
	*                       properties to request, mapped to the REST
	*                       API `_fields` parameter. When omitted, the
	*                       full config is requested.
	*/
	const getViewConfig = (kind, name, options = {}) => async ({ dispatch }) => {
		const query = {
			kind,
			name
		};
		const fields = getNormalizedCommaSeparable(options.fields);
		if (fields?.length) query._fields = fields.join(",");
		const config = await (0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/wp/v2/view-config", query) });
		dispatch.receiveViewConfig(kind, name, config);
	};
	/**
	* Requests the fields registered on the server for a given entity from the
	* REST API.
	*
	* @param kind Entity kind.
	* @param name Entity name.
	*/
	const getFieldsConfig = (kind, name) => async ({ dispatch }) => {
		const config = await (0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/wp/v2/entity-fields", {
			kind,
			name
		}) });
		dispatch.receiveFieldsConfig(kind, name, config);
	};
	/**
	* Requests the actions registered on the server for a given entity from the
	* REST API.
	*
	* @param kind Entity kind.
	* @param name Entity name.
	*/
	const getEntityActionsConfig = (kind, name) => async ({ dispatch }) => {
		const config = await (0, _wordpress_api_fetch.default)({ path: (0, _wordpress_url.addQueryArgs)("/wp/v2/entity-actions", {
			kind,
			name
		}) });
		dispatch.receiveEntityActionsConfig(kind, name, config);
	};

// packages/core-data/build-module/locks/utils.mjs
	function deepCopyLocksTreePath(tree, path) {
		const newTree = { ...tree };
		let currentNode = newTree;
		for (const branchName of path) {
			currentNode.children = {
				...currentNode.children,
				[branchName]: {
					locks: [],
					children: {},
					...currentNode.children[branchName]
				}
			};
			currentNode = currentNode.children[branchName];
		}
		return newTree;
	}
	function getNode(tree, path) {
		let currentNode = tree;
		for (const branchName of path) {
			const nextNode = currentNode.children[branchName];
			if (!nextNode) return null;
			currentNode = nextNode;
		}
		return currentNode;
	}
	function* iteratePath(tree, path) {
		let currentNode = tree;
		yield currentNode;
		for (const branchName of path) {
			const nextNode = currentNode.children[branchName];
			if (!nextNode) break;
			yield nextNode;
			currentNode = nextNode;
		}
	}
	function* iterateDescendants(node) {
		const stack = Object.values(node.children);
		while (stack.length) {
			const childNode = stack.pop();
			yield childNode;
			stack.push(...Object.values(childNode.children));
		}
	}
	function hasConflictingLock({ exclusive }, locks) {
		if (exclusive && locks.length) return true;
		if (!exclusive && locks.filter((lock) => lock.exclusive).length) return true;
		return false;
	}

// packages/core-data/build-module/locks/reducer.mjs
	const DEFAULT_STATE = {
		requests: [],
		tree: {
			locks: [],
			children: {}
		}
	};
	/**
	* Reducer returning locks.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function locks(state = DEFAULT_STATE, action) {
		switch (action.type) {
			case "ENQUEUE_LOCK_REQUEST": {
				const { request } = action;
				return {
					...state,
					requests: [request, ...state.requests]
				};
			}
			case "GRANT_LOCK_REQUEST": {
				const { lock, request } = action;
				const { store, path } = request;
				const storePath = [store, ...path];
				const newTree = deepCopyLocksTreePath(state.tree, storePath);
				const node = getNode(newTree, storePath);
				node.locks = [...node.locks, lock];
				return {
					...state,
					requests: state.requests.filter((r) => r !== request),
					tree: newTree
				};
			}
			case "RELEASE_LOCK": {
				const { lock } = action;
				const storePath = [lock.store, ...lock.path];
				const newTree = deepCopyLocksTreePath(state.tree, storePath);
				const node = getNode(newTree, storePath);
				node.locks = node.locks.filter((l) => l !== lock);
				return {
					...state,
					tree: newTree
				};
			}
		}
		return state;
	}

// packages/core-data/build-module/locks/selectors.mjs
	function getPendingLockRequests(state) {
		return state.requests;
	}
	function isLockAvailable(state, store, path, { exclusive }) {
		const storePath = [store, ...path];
		const locks = state.tree;
		for (const node of iteratePath(locks, storePath)) if (hasConflictingLock({ exclusive }, node.locks)) return false;
		const node = getNode(locks, storePath);
		if (!node) return true;
		for (const descendant of iterateDescendants(node)) if (hasConflictingLock({ exclusive }, descendant.locks)) return false;
		return true;
	}

// packages/core-data/build-module/locks/engine.mjs
	function createLocks() {
		let state = locks(void 0, { type: "@@INIT" });
		function processPendingLockRequests() {
			for (const request of getPendingLockRequests(state)) {
				const { store, path, exclusive, notifyAcquired } = request;
				if (isLockAvailable(state, store, path, { exclusive })) {
					const lock = {
						store,
						path,
						exclusive
					};
					state = locks(state, {
						type: "GRANT_LOCK_REQUEST",
						lock,
						request
					});
					notifyAcquired(lock);
				}
			}
		}
		function acquire(store, path, exclusive) {
			return new Promise((resolve) => {
				state = locks(state, {
					type: "ENQUEUE_LOCK_REQUEST",
					request: {
						store,
						path,
						exclusive,
						notifyAcquired: resolve
					}
				});
				processPendingLockRequests();
			});
		}
		function release(lock) {
			state = locks(state, {
				type: "RELEASE_LOCK",
				lock
			});
			processPendingLockRequests();
		}
		return {
			acquire,
			release
		};
	}

// packages/core-data/build-module/locks/actions.mjs
	function createLocksActions() {
		const locks = createLocks();
		function __unstableAcquireStoreLock(store, path, { exclusive }) {
			return () => locks.acquire(store, path, exclusive);
		}
		function __unstableReleaseStoreLock(lock) {
			return () => locks.release(lock);
		}
		return {
			__unstableAcquireStoreLock,
			__unstableReleaseStoreLock
		};
	}

// packages/core-data/build-module/dynamic-entities.mjs
	let dynamicActions;
	let dynamicSelectors;

// packages/core-data/build-module/entity-context.mjs
	const EntityContext = (0, _wordpress_element.createContext)({});
	EntityContext.displayName = "EntityContext";

// packages/core-data/build-module/entity-provider.mjs
/**
	* Context provider component for providing
	* an entity for a specific entity.
	*
	* @param props            The component's props.
	* @param props.kind       The entity kind.
	* @param props.type       The entity name.
	* @param props.id         The entity ID.
	* @param props.revisionId Optional revision ID. When set,
	*                         `useEntityProp` reads from the
	*                         revision record instead of the
	*                         current entity. Applies only to this
	*                         entity, not to others rendered within
	*                         it.
	* @param props.children   The children to wrap.
	*
	* @return The provided children, wrapped with
	*         the entity's context provider.
	*/
	function EntityProvider({ kind, type, id, revisionId, children }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PrivateEntityProvider, {
			kind,
			type,
			id,
			revisionId,
			children
		});
	}
	/**
	* Like `EntityProvider`, but also accepts a record to read from instead of
	* the current entity, for content that isn't stored as a revision. Fields the
	* record doesn't have are read from the current entity.
	*
	* @param props            The component's props.
	* @param props.kind       The entity kind.
	* @param props.type       The entity name.
	* @param props.id         The entity ID.
	* @param props.revisionId Optional revision ID.
	* @param props.revision   Optional record to read from.
	* @param props.children   The children to wrap.
	*
	* @return The provided children, wrapped with
	*         the entity's context provider.
	*/
	function PrivateEntityProvider({ kind, type: name, id, revisionId, revision, children }) {
		const parent = (0, _wordpress_element.useContext)(EntityContext);
		const providedRevision = revision ?? revisionId;
		const childContext = (0, _wordpress_element.useMemo)(() => ({
			...parent,
			...kind && { [kind]: {
				...parent?.[kind],
				[name]: id
			} },
			...providedRevision !== void 0 && kind && { revision: {
				...parent?.revision,
				[kind]: {
					...parent?.revision?.[kind],
					[name]: providedRevision
				}
			} }
		}), [
			parent,
			kind,
			name,
			id,
			providedRevision
		]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntityContext.Provider, {
			value: childContext,
			children
		});
	}

// packages/core-data/build-module/hooks/constants.mjs
	let Status = /* @__PURE__ */ function(Status) {
		Status["Idle"] = "IDLE";
		Status["Resolving"] = "RESOLVING";
		Status["Error"] = "ERROR";
		Status["Success"] = "SUCCESS";
		return Status;
	}({});

// packages/core-data/build-module/hooks/utils.mjs
/**
	* Normalizes a resolution status from the store into the resolution info
	* shared by the entity record hooks and `useQuerySelect`.
	*
	* @param resolutionStatus Status returned by the `getResolutionState` selector.
	* @return Resolution info object.
	*/
	function getResolutionStatus(resolutionStatus) {
		let status;
		switch (resolutionStatus) {
			case "resolving":
				status = Status.Resolving;
				break;
			case "finished":
				status = Status.Success;
				break;
			case "error":
				status = Status.Error;
				break;
			default: status = Status.Idle;
		}
		return {
			status,
			isResolving: status === Status.Resolving,
			hasStarted: status !== Status.Idle,
			hasResolved: status === Status.Success || status === Status.Error
		};
	}

// packages/core-data/build-module/hooks/use-entity-record.mjs
	const EMPTY_OBJECT$1 = {};
	/**
	* Resolves the specified entity record.
	*
	* @since 6.1.0 Introduced in WordPress core.
	*
	* @param    kind     Kind of the entity, e.g. `root` or a `postType`. See rootEntitiesConfig in ../entities.ts for a list of available kinds.
	* @param    name     Name of the entity, e.g. `plugin` or a `post`. See rootEntitiesConfig in ../entities.ts for a list of available names.
	* @param    recordId ID of the requested entity record.
	* @param    options  Optional hook options.
	* @example
	* ```js
	* import { useEntityRecord } from '@wordpress/core-data';
	*
	* function PageTitleDisplay( { id } ) {
	*   const { record, isResolving } = useEntityRecord( 'postType', 'page', id );
	*
	*   if ( isResolving ) {
	*     return 'Loading...';
	*   }
	*
	*   return record.title;
	* }
	*
	* // Rendered in the application:
	* // <PageTitleDisplay id={ 1 } />
	* ```
	*
	* In the above example, when `PageTitleDisplay` is rendered into an
	* application, the page and the resolution details will be retrieved from
	* the store state using `getEntityRecord()`, or resolved if missing.
	*
	* @example
	* ```js
	* import { useCallback } from 'react';
	* import { useDispatch } from '@wordpress/data';
	* import { __ } from '@wordpress/i18n';
	* import { TextControl } from '@wordpress/components';
	* import { store as noticeStore } from '@wordpress/notices';
	* import { useEntityRecord } from '@wordpress/core-data';
	*
	* function PageRenameForm( { id } ) {
	* 	const page = useEntityRecord( 'postType', 'page', id );
	* 	const { createSuccessNotice, createErrorNotice } =
	* 		useDispatch( noticeStore );
	*
	* 	const setTitle = useCallback( ( title ) => {
	* 		page.edit( { title } );
	* 	}, [ page.edit ] );
	*
	* 	if ( page.isResolving ) {
	* 		return 'Loading...';
	* 	}
	*
	* 	async function onRename( event ) {
	* 		event.preventDefault();
	* 		try {
	* 			await page.save();
	* 			createSuccessNotice( __( 'Page renamed.' ), {
	* 				type: 'snackbar',
	* 			} );
	* 		} catch ( error ) {
	* 			createErrorNotice( error.message, { type: 'snackbar' } );
	* 		}
	* 	}
	*
	* 	return (
	* 		<form onSubmit={ onRename }>
	* 			<TextControl
	* 				label={ __( 'Name' ) }
	* 				value={ page.editedRecord.title }
	* 				onChange={ setTitle }
	* 			/>
	* 			<button type="submit">{ __( 'Save' ) }</button>
	* 		</form>
	* 	);
	* }
	*
	* // Rendered in the application:
	* // <PageRenameForm id={ 1 } />
	* ```
	*
	* In the above example, updating and saving the page title is handled
	* via the `edit()` and `save()` mutation helpers provided by
	* `useEntityRecord()`;
	*
	* @return Entity record data.
	* @template RecordType
	*/
	function useEntityRecord(kind, name, recordId, options = { enabled: true }) {
		const { editEntityRecord, saveEditedEntityRecord } = (0, _wordpress_data.useDispatch)(store);
		const mutations = (0, _wordpress_element.useMemo)(() => ({
			edit: (record, editOptions = {}) => editEntityRecord(kind, name, recordId, record, editOptions),
			save: (saveOptions = {}) => saveEditedEntityRecord(kind, name, recordId, {
				throwOnError: true,
				...saveOptions
			})
		}), [
			editEntityRecord,
			kind,
			name,
			recordId,
			saveEditedEntityRecord
		]);
		const { record, editedRecord, hasEdits, edits, ...resolution } = (0, _wordpress_data.useSelect)((select) => {
			if (!options.enabled) return {
				record: null,
				editedRecord: EMPTY_OBJECT$1,
				hasEdits: false,
				edits: EMPTY_OBJECT$1,
				...getResolutionStatus()
			};
			const storeSelectors = select(store);
			const resolutionStatus = storeSelectors.getResolutionState("getEntityRecord", [
				kind,
				name,
				recordId
			])?.status;
			return {
				record: storeSelectors.getEntityRecord(kind, name, recordId) ?? null,
				editedRecord: storeSelectors.getEditedEntityRecord(kind, name, recordId),
				hasEdits: storeSelectors.hasEditsForEntityRecord(kind, name, recordId),
				edits: storeSelectors.getEntityRecordNonTransientEdits(kind, name, recordId),
				...getResolutionStatus(resolutionStatus)
			};
		}, [
			kind,
			name,
			recordId,
			options.enabled
		]);
		return {
			record,
			editedRecord,
			hasEdits,
			edits,
			...resolution,
			...mutations
		};
	}
	function useDeprecatedEntityRecord(kind, name, recordId, options) {
		(0, _wordpress_deprecated.default)(`wp.data.__experimentalUseEntityRecord`, {
			alternative: "wp.data.useEntityRecord",
			since: "6.1"
		});
		return useEntityRecord(kind, name, recordId, options);
	}

// packages/core-data/build-module/hooks/use-entity-records.mjs
	const EMPTY_ARRAY$2 = [];
	/**
	* Resolves the specified entity records.
	*
	* @since 6.1.0 Introduced in WordPress core.
	*
	* @param    kind      Kind of the entity, e.g. `root` or a `postType`. See rootEntitiesConfig in ../entities.ts for a list of available kinds.
	* @param    name      Name of the entity, e.g. `plugin` or a `post`. See rootEntitiesConfig in ../entities.ts for a list of available names.
	* @param    queryArgs Optional HTTP query description for how to fetch the data, passed to the requested API endpoint.
	* @param    options   Optional hook options.
	* @example
	* ```js
	* import { useEntityRecords } from '@wordpress/core-data';
	*
	* function PageTitlesList() {
	*   const { records, isResolving } = useEntityRecords( 'postType', 'page' );
	*
	*   if ( isResolving ) {
	*     return 'Loading...';
	*   }
	*
	*   return (
	*     <ul>
	*       {records.map(( page ) => (
	*         <li>{ page.title }</li>
	*       ))}
	*     </ul>
	*   );
	* }
	*
	* // Rendered in the application:
	* // <PageTitlesList />
	* ```
	*
	* In the above example, when `PageTitlesList` is rendered into an
	* application, the list of records and the resolution details will be retrieved from
	* the store state using `getEntityRecords()`, or resolved if missing.
	*
	* @return Entity records data.
	* @template RecordType
	*/
	function useEntityRecords(kind, name, queryArgs = {}, options = { enabled: true }) {
		const queryAsString = (0, _wordpress_url.addQueryArgs)("", queryArgs);
		const { records, totalItems, totalPages, ...rest } = (0, _wordpress_data.useSelect)((select) => {
			if (!options.enabled) return {
				records: EMPTY_ARRAY$2,
				totalItems: null,
				totalPages: null,
				...getResolutionStatus()
			};
			const storeSelectors = select(store);
			const resolutionStatus = storeSelectors.getResolutionState("getEntityRecords", [
				kind,
				name,
				queryArgs
			])?.status;
			return {
				records: storeSelectors.getEntityRecords(kind, name, queryArgs),
				totalItems: storeSelectors.getEntityRecordsTotalItems(kind, name, queryArgs),
				totalPages: storeSelectors.getEntityRecordsTotalPages(kind, name, queryArgs),
				...getResolutionStatus(resolutionStatus)
			};
		}, [
			kind,
			name,
			queryAsString,
			options.enabled
		]);
		return {
			records,
			totalItems,
			totalPages,
			...rest
		};
	}
	function useDeprecatedEntityRecords(kind, name, queryArgs, options) {
		(0, _wordpress_deprecated.default)(`wp.data.__experimentalUseEntityRecords`, {
			alternative: "wp.data.useEntityRecords",
			since: "6.1"
		});
		return useEntityRecords(kind, name, queryArgs, options);
	}
	function useEntityRecordsWithPermissions(kind, name, queryArgs = {}, options = { enabled: true }) {
		const entityConfig = (0, _wordpress_data.useSelect)((select) => select(store).getEntityConfig(kind, name), [kind, name]);
		const { records: data, ...ret } = useEntityRecords(kind, name, {
			...queryArgs,
			...queryArgs._fields ? { _fields: [.../* @__PURE__ */ new Set([...getNormalizedCommaSeparable(queryArgs._fields) || [], "_links"])].join() } : {}
		}, options);
		const ids = (0, _wordpress_element.useMemo)(() => data?.map((record) => record[entityConfig?.key ?? "id"]) ?? [], [data, entityConfig?.key]);
		const permissions = (0, _wordpress_data.useSelect)((select) => {
			const { getEntityRecordsPermissions } = unlock(select(store));
			return getEntityRecordsPermissions(kind, name, ids);
		}, [
			ids,
			kind,
			name
		]);
		return {
			records: (0, _wordpress_element.useMemo)(() => data?.map((record, index) => ({
				...record,
				permissions: permissions[index]
			})) ?? [], [data, permissions]),
			...ret
		};
	}

// node_modules/.store/memize@2.1.1-roXbtpG2bis3Lggp7SQpAA/node_modules/memize/dist/index.js
/**
	* Memize options object.
	*
	* @typedef MemizeOptions
	*
	* @property {number} [maxSize] Maximum size of the cache.
	*/
	/**
	* Internal cache entry.
	*
	* @typedef MemizeCacheNode
	*
	* @property {?MemizeCacheNode|undefined} [prev] Previous node.
	* @property {?MemizeCacheNode|undefined} [next] Next node.
	* @property {Array<*>}                   args   Function arguments for cache
	*                                               entry.
	* @property {*}                          val    Function result.
	*/
	/**
	* Properties of the enhanced function for controlling cache.
	*
	* @typedef MemizeMemoizedFunction
	*
	* @property {()=>void} clear Clear the cache.
	*/
	/**
	* Accepts a function to be memoized, and returns a new memoized function, with
	* optional options.
	*
	* @template {(...args: any[]) => any} F
	*
	* @param {F}             fn        Function to memoize.
	* @param {MemizeOptions} [options] Options object.
	*
	* @return {((...args: Parameters<F>) => ReturnType<F>) & MemizeMemoizedFunction} Memoized function.
	*/
	function memize(fn, options) {
		var size = 0;
		/** @type {?MemizeCacheNode|undefined} */
		var head;
		/** @type {?MemizeCacheNode|undefined} */
		var tail;
		options = options || {};
		function memoized() {
			var node = head, len = arguments.length, args, i;
			searchCache: while (node) {
				if (node.args.length !== arguments.length) {
					node = node.next;
					continue;
				}
				for (i = 0; i < len; i++) if (node.args[i] !== arguments[i]) {
					node = node.next;
					continue searchCache;
				}
				if (node !== head) {
					if (node === tail) tail = node.prev;
					/** @type {MemizeCacheNode} */ node.prev.next = node.next;
					if (node.next) node.next.prev = node.prev;
					node.next = head;
					node.prev = null;
					/** @type {MemizeCacheNode} */ head.prev = node;
					head = node;
				}
				return node.val;
			}
			args = new Array(len);
			for (i = 0; i < len; i++) args[i] = arguments[i];
			node = {
				args,
				val: fn.apply(null, args)
			};
			if (head) {
				head.prev = node;
				node.next = head;
			} else tail = node;
			if (size === options.maxSize) {
				tail = tail.prev;
				/** @type {MemizeCacheNode} */ tail.next = null;
			} else size++;
			head = node;
			return node.val;
		}
		memoized.clear = function() {
			head = null;
			tail = null;
			size = 0;
		};
		return memoized;
	}

// packages/core-data/build-module/hooks/use-query-select.mjs
	const META_SELECTORS = [
		"getIsResolving",
		"hasStartedResolution",
		"hasFinishedResolution",
		"isResolving",
		"getCachedResolvers"
	];
	/**
	* Like useSelect, but the selectors return objects containing
	* both the original data AND the resolution info.
	*
	* @since 6.1.0 Introduced in WordPress core.
	* @private
	*
	* @param {Function} mapQuerySelect see useSelect
	* @param {Array}    deps           see useSelect
	*
	* @example
	* ```js
	* import { useQuerySelect } from '@wordpress/data';
	* import { store as coreDataStore } from '@wordpress/core-data';
	*
	* function PageTitleDisplay( { id } ) {
	*   const { data: page, isResolving } = useQuerySelect( ( query ) => {
	*     return query( coreDataStore ).getEntityRecord( 'postType', 'page', id )
	*   }, [ id ] );
	*
	*   if ( isResolving ) {
	*     return 'Loading...';
	*   }
	*
	*   return page.title;
	* }
	*
	* // Rendered in the application:
	* // <PageTitleDisplay id={ 10 } />
	* ```
	*
	* In the above example, when `PageTitleDisplay` is rendered into an
	* application, the page and the resolution details will be retrieved from
	* the store state using the `mapSelect` callback on `useQuerySelect`.
	*
	* If the id prop changes then any page in the state for that id is
	* retrieved. If the id prop doesn't change and other props are passed in
	* that do change, the title will not change because the dependency is just
	* the id.
	* @see useSelect
	*
	* @return {QuerySelectResponse} Queried data.
	*/
	function useQuerySelect(mapQuerySelect, deps) {
		return (0, _wordpress_data.useSelect)((select, registry) => {
			const resolve = (store) => enrichSelectors(select(store));
			return mapQuerySelect(resolve, registry);
		}, deps);
	}
	/**
	* Transform simple selectors into ones that return an object with the
	* original return value AND the resolution info.
	*
	* @param {Object} selectors Selectors to enrich
	* @return {EnrichedSelectors} Enriched selectors
	*/
	const enrichSelectors = memize(((selectors) => {
		const resolvers = {};
		for (const selectorName in selectors) {
			if (META_SELECTORS.includes(selectorName)) continue;
			Object.defineProperty(resolvers, selectorName, { get: () => (...args) => {
				const data = selectors[selectorName](...args);
				const resolutionStatus = selectors.getResolutionState(selectorName, args)?.status;
				return {
					data,
					...getResolutionStatus(resolutionStatus)
				};
			} });
		}
		return resolvers;
	}));

// packages/core-data/build-module/hooks/use-resource-permissions.mjs
/**
	* Resolves resource permissions.
	*
	* @since 6.1.0 Introduced in WordPress core.
	*
	* @param    resource Entity resource to check. Accepts entity object `{ kind: 'postType', name: 'attachment', id: 1 }`
	*                    or REST base as a string - `media`.
	* @param    id       Optional ID of the resource to check, e.g. 10. Note: This argument is discouraged
	*                    when using an entity object as a resource to check permissions and will be ignored.
	*
	* @example
	* ```js
	* import { useResourcePermissions } from '@wordpress/core-data';
	*
	* function PagesList() {
	*   const { canCreate, isResolving } = useResourcePermissions( { kind: 'postType', name: 'page' } );
	*
	*   if ( isResolving ) {
	*     return 'Loading ...';
	*   }
	*
	*   return (
	*     <div>
	*       {canCreate ? (<button>+ Create a new page</button>) : false}
	*       // ...
	*     </div>
	*   );
	* }
	*
	* // Rendered in the application:
	* // <PagesList />
	* ```
	*
	* @example
	* ```js
	* import { useResourcePermissions } from '@wordpress/core-data';
	*
	* function Page({ pageId }) {
	*   const {
	*     canCreate,
	*     canUpdate,
	*     canDelete,
	*     isResolving
	*   } = useResourcePermissions( { kind: 'postType', name: 'page', id: pageId } );
	*
	*   if ( isResolving ) {
	*     return 'Loading ...';
	*   }
	*
	*   return (
	*     <div>
	*       {canCreate ? (<button>+ Create a new page</button>) : false}
	*       {canUpdate ? (<button>Edit page</button>) : false}
	*       {canDelete ? (<button>Delete page</button>) : false}
	*       // ...
	*     </div>
	*   );
	* }
	*
	* // Rendered in the application:
	* // <Page pageId={ 15 } />
	* ```
	*
	* In the above example, when `PagesList` is rendered into an
	* application, the appropriate permissions and the resolution details will be retrieved from
	* the store state using `canUser()`, or resolved if missing.
	*
	* @return Resource permissions and resolution details.
	* @template IdType
	*/
	function useResourcePermissions(resource, id) {
		const isEntity = typeof resource === "object";
		const resourceAsString = isEntity ? JSON.stringify(resource) : resource;
		if (isEntity && typeof id !== "undefined") (0, _wordpress_warning.default)(`When 'resource' is an entity object, passing 'id' as a separate argument isn't supported.`);
		return useQuerySelect((resolve) => {
			const hasId = isEntity ? !!resource.id : !!id;
			const { canUser } = resolve(store);
			const collectionResource = isEntity ? {
				kind: resource.kind,
				name: resource.name
			} : resource;
			const create = canUser("create", collectionResource);
			if (!hasId) {
				const read = canUser("read", collectionResource);
				const isResolving = create.isResolving || read.isResolving;
				const hasResolved = create.hasResolved && read.hasResolved;
				let status = Status.Idle;
				if (isResolving) status = Status.Resolving;
				else if (hasResolved) status = Status.Success;
				return {
					status,
					isResolving,
					hasResolved,
					canCreate: create.hasResolved && create.data,
					canRead: read.hasResolved && read.data
				};
			}
			const read = canUser("read", resource, id);
			const update = canUser("update", resource, id);
			const _delete = canUser("delete", resource, id);
			const isResolving = read.isResolving || create.isResolving || update.isResolving || _delete.isResolving;
			const hasResolved = read.hasResolved && create.hasResolved && update.hasResolved && _delete.hasResolved;
			let status = Status.Idle;
			if (isResolving) status = Status.Resolving;
			else if (hasResolved) status = Status.Success;
			return {
				status,
				isResolving,
				hasResolved,
				canRead: hasResolved && read.data,
				canCreate: hasResolved && create.data,
				canUpdate: hasResolved && update.data,
				canDelete: hasResolved && _delete.data
			};
		}, [resourceAsString, id]);
	}
	function useDeprecatedResourcePermissions(resource, id) {
		(0, _wordpress_deprecated.default)(`wp.data.__experimentalUseResourcePermissions`, {
			alternative: "wp.data.useResourcePermissions",
			since: "6.1"
		});
		return useResourcePermissions(resource, id);
	}

// packages/core-data/build-module/hooks/use-entity-id.mjs
/**
	* Hook that returns the ID for the nearest
	* provided entity of the specified type.
	*
	* @param kind The entity kind.
	* @param name The entity name.
	*/
	function useEntityId(kind, name) {
		return (0, _wordpress_element.useContext)(EntityContext)?.[kind]?.[name];
	}

// packages/core-data/build-module/footnotes/get-rich-text-values-cached.mjs
	let unlockedApis;
	const cache$1 = /* @__PURE__ */ new WeakMap();
	function getRichTextValuesCached(block) {
		if (!unlockedApis) unlockedApis = unlock(_wordpress_block_editor.privateApis);
		if (!cache$1.has(block)) {
			const values = unlockedApis.getRichTextValues([block]);
			cache$1.set(block, values);
		}
		return cache$1.get(block);
	}

// packages/core-data/build-module/footnotes/get-footnotes-order.mjs
	const cache = /* @__PURE__ */ new WeakMap();
	function getBlockFootnotesOrder(block) {
		if (!cache.has(block)) {
			const order = [];
			for (const value of getRichTextValuesCached(block)) {
				if (!value) continue;
				value.replacements.forEach(({ type, attributes }) => {
					if (type === "core/footnote") order.push(attributes["data-fn"]);
				});
			}
			cache.set(block, order);
		}
		return cache.get(block);
	}
	function getFootnotesOrder(blocks) {
		return blocks.flatMap(getBlockFootnotesOrder);
	}

// packages/core-data/build-module/footnotes/index.mjs
	let oldFootnotes = {};
	function updateFootnotesFromMeta(blocks, meta) {
		const output = { blocks };
		if (!meta) return output;
		if (meta.footnotes === void 0) return output;
		const newOrder = getFootnotesOrder(blocks);
		let parsed;
		try {
			parsed = JSON.parse(meta.footnotes || "[]");
		} catch {}
		let footnotes = [];
		if (Array.isArray(parsed)) footnotes = parsed;
		else (0, _wordpress_warning.default)("Footnotes post meta is not a JSON array; ignoring it.");
		if (footnotes.map((fn) => fn.id).join("") === newOrder.join("")) return output;
		const newFootnotes = newOrder.map((fnId) => footnotes.find((fn) => fn.id === fnId) || oldFootnotes[fnId] || {
			id: fnId,
			content: ""
		});
		function updateAttributes(attributes) {
			if (!attributes || Array.isArray(attributes) || typeof attributes !== "object") return attributes;
			attributes = { ...attributes };
			for (const key in attributes) {
				const value = attributes[key];
				if (Array.isArray(value)) {
					attributes[key] = value.map(updateAttributes);
					continue;
				}
				if (typeof value !== "string" && !(value instanceof _wordpress_rich_text.RichTextData)) continue;
				const richTextValue = typeof value === "string" ? _wordpress_rich_text.RichTextData.fromHTMLString(value) : new _wordpress_rich_text.RichTextData(value);
				let hasFootnotes = false;
				richTextValue.replacements.forEach((replacement) => {
					if (replacement.type === "core/footnote") {
						const id = replacement.attributes["data-fn"];
						const index = newOrder.indexOf(id);
						const countValue = (0, _wordpress_rich_text.create)({ html: replacement.innerHTML });
						countValue.text = String(index + 1);
						countValue.formats = Array.from({ length: countValue.text.length }, () => countValue.formats[0]);
						countValue.replacements = Array.from({ length: countValue.text.length }, () => countValue.replacements[0]);
						replacement.innerHTML = (0, _wordpress_rich_text.toHTMLString)({ value: countValue });
						hasFootnotes = true;
					}
				});
				if (hasFootnotes) attributes[key] = typeof value === "string" ? richTextValue.toHTMLString() : richTextValue;
			}
			return attributes;
		}
		function updateBlocksAttributes(__blocks) {
			return __blocks.map((block) => {
				return {
					...block,
					attributes: updateAttributes(block.attributes),
					innerBlocks: updateBlocksAttributes(block.innerBlocks)
				};
			});
		}
		const newBlocks = updateBlocksAttributes(blocks);
		oldFootnotes = {
			...oldFootnotes,
			...footnotes.reduce((acc, fn) => {
				if (!newOrder.includes(fn.id)) acc[fn.id] = fn;
				return acc;
			}, {})
		};
		return {
			meta: {
				...meta,
				footnotes: JSON.stringify(newFootnotes)
			},
			blocks: newBlocks
		};
	}

// packages/core-data/build-module/hooks/use-entity-block-editor.mjs
	const EMPTY_ARRAY$1 = [];
	/**
	* Hook that returns block content getters and setters for
	* the nearest provided entity of the specified type.
	*
	* The return value has the shape `[ blocks, onInput, onChange ]`.
	* `onInput` is for block changes that don't create undo levels
	* or dirty the post, non-persistent changes, and `onChange` is for
	* persistent changes. They map directly to the props of a
	* `BlockEditorProvider` and are intended to be used with it,
	* or similar components or hooks.
	*
	* @param kind       The entity kind.
	* @param name       The entity name.
	* @param options
	* @param options.id An entity ID to use instead of the context-provided one.
	*
	* @return The block array and setters.
	*/
	function useEntityBlockEditor(kind, name, { id: _id } = {}) {
		const providerId = useEntityId(kind, name);
		const id = _id ?? providerId;
		const { content, editedBlocks, meta } = (0, _wordpress_data.useSelect)((select) => {
			if (!id) return {};
			const { getEditedEntityRecord } = select(STORE_NAME);
			const editedRecord = getEditedEntityRecord(kind, name, id);
			return {
				editedBlocks: editedRecord.blocks,
				content: editedRecord.content,
				meta: editedRecord.meta
			};
		}, [
			kind,
			name,
			id
		]);
		const { __unstableCreateUndoLevel, editEntityRecord } = (0, _wordpress_data.useDispatch)(STORE_NAME);
		const blocks = (0, _wordpress_element.useMemo)(() => {
			if (!id) return;
			if (editedBlocks) return editedBlocks;
			if (!content || typeof content !== "string") return EMPTY_ARRAY$1;
			let _blocks = getCachedBlocks(kind, name, id, content);
			if (!_blocks) {
				_blocks = (0, _wordpress_blocks.parse)(content);
				setCachedBlocks(kind, name, id, content, _blocks);
			}
			return _blocks;
		}, [
			kind,
			name,
			id,
			editedBlocks,
			content
		]);
		const onChange = (0, _wordpress_element.useCallback)((newBlocks, options) => {
			if (blocks === newBlocks) return __unstableCreateUndoLevel(kind, name, id);
			const { selection, ...rest } = options;
			const edits = {
				selection,
				content: ({ blocks: blocksForSerialization = [] }) => (0, _wordpress_blocks.__unstableSerializeAndClean)(blocksForSerialization),
				...updateFootnotesFromMeta(newBlocks, meta)
			};
			editEntityRecord(kind, name, id, edits, {
				isCached: false,
				...rest
			});
		}, [
			kind,
			name,
			id,
			blocks,
			meta,
			__unstableCreateUndoLevel,
			editEntityRecord
		]);
		return [
			blocks,
			(0, _wordpress_element.useCallback)((newBlocks, options) => {
				const { selection, ...rest } = options;
				const edits = {
					selection,
					...updateFootnotesFromMeta(newBlocks, meta)
				};
				editEntityRecord(kind, name, id, edits, {
					isCached: true,
					...rest
				});
			}, [
				kind,
				name,
				id,
				meta,
				editEntityRecord
			]),
			onChange
		];
	}

// packages/core-data/build-module/hooks/use-entity-prop.mjs
	const REVISION_QUERY = {
		context: "edit",
		_fields: "id,date,author,meta,title,excerpt,content.raw"
	};
	/**
	* Hook that returns the value and a setter for the
	* specified property of the nearest provided
	* entity of the specified type.
	*
	* @param kind The entity kind.
	* @param name The entity name.
	* @param prop The property name.
	* @param _id  An entity ID to use instead of the context-provided one.
	*
	* @return An array where the first item is the
	*         property value, the second is the
	*         setter and the third is the full value
	*         object from REST API containing more
	*         information like `raw`, `rendered` and
	*         `protected` props.
	*/
	function useEntityProp(kind, name, prop, _id) {
		const providerId = useEntityId(kind, name);
		const id = _id ?? providerId;
		const context = (0, _wordpress_element.useContext)(EntityContext);
		const providedRevision = String(id) === String(providerId) ? context?.revision?.[kind]?.[name] : void 0;
		const revisionRecord = typeof providedRevision === "object" ? providedRevision : void 0;
		const revisionId = revisionRecord ? void 0 : providedRevision;
		const isRevision = !!(revisionRecord || revisionId);
		const { value, fullValue } = (0, _wordpress_data.useSelect)((select) => {
			if (revisionRecord ? prop in revisionRecord : revisionId) {
				const propValue = (revisionRecord ?? select("core").getRevision(kind, name, id, revisionId, REVISION_QUERY))?.[prop];
				if (propValue === void 0) return {};
				return {
					value: propValue !== null && typeof propValue === "object" && "raw" in propValue ? propValue.raw : propValue,
					fullValue: propValue
				};
			}
			const { getEntityRecord, getEditedEntityRecord } = select(STORE_NAME);
			const record = getEntityRecord(kind, name, id);
			const editedRecord = getEditedEntityRecord(kind, name, id);
			return record && editedRecord ? {
				value: editedRecord[prop],
				fullValue: record[prop]
			} : {};
		}, [
			kind,
			name,
			id,
			prop,
			revisionId,
			revisionRecord
		]);
		const { editEntityRecord } = (0, _wordpress_data.useDispatch)(STORE_NAME);
		return [
			value,
			(0, _wordpress_element.useCallback)((newValue) => {
				if (isRevision) return;
				editEntityRecord(kind, name, id, { [prop]: newValue });
			}, [
				editEntityRecord,
				kind,
				name,
				id,
				prop,
				isRevision
			]),
			fullValue
		];
	}

// packages/core-data/build-module/hooks/use-post-editor-awareness-state.mjs
	const defaultResolvedSelection = {
		richTextOffset: null,
		localClientId: null,
		attributeKey: null
	};
	const defaultState = {
		activeCollaborators: [],
		resolveSelection: () => defaultResolvedSelection,
		getDebugData: () => ({
			doc: {},
			clients: {},
			collaboratorMap: {}
		}),
		isCurrentCollaboratorDisconnected: false
	};
	function getAwarenessState(awareness, newState) {
		const activeCollaborators = (newState ?? awareness.getCurrentState()).filter((collaborator) => isCollaboratorInfo(collaborator.collaboratorInfo));
		return {
			activeCollaborators,
			resolveSelection: (selection, blocks) => awareness.convertSelectionStateToAbsolute(selection, blocks),
			getDebugData: () => awareness.getDebugData(),
			isCurrentCollaboratorDisconnected: activeCollaborators.find((collaborator) => collaborator.isMe)?.isConnected === false
		};
	}
	function usePostEditorAwarenessState(postId, postType) {
		const [state, setState] = (0, _wordpress_element.useState)(defaultState);
		(0, _wordpress_element.useEffect)(() => {
			if (null === postId || null === postType) {
				setState(defaultState);
				return;
			}
			const objectType = `postType/${postType}`;
			const objectId = postId.toString();
			const awareness = getSyncManager()?.getAwareness(objectType, objectId);
			if (!awareness) {
				setState(defaultState);
				return;
			}
			awareness.setUp();
			setState(getAwarenessState(awareness));
			return awareness?.onStateChange((newState) => {
				setState(getAwarenessState(awareness, newState));
			});
		}, [postId, postType]);
		return state;
	}
	/**
	* Hook to get the active collaborators for a post editor.
	*
	* @param  postId   - The ID of the post.
	* @param  postType - The type of the post.
	* @return {ActiveCollaborator[]} The active collaborators.
	*/
	function useActiveCollaborators(postId, postType) {
		return usePostEditorAwarenessState(postId, postType).activeCollaborators;
	}
	/**
	* Hook to resolve a selection state to a text index and block client ID.
	*
	* @param postId   - The ID of the post.
	* @param postType - The type of the post.
	* @return A function that resolves a selection to its text index and block client ID.
	*/
	function useResolvedSelection(postId, postType) {
		const blocks = usePostContentBlocks();
		const awarenessState = usePostEditorAwarenessState(postId, postType);
		return (0, _wordpress_element.useCallback)((selection) => awarenessState.resolveSelection(selection, blocks), [blocks, awarenessState]);
	}
	/**
	* Hook that subscribes to the CRDT state map and returns the most recent
	* user-facing post save event (timestamp + client ID). The state map is
	* updated by `markEntityAsSaved` in `@wordpress/sync`.
	*
	* @param postId   The ID of the post.
	* @param postType The type of the post.
	*/
	function useLastPostSave(postId, postType) {
		const [lastSave, setLastSave] = (0, _wordpress_element.useState)(null);
		(0, _wordpress_element.useEffect)(() => {
			if (null === postId || null === postType) {
				setLastSave(null);
				return;
			}
			const awareness = getSyncManager()?.getAwareness(`postType/${postType}`, postId.toString());
			if (!awareness) {
				setLastSave(null);
				return;
			}
			awareness.setUp();
			const stateMap = awareness.doc.getMap("state");
			const recordMap = awareness.doc.getMap("document");
			const setupTime = Date.now();
			const observer = (event) => {
				if (event.keysChanged.has("savedAt")) {
					const savedAt = stateMap.get("savedAt");
					const savedByClientId = stateMap.get("savedBy");
					if (typeof savedAt === "number" && typeof savedByClientId === "number" && savedAt > setupTime) {
						const postStatus = recordMap.get("status");
						setLastSave({
							savedAt,
							savedByClientId,
							postStatus
						});
					}
				}
			};
			stateMap.observe(observer);
			return () => {
				stateMap.unobserve(observer);
			};
		}, [postId, postType]);
		return lastSave;
	}
	/**
	* Hook that fires a callback when a new collaborator joins the post.
	* Handles initial hydration and state diffing internally—consumers
	* only receive "join" events for collaborators that appear after the
	* initial state has loaded.
	*
	* The callback receives the joining collaborator and, when available,
	* the current user's state (useful for comparing `enteredAt` timestamps).
	*
	* @param postId   The ID of the post.
	* @param postType The type of the post.
	* @param callback Invoked for each collaborator that joins.
	*/
	function useOnCollaboratorJoin(postId, postType, callback) {
		const { activeCollaborators } = usePostEditorAwarenessState(postId, postType);
		const prevCollaborators = (0, _wordpress_compose.usePrevious)(activeCollaborators);
		(0, _wordpress_element.useEffect)(() => {
			if (!prevCollaborators || prevCollaborators.length === 0) return;
			const prevMap = new Map(prevCollaborators.map((collaborator) => [collaborator.clientId, collaborator]));
			const me = activeCollaborators.find((collaborator) => collaborator.isMe);
			for (const collaborator of activeCollaborators) if (!prevMap.has(collaborator.clientId) && !collaborator.isMe) callback(collaborator, me);
		}, [
			activeCollaborators,
			prevCollaborators,
			callback
		]);
	}
	/**
	* Hook that fires a callback when a collaborator leaves the post.
	* A "leave" is detected when a previously-connected collaborator either
	* transitions to `isConnected = false` or disappears from the list
	* entirely while still connected. Already-disconnected collaborators
	* that are later removed from the list are silently ignored.
	*
	* @param postId   The ID of the post.
	* @param postType The type of the post.
	* @param callback Invoked for each collaborator that leaves.
	*/
	function useOnCollaboratorLeave(postId, postType, callback) {
		const { activeCollaborators } = usePostEditorAwarenessState(postId, postType);
		const prevCollaborators = (0, _wordpress_compose.usePrevious)(activeCollaborators);
		(0, _wordpress_element.useEffect)(() => {
			if (!prevCollaborators || prevCollaborators.length === 0) return;
			const newMap = new Map(activeCollaborators.map((collaborator) => [collaborator.clientId, collaborator]));
			for (const prevCollab of prevCollaborators) {
				if (prevCollab.isMe || !prevCollab.isConnected) continue;
				if (!newMap.get(prevCollab.clientId)?.isConnected) callback(prevCollab);
			}
		}, [
			activeCollaborators,
			prevCollaborators,
			callback
		]);
	}
	/**
	* Hook that fires a callback when a remote collaborator saves the post.
	* Only fires for saves by other collaborators (not the current user).
	* Deduplicates by `savedAt` timestamp so the same save event is never
	* reported twice.
	*
	* @param postId   The ID of the post.
	* @param postType The type of the post.
	* @param callback Invoked with the save event, the collaborator who saved,
	*                 and the previous save event (if any) for transition detection.
	*/
	function useOnPostSave(postId, postType, callback) {
		const { activeCollaborators } = usePostEditorAwarenessState(postId, postType);
		const lastPostSave = useLastPostSave(postId, postType);
		const prevPostSave = (0, _wordpress_compose.usePrevious)(lastPostSave);
		(0, _wordpress_element.useEffect)(() => {
			if (!lastPostSave) return;
			if (prevPostSave && lastPostSave.savedAt === prevPostSave.savedAt) return;
			const saver = activeCollaborators.find((collaborator) => collaborator.clientId === lastPostSave.savedByClientId && !collaborator.isMe);
			if (!saver) return;
			callback(lastPostSave, saver, prevPostSave ?? null);
		}, [
			lastPostSave,
			prevPostSave,
			activeCollaborators,
			callback
		]);
	}

// packages/icons/build-module/library/footer.mjs
	var footer_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.75 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V14.25M9.75 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V14.25M9.75 4.75V14.25M19.25 14.25V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V14.25M19.25 14.25H9.75M9.75 14.25H4.75" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M19.25 15.5V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V15.5C4.75 14.8096 5.30964 14.25 6 14.25H18C18.6904 14.25 19.25 14.8096 19.25 15.5Z",
			fill: "currentColor"
		})]
	});

// packages/icons/build-module/library/header.mjs
	var header_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.75 19.25H18C18.6904 19.25 19.25 18.6904 19.25 18V9.75M9.75 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V9.75M9.75 19.25V9.75M19.25 9.75V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V9.75M19.25 9.75H9.75M9.75 9.75H4.75" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M19.25 8.5V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V8.5C4.75 9.19036 5.30964 9.75 6 9.75H18C18.6904 9.75 19.25 9.19036 19.25 8.5Z",
			fill: "currentColor"
		})]
	});

// packages/icons/build-module/library/layout.mjs
	var layout_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.75 19.25H18C18.6904 19.25 19.25 18.6904 19.25 18V9.75M9.75 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V9.75M9.75 19.25V9.75M19.25 9.75V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V9.75M19.25 9.75H9.75M9.75 9.75H4.75" })
	});

// packages/icons/build-module/library/navigation-overlay.mjs
	var navigation_overlay_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M4.75 9.25V16C4.75 16.6904 5.30964 17.25 6 17.25H8M4.75 9.25V6C4.75 5.30964 5.30964 4.75 6 4.75H16C16.6904 4.75 17.25 5.30964 17.25 6V8M4.75 9.25H8" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M10.75 11.25C10.75 10.9739 10.9739 10.75 11.25 10.75H18.75C19.0261 10.75 19.25 10.9739 19.25 11.25V18.75C19.25 19.0261 19.0261 19.25 18.75 19.25H11.25C10.9739 19.25 10.75 19.0261 10.75 18.75V11.25Z",
			fill: "currentColor"
		})]
	});

// packages/icons/build-module/library/sidebar.mjs
	var sidebar_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.75 19.25H18C18.6904 19.25 19.25 18.6904 19.25 18V9.75M9.75 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V9.75M9.75 19.25V9.75M19.25 9.75V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V9.75M19.25 9.75H9.75M9.75 9.75H4.75" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M6 19.25H9.75V9.75H4.75V18C4.75 18.6904 5.30964 19.25 6 19.25Z",
			fill: "currentColor"
		})]
	});

// packages/icons/build-module/library/symbol-filled.mjs
	var symbol_filled_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M15.2071 6.20711L20.2929 11.2929C20.6834 11.6834 20.6834 12.3166 20.2929 12.7071L15.2071 17.7929C14.8166 18.1834 14.1834 18.1834 13.7929 17.7929L8.70711 12.7071C8.31658 12.3166 8.31658 11.6834 8.70711 11.2929L13.7929 6.20711C14.1834 5.81658 14.8166 5.81658 15.2071 6.20711Z",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.5 5.5L3.70711 11.2929C3.31658 11.6834 3.31658 12.3166 3.70711 12.7071L9.5 18.5" })]
	});

// packages/core-data/build-module/utils/get-template-part-icon.mjs
/**
	* Helper function to retrieve the corresponding icon by area name.
	*
	* @param areaOrIconName The area name (e.g., 'header', 'navigation-overlay').
	*
	* @return The corresponding icon.
	*/
	function getTemplatePartIcon(areaOrIconName) {
		if ("header" === areaOrIconName) return header_default;
		else if ("footer" === areaOrIconName) return footer_default;
		else if ("sidebar" === areaOrIconName) return sidebar_default;
		else if ("navigation-overlay" === areaOrIconName) return navigation_overlay_default;
		return symbol_filled_default;
	}

// packages/core-data/build-module/utils/get-template-info.mjs
	const EMPTY_OBJECT = {};
	/**
	* Helper function to retrieve the corresponding template info for a given template.
	* @param params
	* @param params.templateTypes
	* @param params.templateAreas
	* @param params.template
	*/
	const getTemplateInfo = (params) => {
		if (!params) return EMPTY_OBJECT;
		const { templateTypes, templateAreas, template } = params;
		const { description, slug, title, area } = template;
		const { title: defaultTitle, description: defaultDescription } = Object.values(templateTypes).find((type) => type.slug === slug) ?? EMPTY_OBJECT;
		const templateTitle = typeof title === "string" ? title : title?.rendered;
		const templateDescription = typeof description === "string" ? description : description?.raw;
		const templateIcon = (templateAreas?.map((item) => ({
			...item,
			icon: getTemplatePartIcon(item.icon)
		})))?.find((item) => area === item.area)?.icon || layout_default;
		return {
			title: templateTitle && templateTitle !== slug ? templateTitle : defaultTitle || slug,
			description: templateDescription || defaultDescription,
			icon: templateIcon
		};
	};

// node_modules/.store/clsx@2.1.1-XOLP1vUL9vEGfpiXm37fAw/node_modules/clsx/dist/clsx.mjs
	function r(e) {
		var t, f, n = "";
		if ("string" == typeof e || "number" == typeof e) n += e;
		else if ("object" == typeof e) if (Array.isArray(e)) {
			var o = e.length;
			for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
		} else for (f in e) e[f] && (n && (n += " "), n += f);
		return n;
	}
	function clsx() {
		for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
		return n;
	}

// packages/global-styles-engine/build-module/utils/get-global-styles-changes.mjs
	const globalStylesChangesCache = /* @__PURE__ */ new Map();
	const EMPTY_ARRAY = [];
	const translationMap = {
		caption: (0, _wordpress_i18n.__)("Caption"),
		link: (0, _wordpress_i18n.__)("Link"),
		button: (0, _wordpress_i18n.__)("Button"),
		heading: (0, _wordpress_i18n.__)("Heading"),
		h1: (0, _wordpress_i18n.__)("H1"),
		h2: (0, _wordpress_i18n.__)("H2"),
		h3: (0, _wordpress_i18n.__)("H3"),
		h4: (0, _wordpress_i18n.__)("H4"),
		h5: (0, _wordpress_i18n.__)("H5"),
		h6: (0, _wordpress_i18n.__)("H6"),
		"settings.color": (0, _wordpress_i18n.__)("Color"),
		"settings.typography": (0, _wordpress_i18n.__)("Typography"),
		"settings.shadow": (0, _wordpress_i18n.__)("Shadow"),
		"settings.layout": (0, _wordpress_i18n.__)("Layout"),
		"styles.color": (0, _wordpress_i18n.__)("Colors"),
		"styles.spacing": (0, _wordpress_i18n.__)("Spacing"),
		"styles.background": (0, _wordpress_i18n.__)("Background"),
		"styles.typography": (0, _wordpress_i18n.__)("Typography"),
		"styles.border": (0, _wordpress_i18n.__)("Border"),
		"styles.shadow": (0, _wordpress_i18n.__)("Shadow"),
		"styles.outline": (0, _wordpress_i18n.__)("Outline"),
		"styles.filter": (0, _wordpress_i18n.__)("Filter"),
		"styles.dimensions": (0, _wordpress_i18n.__)("Dimensions")
	};
	const getBlockNames = memize(() => (0, _wordpress_blocks.getBlockTypes)().reduce((accumulator, { name, title }) => {
		accumulator[name] = title;
		return accumulator;
	}, {}));
	const isObject = (obj) => obj !== null && typeof obj === "object";
	/**
	* Get the translation for a given global styles key.
	* @param key A key representing a path to a global style property or setting.
	* @return A translated key or undefined if no translation exists.
	*/
	function getTranslation(key) {
		if (translationMap[key]) return translationMap[key];
		const keyArray = key.split(".");
		if (keyArray?.[0] === "blocks") return getBlockNames()?.[keyArray[1]] || keyArray[1];
		if (keyArray?.[0] === "elements") return translationMap[keyArray[1]] || keyArray[1];
	}
	/**
	* A deep comparison of two objects, optimized for comparing global styles.
	* @param changedObject  The changed object to compare.
	* @param originalObject The original object to compare against.
	* @param parentPath     A key/value pair object of block names and their rendered titles.
	* @return An array of paths whose values have changed.
	*/
	function deepCompare(changedObject, originalObject, parentPath = "") {
		if (!isObject(changedObject) && !isObject(originalObject)) return changedObject !== originalObject ? parentPath.split(".").slice(0, 2).join(".") : void 0;
		changedObject = isObject(changedObject) ? changedObject : {};
		originalObject = isObject(originalObject) ? originalObject : {};
		const allKeys = /* @__PURE__ */ new Set([...Object.keys(changedObject), ...Object.keys(originalObject)]);
		let diffs = [];
		for (const key of allKeys) {
			const path = parentPath ? parentPath + "." + key : key;
			const changedPath = deepCompare(changedObject[key], originalObject[key], path);
			if (changedPath) diffs = diffs.concat(changedPath);
		}
		return diffs;
	}
	const COMPARED_STYLE_KEYS = [
		"background",
		"color",
		"typography",
		"spacing",
		"border",
		"shadow",
		"outline",
		"filter",
		"dimensions"
	];
	/**
	* Picks the style properties that are compared for changes.
	*
	* @param config A global styles config.
	* @return The subset of `config.styles` that is compared.
	*/
	function pickComparedStyles(config) {
		return Object.fromEntries(COMPARED_STYLE_KEYS.map((key) => [key, config?.styles?.[key]]));
	}
	/**
	* Returns an array of translated summarized global styles changes.
	* Results are cached using a Map() key of `JSON.stringify( { next, previous } )`.
	*
	* @param next     The changed object to compare.
	* @param previous The original object to compare against.
	* @return A 2-dimensional array of tuples: [ "group", "translated change" ].
	*/
	function getGlobalStylesChangelist(next, previous) {
		const cacheKey = JSON.stringify({
			next,
			previous
		});
		if (globalStylesChangesCache.has(cacheKey)) return globalStylesChangesCache.get(cacheKey);
		const changedValueTree = deepCompare({
			styles: pickComparedStyles(next),
			blocks: next?.styles?.blocks,
			elements: next?.styles?.elements,
			settings: next?.settings
		}, {
			styles: pickComparedStyles(previous),
			blocks: previous?.styles?.blocks,
			elements: previous?.styles?.elements,
			settings: previous?.settings
		});
		if (!changedValueTree || Array.isArray(changedValueTree) && !changedValueTree.length) {
			globalStylesChangesCache.set(cacheKey, []);
			return [];
		}
		const result = [...new Set(Array.isArray(changedValueTree) ? changedValueTree : [changedValueTree])].reduce((acc, curr) => {
			const translation = getTranslation(curr);
			if (translation) acc.push([curr.split(".")[0], translation]);
			return acc;
		}, []);
		globalStylesChangesCache.set(cacheKey, result);
		return result;
	}
	/**
	* From a getGlobalStylesChangelist() result, returns an array of translated global styles changes, grouped by type.
	* The types are 'blocks', 'elements', 'settings', and 'styles'.
	*
	* @param next     The changed object to compare.
	* @param previous The original object to compare against.
	* @param options  Options. maxResults: results to return before truncating.
	* @return An array of translated changes.
	*/
	function getGlobalStylesChanges(next, previous, options = {}) {
		let changeList = getGlobalStylesChangelist(next, previous);
		const changesLength = changeList.length;
		const { maxResults } = options;
		if (changesLength) {
			if (!!maxResults && changesLength > maxResults) changeList = changeList.slice(0, maxResults);
			return Object.entries(changeList.reduce((acc, curr) => {
				const group = acc[curr[0]] || [];
				if (!group.includes(curr[1])) acc[curr[0]] = [...group, curr[1]];
				return acc;
			}, {})).map(([key, changeValues]) => {
				const changeValuesLength = changeValues.length;
				const joinedChangesValue = changeValues.join((0, _wordpress_i18n.__)(", "));
				switch (key) {
					case "blocks": return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n._n)("%s block.", "%s blocks.", changeValuesLength), joinedChangesValue);
					case "elements": return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n._n)("%s element.", "%s elements.", changeValuesLength), joinedChangesValue);
					case "settings": return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s settings."), joinedChangesValue);
					case "styles": return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s styles."), joinedChangesValue);
					default: return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s."), joinedChangesValue);
				}
			});
		}
		return EMPTY_ARRAY;
	}

// packages/core-data/build-module/components/entities-saved-states/entity-record-item.mjs
	function EntityRecordItem({ record, checked, onChange }) {
		const { name, kind, title, key } = record;
		const { entityRecordTitle } = (0, _wordpress_data.useSelect)((select) => {
			if ("postType" !== kind || "wp_template" !== name) return { entityRecordTitle: title };
			const template = select(STORE_NAME).getEditedEntityRecord(kind, name, key);
			const { default_template_types: templateTypes = [] } = select("core").getCurrentTheme() ?? {};
			return { entityRecordTitle: getTemplateInfo({
				template,
				templateTypes
			}).title };
		}, [
			name,
			kind,
			title,
			key
		]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.PanelRow, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.CheckboxControl, {
			label: (0, _wordpress_html_entities.decodeEntities)(entityRecordTitle) || (0, _wordpress_i18n.__)("Untitled"),
			checked,
			onChange,
			className: "entities-saved-states__change-control"
		}) }) });
	}

// packages/core-data/build-module/components/entities-saved-states/entity-type-list.mjs
	function getEntityDescription(entity, count) {
		switch (entity) {
			case "site": return 1 === count ? (0, _wordpress_i18n.__)("This change will affect your whole site.") : (0, _wordpress_i18n.__)("These changes will affect your whole site.");
			case "wp_template": return (0, _wordpress_i18n.__)("This change will affect other parts of your site that use this template.");
			case "page":
			case "post": return (0, _wordpress_i18n.__)("The following has been modified.");
		}
	}
	function GlobalStylesDescription({ record }) {
		const { editedRecord, savedRecord } = (0, _wordpress_data.useSelect)((select) => {
			const { getEditedEntityRecord, getEntityRecord } = select(STORE_NAME);
			return {
				editedRecord: getEditedEntityRecord(record.kind, record.name, record.key),
				savedRecord: getEntityRecord(record.kind, record.name, record.key)
			};
		}, [
			record.kind,
			record.name,
			record.key
		]);
		const globalStylesChanges = getGlobalStylesChanges(editedRecord, savedRecord, { maxResults: 10 });
		return globalStylesChanges.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
			className: "entities-saved-states__changes",
			children: globalStylesChanges.map((change) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: change }, change))
		}) : null;
	}
	function EntityDescription({ record, count }) {
		if ("globalStyles" === record?.name) return null;
		const description = getEntityDescription(record?.name, count);
		return description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.PanelRow, { children: description }) : null;
	}
	function EntityTypeList({ list, unselectedEntities, setUnselectedEntities }) {
		const count = list.length;
		const firstRecord = list[0];
		let entityLabel = (0, _wordpress_data.useSelect)((select) => select(STORE_NAME).getEntityConfig(firstRecord.kind, firstRecord.name), [firstRecord.kind, firstRecord.name]).label;
		if (firstRecord?.name === "wp_template_part") entityLabel = 1 === count ? (0, _wordpress_i18n.__)("Template Part") : (0, _wordpress_i18n.__)("Template Parts");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.PanelBody, {
			title: entityLabel,
			initialOpen: true,
			className: "entities-saved-states__panel-body",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntityDescription, {
					record: firstRecord,
					count
				}),
				list.map((record) => {
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntityRecordItem, {
						record,
						checked: !unselectedEntities.some((elt) => elt.kind === record.kind && elt.name === record.name && elt.key === record.key && elt.property === record.property),
						onChange: (value) => setUnselectedEntities(record, value)
					}, record.key || record.property);
				}),
				"globalStyles" === firstRecord?.name && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GlobalStylesDescription, { record: firstRecord })
			]
		});
	}

// packages/core-data/build-module/components/entities-saved-states/hooks/use-is-dirty.mjs
/**
	* Custom hook that determines if any entities are dirty (edited) and provides a way to manage selected/unselected entities.
	*
	* @return An object containing the following properties:
	*   - dirtyEntityRecords: An array of dirty entity records.
	*   - isDirty: A boolean indicating if there are any dirty entity records.
	*   - setUnselectedEntities: A function to set the unselected entities.
	*   - unselectedEntities: An array of unselected entities.
	*/
	const useIsDirty = () => {
		const { editedEntities, siteEdits, siteEntityConfig } = (0, _wordpress_data.useSelect)((select) => {
			const { __experimentalGetDirtyEntityRecords, getEntityRecordEdits, getEntityConfig } = select(STORE_NAME);
			return {
				editedEntities: __experimentalGetDirtyEntityRecords(),
				siteEdits: getEntityRecordEdits("root", "site"),
				siteEntityConfig: getEntityConfig("root", "site")
			};
		}, []);
		const dirtyEntityRecords = (0, _wordpress_element.useMemo)(() => {
			const editedEntitiesWithoutSite = editedEntities.filter((record) => !(record.kind === "root" && record.name === "site"));
			const siteEntityLabels = siteEntityConfig?.meta?.labels ?? {};
			const { title: siteTitleEdit, description: siteDescriptionEdit, site_logo: siteLogoEdit, site_icon: siteIconEdit, ...otherSiteEdits } = siteEdits ?? {};
			const editedSiteEntities = [
				siteTitleEdit !== void 0 && "title",
				siteDescriptionEdit !== void 0 && "description",
				siteLogoEdit !== void 0 && "site_logo",
				siteIconEdit !== void 0 && "site_icon",
				...Object.keys(otherSiteEdits)
			].filter(Boolean).map((property) => ({
				kind: "root",
				name: "site",
				title: siteEntityLabels[property] || property,
				property
			}));
			return [...editedEntitiesWithoutSite, ...editedSiteEntities];
		}, [
			editedEntities,
			siteEdits,
			siteEntityConfig
		]);
		const [unselectedEntities, _setUnselectedEntities] = (0, _wordpress_element.useState)([]);
		const setUnselectedEntities = ({ kind, name, key, property }, checked) => {
			if (checked) _setUnselectedEntities(unselectedEntities.filter((elt) => elt.kind !== kind || elt.name !== name || elt.key !== key || elt.property !== property));
			else _setUnselectedEntities([...unselectedEntities, {
				kind,
				name,
				key,
				property
			}]);
		};
		return {
			dirtyEntityRecords,
			isDirty: dirtyEntityRecords.length - unselectedEntities.length > 0,
			setUnselectedEntities,
			unselectedEntities
		};
	};

// packages/core-data/build-module/components/entities-saved-states/index.mjs
/**
	* Renders the component for managing saved states of entities.
	*
	* @param props              The component props.
	* @param props.close        The function to close the dialog.
	* @param props.renderDialog Whether to render the component with modal dialog behavior.
	* @param props.variant      Changes the layout of the component. When an `inline` value is provided, the action buttons are rendered at the end of the component instead of at the start.
	*
	* @return The rendered component.
	*/
	function EntitiesSavedStates({ close, renderDialog, variant }) {
		const isDirtyProps = useIsDirty();
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntitiesSavedStatesExtensible, {
			close,
			renderDialog,
			variant,
			...isDirtyProps
		});
	}
	/**
	* Renders a panel for saving entities with dirty records.
	*
	* @param props                       The component props.
	* @param props.additionalPrompt      Additional prompt to display.
	* @param props.close                 Function to close the panel.
	* @param props.onSave                Function to call when saving entities.
	* @param props.saveEnabled           Flag indicating if save is enabled.
	* @param props.saveLabel             Label for the save button.
	* @param props.renderDialog          Whether to render the component with modal dialog behavior.
	* @param props.dirtyEntityRecords    Array of dirty entity records.
	* @param props.isDirty               Flag indicating if there are dirty entities.
	* @param props.setUnselectedEntities Function to set unselected entities.
	* @param props.unselectedEntities    Array of unselected entities.
	* @param props.variant               Changes the layout of the component. When an `inline` value is provided, the action buttons are rendered at the end of the component instead of at the start.
	* @param props.successNoticeContent  Optional custom success notice content.
	*
	* @return The rendered component.
	*/
	function EntitiesSavedStatesExtensible({ additionalPrompt = void 0, close, onSave = void 0, saveEnabled: saveEnabledProp = void 0, saveLabel = (0, _wordpress_i18n.__)("Save"), renderDialog, dirtyEntityRecords, isDirty, setUnselectedEntities, unselectedEntities, variant = "default", successNoticeContent }) {
		const saveButtonRef = (0, _wordpress_element.useRef)(void 0);
		const { saveDirtyEntities } = unlock((0, _wordpress_data.useDispatch)(STORE_NAME));
		const { site: siteSavables, wp_template: templateSavables, wp_template_part: templatePartSavables, ...contentSavables } = dirtyEntityRecords.reduce((acc, record) => {
			const { name } = record;
			if (!acc[name]) acc[name] = [];
			acc[name].push(record);
			return acc;
		}, {});
		const sortedPartitionedSavables = [
			siteSavables,
			templateSavables,
			templatePartSavables,
			...Object.values(contentSavables)
		].filter(Array.isArray);
		const saveEnabled = saveEnabledProp ?? isDirty;
		const dismissPanel = (0, _wordpress_element.useCallback)(() => close(), [close]);
		const [saveDialogRef, saveDialogProps] = (0, _wordpress_compose.__experimentalUseDialog)({ onClose: () => dismissPanel() });
		const dialogLabelId = (0, _wordpress_compose.useInstanceId)(EntitiesSavedStatesExtensible, "entities-saved-states__panel-label");
		const dialogDescriptionId = (0, _wordpress_compose.useInstanceId)(EntitiesSavedStatesExtensible, "entities-saved-states__panel-description");
		const selectItemsToSaveDescription = !!dirtyEntityRecords.length ? (0, _wordpress_i18n.__)("Select the items you want to save.") : void 0;
		const isInline = variant === "inline";
		const actionButtons = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.FlexItem, {
			isBlock: isInline ? false : true,
			as: _wordpress_components.Button,
			variant: isInline ? "tertiary" : "secondary",
			size: isInline ? void 0 : "compact",
			onClick: dismissPanel,
			children: (0, _wordpress_i18n.__)("Cancel")
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.FlexItem, {
			isBlock: isInline ? false : true,
			as: _wordpress_components.Button,
			ref: saveButtonRef,
			variant: "primary",
			size: isInline ? void 0 : "compact",
			disabled: !saveEnabled,
			accessibleWhenDisabled: true,
			onClick: () => saveDirtyEntities({
				onSave,
				dirtyEntityRecords,
				entitiesToSkip: unselectedEntities,
				close,
				successNoticeContent
			}),
			className: "entities-saved-states__save-button",
			children: saveLabel
		})] });
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			ref: renderDialog ? saveDialogRef : void 0,
			...renderDialog && saveDialogProps,
			className: clsx("entities-saved-states__panel", { "is-inline": isInline }),
			role: renderDialog ? "dialog" : void 0,
			"aria-labelledby": renderDialog ? dialogLabelId : void 0,
			"aria-describedby": renderDialog ? dialogDescriptionId : void 0,
			children: [
				!isInline && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Flex, {
					className: "entities-saved-states__panel-header",
					gap: 2,
					children: actionButtons
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "entities-saved-states__text-prompt",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "entities-saved-states__text-prompt--header-wrapper",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
							id: renderDialog ? dialogLabelId : void 0,
							className: "entities-saved-states__text-prompt--header",
							children: (0, _wordpress_i18n.__)("Are you ready to save?")
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						id: renderDialog ? dialogDescriptionId : void 0,
						children: [additionalPrompt, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "entities-saved-states__text-prompt--changes-count",
							children: isDirty ? (0, _wordpress_element.createInterpolateElement)((0, _wordpress_i18n.sprintf)((0, _wordpress_i18n._n)("There is <strong>%d site change</strong> waiting to be saved.", "There are <strong>%d site changes</strong> waiting to be saved.", dirtyEntityRecords.length), dirtyEntityRecords.length), { strong: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {}) }) : selectItemsToSaveDescription
						})]
					})]
				}),
				sortedPartitionedSavables.map((list) => {
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntityTypeList, {
						list,
						unselectedEntities,
						setUnselectedEntities
					}, list[0].name);
				}),
				isInline && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Flex, {
					direction: "row",
					justify: "flex-end",
					className: "entities-saved-states__panel-footer",
					children: actionButtons
				})
			]
		});
	}

// packages/core-data/build-module/private-apis.mjs
	const lockedApis = {
		PrivateEntityProvider,
		EntitiesSavedStates,
		EntitiesSavedStatesExtensible,
		getTemplateInfo,
		getTemplatePartIcon,
		useEntitiesSavedStatesIsDirty: useIsDirty,
		useEntityRecordsWithPermissions,
		RECEIVE_INTERMEDIATE_RESULTS,
		CRDT_AUTOSAVE_SNAPSHOT_KEY,
		entityContainsSnapshot,
		getEntitySnapshot,
		retrySyncConnection,
		useActiveCollaborators,
		useResolvedSelection,
		useOnCollaboratorJoin,
		useOnCollaboratorLeave,
		useOnPostSave,
		SelectionType,
		SelectionDirection
	};
	const privateApis = {};
	lock(privateApis, lockedApis);

// packages/core-data/build-module/index.mjs
	const entitiesConfig = [...rootEntitiesConfig, ...additionalEntityConfigLoaders.filter((config) => !!config.name)];
	const entitySelectors = entitiesConfig.reduce((result, entity) => {
		const { kind, name, plural } = entity;
		const getEntityRecordMethodName = getMethodName(kind, name);
		result[getEntityRecordMethodName] = (state, key, query) => {
			logEntityDeprecation(kind, name, getEntityRecordMethodName, {
				isShorthandSelector: true,
				alternativeFunctionName: "getEntityRecord"
			});
			return getEntityRecord$1(state, kind, name, key, query);
		};
		if (plural) {
			const getEntityRecordsMethodName = getMethodName(kind, plural, "get");
			result[getEntityRecordsMethodName] = (state, query) => {
				logEntityDeprecation(kind, name, getEntityRecordsMethodName, {
					isShorthandSelector: true,
					alternativeFunctionName: "getEntityRecords"
				});
				return getEntityRecords$1(state, kind, name, query);
			};
		}
		return result;
	}, {});
	const entityResolvers = entitiesConfig.reduce((result, entity) => {
		const { kind, name, plural } = entity;
		const getEntityRecordMethodName = getMethodName(kind, name);
		result[getEntityRecordMethodName] = (key, query) => {
			logEntityDeprecation(kind, name, getEntityRecordMethodName, {
				isShorthandSelector: true,
				alternativeFunctionName: "getEntityRecord"
			});
			return getEntityRecord(kind, name, key, query);
		};
		if (plural) {
			const getEntityRecordsMethodName = getMethodName(kind, plural, "get");
			result[getEntityRecordsMethodName] = (...args) => {
				logEntityDeprecation(kind, plural, getEntityRecordsMethodName, {
					isShorthandSelector: true,
					alternativeFunctionName: "getEntityRecords"
				});
				return getEntityRecords(kind, name, ...args);
			};
			result[getEntityRecordsMethodName].shouldInvalidate = (action) => getEntityRecords.shouldInvalidate(action, kind, name);
		}
		return result;
	}, {});
	const entityActions = entitiesConfig.reduce((result, entity) => {
		const { kind, name } = entity;
		const saveEntityRecordMethodName = getMethodName(kind, name, "save");
		result[saveEntityRecordMethodName] = (record, options) => {
			logEntityDeprecation(kind, name, saveEntityRecordMethodName, {
				isShorthandSelector: true,
				alternativeFunctionName: "saveEntityRecord"
			});
			return saveEntityRecord(kind, name, record, options);
		};
		const deleteEntityRecordMethodName = getMethodName(kind, name, "delete");
		result[deleteEntityRecordMethodName] = (key, query, options) => {
			logEntityDeprecation(kind, name, deleteEntityRecordMethodName, {
				isShorthandSelector: true,
				alternativeFunctionName: "deleteEntityRecord"
			});
			return deleteEntityRecord(kind, name, key, query, options);
		};
		return result;
	}, {});
	const storeConfig = () => ({
		reducer: reducer_default,
		actions: {
			...dynamicActions,
			...actions_exports,
			...entityActions,
			...createLocksActions()
		},
		selectors: {
			...dynamicSelectors,
			...selectors_exports,
			...entitySelectors
		},
		resolvers: {
			...resolvers_exports,
			...entityResolvers
		}
	});
	/**
	* Store definition for the code data namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*/
	const store = (0, _wordpress_data.createReduxStore)(STORE_NAME, storeConfig());
	unlock(store).registerPrivateSelectors(private_selectors_exports);
	unlock(store).registerPrivateActions(private_actions_exports);
	(0, _wordpress_data.register)(store);

exports.EntityProvider = EntityProvider;
exports.PrivateEntityProvider = PrivateEntityProvider;
exports.__experimentalFetchLinkSuggestions = fetchLinkSuggestions;
exports.__experimentalFetchUrlData = fetchUrlData;
exports.__experimentalUseEntityRecord = useDeprecatedEntityRecord;
exports.__experimentalUseEntityRecords = useDeprecatedEntityRecords;
exports.__experimentalUseResourcePermissions = useDeprecatedResourcePermissions;
exports.fetchBlockPatterns = fetchBlockPatterns;
exports.privateApis = privateApis;
exports.store = store;
exports.useEntityBlockEditor = useEntityBlockEditor;
exports.useEntityId = useEntityId;
exports.useEntityProp = useEntityProp;
exports.useEntityRecord = useEntityRecord;
exports.useEntityRecords = useEntityRecords;
exports.useResourcePermissions = useResourcePermissions;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).coreData = exports;
return exports;
})({}, window.wp.data, window.wp.compose, window.wp.undoManager, window.wp.apiFetch, window.wp.hooks, window.wp.warning, window.wp.blocks, window.wp.i18n, window.wp.blockEditor, window.wp.privateApis, window.wp.richText, window.wp.url, window.wp.deprecated, window.wp.notices, window.wp.htmlEntities, window.wp.element, window.ReactJSXRuntime, window.wp.primitives, window.wp.components);
//# sourceMappingURL=index.js.map