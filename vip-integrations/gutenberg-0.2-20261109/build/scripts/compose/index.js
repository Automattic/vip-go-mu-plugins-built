(function(exports, _wordpress_private_apis, react_jsx_runtime, _wordpress_is_shallow_equal, _wordpress_element, _wordpress_deprecated, _wordpress_dom, _wordpress_keycodes, _wordpress_undo_manager, _wordpress_priority_queue) {

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

// packages/compose/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/compose");

// packages/compose/build-module/utils/subscribe-delegated-listener/index.mjs
/**
	* Adds a callback to a shared `addEventListener`. Only one underlying
	* native listener is attached per (root, event type, phase); subscribers
	* join an in-JS registry that dispatches events along the DOM ancestry
	* of `event.target`.
	*
	* The model mirrors React's synthetic event system: a single root
	* listener handles every event of a given type, and callbacks bound to
	* an `Element` only fire when that element is on the target's path.
	* Callbacks bound to a `Document` always fire (document is the root of
	* every event in that document); callbacks bound to a `Window` always
	* fire as a flat fan-out, since `window` isn't on the DOM tree.
	*
	* @param target    `Element`, `Document`, or `Window` to bind the
	*                  callback to. For `Element`, the callback only fires
	*                  when the event happens on the element or a
	*                  descendant.
	* @param eventType DOM event name.
	* @param callback  Listener to be invoked with the event.
	* @param capture   Use the capture phase. Required when ancestor
	*                  listeners gate on `event.defaultPrevented`, since a
	*                  bubble-phase root listener fires after them. Defaults
	*                  to `false`.
	* @return Unsubscribe function.
	*/
	const registries = /* @__PURE__ */ new WeakMap();
	function subscribeDelegatedListener(target, eventType, callback, capture = false) {
		const ownerDoc = target.ownerDocument;
		const root = ownerDoc ?? target;
		const isWindow = ownerDoc === void 0;
		let perRoot = registries.get(root);
		if (!perRoot) {
			perRoot = /* @__PURE__ */ new Map();
			registries.set(root, perRoot);
		}
		const key = capture ? `${eventType}:capture` : eventType;
		let perEvent = perRoot.get(key);
		if (!perEvent) {
			perEvent = /* @__PURE__ */ new WeakMap();
			perRoot.set(key, perEvent);
			const subscribers = perEvent;
			root.addEventListener(eventType, (event) => {
				if (isWindow) {
					const set = subscribers.get(root);
					if (set) for (const cb of set) cb(event);
					return;
				}
				if (capture) {
					const path = [];
					let current = event.target;
					while (current) {
						path.push(current);
						if (current === root) break;
						current = current.parentNode;
					}
					for (let i = path.length - 1; i >= 0; i--) {
						const set = subscribers.get(path[i]);
						if (set) for (const cb of set) cb(event);
					}
				} else {
					let current = event.target;
					while (current) {
						const set = subscribers.get(current);
						if (set) for (const cb of set) cb(event);
						if (current === root) break;
						current = current.parentNode;
					}
				}
			}, capture);
		}
		let set = perEvent.get(target);
		if (!set) {
			set = /* @__PURE__ */ new Set();
			perEvent.set(target, set);
		}
		set.add(callback);
		return () => {
			set.delete(callback);
		};
	}

// packages/compose/build-module/private-apis.mjs
/**
	* Private `@wordpress/compose` APIs.
	*/
	const privateApis = {};
	lock(privateApis, { subscribeDelegatedListener });

// packages/compose/build-module/higher-order/pipe.mjs
/**
	* Parts of this source were derived and modified from lodash,
	* released under the MIT license.
	*
	* https://github.com/lodash/lodash
	*
	* Copyright JS Foundation and other contributors <https://js.foundation/>
	*
	* Based on Underscore.js, copyright Jeremy Ashkenas,
	* DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>
	*
	* This software consists of voluntary contributions made by many
	* individuals. For exact contribution history, see the revision history
	* available at https://github.com/lodash/lodash
	*
	* The following license applies to all parts of this software except as
	* documented below:
	*
	* ====
	*
	* Permission is hereby granted, free of charge, to any person obtaining
	* a copy of this software and associated documentation files (the
	* "Software"), to deal in the Software without restriction, including
	* without limitation the rights to use, copy, modify, merge, publish,
	* distribute, sublicense, and/or sell copies of the Software, and to
	* permit persons to whom the Software is furnished to do so, subject to
	* the following conditions:
	*
	* The above copyright notice and this permission notice shall be
	* included in all copies or substantial portions of the Software.
	*
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/
	/**
	* Creates a pipe function.
	*
	* Allows to choose whether to perform left-to-right or right-to-left composition.
	*
	* @see https://lodash.com/docs/4#flow
	*
	* @param {boolean} reverse True if right-to-left, false for left-to-right composition.
	*/
	const basePipe = (reverse = false) => (...funcs) => (...args) => {
		const functions = funcs.flat();
		if (reverse) functions.reverse();
		return functions.reduce((prev, func) => [func(...prev)], args)[0];
	};
	/**
	* Composes multiple higher-order components into a single higher-order component. Performs left-to-right function
	* composition, where each successive invocation is supplied the return value of the previous.
	*
	* This is inspired by `lodash`'s `flow` function.
	*
	* @see https://lodash.com/docs/4#flow
	*/
	const pipe = basePipe();

// packages/compose/build-module/higher-order/compose.mjs
/**
	* Composes multiple higher-order components into a single higher-order component. Performs right-to-left function
	* composition, where each successive invocation is supplied the return value of the previous.
	*
	* This is inspired by `lodash`'s `flowRight` function.
	*
	* @see https://lodash.com/docs/4#flow-right
	*/
	const compose = basePipe(true);

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

// packages/compose/build-module/utils/create-higher-order-component/index.mjs
/**
	* Given a function mapping a component to an enhanced component and modifier
	* name, returns the enhanced component augmented with a generated displayName.
	*
	* @param mapComponent Function mapping component to enhanced component.
	* @param modifierName Seed name from which to generated display name.
	*
	* @return Component class with generated display name assigned.
	*/
	function createHigherOrderComponent(mapComponent, modifierName) {
		return (Inner) => {
			const Outer = mapComponent(Inner);
			Outer.displayName = hocName(modifierName, Inner);
			return Outer;
		};
	}
	/**
	* Returns a displayName for a higher-order component, given a wrapper name.
	*
	* @example
	*     hocName( 'MyMemo', Widget ) === 'MyMemo(Widget)';
	*     hocName( 'MyMemo', <div /> ) === 'MyMemo(Component)';
	*
	* @param name  Name assigned to higher-order component's wrapper component.
	* @param Inner Wrapped component inside higher-order component.
	* @return       Wrapped name of higher-order component.
	*/
	const hocName = (name, Inner) => {
		const inner = Inner.displayName || Inner.name || "Component";
		return `${pascalCase(name ?? "")}(${inner})`;
	};

// packages/compose/build-module/higher-order/if-condition/index.mjs
/**
	* Higher-order component creator, creating a new component which renders if
	* the given condition is satisfied or with the given optional prop name.
	*
	* @example
	* ```ts
	* type Props = { foo: string };
	* const Component = ( props: Props ) => <div>{ props.foo }</div>;
	* const ConditionalComponent = ifCondition( ( props: Props ) => props.foo.length !== 0 )( Component );
	* <ConditionalComponent foo="" />; // => null
	* <ConditionalComponent foo="bar" />; // => <div>bar</div>;
	* ```
	*
	* @param predicate Function to test condition.
	*
	* @return Higher-order component.
	*/
	function ifCondition(predicate) {
		return createHigherOrderComponent((WrappedComponent) => (props) => {
			if (!predicate(props)) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WrappedComponent, { ...props });
		}, "ifCondition");
	}

// packages/compose/build-module/higher-order/pure/index.mjs
/**
	* Given a component returns the enhanced component augmented with a component
	* only re-rendering when its props/state change
	*
	* @deprecated Use `memo` or `PureComponent` instead.
	*/
	const pure = createHigherOrderComponent(function(WrappedComponent) {
		(0, _wordpress_deprecated.default)("wp.compose.pure", {
			since: "7.1",
			alternative: "Use `memo` or `PureComponent` instead"
		});
		if (WrappedComponent.prototype instanceof _wordpress_element.Component) return class extends WrappedComponent {
			shouldComponentUpdate(nextProps, nextState) {
				return !(0, _wordpress_is_shallow_equal.isShallowEqual)(nextProps, this.props) || !(0, _wordpress_is_shallow_equal.isShallowEqual)(nextState, this.state);
			}
		};
		return class extends _wordpress_element.Component {
			shouldComponentUpdate(nextProps) {
				return !(0, _wordpress_is_shallow_equal.isShallowEqual)(nextProps, this.props);
			}
			render() {
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WrappedComponent, { ...this.props });
			}
		};
	}, "pure");

// packages/compose/build-module/higher-order/with-global-events/listener.mjs
/**
	* Class responsible for orchestrating event handling on the global window,
	* binding a single event to be shared across all handling instances, and
	* removing the handler when no instances are listening for the event.
	*/
	var Listener = class {
		constructor() {
			this.listeners = {};
			this.handleEvent = this.handleEvent.bind(this);
		}
		add(eventType, instance) {
			if (!this.listeners[eventType]) {
				window.addEventListener(eventType, this.handleEvent);
				this.listeners[eventType] = [];
			}
			this.listeners[eventType].push(instance);
		}
		remove(eventType, instance) {
			if (!this.listeners[eventType]) return;
			this.listeners[eventType] = this.listeners[eventType].filter((listener) => listener !== instance);
			if (!this.listeners[eventType].length) {
				window.removeEventListener(eventType, this.handleEvent);
				delete this.listeners[eventType];
			}
		}
		handleEvent(event) {
			this.listeners[event.type]?.forEach((instance) => {
				instance.handleEvent(event);
			});
		}
	};

// packages/compose/build-module/higher-order/with-global-events/index.mjs
/**
	* Listener instance responsible for managing document event handling.
	*/
	const listener = new Listener();
	/**
	* Higher-order component creator which, given an object of DOM event types and
	* values corresponding to a callback function name on the component, will
	* create or update a window event handler to invoke the callback when an event
	* occurs. On behalf of the consuming developer, the higher-order component
	* manages unbinding when the component unmounts, and binding at most a single
	* event handler for the entire application.
	*
	* @deprecated
	*
	* @param eventTypesToHandlers Object with keys of DOM event type, the value a
	*                             name of the function on the original component's
	*                             instance which handles the event.
	*
	* @return Higher-order component.
	*/
	function withGlobalEvents(eventTypesToHandlers) {
		(0, _wordpress_deprecated.default)("wp.compose.withGlobalEvents", {
			since: "5.7",
			alternative: "useEffect"
		});
		return createHigherOrderComponent((WrappedComponent) => {
			class Wrapper extends _wordpress_element.Component {
				constructor(props) {
					super(props);
					this.handleEvent = this.handleEvent.bind(this);
					this.handleRef = this.handleRef.bind(this);
				}
				componentDidMount() {
					Object.keys(eventTypesToHandlers).forEach((eventType) => {
						listener.add(eventType, this);
					});
				}
				componentWillUnmount() {
					Object.keys(eventTypesToHandlers).forEach((eventType) => {
						listener.remove(eventType, this);
					});
				}
				handleEvent(event) {
					const handler = eventTypesToHandlers[event.type];
					if (typeof this.wrappedRef[handler] === "function") this.wrappedRef[handler](event);
				}
				handleRef(el) {
					this.wrappedRef = el;
					if (this.props.forwardedRef) this.props.forwardedRef(el);
				}
				render() {
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WrappedComponent, {
						...this.props.ownProps,
						ref: this.handleRef
					});
				}
			}
			return (0, _wordpress_element.forwardRef)((props, ref) => {
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Wrapper, {
					ownProps: props,
					forwardedRef: ref
				});
			});
		}, "withGlobalEvents");
	}

