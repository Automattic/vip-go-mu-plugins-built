(function(exports, _wordpress_element, _wordpress_hooks, _wordpress_is_shallow_equal, _wordpress_compose, _wordpress_deprecated, react_jsx_runtime, _wordpress_primitives) {

"use strict";
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

_wordpress_deprecated = __toESM(_wordpress_deprecated, 1);

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

// packages/plugins/build-module/components/plugin-context/index.mjs
	const Context = (0, _wordpress_element.createContext)({
		name: null,
		icon: null
	});
	Context.displayName = "PluginContext";
	const PluginContextProvider = Context.Provider;
	/**
	* A hook that returns the plugin context.
	*
	* @return {PluginContext} Plugin context
	*/
	function usePluginContext() {
		return (0, _wordpress_element.useContext)(Context);
	}
	/**
	* A Higher Order Component used to inject Plugin context to the
	* wrapped component.
	*
	* @deprecated 6.8.0 Use `usePluginContext` hook instead.
	*
	* @param  mapContextToProps Function called on every context change,
	*                           expected to return object of props to
	*                           merge with the component's own props.
	*
	* @return {Component} Enhanced component with injected context as props.
	*/
	const withPluginContext = (mapContextToProps) => (0, _wordpress_compose.createHigherOrderComponent)((OriginalComponent) => {
		(0, _wordpress_deprecated.default)("wp.plugins.withPluginContext", {
			since: "6.8.0",
			alternative: "wp.plugins.usePluginContext"
		});
		return (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Context.Consumer, { children: (context) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OriginalComponent, {
			...props,
			...mapContextToProps(context, props)
		}) });
	}, "withPluginContext");

// packages/plugins/build-module/components/plugin-error-boundary/index.mjs
	var PluginErrorBoundary = class extends _wordpress_element.Component {
		constructor(props) {
			super(props);
			this.state = { hasError: false };
		}
		static getDerivedStateFromError() {
			return { hasError: true };
		}
		componentDidCatch(error) {
			const { name, onError } = this.props;
			if (onError) onError(name, error);
		}
		render() {
			if (!this.state.hasError) return this.props.children;
			return null;
		}
	};

// node_modules/.store/react-is@19.3.0-h9DBeE4BCfrMSfxZZXEDFw/node_modules/react-is/cjs/react-is.development.js
/**
	* @license React
	* react-is.development.js
	*
	* Copyright (c) Meta Platforms, Inc. and affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var require_react_is_development = /* @__PURE__ */ __commonJSMin(((exports) => {
		(function() {
			function typeOf(object) {
				if ("object" === typeof object && null !== object) {
					var $$typeof = object.$$typeof;
					switch ($$typeof) {
						case REACT_ELEMENT_TYPE: switch (object = object.type, object) {
							case REACT_FRAGMENT_TYPE:
							case REACT_PROFILER_TYPE:
							case REACT_STRICT_MODE_TYPE:
							case REACT_SUSPENSE_TYPE:
							case REACT_SUSPENSE_LIST_TYPE:
							case REACT_VIEW_TRANSITION_TYPE: return object;
							default: switch (object = object && object.$$typeof, object) {
								case REACT_CONTEXT_TYPE:
								case REACT_FORWARD_REF_TYPE:
								case REACT_LAZY_TYPE:
								case REACT_MEMO_TYPE: return object;
								case REACT_CONSUMER_TYPE: return object;
								default: return $$typeof;
							}
						}
						case REACT_PORTAL_TYPE: return $$typeof;
					}
				}
			}
			var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
			exports.ContextConsumer = REACT_CONSUMER_TYPE;
			exports.ContextProvider = REACT_CONTEXT_TYPE;
			exports.Element = REACT_ELEMENT_TYPE;
			exports.ForwardRef = REACT_FORWARD_REF_TYPE;
			exports.Fragment = REACT_FRAGMENT_TYPE;
			exports.Lazy = REACT_LAZY_TYPE;
			exports.Memo = REACT_MEMO_TYPE;
			exports.Portal = REACT_PORTAL_TYPE;
			exports.Profiler = REACT_PROFILER_TYPE;
			exports.StrictMode = REACT_STRICT_MODE_TYPE;
			exports.Suspense = REACT_SUSPENSE_TYPE;
			exports.SuspenseList = REACT_SUSPENSE_LIST_TYPE;
			exports.isContextConsumer = function(object) {
				return typeOf(object) === REACT_CONSUMER_TYPE;
			};
			exports.isContextProvider = function(object) {
				return typeOf(object) === REACT_CONTEXT_TYPE;
			};
			exports.isElement = function(object) {
				return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
			};
			exports.isForwardRef = function(object) {
				return typeOf(object) === REACT_FORWARD_REF_TYPE;
			};
			exports.isFragment = function(object) {
				return typeOf(object) === REACT_FRAGMENT_TYPE;
			};
			exports.isLazy = function(object) {
				return typeOf(object) === REACT_LAZY_TYPE;
			};
			exports.isMemo = function(object) {
				return typeOf(object) === REACT_MEMO_TYPE;
			};
			exports.isPortal = function(object) {
				return typeOf(object) === REACT_PORTAL_TYPE;
			};
			exports.isProfiler = function(object) {
				return typeOf(object) === REACT_PROFILER_TYPE;
			};
			exports.isStrictMode = function(object) {
				return typeOf(object) === REACT_STRICT_MODE_TYPE;
			};
			exports.isSuspense = function(object) {
				return typeOf(object) === REACT_SUSPENSE_TYPE;
			};
			exports.isSuspenseList = function(object) {
				return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
			};
			exports.isValidElementType = function(type) {
				return "string" === typeof type || "function" === typeof type || type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_VIEW_TRANSITION_TYPE || "object" === typeof type && null !== type && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_CONSUMER_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_CLIENT_REFERENCE || void 0 !== type.getModuleId) ? !0 : !1;
			};
			exports.typeOf = typeOf;
		})();
	}));

