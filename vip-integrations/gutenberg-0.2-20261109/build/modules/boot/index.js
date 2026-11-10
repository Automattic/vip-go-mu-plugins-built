import { privateApis, useNavigate, useSearch } from "@wordpress/route";
import { speak } from "@wordpress/a11y";

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

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:react
var require__wp_global_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.React;
}));

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useRefWithInit.mjs
var import__wp_global_react = /* @__PURE__ */ __toESM(require__wp_global_react(), 1);
const UNINITIALIZED = {};
/**
* A React.useRef() that is initialized with a function. Note that it accepts an optional
* initialization argument, so the initialization function doesn't need to be an inline closure.
*
* @usage
*   const ref = useRefWithInit(sortColumns, columns)
*/
function useRefWithInit(init, initArg) {
	const ref = import__wp_global_react.useRef(UNINITIALIZED);
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
const majorVersion$1 = parseInt(import__wp_global_react.version, 10);
function isReactVersionAtLeast(reactVersionToCheck) {
	return majorVersion$1 >= reactVersionToCheck;
}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/getReactElementRef.mjs
/**
* Extracts the `ref` from a React element, handling different React versions.
*/
function getReactElementRef(element) {
	if (!/*#__PURE__*/ import__wp_global_react.isValidElement(element)) return null;
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
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

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
	const state = params.state ?? EMPTY_OBJECT;
	return evaluateRenderProp(element, renderProp, outProps, state);
}
/**
* Computes render element final props.
*/
function useRenderElementProps(componentProps, params, renderProp) {
	const { className: classNameProp, style: styleProp } = componentProps;
	const { state = EMPTY_OBJECT, ref, props, stateAttributesMapping, enabled = true } = params;
	const className = enabled ? resolveClassName(classNameProp, state) : void 0;
	const style = enabled ? resolveStyle(styleProp, state) : void 0;
	const stateProps = enabled ? getStateAttributesProps(state, stateAttributesMapping) : EMPTY_OBJECT;
	const resolvedProps = enabled && props ? resolveRenderFunctionProps(props) : void 0;
	const outProps = enabled ? mergeObjects(stateProps, resolvedProps) ?? {} : EMPTY_OBJECT;
	if (typeof document !== "undefined") {
		if (!enabled) useMergedRefs(null, null);
		else if (Array.isArray(ref)) outProps.ref = useMergedRefsN([
			outProps.ref,
			getReactElementRef(renderProp),
			...ref
		]);
		else outProps.ref = useMergedRefs(outProps.ref, getReactElementRef(renderProp), ref);
	}
	if (!enabled) return EMPTY_OBJECT;
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
	const unwrapped = import__wp_global_react.Children.toArray(render)[0];
	return /*#__PURE__*/ import__wp_global_react.isValidElement(unwrapped) ? unwrapped : render;
}
function evaluateRenderProp(element, render, props, state) {
	if (render) {
		if (typeof render === "function") {
			warnIfRenderPropLooksLikeComponent(render);
			return render(props, state);
		}
		const mergedProps = mergeProps(props, render.props);
		mergedProps.ref = props.ref;
		if (!/*#__PURE__*/ import__wp_global_react.isValidElement(render)) throw new Error([
			"Base UI: The `render` prop was provided an invalid React element as `React.isValidElement(render)` is `false`.",
			"A valid React element must be provided to the `render` prop because it is cloned with props to replace the default element.",
			"https://base-ui.com/r/invalid-render-prop"
		].join("\n"));
		return /*#__PURE__*/ import__wp_global_react.cloneElement(render, mergedProps);
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
	if (Tag === "button") return /*#__PURE__*/ (0, import__wp_global_react.createElement)("button", {
		type: "button",
		...props,
		key: props.key
	});
	if (Tag === "img") return /*#__PURE__*/ (0, import__wp_global_react.createElement)("img", {
		alt: "",
		...props,
		key: props.key
	});
	return /*#__PURE__*/ import__wp_global_react.createElement(Tag, props);
}

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/safeReact.mjs
/**
* A clone of the React namespace for reading APIs that may be missing in older
* supported React versions. Bundlers can rewrite direct `React.someNewApi`
* reads into named imports, which breaks React 17. Reading from this cloned
* object keeps those lookups optional.
*
* @see https://github.com/mui/material-ui/issues/41190#issuecomment-2040873379
*/
const SafeReact = { ...import__wp_global_react };

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
const useIsoLayoutEffect = typeof document !== "undefined" ? import__wp_global_react.useLayoutEffect : noop;

// \0wp-global:react-dom
var require__wp_global_react_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactDOM;
}));

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useOnMount.mjs
/**
* A React.useEffect equivalent that runs once, when the component is mounted.
*/
function useOnMount(fn) {
	import__wp_global_react.useEffect(fn, EMPTY_ARRAY);
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
var import__wp_global_react_dom = /* @__PURE__ */ __toESM(require__wp_global_react_dom(), 1);
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
			import__wp_global_react_dom.flushSync(() => {
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
				import__wp_global_react_dom.flushSync(fnToExecute);
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
	import__wp_global_react.useEffect(() => {
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
	const [transitionStatus, setTransitionStatus] = import__wp_global_react.useState(open && enableIdleState ? "idle" : void 0);
	const [mounted, setMounted] = import__wp_global_react.useState(open && !animateInitialOpen);
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

// node_modules/.store/clsx@2.1.1-XOLP1vUL9vEGfpiXm37fAw/node_modules/clsx/dist/clsx.mjs
var import_element = require_element();
var import_data = require_data();
var import_i18n = require_i18n();
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

// \0wp-global:@wordpress/primitives
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.primitives;
}));

// packages/ui/build-module/icon/icon.mjs
var import_primitives = require_primitives();
var import_jsx_runtime = require_jsx_runtime();
/**
* Renders an SVG icon with a 24px default size.
*
* ```jsx
* import { wordpress } from '@wordpress/icons';
*
* <Icon icon={ wordpress } />
* ```
*/
const Icon$4 = (0, import_element.forwardRef)(function UnforwardedIcon({ icon, size = 24, style, ...restProps }, ref) {
	const mergedStyle = icon.props.style || style ? {
		...icon.props.style,
		...style
	} : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
		ref,
		...icon.props,
		...restProps,
		...mergedStyle ? { style: mergedStyle } : {},
		width: size,
		height: size
	});
});

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useForcedRerendering.mjs
/**
* Returns a function that forces a rerender.
*/
function useForcedRerendering() {
	const [, setState] = import__wp_global_react.useState({});
	return import__wp_global_react.useCallback(() => {
		setState({});
	}, []);
}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useId.mjs
let globalId = 0;
function useGlobalId(idOverride, prefix = "mui") {
	const defaultId = import__wp_global_react.useRef(void 0);
	const forceRerender = useForcedRerendering();
	const id = idOverride ?? defaultId.current;
	import__wp_global_react.useEffect(() => {
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
	const custom = customProperties ?? EMPTY_OBJECT;
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
const FloatingDelayGroupContext = /*#__PURE__*/ import__wp_global_react.createContext({
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
	const delayRef = import__wp_global_react.useRef(delay);
	const initialDelayRef = import__wp_global_react.useRef(delay);
	const currentIdRef = import__wp_global_react.useRef(null);
	const currentContextRef = import__wp_global_react.useRef(null);
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
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingDelayGroupContext.Provider, {
		value: import__wp_global_react.useMemo(() => ({
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
	const { currentIdRef, delayRef, timeoutMs, initialDelayRef, currentContextRef, hasProvider, timeout } = import__wp_global_react.useContext(FloatingDelayGroupContext);
	const [isInstantPhase, setIsInstantPhase] = import__wp_global_react.useState(false);
	const openRef = import__wp_global_react.useRef(open);
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
	return import__wp_global_react.useMemo(() => ({
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
const FocusGuard = /*#__PURE__*/ import__wp_global_react.forwardRef(function FocusGuard(props, ref) {
	const [role, setRole] = import__wp_global_react.useState();
	useIsoLayoutEffect(() => {
		if (voiceOver && webkit) setRole("button");
	}, []);
	const restProps = {
		tabIndex: 0,
		role
	};
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
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
const PortalContext = /*#__PURE__*/ import__wp_global_react.createContext(null);
PortalContext.displayName = "PortalContext";
const usePortalContext = () => import__wp_global_react.useContext(PortalContext);
const attr = createAttribute("portal");
function useFloatingPortalNode(props = {}) {
	const { ref, container: containerProp, componentProps = EMPTY_OBJECT, elementProps } = props;
	const uniqueId = useId$1();
	const parentPortalNode = usePortalContext()?.portalNode;
	const [containerElement, setContainerElement] = import__wp_global_react.useState(null);
	const [portalNode, setPortalNode] = import__wp_global_react.useState(null);
	const setPortalNodeRef = useStableCallback((node) => {
		if (node !== null) setPortalNode(node);
	});
	const containerRef = import__wp_global_react.useRef(null);
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
	const portalSubtree = containerElement && portalElement ? /*#__PURE__*/ import__wp_global_react_dom.createPortal(portalElement, containerElement) : null;
	return {
		node: portalNode,
		nodeId: /*#__PURE__*/ import__wp_global_react.isValidElement(portalElement) ? portalElement.props.id : void 0,
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
const FloatingPortal = /*#__PURE__*/ import__wp_global_react.forwardRef(function FloatingPortal(componentProps, forwardedRef) {
	const { render, className, style, children, container, portalOwnerRole, ...elementProps } = componentProps;
	const { node: portalNode, nodeId: portalNodeId, subtree: portalSubtree } = useFloatingPortalNode({
		container,
		ref: forwardedRef,
		componentProps,
		elementProps
	});
	const beforeOutsideRef = import__wp_global_react.useRef(null);
	const afterOutsideRef = import__wp_global_react.useRef(null);
	const beforeInsideRef = import__wp_global_react.useRef(null);
	const afterInsideRef = import__wp_global_react.useRef(null);
	const [focusManagerState, setFocusManagerState] = import__wp_global_react.useState(null);
	const focusInsideDisabledRef = import__wp_global_react.useRef(false);
	const modal = focusManagerState?.modal;
	const open = focusManagerState?.open;
	const shouldRenderGuards = !!focusManagerState && !focusManagerState.modal && focusManagerState.open && !!portalNode;
	import__wp_global_react.useEffect(() => {
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
	const portalContextValue = import__wp_global_react.useMemo(() => ({
		beforeOutsideRef,
		afterOutsideRef,
		beforeInsideRef,
		afterInsideRef,
		portalNode,
		setFocusManagerState
	}), [portalNode]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import__wp_global_react.Fragment, { children: [portalSubtree, /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(PortalContext.Provider, {
		value: portalContextValue,
		children: [
			shouldRenderGuards && portalNode && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
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
			shouldRenderGuards && portalNode && /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
				role: portalOwnerRole,
				"aria-owns": portalNodeId,
				style: ownerVisuallyHidden
			}),
			portalNode && /*#__PURE__*/ import__wp_global_react_dom.createPortal(children, portalNode),
			shouldRenderGuards && portalNode && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
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
const FloatingNodeContext = /*#__PURE__*/ import__wp_global_react.createContext(null);
FloatingNodeContext.displayName = "FloatingNodeContext";
const FloatingTreeContext = /*#__PURE__*/ import__wp_global_react.createContext(null);
FloatingTreeContext.displayName = "FloatingTreeContext";
const useFloatingParentNodeId = () => import__wp_global_react.useContext(FloatingNodeContext)?.id || null;
/**
* Returns the nearest floating tree context, if available.
*/
const useFloatingTree = (externalTree) => {
	const contextTree = import__wp_global_react.useContext(FloatingTreeContext);
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
	const initialRef = import__wp_global_react.useRef(false);
	const cleanupListenerRef = import__wp_global_react.useRef(null);
	const [pointerType, setPointerType] = import__wp_global_react.useState();
	const [reactive, setReactive] = import__wp_global_react.useState([]);
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
	import__wp_global_react.useEffect(() => {
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
	import__wp_global_react.useEffect(() => () => {
		store.set("positionReference", null);
	}, [store]);
	import__wp_global_react.useEffect(() => {
		if (enabled && !floating) initialRef.current = false;
	}, [enabled, floating]);
	import__wp_global_react.useEffect(() => {
		if (!enabled && open) initialRef.current = true;
	}, [enabled, open]);
	const reference = import__wp_global_react.useMemo(() => {
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
	return import__wp_global_react.useMemo(() => enabled ? {
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
	const pressStartedInsideRef = import__wp_global_react.useRef(false);
	const pressStartPreventedRef = import__wp_global_react.useRef(false);
	const suppressNextOutsideClickRef = import__wp_global_react.useRef(false);
	const sawPressWhileOpenRef = import__wp_global_react.useRef(false);
	const isComposingRef = import__wp_global_react.useRef(false);
	const currentPointerTypeRef = import__wp_global_react.useRef("");
	const touchStateRef = import__wp_global_react.useRef(null);
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
	import__wp_global_react.useEffect(() => {
		function handleOpenChange(details) {
			if (!details.open) sawPressWhileOpenRef.current = false;
		}
		events.on("openchange", handleOpenChange);
		return () => {
			events.off("openchange", handleOpenChange);
		};
	}, [events]);
	import__wp_global_react.useEffect(() => clearInsideReactTree, [clearInsideReactTree]);
	import__wp_global_react.useEffect(() => {
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
	const reference = import__wp_global_react.useMemo(() => ({
		onKeyDown: closeOnEscapeKeyDown,
		onPointerDown: closeOnReferencePress,
		onClick: closeOnReferencePress
	}), [closeOnEscapeKeyDown, closeOnReferencePress]);
	const floating = import__wp_global_react.useMemo(() => ({
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
	return import__wp_global_react.useMemo(() => enabled ? {
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
	const mountedRef = import__wp_global_react.useRef(mounted);
	const pendingUnmountRef = import__wp_global_react.useRef(false);
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
	const registrationRef = import__wp_global_react.useRef(null);
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
	if (isHover) import__wp_global_react_dom.flushSync(changeState);
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
	const resolvedActiveTriggerIdRef = import__wp_global_react.useRef(null);
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
			activeTriggerProps: EMPTY_OBJECT,
			inactiveTriggerProps: EMPTY_OBJECT,
			popupProps: EMPTY_OBJECT
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
	return /*#__PURE__*/ import__wp_global_react.forwardRef(fastComponent(fn));
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
	const getSelection = import__wp_global_react.useCallback(() => selector(store.getSnapshot(), a1, a2, a3), [
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
		import__wp_global_react.useDebugValue(key);
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
			import__wp_global_react.useDebugValue(statePart, (p) => Object.keys(p));
			const keys = import__wp_global_react.useRef(Object.keys(statePart)).current;
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
		import__wp_global_react.useDebugValue(key);
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
		import__wp_global_react.useDebugValue(key);
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
		import__wp_global_react.useDebugValue(key);
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
		const ref = import__wp_global_react.useRef(void 0);
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
		activeTriggerProps: EMPTY_OBJECT,
		inactiveTriggerProps: EMPTY_OBJECT,
		popupProps: EMPTY_OBJECT
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
	const subscribe = import__wp_global_react.useCallback((listener) => {
		if (handle === void 0) return NOOP;
		return handle.subscribeStore(listener);
	}, [handle]);
	const getSnapshot = import__wp_global_react.useCallback(() => {
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
	const blockFocusRef = import__wp_global_react.useRef(false);
	const blockedReferenceRef = import__wp_global_react.useRef(null);
	const keyboardModalityRef = import__wp_global_react.useRef(true);
	const timeout = useTimeout();
	import__wp_global_react.useEffect(() => {
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
	import__wp_global_react.useEffect(() => {
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
	const reference = import__wp_global_react.useMemo(() => {
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
	return import__wp_global_react.useMemo(() => enabled ? {
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
	import__wp_global_react.useEffect(() => {
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
	import__wp_global_react.useEffect(() => {
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
	const isHoverCloseActiveRef = import__wp_global_react.useRef(false);
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
	import__wp_global_react.useEffect(() => cleanupMouseMoveHandler, [cleanupMouseMoveHandler]);
	import__wp_global_react.useEffect(() => {
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
	import__wp_global_react.useEffect(() => {
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
	return import__wp_global_react.useMemo(() => {
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
				if (instance.pointerType === "touch") import__wp_global_react_dom.flushSync(() => {
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
function isRTL$5(element) {
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
	isRTL: isRTL$5
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
var index = typeof document !== "undefined" ? import__wp_global_react.useLayoutEffect : function noop() {};
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
	const ref = import__wp_global_react.useRef(value);
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
	const [data, setData] = import__wp_global_react.useState({
		x: 0,
		y: 0,
		strategy,
		placement,
		middlewareData: {},
		isPositioned: false
	});
	const [latestMiddleware, setLatestMiddleware] = import__wp_global_react.useState(middleware);
	if (!deepEqual(latestMiddleware, middleware)) setLatestMiddleware(middleware);
	const [_reference, _setReference] = import__wp_global_react.useState(null);
	const [_floating, _setFloating] = import__wp_global_react.useState(null);
	const setReference = import__wp_global_react.useCallback((node) => {
		if (node !== referenceRef.current) {
			referenceRef.current = node;
			_setReference(node);
		}
	}, []);
	const setFloating = import__wp_global_react.useCallback((node) => {
		if (node !== floatingRef.current) {
			floatingRef.current = node;
			_setFloating(node);
		}
	}, []);
	const referenceEl = externalReference || _reference;
	const floatingEl = externalFloating || _floating;
	const referenceRef = import__wp_global_react.useRef(null);
	const floatingRef = import__wp_global_react.useRef(null);
	const dataRef = import__wp_global_react.useRef(data);
	const hasWhileElementsMounted = whileElementsMounted != null;
	const whileElementsMountedRef = useLatestRef(whileElementsMounted);
	const platformRef = useLatestRef(platform);
	const openRef = useLatestRef(open);
	const update = import__wp_global_react.useCallback(() => {
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
				import__wp_global_react_dom.flushSync(() => {
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
	const isMountedRef = import__wp_global_react.useRef(false);
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
	const refs = import__wp_global_react.useMemo(() => ({
		reference: referenceRef,
		floating: floatingRef,
		setReference,
		setFloating
	}), [setReference, setFloating]);
	const elements = import__wp_global_react.useMemo(() => ({
		reference: referenceEl,
		floating: floatingEl
	}), [referenceEl, floatingEl]);
	const floatingStyles = import__wp_global_react.useMemo(() => {
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
	return import__wp_global_react.useMemo(() => ({
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
const DirectionContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
DirectionContext.displayName = "DirectionContext";
function useDirection() {
	return import__wp_global_react.useContext(DirectionContext)?.direction ?? "ltr";
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
	const [positionReference, setPositionReferenceRaw] = import__wp_global_react.useState(null);
	const domReferenceRef = import__wp_global_react.useRef(null);
	const tree = useFloatingTree(externalTree);
	const storeElements = import__wp_global_react.useMemo(() => ({
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
	const setPositionReference = import__wp_global_react.useCallback((node) => {
		const computedPositionReference = isElement(node) ? {
			getBoundingClientRect: () => node.getBoundingClientRect(),
			getClientRects: () => node.getClientRects(),
			contextElement: node
		} : node;
		setPositionReferenceRaw(computedPositionReference);
		position.refs.setReference(computedPositionReference);
	}, [position.refs]);
	const refs = import__wp_global_react.useMemo(() => ({
		...position.refs,
		setPositionReference,
		domReference: domReferenceRef
	}), [position.refs, setPositionReference]);
	const elements = import__wp_global_react.useMemo(() => ({
		...position.elements,
		domReference: domReferenceElement
	}), [position.elements, domReferenceElement]);
	const context = import__wp_global_react.useMemo(() => ({
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
	return import__wp_global_react.useMemo(() => ({
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
	const [mountPlacement, setMountPlacement] = import__wp_global_react.useState(null);
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
	const arrowRef = import__wp_global_react.useRef(null);
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
	const autoUpdateOptions = import__wp_global_react.useMemo(() => ({
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
	const floatingStyles = import__wp_global_react.useMemo(() => {
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
	const registeredPositionReferenceRef = import__wp_global_react.useRef(null);
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
	import__wp_global_react.useEffect(() => {
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
	import__wp_global_react.useEffect(() => {
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
	const arrowStyles = import__wp_global_react.useMemo(() => ({
		position: "absolute",
		top: middlewareData.arrow?.y,
		left: middlewareData.arrow?.x
	}), [middlewareData.arrow]);
	const arrowUncentered = middlewareData.arrow?.centerOffset !== 0;
	return import__wp_global_react.useMemo(() => ({
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
	return transitionStatus === "starting" ? DISABLED_TRANSITIONS_STYLE : EMPTY_OBJECT;
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
	const contextValue = import__wp_global_react.useMemo(() => ({ direction }), [direction]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(DirectionContext.Provider, {
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
const FloatingPortalLite = /*#__PURE__*/ import__wp_global_react.forwardRef(function FloatingPortalLite(componentProps, forwardedRef) {
	const { children, container, className, render, style, ...elementProps } = componentProps;
	const { node: portalNode, subtree: portalSubtree } = useFloatingPortalNode({
		container,
		ref: forwardedRef,
		componentProps,
		elementProps
	});
	if (!portalSubtree && !portalNode) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import__wp_global_react.Fragment, { children: [portalSubtree, portalNode && /*#__PURE__*/ import__wp_global_react_dom.createPortal(children, portalNode)] });
});
FloatingPortalLite.displayName = "FloatingPortalLite";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/root/TooltipRootContext.mjs
const TooltipRootContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
TooltipRootContext.displayName = "TooltipRootContext";
function useTooltipRootContext(optional) {
	const context = import__wp_global_react.useContext(TooltipRootContext);
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
		popupRef: /*#__PURE__*/ import__wp_global_react.createRef(),
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
	const previousInstantTypeRef = import__wp_global_react.useRef(null);
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
	import__wp_global_react.useImperativeHandle(actionsRef, () => ({
		unmount: forceUnmount,
		close: () => store.setOpen(false, createChangeEventDetails(imperativeAction))
	}), [forceUnmount, store]);
	const shouldRenderInteractions = open || mounted || !disabled$1 && trackCursorAxis !== "none";
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(TooltipRootContext.Provider, {
		value: store,
		children: [
			handle && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(PopupHandleAttachment, {
				handle,
				store
			}),
			shouldRenderInteractions && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TooltipInteractions, {
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
	const triggerProps = import__wp_global_react.useMemo(() => mergeProps(clientPoint.reference, dismiss.reference), [clientPoint.reference, dismiss.reference]);
	usePopupInteractionProps(store, {
		activeTriggerProps: triggerProps,
		inactiveTriggerProps: triggerProps,
		popupProps: dismiss.floating ?? EMPTY_OBJECT
	});
	return null;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/provider/TooltipProviderContext.mjs
/**
* Holds the provider's `delay` value. `closeDelay` is handled by the delay group.
*/
const TooltipProviderContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
TooltipProviderContext.displayName = "TooltipProviderContext";
function useTooltipProviderContext() {
	return import__wp_global_react.useContext(TooltipProviderContext);
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
	const triggerElementRef = import__wp_global_react.useRef(null);
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
	const isNestedTriggerHoveredRef = import__wp_global_react.useRef(false);
	const nestedTriggerOpenTimeout = useTimeout();
	const pointerTypeRef = import__wp_global_react.useRef(void 0);
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
const TooltipPortalContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
TooltipPortalContext.displayName = "TooltipPortalContext";
function useTooltipPortalContext() {
	const value = import__wp_global_react.useContext(TooltipPortalContext);
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
const TooltipPortal = /*#__PURE__*/ import__wp_global_react.forwardRef(function TooltipPortal(props, forwardedRef) {
	const { keepMounted = false, ...portalProps } = props;
	if (!(useTooltipRootContext().useState("mounted") || keepMounted)) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TooltipPortalContext.Provider, {
		value: keepMounted,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingPortalLite, {
			ref: forwardedRef,
			...portalProps
		})
	});
});
TooltipPortal.displayName = "TooltipPortal";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/tooltip/positioner/TooltipPositionerContext.mjs
const TooltipPositionerContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
TooltipPositionerContext.displayName = "TooltipPositionerContext";
function useTooltipPositionerContext() {
	const context = import__wp_global_react.useContext(TooltipPositionerContext);
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
const TooltipPositioner = /*#__PURE__*/ import__wp_global_react.forwardRef(function TooltipPositioner(componentProps, forwardedRef) {
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
	const state = import__wp_global_react.useMemo(() => ({
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
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TooltipPositionerContext.Provider, {
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
const TooltipPopup = /*#__PURE__*/ import__wp_global_react.forwardRef(function TooltipPopup(componentProps, forwardedRef) {
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
	const delayValue = import__wp_global_react.useMemo(() => ({
		open: delay,
		close: closeDelay
	}), [delay, closeDelay]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(TooltipProviderContext.Provider, {
		value: delay,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingDelayGroup, {
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

// \0wp-global:@wordpress/compose
var require_compose = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.compose;
}));

// packages/icons/build-module/library/caution.mjs
var caution_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 8L12 13M12 14.5L12 16M4.75 12C4.75 7.99593 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12Z",
		strokeLinejoin: "round"
	})
});

// packages/icons/build-module/library/check.mjs
var check_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M7 12L10 15L17 8" })
});

// packages/icons/build-module/library/chevron-down-small.mjs
var chevron_down_small_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M8.5 10.5L12 13.5L15.5 10.5" })
});

// packages/icons/build-module/library/chevron-left-small.mjs
var chevron_left_small_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M13.5 8.5L10.5 12L13.5 15.5" })
});

// packages/icons/build-module/library/chevron-left.mjs
var chevron_left_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M14 6.5L9 12L14 17.5" })
});

// packages/icons/build-module/library/chevron-right-small.mjs
var chevron_right_small_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M10.5 8.5L13.5 12L10.5 15.5" })
});

// packages/icons/build-module/library/chevron-right.mjs
var chevron_right_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M10 6.5L15 12L10 17.5" })
});

// packages/icons/build-module/library/copy.mjs
var copy_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M20.25 6.75V19C20.25 19.6904 19.6904 20.25 19 20.25H6.75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M3.75 5C3.75 4.30964 4.30964 3.75 5 3.75H16C16.6904 3.75 17.25 4.30964 17.25 5V16C17.25 16.6904 16.6904 17.25 16 17.25H5C4.30964 17.25 3.75 16.6904 3.75 16V5Z" })]
});

// packages/icons/build-module/library/error.mjs
var error_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M12 9L12 14M12 15.5V17M11.1284 5.04947L3.83827 18.0097C3.46331 18.6763 3.94502 19.5 4.70985 19.5H19.2902C20.055 19.5 20.5367 18.6763 20.1617 18.0097L12.8716 5.04947C12.4893 4.36982 11.5107 4.36982 11.1284 5.04947Z" })
});

// packages/icons/build-module/library/menu.mjs
var menu_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M5 12H19M5 18.25H19M5 5.75H19" })
});

// packages/ui/build-module/visually-hidden/visually-hidden.mjs
const STYLE_HASH_ATTRIBUTE$26 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$26() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$26(document);
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
function documentContainsStyleHash$26(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$26}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$26) === hash) return true;
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
function injectStyle$26(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$26();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$26(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$26, hash);
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
function registerDocument$26(targetDocument) {
	const runtime = getRuntime$26();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$26(targetDocument, hash, css);
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
function registerStyle$26(hash, css) {
	const runtime = getRuntime$26();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$26(targetDocument, hash, css);
}
registerStyle$26("7caae29f9e", ".e2c3cbe6ada7d785__visually-hidden{border:0;clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;overflow-wrap:normal;padding:0;position:absolute;width:1px;word-break:normal}");
var style_module_default$25 = { "visually-hidden": "e2c3cbe6ada7d785__visually-hidden" };
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
const VisuallyHidden = (0, import_element.forwardRef)(function UnforwardedVisuallyHidden({ render, ...restProps }, ref) {
	return useRender({
		render,
		ref,
		props: mergeProps({ className: style_module_default$25["visually-hidden"] }, restProps, { "data-visually-hidden": "" })
	});
});

// packages/ui/build-module/utils/keyboard-shortcut.mjs
/**
* Returns shortcut accessibility metadata for an interactive element.
*
* Render `KeyboardShortcutDescription` with the returned `descriptionId` when
* a shortcut is provided.
*/
function useKeyboardShortcutProps({ "aria-describedby": ariaDescribedBy, "aria-keyshortcuts": ariaKeyShortcuts, shortcut }) {
	const generatedDescriptionId = (0, import_element.useId)();
	const descriptionId = shortcut ? generatedDescriptionId : void 0;
	return {
		descriptionId,
		targetProps: {
			"aria-describedby": [ariaDescribedBy, descriptionId].filter(Boolean).join(" ") || void 0,
			"aria-keyshortcuts": shortcut?.ariaKeyShortcut ?? ariaKeyShortcuts
		}
	};
}
/**
* Renders a localized, visually hidden description for a keyboard shortcut.
*/
const KeyboardShortcutDescription = (0, import_element.forwardRef)(function UnforwardedKeyboardShortcutDescription({ descriptionId, shortcut }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisuallyHidden, {
		id: descriptionId,
		"aria-hidden": "true",
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { ref }),
		children: (0, import_i18n.sprintf)((0, import_i18n.__)("Keyboard shortcut: %s"), shortcut.label ?? shortcut.ariaKeyShortcut)
	});
});
/**
* Renders a visual keyboard shortcut while hiding it from assistive
* technology.
*/
const KeyboardShortcutDisplay = (0, import_element.forwardRef)(function UnforwardedKeyboardShortcutDisplay({ className, shortcut }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		ref,
		"aria-hidden": "true",
		className,
		dir: "ltr",
		children: shortcut.displayShortcut
	});
});

// packages/ui/build-module/text/text.mjs
const STYLE_HASH_ATTRIBUTE$25 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$25() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$25(document);
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
function documentContainsStyleHash$25(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$25}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$25) === hash) return true;
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
function injectStyle$25(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$25();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$25(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$25, hash);
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
function registerDocument$25(targetDocument) {
	const runtime = getRuntime$25();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$25(targetDocument, hash, css);
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
function registerStyle$25(hash, css) {
	const runtime = getRuntime$25();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$25(targetDocument, hash, css);
}
registerStyle$25("09bae534ff", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9745ffa515d864cf__text{text-wrap:pretty;margin:0}._8882b6a7feb4fd3d__heading-2xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-p-line-height:var(--wpds-typography-line-height-2xl,40px);font-size:var(--wpds-typography-font-size-2xl,32px);line-height:var(--wpds-typography-line-height-2xl,40px)}._664e3e7687c45603__heading-xl,._8882b6a7feb4fd3d__heading-2xl{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600)}._664e3e7687c45603__heading-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-md,24px)}.dac661a5de0ed2bd__heading-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-lg,15px)}._59c7f3f740e2f96e__heading-md,.dac661a5de0ed2bd__heading-lg{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-sm,20px)}._59c7f3f740e2f96e__heading-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px)}.cf052fbad8d93b7e__heading-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._212b9cfef57a0af4__body-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-xl,32px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-xl,32px)}._07f57bc0aa36b2c6__body-lg,._212b9cfef57a0af4__body-xl{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}._07f57bc0aa36b2c6__body-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-lg,15px);line-height:var(--wpds-typography-line-height-md,24px)}._0c6da4457aec9e62__body-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px)}._0c6da4457aec9e62__body-md,.b998f87ff17b7bec__body-sm{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}.b998f87ff17b7bec__body-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var style_module_default$24 = {
	"text": "_9745ffa515d864cf__text",
	"heading-2xl": "_8882b6a7feb4fd3d__heading-2xl",
	"heading-xl": "_664e3e7687c45603__heading-xl",
	"heading-lg": "dac661a5de0ed2bd__heading-lg",
	"heading-md": "_59c7f3f740e2f96e__heading-md",
	"heading-sm": "cf052fbad8d93b7e__heading-sm",
	"body-xl": "_212b9cfef57a0af4__body-xl",
	"body-lg": "_07f57bc0aa36b2c6__body-lg",
	"body-md": "_0c6da4457aec9e62__body-md",
	"body-sm": "b998f87ff17b7bec__body-sm"
};
registerStyle$25("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default$1 = {
	"button": "_78c10a0773e51a91__button",
	"input": "_5b33aa2d48624b4f__input",
	"textarea": "_980b3b4776ac8f81__textarea",
	"div": "_43e478b4279a076c__div",
	"p": "_698099e25b0fb1a6__p",
	"heading": "_326aee4184d261fd__heading",
	"a": "e9576240835601ba__a",
	"ol": "_3f05789653864a73__ol",
	"li": "_3c72ff72abe57859__li",
	"span": "_79d16267c15d9eb2__span"
};
/**
* A text component for rendering content with predefined typographic variants.
* Built on design tokens for consistent typography across the UI.
*/
const Text = (0, import_element.forwardRef)(function UnforwardedText({ variant = "body-md", render, className, ...props }, ref) {
	return useRender({
		render,
		defaultTagName: "span",
		ref,
		props: mergeProps(props, { className: clsx(style_module_default$24.text, global_css_defense_module_default$1.heading, global_css_defense_module_default$1.p, style_module_default$24[variant], className) })
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
	return (0, import_element.cloneElement)(slot ?? defaultSlot, { children });
}

// packages/ui/build-module/utils/wp-compat-overlay-slot.mjs
const STYLE_HASH_ATTRIBUTE$24 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$24() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$24(document);
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
function documentContainsStyleHash$24(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$24}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$24) === hash) return true;
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
function injectStyle$24(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$24();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$24(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$24, hash);
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
function registerDocument$24(targetDocument) {
	const runtime = getRuntime$24();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$24(targetDocument, hash, css);
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
function registerStyle$24(hash, css) {
	const runtime = getRuntime$24();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$24(targetDocument, hash, css);
}
registerStyle$24("40df669685", "._9e7887c25dedb459__slot{inset:0;isolation:isolate;pointer-events:none;position:fixed;z-index:1000000003}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._9e7887c25dedb459__slot>*{pointer-events:auto}}}");
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectionProvider$1, {
		direction: (0, import_i18n.isRTL)() ? "rtl" : "ltr",
		children
	});
}

// packages/ui/build-module/tooltip/portal.mjs
/**
* Used to apply custom portal behavior to `Tooltip`'s floating content.
* `container` defaults to the `@wordpress/ui` compat overlay slot.
*/
const Portal = (0, import_element.forwardRef)(function TooltipPortal$1({ container, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipPortal, {
		container: container === void 0 ? getWpCompatOverlaySlot() : container,
		...restProps,
		ref
	});
});

// packages/ui/build-module/tooltip/positioner.mjs
const STYLE_HASH_ATTRIBUTE$23 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$23() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$23(document);
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
function documentContainsStyleHash$23(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$23}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$23) === hash) return true;
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
function injectStyle$23(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$23();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$23(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$23, hash);
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
function registerDocument$23(targetDocument) {
	const runtime = getRuntime$23();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$23(targetDocument, hash, css);
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
function registerStyle$23(hash, css) {
	const runtime = getRuntime$23();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$23(targetDocument, hash, css);
}
registerStyle$23("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default$1 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$23("aaf79ac691", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.b9266862d9435660__positioner{z-index:var(--wp-ui-tooltip-z-index,initial)}._7bb3fd8a0810be6d__popup{--_wp-ui-elevation-sm:0 1px 2px rgba(0,0,0,.05),0 2px 3px rgba(0,0,0,.04),0 6px 6px rgba(0,0,0,.03),0 8px 8px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-sm);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:1.4;padding:var(--wpds-dimension-padding-xs,4px) var(--wpds-dimension-padding-sm,8px);@media (forced-colors:active){border-bottom-color:CanvasText;border-bottom-style:solid;border-bottom-width:1px;border-left-color:CanvasText;border-left-style:solid;border-left-width:1px;border-right-color:CanvasText;border-right-style:solid;border-right-width:1px;border-top-color:CanvasText;border-top-style:solid;border-top-width:1px}}}}");
var style_module_default$23 = {
	"positioner": "b9266862d9435660__positioner",
	"popup": "_7bb3fd8a0810be6d__popup"
};
/**
* Used to apply custom positioning to `Tooltip`'s floating content.
*/
const Positioner = (0, import_element.forwardRef)(function TooltipPositioner$1({ align = "center", className, side = "top", sideOffset = 4, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipPositioner, {
		ref,
		align,
		side,
		sideOffset,
		...props,
		className: clsx(resets_module_default$1["box-sizing"], style_module_default$23.positioner, className)
	});
});

// \0wp-global:@wordpress/theme
var require_theme = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.theme;
}));

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/ui/build-module/lock-unlock.mjs
var import_private_apis = require_private_apis();
const { lock: lock$1, unlock: unlock$1 } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/ui");

// packages/ui/build-module/utils/theme-provider.mjs
var import_theme = /* @__PURE__ */ __toESM(require_theme(), 1);
function getThemeProvider() {
	const themePackage = import_theme;
	if (themePackage.ThemeProvider) return themePackage.ThemeProvider;
	if (!themePackage.privateApis) throw new Error("@wordpress/ui: @wordpress/theme must expose `ThemeProvider` or `privateApis.ThemeProvider`.");
	return unlock$1(themePackage.privateApis).ThemeProvider;
}
const ThemeProvider$2 = getThemeProvider();

// packages/ui/build-module/tooltip/popup.mjs
const STYLE_HASH_ATTRIBUTE$22 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$22() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$22(document);
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
function documentContainsStyleHash$22(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$22}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$22) === hash) return true;
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
function injectStyle$22(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$22();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$22(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$22, hash);
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
function registerDocument$22(targetDocument) {
	const runtime = getRuntime$22();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$22(targetDocument, hash, css);
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
function registerStyle$22(hash, css) {
	const runtime = getRuntime$22();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$22(targetDocument, hash, css);
}
registerStyle$22("aaf79ac691", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.b9266862d9435660__positioner{z-index:var(--wp-ui-tooltip-z-index,initial)}._7bb3fd8a0810be6d__popup{--_wp-ui-elevation-sm:0 1px 2px rgba(0,0,0,.05),0 2px 3px rgba(0,0,0,.04),0 6px 6px rgba(0,0,0,.03),0 8px 8px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-sm);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:1.4;padding:var(--wpds-dimension-padding-xs,4px) var(--wpds-dimension-padding-sm,8px);@media (forced-colors:active){border-bottom-color:CanvasText;border-bottom-style:solid;border-bottom-width:1px;border-left-color:CanvasText;border-left-style:solid;border-left-width:1px;border-right-color:CanvasText;border-right-style:solid;border-right-width:1px;border-top-color:CanvasText;border-top-style:solid;border-top-width:1px}}}}");
var style_module_default$22 = {
	"positioner": "b9266862d9435660__positioner",
	"popup": "_7bb3fd8a0810be6d__popup"
};
const POPUP_COLOR = { background: "#1e1e1e" };
const Popup = (0, import_element.forwardRef)(function TooltipPopup$1({ portal, positioner, children, className, ...props }, ref) {
	const popupContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider$2, {
		color: POPUP_COLOR,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipPopup, {
			ref,
			className: clsx(style_module_default$22.popup, className),
			...props,
			children
		})
	});
	const positionedPopup = renderSlotWithChildren(positioner, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Positioner, {}), popupContent);
	return renderSlotWithChildren(portal, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, {}), positionedPopup);
});

// packages/ui/build-module/tooltip/trigger.mjs
const Trigger = (0, import_element.forwardRef)(function TooltipTrigger$1(props, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
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
function Root$2(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectionProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRoot, { ...props }) });
}

// packages/ui/build-module/tooltip/provider.mjs
function Provider({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { ...props });
}

// packages/ui/build-module/link/link.mjs
const STYLE_HASH_ATTRIBUTE$21 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$21() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$21(document);
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
function documentContainsStyleHash$21(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$21}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$21) === hash) return true;
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
function injectStyle$21(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$21();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$21(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$21, hash);
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
function registerDocument$21(targetDocument) {
	const runtime = getRuntime$21();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$21(targetDocument, hash, css);
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
function registerStyle$21(hash, css) {
	const runtime = getRuntime$21();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$21(targetDocument, hash, css);
}
registerStyle$21("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$21("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
var focus_module_default = {
	"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
	"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
	"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
	"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
	"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
};
registerStyle$21("c87d91cdf7", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.a574f9f242212d58__link{--_gcd-a-border-radius:var(--wpds-border-radius-sm,2px);border-radius:var(--wpds-border-radius-sm,2px);text-decoration-thickness:from-font;text-underline-offset:.2em}._2d2f0506e717a46c__link-with-icon{text-decoration-line:none}._92b7b6a03fbb27ac__link-contents{text-decoration:inherit;text-decoration-line:underline}._69f40d9212adc58d__is-brand,._69f40d9212adc58d__is-brand:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9))}._69f40d9212adc58d__is-brand:active,._69f40d9212adc58d__is-brand:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000))}._9a9c54c6e67b4c3c__is-neutral,._9a9c54c6e67b4c3c__is-neutral:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);text-decoration-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d)}._9a9c54c6e67b4c3c__is-neutral:active,._9a9c54c6e67b4c3c__is-neutral:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e)}._93be0b747897baad__is-unstyled{--_gcd-a-border-radius:0;--_gcd-a-color:inherit;color:inherit;text-decoration:none}._9c39df40fdc09594__link-icon{font-weight:var(--wpds-typography-font-weight-default,400);line-height:1;margin-inline-start:var(--wpds-dimension-padding-xs,4px);text-decoration:none}._9c39df40fdc09594__link-icon:after{content:\"\\2060\\2197\"}._9c39df40fdc09594__link-icon:dir(rtl):after{content:\"\\2060\\2196\"}}}");
var style_module_default$21 = {
	"link": "a574f9f242212d58__link",
	"link-with-icon": "_2d2f0506e717a46c__link-with-icon",
	"link-contents": "_92b7b6a03fbb27ac__link-contents",
	"is-brand": "_69f40d9212adc58d__is-brand",
	"is-neutral": "_9a9c54c6e67b4c3c__is-neutral",
	"is-unstyled": "_93be0b747897baad__is-unstyled",
	"link-icon": "_9c39df40fdc09594__link-icon"
};
registerStyle$21("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default = {
	"button": "_78c10a0773e51a91__button",
	"input": "_5b33aa2d48624b4f__input",
	"textarea": "_980b3b4776ac8f81__textarea",
	"div": "_43e478b4279a076c__div",
	"p": "_698099e25b0fb1a6__p",
	"heading": "_326aee4184d261fd__heading",
	"a": "e9576240835601ba__a",
	"ol": "_3f05789653864a73__ol",
	"li": "_3c72ff72abe57859__li",
	"span": "_79d16267c15d9eb2__span"
};
/**
* A styled anchor element with support for semantic color tones and an
* unstyled escape hatch.
*
* See the [Usage Guidelines](https://wordpress.github.io/gutenberg/?path=/docs/design-system-components-button-usage-guidelines--docs)
* for when to use `Button`, `IconButton`, `Link`, or `ButtonLink`.
*/
const Link = (0, import_element.forwardRef)(function UnforwardedLink({ children, variant = "default", tone = "brand", openInNewTab = false, target, render, className, ...props }, ref) {
	const shouldShowNewTabIndicator = openInNewTab || /^_blank$/i.test(target ?? "");
	return useRender({
		render,
		defaultTagName: "a",
		ref,
		props: mergeProps(props, {
			className: clsx(global_css_defense_module_default.a, resets_module_default["box-sizing"], focus_module_default["outset-ring--focus-except-active"], variant !== "unstyled" && style_module_default$21.link, variant !== "unstyled" && shouldShowNewTabIndicator && style_module_default$21["link-with-icon"], variant !== "unstyled" && style_module_default$21[`is-${tone}`], variant === "unstyled" && style_module_default$21["is-unstyled"], className),
			target: target ?? (openInNewTab ? "_blank" : void 0),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [shouldShowNewTabIndicator && variant !== "unstyled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: style_module_default$21["link-contents"],
				children
			}) : children, shouldShowNewTabIndicator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: style_module_default$21["link-icon"],
				role: "img",
				"aria-label": (0, import_i18n.__)("(opens in a new tab)")
			})] })
		})
	});
});

// packages/react-inert-value/build-module/index.mjs
var import_compose = require_compose();
const majorVersion = parseInt(import__wp_global_react.version, 10);
/**
* Returns a value for the `inert` prop that the running version of React
* renders as the `inert` HTML attribute.
*
* React 19 handles `inert` as a boolean attribute, while React 18 knows nothing
* about `inert` and ignores `inert={ true }`, so it has to be given the string
* `'true'` instead.
*
* The return type describes what React 19 types accept. React 18 doesn't support
* `inert` HTML attribute at all, so a TypeScript call site still
* needs a `@ts-expect-error` annotation.
*
* Inspired by the helper of the same name in the Base UI library.
*
* @param value Boolean value for the `inert` prop.
* @return The actual value to pass to the `inert` prop.
*/
function inertValue(value) {
	if (majorVersion >= 19) return value;
	return value ? "true" : void 0;
}

// packages/ui/build-module/stack/stack.mjs
const STYLE_HASH_ATTRIBUTE$20 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$20() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$20(document);
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
function documentContainsStyleHash$20(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$20}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$20) === hash) return true;
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
function injectStyle$20(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$20();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$20(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$20, hash);
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
function registerDocument$20(targetDocument) {
	const runtime = getRuntime$20();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$20(targetDocument, hash, css);
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
function registerStyle$20(hash, css) {
	const runtime = getRuntime$20();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$20(targetDocument, hash, css);
}
registerStyle$20("67591fa198", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._8e8e79c1a2eec43b__stack{display:flex}}}");
var style_module_default$20 = { "stack": "_8e8e79c1a2eec43b__stack" };
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
const Stack = (0, import_element.forwardRef)(function UnforwardedStack({ direction, gap, align, justify, wrap, render, ...props }, ref) {
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
			className: style_module_default$20.stack
		})
	});
});

// packages/ui/build-module/empty-state/root.mjs
const STYLE_HASH_ATTRIBUTE$19 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$19() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$19(document);
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
function documentContainsStyleHash$19(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$19}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$19) === hash) return true;
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
function injectStyle$19(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$19();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$19(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$19, hash);
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
function registerDocument$19(targetDocument) {
	const runtime = getRuntime$19();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$19(targetDocument, hash, css);
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
function registerStyle$19(hash, css) {
	const runtime = getRuntime$19();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$19(targetDocument, hash, css);
}
registerStyle$19("d7bfd83e39", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.e4cb79093ba46b90__root{text-wrap:balance;align-items:center;color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);gap:var(--wpds-dimension-gap-xs,4px);max-width:var(--wpds-dimension-surface-width-sm,320px);text-align:center}.c3058e58d0ea70ac__visual{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;justify-content:center;line-height:1;margin-block-end:var(--wpds-dimension-gap-xs,4px)}.e5ea5c5dd47ba15c__icon{background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);border:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:50%;padding:var(--wpds-dimension-padding-xs,4px)}.b8cdfa86e8f8e69f__title{margin:0}._291e362c87d276bb__description{color:var(--wpds-color-foreground-content-neutral-weak,#707070);margin:0}.bcfe14f9eb3dd54e__actions{align-items:center;display:flex;flex-direction:column;gap:var(--wpds-dimension-gap-xs,4px);margin-block-start:var(--wpds-dimension-gap-md,12px);@media (min-width:480px){flex-direction:row;justify-content:center}}}@layer compositions{._291e362c87d276bb__description,.b8cdfa86e8f8e69f__title{text-wrap:balance}}}");
var style_module_default$19 = {
	"root": "e4cb79093ba46b90__root",
	"visual": "c3058e58d0ea70ac__visual",
	"icon": "e5ea5c5dd47ba15c__icon",
	"title": "b8cdfa86e8f8e69f__title",
	"description": "_291e362c87d276bb__description",
	"actions": "bcfe14f9eb3dd54e__actions"
};
/**
* The root container for an empty state component.
*/
const Root$1 = (0, import_element.forwardRef)(function EmptyStateRoot({ render, ...props }, ref) {
	const className = clsx(style_module_default$19.root);
	return useRender({
		defaultTagName: "div",
		render,
		ref,
		props: mergeProps({ className }, props)
	});
});

// packages/ui/build-module/empty-state/visual.mjs
const STYLE_HASH_ATTRIBUTE$18 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$18() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$18(document);
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
function documentContainsStyleHash$18(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$18}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$18) === hash) return true;
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
function injectStyle$18(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$18();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$18(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$18, hash);
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
function registerDocument$18(targetDocument) {
	const runtime = getRuntime$18();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$18(targetDocument, hash, css);
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
function registerStyle$18(hash, css) {
	const runtime = getRuntime$18();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$18(targetDocument, hash, css);
}
registerStyle$18("d7bfd83e39", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.e4cb79093ba46b90__root{text-wrap:balance;align-items:center;color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);gap:var(--wpds-dimension-gap-xs,4px);max-width:var(--wpds-dimension-surface-width-sm,320px);text-align:center}.c3058e58d0ea70ac__visual{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;justify-content:center;line-height:1;margin-block-end:var(--wpds-dimension-gap-xs,4px)}.e5ea5c5dd47ba15c__icon{background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);border:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:50%;padding:var(--wpds-dimension-padding-xs,4px)}.b8cdfa86e8f8e69f__title{margin:0}._291e362c87d276bb__description{color:var(--wpds-color-foreground-content-neutral-weak,#707070);margin:0}.bcfe14f9eb3dd54e__actions{align-items:center;display:flex;flex-direction:column;gap:var(--wpds-dimension-gap-xs,4px);margin-block-start:var(--wpds-dimension-gap-md,12px);@media (min-width:480px){flex-direction:row;justify-content:center}}}@layer compositions{._291e362c87d276bb__description,.b8cdfa86e8f8e69f__title{text-wrap:balance}}}");
var style_module_default$18 = {
	"root": "e4cb79093ba46b90__root",
	"visual": "c3058e58d0ea70ac__visual",
	"icon": "e5ea5c5dd47ba15c__icon",
	"title": "b8cdfa86e8f8e69f__title",
	"description": "_291e362c87d276bb__description",
	"actions": "bcfe14f9eb3dd54e__actions"
};
/**
* A container for visual content in an empty state (e.g., icons, illustrations).
* Provides appropriate spacing and alignment for visual elements.
*/
const Visual = (0, import_element.forwardRef)(function EmptyStateVisual({ render, ...props }, ref) {
	const className = clsx(style_module_default$18.visual);
	return useRender({
		defaultTagName: "div",
		render,
		ref,
		props: mergeProps({ className }, props)
	});
});

// packages/ui/build-module/empty-state/icon.mjs
const STYLE_HASH_ATTRIBUTE$17 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$17() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$17(document);
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
function documentContainsStyleHash$17(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$17}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$17) === hash) return true;
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
function injectStyle$17(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$17();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$17(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$17, hash);
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
function registerDocument$17(targetDocument) {
	const runtime = getRuntime$17();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$17(targetDocument, hash, css);
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
function registerStyle$17(hash, css) {
	const runtime = getRuntime$17();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$17(targetDocument, hash, css);
}
registerStyle$17("d7bfd83e39", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.e4cb79093ba46b90__root{text-wrap:balance;align-items:center;color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);gap:var(--wpds-dimension-gap-xs,4px);max-width:var(--wpds-dimension-surface-width-sm,320px);text-align:center}.c3058e58d0ea70ac__visual{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;justify-content:center;line-height:1;margin-block-end:var(--wpds-dimension-gap-xs,4px)}.e5ea5c5dd47ba15c__icon{background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);border:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:50%;padding:var(--wpds-dimension-padding-xs,4px)}.b8cdfa86e8f8e69f__title{margin:0}._291e362c87d276bb__description{color:var(--wpds-color-foreground-content-neutral-weak,#707070);margin:0}.bcfe14f9eb3dd54e__actions{align-items:center;display:flex;flex-direction:column;gap:var(--wpds-dimension-gap-xs,4px);margin-block-start:var(--wpds-dimension-gap-md,12px);@media (min-width:480px){flex-direction:row;justify-content:center}}}@layer compositions{._291e362c87d276bb__description,.b8cdfa86e8f8e69f__title{text-wrap:balance}}}");
var style_module_default$17 = {
	"root": "e4cb79093ba46b90__root",
	"visual": "c3058e58d0ea70ac__visual",
	"icon": "e5ea5c5dd47ba15c__icon",
	"title": "b8cdfa86e8f8e69f__title",
	"description": "_291e362c87d276bb__description",
	"actions": "bcfe14f9eb3dd54e__actions"
};
/**
* An icon visual for empty states. Renders an icon with styling treatment for
* empty states.
*/
const Icon$3 = (0, import_element.forwardRef)(function EmptyStateIcon({ icon, className, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Visual, {
		ref,
		className: clsx(style_module_default$17.icon, className),
		...restProps,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon$4, { icon })
	});
});

// packages/ui/build-module/empty-state/title.mjs
const STYLE_HASH_ATTRIBUTE$16 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$16() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$16(document);
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
function documentContainsStyleHash$16(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$16}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$16) === hash) return true;
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
function injectStyle$16(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$16();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$16(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$16, hash);
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
function registerDocument$16(targetDocument) {
	const runtime = getRuntime$16();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$16(targetDocument, hash, css);
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
function registerStyle$16(hash, css) {
	const runtime = getRuntime$16();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$16(targetDocument, hash, css);
}
registerStyle$16("d7bfd83e39", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.e4cb79093ba46b90__root{text-wrap:balance;align-items:center;color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);gap:var(--wpds-dimension-gap-xs,4px);max-width:var(--wpds-dimension-surface-width-sm,320px);text-align:center}.c3058e58d0ea70ac__visual{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;justify-content:center;line-height:1;margin-block-end:var(--wpds-dimension-gap-xs,4px)}.e5ea5c5dd47ba15c__icon{background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);border:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:50%;padding:var(--wpds-dimension-padding-xs,4px)}.b8cdfa86e8f8e69f__title{margin:0}._291e362c87d276bb__description{color:var(--wpds-color-foreground-content-neutral-weak,#707070);margin:0}.bcfe14f9eb3dd54e__actions{align-items:center;display:flex;flex-direction:column;gap:var(--wpds-dimension-gap-xs,4px);margin-block-start:var(--wpds-dimension-gap-md,12px);@media (min-width:480px){flex-direction:row;justify-content:center}}}@layer compositions{._291e362c87d276bb__description,.b8cdfa86e8f8e69f__title{text-wrap:balance}}}");
var style_module_default$16 = {
	"root": "e4cb79093ba46b90__root",
	"visual": "c3058e58d0ea70ac__visual",
	"icon": "e5ea5c5dd47ba15c__icon",
	"title": "b8cdfa86e8f8e69f__title",
	"description": "_291e362c87d276bb__description",
	"actions": "bcfe14f9eb3dd54e__actions"
};
const DEFAULT_TAG$1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {});
/**
* The title is a short heading that communicates the empty state.
*/
const Title = (0, import_element.forwardRef)(function EmptyStateTitle({ render = DEFAULT_TAG$1, className, children, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
		ref,
		variant: "heading-lg",
		render,
		className: clsx(style_module_default$16.title, className),
		...props,
		children
	});
});

// packages/ui/build-module/empty-state/description.mjs
const STYLE_HASH_ATTRIBUTE$15 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$15() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$15(document);
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
function documentContainsStyleHash$15(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$15}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$15) === hash) return true;
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
function injectStyle$15(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$15();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$15(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$15, hash);
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
function registerDocument$15(targetDocument) {
	const runtime = getRuntime$15();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$15(targetDocument, hash, css);
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
function registerStyle$15(hash, css) {
	const runtime = getRuntime$15();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$15(targetDocument, hash, css);
}
registerStyle$15("d7bfd83e39", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.e4cb79093ba46b90__root{text-wrap:balance;align-items:center;color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);gap:var(--wpds-dimension-gap-xs,4px);max-width:var(--wpds-dimension-surface-width-sm,320px);text-align:center}.c3058e58d0ea70ac__visual{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;justify-content:center;line-height:1;margin-block-end:var(--wpds-dimension-gap-xs,4px)}.e5ea5c5dd47ba15c__icon{background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);border:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:50%;padding:var(--wpds-dimension-padding-xs,4px)}.b8cdfa86e8f8e69f__title{margin:0}._291e362c87d276bb__description{color:var(--wpds-color-foreground-content-neutral-weak,#707070);margin:0}.bcfe14f9eb3dd54e__actions{align-items:center;display:flex;flex-direction:column;gap:var(--wpds-dimension-gap-xs,4px);margin-block-start:var(--wpds-dimension-gap-md,12px);@media (min-width:480px){flex-direction:row;justify-content:center}}}@layer compositions{._291e362c87d276bb__description,.b8cdfa86e8f8e69f__title{text-wrap:balance}}}");
var style_module_default$15 = {
	"root": "e4cb79093ba46b90__root",
	"visual": "c3058e58d0ea70ac__visual",
	"icon": "e5ea5c5dd47ba15c__icon",
	"title": "b8cdfa86e8f8e69f__title",
	"description": "_291e362c87d276bb__description",
	"actions": "bcfe14f9eb3dd54e__actions"
};
const DEFAULT_TAG = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {});
/**
* The description text for an empty state, providing additional context and
* guidance on what the user should do next.
*/
const Description = (0, import_element.forwardRef)(function EmptyStateDescription({ render = DEFAULT_TAG, className, children, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
		ref,
		variant: "body-md",
		render,
		className: clsx(style_module_default$15.description, className),
		...props,
		children
	});
});

// packages/ui/build-module/empty-state/actions.mjs
const STYLE_HASH_ATTRIBUTE$14 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$14() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$14(document);
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
function documentContainsStyleHash$14(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$14}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$14) === hash) return true;
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
function injectStyle$14(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$14();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$14(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$14, hash);
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
function registerDocument$14(targetDocument) {
	const runtime = getRuntime$14();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$14(targetDocument, hash, css);
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
function registerStyle$14(hash, css) {
	const runtime = getRuntime$14();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$14(targetDocument, hash, css);
}
registerStyle$14("d7bfd83e39", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.e4cb79093ba46b90__root{text-wrap:balance;align-items:center;color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);gap:var(--wpds-dimension-gap-xs,4px);max-width:var(--wpds-dimension-surface-width-sm,320px);text-align:center}.c3058e58d0ea70ac__visual{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;justify-content:center;line-height:1;margin-block-end:var(--wpds-dimension-gap-xs,4px)}.e5ea5c5dd47ba15c__icon{background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);border:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:50%;padding:var(--wpds-dimension-padding-xs,4px)}.b8cdfa86e8f8e69f__title{margin:0}._291e362c87d276bb__description{color:var(--wpds-color-foreground-content-neutral-weak,#707070);margin:0}.bcfe14f9eb3dd54e__actions{align-items:center;display:flex;flex-direction:column;gap:var(--wpds-dimension-gap-xs,4px);margin-block-start:var(--wpds-dimension-gap-md,12px);@media (min-width:480px){flex-direction:row;justify-content:center}}}@layer compositions{._291e362c87d276bb__description,.b8cdfa86e8f8e69f__title{text-wrap:balance}}}");
var style_module_default$14 = {
	"root": "e4cb79093ba46b90__root",
	"visual": "c3058e58d0ea70ac__visual",
	"icon": "e5ea5c5dd47ba15c__icon",
	"title": "b8cdfa86e8f8e69f__title",
	"description": "_291e362c87d276bb__description",
	"actions": "bcfe14f9eb3dd54e__actions"
};
/**
* A container for action buttons in an empty state. Actions are optional, and
* can include a primary and optional secondary action button.
*/
const Actions = (0, import_element.forwardRef)(function EmptyStateActions({ render, ...props }, ref) {
	const className = clsx(style_module_default$14.actions);
	return useRender({
		defaultTagName: "div",
		render,
		ref,
		props: mergeProps({ className }, props)
	});
});

// packages/admin-ui/build-module/navigable-region/index.mjs
const NavigableRegion = (0, import_element.forwardRef)(({ children, className, ariaLabel, as: Tag = "div", ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
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

// packages/admin-ui/build-module/navigation/index.mjs
const STYLE_HASH_ATTRIBUTE$13 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$13() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$13(document);
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
function documentContainsStyleHash$13(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$13}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$13) === hash) return true;
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
function injectStyle$13(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$13();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$13(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$13, hash);
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
function registerDocument$13(targetDocument) {
	const runtime = getRuntime$13();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$13(targetDocument, hash, css);
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
function registerStyle$13(hash, css) {
	const runtime = getRuntime$13();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$13(targetDocument, hash, css);
}
registerStyle$13("73643ec0a7", ".c1e78b6d2e68225c__list{--focus-ring-size:calc(var(--wpds-border-width-focus, var(--wp-admin-border-width-focus, 2px))*2);list-style:none;margin:calc(var(--focus-ring-size)*-1);overflow-x:auto;padding:var(--focus-ring-size);scroll-padding:var(--focus-ring-size)}._3e14e8043696860f__li{flex-shrink:0}.e1422d0e8f9e67df__item{align-items:center;color:var(--wpds-color-foreground-interactive-neutral-weak,#707070);display:flex;font-weight:var(--wpds-typography-font-weight-default,400);min-block-size:44px;min-inline-size:44px;text-decoration:none}.e1422d0e8f9e67df__item:hover,.e1422d0e8f9e67df__item[aria-current=page]{color:var(--wpds-color-foreground-interactive-neutral-weak-active,#1e1e1e)}.e1422d0e8f9e67df__item[aria-current=page]{font-weight:var(--wpds-typography-font-weight-emphasis,600)}");
var style_module_default$13 = {
	"list": "c1e78b6d2e68225c__list",
	"li": "_3e14e8043696860f__li",
	"item": "e1422d0e8f9e67df__item"
};
/**
* Renders a horizontal list of links for navigating between the sections of a
* screen. The item whose `href` matches `currentHref` is marked with
* `aria-current="page"`.
*
* Internal to the package: configured through the `Page` `navigation` prop.
*/
const Navigation$1 = ({ items, currentHref, ariaLabel = (0, import_i18n.__)("Sections"), linkComponent, className }) => {
	if (!items.length) return null;
	const LinkComponent = linkComponent ?? "a";
	{
		const invalidItem = items.find((item) => typeof item.href !== "string");
		if (invalidItem) throw new Error(`Navigation: item "${invalidItem.label}" is missing an \`href\` prop.`);
		const duplicate = items.find((item, index) => items.findIndex((other) => other.href === item.href) !== index);
		if (duplicate) throw new Error(`Navigation: duplicate \`href\` "${duplicate.href}". Each item must have a unique \`href\` so a single item receives \`aria-current="page"\`.`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": ariaLabel,
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
			render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { role: "list" }),
			direction: "row",
			align: "center",
			gap: "md",
			className: style_module_default$13.list,
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: style_module_default$13.li,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					variant: "body-md",
					className: style_module_default$13.item,
					render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						variant: "unstyled",
						"aria-current": item.href === currentHref ? "page" : void 0,
						render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkComponent, { href: item.href })
					}),
					children: item.label
				})
			}, item.href))
		})
	});
};

// \0wp-global:@wordpress/components
var require_components = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.components;
}));

// packages/admin-ui/build-module/page/sidebar-toggle-slot.mjs
var import_components = require_components();
const { Fill: SidebarToggleFill, Slot: SidebarToggleSlot } = (0, import_components.createSlotFill)("SidebarToggle");

// packages/admin-ui/build-module/page/header.mjs
const STYLE_HASH_ATTRIBUTE$12 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$12() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$12(document);
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
function documentContainsStyleHash$12(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$12}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$12) === hash) return true;
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
function injectStyle$12(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$12();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$12(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$12, hash);
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
function registerDocument$12(targetDocument) {
	const runtime = getRuntime$12();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$12(targetDocument, hash, css);
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
function registerStyle$12(hash, css) {
	const runtime = getRuntime$12();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$12(targetDocument, hash, css);
}
registerStyle$12("603e22a829", ".a601da1d3e3fb3fd__page{text-wrap:pretty;background-color:var(--wpds-color-background-surface-neutral,#fcfcfc);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-flow:column;height:100%;position:relative;z-index:1}._04c95d85dee161fd__header{background:var(--wpds-color-background-surface-neutral-strong,#fff);border-block-end:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);inset-block-start:0;padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px);position:sticky;z-index:1}.bacecf0582e29643__header-content{min-height:var(--wpds-dimension-size-md,32px)}.a377058511394079__header-actions{flex-shrink:0}.dea03f8da2e8f042__header-lockup{min-width:0}._2361437ecf7e72e7__header-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._75a71e5e0a35e8f7__header-visual{display:grid;flex-shrink:0;grid-template-columns:1fr;grid-template-rows:1fr;height:var(--wpds-dimension-size-sm,24px);width:var(--wpds-dimension-size-sm,24px);>*{grid-column:1/-1;grid-row:1/-1;max-height:100%;max-width:100%}}.b810958ef8ab363b__sidebar-toggle-slot:empty{display:none}.eff378c474a49b83__header-subtitle{color:var(--wpds-color-foreground-content-neutral-weak,#707070);padding-block-end:var(--wpds-dimension-padding-xs,4px)}._04c95d85dee161fd__header._7e7496f8b3e1c468__has-navigation,._04c95d85dee161fd__header._7e7496f8b3e1c468__has-navigation .eff378c474a49b83__header-subtitle{padding-block-end:0}._214d54afaddbb8d5__header-navigation{margin-block-start:var(--wpds-dimension-gap-md,12px)}._4bcfbc76045751b8__content{display:flex;flex-direction:column;flex-grow:1;overflow:auto;&.cefc11b6ca36136d__has-padding{padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px)}}");
var style_module_default$12 = {
	"page": "a601da1d3e3fb3fd__page",
	"header": "_04c95d85dee161fd__header",
	"header-content": "bacecf0582e29643__header-content",
	"header-actions": "a377058511394079__header-actions",
	"header-lockup": "dea03f8da2e8f042__header-lockup",
	"header-title": "_2361437ecf7e72e7__header-title",
	"header-visual": "_75a71e5e0a35e8f7__header-visual",
	"sidebar-toggle-slot": "b810958ef8ab363b__sidebar-toggle-slot",
	"header-subtitle": "eff378c474a49b83__header-subtitle",
	"has-navigation": "_7e7496f8b3e1c468__has-navigation",
	"header-navigation": "_214d54afaddbb8d5__header-navigation",
	"content": "_4bcfbc76045751b8__content",
	"has-padding": "cefc11b6ca36136d__has-padding"
};
function Header({ headingLevel = 1, breadcrumbs, badges, visual, title, subTitle, actions, navigation, components, showSidebarToggle = true }) {
	const HeadingTag = `h${headingLevel}`;
	const hasNavigation = !!navigation?.items?.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: "column",
		className: clsx(style_module_default$12.header, hasNavigation && style_module_default$12["has-navigation"]),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
				className: style_module_default$12["header-content"],
				direction: "row",
				gap: "sm",
				justify: "space-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
					direction: "row",
					gap: "sm",
					align: "center",
					justify: "start",
					className: style_module_default$12["header-lockup"],
					children: [
						showSidebarToggle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarToggleSlot, {
							bubblesVirtually: true,
							className: style_module_default$12["sidebar-toggle-slot"]
						}),
						visual && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: style_module_default$12["header-visual"],
							"aria-hidden": "true",
							children: visual
						}),
						title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
							className: style_module_default$12["header-title"],
							render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadingTag, {}),
							variant: "heading-lg",
							children: title
						}),
						breadcrumbs,
						badges
					]
				}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
					align: "center",
					className: style_module_default$12["header-actions"],
					direction: "row",
					gap: "sm",
					children: actions
				})]
			}),
			subTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {}),
				variant: "body-md",
				className: style_module_default$12["header-subtitle"],
				children: subTitle
			}),
			hasNavigation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation$1, {
				...navigation,
				linkComponent: components?.link,
				className: style_module_default$12["header-navigation"]
			})
		]
	});
}

// packages/admin-ui/build-module/page/index.mjs
const STYLE_HASH_ATTRIBUTE$11 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$11() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$11(document);
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
function documentContainsStyleHash$11(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$11}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$11) === hash) return true;
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
function injectStyle$11(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$11();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$11(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$11, hash);
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
function registerDocument$11(targetDocument) {
	const runtime = getRuntime$11();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$11(targetDocument, hash, css);
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
function registerStyle$11(hash, css) {
	const runtime = getRuntime$11();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$11(targetDocument, hash, css);
}
registerStyle$11("603e22a829", ".a601da1d3e3fb3fd__page{text-wrap:pretty;background-color:var(--wpds-color-background-surface-neutral,#fcfcfc);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-flow:column;height:100%;position:relative;z-index:1}._04c95d85dee161fd__header{background:var(--wpds-color-background-surface-neutral-strong,#fff);border-block-end:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);inset-block-start:0;padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px);position:sticky;z-index:1}.bacecf0582e29643__header-content{min-height:var(--wpds-dimension-size-md,32px)}.a377058511394079__header-actions{flex-shrink:0}.dea03f8da2e8f042__header-lockup{min-width:0}._2361437ecf7e72e7__header-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._75a71e5e0a35e8f7__header-visual{display:grid;flex-shrink:0;grid-template-columns:1fr;grid-template-rows:1fr;height:var(--wpds-dimension-size-sm,24px);width:var(--wpds-dimension-size-sm,24px);>*{grid-column:1/-1;grid-row:1/-1;max-height:100%;max-width:100%}}.b810958ef8ab363b__sidebar-toggle-slot:empty{display:none}.eff378c474a49b83__header-subtitle{color:var(--wpds-color-foreground-content-neutral-weak,#707070);padding-block-end:var(--wpds-dimension-padding-xs,4px)}._04c95d85dee161fd__header._7e7496f8b3e1c468__has-navigation,._04c95d85dee161fd__header._7e7496f8b3e1c468__has-navigation .eff378c474a49b83__header-subtitle{padding-block-end:0}._214d54afaddbb8d5__header-navigation{margin-block-start:var(--wpds-dimension-gap-md,12px)}._4bcfbc76045751b8__content{display:flex;flex-direction:column;flex-grow:1;overflow:auto;&.cefc11b6ca36136d__has-padding{padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px)}}");
var style_module_default$11 = {
	"page": "a601da1d3e3fb3fd__page",
	"header": "_04c95d85dee161fd__header",
	"header-content": "bacecf0582e29643__header-content",
	"header-actions": "a377058511394079__header-actions",
	"header-lockup": "dea03f8da2e8f042__header-lockup",
	"header-title": "_2361437ecf7e72e7__header-title",
	"header-visual": "_75a71e5e0a35e8f7__header-visual",
	"sidebar-toggle-slot": "b810958ef8ab363b__sidebar-toggle-slot",
	"header-subtitle": "eff378c474a49b83__header-subtitle",
	"has-navigation": "_7e7496f8b3e1c468__has-navigation",
	"header-navigation": "_214d54afaddbb8d5__header-navigation",
	"content": "_4bcfbc76045751b8__content",
	"has-padding": "cefc11b6ca36136d__has-padding"
};
function Page({ headingLevel, breadcrumbs, badges, visual, title, subTitle, children, className, actions, navigation, components, ariaLabel, hasPadding = false, showSidebarToggle = true }) {
	const classes = clsx(style_module_default$11.page, className);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavigableRegion, {
		className: classes,
		ariaLabel: ariaLabel ?? (typeof title === "string" ? title : ""),
		children: [(title || breadcrumbs || badges || actions || visual || !!navigation?.items?.length) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
			headingLevel,
			breadcrumbs,
			badges,
			visual,
			title,
			subTitle,
			actions,
			navigation,
			components,
			showSidebarToggle
		}), hasPadding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: clsx(style_module_default$11.content, style_module_default$11["has-padding"]),
			children
		}) : children]
	});
}
Page.SidebarToggleFill = SidebarToggleFill;

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

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/notices
var require_notices = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.notices;
}));

// \0wp-global:@wordpress/editor
var require_editor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.editor;
}));

// packages/boot/build-module/store/reducer.mjs
var import_core_data = require_core_data();
var import_notices = require_notices();
var import_editor = require_editor();
const initialState = {
	menuItems: {},
	routes: [],
	dashboardLink: void 0,
	entityLinks: {}
};
function reducer(state = initialState, action) {
	switch (action.type) {
		case "REGISTER_MENU_ITEM": return {
			...state,
			menuItems: {
				...state.menuItems,
				[action.id]: action.menuItem
			}
		};
		case "UPDATE_MENU_ITEM":
			if (!state.menuItems[action.id]) return state;
			return {
				...state,
				menuItems: {
					...state.menuItems,
					[action.id]: {
						...state.menuItems[action.id],
						...action.updates
					}
				}
			};
		case "REGISTER_ROUTE": return {
			...state,
			routes: [...state.routes, action.route]
		};
		case "REGISTER_ENTITY_LINKS": return {
			...state,
			entityLinks: {
				...state.entityLinks,
				[action.postType]: {
					...state.entityLinks[action.postType],
					...action.links
				}
			}
		};
		case "SET_DASHBOARD_LINK": return {
			...state,
			dashboardLink: action.dashboardLink
		};
	}
	return state;
}

// packages/boot/build-module/store/actions.mjs
var actions_exports = /* @__PURE__ */ __exportAll({
	registerEntityLinks: () => registerEntityLinks,
	registerMenuItem: () => registerMenuItem,
	registerRoute: () => registerRoute,
	setDashboardLink: () => setDashboardLink,
	updateMenuItem: () => updateMenuItem
});
function registerMenuItem(id, menuItem) {
	return {
		type: "REGISTER_MENU_ITEM",
		id,
		menuItem
	};
}
function updateMenuItem(id, updates) {
	return {
		type: "UPDATE_MENU_ITEM",
		id,
		updates
	};
}
function registerRoute(route) {
	return {
		type: "REGISTER_ROUTE",
		route
	};
}
/**
* Registers where entities of a post type are listed and edited.
*
* Register `default` to cover post types with no entry of their own.
*
* @param postType Post type the links belong to, or `default`.
* @param links    Paths to list and edit an entity of that post type.
*/
function registerEntityLinks(postType, links) {
	return {
		type: "REGISTER_ENTITY_LINKS",
		postType,
		links
	};
}
function setDashboardLink(dashboardLink) {
	return {
		type: "SET_DASHBOARD_LINK",
		dashboardLink
	};
}

// packages/boot/build-module/store/selectors.mjs
var selectors_exports = /* @__PURE__ */ __exportAll({
	getDashboardLink: () => getDashboardLink,
	getEntityLink: () => getEntityLink,
	getMenuItems: () => getMenuItems,
	getRoutes: () => getRoutes
});
function getMenuItems(state) {
	return Object.values(state.menuItems);
}
function getRoutes(state) {
	return state.routes;
}
function getDashboardLink(state) {
	return state.dashboardLink;
}
/**
* Returns the path an entity is edited or listed at.
*
* Falls back to the links registered for `default`, so a post type with no
* entry of its own still resolves.
*
* @param state    Store state.
* @param postType Post type to resolve for.
* @param postId   Entity to edit. Omit for the list of the post type.
* @return The path, or undefined when nothing is registered for it.
*/
function getEntityLink(state, postType, postId) {
	const links = state.entityLinks[postType] ?? state.entityLinks.default;
	const path = postId === void 0 ? links?.list : links?.edit;
	if (!path) return;
	return path.replace("{type}", encodeURIComponent(postType)).replace("{id}", encodeURIComponent(postId ?? ""));
}

// packages/boot/build-module/store/index.mjs
const STORE_NAME = "wordpress/boot";
const store = (0, import_data.createReduxStore)(STORE_NAME, {
	reducer,
	actions: actions_exports,
	selectors: selectors_exports
});
(0, import_data.register)(store);

// packages/boot/build-module/lock-unlock.mjs
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/boot");

// packages/boot/build-module/components/navigation/router-link-item.mjs
const { createLink } = unlock(privateApis);
function AnchorOnlyItem(props, forwardedRef) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalItem, {
		as: "a",
		ref: forwardedRef,
		...props
	});
}
const RouterLinkItem = createLink((0, import_element.forwardRef)(AnchorOnlyItem));