// packages/compose/build-module/hooks/use-instance-id/index.mjs
	const instanceMap = /* @__PURE__ */ new WeakMap();
	/**
	* Creates a new id for a given object.
	*
	* @param object Object reference to create an id for.
	* @return The instance id (index).
	*/
	function createId(object) {
		const instances = instanceMap.get(object) || 0;
		instanceMap.set(object, instances + 1);
		return instances;
	}
	/**
	* Provides a unique instance ID.
	*
	* @param object        Object reference to create an id for.
	* @param [prefix]      Prefix for the unique id.
	* @param [preferredId] Default ID to use.
	* @return The unique instance id.
	*/
	function useInstanceId(object, prefix, preferredId) {
		return (0, _wordpress_element.useMemo)(() => {
			if (preferredId) return preferredId;
			const id = createId(object);
			return prefix ? `${prefix}-${id}` : id;
		}, [
			object,
			preferredId,
			prefix
		]);
	}

// packages/compose/build-module/higher-order/with-instance-id/index.mjs
/**
	* A Higher Order Component used to provide a unique instance ID by component.
	*/
	const withInstanceId = createHigherOrderComponent((WrappedComponent) => {
		return (props) => {
			const instanceId = useInstanceId(WrappedComponent);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WrappedComponent, {
				...props,
				instanceId
			});
		};
	}, "instanceId");

// packages/compose/build-module/higher-order/with-safe-timeout/index.mjs
/**
	* A higher-order component used to provide and manage delayed function calls
	* that ought to be bound to a component's lifecycle.
	*/
	const withSafeTimeout = createHigherOrderComponent((OriginalComponent) => {
		return class WrappedComponent extends _wordpress_element.Component {
			timeouts;
			constructor(props) {
				super(props);
				this.timeouts = [];
				this.setTimeout = this.setTimeout.bind(this);
				this.clearTimeout = this.clearTimeout.bind(this);
			}
			componentWillUnmount() {
				this.timeouts.forEach(clearTimeout);
			}
			setTimeout(fn, delay) {
				const id = setTimeout(() => {
					fn();
					this.clearTimeout(id);
				}, delay);
				this.timeouts.push(id);
				return id;
			}
			clearTimeout(id) {
				clearTimeout(id);
				this.timeouts = this.timeouts.filter((timeoutId) => timeoutId !== id);
			}
			render() {
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OriginalComponent, {
					...this.props,
					setTimeout: this.setTimeout,
					clearTimeout: this.clearTimeout
				});
			}
		};
	}, "withSafeTimeout");

// packages/compose/build-module/higher-order/with-state/index.mjs
	function createWithState(initialState) {
		(0, _wordpress_deprecated.default)("wp.compose.withState", {
			since: "5.8",
			alternative: "wp.element.useState"
		});
		return createHigherOrderComponent((OriginalComponent) => {
			const Inner = OriginalComponent;
			return class WrappedComponent extends _wordpress_element.Component {
				constructor(props) {
					super(props);
					this.setState = this.setState.bind(this);
					this.state = initialState;
				}
				render() {
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inner, {
						...this.props,
						...this.state,
						setState: this.setState
					});
				}
			};
		}, "withState");
	}
	function withState(initialState = {}) {
		return createWithState(initialState);
	}

// packages/compose/build-module/hooks/use-ref-effect/index.mjs
/**
	* Effect-like ref callback. Just like with `useEffect`, this allows you to
	* return a cleanup function to be run if the ref changes or one of the
	* dependencies changes. The ref is provided as an argument to the callback
	* functions. The main difference between this and `useEffect` is that
	* the `useEffect` callback is not called when the ref changes, but this is.
	* Pass the returned ref callback as the component's ref and merge multiple refs
	* with `useMergeRefs`.
	*
	* It's worth noting that if the dependencies array is empty, there's not
	* strictly a need to clean up event handlers for example, because the node is
	* to be removed. It *is* necessary if you add dependencies because the ref
	* callback will be called multiple times for the same node.
	*
	* @param callback     Callback with ref as argument.
	* @param dependencies Dependencies of the callback.
	*
	* @return Ref callback.
	*/
	function useRefEffect(callback, dependencies) {
		const cleanupRef = (0, _wordpress_element.useRef)(void 0);
		return (0, _wordpress_element.useCallback)((node) => {
			if (node) cleanupRef.current = callback(node);
			else if (cleanupRef.current) cleanupRef.current();
		}, dependencies);
	}

// packages/compose/build-module/hooks/use-constrained-tabbing/index.mjs
/**
	* In Dialogs/modals, the tabbing must be constrained to the content of
	* the wrapper element. This hook adds the behavior to the returned ref.
	*
	* @return Element Ref.
	*
	* @example
	* ```ts
	* import { useConstrainedTabbing } from '@wordpress/compose';
	*
	* const ConstrainedTabbingExample = () => {
	*     const constrainedTabbingRef = useConstrainedTabbing()
	*     return (
	*         <div ref={ constrainedTabbingRef }>
	*             <Button />
	*             <Button />
	*         </div>
	*     );
	* }
	* ```
	*/
	function useConstrainedTabbing() {
		return useRefEffect((node) => {
			function onKeyDown(event) {
				const { key, shiftKey, target } = event;
				if (key !== "Tab") return;
				const action = shiftKey ? "findPrevious" : "findNext";
				const nextElement = _wordpress_dom.focus.tabbable[action](target) || null;
				if (target.contains(nextElement)) {
					event.preventDefault();
					nextElement?.focus();
					return;
				}
				if (node.contains(nextElement)) return;
				if (!_wordpress_dom.focus.tabbable.find(node).length) {
					event.preventDefault();
					return;
				}
				const domAction = shiftKey ? "append" : "prepend";
				const { ownerDocument } = node;
				const trap = ownerDocument.createElement("div");
				trap.tabIndex = -1;
				node[domAction](trap);
				trap.addEventListener("blur", () => node.removeChild(trap));
				trap.focus();
			}
			node.addEventListener("keydown", onKeyDown);
			return () => {
				node.removeEventListener("keydown", onKeyDown);
			};
		}, []);
	}

// packages/compose/build-module/hooks/use-copy-to-clipboard/index.mjs
/**
	* Copies text to the clipboard using the Clipboard API when available,
	* with a fallback for non-secure contexts (e.g. HTTP) and older browsers.
	*
	* @param text    The text to copy.
	* @param trigger The element that triggered the copy.
	* @return Resolves to true if successful, false otherwise.
	*/
	async function copyToClipboard(text, trigger) {
		if (!trigger) return false;
		const { ownerDocument } = trigger;
		if (!ownerDocument) return false;
		const { defaultView } = ownerDocument;
		try {
			if (defaultView?.navigator?.clipboard?.writeText) {
				await defaultView.navigator.clipboard.writeText(text);
				return true;
			}
			const textarea = ownerDocument.createElement("textarea");
			textarea.value = text;
			textarea.setAttribute("readonly", "");
			textarea.style.position = "fixed";
			textarea.style.left = "-9999px";
			textarea.style.top = "-9999px";
			ownerDocument.body.appendChild(textarea);
			textarea.select();
			const success = ownerDocument.execCommand("copy");
			textarea.remove();
			return success;
		} catch {
			return false;
		}
	}
	/**
	* Restores focus to the trigger element.
	*
	* @param trigger The element that triggered the copy.
	*/
	function restoreFocus(trigger) {
		if ("focus" in trigger && typeof trigger.focus === "function") trigger.focus();
	}
	/**
	* @template T
	* @param    value
	* @return   A ref to assign to the target element.
	*/
	function useUpdatedRef(value) {
		const ref = (0, _wordpress_element.useRef)(value);
		(0, _wordpress_element.useLayoutEffect)(() => {
			ref.current = value;
		}, [value]);
		return ref;
	}
	/**
	* Copies the given text to the clipboard when the element is clicked.
	*
	* @template T
	* @param    text      The text to copy. Use a function if not
	*                     already available and expensive to compute.
	* @param    onSuccess Called when the text is copied. Runs even after
	*                     the element unmounts, so other UI can update.
	* @param    onError   Called when copying fails. Runs even after the
	*                     element unmounts, so other UI can update.
	*
	* @return   A ref to assign to the target element.
	*/
	function useCopyToClipboard(text, onSuccess, onError) {
		const textRef = useUpdatedRef(text);
		const onSuccessRef = useUpdatedRef(onSuccess);
		const onErrorRef = useUpdatedRef(onError);
		return useRefEffect((node) => {
			let isActive = true;
			const handleClick = async () => {
				if (await copyToClipboard(typeof textRef.current === "function" ? textRef.current() : textRef.current || "", node)) {
					if (isActive) restoreFocus(node);
					if (onSuccessRef.current) onSuccessRef.current();
				} else if (onErrorRef.current) onErrorRef.current();
			};
			node.addEventListener("click", handleClick);
			return () => {
				isActive = false;
				node.removeEventListener("click", handleClick);
			};
		}, []);
	}

// packages/compose/build-module/hooks/use-copy-on-click/index.mjs
/**
	* Copies the text to the clipboard when the element is clicked.
	*
	* @deprecated
	* @param ref      Reference with the element.
	* @param text    The text to copy.
	* @param timeout Optional timeout to reset the returned
	*                state. 4 seconds by default.
	* @return   Whether or not the text has been copied. Resets after the
	*           timeout.
	*/
	function useCopyOnClick(ref, text, timeout = 4e3) {
		(0, _wordpress_deprecated.default)("wp.compose.useCopyOnClick", {
			since: "5.8",
			alternative: "wp.compose.useCopyToClipboard"
		});
		const [hasCopied, setHasCopied] = (0, _wordpress_element.useState)(false);
		(0, _wordpress_element.useEffect)(() => {
			let isActive = true;
			let timeoutId;
			if (!ref.current) return;
			let targets;
			if (typeof ref.current === "string") targets = typeof document !== "undefined" ? Array.from(document.querySelectorAll(ref.current)) : [];
			else if ("length" in ref.current && typeof ref.current.length === "number") targets = Array.from(ref.current);
			else targets = [ref.current];
			if (targets.length === 0) return;
			const handleClick = async (event) => {
				const trigger = event.currentTarget;
				if (!trigger) return;
				const success = await copyToClipboard(typeof text === "function" ? text() : text || "", trigger);
				if (!isActive) return;
				if (success) {
					restoreFocus(trigger);
					if (timeout) {
						setHasCopied(true);
						clearTimeout(timeoutId);
						timeoutId = setTimeout(() => setHasCopied(false), timeout);
					}
				}
			};
			for (const target of targets) target.addEventListener("click", handleClick);
			return () => {
				isActive = false;
				for (const target of targets) target.removeEventListener("click", handleClick);
				clearTimeout(timeoutId);
			};
		}, [
			ref,
			text,
			timeout
		]);
		return hasCopied;
	}

// packages/compose/build-module/hooks/use-focus-on-mount/index.mjs
/**
	* Determines focus behavior when the element mounts.
	*
	* @param focusOnMount Behavioral mode. Defaults to `"firstElement"` which focuses the
	*                     first tabbable element within; `"firstInputElement"` focuses the
	*                     first value control within; `true` focuses the element itself;
	*                     `false` does nothing.
	* @return Ref callback.
	*
	* @example
	* ```js
	* import { useFocusOnMount } from '@wordpress/compose';
	*
	* const WithFocusOnMount = () => {
	*     const ref = useFocusOnMount()
	*     return (
	*         <div ref={ ref }>
	*             <Button />
	*             <Button />
	*         </div>
	*     );
	* }
	* ```
	*/
	function useFocusOnMount(focusOnMount = "firstElement") {
		const focusOnMountRef = (0, _wordpress_element.useRef)(focusOnMount);
		/**
		* Sets focus on a DOM element.
		*
		* @param target The DOM element to set focus to.
		*/
		const setFocus = (target) => {
			target.focus({ preventScroll: true });
		};
		(0, _wordpress_element.useEffect)(() => {
			focusOnMountRef.current = focusOnMount;
		}, [focusOnMount]);
		return useRefEffect((node) => {
			if (focusOnMountRef.current === false) return;
			if (node.contains(node.ownerDocument?.activeElement ?? null)) return;
			if (focusOnMountRef.current !== "firstElement" && focusOnMountRef.current !== "firstInputElement") {
				setFocus(node);
				return;
			}
			const timerId = setTimeout(() => {
				if (focusOnMountRef.current === "firstInputElement") {
					const formInput = node.querySelector("input:not([type=\"hidden\"]):not([disabled]), select:not([disabled]), textarea:not([disabled])");
					if (formInput) {
						setFocus(formInput);
						return;
					}
				}
				const firstTabbable = _wordpress_dom.focus.tabbable.find(node)[0];
				if (firstTabbable) setFocus(firstTabbable);
			}, 0);
			return () => {
				clearTimeout(timerId);
			};
		}, []);
	}

