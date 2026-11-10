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

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// \0wp-global:@wordpress/primitives
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.primitives;
}));

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/icons/build-module/library/comment-author-avatar.mjs
var import_primitives = require_primitives();
var import_jsx_runtime = require_jsx_runtime();
var comment_author_avatar_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M8 18.0476V16C8 14.8954 8.89543 14 10 14H14C15.1046 14 16 14.8954 16 16V18.0476" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
			d: "M12 4.75C7.99594 4.75 4.75 7.99593 4.75 12C4.75 16.0041 7.99593 19.25 12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75Z",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M13.75 10C13.75 10.9665 12.9665 11.75 12 11.75C11.0335 11.75 10.25 10.9665 10.25 10C10.25 9.0335 11.0335 8.25 12 8.25C12.9665 8.25 13.75 9.0335 13.75 10Z" })
	]
});

// packages/icons/build-module/library/globe.mjs
var globe_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M12 4.75C8.87453 4.75 6.21099 6.72773 5.19257 9.5M18.8074 14.5C19.0937 13.7207 19.25 12.8786 19.25 12C19.25 11.1214 19.0937 10.2793 18.8074 9.5C17.789 6.72773 15.1255 4.75 12 4.75M12 4.75C11 5.5 9 8.63218 9 12C9 15.3678 11 18.5 12 19.25M12 4.75C13 5.5 15 8.63218 15 12C15 15.3678 13 18.5 12 19.25M5.19257 9.5C4.90628 10.2793 4.75 11.1214 4.75 12C4.75 12.8786 4.90629 13.7207 5.19257 14.5C6.21099 17.2723 8.87453 19.25 12 19.25M12 19.25C15.1255 19.25 17.789 17.2723 18.8074 14.5M5.19257 9.5L18.8074 9.5M5.19257 14.5L18.8074 14.5",
		strokeLinejoin: "round"
	})
});

// packages/icons/build-module/library/layout.mjs
var layout_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M9.75 19.25H18C18.6904 19.25 19.25 18.6904 19.25 18V9.75M9.75 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V9.75M9.75 19.25V9.75M19.25 9.75V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V9.75M19.25 9.75H9.75M9.75 9.75H4.75" })
});