// packages/boot/build-module/components/navigation/items.mjs
/**
* Type guard for verifying whether a given element
* is a valid SVG element for the Icon component.
*
* @param element - The element to check
*/
function isSvg(element) {
	return (0, import_element.isValidElement)(element) && (element.type === import_primitives.SVG || element.type === "svg");
}
/**
* Converts the given IconType into a renderable component:
* - Dashicon string into a Dashicon component
* - JSX SVG element into an Icon component
* - Data URL into an img element
*
* @param icon                  - The icon to convert
* @param shouldShowPlaceholder - Whether to show placeholder when no icon is provided
* @return The converted icon as a JSX element
*/
function wrapIcon(icon, shouldShowPlaceholder = true) {
	if (isSvg(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Icon, { icon });
	if (typeof icon === "string" && icon.startsWith("dashicons-")) {
		const iconKey = icon.replace(/^dashicons-/, "");
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Dashicon, {
			style: { padding: "2px" },
			icon: iconKey,
			"aria-hidden": "true"
		});
	}
	if (typeof icon === "string" && icon.startsWith("data:")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: icon,
		alt: "",
		"aria-hidden": "true",
		style: {
			width: "20px",
			height: "20px",
			display: "block",
			padding: "2px"
		}
	});
	if (icon) return icon;
	if (shouldShowPlaceholder) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			width: "24px",
			height: "24px"
		},
		"aria-hidden": "true"
	});
	return null;
}