// packages/compose/build-module/hooks/use-focus-return/index.mjs
	let origin = null;
	/**
	* Adds the unmount behavior of returning focus to the element which had it
	* previously as is expected for roles like menus or dialogs.
	*
	* @param onFocusReturn Overrides the default return behavior.
	* @return Element Ref.
	*
	* @example
	* ```ts
	* import { useFocusReturn } from '@wordpress/compose';
	*
	* const WithFocusReturn = () => {
	*     const ref = useFocusReturn()
	*     return (
	*         <div ref={ ref }>
	*             <Button />
	*             <Button />
	*         </div>
	*     );
	* }
	* ```
	*/
	function useFocusReturn(onFocusReturn) {
		const ref = (0, _wordpress_element.useRef)(null);
		const focusedBeforeMountRef = (0, _wordpress_element.useRef)(null);
		const onFocusReturnRef = (0, _wordpress_element.useRef)(onFocusReturn);
		(0, _wordpress_element.useEffect)(() => {
			onFocusReturnRef.current = onFocusReturn;
		}, [onFocusReturn]);
		return (0, _wordpress_element.useCallback)((node) => {
			if (node) {
				ref.current = node;
				if (focusedBeforeMountRef.current) return;
				const activeDocument = node.ownerDocument.activeElement instanceof window.HTMLIFrameElement ? node.ownerDocument.activeElement.contentDocument : node.ownerDocument;
				focusedBeforeMountRef.current = activeDocument?.activeElement ?? null;
			} else if (focusedBeforeMountRef.current) {
				const isFocused = ref.current?.contains(ref.current?.ownerDocument.activeElement ?? null);
				if (ref.current?.isConnected && !isFocused) {
					origin ??= focusedBeforeMountRef.current;
					return;
				}
				if (onFocusReturnRef.current) onFocusReturnRef.current();
				else (!focusedBeforeMountRef.current.isConnected ? origin : focusedBeforeMountRef.current)?.focus();
				origin = null;
			}
		}, []);
	}

// packages/compose/build-module/hooks/use-focus-outside/index.mjs
/**
	* Input types which are classified as button types, for use in considering
	* whether element is a (focus-normalized) button.
	*/
	const INPUT_BUTTON_TYPES = ["button", "submit"];
	/**
	* Returns true if the given element is a button element subject to focus
	* normalization, or false otherwise.
	*
	* @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
	*
	* @param eventTarget The target from a mouse or touch event.
	*
	* @return Whether the element is a button element subject to focus normalization.
	*/
	function isFocusNormalizedButton(eventTarget) {
		if (!(eventTarget instanceof window.HTMLElement)) return false;
		switch (eventTarget.nodeName) {
			case "A":
			case "BUTTON": return true;
			case "INPUT": return INPUT_BUTTON_TYPES.includes(eventTarget.type);
		}
		return false;
	}
	/**
	* A react hook that can be used to check whether focus has moved outside the
	* element the event handlers are bound to.
	*
	* @param onFocusOutside A callback triggered when focus moves outside
	*                       the element the event handlers are bound to.
	*
	* @return An object containing event handlers. Bind the event handlers to a
	* wrapping element element to capture when focus moves outside that element.
	*/
	function useFocusOutside(onFocusOutside) {
		const currentOnFocusOutsideRef = (0, _wordpress_element.useRef)(onFocusOutside);
		(0, _wordpress_element.useEffect)(() => {
			currentOnFocusOutsideRef.current = onFocusOutside;
		}, [onFocusOutside]);
		const preventBlurCheckRef = (0, _wordpress_element.useRef)(false);
		const blurCheckTimeoutIdRef = (0, _wordpress_element.useRef)(void 0);
		/**
		* Cancel a blur check timeout.
		*/
		const cancelBlurCheck = (0, _wordpress_element.useCallback)(() => {
			clearTimeout(blurCheckTimeoutIdRef.current);
		}, []);
		(0, _wordpress_element.useEffect)(() => {
			if (!onFocusOutside) cancelBlurCheck();
		}, [onFocusOutside, cancelBlurCheck]);
		/**
		* Handles a mousedown or mouseup event to respectively assign and
		* unassign a flag for preventing blur check on button elements. Some
		* browsers, namely Firefox and Safari, do not emit a focus event on
		* button elements when clicked, while others do. The logic here
		* intends to normalize this as treating click on buttons as focus.
		*
		* @param event
		* @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
		*/
		const normalizeButtonFocus = (0, _wordpress_element.useCallback)((event) => {
			const { type, target } = event;
			if (["mouseup", "touchend"].includes(type)) preventBlurCheckRef.current = false;
			else if (isFocusNormalizedButton(target)) preventBlurCheckRef.current = true;
		}, []);
		return {
			onFocus: cancelBlurCheck,
			onMouseDown: normalizeButtonFocus,
			onMouseUp: normalizeButtonFocus,
			onTouchStart: normalizeButtonFocus,
			onTouchEnd: normalizeButtonFocus,
			onBlur: (0, _wordpress_element.useCallback)((event) => {
				event.persist();
				if (preventBlurCheckRef.current) return;
				const ignoreForRelatedTarget = event.target.getAttribute("data-unstable-ignore-focus-outside-for-relatedtarget");
				if (ignoreForRelatedTarget && event.relatedTarget?.closest(ignoreForRelatedTarget)) return;
				clearTimeout(blurCheckTimeoutIdRef.current);
				blurCheckTimeoutIdRef.current = setTimeout(() => {
					if (!document.hasFocus()) {
						event.preventDefault();
						return;
					}
					if ("function" === typeof currentOnFocusOutsideRef.current) currentOnFocusOutsideRef.current(event);
				}, 0);
			}, [])
		};
	}

// packages/compose/build-module/hooks/use-merge-refs/index.mjs
	function assignRef(ref, value) {
		if (typeof ref === "function") {
			const returned = ref(value);
			return typeof returned === "function" ? returned : void 0;
		} else if (ref && ref.hasOwnProperty("current")) ref.current = value;
	}
	function detachRef(ref, index, cleanups) {
		const cleanup = cleanups[index];
		if (cleanup) {
			cleanups[index] = void 0;
			cleanup();
		} else assignRef(ref, null);
	}
	/**
	* Merges refs into one ref callback.
	*
	* It also ensures that the merged ref callbacks are only called when they
	* change (as a result of a `useCallback` dependency update) OR when the ref
	* value changes, just as React does when passing a single ref callback to the
	* component.
	*
	* As expected, if you pass a new function on every render, the ref callback
	* will be called after every render.
	*
	* If you don't wish a ref callback to be called after every render, wrap it
	* with `useCallback( callback, dependencies )`. When a dependency changes, the
	* old ref callback will be called with `null` and the new ref callback will be
	* called with the same value.
	*
	* Inner ref callbacks may return a cleanup function (React 19's ref callback
	* cleanup pattern). When a ref callback returns a function, that function is
	* invoked at teardown (node change, dependency change, or unmount) **instead
	* of** the callback being called with `null`. Callbacks that do not return a
	* cleanup continue to receive `null` on teardown as before.
	*
	* It's also possible to _disable_ a ref (and its behaviour) by simply not
	* passing the ref.
	*
	* ```jsx
	* const ref = useCallback( ( node ) => {
	*   node.addEventListener( ... );
	*   return () => {
	*     node.removeEventListener( ... );
	*   };
	* }, [ ...dependencies ] );
	* const otherRef = useRef();
	* const mergedRefs = useMergeRefs( [
	*   enabled && ref,
	*   otherRef,
	* ] );
	* return <div ref={ mergedRefs } />;
	* ```
	*
	* @param refs The refs to be merged.
	* @return The merged ref callback.
	*/
	function useMergeRefs(refs) {
		const elementRef = (0, _wordpress_element.useRef)(null);
		const attachedRefsRef = (0, _wordpress_element.useRef)([]);
		const currentRefsRef = (0, _wordpress_element.useRef)(refs);
		const cleanupsRef = (0, _wordpress_element.useRef)([]);
		currentRefsRef.current = refs;
		(0, _wordpress_element.useLayoutEffect)(() => {
			const element = elementRef.current;
			if (element === null) return;
			refs.forEach((ref, index) => {
				const attachedRef = attachedRefsRef.current[index];
				if (ref !== attachedRef) {
					detachRef(attachedRef, index, cleanupsRef.current);
					cleanupsRef.current[index] = assignRef(ref, element);
				}
			});
			attachedRefsRef.current = refs;
		}, refs);
		return (0, _wordpress_element.useCallback)((value) => {
			elementRef.current = value;
			if (value === null) {
				attachedRefsRef.current.forEach((ref, index) => {
					detachRef(ref, index, cleanupsRef.current);
				});
				attachedRefsRef.current = [];
			} else {
				attachedRefsRef.current = currentRefsRef.current;
				attachedRefsRef.current.forEach((ref, index) => {
					cleanupsRef.current[index] = assignRef(ref, value);
				});
			}
		}, []);
	}

// packages/compose/build-module/hooks/use-dialog/index.mjs
/**
	* Returns a ref and props to apply to a dialog wrapper to enable the following behaviors:
	*  - constrained tabbing.
	*  - focus on mount.
	*  - return focus on unmount.
	*  - focus outside.
	*
	* @param options Dialog Options.
	*/
	function useDialog(options) {
		const currentOptions = (0, _wordpress_element.useRef)(void 0);
		const { constrainTabbing = options.focusOnMount !== false } = options;
		(0, _wordpress_element.useEffect)(() => {
			currentOptions.current = options;
		}, Object.values(options));
		const constrainedTabbingRef = useConstrainedTabbing();
		const focusOnMountRef = useFocusOnMount(options.focusOnMount);
		const focusReturnRef = useFocusReturn();
		const focusOutsideProps = useFocusOutside((event) => {
			if (currentOptions.current?.__unstableOnClose) currentOptions.current.__unstableOnClose("focus-outside", event);
			else if (currentOptions.current?.onClose) currentOptions.current.onClose();
		});
		const onKeyDown = (0, _wordpress_element.useCallback)((event) => {
			currentOptions.current?.onKeyDown?.(event);
			if (event.key === "Escape" && !event.defaultPrevented && currentOptions.current?.onClose) {
				event.preventDefault();
				event.stopPropagation();
				currentOptions.current.onClose();
			}
		}, []);
		return [useMergeRefs([
			constrainTabbing ? constrainedTabbingRef : null,
			options.focusOnMount !== false ? focusReturnRef : null,
			options.focusOnMount !== false ? focusOnMountRef : null
		]), {
			...focusOutsideProps,
			onKeyDown,
			tabIndex: -1
		}];
	}

