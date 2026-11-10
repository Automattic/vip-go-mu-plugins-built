(function(exports, _wordpress_deprecated, _wordpress_redux_routine, _wordpress_compose, _wordpress_private_apis, _wordpress_element, _wordpress_priority_queue, _wordpress_is_shallow_equal, react_jsx_runtime) {

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

_wordpress_deprecated = __toESM(_wordpress_deprecated, 1);
_wordpress_redux_routine = __toESM(_wordpress_redux_routine, 1);

// node_modules/.store/redux@5.0.1-9v7mxaXuTbeaBW_YNRLQKQ/node_modules/redux/dist/redux.mjs
	var symbol_observable_default = /* @__PURE__ */ (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
	var randomString = () => Math.random().toString(36).substring(7).split("").join(".");
	var actionTypes_default = {
		INIT: `@@redux/INIT${/* @__PURE__ */ randomString()}`,
		REPLACE: `@@redux/REPLACE${/* @__PURE__ */ randomString()}`,
		PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
	};
	function isPlainObject$1(obj) {
		if (typeof obj !== "object" || obj === null) return false;
		let proto = obj;
		while (Object.getPrototypeOf(proto) !== null) proto = Object.getPrototypeOf(proto);
		return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
	}
	function miniKindOf(val) {
		if (val === void 0) return "undefined";
		if (val === null) return "null";
		const type = typeof val;
		switch (type) {
			case "boolean":
			case "string":
			case "number":
			case "symbol":
			case "function": return type;
		}
		if (Array.isArray(val)) return "array";
		if (isDate(val)) return "date";
		if (isError(val)) return "error";
		const constructorName = ctorName(val);
		switch (constructorName) {
			case "Symbol":
			case "Promise":
			case "WeakMap":
			case "WeakSet":
			case "Map":
			case "Set": return constructorName;
		}
		return Object.prototype.toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, "");
	}
	function ctorName(val) {
		return typeof val.constructor === "function" ? val.constructor.name : null;
	}
	function isError(val) {
		return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
	}
	function isDate(val) {
		if (val instanceof Date) return true;
		return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
	}
	function kindOf(val) {
		let typeOfVal = typeof val;
		typeOfVal = miniKindOf(val);
		return typeOfVal;
	}
	function createStore(reducer, preloadedState, enhancer) {
		if (typeof reducer !== "function") throw new Error(`Expected the root reducer to be a function. Instead, received: '${kindOf(reducer)}'`);
		if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") throw new Error("It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.");
		if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
			enhancer = preloadedState;
			preloadedState = void 0;
		}
		if (typeof enhancer !== "undefined") {
			if (typeof enhancer !== "function") throw new Error(`Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`);
			return enhancer(createStore)(reducer, preloadedState);
		}
		let currentReducer = reducer;
		let currentState = preloadedState;
		let currentListeners = /* @__PURE__ */ new Map();
		let nextListeners = currentListeners;
		let listenerIdCounter = 0;
		let isDispatching = false;
		function ensureCanMutateNextListeners() {
			if (nextListeners === currentListeners) {
				nextListeners = /* @__PURE__ */ new Map();
				currentListeners.forEach((listener, key) => {
					nextListeners.set(key, listener);
				});
			}
		}
		function getState() {
			if (isDispatching) throw new Error("You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.");
			return currentState;
		}
		function subscribe(listener) {
			if (typeof listener !== "function") throw new Error(`Expected the listener to be a function. Instead, received: '${kindOf(listener)}'`);
			if (isDispatching) throw new Error("You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.");
			let isSubscribed = true;
			ensureCanMutateNextListeners();
			const listenerId = listenerIdCounter++;
			nextListeners.set(listenerId, listener);
			return function unsubscribe() {
				if (!isSubscribed) return;
				if (isDispatching) throw new Error("You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.");
				isSubscribed = false;
				ensureCanMutateNextListeners();
				nextListeners.delete(listenerId);
				currentListeners = null;
			};
		}
		function dispatch(action) {
			if (!isPlainObject$1(action)) throw new Error(`Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`);
			if (typeof action.type === "undefined") throw new Error("Actions may not have an undefined \"type\" property. You may have misspelled an action type string constant.");
			if (typeof action.type !== "string") throw new Error(`Action "type" property must be a string. Instead, the actual type was: '${kindOf(action.type)}'. Value was: '${action.type}' (stringified)`);
			if (isDispatching) throw new Error("Reducers may not dispatch actions.");
			try {
				isDispatching = true;
				currentState = currentReducer(currentState, action);
			} finally {
				isDispatching = false;
			}
			(currentListeners = nextListeners).forEach((listener) => {
				listener();
			});
			return action;
		}
		function replaceReducer(nextReducer) {
			if (typeof nextReducer !== "function") throw new Error(`Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}`);
			currentReducer = nextReducer;
			dispatch({ type: actionTypes_default.REPLACE });
		}
		function observable() {
			const outerSubscribe = subscribe;
			return {
				/**
				* The minimal observable subscription method.
				* @param observer Any object that can be used as an observer.
				* The observer object should have a `next` method.
				* @returns An object with an `unsubscribe` method that can
				* be used to unsubscribe the observable from the store, and prevent further
				* emission of values from the observable.
				*/
				subscribe(observer) {
					if (typeof observer !== "object" || observer === null) throw new Error(`Expected the observer to be an object. Instead, received: '${kindOf(observer)}'`);
					function observeState() {
						const observerAsObserver = observer;
						if (observerAsObserver.next) observerAsObserver.next(getState());
					}
					observeState();
					return { unsubscribe: outerSubscribe(observeState) };
				},
				[symbol_observable_default]() {
					return this;
				}
			};
		}
		dispatch({ type: actionTypes_default.INIT });
		return {
			dispatch,
			subscribe,
			getState,
			replaceReducer,
			[symbol_observable_default]: observable
		};
	}
	function compose$1(...funcs) {
		if (funcs.length === 0) return (arg) => arg;
		if (funcs.length === 1) return funcs[0];
		return funcs.reduce((a, b) => (...args) => a(b(...args)));
	}
	function applyMiddleware(...middlewares) {
		return (createStore2) => (reducer, preloadedState) => {
			const store = createStore2(reducer, preloadedState);
			let dispatch = () => {
				throw new Error("Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.");
			};
			const middlewareAPI = {
				getState: store.getState,
				dispatch: (action, ...args) => dispatch(action, ...args)
			};
			dispatch = compose$1(...middlewares.map((middleware) => middleware(middlewareAPI)))(store.dispatch);
			return {
				...store,
				dispatch
			};
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

// packages/data/build-module/redux-store/combine-reducers.mjs
var import_equivalent_key_map = /* @__PURE__ */ __toESM(require_equivalent_key_map(), 1);
	function combineReducers$1(reducers) {
		const keys = Object.keys(reducers);
		return function combinedReducer(state = {}, action) {
			const nextState = {};
			let hasChanged = false;
			for (const key of keys) {
				const reducer = reducers[key];
				const prevStateForKey = state[key];
				const nextStateForKey = reducer(prevStateForKey, action);
				nextState[key] = nextStateForKey;
				hasChanged = hasChanged || nextStateForKey !== prevStateForKey;
			}
			return hasChanged ? nextState : state;
		};
	}

// packages/data/build-module/factory.mjs
/**
	* Creates a selector function that takes additional curried argument with the
	* registry `select` function. While a regular selector has signature
	* ```js
	* ( state, ...selectorArgs ) => ( result )
	* ```
	* that allows to select data from the store's `state`, a registry selector
	* has signature:
	* ```js
	* ( select ) => ( state, ...selectorArgs ) => ( result )
	* ```
	* that supports also selecting from other registered stores.
	*
	* @example
	* ```js
	* import { store as coreStore } from '@wordpress/core-data';
	* import { store as editorStore } from '@wordpress/editor';
	*
	* const getCurrentPostId = createRegistrySelector( ( select ) => ( state ) => {
	*   return select( editorStore ).getCurrentPostId();
	* } );
	*
	* const getPostEdits = createRegistrySelector( ( select ) => ( state ) => {
	*   // calling another registry selector just like any other function
	*   const postType = getCurrentPostType( state );
	*   const postId = getCurrentPostId( state );
	*	 return select( coreStore ).getEntityRecordEdits( 'postType', postType, postId );
	* } );
	* ```
	*
	* Note how the `getCurrentPostId` selector can be called just like any other function,
	* (it works even inside a regular non-registry selector) and we don't need to pass the
	* registry as argument. The registry binding happens automatically when registering the selector
	* with a store.
	*
	* @param registrySelector Function receiving a registry `select`
	*                         function and returning a state selector.
	*
	* @return Registry selector that can be registered with a store.
	*/
	function createRegistrySelector(registrySelector) {
		const selectorsByRegistry = /* @__PURE__ */ new WeakMap();
		const wrappedSelector = (...args) => {
			let selector = selectorsByRegistry.get(wrappedSelector.registry);
			if (!selector) {
				selector = registrySelector(wrappedSelector.registry.select);
				selectorsByRegistry.set(wrappedSelector.registry, selector);
			}
			return selector(...args);
		};
		/**
		* Flag indicating that the selector is a registry selector that needs the correct registry
		* reference to be assigned to `selector.registry` to make it work correctly.
		* be mapped as a registry selector.
		*/
		wrappedSelector.isRegistrySelector = true;
		return wrappedSelector;
	}
	/**
	* Creates a control function that takes additional curried argument with the `registry` object.
	* While a regular control has signature
	* ```js
	* ( action ) => ( iteratorOrPromise )
	* ```
	* where the control works with the `action` that it's bound to, a registry control has signature:
	* ```js
	* ( registry ) => ( action ) => ( iteratorOrPromise )
	* ```
	* A registry control is typically used to select data or dispatch an action to a registered
	* store.
	*
	* When registering a control created with `createRegistryControl` with a store, the store
	* knows which calling convention to use when executing the control.
	*
	* @param registryControl Function receiving a registry object and returning a control.
	*
	* @return Registry control that can be registered with a store.
	*/
	function createRegistryControl(registryControl) {
		registryControl.isRegistryControl = true;
		return registryControl;
	}

// packages/data/build-module/controls.mjs
	const SELECT = "@@data/SELECT";
	const RESOLVE_SELECT = "@@data/RESOLVE_SELECT";
	const DISPATCH = "@@data/DISPATCH";
	function isStoreDescriptor(object) {
		return object !== null && typeof object === "object";
	}
	/**
	* Dispatches a control action for triggering a synchronous registry select.
	*
	* Note: This control synchronously returns the current selector value, triggering the
	* resolution, but not waiting for it.
	*
	* @param storeNameOrDescriptor Unique namespace identifier for the store
	* @param selectorName          The name of the selector.
	* @param args                  Arguments for the selector.
	*
	* @example
	* ```js
	* import { controls } from '@wordpress/data';
	*
	* // Action generator using `select`.
	* export function* myAction() {
	*   const isEditorSideBarOpened = yield controls.select( 'core/edit-post', 'isEditorSideBarOpened' );
	*   // Do stuff with the result from the `select`.
	* }
	* ```
	*
	* @return The control descriptor.
	*/
	function select$1(storeNameOrDescriptor, selectorName, ...args) {
		return {
			type: SELECT,
			storeKey: isStoreDescriptor(storeNameOrDescriptor) ? storeNameOrDescriptor.name : storeNameOrDescriptor,
			selectorName,
			args
		};
	}
	/**
	* Dispatches a control action for triggering and resolving a registry select.
	*
	* Note: when this control action is handled, it automatically considers
	* selectors that may have a resolver. In such case, it will return a `Promise` that resolves
	* after the selector finishes resolving, with the final result value.
	*
	* @param storeNameOrDescriptor Unique namespace identifier for the store
	* @param selectorName          The name of the selector
	* @param args                  Arguments for the selector.
	*
	* @example
	* ```js
	* import { controls } from '@wordpress/data';
	*
	* // Action generator using resolveSelect
	* export function* myAction() {
	* 	const isSidebarOpened = yield controls.resolveSelect( 'core/edit-post', 'isEditorSideBarOpened' );
	* 	// do stuff with the result from the select.
	* }
	* ```
	*
	* @return The control descriptor.
	*/
	function resolveSelect$1(storeNameOrDescriptor, selectorName, ...args) {
		return {
			type: RESOLVE_SELECT,
			storeKey: isStoreDescriptor(storeNameOrDescriptor) ? storeNameOrDescriptor.name : storeNameOrDescriptor,
			selectorName,
			args
		};
	}
	/**
	* Dispatches a control action for triggering a registry dispatch.
	*
	* @param storeNameOrDescriptor Unique namespace identifier for the store
	* @param actionName            The name of the action to dispatch
	* @param args                  Arguments for the dispatch action.
	*
	* @example
	* ```js
	* import { controls } from '@wordpress/data-controls';
	*
	* // Action generator using dispatch
	* export function* myAction() {
	*   yield controls.dispatch( 'core/editor', 'togglePublishSidebar' );
	*   // do some other things.
	* }
	* ```
	*
	* @return   The control descriptor.
	*/
	function dispatch$1(storeNameOrDescriptor, actionName, ...args) {
		return {
			type: DISPATCH,
			storeKey: isStoreDescriptor(storeNameOrDescriptor) ? storeNameOrDescriptor.name : storeNameOrDescriptor,
			actionName,
			args
		};
	}
	const controls = {
		select: select$1,
		resolveSelect: resolveSelect$1,
		dispatch: dispatch$1
	};
	const builtinControls = {
		[SELECT]: createRegistryControl((registry) => ({ storeKey, selectorName, args }) => registry.select(storeKey)[selectorName](...args)),
		[RESOLVE_SELECT]: createRegistryControl((registry) => ({ storeKey, selectorName, args }) => {
			return registry[registry.select(storeKey)[selectorName].hasResolver ? "resolveSelect" : "select"](storeKey)[selectorName](...args);
		}),
		[DISPATCH]: createRegistryControl((registry) => ({ storeKey, actionName, args }) => registry.dispatch(storeKey)[actionName](...args))
	};

// packages/data/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/data");

// node_modules/.store/is-promise@4.0.0-DcZ_LsgUAVaKHNNDXMEENg/node_modules/is-promise/index.mjs
	function isPromise(obj) {
		return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
	}

// packages/data/build-module/promise-middleware.mjs
/**
	* Simplest possible promise redux middleware.
	*/
	const promiseMiddleware = () => (next) => (action) => {
		if (isPromise(action)) return action.then((resolvedAction) => {
			if (resolvedAction) return next(resolvedAction);
		});
		return next(action);
	};

// packages/data/build-module/resolvers-cache-middleware.mjs
/**
	* Creates a middleware handling resolvers cache invalidation.
	*
	* @param registry  Registry for which to create the middleware.
	* @param storeName Name of the store for which to create the middleware.
	*
	* @return Middleware function.
	*/
	const createResolversCacheMiddleware = (registry, storeName) => () => (next) => (action) => {
		const resolvers = registry.select(storeName).getCachedResolvers();
		Object.entries(resolvers).forEach(([selectorName, resolversByArgs]) => {
			const resolver = registry.stores[storeName]?.resolvers?.[selectorName];
			if (!resolver || !resolver.shouldInvalidate) return;
			const { shouldInvalidate } = resolver;
			resolversByArgs.forEach((value, args) => {
				if (value === void 0) return;
				if (value.status !== "finished" && value.status !== "error") return;
				if (!shouldInvalidate(action, ...args)) return;
				registry.dispatch(storeName).invalidateResolution(selectorName, args);
			});
		});
		return next(action);
	};

// packages/data/build-module/redux-store/thunk-middleware.mjs
	function createThunkMiddleware(args) {
		return () => (next) => (action) => {
			if (typeof action === "function") return action(args);
			return next(action);
		};
	}

// packages/data/build-module/redux-store/keyed-reducer.mjs
/**
	* Higher-order reducer creator which creates a combined reducer object, keyed
	* by a property on the action object.
	*
	* @param actionProperty Action property by which to key object.
	* @return Higher-order reducer.
	*
	* @example
	* ```js
	* import { keyedReducer } from '@wordpress/data';
	*
	* const itemsByContext = keyedReducer( 'context' )( ( state = [], action ) => {
	*   switch ( action.type ) {
	*     case 'ADD_ITEM':
	*       return [ ...state, action.item ];
	*   }
	*   return state;
	* } );
	* ```
	*/
	const keyedReducer = (actionProperty) => (reducer) => (state = {}, action) => {
		const key = action[actionProperty];
		if (key === void 0) return state;
		const nextKeyState = reducer(state[key], action);
		if (nextKeyState === state[key]) return state;
		return {
			...state,
			[key]: nextKeyState
		};
	};

// packages/data/build-module/redux-store/metadata/utils.mjs
/**
	* Normalize selector argument array by defaulting `undefined` value to an empty array
	* and removing trailing `undefined` values.
	*
	* @param args Selector argument array
	* @return Normalized state key array
	*/
	function selectorArgsToStateKey(args) {
		if (args === void 0 || args === null) return [];
		const len = args.length;
		let idx = len;
		while (idx > 0 && args[idx - 1] === void 0) idx--;
		return idx === len ? args : args.slice(0, idx);
	}

// packages/data/build-module/redux-store/metadata/reducer.mjs
/**
	* Reducer function returning next state for selector resolution of
	* subkeys, object form:
	*
	*  selectorName -> EquivalentKeyMap<Array,boolean>
	*/
	const subKeysIsResolved = keyedReducer("selectorName")((state = new import_equivalent_key_map.default(), action) => {
		switch (action.type) {
			case "START_RESOLUTION": {
				const nextState = new import_equivalent_key_map.default(state);
				nextState.set(selectorArgsToStateKey(action.args), { status: "resolving" });
				return nextState;
			}
			case "FINISH_RESOLUTION": {
				const nextState = new import_equivalent_key_map.default(state);
				nextState.set(selectorArgsToStateKey(action.args), { status: "finished" });
				return nextState;
			}
			case "FAIL_RESOLUTION": {
				const nextState = new import_equivalent_key_map.default(state);
				nextState.set(selectorArgsToStateKey(action.args), {
					status: "error",
					error: action.error
				});
				return nextState;
			}
			case "START_RESOLUTIONS": {
				const nextState = new import_equivalent_key_map.default(state);
				for (const resolutionArgs of action.args) nextState.set(selectorArgsToStateKey(resolutionArgs), { status: "resolving" });
				return nextState;
			}
			case "FINISH_RESOLUTIONS": {
				const nextState = new import_equivalent_key_map.default(state);
				for (const resolutionArgs of action.args) nextState.set(selectorArgsToStateKey(resolutionArgs), { status: "finished" });
				return nextState;
			}
			case "FAIL_RESOLUTIONS": {
				const nextState = new import_equivalent_key_map.default(state);
				action.args.forEach((resolutionArgs, idx) => {
					const resolutionState = {
						status: "error",
						error: void 0
					};
					const error = action.errors[idx];
					if (error) resolutionState.error = error;
					nextState.set(selectorArgsToStateKey(resolutionArgs), resolutionState);
				});
				return nextState;
			}
			case "INVALIDATE_RESOLUTION": {
				const nextState = new import_equivalent_key_map.default(state);
				nextState.delete(selectorArgsToStateKey(action.args));
				return nextState;
			}
		}
		return state;
	});
	/**
	* Reducer function returning next state for selector resolution, object form:
	*
	*   selectorName -> EquivalentKeyMap<Array, boolean>
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Next state.
	*/
	const isResolved = (state = {}, action) => {
		switch (action.type) {
			case "INVALIDATE_RESOLUTION_FOR_STORE": return {};
			case "INVALIDATE_RESOLUTION_FOR_STORE_SELECTOR":
				if (action.selectorName in state) {
					const { [action.selectorName]: removedSelector, ...restState } = state;
					return restState;
				}
				return state;
			case "START_RESOLUTION":
			case "FINISH_RESOLUTION":
			case "FAIL_RESOLUTION":
			case "START_RESOLUTIONS":
			case "FINISH_RESOLUTIONS":
			case "FAIL_RESOLUTIONS":
			case "INVALIDATE_RESOLUTION": return subKeysIsResolved(state, action);
			default: return state;
		}
	};

// node_modules/.store/rememo@4.0.2-QNErfujZCHSdPMooBQvQCw/node_modules/rememo/rememo.js
/** @typedef {(...args: any[]) => *[]} GetDependants */
	/** @typedef {() => void} Clear */
	/**
	* @typedef {{
	*   getDependants: GetDependants,
	*   clear: Clear
	* }} EnhancedSelector
	*/
	/**
	* Internal cache entry.
	*
	* @typedef CacheNode
	*
	* @property {?CacheNode|undefined} [prev] Previous node.
	* @property {?CacheNode|undefined} [next] Next node.
	* @property {*[]} args Function arguments for cache entry.
	* @property {*} val Function result.
	*/
	/**
	* @typedef Cache
	*
	* @property {Clear} clear Function to clear cache.
	* @property {boolean} [isUniqueByDependants] Whether dependants are valid in
	* considering cache uniqueness. A cache is unique if dependents are all arrays
	* or objects.
	* @property {CacheNode?} [head] Cache head.
	* @property {*[]} [lastDependants] Dependants from previous invocation.
	*/
	/**
	* Arbitrary value used as key for referencing cache object in WeakMap tree.
	*
	* @type {{}}
	*/
	var LEAF_KEY = {};
	/**
	* Returns the first argument as the sole entry in an array.
	*
	* @template T
	*
	* @param {T} value Value to return.
	*
	* @return {[T]} Value returned as entry in array.
	*/
	function arrayOf(value) {
		return [value];
	}
	/**
	* Returns true if the value passed is object-like, or false otherwise. A value
	* is object-like if it can support property assignment, e.g. object or array.
	*
	* @param {*} value Value to test.
	*
	* @return {boolean} Whether value is object-like.
	*/
	function isObjectLike(value) {
		return !!value && "object" === typeof value;
	}
	/**
	* Creates and returns a new cache object.
	*
	* @return {Cache} Cache object.
	*/
	function createCache() {
		/** @type {Cache} */
		var cache = { clear: function() {
			cache.head = null;
		} };
		return cache;
	}
	/**
	* Returns true if entries within the two arrays are strictly equal by
	* reference from a starting index.
	*
	* @param {*[]} a First array.
	* @param {*[]} b Second array.
	* @param {number} fromIndex Index from which to start comparison.
	*
	* @return {boolean} Whether arrays are shallowly equal.
	*/
	function isShallowEqual$1(a, b, fromIndex) {
		var i;
		if (a.length !== b.length) return false;
		for (i = fromIndex; i < a.length; i++) if (a[i] !== b[i]) return false;
		return true;
	}
	/**
	* Returns a memoized selector function. The getDependants function argument is
	* called before the memoized selector and is expected to return an immutable
	* reference or array of references on which the selector depends for computing
	* its own return value. The memoize cache is preserved only as long as those
	* dependant references remain the same. If getDependants returns a different
	* reference(s), the cache is cleared and the selector value regenerated.
	*
	* @template {(...args: *[]) => *} S
	*
	* @param {S} selector Selector function.
	* @param {GetDependants=} getDependants Dependant getter returning an array of
	* references used in cache bust consideration.
	*/
	function rememo_default(selector, getDependants) {
		/** @type {WeakMap<*,*>} */
		var rootCache;
		/** @type {GetDependants} */
		var normalizedGetDependants = getDependants ? getDependants : arrayOf;
		/**
		* Returns the cache for a given dependants array. When possible, a WeakMap
		* will be used to create a unique cache for each set of dependants. This
		* is feasible due to the nature of WeakMap in allowing garbage collection
		* to occur on entries where the key object is no longer referenced. Since
		* WeakMap requires the key to be an object, this is only possible when the
		* dependant is object-like. The root cache is created as a hierarchy where
		* each top-level key is the first entry in a dependants set, the value a
		* WeakMap where each key is the next dependant, and so on. This continues
		* so long as the dependants are object-like. If no dependants are object-
		* like, then the cache is shared across all invocations.
		*
		* @see isObjectLike
		*
		* @param {*[]} dependants Selector dependants.
		*
		* @return {Cache} Cache object.
		*/
		function getCache(dependants) {
			var caches = rootCache, isUniqueByDependants = true, i = 0, dependant, map, cache;
			for (; i < dependants.length; i++) {
				dependant = dependants[i];
				if (!isObjectLike(dependant)) {
					isUniqueByDependants = false;
					break;
				}
				if (caches.has(dependant)) caches = caches.get(dependant);
				else {
					map = /* @__PURE__ */ new WeakMap();
					caches.set(dependant, map);
					caches = map;
				}
			}
			if (!caches.has(LEAF_KEY)) {
				cache = createCache();
				cache.isUniqueByDependants = isUniqueByDependants;
				caches.set(LEAF_KEY, cache);
			}
			return caches.get(LEAF_KEY);
		}
		/**
		* Resets root memoization cache.
		*/
		function clear() {
			rootCache = /* @__PURE__ */ new WeakMap();
		}
		/**
		* The augmented selector call, considering first whether dependants have
		* changed before passing it to underlying memoize function.
		*
		* @param {*}    source    Source object for derivation.
		* @param {...*} extraArgs Additional arguments to pass to selector.
		*
		* @return {*} Selector result.
		*/
		function callSelector() {
			var len = arguments.length, cache, node, i, args = new Array(len), dependants;
			for (i = 0; i < len; i++) args[i] = arguments[i];
			dependants = normalizedGetDependants.apply(null, args);
			cache = getCache(dependants);
			if (!cache.isUniqueByDependants) {
				if (cache.lastDependants && !isShallowEqual$1(dependants, cache.lastDependants, 0)) cache.clear();
				cache.lastDependants = dependants;
			}
			node = cache.head;
			while (node) {
				if (!isShallowEqual$1(node.args, args, 1)) {
					node = node.next;
					continue;
				}
				if (node !== cache.head) {
					/** @type {CacheNode} */ node.prev.next = node.next;
					if (node.next) node.next.prev = node.prev;
					node.next = cache.head;
					node.prev = null;
					/** @type {CacheNode} */ cache.head.prev = node;
					cache.head = node;
				}
				return node.val;
			}
			node = { val: selector.apply(null, args) };
			args[0] = null;
			node.args = args;
			if (cache.head) {
				cache.head.prev = node;
				node.next = cache.head;
			}
			cache.head = node;
			return node.val;
		}
		callSelector.getDependants = normalizedGetDependants;
		callSelector.clear = clear;
		clear();
		return callSelector;
	}

// packages/data/build-module/create-selector.mjs
/**
	* Creates a memoized selector that caches the computed values according to the array of "dependants"
	* and the selector parameters, and recomputes the values only when any of them changes.
	*
	* See The documentation for the `rememo` package from which the `createSelector` function is reexported.
	*/
	const createSelector = rememo_default;

// packages/data/build-module/redux-store/metadata/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		countSelectorsByStatus: () => countSelectorsByStatus,
		getCachedResolvers: () => getCachedResolvers,
		getIsResolving: () => getIsResolving,
		getResolutionError: () => getResolutionError,
		getResolutionState: () => getResolutionState,
		hasFinishedResolution: () => hasFinishedResolution,
		hasResolutionFailed: () => hasResolutionFailed,
		hasResolvingSelectors: () => hasResolvingSelectors,
		hasStartedResolution: () => hasStartedResolution,
		isResolving: () => isResolving
	}, 1);
	/**
	* Returns the raw resolution state value for a given selector name,
	* and arguments set. May be undefined if the selector has never been resolved
	* or not resolved for the given set of arguments, otherwise true or false for
	* resolution started and completed respectively.
	*
	* @param state        Data state.
	* @param selectorName Selector name.
	* @param args         Arguments passed to selector.
	*
	* @return isResolving value.
	*/
	function getResolutionState(state, selectorName, args) {
		const map = state[selectorName];
		if (!map) return;
		return map.get(selectorArgsToStateKey(args));
	}
	/**
	* Returns an `isResolving`-like value for a given selector name and arguments set.
	* Its value is either `undefined` if the selector has never been resolved or has been
	* invalidated, or a `true`/`false` boolean value if the resolution is in progress or
	* has finished, respectively.
	*
	* This is a legacy selector that was implemented when the "raw" internal data had
	* this `undefined | boolean` format. Nowadays the internal value is an object that
	* can be retrieved with `getResolutionState`.
	*
	* @deprecated
	*
	* @param state        Data state.
	* @param selectorName Selector name.
	* @param args         Arguments passed to selector.
	*
	* @return isResolving value.
	*/
	function getIsResolving(state, selectorName, args) {
		(0, _wordpress_deprecated.default)("wp.data.select( store ).getIsResolving", {
			since: "6.6",
			version: "6.8",
			alternative: "wp.data.select( store ).getResolutionState"
		});
		const resolutionState = getResolutionState(state, selectorName, args);
		return resolutionState && resolutionState.status === "resolving";
	}
	/**
	* Returns true if resolution has already been triggered for a given
	* selector name, and arguments set.
	*
	* @param state        Data state.
	* @param selectorName Selector name.
	* @param args         Arguments passed to selector.
	*
	* @return Whether resolution has been triggered.
	*/
	function hasStartedResolution(state, selectorName, args) {
		return getResolutionState(state, selectorName, args) !== void 0;
	}
	/**
	* Returns true if resolution has completed for a given selector
	* name, and arguments set.
	*
	* @param state        Data state.
	* @param selectorName Selector name.
	* @param args         Arguments passed to selector.
	*
	* @return Whether resolution has completed.
	*/
	function hasFinishedResolution(state, selectorName, args) {
		const status = getResolutionState(state, selectorName, args)?.status;
		return status === "finished" || status === "error";
	}
	/**
	* Returns true if resolution has failed for a given selector
	* name, and arguments set.
	*
	* @param state        Data state.
	* @param selectorName Selector name.
	* @param args         Arguments passed to selector.
	*
	* @return Has resolution failed
	*/
	function hasResolutionFailed(state, selectorName, args) {
		return getResolutionState(state, selectorName, args)?.status === "error";
	}
	/**
	* Returns the resolution error for a given selector name, and arguments set.
	* Note it may be of an Error type, but may also be null, undefined, or anything else
	* that can be `throw`-n.
	*
	* @param state        Data state.
	* @param selectorName Selector name.
	* @param args         Arguments passed to selector.
	*
	* @return Last resolution error
	*/
	function getResolutionError(state, selectorName, args) {
		const resolutionState = getResolutionState(state, selectorName, args);
		return resolutionState?.status === "error" ? resolutionState.error : null;
	}
	/**
	* Returns true if resolution has been triggered but has not yet completed for
	* a given selector name, and arguments set.
	*
	* @param state        Data state.
	* @param selectorName Selector name.
	* @param args         Arguments passed to selector.
	*
	* @return Whether resolution is in progress.
	*/
	function isResolving(state, selectorName, args) {
		return getResolutionState(state, selectorName, args)?.status === "resolving";
	}
	/**
	* Returns the list of the cached resolvers.
	*
	* @param state Data state.
	*
	* @return Resolvers mapped by args and selectorName.
	*/
	function getCachedResolvers(state) {
		return state;
	}
	/**
	* Whether the store has any currently resolving selectors.
	*
	* @param state Data state.
	*
	* @return True if one or more selectors are resolving, false otherwise.
	*/
	function hasResolvingSelectors(state) {
		return Object.values(state).some((selectorState) => Array.from(selectorState._map.values()).some((resolution) => resolution[1]?.status === "resolving"));
	}
	/**
	* Retrieves the total number of selectors, grouped per status.
	*
	* @param state Data state.
	*
	* @return Object, containing selector totals by status.
	*/
	const countSelectorsByStatus = createSelector((state) => {
		const selectorsByStatus = {};
		Object.values(state).forEach((selectorState) => Array.from(selectorState._map.values()).forEach((resolution) => {
			const currentStatus = resolution[1]?.status ?? "error";
			if (!selectorsByStatus[currentStatus]) selectorsByStatus[currentStatus] = 0;
			selectorsByStatus[currentStatus]++;
		}));
		return selectorsByStatus;
	}, (state) => [state]);

// packages/data/build-module/redux-store/metadata/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		failResolution: () => failResolution,
		failResolutions: () => failResolutions,
		finishResolution: () => finishResolution,
		finishResolutions: () => finishResolutions,
		invalidateResolution: () => invalidateResolution,
		invalidateResolutionForStore: () => invalidateResolutionForStore,
		invalidateResolutionForStoreSelector: () => invalidateResolutionForStoreSelector,
		startResolution: () => startResolution,
		startResolutions: () => startResolutions
	}, 1);
	/**
	* Returns an action object used in signalling that selector resolution has
	* started.
	*
	* @param selectorName Name of selector for which resolver triggered.
	* @param args         Arguments to associate for uniqueness.
	*
	* @return Action object.
	*/
	function startResolution(selectorName, args) {
		return {
			type: "START_RESOLUTION",
			selectorName,
			args
		};
	}
	/**
	* Returns an action object used in signalling that selector resolution has
	* completed.
	*
	* @param selectorName Name of selector for which resolver triggered.
	* @param args         Arguments to associate for uniqueness.
	*
	* @return Action object.
	*/
	function finishResolution(selectorName, args) {
		return {
			type: "FINISH_RESOLUTION",
			selectorName,
			args
		};
	}
	/**
	* Returns an action object used in signalling that selector resolution has
	* failed.
	*
	* @param selectorName Name of selector for which resolver triggered.
	* @param args         Arguments to associate for uniqueness.
	* @param error        The error that caused the failure.
	*
	* @return Action object.
	*/
	function failResolution(selectorName, args, error) {
		return {
			type: "FAIL_RESOLUTION",
			selectorName,
			args,
			error
		};
	}
	/**
	* Returns an action object used in signalling that a batch of selector resolutions has
	* started.
	*
	* @param selectorName Name of selector for which resolver triggered.
	* @param args         Array of arguments to associate for uniqueness, each item
	*                     is associated to a resolution.
	*
	* @return Action object.
	*/
	function startResolutions(selectorName, args) {
		return {
			type: "START_RESOLUTIONS",
			selectorName,
			args
		};
	}
	/**
	* Returns an action object used in signalling that a batch of selector resolutions has
	* completed.
	*
	* @param selectorName Name of selector for which resolver triggered.
	* @param args         Array of arguments to associate for uniqueness, each item
	*                     is associated to a resolution.
	*
	* @return Action object.
	*/
	function finishResolutions(selectorName, args) {
		return {
			type: "FINISH_RESOLUTIONS",
			selectorName,
			args
		};
	}
	/**
	* Returns an action object used in signalling that a batch of selector resolutions has
	* completed and at least one of them has failed.
	*
	* @param selectorName Name of selector for which resolver triggered.
	* @param args         Array of arguments to associate for uniqueness, each item
	*                     is associated to a resolution.
	* @param errors       Array of errors to associate for uniqueness, each item
	*                     is associated to a resolution.
	* @return Action object.
	*/
	function failResolutions(selectorName, args, errors) {
		return {
			type: "FAIL_RESOLUTIONS",
			selectorName,
			args,
			errors
		};
	}
	/**
	* Returns an action object used in signalling that we should invalidate the resolution cache.
	*
	* @param selectorName Name of selector for which resolver should be invalidated.
	* @param args         Arguments to associate for uniqueness.
	*
	* @return Action object.
	*/
	function invalidateResolution(selectorName, args) {
		return {
			type: "INVALIDATE_RESOLUTION",
			selectorName,
			args
		};
	}
	/**
	* Returns an action object used in signalling that the resolution
	* should be invalidated.
	*
	* @return Action object.
	*/
	function invalidateResolutionForStore() {
		return { type: "INVALIDATE_RESOLUTION_FOR_STORE" };
	}
	/**
	* Returns an action object used in signalling that the resolution cache for a
	* given selectorName should be invalidated.
	*
	* @param selectorName Name of selector for which all resolvers should
	*                     be invalidated.
	*
	* @return Action object.
	*/
	function invalidateResolutionForStoreSelector(selectorName) {
		return {
			type: "INVALIDATE_RESOLUTION_FOR_STORE_SELECTOR",
			selectorName
		};
	}