// packages/boot/build-module/components/navigation/navigation-item/index.mjs
const STYLE_HASH_ATTRIBUTE$10 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$10() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$10(document);
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
function documentContainsStyleHash$10(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$10}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$10) === hash) return true;
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
function injectStyle$10(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$10();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$10(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$10, hash);
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
function registerDocument$10(targetDocument) {
	const runtime = getRuntime$10();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$10(targetDocument, hash, css);
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
function registerStyle$10(hash, css) {
	const runtime = getRuntime$10();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$10(targetDocument, hash, css);
}
registerStyle$10("1f139f6281", "._42242b9e34dc6a19__item._42242b9e34dc6a19__item{align-items:center;border:none;border-radius:var(--wpds-border-radius-sm,2px);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:-apple-system,system-ui,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif;font-size:13px;font-weight:var(--wpds-typography-font-weight-default,400);line-height:20px;margin-block-end:4px;margin-inline:12px;min-height:32px;padding-block:0;padding-inline:4px;width:calc(100% - 24px)}._42242b9e34dc6a19__item._42242b9e34dc6a19__item:focus,._42242b9e34dc6a19__item._42242b9e34dc6a19__item:hover,._42242b9e34dc6a19__item._42242b9e34dc6a19__item[aria-current=true]{color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000))}._42242b9e34dc6a19__item._42242b9e34dc6a19__item svg:last-child{padding:4px}._42242b9e34dc6a19__item._42242b9e34dc6a19__item[aria-current=page],._42242b9e34dc6a19__item._42242b9e34dc6a19__item[data-status=active]{color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));font-weight:var(--wpds-typography-font-weight-emphasis,600)}._42242b9e34dc6a19__item._42242b9e34dc6a19__item:focus-visible{transform:translateZ(0)}._42242b9e34dc6a19__item._5feca241f78b1f09__is-compact{min-height:24px}");
var style_module_default$10 = {
	"item": "_42242b9e34dc6a19__item",
	"is-compact": "_5feca241f78b1f09__is-compact"
};
function NavigationItem({ className, icon, shouldShowPlaceholder = true, children, to }) {
	const isExternal = !String(new URL(to, window.location.origin)).startsWith(window.location.origin);
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
		justify: "flex-start",
		spacing: 2,
		style: { flexGrow: "1" },
		children: [wrapIcon(icon, shouldShowPlaceholder), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.FlexBlock, { children })]
	});
	if (isExternal) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalItem, {
		as: "a",
		href: to,
		className: clsx(style_module_default$10.item, className),
		children: content
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouterLinkItem, {
		to,
		className: clsx(style_module_default$10.item, className),
		children: content
	});
}