// node_modules/.store/react-is@19.3.0-h9DBeE4BCfrMSfxZZXEDFw/node_modules/react-is/index.js
	var require_react_is = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = require_react_is_development();
	}));

// packages/icons/build-module/library/plugins.mjs
	var plugins_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M15.3995 11.5711L12.2175 8.38909L10.273 6.44454L7.67678 9.04074C7.3017 9.41581 7.09099 9.92452 7.09099 10.455L7.09099 13.455C7.09099 13.7202 6.98563 13.9745 6.7981 14.1621L5.14645 15.8137C4.95118 16.009 4.95118 16.3256 5.14645 16.5208L7.26777 18.6421C7.46303 18.8374 7.77961 18.8374 7.97487 18.6421L9.62652 16.9905C9.81406 16.8029 10.0684 16.6976 10.3336 16.6976H13.3336C13.8641 16.6976 14.3728 16.4869 14.7478 16.1118L17.344 13.5156L15.3995 11.5711ZM12.2175 8.38909L16.1066 4.5M15.3995 11.5711L19.2886 7.68198" })
	});

// packages/plugins/build-module/api/index.mjs
	var import_react_is = require_react_is();
	/**
	* Plugin definitions keyed by plugin name.
	*/
	const plugins$1 = {};
	/**
	* Registers a plugin to the editor.
	*
	* @param name     A string identifying the plugin. Must be
	*                 unique across all registered plugins.
	* @param settings The settings for this plugin.
	*
	* @example
	* ```js
	* // Using ES5 syntax
	* var el = React.createElement;
	* var Fragment = wp.element.Fragment;
	* var PluginSidebar = wp.editor.PluginSidebar;
	* var PluginSidebarMoreMenuItem = wp.editor.PluginSidebarMoreMenuItem;
	* var registerPlugin = wp.plugins.registerPlugin;
	* var moreIcon = React.createElement( 'svg' ); //... svg element.
	*
	* function Component() {
	* 	return el(
	* 		Fragment,
	* 		{},
	* 		el(
	* 			PluginSidebarMoreMenuItem,
	* 			{
	* 				target: 'sidebar-name',
	* 			},
	* 			'My Sidebar'
	* 		),
	* 		el(
	* 			PluginSidebar,
	* 			{
	* 				name: 'sidebar-name',
	* 				title: 'My Sidebar',
	* 			},
	* 			'Content of the sidebar'
	* 		)
	* 	);
	* }
	* registerPlugin( 'plugin-name', {
	* 	icon: moreIcon,
	* 	render: Component,
	* 	scope: 'my-page',
	* } );
	* ```
	*
	* @example
	* ```js
	* // Using ESNext syntax
	* import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
	* import { registerPlugin } from '@wordpress/plugins';
	* import { more } from '@wordpress/icons';
	*
	* const Component = () => (
	* 	<>
	* 		<PluginSidebarMoreMenuItem
	* 			target="sidebar-name"
	* 		>
	* 			My Sidebar
	* 		</PluginSidebarMoreMenuItem>
	* 		<PluginSidebar
	* 			name="sidebar-name"
	* 			title="My Sidebar"
	* 		>
	* 			Content of the sidebar
	* 		</PluginSidebar>
	* 	</>
	* );
	*
	* registerPlugin( 'plugin-name', {
	* 	icon: more,
	* 	render: Component,
	* 	scope: 'my-page',
	* } );
	* ```
	*
	* @return The final plugin settings object.
	*/
	function registerPlugin(name, settings) {
		if (typeof settings !== "object") {
			console.error("No settings object provided!");
			return null;
		}
		if (typeof name !== "string") {
			console.error("Plugin name must be string.");
			return null;
		}
		if (!/^[a-z][a-z0-9-]*$/.test(name)) {
			console.error("Plugin name must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: \"my-plugin\".");
			return null;
		}
		if (plugins$1[name]) console.error(`Plugin "${name}" is already registered.`);
		settings = (0, _wordpress_hooks.applyFilters)("plugins.registerPlugin", settings, name);
		const { render, scope } = settings;
		if (!(0, import_react_is.isValidElementType)(render)) {
			console.error("The \"render\" property must be specified and must be a valid component.");
			return null;
		}
		if (scope) {
			if (typeof scope !== "string") {
				console.error("Plugin scope must be string.");
				return null;
			}
			if (!/^[a-z][a-z0-9-]*$/.test(scope)) {
				console.error("Plugin scope must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: \"my-page\".");
				return null;
			}
		}
		plugins$1[name] = {
			name,
			icon: plugins_default,
			...settings
		};
		(0, _wordpress_hooks.doAction)("plugins.pluginRegistered", settings, name);
		return settings;
	}
	/**
	* Unregisters a plugin by name.
	*
	* @param name Plugin name.
	*
	* @example
	* ```js
	* // Using ES5 syntax
	* var unregisterPlugin = wp.plugins.unregisterPlugin;
	*
	* unregisterPlugin( 'plugin-name' );
	* ```
	*
	* @example
	* ```js
	* // Using ESNext syntax
	* import { unregisterPlugin } from '@wordpress/plugins';
	*
	* unregisterPlugin( 'plugin-name' );
	* ```
	*
	* @return The previous plugin settings object, if it has been
	*         successfully unregistered; otherwise `undefined`.
	*/
	function unregisterPlugin(name) {
		if (!plugins$1[name]) {
			console.error("Plugin \"" + name + "\" is not registered.");
			return;
		}
		const oldPlugin = plugins$1[name];
		delete plugins$1[name];
		(0, _wordpress_hooks.doAction)("plugins.pluginUnregistered", oldPlugin, name);
		return oldPlugin;
	}
	/**
	* Returns a registered plugin settings.
	*
	* @param name Plugin name.
	*
	* @return Plugin setting.
	*/
	function getPlugin(name) {
		return plugins$1[name];
	}
	/**
	* Returns all registered plugins without a scope or for a given scope.
	*
	* @param scope The scope to be used when rendering inside
	*              a plugin area. No scope by default.
	*
	* @return The list of plugins without a scope or for a given scope.
	*/
	function getPlugins(scope) {
		return Object.values(plugins$1).filter((plugin) => plugin.scope === scope);
	}