// packages/data/build-module/redux-store/index.mjs
	const trimUndefinedValues = (array) => {
		const result = [...array];
		for (let i = result.length - 1; i >= 0; i--) if (result[i] === void 0) result.splice(i, 1);
		return result;
	};
	/**
	* Creates a new object with the same keys, but with `callback()` called as
	* a transformer function on each of the values.
	*
	* @param obj      The object to transform.
	* @param callback The function to transform each object value.
	* @return Transformed object.
	*/
	const mapValues = (obj, callback) => Object.fromEntries(Object.entries(obj ?? {}).map(([key, value]) => [key, callback(value, key)]));
	const devToolsReplacer = (_key, state) => {
		if (state instanceof Map) return Object.fromEntries(state);
		if (typeof window !== "undefined" && state instanceof window.HTMLElement) return null;
		return state;
	};
	/**
	* Create a cache to track whether resolvers started running or not.
	*
	* @return Resolvers Cache.
	*/
	function createResolversCache() {
		const cache = {};
		return {
			isRunning(selectorName, args) {
				return !!(cache[selectorName] && cache[selectorName].get(trimUndefinedValues(args)));
			},
			clear(selectorName, args) {
				if (cache[selectorName]) cache[selectorName].delete(trimUndefinedValues(args));
			},
			markAsRunning(selectorName, args) {
				if (!cache[selectorName]) cache[selectorName] = new import_equivalent_key_map.default();
				cache[selectorName].set(trimUndefinedValues(args), true);
			}
		};
	}
	function createBindingCache(getItem, bindItem) {
		const cache = /* @__PURE__ */ new WeakMap();
		return { get(itemName) {
			const item = getItem(itemName);
			if (!item) return null;
			let boundItem = cache.get(item);
			if (!boundItem) {
				boundItem = bindItem(item, itemName);
				cache.set(item, boundItem);
			}
			return boundItem;
		} };
	}
	function createPrivateProxy(publicItems, privateItems) {
		return new Proxy(publicItems, { get: (target, itemName) => privateItems.get(itemName) || Reflect.get(target, itemName) });
	}
	/**
	* Creates a data store descriptor for the provided Redux store configuration containing
	* properties describing reducer, actions, selectors, controls and resolvers.
	*
	* @example
	* ```js
	* import { createReduxStore } from '@wordpress/data';
	*
	* const store = createReduxStore( 'demo', {
	*     reducer: ( state = 'OK' ) => state,
	*     selectors: {
	*         getValue: ( state ) => state,
	*     },
	* } );
	* ```
	*
	* @param key     Unique namespace identifier.
	* @param options Registered store options, with properties
	*                describing reducer, actions, selectors,
	*                and resolvers.
	*
	* @return Store Object.
	*/
	function createReduxStore(key, options) {
		const privateActions = {};
		const privateSelectors = {};
		const privateRegistrationFunctions = {
			privateActions,
			registerPrivateActions: (actions) => {
				Object.assign(privateActions, actions);
			},
			privateSelectors,
			registerPrivateSelectors: (selectors) => {
				Object.assign(privateSelectors, selectors);
			}
		};
		const storeDescriptor = {
			name: key,
			instantiate: (registry) => {
				/**
				* Stores listener functions registered with `subscribe()`.
				*
				* When functions register to listen to store changes with
				* `subscribe()` they get added here. Although Redux offers
				* its own `subscribe()` function directly, by wrapping the
				* subscription in this store instance it's possible to
				* optimize checking if the state has changed before calling
				* each listener.
				*/
				const listeners = /* @__PURE__ */ new Set();
				const reducer = options.reducer;
				const store = instantiateReduxStore(key, options, registry, {
					registry,
					get dispatch() {
						return thunkDispatch;
					},
					get select() {
						return thunkSelect;
					},
					get resolveSelect() {
						return resolveSelectors;
					}
				});
				lock(store, privateRegistrationFunctions);
				const resolversCache = createResolversCache();
				function bindAction(action) {
					return (...args) => Promise.resolve(store.dispatch(action(...args)));
				}
				const actions = {
					...mapValues(actions_exports, bindAction),
					...mapValues(options.actions, bindAction)
				};
				const allActions = createPrivateProxy(actions, createBindingCache((name) => privateActions[name], bindAction));
				const thunkDispatch = new Proxy((action) => store.dispatch(action), { get: (_target, name) => allActions[name] });
				lock(actions, allActions);
				const resolvers = options.resolvers ? mapValues(options.resolvers, mapResolver) : {};
				function bindSelector(selector, selectorName) {
					if (selector.isRegistrySelector) selector.registry = registry;
					const boundSelector = (...args) => {
						args = normalize(selector, args);
						const state = store.__unstableOriginalGetState();
						if (selector.isRegistrySelector) selector.registry = registry;
						return selector(state.root, ...args);
					};
					boundSelector.normalizeArgs = getNormalizeArgs(selector);
					const resolver = resolvers[selectorName];
					if (!resolver) {
						boundSelector.hasResolver = false;
						return boundSelector;
					}
					return mapSelectorWithResolver(boundSelector, selectorName, resolver, store, resolversCache, boundMetadataSelectors);
				}
				function bindMetadataSelector(metaDataSelector) {
					const boundSelector = (selectorName, selectorArgs, ...args) => {
						if (selectorName) {
							const targetSelector = options.selectors?.[selectorName];
							if (targetSelector) selectorArgs = normalize(targetSelector, selectorArgs);
							const resolver = resolvers[selectorName];
							if (resolver && selectorArgs) selectorArgs = normalizeResolutionArgs(resolver, selectorArgs);
						}
						return metaDataSelector(store.__unstableOriginalGetState().metadata, selectorName, selectorArgs, ...args);
					};
					boundSelector.hasResolver = false;
					return boundSelector;
				}
				const boundMetadataSelectors = mapValues(selectors_exports, bindMetadataSelector);
				const boundSelectors = mapValues(options.selectors, bindSelector);
				const selectors = {
					...boundMetadataSelectors,
					...boundSelectors
				};
				const boundPrivateSelectors = createBindingCache((name) => privateSelectors[name], bindSelector);
				const allSelectors = createPrivateProxy(selectors, boundPrivateSelectors);
				for (const selectorName of Object.keys(privateSelectors)) boundPrivateSelectors.get(selectorName);
				const thunkSelect = new Proxy((selector) => selector(store.__unstableOriginalGetState()), { get: (_target, name) => allSelectors[name] });
				lock(selectors, allSelectors);
				const bindResolveSelector = mapResolveSelector(store, resolvers, boundMetadataSelectors);
				const resolveSelectors = mapValues(boundSelectors, bindResolveSelector);
				const allResolveSelectors = createPrivateProxy(resolveSelectors, createBindingCache((name) => boundPrivateSelectors.get(name), bindResolveSelector));
				lock(resolveSelectors, allResolveSelectors);
				const bindSuspendSelector = mapSuspendSelector(store, boundMetadataSelectors);
				const suspendSelectors = {
					...boundMetadataSelectors,
					...mapValues(boundSelectors, bindSuspendSelector)
				};
				const allSuspendSelectors = createPrivateProxy(suspendSelectors, createBindingCache((name) => boundPrivateSelectors.get(name), bindSuspendSelector));
				lock(suspendSelectors, allSuspendSelectors);
				const getSelectors = () => selectors;
				const getActions = () => actions;
				const getResolveSelectors = () => resolveSelectors;
				const getSuspendSelectors = () => suspendSelectors;
				store.__unstableOriginalGetState = store.getState;
				store.getState = () => store.__unstableOriginalGetState().root;
				const subscribe = (listener) => {
					listeners.add(listener);
					return () => listeners.delete(listener);
				};
				let lastState = store.__unstableOriginalGetState();
				store.subscribe(() => {
					const state = store.__unstableOriginalGetState();
					const hasChanged = state !== lastState;
					lastState = state;
					if (hasChanged) for (const listener of listeners) listener();
				});
				return {
					reducer,
					store,
					actions,
					selectors,
					resolvers,
					getSelectors,
					getResolveSelectors,
					getSuspendSelectors,
					getActions,
					subscribe
				};
			}
		};
		lock(storeDescriptor, privateRegistrationFunctions);
		return storeDescriptor;
	}
	/**
	* Creates a redux store for a namespace.
	*
	* @param key       Unique namespace identifier.
	* @param options   Registered store options, with properties
	*                  describing reducer, actions, selectors,
	*                  and resolvers.
	* @param registry  Registry reference.
	* @param thunkArgs Argument object for the thunk middleware.
	* @return Newly created redux store.
	*/
	function instantiateReduxStore(key, options, registry, thunkArgs) {
		const controls = {
			...options.controls,
			...builtinControls
		};
		const normalizedControls = mapValues(controls, (control) => control.isRegistryControl ? control(registry) : control);
		const middlewares = [
			createResolversCacheMiddleware(registry, key),
			promiseMiddleware,
			(0, _wordpress_redux_routine.default)(normalizedControls),
			createThunkMiddleware(thunkArgs)
		];
		const enhancers = [applyMiddleware(...middlewares)];
		if (typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__) enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__({
			name: key,
			instanceId: key,
			serialize: { replacer: devToolsReplacer }
		}));
		const { reducer, initialState } = options;
		const enhancedReducer = combineReducers$1({
			metadata: isResolved,
			root: reducer
		});
		return createStore(enhancedReducer, { root: initialState }, (0, _wordpress_compose.compose)(...enhancers));
	}
	/**
	* Maps selectors to functions that return a resolution promise for them.
	*
	* @param store                  The redux store the selectors are bound to.
	* @param resolvers              The normalized resolvers for the store.
	* @param boundMetadataSelectors The bound metadata selectors.
	*
	* @return Function that maps selectors to resolvers.
	*/
	function mapResolveSelector(store, resolvers, boundMetadataSelectors) {
		return (selector, selectorName) => {
			if (!selector.hasResolver) return async (...args) => selector(...args);
			return (...args) => new Promise((resolve, reject) => {
				const resolver = resolvers[selectorName];
				const resolutionArgs = normalizeResolutionArgs(resolver, normalize(selector, args));
				const hasFinished = () => {
					return boundMetadataSelectors.hasFinishedResolution(selectorName, args) || typeof resolver.isFulfilled === "function" && resolver.isFulfilled(store.getState(), ...resolutionArgs);
				};
				const finalize = (result) => {
					if (boundMetadataSelectors.hasResolutionFailed(selectorName, args)) reject(boundMetadataSelectors.getResolutionError(selectorName, args));
					else resolve(result);
				};
				const getResult = () => selector(...args);
				const result = getResult();
				if (hasFinished()) return finalize(result);
				const unsubscribe = store.subscribe(() => {
					if (hasFinished()) {
						unsubscribe();
						finalize(getResult());
					}
				});
			});
		};
	}
	/**
	* Maps selectors to functions that throw a suspense promise if not yet resolved.
	*
	* @param store                  The redux store the selectors select from.
	* @param boundMetadataSelectors The bound metadata selectors.
	*
	* @return Function that maps selectors to their suspending versions.
	*/
	function mapSuspendSelector(store, boundMetadataSelectors) {
		return (selector, selectorName) => {
			if (!selector.hasResolver) return selector;
			return (...args) => {
				const result = selector(...args);
				if (boundMetadataSelectors.hasFinishedResolution(selectorName, args)) {
					if (boundMetadataSelectors.hasResolutionFailed(selectorName, args)) throw boundMetadataSelectors.getResolutionError(selectorName, args);
					return result;
				}
				throw new Promise((resolve) => {
					const unsubscribe = store.subscribe(() => {
						if (boundMetadataSelectors.hasFinishedResolution(selectorName, args)) {
							resolve();
							unsubscribe();
						}
					});
				});
			};
		};
	}
	/**
	* Convert a resolver to a normalized form, an object with `fulfill` method and
	* optional methods like `isFulfilled`.
	*
	* @param resolver Resolver to convert
	*/
	function mapResolver(resolver) {
		if (resolver.fulfill) return resolver;
		return {
			...resolver,
			fulfill: resolver
		};
	}
	/**
	* Returns a selector with a matched resolver.
	* Resolvers are side effects invoked once per argument set of a given selector call,
	* used in ensuring that the data needs for the selector are satisfied.
	*
	* @param selector               The selector function to be bound.
	* @param selectorName           The selector name.
	* @param resolver               Resolver to call.
	* @param store                  The redux store to which the resolvers should be mapped.
	* @param resolversCache         Resolvers Cache.
	* @param boundMetadataSelectors The bound metadata selectors.
	*/
	function mapSelectorWithResolver(selector, selectorName, resolver, store, resolversCache, boundMetadataSelectors) {
		function fulfillSelector(selectorArgs) {
			const args = normalizeResolutionArgs(resolver, selectorArgs);
			if (resolversCache.isRunning(selectorName, args) || boundMetadataSelectors.hasStartedResolution(selectorName, selectorArgs) || typeof resolver.isFulfilled === "function" && resolver.isFulfilled(store.getState(), ...args)) return;
			resolversCache.markAsRunning(selectorName, args);
			setTimeout(async () => {
				resolversCache.clear(selectorName, args);
				store.dispatch(startResolution(selectorName, args));
				try {
					const action = resolver.fulfill(...args);
					if (action) await store.dispatch(action);
					store.dispatch(finishResolution(selectorName, args));
				} catch (error) {
					store.dispatch(failResolution(selectorName, args, error));
				}
			}, 0);
		}
		const selectorResolver = (...args) => {
			args = normalize(selector, args);
			fulfillSelector(args);
			return selector(...args);
		};
		selectorResolver.hasResolver = true;
		selectorResolver.normalizeArgs = selector.normalizeArgs;
		return selectorResolver;
	}
	/**
	* Returns the selector's normalization method, falling back to the legacy
	* `__unstableNormalizeArgs` property.
	*
	* @param selector The selector potentially with a normalization method property.
	* @return The normalization method, if any.
	*/
	function getNormalizeArgs(selector) {
		return selector.normalizeArgs ?? selector.__unstableNormalizeArgs;
	}
	/**
	* Applies selector's normalization function to the given arguments
	* if it exists.
	*
	* @param selector The selector potentially with a normalization method property.
	* @param args     selector arguments to normalize.
	* @return Potentially normalized arguments.
	*/
	function normalize(selector, args) {
		const normalizeArgs = getNormalizeArgs(selector);
		if (typeof normalizeArgs === "function" && args?.length) return normalizeArgs(args);
		return args;
	}
	/**
	* Maps selector arguments to the key their resolution is cached under, using
	* the resolver's `getResolutionArgs` if it has one. Calls that map to the same
	* key share a single resolver run.
	*
	* Not idempotent: the result can have fewer arguments than the input, so call
	* this once, on args that have already been through `normalize`.
	*
	* @param resolver The resolver, which may define `getResolutionArgs`.
	* @param args     Normalized selector arguments.
	* @return The cache key arguments.
	*/
	function normalizeResolutionArgs(resolver, args) {
		if (typeof resolver.getResolutionArgs === "function") return resolver.getResolutionArgs(...args);
		return args;
	}