// packages/boot/build-module/components/navigation/drilldown-item/index.mjs
const STYLE_HASH_ATTRIBUTE$9 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$9() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$9(document);
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
function documentContainsStyleHash$9(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$9}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$9) === hash) return true;
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
function injectStyle$9(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$9();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$9(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$9, hash);
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
function registerDocument$9(targetDocument) {
	const runtime = getRuntime$9();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$9(targetDocument, hash, css);
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
function registerStyle$9(hash, css) {
	const runtime = getRuntime$9();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$9(targetDocument, hash, css);
}
registerStyle$9("1f139f6281", "._42242b9e34dc6a19__item._42242b9e34dc6a19__item{align-items:center;border:none;border-radius:var(--wpds-border-radius-sm,2px);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:-apple-system,system-ui,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif;font-size:13px;font-weight:var(--wpds-typography-font-weight-default,400);line-height:20px;margin-block-end:4px;margin-inline:12px;min-height:32px;padding-block:0;padding-inline:4px;width:calc(100% - 24px)}._42242b9e34dc6a19__item._42242b9e34dc6a19__item:focus,._42242b9e34dc6a19__item._42242b9e34dc6a19__item:hover,._42242b9e34dc6a19__item._42242b9e34dc6a19__item[aria-current=true]{color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000))}._42242b9e34dc6a19__item._42242b9e34dc6a19__item svg:last-child{padding:4px}._42242b9e34dc6a19__item._42242b9e34dc6a19__item[aria-current=page],._42242b9e34dc6a19__item._42242b9e34dc6a19__item[data-status=active]{color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));font-weight:var(--wpds-typography-font-weight-emphasis,600)}._42242b9e34dc6a19__item._42242b9e34dc6a19__item:focus-visible{transform:translateZ(0)}._42242b9e34dc6a19__item._5feca241f78b1f09__is-compact{min-height:24px}");
var style_module_default$9 = {
	"item": "_42242b9e34dc6a19__item",
	"is-compact": "_5feca241f78b1f09__is-compact"
};
function DrilldownItem({ className, id, icon, shouldShowPlaceholder = true, children, onNavigate }) {
	const handleClick = (e) => {
		e.preventDefault();
		onNavigate({
			id,
			direction: "forward"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalItem, {
		className: clsx(style_module_default$9.item, className),
		onClick: handleClick,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
			justify: "flex-start",
			spacing: 2,
			style: { flexGrow: "1" },
			children: [
				wrapIcon(icon, shouldShowPlaceholder),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.FlexBlock, { children }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Icon, { icon: (0, import_i18n.isRTL)() ? chevron_left_small_default : chevron_right_small_default })
			]
		})
	});
}

// packages/boot/build-module/components/navigation/dropdown-item/index.mjs
const STYLE_HASH_ATTRIBUTE$8 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$8() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$8(document);
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
function documentContainsStyleHash$8(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$8}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$8) === hash) return true;
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
function injectStyle$8(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$8();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$8(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$8, hash);
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
function registerDocument$8(targetDocument) {
	const runtime = getRuntime$8();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$8(targetDocument, hash, css);
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
function registerStyle$8(hash, css) {
	const runtime = getRuntime$8();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$8(targetDocument, hash, css);
}
registerStyle$8("1f139f6281", "._42242b9e34dc6a19__item._42242b9e34dc6a19__item{align-items:center;border:none;border-radius:var(--wpds-border-radius-sm,2px);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:-apple-system,system-ui,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif;font-size:13px;font-weight:var(--wpds-typography-font-weight-default,400);line-height:20px;margin-block-end:4px;margin-inline:12px;min-height:32px;padding-block:0;padding-inline:4px;width:calc(100% - 24px)}._42242b9e34dc6a19__item._42242b9e34dc6a19__item:focus,._42242b9e34dc6a19__item._42242b9e34dc6a19__item:hover,._42242b9e34dc6a19__item._42242b9e34dc6a19__item[aria-current=true]{color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000))}._42242b9e34dc6a19__item._42242b9e34dc6a19__item svg:last-child{padding:4px}._42242b9e34dc6a19__item._42242b9e34dc6a19__item[aria-current=page],._42242b9e34dc6a19__item._42242b9e34dc6a19__item[data-status=active]{color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));font-weight:var(--wpds-typography-font-weight-emphasis,600)}._42242b9e34dc6a19__item._42242b9e34dc6a19__item:focus-visible{transform:translateZ(0)}._42242b9e34dc6a19__item._5feca241f78b1f09__is-compact{min-height:24px}");
var style_module_default$1$1 = {
	"item": "_42242b9e34dc6a19__item",
	"is-compact": "_5feca241f78b1f09__is-compact"
};
registerStyle$8("afe932ce31", "._51fbf12353b41bfd__dropdown{display:block}.d62b19ea84deb921__dropdown-children{display:flex;flex-direction:column;margin-block-end:2px;margin-block-start:-2px;margin-inline-start:30px;overflow:hidden;padding:2px}._32fed855b8f13ebb__chevron._3ab794a15eff17b0__is-up{transform:rotate(180deg)}");
var style_module_default$8 = {
	"dropdown": "_51fbf12353b41bfd__dropdown",
	"dropdown-children": "d62b19ea84deb921__dropdown-children",
	"chevron": "_32fed855b8f13ebb__chevron",
	"is-up": "_3ab794a15eff17b0__is-up"
};
const ANIMATION_DURATION$1 = .2;
function DropdownItem({ className, id, icon, children, isExpanded, onToggle }) {
	const items = (0, import_data.useSelect)((select) => select(STORE_NAME).getMenuItems(), []).filter((item) => item.parent === id);
	const disableMotion = (0, import_compose.useReducedMotion)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: style_module_default$8.dropdown,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalItem, {
			className: clsx(style_module_default$1$1.item, className),
			onClick: (e) => {
				e.preventDefault();
				e.stopPropagation();
				onToggle();
			},
			onMouseDown: (e) => e.preventDefault(),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
				justify: "flex-start",
				spacing: 2,
				style: { flexGrow: "1" },
				children: [
					wrapIcon(icon, false),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.FlexBlock, { children }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Icon, {
						icon: chevron_down_small_default,
						className: clsx(style_module_default$8.chevron, { [style_module_default$8["is-up"]]: isExpanded })
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableAnimatePresence, {
			initial: false,
			children: isExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableMotion.div, {
				initial: { height: 0 },
				animate: { height: "auto" },
				exit: { height: 0 },
				transition: {
					type: "tween",
					duration: disableMotion ? 0 : ANIMATION_DURATION$1,
					ease: "easeOut"
				},
				className: style_module_default$8["dropdown-children"],
				children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationItem, {
					className: style_module_default$1$1["is-compact"],
					to: item.to,
					shouldShowPlaceholder: false,
					children: item.label
				}, index))
			})
		})]
	});
}

