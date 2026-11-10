(function(exports, _wordpress_blocks, _wordpress_block_library, _wordpress_deprecated, _wordpress_element, _wordpress_data, _wordpress_preferences, _wordpress_widgets, _wordpress_editor, _wordpress_core_data, _wordpress_api_fetch, _wordpress_i18n, react, react_jsx_runtime, react_dom, _wordpress_primitives, _wordpress_compose, _wordpress_theme, _wordpress_private_apis, _wordpress_components, _wordpress_block_editor, _wordpress_plugins, _wordpress_notices, _wordpress_commands, _wordpress_url, _wordpress_html_entities, _wordpress_keyboard_shortcuts, _wordpress_hooks, _wordpress_keycodes) {

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
_wordpress_api_fetch = __toESM(_wordpress_api_fetch, 1);
react = __toESM(react, 1);
react_dom = __toESM(react_dom, 1);
_wordpress_theme = __toESM(_wordpress_theme, 1);

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

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useRefWithInit.mjs
	const UNINITIALIZED = {};
	/**
	* A React.useRef() that is initialized with a function. Note that it accepts an optional
	* initialization argument, so the initialization function doesn't need to be an inline closure.
	*
	* @usage
	*   const ref = useRefWithInit(sortColumns, columns)
	*/
	function useRefWithInit(init, initArg) {
		const ref = react.useRef(UNINITIALIZED);
		if (ref.current === UNINITIALIZED) ref.current = init(initArg);
		return ref;
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useMergedRefs.mjs
/**
	* Merges refs into a single memoized callback ref or `null`.
	* This makes sure multiple refs are updated together and have the same value.
	*
	* This function accepts up to four refs. If you need to merge more, or have an unspecified number of refs to merge,
	* use `useMergedRefsN` instead.
	*/
	function useMergedRefs(a, b, c, d) {
		const forkRef = useRefWithInit(createForkRef).current;
		if (didChange(forkRef, a, b, c, d)) update(forkRef, [
			a,
			b,
			c,
			d
		]);
		return forkRef.callback;
	}
	/**
	* Merges an array of refs into a single memoized callback ref or `null`.
	*
	* If you need to merge a fixed number (up to four) of refs, use `useMergedRefs` instead for better performance.
	*/
	function useMergedRefsN(refs) {
		const forkRef = useRefWithInit(createForkRef).current;
		if (didChangeN(forkRef, refs)) update(forkRef, refs);
		return forkRef.callback;
	}
	function createForkRef() {
		return {
			callback: null,
			cleanup: null,
			refs: []
		};
	}
	function didChange(forkRef, a, b, c, d) {
		return forkRef.refs[0] !== a || forkRef.refs[1] !== b || forkRef.refs[2] !== c || forkRef.refs[3] !== d;
	}
	function didChangeN(forkRef, newRefs) {
		return forkRef.refs.length !== newRefs.length || forkRef.refs.some((ref, index) => ref !== newRefs[index]);
	}
	function update(forkRef, refs) {
		forkRef.refs = refs;
		if (refs.every((ref) => ref == null)) {
			forkRef.callback = null;
			return;
		}
		forkRef.callback = (instance) => {
			if (forkRef.cleanup) {
				forkRef.cleanup();
				forkRef.cleanup = null;
			}
			if (instance != null) {
				const cleanupCallbacks = Array(refs.length).fill(null);
				for (let i = 0; i < refs.length; i += 1) {
					const ref = refs[i];
					if (ref == null) continue;
					switch (typeof ref) {
						case "function": {
							const refCleanup = ref(instance);
							if (typeof refCleanup === "function") cleanupCallbacks[i] = refCleanup;
							break;
						}
						case "object": ref.current = instance;
					}
				}
				forkRef.cleanup = () => {
					for (let i = 0; i < refs.length; i += 1) {
						const ref = refs[i];
						if (ref == null) continue;
						switch (typeof ref) {
							case "function": {
								const cleanupCallback = cleanupCallbacks[i];
								if (typeof cleanupCallback === "function") cleanupCallback();
								else ref(null);
								break;
							}
							case "object": ref.current = null;
						}
					}
				};
			}
		};
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/reactVersion.mjs
	const majorVersion = parseInt(react.version, 10);
	function isReactVersionAtLeast(reactVersionToCheck) {
		return majorVersion >= reactVersionToCheck;
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/getReactElementRef.mjs
/**
	* Extracts the `ref` from a React element, handling different React versions.
	*/
	function getReactElementRef(element) {
		if (!/*#__PURE__*/ react.isValidElement(element)) return null;
		const reactElement = element;
		const propsWithRef = reactElement.props;
		return (isReactVersionAtLeast(19) ? propsWithRef?.ref : reactElement.ref) ?? null;
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/mergeObjects.mjs
	function mergeObjects(a, b) {
		if (a && !b) return a;
		if (!a && b) return b;
		if (a || b) return {
			...a,
			...b
		};
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/createLogOnce.mjs
	let loggedMessages;
	loggedMessages = /* @__PURE__ */ new Set();
	/** Creates a dev-only logger that writes each unique message to `console[severity]` once. */
	function createLogOnce(severity, prefix) {
		return function logOnce(...messages) {
			{
				const message = messages.join(" ");
				const output = prefix ? `${prefix}: ${message}` : message;
				const key = `${severity}:${output}`;
				if (!loggedMessages.has(key)) {
					loggedMessages.add(key);
					if (severity === "warn") console.warn(output);
					else console.error(output);
				}
			}
		};
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/warn.mjs
	const warn = createLogOnce("warn", "Base UI");

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/empty.mjs
	function NOOP() {}
	const EMPTY_ARRAY$1 = Object.freeze([]);
	const EMPTY_OBJECT$1 = Object.freeze({});

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/getStateAttributesProps.mjs
	function getStateAttributesProps(state, customMapping) {
		const props = {};
		for (const key in state) {
			const value = state[key];
			if (customMapping?.hasOwnProperty(key)) {
				const customProps = customMapping[key](value);
				if (customProps != null) Object.assign(props, customProps);
				continue;
			}
			if (value === true) props[`data-${key.toLowerCase()}`] = "";
			else if (value) props[`data-${key.toLowerCase()}`] = value.toString();
		}
		return props;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/resolveClassName.mjs
/**
	* If the provided className is a string, it will be returned as is.
	* Otherwise, the function will call the className function with the state as the first argument.
	*
	* @param className
	* @param state
	*/
	function resolveClassName(className, state) {
		return typeof className === "function" ? className(state) : className;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/resolveStyle.mjs
/**
	* If the provided style is an object, it will be returned as is.
	* Otherwise, the function will call the style function with the state as the first argument.
	*
	* @param style
	* @param state
	*/
	function resolveStyle(style, state) {
		return typeof style === "function" ? style(state) : style;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/merge-props/mergeProps.mjs
	const EMPTY_PROPS = {};
	/**
	* Merges multiple sets of React props. It follows the Object.assign pattern where the rightmost object's fields overwrite
	* the conflicting ones from others. This doesn't apply to event handlers, `className` and `style` props.
	*
	* Event handlers are merged and called in right-to-left order (rightmost handler executes first, leftmost last).
	* For React synthetic events, the rightmost handler can prevent prior (left-positioned) handlers from executing
	* by calling `event.preventBaseUIHandler()`. For non-synthetic events (custom events with primitive/object values),
	* all handlers always execute without prevention capability.
	*
	* The `className` prop is merged by concatenating classes in right-to-left order (rightmost class appears first in the string).
	* The `style` prop is merged with rightmost styles overwriting the prior ones.
	*
	* Props can either be provided as objects or as functions that take the previous props as an argument.
	* The function will receive the merged props up to that point (going from left to right):
	* so in the case of `(obj1, obj2, fn, obj3)`, `fn` will receive the merged props of `obj1` and `obj2`.
	* The function is responsible for chaining event handlers if needed (that is, we don't run the merge logic).
	*
	* Event handlers returned by the functions are not automatically prevented when `preventBaseUIHandler` is called.
	* They must check `event.baseUIHandlerPrevented` themselves and bail out if it's true.
	*
	* @important **`ref` is not merged.**
	* @param a Props object to merge.
	* @param b Props object to merge. The function will overwrite conflicting props from `a`.
	* @param c Props object to merge. The function will overwrite conflicting props from previous parameters.
	* @param d Props object to merge. The function will overwrite conflicting props from previous parameters.
	* @param e Props object to merge. The function will overwrite conflicting props from previous parameters.
	* @returns The merged props.
	* @public
	*/
	function mergeProps(a, b, c, d, e) {
		if (!c && !d && !e && !a) return createInitialMergedProps(b);
		let merged = createInitialMergedProps(a);
		if (b) merged = mergeInto(merged, b);
		if (c) merged = mergeInto(merged, c);
		if (d) merged = mergeInto(merged, d);
		if (e) merged = mergeInto(merged, e);
		return merged;
	}
	/**
	* Merges an arbitrary number of React props using the same logic as {@link mergeProps}.
	* This function accepts an array of props instead of individual arguments.
	*
	* This has slightly lower performance than {@link mergeProps} due to accepting an array
	* instead of a fixed number of arguments. Prefer {@link mergeProps} when merging 5 or
	* fewer prop sets for better performance.
	*
	* @param props Array of props to merge.
	* @returns The merged props.
	* @see mergeProps
	* @public
	*/
	function mergePropsN(props) {
		if (props.length === 0) return EMPTY_PROPS;
		if (props.length === 1) return createInitialMergedProps(props[0]);
		let merged = createInitialMergedProps(props[0]);
		for (let i = 1; i < props.length; i += 1) merged = mergeInto(merged, props[i]);
		return merged;
	}
	function createInitialMergedProps(inputProps) {
		if (isPropsGetter(inputProps)) return { ...inputProps(EMPTY_PROPS) };
		return copyInitialProps(inputProps);
	}
	function mergeInto(merged, inputProps) {
		if (isPropsGetter(inputProps)) return inputProps(merged);
		return mutablyMergeInto(merged, inputProps);
	}
	function copyInitialProps(inputProps) {
		const copiedProps = { ...inputProps };
		for (const propName in copiedProps) {
			const propValue = copiedProps[propName];
			if (isEventHandler(propName, propValue)) copiedProps[propName] = wrapEventHandler(propValue);
		}
		return copiedProps;
	}
	/**
	* Merges two sets of props. In case of conflicts, the external props take precedence.
	*/
	function mutablyMergeInto(mergedProps, externalProps) {
		if (!externalProps) return mergedProps;
		for (const propName in externalProps) {
			const externalPropValue = externalProps[propName];
			switch (propName) {
				case "style":
					mergedProps[propName] = mergeObjects(mergedProps.style, externalPropValue);
					break;
				case "className":
					mergedProps[propName] = mergeClassNames(mergedProps.className, externalPropValue);
					break;
				default: if (isEventHandler(propName, externalPropValue)) mergedProps[propName] = mergeEventHandlers(mergedProps[propName], externalPropValue);
				else mergedProps[propName] = externalPropValue;
			}
		}
		return mergedProps;
	}
	function isEventHandler(key, value) {
		const code0 = key.charCodeAt(0);
		const code1 = key.charCodeAt(1);
		const code2 = key.charCodeAt(2);
		return code0 === 111 && code1 === 110 && code2 >= 65 && code2 <= 90 && (typeof value === "function" || typeof value === "undefined");
	}
	function isPropsGetter(inputProps) {
		return typeof inputProps === "function";
	}
	function mergeEventHandlers(ourHandler, theirHandler) {
		if (!theirHandler) return ourHandler;
		if (!ourHandler) return wrapEventHandler(theirHandler);
		return (...args) => {
			const event = args[0];
			if (isSyntheticEvent(event)) {
				const baseUIEvent = event;
				makeEventPreventable(baseUIEvent);
				const result = theirHandler(...args);
				if (!baseUIEvent.baseUIHandlerPrevented) ourHandler?.(...args);
				return result;
			}
			const result = theirHandler(...args);
			ourHandler?.(...args);
			return result;
		};
	}
	function wrapEventHandler(handler) {
		if (!handler) return handler;
		return (...args) => {
			const event = args[0];
			if (isSyntheticEvent(event)) makeEventPreventable(event);
			return handler(...args);
		};
	}
	function makeEventPreventable(event) {
		event.preventBaseUIHandler = () => {
			event.baseUIHandlerPrevented = true;
		};
		return event;
	}
	function mergeClassNames(ourClassName, theirClassName) {
		if (theirClassName) {
			if (ourClassName) return theirClassName + " " + ourClassName;
			return theirClassName;
		}
		return ourClassName;
	}
	function isSyntheticEvent(event) {
		return event != null && typeof event === "object" && "nativeEvent" in event;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/useRenderElement.mjs
/**
	* Renders a Base UI element.
	*
	* @param element The default HTML element to render. Can be overridden by the `render` prop.
	* @param componentProps An object containing the `render` and `className` props to be used for element customization. Other props are ignored.
	* @param params Additional parameters for rendering the element.
	*/
	function useRenderElement(element, componentProps, params = {}) {
		let renderProp = componentProps.render;
		if (params.enabled !== false) renderProp = unwrapLazyRenderProp(renderProp);
		const outProps = useRenderElementProps(componentProps, params, renderProp);
		if (params.enabled === false) return null;
		const state = params.state ?? EMPTY_OBJECT$1;
		return evaluateRenderProp(element, renderProp, outProps, state);
	}
	/**
	* Computes render element final props.
	*/
	function useRenderElementProps(componentProps, params, renderProp) {
		const { className: classNameProp, style: styleProp } = componentProps;
		const { state = EMPTY_OBJECT$1, ref, props, stateAttributesMapping, enabled = true } = params;
		const className = enabled ? resolveClassName(classNameProp, state) : void 0;
		const style = enabled ? resolveStyle(styleProp, state) : void 0;
		const stateProps = enabled ? getStateAttributesProps(state, stateAttributesMapping) : EMPTY_OBJECT$1;
		const resolvedProps = enabled && props ? resolveRenderFunctionProps(props) : void 0;
		const outProps = enabled ? mergeObjects(stateProps, resolvedProps) ?? {} : EMPTY_OBJECT$1;
		if (typeof document !== "undefined") {
			if (!enabled) useMergedRefs(null, null);
			else if (Array.isArray(ref)) outProps.ref = useMergedRefsN([
				outProps.ref,
				getReactElementRef(renderProp),
				...ref
			]);
			else outProps.ref = useMergedRefs(outProps.ref, getReactElementRef(renderProp), ref);
		}
		if (!enabled) return EMPTY_OBJECT$1;
		if (className !== void 0) outProps.className = mergeClassNames(outProps.className, className);
		if (style !== void 0) outProps.style = mergeObjects(outProps.style, style);
		return outProps;
	}
	function resolveRenderFunctionProps(props) {
		if (Array.isArray(props)) return mergePropsN(props);
		return mergeProps(void 0, props);
	}
	const REACT_LAZY_TYPE = Symbol.for("react.lazy");
	const COMPONENT_IDENTIFIER_PATTERN = /^[A-Z][A-Za-z0-9$]*$/;
	const LOWERCASE_CHARACTER_PATTERN = /[a-z]/;
	function unwrapLazyRenderProp(render) {
		if (render?.$$typeof !== REACT_LAZY_TYPE) return render;
		const unwrapped = react.Children.toArray(render)[0];
		return /*#__PURE__*/ react.isValidElement(unwrapped) ? unwrapped : render;
	}
	function evaluateRenderProp(element, render, props, state) {
		if (render) {
			if (typeof render === "function") {
				warnIfRenderPropLooksLikeComponent(render);
				return render(props, state);
			}
			const mergedProps = mergeProps(props, render.props);
			mergedProps.ref = props.ref;
			if (!/*#__PURE__*/ react.isValidElement(render)) throw new Error([
				"Base UI: The `render` prop was provided an invalid React element as `React.isValidElement(render)` is `false`.",
				"A valid React element must be provided to the `render` prop because it is cloned with props to replace the default element.",
				"https://base-ui.com/r/invalid-render-prop"
			].join("\n"));
			return /*#__PURE__*/ react.cloneElement(render, mergedProps);
		}
		return renderTag(element, props);
	}
	function warnIfRenderPropLooksLikeComponent(renderFn) {
		const functionName = renderFn.name;
		if (functionName.length === 0) return;
		if (!COMPONENT_IDENTIFIER_PATTERN.test(functionName)) return;
		if (!LOWERCASE_CHARACTER_PATTERN.test(functionName)) return;
		warn(`The \`render\` prop received a function named \`${functionName}\` that starts with an uppercase letter.`, "This usually means a React component was passed directly as `render={Component}`.", "Base UI calls `render` as a plain function, which can break the Rules of Hooks during reconciliation.", "If this is an intentional render callback, rename it to start with a lowercase letter.", "Use `render={<Component />}` or `render={(props) => <Component {...props} />}` instead.", "https://base-ui.com/r/invalid-render-prop");
	}
	function renderTag(Tag, props) {
		if (Tag === "button") return /*#__PURE__*/ (0, react.createElement)("button", {
			type: "button",
			...props,
			key: props.key
		});
		if (Tag === "img") return /*#__PURE__*/ (0, react.createElement)("img", {
			alt: "",
			...props,
			key: props.key
		});
		return /*#__PURE__*/ react.createElement(Tag, props);
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/safeReact.mjs
/**
	* A clone of the React namespace for reading APIs that may be missing in older
	* supported React versions. Bundlers can rewrite direct `React.someNewApi`
	* reads into named imports, which breaks React 17. Reading from this cloned
	* object keeps those lookups optional.
	*
	* @see https://github.com/mui/material-ui/issues/41190#issuecomment-2040873379
	*/
	const SafeReact = { ...react };

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useStableCallback.mjs
	const useInsertionEffect = SafeReact.useInsertionEffect;
	const useSafeInsertionEffect = useInsertionEffect && useInsertionEffect !== SafeReact.useLayoutEffect ? useInsertionEffect : (fn) => fn();
	/**
	* Stabilizes the function passed so it's always the same between renders.
	*
	* The function becomes non-reactive to any values it captures.
	* It can safely be passed as a dependency of `React.useMemo` and `React.useEffect` without re-triggering them if its captured values change.
	*
	* The function must only be called inside effects and event handlers, never during render (which throws an error).
	*
	* This hook is a more permissive version of React 19.2's `React.useEffectEvent` in that it can be passed through contexts and called in event handler props, not just effects.
	*/
	function useStableCallback(callback) {
		const stable = useRefWithInit(createStableCallback).current;
		stable.next = callback;
		useSafeInsertionEffect(stable.effect);
		return stable.trampoline;
	}
	function createStableCallback() {
		const stable = {
			next: void 0,
			callback: assertNotCalled,
			trampoline: (...args) => stable.callback?.(...args),
			effect: () => {
				stable.callback = stable.next;
			}
		};
		return stable;
	}
	function assertNotCalled() {
		throw new Error("Base UI: Cannot call an event handler while rendering.");
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useIsoLayoutEffect.mjs
	const noop = () => {};
	const useIsoLayoutEffect = typeof document !== "undefined" ? react.useLayoutEffect : noop;

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useOnMount.mjs
/**
	* A React.useEffect equivalent that runs once, when the component is mounted.
	*/
	function useOnMount(fn) {
		react.useEffect(fn, EMPTY_ARRAY$1);
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useAnimationFrame.mjs
/** Unlike `setTimeout`, rAF doesn't guarantee a positive integer return value, so we can't have
	* a monomorphic `uint` type with `0` meaning empty.
	* See warning note at:
	* https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame#return_value */
	const EMPTY$1 = null;
	let LAST_RAF = globalThis.requestAnimationFrame;
	var Scheduler = class {
		callbacks = [];
		callbacksCount = 0;
		nextId = 1;
		startId = 1;
		isScheduled = false;
		tick = (timestamp) => {
			this.isScheduled = false;
			const currentCallbacks = this.callbacks;
			const currentCallbacksCount = this.callbacksCount;
			this.callbacks = [];
			this.callbacksCount = 0;
			this.startId = this.nextId;
			if (currentCallbacksCount > 0) for (let i = 0; i < currentCallbacks.length; i += 1) currentCallbacks[i]?.(timestamp);
		};
		request(fn) {
			const id = this.nextId;
			this.nextId += 1;
			this.callbacks.push(fn);
			this.callbacksCount += 1;
			const didRAFChange = LAST_RAF !== requestAnimationFrame && (LAST_RAF = requestAnimationFrame, true);
			if (!this.isScheduled || didRAFChange) {
				requestAnimationFrame(this.tick);
				this.isScheduled = true;
			}
			return id;
		}
		cancel(id) {
			const index = id - this.startId;
			if (index < 0 || index >= this.callbacks.length) return;
			if (this.callbacks[index] === null) return;
			this.callbacks[index] = null;
			this.callbacksCount -= 1;
		}
	};
	let scheduler = new Scheduler();
	var AnimationFrame = class AnimationFrame {
		static create() {
			return new AnimationFrame();
		}
		static request(fn) {
			return scheduler.request(fn);
		}
		static cancel(id) {
			return scheduler.cancel(id);
		}
		currentId = EMPTY$1;
		/**
		* Executes `fn` after `delay`, clearing any previously scheduled call.
		*/
		request(fn) {
			this.cancel();
			this.currentId = scheduler.request(() => {
				this.currentId = EMPTY$1;
				fn();
			});
		}
		cancel = () => {
			if (this.currentId !== EMPTY$1) {
				scheduler.cancel(this.currentId);
				this.currentId = EMPTY$1;
			}
		};
		disposeEffect = () => {
			return this.cancel;
		};
	};
	/**
	* A `requestAnimationFrame` with automatic cleanup and guard.
	*/
	function useAnimationFrame() {
		const timeout = useRefWithInit(AnimationFrame.create).current;
		useOnMount(timeout.disposeEffect);
		return timeout;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/resolveRef.mjs
/**
	* If the provided argument is a ref object, returns its `current` value.
	* Otherwise, returns the argument itself.
	*/
	function resolveRef(maybeRef) {
		if (maybeRef == null) return maybeRef;
		return "current" in maybeRef ? maybeRef.current : maybeRef;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/getFiniteAnimations.mjs
/**
	* Excludes infinite animations, whose finished promises never resolve while they run.
	*/
	function getFiniteAnimations(element, options) {
		return element.getAnimations(options).filter((animation) => {
			const timing = animation.effect?.getTiming();
			return timing?.duration !== Infinity && timing?.iterations !== Infinity;
		});
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/TransitionStatusDataAttributes.mjs
/**
	* Present when the component begins animating in.
	*/
	const startingStyle = "data-starting-style";
	/**
	* Present when the component is animating out.
	*/
	const endingStyle = "data-ending-style";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/useAnimationsFinished.mjs
	let pendingCallbacks = null;
	/**
	* Runs the callback in a synchronous flush before the browser paints, so that the
	* browser doesn't paint an intermediate frame: https://github.com/mui/base-ui/issues/979
	* Callbacks that become ready within the same microtask checkpoint (e.g. multiple elements
	* whose animations finish together) are batched into a single commit:
	* https://github.com/mui/base-ui/issues/5481
	*/
	function flushBeforePaint(fn) {
		if (!pendingCallbacks) {
			const callbacks = [];
			pendingCallbacks = callbacks;
			queueMicrotask(() => {
				pendingCallbacks = null;
				react_dom.flushSync(() => {
					for (const callback of callbacks) callback();
				});
			});
		}
		pendingCallbacks.push(fn);
	}
	/**
	* Executes a function once all animations have finished on the provided element.
	* If an animation is canceled, waits for any replacement animations before executing.
	* @param elementOrRef - The element to watch for animations.
	* @param waitForStartingStyleRemoved - Whether to wait for [data-starting-style] to be removed before checking for animations.
	* @param batch - Whether completions ready in the same microtask may be coalesced into a single
	* commit. A batched callback runs before earlier callbacks' React updates have committed, so only
	* opt in when the callback doesn't read state that another completion can change.
	* @returns A function that takes a callback to execute once all animations have finished, and an optional AbortSignal to abort the callback
	*/
	function useAnimationsFinished(elementOrRef, waitForStartingStyleRemoved = false, batch = false) {
		const frame = useAnimationFrame();
		return useStableCallback((fnToExecute, signal = null) => {
			frame.cancel();
			const element = resolveRef(elementOrRef);
			if (element == null) return;
			const resolvedElement = element;
			const done = () => {
				if (!batch) {
					react_dom.flushSync(fnToExecute);
					return;
				}
				flushBeforePaint(() => {
					if (!signal?.aborted) fnToExecute();
				});
			};
			if (typeof resolvedElement.getAnimations !== "function" || globalThis.BASE_UI_ANIMATIONS_DISABLED) {
				fnToExecute();
				return;
			}
			function exec() {
				Promise.all(getFiniteAnimations(resolvedElement).map((animation) => animation.finished.then(NOOP))).then(() => {
					if (!signal?.aborted) done();
				}, () => {
					if (signal?.aborted) return;
					if (getFiniteAnimations(resolvedElement).some((animation) => animation.pending || animation.playState !== "finished")) {
						exec();
						return;
					}
					done();
				});
			}
			if (waitForStartingStyleRemoved) {
				const startingStyleAttribute = startingStyle;
				if (!resolvedElement.hasAttribute(startingStyleAttribute)) {
					frame.request(exec);
					return;
				}
				const attributeObserver = new MutationObserver(() => {
					if (!resolvedElement.hasAttribute(startingStyleAttribute)) {
						attributeObserver.disconnect();
						exec();
					}
				});
				attributeObserver.observe(resolvedElement, {
					attributes: true,
					attributeFilter: [startingStyleAttribute]
				});
				signal?.addEventListener("abort", () => attributeObserver.disconnect(), { once: true });
				return;
			}
			frame.request(exec);
		});
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/useOpenChangeComplete.mjs
/**
	* Calls the provided function when the CSS open/close animation or transition completes.
	*/
	function useOpenChangeComplete(parameters) {
		const { enabled = true, open, ref, batch = false, onComplete: onCompleteParam } = parameters;
		const onComplete = useStableCallback(onCompleteParam);
		const runOnceAnimationsFinish = useAnimationsFinished(ref, open, batch);
		react.useEffect(() => {
			if (!enabled) return;
			const abortController = new AbortController();
			runOnceAnimationsFinish(onComplete, abortController.signal);
			return () => {
				abortController.abort();
			};
		}, [
			enabled,
			open,
			onComplete,
			runOnceAnimationsFinish
		]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/stateAttributesMapping.mjs
	const STARTING_HOOK = { [startingStyle]: "" };
	const ENDING_HOOK = { [endingStyle]: "" };
	const transitionStatusMapping = { transitionStatus(value) {
		if (value === "starting") return STARTING_HOOK;
		if (value === "ending") return ENDING_HOOK;
		return null;
	} };

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/useTransitionStatus.mjs
/**
	* Provides a status string for CSS animations.
	* @param open - a boolean that determines if the element is open.
	* @param enableIdleState - a boolean that enables the `'idle'` state between `'starting'` and `'ending'`
	* @param deferEndingState - a boolean that delays the `'ending'` state by a frame
	* @param animateInitialOpen - a boolean that makes an element which mounts already open still go
	*   through `'starting'`. Off by default so content that was open on the first render (a
	*   `defaultOpen` popup on page load, SSR'd markup) doesn't animate in.
	*/
	function useTransitionStatus(open, enableIdleState = false, deferEndingState = false, animateInitialOpen = false) {
		const [transitionStatus, setTransitionStatus] = react.useState(open && enableIdleState ? "idle" : void 0);
		const [mounted, setMounted] = react.useState(open && !animateInitialOpen);
		if (open && !mounted) {
			setMounted(true);
			setTransitionStatus("starting");
		}
		if (!open && mounted && transitionStatus !== "ending" && !deferEndingState) setTransitionStatus("ending");
		if (!open && !mounted && transitionStatus === "ending") setTransitionStatus(void 0);
		useIsoLayoutEffect(() => {
			if (!open && mounted && transitionStatus !== "ending" && deferEndingState) {
				const frame = AnimationFrame.request(() => {
					setTransitionStatus("ending");
				});
				return () => {
					AnimationFrame.cancel(frame);
				};
			}
		}, [
			open,
			mounted,
			transitionStatus,
			deferEndingState
		]);
		useIsoLayoutEffect(() => {
			if (!open || enableIdleState || transitionStatus === void 0) return;
			const frame = AnimationFrame.request(() => {
				setTransitionStatus(void 0);
			});
			return () => {
				AnimationFrame.cancel(frame);
			};
		}, [
			enableIdleState,
			open,
			transitionStatus
		]);
		useIsoLayoutEffect(() => {
			if (!open || !enableIdleState) return;
			if (open && mounted && transitionStatus !== "idle") setTransitionStatus("starting");
			const frame = AnimationFrame.request(() => {
				setTransitionStatus("idle");
			});
			return () => {
				AnimationFrame.cancel(frame);
			};
		}, [
			enableIdleState,
			open,
			mounted,
			transitionStatus
		]);
		return {
			mounted,
			setMounted,
			transitionStatus
		};
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useTimeout.mjs
	const EMPTY = 0;
	var Timeout = class Timeout {
		static create() {
			return new Timeout();
		}
		currentId = EMPTY;
		/**
		* Executes `fn` after `delay`, clearing any previously scheduled call.
		*/
		start(delay, fn) {
			this.clear();
			this.currentId = setTimeout(() => {
				this.currentId = EMPTY;
				fn();
			}, delay);
		}
		isStarted() {
			return this.currentId !== EMPTY;
		}
		clear = () => {
			if (this.currentId !== EMPTY) {
				clearTimeout(this.currentId);
				this.currentId = EMPTY;
			}
		};
		disposeEffect = () => {
			return this.clear;
		};
	};
	/**
	* A `setTimeout` with automatic cleanup and guard.
	*/
	function useTimeout() {
		const timeout = useRefWithInit(Timeout.create).current;
		useOnMount(timeout.disposeEffect);
		return timeout;
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useForcedRerendering.mjs
/**
	* Returns a function that forces a rerender.
	*/
	function useForcedRerendering() {
		const [, setState] = react.useState({});
		return react.useCallback(() => {
			setState({});
		}, []);
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useId.mjs
	let globalId = 0;
	function useGlobalId(idOverride, prefix = "mui") {
		const defaultId = react.useRef(void 0);
		const forceRerender = useForcedRerendering();
		const id = idOverride ?? defaultId.current;
		react.useEffect(() => {
			if (defaultId.current == null) {
				globalId += 1;
				defaultId.current = `${prefix}-${globalId}`;
				if (idOverride == null) forceRerender();
			}
		}, [
			idOverride,
			prefix,
			forceRerender
		]);
		return id;
	}
	const maybeReactUseId = SafeReact.useId;
	/**
	*
	* @example <div id={useId()} />
	* @param {string | undefined} idOverride overrides the generated id when provided
	* @param {string | undefined} prefix prefixes the generated id when provided
	* @returns {string | undefined}
	*/
	function useId$1(idOverride, prefix) {
		if (maybeReactUseId !== void 0) {
			const reactId = maybeReactUseId();
			return idOverride ?? (prefix ? `${prefix}-${reactId}` : reactId);
		}
		return useGlobalId(idOverride, prefix);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/useBaseUiId.mjs
/**
	* Wraps `useId` and prefixes generated `id`s with `base-ui-`
	* @param {string | undefined} idOverride overrides the generated id when provided
	* @returns {string | undefined}
	*/
	function useBaseUiId(idOverride) {
		return useId$1(idOverride, "base-ui");
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/createBaseUIEventDetails.mjs
/**
	* Maps a change `reason` string to the corresponding native event type.
	*/
	/**
	* Details of custom change events emitted by Base UI components.
	*/
	/**
	* Details of custom generic events emitted by Base UI components.
	*/
	/** Highlight navigation uses mouse events for hover and pointer events for leaving an item. */
	/**
	* Creates a Base UI event details object with the given reason and utilities
	* for preventing Base UI's internal event handling.
	*/
	function createChangeEventDetails(reason, event, trigger, customProperties) {
		let canceled = false;
		let allowPropagation = false;
		const custom = customProperties ?? EMPTY_OBJECT$1;
		return {
			reason,
			event: event ?? new Event("base-ui"),
			cancel() {
				canceled = true;
			},
			allowPropagation() {
				allowPropagation = true;
			},
			get isCanceled() {
				return canceled;
			},
			get isPropagationAllowed() {
				return allowPropagation;
			},
			trigger,
			...custom
		};
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/reason-parts.mjs
	const none = "none";
	const triggerPress = "trigger-press";
	const triggerHover = "trigger-hover";
	const triggerFocus = "trigger-focus";
	const outsidePress = "outside-press";
	const focusOut = "focus-out";
	const escapeKey = "escape-key";
	const disabled = "disabled";
	const imperativeAction = "imperative-action";

// node_modules/.store/@floating-ui/utils@0.2.12-gOxTzMf36nCrbeHpEew-rw/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
	function hasWindow() {
		return typeof window !== "undefined";
	}
	function getNodeName(node) {
		if (isNode(node)) return (node.nodeName || "").toLowerCase();
		return "#document";
	}
	function getWindow(node) {
		var _node$ownerDocument;
		return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
	}
	function getDocumentElement(node) {
		var _ref;
		return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
	}
	function isNode(value) {
		if (!hasWindow()) return false;
		return value instanceof Node || value instanceof getWindow(value).Node;
	}
	function isElement(value) {
		if (!hasWindow()) return false;
		return value instanceof Element || value instanceof getWindow(value).Element;
	}
	function isHTMLElement(value) {
		if (!hasWindow()) return false;
		return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
	}
	function isShadowRoot(value) {
		if (!hasWindow() || typeof ShadowRoot === "undefined") return false;
		return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
	}
	function isOverflowElement(element) {
		const { overflow, overflowX, overflowY, display } = getComputedStyle$1(element);
		return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && display !== "inline" && display !== "contents";
	}
	function isTableElement(element) {
		return /^(table|td|th)$/.test(getNodeName(element));
	}
	function isTopLayer(element) {
		try {
			if (element.matches(":popover-open")) return true;
		} catch (_e) {}
		try {
			return element.matches(":modal");
		} catch (_e) {
			return false;
		}
	}
	const willChangeRe = /transform|translate|scale|rotate|perspective|filter/;
	const containRe = /paint|layout|strict|content/;
	const isNotNone = (value) => !!value && value !== "none";
	let isWebKitValue;
	function isContainingBlock(elementOrCss) {
		const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;
		return isNotNone(css.transform) || isNotNone(css.translate) || isNotNone(css.scale) || isNotNone(css.rotate) || isNotNone(css.perspective) || !isWebKit() && (isNotNone(css.backdropFilter) || isNotNone(css.filter)) || willChangeRe.test(css.willChange || "") || containRe.test(css.contain || "");
	}
	function getContainingBlock(element) {
		let currentNode = getParentNode(element);
		while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
			if (isContainingBlock(currentNode)) return currentNode;
			else if (isTopLayer(currentNode)) return null;
			currentNode = getParentNode(currentNode);
		}
		return null;
	}
	function isWebKit() {
		if (isWebKitValue == null) isWebKitValue = typeof CSS !== "undefined" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none");
		return isWebKitValue;
	}
	function isLastTraversableNode(node) {
		return /^(html|body|#document)$/.test(getNodeName(node));
	}
	function getComputedStyle$1(element) {
		return getWindow(element).getComputedStyle(element);
	}
	function getNodeScroll(element) {
		if (isElement(element)) return {
			scrollLeft: element.scrollLeft,
			scrollTop: element.scrollTop
		};
		return {
			scrollLeft: element.scrollX,
			scrollTop: element.scrollY
		};
	}
	function getParentNode(node) {
		if (getNodeName(node) === "html") return node;
		const result = node.assignedSlot || node.parentNode || isShadowRoot(node) && node.host || getDocumentElement(node);
		return isShadowRoot(result) ? result.host : result;
	}
	function getNearestOverflowAncestor(node) {
		const parentNode = getParentNode(node);
		if (isLastTraversableNode(parentNode)) return (node.ownerDocument || node).body;
		if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode;
		return getNearestOverflowAncestor(parentNode);
	}
	function getOverflowAncestors(node, list, traverseIframes) {
		var _node$ownerDocument2;
		if (list === void 0) list = [];
		if (traverseIframes === void 0) traverseIframes = true;
		const scrollableAncestor = getNearestOverflowAncestor(node);
		const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
		const win = getWindow(scrollableAncestor);
		if (isBody) {
			const frameElement = getFrameElement(win);
			return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
		} else return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
	}
	function getFrameElement(win) {
		return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/owner.mjs
	function ownerDocument(node) {
		return node?.ownerDocument || document;
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/addEventListener.mjs
/**
	* Adds an event listener and returns a cleanup function to remove it.
	*/
	function addEventListener(target, type, listener, options) {
		target.addEventListener(type, listener, options);
		return () => {
			target.removeEventListener(type, listener, options);
		};
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useValueAsRef.mjs
/**
	* Untracks the provided value by turning it into a ref to remove its reactivity.
	*
	* Used to access the passed value inside `React.useEffect` without causing the effect to re-run when the value changes.
	*/
	function useValueAsRef(value) {
		const latest = useRefWithInit(createLatestRef, value).current;
		latest.next = value;
		useIsoLayoutEffect(latest.effect);
		return latest;
	}
	function createLatestRef(value) {
		const latest = {
			current: value,
			next: value,
			effect: () => {
				latest.current = latest.next;
			}
		};
		return latest;
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/platform/shared.mjs
/**
	* Reads `navigator.userAgent` / `navigator.platform` (legacy but universally
	* supported) into a normalized shape. In development, prefers the modern
	* `navigator.userAgentData` API on Chromium to avoid DevTools warnings about
	* the deprecated reads; that branch is dead-code-eliminated in production
	* builds to keep the bundle small.
	*
	* Returns empty/zero values when `navigator` is undefined (SSR), so every
	* derived flag safely evaluates to `false`.
	*/
	function readRawData() {
		if (typeof navigator === "undefined") return {
			userAgent: "",
			platform: "",
			maxTouchPoints: 0
		};
		{
			const uaData = navigator.userAgentData;
			if (uaData && Array.isArray(uaData.brands)) return {
				userAgent: uaData.brands.map(({ brand, version }) => `${brand}/${version}`).join(" "),
				platform: uaData.platform ?? navigator.platform ?? "",
				maxTouchPoints: navigator.maxTouchPoints ?? 0
			};
		}
		return {
			userAgent: navigator.userAgent,
			platform: navigator.platform ?? "",
			maxTouchPoints: navigator.maxTouchPoints ?? 0
		};
	}
	const { userAgent, platform: platform$1, maxTouchPoints } = readRawData();
	const lowerUserAgent = userAgent.toLowerCase();
	const lowerPlatform = platform$1.toLowerCase();

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/platform/os.mjs
/** iPhone, iPad (including iPadOS 13+ reporting as macOS), iPod. */
	const ios = /^i(os$|p)/.test(lowerPlatform) || lowerPlatform === "macintel" && maxTouchPoints > 1;
	/** Android phones, tablets, and embedded Android browsers. */
	const ANDROID_STRING = "android";
	const android = lowerPlatform === ANDROID_STRING || lowerUserAgent.includes(ANDROID_STRING);
	/** macOS desktop. Excludes iPadOS, which reports as `MacIntel`. */
	const mac = !ios && lowerPlatform.startsWith("mac");
	/** Windows desktop. */
	const windows = lowerPlatform.startsWith("win");
	/** Linux desktop (including Chrome OS). */
	const linux = !android && /^(linux|chrome os)/.test(lowerPlatform);
	/** Any Apple OS (`mac || ios`). */
	const apple = mac || ios;

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/platform/engine.mjs
/** WebKit: Safari, all iOS browsers, GNOME Web. Excludes Blink. */
	const webkit = typeof CSS !== "undefined" && !!CSS.supports?.("-webkit-backdrop-filter:none");
	/** Gecko: Firefox. */
	const gecko = !webkit && lowerUserAgent.includes("firefox");
	/** Blink: Chrome, Edge, Opera, Brave, and other Chromium-based browsers. */
	const blink = !webkit && lowerUserAgent.includes("chrom");

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/platform/screen-reader.mjs
/**
	* The user *may* be using VoiceOver — actual activation is not detectable.
	* True on any Apple platform (macOS, iOS, iPadOS).
	*/
	const voiceOver = apple;

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/platform/env.mjs
/** Running in jsdom or HappyDOM (used by unit tests). */
	const jsdom = /jsdom|happydom/.test(lowerUserAgent);

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/event.mjs
	function isReactEvent(event) {
		return "nativeEvent" in event;
	}
	function isVirtualClick(event) {
		if (event.pointerType === "" && event.isTrusted) return true;
		if (android && event.pointerType) return event.type === "click" && event.buttons === 1;
		return event.detail === 0 && !event.pointerType;
	}
	function isMouseLikePointerType(pointerType, strict) {
		const values = ["mouse", "pen"];
		if (!strict) values.push("", void 0);
		return values.includes(pointerType);
	}
	function isClickLikeEvent(event) {
		const type = event.type;
		return type === "click" || type === "mousedown" || type === "keydown" || type === "keyup";
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/shadowDom.mjs
	function activeElement(doc) {
		let element = doc.activeElement;
		while (element?.shadowRoot?.activeElement != null) element = element.shadowRoot.activeElement;
		return element;
	}
	function contains(parent, child) {
		if (!parent || !child) return false;
		const rootNode = child.getRootNode?.();
		if (parent.contains(child)) return true;
		if (rootNode && isShadowRoot(rootNode)) {
			let next = child;
			while (next) {
				if (parent === next) return true;
				next = next.parentNode || next.host;
			}
		}
		return false;
	}
	/**
	* Finds the closest matching element in the composed tree, crossing slots and shadow roots.
	* `:scope` is not supported.
	*/
	function closest(node, selector) {
		let current = node;
		while (current) {
			if (isElement(current) && current.matches(selector)) return current;
			current = current.assignedSlot ?? current.parentNode ?? (isShadowRoot(current) ? current.host : null);
		}
		return null;
	}
	function getTarget(event) {
		if ("composedPath" in event) return event.composedPath()[0] ?? event.target;
		return event.target;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/constants.mjs
	const FOCUSABLE_ATTRIBUTE = "data-base-ui-focusable";
	const TYPEABLE_SELECTOR = "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/CommonPopupDataAttributes.mjs
/**
	* Present when the popup is open.
	*/
	const open = "data-open";
	/**
	* Present when the popup is closed.
	*/
	const closed = "data-closed";
	/**
	* Present when the anchor is hidden.
	*/
	const anchorHidden = "data-anchor-hidden";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/CommonTriggerDataAttributes.mjs
/**
	* Present when the popup is open.
	*/
	const popupOpen$1 = "data-popup-open";
	/**
	* Present when a pressable trigger is pressed.
	*/
	const pressed = "data-pressed";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/popupStateMapping.mjs
	const TRIGGER_HOOK = { [popupOpen$1]: "" };
	const PRESSABLE_TRIGGER_HOOK = {
		[popupOpen$1]: "",
		[pressed]: ""
	};
	const POPUP_OPEN_HOOK = { [open]: "" };
	const POPUP_CLOSED_HOOK = { [closed]: "" };
	const ANCHOR_HIDDEN_HOOK = { [anchorHidden]: "" };
	const triggerOpenStateMapping = { open(value) {
		if (value) return TRIGGER_HOOK;
		return null;
	} };
	const popupStateMapping = {
		open(value) {
			if (value) return POPUP_OPEN_HOOK;
			return POPUP_CLOSED_HOOK;
		},
		anchorHidden(value) {
			if (value) return ANCHOR_HIDDEN_HOOK;
			return null;
		}
	};
	const popupTransitionStateMapping = {
		...popupStateMapping,
		...transitionStatusMapping
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/trigger/TooltipTriggerDataAttributes.mjs
/**
	* Present when the corresponding tooltip is open.
	*/
	const popupOpen = popupOpen$1;
	/**
	* Present when the trigger is disabled, either by the `disabled` prop or by a parent `<Tooltip.Root>` component.
	*/
	const triggerDisabled = "data-trigger-disabled";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/element.mjs
	function isTargetInsideEnabledTrigger(target, triggerElements) {
		if (!isElement(target)) return false;
		const targetElement = target;
		if (triggerElements.hasElement(targetElement)) return !targetElement.hasAttribute(triggerDisabled);
		for (const [, trigger] of triggerElements.entries()) if (contains(trigger, targetElement)) return !trigger.hasAttribute(triggerDisabled);
		return false;
	}
	function isEventTargetWithin(event, node) {
		if (node == null) return false;
		if ("composedPath" in event) return event.composedPath().includes(node);
		const eventAgain = event;
		return eventAgain.target != null && node.contains(eventAgain.target);
	}
	function isRootElement(element) {
		return element.matches("html,body");
	}
	function isTypeableElement(element) {
		return isHTMLElement(element) && element.matches("input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])");
	}
	function isInteractiveElement(element) {
		return closest(element, `button,a[href],[role="button"],select,[tabindex]:not([tabindex="-1"]),${TYPEABLE_SELECTOR}`) != null;
	}
	function matchesFocusVisible(element) {
		if (!element || jsdom) return true;
		try {
			return element.matches(":focus-visible");
		} catch (_e) {
			return true;
		}
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useHoverShared.mjs
	function resolveValue(value, pointerType) {
		if (pointerType != null && !isMouseLikePointerType(pointerType)) return 0;
		if (typeof value === "function") return value();
		return value;
	}
	function getDelay(value, prop, pointerType) {
		const result = resolveValue(value, pointerType);
		if (typeof result === "number") return result;
		return result?.[prop];
	}
	function getRestMs(value) {
		if (typeof value === "function") return value();
		return value;
	}
	function isClickLikeOpenEvent(openEventType, interactedInside) {
		return interactedInside || openEventType === "click" || openEventType === "mousedown";
	}
	function isHoverOpenEvent(openEventType) {
		return openEventType?.includes("mouse") && openEventType !== "mousedown";
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/components/FloatingDelayGroup.mjs
	const FloatingDelayGroupContext = /*#__PURE__*/ react.createContext({
		hasProvider: false,
		timeoutMs: 0,
		delayRef: { current: 0 },
		initialDelayRef: { current: 0 },
		timeout: new Timeout(),
		currentIdRef: { current: null },
		currentContextRef: { current: null }
	});
	FloatingDelayGroupContext.displayName = "FloatingDelayGroupContext";
	function resetDelayRef(delayRef, initialDelayRef) {
		delayRef.current = initialDelayRef.current;
	}
	/**
	* Experimental next version of `FloatingDelayGroup` to become the default
	* in the future. This component is not yet stable.
	* Provides context for a group of floating elements that should share a
	* `delay`. Unlike `FloatingDelayGroup`, `useDelayGroup` with this
	* component does not cause a re-render of unrelated consumers of the
	* context when the delay changes.
	* @see https://floating-ui.com/docs/FloatingDelayGroup
	* @internal
	*/
	function FloatingDelayGroup(props) {
		const { children, delay, timeoutMs = 0 } = props;
		const delayRef = react.useRef(delay);
		const initialDelayRef = react.useRef(delay);
		const currentIdRef = react.useRef(null);
		const currentContextRef = react.useRef(null);
		const timeout = useTimeout();
		useIsoLayoutEffect(() => {
			initialDelayRef.current = delay;
			if (!currentIdRef.current) {
				delayRef.current = delay;
				return;
			}
			delayRef.current = {
				open: getDelay(delayRef.current, "open"),
				close: getDelay(delay, "close")
			};
		}, [
			delay,
			currentIdRef,
			delayRef,
			initialDelayRef
		]);
		return /*#__PURE__*/ (0, react_jsx_runtime.jsx)(FloatingDelayGroupContext.Provider, {
			value: react.useMemo(() => ({
				hasProvider: true,
				delayRef,
				initialDelayRef,
				currentIdRef,
				timeoutMs,
				currentContextRef,
				timeout
			}), [timeoutMs, timeout]),
			children
		});
	}
	/**
	* Enables grouping when called inside a component that's a child of a
	* `FloatingDelayGroup`.
	* @see https://floating-ui.com/docs/FloatingDelayGroup
	* @internal
	*/
	function useDelayGroup(store, options = { open: false }) {
		const { open } = options;
		const floatingId = store.useState("floatingId");
		const { currentIdRef, delayRef, timeoutMs, initialDelayRef, currentContextRef, hasProvider, timeout } = react.useContext(FloatingDelayGroupContext);
		const [isInstantPhase, setIsInstantPhase] = react.useState(false);
		const openRef = react.useRef(open);
		useIsoLayoutEffect(() => {
			openRef.current = open;
		}, [open]);
		useIsoLayoutEffect(() => {
			function unset() {
				currentContextRef.current?.setIsInstantPhase(false);
				currentIdRef.current = null;
				currentContextRef.current = null;
				delayRef.current = initialDelayRef.current;
				timeout.clear();
			}
			if (!currentIdRef.current) return;
			if (!open && currentIdRef.current === floatingId) {
				setIsInstantPhase(false);
				if (timeoutMs) {
					const closingId = floatingId;
					timeout.start(timeoutMs, () => {
						if (store.select("open") || currentIdRef.current && currentIdRef.current !== closingId) return;
						unset();
					});
					return () => {
						if (openRef.current || currentIdRef.current !== closingId) timeout.clear();
					};
				}
				unset();
			}
		}, [
			open,
			floatingId,
			currentIdRef,
			delayRef,
			timeoutMs,
			initialDelayRef,
			currentContextRef,
			timeout,
			store
		]);
		useIsoLayoutEffect(() => {
			if (!open) return;
			const prevContext = currentContextRef.current;
			const prevId = currentIdRef.current;
			timeout.clear();
			currentContextRef.current = {
				onOpenChange: store.setOpen,
				setIsInstantPhase
			};
			currentIdRef.current = floatingId;
			delayRef.current = {
				open: 0,
				close: getDelay(initialDelayRef.current, "close")
			};
			if (prevId !== null && prevId !== floatingId) {
				setIsInstantPhase(true);
				prevContext?.setIsInstantPhase(true);
				prevContext?.onOpenChange(false, createChangeEventDetails(none));
			} else {
				setIsInstantPhase(false);
				prevContext?.setIsInstantPhase(false);
			}
		}, [
			open,
			floatingId,
			store,
			currentIdRef,
			delayRef,
			initialDelayRef,
			currentContextRef,
			timeout
		]);
		useIsoLayoutEffect(() => {
			return () => {
				if (currentIdRef.current === floatingId) {
					currentContextRef.current = null;
					if (!openRef.current) return;
					currentIdRef.current = null;
					resetDelayRef(delayRef, initialDelayRef);
					timeout.clear();
				}
			};
		}, [
			currentContextRef,
			currentIdRef,
			delayRef,
			floatingId,
			initialDelayRef,
			timeout
		]);
		return react.useMemo(() => ({
			activeIdRef: currentIdRef,
			hasProvider,
			delayRef,
			isInstantPhase
		}), [
			currentIdRef,
			hasProvider,
			delayRef,
			isInstantPhase
		]);
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/mergeCleanups.mjs
/**
	* Combines multiple cleanup functions into a single cleanup function.
	*/
	function mergeCleanups(...cleanups) {
		return () => {
			for (let i = 0; i < cleanups.length; i += 1) {
				const cleanup = cleanups[i];
				if (cleanup) cleanup();
			}
		};
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/visuallyHidden.mjs
	const visuallyHiddenBase = {
		clipPath: "inset(50%)",
		overflow: "hidden",
		whiteSpace: "nowrap",
		border: 0,
		padding: 0,
		width: 1,
		height: 1,
		margin: -1
	};
	const visuallyHidden = {
		...visuallyHiddenBase,
		position: "fixed",
		margin: 0,
		top: 0,
		left: 0
	};
	const visuallyHiddenInput = {
		...visuallyHiddenBase,
		position: "absolute"
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/FocusGuard.mjs
/**
	* @internal
	*/
	const FocusGuard = /*#__PURE__*/ react.forwardRef(function FocusGuard(props, ref) {
		const [role, setRole] = react.useState();
		useIsoLayoutEffect(() => {
			if (voiceOver && webkit) setRole("button");
		}, []);
		const restProps = {
			tabIndex: 0,
			role
		};
		return /*#__PURE__*/ (0, react_jsx_runtime.jsx)("span", {
			...props,
			ref,
			style: visuallyHidden,
			"aria-hidden": role ? void 0 : true,
			...restProps,
			"data-base-ui-focus-guard": ""
		});
	});
	FocusGuard.displayName = "FocusGuard";

// node_modules/.store/@floating-ui/utils@0.2.12-gOxTzMf36nCrbeHpEew-rw/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
	const min = Math.min;
	const max = Math.max;
	const round = Math.round;
	const floor = Math.floor;
	const createCoords = (v) => ({
		x: v,
		y: v
	});
	const oppositeSideMap = {
		left: "right",
		right: "left",
		bottom: "top",
		top: "bottom"
	};
	function clamp(start, value, end) {
		return max(start, min(value, end));
	}
	function evaluate(value, param) {
		return typeof value === "function" ? value(param) : value;
	}
	function getSide(placement) {
		return placement.split("-")[0];
	}
	function getAlignment(placement) {
		return placement.split("-")[1];
	}
	function getOppositeAxis(axis) {
		return axis === "x" ? "y" : "x";
	}
	function getAxisLength(axis) {
		return axis === "y" ? "height" : "width";
	}
	function getSideAxis(placement) {
		const firstChar = placement[0];
		return firstChar === "t" || firstChar === "b" ? "y" : "x";
	}
	function getAlignmentAxis(placement) {
		return getOppositeAxis(getSideAxis(placement));
	}
	function getAlignmentSides(placement, rects, rtl) {
		if (rtl === void 0) rtl = false;
		const alignment = getAlignment(placement);
		const alignmentAxis = getAlignmentAxis(placement);
		const length = getAxisLength(alignmentAxis);
		let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
		if (rects.reference[length] > rects.floating[length]) mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
		return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
	}
	function getExpandedPlacements(placement) {
		const oppositePlacement = getOppositePlacement(placement);
		return [
			getOppositeAlignmentPlacement(placement),
			oppositePlacement,
			getOppositeAlignmentPlacement(oppositePlacement)
		];
	}
	function getOppositeAlignmentPlacement(placement) {
		return placement.includes("start") ? placement.replace("start", "end") : placement.replace("end", "start");
	}
	const lrPlacement = ["left", "right"];
	const rlPlacement = ["right", "left"];
	const tbPlacement = ["top", "bottom"];
	const btPlacement = ["bottom", "top"];
	function getSideList(side, isStart, rtl) {
		switch (side) {
			case "top":
			case "bottom":
				if (rtl) return isStart ? rlPlacement : lrPlacement;
				return isStart ? lrPlacement : rlPlacement;
			case "left":
			case "right": return isStart ? tbPlacement : btPlacement;
			default: return [];
		}
	}
	function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
		const alignment = getAlignment(placement);
		let list = getSideList(getSide(placement), direction === "start", rtl);
		if (alignment) {
			list = list.map((side) => side + "-" + alignment);
			if (flipAlignment) list = list.concat(list.map(getOppositeAlignmentPlacement));
		}
		return list;
	}
	function getOppositePlacement(placement) {
		const side = getSide(placement);
		return oppositeSideMap[side] + placement.slice(side.length);
	}
	function expandPaddingObject(padding) {
		var _padding$top, _padding$right, _padding$bottom, _padding$left;
		return {
			top: (_padding$top = padding.top) != null ? _padding$top : 0,
			right: (_padding$right = padding.right) != null ? _padding$right : 0,
			bottom: (_padding$bottom = padding.bottom) != null ? _padding$bottom : 0,
			left: (_padding$left = padding.left) != null ? _padding$left : 0
		};
	}
	function getPaddingObject(padding) {
		return typeof padding !== "number" ? expandPaddingObject(padding) : {
			top: padding,
			right: padding,
			bottom: padding,
			left: padding
		};
	}
	function rectToClientRect(rect) {
		const { x, y, width, height } = rect;
		return {
			width,
			height,
			top: y,
			left: x,
			right: x + width,
			bottom: y + height,
			x,
			y
		};
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/composite.mjs
	function isHiddenByStyles(styles) {
		return styles.visibility === "hidden" || styles.visibility === "collapse";
	}
	function isElementVisible(element, styles = element ? getComputedStyle$1(element) : null) {
		if (!element || !element.isConnected || !styles || isHiddenByStyles(styles)) return false;
		if (typeof element.checkVisibility === "function") return element.checkVisibility();
		return styles.display !== "none" && styles.display !== "contents";
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/tabbable.mjs
	const CANDIDATE_SELECTOR = "a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable=\"false\"]),audio[controls],video[controls]";
	function getParentElement(element) {
		const assignedSlot = element.assignedSlot;
		if (assignedSlot) return assignedSlot;
		if (element.parentElement) return element.parentElement;
		const rootNode = element.getRootNode();
		return isShadowRoot(rootNode) ? rootNode.host : null;
	}
	function getDetailsSummary(details) {
		for (const child of Array.from(details.children)) if (getNodeName(child) === "summary") return child;
		return null;
	}
	function isWithinOpenDetailsSummary(element, details) {
		const summary = getDetailsSummary(details);
		return !!summary && (element === summary || contains(summary, element));
	}
	function isFocusableCandidate(element) {
		const nodeName = element ? getNodeName(element) : "";
		return element != null && element.matches(CANDIDATE_SELECTOR) && (nodeName !== "summary" || element.parentElement != null && getNodeName(element.parentElement) === "details" && getDetailsSummary(element.parentElement) === element) && (nodeName !== "details" || getDetailsSummary(element) == null) && (nodeName !== "input" || element.type !== "hidden");
	}
	function isFocusableElement(element) {
		if (!isFocusableCandidate(element) || !element.isConnected || element.matches(":disabled")) return false;
		for (let current = element; current; current = getParentElement(current)) {
			const isAncestor = current !== element;
			const isSlot = getNodeName(current) === "slot";
			if (current.hasAttribute("inert")) return false;
			if (isAncestor && getNodeName(current) === "details" && !current.open && !isWithinOpenDetailsSummary(element, current) || current.hasAttribute("hidden") || !isSlot && !isVisibleInTabbableTree(current, isAncestor)) return false;
		}
		return true;
	}
	function isVisibleInTabbableTree(element, isAncestor) {
		const styles = getComputedStyle$1(element);
		if (!isAncestor) return isElementVisible(element, styles);
		return styles.display !== "none";
	}
	function getTabIndex(element) {
		const tabIndex = element.tabIndex;
		if (tabIndex < 0) {
			const nodeName = getNodeName(element);
			if (nodeName === "details" || nodeName === "audio" || nodeName === "video" || isHTMLElement(element) && element.isContentEditable) return 0;
		}
		return tabIndex;
	}
	function getNamedRadioInput(element) {
		if (getNodeName(element) !== "input") return null;
		const input = element;
		return input.type === "radio" && input.name !== "" ? input : null;
	}
	function isTabbableRadio(element, candidates) {
		const input = getNamedRadioInput(element);
		if (!input) return true;
		const checkedRadio = candidates.find((candidate) => {
			const radio = getNamedRadioInput(candidate);
			return radio?.name === input.name && radio.form === input.form && radio.checked;
		});
		if (checkedRadio) return checkedRadio === input;
		return candidates.find((candidate) => {
			const radio = getNamedRadioInput(candidate);
			return radio?.name === input.name && radio.form === input.form;
		}) === input;
	}
	function getComposedChildren(container) {
		if (isHTMLElement(container) && getNodeName(container) === "slot") {
			const assignedElements = container.assignedElements({ flatten: true });
			if (assignedElements.length > 0) return assignedElements;
		}
		if (isHTMLElement(container) && container.shadowRoot) return Array.from(container.shadowRoot.children);
		return Array.from(container.children);
	}
	function appendCandidates(container, list) {
		getComposedChildren(container).forEach((child) => {
			if (isFocusableCandidate(child)) list.push(child);
			appendCandidates(child, list);
		});
	}
	function appendMatchingElements(container, selector, list) {
		getComposedChildren(container).forEach((child) => {
			if (isHTMLElement(child) && child.matches(selector)) list.push(child);
			appendMatchingElements(child, selector, list);
		});
	}
	function focusable(container) {
		const candidates = [];
		appendCandidates(container, candidates);
		return candidates.filter(isFocusableElement);
	}
	function tabbable(container) {
		const candidates = focusable(container);
		return candidates.filter((element) => getTabIndex(element) >= 0 && isTabbableRadio(element, candidates));
	}
	function getTabbableIn(container, dir) {
		const list = tabbable(container);
		const len = list.length;
		if (len === 0) return;
		const active = activeElement(ownerDocument(container));
		const index = list.indexOf(active);
		return list[index === -1 ? dir === 1 ? 0 : len - 1 : index + dir];
	}
	function getNextTabbable(referenceElement) {
		return getTabbableIn(ownerDocument(referenceElement).body, 1) || referenceElement;
	}
	function getPreviousTabbable(referenceElement) {
		return getTabbableIn(ownerDocument(referenceElement).body, -1) || referenceElement;
	}
	function isOutsideEvent(event, container) {
		const containerElement = container || event.currentTarget;
		const relatedTarget = event.relatedTarget;
		return !relatedTarget || !contains(containerElement, relatedTarget);
	}
	function disableFocusInside(container) {
		tabbable(container).forEach((element) => {
			element.dataset.tabindex = element.getAttribute("tabindex") || "";
			element.setAttribute("tabindex", "-1");
		});
	}
	function enableFocusInside(container) {
		const elements = [];
		appendMatchingElements(container, "[data-tabindex]", elements);
		elements.forEach((element) => {
			const tabindex = element.dataset.tabindex;
			delete element.dataset.tabindex;
			if (tabindex) element.setAttribute("tabindex", tabindex);
			else element.removeAttribute("tabindex");
		});
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/nodes.mjs
	function getNodeChildren(nodes, id, onlyOpenChildren = true) {
		return nodes.filter((node) => node.parentId === id).flatMap((child) => [...!onlyOpenChildren || child.context?.open ? [child] : [], ...getNodeChildren(nodes, child.id, onlyOpenChildren)]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/createAttribute.mjs
	function createAttribute(name) {
		return `data-base-ui-${name}`;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/constants.mjs
	const DISABLED_TRANSITIONS_STYLE = { style: { transition: "none" } };
	/**
	* Used by regular popups that usually aren't scrollable and are allowed to
	* freely flip to any axis of placement.
	*/
	const POPUP_COLLISION_AVOIDANCE = { fallbackAxisSide: "end" };
	/**
	* Special visually hidden styles for the aria-owns owner element to ensure owned element
	* accessibility in iOS/Safari/VoiceControl.
	* The owner element is an empty span, so most of the common visually hidden styles are not needed.
	* @see https://github.com/floating-ui/floating-ui/issues/3403
	*/
	const ownerVisuallyHidden = {
		clipPath: "inset(50%)",
		position: "fixed",
		top: 0,
		left: 0
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/components/FloatingPortal.mjs
	const PortalContext = /*#__PURE__*/ react.createContext(null);
	PortalContext.displayName = "PortalContext";
	const usePortalContext = () => react.useContext(PortalContext);
	const attr = createAttribute("portal");
	function useFloatingPortalNode(props = {}) {
		const { ref, container: containerProp, componentProps = EMPTY_OBJECT$1, elementProps } = props;
		const uniqueId = useId$1();
		const parentPortalNode = usePortalContext()?.portalNode;
		const [containerElement, setContainerElement] = react.useState(null);
		const [portalNode, setPortalNode] = react.useState(null);
		const setPortalNodeRef = useStableCallback((node) => {
			if (node !== null) setPortalNode(node);
		});
		const containerRef = react.useRef(null);
		useIsoLayoutEffect(() => {
			if (containerProp === null) {
				if (containerRef.current) {
					containerRef.current = null;
					setPortalNode(null);
					setContainerElement(null);
				}
				return;
			}
			const resolvedContainer = (containerProp && (isNode(containerProp) ? containerProp : containerProp.current)) ?? parentPortalNode ?? document.body;
			if (resolvedContainer == null) {
				if (containerRef.current) {
					containerRef.current = null;
					setPortalNode(null);
					setContainerElement(null);
				}
				return;
			}
			if (containerRef.current !== resolvedContainer) {
				containerRef.current = resolvedContainer;
				setPortalNode(null);
				setContainerElement(resolvedContainer);
			}
		}, [containerProp, parentPortalNode]);
		const portalElement = useRenderElement("div", componentProps, {
			ref: [ref, setPortalNodeRef],
			props: [{
				id: uniqueId,
				[attr]: ""
			}, elementProps]
		});
		const portalSubtree = containerElement && portalElement ? /*#__PURE__*/ react_dom.createPortal(portalElement, containerElement) : null;
		return {
			node: portalNode,
			nodeId: /*#__PURE__*/ react.isValidElement(portalElement) ? portalElement.props.id : void 0,
			subtree: portalSubtree
		};
	}
	/**
	* Portals the floating element into a given container element — by default,
	* outside of the app root and into the body.
	* This is necessary to ensure the floating element can appear outside any
	* potential parent containers that cause clipping (such as `overflow: hidden`),
	* while retaining its location in the React tree.
	* @see https://floating-ui.com/docs/FloatingPortal
	* @internal
	*/
	const FloatingPortal = /*#__PURE__*/ react.forwardRef(function FloatingPortal(componentProps, forwardedRef) {
		const { render, className, style, children, container, portalOwnerRole, ...elementProps } = componentProps;
		const { node: portalNode, nodeId: portalNodeId, subtree: portalSubtree } = useFloatingPortalNode({
			container,
			ref: forwardedRef,
			componentProps,
			elementProps
		});
		const beforeOutsideRef = react.useRef(null);
		const afterOutsideRef = react.useRef(null);
		const beforeInsideRef = react.useRef(null);
		const afterInsideRef = react.useRef(null);
		const [focusManagerState, setFocusManagerState] = react.useState(null);
		const focusInsideDisabledRef = react.useRef(false);
		const modal = focusManagerState?.modal;
		const open = focusManagerState?.open;
		const shouldRenderGuards = !!focusManagerState && !focusManagerState.modal && focusManagerState.open && !!portalNode;
		react.useEffect(() => {
			if (!portalNode || modal) return;
			function onFocus(event) {
				if (portalNode && event.relatedTarget && isOutsideEvent(event)) {
					if (event.type === "focusin") {
						if (focusInsideDisabledRef.current) {
							enableFocusInside(portalNode);
							focusInsideDisabledRef.current = false;
						}
					} else {
						disableFocusInside(portalNode);
						focusInsideDisabledRef.current = true;
					}
				}
			}
			return mergeCleanups(addEventListener(portalNode, "focusin", onFocus, true), addEventListener(portalNode, "focusout", onFocus, true));
		}, [portalNode, modal]);
		useIsoLayoutEffect(() => {
			if (!portalNode || open !== true || !focusInsideDisabledRef.current) return;
			enableFocusInside(portalNode);
			focusInsideDisabledRef.current = false;
		}, [open, portalNode]);
		const portalContextValue = react.useMemo(() => ({
			beforeOutsideRef,
			afterOutsideRef,
			beforeInsideRef,
			afterInsideRef,
			portalNode,
			setFocusManagerState
		}), [portalNode]);
		return /*#__PURE__*/ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [portalSubtree, /*#__PURE__*/ (0, react_jsx_runtime.jsxs)(PortalContext.Provider, {
			value: portalContextValue,
			children: [
				shouldRenderGuards && portalNode && /*#__PURE__*/ (0, react_jsx_runtime.jsx)(FocusGuard, {
					"data-type": "outside",
					ref: beforeOutsideRef,
					onFocus: (event) => {
						if (isOutsideEvent(event, portalNode)) beforeInsideRef.current?.focus();
						else {
							const domReference = focusManagerState ? focusManagerState.domReference : null;
							getPreviousTabbable(domReference)?.focus();
						}
					}
				}),
				shouldRenderGuards && portalNode && /*#__PURE__*/ (0, react_jsx_runtime.jsx)("span", {
					role: portalOwnerRole,
					"aria-owns": portalNodeId,
					style: ownerVisuallyHidden
				}),
				portalNode && /*#__PURE__*/ react_dom.createPortal(children, portalNode),
				shouldRenderGuards && portalNode && /*#__PURE__*/ (0, react_jsx_runtime.jsx)(FocusGuard, {
					"data-type": "outside",
					ref: afterOutsideRef,
					onFocus: (event) => {
						if (isOutsideEvent(event, portalNode)) afterInsideRef.current?.focus();
						else {
							const domReference = focusManagerState ? focusManagerState.domReference : null;
							getNextTabbable(domReference)?.focus();
							if (focusManagerState?.closeOnFocusOut) focusManagerState?.onOpenChange(false, createChangeEventDetails("focus-out", event.nativeEvent));
						}
					}
				})
			]
		})] });
	});
	FloatingPortal.displayName = "FloatingPortal";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/createEventEmitter.mjs
	function createEventEmitter() {
		const map = /* @__PURE__ */ new Map();
		return {
			emit(event, data) {
				map.get(event)?.forEach((listener) => listener(data));
			},
			on(event, listener) {
				if (!map.has(event)) map.set(event, /* @__PURE__ */ new Set());
				map.get(event).add(listener);
			},
			off(event, listener) {
				map.get(event)?.delete(listener);
			}
		};
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/components/FloatingTree.mjs
	const FloatingNodeContext = /*#__PURE__*/ react.createContext(null);
	FloatingNodeContext.displayName = "FloatingNodeContext";
	const FloatingTreeContext = /*#__PURE__*/ react.createContext(null);
	FloatingTreeContext.displayName = "FloatingTreeContext";
	const useFloatingParentNodeId = () => react.useContext(FloatingNodeContext)?.id || null;
	/**
	* Returns the nearest floating tree context, if available.
	*/
	const useFloatingTree = (externalTree) => {
		const contextTree = react.useContext(FloatingTreeContext);
		return externalTree ?? contextTree;
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useClientPoint.mjs
	function createVirtualElement(domElement, data) {
		let offsetX = null;
		let offsetY = null;
		let isAutoUpdateEvent = false;
		return {
			contextElement: domElement || void 0,
			getBoundingClientRect() {
				const domRect = domElement?.getBoundingClientRect() || {
					width: 0,
					height: 0,
					x: 0,
					y: 0
				};
				const isXAxis = data.axis === "x" || data.axis === "both";
				const isYAxis = data.axis === "y" || data.axis === "both";
				const canTrackCursorOnAutoUpdate = ["mouseenter", "mousemove"].includes(data.dataRef.current.openEvent?.type || "") && data.pointerType !== "touch";
				const width = data.axis === "y" ? domRect.width : 0;
				const height = data.axis === "x" ? domRect.height : 0;
				let x = domRect.x;
				let y = domRect.y;
				if (offsetX == null && data.x && isXAxis) offsetX = domRect.x - data.x;
				if (offsetY == null && data.y && isYAxis) offsetY = domRect.y - data.y;
				x -= offsetX || 0;
				y -= offsetY || 0;
				if (!isAutoUpdateEvent || canTrackCursorOnAutoUpdate) {
					x = isXAxis && data.x != null ? data.x : x;
					y = isYAxis && data.y != null ? data.y : y;
				}
				isAutoUpdateEvent = true;
				return {
					width,
					height,
					x,
					y,
					top: y,
					right: x + width,
					bottom: y + height,
					left: x
				};
			}
		};
	}
	function isMouseBasedEvent(event) {
		return event != null && event.clientX != null;
	}
	/**
	* Positions the floating element relative to a client point (in the viewport),
	* such as the mouse position. By default, it follows the mouse cursor.
	* @see https://floating-ui.com/docs/useClientPoint
	*/
	function useClientPoint(store, props = {}) {
		const { enabled = true, axis = "both" } = props;
		const open = store.useState("open");
		const floating = store.useState("floatingElement");
		const domReference = store.useState("domReferenceElement");
		const dataRef = store.context.dataRef;
		const initialRef = react.useRef(false);
		const cleanupListenerRef = react.useRef(null);
		const [pointerType, setPointerType] = react.useState();
		const [reactive, setReactive] = react.useState([]);
		const resetReference = useStableCallback((reference) => {
			store.set("positionReference", reference);
		});
		const setReference = useStableCallback((newX, newY, referenceElement) => {
			if (initialRef.current) return;
			if (dataRef.current.openEvent && !isMouseBasedEvent(dataRef.current.openEvent)) return;
			store.set("positionReference", createVirtualElement(referenceElement ?? domReference, {
				x: newX,
				y: newY,
				axis,
				dataRef,
				pointerType
			}));
		});
		const handleReferenceEnterOrMove = useStableCallback((event) => {
			if (!open) setReference(event.clientX, event.clientY, event.currentTarget);
			else if (!cleanupListenerRef.current) {
				setReference(event.clientX, event.clientY, event.currentTarget);
				setReactive([]);
			}
		});
		const openCheck = isMouseLikePointerType(pointerType) ? floating : open;
		react.useEffect(() => {
			if (!enabled) {
				resetReference(domReference);
				return;
			}
			if (!openCheck) return;
			function cleanupListener() {
				cleanupListenerRef.current?.();
				cleanupListenerRef.current = null;
			}
			const win = getWindow(floating);
			function handleMouseMove(event) {
				const target = getTarget(event);
				if (!contains(floating, target)) setReference(event.clientX, event.clientY);
				else cleanupListener();
			}
			if (!dataRef.current.openEvent || isMouseBasedEvent(dataRef.current.openEvent)) cleanupListenerRef.current = addEventListener(win, "mousemove", handleMouseMove);
			else resetReference(domReference);
			return cleanupListener;
		}, [
			openCheck,
			enabled,
			floating,
			dataRef,
			domReference,
			store,
			setReference,
			resetReference,
			reactive
		]);
		react.useEffect(() => () => {
			store.set("positionReference", null);
		}, [store]);
		react.useEffect(() => {
			if (enabled && !floating) initialRef.current = false;
		}, [enabled, floating]);
		react.useEffect(() => {
			if (!enabled && open) initialRef.current = true;
		}, [enabled, open]);
		const reference = react.useMemo(() => {
			function setPointerTypeRef(event) {
				setPointerType(event.pointerType);
			}
			return {
				onPointerDown: setPointerTypeRef,
				onPointerEnter: setPointerTypeRef,
				onMouseMove: handleReferenceEnterOrMove,
				onMouseEnter: handleReferenceEnterOrMove
			};
		}, [handleReferenceEnterOrMove]);
		return react.useMemo(() => enabled ? {
			reference,
			trigger: reference
		} : {}, [enabled, reference]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useDismiss.mjs
	function alwaysFalse() {
		return false;
	}
	function normalizeProp(normalizable) {
		return {
			escapeKey: typeof normalizable === "boolean" ? normalizable : normalizable?.escapeKey ?? false,
			outsidePress: typeof normalizable === "boolean" ? normalizable : normalizable?.outsidePress ?? true
		};
	}
	/**
	* Closes the floating element when a dismissal is requested — by default, when
	* the user presses the `escape` key or outside of the floating element.
	* @see https://floating-ui.com/docs/useDismiss
	*/
	function useDismiss(store, props = {}) {
		const { enabled = true, escapeKey: escapeKey$1 = true, outsidePress: outsidePressProp = true, outsidePressEvent = "sloppy", referencePress = alwaysFalse, bubbles, externalTree } = props;
		const open = store.useState("open");
		const floatingElement = store.useState("floatingElement");
		const { dataRef, events } = store.context;
		const tree = useFloatingTree(externalTree);
		const outsidePressFn = useStableCallback(typeof outsidePressProp === "function" ? outsidePressProp : () => false);
		const outsidePress$1 = typeof outsidePressProp === "function" ? outsidePressFn : outsidePressProp;
		const outsidePressEnabled = outsidePress$1 !== false;
		const getOutsidePressEventProp = useStableCallback(() => outsidePressEvent);
		const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = normalizeProp(bubbles);
		const pressStartedInsideRef = react.useRef(false);
		const pressStartPreventedRef = react.useRef(false);
		const suppressNextOutsideClickRef = react.useRef(false);
		const sawPressWhileOpenRef = react.useRef(false);
		const isComposingRef = react.useRef(false);
		const currentPointerTypeRef = react.useRef("");
		const touchStateRef = react.useRef(null);
		const cancelDismissOnEndTimeout = useTimeout();
		const clearInsideReactTreeTimeout = useTimeout();
		const compositionTimeout = useTimeout();
		const clearInsideReactTree = useStableCallback(() => {
			clearInsideReactTreeTimeout.clear();
			dataRef.current.insideReactTree = false;
		});
		const hasBlockingChild = useStableCallback((bubbleKey) => {
			const nodeId = dataRef.current.floatingContext?.nodeId;
			return (tree ? getNodeChildren(tree.nodesRef.current, nodeId) : []).some((child) => child.context?.open && !child.context.dataRef.current[bubbleKey]);
		});
		const isEventWithinOwnElements = useStableCallback((event) => {
			return isEventTargetWithin(event, store.select("floatingElement")) || isEventTargetWithin(event, store.select("domReferenceElement"));
		});
		const closeOnReferencePress = useStableCallback((event) => {
			if (!referencePress()) return;
			store.setOpen(false, createChangeEventDetails(triggerPress, event.nativeEvent));
		});
		const closeOnEscapeKeyDown = useStableCallback((event) => {
			if (!open || !enabled || !escapeKey$1 || event.key !== "Escape") return;
			const native = isReactEvent(event) ? event.nativeEvent : event;
			if (isComposingRef.current || native.isComposing) return;
			if (!escapeKeyBubbles && hasBlockingChild("__escapeKeyBubbles")) return;
			const eventDetails = createChangeEventDetails(escapeKey, native);
			store.setOpen(false, eventDetails);
			if (!eventDetails.isCanceled) event.preventDefault();
			if (!escapeKeyBubbles && !eventDetails.isPropagationAllowed) event.stopPropagation();
		});
		const markInsideReactTree = useStableCallback(() => {
			dataRef.current.insideReactTree = true;
			clearInsideReactTreeTimeout.start(0, clearInsideReactTree);
		});
		const markPressStartedInsideReactTree = useStableCallback((event) => {
			if (!open || !enabled || event.button !== 0) return;
			const target = getTarget(event.nativeEvent);
			if (!contains(store.select("floatingElement"), target)) return;
			if (!pressStartedInsideRef.current) {
				pressStartedInsideRef.current = true;
				pressStartPreventedRef.current = false;
			}
		});
		const markInsidePressStartPrevented = useStableCallback((event) => {
			if (!open || !enabled) return;
			if (!(event.defaultPrevented || event.nativeEvent.defaultPrevented)) return;
			if (pressStartedInsideRef.current) pressStartPreventedRef.current = true;
		});
		react.useEffect(() => {
			function handleOpenChange(details) {
				if (!details.open) sawPressWhileOpenRef.current = false;
			}
			events.on("openchange", handleOpenChange);
			return () => {
				events.off("openchange", handleOpenChange);
			};
		}, [events]);
		react.useEffect(() => clearInsideReactTree, [clearInsideReactTree]);
		react.useEffect(() => {
			if (!open || !enabled) {
				if (!open) {
					sawPressWhileOpenRef.current = false;
					isComposingRef.current = false;
					currentPointerTypeRef.current = "";
					touchStateRef.current = null;
				}
				return clearInsideReactTree;
			}
			dataRef.current.__escapeKeyBubbles = escapeKeyBubbles;
			dataRef.current.__outsidePressBubbles = outsidePressBubbles;
			const preventedPressSuppressionTimeout = new Timeout();
			const doc = ownerDocument(floatingElement);
			function handleCompositionStart() {
				compositionTimeout.clear();
				isComposingRef.current = true;
			}
			function handleCompositionEnd() {
				isComposingRef.current = true;
				compositionTimeout.start(webkit ? 5 : 0, () => {
					isComposingRef.current = false;
				});
			}
			function suppressImmediateOutsideClickAfterPreventedStart() {
				suppressNextOutsideClickRef.current = true;
				preventedPressSuppressionTimeout.start(0, () => {
					suppressNextOutsideClickRef.current = false;
				});
			}
			function resetPressStartState() {
				pressStartedInsideRef.current = false;
				pressStartPreventedRef.current = false;
			}
			function getOutsidePressEvent() {
				const type = currentPointerTypeRef.current;
				const computedType = type === "pen" || !type ? "mouse" : type;
				const outsidePressEventValue = getOutsidePressEventProp();
				const resolved = typeof outsidePressEventValue === "function" ? outsidePressEventValue() : outsidePressEventValue;
				if (typeof resolved === "string") return resolved;
				return resolved[computedType];
			}
			function shouldIgnoreEvent(event) {
				const computedOutsidePressEvent = getOutsidePressEvent();
				return computedOutsidePressEvent === "intentional" && event.type !== "click" || computedOutsidePressEvent === "sloppy" && event.type === "click";
			}
			function isEventWithinFloatingTree(event) {
				const nodeId = dataRef.current.floatingContext?.nodeId;
				const targetIsInsideChildren = tree && getNodeChildren(tree.nodesRef.current, nodeId).some((node) => isEventTargetWithin(event, node.context?.elements.floating));
				return isEventWithinOwnElements(event) || targetIsInsideChildren;
			}
			function closeOnPressOutside(event) {
				if (shouldIgnoreEvent(event)) {
					if (event.type !== "click" && !isEventWithinOwnElements(event)) {
						preventedPressSuppressionTimeout.clear();
						suppressNextOutsideClickRef.current = false;
					}
					clearInsideReactTree();
					return;
				}
				if (dataRef.current.insideReactTree) {
					clearInsideReactTree();
					return;
				}
				const target = getTarget(event);
				const inertSelector = `[${createAttribute("inert")}]`;
				const targetRoot = isElement(target) ? target.getRootNode() : null;
				const markers = Array.from((isShadowRoot(targetRoot) ? targetRoot : ownerDocument(store.select("floatingElement"))).querySelectorAll(inertSelector));
				const triggers = store.context.triggerElements;
				if (target && (triggers.hasElement(target) || triggers.hasMatchingElement((trigger) => contains(trigger, target)))) return;
				let targetRootAncestor = isElement(target) ? target : null;
				while (targetRootAncestor && !isLastTraversableNode(targetRootAncestor)) {
					const nextParent = getParentNode(targetRootAncestor);
					if (isLastTraversableNode(nextParent) || !isElement(nextParent)) break;
					targetRootAncestor = nextParent;
				}
				if (markers.length && isElement(target) && !isRootElement(target) && !contains(target, store.select("floatingElement")) && markers.every((marker) => !contains(targetRootAncestor, marker))) return;
				if (isHTMLElement(target) && !("touches" in event)) {
					const lastTraversableNode = isLastTraversableNode(target);
					const style = getComputedStyle$1(target);
					const scrollRe = /auto|scroll/;
					const isScrollableX = lastTraversableNode || scrollRe.test(style.overflowX);
					const isScrollableY = lastTraversableNode || scrollRe.test(style.overflowY);
					const canScrollX = isScrollableX && target.clientWidth > 0 && target.scrollWidth > target.clientWidth;
					const canScrollY = isScrollableY && target.clientHeight > 0 && target.scrollHeight > target.clientHeight;
					const isRTL = style.direction === "rtl";
					const pressedVerticalScrollbar = canScrollY && (isRTL ? event.offsetX <= target.offsetWidth - target.clientWidth : event.offsetX > target.clientWidth);
					const pressedHorizontalScrollbar = canScrollX && event.offsetY > target.clientHeight;
					if (pressedVerticalScrollbar || pressedHorizontalScrollbar) return;
				}
				if (isEventWithinFloatingTree(event)) return;
				if (getOutsidePressEvent() === "intentional") {
					if (event.detail !== 0 && !isVirtualClick(event) && !sawPressWhileOpenRef.current) return;
					if (suppressNextOutsideClickRef.current) {
						preventedPressSuppressionTimeout.clear();
						suppressNextOutsideClickRef.current = false;
						return;
					}
				}
				if (typeof outsidePress$1 === "function" && !outsidePress$1(event)) return;
				if (hasBlockingChild("__outsidePressBubbles")) return;
				store.setOpen(false, createChangeEventDetails(outsidePress, event));
				clearInsideReactTree();
			}
			function handlePointerDown(event) {
				if (getOutsidePressEvent() !== "sloppy" || event.pointerType === "touch" || !store.select("open") || !enabled || isEventWithinOwnElements(event)) return;
				closeOnPressOutside(event);
			}
			function handleTouchStart(event) {
				if (getOutsidePressEvent() !== "sloppy" || !store.select("open") || !enabled || isEventWithinOwnElements(event)) return;
				const touch = event.touches[0];
				if (touch) {
					touchStateRef.current = {
						startTime: Date.now(),
						startX: touch.clientX,
						startY: touch.clientY,
						dismissOnTouchEnd: false,
						dismissOnMouseDown: true
					};
					cancelDismissOnEndTimeout.start(1e3, () => {
						if (touchStateRef.current) {
							touchStateRef.current.dismissOnTouchEnd = false;
							touchStateRef.current.dismissOnMouseDown = false;
						}
					});
				}
			}
			function addTargetEventListenerOnce(event, listener) {
				const target = getTarget(event);
				if (!target) return;
				const unsubscribe = addEventListener(target, event.type, () => {
					listener(event);
					unsubscribe();
				});
			}
			function handleTouchStartCapture(event) {
				currentPointerTypeRef.current = "touch";
				addTargetEventListenerOnce(event, handleTouchStart);
			}
			function closeOnPressOutsideCapture(event) {
				cancelDismissOnEndTimeout.clear();
				if (event.type === "pointerdown") {
					if (event.button === 0) sawPressWhileOpenRef.current = true;
					currentPointerTypeRef.current = event.pointerType;
				}
				if (event.type === "mousedown" && touchStateRef.current && !touchStateRef.current.dismissOnMouseDown) return;
				addTargetEventListenerOnce(event, (targetEvent) => {
					if (targetEvent.type === "pointerdown") handlePointerDown(targetEvent);
					else closeOnPressOutside(targetEvent);
				});
			}
			function handlePressEndCapture(event) {
				if (event.type === "pointercancel") sawPressWhileOpenRef.current = false;
				if (!pressStartedInsideRef.current) return;
				const pressStartedInsideDefaultPrevented = pressStartPreventedRef.current;
				resetPressStartState();
				if (getOutsidePressEvent() !== "intentional") return;
				if (event.type === "pointercancel") {
					if (pressStartedInsideDefaultPrevented) suppressImmediateOutsideClickAfterPreventedStart();
					return;
				}
				if (isEventWithinFloatingTree(event)) return;
				if (pressStartedInsideDefaultPrevented) {
					suppressImmediateOutsideClickAfterPreventedStart();
					return;
				}
				if (typeof outsidePress$1 === "function" && !outsidePress$1(event)) return;
				preventedPressSuppressionTimeout.clear();
				suppressNextOutsideClickRef.current = true;
				clearInsideReactTree();
			}
			function handleTouchMove(event) {
				if (getOutsidePressEvent() !== "sloppy" || !touchStateRef.current || isEventWithinOwnElements(event)) return;
				const touch = event.touches[0];
				if (!touch) return;
				const deltaX = Math.abs(touch.clientX - touchStateRef.current.startX);
				const deltaY = Math.abs(touch.clientY - touchStateRef.current.startY);
				const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
				if (distance > 5) touchStateRef.current.dismissOnTouchEnd = true;
				if (distance > 10) {
					closeOnPressOutside(event);
					cancelDismissOnEndTimeout.clear();
					touchStateRef.current = null;
				}
			}
			function handleTouchMoveCapture(event) {
				addTargetEventListenerOnce(event, handleTouchMove);
			}
			function handleTouchEnd(event) {
				if (getOutsidePressEvent() !== "sloppy" || !touchStateRef.current || isEventWithinOwnElements(event)) return;
				if (touchStateRef.current.dismissOnTouchEnd) closeOnPressOutside(event);
				cancelDismissOnEndTimeout.clear();
				touchStateRef.current = null;
			}
			function handleTouchEndCapture(event) {
				addTargetEventListenerOnce(event, handleTouchEnd);
			}
			const unsubscribe = mergeCleanups(escapeKey$1 && mergeCleanups(addEventListener(doc, "keydown", closeOnEscapeKeyDown), addEventListener(doc, "compositionstart", handleCompositionStart), addEventListener(doc, "compositionend", handleCompositionEnd)), outsidePressEnabled && mergeCleanups(addEventListener(doc, "click", closeOnPressOutsideCapture, true), addEventListener(doc, "pointerdown", closeOnPressOutsideCapture, true), addEventListener(doc, "pointerup", handlePressEndCapture, true), addEventListener(doc, "pointercancel", handlePressEndCapture, true), addEventListener(doc, "mousedown", closeOnPressOutsideCapture, true), addEventListener(doc, "mouseup", handlePressEndCapture, true), addEventListener(doc, "touchstart", handleTouchStartCapture, {
				capture: true,
				passive: true
			}), addEventListener(doc, "touchmove", handleTouchMoveCapture, {
				capture: true,
				passive: true
			}), addEventListener(doc, "touchend", handleTouchEndCapture, {
				capture: true,
				passive: true
			})));
			return () => {
				unsubscribe();
				preventedPressSuppressionTimeout.clear();
				resetPressStartState();
				suppressNextOutsideClickRef.current = false;
			};
		}, [
			dataRef,
			floatingElement,
			escapeKey$1,
			outsidePressEnabled,
			outsidePress$1,
			open,
			enabled,
			escapeKeyBubbles,
			outsidePressBubbles,
			closeOnEscapeKeyDown,
			clearInsideReactTree,
			getOutsidePressEventProp,
			hasBlockingChild,
			isEventWithinOwnElements,
			tree,
			store,
			cancelDismissOnEndTimeout,
			compositionTimeout
		]);
		const reference = react.useMemo(() => ({
			onKeyDown: closeOnEscapeKeyDown,
			onPointerDown: closeOnReferencePress,
			onClick: closeOnReferencePress
		}), [closeOnEscapeKeyDown, closeOnReferencePress]);
		const floating = react.useMemo(() => ({
			onKeyDown: closeOnEscapeKeyDown,
			onPointerDown: markInsidePressStartPrevented,
			onMouseDown: markInsidePressStartPrevented,
			onClickCapture: markInsideReactTree,
			onMouseDownCapture(event) {
				markInsideReactTree();
				markPressStartedInsideReactTree(event);
			},
			onPointerDownCapture(event) {
				markInsideReactTree();
				markPressStartedInsideReactTree(event);
			},
			onMouseUpCapture: markInsideReactTree,
			onTouchEndCapture: markInsideReactTree,
			onTouchMoveCapture: markInsideReactTree
		}), [
			closeOnEscapeKeyDown,
			markInsideReactTree,
			markPressStartedInsideReactTree,
			markInsidePressStartPrevented
		]);
		return react.useMemo(() => enabled ? {
			reference,
			floating,
			trigger: reference
		} : {}, [
			enabled,
			reference,
			floating
		]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useSyncedFloatingRootContext.mjs
/**
	* Narrowed to the store members this hook uses so consumers do not need to provide
	* unrelated store capabilities.
	*/
	/**
	* Keeps the provided FloatingRootStore in sync with the provided PopupStore.
	*/
	function useSyncedFloatingRootContext(options) {
		const { popupStore, treatPopupAsFloatingElement = false, floatingRootContext: store, floatingId, nested, onOpenChange } = options;
		const open = popupStore.useState("open");
		const referenceElement = popupStore.useState("activeTriggerElement");
		const floatingElement = popupStore.useState(treatPopupAsFloatingElement ? "popupElement" : "positionerElement");
		const handleOpenChange = onOpenChange;
		popupStore.useSyncedValue("floatingId", floatingId);
		useIsoLayoutEffect(() => {
			const valuesToSync = {
				open,
				floatingId,
				referenceElement,
				floatingElement
			};
			if (isElement(referenceElement)) valuesToSync.domReferenceElement = referenceElement;
			if (store.state.positionReference === store.state.referenceElement) valuesToSync.positionReference = referenceElement;
			store.update(valuesToSync);
		}, [
			open,
			floatingId,
			referenceElement,
			floatingElement,
			store
		]);
		store.context.onOpenChange = handleOpenChange;
		store.context.nested = nested;
		return store;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/useUnmountAfterClose.mjs
/**
	* Keeps a popup mounted through its closing animation and unmounts it once the animation
	* finishes, unless the close cycle opted out through `preventUnmountOnClose`.
	* Store-agnostic: hosts sync `mounted` and `transitionStatus` wherever they need them.
	*
	* @returns `forceUnmount` unmounts the popup immediately. It is a no-op once the popup is already
	*   unmounted, so calling it after the automatic unmount doesn't repeat the completion callback,
	*   and a call while the popup is open only takes effect if a close commits in the same batch.
	*/
	function useUnmountAfterClose(parameters) {
		const { open, ref, preventUnmountOnClose, setPreventUnmountOnClose: setPreventUnmountOnCloseParam, onUnmount, animateInitialOpen } = parameters;
		const setPreventUnmountOnClose = useStableCallback(setPreventUnmountOnCloseParam);
		const { mounted, setMounted, transitionStatus } = useTransitionStatus(open, false, false, animateInitialOpen);
		const preventUnmountingOnClose = open ? false : preventUnmountOnClose;
		useIsoLayoutEffect(() => {
			if (open) setPreventUnmountOnClose(false);
		}, [open, setPreventUnmountOnClose]);
		const mountedRef = react.useRef(mounted);
		const pendingUnmountRef = react.useRef(false);
		const rerender = useForcedRerendering();
		const unmount = () => {
			mountedRef.current = false;
			setMounted(false);
			onUnmount();
		};
		useIsoLayoutEffect(() => {
			mountedRef.current = mounted;
			if (pendingUnmountRef.current) {
				pendingUnmountRef.current = false;
				if (!open && mounted) unmount();
			}
		});
		const forceUnmount = useStableCallback(() => {
			if (!mountedRef.current) return;
			if (open) {
				pendingUnmountRef.current = true;
				rerender();
				return;
			}
			unmount();
		});
		useOpenChangeComplete({
			enabled: mounted && !open && !preventUnmountingOnClose,
			open,
			ref,
			onComplete() {
				if (!open) forceUnmount();
			}
		});
		return {
			mounted,
			transitionStatus,
			preventUnmountingOnClose,
			forceUnmount
		};
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/popups/popupStoreUtils.mjs
	const FOCUSABLE_POPUP_PROPS = {
		tabIndex: -1,
		[FOCUSABLE_ATTRIBUTE]: ""
	};
	/**
	* The subset of a popup handle that a Root needs to bind its store to. Both the real handle classes
	* and any test double satisfy it.
	*/
	/**
	* Creates and owns a popup store on behalf of a Root part. The store is created exactly once, with
	* controlled props and root state synced separately after creation. Sets up the synced floating
	* root context and returns the store.
	*
	* @param createStore Factory that builds the store. Called exactly once, receiving the floating id
	* and whether the popup is nested inside another floating element, both resolved on the first render.
	* @param treatPopupAsFloatingElement Whether the popup element is passed to Floating UI as the
	* floating element instead of the default positioner.
	*/
	function usePopupRootStore(createStore, treatPopupAsFloatingElement = false) {
		const floatingId = useId$1();
		const nested = useFloatingParentNodeId() != null;
		const store = useRefWithInit(() => createStore(floatingId, nested)).current;
		useSyncedFloatingRootContext({
			popupStore: store,
			treatPopupAsFloatingElement,
			floatingRootContext: store.state.floatingRootContext,
			floatingId,
			nested,
			onOpenChange: store.setOpen
		});
		return store;
	}
	/**
	* Attaches a Root's store to a handle for this component's committed lifetime. Popup Roots render
	* it before their interactions and user children so its layout effect runs before descendant layout
	* effects. This lets descendants call the handle during the Root's initial commit without attaching
	* during render, which would leak suspended or abandoned stores. Store subscribers are notified by
	* `attachStore` in this ordinary layout phase, where React permits synchronous updates.
	*
	* Popup Roots must render this component only when a handle is present so handle-less Roots avoid
	* mounting an extra fiber and layout effect.
	*/
	function PopupHandleAttachment({ handle, store }) {
		useIsoLayoutEffect(() => {
			return handle.attachStore(store);
		}, [handle, store]);
		return null;
	}
	function syncTriggerCount(store) {
		const triggerCount = store.context.triggerElements.size;
		if (store.select("open") && store.state.triggerCount !== triggerCount) store.set("triggerCount", triggerCount);
	}
	/**
	* Returns a stable callback ref that registers/unregisters the trigger element in the store.
	*
	* Stable so a downstream ref merger that retains the callback it was first given still reaches the
	* trigger's current store. The registration is tracked as a `(store, id, element)` triple, so
	* unregistering targets the store the element was actually registered in.
	*
	* Since the callback never changes, the caller must re-run it from a layout effect keyed on
	* `[store, id]` to migrate an already-registered element. That effect is also what registers the
	* element in the first place when `id` only resolves after the first commit (React 17's `useId`
	* fallback), because the register call made while the id is still `undefined` does nothing.
	*
	* @param id Id of the trigger.
	* @param store The Store instance where the trigger should be registered.
	*/
	function useTriggerRegistration(id, store) {
		const registrationRef = react.useRef(null);
		return useStableCallback((element) => {
			const registration = registrationRef.current;
			if (registration !== null) {
				if (registration.element === element && registration.store === store && registration.id === id) return;
				registrationRef.current = null;
				const registeredStore = registration.store;
				if (registeredStore.context.triggerElements.getById(registration.id) === registration.element) {
					registeredStore.context.triggerElements.delete(registration.id);
					syncTriggerCount(registeredStore);
				}
			}
			if (element !== null && id !== void 0) {
				registrationRef.current = {
					store,
					id,
					element
				};
				store.context.triggerElements.add(id, element);
				syncTriggerCount(store);
			}
		});
	}
	function createPopupOpenState(state, open, trigger, preventUnmountOnClose = false) {
		let preventUnmountingOnClose = state.preventUnmountingOnClose;
		if (open) preventUnmountingOnClose = false;
		else if (preventUnmountOnClose) preventUnmountingOnClose = true;
		const triggerId = trigger?.id ?? null;
		let activeTriggerId = state.activeTriggerId;
		let activeTriggerElement = state.activeTriggerElement;
		if (triggerId || open) {
			activeTriggerId = triggerId;
			activeTriggerElement = trigger ?? null;
		}
		return {
			open,
			preventUnmountingOnClose,
			activeTriggerId,
			activeTriggerElement,
			openedWithoutTrigger: open ? trigger == null : state.openedWithoutTrigger
		};
	}
	function attachPreventUnmountOnClose(eventDetails) {
		let preventUnmountOnClose = false;
		eventDetails.preventUnmountOnClose = () => {
			preventUnmountOnClose = true;
		};
		return () => preventUnmountOnClose;
	}
	/**
	* Runs the shared open-change sequence for a popup store: notifies `onOpenChange`,
	* honors cancellation, dispatches the floating root change, maps the reason to an
	* `instantType`, and commits the state update (synchronously for hover so
	* `getAnimations()` observes it). Stores supply their own differences via
	* `extraState` (e.g. the last change reason) and `onBeforeDispatch` (e.g. updating
	* inline-rect coordinates).
	*/
	function applyPopupOpenChange(store, nextOpen, eventDetails, options = {}) {
		const reason = eventDetails.reason;
		const isHover = reason === triggerHover;
		const isFocusOpen = nextOpen && reason === "trigger-focus";
		const isDismissClose = !nextOpen && (reason === "trigger-press" || reason === "escape-key");
		const shouldPreventUnmountOnClose = attachPreventUnmountOnClose(eventDetails);
		store.context.onOpenChange?.(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;
		options.onBeforeDispatch?.();
		store.state.floatingRootContext.dispatchOpenChange(nextOpen, eventDetails);
		const changeState = () => {
			const popupOpenState = createPopupOpenState(store.state, nextOpen, eventDetails.trigger, shouldPreventUnmountOnClose());
			const updatedState = {
				...options.extraState,
				...popupOpenState
			};
			if (isFocusOpen) updatedState.instantType = "focus";
			else if (isDismissClose) updatedState.instantType = "dismiss";
			else if (isHover) updatedState.instantType = void 0;
			store.update(updatedState);
		};
		if (isHover) react_dom.flushSync(changeState);
		else changeState();
	}
	/**
	* Sets up trigger data forwarding to the store.
	*
	* @param triggerId Id of the trigger.
	* @param triggerElementRef Ref for the trigger DOM element.
	* @param store The Store instance managing the popup state.
	* @param stateUpdates An object with state updates to apply when the trigger is active.
	*/
	function useTriggerDataForwarding(triggerId, triggerElementRef, store, stateUpdates) {
		const isMountedByThisTrigger = store.useState("isMountedByTrigger", triggerId);
		const baseRegisterTrigger = useTriggerRegistration(triggerId, store);
		const applyTriggerData = useStableCallback((element) => {
			const open = store.select("open");
			const activeTriggerId = store.select("activeTriggerId");
			if (activeTriggerId === triggerId) {
				const changes = {
					activeTriggerElement: element,
					...open ? stateUpdates : null
				};
				store.update(changes);
				return;
			}
			if (activeTriggerId == null && open && !store.state.openedWithoutTrigger) {
				const changes = {
					activeTriggerId: triggerId ?? null,
					activeTriggerElement: element,
					...stateUpdates
				};
				store.update(changes);
			}
		});
		const registerTrigger = useStableCallback((element) => {
			baseRegisterTrigger(element);
			if (element) applyTriggerData(element);
		});
		useIsoLayoutEffect(() => {
			registerTrigger(triggerElementRef.current);
			return () => registerTrigger(null);
		}, [
			registerTrigger,
			triggerElementRef,
			store,
			triggerId
		]);
		useIsoLayoutEffect(() => {
			if (isMountedByThisTrigger) {
				const changes = {
					activeTriggerElement: triggerElementRef.current,
					...stateUpdates
				};
				store.update(changes);
			}
		}, [
			isMountedByThisTrigger,
			store,
			triggerElementRef,
			...Object.values(stateUpdates)
		]);
		return {
			registerTrigger,
			isMountedByThisTrigger
		};
	}
	/**
	* Keeps trigger registration state synchronized while the popup is open.
	*
	* When a popup opens without an explicit trigger id and exactly one trigger is registered, that
	* trigger is claimed as the active trigger, unless the open request deliberately carried no trigger
	* (`openedWithoutTrigger`). When the active trigger id is still registered but its
	* element changed, the active element is refreshed. When the active trigger id is missing from the
	* registry but the same element is still registered under a different id (e.g. the rendered trigger
	* carries its own DOM `id` that differs from Base UI's internal trigger id), the active id is
	* reassociated to the registered id instead of being treated as lost. When the active trigger
	* unregisters, the default path preserves existing ownership so non-closing popup families do not
	* silently claim a different trigger while staying open.
	*
	* If `closeOnActiveTriggerUnmount` is enabled, unregistering a previously resolved active trigger
	* requests a close after a microtask so a same-tick replacement trigger with the same id can
	* register first. An active trigger id that has not matched a registered trigger yet is treated as
	* pending and does not request a close.
	*
	* This should be called on the Root part.
	*
	* @param store The Store instance managing the popup state.
	* @param options Options for active trigger unmount behavior.
	*/
	function useImplicitActiveTrigger(store, options = {}) {
		const { closeOnActiveTriggerUnmount = false } = options;
		const resolvedActiveTriggerIdRef = react.useRef(null);
		const open = store.useState("open");
		const reactiveTriggerCount = store.useState("triggerCount");
		const activeTriggerId = store.useState("activeTriggerId");
		const reactiveActiveTriggerElement = store.useState("activeTriggerElement");
		useIsoLayoutEffect(() => {
			if (!open) {
				resolvedActiveTriggerIdRef.current = null;
				if (store.state.triggerCount !== 0) store.set("triggerCount", 0);
				if (store.state.openedWithoutTrigger) store.set("openedWithoutTrigger", false);
				return;
			}
			const triggerCount = store.context.triggerElements.size;
			const stateUpdates = {};
			if (store.state.triggerCount !== triggerCount) stateUpdates.triggerCount = triggerCount;
			const currentActiveTriggerId = store.select("activeTriggerId");
			let lostActiveTriggerId = null;
			if (currentActiveTriggerId) {
				const activeTriggerElement = store.context.triggerElements.getById(currentActiveTriggerId);
				if (!activeTriggerElement) {
					for (const [triggerId, triggerElement] of store.context.triggerElements.entries()) if (triggerElement === store.state.activeTriggerElement) {
						stateUpdates.activeTriggerId = triggerId;
						stateUpdates.activeTriggerElement = triggerElement;
						resolvedActiveTriggerIdRef.current = triggerId;
						break;
					}
					if (stateUpdates.activeTriggerId === void 0) {
						if (resolvedActiveTriggerIdRef.current === currentActiveTriggerId) lostActiveTriggerId = currentActiveTriggerId;
						else resolvedActiveTriggerIdRef.current = null;
					}
				} else {
					resolvedActiveTriggerIdRef.current = currentActiveTriggerId;
					if (activeTriggerElement !== store.state.activeTriggerElement) stateUpdates.activeTriggerElement = activeTriggerElement;
				}
			} else resolvedActiveTriggerIdRef.current = null;
			if (!lostActiveTriggerId && !currentActiveTriggerId && !store.state.openedWithoutTrigger && triggerCount === 1) {
				const iteratorResult = store.context.triggerElements.entries().next();
				if (!iteratorResult.done) {
					const [implicitTriggerId, implicitTriggerElement] = iteratorResult.value;
					stateUpdates.activeTriggerId = implicitTriggerId;
					stateUpdates.activeTriggerElement = implicitTriggerElement;
					resolvedActiveTriggerIdRef.current = implicitTriggerId;
				}
			}
			if (stateUpdates.triggerCount !== void 0 || stateUpdates.activeTriggerId !== void 0 || stateUpdates.activeTriggerElement !== void 0) store.update(stateUpdates);
			if (lostActiveTriggerId) {
				if (closeOnActiveTriggerUnmount) queueMicrotask(() => {
					if (store.select("open") && store.select("activeTriggerId") === lostActiveTriggerId && !store.context.triggerElements.getById(lostActiveTriggerId)) {
						const eventDetails = createChangeEventDetails(none);
						store.setOpen(false, eventDetails);
						if (!eventDetails.isCanceled) store.update({
							activeTriggerId: null,
							activeTriggerElement: null
						});
					}
				});
			}
		}, [
			open,
			store,
			reactiveTriggerCount,
			activeTriggerId,
			reactiveActiveTriggerElement,
			closeOnActiveTriggerUnmount
		]);
	}
	/**
	* Manages the mounted state of the popup.
	* Sets up the transition status listeners and handles unmounting when needed.
	* Updates the `mounted`, `transitionStatus`, and `preventUnmountingOnClose` states in the store.
	*
	* @param open Whether the popup is open.
	* @param store The Store instance managing the popup state.
	* @param onUnmount Optional callback to be called when the popup is unmounted.
	* @param animateInitialOpen Whether a popup that mounts already open should still play its enter
	*   transition. Defaults to `false`, so content that was open on the first render (a `defaultOpen`
	*   popup on page load, SSR'd markup) appears without animating. Opt in for popups whose subtree
	*   only mounts in response to something the user did, such as a submenu inside a menu popup.
	*
	* @returns A function to forcibly unmount the popup. It is a no-op once the popup is already
	*   unmounted, so calling it after the automatic unmount doesn't repeat the completion callback.
	*/
	function useOpenStateTransitions(open, store, onUnmount, animateInitialOpen) {
		const { mounted, transitionStatus, forceUnmount } = useUnmountAfterClose({
			open,
			ref: store.context.popupRef,
			preventUnmountOnClose: store.useState("preventUnmountingOnClose"),
			setPreventUnmountOnClose: (preventUnmountOnClose) => store.set("preventUnmountingOnClose", preventUnmountOnClose),
			animateInitialOpen,
			onUnmount() {
				store.update({
					activeTriggerId: null,
					activeTriggerElement: null,
					mounted: false,
					preventUnmountingOnClose: false
				});
				onUnmount?.();
				store.context.onOpenChangeComplete?.(false);
			}
		});
		useRefWithInit(() => {
			store.set("mounted", mounted);
			return null;
		});
		store.useSyncedValues({
			mounted,
			transitionStatus
		});
		return {
			forceUnmount,
			transitionStatus
		};
	}
	function usePopupInteractionProps(store, statePart) {
		store.useSyncedValues(statePart);
		useIsoLayoutEffect(() => () => {
			store.update({
				activeTriggerProps: EMPTY_OBJECT$1,
				inactiveTriggerProps: EMPTY_OBJECT$1,
				popupProps: EMPTY_OBJECT$1
			});
		}, [store]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/popups/popupTriggerMap.mjs
/**
	* Development-only reverse index of element to registered id, keyed by the owning map.
	*
	* Registration would otherwise have to scan every entry to detect an element claimed by two ids,
	* making the mount of many triggers sharing one handle quadratic. Kept module-scoped, lazily
	* initialized, and read only from `process.env.NODE_ENV` guards so production builds drop it along
	* with the checks.
	*/
	let devElementIdsByMap;
	function getDevElementIds(map) {
		devElementIdsByMap ??= /* @__PURE__ */ new WeakMap();
		let elementIds = devElementIdsByMap.get(map);
		if (!elementIds) {
			elementIds = /* @__PURE__ */ new WeakMap();
			devElementIdsByMap.set(map, elementIds);
		}
		return elementIds;
	}
	/**
	* Data structure to keep track of popup trigger elements by their IDs.
	*
	* Element lookups iterate the id map rather than maintaining a parallel Set. Registration is O(1),
	* while `hasElement` and `hasMatchingElement` are linear in the number of triggers.
	*/
	var PopupTriggerMap = class {
		idMap = /* @__PURE__ */ new Map();
		/**
		* Adds a trigger element with the given ID.
		*
		* Note: The provided element is assumed to not be registered under multiple IDs.
		*/
		add(id, element) {
			{
				const elementIds = getDevElementIds(this);
				const existingId = elementIds.get(element);
				if (existingId !== void 0 && existingId !== id) throw new Error("Base UI: A trigger element cannot be registered under multiple IDs in PopupTriggerMap.");
				const previousElement = this.idMap.get(id);
				if (previousElement !== void 0 && previousElement !== element) elementIds.delete(previousElement);
				elementIds.set(element, id);
			}
			this.idMap.set(id, element);
		}
		/**
		* Removes the trigger element with the given ID.
		*/
		delete(id) {
			{
				const element = this.idMap.get(id);
				if (element !== void 0) devElementIdsByMap?.get(this)?.delete(element);
			}
			this.idMap.delete(id);
		}
		/**
		* Whether the given element is registered as a trigger.
		*/
		hasElement(element) {
			for (const registered of this.idMap.values()) if (registered === element) return true;
			return false;
		}
		/**
		* Whether there is a registered trigger element matching the given predicate.
		*/
		hasMatchingElement(predicate) {
			for (const element of this.idMap.values()) if (predicate(element)) return true;
			return false;
		}
		/**
		* Returns the trigger element associated with the given ID, or undefined if no such element exists.
		*/
		getById(id) {
			return this.idMap.get(id);
		}
		/**
		* Returns an iterable of all registered trigger entries, where each entry is a tuple of [id, element].
		*/
		entries() {
			return this.idMap.entries();
		}
		/**
		* Returns an iterable of all registered trigger elements.
		*/
		elements() {
			return this.idMap.values();
		}
		/**
		* Returns the number of registered trigger elements.
		*/
		get size() {
			return this.idMap.size;
		}
	};

// \0wp-global:react
	var require__wp_global_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = window.React;
	}));

// node_modules/.store/use-sync-external-store@1.7.0-jHNF5n8408rkWhZ5NHKclA/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
/**
	* @license React
	* use-sync-external-store-shim.development.js
	*
	* Copyright (c) Meta Platforms, Inc. and affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var require_use_sync_external_store_shim_development = /* @__PURE__ */ __commonJSMin(((exports) => {
		(function() {
			function is(x, y) {
				return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
			}
			function useSyncExternalStore$2(subscribe, getSnapshot) {
				didWarnOld18Alpha || void 0 === React.startTransition || (didWarnOld18Alpha = !0, console.error("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."));
				var value = getSnapshot();
				if (!didWarnUncachedGetSnapshot) {
					var cachedValue = getSnapshot();
					objectIs(value, cachedValue) || (console.error("The result of getSnapshot should be cached to avoid an infinite loop"), didWarnUncachedGetSnapshot = !0);
				}
				cachedValue = useState({ inst: {
					value,
					getSnapshot
				} });
				var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
				useLayoutEffect(function() {
					inst.value = value;
					inst.getSnapshot = getSnapshot;
					checkIfSnapshotChanged(inst) && forceUpdate({ inst });
				}, [
					subscribe,
					value,
					getSnapshot
				]);
				useEffect(function() {
					checkIfSnapshotChanged(inst) && forceUpdate({ inst });
					return subscribe(function() {
						checkIfSnapshotChanged(inst) && forceUpdate({ inst });
					});
				}, [subscribe]);
				useDebugValue(value);
				return value;
			}
			function checkIfSnapshotChanged(inst) {
				var latestGetSnapshot = inst.getSnapshot;
				inst = inst.value;
				try {
					var nextValue = latestGetSnapshot();
					return !objectIs(inst, nextValue);
				} catch (error) {
					return !0;
				}
			}
			function useSyncExternalStore$1(subscribe, getSnapshot) {
				return getSnapshot();
			}
			"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
			var React = require__wp_global_react(), objectIs = "function" === typeof Object.is ? Object.is : is, useState = React.useState, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect, useDebugValue = React.useDebugValue, didWarnOld18Alpha = !1, didWarnUncachedGetSnapshot = !1, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
			exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
			"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
		})();
	}));

// node_modules/.store/use-sync-external-store@1.7.0-jHNF5n8408rkWhZ5NHKclA/node_modules/use-sync-external-store/shim/index.js
	var require_shim = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = require_use_sync_external_store_shim_development();
	}));

// node_modules/.store/use-sync-external-store@1.7.0-jHNF5n8408rkWhZ5NHKclA/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js
/**
	* @license React
	* use-sync-external-store-shim/with-selector.development.js
	*
	* Copyright (c) Meta Platforms, Inc. and affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var require_with_selector_development = /* @__PURE__ */ __commonJSMin(((exports) => {
		(function() {
			function is(x, y) {
				return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
			}
			"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
			var React = require__wp_global_react(), shim = require_shim(), objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue = React.useDebugValue;
			exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
				var instRef = useRef(null);
				if (null === instRef.current) {
					var inst = {
						hasValue: !1,
						value: null
					};
					instRef.current = inst;
				} else inst = instRef.current;
				instRef = useMemo(function() {
					function memoizedSelector(nextSnapshot) {
						if (!hasMemo) {
							hasMemo = !0;
							memoizedSnapshot = nextSnapshot;
							nextSnapshot = selector(nextSnapshot);
							if (void 0 !== isEqual && inst.hasValue) {
								var currentSelection = inst.value;
								if (isEqual(currentSelection, nextSnapshot)) return memoizedSelection = currentSelection;
							}
							return memoizedSelection = nextSnapshot;
						}
						currentSelection = memoizedSelection;
						if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
						var nextSelection = selector(nextSnapshot);
						if (void 0 !== isEqual && isEqual(currentSelection, nextSelection)) return memoizedSnapshot = nextSnapshot, currentSelection;
						memoizedSnapshot = nextSnapshot;
						return memoizedSelection = nextSelection;
					}
					var hasMemo = !1, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
					return [function() {
						return memoizedSelector(getSnapshot());
					}, null === maybeGetServerSnapshot ? void 0 : function() {
						return memoizedSelector(maybeGetServerSnapshot());
					}];
				}, [
					getSnapshot,
					getServerSnapshot,
					selector,
					isEqual
				]);
				var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
				useEffect(function() {
					inst.hasValue = !0;
					inst.value = value;
				}, [value]);
				useDebugValue(value);
				return value;
			};
			"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
		})();
	}));

// node_modules/.store/use-sync-external-store@1.7.0-jHNF5n8408rkWhZ5NHKclA/node_modules/use-sync-external-store/shim/with-selector.js
	var require_with_selector = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = require_with_selector_development();
	}));

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/fastHooks.mjs
	const hooks = [];
	let currentInstance = void 0;
	function getInstance() {
		return currentInstance;
	}
	function register$1(hook) {
		hooks.push(hook);
	}
	/**
	* Wraps a component function to enable performance optimizations for internal hooks.
	*
	* **Performance Optimization:**
	* Components wrapped with `fastComponent` have access to a shared "instance" context that enables
	* specialized hook implementations to batch operations and reduce overhead. The wrapper creates a
	* stable instance object that persists across renders, sets it as the current context, calls
	* registered hooks before and after rendering, then clears the context. The primary benefit is
	* with `useStore`, where multiple store subscriptions within the same component are collapsed into
	* a single `useSyncExternalStore` subscription per store, significantly reducing re-render overhead.
	* This optimization is only active on React 19+; on earlier versions `useStore` falls back to a
	* separate subscription per call.
	*
	* **Requirements:**
	* - The component function should follow standard React component patterns
	* - `useStore` calls must keep a stable order and count across renders, as batched hooks are
	*   matched by call index
	* - Do not rely on the instance context outside of specialized hooks
	*
	* @param fn - The component function to wrap
	* @returns A wrapped component with the same signature as the input function
	*
	* @example
	* ```tsx
	* // Wrapping a component to enable optimized useStore batching
	* export const TooltipRoot = fastComponent(function TooltipRoot(props) {
	*   // These useStore calls share a single subscription
	*   const open = useStore(store, (state) => state.open);
	*   const disabled = useStore(store, (state) => state.disabled);
	*   const value = useStore(store, (state) => state.value);
	*   // ...
	* });
	* ```
	*/
	function fastComponent(fn) {
		const FastComponent = (props, forwardedRef) => {
			const instance = useRefWithInit(createInstance).current;
			let result;
			try {
				currentInstance = instance;
				for (const hook of hooks) hook.before(instance);
				result = fn(props, forwardedRef);
				for (const hook of hooks) hook.after(instance);
				instance.didInitialize = true;
			} finally {
				currentInstance = void 0;
			}
			return result;
		};
		FastComponent.displayName = fn.displayName || fn.name;
		return FastComponent;
	}
	/**
	* Wraps a component function with ref forwarding to enable performance optimizations for internal hooks.
	*
	* This is a convenience wrapper that combines `fastComponent` with `React.forwardRef`, enabling
	* both performance optimizations and proper ref forwarding. See `fastComponent` for details on
	* the performance benefits.
	*
	* @param fn - The component function that accepts props and a forwarded ref
	* @returns A wrapped component with ref forwarding enabled
	*
	* @example
	* ```tsx
	* // Wrapping a component with ref forwarding and optimized hooks
	* export const TooltipTrigger = fastComponentRef(function TooltipTrigger(
	*   props,
	*   forwardedRef
	* ) {
	*   const store = useContext(TooltipContext);
	*   const open = useStore(store, (state) => state.open);
	*   // ... component logic with ref
	*   return <button ref={forwardedRef} {...props} />;
	* });
	* ```
	*/
	function fastComponentRef(fn) {
		return /*#__PURE__*/ react.forwardRef(fastComponent(fn));
	}
	function createInstance() {
		return { didInitialize: false };
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/store/useStore.mjs
	var import_shim = require_shim();
	var import_with_selector = require_with_selector();
	const useStoreImplementation = isReactVersionAtLeast(19) ? useStoreFast : useStoreLegacy;
	function useStore(store, selector, a1, a2, a3) {
		return useStoreImplementation(store, selector, a1, a2, a3);
	}
	function useStoreR19(store, selector, a1, a2, a3) {
		const getSelection = react.useCallback(() => selector(store.getSnapshot(), a1, a2, a3), [
			store,
			selector,
			a1,
			a2,
			a3
		]);
		return (0, import_shim.useSyncExternalStore)(store.subscribe, getSelection, getSelection);
	}
	register$1({
		before(instance) {
			instance.syncIndex = 0;
			if (!instance.didInitialize) {
				instance.syncTick = 1;
				instance.syncHooks = [];
				instance.didChangeStore = true;
				instance.getSnapshot = () => {
					let didChange = false;
					for (let i = 0; i < instance.syncHooks.length; i += 1) {
						const hook = instance.syncHooks[i];
						const value = hook.selector(hook.store.state, hook.a1, hook.a2, hook.a3);
						if (!Object.is(hook.value, value)) {
							didChange = true;
							hook.value = value;
						}
					}
					if (didChange) instance.syncTick += 1;
					return instance.syncTick;
				};
			}
		},
		after(instance) {
			if (instance.syncHooks.length > 0) {
				if (instance.didChangeStore) {
					instance.didChangeStore = false;
					instance.subscribe = (onStoreChange) => {
						const stores = /* @__PURE__ */ new Set();
						for (const hook of instance.syncHooks) stores.add(hook.store);
						const unsubscribes = [];
						for (const store of stores) unsubscribes.push(store.subscribe(onStoreChange));
						return () => {
							for (const unsubscribe of unsubscribes) unsubscribe();
						};
					};
				}
				(0, import_shim.useSyncExternalStore)(instance.subscribe, instance.getSnapshot, instance.getSnapshot);
			}
		}
	});
	function useStoreFast(store, selector, a1, a2, a3) {
		const instance = getInstance();
		if (!instance) return useStoreR19(store, selector, a1, a2, a3);
		const index = instance.syncIndex;
		instance.syncIndex += 1;
		let hook;
		if (!instance.didInitialize) {
			hook = {
				store,
				selector,
				a1,
				a2,
				a3,
				value: selector(store.getSnapshot(), a1, a2, a3)
			};
			instance.syncHooks.push(hook);
		} else {
			hook = instance.syncHooks[index];
			if (hook.store !== store || hook.selector !== selector || !Object.is(hook.a1, a1) || !Object.is(hook.a2, a2) || !Object.is(hook.a3, a3)) {
				if (hook.store !== store) instance.didChangeStore = true;
				hook.store = store;
				hook.selector = selector;
				hook.a1 = a1;
				hook.a2 = a2;
				hook.a3 = a3;
				hook.value = selector(store.getSnapshot(), a1, a2, a3);
			}
		}
		return hook.value;
	}
	function useStoreLegacy(store, selector, a1, a2, a3) {
		return (0, import_with_selector.useSyncExternalStoreWithSelector)(store.subscribe, store.getSnapshot, store.getSnapshot, (state) => selector(state, a1, a2, a3));
	}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/store/Store.mjs
/**
	* A data store implementation that allows subscribing to state changes and updating the state.
	* It uses an observer pattern to notify subscribers when the state changes.
	*/
	var Store = class {
		/**
		* Creates a store with the given initial state, constructing the class it is called on.
		* Calling it on a generic base class (e.g. `ReactStore.create(...)`) constructs that
		* class but degrades the inferred instance type to `Store`; use `new` there instead.
		*/
		static create(state) {
			return new this(state);
		}
		/**
		* The current state of the store.
		* This property is updated immediately when the state changes as a result of calling {@link setState}, {@link update}, or {@link set}.
		* To subscribe to state changes, use the {@link useState} method. The value returned by {@link useState} is updated after the component renders (similarly to React's useState).
		* The values can be used directly (to avoid subscribing to the store) in effects or event handlers.
		*
		* Do not modify properties in state directly. Instead, use the provided methods to ensure proper state management and listener notification.
		*/
		constructor(state) {
			this.state = state;
			this.listeners = /* @__PURE__ */ new Set();
			this.updateTick = 0;
		}
		/**
		* Registers a listener that will be called whenever the store's state changes.
		*
		* @param fn The listener function to be called on state changes.
		* @returns A function to unsubscribe the listener.
		*/
		subscribe = (fn) => {
			this.listeners.add(fn);
			return () => {
				this.listeners.delete(fn);
			};
		};
		/**
		* Returns the current state of the store.
		*/
		getSnapshot = () => {
			return this.state;
		};
		/**
		* Updates the entire store's state and notifies all registered listeners.
		*
		* @param newState The new state to set for the store.
		*/
		setState(newState) {
			if (this.state === newState) return;
			this.state = newState;
			this.updateTick += 1;
			const currentTick = this.updateTick;
			for (const listener of this.listeners) {
				if (currentTick !== this.updateTick) return;
				listener(newState);
			}
		}
		/**
		* Merges the provided changes into the current state and notifies listeners if there are changes.
		* Each value must match its state key. Pass an exact known subset rather than a broad
		* `Partial<State>`, which may contain `undefined` for required state fields.
		*
		* @param changes An object containing the changes to apply to the current state.
		*/
		update(changes) {
			for (const key in changes) if (!Object.is(this.state[key], changes[key])) {
				this.setState({
					...this.state,
					...changes
				});
				return;
			}
		}
		/**
		* Sets a specific key in the store's state to a new value and notifies listeners if the value has changed.
		*
		* @param key The key in the store's state to update.
		* @param value The new value to set for the specified key.
		*/
		set(key, value) {
			if (!Object.is(this.state[key], value)) this.setState({
				...this.state,
				[key]: value
			});
		}
		/**
		* Gives the state a new reference and updates all registered listeners.
		*/
		notifyAll() {
			const newState = { ...this.state };
			this.setState(newState);
		}
		use(selector, a1, a2, a3) {
			return useStore(this, selector, a1, a2, a3);
		}
	};

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/store/ReactStore.mjs
/**
	* A Store that supports controlled state keys, non-reactive values and provides utility methods for React.
	*/
	var ReactStore = class extends Store {
		/**
		* Creates a new ReactStore instance.
		*
		* @param state Initial state of the store.
		* @param context Non-reactive context values.
		* @param selectors Optional selectors for use with `useState`.
		*/
		constructor(state, context = {}, selectors) {
			super(state);
			this.context = context;
			this.selectors = selectors;
		}
		/**
		* Non-reactive values such as refs, callbacks, etc.
		*/
		/**
		* Synchronizes a single external value into the store.
		*
		* Note that the while the value in `state` is updated immediately, the value returned
		* by `useState` is updated before the next render (similarly to React's `useState`).
		*/
		useSyncedValue(key, value) {
			react.useDebugValue(key);
			const store = this;
			useIsoLayoutEffect(() => {
				if (store.state[key] !== value) store.set(key, value);
			}, [
				store,
				key,
				value
			]);
		}
		/**
		* Synchronizes a single external value into the store and
		* cleans it up (sets to `undefined`) on unmount.
		*
		* Note that the while the value in `state` is updated immediately, the value returned
		* by `useState` is updated before the next render (similarly to React's `useState`).
		*/
		useSyncedValueWithCleanup(key, value) {
			const store = this;
			useIsoLayoutEffect(() => {
				if (store.state[key] !== value) store.set(key, value);
				return () => {
					store.set(key, void 0);
				};
			}, [
				store,
				key,
				value
			]);
		}
		/**
		* Synchronizes multiple external values into the store.
		* Each value must match its state key. Pass an exact known subset rather than a broad
		* `Partial<State>`, which may contain `undefined` for required state fields.
		*
		* Note that the while the values in `state` are updated immediately, the values returned
		* by `useState` are updated before the next render (similarly to React's `useState`).
		*
		* @param statePart An exact subset of state fields to synchronize. Unknown keys are not accepted.
		*/
		useSyncedValues(statePart) {
			const store = this;
			{
				react.useDebugValue(statePart, (p) => Object.keys(p));
				const keys = react.useRef(Object.keys(statePart)).current;
				const nextKeys = Object.keys(statePart);
				if (keys.length !== nextKeys.length || keys.some((key, index) => key !== nextKeys[index])) console.error("ReactStore.useSyncedValues expects the same prop keys on every render. Keys should be stable.");
			}
			const dependencies = Object.values(statePart);
			useIsoLayoutEffect(() => {
				store.update(statePart);
			}, [store, ...dependencies]);
		}
		/**
		* Registers a controllable prop pair (`controlled`, `defaultValue`) for a specific key. If `controlled`
		* is non-undefined, the store's state at `key` is updated to match `controlled`.
		*/
		useControlledProp(key, controlled) {
			react.useDebugValue(key);
			const store = this;
			const isControlled = controlled !== void 0;
			useIsoLayoutEffect(() => {
				if (isControlled && !Object.is(store.state[key], controlled)) store.setState({
					...store.state,
					[key]: controlled
				});
			}, [
				store,
				key,
				controlled,
				isControlled
			]);
			{
				const cache = this.controlledValues ??= /* @__PURE__ */ new Map();
				if (!cache.has(key)) cache.set(key, isControlled);
				const previouslyControlled = cache.get(key);
				if (previouslyControlled !== void 0 && previouslyControlled !== isControlled) console.error(`A component is changing the ${previouslyControlled ? "" : "un"}controlled state of ${key.toString()} to be ${previouslyControlled ? "un" : ""}controlled. Elements should not switch from uncontrolled to controlled (or vice versa).`);
			}
		}
		/** Gets the current value from the store using a selector with the provided key.
		*
		* @param key Key of the selector to use.
		*/
		select(key, a1, a2, a3) {
			const selector = this.selectors[key];
			return selector(this.state, a1, a2, a3);
		}
		/**
		* Returns a value from the store's state using a selector function.
		* Used to subscribe to specific parts of the state.
		* This methods causes a rerender whenever the selected state changes.
		*
		* @param key Key of the selector to use.
		*/
		useState(key, a1, a2, a3) {
			react.useDebugValue(key);
			return useStore(this, this.selectors[key], a1, a2, a3);
		}
		/**
		* Wraps a function with `useStableCallback` to ensure it has a stable reference
		* and assigns it to the context.
		*
		* @param key Key of the event callback. Must be a function in the context.
		* @param fn Function to assign.
		*/
		useContextCallback(key, fn) {
			react.useDebugValue(key);
			const stableFunction = useStableCallback(fn ?? NOOP);
			this.context[key] = stableFunction;
		}
		/**
		* Returns a stable setter function for a specific key in the store's state.
		* It's commonly used to pass as a ref callback to React elements.
		*
		* @param key Key of the state to set.
		*/
		useStateSetter(key) {
			const ref = react.useRef(void 0);
			if (ref.current === void 0) ref.current = (value) => {
				this.set(key, value);
			};
			return ref.current;
		}
		/**
		* Observes changes derived from the store's selectors and calls the listener when the selected value changes.
		*
		* @param key Key of the selector to observe.
		* @param listener Listener function called when the selector result changes.
		*/
		observe(selector, listener) {
			let selectFn;
			if (typeof selector === "function") selectFn = selector;
			else selectFn = this.selectors[selector];
			let prevValue = selectFn(this.state);
			listener(prevValue, prevValue, this);
			return this.subscribe((nextState) => {
				const nextValue = selectFn(nextState);
				if (!Object.is(prevValue, nextValue)) {
					const oldValue = prevValue;
					prevValue = nextValue;
					listener(nextValue, oldValue, this);
				}
			});
		}
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/components/FloatingRootStore.mjs
	const selectors$1 = {
		open: (state) => state.open,
		transitionStatus: (state) => state.transitionStatus,
		domReferenceElement: (state) => state.domReferenceElement,
		referenceElement: (state) => state.positionReference ?? state.referenceElement,
		floatingElement: (state) => state.floatingElement,
		floatingId: (state) => state.floatingId
	};
	var FloatingRootStore = class extends ReactStore {
		constructor(options) {
			const { syncOnly, nested, onOpenChange, triggerElements, ...initialState } = options;
			super({
				...initialState,
				positionReference: initialState.referenceElement,
				domReferenceElement: initialState.referenceElement
			}, {
				onOpenChange,
				dataRef: { current: {} },
				events: createEventEmitter(),
				nested,
				triggerElements
			}, selectors$1);
			this.syncOnly = syncOnly;
		}
		/**
		* Syncs the event used by hover logic to distinguish hover-open from click-like interaction.
		*/
		syncOpenEvent = (newOpen, event) => {
			if (!newOpen || !this.state.open || event != null && isClickLikeEvent(event)) this.context.dataRef.current.openEvent = newOpen ? event : void 0;
		};
		/**
		* Runs the root-owned side effects for an open state change.
		*/
		dispatchOpenChange = (newOpen, eventDetails) => {
			this.syncOpenEvent(newOpen, eventDetails.event);
			const details = {
				open: newOpen,
				reason: eventDetails.reason,
				nativeEvent: eventDetails.event,
				nested: this.context.nested,
				triggerElement: eventDetails.trigger
			};
			this.context.events.emit("openchange", details);
		};
		/**
		* Emits the `openchange` event through the internal event emitter and calls the `onOpenChange` handler with the provided arguments.
		*
		* @param newOpen The new open state.
		* @param eventDetails Details about the event that triggered the open state change.
		*/
		setOpen = (newOpen, eventDetails) => {
			if (this.syncOnly) {
				this.context.onOpenChange?.(newOpen, eventDetails);
				return;
			}
			this.dispatchOpenChange(newOpen, eventDetails);
			this.context.onOpenChange?.(newOpen, eventDetails);
		};
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/popups/store.mjs
/**
	* State common to all popup stores.
	*/
	function createInitialPopupStoreState(triggerElements, floatingId, nested = false) {
		return {
			open: false,
			openProp: void 0,
			mounted: false,
			transitionStatus: void 0,
			floatingRootContext: new FloatingRootStore({
				open: false,
				transitionStatus: void 0,
				floatingElement: null,
				referenceElement: null,
				triggerElements,
				floatingId,
				syncOnly: true,
				nested,
				onOpenChange: void 0
			}),
			floatingId,
			triggerCount: 0,
			preventUnmountingOnClose: false,
			payload: void 0,
			activeTriggerId: null,
			activeTriggerElement: null,
			openedWithoutTrigger: false,
			triggerIdProp: void 0,
			popupElement: null,
			positionerElement: null,
			activeTriggerProps: EMPTY_OBJECT$1,
			inactiveTriggerProps: EMPTY_OBJECT$1,
			popupProps: EMPTY_OBJECT$1
		};
	}
	const activeTriggerIdSelector = (state) => state.triggerIdProp ?? state.activeTriggerId;
	const openSelector = (state) => state.openProp ?? state.open;
	const popupIdSelector = (state) => {
		return (state.popupElement?.id ?? state.floatingId) || void 0;
	};
	function triggerOwnsOpenPopup(state, triggerId) {
		return triggerId !== void 0 && openSelector(state) && activeTriggerIdSelector(state) === triggerId;
	}
	function triggerOwnsOpenPopupOrIsOnlyTrigger(state, triggerId) {
		if (triggerOwnsOpenPopup(state, triggerId)) return true;
		return triggerId !== void 0 && openSelector(state) && activeTriggerIdSelector(state) == null && !state.openedWithoutTrigger && state.triggerCount === 1;
	}
	const popupStoreSelectors = {
		open: openSelector,
		mounted: (state) => state.mounted,
		transitionStatus: (state) => openSelector(state) && !state.mounted ? "starting" : state.transitionStatus,
		floatingRootContext: (state) => state.floatingRootContext,
		triggerCount: (state) => state.triggerCount,
		preventUnmountingOnClose: (state) => state.preventUnmountingOnClose,
		payload: (state) => state.payload,
		activeTriggerId: activeTriggerIdSelector,
		activeTriggerElement: (state) => state.mounted ? state.activeTriggerElement : null,
		popupId: popupIdSelector,
		/**
		* Whether the trigger with the given ID was used to open the popup.
		*/
		isTriggerActive: (state, triggerId) => triggerId !== void 0 && activeTriggerIdSelector(state) === triggerId,
		/**
		* Whether the popup is open and was activated by a trigger with the given ID.
		*/
		isOpenedByTrigger: (state, triggerId) => triggerOwnsOpenPopup(state, triggerId),
		/**
		* Whether the popup is mounted and was activated by a trigger with the given ID.
		*/
		isMountedByTrigger: (state, triggerId) => triggerId !== void 0 && activeTriggerIdSelector(state) === triggerId && state.mounted,
		triggerProps: (state, isActive) => isActive ? state.activeTriggerProps : state.inactiveTriggerProps,
		/**
		* Popup id for the trigger that currently owns the open popup.
		*/
		triggerPopupId: (state, triggerId) => triggerOwnsOpenPopupOrIsOnlyTrigger(state, triggerId) ? popupIdSelector(state) : void 0,
		popupProps: (state) => state.popupProps,
		popupElement: (state) => state.popupElement,
		positionerElement: (state) => state.positionerElement
	};
	/**
	* Store members a detached handle-backed trigger reads or invokes for trigger registration and data
	* forwarding. `set`/`update` are included only for trigger-count and trigger-data bookkeeping; on a
	* detached (inert) store they are intentionally no-ops, so a write through them is not guaranteed to
	* be durable. Component handle-store views Pick these from their concrete store (preserving its
	* context and selectors) and add any component-specific trigger-invoked members such as `setOpen`.
	*/
	/**
	* The subset of a popup store that trigger registration and data forwarding rely on. Narrow enough
	* that an inert store can be passed while detached.
	*/
// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/popups/usePopupHandleStore.mjs
/**
	* Reads the store currently exposed by a popup handle and subscribes to store-pointer changes.
	* Detached triggers use this to follow a handle as a root attaches or detaches: while no root is
	* attached, the handle exposes its fallback store; once a root attaches, subscribers re-render and
	* read from the live root store.
	*
	* Returns `undefined` when no handle is provided so callers can fall back to their root context.
	*
	* @param handle The popup handle to read from, or `undefined` when the trigger is not handle-bound.
	*/
	function usePopupHandleStore(handle) {
		const subscribe = react.useCallback((listener) => {
			if (handle === void 0) return NOOP;
			return handle.subscribeStore(listener);
		}, [handle]);
		const getSnapshot = react.useCallback(() => {
			return handle === void 0 ? void 0 : handle.store;
		}, [handle]);
		return (0, import_shim.useSyncExternalStore)(subscribe, getSnapshot, () => handle?.serverStore);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useFocus.mjs
	const isMacSafari = mac && webkit;
	/**
	* Opens the floating element while the reference element has focus, like CSS
	* `:focus`.
	* @see https://floating-ui.com/docs/useFocus
	*/
	function useFocus(store, props = {}) {
		const { enabled = true, delay } = props;
		const { events, dataRef } = store.context;
		const blockFocusRef = react.useRef(false);
		const blockedReferenceRef = react.useRef(null);
		const keyboardModalityRef = react.useRef(true);
		const timeout = useTimeout();
		react.useEffect(() => {
			const domReference = store.select("domReferenceElement");
			if (!enabled) return;
			const win = getWindow(domReference);
			function onBlur() {
				const currentDomReference = store.select("domReferenceElement");
				if (!store.select("open") && isHTMLElement(currentDomReference) && currentDomReference === activeElement(ownerDocument(currentDomReference))) {
					blockFocusRef.current = true;
					blockedReferenceRef.current = currentDomReference;
				}
			}
			function onKeyDown() {
				keyboardModalityRef.current = true;
			}
			function onPointerDown() {
				keyboardModalityRef.current = false;
			}
			return mergeCleanups(addEventListener(win, "blur", onBlur), isMacSafari && addEventListener(win, "keydown", onKeyDown, true), isMacSafari && addEventListener(win, "pointerdown", onPointerDown, true));
		}, [store, enabled]);
		react.useEffect(() => {
			if (!enabled) return;
			function onOpenChangeLocal(details) {
				if (details.reason === "trigger-press" || details.reason === "escape-key") {
					const referenceElement = store.select("domReferenceElement");
					if (isElement(referenceElement)) {
						blockedReferenceRef.current = referenceElement;
						blockFocusRef.current = true;
					}
				}
			}
			events.on("openchange", onOpenChangeLocal);
			return () => {
				events.off("openchange", onOpenChangeLocal);
			};
		}, [
			events,
			enabled,
			store
		]);
		const reference = react.useMemo(() => {
			function resetBlockedFocus() {
				blockFocusRef.current = false;
				blockedReferenceRef.current = null;
			}
			return {
				onMouseLeave() {
					resetBlockedFocus();
				},
				onFocus(event) {
					const focusTarget = event.currentTarget;
					if (blockFocusRef.current) {
						if (blockedReferenceRef.current === focusTarget) return;
						resetBlockedFocus();
					}
					const target = getTarget(event.nativeEvent);
					if (isElement(target)) {
						if (isMacSafari && !event.relatedTarget) {
							if (!keyboardModalityRef.current && !isTypeableElement(target)) return;
						} else if (!matchesFocusVisible(target)) return;
					}
					const movedFromOtherEnabledTrigger = isTargetInsideEnabledTrigger(event.relatedTarget, store.context.triggerElements);
					const { nativeEvent, currentTarget } = event;
					if (store.select("open") && movedFromOtherEnabledTrigger || !delay) {
						store.setOpen(true, createChangeEventDetails(triggerFocus, nativeEvent, currentTarget));
						return;
					}
					timeout.start(delay, () => {
						if (blockFocusRef.current) return;
						store.setOpen(true, createChangeEventDetails(triggerFocus, nativeEvent, currentTarget));
					});
				},
				onBlur(event) {
					resetBlockedFocus();
					const relatedTarget = event.relatedTarget;
					const nativeEvent = event.nativeEvent;
					const movedToFocusGuard = isElement(relatedTarget) && relatedTarget.hasAttribute(createAttribute("focus-guard")) && relatedTarget.getAttribute("data-type") === "outside";
					timeout.start(0, () => {
						const domReference = store.select("domReferenceElement");
						const activeEl = activeElement(ownerDocument(domReference));
						if (!relatedTarget && activeEl === domReference) return;
						if (contains(dataRef.current.floatingContext?.refs.floating.current, activeEl) || contains(domReference, activeEl) || movedToFocusGuard) return;
						if (isTargetInsideEnabledTrigger(relatedTarget ?? activeEl, store.context.triggerElements)) return;
						store.setOpen(false, createChangeEventDetails(triggerFocus, nativeEvent));
					});
				}
			};
		}, [
			dataRef,
			delay,
			store,
			timeout
		]);
		return react.useMemo(() => enabled ? {
			reference,
			trigger: reference
		} : {}, [enabled, reference]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useHoverInteractionSharedState.mjs
	var HoverInteraction = class HoverInteraction {
		pointerType = void 0;
		interactedInside = false;
		handler = void 0;
		blockMouseMove = true;
		performedPointerEventsMutation = false;
		pointerEventsScopeElement = null;
		pointerEventsReferenceElement = null;
		pointerEventsFloatingElement = null;
		restTimeoutPending = false;
		openChangeTimeout = new Timeout();
		restTimeout = new Timeout();
		handleCloseOptions = void 0;
		static create() {
			return new HoverInteraction();
		}
		dispose = () => {
			this.openChangeTimeout.clear();
			this.restTimeout.clear();
		};
		disposeEffect = () => {
			return this.dispose;
		};
	};
	const pointerEventsMutationOwnerByScopeElement = /* @__PURE__ */ new WeakMap();
	function clearSafePolygonPointerEventsMutation(instance) {
		if (!instance.performedPointerEventsMutation) return;
		const scopeElement = instance.pointerEventsScopeElement;
		if (scopeElement && pointerEventsMutationOwnerByScopeElement.get(scopeElement) === instance) {
			instance.pointerEventsScopeElement?.style.removeProperty("pointer-events");
			instance.pointerEventsReferenceElement?.style.removeProperty("pointer-events");
			instance.pointerEventsFloatingElement?.style.removeProperty("pointer-events");
			pointerEventsMutationOwnerByScopeElement.delete(scopeElement);
		}
		instance.performedPointerEventsMutation = false;
		instance.pointerEventsScopeElement = null;
		instance.pointerEventsReferenceElement = null;
		instance.pointerEventsFloatingElement = null;
	}
	function applySafePolygonPointerEventsMutation(instance, options) {
		const { scopeElement, referenceElement, floatingElement } = options;
		const existingOwner = pointerEventsMutationOwnerByScopeElement.get(scopeElement);
		if (existingOwner && existingOwner !== instance) clearSafePolygonPointerEventsMutation(existingOwner);
		clearSafePolygonPointerEventsMutation(instance);
		instance.performedPointerEventsMutation = true;
		instance.pointerEventsScopeElement = scopeElement;
		instance.pointerEventsReferenceElement = referenceElement;
		instance.pointerEventsFloatingElement = floatingElement;
		pointerEventsMutationOwnerByScopeElement.set(scopeElement, instance);
		scopeElement.style.pointerEvents = "none";
		referenceElement.style.pointerEvents = "auto";
		floatingElement.style.pointerEvents = "auto";
	}
	function useHoverInteractionSharedState(store) {
		const data = store.context.dataRef.current;
		const instance = useRefWithInit(() => data.hoverInteractionState ?? HoverInteraction.create()).current;
		if (!data.hoverInteractionState) data.hoverInteractionState = instance;
		useOnMount(data.hoverInteractionState.disposeEffect);
		return data.hoverInteractionState;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useHoverFloatingInteraction.mjs
/**
	* Provides hover interactions that should be attached to the floating element.
	*/
	function useHoverFloatingInteraction(store, parameters = {}) {
		const { enabled = true, closeDelay: closeDelayProp = 0, nodeId: nodeIdProp } = parameters;
		const open = store.useState("open");
		const floatingElement = store.useState("floatingElement");
		const domReferenceElement = store.useState("domReferenceElement");
		const { dataRef } = store.context;
		const tree = useFloatingTree();
		const parentId = useFloatingParentNodeId();
		const instance = useHoverInteractionSharedState(store);
		const childClosedTimeout = useTimeout();
		const isClickLikeOpenEvent$2 = useStableCallback(() => {
			return isClickLikeOpenEvent(dataRef.current.openEvent?.type, instance.interactedInside);
		});
		const isHoverOpen = useStableCallback(() => {
			return isHoverOpenEvent(dataRef.current.openEvent?.type);
		});
		const clearPointerEvents = useStableCallback(() => {
			clearSafePolygonPointerEventsMutation(instance);
		});
		useIsoLayoutEffect(() => {
			if (!open) {
				instance.pointerType = void 0;
				instance.restTimeoutPending = false;
				instance.interactedInside = false;
				clearPointerEvents();
			}
		}, [
			open,
			instance,
			clearPointerEvents
		]);
		react.useEffect(() => {
			return clearPointerEvents;
		}, [clearPointerEvents]);
		useIsoLayoutEffect(() => {
			if (!enabled) return;
			if (open && instance.handleCloseOptions?.blockPointerEvents && isHoverOpen() && isElement(domReferenceElement) && floatingElement) {
				const ref = domReferenceElement;
				const floatingEl = floatingElement;
				const doc = ownerDocument(floatingElement);
				const parentFloating = tree?.nodesRef.current.find((node) => node.id === parentId)?.context?.elements.floating;
				if (parentFloating) parentFloating.style.pointerEvents = "";
				const cachedScopeElement = instance.pointerEventsScopeElement !== floatingEl ? instance.pointerEventsScopeElement : null;
				const parentScopeElement = parentFloating !== floatingEl ? parentFloating : null;
				const scopeElement = instance.handleCloseOptions?.getScope?.() ?? cachedScopeElement ?? parentScopeElement ?? closest(ref, "[data-rootownerid]") ?? doc.body;
				applySafePolygonPointerEventsMutation(instance, {
					scopeElement,
					referenceElement: ref,
					floatingElement: floatingEl
				});
				return () => {
					clearPointerEvents();
				};
			}
		}, [
			enabled,
			open,
			domReferenceElement,
			floatingElement,
			instance,
			isHoverOpen,
			tree,
			parentId,
			clearPointerEvents
		]);
		react.useEffect(() => {
			if (!enabled) return;
			function hasParentChildren() {
				return !!(tree && parentId && getNodeChildren(tree.nodesRef.current, parentId).length > 0);
			}
			function closeWithDelay(event) {
				const closeDelay = getDelay(closeDelayProp, "close", instance.pointerType);
				const close = () => {
					store.setOpen(false, createChangeEventDetails(triggerHover, event));
					tree?.events.emit("floating.closed", event);
				};
				if (closeDelay) instance.openChangeTimeout.start(closeDelay, close);
				else {
					instance.openChangeTimeout.clear();
					close();
				}
			}
			function handleInteractInside(event) {
				const target = getTarget(event);
				if (!isInteractiveElement(target)) {
					instance.interactedInside = false;
					return;
				}
				instance.interactedInside = closest(target, "[aria-haspopup]") != null;
			}
			function onFloatingMouseEnter() {
				instance.openChangeTimeout.clear();
				childClosedTimeout.clear();
				tree?.events.off("floating.closed", onNodeClosed);
				clearPointerEvents();
			}
			function onFloatingMouseLeave(event) {
				if (hasParentChildren() && tree) {
					tree.events.on("floating.closed", onNodeClosed);
					return;
				}
				if (isTargetInsideEnabledTrigger(event.relatedTarget, store.context.triggerElements)) return;
				const currentNodeId = dataRef.current.floatingContext?.nodeId ?? nodeIdProp;
				const relatedTarget = event.relatedTarget;
				if (tree && currentNodeId && isElement(relatedTarget) && getNodeChildren(tree.nodesRef.current, currentNodeId, false).some((node) => contains(node.context?.elements.floating, relatedTarget))) return;
				if (instance.handler) {
					instance.handler(event);
					return;
				}
				clearPointerEvents();
				if (isHoverOpen() && !isClickLikeOpenEvent$2()) closeWithDelay(event);
			}
			function onNodeClosed(event) {
				if (!tree || !parentId || hasParentChildren()) return;
				childClosedTimeout.start(0, () => {
					tree.events.off("floating.closed", onNodeClosed);
					store.setOpen(false, createChangeEventDetails(triggerHover, event));
					tree.events.emit("floating.closed", event);
				});
			}
			const floating = floatingElement;
			return mergeCleanups(floating && addEventListener(floating, "mouseenter", onFloatingMouseEnter), floating && addEventListener(floating, "mouseleave", onFloatingMouseLeave), floating && addEventListener(floating, "pointerdown", handleInteractInside, true), () => {
				tree?.events.off("floating.closed", onNodeClosed);
			});
		}, [
			enabled,
			floatingElement,
			store,
			dataRef,
			closeDelayProp,
			nodeIdProp,
			isHoverOpen,
			isClickLikeOpenEvent$2,
			clearPointerEvents,
			instance,
			tree,
			parentId,
			childClosedTimeout
		]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useHoverReferenceInteraction.mjs
	const EMPTY_REF = { current: null };
	/**
	* Provides hover interactions that should be attached to reference or trigger
	* elements.
	*/
	function useHoverReferenceInteraction(store, props = {}) {
		const { enabled = true, delay = 0, handleClose = null, mouseOnly = false, restMs = 0, move = true, triggerElementRef = EMPTY_REF, externalTree, isActiveTrigger = true, getHandleCloseContext, isClosing, shouldOpen: shouldOpenProp, guardStaleOpen = false } = props;
		const { dataRef, events } = store.context;
		const tree = useFloatingTree(externalTree);
		const instance = useHoverInteractionSharedState(store);
		const isHoverCloseActiveRef = react.useRef(false);
		const handleCloseRef = useValueAsRef(handleClose);
		const delayRef = useValueAsRef(delay);
		const restMsRef = useValueAsRef(restMs);
		const enabledRef = useValueAsRef(enabled);
		const shouldOpenRef = useValueAsRef(shouldOpenProp);
		const isClosingRef = useValueAsRef(isClosing);
		const isClickLikeOpenEvent$1 = useStableCallback(() => {
			return isClickLikeOpenEvent(dataRef.current.openEvent?.type, instance.interactedInside);
		});
		const checkShouldOpen = useStableCallback(() => {
			return shouldOpenRef.current?.() !== false;
		});
		const isOverInactiveTrigger = useStableCallback((currentDomReference, currentTarget, target) => {
			const allTriggers = store.context.triggerElements;
			if (allTriggers.hasElement(currentTarget)) return !currentDomReference || !contains(currentDomReference, currentTarget);
			if (!isElement(target)) return false;
			const targetElement = target;
			return allTriggers.hasMatchingElement((trigger) => contains(trigger, targetElement)) && (!currentDomReference || !contains(currentDomReference, targetElement));
		});
		const cleanupMouseMoveHandler = useStableCallback(() => {
			if (!instance.handler) return;
			ownerDocument(store.select("domReferenceElement")).removeEventListener("mousemove", instance.handler);
			instance.handler = void 0;
		});
		const clearPointerEvents = useStableCallback(() => {
			clearSafePolygonPointerEventsMutation(instance);
		});
		if (isActiveTrigger) instance.handleCloseOptions = handleClose?.__options;
		react.useEffect(() => cleanupMouseMoveHandler, [cleanupMouseMoveHandler]);
		react.useEffect(() => {
			if (!enabled) return;
			function onOpenChangeLocal(details) {
				if (!details.open) {
					isHoverCloseActiveRef.current = details.reason === triggerHover;
					cleanupMouseMoveHandler();
					instance.openChangeTimeout.clear();
					instance.restTimeout.clear();
					instance.blockMouseMove = true;
					instance.restTimeoutPending = false;
				} else isHoverCloseActiveRef.current = false;
			}
			events.on("openchange", onOpenChangeLocal);
			return () => {
				events.off("openchange", onOpenChangeLocal);
			};
		}, [
			enabled,
			events,
			instance,
			cleanupMouseMoveHandler
		]);
		react.useEffect(() => {
			if (!enabled) return;
			function closeWithDelay(event, runElseBranch = true) {
				const closeDelay = getDelay(delayRef.current, "close", instance.pointerType);
				if (closeDelay) instance.openChangeTimeout.start(closeDelay, () => {
					store.setOpen(false, createChangeEventDetails(triggerHover, event));
					tree?.events.emit("floating.closed", event);
				});
				else if (runElseBranch) {
					instance.openChangeTimeout.clear();
					store.setOpen(false, createChangeEventDetails(triggerHover, event));
					tree?.events.emit("floating.closed", event);
				}
			}
			const trigger = triggerElementRef.current ?? (isActiveTrigger ? store.select("domReferenceElement") : null);
			if (!isElement(trigger)) return;
			function onMouseEnter(event) {
				instance.openChangeTimeout.clear();
				instance.blockMouseMove = false;
				if (mouseOnly && !isMouseLikePointerType(instance.pointerType)) return;
				const restMsValue = getRestMs(restMsRef.current);
				const openDelay = getDelay(delayRef.current, "open", instance.pointerType);
				const eventTarget = getTarget(event);
				const currentTarget = event.currentTarget ?? null;
				const currentDomReference = store.select("domReferenceElement");
				let triggerNode = currentTarget;
				if (isElement(eventTarget) && !store.context.triggerElements.hasElement(eventTarget)) {
					for (const triggerElement of store.context.triggerElements.elements()) if (contains(triggerElement, eventTarget)) {
						triggerNode = triggerElement;
						break;
					}
				}
				if (isElement(currentTarget) && isElement(currentDomReference) && !store.context.triggerElements.hasElement(currentTarget) && contains(currentTarget, currentDomReference)) triggerNode = currentDomReference;
				const isOverInactive = triggerNode == null ? false : isOverInactiveTrigger(currentDomReference, triggerNode, eventTarget);
				const isOpen = store.select("open");
				const isInClosingTransition = isClosingRef.current?.() ?? store.select("transitionStatus") === "ending";
				const isHoverCloseTransition = !isOpen && isInClosingTransition && isHoverCloseActiveRef.current;
				const isReenteringSameTriggerDuringCloseTransition = !isOverInactive && isElement(triggerNode) && isElement(currentDomReference) && contains(currentDomReference, triggerNode) && isHoverCloseTransition;
				const isRestOnlyDelay = restMsValue > 0 && !openDelay;
				const shouldOpenImmediately = isOverInactive && (isOpen || isHoverCloseTransition) || isReenteringSameTriggerDuringCloseTransition;
				const shouldOpen = !isOpen || isOverInactive;
				if (shouldOpenImmediately) {
					if (checkShouldOpen()) store.setOpen(true, createChangeEventDetails(triggerHover, event, triggerNode));
					return;
				}
				if (isRestOnlyDelay) return;
				if (openDelay) instance.openChangeTimeout.start(openDelay, () => {
					if (shouldOpen && checkShouldOpen()) store.setOpen(true, createChangeEventDetails(triggerHover, event, triggerNode));
				});
				else if (shouldOpen) {
					if (checkShouldOpen()) store.setOpen(true, createChangeEventDetails(triggerHover, event, triggerNode));
				}
			}
			function onMouseLeave(event) {
				if (isClickLikeOpenEvent$1()) {
					clearPointerEvents();
					return;
				}
				cleanupMouseMoveHandler();
				const domReferenceElement = store.select("domReferenceElement");
				const doc = ownerDocument(domReferenceElement);
				instance.restTimeout.clear();
				instance.restTimeoutPending = false;
				const handleCloseContextBase = dataRef.current.floatingContext ?? getHandleCloseContext?.();
				if (isTargetInsideEnabledTrigger(event.relatedTarget, store.context.triggerElements)) return;
				if (handleCloseRef.current && handleCloseContextBase) {
					if (!store.select("open")) instance.openChangeTimeout.clear();
					const currentTrigger = triggerElementRef.current;
					instance.handler = handleCloseRef.current({
						...handleCloseContextBase,
						tree,
						x: event.clientX,
						y: event.clientY,
						onClose() {
							clearPointerEvents();
							cleanupMouseMoveHandler();
							if (enabledRef.current && !isClickLikeOpenEvent$1() && currentTrigger === store.select("domReferenceElement")) closeWithDelay(event, true);
						}
					});
					doc.addEventListener("mousemove", instance.handler);
					instance.handler(event);
					return;
				}
				if (instance.pointerType === "touch" ? !contains(store.select("floatingElement"), event.relatedTarget) : true) closeWithDelay(event);
			}
			function onMouseOut(event) {
				if (contains(trigger, event.relatedTarget)) return;
				instance.openChangeTimeout.clear();
				instance.restTimeout.clear();
				instance.restTimeoutPending = false;
			}
			const staleOpenGuard = guardStaleOpen ? addEventListener(trigger, "mouseout", onMouseOut) : void 0;
			if (move) return mergeCleanups(addEventListener(trigger, "mousemove", onMouseEnter, { once: true }), addEventListener(trigger, "mouseenter", onMouseEnter), addEventListener(trigger, "mouseleave", onMouseLeave), staleOpenGuard);
			return mergeCleanups(addEventListener(trigger, "mouseenter", onMouseEnter), addEventListener(trigger, "mouseleave", onMouseLeave), staleOpenGuard);
		}, [
			cleanupMouseMoveHandler,
			clearPointerEvents,
			dataRef,
			delayRef,
			store,
			enabled,
			handleCloseRef,
			instance,
			isActiveTrigger,
			isOverInactiveTrigger,
			isClickLikeOpenEvent$1,
			mouseOnly,
			move,
			restMsRef,
			triggerElementRef,
			tree,
			enabledRef,
			getHandleCloseContext,
			isClosingRef,
			checkShouldOpen,
			guardStaleOpen
		]);
		return react.useMemo(() => {
			if (!enabled) return;
			function setPointerRef(event) {
				instance.pointerType = event.pointerType;
			}
			return {
				onPointerDown: setPointerRef,
				onPointerEnter: setPointerRef,
				onMouseMove(event) {
					const { nativeEvent } = event;
					const trigger = event.currentTarget;
					const currentDomReference = store.select("domReferenceElement");
					const currentOpen = store.select("open");
					const isOverInactive = isOverInactiveTrigger(currentDomReference, trigger, event.target);
					if (mouseOnly && !isMouseLikePointerType(instance.pointerType)) return;
					if (currentOpen && isOverInactive && instance.handleCloseOptions?.blockPointerEvents) {
						const floatingElement = store.select("floatingElement");
						if (floatingElement) {
							const scopeElement = instance.handleCloseOptions?.getScope?.() ?? trigger.ownerDocument.body;
							applySafePolygonPointerEventsMutation(instance, {
								scopeElement,
								referenceElement: trigger,
								floatingElement
							});
						}
					}
					const restMsValue = getRestMs(restMsRef.current);
					if (currentOpen && !isOverInactive || restMsValue === 0) return;
					if (!isOverInactive && instance.restTimeoutPending && event.movementX ** 2 + event.movementY ** 2 < 2) return;
					instance.restTimeout.clear();
					function handleMouseMove() {
						instance.restTimeoutPending = false;
						if (isClickLikeOpenEvent$1()) return;
						const latestOpen = store.select("open");
						if (!instance.blockMouseMove && (!latestOpen || isOverInactive) && checkShouldOpen()) store.setOpen(true, createChangeEventDetails(triggerHover, nativeEvent, trigger));
					}
					if (instance.pointerType === "touch") react_dom.flushSync(() => {
						handleMouseMove();
					});
					else if (isOverInactive && currentOpen) handleMouseMove();
					else {
						instance.restTimeoutPending = true;
						instance.restTimeout.start(restMsValue, handleMouseMove);
					}
				}
			};
		}, [
			enabled,
			instance,
			isClickLikeOpenEvent$1,
			isOverInactiveTrigger,
			mouseOnly,
			store,
			restMsRef,
			checkShouldOpen
		]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/safePolygon.mjs
	const CURSOR_SPEED_THRESHOLD = .1;
	const CURSOR_SPEED_THRESHOLD_SQUARED = CURSOR_SPEED_THRESHOLD * CURSOR_SPEED_THRESHOLD;
	const POLYGON_BUFFER = .5;
	function hasIntersectingEdge(pointX, pointY, xi, yi, xj, yj) {
		return yi >= pointY !== yj >= pointY && pointX <= (xj - xi) * (pointY - yi) / (yj - yi) + xi;
	}
	function isPointInQuadrilateral(pointX, pointY, x1, y1, x2, y2, x3, y3, x4, y4) {
		let isInsideValue = false;
		if (hasIntersectingEdge(pointX, pointY, x1, y1, x2, y2)) isInsideValue = !isInsideValue;
		if (hasIntersectingEdge(pointX, pointY, x2, y2, x3, y3)) isInsideValue = !isInsideValue;
		if (hasIntersectingEdge(pointX, pointY, x3, y3, x4, y4)) isInsideValue = !isInsideValue;
		if (hasIntersectingEdge(pointX, pointY, x4, y4, x1, y1)) isInsideValue = !isInsideValue;
		return isInsideValue;
	}
	function isInsideRect(pointX, pointY, rect) {
		return pointX >= rect.x && pointX <= rect.x + rect.width && pointY >= rect.y && pointY <= rect.y + rect.height;
	}
	function isInsideAxisAlignedRect(pointX, pointY, x1, y1, x2, y2) {
		return pointX >= Math.min(x1, x2) && pointX <= Math.max(x1, x2) && pointY >= Math.min(y1, y2) && pointY <= Math.max(y1, y2);
	}
	/**
	* Generates a safe polygon area that the user can traverse without closing the
	* floating element once leaving the reference element.
	* @see https://floating-ui.com/docs/useHover#safepolygon
	*/
	function safePolygon(options = {}) {
		const { blockPointerEvents = false } = options;
		const timeout = new Timeout();
		const fn = ({ x, y, placement, elements, onClose, nodeId, tree }) => {
			const side = placement?.split("-")[0];
			let hasLanded = false;
			let lastX = null;
			let lastY = null;
			let lastCursorTime = typeof performance !== "undefined" ? performance.now() : 0;
			function isCursorMovingSlowly(nextX, nextY) {
				const currentTime = performance.now();
				const elapsedTime = currentTime - lastCursorTime;
				if (lastX === null || lastY === null || elapsedTime === 0) {
					lastX = nextX;
					lastY = nextY;
					lastCursorTime = currentTime;
					return false;
				}
				const deltaX = nextX - lastX;
				const deltaY = nextY - lastY;
				const distanceSquared = deltaX * deltaX + deltaY * deltaY;
				const thresholdSquared = elapsedTime * elapsedTime * CURSOR_SPEED_THRESHOLD_SQUARED;
				lastX = nextX;
				lastY = nextY;
				lastCursorTime = currentTime;
				return distanceSquared < thresholdSquared;
			}
			function close() {
				timeout.clear();
				onClose();
			}
			return function onMouseMove(event) {
				timeout.clear();
				const domReference = elements.domReference;
				const floating = elements.floating;
				if (!domReference || !floating || side == null || x == null || y == null) return;
				const { clientX, clientY } = event;
				const target = getTarget(event);
				const isLeave = event.type === "mouseleave";
				const isOverFloatingEl = contains(floating, target);
				const isOverReferenceEl = contains(domReference, target);
				if (isOverFloatingEl) {
					hasLanded = true;
					if (!isLeave) return;
				}
				if (isOverReferenceEl) {
					hasLanded = false;
					if (!isLeave) {
						hasLanded = true;
						return;
					}
				}
				if (isLeave && isElement(event.relatedTarget) && contains(floating, event.relatedTarget)) return;
				function hasOpenChildNode() {
					return Boolean(tree && getNodeChildren(tree.nodesRef.current, nodeId).length > 0);
				}
				function closeIfNoOpenChild() {
					if (!hasOpenChildNode()) close();
				}
				if (hasOpenChildNode()) return;
				const refRect = domReference.getBoundingClientRect();
				const rect = floating.getBoundingClientRect();
				const cursorLeaveFromRight = x > rect.right - rect.width / 2;
				const cursorLeaveFromBottom = y > rect.bottom - rect.height / 2;
				const isFloatingWider = rect.width > refRect.width;
				const isFloatingTaller = rect.height > refRect.height;
				const left = (isFloatingWider ? refRect : rect).left;
				const right = (isFloatingWider ? refRect : rect).right;
				const top = (isFloatingTaller ? refRect : rect).top;
				const bottom = (isFloatingTaller ? refRect : rect).bottom;
				if (side === "top" && y >= refRect.bottom - 1 || side === "bottom" && y <= refRect.top + 1 || side === "left" && x >= refRect.right - 1 || side === "right" && x <= refRect.left + 1) {
					closeIfNoOpenChild();
					return;
				}
				let isInsideTroughRect = false;
				switch (side) {
					case "top":
						isInsideTroughRect = isInsideAxisAlignedRect(clientX, clientY, left, refRect.top + 1, right, rect.bottom - 1);
						break;
					case "bottom":
						isInsideTroughRect = isInsideAxisAlignedRect(clientX, clientY, left, rect.top + 1, right, refRect.bottom - 1);
						break;
					case "left":
						isInsideTroughRect = isInsideAxisAlignedRect(clientX, clientY, rect.right - 1, bottom, refRect.left + 1, top);
						break;
					case "right": isInsideTroughRect = isInsideAxisAlignedRect(clientX, clientY, refRect.right - 1, bottom, rect.left + 1, top);
				}
				if (isInsideTroughRect) return;
				if (hasLanded && !isInsideRect(clientX, clientY, refRect)) {
					closeIfNoOpenChild();
					return;
				}
				if (!isLeave && isCursorMovingSlowly(clientX, clientY)) {
					closeIfNoOpenChild();
					return;
				}
				let isInsidePolygon = false;
				switch (side) {
					case "top": {
						const cursorXOffset = isFloatingWider ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
						const cursorPointOneX = isFloatingWider ? x + cursorXOffset : cursorLeaveFromRight ? x + cursorXOffset : x - cursorXOffset;
						const cursorPointTwoX = isFloatingWider ? x - cursorXOffset : cursorLeaveFromRight ? x + cursorXOffset : x - cursorXOffset;
						const cursorPointY = y + POLYGON_BUFFER + 1;
						const commonYLeft = cursorLeaveFromRight ? rect.bottom - POLYGON_BUFFER : isFloatingWider ? rect.bottom - POLYGON_BUFFER : rect.top;
						const commonYRight = cursorLeaveFromRight ? isFloatingWider ? rect.bottom - POLYGON_BUFFER : rect.top : rect.bottom - POLYGON_BUFFER;
						isInsidePolygon = isPointInQuadrilateral(clientX, clientY, cursorPointOneX, cursorPointY, cursorPointTwoX, cursorPointY, rect.left, commonYLeft, rect.right, commonYRight);
						break;
					}
					case "bottom": {
						const cursorXOffset = isFloatingWider ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
						const cursorPointOneX = isFloatingWider ? x + cursorXOffset : cursorLeaveFromRight ? x + cursorXOffset : x - cursorXOffset;
						const cursorPointTwoX = isFloatingWider ? x - cursorXOffset : cursorLeaveFromRight ? x + cursorXOffset : x - cursorXOffset;
						const cursorPointY = y - POLYGON_BUFFER;
						const commonYLeft = cursorLeaveFromRight ? rect.top + POLYGON_BUFFER : isFloatingWider ? rect.top + POLYGON_BUFFER : rect.bottom;
						const commonYRight = cursorLeaveFromRight ? isFloatingWider ? rect.top + POLYGON_BUFFER : rect.bottom : rect.top + POLYGON_BUFFER;
						isInsidePolygon = isPointInQuadrilateral(clientX, clientY, cursorPointOneX, cursorPointY, cursorPointTwoX, cursorPointY, rect.left, commonYLeft, rect.right, commonYRight);
						break;
					}
					case "left": {
						const cursorYOffset = isFloatingTaller ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
						const cursorPointOneY = isFloatingTaller ? y + cursorYOffset : cursorLeaveFromBottom ? y + cursorYOffset : y - cursorYOffset;
						const cursorPointTwoY = isFloatingTaller ? y - cursorYOffset : cursorLeaveFromBottom ? y + cursorYOffset : y - cursorYOffset;
						const cursorPointX = x + POLYGON_BUFFER + 1;
						const commonXTop = cursorLeaveFromBottom ? rect.right - POLYGON_BUFFER : isFloatingTaller ? rect.right - POLYGON_BUFFER : rect.left;
						const commonXBottom = cursorLeaveFromBottom ? isFloatingTaller ? rect.right - POLYGON_BUFFER : rect.left : rect.right - POLYGON_BUFFER;
						isInsidePolygon = isPointInQuadrilateral(clientX, clientY, commonXTop, rect.top, commonXBottom, rect.bottom, cursorPointX, cursorPointOneY, cursorPointX, cursorPointTwoY);
						break;
					}
					case "right": {
						const cursorYOffset = isFloatingTaller ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
						const cursorPointOneY = isFloatingTaller ? y + cursorYOffset : cursorLeaveFromBottom ? y + cursorYOffset : y - cursorYOffset;
						const cursorPointTwoY = isFloatingTaller ? y - cursorYOffset : cursorLeaveFromBottom ? y + cursorYOffset : y - cursorYOffset;
						const cursorPointX = x - POLYGON_BUFFER;
						const commonXTop = cursorLeaveFromBottom ? rect.left + POLYGON_BUFFER : isFloatingTaller ? rect.left + POLYGON_BUFFER : rect.right;
						const commonXBottom = cursorLeaveFromBottom ? isFloatingTaller ? rect.left + POLYGON_BUFFER : rect.right : rect.left + POLYGON_BUFFER;
						isInsidePolygon = isPointInQuadrilateral(clientX, clientY, cursorPointX, cursorPointOneY, cursorPointX, cursorPointTwoY, commonXTop, rect.top, commonXBottom, rect.bottom);
						break;
					}
				}
				if (!isInsidePolygon) closeIfNoOpenChild();
				else if (!hasLanded) timeout.start(40, closeIfNoOpenChild);
			};
		};
		fn.__options = {
			...options,
			blockPointerEvents
		};
		return fn;
	}

// node_modules/.store/@floating-ui/core@1.8.0-3V8aS7jJHHGcsCINjP9-5A/node_modules/@floating-ui/core/dist/floating-ui.core.mjs
	function computeCoordsFromPlacement(_ref, placement, rtl) {
		let { reference, floating } = _ref;
		const sideAxis = getSideAxis(placement);
		const alignmentAxis = getAlignmentAxis(placement);
		const alignLength = getAxisLength(alignmentAxis);
		const side = getSide(placement);
		const isVertical = sideAxis === "y";
		const commonX = reference.x + reference.width / 2 - floating.width / 2;
		const commonY = reference.y + reference.height / 2 - floating.height / 2;
		const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
		let coords;
		switch (side) {
			case "top":
				coords = {
					x: commonX,
					y: reference.y - floating.height
				};
				break;
			case "bottom":
				coords = {
					x: commonX,
					y: reference.y + reference.height
				};
				break;
			case "right":
				coords = {
					x: reference.x + reference.width,
					y: commonY
				};
				break;
			case "left":
				coords = {
					x: reference.x - floating.width,
					y: commonY
				};
				break;
			default: coords = {
				x: reference.x,
				y: reference.y
			};
		}
		const alignment = getAlignment(placement);
		if (alignment) coords[alignmentAxis] += commonAlign * (alignment === "end" ? 1 : -1) * (rtl && isVertical ? -1 : 1);
		return coords;
	}
	/**
	* Resolves with an object of overflow side offsets that determine how much the
	* element is overflowing a given clipping boundary on each side.
	* - positive = overflowing the boundary by that number of pixels
	* - negative = how many pixels left before it will overflow
	* - 0 = lies flush with the boundary
	* @see https://floating-ui.com/docs/detectOverflow
	*/
	async function detectOverflow(state, options) {
		var _await$platform$isEle;
		if (options === void 0) options = {};
		const { x, y, platform, rects, elements, strategy } = state;
		const { boundary = "clippingAncestors", rootBoundary = "viewport", elementContext = "floating", altBoundary = false, padding = 0 } = evaluate(options, state);
		const paddingObject = getPaddingObject(padding);
		const element = elements[altBoundary ? elementContext === "floating" ? "reference" : "floating" : elementContext];
		const clippingClientRect = rectToClientRect(await platform.getClippingRect({
			element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating)),
			boundary,
			rootBoundary,
			strategy
		}));
		const rect = elementContext === "floating" ? {
			x,
			y,
			width: rects.floating.width,
			height: rects.floating.height
		} : rects.reference;
		const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
		const offsetScale = await (platform.isElement == null ? void 0 : platform.isElement(offsetParent)) && await (platform.getScale == null ? void 0 : platform.getScale(offsetParent)) || {
			x: 1,
			y: 1
		};
		const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
			elements,
			rect,
			offsetParent,
			strategy
		}) : rect);
		return {
			top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
			bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
			left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
			right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
		};
	}
	const MAX_RESET_COUNT = 50;
	/**
	* Computes the `x` and `y` coordinates that will place the floating element
	* next to a given reference element.
	*
	* This export does not have any `platform` interface logic. You will need to
	* write one for the platform you are using Floating UI with.
	*/
	const computePosition$1 = async (reference, floating, config) => {
		const { placement = "bottom", strategy = "absolute", middleware = [], platform } = config;
		const platformWithDetectOverflow = platform.detectOverflow ? platform : {
			...platform,
			detectOverflow
		};
		const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
		let rects = await platform.getElementRects({
			reference,
			floating,
			strategy
		});
		let { x, y } = computeCoordsFromPlacement(rects, placement, rtl);
		let statefulPlacement = placement;
		let resetCount = 0;
		const middlewareData = {};
		for (let i = 0; i < middleware.length; i++) {
			const currentMiddleware = middleware[i];
			if (!currentMiddleware) continue;
			const { name, fn } = currentMiddleware;
			const { x: nextX, y: nextY, data, reset } = await fn({
				x,
				y,
				initialPlacement: placement,
				placement: statefulPlacement,
				strategy,
				middlewareData,
				rects,
				platform: platformWithDetectOverflow,
				elements: {
					reference,
					floating
				}
			});
			x = nextX != null ? nextX : x;
			y = nextY != null ? nextY : y;
			middlewareData[name] = {
				...middlewareData[name],
				...data
			};
			if (reset && resetCount < MAX_RESET_COUNT) {
				resetCount++;
				if (typeof reset === "object") {
					if (reset.placement) statefulPlacement = reset.placement;
					if (reset.rects) rects = reset.rects === true ? await platform.getElementRects({
						reference,
						floating,
						strategy
					}) : reset.rects;
					({x, y} = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
				}
				i = -1;
			}
		}
		return {
			x,
			y,
			placement: statefulPlacement,
			strategy,
			middlewareData
		};
	};
	/**
	* Optimizes the visibility of the floating element by flipping the `placement`
	* in order to keep it in view when the preferred placement(s) will overflow the
	* clipping boundary. Alternative to `autoPlacement`.
	* @see https://floating-ui.com/docs/flip
	*/
	const flip$1 = function(options) {
		if (options === void 0) options = {};
		return {
			name: "flip",
			options,
			async fn(state) {
				var _middlewareData$arrow, _middlewareData$flip;
				const { placement, middlewareData, rects, initialPlacement, platform, elements } = state;
				const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = true, fallbackPlacements: specifiedFallbackPlacements, fallbackStrategy = "bestFit", fallbackAxisSideDirection = "none", flipAlignment = true, ...detectOverflowOptions } = evaluate(options, state);
				if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) return {};
				const side = getSide(placement);
				const initialSideAxis = getSideAxis(initialPlacement);
				const isBasePlacement = getSide(initialPlacement) === initialPlacement;
				const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
				const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
				const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
				if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
				const placements = [initialPlacement, ...fallbackPlacements];
				const overflow = await platform.detectOverflow(state, detectOverflowOptions);
				const overflows = [];
				let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
				if (checkMainAxis) overflows.push(overflow[side]);
				if (checkCrossAxis) {
					const sides = getAlignmentSides(placement, rects, rtl);
					overflows.push(overflow[sides[0]], overflow[sides[1]]);
				}
				overflowsData = [...overflowsData, {
					placement,
					overflows
				}];
				if (!overflows.every((side) => side <= 0)) {
					var _middlewareData$flip2, _overflowsData$filter;
					const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
					const nextPlacement = placements[nextIndex];
					if (nextPlacement) {
						if (!(checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false) || overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) return {
							data: {
								index: nextIndex,
								overflows: overflowsData
							},
							reset: { placement: nextPlacement }
						};
					}
					let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
					if (!resetPlacement) switch (fallbackStrategy) {
						case "bestFit": {
							var _overflowsData$filter2;
							const placement = (_overflowsData$filter2 = overflowsData.filter((d) => {
								if (hasFallbackAxisSideDirection) {
									const currentSideAxis = getSideAxis(d.placement);
									return currentSideAxis === initialSideAxis || currentSideAxis === "y";
								}
								return true;
							}).map((d) => [d.placement, d.overflows.filter((overflow) => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
							if (placement) resetPlacement = placement;
							break;
						}
						case "initialPlacement": resetPlacement = initialPlacement;
					}
					if (placement !== resetPlacement) return { reset: { placement: resetPlacement } };
				}
				return {};
			}
		};
	};
	const originSides = /*#__PURE__*/ new Set(["left", "top"]);
	async function convertValueToCoords(state, options) {
		const { placement, platform, elements } = state;
		const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
		const side = getSide(placement);
		const alignment = getAlignment(placement);
		const isVertical = getSideAxis(placement) === "y";
		const mainAxisMulti = originSides.has(side) ? -1 : 1;
		const crossAxisMulti = rtl && isVertical ? -1 : 1;
		const rawValue = evaluate(options, state);
		let { mainAxis, crossAxis, alignmentAxis } = typeof rawValue === "number" ? {
			mainAxis: rawValue,
			crossAxis: 0,
			alignmentAxis: null
		} : {
			mainAxis: rawValue.mainAxis || 0,
			crossAxis: rawValue.crossAxis || 0,
			alignmentAxis: rawValue.alignmentAxis
		};
		if (alignment && typeof alignmentAxis === "number") crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
		return isVertical ? {
			x: crossAxis * crossAxisMulti,
			y: mainAxis * mainAxisMulti
		} : {
			x: mainAxis * mainAxisMulti,
			y: crossAxis * crossAxisMulti
		};
	}
	/**
	* Modifies the placement by translating the floating element along the
	* specified axes.
	* A number (shorthand for `mainAxis` or distance), or an axes configuration
	* object may be passed.
	* @see https://floating-ui.com/docs/offset
	*/
	const offset$1 = function(options) {
		if (options === void 0) options = 0;
		return {
			name: "offset",
			options,
			async fn(state) {
				var _middlewareData$offse, _middlewareData$arrow;
				const { x, y, placement, middlewareData } = state;
				const diffCoords = await convertValueToCoords(state, options);
				if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) return {};
				return {
					x: x + diffCoords.x,
					y: y + diffCoords.y,
					data: {
						...diffCoords,
						placement
					}
				};
			}
		};
	};
	/**
	* Optimizes the visibility of the floating element by shifting it in order to
	* keep it in view when it will overflow the clipping boundary.
	* @see https://floating-ui.com/docs/shift
	*/
	const shift$1 = function(options) {
		if (options === void 0) options = {};
		return {
			name: "shift",
			options,
			async fn(state) {
				const { x, y, placement, platform } = state;
				const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = false, limiter = { fn: (_ref) => {
					let { x, y } = _ref;
					return {
						x,
						y
					};
				} }, ...detectOverflowOptions } = evaluate(options, state);
				const coords = {
					x,
					y
				};
				const overflow = await platform.detectOverflow(state, detectOverflowOptions);
				const crossAxis = getSideAxis(placement);
				const mainAxis = getOppositeAxis(crossAxis);
				let mainAxisCoord = coords[mainAxis];
				let crossAxisCoord = coords[crossAxis];
				const clampCoord = (axis, coord) => clamp(coord + overflow[axis === "y" ? "top" : "left"], coord, coord - overflow[axis === "y" ? "bottom" : "right"]);
				if (checkMainAxis) mainAxisCoord = clampCoord(mainAxis, mainAxisCoord);
				if (checkCrossAxis) crossAxisCoord = clampCoord(crossAxis, crossAxisCoord);
				const limitedCoords = limiter.fn({
					...state,
					[mainAxis]: mainAxisCoord,
					[crossAxis]: crossAxisCoord
				});
				return {
					...limitedCoords,
					data: {
						x: limitedCoords.x - x,
						y: limitedCoords.y - y,
						enabled: {
							[mainAxis]: checkMainAxis,
							[crossAxis]: checkCrossAxis
						}
					}
				};
			}
		};
	};
	/**
	* Built-in `limiter` that will stop `shift()` at a certain point.
	*/
	const limitShift$1 = function(options) {
		if (options === void 0) options = {};
		return {
			options,
			fn(state) {
				var _rawOffset$mainAxis, _rawOffset$crossAxis;
				const { x, y, placement, rects, middlewareData } = state;
				const { offset = 0, mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = true } = evaluate(options, state);
				const coords = {
					x,
					y
				};
				const crossAxis = getSideAxis(placement);
				const mainAxis = getOppositeAxis(crossAxis);
				let mainAxisCoord = coords[mainAxis];
				let crossAxisCoord = coords[crossAxis];
				const rawOffset = evaluate(offset, state);
				const computedOffset = typeof rawOffset === "number" ? {
					mainAxis: rawOffset,
					crossAxis: 0
				} : {
					mainAxis: (_rawOffset$mainAxis = rawOffset.mainAxis) != null ? _rawOffset$mainAxis : 0,
					crossAxis: (_rawOffset$crossAxis = rawOffset.crossAxis) != null ? _rawOffset$crossAxis : 0
				};
				if (checkMainAxis) {
					const len = mainAxis === "y" ? "height" : "width";
					const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
					const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
					if (mainAxisCoord < limitMin) mainAxisCoord = limitMin;
					else if (mainAxisCoord > limitMax) mainAxisCoord = limitMax;
				}
				if (checkCrossAxis) {
					var _middlewareData$offse, _middlewareData$offse2;
					const len = mainAxis === "y" ? "width" : "height";
					const isOriginSide = originSides.has(getSide(placement));
					const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
					const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
					if (crossAxisCoord < limitMin) crossAxisCoord = limitMin;
					else if (crossAxisCoord > limitMax) crossAxisCoord = limitMax;
				}
				return {
					[mainAxis]: mainAxisCoord,
					[crossAxis]: crossAxisCoord
				};
			}
		};
	};
	/**
	* Provides data that allows you to change the size of the floating element —
	* for instance, prevent it from overflowing the clipping boundary or match the
	* width of the reference element.
	* @see https://floating-ui.com/docs/size
	*/
	const size$1 = function(options) {
		if (options === void 0) options = {};
		return {
			name: "size",
			options,
			async fn(state) {
				const { placement, rects, platform, elements } = state;
				const { apply = () => {}, ...detectOverflowOptions } = evaluate(options, state);
				const overflow = await platform.detectOverflow(state, detectOverflowOptions);
				const side = getSide(placement);
				const alignment = getAlignment(placement);
				const isYAxis = getSideAxis(placement) === "y";
				const { width, height } = rects.floating;
				let heightSide;
				let widthSide;
				if (side === "top" || side === "bottom") {
					heightSide = side;
					widthSide = alignment === (await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
				} else {
					widthSide = side;
					heightSide = alignment === "end" ? "top" : "bottom";
				}
				const maximumClippingHeight = height - overflow.top - overflow.bottom;
				const maximumClippingWidth = width - overflow.left - overflow.right;
				const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
				const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
				const shiftData = state.middlewareData.shift;
				const noShift = !shiftData;
				let availableHeight = overflowAvailableHeight;
				let availableWidth = overflowAvailableWidth;
				if (shiftData != null && shiftData.enabled.x) availableWidth = maximumClippingWidth;
				if (shiftData != null && shiftData.enabled.y) availableHeight = maximumClippingHeight;
				if (noShift && !alignment) {
					if (isYAxis) availableWidth = width - 2 * max(overflow.left, overflow.right);
					else availableHeight = height - 2 * max(overflow.top, overflow.bottom);
				}
				await apply({
					...state,
					availableWidth,
					availableHeight
				});
				const nextDimensions = await platform.getDimensions(elements.floating);
				if (width !== nextDimensions.width || height !== nextDimensions.height) return { reset: { rects: true } };
				return {};
			}
		};
	};

// node_modules/.store/@floating-ui/dom@1.8.0-vHXcr4FgWneV0cgwFw-d7A/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
	function getCssDimensions(element) {
		const css = getComputedStyle$1(element);
		let width = parseFloat(css.width) || 0;
		let height = parseFloat(css.height) || 0;
		const hasOffset = isHTMLElement(element);
		const offsetWidth = hasOffset ? element.offsetWidth : width;
		const offsetHeight = hasOffset ? element.offsetHeight : height;
		const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
		if (shouldFallback) {
			width = offsetWidth;
			height = offsetHeight;
		}
		return {
			width,
			height,
			$: shouldFallback
		};
	}
	function unwrapElement(element) {
		return !isElement(element) ? element.contextElement : element;
	}
	function getScale(element) {
		const domElement = unwrapElement(element);
		if (!isHTMLElement(domElement)) return createCoords(1);
		const rect = domElement.getBoundingClientRect();
		const { width, height, $ } = getCssDimensions(domElement);
		let x = ($ ? round(rect.width) : rect.width) / width;
		let y = ($ ? round(rect.height) : rect.height) / height;
		if (!x || !Number.isFinite(x)) x = 1;
		if (!y || !Number.isFinite(y)) y = 1;
		return {
			x,
			y
		};
	}
	const noOffsets = /*#__PURE__*/ createCoords(0);
	function getVisualOffsets(element) {
		const win = getWindow(element);
		if (!isWebKit() || !win.visualViewport) return noOffsets;
		return {
			x: win.visualViewport.offsetLeft,
			y: win.visualViewport.offsetTop
		};
	}
	function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
		if (isFixed === void 0) isFixed = false;
		return !!floatingOffsetParent && isFixed && floatingOffsetParent === getWindow(element);
	}
	function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
		if (includeScale === void 0) includeScale = false;
		if (isFixedStrategy === void 0) isFixedStrategy = false;
		const clientRect = element.getBoundingClientRect();
		const domElement = unwrapElement(element);
		let scale = createCoords(1);
		if (includeScale) {
			if (offsetParent) {
				if (isElement(offsetParent)) scale = getScale(offsetParent);
			} else scale = getScale(element);
		}
		const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
		let x = (clientRect.left + visualOffsets.x) / scale.x;
		let y = (clientRect.top + visualOffsets.y) / scale.y;
		let width = clientRect.width / scale.x;
		let height = clientRect.height / scale.y;
		if (domElement && offsetParent) {
			const win = getWindow(domElement);
			const offsetWin = isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
			let currentWin = win;
			let currentIFrame = getFrameElement(currentWin);
			while (currentIFrame && offsetWin !== currentWin) {
				const iframeScale = getScale(currentIFrame);
				const iframeRect = currentIFrame.getBoundingClientRect();
				const css = getComputedStyle$1(currentIFrame);
				const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
				const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
				x *= iframeScale.x;
				y *= iframeScale.y;
				width *= iframeScale.x;
				height *= iframeScale.y;
				x += left;
				y += top;
				currentWin = getWindow(currentIFrame);
				currentIFrame = getFrameElement(currentWin);
			}
		}
		return rectToClientRect({
			width,
			height,
			x,
			y
		});
	}
	function getWindowScrollBarX(element, rect) {
		const leftScroll = getNodeScroll(element).scrollLeft;
		if (!rect) return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
		return rect.left + leftScroll;
	}
	function getHTMLOffset(documentElement, scroll) {
		const htmlRect = documentElement.getBoundingClientRect();
		return {
			x: htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect),
			y: htmlRect.top + scroll.scrollTop
		};
	}
	function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
		let { elements, rect, offsetParent, strategy } = _ref;
		const isFixed = strategy === "fixed";
		const documentElement = getDocumentElement(offsetParent);
		const topLayer = elements ? isTopLayer(elements.floating) : false;
		if (offsetParent === documentElement || topLayer && isFixed) return rect;
		let scroll = {
			scrollLeft: 0,
			scrollTop: 0
		};
		let scale = createCoords(1);
		const offsets = createCoords(0);
		const isOffsetParentAnElement = isHTMLElement(offsetParent);
		if (isOffsetParentAnElement || !isFixed) {
			if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
			if (isOffsetParentAnElement) {
				const offsetRect = getBoundingClientRect(offsetParent);
				scale = getScale(offsetParent);
				offsets.x = offsetRect.x + offsetParent.clientLeft;
				offsets.y = offsetRect.y + offsetParent.clientTop;
			}
		}
		const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
		return {
			width: rect.width * scale.x,
			height: rect.height * scale.y,
			x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
			y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
		};
	}
	function getClientRects(element) {
		return element.getClientRects ? Array.from(element.getClientRects()) : [];
	}
	function getDocumentRect(html) {
		const scroll = getNodeScroll(html);
		const body = html.ownerDocument.body;
		const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
		const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
		let x = -scroll.scrollLeft + getWindowScrollBarX(html);
		const y = -scroll.scrollTop;
		if (getComputedStyle$1(body).direction === "rtl") x += max(html.clientWidth, body.clientWidth) - width;
		return {
			width,
			height,
			x,
			y
		};
	}
	const SCROLLBAR_MAX = 25;
	function getViewportRect(element, strategy, rootBoundary) {
		if (rootBoundary === void 0) rootBoundary = "viewport";
		const isLayoutViewport = rootBoundary === "layoutViewport";
		const win = getWindow(element);
		const html = getDocumentElement(element);
		const visualViewport = win.visualViewport;
		let width = html.clientWidth;
		let height = html.clientHeight;
		let x = 0;
		let y = 0;
		if (visualViewport) {
			const layoutRelativeClientCoords = !isWebKit() || strategy === "fixed";
			if (isLayoutViewport) {
				if (!layoutRelativeClientCoords) {
					x = -visualViewport.offsetLeft;
					y = -visualViewport.offsetTop;
				}
			} else {
				width = visualViewport.width;
				height = visualViewport.height;
				if (layoutRelativeClientCoords) {
					x = visualViewport.offsetLeft;
					y = visualViewport.offsetTop;
				}
			}
		}
		if (getWindowScrollBarX(html) <= 0) {
			const doc = html.ownerDocument;
			const body = doc.body;
			const bodyStyles = getComputedStyle(body);
			const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
			const reservedWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
			const gutter = getComputedStyle(html).scrollbarGutter === "stable both-edges" ? reservedWidth / 2 : reservedWidth;
			if (gutter <= SCROLLBAR_MAX) width -= gutter;
		}
		return {
			width,
			height,
			x,
			y
		};
	}
	function getInnerBoundingClientRect(element, strategy) {
		const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
		const top = clientRect.top + element.clientTop;
		const left = clientRect.left + element.clientLeft;
		const scale = getScale(element);
		return {
			width: element.clientWidth * scale.x,
			height: element.clientHeight * scale.y,
			x: left * scale.x,
			y: top * scale.y
		};
	}
	function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
		let rect;
		if (clippingAncestor === "viewport" || clippingAncestor === "layoutViewport") rect = getViewportRect(element, strategy, clippingAncestor);
		else if (clippingAncestor === "document") rect = getDocumentRect(getDocumentElement(element));
		else if (isElement(clippingAncestor)) rect = getInnerBoundingClientRect(clippingAncestor, strategy);
		else {
			const visualOffsets = getVisualOffsets(element);
			rect = {
				x: clippingAncestor.x - visualOffsets.x,
				y: clippingAncestor.y - visualOffsets.y,
				width: clippingAncestor.width,
				height: clippingAncestor.height
			};
		}
		return rectToClientRect(rect);
	}
	function getClippingElementAncestors(element, cache) {
		const cachedResult = cache.get(element);
		if (cachedResult) return cachedResult;
		let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
		let lastKeptComputedStyle = null;
		const elementIsFixed = getComputedStyle$1(element).position === "fixed";
		let currentNode = elementIsFixed ? getParentNode(element) : element;
		while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
			const computedStyle = getComputedStyle$1(currentNode);
			const currentNodeIsContaining = isContainingBlock(currentNode);
			const lastPosition = lastKeptComputedStyle ? lastKeptComputedStyle.position : elementIsFixed ? "fixed" : "";
			if (!currentNodeIsContaining && (lastPosition === "fixed" || lastPosition === "absolute" && computedStyle.position === "static")) result = result.filter((ancestor) => ancestor !== currentNode);
			else lastKeptComputedStyle = computedStyle;
			currentNode = getParentNode(currentNode);
		}
		cache.set(element, result);
		return result;
	}
	function getClippingRect(_ref) {
		let { element, boundary, rootBoundary, strategy } = _ref;
		const clippingAncestors = [...boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary), rootBoundary];
		const firstRect = getClientRectFromClippingAncestor(element, clippingAncestors[0], strategy);
		let top = firstRect.top;
		let right = firstRect.right;
		let bottom = firstRect.bottom;
		let left = firstRect.left;
		for (let i = 1; i < clippingAncestors.length; i++) {
			const rect = getClientRectFromClippingAncestor(element, clippingAncestors[i], strategy);
			top = max(rect.top, top);
			right = min(rect.right, right);
			bottom = min(rect.bottom, bottom);
			left = max(rect.left, left);
		}
		return {
			width: right - left,
			height: bottom - top,
			x: left,
			y: top
		};
	}
	function getDimensions(element) {
		const { width, height } = getCssDimensions(element);
		return {
			width,
			height
		};
	}
	function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
		const isOffsetParentAnElement = isHTMLElement(offsetParent);
		const documentElement = getDocumentElement(offsetParent);
		const isFixed = strategy === "fixed";
		const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
		let scroll = {
			scrollLeft: 0,
			scrollTop: 0
		};
		const offsets = createCoords(0);
		if (isOffsetParentAnElement || !isFixed) {
			if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
			if (isOffsetParentAnElement) {
				const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
				offsets.x = offsetRect.x + offsetParent.clientLeft;
				offsets.y = offsetRect.y + offsetParent.clientTop;
			}
		}
		if (!isOffsetParentAnElement && documentElement) offsets.x = getWindowScrollBarX(documentElement);
		const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
		return {
			x: rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x,
			y: rect.top + scroll.scrollTop - offsets.y - htmlOffset.y,
			width: rect.width,
			height: rect.height
		};
	}
	function isStaticPositioned(element) {
		return getComputedStyle$1(element).position === "static";
	}
	function getTrueOffsetParent(element, polyfill) {
		if (!isHTMLElement(element) || getComputedStyle$1(element).position === "fixed") return null;
		if (polyfill) return polyfill(element);
		let rawOffsetParent = element.offsetParent;
		if (getDocumentElement(element) === rawOffsetParent) rawOffsetParent = rawOffsetParent.ownerDocument.body;
		return rawOffsetParent;
	}
	function getOffsetParent(element, polyfill) {
		const win = getWindow(element);
		if (isTopLayer(element)) return win;
		if (!isHTMLElement(element)) {
			let svgOffsetParent = getParentNode(element);
			while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
				if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) return svgOffsetParent;
				svgOffsetParent = getParentNode(svgOffsetParent);
			}
			return win;
		}
		let offsetParent = getTrueOffsetParent(element, polyfill);
		while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) offsetParent = getTrueOffsetParent(offsetParent, polyfill);
		if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) return win;
		return offsetParent || getContainingBlock(element) || win;
	}
	const getElementRects = async function(data) {
		const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
		const getDimensionsFn = this.getDimensions;
		const floatingDimensions = await getDimensionsFn(data.floating);
		return {
			reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
			floating: {
				x: 0,
				y: 0,
				width: floatingDimensions.width,
				height: floatingDimensions.height
			}
		};
	};
	function isRTL$2(element) {
		return getComputedStyle$1(element).direction === "rtl";
	}
	const platform = {
		convertOffsetParentRelativeRectToViewportRelativeRect,
		getDocumentElement,
		getClippingRect,
		getOffsetParent,
		getElementRects,
		getClientRects,
		getDimensions,
		getScale,
		isElement,
		isRTL: isRTL$2
	};
	function rectsAreEqual(a, b) {
		return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
	}
	function observeMove(element, onMove, ancestorResize) {
		let io = null;
		let timeoutId;
		const root = getDocumentElement(element);
		function cleanup() {
			var _io;
			clearTimeout(timeoutId);
			(_io = io) == null || _io.disconnect();
			io = null;
		}
		function refresh(skip, threshold) {
			if (skip === void 0) skip = false;
			if (threshold === void 0) threshold = 1;
			cleanup();
			const elementRectForRootMargin = element.getBoundingClientRect();
			const { left, top, width, height } = elementRectForRootMargin;
			if (!skip) onMove();
			if (!width || !height) return;
			const insetTop = floor(top);
			const insetRight = floor(root.clientWidth - (left + width));
			const insetBottom = floor(root.clientHeight - (top + height));
			const insetLeft = floor(left);
			const options = {
				rootMargin: -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px",
				threshold: max(0, min(1, threshold)) || 1
			};
			let isFirstUpdate = true;
			function handleObserve(entries) {
				const ratio = entries[0].intersectionRatio;
				if (!rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) return refresh();
				if (ratio !== threshold) {
					if (!isFirstUpdate) return refresh();
					if (!ratio) timeoutId = setTimeout(() => {
						refresh(false, 1e-7);
					}, 1e3);
					else refresh(false, ratio);
				}
				isFirstUpdate = false;
			}
			try {
				io = new IntersectionObserver(handleObserve, {
					...options,
					root: root.ownerDocument
				});
			} catch (_e) {
				io = new IntersectionObserver(handleObserve, options);
			}
			io.observe(element);
		}
		const win = getWindow(element);
		const handleResize = () => refresh(ancestorResize);
		win.addEventListener("resize", handleResize);
		refresh(true);
		return () => {
			win.removeEventListener("resize", handleResize);
			cleanup();
		};
	}
	/**
	* Automatically updates the position of the floating element when necessary.
	* Should only be called when the floating element is mounted on the DOM or
	* visible on the screen.
	* @returns cleanup function that should be invoked when the floating element is
	* removed from the DOM or hidden from the screen.
	* @see https://floating-ui.com/docs/autoUpdate
	*/
	function autoUpdate(reference, floating, update, options) {
		if (options === void 0) options = {};
		const { ancestorScroll = true, ancestorResize = true, elementResize = typeof ResizeObserver === "function", layoutShift = typeof IntersectionObserver === "function", animationFrame = false } = options;
		const referenceEl = unwrapElement(reference);
		const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...floating ? getOverflowAncestors(floating) : []] : [];
		ancestors.forEach((ancestor) => {
			ancestorScroll && ancestor.addEventListener("scroll", update);
			ancestorResize && ancestor.addEventListener("resize", update);
		});
		const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update, ancestorResize) : null;
		let reobserveFrame = -1;
		let resizeObserver = null;
		if (elementResize) {
			resizeObserver = new ResizeObserver((_ref) => {
				let [firstEntry] = _ref;
				if (firstEntry && firstEntry.target === referenceEl && resizeObserver && floating) {
					resizeObserver.unobserve(floating);
					cancelAnimationFrame(reobserveFrame);
					reobserveFrame = requestAnimationFrame(() => {
						var _resizeObserver;
						(_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
					});
				}
				update();
			});
			if (referenceEl && !animationFrame) resizeObserver.observe(referenceEl);
			if (floating) resizeObserver.observe(floating);
		}
		let frameId;
		let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
		if (animationFrame) frameLoop();
		function frameLoop() {
			const nextRefRect = getBoundingClientRect(reference);
			if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) update();
			prevRefRect = nextRefRect;
			frameId = requestAnimationFrame(frameLoop);
		}
		update();
		return () => {
			var _resizeObserver2;
			ancestors.forEach((ancestor) => {
				ancestorScroll && ancestor.removeEventListener("scroll", update);
				ancestorResize && ancestor.removeEventListener("resize", update);
			});
			cleanupIo?.();
			(_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
			resizeObserver = null;
			if (animationFrame) cancelAnimationFrame(frameId);
		};
	}
	/**
	* Modifies the placement by translating the floating element along the
	* specified axes.
	* A number (shorthand for `mainAxis` or distance), or an axes configuration
	* object may be passed.
	* @see https://floating-ui.com/docs/offset
	*/
	const offset$2 = offset$1;
	/**
	* Optimizes the visibility of the floating element by shifting it in order to
	* keep it in view when it will overflow the clipping boundary.
	* @see https://floating-ui.com/docs/shift
	*/
	const shift$2 = shift$1;
	/**
	* Optimizes the visibility of the floating element by flipping the `placement`
	* in order to keep it in view when the preferred placement(s) will overflow the
	* clipping boundary. Alternative to `autoPlacement`.
	* @see https://floating-ui.com/docs/flip
	*/
	const flip$2 = flip$1;
	/**
	* Provides data that allows you to change the size of the floating element —
	* for instance, prevent it from overflowing the clipping boundary or match the
	* width of the reference element.
	* @see https://floating-ui.com/docs/size
	*/
	const size$2 = size$1;
	/**
	* Built-in `limiter` that will stop `shift()` at a certain point.
	*/
	const limitShift$2 = limitShift$1;
	/**
	* Computes the `x` and `y` coordinates that will place the floating element
	* next to a given reference element.
	*/
	const computePosition = (reference, floating, options) => {
		const cache = /* @__PURE__ */ new Map();
		const mergedOptions = options != null ? options : {};
		const platformWithCache = {
			...platform,
			...mergedOptions.platform,
			_c: cache
		};
		return computePosition$1(reference, floating, {
			...mergedOptions,
			platform: platformWithCache
		});
	};

// node_modules/.store/@floating-ui/react-dom@2.1.9-AxWcAwqlMfOrAFOinFKSVg/node_modules/@floating-ui/react-dom/dist/floating-ui.react-dom.mjs
	var index = typeof document !== "undefined" ? react.useLayoutEffect : function noop() {};
	function deepEqual(a, b) {
		if (a === b) return true;
		if (typeof a !== typeof b) return false;
		if (typeof a === "function" && a.toString() === b.toString()) return true;
		let length;
		let i;
		let keys;
		if (a && b && typeof a === "object") {
			if (Array.isArray(a)) {
				length = a.length;
				if (length !== b.length) return false;
				for (i = length; i-- !== 0;) if (!deepEqual(a[i], b[i])) return false;
				return true;
			}
			keys = Object.keys(a);
			length = keys.length;
			if (length !== Object.keys(b).length) return false;
			for (i = length; i-- !== 0;) if (!{}.hasOwnProperty.call(b, keys[i])) return false;
			for (i = length; i-- !== 0;) {
				const key = keys[i];
				if (key === "_owner" && a.$$typeof) continue;
				if (!deepEqual(a[key], b[key])) return false;
			}
			return true;
		}
		return a !== a && b !== b;
	}
	function getDPR(element) {
		if (typeof window === "undefined") return 1;
		return (element.ownerDocument.defaultView || window).devicePixelRatio || 1;
	}
	function roundByDPR(element, value) {
		const dpr = getDPR(element);
		return Math.round(value * dpr) / dpr;
	}
	function useLatestRef(value) {
		const ref = react.useRef(value);
		index(() => {
			ref.current = value;
		});
		return ref;
	}
	/**
	* Provides data to position a floating element.
	* @see https://floating-ui.com/docs/useFloating
	*/
	function useFloating(options) {
		if (options === void 0) options = {};
		const { placement = "bottom", strategy = "absolute", middleware = [], platform, elements: { reference: externalReference, floating: externalFloating } = {}, transform = true, whileElementsMounted, open } = options;
		const [data, setData] = react.useState({
			x: 0,
			y: 0,
			strategy,
			placement,
			middlewareData: {},
			isPositioned: false
		});
		const [latestMiddleware, setLatestMiddleware] = react.useState(middleware);
		if (!deepEqual(latestMiddleware, middleware)) setLatestMiddleware(middleware);
		const [_reference, _setReference] = react.useState(null);
		const [_floating, _setFloating] = react.useState(null);
		const setReference = react.useCallback((node) => {
			if (node !== referenceRef.current) {
				referenceRef.current = node;
				_setReference(node);
			}
		}, []);
		const setFloating = react.useCallback((node) => {
			if (node !== floatingRef.current) {
				floatingRef.current = node;
				_setFloating(node);
			}
		}, []);
		const referenceEl = externalReference || _reference;
		const floatingEl = externalFloating || _floating;
		const referenceRef = react.useRef(null);
		const floatingRef = react.useRef(null);
		const dataRef = react.useRef(data);
		const hasWhileElementsMounted = whileElementsMounted != null;
		const whileElementsMountedRef = useLatestRef(whileElementsMounted);
		const platformRef = useLatestRef(platform);
		const openRef = useLatestRef(open);
		const update = react.useCallback(() => {
			if (!referenceRef.current || !floatingRef.current) return;
			const config = {
				placement,
				strategy,
				middleware: latestMiddleware
			};
			if (platformRef.current) config.platform = platformRef.current;
			computePosition(referenceRef.current, floatingRef.current, config).then((data) => {
				const fullData = {
					...data,
					isPositioned: openRef.current !== false
				};
				if (isMountedRef.current && !deepEqual(dataRef.current, fullData)) {
					dataRef.current = fullData;
					react_dom.flushSync(() => {
						setData(fullData);
					});
				}
			});
		}, [
			latestMiddleware,
			placement,
			strategy,
			platformRef,
			openRef
		]);
		index(() => {
			if (open === false && dataRef.current.isPositioned) {
				dataRef.current.isPositioned = false;
				setData((data) => ({
					...data,
					isPositioned: false
				}));
			}
		}, [open]);
		const isMountedRef = react.useRef(false);
		index(() => {
			isMountedRef.current = true;
			return () => {
				isMountedRef.current = false;
			};
		}, []);
		index(() => {
			if (referenceEl) referenceRef.current = referenceEl;
			if (floatingEl) floatingRef.current = floatingEl;
			if (referenceEl && floatingEl) {
				if (whileElementsMountedRef.current) return whileElementsMountedRef.current(referenceEl, floatingEl, update);
				update();
			}
		}, [
			referenceEl,
			floatingEl,
			update,
			whileElementsMountedRef,
			hasWhileElementsMounted
		]);
		const refs = react.useMemo(() => ({
			reference: referenceRef,
			floating: floatingRef,
			setReference,
			setFloating
		}), [setReference, setFloating]);
		const elements = react.useMemo(() => ({
			reference: referenceEl,
			floating: floatingEl
		}), [referenceEl, floatingEl]);
		const floatingStyles = react.useMemo(() => {
			const initialStyles = {
				position: strategy,
				left: 0,
				top: 0
			};
			if (!elements.floating) return initialStyles;
			const x = roundByDPR(elements.floating, data.x);
			const y = roundByDPR(elements.floating, data.y);
			if (transform) return {
				...initialStyles,
				transform: "translate(" + x + "px, " + y + "px)",
				...getDPR(elements.floating) >= 1.5 && { willChange: "transform" }
			};
			return {
				position: strategy,
				left: x,
				top: y
			};
		}, [
			strategy,
			transform,
			elements.floating,
			data.x,
			data.y
		]);
		return react.useMemo(() => ({
			...data,
			update,
			refs,
			elements,
			floatingStyles
		}), [
			data,
			update,
			refs,
			elements,
			floatingStyles
		]);
	}
	/**
	* Modifies the placement by translating the floating element along the
	* specified axes.
	* A number (shorthand for `mainAxis` or distance), or an axes configuration
	* object may be passed.
	* @see https://floating-ui.com/docs/offset
	*/
	const offset = (options, deps) => {
		const result = offset$2(options);
		return {
			name: result.name,
			fn: result.fn,
			options: [options, deps]
		};
	};
	/**
	* Optimizes the visibility of the floating element by shifting it in order to
	* keep it in view when it will overflow the clipping boundary.
	* @see https://floating-ui.com/docs/shift
	*/
	const shift = (options, deps) => {
		const result = shift$2(options);
		return {
			name: result.name,
			fn: result.fn,
			options: [options, deps]
		};
	};
	/**
	* Built-in `limiter` that will stop `shift()` at a certain point.
	*/
	const limitShift = (options, deps) => {
		return {
			fn: limitShift$2(options).fn,
			options: [options, deps]
		};
	};
	/**
	* Optimizes the visibility of the floating element by flipping the `placement`
	* in order to keep it in view when the preferred placement(s) will overflow the
	* clipping boundary. Alternative to `autoPlacement`.
	* @see https://floating-ui.com/docs/flip
	*/
	const flip = (options, deps) => {
		const result = flip$2(options);
		return {
			name: result.name,
			fn: result.fn,
			options: [options, deps]
		};
	};
	/**
	* Provides data that allows you to change the size of the floating element —
	* for instance, prevent it from overflowing the clipping boundary or match the
	* width of the reference element.
	* @see https://floating-ui.com/docs/size
	*/
	const size = (options, deps) => {
		const result = size$2(options);
		return {
			name: result.name,
			fn: result.fn,
			options: [options, deps]
		};
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/direction-context/DirectionContext.mjs
	const DirectionContext = /*#__PURE__*/ react.createContext(void 0);
	DirectionContext.displayName = "DirectionContext";
	function useDirection() {
		return react.useContext(DirectionContext)?.direction ?? "ltr";
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useFloating.mjs
/**
	* Provides data to position a floating element and context to add interactions.
	* The caller supplies the root store, which owns the reference and floating elements.
	* @see https://floating-ui.com/docs/useFloating
	*/
	function useBaseUIFloating(options) {
		const { nodeId, externalTree, rootContext: store } = options;
		const referenceElement = store.useState("referenceElement");
		const floatingElement = store.useState("floatingElement");
		const domReferenceElement = store.useState("domReferenceElement");
		const open = store.useState("open");
		const floatingId = store.useState("floatingId");
		const [positionReference, setPositionReferenceRaw] = react.useState(null);
		const domReferenceRef = react.useRef(null);
		const tree = useFloatingTree(externalTree);
		const storeElements = react.useMemo(() => ({
			reference: referenceElement,
			floating: floatingElement,
			domReference: domReferenceElement
		}), [
			referenceElement,
			floatingElement,
			domReferenceElement
		]);
		const position = useFloating({
			...options,
			elements: {
				...storeElements,
				...positionReference && { reference: positionReference }
			}
		});
		const setPositionReference = react.useCallback((node) => {
			const computedPositionReference = isElement(node) ? {
				getBoundingClientRect: () => node.getBoundingClientRect(),
				getClientRects: () => node.getClientRects(),
				contextElement: node
			} : node;
			setPositionReferenceRaw(computedPositionReference);
			position.refs.setReference(computedPositionReference);
		}, [position.refs]);
		const refs = react.useMemo(() => ({
			...position.refs,
			setPositionReference,
			domReference: domReferenceRef
		}), [position.refs, setPositionReference]);
		const elements = react.useMemo(() => ({
			...position.elements,
			domReference: domReferenceElement
		}), [position.elements, domReferenceElement]);
		const context = react.useMemo(() => ({
			...position,
			dataRef: store.context.dataRef,
			open,
			onOpenChange: store.setOpen,
			events: store.context.events,
			floatingId,
			refs,
			elements,
			nodeId,
			rootStore: store
		}), [
			position,
			refs,
			elements,
			nodeId,
			store,
			open,
			floatingId
		]);
		useIsoLayoutEffect(() => {
			if (domReferenceElement) domReferenceRef.current = domReferenceElement;
		}, [domReferenceElement]);
		useIsoLayoutEffect(() => {
			store.context.dataRef.current.floatingContext = context;
			const node = tree?.nodesRef.current.find((n) => n.id === nodeId);
			if (node) node.context = context;
		});
		return react.useMemo(() => ({
			...position,
			context,
			refs,
			elements,
			rootStore: store
		}), [
			position,
			refs,
			elements,
			context,
			store
		]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/middleware/arrow.mjs
/**
	* Fork of the original `arrow` middleware from Floating UI that always uses the floating element
	* as the arrow's offset parent.
	*/
	const baseArrow = (options) => ({
		name: "arrow",
		options,
		async fn(state) {
			const { x, y, placement, rects, platform, elements, middlewareData } = state;
			const { element, padding = 0 } = evaluate(options, state) || {};
			if (element == null) return {};
			const paddingObject = getPaddingObject(padding);
			const coords = {
				x,
				y
			};
			const axis = getAlignmentAxis(placement);
			const length = getAxisLength(axis);
			const arrowDimensions = await platform.getDimensions(element);
			const isYAxis = axis === "y";
			const minProp = isYAxis ? "top" : "left";
			const maxProp = isYAxis ? "bottom" : "right";
			const clientProp = isYAxis ? "clientHeight" : "clientWidth";
			const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
			const startDiff = coords[axis] - rects.reference[axis];
			const clientSize = elements.floating[clientProp] || rects.floating[length];
			const centerToReference = endDiff / 2 - startDiff / 2;
			const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
			const minPadding = Math.min(paddingObject[minProp], largestPossiblePadding);
			const maxPadding = Math.min(paddingObject[maxProp], largestPossiblePadding);
			const min = minPadding;
			const max = clientSize - arrowDimensions[length] - maxPadding;
			const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
			const offset = clamp(min, center, max);
			const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset && rects.reference[length] / 2 - (center < min ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
			const alignmentOffset = shouldAddOffset ? center < min ? center - min : center - max : 0;
			return {
				[axis]: coords[axis] + alignmentOffset,
				data: {
					[axis]: offset,
					centerOffset: center - offset - alignmentOffset,
					...shouldAddOffset && { alignmentOffset }
				},
				reset: shouldAddOffset
			};
		}
	});
	/**
	* Provides data to position an inner element of the floating element so that it
	* appears centered to the reference element.
	* This wraps the core `arrow` middleware to allow React refs as the element.
	* @see https://floating-ui.com/docs/arrow
	*/
	const arrow = (options, deps) => {
		const { name, fn } = baseArrow(options);
		return {
			name,
			fn,
			options: [options, deps]
		};
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/hideMiddleware.mjs
	const hide = {
		name: "hide",
		async fn(state) {
			const { width, height, x, y } = state.rects.reference;
			const anchorHidden = width === 0 && height === 0 && x === 0 && y === 0;
			const overflow = await state.platform.detectOverflow(state, { elementContext: "reference" });
			return { data: { referenceHidden: overflow.top - height >= 0 || overflow.right - width >= 0 || overflow.bottom - height >= 0 || overflow.left - width >= 0 || anchorHidden } };
		}
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/adaptiveOriginConstants.mjs
	const DEFAULT_SIDES = {
		sideX: "left",
		sideY: "top"
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/CommonPositionerCssVars.mjs
/**
	* The available width between the trigger and the edge of the viewport.
	* @type {number}
	*/
	const availableWidth = "--available-width";
	/**
	* The available height between the trigger and the edge of the viewport.
	* @type {number}
	*/
	const availableHeight = "--available-height";
	/**
	* The anchor's width.
	* @type {number}
	*/
	const anchorWidth = "--anchor-width";
	/**
	* The anchor's height.
	* @type {number}
	*/
	const anchorHeight = "--anchor-height";
	/**
	* The coordinates that this element is anchored to. Used for animations and transitions.
	* @type {string}
	*/
	const transformOrigin = "--transform-origin";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/useAnchorPositioning.mjs
	const AVAILABLE_WIDTH_VAR = availableWidth;
	const AVAILABLE_HEIGHT_VAR = availableHeight;
	function getLogicalSide(sideParam, renderedSide, isRtl) {
		const isLogicalSideParam = sideParam === "inline-start" || sideParam === "inline-end";
		return {
			top: "top",
			right: isLogicalSideParam ? isRtl ? "inline-start" : "inline-end" : "right",
			bottom: "bottom",
			left: isLogicalSideParam ? isRtl ? "inline-end" : "inline-start" : "left"
		}[renderedSide];
	}
	function getOffsetData(state, sideParam, isRtl) {
		const { rects, placement } = state;
		return {
			side: getLogicalSide(sideParam, getSide(placement), isRtl),
			align: getAlignment(placement) || "center",
			anchor: {
				width: rects.reference.width,
				height: rects.reference.height
			},
			positioner: {
				width: rects.floating.width,
				height: rects.floating.height
			}
		};
	}
	/**
	* Provides standardized anchor positioning behavior for floating elements. Wraps Floating UI's
	* `useFloating` hook.
	*/
	function useAnchorPositioning(params) {
		return useAnchorPositioningWithHook(params, useBaseUIFloating);
	}
	function useAnchorPositioningWithHook(params, useFloatingHook) {
		const { anchor, positionMethod = "absolute", side: sideParam = "bottom", sideOffset = 0, align = "center", alignOffset = 0, collisionBoundary, collisionPadding: collisionPaddingParam = 5, sticky = false, arrowPadding = 5, disableAnchorTracking = false, inline: inlineMiddleware, keepMounted = false, floatingRootContext, mounted, collisionAvoidance, shift: shift$3, nodeId, adaptiveOrigin, lazyFlip = false, externalTree } = params;
		const collisionAvoidanceSide = collisionAvoidance.side || "flip";
		const collisionAvoidanceAlign = collisionAvoidance.align || "flip";
		const collisionAvoidanceFallbackAxisSide = collisionAvoidance.fallbackAxisSide || "end";
		const shiftCrossAxis = shift$3?.crossAxis ?? false;
		const shiftRootBoundary = shift$3?.rootBoundary;
		const anchorFn = typeof anchor === "function" ? anchor : void 0;
		const anchorFnCallback = useStableCallback(anchorFn);
		const anchorDep = anchorFn ? anchorFnCallback : anchor;
		const anchorValueRef = useValueAsRef(anchor);
		const mountedRef = useValueAsRef(mounted);
		const isRtl = useDirection() === "rtl";
		const [mountPlacement, setMountPlacement] = react.useState(null);
		if (!mounted && mountPlacement !== null) setMountPlacement(null);
		const lockAlign = lazyFlip === "placement";
		const mountSide = mountPlacement ? getSide(mountPlacement) : null;
		const mountAlign = mountPlacement && lockAlign ? getAlignment(mountPlacement) || "center" : null;
		const side = mountSide || {
			top: "top",
			right: "right",
			bottom: "bottom",
			left: "left",
			"inline-end": isRtl ? "left" : "right",
			"inline-start": isRtl ? "right" : "left"
		}[sideParam];
		const placementAlign = mountAlign || align;
		const placement = placementAlign === "center" ? side : `${side}-${placementAlign}`;
		let collisionPadding = collisionPaddingParam;
		if (typeof collisionPadding === "number") collisionPadding = {
			top: collisionPadding,
			right: collisionPadding,
			bottom: collisionPadding,
			left: collisionPadding
		};
		else if (collisionPadding) collisionPadding = {
			top: collisionPadding.top || 0,
			right: collisionPadding.right || 0,
			bottom: collisionPadding.bottom || 0,
			left: collisionPadding.left || 0
		};
		const bias = 1;
		const biasTop = sideParam === "bottom" ? bias : 0;
		const biasBottom = sideParam === "top" ? bias : 0;
		const biasLeft = sideParam === "right" ? bias : 0;
		const biasRight = sideParam === "left" ? bias : 0;
		const commonCollisionProps = {
			boundary: collisionBoundary === "clipping-ancestors" ? "clippingAncestors" : collisionBoundary,
			padding: collisionPadding
		};
		const arrowRef = react.useRef(null);
		const sideOffsetRef = useValueAsRef(sideOffset);
		const alignOffsetRef = useValueAsRef(alignOffset);
		const sideOffsetDep = typeof sideOffset !== "function" ? sideOffset : 0;
		const alignOffsetDep = typeof alignOffset !== "function" ? alignOffset : 0;
		const middleware = [];
		if (inlineMiddleware) middleware.push(inlineMiddleware);
		middleware.push(offset((state) => {
			const data = getOffsetData(state, sideParam, isRtl);
			const sideAxis = typeof sideOffsetRef.current === "function" ? sideOffsetRef.current(data) : sideOffsetRef.current;
			const alignAxis = typeof alignOffsetRef.current === "function" ? alignOffsetRef.current(data) : alignOffsetRef.current;
			return {
				mainAxis: sideAxis,
				crossAxis: alignAxis,
				alignmentAxis: alignAxis
			};
		}, [
			sideOffsetDep,
			alignOffsetDep,
			isRtl,
			sideParam
		]));
		const shiftDisabled = collisionAvoidanceAlign === "none" && collisionAvoidanceSide !== "shift";
		const crossAxisShiftEnabled = !shiftDisabled && (sticky || shiftCrossAxis || collisionAvoidanceSide === "shift");
		const flipMiddleware = collisionAvoidanceSide === "none" ? null : flip({
			...commonCollisionProps,
			padding: {
				top: collisionPadding.top + bias + biasTop,
				right: collisionPadding.right + bias + biasRight,
				bottom: collisionPadding.bottom + bias + biasBottom,
				left: collisionPadding.left + bias + biasLeft
			},
			mainAxis: !shiftCrossAxis && collisionAvoidanceSide === "flip",
			crossAxis: collisionAvoidanceAlign === "flip" ? "alignment" : false,
			fallbackAxisSideDirection: collisionAvoidanceFallbackAxisSide
		});
		const shiftMiddleware = shiftDisabled ? null : shift({
			...commonCollisionProps,
			rootBoundary: shiftRootBoundary,
			mainAxis: collisionAvoidanceAlign !== "none",
			crossAxis: crossAxisShiftEnabled,
			limiter: sticky || shiftCrossAxis ? void 0 : limitShift((limitData) => {
				if (!arrowRef.current) return {};
				const { width, height } = arrowRef.current.getBoundingClientRect();
				const sideAxis = getSideAxis(getSide(limitData.placement));
				const arrowSize = sideAxis === "y" ? width : height;
				const offsetAmount = sideAxis === "y" ? collisionPadding.left + collisionPadding.right : collisionPadding.top + collisionPadding.bottom;
				return { offset: arrowSize / 2 + offsetAmount / 2 };
			})
		}, [
			commonCollisionProps,
			sticky,
			shiftCrossAxis,
			shiftRootBoundary,
			collisionPadding,
			collisionAvoidanceAlign
		]);
		if (collisionAvoidanceSide === "shift" || collisionAvoidanceAlign === "shift" || placementAlign === "center") middleware.push(shiftMiddleware, flipMiddleware);
		else middleware.push(flipMiddleware, shiftMiddleware);
		middleware.push(size({
			...commonCollisionProps,
			apply({ elements: { floating }, availableWidth, availableHeight, rects }) {
				if (!mountedRef.current) return;
				const floatingStyle = floating.style;
				floatingStyle.setProperty(AVAILABLE_WIDTH_VAR, `${availableWidth}px`);
				floatingStyle.setProperty(AVAILABLE_HEIGHT_VAR, `${availableHeight}px`);
				const dpr = getWindow(floating).devicePixelRatio || 1;
				const { x, y, width, height } = rects.reference;
				const anchorWidth$1 = (Math.round((x + width) * dpr) - Math.round(x * dpr)) / dpr;
				const anchorHeight$1 = (Math.round((y + height) * dpr) - Math.round(y * dpr)) / dpr;
				floatingStyle.setProperty(anchorWidth, `${anchorWidth$1}px`);
				floatingStyle.setProperty(anchorHeight, `${anchorHeight$1}px`);
			}
		}), arrow((state) => ({
			element: arrowRef.current || ownerDocument(state.elements.floating).createElement("div"),
			padding: arrowRef.current ? arrowPadding : 0
		}), [arrowPadding]), {
			name: "transformOrigin",
			fn(state) {
				const { elements: { floating }, middlewareData, placement: renderedPlacement, platform, rects, y } = state;
				const renderedSide = getSide(renderedPlacement);
				const renderedAlign = getAlignment(renderedPlacement);
				const isVertical = getSideAxis(renderedSide) === "y";
				const arrowEl = arrowRef.current;
				const sideOffsetValue = typeof sideOffset === "function" ? sideOffset(getOffsetData(state, sideParam, isRtl)) : sideOffset;
				let crossOrigin;
				if (!arrowEl && renderedAlign && Math.abs(isVertical ? middlewareData.shift?.x || 0 : middlewareData.shift?.y || 0) <= 1) crossOrigin = renderedAlign === "start" === (isVertical && platform.isRTL?.(floating) === true) ? "100%" : "0%";
				else crossOrigin = `${(isVertical ? middlewareData.arrow?.x || 0 : middlewareData.arrow?.y || 0) + (isVertical ? arrowEl?.clientWidth || 0 : arrowEl?.clientHeight || 0) / 2}px`;
				let sideOrigin = renderedSide === "top" || renderedSide === "left" ? `calc(100% + ${sideOffsetValue}px)` : `${-sideOffsetValue}px`;
				if (crossAxisShiftEnabled && isVertical && Math.abs(middlewareData.shift?.y || 0) > sideOffsetValue) sideOrigin = `${rects.reference.y + rects.reference.height / 2 - y}px`;
				floating.style.setProperty(transformOrigin, isVertical ? `${crossOrigin} ${sideOrigin}` : `${sideOrigin} ${crossOrigin}`);
				return {};
			}
		}, hide, adaptiveOrigin);
		useIsoLayoutEffect(() => {
			if (!mounted && floatingRootContext) floatingRootContext.update({
				referenceElement: null,
				floatingElement: null,
				domReferenceElement: null,
				positionReference: null
			});
		}, [mounted, floatingRootContext]);
		const autoUpdateOptions = react.useMemo(() => ({
			ancestorScroll: !disableAnchorTracking,
			elementResize: !disableAnchorTracking && typeof ResizeObserver !== "undefined",
			layoutShift: !disableAnchorTracking && typeof IntersectionObserver !== "undefined"
		}), [disableAnchorTracking]);
		const { refs, elements, x, y, middlewareData, update, placement: renderedPlacement, context, isPositioned, floatingStyles: originalFloatingStyles } = useFloatingHook({
			rootContext: floatingRootContext,
			open: keepMounted ? mounted : void 0,
			placement,
			middleware,
			strategy: positionMethod,
			whileElementsMounted: keepMounted ? void 0 : (...args) => autoUpdate(...args, autoUpdateOptions),
			nodeId,
			externalTree
		});
		const { sideX, sideY } = middlewareData.adaptiveOrigin || DEFAULT_SIDES;
		const resolvedPosition = isPositioned ? positionMethod : "fixed";
		const floatingStyles = react.useMemo(() => {
			let base;
			if (!isPositioned) base = {
				position: resolvedPosition,
				top: 0,
				left: 0
			};
			else if (adaptiveOrigin) base = {
				position: resolvedPosition,
				[sideX]: x,
				[sideY]: y
			};
			else base = {
				...originalFloatingStyles,
				position: resolvedPosition
			};
			base[AVAILABLE_WIDTH_VAR] = "100vw";
			base[AVAILABLE_HEIGHT_VAR] = "100vh";
			if (!isPositioned) base.opacity = 0;
			return base;
		}, [
			adaptiveOrigin,
			resolvedPosition,
			sideX,
			x,
			sideY,
			y,
			originalFloatingStyles,
			isPositioned
		]);
		const registeredPositionReferenceRef = react.useRef(null);
		useIsoLayoutEffect(() => {
			if (!mounted) return;
			const anchorValue = anchorValueRef.current;
			const resolvedAnchor = typeof anchorValue === "function" ? anchorValue() : anchorValue;
			const finalAnchor = (isRef(resolvedAnchor) ? resolvedAnchor.current : resolvedAnchor) || null;
			if (finalAnchor !== registeredPositionReferenceRef.current) {
				refs.setPositionReference(finalAnchor);
				registeredPositionReferenceRef.current = finalAnchor;
			}
		}, [
			mounted,
			refs,
			anchorDep,
			anchorValueRef
		]);
		react.useEffect(() => {
			if (!mounted) return;
			const anchorValue = anchorValueRef.current;
			if (typeof anchorValue === "function") return;
			if (isRef(anchorValue) && anchorValue.current !== registeredPositionReferenceRef.current) {
				refs.setPositionReference(anchorValue.current);
				registeredPositionReferenceRef.current = anchorValue.current;
			}
		}, [
			mounted,
			refs,
			anchorDep,
			anchorValueRef
		]);
		react.useEffect(() => {
			if (keepMounted && mounted && elements.reference && elements.floating) return autoUpdate(elements.reference, elements.floating, update, autoUpdateOptions);
		}, [
			keepMounted,
			mounted,
			elements,
			update,
			autoUpdateOptions
		]);
		const renderedSide = getSide(renderedPlacement);
		const logicalRenderedSide = getLogicalSide(sideParam, renderedSide, isRtl);
		const renderedAlign = getAlignment(renderedPlacement) || "center";
		const anchorHidden = Boolean(middlewareData.hide?.referenceHidden);
		useIsoLayoutEffect(() => {
			if (lazyFlip && mounted && isPositioned && (renderedSide !== side || lockAlign && renderedAlign !== placementAlign)) setMountPlacement(renderedPlacement);
		}, [
			lazyFlip,
			lockAlign,
			mounted,
			isPositioned,
			renderedPlacement,
			renderedSide,
			renderedAlign,
			side,
			placementAlign
		]);
		const arrowStyles = react.useMemo(() => ({
			position: "absolute",
			top: middlewareData.arrow?.y,
			left: middlewareData.arrow?.x
		}), [middlewareData.arrow]);
		const arrowUncentered = middlewareData.arrow?.centerOffset !== 0;
		return react.useMemo(() => ({
			positionerStyles: floatingStyles,
			arrowStyles,
			arrowRef,
			arrowUncentered,
			side: logicalRenderedSide,
			align: renderedAlign,
			physicalSide: renderedSide,
			anchorHidden,
			refs,
			context,
			isPositioned,
			update
		}), [
			floatingStyles,
			arrowStyles,
			arrowRef,
			arrowUncentered,
			logicalRenderedSide,
			renderedAlign,
			renderedSide,
			anchorHidden,
			refs,
			context,
			isPositioned,
			update
		]);
	}
	function isRef(param) {
		return param != null && "current" in param;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/getDisabledMountTransitionStyles.mjs
	function getDisabledMountTransitionStyles(transitionStatus) {
		return transitionStatus === "starting" ? DISABLED_TRANSITIONS_STYLE : EMPTY_OBJECT$1;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/usePositioner.mjs
/**
	* Renders the shared outer Positioner element used by popup components.
	* Applies the common role, hidden state, transition styles, state attributes, and optional inert styling.
	*/
	function usePositioner(componentProps, state, { styles, transitionStatus, props, refs, hidden, inert = false }) {
		const style = { ...styles };
		if (inert) style.pointerEvents = "none";
		return useRenderElement("div", componentProps, {
			state,
			ref: refs,
			props: [
				{
					role: "presentation",
					hidden,
					style
				},
				getDisabledMountTransitionStyles(transitionStatus),
				props
			],
			stateAttributesMapping: popupStateMapping
		});
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/direction-provider/DirectionProvider.mjs
/**
	* Enables RTL behavior for Base UI components.
	*
	* Documentation: [Base UI Direction Provider](https://base-ui.com/react/utils/direction-provider)
	*/
	const DirectionProvider$1 = function DirectionProvider(props) {
		const { direction = "ltr" } = props;
		const contextValue = react.useMemo(() => ({ direction }), [direction]);
		return /*#__PURE__*/ (0, react_jsx_runtime.jsx)(DirectionContext.Provider, {
			value: contextValue,
			children: props.children
		});
	};
	DirectionProvider$1.displayName = "DirectionProvider";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/FloatingPortalLite.mjs
/**
	* `FloatingPortal` includes tabbable logic handling for focus management.
	* For components that don't need tabbable logic, use `FloatingPortalLite`.
	* @internal
	*/
	const FloatingPortalLite = /*#__PURE__*/ react.forwardRef(function FloatingPortalLite(componentProps, forwardedRef) {
		const { children, container, className, render, style, ...elementProps } = componentProps;
		const { node: portalNode, subtree: portalSubtree } = useFloatingPortalNode({
			container,
			ref: forwardedRef,
			componentProps,
			elementProps
		});
		if (!portalSubtree && !portalNode) return null;
		return /*#__PURE__*/ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [portalSubtree, portalNode && /*#__PURE__*/ react_dom.createPortal(children, portalNode)] });
	});
	FloatingPortalLite.displayName = "FloatingPortalLite";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/root/TooltipRootContext.mjs
	const TooltipRootContext = /*#__PURE__*/ react.createContext(void 0);
	TooltipRootContext.displayName = "TooltipRootContext";
	function useTooltipRootContext(optional) {
		const context = react.useContext(TooltipRootContext);
		if (context === void 0 && !optional) throw new Error("Base UI: TooltipRootContext is missing. Tooltip parts must be placed within <Tooltip.Root>.");
		return context;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/store/TooltipStore.mjs
	const selectors = {
		...popupStoreSelectors,
		disabled: (state) => state.disabled,
		instantType: (state) => state.instantType,
		isInstantPhase: (state) => state.isInstantPhase,
		trackCursorAxis: (state) => state.trackCursorAxis,
		disableHoverablePopup: (state) => state.disableHoverablePopup,
		lastOpenChangeReason: (state) => state.openChangeReason,
		closeOnClick: (state) => state.closeOnClick,
		appliedTriggerProps: (state, apply) => apply ? state.activeTriggerProps : void 0,
		closeDelay: (state) => state.closeDelay,
		adaptiveOrigin: (state) => state.adaptiveOrigin
	};
	/**
	* The store view that detached handle-backed triggers read from. Both the real `TooltipStore` and
	* the inert fallback store satisfy it, so a trigger can read from whichever store the handle
	* currently exposes. Narrowed to the members a trigger actually uses — the trigger-data members plus
	* `setOpen`/`cancelPendingOpen` (called directly by the trigger) and `useSyncedValue` — so the
	* exposed surface can't bypass the open-change pipeline; on the detached fallback store every one of
	* these mutations is a no-op.
	*/
	var TooltipStore = class extends ReactStore {
		constructor(initialState, floatingId, nested) {
			const triggerElements = new PopupTriggerMap();
			super(createInitialState(initialState, triggerElements, floatingId, nested), createInitialContext(triggerElements), selectors);
		}
		setOpen = (nextOpen, eventDetails) => {
			applyPopupOpenChange(this, nextOpen, eventDetails, { extraState: { openChangeReason: eventDetails.reason } });
		};
		cancelPendingOpen(event) {
			this.state.floatingRootContext.dispatchOpenChange(false, createChangeEventDetails(triggerPress, event));
		}
	};
	function createInitialState(initialState, triggerElements, floatingId, nested = false) {
		return {
			...createInitialPopupStoreState(triggerElements, floatingId, nested),
			disabled: false,
			instantType: void 0,
			isInstantPhase: false,
			trackCursorAxis: "none",
			disableHoverablePopup: false,
			openChangeReason: null,
			closeOnClick: true,
			closeDelay: 0,
			adaptiveOrigin: void 0,
			...initialState
		};
	}
	function createInitialContext(triggerElements) {
		return {
			popupRef: /*#__PURE__*/ react.createRef(),
			onOpenChange: void 0,
			onOpenChangeComplete: void 0,
			triggerElements
		};
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/root/TooltipRoot.mjs
/**
	* Groups all parts of the tooltip.
	* Doesn't render its own HTML element.
	*
	* Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
	*/
	const TooltipRoot = fastComponent(function TooltipRoot(props) {
		const { disabled: disabled$1 = false, defaultOpen = false, open: openProp, disableHoverablePopup = false, trackCursorAxis = "none", actionsRef, onOpenChange, onOpenChangeComplete, handle, triggerId: triggerIdProp, defaultTriggerId: defaultTriggerIdProp = null, children } = props;
		const store = usePopupRootStore((floatingId, nested) => new TooltipStore({
			open: defaultOpen,
			openProp,
			activeTriggerId: defaultTriggerIdProp,
			triggerIdProp
		}, floatingId, nested));
		store.useControlledProp("openProp", openProp);
		store.useControlledProp("triggerIdProp", triggerIdProp);
		store.useContextCallback("onOpenChange", onOpenChange);
		store.useContextCallback("onOpenChangeComplete", onOpenChangeComplete);
		const openState = store.useState("open");
		const open = !disabled$1 && openState;
		const activeTriggerId = store.useState("activeTriggerId");
		const mounted = store.useState("mounted");
		const payload = store.useState("payload");
		store.useSyncedValues({
			trackCursorAxis,
			disableHoverablePopup,
			disabled: disabled$1
		});
		useImplicitActiveTrigger(store, { closeOnActiveTriggerUnmount: true });
		const { forceUnmount, transitionStatus } = useOpenStateTransitions(open, store);
		const isInstantPhase = store.useState("isInstantPhase");
		const instantType = store.useState("instantType");
		const lastOpenChangeReason = store.useState("lastOpenChangeReason");
		const previousInstantTypeRef = react.useRef(null);
		useIsoLayoutEffect(() => {
			if (openState && disabled$1) store.setOpen(false, createChangeEventDetails(disabled));
		}, [
			openState,
			disabled$1,
			store
		]);
		useIsoLayoutEffect(() => {
			if (transitionStatus === "ending" && lastOpenChangeReason === "none" || transitionStatus !== "ending" && isInstantPhase) {
				if (instantType !== "delay") previousInstantTypeRef.current = instantType;
				store.set("instantType", "delay");
			} else if (previousInstantTypeRef.current !== null) {
				store.set("instantType", previousInstantTypeRef.current);
				previousInstantTypeRef.current = null;
			}
		}, [
			transitionStatus,
			isInstantPhase,
			lastOpenChangeReason,
			instantType,
			store
		]);
		useIsoLayoutEffect(() => {
			if (open) {
				if (activeTriggerId == null) store.set("payload", void 0);
			}
		}, [
			store,
			activeTriggerId,
			open
		]);
		react.useImperativeHandle(actionsRef, () => ({
			unmount: forceUnmount,
			close: () => store.setOpen(false, createChangeEventDetails(imperativeAction))
		}), [forceUnmount, store]);
		const shouldRenderInteractions = open || mounted || !disabled$1 && trackCursorAxis !== "none";
		return /*#__PURE__*/ (0, react_jsx_runtime.jsxs)(TooltipRootContext.Provider, {
			value: store,
			children: [
				handle && /*#__PURE__*/ (0, react_jsx_runtime.jsx)(PopupHandleAttachment, {
					handle,
					store
				}),
				shouldRenderInteractions && /*#__PURE__*/ (0, react_jsx_runtime.jsx)(TooltipInteractions, {
					store,
					disabled: disabled$1,
					trackCursorAxis
				}),
				typeof children === "function" ? children({ payload }) : children
			]
		});
	});
	TooltipRoot.displayName = "TooltipRoot";
	function TooltipInteractions({ store, disabled, trackCursorAxis }) {
		const floatingRootContext = store.useState("floatingRootContext");
		const dismiss = useDismiss(floatingRootContext, {
			enabled: !disabled,
			referencePress: () => store.select("closeOnClick")
		});
		const clientPoint = useClientPoint(floatingRootContext, {
			enabled: !disabled && trackCursorAxis !== "none",
			axis: trackCursorAxis === "none" ? void 0 : trackCursorAxis
		});
		const triggerProps = react.useMemo(() => mergeProps(clientPoint.reference, dismiss.reference), [clientPoint.reference, dismiss.reference]);
		usePopupInteractionProps(store, {
			activeTriggerProps: triggerProps,
			inactiveTriggerProps: triggerProps,
			popupProps: dismiss.floating ?? EMPTY_OBJECT$1
		});
		return null;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/provider/TooltipProviderContext.mjs
/**
	* Holds the provider's `delay` value. `closeDelay` is handled by the delay group.
	*/
	const TooltipProviderContext = /*#__PURE__*/ react.createContext(void 0);
	TooltipProviderContext.displayName = "TooltipProviderContext";
	function useTooltipProviderContext() {
		return react.useContext(TooltipProviderContext);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/trigger/TooltipTrigger.mjs
	const TOOLTIP_TRIGGER_IDENTIFIER = "data-base-ui-tooltip-trigger";
	function getTargetElement(event) {
		const target = getTarget(event);
		return isElement(target) ? target : null;
	}
	/**
	* An element to attach the tooltip to.
	* Renders a `<button>` element.
	*
	* Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
	*/
	const TooltipTrigger = fastComponentRef(function TooltipTrigger(componentProps, forwardedRef) {
		const { render, className, style, handle, payload, disabled: disabledProp, delay, closeOnClick = true, closeDelay, id: idProp, ...elementProps } = componentProps;
		const rootContext = useTooltipRootContext(true);
		const store = usePopupHandleStore(handle) ?? rootContext;
		if (!store) throw new Error("Base UI: <Tooltip.Trigger> must be either used within a <Tooltip.Root> component or provided with a handle.");
		const thisTriggerId = useBaseUiId(idProp);
		const isTriggerActive = store.useState("isTriggerActive", thisTriggerId);
		const isOpenedByThisTrigger = store.useState("isOpenedByTrigger", thisTriggerId);
		const floatingRootContext = store.useState("floatingRootContext");
		const triggerElementRef = react.useRef(null);
		const closeDelayWithDefault = closeDelay ?? 0;
		const { registerTrigger, isMountedByThisTrigger } = useTriggerDataForwarding(thisTriggerId, triggerElementRef, store, {
			payload,
			closeOnClick,
			closeDelay: closeDelayWithDefault
		});
		const providerDelay = useTooltipProviderContext();
		const { activeIdRef, delayRef, isInstantPhase, hasProvider } = useDelayGroup(floatingRootContext, { open: isOpenedByThisTrigger });
		const hoverInteraction = useHoverInteractionSharedState(floatingRootContext);
		store.useSyncedValue("isInstantPhase", isInstantPhase);
		const rootDisabled = store.useState("disabled");
		const disabled = disabledProp ?? rootDisabled;
		const disabledRef = useValueAsRef(disabled);
		const trackCursorAxis = store.useState("trackCursorAxis");
		const disableHoverablePopup = store.useState("disableHoverablePopup");
		const isNestedTriggerHoveredRef = react.useRef(false);
		const nestedTriggerOpenTimeout = useTimeout();
		const pointerTypeRef = react.useRef(void 0);
		function getOpenDelay() {
			if (hasProvider && activeIdRef.current != null) return 0;
			return delay ?? providerDelay ?? 600;
		}
		function isEnabledNestedTriggerTarget(target) {
			const triggerEl = triggerElementRef.current;
			if (!triggerEl || !target) return false;
			const nearestTrigger = closest(target, `[${TOOLTIP_TRIGGER_IDENTIFIER}]`);
			return nearestTrigger !== null && nearestTrigger !== triggerEl && contains(triggerEl, nearestTrigger);
		}
		function detectNestedTriggerHover(target) {
			const nestedTriggerHovered = isEnabledNestedTriggerTarget(target);
			isNestedTriggerHoveredRef.current = nestedTriggerHovered;
			if (nestedTriggerHovered) {
				hoverInteraction.openChangeTimeout.clear();
				hoverInteraction.restTimeout.clear();
				hoverInteraction.restTimeoutPending = false;
				nestedTriggerOpenTimeout.clear();
			}
			return nestedTriggerHovered;
		}
		const hoverProps = useHoverReferenceInteraction(floatingRootContext, {
			enabled: !disabled,
			mouseOnly: true,
			move: false,
			handleClose: !disableHoverablePopup && trackCursorAxis !== "both" ? safePolygon() : null,
			restMs: getOpenDelay,
			delay() {
				if (closeDelay == null && hasProvider) return { close: getDelay(delayRef.current, "close") };
				return { close: closeDelayWithDefault };
			},
			triggerElementRef,
			isActiveTrigger: isTriggerActive,
			isClosing: () => store.select("transitionStatus") === "ending",
			shouldOpen() {
				return !isNestedTriggerHoveredRef.current;
			}
		});
		const focusProps = useFocus(floatingRootContext, { enabled: !disabled }).reference;
		const handleNestedTriggerHover = (event) => {
			const wasNestedTriggerHovered = isNestedTriggerHoveredRef.current;
			const target = getTargetElement(event);
			const nestedTriggerHovered = detectNestedTriggerHover(target);
			const triggerEl = triggerElementRef.current;
			const targetInsideTrigger = triggerEl && target && contains(triggerEl, target);
			if (nestedTriggerHovered && store.select("open") && store.select("lastOpenChangeReason") === "trigger-hover") {
				store.setOpen(false, createChangeEventDetails(triggerHover, event));
				return;
			}
			if (wasNestedTriggerHovered && !nestedTriggerHovered && targetInsideTrigger && !disabledRef.current && !store.select("open") && triggerEl && isMouseLikePointerType(pointerTypeRef.current)) {
				const open = () => {
					if (!isNestedTriggerHoveredRef.current && !disabledRef.current && !store.select("open")) store.setOpen(true, createChangeEventDetails(triggerHover, event, triggerEl));
				};
				const openDelay = getOpenDelay();
				if (openDelay === 0) {
					nestedTriggerOpenTimeout.clear();
					open();
				} else nestedTriggerOpenTimeout.start(openDelay, open);
			}
		};
		const rootTriggerProps = store.useState("appliedTriggerProps", isMountedByThisTrigger || trackCursorAxis !== "none");
		return useRenderElement("button", componentProps, {
			state: { open: isOpenedByThisTrigger },
			ref: [
				forwardedRef,
				registerTrigger,
				triggerElementRef
			],
			props: [
				hoverProps,
				focusProps,
				rootTriggerProps,
				{
					onMouseOver(event) {
						handleNestedTriggerHover(event.nativeEvent);
					},
					onFocus(event) {
						if (isEnabledNestedTriggerTarget(getTargetElement(event.nativeEvent))) event.preventBaseUIHandler();
					},
					onMouseLeave() {
						isNestedTriggerHoveredRef.current = false;
						nestedTriggerOpenTimeout.clear();
						pointerTypeRef.current = void 0;
					},
					onPointerEnter(event) {
						pointerTypeRef.current = event.pointerType;
					},
					onPointerDown(event) {
						pointerTypeRef.current = event.pointerType;
						store.set("closeOnClick", closeOnClick);
						if (closeOnClick && !store.select("open")) store.cancelPendingOpen(event.nativeEvent);
					},
					onClick(event) {
						if (closeOnClick && !store.select("open")) store.cancelPendingOpen(event.nativeEvent);
					},
					id: thisTriggerId,
					[triggerDisabled]: disabled ? "" : void 0,
					[TOOLTIP_TRIGGER_IDENTIFIER]: disabled ? void 0 : ""
				},
				elementProps
			],
			stateAttributesMapping: triggerOpenStateMapping
		});
	});
	TooltipTrigger.displayName = "TooltipTrigger";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/portal/TooltipPortalContext.mjs
	const TooltipPortalContext = /*#__PURE__*/ react.createContext(void 0);
	TooltipPortalContext.displayName = "TooltipPortalContext";
	function useTooltipPortalContext() {
		const value = react.useContext(TooltipPortalContext);
		if (value === void 0) throw new Error("Base UI: <Tooltip.Portal> is missing.");
		return value;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/portal/TooltipPortal.mjs
/**
	* A portal element that moves the popup to a different part of the DOM.
	* By default, the portal element is appended to `<body>`.
	* Renders a `<div>` element.
	*
	* Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
	*/
	const TooltipPortal = /*#__PURE__*/ react.forwardRef(function TooltipPortal(props, forwardedRef) {
		const { keepMounted = false, ...portalProps } = props;
		if (!(useTooltipRootContext().useState("mounted") || keepMounted)) return null;
		return /*#__PURE__*/ (0, react_jsx_runtime.jsx)(TooltipPortalContext.Provider, {
			value: keepMounted,
			children: /*#__PURE__*/ (0, react_jsx_runtime.jsx)(FloatingPortalLite, {
				ref: forwardedRef,
				...portalProps
			})
		});
	});
	TooltipPortal.displayName = "TooltipPortal";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/positioner/TooltipPositionerContext.mjs
	const TooltipPositionerContext = /*#__PURE__*/ react.createContext(void 0);
	TooltipPositionerContext.displayName = "TooltipPositionerContext";
	function useTooltipPositionerContext() {
		const context = react.useContext(TooltipPositionerContext);
		if (context === void 0) throw new Error("Base UI: TooltipPositionerContext is missing. TooltipPositioner parts must be placed within <Tooltip.Positioner>.");
		return context;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/positioner/TooltipPositioner.mjs
/**
	* Positions the tooltip against the trigger.
	* Renders a `<div>` element.
	*
	* Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
	*/
	const TooltipPositioner = /*#__PURE__*/ react.forwardRef(function TooltipPositioner(componentProps, forwardedRef) {
		const { render, className, anchor, positionMethod = "absolute", side = "top", align = "center", sideOffset = 0, alignOffset = 0, collisionBoundary = "clipping-ancestors", collisionPadding = 5, arrowPadding = 5, sticky = false, disableAnchorTracking = false, collisionAvoidance = POPUP_COLLISION_AVOIDANCE, style, ...elementProps } = componentProps;
		const store = useTooltipRootContext();
		const keepMounted = useTooltipPortalContext();
		const open = store.useState("open");
		const mounted = store.useState("mounted");
		const trackCursorAxis = store.useState("trackCursorAxis");
		const disableHoverablePopup = store.useState("disableHoverablePopup");
		const floatingRootContext = store.useState("floatingRootContext");
		const instantType = store.useState("instantType");
		const transitionStatus = store.useState("transitionStatus");
		const adaptiveOrigin = store.useState("adaptiveOrigin");
		const positioning = useAnchorPositioning({
			anchor,
			positionMethod,
			floatingRootContext,
			mounted,
			side,
			sideOffset,
			align,
			alignOffset,
			collisionBoundary,
			collisionPadding,
			sticky,
			arrowPadding,
			disableAnchorTracking,
			keepMounted,
			collisionAvoidance,
			adaptiveOrigin
		});
		const state = react.useMemo(() => ({
			open,
			side: positioning.side,
			align: positioning.align,
			anchorHidden: positioning.anchorHidden,
			instant: trackCursorAxis !== "none" ? "tracking-cursor" : instantType
		}), [
			open,
			positioning.side,
			positioning.align,
			positioning.anchorHidden,
			trackCursorAxis,
			instantType
		]);
		const element = usePositioner(componentProps, state, {
			styles: positioning.positionerStyles,
			transitionStatus,
			props: elementProps,
			refs: [forwardedRef, store.useStateSetter("positionerElement")],
			hidden: !mounted,
			inert: !open || trackCursorAxis === "both" || disableHoverablePopup
		});
		return /*#__PURE__*/ (0, react_jsx_runtime.jsx)(TooltipPositionerContext.Provider, {
			value: positioning,
			children: element
		});
	});
	TooltipPositioner.displayName = "TooltipPositioner";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/popup/TooltipPopup.mjs
/**
	* A container for the tooltip contents.
	* Renders a `<div>` element.
	*
	* Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
	*/
	const TooltipPopup = /*#__PURE__*/ react.forwardRef(function TooltipPopup(componentProps, forwardedRef) {
		const { render, className, style, ...elementProps } = componentProps;
		const store = useTooltipRootContext();
		const { side, align } = useTooltipPositionerContext();
		const open = store.useState("open");
		const instantType = store.useState("instantType");
		const transitionStatus = store.useState("transitionStatus");
		const popupProps = store.useState("popupProps");
		const floatingContext = store.useState("floatingRootContext");
		const disabled = store.useState("disabled");
		const closeDelay = store.useState("closeDelay");
		useOpenChangeComplete({
			open,
			ref: store.context.popupRef,
			onComplete() {
				if (open) store.context.onOpenChangeComplete?.(true);
			}
		});
		useHoverFloatingInteraction(floatingContext, {
			enabled: !disabled,
			closeDelay
		});
		const setPopupElement = store.useStateSetter("popupElement");
		return useRenderElement("div", componentProps, {
			state: {
				open,
				side,
				align,
				instant: instantType,
				transitionStatus
			},
			ref: [
				forwardedRef,
				store.context.popupRef,
				setPopupElement
			],
			props: [
				FOCUSABLE_POPUP_PROPS,
				popupProps,
				getDisabledMountTransitionStyles(transitionStatus),
				elementProps
			],
			stateAttributesMapping: popupTransitionStateMapping
		});
	});
	TooltipPopup.displayName = "TooltipPopup";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/provider/TooltipProvider.mjs
/**
	* Provides a shared delay for multiple tooltips. The grouping logic ensures that
	* once a tooltip becomes visible, the adjacent tooltips will be shown instantly.
	*
	* Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
	*/
	const TooltipProvider = function TooltipProvider(props) {
		const { delay, closeDelay, timeout = 400 } = props;
		const delayValue = react.useMemo(() => ({
			open: delay,
			close: closeDelay
		}), [delay, closeDelay]);
		return /*#__PURE__*/ (0, react_jsx_runtime.jsx)(TooltipProviderContext.Provider, {
			value: delay,
			children: /*#__PURE__*/ (0, react_jsx_runtime.jsx)(FloatingDelayGroup, {
				delay: delayValue,
				timeoutMs: timeout,
				children: props.children
			})
		});
	};
	TooltipProvider.displayName = "TooltipProvider";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/use-render/useRender.mjs
/**
	* Renders a Base UI element.
	*
	* @public
	*/
	function useRender(params) {
		return useRenderElement(params.defaultTagName ?? "div", params, params);
	}

// packages/icons/build-module/library/chevron-down.mjs
	var chevron_down_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M7 11L12 15L17 11" })
	});

// packages/icons/build-module/library/chevron-left.mjs
	var chevron_left_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M14 6.5L9 12L14 17.5" })
	});

// packages/icons/build-module/library/chevron-right.mjs
	var chevron_right_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M10 6.5L15 12L10 17.5" })
	});

// packages/icons/build-module/library/chevron-up.mjs
	var chevron_up_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M7 13L12 9L17 13" })
	});

// packages/icons/build-module/library/fullscreen.mjs
	var fullscreen_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M4.75 10V4.75H10M4.75 4.75L10 10M14 19.25H19.25V14M19.25 19.25L14 14" })
	});

// packages/ui/build-module/visually-hidden/visually-hidden.mjs
	const STYLE_HASH_ATTRIBUTE$4 = "data-wp-hash";
	/**
	* Returns the shared style runtime registry.
	*
	* The registry is stored on `globalThis` so separately bundled copies of this
	* package can coordinate through the same document and style maps.
	*
	* @return The shared runtime registry.
	*/
	function getRuntime$4() {
		const globalScope = globalThis;
		if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
		globalScope.__wpStyleRuntime = {
			documents: /* @__PURE__ */ new Map(),
			styles: /* @__PURE__ */ new Map(),
			injectedStyles: /* @__PURE__ */ new WeakMap()
		};
		if (typeof document !== "undefined") registerDocument$4(document);
		return globalScope.__wpStyleRuntime;
	}
	/**
	* Checks whether a document already contains a style tag for a hash.
	*
	* @param targetDocument Document to inspect.
	* @param hash           Stable hash for the transformed CSS.
	*
	* @return Whether the style hash already exists in the document.
	*/
	function documentContainsStyleHash$4(targetDocument, hash) {
		if (!targetDocument.head) return false;
		for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$4}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$4) === hash) return true;
		return false;
	}
	/**
	* Injects a registered style into a document, unless that document already
	* contains a style tag for the same hash.
	*
	* @param targetDocument Document to inject the style into.
	* @param hash           Stable hash for the transformed CSS.
	* @param css            CSS text to inject.
	*/
	function injectStyle$4(targetDocument, hash, css) {
		if (!targetDocument.head) return;
		const runtime = getRuntime$4();
		let injectedStyles = runtime.injectedStyles.get(targetDocument);
		if (!injectedStyles) {
			injectedStyles = /* @__PURE__ */ new Set();
			runtime.injectedStyles.set(targetDocument, injectedStyles);
		}
		if (injectedStyles.has(hash)) return;
		if (documentContainsStyleHash$4(targetDocument, hash)) {
			injectedStyles.add(hash);
			return;
		}
		const style = targetDocument.createElement("style");
		style.setAttribute(STYLE_HASH_ATTRIBUTE$4, hash);
		style.appendChild(targetDocument.createTextNode(css));
		targetDocument.head.appendChild(style);
		injectedStyles.add(hash);
	}
	/**
	* Registers a document as a style injection target.
	*
	* Existing registered styles are replayed into the document immediately.
	* Documents are reference-counted so multiple providers can safely register the
	* same document without one cleanup removing it while another registration is
	* still active.
	*
	* @param targetDocument Document to receive registered styles.
	* @return Cleanup function that unregisters this document registration.
	*/
	function registerDocument$4(targetDocument) {
		const runtime = getRuntime$4();
		runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
		for (const [hash, css] of runtime.styles) injectStyle$4(targetDocument, hash, css);
		return () => {
			const count = runtime.documents.get(targetDocument);
			if (count === void 0) return;
			if (count <= 1) {
				runtime.documents.delete(targetDocument);
				return;
			}
			runtime.documents.set(targetDocument, count - 1);
		};
	}
	/**
	* Registers a style and injects it into all registered documents.
	*
	* The hash is used as the deduplication key, so calling this repeatedly with
	* the same hash will not add duplicate style tags to a document.
	* Registered styles are retained for the lifetime of the page so they can be
	* replayed into documents that are registered later.
	*
	* @param hash Stable hash for the transformed CSS.
	* @param css  CSS text to inject.
	*/
	function registerStyle$4(hash, css) {
		const runtime = getRuntime$4();
		runtime.styles.set(hash, css);
		for (const targetDocument of runtime.documents.keys()) injectStyle$4(targetDocument, hash, css);
	}
	registerStyle$4("7caae29f9e", ".e2c3cbe6ada7d785__visually-hidden{border:0;clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;overflow-wrap:normal;padding:0;position:absolute;width:1px;word-break:normal}");
	var style_module_default$3 = { "visually-hidden": "e2c3cbe6ada7d785__visually-hidden" };
	/**
	* Visually hides content while keeping it accessible to screen readers.
	* Useful when providing context that's only meaningful to assistive technology.
	*
	* Renders a `<div>` by default. Use the `render` prop to swap the
	* underlying element while preserving the visually-hidden behavior.
	*
	* ## Composing with other components
	*
	* When composing with another component that uses the `render` prop
	* pattern, keep `VisuallyHidden` as the **host** (outer component) and
	* pass the other component via `render`. This keeps the other
	* component's HTML element and semantics intact, while `VisuallyHidden`
	* only adds its hiding styles:
	*
	* ```jsx
	* // OtherComponent keeps its semantic element (e.g. <h2>).
	* <VisuallyHidden render={ <OtherComponent /> }>
	*   Accessible text
	* </VisuallyHidden>
	* ```
	*/
	const VisuallyHidden = (0, _wordpress_element.forwardRef)(function UnforwardedVisuallyHidden({ render, ...restProps }, ref) {
		return useRender({
			render,
			ref,
			props: mergeProps({ className: style_module_default$3["visually-hidden"] }, restProps, { "data-visually-hidden": "" })
		});
	});

// packages/ui/build-module/utils/render-slot-with-children.mjs
/**
	* Fills an optional "slot" element prop with content by cloning it and
	* injecting the given `children`. When `slot` is undefined, the provided
	* `defaultSlot` is used in its place.
	*
	* Shared by overlay `Popup` components for their slot-shaped customization
	* props (e.g. `portal`, `positioner`), so the merge behavior — defaults,
	* children injection — stays consistent across all of them.
	*
	* Callers should type the slot prop as `ReactElement<Omit<Props, 'children'>>`:
	* any subtree passed on the slot element is overwritten by `children`.
	*
	* @param slot        Optional element from the slot prop (e.g. `<Tooltip.Portal … />`
	*                    or `<Tooltip.Positioner … />`). When omitted, `defaultSlot`
	*                    is used. Injected `children` replace any subtree the caller
	*                    may have passed on the slot element.
	* @param defaultSlot Unpopulated default element used when `slot` is omitted
	*                    (e.g. `<Tooltip.Portal />`).
	* @param children    Content to inject as the slot's children (backdrop,
	*                    positioner, popup subtree, etc.).
	*/
	function renderSlotWithChildren(slot, defaultSlot, children) {
		return (0, _wordpress_element.cloneElement)(slot ?? defaultSlot, { children });
	}

// packages/ui/build-module/utils/wp-compat-overlay-slot.mjs
	const STYLE_HASH_ATTRIBUTE$3 = "data-wp-hash";
	/**
	* Returns the shared style runtime registry.
	*
	* The registry is stored on `globalThis` so separately bundled copies of this
	* package can coordinate through the same document and style maps.
	*
	* @return The shared runtime registry.
	*/
	function getRuntime$3() {
		const globalScope = globalThis;
		if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
		globalScope.__wpStyleRuntime = {
			documents: /* @__PURE__ */ new Map(),
			styles: /* @__PURE__ */ new Map(),
			injectedStyles: /* @__PURE__ */ new WeakMap()
		};
		if (typeof document !== "undefined") registerDocument$3(document);
		return globalScope.__wpStyleRuntime;
	}
	/**
	* Checks whether a document already contains a style tag for a hash.
	*
	* @param targetDocument Document to inspect.
	* @param hash           Stable hash for the transformed CSS.
	*
	* @return Whether the style hash already exists in the document.
	*/
	function documentContainsStyleHash$3(targetDocument, hash) {
		if (!targetDocument.head) return false;
		for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$3}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$3) === hash) return true;
		return false;
	}
	/**
	* Injects a registered style into a document, unless that document already
	* contains a style tag for the same hash.
	*
	* @param targetDocument Document to inject the style into.
	* @param hash           Stable hash for the transformed CSS.
	* @param css            CSS text to inject.
	*/
	function injectStyle$3(targetDocument, hash, css) {
		if (!targetDocument.head) return;
		const runtime = getRuntime$3();
		let injectedStyles = runtime.injectedStyles.get(targetDocument);
		if (!injectedStyles) {
			injectedStyles = /* @__PURE__ */ new Set();
			runtime.injectedStyles.set(targetDocument, injectedStyles);
		}
		if (injectedStyles.has(hash)) return;
		if (documentContainsStyleHash$3(targetDocument, hash)) {
			injectedStyles.add(hash);
			return;
		}
		const style = targetDocument.createElement("style");
		style.setAttribute(STYLE_HASH_ATTRIBUTE$3, hash);
		style.appendChild(targetDocument.createTextNode(css));
		targetDocument.head.appendChild(style);
		injectedStyles.add(hash);
	}
	/**
	* Registers a document as a style injection target.
	*
	* Existing registered styles are replayed into the document immediately.
	* Documents are reference-counted so multiple providers can safely register the
	* same document without one cleanup removing it while another registration is
	* still active.
	*
	* @param targetDocument Document to receive registered styles.
	* @return Cleanup function that unregisters this document registration.
	*/
	function registerDocument$3(targetDocument) {
		const runtime = getRuntime$3();
		runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
		for (const [hash, css] of runtime.styles) injectStyle$3(targetDocument, hash, css);
		return () => {
			const count = runtime.documents.get(targetDocument);
			if (count === void 0) return;
			if (count <= 1) {
				runtime.documents.delete(targetDocument);
				return;
			}
			runtime.documents.set(targetDocument, count - 1);
		};
	}
	/**
	* Registers a style and injects it into all registered documents.
	*
	* The hash is used as the deduplication key, so calling this repeatedly with
	* the same hash will not add duplicate style tags to a document.
	* Registered styles are retained for the lifetime of the page so they can be
	* replayed into documents that are registered later.
	*
	* @param hash Stable hash for the transformed CSS.
	* @param css  CSS text to inject.
	*/
	function registerStyle$3(hash, css) {
		const runtime = getRuntime$3();
		runtime.styles.set(hash, css);
		for (const targetDocument of runtime.documents.keys()) injectStyle$3(targetDocument, hash, css);
	}
	registerStyle$3("40df669685", "._9e7887c25dedb459__slot{inset:0;isolation:isolate;pointer-events:none;position:fixed;z-index:1000000003}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._9e7887c25dedb459__slot>*{pointer-events:auto}}}");
	var wp_compat_overlay_slot_module_default = { "slot": "_9e7887c25dedb459__slot" };
	/**
	* Marker attribute on the compat overlay slot element.
	*/
	const WP_COMPAT_OVERLAY_SLOT_ATTRIBUTE = "data-wp-compat-overlay-slot";
	function resolveOwnerDocument() {
		return typeof document === "undefined" ? null : document;
	}
	function isInWordPressEnvironment() {
		let topWp;
		try {
			topWp = window.top?.wp;
		} catch {}
		const wp = topWp ?? window.wp;
		return typeof wp?.components === "object" && wp.components !== null;
	}
	let cachedSlot = null;
	function ensureSlotIsAccessible(element) {
		element.setAttribute("aria-hidden", "false");
		return element;
	}
	function createSlot(ownerDocument) {
		const element = ownerDocument.createElement("div");
		element.setAttribute(WP_COMPAT_OVERLAY_SLOT_ATTRIBUTE, "");
		if (wp_compat_overlay_slot_module_default.slot) element.classList.add(wp_compat_overlay_slot_module_default.slot);
		ownerDocument.body.appendChild(element);
		return element;
	}
	/**
	* Returns the body-level compat overlay slot when the runtime opts in,
	* lazily creating it on first call. Returns `undefined` otherwise — so the
	* return value can be forwarded straight to a `container` prop, leaving the
	* default portal container in effect.
	*
	* Two opt-in paths:
	*
	* - Auto-detected when `window.wp.components` is on the global — the
	*   typical script-loader setup for WordPress plugins and admin screens.
	* - Explicit, via `useEnableWpCompatOverlaySlot()` — for hosts that bundle
	*   `@wordpress/components` (or only `@wordpress/ui`) directly rather than
	*   relying on the global.
	*
	* The slot is a single `<div data-wp-compat-overlay-slot>` appended to the
	* local document's body. Subsequent calls return the same element; if it's
	* been removed it's recreated, and a slot created by another
	* `@wordpress/ui` instance in the same document is adopted rather than
	* duplicated.
	*/
	function getWpCompatOverlaySlot() {
		if (typeof window === "undefined") return;
		if (!isInWordPressEnvironment() && window.__wpUiCompatOverlaySlotEnabled !== true) return;
		const ownerDocument = resolveOwnerDocument();
		if (!ownerDocument || !ownerDocument.body) return;
		if (cachedSlot && cachedSlot.ownerDocument === ownerDocument && cachedSlot.isConnected) return ensureSlotIsAccessible(cachedSlot);
		const existing = ownerDocument.querySelector(`[${WP_COMPAT_OVERLAY_SLOT_ATTRIBUTE}]`);
		if (existing instanceof HTMLDivElement) {
			cachedSlot = ensureSlotIsAccessible(existing);
			return cachedSlot;
		}
		if (cachedSlot?.isConnected) cachedSlot.remove();
		cachedSlot = ensureSlotIsAccessible(createSlot(ownerDocument));
		return cachedSlot;
	}

// packages/ui/build-module/utils/direction-provider.mjs
/**
	* Provides WordPress's text direction to Base UI components.
	*/
	function DirectionProvider({ children }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DirectionProvider$1, {
			direction: (0, _wordpress_i18n.isRTL)() ? "rtl" : "ltr",
			children
		});
	}

// packages/ui/build-module/tooltip/portal.mjs
/**
	* Used to apply custom portal behavior to `Tooltip`'s floating content.
	* `container` defaults to the `@wordpress/ui` compat overlay slot.
	*/
	const Portal = (0, _wordpress_element.forwardRef)(function TooltipPortal$1({ container, ...restProps }, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TooltipPortal, {
			container: container === void 0 ? getWpCompatOverlaySlot() : container,
			...restProps,
			ref
		});
	});

// packages/ui/build-module/tooltip/positioner.mjs
	const STYLE_HASH_ATTRIBUTE$2 = "data-wp-hash";
	/**
	* Returns the shared style runtime registry.
	*
	* The registry is stored on `globalThis` so separately bundled copies of this
	* package can coordinate through the same document and style maps.
	*
	* @return The shared runtime registry.
	*/
	function getRuntime$2() {
		const globalScope = globalThis;
		if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
		globalScope.__wpStyleRuntime = {
			documents: /* @__PURE__ */ new Map(),
			styles: /* @__PURE__ */ new Map(),
			injectedStyles: /* @__PURE__ */ new WeakMap()
		};
		if (typeof document !== "undefined") registerDocument$2(document);
		return globalScope.__wpStyleRuntime;
	}
	/**
	* Checks whether a document already contains a style tag for a hash.
	*
	* @param targetDocument Document to inspect.
	* @param hash           Stable hash for the transformed CSS.
	*
	* @return Whether the style hash already exists in the document.
	*/
	function documentContainsStyleHash$2(targetDocument, hash) {
		if (!targetDocument.head) return false;
		for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$2}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$2) === hash) return true;
		return false;
	}
	/**
	* Injects a registered style into a document, unless that document already
	* contains a style tag for the same hash.
	*
	* @param targetDocument Document to inject the style into.
	* @param hash           Stable hash for the transformed CSS.
	* @param css            CSS text to inject.
	*/
	function injectStyle$2(targetDocument, hash, css) {
		if (!targetDocument.head) return;
		const runtime = getRuntime$2();
		let injectedStyles = runtime.injectedStyles.get(targetDocument);
		if (!injectedStyles) {
			injectedStyles = /* @__PURE__ */ new Set();
			runtime.injectedStyles.set(targetDocument, injectedStyles);
		}
		if (injectedStyles.has(hash)) return;
		if (documentContainsStyleHash$2(targetDocument, hash)) {
			injectedStyles.add(hash);
			return;
		}
		const style = targetDocument.createElement("style");
		style.setAttribute(STYLE_HASH_ATTRIBUTE$2, hash);
		style.appendChild(targetDocument.createTextNode(css));
		targetDocument.head.appendChild(style);
		injectedStyles.add(hash);
	}
	/**
	* Registers a document as a style injection target.
	*
	* Existing registered styles are replayed into the document immediately.
	* Documents are reference-counted so multiple providers can safely register the
	* same document without one cleanup removing it while another registration is
	* still active.
	*
	* @param targetDocument Document to receive registered styles.
	* @return Cleanup function that unregisters this document registration.
	*/
	function registerDocument$2(targetDocument) {
		const runtime = getRuntime$2();
		runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
		for (const [hash, css] of runtime.styles) injectStyle$2(targetDocument, hash, css);
		return () => {
			const count = runtime.documents.get(targetDocument);
			if (count === void 0) return;
			if (count <= 1) {
				runtime.documents.delete(targetDocument);
				return;
			}
			runtime.documents.set(targetDocument, count - 1);
		};
	}
	/**
	* Registers a style and injects it into all registered documents.
	*
	* The hash is used as the deduplication key, so calling this repeatedly with
	* the same hash will not add duplicate style tags to a document.
	* Registered styles are retained for the lifetime of the page so they can be
	* replayed into documents that are registered later.
	*
	* @param hash Stable hash for the transformed CSS.
	* @param css  CSS text to inject.
	*/
	function registerStyle$2(hash, css) {
		const runtime = getRuntime$2();
		runtime.styles.set(hash, css);
		for (const targetDocument of runtime.documents.keys()) injectStyle$2(targetDocument, hash, css);
	}
	registerStyle$2("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
	var resets_module_default = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
	registerStyle$2("aaf79ac691", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.b9266862d9435660__positioner{z-index:var(--wp-ui-tooltip-z-index,initial)}._7bb3fd8a0810be6d__popup{--_wp-ui-elevation-sm:0 1px 2px rgba(0,0,0,.05),0 2px 3px rgba(0,0,0,.04),0 6px 6px rgba(0,0,0,.03),0 8px 8px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-sm);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:1.4;padding:var(--wpds-dimension-padding-xs,4px) var(--wpds-dimension-padding-sm,8px);@media (forced-colors:active){border-bottom-color:CanvasText;border-bottom-style:solid;border-bottom-width:1px;border-left-color:CanvasText;border-left-style:solid;border-left-width:1px;border-right-color:CanvasText;border-right-style:solid;border-right-width:1px;border-top-color:CanvasText;border-top-style:solid;border-top-width:1px}}}}");
	var style_module_default$2 = {
		"positioner": "b9266862d9435660__positioner",
		"popup": "_7bb3fd8a0810be6d__popup"
	};
	/**
	* Used to apply custom positioning to `Tooltip`'s floating content.
	*/
	const Positioner = (0, _wordpress_element.forwardRef)(function TooltipPositioner$1({ align = "center", className, side = "top", sideOffset = 4, ...props }, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TooltipPositioner, {
			ref,
			align,
			side,
			sideOffset,
			...props,
			className: clsx(resets_module_default["box-sizing"], style_module_default$2.positioner, className)
		});
	});

// packages/ui/build-module/lock-unlock.mjs
	const { lock: lock$1, unlock: unlock$1 } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/ui");

// packages/ui/build-module/utils/theme-provider.mjs
	function getThemeProvider() {
		const themePackage = _wordpress_theme;
		if (themePackage.ThemeProvider) return themePackage.ThemeProvider;
		if (!themePackage.privateApis) throw new Error("@wordpress/ui: @wordpress/theme must expose `ThemeProvider` or `privateApis.ThemeProvider`.");
		return unlock$1(themePackage.privateApis).ThemeProvider;
	}
	const ThemeProvider$1 = getThemeProvider();

// packages/ui/build-module/tooltip/popup.mjs
	const STYLE_HASH_ATTRIBUTE$1 = "data-wp-hash";
	/**
	* Returns the shared style runtime registry.
	*
	* The registry is stored on `globalThis` so separately bundled copies of this
	* package can coordinate through the same document and style maps.
	*
	* @return The shared runtime registry.
	*/
	function getRuntime$1() {
		const globalScope = globalThis;
		if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
		globalScope.__wpStyleRuntime = {
			documents: /* @__PURE__ */ new Map(),
			styles: /* @__PURE__ */ new Map(),
			injectedStyles: /* @__PURE__ */ new WeakMap()
		};
		if (typeof document !== "undefined") registerDocument$1(document);
		return globalScope.__wpStyleRuntime;
	}
	/**
	* Checks whether a document already contains a style tag for a hash.
	*
	* @param targetDocument Document to inspect.
	* @param hash           Stable hash for the transformed CSS.
	*
	* @return Whether the style hash already exists in the document.
	*/
	function documentContainsStyleHash$1(targetDocument, hash) {
		if (!targetDocument.head) return false;
		for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$1}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$1) === hash) return true;
		return false;
	}
	/**
	* Injects a registered style into a document, unless that document already
	* contains a style tag for the same hash.
	*
	* @param targetDocument Document to inject the style into.
	* @param hash           Stable hash for the transformed CSS.
	* @param css            CSS text to inject.
	*/
	function injectStyle$1(targetDocument, hash, css) {
		if (!targetDocument.head) return;
		const runtime = getRuntime$1();
		let injectedStyles = runtime.injectedStyles.get(targetDocument);
		if (!injectedStyles) {
			injectedStyles = /* @__PURE__ */ new Set();
			runtime.injectedStyles.set(targetDocument, injectedStyles);
		}
		if (injectedStyles.has(hash)) return;
		if (documentContainsStyleHash$1(targetDocument, hash)) {
			injectedStyles.add(hash);
			return;
		}
		const style = targetDocument.createElement("style");
		style.setAttribute(STYLE_HASH_ATTRIBUTE$1, hash);
		style.appendChild(targetDocument.createTextNode(css));
		targetDocument.head.appendChild(style);
		injectedStyles.add(hash);
	}
	/**
	* Registers a document as a style injection target.
	*
	* Existing registered styles are replayed into the document immediately.
	* Documents are reference-counted so multiple providers can safely register the
	* same document without one cleanup removing it while another registration is
	* still active.
	*
	* @param targetDocument Document to receive registered styles.
	* @return Cleanup function that unregisters this document registration.
	*/
	function registerDocument$1(targetDocument) {
		const runtime = getRuntime$1();
		runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
		for (const [hash, css] of runtime.styles) injectStyle$1(targetDocument, hash, css);
		return () => {
			const count = runtime.documents.get(targetDocument);
			if (count === void 0) return;
			if (count <= 1) {
				runtime.documents.delete(targetDocument);
				return;
			}
			runtime.documents.set(targetDocument, count - 1);
		};
	}
	/**
	* Registers a style and injects it into all registered documents.
	*
	* The hash is used as the deduplication key, so calling this repeatedly with
	* the same hash will not add duplicate style tags to a document.
	* Registered styles are retained for the lifetime of the page so they can be
	* replayed into documents that are registered later.
	*
	* @param hash Stable hash for the transformed CSS.
	* @param css  CSS text to inject.
	*/
	function registerStyle$1(hash, css) {
		const runtime = getRuntime$1();
		runtime.styles.set(hash, css);
		for (const targetDocument of runtime.documents.keys()) injectStyle$1(targetDocument, hash, css);
	}
	registerStyle$1("aaf79ac691", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.b9266862d9435660__positioner{z-index:var(--wp-ui-tooltip-z-index,initial)}._7bb3fd8a0810be6d__popup{--_wp-ui-elevation-sm:0 1px 2px rgba(0,0,0,.05),0 2px 3px rgba(0,0,0,.04),0 6px 6px rgba(0,0,0,.03),0 8px 8px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-sm);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:1.4;padding:var(--wpds-dimension-padding-xs,4px) var(--wpds-dimension-padding-sm,8px);@media (forced-colors:active){border-bottom-color:CanvasText;border-bottom-style:solid;border-bottom-width:1px;border-left-color:CanvasText;border-left-style:solid;border-left-width:1px;border-right-color:CanvasText;border-right-style:solid;border-right-width:1px;border-top-color:CanvasText;border-top-style:solid;border-top-width:1px}}}}");
	var style_module_default$1 = {
		"positioner": "b9266862d9435660__positioner",
		"popup": "_7bb3fd8a0810be6d__popup"
	};
	const POPUP_COLOR = { background: "#1e1e1e" };
	const Popup = (0, _wordpress_element.forwardRef)(function TooltipPopup$1({ portal, positioner, children, className, ...props }, ref) {
		const popupContent = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeProvider$1, {
			color: POPUP_COLOR,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TooltipPopup, {
				ref,
				className: clsx(style_module_default$1.popup, className),
				...props,
				children
			})
		});
		const positionedPopup = renderSlotWithChildren(positioner, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Positioner, {}), popupContent);
		return renderSlotWithChildren(portal, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Portal, {}), positionedPopup);
	});

// packages/ui/build-module/tooltip/trigger.mjs
	const Trigger = (0, _wordpress_element.forwardRef)(function TooltipTrigger$1(props, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TooltipTrigger, {
			ref,
			...props
		});
	});

// packages/ui/build-module/tooltip/root.mjs
/**
	* `Tooltip` is used to visually show the label of an icon button, or other such
	* interactive controls that don't have a visual text label.
	*
	* Tooltip popups are visual-only and not exposed to assistive technologies.
	* The trigger's accessible name (e.g. `aria-label`) is the source of truth
	* for screen reader users. Tooltips are not available on touch devices,
	* and thus should not be used for infotips, descriptions, or dynamic status
	* messages.
	*
	* @see {@link https://wordpress.github.io/gutenberg/?path=/docs/design-system-components-tooltip-usage-guidelines--docs Usage Guidelines}
	* @see {@link https://wordpress.github.io/gutenberg/?path=/docs/design-system-components-iconbutton--docs IconButton}
	*/
	function Root(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DirectionProvider, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TooltipRoot, { ...props }) });
	}

// packages/ui/build-module/tooltip/provider.mjs
	function Provider({ ...props }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TooltipProvider, { ...props });
	}

// packages/ui/build-module/stack/stack.mjs
	const STYLE_HASH_ATTRIBUTE = "data-wp-hash";
	/**
	* Returns the shared style runtime registry.
	*
	* The registry is stored on `globalThis` so separately bundled copies of this
	* package can coordinate through the same document and style maps.
	*
	* @return The shared runtime registry.
	*/
	function getRuntime() {
		const globalScope = globalThis;
		if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
		globalScope.__wpStyleRuntime = {
			documents: /* @__PURE__ */ new Map(),
			styles: /* @__PURE__ */ new Map(),
			injectedStyles: /* @__PURE__ */ new WeakMap()
		};
		if (typeof document !== "undefined") registerDocument(document);
		return globalScope.__wpStyleRuntime;
	}
	/**
	* Checks whether a document already contains a style tag for a hash.
	*
	* @param targetDocument Document to inspect.
	* @param hash           Stable hash for the transformed CSS.
	*
	* @return Whether the style hash already exists in the document.
	*/
	function documentContainsStyleHash(targetDocument, hash) {
		if (!targetDocument.head) return false;
		for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE) === hash) return true;
		return false;
	}
	/**
	* Injects a registered style into a document, unless that document already
	* contains a style tag for the same hash.
	*
	* @param targetDocument Document to inject the style into.
	* @param hash           Stable hash for the transformed CSS.
	* @param css            CSS text to inject.
	*/
	function injectStyle(targetDocument, hash, css) {
		if (!targetDocument.head) return;
		const runtime = getRuntime();
		let injectedStyles = runtime.injectedStyles.get(targetDocument);
		if (!injectedStyles) {
			injectedStyles = /* @__PURE__ */ new Set();
			runtime.injectedStyles.set(targetDocument, injectedStyles);
		}
		if (injectedStyles.has(hash)) return;
		if (documentContainsStyleHash(targetDocument, hash)) {
			injectedStyles.add(hash);
			return;
		}
		const style = targetDocument.createElement("style");
		style.setAttribute(STYLE_HASH_ATTRIBUTE, hash);
		style.appendChild(targetDocument.createTextNode(css));
		targetDocument.head.appendChild(style);
		injectedStyles.add(hash);
	}
	/**
	* Registers a document as a style injection target.
	*
	* Existing registered styles are replayed into the document immediately.
	* Documents are reference-counted so multiple providers can safely register the
	* same document without one cleanup removing it while another registration is
	* still active.
	*
	* @param targetDocument Document to receive registered styles.
	* @return Cleanup function that unregisters this document registration.
	*/
	function registerDocument(targetDocument) {
		const runtime = getRuntime();
		runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
		for (const [hash, css] of runtime.styles) injectStyle(targetDocument, hash, css);
		return () => {
			const count = runtime.documents.get(targetDocument);
			if (count === void 0) return;
			if (count <= 1) {
				runtime.documents.delete(targetDocument);
				return;
			}
			runtime.documents.set(targetDocument, count - 1);
		};
	}
	/**
	* Registers a style and injects it into all registered documents.
	*
	* The hash is used as the deduplication key, so calling this repeatedly with
	* the same hash will not add duplicate style tags to a document.
	* Registered styles are retained for the lifetime of the page so they can be
	* replayed into documents that are registered later.
	*
	* @param hash Stable hash for the transformed CSS.
	* @param css  CSS text to inject.
	*/
	function registerStyle(hash, css) {
		const runtime = getRuntime();
		runtime.styles.set(hash, css);
		for (const targetDocument of runtime.documents.keys()) injectStyle(targetDocument, hash, css);
	}
	registerStyle("67591fa198", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._8e8e79c1a2eec43b__stack{display:flex}}}");
	var style_module_default = { "stack": "_8e8e79c1a2eec43b__stack" };
	const gapTokens = {
		xs: "var(--wpds-dimension-gap-xs, 4px)",
		sm: "var(--wpds-dimension-gap-sm, 8px)",
		md: "var(--wpds-dimension-gap-md, 12px)",
		lg: "var(--wpds-dimension-gap-lg, 16px)",
		xl: "var(--wpds-dimension-gap-xl, 24px)",
		"2xl": "var(--wpds-dimension-gap-2xl, 32px)",
		"3xl": "var(--wpds-dimension-gap-3xl, 40px)"
	};
	/**
	* A flexible layout component using CSS Flexbox for consistent spacing and alignment.
	* Built on design tokens for predictable spacing values.
	*/
	const Stack = (0, _wordpress_element.forwardRef)(function UnforwardedStack({ direction, gap, align, justify, wrap, render, ...props }, ref) {
		const style = {
			gap: gap && gapTokens[gap],
			alignItems: align,
			justifyContent: justify,
			flexDirection: direction,
			flexWrap: wrap
		};
		return useRender({
			render,
			ref,
			props: mergeProps(props, {
				style,
				className: style_module_default.stack
			})
		});
	});

// packages/admin-ui/build-module/navigable-region/index.mjs
	const NavigableRegion = (0, _wordpress_element.forwardRef)(({ children, className, ariaLabel, as: Tag = "div", ...props }, ref) => {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tag, {
			ref,
			className: clsx("admin-ui-navigable-region", className),
			"aria-label": ariaLabel,
			role: "region",
			tabIndex: "-1",
			...props,
			children
		});
	});
	NavigableRegion.displayName = "NavigableRegion";

// packages/admin-ui/build-module/admin-theme-colors/index.mjs
	const DEFAULT_THEME_COLORS = {
		primary: "#3858e9",
		background: "#222524"
	};
	const ADMIN_THEME_COLORS = /* @__PURE__ */ new Map([
		["modern", DEFAULT_THEME_COLORS],
		["fresh", {
			primary: "#007cba",
			background: "#25292b"
		}],
		["midnight", {
			primary: "#cf4339",
			background: "#3d4042"
		}],
		["coffee", {
			primary: "#916745",
			background: "#5b534d"
		}],
		["ocean", {
			primary: "#567958",
			background: "#5f787f"
		}],
		["blue", {
			primary: "#437aa8",
			background: "#3876a8"
		}],
		["ectoplasm", {
			primary: "#646c3e",
			background: "#4f386e"
		}],
		["sunrise", {
			primary: "#ad631e",
			background: "#cc4541"
		}],
		["light", {
			primary: "#007cba",
			background: "#eaeeed"
		}]
	]);
	/**
	* Reads the active WordPress admin color scheme from the `admin-color-*` body
	* class and returns its primary and background colors. Intended to seed a
	* `ThemeProvider` (`color` prop) so the design system matches the user's chosen
	* admin color scheme.
	*
	* @return The primary and background colors for the active admin color scheme.
	*/
	function getAdminThemeColors() {
		const scheme = document.body.className.match(/admin-color-([\w-]+)/)?.[1] ?? "modern";
		return ADMIN_THEME_COLORS.get(scheme) ?? DEFAULT_THEME_COLORS;
	}

// packages/global-styles-engine/build-module/utils/common.mjs
	const ROOT_BLOCK_SELECTOR = "body";
	const ROOT_CSS_PROPERTIES_SELECTOR = ":root";

// packages/global-styles-engine/build-module/utils/spacing.mjs
	function getSpacingPresetCssVar(value) {
		if (!value) return;
		const slug = value.match(/var:preset\|spacing\|(.+)/);
		if (!slug) return value;
		return `var(--wp--preset--spacing--${slug[1]})`;
	}

// packages/global-styles-engine/build-module/utils/gap.mjs
/**
	* Returns a BoxControl object value from a given blockGap style value.
	* The string check is for backwards compatibility before Gutenberg supported
	* split gap values (row and column) and the value was a string n + unit.
	*
	* @param blockGapValue A block gap string or axial object value, e.g., '10px' or { top: '10px', left: '10px'}.
	* @return A value to pass to the BoxControl component.
	*/
	function getGapBoxControlValueFromStyle(blockGapValue) {
		if (!blockGapValue) return null;
		const isValueString = typeof blockGapValue === "string";
		return {
			top: isValueString ? blockGapValue : blockGapValue?.top,
			left: isValueString ? blockGapValue : blockGapValue?.left
		};
	}
	/**
	* Returns a CSS value for the `gap` property from a given blockGap style.
	*
	* @param blockGapValue A block gap string or axial object value, e.g., '10px' or { top: '10px', left: '10px'}.
	* @param defaultValue  A default gap value.
	* @return The concatenated gap value (row and column).
	*/
	function getGapCSSValue(blockGapValue, defaultValue = "0") {
		const blockGapBoxControlValue = getGapBoxControlValueFromStyle(blockGapValue);
		if (!blockGapBoxControlValue) return null;
		const row = getSpacingPresetCssVar(blockGapBoxControlValue?.top) || defaultValue;
		const column = getSpacingPresetCssVar(blockGapBoxControlValue?.left) || defaultValue;
		return row === column ? row : `${row} ${column}`;
	}

// packages/global-styles-engine/build-module/utils/layout.mjs
	const LAYOUT_DEFINITIONS = {
		default: {
			name: "default",
			slug: "flow",
			className: "is-layout-flow",
			baseStyles: [
				{
					selector: " > .alignleft",
					rules: {
						float: "left",
						"margin-left": "0",
						"margin-right": "2em"
					}
				},
				{
					selector: " > .alignright",
					rules: {
						float: "right",
						"margin-left": "2em",
						"margin-right": "0"
					}
				},
				{
					selector: " > .aligncenter",
					rules: {
						"margin-left": "auto !important",
						"margin-right": "auto !important"
					}
				}
			],
			spacingStyles: [
				{
					selector: " > :first-child",
					rules: { "margin-block-start": "0" }
				},
				{
					selector: " > :last-child",
					rules: { "margin-block-end": "0" }
				},
				{
					selector: " > *",
					rules: {
						"margin-block-start": null,
						"margin-block-end": "0"
					}
				}
			]
		},
		constrained: {
			name: "constrained",
			slug: "constrained",
			className: "is-layout-constrained",
			baseStyles: [
				{
					selector: " > .alignleft",
					rules: {
						float: "left",
						"margin-left": "0",
						"margin-right": "2em"
					}
				},
				{
					selector: " > .alignright",
					rules: {
						float: "right",
						"margin-left": "2em",
						"margin-right": "0"
					}
				},
				{
					selector: " > .aligncenter",
					rules: {
						"margin-left": "auto !important",
						"margin-right": "auto !important"
					}
				},
				{
					selector: " > :where(:not(.alignleft):not(.alignright):not(.alignfull))",
					rules: {
						"max-width": "var(--wp--style--global--content-size)",
						"margin-left": "auto !important",
						"margin-right": "auto !important"
					}
				},
				{
					selector: " > .alignwide",
					rules: { "max-width": "var(--wp--style--global--wide-size)" }
				}
			],
			spacingStyles: [
				{
					selector: " > :first-child",
					rules: { "margin-block-start": "0" }
				},
				{
					selector: " > :last-child",
					rules: { "margin-block-end": "0" }
				},
				{
					selector: " > *",
					rules: {
						"margin-block-start": null,
						"margin-block-end": "0"
					}
				}
			]
		},
		flex: {
			name: "flex",
			slug: "flex",
			className: "is-layout-flex",
			displayMode: "flex",
			baseStyles: [{
				selector: "",
				rules: {
					"flex-wrap": "wrap",
					"align-items": "center"
				}
			}, {
				selector: " > :is(*, div)",
				rules: { margin: "0" }
			}],
			spacingStyles: [{
				selector: "",
				rules: { gap: null }
			}]
		},
		grid: {
			name: "grid",
			slug: "grid",
			className: "is-layout-grid",
			displayMode: "grid",
			baseStyles: [{
				selector: " > :is(*, div)",
				rules: { margin: "0" }
			}],
			spacingStyles: [{
				selector: "",
				rules: { gap: null }
			}]
		}
	};

// packages/global-styles-engine/build-module/core/render.mjs
/**
	* Get generated CSS for layout styles by looking up layout definitions provided
	* in theme.json, and outputting common layout styles, and specific blockGap values.
	*
	* @param props                       Layout styles configuration
	* @param props.layoutDefinitions     Layout definitions from theme.json
	* @param props.style                 Style object for the block
	* @param props.selector              Selector to apply the styles to
	* @param props.hasBlockGapSupport    Whether the block supports block gap styles
	* @param props.hasFallbackGapSupport Whether the block supports fallback gap styles
	* @param props.fallbackGapValue      Fallback gap value to use if block gap support is
	*
	* @return Generated CSS rules for the layout styles
	*/
	function getLayoutStyles({ layoutDefinitions = LAYOUT_DEFINITIONS, style, selector, hasBlockGapSupport, hasFallbackGapSupport, fallbackGapValue }) {
		let ruleset = "";
		const blockGapValue = style?.spacing?.blockGap;
		let gapValue = hasBlockGapSupport ? getGapCSSValue(blockGapValue) : "";
		if (hasFallbackGapSupport) {
			if (selector === "body") gapValue = !gapValue ? "0.5em" : gapValue;
			else if (!hasBlockGapSupport && fallbackGapValue) gapValue = fallbackGapValue;
		}
		const rowGapValue = hasBlockGapSupport && blockGapValue && typeof blockGapValue !== "string" ? getGapCSSValue(blockGapValue.top) : gapValue;
		if (gapValue && layoutDefinitions) {
			Object.values(layoutDefinitions).forEach(({ className, name, spacingStyles }) => {
				if (!hasBlockGapSupport && "flex" !== name && "grid" !== name) return;
				const layoutGapValue = ["default", "constrained"].includes(name) ? rowGapValue : gapValue;
				if (spacingStyles?.length) spacingStyles.forEach((spacingStyle) => {
					const declarations = [];
					if (spacingStyle.rules) Object.entries(spacingStyle.rules).forEach(([cssProperty, cssValue]) => {
						declarations.push(`${cssProperty}: ${cssValue ? cssValue : layoutGapValue}`);
					});
					if (declarations.length) {
						let combinedSelector = "";
						if (!hasBlockGapSupport) combinedSelector = selector === "body" ? `:where(.${className}${spacingStyle?.selector || ""})` : `:where(${selector}.${className}${spacingStyle?.selector || ""})`;
						else combinedSelector = selector === "body" ? `:root :where(.${className})${spacingStyle?.selector || ""}` : `:root :where(${selector}-${className})${spacingStyle?.selector || ""}`;
						ruleset += `${combinedSelector} { ${declarations.join("; ")}; }`;
					}
				});
			});
			if (selector === "body" && hasBlockGapSupport) ruleset += `${ROOT_CSS_PROPERTIES_SELECTOR} { --wp--style--block-gap: ${gapValue}; }`;
		}
		if (selector === "body" && layoutDefinitions) {
			const validDisplayModes = [
				"block",
				"flex",
				"grid"
			];
			Object.values(layoutDefinitions).forEach(({ className, displayMode, baseStyles }) => {
				if (displayMode && validDisplayModes.includes(displayMode)) ruleset += `${selector} .${className} { display:${displayMode}; }`;
				if (baseStyles?.length) baseStyles.forEach((baseStyle) => {
					const declarations = [];
					if (baseStyle.rules) Object.entries(baseStyle.rules).forEach(([cssProperty, cssValue]) => {
						declarations.push(`${cssProperty}: ${cssValue}`);
					});
					if (declarations.length) {
						const combinedSelector = `.${className}${baseStyle?.selector || ""}`;
						ruleset += `${combinedSelector} { ${declarations.join("; ")}; }`;
					}
				});
			});
		}
		return ruleset;
	}

// packages/edit-post/build-module/components/back-button/fullscreen-mode-close.mjs
	function FullscreenModeClose({ showTooltip, icon, href, initialPost }) {
		const postType = (0, _wordpress_data.useSelect)((select) => {
			const { getCurrentPostType } = select(_wordpress_editor.store);
			const { getPostType } = select(_wordpress_core_data.store);
			return getPostType(initialPost?.type || getCurrentPostType());
		}, [initialPost?.type]);
		if (!postType) return null;
		const buttonHref = href ?? (0, _wordpress_url.addQueryArgs)("edit.php", { post_type: postType.slug });
		const buttonLabel = postType?.labels?.view_items ?? (0, _wordpress_i18n.__)("Back");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
			size: "compact",
			href: buttonHref,
			label: buttonLabel,
			showTooltip,
			tooltipPosition: "bottom",
			icon: icon ?? ((0, _wordpress_i18n.isRTL)() ? chevron_right_default : chevron_left_default)
		});
	}

// packages/edit-post/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/edit-post");

// packages/edit-post/build-module/components/back-button/index.mjs
	const { BackButton: BackButtonFill } = unlock(_wordpress_editor.privateApis);
	const slideX = {
		hidden: { x: "-100%" },
		distractionFreeInactive: { x: 0 },
		hover: {
			x: 0,
			transition: {
				type: "tween",
				delay: .2
			}
		}
	};
	function BackButton({ initialPost }) {
		const showIconLabels = (0, _wordpress_data.useSelect)((select) => {
			return select(_wordpress_preferences.store).get("core", "showIconLabels");
		}, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BackButtonFill, { children: ({ length }) => length <= 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.__unstableMotion.div, {
			variants: slideX,
			transition: {
				type: "tween",
				delay: .8
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FullscreenModeClose, {
				showTooltip: !showIconLabels,
				initialPost
			})
		}) });
	}

// packages/edit-post/build-module/store/constants.mjs
/**
	* The identifier for the data store.
	*
	* @type {string}
	*/
	const STORE_NAME = "core/edit-post";
	/**
	* CSS selector string for the admin bar view post link anchor tag.
	*
	* @type {string}
	*/
	const VIEW_AS_LINK_SELECTOR = "#wp-admin-bar-view a";
	/**
	* CSS selector string for the admin bar preview post link anchor tag.
	*
	* @type {string}
	*/
	const VIEW_AS_PREVIEW_LINK_SELECTOR = "#wp-admin-bar-preview a";

// packages/edit-post/build-module/components/editor-initialization/listener-hooks.mjs
/**
	* This listener hook monitors any change in permalink and updates the view
	* post link in the admin bar.
	*/
	const useUpdatePostLinkListener = () => {
		const { isViewable, newPermalink } = (0, _wordpress_data.useSelect)((select) => {
			const { getPostType } = select(_wordpress_core_data.store);
			const { getCurrentPost, getEditedPostAttribute } = select(_wordpress_editor.store);
			return {
				isViewable: getPostType(getEditedPostAttribute("type"))?.viewable,
				newPermalink: getCurrentPost().link
			};
		}, []);
		const nodeToUpdateRef = (0, _wordpress_element.useRef)();
		(0, _wordpress_element.useEffect)(() => {
			nodeToUpdateRef.current = document.querySelector("#wp-admin-bar-preview a") || document.querySelector("#wp-admin-bar-view a");
		}, []);
		(0, _wordpress_element.useEffect)(() => {
			if (!newPermalink || !nodeToUpdateRef.current) return;
			if (!isViewable) {
				nodeToUpdateRef.current.style.display = "none";
				return;
			}
			nodeToUpdateRef.current.style.display = "";
			nodeToUpdateRef.current.setAttribute("href", newPermalink);
		}, [newPermalink, isViewable]);
	};

// packages/edit-post/build-module/components/editor-initialization/index.mjs
/**
	* Data component used for initializing the editor and re-initializes
	* when postId changes or on unmount.
	*
	* @return {null} This is a data component so does not render any ui.
	*/
	function EditorInitialization() {
		useUpdatePostLinkListener();
		return null;
	}

// packages/edit-post/build-module/store/reducer.mjs
/**
	* Reducer keeping track of the meta boxes isSaving state.
	* A "true" value means the meta boxes saving request is in-flight.
	*
	*
	* @param {boolean} state  Previous state.
	* @param {Object}  action Action Object.
	*
	* @return {Object} Updated state.
	*/
	function isSavingMetaBoxes$1(state = false, action) {
		switch (action.type) {
			case "REQUEST_META_BOX_UPDATES": return true;
			case "META_BOX_UPDATES_SUCCESS":
			case "META_BOX_UPDATES_FAILURE": return false;
			default: return state;
		}
	}
	function mergeMetaboxes(metaboxes = [], newMetaboxes) {
		const mergedMetaboxes = [...metaboxes];
		for (const metabox of newMetaboxes) {
			const existing = mergedMetaboxes.findIndex((box) => box.id === metabox.id);
			if (existing !== -1) mergedMetaboxes[existing] = {
				...mergedMetaboxes[existing],
				...metabox
			};
			else mergedMetaboxes.push(metabox);
		}
		return mergedMetaboxes;
	}
	/**
	* Reducer keeping track of the meta boxes per location.
	*
	* @param {boolean} state  Previous state.
	* @param {Object}  action Action Object.
	*
	* @return {Object} Updated state.
	*/
	function metaBoxLocations(state = {}, action) {
		switch (action.type) {
			case "SET_META_BOXES_PER_LOCATIONS": {
				const newState = { ...state };
				for (const [location, metaboxes] of Object.entries(action.metaBoxesPerLocation)) newState[location] = mergeMetaboxes(newState[location], metaboxes);
				return newState;
			}
		}
		return state;
	}
	/**
	* Reducer tracking whether meta boxes are initialized.
	*
	* @param {boolean} state
	* @param {Object}  action
	*
	* @return {boolean} Updated state.
	*/
	function metaBoxesInitialized$1(state = false, action) {
		switch (action.type) {
			case "META_BOXES_INITIALIZED": return true;
		}
		return state;
	}
	const metaBoxes = (0, _wordpress_data.combineReducers)({
		isSaving: isSavingMetaBoxes$1,
		locations: metaBoxLocations,
		initialized: metaBoxesInitialized$1
	});
	var reducer_default = (0, _wordpress_data.combineReducers)({ metaBoxes });

// packages/edit-post/build-module/utils/meta-boxes.mjs
/**
	* Function returning the current Meta Boxes DOM Node in the editor
	* whether the meta box area is opened or not.
	* If the MetaBox Area is visible returns it, and returns the original container instead.
	*
	* @param {string} location Meta Box location.
	*
	* @return {string} HTML content.
	*/
	const getMetaBoxContainer = (location) => {
		const area = document.querySelector(`.edit-post-meta-boxes-area.is-${location} .metabox-location-${location}`);
		if (area) return area;
		return document.querySelector("#metaboxes .metabox-location-" + location);
	};

// packages/edit-post/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		__experimentalSetPreviewDeviceType: () => __experimentalSetPreviewDeviceType,
		__unstableCreateTemplate: () => __unstableCreateTemplate,
		closeGeneralSidebar: () => closeGeneralSidebar,
		closeModal: () => closeModal,
		closePublishSidebar: () => closePublishSidebar,
		hideBlockTypes: () => hideBlockTypes,
		initializeMetaBoxes: () => initializeMetaBoxes,
		metaBoxUpdatesFailure: () => metaBoxUpdatesFailure,
		metaBoxUpdatesSuccess: () => metaBoxUpdatesSuccess,
		openGeneralSidebar: () => openGeneralSidebar,
		openModal: () => openModal,
		openPublishSidebar: () => openPublishSidebar,
		removeEditorPanel: () => removeEditorPanel,
		requestMetaBoxUpdates: () => requestMetaBoxUpdates,
		setAvailableMetaBoxesPerLocation: () => setAvailableMetaBoxesPerLocation,
		setIsEditingTemplate: () => setIsEditingTemplate,
		setIsInserterOpened: () => setIsInserterOpened,
		setIsListViewOpened: () => setIsListViewOpened,
		showBlockTypes: () => showBlockTypes,
		switchEditorMode: () => switchEditorMode,
		toggleDistractionFree: () => toggleDistractionFree,
		toggleEditorPanelEnabled: () => toggleEditorPanelEnabled,
		toggleEditorPanelOpened: () => toggleEditorPanelOpened,
		toggleFeature: () => toggleFeature,
		toggleFullscreenMode: () => toggleFullscreenMode,
		togglePinnedPluginItem: () => togglePinnedPluginItem,
		togglePublishSidebar: () => togglePublishSidebar,
		updatePreferredStyleVariations: () => updatePreferredStyleVariations
	}, 1);
	const { interfaceStore: interfaceStore$1 } = unlock(_wordpress_editor.privateApis);
	/**
	* Returns an action object used in signalling that the user opened an editor sidebar.
	*
	* @param {?string} name Sidebar name to be opened.
	*/
	const openGeneralSidebar = (name) => ({ registry }) => {
		registry.dispatch(interfaceStore$1).enableComplementaryArea("core", name);
	};
	/**
	* Returns an action object signalling that the user closed the sidebar.
	*/
	const closeGeneralSidebar = () => ({ registry }) => registry.dispatch(interfaceStore$1).disableComplementaryArea("core");
	/**
	* Returns an action object used in signalling that the user opened a modal.
	*
	* @deprecated since WP 6.3 use `core/interface` store's action with the same name instead.
	*
	*
	* @param {string} name A string that uniquely identifies the modal.
	*
	* @return {Object} Action object.
	*/
	const openModal = (name) => ({ registry }) => {
		(0, _wordpress_deprecated.default)("select( 'core/edit-post' ).openModal( name )", {
			since: "6.3",
			alternative: "select( 'core/interface').openModal( name )"
		});
		return registry.dispatch(interfaceStore$1).openModal(name);
	};
	/**
	* Returns an action object signalling that the user closed a modal.
	*
	* @deprecated since WP 6.3 use `core/interface` store's action with the same name instead.
	*
	* @return {Object} Action object.
	*/
	const closeModal = () => ({ registry }) => {
		(0, _wordpress_deprecated.default)("select( 'core/edit-post' ).closeModal()", {
			since: "6.3",
			alternative: "select( 'core/interface').closeModal()"
		});
		return registry.dispatch(interfaceStore$1).closeModal();
	};
	/**
	* Returns an action object used in signalling that the user opened the publish
	* sidebar.
	* @deprecated
	*
	* @return {Object} Action object
	*/
	const openPublishSidebar = () => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).openPublishSidebar", {
			since: "6.6",
			alternative: "dispatch( 'core/editor').openPublishSidebar"
		});
		registry.dispatch(_wordpress_editor.store).openPublishSidebar();
	};
	/**
	* Returns an action object used in signalling that the user closed the
	* publish sidebar.
	* @deprecated
	*
	* @return {Object} Action object.
	*/
	const closePublishSidebar = () => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).closePublishSidebar", {
			since: "6.6",
			alternative: "dispatch( 'core/editor').closePublishSidebar"
		});
		registry.dispatch(_wordpress_editor.store).closePublishSidebar();
	};
	/**
	* Returns an action object used in signalling that the user toggles the publish sidebar.
	* @deprecated
	*
	* @return {Object} Action object
	*/
	const togglePublishSidebar = () => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).togglePublishSidebar", {
			since: "6.6",
			alternative: "dispatch( 'core/editor').togglePublishSidebar"
		});
		registry.dispatch(_wordpress_editor.store).togglePublishSidebar();
	};
	/**
	* Returns an action object used to enable or disable a panel in the editor.
	*
	* @deprecated
	*
	* @param {string} panelName A string that identifies the panel to enable or disable.
	*
	* @return {Object} Action object.
	*/
	const toggleEditorPanelEnabled = (panelName) => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).toggleEditorPanelEnabled", {
			since: "6.5",
			alternative: "dispatch( 'core/editor').toggleEditorPanelEnabled"
		});
		registry.dispatch(_wordpress_editor.store).toggleEditorPanelEnabled(panelName);
	};
	/**
	* Opens a closed panel and closes an open panel.
	*
	* @deprecated
	*
	* @param {string} panelName A string that identifies the panel to open or close.
	*/
	const toggleEditorPanelOpened = (panelName) => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).toggleEditorPanelOpened", {
			since: "6.5",
			alternative: "dispatch( 'core/editor').toggleEditorPanelOpened"
		});
		registry.dispatch(_wordpress_editor.store).toggleEditorPanelOpened(panelName);
	};
	/**
	* Returns an action object used to remove a panel from the editor.
	*
	* @deprecated
	*
	* @param {string} panelName A string that identifies the panel to remove.
	*
	* @return {Object} Action object.
	*/
	const removeEditorPanel = (panelName) => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).removeEditorPanel", {
			since: "6.5",
			alternative: "dispatch( 'core/editor').removeEditorPanel"
		});
		registry.dispatch(_wordpress_editor.store).removeEditorPanel(panelName);
	};
	/**
	* Triggers an action used to toggle a feature flag.
	*
	* @param {string} feature Feature name.
	*/
	const toggleFeature = (feature) => ({ registry }) => registry.dispatch(_wordpress_preferences.store).toggle("core/edit-post", feature);
	/**
	* Triggers an action used to switch editor mode.
	*
	* @deprecated
	*
	* @param {string} mode The editor mode.
	*/
	const switchEditorMode = (mode) => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).switchEditorMode", {
			since: "6.6",
			alternative: "dispatch( 'core/editor').switchEditorMode"
		});
		registry.dispatch(_wordpress_editor.store).switchEditorMode(mode);
	};
	/**
	* Triggers an action object used to toggle a plugin name flag.
	*
	* @param {string} pluginName Plugin name.
	*/
	const togglePinnedPluginItem = (pluginName) => ({ registry }) => {
		const isPinned = registry.select(interfaceStore$1).isItemPinned("core", pluginName);
		registry.dispatch(interfaceStore$1)[isPinned ? "unpinItem" : "pinItem"]("core", pluginName);
	};
	/**
	* Returns an action object used in signaling that a style should be auto-applied when a block is created.
	*
	* @deprecated
	*/
	function updatePreferredStyleVariations() {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).updatePreferredStyleVariations", {
			since: "6.6",
			hint: "Preferred Style Variations are not supported anymore."
		});
		return { type: "NOTHING" };
	}
	/**
	* Update the provided block types to be visible.
	*
	* @param {string[]} blockNames Names of block types to show.
	*/
	const showBlockTypes = (blockNames) => ({ registry }) => {
		unlock(registry.dispatch(_wordpress_editor.store)).showBlockTypes(blockNames);
	};
	/**
	* Update the provided block types to be hidden.
	*
	* @param {string[]} blockNames Names of block types to hide.
	*/
	const hideBlockTypes = (blockNames) => ({ registry }) => {
		unlock(registry.dispatch(_wordpress_editor.store)).hideBlockTypes(blockNames);
	};
	/**
	* Stores info about which Meta boxes are available in which location.
	*
	* @param {Object} metaBoxesPerLocation Meta boxes per location.
	*/
	function setAvailableMetaBoxesPerLocation(metaBoxesPerLocation) {
		return {
			type: "SET_META_BOXES_PER_LOCATIONS",
			metaBoxesPerLocation
		};
	}
	/**
	* Update a metabox.
	*/
	const requestMetaBoxUpdates = () => async ({ registry, select, dispatch }) => {
		dispatch({ type: "REQUEST_META_BOX_UPDATES" });
		if (window.tinyMCE) window.tinyMCE.triggerSave();
		const baseFormData = new window.FormData(document.querySelector(".metabox-base-form"));
		const postId = baseFormData.get("post_ID");
		const postType = baseFormData.get("post_type");
		const post = registry.select(_wordpress_core_data.store).getEditedEntityRecord("postType", postType, postId);
		const additionalData = [
			post.comment_status ? ["comment_status", post.comment_status] : false,
			post.ping_status ? ["ping_status", post.ping_status] : false,
			post.sticky ? ["sticky", post.sticky] : false,
			post.author ? ["post_author", post.author] : false
		].filter(Boolean);
		const formData = [baseFormData, ...select.getActiveMetaBoxLocations().map((location) => new window.FormData(getMetaBoxContainer(location)))].reduce((memo, currentFormData) => {
			for (const [key, value] of currentFormData) memo.append(key, value);
			return memo;
		}, new window.FormData());
		additionalData.forEach(([key, value]) => formData.append(key, value));
		try {
			await (0, _wordpress_api_fetch.default)({
				url: window._wpMetaBoxUrl,
				method: "POST",
				body: formData,
				parse: false
			});
			dispatch.metaBoxUpdatesSuccess();
		} catch {
			dispatch.metaBoxUpdatesFailure();
		}
	};
	/**
	* Returns an action object used to signal a successful meta box update.
	*
	* @return {Object} Action object.
	*/
	function metaBoxUpdatesSuccess() {
		return { type: "META_BOX_UPDATES_SUCCESS" };
	}
	/**
	* Returns an action object used to signal a failed meta box update.
	*
	* @return {Object} Action object.
	*/
	function metaBoxUpdatesFailure() {
		return { type: "META_BOX_UPDATES_FAILURE" };
	}
	/**
	* Action that changes the width of the editing canvas.
	*
	* @deprecated
	*
	* @param {string} deviceType
	*/
	const __experimentalSetPreviewDeviceType = (deviceType) => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).__experimentalSetPreviewDeviceType", {
			since: "6.5",
			version: "6.7",
			hint: "registry.dispatch( editorStore ).setDeviceType"
		});
		registry.dispatch(_wordpress_editor.store).setDeviceType(deviceType);
	};
	/**
	* Returns an action object used to open/close the inserter.
	*
	* @deprecated
	*
	* @param {boolean|Object} value Whether the inserter should be opened (true) or closed (false).
	*/
	const setIsInserterOpened = (value) => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).setIsInserterOpened", {
			since: "6.5",
			alternative: "dispatch( 'core/editor').setIsInserterOpened"
		});
		registry.dispatch(_wordpress_editor.store).setIsInserterOpened(value);
	};
	/**
	* Returns an action object used to open/close the list view.
	*
	* @deprecated
	*
	* @param {boolean} isOpen A boolean representing whether the list view should be opened or closed.
	*/
	const setIsListViewOpened = (isOpen) => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).setIsListViewOpened", {
			since: "6.5",
			alternative: "dispatch( 'core/editor').setIsListViewOpened"
		});
		registry.dispatch(_wordpress_editor.store).setIsListViewOpened(isOpen);
	};
	/**
	* Returns an action object used to switch to template editing.
	*
	* @deprecated
	*/
	function setIsEditingTemplate() {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).setIsEditingTemplate", {
			since: "6.5",
			alternative: "dispatch( 'core/editor').setRenderingMode"
		});
		return { type: "NOTHING" };
	}
	/**
	* Create a block based template.
	*
	* @deprecated
	*/
	function __unstableCreateTemplate() {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).__unstableCreateTemplate", { since: "6.5" });
		return { type: "NOTHING" };
	}
	let metaBoxesInitialized = false;
	/**
	* Initializes WordPress `postboxes` script and the logic for saving meta boxes.
	*/
	const initializeMetaBoxes = () => ({ registry, select, dispatch }) => {
		if (!registry.select(_wordpress_editor.store).__unstableIsEditorReady()) return;
		if (metaBoxesInitialized) return;
		const postType = registry.select(_wordpress_editor.store).getCurrentPostType();
		if (window.postboxes.page !== postType) window.postboxes.add_postbox_toggles(postType);
		metaBoxesInitialized = true;
		(0, _wordpress_hooks.addAction)("editor.savePost", "core/edit-post/save-metaboxes", async (post, options) => {
			if (!options.isAutosave && select.hasMetaBoxes()) await dispatch.requestMetaBoxUpdates();
		});
		dispatch({ type: "META_BOXES_INITIALIZED" });
	};
	/**
	* Action that toggles Distraction free mode.
	* Distraction free mode expects there are no sidebars, as due to the
	* z-index values set, you can't close sidebars.
	*
	* @deprecated
	*/
	const toggleDistractionFree = () => ({ registry }) => {
		(0, _wordpress_deprecated.default)("dispatch( 'core/edit-post' ).toggleDistractionFree", {
			since: "6.6",
			alternative: "dispatch( 'core/editor').toggleDistractionFree"
		});
		registry.dispatch(_wordpress_editor.store).toggleDistractionFree();
	};
	/**
	* Action that toggles the Fullscreen Mode view option.
	*/
	const toggleFullscreenMode = () => ({ registry }) => {
		const isFullscreen = registry.select(_wordpress_preferences.store).get("core/edit-post", "fullscreenMode");
		registry.dispatch(_wordpress_preferences.store).toggle("core/edit-post", "fullscreenMode");
		registry.dispatch(_wordpress_notices.store).createInfoNotice(isFullscreen ? (0, _wordpress_i18n.__)("Fullscreen mode deactivated.") : (0, _wordpress_i18n.__)("Fullscreen mode activated."), {
			id: "core/edit-post/toggle-fullscreen-mode/notice",
			type: "snackbar",
			actions: [{
				label: (0, _wordpress_i18n.__)("Undo"),
				onClick: () => {
					registry.dispatch(_wordpress_preferences.store).toggle("core/edit-post", "fullscreenMode");
				}
			}]
		});
	};

// packages/edit-post/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		__experimentalGetInsertionPoint: () => __experimentalGetInsertionPoint,
		__experimentalGetPreviewDeviceType: () => __experimentalGetPreviewDeviceType,
		areMetaBoxesInitialized: () => areMetaBoxesInitialized,
		getActiveGeneralSidebarName: () => getActiveGeneralSidebarName,
		getActiveMetaBoxLocations: () => getActiveMetaBoxLocations,
		getAllMetaBoxes: () => getAllMetaBoxes,
		getEditedPostTemplate: () => getEditedPostTemplate,
		getEditorMode: () => getEditorMode,
		getHiddenBlockTypes: () => getHiddenBlockTypes,
		getMetaBoxesPerLocation: () => getMetaBoxesPerLocation,
		getPreference: () => getPreference,
		getPreferences: () => getPreferences,
		hasMetaBoxes: () => hasMetaBoxes,
		isEditingTemplate: () => isEditingTemplate,
		isEditorPanelEnabled: () => isEditorPanelEnabled,
		isEditorPanelOpened: () => isEditorPanelOpened,
		isEditorPanelRemoved: () => isEditorPanelRemoved,
		isEditorSidebarOpened: () => isEditorSidebarOpened,
		isFeatureActive: () => isFeatureActive,
		isInserterOpened: () => isInserterOpened,
		isListViewOpened: () => isListViewOpened,
		isMetaBoxLocationActive: () => isMetaBoxLocationActive,
		isMetaBoxLocationVisible: () => isMetaBoxLocationVisible,
		isModalActive: () => isModalActive,
		isPluginItemPinned: () => isPluginItemPinned,
		isPluginSidebarOpened: () => isPluginSidebarOpened,
		isPublishSidebarOpened: () => isPublishSidebarOpened,
		isSavingMetaBoxes: () => isSavingMetaBoxes
	}, 1);
	const { interfaceStore } = unlock(_wordpress_editor.privateApis);
	const EMPTY_ARRAY = [];
	const EMPTY_OBJECT = {};
	/**
	* Returns the current editing mode.
	*
	* @param {Object} state Global application state.
	*
	* @return {string} Editing mode.
	*/
	const getEditorMode = (0, _wordpress_data.createRegistrySelector)((select) => () => select(_wordpress_preferences.store).get("core", "editorMode") ?? "visual");
	/**
	* Returns true if the editor sidebar is opened.
	*
	* @param {Object} state Global application state
	*
	* @return {boolean} Whether the editor sidebar is opened.
	*/
	const isEditorSidebarOpened = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		const activeGeneralSidebar = select(interfaceStore).getActiveComplementaryArea("core");
		return ["edit-post/document", "edit-post/block"].includes(activeGeneralSidebar);
	});
	/**
	* Returns true if the plugin sidebar is opened.
	*
	* @param {Object} state Global application state.
	*
	* @return {boolean} Whether the plugin sidebar is opened.
	*/
	const isPluginSidebarOpened = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		const activeGeneralSidebar = select(interfaceStore).getActiveComplementaryArea("core");
		return !!activeGeneralSidebar && !["edit-post/document", "edit-post/block"].includes(activeGeneralSidebar);
	});
	/**
	* Returns the current active general sidebar name, or null if there is no
	* general sidebar active. The active general sidebar is a unique name to
	* identify either an editor or plugin sidebar.
	*
	* Examples:
	*
	*  - `edit-post/document`
	*  - `my-plugin/insert-image-sidebar`
	*
	* @param {Object} state Global application state.
	*
	* @return {?string} Active general sidebar name.
	*/
	const getActiveGeneralSidebarName = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		return select(interfaceStore).getActiveComplementaryArea("core");
	});
	/**
	* Converts panels from the new preferences store format to the old format
	* that the post editor previously used.
	*
	* The resultant converted data should look like this:
	* {
	*     panelName: {
	*         enabled: false,
	*         opened: true,
	*     },
	*     anotherPanelName: {
	*         opened: true
	*     },
	* }
	*
	* @param {string[] | undefined} inactivePanels An array of inactive panel names.
	* @param {string[] | undefined} openPanels     An array of open panel names.
	*
	* @return {Object} The converted panel data.
	*/
	function convertPanelsToOldFormat(inactivePanels, openPanels) {
		const panelsWithEnabledState = inactivePanels?.reduce((accumulatedPanels, panelName) => ({
			...accumulatedPanels,
			[panelName]: { enabled: false }
		}), {});
		return openPanels?.reduce((accumulatedPanels, panelName) => {
			const currentPanelState = accumulatedPanels?.[panelName];
			return {
				...accumulatedPanels,
				[panelName]: {
					...currentPanelState,
					opened: true
				}
			};
		}, panelsWithEnabledState ?? {}) ?? panelsWithEnabledState ?? EMPTY_OBJECT;
	}
	/**
	* Returns the preferences (these preferences are persisted locally).
	*
	* @param {Object} state Global application state.
	*
	* @return {Object} Preferences Object.
	*/
	const getPreferences = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).getPreferences`, {
			since: "6.0",
			alternative: `select( 'core/preferences' ).get`
		});
		const corePreferences = ["editorMode", "hiddenBlockTypes"].reduce((accumulatedPrefs, preferenceKey) => {
			const value = select(_wordpress_preferences.store).get("core", preferenceKey);
			return {
				...accumulatedPrefs,
				[preferenceKey]: value
			};
		}, {});
		const panels = convertPanelsToOldFormat(select(_wordpress_preferences.store).get("core", "inactivePanels"), select(_wordpress_preferences.store).get("core", "openPanels"));
		return {
			...corePreferences,
			panels
		};
	});
	/**
	*
	* @param {Object} state         Global application state.
	* @param {string} preferenceKey Preference Key.
	* @param {*}      defaultValue  Default Value.
	*
	* @return {*} Preference Value.
	*/
	function getPreference(state, preferenceKey, defaultValue) {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).getPreference`, {
			since: "6.0",
			alternative: `select( 'core/preferences' ).get`
		});
		const value = getPreferences(state)[preferenceKey];
		return value === void 0 ? defaultValue : value;
	}
	/**
	* Returns an array of blocks that are hidden.
	*
	* @return {Array} A list of the hidden block types
	*/
	const getHiddenBlockTypes = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		return select(_wordpress_preferences.store).get("core", "hiddenBlockTypes") ?? EMPTY_ARRAY;
	});
	/**
	* Returns true if the publish sidebar is opened.
	*
	* @deprecated
	*
	* @param {Object} state Global application state
	*
	* @return {boolean} Whether the publish sidebar is open.
	*/
	const isPublishSidebarOpened = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).isPublishSidebarOpened`, {
			since: "6.6",
			alternative: `select( 'core/editor' ).isPublishSidebarOpened`
		});
		return select(_wordpress_editor.store).isPublishSidebarOpened();
	});
	/**
	* Returns true if the given panel was programmatically removed, or false otherwise.
	* All panels are not removed by default.
	*
	* @deprecated
	*
	* @param {Object} state     Global application state.
	* @param {string} panelName A string that identifies the panel.
	*
	* @return {boolean} Whether or not the panel is removed.
	*/
	const isEditorPanelRemoved = (0, _wordpress_data.createRegistrySelector)((select) => (state, panelName) => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).isEditorPanelRemoved`, {
			since: "6.5",
			alternative: `select( 'core/editor' ).isEditorPanelRemoved`
		});
		return select(_wordpress_editor.store).isEditorPanelRemoved(panelName);
	});
	/**
	* Returns true if the given panel is enabled, or false otherwise. Panels are
	* enabled by default.
	*
	* @deprecated
	*
	* @param {Object} state     Global application state.
	* @param {string} panelName A string that identifies the panel.
	*
	* @return {boolean} Whether or not the panel is enabled.
	*/
	const isEditorPanelEnabled = (0, _wordpress_data.createRegistrySelector)((select) => (state, panelName) => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).isEditorPanelEnabled`, {
			since: "6.5",
			alternative: `select( 'core/editor' ).isEditorPanelEnabled`
		});
		return select(_wordpress_editor.store).isEditorPanelEnabled(panelName);
	});
	/**
	* Returns true if the given panel is open, or false otherwise. Panels are
	* closed by default.
	*
	* @deprecated
	*
	* @param {Object} state     Global application state.
	* @param {string} panelName A string that identifies the panel.
	*
	* @return {boolean} Whether or not the panel is open.
	*/
	const isEditorPanelOpened = (0, _wordpress_data.createRegistrySelector)((select) => (state, panelName) => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).isEditorPanelOpened`, {
			since: "6.5",
			alternative: `select( 'core/editor' ).isEditorPanelOpened`
		});
		return select(_wordpress_editor.store).isEditorPanelOpened(panelName);
	});
	/**
	* Returns true if a modal is active, or false otherwise.
	*
	* @deprecated since WP 6.3 use `core/interface` store's selector with the same name instead.
	*
	* @param {Object} state     Global application state.
	* @param {string} modalName A string that uniquely identifies the modal.
	*
	* @return {boolean} Whether the modal is active.
	*/
	const isModalActive = (0, _wordpress_data.createRegistrySelector)((select) => (state, modalName) => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).isModalActive`, {
			since: "6.3",
			alternative: `select( 'core/interface' ).isModalActive`
		});
		return !!select(interfaceStore).isModalActive(modalName);
	});
	/**
	* Returns whether the given feature is enabled or not.
	*
	* @param {Object} state   Global application state.
	* @param {string} feature Feature slug.
	*
	* @return {boolean} Is active.
	*/
	const isFeatureActive = (0, _wordpress_data.createRegistrySelector)((select) => (state, feature) => {
		return !!select(_wordpress_preferences.store).get("core/edit-post", feature);
	});
	/**
	* Returns true if the plugin item is pinned to the header.
	* When the value is not set it defaults to true.
	*
	* @param {Object} state      Global application state.
	* @param {string} pluginName Plugin item name.
	*
	* @return {boolean} Whether the plugin item is pinned.
	*/
	const isPluginItemPinned = (0, _wordpress_data.createRegistrySelector)((select) => (state, pluginName) => {
		return select(interfaceStore).isItemPinned("core", pluginName);
	});
	/**
	* Returns an array of active meta box locations.
	*
	* @param {Object} state Post editor state.
	*
	* @return {string[]} Active meta box locations.
	*/
	const getActiveMetaBoxLocations = (0, _wordpress_data.createSelector)((state) => {
		return Object.keys(state.metaBoxes.locations).filter((location) => isMetaBoxLocationActive(state, location));
	}, (state) => [state.metaBoxes.locations]);
	/**
	* Returns true if a metabox location is active and visible
	*
	* @param {Object} state    Post editor state.
	* @param {string} location Meta box location to test.
	*
	* @return {boolean} Whether the meta box location is active and visible.
	*/
	const isMetaBoxLocationVisible = (0, _wordpress_data.createRegistrySelector)((select) => (state, location) => {
		return isMetaBoxLocationActive(state, location) && getMetaBoxesPerLocation(state, location)?.some(({ id }) => {
			return select(_wordpress_editor.store).isEditorPanelEnabled(`meta-box-${id}`);
		});
	});
	/**
	* Returns true if there is an active meta box in the given location, or false
	* otherwise.
	*
	* @param {Object} state    Post editor state.
	* @param {string} location Meta box location to test.
	*
	* @return {boolean} Whether the meta box location is active.
	*/
	function isMetaBoxLocationActive(state, location) {
		const metaBoxes = getMetaBoxesPerLocation(state, location);
		return !!metaBoxes && metaBoxes.length !== 0;
	}
	/**
	* Returns the list of all the available meta boxes for a given location.
	*
	* @param {Object} state    Global application state.
	* @param {string} location Meta box location to test.
	*
	* @return {?Array} List of meta boxes.
	*/
	function getMetaBoxesPerLocation(state, location) {
		return state.metaBoxes.locations[location];
	}
	/**
	* Returns the list of all the available meta boxes.
	*
	* @param {Object} state Global application state.
	*
	* @return {Array} List of meta boxes.
	*/
	const getAllMetaBoxes = (0, _wordpress_data.createSelector)((state) => {
		return Object.values(state.metaBoxes.locations).flat();
	}, (state) => [state.metaBoxes.locations]);
	/**
	* Returns true if the post is using Meta Boxes
	*
	* @param {Object} state Global application state
	*
	* @return {boolean} Whether there are metaboxes or not.
	*/
	function hasMetaBoxes(state) {
		return getActiveMetaBoxLocations(state).length > 0;
	}
	/**
	* Returns true if the Meta Boxes are being saved.
	*
	* @param {Object} state Global application state.
	*
	* @return {boolean} Whether the metaboxes are being saved.
	*/
	function isSavingMetaBoxes(state) {
		return state.metaBoxes.isSaving;
	}
	/**
	* Returns the current editing canvas device type.
	*
	* @deprecated
	*
	* @param {Object} state Global application state.
	*
	* @return {string} Device type.
	*/
	const __experimentalGetPreviewDeviceType = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-site' ).__experimentalGetPreviewDeviceType`, {
			since: "6.5",
			version: "6.7",
			alternative: `select( 'core/editor' ).getDeviceType`
		});
		return select(_wordpress_editor.store).getDeviceType();
	});
	/**
	* Returns true if the inserter is opened.
	*
	* @deprecated
	*
	* @param {Object} state Global application state.
	*
	* @return {boolean} Whether the inserter is opened.
	*/
	const isInserterOpened = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).isInserterOpened`, {
			since: "6.5",
			alternative: `select( 'core/editor' ).isInserterOpened`
		});
		return select(_wordpress_editor.store).isInserterOpened();
	});
	/**
	* Get the insertion point for the inserter.
	*
	* @deprecated
	*
	* @param {Object} state Global application state.
	*
	* @return {Object} The root client ID, index to insert at and starting filter value.
	*/
	const __experimentalGetInsertionPoint = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).__experimentalGetInsertionPoint`, {
			since: "6.5",
			version: "6.7"
		});
		return unlock(select(_wordpress_editor.store)).getInserter();
	});
	/**
	* Returns true if the list view is opened.
	*
	* @param {Object} state Global application state.
	*
	* @return {boolean} Whether the list view is opened.
	*/
	const isListViewOpened = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).isListViewOpened`, {
			since: "6.5",
			alternative: `select( 'core/editor' ).isListViewOpened`
		});
		return select(_wordpress_editor.store).isListViewOpened();
	});
	/**
	* Returns true if the template editing mode is enabled.
	*
	* @deprecated
	*/
	const isEditingTemplate = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		(0, _wordpress_deprecated.default)(`select( 'core/edit-post' ).isEditingTemplate`, {
			since: "6.5",
			alternative: `select( 'core/editor' ).getRenderingMode`
		});
		return select(_wordpress_editor.store).getCurrentPostType() === "wp_template";
	});
	/**
	* Returns true if meta boxes are initialized.
	*
	* @param {Object} state Global application state.
	*
	* @return {boolean} Whether meta boxes are initialized.
	*/
	function areMetaBoxesInitialized(state) {
		return state.metaBoxes.initialized;
	}
	/**
	* Retrieves the template of the currently edited post.
	*
	* @return {?Object} Post Template.
	*/
	const getEditedPostTemplate = (0, _wordpress_data.createRegistrySelector)((select) => () => {
		const { id: postId, type: postType } = select(_wordpress_editor.store).getCurrentPost();
		const templateId = unlock(select(_wordpress_core_data.store)).getTemplateId(postType, postId);
		if (!templateId) return;
		return select(_wordpress_core_data.store).getEditedEntityRecord("postType", "wp_template", templateId);
	});

// packages/edit-post/build-module/store/index.mjs
/**
	* Store definition for the edit post namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*
	* @type {Object}
	*/
	const store = (0, _wordpress_data.createReduxStore)(STORE_NAME, {
		reducer: reducer_default,
		actions: actions_exports,
		selectors: selectors_exports
	});
	(0, _wordpress_data.register)(store);

// packages/edit-post/build-module/components/keyboard-shortcuts/index.mjs
	function KeyboardShortcuts() {
		const { toggleFullscreenMode } = (0, _wordpress_data.useDispatch)(store);
		const { registerShortcut } = (0, _wordpress_data.useDispatch)(_wordpress_keyboard_shortcuts.store);
		(0, _wordpress_element.useEffect)(() => {
			registerShortcut({
				name: "core/edit-post/toggle-fullscreen",
				category: "global",
				description: (0, _wordpress_i18n.__)("Enable or disable fullscreen mode."),
				keyCombination: {
					modifier: "secondary",
					character: "f"
				}
			});
		}, []);
		(0, _wordpress_keyboard_shortcuts.useShortcut)("core/edit-post/toggle-fullscreen", () => {
			toggleFullscreenMode();
		});
		return null;
	}

// packages/edit-post/build-module/components/init-pattern-modal/index.mjs
	function InitPatternModal() {
		const { editPost } = (0, _wordpress_data.useDispatch)(_wordpress_editor.store);
		const { isCleanNewPost } = (0, _wordpress_data.useSelect)(_wordpress_editor.store);
		const [syncType, setSyncType] = (0, _wordpress_element.useState)(void 0);
		const [title, setTitle] = (0, _wordpress_element.useState)("");
		const [isModalOpen, setIsModalOpen] = (0, _wordpress_element.useState)(() => isCleanNewPost());
		if (!isModalOpen) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Modal, {
			title: (0, _wordpress_i18n.__)("Create pattern"),
			onRequestClose: () => {
				setIsModalOpen(false);
			},
			overlayClassName: "patterns-create-modal",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
				onSubmit: (event) => {
					event.preventDefault();
					setIsModalOpen(false);
					editPost({
						title,
						meta: { wp_pattern_sync_status: syncType }
					});
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
					direction: "column",
					gap: "lg",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.TextControl, {
							label: (0, _wordpress_i18n.__)("Name"),
							value: title,
							onChange: setTitle,
							placeholder: (0, _wordpress_i18n.__)("My pattern"),
							className: "patterns-create-modal__name-input"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ToggleControl, {
							label: (0, _wordpress_i18n._x)("Synced", "pattern (singular)"),
							help: (0, _wordpress_i18n.__)("Sync this pattern across multiple locations."),
							checked: !syncType,
							onChange: () => {
								setSyncType(!syncType ? "unsynced" : void 0);
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stack, {
							justify: "end",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
								__next40pxDefaultSize: true,
								variant: "primary",
								type: "submit",
								disabled: !title,
								accessibleWhenDisabled: true,
								children: (0, _wordpress_i18n.__)("Create")
							})
						})
					]
				})
			})
		});
	}

// packages/edit-post/build-module/components/browser-url/use-classic-revision-redirect.mjs
/**
	* Redirects an editor URL that already contains a revision ID to the classic
	* screen when visual revisions are disabled. Revision buttons already link
	* there, but the URL can load before the editor finishes checking for meta boxes.
	*/
	function useClassicRevisionRedirect() {
		const registry = (0, _wordpress_data.useRegistry)();
		const { disableVisualRevisions, currentRevisionId, postType, postId } = (0, _wordpress_data.useSelect)((select) => {
			const editor = select(_wordpress_editor.store);
			return {
				disableVisualRevisions: !!editor.getEditorSettings().disableVisualRevisions,
				currentRevisionId: unlock(editor).getCurrentRevisionId(),
				postType: editor.getCurrentPostType(),
				postId: editor.getCurrentPostId()
			};
		}, []);
		const hasClassicRevisionScreen = !["wp_template", "wp_template_part"].includes(postType);
		(0, _wordpress_element.useEffect)(() => {
			if (!disableVisualRevisions || !hasClassicRevisionScreen || !currentRevisionId || !postType || !postId) return;
			let cancelled = false;
			registry.resolveSelect(_wordpress_core_data.store).getRevision("postType", postType, postId, currentRevisionId, {
				context: "edit",
				_fields: "id"
			}).then((revision) => {
				if (cancelled || !revision) return;
				const editor = registry.select(_wordpress_editor.store);
				if (!(!!editor.getEditorSettings().disableVisualRevisions && editor.getCurrentPostType() === postType && String(editor.getCurrentPostId()) === String(postId) && unlock(editor).getCurrentRevisionId() === currentRevisionId)) return;
				window.location.replace((0, _wordpress_url.addQueryArgs)("revision.php", { revision: currentRevisionId }));
			});
			return () => {
				cancelled = true;
			};
		}, [
			disableVisualRevisions,
			hasClassicRevisionScreen,
			currentRevisionId,
			postType,
			postId,
			registry
		]);
	}

// packages/edit-post/build-module/components/browser-url/index.mjs
/**
	* Safari throws when rapid revision changes trigger more than 100 History API
	* calls in 30 seconds.
	*/
	const URL_WRITE_DEBOUNCE_MS = 300;
	/**
	* Returns the Post's Edit URL.
	*
	* @param {number}  postId     Post ID.
	* @param {?number} revisionId Revision being previewed, if any.
	*
	* @return {string} Post edit URL.
	*/
	function getPostEditURL(postId, revisionId) {
		const args = {
			post: postId,
			action: "edit"
		};
		if (revisionId) args.revision = revisionId;
		return (0, _wordpress_url.addQueryArgs)("post.php", args);
	}
	function BrowserURL() {
		useClassicRevisionRedirect();
		const [initialRevisionId] = (0, _wordpress_element.useState)(() => {
			const revision = Number((0, _wordpress_url.getQueryArg)(window.location.href, "revision"));
			return Number.isInteger(revision) && revision > 0 ? revision : null;
		});
		const hasHandledInitialRevisionRef = (0, _wordpress_element.useRef)(false);
		const { postId, postStatus, currentRevisionId } = (0, _wordpress_data.useSelect)((select) => {
			const { getCurrentPost } = select(_wordpress_editor.store);
			const { getCurrentRevisionId } = unlock(select(_wordpress_editor.store));
			const post = getCurrentPost();
			let { id, status, type } = post;
			const isTemplate = ["wp_template", "wp_template_part"].includes(type);
			if (isTemplate) id = post.wp_id;
			return {
				postId: id,
				postStatus: status,
				currentRevisionId: isTemplate ? null : getCurrentRevisionId()
			};
		}, []);
		const { openRevision } = unlock((0, _wordpress_data.useDispatch)(_wordpress_editor.store));
		const lastURLWriteTimeRef = (0, _wordpress_element.useRef)(null);
		const lastPostIdRef = (0, _wordpress_element.useRef)(null);
		(0, _wordpress_element.useEffect)(() => {
			if (!postId) return;
			if (initialRevisionId && !hasHandledInitialRevisionRef.current) {
				hasHandledInitialRevisionRef.current = true;
				openRevision(initialRevisionId);
				return;
			}
			if (postStatus === "auto-draft") return;
			const previousPostId = lastPostIdRef.current;
			lastPostIdRef.current = postId;
			const url = getPostEditURL(postId, currentRevisionId);
			const write = () => {
				lastURLWriteTimeRef.current = Date.now();
				try {
					window.history.replaceState({ id: postId }, "Post " + postId, url);
				} catch {}
			};
			if (previousPostId !== null && previousPostId !== postId) {
				write();
				return;
			}
			if (lastURLWriteTimeRef.current === null) {
				write();
				return;
			}
			if (Date.now() - lastURLWriteTimeRef.current >= URL_WRITE_DEBOUNCE_MS) {
				write();
				return;
			}
			const timeoutId = setTimeout(write, URL_WRITE_DEBOUNCE_MS);
			return () => clearTimeout(timeoutId);
		}, [
			postId,
			postStatus,
			currentRevisionId,
			initialRevisionId,
			openRevision
		]);
		return null;
	}

// packages/edit-post/build-module/components/meta-boxes/meta-boxes-area/index.mjs
	const { useNativeUndo } = unlock(_wordpress_block_editor.privateApis);
	/**
	* Moves `node` to the end of `parent`.
	*
	* `moveBefore` keeps the subtree's state, where `appendChild` reloads any
	* iframe in it. That reload breaks a classic editor rendered by a meta box.
	* `moveBefore` only works between connected nodes.
	*
	* @param {Element} parent Element to move into.
	* @param {Element} node   Element to move.
	*/
	function move(parent, node) {
		if (parent.moveBefore && parent.isConnected && node.isConnected) parent.moveBefore(node, null);
		else parent.appendChild(node);
	}
	/**
	* Render metabox area.
	*
	* @param {Object} props          Component props.
	* @param {string} props.location metabox location.
	* @return {Component} The component to be rendered.
	*/
	function MetaBoxesArea({ location }) {
		const container = (0, _wordpress_element.useRef)(null);
		const formRef = (0, _wordpress_element.useRef)(null);
		(0, _wordpress_element.useLayoutEffect)(() => {
			formRef.current = document.querySelector(".metabox-location-" + location);
			if (formRef.current) move(container.current, formRef.current);
			return () => {
				if (formRef.current) move(document.querySelector("#metaboxes"), formRef.current);
			};
		}, [location]);
		const isSaving = (0, _wordpress_data.useSelect)((select) => {
			return select(store).isSavingMetaBoxes();
		}, []);
		const classes = clsx("edit-post-meta-boxes-area", `is-${location}`, { "is-loading": isSaving });
		const nativeUndoRef = useNativeUndo();
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: classes,
			ref: nativeUndoRef,
			children: [
				isSaving && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Spinner, { className: "edit-post-meta-boxes-area__spinner" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "edit-post-meta-boxes-area__container",
					ref: container
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "edit-post-meta-boxes-area__clear" })
			]
		});
	}

// packages/edit-post/build-module/components/meta-boxes/meta-box-visibility.mjs
	function MetaBoxVisibility({ id }) {
		const isVisible = (0, _wordpress_data.useSelect)((select) => {
			return select(_wordpress_editor.store).isEditorPanelEnabled(`meta-box-${id}`);
		}, [id]);
		(0, _wordpress_element.useEffect)(() => {
			const element = document.getElementById(id);
			if (!element) return;
			if (isVisible) element.classList.remove("is-hidden");
			else element.classList.add("is-hidden");
		}, [id, isVisible]);
		return null;
	}

// packages/edit-post/build-module/components/meta-boxes/index.mjs
	function MetaBoxes({ location }) {
		const metaBoxes = (0, _wordpress_data.useSelect)((select) => select(store).getMetaBoxesPerLocation(location), [location]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(metaBoxes ?? []).map(({ id }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MetaBoxVisibility, { id }, id)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MetaBoxesArea, { location })] });
	}

// packages/edit-post/build-module/components/more-menu/manage-patterns-menu-item.mjs
	const { MoreMenuItem: MoreMenuItem$1 } = unlock(_wordpress_editor.privateApis);
	function ManagePatternsMenuItem() {
		const url = (0, _wordpress_data.useSelect)((select) => {
			const { canUser } = select(_wordpress_core_data.store);
			const defaultUrl = (0, _wordpress_url.addQueryArgs)("edit.php", { post_type: "wp_block" });
			const patternsUrl = (0, _wordpress_url.addQueryArgs)("site-editor.php", { p: "/pattern" });
			return canUser("create", {
				kind: "postType",
				name: "wp_template"
			}) ? patternsUrl : defaultUrl;
		}, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MoreMenuItem$1, {
			href: url,
			children: (0, _wordpress_i18n.__)("Manage patterns")
		});
	}

// packages/edit-post/build-module/components/more-menu/welcome-guide-menu-item.mjs
	const { MoreMenuItem } = unlock(_wordpress_editor.privateApis);
	function WelcomeGuideMenuItem() {
		const isEditingTemplate = (0, _wordpress_data.useSelect)((select) => select(_wordpress_editor.store).getCurrentPostType() === "wp_template", []);
		const { toggle } = (0, _wordpress_data.useDispatch)(_wordpress_preferences.store);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MoreMenuItem, {
			onClick: () => toggle("core/edit-post", isEditingTemplate ? "welcomeGuideTemplate" : "welcomeGuide"),
			"aria-haspopup": "dialog",
			children: (0, _wordpress_i18n.__)("Welcome Guide")
		});
	}

// packages/edit-post/build-module/components/preferences-modal/enable-custom-fields.mjs
	const { PreferenceBaseOption: PreferenceBaseOption$1 } = unlock(_wordpress_preferences.privateApis);
	function submitCustomFieldsForm() {
		const customFieldsForm = document.getElementById("toggle-custom-fields-form");
		customFieldsForm.querySelector("[name=\"_wp_http_referer\"]").setAttribute("value", (0, _wordpress_url.getPathAndQueryString)(window.location.href));
		customFieldsForm.submit();
	}
	function CustomFieldsConfirmation({ willEnable }) {
		const [isReloading, setIsReloading] = (0, _wordpress_element.useState)(false);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
			className: "edit-post-preferences-modal__custom-fields-confirmation-message",
			children: (0, _wordpress_i18n.__)("A page reload is required for this change. Make sure your content is saved before reloading.")
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
			__next40pxDefaultSize: true,
			variant: "secondary",
			isBusy: isReloading,
			accessibleWhenDisabled: true,
			disabled: isReloading,
			onClick: () => {
				setIsReloading(true);
				submitCustomFieldsForm();
			},
			children: willEnable ? (0, _wordpress_i18n.__)("Show & Reload Page") : (0, _wordpress_i18n.__)("Hide & Reload Page")
		})] });
	}
	function EnableCustomFieldsOption({ label }) {
		const areCustomFieldsEnabled = (0, _wordpress_data.useSelect)((select) => {
			return !!select(_wordpress_editor.store).getEditorSettings().enableCustomFields;
		}, []);
		const [isChecked, setIsChecked] = (0, _wordpress_element.useState)(areCustomFieldsEnabled);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreferenceBaseOption$1, {
			label,
			isChecked,
			onChange: setIsChecked,
			children: isChecked !== areCustomFieldsEnabled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomFieldsConfirmation, { willEnable: isChecked })
		});
	}

// packages/edit-post/build-module/components/preferences-modal/enable-panel.mjs
	const { PreferenceBaseOption } = unlock(_wordpress_preferences.privateApis);
	function EnablePanelOption(props) {
		const { toggleEditorPanelEnabled } = (0, _wordpress_data.useDispatch)(_wordpress_editor.store);
		const { isChecked, isRemoved } = (0, _wordpress_data.useSelect)((select) => {
			const { isEditorPanelEnabled, isEditorPanelRemoved } = select(_wordpress_editor.store);
			return {
				isChecked: isEditorPanelEnabled(props.panelName),
				isRemoved: isEditorPanelRemoved(props.panelName)
			};
		}, [props.panelName]);
		if (isRemoved) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreferenceBaseOption, {
			isChecked,
			onChange: () => toggleEditorPanelEnabled(props.panelName),
			...props
		});
	}

// packages/edit-post/build-module/components/preferences-modal/meta-boxes-section.mjs
	const { PreferencesModalSection } = unlock(_wordpress_preferences.privateApis);
	function MetaBoxesSection(sectionProps) {
		const { areCustomFieldsRegistered, metaBoxes } = (0, _wordpress_data.useSelect)((select) => {
			const { getEditorSettings } = select(_wordpress_editor.store);
			const { getAllMetaBoxes } = select(store);
			return {
				areCustomFieldsRegistered: getEditorSettings().enableCustomFields !== void 0,
				metaBoxes: getAllMetaBoxes()
			};
		}, []);
		const thirdPartyMetaBoxes = metaBoxes.filter(({ id }) => id !== "postcustom");
		if (!areCustomFieldsRegistered && thirdPartyMetaBoxes.length === 0) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(PreferencesModalSection, {
			...sectionProps,
			children: [areCustomFieldsRegistered && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EnableCustomFieldsOption, { label: (0, _wordpress_i18n.__)("Custom fields") }), thirdPartyMetaBoxes.map(({ id, title }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EnablePanelOption, {
				label: title,
				panelName: `meta-box-${id}`
			}, id))]
		});
	}

// packages/edit-post/build-module/components/preferences-modal/index.mjs
	const { PreferenceToggleControl } = unlock(_wordpress_preferences.privateApis);
	const { PreferencesModal } = unlock(_wordpress_editor.privateApis);
	function EditPostPreferencesModal() {
		const extraSections = {
			general: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MetaBoxesSection, { title: (0, _wordpress_i18n.__)("Advanced") }),
			appearance: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreferenceToggleControl, {
				scope: "core/edit-post",
				featureName: "themeStyles",
				help: (0, _wordpress_i18n.__)("Make the editor look like your theme."),
				label: (0, _wordpress_i18n.__)("Use theme styles")
			})
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreferencesModal, { extraSections });
	}

// packages/edit-post/build-module/components/more-menu/index.mjs
	const { MoreMenuPreferenceItem, ToolsMoreMenuGroup, ViewMoreMenuGroup } = unlock(_wordpress_editor.privateApis);
	const MoreMenu = () => {
		const isLargeViewport = (0, _wordpress_compose.useViewportMatch)("large");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			isLargeViewport && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ViewMoreMenuGroup, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MoreMenuPreferenceItem, {
				scope: "core/edit-post",
				name: "fullscreenMode",
				label: (0, _wordpress_i18n.__)("Fullscreen mode"),
				info: (0, _wordpress_i18n.__)("Show and hide the admin user interface"),
				messageActivated: (0, _wordpress_i18n.__)("Fullscreen mode activated."),
				messageDeactivated: (0, _wordpress_i18n.__)("Fullscreen mode deactivated."),
				shortcut: _wordpress_keycodes.keyboardShortcut.secondary("f")
			}) }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ToolsMoreMenuGroup, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ManagePatternsMenuItem, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuideMenuItem, {})] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditPostPreferencesModal, {})
		] });
	};

// packages/edit-post/build-module/components/welcome-guide/image.mjs
	function WelcomeGuideImage({ nonAnimatedSrc, animatedSrc }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("picture", {
			className: "edit-post-welcome-guide__image",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("source", {
				srcSet: nonAnimatedSrc,
				media: "(prefers-reduced-motion: reduce)"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				src: animatedSrc,
				width: "312",
				height: "240",
				alt: ""
			})]
		});
	}

// packages/edit-post/build-module/components/welcome-guide/default.mjs
	function WelcomeGuideDefault() {
		const { set: setPreference } = (0, _wordpress_data.useDispatch)(_wordpress_preferences.store);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Guide, {
			className: "edit-post-welcome-guide",
			contentLabel: (0, _wordpress_i18n.__)("Welcome to the editor"),
			finishButtonText: (0, _wordpress_i18n.__)("Get started"),
			onFinish: () => setPreference("core/edit-post", "welcomeGuide", false),
			pages: [
				{
					image: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuideImage, {
						nonAnimatedSrc: "https://s.w.org/images/block-editor/welcome-canvas.svg",
						animatedSrc: "https://s.w.org/images/block-editor/welcome-canvas.gif"
					}),
					content: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: "edit-post-welcome-guide__heading",
						children: (0, _wordpress_i18n.__)("Welcome to the editor")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "edit-post-welcome-guide__text",
						children: (0, _wordpress_i18n.__)("In the WordPress editor, each paragraph, image, or video is presented as a distinct “block” of content.")
					})] })
				},
				{
					image: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuideImage, {
						nonAnimatedSrc: "https://s.w.org/images/block-editor/welcome-editor.svg",
						animatedSrc: "https://s.w.org/images/block-editor/welcome-editor.gif"
					}),
					content: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: "edit-post-welcome-guide__heading",
						children: (0, _wordpress_i18n.__)("Customize each block")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "edit-post-welcome-guide__text",
						children: (0, _wordpress_i18n.__)("Each block comes with its own set of controls for changing things like color, width, and alignment. These will show and hide automatically when you have a block selected.")
					})] })
				},
				{
					image: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuideImage, {
						nonAnimatedSrc: "https://s.w.org/images/block-editor/welcome-library.svg",
						animatedSrc: "https://s.w.org/images/block-editor/welcome-library.gif"
					}),
					content: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: "edit-post-welcome-guide__heading",
						children: (0, _wordpress_i18n.__)("Explore all blocks")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "edit-post-welcome-guide__text",
						children: (0, _wordpress_element.createInterpolateElement)((0, _wordpress_i18n.__)("All of the blocks available to you live in the block library. You’ll find it wherever you see the <InserterIconImage /> icon."), { InserterIconImage: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							alt: (0, _wordpress_i18n.__)("inserter"),
							src: "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='18' height='18' rx='2' fill='%231E1E1E'/%3E%3Cpath d='M9.22727 4V14M4 8.77273H14' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E%0A"
						}) })
					})] })
				},
				{
					image: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuideImage, {
						nonAnimatedSrc: "https://s.w.org/images/block-editor/welcome-documentation.svg",
						animatedSrc: "https://s.w.org/images/block-editor/welcome-documentation.gif"
					}),
					content: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: "edit-post-welcome-guide__heading",
						children: (0, _wordpress_i18n.__)("Learn more")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "edit-post-welcome-guide__text",
						children: (0, _wordpress_element.createInterpolateElement)((0, _wordpress_i18n.__)("New to the block editor? Want to learn more about using it? <a>Here's a detailed guide.</a>"), { a: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ExternalLink, { href: (0, _wordpress_i18n.__)("https://wordpress.org/documentation/article/wordpress-block-editor/") }) })
					})] })
				}
			]
		});
	}

// packages/edit-post/build-module/components/welcome-guide/template.mjs
	function WelcomeGuideTemplate() {
		const { set: setPreference } = (0, _wordpress_data.useDispatch)(_wordpress_preferences.store);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Guide, {
			className: "edit-template-welcome-guide",
			contentLabel: (0, _wordpress_i18n.__)("Welcome to the template editor"),
			finishButtonText: (0, _wordpress_i18n.__)("Get started"),
			onFinish: () => setPreference("core/edit-post", "welcomeGuideTemplate", false),
			pages: [{
				image: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuideImage, {
					nonAnimatedSrc: "https://s.w.org/images/block-editor/welcome-template-editor.svg",
					animatedSrc: "https://s.w.org/images/block-editor/welcome-template-editor.gif"
				}),
				content: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
					className: "edit-post-welcome-guide__heading",
					children: (0, _wordpress_i18n.__)("Welcome to the template editor")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "edit-post-welcome-guide__text",
					children: (0, _wordpress_i18n.__)("Templates help define the layout of the site. You can customize all aspects of your posts and pages using blocks and patterns in this editor.")
				})] })
			}]
		});
	}

// packages/edit-post/build-module/components/welcome-guide/index.mjs
	function WelcomeGuide({ postType }) {
		const { isActive, isEditingTemplate } = (0, _wordpress_data.useSelect)((select) => {
			const { isFeatureActive } = select(store);
			const _isEditingTemplate = postType === "wp_template";
			return {
				isActive: isFeatureActive(_isEditingTemplate ? "welcomeGuideTemplate" : "welcomeGuide"),
				isEditingTemplate: _isEditingTemplate
			};
		}, [postType]);
		if (!isActive) return null;
		return isEditingTemplate ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuideTemplate, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuideDefault, {});
	}

// packages/edit-post/build-module/commands/use-commands.mjs
	function useCommands() {
		const { isFullscreen } = (0, _wordpress_data.useSelect)((select) => {
			const { get } = select(_wordpress_preferences.store);
			return { isFullscreen: get("core/edit-post", "fullscreenMode") };
		}, []);
		const { toggle } = (0, _wordpress_data.useDispatch)(_wordpress_preferences.store);
		const { createInfoNotice } = (0, _wordpress_data.useDispatch)(_wordpress_notices.store);
		(0, _wordpress_commands.useCommand)({
			name: "core/toggle-fullscreen-mode",
			label: isFullscreen ? (0, _wordpress_i18n.__)("Exit fullscreen") : (0, _wordpress_i18n.__)("Enter fullscreen"),
			icon: fullscreen_default,
			category: "command",
			callback: ({ close }) => {
				toggle("core/edit-post", "fullscreenMode");
				close();
				createInfoNotice(isFullscreen ? (0, _wordpress_i18n.__)("Fullscreen off.") : (0, _wordpress_i18n.__)("Fullscreen on."), {
					id: "core/edit-post/toggle-fullscreen-mode/notice",
					type: "snackbar",
					actions: [{
						label: (0, _wordpress_i18n.__)("Undo"),
						onClick: () => {
							toggle("core/edit-post", "fullscreenMode");
						}
					}]
				});
			}
		});
	}

// packages/edit-post/build-module/hooks/use-navigate-to-entity-record.mjs
/**
	* A hook that records the 'entity' history in the post editor as a user
	* navigates between editing a post and editing the post template or patterns.
	*
	* Implemented as a stack, so a little similar to the browser history API.
	*
	* Used to control displaying UI elements like the back button.
	*
	* @param {number} initialPostId        The post id of the post when the editor loaded.
	* @param {string} initialPostType      The post type of the post when the editor loaded.
	* @param {string} defaultRenderingMode The rendering mode to switch to when navigating.
	*
	* @return {Object} An object containing the `currentPost` variable and
	*                 `onNavigateToEntityRecord` and `onNavigateToPreviousEntityRecord` functions.
	*/
	function useNavigateToEntityRecord(initialPostId, initialPostType, defaultRenderingMode) {
		const registry = (0, _wordpress_data.useRegistry)();
		const [postHistory, dispatch] = (0, _wordpress_element.useReducer)((historyState, { type, post, previousRenderingMode, selectedBlockClientId }) => {
			if (type === "push") {
				const updatedHistory = [...historyState];
				const currentIndex = updatedHistory.length - 1;
				updatedHistory[currentIndex] = {
					...updatedHistory[currentIndex],
					selectedBlockClientId
				};
				return [...updatedHistory, {
					post,
					previousRenderingMode
				}];
			}
			if (type === "pop") {
				if (historyState.length > 1) return historyState.slice(0, -1);
			}
			return historyState;
		}, [{ post: {
			postId: initialPostId,
			postType: initialPostType
		} }]);
		const { post, previousRenderingMode } = postHistory[postHistory.length - 1];
		const { getRenderingMode } = (0, _wordpress_data.useSelect)(_wordpress_editor.store);
		const { setRenderingMode } = (0, _wordpress_data.useDispatch)(_wordpress_editor.store);
		const { editEntityRecord } = (0, _wordpress_data.useDispatch)(_wordpress_core_data.store);
		const onNavigateToEntityRecord = (0, _wordpress_element.useCallback)((params) => {
			const externalClientId = registry.select(_wordpress_core_data.store).getEntityRecordEdits("postType", post.postType, post.postId)?.selection?.selectionStart?.clientId ?? null;
			dispatch({
				type: "push",
				post: {
					postId: params.postId,
					postType: params.postType
				},
				previousRenderingMode: getRenderingMode(),
				selectedBlockClientId: externalClientId
			});
			setRenderingMode(defaultRenderingMode);
		}, [
			registry,
			post.postType,
			post.postId,
			getRenderingMode,
			setRenderingMode,
			defaultRenderingMode
		]);
		const onNavigateToPreviousEntityRecord = (0, _wordpress_element.useCallback)(() => {
			if (postHistory.length > 1) {
				const previousItem = postHistory[postHistory.length - 2];
				if (previousItem.selectedBlockClientId) editEntityRecord("postType", previousItem.post.postType, previousItem.post.postId, { selection: {
					selectionStart: { clientId: previousItem.selectedBlockClientId },
					selectionEnd: { clientId: previousItem.selectedBlockClientId }
				} }, { undoIgnore: true });
			}
			dispatch({ type: "pop" });
			if (previousRenderingMode) setRenderingMode(previousRenderingMode);
		}, [
			setRenderingMode,
			previousRenderingMode,
			postHistory,
			editEntityRecord
		]);
		return {
			currentPost: post,
			onNavigateToEntityRecord,
			onNavigateToPreviousEntityRecord: postHistory.length > 1 ? onNavigateToPreviousEntityRecord : void 0
		};
	}

// packages/edit-post/build-module/components/meta-boxes/use-meta-box-initialization.mjs
/**
	* Initializes WordPress `postboxes` script and the logic for saving meta boxes.
	*
	* @param { boolean } enabled
	*/
	const useMetaBoxInitialization = (enabled) => {
		const { isEnabledAndEditorReady, isCollaborationEnabled, hasIncompatibleMetaBoxes, hasActiveMetaBoxes } = (0, _wordpress_data.useSelect)((select) => {
			const { __unstableIsEditorReady, isCollaborationEnabledForCurrentPost } = unlock(select(_wordpress_editor.store));
			return {
				isEnabledAndEditorReady: enabled && __unstableIsEditorReady(),
				isCollaborationEnabled: isCollaborationEnabledForCurrentPost(),
				hasIncompatibleMetaBoxes: enabled ? select(store).getAllMetaBoxes().some((metaBox) => !metaBox.__rtc_compatible) : false,
				hasActiveMetaBoxes: enabled && select(store).hasMetaBoxes()
			};
		}, [enabled]);
		const { setCollaborationSupported } = unlock((0, _wordpress_data.useDispatch)(_wordpress_core_data.store));
		const { updateEditorSettings } = (0, _wordpress_data.useDispatch)(_wordpress_editor.store);
		const { initializeMetaBoxes } = (0, _wordpress_data.useDispatch)(store);
		(0, _wordpress_element.useEffect)(() => {
			if (isEnabledAndEditorReady) {
				initializeMetaBoxes();
				if (isCollaborationEnabled && hasIncompatibleMetaBoxes) setCollaborationSupported(false);
				if (hasActiveMetaBoxes) updateEditorSettings({ disableVisualRevisions: true });
			}
		}, [
			isEnabledAndEditorReady,
			initializeMetaBoxes,
			isCollaborationEnabled,
			setCollaborationSupported,
			hasIncompatibleMetaBoxes,
			hasActiveMetaBoxes,
			updateEditorSettings
		]);
	};

// packages/edit-post/build-module/components/layout/index.mjs
	const { useCommandContext } = unlock(_wordpress_commands.privateApis);
	/** @type {{} & {useDrag: import('@use-gesture/react').useDrag}} */
	const { useDrag } = unlock(_wordpress_components.privateApis);
	const { Editor, FullscreenMode, UploadProgressSnackbar } = unlock(_wordpress_editor.privateApis);
	const DESIGN_POST_TYPES = [
		"wp_template",
		"wp_template_part",
		"wp_block",
		"wp_navigation"
	];
	function useEditorStyles(settings) {
		const { hasThemeStyleSupport } = (0, _wordpress_data.useSelect)((select) => {
			return { hasThemeStyleSupport: select(store).isFeatureActive("themeStyles") };
		}, []);
		return (0, _wordpress_element.useMemo)(() => {
			const presetStyles = settings.styles?.filter((style) => style.__unstableType && style.__unstableType !== "theme") ?? [];
			const defaultEditorStyles = [...settings?.defaultEditorStyles ?? [], ...presetStyles];
			const hasThemeStyles = hasThemeStyleSupport && presetStyles.length !== (settings.styles?.length ?? 0);
			if (!settings.disableLayoutStyles && !hasThemeStyles) defaultEditorStyles.push({ css: getLayoutStyles({
				style: {},
				selector: "body",
				hasBlockGapSupport: false,
				hasFallbackGapSupport: true,
				fallbackGapValue: "0.5em"
			}) });
			return hasThemeStyles ? settings.styles ?? [] : defaultEditorStyles;
		}, [
			settings.defaultEditorStyles,
			settings.disableLayoutStyles,
			settings.styles,
			hasThemeStyleSupport
		]);
	}
	function MetaBoxesMain() {
		const [isOpen, openHeight, hasAnyVisible] = (0, _wordpress_data.useSelect)((select) => {
			const { get } = select(_wordpress_preferences.store);
			const { isMetaBoxLocationVisible } = select(store);
			return [
				!!get("core/edit-post", "metaBoxesMainIsOpen"),
				get("core/edit-post", "metaBoxesMainOpenHeight"),
				isMetaBoxLocationVisible("normal") || isMetaBoxLocationVisible("advanced") || isMetaBoxLocationVisible("side")
			];
		}, []);
		const { set: setPreference } = (0, _wordpress_data.useDispatch)(_wordpress_preferences.store);
		const isShort = (0, _wordpress_compose.useMediaQuery)("(max-height: 549px)");
		const [{ min = 0, max }, setHeightConstraints] = (0, _wordpress_element.useState)(() => ({}));
		const effectSizeConstraints = (0, _wordpress_compose.useRefEffect)((node) => {
			const container = node.closest(".interface-interface-skeleton__content");
			if (!container) return;
			const noticeContainer = container.querySelector(".editor-notices");
			const resizeHandle = container.querySelector(".edit-post-meta-boxes-main__presenter");
			const deriveConstraints = () => {
				let nextMax = container.offsetHeight;
				if (noticeContainer) nextMax -= noticeContainer.offsetHeight;
				const nextMin = resizeHandle?.offsetHeight ?? 0;
				setHeightConstraints({
					min: nextMin,
					max: nextMax
				});
			};
			const observer = new window.ResizeObserver(deriveConstraints);
			observer.observe(container);
			if (noticeContainer) observer.observe(noticeContainer);
			return () => observer.disconnect();
		}, []);
		const metaBoxesMainRef = (0, _wordpress_element.useRef)();
		const setMainRefs = (0, _wordpress_compose.useMergeRefs)([metaBoxesMainRef, effectSizeConstraints]);
		const separatorRef = (0, _wordpress_element.useRef)();
		const separatorHelpId = (0, _wordpress_element.useId)();
		const heightRef = (0, _wordpress_element.useRef)();
		const getAriaValueNow = (height) => Math.round((height - min) / (max - min) * 100);
		const persistIsOpen = (to = !isOpen) => setPreference("core/edit-post", "metaBoxesMainIsOpen", to);
		/**
		* @param {number|'auto'} [candidateHeight] Height in pixels or 'auto'.
		* @param {boolean}       isPersistent      Whether to persist the height in preferences.
		*/
		const applyHeight = (candidateHeight = "auto", isPersistent) => {
			let styleHeight;
			if (candidateHeight === "auto") {
				isPersistent = false;
				styleHeight = candidateHeight;
			} else {
				candidateHeight = Math.min(max, Math.max(min, candidateHeight));
				heightRef.current = candidateHeight;
				styleHeight = `${candidateHeight}px`;
			}
			if (isPersistent) setPreference("core/edit-post", "metaBoxesMainOpenHeight", candidateHeight);
			else {
				metaBoxesMainRef.current.style.height = styleHeight;
				if (!isShort) separatorRef.current.ariaValueNow = getAriaValueNow(candidateHeight);
			}
		};
		const bindDragGesture = useDrag(({ movement, first, last, memo, tap, args }) => {
			const pane = metaBoxesMainRef.current;
			const [, yMovement] = movement;
			if (first) {
				pane.classList.add("is-resizing");
				let fromHeight = heightRef.current ?? pane.offsetHeight;
				if (isOpen) {
					if (fromHeight > max) fromHeight = max;
				} else fromHeight = min;
				applyHeight(fromHeight - yMovement);
				return { fromHeight };
			}
			if (!first && !last && !tap) {
				applyHeight(memo.fromHeight - yMovement);
				return memo;
			}
			pane.classList.remove("is-resizing");
			if (tap) {
				const [onTap] = args;
				onTap?.();
				return;
			}
			const nextIsOpen = heightRef.current > min;
			persistIsOpen(nextIsOpen);
			applyHeight(heightRef.current, nextIsOpen);
		}, {
			keyboardDisplacement: 20,
			filterTaps: true
		});
		if (!hasAnyVisible) return;
		const isAutoHeight = openHeight === void 0;
		const usedHeight = isOpen ? isShort ? "auto" : openHeight : min;
		const usedAriaValueNow = max === void 0 || isAutoHeight ? 50 : getAriaValueNow(usedHeight);
		const paneLabel = (0, _wordpress_i18n.__)("Meta Boxes");
		const toggle = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			"aria-expanded": isOpen,
			onClick: ({ detail }) => {
				if (isShort || !detail) persistIsOpen();
			},
			...!isShort && bindDragGesture(persistIsOpen),
			children: [paneLabel, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Icon, { icon: isOpen ? chevron_up_default : chevron_down_default })]
		});
		const separator = !isShort && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Root, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Trigger, { render: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			ref: separatorRef,
			role: "separator",
			"aria-valuenow": usedAriaValueNow,
			"aria-label": (0, _wordpress_i18n.__)("Drag to resize"),
			"aria-describedby": separatorHelpId,
			...bindDragGesture()
		}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Popup, { children: (0, _wordpress_i18n.__)("Drag to resize") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VisuallyHidden, {
			id: separatorHelpId,
			children: (0, _wordpress_i18n.__)("Use up and down arrow keys to resize the meta box pane.")
		})] });
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(NavigableRegion, {
			ariaLabel: paneLabel,
			ref: setMainRefs,
			className: clsx("edit-post-meta-boxes-main", !isShort && "is-resizable"),
			style: { height: usedHeight },
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "edit-post-meta-boxes-main__presenter",
				children: [toggle, separator]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "edit-post-layout__metaboxes edit-post-meta-boxes-main__liner",
				hidden: !isOpen,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MetaBoxes, { location: "normal" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MetaBoxes, { location: "advanced" })]
			})]
		});
	}
	function Layout({ postId: initialPostId, postType: initialPostType, settings, initialEdits }) {
		useCommands();
		const { createErrorNotice } = (0, _wordpress_data.useDispatch)(_wordpress_notices.store);
		const { currentPost: { postId: currentPostId, postType: currentPostType }, onNavigateToEntityRecord, onNavigateToPreviousEntityRecord } = useNavigateToEntityRecord(initialPostId, initialPostType, "post-only");
		const isEditingTemplate = currentPostType === "wp_template";
		const { mode, isFullscreenActive, hasResolvedMode, hasActiveMetaboxes, hasBlockSelected, showIconLabels, isDistractionFree, showMetaBoxes, isWelcomeGuideVisible, templateId } = (0, _wordpress_data.useSelect)((select) => {
			const { get } = select(_wordpress_preferences.store);
			const { isFeatureActive, hasMetaBoxes } = select(store);
			const { canUser, getPostType, getTemplateId } = unlock(select(_wordpress_core_data.store));
			const supportsTemplateMode = settings.supportsTemplateMode;
			const isViewable = getPostType(currentPostType)?.viewable ?? false;
			const canViewTemplate = canUser("read", {
				kind: "postType",
				name: "wp_template"
			});
			const { getBlockSelectionStart, isZoomOut } = unlock(select(_wordpress_block_editor.store));
			const { getEditorMode, getDefaultRenderingMode } = unlock(select(_wordpress_editor.store));
			const isNotDesignPostType = !DESIGN_POST_TYPES.includes(currentPostType);
			const isDirectlyEditingPattern = currentPostType === "wp_block" && !onNavigateToPreviousEntityRecord;
			const _templateId = getTemplateId(currentPostType, currentPostId);
			const defaultMode = getDefaultRenderingMode(currentPostType);
			return {
				mode: getEditorMode(),
				isFullscreenActive: isFeatureActive("fullscreenMode"),
				hasActiveMetaboxes: hasMetaBoxes(),
				hasResolvedMode: defaultMode === "template-locked" ? !!_templateId : defaultMode !== void 0,
				hasBlockSelected: !!getBlockSelectionStart(),
				showIconLabels: get("core", "showIconLabels"),
				isDistractionFree: get("core", "distractionFree"),
				showMetaBoxes: isNotDesignPostType && !isZoomOut() || isDirectlyEditingPattern,
				isWelcomeGuideVisible: isFeatureActive("welcomeGuide"),
				templateId: supportsTemplateMode && isViewable && canViewTemplate && !isEditingTemplate ? _templateId : null
			};
		}, [
			currentPostType,
			currentPostId,
			isEditingTemplate,
			settings.supportsTemplateMode,
			onNavigateToPreviousEntityRecord
		]);
		useMetaBoxInitialization(hasActiveMetaboxes && hasResolvedMode);
		useCommandContext(hasBlockSelected ? "block-selection-edit" : "entity-edit");
		const styles = useEditorStyles(settings);
		const editorSettings = (0, _wordpress_element.useMemo)(() => ({
			...settings,
			styles,
			onNavigateToEntityRecord,
			onNavigateToPreviousEntityRecord
		}), [
			settings,
			styles,
			onNavigateToEntityRecord,
			onNavigateToPreviousEntityRecord
		]);
		if (showIconLabels) document.body.classList.add("show-icon-labels");
		else document.body.classList.remove("show-icon-labels");
		const navigateRegionsProps = (0, _wordpress_components.__unstableUseNavigateRegions)();
		const className = clsx("edit-post-layout", "is-mode-" + mode, { "has-metaboxes": hasActiveMetaboxes });
		function onPluginAreaError(name) {
			createErrorNotice((0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("The \"%s\" plugin has encountered an error and cannot be rendered."), name));
		}
		const { createSuccessNotice } = (0, _wordpress_data.useDispatch)(_wordpress_notices.store);
		const onActionPerformed = (0, _wordpress_element.useCallback)((actionId, items) => {
			switch (actionId) {
				case "move-to-trash":
					document.location.href = (0, _wordpress_url.addQueryArgs)("edit.php", {
						trashed: 1,
						post_type: items[0].type,
						ids: items[0].id
					});
					break;
				case "permanently-delete":
					document.location.href = (0, _wordpress_url.addQueryArgs)("edit.php", {
						deleted: 1,
						post_type: items[0].type
					});
					break;
				case "duplicate-post": {
					const newItem = items[0];
					const title = typeof newItem.title === "string" ? newItem.title : newItem.title?.rendered;
					createSuccessNotice((0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("\"%s\" successfully created."), (0, _wordpress_html_entities.decodeEntities)(title) || (0, _wordpress_i18n.__)("(no title)")), {
						type: "snackbar",
						id: "duplicate-post-action",
						actions: [{
							label: (0, _wordpress_i18n.__)("Edit"),
							onClick: () => {
								const postId = newItem.id;
								document.location.href = (0, _wordpress_url.addQueryArgs)("post.php", {
									post: postId,
									action: "edit"
								});
							}
						}]
					});
				}
			}
		}, [createSuccessNotice]);
		const initialPost = (0, _wordpress_element.useMemo)(() => {
			return {
				type: initialPostType,
				id: initialPostId
			};
		}, [initialPostType, initialPostId]);
		const backButton = (0, _wordpress_compose.useViewportMatch)("medium") && isFullscreenActive ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BackButton, { initialPost }) : null;
		const adminPrimary = (0, _wordpress_element.useMemo)(() => getAdminThemeColors().primary, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.SlotFillProvider, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Provider, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_theme.ThemeProvider, {
			isRoot: true,
			color: { primary: adminPrimary },
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_editor.ErrorBoundary, {
				canCopyContent: true,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuide, { postType: currentPostType }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					...navigateRegionsProps,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Editor, {
						settings: editorSettings,
						initialEdits: currentPostId === initialPostId && currentPostType === initialPostType ? initialEdits : void 0,
						postType: currentPostType,
						postId: currentPostId,
						templateId,
						className,
						forceIsDirty: hasActiveMetaboxes,
						autoFocus: !isWelcomeGuideVisible,
						onActionPerformed,
						extraSidebarPanels: showMetaBoxes && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MetaBoxes, { location: "side" }),
						extraContent: !isDistractionFree && showMetaBoxes && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MetaBoxesMain, {}),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.PostLockedModal, {}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorInitialization, {}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FullscreenMode, { isActive: isFullscreenActive }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrowserURL, {}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.UnsavedChangesWarning, {}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.AutosaveMonitor, {}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.LocalAutosaveMonitor, {}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(KeyboardShortcuts, {}),
							currentPostType === "wp_block" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InitPatternModal, {}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_plugins.PluginArea, { onError: onPluginAreaError }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MoreMenu, {}),
							backButton,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_notices.SnackbarNotices, { className: "edit-post-layout__snackbar" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(UploadProgressSnackbar, {})
						]
					})
				})]
			})
		}) }) });
	}

// packages/edit-post/build-module/deprecated.mjs
	const { PluginPostExcerpt } = unlock(_wordpress_editor.privateApis);
	const isSiteEditor = (0, _wordpress_url.getPath)(window.location.href)?.includes("site-editor.php");
	const deprecateSlot = (name) => {
		(0, _wordpress_deprecated.default)(`wp.editPost.${name}`, {
			since: "6.6",
			alternative: `wp.editor.${name}`
		});
	};
	/**
	* @see PluginBlockSettingsMenuItem in `@wordpress/editor` package.
	*/
	function PluginBlockSettingsMenuItem(props) {
		if (isSiteEditor) return null;
		deprecateSlot("PluginBlockSettingsMenuItem");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.PluginBlockSettingsMenuItem, { ...props });
	}
	/**
	* @see PluginDocumentSettingPanel in `@wordpress/editor` package.
	*/
	function PluginDocumentSettingPanel(props) {
		if (isSiteEditor) return null;
		deprecateSlot("PluginDocumentSettingPanel");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.PluginDocumentSettingPanel, { ...props });
	}
	/**
	* @see PluginMoreMenuItem in `@wordpress/editor` package.
	*/
	function PluginMoreMenuItem(props) {
		if (isSiteEditor) return null;
		deprecateSlot("PluginMoreMenuItem");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.PluginMoreMenuItem, { ...props });
	}
	/**
	* @see PluginPrePublishPanel in `@wordpress/editor` package.
	*/
	function PluginPrePublishPanel(props) {
		if (isSiteEditor) return null;
		deprecateSlot("PluginPrePublishPanel");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.PluginPrePublishPanel, { ...props });
	}
	/**
	* @see PluginPostPublishPanel in `@wordpress/editor` package.
	*/
	function PluginPostPublishPanel(props) {
		if (isSiteEditor) return null;
		deprecateSlot("PluginPostPublishPanel");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.PluginPostPublishPanel, { ...props });
	}
	/**
	* @see PluginPostStatusInfo in `@wordpress/editor` package.
	*/
	function PluginPostStatusInfo(props) {
		if (isSiteEditor) return null;
		deprecateSlot("PluginPostStatusInfo");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.PluginPostStatusInfo, { ...props });
	}
	/**
	* @see PluginSidebar in `@wordpress/editor` package.
	*/
	function PluginSidebar(props) {
		if (isSiteEditor) return null;
		deprecateSlot("PluginSidebar");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.PluginSidebar, { ...props });
	}
	/**
	* @see PluginSidebarMoreMenuItem in `@wordpress/editor` package.
	*/
	function PluginSidebarMoreMenuItem(props) {
		if (isSiteEditor) return null;
		deprecateSlot("PluginSidebarMoreMenuItem");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_editor.PluginSidebarMoreMenuItem, { ...props });
	}
	/**
	* @see PluginPostExcerpt in `@wordpress/editor` package.
	*/
	function __experimentalPluginPostExcerpt() {
		if (isSiteEditor) return null;
		(0, _wordpress_deprecated.default)("wp.editPost.__experimentalPluginPostExcerpt", {
			since: "6.6",
			hint: "Core and custom panels can be access programmatically using their panel name.",
			link: "https://developer.wordpress.org/block-editor/reference-guides/slotfills/plugin-document-setting-panel/#accessing-a-panel-programmatically"
		});
		return PluginPostExcerpt;
	}

// packages/edit-post/build-module/index.mjs
	const { BackButton: __experimentalMainDashboardButton, registerCoreBlockBindingsSources } = unlock(_wordpress_editor.privateApis);
	const { enablePreloadMultiUse, clearPreloadedData } = unlock(_wordpress_api_fetch.default.privateApis);
	/**
	* Initializes and returns an instance of Editor.
	*
	* @param {string}  id           Unique identifier for editor instance.
	* @param {string}  postType     Post type of the post to edit.
	* @param {Object}  postId       ID of the post to edit.
	* @param {?Object} settings     Editor settings object.
	* @param {Object}  initialEdits Programmatic edits to apply initially, to be
	*                               considered as non-user-initiated (bypass for
	*                               unsaved changes prompt).
	*/
	function initializeEditor(id, postType, postId, settings, initialEdits) {
		const target = document.getElementById(id);
		const root = (0, _wordpress_element.createRoot)(target);
		(0, _wordpress_data.dispatch)(_wordpress_preferences.store).setDefaults("core/edit-post", {
			fullscreenMode: true,
			themeStyles: true,
			welcomeGuide: true,
			welcomeGuideTemplate: true
		});
		(0, _wordpress_data.dispatch)(_wordpress_preferences.store).setDefaults("core", {
			allowRightClickOverrides: true,
			editorMode: "visual",
			fixedToolbar: false,
			hiddenBlockTypes: [],
			inactivePanels: [],
			openPanels: ["post-status"],
			showBlockBreadcrumbs: true,
			showIconLabels: false,
			showListViewByDefault: false,
			enableChoosePatternModal: true,
			isPublishSidebarEnabled: true,
			showCollaborationCursor: false,
			showCollaborationJoinNotifications: true,
			showCollaborationLeaveNotifications: true,
			showCollaborationPostSaveNotifications: true
		});
		if (window.__clientSideMediaProcessing) (0, _wordpress_data.dispatch)(_wordpress_preferences.store).setDefaults("core/media", {
			requireApproval: true,
			optimizeOnUpload: true
		});
		(0, _wordpress_data.dispatch)(_wordpress_blocks.store).reapplyBlockTypeFilters();
		(0, _wordpress_block_library.registerCoreBlocks)();
		registerCoreBlockBindingsSources();
		(0, _wordpress_widgets.registerLegacyWidgetBlock)({ inserter: false });
		(0, _wordpress_widgets.registerWidgetGroupBlock)({ inserter: false });
		(0, _wordpress_block_library.__experimentalRegisterExperimentalCoreBlocks)({ enableFSEBlocks: settings.__unstableEnableFullSiteEditingBlocks });
		if ((document.compatMode === "CSS1Compat" ? "Standards" : "Quirks") !== "Standards") console.warn("Your browser is using Quirks Mode. \nThis can cause rendering issues such as blocks overlaying meta boxes in the editor. Quirks Mode can be triggered by PHP errors or HTML code appearing before the opening <!DOCTYPE html>. Try checking the raw page source or your site's PHP error log and resolving errors there, removing any HTML before the doctype, or disabling plugins.");
		window.addEventListener("dragover", (e) => e.preventDefault(), false);
		window.addEventListener("drop", (e) => e.preventDefault(), false);
		enablePreloadMultiUse();
		preloadResolutions(postType, postId).finally(() => {
			clearPreloadedData();
			if (postType && postId) {
				const post = (0, _wordpress_data.select)(_wordpress_core_data.store).getEntityRecord("postType", postType, postId);
				if (post) (0, _wordpress_data.dispatch)(_wordpress_editor.store).setupEditor(post, initialEdits, settings.template);
			}
			root.render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_element.StrictMode, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Layout, {
				settings,
				postId,
				postType,
				initialEdits
			}) }));
		});
		return root;
	}
	/**
	* Drive resolvers to completion against the preload cache before React
	* mounts. Two phases: known-up-front args (post id + type), then args
	* derived from phase-1 state (post slug → template, current global
	* styles id → record + canUser).
	*
	* @param {string} postType Current post type.
	* @param {number} postId   Current post id.
	* @return {Promise<void>}  Resolves when the kickoff resolvers settle.
	*/
	async function preloadResolutions(postType, postId) {
		const core = (0, _wordpress_data.resolveSelect)(_wordpress_core_data.store);
		const coreSelect = (0, _wordpress_data.select)(_wordpress_core_data.store);
		try {
			await Promise.all([
				core.getCurrentUser(),
				core.getEntitiesConfig("postType"),
				core.getEntitiesConfig("taxonomy"),
				core.getEntitiesConfig("root"),
				core.getEntityRecords("root", "taxonomy"),
				core.getCurrentTheme(),
				core.getThemeSupports(),
				core.getBlockPatternCategories(),
				core.__experimentalGetCurrentGlobalStylesId(),
				core.__experimentalGetCurrentThemeBaseGlobalStyles(),
				core.__experimentalGetCurrentThemeGlobalStylesVariations(),
				core.getEntityRecord("root", "__unstableBase"),
				core.canUser("read", {
					kind: "root",
					name: "site"
				}),
				core.canUser("create", {
					kind: "postType",
					name: "attachment"
				}),
				core.canUser("create", {
					kind: "postType",
					name: "page"
				}),
				core.canUser("create", {
					kind: "postType",
					name: "wp_block"
				}),
				core.canUser("create", {
					kind: "postType",
					name: "wp_template"
				}),
				...postType ? [unlock(core).getViewConfig("postType", postType, { fields: "form" }), unlock(core).getFieldsConfig("postType", postType).catch(() => {})] : [],
				...postType ? [unlock(core).getEntityActionsConfig("postType", postType).catch(() => {})] : [],
				...postType && postId ? [
					core.getPostType(postType),
					core.getEntityRecord("postType", postType, postId),
					core.getEditedEntityRecord("postType", postType, postId),
					core.getAutosaves(postType, postId),
					core.getDefaultTemplateId({ slug: "front-page" }),
					core.canUser("create", {
						kind: "postType",
						name: postType
					})
				] : []
			]);
			const tasks = [];
			if (coreSelect.canUser("read", {
				kind: "root",
				name: "site"
			})) tasks.push(core.getEntityRecord("root", "site"));
			const globalStylesId = coreSelect.__experimentalGetCurrentGlobalStylesId();
			if (globalStylesId) tasks.push(core.canUser("update", {
				kind: "root",
				name: "globalStyles",
				id: globalStylesId
			}));
			if (postType && postId) {
				const post = coreSelect.getEntityRecord("postType", postType, postId);
				if (post) {
					let slug = "page" === postType ? "page" : "single-" + postType;
					if (post.slug) slug += "-" + post.slug;
					tasks.push(core.getDefaultTemplateId({ slug }));
				}
			}
			if (tasks.length) await Promise.all(tasks);
			if (globalStylesId) {
				if (coreSelect.canUser("update", {
					kind: "root",
					name: "globalStyles",
					id: globalStylesId
				})) await core.getEntityRecord("root", "globalStyles", globalStylesId);
				else await core.getEntityRecord("root", "globalStyles", globalStylesId, { context: "view" });
			}
		} catch {}
	}
	/**
	* Used to reinitialize the editor after an error. Now it's a deprecated noop function.
	*/
	function reinitializeEditor() {
		(0, _wordpress_deprecated.default)("wp.editPost.reinitializeEditor", {
			since: "6.2",
			version: "6.3"
		});
	}

exports.PluginBlockSettingsMenuItem = PluginBlockSettingsMenuItem;
exports.PluginDocumentSettingPanel = PluginDocumentSettingPanel;
exports.PluginMoreMenuItem = PluginMoreMenuItem;
exports.PluginPostPublishPanel = PluginPostPublishPanel;
exports.PluginPostStatusInfo = PluginPostStatusInfo;
exports.PluginPrePublishPanel = PluginPrePublishPanel;
exports.PluginSidebar = PluginSidebar;
exports.PluginSidebarMoreMenuItem = PluginSidebarMoreMenuItem;
exports.__experimentalFullscreenModeClose = FullscreenModeClose;
exports.__experimentalMainDashboardButton = __experimentalMainDashboardButton;
exports.__experimentalPluginPostExcerpt = __experimentalPluginPostExcerpt;
exports.initializeEditor = initializeEditor;
exports.reinitializeEditor = reinitializeEditor;
exports.store = store;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).editPost = exports;
return exports;
})({}, window.wp.blocks, window.wp.blockLibrary, window.wp.deprecated, window.wp.element, window.wp.data, window.wp.preferences, window.wp.widgets, window.wp.editor, window.wp.coreData, window.wp.apiFetch, window.wp.i18n, window.React, window.ReactJSXRuntime, window.ReactDOM, window.wp.primitives, window.wp.compose, window.wp.theme, window.wp.privateApis, window.wp.components, window.wp.blockEditor, window.wp.plugins, window.wp.notices, window.wp.commands, window.wp.url, window.wp.htmlEntities, window.wp.keyboardShortcuts, window.wp.hooks, window.wp.keycodes);
//# sourceMappingURL=index.js.map