// packages/data/build-module/store/index.mjs
	const coreDataStore = {
		name: "core/data",
		instantiate(registry) {
			const getCoreDataSelector = (selectorName) => (key, ...args) => {
				return registry.select(key)[selectorName](...args);
			};
			const getCoreDataAction = (actionName) => (key, ...args) => {
				return registry.dispatch(key)[actionName](...args);
			};
			return {
				getSelectors() {
					return Object.fromEntries([
						"getIsResolving",
						"hasStartedResolution",
						"hasFinishedResolution",
						"isResolving",
						"getCachedResolvers"
					].map((selectorName) => [selectorName, getCoreDataSelector(selectorName)]));
				},
				getActions() {
					return Object.fromEntries([
						"startResolution",
						"finishResolution",
						"invalidateResolution",
						"invalidateResolutionForStore",
						"invalidateResolutionForStoreSelector"
					].map((actionName) => [actionName, getCoreDataAction(actionName)]));
				},
				subscribe() {
					return () => () => {};
				}
			};
		}
	};

// packages/data/build-module/utils/emitter.mjs
/**
	* Create an event emitter.
	*
	* @return The event emitter.
	*/
	function createEmitter() {
		let isPaused = false;
		let isPending = false;
		const listeners = /* @__PURE__ */ new Set();
		let clonedListeners = null;
		const notifyListeners = () => {
			clonedListeners ??= Array.from(listeners);
			const currentListeners = clonedListeners;
			for (let i = 0; i < currentListeners.length; i++) currentListeners[i]();
		};
		return {
			get isPaused() {
				return isPaused;
			},
			subscribe(listener) {
				listeners.add(listener);
				clonedListeners = null;
				return () => {
					listeners.delete(listener);
					clonedListeners = null;
				};
			},
			pause() {
				isPaused = true;
			},
			resume() {
				isPaused = false;
				if (isPending) {
					isPending = false;
					notifyListeners();
				}
			},
			emit() {
				if (isPaused) {
					isPending = true;
					return;
				}
				notifyListeners();
			}
		};
	}