// packages/boot/build-module/components/navigation/navigation-screen/index.mjs
const STYLE_HASH_ATTRIBUTE$7 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$7() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$7(document);
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
function documentContainsStyleHash$7(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$7}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$7) === hash) return true;
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
function injectStyle$7(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$7();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$7(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$7, hash);
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
function registerDocument$7(targetDocument) {
	const runtime = getRuntime$7();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$7(targetDocument, hash, css);
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
function registerStyle$7(hash, css) {
	const runtime = getRuntime$7();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$7(targetDocument, hash, css);
}
registerStyle$7("587e8bd148", "._8ee768104cd6989d__screen{padding-block-end:4px}._8ee768104cd6989d__screen .components-text{color:var(--wpds-color-foreground-content-neutral,#1e1e1e)}._86eaeab8cbb71ab3__title-icon{padding-block-end:8px;padding-block-start:12px;padding-inline-end:16px;padding-inline-start:16px;position:sticky;top:0}.c70a3969756ff3ce__title{flex-grow:1;overflow-wrap:break-word}.c70a3969756ff3ce__title.c70a3969756ff3ce__title,.c70a3969756ff3ce__title.c70a3969756ff3ce__title .c70a3969756ff3ce__title{color:var(--wpds-color-foreground-content-neutral,#1e1e1e);line-height:32px}.f21c64ba84799e5c__actions{display:flex;flex-shrink:0}");
var style_module_default$7 = {
	"screen": "_8ee768104cd6989d__screen",
	"title-icon": "_86eaeab8cbb71ab3__title-icon",
	"title": "c70a3969756ff3ce__title",
	"actions": "f21c64ba84799e5c__actions"
};
const ANIMATION_DURATION = .3;
const slideVariants = {
	initial: (direction) => ({
		x: direction === "forward" ? 100 : -100,
		opacity: 0
	}),
	animate: {
		x: 0,
		opacity: 1
	},
	exit: (direction) => ({
		x: direction === "forward" ? 100 : -100,
		opacity: 0
	})
};
function NavigationScreen({ isRoot, title, actions, content, description, animationDirection, backMenuItem, backButtonRef, navigationKey, onNavigate }) {
	const icon = (0, import_i18n.isRTL)() ? chevron_right_default : chevron_left_default;
	const disableMotion = (0, import_compose.useReducedMotion)();
	const handleBackClick = (e) => {
		e.preventDefault();
		onNavigate({
			id: backMenuItem,
			direction: "backward"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: style_module_default$7.screen,
		style: {
			overflow: "hidden",
			position: "relative",
			display: "grid",
			gridTemplateColumns: "1fr",
			gridTemplateRows: "1fr"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableAnimatePresence, {
			initial: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__unstableMotion.div, {
				custom: animationDirection,
				variants: slideVariants,
				initial: "initial",
				animate: "animate",
				exit: "exit",
				transition: {
					type: "tween",
					duration: disableMotion ? 0 : ANIMATION_DURATION,
					ease: [
						.33,
						0,
						0,
						1
					]
				},
				style: {
					width: "100%",
					gridColumn: "1",
					gridRow: "1"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
						spacing: 2,
						className: style_module_default$7["title-icon"],
						children: [
							!isRoot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
								ref: backButtonRef,
								icon,
								onClick: handleBackClick,
								label: (0, import_i18n.__)("Back"),
								size: "small",
								variant: "tertiary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalHeading, {
								className: style_module_default$7.title,
								level: 1,
								size: "15px",
								children: title
							}),
							actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: style_module_default$7.actions,
								children: actions
							})
						]
					}),
					description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: description }),
					content
				]
			}, navigationKey)
		})
	});
}

// packages/boot/build-module/components/navigation/path-matching.mjs
/**
* Checks if a menu path is a valid parent path of the current path.
* A valid parent path must be a complete path prefix, not just share segments.
*
* @param currentPath - Current page path
* @param menuPath    - Menu item path to check as potential parent
* @return True if menuPath is a parent of currentPath
*/
const isValidParentPath = (currentPath, menuPath) => {
	if (!menuPath || menuPath === currentPath) return false;
	const normalizePath = (path) => {
		const normalized = path.startsWith("/") ? path : "/" + path;
		return normalized.endsWith("/") && normalized.length > 1 ? normalized.slice(0, -1) : normalized;
	};
	const normalizedCurrent = normalizePath(currentPath);
	const normalizedMenu = normalizePath(menuPath);
	return normalizedCurrent.startsWith(normalizedMenu) && (normalizedCurrent[normalizedMenu.length] === "/" || normalizedMenu === "/");
};
/**
* Finds the menu item that is the closest parent of the current path.
* Only considers menu items that have a 'to' path defined and are valid parents.
*
* @param currentPath - Current page path
* @param menuItems   - Array of all menu items
* @return Menu item that is the closest parent, or null if no valid parent found
*/
const findClosestMenuItem = (currentPath, menuItems) => {
	const exactMatch = menuItems.find((item) => item.to === currentPath);
	if (exactMatch) return exactMatch;
	let bestMatch = null;
	let bestPathLength = 0;
	for (const item of menuItems) {
		if (!item.to) continue;
		if (isValidParentPath(currentPath, item.to)) {
			if (item.to.length > bestPathLength) {
				bestMatch = item;
				bestPathLength = item.to.length;
			}
		}
	}
	return bestMatch;
};
/**
* Finds the drilldown parent of a menu item by traversing up the menu tree.
*
* @param id        - The ID of the menu item to find the drilldown parent for
* @param menuItems - Array of all menu items
* @return The ID of the drilldown parent, or undefined if none found
*/
const findDrilldownParent = (id, menuItems) => {
	if (!id) return;
	const currentItem = menuItems.find((item) => item.id === id);
	if (!currentItem) return;
	if (currentItem.parent) {
		const parentItem = menuItems.find((item) => item.id === currentItem.parent);
		if (parentItem?.parent_type === "drilldown") return parentItem.id;
		if (parentItem) return findDrilldownParent(parentItem.id, menuItems);
	}
};
/**
* Finds the dropdown parent of a menu item.
*
* @param id        - The ID of the menu item to find the dropdown parent for
* @param menuItems - Array of all menu items
* @return The ID of the dropdown parent, or undefined if none found
*/
const findDropdownParent = (id, menuItems) => {
	if (!id) return;
	const currentItem = menuItems.find((item) => item.id === id);
	if (!currentItem) return;
	if (currentItem.parent) {
		const parentItem = menuItems.find((item) => item.id === currentItem.parent);
		if (parentItem?.parent_type === "dropdown") return parentItem.id;
	}
};

// packages/boot/build-module/components/navigation/use-sidebar-parent.mjs
const { useRouter: useRouter$1, useMatches: useMatches$3 } = unlock(privateApis);
/**
* The `useSidebarParent` hook returns the ID of the parent menu item
* to render in the sidebar based on the current route.
*
* - It finds the closest matching menu item when exact path matches fail
* - It allows the user to navigate in the sidebar (local state) without changing the URL.
* - If the URL changes, it will update the parent ID to ensure the correct drilldown level is displayed.
*
* @return The ID of the parent menu item to render in the sidebar.
*/
function useSidebarParent() {
	const matches = useMatches$3();
	const router = useRouter$1();
	const menuItems = (0, import_data.useSelect)((select) => select(STORE_NAME).getMenuItems(), []);
	const currentPath = matches[matches.length - 1].pathname.slice(router.options.basepath?.length ?? 0);
	const currentMenuItem = findClosestMenuItem(currentPath, menuItems);
	const [parentId, setParentId] = (0, import_element.useState)(findDrilldownParent(currentMenuItem?.id, menuItems));
	const [parentDropdownId, setParentDropdownId] = (0, import_element.useState)(findDropdownParent(currentMenuItem?.id, menuItems));
	(0, import_element.useEffect)(() => {
		const matchedMenuItem = findClosestMenuItem(currentPath, menuItems);
		const updatedParentId = findDrilldownParent(matchedMenuItem?.id, menuItems);
		const updatedDropdownParent = findDropdownParent(matchedMenuItem?.id, menuItems);
		setParentId(updatedParentId);
		setParentDropdownId(updatedDropdownParent);
	}, [currentPath, menuItems]);
	return [
		parentId,
		setParentId,
		parentDropdownId,
		setParentDropdownId
	];
}

// packages/boot/build-module/components/navigation/index.mjs
function Navigation() {
	const backButtonRef = (0, import_element.useRef)(null);
	const [animationDirection, setAnimationDirection] = (0, import_element.useState)(null);
	const [parentId, setParentId, parentDropdownId, setParentDropdownId] = useSidebarParent();
	const menuItems = (0, import_data.useSelect)((select) => select(STORE_NAME).getMenuItems(), []);
	const parent = (0, import_element.useMemo)(() => menuItems.find((item) => item.id === parentId), [menuItems, parentId]);
	const navigationKey = parent ? `drilldown-${parent.id}` : "root";
	const handleNavigate = ({ id, direction }) => {
		setAnimationDirection(direction);
		setParentId(id);
	};
	const handleDropdownToggle = (dropdownId) => {
		setParentDropdownId(parentDropdownId === dropdownId ? void 0 : dropdownId);
	};
	const items = (0, import_element.useMemo)(() => menuItems.filter((item) => item.parent === parentId), [menuItems, parentId]);
	const hasRealIcons = items.some((item) => !!item.icon);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationScreen, {
		isRoot: !parent,
		title: parent ? parent.label : "",
		backMenuItem: parent?.parent,
		backButtonRef,
		animationDirection: animationDirection || void 0,
		navigationKey,
		onNavigate: handleNavigate,
		content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "list",
			children: items.map((item) => {
				if (item.parent_type === "dropdown") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownItem, {
					id: item.id,
					icon: item.icon,
					shouldShowPlaceholder: hasRealIcons,
					isExpanded: parentDropdownId === item.id,
					onToggle: () => handleDropdownToggle(item.id),
					children: item.label
				}, item.id);
				if (item.parent_type === "drilldown") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrilldownItem, {
					id: item.id,
					icon: item.icon,
					shouldShowPlaceholder: hasRealIcons,
					onNavigate: handleNavigate,
					children: item.label
				}, item.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationItem, {
					to: item.to,
					icon: item.icon,
					shouldShowPlaceholder: hasRealIcons,
					children: item.label
				}, item.id);
			})
		})
	});
}

// \0wp-global:@wordpress/keycodes
var require_keycodes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.keycodes;
}));

// \0wp-global:@wordpress/keyboard-shortcuts
var require_keyboard_shortcuts = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.keyboardShortcuts;
}));

// packages/boot/build-module/components/save-panel/use-save-shortcut.mjs
var import_keycodes = require_keycodes();
var import_keyboard_shortcuts = require_keyboard_shortcuts();
const shortcutName = "core/boot/save";
/**
* Register the save keyboard shortcut in view mode.
*
* @param param0               Object containing the function to open the save panel.
* @param param0.openSavePanel Function to open the save panel.
*/
function useSaveShortcut({ openSavePanel }) {
	const { __experimentalGetDirtyEntityRecords, isSavingEntityRecord } = (0, import_data.useSelect)(import_core_data.store);
	const { hasNonPostEntityChanges, isPostSavingLocked } = (0, import_data.useSelect)(import_editor.store);
	const { savePost } = (0, import_data.useDispatch)(import_editor.store);
	const { registerShortcut, unregisterShortcut } = (0, import_data.useDispatch)(import_keyboard_shortcuts.store);
	(0, import_element.useEffect)(() => {
		registerShortcut({
			name: shortcutName,
			category: "global",
			description: (0, import_i18n.__)("Save your changes."),
			keyCombination: {
				modifier: "primary",
				character: "s"
			}
		});
		return () => {
			unregisterShortcut(shortcutName);
		};
	}, [registerShortcut, unregisterShortcut]);
	(0, import_keyboard_shortcuts.useShortcut)(shortcutName, (event) => {
		event.preventDefault();
		const dirtyEntityRecords = __experimentalGetDirtyEntityRecords();
		const hasDirtyEntities = !!dirtyEntityRecords.length;
		const isSaving = dirtyEntityRecords.some((record) => isSavingEntityRecord(record.kind, record.name, record.key));
		if (!hasDirtyEntities || isSaving) return;
		if (hasNonPostEntityChanges()) openSavePanel();
		else if (!isPostSavingLocked()) savePost();
	});
}

// packages/boot/build-module/components/save-button/index.mjs
const STYLE_HASH_ATTRIBUTE$6 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$6() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$6(document);
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
function documentContainsStyleHash$6(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$6}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$6) === hash) return true;
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
function injectStyle$6(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$6();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$6(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$6, hash);
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
function registerDocument$6(targetDocument) {
	const runtime = getRuntime$6();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$6(targetDocument, hash, css);
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
function registerStyle$6(hash, css) {
	const runtime = getRuntime$6();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$6(targetDocument, hash, css);
}
registerStyle$6("da0f7c3ff6", "._4e8b2ecc322dfc1f__save-button{width:100%}._0e6f3a8336688e3f__shortcut:not(:first-child){margin-inline-start:8px}");
var style_module_default$6 = {
	"save-button": "_4e8b2ecc322dfc1f__save-button",
	"shortcut": "_0e6f3a8336688e3f__shortcut"
};
function SaveButton() {
	const [isSaveViewOpen, setIsSaveViewOpened] = (0, import_element.useState)(false);
	const { isSaving, dirtyEntityRecordsCount } = (0, import_data.useSelect)((select) => {
		const { isSavingEntityRecord, __experimentalGetDirtyEntityRecords } = select(import_core_data.store);
		const dirtyEntityRecords = __experimentalGetDirtyEntityRecords();
		return {
			isSaving: dirtyEntityRecords.some((record) => isSavingEntityRecord(record.kind, record.name, record.key)),
			dirtyEntityRecordsCount: dirtyEntityRecords.length
		};
	}, []);
	const [showSavedState, setShowSavedState] = (0, import_element.useState)(false);
	(0, import_element.useEffect)(() => {
		if (isSaving) setShowSavedState(true);
	}, [isSaving]);
	const hasChanges = dirtyEntityRecordsCount > 0;
	(0, import_element.useEffect)(() => {
		if (!isSaving && hasChanges) setShowSavedState(false);
	}, [isSaving, hasChanges]);
	function hideSavedState() {
		if (showSavedState) setShowSavedState(false);
	}
	const shouldShowButton = hasChanges || showSavedState;
	useSaveShortcut({ openSavePanel: () => setIsSaveViewOpened(true) });
	const shortcut = {
		displayShortcut: import_keycodes.displayShortcut.primary("s"),
		ariaKeyShortcut: import_keycodes.ariaKeyShortcut.primary("s"),
		label: import_keycodes.shortcutAriaLabel.primary("s")
	};
	const { descriptionId, targetProps } = useKeyboardShortcutProps({ shortcut });
	if (!shouldShowButton) return null;
	const isInSavedState = showSavedState && !hasChanges;
	const disabled = isSaving || isInSavedState;
	const getLabel = () => {
		if (isInSavedState) return (0, import_i18n.__)("Saved");
		return (0, import_i18n.sprintf)((0, import_i18n._n)("Review %d change…", "Review %d changes…", dirtyEntityRecordsCount), dirtyEntityRecordsCount);
	};
	const label = getLabel();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root$2, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger, {
		...targetProps,
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
			variant: "primary",
			size: "compact",
			onClick: () => setIsSaveViewOpened(true),
			onBlur: hideSavedState,
			disabled,
			accessibleWhenDisabled: true,
			isBusy: isSaving,
			className: style_module_default$6["save-button"],
			icon: isInSavedState ? check_default : void 0
		}),
		children: [label, descriptionId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutDescription, {
			descriptionId,
			shortcut
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popup, { children: [hasChanges && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutDisplay, {
		className: style_module_default$6.shortcut,
		shortcut
	})] })] }), isSaveViewOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Modal, {
		title: (0, import_i18n.__)("Review changes"),
		onRequestClose: () => setIsSaveViewOpened(false),
		size: "small",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_editor.EntitiesSavedStates, {
			close: () => setIsSaveViewOpened(false),
			variant: "inline"
		})
	})] });
}

// packages/boot/build-module/components/sidebar/index.mjs
const STYLE_HASH_ATTRIBUTE$5 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$5() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$5(document);
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
function documentContainsStyleHash$5(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$5}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$5) === hash) return true;
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
function injectStyle$5(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$5();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$5(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$5, hash);
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
function registerDocument$5(targetDocument) {
	const runtime = getRuntime$5();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$5(targetDocument, hash, css);
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
function registerStyle$5(hash, css) {
	const runtime = getRuntime$5();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$5(targetDocument, hash, css);
}
registerStyle$5("040f861d87", ".e805c0d27c9fe7b6__scrollable{display:flex;flex-direction:column;height:100%;overflow:auto;position:relative}._16abc09ab6556b14__content{contain:content;flex-grow:1;position:relative}._7d16636622fe90e5__footer{padding-block-end:8px;padding-block-start:16px;padding-inline-end:8px;padding-inline-start:16px}._6058c5869f31f9bd__back-button{margin-block-end:8px;margin-block-start:16px;margin-inline-end:12px;margin-inline-start:12px}");
var style_module_default$5 = {
	"scrollable": "e805c0d27c9fe7b6__scrollable",
	"content": "_16abc09ab6556b14__content",
	"footer": "_7d16636622fe90e5__footer",
	"back-button": "_6058c5869f31f9bd__back-button"
};
function DashboardBackButton() {
	const dashboardLink = (0, import_data.useSelect)((select) => select(store).getDashboardLink(), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
		__next40pxDefaultSize: true,
		className: style_module_default$5["back-button"],
		href: dashboardLink || "/",
		icon: (0, import_i18n.isRTL)() ? chevron_right_default : chevron_left_default,
		label: (0, import_i18n.__)("Go to the Dashboard"),
		children: (0, import_i18n.__)("Dashboard")
	});
}
function Sidebar() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: style_module_default$5.scrollable,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardBackButton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$5.content,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$5.footer,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveButton, {})
			})
		]
	});
}

