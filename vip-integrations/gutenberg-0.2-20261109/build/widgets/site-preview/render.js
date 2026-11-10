import { speak } from "@wordpress/a11y";
import { useWidgetIdentity } from "@wordpress/widget-primitives";

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

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/primitives
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.primitives;
}));

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/icons/build-module/library/wordpress.mjs
var import_primitives = require_primitives();
var import_jsx_runtime = require_jsx_runtime();
var wordpress_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	fill: "currentColor",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M 22 12 C 22 6.49 17.51 2 12 2 C 6.48 2 2 6.49 2 12 C 2 17.52 6.48 22 12 22 C 17.51 22 22 17.52 22 12 M 9.78 17.37 L 6.37 8.22 C 6.92 8.2 7.54 8.14 7.54 8.14 C 8.04 8.08 7.98 7.01 7.48 7.03 C 7.48 7.03 6.03 7.14 5.11 7.14 C 4.93 7.14 4.74 7.14 4.53 7.13 C 6.12 4.69 8.87 3.11 12 3.11 C 14.33 3.11 16.45 3.98 18.05 5.45 C 17.37 5.34 16.4 5.84 16.4 7.03 C 16.4 7.77 16.85 8.39 17.3 9.13 C 17.65 9.74 17.85 10.49 17.85 11.59 C 17.85 13.08 16.45 16.59 16.45 16.59 L 13.42 8.22 C 13.96 8.2 14.24 8.05 14.24 8.05 C 14.74 8 14.68 6.8 14.18 6.83 C 14.18 6.83 12.74 6.95 11.8 6.95 C 10.93 6.95 9.47 6.83 9.47 6.83 C 8.97 6.8 8.91 8.03 9.41 8.05 L 10.33 8.13 L 11.59 11.54 L 9.78 17.37 M 19.41 12 C 19.65 11.36 20.15 10.13 19.84 7.75 C 20.54 9.04 20.89 10.46 20.89 12 C 20.89 15.29 19.16 18.24 16.49 19.78 C 17.46 17.19 18.43 14.58 19.41 12 M 8.1 20.09 C 5.12 18.65 3.11 15.53 3.11 12 C 3.11 10.7 3.34 9.52 3.83 8.41 C 5.25 12.3 6.67 16.2 8.1 20.09 M 12.13 13.46 L 14.71 20.44 C 13.85 20.73 12.95 20.89 12 20.89 C 11.21 20.89 10.43 20.78 9.71 20.56 C 10.52 18.18 11.33 15.82 12.13 13.46 L 12.13 13.46" })
});

// \0wp-global:@wordpress/url
var require_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.url;
}));

// \0wp-global:@wordpress/components
var require_components = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.components;
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

// packages/ui/build-module/icon/icon.mjs
var import_element = require_element();
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

// node_modules/.store/@floating-ui/utils@0.2.12-gOxTzMf36nCrbeHpEew-rw/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
	return typeof window !== "undefined";
}
function getWindow(node) {
	var _node$ownerDocument;
	return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function isHTMLElement(value) {
	if (!hasWindow()) return false;
	return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/button/Button.mjs
/**
* A button component that can be used to trigger actions.
* Renders a `<button>` element.
*
* Documentation: [Base UI Button](https://base-ui.com/react/components/button)
*/
const Button$1 = /*#__PURE__*/ import__wp_global_react.forwardRef(function Button(componentProps, forwardedRef) {
	const { render, className, disabled = false, focusableWhenDisabled = false, nativeButton = true, style, ...elementProps } = componentProps;
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		focusableWhenDisabled,
		native: nativeButton
	});
	return useRenderElement("button", componentProps, {
		state: { disabled },
		ref: [forwardedRef, buttonRef],
		props: [elementProps, getButtonProps]
	});
});
Button$1.displayName = "Button";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/use-render/useRender.mjs
/**
* Renders a Base UI element.
*
* @public
*/
function useRender(params) {
	return useRenderElement(params.defaultTagName ?? "div", params, params);
}

