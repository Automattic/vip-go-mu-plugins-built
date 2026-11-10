import { speak } from "@wordpress/a11y";

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

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
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
const majorVersion = parseInt(import__wp_global_react.version, 10);
function isReactVersionAtLeast(reactVersionToCheck) {
	return majorVersion >= reactVersionToCheck;
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
const EMPTY_ARRAY$1 = Object.freeze([]);
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/avatar/root/AvatarRootContext.mjs
const AvatarRootContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
AvatarRootContext.displayName = "AvatarRootContext";
function useAvatarRootContext() {
	const context = import__wp_global_react.useContext(AvatarRootContext);
	if (context === void 0) throw new Error("Base UI: AvatarRootContext is missing. Avatar parts must be placed within <Avatar.Root>.");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/avatar/root/stateAttributesMapping.mjs
const avatarStateAttributesMapping = { imageLoadingStatus: () => null };

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/avatar/root/AvatarRoot.mjs
var import_jsx_runtime = require_jsx_runtime();
const AvatarRoot = /*#__PURE__*/ import__wp_global_react.forwardRef(function AvatarRoot(componentProps, forwardedRef) {
	const { className, render, style, ...elementProps } = componentProps;
	const [imageLoadingStatus, setImageLoadingStatus] = import__wp_global_react.useState("idle");
	const state = { imageLoadingStatus };
	const contextValue = import__wp_global_react.useMemo(() => ({
		imageLoadingStatus,
		setImageLoadingStatus
	}), [imageLoadingStatus, setImageLoadingStatus]);
	const element = useRenderElement("span", componentProps, {
		state,
		ref: forwardedRef,
		props: elementProps,
		stateAttributesMapping: avatarStateAttributesMapping
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(AvatarRootContext.Provider, {
		value: contextValue,
		children: element
	});
});
AvatarRoot.displayName = "AvatarRoot";

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
	import__wp_global_react.useEffect(fn, EMPTY_ARRAY$1);
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/avatar/image/useImageLoadingStatus.mjs
function useImageLoadingStatus(src, { referrerPolicy, crossOrigin, sizes, srcSet }, enabled) {
	const state = import__wp_global_react.useState("idle");
	const setLoadingStatus = state[1];
	useIsoLayoutEffect(() => {
		if (!enabled) return NOOP;
		if (!src && !srcSet) {
			setLoadingStatus("error");
			return NOOP;
		}
		let isMounted = true;
		const image = new window.Image();
		const updateStatus = (status) => () => {
			if (!isMounted) return;
			setLoadingStatus(status);
		};
		setLoadingStatus("loading");
		image.onload = updateStatus("loaded");
		image.onerror = updateStatus("error");
		if (referrerPolicy) image.referrerPolicy = referrerPolicy;
		image.crossOrigin = crossOrigin ?? null;
		if (sizes) image.sizes = sizes;
		if (srcSet) image.srcset = srcSet;
		if (src) image.src = src;
		if (image.complete) setLoadingStatus(image.naturalWidth > 0 ? "loaded" : "error");
		return () => {
			isMounted = false;
		};
	}, [
		enabled,
		src,
		srcSet,
		sizes,
		crossOrigin,
		referrerPolicy,
		setLoadingStatus
	]);
	return state;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/avatar/image/AvatarImage.mjs
const stateAttributesMapping$3 = {
	...avatarStateAttributesMapping,
	...transitionStatusMapping
};
/**
* The image to be displayed in the avatar.
* Renders an `<img>` element.
*
* Documentation: [Base UI Avatar](https://base-ui.com/react/components/avatar)
*/
const AvatarImage = /*#__PURE__*/ import__wp_global_react.forwardRef(function AvatarImage(componentProps, forwardedRef) {
	const { className, render, onLoadingStatusChange: onLoadingStatusChangeProp, keepMounted = false, style, sizes, srcSet, src, ...elementProps } = componentProps;
	const { setImageLoadingStatus: setRootImageLoadingStatus } = useAvatarRootContext();
	const [imageLoadingStatus, setImageLoadingStatus] = useImageLoadingStatus(src, componentProps, !keepMounted);
	const isVisible = imageLoadingStatus === "loaded";
	const { mounted, transitionStatus, setMounted } = useTransitionStatus(isVisible);
	const imageRef = import__wp_global_react.useRef(null);
	const initialCommitRef = import__wp_global_react.useRef(true);
	useIsoLayoutEffect(() => {
		if (!keepMounted) return;
		const isInitialCommit = initialCommitRef.current;
		initialCommitRef.current = false;
		const image = imageRef.current;
		if (!image) return;
		if (!image.complete) {
			setImageLoadingStatus("loading");
			return;
		}
		const status = image.naturalWidth > 0 ? "loaded" : "error";
		setImageLoadingStatus(status);
		if (status === "loaded" && isInitialCommit) setMounted(true);
	}, [
		keepMounted,
		src,
		srcSet,
		sizes,
		elementProps.crossOrigin,
		elementProps.referrerPolicy,
		render,
		setImageLoadingStatus,
		setMounted
	]);
	const renderedStatusProps = keepMounted ? {
		"data-loading": imageLoadingStatus === "loading" ? "" : void 0,
		"data-error": imageLoadingStatus === "error" ? "" : void 0,
		"aria-hidden": imageLoadingStatus !== "loaded" || void 0,
		onLoad() {
			setImageLoadingStatus("loaded");
		},
		onError() {
			setImageLoadingStatus("error");
		}
	} : void 0;
	const handleLoadingStatusChange = useStableCallback((status) => {
		onLoadingStatusChangeProp?.(status);
		setRootImageLoadingStatus(status);
	});
	useIsoLayoutEffect(() => {
		if (imageLoadingStatus !== "idle") handleLoadingStatusChange(imageLoadingStatus);
	}, [imageLoadingStatus, handleLoadingStatusChange]);
	useIsoLayoutEffect(() => {
		return () => setRootImageLoadingStatus("idle");
	}, [setRootImageLoadingStatus]);
	useOpenChangeComplete({
		enabled: !isVisible,
		open: isVisible,
		ref: imageRef,
		onComplete() {
			if (!isVisible) setMounted(false);
		}
	});
	const state = {
		imageLoadingStatus,
		transitionStatus: keepMounted && transitionStatus === "ending" ? void 0 : transitionStatus
	};
	const shouldRender = keepMounted || mounted;
	const sourceProps = {};
	if (sizes !== void 0) sourceProps.sizes = sizes;
	if (srcSet !== void 0) sourceProps.srcSet = srcSet;
	if (src !== void 0) sourceProps.src = src;
	const element = useRenderElement("img", componentProps, {
		state,
		ref: [forwardedRef, imageRef],
		props: [
			renderedStatusProps,
			elementProps,
			sourceProps
		],
		stateAttributesMapping: stateAttributesMapping$3,
		enabled: shouldRender
	});
	if (!shouldRender) return null;
	return element;
});
AvatarImage.displayName = "AvatarImage";

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
var import_data = require_data();
var import_core_data = require_core_data();
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

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// \0wp-global:@wordpress/warning
var require_warning = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.warning;
}));

// packages/ui/build-module/avatar/dev-warnings.mjs
var import_warning = /* @__PURE__ */ __toESM(require_warning(), 1);
function warnAvatarColor(color) {
	if (color === void 0) return;
	if (color.match(/\/\*[\s\S]*?(?:\*\/|$)|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|(?:[-\w\u0080-\uFFFF]|\\(?:[\da-fA-F]{1,6}[ \t\r\n\f]?|[^\r\n\f]))+/g)?.some((token) => token.toLowerCase() === "currentcolor")) {
		(0, import_warning.default)("Avatar.Root: `color` contains `currentColor`, which can produce insufficient contrast in colored fallbacks. Use a color that does not depend on the foreground.");
		return;
	}
	if (typeof CSS === "undefined" || !CSS.supports) return;
	if (!CSS.supports("color", color)) (0, import_warning.default)("Avatar.Root: The browser does not support the `color` value. Use a valid CSS color supported by this browser.");
	else if (CSS.supports("color", "rgb(from red r g b / 1)") && !CSS.supports("color", `rgb(from ${color} r g b / 1)`)) (0, import_warning.default)("Avatar.Root: `color` cannot be used as a colored fallback fill. Use an explicit CSS color instead of a CSS-wide keyword such as `inherit`.");
}

// packages/ui/build-module/avatar/root.mjs
var import_element = require_element();
const STYLE_HASH_ATTRIBUTE$40 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$40() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$40(document);
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
function documentContainsStyleHash$40(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$40}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$40) === hash) return true;
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
function injectStyle$40(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$40();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$40(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$40, hash);
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
function registerDocument$40(targetDocument) {
	const runtime = getRuntime$40();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$40(targetDocument, hash, css);
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
function registerStyle$40(hash, css) {
	const runtime = getRuntime$40();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$40(targetDocument, hash, css);
}
registerStyle$40("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default$6 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$40("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default$7 = {
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
registerStyle$40("2657a3ab0c", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.a9728400af96db77__root{--_wp-ui-avatar-size:var(--wpds-dimension-size-md,32px);--_gcd-span-position:relative;--_gcd-span-display:inline-flex;--_gcd-span-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_gcd-span-font-size:var(--_wp-ui-avatar-font-size);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-sm,12px);align-items:center;background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);block-size:var(--_wp-ui-avatar-size);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:50%;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:inline-flex;flex-shrink:0;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--_wp-ui-avatar-font-size);font-weight:var(--wpds-typography-font-weight-emphasis,600);inline-size:var(--_wp-ui-avatar-size);justify-content:center;line-height:1;position:relative;vertical-align:middle}._81a33c129d7cbe31__has-color:after{border:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--_wp-ui-avatar-color);border-radius:inherit;content:\"\";inset:calc(var(--wpds-border-width-xs, 1px)*-1);pointer-events:none;position:absolute}._32e65dea77285874__is-square{border-radius:var(--wpds-border-radius-sm,2px)}._7d2020337343df5a__is-xs{--_wp-ui-avatar-size:var(--wpds-dimension-size-2xs,16px);--_wp-ui-avatar-font-size:calc(var(--_wp-ui-avatar-size)/2)}._216fb78a075c5ab4__is-sm{--_wp-ui-avatar-size:var(--wpds-dimension-size-sm,24px);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-xs,11px)}.b552ab04a3b94ae9__is-lg{--_wp-ui-avatar-size:var(--wpds-dimension-size-lg,40px);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-md,13px)}.f8a7646462ff80d1__is-xl{--_wp-ui-avatar-size:calc(var(--wpds-dimension-size-md, 32px)*2);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-xl,20px)}._411c43ac028fe4be__image,._7883f856336224e2__fallback{block-size:100%;border-radius:inherit;inline-size:100%;inset:0;position:absolute}._411c43ac028fe4be__image{object-fit:cover;@media not (prefers-reduced-motion){transition:opacity var(--wpds-motion-duration-sm,.1s) var(--wpds-motion-easing-subtle,cubic-bezier(.15,0,.15,1));&[data-error],&[data-loading],&[data-starting-style]{opacity:0}}&[data-ending-style],&[data-error],&[data-loading]{visibility:hidden}}._7883f856336224e2__fallback{--_gcd-span-position:absolute;--_gcd-span-display:flex;align-items:center;display:flex;justify-content:center;overflow:hidden;white-space:nowrap;>svg{block-size:100%;flex-shrink:0;inline-size:100%}>.dc9b5131d4746aa6__person-icon{block-size:110%;color:var(--wpds-color-stroke-surface-neutral-strong,#8d8d8d);inline-size:110%;translate:0 15%}}@media not (forced-colors:active){@supports (color:rgb(from green r g b/1)) and (color:color(from green srgb-linear round(up,r) g b/1)){._81a33c129d7cbe31__has-color:has(>._7883f856336224e2__fallback){border:none}._81a33c129d7cbe31__has-color:has(>._7883f856336224e2__fallback):after{content:none}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback{--_wp-ui-avatar-background:rgb(from var(--_wp-ui-avatar-color) clamp(0,r,255) clamp(0,g,255) clamp(0,b,255)/1);--_wp-ui-avatar-contrast-target:4.55;background-color:var(--_wp-ui-avatar-background)}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback>.dc9b5131d4746aa6__person-icon{--_wp-ui-avatar-contrast-target:3.05}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback,._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback>.dc9b5131d4746aa6__person-icon{--_wp-ui-avatar-luminance:calc(0.2126 * r + 0.7152 * g + 0.0722 * b);--_wp-ui-avatar-light-foreground:round(up,clamp(0,calc(0.17913 - var(--_wp-ui-avatar-luminance)),1));--_wp-ui-avatar-dark-tint:clamp(0,calc(((var(--_wp-ui-avatar-luminance) + 0.05)/var(--_wp-ui-avatar-contrast-target) - 0.05)/max(0.000001, var(--_wp-ui-avatar-luminance))),1);--_wp-ui-avatar-light-tint:clamp(0,calc((1.05 - var(--_wp-ui-avatar-contrast-target)*(var(--_wp-ui-avatar-luminance) + 0.05))/max(0.000001, 1 - var(--_wp-ui-avatar-luminance))),1);--_wp-ui-avatar-tint:calc(var(--_wp-ui-avatar-light-foreground)*var(--_wp-ui-avatar-light-tint) + (1 - var(--_wp-ui-avatar-light-foreground))*var(--_wp-ui-avatar-dark-tint));color:color(from var(--_wp-ui-avatar-background) srgb-linear calc(var(--_wp-ui-avatar-light-foreground) + (r - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint)) calc(var(--_wp-ui-avatar-light-foreground) + (g - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint)) calc(var(--_wp-ui-avatar-light-foreground) + (b - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint))/1)}}}}}");
var style_module_default$27 = {
	"root": "a9728400af96db77__root",
	"has-color": "_81a33c129d7cbe31__has-color",
	"is-square": "_32e65dea77285874__is-square",
	"is-xs": "_7d2020337343df5a__is-xs",
	"is-sm": "_216fb78a075c5ab4__is-sm",
	"is-lg": "b552ab04a3b94ae9__is-lg",
	"is-xl": "f8a7646462ff80d1__is-xl",
	"image": "_411c43ac028fe4be__image",
	"fallback": "_7883f856336224e2__fallback",
	"person-icon": "dc9b5131d4746aa6__person-icon"
};
/**
* Displays a profile image with a customizable fallback.
* Compose with `Avatar.Image` and `Avatar.Fallback`.
*
* For an avatar that identifies a person, use `role="img"` and `aria-label`
* on the root, with an empty image `alt`. This keeps the name available while
* the image loads or the fallback is shown. Use `aria-hidden` on the root
* when nearby text already identifies the person.
*
* ```jsx
* <Avatar.Root role="img" aria-label="Alex Morgan">
* 	<Avatar.Fallback delay={300}>AM</Avatar.Fallback>
* 	<Avatar.Image src="/alex.jpg" alt="" />
* </Avatar.Root>
* ```
*/
const Root$2 = (0, import_element.forwardRef)(function AvatarRoot$1({ size = "md", shape = "circle", color, className, style, ...props }, ref) {
	warnAvatarColor(color);
	const customProperties = color === void 0 ? style : {
		...style,
		"--_wp-ui-avatar-color": color
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarRoot, {
		ref,
		style: customProperties,
		className: clsx(resets_module_default$6["box-sizing"], global_css_defense_module_default$7.span, style_module_default$27.root, style_module_default$27[`is-${size}`], shape === "square" && style_module_default$27["is-square"], color !== void 0 && style_module_default$27["has-color"], className),
		...props
	});
});

// packages/ui/build-module/avatar/image.mjs
const STYLE_HASH_ATTRIBUTE$39 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$39() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$39(document);
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
function documentContainsStyleHash$39(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$39}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$39) === hash) return true;
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
function injectStyle$39(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$39();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$39(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$39, hash);
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
function registerDocument$39(targetDocument) {
	const runtime = getRuntime$39();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$39(targetDocument, hash, css);
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
function registerStyle$39(hash, css) {
	const runtime = getRuntime$39();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$39(targetDocument, hash, css);
}
registerStyle$39("2657a3ab0c", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.a9728400af96db77__root{--_wp-ui-avatar-size:var(--wpds-dimension-size-md,32px);--_gcd-span-position:relative;--_gcd-span-display:inline-flex;--_gcd-span-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_gcd-span-font-size:var(--_wp-ui-avatar-font-size);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-sm,12px);align-items:center;background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);block-size:var(--_wp-ui-avatar-size);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:50%;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:inline-flex;flex-shrink:0;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--_wp-ui-avatar-font-size);font-weight:var(--wpds-typography-font-weight-emphasis,600);inline-size:var(--_wp-ui-avatar-size);justify-content:center;line-height:1;position:relative;vertical-align:middle}._81a33c129d7cbe31__has-color:after{border:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--_wp-ui-avatar-color);border-radius:inherit;content:\"\";inset:calc(var(--wpds-border-width-xs, 1px)*-1);pointer-events:none;position:absolute}._32e65dea77285874__is-square{border-radius:var(--wpds-border-radius-sm,2px)}._7d2020337343df5a__is-xs{--_wp-ui-avatar-size:var(--wpds-dimension-size-2xs,16px);--_wp-ui-avatar-font-size:calc(var(--_wp-ui-avatar-size)/2)}._216fb78a075c5ab4__is-sm{--_wp-ui-avatar-size:var(--wpds-dimension-size-sm,24px);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-xs,11px)}.b552ab04a3b94ae9__is-lg{--_wp-ui-avatar-size:var(--wpds-dimension-size-lg,40px);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-md,13px)}.f8a7646462ff80d1__is-xl{--_wp-ui-avatar-size:calc(var(--wpds-dimension-size-md, 32px)*2);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-xl,20px)}._411c43ac028fe4be__image,._7883f856336224e2__fallback{block-size:100%;border-radius:inherit;inline-size:100%;inset:0;position:absolute}._411c43ac028fe4be__image{object-fit:cover;@media not (prefers-reduced-motion){transition:opacity var(--wpds-motion-duration-sm,.1s) var(--wpds-motion-easing-subtle,cubic-bezier(.15,0,.15,1));&[data-error],&[data-loading],&[data-starting-style]{opacity:0}}&[data-ending-style],&[data-error],&[data-loading]{visibility:hidden}}._7883f856336224e2__fallback{--_gcd-span-position:absolute;--_gcd-span-display:flex;align-items:center;display:flex;justify-content:center;overflow:hidden;white-space:nowrap;>svg{block-size:100%;flex-shrink:0;inline-size:100%}>.dc9b5131d4746aa6__person-icon{block-size:110%;color:var(--wpds-color-stroke-surface-neutral-strong,#8d8d8d);inline-size:110%;translate:0 15%}}@media not (forced-colors:active){@supports (color:rgb(from green r g b/1)) and (color:color(from green srgb-linear round(up,r) g b/1)){._81a33c129d7cbe31__has-color:has(>._7883f856336224e2__fallback){border:none}._81a33c129d7cbe31__has-color:has(>._7883f856336224e2__fallback):after{content:none}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback{--_wp-ui-avatar-background:rgb(from var(--_wp-ui-avatar-color) clamp(0,r,255) clamp(0,g,255) clamp(0,b,255)/1);--_wp-ui-avatar-contrast-target:4.55;background-color:var(--_wp-ui-avatar-background)}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback>.dc9b5131d4746aa6__person-icon{--_wp-ui-avatar-contrast-target:3.05}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback,._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback>.dc9b5131d4746aa6__person-icon{--_wp-ui-avatar-luminance:calc(0.2126 * r + 0.7152 * g + 0.0722 * b);--_wp-ui-avatar-light-foreground:round(up,clamp(0,calc(0.17913 - var(--_wp-ui-avatar-luminance)),1));--_wp-ui-avatar-dark-tint:clamp(0,calc(((var(--_wp-ui-avatar-luminance) + 0.05)/var(--_wp-ui-avatar-contrast-target) - 0.05)/max(0.000001, var(--_wp-ui-avatar-luminance))),1);--_wp-ui-avatar-light-tint:clamp(0,calc((1.05 - var(--_wp-ui-avatar-contrast-target)*(var(--_wp-ui-avatar-luminance) + 0.05))/max(0.000001, 1 - var(--_wp-ui-avatar-luminance))),1);--_wp-ui-avatar-tint:calc(var(--_wp-ui-avatar-light-foreground)*var(--_wp-ui-avatar-light-tint) + (1 - var(--_wp-ui-avatar-light-foreground))*var(--_wp-ui-avatar-dark-tint));color:color(from var(--_wp-ui-avatar-background) srgb-linear calc(var(--_wp-ui-avatar-light-foreground) + (r - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint)) calc(var(--_wp-ui-avatar-light-foreground) + (g - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint)) calc(var(--_wp-ui-avatar-light-foreground) + (b - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint))/1)}}}}}");
var style_module_default$26 = {
	"root": "a9728400af96db77__root",
	"has-color": "_81a33c129d7cbe31__has-color",
	"is-square": "_32e65dea77285874__is-square",
	"is-xs": "_7d2020337343df5a__is-xs",
	"is-sm": "_216fb78a075c5ab4__is-sm",
	"is-lg": "b552ab04a3b94ae9__is-lg",
	"is-xl": "f8a7646462ff80d1__is-xl",
	"image": "_411c43ac028fe4be__image",
	"fallback": "_7883f856336224e2__fallback",
	"person-icon": "dc9b5131d4746aa6__person-icon"
};
/**
* The profile image, displayed once it has loaded.
* Set `keepMounted` to render the image element immediately and let the image
* load in place. Use it with `loading="lazy"` or an optimized image component
* passed through `render`.
* When passing a custom image component through `render`, forward its ref and
* image props, including `onLoad` and `onError`, to the underlying image element.
*/
const Image = (0, import_element.forwardRef)(function AvatarImage$1({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
		ref,
		className: clsx(style_module_default$26.image, className),
		...props
	});
});

// \0wp-global:@wordpress/primitives
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.primitives;
}));

// packages/ui/build-module/icon/icon.mjs
var import_primitives = require_primitives();
/**
* Renders an SVG icon with a 24px default size.
*
* ```jsx
* import { wordpress } from '@wordpress/icons';
*
* <Icon icon={ wordpress } />
* ```
*/
const Icon = (0, import_element.forwardRef)(function UnforwardedIcon({ icon, size = 24, style, ...restProps }, ref) {
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

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/error.mjs
const error = createLogOnce("error", "Base UI");

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useControlled.mjs
function useControlled({ controlled, default: defaultProp, name, state = "value" }) {
	const { current: isControlled } = import__wp_global_react.useRef(controlled !== void 0);
	const [valueState, setValue] = import__wp_global_react.useState(() => defaultProp);
	const value = isControlled && controlled !== void 0 ? controlled : valueState;
	{
		import__wp_global_react.useEffect(() => {
			if (isControlled !== (controlled !== void 0)) error([
				`A component is changing the ${isControlled ? "" : "un"}controlled ${state} state of ${name} to be ${isControlled ? "un" : ""}controlled.`,
				"Elements should not switch from uncontrolled to controlled (or vice versa).",
				`Decide between using a controlled or uncontrolled ${name} element for the lifetime of the component.`,
				"The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.",
				"More info: https://fb.me/react-controlled-components"
			].join("\n"));
		}, [
			state,
			name,
			controlled
		]);
		const { current: defaultValue } = import__wp_global_react.useRef(defaultProp);
		import__wp_global_react.useEffect(() => {
			if (!isControlled && serializeToDevModeString(defaultValue) !== serializeToDevModeString(defaultProp)) error([`A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. To suppress this warning opt to use a controlled ${name}.`].join("\n"));
		}, [defaultProp]);
	}
	return [value, import__wp_global_react.useCallback((newValue) => {
		if (!isControlled) setValue(newValue);
	}, [])];
}
function serializeToDevModeString(input) {
	let nextId = 0;
	const seen = /* @__PURE__ */ new WeakMap();
	try {
		return JSON.stringify(input, function replacer(key, value) {
			if (key === "_owner" && this != null && typeof this === "object" && "$$typeof" in this) return;
			if (typeof value === "bigint") return `__bigint__:${value}`;
			if (value !== null && typeof value === "object") {
				const id = seen.get(value);
				if (id !== void 0) return `__object__:${id}`;
				seen.set(value, nextId);
				nextId += 1;
			}
			return value;
		}) ?? `__top__:${typeof input}`;
	} catch {
		return "__unserializable__";
	}
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/composite/list/CompositeListContext.mjs
const CompositeListContext = /*#__PURE__*/ import__wp_global_react.createContext({
	register: () => {},
	unregister: () => {},
	subscribeMapChange: () => () => {},
	nextIndexRef: { current: 0 }
});
CompositeListContext.displayName = "CompositeListContext";
function useCompositeListContext() {
	return import__wp_global_react.useContext(CompositeListContext);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/composite/list/CompositeList.mjs
/**
* Provides context for a list of items in a composite component.
*/
function CompositeList(props) {
	const { children, elementsRef, labelsRef, onMapChange: onMapChangeProp } = props;
	const onMapChange = useStableCallback(onMapChangeProp);
	const [, setMapTick] = import__wp_global_react.useState(0);
	const listeners = useRefWithInit(createListeners).current;
	const map = useRefWithInit(createMap).current;
	const nextIndexRef = import__wp_global_react.useRef(0);
	const isDirtyRef = import__wp_global_react.useRef(true);
	const itemsRef = import__wp_global_react.useRef(null);
	const mutationObserverRef = import__wp_global_react.useRef(null);
	const scheduleMapUpdate = useStableCallback(() => {
		if (isDirtyRef.current) return;
		isDirtyRef.current = true;
		setMapTick((tick) => tick + 1);
	});
	const register = useStableCallback((node, registration) => {
		map.set(node, registration);
		scheduleMapUpdate();
	});
	const unregister = useStableCallback((node) => {
		map.delete(node);
		scheduleMapUpdate();
	});
	const syncRefs = useStableCallback((items) => {
		const nextMap = /* @__PURE__ */ new Map();
		elementsRef.current.length = 0;
		if (labelsRef) labelsRef.current.length = 0;
		items.forEach((item) => {
			nextMap.set(item.element, {
				...item.registration.metadata ?? {},
				index: item.index
			});
			elementsRef.current[item.index] = item.element;
			if (labelsRef) labelsRef.current[item.index] = item.registration.label !== void 0 ? item.registration.label : item.registration.textRef?.current?.textContent ?? item.element.textContent;
		});
		nextIndexRef.current = elementsRef.current.length;
		return nextMap;
	});
	function observe(sortedNodes) {
		mutationObserverRef.current?.disconnect();
		mutationObserverRef.current = null;
		if (typeof MutationObserver !== "function" || sortedNodes.length < 2) return;
		const mutationObserver = new MutationObserver((entries) => {
			if (!hasMovedNode(entries)) return;
			let previousConnectedNode = null;
			for (const node of sortedNodes) {
				if (!node.isConnected) continue;
				if (previousConnectedNode && sortByDocumentPosition(previousConnectedNode, node) > 0) {
					mutationObserver.disconnect();
					scheduleMapUpdate();
					return;
				}
				previousConnectedNode = node;
			}
		});
		mutationObserverRef.current = mutationObserver;
		const roots = /* @__PURE__ */ new Set();
		for (let i = 1; i < sortedNodes.length; i += 1) {
			const root = getCommonAncestor(sortedNodes[i - 1], sortedNodes[i]);
			if (root) roots.add(root);
		}
		roots.forEach((root) => mutationObserver.observe(root, { childList: true }));
	}
	const flush = useStableCallback(() => {
		const [items, automaticNodes] = getCompositeListSnapshot(map);
		const nextMap = syncRefs(items);
		const previousItems = itemsRef.current;
		const changed = !previousItems || previousItems.length !== items.length || items.some((item, index) => {
			const previousItem = previousItems[index];
			return item.index !== previousItem.index || item.element !== previousItem.element || item.registration.index !== previousItem.registration.index || item.registration.metadata !== previousItem.registration.metadata;
		});
		observe(automaticNodes);
		itemsRef.current = items;
		isDirtyRef.current = false;
		if (!changed) return;
		listeners.forEach((listener) => listener(nextMap));
		onMapChange(nextMap);
	});
	useIsoLayoutEffect(() => {
		if (!isDirtyRef.current && itemsRef.current) syncRefs(itemsRef.current);
		return () => {
			elementsRef.current = [];
			if (labelsRef) labelsRef.current = [];
		};
	}, [
		elementsRef,
		labelsRef,
		syncRefs
	]);
	useIsoLayoutEffect(() => {
		if (isDirtyRef.current) flush();
	});
	useIsoLayoutEffect(() => {
		return () => {
			mutationObserverRef.current?.disconnect();
			isDirtyRef.current = true;
		};
	}, []);
	const subscribeMapChange = useStableCallback((fn) => {
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	});
	const contextValue = import__wp_global_react.useMemo(() => ({
		register,
		unregister,
		subscribeMapChange,
		nextIndexRef
	}), [
		register,
		unregister,
		subscribeMapChange,
		nextIndexRef
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeListContext.Provider, {
		value: contextValue,
		children
	});
}
function createMap() {
	return /* @__PURE__ */ new Map();
}
function createListeners() {
	return /* @__PURE__ */ new Set();
}
function getCompositeListSnapshot(map) {
	const reservedIndices = /* @__PURE__ */ new Set();
	const items = [];
	const automaticItems = [];
	map.forEach((registration, node) => {
		if (!node.isConnected) return;
		const index = registration.index;
		const item = {
			index: index ?? -1,
			element: node,
			registration
		};
		if (index === null) automaticItems.push(item);
		else if (index >= 0) {
			reservedIndices.add(index);
			items.push(item);
		}
	});
	let nextAutomaticIndex = 0;
	automaticItems.sort((a, b) => sortByDocumentPosition(a.element, b.element));
	automaticItems.forEach((item) => {
		while (reservedIndices.has(nextAutomaticIndex)) nextAutomaticIndex += 1;
		item.index = nextAutomaticIndex;
		items.push(item);
		nextAutomaticIndex += 1;
	});
	if (reservedIndices.size > 0) items.sort((a, b) => a.index - b.index);
	return [items, automaticItems.map((item) => item.element)];
}
function getCommonAncestor(firstNode, lastNode) {
	let ancestor = firstNode.parentElement;
	while (ancestor && !ancestor.contains(lastNode)) ancestor = ancestor.parentElement;
	return ancestor;
}
function hasMovedNode(entries) {
	for (const entry of entries) for (let i = 0; i < entry.removedNodes.length; i += 1) if (entry.removedNodes[i].isConnected) return true;
	return false;
}
function sortByDocumentPosition(a, b) {
	if (a.nextElementSibling === b) return -1;
	if (b.nextElementSibling === a) return 1;
	return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

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
function useId$3(idOverride, prefix) {
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
	return useId$3(idOverride, "base-ui");
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
const outsidePress = "outside-press";
const itemPress = "item-press";
const focusOut = "focus-out";
const escapeKey = "escape-key";
const listNavigation = "list-navigation";
const cancelOpen = "cancel-open";
const imperativeAction = "imperative-action";
const windowResize = "window-resize";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/composite/list/useCompositeListItem.mjs
/**
* Used to register a list item and its index (DOM position) in the `CompositeList`.
*/
function useCompositeListItem(params = {}) {
	const { guess, label, metadata, textRef, index: externalIndex } = params;
	const { register, unregister, subscribeMapChange, nextIndexRef } = useCompositeListContext();
	const indexRef = import__wp_global_react.useRef(-1);
	const [internalIndex, setInternalIndex] = import__wp_global_react.useState(externalIndex == null && guess ? () => {
		if (indexRef.current === -1) {
			const newIndex = nextIndexRef.current;
			nextIndexRef.current += 1;
			indexRef.current = newIndex;
		}
		return indexRef.current;
	} : -1);
	const index = externalIndex ?? internalIndex;
	const componentRef = import__wp_global_react.useRef(null);
	const ref = import__wp_global_react.useCallback((node) => {
		const previousNode = componentRef.current;
		if (previousNode) unregister(previousNode);
		componentRef.current = node;
		if (node) register(node, {
			metadata: metadata ?? null,
			index: externalIndex ?? null,
			label,
			textRef
		});
	}, [
		externalIndex,
		register,
		unregister,
		metadata,
		label,
		textRef
	]);
	useIsoLayoutEffect(() => {
		if (externalIndex != null) return;
		return subscribeMapChange((map) => {
			const i = componentRef.current ? map.get(componentRef.current)?.index : null;
			if (i != null) setInternalIndex(i);
		});
	}, [externalIndex, subscribeMapChange]);
	return {
		ref,
		index
	};
}

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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/composite/root/CompositeRootContext.mjs
const CompositeRootContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
CompositeRootContext.displayName = "CompositeRootContext";
function useCompositeRootContext(optional = false) {
	const context = import__wp_global_react.useContext(CompositeRootContext);
	if (context === void 0 && !optional) throw new Error("Base UI: CompositeRootContext is missing. Composite parts must be placed within <Composite.Root>.");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/useFocusableWhenDisabled.mjs
function useFocusableWhenDisabled(parameters) {
	const { focusableWhenDisabled, disabled, composite = false, tabIndex: tabIndexProp = 0, isNativeButton } = parameters;
	const isFocusableComposite = composite && focusableWhenDisabled !== false;
	const isNonFocusableComposite = composite && focusableWhenDisabled === false;
	return { props: import__wp_global_react.useMemo(() => {
		const additionalProps = { onKeyDown(event) {
			if (disabled && focusableWhenDisabled && event.key !== "Tab") event.preventDefault();
		} };
		if (!composite) {
			additionalProps.tabIndex = tabIndexProp;
			if (!isNativeButton && disabled) additionalProps.tabIndex = focusableWhenDisabled ? tabIndexProp : -1;
		}
		if (isNativeButton && (focusableWhenDisabled || isFocusableComposite) || !isNativeButton && disabled) additionalProps["aria-disabled"] = disabled;
		if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite)) additionalProps.disabled = disabled;
		return additionalProps;
	}, [
		composite,
		disabled,
		focusableWhenDisabled,
		isFocusableComposite,
		isNonFocusableComposite,
		isNativeButton,
		tabIndexProp
	]) };
}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/owner.mjs
function ownerDocument(node) {
	return node?.ownerDocument || document;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/dispatchClickWithModifiers.mjs
/**
* Dispatches a constructed click on the target so it carries the source event's
* modifier state, which `click()` always reports as unpressed. Like `click()`,
* the untrusted click still runs native activation behavior (form submission,
* link navigation).
* `detail` defaults to 0 and `pointerType` to `''` (the native convention for
* keyboard-generated clicks). When the click represents a mouse gesture, pass
* `detail: 1` and `pointerType: 'mouse'` so consumers don't classify it as a
* keyboard activation.
*/
function dispatchClickWithModifiers(target, sourceEvent, { detail = 0, pointerType = "" } = {}) {
	target.dispatchEvent(new (getWindow(target)).PointerEvent("click", {
		bubbles: true,
		cancelable: true,
		composed: true,
		detail,
		pointerType,
		shiftKey: sourceEvent.shiftKey,
		ctrlKey: sourceEvent.ctrlKey,
		altKey: sourceEvent.altKey,
		metaKey: sourceEvent.metaKey
	}));
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/use-button/useButton.mjs
function useButton(parameters = {}) {
	const { disabled = false, focusableWhenDisabled, tabIndex = 0, native: isNativeButton = true, composite: compositeProp } = parameters;
	const elementRef = import__wp_global_react.useRef(null);
	const compositeRootContext = useCompositeRootContext(true);
	const isCompositeItem = compositeProp ?? compositeRootContext !== void 0;
	const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled({
		focusableWhenDisabled,
		disabled,
		composite: isCompositeItem,
		tabIndex,
		isNativeButton
	});
	import__wp_global_react.useEffect(() => {
		if (!elementRef.current) return;
		const isButtonTag = isButtonElement(elementRef.current);
		if (isNativeButton) {
			if (!isButtonTag) {
				const ownerStackMessage = SafeReact.captureOwnerStack?.() || "";
				error(`A component that acts as a button expected a native <button> because the \`nativeButton\` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the \`render\` prop, or set \`nativeButton\` to \`false\`.${ownerStackMessage}`);
			}
		} else if (isButtonTag) {
			const ownerStackMessage = SafeReact.captureOwnerStack?.() || "";
			error(`A component that acts as a button expected a non-<button> because the \`nativeButton\` prop is false. Rendering a <button> keeps native behavior while Base UI applies non-native attributes and handlers, which can add unintended extra attributes (such as \`role\` or \`aria-disabled\`). Use a non-<button> in the \`render\` prop, or set \`nativeButton\` to \`true\`.${ownerStackMessage}`);
		}
	}, [isNativeButton]);
	const updateDisabled = import__wp_global_react.useCallback(() => {
		const element = elementRef.current;
		if (!isButtonElement(element)) return;
		if (isCompositeItem && disabled && focusableWhenDisabledProps.disabled === void 0 && element.disabled) element.disabled = false;
	}, [
		disabled,
		focusableWhenDisabledProps.disabled,
		isCompositeItem
	]);
	useIsoLayoutEffect(updateDisabled, [updateDisabled]);
	return {
		getButtonProps: import__wp_global_react.useCallback((externalProps = {}) => {
			const { onClick: externalOnClick, onMouseDown: externalOnMouseDown, onKeyUp: externalOnKeyUp, onKeyDown: externalOnKeyDown, onPointerDown: externalOnPointerDown, ...otherExternalProps } = externalProps;
			return mergeProps({
				onClick(event) {
					if (disabled) {
						event.preventDefault();
						return;
					}
					externalOnClick?.(event);
				},
				onMouseDown(event) {
					if (!disabled) externalOnMouseDown?.(event);
				},
				onKeyDown(event) {
					if (disabled) return;
					makeEventPreventable(event);
					externalOnKeyDown?.(event);
					if (event.baseUIHandlerPrevented) return;
					const isCurrentTarget = event.target === event.currentTarget;
					const currentTarget = event.currentTarget;
					const isButton = isButtonElement(currentTarget);
					const isLink = !isNativeButton && isValidLinkElement(currentTarget);
					const shouldClick = isCurrentTarget && (isNativeButton ? isButton : !isLink);
					const isEnterKey = event.key === "Enter";
					const isSpaceKey = event.key === " ";
					const role = currentTarget.getAttribute("role");
					const isTextNavigationRole = role?.startsWith("menuitem") || role === "option" || role === "gridcell";
					if (isCurrentTarget && isCompositeItem && isSpaceKey) {
						if (event.defaultPrevented && isTextNavigationRole) return;
						event.preventDefault();
						if (!isNativeButton || isButton) {
							event.preventBaseUIHandler();
							dispatchClickWithModifiers(currentTarget, event);
						}
						return;
					}
					if (!shouldClick || isNativeButton || !isSpaceKey && !isEnterKey) {
						if (isCurrentTarget && isLink && isSpaceKey) event.preventDefault();
						return;
					}
					if (event.defaultPrevented) return;
					event.preventDefault();
					if (isEnterKey) {
						event.preventBaseUIHandler();
						dispatchClickWithModifiers(currentTarget, event);
					}
				},
				onKeyUp(event) {
					if (disabled) return;
					makeEventPreventable(event);
					externalOnKeyUp?.(event);
					if (event.target === event.currentTarget && isNativeButton && isCompositeItem && isButtonElement(event.currentTarget) && event.key === " ") {
						event.preventDefault();
						return;
					}
					if (event.baseUIHandlerPrevented) return;
					if (event.target === event.currentTarget && !isNativeButton && !isCompositeItem && !event.defaultPrevented && event.key === " ") {
						event.preventBaseUIHandler();
						dispatchClickWithModifiers(event.currentTarget, event);
					}
				},
				onPointerDown(event) {
					if (disabled) {
						event.preventDefault();
						return;
					}
					externalOnPointerDown?.(event);
				}
			}, isNativeButton ? { type: "button" } : { role: "button" }, focusableWhenDisabledProps, otherExternalProps);
		}, [
			disabled,
			focusableWhenDisabledProps,
			isCompositeItem,
			isNativeButton
		]),
		buttonRef: useStableCallback((element) => {
			elementRef.current = element;
			updateDisabled();
		})
	};
}
function isButtonElement(elem) {
	return isHTMLElement(elem) && elem.tagName === "BUTTON";
}
function isValidLinkElement(elem) {
	return isHTMLElement(elem) && elem.tagName === "A" && Boolean(elem.href);
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

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useScrollLock.mjs
let originalHtmlStyles = {};
let originalBodyStyles = {};
let originalHtmlScrollBehavior = "";
function getViewportScroller(html, body) {
	return isOverflowElement(html) ? html : body;
}
function isPageScrollLocked(win, html, body) {
	return /hidden|clip/.test(win.getComputedStyle(getViewportScroller(html, body)).overflowY);
}
function hasInsetScrollbars(referenceElement) {
	if (typeof document === "undefined") return false;
	const doc = ownerDocument(referenceElement);
	return getWindow(doc).innerWidth - doc.documentElement.clientWidth > 0;
}
function supportsStableScrollbarGutter(referenceElement) {
	if (!(typeof CSS !== "undefined" && CSS.supports && CSS.supports("scrollbar-gutter", "stable")) || typeof document === "undefined") return false;
	const doc = ownerDocument(referenceElement);
	const html = doc.documentElement;
	const body = doc.body;
	const scrollContainer = getViewportScroller(html, body);
	const originalScrollContainerOverflowY = scrollContainer.style.overflowY;
	const originalHtmlStyleGutter = html.style.scrollbarGutter;
	html.style.scrollbarGutter = "stable";
	scrollContainer.style.overflowY = "scroll";
	const before = scrollContainer.offsetWidth;
	scrollContainer.style.overflowY = "hidden";
	const after = scrollContainer.offsetWidth;
	scrollContainer.style.overflowY = originalScrollContainerOverflowY;
	html.style.scrollbarGutter = originalHtmlStyleGutter;
	return before === after;
}
function preventScrollOverlayScrollbars(referenceElement) {
	const doc = ownerDocument(referenceElement);
	const html = doc.documentElement;
	const body = doc.body;
	const elementToLock = getViewportScroller(html, body);
	const originalElementToLockStyles = {
		overflowY: elementToLock.style.overflowY,
		overflowX: elementToLock.style.overflowX
	};
	Object.assign(elementToLock.style, {
		overflowY: "hidden",
		overflowX: "hidden"
	});
	return () => {
		Object.assign(elementToLock.style, originalElementToLockStyles);
	};
}
function preventScrollInsetScrollbars(referenceElement) {
	const doc = ownerDocument(referenceElement);
	const html = doc.documentElement;
	const body = doc.body;
	const win = getWindow(html);
	let scrollTop = 0;
	let scrollLeft = 0;
	let updateGutterOnly = false;
	const resizeFrame = AnimationFrame.create();
	if (webkit && (win.visualViewport?.scale ?? 1) !== 1) return () => {};
	function lockScroll() {
		const htmlStyles = win.getComputedStyle(html);
		const bodyStyles = win.getComputedStyle(body);
		const scrollbarGutterValue = (htmlStyles.scrollbarGutter || "").includes("both-edges") ? "stable both-edges" : "stable";
		scrollTop = html.scrollTop;
		scrollLeft = html.scrollLeft;
		originalHtmlStyles = {
			scrollbarGutter: html.style.scrollbarGutter,
			overflowY: html.style.overflowY,
			overflowX: html.style.overflowX
		};
		originalHtmlScrollBehavior = html.style.scrollBehavior;
		originalBodyStyles = {
			position: body.style.position,
			height: body.style.height,
			width: body.style.width,
			boxSizing: body.style.boxSizing,
			overflowY: body.style.overflowY,
			overflowX: body.style.overflowX,
			scrollBehavior: body.style.scrollBehavior
		};
		const isScrollableY = html.scrollHeight > html.clientHeight;
		const isScrollableX = html.scrollWidth > html.clientWidth;
		const hasConstantOverflowY = htmlStyles.overflowY === "scroll" || bodyStyles.overflowY === "scroll";
		const hasConstantOverflowX = htmlStyles.overflowX === "scroll" || bodyStyles.overflowX === "scroll";
		const scrollbarWidth = Math.max(0, win.innerWidth - body.clientWidth);
		const scrollbarHeight = Math.max(0, win.innerHeight - body.clientHeight);
		const marginY = parseFloat(bodyStyles.marginTop) + parseFloat(bodyStyles.marginBottom);
		const marginX = parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight);
		const elementToLock = getViewportScroller(html, body);
		updateGutterOnly = supportsStableScrollbarGutter(referenceElement);
		if (updateGutterOnly) {
			html.style.scrollbarGutter = scrollbarGutterValue;
			elementToLock.style.overflowY = "hidden";
			elementToLock.style.overflowX = "hidden";
			return;
		}
		Object.assign(html.style, {
			scrollbarGutter: scrollbarGutterValue,
			overflowY: "hidden",
			overflowX: "hidden"
		});
		if (isScrollableY || hasConstantOverflowY) html.style.overflowY = "scroll";
		if (isScrollableX || hasConstantOverflowX) html.style.overflowX = "scroll";
		Object.assign(body.style, {
			position: "relative",
			height: marginY || scrollbarHeight ? `calc(100dvh - ${marginY + scrollbarHeight}px)` : "100dvh",
			width: marginX || scrollbarWidth ? `calc(100vw - ${marginX + scrollbarWidth}px)` : "100vw",
			boxSizing: "border-box",
			overflowY: "hidden",
			overflowX: "hidden",
			scrollBehavior: "unset"
		});
		body.scrollTop = scrollTop;
		body.scrollLeft = scrollLeft;
		html.setAttribute("data-base-ui-scroll-locked", "");
		html.style.scrollBehavior = "unset";
	}
	function cleanup() {
		Object.assign(html.style, originalHtmlStyles);
		Object.assign(body.style, originalBodyStyles);
		if (!updateGutterOnly) {
			html.scrollTop = scrollTop;
			html.scrollLeft = scrollLeft;
			html.removeAttribute("data-base-ui-scroll-locked");
			html.style.scrollBehavior = originalHtmlScrollBehavior;
		}
	}
	function handleResize() {
		cleanup();
		resizeFrame.request(lockScroll);
	}
	lockScroll();
	const unsubscribeResize = addEventListener(win, "resize", handleResize);
	return () => {
		resizeFrame.cancel();
		cleanup();
		if (typeof win.removeEventListener === "function") unsubscribeResize();
	};
}
var ScrollLocker = class {
	lockCount = 0;
	restore = null;
	timeoutLock = Timeout.create();
	timeoutUnlock = Timeout.create();
	acquire(referenceElement) {
		this.lockCount += 1;
		if (this.lockCount === 1 && this.restore === null) this.timeoutLock.start(0, () => this.lock(referenceElement));
		return this.release;
	}
	release = () => {
		this.lockCount -= 1;
		if (this.lockCount === 0 && this.restore) this.timeoutUnlock.start(0, this.unlock);
	};
	unlock = () => {
		if (this.lockCount === 0 && this.restore) {
			this.restore?.();
			this.restore = null;
		}
	};
	lock(referenceElement) {
		if (this.lockCount === 0 || this.restore !== null) return;
		const doc = ownerDocument(referenceElement);
		const html = doc.documentElement;
		const body = doc.body;
		const win = getWindow(html);
		if (isPageScrollLocked(win, html, body)) {
			const observer = new win.MutationObserver(() => {
				if (isPageScrollLocked(win, html, body)) return;
				observer.disconnect();
				this.restore = null;
				this.lock(referenceElement);
			});
			const options = { attributes: true };
			observer.observe(html, options);
			observer.observe(body, options);
			this.restore = () => observer.disconnect();
			return;
		}
		const hasOverlayScrollbars = ios || !hasInsetScrollbars(referenceElement);
		this.restore = hasOverlayScrollbars ? preventScrollOverlayScrollbars(referenceElement) : preventScrollInsetScrollbars(referenceElement);
	}
};
const SCROLL_LOCKER = new ScrollLocker();
/**
* Locks the scroll of the document when enabled.
*
* @param enabled - Whether to enable the scroll lock.
* @param referenceElement - Element to use as a reference for lock calculations.
*/
function useScrollLock(enabled = true, referenceElement = null) {
	useIsoLayoutEffect(() => {
		if (!enabled) return;
		return SCROLL_LOCKER.acquire(referenceElement);
	}, [enabled, referenceElement]);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/event.mjs
function stopEvent(event) {
	event.preventDefault();
	event.stopPropagation();
}
function isReactEvent(event) {
	return "nativeEvent" in event;
}
function isVirtualClick(event) {
	if (event.pointerType === "" && event.isTrusted) return true;
	if (android && event.pointerType) return event.type === "click" && event.buttons === 1;
	return event.detail === 0 && !event.pointerType;
}
function isVirtualPointerEvent(event) {
	if (jsdom) return false;
	return !android && event.width === 0 && event.height === 0 || event.type === "pointerdown" && event.width === 1 && event.height === 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === "mouse" && (android || event.buttons === 0) || event.width < 1 && event.height < 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === "touch";
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
const ARROW_LEFT$1 = "ArrowLeft";
const ARROW_RIGHT$1 = "ArrowRight";
const ARROW_UP$1 = "ArrowUp";
const ARROW_DOWN$1 = "ArrowDown";

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
const pressed$1 = "data-pressed";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/popupStateMapping.mjs
const TRIGGER_HOOK = { [popupOpen$1]: "" };
const PRESSABLE_TRIGGER_HOOK = {
	[popupOpen$1]: "",
	[pressed$1]: ""
};
const POPUP_OPEN_HOOK = { [open]: "" };
const POPUP_CLOSED_HOOK = { [closed]: "" };
const ANCHOR_HIDDEN_HOOK = { [anchorHidden]: "" };
const pressableTriggerOpenStateMapping = { open(value) {
	if (value) return PRESSABLE_TRIGGER_HOOK;
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/element.mjs
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
function isTypeableCombobox(element) {
	if (!element) return false;
	return element.getAttribute("role") === "combobox" && isTypeableElement(element);
}
function getFloatingFocusElement(floatingElement) {
	if (!floatingElement) return null;
	return floatingElement.hasAttribute("data-base-ui-focusable") ? floatingElement : floatingElement.querySelector(`[${"data-base-ui-focusable"}]`) || floatingElement;
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
function clamp$1(start, value, end) {
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
function isIndexOutOfListBounds(list, index) {
	return index < 0 || index >= list.length;
}
function getMinListIndex(listRef, disabledIndices) {
	return findNonDisabledListIndex(listRef.current, { disabledIndices });
}
function getMaxListIndex(listRef, disabledIndices) {
	return findNonDisabledListIndex(listRef.current, {
		decrement: true,
		startingIndex: listRef.current.length,
		disabledIndices
	});
}
/**
* The index one arrow step moves the highlight to from `currentIndex`, or `-1` when the step
* leaves the list. `wrapped` reports a jump from one end of the list to the other.
*/
function getNextListIndex(list, currentIndex, options) {
	const { decrement, loopFocus, allowEscape, disabledIndices, minIndex, maxIndex } = options;
	const step = () => findNonDisabledListIndex(list, {
		startingIndex: currentIndex,
		decrement,
		disabledIndices
	});
	let index;
	let wrapped = false;
	if (!loopFocus) index = decrement ? Math.max(minIndex, step()) : Math.min(maxIndex, step());
	else if (decrement ? currentIndex <= minIndex : currentIndex >= maxIndex) {
		const outside = decrement ? -1 : list.length;
		if (allowEscape && currentIndex !== outside) index = -1;
		else {
			index = decrement ? maxIndex : minIndex;
			wrapped = true;
		}
	} else index = step();
	return {
		index: isIndexOutOfListBounds(list, index) ? -1 : index,
		wrapped
	};
}
function findNonDisabledListIndex(list, { startingIndex = -1, decrement = false, disabledIndices, amount = 1 } = {}) {
	let index = startingIndex;
	do
		index += decrement ? -amount : amount;
	while (index >= 0 && index <= list.length - 1 && isListIndexDisabled(list, index, disabledIndices));
	return index;
}
function isListIndexDisabled(list, index, disabledIndices) {
	if (typeof disabledIndices === "function" ? disabledIndices(index) : disabledIndices?.includes(index) ?? false) return true;
	const element = list[index];
	if (!element) return false;
	if (!isElementVisible(element)) return true;
	if (element.matches(":disabled")) return true;
	return !disabledIndices && (element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true");
}
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
function isTabbable(element) {
	return isFocusableElement(element) && getTabIndex(element) >= 0;
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
function getNodeAncestors(nodes, id) {
	let allAncestors = [];
	let currentParentId = nodes.find((node) => node.id === id)?.parentId;
	while (currentParentId) {
		const currentNode = nodes.find((node) => node.id === currentParentId);
		currentParentId = currentNode?.parentId;
		if (currentNode) allAncestors = allAncestors.concat(currentNode);
	}
	return allAncestors;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/createAttribute.mjs
function createAttribute(name) {
	return `data-base-ui-${name}`;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/enqueueFocus.mjs
let rafId = 0;
function enqueueFocus(el, options = {}) {
	const { preventScroll = false, sync = false, shouldFocus } = options;
	cancelAnimationFrame(rafId);
	function exec() {
		if (shouldFocus && !shouldFocus()) return;
		el?.focus({ preventScroll });
	}
	if (sync) {
		exec();
		return NOOP;
	}
	const currentRafId = requestAnimationFrame(exec);
	rafId = currentRafId;
	return () => {
		if (rafId === currentRafId) {
			cancelAnimationFrame(currentRafId);
			rafId = 0;
		}
	};
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/markOthers.mjs
const markerName = "data-base-ui-inert";
let ariaHiddenCounterMap = /* @__PURE__ */ new WeakMap();
let uncontrolledElementsSet = /* @__PURE__ */ new WeakSet();
let markerCounterMap = /* @__PURE__ */ new WeakMap();
let lockCount = 0;
function unwrapHost(node) {
	if (!node) return null;
	return isShadowRoot(node) ? node.host : unwrapHost(node.parentNode);
}
const correctElements = (parent, targets) => targets.map((target) => {
	if (parent.contains(target)) return target;
	const correctedTarget = unwrapHost(target);
	if (parent.contains(correctedTarget)) return correctedTarget;
	return null;
}).filter((x) => x != null);
const buildKeepSet = (targets) => {
	const keep = /* @__PURE__ */ new Set();
	targets.forEach((target) => {
		let node = target;
		while (node && !keep.has(node)) {
			keep.add(node);
			node = node.parentNode;
		}
	});
	return keep;
};
const collectOutsideElements = (root, keepElements, stopElements) => {
	const outside = [];
	const walk = (parent) => {
		if (!parent || stopElements.has(parent)) return;
		Array.from(parent.children).forEach((node) => {
			if (getNodeName(node) === "script") return;
			if (keepElements.has(node)) walk(node);
			else outside.push(node);
		});
	};
	walk(root);
	return outside;
};
function applyAttributeToOthers(uncorrectedAvoidElements, body, ariaHidden, { mark = true }) {
	const avoidElements = correctElements(body, uncorrectedAvoidElements);
	const markerTargets = mark ? collectOutsideElements(body, buildKeepSet(avoidElements), new Set(avoidElements)) : [];
	const hiddenElements = [];
	const markedElements = [];
	if (ariaHidden) {
		const ariaLiveElements = correctElements(body, Array.from(body.querySelectorAll("[aria-live]")));
		const controlElements = avoidElements.concat(ariaLiveElements);
		collectOutsideElements(body, buildKeepSet(controlElements), new Set(controlElements)).forEach((node) => {
			const attr = node.getAttribute("aria-hidden");
			const alreadyHidden = attr !== null && attr !== "false";
			const counterValue = (ariaHiddenCounterMap.get(node) || 0) + 1;
			ariaHiddenCounterMap.set(node, counterValue);
			hiddenElements.push(node);
			if (counterValue === 1 && alreadyHidden) uncontrolledElementsSet.add(node);
			if (!alreadyHidden) node.setAttribute("aria-hidden", "true");
		});
	}
	if (mark) markerTargets.forEach((node) => {
		const markerValue = (markerCounterMap.get(node) || 0) + 1;
		markerCounterMap.set(node, markerValue);
		markedElements.push(node);
		if (markerValue === 1) node.setAttribute(markerName, "");
	});
	lockCount += 1;
	return () => {
		hiddenElements.forEach((element) => {
			const counterValue = (ariaHiddenCounterMap.get(element) || 0) - 1;
			ariaHiddenCounterMap.set(element, counterValue);
			if (!counterValue) {
				if (!uncontrolledElementsSet.has(element)) element.removeAttribute("aria-hidden");
				uncontrolledElementsSet.delete(element);
			}
		});
		if (mark) markedElements.forEach((element) => {
			const markerValue = (markerCounterMap.get(element) || 0) - 1;
			markerCounterMap.set(element, markerValue);
			if (!markerValue) element.removeAttribute(markerName);
		});
		lockCount -= 1;
		if (!lockCount) {
			ariaHiddenCounterMap = /* @__PURE__ */ new WeakMap();
			uncontrolledElementsSet = /* @__PURE__ */ new WeakSet();
			markerCounterMap = /* @__PURE__ */ new WeakMap();
		}
	};
}
function markOthers(avoidElements, options = {}) {
	const { ariaHidden = false, mark = true } = options;
	const body = ownerDocument(avoidElements[0]).body;
	return applyAttributeToOthers(avoidElements, body, ariaHidden, { mark });
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/constants.mjs
const DISABLED_TRANSITIONS_STYLE = { style: { transition: "none" } };
const CLICK_TRIGGER_IDENTIFIER = "data-base-ui-click-trigger";
/**
* Used for dropdowns that usually strictly prefer top/bottom placements and
* use `var(--available-height)` to limit their height.
*/
const DROPDOWN_COLLISION_AVOIDANCE = { fallbackAxisSide: "none" };
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
	const uniqueId = useId$3();
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/components/FloatingFocusManager.mjs
function getEventType(event, lastInteractionType) {
	const win = getWindow(getTarget(event));
	if (event instanceof win.KeyboardEvent) return "keyboard";
	if (event instanceof win.FocusEvent) return lastInteractionType || "keyboard";
	if ("pointerType" in event) return event.pointerType || (isVirtualClick(event) ? "keyboard" : lastInteractionType || "mouse");
	if ("touches" in event) return "touch";
	if (event instanceof win.MouseEvent) return lastInteractionType || (event.detail === 0 ? "keyboard" : "mouse");
	return "";
}
const LIST_LIMIT = 20;
let previouslyFocusedElements = [];
function clearDisconnectedPreviouslyFocusedElements() {
	previouslyFocusedElements = previouslyFocusedElements.filter((entry) => {
		return entry.deref()?.isConnected;
	});
}
function addPreviouslyFocusedElement(element) {
	clearDisconnectedPreviouslyFocusedElements();
	if (element && getNodeName(element) !== "body") {
		previouslyFocusedElements.push(new WeakRef(element));
		if (previouslyFocusedElements.length > LIST_LIMIT) previouslyFocusedElements = previouslyFocusedElements.slice(-20);
	}
}
function getPreviouslyFocusedElement() {
	clearDisconnectedPreviouslyFocusedElements();
	return previouslyFocusedElements[previouslyFocusedElements.length - 1]?.deref();
}
function getFirstTabbableElement(container) {
	if (!container) return null;
	if (isTabbable(container)) return container;
	return tabbable(container)[0] || container;
}
function handleTabIndex(floatingFocusElement) {
	if (floatingFocusElement.hasAttribute("tabindex") && !floatingFocusElement.hasAttribute("data-tabindex")) return;
	if (!floatingFocusElement.getAttribute("role")?.includes("dialog")) return;
	const tabbableContent = focusable(floatingFocusElement).filter((element) => {
		const dataTabIndex = element.getAttribute("data-tabindex") || "";
		return isTabbable(element) || element.hasAttribute("data-tabindex") && !dataTabIndex.startsWith("-");
	});
	const tabIndex = floatingFocusElement.getAttribute("tabindex");
	if (tabbableContent.length === 0) {
		if (tabIndex !== "0") {
			floatingFocusElement.setAttribute("tabindex", "0");
			floatingFocusElement.setAttribute("data-tabindex", "0");
		}
	} else if (tabIndex !== "-1" || floatingFocusElement.hasAttribute("data-tabindex") && floatingFocusElement.getAttribute("data-tabindex") !== "-1") {
		floatingFocusElement.setAttribute("tabindex", "-1");
		floatingFocusElement.setAttribute("data-tabindex", "-1");
	}
}
/**
* Provides focus management for the floating element.
* @see https://floating-ui.com/docs/FloatingFocusManager
* @internal
*/
function FloatingFocusManager(props) {
	const { context: store, children, disabled = false, initialFocus = true, returnFocus = true, explicitReturnFocus, restoreFocus = false, modal = true, closeOnFocusOut = true, openInteractionType = "", nextFocusableElement, previousFocusableElement, beforeContentFocusGuardRef, externalTree, getInsideElements } = props;
	const open = store.useState("open");
	const domReference = store.useState("domReferenceElement");
	const floating = store.useState("floatingElement");
	const { events, dataRef } = store.context;
	const getNodeId = useStableCallback(() => dataRef.current.floatingContext?.nodeId);
	const ignoreInitialFocus = initialFocus === false;
	const isUntrappedTypeableCombobox = isTypeableCombobox(domReference) && ignoreInitialFocus;
	const initialFocusRef = useValueAsRef(initialFocus);
	const returnFocusRef = useValueAsRef(returnFocus);
	const explicitReturnFocusRef = useValueAsRef(explicitReturnFocus);
	const openInteractionTypeRef = useValueAsRef(openInteractionType);
	const openRef = useValueAsRef(open);
	const tree = useFloatingTree(externalTree);
	const portalContext = usePortalContext();
	const preventReturnFocusRef = import__wp_global_react.useRef(false);
	const isPointerDownRef = import__wp_global_react.useRef(false);
	const pointerDownOutsideRef = import__wp_global_react.useRef(false);
	const lastFocusedTabbableRef = import__wp_global_react.useRef(null);
	const closeTypeRef = import__wp_global_react.useRef("");
	const lastInteractionTypeRef = import__wp_global_react.useRef("");
	const beforeGuardRef = import__wp_global_react.useRef(null);
	const afterGuardRef = import__wp_global_react.useRef(null);
	const mergedBeforeGuardRef = useMergedRefs(beforeGuardRef, beforeContentFocusGuardRef, portalContext?.beforeInsideRef);
	const mergedAfterGuardRef = useMergedRefs(afterGuardRef, portalContext?.afterInsideRef);
	const blurTimeout = useTimeout();
	const pointerDownTimeout = useTimeout();
	const restoreFocusFrame = useAnimationFrame();
	const isInsidePortal = portalContext != null;
	const floatingFocusElement = getFloatingFocusElement(floating);
	const getTabbableContent = useStableCallback((container = floatingFocusElement) => {
		return container ? tabbable(container) : [];
	});
	const getResolvedInsideElements = useStableCallback(() => getInsideElements?.().filter((element) => element != null) ?? []);
	import__wp_global_react.useEffect(() => {
		if (disabled || !modal) return;
		function onKeyDown(event) {
			if (event.key === "Tab") {
				if (contains(floatingFocusElement, activeElement(ownerDocument(floatingFocusElement))) && getTabbableContent().length === 0 && !isUntrappedTypeableCombobox) stopEvent(event);
			}
		}
		const doc = ownerDocument(floatingFocusElement);
		return addEventListener(doc, "keydown", onKeyDown);
	}, [
		disabled,
		floatingFocusElement,
		modal,
		isUntrappedTypeableCombobox,
		getTabbableContent
	]);
	import__wp_global_react.useEffect(() => {
		if (disabled || !open) return;
		const doc = ownerDocument(floatingFocusElement);
		function clearPointerDownOutside() {
			pointerDownOutsideRef.current = false;
		}
		function onPointerDown(event) {
			const target = getTarget(event);
			const insideElements = getResolvedInsideElements();
			const pointerTargetInside = contains(floating, target) || contains(domReference, target) || contains(portalContext?.portalNode, target) || insideElements.some((element) => element === target || contains(element, target));
			pointerDownOutsideRef.current = !pointerTargetInside;
			lastInteractionTypeRef.current = event.pointerType || "keyboard";
			if (closest(target, `[${"data-base-ui-click-trigger"}]`)) {
				isPointerDownRef.current = true;
				pointerDownTimeout.start(0, () => {
					isPointerDownRef.current = false;
				});
			}
		}
		function onKeyDown() {
			lastInteractionTypeRef.current = "keyboard";
		}
		return mergeCleanups(addEventListener(doc, "pointerdown", onPointerDown, true), addEventListener(doc, "pointerup", clearPointerDownOutside, true), addEventListener(doc, "pointercancel", clearPointerDownOutside, true), addEventListener(doc, "keydown", onKeyDown, true), clearPointerDownOutside);
	}, [
		disabled,
		floating,
		domReference,
		floatingFocusElement,
		open,
		portalContext,
		pointerDownTimeout,
		getResolvedInsideElements
	]);
	import__wp_global_react.useEffect(() => {
		if (disabled || !closeOnFocusOut) return;
		const doc = ownerDocument(floatingFocusElement);
		function handlePointerDown() {
			isPointerDownRef.current = true;
			pointerDownTimeout.start(0, () => {
				isPointerDownRef.current = false;
			});
		}
		function handleFocusIn(event) {
			const target = getTarget(event);
			if (isTabbable(target)) lastFocusedTabbableRef.current = target;
		}
		function handleFocusOutside(event) {
			const relatedTarget = event.relatedTarget;
			const currentTarget = event.currentTarget;
			const target = getTarget(event);
			if (modal && relatedTarget == null && target != null && contains(floating, target)) addPreviouslyFocusedElement(target);
			queueMicrotask(() => {
				const nodeId = getNodeId();
				const triggers = store.context.triggerElements;
				const insideElements = getResolvedInsideElements();
				const isRelatedFocusGuard = relatedTarget?.hasAttribute(createAttribute("focus-guard")) && [
					beforeGuardRef.current,
					afterGuardRef.current,
					portalContext?.beforeInsideRef.current,
					portalContext?.afterInsideRef.current,
					portalContext?.beforeOutsideRef.current,
					portalContext?.afterOutsideRef.current,
					resolveRef(previousFocusableElement),
					resolveRef(nextFocusableElement)
				].includes(relatedTarget);
				const movedToUnrelatedNode = !(contains(domReference, relatedTarget) || contains(floating, relatedTarget) || contains(relatedTarget, floating) || contains(portalContext?.portalNode, relatedTarget) || insideElements.some((element) => element === relatedTarget || contains(element, relatedTarget)) || triggers.hasMatchingElement((trigger) => contains(trigger, relatedTarget)) || isRelatedFocusGuard || tree && (getNodeChildren(tree.nodesRef.current, nodeId).find((node) => contains(node.context?.elements.floating, relatedTarget) || contains(node.context?.elements.domReference, relatedTarget)) || getNodeAncestors(tree.nodesRef.current, nodeId).find((node) => [node.context?.elements.floating, getFloatingFocusElement(node.context?.elements.floating)].includes(relatedTarget) || node.context?.elements.domReference === relatedTarget)));
				if (currentTarget === domReference && floatingFocusElement) handleTabIndex(floatingFocusElement);
				if (restoreFocus && currentTarget !== domReference && !isElementVisible(target) && activeElement(doc) === doc.body) {
					if (isHTMLElement(floatingFocusElement)) {
						floatingFocusElement.focus();
						if (restoreFocus === "popup") {
							restoreFocusFrame.request(() => {
								floatingFocusElement.focus();
							});
							return;
						}
					}
					const tabbableContent = getTabbableContent();
					const prevTabbable = lastFocusedTabbableRef.current;
					const nodeToFocus = (prevTabbable && tabbableContent.includes(prevTabbable) ? prevTabbable : null) || tabbableContent[tabbableContent.length - 1] || floatingFocusElement;
					if (isHTMLElement(nodeToFocus)) nodeToFocus.focus();
				}
				if (dataRef.current.insideReactTree) {
					dataRef.current.insideReactTree = false;
					return;
				}
				if ((isUntrappedTypeableCombobox ? true : !modal) && relatedTarget && movedToUnrelatedNode && !isPointerDownRef.current && (isUntrappedTypeableCombobox || relatedTarget !== getPreviouslyFocusedElement())) {
					preventReturnFocusRef.current = true;
					store.setOpen(false, createChangeEventDetails(focusOut, event));
				}
			});
		}
		function markInsideReactTree() {
			if (pointerDownOutsideRef.current) return;
			dataRef.current.insideReactTree = true;
			blurTimeout.start(0, () => {
				dataRef.current.insideReactTree = false;
			});
		}
		const domReferenceElement = isHTMLElement(domReference) ? domReference : null;
		if (!floating && !domReferenceElement) return;
		return mergeCleanups(domReferenceElement && addEventListener(domReferenceElement, "focusout", handleFocusOutside), domReferenceElement && addEventListener(domReferenceElement, "pointerdown", handlePointerDown), floating && addEventListener(floating, "focusin", handleFocusIn), floating && addEventListener(floating, "focusout", handleFocusOutside), floating && portalContext && addEventListener(floating, "focusout", markInsideReactTree, true));
	}, [
		disabled,
		domReference,
		floating,
		floatingFocusElement,
		modal,
		tree,
		portalContext,
		store,
		closeOnFocusOut,
		restoreFocus,
		getTabbableContent,
		isUntrappedTypeableCombobox,
		getNodeId,
		dataRef,
		blurTimeout,
		pointerDownTimeout,
		restoreFocusFrame,
		nextFocusableElement,
		previousFocusableElement,
		getResolvedInsideElements
	]);
	import__wp_global_react.useEffect(() => {
		if (disabled || !floating || !open) return;
		const portalNodes = Array.from(portalContext?.portalNode?.querySelectorAll(`[${createAttribute("portal")}]`) || []);
		const rootAncestorComboboxDomReference = (tree ? getNodeAncestors(tree.nodesRef.current, getNodeId()) : []).find((node) => isTypeableCombobox(node.context?.elements.domReference || null))?.context?.elements.domReference;
		const insideElements = [
			...[
				floating,
				...portalNodes,
				beforeGuardRef.current,
				afterGuardRef.current,
				portalContext?.beforeOutsideRef.current,
				portalContext?.afterOutsideRef.current,
				...getResolvedInsideElements()
			],
			rootAncestorComboboxDomReference,
			resolveRef(previousFocusableElement),
			resolveRef(nextFocusableElement),
			isUntrappedTypeableCombobox ? domReference : null
		].filter((x) => x != null);
		const ariaHiddenCleanup = markOthers(insideElements, {
			ariaHidden: modal || isUntrappedTypeableCombobox,
			mark: false
		});
		const markerInsideElements = [floating, ...portalNodes].filter((x) => x != null);
		const markerCleanup = markOthers(markerInsideElements);
		return () => {
			markerCleanup();
			ariaHiddenCleanup();
		};
	}, [
		open,
		disabled,
		domReference,
		floating,
		modal,
		portalContext,
		isUntrappedTypeableCombobox,
		tree,
		getNodeId,
		nextFocusableElement,
		previousFocusableElement,
		getResolvedInsideElements
	]);
	useIsoLayoutEffect(() => {
		if (!open || disabled || !isHTMLElement(floatingFocusElement)) return;
		closeTypeRef.current = "";
		lastInteractionTypeRef.current = "";
		const doc = ownerDocument(floatingFocusElement);
		const previouslyFocusedElement = activeElement(doc);
		queueMicrotask(() => {
			const initialFocusValueOrFn = initialFocusRef.current;
			const resolvedInitialFocus = typeof initialFocusValueOrFn === "function" ? initialFocusValueOrFn(openInteractionTypeRef.current || "") : initialFocusValueOrFn;
			if (resolvedInitialFocus === void 0 || resolvedInitialFocus === false) return;
			if (contains(floatingFocusElement, previouslyFocusedElement)) return;
			let focusableElements = null;
			const getDefaultFocusElement = () => {
				if (focusableElements == null) focusableElements = getTabbableContent(floatingFocusElement);
				return focusableElements[0] || floatingFocusElement;
			};
			let elToFocus;
			if (resolvedInitialFocus === true || resolvedInitialFocus === null) elToFocus = getDefaultFocusElement();
			else elToFocus = resolveRef(resolvedInitialFocus);
			elToFocus = elToFocus || getDefaultFocusElement();
			const hadFocusInside = contains(floatingFocusElement, activeElement(doc));
			const openEvent = dataRef.current.openEvent;
			const openedByVirtualPress = openEvent?.type === "mousedown" && isVirtualClick(openEvent);
			enqueueFocus(elToFocus, {
				sync: openedByVirtualPress,
				preventScroll: elToFocus === floatingFocusElement,
				shouldFocus() {
					if (!openRef.current) return false;
					if (hadFocusInside) return true;
					const currentActiveElement = activeElement(doc);
					return !(currentActiveElement !== elToFocus && contains(floatingFocusElement, currentActiveElement));
				}
			});
		});
	}, [
		disabled,
		open,
		floatingFocusElement,
		getTabbableContent,
		initialFocusRef,
		openInteractionTypeRef,
		openRef,
		dataRef
	]);
	const pendingReturnFocusRef = import__wp_global_react.useRef(null);
	useIsoLayoutEffect(() => {
		if (disabled || !floatingFocusElement) {
			pendingReturnFocusRef.current = null;
			return;
		}
		if (pendingReturnFocusRef.current) {
			pendingReturnFocusRef.current.cancelled = true;
			pendingReturnFocusRef.current = null;
		}
		const doc = ownerDocument(floatingFocusElement);
		const elementFocusedBeforeOpen = activeElement(doc);
		const preferPreviousFocus = openInteractionTypeRef.current == null;
		addPreviouslyFocusedElement(elementFocusedBeforeOpen);
		function onOpenChangeLocal(details) {
			if (!details.open) closeTypeRef.current = getEventType(details.nativeEvent, lastInteractionTypeRef.current);
			if (details.reason === "focus-out" && details.triggerElement?.hasAttribute(createAttribute("focus-guard")) || details.reason === "trigger-hover" && details.nativeEvent.type === "mouseleave") preventReturnFocusRef.current = true;
			if (details.reason !== "outside-press") return;
			if (details.nested) preventReturnFocusRef.current = false;
			else if (isVirtualClick(details.nativeEvent) || isVirtualPointerEvent(details.nativeEvent)) preventReturnFocusRef.current = false;
			else {
				let isPreventScrollSupported = false;
				ownerDocument(floatingFocusElement).createElement("div").focus({ get preventScroll() {
					isPreventScrollSupported = true;
					return false;
				} });
				if (isPreventScrollSupported) preventReturnFocusRef.current = false;
				else preventReturnFocusRef.current = true;
			}
		}
		events.on("openchange", onOpenChangeLocal);
		function getReturnElement(closeType) {
			const returnFocusValueOrFn = returnFocusRef.current;
			let resolvedReturnFocusValue = typeof returnFocusValueOrFn === "function" ? returnFocusValueOrFn(closeType) : returnFocusValueOrFn;
			if (resolvedReturnFocusValue === void 0 || resolvedReturnFocusValue === false) return null;
			if (resolvedReturnFocusValue === null) resolvedReturnFocusValue = true;
			const referenceReturnElement = domReference?.isConnected ? domReference : null;
			const previousReturnElement = elementFocusedBeforeOpen?.isConnected && getNodeName(elementFocusedBeforeOpen) !== "body" ? elementFocusedBeforeOpen : null;
			let defaultReturnElement = preferPreviousFocus ? previousReturnElement || referenceReturnElement : referenceReturnElement || previousReturnElement;
			if (!defaultReturnElement) defaultReturnElement = getPreviouslyFocusedElement() || null;
			if (typeof resolvedReturnFocusValue === "boolean") return defaultReturnElement;
			return resolveRef(resolvedReturnFocusValue) || defaultReturnElement || null;
		}
		return () => {
			events.off("openchange", onOpenChangeLocal);
			const activeEl = activeElement(doc);
			const insideElements = getResolvedInsideElements();
			const isFocusInsideFloatingTree = contains(floating, activeEl) || insideElements.some((element) => element === activeEl || contains(element, activeEl)) || tree && getNodeChildren(tree.nodesRef.current, getNodeId(), false).some((node) => contains(node.context?.elements.floating, activeEl));
			const returnFocusValueOrFn = returnFocusRef.current;
			const closeType = closeTypeRef.current;
			const returnElement = getReturnElement(closeType);
			const job = { cancelled: false };
			pendingReturnFocusRef.current = job;
			queueMicrotask(() => {
				if (pendingReturnFocusRef.current === job) pendingReturnFocusRef.current = null;
				const tabbableReturnElement = getFirstTabbableElement(returnElement);
				const hasExplicitReturnFocus = explicitReturnFocusRef.current ?? typeof returnFocusValueOrFn !== "boolean";
				if (!job.cancelled && returnFocusValueOrFn && !preventReturnFocusRef.current && isHTMLElement(tabbableReturnElement) && (!hasExplicitReturnFocus && tabbableReturnElement !== activeEl && activeEl !== doc.body ? isFocusInsideFloatingTree : true)) {
					const focusOptions = { preventScroll: true };
					if (closeType === "keyboard") focusOptions.focusVisible = true;
					tabbableReturnElement.focus(focusOptions);
				}
				preventReturnFocusRef.current = false;
			});
		};
	}, [
		disabled,
		floating,
		floatingFocusElement,
		returnFocusRef,
		explicitReturnFocusRef,
		openInteractionTypeRef,
		events,
		tree,
		domReference,
		getNodeId,
		getResolvedInsideElements
	]);
	useIsoLayoutEffect(() => {
		if (!webkit || open || !floating) return;
		const activeEl = activeElement(ownerDocument(floating));
		if (!isHTMLElement(activeEl) || !isTypeableElement(activeEl)) return;
		if (contains(floating, activeEl)) activeEl.blur();
	}, [open, floating]);
	useIsoLayoutEffect(() => {
		if (disabled || !portalContext) return;
		portalContext.setFocusManagerState({
			modal,
			closeOnFocusOut,
			open,
			onOpenChange: store.setOpen,
			domReference
		});
		return () => {
			portalContext.setFocusManagerState(null);
		};
	}, [
		disabled,
		portalContext,
		modal,
		open,
		store,
		closeOnFocusOut,
		domReference
	]);
	useIsoLayoutEffect(() => {
		if (disabled || !floatingFocusElement) return;
		handleTabIndex(floatingFocusElement);
		return () => {
			queueMicrotask(clearDisconnectedPreviouslyFocusedElements);
		};
	}, [disabled, floatingFocusElement]);
	const shouldRenderGuards = !disabled && (modal ? !isUntrappedTypeableCombobox : true) && (isInsidePortal || modal);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import__wp_global_react.Fragment, { children: [
		shouldRenderGuards && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			"data-type": "inside",
			ref: mergedBeforeGuardRef,
			onFocus: (event) => {
				if (modal) {
					const els = getTabbableContent();
					enqueueFocus(els[els.length - 1]);
				} else if (portalContext?.portalNode) {
					preventReturnFocusRef.current = false;
					if (isOutsideEvent(event, portalContext.portalNode)) getNextTabbable(domReference)?.focus();
					else resolveRef(previousFocusableElement ?? portalContext.beforeOutsideRef)?.focus();
				}
			}
		}),
		children,
		shouldRenderGuards && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			"data-type": "inside",
			ref: mergedAfterGuardRef,
			onFocus: (event) => {
				if (modal) enqueueFocus(getTabbableContent()[0]);
				else if (portalContext?.portalNode) {
					if (closeOnFocusOut) preventReturnFocusRef.current = true;
					if (isOutsideEvent(event, portalContext.portalNode)) getPreviousTabbable(domReference)?.focus();
					else resolveRef(nextFocusableElement ?? portalContext.afterOutsideRef)?.focus();
				}
			}
		})
	] });
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useClick.mjs
/**
* Opens or closes the floating element when clicking the reference element.
* @see https://floating-ui.com/docs/useClick
*/
function useClick(store, props = {}) {
	const { enabled = true, event: eventOption = "click", toggle = true, ignoreMouse = false, stickIfOpen = true, touchOpenDelay = 0, reason = triggerPress } = props;
	const dataRef = store.context.dataRef;
	const pointerTypeRef = import__wp_global_react.useRef(void 0);
	const frame = useAnimationFrame();
	const touchOpenTimeout = useTimeout();
	const reference = import__wp_global_react.useMemo(() => {
		function setOpenWithTouchDelay(nextOpen, nativeEvent, target, pointerType) {
			const details = createChangeEventDetails(reason, nativeEvent, target);
			if (nextOpen && pointerType === "touch" && touchOpenDelay > 0) touchOpenTimeout.start(touchOpenDelay, () => {
				store.setOpen(true, details);
			});
			else store.setOpen(nextOpen, details);
		}
		function getNextOpen(open, currentTarget, isClickLikeOpenEvent) {
			const openEvent = dataRef.current.openEvent;
			const hasClickedOnInactiveTrigger = store.select("domReferenceElement") !== currentTarget;
			if (open && hasClickedOnInactiveTrigger) return true;
			if (!open) return true;
			if (!toggle) return true;
			if (openEvent && (typeof stickIfOpen === "function" ? stickIfOpen() : stickIfOpen)) return !isClickLikeOpenEvent(openEvent.type);
			return false;
		}
		return {
			onPointerDown(event) {
				pointerTypeRef.current = isMouseLikePointerType(event.pointerType, true) && isVirtualPointerEvent(event.nativeEvent) ? "virtual" : event.pointerType;
			},
			onMouseDown(event) {
				const pointerType = pointerTypeRef.current;
				const nativeEvent = event.nativeEvent;
				const open = store.select("open");
				if (event.button !== 0 || eventOption === "click" || isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
				const nextOpen = getNextOpen(open, event.currentTarget, (openEventType) => openEventType === "click" || openEventType === "mousedown");
				const target = getTarget(nativeEvent);
				const isTypeable = isTypeableElement(target);
				if (isTypeable || pointerType === "virtual") {
					setOpenWithTouchDelay(nextOpen, nativeEvent, isTypeable ? target : event.currentTarget, pointerType);
					return;
				}
				const eventCurrentTarget = event.currentTarget;
				frame.request(() => {
					setOpenWithTouchDelay(nextOpen, nativeEvent, eventCurrentTarget, pointerType);
				});
			},
			onClick(event) {
				if (eventOption === "mousedown-only") return;
				const pointerType = pointerTypeRef.current;
				if (eventOption === "mousedown" && pointerType) {
					pointerTypeRef.current = void 0;
					return;
				}
				if (isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
				setOpenWithTouchDelay(getNextOpen(store.select("open"), event.currentTarget, (openEventType) => openEventType === "click" || openEventType === "mousedown" || openEventType === "keydown" || openEventType === "keyup"), event.nativeEvent, event.currentTarget, pointerType);
			},
			onKeyDown() {
				pointerTypeRef.current = void 0;
			}
		};
	}, [
		dataRef,
		eventOption,
		ignoreMouse,
		reason,
		store,
		stickIfOpen,
		toggle,
		frame,
		touchOpenTimeout,
		touchOpenDelay
	]);
	return import__wp_global_react.useMemo(() => enabled ? { reference } : EMPTY_OBJECT, [enabled, reference]);
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
function attachPreventUnmountOnClose(eventDetails) {
	let preventUnmountOnClose = false;
	eventDetails.preventUnmountOnClose = () => {
		preventUnmountOnClose = true;
	};
	return () => preventUnmountOnClose;
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
function register(hook) {
	hooks.push(hook);
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
register({
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useFloatingRootContext.mjs
function useFloatingRootContext(options) {
	const { open = false, onOpenChange, elements = {} } = options;
	const floatingId = useId$3();
	const nested = useFloatingParentNodeId() != null;
	{
		const optionDomReference = elements.reference;
		if (optionDomReference && !isElement(optionDomReference)) console.error("Cannot pass a virtual element to the `elements.reference` option,", "as it must be a real DOM element. Use `context.setPositionReference()`", "instead.");
	}
	const store = useRefWithInit(() => new FloatingRootStore({
		open,
		transitionStatus: void 0,
		onOpenChange,
		referenceElement: elements.reference ?? null,
		floatingElement: elements.floating ?? null,
		triggerElements: new PopupTriggerMap(),
		floatingId,
		syncOnly: false,
		nested
	})).current;
	useIsoLayoutEffect(() => {
		const valuesToSync = {
			open,
			floatingId
		};
		if (elements.reference !== void 0) {
			valuesToSync.referenceElement = elements.reference;
			valuesToSync.domReferenceElement = isElement(elements.reference) ? elements.reference : null;
		}
		if (elements.floating !== void 0) valuesToSync.floatingElement = elements.floating;
		store.update(valuesToSync);
	}, [
		open,
		floatingId,
		elements.reference,
		elements.floating,
		store
	]);
	store.context.onOpenChange = onOpenChange;
	store.context.nested = nested;
	return store;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useListNavigation.mjs
function isStationaryWebKitPointer(event) {
	return webkit && event.movementX === 0 && event.movementY === 0;
}
function doSwitch(orientation, vertical, horizontal) {
	switch (orientation) {
		case "vertical": return vertical;
		case "horizontal": return horizontal;
		default: return vertical || horizontal;
	}
}
function isMainOrientationKey(key, orientation) {
	return doSwitch(orientation, key === "ArrowUp" || key === "ArrowDown", key === "ArrowLeft" || key === "ArrowRight");
}
function isMainOrientationToEndKey(key, orientation, rtl) {
	return doSwitch(orientation, key === "ArrowDown", rtl ? key === "ArrowLeft" : key === "ArrowRight") || key === "Enter" || key === " " || key === "";
}
function isCrossOrientationOpenKey(key, orientation, rtl) {
	return doSwitch(orientation, rtl ? key === ARROW_LEFT$1 : key === ARROW_RIGHT$1, key === ARROW_DOWN$1);
}
function isCrossOrientationCloseKey(key, orientation, rtl, grid) {
	const vertical = rtl ? key === ARROW_RIGHT$1 : key === ARROW_LEFT$1;
	const horizontal = key === ARROW_UP$1;
	if (orientation === "both" || orientation === "horizontal" && grid) return key === "Escape";
	return doSwitch(orientation, vertical, horizontal);
}
/**
* Adds arrow key-based navigation of a list of items, either using real DOM
* focus or virtual focus.
* @see https://floating-ui.com/docs/useListNavigation
*/
function useListNavigation(store, props) {
	const { listRef, activeIndex, onNavigate: onNavigateProp = () => {}, enabled = true, selectedIndex = null, allowEscape = false, loopFocus = false, nested = false, rtl = false, virtual = false, focusItemOnOpen = "auto", focusItemOnHover = true, openOnArrowKeyDown = true, disabledIndices = void 0, orientation = "vertical", triggerOrientation = orientation, parentOrientation, id, resetOnPointerLeave = true, externalTree, nestedReturnFocusRef, grid: navigateGrid } = props;
	const isGrid = navigateGrid != null;
	if (allowEscape) {
		if (!loopFocus) console.warn("`useListNavigation` looping must be enabled to allow escaping.");
		if (!virtual) console.warn("`useListNavigation` must be virtual to allow escaping.");
	}
	if (orientation === "vertical" && isGrid) console.warn("In grid list navigation mode, the `orientation` should", "be either \"horizontal\" or \"both\".");
	const open = store.useState("open");
	const floatingElement = store.useState("floatingElement");
	const domReferenceElement = store.useState("domReferenceElement");
	const dataRef = store.context.dataRef;
	const floatingFocusElement = getFloatingFocusElement(floatingElement);
	const typeableComboboxReference = isTypeableCombobox(domReferenceElement);
	const floatingFocusElementRef = useValueAsRef(floatingFocusElement);
	const parentId = useFloatingParentNodeId();
	const tree = useFloatingTree(externalTree);
	const focusItemOnOpenRef = import__wp_global_react.useRef(focusItemOnOpen);
	const indexRef = import__wp_global_react.useRef(selectedIndex ?? -1);
	const keyRef = import__wp_global_react.useRef(null);
	const isPointerModalityRef = import__wp_global_react.useRef(true);
	const onNavigate = useStableCallback((event) => {
		onNavigateProp(indexRef.current === -1 ? null : indexRef.current, event);
	});
	const previousMountedRef = import__wp_global_react.useRef(!!floatingElement);
	const previousOpenRef = import__wp_global_react.useRef(open);
	const forceSyncFocusRef = import__wp_global_react.useRef(false);
	const forceScrollIntoViewRef = import__wp_global_react.useRef(false);
	const cancelQueuedFocusRef = import__wp_global_react.useRef(null);
	const disabledIndicesRef = useValueAsRef(disabledIndices);
	const latestOpenRef = useValueAsRef(open);
	const selectedIndexRef = useValueAsRef(selectedIndex);
	const resetOnPointerLeaveRef = useValueAsRef(resetOnPointerLeave);
	const focusFrame = useAnimationFrame();
	const waitForListPopulatedFrame = useAnimationFrame();
	const focusItem = useStableCallback(() => {
		focusFrame.cancel();
		function runFocus(item) {
			if (!virtual) cancelQueuedFocusRef.current = enqueueFocus(item, {
				sync: forceSyncFocusRef.current,
				preventScroll: true
			});
		}
		const initialItem = listRef.current[indexRef.current];
		const forceScrollIntoView = forceScrollIntoViewRef.current;
		if (initialItem) runFocus(initialItem);
		(forceSyncFocusRef.current ? (callback) => callback() : (callback) => focusFrame.request(callback))(() => {
			const waitedItem = listRef.current[indexRef.current] || initialItem;
			if (!waitedItem) return;
			if (!initialItem) runFocus(waitedItem);
			if (item && (forceScrollIntoView || !isPointerModalityRef.current)) waitedItem.scrollIntoView?.({
				block: "nearest",
				inline: "nearest"
			});
		});
	});
	useIsoLayoutEffect(() => {
		dataRef.current.orientation = orientation;
	}, [dataRef, orientation]);
	useIsoLayoutEffect(() => {
		if (!open) keyRef.current = null;
		if (!open || focusItemOnOpen !== "auto") focusItemOnOpenRef.current = focusItemOnOpen;
	}, [open, focusItemOnOpen]);
	useIsoLayoutEffect(() => {
		if (!enabled) return;
		if (open && floatingElement) {
			indexRef.current = selectedIndex ?? -1;
			if (focusItemOnOpenRef.current && selectedIndex != null) {
				forceScrollIntoViewRef.current = true;
				onNavigate();
			}
		} else if (previousMountedRef.current) {
			indexRef.current = -1;
			onNavigate();
		}
	}, [
		enabled,
		open,
		floatingElement,
		selectedIndex,
		onNavigate
	]);
	useIsoLayoutEffect(() => {
		if (!enabled) return;
		if (!open) {
			forceSyncFocusRef.current = false;
			return;
		}
		if (!floatingElement) return;
		if (activeIndex == null) {
			forceSyncFocusRef.current = false;
			if (selectedIndexRef.current != null) return;
			if (previousMountedRef.current) {
				indexRef.current = -1;
				focusItem();
			}
			if ((!previousOpenRef.current || !previousMountedRef.current) && focusItemOnOpenRef.current && (keyRef.current != null || focusItemOnOpenRef.current === true && keyRef.current == null)) {
				let runs = 0;
				const waitForListPopulated = () => {
					if (listRef.current[0] == null) {
						if (runs < 2) (runs ? (callback) => waitForListPopulatedFrame.request(callback) : queueMicrotask)(waitForListPopulated);
						runs += 1;
					} else {
						indexRef.current = keyRef.current == null || isMainOrientationToEndKey(keyRef.current, triggerOrientation, rtl) || nested ? getMinListIndex(listRef) : getMaxListIndex(listRef);
						keyRef.current = null;
						onNavigate();
					}
				};
				waitForListPopulated();
			}
		} else if (!isIndexOutOfListBounds(listRef.current, activeIndex)) {
			indexRef.current = activeIndex;
			focusItem();
			forceScrollIntoViewRef.current = false;
		}
	}, [
		enabled,
		open,
		floatingElement,
		activeIndex,
		selectedIndexRef,
		nested,
		listRef,
		triggerOrientation,
		rtl,
		onNavigate,
		focusItem,
		waitForListPopulatedFrame
	]);
	useIsoLayoutEffect(() => {
		if (!enabled || floatingElement || !tree || virtual || !previousMountedRef.current) return;
		const nodes = tree.nodesRef.current;
		const parent = nodes.find((node) => node.id === parentId)?.context?.elements.floating;
		const activeEl = activeElement(ownerDocument(domReferenceElement ?? parent ?? null));
		const treeContainsActiveEl = nodes.some((node) => node.context && contains(node.context.elements.floating, activeEl));
		if (parent && !treeContainsActiveEl && isPointerModalityRef.current) parent.focus({ preventScroll: true });
	}, [
		enabled,
		floatingElement,
		domReferenceElement,
		tree,
		parentId,
		virtual
	]);
	useIsoLayoutEffect(() => {
		previousOpenRef.current = open;
		previousMountedRef.current = !!floatingElement;
	});
	const hasActiveIndex = activeIndex != null;
	const syncCurrentTarget = useStableCallback((event) => {
		if (!latestOpenRef.current) return;
		const index = listRef.current.indexOf(event.currentTarget);
		if (index !== -1 && (indexRef.current !== index || activeIndex !== index)) {
			indexRef.current = index;
			onNavigate(event);
		}
	});
	const getParentOrientation = useStableCallback(() => {
		return parentOrientation ?? tree?.nodesRef.current.find((node) => node.id === parentId)?.context?.dataRef?.current.orientation;
	});
	const getMinEnabledIndex = useStableCallback(() => {
		return getMinListIndex(listRef, disabledIndicesRef.current);
	});
	const commonOnKeyDown = useStableCallback((event) => {
		isPointerModalityRef.current = false;
		forceSyncFocusRef.current = true;
		if (event.which === 229) return;
		if (!latestOpenRef.current && event.currentTarget === floatingFocusElementRef.current) return;
		if (nested && isCrossOrientationCloseKey(event.key, orientation, rtl, isGrid)) {
			if (!isMainOrientationKey(event.key, getParentOrientation())) stopEvent(event);
			store.setOpen(false, createChangeEventDetails(listNavigation, event.nativeEvent));
			const returnElement = nestedReturnFocusRef?.current ?? domReferenceElement;
			if (isHTMLElement(returnElement)) returnElement.focus();
			return;
		}
		if (activeIndex != null && activeIndex !== indexRef.current && !isIndexOutOfListBounds(listRef.current, activeIndex)) indexRef.current = activeIndex;
		const currentIndex = indexRef.current;
		const minIndex = getMinListIndex(listRef, disabledIndices);
		const maxIndex = getMaxListIndex(listRef, disabledIndices);
		if (!typeableComboboxReference) {
			if (event.key === "Home") {
				stopEvent(event);
				indexRef.current = minIndex;
				onNavigate(event);
			}
			if (event.key === "End") {
				stopEvent(event);
				indexRef.current = maxIndex;
				onNavigate(event);
			}
		}
		if (navigateGrid != null) {
			const index = navigateGrid(event, indexRef.current, listRef, orientation, loopFocus, rtl, disabledIndices, minIndex, maxIndex);
			if (index != null && index !== indexRef.current) {
				indexRef.current = index;
				onNavigate(event);
			}
			if (orientation === "both") return;
		}
		if (isMainOrientationKey(event.key, orientation)) {
			stopEvent(event);
			const focusedElement = activeElement(event.currentTarget.ownerDocument);
			if (open && !virtual && contains(event.currentTarget, focusedElement) && !listRef.current.some((item) => item != null && contains(item, focusedElement))) {
				indexRef.current = isMainOrientationToEndKey(event.key, orientation, rtl) ? minIndex : maxIndex;
				onNavigate(event);
				if (activeIndex === indexRef.current) focusItem();
				return;
			}
			const { index, wrapped } = getNextListIndex(listRef.current, currentIndex, {
				decrement: !isMainOrientationToEndKey(event.key, orientation, rtl),
				loopFocus,
				allowEscape,
				disabledIndices,
				minIndex,
				maxIndex
			});
			if (wrapped) forceSyncFocusRef.current = false;
			indexRef.current = index;
			onNavigate(event);
		}
	});
	const item = import__wp_global_react.useMemo(() => {
		return {
			onFocus(event) {
				forceSyncFocusRef.current = true;
				syncCurrentTarget(event);
			},
			onClick({ currentTarget }) {
				if (!virtual) currentTarget.focus({ preventScroll: true });
			},
			onMouseMove(event) {
				if (isStationaryWebKitPointer(event)) return;
				forceSyncFocusRef.current = true;
				forceScrollIntoViewRef.current = false;
				if (focusItemOnHover) syncCurrentTarget(event);
			},
			onPointerLeave(event) {
				if (!latestOpenRef.current || !isPointerModalityRef.current || event.pointerType === "touch") return;
				forceSyncFocusRef.current = true;
				const relatedTarget = event.relatedTarget;
				if (!focusItemOnHover || listRef.current.includes(relatedTarget)) return;
				if (!resetOnPointerLeaveRef.current) return;
				cancelQueuedFocusRef.current?.();
				cancelQueuedFocusRef.current = null;
				indexRef.current = -1;
				onNavigate(event);
				if (!virtual) {
					const floatingFocusEl = floatingFocusElementRef.current;
					const activeEl = activeElement(ownerDocument(floatingFocusEl));
					if (floatingFocusEl && contains(floatingFocusEl, activeEl)) floatingFocusEl.focus({ preventScroll: true });
				}
			}
		};
	}, [
		syncCurrentTarget,
		latestOpenRef,
		floatingFocusElementRef,
		focusItemOnHover,
		listRef,
		onNavigate,
		resetOnPointerLeaveRef,
		virtual
	]);
	const ariaActiveDescendantProp = import__wp_global_react.useMemo(() => {
		return virtual && open && hasActiveIndex && { "aria-activedescendant": `${id}-${activeIndex}` };
	}, [
		virtual,
		open,
		hasActiveIndex,
		id,
		activeIndex
	]);
	const floating = import__wp_global_react.useMemo(() => {
		return {
			...!typeableComboboxReference ? ariaActiveDescendantProp : {},
			onKeyDown(event) {
				if (event.key === "Tab" && event.shiftKey && open && !virtual) {
					const target = getTarget(event.nativeEvent);
					if (target && !contains(floatingFocusElementRef.current, target)) return;
					stopEvent(event);
					const details = createChangeEventDetails(focusOut, event.nativeEvent);
					store.setOpen(false, details);
					const returnElement = nestedReturnFocusRef?.current ?? domReferenceElement;
					if (!details.isCanceled && isHTMLElement(returnElement)) returnElement.focus();
					return;
				}
				commonOnKeyDown(event);
			},
			onPointerMove(event) {
				if (isStationaryWebKitPointer(event)) return;
				isPointerModalityRef.current = true;
			}
		};
	}, [
		ariaActiveDescendantProp,
		commonOnKeyDown,
		floatingFocusElementRef,
		typeableComboboxReference,
		store,
		open,
		virtual,
		domReferenceElement,
		nestedReturnFocusRef
	]);
	const trigger = import__wp_global_react.useMemo(() => {
		function openOnNavigationKeyDown(event) {
			store.setOpen(true, createChangeEventDetails(listNavigation, event.nativeEvent, event.currentTarget));
		}
		function checkVirtualMouse(event) {
			if (focusItemOnOpen === "auto" && isVirtualClick(event.nativeEvent)) focusItemOnOpenRef.current = !virtual;
		}
		function checkVirtualPointer(event) {
			focusItemOnOpenRef.current = focusItemOnOpen;
			if (focusItemOnOpen === "auto" && isVirtualPointerEvent(event.nativeEvent)) focusItemOnOpenRef.current = true;
		}
		return {
			onKeyDown(event) {
				const currentOpen = store.select("open");
				isPointerModalityRef.current = false;
				const isArrowKey = event.key.startsWith("Arrow");
				const isParentCrossOpenKey = isCrossOrientationOpenKey(event.key, getParentOrientation(), rtl);
				const isMainKey = isMainOrientationKey(event.key, currentOpen ? orientation : triggerOrientation);
				const isNavigationKey = (nested ? isParentCrossOpenKey : isMainKey) || event.key === "Enter" || event.key.trim() === "";
				if (virtual && currentOpen && (!nested || isTypeableElement(event.currentTarget))) return commonOnKeyDown(event);
				if (!currentOpen && !openOnArrowKeyDown && isArrowKey) return;
				if (isNavigationKey) {
					const isParentMainKey = isMainOrientationKey(event.key, getParentOrientation());
					keyRef.current = nested && isParentMainKey ? null : event.key;
				}
				if (nested) {
					if (isParentCrossOpenKey) {
						stopEvent(event);
						if (currentOpen) {
							indexRef.current = getMinEnabledIndex();
							onNavigate(event);
							if (virtual) floatingFocusElementRef.current?.focus();
						} else openOnNavigationKeyDown(event);
					}
					return;
				}
				if (isMainKey) {
					if (selectedIndexRef.current != null) indexRef.current = selectedIndexRef.current;
					stopEvent(event);
					if (!currentOpen && openOnArrowKeyDown) openOnNavigationKeyDown(event);
					else commonOnKeyDown(event);
					if (currentOpen) onNavigate(event);
				}
			},
			onFocus(event) {
				if (event.target !== event.currentTarget) return;
				if (store.select("open") && !virtual) {
					indexRef.current = -1;
					onNavigate(event);
				}
			},
			onPointerDown: checkVirtualPointer,
			onPointerEnter: checkVirtualPointer,
			onMouseDown: checkVirtualMouse,
			onClick: checkVirtualMouse
		};
	}, [
		commonOnKeyDown,
		focusItemOnOpen,
		getMinEnabledIndex,
		nested,
		onNavigate,
		store,
		openOnArrowKeyDown,
		orientation,
		triggerOrientation,
		getParentOrientation,
		rtl,
		selectedIndexRef,
		virtual,
		floatingFocusElementRef
	]);
	const reference = import__wp_global_react.useMemo(() => {
		return {
			...ariaActiveDescendantProp,
			...trigger
		};
	}, [ariaActiveDescendantProp, trigger]);
	return import__wp_global_react.useMemo(() => enabled ? {
		reference,
		floating,
		item,
		trigger
	} : {}, [
		enabled,
		reference,
		floating,
		trigger,
		item
	]);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/useTypeahead.mjs
/**
* Provides a matching callback that can be used to focus an item as the user
* types, often used in tandem with `useListNavigation()`.
* @see https://floating-ui.com/docs/useTypeahead
*/
function useTypeahead(store, props) {
	const { listRef, elementsRef, activeIndex, onMatch: onMatchProp, disabledIndices, onTyping: onTypingProp, enabled = true, resetMs = 750, selectedIndex = null } = props;
	const onTyping = useStableCallback(onTypingProp);
	const open = store.useState("open");
	const timeout = useTimeout();
	const stringRef = import__wp_global_react.useRef("");
	const prevIndexRef = import__wp_global_react.useRef(selectedIndex ?? activeIndex ?? -1);
	const matchIndexRef = import__wp_global_react.useRef(null);
	const onKeyDown = useStableCallback((event) => {
		function getElement(index) {
			return elementsRef?.current[index];
		}
		function isItemAvailable(index) {
			const element = getElement(index);
			if (element && !isElementVisible(element) || element?.matches(":disabled")) return false;
			return disabledIndices == null || !isListIndexDisabled(EMPTY_ARRAY$1, index, disabledIndices);
		}
		function getMatchingIndex(list, string, startIndex = 0) {
			if (list.length === 0) return -1;
			const normalizedStartIndex = (startIndex % list.length + list.length) % list.length;
			const lowerString = string.toLowerCase();
			for (let offset = 0; offset < list.length; offset += 1) {
				const index = (normalizedStartIndex + offset) % list.length;
				if (!list[index]?.toLowerCase().startsWith(lowerString) || !isItemAvailable(index)) continue;
				return index;
			}
			return -1;
		}
		const listContent = listRef.current;
		if (stringRef.current.length > 0 && event.key === " ") {
			stopEvent(event);
			onTyping?.(true);
		}
		if (stringRef.current.length > 0 && stringRef.current[0] !== " ") {
			if (getMatchingIndex(listContent, stringRef.current) === -1 && event.key !== " ") onTyping?.(false);
		}
		if (listContent == null || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
		if (open && event.key !== " ") {
			stopEvent(event);
			onTyping?.(true);
		}
		const isNewSession = stringRef.current === "";
		if (isNewSession) prevIndexRef.current = selectedIndex ?? activeIndex ?? -1;
		if (listContent.every((text, index) => text && isItemAvailable(index) ? text[0]?.toLowerCase() !== text[1]?.toLowerCase() : true) && stringRef.current === event.key) {
			stringRef.current = "";
			prevIndexRef.current = matchIndexRef.current;
		}
		stringRef.current += event.key;
		timeout.start(resetMs, () => {
			stringRef.current = "";
			prevIndexRef.current = matchIndexRef.current;
			onTyping?.(false);
		});
		const startIndex = ((isNewSession ? selectedIndex ?? activeIndex ?? -1 : prevIndexRef.current) ?? 0) + 1;
		const index = getMatchingIndex(listContent, stringRef.current, startIndex);
		if (index !== -1) {
			onMatchProp?.(index, event);
			matchIndexRef.current = index;
		} else if (event.key !== " ") {
			stringRef.current = "";
			onTyping?.(false);
		}
	});
	const onBlur = useStableCallback((event) => {
		const next = event.relatedTarget;
		const currentDomReferenceElement = store.select("domReferenceElement");
		const currentFloatingElement = store.select("floatingElement");
		if (contains(currentDomReferenceElement, next) || contains(currentFloatingElement, next)) return;
		timeout.clear();
		stringRef.current = "";
		prevIndexRef.current = matchIndexRef.current;
		onTyping?.(false);
	});
	useIsoLayoutEffect(() => {
		if (!open && selectedIndex !== null) return;
		timeout.clear();
		matchIndexRef.current = null;
		if (stringRef.current !== "") {
			stringRef.current = "";
			onTyping?.(false);
		}
	}, [
		open,
		selectedIndex,
		timeout,
		onTyping
	]);
	const sharedProps = import__wp_global_react.useMemo(() => ({
		onKeyDown,
		onBlur
	}), [onKeyDown, onBlur]);
	return import__wp_global_react.useMemo(() => enabled ? {
		reference: sharedProps,
		floating: sharedProps
	} : {}, [enabled, sharedProps]);
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
			const clampCoord = (axis, coord) => clamp$1(coord + overflow[axis === "y" ? "top" : "left"], coord, coord - overflow[axis === "y" ? "bottom" : "right"]);
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
function getScale$1(element) {
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
			if (isElement(offsetParent)) scale = getScale$1(offsetParent);
		} else scale = getScale$1(element);
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
			const iframeScale = getScale$1(currentIFrame);
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
			scale = getScale$1(offsetParent);
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
	const scale = getScale$1(element);
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
	getScale: getScale$1,
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/composite/composite.mjs
const ARROW_UP = "ArrowUp";
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const HOME = "Home";
const END = "End";
const COMPOSITE_KEYS = /* @__PURE__ */ new Set([
	ARROW_UP,
	ARROW_DOWN,
	ARROW_LEFT,
	ARROW_RIGHT,
	HOME,
	"End"
]);

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/inertValue.mjs
function inertValue(value) {
	if (isReactVersionAtLeast(19)) return value;
	return value ? "true" : void 0;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/InternalBackdrop.mjs
/**
* @internal
*/
const InternalBackdrop = /*#__PURE__*/ import__wp_global_react.forwardRef(function InternalBackdrop(props, ref) {
	const { cutout, ...otherProps } = props;
	let clipPath;
	if (cutout) {
		const rect = cutout.getBoundingClientRect();
		clipPath = `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${rect.left}px ${rect.top}px,${rect.left}px ${rect.bottom}px,${rect.right}px ${rect.bottom}px,${rect.right}px ${rect.top}px,${rect.left}px ${rect.top}px)`;
	}
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", {
		ref,
		role: "presentation",
		"data-base-ui-inert": "",
		...otherProps,
		style: {
			position: "fixed",
			inset: 0,
			userSelect: "none",
			WebkitUserSelect: "none",
			clipPath
		}
	});
});
InternalBackdrop.displayName = "InternalBackdrop";

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useEnhancedClickHandler.mjs
/**
* Provides a cross-browser way to determine the type of the pointer used to click.
* Safari and Firefox do not provide the PointerEvent to the click handler (they use MouseEvent) yet.
* Additionally, this implementation detects if the click was triggered by the keyboard.
*
* @param handler The function to be called when the button is clicked. The first parameter is the original event and the second parameter is the pointer type.
*/
function useEnhancedClickHandler(handler) {
	const lastClickInteractionTypeRef = import__wp_global_react.useRef("");
	const handlePointerDown = import__wp_global_react.useCallback((event) => {
		if (event.defaultPrevented) return;
		lastClickInteractionTypeRef.current = event.pointerType;
		handler(event, event.pointerType);
	}, [handler]);
	return {
		onClick: import__wp_global_react.useCallback((event) => {
			if (event.detail === 0) {
				handler(event, "keyboard");
				return;
			}
			if ("pointerType" in event) handler(event, event.pointerType);
			else handler(event, lastClickInteractionTypeRef.current);
			lastClickInteractionTypeRef.current = "";
		}, [handler]),
		onPointerDown: handlePointerDown
	};
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/useValueChanged.mjs
function useValueChanged(value, onChange) {
	const valueRef = import__wp_global_react.useRef(value);
	const onChangeCallback = useStableCallback(onChange);
	useIsoLayoutEffect(() => {
		if (valueRef.current !== value) onChangeCallback(valueRef.current);
		valueRef.current = value;
	}, [value, onChangeCallback]);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/useOpenInteractionType.mjs
function useOpenMethodTriggerProps(open, setOpenMethod) {
	const handleTriggerClick = useStableCallback((_, interactionType) => {
		if (!(typeof open === "function" ? open() : open)) setOpenMethod(interactionType || (ios ? "touch" : ""));
	});
	const { onClick, onPointerDown } = useEnhancedClickHandler(handleTriggerClick);
	return import__wp_global_react.useMemo(() => ({
		onClick,
		onPointerDown
	}), [onClick, onPointerDown]);
}
/**
* Determines the interaction type (keyboard, mouse, touch, etc.) that opened the component.
*
* @param open The open state of the component.
*/
function useOpenInteractionType(open) {
	const [openMethod, setOpenMethod] = import__wp_global_react.useState(null);
	const triggerProps = useOpenMethodTriggerProps(open, setOpenMethod);
	useValueChanged(open, (previousOpen) => {
		if (previousOpen && !open) setOpenMethod(null);
	});
	return import__wp_global_react.useMemo(() => ({
		openMethod,
		triggerProps
	}), [openMethod, triggerProps]);
}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useOnFirstRender.mjs
function useOnFirstRender(fn) {
	const ref = import__wp_global_react.useRef(true);
	if (ref.current) {
		ref.current = false;
		fn();
	}
}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/areArraysEqual.mjs
/**
* Compares two arrays element-wise.
*
* The default comparison is `Object.is`, so `NaN` equals `NaN` and `0` does not equal `-0`.
*/
function areArraysEqual(array1, array2, itemComparer = Object.is) {
	const { length } = array1;
	if (length !== array2.length) return false;
	for (let i = 0; i < length; i += 1) if (!itemComparer(array1[i], array2[i])) return false;
	return true;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/itemEquality.mjs
const defaultItemEquality = (itemValue, selectedValue) => Object.is(itemValue, selectedValue);
function compareItemEquality(itemValue, selectedValue, comparer) {
	if (itemValue == null || selectedValue == null) return Object.is(itemValue, selectedValue);
	return comparer(itemValue, selectedValue);
}
function isSelectedValueDirty(currentValue, initialValue, comparer) {
	if (Array.isArray(currentValue) && Array.isArray(initialValue)) return !areArraysEqual(currentValue, initialValue, (itemValue, initialItemValue) => compareItemEquality(itemValue, initialItemValue, comparer));
	return currentValue !== initialValue;
}
function selectedValueIncludes(selectedValues, itemValue, comparer) {
	if (!selectedValues) return false;
	return selectedValues.some((selectedValue) => {
		if (selectedValue === void 0) return false;
		return compareItemEquality(itemValue, selectedValue, comparer);
	});
}
function findItemIndex(itemValues, selectedValue, comparer) {
	if (!itemValues) return -1;
	return itemValues.findIndex((itemValue) => {
		if (itemValue === void 0) return false;
		return compareItemEquality(itemValue, selectedValue, comparer);
	});
}
function createSelectionMatcher(selectedValues, comparer) {
	if (comparer !== defaultItemEquality) return (itemValue) => selectedValueIncludes(selectedValues, itemValue, comparer);
	const index = new Set(selectedValues);
	index.delete(void 0);
	return (itemValue) => index.has(itemValue) && (itemValue !== 0 || selectedValues.some((v) => Object.is(itemValue, v)));
}
function findSelectionIndex(itemValues, selectedValue, comparer, multiple) {
	const index = multiple && Array.isArray(selectedValue) ? itemValues.findIndex(createSelectionMatcher(selectedValue, comparer)) : findItemIndex(itemValues, selectedValue, comparer);
	return index === -1 ? null : index;
}
/** Resolves the first selected index as items register or change. */
function resolveSelectedIndex(index, itemValue, registry, selectedValues, comparer, currentIndex) {
	if (selectedValueIncludes(selectedValues, itemValue, comparer)) return currentIndex != null && index > currentIndex && selectedValueIncludes(selectedValues, registry[currentIndex], comparer) ? currentIndex : index;
	return index === currentIndex ? findSelectionIndex(registry, selectedValues, comparer, true) : currentIndex;
}
function removeItem(selectedValues, itemValue, comparer) {
	return selectedValues.filter((selectedValue) => !compareItemEquality(itemValue, selectedValue, comparer));
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/serializeValue.mjs
function serializeValue(value) {
	if (value == null) return "";
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/resolveValueLabel.mjs
function isGroup(item) {
	return typeof item === "object" && item != null && Array.isArray(item.items);
}
function isGroupedItems(items) {
	return isGroup(items?.[0]);
}
function flattenLeafItems(items) {
	return isGroupedItems(items) ? items.flatMap((group) => group.items) : items;
}
/**
* Checks if the items array contains an item with a null value that has a non-null label.
*/
function hasNullItemLabel(items) {
	if (!Array.isArray(items)) return items != null && "null" in items;
	const arrayItems = items;
	if (isGroupedItems(arrayItems)) {
		for (const group of arrayItems) for (const item of group.items) if (item && item.value == null && item.label != null) return true;
		return false;
	}
	for (const item of arrayItems) if (item && item.value == null && item.label != null) return true;
	return false;
}
function stringifyAsLabel(item, itemToStringLabel) {
	if (itemToStringLabel && item != null) return itemToStringLabel(item) ?? "";
	if (item && typeof item === "object") {
		if ("label" in item && item.label != null) return String(item.label);
		if ("value" in item) return String(item.value);
	}
	return serializeValue(item);
}
function stringifyAsValue(item, itemToStringValue) {
	if (itemToStringValue && item != null) return itemToStringValue(item) ?? "";
	if (item && typeof item === "object" && "value" in item && "label" in item) return serializeValue(item.value);
	return serializeValue(item);
}
function resolveSelectedLabel(value, items, itemToStringLabel) {
	function fallback() {
		return stringifyAsLabel(value, itemToStringLabel);
	}
	if (itemToStringLabel && value != null) return itemToStringLabel(value);
	if (value && typeof value === "object" && "label" in value && value.label != null) return value.label;
	if (items && !Array.isArray(items)) return (Object.hasOwn(items, value) ? items[value] : void 0) ?? fallback();
	if (Array.isArray(items)) {
		const flatItems = flattenLeafItems(items);
		if (value == null || typeof value !== "object") {
			const match = flatItems.find((item) => item.value === value);
			if (match && match.label != null) return match.label;
			return fallback();
		}
		if ("value" in value) {
			const match = flatItems.find((item) => item && item.value === value.value);
			if (match && match.label != null) return match.label;
		}
	}
	return fallback();
}
function resolveMultipleLabels(values, items, itemToStringLabel) {
	return values.reduce((acc, value, index) => {
		if (index > 0) acc.push(", ");
		acc.push(/*#__PURE__*/ (0, import_jsx_runtime.jsx)(import__wp_global_react.Fragment, { children: resolveSelectedLabel(value, items, itemToStringLabel) }, index));
		return acc;
	}, []);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/field/control/FieldControlDataAttributes.mjs
/**
* Present when the field is in a valid state.
*/
const valid = "data-valid";
/**
* Present when the field is in an invalid state.
*/
const invalid = "data-invalid";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/field-constants/constants.mjs
const DEFAULT_VALIDITY_STATE = {
	badInput: false,
	customError: false,
	patternMismatch: false,
	rangeOverflow: false,
	rangeUnderflow: false,
	stepMismatch: false,
	tooLong: false,
	tooShort: false,
	typeMismatch: false,
	valid: null,
	valueMissing: false
};
const DEFAULT_FIELD_STATE_ATTRIBUTES = {
	valid: null,
	touched: false,
	dirty: false,
	filled: false,
	focused: false
};
const DEFAULT_FIELD_ROOT_STATE = {
	disabled: false,
	...DEFAULT_FIELD_STATE_ATTRIBUTES
};
const fieldValidityMapping = { valid(value) {
	if (value === null) return null;
	if (value) return { [valid]: "" };
	return { [invalid]: "" };
} };

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/field-root-context/FieldRootContext.mjs
const DEFAULT_FIELD_ROOT_CONTEXT = {
	invalid: void 0,
	name: void 0,
	validityData: {
		state: DEFAULT_VALIDITY_STATE,
		errors: [],
		error: "",
		value: "",
		initialValue: null
	},
	setValidityData: NOOP,
	disabled: void 0,
	setTouched: NOOP,
	setDirty: NOOP,
	setFilled: NOOP,
	setFocused: NOOP,
	focusOwnerRef: { current: void 0 },
	validationMode: "onSubmit",
	shouldValidateOnChange: () => false,
	state: DEFAULT_FIELD_ROOT_STATE,
	registerFieldControl: NOOP,
	validation: {
		getValidationProps: (_disabled, props = EMPTY_OBJECT) => props,
		inputRef: { current: null },
		registeredInputs: /* @__PURE__ */ new Map(),
		registerInput: NOOP,
		getInputControl: () => null,
		commit: async () => {},
		change: NOOP
	}
};
const FieldRootContext = /*#__PURE__*/ import__wp_global_react.createContext(DEFAULT_FIELD_ROOT_CONTEXT);
FieldRootContext.displayName = "FieldRootContext";
function useFieldRootContext(optional = true) {
	const context = import__wp_global_react.useContext(FieldRootContext);
	if (context.setValidityData === NOOP && !optional) throw new Error("Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>.");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/field-register-control/useRegisterFieldControl.mjs
function useRegisterFieldControl(controlRef, id, value, getFormValueOverride, enabled = true, name) {
	const { registerFieldControl } = useFieldRootContext();
	const sourceRef = useRefWithInit(() => Symbol());
	useIsoLayoutEffect(() => {
		const source = sourceRef.current;
		if (!enabled) {
			registerFieldControl(source, void 0);
			return;
		}
		registerFieldControl(source, {
			controlRef,
			getValue: getFormValueOverride,
			id,
			name,
			value
		});
	}, [
		controlRef,
		enabled,
		getFormValueOverride,
		id,
		name,
		registerFieldControl,
		sourceRef,
		value
	]);
	useIsoLayoutEffect(() => {
		const source = sourceRef.current;
		return () => {
			registerFieldControl(source, void 0);
		};
	}, [registerFieldControl, sourceRef]);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/form-context/FormContext.mjs
const FormContext = /*#__PURE__*/ import__wp_global_react.createContext({
	elementRef: { current: null },
	formRef: { current: { fields: /* @__PURE__ */ new Map() } },
	errors: {},
	clearErrors: NOOP,
	validationMode: "onSubmit",
	submitCountRef: { current: 0 }
});
FormContext.displayName = "FormContext";
function useFormContext() {
	return import__wp_global_react.useContext(FormContext);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/labelable-provider/LabelableContext.mjs
/**
* A context for providing [labelable elements](https://html.spec.whatwg.org/multipage/forms.html#category-label)\
* with an accessible name (label) and description.
*/
const LabelableContext = /*#__PURE__*/ import__wp_global_react.createContext({
	controlId: void 0,
	registerControlId: NOOP,
	resetControlId: NOOP,
	labelId: void 0,
	setLabelId: NOOP,
	messageIds: [],
	setMessageIds: NOOP,
	getDescriptionProps: (externalProps) => externalProps
});
LabelableContext.displayName = "LabelableContext";
function useLabelableContext() {
	return import__wp_global_react.useContext(LabelableContext);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/labelable-provider/useLabelableId.mjs
function useLabelableId(params = {}) {
	const { id, enabled = true } = params;
	const { controlId, registerControlId, resetControlId } = useLabelableContext();
	const defaultId = useBaseUiId();
	const controlSourceRef = useRefWithInit(() => Symbol());
	const hasRegisteredRef = import__wp_global_react.useRef(false);
	const hadExplicitIdRef = import__wp_global_react.useRef(false);
	const unregisterControlId = useStableCallback(() => {
		if (!hasRegisteredRef.current || registerControlId === NOOP) return;
		hasRegisteredRef.current = false;
		registerControlId(controlSourceRef.current, void 0);
	});
	useIsoLayoutEffect(() => {
		if (!enabled || registerControlId === NOOP) {
			unregisterControlId();
			return;
		}
		let nextId;
		if (id !== void 0) {
			hadExplicitIdRef.current = true;
			nextId = id;
		} else if (hadExplicitIdRef.current) nextId = defaultId;
		else {
			resetControlId();
			return;
		}
		if (nextId === void 0) {
			unregisterControlId();
			return;
		}
		hasRegisteredRef.current = true;
		registerControlId(controlSourceRef.current, nextId);
	}, [
		id,
		enabled,
		registerControlId,
		resetControlId,
		defaultId,
		controlSourceRef,
		unregisterControlId
	]);
	useIsoLayoutEffect(() => {
		return unregisterControlId;
	}, [unregisterControlId]);
	return (enabled ? controlId : void 0) ?? id ?? defaultId;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/direction-context/DirectionContext.mjs
const DirectionContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
DirectionContext.displayName = "DirectionContext";
function useDirection() {
	return import__wp_global_react.useContext(DirectionContext)?.direction ?? "ltr";
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/field-root-context/useSetFieldFocused.mjs
/**
* Returns the field's `setFocused`, recording which control the focused state belongs to.
*
* Disabling or unmounting a focused control moves focus away without firing `blur`, so the focused
* state would otherwise stay latched. A field can have several focus targets, so a control only
* clears the shared state when focus last landed on itself. The stable callback doubles as that
* identity.
*/
function useSetFieldFocused(disabled, focusTargetRef, onFocusedChange) {
	const { setFocused, focusOwnerRef } = useFieldRootContext();
	const setFieldFocused = useStableCallback((focused) => {
		if (focused ? !disabled : focusOwnerRef.current === setFieldFocused) {
			focusOwnerRef.current = focused && setFieldFocused;
			onFocusedChange?.(focused);
			setFocused(focused);
		}
	});
	useIsoLayoutEffect(() => {
		const el = focusTargetRef.current;
		if ((el?.getRootNode())?.activeElement === el) setFieldFocused(true);
		return () => setFieldFocused(false);
	}, [
		disabled,
		focusTargetRef,
		setFieldFocused
	]);
	return setFieldFocused;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/getPseudoElementBounds.mjs
const BOUNDARY_OFFSET = 5;
/**
* Determines if a mouse event occurred within the bounds of an element
* (including its pseudo-elements), with a small tolerance for pointer drift.
*/
function isMouseWithinBounds(event, element) {
	const bounds = getPseudoElementBounds(element);
	return event.clientX >= bounds.left - BOUNDARY_OFFSET && event.clientX <= bounds.right + BOUNDARY_OFFSET && event.clientY >= bounds.top - BOUNDARY_OFFSET && event.clientY <= bounds.bottom + BOUNDARY_OFFSET;
}
function getPseudoElementBounds(element) {
	const elementRect = element.getBoundingClientRect();
	const win = getWindow(element);
	if (jsdom) return elementRect;
	const beforeStyles = win.getComputedStyle(element, "::before");
	const afterStyles = win.getComputedStyle(element, "::after");
	if (!(beforeStyles.content !== "none" || afterStyles.content !== "none")) return elementRect;
	const beforeWidth = parseFloat(beforeStyles.width) || 0;
	const beforeHeight = parseFloat(beforeStyles.height) || 0;
	const afterWidth = parseFloat(afterStyles.width) || 0;
	const afterHeight = parseFloat(afterStyles.height) || 0;
	const totalWidth = Math.max(elementRect.width, beforeWidth, afterWidth);
	const totalHeight = Math.max(elementRect.height, beforeHeight, afterHeight);
	const widthDiff = totalWidth - elementRect.width;
	const heightDiff = totalHeight - elementRect.height;
	return {
		left: elementRect.left - widthDiff / 2,
		right: elementRect.right + widthDiff / 2,
		top: elementRect.top - heightDiff / 2,
		bottom: elementRect.bottom + heightDiff / 2
	};
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/resolveAriaLabelledBy.mjs
function resolveAriaLabelledBy(fieldLabelId, localLabelId) {
	return fieldLabelId ?? localLabelId;
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
		const offset = clamp$1(min, center, max);
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
const transformOrigin$1 = "--transform-origin";

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
			floating.style.setProperty(transformOrigin$1, isVertical ? `${crossOrigin} ${sideOrigin}` : `${sideOrigin} ${crossOrigin}`);
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/useAnchoredPopupScrollLock.mjs
const VIEWPORT_WIDTH_TOLERANCE_PX = 20;
/**
* Manages scroll lock for anchored popups. For non-touch opens, scroll lock is applied when
* enabled. For touch opens, scroll lock is applied only when the positioner width is effectively
* viewport-sized.
*/
function useAnchoredPopupScrollLock(enabled, touchOpen, positionerElement, referenceElement) {
	const [touchOpenShouldLockScroll, setTouchOpenShouldLockScroll] = import__wp_global_react.useState(false);
	useIsoLayoutEffect(() => {
		if (!enabled || !touchOpen || positionerElement == null) {
			setTouchOpenShouldLockScroll(false);
			return;
		}
		const viewportWidth = ownerDocument(positionerElement).documentElement.clientWidth;
		const popupWidth = positionerElement.offsetWidth;
		setTouchOpenShouldLockScroll(viewportWidth > 0 && popupWidth > 0 && popupWidth >= viewportWidth - VIEWPORT_WIDTH_TOLERANCE_PX);
	}, [
		enabled,
		touchOpen,
		positionerElement
	]);
	useScrollLock(enabled && (!touchOpen || touchOpenShouldLockScroll), referenceElement);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/listbox-separator/ListboxSeparator.mjs
/**
* A visual separator between items.
* Renders a `<div>` element.
*
* @internal
*/
const ListboxSeparator = /*#__PURE__*/ import__wp_global_react.forwardRef(function ListboxSeparator(componentProps, forwardedRef) {
	const { className, render, orientation = "horizontal", style, ...elementProps } = componentProps;
	return useRenderElement("div", componentProps, {
		state: { orientation },
		ref: forwardedRef,
		props: [{ role: "presentation" }, elementProps]
	});
});
ListboxSeparator.displayName = "ListboxSeparator";

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/getDefaultFormSubmitter.mjs
/**
* Returns the default button a browser uses for implicit form submission.
*
* This is useful for custom form controls that need to mirror native Enter key behavior.
* Clicking the returned submitter preserves browser semantics such as the submitter's click
* event, `SubmitEvent.submitter`, and submitter-specific attributes.
*
* The function follows the controls exposed by `form.elements`, which includes controls associated
* through the `form` attribute. Disabled submitters can be returned because the default button is
* determined before disabled state is considered; clicking a disabled submitter is a no-op.
*/
function getDefaultFormSubmitter(form) {
	if (!form) return null;
	for (const candidate of form.elements) {
		const tagName = candidate.tagName;
		if (tagName === "BUTTON" || tagName === "INPUT") {
			const button = candidate;
			if (button.type === "submit") return button;
		}
	}
	return null;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/checkbox/root/CheckboxRootDataAttributes.mjs
/**
* Present when the checkbox is checked.
*/
const checked = "data-checked";
/**
* Present when the checkbox is not checked.
*/
const unchecked = "data-unchecked";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/checkbox/utils/getCheckboxStateAttributesMapping.mjs
function getCheckboxStateAttributesMapping(state) {
	return {
		checked(value) {
			if (state.indeterminate) return {};
			if (value) return { [checked]: "" };
			return { [unchecked]: "" };
		},
		...fieldValidityMapping
	};
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/field/item/FieldItemContext.mjs
const FieldItemContext = /*#__PURE__*/ import__wp_global_react.createContext({ disabled: false });
FieldItemContext.displayName = "FieldItemContext";
function useFieldItemContext() {
	return import__wp_global_react.useContext(FieldItemContext);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/labelable-provider/useAriaLabelledBy.mjs
function useAriaLabelledBy(explicitAriaLabelledBy, labelId, labelSourceRef, enableFallback = true, labelSourceId, ariaLabel) {
	const [fallbackAriaLabelledBy, setFallbackAriaLabelledBy] = import__wp_global_react.useState();
	const generatedLabelId = useBaseUiId(labelSourceId ? `${labelSourceId}-label` : void 0);
	const hasAriaLabel = Boolean(ariaLabel?.trim());
	const ariaLabelledBy = explicitAriaLabelledBy ?? (hasAriaLabel ? void 0 : labelId) ?? fallbackAriaLabelledBy;
	useIsoLayoutEffect(() => {
		const nextAriaLabelledBy = explicitAriaLabelledBy || labelId || hasAriaLabel || !enableFallback ? void 0 : getAriaLabelledBy(labelSourceRef.current, generatedLabelId);
		if (fallbackAriaLabelledBy !== nextAriaLabelledBy) setFallbackAriaLabelledBy(nextAriaLabelledBy);
	});
	return ariaLabelledBy;
}
function getAriaLabelledBy(labelSource, generatedLabelId) {
	const label = findAssociatedLabel(labelSource);
	if (!label) return;
	if (!label.id && generatedLabelId) label.id = generatedLabelId;
	return label.id || void 0;
}
function findAssociatedLabel(labelSource) {
	if (!labelSource) return;
	const parent = labelSource.parentElement;
	if (parent && parent.tagName === "LABEL") return parent;
	const controlId = labelSource.id;
	if (controlId) {
		const nextSibling = labelSource.nextElementSibling;
		if (nextSibling && nextSibling.htmlFor === controlId) return nextSibling;
	}
	const labels = labelSource.labels;
	return labels && labels[0];
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/checkbox-group/CheckboxGroupContext.mjs
const CheckboxGroupContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
CheckboxGroupContext.displayName = "CheckboxGroupContext";
function useCheckboxGroupContext() {
	return import__wp_global_react.useContext(CheckboxGroupContext);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/checkbox/root/CheckboxRootContext.mjs
const CheckboxRootContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
CheckboxRootContext.displayName = "CheckboxRootContext";
function useCheckboxRootContext() {
	const context = import__wp_global_react.useContext(CheckboxRootContext);
	if (context === void 0) throw new Error("Base UI: CheckboxRootContext is missing. Checkbox parts must be placed within <Checkbox.Root>.");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/checkbox/root/CheckboxRoot.mjs
const PARENT_CHECKBOX = "data-parent";
/**
* Represents the checkbox itself.
* Renders a `<span>` element and a hidden `<input>` beside.
*
* Documentation: [Base UI Checkbox](https://base-ui.com/react/components/checkbox)
*/
const CheckboxRoot = /*#__PURE__*/ import__wp_global_react.forwardRef(function CheckboxRoot(componentProps, forwardedRef) {
	const { checked: checkedProp, className, defaultChecked = false, "aria-labelledby": ariaLabelledByProp, disabled: disabledProp = false, form, id: idProp, indeterminate = false, inputRef: inputRefProp, name: nameProp, onCheckedChange, parent = false, readOnly = false, render, required = false, uncheckedValue, value: valueProp, nativeButton = false, style, ...elementProps } = componentProps;
	const { clearErrors } = useFormContext();
	const { disabled: rootDisabled, name: fieldName, setDirty, setFilled, setTouched, state: fieldState, validationMode, validityData, validation: localValidation } = useFieldRootContext();
	const fieldItemContext = useFieldItemContext();
	const { labelId, registerControlId, getDescriptionProps } = useLabelableContext();
	const groupContext = useCheckboxGroupContext();
	const parentContext = groupContext?.allValues === void 0 ? void 0 : groupContext.parent;
	const isGroupedWithParent = parentContext !== void 0;
	const disabled = rootDisabled || fieldItemContext.disabled || groupContext?.disabled || disabledProp;
	const name = fieldName ?? nameProp;
	const value = valueProp ?? name;
	const id = useBaseUiId();
	const ownsControlId = groupContext?.registerControlId !== registerControlId;
	const controlId = useLabelableId({
		id: idProp || void 0,
		enabled: ownsControlId
	});
	const rootId = nativeButton ? controlId : id;
	let groupProps = {};
	if (isGroupedWithParent) {
		if (parent) groupProps = parentContext.getParentProps();
		else if (value !== void 0) groupProps = parentContext.getChildProps(value);
	}
	const { checked: groupChecked = checkedProp, indeterminate: groupIndeterminate = indeterminate, onCheckedChange: groupOnChange, ...otherGroupProps } = groupProps;
	const groupValue = groupContext?.value;
	const controlRef = import__wp_global_react.useRef(null);
	const setFocused = useSetFieldFocused(disabled, controlRef);
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		native: nativeButton
	});
	const validation = groupContext?.validation ?? localValidation;
	const [checked, setCheckedState] = useControlled({
		controlled: value !== void 0 && groupValue !== void 0 && !parent ? groupValue.includes(value) : groupChecked,
		default: defaultChecked,
		name: "Checkbox",
		state: "checked"
	});
	const computedChecked = isGroupedWithParent ? Boolean(groupChecked) : checked;
	const computedIndeterminate = isGroupedWithParent ? groupIndeterminate || indeterminate : indeterminate;
	useRegisterFieldControl(controlRef, id, checked, void 0, !groupContext && !disabled, nameProp);
	const registerChildId = parentContext?.registerChildId;
	const inputRef = import__wp_global_react.useRef(null);
	const registerFieldInput = validation.registerInput;
	const registeredInputValue = groupContext ? value : void 0;
	const registerInput = import__wp_global_react.useCallback((element) => registerFieldInput(element, {
		controlRef,
		value: registeredInputValue
	}), [registerFieldInput, registeredInputValue]);
	const mergedInputRef = useMergedRefs(inputRefProp, inputRef, parent ? void 0 : registerInput);
	const ariaLabelledBy = useAriaLabelledBy(ariaLabelledByProp, labelId, inputRef, !nativeButton, controlId, elementProps["aria-label"]);
	useIsoLayoutEffect(() => {
		if (inputRef.current) inputRef.current.indeterminate = computedIndeterminate;
		if (!groupContext) setFilled(checked);
	}, [
		checked,
		computedIndeterminate,
		groupContext,
		setFilled
	]);
	useValueChanged(checked, () => {
		if (groupContext) return;
		clearErrors(name);
		setDirty(checked !== validityData.initialValue);
		validation.change(checked);
	});
	const inputProps = mergeProps({
		checked,
		disabled,
		form,
		name: parent ? void 0 : name,
		id: nativeButton ? void 0 : controlId,
		required,
		ref: mergedInputRef,
		style: name ? visuallyHiddenInput : visuallyHidden,
		tabIndex: -1,
		type: "checkbox",
		"aria-hidden": true,
		onChange(event) {
			if (event.nativeEvent.defaultPrevented) return;
			if (readOnly) {
				event.preventDefault();
				return;
			}
			const nextChecked = event.currentTarget.checked;
			const details = createChangeEventDetails(none, event.nativeEvent);
			onCheckedChange?.(nextChecked, details);
			if (details.isCanceled) return;
			groupOnChange?.(nextChecked, details);
			if (details.isCanceled) return;
			setCheckedState(nextChecked);
			if (value !== void 0 && groupContext !== void 0 && !parent && !isGroupedWithParent) {
				const nextGroupValue = nextChecked ? [...groupContext.value, value] : groupContext.value.filter((item) => item !== value);
				groupContext.setValue(nextGroupValue, details);
			}
		},
		onClick(event) {
			event.stopPropagation();
		},
		onFocus() {
			controlRef.current?.focus();
		}
	}, valueProp !== void 0 ? { value: (groupContext ? checked && valueProp : valueProp) || "" } : EMPTY_OBJECT, getDescriptionProps, (props) => validation.getValidationProps(disabled, props));
	import__wp_global_react.useEffect(() => {
		if (!parentContext || value === void 0) return;
		const disabledStates = parentContext.disabledStatesRef.current;
		disabledStates.set(value, disabled);
		return () => {
			disabledStates.delete(value);
		};
	}, [
		parentContext,
		disabled,
		value
	]);
	const state = import__wp_global_react.useMemo(() => ({
		...fieldState,
		checked: computedChecked,
		disabled,
		readOnly,
		required,
		indeterminate: computedIndeterminate
	}), [
		fieldState,
		computedChecked,
		disabled,
		readOnly,
		required,
		computedIndeterminate
	]);
	const stateAttributesMapping = getCheckboxStateAttributesMapping(state);
	const element = useRenderElement("span", componentProps, {
		state,
		ref: [
			buttonRef,
			controlRef,
			forwardedRef
		],
		props: [
			{
				id: rootId,
				role: "checkbox",
				"aria-checked": computedIndeterminate ? "mixed" : computedChecked,
				"aria-readonly": readOnly || void 0,
				"aria-required": required || void 0,
				"aria-labelledby": ariaLabelledBy,
				[PARENT_CHECKBOX]: parent ? "" : void 0,
				onFocus() {
					setFocused(true);
				},
				onBlur() {
					const inputEl = inputRef.current;
					if (!inputEl) return;
					setTouched(true);
					setFocused(false);
					if (validationMode === "onBlur") validation.commit(groupContext ? groupValue : inputEl.checked);
				},
				onKeyDown(event) {
					if (event.key !== "Enter") return;
					event.preventBaseUIHandler();
					if (event.defaultPrevented) return;
					const formToSubmit = inputRef.current?.form ?? null;
					const currentTarget = event.currentTarget;
					const nativeEvent = event.nativeEvent;
					const originalPreventDefault = event.preventDefault;
					const originalNativePreventDefault = nativeEvent.preventDefault;
					let preventDefaultCalledAfterPropagation = false;
					event.preventDefault = () => {
						preventDefaultCalledAfterPropagation = true;
						originalPreventDefault.call(event);
					};
					nativeEvent.preventDefault = () => {
						preventDefaultCalledAfterPropagation = true;
						originalNativePreventDefault.call(nativeEvent);
					};
					originalNativePreventDefault.call(nativeEvent);
					getWindow(currentTarget).queueMicrotask(() => {
						event.preventDefault = originalPreventDefault;
						nativeEvent.preventDefault = originalNativePreventDefault;
						if (!preventDefaultCalledAfterPropagation) getDefaultFormSubmitter(formToSubmit)?.click();
					});
				},
				onClick(event) {
					if (readOnly || disabled) return;
					event.preventDefault();
					const input = inputRef.current;
					if (!input) return;
					dispatchClickWithModifiers(input, event);
				}
			},
			elementProps,
			otherGroupProps,
			getButtonProps,
			getDescriptionProps,
			(props) => validation.getValidationProps(disabled, props)
		],
		stateAttributesMapping
	});
	const renderedId = element.props.id;
	useIsoLayoutEffect(() => {
		if (!registerChildId || parent || value === void 0 || renderedId === void 0) return;
		return registerChildId(value, renderedId);
	}, [
		registerChildId,
		parent,
		value,
		renderedId
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(CheckboxRootContext.Provider, {
		value: state,
		children: [
			element,
			!checked && !groupContext && name && !parent && uncheckedValue !== void 0 && /*#__PURE__*/ (0, import_jsx_runtime.jsx)("input", {
				type: "hidden",
				form,
				name,
				value: uncheckedValue,
				disabled
			}),
			/*#__PURE__*/ (0, import_jsx_runtime.jsx)("input", {
				...inputProps,
				suppressHydrationWarning: true
			})
		]
	});
});
CheckboxRoot.displayName = "CheckboxRoot";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/checkbox/indicator/CheckboxIndicator.mjs
/**
* Indicates whether the checkbox is ticked.
* Renders a `<span>` element.
*
* Documentation: [Base UI Checkbox](https://base-ui.com/react/components/checkbox)
*/
const CheckboxIndicator = /*#__PURE__*/ import__wp_global_react.forwardRef(function CheckboxIndicator(componentProps, forwardedRef) {
	const { render, className, style, keepMounted = false, ...elementProps } = componentProps;
	const rootState = useCheckboxRootContext();
	const rendered = rootState.checked || rootState.indeterminate;
	const { mounted, transitionStatus, setMounted } = useTransitionStatus(rendered);
	const indicatorRef = import__wp_global_react.useRef(null);
	const state = {
		...rootState,
		transitionStatus
	};
	useOpenChangeComplete({
		batch: true,
		enabled: !rendered,
		open: rendered,
		ref: indicatorRef,
		onComplete() {
			if (!rendered) setMounted(false);
		}
	});
	const stateAttributesMapping = {
		...getCheckboxStateAttributesMapping(rootState),
		...transitionStatusMapping
	};
	const shouldRender = keepMounted || mounted;
	const element = useRenderElement("span", componentProps, {
		ref: [forwardedRef, indicatorRef],
		state,
		stateAttributesMapping,
		props: elementProps
	});
	if (!shouldRender) return null;
	return element;
});
CheckboxIndicator.displayName = "CheckboxIndicator";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/field/utils/getCombinedFieldValidityData.mjs
/**
* Combines the field's client-side, stateful validity data with the external invalid state to
* determine the field's true validity.
*/
function getCombinedFieldValidityData(validityData, invalid) {
	return {
		...validityData,
		state: {
			...validityData.state,
			valid: !invalid && validityData.state.valid
		}
	};
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/field/root/useFieldValidation.mjs
const validityKeys = Object.keys(DEFAULT_VALIDITY_STATE);
/**
* Whether an input participates in the surrounding Base UI Form. Inputs that are effectively
* disabled, or whose `form` attribute explicitly associates them with another form, are excluded.
* DOM position only matters when it associates the input with a different form. Otherwise, field
* registration is context-driven, so portaled inputs (for example inside a dialog) still belong to
* the form for both validation and values projected into `onFormSubmit`.
*/
function isEligibleInput(input, formElement) {
	if (input.matches(":disabled")) return false;
	if (!formElement || input.form === formElement) return true;
	return input.form === null && !input.hasAttribute("form");
}
/**
* Picks the input whose native validity should represent a field that owns several inputs (such as a
* checkbox or radio group). Prefers the first eligible currently-invalid input, where "first" follows
* registration order (mount order), and otherwise returns the first eligible input.
*/
function findRepresentativeInput(inputs, formElement) {
	let fallback = null;
	for (const input of inputs.keys()) {
		if (!isEligibleInput(input, formElement)) continue;
		if (!input.validity.valid) return input;
		fallback ??= input;
	}
	return fallback;
}
function makeState(customError) {
	return {
		...DEFAULT_VALIDITY_STATE,
		valid: !customError,
		customError
	};
}
function getNativeErrors(element) {
	return element && element.validationMessage ? [element.validationMessage] : [];
}
function useFieldValidation(params) {
	const { elementRef, formRef } = useFormContext();
	const { setValidityData, validate, validityData, validationDebounceTime, invalid, markedDirtyRef, state, shouldValidateOnChange, validationMode, registeredFieldIdRef } = params;
	const { controlId, getDescriptionProps } = useLabelableContext();
	const timeout = useTimeout();
	const inputRef = import__wp_global_react.useRef(null);
	const registeredInputs = useRefWithInit(() => /* @__PURE__ */ new Map()).current;
	const validationCommitIdRef = import__wp_global_react.useRef(0);
	const customValidityRef = import__wp_global_react.useRef(null);
	const registerInput = import__wp_global_react.useCallback((element, registration) => {
		registeredInputs.set(element, registration);
		return () => {
			registeredInputs.delete(element);
		};
	}, [registeredInputs]);
	const getInputControl = useStableCallback(() => {
		const element = findRepresentativeInput(registeredInputs, elementRef.current);
		return element && registeredInputs.get(element)?.controlRef.current || null;
	});
	const commit = useStableCallback(async (value, revalidate = false) => {
		validationCommitIdRef.current += 1;
		const validationCommitId = validationCommitIdRef.current;
		function updateRegisteredFieldValidity(nextValidityData, externalInvalid = invalid) {
			const fieldId = registeredFieldIdRef.current ?? controlId;
			if (fieldId == null) return;
			const currentFieldData = formRef.current.fields.get(fieldId);
			if (!currentFieldData) return;
			const validityDataWithFormErrors = getCombinedFieldValidityData(nextValidityData, externalInvalid);
			formRef.current.fields.set(fieldId, {
				...currentFieldData,
				validityData: validityDataWithFormErrors
			});
		}
		function makeValidityData(validityState, errorMessages) {
			const errors = validityState.valid === false ? errorMessages : [];
			return {
				value,
				state: validityState,
				error: errors[0] ?? "",
				errors,
				initialValue: validityData.initialValue
			};
		}
		function setCustomValidity(element, message) {
			const displaced = element.validity.customError ? element.validationMessage : "";
			const ownedMessage = message.replace(/\r\n?/g, "\n");
			element.setCustomValidity(ownedMessage);
			customValidityRef.current = [
				element,
				ownedMessage,
				displaced
			];
		}
		function clearCustomValidity() {
			const record = customValidityRef.current;
			customValidityRef.current = null;
			if (record && (!record[0].willValidate || record[0].validationMessage === record[1])) record[0].setCustomValidity(record[2]);
		}
		function publish(validityState, errorMessages, externalInvalid) {
			const nextValidityData = makeValidityData(validityState, errorMessages);
			updateRegisteredFieldValidity(nextValidityData, externalInvalid);
			setValidityData(nextValidityData);
		}
		function getState(el) {
			const computedState = validityKeys.reduce((acc, key) => {
				acc[key] = el.validity[key];
				return acc;
			}, {});
			let hasOnlyValueMissingError = false;
			for (const key of validityKeys) {
				if (key === "valid") continue;
				if (key === "valueMissing" && computedState[key]) hasOnlyValueMissingError = true;
				else if (computedState[key]) return computedState;
			}
			if (hasOnlyValueMissingError && !markedDirtyRef.current) {
				computedState.valid = true;
				computedState.valueMissing = false;
			}
			return computedState;
		}
		function resolveRepresentativeInput() {
			return registeredInputs.size > 0 ? findRepresentativeInput(registeredInputs, elementRef.current) : inputRef.current;
		}
		let element = resolveRepresentativeInput();
		function refreshState() {
			element = resolveRepresentativeInput();
			return element?.willValidate ? getState(element) : makeState(false);
		}
		if (revalidate) {
			if (state.valid !== false || !element) return;
			if (!element.validity.valueMissing) {
				clearCustomValidity();
				const currentElement = resolveRepresentativeInput();
				const foreign = currentElement?.validity.customError ? getNativeErrors(currentElement) : [];
				publish(makeState(foreign.length > 0), foreign, false);
				return;
			}
			for (const key of validityKeys) if (key !== "valid" && key !== "valueMissing" && key !== "customError" && element.validity[key]) return;
		}
		timeout.clear();
		clearCustomValidity();
		let nextState = refreshState();
		let validationErrors = getNativeErrors(element);
		const isValidatingOnChange = shouldValidateOnChange();
		if (validationErrors.length === 0 || isValidatingOnChange) {
			const formValues = Array.from(formRef.current.fields.values()).reduce((acc, field) => {
				if (field.name) acc[field.name] = field.getValue();
				return acc;
			}, {});
			const resultOrPromise = validate(value, formValues);
			let result;
			if (typeof resultOrPromise === "object" && resultOrPromise !== null && "then" in resultOrPromise) {
				if (nextState.valid === false) publish(nextState, validationErrors);
				else if (validationMode === "onSubmit" || !validityData.state.customError) {
					nextState.valid = null;
					publish(nextState, validationErrors);
				}
				result = await resultOrPromise;
				if (validationCommitId !== validationCommitIdRef.current) return;
				nextState = refreshState();
			} else result = resultOrPromise;
			validationErrors = result ? [].concat(result).filter(Boolean) : [];
			if (validationErrors.length > 0) {
				nextState.valid = false;
				nextState.customError = true;
				if (element?.willValidate) setCustomValidity(element, validationErrors.join("\n"));
			} else validationErrors = getNativeErrors(element);
		}
		publish(nextState, validationErrors);
	});
	const change = useStableCallback((value, cancelPending = false) => {
		timeout.clear();
		validationCommitIdRef.current += 1;
		if (cancelPending) return;
		const validateOnChange = shouldValidateOnChange();
		if (validateOnChange && value !== "" && validationDebounceTime) timeout.start(validationDebounceTime, () => {
			commit(value);
		});
		else commit(value, !validateOnChange);
	});
	const getValidationProps = import__wp_global_react.useCallback((disabled, externalProps = {}) => mergeProps(getDescriptionProps(externalProps), state.valid === false && !state.disabled && !disabled ? { "aria-invalid": true } : EMPTY_OBJECT), [
		getDescriptionProps,
		state.disabled,
		state.valid
	]);
	return import__wp_global_react.useMemo(() => ({
		getValidationProps,
		inputRef,
		registeredInputs,
		registerInput,
		getInputControl,
		commit,
		change
	}), [
		getValidationProps,
		registeredInputs,
		registerInput,
		getInputControl,
		commit,
		change
	]);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/useRegisteredLabelId.mjs
function useRegisteredLabelId(idProp, setLabelId) {
	const id = useBaseUiId(idProp);
	useIsoLayoutEffect(() => {
		setLabelId(id);
		return () => {
			setLabelId((currentId) => currentId === id ? void 0 : currentId);
		};
	}, [id, setLabelId]);
	return id;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/labelable-provider/useLabel.mjs
function useLabel(params = {}) {
	const { id: idProp, fallbackControlId, native = false, setLabelId: setLabelIdProp, focusControl: focusControlProp } = params;
	const { controlId: contextControlId, setLabelId: setContextLabelId } = useLabelableContext();
	const syncLabelId = useStableCallback((nextLabelId) => {
		setContextLabelId(nextLabelId);
		setLabelIdProp?.(nextLabelId);
	});
	const id = useRegisteredLabelId(idProp, syncLabelId);
	const resolvedControlId = contextControlId ?? fallbackControlId;
	function focusControl(event) {
		if (focusControlProp) {
			focusControlProp(event, resolvedControlId);
			return;
		}
		if (!resolvedControlId) return;
		const controlElement = getControlById(event.currentTarget, resolvedControlId);
		if (isHTMLElement(controlElement)) focusElementWithVisible(controlElement);
	}
	function handleInteraction(event) {
		const target = getTarget(event.nativeEvent);
		if (closest(target, "button,input,select,textarea")) return;
		if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
		if (native) return;
		focusControl(event);
	}
	return native ? {
		id,
		htmlFor: resolvedControlId,
		onMouseDown: handleInteraction
	} : {
		id,
		onClick: handleInteraction,
		onPointerDown(event) {
			event.preventDefault();
		}
	};
}
function getControlById(label, id) {
	let root = label.getRootNode();
	while (isShadowRoot(root)) {
		const element = root.getElementById(id);
		if (element) return element;
		root = root.host.getRootNode();
	}
	return ownerDocument(label).getElementById(id);
}
function focusElementWithVisible(element) {
	element.focus({ focusVisible: true });
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/toolbar/root/ToolbarRootContext.mjs
const ToolbarRootContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
ToolbarRootContext.displayName = "ToolbarRootContext";
function useToolbarRootContext(optional) {
	const context = import__wp_global_react.useContext(ToolbarRootContext);
	if (context === void 0 && !optional) throw new Error("Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.");
	return context;
}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/usePreviousValue.mjs
/**
* Returns a previous value of its argument.
* @param value Current value.
* @returns Previous value, or null if there is no previous value.
*/
function usePreviousValue(value) {
	const [state, setState] = import__wp_global_react.useState({
		current: value,
		previous: null
	});
	if (!Object.is(value, state.current)) setState({
		current: value,
		previous: state.current
	});
	return state.previous;
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

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/isElementDisabled.mjs
function isElementDisabled(element) {
	return element == null || element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true";
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/csp-context/CSPContext.mjs
const CSPContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
CSPContext.displayName = "CSPContext";
const DEFAULT_CSP_CONTEXT_VALUE = { disableStyleElements: false };
function useCSPContext() {
	return import__wp_global_react.useContext(CSPContext) ?? DEFAULT_CSP_CONTEXT_VALUE;
}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/clamp.mjs
function clamp(val, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	return Math.max(min, Math.min(val, max));
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/fieldset/root/FieldsetRootContext.mjs
const FieldsetRootContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
FieldsetRootContext.displayName = "FieldsetRootContext";
function useFieldsetRootContext(optional = false) {
	const context = import__wp_global_react.useContext(FieldsetRootContext);
	if (!context && !optional) throw new Error("Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/labelable-provider/LabelableProvider.mjs
const LabelableProvider = function LabelableProvider(props) {
	const defaultId = useBaseUiId();
	const [controlIdState, setControlIdState] = import__wp_global_react.useState(defaultId);
	const [labelId, setLabelId] = import__wp_global_react.useState();
	const [messageIds, setMessageIds] = import__wp_global_react.useState([]);
	const controlId = controlIdState === void 0 ? defaultId : controlIdState;
	const registrationsRef = useRefWithInit(() => /* @__PURE__ */ new Map());
	const { messageIds: parentMessageIds } = useLabelableContext();
	const registerControlId = useStableCallback((source, nextId) => {
		const registrations = registrationsRef.current;
		if (nextId === void 0) registrations.delete(source);
		else registrations.set(source, nextId);
		setControlIdState((prev) => {
			if (registrations.size === 0) return prev;
			let nextControlId;
			for (const id of registrations.values()) {
				if (id === prev) return prev;
				if (nextControlId === void 0) nextControlId = id;
			}
			return nextControlId;
		});
	});
	const resetControlId = useStableCallback(() => {
		if (registrationsRef.current.size === 0) setControlIdState(defaultId);
	});
	const getDescriptionProps = import__wp_global_react.useCallback((externalProps) => {
		const ids = externalProps["aria-describedby"] ? externalProps["aria-describedby"].split(" ") : [];
		ids.push(...parentMessageIds, ...messageIds);
		return {
			...externalProps,
			"aria-describedby": Array.from(new Set(ids)).join(" ") || void 0
		};
	}, [parentMessageIds, messageIds]);
	const contextValue = import__wp_global_react.useMemo(() => ({
		controlId,
		registerControlId,
		resetControlId,
		labelId,
		setLabelId,
		messageIds,
		setMessageIds,
		getDescriptionProps
	}), [
		controlId,
		registerControlId,
		resetControlId,
		labelId,
		setLabelId,
		messageIds,
		setMessageIds,
		getDescriptionProps
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(LabelableContext.Provider, {
		value: contextValue,
		children: props.children
	});
};
LabelableProvider.displayName = "LabelableProvider";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/field-register-control/useFieldControlRegistration.mjs
function useFieldControlRegistration(params) {
	const { change, commit, invalid, markedDirtyRef, name, setRegisteredFieldName, registeredFieldIdRef, setValidityData, validityData } = params;
	const { formRef } = useFormContext();
	const activeFieldControlSourceRef = import__wp_global_react.useRef(null);
	const registrationRef = import__wp_global_react.useRef(null);
	const initialValueCapturedRef = import__wp_global_react.useRef(false);
	const getValueForForm = useStableCallback(() => {
		const registration = registrationRef.current;
		if (!registration) return;
		if (registration.getValue) return registration.getValue();
		return registration.value;
	});
	function getRegistrationValue(registration) {
		return registration.value === void 0 ? getValueForForm() : registration.value;
	}
	const validate = useStableCallback(() => {
		const registration = registrationRef.current;
		markedDirtyRef.current = true;
		if (!registration) {
			commit(validityData.value);
			return;
		}
		commit(getRegistrationValue(registration));
	});
	function refreshRegistration() {
		const registration = registrationRef.current;
		if (!registration || !registration.id) return;
		formRef.current.fields.set(registration.id, {
			getValue: getValueForForm,
			name: name ?? registration.name,
			controlRef: registration.controlRef,
			validityData: getCombinedFieldValidityData(validityData, invalid),
			validate
		});
	}
	function deleteRegistration(id = registrationRef.current?.id) {
		if (id) formRef.current.fields.delete(id);
	}
	function captureInitialValue(registration) {
		if (initialValueCapturedRef.current) return;
		initialValueCapturedRef.current = true;
		const initialValue = getRegistrationValue(registration);
		setValidityData((prev) => prev.initialValue === initialValue ? prev : {
			...prev,
			initialValue
		});
	}
	useIsoLayoutEffect(() => {
		const registration = registrationRef.current;
		if (!registration || !registration.id) return;
		setRegisteredFieldName(name ? void 0 : registration.name);
		formRef.current.fields.set(registration.id, {
			getValue: getValueForForm,
			name: name ?? registration.name,
			controlRef: registration.controlRef,
			validityData: getCombinedFieldValidityData(validityData, invalid),
			validate
		});
	}, [
		formRef,
		getValueForForm,
		invalid,
		name,
		setRegisteredFieldName,
		validate,
		validityData
	]);
	useIsoLayoutEffect(() => {
		const fields = formRef.current.fields;
		return () => {
			const id = registrationRef.current?.id;
			if (id) fields.delete(id);
		};
	}, [formRef]);
	return [validate, useStableCallback((source, registration) => {
		if (!registration) {
			if (activeFieldControlSourceRef.current === source) {
				activeFieldControlSourceRef.current = null;
				change(void 0, true);
				deleteRegistration();
				registrationRef.current = null;
				setRegisteredFieldName(void 0);
				registeredFieldIdRef.current = void 0;
			}
			return;
		}
		const previousId = registrationRef.current?.id;
		const previousSource = activeFieldControlSourceRef.current;
		if (previousSource && previousSource !== source) change(void 0, true);
		activeFieldControlSourceRef.current = source;
		registrationRef.current = registration;
		if (!name) setRegisteredFieldName(registration.name);
		registeredFieldIdRef.current = registration.id;
		if (previousId && previousId !== registration.id) deleteRegistration(previousId);
		captureInitialValue(registration);
		refreshRegistration();
	})];
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/field/root/FieldRoot.mjs
/**
* @internal
*/
const FieldRootInner = /*#__PURE__*/ import__wp_global_react.forwardRef(function FieldRootInner(componentProps, forwardedRef) {
	const { errors, validationMode: formValidationMode, submitCountRef } = useFormContext();
	const { render, className, validate: validateProp, validationDebounceTime = 0, validationMode = formValidationMode, name, disabled: disabledProp = false, invalid: invalidProp, dirty: dirtyProp, touched: touchedProp, actionsRef, style, ...elementProps } = componentProps;
	const disabledFieldset = useFieldsetRootContext(true)?.disabled;
	const validate = useStableCallback(validateProp || (() => null));
	const disabled = disabledFieldset || disabledProp;
	const [touchedState, setTouchedUnwrapped] = import__wp_global_react.useState(false);
	const [dirtyState, setDirtyUnwrapped] = import__wp_global_react.useState(false);
	const [filled, setFilled] = import__wp_global_react.useState(false);
	const [focused, setFocused] = import__wp_global_react.useState(false);
	const focusOwnerRef = import__wp_global_react.useRef(void 0);
	const dirty = dirtyProp ?? dirtyState;
	const touched = touchedProp ?? touchedState;
	const markedDirtyRef = import__wp_global_react.useRef(dirty);
	const registeredFieldIdRef = import__wp_global_react.useRef(void 0);
	const [registeredFieldName, setRegisteredFieldName] = import__wp_global_react.useState();
	const effectiveName = name ?? registeredFieldName;
	useIsoLayoutEffect(() => {
		if (dirtyProp !== void 0) markedDirtyRef.current = dirtyProp;
	}, [dirtyProp]);
	const setDirty = useStableCallback((value) => {
		if (dirtyProp !== void 0) return;
		if (value) markedDirtyRef.current = true;
		setDirtyUnwrapped(value);
	});
	const setTouched = useStableCallback((value) => {
		if (touchedProp !== void 0) return;
		setTouchedUnwrapped(value);
	});
	const shouldValidateOnChange = useStableCallback(() => validationMode === "onChange" || validationMode === "onSubmit" && submitCountRef.current > 0);
	const formError = effectiveName && Object.hasOwn(errors, effectiveName) ? errors[effectiveName] : null;
	const hasFormError = !!(Array.isArray(formError) ? formError.length : formError);
	const invalid = invalidProp === true || hasFormError;
	const [validityData, setValidityData] = import__wp_global_react.useState({
		state: DEFAULT_VALIDITY_STATE,
		error: "",
		errors: [],
		value: null,
		initialValue: null
	});
	const valid = !invalid && (disabled ? null : validityData.state.valid);
	const state = import__wp_global_react.useMemo(() => ({
		disabled,
		touched,
		dirty,
		valid,
		filled,
		focused
	}), [
		disabled,
		touched,
		dirty,
		valid,
		filled,
		focused
	]);
	const validation = useFieldValidation({
		setValidityData,
		validate,
		validityData,
		validationDebounceTime,
		invalid,
		markedDirtyRef,
		state,
		shouldValidateOnChange,
		validationMode,
		registeredFieldIdRef
	});
	const [validateFieldControl, registerFieldControl] = useFieldControlRegistration({
		change: validation.change,
		commit: validation.commit,
		invalid,
		markedDirtyRef,
		name,
		setRegisteredFieldName,
		registeredFieldIdRef,
		setValidityData,
		validityData
	});
	import__wp_global_react.useImperativeHandle(actionsRef, () => ({ validate: validateFieldControl }), [validateFieldControl]);
	const contextValue = import__wp_global_react.useMemo(() => ({
		invalid,
		name: effectiveName,
		validityData,
		setValidityData,
		disabled,
		setTouched,
		setDirty,
		setFilled,
		setFocused,
		focusOwnerRef,
		validationMode,
		shouldValidateOnChange,
		state,
		registerFieldControl,
		validation
	}), [
		invalid,
		effectiveName,
		validityData,
		disabled,
		setTouched,
		setDirty,
		setFilled,
		setFocused,
		validationMode,
		shouldValidateOnChange,
		state,
		registerFieldControl,
		validation
	]);
	const element = useRenderElement("div", componentProps, {
		ref: forwardedRef,
		state,
		props: elementProps,
		stateAttributesMapping: fieldValidityMapping
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FieldRootContext.Provider, {
		value: contextValue,
		children: element
	});
});
FieldRootInner.displayName = "FieldRootInner";
const FieldRoot = /*#__PURE__*/ import__wp_global_react.forwardRef(function FieldRoot(componentProps, forwardedRef) {
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(LabelableProvider, { children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FieldRootInner, {
		...componentProps,
		ref: forwardedRef
	}) });
});
FieldRoot.displayName = "FieldRoot";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/field/label/FieldLabel.mjs
/**
* An accessible label that is automatically associated with the field control.
* Renders a `<label>` element.
*
* Documentation: [Base UI Field](https://base-ui.com/react/components/field)
*/
const FieldLabel = /*#__PURE__*/ import__wp_global_react.forwardRef(function FieldLabel(componentProps, forwardedRef) {
	const { render, className, style, id: idProp, nativeLabel = true, ...elementProps } = componentProps;
	const fieldRootContext = useFieldRootContext(false);
	const fieldItemContext = useFieldItemContext();
	const { labelId } = useLabelableContext();
	const state = {
		...fieldRootContext.state,
		disabled: fieldRootContext.disabled || fieldItemContext.disabled
	};
	const labelRef = import__wp_global_react.useRef(null);
	const labelProps = useLabel({
		id: labelId ?? idProp,
		native: nativeLabel
	});
	import__wp_global_react.useEffect(() => {
		if (!labelRef.current) return;
		const isLabelTag = labelRef.current.tagName === "LABEL";
		if (nativeLabel) {
			if (!isLabelTag) {
				const ownerStackMessage = SafeReact.captureOwnerStack?.() || "";
				error(`<Field.Label> expected a <label> element because the \`nativeLabel\` prop is true. Rendering a non-<label> disables native label association, so \`htmlFor\` will not work. Use a real <label> in the \`render\` prop, or set \`nativeLabel\` to \`false\`.${ownerStackMessage}`);
			}
		} else if (isLabelTag) {
			const ownerStackMessage = SafeReact.captureOwnerStack?.() || "";
			error(`<Field.Label> expected a non-<label> element because the \`nativeLabel\` prop is false. Rendering a <label> assumes native label behavior while Base UI treats it as non-native, which can cause unexpected pointer behavior. Use a non-<label> in the \`render\` prop, or set \`nativeLabel\` to \`true\`.${ownerStackMessage}`);
		}
	}, [nativeLabel]);
	return useRenderElement("label", componentProps, {
		ref: [forwardedRef, labelRef],
		state,
		props: [labelProps, elementProps],
		stateAttributesMapping: fieldValidityMapping
	});
});
FieldLabel.displayName = "FieldLabel";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/field/description/FieldDescription.mjs
/**
* A paragraph with additional information about the field.
* Renders a `<p>` element.
*
* Documentation: [Base UI Field](https://base-ui.com/react/components/field)
*/
const FieldDescription = /*#__PURE__*/ import__wp_global_react.forwardRef(function FieldDescription(componentProps, forwardedRef) {
	const { render, id: idProp, className, style, ...elementProps } = componentProps;
	const id = useBaseUiId(idProp);
	const fieldRootContext = useFieldRootContext(false);
	const fieldItemContext = useFieldItemContext();
	const { setMessageIds } = useLabelableContext();
	const state = {
		...fieldRootContext.state,
		disabled: fieldRootContext.disabled || fieldItemContext.disabled
	};
	useIsoLayoutEffect(() => {
		if (!id) return;
		setMessageIds((v) => v.concat(id));
		return () => {
			setMessageIds((v) => v.filter((item) => item !== id));
		};
	}, [id, setMessageIds]);
	return useRenderElement("p", componentProps, {
		ref: forwardedRef,
		state,
		props: [{ id }, elementProps],
		stateAttributesMapping: fieldValidityMapping
	});
});
FieldDescription.displayName = "FieldDescription";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/field/control/FieldControl.mjs
/**
* The form control to label and validate.
* Renders an `<input>` element.
*
* You can omit this part and use any Base UI input component instead. For example,
* [Input](https://base-ui.com/react/components/input), [Checkbox](https://base-ui.com/react/components/checkbox),
* or [Select](https://base-ui.com/react/components/select), among others, will work with Field out of the box.
*
* Documentation: [Base UI Field](https://base-ui.com/react/components/field)
*/
const FieldControl = /*#__PURE__*/ import__wp_global_react.forwardRef(function FieldControl(componentProps, forwardedRef) {
	const { render, className, id: idProp, name: nameProp, value, disabled: disabledProp = false, onValueChange, defaultValue, autoFocus = false, style, ...elementProps } = componentProps;
	const { state: fieldState, name: fieldName, disabled: fieldDisabled, setTouched, setDirty, validityData, setFilled, validationMode, validation } = useFieldRootContext();
	const { clearErrors, elementRef: formElementRef, submitCountRef } = useFormContext();
	const disabled = fieldDisabled || disabledProp;
	const name = fieldName ?? nameProp;
	const state = {
		...fieldState,
		disabled
	};
	const { labelId } = useLabelableContext();
	const id = useLabelableId({ id: idProp });
	const isControlled = value !== void 0;
	const serializedValue = value == null ? void 0 : String(value);
	const getValueFromInput = useStableCallback(() => validation.inputRef.current?.value);
	useRegisterFieldControl(validation.inputRef, id, serializedValue, getValueFromInput, !disabled, nameProp);
	useIsoLayoutEffect(() => {
		const currentValue = serializedValue ?? validation.inputRef.current?.value;
		if (currentValue !== void 0) setFilled(currentValue !== "");
	}, [
		serializedValue,
		defaultValue,
		validation.inputRef,
		setFilled
	]);
	useValueChanged(serializedValue, () => {
		if (serializedValue === void 0) return;
		clearErrors(name);
		setDirty(serializedValue !== (validityData.initialValue ?? ""));
		validation.change(serializedValue);
	});
	const inputRef = import__wp_global_react.useRef(null);
	const setFocused = useSetFieldFocused(disabled, inputRef);
	const enterValidationTimeout = useTimeout();
	return useRenderElement("input", componentProps, {
		ref: [forwardedRef, inputRef],
		state,
		props: [
			{
				id,
				disabled,
				name,
				ref: validation.inputRef,
				"aria-labelledby": labelId,
				autoFocus,
				...isControlled ? { value } : { defaultValue },
				onChange(event) {
					const inputValue = event.currentTarget.value;
					const details = createChangeEventDetails(none, event.nativeEvent);
					onValueChange?.(inputValue, details);
					if (isControlled) return;
					setDirty(inputValue !== (validityData.initialValue ?? ""));
					setFilled(inputValue !== "");
					if (!event.nativeEvent.defaultPrevented && !details.isCanceled) {
						clearErrors(name);
						validation.change(inputValue);
					}
				},
				onFocus() {
					setFocused(true);
				},
				onBlur(event) {
					setTouched(true);
					setFocused(false);
					if (validationMode === "onBlur") {
						const inputValue = event.currentTarget.value;
						validation.commit(inputValue);
						if (isControlled) queueMicrotask(() => {
							const nextValue = validation.inputRef.current?.value;
							if (nextValue !== void 0 && nextValue !== inputValue && nextValue !== (validityData.initialValue ?? "")) validation.commit(nextValue);
						});
					}
				},
				onKeyDown(event) {
					if (event.currentTarget.tagName === "INPUT" && event.key === "Enter") {
						setTouched(true);
						const value = event.currentTarget.value;
						const form = event.currentTarget.form;
						if (form && form === formElementRef.current && !event.defaultPrevented) {
							const input = event.currentTarget;
							const submitCount = submitCountRef.current;
							enterValidationTimeout.start(0, () => {
								if (submitCountRef.current === submitCount) validation.commit(input.value);
							});
						} else validation.commit(value);
					}
				}
			},
			elementProps,
			(props) => validation.getValidationProps(disabled, props)
		],
		stateAttributesMapping: fieldValidityMapping
	});
});
FieldControl.displayName = "FieldControl";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/field/item/FieldItem.mjs
/**
* Groups individual items in a checkbox group or radio group with a label and description.
* Renders a `<div>` element.
*
* Documentation: [Base UI Field](https://base-ui.com/react/components/field)
*/
const FieldItem = /*#__PURE__*/ import__wp_global_react.forwardRef(function FieldItem(componentProps, forwardedRef) {
	const { render, className, style, disabled: disabledProp = false, ...elementProps } = componentProps;
	const { state: fieldState, disabled: rootDisabled } = useFieldRootContext(false);
	const disabled = rootDisabled || disabledProp;
	const state = {
		...fieldState,
		disabled
	};
	const fieldItemContext = import__wp_global_react.useMemo(() => ({ disabled }), [disabled]);
	const element = useRenderElement("div", componentProps, {
		ref: forwardedRef,
		state,
		props: elementProps,
		stateAttributesMapping: fieldValidityMapping
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(LabelableProvider, { children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FieldItemContext.Provider, {
		value: fieldItemContext,
		children: element
	}) });
});
FieldItem.displayName = "FieldItem";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/fieldset/root/FieldsetRoot.mjs
/**
* Groups a shared legend with related controls.
* Renders a `<fieldset>` element.
*
* Documentation: [Base UI Fieldset](https://base-ui.com/react/components/fieldset)
*/
const FieldsetRoot$1 = /*#__PURE__*/ import__wp_global_react.forwardRef(function FieldsetRoot(componentProps, forwardedRef) {
	const { render, className, style, disabled: disabledProp = false, ...elementProps } = componentProps;
	const [legendId, setLegendId] = import__wp_global_react.useState(void 0);
	const disabled = useFieldsetRootContext(true)?.disabled || disabledProp;
	const element = useRenderElement("fieldset", componentProps, {
		ref: forwardedRef,
		state: { disabled },
		props: [{
			"aria-labelledby": legendId,
			disabled
		}, elementProps]
	});
	const contextValue = import__wp_global_react.useMemo(() => ({
		legendId,
		setLegendId,
		disabled
	}), [
		legendId,
		setLegendId,
		disabled
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FieldsetRootContext.Provider, {
		value: contextValue,
		children: element
	});
});
FieldsetRoot$1.displayName = "FieldsetRoot";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/fieldset/legend/FieldsetLegend.mjs
/**
* An accessible label that is automatically associated with the fieldset.
* Renders a `<div>` element.
*
* Documentation: [Base UI Fieldset](https://base-ui.com/react/components/fieldset)
*/
const FieldsetLegend$1 = /*#__PURE__*/ import__wp_global_react.forwardRef(function FieldsetLegend(componentProps, forwardedRef) {
	const { render, className, style, id: idProp, ...elementProps } = componentProps;
	const { disabled, setLegendId } = useFieldsetRootContext();
	const id = useRegisteredLabelId(idProp, setLegendId);
	return useRenderElement("div", componentProps, {
		state: { disabled },
		ref: forwardedRef,
		props: [{ id }, elementProps]
	});
});
FieldsetLegend$1.displayName = "FieldsetLegend";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/input/Input.mjs
/**
* A native input element that automatically works with [Field](https://base-ui.com/react/components/field).
* Renders an `<input>` element.
*
* Documentation: [Base UI Input](https://base-ui.com/react/components/input)
*/
const Input$1 = /*#__PURE__*/ import__wp_global_react.forwardRef(function Input(props, forwardedRef) {
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FieldControl, {
		ref: forwardedRef,
		...props
	});
});
Input$1.displayName = "Input";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/styles.mjs
const DISABLE_SCROLLBAR_CLASS_NAME = "base-ui-disable-scrollbar";
const styleDisableScrollbar = {
	className: DISABLE_SCROLLBAR_CLASS_NAME,
	getElement(nonce) {
		return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("style", {
			nonce,
			href: DISABLE_SCROLLBAR_CLASS_NAME,
			precedence: "base-ui:low",
			children: `.${DISABLE_SCROLLBAR_CLASS_NAME}{scrollbar-width:none}.${DISABLE_SCROLLBAR_CLASS_NAME}::-webkit-scrollbar{display:none}`
		});
	}
};
styleDisableScrollbar.getElement.displayName = "styleDisableScrollbar.getElement";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/scrollEdges.mjs
const SCROLL_EDGE_TOLERANCE_PX = 1;
function getMaxScrollOffset(scrollSize, clientSize) {
	return Math.max(0, scrollSize - clientSize);
}
function normalizeScrollOffset(value, max) {
	if (max <= 0) return 0;
	const clamped = clamp(value, 0, max);
	const startDistance = clamped;
	const endDistance = max - clamped;
	const withinStartTolerance = startDistance <= 1;
	const withinEndTolerance = endDistance <= 1;
	if (withinStartTolerance && withinEndTolerance) return startDistance <= endDistance ? 0 : max;
	if (withinStartTolerance) return 0;
	if (withinEndTolerance) return max;
	return clamped;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/root/SelectRootContext.mjs
const SelectRootContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
SelectRootContext.displayName = "SelectRootContext";
const SelectFloatingContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
SelectFloatingContext.displayName = "SelectFloatingContext";
function useSelectRootContext() {
	const store = import__wp_global_react.useContext(SelectRootContext);
	if (store === void 0) throw new Error("Base UI: SelectRootContext is missing. Select parts must be placed within <Select.Root>.");
	return store;
}
function useSelectFloatingContext() {
	const context = import__wp_global_react.useContext(SelectFloatingContext);
	if (context === void 0) throw new Error("Base UI: SelectFloatingContext is missing. Select parts must be placed within <Select.Root>.");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/store.mjs
/**
* Non-reactive values shared with the select parts. Nothing here is observable through
* `selectors`, so writing to a ref never notifies subscribers.
*/
const selectors = {
	id: (state) => state.id,
	labelId: (state) => state.labelId,
	modal: (state) => state.modal,
	multiple: (state) => state.multiple,
	disabled: (state) => state.disabled,
	readOnly: (state) => state.readOnly,
	required: (state) => state.required,
	highlightItemOnHover: (state) => state.highlightItemOnHover,
	items: (state) => state.items,
	itemToStringLabel: (state) => state.itemToStringLabel,
	isItemEqualToValue: (state) => state.isItemEqualToValue,
	value: (state) => state.value,
	hasSelectedValue: (state) => {
		const { value, multiple, itemToStringValue } = state;
		if (value == null) return false;
		if (multiple && Array.isArray(value)) return value.length > 0;
		return stringifyAsValue(value, itemToStringValue) !== "";
	},
	hasNullItemLabel: (state, enabled) => {
		return enabled ? hasNullItemLabel(state.items) : false;
	},
	open: (state) => state.open,
	mounted: (state) => state.mounted,
	forceMount: (state) => state.forceMount,
	transitionStatus: (state) => state.transitionStatus,
	openMethod: (state) => state.openMethod,
	activeIndex: (state) => state.activeIndex,
	selectedIndex: (state) => state.selectedIndex,
	isActive: (state, index) => state.activeIndex === index,
	isSelected: (state, itemValue) => {
		const comparer = state.isItemEqualToValue;
		const storeValue = state.value;
		if (state.multiple) return Array.isArray(storeValue) && storeValue.some((selectedItem) => compareItemEquality(itemValue, selectedItem, comparer));
		return compareItemEquality(itemValue, storeValue, comparer);
	},
	isSelectedByFocus: (state, index) => {
		return state.selectedIndex === index;
	},
	popupProps: (state) => state.popupProps,
	triggerProps: (state) => state.triggerProps,
	itemRoot: (state) => state.itemRoot,
	triggerElement: (state) => state.triggerElement,
	positionerElement: (state) => state.positionerElement,
	listElement: (state) => state.listElement,
	popupSide: (state) => state.popupSide,
	scrollUpArrowVisible: (state) => state.scrollUpArrowVisible,
	scrollDownArrowVisible: (state) => state.scrollDownArrowVisible,
	hasScrollArrows: (state) => state.hasScrollArrows
};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/root/SelectRoot.mjs
/**
* Groups all parts of the select.
* Doesn't render its own HTML element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
function SelectRoot(props) {
	const { id, value: valueProp, defaultValue = null, onValueChange, open: openProp, defaultOpen = false, onOpenChange, name: nameProp, form, autoComplete, disabled: disabledProp = false, readOnly = false, required = false, modal = true, actionsRef, inputRef, onOpenChangeComplete, items, multiple = false, itemToStringLabel, itemToStringValue, isItemEqualToValue = defaultItemEquality, highlightItemOnHover = true, children } = props;
	const { clearErrors } = useFormContext();
	const { setDirty, setTouched, setFocused, validityData, setFilled, name: fieldName, disabled: fieldDisabled, validation, validationMode } = useFieldRootContext();
	const generatedId = useLabelableId({ id });
	const disabled = fieldDisabled || disabledProp;
	const name = fieldName ?? nameProp;
	const [value, setValueUnwrapped] = useControlled({
		controlled: valueProp,
		default: multiple ? defaultValue ?? EMPTY_ARRAY$1 : defaultValue,
		name: "Select",
		state: "value"
	});
	const [open, setOpenUnwrapped] = useControlled({
		controlled: openProp,
		default: defaultOpen,
		name: "Select",
		state: "open"
	});
	const listRef = import__wp_global_react.useRef([]);
	const labelsRef = import__wp_global_react.useRef([]);
	const popupRef = import__wp_global_react.useRef(null);
	const scrollHandlerRef = import__wp_global_react.useRef(null);
	const scrollArrowsMountedCountRef = import__wp_global_react.useRef(0);
	const valueRef = import__wp_global_react.useRef(null);
	const valuesRef = import__wp_global_react.useRef([]);
	const typingRef = import__wp_global_react.useRef(false);
	const firstItemTextRef = import__wp_global_react.useRef(null);
	const selectedItemTextRef = import__wp_global_react.useRef(null);
	const selectionRef = import__wp_global_react.useRef({
		allowSelectedMouseUp: false,
		allowUnselectedMouseUp: false,
		dragY: 0
	});
	const alignItemWithTriggerActiveRef = import__wp_global_react.useRef(false);
	const initialValueRef = import__wp_global_react.useRef(value);
	const { openMethod, triggerProps: interactionTypeProps } = useOpenInteractionType(open);
	const store = useRefWithInit(() => new ReactStore({
		id: generatedId,
		labelId: void 0,
		modal,
		multiple,
		disabled,
		readOnly,
		required,
		highlightItemOnHover,
		itemToStringLabel,
		itemToStringValue,
		isItemEqualToValue,
		value,
		open,
		mounted: open,
		transitionStatus: void 0,
		items,
		forceMount: false,
		openMethod: null,
		activeIndex: null,
		selectedIndex: null,
		popupProps: EMPTY_OBJECT,
		triggerProps: EMPTY_OBJECT,
		itemRoot: {
			props: EMPTY_OBJECT,
			multiple,
			disabled,
			readOnly,
			isItemEqualToValue
		},
		triggerElement: null,
		positionerElement: null,
		listElement: null,
		popupSide: null,
		scrollUpArrowVisible: false,
		scrollDownArrowVisible: false,
		hasScrollArrows: false
	}, {
		setValue: NOOP,
		setOpen: NOOP,
		handleScrollArrowVisibility: NOOP,
		onOpenChangeComplete: NOOP,
		listRef,
		popupRef,
		scrollHandlerRef,
		scrollArrowsMountedCountRef,
		valueRef,
		valuesRef,
		labelsRef,
		typingRef,
		selectionRef,
		firstItemTextRef,
		selectedItemTextRef,
		alignItemWithTriggerActiveRef,
		initialValueRef
	}, selectors)).current;
	const [preventUnmountOnClose, setPreventUnmountOnClose] = import__wp_global_react.useState(false);
	const { mounted, transitionStatus, forceUnmount: handleUnmount } = useUnmountAfterClose({
		open,
		ref: popupRef,
		preventUnmountOnClose,
		setPreventUnmountOnClose,
		onUnmount() {
			store.update({
				activeIndex: null,
				openMethod: null,
				scrollUpArrowVisible: false,
				scrollDownArrowVisible: false
			});
			onOpenChangeComplete?.(false);
		}
	});
	const activeIndex = store.useState("activeIndex");
	const selectedIndex = store.useState("selectedIndex");
	const triggerElement = store.useState("triggerElement");
	const positionerElement = store.useState("positionerElement");
	const previousOpenMethod = usePreviousValue(openMethod);
	const renderedOpenMethod = openMethod ?? previousOpenMethod;
	const serializedValue = import__wp_global_react.useMemo(() => {
		if (multiple) return "";
		return stringifyAsValue(value, itemToStringValue);
	}, [
		multiple,
		value,
		itemToStringValue
	]);
	const fieldStringValue = import__wp_global_react.useMemo(() => {
		if (multiple && Array.isArray(value)) return value.map((currentValue) => stringifyAsValue(currentValue, itemToStringValue));
		return stringifyAsValue(value, itemToStringValue);
	}, [
		multiple,
		value,
		itemToStringValue
	]);
	const controlRef = useValueAsRef(triggerElement);
	const getStringifiedValueForForm = useStableCallback(() => fieldStringValue);
	useRegisterFieldControl(controlRef, generatedId, value, getStringifiedValueForForm, !disabled, nameProp);
	const hasSelectedValue = multiple ? Array.isArray(value) && value.length > 0 : value != null && serializedValue !== "";
	useIsoLayoutEffect(() => {
		setFilled(hasSelectedValue);
	}, [hasSelectedValue, setFilled]);
	useIsoLayoutEffect(function syncSelectedIndex() {
		const nextIndex = findSelectionIndex(valuesRef.current, value, isItemEqualToValue, multiple);
		if (nextIndex === null) selectedItemTextRef.current = null;
		if (open) return;
		store.set("selectedIndex", nextIndex);
	}, [
		multiple,
		open,
		value,
		isItemEqualToValue,
		store
	]);
	useValueChanged(value, () => {
		clearErrors(name);
		setDirty(isSelectedValueDirty(value, validityData.initialValue, isItemEqualToValue));
		validation.change(value);
	});
	const setOpen = useStableCallback((nextOpen, eventDetails) => {
		const openEventDetails = eventDetails;
		const shouldPreventUnmountOnClose = attachPreventUnmountOnClose(openEventDetails);
		onOpenChange?.(nextOpen, openEventDetails);
		if (eventDetails.isCanceled) return;
		if (!nextOpen) setPreventUnmountOnClose(shouldPreventUnmountOnClose());
		setOpenUnwrapped(nextOpen);
		if (!nextOpen && (eventDetails.reason === "focus-out" || eventDetails.reason === "outside-press")) {
			setTouched(true);
			setFocused(false);
			if (validationMode === "onBlur") validation.commit(value);
		}
	});
	import__wp_global_react.useImperativeHandle(actionsRef, () => ({
		unmount: handleUnmount,
		close: () => {
			if (store.state.open) setOpen(false, createChangeEventDetails(imperativeAction));
		}
	}), [
		handleUnmount,
		setOpen,
		store
	]);
	const setValue = useStableCallback((nextValue, eventDetails) => {
		onValueChange?.(nextValue, eventDetails);
		if (eventDetails.isCanceled) return;
		setValueUnwrapped(nextValue);
	});
	const handleScrollArrowVisibility = useStableCallback((scroller) => {
		const maxScrollTop = getMaxScrollOffset(scroller.scrollHeight, scroller.clientHeight);
		const scrollTop = normalizeScrollOffset(scroller.scrollTop, maxScrollTop);
		const shouldShowUp = scrollTop > 0;
		const shouldShowDown = scrollTop < maxScrollTop;
		store.set("scrollUpArrowVisible", shouldShowUp);
		store.set("scrollDownArrowVisible", shouldShowDown);
	});
	const floatingContext = useFloatingRootContext({
		open,
		onOpenChange: setOpen,
		elements: {
			reference: triggerElement,
			floating: positionerElement
		}
	});
	const click = useClick(floatingContext, {
		enabled: !disabled,
		event: "mousedown"
	});
	const dismiss = useDismiss(floatingContext);
	const listNavigation = useListNavigation(floatingContext, {
		enabled: !disabled,
		listRef,
		activeIndex,
		selectedIndex,
		disabledIndices: EMPTY_ARRAY$1,
		onNavigate(nextActiveIndex) {
			if (nextActiveIndex === null && !open) return;
			store.set("activeIndex", nextActiveIndex);
		},
		focusItemOnHover: highlightItemOnHover
	});
	const typeahead = useTypeahead(floatingContext, {
		enabled: !disabled && (open || !readOnly && !multiple),
		listRef: labelsRef,
		activeIndex,
		selectedIndex,
		disabledIndices: (index) => isElementDisabled(listRef.current[index]),
		onMatch(index) {
			if (open) store.set("activeIndex", index);
			else setValue(valuesRef.current[index], createChangeEventDetails(none));
		},
		onTyping(typing) {
			typingRef.current = typing;
		}
	});
	const mergedTriggerProps = import__wp_global_react.useMemo(() => mergeProps(typeahead.reference, listNavigation.reference, dismiss.reference, click.reference, interactionTypeProps), [
		click.reference,
		typeahead.reference,
		listNavigation.reference,
		dismiss.reference,
		interactionTypeProps
	]);
	const popupProps = import__wp_global_react.useMemo(() => mergeProps(FOCUSABLE_POPUP_PROPS, typeahead.floating, listNavigation.floating, dismiss.floating), [
		typeahead.floating,
		listNavigation.floating,
		dismiss.floating
	]);
	const itemProps = listNavigation.item ?? EMPTY_OBJECT;
	const itemRoot = import__wp_global_react.useMemo(() => ({
		props: itemProps,
		multiple,
		disabled,
		readOnly,
		isItemEqualToValue
	}), [
		itemProps,
		multiple,
		disabled,
		readOnly,
		isItemEqualToValue
	]);
	store.useContextCallback("setValue", setValue);
	store.useContextCallback("setOpen", setOpen);
	store.useContextCallback("handleScrollArrowVisibility", handleScrollArrowVisibility);
	store.useContextCallback("onOpenChangeComplete", onOpenChangeComplete);
	useOnFirstRender(() => {
		store.update({
			popupProps,
			triggerProps: mergedTriggerProps,
			itemRoot
		});
	});
	store.useSyncedValues({
		id: generatedId,
		modal,
		multiple,
		disabled,
		readOnly,
		required,
		highlightItemOnHover,
		value,
		open,
		mounted,
		transitionStatus,
		popupProps,
		triggerProps: mergedTriggerProps,
		itemRoot,
		items,
		itemToStringLabel,
		itemToStringValue,
		isItemEqualToValue,
		openMethod: renderedOpenMethod
	});
	const ref = useMergedRefs(inputRef, validation.inputRef);
	const hiddenInputName = multiple ? void 0 : name;
	const hiddenInputs = import__wp_global_react.useMemo(() => {
		if (!multiple || !Array.isArray(value) || !name) return null;
		return value.map((v) => {
			const currentSerializedValue = stringifyAsValue(v, itemToStringValue);
			return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("input", {
				type: "hidden",
				form,
				name,
				value: currentSerializedValue,
				disabled
			}, currentSerializedValue);
		});
	}, [
		multiple,
		value,
		form,
		name,
		itemToStringValue,
		disabled
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(SelectRootContext.Provider, {
		value: store,
		children: [
			/*#__PURE__*/ (0, import_jsx_runtime.jsx)(SelectFloatingContext.Provider, {
				value: floatingContext,
				children
			}),
			/*#__PURE__*/ (0, import_jsx_runtime.jsx)("input", {
				...validation.getValidationProps(disabled, {
					onFocus() {
						store.state.triggerElement?.focus({ focusVisible: true });
					},
					onChange(event) {
						if (event.nativeEvent.defaultPrevented || disabled || readOnly) return;
						const nextValue = event.currentTarget.value;
						const details = createChangeEventDetails(none, event.nativeEvent);
						function handleChange() {
							if (multiple) return;
							const nextValueLower = nextValue.toLowerCase();
							let matchingIndex = valuesRef.current.findIndex((candidate) => stringifyAsValue(candidate, itemToStringValue).toLowerCase() === nextValueLower || stringifyAsLabel(candidate, itemToStringLabel).toLowerCase() === nextValueLower);
							if (matchingIndex === -1) matchingIndex = valuesRef.current.findIndex((_, index) => {
								const renderedLabel = labelsRef.current[index];
								return renderedLabel != null && renderedLabel.toLowerCase() === nextValueLower;
							});
							const matchingValue = valuesRef.current[matchingIndex];
							if (matchingValue != null) setValue(matchingValue, details);
						}
						store.set("forceMount", true);
						queueMicrotask(handleChange);
					}
				}),
				id: generatedId && hiddenInputName == null ? `${generatedId}-hidden-input` : void 0,
				form,
				name: hiddenInputName,
				autoComplete,
				value: serializedValue,
				disabled,
				required: required && !(multiple && hasSelectedValue),
				readOnly,
				ref,
				style: name ? visuallyHiddenInput : visuallyHidden,
				tabIndex: -1,
				"aria-hidden": true,
				suppressHydrationWarning: true
			}),
			hiddenInputs
		]
	});
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/trigger/SelectTriggerDataAttributes.mjs
/**
* Present when the corresponding select is open.
*/
const popupOpen = popupOpen$1;
/**
* Present when the trigger is pressed.
*/
const pressed = pressed$1;
/**
* Indicates which side the corresponding popup is positioned relative to its anchor.
* @type {'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start' | null}
*/
const popupSide = "data-popup-side";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/trigger/SelectTrigger.mjs
const SELECTED_DELAY = 400;
const stateAttributesMapping$2 = {
	...pressableTriggerOpenStateMapping,
	...fieldValidityMapping,
	popupSide: (side) => side ? { [popupSide]: side } : null,
	value: () => null
};
/**
* A button that opens the select popup.
* Renders a `<button>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectTrigger = /*#__PURE__*/ import__wp_global_react.forwardRef(function SelectTrigger(componentProps, forwardedRef) {
	const { render, className, id: idProp, disabled: disabledProp = false, nativeButton = true, style, ...elementProps } = componentProps;
	const { setTouched, validationMode, validation, state: fieldState, disabled: fieldDisabled } = useFieldRootContext();
	const { labelId: fieldLabelId } = useLabelableContext();
	const store = useSelectRootContext();
	const readOnly = store.useState("readOnly");
	const required = store.useState("required");
	const selectDisabled = store.useState("disabled");
	const disabled = fieldDisabled || selectDisabled || disabledProp;
	const open = store.useState("open");
	const mounted = store.useState("mounted");
	const value = store.useState("value");
	const triggerProps = store.useState("triggerProps");
	const positionerElement = store.useState("positionerElement");
	const listElement = store.useState("listElement");
	const popupSideValue = store.useState("popupSide");
	const rootId = store.useState("id");
	const selectLabelId = store.useState("labelId");
	const hasSelectedValue = store.useState("hasSelectedValue");
	const popupSide = mounted && positionerElement ? popupSideValue : null;
	const id = idProp ?? rootId;
	const ariaLabelledBy = resolveAriaLabelledBy(fieldLabelId, selectLabelId);
	useLabelableId({ id: idProp });
	const positionerRef = useValueAsRef(positionerElement);
	const triggerRef = import__wp_global_react.useRef(null);
	const setFocused = useSetFieldFocused(disabled, triggerRef);
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		native: nativeButton
	});
	const setTriggerElement = store.useStateSetter("triggerElement");
	const timeoutFocus = useTimeout();
	const timeoutMouseDown = useTimeout();
	const selectedDelayTimeout = useTimeout();
	import__wp_global_react.useEffect(() => {
		if (open) {
			selectedDelayTimeout.start(SELECTED_DELAY, () => {
				store.context.selectionRef.current.allowUnselectedMouseUp = true;
				store.context.selectionRef.current.allowSelectedMouseUp = true;
			});
			return () => {
				selectedDelayTimeout.clear();
			};
		}
		store.context.selectionRef.current = {
			allowSelectedMouseUp: false,
			allowUnselectedMouseUp: false,
			dragY: 0
		};
		timeoutMouseDown.clear();
	}, [
		open,
		store,
		timeoutMouseDown,
		selectedDelayTimeout
	]);
	const mergedProps = mergeProps(triggerProps, {
		id,
		role: "combobox",
		"aria-expanded": open,
		"aria-haspopup": "listbox",
		"aria-controls": open ? listElement?.id ?? getFloatingFocusElement(positionerElement)?.id : void 0,
		"aria-labelledby": ariaLabelledBy,
		"aria-readonly": readOnly || void 0,
		"aria-required": required || void 0,
		tabIndex: disabled ? -1 : 0,
		onFocus(event) {
			setFocused(true);
			if (open && store.context.alignItemWithTriggerActiveRef.current) store.context.setOpen(false, createChangeEventDetails(none, event.nativeEvent));
			timeoutFocus.start(0, () => {
				store.set("forceMount", true);
			});
		},
		onBlur(event) {
			if (contains(positionerElement, event.relatedTarget)) return;
			setTouched(true);
			setFocused(false);
			if (validationMode === "onBlur") validation.commit(value);
		},
		onMouseDown(event) {
			if (open) return;
			const doc = ownerDocument(event.currentTarget);
			function handleMouseUp(mouseEvent) {
				if (!triggerRef.current) return;
				const mouseUpTarget = mouseEvent.target;
				if (contains(triggerRef.current, mouseUpTarget) || contains(positionerRef.current, mouseUpTarget)) return;
				if (isMouseWithinBounds(mouseEvent, triggerRef.current)) return;
				store.context.setOpen(false, createChangeEventDetails(cancelOpen, mouseEvent));
			}
			timeoutMouseDown.start(0, () => {
				doc.addEventListener("mouseup", handleMouseUp, { once: true });
			});
		}
	}, elementProps, getButtonProps);
	const props = validation.getValidationProps(disabled, mergedProps);
	props.role = "combobox";
	const state = {
		...fieldState,
		open,
		disabled,
		value,
		readOnly,
		popupSide,
		placeholder: !hasSelectedValue
	};
	return useRenderElement("button", componentProps, {
		ref: [
			forwardedRef,
			triggerRef,
			buttonRef,
			setTriggerElement
		],
		state,
		stateAttributesMapping: stateAttributesMapping$2,
		props
	});
});
SelectTrigger.displayName = "SelectTrigger";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/value/SelectValue.mjs
const stateAttributesMapping$1 = { value: () => null };
/**
* A text label of the currently selected item.
* Renders a `<span>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectValue = /*#__PURE__*/ import__wp_global_react.forwardRef(function SelectValue(componentProps, forwardedRef) {
	const { className, render, children: childrenProp, placeholder, style, ...elementProps } = componentProps;
	const store = useSelectRootContext();
	const value = store.useState("value");
	const items = store.useState("items");
	const itemToStringLabel = store.useState("itemToStringLabel");
	const hasSelectedValue = store.useState("hasSelectedValue");
	const shouldCheckNullItemLabel = !hasSelectedValue && placeholder != null && childrenProp == null;
	const hasNullLabel = store.useState("hasNullItemLabel", shouldCheckNullItemLabel);
	const state = {
		value,
		placeholder: !hasSelectedValue
	};
	let children = null;
	if (typeof childrenProp === "function") children = childrenProp(value);
	else if (childrenProp != null) children = childrenProp;
	else if (shouldCheckNullItemLabel && !hasNullLabel) children = placeholder;
	else if (Array.isArray(value)) children = resolveMultipleLabels(value, items, itemToStringLabel);
	else children = resolveSelectedLabel(value, items, itemToStringLabel);
	return useRenderElement("span", componentProps, {
		state,
		ref: [forwardedRef, store.context.valueRef],
		props: [{ children }, elementProps],
		stateAttributesMapping: stateAttributesMapping$1
	});
});
SelectValue.displayName = "SelectValue";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/portal/SelectPortal.mjs
/**
* A portal element that moves the popup to a different part of the DOM.
* By default, the portal element is appended to `<body>`.
* Renders a `<div>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectPortal = /*#__PURE__*/ import__wp_global_react.forwardRef(function SelectPortal(portalProps, forwardedRef) {
	const store = useSelectRootContext();
	const mounted = store.useState("mounted");
	const forceMount = store.useState("forceMount");
	if (!(mounted || forceMount)) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingPortal, {
		ref: forwardedRef,
		...portalProps
	});
});
SelectPortal.displayName = "SelectPortal";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/positioner/SelectPositionerContext.mjs
const SelectPositionerContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
SelectPositionerContext.displayName = "SelectPositionerContext";
function useSelectPositionerContext() {
	const context = import__wp_global_react.useContext(SelectPositionerContext);
	if (!context) throw new Error("Base UI: SelectPositionerContext is missing. SelectPositioner parts must be placed within <Select.Positioner>.");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/popup/utils.mjs
function clearStyles(element, originalStyles) {
	if (element) Object.assign(element.style, originalStyles);
}
const LIST_FUNCTIONAL_STYLES = {
	position: "relative",
	maxHeight: "100%",
	overflowX: "hidden",
	overflowY: "auto"
};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/positioner/SelectPositioner.mjs
const FIXED = { position: "fixed" };
/**
* Positions the select popup.
* Renders a `<div>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectPositioner = /*#__PURE__*/ import__wp_global_react.forwardRef(function SelectPositioner(componentProps, forwardedRef) {
	const { anchor, className, render, positionMethod, side, align, sideOffset, alignOffset, collisionBoundary = "clipping-ancestors", collisionPadding, arrowPadding, sticky, disableAnchorTracking, alignItemWithTrigger = true, collisionAvoidance = DROPDOWN_COLLISION_AVOIDANCE, style, ...elementProps } = componentProps;
	const store = useSelectRootContext();
	const floatingRootContext = useSelectFloatingContext();
	const open = store.useState("open");
	const mounted = store.useState("mounted");
	const modal = store.useState("modal");
	const value = store.useState("value");
	const openMethod = store.useState("openMethod");
	const positionerElement = store.useState("positionerElement");
	const triggerElement = store.useState("triggerElement");
	const isItemEqualToValue = store.useState("isItemEqualToValue");
	const transitionStatus = store.useState("transitionStatus");
	const scrollUpArrowRef = import__wp_global_react.useRef(null);
	const scrollDownArrowRef = import__wp_global_react.useRef(null);
	const [controlledAlignItemWithTrigger, setControlledAlignItemWithTrigger] = import__wp_global_react.useState(alignItemWithTrigger);
	const alignItemWithTriggerActive = mounted && controlledAlignItemWithTrigger && openMethod !== "touch";
	if (!mounted && controlledAlignItemWithTrigger !== alignItemWithTrigger) setControlledAlignItemWithTrigger(alignItemWithTrigger);
	import__wp_global_react.useImperativeHandle(store.context.alignItemWithTriggerActiveRef, () => alignItemWithTriggerActive);
	useAnchoredPopupScrollLock((alignItemWithTriggerActive || modal) && open, openMethod === "touch", positionerElement, triggerElement);
	const positioning = useAnchorPositioning({
		anchor,
		floatingRootContext,
		positionMethod,
		mounted,
		side,
		sideOffset,
		align,
		alignOffset,
		arrowPadding,
		collisionBoundary,
		collisionPadding,
		sticky,
		disableAnchorTracking: disableAnchorTracking ?? alignItemWithTriggerActive,
		collisionAvoidance,
		keepMounted: true
	});
	const renderedSide = alignItemWithTriggerActive ? "none" : positioning.side;
	const positionerStyles = alignItemWithTriggerActive ? FIXED : positioning.positionerStyles;
	const state = {
		open,
		side: renderedSide,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden
	};
	useIsoLayoutEffect(() => {
		store.set("popupSide", positioning.side);
	}, [store, positioning.side]);
	const setPositionerElement = store.useStateSetter("positionerElement");
	const element = usePositioner(componentProps, state, {
		styles: positionerStyles,
		transitionStatus,
		props: elementProps,
		refs: [forwardedRef, setPositionerElement],
		hidden: !mounted,
		inert: !open
	});
	const prevMapSizeRef = import__wp_global_react.useRef(0);
	const onMapChange = useStableCallback((map) => {
		if (store.context.valuesRef.current.length === 0) return;
		const prevSize = prevMapSizeRef.current;
		prevMapSizeRef.current = map.size;
		const eventDetails = createChangeEventDetails(none);
		if (prevSize !== 0 && !store.state.multiple && value !== null) {
			if (findItemIndex(store.context.valuesRef.current, value, isItemEqualToValue) === -1) {
				const initialSelectedValue = store.context.initialValueRef.current;
				const nextValue = initialSelectedValue != null && findItemIndex(store.context.valuesRef.current, initialSelectedValue, isItemEqualToValue) !== -1 ? initialSelectedValue : null;
				store.context.setValue(nextValue, eventDetails);
				if (nextValue === null) {
					store.set("selectedIndex", null);
					store.context.selectedItemTextRef.current = null;
				}
			}
		}
		if (prevSize !== 0 && store.state.multiple && Array.isArray(value)) {
			const nextValue = value.filter((selectedItemValue) => findItemIndex(store.context.valuesRef.current, selectedItemValue, isItemEqualToValue) !== -1);
			if (nextValue.length !== value.length) {
				store.context.setValue(nextValue, eventDetails);
				if (nextValue.length === 0) {
					store.set("selectedIndex", null);
					store.context.selectedItemTextRef.current = null;
				}
			}
		}
		if (open && alignItemWithTriggerActive) {
			store.update({
				scrollUpArrowVisible: false,
				scrollDownArrowVisible: false
			});
			const stylesToClear = { height: "" };
			clearStyles(positionerElement, stylesToClear);
			clearStyles(store.context.popupRef.current, stylesToClear);
		}
	});
	const contextValue = import__wp_global_react.useMemo(() => ({
		...positioning,
		side: renderedSide,
		alignItemWithTriggerActive,
		setControlledAlignItemWithTrigger,
		scrollUpArrowRef,
		scrollDownArrowRef
	}), [
		positioning,
		renderedSide,
		alignItemWithTriggerActive,
		setControlledAlignItemWithTrigger
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeList, {
		elementsRef: store.context.listRef,
		labelsRef: store.context.labelsRef,
		onMapChange,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(SelectPositionerContext.Provider, {
			value: contextValue,
			children: [mounted && modal && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InternalBackdrop, {
				inert: inertValue(!open),
				cutout: triggerElement
			}), element]
		})
	});
});
SelectPositioner.displayName = "SelectPositioner";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/positioner/SelectPositionerCssVars.mjs
/**
* The coordinates that this element is anchored to. Used for animations and transitions.
* @type {string}
*/
const transformOrigin = "--transform-origin";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/popup/SelectPopup.mjs
const stateAttributesMapping = {
	...popupStateMapping,
	...transitionStatusMapping
};
/**
* A container for the select list.
* Renders a `<div>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectPopup = /*#__PURE__*/ import__wp_global_react.forwardRef(function SelectPopup(componentProps, forwardedRef) {
	const { render, className, style, finalFocus, ...elementProps } = componentProps;
	const store = useSelectRootContext();
	const multiple = store.useState("multiple");
	const readOnly = store.useState("readOnly");
	const highlightItemOnHover = store.useState("highlightItemOnHover");
	const floatingRootContext = useSelectFloatingContext();
	const { side, align, alignItemWithTriggerActive, isPositioned, setControlledAlignItemWithTrigger } = useSelectPositionerContext();
	const insideToolbar = useToolbarRootContext(true) != null;
	const direction = useDirection();
	const { nonce, disableStyleElements } = useCSPContext();
	const id = store.useState("id");
	const open = store.useState("open");
	const openMethod = store.useState("openMethod");
	const mounted = store.useState("mounted");
	const popupProps = store.useState("popupProps");
	const transitionStatus = store.useState("transitionStatus");
	const triggerElement = store.useState("triggerElement");
	const positionerElement = store.useState("positionerElement");
	const listElement = store.useState("listElement");
	const reachedMaxHeightRef = import__wp_global_react.useRef(false);
	const initialPlacedRef = import__wp_global_react.useRef(false);
	const originalPositionerStylesRef = import__wp_global_react.useRef({});
	const scrollArrowFrame = useAnimationFrame();
	const handleScroll = useStableCallback((scroller) => {
		if (!positionerElement || !store.context.popupRef.current || !initialPlacedRef.current) return;
		const isTopPositioned = positionerElement.style.top === "0px";
		const isBottomPositioned = positionerElement.style.bottom === "0px";
		if (reachedMaxHeightRef.current || !alignItemWithTriggerActive || !isTopPositioned && !isBottomPositioned) {
			store.context.handleScrollArrowVisibility(scroller);
			return;
		}
		const scale = getScale(positionerElement);
		const currentHeight = normalizeSize(positionerElement.getBoundingClientRect().height, "y", scale);
		const doc = ownerDocument(positionerElement);
		const win = getWindow(positionerElement);
		const positionerStyles = win.getComputedStyle(positionerElement);
		const marginTop = parseFloat(positionerStyles.marginTop);
		const marginBottom = parseFloat(positionerStyles.marginBottom);
		const maxPopupHeight = getMaxPopupHeight(win.getComputedStyle(store.context.popupRef.current));
		const maxAvailableHeight = Math.min(doc.documentElement.clientHeight - marginTop - marginBottom, maxPopupHeight);
		const scrollTop = scroller.scrollTop;
		const maxScrollTop = getMaxScrollTop(scroller);
		let nextScrollTop = null;
		const setHeight = (height) => {
			positionerElement.style.height = `${height}px`;
		};
		const diff = isTopPositioned ? maxScrollTop - scrollTop : scrollTop;
		const nextHeight = Math.min(currentHeight + diff, maxAvailableHeight);
		if (diff <= 1) {
			const heightDelta = clamp(diff, 0, maxAvailableHeight - currentHeight);
			if (heightDelta > 0) setHeight(currentHeight + heightDelta);
			scroller.scrollTop = isTopPositioned ? maxScrollTop : 0;
			if (maxAvailableHeight - (currentHeight + heightDelta) <= 1) reachedMaxHeightRef.current = true;
			store.context.handleScrollArrowVisibility(scroller);
			return;
		}
		if (maxAvailableHeight - nextHeight > 1) nextScrollTop = isTopPositioned ? Infinity : 0;
		else if (isBottomPositioned && scrollTop < maxScrollTop) nextScrollTop = scrollTop - (diff - (currentHeight + diff - maxAvailableHeight));
		const nextPositionerHeight = Math.ceil(nextHeight);
		if (nextPositionerHeight !== 0) setHeight(nextPositionerHeight);
		if (nextScrollTop != null) {
			const target = clamp(nextScrollTop, 0, getMaxScrollTop(scroller));
			if (Math.abs(scroller.scrollTop - target) > 1) scroller.scrollTop = target;
		}
		if (nextPositionerHeight >= maxAvailableHeight - 1) reachedMaxHeightRef.current = true;
		store.context.handleScrollArrowVisibility(scroller);
	});
	import__wp_global_react.useImperativeHandle(store.context.scrollHandlerRef, () => handleScroll, [handleScroll]);
	useOpenChangeComplete({
		open,
		ref: store.context.popupRef,
		onComplete() {
			if (open) store.context.onOpenChangeComplete(true);
		}
	});
	const state = {
		open,
		transitionStatus,
		side,
		align
	};
	useIsoLayoutEffect(() => {
		if (!positionerElement || !store.context.popupRef.current || Object.keys(originalPositionerStylesRef.current).length) return;
		originalPositionerStylesRef.current = {
			top: positionerElement.style.top || "0",
			left: positionerElement.style.left || "0",
			right: positionerElement.style.right,
			height: positionerElement.style.height,
			bottom: positionerElement.style.bottom,
			minHeight: positionerElement.style.minHeight,
			maxHeight: positionerElement.style.maxHeight,
			marginTop: positionerElement.style.marginTop,
			marginBottom: positionerElement.style.marginBottom
		};
	}, [store, positionerElement]);
	useIsoLayoutEffect(() => {
		if (open || alignItemWithTriggerActive) return;
		initialPlacedRef.current = false;
		reachedMaxHeightRef.current = false;
		clearStyles(positionerElement, originalPositionerStylesRef.current);
	}, [
		open,
		alignItemWithTriggerActive,
		positionerElement
	]);
	useIsoLayoutEffect(() => {
		const popupElement = store.context.popupRef.current;
		if (!open || !triggerElement || !positionerElement || !popupElement || alignItemWithTriggerActive && !isPositioned || store.state.transitionStatus === "ending") return;
		initialPlacedRef.current = true;
		popupElement.style.removeProperty(transformOrigin);
		if (!alignItemWithTriggerActive) {
			scrollArrowFrame.request(() => store.context.handleScrollArrowVisibility(listElement || popupElement));
			return;
		}
		const restoreTransformStyles = unsetTransformStyles(popupElement);
		try {
			let textElement = store.context.selectedItemTextRef.current;
			if (!textElement?.isConnected) textElement = !store.select("hasSelectedValue") && store.context.firstItemTextRef.current?.isConnected ? store.context.firstItemTextRef.current : null;
			const valueElement = store.context.valueRef.current;
			const win = getWindow(positionerElement);
			const positionerStyles = win.getComputedStyle(positionerElement);
			const popupStyles = win.getComputedStyle(popupElement);
			const doc = ownerDocument(triggerElement);
			const scale = getScale(triggerElement);
			const triggerRect = normalizeRect(triggerElement.getBoundingClientRect(), scale);
			const positionerRect = normalizeRect(positionerElement.getBoundingClientRect(), scale);
			const triggerHeight = triggerRect.height;
			const scroller = listElement || popupElement;
			const scrollHeight = scroller.scrollHeight;
			const borderBottom = parseFloat(popupStyles.borderBottomWidth);
			const marginTop = parseFloat(positionerStyles.marginTop) || 10;
			const marginBottom = parseFloat(positionerStyles.marginBottom) || 10;
			const minHeight = parseFloat(positionerStyles.minHeight) || 100;
			const maxPopupHeight = getMaxPopupHeight(popupStyles);
			const paddingLeft = 5;
			const paddingRight = 5;
			const triggerCollisionThreshold = 20;
			const viewportHeight = doc.documentElement.clientHeight - marginTop - marginBottom;
			const viewportWidth = doc.documentElement.clientWidth;
			const availableSpaceBeneathTrigger = viewportHeight - triggerRect.bottom + triggerHeight;
			let textRect;
			let alignedLeft = direction === "rtl" ? triggerRect.right - positionerRect.width : triggerRect.left;
			let offsetY = 0;
			if (textElement && valueElement) {
				const valueRect = normalizeRect(valueElement.getBoundingClientRect(), scale);
				textRect = normalizeRect(textElement.getBoundingClientRect(), scale);
				alignedLeft = positionerRect.left + (direction === "rtl" ? valueRect.right - textRect.right : valueRect.left - textRect.left);
				const valueCenterFromTriggerTop = valueRect.top - triggerRect.top + valueRect.height / 2;
				offsetY = textRect.top - positionerRect.top + textRect.height / 2 - valueCenterFromTriggerTop;
			}
			const idealHeight = availableSpaceBeneathTrigger + offsetY + marginBottom + borderBottom;
			let height = Math.min(viewportHeight, idealHeight);
			const maxHeight = viewportHeight - marginTop - marginBottom;
			const scrollTop = idealHeight - height;
			const maxRight = viewportWidth - paddingRight;
			positionerElement.style.left = `${clamp(alignedLeft, paddingLeft, maxRight - positionerRect.width)}px`;
			positionerElement.style.height = `${height}px`;
			positionerElement.style.maxHeight = "none";
			positionerElement.style.marginTop = `${marginTop}px`;
			positionerElement.style.marginBottom = `${marginBottom}px`;
			popupElement.style.height = "100%";
			const maxScrollTop = getMaxScrollTop(scroller);
			const isTopPositioned = scrollTop >= maxScrollTop - 1;
			if (isTopPositioned) height = Math.min(viewportHeight, positionerRect.height) - (scrollTop - maxScrollTop);
			const fallbackToAlignPopupToTrigger = triggerRect.top < triggerCollisionThreshold || triggerRect.bottom > viewportHeight - triggerCollisionThreshold || Math.ceil(height) + 1 < Math.min(scrollHeight, minHeight);
			const isPinchZoomed = (win.visualViewport?.scale ?? 1) !== 1 && webkit;
			if (fallbackToAlignPopupToTrigger || isPinchZoomed) {
				clearStyles(positionerElement, originalPositionerStylesRef.current);
				setControlledAlignItemWithTrigger(false);
				return;
			}
			const initialHeight = Math.max(minHeight, height);
			if (isTopPositioned) {
				const topOffset = Math.max(0, viewportHeight - idealHeight);
				positionerElement.style.top = positionerRect.height >= maxHeight ? "0" : `${topOffset}px`;
				positionerElement.style.height = `${height}px`;
				scroller.scrollTop = getMaxScrollTop(scroller);
			} else {
				positionerElement.style.bottom = "0";
				scroller.scrollTop = scrollTop;
			}
			if (textRect) {
				const popupTop = positionerRect.top;
				const popupHeight = positionerRect.height;
				const textCenterY = textRect.top + textRect.height / 2;
				const clampedY = clamp(popupHeight > 0 ? (textCenterY - popupTop) / popupHeight * 100 : 50, 0, 100);
				popupElement.style.setProperty(transformOrigin, `50% ${clampedY}%`);
			}
			if (initialHeight === viewportHeight || height >= maxPopupHeight) reachedMaxHeightRef.current = true;
			store.context.handleScrollArrowVisibility(scroller);
			if (highlightItemOnHover && store.state.selectedIndex === null && store.state.activeIndex === null && store.context.listRef.current[0] != null) store.set("activeIndex", 0);
		} finally {
			restoreTransformStyles();
		}
	}, [
		store,
		open,
		positionerElement,
		triggerElement,
		alignItemWithTriggerActive,
		setControlledAlignItemWithTrigger,
		scrollArrowFrame,
		listElement,
		highlightItemOnHover,
		direction,
		isPositioned
	]);
	import__wp_global_react.useEffect(() => {
		if (!alignItemWithTriggerActive || !positionerElement || !open) return;
		const win = getWindow(positionerElement);
		function handleResize(event) {
			store.context.setOpen(false, createChangeEventDetails(windowResize, event));
		}
		return addEventListener(win, "resize", handleResize);
	}, [
		store,
		alignItemWithTriggerActive,
		positionerElement,
		open
	]);
	const defaultProps = {
		...listElement ? { role: "presentation" } : {
			role: "listbox",
			"aria-multiselectable": multiple || void 0,
			"aria-readonly": readOnly || void 0,
			id: `${id}-list`
		},
		onKeyDown(event) {
			if (insideToolbar && COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
		},
		onScroll(event) {
			if (listElement) return;
			handleScroll(event.currentTarget);
		},
		...alignItemWithTriggerActive && { style: listElement ? { height: "100%" } : LIST_FUNCTIONAL_STYLES },
		className: !listElement && alignItemWithTriggerActive ? styleDisableScrollbar.className : void 0
	};
	const element = useRenderElement("div", componentProps, {
		ref: [forwardedRef, store.context.popupRef],
		state,
		stateAttributesMapping,
		props: [
			popupProps,
			defaultProps,
			getDisabledMountTransitionStyles(transitionStatus),
			elementProps
		]
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import__wp_global_react.Fragment, { children: [!disableStyleElements && styleDisableScrollbar.getElement(nonce), /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingFocusManager, {
		context: floatingRootContext,
		modal: false,
		disabled: !mounted,
		openInteractionType: openMethod,
		returnFocus: finalFocus,
		restoreFocus: true,
		children: element
	})] });
});
SelectPopup.displayName = "SelectPopup";
function getMaxPopupHeight(popupStyles) {
	const maxHeightStyle = popupStyles.maxHeight;
	return maxHeightStyle.endsWith("px") ? parseFloat(maxHeightStyle) || Infinity : Infinity;
}
function getMaxScrollTop(scroller) {
	return getMaxScrollOffset(scroller.scrollHeight, scroller.clientHeight);
}
function getScale(element) {
	return platform.getScale(element);
}
function normalizeSize(size, axis, scale) {
	return size / scale[axis];
}
function normalizeRect(rect, scale) {
	return rectToClientRect({
		x: normalizeSize(rect.x, "x", scale),
		y: normalizeSize(rect.y, "y", scale),
		width: normalizeSize(rect.width, "x", scale),
		height: normalizeSize(rect.height, "y", scale)
	});
}
const TRANSFORM_STYLE_RESETS = [
	["transform", "none"],
	["scale", "1"],
	["translate", "0 0"]
];
function unsetTransformStyles(popupElement) {
	const { style } = popupElement;
	const originalStyles = {};
	for (const [property, value] of TRANSFORM_STYLE_RESETS) {
		originalStyles[property] = style.getPropertyValue(property);
		style.setProperty(property, value, "important");
	}
	return () => {
		for (const [property] of TRANSFORM_STYLE_RESETS) {
			const originalValue = originalStyles[property];
			if (originalValue) style.setProperty(property, originalValue);
			else style.removeProperty(property);
		}
	};
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/list/SelectList.mjs
/**
* A container for the select items.
* Renders a `<div>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectList = /*#__PURE__*/ import__wp_global_react.forwardRef(function SelectList(componentProps, forwardedRef) {
	const { render, className, style, ...elementProps } = componentProps;
	const store = useSelectRootContext();
	const multiple = store.useState("multiple");
	const readOnly = store.useState("readOnly");
	const { alignItemWithTriggerActive } = useSelectPositionerContext();
	const hasScrollArrows = store.useState("hasScrollArrows");
	const openMethod = store.useState("openMethod");
	const defaultProps = {
		id: `${store.useState("id")}-list`,
		role: "listbox",
		"aria-multiselectable": multiple || void 0,
		"aria-readonly": readOnly || void 0,
		onScroll(event) {
			store.context.scrollHandlerRef.current?.(event.currentTarget);
		},
		...alignItemWithTriggerActive && { style: LIST_FUNCTIONAL_STYLES },
		className: hasScrollArrows && openMethod !== "touch" ? styleDisableScrollbar.className : void 0
	};
	const setListElement = store.useStateSetter("listElement");
	return useRenderElement("div", componentProps, {
		ref: [forwardedRef, setListElement],
		props: [defaultProps, elementProps]
	});
});
SelectList.displayName = "SelectList";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/item/SelectItemContext.mjs
const SelectItemContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
SelectItemContext.displayName = "SelectItemContext";
function useSelectItemContext() {
	const context = import__wp_global_react.useContext(SelectItemContext);
	if (!context) throw new Error("Base UI: SelectItemContext is missing. SelectItem parts must be placed within <Select.Item>.");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/item/SelectItem.mjs
/**
* An individual option in the select popup.
* Renders a `<div>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectItem = /*#__PURE__*/ import__wp_global_react.memo(/*#__PURE__*/ import__wp_global_react.forwardRef(function SelectItem(componentProps, forwardedRef) {
	const { render, className, style, value: itemValue = null, label, disabled: disabledProp = false, nativeButton = false, ...elementProps } = componentProps;
	const textRef = import__wp_global_react.useRef(null);
	const listItem = useCompositeListItem({
		guess: true,
		label,
		textRef
	});
	const store = useSelectRootContext();
	const { props: itemProps, multiple, disabled: selectDisabled, readOnly, isItemEqualToValue } = store.useState("itemRoot");
	const disabled = selectDisabled || disabledProp;
	const highlighted = store.useState("isActive", listItem.index);
	const open = store.useState("open");
	const selected = store.useState("isSelected", itemValue);
	const selectedByFocus = store.useState("isSelectedByFocus", listItem.index);
	const index = listItem.index;
	const itemRef = import__wp_global_react.useRef(null);
	useIsoLayoutEffect(() => {
		const values = store.context.valuesRef.current;
		values[index] = itemValue;
		return () => {
			delete values[index];
		};
	}, [
		index,
		itemValue,
		store
	]);
	useIsoLayoutEffect(() => {
		const selectedValue = store.state.value;
		const currentIndex = store.state.selectedIndex;
		let nextIndex = currentIndex;
		let claims;
		if (multiple && Array.isArray(selectedValue)) {
			nextIndex = resolveSelectedIndex(index, itemValue, store.context.valuesRef.current, selectedValue, isItemEqualToValue, currentIndex);
			claims = nextIndex === index;
			if (index === currentIndex && !claims) store.context.selectedItemTextRef.current = null;
		} else {
			claims = selectedValue !== void 0 && compareItemEquality(itemValue, selectedValue, isItemEqualToValue);
			if (claims) nextIndex = index;
		}
		store.set("selectedIndex", nextIndex);
		if (claims && textRef.current) store.context.selectedItemTextRef.current = textRef.current;
	}, [
		index,
		multiple,
		isItemEqualToValue,
		store,
		itemValue
	]);
	const pointerTypeRef = import__wp_global_react.useRef("mouse");
	const allowMouseSelectionRef = import__wp_global_react.useRef(false);
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		focusableWhenDisabled: true,
		native: nativeButton,
		composite: true
	});
	const state = {
		disabled,
		selected,
		highlighted
	};
	function commitSelection(event) {
		if (selectDisabled || readOnly) return;
		const selectedValue = store.state.value;
		if (multiple) {
			const currentValue = Array.isArray(selectedValue) ? selectedValue : [];
			const nextValue = selected ? removeItem(currentValue, itemValue, isItemEqualToValue) : [...currentValue, itemValue];
			store.context.setValue(nextValue, createChangeEventDetails(itemPress, event));
		} else {
			store.context.setValue(itemValue, createChangeEventDetails(itemPress, event));
			store.context.setOpen(false, createChangeEventDetails(itemPress, event));
		}
	}
	function resetDragMovement() {
		store.context.selectionRef.current.dragY = 0;
	}
	const defaultProps = {
		role: "option",
		"aria-selected": selected,
		tabIndex: open && highlighted ? 0 : -1,
		onKeyDown(event) {
			store.set("activeIndex", index);
			if (event.key === " " && store.context.typingRef.current) event.preventDefault();
		},
		onClick(event) {
			const isMouseClick = pointerTypeRef.current !== "touch";
			const clickPointerType = event.nativeEvent.pointerType;
			const isVirtualMouseClick = isMouseClick && isVirtualClick(event.nativeEvent) && (clickPointerType !== void 0 || highlighted);
			const isInvalidMouseClick = isMouseClick && !isVirtualMouseClick && !allowMouseSelectionRef.current;
			allowMouseSelectionRef.current = false;
			if (disabled || isInvalidMouseClick) return;
			commitSelection(event.nativeEvent);
		},
		onPointerEnter(event) {
			pointerTypeRef.current = event.pointerType;
		},
		onPointerMove(event) {
			if (event.pointerType === "mouse" && event.buttons === 1) {
				const selection = store.context.selectionRef.current;
				selection.dragY += event.movementY;
				if (selection.dragY ** 2 >= 64) selection.allowUnselectedMouseUp = true;
			}
		},
		onPointerDown(event) {
			pointerTypeRef.current = event.pointerType;
			allowMouseSelectionRef.current = true;
			resetDragMovement();
		},
		onMouseUp() {
			resetDragMovement();
			if (disabled || pointerTypeRef.current === "touch") return;
			if (allowMouseSelectionRef.current) return;
			const disallowSelectedMouseUp = !store.context.selectionRef.current.allowSelectedMouseUp && selected;
			const disallowUnselectedMouseUp = !store.context.selectionRef.current.allowUnselectedMouseUp && !selected;
			if (disallowSelectedMouseUp || disallowUnselectedMouseUp) return;
			allowMouseSelectionRef.current = true;
			itemRef.current?.click();
			allowMouseSelectionRef.current = false;
		}
	};
	const element = useRenderElement("div", componentProps, {
		ref: [
			buttonRef,
			forwardedRef,
			listItem.ref,
			itemRef
		],
		state,
		props: [
			itemProps,
			defaultProps,
			elementProps,
			getButtonProps
		]
	});
	const contextValue = import__wp_global_react.useMemo(() => ({
		selected,
		index,
		textRef,
		selectedByFocus
	}), [
		selected,
		index,
		textRef,
		selectedByFocus
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(SelectItemContext.Provider, {
		value: contextValue,
		children: element
	});
}));
SelectItem.displayName = "SelectItem";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/item-text/SelectItemText.mjs
/**
* A text label of the select item.
* Renders a `<div>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectItemText = /*#__PURE__*/ import__wp_global_react.memo(/*#__PURE__*/ import__wp_global_react.forwardRef(function SelectItemText(componentProps, forwardedRef) {
	const { index, textRef, selectedByFocus } = useSelectItemContext();
	const store = useSelectRootContext();
	const { render, className, style, ...elementProps } = componentProps;
	const localRef = import__wp_global_react.useCallback((node) => {
		if (!node) return;
		if (index === 0) store.context.firstItemTextRef.current = node;
		if (selectedByFocus) store.context.selectedItemTextRef.current = node;
	}, [
		store,
		index,
		selectedByFocus
	]);
	return useRenderElement("div", componentProps, {
		ref: [
			localRef,
			forwardedRef,
			textRef
		],
		props: elementProps
	});
}));
SelectItemText.displayName = "SelectItemText";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/group/SelectGroupContext.mjs
const SelectGroupContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
SelectGroupContext.displayName = "SelectGroupContext";
function useSelectGroupContext() {
	const context = import__wp_global_react.useContext(SelectGroupContext);
	if (context === void 0) throw new Error("Base UI: SelectGroupContext is missing. SelectGroup parts must be placed within <Select.Group>.");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/group/SelectGroup.mjs
/**
* Groups related select items with the corresponding label.
* Renders a `<div>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectGroup = /*#__PURE__*/ import__wp_global_react.forwardRef(function SelectGroup(componentProps, forwardedRef) {
	const { render, className, style, ...elementProps } = componentProps;
	const [labelId, setLabelId] = import__wp_global_react.useState();
	const contextValue = import__wp_global_react.useMemo(() => ({
		labelId,
		setLabelId
	}), [labelId, setLabelId]);
	const element = useRenderElement("div", componentProps, {
		ref: forwardedRef,
		props: [{
			role: "group",
			"aria-labelledby": labelId
		}, elementProps]
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(SelectGroupContext.Provider, {
		value: contextValue,
		children: element
	});
});
SelectGroup.displayName = "SelectGroup";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/group-label/SelectGroupLabel.mjs
/**
* An accessible label that is automatically associated with its parent group.
* Renders a `<div>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectGroupLabel = /*#__PURE__*/ import__wp_global_react.forwardRef(function SelectGroupLabel(componentProps, forwardedRef) {
	const { render, className, style, id: idProp, ...elementProps } = componentProps;
	const { setLabelId } = useSelectGroupContext();
	const id = useBaseUiId(idProp);
	useIsoLayoutEffect(() => {
		setLabelId(id);
		return () => {
			setLabelId((currentId) => currentId === id ? void 0 : currentId);
		};
	}, [id, setLabelId]);
	return useRenderElement("div", componentProps, {
		ref: forwardedRef,
		props: [{
			id,
			"aria-hidden": true
		}, elementProps]
	});
});
SelectGroupLabel.displayName = "SelectGroupLabel";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/select/separator/SelectSeparator.mjs
/**
* A visual separator between items or groups.
* Renders a `<div>` element.
*
* Documentation: [Base UI Select](https://base-ui.com/react/components/select)
*/
const SelectSeparator = ListboxSeparator;

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

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// packages/icons/build-module/library/check.mjs
var check_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M7 12L10 15L17 8" })
});

// packages/icons/build-module/library/chevron-down.mjs
var chevron_down_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M7 11L12 15L17 11" })
});

// packages/icons/build-module/library/copy-small.mjs
var copy_small_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Rect, {
		x: "4.75",
		y: "4.75",
		width: "11.5",
		height: "11.5",
		rx: "0.875"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M19.25 8.281V17.281C19.25 18.3692 18.3546 19.25 17.251 19.25H6.25" })]
});

// packages/icons/build-module/library/drafts.mjs
var drafts_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12H8C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16Z",
		fill: "currentColor",
		fillRule: "evenodd",
		clipRule: "evenodd",
		stroke: "none"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25Z",
		strokeLinejoin: "round"
	})]
});

// packages/icons/build-module/library/not-allowed.mjs
var not_allowed_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M6.87347 6.87348L17.1265 17.1265M4.75 12C4.75 7.99593 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99593 19.25 4.75 16.0041 4.75 12Z",
		strokeLinejoin: "round"
	})
});

// packages/icons/build-module/library/pending.mjs
var pending_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12H12V8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16Z",
		fill: "currentColor",
		fillRule: "evenodd",
		clipRule: "evenodd",
		stroke: "none"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25Z",
		strokeLinejoin: "round"
	})]
});

// packages/icons/build-module/library/published.mjs
var published_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25Z",
		strokeLinejoin: "round"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M9 12L11 14L15 10" })]
});

// packages/icons/build-module/library/reset.mjs
var reset_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M7 12H17" })
});

// packages/icons/build-module/library/scheduled.mjs
var scheduled_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25Z",
		strokeLinejoin: "round"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M9.5 12.25H12.25V8" })]
});

// packages/icons/build-module/library/trash.mjs
var trash_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M5 7.5H7M19 7.5H17M17 7.5L16.1588 17.1733C16.069 18.2068 15.2038 19 14.1664 19H9.83363C8.79622 19 7.93102 18.2068 7.84115 17.1733L7 7.5M17 7.5H14.9897M7 7.5H9.01027M14.9897 7.5C14.8627 5.96012 13.5727 4.75 12 4.75C10.4273 4.75 9.13731 5.96012 9.01027 7.5M14.9897 7.5H9.01027" })
});

// packages/ui/build-module/visually-hidden/visually-hidden.mjs
const STYLE_HASH_ATTRIBUTE$38 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$38() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$38(document);
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
function documentContainsStyleHash$38(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$38}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$38) === hash) return true;
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
function injectStyle$38(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$38();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$38(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$38, hash);
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
function registerDocument$38(targetDocument) {
	const runtime = getRuntime$38();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$38(targetDocument, hash, css);
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
function registerStyle$38(hash, css) {
	const runtime = getRuntime$38();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$38(targetDocument, hash, css);
}
registerStyle$38("7caae29f9e", ".e2c3cbe6ada7d785__visually-hidden{border:0;clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;overflow-wrap:normal;padding:0;position:absolute;width:1px;word-break:normal}");
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

// packages/ui/build-module/utils/item-popup/item-content.mjs
function parseItemContent(children, { Label, Description, validationMessage }) {
	const [label, ...descriptions] = import_element.Children.toArray(children);
	const hasLabel = (0, import_element.isValidElement)(label) && label.type === Label;
	const descriptionElements = descriptions.filter((description) => (0, import_element.isValidElement)(description) && description.type === Description);
	if (!hasLabel || descriptionElements.length !== descriptions.length) throw new Error(validationMessage);
	return {
		descriptionIds: descriptionElements.map((description) => description.props.id),
		hasLabel,
		labelId: hasLabel ? label.props.id : void 0
	};
}
function useItemContent(children, components, { "aria-describedby": ariaDescribedBy, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy } = {}) {
	const generatedLabelId = (0, import_element.useId)();
	const generatedDescriptionId = (0, import_element.useId)();
	const { descriptionIds, hasLabel, labelId } = parseItemContent(children, components);
	const resolvedLabelId = hasLabel ? labelId ?? generatedLabelId : void 0;
	const resolvedDescriptionIds = descriptionIds.map((descriptionId, index) => descriptionId ?? `${generatedDescriptionId}-${index}`);
	const itemDescribedBy = Array.from(/* @__PURE__ */ new Set([...ariaDescribedBy?.split(/\s+/).filter(Boolean) ?? [], ...resolvedDescriptionIds])).join(" ");
	let descriptionIndex = 0;
	const { Label, Description, descriptionValidationToken } = components;
	return {
		contentChildren: import_element.Children.map(children, (child) => {
			if (!(0, import_element.isValidElement)(child)) return child;
			if (child.type === Label) return child.props.id === resolvedLabelId ? child : (0, import_element.cloneElement)(child, { id: resolvedLabelId });
			if (child.type !== Description) return child;
			const descriptionId = resolvedDescriptionIds[descriptionIndex++];
			if (!descriptionValidationToken && child.props.id === descriptionId) return child;
			return (0, import_element.cloneElement)(child, {
				id: descriptionId,
				...descriptionValidationToken && { validationToken: descriptionValidationToken }
			});
		}),
		resolvedLabelId,
		itemAriaProps: {
			"aria-describedby": itemDescribedBy || void 0,
			"aria-label": ariaLabel,
			"aria-labelledby": ariaLabelledBy ?? (ariaLabel ? void 0 : resolvedLabelId)
		}
	};
}

// packages/ui/build-module/text/text.mjs
const STYLE_HASH_ATTRIBUTE$37 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$37() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$37(document);
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
function documentContainsStyleHash$37(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$37}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$37) === hash) return true;
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
function injectStyle$37(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$37();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$37(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$37, hash);
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
function registerDocument$37(targetDocument) {
	const runtime = getRuntime$37();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$37(targetDocument, hash, css);
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
function registerStyle$37(hash, css) {
	const runtime = getRuntime$37();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$37(targetDocument, hash, css);
}
registerStyle$37("09bae534ff", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9745ffa515d864cf__text{text-wrap:pretty;margin:0}._8882b6a7feb4fd3d__heading-2xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-p-line-height:var(--wpds-typography-line-height-2xl,40px);font-size:var(--wpds-typography-font-size-2xl,32px);line-height:var(--wpds-typography-line-height-2xl,40px)}._664e3e7687c45603__heading-xl,._8882b6a7feb4fd3d__heading-2xl{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600)}._664e3e7687c45603__heading-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-md,24px)}.dac661a5de0ed2bd__heading-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-lg,15px)}._59c7f3f740e2f96e__heading-md,.dac661a5de0ed2bd__heading-lg{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-sm,20px)}._59c7f3f740e2f96e__heading-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px)}.cf052fbad8d93b7e__heading-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._212b9cfef57a0af4__body-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-xl,32px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-xl,32px)}._07f57bc0aa36b2c6__body-lg,._212b9cfef57a0af4__body-xl{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}._07f57bc0aa36b2c6__body-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-lg,15px);line-height:var(--wpds-typography-line-height-md,24px)}._0c6da4457aec9e62__body-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px)}._0c6da4457aec9e62__body-md,.b998f87ff17b7bec__body-sm{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}.b998f87ff17b7bec__body-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
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
registerStyle$37("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default$6 = {
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
		props: mergeProps(props, { className: clsx(style_module_default$24.text, global_css_defense_module_default$6.heading, global_css_defense_module_default$6.p, style_module_default$24[variant], className) })
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

// packages/ui/build-module/utils/css/item-popup.mjs
const STYLE_HASH_ATTRIBUTE$36 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$36() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$36(document);
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
function documentContainsStyleHash$36(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$36}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$36) === hash) return true;
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
function injectStyle$36(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$36();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$36(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$36, hash);
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
function registerDocument$36(targetDocument) {
	const runtime = getRuntime$36();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$36(targetDocument, hash, css);
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
function registerStyle$36(hash, css) {
	const runtime = getRuntime$36();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$36(targetDocument, hash, css);
}
registerStyle$36("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
var item_popup_module_default$8 = {
	"popup": "f44105ad1a552523__popup _069972d5e326bada__dropdown-motion",
	"is-width-anchor": "f20f14dd818510c6__is-width-anchor",
	"is-width-content": "_398b31dcd487e37f__is-width-content",
	"is-width-available": "_481aa05a209e4968__is-width-available",
	"is-width-sm": "_75f4d59e8cd4fbf1__is-width-sm",
	"is-width-md": "_9b640ab112999a71__is-width-md",
	"is-width-lg": "_3bf04b25e9ec1c2c__is-width-lg",
	"fixed-width-presets": "_543f334dbb899cca__fixed-width-presets",
	"is-align-item-with-trigger": "_31995ce6e72ae51c__is-align-item-with-trigger",
	"list-chrome": "c61ae8ac6b17caf6__list-chrome",
	"item-icon": "_41ac90fbb134576c__item-icon",
	"list": "_6f78c164f55857d2__list c61ae8ac6b17caf6__list-chrome",
	"list-scrollable-container": "d50f53b586266e4c__list-scrollable-container",
	"list-footer": "_44be0354ea94ae76__list-footer",
	"group": "e46f00c85691b978__group",
	"group-label": "_7c8dd3d445b9e0d1__group-label",
	"separator": "_6590ed1ca0955506__separator",
	"item-layout": "c53905a339ee5b93__item-layout",
	"item": "baf88da98aa22472__item c53905a339ee5b93__item-layout",
	"is-size-small": "c1884bb8f08d6b49__is-size-small",
	"item-indicator-icon": "bacbdc6d2167ebdd__item-indicator-icon",
	"item-content": "_128e9f67dabbe8cd__item-content",
	"item-text": "_96a7e33bb57975a2__item-text",
	"item-label": "bad7b55318907302__item-label",
	"item-description": "_2e4ebd9f6d7ce5d4__item-description",
	"loading-indicator": "_384062150817186f__loading-indicator c53905a339ee5b93__item-layout",
	"status": "c4502685591e2f57__status",
	"empty": "_46236ecbce83a6f0__empty",
	"loading-spinner": "_9dd46ff6c5337aad__loading-spinner"
};
function getItemPopupWidthClassName(width = "anchor") {
	switch (width) {
		case "available": return item_popup_module_default$8["is-width-available"];
		case "content": return item_popup_module_default$8["is-width-content"];
		case "lg": return item_popup_module_default$8["is-width-lg"];
		case "md": return item_popup_module_default$8["is-width-md"];
		case "sm": return item_popup_module_default$8["is-width-sm"];
		case "anchor": return item_popup_module_default$8["is-width-anchor"];
		default: return false;
	}
}

// packages/ui/build-module/utils/wp-compat-overlay-slot.mjs
const STYLE_HASH_ATTRIBUTE$35 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$35() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$35(document);
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
function documentContainsStyleHash$35(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$35}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$35) === hash) return true;
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
function injectStyle$35(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$35();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$35(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$35, hash);
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
function registerDocument$35(targetDocument) {
	const runtime = getRuntime$35();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$35(targetDocument, hash, css);
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
function registerStyle$35(hash, css) {
	const runtime = getRuntime$35();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$35(targetDocument, hash, css);
}
registerStyle$35("40df669685", "._9e7887c25dedb459__slot{inset:0;isolation:isolate;pointer-events:none;position:fixed;z-index:1000000003}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._9e7887c25dedb459__slot>*{pointer-events:auto}}}");
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

// packages/ui/build-module/form/primitives/constants.mjs
/**
* Shared positioning defaults for item-list popups, e.g. Select, Combobox,
* or Autocomplete.
*/
const ITEM_POPUP_POSITIONER_PROPS = {
	align: "start",
	sideOffset: 8,
	collisionPadding: 12
};

// packages/ui/build-module/utils/direction-provider.mjs
var import_i18n = require_i18n();
/**
* Provides WordPress's text direction to Base UI components.
*/
function DirectionProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectionProvider$1, {
		direction: (0, import_i18n.isRTL)() ? "rtl" : "ltr",
		children
	});
}

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/ui/build-module/link/link.mjs
const STYLE_HASH_ATTRIBUTE$34 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$34() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$34(document);
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
function documentContainsStyleHash$34(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$34}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$34) === hash) return true;
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
function injectStyle$34(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$34();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$34(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$34, hash);
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
function registerDocument$34(targetDocument) {
	const runtime = getRuntime$34();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$34(targetDocument, hash, css);
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
function registerStyle$34(hash, css) {
	const runtime = getRuntime$34();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$34(targetDocument, hash, css);
}
registerStyle$34("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default$5 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$34("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
var focus_module_default$3 = {
	"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
	"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
	"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
	"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
	"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
};
registerStyle$34("c87d91cdf7", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.a574f9f242212d58__link{--_gcd-a-border-radius:var(--wpds-border-radius-sm,2px);border-radius:var(--wpds-border-radius-sm,2px);text-decoration-thickness:from-font;text-underline-offset:.2em}._2d2f0506e717a46c__link-with-icon{text-decoration-line:none}._92b7b6a03fbb27ac__link-contents{text-decoration:inherit;text-decoration-line:underline}._69f40d9212adc58d__is-brand,._69f40d9212adc58d__is-brand:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9))}._69f40d9212adc58d__is-brand:active,._69f40d9212adc58d__is-brand:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000))}._9a9c54c6e67b4c3c__is-neutral,._9a9c54c6e67b4c3c__is-neutral:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);text-decoration-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d)}._9a9c54c6e67b4c3c__is-neutral:active,._9a9c54c6e67b4c3c__is-neutral:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e)}._93be0b747897baad__is-unstyled{--_gcd-a-border-radius:0;--_gcd-a-color:inherit;color:inherit;text-decoration:none}._9c39df40fdc09594__link-icon{font-weight:var(--wpds-typography-font-weight-default,400);line-height:1;margin-inline-start:var(--wpds-dimension-padding-xs,4px);text-decoration:none}._9c39df40fdc09594__link-icon:after{content:\"\\2060\\2197\"}._9c39df40fdc09594__link-icon:dir(rtl):after{content:\"\\2060\\2196\"}}}");
var style_module_default$23 = {
	"link": "a574f9f242212d58__link",
	"link-with-icon": "_2d2f0506e717a46c__link-with-icon",
	"link-contents": "_92b7b6a03fbb27ac__link-contents",
	"is-brand": "_69f40d9212adc58d__is-brand",
	"is-neutral": "_9a9c54c6e67b4c3c__is-neutral",
	"is-unstyled": "_93be0b747897baad__is-unstyled",
	"link-icon": "_9c39df40fdc09594__link-icon"
};
registerStyle$34("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default$5 = {
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
			className: clsx(global_css_defense_module_default$5.a, resets_module_default$5["box-sizing"], focus_module_default$3["outset-ring--focus-except-active"], variant !== "unstyled" && style_module_default$23.link, variant !== "unstyled" && shouldShowNewTabIndicator && style_module_default$23["link-with-icon"], variant !== "unstyled" && style_module_default$23[`is-${tone}`], variant === "unstyled" && style_module_default$23["is-unstyled"], className),
			target: target ?? (openInNewTab ? "_blank" : void 0),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [shouldShowNewTabIndicator && variant !== "unstyled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: style_module_default$23["link-contents"],
				children
			}) : children, shouldShowNewTabIndicator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: style_module_default$23["link-icon"],
				role: "img",
				"aria-label": (0, import_i18n.__)("(opens in a new tab)")
			})] })
		})
	});
});

// packages/ui/build-module/stack/stack.mjs
const STYLE_HASH_ATTRIBUTE$33 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$33() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$33(document);
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
function documentContainsStyleHash$33(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$33}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$33) === hash) return true;
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
function injectStyle$33(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$33();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$33(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$33, hash);
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
function registerDocument$33(targetDocument) {
	const runtime = getRuntime$33();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$33(targetDocument, hash, css);
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
function registerStyle$33(hash, css) {
	const runtime = getRuntime$33();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$33(targetDocument, hash, css);
}
registerStyle$33("67591fa198", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._8e8e79c1a2eec43b__stack{display:flex}}}");
var style_module_default$22 = { "stack": "_8e8e79c1a2eec43b__stack" };
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
			className: style_module_default$22.stack
		})
	});
});

// packages/ui/build-module/form/primitives/input-layout/input-layout.mjs
const STYLE_HASH_ATTRIBUTE$32 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$32() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$32(document);
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
function documentContainsStyleHash$32(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$32}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$32) === hash) return true;
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
function injectStyle$32(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$32();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$32(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$32, hash);
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
function registerDocument$32(targetDocument) {
	const runtime = getRuntime$32();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$32(targetDocument, hash, css);
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
function registerStyle$32(hash, css) {
	const runtime = getRuntime$32();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$32(targetDocument, hash, css);
}
registerStyle$32("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default$4 = {
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
registerStyle$32("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default$4 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$32("e6c5a41f63", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._505ff76c91c9038c__input-layout{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-md,12px);background-color:var(--wpds-color-background-interactive-neutral,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:var(--wpds-border-width-xs,1px);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);height:var(--wpds-dimension-size-lg,40px);line-height:1;&.eb482a6b817df402__is-size-compact{height:var(--wpds-dimension-size-md,32px)}&._5fcbd992e43c8b58__is-size-small,&.eb482a6b817df402__is-size-compact{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-sm,8px)}&._5fcbd992e43c8b58__is-size-small{height:var(--wpds-dimension-size-sm,24px)}&._433416a57235dc04__is-disabled,&:has([data-can-disable-input-layout][data-disabled]){color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);@media (forced-colors:active){color:GrayText}&:not(.a9a2f3bdee850c03__is-borderless){background-color:var(--wpds-color-background-interactive-neutral-disabled,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText}}}&.a9a2f3bdee850c03__is-borderless{background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);border-color:transparent}&:has(.ba99c8588802f965__input-layout-slot:focus-within){--_gcd-div-outline:none;outline:none}&:hover:not(._433416a57235dc04__is-disabled,:has([data-can-disable-input-layout][data-disabled]),.a9a2f3bdee850c03__is-borderless){background-color:var(--wpds-color-background-interactive-neutral-active,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e)}&:has(:invalid[data-validity-visible]){--focus-color:var(--wpds-color-stroke-interactive-error,#cc1818);border-color:var(--wpds-color-stroke-interactive-error,#cc1818);&:hover{border-color:var(--wpds-color-stroke-interactive-error-active,#9d0000)}}}._167e32215c7469f1__slot-wrapper{display:contents}.ba99c8588802f965__input-layout-slot{align-items:center;display:flex;flex-shrink:0;&._377d165e02d0baa2__is-padding-minimal{--wp-ui-input-layout-prefix-padding-start:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px));--wp-ui-input-layout-suffix-padding-end:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}[data-slot-type=prefix] &{padding-inline-start:var(--wp-ui-input-layout-prefix-padding-start,var(--wp-ui-input-layout-padding-inline))}[data-slot-type=suffix] &{padding-inline-end:var(--wp-ui-input-layout-suffix-padding-end,var(--wp-ui-input-layout-padding-inline))}}}}");
var style_module_default$21 = {
	"input-layout": "_505ff76c91c9038c__input-layout",
	"is-size-compact": "eb482a6b817df402__is-size-compact",
	"is-size-small": "_5fcbd992e43c8b58__is-size-small",
	"is-disabled": "_433416a57235dc04__is-disabled",
	"is-borderless": "a9a2f3bdee850c03__is-borderless",
	"input-layout-slot": "ba99c8588802f965__input-layout-slot",
	"slot-wrapper": "_167e32215c7469f1__slot-wrapper",
	"is-padding-minimal": "_377d165e02d0baa2__is-padding-minimal"
};
/**
* A low-level component that handles the visual layout of an input-like field,
* including disabled states and standard prefix/suffix slots.
*/
const InputLayout$1 = (0, import_element.forwardRef)(function UnforwardedInputLayout({ className, children, visuallyDisabled, size = "default", isBorderless, prefix, suffix, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: clsx(global_css_defense_module_default$4.div, resets_module_default$4["box-sizing"], style_module_default$21["input-layout"], style_module_default$21[`is-size-${size}`], visuallyDisabled && style_module_default$21["is-disabled"], isBorderless && style_module_default$21["is-borderless"], className),
		...restProps,
		children: [
			import_element.Children.count(prefix) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$21["slot-wrapper"],
				"data-slot-type": "prefix",
				children: prefix
			}),
			children,
			import_element.Children.count(suffix) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$21["slot-wrapper"],
				"data-slot-type": "suffix",
				children: suffix
			})
		]
	});
});

// packages/ui/build-module/form/primitives/input-layout/slot.mjs
const STYLE_HASH_ATTRIBUTE$31 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$31() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$31(document);
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
function documentContainsStyleHash$31(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$31}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$31) === hash) return true;
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
function injectStyle$31(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$31();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$31(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$31, hash);
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
function registerDocument$31(targetDocument) {
	const runtime = getRuntime$31();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$31(targetDocument, hash, css);
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
function registerStyle$31(hash, css) {
	const runtime = getRuntime$31();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$31(targetDocument, hash, css);
}
registerStyle$31("e6c5a41f63", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._505ff76c91c9038c__input-layout{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-md,12px);background-color:var(--wpds-color-background-interactive-neutral,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:var(--wpds-border-width-xs,1px);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);height:var(--wpds-dimension-size-lg,40px);line-height:1;&.eb482a6b817df402__is-size-compact{height:var(--wpds-dimension-size-md,32px)}&._5fcbd992e43c8b58__is-size-small,&.eb482a6b817df402__is-size-compact{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-sm,8px)}&._5fcbd992e43c8b58__is-size-small{height:var(--wpds-dimension-size-sm,24px)}&._433416a57235dc04__is-disabled,&:has([data-can-disable-input-layout][data-disabled]){color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);@media (forced-colors:active){color:GrayText}&:not(.a9a2f3bdee850c03__is-borderless){background-color:var(--wpds-color-background-interactive-neutral-disabled,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText}}}&.a9a2f3bdee850c03__is-borderless{background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);border-color:transparent}&:has(.ba99c8588802f965__input-layout-slot:focus-within){--_gcd-div-outline:none;outline:none}&:hover:not(._433416a57235dc04__is-disabled,:has([data-can-disable-input-layout][data-disabled]),.a9a2f3bdee850c03__is-borderless){background-color:var(--wpds-color-background-interactive-neutral-active,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e)}&:has(:invalid[data-validity-visible]){--focus-color:var(--wpds-color-stroke-interactive-error,#cc1818);border-color:var(--wpds-color-stroke-interactive-error,#cc1818);&:hover{border-color:var(--wpds-color-stroke-interactive-error-active,#9d0000)}}}._167e32215c7469f1__slot-wrapper{display:contents}.ba99c8588802f965__input-layout-slot{align-items:center;display:flex;flex-shrink:0;&._377d165e02d0baa2__is-padding-minimal{--wp-ui-input-layout-prefix-padding-start:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px));--wp-ui-input-layout-suffix-padding-end:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}[data-slot-type=prefix] &{padding-inline-start:var(--wp-ui-input-layout-prefix-padding-start,var(--wp-ui-input-layout-padding-inline))}[data-slot-type=suffix] &{padding-inline-end:var(--wp-ui-input-layout-suffix-padding-end,var(--wp-ui-input-layout-padding-inline))}}}}");
var style_module_default$20 = {
	"input-layout": "_505ff76c91c9038c__input-layout",
	"is-size-compact": "eb482a6b817df402__is-size-compact",
	"is-size-small": "_5fcbd992e43c8b58__is-size-small",
	"is-disabled": "_433416a57235dc04__is-disabled",
	"is-borderless": "a9a2f3bdee850c03__is-borderless",
	"input-layout-slot": "ba99c8588802f965__input-layout-slot",
	"slot-wrapper": "_167e32215c7469f1__slot-wrapper",
	"is-padding-minimal": "_377d165e02d0baa2__is-padding-minimal"
};
/**
* A layout helper to add paddings in a prefix or suffix.
*/
const InputLayoutSlot = (0, import_element.forwardRef)(function UnforwardedInputLayoutSlot({ padding = "default", className, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: clsx(style_module_default$20["input-layout-slot"], style_module_default$20[`is-padding-${padding}`], className),
		...restProps
	});
});
InputLayoutSlot.displayName = "InputLayout.Slot";

// packages/ui/build-module/form/primitives/input-layout/index.mjs
/**
* A low-level component that handles the visual layout of an input-like field,
* including disabled states and standard prefix/suffix slots.
*/
const InputLayout = Object.assign(InputLayout$1, { Slot: InputLayoutSlot });

// packages/ui/build-module/form/primitives/input/input.mjs
const STYLE_HASH_ATTRIBUTE$30 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$30() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$30(document);
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
function documentContainsStyleHash$30(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$30}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$30) === hash) return true;
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
function injectStyle$30(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$30();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$30(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$30, hash);
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
function registerDocument$30(targetDocument) {
	const runtime = getRuntime$30();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$30(targetDocument, hash, css);
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
function registerStyle$30(hash, css) {
	const runtime = getRuntime$30();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$30(targetDocument, hash, css);
}
registerStyle$30("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default$3 = {
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
registerStyle$30("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
var focus_module_default$2 = {
	"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
	"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
	"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
	"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
	"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
};
registerStyle$30("a53cd10a80", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9edfcd97eeaee9dc__input{--_gcd-input-padding:var(--wp-ui-input-padding-block,0px) var(--wp-ui-input-layout-padding-inline,0px);--_gcd-input-font-size:max(var(--wpds-typography-font-size-md,13px),16px);background:transparent;border:none;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:inherit;font-size:inherit;line-height:inherit;outline:none;padding-block:var(--wp-ui-input-padding-block,0);padding-inline:var(--wp-ui-input-layout-padding-inline,0);width:100%;@media (min-width:600px){--_gcd-input-font-size:inherit}&::placeholder{color:var(--wpds-color-foreground-interactive-neutral-weak,#707070)}&:disabled,&[aria-disabled=true]{--_gcd-input-placeholder-color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&::placeholder{color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}@media (forced-colors:active){color:GrayText}}&[type=email],&[type=url]{direction:ltr}&[type=number]{appearance:textfield;&::-webkit-inner-spin-button,&::-webkit-outer-spin-button{appearance:none;margin:0}}}}@layer compositions{.edc52bf0fe80b57f__layout{font-size:max(var(--wpds-typography-font-size-md,13px),16px);@media (min-width:600px){font-size:var(--wpds-typography-font-size-md,13px)}}}}");
var style_module_default$19 = {
	"input": "_9edfcd97eeaee9dc__input",
	"layout": "edc52bf0fe80b57f__layout"
};
/**
* A low-level primitive for an input field.
*
* Prefer `InputControl` when using with a standard label and description.
*/
const Input = (0, import_element.forwardRef)(function UnforwardedInput({ className, size = "default", prefix, suffix, style, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputLayout, {
		className: clsx(style_module_default$19.layout, focus_module_default$2["outset-ring--focus-within"], className),
		style,
		size,
		visuallyDisabled: restProps.disabled,
		prefix,
		suffix,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
			ref,
			className: clsx(global_css_defense_module_default$3.input, style_module_default$19.input),
			...restProps
		})
	});
});

// packages/ui/build-module/form/primitives/checkbox/checkbox.mjs
const STYLE_HASH_ATTRIBUTE$29 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$29() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$29(document);
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
function documentContainsStyleHash$29(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$29}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$29) === hash) return true;
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
function injectStyle$29(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$29();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$29(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$29, hash);
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
function registerDocument$29(targetDocument) {
	const runtime = getRuntime$29();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$29(targetDocument, hash, css);
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
function registerStyle$29(hash, css) {
	const runtime = getRuntime$29();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$29(targetDocument, hash, css);
}
registerStyle$29("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default$3 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$29("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
var focus_module_default$1 = {
	"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
	"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
	"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
	"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
	"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
};
registerStyle$29("ecdf49ebe4", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._63457135733e4745__root{--_checkbox-input-size:var(--wp-ui-checkbox-input-size,var(--wpds-dimension-size-2xs,16px));aspect-ratio:1;background-color:var(--wpds-color-background-interactive-neutral,var(--wpds-color-background-surface-neutral-strong,#fff));border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-interactive-neutral,#8d8d8d);border-radius:min(var(--wpds-border-radius-sm,2px),2px);display:inline-block;flex-shrink:0;padding:0;position:relative;width:var(--_checkbox-input-size);&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&:hover,[data-highlighted] &{background-color:var(--wpds-color-background-interactive-neutral-active,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e)}&[aria-checked=mixed],&[aria-checked=true]{background-color:var(--wpds-color-background-interactive-brand-strong,var(--wp-admin-theme-color,#3858e9));border-color:transparent;color:var(--wpds-color-foreground-interactive-brand-strong,#fff)}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-disabled,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText;color:GrayText}}&:after{aspect-ratio:1;content:\"\";left:50%;position:absolute;top:50%;transform:translate(-50%,-50%);width:max(var(--_checkbox-input-size),var(--wpds-dimension-size-sm,24px))}}.e5da9f589362d532__indicator-icon{inset:calc(0px - var(--wpds-border-width-xs, 1px));position:absolute}}}");
var style_module_default$18 = {
	"root": "_63457135733e4745__root",
	"indicator-icon": "e5da9f589362d532__indicator-icon"
};
/**
* A low-level checkbox primitive.
*
* Prefer `CheckboxControl` for labeled items. For grouping and nested parent
* checkboxes, see the [Checkbox Groups](https://wordpress.github.io/gutenberg/?path=/docs/design-system-components-form-checkbox-groups--docs)
* documentation.
*/
const Checkbox = (0, import_element.forwardRef)(function UnforwardedCheckbox({ className, indeterminate, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxRoot, {
		ref,
		className: clsx(resets_module_default$3["box-sizing"], focus_module_default$1["outset-ring--focus"], style_module_default$18.root, className),
		indeterminate,
		...restProps,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
			className: style_module_default$18["indicator-icon"],
			render: (props, state) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				...props,
				icon: state.indeterminate ? reset_default : check_default,
				viewBox: "4 4 16 16",
				size: 16
			})
		})
	});
});

// packages/ui/build-module/form/primitives/field/root.mjs
const STYLE_HASH_ATTRIBUTE$28 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$28() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$28(document);
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
function documentContainsStyleHash$28(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$28}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$28) === hash) return true;
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
function injectStyle$28(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$28();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$28(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$28, hash);
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
function registerDocument$28(targetDocument) {
	const runtime = getRuntime$28();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$28(targetDocument, hash, css);
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
function registerStyle$28(hash, css) {
	const runtime = getRuntime$28();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$28(targetDocument, hash, css);
}
registerStyle$28("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default$2 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
const DEFAULT_RENDER = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
	...props,
	direction: "column",
	gap: "sm"
});
/**
* A low-level component that associates an accessible label and description
* with a single form control element.
*
* To label a group of multiple form control elements, use the `Fieldset` component instead.
*
* Simply wrapping a control with this component does not guarantee
* accessible labeling. See examples for how to associate the label in different cases.
*/
const Root$1 = (0, import_element.forwardRef)(function UnforwardedRoot({ className, render = DEFAULT_RENDER, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRoot, {
		ref,
		className: clsx(resets_module_default$2["box-sizing"], className),
		render,
		...restProps
	});
});

// packages/ui/build-module/form/primitives/field/item.mjs
const Item$2 = (0, import_element.forwardRef)(function UnforwardedItem(props, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldItem, {
		ref,
		...props
	});
});

// packages/ui/build-module/form/primitives/field/label.mjs
const STYLE_HASH_ATTRIBUTE$27 = "data-wp-hash";
/**
* Returns the shared style runtime registry.
*
* The registry is stored on `globalThis` so separately bundled copies of this
* package can coordinate through the same document and style maps.
*
* @return The shared runtime registry.
*/
function getRuntime$27() {
	const globalScope = globalThis;
	if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
	globalScope.__wpStyleRuntime = {
		documents: /* @__PURE__ */ new Map(),
		styles: /* @__PURE__ */ new Map(),
		injectedStyles: /* @__PURE__ */ new WeakMap()
	};
	if (typeof document !== "undefined") registerDocument$27(document);
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
function documentContainsStyleHash$27(targetDocument, hash) {
	if (!targetDocument.head) return false;
	for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE$27}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE$27) === hash) return true;
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
function injectStyle$27(targetDocument, hash, css) {
	if (!targetDocument.head) return;
	const runtime = getRuntime$27();
	let injectedStyles = runtime.injectedStyles.get(targetDocument);
	if (!injectedStyles) {
		injectedStyles = /* @__PURE__ */ new Set();
		runtime.injectedStyles.set(targetDocument, injectedStyles);
	}
	if (injectedStyles.has(hash)) return;
	if (documentContainsStyleHash$27(targetDocument, hash)) {
		injectedStyles.add(hash);
		return;
	}
	const style = targetDocument.createElement("style");
	style.setAttribute(STYLE_HASH_ATTRIBUTE$27, hash);
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
function registerDocument$27(targetDocument) {
	const runtime = getRuntime$27();
	runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
	for (const [hash, css] of runtime.styles) injectStyle$27(targetDocument, hash, css);
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
function registerStyle$27(hash, css) {
	const runtime = getRuntime$27();
	runtime.styles.set(hash, css);
	for (const targetDocument of runtime.documents.keys()) injectStyle$27(targetDocument, hash, css);
}
registerStyle$27("71ecfbcef4", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.b83e088455118c35__label{--wp-ui-field-label-line-height:var(--wpds-typography-line-height-xs,16px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wp-ui-field-label-line-height);text-transform:uppercase;&._7cbfa5d2e598834a__is-plain{font-size:var(--wpds-typography-font-size-md,13px);font-weight:var(--wpds-typography-font-weight-default,400);text-transform:none}}._507b5c7970fe2ffd__description{--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);--_gcd-p-margin:0;text-wrap:pretty;color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var field_module_default$4 = {
	"label": "b83e088455118c35__label",
	"is-plain": "_7cbfa5d2e598834a__is-plain",
	"description": "_507b5c7970fe2ffd__description"
};
const Label = (0, import_element.forwardRef)(function UnforwardedLabel({ className, hideFromVision, variant, ...restProps }, ref) {
	const label = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldLabel, {
		ref,
		className: clsx(field_module_default$4.label, variant && field_module_default$4[`is-${variant}`], className),
		...restProps
	});
	if (hideFromVision) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisuallyHidden, { render: label });
	return label;
});

// packages/ui/build-module/form/primitives/field/description.mjs
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
registerStyle$26("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default$2 = {
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
registerStyle$26("71ecfbcef4", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.b83e088455118c35__label{--wp-ui-field-label-line-height:var(--wpds-typography-line-height-xs,16px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wp-ui-field-label-line-height);text-transform:uppercase;&._7cbfa5d2e598834a__is-plain{font-size:var(--wpds-typography-font-size-md,13px);font-weight:var(--wpds-typography-font-weight-default,400);text-transform:none}}._507b5c7970fe2ffd__description{--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);--_gcd-p-margin:0;text-wrap:pretty;color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var field_module_default$3 = {
	"label": "b83e088455118c35__label",
	"is-plain": "_7cbfa5d2e598834a__is-plain",
	"description": "_507b5c7970fe2ffd__description"
};
const Description = (0, import_element.forwardRef)(function UnforwardedDescription({ className, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldDescription, {
		ref,
		className: clsx(global_css_defense_module_default$2.p, field_module_default$3.description, className),
		...restProps
	});
});

// packages/ui/build-module/form/primitives/field/details.mjs
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
registerStyle$25("71ecfbcef4", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.b83e088455118c35__label{--wp-ui-field-label-line-height:var(--wpds-typography-line-height-xs,16px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wp-ui-field-label-line-height);text-transform:uppercase;&._7cbfa5d2e598834a__is-plain{font-size:var(--wpds-typography-font-size-md,13px);font-weight:var(--wpds-typography-font-weight-default,400);text-transform:none}}._507b5c7970fe2ffd__description{--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);--_gcd-p-margin:0;text-wrap:pretty;color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var field_module_default$2 = {
	"label": "b83e088455118c35__label",
	"is-plain": "_7cbfa5d2e598834a__is-plain",
	"description": "_507b5c7970fe2ffd__description"
};
/**
* A component for showing additional information about the field,
* styled similarly to a normal `Field.Description`.
* Unlike a normal description, it can include links and other semantic elements.
*
* Although this content is not associated with the field using direct semantics,
* it is made discoverable to screen reader users via a visually hidden description,
* alerting them to the presence of additional information below.
*
* If the content only includes plain text, use `Field.Description` instead,
* so the readout is not unnecessarily verbose for screen reader users.
*/
const Details = (0, import_element.forwardRef)(function UnforwardedDetails({ className, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisuallyHidden, {
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldDescription, {}),
		children: (0, import_i18n.__)("More details follow the field.")
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: clsx(field_module_default$2.description, className),
		...restProps
	})] });
});

// packages/ui/build-module/form/primitives/fieldset/context.mjs
const fallbackContext = {
	registerDescriptionId: () => {},
	unregisterDescriptionId: () => {}
};
const FieldsetContext = (0, import_element.createContext)(null);
const useFieldsetContext = (componentName) => {
	const context = (0, import_element.useContext)(FieldsetContext);
	if (!context) throw new Error(`${componentName}: Missing parent <Fieldset.Root>. Render <${componentName}> inside <Fieldset.Root>.`);
	return context ?? fallbackContext;
};

// packages/ui/build-module/form/primitives/fieldset/root.mjs
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
registerStyle$24("fb61bcd821", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.e261be5ffdbff866__root{border:0;display:flex;flex-direction:column;gap:var(--wpds-dimension-gap-sm,8px);margin:0;padding:0}._9c09ae15728936d6__legend:not(._76f0f4f5a833a38d__is-hidden)+.cac73664494ce854__description{inset-block-start:calc(var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-gap-sm, 8px));position:relative}}}");
var style_module_default$17 = {
	"root": "e261be5ffdbff866__root",
	"legend": "_9c09ae15728936d6__legend",
	"is-hidden": "_76f0f4f5a833a38d__is-hidden",
	"description": "cac73664494ce854__description"
};
/**
* A low-level component that associates an accessible legend and description with
* a group of multiple form control elements.
*
* To label a single form control element, use the `Field` component instead.
*/
const FieldsetRoot = (0, import_element.forwardRef)(function UnforwardedFieldsetRoot({ className, children, ...restProps }, ref) {
	const [descriptionId, setDescriptionId] = (0, import_element.useState)();
	const contextValue = (0, import_element.useMemo)(() => ({
		registerDescriptionId: (id) => setDescriptionId(id),
		unregisterDescriptionId: () => setDescriptionId(void 0)
	}), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldsetContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldsetRoot$1, {
			ref,
			className: clsx(style_module_default$17.root, className),
			"aria-describedby": descriptionId,
			...restProps,
			children
		})
	});
});

// packages/ui/build-module/form/primitives/fieldset/legend.mjs
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
registerStyle$23("71ecfbcef4", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.b83e088455118c35__label{--wp-ui-field-label-line-height:var(--wpds-typography-line-height-xs,16px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wp-ui-field-label-line-height);text-transform:uppercase;&._7cbfa5d2e598834a__is-plain{font-size:var(--wpds-typography-font-size-md,13px);font-weight:var(--wpds-typography-font-weight-default,400);text-transform:none}}._507b5c7970fe2ffd__description{--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);--_gcd-p-margin:0;text-wrap:pretty;color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var field_module_default$1 = {
	"label": "b83e088455118c35__label",
	"is-plain": "_7cbfa5d2e598834a__is-plain",
	"description": "_507b5c7970fe2ffd__description"
};
registerStyle$23("fb61bcd821", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.e261be5ffdbff866__root{border:0;display:flex;flex-direction:column;gap:var(--wpds-dimension-gap-sm,8px);margin:0;padding:0}._9c09ae15728936d6__legend:not(._76f0f4f5a833a38d__is-hidden)+.cac73664494ce854__description{inset-block-start:calc(var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-gap-sm, 8px));position:relative}}}");
var style_module_default$16 = {
	"root": "e261be5ffdbff866__root",
	"legend": "_9c09ae15728936d6__legend",
	"is-hidden": "_76f0f4f5a833a38d__is-hidden",
	"description": "cac73664494ce854__description"
};
const FieldsetLegend = (0, import_element.forwardRef)(function UnforwardedFieldsetLegend({ className, hideFromVision, ...restProps }, ref) {
	const legend = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldsetLegend$1, {
		ref,
		className: clsx(style_module_default$16.legend, hideFromVision && style_module_default$16["is-hidden"], field_module_default$1.label, className),
		...restProps
	});
	if (hideFromVision) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisuallyHidden, { render: legend });
	return legend;
});

// packages/ui/build-module/form/primitives/fieldset/description.mjs
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
registerStyle$22("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
registerStyle$22("71ecfbcef4", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.b83e088455118c35__label{--wp-ui-field-label-line-height:var(--wpds-typography-line-height-xs,16px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wp-ui-field-label-line-height);text-transform:uppercase;&._7cbfa5d2e598834a__is-plain{font-size:var(--wpds-typography-font-size-md,13px);font-weight:var(--wpds-typography-font-weight-default,400);text-transform:none}}._507b5c7970fe2ffd__description{--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);--_gcd-p-margin:0;text-wrap:pretty;color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var field_module_default = {
	"label": "b83e088455118c35__label",
	"is-plain": "_7cbfa5d2e598834a__is-plain",
	"description": "_507b5c7970fe2ffd__description"
};
registerStyle$22("fb61bcd821", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.e261be5ffdbff866__root{border:0;display:flex;flex-direction:column;gap:var(--wpds-dimension-gap-sm,8px);margin:0;padding:0}._9c09ae15728936d6__legend:not(._76f0f4f5a833a38d__is-hidden)+.cac73664494ce854__description{inset-block-start:calc(var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-gap-sm, 8px));position:relative}}}");
var style_module_default$15 = {
	"root": "e261be5ffdbff866__root",
	"legend": "_9c09ae15728936d6__legend",
	"is-hidden": "_76f0f4f5a833a38d__is-hidden",
	"description": "cac73664494ce854__description"
};
const FieldsetDescription = (0, import_element.forwardRef)(function UnforwardedFieldsetDescription({ className, id: idProp, render, ...restProps }, ref) {
	const generatedId = (0, import_element.useId)();
	const id = idProp ?? generatedId;
	const { registerDescriptionId, unregisterDescriptionId } = useFieldsetContext("Fieldset.Description");
	(0, import_element.useEffect)(() => {
		registerDescriptionId(id);
		return unregisterDescriptionId;
	}, [
		registerDescriptionId,
		unregisterDescriptionId,
		id
	]);
	return useRender({
		defaultTagName: "p",
		render,
		ref,
		props: mergeProps({
			className: clsx(global_css_defense_module_default$1.p, style_module_default$15.description, field_module_default.description, className),
			id
		}, restProps)
	});
});

// packages/ui/build-module/form/primitives/select/group.mjs
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
registerStyle$21("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
var item_popup_module_default$7 = {
	"popup": "f44105ad1a552523__popup _069972d5e326bada__dropdown-motion",
	"is-width-anchor": "f20f14dd818510c6__is-width-anchor",
	"is-width-content": "_398b31dcd487e37f__is-width-content",
	"is-width-available": "_481aa05a209e4968__is-width-available",
	"is-width-sm": "_75f4d59e8cd4fbf1__is-width-sm",
	"is-width-md": "_9b640ab112999a71__is-width-md",
	"is-width-lg": "_3bf04b25e9ec1c2c__is-width-lg",
	"fixed-width-presets": "_543f334dbb899cca__fixed-width-presets",
	"is-align-item-with-trigger": "_31995ce6e72ae51c__is-align-item-with-trigger",
	"list-chrome": "c61ae8ac6b17caf6__list-chrome",
	"item-icon": "_41ac90fbb134576c__item-icon",
	"list": "_6f78c164f55857d2__list c61ae8ac6b17caf6__list-chrome",
	"list-scrollable-container": "d50f53b586266e4c__list-scrollable-container",
	"list-footer": "_44be0354ea94ae76__list-footer",
	"group": "e46f00c85691b978__group",
	"group-label": "_7c8dd3d445b9e0d1__group-label",
	"separator": "_6590ed1ca0955506__separator",
	"item-layout": "c53905a339ee5b93__item-layout",
	"item": "baf88da98aa22472__item c53905a339ee5b93__item-layout",
	"is-size-small": "c1884bb8f08d6b49__is-size-small",
	"item-indicator-icon": "bacbdc6d2167ebdd__item-indicator-icon",
	"item-content": "_128e9f67dabbe8cd__item-content",
	"item-text": "_96a7e33bb57975a2__item-text",
	"item-label": "bad7b55318907302__item-label",
	"item-description": "_2e4ebd9f6d7ce5d4__item-description",
	"loading-indicator": "_384062150817186f__loading-indicator c53905a339ee5b93__item-layout",
	"status": "c4502685591e2f57__status",
	"empty": "_46236ecbce83a6f0__empty",
	"loading-spinner": "_9dd46ff6c5337aad__loading-spinner"
};
/**
* Groups related items together with an associated label rendered by
* `Select.GroupLabel`.
*/
const Group = (0, import_element.forwardRef)(function UnforwardedGroup({ className, children, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectGroup, {
		className: clsx(item_popup_module_default$7.group, className),
		ref,
		...restProps,
		children
	});
});

// packages/ui/build-module/form/primitives/select/group-label.mjs
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
registerStyle$20("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
var item_popup_module_default$6 = {
	"popup": "f44105ad1a552523__popup _069972d5e326bada__dropdown-motion",
	"is-width-anchor": "f20f14dd818510c6__is-width-anchor",
	"is-width-content": "_398b31dcd487e37f__is-width-content",
	"is-width-available": "_481aa05a209e4968__is-width-available",
	"is-width-sm": "_75f4d59e8cd4fbf1__is-width-sm",
	"is-width-md": "_9b640ab112999a71__is-width-md",
	"is-width-lg": "_3bf04b25e9ec1c2c__is-width-lg",
	"fixed-width-presets": "_543f334dbb899cca__fixed-width-presets",
	"is-align-item-with-trigger": "_31995ce6e72ae51c__is-align-item-with-trigger",
	"list-chrome": "c61ae8ac6b17caf6__list-chrome",
	"item-icon": "_41ac90fbb134576c__item-icon",
	"list": "_6f78c164f55857d2__list c61ae8ac6b17caf6__list-chrome",
	"list-scrollable-container": "d50f53b586266e4c__list-scrollable-container",
	"list-footer": "_44be0354ea94ae76__list-footer",
	"group": "e46f00c85691b978__group",
	"group-label": "_7c8dd3d445b9e0d1__group-label",
	"separator": "_6590ed1ca0955506__separator",
	"item-layout": "c53905a339ee5b93__item-layout",
	"item": "baf88da98aa22472__item c53905a339ee5b93__item-layout",
	"is-size-small": "c1884bb8f08d6b49__is-size-small",
	"item-indicator-icon": "bacbdc6d2167ebdd__item-indicator-icon",
	"item-content": "_128e9f67dabbe8cd__item-content",
	"item-text": "_96a7e33bb57975a2__item-text",
	"item-label": "bad7b55318907302__item-label",
	"item-description": "_2e4ebd9f6d7ce5d4__item-description",
	"loading-indicator": "_384062150817186f__loading-indicator c53905a339ee5b93__item-layout",
	"status": "c4502685591e2f57__status",
	"empty": "_46236ecbce83a6f0__empty",
	"loading-spinner": "_9dd46ff6c5337aad__loading-spinner"
};
/**
* Renders a label for a `Select.Group`, describing the group of items
* it is associated with.
*/
const GroupLabel = (0, import_element.forwardRef)(function UnforwardedGroupLabel({ className, children, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
		variant: "heading-sm",
		className: clsx(item_popup_module_default$6["group-label"], className),
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectGroupLabel, {
			ref,
			...restProps
		}),
		children
	});
});

// packages/ui/build-module/form/primitives/select/item-description.mjs
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
registerStyle$19("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
var item_popup_module_default$5 = {
	"popup": "f44105ad1a552523__popup _069972d5e326bada__dropdown-motion",
	"is-width-anchor": "f20f14dd818510c6__is-width-anchor",
	"is-width-content": "_398b31dcd487e37f__is-width-content",
	"is-width-available": "_481aa05a209e4968__is-width-available",
	"is-width-sm": "_75f4d59e8cd4fbf1__is-width-sm",
	"is-width-md": "_9b640ab112999a71__is-width-md",
	"is-width-lg": "_3bf04b25e9ec1c2c__is-width-lg",
	"fixed-width-presets": "_543f334dbb899cca__fixed-width-presets",
	"is-align-item-with-trigger": "_31995ce6e72ae51c__is-align-item-with-trigger",
	"list-chrome": "c61ae8ac6b17caf6__list-chrome",
	"item-icon": "_41ac90fbb134576c__item-icon",
	"list": "_6f78c164f55857d2__list c61ae8ac6b17caf6__list-chrome",
	"list-scrollable-container": "d50f53b586266e4c__list-scrollable-container",
	"list-footer": "_44be0354ea94ae76__list-footer",
	"group": "e46f00c85691b978__group",
	"group-label": "_7c8dd3d445b9e0d1__group-label",
	"separator": "_6590ed1ca0955506__separator",
	"item-layout": "c53905a339ee5b93__item-layout",
	"item": "baf88da98aa22472__item c53905a339ee5b93__item-layout",
	"is-size-small": "c1884bb8f08d6b49__is-size-small",
	"item-indicator-icon": "bacbdc6d2167ebdd__item-indicator-icon",
	"item-content": "_128e9f67dabbe8cd__item-content",
	"item-text": "_96a7e33bb57975a2__item-text",
	"item-label": "bad7b55318907302__item-label",
	"item-description": "_2e4ebd9f6d7ce5d4__item-description",
	"loading-indicator": "_384062150817186f__loading-indicator c53905a339ee5b93__item-layout",
	"status": "c4502685591e2f57__status",
	"empty": "_46236ecbce83a6f0__empty",
	"loading-spinner": "_9dd46ff6c5337aad__loading-spinner"
};
const ITEM_DESCRIPTION_DIRECT_CHILD = Symbol();
/**
* Supplementary content for a select item. Its text contributes to the item's
* accessible description. Use it as a direct child after `Select.ItemLabel`.
* Content should be text or non-interactive inline markup.
*/
const ItemDescription = (0, import_element.forwardRef)(function UnforwardedItemDescription(props, ref) {
	const { className, validationToken, ...restProps } = props;
	if (validationToken !== ITEM_DESCRIPTION_DIRECT_CHILD) throw new Error("Select.ItemDescription: Missing direct select item parent. Render <Select.ItemDescription> as a direct child of <Select.Item>.");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
		ref,
		variant: "body-sm",
		className: clsx(item_popup_module_default$5["item-description"], className),
		...restProps
	});
});

// packages/ui/build-module/form/primitives/select/item-label.mjs
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
registerStyle$18("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
var item_popup_module_default$4 = {
	"popup": "f44105ad1a552523__popup _069972d5e326bada__dropdown-motion",
	"is-width-anchor": "f20f14dd818510c6__is-width-anchor",
	"is-width-content": "_398b31dcd487e37f__is-width-content",
	"is-width-available": "_481aa05a209e4968__is-width-available",
	"is-width-sm": "_75f4d59e8cd4fbf1__is-width-sm",
	"is-width-md": "_9b640ab112999a71__is-width-md",
	"is-width-lg": "_3bf04b25e9ec1c2c__is-width-lg",
	"fixed-width-presets": "_543f334dbb899cca__fixed-width-presets",
	"is-align-item-with-trigger": "_31995ce6e72ae51c__is-align-item-with-trigger",
	"list-chrome": "c61ae8ac6b17caf6__list-chrome",
	"item-icon": "_41ac90fbb134576c__item-icon",
	"list": "_6f78c164f55857d2__list c61ae8ac6b17caf6__list-chrome",
	"list-scrollable-container": "d50f53b586266e4c__list-scrollable-container",
	"list-footer": "_44be0354ea94ae76__list-footer",
	"group": "e46f00c85691b978__group",
	"group-label": "_7c8dd3d445b9e0d1__group-label",
	"separator": "_6590ed1ca0955506__separator",
	"item-layout": "c53905a339ee5b93__item-layout",
	"item": "baf88da98aa22472__item c53905a339ee5b93__item-layout",
	"is-size-small": "c1884bb8f08d6b49__is-size-small",
	"item-indicator-icon": "bacbdc6d2167ebdd__item-indicator-icon",
	"item-content": "_128e9f67dabbe8cd__item-content",
	"item-text": "_96a7e33bb57975a2__item-text",
	"item-label": "bad7b55318907302__item-label",
	"item-description": "_2e4ebd9f6d7ce5d4__item-description",
	"loading-indicator": "_384062150817186f__loading-indicator c53905a339ee5b93__item-layout",
	"status": "c4502685591e2f57__status",
	"empty": "_46236ecbce83a6f0__empty",
	"loading-spinner": "_9dd46ff6c5337aad__loading-spinner"
};
/**
* The primary label of a select item. Use it as the first direct child of
* every item. Its content is the item's accessible name. The trigger label
* still comes from the selected item's `label` (via `items` or an object
* value) or from `Select.Trigger` children.
*/
const ItemLabel = (0, import_element.forwardRef)(function UnforwardedItemLabel({ children, className, render, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
		ref,
		variant: "body-md",
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { render }),
		className: clsx(item_popup_module_default$4["item-label"], className),
		...restProps,
		children
	});
});

// packages/ui/build-module/form/primitives/select/item.mjs
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
registerStyle$17("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
registerStyle$17("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
var item_popup_module_default$3 = {
	"popup": "f44105ad1a552523__popup _069972d5e326bada__dropdown-motion",
	"is-width-anchor": "f20f14dd818510c6__is-width-anchor",
	"is-width-content": "_398b31dcd487e37f__is-width-content",
	"is-width-available": "_481aa05a209e4968__is-width-available",
	"is-width-sm": "_75f4d59e8cd4fbf1__is-width-sm",
	"is-width-md": "_9b640ab112999a71__is-width-md",
	"is-width-lg": "_3bf04b25e9ec1c2c__is-width-lg",
	"fixed-width-presets": "_543f334dbb899cca__fixed-width-presets",
	"is-align-item-with-trigger": "_31995ce6e72ae51c__is-align-item-with-trigger",
	"list-chrome": "c61ae8ac6b17caf6__list-chrome",
	"item-icon": "_41ac90fbb134576c__item-icon",
	"list": "_6f78c164f55857d2__list c61ae8ac6b17caf6__list-chrome",
	"list-scrollable-container": "d50f53b586266e4c__list-scrollable-container",
	"list-footer": "_44be0354ea94ae76__list-footer",
	"group": "e46f00c85691b978__group",
	"group-label": "_7c8dd3d445b9e0d1__group-label",
	"separator": "_6590ed1ca0955506__separator",
	"item-layout": "c53905a339ee5b93__item-layout",
	"item": "baf88da98aa22472__item c53905a339ee5b93__item-layout",
	"is-size-small": "c1884bb8f08d6b49__is-size-small",
	"item-indicator-icon": "bacbdc6d2167ebdd__item-indicator-icon",
	"item-content": "_128e9f67dabbe8cd__item-content",
	"item-text": "_96a7e33bb57975a2__item-text",
	"item-label": "bad7b55318907302__item-label",
	"item-description": "_2e4ebd9f6d7ce5d4__item-description",
	"loading-indicator": "_384062150817186f__loading-indicator c53905a339ee5b93__item-layout",
	"status": "c4502685591e2f57__status",
	"empty": "_46236ecbce83a6f0__empty",
	"loading-spinner": "_9dd46ff6c5337aad__loading-spinner"
};
registerStyle$17("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default$1 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
const ITEM_CONTENT_COMPONENTS = {
	Label: ItemLabel,
	Description: ItemDescription,
	descriptionValidationToken: ITEM_DESCRIPTION_DIRECT_CHILD,
	validationMessage: "Select.ItemLabel must be the first direct child of every select item, followed only by Select.ItemDescription components."
};
const Item$1 = (0, import_element.forwardRef)(function UnforwardedItem({ className, value, size = "default", children, "aria-describedby": ariaDescribedBy, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...restProps }, ref) {
	const { contentChildren, itemAriaProps } = useItemContent(children, ITEM_CONTENT_COMPONENTS, {
		"aria-describedby": ariaDescribedBy,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
		className: clsx(global_css_defense_module_default.div, resets_module_default$1["box-sizing"], item_popup_module_default$3.item, size === "small" && item_popup_module_default$3["is-size-small"], className),
		value,
		ref,
		...itemAriaProps,
		...restProps,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: item_popup_module_default$3["item-icon"],
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				icon: check_default,
				className: item_popup_module_default$3["item-indicator-icon"],
				size: 16
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: item_popup_module_default$3["item-text"],
			children: contentChildren
		})]
	});
});

// packages/ui/build-module/form/primitives/select/portal.mjs
/**
* Used to apply custom portal behavior to `Select`'s listbox content.
* `container` defaults to the `@wordpress/ui` compat overlay slot.
*/
const Portal = (0, import_element.forwardRef)(function SelectPortal$1({ container, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, {
		container: container === void 0 ? getWpCompatOverlaySlot() : container,
		...restProps,
		ref
	});
});

// packages/ui/build-module/form/primitives/select/positioner.mjs
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
registerStyle$16("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$16("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
var item_popup_module_default$2 = {
	"popup": "f44105ad1a552523__popup _069972d5e326bada__dropdown-motion",
	"is-width-anchor": "f20f14dd818510c6__is-width-anchor",
	"is-width-content": "_398b31dcd487e37f__is-width-content",
	"is-width-available": "_481aa05a209e4968__is-width-available",
	"is-width-sm": "_75f4d59e8cd4fbf1__is-width-sm",
	"is-width-md": "_9b640ab112999a71__is-width-md",
	"is-width-lg": "_3bf04b25e9ec1c2c__is-width-lg",
	"fixed-width-presets": "_543f334dbb899cca__fixed-width-presets",
	"is-align-item-with-trigger": "_31995ce6e72ae51c__is-align-item-with-trigger",
	"list-chrome": "c61ae8ac6b17caf6__list-chrome",
	"item-icon": "_41ac90fbb134576c__item-icon",
	"list": "_6f78c164f55857d2__list c61ae8ac6b17caf6__list-chrome",
	"list-scrollable-container": "d50f53b586266e4c__list-scrollable-container",
	"list-footer": "_44be0354ea94ae76__list-footer",
	"group": "e46f00c85691b978__group",
	"group-label": "_7c8dd3d445b9e0d1__group-label",
	"separator": "_6590ed1ca0955506__separator",
	"item-layout": "c53905a339ee5b93__item-layout",
	"item": "baf88da98aa22472__item c53905a339ee5b93__item-layout",
	"is-size-small": "c1884bb8f08d6b49__is-size-small",
	"item-indicator-icon": "bacbdc6d2167ebdd__item-indicator-icon",
	"item-content": "_128e9f67dabbe8cd__item-content",
	"item-text": "_96a7e33bb57975a2__item-text",
	"item-label": "bad7b55318907302__item-label",
	"item-description": "_2e4ebd9f6d7ce5d4__item-description",
	"loading-indicator": "_384062150817186f__loading-indicator c53905a339ee5b93__item-layout",
	"status": "c4502685591e2f57__status",
	"empty": "_46236ecbce83a6f0__empty",
	"loading-spinner": "_9dd46ff6c5337aad__loading-spinner"
};
registerStyle$16("656946f66b", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.cc0f09fba19eb669__positioner{z-index:var(--wp-ui-select-z-index,initial)}._3a3c25e09f4fd1ec__list{display:block;min-block-size:0;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}}}");
var style_module_default$14 = {
	"positioner": "cc0f09fba19eb669__positioner",
	"list": "_3a3c25e09f4fd1ec__list"
};
/**
* Used to apply custom positioning to `Select`'s listbox content.
*/
const Positioner = (0, import_element.forwardRef)(function SelectPositioner$1({ className, alignItemWithTrigger = true, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPositioner, {
		...ITEM_POPUP_POSITIONER_PROPS,
		...props,
		alignItemWithTrigger,
		ref,
		className: clsx(resets_module_default["box-sizing"], style_module_default$14.positioner, alignItemWithTrigger && item_popup_module_default$2["is-align-item-with-trigger"], className)
	});
});

// packages/ui/build-module/form/primitives/select/popup.mjs
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
registerStyle$15("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
var item_popup_module_default$1 = {
	"popup": "f44105ad1a552523__popup _069972d5e326bada__dropdown-motion",
	"is-width-anchor": "f20f14dd818510c6__is-width-anchor",
	"is-width-content": "_398b31dcd487e37f__is-width-content",
	"is-width-available": "_481aa05a209e4968__is-width-available",
	"is-width-sm": "_75f4d59e8cd4fbf1__is-width-sm",
	"is-width-md": "_9b640ab112999a71__is-width-md",
	"is-width-lg": "_3bf04b25e9ec1c2c__is-width-lg",
	"fixed-width-presets": "_543f334dbb899cca__fixed-width-presets",
	"is-align-item-with-trigger": "_31995ce6e72ae51c__is-align-item-with-trigger",
	"list-chrome": "c61ae8ac6b17caf6__list-chrome",
	"item-icon": "_41ac90fbb134576c__item-icon",
	"list": "_6f78c164f55857d2__list c61ae8ac6b17caf6__list-chrome",
	"list-scrollable-container": "d50f53b586266e4c__list-scrollable-container",
	"list-footer": "_44be0354ea94ae76__list-footer",
	"group": "e46f00c85691b978__group",
	"group-label": "_7c8dd3d445b9e0d1__group-label",
	"separator": "_6590ed1ca0955506__separator",
	"item-layout": "c53905a339ee5b93__item-layout",
	"item": "baf88da98aa22472__item c53905a339ee5b93__item-layout",
	"is-size-small": "c1884bb8f08d6b49__is-size-small",
	"item-indicator-icon": "bacbdc6d2167ebdd__item-indicator-icon",
	"item-content": "_128e9f67dabbe8cd__item-content",
	"item-text": "_96a7e33bb57975a2__item-text",
	"item-label": "bad7b55318907302__item-label",
	"item-description": "_2e4ebd9f6d7ce5d4__item-description",
	"loading-indicator": "_384062150817186f__loading-indicator c53905a339ee5b93__item-layout",
	"status": "c4502685591e2f57__status",
	"empty": "_46236ecbce83a6f0__empty",
	"loading-spinner": "_9dd46ff6c5337aad__loading-spinner"
};
registerStyle$15("656946f66b", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.cc0f09fba19eb669__positioner{z-index:var(--wp-ui-select-z-index,initial)}._3a3c25e09f4fd1ec__list{display:block;min-block-size:0;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}}}");
var style_module_default$13 = {
	"positioner": "cc0f09fba19eb669__positioner",
	"list": "_3a3c25e09f4fd1ec__list"
};
const Popup = (0, import_element.forwardRef)(function UnforwardedPopup({ className, portal, positioner, width, children, ...restProps }, ref) {
	const popupContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPopup, {
		ref,
		className: clsx(item_popup_module_default$1.popup, getItemPopupWidthClassName(width), className),
		...restProps,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectList, {
			className: clsx(item_popup_module_default$1["list-chrome"], style_module_default$13.list),
			children
		})
	});
	const positionedPopup = renderSlotWithChildren(positioner, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Positioner, {}), popupContent);
	return renderSlotWithChildren(portal, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, {}), positionedPopup);
});

// packages/ui/build-module/form/primitives/select/root.mjs
/**
* A component that lets users choose one option from a list.
*
* Prefer `SelectControl` when using with a standard label and description.
*
* When using object values, pass an `items` array so `Select.Trigger` can
* auto-resolve the selected item's label. By default, items should use a
* `{ value, label }` shape, or provide `itemToStringLabel` for a custom shape.
*
* Object values are compared with `Object.is` by default, so use the same
* object references for `value` / `defaultValue` and `Select.Item` values, or
* provide `isItemEqualToValue`.
*/
function Root(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectionProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectRoot, { ...props }) });
}

// packages/ui/build-module/form/primitives/select/separator.mjs
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
registerStyle$14("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
var item_popup_module_default = {
	"popup": "f44105ad1a552523__popup _069972d5e326bada__dropdown-motion",
	"is-width-anchor": "f20f14dd818510c6__is-width-anchor",
	"is-width-content": "_398b31dcd487e37f__is-width-content",
	"is-width-available": "_481aa05a209e4968__is-width-available",
	"is-width-sm": "_75f4d59e8cd4fbf1__is-width-sm",
	"is-width-md": "_9b640ab112999a71__is-width-md",
	"is-width-lg": "_3bf04b25e9ec1c2c__is-width-lg",
	"fixed-width-presets": "_543f334dbb899cca__fixed-width-presets",
	"is-align-item-with-trigger": "_31995ce6e72ae51c__is-align-item-with-trigger",
	"list-chrome": "c61ae8ac6b17caf6__list-chrome",
	"item-icon": "_41ac90fbb134576c__item-icon",
	"list": "_6f78c164f55857d2__list c61ae8ac6b17caf6__list-chrome",
	"list-scrollable-container": "d50f53b586266e4c__list-scrollable-container",
	"list-footer": "_44be0354ea94ae76__list-footer",
	"group": "e46f00c85691b978__group",
	"group-label": "_7c8dd3d445b9e0d1__group-label",
	"separator": "_6590ed1ca0955506__separator",
	"item-layout": "c53905a339ee5b93__item-layout",
	"item": "baf88da98aa22472__item c53905a339ee5b93__item-layout",
	"is-size-small": "c1884bb8f08d6b49__is-size-small",
	"item-indicator-icon": "bacbdc6d2167ebdd__item-indicator-icon",
	"item-content": "_128e9f67dabbe8cd__item-content",
	"item-text": "_96a7e33bb57975a2__item-text",
	"item-label": "bad7b55318907302__item-label",
	"item-description": "_2e4ebd9f6d7ce5d4__item-description",
	"loading-indicator": "_384062150817186f__loading-indicator c53905a339ee5b93__item-layout",
	"status": "c4502685591e2f57__status",
	"empty": "_46236ecbce83a6f0__empty",
	"loading-spinner": "_9dd46ff6c5337aad__loading-spinner"
};
/**
* Renders a visual separator between select items or groups.
*/
const Separator = (0, import_element.forwardRef)(function SelectSeparator$1({ className, orientation: _orientation, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator, {
		ref,
		className: clsx(item_popup_module_default.separator, className),
		...props
	});
});

// packages/ui/build-module/form/primitives/select/trigger.mjs
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
registerStyle$13("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
var focus_module_default = {
	"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
	"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
	"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
	"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
	"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
};
registerStyle$13("56b0509c70", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f19aaaa579fccf54__trigger-wrapper{&.bfac6d240be543bd__is-minimal{width:fit-content}}.e1f5987e5bdc9112__trigger{align-items:center;background-color:transparent;border:none;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:inherit;font-size:inherit;gap:var(--wpds-dimension-gap-xs,4px);justify-content:space-between;line-height:1.4;padding-block:4px;padding-inline-end:calc(var(--wp-ui-input-layout-padding-inline) - 4px);padding-inline-start:var(--wp-ui-input-layout-padding-inline);text-align:start;user-select:none;width:100%;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.bfac6d240be543bd__is-minimal{width:auto}&:focus{outline:none}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}}.ba63264311039401__trigger-value{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;.e1f5987e5bdc9112__trigger[data-placeholder]:not([data-disabled]) &{color:var(--wpds-color-foreground-interactive-neutral-weak,#707070)}}.cb34834e4f533240__trigger-caret{flex:0 0 auto}}}");
var select_trigger_module_default = {
	"trigger-wrapper": "f19aaaa579fccf54__trigger-wrapper",
	"is-minimal": "bfac6d240be543bd__is-minimal",
	"trigger": "e1f5987e5bdc9112__trigger",
	"trigger-value": "ba63264311039401__trigger-value",
	"trigger-caret": "cb34834e4f533240__trigger-caret"
};
const Trigger$1 = (0, import_element.forwardRef)(function UnforwardedTrigger({ className, size, variant, children, placeholder = (0, import_i18n.__)("Select"), ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputLayout, {
		className: clsx(focus_module_default["outset-ring--focus-within-except-active"], select_trigger_module_default["trigger-wrapper"], variant === "minimal" && select_trigger_module_default["is-minimal"], className),
		size,
		isBorderless: variant === "minimal",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
			...restProps,
			className: clsx(select_trigger_module_default.trigger, variant === "minimal" && select_trigger_module_default["is-minimal"]),
			"data-can-disable-input-layout": true,
			ref,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
				placeholder,
				className: select_trigger_module_default["trigger-value"],
				children
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: select_trigger_module_default["trigger-caret"],
				icon: chevron_down_default,
				size: 18
			})]
		})
	});
});

// packages/ui/build-module/form/checkbox-control/checkbox-control.mjs
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
registerStyle$12("7980f7e8b8", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.bbea3dac6f8712ee__root{--_wp-ui-checkbox-control-checkbox-height:16px;--_wp-ui-checkbox-control-label-line-height:max(var(--_wp-ui-checkbox-control-checkbox-height),var(--wpds-typography-line-height-xs,16px))}.d92ba193f3d659b9__checkbox-wrapper{align-items:center;display:flex;height:1lh;line-height:var(--_wp-ui-checkbox-control-label-line-height);overflow:visible}.eafaf9baabcb892a__checkbox{--wp-ui-checkbox-input-size:var(--_wp-ui-checkbox-control-checkbox-height)}.f18cb6bc3fecc497__label{--wp-ui-field-label-line-height:var(--_wp-ui-checkbox-control-label-line-height)}.bbea3dac6f8712ee__root:not(:has(.eafaf9baabcb892a__checkbox[data-disabled])) .f18cb6bc3fecc497__label{cursor:var(--wpds-cursor-control,pointer)}}}");
var style_module_default$12 = {
	"root": "bbea3dac6f8712ee__root",
	"checkbox-wrapper": "d92ba193f3d659b9__checkbox-wrapper",
	"checkbox": "eafaf9baabcb892a__checkbox",
	"label": "f18cb6bc3fecc497__label"
};
const ITEM_RENDER = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
	gap: "sm",
	align: "start"
});
const TextContainer = ({ isStack, ...restProps }) => isStack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
	direction: "column",
	gap: "xs",
	...restProps
}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_element.Fragment, { ...restProps });
/**
* A complete checkbox field with integrated label and description.
*
* For grouping and nested parent checkboxes, see the [Checkbox Groups](https://wordpress.github.io/gutenberg/?path=/docs/design-system-components-form-checkbox-groups--docs)
* documentation.
*/
const CheckboxControl = (0, import_element.forwardRef)(function UnforwardedCheckboxControl({ label, description, details, hideLabelFromVision, className, name, ...checkboxProps }, ref) {
	const hasSupportingText = !!description || !!details;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
		name,
		className: clsx(style_module_default$12.root, className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item$2, {
			render: ITEM_RENDER,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$12["checkbox-wrapper"],
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					ref,
					className: style_module_default$12.checkbox,
					...checkboxProps
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TextContainer, {
				isStack: hasSupportingText,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						variant: "plain",
						hideFromVision: hideLabelFromVision,
						className: style_module_default$12.label,
						children: label
					}),
					description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, { children: description }),
					details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Details, { children: details })
				]
			})]
		})
	});
});

// packages/ui/build-module/form/input-control/input-control.mjs
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
registerStyle$11("1122fa5d0a", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer compositions{@supports (-webkit-hyphens:none) and (not (-moz-appearance:none)){.df5861c8fb684609__root input[type=date]:not([data-filled]):not(:focus),.df5861c8fb684609__root input[type=datetime-local]:not([data-filled]):not(:focus),.df5861c8fb684609__root input[type=time]:not([data-filled]):not(:focus){--_gcd-input-color:transparent;--_gcd-input-color-disabled:transparent;color:transparent;&:disabled::-webkit-datetime-edit-text{color:transparent}}}}}");
var style_module_default$11 = { "root": "df5861c8fb684609__root" };
/**
* A complete input field with integrated label and description.
*/
const InputControl = (0, import_element.forwardRef)(function UnforwardedInputControl({ className, label, description, details, hideLabelFromVision, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root$1, {
		className: clsx(style_module_default$11.root, className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				hideFromVision: hideLabelFromVision,
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				ref,
				...restProps
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, { children: description }),
			details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Details, { children: details })
		]
	});
});

// packages/ui/build-module/form/select-control/dev-warnings.mjs
function warnSelectControlProps(items, itemToStringValue) {
	if (!itemToStringValue && items?.some((item) => item.value === "")) (0, import_warning.default)("SelectControl: empty string item values are treated as empty selections by default. Use a non-empty item value or return a non-empty string from `itemToStringValue`. Use `null` for an option that clears the selection.");
}

// packages/ui/build-module/form/select-control/item.mjs
const Item = (0, import_element.forwardRef)(function UnforwardedItem(props, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item$1, {
		ref,
		...props
	});
});

// packages/ui/build-module/form/select-control/trigger.mjs
/**
* The trigger button for a `SelectControl`.
*/
const Trigger = (0, import_element.forwardRef)(function UnforwardedTrigger(props, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger$1, {
		ref,
		...props
	});
});

// packages/ui/build-module/form/select-control/select-control.mjs
const DEFAULT_TRIGGER = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {});
/**
* A complete select field with integrated label and description.
*/
const SelectControl$1 = (0, import_element.forwardRef)(function UnforwardedSelectControl({ className, children, items, label, description, details, hideLabelFromVision, placeholder, popupWidth = "content", size = "default", trigger, ...restProps }, ref) {
	warnSelectControlProps(items, restProps.itemToStringValue);
	const triggerElement = useRender({
		render: trigger ?? DEFAULT_TRIGGER,
		ref,
		props: {
			placeholder,
			size
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root$1, {
		className,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				hideFromVision: hideLabelFromVision,
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
				items,
				...restProps,
				children: [triggerElement, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, {
					width: popupWidth,
					children: children !== void 0 ? children : items?.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
						value: item,
						label: item.label,
						disabled: item.disabled,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemLabel, { children: item.label }), item.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemDescription, { children: item.description }) : null]
					}, item.value ?? "null"))
				})]
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, { children: description }),
			details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Details, { children: details })
		]
	});
});

// packages/ui/build-module/form/select-control/index.mjs
Trigger.displayName = "SelectControl.Trigger";
Group.displayName = "SelectControl.Group";
GroupLabel.displayName = "SelectControl.GroupLabel";
Item.displayName = "SelectControl.Item";
ItemLabel.displayName = "SelectControl.ItemLabel";
ItemDescription.displayName = "SelectControl.ItemDescription";
/**
* A complete select field with integrated label and description.
*/
const SelectControl = Object.assign(SelectControl$1, {
	/**
	* The trigger button, passed through the `trigger` prop to customize
	* its props while retaining the control's label and selected content.
	*/
	Trigger,
	/**
	* Groups related items together with an associated label rendered by
	* `SelectControl.GroupLabel`.
	*/
	Group,
	/**
	* Renders a label for a `SelectControl.Group`.
	*/
	GroupLabel,
	/**
	* An item rendered inside a `SelectControl` popup.
	*/
	Item,
	/**
	* The primary label of a select item.
	*/
	ItemLabel,
	/**
	* Supplementary content that describes a select item via
	* `aria-describedby`.
	*/
	ItemDescription,
	/**
	* Renders a visual separator between items or groups.
	*/
	Separator
});

// packages/core-fields/build-module/shared/author/avatar.mjs
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
registerStyle$10("efeba968e6", "._4d84143be9dae462__icon,.dd9b5d817b3207dc__avatar{align-items:center;block-size:1lh;display:flex;flex-shrink:0;inline-size:var(--wpds-dimension-size-2xs,16px)}._4d84143be9dae462__icon svg{fill:currentColor;margin-inline:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2)}.de468aa290326111__name{overflow:hidden;text-overflow:ellipsis}");
var style_module_default$10 = {
	"avatar": "dd9b5d817b3207dc__avatar",
	"icon": "_4d84143be9dae462__icon",
	"name": "de468aa290326111__name"
};
function AuthorAvatar({ src }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: style_module_default$10.avatar,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$2, {
			size: "xs",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
				src,
				alt: "",
				keepMounted: true
			})
		})
	});
}

// packages/core-fields/build-module/post_type_supports/author/view.mjs
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
registerStyle$9("efeba968e6", "._4d84143be9dae462__icon,.dd9b5d817b3207dc__avatar{align-items:center;block-size:1lh;display:flex;flex-shrink:0;inline-size:var(--wpds-dimension-size-2xs,16px)}._4d84143be9dae462__icon svg{fill:currentColor;margin-inline:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2)}.de468aa290326111__name{overflow:hidden;text-overflow:ellipsis}");
var style_module_default$9 = {
	"avatar": "dd9b5d817b3207dc__avatar",
	"icon": "_4d84143be9dae462__icon",
	"name": "de468aa290326111__name"
};
function AuthorView({ item }) {
	const authorId = item?.author;
	const embeddedAuthorId = item?._embedded?.author?.[0]?.id;
	const shouldFetch = Boolean(authorId && (!embeddedAuthorId || authorId !== embeddedAuthorId));
	const { author, hasResolved } = (0, import_data.useSelect)((select) => {
		if (!shouldFetch) return {
			author: null,
			hasResolved: true
		};
		const { getEntityRecords, hasFinishedResolution } = select(import_core_data.store);
		const query = {
			include: [authorId],
			who: "authors",
			context: "view"
		};
		return {
			author: getEntityRecords("root", "user", query)?.[0] ?? null,
			hasResolved: hasFinishedResolution("getEntityRecords", [
				"root",
				"user",
				query
			])
		};
	}, [authorId, shouldFetch]);
	const text = author?.name || item?._embedded?.author?.[0]?.name;
	const imageUrl = author?.avatar_urls?.[48] || item?._embedded?.author?.[0]?.avatar_urls?.[48];
	if (!authorId || !text && hasResolved) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: "row",
		gap: "xs",
		align: "flex-start",
		children: [!!imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthorAvatar, { src: imageUrl }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: style_module_default$9.name,
			children: text
		})]
	});
}

// packages/core-fields/build-module/post_type_supports/author/field.mjs
/**
* The JavaScript parts of the author field; its data is in `field.php`.
*/
const fieldExtensions$16 = {
	getElements: async () => {
		return (await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecords("root", "user", {
			per_page: -1,
			who: "authors",
			_fields: "id,name",
			context: "view"
		}) ?? []).map(({ id, name }) => ({
			value: id,
			label: name
		}));
	},
	setValue: ({ value }) => ({ author: Number(value) }),
	render: AuthorView,
	isVisible: (item) => !item._links || !!item._links["wp:action-assign-author"]
};

// packages/core-fields/build-module/shared/has-action-link.mjs
/**
* Whether the post's `_links` include the given `wp:action-*` relation.
*
* A record without `_links` (a bulk edit form has no record) is treated as
* allowed, so only an explicit absence of the action hides a control.
*
* @param item   The post.
* @param action The link relation, e.g. `wp:action-publish`.
* @return Whether the action link is present.
*/
function hasActionLink(item, action) {
	if (!item._links) return true;
	return !!item._links[action];
}

// \0wp-global:@wordpress/components
var require_components = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.components;
}));

// \0wp-global:@wordpress/date
var require_date = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.date;
}));

// packages/core-fields/build-module/post_type_supports/date/is-date-floating.mjs
var import_components = require_components();
var import_date = require_date();
/**
* Whether the post has no date of its own yet and publishes immediately: a
* draft or pending post whose date was reset (`null`), or still follows its
* modified date, as the server keeps it while it floats.
*
* Pass the saved status of the post: a status edited but not saved yet doesn't
* change whether the date floats.
*
* @param item The post.
* @return Whether the date floats.
*/
function isDateFloating(item) {
	if (![
		"draft",
		"auto-draft",
		"pending"
	].includes(item.status ?? "")) return false;
	return item.date === null || item.date === item.modified;
}

// packages/core-fields/build-module/post_type_supports/date/is-12-hour-time.mjs
/**
* Whether the site's time format is 12-hour: it has an `a` or `A` that is not
* escaped with a backslash.
*
* @return Whether the site uses a 12-hour clock.
*/
function is12HourTime() {
	return /a(?!\\)/i.test((0, import_date.getSettings)().formats.time.toLowerCase().replace(/\\\\/g, "").split("").reverse().join(""));
}

// packages/core-fields/build-module/post_type_supports/date/is-published-on-save.mjs
/**
* Whether saving a post with this date publishes it rather than schedules it.
* Like the editor, a date less than a minute ahead counts as now, which covers
* the time the save takes.
*
* @param date The post date.
* @return Whether the post publishes when it is saved.
*/
function isPublishedOnSave(date) {
	return !(0, import_date.isInTheFuture)(/* @__PURE__ */ new Date(Number((0, import_date.getDate)(date)) - 6e4));
}

// packages/core-fields/build-module/post_type_supports/date/edit.mjs
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
registerStyle$8("f06b653b62", "._5b5942a89f5cb8ec__reset{justify-content:center;width:100%}");
var style_module_default$8 = { "reset": "_5b5942a89f5cb8ec__reset" };
function toTimezonelessDate(date, time) {
	const pad = (number) => String(number).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`;
}
function getMonthBounds(date) {
	const year = date.getFullYear();
	const month = date.getMonth();
	return {
		after: toTimezonelessDate(new Date(year, month, 0), "23:59:59"),
		before: toTimezonelessDate(new Date(year, month + 1, 1), "00:00:00")
	};
}
function getSiteMonth() {
	const now = /* @__PURE__ */ new Date();
	return new Date(Number((0, import_date.date)("Y", now)), Number((0, import_date.date)("n", now)) - 1, 1);
}
function DateEdit({ data, field, onChange, hideLabelFromVision, operator }) {
	const value = field.getValue({ item: data }) ?? void 0;
	const [previewedMonth, setPreviewedMonth] = (0, import_element.useState)(() => value ? new Date(value) : getSiteMonth());
	const [prevValue, setPrevValue] = (0, import_element.useState)(value);
	if (value !== prevValue) {
		setPrevValue(value);
		setPreviewedMonth(value ? new Date(value) : getSiteMonth());
	}
	const otherPosts = (0, import_data.useSelect)((select) => data.type ? select(import_core_data.store).getEntityRecords("postType", data.type, {
		status: "publish,future",
		...getMonthBounds(previewedMonth),
		exclude: data.id ? [data.id] : [],
		per_page: 100,
		_fields: "id,date"
	}) : null, [
		data.type,
		data.id,
		previewedMonth
	]);
	const events = (0, import_element.useMemo)(() => (otherPosts ?? []).map((post) => ({ date: new Date(post.date) })), [otherPosts]);
	const savedStatus = (0, import_data.useSelect)((select) => {
		if (!data.type || !data.id) return;
		return select(import_core_data.store).getEntityRecord("postType", data.type, data.id)?.status;
	}, [data.type, data.id]);
	const isReset = !value;
	const isFloating = isDateFloating({
		...data,
		status: savedStatus ?? data.status
	});
	const isFilter = !!operator;
	const note = !isFilter && data.status === "future" && (!value || isFloating || isPublishedOnSave(value)) ? (0, import_i18n.__)("Publishes immediately.") : void 0;
	const noteId = (0, import_element.useId)();
	const onPick = (newValue) => {
		onChange(field.setValue({
			item: data,
			value: newValue
		}));
		if (!isFilter && newValue) speak((0, import_i18n.sprintf)((0, import_i18n.__)("Publish date set to %s."), (0, import_date.dateI18n)((0, import_date.getSettings)().formats.datetime, (0, import_date.getDate)(newValue))), "assertive");
	};
	const onReset = () => {
		onChange(field.setValue({
			item: data,
			value: null
		}));
		speak((0, import_i18n.__)("Publish date set to now."), "assertive");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldsetRoot, {}),
		direction: "column",
		gap: "lg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldsetLegend, {
				hideFromVision: hideLabelFromVision,
				children: field.label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.DateTimePicker, {
				currentDate: value,
				onChange: onPick,
				is12Hour: is12HourTime(),
				dateOrder: (0, import_i18n._x)("dmy", "date order"),
				startOfWeek: (0, import_date.getSettings)().l10n.startOfWeek,
				events,
				onMonthPreviewed: (date) => setPreviewedMonth(new Date(date))
			}),
			!isFilter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
				className: style_module_default$8.reset,
				variant: "secondary",
				__next40pxDefaultSize: true,
				accessibleWhenDisabled: true,
				disabled: isReset,
				onClick: onReset,
				"aria-describedby": note ? noteId : void 0,
				children: (0, import_i18n.__)("Reset")
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldsetDescription, {
				id: noteId,
				children: note
			})
		]
	});
}

// packages/core-fields/build-module/post_type_supports/date/view.mjs
const getFormattedDate = (dateToDisplay) => (0, import_date.dateI18n)((0, import_date.getSettings)().formats.datetimeAbbreviated, (0, import_date.getDate)(dateToDisplay));
const DateView = ({ item }) => {
	if (["draft", "private"].includes(item.status ?? "")) return (0, import_element.createInterpolateElement)((0, import_i18n.sprintf)((0, import_i18n.__)("<span>Modified: <time>%s</time></span>"), getFormattedDate(item.date ?? null)), {
		span: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
		time: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {})
	});
	if (item.status === "future") return (0, import_element.createInterpolateElement)((0, import_i18n.sprintf)((0, import_i18n.__)("<span>Scheduled: <time>%s</time></span>"), getFormattedDate(item.date ?? null)), {
		span: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
		time: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {})
	});
	if (item.status === "publish") return (0, import_element.createInterpolateElement)((0, import_i18n.sprintf)((0, import_i18n.__)("<span>Published: <time>%s</time></span>"), getFormattedDate(item.date ?? null)), {
		span: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
		time: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {})
	});
	const dateToDisplay = (0, import_date.getDate)(item.modified ?? null) > (0, import_date.getDate)(item.date ?? null) ? item.modified : item.date;
	if (item.status === "pending") return (0, import_element.createInterpolateElement)((0, import_i18n.sprintf)((0, import_i18n.__)("<span>Modified: <time>%s</time></span>"), getFormattedDate(dateToDisplay ?? null)), {
		span: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
		time: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", { children: getFormattedDate(item.date ?? null) });
};

// packages/core-fields/build-module/post_type_supports/date/field.mjs
/**
* The JavaScript parts of the date field; its data is in `field.php`.
*/
const fieldExtensions$15 = {
	isVisible: (item) => hasActionLink(item, "wp:action-publish"),
	render: DateView,
	Edit: DateEdit,
	setValue: ({ value }) => ({ date: value ?? null })
};

// packages/core-fields/build-module/post_type_supports/discussion/field.mjs
/**
* The JavaScript parts of the discussion field; its data is in `field.php`.
*/
const fieldExtensions$14 = { render: ({ item }) => {
	const commentsOpen = item.comment_status === "open";
	const pingsOpen = item.ping_status === "open";
	if (commentsOpen && pingsOpen) return (0, import_i18n.__)("Open");
	if (commentsOpen && !pingsOpen) return (0, import_i18n.__)("Comments only");
	if (!commentsOpen && pingsOpen) return (0, import_i18n.__)("Pings only");
	return (0, import_i18n.__)("Closed");
} };

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// packages/core-fields/build-module/post_type_supports/excerpt/field.mjs
var import_html_entities = require_html_entities();
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
registerStyle$7("a762a4ff63", "._6cbb3f8b4541adef__excerpt{-webkit-box-orient:vertical;-webkit-line-clamp:3;line-clamp:3;display:-webkit-box;overflow:hidden;text-align:start}");
var style_module_default$7 = { "excerpt": "_6cbb3f8b4541adef__excerpt" };
/**
* The JavaScript parts of the excerpt field; its data is in `field.php`.
*/
const fieldExtensions$13 = {
	description: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		href: (0, import_i18n.__)("https://wordpress.org/documentation/article/page-post-settings-sidebar/#excerpt"),
		openInNewTab: true,
		children: (0, import_i18n.__)("Learn more about manual excerpts")
	}),
	render: ({ item }) => {
		const excerpt = typeof item.excerpt === "string" ? item.excerpt : item.excerpt?.raw;
		return excerpt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: style_module_default$7.excerpt,
			children: (0, import_html_entities.decodeEntities)(excerpt)
		}) : null;
	}
};

// \0wp-global:@wordpress/media-utils
var require_media_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.mediaUtils;
}));

// packages/core-fields/build-module/lock-unlock.mjs
var import_media_utils = require_media_utils();
var import_private_apis = require_private_apis();
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/core-fields");

// packages/core-fields/build-module/post_type_supports/featured_media/edit.mjs
const { MediaEditControl } = unlock(import_media_utils.privateApis);
const FilteredMediaEdit = (0, import_components.withFilters)("editor.PostFeaturedImage")(function PostFeaturedImage(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaEditControl, {
		...props,
		isExpanded: true,
		isPickerFiltered: true,
		featuredImageFlow: true,
		pickerTitle: props.postType?.labels?.featured_image || props.field.label
	});
});
/**
* The control resolved through the `editor.PostFeaturedImage` filter, with
* the read-only facts the classic panel passed to it, `currentPostId`,
* `featuredImageId`, `media` and `postType`, and its `onRemoveImage` handler;
* its picker resolves through the `editor.MediaUpload` filter, as the classic
* panel's does. Callbacks of either filter may read the props to render their
* own controls next to the picker and may act through the editor store
* (`editPost`, `useEntityProp`), which is why this only renders where that
* store's current post is the item (see `FeaturedImageEdit`).
*
* @param props The DataForm control props.
*/
function FilteredFeaturedImageEdit(props) {
	const { data, field, onChange } = props;
	const featuredImageId = field.getValue({ item: data }) ?? 0;
	const { media, postType } = (0, import_data.useSelect)((select) => {
		const { getEntityRecords, getPostType } = select(import_core_data.store);
		return {
			media: featuredImageId ? getEntityRecords("postType", "attachment", { include: [featuredImageId] })?.[0] ?? null : null,
			postType: getPostType(data.type)
		};
	}, [featuredImageId, data.type]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilteredMediaEdit, {
		...props,
		currentPostId: data.id,
		featuredImageId,
		media,
		postType,
		onRemoveImage: () => onChange(field.setValue({
			item: data,
			value: void 0
		}))
	});
}
/**
* Edit control of the featured image field.
*
* In the post editor, where the item is the post in the surrounding entity
* context, the control goes through the `editor.PostFeaturedImage` filter and
* its picker through `editor.MediaUpload`, so plugins that extend the classic
* featured image panel or its media picker keep working. Elsewhere, such as
* Quick Edit, it renders the media control directly, with the plain picker.
*
* @param props The DataForm control props.
*/
function FeaturedImageEdit(props) {
	const { data } = props;
	const labels = (0, import_data.useSelect)((select) => select(import_core_data.store).getPostType(data.type)?.labels, [data.type]);
	const setFeaturedImageLabel = labels?.set_featured_image;
	const field = (0, import_element.useMemo)(() => setFeaturedImageLabel ? {
		...props.field,
		placeholder: setFeaturedImageLabel
	} : props.field, [props.field, setFeaturedImageLabel]);
	const contextId = (0, import_core_data.useEntityId)("postType", data.type);
	if (contextId === void 0 || String(contextId) !== String(data.id)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaEditControl, {
		...props,
		field,
		isExpanded: true,
		featuredImageFlow: true,
		pickerTitle: labels?.featured_image || field.label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilteredFeaturedImageEdit, {
		...props,
		field
	});
}

// packages/core-fields/build-module/post_type_supports/featured_media/view.mjs
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
registerStyle$6("1d3386c051", "._6c38af90102e4699__image,._8a1ece60abf4242c__placeholder{border-radius:var(--wpds-border-radius-md,4px);display:block;height:100%;width:100%}._8a1ece60abf4242c__placeholder{background:#f0f0f0;box-shadow:none}");
var style_module_default$6 = {
	"image": "_6c38af90102e4699__image",
	"placeholder": "_8a1ece60abf4242c__placeholder"
};
function FeaturedImageView({ item, config }) {
	const media = item?._embedded?.["wp:featuredmedia"]?.[0];
	const url = media?.source_url;
	if (!url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: clsx("fields-controls__featured-image-placeholder", style_module_default$6.placeholder) });
	const sizes = media?.media_details?.sizes;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		className: clsx("fields-controls__featured-image-image", style_module_default$6.image),
		src: url,
		alt: "",
		srcSet: sizes ? Object.values(sizes).map((size) => `${size.source_url} ${size.width}w`).join(", ") : void 0,
		sizes: config?.sizes || "100vw"
	});
}

// packages/core-fields/build-module/post_type_supports/featured_media/field.mjs
/**
* The JavaScript parts of the featured image field; its data is in
* `field.php`.
*/
const fieldExtensions$12 = {
	Edit: FeaturedImageEdit,
	render: FeaturedImageView,
	setValue: ({ value }) => ({ featured_media: value ?? 0 })
};

// packages/core-fields/build-module/post_type_supports/last_edited_date/view.mjs
function LastEditedDateView({ item }) {
	if (!item.modified) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, { children: (0, import_i18n.sprintf)((0, import_i18n.__)("Last edited %s."), (0, import_date.humanTimeDiff)(item.modified)) });
}

// packages/core-fields/build-module/post_type_supports/last_edited_date/field.mjs
/**
* The JavaScript parts of the last edited date field; its data is in
* `field.php`.
*/
const fieldExtensions$11 = {
	getValue: ({ item }) => item.modified,
	isVisible: (item) => !!item.modified,
	render: LastEditedDateView
};

// node_modules/.store/remove-accents@0.5.0-S_lnImruWgc6kBSjIJlPgw/node_modules/remove-accents/index.js
var require_remove_accents = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var characterMap = {
		"À": "A",
		"Á": "A",
		"Â": "A",
		"Ã": "A",
		"Ä": "A",
		"Å": "A",
		"Ấ": "A",
		"Ắ": "A",
		"Ẳ": "A",
		"Ẵ": "A",
		"Ặ": "A",
		"Æ": "AE",
		"Ầ": "A",
		"Ằ": "A",
		"Ȃ": "A",
		"Ả": "A",
		"Ạ": "A",
		"Ẩ": "A",
		"Ẫ": "A",
		"Ậ": "A",
		"Ç": "C",
		"Ḉ": "C",
		"È": "E",
		"É": "E",
		"Ê": "E",
		"Ë": "E",
		"Ế": "E",
		"Ḗ": "E",
		"Ề": "E",
		"Ḕ": "E",
		"Ḝ": "E",
		"Ȇ": "E",
		"Ẻ": "E",
		"Ẽ": "E",
		"Ẹ": "E",
		"Ể": "E",
		"Ễ": "E",
		"Ệ": "E",
		"Ì": "I",
		"Í": "I",
		"Î": "I",
		"Ï": "I",
		"Ḯ": "I",
		"Ȋ": "I",
		"Ỉ": "I",
		"Ị": "I",
		"Ð": "D",
		"Ñ": "N",
		"Ò": "O",
		"Ó": "O",
		"Ô": "O",
		"Õ": "O",
		"Ö": "O",
		"Ø": "O",
		"Ố": "O",
		"Ṍ": "O",
		"Ṓ": "O",
		"Ȏ": "O",
		"Ỏ": "O",
		"Ọ": "O",
		"Ổ": "O",
		"Ỗ": "O",
		"Ộ": "O",
		"Ờ": "O",
		"Ở": "O",
		"Ỡ": "O",
		"Ớ": "O",
		"Ợ": "O",
		"Ù": "U",
		"Ú": "U",
		"Û": "U",
		"Ü": "U",
		"Ủ": "U",
		"Ụ": "U",
		"Ử": "U",
		"Ữ": "U",
		"Ự": "U",
		"Ý": "Y",
		"à": "a",
		"á": "a",
		"â": "a",
		"ã": "a",
		"ä": "a",
		"å": "a",
		"ấ": "a",
		"ắ": "a",
		"ẳ": "a",
		"ẵ": "a",
		"ặ": "a",
		"æ": "ae",
		"ầ": "a",
		"ằ": "a",
		"ȃ": "a",
		"ả": "a",
		"ạ": "a",
		"ẩ": "a",
		"ẫ": "a",
		"ậ": "a",
		"ç": "c",
		"ḉ": "c",
		"è": "e",
		"é": "e",
		"ê": "e",
		"ë": "e",
		"ế": "e",
		"ḗ": "e",
		"ề": "e",
		"ḕ": "e",
		"ḝ": "e",
		"ȇ": "e",
		"ẻ": "e",
		"ẽ": "e",
		"ẹ": "e",
		"ể": "e",
		"ễ": "e",
		"ệ": "e",
		"ì": "i",
		"í": "i",
		"î": "i",
		"ï": "i",
		"ḯ": "i",
		"ȋ": "i",
		"ỉ": "i",
		"ị": "i",
		"ð": "d",
		"ñ": "n",
		"ò": "o",
		"ó": "o",
		"ô": "o",
		"õ": "o",
		"ö": "o",
		"ø": "o",
		"ố": "o",
		"ṍ": "o",
		"ṓ": "o",
		"ȏ": "o",
		"ỏ": "o",
		"ọ": "o",
		"ổ": "o",
		"ỗ": "o",
		"ộ": "o",
		"ờ": "o",
		"ở": "o",
		"ỡ": "o",
		"ớ": "o",
		"ợ": "o",
		"ù": "u",
		"ú": "u",
		"û": "u",
		"ü": "u",
		"ủ": "u",
		"ụ": "u",
		"ử": "u",
		"ữ": "u",
		"ự": "u",
		"ý": "y",
		"ÿ": "y",
		"Ā": "A",
		"ā": "a",
		"Ă": "A",
		"ă": "a",
		"Ą": "A",
		"ą": "a",
		"Ć": "C",
		"ć": "c",
		"Ĉ": "C",
		"ĉ": "c",
		"Ċ": "C",
		"ċ": "c",
		"Č": "C",
		"č": "c",
		"C̆": "C",
		"c̆": "c",
		"Ď": "D",
		"ď": "d",
		"Đ": "D",
		"đ": "d",
		"Ē": "E",
		"ē": "e",
		"Ĕ": "E",
		"ĕ": "e",
		"Ė": "E",
		"ė": "e",
		"Ę": "E",
		"ę": "e",
		"Ě": "E",
		"ě": "e",
		"Ĝ": "G",
		"Ǵ": "G",
		"ĝ": "g",
		"ǵ": "g",
		"Ğ": "G",
		"ğ": "g",
		"Ġ": "G",
		"ġ": "g",
		"Ģ": "G",
		"ģ": "g",
		"Ĥ": "H",
		"ĥ": "h",
		"Ħ": "H",
		"ħ": "h",
		"Ḫ": "H",
		"ḫ": "h",
		"Ĩ": "I",
		"ĩ": "i",
		"Ī": "I",
		"ī": "i",
		"Ĭ": "I",
		"ĭ": "i",
		"Į": "I",
		"į": "i",
		"İ": "I",
		"ı": "i",
		"Ĳ": "IJ",
		"ĳ": "ij",
		"Ĵ": "J",
		"ĵ": "j",
		"Ķ": "K",
		"ķ": "k",
		"Ḱ": "K",
		"ḱ": "k",
		"K̆": "K",
		"k̆": "k",
		"Ĺ": "L",
		"ĺ": "l",
		"Ļ": "L",
		"ļ": "l",
		"Ľ": "L",
		"ľ": "l",
		"Ŀ": "L",
		"ŀ": "l",
		"Ł": "l",
		"ł": "l",
		"Ḿ": "M",
		"ḿ": "m",
		"M̆": "M",
		"m̆": "m",
		"Ń": "N",
		"ń": "n",
		"Ņ": "N",
		"ņ": "n",
		"Ň": "N",
		"ň": "n",
		"ŉ": "n",
		"N̆": "N",
		"n̆": "n",
		"Ō": "O",
		"ō": "o",
		"Ŏ": "O",
		"ŏ": "o",
		"Ő": "O",
		"ő": "o",
		"Œ": "OE",
		"œ": "oe",
		"P̆": "P",
		"p̆": "p",
		"Ŕ": "R",
		"ŕ": "r",
		"Ŗ": "R",
		"ŗ": "r",
		"Ř": "R",
		"ř": "r",
		"R̆": "R",
		"r̆": "r",
		"Ȓ": "R",
		"ȓ": "r",
		"Ś": "S",
		"ś": "s",
		"Ŝ": "S",
		"ŝ": "s",
		"Ş": "S",
		"Ș": "S",
		"ș": "s",
		"ş": "s",
		"Š": "S",
		"š": "s",
		"Ţ": "T",
		"ţ": "t",
		"ț": "t",
		"Ț": "T",
		"Ť": "T",
		"ť": "t",
		"Ŧ": "T",
		"ŧ": "t",
		"T̆": "T",
		"t̆": "t",
		"Ũ": "U",
		"ũ": "u",
		"Ū": "U",
		"ū": "u",
		"Ŭ": "U",
		"ŭ": "u",
		"Ů": "U",
		"ů": "u",
		"Ű": "U",
		"ű": "u",
		"Ų": "U",
		"ų": "u",
		"Ȗ": "U",
		"ȗ": "u",
		"V̆": "V",
		"v̆": "v",
		"Ŵ": "W",
		"ŵ": "w",
		"Ẃ": "W",
		"ẃ": "w",
		"X̆": "X",
		"x̆": "x",
		"Ŷ": "Y",
		"ŷ": "y",
		"Ÿ": "Y",
		"Y̆": "Y",
		"y̆": "y",
		"Ź": "Z",
		"ź": "z",
		"Ż": "Z",
		"ż": "z",
		"Ž": "Z",
		"ž": "z",
		"ſ": "s",
		"ƒ": "f",
		"Ơ": "O",
		"ơ": "o",
		"Ư": "U",
		"ư": "u",
		"Ǎ": "A",
		"ǎ": "a",
		"Ǐ": "I",
		"ǐ": "i",
		"Ǒ": "O",
		"ǒ": "o",
		"Ǔ": "U",
		"ǔ": "u",
		"Ǖ": "U",
		"ǖ": "u",
		"Ǘ": "U",
		"ǘ": "u",
		"Ǚ": "U",
		"ǚ": "u",
		"Ǜ": "U",
		"ǜ": "u",
		"Ứ": "U",
		"ứ": "u",
		"Ṹ": "U",
		"ṹ": "u",
		"Ǻ": "A",
		"ǻ": "a",
		"Ǽ": "AE",
		"ǽ": "ae",
		"Ǿ": "O",
		"ǿ": "o",
		"Þ": "TH",
		"þ": "th",
		"Ṕ": "P",
		"ṕ": "p",
		"Ṥ": "S",
		"ṥ": "s",
		"X́": "X",
		"x́": "x",
		"Ѓ": "Г",
		"ѓ": "г",
		"Ќ": "К",
		"ќ": "к",
		"A̋": "A",
		"a̋": "a",
		"E̋": "E",
		"e̋": "e",
		"I̋": "I",
		"i̋": "i",
		"Ǹ": "N",
		"ǹ": "n",
		"Ồ": "O",
		"ồ": "o",
		"Ṑ": "O",
		"ṑ": "o",
		"Ừ": "U",
		"ừ": "u",
		"Ẁ": "W",
		"ẁ": "w",
		"Ỳ": "Y",
		"ỳ": "y",
		"Ȁ": "A",
		"ȁ": "a",
		"Ȅ": "E",
		"ȅ": "e",
		"Ȉ": "I",
		"ȉ": "i",
		"Ȍ": "O",
		"ȍ": "o",
		"Ȑ": "R",
		"ȑ": "r",
		"Ȕ": "U",
		"ȕ": "u",
		"B̌": "B",
		"b̌": "b",
		"Č̣": "C",
		"č̣": "c",
		"Ê̌": "E",
		"ê̌": "e",
		"F̌": "F",
		"f̌": "f",
		"Ǧ": "G",
		"ǧ": "g",
		"Ȟ": "H",
		"ȟ": "h",
		"J̌": "J",
		"ǰ": "j",
		"Ǩ": "K",
		"ǩ": "k",
		"M̌": "M",
		"m̌": "m",
		"P̌": "P",
		"p̌": "p",
		"Q̌": "Q",
		"q̌": "q",
		"Ř̩": "R",
		"ř̩": "r",
		"Ṧ": "S",
		"ṧ": "s",
		"V̌": "V",
		"v̌": "v",
		"W̌": "W",
		"w̌": "w",
		"X̌": "X",
		"x̌": "x",
		"Y̌": "Y",
		"y̌": "y",
		"A̧": "A",
		"a̧": "a",
		"B̧": "B",
		"b̧": "b",
		"Ḑ": "D",
		"ḑ": "d",
		"Ȩ": "E",
		"ȩ": "e",
		"Ɛ̧": "E",
		"ɛ̧": "e",
		"Ḩ": "H",
		"ḩ": "h",
		"I̧": "I",
		"i̧": "i",
		"Ɨ̧": "I",
		"ɨ̧": "i",
		"M̧": "M",
		"m̧": "m",
		"O̧": "O",
		"o̧": "o",
		"Q̧": "Q",
		"q̧": "q",
		"U̧": "U",
		"u̧": "u",
		"X̧": "X",
		"x̧": "x",
		"Z̧": "Z",
		"z̧": "z",
		"й": "и",
		"Й": "И",
		"ё": "е",
		"Ё": "Е"
	};
	var chars = Object.keys(characterMap).join("|");
	var allAccents = new RegExp(chars, "g");
	var firstAccent = new RegExp(chars, "");
	function matcher(match) {
		return characterMap[match];
	}
	var removeAccents = function(string) {
		return string.replace(allAccents, matcher);
	};
	var hasAccents = function(string) {
		return !!string.match(firstAccent);
	};
	module.exports = removeAccents;
	module.exports.has = hasAccents;
	module.exports.remove = removeAccents;
}));

// \0wp-global:@wordpress/url
var require_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.url;
}));

// packages/core-fields/build-module/post_type_supports/parent/utils.mjs
var import_compose = require_compose();
var import_remove_accents = /* @__PURE__ */ __toESM(require_remove_accents(), 1);
var import_url = require_url();
/**
* The title of a post, with its id as the fallback.
*
* @param post The post.
* @return The decoded title of the post, or its id when it has none.
*/
function getTitleWithFallbackName(post) {
	return typeof post.title === "object" && "rendered" in post.title && post.title.rendered ? (0, import_html_entities.decodeEntities)(post.title.rendered) : `#${post?.id} (${(0, import_i18n.__)("no title")})`;
}

// packages/core-fields/build-module/post_type_supports/parent/edit.mjs
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
registerStyle$5("b954f68ff1", "._9f5fd4053ee0af14__parent{border:0;margin:0;padding:0}");
var style_module_default$5 = { "parent": "_9f5fd4053ee0af14__parent" };
function buildTermsTree(flatTerms) {
	const flatTermsWithParentAndChildren = flatTerms.map((term) => {
		return {
			children: [],
			...term
		};
	});
	if (flatTermsWithParentAndChildren.some(({ parent }) => parent === null || parent === void 0)) return flatTermsWithParentAndChildren;
	const termsByParent = flatTermsWithParentAndChildren.reduce((acc, term) => {
		const { parent } = term;
		if (!acc[parent]) acc[parent] = [];
		acc[parent].push(term);
		return acc;
	}, {});
	const fillWithChildren = (terms) => {
		return terms.map((term) => {
			const children = termsByParent[term.id];
			return {
				...term,
				children: children && children.length ? fillWithChildren(children) : []
			};
		});
	};
	return fillWithChildren(termsByParent["0"] || []);
}
const getItemPriority = (name, searchValue) => {
	const normalizedName = (0, import_remove_accents.default)(name || "").toLowerCase();
	const normalizedSearch = (0, import_remove_accents.default)(searchValue || "").toLowerCase();
	if (normalizedName === normalizedSearch) return 0;
	if (normalizedName.startsWith(normalizedSearch)) return normalizedName.length;
	return Infinity;
};
function PageAttributesParent({ data, onChangeControl }) {
	const [fieldValue, setFieldValue] = (0, import_element.useState)("");
	const pageId = data.parent;
	const postId = data.id;
	const postTypeSlug = data.type;
	const { parentPostTitle, pageItems, isHierarchical } = (0, import_data.useSelect)((select) => {
		const { getEntityRecord, getEntityRecords, getPostType } = select(import_core_data.store);
		const postTypeInfo = getPostType(postTypeSlug);
		const postIsHierarchical = postTypeInfo?.hierarchical && postTypeInfo.viewable;
		const parentPost = pageId ? getEntityRecord("postType", postTypeSlug, pageId) : null;
		const query = {
			per_page: 100,
			exclude: postId,
			parent_exclude: postId,
			orderby: "menu_order",
			order: "asc",
			_fields: "id,title,parent",
			...!!fieldValue && {
				search: fieldValue,
				orderby: "relevance",
				search_columns: ["post_title"]
			}
		};
		return {
			isHierarchical: postIsHierarchical,
			parentPostTitle: parentPost ? getTitleWithFallbackName(parentPost) : "",
			pageItems: postIsHierarchical ? getEntityRecords("postType", postTypeSlug, query) : null
		};
	}, [
		fieldValue,
		pageId,
		postId,
		postTypeSlug
	]);
	/**
	* This logic has been copied from https://github.com/WordPress/gutenberg/blob/0249771b519d5646171fb9fae422006c8ab773f2/packages/editor/src/components/page-attributes/parent.js#L106.
	*/
	const parentOptions = (0, import_element.useMemo)(() => {
		const getOptionsFromTree = (tree, level = 0) => {
			return tree.map((treeNode) => [{
				value: treeNode.id,
				label: "— ".repeat(level) + (0, import_html_entities.decodeEntities)(treeNode.name),
				rawName: treeNode.name
			}, ...getOptionsFromTree(treeNode.children || [], level + 1)]).sort(([a], [b]) => {
				return getItemPriority(a.rawName, fieldValue) >= getItemPriority(b.rawName, fieldValue) ? 1 : -1;
			}).flat();
		};
		if (!pageItems) return [];
		let tree = pageItems.map((item) => ({
			id: item.id,
			parent: item.parent ?? null,
			name: getTitleWithFallbackName(item)
		}));
		if (!fieldValue) tree = buildTermsTree(tree);
		const opts = getOptionsFromTree(tree);
		const optsHasParent = opts.find((item) => item.value === pageId);
		if (pageId && parentPostTitle && !optsHasParent) opts.unshift({
			value: pageId,
			label: parentPostTitle,
			rawName: ""
		});
		return opts.map((option) => ({
			...option,
			value: option.value.toString()
		}));
	}, [
		pageItems,
		fieldValue,
		parentPostTitle,
		pageId
	]);
	if (!isHierarchical) return null;
	/**
	* Handle user input.
	*
	* @param {string} inputValue The current value of the input field.
	*/
	const handleKeydown = (inputValue) => {
		setFieldValue(inputValue);
	};
	/**
	* Handle author selection.
	*
	* @param {Object} selectedPostId The selected Author.
	*/
	const handleChange = (selectedPostId) => {
		if (selectedPostId) return onChangeControl(parseInt(selectedPostId, 10) ?? 0);
		onChangeControl(0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ComboboxControl, {
		label: (0, import_i18n.__)("Parent"),
		help: (0, import_i18n.__)("Choose a parent page."),
		value: pageId?.toString(),
		options: parentOptions,
		onFilterValueChange: (0, import_compose.debounce)((value) => handleKeydown(value), 300),
		onChange: handleChange,
		hideLabelFromVision: true
	});
}
const ParentEdit = ({ data, field, onChange }) => {
	const { id } = field;
	const homeUrl = (0, import_data.useSelect)((select) => {
		return select(import_core_data.store).getEntityRecord("root", "__unstableBase")?.home;
	}, []);
	const onChangeControl = (0, import_element.useCallback)((newValue) => onChange({ [id]: newValue }), [id, onChange]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
		className: style_module_default$5.parent,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			(0, import_element.createInterpolateElement)((0, import_i18n.sprintf)((0, import_i18n.__)("Child pages inherit characteristics from their parent, such as URL structure. For instance, if \"Pricing\" is a child of \"Services\", its URL would be %1$s<wbr />/services<wbr />/pricing."), (0, import_url.filterURLForDisplay)(homeUrl).replace(/([/.])/g, "<wbr />$1")), { wbr: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("wbr", {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_element.createInterpolateElement)((0, import_i18n.__)("They also show up as sub-items in the default navigation menu. <a>Learn more.</a>"), { a: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				href: (0, import_i18n.__)("https://wordpress.org/documentation/article/page-post-settings-sidebar/#page-attributes"),
				openInNewTab: true
			}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageAttributesParent, {
				data,
				onChangeControl
			})
		] })
	});
};

// packages/core-fields/build-module/post_type_supports/parent/view.mjs
const ParentView = ({ item }) => {
	const parent = (0, import_data.useSelect)((select) => {
		const { getEntityRecord } = select(import_core_data.store);
		return item?.parent ? getEntityRecord("postType", item.type, item.parent) : null;
	}, [item.parent, item.type]);
	if (parent) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: getTitleWithFallbackName(parent) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: (0, import_i18n.__)("None") });
};

// packages/core-fields/build-module/post_type_supports/parent/field.mjs
/**
* The JavaScript parts of the parent field; its data is in `field.php`.
*/
const fieldExtensions$10 = {
	Edit: ParentEdit,
	render: ParentView
};

// packages/core-fields/build-module/post_type_supports/password/edit.mjs
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
registerStyle$4("c8c90f7a0c", ":where(.b3be8e46f9a2e766__password){border:0;margin:0;padding:0}");
var style_module_default$4 = { "password": "b3be8e46f9a2e766__password" };
function PasswordEdit({ data, onChange, field }) {
	const [showPassword, setShowPassword] = (0, import_element.useState)(!!field.getValue({ item: data }));
	const handleTogglePassword = (value) => {
		setShowPassword(value);
		if (!value) onChange({ password: "" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {}),
		direction: "column",
		gap: "lg",
		className: clsx("fields-controls__password", style_module_default$4.password),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxControl, {
			label: (0, import_i18n.__)("Password protected"),
			description: (0, import_i18n.__)("Only visible to those who know the password"),
			checked: showPassword,
			onCheckedChange: handleTogglePassword
		}), showPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputControl, {
			label: (0, import_i18n.__)("Password"),
			onValueChange: (value) => onChange({ password: value }),
			value: field.getValue({ item: data }) || "",
			placeholder: (0, import_i18n.__)("Use a secure password"),
			type: "text",
			maxLength: 255
		})]
	});
}

// packages/core-fields/build-module/post_type_supports/password/field.mjs
/**
* The JavaScript parts of the password field; its data is in `field.php`.
*/
const fieldExtensions$9 = {
	Edit: PasswordEdit,
	isVisible: (item) => item.status !== "private" && hasActionLink(item, "wp:action-publish")
};

// packages/core-fields/build-module/post_type_supports/ping_status/field.mjs
/**
* The JavaScript parts of the pingbacks and trackbacks field; its data is in
* `field.php`.
*/
const fieldExtensions$8 = {
	description: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		href: (0, import_i18n.__)("https://wordpress.org/documentation/article/trackbacks-and-pingbacks/"),
		openInNewTab: true,
		children: (0, import_i18n.__)("Learn more about pingbacks & trackbacks")
	}),
	getValue: ({ item }) => (item.ping_status ?? "open") === "open",
	setValue: ({ value }) => ({ ping_status: value ? "open" : "closed" }),
	render: ({ item, field }) => field.getValue({ item }) ? (0, import_i18n.__)("Allow") : (0, import_i18n.__)("Don't allow")
};

// \0wp-global:@wordpress/wordcount
var require_wordcount = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.wordcount;
}));

// packages/core-fields/build-module/post_type_supports/post_content_info/view.mjs
var import_wordcount = require_wordcount();
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
registerStyle$3("10a6398b74", "._4420b4e87ce18b2a__text{color:var(--wpds-color-foreground-content-neutral-weak,#707070);line-height:1.4}");
var style_module_default$3 = { "text": "_4420b4e87ce18b2a__text" };
const AVERAGE_READING_RATE = 189;
function PostContentInfoView({ item }) {
	let content = "";
	if (typeof item.content === "string") content = item.content;
	else if (typeof item.content === "function") content = item.content(item);
	const wordCountType = (0, import_i18n._x)("words", "Word count type. Do not translate!");
	const wordsCounted = (0, import_element.useMemo)(() => content ? (0, import_wordcount.count)(content, wordCountType) : 0, [content, wordCountType]);
	const modified = item.modified;
	if (!wordsCounted && !modified) return null;
	let contentInfoText;
	if (wordsCounted) {
		const readingTime = Math.round(wordsCounted / AVERAGE_READING_RATE);
		const wordsCountText = (0, import_i18n.sprintf)((0, import_i18n._n)("%s word", "%s words", wordsCounted), wordsCounted.toLocaleString());
		const minutesText = readingTime <= 1 ? (0, import_i18n.__)("1 minute") : (0, import_i18n.sprintf)((0, import_i18n._n)("%s minute", "%s minutes", readingTime), readingTime.toLocaleString());
		contentInfoText = (0, import_i18n.sprintf)((0, import_i18n.__)("%1$s, %2$s read time."), wordsCountText, minutesText);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: "column",
		gap: "xs",
		children: [contentInfoText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
			className: style_module_default$3.text,
			children: contentInfoText
		}), modified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
			className: style_module_default$3.text,
			children: (0, import_i18n.sprintf)((0, import_i18n.__)("Last edited %s."), (0, import_date.humanTimeDiff)(modified))
		})]
	});
}

// packages/core-fields/build-module/post_type_supports/post_content_info/field.mjs
/**
* The JavaScript parts of the content information field; its data is in
* `field.php`.
*/
const fieldExtensions$7 = { render: PostContentInfoView };

// packages/core-fields/build-module/post_type_supports/publish_date/get-publish-date-label.mjs
/**
* The full publish date with the site's timezone, e.g. "November 5, 2026
* 9:24 am UTC+0".
*
* @param dateAttribute The post date.
* @return The full label.
*/
function getFullPublishDateLabel(dateAttribute) {
	const date = (0, import_date.getDate)(dateAttribute);
	const timezoneAbbreviation = getTimezoneAbbreviation();
	const formattedDate = (0, import_date.dateI18n)((0, import_i18n._x)("F j, Y g:i\xA0a", "post schedule full date format"), date);
	return (0, import_i18n.isRTL)() ? `${timezoneAbbreviation} ${formattedDate}` : `${formattedDate} ${timezoneAbbreviation}`;
}
/**
* The publish date in words, the first that applies:
*
* 1. "Immediately", for a reset or floating date;
* 2. the full date with the site's timezone, when the user's timezone differs
*    from the site's, as "today" or "tomorrow" would be ambiguous;
* 3. "Today at 9:24 am";
* 4. "Tomorrow at 9:24 am";
* 5. "November 12 9:24 am", within the current year;
* 6. "November 12, 2027 9:24 am", otherwise.
*
* @param dateAttribute      The post date.
* @param options            Options.
* @param options.isFloating Whether the date floats, see isDateFloating().
* @param options.now        The current date, for tests.
* @return The label.
*/
function getPublishDateLabel(dateAttribute, { isFloating = false, now = /* @__PURE__ */ new Date() } = {}) {
	if (!dateAttribute || isFloating) return (0, import_i18n.__)("Immediately");
	if (!isTimezoneSameAsSiteTimezone(now)) return getFullPublishDateLabel(dateAttribute);
	const date = (0, import_date.getDate)(dateAttribute);
	if (isSameDay(date, now)) return (0, import_i18n.sprintf)((0, import_i18n.__)("Today at %s"), (0, import_date.dateI18n)((0, import_i18n._x)("g:i\xA0a", "post schedule time format"), date));
	const tomorrow = new Date(now);
	tomorrow.setDate(tomorrow.getDate() + 1);
	if (isSameDay(date, tomorrow)) return (0, import_i18n.sprintf)((0, import_i18n.__)("Tomorrow at %s"), (0, import_date.dateI18n)((0, import_i18n._x)("g:i\xA0a", "post schedule time format"), date));
	if (date.getFullYear() === now.getFullYear()) return (0, import_date.dateI18n)((0, import_i18n._x)("F j g:i\xA0a", "post schedule date format without year"), date);
	return (0, import_date.dateI18n)((0, import_i18n._x)("F j, Y g:i\xA0a", "post schedule full date format"), date);
}
function getTimezoneAbbreviation() {
	const { timezone } = (0, import_date.getSettings)();
	if (timezone.abbr && isNaN(Number(timezone.abbr))) return timezone.abbr;
	return `UTC${Number(timezone.offset) < 0 ? "" : "+"}${timezone.offsetFormatted}`;
}
function isTimezoneSameAsSiteTimezone(date) {
	const { timezone } = (0, import_date.getSettings)();
	return Number(timezone.offset) === -1 * (date.getTimezoneOffset() / 60);
}
function isSameDay(left, right) {
	return left.getDate() === right.getDate() && left.getMonth() === right.getMonth() && left.getFullYear() === right.getFullYear();
}

// packages/core-fields/build-module/post_type_supports/publish_date/view.mjs
function PublishDateView({ item }) {
	const savedStatus = (0, import_data.useSelect)((select) => {
		if (!item.type || !item.id) return;
		return select(import_core_data.store).getEntityRecord("postType", item.type, item.id)?.status;
	}, [item.type, item.id]);
	if (item.date === void 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: getPublishDateLabel(item.date, { isFloating: isDateFloating({
		...item,
		status: savedStatus ?? item.status
	}) }) });
}

// packages/core-fields/build-module/post_type_supports/publish_date/field.mjs
/**
* The JavaScript parts of the publish date field; its data is in
* `field.php`.
*/
const fieldExtensions$6 = {
	getValue: ({ item }) => item.date,
	render: PublishDateView
};

// packages/core-fields/build-module/post_type_supports/scheduled_date/edit.mjs
function ScheduledDateEdit({ data, field, onChange, hideLabelFromVision }) {
	const value = field.getValue({ item: data }) ?? void 0;
	const savedStatus = (0, import_data.useSelect)((select) => {
		if (!data.type || !data.id) return;
		return select(import_core_data.store).getEntityRecord("postType", data.type, data.id)?.status;
	}, [data.type, data.id]);
	const isFloating = isDateFloating({
		...data,
		status: savedStatus ?? data.status
	});
	const isImmediate = !value || isFloating || isPublishedOnSave(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldsetRoot, {}),
		direction: "column",
		gap: "lg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldsetLegend, {
				hideFromVision: hideLabelFromVision,
				children: field.label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.TimePicker, {
				currentTime: value,
				onChange: (newValue) => onChange(field.setValue({
					item: data,
					value: newValue
				})),
				is12Hour: is12HourTime(),
				dateOrder: (0, import_i18n._x)("dmy", "date order")
			}),
			isImmediate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldsetDescription, { children: (0, import_i18n.__)("Publishes immediately.") })
		]
	});
}

// packages/core-fields/build-module/post_type_supports/scheduled_date/field.mjs
/**
* The JavaScript parts of the scheduled date field; its data is in
* `field.php`.
*/
const fieldExtensions$5 = {
	getValue: ({ item }) => item.date,
	setValue: ({ value }) => ({ date: value ?? null }),
	isVisible: (item) => item.status === "future",
	Edit: ScheduledDateEdit
};

// \0wp-global:@wordpress/notices
var require_notices = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.notices;
}));

// packages/core-fields/build-module/post_type_supports/slug/edit.mjs
var import_notices = require_notices();
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
registerStyle$2("a371ac3abc", "._2a1faa654b533463__slug{border:0;margin:0;padding:0}._2a1faa654b533463__slug input[type=text]{padding-inline-start:0}._7689f6779a3a91ab__help-link{overflow-wrap:anywhere;word-break:normal}._6766b8e7e1a55c53__help{display:flex;flex-direction:column}._951097fb4055794e__help-slug{font-weight:var(--wpds-typography-font-weight-emphasis,600)}");
var style_module_default$2 = {
	"slug": "_2a1faa654b533463__slug",
	"help-link": "_7689f6779a3a91ab__help-link",
	"help": "_6766b8e7e1a55c53__help",
	"help-slug": "_951097fb4055794e__help-slug"
};
const PERMALINK_POSTNAME_REGEX = /%(?:postname|pagename)%/;
const SlugEdit = ({ field, onChange, data }) => {
	const { id } = field;
	const value = field.getValue({ item: data }) ?? "";
	const [forceEmptyField, setForceEmptyField] = (0, import_element.useState)(false);
	const slugOnFocusRef = (0, import_element.useRef)(void 0);
	const slug = forceEmptyField ? "" : value;
	const permalinkTemplate = data.permalink_template || "";
	const [permalinkPrefix, permalinkSuffix] = permalinkTemplate.split(PERMALINK_POSTNAME_REGEX);
	const isEditable = PERMALINK_POSTNAME_REGEX.test(permalinkTemplate) && hasActionLink(data, "wp:action-publish");
	const permalink = isEditable && slug ? `${permalinkPrefix}${slug}${permalinkSuffix}` : (0, import_url.safeDecodeURIComponent)(data.link || "");
	const onChangeControl = (0, import_element.useCallback)((newValue) => {
		onChange({ [id]: newValue });
		setForceEmptyField(!newValue);
	}, [id, onChange]);
	const { createNotice } = (0, import_data.useDispatch)(import_notices.store);
	const copyButtonRef = (0, import_compose.useCopyToClipboard)(permalink, () => {
		createNotice("info", (0, import_i18n.__)("Copied Permalink to clipboard."), {
			isDismissible: true,
			type: "snackbar"
		});
	});
	const postUrlSlugDescriptionId = "editor-post-url__slug-description-" + (0, import_compose.useInstanceId)(SlugEdit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		className: style_module_default$2.slug,
		children: [isEditable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
			direction: "column",
			gap: "sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
					direction: "column",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						id: postUrlSlugDescriptionId,
						children: (0, import_i18n.__)("Customize the last part of the Permalink.")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						href: "https://wordpress.org/documentation/article/page-post-settings-sidebar/#permalink",
						openInNewTab: true,
						children: (0, import_i18n.__)("Learn more")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputControl, {
					prefix: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputLayout.Slot, { children: "/" }),
					suffix: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputLayout.Slot, {
						padding: "minimal",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
							size: "small",
							icon: copy_small_default,
							ref: copyButtonRef,
							label: (0, import_i18n.__)("Copy")
						})
					}),
					label: (0, import_i18n.__)("Link"),
					hideLabelFromVision: true,
					value: slug,
					autoComplete: "off",
					spellCheck: "false",
					type: "text",
					onValueChange: (newValue) => {
						onChangeControl(newValue);
					},
					onFocus: (event) => {
						slugOnFocusRef.current = event.target.value;
					},
					onBlur: (event) => {
						if (event.target.value !== slugOnFocusRef.current) onChange({ [id]: (0, import_url.cleanForSlug)(event.target.value) });
						setForceEmptyField(false);
					},
					"aria-describedby": postUrlSlugDescriptionId
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: style_module_default$2.help,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: (0, import_i18n.__)("Permalink:") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: style_module_default$2["help-link"],
						href: permalink,
						openInNewTab: true,
						children: slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: permalinkPrefix }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: style_module_default$2["help-slug"],
								children: slug
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: permalinkSuffix })
						] }) : permalink
					})]
				})
			]
		}), !isEditable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			className: style_module_default$2["help-link"],
			href: permalink,
			openInNewTab: true,
			children: permalink
		})]
	});
};

// packages/core-fields/build-module/shared/title/get-item-title.mjs
/**
* The decoded title of an entity, whether the REST API returns it as a string or as `rendered` and
* `raw`.
*
* @param item     The entity.
* @param fallback The title of an entity without one.
* @return The title.
*/
function getItemTitle(item, fallback = (0, import_i18n.__)("(no title)")) {
	let title = "";
	if (typeof item.title === "string") title = (0, import_html_entities.decodeEntities)(item.title);
	else if (item.title && "rendered" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.rendered ?? "");
	else if (item.title && "raw" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.raw ?? "");
	return title || fallback;
}

// packages/core-fields/build-module/post_type_supports/slug/utils.mjs
/**
* The slug of a post: the slug if one is set, otherwise the slug derived from
* the current title, which is what WordPress uses when the post is published.
* Empty for a post with neither.
*
* The server-generated slug isn't used: it comes from the saved title, so it
* lags behind title edits, and for a new post it comes from the `Auto Draft`
* placeholder.
*
* @param item The post.
* @return The slug.
*/
const getSlug = (item) => {
	if (typeof item !== "object") return "";
	return (0, import_url.safeDecodeURIComponent)(item.slug || (0, import_url.cleanForSlug)(getItemTitle(item, "")));
};

// packages/core-fields/build-module/post_type_supports/slug/view.mjs
const SlugView = ({ item }) => {
	return getSlug(item) || (0, import_i18n.__)("None");
};

// packages/core-fields/build-module/post_type_supports/slug/field.mjs
/**
* The JavaScript parts of the slug field; its data is in `field.php`.
*/
const fieldExtensions$4 = {
	getValue: ({ item }) => getSlug(item),
	Edit: SlugEdit,
	render: SlugView,
	isVisible: (item) => !!item.link && !!item.permalink_template
};

// packages/core-fields/build-module/post_type_supports/status/view.mjs
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
registerStyle$1("ea6758c967", ".fa2f4cccf57c112c__icon{align-items:center;block-size:1lh;display:flex;flex-shrink:0;inline-size:var(--wpds-dimension-size-2xs,16px)}.fa2f4cccf57c112c__icon svg{fill:currentColor;margin-inline:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2)}");
var style_module_default$1 = { "icon": "fa2f4cccf57c112c__icon" };
const ICONS = {
	draft: drafts_default,
	future: scheduled_default,
	pending: pending_default,
	private: not_allowed_default,
	publish: published_default,
	trash: trash_default
};
function StatusView({ item, field }) {
	const currentStatus = field.getValue({ item });
	const label = (field.elements?.find(({ value }) => value === currentStatus))?.label || currentStatus;
	const icon = ICONS[currentStatus];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: "row",
		gap: "xs",
		align: "flex-start",
		justify: "flex-start",
		children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: style_module_default$1.icon,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { icon })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
	});
}

// packages/core-fields/build-module/post_type_supports/status/field.mjs
/**
* The JavaScript parts of the status field; its data is in `field.php`.
*/
const fieldExtensions$3 = {
	getValue: ({ item }) => item.status === "auto-draft" ? "draft" : item.status,
	setValue: ({ item, value }) => {
		const edits = { status: value };
		if (item.status === "future" && value !== "future" && item.date && (0, import_date.isInTheFuture)(item.date)) edits.date = null;
		if (value === "private" && item.password) edits.password = "";
		return edits;
	},
	render: StatusView,
	isDisabled: ({ item }) => !hasActionLink(item, "wp:action-publish")
};

// packages/core-fields/build-module/post_type_supports/sticky/field.mjs
/**
* The JavaScript part of the sticky field; its data is in `field.php`.
*/
const fieldExtensions$2 = { isVisible: (item) => hasActionLink(item, "wp:action-sticky") };

// packages/core-fields/build-module/post_type_supports/template/hooks.mjs
/**
* The mode the template field renders in for a post, or null when the post
* cannot be assigned a template: its post type is not viewable, the classic
* theme offers no template for it, or the block theme resolves no template.
*
* @param record The post.
* @return 'block-theme', 'classic', or null.
*/
function useTemplateFieldMode(record) {
	const { type: postType, id: postId } = record;
	const hasAvailableTemplates = Object.keys(record?.available_templates ?? {}).length > 0;
	return (0, import_data.useSelect)((select) => {
		if (!select(import_core_data.store).getPostType(postType)?.viewable) return null;
		if (!select(import_core_data.store).getCurrentTheme()?.is_block_theme) return hasAvailableTemplates ? "classic" : null;
		return (postId ? unlock(select(import_core_data.store)).getTemplateId(postType, postId) : void 0) ? "block-theme" : null;
	}, [
		postType,
		postId,
		hasAvailableTemplates
	]);
}
/**
* Computes the template slug to look up in the template hierarchy.
*
* In `draft` status we might not have a slug available, so we use the
* `single` post type template slug (e.g. page, single-post,
* single-product, etc.). Pages do not need the `single` prefix to be
* prioritised through template hierarchy.
*
* @param postType The post type.
* @param slug     The post slug.
*/
function getTemplateSlugToCheck(postType, slug) {
	if (slug) return postType === "page" ? `${postType}-${slug}` : `single-${postType}-${slug}`;
	return postType === "page" ? "page" : `single-${postType}`;
}
const NAME_NOT_FOUND = "";
/**
* The human-readable label of the default template that would apply to a
* post, given its type, id, and slug.
*
* @param postType The post type.
* @param postId   The post id.
* @param slug     The post slug.
*/
function useDefaultTemplateLabel(postType, postId, slug) {
	return (0, import_data.useSelect)((select) => {
		if (!postType || !postId) return NAME_NOT_FOUND;
		const postIdStr = String(postId);
		const homePage = unlock(select(import_core_data.store)).getHomePage();
		if (postType === "page" && homePage?.postType === "page" && homePage?.postId === postIdStr) {
			const frontPage = select(import_core_data.store).getEntityRecords("postType", "wp_template", { per_page: -1 })?.find((t) => t.slug === "front-page");
			if (frontPage) return getItemTitle(frontPage);
		}
		const postsPageId = unlock(select(import_core_data.store)).getPostsPageId();
		if (postType === "page" && postsPageId === postIdStr) {
			const templateId = select(import_core_data.store).getDefaultTemplateId({ slug: "home" });
			if (!templateId) return NAME_NOT_FOUND;
			const template = select(import_core_data.store).getEntityRecord("postType", "wp_template", templateId);
			return template ? getItemTitle(template) : NAME_NOT_FOUND;
		}
		const slugToCheck = getTemplateSlugToCheck(postType, slug);
		const templateId = select(import_core_data.store).getDefaultTemplateId({ slug: slugToCheck });
		if (!templateId) return NAME_NOT_FOUND;
		const template = select(import_core_data.store).getEntityRecord("postType", "wp_template", templateId);
		return template ? getItemTitle(template) : NAME_NOT_FOUND;
	}, [
		postType,
		postId,
		slug
	]);
}

// packages/core-fields/build-module/post_type_supports/template/edit.mjs
const EMPTY_ARRAY = [];
const DEFAULT_TEMPLATE_VALUE = "//default";
function toItemValue(template) {
	return template || DEFAULT_TEMPLATE_VALUE;
}
function fromItemValue(itemValue) {
	return !itemValue || itemValue === DEFAULT_TEMPLATE_VALUE ? "" : itemValue;
}
/**
* Whether the post is the front page or the posts page, which are assigned
* a template by the reading settings rather than by this field.
*
* @param postType The post type.
* @param postId   The post id.
* @return Whether the template can be switched.
*/
function useCanSwitchTemplate(postType, postId) {
	return (0, import_data.useSelect)((select) => {
		const { getHomePage, getPostsPageId } = unlock(select(import_core_data.store));
		const singlePostId = String(postId);
		const isPostsPage = getPostsPageId() === singlePostId;
		const isFrontPage = postType === "page" && getHomePage()?.postId === singlePostId;
		return !isPostsPage && !isFrontPage;
	}, [postId, postType]);
}
function ClassicTemplateEdit({ data, field, onChange }) {
	const value = field.getValue({ item: data });
	const items = (0, import_element.useMemo)(() => Object.entries(data?.available_templates ?? {}).map(([templateSlug, title]) => ({
		label: title,
		value: toItemValue(templateSlug)
	})), [data]);
	const canSwitchTemplate = useCanSwitchTemplate(data.type, data.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectControl, {
		label: (0, import_i18n.__)("Template"),
		hideLabelFromVision: true,
		value: items.find((item) => item.value === toItemValue(value)) ?? items[0] ?? null,
		items,
		onValueChange: (item) => onChange(fromItemValue(item?.value)),
		disabled: !canSwitchTemplate
	});
}
function BlockThemeTemplateEdit({ data, field, onChange }) {
	const postType = data.type;
	const postId = data.id;
	const slug = data.slug;
	const templates = (0, import_data.useSelect)((select) => select(import_core_data.store).getEntityRecords("postType", "wp_template", {
		per_page: -1,
		post_type: postType
	}) ?? EMPTY_ARRAY, [postType]);
	const canSwitchTemplate = useCanSwitchTemplate(postType, postId);
	const defaultTemplateLabel = useDefaultTemplateLabel(postType, postId, slug);
	const value = field.getValue({ item: data });
	const items = (0, import_element.useMemo)(() => [{
		label: defaultTemplateLabel,
		value: DEFAULT_TEMPLATE_VALUE
	}, ...templates.map((template) => ({
		label: getItemTitle(template),
		value: template.slug
	}))], [templates, defaultTemplateLabel]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectControl, {
		label: (0, import_i18n.__)("Template"),
		hideLabelFromVision: true,
		value: items.find((item) => item.value === toItemValue(value)) ?? items[0] ?? null,
		items,
		onValueChange: (item) => onChange(fromItemValue(item?.value)),
		disabled: !canSwitchTemplate
	});
}
function TemplateEdit({ data, field, onChange }) {
	const onChangeControl = (0, import_element.useCallback)((newValue) => onChange({ [field.id]: newValue }), [field.id, onChange]);
	const mode = useTemplateFieldMode(data);
	if (!mode) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(mode === "classic" ? ClassicTemplateEdit : BlockThemeTemplateEdit, {
		data,
		field,
		onChange: onChangeControl
	});
}

// packages/core-fields/build-module/post_type_supports/template/view.mjs
function ClassicTemplateView({ item, field }) {
	const templateSlug = field.getValue({ item });
	const availableTemplates = item?.available_templates ?? {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: templateSlug && availableTemplates[templateSlug] ? availableTemplates[templateSlug] : (0, import_i18n.__)("Default template") });
}
function BlockThemeTemplateView({ item, field }) {
	const postType = item.type;
	const slug = item.slug;
	const postId = item.id;
	const templateSlug = field.getValue({ item });
	const defaultTemplateLabel = useDefaultTemplateLabel(postType, postId, slug);
	const templateLabel = (0, import_data.useSelect)((select) => {
		if (!templateSlug) return;
		const match = select(import_core_data.store).getEntityRecords("postType", "wp_template", {
			per_page: -1,
			post_type: postType
		})?.find((t) => t.slug === templateSlug);
		return match ? getItemTitle(match) : void 0;
	}, [postType, templateSlug]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: templateLabel ?? defaultTemplateLabel });
}
function TemplateView({ item, field }) {
	const mode = useTemplateFieldMode(item);
	if (!mode) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(mode === "classic" ? ClassicTemplateView : BlockThemeTemplateView, {
		item,
		field
	});
}

// packages/core-fields/build-module/post_type_supports/template/field.mjs
/**
* The JavaScript parts of the template field; its data is in `field.php`.
*/
const fieldExtensions$1 = {
	Edit: TemplateEdit,
	render: TemplateView
};

// packages/core-fields/build-module/shared/title/view.mjs
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
registerStyle("a4585ee5f7", "._6f88745c59f7b1df__title>span:first-child{display:block;flex-grow:0;overflow:hidden;text-decoration:none;text-overflow:ellipsis;white-space:nowrap}.bfcb43aba334e5f0__pattern-title>span:first-child{flex:1}");
var style_module_default = {
	"title": "_6f88745c59f7b1df__title",
	"pattern-title": "bfcb43aba334e5f0__pattern-title"
};
function BaseTitleView({ item, className, children }) {
	const renderedTitle = getItemTitle(item);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: "row",
		align: "center",
		justify: "flex-start",
		gap: "sm",
		className: clsx("fields-field__title", style_module_default.title, className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: renderedTitle || (0, import_i18n.__)("(no title)") }), children]
	});
}
function TitleView({ item }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BaseTitleView, { item });
}

// packages/core-fields/build-module/post_type_supports/title/field.mjs
/**
* The JavaScript parts of the title field; its data is in `field.php`.
*/
const fieldExtensions = {
	getValue: ({ item }) => getItemTitle(item),
	render: TitleView
};

// packages/core-fields/build-module/post_type_supports/index.mjs
const fields = {
	author: fieldExtensions$16,
	date: fieldExtensions$15,
	discussion: fieldExtensions$14,
	excerpt: fieldExtensions$13,
	featured_media: fieldExtensions$12,
	last_edited_date: fieldExtensions$11,
	parent: fieldExtensions$10,
	password: fieldExtensions$9,
	ping_status: fieldExtensions$8,
	"post-content-info": fieldExtensions$7,
	publish_date: fieldExtensions$6,
	scheduled_date: fieldExtensions$5,
	slug: fieldExtensions$4,
	status: fieldExtensions$3,
	sticky: fieldExtensions$2,
	template: fieldExtensions$1,
	title: fieldExtensions
};

export { fields as default };
//# sourceMappingURL=post_type_supports.js.map