// packages/compose/build-module/utils/debounce/index.mjs
/**
	* A simplified and properly typed version of lodash's `debounce`, that
	* always uses timers instead of sometimes using rAF.
	*
	* Creates a debounced function that delays invoking `func` until after `wait`
	* milliseconds have elapsed since the last time the debounced function was
	* invoked. The debounced function comes with a `cancel` method to cancel delayed
	* `func` invocations and a `flush` method to immediately invoke them. Provide
	* `options` to indicate whether `func` should be invoked on the leading and/or
	* trailing edge of the `wait` timeout. The `func` is invoked with the last
	* arguments provided to the debounced function. Subsequent calls to the debounced
	* function return the result of the last `func` invocation.
	*
	* **Note:** If `leading` and `trailing` options are `true`, `func` is
	* invoked on the trailing edge of the timeout only if the debounced function
	* is invoked more than once during the `wait` timeout.
	*
	* If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	* until the next tick, similar to `setTimeout` with a timeout of `0`.
	*
	* @param {Function}                   func             The function to debounce.
	* @param {number}                     wait             The number of milliseconds to delay.
	* @param {Partial< DebounceOptions >} options          The options object.
	* @param {boolean}                    options.leading  Specify invoking on the leading edge of the timeout.
	* @param {number}                     options.maxWait  The maximum time `func` is allowed to be delayed before it's invoked.
	* @param {boolean}                    options.trailing Specify invoking on the trailing edge of the timeout.
	*
	* @return Returns the new debounced function.
	*/
	const debounce = (func, wait, options) => {
		let lastArgs;
		let lastThis;
		let maxWait = 0;
		let result;
		let timerId;
		let lastCallTime;
		let lastInvokeTime = 0;
		let leading = false;
		let maxing = false;
		let trailing = true;
		if (options) {
			leading = !!options.leading;
			maxing = "maxWait" in options;
			if (options.maxWait !== void 0) maxWait = Math.max(options.maxWait, wait);
			trailing = "trailing" in options ? !!options.trailing : trailing;
		}
		function invokeFunc(time) {
			const args = lastArgs;
			const thisArg = lastThis;
			lastArgs = void 0;
			lastThis = void 0;
			lastInvokeTime = time;
			result = func.apply(thisArg, args);
			return result;
		}
		function startTimer(pendingFunc, waitTime) {
			timerId = setTimeout(pendingFunc, waitTime);
		}
		function cancelTimer() {
			if (timerId !== void 0) clearTimeout(timerId);
		}
		function leadingEdge(time) {
			lastInvokeTime = time;
			startTimer(timerExpired, wait);
			return leading ? invokeFunc(time) : result;
		}
		function getTimeSinceLastCall(time) {
			return time - (lastCallTime || 0);
		}
		function remainingWait(time) {
			const timeSinceLastCall = getTimeSinceLastCall(time);
			const timeSinceLastInvoke = time - lastInvokeTime;
			const timeWaiting = wait - timeSinceLastCall;
			return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
		}
		function shouldInvoke(time) {
			const timeSinceLastCall = getTimeSinceLastCall(time);
			const timeSinceLastInvoke = time - lastInvokeTime;
			return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
		}
		function timerExpired() {
			const time = Date.now();
			if (shouldInvoke(time)) return trailingEdge(time);
			startTimer(timerExpired, remainingWait(time));
		}
		function clearTimer() {
			timerId = void 0;
		}
		function trailingEdge(time) {
			clearTimer();
			if (trailing && lastArgs) return invokeFunc(time);
			lastArgs = lastThis = void 0;
			return result;
		}
		function cancel() {
			cancelTimer();
			lastInvokeTime = 0;
			clearTimer();
			lastArgs = lastCallTime = lastThis = void 0;
		}
		function flush() {
			return pending() ? trailingEdge(Date.now()) : result;
		}
		function pending() {
			return timerId !== void 0;
		}
		function debounced(...args) {
			const time = Date.now();
			const isInvoking = shouldInvoke(time);
			lastArgs = args;
			lastThis = this;
			lastCallTime = time;
			if (isInvoking) {
				if (!pending()) return leadingEdge(lastCallTime);
				if (maxing) {
					startTimer(timerExpired, wait);
					return invokeFunc(lastCallTime);
				}
			}
			if (!pending()) startTimer(timerExpired, wait);
			return result;
		}
		debounced.cancel = cancel;
		debounced.flush = flush;
		debounced.pending = pending;
		return debounced;
	};

// packages/compose/build-module/hooks/use-disabled/index.mjs
/**
	* In some circumstances, such as block previews, all focusable DOM elements
	* (input fields, links, buttons, etc.) need to be disabled. This hook adds the
	* behavior to disable nested DOM elements to the returned ref.
	*
	* If you can, prefer the use of the inert HTML attribute.
	*
	* @param {Object}   config            Configuration object.
	* @param {boolean=} config.isDisabled Whether the element should be disabled.
	* @return {React.RefCallback<HTMLElement>} Element Ref.
	*
	* @example
	* ```js
	* import { useDisabled } from '@wordpress/compose';
	*
	* const DisabledExample = () => {
	* 	const disabledRef = useDisabled();
	*	return (
	*		<div ref={ disabledRef }>
	*			<a href="#">This link will have tabindex set to -1</a>
	*			<input placeholder="This input will have the disabled attribute added to it." type="text" />
	*		</div>
	*	);
	* };
	* ```
	*/
	function useDisabled({ isDisabled: isDisabledProp = false } = {}) {
		return useRefEffect((node) => {
			if (isDisabledProp) return;
			const defaultView = node?.ownerDocument?.defaultView;
			if (!defaultView) return;
			/** A variable keeping track of the previous updates in order to restore them. */
			const updates = [];
			const disable = () => {
				node.childNodes.forEach((child) => {
					if (!(child instanceof defaultView.HTMLElement)) return;
					if (!child.hasAttribute("inert")) {
						child.setAttribute("inert", "true");
						updates.push(() => {
							child.removeAttribute("inert");
						});
					}
				});
			};
			const debouncedDisable = debounce(disable, 0, { leading: true });
			disable();
			/** @type {MutationObserver | undefined} */
			const observer = new window.MutationObserver(debouncedDisable);
			observer.observe(node, { childList: true });
			return () => {
				if (observer) observer.disconnect();
				debouncedDisable.cancel();
				updates.forEach((update) => update());
			};
		}, [isDisabledProp]);
	}

// packages/compose/build-module/hooks/use-event/index.mjs
/**
	* Creates a stable callback function that has access to the latest state and
	* can be used within event handlers and effect callbacks. Throws when used in
	* the render phase.
	*
	* @param callback The callback function to wrap.
	*
	* @example
	*
	* ```tsx
	* function Component( props ) {
	*   const onClick = useEvent( props.onClick );
	*   useEffect( () => {
	*     onClick();
	*     // Won't trigger the effect again when props.onClick is updated.
	*   }, [ onClick ] );
	*   // Won't re-render Button when props.onClick is updated (if `Button` is
	*   // wrapped in `React.memo`).
	*   return <Button onClick={ onClick } />;
	* }
	* ```
	*/
	function useEvent(callback) {
		const ref = (0, _wordpress_element.useRef)(() => {
			throw new Error("Callbacks created with `useEvent` cannot be called during rendering.");
		});
		(0, _wordpress_element.useInsertionEffect)(() => {
			ref.current = callback;
		});
		return (0, _wordpress_element.useCallback)((...args) => ref.current?.(...args), []);
	}

// packages/compose/build-module/hooks/use-isomorphic-layout-effect/index.mjs
/**
	* Preferred over direct usage of `useLayoutEffect` when supporting
	* server rendered components (SSR) because currently React
	* throws a warning when using useLayoutEffect in that environment.
	*/
	const useIsomorphicLayoutEffect = typeof window !== "undefined" ? _wordpress_element.useLayoutEffect : _wordpress_element.useEffect;

// packages/compose/build-module/hooks/use-dragging/index.mjs
/**
	* Hook to manage drag events with proper event handling
	*
	* @param props             Drag handlers
	* @param props.onDragStart
	* @param props.onDragMove
	* @param props.onDragEnd
	* @return Drag state and handlers
	*/
	function useDragging({ onDragStart, onDragMove, onDragEnd }) {
		const [isDragging, setIsDragging] = (0, _wordpress_element.useState)(false);
		const eventsRef = (0, _wordpress_element.useRef)({
			onDragStart,
			onDragMove,
			onDragEnd
		});
		useIsomorphicLayoutEffect(() => {
			eventsRef.current.onDragStart = onDragStart;
			eventsRef.current.onDragMove = onDragMove;
			eventsRef.current.onDragEnd = onDragEnd;
		}, [
			onDragStart,
			onDragMove,
			onDragEnd
		]);
		const onMouseMove = (0, _wordpress_element.useCallback)((event) => {
			eventsRef.current.onDragMove?.(event);
		}, []);
		const endDrag = (0, _wordpress_element.useCallback)(function handleEndDrag(event) {
			eventsRef.current.onDragEnd?.(event);
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", handleEndDrag);
			setIsDragging(false);
		}, [onMouseMove]);
		const startDrag = (0, _wordpress_element.useCallback)((event) => {
			eventsRef.current.onDragStart?.(event);
			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", endDrag);
			setIsDragging(true);
		}, [onMouseMove, endDrag]);
		(0, _wordpress_element.useEffect)(() => {
			return () => {
				if (isDragging) {
					document.removeEventListener("mousemove", onMouseMove);
					document.removeEventListener("mouseup", endDrag);
				}
			};
		}, [
			isDragging,
			onMouseMove,
			endDrag
		]);
		return {
			startDrag,
			endDrag,
			isDragging
		};
	}