// packages/ui/build-module/spinner/spinner.mjs
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
registerStyle$5("b081213352", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.da418dc15e63be57__spinner{background-color:transparent;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:inline-block;height:var(--wpds-dimension-size-2xs,16px);opacity:1;overflow:visible;position:relative;width:var(--wpds-dimension-size-2xs,16px)}._8b83deccaefa3c92__indicator{fill:transparent;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;transform-origin:50% 50%;@media (forced-colors:active){stroke:CanvasText}animation:_0da63cf2c7b08803__spinner-spin 1.4s linear infinite both}@keyframes _0da63cf2c7b08803__spinner-spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}}}");
var style_module_default$5 = {
	"spinner": "da418dc15e63be57__spinner",
	"indicator": "_8b83deccaefa3c92__indicator",
	"spinner-spin": "_0da63cf2c7b08803__spinner-spin"
};
/**
* A component used to notify users that their action is being processed.
*/
const Spinner = (0, import_element.forwardRef)(function UnforwardedSpinner({ className, color, style, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className: clsx(style_module_default$5.spinner, className),
		style: color === void 0 ? style : {
			...style,
			color
		},
		viewBox: "0 0 24 24",
		xmlns: "http://www.w3.org/2000/svg",
		role: "presentation",
		focusable: "false",
		...props,
		ref,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			className: style_module_default$5.indicator,
			d: "m 12 0 a 12 12 0 0 1 0 24"
		})
	});
});