// packages/data/build-module/registry.mjs
	function getStoreName(storeNameOrDescriptor) {
		return typeof storeNameOrDescriptor === "string" ? storeNameOrDescriptor : storeNameOrDescriptor.name;
	}
	/**
	* Creates a new store registry, given an optional object of initial store
	* configurations.
	*
	* @param storeConfigs Initial store configurations.
	* @param parent       Parent registry.
	*
	* @return Data registry.
	*/
	function createRegistry(storeConfigs = {}, parent = null) {
		const stores = {};
		const emitter = createEmitter();
		let listeningStores = null;
		const pendingListeners = /* @__PURE__ */ new Map();
		/**
		* Global listener called for each store's update.
		*/
		function globalListener() {
			emitter.emit();
		}
		/**
		* Parks a listener that subscribed to a store that is not registered yet.
		* `connectPendingListeners` attaches it to the store once it's registered.
		*
		* @param storeName Store name.
		* @param listener  Listener function.
		*
		* @return Unsubscribe function.
		*/
		function subscribePending(storeName, listener) {
			const pending = { listener };
			let listeners = pendingListeners.get(storeName);
			if (!listeners) {
				listeners = /* @__PURE__ */ new Set();
				pendingListeners.set(storeName, listeners);
			}
			listeners.add(pending);
			return () => {
				pending.unsubscribe?.();
				const stillPending = pendingListeners.get(storeName);
				if (stillPending) {
					stillPending.delete(pending);
					if (stillPending.size === 0) pendingListeners.delete(storeName);
				}
			};
		}
		/**
		* Attaches the listeners that subscribed to a store before it existed to the
		* store that has just been registered.
		*
		* @param name  Store name.
		* @param store The newly registered store.
		*/
		function connectPendingListeners(name, store) {
			const listeners = pendingListeners.get(name);
			if (!listeners) return;
			pendingListeners.delete(name);
			for (const pending of listeners) pending.unsubscribe = store.subscribe(pending.listener);
		}
		/**
		* Subscribe to changes to any data, either in all stores in registry, or
		* in one specific store.
		*
		* @param listener              Listener function.
		* @param storeNameOrDescriptor Optional store name.
		*
		* @return Unsubscribe function.
		*/
		const subscribe = (listener, storeNameOrDescriptor) => {
			if (!storeNameOrDescriptor) return emitter.subscribe(listener);
			const storeName = getStoreName(storeNameOrDescriptor);
			const store = stores[storeName];
			if (store) return store.subscribe(listener);
			if (!parent) return subscribePending(storeName, listener);
			return parent.subscribe(listener, storeNameOrDescriptor);
		};
		/**
		* Calls a selector given the current state and extra arguments.
		*
		* @param storeNameOrDescriptor Unique namespace identifier for the store
		*                              or the store descriptor.
		*
		* @return The selector's returned value.
		*/
		function select(storeNameOrDescriptor) {
			const storeName = getStoreName(storeNameOrDescriptor);
			listeningStores?.add(storeName);
			const store = stores[storeName];
			if (store) return store.getSelectors();
			return parent?.select(storeName);
		}
		function __unstableMarkListeningStores(callback, ref) {
			listeningStores = /* @__PURE__ */ new Set();
			try {
				return callback.call(this);
			} finally {
				ref.current = Array.from(listeningStores);
				listeningStores = null;
			}
		}
		/**
		* Given a store descriptor, returns an object containing the store's selectors pre-bound to
		* state so that you only need to supply additional arguments, and modified so that they return
		* promises that resolve to their eventual values, after any resolvers have ran.
		*
		* @param storeNameOrDescriptor The store descriptor. The legacy calling
		*                              convention of passing the store name is
		*                              also supported.
		*
		* @return Each key of the object matches the name of a selector.
		*/
		function resolveSelect(storeNameOrDescriptor) {
			const storeName = getStoreName(storeNameOrDescriptor);
			listeningStores?.add(storeName);
			const store = stores[storeName];
			if (store) return store.getResolveSelectors();
			return parent && parent.resolveSelect(storeName);
		}
		/**
		* Given a store descriptor, returns an object containing the store's selectors pre-bound to
		* state so that you only need to supply additional arguments, and modified so that they throw
		* promises in case the selector is not resolved yet.
		*
		* @param storeNameOrDescriptor The store descriptor. The legacy calling
		*                              convention of passing the store name is
		*                              also supported.
		*
		* @return Object containing the store's suspense-wrapped selectors.
		*/
		function suspendSelect(storeNameOrDescriptor) {
			const storeName = getStoreName(storeNameOrDescriptor);
			listeningStores?.add(storeName);
			const store = stores[storeName];
			if (store) return store.getSuspendSelectors();
			return parent && parent.suspendSelect(storeName);
		}
		/**
		* Returns the available actions for a part of the state.
		*
		* @param storeNameOrDescriptor Unique namespace identifier for the store
		*                              or the store descriptor.
		*
		* @return The action's returned value.
		*/
		function dispatch(storeNameOrDescriptor) {
			const storeName = getStoreName(storeNameOrDescriptor);
			const store = stores[storeName];
			if (store) return store.getActions();
			return parent && parent.dispatch(storeName);
		}
		function withPlugins(attributes) {
			return Object.fromEntries(Object.entries(attributes).map(([key, attribute]) => {
				if (typeof attribute !== "function") return [key, attribute];
				return [key, (...args) => {
					return registry[key](...args);
				}];
			}));
		}
		/**
		* Registers a store instance.
		*
		* @param name            Store registry name.
		* @param createStoreFunc Function that creates a store object (getSelectors, getActions, subscribe).
		*/
		function registerStoreInstance(name, createStoreFunc) {
			if (stores[name]) {
				console.error("Store \"" + name + "\" is already registered.");
				return stores[name];
			}
			const store = createStoreFunc();
			if (typeof store.getSelectors !== "function") throw new TypeError("store.getSelectors must be a function");
			if (typeof store.getActions !== "function") throw new TypeError("store.getActions must be a function");
			if (typeof store.subscribe !== "function") throw new TypeError("store.subscribe must be a function");
			store.emitter = createEmitter();
			store.subscribe(() => store.emitter.emit());
			store.subscribe = (listener) => store.emitter.subscribe(listener);
			stores[name] = store;
			store.subscribe(globalListener);
			connectPendingListeners(name, store);
			if (parent) try {
				unlock(store.store).registerPrivateActions(unlock(parent).privateActionsOf(name));
				unlock(store.store).registerPrivateSelectors(unlock(parent).privateSelectorsOf(name));
			} catch {}
			return store;
		}
		/**
		* Registers a new store given a store descriptor.
		*
		* @param store Store descriptor.
		*/
		function register(store) {
			registerStoreInstance(store.name, () => store.instantiate(registry));
		}
		function registerGenericStore(name, store) {
			(0, _wordpress_deprecated.default)("wp.data.registerGenericStore", {
				since: "5.9",
				alternative: "wp.data.register( storeDescriptor )"
			});
			registerStoreInstance(name, () => store);
		}
		/**
		* Registers a standard `@wordpress/data` store.
		*
		* @param storeName Unique namespace identifier.
		* @param options   Store description (reducer, actions, selectors, resolvers).
		*
		* @return Registered store object.
		*/
		function registerStore(storeName, options) {
			if (!options.reducer) throw new TypeError("Must specify store reducer");
			return registerStoreInstance(storeName, () => createReduxStore(storeName, options).instantiate(registry)).store;
		}
		function batch(callback) {
			if (emitter.isPaused) {
				callback();
				return;
			}
			emitter.pause();
			Object.values(stores).forEach((store) => store.emitter.pause());
			try {
				callback();
			} finally {
				emitter.resume();
				Object.values(stores).forEach((store) => store.emitter.resume());
			}
		}
		let registry = {
			batch,
			stores,
			namespaces: stores,
			subscribe,
			select,
			resolveSelect,
			suspendSelect,
			dispatch,
			use,
			register,
			registerGenericStore,
			registerStore,
			__unstableMarkListeningStores
		};
		function use(plugin, options) {
			if (!plugin) return;
			registry = {
				...registry,
				...plugin(registry, options)
			};
			return registry;
		}
		registry.register(coreDataStore);
		for (const [name, config] of Object.entries(storeConfigs)) registry.register(createReduxStore(name, config));
		if (parent) parent.subscribe(globalListener);
		const registryWithPlugins = withPlugins(registry);
		lock(registryWithPlugins, {
			privateActionsOf: (name) => {
				try {
					return unlock(stores[name].store).privateActions;
				} catch {
					return {};
				}
			},
			privateSelectorsOf: (name) => {
				try {
					return unlock(stores[name].store).privateSelectors;
				} catch {
					return {};
				}
			}
		});
		return registryWithPlugins;
	}