// node_modules/.store/mousetrap@1.6.5-wXrhfo95WfPhGlz0ygmxKA/node_modules/mousetrap/mousetrap.js
	var require_mousetrap = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		/**
		* Copyright 2012-2017 Craig Campbell
		*
		* Licensed under the Apache License, Version 2.0 (the "License");
		* you may not use this file except in compliance with the License.
		* You may obtain a copy of the License at
		*
		* http://www.apache.org/licenses/LICENSE-2.0
		*
		* Unless required by applicable law or agreed to in writing, software
		* distributed under the License is distributed on an "AS IS" BASIS,
		* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		* See the License for the specific language governing permissions and
		* limitations under the License.
		*
		* Mousetrap is a simple keyboard shortcut library for Javascript with
		* no external dependencies
		*
		* @version 1.6.5
		* @url craig.is/killing/mice
		*/
		(function(window, document, undefined) {
			if (!window) return;
			/**
			* mapping of special keycodes to their corresponding keys
			*
			* everything in this dictionary cannot use keypress events
			* so it has to be here to map to the correct keycodes for
			* keyup/keydown events
			*
			* @type {Object}
			*/
			var _MAP = {
				8: "backspace",
				9: "tab",
				13: "enter",
				16: "shift",
				17: "ctrl",
				18: "alt",
				20: "capslock",
				27: "esc",
				32: "space",
				33: "pageup",
				34: "pagedown",
				35: "end",
				36: "home",
				37: "left",
				38: "up",
				39: "right",
				40: "down",
				45: "ins",
				46: "del",
				91: "meta",
				93: "meta",
				224: "meta"
			};
			/**
			* mapping for special characters so they can support
			*
			* this dictionary is only used incase you want to bind a
			* keyup or keydown event to one of these keys
			*
			* @type {Object}
			*/
			var _KEYCODE_MAP = {
				106: "*",
				107: "+",
				109: "-",
				110: ".",
				111: "/",
				186: ";",
				187: "=",
				188: ",",
				189: "-",
				190: ".",
				191: "/",
				192: "`",
				219: "[",
				220: "\\",
				221: "]",
				222: "'"
			};
			/**
			* this is a mapping of keys that require shift on a US keypad
			* back to the non shift equivelents
			*
			* this is so you can use keyup events with these keys
			*
			* note that this will only work reliably on US keyboards
			*
			* @type {Object}
			*/
			var _SHIFT_MAP = {
				"~": "`",
				"!": "1",
				"@": "2",
				"#": "3",
				"$": "4",
				"%": "5",
				"^": "6",
				"&": "7",
				"*": "8",
				"(": "9",
				")": "0",
				"_": "-",
				"+": "=",
				":": ";",
				"\"": "'",
				"<": ",",
				">": ".",
				"?": "/",
				"|": "\\"
			};
			/**
			* this is a list of special strings you can use to map
			* to modifier keys when you specify your keyboard shortcuts
			*
			* @type {Object}
			*/
			var _SPECIAL_ALIASES = {
				"option": "alt",
				"command": "meta",
				"return": "enter",
				"escape": "esc",
				"plus": "+",
				"mod": /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta" : "ctrl"
			};
			/**
			* variable to store the flipped version of _MAP from above
			* needed to check if we should use keypress or not when no action
			* is specified
			*
			* @type {Object|undefined}
			*/
			var _REVERSE_MAP;
			/**
			* loop through the f keys, f1 to f19 and add them to the map
			* programatically
			*/
			for (var i = 1; i < 20; ++i) _MAP[111 + i] = "f" + i;
			/**
			* loop through to map numbers on the numeric keypad
			*/
			for (i = 0; i <= 9; ++i) _MAP[i + 96] = i.toString();
			/**
			* cross browser add event method
			*
			* @param {Element|HTMLDocument} object
			* @param {string} type
			* @param {Function} callback
			* @returns void
			*/
			function _addEvent(object, type, callback) {
				if (object.addEventListener) {
					object.addEventListener(type, callback, false);
					return;
				}
				object.attachEvent("on" + type, callback);
			}
			/**
			* takes the event and returns the key character
			*
			* @param {Event} e
			* @return {string}
			*/
			function _characterFromEvent(e) {
				if (e.type == "keypress") {
					var character = String.fromCharCode(e.which);
					if (!e.shiftKey) character = character.toLowerCase();
					return character;
				}
				if (_MAP[e.which]) return _MAP[e.which];
				if (_KEYCODE_MAP[e.which]) return _KEYCODE_MAP[e.which];
				return String.fromCharCode(e.which).toLowerCase();
			}
			/**
			* checks if two arrays are equal
			*
			* @param {Array} modifiers1
			* @param {Array} modifiers2
			* @returns {boolean}
			*/
			function _modifiersMatch(modifiers1, modifiers2) {
				return modifiers1.sort().join(",") === modifiers2.sort().join(",");
			}
			/**
			* takes a key event and figures out what the modifiers are
			*
			* @param {Event} e
			* @returns {Array}
			*/
			function _eventModifiers(e) {
				var modifiers = [];
				if (e.shiftKey) modifiers.push("shift");
				if (e.altKey) modifiers.push("alt");
				if (e.ctrlKey) modifiers.push("ctrl");
				if (e.metaKey) modifiers.push("meta");
				return modifiers;
			}
			/**
			* prevents default for this event
			*
			* @param {Event} e
			* @returns void
			*/
			function _preventDefault(e) {
				if (e.preventDefault) {
					e.preventDefault();
					return;
				}
				e.returnValue = false;
			}
			/**
			* stops propogation for this event
			*
			* @param {Event} e
			* @returns void
			*/
			function _stopPropagation(e) {
				if (e.stopPropagation) {
					e.stopPropagation();
					return;
				}
				e.cancelBubble = true;
			}
			/**
			* determines if the keycode specified is a modifier key or not
			*
			* @param {string} key
			* @returns {boolean}
			*/
			function _isModifier(key) {
				return key == "shift" || key == "ctrl" || key == "alt" || key == "meta";
			}
			/**
			* reverses the map lookup so that we can look for specific keys
			* to see what can and can't use keypress
			*
			* @return {Object}
			*/
			function _getReverseMap() {
				if (!_REVERSE_MAP) {
					_REVERSE_MAP = {};
					for (var key in _MAP) {
						if (key > 95 && key < 112) continue;
						if (_MAP.hasOwnProperty(key)) _REVERSE_MAP[_MAP[key]] = key;
					}
				}
				return _REVERSE_MAP;
			}
			/**
			* picks the best action based on the key combination
			*
			* @param {string} key - character for key
			* @param {Array} modifiers
			* @param {string=} action passed in
			*/
			function _pickBestAction(key, modifiers, action) {
				if (!action) action = _getReverseMap()[key] ? "keydown" : "keypress";
				if (action == "keypress" && modifiers.length) action = "keydown";
				return action;
			}
			/**
			* Converts from a string key combination to an array
			*
			* @param  {string} combination like "command+shift+l"
			* @return {Array}
			*/
			function _keysFromString(combination) {
				if (combination === "+") return ["+"];
				combination = combination.replace(/\+{2}/g, "+plus");
				return combination.split("+");
			}
			/**
			* Gets info for a specific key combination
			*
			* @param  {string} combination key combination ("command+s" or "a" or "*")
			* @param  {string=} action
			* @returns {Object}
			*/
			function _getKeyInfo(combination, action) {
				var keys;
				var key;
				var i;
				var modifiers = [];
				keys = _keysFromString(combination);
				for (i = 0; i < keys.length; ++i) {
					key = keys[i];
					if (_SPECIAL_ALIASES[key]) key = _SPECIAL_ALIASES[key];
					if (action && action != "keypress" && _SHIFT_MAP[key]) {
						key = _SHIFT_MAP[key];
						modifiers.push("shift");
					}
					if (_isModifier(key)) modifiers.push(key);
				}
				action = _pickBestAction(key, modifiers, action);
				return {
					key,
					modifiers,
					action
				};
			}
			function _belongsTo(element, ancestor) {
				if (element === null || element === document) return false;
				if (element === ancestor) return true;
				return _belongsTo(element.parentNode, ancestor);
			}
			function Mousetrap(targetElement) {
				var self = this;
				targetElement = targetElement || document;
				if (!(self instanceof Mousetrap)) return new Mousetrap(targetElement);
				/**
				* element to attach key events to
				*
				* @type {Element}
				*/
				self.target = targetElement;
				/**
				* a list of all the callbacks setup via Mousetrap.bind()
				*
				* @type {Object}
				*/
				self._callbacks = {};
				/**
				* direct map of string combinations to callbacks used for trigger()
				*
				* @type {Object}
				*/
				self._directMap = {};
				/**
				* keeps track of what level each sequence is at since multiple
				* sequences can start out with the same sequence
				*
				* @type {Object}
				*/
				var _sequenceLevels = {};
				/**
				* variable to store the setTimeout call
				*
				* @type {null|number}
				*/
				var _resetTimer;
				/**
				* temporary state where we will ignore the next keyup
				*
				* @type {boolean|string}
				*/
				var _ignoreNextKeyup = false;
				/**
				* temporary state where we will ignore the next keypress
				*
				* @type {boolean}
				*/
				var _ignoreNextKeypress = false;
				/**
				* are we currently inside of a sequence?
				* type of action ("keyup" or "keydown" or "keypress") or false
				*
				* @type {boolean|string}
				*/
				var _nextExpectedAction = false;
				/**
				* resets all sequence counters except for the ones passed in
				*
				* @param {Object} doNotReset
				* @returns void
				*/
				function _resetSequences(doNotReset) {
					doNotReset = doNotReset || {};
					var activeSequences = false, key;
					for (key in _sequenceLevels) {
						if (doNotReset[key]) {
							activeSequences = true;
							continue;
						}
						_sequenceLevels[key] = 0;
					}
					if (!activeSequences) _nextExpectedAction = false;
				}
				/**
				* finds all callbacks that match based on the keycode, modifiers,
				* and action
				*
				* @param {string} character
				* @param {Array} modifiers
				* @param {Event|Object} e
				* @param {string=} sequenceName - name of the sequence we are looking for
				* @param {string=} combination
				* @param {number=} level
				* @returns {Array}
				*/
				function _getMatches(character, modifiers, e, sequenceName, combination, level) {
					var i;
					var callback;
					var matches = [];
					var action = e.type;
					if (!self._callbacks[character]) return [];
					if (action == "keyup" && _isModifier(character)) modifiers = [character];
					for (i = 0; i < self._callbacks[character].length; ++i) {
						callback = self._callbacks[character][i];
						if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) continue;
						if (action != callback.action) continue;
						if (action == "keypress" && !e.metaKey && !e.ctrlKey || _modifiersMatch(modifiers, callback.modifiers)) {
							var deleteCombo = !sequenceName && callback.combo == combination;
							var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
							if (deleteCombo || deleteSequence) self._callbacks[character].splice(i, 1);
							matches.push(callback);
						}
					}
					return matches;
				}
				/**
				* actually calls the callback function
				*
				* if your callback function returns false this will use the jquery
				* convention - prevent default and stop propogation on the event
				*
				* @param {Function} callback
				* @param {Event} e
				* @returns void
				*/
				function _fireCallback(callback, e, combo, sequence) {
					if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) return;
					if (callback(e, combo) === false) {
						_preventDefault(e);
						_stopPropagation(e);
					}
				}
				/**
				* handles a character key event
				*
				* @param {string} character
				* @param {Array} modifiers
				* @param {Event} e
				* @returns void
				*/
				self._handleKey = function(character, modifiers, e) {
					var callbacks = _getMatches(character, modifiers, e);
					var i;
					var doNotReset = {};
					var maxLevel = 0;
					var processedSequenceCallback = false;
					for (i = 0; i < callbacks.length; ++i) if (callbacks[i].seq) maxLevel = Math.max(maxLevel, callbacks[i].level);
					for (i = 0; i < callbacks.length; ++i) {
						if (callbacks[i].seq) {
							if (callbacks[i].level != maxLevel) continue;
							processedSequenceCallback = true;
							doNotReset[callbacks[i].seq] = 1;
							_fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
							continue;
						}
						if (!processedSequenceCallback) _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
					}
					var ignoreThisKeypress = e.type == "keypress" && _ignoreNextKeypress;
					if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) _resetSequences(doNotReset);
					_ignoreNextKeypress = processedSequenceCallback && e.type == "keydown";
				};
				/**
				* handles a keydown event
				*
				* @param {Event} e
				* @returns void
				*/
				function _handleKeyEvent(e) {
					if (typeof e.which !== "number") e.which = e.keyCode;
					var character = _characterFromEvent(e);
					if (!character) return;
					if (e.type == "keyup" && _ignoreNextKeyup === character) {
						_ignoreNextKeyup = false;
						return;
					}
					self.handleKey(character, _eventModifiers(e), e);
				}
				/**
				* called to set a 1 second timeout on the specified sequence
				*
				* this is so after each key press in the sequence you have 1 second
				* to press the next key before you have to start over
				*
				* @returns void
				*/
				function _resetSequenceTimer() {
					clearTimeout(_resetTimer);
					_resetTimer = setTimeout(_resetSequences, 1e3);
				}
				/**
				* binds a key sequence to an event
				*
				* @param {string} combo - combo specified in bind call
				* @param {Array} keys
				* @param {Function} callback
				* @param {string=} action
				* @returns void
				*/
				function _bindSequence(combo, keys, callback, action) {
					_sequenceLevels[combo] = 0;
					/**
					* callback to increase the sequence level for this sequence and reset
					* all other sequences that were active
					*
					* @param {string} nextAction
					* @returns {Function}
					*/
					function _increaseSequence(nextAction) {
						return function() {
							_nextExpectedAction = nextAction;
							++_sequenceLevels[combo];
							_resetSequenceTimer();
						};
					}
					/**
					* wraps the specified callback inside of another function in order
					* to reset all sequence counters as soon as this sequence is done
					*
					* @param {Event} e
					* @returns void
					*/
					function _callbackAndReset(e) {
						_fireCallback(callback, e, combo);
						if (action !== "keyup") _ignoreNextKeyup = _characterFromEvent(e);
						setTimeout(_resetSequences, 10);
					}
					for (var i = 0; i < keys.length; ++i) {
						var wrappedCallback = i + 1 === keys.length ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
						_bindSingle(keys[i], wrappedCallback, action, combo, i);
					}
				}
				/**
				* binds a single keyboard combination
				*
				* @param {string} combination
				* @param {Function} callback
				* @param {string=} action
				* @param {string=} sequenceName - name of sequence if part of sequence
				* @param {number=} level - what part of the sequence the command is
				* @returns void
				*/
				function _bindSingle(combination, callback, action, sequenceName, level) {
					self._directMap[combination + ":" + action] = callback;
					combination = combination.replace(/\s+/g, " ");
					var sequence = combination.split(" ");
					var info;
					if (sequence.length > 1) {
						_bindSequence(combination, sequence, callback, action);
						return;
					}
					info = _getKeyInfo(combination, action);
					self._callbacks[info.key] = self._callbacks[info.key] || [];
					_getMatches(info.key, info.modifiers, { type: info.action }, sequenceName, combination, level);
					self._callbacks[info.key][sequenceName ? "unshift" : "push"]({
						callback,
						modifiers: info.modifiers,
						action: info.action,
						seq: sequenceName,
						level,
						combo: combination
					});
				}
				/**
				* binds multiple combinations to the same callback
				*
				* @param {Array} combinations
				* @param {Function} callback
				* @param {string|undefined} action
				* @returns void
				*/
				self._bindMultiple = function(combinations, callback, action) {
					for (var i = 0; i < combinations.length; ++i) _bindSingle(combinations[i], callback, action);
				};
				_addEvent(targetElement, "keypress", _handleKeyEvent);
				_addEvent(targetElement, "keydown", _handleKeyEvent);
				_addEvent(targetElement, "keyup", _handleKeyEvent);
			}
			/**
			* binds an event to mousetrap
			*
			* can be a single key, a combination of keys separated with +,
			* an array of keys, or a sequence of keys separated by spaces
			*
			* be sure to list the modifier keys first to make sure that the
			* correct key ends up getting bound (the last key in the pattern)
			*
			* @param {string|Array} keys
			* @param {Function} callback
			* @param {string=} action - 'keypress', 'keydown', or 'keyup'
			* @returns void
			*/
			Mousetrap.prototype.bind = function(keys, callback, action) {
				var self = this;
				keys = keys instanceof Array ? keys : [keys];
				self._bindMultiple.call(self, keys, callback, action);
				return self;
			};
			/**
			* unbinds an event to mousetrap
			*
			* the unbinding sets the callback function of the specified key combo
			* to an empty function and deletes the corresponding key in the
			* _directMap dict.
			*
			* TODO: actually remove this from the _callbacks dictionary instead
			* of binding an empty function
			*
			* the keycombo+action has to be exactly the same as
			* it was defined in the bind method
			*
			* @param {string|Array} keys
			* @param {string} action
			* @returns void
			*/
			Mousetrap.prototype.unbind = function(keys, action) {
				var self = this;
				return self.bind.call(self, keys, function() {}, action);
			};
			/**
			* triggers an event that has already been bound
			*
			* @param {string} keys
			* @param {string=} action
			* @returns void
			*/
			Mousetrap.prototype.trigger = function(keys, action) {
				var self = this;
				if (self._directMap[keys + ":" + action]) self._directMap[keys + ":" + action]({}, keys);
				return self;
			};
			/**
			* resets the library back to its initial state.  this is useful
			* if you want to clear out the current keyboard shortcuts and bind
			* new ones - for example if you switch to another page
			*
			* @returns void
			*/
			Mousetrap.prototype.reset = function() {
				var self = this;
				self._callbacks = {};
				self._directMap = {};
				return self;
			};
			/**
			* should we stop this event before firing off callbacks
			*
			* @param {Event} e
			* @param {Element} element
			* @return {boolean}
			*/
			Mousetrap.prototype.stopCallback = function(e, element) {
				var self = this;
				if ((" " + element.className + " ").indexOf(" mousetrap ") > -1) return false;
				if (_belongsTo(element, self.target)) return false;
				if ("composedPath" in e && typeof e.composedPath === "function") {
					var initialEventTarget = e.composedPath()[0];
					if (initialEventTarget !== e.target) element = initialEventTarget;
				}
				return element.tagName == "INPUT" || element.tagName == "SELECT" || element.tagName == "TEXTAREA" || element.isContentEditable;
			};
			/**
			* exposes _handleKey publicly so it can be overwritten by extensions
			*/
			Mousetrap.prototype.handleKey = function() {
				var self = this;
				return self._handleKey.apply(self, arguments);
			};
			/**
			* allow custom key mappings
			*/
			Mousetrap.addKeycodes = function(object) {
				for (var key in object) if (object.hasOwnProperty(key)) _MAP[key] = object[key];
				_REVERSE_MAP = null;
			};
			/**
			* Init the global mousetrap functions
			*
			* This method is needed to allow the global mousetrap functions to work
			* now that mousetrap is a constructor function.
			*/
			Mousetrap.init = function() {
				var documentMousetrap = Mousetrap(document);
				for (var method in documentMousetrap) if (method.charAt(0) !== "_") Mousetrap[method] = function(method) {
					return function() {
						return documentMousetrap[method].apply(documentMousetrap, arguments);
					};
				}(method);
			};
			Mousetrap.init();
			window.Mousetrap = Mousetrap;
			if (typeof module !== "undefined" && module.exports) module.exports = Mousetrap;
			if (typeof define === "function" && define.amd) define(function() {
				return Mousetrap;
			});
		})(typeof window !== "undefined" ? window : null, typeof window !== "undefined" ? document : null);
	}));

