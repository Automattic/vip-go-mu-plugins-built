import { Link, useParams } from "@wordpress/route";
import { useEditorAssets } from "@wordpress/lazy-editor";

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

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

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

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/use-render/useRender.mjs
/**
* Renders a Base UI element.
*
* @public
*/
function useRender(params) {
	return useRenderElement(params.defaultTagName ?? "div", params, params);
}

// \0wp-global:@wordpress/primitives
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.primitives;
}));

// packages/icons/build-module/library/chevron-down.mjs
var import_primitives = require_primitives();
var import_jsx_runtime = require_jsx_runtime();
var chevron_down_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M7 11L12 15L17 11" })
});

// packages/icons/build-module/library/chevron-up.mjs
var chevron_up_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M7 13L12 9L17 13" })
});

// packages/icons/build-module/library/more-vertical.mjs
var more_vertical_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
			d: "M11.75 18.25L12.25 18.25L12.25 17.75L11.75 17.75L11.75 18.25Z",
			fill: "currentColor",
			stroke: "none"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
			d: "M11.75 12.25L12.25 12.25L12.25 11.75L11.75 11.75L11.75 12.25Z",
			fill: "currentColor",
			stroke: "none"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
			d: "M11.75 6.25L12.25 6.25L12.25 5.75L11.75 5.75L11.75 6.25Z",
			fill: "currentColor",
			stroke: "none"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M11.75 18.25L12.25 18.25L12.25 17.75L11.75 17.75L11.75 18.25Z" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M11.75 12.25L12.25 12.25L12.25 11.75L11.75 11.75L11.75 12.25Z" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M11.75 6.25L12.25 6.25L12.25 5.75L11.75 5.75L11.75 6.25Z" })
	]
});