// packages/data/build-module/default-registry.mjs
	const defaultRegistry = createRegistry();

// node_modules/.store/is-plain-object@5.1.0-5G_-lUnpSwJHYfRbkIxLrw/node_modules/is-plain-object/dist/is-plain-object.mjs
/*!
	* is-plain-object <https://github.com/jonschlinkert/is-plain-object>
	*
	* Copyright (c) 2014-2017, Jon Schlinkert.
	* Released under the MIT License.
	*/
	function isObject(o) {
		return Object.prototype.toString.call(o) === "[object Object]";
	}
	function isPlainObject(o) {
		var ctor, prot;
		if (isObject(o) === false) return false;
		ctor = o.constructor;
		if (ctor === void 0) return true;
		prot = ctor.prototype;
		if (isObject(prot) === false) return false;
		if (prot.hasOwnProperty("isPrototypeOf") === false) return false;
		return true;
	}

// node_modules/.store/deepmerge@4.3.1-130J0Lhhc9LM1JWY-5q3ww/node_modules/deepmerge/dist/cjs.js
	var require_cjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		var isMergeableObject = function isMergeableObject(value) {
			return isNonNullObject(value) && !isSpecial(value);
		};
		function isNonNullObject(value) {
			return !!value && typeof value === "object";
		}
		function isSpecial(value) {
			var stringValue = Object.prototype.toString.call(value);
			return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
		}
		var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for ? Symbol.for("react.element") : 60103;
		function isReactElement(value) {
			return value.$$typeof === REACT_ELEMENT_TYPE;
		}
		function emptyTarget(val) {
			return Array.isArray(val) ? [] : {};
		}
		function cloneUnlessOtherwiseSpecified(value, options) {
			return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
		}
		function defaultArrayMerge(target, source, options) {
			return target.concat(source).map(function(element) {
				return cloneUnlessOtherwiseSpecified(element, options);
			});
		}
		function getMergeFunction(key, options) {
			if (!options.customMerge) return deepmerge;
			var customMerge = options.customMerge(key);
			return typeof customMerge === "function" ? customMerge : deepmerge;
		}
		function getEnumerableOwnPropertySymbols(target) {
			return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
				return Object.propertyIsEnumerable.call(target, symbol);
			}) : [];
		}
		function getKeys(target) {
			return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
		}
		function propertyIsOnObject(object, property) {
			try {
				return property in object;
			} catch (_) {
				return false;
			}
		}
		function propertyIsUnsafe(target, key) {
			return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
		}
		function mergeObject(target, source, options) {
			var destination = {};
			if (options.isMergeableObject(target)) getKeys(target).forEach(function(key) {
				destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
			});
			getKeys(source).forEach(function(key) {
				if (propertyIsUnsafe(target, key)) return;
				if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
				else destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
			});
			return destination;
		}
		function deepmerge(target, source, options) {
			options = options || {};
			options.arrayMerge = options.arrayMerge || defaultArrayMerge;
			options.isMergeableObject = options.isMergeableObject || isMergeableObject;
			options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
			var sourceIsArray = Array.isArray(source);
			if (!(sourceIsArray === Array.isArray(target))) return cloneUnlessOtherwiseSpecified(source, options);
			else if (sourceIsArray) return options.arrayMerge(target, source, options);
			else return mergeObject(target, source, options);
		}
		deepmerge.all = function deepmergeAll(array, options) {
			if (!Array.isArray(array)) throw new Error("first argument should be an array");
			return array.reduce(function(prev, next) {
				return deepmerge(prev, next, options);
			}, {});
		};
		var deepmerge_1 = deepmerge;
		module.exports = deepmerge_1;
	}));