// packages/ui/build-module/button/button.mjs
var import_i18n = require_i18n();
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
registerStyle$4("5213e69d1b", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._0065622adacf164b__is-unstyled,.da200133bf43fd5b__button{appearance:none;padding:0}.da200133bf43fd5b__button{--wp-ui-button-font-weight:var(--wpds-typography-font-weight-emphasis,600);--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-strong,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand-strong,#fff);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-strong-disabled,#8d8d8d);--wp-ui-button-padding-block:var(--wpds-dimension-padding-xs,4px);--wp-ui-button-padding-inline:var(--wpds-dimension-padding-md,12px);--wp-ui-button-height:var(--wpds-dimension-size-lg,40px);--wp-ui-button-aspect-ratio:auto;--wp-ui-button-font-size:var(--wpds-typography-font-size-md,13px);--wp-ui-button-min-width:calc(4ch + var(--wp-ui-button-padding-inline)*2);--wp-ui-button-icon-margin:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2);--wp-ui-button-border-color:var(--wp-ui-button-background-color);--wp-ui-button-border-color-active:var(--wp-ui-button-background-color-active);--wp-ui-button-border-color-disabled:var(--wp-ui-button-background-color-disabled);--_gcd-button-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_gcd-button-font-size:var(--wp-ui-button-font-size);--_gcd-button-font-weight:var(--wp-ui-button-font-weight);align-items:center;aspect-ratio:var(--wp-ui-button-aspect-ratio);background-clip:border-box;background-color:var(--wp-ui-button-background-color);border-color:var(--wp-ui-button-border-color);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:1px;color:var(--wp-ui-button-foreground-color);display:inline-flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wp-ui-button-font-size);font-weight:var(--wp-ui-button-font-weight);gap:var(--wpds-dimension-gap-sm,8px);justify-content:center;line-height:var(--wpds-typography-line-height-sm,20px);max-width:100%;min-height:var(--wp-ui-button-height);min-width:var(--wp-ui-button-min-width);overflow-wrap:anywhere;padding-block:var(--wp-ui-button-padding-block);padding-inline:var(--wp-ui-button-padding-inline);position:relative;text-align:center;text-decoration:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}@media not (prefers-reduced-motion){transition:color .1s ease-out;*{transition:opacity .1s ease-out}}&[href]{cursor:pointer}[href]{color:inherit;text-decoration:inherit}&:not([data-disabled]):is(:hover,:active,:focus){background-color:var(--wp-ui-button-background-color-active);border-color:var(--wp-ui-button-border-color-active);color:var(--wp-ui-button-foreground-color-active)}&[data-disabled]:not(.ae4e86385fc09ecb__is-loading){background-color:var(--wp-ui-button-background-color-disabled);border-color:var(--wp-ui-button-border-color-disabled);color:var(--wp-ui-button-foreground-color-disabled);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText;color:GrayText}}}._1cca9af13b50959b__is-small{--wp-ui-button-padding-block:0px;--wp-ui-button-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-button-height:var(--wpds-dimension-size-sm,24px)}._320003790ac7a216__icon{flex-shrink:0;margin:var(--wp-ui-button-icon-margin)}.eda8df1bde0ae086__is-brand{&._3bda8905a262d2ef__is-minimal,&._70a943b10bcba04a__is-outline{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-disabled,#8d8d8d)}&._70a943b10bcba04a__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 85%,#000));--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-brand-disabled,#dbdbdb)}&._3bda8905a262d2ef__is-minimal{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000)}}.f708f8ed51243739__is-neutral{&._0e80760ce7e45532__is-solid,&._3bda8905a262d2ef__is-minimal[aria-pressed=true]{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-strong,#2d2d2d);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-strong-active,#1e1e1e);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral-strong,#f0f0f0);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-strong-active,#f0f0f0);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-strong-disabled,#8d8d8d)}&._3bda8905a262d2ef__is-minimal:not([aria-pressed=true]),&._70a943b10bcba04a__is-outline{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}&._70a943b10bcba04a__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e);--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb)}&._3bda8905a262d2ef__is-minimal:not([aria-pressed=true]){--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000)}&._3bda8905a262d2ef__is-minimal[aria-pressed=true]:not(.ae4e86385fc09ecb__is-loading){@media (forced-colors:active){background-color:SelectedItem;border-bottom-color:ButtonBorder;border-left-color:ButtonBorder;border-right-color:ButtonBorder;border-top-color:ButtonBorder;color:SelectedItemText;forced-color-adjust:none;outline-color:CanvasText;&[data-disabled]{background-color:GrayText;border-color:GrayText;color:Canvas}}}}._0065622adacf164b__is-unstyled{background:none;border:none;min-width:unset}._4ba48af8eff8f26b__is-compact{--wp-ui-button-height:var(--wpds-dimension-size-md,32px)}.ae4e86385fc09ecb__is-loading:not(._0065622adacf164b__is-unstyled){color:transparent;&:not([data-disabled]):is(:hover,:active,:focus){color:transparent}@media (forced-colors:active){color:ButtonFace}>:not(.fb9402966b19ed5d__spinner){opacity:0}}}@layer compositions{.fb9402966b19ed5d__spinner{color:var(--wp-ui-button-foreground-color);height:var(--wp-ui-button-font-size);inset:0;margin:auto;pointer-events:none;position:absolute;width:var(--wp-ui-button-font-size);>*{stroke-width:2.75}@media (prefers-reduced-motion){>*{animation:none}}@media (forced-colors:active){>*{stroke:ButtonText}}}}}");
var style_module_default$4 = {
	"button": "da200133bf43fd5b__button",
	"is-unstyled": "_0065622adacf164b__is-unstyled",
	"is-loading": "ae4e86385fc09ecb__is-loading",
	"is-small": "_1cca9af13b50959b__is-small",
	"icon": "_320003790ac7a216__icon",
	"is-brand": "eda8df1bde0ae086__is-brand",
	"is-outline": "_70a943b10bcba04a__is-outline",
	"is-minimal": "_3bda8905a262d2ef__is-minimal",
	"is-neutral": "f708f8ed51243739__is-neutral",
	"is-solid": "_0e80760ce7e45532__is-solid",
	"is-compact": "_4ba48af8eff8f26b__is-compact",
	"spinner": "fb9402966b19ed5d__spinner"
};
registerStyle$4("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$4("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
var focus_module_default = {
	"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
	"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
	"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
	"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
	"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
};
registerStyle$4("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
* A versatile button component with multiple variants, tones, and sizes.
*
* See the [Usage Guidelines](https://wordpress.github.io/gutenberg/?path=/docs/design-system-components-button-usage-guidelines--docs)
* for when to use `Button`, `IconButton`, `Link`, or `ButtonLink`.
*/
const Button$2 = (0, import_element.forwardRef)(function UnforwardedButton({ tone = "brand", variant = "solid", size = "default", className, focusableWhenDisabled = true, disabled, loading, loadingAnnouncement = (0, import_i18n.__)("Loading"), children, ...props }, ref) {
	const mergedClassName = clsx(global_css_defense_module_default$1.button, resets_module_default["box-sizing"], focus_module_default["outset-ring--focus-except-active"], variant !== "unstyled" && style_module_default$4.button, style_module_default$4[`is-${tone}`], style_module_default$4[`is-${variant}`], style_module_default$4[`is-${size}`], loading && style_module_default$4["is-loading"], className);
	(0, import_element.useEffect)(() => {
		if (loading && loadingAnnouncement) speak(loadingAnnouncement);
	}, [loading, loadingAnnouncement]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button$1, {
		ref,
		className: mergedClassName,
		focusableWhenDisabled,
		disabled: disabled ?? loading,
		...props,
		children: [children, loading && variant !== "unstyled" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, { className: style_module_default$4.spinner })]
	});
});

// packages/ui/build-module/button/icon.mjs
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
registerStyle$3("5213e69d1b", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._0065622adacf164b__is-unstyled,.da200133bf43fd5b__button{appearance:none;padding:0}.da200133bf43fd5b__button{--wp-ui-button-font-weight:var(--wpds-typography-font-weight-emphasis,600);--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-strong,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand-strong,#fff);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-strong-disabled,#8d8d8d);--wp-ui-button-padding-block:var(--wpds-dimension-padding-xs,4px);--wp-ui-button-padding-inline:var(--wpds-dimension-padding-md,12px);--wp-ui-button-height:var(--wpds-dimension-size-lg,40px);--wp-ui-button-aspect-ratio:auto;--wp-ui-button-font-size:var(--wpds-typography-font-size-md,13px);--wp-ui-button-min-width:calc(4ch + var(--wp-ui-button-padding-inline)*2);--wp-ui-button-icon-margin:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2);--wp-ui-button-border-color:var(--wp-ui-button-background-color);--wp-ui-button-border-color-active:var(--wp-ui-button-background-color-active);--wp-ui-button-border-color-disabled:var(--wp-ui-button-background-color-disabled);--_gcd-button-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_gcd-button-font-size:var(--wp-ui-button-font-size);--_gcd-button-font-weight:var(--wp-ui-button-font-weight);align-items:center;aspect-ratio:var(--wp-ui-button-aspect-ratio);background-clip:border-box;background-color:var(--wp-ui-button-background-color);border-color:var(--wp-ui-button-border-color);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:1px;color:var(--wp-ui-button-foreground-color);display:inline-flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wp-ui-button-font-size);font-weight:var(--wp-ui-button-font-weight);gap:var(--wpds-dimension-gap-sm,8px);justify-content:center;line-height:var(--wpds-typography-line-height-sm,20px);max-width:100%;min-height:var(--wp-ui-button-height);min-width:var(--wp-ui-button-min-width);overflow-wrap:anywhere;padding-block:var(--wp-ui-button-padding-block);padding-inline:var(--wp-ui-button-padding-inline);position:relative;text-align:center;text-decoration:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}@media not (prefers-reduced-motion){transition:color .1s ease-out;*{transition:opacity .1s ease-out}}&[href]{cursor:pointer}[href]{color:inherit;text-decoration:inherit}&:not([data-disabled]):is(:hover,:active,:focus){background-color:var(--wp-ui-button-background-color-active);border-color:var(--wp-ui-button-border-color-active);color:var(--wp-ui-button-foreground-color-active)}&[data-disabled]:not(.ae4e86385fc09ecb__is-loading){background-color:var(--wp-ui-button-background-color-disabled);border-color:var(--wp-ui-button-border-color-disabled);color:var(--wp-ui-button-foreground-color-disabled);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText;color:GrayText}}}._1cca9af13b50959b__is-small{--wp-ui-button-padding-block:0px;--wp-ui-button-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-button-height:var(--wpds-dimension-size-sm,24px)}._320003790ac7a216__icon{flex-shrink:0;margin:var(--wp-ui-button-icon-margin)}.eda8df1bde0ae086__is-brand{&._3bda8905a262d2ef__is-minimal,&._70a943b10bcba04a__is-outline{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-disabled,#8d8d8d)}&._70a943b10bcba04a__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 85%,#000));--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-brand-disabled,#dbdbdb)}&._3bda8905a262d2ef__is-minimal{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000)}}.f708f8ed51243739__is-neutral{&._0e80760ce7e45532__is-solid,&._3bda8905a262d2ef__is-minimal[aria-pressed=true]{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-strong,#2d2d2d);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-strong-active,#1e1e1e);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral-strong,#f0f0f0);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-strong-active,#f0f0f0);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-strong-disabled,#8d8d8d)}&._3bda8905a262d2ef__is-minimal:not([aria-pressed=true]),&._70a943b10bcba04a__is-outline{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}&._70a943b10bcba04a__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e);--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb)}&._3bda8905a262d2ef__is-minimal:not([aria-pressed=true]){--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000)}&._3bda8905a262d2ef__is-minimal[aria-pressed=true]:not(.ae4e86385fc09ecb__is-loading){@media (forced-colors:active){background-color:SelectedItem;border-bottom-color:ButtonBorder;border-left-color:ButtonBorder;border-right-color:ButtonBorder;border-top-color:ButtonBorder;color:SelectedItemText;forced-color-adjust:none;outline-color:CanvasText;&[data-disabled]{background-color:GrayText;border-color:GrayText;color:Canvas}}}}._0065622adacf164b__is-unstyled{background:none;border:none;min-width:unset}._4ba48af8eff8f26b__is-compact{--wp-ui-button-height:var(--wpds-dimension-size-md,32px)}.ae4e86385fc09ecb__is-loading:not(._0065622adacf164b__is-unstyled){color:transparent;&:not([data-disabled]):is(:hover,:active,:focus){color:transparent}@media (forced-colors:active){color:ButtonFace}>:not(.fb9402966b19ed5d__spinner){opacity:0}}}@layer compositions{.fb9402966b19ed5d__spinner{color:var(--wp-ui-button-foreground-color);height:var(--wp-ui-button-font-size);inset:0;margin:auto;pointer-events:none;position:absolute;width:var(--wp-ui-button-font-size);>*{stroke-width:2.75}@media (prefers-reduced-motion){>*{animation:none}}@media (forced-colors:active){>*{stroke:ButtonText}}}}}");
var style_module_default$3 = {
	"button": "da200133bf43fd5b__button",
	"is-unstyled": "_0065622adacf164b__is-unstyled",
	"is-loading": "ae4e86385fc09ecb__is-loading",
	"is-small": "_1cca9af13b50959b__is-small",
	"icon": "_320003790ac7a216__icon",
	"is-brand": "eda8df1bde0ae086__is-brand",
	"is-outline": "_70a943b10bcba04a__is-outline",
	"is-minimal": "_3bda8905a262d2ef__is-minimal",
	"is-neutral": "f708f8ed51243739__is-neutral",
	"is-solid": "_0e80760ce7e45532__is-solid",
	"is-compact": "_4ba48af8eff8f26b__is-compact",
	"spinner": "fb9402966b19ed5d__spinner"
};
const ButtonIcon = (0, import_element.forwardRef)(function UnforwardedButtonIcon({ className, icon, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		ref,
		icon,
		className: clsx(style_module_default$3.icon, className),
		size: 24,
		...props
	});
});

// packages/ui/build-module/button/index.mjs
ButtonIcon.displayName = "Button.Icon";
/**
* A versatile button component with multiple variants, tones, and sizes.
*
* See the [Usage Guidelines](https://wordpress.github.io/gutenberg/?path=/docs/design-system-components-button-usage-guidelines--docs)
* for when to use `Button`, `IconButton`, `Link`, or `ButtonLink`.
*/
const Button = Object.assign(Button$2, { 
/**
* An icon component specifically designed to work well when rendered inside
* a `Button` component.
*/
Icon: ButtonIcon });

// packages/ui/build-module/text/text.mjs
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
registerStyle$2("09bae534ff", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9745ffa515d864cf__text{text-wrap:pretty;margin:0}._8882b6a7feb4fd3d__heading-2xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-p-line-height:var(--wpds-typography-line-height-2xl,40px);font-size:var(--wpds-typography-font-size-2xl,32px);line-height:var(--wpds-typography-line-height-2xl,40px)}._664e3e7687c45603__heading-xl,._8882b6a7feb4fd3d__heading-2xl{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600)}._664e3e7687c45603__heading-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-md,24px)}.dac661a5de0ed2bd__heading-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-lg,15px)}._59c7f3f740e2f96e__heading-md,.dac661a5de0ed2bd__heading-lg{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-sm,20px)}._59c7f3f740e2f96e__heading-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px)}.cf052fbad8d93b7e__heading-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._212b9cfef57a0af4__body-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-xl,32px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-xl,32px)}._07f57bc0aa36b2c6__body-lg,._212b9cfef57a0af4__body-xl{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}._07f57bc0aa36b2c6__body-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-lg,15px);line-height:var(--wpds-typography-line-height-md,24px)}._0c6da4457aec9e62__body-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px)}._0c6da4457aec9e62__body-md,.b998f87ff17b7bec__body-sm{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}.b998f87ff17b7bec__body-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var style_module_default$2 = {
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
registerStyle$2("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
* A text component for rendering content with predefined typographic variants.
* Built on design tokens for consistent typography across the UI.
*/
const Text = (0, import_element.forwardRef)(function UnforwardedText({ variant = "body-md", render, className, ...props }, ref) {
	return useRender({
		render,
		defaultTagName: "span",
		ref,
		props: mergeProps(props, { className: clsx(style_module_default$2.text, global_css_defense_module_default.heading, global_css_defense_module_default.p, style_module_default$2[variant], className) })
	});
});

// packages/ui/build-module/stack/stack.mjs
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
registerStyle$1("67591fa198", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._8e8e79c1a2eec43b__stack{display:flex}}}");
var style_module_default$1 = { "stack": "_8e8e79c1a2eec43b__stack" };
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
			className: style_module_default$1.stack
		})
	});
});