// node_modules/.store/mousetrap@1.6.5-wXrhfo95WfPhGlz0ygmxKA/node_modules/mousetrap/plugins/global-bind/mousetrap-global-bind.js
var import_mousetrap = /* @__PURE__ */ __toESM(require_mousetrap(), 1);
/**
	* adds a bindGlobal method to Mousetrap that allows you to
	* bind specific keyboard shortcuts that will still work
	* inside a text input field
	*
	* usage:
	* Mousetrap.bindGlobal('ctrl+s', _saveChanges);
	*/
	(function(Mousetrap) {
		if (!Mousetrap) return;
		var _globalCallbacks = {};
		var _originalStopCallback = Mousetrap.prototype.stopCallback;
		Mousetrap.prototype.stopCallback = function(e, element, combo, sequence) {
			var self = this;
			if (self.paused) return true;
			if (_globalCallbacks[combo] || _globalCallbacks[sequence]) return false;
			return _originalStopCallback.call(self, e, element, combo);
		};
		Mousetrap.prototype.bindGlobal = function(keys, callback, action) {
			this.bind(keys, callback, action);
			if (keys instanceof Array) {
				for (var i = 0; i < keys.length; i++) _globalCallbacks[keys[i]] = true;
				return;
			}
			_globalCallbacks[keys] = true;
		};
		Mousetrap.init();
	})(typeof Mousetrap !== "undefined" ? Mousetrap : void 0);

// packages/compose/build-module/hooks/use-keyboard-shortcut/index.mjs
/**
	* Attach a keyboard shortcut handler.
	*
	* @see https://craig.is/killing/mice#api.bind for information about the `callback` parameter.
	*
	* @param shortcuts          Keyboard Shortcuts.
	* @param callback           Shortcut callback.
	* @param options            Shortcut options.
	* @param options.bindGlobal
	* @param options.eventName
	* @param options.isDisabled
	* @param options.target
	*/
	function useKeyboardShortcut(shortcuts, callback, { bindGlobal = false, eventName = "keydown", isDisabled = false, target } = {}) {
		const currentCallbackRef = (0, _wordpress_element.useRef)(callback);
		(0, _wordpress_element.useEffect)(() => {
			currentCallbackRef.current = callback;
		}, [callback]);
		(0, _wordpress_element.useEffect)(() => {
			if (isDisabled) return;
			const mousetrap = new import_mousetrap.default(target && target.current ? target.current : document);
			(Array.isArray(shortcuts) ? shortcuts : [shortcuts]).forEach((shortcut) => {
				const keys = shortcut.split("+");
				const modifiers = new Set(keys.filter((value) => value.length > 1));
				const hasAlt = modifiers.has("alt");
				const hasShift = modifiers.has("shift");
				if ((0, _wordpress_keycodes.isAppleOS)() && (modifiers.size === 1 && hasAlt || modifiers.size === 2 && hasAlt && hasShift)) throw new Error(`Cannot bind ${shortcut}. Alt and Shift+Alt modifiers are reserved for character input.`);
				mousetrap[bindGlobal ? "bindGlobal" : "bind"](shortcut, (...args) => currentCallbackRef.current(...args), eventName);
			});
			return () => {
				mousetrap.reset();
			};
		}, [
			shortcuts,
			bindGlobal,
			eventName,
			target,
			isDisabled
		]);
	}

// packages/compose/build-module/hooks/use-media-query/index.mjs
	const perWindowCache = /* @__PURE__ */ new WeakMap();
	const EMPTY_SUBSCRIBER = {
		subscribe: () => () => {},
		getValue: () => false
	};
	function getMQLSubscriber(view, query) {
		if (!view || !query || typeof view.matchMedia !== "function") return EMPTY_SUBSCRIBER;
		let queryCache = perWindowCache.get(view);
		if (!queryCache) {
			queryCache = /* @__PURE__ */ new Map();
			perWindowCache.set(view, queryCache);
		}
		const cached = queryCache.get(query);
		if (cached) return cached;
		const mediaQueryList = view.matchMedia(query);
		const listeners = /* @__PURE__ */ new Set();
		const notify = () => {
			for (const listener of listeners) listener();
		};
		const subscriber = {
			subscribe(onStoreChange) {
				if (listeners.size === 0) mediaQueryList.addEventListener?.("change", notify);
				listeners.add(onStoreChange);
				return () => {
					listeners.delete(onStoreChange);
					if (listeners.size === 0) mediaQueryList.removeEventListener?.("change", notify);
				};
			},
			getValue() {
				return mediaQueryList.matches;
			}
		};
		queryCache.set(query, subscriber);
		return subscriber;
	}
	/**
	* Runs a media query and returns its value when it changes.
	*
	* @param [query] Media Query.
	* @param [view]  Window instance, else default to global window
	* @return return value of the media query.
	*/
	function useMediaQuery(query, view = typeof window !== "undefined" ? window : void 0) {
		const source = getMQLSubscriber(view, query);
		return (0, _wordpress_element.useSyncExternalStore)(source.subscribe, source.getValue, () => false);
	}

// packages/compose/build-module/hooks/use-previous/index.mjs
/**
	* Use something's value from the previous render.
	* Based on https://usehooks.com/usePrevious/.
	*
	* @param value The value to track.
	*
	* @return The value from the previous render.
	*/
	function usePrevious(value) {
		const ref = (0, _wordpress_element.useRef)(void 0);
		(0, _wordpress_element.useEffect)(() => {
			ref.current = value;
		}, [value]);
		return ref.current;
	}

// packages/compose/build-module/hooks/use-reduced-motion/index.mjs
/**
	* Hook returning whether the user has a preference for reduced motion.
	*
	* @return Reduced motion preference value.
	*/
	const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

// packages/compose/build-module/hooks/use-state-with-history/index.mjs
	function undoRedoReducer(state, action) {
		switch (action.type) {
			case "UNDO": {
				const undoRecord = state.manager.undo();
				if (undoRecord) return {
					...state,
					value: undoRecord[0].changes.prop.from
				};
				return state;
			}
			case "REDO": {
				const redoRecord = state.manager.redo();
				if (redoRecord) return {
					...state,
					value: redoRecord[0].changes.prop.to
				};
				return state;
			}
			case "RECORD":
				state.manager.addRecord([{
					id: "object",
					changes: { prop: {
						from: state.value,
						to: action.value
					} }
				}], action.isStaged);
				return {
					...state,
					value: action.value
				};
		}
		return state;
	}
	function initReducer(value) {
		return {
			manager: (0, _wordpress_undo_manager.createUndoManager)(),
			value
		};
	}
	/**
	* useState with undo/redo history.
	*
	* @param initialValue Initial value.
	* @return Value, setValue, hasUndo, hasRedo, undo, redo.
	*/
	function useStateWithHistory(initialValue) {
		const [state, dispatch] = (0, _wordpress_element.useReducer)(undoRedoReducer, initialValue, initReducer);
		return {
			value: state.value,
			setValue: (0, _wordpress_element.useCallback)((newValue, isStaged) => {
				dispatch({
					type: "RECORD",
					value: newValue,
					isStaged
				});
			}, []),
			hasUndo: state.manager.hasUndo(),
			hasRedo: state.manager.hasRedo(),
			undo: (0, _wordpress_element.useCallback)(() => {
				dispatch({ type: "UNDO" });
			}, []),
			redo: (0, _wordpress_element.useCallback)(() => {
				dispatch({ type: "REDO" });
			}, [])
		};
	}

// packages/compose/build-module/hooks/use-viewport-match/index.mjs
/**
	* Hash of breakpoint names with pixel width at which it becomes effective.
	*
	* @see _breakpoints.scss
	*/
	const BREAKPOINTS = {
		xhuge: 1920,
		huge: 1440,
		wide: 1280,
		xlarge: 1080,
		large: 960,
		medium: 782,
		small: 600,
		mobile: 480
	};
	/**
	* Object mapping media query operators to the condition to be used.
	*/
	const CONDITIONS = {
		">=": "min-width",
		"<": "max-width"
	};
	/**
	* Object mapping media query operators to a function that evaluates if the operator matches.
	*/
	const OPERATOR_EVALUATORS = {
		">=": (breakpointValue, width) => width >= breakpointValue,
		"<": (breakpointValue, width) => width < breakpointValue
	};
	const ViewportMatchWidthContext = (0, _wordpress_element.createContext)(null);
	ViewportMatchWidthContext.displayName = "ViewportMatchWidthContext";
	/**
	* Returns true if the viewport matches the given query, or false otherwise.
	*
	* @param breakpoint Breakpoint size name.
	* @param operator   Viewport operator.
	* @param view       Window instance in which to perform viewport matching.
	*
	* @example
	*
	* ```ts
	* useViewportMatch( 'huge', '<' );
	* useViewportMatch( 'medium' );
	* ```
	*
	* @return Whether viewport matches query.
	*/
	const useViewportMatch = (breakpoint, operator = ">=", view = typeof window !== "undefined" ? window : void 0) => {
		const simulatedWidth = (0, _wordpress_element.useContext)(ViewportMatchWidthContext);
		const mediaQuery = !simulatedWidth && `screen and (${CONDITIONS[operator]}: ${BREAKPOINTS[breakpoint]}px)`;
		const mediaQueryResult = useMediaQuery(mediaQuery || void 0, view);
		if (simulatedWidth) return OPERATOR_EVALUATORS[operator](BREAKPOINTS[breakpoint], simulatedWidth);
		return mediaQueryResult;
	};
	useViewportMatch.__experimentalWidthProvider = ViewportMatchWidthContext.Provider;