// packages/data/build-module/plugins/persistence/storage/object.mjs
var import_cjs = /* @__PURE__ */ __toESM(require_cjs(), 1);
	let objectStorage;
	const storage$1 = {
		getItem(key) {
			if (!objectStorage || !objectStorage[key]) return null;
			return objectStorage[key];
		},
		setItem(key, value) {
			if (!objectStorage) storage$1.clear();
			objectStorage[key] = String(value);
		},
		clear() {
			objectStorage = Object.create(null);
		}
	};

// packages/data/build-module/plugins/persistence/storage/default.mjs
	let storage;
	try {
		storage = window.localStorage;
		storage.setItem("__wpDataTestLocalStorage", "");
		storage.removeItem("__wpDataTestLocalStorage");
	} catch {
		storage = storage$1;
	}
	var default_default = storage;

// packages/data/build-module/plugins/persistence/index.mjs
/**
	* Default plugin storage.
	*/
	const DEFAULT_STORAGE = default_default;
	/**
	* Default plugin storage key.
	*/
	const DEFAULT_STORAGE_KEY = "WP_DATA";
	/**
	* Higher-order reducer which invokes the original reducer only if state is
	* inequal from that of the action's `nextState` property, otherwise returning
	* the original state reference.
	*
	* @param reducer Original reducer.
	*
	* @return Enhanced reducer.
	*/
	const withLazySameState = (reducer) => (state, action) => {
		if (action.nextState === state) return state;
		return reducer(state, action);
	};
	/**
	* Creates a persistence interface, exposing getter and setter methods (`get`
	* and `set` respectively).
	*
	* @param options Plugin options.
	*
	* @return Persistence interface.
	*/
	function createPersistenceInterface(options) {
		const { storage = DEFAULT_STORAGE, storageKey = DEFAULT_STORAGE_KEY } = options;
		let data;
		/**
		* Returns the persisted data as an object, defaulting to an empty object.
		*
		* @return Persisted data.
		*/
		function getData() {
			if (data === void 0) {
				const persisted = storage.getItem(storageKey);
				if (persisted === null) data = {};
				else try {
					data = JSON.parse(persisted);
				} catch {
					data = {};
				}
			}
			return data;
		}
		/**
		* Merges an updated reducer state into the persisted data.
		*
		* @param key   Key to update.
		* @param value Updated value.
		*/
		function setData(key, value) {
			data = {
				...data,
				[key]: value
			};
			storage.setItem(storageKey, JSON.stringify(data));
		}
		return {
			get: getData,
			set: setData
		};
	}
	/**
	* Data plugin to persist store state into a single storage key.
	*
	* @param registry      Data registry.
	* @param pluginOptions Plugin options.
	*
	* @return Data plugin.
	*/
	function persistencePlugin(registry, pluginOptions) {
		const persistence = createPersistenceInterface(pluginOptions);
		/**
		* Creates an enhanced store dispatch function, triggering the state of the
		* given store name to be persisted when changed.
		*
		* @param getState  Function which returns current state.
		* @param storeName Store name.
		* @param keys      Optional subset of keys to save.
		*
		* @return Enhanced dispatch function.
		*/
		function createPersistOnChange(getState, storeName, keys) {
			let getPersistedState;
			if (Array.isArray(keys)) {
				const reducers = keys.reduce((accumulator, key) => Object.assign(accumulator, { [key]: (state, action) => action.nextState[key] }), {});
				getPersistedState = withLazySameState(combineReducers(reducers));
			} else getPersistedState = (_state, action) => action.nextState;
			let lastState = getPersistedState(void 0, { nextState: getState() });
			return () => {
				const state = getPersistedState(lastState, { nextState: getState() });
				if (state !== lastState) {
					persistence.set(storeName, state);
					lastState = state;
				}
			};
		}
		return { registerStore(storeName, options) {
			if (!options.persist) return registry.registerStore(storeName, options);
			const persistedState = persistence.get()[storeName];
			if (persistedState !== void 0) {
				let initialState = options.reducer(options.initialState, { type: "@@WP/PERSISTENCE_RESTORE" });
				if (isPlainObject(initialState) && isPlainObject(persistedState)) initialState = (0, import_cjs.default)(initialState, persistedState, { isMergeableObject: isPlainObject });
				else initialState = persistedState;
				options = {
					...options,
					initialState
				};
			}
			const store = registry.registerStore(storeName, options);
			store.subscribe(createPersistOnChange(store.getState, storeName, options.persist));
			return store;
		} };
	}
	var persistence_default = Object.assign(persistencePlugin, { __unstableMigrate: () => {} });

// packages/data/build-module/plugins/index.mjs
	var plugins_exports = /* @__PURE__ */ __exportAll({ persistence: () => persistence_default }, 1);

// packages/data/build-module/components/registry-provider/context.mjs
	const Context$1 = (0, _wordpress_element.createContext)(defaultRegistry);
	Context$1.displayName = "RegistryProviderContext";
	const { Consumer, Provider } = Context$1;
	/**
	* A custom React context consumer exposing the provided `registry` to
	* children components. Used along with the RegistryProvider.
	*
	* You can read more about the React context API here:
	* https://react.dev/learn/passing-data-deeply-with-context#step-3-provide-the-context
	*
	* @example
	* ```js
	* import {
	*   RegistryProvider,
	*   RegistryConsumer,
	*   createRegistry
	* } from '@wordpress/data';
	*
	* const registry = createRegistry( {} );
	*
	* const App = ( { props } ) => {
	*   return <RegistryProvider value={ registry }>
	*     <div>Hello There</div>
	*     <RegistryConsumer>
	*       { ( registry ) => (
	*         <ComponentUsingRegistry
	*         		{ ...props }
	*         	  registry={ registry }
	*       ) }
	*     </RegistryConsumer>
	*   </RegistryProvider>
	* }
	* ```
	*/
	const RegistryConsumer = Consumer;

// packages/data/build-module/components/registry-provider/use-registry.mjs
/**
	* A custom React hook exposing the registry context for use.
	*
	* This exposes the `registry` value provided via the
	* <a href="#registryprovider">Registry Provider</a> to a component implementing
	* this hook.
	*
	* It acts similarly to the `useContext` React hook.
	*
	* Note: Generally speaking, `useRegistry` is a low level hook that in most cases
	* won't be needed for implementation. Most interactions with the `@wordpress/data`
	* API can be performed via the `useSelect` hook, or the `withSelect` and
	* `withDispatch` higher order components.
	*
	* @example
	* ```js
	* import {
	*   RegistryProvider,
	*   createRegistry,
	*   useRegistry,
	* } from '@wordpress/data';
	*
	* const registry = createRegistry( {} );
	*
	* const SomeChildUsingRegistry = ( props ) => {
	*   const registry = useRegistry();
	*   // ...logic implementing the registry in other react hooks.
	* };
	*
	*
	* const ParentProvidingRegistry = ( props ) => {
	*   return <RegistryProvider value={ registry }>
	*     <SomeChildUsingRegistry { ...props } />
	*   </RegistryProvider>
	* };
	* ```
	*
	* @return A custom React hook exposing the registry context value.
	*/
	function useRegistry() {
		return (0, _wordpress_element.useContext)(Context$1);
	}

// packages/data/build-module/components/async-mode-provider/context.mjs
	const Context = (0, _wordpress_element.createContext)(false);
	Context.displayName = "AsyncModeContext";
	/**
	* Context Provider Component used to switch the data module component rerendering
	* between Sync and Async modes.
	*
	* @example
	*
	* ```js
	* import { useSelect, AsyncModeProvider } from '@wordpress/data';
	* import { store as blockEditorStore } from '@wordpress/block-editor';
	*
	* function BlockCount() {
	*   const count = useSelect( ( select ) => {
	*     return select( blockEditorStore ).getBlockCount()
	*   }, [] );
	*
	*   return count;
	* }
	*
	* function App() {
	*   return (
	*     <AsyncModeProvider value={ true }>
	*       <BlockCount />
	*     </AsyncModeProvider>
	*   );
	* }
	* ```
	*
	* In this example, the BlockCount component is rerendered asynchronously.
	* It means if a more critical task is being performed (like typing in an input),
	* the rerendering is delayed until the browser becomes IDLE.
	* It is possible to nest multiple levels of AsyncModeProvider to fine-tune the rendering behavior.
	*
	* @param {boolean} props.value Enable Async Mode.
	*/
	var context_default = Context.Provider;

// packages/data/build-module/components/async-mode-provider/use-async-mode.mjs
	function useAsyncMode() {
		return (0, _wordpress_element.useContext)(Context);
	}