// packages/ui/build-module/text/text.mjs
var import_element = require_element();
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
registerStyle$7("f1111e65b4", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._071bdd99bfd7971d__text{--_gcd-heading-font-size:var(--_wp-ui-text-font-size);--_gcd-heading-font-weight:var(--_wp-ui-text-font-weight);--_gcd-p-font-size:var(--_wp-ui-text-font-size);--_gcd-p-line-height:var(--_wp-ui-text-line-height);text-wrap:pretty;font-family:var(--_wp-ui-text-font-family);font-size:var(--_wp-ui-text-font-size);font-weight:var(--_wp-ui-text-font-weight);line-height:var(--_wp-ui-text-line-height);margin:0}._044639169be0ddc8__heading-2xl{--_wp-ui-text-font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_wp-ui-text-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_wp-ui-text-font-size:var(--wpds-typography-font-size-2xl,32px);--_wp-ui-text-line-height:var(--wpds-typography-line-height-2xl,40px)}._6d09f119bc9d4082__heading-xl{--_wp-ui-text-font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_wp-ui-text-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_wp-ui-text-font-size:var(--wpds-typography-font-size-xl,20px);--_wp-ui-text-line-height:var(--wpds-typography-line-height-md,24px)}._91d66fab1e491589__heading-lg{--_wp-ui-text-font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_wp-ui-text-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_wp-ui-text-font-size:var(--wpds-typography-font-size-lg,15px);--_wp-ui-text-line-height:var(--wpds-typography-line-height-sm,20px)}.fa45095e6c448022__heading-md{--_wp-ui-text-font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_wp-ui-text-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_wp-ui-text-font-size:var(--wpds-typography-font-size-md,13px);--_wp-ui-text-line-height:var(--wpds-typography-line-height-sm,20px)}._8005563893523539__heading-sm{--_wp-ui-text-font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_wp-ui-text-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_wp-ui-text-font-size:var(--wpds-typography-font-size-xs,11px);--_wp-ui-text-line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._304c298de3ee1214__body-xl{--_wp-ui-text-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_wp-ui-text-font-weight:var(--wpds-typography-font-weight-default,400);--_wp-ui-text-font-size:var(--wpds-typography-font-size-xl,20px);--_wp-ui-text-line-height:var(--wpds-typography-line-height-xl,32px)}._739e6a8e329f4d6a__body-lg{--_wp-ui-text-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_wp-ui-text-font-weight:var(--wpds-typography-font-weight-default,400);--_wp-ui-text-font-size:var(--wpds-typography-font-size-lg,15px);--_wp-ui-text-line-height:var(--wpds-typography-line-height-md,24px)}._330441fcf3fa3e88__body-md{--_wp-ui-text-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_wp-ui-text-font-weight:var(--wpds-typography-font-weight-default,400);--_wp-ui-text-font-size:var(--wpds-typography-font-size-md,13px);--_wp-ui-text-line-height:var(--wpds-typography-line-height-sm,20px)}.cf8040c939c453ff__body-sm{--_wp-ui-text-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_wp-ui-text-font-weight:var(--wpds-typography-font-weight-default,400);--_wp-ui-text-font-size:var(--wpds-typography-font-size-sm,12px);--_wp-ui-text-line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var style_module_default$7 = {
	"text": "_071bdd99bfd7971d__text",
	"heading-2xl": "_044639169be0ddc8__heading-2xl",
	"heading-xl": "_6d09f119bc9d4082__heading-xl",
	"heading-lg": "_91d66fab1e491589__heading-lg",
	"heading-md": "fa45095e6c448022__heading-md",
	"heading-sm": "_8005563893523539__heading-sm",
	"body-xl": "_304c298de3ee1214__body-xl",
	"body-lg": "_739e6a8e329f4d6a__body-lg",
	"body-md": "_330441fcf3fa3e88__body-md",
	"body-sm": "cf8040c939c453ff__body-sm"
};
registerStyle$7("0a1cfe0066", ".db1aa0d975c98907__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._560ae5870016ca79__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#6e6e6e))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8b8b8b))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}&:is(input):not([type]){&[readonly]{background-color:var(--_gcd-input-background-color,transparent)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8b8b8b))}}}._7c14c78aca908e56__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}.b752c6b223b319c4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._56028dfe751232df__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._48f5e2ad729cc233__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.fba8c89ccbfb853b__a,.fba8c89ccbfb853b__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._2933712904448f13__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}.c48c21f7371f7cea__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._2348cae4464115af__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default$1 = {
	"button": "db1aa0d975c98907__button",
	"input": "_560ae5870016ca79__input",
	"textarea": "_7c14c78aca908e56__textarea",
	"div": "b752c6b223b319c4__div",
	"p": "_56028dfe751232df__p",
	"heading": "_48f5e2ad729cc233__heading",
	"a": "fba8c89ccbfb853b__a",
	"ol": "_2933712904448f13__ol",
	"li": "c48c21f7371f7cea__li",
	"span": "_2348cae4464115af__span"
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
		props: mergeProps(props, { className: clsx(style_module_default$7.text, global_css_defense_module_default$1.heading, global_css_defense_module_default$1.p, style_module_default$7[variant], className) })
	});
});

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/ui/build-module/link/link.mjs
var import_i18n = require_i18n();
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
registerStyle$6("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$6("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
var focus_module_default = {
	"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
	"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
	"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
	"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
	"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
};
registerStyle$6("af1d110bbb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._37fee74d1dbea108__link{--_gcd-a-border-radius:var(--wpds-border-radius-sm,2px);border-radius:var(--wpds-border-radius-sm,2px);text-decoration-thickness:from-font;text-underline-offset:.2em}._2caa5ab8d301aa35__link-with-icon{text-decoration-line:none}._03f6a10e54c8bf7d__link-contents{text-decoration:inherit;text-decoration-line:underline}._3c28bf5c32a6f83e__is-brand,._3c28bf5c32a6f83e__is-brand:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9))}._3c28bf5c32a6f83e__is-brand:active,._3c28bf5c32a6f83e__is-brand:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000))}.f753b1750f8ddc4a__is-neutral,.f753b1750f8ddc4a__is-neutral:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);text-decoration-color:var(--wpds-color-stroke-interactive-neutral,#8b8b8b)}.f753b1750f8ddc4a__is-neutral:active,.f753b1750f8ddc4a__is-neutral:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e)}._46c7919834b1ac73__is-unstyled{--_gcd-a-border-radius:0;--_gcd-a-color:inherit;color:inherit;text-decoration:none}.ce7e7311b7483d3f__link-icon{font-weight:var(--wpds-typography-font-weight-default,400);line-height:1;margin-inline-start:var(--wpds-dimension-padding-xs,4px);text-decoration:none}.ce7e7311b7483d3f__link-icon:after{content:\"\\2060\\2197\"}.ce7e7311b7483d3f__link-icon:dir(rtl):after{content:\"\\2060\\2196\"}}}");
var style_module_default$6 = {
	"link": "_37fee74d1dbea108__link",
	"link-with-icon": "_2caa5ab8d301aa35__link-with-icon",
	"link-contents": "_03f6a10e54c8bf7d__link-contents",
	"is-brand": "_3c28bf5c32a6f83e__is-brand",
	"is-neutral": "f753b1750f8ddc4a__is-neutral",
	"is-unstyled": "_46c7919834b1ac73__is-unstyled",
	"link-icon": "ce7e7311b7483d3f__link-icon"
};
registerStyle$6("0a1cfe0066", ".db1aa0d975c98907__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._560ae5870016ca79__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#6e6e6e))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8b8b8b))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}&:is(input):not([type]){&[readonly]{background-color:var(--_gcd-input-background-color,transparent)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8b8b8b))}}}._7c14c78aca908e56__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}.b752c6b223b319c4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._56028dfe751232df__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._48f5e2ad729cc233__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.fba8c89ccbfb853b__a,.fba8c89ccbfb853b__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._2933712904448f13__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}.c48c21f7371f7cea__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._2348cae4464115af__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
var global_css_defense_module_default = {
	"button": "db1aa0d975c98907__button",
	"input": "_560ae5870016ca79__input",
	"textarea": "_7c14c78aca908e56__textarea",
	"div": "b752c6b223b319c4__div",
	"p": "_56028dfe751232df__p",
	"heading": "_48f5e2ad729cc233__heading",
	"a": "fba8c89ccbfb853b__a",
	"ol": "_2933712904448f13__ol",
	"li": "c48c21f7371f7cea__li",
	"span": "_2348cae4464115af__span"
};
/**
* A styled anchor element with support for semantic color tones and an
* unstyled escape hatch.
*
* See the [Usage Guidelines](https://wordpress.github.io/gutenberg/?path=/docs/design-system-components-button-usage-guidelines--docs)
* for when to use `Button`, `IconButton`, `Link`, or `ButtonLink`.
*/
const Link$1 = (0, import_element.forwardRef)(function UnforwardedLink({ children, variant = "default", tone = "brand", openInNewTab = false, target, render, className, ...props }, ref) {
	const shouldShowNewTabIndicator = openInNewTab || /^_blank$/i.test(target ?? "");
	return useRender({
		render,
		defaultTagName: "a",
		ref,
		props: mergeProps(props, {
			className: clsx(global_css_defense_module_default.a, resets_module_default["box-sizing"], focus_module_default["outset-ring--focus-except-active"], variant !== "unstyled" && style_module_default$6.link, variant !== "unstyled" && shouldShowNewTabIndicator && style_module_default$6["link-with-icon"], variant !== "unstyled" && style_module_default$6[`is-${tone}`], variant === "unstyled" && style_module_default$6["is-unstyled"], className),
			target: target ?? (openInNewTab ? "_blank" : void 0),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [shouldShowNewTabIndicator && variant !== "unstyled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: style_module_default$6["link-contents"],
				children
			}) : children, shouldShowNewTabIndicator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: style_module_default$6["link-icon"],
				role: "img",
				"aria-label": (0, import_i18n.__)("(opens in a new tab)")
			})] })
		})
	});
});