// packages/compose/build-module/hooks/use-resize-observer/use-resize-observer.mjs
	function useResizeObserver$1(callback, resizeObserverOptions = {}) {
		const callbackEvent = useEvent(callback);
		const observedElementRef = (0, _wordpress_element.useRef)(null);
		const resizeObserverRef = (0, _wordpress_element.useRef)(void 0);
		(0, _wordpress_element.useEffect)(() => {
			if (observedElementRef.current) resizeObserverRef.current?.observe(observedElementRef.current, resizeObserverOptions);
			return () => resizeObserverRef.current?.disconnect();
		}, []);
		return useEvent((element) => {
			if (element === observedElementRef.current) return;
			resizeObserverRef.current ??= new ResizeObserver(callbackEvent);
			const { current: resizeObserver } = resizeObserverRef;
			if (observedElementRef.current) resizeObserver.unobserve(observedElementRef.current);
			observedElementRef.current = element ?? null;
			if (element) resizeObserver.observe(element, resizeObserverOptions);
		});
	}

// packages/compose/build-module/hooks/use-resize-observer/legacy/index.mjs
	const extractSize = (entry) => {
		let entrySize;
		if (!entry.contentBoxSize) entrySize = [entry.contentRect.width, entry.contentRect.height];
		else if (entry.contentBoxSize[0]) {
			const contentBoxSize = entry.contentBoxSize[0];
			entrySize = [contentBoxSize.inlineSize, contentBoxSize.blockSize];
		} else {
			const contentBoxSize = entry.contentBoxSize;
			entrySize = [contentBoxSize.inlineSize, contentBoxSize.blockSize];
		}
		const [width, height] = entrySize.map((d) => Math.round(d));
		return {
			width,
			height
		};
	};
	const RESIZE_ELEMENT_STYLES = {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		pointerEvents: "none",
		opacity: 0,
		overflow: "hidden",
		zIndex: -1
	};
	function ResizeElement({ onResize }) {
		const resizeElementRef = useResizeObserver$1((entries) => {
			onResize(extractSize(entries.at(-1)));
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			ref: resizeElementRef,
			style: RESIZE_ELEMENT_STYLES,
			"aria-hidden": "true"
		});
	}
	function sizeEquals(a, b) {
		return a.width === b.width && a.height === b.height;
	}
	const NULL_SIZE = {
		width: null,
		height: null
	};
	/**
	* Hook which allows to listen to the resize event of any target element when it changes size.
	* _Note: `useResizeObserver` will report `null` sizes until after first render.
	*
	* @example
	*
	* ```js
	* const App = () => {
	* 	const [ resizeListener, sizes ] = useResizeObserver();
	*
	* 	return (
	* 		<div>
	* 			{ resizeListener }
	* 			Your content here
	* 		</div>
	* 	);
	* };
	* ```
	*/
	function useLegacyResizeObserver() {
		const [size, setSize] = (0, _wordpress_element.useState)(NULL_SIZE);
		const previousSizeRef = (0, _wordpress_element.useRef)(NULL_SIZE);
		const handleResize = (0, _wordpress_element.useCallback)((newSize) => {
			if (!sizeEquals(previousSizeRef.current, newSize)) {
				previousSizeRef.current = newSize;
				setSize(newSize);
			}
		}, []);
		return [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ResizeElement, { onResize: handleResize }), size];
	}

// packages/compose/build-module/hooks/use-resize-observer/index.mjs
	function useResizeObserver(callback, options = {}) {
		return callback ? useResizeObserver$1(callback, options) : useLegacyResizeObserver();
	}

// packages/compose/build-module/hooks/use-async-list/index.mjs
/**
	* Returns the first items from list that are present on state.
	*
	* @param list  New array.
	* @param state Current state.
	* @return First items present in state.
	*/
	function getFirstItemsPresentInState(list, state) {
		const firstItems = [];
		for (let i = 0; i < list.length; i++) {
			const item = list[i];
			if (!state.includes(item)) break;
			firstItems.push(item);
		}
		return firstItems;
	}
	/**
	* React hook returns an array which items get asynchronously appended from a source array.
	* This behavior is useful if we want to render a list of items asynchronously for performance reasons.
	*
	* @param list   Source array.
	* @param config Configuration object.
	*
	* @return Async array.
	*/
	function useAsyncList(list, config = { step: 1 }) {
		const { step = 1 } = config;
		const [current, setCurrent] = (0, _wordpress_element.useState)([]);
		(0, _wordpress_element.useEffect)(() => {
			let firstItems = getFirstItemsPresentInState(list, current);
			if (firstItems.length < step) firstItems = firstItems.concat(list.slice(firstItems.length, step));
			setCurrent(firstItems);
			const asyncQueue = (0, _wordpress_priority_queue.createQueue)();
			for (let i = firstItems.length; i < list.length; i += step) asyncQueue.add({}, () => {
				(0, _wordpress_element.flushSync)(() => {
					setCurrent((state) => [...state, ...list.slice(i, i + step)]);
				});
			});
			return () => asyncQueue.reset();
		}, [list]);
		return current;
	}

// packages/compose/build-module/hooks/use-warn-on-change/index.mjs
/**
	* Hook that performs a shallow comparison between the previous value of an object
	* and the new one, if there's a difference, it prints it to the console.
	* This is useful in performance related work, to check why a component re-renders.
	*
	*  @example
	*
	* ```tsx
	* function MyComponent(props: Record<string, any>) {
	*    useWarnOnChange(props);
	*
	*    return "Something";
	* }
	* ```
	*
	* @param object Object which changes to compare.
	* @param prefix Just a prefix to show when console logging.
	*/
	function useWarnOnChange(object, prefix = "Change detection") {
		const previousValues = usePrevious(object);
		Object.entries(previousValues ?? []).forEach(([key, value]) => {
			if (value !== object[key]) console.warn(`${prefix}: ${key} key changed:`, value, object[key]);
		});
	}

// packages/compose/build-module/hooks/use-debounce/index.mjs
/**
	* Debounces a function similar to Lodash's `debounce`. A new debounced function will
	* be returned and any scheduled calls cancelled if any of the arguments change,
	* including the function to debounce, so please wrap functions created on
	* render in components in `useCallback`.
	*
	* @see https://lodash.com/docs/4#debounce
	*
	* @template TFunc
	*
	* @param    fn      The function to debounce.
	* @param    wait    The number of milliseconds to delay.
	* @param    options The options object.
	* @return          Debounced function.
	*/
	function useDebounce(fn, wait, options) {
		const debounced = (0, _wordpress_element.useMemo)(() => debounce(fn, wait ?? 0, options), [
			fn,
			wait,
			options?.leading,
			options?.trailing,
			options?.maxWait
		]);
		(0, _wordpress_element.useEffect)(() => () => debounced.cancel(), [debounced]);
		return debounced;
	}

// packages/compose/build-module/hooks/use-debounced-input/index.mjs
/**
	* Helper hook for input fields that need to debounce the value before using it.
	*
	* @param defaultValue The default value to use.
	* @return The input value, the setter and the debounced input value.
	*/
	function useDebouncedInput(defaultValue = "") {
		const [input, setInput] = (0, _wordpress_element.useState)(defaultValue);
		const [debouncedInput, setDebouncedState] = (0, _wordpress_element.useState)(defaultValue);
		const setDebouncedInput = useDebounce(setDebouncedState, 250);
		(0, _wordpress_element.useEffect)(() => {
			setDebouncedInput(input);
		}, [input, setDebouncedInput]);
		return [
			input,
			setInput,
			debouncedInput
		];
	}

// packages/compose/build-module/utils/throttle/index.mjs
/**
	* Parts of this source were derived and modified from lodash,
	* released under the MIT license.
	*
	* https://github.com/lodash/lodash
	*
	* Copyright JS Foundation and other contributors <https://js.foundation/>
	*
	* Based on Underscore.js, copyright Jeremy Ashkenas,
	* DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>
	*
	* This software consists of voluntary contributions made by many
	* individuals. For exact contribution history, see the revision history
	* available at https://github.com/lodash/lodash
	*
	* The following license applies to all parts of this software except as
	* documented below:
	*
	* ====
	*
	* Permission is hereby granted, free of charge, to any person obtaining
	* a copy of this software and associated documentation files (the
	* "Software"), to deal in the Software without restriction, including
	* without limitation the rights to use, copy, modify, merge, publish,
	* distribute, sublicense, and/or sell copies of the Software, and to
	* permit persons to whom the Software is furnished to do so, subject to
	* the following conditions:
	*
	* The above copyright notice and this permission notice shall be
	* included in all copies or substantial portions of the Software.
	*
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/
	/**
	* A simplified and properly typed version of lodash's `throttle`, that
	* always uses timers instead of sometimes using rAF.
	*
	* Creates a throttled function that only invokes `func` at most once per
	* every `wait` milliseconds. The throttled function comes with a `cancel`
	* method to cancel delayed `func` invocations and a `flush` method to
	* immediately invoke them. Provide `options` to indicate whether `func`
	* should be invoked on the leading and/or trailing edge of the `wait`
	* timeout. The `func` is invoked with the last arguments provided to the
	* throttled function. Subsequent calls to the throttled function return
	* the result of the last `func` invocation.
	*
	* **Note:** If `leading` and `trailing` options are `true`, `func` is
	* invoked on the trailing edge of the timeout only if the throttled function
	* is invoked more than once during the `wait` timeout.
	*
	* If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	* until the next tick, similar to `setTimeout` with a timeout of `0`.
	*
	* @param {Function}                   func             The function to throttle.
	* @param {number}                     wait             The number of milliseconds to throttle invocations to.
	* @param {Partial< ThrottleOptions >} options          The options object.
	* @param {boolean}                    options.leading  Specify invoking on the leading edge of the timeout.
	* @param {boolean}                    options.trailing Specify invoking on the trailing edge of the timeout.
	* @return Returns the new throttled function.
	*/
	const throttle = (func, wait, options) => {
		let leading = true;
		let trailing = true;
		if (options) {
			leading = "leading" in options ? !!options.leading : leading;
			trailing = "trailing" in options ? !!options.trailing : trailing;
		}
		return debounce(func, wait, {
			leading,
			trailing,
			maxWait: wait
		});
	};

// packages/compose/build-module/hooks/use-throttle/index.mjs
/**
	* Throttles a function similar to Lodash's `throttle`. A new throttled function will
	* be returned and any scheduled calls cancelled if any of the arguments change,
	* including the function to throttle, so please wrap functions created on
	* render in components in `useCallback`.
	*
	* @see https://lodash.com/docs/4#throttle
	*
	* @template TFunc
	*
	* @param    fn      The function to throttle.
	* @param    wait    The number of milliseconds to throttle invocations to.
	* @param    options The options object.
	* @return          Throttled function.
	*/
	function useThrottle(fn, wait, options) {
		const throttled = (0, _wordpress_element.useMemo)(() => throttle(fn, wait ?? 0, options), [
			fn,
			wait,
			options
		]);
		(0, _wordpress_element.useEffect)(() => () => throttled.cancel(), [throttled]);
		return throttled;
	}