// packages/style-runtime/src/index.ts
var import_data = require_data();
var import_core_data = require_core_data();
var import_url = require_url();
var import_components = require_components();
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

// widgets/site-preview/style.module.css
registerStyle("24427b0b69", ".fe77db41817938cd__container{aspect-ratio:3/4;height:100%;overflow:hidden;width:100%}.c07317a77a640526__url-bar{background:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);border-block-end:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);flex-shrink:0}.a6ae1fb095ea1c5f__url-field,.c07317a77a640526__url-bar{padding:var(--wpds-dimension-padding-xs,4px) var(--wpds-dimension-padding-sm,8px)}.a6ae1fb095ea1c5f__url-field{background:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);border-radius:var(--wpds-border-radius-lg,8px);min-width:0}.f811ea6b7e761208__url-favicon{flex-shrink:0;height:var(--wpds-typography-font-size-xs,11px);object-fit:contain;width:var(--wpds-typography-font-size-xs,11px)}.f0d3cd5c7c0bd4e7__url-icon{color:var(--wpds-color-foreground-content-neutral-weak,#707070);flex-shrink:0}._6e0fc7f2d7323fbd__url-text{color:var(--wpds-color-foreground-content-neutral,#1e1e1e);flex:1;font-size:var(--wpds-typography-font-size-xs,11px);line-height:var(--wpds-typography-line-height-xs,16px);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.d0da93255d362e4c__preview-wrap{flex:1;min-height:0;position:relative}._244e9ab1b712ab43__loading{inset:0;position:absolute;z-index:1}.df2d292dc608ab0c__iframe{inset-block-start:0;inset-inline-start:50%;min-height:375%;position:absolute;transform:translate(-50%) scale(.4);transform-origin:center top;width:250%}._09e0f03f4143a9c4__overlay{backdrop-filter:blur(1px);background:color-mix(in srgb,var(--wpds-color-foreground-content-neutral-weak,#707070) 20%,transparent);inset:0;opacity:0;position:absolute}.d0da93255d362e4c__preview-wrap:focus-within ._09e0f03f4143a9c4__overlay,.d0da93255d362e4c__preview-wrap:hover ._09e0f03f4143a9c4__overlay{opacity:1}@media not (prefers-reduced-motion){._09e0f03f4143a9c4__overlay{transition:opacity var(--wpds-motion-duration-lg,.3s) var(--wpds-motion-easing-expressive,cubic-bezier(.25,0,0,1))}}");
var style_module_default = {
	"container": "fe77db41817938cd__container",
	"url-bar": "c07317a77a640526__url-bar",
	"url-field": "a6ae1fb095ea1c5f__url-field",
	"url-favicon": "f811ea6b7e761208__url-favicon",
	"url-icon": "f0d3cd5c7c0bd4e7__url-icon",
	"url-text": "_6e0fc7f2d7323fbd__url-text",
	"preview-wrap": "d0da93255d362e4c__preview-wrap",
	"loading": "_244e9ab1b712ab43__loading",
	"iframe": "df2d292dc608ab0c__iframe",
	"overlay": "_09e0f03f4143a9c4__overlay"
};