// packages/data/build-module/components/use-select/index.mjs
	const renderQueue = (0, _wordpress_priority_queue.createQueue)();
	function warnOnUnstableReference(a, b) {
		if (!a || !b) return;
		const keys = typeof a === "object" && typeof b === "object" ? Object.keys(a).filter((k) => a[k] !== b[k]) : [];
		console.warn("The `useSelect` hook returns different values when called with the same state and parameters.\nThis can lead to unnecessary re-renders and performance issues if not fixed.\n\nNon-equal value keys: %s\n\n", keys.join(", "));
	}
	const deferredBuckets = /* @__PURE__ */ new WeakMap();
	/**
	* Subscribe an async-mode listener to a store without adding it to the
	* store's own listener list. All async listeners of one store in one registry
	* share a single real subscription whose only synchronous work is scheduling a
	* flush. The flush runs at idle time and queues each listener under its own
	* context, so the render queue keeps coalescing per hook instance and
	* time-slicing between instances.
	*
	* @param registry  Registry.
	* @param storeName Store name.
	* @param listener  Listener record.
	*
	* @return Unsubscribe function.
	*/
	function subscribeDeferred(registry, storeName, listener) {
		let buckets = deferredBuckets.get(registry);
		if (!buckets) {
			buckets = /* @__PURE__ */ new Map();
			deferredBuckets.set(registry, buckets);
		}
		let addToBucket = buckets.get(storeName);
		if (!addToBucket) {
			const listeners = /* @__PURE__ */ new Set();
			const flush = () => {
				for (const { context, callback } of listeners) renderQueue.add(context, callback);
			};
			const unsubscribe = registry.subscribe(() => renderQueue.add(listeners, flush), storeName);
			addToBucket = (newListener) => {
				listeners.add(newListener);
				return () => {
					if (listeners.delete(newListener) && listeners.size === 0) {
						buckets.delete(storeName);
						renderQueue.cancel(listeners);
						unsubscribe();
					}
				};
			};
			buckets.set(storeName, addToBucket);
		}
		return addToBucket(listener);
	}
	function Store(registry, suspense) {
		const select = suspense ? registry.suspendSelect : registry.select;
		const queueContext = {};
		let lastMapSelect;
		let lastMapResult;
		let lastMapResultValid = false;
		let lastIsAsync;
		let subscriber;
		let didWarnUnstableReference;
		const storeStatesOnMount = /* @__PURE__ */ new Map();
		function getStoreState(name) {
			return registry.stores[name]?.store?.getState?.() ?? {};
		}
		const createSubscriber = (stores) => {
			const activeStores = [...stores];
			const activeSubscriptions = /* @__PURE__ */ new Set();
			function subscribe(listener) {
				if (lastMapResultValid) {
					for (const name of activeStores) if (storeStatesOnMount.get(name) !== getStoreState(name)) lastMapResultValid = false;
				}
				storeStatesOnMount.clear();
				const onStoreChange = () => {
					lastMapResultValid = false;
					listener();
				};
				function listenToStore(storeName) {
					if (lastIsAsync) return subscribeDeferred(registry, storeName, {
						context: queueContext,
						callback: onStoreChange
					});
					return registry.subscribe(onStoreChange, storeName);
				}
				const unsubs = /* @__PURE__ */ new Map();
				function subscribeStore(storeName) {
					unsubs.set(storeName, listenToStore(storeName));
				}
				function resubscribeStores() {
					for (const [storeName, unsub] of unsubs) {
						unsub?.();
						unsubs.set(storeName, listenToStore(storeName));
					}
				}
				for (const storeName of activeStores) subscribeStore(storeName);
				const subscription = {
					subscribeStore,
					resubscribeStores
				};
				activeSubscriptions.add(subscription);
				return () => {
					activeSubscriptions.delete(subscription);
					for (const unsub of unsubs.values()) unsub?.();
					renderQueue.cancel(queueContext);
				};
			}
			function updateStores(newStores) {
				for (const newStore of newStores) {
					if (activeStores.includes(newStore)) continue;
					activeStores.push(newStore);
					for (const subscription of activeSubscriptions) subscription.subscribeStore(newStore);
				}
			}
			function switchMode() {
				for (const subscription of activeSubscriptions) subscription.resubscribeStores();
			}
			return {
				subscribe,
				updateStores,
				switchMode
			};
		};
		return (mapSelect, isAsync) => {
			function updateValue() {
				if (lastMapResultValid && mapSelect === lastMapSelect) return;
				const listeningStores = { current: null };
				const mapResult = registry.__unstableMarkListeningStores(() => mapSelect(select, registry), listeningStores);
				if (!didWarnUnstableReference) {
					const secondMapResult = mapSelect(select, registry);
					if (!(0, _wordpress_is_shallow_equal.isShallowEqual)(mapResult, secondMapResult)) {
						warnOnUnstableReference(mapResult, secondMapResult);
						didWarnUnstableReference = true;
					}
				}
				if (!subscriber) {
					for (const name of listeningStores.current) storeStatesOnMount.set(name, getStoreState(name));
					subscriber = createSubscriber(listeningStores.current);
				} else subscriber.updateStores(listeningStores.current);
				if (!(0, _wordpress_is_shallow_equal.isShallowEqual)(lastMapResult, mapResult)) lastMapResult = mapResult;
				lastMapSelect = mapSelect;
				lastMapResultValid = true;
			}
			function getValue() {
				updateValue();
				return lastMapResult;
			}
			const wasAsync = lastIsAsync;
			lastIsAsync = isAsync;
			if (wasAsync && !isAsync) {
				lastMapResultValid = false;
				renderQueue.cancel(queueContext);
			}
			updateValue();
			if (wasAsync !== isAsync) subscriber.switchMode();
			return {
				subscribe: subscriber.subscribe,
				getValue
			};
		};
	}
	function _useStaticSelect(storeName) {
		return useRegistry().select(storeName);
	}
	function _useMappingSelect(suspense, mapSelect, deps) {
		const registry = useRegistry();
		const isAsync = useAsyncMode();
		const { subscribe, getValue } = (0, _wordpress_element.useMemo)(() => Store(registry, suspense), [registry, suspense])((0, _wordpress_element.useCallback)(mapSelect, deps), isAsync);
		const result = (0, _wordpress_element.useSyncExternalStore)(subscribe, getValue, getValue);
		(0, _wordpress_element.useDebugValue)(result);
		return result;
	}
	/**
	* Custom react hook for retrieving props from registered selectors.
	*
	* In general, this custom React hook follows the
	* [rules of hooks](https://react.dev/reference/rules/rules-of-hooks).
	*
	* @param mapSelect Function called on every state change. The returned value is
	*                  exposed to the component implementing this hook. The function
	*                  receives the `registry.select` method on the first argument
	*                  and the `registry` on the second argument.
	*                  When a store key is passed, all selectors for the store will be
	*                  returned. This is only meant for usage of these selectors in event
	*                  callbacks, not for data needed to create the element tree.
	* @param deps      If provided, this memoizes the mapSelect so the same `mapSelect` is
	*                  invoked on every state change unless the dependencies change.
	*
	* @example
	* ```js
	* import { useSelect } from '@wordpress/data';
	* import { store as myCustomStore } from 'my-custom-store';
	*
	* function HammerPriceDisplay( { currency } ) {
	*   const price = useSelect( ( select ) => {
	*     return select( myCustomStore ).getPrice( 'hammer', currency );
	*   }, [ currency ] );
	*   return new Intl.NumberFormat( 'en-US', {
	*     style: 'currency',
	*     currency,
	*   } ).format( price );
	* }
	*
	* // Rendered in the application:
	* // <HammerPriceDisplay currency="USD" />
	* ```
	*
	* In the above example, when `HammerPriceDisplay` is rendered into an
	* application, the price will be retrieved from the store state using the
	* `mapSelect` callback on `useSelect`. If the currency prop changes then
	* any price in the state for that currency is retrieved. If the currency prop
	* doesn't change and other props are passed in that do change, the price will
	* not change because the dependency is just the currency.
	*
	* When data is only used in an event callback, the data should not be retrieved
	* on render, so it may be useful to get the selectors function instead.
	*
	* **Don't use `useSelect` this way when calling the selectors in the render
	* function because your component won't re-render on a data change.**
	*
	* ```js
	* import { useSelect } from '@wordpress/data';
	* import { store as myCustomStore } from 'my-custom-store';
	*
	* function Paste( { children } ) {
	*   const { getSettings } = useSelect( myCustomStore );
	*   function onPaste() {
	*     // Do something with the settings.
	*     const settings = getSettings();
	*   }
	*   return <div onPaste={ onPaste }>{ children }</div>;
	* }
	* ```
	*
	* @return The selected data or store selectors.
	*/
	function useSelect(mapSelect, deps) {
		const staticSelectMode = typeof mapSelect !== "function";
		const staticSelectModeRef = (0, _wordpress_element.useRef)(staticSelectMode);
		if (staticSelectMode !== staticSelectModeRef.current) {
			const prevMode = staticSelectModeRef.current ? "static" : "mapping";
			throw new Error(`Switching useSelect from ${prevMode} to ${staticSelectMode ? "static" : "mapping"} is not allowed`);
		}
		return staticSelectMode ? _useStaticSelect(mapSelect) : _useMappingSelect(false, mapSelect, deps);
	}
	/**
	* A variant of the `useSelect` hook that has the same API, but is a compatible
	* Suspense-enabled data source.
	*
	* @param mapSelect Function called on every state change. The
	*                  returned value is exposed to the component
	*                  using this hook. The function receives the
	*                  `registry.suspendSelect` method as the first
	*                  argument and the `registry` as the second one.
	* @param deps      A dependency array used to memoize the `mapSelect`
	*                  so that the same `mapSelect` is invoked on every
	*                  state change unless the dependencies change.
	*
	* @throws A suspense Promise that is thrown if any of the called
	* selectors is in an unresolved state.
	*
	* @return Data object returned by the `mapSelect` function.
	*/
	function useSuspenseSelect(mapSelect, deps) {
		return _useMappingSelect(true, mapSelect, deps);
	}

// packages/data/build-module/components/with-select/index.mjs
/**
	* Higher-order component used to inject state-derived props using registered
	* selectors.
	*
	* @param mapSelectToProps Function called on every state change,
	*                         expected to return object of props to
	*                         merge with the component's own props.
	*
	* @example
	* ```js
	* import { withSelect } from '@wordpress/data';
	* import { store as myCustomStore } from 'my-custom-store';
	*
	* function PriceDisplay( { price, currency } ) {
	* 	return new Intl.NumberFormat( 'en-US', {
	* 		style: 'currency',
	* 		currency,
	* 	} ).format( price );
	* }
	*
	* const HammerPriceDisplay = withSelect( ( select, ownProps ) => {
	* 	const { getPrice } = select( myCustomStore );
	* 	const { currency } = ownProps;
	*
	* 	return {
	* 		price: getPrice( 'hammer', currency ),
	* 	};
	* } )( PriceDisplay );
	*
	* // Rendered in the application:
	* //
	* //  <HammerPriceDisplay currency="USD" />
	* ```
	* In the above example, when `HammerPriceDisplay` is rendered into an
	* application, it will pass the price into the underlying `PriceDisplay`
	* component and update automatically if the price of a hammer ever changes in
	* the store.
	*
	* @return Enhanced component with merged state data props.
	*/
	const withSelect = (mapSelectToProps) => (0, _wordpress_compose.createHigherOrderComponent)((WrappedComponent) => (0, _wordpress_element.memo)((0, _wordpress_element.forwardRef)(function WithSelect(ownProps, ref) {
		const mapSelect = (select, registry) => mapSelectToProps(select, ownProps, registry);
		const mergeProps = useSelect(mapSelect);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WrappedComponent, {
			ref,
			...ownProps,
			...mergeProps
		});
	})), "withSelect");

// packages/data/build-module/components/use-dispatch/use-dispatch.mjs
/**
	* A custom react hook returning the current registry dispatch actions creators.
	*
	* Note: The component using this hook must be within the context of a
	* RegistryProvider.
	*
	* @param storeNameOrDescriptor Optionally provide the name of the
	*                              store or its descriptor from which to
	*                              retrieve action creators. If not
	*                              provided, the registry.dispatch
	*                              function is returned instead.
	*
	* @example
	* This illustrates a pattern where you may need to retrieve dynamic data from
	* the server via the `useSelect` hook to use in combination with the dispatch
	* action.
	*
	* ```jsx
	* import { useCallback } from 'react';
	* import { useDispatch, useSelect } from '@wordpress/data';
	* import { store as myCustomStore } from 'my-custom-store';
	*
	* function Button( { onClick, children } ) {
	*   return <button type="button" onClick={ onClick }>{ children }</button>
	* }
	*
	* const SaleButton = ( { children } ) => {
	*   const { stockNumber } = useSelect(
	*     ( select ) => select( myCustomStore ).getStockNumber(),
	*     []
	*   );
	*   const { startSale } = useDispatch( myCustomStore );
	*   const onClick = useCallback( () => {
	*     const discountPercent = stockNumber > 50 ? 10: 20;
	*     startSale( discountPercent );
	*   }, [ stockNumber ] );
	*   return <Button onClick={ onClick }>{ children }</Button>
	* }
	*
	* // Rendered somewhere in the application:
	* //
	* // <SaleButton>Start Sale!</SaleButton>
	* ```
	*
	* @return The dispatch function or action creators for the store.
	*/
	const useDispatch = (storeNameOrDescriptor) => {
		const { dispatch } = useRegistry();
		return storeNameOrDescriptor === void 0 ? dispatch : dispatch(storeNameOrDescriptor);
	};

// packages/data/build-module/components/use-dispatch/use-dispatch-with-map.mjs
/**
	* Custom react hook for returning aggregate dispatch actions using the provided
	* dispatchMap.
	*
	* Currently this is an internal api only and is implemented by `withDispatch`
	*
	* @param dispatchMap Receives the `registry.dispatch` function as
	*                    the first argument and the `registry` object
	*                    as the second argument.  Should return an
	*                    object mapping props to functions.
	* @param deps        An array of dependencies for the hook.
	* @return An object mapping props to functions created by the passed
	*         in dispatchMap.
	*/
	const useDispatchWithMap = (dispatchMap, deps) => {
		const registry = useRegistry();
		const currentDispatchMapRef = (0, _wordpress_element.useRef)(dispatchMap);
		(0, _wordpress_compose.useIsomorphicLayoutEffect)(() => {
			currentDispatchMapRef.current = dispatchMap;
		});
		return (0, _wordpress_element.useMemo)(() => {
			const currentDispatchProps = currentDispatchMapRef.current(registry.dispatch, registry);
			return Object.fromEntries(Object.entries(currentDispatchProps).map(([propName, dispatcher]) => {
				if (typeof dispatcher !== "function") console.warn(`Property ${propName} returned from dispatchMap in useDispatchWithMap must be a function.`);
				return [propName, (...args) => currentDispatchMapRef.current(registry.dispatch, registry)[propName](...args)];
			}));
		}, [registry, ...deps]);
	};