// packages/compose/build-module/hooks/use-drop-zone/index.mjs
/**
	* A hook to facilitate drag and drop handling.
	*
	* @param {UseDropZoneProps} props Hook options
	* @return Ref callback to be passed to the drop zone element.
	*/
	function useDropZone({ dropZoneElement, isDisabled, onDrop: _onDrop, onDragStart: _onDragStart, onDragEnter: _onDragEnter, onDragLeave: _onDragLeave, onDragEnd: _onDragEnd, onDragOver: _onDragOver }) {
		const onDropEvent = useEvent(_onDrop);
		const onDragStartEvent = useEvent(_onDragStart);
		const onDragEnterEvent = useEvent(_onDragEnter);
		const onDragLeaveEvent = useEvent(_onDragLeave);
		const onDragEndEvent = useEvent(_onDragEnd);
		const onDragOverEvent = useEvent(_onDragOver);
		return useRefEffect((elem) => {
			if (isDisabled) return;
			const element = dropZoneElement ?? elem;
			let isDragging = false;
			const { ownerDocument } = element;
			/**
			* Checks if an element is in the drop zone.
			*
			* @param {EventTarget|null} targetToCheck
			*
			* @return {boolean} True if in drop zone, false if not.
			*/
			function isElementInZone(targetToCheck) {
				const { defaultView } = ownerDocument;
				if (!targetToCheck || !defaultView || !(targetToCheck instanceof defaultView.HTMLElement) || !element.contains(targetToCheck)) return false;
				let elementToCheck = targetToCheck;
				do
					if (elementToCheck.dataset.isDropZone) return elementToCheck === element;
				while (elementToCheck = elementToCheck.parentElement);
				return false;
			}
			function maybeDragStart(event) {
				if (isDragging) return;
				isDragging = true;
				ownerDocument.addEventListener("dragend", maybeDragEnd);
				ownerDocument.addEventListener("mousemove", maybeDragEnd);
				if (_onDragStart) onDragStartEvent(event);
			}
			function onDragEnter(event) {
				event.preventDefault();
				if (element.contains(event.relatedTarget)) return;
				if (_onDragEnter) onDragEnterEvent(event);
			}
			function onDragOver(event) {
				if (!event.defaultPrevented && _onDragOver) onDragOverEvent(event);
				event.preventDefault();
			}
			function onDragLeave(event) {
				if (isElementInZone(event.relatedTarget)) return;
				if (_onDragLeave) onDragLeaveEvent(event);
			}
			function onDrop(event) {
				if (event.defaultPrevented) return;
				event.preventDefault();
				event.dataTransfer && event.dataTransfer.files.length;
				if (_onDrop) onDropEvent(event);
				maybeDragEnd(event);
			}
			function maybeDragEnd(event) {
				if (!isDragging) return;
				isDragging = false;
				ownerDocument.removeEventListener("dragend", maybeDragEnd);
				ownerDocument.removeEventListener("mousemove", maybeDragEnd);
				if (_onDragEnd) onDragEndEvent(event);
			}
			element.setAttribute("data-is-drop-zone", "true");
			element.addEventListener("drop", onDrop);
			element.addEventListener("dragenter", onDragEnter);
			element.addEventListener("dragover", onDragOver);
			element.addEventListener("dragleave", onDragLeave);
			ownerDocument.addEventListener("dragenter", maybeDragStart);
			ownerDocument.addEventListener("dragover", maybeDragStart, true);
			return () => {
				element.removeAttribute("data-is-drop-zone");
				element.removeEventListener("drop", onDrop);
				element.removeEventListener("dragenter", onDragEnter);
				element.removeEventListener("dragover", onDragOver);
				element.removeEventListener("dragleave", onDragLeave);
				ownerDocument.removeEventListener("dragend", maybeDragEnd);
				ownerDocument.removeEventListener("mousemove", maybeDragEnd);
				ownerDocument.removeEventListener("dragenter", maybeDragStart);
				ownerDocument.removeEventListener("dragover", maybeDragStart, true);
			};
		}, [isDisabled, dropZoneElement]);
	}

// packages/compose/build-module/hooks/use-focusable-iframe/index.mjs
/**
	* Dispatches a bubbling focus event when the iframe receives focus. Use
	* `onFocus` as usual on the iframe or a parent element.
	*
	* @return Ref to pass to the iframe.
	*/
	function useFocusableIframe() {
		return useRefEffect((element) => {
			const { ownerDocument } = element;
			if (!ownerDocument) return;
			const { defaultView } = ownerDocument;
			if (!defaultView) return;
			/**
			* Checks whether the iframe is the activeElement, inferring that it has
			* then received focus, and dispatches a focus event.
			*/
			function checkFocus() {
				if (ownerDocument && ownerDocument.activeElement === element) element.focus();
			}
			defaultView.addEventListener("blur", checkFocus);
			return () => {
				defaultView.removeEventListener("blur", checkFocus);
			};
		}, []);
	}

// packages/compose/build-module/hooks/use-fixed-window-list/index.mjs
	const DEFAULT_INIT_WINDOW_SIZE = 30;
	/**
	*
	* @param elementRef Used to find the closest scroll container that contains element.
	* @param itemHeight Fixed item height in pixels
	* @param totalItems Total items in list
	* @param [options]  Options object
	* @return Array with the fixed window list and setter
	*/
	function useFixedWindowList(elementRef, itemHeight, totalItems, options) {
		const { windowOverscan, useWindowing = true, initWindowSize = DEFAULT_INIT_WINDOW_SIZE, expandedState } = options ?? {};
		const [fixedListWindow, setFixedListWindow] = (0, _wordpress_element.useState)({
			visibleItems: initWindowSize,
			start: 0,
			end: initWindowSize,
			itemInView: (index) => {
				return index >= 0 && index <= initWindowSize;
			}
		});
		const visibleItemsRef = (0, _wordpress_element.useRef)(initWindowSize);
		const isFirstMeasurementRef = (0, _wordpress_element.useRef)(true);
		const measureWindow = useEvent((initRender) => {
			const scrollContainer = (0, _wordpress_dom.getScrollContainer)(elementRef.current);
			if (!scrollContainer) return;
			const visibleItems = Math.ceil(scrollContainer.clientHeight / itemHeight);
			visibleItemsRef.current = visibleItems;
			const isFirstMeasurement = isFirstMeasurementRef.current;
			isFirstMeasurementRef.current = false;
			const overscan = initRender ? visibleItems : windowOverscan ?? visibleItems;
			const firstViewableIndex = Math.floor(scrollContainer.scrollTop / itemHeight);
			const start = Math.max(0, firstViewableIndex - overscan);
			const end = Math.min(totalItems - 1, firstViewableIndex + visibleItems + overscan);
			setFixedListWindow((lastWindow) => {
				if (lastWindow.start <= start && lastWindow.end >= end) return lastWindow;
				if (isFirstMeasurement && lastWindow.start <= firstViewableIndex && lastWindow.end >= firstViewableIndex + visibleItems) return lastWindow;
				return {
					visibleItems,
					start,
					end,
					itemInView: (index) => {
						return start <= index && index <= end;
					}
				};
			});
		});
		const handleKeyDown = useEvent((event, scrollContainer) => {
			switch (event.keyCode) {
				case _wordpress_keycodes.HOME: return scrollContainer.scrollTo({ top: 0 });
				case _wordpress_keycodes.END: return scrollContainer.scrollTo({ top: totalItems * itemHeight });
				case _wordpress_keycodes.PAGEUP: return scrollContainer.scrollTo({ top: scrollContainer.scrollTop - visibleItemsRef.current * itemHeight });
				case _wordpress_keycodes.PAGEDOWN: return scrollContainer.scrollTo({ top: scrollContainer.scrollTop + visibleItemsRef.current * itemHeight });
			}
		});
		(0, _wordpress_element.useLayoutEffect)(() => {
			if (!useWindowing) return;
			measureWindow(true);
		}, [
			useWindowing,
			measureWindow,
			itemHeight,
			totalItems,
			windowOverscan,
			expandedState
		]);
		(0, _wordpress_element.useLayoutEffect)(() => {
			if (!useWindowing) return;
			const scrollContainer = (0, _wordpress_dom.getScrollContainer)(elementRef.current);
			if (!scrollContainer) return;
			const { defaultView } = scrollContainer.ownerDocument;
			const onMeasure = () => measureWindow();
			const onKeyDown = (event) => handleKeyDown(event, scrollContainer);
			scrollContainer.addEventListener("scroll", onMeasure);
			defaultView?.addEventListener("resize", onMeasure);
			defaultView?.addEventListener("keydown", onKeyDown);
			return () => {
				scrollContainer.removeEventListener("scroll", onMeasure);
				defaultView?.removeEventListener("resize", onMeasure);
				defaultView?.removeEventListener("keydown", onKeyDown);
			};
		}, [
			useWindowing,
			elementRef,
			itemHeight,
			totalItems,
			expandedState,
			measureWindow,
			handleKeyDown
		]);
		return [fixedListWindow, setFixedListWindow];
	}

// packages/compose/build-module/hooks/use-observable-value/index.mjs
/**
	* React hook that lets you observe an entry in an `ObservableMap`. The hook returns the
	* current value corresponding to the key, or `undefined` when there is no value stored.
	* It also observes changes to the value and triggers an update of the calling component
	* in case the value changes.
	*
	* @template K    The type of the keys in the map.
	* @template V    The type of the values in the map.
	* @param    map  The `ObservableMap` to observe.
	* @param    name The map key to observe.
	* @return   The value corresponding to the map key requested.
	*/
	function useObservableValue(map, name) {
		const [subscribe, getValue] = (0, _wordpress_element.useMemo)(() => [(listener) => map.subscribe(name, listener), () => map.get(name)], [map, name]);
		return (0, _wordpress_element.useSyncExternalStore)(subscribe, getValue, getValue);
	}

// packages/compose/build-module/utils/observable-map/index.mjs
/**
	* A constructor (factory) for `ObservableMap`, a map-like key/value data structure
	* where the individual entries are observable: using the `subscribe` method, you can
	* subscribe to updates for a particular keys. Each subscriber always observes one
	* specific key and is not notified about any unrelated changes (for different keys)
	* in the `ObservableMap`.
	*
	* @template K The type of the keys in the map.
	* @template V The type of the values in the map.
	* @return   A new instance of the `ObservableMap` type.
	*/
	function observableMap() {
		const map = /* @__PURE__ */ new Map();
		const listeners = /* @__PURE__ */ new Map();
		function callListeners(name) {
			const list = listeners.get(name);
			if (!list) return;
			for (const listener of list) listener();
		}
		return {
			get(name) {
				return map.get(name);
			},
			set(name, value) {
				map.set(name, value);
				callListeners(name);
			},
			delete(name) {
				map.delete(name);
				callListeners(name);
			},
			subscribe(name, listener) {
				let list = listeners.get(name);
				if (!list) {
					list = /* @__PURE__ */ new Set();
					listeners.set(name, list);
				}
				list.add(listener);
				return () => {
					list.delete(listener);
					if (list.size === 0) listeners.delete(name);
				};
			}
		};
	}

exports.__experimentalUseDialog = useDialog;
exports.__experimentalUseDragging = useDragging;
exports.__experimentalUseDropZone = useDropZone;
exports.__experimentalUseFixedWindowList = useFixedWindowList;
exports.__experimentalUseFocusOutside = useFocusOutside;
exports.compose = compose;
exports.createHigherOrderComponent = createHigherOrderComponent;
exports.debounce = debounce;
exports.ifCondition = ifCondition;
exports.observableMap = observableMap;
exports.pipe = pipe;
exports.privateApis = privateApis;
exports.pure = pure;
exports.throttle = throttle;
exports.useAsyncList = useAsyncList;
exports.useConstrainedTabbing = useConstrainedTabbing;
exports.useCopyOnClick = useCopyOnClick;
exports.useCopyToClipboard = useCopyToClipboard;
exports.useDebounce = useDebounce;
exports.useDebouncedInput = useDebouncedInput;
exports.useDisabled = useDisabled;
exports.useEvent = useEvent;
exports.useFocusOnMount = useFocusOnMount;
exports.useFocusReturn = useFocusReturn;
exports.useFocusableIframe = useFocusableIframe;
exports.useInstanceId = useInstanceId;
exports.useIsomorphicLayoutEffect = useIsomorphicLayoutEffect;
exports.useKeyboardShortcut = useKeyboardShortcut;
exports.useMediaQuery = useMediaQuery;
exports.useMergeRefs = useMergeRefs;
exports.useObservableValue = useObservableValue;
exports.usePrevious = usePrevious;
exports.useReducedMotion = useReducedMotion;
exports.useRefEffect = useRefEffect;
exports.useResizeObserver = useResizeObserver;
exports.useStateWithHistory = useStateWithHistory;
exports.useThrottle = useThrottle;
exports.useViewportMatch = useViewportMatch;
exports.useWarnOnChange = useWarnOnChange;
exports.withGlobalEvents = withGlobalEvents;
exports.withInstanceId = withInstanceId;
exports.withSafeTimeout = withSafeTimeout;
exports.withState = withState;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).compose = exports;
return exports;
})({}, window.wp.privateApis, window.ReactJSXRuntime, window.wp.isShallowEqual, window.wp.element, window.wp.deprecated, window.wp.dom, window.wp.keycodes, window.wp.undoManager, window.wp.priorityQueue);
//# sourceMappingURL=index.js.map