// packages/ui/build-module/stack/stack.mjs
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
registerStyle$5("67591fa198", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._8e8e79c1a2eec43b__stack{display:flex}}}");
var style_module_default$5 = { "stack": "_8e8e79c1a2eec43b__stack" };
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
			className: style_module_default$5.stack
		})
	});
});

// packages/admin-ui/build-module/breadcrumbs/index.mjs
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
registerStyle$4("ec86bbdb7d", ".b2a63149563107a4__list{list-style:none;margin:0;padding:0}.b2a63149563107a4__list>li{flex-shrink:0;margin:0}.b2a63149563107a4__list>li:last-child{flex-shrink:1;min-width:0}._92025c5301c05bb2__current{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.b4c6b52039b39e54__separator{color:var(--wpds-color-stroke-surface-neutral,#dbdbdb);margin:0 var(--wpds-dimension-gap-sm,8px);user-select:none}");
var style_module_default$4 = {
	"list": "b2a63149563107a4__list",
	"current": "_92025c5301c05bb2__current",
	"separator": "b4c6b52039b39e54__separator"
};
/**
* Renders a breadcrumb navigation trail.
*
* All items except the last one must provide a `to` prop for navigation.
* In development mode, an error is thrown when a non-last item is missing `to`.
* The last item represents the current page and its `to` prop is optional.
* Only the last item (when it has no `to` prop) is rendered as an `h1`.
*
* @param props
* @param props.items The breadcrumb items to display.
*
* @example
* ```jsx
* <Breadcrumbs
*   items={ [
*     { label: 'Home', to: '/' },
*     { label: 'Settings', to: '/settings' },
*     { label: 'General' },
*   ] }
* />
* ```
*/
const Breadcrumbs = ({ items }) => {
	if (!items.length) return null;
	const precedingItems = items.slice(0, -1);
	const lastItem = items[items.length - 1];
	{
		const invalidItem = precedingItems.find((item) => !item.to);
		if (invalidItem) throw new Error(`Breadcrumbs: item "${invalidItem.label}" is missing a \`to\` prop. All items except the last one must have a \`to\` prop.`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": (0, import_i18n._x)("Breadcrumbs", "aria label"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
			render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {}),
			direction: "row",
			align: "center",
			className: style_module_default$4.list,
			children: [precedingItems.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				variant: "body-lg",
				render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					tone: "neutral",
					render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: item.to })
				}),
				children: item.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				variant: "body-lg",
				"aria-hidden": "true",
				className: style_module_default$4.separator,
				children: "/"
			})] }, index)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: lastItem.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				variant: "body-lg",
				render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					tone: "neutral",
					render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: lastItem.to })
				}),
				children: lastItem.label
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				variant: "heading-lg",
				render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {}),
				className: style_module_default$4.current,
				children: lastItem.label
			}) })]
		})
	});
};

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
registerStyle$3("50915012c9", "._7712e691febe28ed__list{--focus-ring-size:calc(var(--wpds-border-width-focus, var(--wp-admin-border-width-focus, 2px))*2);list-style:none;margin:calc(var(--focus-ring-size)*-1);overflow-x:auto;padding:var(--focus-ring-size);scroll-padding:var(--focus-ring-size)}.ccd070cc3f1689cf__li{flex-shrink:0}.e850dabb78bfc419__item{align-items:center;color:var(--wpds-color-foreground-interactive-neutral-weak,#6e6e6e);display:flex;font-weight:var(--wpds-typography-font-weight-default,400);min-block-size:44px;min-inline-size:44px;text-decoration:none}.e850dabb78bfc419__item:hover,.e850dabb78bfc419__item[aria-current=page]{color:var(--wpds-color-foreground-interactive-neutral-weak-active,#1e1e1e)}.e850dabb78bfc419__item[aria-current=page]{font-weight:var(--wpds-typography-font-weight-emphasis,600)}");
var style_module_default$3 = {
	"list": "_7712e691febe28ed__list",
	"li": "ccd070cc3f1689cf__li",
	"item": "e850dabb78bfc419__item"
};
/**
* Renders a horizontal list of links for navigating between the sections of a
* screen. The item whose `href` matches `currentHref` is marked with
* `aria-current="page"`.
*
* Internal to the package: configured through the `Page` `navigation` prop.
*/
const Navigation = ({ items, currentHref, ariaLabel = (0, import_i18n.__)("Sections"), linkComponent, className }) => {
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
			className: style_module_default$3.list,
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: style_module_default$3.li,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					variant: "body-md",
					className: style_module_default$3.item,
					render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
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
registerStyle$2("05dfc7076f", "._52bf6d26b2cc898d__page{text-wrap:pretty;background-color:var(--wpds-color-background-surface-neutral,#fcfcfc);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-flow:column;height:100%;position:relative;z-index:1}._24667cfed9f43255__header{background:var(--wpds-color-background-surface-neutral-strong,#fff);border-block-end:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);inset-block-start:0;padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px);position:sticky;z-index:1}.f92719188634c5d6__header-content{min-height:var(--wpds-dimension-size-md,32px)}._141425854f032b21__header-actions{flex-shrink:0}._4d5abf3b39fc4e47__header-lockup{min-width:0}._939fd173dcd6f7b5__header-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._2ebb2614e76305a3__header-visual{display:grid;flex-shrink:0;grid-template-columns:1fr;grid-template-rows:1fr;height:var(--wpds-dimension-size-sm,24px);width:var(--wpds-dimension-size-sm,24px);>*{grid-column:1/-1;grid-row:1/-1;max-height:100%;max-width:100%}}._3ee1b13e76b21c76__sidebar-toggle-slot:empty{display:none}._3e0a8b957270846f__header-subtitle{color:var(--wpds-color-foreground-content-neutral-weak,#6e6e6e);padding-block-end:var(--wpds-dimension-padding-xs,4px)}._24667cfed9f43255__header.b230252b347a13f0__has-navigation,._24667cfed9f43255__header.b230252b347a13f0__has-navigation ._3e0a8b957270846f__header-subtitle{padding-block-end:0}._08493e4139885090__header-navigation{margin-block-start:var(--wpds-dimension-gap-md,12px)}._164a4cfa881f76f7__content{display:flex;flex-direction:column;flex-grow:1;overflow:auto;&._2859463eef17c76b__has-padding{padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px)}}");
var style_module_default$2 = {
	"page": "_52bf6d26b2cc898d__page",
	"header": "_24667cfed9f43255__header",
	"header-content": "f92719188634c5d6__header-content",
	"header-actions": "_141425854f032b21__header-actions",
	"header-lockup": "_4d5abf3b39fc4e47__header-lockup",
	"header-title": "_939fd173dcd6f7b5__header-title",
	"header-visual": "_2ebb2614e76305a3__header-visual",
	"sidebar-toggle-slot": "_3ee1b13e76b21c76__sidebar-toggle-slot",
	"header-subtitle": "_3e0a8b957270846f__header-subtitle",
	"has-navigation": "b230252b347a13f0__has-navigation",
	"header-navigation": "_08493e4139885090__header-navigation",
	"content": "_164a4cfa881f76f7__content",
	"has-padding": "_2859463eef17c76b__has-padding"
};
function Header({ headingLevel = 1, breadcrumbs, badges, visual, title, subTitle, actions, navigation, components, showSidebarToggle = true }) {
	const HeadingTag = `h${headingLevel}`;
	const hasNavigation = !!navigation?.items?.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: "column",
		className: clsx(style_module_default$2.header, hasNavigation && style_module_default$2["has-navigation"]),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
				className: style_module_default$2["header-content"],
				direction: "row",
				gap: "sm",
				justify: "space-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
					direction: "row",
					gap: "sm",
					align: "center",
					justify: "start",
					className: style_module_default$2["header-lockup"],
					children: [
						showSidebarToggle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarToggleSlot, {
							bubblesVirtually: true,
							className: style_module_default$2["sidebar-toggle-slot"]
						}),
						visual && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: style_module_default$2["header-visual"],
							"aria-hidden": "true",
							children: visual
						}),
						title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
							className: style_module_default$2["header-title"],
							render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadingTag, {}),
							variant: "heading-lg",
							children: title
						}),
						breadcrumbs,
						badges
					]
				}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
					align: "center",
					className: style_module_default$2["header-actions"],
					direction: "row",
					gap: "sm",
					children: actions
				})]
			}),
			subTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {}),
				variant: "body-md",
				className: style_module_default$2["header-subtitle"],
				children: subTitle
			}),
			hasNavigation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
				...navigation,
				linkComponent: components?.link,
				className: style_module_default$2["header-navigation"]
			})
		]
	});
}