// packages/icons/build-module/library/plugins.mjs
var plugins_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M15.3995 11.5711L12.2175 8.38909L10.273 6.44454L7.67678 9.04074C7.3017 9.41581 7.09099 9.92452 7.09099 10.455L7.09099 13.455C7.09099 13.7202 6.98563 13.9745 6.7981 14.1621L5.14645 15.8137C4.95118 16.009 4.95118 16.3256 5.14645 16.5208L7.26777 18.6421C7.46303 18.8374 7.77961 18.8374 7.97487 18.6421L9.62652 16.9905C9.81406 16.8029 10.0684 16.6976 10.3336 16.6976H13.3336C13.8641 16.6976 14.3728 16.4869 14.7478 16.1118L17.344 13.5156L15.3995 11.5711ZM12.2175 8.38909L16.1066 4.5M15.3995 11.5711L19.2886 7.68198" })
});

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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/avatar/root/AvatarRoot.mjs
/**
* Displays a user's profile picture, initials, or fallback icon.
* Renders a `<span>` element.
*
* Documentation: [Base UI Avatar](https://base-ui.com/react/components/avatar)
*/
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
	import__wp_global_react.useEffect(fn, EMPTY_ARRAY);
}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/useAnimationFrame.mjs
/** Unlike `setTimeout`, rAF doesn't guarantee a positive integer return value, so we can't have
* a monomorphic `uint` type with `0` meaning empty.
* See warning note at:
* https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame#return_value */
const EMPTY = null;
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
	currentId = EMPTY;
	/**
	* Executes `fn` after `delay`, clearing any previously scheduled call.
	*/
	request(fn) {
		this.cancel();
		this.currentId = scheduler.request(() => {
			this.currentId = EMPTY;
			fn();
		});
	}
	cancel = () => {
		if (this.currentId !== EMPTY) {
			scheduler.cancel(this.currentId);
			this.currentId = EMPTY;
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
const stateAttributesMapping = {
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
		stateAttributesMapping,
		enabled: shouldRender
	});
	if (!shouldRender) return null;
	return element;
});
AvatarImage.displayName = "AvatarImage";

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
registerStyle$5("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$5("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
registerStyle$5("2657a3ab0c", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.a9728400af96db77__root{--_wp-ui-avatar-size:var(--wpds-dimension-size-md,32px);--_gcd-span-position:relative;--_gcd-span-display:inline-flex;--_gcd-span-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_gcd-span-font-size:var(--_wp-ui-avatar-font-size);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-sm,12px);align-items:center;background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);block-size:var(--_wp-ui-avatar-size);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:50%;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:inline-flex;flex-shrink:0;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--_wp-ui-avatar-font-size);font-weight:var(--wpds-typography-font-weight-emphasis,600);inline-size:var(--_wp-ui-avatar-size);justify-content:center;line-height:1;position:relative;vertical-align:middle}._81a33c129d7cbe31__has-color:after{border:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--_wp-ui-avatar-color);border-radius:inherit;content:\"\";inset:calc(var(--wpds-border-width-xs, 1px)*-1);pointer-events:none;position:absolute}._32e65dea77285874__is-square{border-radius:var(--wpds-border-radius-sm,2px)}._7d2020337343df5a__is-xs{--_wp-ui-avatar-size:var(--wpds-dimension-size-2xs,16px);--_wp-ui-avatar-font-size:calc(var(--_wp-ui-avatar-size)/2)}._216fb78a075c5ab4__is-sm{--_wp-ui-avatar-size:var(--wpds-dimension-size-sm,24px);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-xs,11px)}.b552ab04a3b94ae9__is-lg{--_wp-ui-avatar-size:var(--wpds-dimension-size-lg,40px);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-md,13px)}.f8a7646462ff80d1__is-xl{--_wp-ui-avatar-size:calc(var(--wpds-dimension-size-md, 32px)*2);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-xl,20px)}._411c43ac028fe4be__image,._7883f856336224e2__fallback{block-size:100%;border-radius:inherit;inline-size:100%;inset:0;position:absolute}._411c43ac028fe4be__image{object-fit:cover;@media not (prefers-reduced-motion){transition:opacity var(--wpds-motion-duration-sm,.1s) var(--wpds-motion-easing-subtle,cubic-bezier(.15,0,.15,1));&[data-error],&[data-loading],&[data-starting-style]{opacity:0}}&[data-ending-style],&[data-error],&[data-loading]{visibility:hidden}}._7883f856336224e2__fallback{--_gcd-span-position:absolute;--_gcd-span-display:flex;align-items:center;display:flex;justify-content:center;overflow:hidden;white-space:nowrap;>svg{block-size:100%;flex-shrink:0;inline-size:100%}>.dc9b5131d4746aa6__person-icon{block-size:110%;color:var(--wpds-color-stroke-surface-neutral-strong,#8d8d8d);inline-size:110%;translate:0 15%}}@media not (forced-colors:active){@supports (color:rgb(from green r g b/1)) and (color:color(from green srgb-linear round(up,r) g b/1)){._81a33c129d7cbe31__has-color:has(>._7883f856336224e2__fallback){border:none}._81a33c129d7cbe31__has-color:has(>._7883f856336224e2__fallback):after{content:none}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback{--_wp-ui-avatar-background:rgb(from var(--_wp-ui-avatar-color) clamp(0,r,255) clamp(0,g,255) clamp(0,b,255)/1);--_wp-ui-avatar-contrast-target:4.55;background-color:var(--_wp-ui-avatar-background)}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback>.dc9b5131d4746aa6__person-icon{--_wp-ui-avatar-contrast-target:3.05}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback,._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback>.dc9b5131d4746aa6__person-icon{--_wp-ui-avatar-luminance:calc(0.2126 * r + 0.7152 * g + 0.0722 * b);--_wp-ui-avatar-light-foreground:round(up,clamp(0,calc(0.17913 - var(--_wp-ui-avatar-luminance)),1));--_wp-ui-avatar-dark-tint:clamp(0,calc(((var(--_wp-ui-avatar-luminance) + 0.05)/var(--_wp-ui-avatar-contrast-target) - 0.05)/max(0.000001, var(--_wp-ui-avatar-luminance))),1);--_wp-ui-avatar-light-tint:clamp(0,calc((1.05 - var(--_wp-ui-avatar-contrast-target)*(var(--_wp-ui-avatar-luminance) + 0.05))/max(0.000001, 1 - var(--_wp-ui-avatar-luminance))),1);--_wp-ui-avatar-tint:calc(var(--_wp-ui-avatar-light-foreground)*var(--_wp-ui-avatar-light-tint) + (1 - var(--_wp-ui-avatar-light-foreground))*var(--_wp-ui-avatar-dark-tint));color:color(from var(--_wp-ui-avatar-background) srgb-linear calc(var(--_wp-ui-avatar-light-foreground) + (r - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint)) calc(var(--_wp-ui-avatar-light-foreground) + (g - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint)) calc(var(--_wp-ui-avatar-light-foreground) + (b - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint))/1)}}}}}");
var style_module_default$5 = {
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
const Root = (0, import_element.forwardRef)(function AvatarRoot$1({ size = "md", shape = "circle", color, className, style, ...props }, ref) {
	warnAvatarColor(color);
	const customProperties = color === void 0 ? style : {
		...style,
		"--_wp-ui-avatar-color": color
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarRoot, {
		ref,
		style: customProperties,
		className: clsx(resets_module_default["box-sizing"], global_css_defense_module_default.span, style_module_default$5.root, style_module_default$5[`is-${size}`], shape === "square" && style_module_default$5["is-square"], color !== void 0 && style_module_default$5["has-color"], className),
		...props
	});
});

// packages/ui/build-module/avatar/image.mjs
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
registerStyle$4("2657a3ab0c", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.a9728400af96db77__root{--_wp-ui-avatar-size:var(--wpds-dimension-size-md,32px);--_gcd-span-position:relative;--_gcd-span-display:inline-flex;--_gcd-span-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_gcd-span-font-size:var(--_wp-ui-avatar-font-size);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-sm,12px);align-items:center;background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);block-size:var(--_wp-ui-avatar-size);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:50%;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:inline-flex;flex-shrink:0;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--_wp-ui-avatar-font-size);font-weight:var(--wpds-typography-font-weight-emphasis,600);inline-size:var(--_wp-ui-avatar-size);justify-content:center;line-height:1;position:relative;vertical-align:middle}._81a33c129d7cbe31__has-color:after{border:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--_wp-ui-avatar-color);border-radius:inherit;content:\"\";inset:calc(var(--wpds-border-width-xs, 1px)*-1);pointer-events:none;position:absolute}._32e65dea77285874__is-square{border-radius:var(--wpds-border-radius-sm,2px)}._7d2020337343df5a__is-xs{--_wp-ui-avatar-size:var(--wpds-dimension-size-2xs,16px);--_wp-ui-avatar-font-size:calc(var(--_wp-ui-avatar-size)/2)}._216fb78a075c5ab4__is-sm{--_wp-ui-avatar-size:var(--wpds-dimension-size-sm,24px);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-xs,11px)}.b552ab04a3b94ae9__is-lg{--_wp-ui-avatar-size:var(--wpds-dimension-size-lg,40px);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-md,13px)}.f8a7646462ff80d1__is-xl{--_wp-ui-avatar-size:calc(var(--wpds-dimension-size-md, 32px)*2);--_wp-ui-avatar-font-size:var(--wpds-typography-font-size-xl,20px)}._411c43ac028fe4be__image,._7883f856336224e2__fallback{block-size:100%;border-radius:inherit;inline-size:100%;inset:0;position:absolute}._411c43ac028fe4be__image{object-fit:cover;@media not (prefers-reduced-motion){transition:opacity var(--wpds-motion-duration-sm,.1s) var(--wpds-motion-easing-subtle,cubic-bezier(.15,0,.15,1));&[data-error],&[data-loading],&[data-starting-style]{opacity:0}}&[data-ending-style],&[data-error],&[data-loading]{visibility:hidden}}._7883f856336224e2__fallback{--_gcd-span-position:absolute;--_gcd-span-display:flex;align-items:center;display:flex;justify-content:center;overflow:hidden;white-space:nowrap;>svg{block-size:100%;flex-shrink:0;inline-size:100%}>.dc9b5131d4746aa6__person-icon{block-size:110%;color:var(--wpds-color-stroke-surface-neutral-strong,#8d8d8d);inline-size:110%;translate:0 15%}}@media not (forced-colors:active){@supports (color:rgb(from green r g b/1)) and (color:color(from green srgb-linear round(up,r) g b/1)){._81a33c129d7cbe31__has-color:has(>._7883f856336224e2__fallback){border:none}._81a33c129d7cbe31__has-color:has(>._7883f856336224e2__fallback):after{content:none}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback{--_wp-ui-avatar-background:rgb(from var(--_wp-ui-avatar-color) clamp(0,r,255) clamp(0,g,255) clamp(0,b,255)/1);--_wp-ui-avatar-contrast-target:4.55;background-color:var(--_wp-ui-avatar-background)}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback>.dc9b5131d4746aa6__person-icon{--_wp-ui-avatar-contrast-target:3.05}._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback,._81a33c129d7cbe31__has-color>._7883f856336224e2__fallback>.dc9b5131d4746aa6__person-icon{--_wp-ui-avatar-luminance:calc(0.2126 * r + 0.7152 * g + 0.0722 * b);--_wp-ui-avatar-light-foreground:round(up,clamp(0,calc(0.17913 - var(--_wp-ui-avatar-luminance)),1));--_wp-ui-avatar-dark-tint:clamp(0,calc(((var(--_wp-ui-avatar-luminance) + 0.05)/var(--_wp-ui-avatar-contrast-target) - 0.05)/max(0.000001, var(--_wp-ui-avatar-luminance))),1);--_wp-ui-avatar-light-tint:clamp(0,calc((1.05 - var(--_wp-ui-avatar-contrast-target)*(var(--_wp-ui-avatar-luminance) + 0.05))/max(0.000001, 1 - var(--_wp-ui-avatar-luminance))),1);--_wp-ui-avatar-tint:calc(var(--_wp-ui-avatar-light-foreground)*var(--_wp-ui-avatar-light-tint) + (1 - var(--_wp-ui-avatar-light-foreground))*var(--_wp-ui-avatar-dark-tint));color:color(from var(--_wp-ui-avatar-background) srgb-linear calc(var(--_wp-ui-avatar-light-foreground) + (r - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint)) calc(var(--_wp-ui-avatar-light-foreground) + (g - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint)) calc(var(--_wp-ui-avatar-light-foreground) + (b - var(--_wp-ui-avatar-light-foreground)) * var(--_wp-ui-avatar-tint))/1)}}}}}");
var style_module_default$4 = {
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
		className: clsx(style_module_default$4.image, className),
		...props
	});
});