// packages/boot/build-module/components/save-panel/index.mjs
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
registerStyle$4("e8f942db13", "@media (min-width:600px){._1bb5b45e7ea3b538__modal{width:600px}}");
var style_module_default$4 = { "modal": "_1bb5b45e7ea3b538__modal" };
function SavePanel() {
	const [isOpen, setIsOpen] = (0, import_element.useState)(false);
	useSaveShortcut({ openSavePanel: () => setIsOpen(true) });
	if (!isOpen) return false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Modal, {
		className: style_module_default$4.modal,
		onRequestClose: () => setIsOpen(false),
		title: (0, import_i18n.__)("Review changes"),
		size: "small",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_editor.EntitiesSavedStates, {
			close: () => setIsOpen(false),
			variant: "inline"
		})
	});
}

// packages/boot/build-module/components/canvas/back-button.mjs
/**
* Back button component that appears in full-screen canvas mode.
*
* @param {Object} props        Component props
* @param {number} props.length Number of BackButton fills (from Slot)
* @return Back button
*/
function BootBackButton({ length }) {
	const handleBack = () => {
		window.history.back();
	};
	if (length > 1) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
		size: "compact",
		onClick: handleBack,
		label: (0, import_i18n.__)("Back"),
		icon: (0, import_i18n.isRTL)() ? chevron_right_default : chevron_left_default
	});
}

// \0wp-global:@wordpress/dom
var require_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.dom;
}));

// \0wp-global:@wordpress/url
var require_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.url;
}));

// packages/boot/build-module/components/canvas/site-preview.mjs
var import_dom = require_dom();
var import_url = require_url();
/**
* Renders the site's front end in an iframe.
*
* Shown where the canvas has no entity to edit, so that a route still says
* something about the site it is configuring.
*
* @return The preview, or nothing until the site's address is known.
*/
function SitePreview() {
	const siteUrl = (0, import_data.useSelect)((select) => {
		return select(import_core_data.store).getEntityRecord("root", "__unstableBase")?.home;
	}, []);
	if (typeof siteUrl !== "string" || !siteUrl) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
		src: (0, import_url.addQueryArgs)(siteUrl, { wp_site_preview: 1 }),
		title: (0, import_i18n.__)("Site Preview"),
		style: {
			display: "block",
			width: "100%",
			height: "100%",
			backgroundColor: "#fff"
		},
		onLoad: (event) => {
			const iframeDocument = event.target.contentDocument;
			if (!iframeDocument) return;
			import_dom.focus.focusable.find(iframeDocument.documentElement).forEach((element) => {
				element.style.pointerEvents = "none";
				element.tabIndex = -1;
				element.setAttribute("aria-hidden", "true");
			});
		}
	});
}

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// packages/boot/build-module/components/canvas/viewport.mjs
var import_html_entities = require_html_entities();
const DEFAULT_DEVICE_TYPE = "Desktop";
const VALID_VIEWPORTS = [
	"desktop",
	"tablet",
	"mobile"
];
/**
* Whether a viewport is one an entity can be asked to be edited at.
*
* @param viewport Viewport, as written in the URL.
* @return Whether the editor has a width for it.
*/
function isValidViewport(viewport) {
	return !!viewport && VALID_VIEWPORTS.includes(viewport.toLowerCase());
}
/**
* The device type a `viewport` search param names.
*
* @param viewport Viewport, as written in the URL.
* @return Device type, Desktop for a viewport the editor has no width for.
*/
function getDeviceType(viewport) {
	if (!isValidViewport(viewport)) return DEFAULT_DEVICE_TYPE;
	const value = viewport.toLowerCase();
	return value.charAt(0).toUpperCase() + value.slice(1);
}

// packages/boot/build-module/components/canvas/use-navigate-to-entity-record.mjs
const { useCanGoBack, useRouter } = unlock(privateApis);
/**
* Builds the editor's entity navigation callbacks.
*
* The editor uses these to move between an entity and one nested inside it —
* a template part or a synced pattern reached from the block inspector. They
* are passed through the editor settings, where `onNavigateToEntityRecord`
* gates the inspector's edit affordance and `onNavigateToPreviousEntityRecord`
* gates the document bar's back button.
*
* @return The two callbacks, for spreading into the editor settings.
*/
function useNavigateToEntityRecord() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false });
	const registry = (0, import_data.useRegistry)();
	const getEntityLink = (0, import_data.useSelect)((select) => select(store).getEntityLink, []);
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const onNavigateToEntityRecord = (0, import_element.useCallback)((params) => {
		const currentPostType = registry.select(import_editor.store).getCurrentPostType();
		const currentPostId = registry.select(import_editor.store).getCurrentPostId();
		const selectedBlock = registry.select(import_core_data.store).getEntityRecordEdits("postType", currentPostType, currentPostId)?.selection?.selectionStart?.clientId;
		if (selectedBlock) navigate({
			search: (previous) => ({
				...previous,
				selectedBlock
			}),
			replace: true
		});
		const requestedViewport = params.viewport?.toLowerCase();
		const hasRequestedViewport = isValidViewport(requestedViewport);
		const to = getEntityLink(params.postType, params.postId);
		if (to) navigate({
			to,
			search: () => ({
				focusMode: true,
				...hasRequestedViewport ? { viewport: requestedViewport } : {}
			})
		});
	}, [
		navigate,
		registry,
		getEntityLink
	]);
	const isFocusMode = !!search.focusMode;
	return {
		onNavigateToEntityRecord,
		onNavigateToPreviousEntityRecord: (0, import_element.useMemo)(() => isFocusMode && canGoBack ? () => router.history.back() : void 0, [
			isFocusMode,
			canGoBack,
			router
		])
	};
}
/**
* Builds the callback the editor runs after a post action.
*
* Actions taken from inside the editor act on the entity being edited, so
* trashing or deleting one leaves the canvas showing something that is no
* longer there, and duplicating one gives no way to reach the copy.
*
* @param postType Post type rendered in the canvas.
* @return The callback, for passing to the editor.
*/
function useActionPerformed(postType) {
	const navigate = useNavigate();
	const { createSuccessNotice } = (0, import_data.useDispatch)(import_notices.store);
	const getEntityLink = (0, import_data.useSelect)((select) => select(store).getEntityLink, []);
	return (0, import_element.useCallback)((actionId, items) => {
		switch (actionId) {
			case "move-to-trash":
			case "permanently-delete":
			case "delete-post": {
				const to = postType && getEntityLink(postType);
				if (to) navigate({
					to,
					search: () => ({})
				});
				break;
			}
			case "duplicate-post": {
				const newItem = items[0];
				const to = getEntityLink(newItem.type, newItem.id);
				if (!to) break;
				const title = typeof newItem.title === "string" ? newItem.title : newItem.title?.rendered;
				createSuccessNotice((0, import_i18n.sprintf)((0, import_i18n.__)("\"%s\" successfully created."), (0, import_html_entities.decodeEntities)(title ?? "") || (0, import_i18n.__)("(no title)")), {
					type: "snackbar",
					id: "duplicate-post-action",
					actions: [{
						label: (0, import_i18n.__)("Edit"),
						onClick: () => navigate({ to })
					}]
				});
				break;
			}
		}
	}, [
		navigate,
		createSuccessNotice,
		getEntityLink,
		postType
	]);
}

// packages/boot/build-module/components/canvas/index.mjs
/**
* Canvas component that dynamically loads and renders the lazy editor.
*
* @param {Object} props        - Component props
* @param {Object} props.canvas - Canvas data containing postType and postId
* @return Canvas surface with editor
*/
function Canvas({ canvas }) {
	const [Editor, setEditor] = (0, import_element.useState)(null);
	const navigate = useNavigate();
	const { onNavigateToEntityRecord, onNavigateToPreviousEntityRecord } = useNavigateToEntityRecord();
	const onActionPerformed = useActionPerformed(canvas.postType);
	const viewport = useSearch({
		strict: false,
		select: (search) => search.viewport
	});
	const hasEntity = !!(canvas.postType && canvas.postId);
	const isBlockTheme = (0, import_data.useSelect)((select) => select(import_core_data.store).getCurrentTheme()?.is_block_theme, []);
	const { editLink, isTrashed } = (0, import_data.useSelect)((select) => {
		if (!canvas.postType || !canvas.postId) return {
			editLink: void 0,
			isTrashed: false
		};
		const record = select(import_core_data.store).getEntityRecord("postType", canvas.postType, canvas.postId);
		return {
			editLink: select(store).getEntityLink(canvas.postType, canvas.postId),
			isTrashed: record?.status === "trash"
		};
	}, [canvas.postType, canvas.postId]);
	const settings = (0, import_element.useMemo)(() => ({
		isPreviewMode: canvas.isPreview,
		styles: canvas.isPreview ? [{ css: "body{min-height:100vh;}" }] : [],
		onNavigateToEntityRecord,
		onNavigateToPreviousEntityRecord
	}), [
		canvas.isPreview,
		onNavigateToEntityRecord,
		onNavigateToPreviousEntityRecord
	]);
	(0, import_element.useEffect)(() => {
		import("@wordpress/lazy-editor").then((module) => {
			setEditor(() => module.Editor);
		}).catch((error) => {
			console.error("Failed to load lazy editor:", error);
		});
	}, []);
	if (!hasEntity && isBlockTheme === false) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SitePreview, {});
	if (!Editor || !hasEntity && isBlockTheme === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			height: "100%",
			padding: "2rem"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
	});
	const backButton = !canvas.isPreview ? ({ length }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootBackButton, { length }) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			height: "100%",
			position: "relative"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: { height: "100%" },
			inert: inertValue(canvas.isPreview),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editor, {
				postType: canvas.postType,
				postId: canvas.postId,
				renderingMode: canvas.renderingMode,
				settings,
				backButton,
				onActionPerformed,
				initialViewport: getDeviceType(viewport)
			})
		}), canvas.isPreview && editLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			onClick: isTrashed ? void 0 : () => navigate({ to: editLink }),
			onKeyDown: (e) => {
				if (isTrashed) return;
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					navigate({ to: editLink });
				}
			},
			style: {
				position: "absolute",
				inset: 0,
				cursor: isTrashed ? "default" : "pointer",
				zIndex: 1
			},
			role: "button",
			tabIndex: 0,
			"aria-disabled": isTrashed,
			"aria-label": (0, import_i18n.__)("Edit")
		})]
	});
}

// packages/boot/build-module/components/canvas-renderer/index.mjs
/**
* CanvasRenderer handles rendering of both default and custom canvas components.
* The logic here would have been way simpler if we just render the canvas within
* the RouteComponent like the other surfaces.
* The issue is that doing so forces the canvas to remount on every route change,
* which is not desirable for smooth transitions.
*
* - When canvas is undefined: No canvas is rendered
* - When canvas is null: Loads and renders custom canvas from contentModulePath
* - When canvas is CanvasData: Renders default Canvas component with editor
*
* This component is designed to be rendered at the Root level to prevent
* remounting when navigating between routes.
*
* @param props                    Component props
* @param props.canvas             Canvas data from route loader
* @param props.routeContentModule Path to content module for custom canvas
* @return Canvas renderer
*/
function CanvasRenderer({ canvas, routeContentModule }) {
	const [CustomCanvas, setCustomCanvas] = (0, import_element.useState)(null);
	(0, import_element.useEffect)(() => {
		if (canvas === null && routeContentModule) import(routeContentModule).then((module) => {
			setCustomCanvas(() => module.canvas);
		}).catch((error) => {
			console.error("Failed to load custom canvas:", error);
		});
		else setCustomCanvas(null);
	}, [canvas, routeContentModule]);
	if (canvas === void 0) return null;
	if (canvas === null) {
		if (!CustomCanvas) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomCanvas, {});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, { canvas });
}

// packages/boot/build-module/components/error-boundary/index.mjs
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
registerStyle$3("f23470a71f", "._69e0fe7ecf360e98__error-boundary{align-items:center;box-sizing:border-box;display:flex;justify-content:center;min-height:100%;padding:16px}");
var style_module_default$3 = { "error-boundary": "_69e0fe7ecf360e98__error-boundary" };
const COPY_FEEDBACK_TIMEOUT = 2e3;
const RESULT_ICON = {
	idle: copy_default,
	copied: check_default,
	error: error_default
};
function CopyErrorButton({ error }) {
	const [feedback, setFeedback] = (0, import_element.useState)({
		result: "idle",
		id: 0
	});
	(0, import_element.useEffect)(() => {
		if (feedback.result === "idle") return;
		const timeoutId = setTimeout(() => setFeedback({
			result: "idle",
			id: 0
		}), COPY_FEEDBACK_TIMEOUT);
		return () => clearTimeout(timeoutId);
	}, [feedback]);
	function report(result, message) {
		setFeedback((current) => ({
			result,
			id: current.id + 1
		}));
		speak(message);
	}
	const ref = (0, import_compose.useCopyToClipboard)(() => error.stack ?? String(error), () => report("copied", (0, import_i18n.__)("Copied to clipboard")), () => report("error", (0, import_i18n.__)("Couldn't copy to clipboard.")));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
		__next40pxDefaultSize: true,
		variant: "secondary",
		ref,
		icon: RESULT_ICON[feedback.result],
		children: (0, import_i18n._x)("Copy error", "button label")
	});
}
/**
* Contains a failure to one surface, so a screen keeps working around it.
*
* Wrapping each surface separately means a stage that throws leaves the
* navigation, the canvas and the way to save reachable, rather than taking the
* whole screen down with it.
*/
var ErrorBoundary = class extends import_element.Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}
	static getDerivedStateFromError(error) {
		return { error };
	}
	render() {
		const { error } = this.state;
		if (!error) return this.props.children;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: style_module_default$3["error-boundary"],
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root$1, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon$3, { icon: caution_default }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, { children: (0, import_i18n.__)("Something went wrong") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, { children: (0, import_i18n.__)("This part of the screen could not be displayed. Reloading the page may help.") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Actions, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyErrorButton, { error }) })
			] })
		});
	}
};

// \0wp-global:@wordpress/plugins
var require_plugins = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.plugins;
}));

// packages/boot/build-module/components/plugin-area/index.mjs
var import_plugins = require_plugins();
/**
* Mounts every plugin registered with `registerPlugin`, so the fills they
* render reach their slots.
*
* Sits at the root rather than with the editor: a plugin's fills mostly target
* editor slots, but the component holding them is also where it registers
* commands and extends a list, which the routes without a canvas need too.
*
* @return The mount point. Renders whatever the plugins do, and nothing itself.
*/
function PluginArea() {
	const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_plugins.PluginArea, { onError: (name) => {
		createErrorNotice((0, import_i18n.sprintf)((0, import_i18n.__)("The \"%s\" plugin has encountered an error and cannot be rendered."), name));
	} });
}

// packages/boot/build-module/components/app/use-route-title.mjs
const { useLocation: useLocation$1, useMatches: useMatches$2 } = unlock(privateApis);
/**
* Hook that manages document title updates based on route changes.
* Formats titles with WordPress conventions and announces them to screen readers.
*
* This hook should be called from the Root component to ensure it runs on every route.
*/
function useRouteTitle() {
	const location = useLocation$1();
	const matches = useMatches$2();
	const routeTitle = (matches[matches.length - 1]?.loaderData)?.title;
	const siteTitle = (0, import_data.useSelect)((select) => select(import_core_data.store).getEntityRecord("root", "__unstableBase")?.name, []);
	const isInitialLocationRef = (0, import_element.useRef)(true);
	(0, import_element.useEffect)(() => {
		isInitialLocationRef.current = false;
	}, [location]);
	(0, import_element.useEffect)(() => {
		if (isInitialLocationRef.current) return;
		if (routeTitle && typeof routeTitle === "string" && siteTitle && typeof siteTitle === "string") {
			const decodedRouteTitle = (0, import_html_entities.decodeEntities)(routeTitle);
			const decodedSiteTitle = (0, import_html_entities.decodeEntities)(siteTitle);
			const formattedTitle = (0, import_i18n.sprintf)((0, import_i18n.__)("%1$s ‹ %2$s — WordPress"), decodedRouteTitle, decodedSiteTitle);
			document.title = formattedTitle;
			if (decodedRouteTitle) speak(decodedRouteTitle, "assertive");
		}
	}, [
		routeTitle,
		siteTitle,
		location
	]);
}

// packages/boot/build-module/components/root/use-sync-body-background.mjs
/**
* Reads the boot layout's computed background-color and mirrors it onto
* `document.body` to avoid a jarring flash on macOS elastic-scroll bounce.
* Snapshots and restores the previous inline value on unmount.
*
* TODO: Once the two top-level `ThemeProvider` instances can be merged, this
* hook can be replaced with a CSS rule on `<body>`.
* See https://github.com/WordPress/gutenberg/pull/78587#discussion_r3481698286
*
* @return Ref to attach to the layout root element.
*/
function useSyncBodyBackground() {
	const layoutRef = (0, import_element.useRef)(null);
	(0, import_compose.useIsomorphicLayoutEffect)(() => {
		if (!layoutRef.current) return;
		const body = layoutRef.current.ownerDocument.body;
		const bg = getComputedStyle(layoutRef.current).backgroundColor;
		if (!bg) return;
		const previousBackground = body.style.background;
		body.style.background = bg;
		return () => {
			body.style.background = previousBackground;
		};
	}, []);
	return layoutRef;
}