// packages/admin-ui/build-module/page/index.mjs
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
registerStyle$1("05dfc7076f", "._52bf6d26b2cc898d__page{text-wrap:pretty;background-color:var(--wpds-color-background-surface-neutral,#fcfcfc);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-flow:column;height:100%;position:relative;z-index:1}._24667cfed9f43255__header{background:var(--wpds-color-background-surface-neutral-strong,#fff);border-block-end:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);inset-block-start:0;padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px);position:sticky;z-index:1}.f92719188634c5d6__header-content{min-height:var(--wpds-dimension-size-md,32px)}._141425854f032b21__header-actions{flex-shrink:0}._4d5abf3b39fc4e47__header-lockup{min-width:0}._939fd173dcd6f7b5__header-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._2ebb2614e76305a3__header-visual{display:grid;flex-shrink:0;grid-template-columns:1fr;grid-template-rows:1fr;height:var(--wpds-dimension-size-sm,24px);width:var(--wpds-dimension-size-sm,24px);>*{grid-column:1/-1;grid-row:1/-1;max-height:100%;max-width:100%}}._3ee1b13e76b21c76__sidebar-toggle-slot:empty{display:none}._3e0a8b957270846f__header-subtitle{color:var(--wpds-color-foreground-content-neutral-weak,#6e6e6e);padding-block-end:var(--wpds-dimension-padding-xs,4px)}._24667cfed9f43255__header.b230252b347a13f0__has-navigation,._24667cfed9f43255__header.b230252b347a13f0__has-navigation ._3e0a8b957270846f__header-subtitle{padding-block-end:0}._08493e4139885090__header-navigation{margin-block-start:var(--wpds-dimension-gap-md,12px)}._164a4cfa881f76f7__content{display:flex;flex-direction:column;flex-grow:1;overflow:auto;&._2859463eef17c76b__has-padding{padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px)}}");
var style_module_default$1 = {
	"page": "_52bf6d26b2cc898d__page",
	"header": "_24667cfed9f43255__header",
	"header-content": "f92719188634c5d6__header-content",
	"header-actions": "_141425854f032b21__header-actions",
	"header-lockup": "_4d5abf3b39fc4e47__header-lockup",
	"header-title": "_939fd173dcd6f7b5__header-title",
	"header-visual": "_2ebb2614e76305a3__header-visual",
	"sidebar-toggle-slot": "_3ee1b13e76b21c76__sidebar-toggle-slot",
	"header-subtitle": "_3e0a8b957270846f__header-subtitle",
	"has-navigation": "b230252b347a13f0__has-navigation",
	"header-navigation": "_08493e4139885090__header-navigation",
	"content": "_164a4cfa881f76f7__content",
	"has-padding": "_2859463eef17c76b__has-padding"
};
/**
* A standard layout for admin screens. It includes a header with support for
* a title or breadcrumbs, badges, actions such as a Save button, and tab-style
* links to the sections of the screen. The page content shows below the header.
*/
function Page({ headingLevel, breadcrumbs, badges, visual, title, subTitle, children, className, actions, navigation, components, ariaLabel, hasPadding = false, showSidebarToggle = true }) {
	const classes = clsx(style_module_default$1.page, className);
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
			className: clsx(style_module_default$1.content, style_module_default$1["has-padding"]),
			children
		}) : children]
	});
}
Page.SidebarToggleFill = SidebarToggleFill;

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// \0wp-global:@wordpress/block-editor
var require_block_editor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blockEditor;
}));