// packages/ui/build-module/icon/icon.mjs
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

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

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

// packages/core-fields/build-module/shared/author/avatar.mjs
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
registerStyle$2("efeba968e6", "._4d84143be9dae462__icon,.dd9b5d817b3207dc__avatar{align-items:center;block-size:1lh;display:flex;flex-shrink:0;inline-size:var(--wpds-dimension-size-2xs,16px)}._4d84143be9dae462__icon svg{fill:currentColor;margin-inline:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2)}.de468aa290326111__name{overflow:hidden;text-overflow:ellipsis}");
var style_module_default$2 = {
	"avatar": "dd9b5d817b3207dc__avatar",
	"icon": "_4d84143be9dae462__icon",
	"name": "de468aa290326111__name"
};
function AuthorAvatar({ src }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: style_module_default$2.avatar,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
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

// packages/core-fields/build-module/wp_template/author/view.mjs
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
registerStyle$1("efeba968e6", "._4d84143be9dae462__icon,.dd9b5d817b3207dc__avatar{align-items:center;block-size:1lh;display:flex;flex-shrink:0;inline-size:var(--wpds-dimension-size-2xs,16px)}._4d84143be9dae462__icon svg{fill:currentColor;margin-inline:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2)}.de468aa290326111__name{overflow:hidden;text-overflow:ellipsis}");
var style_module_default$1 = {
	"avatar": "dd9b5d817b3207dc__avatar",
	"icon": "_4d84143be9dae462__icon",
	"name": "de468aa290326111__name"
};
function getIconForSource(originalSource) {
	switch (originalSource) {
		case "theme": return layout_default;
		case "plugin": return plugins_default;
		case "site": return globe_default;
		default: return comment_author_avatar_default;
	}
}
function TemplateAuthorView({ item }) {
	const originalSource = item.original_source;
	const icon = getIconForSource(originalSource);
	const text = item.author_text;
	const authorId = item.author;
	const imageUrl = (0, import_data.useSelect)((select) => {
		if (originalSource === "site") {
			const logoId = select(import_core_data.store).getEntityRecord("root", "__unstableBase")?.site_logo;
			if (!logoId) return;
			return select(import_core_data.store).getEntityRecord("postType", "attachment", logoId)?.source_url;
		}
		if (originalSource !== "user" || !authorId) return;
		return select(import_core_data.store).getUser(authorId)?.avatar_urls?.[48];
	}, [originalSource, authorId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
		direction: "row",
		gap: "xs",
		align: "flex-start",
		children: [
			imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthorAvatar, { src: imageUrl }),
			!imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$1.icon,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { icon })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: style_module_default$1.name,
				children: text
			})
		]
	});
}