// packages/plugins/build-module/components/plugin-area/index.mjs
	const getPluginContext = memize((icon, name) => ({
		icon,
		name
	}));
	/**
	* A component that renders all plugin fills in a hidden div.
	*
	* @param  props
	* @param  props.scope
	* @param  props.onError
	* @example
	* ```js
	* // Using ES5 syntax
	* var el = React.createElement;
	* var PluginArea = wp.plugins.PluginArea;
	*
	* function Layout() {
	* 	return el(
	* 		'div',
	* 		{ scope: 'my-page' },
	* 		'Content of the page',
	* 		PluginArea
	* 	);
	* }
	* ```
	*
	* @example
	* ```js
	* // Using ESNext syntax
	* import { PluginArea } from '@wordpress/plugins';
	*
	* const Layout = () => (
	* 	<div>
	* 		Content of the page
	* 		<PluginArea scope="my-page" />
	* 	</div>
	* );
	* ```
	*
	* @return {Component} The component to be rendered.
	*/
	function PluginArea({ scope, onError }) {
		const store = (0, _wordpress_element.useMemo)(() => {
			let lastValue = [];
			return {
				subscribe(listener) {
					(0, _wordpress_hooks.addAction)("plugins.pluginRegistered", "core/plugins/plugin-area/plugins-registered", listener);
					(0, _wordpress_hooks.addAction)("plugins.pluginUnregistered", "core/plugins/plugin-area/plugins-unregistered", listener);
					return () => {
						(0, _wordpress_hooks.removeAction)("plugins.pluginRegistered", "core/plugins/plugin-area/plugins-registered");
						(0, _wordpress_hooks.removeAction)("plugins.pluginUnregistered", "core/plugins/plugin-area/plugins-unregistered");
					};
				},
				getValue() {
					const nextValue = getPlugins(scope);
					if (!(0, _wordpress_is_shallow_equal.isShallowEqual)(lastValue, nextValue)) lastValue = nextValue;
					return lastValue;
				}
			};
		}, [scope]);
		const plugins = (0, _wordpress_element.useSyncExternalStore)(store.subscribe, store.getValue, store.getValue);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: { display: "none" },
			children: plugins.map(({ icon, name, render: Plugin }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginContextProvider, {
				value: getPluginContext(icon, name),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginErrorBoundary, {
					name,
					onError,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Plugin, {})
				})
			}, name))
		});
	}

exports.PluginArea = PluginArea;
exports.getPlugin = getPlugin;
exports.getPlugins = getPlugins;
exports.registerPlugin = registerPlugin;
exports.unregisterPlugin = unregisterPlugin;
exports.usePluginContext = usePluginContext;
exports.withPluginContext = withPluginContext;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).plugins = exports;
return exports;
})({}, window.wp.element, window.wp.hooks, window.wp.isShallowEqual, window.wp.compose, window.wp.deprecated, window.ReactJSXRuntime, window.wp.primitives);
//# sourceMappingURL=index.js.map