// packages/boot/build-module/components/root/index.mjs
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
registerStyle$2("fed1a7ec24", "._5c711a1cecefd5e8__layout{background:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:row;height:100%;isolation:isolate;width:100%}@media (min-width:600px){._5c711a1cecefd5e8__layout{bottom:0;inset-inline-end:0;inset-inline-start:0;min-height:calc(100vh - 46px);position:absolute;top:0}}@media (min-width:782px){._5c711a1cecefd5e8__layout{min-height:calc(100vh - 32px)}body:has(._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas) ._5c711a1cecefd5e8__layout{min-height:100vh}}:where(._5c711a1cecefd5e8__layout) img{height:auto;max-width:100%}._5c711a1cecefd5e8__layout .eeebb116829e2f94__notices-snackbar{bottom:var(--wpds-dimension-size-md,32px);box-sizing:border-box;display:flex;flex-direction:column;left:0;padding-inline:16px;pointer-events:none;position:fixed;right:0}._5c711a1cecefd5e8__layout .eeebb116829e2f94__notices-snackbar .cb865dcda5233b3b__components-snackbar,._5c711a1cecefd5e8__layout .eeebb116829e2f94__notices-snackbar .components-snackbar{margin-inline:auto}._04b3b4e8346a2b7b__sidebar-backdrop{background-color:rgba(0,0,0,.5);bottom:0;cursor:var(--wpds-cursor-control,pointer);inset-inline-end:0;inset-inline-start:0;position:fixed;top:0;z-index:100002}._615b052cf60fcff2__sidebar{flex-shrink:0;height:100%;overflow:hidden;position:relative;width:240px}._615b052cf60fcff2__sidebar._6be5d95ddf25e57f__is-mobile{background:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);bottom:0;box-shadow:2px 0 8px rgba(0,0,0,.2);inset-inline-start:0;max-width:85vw;position:fixed;top:0;width:300px;z-index:100003}.fd8d6491146392ce__mobile-sidebar-drawer{inset-inline-end:0;inset-inline-start:0;position:fixed;top:0}.f37b94fd2c1f6020__layout-single-page .fd8d6491146392ce__mobile-sidebar-drawer{top:46px}.fd8d6491146392ce__mobile-sidebar-drawer{align-items:center;background:var(--wpds-color-background-surface-neutral,#fcfcfc);border-bottom:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);display:flex;justify-content:flex-start;padding:16px;z-index:3}._6da399dd0a232c1f__canvas._5568e036ddaba310__has-mobile-drawer{padding-top:65px;position:relative}.ff37ba01b23d0bcb__surfaces{display:flex;flex-grow:1;gap:8px;margin:0}@media (min-width:782px){.ff37ba01b23d0bcb__surfaces{margin:8px}.f37b94fd2c1f6020__layout-single-page .ff37ba01b23d0bcb__surfaces{margin-top:0;margin-inline-start:0}}.b37b199f2111c5f8__inspector,.e323e272b8b8ed4f__stage{background:var(--wpds-color-background-surface-neutral,#fcfcfc);border-radius:0;bottom:0;color:var(--wpds-color-foreground-content-neutral,#1e1e1e);flex:1;height:100vh;inset-inline-end:0;inset-inline-start:0;margin:0;overflow-y:auto;position:relative;position:fixed;top:0;width:100vw}.f37b94fd2c1f6020__layout-single-page .b37b199f2111c5f8__inspector,.f37b94fd2c1f6020__layout-single-page .e323e272b8b8ed4f__stage{height:calc(100vh - 46px);top:46px}@media (min-width:782px){.b37b199f2111c5f8__inspector,.e323e272b8b8ed4f__stage{border-radius:var(--wpds-border-radius-xl,12px);height:auto;margin:0;position:static;width:auto}.f37b94fd2c1f6020__layout-single-page .b37b199f2111c5f8__inspector,.f37b94fd2c1f6020__layout-single-page .e323e272b8b8ed4f__stage{height:auto}}.e323e272b8b8ed4f__stage{z-index:2}@media (min-width:782px){.e323e272b8b8ed4f__stage{z-index:auto}}.b37b199f2111c5f8__inspector{z-index:3}@media (min-width:782px){.b37b199f2111c5f8__inspector{z-index:auto}}._6da399dd0a232c1f__canvas{background:var(--wpds-color-background-surface-neutral,#fcfcfc);border:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:0;bottom:0;box-shadow:0 1px 3px rgba(0,0,0,.1);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);flex:1;height:100vh;inset-inline-end:0;inset-inline-start:0;margin:0;overflow-y:auto;position:relative;position:fixed;top:0;width:100vw;z-index:1}.f37b94fd2c1f6020__layout-single-page ._6da399dd0a232c1f__canvas{height:calc(100vh - 46px);top:46px}@media (min-width:782px){._6da399dd0a232c1f__canvas{border-radius:var(--wpds-border-radius-xl,12px);height:auto;position:static;width:auto;z-index:auto}.f37b94fd2c1f6020__layout-single-page ._6da399dd0a232c1f__canvas{height:auto}._5c711a1cecefd5e8__layout.bbaf96f69377ab55__has-canvas .e323e272b8b8ed4f__stage,.b37b199f2111c5f8__inspector{max-width:400px}}._6da399dd0a232c1f__canvas .interface-interface-skeleton{height:100%;inset-inline-start:0!important;position:relative;top:0!important}._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas .ff37ba01b23d0bcb__surfaces{gap:0;margin:0}._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas .b37b199f2111c5f8__inspector,._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas .e323e272b8b8ed4f__stage{display:none}._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas ._6da399dd0a232c1f__canvas{border:none;border-radius:0;bottom:0;box-shadow:none;inset-inline-end:0;inset-inline-start:0;margin:0;max-width:none;overflow:hidden;position:fixed;top:var(--wp-admin--admin-bar--height,0)}.f37b94fd2c1f6020__layout-single-page ._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas ._6da399dd0a232c1f__canvas{top:46px}@media (min-width:782px){.f37b94fd2c1f6020__layout-single-page ._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas ._6da399dd0a232c1f__canvas{top:32px}}@media (max-width:782px){._6da399dd0a232c1f__canvas:not(._5568e036ddaba310__has-mobile-drawer),.b37b199f2111c5f8__inspector,.e323e272b8b8ed4f__stage{height:calc(100vh - var(--wp-admin--admin-bar--height, 0px));top:var(--wp-admin--admin-bar--height,0)}.fd8d6491146392ce__mobile-sidebar-drawer{top:var(--wp-admin--admin-bar--height,0)}}@media not (prefers-reduced-motion:reduce){._6da399dd0a232c1f__canvas .interface-interface-skeleton__header{view-transition-name:boot--canvas-header}._6da399dd0a232c1f__canvas .interface-interface-skeleton__sidebar{view-transition-name:boot--canvas-sidebar}.e323e272b8b8ed4f__stage{view-transition-name:boot--stage}.b37b199f2111c5f8__inspector{view-transition-name:boot--inspector}._6da399dd0a232c1f__canvas{view-transition-name:boot--canvas}@supports (-webkit-hyphens:none) and (not (-moz-appearance:none)){.e323e272b8b8ed4f__stage{view-transition-name:boot-safari--stage}.b37b199f2111c5f8__inspector{view-transition-name:boot-safari--inspector}._6da399dd0a232c1f__canvas{view-transition-name:boot-safari--canvas}}}@media (max-width:782px){:root:has(._5c711a1cecefd5e8__layout) *{view-transition-name:none!important}}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(root),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(root){animation-duration:.25s}@media not (prefers-reduced-motion:reduce){:root:has(._5c711a1cecefd5e8__layout) .components-popover:first-of-type{view-transition-name:boot--components-popover}}:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot--canvas-header),:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot--canvas-sidebar),:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot-safari--canvas){z-index:1}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--stage),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--stage){width:auto}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--stage),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--stage){background:#fff;border-radius:var(--wpds-border-radius-xl,12px);height:100%;object-fit:none;object-position:left top;overflow:hidden;width:100%}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas){object-position:center top}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--stage):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--stage):only-child{animation-name:_2e385023a338e4a9__zoomOut;will-change:transform,opacity}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--stage):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--stage):only-child{animation-name:e245c2f64b6256de__zoomIn;will-change:transform,opacity}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--canvas):only-child{animation-name:_9aa5832f67721dd4__slideFromRight;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--canvas):only-child{animation-name:_4d20ae2879ce77c4__slideToRight;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas-header):only-child{animation-name:e56b4b1bb9ff1176__slideHeaderFromTop;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas-header):only-child{animation-name:e54b49876d2b7dc3__slideHeaderToTop;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas-sidebar):only-child{animation-name:f74156de1cf32837__slideSidebarFromRight;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas-sidebar):only-child{animation-name:_157f548b8629f8b5__slideSidebarToRight;will-change:transform}@keyframes _2e385023a338e4a9__zoomOut{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.9)}}@keyframes e245c2f64b6256de__zoomIn{0%{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}@keyframes _9aa5832f67721dd4__slideFromRight{0%{transform:translateX(100vw)}to{transform:translateX(0)}}@keyframes _4d20ae2879ce77c4__slideToRight{0%{transform:translateX(0)}to{transform:translateX(100vw)}}@keyframes e56b4b1bb9ff1176__slideHeaderFromTop{0%{transform:translateY(-100%)}}@keyframes e54b49876d2b7dc3__slideHeaderToTop{to{transform:translateY(-100%)}}@keyframes f74156de1cf32837__slideSidebarFromRight{0%{transform:translateX(100%)}}@keyframes _157f548b8629f8b5__slideSidebarToRight{to{transform:translateX(100%)}}");
var style_module_default$2 = {
	"layout": "_5c711a1cecefd5e8__layout",
	"has-full-canvas": "_52e00bad88ace7ce__has-full-canvas",
	"notices-snackbar": "eeebb116829e2f94__notices-snackbar",
	"components-snackbar": "cb865dcda5233b3b__components-snackbar",
	"sidebar-backdrop": "_04b3b4e8346a2b7b__sidebar-backdrop",
	"sidebar": "_615b052cf60fcff2__sidebar",
	"is-mobile": "_6be5d95ddf25e57f__is-mobile",
	"mobile-sidebar-drawer": "fd8d6491146392ce__mobile-sidebar-drawer",
	"layout-single-page": "f37b94fd2c1f6020__layout-single-page",
	"canvas": "_6da399dd0a232c1f__canvas",
	"has-mobile-drawer": "_5568e036ddaba310__has-mobile-drawer",
	"surfaces": "ff37ba01b23d0bcb__surfaces",
	"stage": "e323e272b8b8ed4f__stage",
	"inspector": "b37b199f2111c5f8__inspector",
	"has-canvas": "bbaf96f69377ab55__has-canvas",
	"zoomOut": "_2e385023a338e4a9__zoomOut",
	"zoomIn": "e245c2f64b6256de__zoomIn",
	"slideFromRight": "_9aa5832f67721dd4__slideFromRight",
	"slideToRight": "_4d20ae2879ce77c4__slideToRight",
	"slideHeaderFromTop": "e56b4b1bb9ff1176__slideHeaderFromTop",
	"slideHeaderToTop": "e54b49876d2b7dc3__slideHeaderToTop",
	"slideSidebarFromRight": "f74156de1cf32837__slideSidebarFromRight",
	"slideSidebarToRight": "_157f548b8629f8b5__slideSidebarToRight"
};
const { useLocation, useMatches: useMatches$1, Outlet: Outlet$1 } = unlock(privateApis);
function Root() {
	const matches = useMatches$1();
	const location = useLocation();
	const currentMatch = matches[matches.length - 1];
	const canvas = (currentMatch?.loaderData)?.canvas;
	const routeContentModule = (currentMatch?.loaderData)?.routeContentModule;
	const isFullScreen = canvas && !canvas.isPreview;
	useRouteTitle();
	const isMobileViewport = (0, import_compose.useViewportMatch)("medium", "<");
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = (0, import_element.useState)(false);
	const disableMotion = (0, import_compose.useReducedMotion)();
	(0, import_element.useEffect)(() => {
		setIsMobileSidebarOpen(false);
	}, [location.pathname, isMobileViewport]);
	const themeColors = (0, import_element.useMemo)(getAdminThemeColors, []);
	const layoutRef = useSyncBodyBackground();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.SlotFillProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Provider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PluginArea, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_theme.ThemeProvider, {
		isRoot: true,
		color: {
			...themeColors,
			background: "#f8f8f8"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_theme.ThemeProvider, {
			color: themeColors,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: layoutRef,
				className: clsx(style_module_default$2.layout, {
					[style_module_default$2["has-canvas"]]: !!canvas || canvas === null,
					[style_module_default$2["has-full-canvas"]]: isFullScreen
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_editor.UnsavedChangesWarning, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavePanel, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_notices.SnackbarNotices, { className: style_module_default$2["notices-snackbar"] }),
					isMobileViewport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page.SidebarToggleFill, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
						icon: menu_default,
						onClick: () => setIsMobileSidebarOpen(true),
						label: (0, import_i18n.__)("Open navigation panel"),
						size: "compact"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableAnimatePresence, { children: isMobileViewport && isMobileSidebarOpen && !isFullScreen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableMotion.div, {
						initial: { opacity: 0 },
						animate: { opacity: 1 },
						exit: { opacity: 0 },
						transition: {
							type: "tween",
							duration: disableMotion ? 0 : .2,
							ease: "easeOut"
						},
						className: style_module_default$2["sidebar-backdrop"],
						onClick: () => setIsMobileSidebarOpen(false),
						onKeyDown: (event) => {
							if (event.key === "Escape") setIsMobileSidebarOpen(false);
						},
						role: "button",
						tabIndex: -1,
						"aria-label": (0, import_i18n.__)("Close navigation panel")
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableAnimatePresence, { children: isMobileViewport && isMobileSidebarOpen && !isFullScreen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableMotion.div, {
						initial: { x: "-100%" },
						animate: { x: 0 },
						exit: { x: "-100%" },
						transition: {
							type: "tween",
							duration: disableMotion ? 0 : .2,
							ease: "easeOut"
						},
						className: clsx(style_module_default$2.sidebar, style_module_default$2["is-mobile"]),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {})
					}) }),
					!isMobileViewport && !isFullScreen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: style_module_default$2.sidebar,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: style_module_default$2.surfaces,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_theme.ThemeProvider, {
							color: {
								...themeColors,
								background: "#fcfcfc"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet$1, {}), (canvas || canvas === null) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: clsx(style_module_default$2.canvas, { [style_module_default$2["has-mobile-drawer"]]: canvas?.isPreview && isMobileViewport }),
								children: [canvas?.isPreview && isMobileViewport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: style_module_default$2["mobile-sidebar-drawer"],
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
										icon: menu_default,
										onClick: () => setIsMobileSidebarOpen(true),
										label: (0, import_i18n.__)("Open navigation panel"),
										size: "compact"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasRenderer, {
									canvas,
									routeContentModule
								}) })]
							})]
						})
					})
				]
			})
		})
	})] }) });
}

// packages/boot/build-module/components/app/router.mjs
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
registerStyle$1("fed1a7ec24", "._5c711a1cecefd5e8__layout{background:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:row;height:100%;isolation:isolate;width:100%}@media (min-width:600px){._5c711a1cecefd5e8__layout{bottom:0;inset-inline-end:0;inset-inline-start:0;min-height:calc(100vh - 46px);position:absolute;top:0}}@media (min-width:782px){._5c711a1cecefd5e8__layout{min-height:calc(100vh - 32px)}body:has(._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas) ._5c711a1cecefd5e8__layout{min-height:100vh}}:where(._5c711a1cecefd5e8__layout) img{height:auto;max-width:100%}._5c711a1cecefd5e8__layout .eeebb116829e2f94__notices-snackbar{bottom:var(--wpds-dimension-size-md,32px);box-sizing:border-box;display:flex;flex-direction:column;left:0;padding-inline:16px;pointer-events:none;position:fixed;right:0}._5c711a1cecefd5e8__layout .eeebb116829e2f94__notices-snackbar .cb865dcda5233b3b__components-snackbar,._5c711a1cecefd5e8__layout .eeebb116829e2f94__notices-snackbar .components-snackbar{margin-inline:auto}._04b3b4e8346a2b7b__sidebar-backdrop{background-color:rgba(0,0,0,.5);bottom:0;cursor:var(--wpds-cursor-control,pointer);inset-inline-end:0;inset-inline-start:0;position:fixed;top:0;z-index:100002}._615b052cf60fcff2__sidebar{flex-shrink:0;height:100%;overflow:hidden;position:relative;width:240px}._615b052cf60fcff2__sidebar._6be5d95ddf25e57f__is-mobile{background:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);bottom:0;box-shadow:2px 0 8px rgba(0,0,0,.2);inset-inline-start:0;max-width:85vw;position:fixed;top:0;width:300px;z-index:100003}.fd8d6491146392ce__mobile-sidebar-drawer{inset-inline-end:0;inset-inline-start:0;position:fixed;top:0}.f37b94fd2c1f6020__layout-single-page .fd8d6491146392ce__mobile-sidebar-drawer{top:46px}.fd8d6491146392ce__mobile-sidebar-drawer{align-items:center;background:var(--wpds-color-background-surface-neutral,#fcfcfc);border-bottom:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);display:flex;justify-content:flex-start;padding:16px;z-index:3}._6da399dd0a232c1f__canvas._5568e036ddaba310__has-mobile-drawer{padding-top:65px;position:relative}.ff37ba01b23d0bcb__surfaces{display:flex;flex-grow:1;gap:8px;margin:0}@media (min-width:782px){.ff37ba01b23d0bcb__surfaces{margin:8px}.f37b94fd2c1f6020__layout-single-page .ff37ba01b23d0bcb__surfaces{margin-top:0;margin-inline-start:0}}.b37b199f2111c5f8__inspector,.e323e272b8b8ed4f__stage{background:var(--wpds-color-background-surface-neutral,#fcfcfc);border-radius:0;bottom:0;color:var(--wpds-color-foreground-content-neutral,#1e1e1e);flex:1;height:100vh;inset-inline-end:0;inset-inline-start:0;margin:0;overflow-y:auto;position:relative;position:fixed;top:0;width:100vw}.f37b94fd2c1f6020__layout-single-page .b37b199f2111c5f8__inspector,.f37b94fd2c1f6020__layout-single-page .e323e272b8b8ed4f__stage{height:calc(100vh - 46px);top:46px}@media (min-width:782px){.b37b199f2111c5f8__inspector,.e323e272b8b8ed4f__stage{border-radius:var(--wpds-border-radius-xl,12px);height:auto;margin:0;position:static;width:auto}.f37b94fd2c1f6020__layout-single-page .b37b199f2111c5f8__inspector,.f37b94fd2c1f6020__layout-single-page .e323e272b8b8ed4f__stage{height:auto}}.e323e272b8b8ed4f__stage{z-index:2}@media (min-width:782px){.e323e272b8b8ed4f__stage{z-index:auto}}.b37b199f2111c5f8__inspector{z-index:3}@media (min-width:782px){.b37b199f2111c5f8__inspector{z-index:auto}}._6da399dd0a232c1f__canvas{background:var(--wpds-color-background-surface-neutral,#fcfcfc);border:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:0;bottom:0;box-shadow:0 1px 3px rgba(0,0,0,.1);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);flex:1;height:100vh;inset-inline-end:0;inset-inline-start:0;margin:0;overflow-y:auto;position:relative;position:fixed;top:0;width:100vw;z-index:1}.f37b94fd2c1f6020__layout-single-page ._6da399dd0a232c1f__canvas{height:calc(100vh - 46px);top:46px}@media (min-width:782px){._6da399dd0a232c1f__canvas{border-radius:var(--wpds-border-radius-xl,12px);height:auto;position:static;width:auto;z-index:auto}.f37b94fd2c1f6020__layout-single-page ._6da399dd0a232c1f__canvas{height:auto}._5c711a1cecefd5e8__layout.bbaf96f69377ab55__has-canvas .e323e272b8b8ed4f__stage,.b37b199f2111c5f8__inspector{max-width:400px}}._6da399dd0a232c1f__canvas .interface-interface-skeleton{height:100%;inset-inline-start:0!important;position:relative;top:0!important}._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas .ff37ba01b23d0bcb__surfaces{gap:0;margin:0}._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas .b37b199f2111c5f8__inspector,._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas .e323e272b8b8ed4f__stage{display:none}._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas ._6da399dd0a232c1f__canvas{border:none;border-radius:0;bottom:0;box-shadow:none;inset-inline-end:0;inset-inline-start:0;margin:0;max-width:none;overflow:hidden;position:fixed;top:var(--wp-admin--admin-bar--height,0)}.f37b94fd2c1f6020__layout-single-page ._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas ._6da399dd0a232c1f__canvas{top:46px}@media (min-width:782px){.f37b94fd2c1f6020__layout-single-page ._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas ._6da399dd0a232c1f__canvas{top:32px}}@media (max-width:782px){._6da399dd0a232c1f__canvas:not(._5568e036ddaba310__has-mobile-drawer),.b37b199f2111c5f8__inspector,.e323e272b8b8ed4f__stage{height:calc(100vh - var(--wp-admin--admin-bar--height, 0px));top:var(--wp-admin--admin-bar--height,0)}.fd8d6491146392ce__mobile-sidebar-drawer{top:var(--wp-admin--admin-bar--height,0)}}@media not (prefers-reduced-motion:reduce){._6da399dd0a232c1f__canvas .interface-interface-skeleton__header{view-transition-name:boot--canvas-header}._6da399dd0a232c1f__canvas .interface-interface-skeleton__sidebar{view-transition-name:boot--canvas-sidebar}.e323e272b8b8ed4f__stage{view-transition-name:boot--stage}.b37b199f2111c5f8__inspector{view-transition-name:boot--inspector}._6da399dd0a232c1f__canvas{view-transition-name:boot--canvas}@supports (-webkit-hyphens:none) and (not (-moz-appearance:none)){.e323e272b8b8ed4f__stage{view-transition-name:boot-safari--stage}.b37b199f2111c5f8__inspector{view-transition-name:boot-safari--inspector}._6da399dd0a232c1f__canvas{view-transition-name:boot-safari--canvas}}}@media (max-width:782px){:root:has(._5c711a1cecefd5e8__layout) *{view-transition-name:none!important}}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(root),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(root){animation-duration:.25s}@media not (prefers-reduced-motion:reduce){:root:has(._5c711a1cecefd5e8__layout) .components-popover:first-of-type{view-transition-name:boot--components-popover}}:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot--canvas-header),:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot--canvas-sidebar),:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot-safari--canvas){z-index:1}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--stage),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--stage){width:auto}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--stage),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--stage){background:#fff;border-radius:var(--wpds-border-radius-xl,12px);height:100%;object-fit:none;object-position:left top;overflow:hidden;width:100%}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas){object-position:center top}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--stage):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--stage):only-child{animation-name:_2e385023a338e4a9__zoomOut;will-change:transform,opacity}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--stage):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--stage):only-child{animation-name:e245c2f64b6256de__zoomIn;will-change:transform,opacity}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--canvas):only-child{animation-name:_9aa5832f67721dd4__slideFromRight;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--canvas):only-child{animation-name:_4d20ae2879ce77c4__slideToRight;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas-header):only-child{animation-name:e56b4b1bb9ff1176__slideHeaderFromTop;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas-header):only-child{animation-name:e54b49876d2b7dc3__slideHeaderToTop;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas-sidebar):only-child{animation-name:f74156de1cf32837__slideSidebarFromRight;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas-sidebar):only-child{animation-name:_157f548b8629f8b5__slideSidebarToRight;will-change:transform}@keyframes _2e385023a338e4a9__zoomOut{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.9)}}@keyframes e245c2f64b6256de__zoomIn{0%{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}@keyframes _9aa5832f67721dd4__slideFromRight{0%{transform:translateX(100vw)}to{transform:translateX(0)}}@keyframes _4d20ae2879ce77c4__slideToRight{0%{transform:translateX(0)}to{transform:translateX(100vw)}}@keyframes e56b4b1bb9ff1176__slideHeaderFromTop{0%{transform:translateY(-100%)}}@keyframes e54b49876d2b7dc3__slideHeaderToTop{to{transform:translateY(-100%)}}@keyframes f74156de1cf32837__slideSidebarFromRight{0%{transform:translateX(100%)}}@keyframes _157f548b8629f8b5__slideSidebarToRight{to{transform:translateX(100%)}}");
var style_module_default$1 = {
	"layout": "_5c711a1cecefd5e8__layout",
	"has-full-canvas": "_52e00bad88ace7ce__has-full-canvas",
	"notices-snackbar": "eeebb116829e2f94__notices-snackbar",
	"components-snackbar": "cb865dcda5233b3b__components-snackbar",
	"sidebar-backdrop": "_04b3b4e8346a2b7b__sidebar-backdrop",
	"sidebar": "_615b052cf60fcff2__sidebar",
	"is-mobile": "_6be5d95ddf25e57f__is-mobile",
	"mobile-sidebar-drawer": "fd8d6491146392ce__mobile-sidebar-drawer",
	"layout-single-page": "f37b94fd2c1f6020__layout-single-page",
	"canvas": "_6da399dd0a232c1f__canvas",
	"has-mobile-drawer": "_5568e036ddaba310__has-mobile-drawer",
	"surfaces": "ff37ba01b23d0bcb__surfaces",
	"stage": "e323e272b8b8ed4f__stage",
	"inspector": "b37b199f2111c5f8__inspector",
	"has-canvas": "bbaf96f69377ab55__has-canvas",
	"zoomOut": "_2e385023a338e4a9__zoomOut",
	"zoomIn": "e245c2f64b6256de__zoomIn",
	"slideFromRight": "_9aa5832f67721dd4__slideFromRight",
	"slideToRight": "_4d20ae2879ce77c4__slideToRight",
	"slideHeaderFromTop": "e56b4b1bb9ff1176__slideHeaderFromTop",
	"slideHeaderToTop": "e54b49876d2b7dc3__slideHeaderToTop",
	"slideSidebarFromRight": "f74156de1cf32837__slideSidebarFromRight",
	"slideSidebarToRight": "_157f548b8629f8b5__slideSidebarToRight"
};
const { createLazyRoute, createRouter, createRootRoute, createRoute, RouterProvider, createBrowserHistory, parseHref, useLoaderData } = unlock(privateApis);
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: style_module_default$1.stage,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {
			title: (0, import_i18n.__)("Route not found"),
			hasPadding: true,
			children: (0, import_i18n.__)("The page you're looking for does not exist")
		})
	});
}
/**
* Creates a TanStack route from a Route definition.
*
* @param route       Route configuration
* @param parentRoute Parent route.
* @return Tanstack Route.
*/
function createRouteFromDefinition(route, parentRoute) {
	let tanstackRoute = createRoute({
		getParentRoute: () => parentRoute,
		path: route.path,
		beforeLoad: async (opts) => {
			if (route.route_module) {
				const routeConfig = (await import(route.route_module)).route || {};
				if (routeConfig.beforeLoad) return routeConfig.beforeLoad({
					params: opts.params || {},
					search: opts.search || {}
				});
			}
		},
		loader: async (opts) => {
			let routeConfig = {};
			if (route.route_module) routeConfig = (await import(route.route_module)).route || {};
			const context = {
				params: opts.params || {},
				search: opts.deps || {}
			};
			const [, loaderData, canvasData, titleData] = await Promise.all([
				(0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("root", "__unstableBase"),
				routeConfig.loader ? routeConfig.loader(context) : Promise.resolve(void 0),
				routeConfig.canvas ? routeConfig.canvas(context) : Promise.resolve(void 0),
				routeConfig.title ? routeConfig.title(context) : Promise.resolve(void 0)
			]);
			let inspector = true;
			if (routeConfig.inspector) inspector = await routeConfig.inspector(context);
			let stage = true;
			if (routeConfig.stage) stage = await routeConfig.stage(context);
			return {
				...loaderData,
				canvas: canvasData,
				inspector,
				stage,
				title: titleData,
				routeContentModule: route.content_module
			};
		},
		loaderDeps: (opts) => opts.search
	});
	tanstackRoute = tanstackRoute.lazy(async () => {
		const module = route.content_module ? await import(route.content_module) : {};
		const Stage = module.stage;
		const Inspector = module.inspector;
		return createLazyRoute(route.path)({ component: function RouteComponent() {
			const { inspector: showInspector, stage: showStage } = useLoaderData({ from: route.path }) ?? {};
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [Stage && showStage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$1.stage,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {}) })
			}), Inspector && showInspector && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$1.inspector,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, {}) })
			})] });
		} });
	});
	return tanstackRoute;
}
/**
* Creates a route tree from route definitions.
*
* @param routes        Routes definition.
* @param rootComponent Root component to use for the router.
* @return Router tree.
*/
function createRouteTree(routes, rootComponent = Root) {
	const rootRoute = createRootRoute({
		component: rootComponent,
		context: () => ({})
	});
	const dynamicRoutes = routes.map((route) => createRouteFromDefinition(route, rootRoute));
	return rootRoute.addChildren(dynamicRoutes);
}
function createPathHistory() {
	return createBrowserHistory({
		parseLocation: () => {
			const url = new URL(window.location.href);
			const pathHref = `${url.searchParams.get("p") || "/"}${url.hash}`;
			return parseHref(pathHref, window.history.state);
		},
		createHref: (href) => {
			const searchParams = new URLSearchParams(window.location.search);
			searchParams.set("p", href);
			return `${window.location.pathname}?${searchParams}`;
		}
	});
}
function Router({ routes, rootComponent = Root }) {
	const router = (0, import_element.useMemo)(() => {
		const history = createPathHistory();
		const routeTree = createRouteTree(routes, rootComponent);
		return createRouter({
			history,
			routeTree,
			defaultPreload: "intent",
			defaultNotFoundComponent: NotFoundComponent,
			defaultViewTransition: { types: ({ fromLocation }) => {
				if (!fromLocation) return false;
				return ["navigate"];
			} }
		});
	}, [routes, rootComponent]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouterProvider, { router });
}