// widgets/site-preview/render.tsx
function PreviewUrlBar({ siteUrl, siteIconUrl }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: style_module_default["url-bar"],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
			direction: "row",
			align: "center",
			gap: "xs",
			className: style_module_default["url-field"],
			children: [siteIconUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: style_module_default["url-favicon"],
				src: siteIconUrl,
				alt: ""
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: style_module_default["url-icon"],
				icon: wordpress_default,
				size: 12
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				className: style_module_default["url-text"],
				children: siteUrl
			})]
		})
	});
}
function SitePreview() {
	const { title } = useWidgetIdentity();
	const [isIframeLoading, setIsIframeLoading] = (0, import_element.useState)(true);
	const [isVisitLoading, setIsVisitLoading] = (0, import_element.useState)(false);
	const [isEditLoading, setIsEditLoading] = (0, import_element.useState)(false);
	const { siteUrl, siteIconUrl } = (0, import_data.useSelect)((select) => {
		const site = select(import_core_data.store).getEntityRecord("root", "site", void 0);
		const base = select(import_core_data.store).getEntityRecord("root", "__unstableBase", void 0);
		return {
			siteUrl: site?.url,
			siteIconUrl: base?.site_icon_url
		};
	}, []);
	const isBlockTheme = (0, import_data.useSelect)((select) => !!select(import_core_data.store).getCurrentTheme()?.is_block_theme, []);
	(0, import_element.useEffect)(() => {
		setIsIframeLoading(true);
	}, [siteUrl]);
	if (!siteUrl) return null;
	const src = (0, import_url.addQueryArgs)(siteUrl, { wp_site_preview: 1 });
	const editUrl = isBlockTheme ? "site-editor.php" : "customize.php";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: "column",
		className: style_module_default.container,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewUrlBar, {
			siteUrl,
			siteIconUrl
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: style_module_default["preview-wrap"],
			children: [
				isIframeLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
					direction: "column",
					align: "center",
					justify: "center",
					className: style_module_default.loading,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					className: style_module_default.iframe,
					loading: "lazy",
					scrolling: "no",
					title: title ?? (0, import_i18n.__)("Site preview"),
					src,
					onLoad: () => setIsIframeLoading(false),
					inert: "true"
				}),
				!isIframeLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
					direction: "row",
					align: "center",
					justify: "center",
					gap: "sm",
					className: style_module_default.overlay,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "solid",
						tone: "neutral",
						loading: isVisitLoading,
						onClick: () => {
							setIsVisitLoading(true);
							window.location.href = siteUrl;
						},
						children: (0, import_i18n.__)("Visit")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "solid",
						tone: "brand",
						loading: isEditLoading,
						onClick: () => {
							setIsEditLoading(true);
							window.location.href = editUrl;
						},
						children: (0, import_i18n.__)("Edit site")
					})]
				})
			]
		})]
	});
}

export { SitePreview as default };