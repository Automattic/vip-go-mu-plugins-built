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

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// packages/core-fields/build-module/shared/title/get-item-title.mjs
var import_html_entities = require_html_entities();
var import_i18n = require_i18n();
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

// \0wp-global:@wordpress/primitives
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.primitives;
}));

// packages/ui/build-module/icon/icon.mjs
var import_element = require_element();
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/use-render/useRender.mjs
/**
* Renders a Base UI element.
*
* @public
*/
function useRender(params) {
	return useRenderElement(params.defaultTagName ?? "div", params, params);
}

// packages/icons/build-module/library/help.mjs
var help_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M9.75 10.25C9.75 9.00736 10.7574 8 12 8C13.2426 8 14.25 9.00736 14.25 10.25C14.25 11.4083 13.3748 12.3621 12.2496 12.4863C12.1124 12.5015 12 12.6119 12 12.75V14M12 15V16.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z",
		strokeLinejoin: "round"
	})]
});

// packages/ui/build-module/text/text.mjs
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
registerStyle$4("09bae534ff", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9745ffa515d864cf__text{text-wrap:pretty;margin:0}._8882b6a7feb4fd3d__heading-2xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-p-line-height:var(--wpds-typography-line-height-2xl,40px);font-size:var(--wpds-typography-font-size-2xl,32px);line-height:var(--wpds-typography-line-height-2xl,40px)}._664e3e7687c45603__heading-xl,._8882b6a7feb4fd3d__heading-2xl{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600)}._664e3e7687c45603__heading-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-md,24px)}.dac661a5de0ed2bd__heading-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-lg,15px)}._59c7f3f740e2f96e__heading-md,.dac661a5de0ed2bd__heading-lg{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-sm,20px)}._59c7f3f740e2f96e__heading-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px)}.cf052fbad8d93b7e__heading-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._212b9cfef57a0af4__body-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-xl,32px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-xl,32px)}._07f57bc0aa36b2c6__body-lg,._212b9cfef57a0af4__body-xl{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}._07f57bc0aa36b2c6__body-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-lg,15px);line-height:var(--wpds-typography-line-height-md,24px)}._0c6da4457aec9e62__body-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px)}._0c6da4457aec9e62__body-md,.b998f87ff17b7bec__body-sm{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}.b998f87ff17b7bec__body-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var style_module_default$4 = {
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
* A text component for rendering content with predefined typographic variants.
* Built on design tokens for consistent typography across the UI.
*/
const Text = (0, import_element.forwardRef)(function UnforwardedText({ variant = "body-md", render, className, ...props }, ref) {
	return useRender({
		render,
		defaultTagName: "span",
		ref,
		props: mergeProps(props, { className: clsx(style_module_default$4.text, global_css_defense_module_default$1.heading, global_css_defense_module_default$1.p, style_module_default$4[variant], className) })
	});
});

// packages/ui/build-module/stack/stack.mjs
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
registerStyle$3("67591fa198", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._8e8e79c1a2eec43b__stack{display:flex}}}");
var style_module_default$3 = { "stack": "_8e8e79c1a2eec43b__stack" };
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
			className: style_module_default$3.stack
		})
	});
});