// packages/boot/build-module/components/root/single-page.mjs
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
registerStyle("fed1a7ec24", "._5c711a1cecefd5e8__layout{background:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:row;height:100%;isolation:isolate;width:100%}@media (min-width:600px){._5c711a1cecefd5e8__layout{bottom:0;inset-inline-end:0;inset-inline-start:0;min-height:calc(100vh - 46px);position:absolute;top:0}}@media (min-width:782px){._5c711a1cecefd5e8__layout{min-height:calc(100vh - 32px)}body:has(._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas) ._5c711a1cecefd5e8__layout{min-height:100vh}}:where(._5c711a1cecefd5e8__layout) img{height:auto;max-width:100%}._5c711a1cecefd5e8__layout .eeebb116829e2f94__notices-snackbar{bottom:var(--wpds-dimension-size-md,32px);box-sizing:border-box;display:flex;flex-direction:column;left:0;padding-inline:16px;pointer-events:none;position:fixed;right:0}._5c711a1cecefd5e8__layout .eeebb116829e2f94__notices-snackbar .cb865dcda5233b3b__components-snackbar,._5c711a1cecefd5e8__layout .eeebb116829e2f94__notices-snackbar .components-snackbar{margin-inline:auto}._04b3b4e8346a2b7b__sidebar-backdrop{background-color:rgba(0,0,0,.5);bottom:0;cursor:var(--wpds-cursor-control,pointer);inset-inline-end:0;inset-inline-start:0;position:fixed;top:0;z-index:100002}._615b052cf60fcff2__sidebar{flex-shrink:0;height:100%;overflow:hidden;position:relative;width:240px}._615b052cf60fcff2__sidebar._6be5d95ddf25e57f__is-mobile{background:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);bottom:0;box-shadow:2px 0 8px rgba(0,0,0,.2);inset-inline-start:0;max-width:85vw;position:fixed;top:0;width:300px;z-index:100003}.fd8d6491146392ce__mobile-sidebar-drawer{inset-inline-end:0;inset-inline-start:0;position:fixed;top:0}.f37b94fd2c1f6020__layout-single-page .fd8d6491146392ce__mobile-sidebar-drawer{top:46px}.fd8d6491146392ce__mobile-sidebar-drawer{align-items:center;background:var(--wpds-color-background-surface-neutral,#fcfcfc);border-bottom:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);display:flex;justify-content:flex-start;padding:16px;z-index:3}._6da399dd0a232c1f__canvas._5568e036ddaba310__has-mobile-drawer{padding-top:65px;position:relative}.ff37ba01b23d0bcb__surfaces{display:flex;flex-grow:1;gap:8px;margin:0}@media (min-width:782px){.ff37ba01b23d0bcb__surfaces{margin:8px}.f37b94fd2c1f6020__layout-single-page .ff37ba01b23d0bcb__surfaces{margin-top:0;margin-inline-start:0}}.b37b199f2111c5f8__inspector,.e323e272b8b8ed4f__stage{background:var(--wpds-color-background-surface-neutral,#fcfcfc);border-radius:0;bottom:0;color:var(--wpds-color-foreground-content-neutral,#1e1e1e);flex:1;height:100vh;inset-inline-end:0;inset-inline-start:0;margin:0;overflow-y:auto;position:relative;position:fixed;top:0;width:100vw}.f37b94fd2c1f6020__layout-single-page .b37b199f2111c5f8__inspector,.f37b94fd2c1f6020__layout-single-page .e323e272b8b8ed4f__stage{height:calc(100vh - 46px);top:46px}@media (min-width:782px){.b37b199f2111c5f8__inspector,.e323e272b8b8ed4f__stage{border-radius:var(--wpds-border-radius-xl,12px);height:auto;margin:0;position:static;width:auto}.f37b94fd2c1f6020__layout-single-page .b37b199f2111c5f8__inspector,.f37b94fd2c1f6020__layout-single-page .e323e272b8b8ed4f__stage{height:auto}}.e323e272b8b8ed4f__stage{z-index:2}@media (min-width:782px){.e323e272b8b8ed4f__stage{z-index:auto}}.b37b199f2111c5f8__inspector{z-index:3}@media (min-width:782px){.b37b199f2111c5f8__inspector{z-index:auto}}._6da399dd0a232c1f__canvas{background:var(--wpds-color-background-surface-neutral,#fcfcfc);border:1px solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:0;bottom:0;box-shadow:0 1px 3px rgba(0,0,0,.1);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);flex:1;height:100vh;inset-inline-end:0;inset-inline-start:0;margin:0;overflow-y:auto;position:relative;position:fixed;top:0;width:100vw;z-index:1}.f37b94fd2c1f6020__layout-single-page ._6da399dd0a232c1f__canvas{height:calc(100vh - 46px);top:46px}@media (min-width:782px){._6da399dd0a232c1f__canvas{border-radius:var(--wpds-border-radius-xl,12px);height:auto;position:static;width:auto;z-index:auto}.f37b94fd2c1f6020__layout-single-page ._6da399dd0a232c1f__canvas{height:auto}._5c711a1cecefd5e8__layout.bbaf96f69377ab55__has-canvas .e323e272b8b8ed4f__stage,.b37b199f2111c5f8__inspector{max-width:400px}}._6da399dd0a232c1f__canvas .interface-interface-skeleton{height:100%;inset-inline-start:0!important;position:relative;top:0!important}._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas .ff37ba01b23d0bcb__surfaces{gap:0;margin:0}._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas .b37b199f2111c5f8__inspector,._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas .e323e272b8b8ed4f__stage{display:none}._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas ._6da399dd0a232c1f__canvas{border:none;border-radius:0;bottom:0;box-shadow:none;inset-inline-end:0;inset-inline-start:0;margin:0;max-width:none;overflow:hidden;position:fixed;top:var(--wp-admin--admin-bar--height,0)}.f37b94fd2c1f6020__layout-single-page ._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas ._6da399dd0a232c1f__canvas{top:46px}@media (min-width:782px){.f37b94fd2c1f6020__layout-single-page ._5c711a1cecefd5e8__layout._52e00bad88ace7ce__has-full-canvas ._6da399dd0a232c1f__canvas{top:32px}}@media (max-width:782px){._6da399dd0a232c1f__canvas:not(._5568e036ddaba310__has-mobile-drawer),.b37b199f2111c5f8__inspector,.e323e272b8b8ed4f__stage{height:calc(100vh - var(--wp-admin--admin-bar--height, 0px));top:var(--wp-admin--admin-bar--height,0)}.fd8d6491146392ce__mobile-sidebar-drawer{top:var(--wp-admin--admin-bar--height,0)}}@media not (prefers-reduced-motion:reduce){._6da399dd0a232c1f__canvas .interface-interface-skeleton__header{view-transition-name:boot--canvas-header}._6da399dd0a232c1f__canvas .interface-interface-skeleton__sidebar{view-transition-name:boot--canvas-sidebar}.e323e272b8b8ed4f__stage{view-transition-name:boot--stage}.b37b199f2111c5f8__inspector{view-transition-name:boot--inspector}._6da399dd0a232c1f__canvas{view-transition-name:boot--canvas}@supports (-webkit-hyphens:none) and (not (-moz-appearance:none)){.e323e272b8b8ed4f__stage{view-transition-name:boot-safari--stage}.b37b199f2111c5f8__inspector{view-transition-name:boot-safari--inspector}._6da399dd0a232c1f__canvas{view-transition-name:boot-safari--canvas}}}@media (max-width:782px){:root:has(._5c711a1cecefd5e8__layout) *{view-transition-name:none!important}}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(root),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(root){animation-duration:.25s}@media not (prefers-reduced-motion:reduce){:root:has(._5c711a1cecefd5e8__layout) .components-popover:first-of-type{view-transition-name:boot--components-popover}}:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot--canvas-header),:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot--canvas-sidebar),:root:has(._5c711a1cecefd5e8__layout)::view-transition-group(boot-safari--canvas){z-index:1}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--stage),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--stage){width:auto}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--stage),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--inspector),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--stage){background:#fff;border-radius:var(--wpds-border-radius-xl,12px);height:100%;object-fit:none;object-position:left top;overflow:hidden;width:100%}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas),:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas){object-position:center top}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--stage):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--stage):only-child{animation-name:_2e385023a338e4a9__zoomOut;will-change:transform,opacity}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--stage):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--inspector):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--stage):only-child{animation-name:e245c2f64b6256de__zoomIn;will-change:transform,opacity}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot-safari--canvas):only-child{animation-name:_9aa5832f67721dd4__slideFromRight;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas):only-child,:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot-safari--canvas):only-child{animation-name:_4d20ae2879ce77c4__slideToRight;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas-header):only-child{animation-name:e56b4b1bb9ff1176__slideHeaderFromTop;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas-header):only-child{animation-name:e54b49876d2b7dc3__slideHeaderToTop;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-new(boot--canvas-sidebar):only-child{animation-name:f74156de1cf32837__slideSidebarFromRight;will-change:transform}:root:has(._5c711a1cecefd5e8__layout)::view-transition-old(boot--canvas-sidebar):only-child{animation-name:_157f548b8629f8b5__slideSidebarToRight;will-change:transform}@keyframes _2e385023a338e4a9__zoomOut{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.9)}}@keyframes e245c2f64b6256de__zoomIn{0%{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}@keyframes _9aa5832f67721dd4__slideFromRight{0%{transform:translateX(100vw)}to{transform:translateX(0)}}@keyframes _4d20ae2879ce77c4__slideToRight{0%{transform:translateX(0)}to{transform:translateX(100vw)}}@keyframes e56b4b1bb9ff1176__slideHeaderFromTop{0%{transform:translateY(-100%)}}@keyframes e54b49876d2b7dc3__slideHeaderToTop{to{transform:translateY(-100%)}}@keyframes f74156de1cf32837__slideSidebarFromRight{0%{transform:translateX(100%)}}@keyframes _157f548b8629f8b5__slideSidebarToRight{to{transform:translateX(100%)}}");
var style_module_default = {
	"layout": "_5c711a1cecefd5e8__layout",
	"has-full-canvas": "_52e00bad88ace7ce__has-full-canvas",
	"notices-snackbar": "eeebb116829e2f94__notices-snackbar",
	"components-snackbar": "cb865dcda5233b3b__components-snackbar",
	"sidebar-backdrop": "_04b3b4e8346a2b7b__sidebar-backdrop",
	"sidebar": "_615b052cf60fcff2__sidebar",
	"is-mobile": "_6be5d95ddf25e57f__is-mobile",
	"mobile-sidebar-drawer": "fd8d6491146392ce__mobile-sidebar-drawer",
	"layout-single-page": "f37b94fd2c1f6020__layout-single-page",
	"canvas": "_6da399dd0a232c1f__canvas",
	"has-mobile-drawer": "_5568e036ddaba310__has-mobile-drawer",
	"surfaces": "ff37ba01b23d0bcb__surfaces",
	"stage": "e323e272b8b8ed4f__stage",
	"inspector": "b37b199f2111c5f8__inspector",
	"has-canvas": "bbaf96f69377ab55__has-canvas",
	"zoomOut": "_2e385023a338e4a9__zoomOut",
	"zoomIn": "e245c2f64b6256de__zoomIn",
	"slideFromRight": "_9aa5832f67721dd4__slideFromRight",
	"slideToRight": "_4d20ae2879ce77c4__slideToRight",
	"slideHeaderFromTop": "e56b4b1bb9ff1176__slideHeaderFromTop",
	"slideHeaderToTop": "e54b49876d2b7dc3__slideHeaderToTop",
	"slideSidebarFromRight": "f74156de1cf32837__slideSidebarFromRight",
	"slideSidebarToRight": "_157f548b8629f8b5__slideSidebarToRight"
};
const { useMatches, Outlet } = unlock(privateApis);
/**
* Root component for single page mode (no sidebar).
* Used when rendering pages within wp-admin without taking over the full page.
*/
function RootSinglePage() {
	const matches = useMatches();
	const currentMatch = matches[matches.length - 1];
	const canvas = (currentMatch?.loaderData)?.canvas;
	const routeContentModule = (currentMatch?.loaderData)?.routeContentModule;
	const isFullScreen = canvas && !canvas.isPreview;
	useRouteTitle();
	const themeColors = (0, import_element.useMemo)(getAdminThemeColors, []);
	const layoutRef = useSyncBodyBackground();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.SlotFillProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PluginArea, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_theme.ThemeProvider, {
		isRoot: true,
		color: {
			...themeColors,
			background: "#f8f8f8"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_theme.ThemeProvider, {
			color: themeColors,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: layoutRef,
				className: clsx(style_module_default.layout, style_module_default["layout-single-page"], {
					[style_module_default["has-canvas"]]: !!canvas || canvas === null,
					[style_module_default["has-full-canvas"]]: isFullScreen
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_editor.UnsavedChangesWarning, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavePanel, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_notices.SnackbarNotices, { className: style_module_default["notices-snackbar"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: style_module_default.surfaces,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_theme.ThemeProvider, {
							color: {
								...themeColors,
								background: "#fcfcfc"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), (canvas || canvas === null) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: style_module_default.canvas,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasRenderer, {
									canvas,
									routeContentModule
								})
							})]
						})
					})
				]
			})
		})
	})] });
}

// packages/boot/build-module/components/app/index.mjs
function App({ rootComponent }) {
	const routes = (0, import_data.useSelect)((select) => select(store).getRoutes(), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Router, {
		routes,
		rootComponent
	});
}
async function runInitModules(initModules) {
	for (const moduleId of initModules ?? []) await (await import(moduleId)).init();
}
async function init({ mountId, menuItems, routes, initModules, dashboardLink }) {
	(menuItems ?? []).forEach((menuItem) => {
		(0, import_data.dispatch)(store).registerMenuItem(menuItem.id, menuItem);
	});
	(routes ?? []).forEach((route) => {
		(0, import_data.dispatch)(store).registerRoute(route);
	});
	if (dashboardLink) (0, import_data.dispatch)(store).setDashboardLink(dashboardLink);
	await runInitModules(initModules);
	const rootElement = document.getElementById(mountId);
	if (rootElement) (0, import_element.createRoot)(rootElement).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_element.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}) }));
}
async function initSinglePage({ mountId, routes, initModules }) {
	(routes ?? []).forEach((route) => {
		(0, import_data.dispatch)(store).registerRoute(route);
	});
	await runInitModules(initModules);
	const rootElement = document.getElementById(mountId);
	if (rootElement) (0, import_element.createRoot)(rootElement).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_element.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, { rootComponent: RootSinglePage }) }));
}

export { init, initSinglePage, store };
//# sourceMappingURL=index.js.map