// packages/core-fields/build-module/wp_template/author/get-author-elements.mjs
/**
* The authors of the templates or template parts, deduplicated: several of
* them usually come from the same theme or plugin.
*
* @param postType `wp_template` or `wp_template_part`.
* @return The elements to filter the author by.
*/
async function getAuthorElements(postType) {
	const records = await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecords("postType", postType, {
		per_page: -1,
		_fields: "id,author_text"
	});
	const seen = /* @__PURE__ */ new Set();
	const elements = [];
	for (const record of records ?? []) {
		const value = record.author_text;
		if (value && !seen.has(value)) {
			seen.add(value);
			elements.push({
				value,
				label: value
			});
		}
	}
	return elements;
}

// packages/core-fields/build-module/wp_template/author/field.mjs
/**
* The JavaScript parts of the author field of templates; its data is in
* `field.php`.
*/
const fieldExtensions$6 = {
	getValue: ({ item }) => item.author_text,
	render: TemplateAuthorView,
	getElements: () => getAuthorElements("wp_template")
};

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// packages/core-fields/build-module/wp_template/description/utils.mjs
var import_html_entities = require_html_entities();
/**
* Whether the template is a custom template a user created, the only ones
* whose description can be edited. Theme-provided templates surface a
* read-only description instead.
*
* @param item The template.
* @return Whether it is a custom template.
*/
const isCustomTemplate = (item) => item.source === "custom" && !item.has_theme_file && !!item.is_custom;
/**
* The decoded description of a template.
*
* @param args      The arguments.
* @param args.item The template.
* @return The description.
*/
const getValue = ({ item }) => (0, import_html_entities.decodeEntities)(item.description || "");
/**
* Renders the description of a template, as plain text that takes the
* typography of where it renders, like the values of other fields.
*
* @param props      The props.
* @param props.item The template.
* @return The description, if any.
*/
const render = ({ item }) => {
	const { description } = item;
	return description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: (0, import_html_entities.decodeEntities)(description) }) : null;
};