// packages/ui/build-module/badge/badge.mjs
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
registerStyle$2("7daf4893c9", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9ce8c05efea8e203__badge{border-radius:var(--wpds-border-radius-lg,8px);padding-block:var(--wpds-dimension-padding-xs,4px);padding-inline:var(--wpds-dimension-padding-sm,8px)}._8b848c49ae4c70ec__infotip-trigger{--_gcd-button-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_gcd-button-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-button-font-weight:var(--wpds-typography-font-weight-default,400);align-items:center;border:0;cursor:var(--wpds-cursor-control,pointer);display:inline-flex;gap:var(--wpds-dimension-gap-xs,4px);text-align:start;vertical-align:middle}._8b848c49ae4c70ec__infotip-trigger:focus{outline:none}._8b848c49ae4c70ec__infotip-trigger:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._0b34a322e3f931d1__infotip-icon{flex-shrink:0;margin-inline-end:-3px}.dbaa78793aa9ed55__is-high-intent{background-color:var(--wpds-color-background-surface-error,#fae5e1);color:var(--wpds-color-foreground-content-error,#470000)}.e7014da94d135da5__is-medium-intent{background-color:var(--wpds-color-background-surface-warning,#fde6be);color:var(--wpds-color-foreground-content-warning,#2e1900)}._0ea3f993ed9a8b93__is-low-intent{background-color:var(--wpds-color-background-surface-caution,#fee995);color:var(--wpds-color-foreground-content-caution,#281d00)}._2cb7bc48c640ffb1__is-stable-intent{background-color:var(--wpds-color-background-surface-success,#c2f8ca);color:var(--wpds-color-foreground-content-success,#002900)}._4ad31051a45a43b8__is-informational-intent{background-color:var(--wpds-color-background-surface-info,#deebfa);color:var(--wpds-color-foreground-content-info,#001b4f)}._0161efc7afeedbfd__is-draft-intent{background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);color:var(--wpds-color-foreground-content-neutral,#1e1e1e)}._8d100360e716930c__is-none-intent{background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);padding-block:calc(var(--wpds-dimension-padding-xs, 4px) - var(--wpds-border-width-xs, 1px));padding-inline:calc(var(--wpds-dimension-padding-sm, 8px) - var(--wpds-border-width-xs, 1px))}}}");
var style_module_default$2 = {
	"badge": "_9ce8c05efea8e203__badge",
	"infotip-trigger": "_8b848c49ae4c70ec__infotip-trigger",
	"infotip-icon": "_0b34a322e3f931d1__infotip-icon",
	"is-high-intent": "dbaa78793aa9ed55__is-high-intent",
	"is-medium-intent": "e7014da94d135da5__is-medium-intent",
	"is-low-intent": "_0ea3f993ed9a8b93__is-low-intent",
	"is-stable-intent": "_2cb7bc48c640ffb1__is-stable-intent",
	"is-informational-intent": "_4ad31051a45a43b8__is-informational-intent",
	"is-draft-intent": "_0161efc7afeedbfd__is-draft-intent",
	"is-none-intent": "_8d100360e716930c__is-none-intent"
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
* A badge component for displaying labels with semantic intent.
* Add an infotip to explain a status in a popover.
*/
const Badge = (0, import_element.forwardRef)(function UnforwardedBadge({ intent = "none", className, children, infotip, render, ...props }, ref) {
	const badge = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
		ref,
		className: clsx(style_module_default$2.badge, style_module_default$2[`is-${intent}-intent`], className),
		...props,
		render: infotip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(infotip.popover.Trigger, {
			className: clsx(style_module_default$2["infotip-trigger"], global_css_defense_module_default.button),
			openOnHover: true,
			delay: 200,
			closeDelay: 200,
			render
		}) : render,
		variant: "body-sm",
		children: [children, infotip && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			icon: help_default,
			size: 16,
			"aria-hidden": "true",
			className: style_module_default$2["infotip-icon"]
		})]
	});
	return infotip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(infotip.popover.Root, { children: [badge, infotip.popup] }) : badge;
});

// packages/core-fields/build-module/shared/title/view.mjs
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
registerStyle$1("a4585ee5f7", "._6f88745c59f7b1df__title>span:first-child{display:block;flex-grow:0;overflow:hidden;text-decoration:none;text-overflow:ellipsis;white-space:nowrap}.bfcb43aba334e5f0__pattern-title>span:first-child{flex:1}");
var style_module_default$1 = {
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
		className: clsx("fields-field__title", style_module_default$1.title, className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: renderedTitle || (0, import_i18n.__)("(no title)") }), children]
	});
}

// packages/core-fields/build-module/page/title/view.mjs
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
registerStyle("03392c4701", "._0ad5ed418fc61ee4__badge{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}");
var style_module_default = { "badge": "_0ad5ed418fc61ee4__badge" };
function PageTitleView({ item }) {
	const { frontPageId, postsPageId, privacyPolicyPageId } = (0, import_data.useSelect)((select) => {
		const { getEntityRecord } = select(import_core_data.store);
		const siteSettings = getEntityRecord("root", "site");
		return {
			frontPageId: siteSettings?.page_on_front,
			postsPageId: siteSettings?.page_for_posts,
			privacyPolicyPageId: siteSettings?.page_for_privacy_policy
		};
	}, []);
	let badge;
	if (item.id === frontPageId) badge = (0, import_i18n.__)("Homepage");
	else if (item.id === postsPageId) badge = (0, import_i18n.__)("Posts Page");
	else if (item.id === privacyPolicyPageId) badge = (0, import_i18n.__)("Privacy Policy Page");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BaseTitleView, {
		item,
		children: badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			className: style_module_default.badge,
			children: badge
		})
	});
}

// packages/core-fields/build-module/page/title/field.mjs
/**
* The JavaScript parts of the page title field; its data is in `field.php`.
*/
const fieldExtensions = {
	getValue: ({ item }) => getItemTitle(item),
	render: PageTitleView
};

// packages/core-fields/build-module/page/index.mjs
const fields = { title: fieldExtensions };

export { fields as default };
//# sourceMappingURL=page.js.map