// \0wp-global:@wordpress/blocks
var require_blocks = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blocks;
}));

// routes/navigation-edit/editor/style.scss
var import_data = require_data();
var import_core_data = require_core_data();
var import_html_entities = require_html_entities();
var import_block_editor = require_block_editor();
var import_blocks = require_blocks();
if (typeof document !== "undefined" && !document.head.querySelector("style[data-wp-hash='a4dcac87c4']")) {
	const style = document.createElement("style");
	style.setAttribute("data-wp-hash", "a4dcac87c4");
	style.appendChild(document.createTextNode(".navigation-edit-editor__hidden-blocks{display:none}.navigation-edit-editor__empty-message{margin:0 0 var(--wpds-dimension-gap-md,12px)}"));
	document.head.appendChild(style);
}

// routes/lock-unlock/index.ts
var import_private_apis = require_private_apis();
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/routes");

// routes/navigation-edit/editor/leaf-more-menu.tsx
const POPOVER_PROPS = {
	className: "block-editor-block-settings-menu__popover",
	placement: "bottom-start"
};
function LeafMoreMenu({ clientId, ...props }) {
	const { moveBlocksDown, moveBlocksUp, removeBlocks, duplicateBlocks, insertBeforeBlock, insertAfterBlock } = (0, import_data.useDispatch)(import_block_editor.store);
	const removeLabel = (0, import_i18n.sprintf)((0, import_i18n.__)("Remove %s"), (0, import_block_editor.BlockTitle)({
		clientId,
		maximumLength: 25
	}));
	const { rootClientId, canDuplicate, canInsertBlock, isFirst, isLast } = (0, import_data.useSelect)((select) => {
		const { getBlockRootClientId, getBlockName, canInsertBlockType, getDirectInsertBlock, getBlockIndex, getBlockCount } = select(import_block_editor.store);
		const { getDefaultBlockName } = select(import_blocks.store);
		const _rootClientId = getBlockRootClientId(clientId);
		const _blockName = getBlockName(clientId);
		const canInsertDefaultBlock = canInsertBlockType(getDefaultBlockName(), _rootClientId);
		const directInsertBlock = _rootClientId ? getDirectInsertBlock(_rootClientId) : null;
		return {
			rootClientId: _rootClientId,
			canDuplicate: (0, import_blocks.hasBlockSupport)(_blockName, "multiple", true) && canInsertBlockType(_blockName, _rootClientId),
			canInsertBlock: (canInsertDefaultBlock || !!directInsertBlock) && canInsertBlockType(_blockName, _rootClientId),
			isFirst: getBlockIndex(clientId) === 0,
			isLast: getBlockIndex(clientId) === getBlockCount(_rootClientId) - 1
		};
	}, [clientId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.DropdownMenu, {
		icon: more_vertical_default,
		label: (0, import_i18n.__)("Options"),
		className: "block-editor-block-settings-menu",
		popoverProps: POPOVER_PROPS,
		noIcons: true,
		...props,
		children: ({ onClose }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.MenuGroup, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.MenuItem, {
				icon: chevron_up_default,
				disabled: isFirst,
				onClick: () => {
					moveBlocksUp([clientId], rootClientId);
					onClose();
				},
				children: (0, import_i18n.__)("Move up")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.MenuItem, {
				icon: chevron_down_default,
				disabled: isLast,
				onClick: () => {
					moveBlocksDown([clientId], rootClientId);
					onClose();
				},
				children: (0, import_i18n.__)("Move down")
			}),
			canDuplicate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.MenuItem, {
				onClick: () => {
					duplicateBlocks([clientId]);
					onClose();
				},
				children: (0, import_i18n.__)("Duplicate")
			}),
			canInsertBlock && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.MenuItem, {
				onClick: () => {
					insertBeforeBlock(clientId);
					onClose();
				},
				children: (0, import_i18n.__)("Add before")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.MenuItem, {
				onClick: () => {
					insertAfterBlock(clientId);
					onClose();
				},
				children: (0, import_i18n.__)("Add after")
			})] })
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.MenuGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.MenuItem, {
			onClick: () => {
				removeBlocks([clientId], false);
				onClose();
			},
			children: removeLabel
		}) })] })
	});
}