// packages/core-fields/build-module/wp_template/description/field.mjs
/**
* The JavaScript parts of the template description field; its data is in
* `field.php`.
*/
const fieldExtensions$5 = {
	getValue,
	render,
	isVisible: isCustomTemplate
};

// packages/core-fields/build-module/wp_template/description_readonly/field.mjs
/**
* The JavaScript parts of the read-only template description field; its
* data is in `field.php`.
*/
const fieldExtensions$4 = {
	getValue,
	render,
	isVisible: (item) => !isCustomTemplate(item) && !!item.description
};

// packages/core-fields/build-module/wp_template/default_comment_status/field.mjs
var import_i18n = require_i18n();
/**
* The JavaScript parts of the discussion field; the editor summary form maps
* it to the `root/site` entity.
*/
const fieldExtensions$3 = {
	getValue: ({ item }) => item.default_comment_status || "",
	setValue: ({ value }) => ({ default_comment_status: value || null }),
	render: ({ item }) => item.default_comment_status === "open" ? (0, import_i18n.__)("Comments open") : (0, import_i18n.__)("Comments closed")
};

// packages/core-fields/build-module/wp_template/posts_page_title/field.mjs
/**
* The JavaScript parts of the Posts Page title field; the editor summary form
* maps it to the Posts Page entity.
*/
const fieldExtensions$2 = {
	getValue: ({ item }) => {
		const title = item.title;
		if (typeof title === "string") return title;
		return title?.raw ?? "";
	},
	setValue: ({ value }) => ({ title: value })
};

// packages/core-fields/build-module/wp_template/posts_per_page/field.mjs
/**
* The JavaScript parts of the posts per page field; the editor summary form
* maps it to the `root/site` entity.
*/
const fieldExtensions$1 = {
	getValue: ({ item }) => item.posts_per_page ?? 1,
	setValue: ({ value }) => ({ posts_per_page: value })
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

// packages/core-fields/build-module/wp_template/title/field.mjs
/**
* The JavaScript parts of the template title field; its data is in
* `field.php`.
*/
const fieldExtensions = {
	getValue: ({ item }) => getItemTitle(item),
	render: TitleView
};

// packages/core-fields/build-module/wp_template/index.mjs
const fields = {
	author: fieldExtensions$6,
	description: fieldExtensions$5,
	description_readonly: fieldExtensions$4,
	posts_page_title: fieldExtensions$2,
	posts_per_page: fieldExtensions$1,
	default_comment_status: fieldExtensions$3,
	title: fieldExtensions
};

export { fields as default };
//# sourceMappingURL=wp_template.js.map