// packages/data/build-module/components/with-dispatch/index.mjs
/**
	* Higher-order component used to add dispatch props using registered action
	* creators.
	*
	* @param mapDispatchToProps A function of returning an object of
	*                           prop names where value is a
	*                           dispatch-bound action creator, or a
	*                           function to be called with the
	*                           component's props and returning an
	*                           action creator.
	*
	* @example
	* ```jsx
	* function Button( { onClick, children } ) {
	*     return <button type="button" onClick={ onClick }>{ children }</button>;
	* }
	*
	* import { withDispatch } from '@wordpress/data';
	* import { store as myCustomStore } from 'my-custom-store';
	*
	* const SaleButton = withDispatch( ( dispatch, ownProps ) => {
	*     const { startSale } = dispatch( myCustomStore );
	*     const { discountPercent } = ownProps;
	*
	*     return {
	*         onClick() {
	*             startSale( discountPercent );
	*         },
	*     };
	* } )( Button );
	*
	* // Rendered in the application:
	* //
	* // <SaleButton discountPercent="20">Start Sale!</SaleButton>
	* ```
	*
	* @example
	* In the majority of cases, it will be sufficient to use only two first params
	* passed to `mapDispatchToProps` as illustrated in the previous example.
	* However, there might be some very advanced use cases where using the
	* `registry` object might be used as a tool to optimize the performance of
	* your component. Using `select` function from the registry might be useful
	* when you need to fetch some dynamic data from the store at the time when the
	* event is fired, but at the same time, you never use it to render your
	* component. In such scenario, you can avoid using the `withSelect` higher
	* order component to compute such prop, which might lead to unnecessary
	* re-renders of your component caused by its frequent value change.
	* Keep in mind, that `mapDispatchToProps` must return an object with functions
	* only.
	*
	* ```jsx
	* function Button( { onClick, children } ) {
	*     return <button type="button" onClick={ onClick }>{ children }</button>;
	* }
	*
	* import { withDispatch } from '@wordpress/data';
	* import { store as myCustomStore } from 'my-custom-store';
	*
	* const SaleButton = withDispatch( ( dispatch, ownProps, { select } ) => {
	*    // Stock number changes frequently.
	*    const { getStockNumber } = select( myCustomStore );
	*    const { startSale } = dispatch( myCustomStore );
	*    return {
	*        onClick() {
	*            const discountPercent = getStockNumber() > 50 ? 10 : 20;
	*            startSale( discountPercent );
	*        },
	*    };
	* } )( Button );
	*
	* // Rendered in the application:
	* //
	* //  <SaleButton>Start Sale!</SaleButton>
	* ```
	*
	* _Note:_ It is important that the `mapDispatchToProps` function always
	* returns an object with the same keys. For example, it should not contain
	* conditions under which a different value would be returned.
	*
	* @return Enhanced component with merged dispatcher props.
	*/
	const withDispatch = (mapDispatchToProps) => (0, _wordpress_compose.createHigherOrderComponent)((WrappedComponent) => (ownProps) => {
		const mapDispatch = (dispatch, registry) => mapDispatchToProps(dispatch, ownProps, registry);
		const dispatchProps = useDispatchWithMap(mapDispatch, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WrappedComponent, {
			...ownProps,
			...dispatchProps
		});
	}, "withDispatch");

// packages/data/build-module/components/with-registry/index.mjs
/**
	* Higher-order component which renders the original component with the current
	* registry context passed as its `registry` prop.
	*/
	const withRegistry = (0, _wordpress_compose.createHigherOrderComponent)((OriginalComponent) => (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RegistryConsumer, { children: (registry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OriginalComponent, {
		...props,
		registry
	}) }), "withRegistry");

// packages/data/build-module/dispatch.mjs
/**
	* Given a store descriptor, returns an object of the store's action creators.
	* Calling an action creator will cause it to be dispatched, updating the state value accordingly.
	*
	* Note: Action creators returned by the dispatch will return a promise when
	* they are called.
	*
	* Warning: This global `dispatch` function only works with the default registry.
	* It will not work with custom `RegistryProvider` or `BlockEditorProvider` contexts.
	* In React components, prefer the `useDispatch` hook instead, which is registry-aware.
	*
	* @param storeNameOrDescriptor The store descriptor. The legacy calling convention of passing
	*                              the store name is also supported.
	*
	* @example
	* ```js
	* import { dispatch } from '@wordpress/data';
	* import { store as myCustomStore } from 'my-custom-store';
	*
	* dispatch( myCustomStore ).setPrice( 'hammer', 9.75 );
	* ```
	* @return Object containing the action creators.
	*/
	function dispatch(storeNameOrDescriptor) {
		return defaultRegistry.dispatch(storeNameOrDescriptor);
	}

// packages/data/build-module/select.mjs
/**
	* Given a store descriptor, returns an object of the store's selectors.
	* The selector functions are been pre-bound to pass the current state automatically.
	* As a consumer, you need only pass arguments of the selector, if applicable.
	*
	* Warning: This global `select` function only works with the default registry.
	* It will not work with custom `RegistryProvider` or `BlockEditorProvider` contexts.
	* In React components, prefer the `useSelect` hook instead, which is registry-aware.
	*
	* @param storeNameOrDescriptor The store descriptor. The legacy calling convention
	*                              of passing the store name is also supported.
	*
	* @example
	* ```js
	* import { select } from '@wordpress/data';
	* import { store as myCustomStore } from 'my-custom-store';
	*
	* select( myCustomStore ).getPrice( 'hammer' );
	* ```
	*
	* @return Object containing the store's selectors.
	*/
	function select(storeNameOrDescriptor) {
		return defaultRegistry.select(storeNameOrDescriptor);
	}

// packages/data/build-module/index.mjs
/**
	* The combineReducers helper function turns an object whose values are different
	* reducing functions into a single reducing function you can pass to registerReducer.
	*
	* @type  {import('./types').combineReducers}
	* @param {Object} reducers An object whose values correspond to different reducing
	*                          functions that need to be combined into one.
	*
	* @example
	* ```js
	* import { combineReducers, createReduxStore, register } from '@wordpress/data';
	*
	* const prices = ( state = {}, action ) => {
	* 	return action.type === 'SET_PRICE' ?
	* 		{
	* 			...state,
	* 			[ action.item ]: action.price,
	* 		} :
	* 		state;
	* };
	*
	* const discountPercent = ( state = 0, action ) => {
	* 	return action.type === 'START_SALE' ?
	* 		action.discountPercent :
	* 		state;
	* };
	*
	* const store = createReduxStore( 'my-shop', {
	* 	reducer: combineReducers( {
	* 		prices,
	* 		discountPercent,
	* 	} ),
	* } );
	* register( store );
	* ```
	*
	* @return {Function} A reducer that invokes every reducer inside the reducers
	*                    object, and constructs a state object with the same shape.
	*/
	const combineReducers = combineReducers$1;
	/**
	* Given a store descriptor, returns an object containing the store's selectors
	* pre-bound to state so that you only need to supply additional arguments, and
	* modified so that they return promises that resolve to their eventual values,
	* after any resolvers have ran.
	*
	* @param {StoreDescriptor|string} storeNameOrDescriptor The store descriptor. The legacy calling
	*                                                       convention of passing the store name is
	*                                                       also supported.
	*
	* @example
	* ```js
	* import { resolveSelect } from '@wordpress/data';
	* import { store as myCustomStore } from 'my-custom-store';
	*
	* resolveSelect( myCustomStore ).getPrice( 'hammer' ).then(console.log)
	* ```
	*
	* @return Object containing the store's promise-wrapped selectors.
	*/
	function resolveSelect(storeNameOrDescriptor) {
		return defaultRegistry.resolveSelect(storeNameOrDescriptor);
	}
	/**
	* Given a store descriptor, returns an object containing the store's selectors pre-bound to state
	* so that you only need to supply additional arguments, and modified so that they throw promises
	* in case the selector is not resolved yet.
	*
	* @param {StoreDescriptor|string} storeNameOrDescriptor The store descriptor. The legacy calling
	*                                                       convention of passing the store name is
	*                                                       also supported.
	*
	* @return {Object} Object containing the store's suspense-wrapped selectors.
	*/
	const suspendSelect = (storeNameOrDescriptor) => defaultRegistry.suspendSelect(storeNameOrDescriptor);
	/**
	* Given a listener function, the function will be called any time the state value
	* of one of the registered stores has changed. If you specify the optional
	* `storeNameOrDescriptor` parameter, the listener function will be called only
	* on updates on that one specific registered store.
	*
	* This function returns an `unsubscribe` function used to stop the subscription.
	*
	* @param {Function}                listener              Callback function.
	* @param {string|StoreDescriptor?} storeNameOrDescriptor Optional store name.
	*
	* @example
	* ```js
	* import { subscribe } from '@wordpress/data';
	*
	* const unsubscribe = subscribe( () => {
	* 	// You could use this opportunity to test whether the derived result of a
	* 	// selector has subsequently changed as the result of a state update.
	* } );
	*
	* // Later, if necessary...
	* unsubscribe();
	* ```
	*/
	const subscribe = (listener, storeNameOrDescriptor) => defaultRegistry.subscribe(listener, storeNameOrDescriptor);
	/**
	* Registers a generic store instance.
	*
	* @deprecated Use `register( storeDescriptor )` instead.
	*
	* @param {string} name  Store registry name.
	* @param {Object} store Store instance (`{ getSelectors, getActions, subscribe }`).
	*/
	const registerGenericStore = defaultRegistry.registerGenericStore;
	/**
	* Registers a standard `@wordpress/data` store.
	*
	* @deprecated Use `register` instead.
	*
	* @param {string} storeName Unique namespace identifier for the store.
	* @param {Object} options   Store description (reducer, actions, selectors, resolvers).
	*
	* @return {Object} Registered store object.
	*/
	const registerStore = defaultRegistry.registerStore;
	/**
	* Extends a registry to inherit functionality provided by a given plugin. A
	* plugin is an object with properties aligning to that of a registry, merged
	* to extend the default registry behavior.
	*
	* @param {Object} plugin Plugin object.
	*/
	const use = defaultRegistry.use;
	/**
	* Registers a standard `@wordpress/data` store descriptor.
	*
	* @example
	* ```js
	* import { createReduxStore, register } from '@wordpress/data';
	*
	* const store = createReduxStore( 'demo', {
	*     reducer: ( state = 'OK' ) => state,
	*     selectors: {
	*         getValue: ( state ) => state,
	*     },
	* } );
	* register( store );
	* ```
	*
	* @param {StoreDescriptor} store Store descriptor.
	*/
	const register = (store) => defaultRegistry.register(store);

exports.AsyncModeProvider = context_default;
exports.RegistryConsumer = RegistryConsumer;
exports.RegistryProvider = Provider;
exports.combineReducers = combineReducers;
exports.controls = controls;
exports.createReduxStore = createReduxStore;
exports.createRegistry = createRegistry;
exports.createRegistryControl = createRegistryControl;
exports.createRegistrySelector = createRegistrySelector;
exports.createSelector = createSelector;
exports.dispatch = dispatch;
exports.keyedReducer = keyedReducer;
Object.defineProperty(exports, "plugins", {
  enumerable: true,
  get: function () {
    return plugins_exports;
  }
});
exports.register = register;
exports.registerGenericStore = registerGenericStore;
exports.registerStore = registerStore;
exports.resolveSelect = resolveSelect;
exports.select = select;
exports.subscribe = subscribe;
exports.suspendSelect = suspendSelect;
exports.use = use;
exports.useDispatch = useDispatch;
exports.useRegistry = useRegistry;
exports.useSelect = useSelect;
exports.useSuspenseSelect = useSuspenseSelect;
exports.withDispatch = withDispatch;
exports.withRegistry = withRegistry;
exports.withSelect = withSelect;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).data = exports;
return exports;
})({}, window.wp.deprecated, window.wp.reduxRoutine, window.wp.compose, window.wp.privateApis, window.wp.element, window.wp.priorityQueue, window.wp.isShallowEqual, window.ReactJSXRuntime);
//# sourceMappingURL=index.js.map