// routes/navigation-edit/editor/content.tsx
const { PrivateListView } = unlock(import_block_editor.privateApis);
const PAGES_QUERY = [
	"postType",
	"page",
	{
		per_page: 100,
		_fields: [
			"id",
			"link",
			"menu_order",
			"parent",
			"title",
			"type"
		],
		orderby: "menu_order",
		order: "asc"
	}
];
function NavigationMenuContent({ rootClientId }) {
	const { NavigationLinkUI } = unlock(window.wp.blockLibrary.privateApis);
	const { listViewRootClientId, isLoading, hasChildren } = (0, import_data.useSelect)((select) => {
		const { areInnerBlocksControlled, getBlockName, getBlockCount, getBlockOrder } = select(import_block_editor.store);
		const { isResolving } = select(import_core_data.store);
		const blockClientIds = getBlockOrder(rootClientId);
		const pageListHasBlocks = blockClientIds.length === 1 && getBlockName(blockClientIds[0]) === "core/page-list" && getBlockCount(blockClientIds[0]) > 0;
		const isLoadingPages = isResolving("getEntityRecords", PAGES_QUERY);
		return {
			listViewRootClientId: pageListHasBlocks ? blockClientIds[0] : rootClientId,
			hasChildren: blockClientIds.length > 0,
			isLoading: !areInnerBlocksControlled(rootClientId) || isLoadingPages
		};
	}, [rootClientId]);
	const { openListViewContentPanel } = unlock((0, import_data.useDispatch)(import_block_editor.store));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		!isLoading && !hasChildren && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "navigation-edit-editor__empty-message",
			children: (0, import_i18n.__)("This Navigation Menu is empty.")
		}),
		!isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateListView, {
			rootClientId: listViewRootClientId,
			onSelect: openListViewContentPanel,
			blockSettingsMenu: LeafMoreMenu,
			showAppender: true,
			additionalBlockContent: NavigationLinkUI,
			showContentPopover: true,
			isExpanded: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "navigation-edit-editor__hidden-blocks",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockList, {})
		})
	] });
}

// routes/navigation-edit/editor/index.tsx
const noop = () => {};
function NavigationMenuEditor({ id }) {
	const { isReady: assetsReady } = useEditorAssets();
	const blocks = (0, import_element.useMemo)(() => {
		if (!assetsReady || !id) return [];
		return [(0, import_blocks.createBlock)("core/navigation", {
			ref: id,
			templateLock: "contentOnly"
		})];
	}, [assetsReady, id]);
	const settings = (0, import_element.useMemo)(() => ({ __experimentalFetchLinkSuggestions: (search, searchOptions) => (0, import_core_data.__experimentalFetchLinkSuggestions)(search, searchOptions, {}) }), []);
	if (!assetsReady || !blocks.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			height: "100vh"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockEditorProvider, {
		settings,
		value: blocks,
		onChange: noop,
		onInput: noop,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuContent, { rootClientId: blocks[0].clientId })
	});
}

// packages/style-runtime/src/index.ts
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

// routes/navigation-edit/style.module.scss
registerStyle("6389b9a7fb", "._2ee78b2258d87f3c__content{background-color:var(--wpds-color-background-surface-neutral-strong,#fff);flex-grow:1;min-height:0;overflow:auto;padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px)}");
var style_module_default = { "content": "_2ee78b2258d87f3c__content" };

// routes/navigation-edit/stage.tsx
const NAVIGATION_POST_TYPE = "wp_navigation";
function NavigationEditStage() {
	const { id } = useParams({ from: "/navigation/edit/$id" });
	const navigationId = parseInt(id);
	const { navigationMenu } = (0, import_data.useSelect)((select) => {
		const { getEntityRecord } = select(import_core_data.store);
		return { navigationMenu: getEntityRecord("postType", NAVIGATION_POST_TYPE, navigationId) };
	}, [navigationId]);
	if (!navigationMenu) return;
	const menuTitle = navigationMenu.title?.rendered || navigationMenu.title?.raw || "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, {
		ariaLabel: (0, import_html_entities.decodeEntities)(menuTitle),
		headingLevel: 2,
		breadcrumbs: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumbs, { items: [{
			label: (0, import_i18n.__)("Navigation"),
			to: "/navigation/list"
		}, { label: (0, import_html_entities.decodeEntities)(menuTitle) }] }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: style_module_default.content,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationMenuEditor, { id: navigationId })
		})
	});
}
const stage = NavigationEditStage;

export { stage };