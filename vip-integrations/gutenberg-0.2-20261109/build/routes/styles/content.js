import { useNavigate, useSearch } from "@wordpress/route";
import { speak } from "@wordpress/a11y";
import { useEditorAssets, useEditorSettings } from "@wordpress/lazy-editor";

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
var __require$2 = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
});

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
function NOOP() {}
const EMPTY_ARRAY$2 = Object.freeze([]);
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
function resolveStyle$2(style, state) {
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
	const style = enabled ? resolveStyle$2(styleProp, state) : void 0;
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
	import__wp_global_react.useEffect(fn, EMPTY_ARRAY$2);
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
var import_i18n = require_i18n();
var import_jsx_runtime = require_jsx_runtime();
function r$1(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r$1(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r$1(e)) && (n && (n += " "), n += t);
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
function useId$2(idOverride, prefix) {
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
	return useId$2(idOverride, "base-ui");
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
	const uniqueId = useId$2();
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
	const floatingId = useId$2();
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
function register(hook) {
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
function isRTL$10(element) {
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
	isRTL: isRTL$10
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

// packages/icons/build-module/icon/index.mjs
var import_element = require_element();
/**
* Return an SVG icon.
*
* @param props The component props.
*
* @return Icon component
*/
var icon_default = (0, import_element.forwardRef)(({ icon, size = 24, style, ...props }, ref) => {
	const intrinsicStyle = icon.props.style;
	const mergedStyle = intrinsicStyle || style ? {
		...intrinsicStyle,
		...style
	} : void 0;
	return (0, import_element.cloneElement)(icon, {
		width: size,
		height: size,
		...props,
		...mergedStyle ? { style: mergedStyle } : {},
		ref
	});
});

// packages/icons/build-module/library/backup.mjs
var import_primitives = require_primitives();
var backup_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M7.59201 17.7565C8.8135 18.6933 10.3417 19.25 12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99593 4.75 12L4.75 14M14.75 14.75L12.25 12.25L12.25 8M2 12L4.75 14L7.5 12" })
});

// packages/icons/build-module/library/button.mjs
var button_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M8 11.75H16M5 16.25H19C19.6904 16.25 20.25 15.6904 20.25 15V8.5C20.25 7.80964 19.6904 7.25 19 7.25H5C4.30964 7.25 3.75 7.80964 3.75 8.5V15C3.75 15.6904 4.30964 16.25 5 16.25Z" })
});

// packages/icons/build-module/library/caption.mjs
var caption_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M8 15.25H10M11 15.25H13M14 15.25H16M6 19.25H18C18.6904 19.25 19.25 18.6904 19.25 18V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V18C4.75 18.6904 5.30964 19.25 6 19.25Z" })
});

// packages/icons/build-module/library/form-input.mjs
var form_input_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M3.75 8.5C3.75 7.80964 4.30964 7.25 5 7.25H19C19.6904 7.25 20.25 7.80964 20.25 8.5V15C20.25 15.6904 19.6904 16.25 19 16.25H5C4.30964 16.25 3.75 15.6904 3.75 15V8.5Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M6.75 14V9.5" })]
});

// packages/icons/build-module/library/form-select.mjs
var form_select_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M3.75 8.5C3.75 7.80964 4.30964 7.25 5 7.25H19C19.6904 7.25 20.25 7.80964 20.25 8.5V15C20.25 15.6904 19.6904 16.25 19 16.25H5C4.30964 16.25 3.75 15.6904 3.75 15V8.5Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M15 11L12 13L9 11" })]
});

// packages/icons/build-module/library/heading-level-1.mjs
var heading_level_1_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M18.75 18.75C18.75 17.9056 18.75 11.963 18.75 9.5L15.75 10.3056" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M3.75 12H11.75M3.75 12V6M3.75 12L3.75 18M11.75 12V6M11.75 12V18",
		strokeLinecap: "square"
	})]
});

// packages/icons/build-module/library/heading-level-2.mjs
var heading_level_2_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M3.75 12H11.75M3.75 12V6M3.75 12L3.75 18M11.75 12V6M11.75 12V18",
		strokeLinecap: "square"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M20.3915 17.9989H16C16 13.4611 20.5 14.6523 20.5 11.2489C20.5 9.54722 18.1957 8.04722 16 9.7489",
		strokeLinecap: "square"
	})]
});

// packages/icons/build-module/library/heading-level-3.mjs
var heading_level_3_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M3.75 12H11.75M3.75 12V6M3.75 12L3.75 18M11.75 12V6M11.75 12V18",
		strokeLinecap: "square"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M15.5 17.2434C18 18.9138 20.5 17.5775 20.5 15.573C20.5 14.9823 20.2366 14.4158 19.7678 13.9981C19.2989 13.5805 18.663 13.3458 18 13.3458M18 13.3458C18.663 13.3458 19.2989 13.1112 19.7678 12.6935C20.2366 12.2758 20.5 11.7093 20.5 11.1186C20.5 9.44825 18.125 8.33466 16 9.44825M18 13.3458H17.75",
		strokeLinecap: "square"
	})]
});

// packages/icons/build-module/library/heading-level-4.mjs
var heading_level_4_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M3.75 12H11.75M3.75 12V6M3.75 12L3.75 18M11.75 12V6M11.75 12V18",
		strokeLinecap: "square"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M20 18.75V14.5M20 10.75V14.5M16.25 8.74999V9L15 14.5L20 14.5" })]
});

// packages/icons/build-module/library/heading-level-5.mjs
var heading_level_5_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M3.75 12H11.75M3.75 12V6M3.75 12L3.75 18M11.75 12V6M11.75 12V18",
		strokeLinecap: "square"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M15 17.2434C17.5 18.9138 20 17.5775 20 15.573C20 14.9823 19.7366 14.4158 19.2678 13.9982C18.7989 13.5805 18.163 13.3458 17.5 13.3458H15.25L15.75 9.5H19",
		strokeLinecap: "square"
	})]
});

// packages/icons/build-module/library/heading-level-6.mjs
var heading_level_6_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M3.75 12H11.75M3.75 12V6M3.75 12L3.75 18M11.75 12V6M11.75 12V18",
		strokeLinecap: "square"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M19.9209 9.40551C18.0547 8.41126 16.4435 9.38777 15.7499 10.7952C15.0563 12.2026 14.8576 13.7372 15.0969 15.4097C15.1739 15.948 15.3815 16.7573 15.8882 17.2424C16.3948 17.7275 17.082 18 17.7985 18C18.515 18 19.2021 17.7275 19.7087 17.2424C20.2154 16.7573 20.5 16.0994 20.5 15.4134C20.5 14.7273 20.2154 14.0729 19.7087 13.5878C19.2021 13.1027 18.5149 12.8302 17.7984 12.8302C17.0819 12.8302 16.3948 13.1027 15.8882 13.5878C15.3815 14.0729 15.0969 14.7273 15.0969 15.4133" })]
});

// packages/icons/build-module/library/heading.mjs
var heading_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, {
		d: "M6.75 5.25H17.25V16.375L12 12L6.75 16.375V5.25Z",
		fill: "currentColor"
	})
});

// packages/icons/build-module/library/link.mjs
var link_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M9.5 12L14.5 12M10 7.75H8.25C5.90279 7.75 4 9.65279 4 12C4 14.3472 5.90279 16.25 8.25 16.25H10M14 16.25H15.75C18.0972 16.25 20 14.3472 20 12C20 9.65279 18.0972 7.75 15.75 7.75L14 7.75" })
});

// packages/icons/build-module/library/seen.mjs
var seen_default = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M20.0645 13C18.5918 10.0366 15.5337 8 12 8C8.46631 8 5.40825 10.0366 3.93555 13" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Circle, {
		cx: "12",
		cy: "12.5",
		r: "3",
		fill: "currentColor"
	})]
});

// packages/ui/build-module/text/text.mjs
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
registerStyle$9("09bae534ff", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9745ffa515d864cf__text{text-wrap:pretty;margin:0}._8882b6a7feb4fd3d__heading-2xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-p-line-height:var(--wpds-typography-line-height-2xl,40px);font-size:var(--wpds-typography-font-size-2xl,32px);line-height:var(--wpds-typography-line-height-2xl,40px)}._664e3e7687c45603__heading-xl,._8882b6a7feb4fd3d__heading-2xl{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600)}._664e3e7687c45603__heading-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-md,24px)}.dac661a5de0ed2bd__heading-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-lg,15px)}._59c7f3f740e2f96e__heading-md,.dac661a5de0ed2bd__heading-lg{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-sm,20px)}._59c7f3f740e2f96e__heading-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px)}.cf052fbad8d93b7e__heading-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._212b9cfef57a0af4__body-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-xl,32px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-xl,32px)}._07f57bc0aa36b2c6__body-lg,._212b9cfef57a0af4__body-xl{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}._07f57bc0aa36b2c6__body-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-lg,15px);line-height:var(--wpds-typography-line-height-md,24px)}._0c6da4457aec9e62__body-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px)}._0c6da4457aec9e62__body-md,.b998f87ff17b7bec__body-sm{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}.b998f87ff17b7bec__body-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var style_module_default$8 = {
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
registerStyle$9("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
		props: mergeProps(props, { className: clsx(style_module_default$8.text, global_css_defense_module_default$1.heading, global_css_defense_module_default$1.p, style_module_default$8[variant], className) })
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
registerStyle$8("40df669685", "._9e7887c25dedb459__slot{inset:0;isolation:isolate;pointer-events:none;position:fixed;z-index:1000000003}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._9e7887c25dedb459__slot>*{pointer-events:auto}}}");
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
registerStyle$7("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default$2 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$7("aaf79ac691", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.b9266862d9435660__positioner{z-index:var(--wp-ui-tooltip-z-index,initial)}._7bb3fd8a0810be6d__popup{--_wp-ui-elevation-sm:0 1px 2px rgba(0,0,0,.05),0 2px 3px rgba(0,0,0,.04),0 6px 6px rgba(0,0,0,.03),0 8px 8px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-sm);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:1.4;padding:var(--wpds-dimension-padding-xs,4px) var(--wpds-dimension-padding-sm,8px);@media (forced-colors:active){border-bottom-color:CanvasText;border-bottom-style:solid;border-bottom-width:1px;border-left-color:CanvasText;border-left-style:solid;border-left-width:1px;border-right-color:CanvasText;border-right-style:solid;border-right-width:1px;border-top-color:CanvasText;border-top-style:solid;border-top-width:1px}}}}");
var style_module_default$7 = {
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
		className: clsx(resets_module_default$2["box-sizing"], style_module_default$7.positioner, className)
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
const { lock: lock$3, unlock: unlock$3 } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/ui");

// packages/ui/build-module/utils/theme-provider.mjs
var import_theme = /* @__PURE__ */ __toESM(require_theme(), 1);
function getThemeProvider() {
	const themePackage = import_theme;
	if (themePackage.ThemeProvider) return themePackage.ThemeProvider;
	if (!themePackage.privateApis) throw new Error("@wordpress/ui: @wordpress/theme must expose `ThemeProvider` or `privateApis.ThemeProvider`.");
	return unlock$3(themePackage.privateApis).ThemeProvider;
}
const ThemeProvider = getThemeProvider();

// packages/ui/build-module/tooltip/popup.mjs
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
registerStyle$6("aaf79ac691", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.b9266862d9435660__positioner{z-index:var(--wp-ui-tooltip-z-index,initial)}._7bb3fd8a0810be6d__popup{--_wp-ui-elevation-sm:0 1px 2px rgba(0,0,0,.05),0 2px 3px rgba(0,0,0,.04),0 6px 6px rgba(0,0,0,.03),0 8px 8px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-sm);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:1.4;padding:var(--wpds-dimension-padding-xs,4px) var(--wpds-dimension-padding-sm,8px);@media (forced-colors:active){border-bottom-color:CanvasText;border-bottom-style:solid;border-bottom-width:1px;border-left-color:CanvasText;border-left-style:solid;border-left-width:1px;border-right-color:CanvasText;border-right-style:solid;border-right-width:1px;border-top-color:CanvasText;border-top-style:solid;border-top-width:1px}}}}");
var style_module_default$6 = {
	"positioner": "b9266862d9435660__positioner",
	"popup": "_7bb3fd8a0810be6d__popup"
};
const POPUP_COLOR = { background: "#1e1e1e" };
const Popup = (0, import_element.forwardRef)(function TooltipPopup$1({ portal, positioner, children, className, ...props }, ref) {
	const popupContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, {
		color: POPUP_COLOR,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipPopup, {
			ref,
			className: clsx(style_module_default$6.popup, className),
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
function Root(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectionProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRoot, { ...props }) });
}

// packages/ui/build-module/link/link.mjs
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
var resets_module_default$1 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$5("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
var focus_module_default = {
	"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
	"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
	"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
	"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
	"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
};
registerStyle$5("c87d91cdf7", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.a574f9f242212d58__link{--_gcd-a-border-radius:var(--wpds-border-radius-sm,2px);border-radius:var(--wpds-border-radius-sm,2px);text-decoration-thickness:from-font;text-underline-offset:.2em}._2d2f0506e717a46c__link-with-icon{text-decoration-line:none}._92b7b6a03fbb27ac__link-contents{text-decoration:inherit;text-decoration-line:underline}._69f40d9212adc58d__is-brand,._69f40d9212adc58d__is-brand:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9))}._69f40d9212adc58d__is-brand:active,._69f40d9212adc58d__is-brand:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000))}._9a9c54c6e67b4c3c__is-neutral,._9a9c54c6e67b4c3c__is-neutral:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);text-decoration-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d)}._9a9c54c6e67b4c3c__is-neutral:active,._9a9c54c6e67b4c3c__is-neutral:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e)}._93be0b747897baad__is-unstyled{--_gcd-a-border-radius:0;--_gcd-a-color:inherit;color:inherit;text-decoration:none}._9c39df40fdc09594__link-icon{font-weight:var(--wpds-typography-font-weight-default,400);line-height:1;margin-inline-start:var(--wpds-dimension-padding-xs,4px);text-decoration:none}._9c39df40fdc09594__link-icon:after{content:\"\\2060\\2197\"}._9c39df40fdc09594__link-icon:dir(rtl):after{content:\"\\2060\\2196\"}}}");
var style_module_default$5 = {
	"link": "a574f9f242212d58__link",
	"link-with-icon": "_2d2f0506e717a46c__link-with-icon",
	"link-contents": "_92b7b6a03fbb27ac__link-contents",
	"is-brand": "_69f40d9212adc58d__is-brand",
	"is-neutral": "_9a9c54c6e67b4c3c__is-neutral",
	"is-unstyled": "_93be0b747897baad__is-unstyled",
	"link-icon": "_9c39df40fdc09594__link-icon"
};
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
			className: clsx(global_css_defense_module_default.a, resets_module_default$1["box-sizing"], focus_module_default["outset-ring--focus-except-active"], variant !== "unstyled" && style_module_default$5.link, variant !== "unstyled" && shouldShowNewTabIndicator && style_module_default$5["link-with-icon"], variant !== "unstyled" && style_module_default$5[`is-${tone}`], variant === "unstyled" && style_module_default$5["is-unstyled"], className),
			target: target ?? (openInNewTab ? "_blank" : void 0),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [shouldShowNewTabIndicator && variant !== "unstyled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: style_module_default$5["link-contents"],
				children
			}) : children, shouldShowNewTabIndicator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: style_module_default$5["link-icon"],
				role: "img",
				"aria-label": (0, import_i18n.__)("(opens in a new tab)")
			})] })
		})
	});
});

// packages/ui/build-module/stack/stack.mjs
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
registerStyle$4("67591fa198", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._8e8e79c1a2eec43b__stack{display:flex}}}");
var style_module_default$4 = { "stack": "_8e8e79c1a2eec43b__stack" };
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
			className: style_module_default$4.stack
		})
	});
});

// packages/ui/build-module/skeleton/skeleton.mjs
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
registerStyle$3("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$3("f990700b6a", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._556c49818c2e5de5__skeleton{background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);display:block;@media (forced-colors:active){border:var(--wpds-border-width-xs,1px) solid CanvasText}}._913f0b8e094f8386__pulse{@media not (prefers-reduced-motion){animation:d5b52a3750432acb__skeleton-pulse 1.5s ease-in-out infinite}}@keyframes d5b52a3750432acb__skeleton-pulse{0%,to{opacity:1}50%{opacity:.4}}}}");
var style_module_default$3 = {
	"skeleton": "_556c49818c2e5de5__skeleton",
	"pulse": "_913f0b8e094f8386__pulse",
	"skeleton-pulse": "d5b52a3750432acb__skeleton-pulse"
};
/**
* A placeholder shown while content is loading.
*
* Size and corner radius are controlled via standard `div` props such as
* `style` and `className`.
*/
const Skeleton = (0, import_element.forwardRef)(function UnforwardedSkeleton({ render, ...props }, ref) {
	return useRender({
		render,
		ref,
		props: mergeProps({
			className: clsx(style_module_default$3.skeleton, style_module_default$3.pulse, resets_module_default["box-sizing"]),
			"aria-hidden": true
		}, props)
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
registerStyle$2("73643ec0a7", ".c1e78b6d2e68225c__list{--focus-ring-size:calc(var(--wpds-border-width-focus, var(--wp-admin-border-width-focus, 2px))*2);list-style:none;margin:calc(var(--focus-ring-size)*-1);overflow-x:auto;padding:var(--focus-ring-size);scroll-padding:var(--focus-ring-size)}._3e14e8043696860f__li{flex-shrink:0}.e1422d0e8f9e67df__item{align-items:center;color:var(--wpds-color-foreground-interactive-neutral-weak,#707070);display:flex;font-weight:var(--wpds-typography-font-weight-default,400);min-block-size:44px;min-inline-size:44px;text-decoration:none}.e1422d0e8f9e67df__item:hover,.e1422d0e8f9e67df__item[aria-current=page]{color:var(--wpds-color-foreground-interactive-neutral-weak-active,#1e1e1e)}.e1422d0e8f9e67df__item[aria-current=page]{font-weight:var(--wpds-typography-font-weight-emphasis,600)}");
var style_module_default$2 = {
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
			className: style_module_default$2.list,
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: style_module_default$2.li,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					variant: "body-md",
					className: style_module_default$2.item,
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
registerStyle$1("603e22a829", ".a601da1d3e3fb3fd__page{text-wrap:pretty;background-color:var(--wpds-color-background-surface-neutral,#fcfcfc);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-flow:column;height:100%;position:relative;z-index:1}._04c95d85dee161fd__header{background:var(--wpds-color-background-surface-neutral-strong,#fff);border-block-end:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);inset-block-start:0;padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px);position:sticky;z-index:1}.bacecf0582e29643__header-content{min-height:var(--wpds-dimension-size-md,32px)}.a377058511394079__header-actions{flex-shrink:0}.dea03f8da2e8f042__header-lockup{min-width:0}._2361437ecf7e72e7__header-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._75a71e5e0a35e8f7__header-visual{display:grid;flex-shrink:0;grid-template-columns:1fr;grid-template-rows:1fr;height:var(--wpds-dimension-size-sm,24px);width:var(--wpds-dimension-size-sm,24px);>*{grid-column:1/-1;grid-row:1/-1;max-height:100%;max-width:100%}}.b810958ef8ab363b__sidebar-toggle-slot:empty{display:none}.eff378c474a49b83__header-subtitle{color:var(--wpds-color-foreground-content-neutral-weak,#707070);padding-block-end:var(--wpds-dimension-padding-xs,4px)}._04c95d85dee161fd__header._7e7496f8b3e1c468__has-navigation,._04c95d85dee161fd__header._7e7496f8b3e1c468__has-navigation .eff378c474a49b83__header-subtitle{padding-block-end:0}._214d54afaddbb8d5__header-navigation{margin-block-start:var(--wpds-dimension-gap-md,12px)}._4bcfbc76045751b8__content{display:flex;flex-direction:column;flex-grow:1;overflow:auto;&.cefc11b6ca36136d__has-padding{padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px)}}");
var style_module_default$1 = {
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
		className: clsx(style_module_default$1.header, hasNavigation && style_module_default$1["has-navigation"]),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
				className: style_module_default$1["header-content"],
				direction: "row",
				gap: "sm",
				justify: "space-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
					direction: "row",
					gap: "sm",
					align: "center",
					justify: "start",
					className: style_module_default$1["header-lockup"],
					children: [
						showSidebarToggle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarToggleSlot, {
							bubblesVirtually: true,
							className: style_module_default$1["sidebar-toggle-slot"]
						}),
						visual && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: style_module_default$1["header-visual"],
							"aria-hidden": "true",
							children: visual
						}),
						title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
							className: style_module_default$1["header-title"],
							render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadingTag, {}),
							variant: "heading-lg",
							children: title
						}),
						breadcrumbs,
						badges
					]
				}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
					align: "center",
					className: style_module_default$1["header-actions"],
					direction: "row",
					gap: "sm",
					children: actions
				})]
			}),
			subTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {}),
				variant: "body-md",
				className: style_module_default$1["header-subtitle"],
				children: subTitle
			}),
			hasNavigation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {
				...navigation,
				linkComponent: components?.link,
				className: style_module_default$1["header-navigation"]
			})
		]
	});
}

// packages/admin-ui/build-module/page/index.mjs
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
registerStyle("603e22a829", ".a601da1d3e3fb3fd__page{text-wrap:pretty;background-color:var(--wpds-color-background-surface-neutral,#fcfcfc);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-flow:column;height:100%;position:relative;z-index:1}._04c95d85dee161fd__header{background:var(--wpds-color-background-surface-neutral-strong,#fff);border-block-end:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);inset-block-start:0;padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px);position:sticky;z-index:1}.bacecf0582e29643__header-content{min-height:var(--wpds-dimension-size-md,32px)}.a377058511394079__header-actions{flex-shrink:0}.dea03f8da2e8f042__header-lockup{min-width:0}._2361437ecf7e72e7__header-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._75a71e5e0a35e8f7__header-visual{display:grid;flex-shrink:0;grid-template-columns:1fr;grid-template-rows:1fr;height:var(--wpds-dimension-size-sm,24px);width:var(--wpds-dimension-size-sm,24px);>*{grid-column:1/-1;grid-row:1/-1;max-height:100%;max-width:100%}}.b810958ef8ab363b__sidebar-toggle-slot:empty{display:none}.eff378c474a49b83__header-subtitle{color:var(--wpds-color-foreground-content-neutral-weak,#707070);padding-block-end:var(--wpds-dimension-padding-xs,4px)}._04c95d85dee161fd__header._7e7496f8b3e1c468__has-navigation,._04c95d85dee161fd__header._7e7496f8b3e1c468__has-navigation .eff378c474a49b83__header-subtitle{padding-block-end:0}._214d54afaddbb8d5__header-navigation{margin-block-start:var(--wpds-dimension-gap-md,12px)}._4bcfbc76045751b8__content{display:flex;flex-direction:column;flex-grow:1;overflow:auto;&.cefc11b6ca36136d__has-padding{padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px)}}");
var style_module_default = {
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
	const classes = clsx(style_module_default.page, className);
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
			className: clsx(style_module_default.content, style_module_default["has-padding"]),
			children
		}) : children]
	});
}
Page.SidebarToggleFill = SidebarToggleFill;

// \0wp-global:@wordpress/block-editor
var require_block_editor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blockEditor;
}));

// \0wp-global:@wordpress/editor
var require_editor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.editor;
}));

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

// routes/lock-unlock/index.ts
var import_compose = require_compose();
var import_block_editor = require_block_editor();
var import_editor = require_editor();
var import_data = require_data();
var import_core_data = require_core_data();
var import_html_entities = require_html_entities();
const { lock: lock$2, unlock: unlock$2 } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/routes");

// \0wp-global:@wordpress/api-fetch
var require_api_fetch = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.apiFetch;
}));

// \0wp-global:@wordpress/url
var require_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.url;
}));

// routes/styles/previewed-theme.ts
var import_api_fetch = /* @__PURE__ */ __toESM(require_api_fetch());
var import_url = require_url();
const previewedStylesheet = (() => {
	const value = (0, import_url.getQueryArg)(window.location.href, "wp_theme_preview");
	return typeof value === "string" ? value : "";
})();
function getPreviewedStylesheet() {
	return previewedStylesheet;
}
/**
* Formats the screen title for a previewed theme.
*
* @param themeName The previewed theme's decoded name, when known.
*/
function getPreviewTitle(themeName) {
	return themeName ? (0, import_i18n.sprintf)((0, import_i18n.__)("Previewing %s"), themeName) : (0, import_i18n.__)("Theme Preview");
}

// routes/styles/activate-panel.tsx
const { EntitiesSavedStatesExtensible, useEntitiesSavedStatesIsDirty } = unlock$2(import_core_data.privateApis);
const ACTIVE_THEMES_URL = "/wp/v2/themes?status=active";
/**
* The actually active theme: an empty `wp_theme_preview` makes Core's
* middleware strip the parameter, so the endpoint reports the real active
* theme rather than the previewed one.
*/
function useActualCurrentTheme() {
	const [currentTheme, setCurrentTheme] = (0, import_element.useState)();
	(0, import_element.useEffect)(() => {
		const path = (0, import_url.addQueryArgs)(ACTIVE_THEMES_URL, {
			context: "edit",
			wp_theme_preview: ""
		});
		(0, import_api_fetch.default)({ path }).then((activeThemes) => setCurrentTheme(activeThemes[0])).catch(() => {});
	}, []);
	return currentTheme;
}
/**
* Activates a theme through the classic themes screen action (there is no
* REST endpoint for it). Core redirects to the themes screen, which
* announces the activation.
*/
function activateTheme(stylesheet) {
	window.location.href = (0, import_url.addQueryArgs)("themes.php", {
		action: "activate",
		stylesheet,
		_wpnonce: window.WP_BLOCK_THEME_ACTIVATE_NONCE
	});
}
/**
* The review-and-activate panel: the same flow as site editor v1's theme
* preview, where activating saves any pending edits — global styles changes
* included — against the previewed theme first, then switches to it.
*/
function ActivatePanel({ themeName, onClose }) {
	const isDirtyProps = useEntitiesSavedStatesIsDirty();
	let activateSaveLabel, successNoticeContent;
	if (isDirtyProps.isDirty) {
		activateSaveLabel = (0, import_i18n.__)("Activate & Save");
		successNoticeContent = (0, import_i18n.__)("Theme activated and site updated.");
	} else {
		activateSaveLabel = (0, import_i18n.__)("Activate");
		successNoticeContent = (0, import_i18n.__)("Theme activated.");
	}
	const currentTheme = useActualCurrentTheme();
	const additionalPrompt = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: (0, import_i18n.sprintf)((0, import_i18n.__)("Saving your changes will change your active theme from %1$s to %2$s."), currentTheme?.name?.rendered ?? "...", themeName ?? "...") });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntitiesSavedStatesExtensible, {
		...isDirtyProps,
		additionalPrompt,
		close: onClose,
		onSave: () => activateTheme(getPreviewedStylesheet()),
		saveEnabled: true,
		saveLabel: activateSaveLabel,
		variant: "inline",
		successNoticeContent
	});
}

// routes/styles/style.scss
if (typeof document !== "undefined" && !document.head.querySelector("style[data-wp-hash='f4ae13b25a']")) {
	const style = document.createElement("style");
	style.setAttribute("data-wp-hash", "f4ae13b25a");
	style.appendChild(document.createTextNode(".routes-styles__page .global-styles-ui-screen-root{box-shadow:none}.routes-styles__page .global-styles-ui-screen-root>div>hr{display:none}.routes-styles__page .global-styles-ui-sidebar__navigator-provider .components-tools-panel{border-top:none}.routes-styles__page .global-styles-ui-sidebar__navigator-provider{overflow-y:auto;padding-inline:0}.routes-styles__content{background-color:var(--wpds-color-background-surface-neutral-strong,#fff);flex-grow:1;min-height:0}"));
	document.head.appendChild(style);
}

// routes/styles/stage.tsx
const { GlobalStylesUIWrapper, GlobalStylesActionMenu } = unlock$2(import_editor.privateApis);
const { ToolsPanelPopoverPropsContext } = unlock$2(import_block_editor.privateApis);
const TOOLS_PANEL_POPOVER_PROPS = {
	dropdown: {
		placement: "right-start",
		offset: 32
	},
	item: {
		placement: "right-start",
		offset: 32,
		shift: true
	}
};
function Stage() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false });
	const isMobileViewport = (0, import_compose.useViewportMatch)("medium", "<");
	const isPreviewingTheme = !!getPreviewedStylesheet();
	const [isActivatePanelOpen, setIsActivatePanelOpen] = (0, import_element.useState)(false);
	const { globalStylesId, hasRevisions, themeName } = (0, import_data.useSelect)((select) => {
		const { getCurrentTheme, getEntityRecord, __experimentalGetCurrentGlobalStylesId } = select(import_core_data.store);
		const themeNameRendered = isPreviewingTheme ? getCurrentTheme()?.name?.rendered : void 0;
		const _globalStylesId = __experimentalGetCurrentGlobalStylesId();
		return {
			globalStylesId: _globalStylesId,
			hasRevisions: !!(_globalStylesId ? getEntityRecord("root", "globalStyles", _globalStylesId) : void 0)?._links?.["version-history"]?.[0]?.count,
			themeName: themeNameRendered ? (0, import_html_entities.decodeEntities)(themeNameRendered) : void 0
		};
	}, [isPreviewingTheme]);
	const { editorSettings } = useEditorSettings({ stylesId: globalStylesId });
	const section = search.section ?? "/";
	const areRevisionsOpened = section.startsWith("/revisions");
	const { setStylesPath } = unlock$2((0, import_data.useDispatch)(import_editor.store));
	(0, import_element.useEffect)(() => {
		if (!areRevisionsOpened) return;
		setStylesPath(section);
		return () => setStylesPath("/");
	}, [
		areRevisionsOpened,
		section,
		setStylesPath
	]);
	const [isStyleBookOpened, setIsStyleBookOpened] = (0, import_element.useState)(search.preview === "stylebook");
	const onChangeSection = (updatedSection) => {
		navigate({ search: {
			...search,
			section: updatedSection
		} });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, {
		headingLevel: 2,
		actions: !isMobileViewport || isPreviewingTheme ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, { children: [!isMobileViewport && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
				size: "compact",
				isPressed: isStyleBookOpened,
				icon: seen_default,
				label: (0, import_i18n.__)("Style Book"),
				onClick: () => {
					const newIsStyleBookOpened = !isStyleBookOpened;
					setIsStyleBookOpened(newIsStyleBookOpened);
					navigate({ search: newIsStyleBookOpened ? {
						...search,
						preview: "stylebook"
					} : (() => {
						const { preview, ...restSearch } = search;
						return restSearch;
					})() });
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
				size: "compact",
				isPressed: areRevisionsOpened,
				icon: backup_default,
				label: (0, import_i18n.__)("Revisions"),
				accessibleWhenDisabled: true,
				disabled: !hasRevisions,
				onClick: () => onChangeSection(areRevisionsOpened ? "/" : "/revisions")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalStylesActionMenu, {
				hideWelcomeGuide: true,
				onChangePath: onChangeSection
			})
		] }), isPreviewingTheme && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
			size: "compact",
			variant: "primary",
			onClick: () => setIsActivatePanelOpen(true),
			children: (0, import_i18n.__)("Activate")
		})] }) : null,
		className: "routes-styles__page",
		title: isPreviewingTheme ? getPreviewTitle(themeName) : (0, import_i18n.__)("Styles"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "routes-styles__content",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolsPanelPopoverPropsContext.Provider, {
				value: TOOLS_PANEL_POPOVER_PROPS,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalStylesUIWrapper, {
					path: section,
					onPathChange: onChangeSection,
					settings: editorSettings
				})
			})
		}), isActivatePanelOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Modal, {
			title: (0, import_i18n.__)("Activate"),
			onRequestClose: () => setIsActivatePanelOpen(false),
			size: "small",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivatePanel, {
				themeName,
				onClose: () => setIsActivatePanelOpen(false)
			})
		})]
	});
}
const stage = Stage;

// \0wp-global:@wordpress/blocks
var require_blocks = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blocks;
}));

// packages/global-styles-engine/build-module/utils/object.mjs
/**
* Immutably sets a value inside an object. Like `lodash#set`, but returning a
* new object. Treats nullish initial values as empty objects. Clones any
* nested objects. Supports arrays, too.
*
* @param object Object to set a value in.
* @param path   Path in the object to modify.
* @param value  New value to set.
* @return Cloned object with the new value set.
*/
function setImmutably(object, path, value) {
	path = Array.isArray(path) ? [...path] : [path];
	object = Array.isArray(object) ? [...object] : { ...object };
	const leaf = path.pop();
	let prev = object;
	for (const key of path) {
		const lvl = prev[key];
		prev = prev[key] = Array.isArray(lvl) ? [...lvl] : { ...lvl };
	}
	prev[leaf] = value;
	return object;
}
/**
* Helper util to return a value from a certain path of the object.
*
* Path is specified as either:
* - a string of properties, separated by dots, for example: "x.y".
* - an array of properties, for example `[ 'x', 'y' ]`.
*
* You can also specify a default value in case the result is nullish.
*
* @param object       Input object.
* @param path         Path to the object property.
* @param defaultValue Default value if the value at the specified path is nullish.
* @return Value of the object property at the specified path.
*/
const getValueFromObjectPath = (object, path, defaultValue) => {
	const arrayPath = Array.isArray(path) ? path : path.split(".");
	let value = object;
	arrayPath.forEach((fieldName) => {
		value = value?.[fieldName];
	});
	return value ?? defaultValue;
};

// packages/global-styles-engine/build-module/settings/get-setting.mjs
const VALID_SETTINGS = [
	"appearanceTools",
	"useRootPaddingAwareAlignments",
	"background.backgroundClip",
	"background.backgroundImage",
	"background.backgroundRepeat",
	"background.backgroundSize",
	"background.backgroundPosition",
	"background.gradient",
	"border.color",
	"border.radius",
	"border.radiusSizes",
	"border.style",
	"border.width",
	"shadow.presets",
	"shadow.defaultPresets",
	"color.background",
	"color.button",
	"color.caption",
	"color.custom",
	"color.customDuotone",
	"color.customGradient",
	"color.defaultDuotone",
	"color.defaultGradients",
	"color.defaultPalette",
	"color.duotone",
	"color.gradients",
	"color.heading",
	"color.link",
	"color.palette",
	"color.text",
	"custom",
	"dimensions.aspectRatio",
	"dimensions.height",
	"dimensions.minHeight",
	"dimensions.minWidth",
	"dimensions.width",
	"dimensions.dimensionSizes",
	"layout.contentSize",
	"layout.definitions",
	"layout.wideSize",
	"lightbox.enabled",
	"lightbox.allowEditing",
	"position.fixed",
	"position.sticky",
	"spacing.customSpacingSize",
	"spacing.defaultSpacingSizes",
	"spacing.spacingSizes",
	"spacing.spacingScale",
	"spacing.blockGap",
	"spacing.margin",
	"spacing.padding",
	"spacing.units",
	"typography.fluid",
	"typography.customFontSize",
	"typography.defaultFontSizes",
	"typography.dropCap",
	"typography.fontFamilies",
	"typography.fontSizes",
	"typography.fontStyle",
	"typography.fontWeight",
	"typography.letterSpacing",
	"typography.lineHeight",
	"typography.textAlign",
	"typography.textColumns",
	"typography.textDecoration",
	"typography.textIndent",
	"typography.textShadow",
	"typography.defaultTextShadowPresets",
	"typography.textShadowPresets",
	"typography.textTransform",
	"typography.writingMode",
	"viewport.mobile",
	"viewport.tablet"
];
function getSetting(globalStyles, path, blockName) {
	const appendedBlockPath = blockName ? ".blocks." + blockName : "";
	const appendedPropertyPath = path ? "." + path : "";
	const contextualPath = `settings${appendedBlockPath}${appendedPropertyPath}`;
	const globalPath = `settings${appendedPropertyPath}`;
	if (path) return getValueFromObjectPath(globalStyles, contextualPath) ?? getValueFromObjectPath(globalStyles, globalPath);
	let result = {};
	VALID_SETTINGS.forEach((setting) => {
		const value = getValueFromObjectPath(globalStyles, `settings${appendedBlockPath}.${setting}`) ?? getValueFromObjectPath(globalStyles, `settings.${setting}`);
		if (value !== void 0) result = setImmutably(result, setting.split("."), value);
	});
	return result;
}

// packages/global-styles-engine/build-module/settings/set-setting.mjs
function setSetting(globalStyles, path, newValue, blockName) {
	const finalPath = `settings${blockName ? ".blocks." + blockName : ""}${path ? "." + path : ""}`;
	return setImmutably(globalStyles, finalPath.split("."), newValue);
}

// \0wp-global:@wordpress/style-engine
var require_style_engine = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.styleEngine;
}));

// packages/global-styles-engine/build-module/utils/fluid.mjs
/**
* The fluid utilities must match the backend equivalent.
* See: gutenberg_get_typography_font_size_value() in lib/block-supports/typography.php
* ---------------------------------------------------------------
*/
const DEFAULT_MAXIMUM_VIEWPORT_WIDTH = "1600px";
const DEFAULT_MINIMUM_VIEWPORT_WIDTH = "320px";
const DEFAULT_SCALE_FACTOR = 1;
const DEFAULT_MINIMUM_FONT_SIZE_FACTOR_MIN = .25;
const DEFAULT_MINIMUM_FONT_SIZE_FACTOR_MAX = .75;
const DEFAULT_MINIMUM_FONT_SIZE_LIMIT = "14px";
/**
* Computes a fluid font-size value that uses clamp(). A minimum and maximum
* font size OR a single font size can be specified.
*
* If a single font size is specified, it is scaled up and down using a logarithmic scale.
*
* @example
* ```js
* // Calculate fluid font-size value from a minimum and maximum value.
* const fontSize = getComputedFluidTypographyValue( {
*     minimumFontSize: '20px',
*     maximumFontSize: '45px'
* } );
* // Calculate fluid font-size value from a single font size.
* const fontSize = getComputedFluidTypographyValue( {
*     fontSize: '30px',
* } );
* ```
*
* @param {Object}        args
* @param {?string}       args.minimumViewportWidth Minimum viewport size from which type will have fluidity. Optional if fontSize is specified.
* @param {?string}       args.maximumViewportWidth Maximum size up to which type will have fluidity. Optional if fontSize is specified.
* @param {string|number} [args.fontSize]           Size to derive maximumFontSize and minimumFontSize from, if necessary. Optional if minimumFontSize and maximumFontSize are specified.
* @param {?string}       args.maximumFontSize      Maximum font size for any clamp() calculation. Optional.
* @param {?string}       args.minimumFontSize      Minimum font size for any clamp() calculation. Optional.
* @param {?number}       args.scaleFactor          A scale factor to determine how fast a font scales within boundaries. Optional.
* @param {?string}       args.minimumFontSizeLimit The smallest a calculated font size may be. Optional.
*
* @return {string|null} A font-size value using clamp().
*/
function getComputedFluidTypographyValue$1({ minimumFontSize, maximumFontSize, fontSize, minimumViewportWidth = DEFAULT_MINIMUM_VIEWPORT_WIDTH, maximumViewportWidth = DEFAULT_MAXIMUM_VIEWPORT_WIDTH, scaleFactor = DEFAULT_SCALE_FACTOR, minimumFontSizeLimit }) {
	minimumFontSizeLimit = !!getTypographyValueAndUnit(minimumFontSizeLimit) ? minimumFontSizeLimit : DEFAULT_MINIMUM_FONT_SIZE_LIMIT;
	if (fontSize) {
		const fontSizeParsed = getTypographyValueAndUnit(fontSize);
		if (!fontSizeParsed?.unit || !fontSizeParsed?.value) return null;
		const minimumFontSizeLimitParsed = getTypographyValueAndUnit(minimumFontSizeLimit, { coerceTo: fontSizeParsed.unit });
		if (!!minimumFontSizeLimitParsed?.value && !minimumFontSize && !maximumFontSize) {
			if (fontSizeParsed?.value <= minimumFontSizeLimitParsed?.value) return null;
		}
		if (!maximumFontSize) maximumFontSize = `${fontSizeParsed.value}${fontSizeParsed.unit}`;
		if (!minimumFontSize) {
			const fontSizeValueInPx = fontSizeParsed.unit === "px" ? fontSizeParsed.value : fontSizeParsed.value * 16;
			const minimumFontSizeFactor = Math.min(Math.max(1 - .075 * Math.log2(fontSizeValueInPx), DEFAULT_MINIMUM_FONT_SIZE_FACTOR_MIN), DEFAULT_MINIMUM_FONT_SIZE_FACTOR_MAX);
			const calculatedMinimumFontSize = roundToPrecision(fontSizeParsed.value * minimumFontSizeFactor, 3);
			if (!!minimumFontSizeLimitParsed?.value && calculatedMinimumFontSize < minimumFontSizeLimitParsed?.value) minimumFontSize = `${minimumFontSizeLimitParsed.value}${minimumFontSizeLimitParsed.unit}`;
			else minimumFontSize = `${calculatedMinimumFontSize}${fontSizeParsed.unit}`;
		}
	}
	const minimumFontSizeParsed = getTypographyValueAndUnit(minimumFontSize);
	const fontSizeUnit = minimumFontSizeParsed?.unit || "rem";
	const maximumFontSizeParsed = getTypographyValueAndUnit(maximumFontSize, { coerceTo: fontSizeUnit });
	if (!minimumFontSizeParsed || !maximumFontSizeParsed) return null;
	const minimumFontSizeRem = getTypographyValueAndUnit(minimumFontSize, { coerceTo: "rem" });
	const maximumViewportWidthParsed = getTypographyValueAndUnit(maximumViewportWidth, { coerceTo: fontSizeUnit });
	const minimumViewportWidthParsed = getTypographyValueAndUnit(minimumViewportWidth, { coerceTo: fontSizeUnit });
	if (!maximumViewportWidthParsed || !minimumViewportWidthParsed || !minimumFontSizeRem) return null;
	const linearDenominator = maximumViewportWidthParsed.value - minimumViewportWidthParsed.value;
	if (!linearDenominator) return null;
	const viewportWidthOffset = roundToPrecision(roundToPrecision(minimumViewportWidthParsed.value / 100, 3), 3) + fontSizeUnit;
	const linearFactorScaled = roundToPrecision((100 * ((maximumFontSizeParsed.value - minimumFontSizeParsed.value) / linearDenominator) || 1) * scaleFactor, 3);
	const fluidTargetFontSize = `${minimumFontSizeRem.value}${minimumFontSizeRem.unit} + ((1vw - ${viewportWidthOffset}) * ${linearFactorScaled})`;
	return `clamp(${minimumFontSize}, ${fluidTargetFontSize}, ${maximumFontSize})`;
}
/**
* Internal method that checks a string for a unit and value and returns an array consisting of `'value'` and `'unit'`, e.g., [ '42', 'rem' ].
* A raw font size of `value + unit` is expected. If the value is an integer, it will convert to `value + 'px'`.
*
* @param rawValue Raw size value from theme.json.
* @param options  Calculation options.
*
* @return An object consisting of `'value'` and `'unit'` properties.
*/
function getTypographyValueAndUnit(rawValue, options = {}) {
	if (typeof rawValue !== "string" && typeof rawValue !== "number") return null;
	if (isFinite(rawValue)) rawValue = `${rawValue}px`;
	const { coerceTo, rootSizeValue, acceptableUnits } = {
		coerceTo: "",
		rootSizeValue: 16,
		acceptableUnits: [
			"rem",
			"px",
			"em"
		],
		...options
	};
	const acceptableUnitsGroup = acceptableUnits?.join("|");
	const regexUnits = new RegExp(`^(\\d*\\.?\\d+)(${acceptableUnitsGroup}){1,1}$`);
	const matches = rawValue.toString().match(regexUnits);
	if (!matches || matches.length < 3) return null;
	let [, value, unit] = matches;
	let returnValue = parseFloat(value);
	if ("px" === coerceTo && ("em" === unit || "rem" === unit)) {
		returnValue = returnValue * rootSizeValue;
		unit = coerceTo;
	}
	if ("px" === unit && ("em" === coerceTo || "rem" === coerceTo)) {
		returnValue = returnValue / rootSizeValue;
		unit = coerceTo;
	}
	if (("em" === coerceTo || "rem" === coerceTo) && ("em" === unit || "rem" === unit)) unit = coerceTo;
	if (!unit) return null;
	return {
		value: roundToPrecision(returnValue, 3),
		unit
	};
}
/**
* Returns a value rounded to defined precision.
* Returns `undefined` if the value is not a valid finite number.
*
* @param value  Raw value.
* @param digits The number of digits to appear after the decimal point
*
* @return Value rounded to standard precision.
*/
function roundToPrecision(value, digits = 3) {
	const base = Math.pow(10, digits);
	return Math.round(value * base) / base;
}

// packages/global-styles-engine/build-module/utils/typography.mjs
/**
* Checks if fluid typography is enabled in the given typography settings.
*
* Fluid typography is considered enabled if the fluid setting is explicitly set to true,
* or if it's an object with properties (which would contain fluid typography configuration
* like minViewportWidth, maxViewportWidth, etc.).
*
* @param typographySettings       Typography settings object that may contain fluid typography configuration.
* @param typographySettings.fluid Fluid typography configuration. Can be:
*                                 - `true` to enable with default settings
*                                 - An object with fluid settings (minViewportWidth, maxViewportWidth, etc.)
*                                 - `false` or `undefined` to disable
*
* @return True if fluid typography is enabled, false otherwise.
*/
function isFluidTypographyEnabled(typographySettings) {
	const fluidSettings = typographySettings?.fluid;
	return true === fluidSettings || fluidSettings && typeof fluidSettings === "object" && Object.keys(fluidSettings).length > 0;
}
/**
* Returns fluid typography settings from theme.json setting object.
*
* @param settings            Theme.json settings
* @param settings.typography Theme.json typography settings
* @param settings.layout     Theme.json layout settings
* @return Fluid typography settings
*/
function getFluidTypographyOptionsFromSettings(settings) {
	const typographySettings = settings?.typography ?? {};
	const layoutSettings = settings?.layout;
	const defaultMaxViewportWidth = getTypographyValueAndUnit(layoutSettings?.wideSize) ? layoutSettings?.wideSize : null;
	return isFluidTypographyEnabled(typographySettings) && defaultMaxViewportWidth ? { fluid: {
		maxViewportWidth: defaultMaxViewportWidth,
		...typeof typographySettings.fluid === "object" ? typographySettings.fluid : {}
	} } : { fluid: typographySettings?.fluid };
}
/**
* Returns a font-size value based on a given font-size preset.
* Takes into account fluid typography parameters and attempts to return a css formula depending on available, valid values.
*
* The Core PHP equivalent is wp_get_typography_font_size_value().
*
* @param preset   A typography preset object containing size and fluid properties.
* @param settings Global styles settings object containing typography and layout settings.
*
* @return A font-size value or the value of preset.size.
*/
function getTypographyFontSizeValue(preset, settings) {
	const { size: defaultSize } = preset;
	if (!defaultSize || "0" === defaultSize || false === preset?.fluid) return defaultSize;
	if (!isFluidTypographyEnabled(settings?.typography) && !isFluidTypographyEnabled(preset)) return defaultSize;
	const fluidTypographySettings = getFluidTypographyOptionsFromSettings(settings)?.fluid ?? {};
	const fluidFontSizeValue = getComputedFluidTypographyValue$1({
		minimumFontSize: typeof preset?.fluid === "boolean" ? void 0 : preset?.fluid?.min,
		maximumFontSize: typeof preset?.fluid === "boolean" ? void 0 : preset?.fluid?.max,
		fontSize: defaultSize,
		minimumFontSizeLimit: typeof fluidTypographySettings === "object" ? fluidTypographySettings?.minFontSize : void 0,
		maximumViewportWidth: typeof fluidTypographySettings === "object" ? fluidTypographySettings?.maxViewportWidth : void 0,
		minimumViewportWidth: typeof fluidTypographySettings === "object" ? fluidTypographySettings?.minViewportWidth : void 0
	});
	if (!!fluidFontSizeValue) return fluidFontSizeValue;
	return defaultSize;
}

// packages/global-styles-engine/build-module/utils/common.mjs
var import_style_engine = require_style_engine();
const ROOT_BLOCK_SELECTOR = "body";
const ROOT_CSS_PROPERTIES_SELECTOR = ":root";
function splitSelectorList(selector) {
	if (!selector.includes(",")) return [selector];
	const selectors = [];
	let currentSelector = "";
	let parenthesesDepth = 0;
	for (const char of selector) {
		if (char === "(") parenthesesDepth++;
		else if (char === ")" && parenthesesDepth > 0) parenthesesDepth--;
		else if (char === "," && parenthesesDepth === 0) {
			selectors.push(currentSelector);
			currentSelector = "";
			continue;
		}
		currentSelector += char;
	}
	selectors.push(currentSelector);
	return selectors;
}
const PRESET_METADATA = [
	{
		path: ["color", "palette"],
		valueKey: "color",
		cssVarInfix: "color",
		classes: [
			{
				classSuffix: "color",
				propertyName: "color"
			},
			{
				classSuffix: "background-color",
				propertyName: "background-color"
			},
			{
				classSuffix: "border-color",
				propertyName: "border-color"
			}
		]
	},
	{
		path: ["color", "gradients"],
		valueKey: "gradient",
		cssVarInfix: "gradient",
		classes: [{
			classSuffix: "gradient-background",
			propertyName: "background"
		}]
	},
	{
		path: ["color", "duotone"],
		valueKey: "colors",
		cssVarInfix: "duotone",
		valueFunc: ({ slug }) => `url( '#wp-duotone-${slug}' )`,
		classes: []
	},
	{
		path: ["shadow", "presets"],
		valueKey: "shadow",
		cssVarInfix: "shadow",
		classes: []
	},
	{
		path: ["typography", "fontSizes"],
		valueFunc: (preset, settings) => getTypographyFontSizeValue(preset, settings),
		valueKey: "size",
		cssVarInfix: "font-size",
		classes: [{
			classSuffix: "font-size",
			propertyName: "font-size"
		}]
	},
	{
		path: ["typography", "fontFamilies"],
		valueKey: "fontFamily",
		cssVarInfix: "font-family",
		classes: [{
			classSuffix: "font-family",
			propertyName: "font-family"
		}]
	},
	{
		path: ["typography", "textShadowPresets"],
		valueKey: "textShadow",
		cssVarInfix: "text-shadow",
		classes: [{
			classSuffix: "text-shadow",
			propertyName: "text-shadow"
		}]
	},
	{
		path: ["spacing", "spacingSizes"],
		valueKey: "size",
		cssVarInfix: "spacing",
		valueFunc: ({ size }) => size,
		classes: []
	},
	{
		path: ["border", "radiusSizes"],
		valueKey: "size",
		cssVarInfix: "border-radius",
		classes: []
	},
	{
		path: ["dimensions", "dimensionSizes"],
		valueKey: "size",
		cssVarInfix: "dimension",
		classes: []
	}
];
/**
* Function that scopes a selector with another one. This works a bit like
* SCSS nesting except the `&` operator isn't supported.
*
* @example
* ```js
* const scope = '.a, .b .c';
* const selector = '> .x, .y';
* const merged = scopeSelector( scope, selector );
* // merged is '.a > .x, .a .y, .b .c > .x, .b .c .y'
* ```
*
* @param scope    Selector to scope to.
* @param selector Original selector.
*
* @return Scoped selector.
*/
function scopeSelector(scope, selector) {
	if (!scope || !selector) return selector;
	const scopes = splitSelectorList(scope);
	const selectors = splitSelectorList(selector);
	const selectorsScoped = [];
	scopes.forEach((outer) => {
		selectors.forEach((inner) => {
			selectorsScoped.push(`${outer.trim()} ${inner.trim()}`);
		});
	});
	return selectorsScoped.join(", ");
}
/**
* Scopes a collection of selectors for features and subfeatures.
*
* @example
* ```js
* const scope = '.custom-scope';
* const selectors = {
*     color: '.wp-my-block p',
*     typography: { fontSize: '.wp-my-block caption' },
* };
* const result = scopeFeatureSelector( scope, selectors );
* // result is {
* //     color: '.custom-scope .wp-my-block p',
* //     typography: { fonSize: '.custom-scope .wp-my-block caption' },
* // }
* ```
*
* @param scope     Selector to scope collection of selectors with.
* @param selectors Collection of feature selectors e.g.
*
* @return Scoped collection of feature selectors.
*/
function scopeFeatureSelectors(scope, selectors) {
	if (!scope || !selectors) return;
	const featureSelectors = {};
	Object.entries(selectors).forEach(([feature, selector]) => {
		if (typeof selector === "string") featureSelectors[feature] = scopeSelector(scope, selector);
		if (typeof selector === "object") {
			featureSelectors[feature] = {};
			Object.entries(selector).forEach(([subfeature, subfeatureSelector]) => {
				featureSelectors[feature][subfeature] = scopeSelector(scope, subfeatureSelector);
			});
		}
	});
	return featureSelectors;
}
/**
* Appends a sub-selector to an existing one.
*
* Given the compounded `selector` "h1, h2, h3"
* and the `toAppend` selector ".some-class" the result will be
* "h1.some-class, h2.some-class, h3.some-class".
*
* @param selector Original selector.
* @param toAppend Selector to append.
*
* @return The new selector.
*/
function appendToSelector(selector, toAppend) {
	if (!selector.includes(",")) return selector + toAppend;
	return splitSelectorList(selector).map((sel) => sel + toAppend).join(",");
}
/**
* Generates the selector for a block style variation by creating the
* appropriate CSS class and adding it to the ancestor portion of the block's
* selector.
*
* For example, take the Button block which has a compound selector:
* `.wp-block-button .wp-block-button__link`. With a variation named 'custom',
* the class `.is-style-custom` should be added to the `.wp-block-button`
* ancestor only.
*
* This function will take into account comma separated and complex selectors.
*
* @param variation     Name for the variation.
* @param blockSelector CSS selector for the block.
*
* @return CSS selector for the block style variation.
*/
function getBlockStyleVariationSelector(variation, blockSelector) {
	const variationClass = `.is-style-${variation}`;
	if (!blockSelector) return variationClass;
	const ancestorRegex = /[^\s:]+/;
	const addVariationClass = (match) => match + variationClass;
	return splitSelectorList(blockSelector).map((part) => part.replace(ancestorRegex, addVariationClass)).join(",");
}
/**
* Generates the selector for a block style variation feature selector.
*
* Feature selectors can target a different element than the block root
* selector. Apply the variation class directly to the selector that receives
* the declarations instead of deriving it from the block root selector.
*
* @param variation       Name for the variation.
* @param featureSelector CSS selector for the feature.
*
* @return CSS selector for the block style variation feature.
*/
function getBlockStyleVariationFeatureSelector(variation, featureSelector) {
	const variationClass = `.is-style-${variation}`;
	return getBlockStyleVariationSelector(variation, splitSelectorList(featureSelector).map((selector) => {
		const trimmedSelector = selector.trim();
		const prefix = `${variationClass} `;
		if (trimmedSelector.startsWith(prefix)) return trimmedSelector.slice(prefix.length);
		return trimmedSelector;
	}).join(","));
}
/**
* Resolves ref values in theme JSON.
*
* @param ruleValue A block style value that may contain a reference to a theme.json value.
* @param tree      A theme.json object.
* @return The resolved value or incoming ruleValue.
*/
function getResolvedRefValue(ruleValue, tree) {
	if (!ruleValue || !tree) return ruleValue;
	if (typeof ruleValue === "object" && "ref" in ruleValue && ruleValue?.ref) {
		const resolvedRuleValue = (0, import_style_engine.getCSSValueFromRawStyle)(getValueFromObjectPath(tree, ruleValue.ref));
		if (typeof resolvedRuleValue === "object" && resolvedRuleValue !== null && "ref" in resolvedRuleValue && resolvedRuleValue?.ref) return;
		if (resolvedRuleValue === void 0) return ruleValue;
		return resolvedRuleValue;
	}
	return ruleValue;
}
/**
* Looks up a theme file URI based on a relative path.
*
* @param file          A relative path.
* @param themeFileURIs A collection of absolute theme file URIs and their corresponding file paths.
* @return A resolved theme file URI, if one is found in the themeFileURIs collection.
*/
function getResolvedThemeFilePath(file, themeFileURIs) {
	if (!file || !themeFileURIs || !Array.isArray(themeFileURIs)) return file;
	const uri = themeFileURIs.find((themeFileUri) => themeFileUri?.name === file);
	if (!uri?.href) return file;
	return uri?.href;
}
/**
* Resolves ref and relative path values in theme JSON.
*
* @param ruleValue A block style value that may contain a reference to a theme.json value.
* @param tree      A theme.json object.
* @return The resolved value or incoming ruleValue.
*/
function getResolvedValue(ruleValue, tree) {
	if (!ruleValue || !tree) return ruleValue;
	const resolvedValue = getResolvedRefValue(ruleValue, tree);
	if (typeof resolvedValue === "object" && resolvedValue !== null && "url" in resolvedValue && resolvedValue?.url) return {
		...resolvedValue,
		url: getResolvedThemeFilePath(resolvedValue.url, tree?._links?.["wp:theme-file"])
	};
	return resolvedValue;
}
function findInPresetsBy(settings, blockName, presetPath = [], presetProperty = "slug", presetValueValue) {
	const orderedPresetsByOrigin = [blockName ? getValueFromObjectPath(settings, [
		"blocks",
		blockName,
		...presetPath
	]) : void 0, getValueFromObjectPath(settings, presetPath)].filter(Boolean);
	for (const presetByOrigin of orderedPresetsByOrigin) if (presetByOrigin) for (const origin of [
		"custom",
		"theme",
		"default"
	]) {
		const presets = presetByOrigin[origin];
		if (presets) {
			const presetObject = presets.find((preset) => preset[presetProperty] === presetValueValue);
			if (presetObject) {
				if (presetProperty === "slug") return presetObject;
				if (findInPresetsBy(settings, blockName, presetPath, "slug", presetObject.slug)[presetProperty] === presetObject[presetProperty]) return presetObject;
				return;
			}
		}
	}
}
function getValueFromPresetVariable(features, blockName, variable, [presetType, slug] = []) {
	const metadata = PRESET_METADATA.find((data) => data.cssVarInfix === presetType);
	if (!metadata || !features.settings) return variable;
	const presetObject = findInPresetsBy(features.settings, blockName, metadata.path, "slug", slug);
	if (presetObject) {
		const { valueKey } = metadata;
		const result = presetObject[valueKey];
		return getValueFromVariable(features, blockName, result);
	}
	return variable;
}
function getValueFromCustomVariable(features, blockName, variable, path = []) {
	const result = (blockName ? getValueFromObjectPath(features?.settings ?? {}, [
		"blocks",
		blockName,
		"custom",
		...path
	]) : void 0) ?? getValueFromObjectPath(features?.settings ?? {}, ["custom", ...path]);
	if (!result) return variable;
	return getValueFromVariable(features, blockName, result);
}
/**
* Attempts to fetch the value of a theme.json CSS variable.
*
* This function resolves CSS variable references in two formats:
* - User format: `var:preset|color|red` or `var:custom|spacing|small`
* - Theme format: `var(--wp--preset--color--red)` or `var(--wp--custom--spacing--small)`
*
* It also handles ref-style variables in the format `{ ref: "path.to.value" }`.
*
* @param features  GlobalStylesContext config (user, base, or merged). Represents the theme.json tree.
* @param blockName The name of a block as represented in the styles property. E.g., 'root' for root-level, and 'core/block-name' for blocks.
* @param variable  An incoming style value. A CSS var value is expected, but it could be any value.
* @return The value of the CSS var, if found. If not found, returns the original variable argument.
*/
function getValueFromVariable(features, blockName, variable) {
	if (!variable || typeof variable !== "string") {
		if (typeof variable === "object" && variable !== null && "ref" in variable && typeof variable.ref === "string") {
			const resolvedVariable = getValueFromObjectPath(features, variable.ref);
			if (!resolvedVariable || typeof resolvedVariable === "object" && "ref" in resolvedVariable) return resolvedVariable;
			variable = resolvedVariable;
		} else return variable;
	}
	const USER_VALUE_PREFIX = "var:";
	const THEME_VALUE_PREFIX = "var(--wp--";
	const THEME_VALUE_SUFFIX = ")";
	let parsedVar;
	if (variable.startsWith(USER_VALUE_PREFIX)) parsedVar = variable.slice(4).split("|");
	else if (variable.startsWith(THEME_VALUE_PREFIX) && variable.endsWith(THEME_VALUE_SUFFIX)) parsedVar = variable.slice(10, -1).split("--");
	else return variable;
	const [type, ...path] = parsedVar;
	if (type === "preset") return getValueFromPresetVariable(features, blockName, variable, path);
	if (type === "custom") return getValueFromCustomVariable(features, blockName, variable, path);
	return variable;
}

// packages/global-styles-engine/build-module/settings/get-style.mjs
function getStyle(globalStyles, path, blockName, shouldDecodeEncode = true) {
	const appendedPath = path ? "." + path : "";
	const finalPath = !blockName ? `styles${appendedPath}` : `styles.blocks.${blockName}${appendedPath}`;
	if (!globalStyles) return;
	const rawResult = getValueFromObjectPath(globalStyles, finalPath);
	return shouldDecodeEncode ? getValueFromVariable(globalStyles, blockName, rawResult) : rawResult;
}

// packages/global-styles-engine/build-module/settings/set-style.mjs
function setStyle(globalStyles, path, newValue, blockName) {
	const appendedPath = path ? "." + path : "";
	const finalPath = !blockName ? `styles${appendedPath}` : `styles.blocks.${blockName}${appendedPath}`;
	return setImmutably(globalStyles, finalPath.split("."), newValue);
}

// node_modules/.store/fast-deep-equal@3.1.3-Dk0kpzcWCOUHE1bkOO2LLA/node_modules/fast-deep-equal/es6/index.js
var require_es6 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function equal(a, b) {
		if (a === b) return true;
		if (a && b && typeof a == "object" && typeof b == "object") {
			if (a.constructor !== b.constructor) return false;
			var length, i, keys;
			if (Array.isArray(a)) {
				length = a.length;
				if (length != b.length) return false;
				for (i = length; i-- !== 0;) if (!equal(a[i], b[i])) return false;
				return true;
			}
			if (a instanceof Map && b instanceof Map) {
				if (a.size !== b.size) return false;
				for (i of a.entries()) if (!b.has(i[0])) return false;
				for (i of a.entries()) if (!equal(i[1], b.get(i[0]))) return false;
				return true;
			}
			if (a instanceof Set && b instanceof Set) {
				if (a.size !== b.size) return false;
				for (i of a.entries()) if (!b.has(i[0])) return false;
				return true;
			}
			if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
				length = a.length;
				if (length != b.length) return false;
				for (i = length; i-- !== 0;) if (a[i] !== b[i]) return false;
				return true;
			}
			if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
			if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
			if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
			keys = Object.keys(a);
			length = keys.length;
			if (length !== Object.keys(b).length) return false;
			for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
			for (i = length; i-- !== 0;) {
				var key = keys[i];
				if (!equal(a[key], b[key])) return false;
			}
			return true;
		}
		return a !== a && b !== b;
	};
}));

// packages/global-styles-engine/build-module/core/equal.mjs
var import_es6 = /* @__PURE__ */ __toESM(require_es6(), 1);
/**
* Compares global style variations according to their styles and settings properties.
*
* @param original  A global styles object.
* @param variation A global styles object.
* @return Whether `original` and `variation` match.
*/
function areGlobalStylesEqual(original, variation) {
	if (typeof original !== "object" || typeof variation !== "object") return original === variation;
	return (0, import_es6.default)(original?.styles, variation?.styles) && (0, import_es6.default)(original?.settings, variation?.settings);
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

// packages/global-styles-engine/build-module/core/merge.mjs
var import_cjs = /* @__PURE__ */ __toESM(require_cjs(), 1);
/**
* Merges base and user global styles configurations
*
* @param base Base global styles (theme + WordPress defaults)
* @param user User customizations
* @return Merged global styles configuration
*/
function mergeGlobalStyles(base, user) {
	return (0, import_cjs.default)(base, user, {
		isMergeableObject: isPlainObject,
		customMerge: (key) => {
			if (key === "backgroundImage") return (baseConfig, userConfig) => userConfig ?? baseConfig;
		}
	});
}

// node_modules/.store/colord@2.10.0-Qx66Amv6c9C3nDPQDizV6Q/node_modules/colord/index.mjs
for (var r = {
	grad: .9,
	turn: 360,
	rad: 360 / (2 * Math.PI)
}, t = function(r) {
	return "string" == typeof r ? r.length > 0 : "number" == typeof r;
}, n = function(r, t, n) {
	return void 0 === t && (t = 0), void 0 === n && (n = Math.pow(10, t)), Math.round(n * r) / n + 0;
}, u = function(r, t, n) {
	return void 0 === t && (t = 0), void 0 === n && (n = 1), r > n ? n : r > t ? r : t;
}, e = function(r) {
	return (r = isFinite(r) ? r % 360 : 0) < 0 ? r + 360 : r;
}, o = function(r, t) {
	return void 0 === t && (t = 0), n(r, t) % 360;
}, a = function(r) {
	return {
		r: u(r.r, 0, 255),
		g: u(r.g, 0, 255),
		b: u(r.b, 0, 255),
		a: u(r.a)
	};
}, i = function(r) {
	return {
		r: n(r.r),
		g: n(r.g),
		b: n(r.b),
		a: n(r.a, 3)
	};
}, s = /^#([0-9a-f]{3,8})$/i, d = function(r, t) {
	var n = r.charCodeAt(t);
	return (15 & n) + 9 * (n >> 6);
}, h = function(r, t) {
	return d(r, t) << 4 | d(r, t + 1);
}, b = [], f = 0; f < 256; f++) b.push((f < 16 ? "0" : "") + f.toString(16));
var g = function(r) {
	return b[u(r, 0, 255)];
};
var c = function(r) {
	var t = r.r, n = r.g, u = r.b, e = r.a, o = Math.max(t, n, u), a = o - Math.min(t, n, u), i = a ? o === t ? (n - u) / a : o === n ? 2 + (u - t) / a : 4 + (t - n) / a : 0;
	return {
		h: 60 * (i < 0 ? i + 6 : i),
		s: o ? a / o * 100 : 0,
		v: o / 255 * 100,
		a: e
	};
};
var v = function(r) {
	var t = r.h, n = r.s, u = r.v, e = r.a;
	t = t / 360 * 6, n /= 100, u /= 100;
	var o = Math.floor(t), a = u * (1 - n), i = u * (1 - (t - o) * n), s = u * (1 - (1 - t + o) * n), d = o % 6;
	return {
		r: 255 * [
			u,
			i,
			a,
			a,
			s,
			u
		][d],
		g: 255 * [
			s,
			u,
			u,
			i,
			a,
			a
		][d],
		b: 255 * [
			a,
			a,
			s,
			u,
			u,
			i
		][d],
		a: e
	};
};
var l = function(r) {
	return {
		h: e(r.h),
		s: u(r.s, 0, 100),
		l: u(r.l, 0, 100),
		a: u(r.a)
	};
};
var p$1 = function(r) {
	return {
		h: o(r.h),
		s: n(r.s),
		l: n(r.l),
		a: n(r.a, 3)
	};
};
var m = function(r) {
	return v((n = (t = r).s, {
		h: t.h,
		s: (n *= ((u = t.l) < 50 ? u : 100 - u) / 100) > 0 ? 2 * n / (u + n) * 100 : 0,
		v: u + n,
		a: t.a
	}));
	var t, n, u;
};
var y = function(r) {
	return {
		h: (t = c(r)).h,
		s: (e = (200 - (n = t.s)) * (u = t.v) / 100) > 0 && e < 200 ? n * u / 100 / (e <= 100 ? e : 200 - e) * 100 : 0,
		l: e / 2,
		a: t.a
	};
	var t, n, u, e;
};
var N = /^hsla?\(\s*([+-]?(?:\d*\.\d+|\d+))(deg|rad|grad|turn)?\s*,\s*([+-]?(?:\d*\.\d+|\d+))%\s*,\s*([+-]?(?:\d*\.\d+|\d+))%\s*(?:,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i;
var x = /^hsla?\(\s*([+-]?(?:\d*\.\d+|\d+))(deg|rad|grad|turn)?\s+([+-]?(?:\d*\.\d+|\d+))%\s+([+-]?(?:\d*\.\d+|\d+))%\s*(?:\/\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i;
var M = /^rgba?\(\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*(?:,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i;
var H = /^rgba?\(\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s+([+-]?(?:\d*\.\d+|\d+))(%)?\s+([+-]?(?:\d*\.\d+|\d+))(%)?\s*(?:\/\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i;
var $ = {
	string: [
		[function(r) {
			if (!s.test(r)) return null;
			var t = r.length;
			return t <= 5 ? {
				r: 17 * d(r, 1),
				g: 17 * d(r, 2),
				b: 17 * d(r, 3),
				a: 5 === t ? n(17 * d(r, 4) / 255, 2) : 1
			} : 7 === t || 9 === t ? {
				r: h(r, 1),
				g: h(r, 3),
				b: h(r, 5),
				a: 9 === t ? n(h(r, 7) / 255, 2) : 1
			} : null;
		}, "hex"],
		[function(r) {
			var t = M.exec(r) || H.exec(r);
			return t ? t[2] !== t[4] || t[4] !== t[6] ? null : a({
				r: Number(t[1]) / (t[2] ? 100 / 255 : 1),
				g: Number(t[3]) / (t[4] ? 100 / 255 : 1),
				b: Number(t[5]) / (t[6] ? 100 / 255 : 1),
				a: void 0 === t[7] ? 1 : Number(t[7]) / (t[8] ? 100 : 1)
			}) : null;
		}, "rgb"],
		[function(t) {
			var n = N.exec(t) || x.exec(t);
			if (!n) return null;
			var u, e;
			return m(l({
				h: (u = n[1], e = n[2], void 0 === e && (e = "deg"), Number(u) * (r[e] || 1)),
				s: Number(n[3]),
				l: Number(n[4]),
				a: void 0 === n[5] ? 1 : Number(n[5]) / (n[6] ? 100 : 1)
			}));
		}, "hsl"]
	],
	object: [
		[function(r) {
			var n = r.r, u = r.g, e = r.b, o = r.a, i = void 0 === o ? 1 : o;
			return t(n) && t(u) && t(e) ? a({
				r: Number(n),
				g: Number(u),
				b: Number(e),
				a: Number(i)
			}) : null;
		}, "rgb"],
		[function(r) {
			var n = r.h, u = r.s, e = r.l, o = r.a, a = void 0 === o ? 1 : o;
			if (!t(n) || !t(u) || !t(e)) return null;
			return m(l({
				h: Number(n),
				s: Number(u),
				l: Number(e),
				a: Number(a)
			}));
		}, "hsl"],
		[function(r) {
			var n = r.h, o = r.s, a = r.v, i = r.a, s = void 0 === i ? 1 : i;
			if (!t(n) || !t(o) || !t(a)) return null;
			return v(function(r) {
				return {
					h: e(r.h),
					s: u(r.s, 0, 100),
					v: u(r.v, 0, 100),
					a: u(r.a)
				};
			}({
				h: Number(n),
				s: Number(o),
				v: Number(a),
				a: Number(s)
			}));
		}, "hsv"]
	]
};
var j = function(r, t) {
	for (var n = 0; n < t.length; n++) {
		var u = t[n][0](r);
		if (u) return [u, t[n][1]];
	}
	return [null, void 0];
};
var w = function(r) {
	return "string" == typeof r ? j(r.trim(), $.string) : "object" == typeof r && null !== r ? j(r, $.object) : [null, void 0];
};
var k = function(r, t) {
	var n = y(r);
	return {
		h: n.h,
		s: u(n.s + 100 * t, 0, 100),
		l: n.l,
		a: n.a
	};
};
var E = function(r) {
	return (299 * r.r + 587 * r.g + 114 * r.b) / 1e3 / 255;
};
var R = function(r, t) {
	var n = y(r);
	return {
		h: n.h,
		s: n.s,
		l: u(n.l + 100 * t, 0, 100),
		a: n.a
	};
};
var q = function() {
	function r(r) {
		this.parsed = w(r)[0], this.rgba = this.parsed || {
			r: 0,
			g: 0,
			b: 0,
			a: 1
		};
	}
	return r.prototype.isValid = function() {
		return null !== this.parsed;
	}, r.prototype.brightness = function() {
		return n(E(this.rgba), 2);
	}, r.prototype.isDark = function() {
		return E(this.rgba) < .5;
	}, r.prototype.isLight = function() {
		return E(this.rgba) >= .5;
	}, r.prototype.toHex = function() {
		return r = i(this.rgba), t = r.r, u = r.g, e = r.b, a = (o = r.a) < 1 ? g(n(255 * o)) : "", "#" + g(t) + g(u) + g(e) + a;
		var r, t, u, e, o, a;
	}, r.prototype.toRgb = function() {
		return i(this.rgba);
	}, r.prototype.toRgbString = function() {
		return r = i(this.rgba), t = r.r, n = r.g, u = r.b, (e = r.a) < 1 ? "rgba(" + t + ", " + n + ", " + u + ", " + e + ")" : "rgb(" + t + ", " + n + ", " + u + ")";
		var r, t, n, u, e;
	}, r.prototype.toHsl = function() {
		return p$1(y(this.rgba));
	}, r.prototype.toHslString = function() {
		return r = p$1(y(this.rgba)), t = r.h, n = r.s, u = r.l, (e = r.a) < 1 ? "hsla(" + t + ", " + n + "%, " + u + "%, " + e + ")" : "hsl(" + t + ", " + n + "%, " + u + "%)";
		var r, t, n, u, e;
	}, r.prototype.toHsv = function() {
		return r = c(this.rgba), {
			h: o(r.h),
			s: n(r.s),
			v: n(r.v),
			a: n(r.a, 3)
		};
		var r;
	}, r.prototype.invert = function() {
		return A({
			r: 255 - (r = this.rgba).r,
			g: 255 - r.g,
			b: 255 - r.b,
			a: r.a
		});
		var r;
	}, r.prototype.saturate = function(r) {
		return void 0 === r && (r = .1), A(k(this.rgba, r));
	}, r.prototype.desaturate = function(r) {
		return void 0 === r && (r = .1), A(k(this.rgba, -r));
	}, r.prototype.grayscale = function() {
		return A(k(this.rgba, -1));
	}, r.prototype.lighten = function(r) {
		return void 0 === r && (r = .1), A(R(this.rgba, r));
	}, r.prototype.darken = function(r) {
		return void 0 === r && (r = .1), A(R(this.rgba, -r));
	}, r.prototype.rotate = function(r) {
		return void 0 === r && (r = 15), this.hue(y(this.rgba).h + r);
	}, r.prototype.alpha = function(r) {
		return "number" == typeof r ? A({
			r: (t = this.rgba).r,
			g: t.g,
			b: t.b,
			a: r
		}) : n(this.rgba.a, 3);
		var t;
	}, r.prototype.hue = function(r) {
		var t = y(this.rgba);
		return "number" == typeof r ? A({
			h: r,
			s: t.s,
			l: t.l,
			a: t.a
		}) : o(t.h);
	}, r.prototype.isEqual = function(r) {
		return this.toHex() === A(r).toHex();
	}, r;
}();
var A = function(r) {
	return r instanceof q ? r : new q(r);
};

// packages/global-styles-engine/build-module/utils/duotone.mjs
/**
* Convert a list of colors to an object of R, G, and B values.
*
* @param colors Array of RBG color strings.
*
* @return R, G, and B values.
*/
function getValuesFromColors(colors = []) {
	const values = {
		r: [],
		g: [],
		b: [],
		a: []
	};
	colors.forEach((color) => {
		const rgbColor = A(color).toRgb();
		values.r.push(rgbColor.r / 255);
		values.g.push(rgbColor.g / 255);
		values.b.push(rgbColor.b / 255);
		values.a.push(rgbColor.a);
	});
	return values;
}
/**
* Stylesheet for disabling a global styles duotone filter.
*
* @param selector Selector to disable the filter for.
*
* @return Filter none style.
*/
function getDuotoneUnsetStylesheet(selector) {
	return `${selector}{filter:none}`;
}
/**
* SVG and stylesheet needed for rendering the duotone filter.
*
* @param {string} selector Selector to apply the filter to.
* @param {string} id       Unique id for this duotone filter.
*
* @return {string} Duotone filter style.
*/
function getDuotoneStylesheet(selector, id) {
	return `${selector}{filter:url(#${id})}`;
}
/**
* The SVG part of the duotone filter.
*
* @param id     Unique id for this duotone filter.
* @param colors Color strings from dark to light.
*
* @return Duotone SVG.
*/
function getDuotoneFilter(id, colors) {
	const values = getValuesFromColors(colors);
	return `
<svg
	xmlns:xlink="http://www.w3.org/1999/xlink"
	viewBox="0 0 0 0"
	width="0"
	height="0"
	focusable="false"
	role="none"
	aria-hidden="true"
	style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;"
>
	<defs>
		<filter id="${id}">
			<!--
				Use sRGB instead of linearRGB so transparency looks correct.
				Use perceptual brightness to convert to grayscale.
			-->
			<feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=" .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 "></feColorMatrix>
			<!-- Use sRGB instead of linearRGB to be consistent with how CSS gradients work. -->
			<feComponentTransfer color-interpolation-filters="sRGB">
				<feFuncR type="table" tableValues="${values.r.join(" ")}"></feFuncR>
				<feFuncG type="table" tableValues="${values.g.join(" ")}"></feFuncG>
				<feFuncB type="table" tableValues="${values.b.join(" ")}"></feFuncB>
				<feFuncA type="table" tableValues="${values.a.join(" ")}"></feFuncA>
			</feComponentTransfer>
			<!-- Re-mask the image with the original transparency since the feColorMatrix above loses that information. -->
			<feComposite in2="SourceGraphic" operator="in"></feComposite>
		</filter>
	</defs>
</svg>`;
}

// packages/global-styles-engine/build-module/utils/string.mjs
/**
* Converts a string to kebab-case.
* Matches WordPress kebabCase behavior.
*
* @param str The string to convert
* @return The kebab-cased string
*/
function kebabCase(str) {
	return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/([0-9])([a-zA-Z])/g, "$1-$2").replace(/([a-zA-Z])([0-9])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
}

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

// packages/global-styles-engine/build-module/utils/background.mjs
const BACKGROUND_BLOCK_DEFAULT_VALUES = {
	backgroundSize: "cover",
	backgroundPosition: "50% 50%"
};
/**
* Whether a background image resolves to a URL, as opposed to a reference or an
* unresolved value.
*
* @param backgroundImage The background image value.
*
* @return Whether the value carries a URL.
*/
function hasImageUrl(backgroundImage) {
	return typeof backgroundImage === "object" && backgroundImage !== null && "url" in backgroundImage && !!backgroundImage.url;
}
function setBackgroundStyleDefaults(backgroundStyle) {
	if (!backgroundStyle || !hasImageUrl(backgroundStyle.backgroundImage)) return;
	let backgroundStylesWithDefaults;
	if (!backgroundStyle?.backgroundSize) backgroundStylesWithDefaults = { backgroundSize: BACKGROUND_BLOCK_DEFAULT_VALUES.backgroundSize };
	if ("contain" === backgroundStyle?.backgroundSize && !backgroundStyle?.backgroundPosition) backgroundStylesWithDefaults = { backgroundPosition: BACKGROUND_BLOCK_DEFAULT_VALUES.backgroundPosition };
	return backgroundStylesWithDefaults;
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

// packages/global-styles-engine/build-module/utils/viewport.mjs
const DEFAULT_VIEWPORT_BREAKPOINTS = {
	mobile: "480px",
	tablet: "782px"
};
const VIEWPORT_SIZE_REGEXP = /^(\d+|\d*\.\d+)(px|em|rem)$/;
const DEFAULT_FONT_SIZE = 16;
function isViewportSettings(configOrSettings) {
	return "mobile" in configOrSettings || "tablet" in configOrSettings;
}
function getViewportSettings(configOrSettings) {
	if (!configOrSettings || typeof configOrSettings !== "object") return {};
	if (isViewportSettings(configOrSettings)) return configOrSettings;
	return configOrSettings.settings?.viewport ?? {};
}
function isValidViewportSize(value) {
	return typeof value === "string" && VIEWPORT_SIZE_REGEXP.test(value.trim());
}
/**
* Converts a viewport breakpoint value to pixels.
*
* Numeric values are returned as-is. CSS length values are only supported when
* expressed in px, em, or rem units.
*
* @param value Breakpoint value as a number or CSS length.
* @return The breakpoint value in pixels, or undefined when invalid.
*/
function getViewportBreakpointValueInPixels$1(value) {
	if (typeof value === "number") return value;
	if (typeof value !== "string") return;
	const match = value.trim().match(VIEWPORT_SIZE_REGEXP);
	if (!match) return;
	const numericValue = Number.parseFloat(match[1]);
	return match[2] === "px" ? numericValue : numericValue * DEFAULT_FONT_SIZE;
}
/**
* Returns sanitized viewport breakpoints keyed by viewport state.
*
* Falls back to default breakpoints when no valid values are provided. If the
* mobile breakpoint is missing, a valid tablet breakpoint remains keyed as
* tablet so the editor can present it as a tablet breakpoint. If the tablet
* breakpoint is missing, invalid, or not larger than the mobile breakpoint, the
* result only includes the mobile breakpoint.
*
* @param configOrSettings Global styles config or viewport settings.
* @return Sanitized viewport breakpoints.
*/
function getViewportBreakpoints$2(configOrSettings) {
	const viewportSettings = getViewportSettings(configOrSettings);
	const breakpoints = {};
	const breakpointValuesInPixels = {};
	Object.keys(DEFAULT_VIEWPORT_BREAKPOINTS).forEach((breakpoint) => {
		const key = breakpoint;
		const value = viewportSettings[key];
		const px = getViewportBreakpointValueInPixels$1(value);
		if (px !== void 0 && isValidViewportSize(value)) {
			breakpoints[key] = value.trim();
			breakpointValuesInPixels[key] = px;
		}
	});
	const breakpointNames = Object.keys(breakpoints);
	if (!breakpointNames.length) return { ...DEFAULT_VIEWPORT_BREAKPOINTS };
	if (1 === breakpointNames.length) return breakpoints;
	const mobile = breakpoints.mobile;
	const tablet = breakpoints.tablet;
	if (breakpointValuesInPixels.mobile >= breakpointValuesInPixels.tablet) return { mobile };
	return {
		mobile,
		tablet
	};
}
/**
* Returns responsive media query aliases for the configured viewport
* breakpoints.
*
* @param configOrSettings Global styles config or viewport settings.
* @return Responsive media queries keyed by alias.
*/
function getResponsiveMediaQueries(configOrSettings) {
	const breakpoints = getViewportBreakpoints$2(configOrSettings);
	const mediaQueries = {};
	if (breakpoints.mobile) mediaQueries["@mobile"] = `@media (width <= ${breakpoints.mobile})`;
	if (breakpoints.tablet) mediaQueries["@tablet"] = breakpoints.mobile ? `@media (${breakpoints.mobile} < width <= ${breakpoints.tablet})` : `@media (width <= ${breakpoints.tablet})`;
	return mediaQueries;
}

// packages/global-styles-engine/build-module/core/render.mjs
var import_blocks = require_blocks();
const ELEMENT_CLASS_NAMES = {
	button: "wp-element-button",
	caption: "wp-element-caption"
};
const VALID_BLOCK_PSEUDO_SELECTORS = {
	"core/button": [
		":hover",
		":focus",
		":focus-visible",
		":active"
	],
	"core/navigation-link": [
		":hover",
		":focus",
		":focus-visible",
		":active"
	]
};
const VALID_ELEMENT_PSEUDO_SELECTORS = {
	link: [
		":link",
		":any-link",
		":visited",
		":hover",
		":focus",
		":focus-visible",
		":active"
	],
	button: [
		":link",
		":any-link",
		":visited",
		":hover",
		":focus",
		":focus-visible",
		":active"
	],
	textInput: [
		":required",
		":user-valid",
		":user-invalid",
		":focus",
		":focus-visible",
		"::placeholder"
	],
	select: [
		":hover",
		":focus",
		":focus-visible",
		":active"
	]
};
/**
* Transform given preset tree into a set of preset class declarations.
*
* @param blockSelector Block selector string
* @param blockPresets  Block presets object
* @return CSS declarations for the preset classes
*/
function getPresetsClasses(blockSelector = "*", blockPresets = {}) {
	return PRESET_METADATA.reduce((declarations, { path, cssVarInfix, classes }) => {
		if (!classes) return declarations;
		const presetByOrigin = getValueFromObjectPath(blockPresets, path, []);
		[
			"default",
			"theme",
			"custom"
		].forEach((origin) => {
			if (presetByOrigin[origin]) presetByOrigin[origin].forEach(({ slug }) => {
				classes.forEach(({ classSuffix, propertyName }) => {
					const classSelectorToUse = `.has-${kebabCase(slug)}-${classSuffix}`;
					const selectorToUse = blockSelector ? `:where(${blockSelector})${classSelectorToUse}` : classSelectorToUse;
					const value = `var(--wp--preset--${cssVarInfix}--${kebabCase(slug)})`;
					declarations += `${selectorToUse}{${propertyName}: ${value} !important;}`;
				});
			});
		});
		return declarations;
	}, "");
}
/**
* Updates the text indent selector for paragraph blocks based on the textIndent setting.
*
* The textIndent setting can be 'subsequent' (default), 'all', or false.
* When set to 'all', the selector should be '.wp-block-paragraph' instead of
* '.wp-block-paragraph + .wp-block-paragraph' to apply indent to all paragraphs.
*
* @param featureDeclarations The feature declarations keyed by selector
* @param settings            Theme.json settings
* @param blockName           The name of the block being processed
* @return Updated feature declarations
*/
const updateParagraphTextIndentSelector = (featureDeclarations, settings, blockName) => {
	if (blockName !== "core/paragraph") return featureDeclarations;
	if (((settings?.blocks?.["core/paragraph"])?.typography?.textIndent ?? settings?.typography?.textIndent ?? "subsequent") !== "all") return featureDeclarations;
	const oldSelector = ".wp-block-paragraph + .wp-block-paragraph";
	const newSelector = ".wp-block-paragraph";
	if (oldSelector in featureDeclarations) {
		const declarations = featureDeclarations[oldSelector];
		const updated = { ...featureDeclarations };
		delete updated[oldSelector];
		updated[newSelector] = declarations;
		return updated;
	}
	return featureDeclarations;
};
/**
* Updates button width declarations to use a calc() formula for percentage values.
*
* When a percentage width is set on the Button block via Global Styles, the
* resulting CSS needs to account for block gap spacing so that buttons tile
* correctly on a row (e.g. 4 buttons at 25% width all fit on one row).
*
* This mirrors the dynamic calc() formula applied at the block instance level
* in the button block's stylesheet (style.scss).
*
* @param featureDeclarations Feature declarations keyed by selector.
* @param settings            The theme.json settings.
* @return Updated feature declarations.
*/
const updateButtonWidthDeclarations = (featureDeclarations, settings) => {
	const buttonSelector = ".wp-block-button";
	if (!(buttonSelector in featureDeclarations)) return featureDeclarations;
	const updated = { ...featureDeclarations };
	updated[buttonSelector] = updated[buttonSelector].map((declaration) => {
		const match = declaration.match(/^width:\s*(.+)$/);
		if (!match) return declaration;
		const value = match[1];
		let percentage = null;
		if (value.endsWith("%")) percentage = parseFloat(value);
		if (percentage === null && value.startsWith("var(--wp--preset--dimension--") && value.endsWith(")")) {
			const slug = value.slice(29, -1);
			const dimensionSizes = {
				...settings?.dimensions?.dimensionSizes ?? {},
				...settings?.blocks?.["core/button"]?.dimensions?.dimensionSizes ?? {}
			};
			for (const origin of Object.values(dimensionSizes)) {
				if (!Array.isArray(origin)) continue;
				for (const preset of origin) if (preset.slug === slug && typeof preset.size === "string" && preset.size.endsWith("%")) {
					percentage = parseFloat(preset.size);
					break;
				}
				if (percentage !== null) break;
			}
		}
		if (percentage === null || isNaN(percentage)) return declaration;
		return `width: calc(${percentage} * 1% - (var(--wp--style--block-gap, 0.5em) * (1 - ${percentage} / 100)))`;
	});
	return updated;
};
/**
* Generate style declarations for a block's custom feature and subfeature
* selectors.
*
* NOTE: The passed `styles` object will be mutated by this function.
*
* @param selectors Custom selectors object for a block
* @param styles    A block's styles object
* @return Style declarations
*/
const getFeatureDeclarations = (selectors, styles) => {
	const declarations = {};
	Object.entries(selectors).forEach(([feature, selector]) => {
		if (feature === "root" || feature === "css" || !styles?.[feature]) return;
		const isShorthand = typeof selector === "string";
		if (!isShorthand && typeof selector === "object" && selector !== null) Object.entries(selector).forEach(([subfeature, subfeatureSelector]) => {
			if (subfeature === "root" || !styles?.[feature][subfeature]) return;
			const newDeclarations = getStylesDeclarations({ [feature]: { [subfeature]: styles[feature][subfeature] } });
			declarations[subfeatureSelector] = [...declarations[subfeatureSelector] || [], ...newDeclarations];
			delete styles[feature][subfeature];
		});
		if (isShorthand || typeof selector === "object" && selector !== null && "root" in selector) {
			const featureSelector = isShorthand ? selector : selector.root;
			const newDeclarations = getStylesDeclarations({ [feature]: styles[feature] });
			declarations[featureSelector] = [...declarations[featureSelector] || [], ...newDeclarations];
			delete styles[feature];
		}
	});
	return declarations;
};
/**
* Returns the declarations a state needs to escape a text clip set below it,
* keyed by the feature whose selector they belong on.
*
* Mirror of `getStateTextClipEscapeCSS` and `getStateTextFillResetCSS` in
* packages/block-editor/src/hooks/style.jsx.
*
* @param stateStyles State style object, as in the theme.json tree.
* @param baseStyles  Styles the state layers over, nearest first.
* @return The clip escape under `background`, the text fill reset under `color`.
*/
function getStateTextClipEscapes(stateStyles, baseStyles) {
	const escapes = {
		background: [],
		color: []
	};
	if ("text" !== baseStyles?.find((baseStyle) => baseStyle?.background?.backgroundClip)?.background?.backgroundClip) return escapes;
	const stateClip = stateStyles?.background?.backgroundClip;
	const paintsItsOwnBackground = !!stateStyles?.background?.gradient || !!stateStyles?.background?.backgroundImage || !!stateStyles?.color?.gradient;
	if (stateClip && "text" !== stateClip && !paintsItsOwnBackground) escapes.background.push("background-image: unset");
	if (!stateClip && !paintsItsOwnBackground && !!stateStyles?.color?.text) escapes.color.push("-webkit-text-fill-color: currentColor");
	return escapes;
}
/**
* Resolves the feature selector a text clip escape belongs on: the text
* subfeature for `color`, else the feature's own selector.
*
* Mirror of the selector lookup in `get_state_declarations_with_text_clip_escapes`
* in lib/class-wp-theme-json-gutenberg.php.
*
* @param featureSelectors The block's feature selectors.
* @param feature          `background` or `color`.
* @return The selector, or undefined when the block has none for the feature.
*/
function getTextClipEscapeSelector(featureSelectors, feature) {
	if (!featureSelectors || typeof featureSelectors === "string") return;
	const featureSelector = featureSelectors[feature];
	if (typeof featureSelector === "string") return featureSelector;
	return featureSelector?.["color" === feature ? "text" : "root"] ?? featureSelector?.root;
}
/**
* Transform given style tree into a set of style declarations.
*
* @param blockStyles         Block styles
* @param selector            The selector these declarations should attach to
* @param useRootPaddingAlign Whether to use CSS custom properties in root selector
* @param tree                A theme.json tree containing layout definitions
* @param disableRootPadding  Whether to force disable the root padding styles
* @return An array of style declarations
*/
function getStylesDeclarations(blockStyles = {}, selector = "", useRootPaddingAlign, tree = {}, disableRootPadding = false) {
	const isRoot = ROOT_BLOCK_SELECTOR === selector;
	const output = Object.entries(import_blocks.__EXPERIMENTAL_STYLE_PROPERTY).reduce((declarations, [key, { value, properties, useEngine, rootOnly }]) => {
		if (rootOnly && !isRoot) return declarations;
		const pathToValue = value;
		if (pathToValue[0] === "elements" || useEngine) return declarations;
		const styleValue = getValueFromObjectPath(blockStyles, pathToValue);
		if (key === "--wp--style--root--padding" && (typeof styleValue === "string" || !useRootPaddingAlign)) return declarations;
		if (properties && typeof styleValue !== "string") Object.entries(properties).forEach((entry) => {
			const [name, prop] = entry;
			if (!getValueFromObjectPath(styleValue, [prop], false)) return;
			const cssProperty = name.startsWith("--") ? name : kebabCase(name);
			declarations.push(`${cssProperty}: ${(0, import_style_engine.getCSSValueFromRawStyle)(getValueFromObjectPath(styleValue, [prop]))}`);
		});
		else if (getValueFromObjectPath(blockStyles, pathToValue, false)) {
			const cssProperty = key.startsWith("--") ? key : kebabCase(key);
			declarations.push(`${cssProperty}: ${(0, import_style_engine.getCSSValueFromRawStyle)(getValueFromObjectPath(blockStyles, pathToValue))}`);
		}
		return declarations;
	}, []);
	if (!!blockStyles.background) {
		if (blockStyles.background?.backgroundImage) blockStyles.background.backgroundImage = getResolvedValue(blockStyles.background.backgroundImage, tree);
		if (!isRoot && !!blockStyles.background?.backgroundImage?.id) blockStyles = {
			...blockStyles,
			background: {
				...blockStyles.background,
				...setBackgroundStyleDefaults(blockStyles.background)
			}
		};
	}
	(0, import_style_engine.getCSSRules)(blockStyles).forEach((rule) => {
		if (isRoot && (useRootPaddingAlign || disableRootPadding) && rule.key.startsWith("padding")) return;
		const cssProperty = rule.key.startsWith("-") ? rule.key : kebabCase(rule.key);
		let ruleValue = getResolvedValue(rule.value, tree);
		if (cssProperty === "font-size") ruleValue = getTypographyFontSizeValue({
			name: "",
			slug: "",
			size: ruleValue
		}, tree?.settings);
		if (cssProperty === "aspect-ratio") output.push("min-height: unset");
		output.push(`${cssProperty}: ${ruleValue}`);
	});
	return output;
}
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
const STYLE_KEYS = [
	"border",
	"color",
	"dimensions",
	"spacing",
	"typography",
	"filter",
	"outline",
	"shadow",
	"background"
];
function pickStyleKeys(treeToPickFrom, responsiveMediaQueries) {
	return pickStyleAndPseudoKeys(treeToPickFrom, void 0, responsiveMediaQueries);
}
function pickStyleAndPseudoKeys(treeToPickFrom, blockName, responsiveMediaQueries) {
	if (!treeToPickFrom) return {};
	const entries = Object.entries(treeToPickFrom);
	const allowedPseudoSelectors = blockName ? VALID_BLOCK_PSEUDO_SELECTORS[blockName] ?? [] : [];
	const clonedEntries = entries.filter(([key]) => STYLE_KEYS.includes(key) || allowedPseudoSelectors.includes(key) || responsiveMediaQueries[key]).map(([key, style]) => [key, JSON.parse(JSON.stringify(style))]);
	return Object.fromEntries(clonedEntries);
}
/**
* Creates style nodes for configured block and element pseudo selectors.
*
* Only pseudo selectors listed in the matching block or element allow-list are
* considered. This mirrors the PHP renderer and avoids treating arbitrary
* colon-prefixed keys as pseudo selectors.
*
* @param node Style node that may contain configured pseudo styles.
* @return Style nodes for the configured pseudo states.
*/
function getPseudoStyleNodes(node) {
	const { styles, baseStyles, sourceStyles, selector, featureSelectors, name, elementName, mediaQuery, variationName } = node;
	const pseudoSelectors = name ? VALID_BLOCK_PSEUDO_SELECTORS[name] ?? [] : VALID_ELEMENT_PSEUDO_SELECTORS[elementName ?? ""] ?? [];
	if (!pseudoSelectors.length) return [];
	return pseudoSelectors.flatMap((pseudoSelector) => {
		const pseudoStyles = styles?.[pseudoSelector];
		if (!pseudoStyles || typeof pseudoStyles !== "object") return [];
		return [{
			styles: JSON.parse(JSON.stringify(pseudoStyles)),
			baseStyles: [sourceStyles ?? styles, ...baseStyles ?? []],
			sourceStyles: sourceStyles?.[pseudoSelector],
			selector,
			selectorSuffix: pseudoSelector,
			mediaQuery,
			featureSelectors: featureSelectors && typeof featureSelectors !== "string" ? featureSelectors : void 0,
			name,
			elementName,
			variationName
		}];
	});
}
function isPseudoElementSelector(selectorSuffix) {
	return selectorSuffix?.startsWith("::") ?? false;
}
/**
* Builds the specificity-capped selector for a pseudo selector rule.
*
* Pseudo-classes are appended to each part of the base selector inside the
* `:root :where()` wrapper, e.g. `:root :where(a:hover)`. Pseudo-elements are
* not valid inside `:where()`, so they are appended after the wrapper instead,
* e.g. `:root :where(textarea, input)::placeholder`, which keeps the same
* specificity regardless of where the element styles are defined.
*
* @param baseSelector   Selector without the pseudo selector.
* @param pseudoSelector Pseudo selector to apply, e.g. ':hover' or '::placeholder'.
* @return The selector to use for the rule.
*/
function getPseudoRuleSelector(baseSelector, pseudoSelector) {
	if (isPseudoElementSelector(pseudoSelector)) return `:root :where(${baseSelector})${pseudoSelector}`;
	return `:root :where(${appendToSelector(baseSelector, pseudoSelector)})`;
}
/**
* Creates style nodes for configured responsive breakpoint states.
*
* Breakpoint nodes render feature-level, base, and pseudo declarations through
* the normal node renderer.
*
* @param node                   Style node that may contain configured responsive state styles.
* @param responsiveMediaQueries Media queries keyed by responsive state name.
* @return Responsive style nodes in configured breakpoint order.
*/
function getResponsiveStyleNodes(node, responsiveMediaQueries) {
	const { styles, baseStyles, sourceStyles, selector, fallbackGapValue, featureSelectors, hasLayoutSupport, layoutHasBlockGapSupport, layoutSelector, name, elementName, isStyleVariation, variationName } = node;
	if (!name && !elementName) return [];
	return Object.entries(responsiveMediaQueries).flatMap(([breakpointKey, mediaQuery]) => {
		const breakpointStyles = styles?.[breakpointKey];
		if (!breakpointStyles || typeof breakpointStyles !== "object") return [];
		return [{
			styles: JSON.parse(JSON.stringify(breakpointStyles)),
			baseStyles: [sourceStyles ?? styles, ...baseStyles ?? []],
			sourceStyles: sourceStyles?.[breakpointKey],
			selector,
			mediaQuery,
			featureSelectors: featureSelectors && typeof featureSelectors !== "string" ? featureSelectors : void 0,
			fallbackGapValue,
			hasLayoutSupport,
			name,
			elementName,
			isStyleVariation,
			variationName,
			layoutSelector,
			layoutHasBlockGapSupport
		}];
	});
}
/**
* Collects element styles from the default and responsive branches of a style
* node. Responsive styles are copied onto the element node so they can be
* expanded by `getResponsiveStyleNodes`.
*
* @param styleNode              Style node that may contain element styles.
* @param responsiveMediaQueries Media queries keyed by responsive state name.
* @return Element styles keyed by element name.
*/
function getElementStylesByName(styleNode, responsiveMediaQueries) {
	const elementStylesByName = { ...styleNode?.elements ?? {} };
	Object.keys(responsiveMediaQueries).forEach((breakpointKey) => {
		Object.entries(styleNode?.[breakpointKey]?.elements ?? {}).forEach(([elementName, styles]) => {
			elementStylesByName[elementName] = {
				...elementStylesByName[elementName] ?? {},
				[breakpointKey]: styles
			};
		});
	});
	return elementStylesByName;
}
const getNodesWithStyles = (tree, blockSelectors, textClipBaseBlocks) => {
	const nodes = [];
	if (!tree?.styles) return nodes;
	const responsiveMediaQueries = getResponsiveMediaQueries(tree);
	const styles = pickStyleKeys(tree.styles, responsiveMediaQueries);
	if (styles) nodes.push({
		styles,
		selector: ROOT_BLOCK_SELECTOR,
		skipSelectorWrapper: true
	});
	Object.entries(import_blocks.__EXPERIMENTAL_ELEMENTS).forEach(([name, selector]) => {
		if (tree.styles?.elements?.[name]) nodes.push({
			styles: tree.styles?.elements?.[name] ?? {},
			selector,
			elementName: name,
			skipSelectorWrapper: !ELEMENT_CLASS_NAMES[name]
		});
	});
	Object.entries(tree.styles?.blocks ?? {}).forEach(([blockName, node]) => {
		const blockStyles = pickStyleAndPseudoKeys(node, blockName, responsiveMediaQueries);
		const typedNode = node;
		if (typedNode?.css) blockStyles.css = typedNode.css;
		const variationNodesToAdd = [];
		const variationStyleNodesToAdd = [];
		if (typedNode?.variations) Object.entries(typedNode.variations).forEach(([variationName, variation]) => {
			const typedVariation = variation;
			const variationStyles = pickStyleAndPseudoKeys(typedVariation, blockName, responsiveMediaQueries);
			if (typedVariation?.css) variationStyles.css = typedVariation.css;
			const variationSelector = typeof blockSelectors !== "string" ? blockSelectors[blockName]?.styleVariationSelectors?.[variationName] : void 0;
			if (variationSelector && typeof blockSelectors !== "string") {
				const blockSelector = blockSelectors[blockName];
				variationStyleNodesToAdd.push({
					styles: variationStyles,
					baseStyles: [typedNode, ...textClipBaseBlocks?.[blockName] ? [textClipBaseBlocks[blockName]] : []],
					sourceStyles: typedVariation,
					selector: variationSelector,
					featureSelectors: blockSelector?.featureSelectors,
					fallbackGapValue: blockSelector?.fallbackGapValue,
					hasLayoutSupport: blockSelector?.hasLayoutSupport,
					isStyleVariation: true,
					variationName,
					layoutSelector: variationSelector + blockSelector.selector,
					layoutHasBlockGapSupport: true,
					name: blockName
				});
			}
			Object.entries(getElementStylesByName(typedVariation, responsiveMediaQueries)).forEach(([element, elementStyles]) => {
				if (elementStyles && import_blocks.__EXPERIMENTAL_ELEMENTS[element]) variationNodesToAdd.push({
					styles: elementStyles,
					selector: scopeSelector(variationSelector, import_blocks.__EXPERIMENTAL_ELEMENTS[element]),
					elementName: element,
					isStyleVariation: true
				});
			});
			Object.entries(typedVariation?.blocks ?? {}).forEach(([variationBlockName, variationBlockStyles]) => {
				const variationBlockSelector = typeof blockSelectors !== "string" ? scopeSelector(variationSelector, blockSelectors[variationBlockName]?.selector) : void 0;
				const variationDuotoneSelector = typeof blockSelectors !== "string" ? scopeSelector(variationSelector, blockSelectors[variationBlockName]?.duotoneSelector) : void 0;
				const variationFeatureSelectors = typeof blockSelectors !== "string" ? scopeFeatureSelectors(variationSelector, blockSelectors[variationBlockName]?.featureSelectors ?? {}) : void 0;
				const variationBlockStyleNodes = pickStyleAndPseudoKeys(variationBlockStyles, variationBlockName, responsiveMediaQueries);
				if (variationBlockStyles?.css) variationBlockStyleNodes.css = variationBlockStyles.css;
				if (!variationBlockSelector || typeof blockSelectors === "string") return;
				variationNodesToAdd.push({
					selector: variationBlockSelector,
					name: variationBlockName,
					isStyleVariation: true,
					...textClipBaseBlocks?.[variationBlockName] && { baseStyles: [textClipBaseBlocks[variationBlockName]] },
					duotoneSelector: variationDuotoneSelector,
					featureSelectors: variationFeatureSelectors,
					fallbackGapValue: blockSelectors[variationBlockName]?.fallbackGapValue,
					hasLayoutSupport: blockSelectors[variationBlockName]?.hasLayoutSupport,
					styles: variationBlockStyleNodes,
					sourceStyles: variationBlockStyles
				});
				Object.entries(getElementStylesByName(variationBlockStyles, responsiveMediaQueries)).forEach(([variationBlockElement, variationBlockElementStyles]) => {
					if (variationBlockElementStyles && import_blocks.__EXPERIMENTAL_ELEMENTS[variationBlockElement]) variationNodesToAdd.push({
						styles: variationBlockElementStyles,
						selector: scopeSelector(variationBlockSelector, import_blocks.__EXPERIMENTAL_ELEMENTS[variationBlockElement]),
						elementName: variationBlockElement,
						isStyleVariation: true
					});
				});
			});
		});
		if (typeof blockSelectors !== "string" && blockSelectors?.[blockName]?.selector) nodes.push({
			duotoneSelector: blockSelectors[blockName].duotoneSelector,
			fallbackGapValue: blockSelectors[blockName].fallbackGapValue,
			hasLayoutSupport: blockSelectors[blockName].hasLayoutSupport,
			selector: blockSelectors[blockName].selector,
			styles: blockStyles,
			sourceStyles: typedNode,
			featureSelectors: blockSelectors[blockName].featureSelectors,
			name: blockName
		});
		nodes.push(...variationStyleNodesToAdd);
		Object.entries(getElementStylesByName(typedNode, responsiveMediaQueries)).forEach(([elementName, value]) => {
			if (typeof blockSelectors !== "string" && value && blockSelectors?.[blockName] && import_blocks.__EXPERIMENTAL_ELEMENTS[elementName]) nodes.push({
				styles: value,
				selector: blockSelectors[blockName]?.selector.split(",").map((sel) => {
					return import_blocks.__EXPERIMENTAL_ELEMENTS[elementName].split(",").map((elementSelector) => sel + " " + elementSelector);
				}).join(","),
				elementName
			});
		});
		nodes.push(...variationNodesToAdd);
	});
	return nodes;
};
const getNodesWithSettings = (tree, blockSelectors) => {
	const nodes = [];
	if (!tree?.settings) return nodes;
	const pickPresets = (treeToPickFrom) => {
		let presets = {};
		PRESET_METADATA.forEach(({ path }) => {
			const value = getValueFromObjectPath(treeToPickFrom, path, false);
			if (value !== false) presets = setImmutably(presets, path, value);
		});
		return presets;
	};
	const presets = pickPresets(tree.settings);
	const custom = tree.settings?.custom;
	if (Object.keys(presets).length > 0 || custom) nodes.push({
		presets,
		custom,
		selector: ROOT_CSS_PROPERTIES_SELECTOR
	});
	Object.entries(tree.settings?.blocks ?? {}).forEach(([blockName, node]) => {
		const blockCustom = node.custom;
		if (typeof blockSelectors === "string" || !blockSelectors[blockName]) return;
		const blockPresets = pickPresets(node);
		if (Object.keys(blockPresets).length > 0 || blockCustom) nodes.push({
			presets: blockPresets,
			custom: blockCustom,
			selector: blockSelectors[blockName]?.selector,
			featureSelectors: blockSelectors[blockName]?.featureSelectors
		});
	});
	return nodes;
};
/**
* Renders CSS rules for a single style node.
*
* The node renderer handles feature-level selectors, duotone declarations,
* layout styles, base declarations, and custom CSS. State nodes are expanded
* before rendering so ordering matches the PHP renderer.
*
* @param node                          Style node metadata and styles.
* @param context                       Render context and feature flags.
* @param context.tree                  Global styles tree.
* @param context.useRootPaddingAlign   Whether root padding alignment is enabled.
* @param context.disableLayoutStyles   Whether layout styles are disabled.
* @param context.hasBlockGapSupport    Whether block gap support is enabled.
* @param context.hasFallbackGapSupport Whether fallback gap support is enabled.
* @param context.disableRootPadding    Whether root padding declarations are disabled.
* @return Rendered CSS rules for the node.
*/
function renderStylesNode(node, { tree, useRootPaddingAlign, disableLayoutStyles, hasBlockGapSupport, hasFallbackGapSupport, disableRootPadding }) {
	const { selector, selectorSuffix, mediaQuery, duotoneSelector, styles, baseStyles, sourceStyles, fallbackGapValue, hasLayoutSupport, featureSelectors, layoutSelector, layoutHasBlockGapSupport, skipSelectorWrapper, name, variationName } = node;
	let ruleset = "";
	const effectiveSelector = selectorSuffix ? appendToSelector(selector, selectorSuffix) : selector;
	const textClipEscapes = getStateTextClipEscapes(sourceStyles ?? styles, baseStyles);
	const ownTextClipEscapes = [];
	const featureTextClipEscapes = {};
	["background", "color"].forEach((feature) => {
		const escapeSelector = getTextClipEscapeSelector(featureSelectors, feature);
		if (!escapeSelector) ownTextClipEscapes.push(...textClipEscapes[feature]);
		else if (textClipEscapes[feature].length) featureTextClipEscapes[escapeSelector] = [...featureTextClipEscapes[escapeSelector] ?? [], ...textClipEscapes[feature]];
	});
	if (featureSelectors && typeof featureSelectors !== "string") {
		let featureDeclarations = getFeatureDeclarations(featureSelectors, styles);
		featureDeclarations = updateParagraphTextIndentSelector(featureDeclarations, tree.settings, name);
		featureDeclarations = updateButtonWidthDeclarations(featureDeclarations, tree.settings);
		Object.entries(featureTextClipEscapes).forEach(([escapeSelector, escapes]) => {
			featureDeclarations[escapeSelector] = [...featureDeclarations[escapeSelector] ?? [], ...escapes];
		});
		Object.entries(featureDeclarations).forEach(([featureSelector, declarations]) => {
			if (declarations.length) {
				const selectorForRule = variationName ? getBlockStyleVariationFeatureSelector(variationName, featureSelector) : featureSelector;
				const featureRuleSelector = selectorSuffix ? getPseudoRuleSelector(selectorForRule, selectorSuffix) : `:root :where(${selectorForRule})`;
				const rules = declarations.join(";");
				ruleset += `${featureRuleSelector}{${rules};}`;
			}
		});
	}
	if (duotoneSelector) {
		const duotoneStyles = {};
		if (styles?.filter) {
			duotoneStyles.filter = styles.filter;
			delete styles.filter;
		}
		const duotoneDeclarations = getStylesDeclarations(duotoneStyles);
		if (duotoneDeclarations.length) ruleset += `${duotoneSelector}{${duotoneDeclarations.join(";")};}`;
	}
	const selectorForLayout = layoutSelector ?? effectiveSelector;
	const hasBlockGapSupportForLayout = layoutHasBlockGapSupport ?? hasBlockGapSupport;
	if (!disableLayoutStyles && ("body" === selectorForLayout || hasLayoutSupport)) ruleset += getLayoutStyles({
		style: styles,
		selector: selectorForLayout,
		hasBlockGapSupport: hasBlockGapSupportForLayout,
		hasFallbackGapSupport,
		fallbackGapValue
	});
	const styleDeclarations = [...getStylesDeclarations(styles, effectiveSelector, useRootPaddingAlign, tree, disableRootPadding), ...ownTextClipEscapes];
	if (styleDeclarations?.length) {
		let generalSelector = `:root :where(${effectiveSelector})`;
		if (skipSelectorWrapper) generalSelector = effectiveSelector;
		else if (selectorSuffix) generalSelector = getPseudoRuleSelector(selector, selectorSuffix);
		ruleset += `${generalSelector}{${styleDeclarations.join(";")};}`;
	}
	if (styles?.css) {
		const cssFeatureSelector = featureSelectors && typeof featureSelectors === "object" ? featureSelectors.css : void 0;
		let resolvedCssSelector;
		if (typeof cssFeatureSelector === "string") resolvedCssSelector = cssFeatureSelector;
		else if (cssFeatureSelector && typeof cssFeatureSelector === "object" && "root" in cssFeatureSelector && typeof cssFeatureSelector.root === "string") resolvedCssSelector = cssFeatureSelector.root;
		if (resolvedCssSelector && variationName) resolvedCssSelector = getBlockStyleVariationFeatureSelector(variationName, resolvedCssSelector);
		const cssBaseSelector = resolvedCssSelector ?? selector;
		const cssSelector = selectorSuffix ? appendToSelector(cssBaseSelector, selectorSuffix) : cssBaseSelector;
		ruleset += processCSSNesting(styles.css, cssSelector);
	}
	if (mediaQuery && ruleset) return `${mediaQuery}{${ruleset}}`;
	return ruleset;
}
/**
* Like `transformToStyles`, but also takes the block type styles that block
* style variations layer over. They are read only to escape a text clip set
* there, and are never output. Mirror of the PHP `text_clip_base_blocks`
* stylesheet option.
*
* @param tree                  Global styles config.
* @param blockSelectors        Block selectors.
* @param hasBlockGapSupport    Whether block gap is supported.
* @param hasFallbackGapSupport Whether fallback gap is supported.
* @param disableLayoutStyles   Whether to disable layout styles.
* @param disableRootPadding    Whether to disable root padding.
* @param styleOptions          Sets of styles to opt in or out of.
* @param textClipBaseBlocks    Block type styles, keyed by block name.
* @return The stylesheet.
*/
function transformToStylesWithTextClipBase(tree, blockSelectors, hasBlockGapSupport, hasFallbackGapSupport, disableLayoutStyles = false, disableRootPadding = false, styleOptions = {}, textClipBaseBlocks) {
	const options = {
		blockGap: true,
		blockStyles: true,
		layoutStyles: true,
		marginReset: true,
		presets: true,
		rootPadding: true,
		variationStyles: false,
		...styleOptions
	};
	const nodesWithStyles = getNodesWithStyles(tree, blockSelectors, textClipBaseBlocks);
	const nodesWithSettings = getNodesWithSettings(tree, blockSelectors);
	const useRootPaddingAlign = tree?.settings?.useRootPaddingAwareAlignments;
	const { contentSize, wideSize } = tree?.settings?.layout || {};
	const hasBodyStyles = options.marginReset || options.rootPadding || options.layoutStyles;
	let ruleset = "";
	if (options.presets && (contentSize || wideSize)) {
		ruleset += `${ROOT_CSS_PROPERTIES_SELECTOR} {`;
		ruleset = contentSize ? ruleset + ` --wp--style--global--content-size: ${contentSize};` : ruleset;
		ruleset = wideSize ? ruleset + ` --wp--style--global--wide-size: ${wideSize};` : ruleset;
		ruleset += "}";
	}
	if (hasBodyStyles) {
		ruleset += ":where(body) {margin: 0;";
		if (options.rootPadding && useRootPaddingAlign) ruleset += `padding-right: 0; padding-left: 0; padding-top: var(--wp--style--root--padding-top); padding-bottom: var(--wp--style--root--padding-bottom) }
				.has-global-padding { padding-right: var(--wp--style--root--padding-right); padding-left: var(--wp--style--root--padding-left); }
				.has-global-padding > .alignfull { margin-right: calc(var(--wp--style--root--padding-right) * -1); margin-left: calc(var(--wp--style--root--padding-left) * -1); }
				.has-global-padding :where(:not(.alignfull.is-layout-flow) > .has-global-padding:not(.wp-block-block, .alignfull)) { padding-right: 0; padding-left: 0; }
				.has-global-padding :where(:not(.alignfull.is-layout-flow) > .has-global-padding:not(.wp-block-block, .alignfull)) > .alignfull { margin-left: 0; margin-right: 0;
				`;
		ruleset += "}";
	}
	if (options.blockStyles) {
		const responsiveMediaQueries = getResponsiveMediaQueries(tree);
		nodesWithStyles.forEach((node) => {
			if (node.isStyleVariation && !options.variationStyles) return;
			const responsiveNodes = getResponsiveStyleNodes(node, responsiveMediaQueries);
			[
				node,
				...responsiveNodes,
				...getPseudoStyleNodes(node),
				...responsiveNodes.flatMap(getPseudoStyleNodes)
			].forEach((expandedNode) => {
				ruleset += renderStylesNode(expandedNode, {
					tree,
					useRootPaddingAlign,
					disableLayoutStyles,
					hasBlockGapSupport,
					hasFallbackGapSupport,
					disableRootPadding
				});
			});
		});
	}
	if (options.layoutStyles) {
		ruleset = ruleset + ".wp-site-blocks > .alignleft { float: left; margin-right: 2em; }";
		ruleset = ruleset + ".wp-site-blocks > .alignright { float: right; margin-left: 2em; }";
		ruleset = ruleset + ".wp-site-blocks > .aligncenter { justify-content: center; margin-left: auto; margin-right: auto; }";
	}
	if (options.blockGap && hasBlockGapSupport) {
		const gapValue = getGapCSSValue(tree?.styles?.spacing?.blockGap) || "0.5em";
		ruleset = ruleset + `:root :where(.wp-site-blocks) > * { margin-block-start: ${gapValue}; margin-block-end: 0; }`;
		ruleset = ruleset + ":root :where(.wp-site-blocks) > :first-child { margin-block-start: 0; }";
		ruleset = ruleset + ":root :where(.wp-site-blocks) > :last-child { margin-block-end: 0; }";
	}
	if (options.presets) nodesWithSettings.forEach(({ selector, presets }) => {
		if ("body" === selector || ":root" === selector) selector = "";
		const classes = getPresetsClasses(selector, presets);
		if (classes.length > 0) ruleset += classes;
	});
	return ruleset;
}
function processCSSNesting(css, blockSelector) {
	let processedCSS = "";
	if (!css || css.trim() === "") return processedCSS;
	css.split("&").forEach((part) => {
		if (!part || part.trim() === "") return;
		if (!part.includes("{")) processedCSS += `:root :where(${blockSelector}){${part.trim()}}`;
		else {
			const splitPart = part.replace("}", "").split("{");
			if (splitPart.length !== 2) return;
			const [nestedSelector, cssValue] = splitPart;
			const matches = nestedSelector.match(/([>+~\s]*::[a-zA-Z-]+)/);
			const pseudoPart = matches ? matches[1] : "";
			const withoutPseudoElement = matches ? nestedSelector.replace(pseudoPart, "").trim() : nestedSelector.trim();
			let combinedSelector;
			if (withoutPseudoElement === "") combinedSelector = blockSelector;
			else combinedSelector = nestedSelector.startsWith(" ") ? scopeSelector(blockSelector, withoutPseudoElement) : appendToSelector(blockSelector, withoutPseudoElement);
			processedCSS += `:root :where(${combinedSelector})${pseudoPart}{${cssValue.trim()}}`;
		}
	});
	return processedCSS;
}

// packages/global-styles-engine/build-module/variation.mjs
/**
* Retrieves a block style variation's styles from the Global Styles tree.
*
* The result is always a deep clone, so callers can mutate it and the input is
* left untouched. By default, a `{ ref }` value (a reference that points at
* another value in the tree, e.g. `{ ref: 'styles.color.background' }`) is
* replaced with the value it points at, and any invalid or missing reference is
* dropped. Pass `resolveRefs: false` to leave those references in place.
*
* @param globalStyles        A complete Global Styles object, containing `settings` and `styles`.
* @param name                The block type name (e.g. `core/group`).
* @param variation           The block style variation slug to retrieve.
* @param options             Optional settings.
* @param options.resolveRefs Whether to replace a `{ ref }` value with the value it points at. Defaults to `true`.
* @return The variation's styles, or `undefined` when the variation is not present.
*/
function getVariationStyle(globalStyles, name, variation, { resolveRefs = true } = {}) {
	if (!globalStyles?.styles?.blocks?.[name]?.variations?.[variation]) return;
	const replaceRefs = (variationStyles) => {
		Object.keys(variationStyles).forEach((key) => {
			const value = variationStyles[key];
			if (typeof value === "object" && value !== null) {
				if (value.ref !== void 0) {
					if (typeof value.ref !== "string" || value.ref.trim() === "") delete variationStyles[key];
					else {
						const refValue = getValueFromObjectPath(globalStyles, value.ref);
						if (refValue !== void 0 && refValue !== null) variationStyles[key] = refValue;
						else delete variationStyles[key];
					}
				} else {
					replaceRefs(value);
					if (Object.keys(value).length === 0) delete variationStyles[key];
				}
			}
		});
	};
	const styles = JSON.parse(JSON.stringify(globalStyles.styles.blocks[name].variations[variation]));
	if (resolveRefs) replaceRefs(styles);
	return styles;
}

// packages/global-styles-engine/build-module/resolve-style.mjs
const DEFAULT_STATE_VALUE = "default";
function isDefaultBlockStyleState(selectedState) {
	const viewport = selectedState?.viewport;
	const pseudoState = selectedState?.pseudoState;
	return (!viewport || viewport === DEFAULT_STATE_VALUE) && (!pseudoState || pseudoState === DEFAULT_STATE_VALUE);
}
function getStyleStatePath(selectedState) {
	if (isDefaultBlockStyleState(selectedState)) return [];
	return [selectedState.viewport, selectedState.pseudoState].filter((state) => !!state && state !== DEFAULT_STATE_VALUE);
}
function getStyleForState(style, selectedState) {
	const path = getStyleStatePath(selectedState);
	if (!path.length) return style;
	return getValueFromObjectPath(style, path);
}
const TREE_STRUCTURAL_KEYS = /* @__PURE__ */ new Set([
	"blocks",
	"variations",
	"css"
]);
const EMPTY_INHERITANCE = Object.freeze({
	value: {},
	sources: {}
});
const SOURCE_DESCRIPTORS = {
	root: { layer: "root" },
	element: { layer: "element" },
	block: { layer: "block" },
	blockVariation: { layer: "blockVariation" }
};
function createSourceDescriptor(type) {
	const descriptor = SOURCE_DESCRIPTORS[type];
	if (!descriptor) return null;
	return { ...descriptor };
}
function createContribution(styles, source) {
	if (!styles || !source) return null;
	return {
		styles,
		source
	};
}
function getPathKey(path) {
	return path.join(".");
}
function getSourceForPath(source) {
	return { ...source };
}
function isExplicitEmpty(value) {
	if (value === "" || value === null) return true;
	if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return true;
	return false;
}
function isRefObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) && typeof value.ref === "string";
}
/**
* Pick the root-scope contribution from a single `styles` layer: plain leaves
* and sub-trees that are not tree-structural and not the `elements` sub-tree
* itself. The `elements` sub-tree IS preserved as a passthrough on the final
* payload so panels that read e.g. `inheritedValue.elements.link.color.text`
* keep working.
*
* Does not recurse or clone; the returned contribution references the original
* layer's sub-objects. The deep-merge step copies them into a fresh tree and
* resolves `{ ref }` values inline as it goes.
*
* @param layer Raw styles layer.
* @return Root-scope contribution, or `null` when the layer is empty.
*/
function pickLayerRootContribution(layer) {
	if (!layer || typeof layer !== "object" || Array.isArray(layer)) return null;
	const contribution = {};
	for (const key of Object.keys(layer)) {
		if (TREE_STRUCTURAL_KEYS.has(key)) continue;
		if (key === "elements") {
			if (layer.elements && typeof layer.elements === "object") contribution.elements = layer.elements;
			continue;
		}
		if (isExplicitEmpty(layer[key])) continue;
		contribution[key] = layer[key];
	}
	return Object.keys(contribution).length === 0 ? null : contribution;
}
const ATOMIC_OBJECT_KEYS = /* @__PURE__ */ new Set(["backgroundImage"]);
/**
* Deep-merge `source` into `target`:
* - Plain objects recurse.
* - `{ ref }` values at source are resolved against `globalStyles` and merged
*   in place of the reference.
* - Arrays, primitives, null, and atomic-object leaves (`ATOMIC_OBJECT_KEYS`)
*   replace wholesale.
* - Explicit-empty source leaves (`''`, `null`, `{}`) are dropped, preserving
*   the target's existing value.
*
* Mutates and returns `target`; does not mutate `source`.
*
* @param target
* @param source
* @param globalStyles
* @param sourceMetadata
* @param sources
* @param path
* @return The mutated `target`.
*/
function deepMergeDroppingEmpties(target, source, globalStyles, sourceMetadata, sources, path = []) {
	if (!source || typeof source !== "object" || Array.isArray(source)) return target;
	for (const key of Object.keys(source)) {
		let sourceValue = source[key];
		if (isExplicitEmpty(sourceValue)) continue;
		if (isRefObject(sourceValue)) {
			if (sourceValue.ref.trim() === "") continue;
			const resolved = getValueFromObjectPath(globalStyles, sourceValue.ref);
			if (resolved === void 0 || resolved === null || isRefObject(resolved)) continue;
			sourceValue = resolved;
		}
		const nextPath = [...path, key];
		if (!ATOMIC_OBJECT_KEYS.has(key) && sourceValue !== null && typeof sourceValue === "object" && !Array.isArray(sourceValue) && !isRefObject(sourceValue)) target[key] = deepMergeDroppingEmpties({ ...target[key] && typeof target[key] === "object" && !Array.isArray(target[key]) ? target[key] : {} }, sourceValue, globalStyles, sourceMetadata, sources, nextPath);
		else {
			target[key] = ATOMIC_OBJECT_KEYS.has(key) && sourceValue !== null && typeof sourceValue === "object" && !Array.isArray(sourceValue) ? { ...sourceValue } : sourceValue;
			if (sourceMetadata && sources) sources[getPathKey(nextPath)] = getSourceForPath(sourceMetadata);
		}
	}
	return target;
}
function getStateSlice(layerObject, selectedState) {
	if (!layerObject) return null;
	const slice = getStyleForState(layerObject, selectedState);
	return slice && typeof slice === "object" && !Array.isArray(slice) ? slice : null;
}
/**
* Root-level Global Styles for these property groups paint the root/layout
* element only and do not cascade to a descendant block, so a root-sourced
* leaf must not surface as the block's inherited value. Cascading properties
* (typography, `color.text`) and the `elements.*` passthrough are kept.
*
* `color.background` / `color.gradient` are the background-specific leaves
* under `color`; `color.text` deliberately stays.
*/
const NON_CASCADING_ROOT_PREFIXES = [
	"color.background",
	"color.gradient",
	"background",
	"spacing",
	"dimensions",
	"border",
	"shadow",
	"filter"
];
function isNonCascadingRootPath(pathKey) {
	if (pathKey.startsWith("elements.")) return false;
	return NON_CASCADING_ROOT_PREFIXES.some((prefix) => pathKey === prefix || pathKey.startsWith(`${prefix}.`));
}
function deleteAtPath(target, pathSegments) {
	if (!target || typeof target !== "object") return;
	const [head, ...rest] = pathSegments;
	if (rest.length === 0) {
		delete target[head];
		return;
	}
	const child = target[head];
	if (child && typeof child === "object") {
		deleteAtPath(child, rest);
		if (Object.keys(child).length === 0) delete target[head];
	}
}
function dropNonCascadingRootLeaves(value, sources) {
	for (const pathKey of Object.keys(sources)) if (sources[pathKey].layer === "root" && isNonCascadingRootPath(pathKey)) {
		deleteAtPath(value, pathKey.split("."));
		delete sources[pathKey];
	}
}
function resolveThemeFileBackgroundImage(value, globalStyles, links) {
	const image = value?.background?.backgroundImage;
	if (!image) return;
	const resolved = getResolvedValue(image, {
		...globalStyles,
		_links: links ?? void 0
	});
	if (resolved !== void 0) value.background.backgroundImage = resolved;
}
/**
* Internal, uncached merge. Computes the merged Global Styles payload and a
* source map describing which Global Styles layer supplied each winning leaf.
* `resolveStyle` is the public, memoized entry point.
*
* @param globalStyles          The Global Styles config (`{ styles, _links }`).
* @param context               Which slice to resolve.
* @param context.blockName     Block name (e.g. `core/heading`).
* @param context.variationName Slug of the active block style variation, or null.
* @param context.elements      Root-level `styles.elements.*` keys that paint this block, ordered low to high precedence.
* @param context.viewport      Responsive breakpoint, or null for the default viewport.
* @param context.pseudoState   CSS pseudo-state, or null for the default state.
* @return Merged panel-scoped payload and source map.
*/
function computeResolvedStyle(globalStyles, { blockName, variationName = null, elements = null, viewport = null, pseudoState = null } = {}) {
	if (!globalStyles || !globalStyles.styles) return EMPTY_INHERITANCE;
	if (!blockName) return EMPTY_INHERITANCE;
	const styles = globalStyles.styles;
	const selectedState = {
		viewport,
		pseudoState
	};
	const root = styles;
	const block = styles.blocks?.[blockName] ?? null;
	const elementLayers = (elements ?? []).map((elementName) => styles.elements?.[elementName] ?? null).filter((layer) => !!layer);
	const variation = variationName ? getVariationStyle(globalStyles, blockName, variationName) ?? null : null;
	const contributions = [
		createContribution(pickLayerRootContribution(root), createSourceDescriptor("root")),
		...elementLayers.map((layer) => createContribution(pickLayerRootContribution(layer), createSourceDescriptor("element"))),
		block ? createContribution(pickLayerRootContribution(block), createSourceDescriptor("block")) : null,
		variation ? createContribution(pickLayerRootContribution(variation), createSourceDescriptor("blockVariation")) : null
	];
	if (!isDefaultBlockStyleState(selectedState)) contributions.push(createContribution(pickLayerRootContribution(getStateSlice(root, selectedState)), createSourceDescriptor("root")), ...elementLayers.map((layer) => createContribution(pickLayerRootContribution(getStateSlice(layer, selectedState)), createSourceDescriptor("element"))), block ? createContribution(pickLayerRootContribution(getStateSlice(block, selectedState)), createSourceDescriptor("block")) : null, variation ? createContribution(pickLayerRootContribution(getStateSlice(variation, selectedState)), createSourceDescriptor("blockVariation")) : null);
	const filteredContributions = contributions.filter(Boolean);
	if (filteredContributions.length === 0) return EMPTY_INHERITANCE;
	const sources = {};
	const value = filteredContributions.reduce((mergedValue, contribution) => deepMergeDroppingEmpties(mergedValue, contribution.styles, globalStyles, contribution.source, sources), {});
	dropNonCascadingRootLeaves(value, sources);
	resolveThemeFileBackgroundImage(value, globalStyles, globalStyles._links ?? null);
	return {
		value,
		sources
	};
}
const NO_LINKS = {};
const memo$1 = /* @__PURE__ */ new WeakMap();
/**
* Public, memoized entry point for `computeResolvedStyle`. The active
* variation's styles are resolved internally from `context.variationName`.
*
* Panels for the same selection share one `globalStyles.styles` payload, so
* keying on it (not the per-hook config wrapper) collapses them to a single
* cascade merge.
*
* @param globalStyles The Global Styles config (`{ styles, _links }`).
* @param context      Which slice to resolve (block, variation, state).
* @return Merged panel-scoped payload and source map; may be a cache hit.
*/
function resolveStyle$1(globalStyles, context = {}) {
	const styleData = globalStyles?.styles;
	if (!styleData || typeof styleData !== "object") return computeResolvedStyle(globalStyles, context);
	let byLinks = memo$1.get(styleData);
	if (!byLinks) {
		byLinks = /* @__PURE__ */ new WeakMap();
		memo$1.set(styleData, byLinks);
	}
	const linksKey = globalStyles?._links ?? NO_LINKS;
	let inner = byLinks.get(linksKey);
	if (!inner) {
		inner = /* @__PURE__ */ new Map();
		byLinks.set(linksKey, inner);
	}
	const sliceKey = `${context.elements?.join(",") ?? ""}:${context.viewport ?? ""}:${context.pseudoState ?? ""}`;
	const key = (context.blockName || "") + "" + (context.variationName || "") + "" + sliceKey;
	if (inner.has(key)) return inner.get(key);
	const result = computeResolvedStyle(globalStyles, context);
	inner.set(key, result);
	return result;
}

// packages/global-styles-engine/build-module/lock-unlock.mjs
const { lock: lock$1, unlock: unlock$1 } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/global-styles-engine");

// packages/global-styles-engine/build-module/private-apis.mjs
const privateApis$11 = {};
lock$1(privateApis$11, {
	getResponsiveMediaQueries,
	getViewportBreakpoints: getViewportBreakpoints$2,
	getViewportBreakpointValueInPixels: getViewportBreakpointValueInPixels$1,
	getDuotoneFilter,
	getDuotoneStylesheet,
	getDuotoneUnsetStylesheet,
	resolveStyle: resolveStyle$1,
	getVariationStyle,
	transformToStylesWithTextClipBase
});

// packages/global-styles-ui/build-module/context.mjs
const GlobalStylesContext = (0, import_element.createContext)({
	user: {
		styles: {},
		settings: {}
	},
	base: {
		styles: {},
		settings: {}
	},
	merged: {
		styles: {},
		settings: {}
	},
	onChange: () => {},
	fontLibraryEnabled: false
});

// packages/global-styles-ui/build-module/provider.mjs
function GlobalStylesProvider({ children, value, baseValue, onChange, fontLibraryEnabled }) {
	const merged = (0, import_element.useMemo)(() => {
		return mergeGlobalStyles(baseValue, value);
	}, [baseValue, value]);
	const contextValue = (0, import_element.useMemo)(() => ({
		user: value,
		base: baseValue,
		merged,
		onChange,
		fontLibraryEnabled
	}), [
		value,
		baseValue,
		merged,
		onChange,
		fontLibraryEnabled
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalStylesContext.Provider, {
		value: contextValue,
		children
	});
}

// packages/global-styles-ui/build-module/icon-with-current-color.mjs
function IconWithCurrentColor({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(icon_default, {
		className: clsx(className, "global-styles-ui-icon-with-current-color"),
		...props
	});
}

// packages/global-styles-ui/build-module/navigation-button.mjs
function GenericNavigationButton({ icon, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalItem, {
		...props,
		children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
			justify: "flex-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconWithCurrentColor, {
				icon,
				size: 24
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.FlexItem, { children })]
		}), !icon && children]
	});
}
function NavigationButtonAsItem(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Navigator.Button, {
		as: GenericNavigationButton,
		...props
	});
}

// packages/global-styles-ui/build-module/lock-unlock.mjs
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/global-styles-ui");

// packages/global-styles-ui/build-module/utils.mjs
const { getViewportBreakpoints: getViewportBreakpoints$1, resolveStyle } = unlock(privateApis$11);
/**
* Valid states for elements with their labels.
* This mirrors the PHP constant in lib/class-wp-theme-json-gutenberg.php
*/
const VALID_ELEMENT_STATES = {
	link: [
		{
			value: ":link",
			label: (0, import_i18n.__)("Link")
		},
		{
			value: ":any-link",
			label: (0, import_i18n.__)("Any Link")
		},
		{
			value: ":visited",
			label: (0, import_i18n.__)("Visited")
		},
		{
			value: ":hover",
			label: (0, import_i18n.__)("Hover")
		},
		{
			value: ":focus",
			label: (0, import_i18n.__)("Focus")
		},
		{
			value: ":focus-visible",
			label: (0, import_i18n.__)("Focus-visible")
		},
		{
			value: ":active",
			label: (0, import_i18n.__)("Active")
		}
	],
	button: [
		{
			value: ":link",
			label: (0, import_i18n.__)("Link")
		},
		{
			value: ":any-link",
			label: (0, import_i18n.__)("Any Link")
		},
		{
			value: ":visited",
			label: (0, import_i18n.__)("Visited")
		},
		{
			value: ":hover",
			label: (0, import_i18n.__)("Hover")
		},
		{
			value: ":focus",
			label: (0, import_i18n.__)("Focus")
		},
		{
			value: ":focus-visible",
			label: (0, import_i18n.__)("Focus-visible")
		},
		{
			value: ":active",
			label: (0, import_i18n.__)("Active")
		}
	]
};
/**
* Valid states for blocks with their labels.
* This mirrors the PHP constant in lib/class-wp-theme-json-gutenberg.php
*/
const VALID_BLOCK_STATES = {
	"core/button": [
		{
			value: ":hover",
			label: (0, import_i18n.__)("Hover")
		},
		{
			value: ":focus",
			label: (0, import_i18n.__)("Focus")
		},
		{
			value: ":focus-visible",
			label: (0, import_i18n.__)("Focus-visible")
		},
		{
			value: ":active",
			label: (0, import_i18n.__)("Active")
		}
	],
	"core/navigation-link": [
		{
			value: ":hover",
			label: (0, import_i18n.__)("Hover")
		},
		{
			value: ":focus",
			label: (0, import_i18n.__)("Focus")
		},
		{
			value: ":focus-visible",
			label: (0, import_i18n.__)("Focus-visible")
		},
		{
			value: ":active",
			label: (0, import_i18n.__)("Active")
		}
	]
};
/**
* Responsive breakpoint states available for all blocks.
* These map to CSS media queries wrapping the block's styles.
*/
const RESPONSIVE_STATES = [{
	value: "@tablet",
	label: (0, import_i18n.__)("Tablet")
}, {
	value: "@mobile",
	label: (0, import_i18n.__)("Mobile")
}];
/**
* Removes all instances of properties from an object.
*
* @param object     The object to remove the properties from.
* @param properties The properties to remove.
* @return The modified object.
*/
function removePropertiesFromObject(object, properties) {
	if (!properties?.length) return object;
	if (typeof object !== "object" || !object || !Object.keys(object).length) return object;
	for (const key in object) if (properties.includes(key)) delete object[key];
	else if (typeof object[key] === "object") removePropertiesFromObject(object[key], properties);
	return object;
}
/**
* Returns a new object, with properties specified in `properties` array.,
* maintain the original object tree structure.
* The function is recursive, so it will perform a deep search for the given properties.
* E.g., the function will return `{ a: { b: { c: { test: 1 } } } }` if the properties are  `[ 'test' ]`.
*
* @param object     The object to filter
* @param properties The properties to filter by
* @return The merged object.
*/
const filterObjectByProperties = (object, properties) => {
	if (!object || !properties?.length) return {};
	const newObject = {};
	Object.keys(object).forEach((key) => {
		if (properties.includes(key)) newObject[key] = object[key];
		else if (typeof object[key] === "object") {
			const newFilter = filterObjectByProperties(object[key], properties);
			if (Object.keys(newFilter).length) newObject[key] = newFilter;
		}
	});
	return newObject;
};
/**
* Compares a style variation to the same variation filtered by the specified properties.
* Returns true if the variation contains only the properties specified.
*
* @param variation  The variation to compare.
* @param properties The properties to compare.
* @return Whether the variation contains only the specified properties.
*/
function isVariationWithProperties(variation, properties) {
	const variationWithProperties = filterObjectByProperties(structuredClone(variation), properties);
	return areGlobalStylesEqual(variationWithProperties, variation);
}
function getFontFamilyFromSetting(fontFamilies, setting) {
	if (!Array.isArray(fontFamilies) || !setting) return null;
	const fontFamilySlug = setting.replace("var(", "").replace(")", "")?.split("--").slice(-1)[0];
	return fontFamilies.find((fontFamily) => fontFamily.slug === fontFamilySlug);
}
/**
* Extracts font families from a theme JSON configuration.
*
* @param themeJson The theme JSON configuration
* @return Array containing [bodyFontFamily, headingFontFamily]
*/
function getFontFamilies(themeJson) {
	const themeFontFamilies = themeJson?.settings?.typography?.fontFamilies?.theme;
	const customFontFamilies = themeJson?.settings?.typography?.fontFamilies?.custom;
	let fontFamilies = [];
	if (themeFontFamilies && customFontFamilies) fontFamilies = [...themeFontFamilies, ...customFontFamilies];
	else if (themeFontFamilies) fontFamilies = themeFontFamilies;
	else if (customFontFamilies) fontFamilies = customFontFamilies;
	const bodyFontFamilySetting = themeJson?.styles?.typography?.fontFamily;
	const bodyFontFamily = getFontFamilyFromSetting(fontFamilies, bodyFontFamilySetting);
	const headingFontFamilySetting = themeJson?.styles?.elements?.heading?.typography?.fontFamily;
	let headingFontFamily;
	if (!headingFontFamilySetting) headingFontFamily = bodyFontFamily;
	else headingFontFamily = getFontFamilyFromSetting(fontFamilies, themeJson?.styles?.elements?.heading?.typography?.fontFamily);
	return [bodyFontFamily, headingFontFamily];
}
const BOX_SIDES = [
	"top",
	"right",
	"bottom",
	"left"
];
const SHORTHAND_LONGHANDS = {
	"border.color": BOX_SIDES.map((side) => `border.${side}.color`),
	"border.style": BOX_SIDES.map((side) => `border.${side}.style`),
	"border.width": BOX_SIDES.map((side) => `border.${side}.width`),
	"color.gradient": [
		"color.background",
		"background.backgroundImage",
		"background.backgroundPosition",
		"background.backgroundRepeat",
		"background.backgroundSize",
		"background.backgroundAttachment",
		"background.backgroundClip"
	]
};

// packages/global-styles-ui/build-module/hooks.mjs
/**
* Hook to get and set style values with memoization.
*
* @param path               The path to the style value.
* @param blockName          The name of the block, if applicable.
* @param readFrom           Which source to read from: "base" (theme), "user" (customizations), or "merged" (final result). Defaults to "merged".
* @param shouldDecodeEncode Whether to decode and encode the style value.
* @param state              Optional style state path. Supports viewport states (e.g. `@mobile`),
*                           pseudo-selector states (e.g. `:hover`) or both (e.g. `@mobile.:hover`).
*                           Pseudo selectors are always read/written as nested keys.
* @return An array containing the style value and a function to set the style
* value.
*
* @example
* const [ color, setColor ] = useStyle<string>( 'color.text', 'core/button', 'merged' );
* const [ hoverColor, setHoverColor ] = useStyle<string>( 'color.text', 'core/button', 'user', true, ':hover' );
*/
function useStyle(path, blockName, readFrom = "merged", shouldDecodeEncode = true, state) {
	const { user, base, merged, onChange } = (0, import_element.useContext)(GlobalStylesContext);
	const statePathParts = state?.split(".").filter(Boolean) ?? [];
	const pseudoSelectorState = statePathParts.find((value) => value.startsWith(":"));
	const stylePath = [path, statePathParts.filter((value) => !value.startsWith(":")).join(".")].filter(Boolean).join(".");
	let sourceValue = merged;
	if (readFrom === "base") sourceValue = base;
	else if (readFrom === "user") sourceValue = user;
	return [(0, import_element.useMemo)(() => {
		const rawValue = getStyle(sourceValue, stylePath, blockName, shouldDecodeEncode);
		if (pseudoSelectorState) return rawValue?.[pseudoSelectorState] ?? {};
		return rawValue;
	}, [
		sourceValue,
		stylePath,
		blockName,
		shouldDecodeEncode,
		pseudoSelectorState
	]), (0, import_element.useCallback)((newValue) => {
		let valueToSet = newValue;
		if (pseudoSelectorState) valueToSet = {
			...getStyle(user, stylePath, blockName, false),
			[pseudoSelectorState]: newValue
		};
		const newGlobalStyles = setStyle(user, stylePath, valueToSet, blockName);
		onChange(newGlobalStyles);
	}, [
		user,
		onChange,
		stylePath,
		blockName,
		pseudoSelectorState
	])];
}
/**
* Hook to get and set setting values with memoization.
*
* @param path      The path to the setting value.
* @param blockName The name of the block, if applicable.
* @param readFrom  Which source to read from: "base" (theme), "user" (customizations), or "merged" (final result). Defaults to "merged".
* @return An array containing the setting value and a function to set the
* setting value.
*
* @example
* const [ fontSize, setFontSize ] = useSetting<string>( 'fontSize', 'core/button', 'merged' );
*/
function useSetting(path, blockName, readFrom = "merged") {
	const { user, base, merged, onChange } = (0, import_element.useContext)(GlobalStylesContext);
	let sourceValue = merged;
	if (readFrom === "base") sourceValue = base;
	else if (readFrom === "user") sourceValue = user;
	return [(0, import_element.useMemo)(() => getSetting(sourceValue, path, blockName), [
		sourceValue,
		path,
		blockName
	]), (0, import_element.useCallback)((newValue) => {
		const newGlobalStyles = setSetting(user, path, newValue, blockName);
		onChange(newGlobalStyles);
	}, [
		user,
		onChange,
		path,
		blockName
	])];
}
const EMPTY_ARRAY$1 = [];
/**
* Checks whether a style variation is empty.
* @param root0
* @param root0.title
* @param root0.settings
* @param root0.styles
*/
function hasThemeVariation({ title, settings, styles }) {
	return title === (0, import_i18n.__)("Default") || Object.keys(settings || {}).length > 0 || Object.keys(styles || {}).length > 0;
}
/**
* Fetches the current theme style variations that contain only the specified properties
* and merges them with the user config.
* @param properties
*/
function useCurrentMergeThemeStyleVariationsWithUserConfig(properties = []) {
	const { variationsFromTheme } = (0, import_data.useSelect)((select) => {
		return { variationsFromTheme: select(import_core_data.store).__experimentalGetCurrentThemeGlobalStylesVariations?.() || EMPTY_ARRAY$1 };
	}, []);
	const { user: userVariation } = (0, import_element.useContext)(GlobalStylesContext);
	return (0, import_element.useMemo)(() => {
		const clonedUserVariation = structuredClone(userVariation);
		const userVariationWithoutProperties = removePropertiesFromObject(clonedUserVariation, properties);
		userVariationWithoutProperties.title = (0, import_i18n.__)("Default");
		const variationsByProperties = [userVariationWithoutProperties, ...variationsFromTheme.filter((variation) => {
			return isVariationWithProperties(variation, properties);
		}).map((variation) => {
			return mergeGlobalStyles(userVariationWithoutProperties, variation);
		})];
		return variationsByProperties?.length ? variationsByProperties.filter(hasThemeVariation) : [];
	}, [
		properties,
		userVariation,
		variationsFromTheme
	]);
}

// packages/global-styles-ui/build-module/root-menu.mjs
const { useHasDimensionsPanel: useHasDimensionsPanel$4, useHasTypographyPanel: useHasTypographyPanel$3, useHasColorPanel: useHasColorPanel$2, useSettingsForBlockElement: useSettingsForBlockElement$5, useHasBackgroundPanel: useHasBackgroundPanel$4 } = unlock(import_block_editor.privateApis);

// packages/global-styles-ui/build-module/palette-colors.mjs
/**
* Moves the background and text colors to the front of the palette so that
* style variation previews show the main color scheme (e.g. light or dark)
* first. Colors that are not in the palette are ignored, and the order of
* the remaining colors is preserved.
*
* @param paletteColors   The palette colors to reorder.
* @param backgroundColor The background color to place first.
* @param textColor       The text color to place second.
*
* @return A new array with the background and text colors at the front.
*/
function prioritizePaletteColors(paletteColors, backgroundColor, textColor) {
	const prioritizedColors = [...paletteColors];
	const moveColorToIndex = (color, targetIndex) => {
		const currentIndex = prioritizedColors.findIndex((paletteColor) => paletteColor.color === color);
		if (currentIndex === -1) return;
		const [paletteColor] = prioritizedColors.splice(currentIndex, 1);
		prioritizedColors.splice(targetIndex, 0, paletteColor);
	};
	moveColorToIndex(backgroundColor, 0);
	if (textColor !== backgroundColor) moveColorToIndex(textColor, 1);
	return prioritizedColors;
}

// packages/global-styles-ui/build-module/preview-hooks.mjs
function useStylesPreviewColors() {
	const [textColor = "black"] = useStyle("color.text");
	const [backgroundColor = "white"] = useStyle("color.background");
	const [headingColor = textColor] = useStyle("elements.h1.color.text");
	const [linkColor = headingColor] = useStyle("elements.link.color.text");
	const [buttonBackgroundColor = linkColor] = useStyle("elements.button.color.background");
	const [coreColors] = useSetting("color.palette.core") || [];
	const [themeColors] = useSetting("color.palette.theme") || [];
	const [customColors] = useSetting("color.palette.custom") || [];
	const paletteColors = prioritizePaletteColors((themeColors ?? []).concat(customColors ?? []).concat(coreColors ?? []), backgroundColor, textColor);
	const textColorObject = paletteColors.filter(({ color }) => color === textColor);
	const buttonBackgroundColorObject = paletteColors.filter(({ color }) => color === buttonBackgroundColor);
	return {
		paletteColors,
		highlightedColors: textColorObject.concat(buttonBackgroundColorObject).concat(paletteColors).filter(({ color }) => color !== backgroundColor).slice(0, 2)
	};
}

// packages/global-styles-ui/build-module/font-library/utils/preview-styles.mjs
function findNearest(input, numbers) {
	if (numbers.length === 0) return null;
	numbers.sort((a, b) => Math.abs(input - a) - Math.abs(input - b));
	return numbers[0];
}
const FONT_WEIGHT_KEYWORDS = {
	normal: 400,
	bold: 700
};
function isValidWeight(weight) {
	return weight !== void 0 && Number.isFinite(weight) && weight >= 1 && weight <= 1e3;
}
function resolveFontWeight(fontWeight) {
	const weights = String(fontWeight ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean).map((value) => FONT_WEIGHT_KEYWORDS[value] ?? Number(value));
	const [start, end] = weights;
	if (!isValidWeight(start)) return "400";
	if (weights.length !== 2 || !isValidWeight(end)) return String(start);
	return String(Math.min(Math.max(400, start), end));
}
function formatFontFamily(input) {
	const regex = /^(?!generic\([ a-zA-Z\-]+\)$)(?!var\(\s*--[\w-]+\s*\)$)(?!^[a-zA-Z\-]+$).+/;
	const output = input.trim();
	const formatItem = (item) => {
		item = item.trim();
		if (item.match(regex)) {
			item = item.replace(/^["']|["']$/g, "");
			return `"${item}"`;
		}
		return item;
	};
	if (output.includes(",")) return output.split(",").map(formatItem).filter((item) => item !== "").join(", ");
	return formatItem(output);
}
function getFamilyPreviewStyle(family) {
	const style = { fontFamily: formatFontFamily(family.fontFamily) };
	if (!("fontFace" in family) || !Array.isArray(family.fontFace)) {
		style.fontWeight = "400";
		style.fontStyle = "normal";
		return style;
	}
	if (family.fontFace) {
		const normalFaces = family.fontFace.filter((face) => face?.fontStyle && face.fontStyle.toLowerCase() === "normal");
		if (normalFaces.length > 0) {
			style.fontStyle = "normal";
			const normalWeights = normalFaces.map((face) => Number(resolveFontWeight(face.fontWeight)));
			style.fontWeight = String(findNearest(400, normalWeights) ?? 400);
		} else {
			style.fontStyle = family.fontFace.length && family.fontFace[0].fontStyle || "normal";
			style.fontWeight = family.fontFace.length && resolveFontWeight(family.fontFace[0].fontWeight) || "400";
		}
	}
	return style;
}

// packages/global-styles-ui/build-module/typography-example.mjs
function PreviewTypography({ fontSize, variation }) {
	const { base } = (0, import_element.useContext)(GlobalStylesContext);
	let config = base;
	if (variation) config = {
		...base,
		...variation
	};
	const [textColor] = useStyle("color.text");
	const [bodyFontFamilies, headingFontFamilies] = getFontFamilies(config);
	const bodyPreviewStyle = bodyFontFamilies ? getFamilyPreviewStyle(bodyFontFamilies) : {};
	const headingPreviewStyle = headingFontFamilies ? getFamilyPreviewStyle(headingFontFamilies) : {};
	if (textColor) {
		bodyPreviewStyle.color = textColor;
		headingPreviewStyle.color = textColor;
	}
	if (fontSize) {
		bodyPreviewStyle.fontSize = fontSize;
		headingPreviewStyle.fontSize = fontSize;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__unstableMotion.div, {
		animate: {
			scale: 1,
			opacity: 1
		},
		initial: {
			scale: .1,
			opacity: 0
		},
		transition: {
			delay: .3,
			type: "tween"
		},
		style: {
			textAlign: "center",
			lineHeight: 1
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			style: headingPreviewStyle,
			children: (0, import_i18n._x)("A", "Uppercase letter A")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			style: bodyPreviewStyle,
			children: (0, import_i18n._x)("a", "Lowercase letter A")
		})]
	});
}

// packages/global-styles-ui/build-module/highlighted-colors.mjs
function HighlightedColors({ normalizedColorSwatchSize, ratio }) {
	const { highlightedColors } = useStylesPreviewColors();
	const scaledSwatchSize = normalizedColorSwatchSize * ratio;
	return highlightedColors.map(({ slug, color }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableMotion.div, {
		style: {
			height: scaledSwatchSize,
			width: scaledSwatchSize,
			background: color,
			borderRadius: scaledSwatchSize / 2
		},
		animate: {
			scale: 1,
			opacity: 1
		},
		initial: {
			scale: .1,
			opacity: 0
		},
		transition: { delay: index === 1 ? .2 : .1 }
	}, `${slug}-${index}`));
}

// packages/global-styles-ui/build-module/preview-wrapper.mjs
const normalizedWidth = 248;
const normalizedHeight = 152;
const THROTTLE_OPTIONS = {
	leading: true,
	trailing: true
};
function PreviewWrapper({ children, label, isFocused, withHoverView }) {
	const [backgroundColor = "white"] = useStyle("color.background");
	const [gradientValue] = useStyle("color.gradient");
	const disableMotion = (0, import_compose.useReducedMotion)();
	const [isHovered, setIsHovered] = (0, import_element.useState)(false);
	const [containerResizeListener, { width }] = (0, import_compose.useResizeObserver)();
	const [throttledWidth, setThrottledWidthState] = (0, import_element.useState)(width);
	const [ratioState, setRatioState] = (0, import_element.useState)();
	const setThrottledWidth = (0, import_compose.useThrottle)(setThrottledWidthState, 250, THROTTLE_OPTIONS);
	(0, import_element.useLayoutEffect)(() => {
		if (width) setThrottledWidth(width);
	}, [width, setThrottledWidth]);
	(0, import_element.useLayoutEffect)(() => {
		const newRatio = throttledWidth ? throttledWidth / normalizedWidth : 1;
		const ratioDiff = newRatio - (ratioState || 0);
		if (Math.abs(ratioDiff) > .1 || !ratioState) setRatioState(newRatio);
	}, [throttledWidth, ratioState]);
	const fallbackRatio = width ? width / normalizedWidth : 1;
	const ratio = ratioState ? ratioState : fallbackRatio;
	const isReady = !!width;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: { position: "relative" },
			children: containerResizeListener
		}),
		!isReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
			className: "global-styles-ui-preview__wrapper",
			style: { aspectRatio: normalizedWidth / normalizedHeight }
		}),
		isReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: clsx("global-styles-ui-preview__wrapper", { "is-hoverable": withHoverView }),
			style: { height: normalizedHeight * ratio },
			onMouseEnter: () => setIsHovered(true),
			onMouseLeave: () => setIsHovered(false),
			tabIndex: -1,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableMotion.div, {
				style: {
					height: normalizedHeight * ratio,
					width: "100%",
					background: gradientValue ?? backgroundColor
				},
				initial: "start",
				animate: (isHovered || isFocused) && !disableMotion && label ? "hover" : "start",
				children: [].concat(children).map((child, key) => child({
					ratio,
					key
				}))
			})
		})
	] });
}

// packages/global-styles-ui/build-module/preview-styles.mjs
const firstFrameVariants$1 = {
	start: {
		scale: 1,
		opacity: 1
	},
	hover: {
		scale: 0,
		opacity: 0
	}
};
const midFrameVariants = {
	hover: { opacity: 1 },
	start: { opacity: .5 }
};
const secondFrameVariants = {
	hover: {
		scale: 1,
		opacity: 1
	},
	start: {
		scale: 0,
		opacity: 0
	}
};
function PreviewStyles({ label, isFocused, withHoverView, variation }) {
	const [fontWeight] = useStyle("typography.fontWeight");
	const [fontFamily = "serif"] = useStyle("typography.fontFamily");
	const [headingFontFamily = fontFamily] = useStyle("elements.h1.typography.fontFamily");
	const [headingFontWeight = fontWeight] = useStyle("elements.h1.typography.fontWeight");
	const [textColor = "black"] = useStyle("color.text");
	const [headingColor = textColor] = useStyle("elements.h1.color.text");
	const { paletteColors } = useStylesPreviewColors();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PreviewWrapper, {
		label,
		isFocused,
		withHoverView,
		children: [
			({ ratio, key }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableMotion.div, {
				variants: firstFrameVariants$1,
				style: {
					height: "100%",
					overflow: "hidden"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
					spacing: 10 * ratio,
					justify: "center",
					style: {
						height: "100%",
						overflow: "hidden"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewTypography, {
						fontSize: 65 * ratio,
						variation
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalVStack, {
						spacing: 4 * ratio,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HighlightedColors, {
							normalizedColorSwatchSize: 32,
							ratio
						})
					})]
				})
			}, key),
			({ key }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableMotion.div, {
				variants: withHoverView ? midFrameVariants : void 0,
				style: {
					height: "100%",
					width: "100%",
					position: "absolute",
					top: 0,
					overflow: "hidden",
					filter: "blur(60px)",
					opacity: .1
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalHStack, {
					spacing: 0,
					justify: "flex-start",
					style: {
						height: "100%",
						overflow: "hidden"
					},
					children: paletteColors.slice(0, 4).map(({ color }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
						height: "100%",
						background: color,
						flexGrow: 1
					} }, index))
				})
			}, key),
			({ ratio, key }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableMotion.div, {
				variants: secondFrameVariants,
				style: {
					height: "100%",
					width: "100%",
					overflow: "hidden",
					position: "absolute",
					top: 0
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalVStack, {
					spacing: 3 * ratio,
					justify: "center",
					style: {
						height: "100%",
						overflow: "hidden",
						padding: 10 * ratio,
						boxSizing: "border-box"
					},
					children: label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 40 * ratio,
							fontFamily: headingFontFamily,
							color: headingColor,
							fontWeight: headingFontWeight,
							lineHeight: "1em",
							textAlign: "center"
						},
						children: label
					})
				})
			}, key)
		]
	});
}

// packages/global-styles-ui/build-module/variations/variations-panel.mjs
function getFilteredBlockStyles(blockStyles, variations) {
	return blockStyles?.filter((style) => style.source === "block" || variations.includes(style.name)) || [];
}
function useBlockVariations(name) {
	const blockStyles = (0, import_data.useSelect)((select) => {
		const { getBlockStyles } = select(import_blocks.store);
		return getBlockStyles(name);
	}, [name]);
	const [variations] = useStyle("variations", name);
	return getFilteredBlockStyles(blockStyles, Object.keys(variations ?? {}));
}

// packages/global-styles-ui/build-module/screen-header.mjs
const { StateControl, StateControlBadges } = unlock(import_block_editor.privateApis);

// packages/global-styles-ui/build-module/subtitle.mjs
function Subtitle({ children, level = 2 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalHeading, {
		className: "global-styles-ui-subtitle",
		level,
		children
	});
}

// packages/global-styles-ui/build-module/block-preview-panel.mjs
const { getViewportBreakpoints, getViewportBreakpointValueInPixels } = unlock(privateApis$11);

// packages/global-styles-ui/build-module/screen-block.mjs
const { useHasDimensionsPanel: useHasDimensionsPanel$3, useHasTypographyPanel: useHasTypographyPanel$2, useHasBorderPanel: useHasBorderPanel$2, useSettingsForBlockElement: useSettingsForBlockElement$4, useHasColorPanel: useHasColorPanel$1, useHasFiltersPanel, useHasImageSettingsPanel, useHasBackgroundPanel: useHasBackgroundPanel$3, BackgroundPanel: StylesBackgroundPanel$2, BorderPanel: StylesBorderPanel$1, ColorPanel: StylesColorPanel, TypographyPanel: StylesTypographyPanel$1, DimensionsPanel: StylesDimensionsPanel$2, FiltersPanel: StylesFiltersPanel, ImageSettingsPanel, AdvancedPanel: StylesAdvancedPanel$2 } = unlock(import_block_editor.privateApis);

// packages/global-styles-ui/build-module/screen-element.mjs
const { useSettingsForBlockElement: useSettingsForBlockElement$3, useHasBackgroundPanel: useHasBackgroundPanel$2, useHasBorderPanel: useHasBorderPanel$1, useHasDimensionsPanel: useHasDimensionsPanel$2, useHasTypographyPanel: useHasTypographyPanel$1, BackgroundPanel: StylesBackgroundPanel$1, BorderPanel: StylesBorderPanel, DimensionsPanel: StylesDimensionsPanel$1, TypographyPanel: StylesTypographyPanel, AdvancedPanel: StylesAdvancedPanel$1, getBlockTypesForElement } = unlock(import_block_editor.privateApis);
const ELEMENTS = {
	text: {
		description: (0, import_i18n.__)("Manage the fonts used on the site."),
		title: (0, import_i18n.__)("Text")
	},
	link: {
		description: (0, import_i18n.__)("Manage the appearance of links."),
		title: (0, import_i18n.__)("Link")
	},
	caption: {
		description: (0, import_i18n.__)("Manage the appearance of captions."),
		title: (0, import_i18n.__)("Caption")
	},
	cite: {
		description: (0, import_i18n.__)("Manage the appearance of citations."),
		title: (0, import_i18n.__)("Citation")
	},
	heading: {
		description: (0, import_i18n.__)("Manage the appearance of all headings."),
		title: (0, import_i18n.__)("All headings")
	},
	h1: {
		description: (0, import_i18n.__)("Manage the appearance of level 1 headings."),
		title: (0, import_i18n.__)("Heading 1")
	},
	h2: {
		description: (0, import_i18n.__)("Manage the appearance of level 2 headings."),
		title: (0, import_i18n.__)("Heading 2")
	},
	h3: {
		description: (0, import_i18n.__)("Manage the appearance of level 3 headings."),
		title: (0, import_i18n.__)("Heading 3")
	},
	h4: {
		description: (0, import_i18n.__)("Manage the appearance of level 4 headings."),
		title: (0, import_i18n.__)("Heading 4")
	},
	h5: {
		description: (0, import_i18n.__)("Manage the appearance of level 5 headings."),
		title: (0, import_i18n.__)("Heading 5")
	},
	h6: {
		description: (0, import_i18n.__)("Manage the appearance of level 6 headings."),
		title: (0, import_i18n.__)("Heading 6")
	},
	textInput: {
		description: (0, import_i18n.__)("Manage the appearance of inputs."),
		title: (0, import_i18n.__)("Form input")
	},
	select: {
		description: (0, import_i18n.__)("Manage the appearance of selects."),
		title: (0, import_i18n.__)("Form select")
	},
	button: {
		description: (0, import_i18n.__)("Manage the appearance of buttons."),
		title: (0, import_i18n.__)("Form button")
	}
};

// packages/global-styles-ui/build-module/screen-block-list.mjs
const { useHasDimensionsPanel: useHasDimensionsPanel$1, useHasTypographyPanel, useHasBorderPanel, useSettingsForBlockElement: useSettingsForBlockElement$2, useHasColorPanel, useHasBackgroundPanel: useHasBackgroundPanel$1, searchItems } = unlock(import_block_editor.privateApis);
const ELEMENT_GROUPS = [
	{
		title: (0, import_i18n.__)("Elements"),
		elements: [
			"link",
			"caption",
			"cite"
		]
	},
	{
		title: (0, import_i18n.__)("Headings"),
		elements: [
			"heading",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6"
		]
	},
	{
		title: (0, import_i18n.__)("Form controls"),
		elements: [
			"textInput",
			"select",
			"button"
		]
	}
];
const ELEMENT_ICONS = {
	link: link_default,
	caption: caption_default,
	cite: caption_default,
	heading: heading_default,
	h1: heading_level_1_default,
	h2: heading_level_2_default,
	h3: heading_level_3_default,
	h4: heading_level_4_default,
	h5: heading_level_5_default,
	h6: heading_level_6_default,
	textInput: form_input_default,
	select: form_select_default,
	button: button_default
};
/**
* Whether a value, or anything nested inside it, holds a real user value.
*
* A user entry can survive as an empty husk: clearing a value writes
* `undefined` in place rather than removing the key, so
* `{ color: { text: undefined } }` means "not customized". An empty string
* and zero are real values — an intentionally blank CSS string is still a
* user entry.
*
* @param value The value to inspect.
* @return Whether the value holds at least one leaf value.
*/
function hasAnyValue(value) {
	if (value === void 0 || value === null) return false;
	if (Array.isArray(value)) return value.length > 0;
	if (typeof value === "object") return Object.values(value).some(hasAnyValue);
	return true;
}
/**
* Whether the user has customized a block.
*
* Per-block user data lives under two roots: `styles.blocks` for style values
* and `settings.blocks` for things like a block-specific color palette. Either
* one counts as a customization, and both are resettable by the user.
*
* Reads the user layer only. The merged config would match nearly every block,
* because themes style most of them.
*
* @param user      The user's global styles config.
* @param blockName The block to check, e.g. `core/quote`.
* @return Whether the user has any styles or settings for that block.
*/
function hasUserStylesForBlock(user, blockName) {
	return hasAnyValue(user?.styles?.blocks?.[blockName]) || hasAnyValue(user?.settings?.blocks?.[blockName]);
}
function useSortedBlockTypes() {
	const blockItems = (0, import_data.useSelect)((select) => select(import_blocks.store).getBlockTypes(), []);
	const groupByType = (blocks, block) => {
		const { core, noncore } = blocks;
		(block.name.startsWith("core/") ? core : noncore).push(block);
		return blocks;
	};
	const { core: coreItems, noncore: nonCoreItems } = blockItems.reduce(groupByType, {
		core: [],
		noncore: []
	});
	return [...coreItems, ...nonCoreItems];
}
function useBlockHasGlobalStyles(blockName) {
	const [rawSettings] = useSetting("", blockName);
	const settings = useSettingsForBlockElement$2(rawSettings, blockName);
	const hasTypographyPanel = useHasTypographyPanel(settings);
	const hasColorPanel = useHasColorPanel(settings);
	const hasBackgroundPanel = useHasBackgroundPanel$1(settings);
	const hasBorderPanel = useHasBorderPanel(settings);
	const hasDimensionsPanel = useHasDimensionsPanel$1(settings);
	const hasLayoutPanel = hasBorderPanel || hasDimensionsPanel;
	const hasVariationsPanel = !!useBlockVariations(blockName)?.length;
	return hasTypographyPanel || hasColorPanel || hasBackgroundPanel || hasLayoutPanel || hasVariationsPanel;
}
function ListMenuItem({ path, icon, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationButtonAsItem, {
		path,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
			direction: "row",
			align: "center",
			gap: "sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, {
				className: "global-styles-ui-block-types-item__icon",
				icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title })]
		})
	});
}
function BlockMenuItem({ block }) {
	if (!useBlockHasGlobalStyles(block.name)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMenuItem, {
		path: "/blocks/" + encodeURIComponent(block.name),
		icon: block.icon,
		title: block.title
	});
}
function ElementMenuItem({ element }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMenuItem, {
		path: "/blocks/elements/" + element,
		icon: ELEMENT_ICONS[element],
		title: ELEMENTS[element].title
	});
}
function ListGroup({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "global-styles-ui-block-types-group",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "global-styles-ui-block-types-group__title",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Subtitle, {
				level: 3,
				children: title
			})
		}), children]
	});
}
function EmptyList({ filterValue, styleFilter }) {
	const label = "customized" === styleFilter && !filterValue ? (0, import_i18n.__)("You haven't customized any blocks or elements yet.") : (0, import_i18n.__)("No results found.");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalText, {
		align: "center",
		as: "p",
		className: "global-styles-ui-block-types-item-list__no-results",
		children: label
	});
}
function getFilteredElementGroups(filterValue, styleFilter, customizedElementNames) {
	const search = filterValue.trim().toLowerCase();
	return ELEMENT_GROUPS.map((group) => ({
		...group,
		elements: group.elements.filter((element) => (!search || [
			ELEMENTS[element].title,
			element,
			group.title
		].join(" ").toLowerCase().includes(search)) && (styleFilter !== "customized" || customizedElementNames.has(element)))
	})).filter((group) => group.elements.length > 0);
}
function BlockAndElementList({ filterValue, styleFilter }) {
	const sortedBlockTypes = useSortedBlockTypes();
	const debouncedSpeak = (0, import_compose.useDebounce)(speak, 500);
	const { user } = (0, import_element.useContext)(GlobalStylesContext);
	const customizedBlockNames = (0, import_element.useMemo)(() => {
		const names = /* @__PURE__ */ new Set();
		[...Object.keys(user?.styles?.blocks ?? {}), ...Object.keys(user?.settings?.blocks ?? {})].forEach((blockName) => {
			if (hasUserStylesForBlock(user, blockName)) names.add(blockName);
		});
		return names;
	}, [user]);
	const filteredElementGroups = getFilteredElementGroups(filterValue, styleFilter, (0, import_element.useMemo)(() => {
		const names = /* @__PURE__ */ new Set();
		Object.entries(user?.styles?.elements ?? {}).forEach(([name, styles]) => {
			if (hasAnyValue(styles)) names.add(name);
		});
		return names;
	}, [user]));
	const searchedBlockTypes = searchItems(sortedBlockTypes, filterValue);
	const filteredBlockTypes = styleFilter === "customized" ? searchedBlockTypes.filter((blockType) => customizedBlockNames.has(blockType.name)) : searchedBlockTypes;
	const blockTypesListRef = (0, import_element.useRef)(null);
	const elementCount = filteredElementGroups.reduce((total, group) => total + group.elements.length, 0);
	const hasBlockResults = filteredBlockTypes.length > 0;
	(0, import_element.useEffect)(() => {
		if (!filterValue && styleFilter === "all") return;
		const blockCount = hasBlockResults ? blockTypesListRef.current?.childElementCount || 0 : 0;
		const count = elementCount + blockCount;
		const resultsFoundMessage = (0, import_i18n.sprintf)((0, import_i18n._n)("%d result found.", "%d results found.", count), count);
		debouncedSpeak(resultsFoundMessage, "polite");
	}, [
		filterValue,
		styleFilter,
		hasBlockResults,
		elementCount,
		debouncedSpeak
	]);
	if (!elementCount && !hasBlockResults) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyList, {
		filterValue,
		styleFilter
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [filteredElementGroups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListGroup, {
		title: group.title,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalItemGroup, {
			className: "global-styles-ui-block-types-item-list",
			size: "small",
			children: group.elements.map((element) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElementMenuItem, { element }, element))
		})
	}, group.title)), hasBlockResults && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListGroup, {
		title: (0, import_i18n.__)("Blocks"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalItemGroup, {
			ref: blockTypesListRef,
			className: "global-styles-ui-block-types-item-list",
			size: "small",
			children: filteredBlockTypes.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockMenuItem, { block }, "menu-itemblock-" + block.name))
		})
	})] });
}
const MemoizedBlockAndElementList = (0, import_element.memo)(BlockAndElementList);

// packages/global-styles-ui/build-module/preview-typography.mjs
const StylesPreviewTypography = ({ variation, isFocused, withHoverView }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewWrapper, {
		label: variation.title,
		isFocused,
		withHoverView,
		children: ({ ratio, key }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalHStack, {
			spacing: 10 * ratio,
			justify: "center",
			style: {
				height: "100%",
				overflow: "hidden"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewTypography, {
				variation,
				fontSize: 85 * ratio
			})
		}, key)
	});
};

// \0wp-global:@wordpress/keycodes
var require_keycodes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.keycodes;
}));

// packages/global-styles-ui/build-module/variations/variation.mjs
var import_keycodes = require_keycodes();
function Variation({ variation, children, isPill = false, properties, showTooltip = false }) {
	const [isFocused, setIsFocused] = (0, import_element.useState)(false);
	const { base, user, onChange: setUserConfig } = (0, import_element.useContext)(GlobalStylesContext);
	const context = (0, import_element.useMemo)(() => {
		let merged = mergeGlobalStyles(base, variation);
		if (properties) merged = filterObjectByProperties(merged, properties);
		return {
			user: variation,
			base,
			merged,
			onChange: () => {}
		};
	}, [
		variation,
		base,
		properties
	]);
	const selectVariation = () => setUserConfig(variation);
	const selectOnEnter = (event) => {
		if (event.keyCode === import_keycodes.ENTER) {
			event.preventDefault();
			selectVariation();
		}
	};
	const isActive = (0, import_element.useMemo)(() => areGlobalStylesEqual(user, variation), [user, variation]);
	let label = variation?.title;
	if (variation?.description) label = (0, import_i18n.sprintf)((0, import_i18n._x)("%1$s (%2$s)", "variation label"), variation?.title, variation?.description);
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: clsx("global-styles-ui-variations_item", { "is-active": isActive }),
		role: "button",
		onClick: selectVariation,
		onKeyDown: selectOnEnter,
		tabIndex: 0,
		"aria-label": label,
		"aria-current": isActive,
		onFocus: () => setIsFocused(true),
		onBlur: () => setIsFocused(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: clsx("global-styles-ui-variations_item-preview", { "is-pill": isPill }),
			children: children(isFocused)
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalStylesContext.Provider, {
		value: context,
		children: showTooltip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, { render: content }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, { children: variation?.title })] }) : content
	});
}

// packages/global-styles-ui/build-module/variations/variations-typography.mjs
const propertiesToFilter$1 = ["typography"];
function TypographyVariations$1({ title, gap = 2 }) {
	const typographyVariations = useCurrentMergeThemeStyleVariationsWithUserConfig(propertiesToFilter$1);
	if (typographyVariations?.length <= 1) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
		spacing: 3,
		children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Subtitle, {
			level: 3,
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalGrid, {
			columns: 3,
			gap,
			className: "global-styles-ui-style-variations-container",
			children: typographyVariations.map((variation, index) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Variation, {
					variation,
					properties: propertiesToFilter$1,
					showTooltip: true,
					children: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylesPreviewTypography, { variation })
				}, index);
			})
		})]
	});
}

// packages/global-styles-ui/build-module/font-library/utils/constants.mjs
const FONT_WEIGHTS = {
	100: (0, import_i18n._x)("Thin", "font weight"),
	200: (0, import_i18n._x)("Extra-light", "font weight"),
	300: (0, import_i18n._x)("Light", "font weight"),
	400: (0, import_i18n._x)("Normal", "font weight"),
	500: (0, import_i18n._x)("Medium", "font weight"),
	600: (0, import_i18n._x)("Semi-bold", "font weight"),
	700: (0, import_i18n._x)("Bold", "font weight"),
	800: (0, import_i18n._x)("Extra-bold", "font weight"),
	900: (0, import_i18n._x)("Black", "font weight")
};
const FONT_STYLES = {
	normal: (0, import_i18n._x)("Normal", "font style"),
	italic: (0, import_i18n._x)("Italic", "font style")
};

// packages/global-styles-ui/build-module/font-library/utils/index.mjs
/**
* Browser dependencies
*/
const { File } = window;

// packages/global-styles-ui/build-module/font-library/context.mjs
const FontLibraryContext = (0, import_element.createContext)({});
FontLibraryContext.displayName = "FontLibraryContext";

// packages/global-styles-ui/build-module/font-library/font-collection.mjs
const DEFAULT_CATEGORY = {
	slug: "all",
	name: (0, import_i18n._x)("All", "font categories")
};

// packages/global-styles-ui/build-module/font-library/lib/unbrotli.mjs
var __require$1 = /* @__PURE__ */ ((x) => typeof __require$2 !== "undefined" ? __require$2 : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof __require$2 !== "undefined" ? __require$2 : a)[b] }) : x)(function(x) {
	if (typeof __require$2 !== "undefined") return __require$2.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
});
/**
* Credits:
*
* lib-font
* https://github.com/Pomax/lib-font
* https://github.com/Pomax/lib-font/blob/master/lib/unbrotli.js
*
* The MIT License (MIT)
*
* Copyright (c) 2020 pomax@nihongoresources.com
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
var unbrotli_default = (function() {
	return (function() {
		function r(e, n, t) {
			function o(i, f) {
				if (!n[i]) {
					if (!e[i]) {
						var c = "function" == typeof __require$1 && __require$1;
						if (!f && c) return c(i, !0);
						if (u) return u(i, !0);
						var a = /* @__PURE__ */ new Error("Cannot find module '" + i + "'");
						throw a.code = "MODULE_NOT_FOUND", a;
					}
					var p = n[i] = { exports: {} };
					e[i][0].call(p.exports, function(r) {
						var n = e[i][1][r];
						return o(n || r);
					}, p, p.exports, r, e, n, t);
				}
				return n[i].exports;
			}
			for (var u = "function" == typeof __require$1 && __require$1, i = 0; i < t.length; i++) o(t[i]);
			return o;
		}
		return r;
	})()({
		1: [function(require, module, exports) {
			var BROTLI_READ_SIZE = 4096;
			var BROTLI_IBUF_SIZE = 2 * BROTLI_READ_SIZE + 32;
			var BROTLI_IBUF_MASK = 2 * BROTLI_READ_SIZE - 1;
			var kBitMask = new Uint32Array([
				0,
				1,
				3,
				7,
				15,
				31,
				63,
				127,
				255,
				511,
				1023,
				2047,
				4095,
				8191,
				16383,
				32767,
				65535,
				131071,
				262143,
				524287,
				1048575,
				2097151,
				4194303,
				8388607,
				16777215
			]);
			function BrotliBitReader(input) {
				this.buf_ = new Uint8Array(BROTLI_IBUF_SIZE);
				this.input_ = input;
				this.reset();
			}
			BrotliBitReader.READ_SIZE = BROTLI_READ_SIZE;
			BrotliBitReader.IBUF_MASK = BROTLI_IBUF_MASK;
			BrotliBitReader.prototype.reset = function() {
				this.buf_ptr_ = 0;
				this.val_ = 0;
				this.pos_ = 0;
				this.bit_pos_ = 0;
				this.bit_end_pos_ = 0;
				this.eos_ = 0;
				this.readMoreInput();
				for (var i = 0; i < 4; i++) {
					this.val_ |= this.buf_[this.pos_] << 8 * i;
					++this.pos_;
				}
				return this.bit_end_pos_ > 0;
			};
			BrotliBitReader.prototype.readMoreInput = function() {
				if (this.bit_end_pos_ > 256) return;
				else if (this.eos_) {
					if (this.bit_pos_ > this.bit_end_pos_) throw new Error("Unexpected end of input " + this.bit_pos_ + " " + this.bit_end_pos_);
				} else {
					var dst = this.buf_ptr_;
					var bytes_read = this.input_.read(this.buf_, dst, BROTLI_READ_SIZE);
					if (bytes_read < 0) throw new Error("Unexpected end of input");
					if (bytes_read < BROTLI_READ_SIZE) {
						this.eos_ = 1;
						for (var p = 0; p < 32; p++) this.buf_[dst + bytes_read + p] = 0;
					}
					if (dst === 0) {
						for (var p = 0; p < 32; p++) this.buf_[(BROTLI_READ_SIZE << 1) + p] = this.buf_[p];
						this.buf_ptr_ = BROTLI_READ_SIZE;
					} else this.buf_ptr_ = 0;
					this.bit_end_pos_ += bytes_read << 3;
				}
			};
			BrotliBitReader.prototype.fillBitWindow = function() {
				while (this.bit_pos_ >= 8) {
					this.val_ >>>= 8;
					this.val_ |= this.buf_[this.pos_ & BROTLI_IBUF_MASK] << 24;
					++this.pos_;
					this.bit_pos_ = this.bit_pos_ - 8 >>> 0;
					this.bit_end_pos_ = this.bit_end_pos_ - 8 >>> 0;
				}
			};
			BrotliBitReader.prototype.readBits = function(n_bits) {
				if (32 - this.bit_pos_ < n_bits) this.fillBitWindow();
				var val = this.val_ >>> this.bit_pos_ & kBitMask[n_bits];
				this.bit_pos_ += n_bits;
				return val;
			};
			module.exports = BrotliBitReader;
		}, {}],
		2: [function(require, module, exports) {
			exports.lookup = new Uint8Array([
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				4,
				4,
				0,
				0,
				4,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				8,
				12,
				16,
				12,
				12,
				20,
				12,
				16,
				24,
				28,
				12,
				12,
				32,
				12,
				36,
				12,
				44,
				44,
				44,
				44,
				44,
				44,
				44,
				44,
				44,
				44,
				32,
				32,
				24,
				40,
				28,
				12,
				12,
				48,
				52,
				52,
				52,
				48,
				52,
				52,
				52,
				48,
				52,
				52,
				52,
				52,
				52,
				48,
				52,
				52,
				52,
				52,
				52,
				48,
				52,
				52,
				52,
				52,
				52,
				24,
				12,
				28,
				12,
				12,
				12,
				56,
				60,
				60,
				60,
				56,
				60,
				60,
				60,
				56,
				60,
				60,
				60,
				60,
				60,
				56,
				60,
				60,
				60,
				60,
				60,
				56,
				60,
				60,
				60,
				60,
				60,
				24,
				12,
				28,
				12,
				0,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				0,
				1,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				2,
				3,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				1,
				1,
				1,
				1,
				1,
				1,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				1,
				1,
				1,
				1,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				0,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				3,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				4,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				5,
				6,
				6,
				6,
				6,
				6,
				6,
				6,
				6,
				6,
				6,
				6,
				6,
				6,
				6,
				6,
				7,
				0,
				8,
				8,
				8,
				8,
				8,
				8,
				8,
				8,
				8,
				8,
				8,
				8,
				8,
				8,
				8,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				24,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				32,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				40,
				48,
				48,
				48,
				48,
				48,
				48,
				48,
				48,
				48,
				48,
				48,
				48,
				48,
				48,
				48,
				56,
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10,
				11,
				12,
				13,
				14,
				15,
				16,
				17,
				18,
				19,
				20,
				21,
				22,
				23,
				24,
				25,
				26,
				27,
				28,
				29,
				30,
				31,
				32,
				33,
				34,
				35,
				36,
				37,
				38,
				39,
				40,
				41,
				42,
				43,
				44,
				45,
				46,
				47,
				48,
				49,
				50,
				51,
				52,
				53,
				54,
				55,
				56,
				57,
				58,
				59,
				60,
				61,
				62,
				63,
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10,
				11,
				12,
				13,
				14,
				15,
				16,
				17,
				18,
				19,
				20,
				21,
				22,
				23,
				24,
				25,
				26,
				27,
				28,
				29,
				30,
				31,
				32,
				33,
				34,
				35,
				36,
				37,
				38,
				39,
				40,
				41,
				42,
				43,
				44,
				45,
				46,
				47,
				48,
				49,
				50,
				51,
				52,
				53,
				54,
				55,
				56,
				57,
				58,
				59,
				60,
				61,
				62,
				63,
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10,
				11,
				12,
				13,
				14,
				15,
				16,
				17,
				18,
				19,
				20,
				21,
				22,
				23,
				24,
				25,
				26,
				27,
				28,
				29,
				30,
				31,
				32,
				33,
				34,
				35,
				36,
				37,
				38,
				39,
				40,
				41,
				42,
				43,
				44,
				45,
				46,
				47,
				48,
				49,
				50,
				51,
				52,
				53,
				54,
				55,
				56,
				57,
				58,
				59,
				60,
				61,
				62,
				63,
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10,
				11,
				12,
				13,
				14,
				15,
				16,
				17,
				18,
				19,
				20,
				21,
				22,
				23,
				24,
				25,
				26,
				27,
				28,
				29,
				30,
				31,
				32,
				33,
				34,
				35,
				36,
				37,
				38,
				39,
				40,
				41,
				42,
				43,
				44,
				45,
				46,
				47,
				48,
				49,
				50,
				51,
				52,
				53,
				54,
				55,
				56,
				57,
				58,
				59,
				60,
				61,
				62,
				63,
				0,
				0,
				0,
				0,
				1,
				1,
				1,
				1,
				2,
				2,
				2,
				2,
				3,
				3,
				3,
				3,
				4,
				4,
				4,
				4,
				5,
				5,
				5,
				5,
				6,
				6,
				6,
				6,
				7,
				7,
				7,
				7,
				8,
				8,
				8,
				8,
				9,
				9,
				9,
				9,
				10,
				10,
				10,
				10,
				11,
				11,
				11,
				11,
				12,
				12,
				12,
				12,
				13,
				13,
				13,
				13,
				14,
				14,
				14,
				14,
				15,
				15,
				15,
				15,
				16,
				16,
				16,
				16,
				17,
				17,
				17,
				17,
				18,
				18,
				18,
				18,
				19,
				19,
				19,
				19,
				20,
				20,
				20,
				20,
				21,
				21,
				21,
				21,
				22,
				22,
				22,
				22,
				23,
				23,
				23,
				23,
				24,
				24,
				24,
				24,
				25,
				25,
				25,
				25,
				26,
				26,
				26,
				26,
				27,
				27,
				27,
				27,
				28,
				28,
				28,
				28,
				29,
				29,
				29,
				29,
				30,
				30,
				30,
				30,
				31,
				31,
				31,
				31,
				32,
				32,
				32,
				32,
				33,
				33,
				33,
				33,
				34,
				34,
				34,
				34,
				35,
				35,
				35,
				35,
				36,
				36,
				36,
				36,
				37,
				37,
				37,
				37,
				38,
				38,
				38,
				38,
				39,
				39,
				39,
				39,
				40,
				40,
				40,
				40,
				41,
				41,
				41,
				41,
				42,
				42,
				42,
				42,
				43,
				43,
				43,
				43,
				44,
				44,
				44,
				44,
				45,
				45,
				45,
				45,
				46,
				46,
				46,
				46,
				47,
				47,
				47,
				47,
				48,
				48,
				48,
				48,
				49,
				49,
				49,
				49,
				50,
				50,
				50,
				50,
				51,
				51,
				51,
				51,
				52,
				52,
				52,
				52,
				53,
				53,
				53,
				53,
				54,
				54,
				54,
				54,
				55,
				55,
				55,
				55,
				56,
				56,
				56,
				56,
				57,
				57,
				57,
				57,
				58,
				58,
				58,
				58,
				59,
				59,
				59,
				59,
				60,
				60,
				60,
				60,
				61,
				61,
				61,
				61,
				62,
				62,
				62,
				62,
				63,
				63,
				63,
				63,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			]);
			exports.lookupOffsets = new Uint16Array([
				1024,
				1536,
				1280,
				1536,
				0,
				256,
				768,
				512
			]);
		}, {}],
		3: [function(require, module, exports) {
			var BrotliInput = require("./streams").BrotliInput;
			var BrotliOutput = require("./streams").BrotliOutput;
			var BrotliBitReader = require("./bit_reader");
			var BrotliDictionary = require("./dictionary");
			var HuffmanCode = require("./huffman").HuffmanCode;
			var BrotliBuildHuffmanTable = require("./huffman").BrotliBuildHuffmanTable;
			var Context = require("./context");
			var Prefix = require("./prefix");
			var Transform = require("./transform");
			var kDefaultCodeLength = 8;
			var kCodeLengthRepeatCode = 16;
			var kNumLiteralCodes = 256;
			var kNumInsertAndCopyCodes = 704;
			var kNumBlockLengthCodes = 26;
			var kLiteralContextBits = 6;
			var kDistanceContextBits = 2;
			var HUFFMAN_TABLE_BITS = 8;
			var HUFFMAN_TABLE_MASK = 255;
			var HUFFMAN_MAX_TABLE_SIZE = 1080;
			var CODE_LENGTH_CODES = 18;
			var kCodeLengthCodeOrder = new Uint8Array([
				1,
				2,
				3,
				4,
				0,
				5,
				17,
				6,
				16,
				7,
				8,
				9,
				10,
				11,
				12,
				13,
				14,
				15
			]);
			var NUM_DISTANCE_SHORT_CODES = 16;
			var kDistanceShortCodeIndexOffset = new Uint8Array([
				3,
				2,
				1,
				0,
				3,
				3,
				3,
				3,
				3,
				3,
				2,
				2,
				2,
				2,
				2,
				2
			]);
			var kDistanceShortCodeValueOffset = new Int8Array([
				0,
				0,
				0,
				0,
				-1,
				1,
				-2,
				2,
				-3,
				3,
				-1,
				1,
				-2,
				2,
				-3,
				3
			]);
			var kMaxHuffmanTableSize = new Uint16Array([
				256,
				402,
				436,
				468,
				500,
				534,
				566,
				598,
				630,
				662,
				694,
				726,
				758,
				790,
				822,
				854,
				886,
				920,
				952,
				984,
				1016,
				1048,
				1080
			]);
			function DecodeWindowBits(br) {
				var n;
				if (br.readBits(1) === 0) return 16;
				n = br.readBits(3);
				if (n > 0) return 17 + n;
				n = br.readBits(3);
				if (n > 0) return 8 + n;
				return 17;
			}
			function DecodeVarLenUint8(br) {
				if (br.readBits(1)) {
					var nbits = br.readBits(3);
					if (nbits === 0) return 1;
					else return br.readBits(nbits) + (1 << nbits);
				}
				return 0;
			}
			function MetaBlockLength() {
				this.meta_block_length = 0;
				this.input_end = 0;
				this.is_uncompressed = 0;
				this.is_metadata = false;
			}
			function DecodeMetaBlockLength(br) {
				var out = new MetaBlockLength();
				var size_nibbles;
				var size_bytes;
				var i;
				out.input_end = br.readBits(1);
				if (out.input_end && br.readBits(1)) return out;
				size_nibbles = br.readBits(2) + 4;
				if (size_nibbles === 7) {
					out.is_metadata = true;
					if (br.readBits(1) !== 0) throw new Error("Invalid reserved bit");
					size_bytes = br.readBits(2);
					if (size_bytes === 0) return out;
					for (i = 0; i < size_bytes; i++) {
						var next_byte = br.readBits(8);
						if (i + 1 === size_bytes && size_bytes > 1 && next_byte === 0) throw new Error("Invalid size byte");
						out.meta_block_length |= next_byte << i * 8;
					}
				} else for (i = 0; i < size_nibbles; ++i) {
					var next_nibble = br.readBits(4);
					if (i + 1 === size_nibbles && size_nibbles > 4 && next_nibble === 0) throw new Error("Invalid size nibble");
					out.meta_block_length |= next_nibble << i * 4;
				}
				++out.meta_block_length;
				if (!out.input_end && !out.is_metadata) out.is_uncompressed = br.readBits(1);
				return out;
			}
			function ReadSymbol(table, index, br) {
				var nbits;
				br.fillBitWindow();
				index += br.val_ >>> br.bit_pos_ & HUFFMAN_TABLE_MASK;
				nbits = table[index].bits - HUFFMAN_TABLE_BITS;
				if (nbits > 0) {
					br.bit_pos_ += HUFFMAN_TABLE_BITS;
					index += table[index].value;
					index += br.val_ >>> br.bit_pos_ & (1 << nbits) - 1;
				}
				br.bit_pos_ += table[index].bits;
				return table[index].value;
			}
			function ReadHuffmanCodeLengths(code_length_code_lengths, num_symbols, code_lengths, br) {
				var symbol = 0;
				var prev_code_len = kDefaultCodeLength;
				var repeat = 0;
				var repeat_code_len = 0;
				var space = 32768;
				var table = [];
				for (var i = 0; i < 32; i++) table.push(new HuffmanCode(0, 0));
				BrotliBuildHuffmanTable(table, 0, 5, code_length_code_lengths, CODE_LENGTH_CODES);
				while (symbol < num_symbols && space > 0) {
					var p = 0;
					var code_len;
					br.readMoreInput();
					br.fillBitWindow();
					p += br.val_ >>> br.bit_pos_ & 31;
					br.bit_pos_ += table[p].bits;
					code_len = table[p].value & 255;
					if (code_len < kCodeLengthRepeatCode) {
						repeat = 0;
						code_lengths[symbol++] = code_len;
						if (code_len !== 0) {
							prev_code_len = code_len;
							space -= 32768 >> code_len;
						}
					} else {
						var extra_bits = code_len - 14;
						var old_repeat;
						var repeat_delta;
						var new_len = 0;
						if (code_len === kCodeLengthRepeatCode) new_len = prev_code_len;
						if (repeat_code_len !== new_len) {
							repeat = 0;
							repeat_code_len = new_len;
						}
						old_repeat = repeat;
						if (repeat > 0) {
							repeat -= 2;
							repeat <<= extra_bits;
						}
						repeat += br.readBits(extra_bits) + 3;
						repeat_delta = repeat - old_repeat;
						if (symbol + repeat_delta > num_symbols) throw new Error("[ReadHuffmanCodeLengths] symbol + repeat_delta > num_symbols");
						for (var x = 0; x < repeat_delta; x++) code_lengths[symbol + x] = repeat_code_len;
						symbol += repeat_delta;
						if (repeat_code_len !== 0) space -= repeat_delta << 15 - repeat_code_len;
					}
				}
				if (space !== 0) throw new Error("[ReadHuffmanCodeLengths] space = " + space);
				for (; symbol < num_symbols; symbol++) code_lengths[symbol] = 0;
			}
			function ReadHuffmanCode(alphabet_size, tables, table, br) {
				var table_size = 0;
				var simple_code_or_skip;
				var code_lengths = new Uint8Array(alphabet_size);
				br.readMoreInput();
				simple_code_or_skip = br.readBits(2);
				if (simple_code_or_skip === 1) {
					var i;
					var max_bits_counter = alphabet_size - 1;
					var max_bits = 0;
					var symbols = /* @__PURE__ */ new Int32Array(4);
					var num_symbols = br.readBits(2) + 1;
					while (max_bits_counter) {
						max_bits_counter >>= 1;
						++max_bits;
					}
					for (i = 0; i < num_symbols; ++i) {
						symbols[i] = br.readBits(max_bits) % alphabet_size;
						code_lengths[symbols[i]] = 2;
					}
					code_lengths[symbols[0]] = 1;
					switch (num_symbols) {
						case 1: break;
						case 3:
							if (symbols[0] === symbols[1] || symbols[0] === symbols[2] || symbols[1] === symbols[2]) throw new Error("[ReadHuffmanCode] invalid symbols");
							break;
						case 2:
							if (symbols[0] === symbols[1]) throw new Error("[ReadHuffmanCode] invalid symbols");
							code_lengths[symbols[1]] = 1;
							break;
						case 4:
							if (symbols[0] === symbols[1] || symbols[0] === symbols[2] || symbols[0] === symbols[3] || symbols[1] === symbols[2] || symbols[1] === symbols[3] || symbols[2] === symbols[3]) throw new Error("[ReadHuffmanCode] invalid symbols");
							if (br.readBits(1)) {
								code_lengths[symbols[2]] = 3;
								code_lengths[symbols[3]] = 3;
							} else code_lengths[symbols[0]] = 2;
					}
				} else {
					var i;
					var code_length_code_lengths = new Uint8Array(CODE_LENGTH_CODES);
					var space = 32;
					var num_codes = 0;
					var huff = [
						new HuffmanCode(2, 0),
						new HuffmanCode(2, 4),
						new HuffmanCode(2, 3),
						new HuffmanCode(3, 2),
						new HuffmanCode(2, 0),
						new HuffmanCode(2, 4),
						new HuffmanCode(2, 3),
						new HuffmanCode(4, 1),
						new HuffmanCode(2, 0),
						new HuffmanCode(2, 4),
						new HuffmanCode(2, 3),
						new HuffmanCode(3, 2),
						new HuffmanCode(2, 0),
						new HuffmanCode(2, 4),
						new HuffmanCode(2, 3),
						new HuffmanCode(4, 5)
					];
					for (i = simple_code_or_skip; i < CODE_LENGTH_CODES && space > 0; ++i) {
						var code_len_idx = kCodeLengthCodeOrder[i];
						var p = 0;
						var v;
						br.fillBitWindow();
						p += br.val_ >>> br.bit_pos_ & 15;
						br.bit_pos_ += huff[p].bits;
						v = huff[p].value;
						code_length_code_lengths[code_len_idx] = v;
						if (v !== 0) {
							space -= 32 >> v;
							++num_codes;
						}
					}
					if (!(num_codes === 1 || space === 0)) throw new Error("[ReadHuffmanCode] invalid num_codes or space");
					ReadHuffmanCodeLengths(code_length_code_lengths, alphabet_size, code_lengths, br);
				}
				table_size = BrotliBuildHuffmanTable(tables, table, HUFFMAN_TABLE_BITS, code_lengths, alphabet_size);
				if (table_size === 0) throw new Error("[ReadHuffmanCode] BuildHuffmanTable failed: ");
				return table_size;
			}
			function ReadBlockLength(table, index, br) {
				var code;
				var nbits;
				code = ReadSymbol(table, index, br);
				nbits = Prefix.kBlockLengthPrefixCode[code].nbits;
				return Prefix.kBlockLengthPrefixCode[code].offset + br.readBits(nbits);
			}
			function TranslateShortCodes(code, ringbuffer, index) {
				var val;
				if (code < NUM_DISTANCE_SHORT_CODES) {
					index += kDistanceShortCodeIndexOffset[code];
					index &= 3;
					val = ringbuffer[index] + kDistanceShortCodeValueOffset[code];
				} else val = code - NUM_DISTANCE_SHORT_CODES + 1;
				return val;
			}
			function MoveToFront(v, index) {
				var value = v[index];
				var i = index;
				for (; i; --i) v[i] = v[i - 1];
				v[0] = value;
			}
			function InverseMoveToFrontTransform(v, v_len) {
				var mtf = /* @__PURE__ */ new Uint8Array(256);
				var i = 0;
				for (; i < 256; ++i) mtf[i] = i;
				for (i = 0; i < v_len; ++i) {
					var index = v[i];
					v[i] = mtf[index];
					if (index) MoveToFront(mtf, index);
				}
			}
			function HuffmanTreeGroup(alphabet_size, num_htrees) {
				this.alphabet_size = alphabet_size;
				this.num_htrees = num_htrees;
				this.codes = new Array(num_htrees + num_htrees * kMaxHuffmanTableSize[alphabet_size + 31 >>> 5]);
				this.htrees = new Uint32Array(num_htrees);
			}
			HuffmanTreeGroup.prototype.decode = function(br) {
				var i;
				var table_size;
				var next = 0;
				for (i = 0; i < this.num_htrees; ++i) {
					this.htrees[i] = next;
					table_size = ReadHuffmanCode(this.alphabet_size, this.codes, next, br);
					next += table_size;
				}
			};
			function DecodeContextMap(context_map_size, br) {
				var out = {
					num_htrees: null,
					context_map: null
				};
				var use_rle_for_zeros;
				var max_run_length_prefix = 0;
				var table;
				var i;
				br.readMoreInput();
				var num_htrees = out.num_htrees = DecodeVarLenUint8(br) + 1;
				var context_map = out.context_map = new Uint8Array(context_map_size);
				if (num_htrees <= 1) return out;
				use_rle_for_zeros = br.readBits(1);
				if (use_rle_for_zeros) max_run_length_prefix = br.readBits(4) + 1;
				table = [];
				for (i = 0; i < HUFFMAN_MAX_TABLE_SIZE; i++) table[i] = new HuffmanCode(0, 0);
				ReadHuffmanCode(num_htrees + max_run_length_prefix, table, 0, br);
				for (i = 0; i < context_map_size;) {
					var code;
					br.readMoreInput();
					code = ReadSymbol(table, 0, br);
					if (code === 0) {
						context_map[i] = 0;
						++i;
					} else if (code <= max_run_length_prefix) {
						var reps = 1 + (1 << code) + br.readBits(code);
						while (--reps) {
							if (i >= context_map_size) throw new Error("[DecodeContextMap] i >= context_map_size");
							context_map[i] = 0;
							++i;
						}
					} else {
						context_map[i] = code - max_run_length_prefix;
						++i;
					}
				}
				if (br.readBits(1)) InverseMoveToFrontTransform(context_map, context_map_size);
				return out;
			}
			function DecodeBlockType(max_block_type, trees, tree_type, block_types, ringbuffers, indexes, br) {
				var ringbuffer = tree_type * 2;
				var index = tree_type;
				var type_code = ReadSymbol(trees, tree_type * HUFFMAN_MAX_TABLE_SIZE, br);
				var block_type;
				if (type_code === 0) block_type = ringbuffers[ringbuffer + (indexes[index] & 1)];
				else if (type_code === 1) block_type = ringbuffers[ringbuffer + (indexes[index] - 1 & 1)] + 1;
				else block_type = type_code - 2;
				if (block_type >= max_block_type) block_type -= max_block_type;
				block_types[tree_type] = block_type;
				ringbuffers[ringbuffer + (indexes[index] & 1)] = block_type;
				++indexes[index];
			}
			function CopyUncompressedBlockToOutput(output, len, pos, ringbuffer, ringbuffer_mask, br) {
				var rb_size = ringbuffer_mask + 1;
				var rb_pos = pos & ringbuffer_mask;
				var br_pos = br.pos_ & BrotliBitReader.IBUF_MASK;
				var nbytes;
				if (len < 8 || br.bit_pos_ + (len << 3) < br.bit_end_pos_) {
					while (len-- > 0) {
						br.readMoreInput();
						ringbuffer[rb_pos++] = br.readBits(8);
						if (rb_pos === rb_size) {
							output.write(ringbuffer, rb_size);
							rb_pos = 0;
						}
					}
					return;
				}
				if (br.bit_end_pos_ < 32) throw new Error("[CopyUncompressedBlockToOutput] br.bit_end_pos_ < 32");
				while (br.bit_pos_ < 32) {
					ringbuffer[rb_pos] = br.val_ >>> br.bit_pos_;
					br.bit_pos_ += 8;
					++rb_pos;
					--len;
				}
				nbytes = br.bit_end_pos_ - br.bit_pos_ >> 3;
				if (br_pos + nbytes > BrotliBitReader.IBUF_MASK) {
					var tail = BrotliBitReader.IBUF_MASK + 1 - br_pos;
					for (var x = 0; x < tail; x++) ringbuffer[rb_pos + x] = br.buf_[br_pos + x];
					nbytes -= tail;
					rb_pos += tail;
					len -= tail;
					br_pos = 0;
				}
				for (var x = 0; x < nbytes; x++) ringbuffer[rb_pos + x] = br.buf_[br_pos + x];
				rb_pos += nbytes;
				len -= nbytes;
				if (rb_pos >= rb_size) {
					output.write(ringbuffer, rb_size);
					rb_pos -= rb_size;
					for (var x = 0; x < rb_pos; x++) ringbuffer[x] = ringbuffer[rb_size + x];
				}
				while (rb_pos + len >= rb_size) {
					nbytes = rb_size - rb_pos;
					if (br.input_.read(ringbuffer, rb_pos, nbytes) < nbytes) throw new Error("[CopyUncompressedBlockToOutput] not enough bytes");
					output.write(ringbuffer, rb_size);
					len -= nbytes;
					rb_pos = 0;
				}
				if (br.input_.read(ringbuffer, rb_pos, len) < len) throw new Error("[CopyUncompressedBlockToOutput] not enough bytes");
				br.reset();
			}
			function JumpToByteBoundary(br) {
				var new_bit_pos = br.bit_pos_ + 7 & -8;
				return br.readBits(new_bit_pos - br.bit_pos_) == 0;
			}
			function BrotliDecompressedSize(buffer) {
				var br = new BrotliBitReader(new BrotliInput(buffer));
				DecodeWindowBits(br);
				return DecodeMetaBlockLength(br).meta_block_length;
			}
			exports.BrotliDecompressedSize = BrotliDecompressedSize;
			function BrotliDecompressBuffer(buffer, output_size) {
				var input = new BrotliInput(buffer);
				if (output_size == null) output_size = BrotliDecompressedSize(buffer);
				var output = new BrotliOutput(new Uint8Array(output_size));
				BrotliDecompress(input, output);
				if (output.pos < output.buffer.length) output.buffer = output.buffer.subarray(0, output.pos);
				return output.buffer;
			}
			exports.BrotliDecompressBuffer = BrotliDecompressBuffer;
			function BrotliDecompress(input, output) {
				var i;
				var pos = 0;
				var input_end = 0;
				var window_bits = 0;
				var max_backward_distance;
				var max_distance = 0;
				var ringbuffer_size;
				var ringbuffer_mask;
				var ringbuffer;
				var ringbuffer_end;
				var dist_rb = [
					16,
					15,
					11,
					4
				];
				var dist_rb_idx = 0;
				var prev_byte1 = 0;
				var prev_byte2 = 0;
				var hgroup = [
					new HuffmanTreeGroup(0, 0),
					new HuffmanTreeGroup(0, 0),
					new HuffmanTreeGroup(0, 0)
				];
				var block_type_trees;
				var block_len_trees;
				var br;
				var kRingBufferWriteAheadSlack = 128 + BrotliBitReader.READ_SIZE;
				br = new BrotliBitReader(input);
				window_bits = DecodeWindowBits(br);
				max_backward_distance = (1 << window_bits) - 16;
				ringbuffer_size = 1 << window_bits;
				ringbuffer_mask = ringbuffer_size - 1;
				ringbuffer = new Uint8Array(ringbuffer_size + kRingBufferWriteAheadSlack + BrotliDictionary.maxDictionaryWordLength);
				ringbuffer_end = ringbuffer_size;
				block_type_trees = [];
				block_len_trees = [];
				for (var x = 0; x < 3 * HUFFMAN_MAX_TABLE_SIZE; x++) {
					block_type_trees[x] = new HuffmanCode(0, 0);
					block_len_trees[x] = new HuffmanCode(0, 0);
				}
				while (!input_end) {
					var meta_block_remaining_len = 0;
					var is_uncompressed;
					var block_length = [
						1 << 28,
						1 << 28,
						1 << 28
					];
					var block_type = [0];
					var num_block_types = [
						1,
						1,
						1
					];
					var block_type_rb = [
						0,
						1,
						0,
						1,
						0,
						1
					];
					var block_type_rb_index = [0];
					var distance_postfix_bits;
					var num_direct_distance_codes;
					var distance_postfix_mask;
					var num_distance_codes;
					var context_map = null;
					var context_modes = null;
					var num_literal_htrees;
					var dist_context_map = null;
					var num_dist_htrees;
					var context_offset = 0;
					var context_map_slice = null;
					var literal_htree_index = 0;
					var dist_context_offset = 0;
					var dist_context_map_slice = null;
					var dist_htree_index = 0;
					var context_lookup_offset1 = 0;
					var context_lookup_offset2 = 0;
					var context_mode;
					var htree_command;
					for (i = 0; i < 3; ++i) {
						hgroup[i].codes = null;
						hgroup[i].htrees = null;
					}
					br.readMoreInput();
					var _out = DecodeMetaBlockLength(br);
					meta_block_remaining_len = _out.meta_block_length;
					if (pos + meta_block_remaining_len > output.buffer.length) {
						var tmp = new Uint8Array(pos + meta_block_remaining_len);
						tmp.set(output.buffer);
						output.buffer = tmp;
					}
					input_end = _out.input_end;
					is_uncompressed = _out.is_uncompressed;
					if (_out.is_metadata) {
						JumpToByteBoundary(br);
						for (; meta_block_remaining_len > 0; --meta_block_remaining_len) {
							br.readMoreInput();
							br.readBits(8);
						}
						continue;
					}
					if (meta_block_remaining_len === 0) continue;
					if (is_uncompressed) {
						br.bit_pos_ = br.bit_pos_ + 7 & -8;
						CopyUncompressedBlockToOutput(output, meta_block_remaining_len, pos, ringbuffer, ringbuffer_mask, br);
						pos += meta_block_remaining_len;
						continue;
					}
					for (i = 0; i < 3; ++i) {
						num_block_types[i] = DecodeVarLenUint8(br) + 1;
						if (num_block_types[i] >= 2) {
							ReadHuffmanCode(num_block_types[i] + 2, block_type_trees, i * HUFFMAN_MAX_TABLE_SIZE, br);
							ReadHuffmanCode(kNumBlockLengthCodes, block_len_trees, i * HUFFMAN_MAX_TABLE_SIZE, br);
							block_length[i] = ReadBlockLength(block_len_trees, i * HUFFMAN_MAX_TABLE_SIZE, br);
							block_type_rb_index[i] = 1;
						}
					}
					br.readMoreInput();
					distance_postfix_bits = br.readBits(2);
					num_direct_distance_codes = NUM_DISTANCE_SHORT_CODES + (br.readBits(4) << distance_postfix_bits);
					distance_postfix_mask = (1 << distance_postfix_bits) - 1;
					num_distance_codes = num_direct_distance_codes + (48 << distance_postfix_bits);
					context_modes = new Uint8Array(num_block_types[0]);
					for (i = 0; i < num_block_types[0]; ++i) {
						br.readMoreInput();
						context_modes[i] = br.readBits(2) << 1;
					}
					var _o1 = DecodeContextMap(num_block_types[0] << kLiteralContextBits, br);
					num_literal_htrees = _o1.num_htrees;
					context_map = _o1.context_map;
					var _o2 = DecodeContextMap(num_block_types[2] << kDistanceContextBits, br);
					num_dist_htrees = _o2.num_htrees;
					dist_context_map = _o2.context_map;
					hgroup[0] = new HuffmanTreeGroup(kNumLiteralCodes, num_literal_htrees);
					hgroup[1] = new HuffmanTreeGroup(kNumInsertAndCopyCodes, num_block_types[1]);
					hgroup[2] = new HuffmanTreeGroup(num_distance_codes, num_dist_htrees);
					for (i = 0; i < 3; ++i) hgroup[i].decode(br);
					context_map_slice = 0;
					dist_context_map_slice = 0;
					context_mode = context_modes[block_type[0]];
					context_lookup_offset1 = Context.lookupOffsets[context_mode];
					context_lookup_offset2 = Context.lookupOffsets[context_mode + 1];
					htree_command = hgroup[1].htrees[0];
					while (meta_block_remaining_len > 0) {
						var cmd_code;
						var range_idx;
						var insert_code;
						var copy_code;
						var insert_length;
						var copy_length;
						var distance_code;
						var distance;
						var context;
						var j;
						var copy_dst;
						br.readMoreInput();
						if (block_length[1] === 0) {
							DecodeBlockType(num_block_types[1], block_type_trees, 1, block_type, block_type_rb, block_type_rb_index, br);
							block_length[1] = ReadBlockLength(block_len_trees, HUFFMAN_MAX_TABLE_SIZE, br);
							htree_command = hgroup[1].htrees[block_type[1]];
						}
						--block_length[1];
						cmd_code = ReadSymbol(hgroup[1].codes, htree_command, br);
						range_idx = cmd_code >> 6;
						if (range_idx >= 2) {
							range_idx -= 2;
							distance_code = -1;
						} else distance_code = 0;
						insert_code = Prefix.kInsertRangeLut[range_idx] + (cmd_code >> 3 & 7);
						copy_code = Prefix.kCopyRangeLut[range_idx] + (cmd_code & 7);
						insert_length = Prefix.kInsertLengthPrefixCode[insert_code].offset + br.readBits(Prefix.kInsertLengthPrefixCode[insert_code].nbits);
						copy_length = Prefix.kCopyLengthPrefixCode[copy_code].offset + br.readBits(Prefix.kCopyLengthPrefixCode[copy_code].nbits);
						prev_byte1 = ringbuffer[pos - 1 & ringbuffer_mask];
						prev_byte2 = ringbuffer[pos - 2 & ringbuffer_mask];
						for (j = 0; j < insert_length; ++j) {
							br.readMoreInput();
							if (block_length[0] === 0) {
								DecodeBlockType(num_block_types[0], block_type_trees, 0, block_type, block_type_rb, block_type_rb_index, br);
								block_length[0] = ReadBlockLength(block_len_trees, 0, br);
								context_offset = block_type[0] << kLiteralContextBits;
								context_map_slice = context_offset;
								context_mode = context_modes[block_type[0]];
								context_lookup_offset1 = Context.lookupOffsets[context_mode];
								context_lookup_offset2 = Context.lookupOffsets[context_mode + 1];
							}
							context = Context.lookup[context_lookup_offset1 + prev_byte1] | Context.lookup[context_lookup_offset2 + prev_byte2];
							literal_htree_index = context_map[context_map_slice + context];
							--block_length[0];
							prev_byte2 = prev_byte1;
							prev_byte1 = ReadSymbol(hgroup[0].codes, hgroup[0].htrees[literal_htree_index], br);
							ringbuffer[pos & ringbuffer_mask] = prev_byte1;
							if ((pos & ringbuffer_mask) === ringbuffer_mask) output.write(ringbuffer, ringbuffer_size);
							++pos;
						}
						meta_block_remaining_len -= insert_length;
						if (meta_block_remaining_len <= 0) break;
						if (distance_code < 0) {
							var context;
							br.readMoreInput();
							if (block_length[2] === 0) {
								DecodeBlockType(num_block_types[2], block_type_trees, 2, block_type, block_type_rb, block_type_rb_index, br);
								block_length[2] = ReadBlockLength(block_len_trees, 2 * HUFFMAN_MAX_TABLE_SIZE, br);
								dist_context_offset = block_type[2] << kDistanceContextBits;
								dist_context_map_slice = dist_context_offset;
							}
							--block_length[2];
							context = (copy_length > 4 ? 3 : copy_length - 2) & 255;
							dist_htree_index = dist_context_map[dist_context_map_slice + context];
							distance_code = ReadSymbol(hgroup[2].codes, hgroup[2].htrees[dist_htree_index], br);
							if (distance_code >= num_direct_distance_codes) {
								var nbits;
								var postfix;
								var offset;
								distance_code -= num_direct_distance_codes;
								postfix = distance_code & distance_postfix_mask;
								distance_code >>= distance_postfix_bits;
								nbits = (distance_code >> 1) + 1;
								offset = (2 + (distance_code & 1) << nbits) - 4;
								distance_code = num_direct_distance_codes + (offset + br.readBits(nbits) << distance_postfix_bits) + postfix;
							}
						}
						distance = TranslateShortCodes(distance_code, dist_rb, dist_rb_idx);
						if (distance < 0) throw new Error("[BrotliDecompress] invalid distance");
						if (pos < max_backward_distance && max_distance !== max_backward_distance) max_distance = pos;
						else max_distance = max_backward_distance;
						copy_dst = pos & ringbuffer_mask;
						if (distance > max_distance) {
							if (copy_length >= BrotliDictionary.minDictionaryWordLength && copy_length <= BrotliDictionary.maxDictionaryWordLength) {
								var offset = BrotliDictionary.offsetsByLength[copy_length];
								var word_id = distance - max_distance - 1;
								var shift = BrotliDictionary.sizeBitsByLength[copy_length];
								var word_idx = word_id & (1 << shift) - 1;
								var transform_idx = word_id >> shift;
								offset += word_idx * copy_length;
								if (transform_idx < Transform.kNumTransforms) {
									var len = Transform.transformDictionaryWord(ringbuffer, copy_dst, offset, copy_length, transform_idx);
									copy_dst += len;
									pos += len;
									meta_block_remaining_len -= len;
									if (copy_dst >= ringbuffer_end) {
										output.write(ringbuffer, ringbuffer_size);
										for (var _x = 0; _x < copy_dst - ringbuffer_end; _x++) ringbuffer[_x] = ringbuffer[ringbuffer_end + _x];
									}
								} else throw new Error("Invalid backward reference. pos: " + pos + " distance: " + distance + " len: " + copy_length + " bytes left: " + meta_block_remaining_len);
							} else throw new Error("Invalid backward reference. pos: " + pos + " distance: " + distance + " len: " + copy_length + " bytes left: " + meta_block_remaining_len);
						} else {
							if (distance_code > 0) {
								dist_rb[dist_rb_idx & 3] = distance;
								++dist_rb_idx;
							}
							if (copy_length > meta_block_remaining_len) throw new Error("Invalid backward reference. pos: " + pos + " distance: " + distance + " len: " + copy_length + " bytes left: " + meta_block_remaining_len);
							for (j = 0; j < copy_length; ++j) {
								ringbuffer[pos & ringbuffer_mask] = ringbuffer[pos - distance & ringbuffer_mask];
								if ((pos & ringbuffer_mask) === ringbuffer_mask) output.write(ringbuffer, ringbuffer_size);
								++pos;
								--meta_block_remaining_len;
							}
						}
						prev_byte1 = ringbuffer[pos - 1 & ringbuffer_mask];
						prev_byte2 = ringbuffer[pos - 2 & ringbuffer_mask];
					}
					pos &= 1073741823;
				}
				output.write(ringbuffer, pos & ringbuffer_mask);
			}
			exports.BrotliDecompress = BrotliDecompress;
			BrotliDictionary.init();
		}, {
			"./bit_reader": 1,
			"./context": 2,
			"./dictionary": 6,
			"./huffman": 7,
			"./prefix": 9,
			"./streams": 10,
			"./transform": 11
		}],
		4: [function(require, module, exports) {
			var base64 = require("base64-js");
			/**
			* The normal dictionary-data.js is quite large, which makes it
			* unsuitable for browser usage. In order to make it smaller,
			* we read dictionary.bin, which is a compressed version of
			* the dictionary, and on initial load, Brotli decompresses
			* it's own dictionary. 😜
			*/
			exports.init = function() {
				var BrotliDecompressBuffer = require("./decode").BrotliDecompressBuffer;
				return BrotliDecompressBuffer(base64.toByteArray(require("./dictionary.bin.js")));
			};
		}, {
			"./decode": 3,
			"./dictionary.bin.js": 5,
			"base64-js": 8
		}],
		5: [function(require, module, exports) {
			module.exports = "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";
		}, {}],
		6: [function(require, module, exports) {
			var data = require("./dictionary-browser");
			exports.init = function() {
				exports.dictionary = data.init();
			};
			exports.offsetsByLength = new Uint32Array([
				0,
				0,
				0,
				0,
				0,
				4096,
				9216,
				21504,
				35840,
				44032,
				53248,
				63488,
				74752,
				87040,
				93696,
				100864,
				104704,
				106752,
				108928,
				113536,
				115968,
				118528,
				119872,
				121280,
				122016
			]);
			exports.sizeBitsByLength = new Uint8Array([
				0,
				0,
				0,
				0,
				10,
				10,
				11,
				11,
				10,
				10,
				10,
				10,
				10,
				9,
				9,
				8,
				7,
				7,
				8,
				7,
				7,
				6,
				6,
				5,
				5
			]);
			exports.minDictionaryWordLength = 4;
			exports.maxDictionaryWordLength = 24;
		}, { "./dictionary-browser": 4 }],
		7: [function(require, module, exports) {
			function HuffmanCode(bits, value) {
				this.bits = bits;
				this.value = value;
			}
			exports.HuffmanCode = HuffmanCode;
			var MAX_LENGTH = 15;
			function GetNextKey(key, len) {
				var step = 1 << len - 1;
				while (key & step) step >>= 1;
				return (key & step - 1) + step;
			}
			function ReplicateValue(table, i, step, end, code) {
				do {
					end -= step;
					table[i + end] = new HuffmanCode(code.bits, code.value);
				} while (end > 0);
			}
			function NextTableBitSize(count, len, root_bits) {
				var left = 1 << len - root_bits;
				while (len < MAX_LENGTH) {
					left -= count[len];
					if (left <= 0) break;
					++len;
					left <<= 1;
				}
				return len - root_bits;
			}
			exports.BrotliBuildHuffmanTable = function(root_table, table, root_bits, code_lengths, code_lengths_size) {
				var start_table = table;
				var code;
				var len;
				var symbol;
				var key;
				var step;
				var low;
				var mask;
				var table_bits;
				var table_size;
				var total_size;
				var sorted;
				var count = new Int32Array(MAX_LENGTH + 1);
				var offset = new Int32Array(MAX_LENGTH + 1);
				sorted = new Int32Array(code_lengths_size);
				for (symbol = 0; symbol < code_lengths_size; symbol++) count[code_lengths[symbol]]++;
				offset[1] = 0;
				for (len = 1; len < MAX_LENGTH; len++) offset[len + 1] = offset[len] + count[len];
				for (symbol = 0; symbol < code_lengths_size; symbol++) if (code_lengths[symbol] !== 0) sorted[offset[code_lengths[symbol]]++] = symbol;
				table_bits = root_bits;
				table_size = 1 << table_bits;
				total_size = table_size;
				if (offset[MAX_LENGTH] === 1) {
					for (key = 0; key < total_size; ++key) root_table[table + key] = new HuffmanCode(0, sorted[0] & 65535);
					return total_size;
				}
				key = 0;
				symbol = 0;
				for (len = 1, step = 2; len <= root_bits; ++len, step <<= 1) for (; count[len] > 0; --count[len]) {
					code = new HuffmanCode(len & 255, sorted[symbol++] & 65535);
					ReplicateValue(root_table, table + key, step, table_size, code);
					key = GetNextKey(key, len);
				}
				mask = total_size - 1;
				low = -1;
				for (len = root_bits + 1, step = 2; len <= MAX_LENGTH; ++len, step <<= 1) for (; count[len] > 0; --count[len]) {
					if ((key & mask) !== low) {
						table += table_size;
						table_bits = NextTableBitSize(count, len, root_bits);
						table_size = 1 << table_bits;
						total_size += table_size;
						low = key & mask;
						root_table[start_table + low] = new HuffmanCode(table_bits + root_bits & 255, table - start_table - low & 65535);
					}
					code = new HuffmanCode(len - root_bits & 255, sorted[symbol++] & 65535);
					ReplicateValue(root_table, table + (key >> root_bits), step, table_size, code);
					key = GetNextKey(key, len);
				}
				return total_size;
			};
		}, {}],
		8: [function(require, module, exports) {
			"use strict";
			exports.byteLength = byteLength;
			exports.toByteArray = toByteArray;
			exports.fromByteArray = fromByteArray;
			var lookup = [];
			var revLookup = [];
			var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
			var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			for (var i = 0, len = code.length; i < len; ++i) {
				lookup[i] = code[i];
				revLookup[code.charCodeAt(i)] = i;
			}
			revLookup["-".charCodeAt(0)] = 62;
			revLookup["_".charCodeAt(0)] = 63;
			function getLens(b64) {
				var len = b64.length;
				if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
				var validLen = b64.indexOf("=");
				if (validLen === -1) validLen = len;
				var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
				return [validLen, placeHoldersLen];
			}
			function byteLength(b64) {
				var lens = getLens(b64);
				var validLen = lens[0];
				var placeHoldersLen = lens[1];
				return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
			}
			function _byteLength(b64, validLen, placeHoldersLen) {
				return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
			}
			function toByteArray(b64) {
				var tmp;
				var lens = getLens(b64);
				var validLen = lens[0];
				var placeHoldersLen = lens[1];
				var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
				var curByte = 0;
				var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
				for (var i = 0; i < len; i += 4) {
					tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
					arr[curByte++] = tmp >> 16 & 255;
					arr[curByte++] = tmp >> 8 & 255;
					arr[curByte++] = tmp & 255;
				}
				if (placeHoldersLen === 2) {
					tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
					arr[curByte++] = tmp & 255;
				}
				if (placeHoldersLen === 1) {
					tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
					arr[curByte++] = tmp >> 8 & 255;
					arr[curByte++] = tmp & 255;
				}
				return arr;
			}
			function tripletToBase64(num) {
				return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
			}
			function encodeChunk(uint8, start, end) {
				var tmp;
				var output = [];
				for (var i = start; i < end; i += 3) {
					tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
					output.push(tripletToBase64(tmp));
				}
				return output.join("");
			}
			function fromByteArray(uint8) {
				var tmp;
				var len = uint8.length;
				var extraBytes = len % 3;
				var parts = [];
				var maxChunkLength = 16383;
				for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
				if (extraBytes === 1) {
					tmp = uint8[len - 1];
					parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
				} else if (extraBytes === 2) {
					tmp = (uint8[len - 2] << 8) + uint8[len - 1];
					parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
				}
				return parts.join("");
			}
		}, {}],
		9: [function(require, module, exports) {
			function PrefixCodeRange(offset, nbits) {
				this.offset = offset;
				this.nbits = nbits;
			}
			exports.kBlockLengthPrefixCode = [
				new PrefixCodeRange(1, 2),
				new PrefixCodeRange(5, 2),
				new PrefixCodeRange(9, 2),
				new PrefixCodeRange(13, 2),
				new PrefixCodeRange(17, 3),
				new PrefixCodeRange(25, 3),
				new PrefixCodeRange(33, 3),
				new PrefixCodeRange(41, 3),
				new PrefixCodeRange(49, 4),
				new PrefixCodeRange(65, 4),
				new PrefixCodeRange(81, 4),
				new PrefixCodeRange(97, 4),
				new PrefixCodeRange(113, 5),
				new PrefixCodeRange(145, 5),
				new PrefixCodeRange(177, 5),
				new PrefixCodeRange(209, 5),
				new PrefixCodeRange(241, 6),
				new PrefixCodeRange(305, 6),
				new PrefixCodeRange(369, 7),
				new PrefixCodeRange(497, 8),
				new PrefixCodeRange(753, 9),
				new PrefixCodeRange(1265, 10),
				new PrefixCodeRange(2289, 11),
				new PrefixCodeRange(4337, 12),
				new PrefixCodeRange(8433, 13),
				new PrefixCodeRange(16625, 24)
			];
			exports.kInsertLengthPrefixCode = [
				new PrefixCodeRange(0, 0),
				new PrefixCodeRange(1, 0),
				new PrefixCodeRange(2, 0),
				new PrefixCodeRange(3, 0),
				new PrefixCodeRange(4, 0),
				new PrefixCodeRange(5, 0),
				new PrefixCodeRange(6, 1),
				new PrefixCodeRange(8, 1),
				new PrefixCodeRange(10, 2),
				new PrefixCodeRange(14, 2),
				new PrefixCodeRange(18, 3),
				new PrefixCodeRange(26, 3),
				new PrefixCodeRange(34, 4),
				new PrefixCodeRange(50, 4),
				new PrefixCodeRange(66, 5),
				new PrefixCodeRange(98, 5),
				new PrefixCodeRange(130, 6),
				new PrefixCodeRange(194, 7),
				new PrefixCodeRange(322, 8),
				new PrefixCodeRange(578, 9),
				new PrefixCodeRange(1090, 10),
				new PrefixCodeRange(2114, 12),
				new PrefixCodeRange(6210, 14),
				new PrefixCodeRange(22594, 24)
			];
			exports.kCopyLengthPrefixCode = [
				new PrefixCodeRange(2, 0),
				new PrefixCodeRange(3, 0),
				new PrefixCodeRange(4, 0),
				new PrefixCodeRange(5, 0),
				new PrefixCodeRange(6, 0),
				new PrefixCodeRange(7, 0),
				new PrefixCodeRange(8, 0),
				new PrefixCodeRange(9, 0),
				new PrefixCodeRange(10, 1),
				new PrefixCodeRange(12, 1),
				new PrefixCodeRange(14, 2),
				new PrefixCodeRange(18, 2),
				new PrefixCodeRange(22, 3),
				new PrefixCodeRange(30, 3),
				new PrefixCodeRange(38, 4),
				new PrefixCodeRange(54, 4),
				new PrefixCodeRange(70, 5),
				new PrefixCodeRange(102, 5),
				new PrefixCodeRange(134, 6),
				new PrefixCodeRange(198, 7),
				new PrefixCodeRange(326, 8),
				new PrefixCodeRange(582, 9),
				new PrefixCodeRange(1094, 10),
				new PrefixCodeRange(2118, 24)
			];
			exports.kInsertRangeLut = [
				0,
				0,
				8,
				8,
				0,
				16,
				8,
				16,
				16
			];
			exports.kCopyRangeLut = [
				0,
				8,
				0,
				8,
				16,
				0,
				16,
				8,
				16
			];
		}, {}],
		10: [function(require, module, exports) {
			function BrotliInput(buffer) {
				this.buffer = buffer;
				this.pos = 0;
			}
			BrotliInput.prototype.read = function(buf, i, count) {
				if (this.pos + count > this.buffer.length) count = this.buffer.length - this.pos;
				for (var p = 0; p < count; p++) buf[i + p] = this.buffer[this.pos + p];
				this.pos += count;
				return count;
			};
			exports.BrotliInput = BrotliInput;
			function BrotliOutput(buf) {
				this.buffer = buf;
				this.pos = 0;
			}
			BrotliOutput.prototype.write = function(buf, count) {
				if (this.pos + count > this.buffer.length) throw new Error("Output buffer is not large enough");
				this.buffer.set(buf.subarray(0, count), this.pos);
				this.pos += count;
				return count;
			};
			exports.BrotliOutput = BrotliOutput;
		}, {}],
		11: [function(require, module, exports) {
			var BrotliDictionary = require("./dictionary");
			var kIdentity = 0;
			var kOmitLast1 = 1;
			var kOmitLast2 = 2;
			var kOmitLast3 = 3;
			var kOmitLast4 = 4;
			var kOmitLast5 = 5;
			var kOmitLast6 = 6;
			var kOmitLast7 = 7;
			var kOmitLast8 = 8;
			var kOmitLast9 = 9;
			var kUppercaseFirst = 10;
			var kUppercaseAll = 11;
			var kOmitFirst1 = 12;
			var kOmitFirst2 = 13;
			var kOmitFirst3 = 14;
			var kOmitFirst4 = 15;
			var kOmitFirst5 = 16;
			var kOmitFirst6 = 17;
			var kOmitFirst7 = 18;
			var kOmitFirst9 = 20;
			function Transform(prefix, transform, suffix) {
				this.prefix = new Uint8Array(prefix.length);
				this.transform = transform;
				this.suffix = new Uint8Array(suffix.length);
				for (var i = 0; i < prefix.length; i++) this.prefix[i] = prefix.charCodeAt(i);
				for (var i = 0; i < suffix.length; i++) this.suffix[i] = suffix.charCodeAt(i);
			}
			var kTransforms = [
				new Transform("", kIdentity, ""),
				new Transform("", kIdentity, " "),
				new Transform(" ", kIdentity, " "),
				new Transform("", kOmitFirst1, ""),
				new Transform("", kUppercaseFirst, " "),
				new Transform("", kIdentity, " the "),
				new Transform(" ", kIdentity, ""),
				new Transform("s ", kIdentity, " "),
				new Transform("", kIdentity, " of "),
				new Transform("", kUppercaseFirst, ""),
				new Transform("", kIdentity, " and "),
				new Transform("", kOmitFirst2, ""),
				new Transform("", kOmitLast1, ""),
				new Transform(", ", kIdentity, " "),
				new Transform("", kIdentity, ", "),
				new Transform(" ", kUppercaseFirst, " "),
				new Transform("", kIdentity, " in "),
				new Transform("", kIdentity, " to "),
				new Transform("e ", kIdentity, " "),
				new Transform("", kIdentity, "\""),
				new Transform("", kIdentity, "."),
				new Transform("", kIdentity, "\">"),
				new Transform("", kIdentity, "\n"),
				new Transform("", kOmitLast3, ""),
				new Transform("", kIdentity, "]"),
				new Transform("", kIdentity, " for "),
				new Transform("", kOmitFirst3, ""),
				new Transform("", kOmitLast2, ""),
				new Transform("", kIdentity, " a "),
				new Transform("", kIdentity, " that "),
				new Transform(" ", kUppercaseFirst, ""),
				new Transform("", kIdentity, ". "),
				new Transform(".", kIdentity, ""),
				new Transform(" ", kIdentity, ", "),
				new Transform("", kOmitFirst4, ""),
				new Transform("", kIdentity, " with "),
				new Transform("", kIdentity, "'"),
				new Transform("", kIdentity, " from "),
				new Transform("", kIdentity, " by "),
				new Transform("", kOmitFirst5, ""),
				new Transform("", kOmitFirst6, ""),
				new Transform(" the ", kIdentity, ""),
				new Transform("", kOmitLast4, ""),
				new Transform("", kIdentity, ". The "),
				new Transform("", kUppercaseAll, ""),
				new Transform("", kIdentity, " on "),
				new Transform("", kIdentity, " as "),
				new Transform("", kIdentity, " is "),
				new Transform("", kOmitLast7, ""),
				new Transform("", kOmitLast1, "ing "),
				new Transform("", kIdentity, "\n	"),
				new Transform("", kIdentity, ":"),
				new Transform(" ", kIdentity, ". "),
				new Transform("", kIdentity, "ed "),
				new Transform("", kOmitFirst9, ""),
				new Transform("", kOmitFirst7, ""),
				new Transform("", kOmitLast6, ""),
				new Transform("", kIdentity, "("),
				new Transform("", kUppercaseFirst, ", "),
				new Transform("", kOmitLast8, ""),
				new Transform("", kIdentity, " at "),
				new Transform("", kIdentity, "ly "),
				new Transform(" the ", kIdentity, " of "),
				new Transform("", kOmitLast5, ""),
				new Transform("", kOmitLast9, ""),
				new Transform(" ", kUppercaseFirst, ", "),
				new Transform("", kUppercaseFirst, "\""),
				new Transform(".", kIdentity, "("),
				new Transform("", kUppercaseAll, " "),
				new Transform("", kUppercaseFirst, "\">"),
				new Transform("", kIdentity, "=\""),
				new Transform(" ", kIdentity, "."),
				new Transform(".com/", kIdentity, ""),
				new Transform(" the ", kIdentity, " of the "),
				new Transform("", kUppercaseFirst, "'"),
				new Transform("", kIdentity, ". This "),
				new Transform("", kIdentity, ","),
				new Transform(".", kIdentity, " "),
				new Transform("", kUppercaseFirst, "("),
				new Transform("", kUppercaseFirst, "."),
				new Transform("", kIdentity, " not "),
				new Transform(" ", kIdentity, "=\""),
				new Transform("", kIdentity, "er "),
				new Transform(" ", kUppercaseAll, " "),
				new Transform("", kIdentity, "al "),
				new Transform(" ", kUppercaseAll, ""),
				new Transform("", kIdentity, "='"),
				new Transform("", kUppercaseAll, "\""),
				new Transform("", kUppercaseFirst, ". "),
				new Transform(" ", kIdentity, "("),
				new Transform("", kIdentity, "ful "),
				new Transform(" ", kUppercaseFirst, ". "),
				new Transform("", kIdentity, "ive "),
				new Transform("", kIdentity, "less "),
				new Transform("", kUppercaseAll, "'"),
				new Transform("", kIdentity, "est "),
				new Transform(" ", kUppercaseFirst, "."),
				new Transform("", kUppercaseAll, "\">"),
				new Transform(" ", kIdentity, "='"),
				new Transform("", kUppercaseFirst, ","),
				new Transform("", kIdentity, "ize "),
				new Transform("", kUppercaseAll, "."),
				new Transform("Â\xA0", kIdentity, ""),
				new Transform(" ", kIdentity, ","),
				new Transform("", kUppercaseFirst, "=\""),
				new Transform("", kUppercaseAll, "=\""),
				new Transform("", kIdentity, "ous "),
				new Transform("", kUppercaseAll, ", "),
				new Transform("", kUppercaseFirst, "='"),
				new Transform(" ", kUppercaseFirst, ","),
				new Transform(" ", kUppercaseAll, "=\""),
				new Transform(" ", kUppercaseAll, ", "),
				new Transform("", kUppercaseAll, ","),
				new Transform("", kUppercaseAll, "("),
				new Transform("", kUppercaseAll, ". "),
				new Transform(" ", kUppercaseAll, "."),
				new Transform("", kUppercaseAll, "='"),
				new Transform(" ", kUppercaseAll, ". "),
				new Transform(" ", kUppercaseFirst, "=\""),
				new Transform(" ", kUppercaseAll, "='"),
				new Transform(" ", kUppercaseFirst, "='")
			];
			exports.kTransforms = kTransforms;
			exports.kNumTransforms = kTransforms.length;
			function ToUpperCase(p, i) {
				if (p[i] < 192) {
					if (p[i] >= 97 && p[i] <= 122) p[i] ^= 32;
					return 1;
				}
				if (p[i] < 224) {
					p[i + 1] ^= 32;
					return 2;
				}
				p[i + 2] ^= 5;
				return 3;
			}
			exports.transformDictionaryWord = function(dst, idx, word, len, transform) {
				var prefix = kTransforms[transform].prefix;
				var suffix = kTransforms[transform].suffix;
				var t = kTransforms[transform].transform;
				var skip = t < kOmitFirst1 ? 0 : t - (kOmitFirst1 - 1);
				var i = 0;
				var start_idx = idx;
				var uppercase;
				if (skip > len) skip = len;
				var prefix_pos = 0;
				while (prefix_pos < prefix.length) dst[idx++] = prefix[prefix_pos++];
				word += skip;
				len -= skip;
				if (t <= kOmitLast9) len -= t;
				for (i = 0; i < len; i++) dst[idx++] = BrotliDictionary.dictionary[word + i];
				uppercase = idx - len;
				if (t === kUppercaseFirst) ToUpperCase(dst, uppercase);
				else if (t === kUppercaseAll) while (len > 0) {
					var step = ToUpperCase(dst, uppercase);
					uppercase += step;
					len -= step;
				}
				var suffix_pos = 0;
				while (suffix_pos < suffix.length) dst[idx++] = suffix[suffix_pos++];
				return idx - start_idx;
			};
		}, { "./dictionary": 6 }],
		12: [function(require, module, exports) {
			module.exports = require("./dec/decode").BrotliDecompressBuffer;
		}, { "./dec/decode": 3 }]
	}, {}, [12])(12);
})();

// packages/global-styles-ui/build-module/font-library/lib/inflate.mjs
var __require = /* @__PURE__ */ ((x) => typeof __require$2 !== "undefined" ? __require$2 : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof __require$2 !== "undefined" ? __require$2 : a)[b] }) : x)(function(x) {
	if (typeof __require$2 !== "undefined") return __require$2.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
});
/**
* Credits:
*
* lib-font
* https://github.com/Pomax/lib-font
* https://github.com/Pomax/lib-font/blob/master/lib/inflate.js
*
* The MIT License (MIT)
*
* Copyright (c) 2020 pomax@nihongoresources.com
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
var inflate_default = (function() {
	return (function() {
		function r(e, n, t) {
			function o(i, f) {
				if (!n[i]) {
					if (!e[i]) {
						var c = "function" == typeof __require && __require;
						if (!f && c) return c(i, !0);
						if (u) return u(i, !0);
						var a = /* @__PURE__ */ new Error("Cannot find module '" + i + "'");
						throw a.code = "MODULE_NOT_FOUND", a;
					}
					var p = n[i] = { exports: {} };
					e[i][0].call(p.exports, function(r) {
						var n = e[i][1][r];
						return o(n || r);
					}, p, p.exports, r, e, n, t);
				}
				return n[i].exports;
			}
			for (var u = "function" == typeof __require && __require, i = 0; i < t.length; i++) o(t[i]);
			return o;
		}
		return r;
	})()({
		1: [function(require, module, exports) {
			"use strict";
			var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
			function _has(obj, key) {
				return Object.prototype.hasOwnProperty.call(obj, key);
			}
			exports.assign = function(obj) {
				var sources = Array.prototype.slice.call(arguments, 1);
				while (sources.length) {
					var source = sources.shift();
					if (!source) continue;
					if (typeof source !== "object") throw new TypeError(source + "must be non-object");
					for (var p in source) if (_has(source, p)) obj[p] = source[p];
				}
				return obj;
			};
			exports.shrinkBuf = function(buf, size) {
				if (buf.length === size) return buf;
				if (buf.subarray) return buf.subarray(0, size);
				buf.length = size;
				return buf;
			};
			var fnTyped = {
				arraySet: function(dest, src, src_offs, len, dest_offs) {
					if (src.subarray && dest.subarray) {
						dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
						return;
					}
					for (var i = 0; i < len; i++) dest[dest_offs + i] = src[src_offs + i];
				},
				flattenChunks: function(chunks) {
					var i, l, len = 0, pos, chunk, result;
					for (i = 0, l = chunks.length; i < l; i++) len += chunks[i].length;
					result = new Uint8Array(len);
					pos = 0;
					for (i = 0, l = chunks.length; i < l; i++) {
						chunk = chunks[i];
						result.set(chunk, pos);
						pos += chunk.length;
					}
					return result;
				}
			};
			var fnUntyped = {
				arraySet: function(dest, src, src_offs, len, dest_offs) {
					for (var i = 0; i < len; i++) dest[dest_offs + i] = src[src_offs + i];
				},
				flattenChunks: function(chunks) {
					return [].concat.apply([], chunks);
				}
			};
			exports.setTyped = function(on) {
				if (on) {
					exports.Buf8 = Uint8Array;
					exports.Buf16 = Uint16Array;
					exports.Buf32 = Int32Array;
					exports.assign(exports, fnTyped);
				} else {
					exports.Buf8 = Array;
					exports.Buf16 = Array;
					exports.Buf32 = Array;
					exports.assign(exports, fnUntyped);
				}
			};
			exports.setTyped(TYPED_OK);
		}, {}],
		2: [function(require, module, exports) {
			"use strict";
			var utils = require("./common");
			var STR_APPLY_OK = true;
			var STR_APPLY_UIA_OK = true;
			try {
				String.fromCharCode.apply(null, [0]);
			} catch (__) {
				STR_APPLY_OK = false;
			}
			try {
				String.fromCharCode.apply(null, /* @__PURE__ */ new Uint8Array(1));
			} catch (__) {
				STR_APPLY_UIA_OK = false;
			}
			var _utf8len = new utils.Buf8(256);
			for (var q = 0; q < 256; q++) _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
			_utf8len[254] = _utf8len[254] = 1;
			exports.string2buf = function(str) {
				var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
				for (m_pos = 0; m_pos < str_len; m_pos++) {
					c = str.charCodeAt(m_pos);
					if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
						c2 = str.charCodeAt(m_pos + 1);
						if ((c2 & 64512) === 56320) {
							c = 65536 + (c - 55296 << 10) + (c2 - 56320);
							m_pos++;
						}
					}
					buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
				}
				buf = new utils.Buf8(buf_len);
				for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
					c = str.charCodeAt(m_pos);
					if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
						c2 = str.charCodeAt(m_pos + 1);
						if ((c2 & 64512) === 56320) {
							c = 65536 + (c - 55296 << 10) + (c2 - 56320);
							m_pos++;
						}
					}
					if (c < 128) buf[i++] = c;
					else if (c < 2048) {
						buf[i++] = 192 | c >>> 6;
						buf[i++] = 128 | c & 63;
					} else if (c < 65536) {
						buf[i++] = 224 | c >>> 12;
						buf[i++] = 128 | c >>> 6 & 63;
						buf[i++] = 128 | c & 63;
					} else {
						buf[i++] = 240 | c >>> 18;
						buf[i++] = 128 | c >>> 12 & 63;
						buf[i++] = 128 | c >>> 6 & 63;
						buf[i++] = 128 | c & 63;
					}
				}
				return buf;
			};
			function buf2binstring(buf, len) {
				if (len < 65534) {
					if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
				}
				var result = "";
				for (var i = 0; i < len; i++) result += String.fromCharCode(buf[i]);
				return result;
			}
			exports.buf2binstring = function(buf) {
				return buf2binstring(buf, buf.length);
			};
			exports.binstring2buf = function(str) {
				var buf = new utils.Buf8(str.length);
				for (var i = 0, len = buf.length; i < len; i++) buf[i] = str.charCodeAt(i);
				return buf;
			};
			exports.buf2string = function(buf, max) {
				var i, out, c, c_len;
				var len = max || buf.length;
				var utf16buf = new Array(len * 2);
				for (out = 0, i = 0; i < len;) {
					c = buf[i++];
					if (c < 128) {
						utf16buf[out++] = c;
						continue;
					}
					c_len = _utf8len[c];
					if (c_len > 4) {
						utf16buf[out++] = 65533;
						i += c_len - 1;
						continue;
					}
					c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
					while (c_len > 1 && i < len) {
						c = c << 6 | buf[i++] & 63;
						c_len--;
					}
					if (c_len > 1) {
						utf16buf[out++] = 65533;
						continue;
					}
					if (c < 65536) utf16buf[out++] = c;
					else {
						c -= 65536;
						utf16buf[out++] = 55296 | c >> 10 & 1023;
						utf16buf[out++] = 56320 | c & 1023;
					}
				}
				return buf2binstring(utf16buf, out);
			};
			exports.utf8border = function(buf, max) {
				var pos;
				max = max || buf.length;
				if (max > buf.length) max = buf.length;
				pos = max - 1;
				while (pos >= 0 && (buf[pos] & 192) === 128) pos--;
				if (pos < 0) return max;
				if (pos === 0) return max;
				return pos + _utf8len[buf[pos]] > max ? pos : max;
			};
		}, { "./common": 1 }],
		3: [function(require, module, exports) {
			"use strict";
			function adler32(adler, buf, len, pos) {
				var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
				while (len !== 0) {
					n = len > 2e3 ? 2e3 : len;
					len -= n;
					do {
						s1 = s1 + buf[pos++] | 0;
						s2 = s2 + s1 | 0;
					} while (--n);
					s1 %= 65521;
					s2 %= 65521;
				}
				return s1 | s2 << 16 | 0;
			}
			module.exports = adler32;
		}, {}],
		4: [function(require, module, exports) {
			"use strict";
			module.exports = {
				Z_NO_FLUSH: 0,
				Z_PARTIAL_FLUSH: 1,
				Z_SYNC_FLUSH: 2,
				Z_FULL_FLUSH: 3,
				Z_FINISH: 4,
				Z_BLOCK: 5,
				Z_TREES: 6,
				Z_OK: 0,
				Z_STREAM_END: 1,
				Z_NEED_DICT: 2,
				Z_ERRNO: -1,
				Z_STREAM_ERROR: -2,
				Z_DATA_ERROR: -3,
				Z_BUF_ERROR: -5,
				Z_NO_COMPRESSION: 0,
				Z_BEST_SPEED: 1,
				Z_BEST_COMPRESSION: 9,
				Z_DEFAULT_COMPRESSION: -1,
				Z_FILTERED: 1,
				Z_HUFFMAN_ONLY: 2,
				Z_RLE: 3,
				Z_FIXED: 4,
				Z_DEFAULT_STRATEGY: 0,
				Z_BINARY: 0,
				Z_TEXT: 1,
				Z_UNKNOWN: 2,
				Z_DEFLATED: 8
			};
		}, {}],
		5: [function(require, module, exports) {
			"use strict";
			function makeTable() {
				var c, table = [];
				for (var n = 0; n < 256; n++) {
					c = n;
					for (var k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
					table[n] = c;
				}
				return table;
			}
			var crcTable = makeTable();
			function crc32(crc, buf, len, pos) {
				var t = crcTable, end = pos + len;
				crc ^= -1;
				for (var i = pos; i < end; i++) crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
				return crc ^ -1;
			}
			module.exports = crc32;
		}, {}],
		6: [function(require, module, exports) {
			"use strict";
			function GZheader() {
				this.text = 0;
				this.time = 0;
				this.xflags = 0;
				this.os = 0;
				this.extra = null;
				this.extra_len = 0;
				this.name = "";
				this.comment = "";
				this.hcrc = 0;
				this.done = false;
			}
			module.exports = GZheader;
		}, {}],
		7: [function(require, module, exports) {
			"use strict";
			var BAD = 30;
			var TYPE = 12;
			module.exports = function inflate_fast(strm, start) {
				var state;
				var _in;
				var last;
				var _out;
				var beg;
				var end;
				var dmax;
				var wsize;
				var whave;
				var wnext;
				var s_window;
				var hold;
				var bits;
				var lcode;
				var dcode;
				var lmask;
				var dmask;
				var here;
				var op;
				var len;
				var dist;
				var from;
				var from_source;
				var input, output;
				state = strm.state;
				_in = strm.next_in;
				input = strm.input;
				last = _in + (strm.avail_in - 5);
				_out = strm.next_out;
				output = strm.output;
				beg = _out - (start - strm.avail_out);
				end = _out + (strm.avail_out - 257);
				dmax = state.dmax;
				wsize = state.wsize;
				whave = state.whave;
				wnext = state.wnext;
				s_window = state.window;
				hold = state.hold;
				bits = state.bits;
				lcode = state.lencode;
				dcode = state.distcode;
				lmask = (1 << state.lenbits) - 1;
				dmask = (1 << state.distbits) - 1;
				top: do {
					if (bits < 15) {
						hold += input[_in++] << bits;
						bits += 8;
						hold += input[_in++] << bits;
						bits += 8;
					}
					here = lcode[hold & lmask];
					dolen: for (;;) {
						op = here >>> 24;
						hold >>>= op;
						bits -= op;
						op = here >>> 16 & 255;
						if (op === 0) output[_out++] = here & 65535;
						else if (op & 16) {
							len = here & 65535;
							op &= 15;
							if (op) {
								if (bits < op) {
									hold += input[_in++] << bits;
									bits += 8;
								}
								len += hold & (1 << op) - 1;
								hold >>>= op;
								bits -= op;
							}
							if (bits < 15) {
								hold += input[_in++] << bits;
								bits += 8;
								hold += input[_in++] << bits;
								bits += 8;
							}
							here = dcode[hold & dmask];
							dodist: for (;;) {
								op = here >>> 24;
								hold >>>= op;
								bits -= op;
								op = here >>> 16 & 255;
								if (op & 16) {
									dist = here & 65535;
									op &= 15;
									if (bits < op) {
										hold += input[_in++] << bits;
										bits += 8;
										if (bits < op) {
											hold += input[_in++] << bits;
											bits += 8;
										}
									}
									dist += hold & (1 << op) - 1;
									if (dist > dmax) {
										strm.msg = "invalid distance too far back";
										state.mode = BAD;
										break top;
									}
									hold >>>= op;
									bits -= op;
									op = _out - beg;
									if (dist > op) {
										op = dist - op;
										if (op > whave) {
											if (state.sane) {
												strm.msg = "invalid distance too far back";
												state.mode = BAD;
												break top;
											}
										}
										from = 0;
										from_source = s_window;
										if (wnext === 0) {
											from += wsize - op;
											if (op < len) {
												len -= op;
												do
													output[_out++] = s_window[from++];
												while (--op);
												from = _out - dist;
												from_source = output;
											}
										} else if (wnext < op) {
											from += wsize + wnext - op;
											op -= wnext;
											if (op < len) {
												len -= op;
												do
													output[_out++] = s_window[from++];
												while (--op);
												from = 0;
												if (wnext < len) {
													op = wnext;
													len -= op;
													do
														output[_out++] = s_window[from++];
													while (--op);
													from = _out - dist;
													from_source = output;
												}
											}
										} else {
											from += wnext - op;
											if (op < len) {
												len -= op;
												do
													output[_out++] = s_window[from++];
												while (--op);
												from = _out - dist;
												from_source = output;
											}
										}
										while (len > 2) {
											output[_out++] = from_source[from++];
											output[_out++] = from_source[from++];
											output[_out++] = from_source[from++];
											len -= 3;
										}
										if (len) {
											output[_out++] = from_source[from++];
											if (len > 1) output[_out++] = from_source[from++];
										}
									} else {
										from = _out - dist;
										do {
											output[_out++] = output[from++];
											output[_out++] = output[from++];
											output[_out++] = output[from++];
											len -= 3;
										} while (len > 2);
										if (len) {
											output[_out++] = output[from++];
											if (len > 1) output[_out++] = output[from++];
										}
									}
								} else if ((op & 64) === 0) {
									here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
									continue dodist;
								} else {
									strm.msg = "invalid distance code";
									state.mode = BAD;
									break top;
								}
								break;
							}
						} else if ((op & 64) === 0) {
							here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
							continue dolen;
						} else if (op & 32) {
							state.mode = TYPE;
							break top;
						} else {
							strm.msg = "invalid literal/length code";
							state.mode = BAD;
							break top;
						}
						break;
					}
				} while (_in < last && _out < end);
				len = bits >> 3;
				_in -= len;
				bits -= len << 3;
				hold &= (1 << bits) - 1;
				strm.next_in = _in;
				strm.next_out = _out;
				strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
				strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
				state.hold = hold;
				state.bits = bits;
			};
		}, {}],
		8: [function(require, module, exports) {
			"use strict";
			var utils = require("../utils/common");
			var adler32 = require("./adler32");
			var crc32 = require("./crc32");
			var inflate_fast = require("./inffast");
			var inflate_table = require("./inftrees");
			var CODES = 0;
			var LENS = 1;
			var DISTS = 2;
			var Z_FINISH = 4;
			var Z_BLOCK = 5;
			var Z_TREES = 6;
			var Z_OK = 0;
			var Z_STREAM_END = 1;
			var Z_NEED_DICT = 2;
			var Z_STREAM_ERROR = -2;
			var Z_DATA_ERROR = -3;
			var Z_MEM_ERROR = -4;
			var Z_BUF_ERROR = -5;
			var Z_DEFLATED = 8;
			var HEAD = 1;
			var FLAGS = 2;
			var TIME = 3;
			var OS = 4;
			var EXLEN = 5;
			var EXTRA = 6;
			var NAME = 7;
			var COMMENT = 8;
			var HCRC = 9;
			var DICTID = 10;
			var DICT = 11;
			var TYPE = 12;
			var TYPEDO = 13;
			var STORED = 14;
			var COPY_ = 15;
			var COPY = 16;
			var TABLE = 17;
			var LENLENS = 18;
			var CODELENS = 19;
			var LEN_ = 20;
			var LEN = 21;
			var LENEXT = 22;
			var DIST = 23;
			var DISTEXT = 24;
			var MATCH = 25;
			var LIT = 26;
			var CHECK = 27;
			var LENGTH = 28;
			var DONE = 29;
			var BAD = 30;
			var MEM = 31;
			var SYNC = 32;
			var ENOUGH_LENS = 852;
			var ENOUGH_DISTS = 592;
			var DEF_WBITS = 15;
			function zswap32(q) {
				return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
			}
			function InflateState() {
				this.mode = 0;
				this.last = false;
				this.wrap = 0;
				this.havedict = false;
				this.flags = 0;
				this.dmax = 0;
				this.check = 0;
				this.total = 0;
				this.head = null;
				this.wbits = 0;
				this.wsize = 0;
				this.whave = 0;
				this.wnext = 0;
				this.window = null;
				this.hold = 0;
				this.bits = 0;
				this.length = 0;
				this.offset = 0;
				this.extra = 0;
				this.lencode = null;
				this.distcode = null;
				this.lenbits = 0;
				this.distbits = 0;
				this.ncode = 0;
				this.nlen = 0;
				this.ndist = 0;
				this.have = 0;
				this.next = null;
				this.lens = new utils.Buf16(320);
				this.work = new utils.Buf16(288);
				this.lendyn = null;
				this.distdyn = null;
				this.sane = 0;
				this.back = 0;
				this.was = 0;
			}
			function inflateResetKeep(strm) {
				var state;
				if (!strm || !strm.state) return Z_STREAM_ERROR;
				state = strm.state;
				strm.total_in = strm.total_out = state.total = 0;
				strm.msg = "";
				if (state.wrap) strm.adler = state.wrap & 1;
				state.mode = HEAD;
				state.last = 0;
				state.havedict = 0;
				state.dmax = 32768;
				state.head = null;
				state.hold = 0;
				state.bits = 0;
				state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
				state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
				state.sane = 1;
				state.back = -1;
				return Z_OK;
			}
			function inflateReset(strm) {
				var state;
				if (!strm || !strm.state) return Z_STREAM_ERROR;
				state = strm.state;
				state.wsize = 0;
				state.whave = 0;
				state.wnext = 0;
				return inflateResetKeep(strm);
			}
			function inflateReset2(strm, windowBits) {
				var wrap;
				var state;
				if (!strm || !strm.state) return Z_STREAM_ERROR;
				state = strm.state;
				if (windowBits < 0) {
					wrap = 0;
					windowBits = -windowBits;
				} else {
					wrap = (windowBits >> 4) + 1;
					if (windowBits < 48) windowBits &= 15;
				}
				if (windowBits && (windowBits < 8 || windowBits > 15)) return Z_STREAM_ERROR;
				if (state.window !== null && state.wbits !== windowBits) state.window = null;
				state.wrap = wrap;
				state.wbits = windowBits;
				return inflateReset(strm);
			}
			function inflateInit2(strm, windowBits) {
				var ret;
				var state;
				if (!strm) return Z_STREAM_ERROR;
				state = new InflateState();
				strm.state = state;
				state.window = null;
				ret = inflateReset2(strm, windowBits);
				if (ret !== Z_OK) strm.state = null;
				return ret;
			}
			function inflateInit(strm) {
				return inflateInit2(strm, DEF_WBITS);
			}
			var virgin = true;
			var lenfix, distfix;
			function fixedtables(state) {
				if (virgin) {
					var sym;
					lenfix = new utils.Buf32(512);
					distfix = new utils.Buf32(32);
					sym = 0;
					while (sym < 144) state.lens[sym++] = 8;
					while (sym < 256) state.lens[sym++] = 9;
					while (sym < 280) state.lens[sym++] = 7;
					while (sym < 288) state.lens[sym++] = 8;
					inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
					sym = 0;
					while (sym < 32) state.lens[sym++] = 5;
					inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
					virgin = false;
				}
				state.lencode = lenfix;
				state.lenbits = 9;
				state.distcode = distfix;
				state.distbits = 5;
			}
			function updatewindow(strm, src, end, copy) {
				var dist;
				var state = strm.state;
				if (state.window === null) {
					state.wsize = 1 << state.wbits;
					state.wnext = 0;
					state.whave = 0;
					state.window = new utils.Buf8(state.wsize);
				}
				if (copy >= state.wsize) {
					utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
					state.wnext = 0;
					state.whave = state.wsize;
				} else {
					dist = state.wsize - state.wnext;
					if (dist > copy) dist = copy;
					utils.arraySet(state.window, src, end - copy, dist, state.wnext);
					copy -= dist;
					if (copy) {
						utils.arraySet(state.window, src, end - copy, copy, 0);
						state.wnext = copy;
						state.whave = state.wsize;
					} else {
						state.wnext += dist;
						if (state.wnext === state.wsize) state.wnext = 0;
						if (state.whave < state.wsize) state.whave += dist;
					}
				}
				return 0;
			}
			function inflate(strm, flush) {
				var state;
				var input, output;
				var next;
				var put;
				var have, left;
				var hold;
				var bits;
				var _in, _out;
				var copy;
				var from;
				var from_source;
				var here = 0;
				var here_bits, here_op, here_val;
				var last_bits, last_op, last_val;
				var len;
				var ret;
				var hbuf = new utils.Buf8(4);
				var opts;
				var n;
				var order = [
					16,
					17,
					18,
					0,
					8,
					7,
					9,
					6,
					10,
					5,
					11,
					4,
					12,
					3,
					13,
					2,
					14,
					1,
					15
				];
				if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) return Z_STREAM_ERROR;
				state = strm.state;
				if (state.mode === TYPE) state.mode = TYPEDO;
				put = strm.next_out;
				output = strm.output;
				left = strm.avail_out;
				next = strm.next_in;
				input = strm.input;
				have = strm.avail_in;
				hold = state.hold;
				bits = state.bits;
				_in = have;
				_out = left;
				ret = Z_OK;
				inf_leave: for (;;) switch (state.mode) {
					case HEAD:
						if (state.wrap === 0) {
							state.mode = TYPEDO;
							break;
						}
						while (bits < 16) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						if (state.wrap & 2 && hold === 35615) {
							state.check = 0;
							hbuf[0] = hold & 255;
							hbuf[1] = hold >>> 8 & 255;
							state.check = crc32(state.check, hbuf, 2, 0);
							hold = 0;
							bits = 0;
							state.mode = FLAGS;
							break;
						}
						state.flags = 0;
						if (state.head) state.head.done = false;
						if (!(state.wrap & 1) || (((hold & 255) << 8) + (hold >> 8)) % 31) {
							strm.msg = "incorrect header check";
							state.mode = BAD;
							break;
						}
						if ((hold & 15) !== Z_DEFLATED) {
							strm.msg = "unknown compression method";
							state.mode = BAD;
							break;
						}
						hold >>>= 4;
						bits -= 4;
						len = (hold & 15) + 8;
						if (state.wbits === 0) state.wbits = len;
						else if (len > state.wbits) {
							strm.msg = "invalid window size";
							state.mode = BAD;
							break;
						}
						state.dmax = 1 << len;
						strm.adler = state.check = 1;
						state.mode = hold & 512 ? DICTID : TYPE;
						hold = 0;
						bits = 0;
						break;
					case FLAGS:
						while (bits < 16) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						state.flags = hold;
						if ((state.flags & 255) !== Z_DEFLATED) {
							strm.msg = "unknown compression method";
							state.mode = BAD;
							break;
						}
						if (state.flags & 57344) {
							strm.msg = "unknown header flags set";
							state.mode = BAD;
							break;
						}
						if (state.head) state.head.text = hold >> 8 & 1;
						if (state.flags & 512) {
							hbuf[0] = hold & 255;
							hbuf[1] = hold >>> 8 & 255;
							state.check = crc32(state.check, hbuf, 2, 0);
						}
						hold = 0;
						bits = 0;
						state.mode = TIME;
					case TIME:
						while (bits < 32) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						if (state.head) state.head.time = hold;
						if (state.flags & 512) {
							hbuf[0] = hold & 255;
							hbuf[1] = hold >>> 8 & 255;
							hbuf[2] = hold >>> 16 & 255;
							hbuf[3] = hold >>> 24 & 255;
							state.check = crc32(state.check, hbuf, 4, 0);
						}
						hold = 0;
						bits = 0;
						state.mode = OS;
					case OS:
						while (bits < 16) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						if (state.head) {
							state.head.xflags = hold & 255;
							state.head.os = hold >> 8;
						}
						if (state.flags & 512) {
							hbuf[0] = hold & 255;
							hbuf[1] = hold >>> 8 & 255;
							state.check = crc32(state.check, hbuf, 2, 0);
						}
						hold = 0;
						bits = 0;
						state.mode = EXLEN;
					case EXLEN:
						if (state.flags & 1024) {
							while (bits < 16) {
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							state.length = hold;
							if (state.head) state.head.extra_len = hold;
							if (state.flags & 512) {
								hbuf[0] = hold & 255;
								hbuf[1] = hold >>> 8 & 255;
								state.check = crc32(state.check, hbuf, 2, 0);
							}
							hold = 0;
							bits = 0;
						} else if (state.head) state.head.extra = null;
						state.mode = EXTRA;
					case EXTRA:
						if (state.flags & 1024) {
							copy = state.length;
							if (copy > have) copy = have;
							if (copy) {
								if (state.head) {
									len = state.head.extra_len - state.length;
									if (!state.head.extra) state.head.extra = new Array(state.head.extra_len);
									utils.arraySet(state.head.extra, input, next, copy, len);
								}
								if (state.flags & 512) state.check = crc32(state.check, input, copy, next);
								have -= copy;
								next += copy;
								state.length -= copy;
							}
							if (state.length) break inf_leave;
						}
						state.length = 0;
						state.mode = NAME;
					case NAME:
						if (state.flags & 2048) {
							if (have === 0) break inf_leave;
							copy = 0;
							do {
								len = input[next + copy++];
								if (state.head && len && state.length < 65536) state.head.name += String.fromCharCode(len);
							} while (len && copy < have);
							if (state.flags & 512) state.check = crc32(state.check, input, copy, next);
							have -= copy;
							next += copy;
							if (len) break inf_leave;
						} else if (state.head) state.head.name = null;
						state.length = 0;
						state.mode = COMMENT;
					case COMMENT:
						if (state.flags & 4096) {
							if (have === 0) break inf_leave;
							copy = 0;
							do {
								len = input[next + copy++];
								if (state.head && len && state.length < 65536) state.head.comment += String.fromCharCode(len);
							} while (len && copy < have);
							if (state.flags & 512) state.check = crc32(state.check, input, copy, next);
							have -= copy;
							next += copy;
							if (len) break inf_leave;
						} else if (state.head) state.head.comment = null;
						state.mode = HCRC;
					case HCRC:
						if (state.flags & 512) {
							while (bits < 16) {
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							if (hold !== (state.check & 65535)) {
								strm.msg = "header crc mismatch";
								state.mode = BAD;
								break;
							}
							hold = 0;
							bits = 0;
						}
						if (state.head) {
							state.head.hcrc = state.flags >> 9 & 1;
							state.head.done = true;
						}
						strm.adler = state.check = 0;
						state.mode = TYPE;
						break;
					case DICTID:
						while (bits < 32) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						strm.adler = state.check = zswap32(hold);
						hold = 0;
						bits = 0;
						state.mode = DICT;
					case DICT:
						if (state.havedict === 0) {
							strm.next_out = put;
							strm.avail_out = left;
							strm.next_in = next;
							strm.avail_in = have;
							state.hold = hold;
							state.bits = bits;
							return Z_NEED_DICT;
						}
						strm.adler = state.check = 1;
						state.mode = TYPE;
					case TYPE: if (flush === Z_BLOCK || flush === Z_TREES) break inf_leave;
					case TYPEDO:
						if (state.last) {
							hold >>>= bits & 7;
							bits -= bits & 7;
							state.mode = CHECK;
							break;
						}
						while (bits < 3) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						state.last = hold & 1;
						hold >>>= 1;
						bits -= 1;
						switch (hold & 3) {
							case 0:
								state.mode = STORED;
								break;
							case 1:
								fixedtables(state);
								state.mode = LEN_;
								if (flush === Z_TREES) {
									hold >>>= 2;
									bits -= 2;
									break inf_leave;
								}
								break;
							case 2:
								state.mode = TABLE;
								break;
							case 3:
								strm.msg = "invalid block type";
								state.mode = BAD;
						}
						hold >>>= 2;
						bits -= 2;
						break;
					case STORED:
						hold >>>= bits & 7;
						bits -= bits & 7;
						while (bits < 32) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
							strm.msg = "invalid stored block lengths";
							state.mode = BAD;
							break;
						}
						state.length = hold & 65535;
						hold = 0;
						bits = 0;
						state.mode = COPY_;
						if (flush === Z_TREES) break inf_leave;
					case COPY_: state.mode = COPY;
					case COPY:
						copy = state.length;
						if (copy) {
							if (copy > have) copy = have;
							if (copy > left) copy = left;
							if (copy === 0) break inf_leave;
							utils.arraySet(output, input, next, copy, put);
							have -= copy;
							next += copy;
							left -= copy;
							put += copy;
							state.length -= copy;
							break;
						}
						state.mode = TYPE;
						break;
					case TABLE:
						while (bits < 14) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						state.nlen = (hold & 31) + 257;
						hold >>>= 5;
						bits -= 5;
						state.ndist = (hold & 31) + 1;
						hold >>>= 5;
						bits -= 5;
						state.ncode = (hold & 15) + 4;
						hold >>>= 4;
						bits -= 4;
						if (state.nlen > 286 || state.ndist > 30) {
							strm.msg = "too many length or distance symbols";
							state.mode = BAD;
							break;
						}
						state.have = 0;
						state.mode = LENLENS;
					case LENLENS:
						while (state.have < state.ncode) {
							while (bits < 3) {
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							state.lens[order[state.have++]] = hold & 7;
							hold >>>= 3;
							bits -= 3;
						}
						while (state.have < 19) state.lens[order[state.have++]] = 0;
						state.lencode = state.lendyn;
						state.lenbits = 7;
						opts = { bits: state.lenbits };
						ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
						state.lenbits = opts.bits;
						if (ret) {
							strm.msg = "invalid code lengths set";
							state.mode = BAD;
							break;
						}
						state.have = 0;
						state.mode = CODELENS;
					case CODELENS:
						while (state.have < state.nlen + state.ndist) {
							for (;;) {
								here = state.lencode[hold & (1 << state.lenbits) - 1];
								here_bits = here >>> 24;
								here_op = here >>> 16 & 255;
								here_val = here & 65535;
								if (here_bits <= bits) break;
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							if (here_val < 16) {
								hold >>>= here_bits;
								bits -= here_bits;
								state.lens[state.have++] = here_val;
							} else {
								if (here_val === 16) {
									n = here_bits + 2;
									while (bits < n) {
										if (have === 0) break inf_leave;
										have--;
										hold += input[next++] << bits;
										bits += 8;
									}
									hold >>>= here_bits;
									bits -= here_bits;
									if (state.have === 0) {
										strm.msg = "invalid bit length repeat";
										state.mode = BAD;
										break;
									}
									len = state.lens[state.have - 1];
									copy = 3 + (hold & 3);
									hold >>>= 2;
									bits -= 2;
								} else if (here_val === 17) {
									n = here_bits + 3;
									while (bits < n) {
										if (have === 0) break inf_leave;
										have--;
										hold += input[next++] << bits;
										bits += 8;
									}
									hold >>>= here_bits;
									bits -= here_bits;
									len = 0;
									copy = 3 + (hold & 7);
									hold >>>= 3;
									bits -= 3;
								} else {
									n = here_bits + 7;
									while (bits < n) {
										if (have === 0) break inf_leave;
										have--;
										hold += input[next++] << bits;
										bits += 8;
									}
									hold >>>= here_bits;
									bits -= here_bits;
									len = 0;
									copy = 11 + (hold & 127);
									hold >>>= 7;
									bits -= 7;
								}
								if (state.have + copy > state.nlen + state.ndist) {
									strm.msg = "invalid bit length repeat";
									state.mode = BAD;
									break;
								}
								while (copy--) state.lens[state.have++] = len;
							}
						}
						if (state.mode === BAD) break;
						if (state.lens[256] === 0) {
							strm.msg = "invalid code -- missing end-of-block";
							state.mode = BAD;
							break;
						}
						state.lenbits = 9;
						opts = { bits: state.lenbits };
						ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
						state.lenbits = opts.bits;
						if (ret) {
							strm.msg = "invalid literal/lengths set";
							state.mode = BAD;
							break;
						}
						state.distbits = 6;
						state.distcode = state.distdyn;
						opts = { bits: state.distbits };
						ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
						state.distbits = opts.bits;
						if (ret) {
							strm.msg = "invalid distances set";
							state.mode = BAD;
							break;
						}
						state.mode = LEN_;
						if (flush === Z_TREES) break inf_leave;
					case LEN_: state.mode = LEN;
					case LEN:
						if (have >= 6 && left >= 258) {
							strm.next_out = put;
							strm.avail_out = left;
							strm.next_in = next;
							strm.avail_in = have;
							state.hold = hold;
							state.bits = bits;
							inflate_fast(strm, _out);
							put = strm.next_out;
							output = strm.output;
							left = strm.avail_out;
							next = strm.next_in;
							input = strm.input;
							have = strm.avail_in;
							hold = state.hold;
							bits = state.bits;
							if (state.mode === TYPE) state.back = -1;
							break;
						}
						state.back = 0;
						for (;;) {
							here = state.lencode[hold & (1 << state.lenbits) - 1];
							here_bits = here >>> 24;
							here_op = here >>> 16 & 255;
							here_val = here & 65535;
							if (here_bits <= bits) break;
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						if (here_op && (here_op & 240) === 0) {
							last_bits = here_bits;
							last_op = here_op;
							last_val = here_val;
							for (;;) {
								here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
								here_bits = here >>> 24;
								here_op = here >>> 16 & 255;
								here_val = here & 65535;
								if (last_bits + here_bits <= bits) break;
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							hold >>>= last_bits;
							bits -= last_bits;
							state.back += last_bits;
						}
						hold >>>= here_bits;
						bits -= here_bits;
						state.back += here_bits;
						state.length = here_val;
						if (here_op === 0) {
							state.mode = LIT;
							break;
						}
						if (here_op & 32) {
							state.back = -1;
							state.mode = TYPE;
							break;
						}
						if (here_op & 64) {
							strm.msg = "invalid literal/length code";
							state.mode = BAD;
							break;
						}
						state.extra = here_op & 15;
						state.mode = LENEXT;
					case LENEXT:
						if (state.extra) {
							n = state.extra;
							while (bits < n) {
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							state.length += hold & (1 << state.extra) - 1;
							hold >>>= state.extra;
							bits -= state.extra;
							state.back += state.extra;
						}
						state.was = state.length;
						state.mode = DIST;
					case DIST:
						for (;;) {
							here = state.distcode[hold & (1 << state.distbits) - 1];
							here_bits = here >>> 24;
							here_op = here >>> 16 & 255;
							here_val = here & 65535;
							if (here_bits <= bits) break;
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						if ((here_op & 240) === 0) {
							last_bits = here_bits;
							last_op = here_op;
							last_val = here_val;
							for (;;) {
								here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
								here_bits = here >>> 24;
								here_op = here >>> 16 & 255;
								here_val = here & 65535;
								if (last_bits + here_bits <= bits) break;
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							hold >>>= last_bits;
							bits -= last_bits;
							state.back += last_bits;
						}
						hold >>>= here_bits;
						bits -= here_bits;
						state.back += here_bits;
						if (here_op & 64) {
							strm.msg = "invalid distance code";
							state.mode = BAD;
							break;
						}
						state.offset = here_val;
						state.extra = here_op & 15;
						state.mode = DISTEXT;
					case DISTEXT:
						if (state.extra) {
							n = state.extra;
							while (bits < n) {
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							state.offset += hold & (1 << state.extra) - 1;
							hold >>>= state.extra;
							bits -= state.extra;
							state.back += state.extra;
						}
						if (state.offset > state.dmax) {
							strm.msg = "invalid distance too far back";
							state.mode = BAD;
							break;
						}
						state.mode = MATCH;
					case MATCH:
						if (left === 0) break inf_leave;
						copy = _out - left;
						if (state.offset > copy) {
							copy = state.offset - copy;
							if (copy > state.whave) {
								if (state.sane) {
									strm.msg = "invalid distance too far back";
									state.mode = BAD;
									break;
								}
							}
							if (copy > state.wnext) {
								copy -= state.wnext;
								from = state.wsize - copy;
							} else from = state.wnext - copy;
							if (copy > state.length) copy = state.length;
							from_source = state.window;
						} else {
							from_source = output;
							from = put - state.offset;
							copy = state.length;
						}
						if (copy > left) copy = left;
						left -= copy;
						state.length -= copy;
						do
							output[put++] = from_source[from++];
						while (--copy);
						if (state.length === 0) state.mode = LEN;
						break;
					case LIT:
						if (left === 0) break inf_leave;
						output[put++] = state.length;
						left--;
						state.mode = LEN;
						break;
					case CHECK:
						if (state.wrap) {
							while (bits < 32) {
								if (have === 0) break inf_leave;
								have--;
								hold |= input[next++] << bits;
								bits += 8;
							}
							_out -= left;
							strm.total_out += _out;
							state.total += _out;
							if (_out) strm.adler = state.check = state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
							_out = left;
							if ((state.flags ? hold : zswap32(hold)) !== state.check) {
								strm.msg = "incorrect data check";
								state.mode = BAD;
								break;
							}
							hold = 0;
							bits = 0;
						}
						state.mode = LENGTH;
					case LENGTH:
						if (state.wrap && state.flags) {
							while (bits < 32) {
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							if (hold !== (state.total & 4294967295)) {
								strm.msg = "incorrect length check";
								state.mode = BAD;
								break;
							}
							hold = 0;
							bits = 0;
						}
						state.mode = DONE;
					case DONE:
						ret = Z_STREAM_END;
						break inf_leave;
					case BAD:
						ret = Z_DATA_ERROR;
						break inf_leave;
					case MEM: return Z_MEM_ERROR;
					case SYNC:
					default: return Z_STREAM_ERROR;
				}
				strm.next_out = put;
				strm.avail_out = left;
				strm.next_in = next;
				strm.avail_in = have;
				state.hold = hold;
				state.bits = bits;
				if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
					if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
						state.mode = MEM;
						return Z_MEM_ERROR;
					}
				}
				_in -= strm.avail_in;
				_out -= strm.avail_out;
				strm.total_in += _in;
				strm.total_out += _out;
				state.total += _out;
				if (state.wrap && _out) strm.adler = state.check = state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
				strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
				if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) ret = Z_BUF_ERROR;
				return ret;
			}
			function inflateEnd(strm) {
				if (!strm || !strm.state) return Z_STREAM_ERROR;
				var state = strm.state;
				if (state.window) state.window = null;
				strm.state = null;
				return Z_OK;
			}
			function inflateGetHeader(strm, head) {
				var state;
				if (!strm || !strm.state) return Z_STREAM_ERROR;
				state = strm.state;
				if ((state.wrap & 2) === 0) return Z_STREAM_ERROR;
				state.head = head;
				head.done = false;
				return Z_OK;
			}
			function inflateSetDictionary(strm, dictionary) {
				var dictLength = dictionary.length;
				var state;
				var dictid;
				var ret;
				if (!strm || !strm.state) return Z_STREAM_ERROR;
				state = strm.state;
				if (state.wrap !== 0 && state.mode !== DICT) return Z_STREAM_ERROR;
				if (state.mode === DICT) {
					dictid = 1;
					dictid = adler32(dictid, dictionary, dictLength, 0);
					if (dictid !== state.check) return Z_DATA_ERROR;
				}
				ret = updatewindow(strm, dictionary, dictLength, dictLength);
				if (ret) {
					state.mode = MEM;
					return Z_MEM_ERROR;
				}
				state.havedict = 1;
				return Z_OK;
			}
			exports.inflateReset = inflateReset;
			exports.inflateReset2 = inflateReset2;
			exports.inflateResetKeep = inflateResetKeep;
			exports.inflateInit = inflateInit;
			exports.inflateInit2 = inflateInit2;
			exports.inflate = inflate;
			exports.inflateEnd = inflateEnd;
			exports.inflateGetHeader = inflateGetHeader;
			exports.inflateSetDictionary = inflateSetDictionary;
			exports.inflateInfo = "pako inflate (from Nodeca project)";
		}, {
			"../utils/common": 1,
			"./adler32": 3,
			"./crc32": 5,
			"./inffast": 7,
			"./inftrees": 9
		}],
		9: [function(require, module, exports) {
			"use strict";
			var utils = require("../utils/common");
			var MAXBITS = 15;
			var ENOUGH_LENS = 852;
			var ENOUGH_DISTS = 592;
			var CODES = 0;
			var LENS = 1;
			var DISTS = 2;
			var lbase = [
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10,
				11,
				13,
				15,
				17,
				19,
				23,
				27,
				31,
				35,
				43,
				51,
				59,
				67,
				83,
				99,
				115,
				131,
				163,
				195,
				227,
				258,
				0,
				0
			];
			var lext = [
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				16,
				17,
				17,
				17,
				17,
				18,
				18,
				18,
				18,
				19,
				19,
				19,
				19,
				20,
				20,
				20,
				20,
				21,
				21,
				21,
				21,
				16,
				72,
				78
			];
			var dbase = [
				1,
				2,
				3,
				4,
				5,
				7,
				9,
				13,
				17,
				25,
				33,
				49,
				65,
				97,
				129,
				193,
				257,
				385,
				513,
				769,
				1025,
				1537,
				2049,
				3073,
				4097,
				6145,
				8193,
				12289,
				16385,
				24577,
				0,
				0
			];
			var dext = [
				16,
				16,
				16,
				16,
				17,
				17,
				18,
				18,
				19,
				19,
				20,
				20,
				21,
				21,
				22,
				22,
				23,
				23,
				24,
				24,
				25,
				25,
				26,
				26,
				27,
				27,
				28,
				28,
				29,
				29,
				64,
				64
			];
			module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
				var bits = opts.bits;
				var len = 0;
				var sym = 0;
				var min = 0, max = 0;
				var root = 0;
				var curr = 0;
				var drop = 0;
				var left = 0;
				var used = 0;
				var huff = 0;
				var incr;
				var fill;
				var low;
				var mask;
				var next;
				var base = null;
				var base_index = 0;
				var end;
				var count = new utils.Buf16(MAXBITS + 1);
				var offs = new utils.Buf16(MAXBITS + 1);
				var extra = null;
				var extra_index = 0;
				var here_bits, here_op, here_val;
				for (len = 0; len <= MAXBITS; len++) count[len] = 0;
				for (sym = 0; sym < codes; sym++) count[lens[lens_index + sym]]++;
				root = bits;
				for (max = MAXBITS; max >= 1; max--) if (count[max] !== 0) break;
				if (root > max) root = max;
				if (max === 0) {
					table[table_index++] = 20971520;
					table[table_index++] = 20971520;
					opts.bits = 1;
					return 0;
				}
				for (min = 1; min < max; min++) if (count[min] !== 0) break;
				if (root < min) root = min;
				left = 1;
				for (len = 1; len <= MAXBITS; len++) {
					left <<= 1;
					left -= count[len];
					if (left < 0) return -1;
				}
				if (left > 0 && (type === CODES || max !== 1)) return -1;
				offs[1] = 0;
				for (len = 1; len < MAXBITS; len++) offs[len + 1] = offs[len] + count[len];
				for (sym = 0; sym < codes; sym++) if (lens[lens_index + sym] !== 0) work[offs[lens[lens_index + sym]]++] = sym;
				if (type === CODES) {
					base = extra = work;
					end = 19;
				} else if (type === LENS) {
					base = lbase;
					base_index -= 257;
					extra = lext;
					extra_index -= 257;
					end = 256;
				} else {
					base = dbase;
					extra = dext;
					end = -1;
				}
				huff = 0;
				sym = 0;
				len = min;
				next = table_index;
				curr = root;
				drop = 0;
				low = -1;
				used = 1 << root;
				mask = used - 1;
				if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) return 1;
				for (;;) {
					here_bits = len - drop;
					if (work[sym] < end) {
						here_op = 0;
						here_val = work[sym];
					} else if (work[sym] > end) {
						here_op = extra[extra_index + work[sym]];
						here_val = base[base_index + work[sym]];
					} else {
						here_op = 96;
						here_val = 0;
					}
					incr = 1 << len - drop;
					fill = 1 << curr;
					min = fill;
					do {
						fill -= incr;
						table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
					} while (fill !== 0);
					incr = 1 << len - 1;
					while (huff & incr) incr >>= 1;
					if (incr !== 0) {
						huff &= incr - 1;
						huff += incr;
					} else huff = 0;
					sym++;
					if (--count[len] === 0) {
						if (len === max) break;
						len = lens[lens_index + work[sym]];
					}
					if (len > root && (huff & mask) !== low) {
						if (drop === 0) drop = root;
						next += min;
						curr = len - drop;
						left = 1 << curr;
						while (curr + drop < max) {
							left -= count[curr + drop];
							if (left <= 0) break;
							curr++;
							left <<= 1;
						}
						used += 1 << curr;
						if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) return 1;
						low = huff & mask;
						table[low] = root << 24 | curr << 16 | next - table_index | 0;
					}
				}
				if (huff !== 0) table[next + huff] = len - drop << 24 | 4194304;
				opts.bits = root;
				return 0;
			};
		}, { "../utils/common": 1 }],
		10: [function(require, module, exports) {
			"use strict";
			module.exports = {
				2: "need dictionary",
				1: "stream end",
				0: "",
				"-1": "file error",
				"-2": "stream error",
				"-3": "data error",
				"-4": "insufficient memory",
				"-5": "buffer error",
				"-6": "incompatible version"
			};
		}, {}],
		11: [function(require, module, exports) {
			"use strict";
			function ZStream() {
				this.input = null;
				this.next_in = 0;
				this.avail_in = 0;
				this.total_in = 0;
				this.output = null;
				this.next_out = 0;
				this.avail_out = 0;
				this.total_out = 0;
				this.msg = "";
				this.state = null;
				this.data_type = 2;
				this.adler = 0;
			}
			module.exports = ZStream;
		}, {}],
		"/lib/inflate.js": [function(require, module, exports) {
			"use strict";
			var zlib_inflate = require("./zlib/inflate");
			var utils = require("./utils/common");
			var strings = require("./utils/strings");
			var c = require("./zlib/constants");
			var msg = require("./zlib/messages");
			var ZStream = require("./zlib/zstream");
			var GZheader = require("./zlib/gzheader");
			var toString = Object.prototype.toString;
			/**
			* class Inflate
			*
			* Generic JS-style wrapper for zlib calls. If you don't need
			* streaming behaviour - use more simple functions: [[inflate]]
			* and [[inflateRaw]].
			**/
			/**
			* Inflate.result -> Uint8Array|Array|String
			*
			* Uncompressed result, generated by default [[Inflate#onData]]
			* and [[Inflate#onEnd]] handlers. Filled after you push last chunk
			* (call [[Inflate#push]] with `Z_FINISH` / `true` param) or if you
			* push a chunk with explicit flush (call [[Inflate#push]] with
			* `Z_SYNC_FLUSH` param).
			**/
			/**
			* Inflate.err -> Number
			*
			* Error code after inflate finished. 0 (Z_OK) on success.
			* Should be checked if broken data possible.
			**/
			/**
			* Inflate.msg -> String
			*
			* Error message, if [[Inflate.err]] != 0
			**/
			/**
			* new Inflate(options)
			* - options (Object): zlib inflate options.
			*
			* Creates new inflator instance with specified params. Throws exception
			* on bad params. Supported options:
			*
			* - `windowBits`
			* - `dictionary`
			*
			* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
			* for more information on these.
			*
			* Additional options, for internal needs:
			*
			* - `chunkSize` - size of generated data chunks (16K by default)
			* - `raw` (Boolean) - do raw inflate
			* - `to` (String) - if equal to 'string', then result will be converted
			*   from utf8 to utf16 (javascript) string. When string output requested,
			*   chunk length can differ from `chunkSize`, depending on content.
			*
			* By default, when no options set, autodetect deflate/gzip data format via
			* wrapper header.
			*
			* ##### Example:
			*
			* ```javascript
			* var pako = require('pako')
			*   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
			*   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
			*
			* var inflate = new pako.Inflate({ level: 3});
			*
			* inflate.push(chunk1, false);
			* inflate.push(chunk2, true);  // true -> last chunk
			*
			* if (inflate.err) { throw new Error(inflate.err); }
			*
			* console.log(inflate.result);
			* ```
			**/
			function Inflate(options) {
				if (!(this instanceof Inflate)) return new Inflate(options);
				this.options = utils.assign({
					chunkSize: 16384,
					windowBits: 0,
					to: ""
				}, options || {});
				var opt = this.options;
				if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
					opt.windowBits = -opt.windowBits;
					if (opt.windowBits === 0) opt.windowBits = -15;
				}
				if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) opt.windowBits += 32;
				if (opt.windowBits > 15 && opt.windowBits < 48) {
					if ((opt.windowBits & 15) === 0) opt.windowBits |= 15;
				}
				this.err = 0;
				this.msg = "";
				this.ended = false;
				this.chunks = [];
				this.strm = new ZStream();
				this.strm.avail_out = 0;
				var status = zlib_inflate.inflateInit2(this.strm, opt.windowBits);
				if (status !== c.Z_OK) throw new Error(msg[status]);
				this.header = new GZheader();
				zlib_inflate.inflateGetHeader(this.strm, this.header);
				if (opt.dictionary) {
					if (typeof opt.dictionary === "string") opt.dictionary = strings.string2buf(opt.dictionary);
					else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") opt.dictionary = new Uint8Array(opt.dictionary);
					if (opt.raw) {
						status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
						if (status !== c.Z_OK) throw new Error(msg[status]);
					}
				}
			}
			/**
			* Inflate#push(data[, mode]) -> Boolean
			* - data (Uint8Array|Array|ArrayBuffer|String): input data
			* - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
			*   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
			*
			* Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
			* new output chunks. Returns `true` on success. The last data block must have
			* mode Z_FINISH (or `true`). That will flush internal pending buffers and call
			* [[Inflate#onEnd]]. For interim explicit flushes (without ending the stream) you
			* can use mode Z_SYNC_FLUSH, keeping the decompression context.
			*
			* On fail call [[Inflate#onEnd]] with error code and return false.
			*
			* We strongly recommend to use `Uint8Array` on input for best speed (output
			* format is detected automatically). Also, don't skip last param and always
			* use the same type in your code (boolean or number). That will improve JS speed.
			*
			* For regular `Array`-s make sure all elements are [0..255].
			*
			* ##### Example
			*
			* ```javascript
			* push(chunk, false); // push one of data chunks
			* ...
			* push(chunk, true);  // push last chunk
			* ```
			**/
			Inflate.prototype.push = function(data, mode) {
				var strm = this.strm;
				var chunkSize = this.options.chunkSize;
				var dictionary = this.options.dictionary;
				var status, _mode;
				var next_out_utf8, tail, utf8str;
				var allowBufError = false;
				if (this.ended) return false;
				_mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
				if (typeof data === "string") strm.input = strings.binstring2buf(data);
				else if (toString.call(data) === "[object ArrayBuffer]") strm.input = new Uint8Array(data);
				else strm.input = data;
				strm.next_in = 0;
				strm.avail_in = strm.input.length;
				do {
					if (strm.avail_out === 0) {
						strm.output = new utils.Buf8(chunkSize);
						strm.next_out = 0;
						strm.avail_out = chunkSize;
					}
					status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
					if (status === c.Z_NEED_DICT && dictionary) status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
					if (status === c.Z_BUF_ERROR && allowBufError === true) {
						status = c.Z_OK;
						allowBufError = false;
					}
					if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
						this.onEnd(status);
						this.ended = true;
						return false;
					}
					if (strm.next_out) {
						if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
							if (this.options.to === "string") {
								next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
								tail = strm.next_out - next_out_utf8;
								utf8str = strings.buf2string(strm.output, next_out_utf8);
								strm.next_out = tail;
								strm.avail_out = chunkSize - tail;
								if (tail) utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
								this.onData(utf8str);
							} else this.onData(utils.shrinkBuf(strm.output, strm.next_out));
						}
					}
					if (strm.avail_in === 0 && strm.avail_out === 0) allowBufError = true;
				} while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
				if (status === c.Z_STREAM_END) _mode = c.Z_FINISH;
				if (_mode === c.Z_FINISH) {
					status = zlib_inflate.inflateEnd(this.strm);
					this.onEnd(status);
					this.ended = true;
					return status === c.Z_OK;
				}
				if (_mode === c.Z_SYNC_FLUSH) {
					this.onEnd(c.Z_OK);
					strm.avail_out = 0;
					return true;
				}
				return true;
			};
			/**
			* Inflate#onData(chunk) -> Void
			* - chunk (Uint8Array|Array|String): output data. Type of array depends
			*   on js engine support. When string output requested, each chunk
			*   will be string.
			*
			* By default, stores data blocks in `chunks[]` property and glue
			* those in `onEnd`. Override this handler, if you need another behaviour.
			**/
			Inflate.prototype.onData = function(chunk) {
				this.chunks.push(chunk);
			};
			/**
			* Inflate#onEnd(status) -> Void
			* - status (Number): inflate status. 0 (Z_OK) on success,
			*   other if not.
			*
			* Called either after you tell inflate that the input stream is
			* complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
			* or if an error happened. By default - join collected chunks,
			* free memory and fill `results` / `err` properties.
			**/
			Inflate.prototype.onEnd = function(status) {
				if (status === c.Z_OK) {
					if (this.options.to === "string") this.result = this.chunks.join("");
					else this.result = utils.flattenChunks(this.chunks);
				}
				this.chunks = [];
				this.err = status;
				this.msg = this.strm.msg;
			};
			/**
			* inflate(data[, options]) -> Uint8Array|Array|String
			* - data (Uint8Array|Array|String): input data to decompress.
			* - options (Object): zlib inflate options.
			*
			* Decompress `data` with inflate/ungzip and `options`. Autodetect
			* format via wrapper header by default. That's why we don't provide
			* separate `ungzip` method.
			*
			* Supported options are:
			*
			* - windowBits
			*
			* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
			* for more information.
			*
			* Sugar (options):
			*
			* - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
			*   negative windowBits implicitly.
			* - `to` (String) - if equal to 'string', then result will be converted
			*   from utf8 to utf16 (javascript) string. When string output requested,
			*   chunk length can differ from `chunkSize`, depending on content.
			*
			*
			* ##### Example:
			*
			* ```javascript
			* var pako = require('pako')
			*   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
			*   , output;
			*
			* try {
			*   output = pako.inflate(input);
			* } catch (err)
			*   console.log(err);
			* }
			* ```
			**/
			function inflate(input, options) {
				var inflator = new Inflate(options);
				inflator.push(input, true);
				if (inflator.err) throw inflator.msg || msg[inflator.err];
				return inflator.result;
			}
			/**
			* inflateRaw(data[, options]) -> Uint8Array|Array|String
			* - data (Uint8Array|Array|String): input data to decompress.
			* - options (Object): zlib inflate options.
			*
			* The same as [[inflate]], but creates raw data, without wrapper
			* (header and adler32 crc).
			**/
			function inflateRaw(input, options) {
				options = options || {};
				options.raw = true;
				return inflate(input, options);
			}
			/**
			* ungzip(data[, options]) -> Uint8Array|Array|String
			* - data (Uint8Array|Array|String): input data to decompress.
			* - options (Object): zlib inflate options.
			*
			* Just shortcut to [[inflate]], because it autodetects format
			* by header.content. Done for convenience.
			**/
			exports.Inflate = Inflate;
			exports.inflate = inflate;
			exports.inflateRaw = inflateRaw;
			exports.ungzip = inflate;
		}, {
			"./utils/common": 1,
			"./utils/strings": 2,
			"./zlib/constants": 4,
			"./zlib/gzheader": 6,
			"./zlib/inflate": 8,
			"./zlib/messages": 10,
			"./zlib/zstream": 11
		}]
	}, {}, [])("/lib/inflate.js");
})();

// packages/global-styles-ui/build-module/font-library/lib/lib-font.browser.mjs
/**
* Credits:
*
* lib-font
* https://github.com/Pomax/lib-font
* https://github.com/Pomax/lib-font/blob/master/lib-font.browser.js
*
* The MIT License (MIT)
*
* Copyright (c) 2020 pomax@nihongoresources.com
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
globalThis.fetch;
var Event$1 = class {
	constructor(type, detail = {}, msg) {
		this.type = type;
		this.detail = detail;
		this.msg = msg;
		Object.defineProperty(this, `__mayPropagate`, {
			enumerable: false,
			writable: true
		});
		this.__mayPropagate = true;
	}
	preventDefault() {}
	stopPropagation() {
		this.__mayPropagate = false;
	}
	valueOf() {
		return this;
	}
	toString() {
		return this.msg ? `[${this.type} event]: ${this.msg}` : `[${this.type} event]`;
	}
};
var EventManager = class {
	constructor() {
		this.listeners = {};
	}
	addEventListener(type, listener, useCapture) {
		let bin = this.listeners[type] || [];
		if (useCapture) bin.unshift(listener);
		else bin.push(listener);
		this.listeners[type] = bin;
	}
	removeEventListener(type, listener) {
		let bin = this.listeners[type] || [];
		let pos = bin.findIndex((e) => e === listener);
		if (pos > -1) {
			bin.splice(pos, 1);
			this.listeners[type] = bin;
		}
	}
	dispatch(event) {
		let bin = this.listeners[event.type];
		if (bin) for (let l = 0, e = bin.length; l < e; l++) {
			if (!event.__mayPropagate) break;
			bin[l](event);
		}
	}
};
const startDate = (/* @__PURE__ */ new Date(`1904-01-01T00:00:00+0000`)).getTime();
function asText(data) {
	return Array.from(data).map((v) => String.fromCharCode(v)).join(``);
}
var Parser = class {
	constructor(dict, dataview, name) {
		this.name = (name || dict.tag || ``).trim();
		this.length = dict.length;
		this.start = dict.offset;
		this.offset = 0;
		this.data = dataview;
		[
			`getInt8`,
			`getUint8`,
			`getInt16`,
			`getUint16`,
			`getInt32`,
			`getUint32`,
			`getBigInt64`,
			`getBigUint64`
		].forEach((name) => {
			let fn = name.replace(/get(Big)?/, "").toLowerCase();
			let increment = parseInt(name.replace(/[^\d]/g, "")) / 8;
			Object.defineProperty(this, fn, { get: () => this.getValue(name, increment) });
		});
	}
	get currentPosition() {
		return this.start + this.offset;
	}
	set currentPosition(position) {
		this.start = position;
		this.offset = 0;
	}
	skip(n = 0, bits = 8) {
		this.offset += n * bits / 8;
	}
	getValue(type, increment) {
		let pos = this.start + this.offset;
		this.offset += increment;
		try {
			return this.data[type](pos);
		} catch (e) {
			console.error(`parser`, type, increment, this);
			console.error(`parser`, this.start, this.offset);
			throw e;
		}
	}
	flags(n) {
		if (n === 8 || n === 16 || n === 32 || n === 64) return this[`uint${n}`].toString(2).padStart(n, 0).split(``).map((v) => v === "1");
		console.error(`Error parsing flags: flag types can only be 1, 2, 4, or 8 bytes long`);
		console.trace();
	}
	get tag() {
		const t = this.uint32;
		return asText([
			t >> 24 & 255,
			t >> 16 & 255,
			t >> 8 & 255,
			t & 255
		]);
	}
	get fixed() {
		return this.int16 + Math.round(1e3 * this.uint16 / 65356) / 1e3;
	}
	get legacyFixed() {
		let major = this.uint16;
		let minor = this.uint16.toString(16).padStart(4, 0);
		return parseFloat(`${major}.${minor}`);
	}
	get uint24() {
		return (this.uint8 << 16) + (this.uint8 << 8) + this.uint8;
	}
	get uint128() {
		let value = 0;
		for (let i = 0; i < 5; i++) {
			let byte = this.uint8;
			value = value * 128 + (byte & 127);
			if (byte < 128) break;
		}
		return value;
	}
	get longdatetime() {
		return new Date(startDate + 1e3 * parseInt(this.int64.toString()));
	}
	get fword() {
		return this.int16;
	}
	get ufword() {
		return this.uint16;
	}
	get Offset16() {
		return this.uint16;
	}
	get Offset32() {
		return this.uint32;
	}
	get F2DOT14() {
		const bits = p.uint16;
		return [
			0,
			1,
			-2,
			-1
		][bits >> 14] + (bits & 16383) / 16384;
	}
	verifyLength() {
		if (this.offset != this.length) console.error(`unexpected parsed table size (${this.offset}) for "${this.name}" (expected ${this.length})`);
	}
	readBytes(n = 0, position = 0, bits = 8, signed = false) {
		n = n || this.length;
		if (n === 0) return [];
		if (position) this.currentPosition = position;
		const fn = `${signed ? `` : `u`}int${bits}`, slice = [];
		while (n--) slice.push(this[fn]);
		return slice;
	}
};
var ParsedData = class {
	constructor(parser) {
		Object.defineProperty(this, `parser`, {
			enumerable: false,
			get: () => parser
		});
		const start = parser.currentPosition;
		Object.defineProperty(this, `start`, {
			enumerable: false,
			get: () => start
		});
	}
	load(struct) {
		Object.keys(struct).forEach((p) => {
			let props = Object.getOwnPropertyDescriptor(struct, p);
			if (props.get) this[p] = props.get.bind(this);
			else if (props.value !== void 0) this[p] = props.value;
		});
		if (this.parser.length) this.parser.verifyLength();
	}
};
var SimpleTable = class extends ParsedData {
	constructor(dict, dataview, name) {
		const { parser, start } = super(new Parser(dict, dataview, name));
		Object.defineProperty(this, `p`, {
			enumerable: false,
			get: () => parser
		});
		Object.defineProperty(this, `tableStart`, {
			enumerable: false,
			get: () => start
		});
	}
};
function lazy$1(object, property, getter) {
	let val;
	Object.defineProperty(object, property, {
		get: () => {
			if (val) return val;
			val = getter();
			return val;
		},
		enumerable: true
	});
}
var SFNT = class extends SimpleTable {
	constructor(font, dataview, createTable) {
		const { p } = super({
			offset: 0,
			length: 12
		}, dataview, `sfnt`);
		this.version = p.uint32;
		this.numTables = p.uint16;
		this.searchRange = p.uint16;
		this.entrySelector = p.uint16;
		this.rangeShift = p.uint16;
		p.verifyLength();
		this.directory = [...new Array(this.numTables)].map((_) => new TableRecord(p));
		this.tables = {};
		this.directory.forEach((entry) => {
			const getter = () => createTable(this.tables, {
				tag: entry.tag,
				offset: entry.offset,
				length: entry.length
			}, dataview);
			lazy$1(this.tables, entry.tag.trim(), getter);
		});
	}
};
var TableRecord = class {
	constructor(p) {
		this.tag = p.tag;
		this.checksum = p.uint32;
		this.offset = p.uint32;
		this.length = p.uint32;
	}
};
const gzipDecode = inflate_default.inflate || void 0;
var WOFF$1 = class extends SimpleTable {
	constructor(font, dataview, createTable) {
		const { p } = super({
			offset: 0,
			length: 44
		}, dataview, `woff`);
		this.signature = p.tag;
		this.flavor = p.uint32;
		this.length = p.uint32;
		this.numTables = p.uint16;
		p.uint16;
		this.totalSfntSize = p.uint32;
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.metaOffset = p.uint32;
		this.metaLength = p.uint32;
		this.metaOrigLength = p.uint32;
		this.privOffset = p.uint32;
		this.privLength = p.uint32;
		p.verifyLength();
		this.directory = [...new Array(this.numTables)].map((_) => new WoffTableDirectoryEntry(p));
		buildWoffLazyLookups(this, dataview, createTable);
	}
};
var WoffTableDirectoryEntry = class {
	constructor(p) {
		this.tag = p.tag;
		this.offset = p.uint32;
		this.compLength = p.uint32;
		this.origLength = p.uint32;
		this.origChecksum = p.uint32;
	}
};
function buildWoffLazyLookups(woff, dataview, createTable) {
	woff.tables = {};
	woff.directory.forEach((entry) => {
		lazy$1(woff.tables, entry.tag.trim(), () => {
			let offset = 0;
			let view = dataview;
			if (entry.compLength !== entry.origLength) {
				const data = dataview.buffer.slice(entry.offset, entry.offset + entry.compLength);
				let unpacked;
				if (gzipDecode) unpacked = gzipDecode(new Uint8Array(data));
				else {
					const msg = `no brotli decoder available to decode WOFF2 font`;
					if (font.onerror) font.onerror(msg);
					throw new Error(msg);
				}
				view = new DataView(unpacked.buffer);
			} else offset = entry.offset;
			return createTable(woff.tables, {
				tag: entry.tag,
				offset,
				length: entry.origLength
			}, view);
		});
	});
}
const brotliDecode = unbrotli_default;
var WOFF2$1 = class extends SimpleTable {
	constructor(font, dataview, createTable) {
		const { p } = super({
			offset: 0,
			length: 48
		}, dataview, `woff2`);
		this.signature = p.tag;
		this.flavor = p.uint32;
		this.length = p.uint32;
		this.numTables = p.uint16;
		p.uint16;
		this.totalSfntSize = p.uint32;
		this.totalCompressedSize = p.uint32;
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.metaOffset = p.uint32;
		this.metaLength = p.uint32;
		this.metaOrigLength = p.uint32;
		this.privOffset = p.uint32;
		this.privLength = p.uint32;
		p.verifyLength();
		this.directory = [...new Array(this.numTables)].map((_) => new Woff2TableDirectoryEntry(p));
		let dictOffset = p.currentPosition;
		this.directory[0].offset = 0;
		this.directory.forEach((e, i) => {
			let next = this.directory[i + 1];
			if (next) next.offset = e.offset + (e.transformLength !== void 0 ? e.transformLength : e.origLength);
		});
		let decoded;
		let buffer = dataview.buffer.slice(dictOffset);
		if (brotliDecode) decoded = brotliDecode(new Uint8Array(buffer));
		else {
			const msg = `no brotli decoder available to decode WOFF2 font`;
			if (font.onerror) font.onerror(msg);
			throw new Error(msg);
		}
		buildWoff2LazyLookups(this, decoded, createTable);
	}
};
var Woff2TableDirectoryEntry = class {
	constructor(p) {
		this.flags = p.uint8;
		const tagNumber = this.tagNumber = this.flags & 63;
		if (tagNumber === 63) this.tag = p.tag;
		else this.tag = getWOFF2Tag(tagNumber);
		let hasTransforms = (this.transformVersion = (this.flags & 192) >> 6) !== 0;
		if (this.tag === `glyf` || this.tag === `loca`) hasTransforms = this.transformVersion !== 3;
		this.origLength = p.uint128;
		if (hasTransforms) this.transformLength = p.uint128;
	}
};
function buildWoff2LazyLookups(woff2, decoded, createTable) {
	woff2.tables = {};
	woff2.directory.forEach((entry) => {
		lazy$1(woff2.tables, entry.tag.trim(), () => {
			const start = entry.offset;
			const end = start + (entry.transformLength ? entry.transformLength : entry.origLength);
			const data = new DataView(decoded.slice(start, end).buffer);
			try {
				return createTable(woff2.tables, {
					tag: entry.tag,
					offset: 0,
					length: entry.origLength
				}, data);
			} catch (e) {
				console.error(e);
			}
		});
	});
}
function getWOFF2Tag(flag) {
	return [
		`cmap`,
		`head`,
		`hhea`,
		`hmtx`,
		`maxp`,
		`name`,
		`OS/2`,
		`post`,
		`cvt `,
		`fpgm`,
		`glyf`,
		`loca`,
		`prep`,
		`CFF `,
		`VORG`,
		`EBDT`,
		`EBLC`,
		`gasp`,
		`hdmx`,
		`kern`,
		`LTSH`,
		`PCLT`,
		`VDMX`,
		`vhea`,
		`vmtx`,
		`BASE`,
		`GDEF`,
		`GPOS`,
		`GSUB`,
		`EBSC`,
		`JSTF`,
		`MATH`,
		`CBDT`,
		`CBLC`,
		`COLR`,
		`CPAL`,
		`SVG `,
		`sbix`,
		`acnt`,
		`avar`,
		`bdat`,
		`bloc`,
		`bsln`,
		`cvar`,
		`fdsc`,
		`feat`,
		`fmtx`,
		`fvar`,
		`gvar`,
		`hsty`,
		`just`,
		`lcar`,
		`mort`,
		`morx`,
		`opbd`,
		`prop`,
		`trak`,
		`Zapf`,
		`Silf`,
		`Glat`,
		`Gloc`,
		`Feat`,
		`Sill`
	][flag & 63];
}
const tableClasses = {};
let tableClassesLoaded = false;
Promise.all([
	Promise.resolve().then(function() {
		return cmap$1;
	}),
	Promise.resolve().then(function() {
		return head$1;
	}),
	Promise.resolve().then(function() {
		return hhea$1;
	}),
	Promise.resolve().then(function() {
		return hmtx$1;
	}),
	Promise.resolve().then(function() {
		return maxp$1;
	}),
	Promise.resolve().then(function() {
		return name$1;
	}),
	Promise.resolve().then(function() {
		return OS2$1;
	}),
	Promise.resolve().then(function() {
		return post$1;
	}),
	Promise.resolve().then(function() {
		return BASE$1;
	}),
	Promise.resolve().then(function() {
		return GDEF$1;
	}),
	Promise.resolve().then(function() {
		return GSUB$1;
	}),
	Promise.resolve().then(function() {
		return GPOS$1;
	}),
	Promise.resolve().then(function() {
		return SVG$1;
	}),
	Promise.resolve().then(function() {
		return fvar$1;
	}),
	Promise.resolve().then(function() {
		return cvt$1;
	}),
	Promise.resolve().then(function() {
		return fpgm$1;
	}),
	Promise.resolve().then(function() {
		return gasp$1;
	}),
	Promise.resolve().then(function() {
		return glyf$1;
	}),
	Promise.resolve().then(function() {
		return loca$1;
	}),
	Promise.resolve().then(function() {
		return prep$1;
	}),
	Promise.resolve().then(function() {
		return CFF$1;
	}),
	Promise.resolve().then(function() {
		return CFF2$1;
	}),
	Promise.resolve().then(function() {
		return VORG$1;
	}),
	Promise.resolve().then(function() {
		return EBLC$1;
	}),
	Promise.resolve().then(function() {
		return EBDT$1;
	}),
	Promise.resolve().then(function() {
		return EBSC$1;
	}),
	Promise.resolve().then(function() {
		return CBLC$1;
	}),
	Promise.resolve().then(function() {
		return CBDT$1;
	}),
	Promise.resolve().then(function() {
		return sbix$1;
	}),
	Promise.resolve().then(function() {
		return COLR$1;
	}),
	Promise.resolve().then(function() {
		return CPAL$1;
	}),
	Promise.resolve().then(function() {
		return DSIG$1;
	}),
	Promise.resolve().then(function() {
		return hdmx$1;
	}),
	Promise.resolve().then(function() {
		return kern$1;
	}),
	Promise.resolve().then(function() {
		return LTSH$1;
	}),
	Promise.resolve().then(function() {
		return MERG$1;
	}),
	Promise.resolve().then(function() {
		return meta$1;
	}),
	Promise.resolve().then(function() {
		return PCLT$1;
	}),
	Promise.resolve().then(function() {
		return VDMX$1;
	}),
	Promise.resolve().then(function() {
		return vhea$1;
	}),
	Promise.resolve().then(function() {
		return vmtx$1;
	})
]).then((data) => {
	data.forEach((e) => {
		let name = Object.keys(e)[0];
		tableClasses[name] = e[name];
	});
	tableClassesLoaded = true;
});
function createTable(tables, dict, dataview) {
	let name = dict.tag.replace(/[^\w\d]/g, ``);
	let Type = tableClasses[name];
	if (Type) return new Type(dict, dataview, tables);
	console.warn(`lib-font has no definition for ${name}. The table was skipped.`);
	return {};
}
function loadTableClasses() {
	let count = 0;
	function checkLoaded(resolve, reject) {
		if (!tableClassesLoaded) {
			if (count > 10) return reject(/* @__PURE__ */ new Error(`loading took too long`));
			count++;
			return setTimeout(() => checkLoaded(resolve), 250);
		}
		resolve(createTable);
	}
	return new Promise((resolve, reject) => checkLoaded(resolve));
}
function getFontCSSFormat(path, errorOnStyle) {
	let pos = path.lastIndexOf(`.`);
	let ext = (path.substring(pos + 1) || ``).toLowerCase();
	let format = {
		ttf: `truetype`,
		otf: `opentype`,
		woff: `woff`,
		woff2: `woff2`
	}[ext];
	if (format) return format;
	let msg = {
		eot: `The .eot format is not supported: it died in January 12, 2016, when Microsoft retired all versions of IE that didn't already support WOFF.`,
		svg: `The .svg format is not supported: SVG fonts (not to be confused with OpenType with embedded SVG) were so bad we took the entire fonts chapter out of the SVG specification again.`,
		fon: `The .fon format is not supported: this is an ancient Windows bitmap font format.`,
		ttc: `Based on the current CSS specification, font collections are not (yet?) supported.`
	}[ext];
	if (!msg) msg = `${path} is not a known webfont format.`;
	if (errorOnStyle) throw new Error(msg);
	else console.warn(`Could not load font: ${msg}`);
}
async function setupFontFace(name, url, options = {}) {
	if (!globalThis.document) return;
	let format = getFontCSSFormat(url, options.errorOnStyle);
	if (!format) return;
	let style = document.createElement(`style`);
	style.className = `injected-by-Font-js`;
	let rules = [];
	if (options.styleRules) rules = Object.entries(options.styleRules).map(([key, value]) => `${key}: ${value};`);
	style.textContent = `\n@font-face {\n    font-family: "${name}";\n    ${rules.join(`\n\t`)}\n    src: url("${url}") format("${format}");\n}`;
	globalThis.document.head.appendChild(style);
	return style;
}
const TTF = [
	0,
	1,
	0,
	0
];
const OTF = [
	79,
	84,
	84,
	79
];
const WOFF = [
	119,
	79,
	70,
	70
];
const WOFF2 = [
	119,
	79,
	70,
	50
];
function match(ar1, ar2) {
	if (ar1.length !== ar2.length) return;
	for (let i = 0; i < ar1.length; i++) if (ar1[i] !== ar2[i]) return;
	return true;
}
function validFontFormat(dataview) {
	const LEAD_BYTES = [
		dataview.getUint8(0),
		dataview.getUint8(1),
		dataview.getUint8(2),
		dataview.getUint8(3)
	];
	if (match(LEAD_BYTES, TTF) || match(LEAD_BYTES, OTF)) return `SFNT`;
	if (match(LEAD_BYTES, WOFF)) return `WOFF`;
	if (match(LEAD_BYTES, WOFF2)) return `WOFF2`;
}
function checkFetchResponseStatus(response) {
	if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);
	return response;
}
var Font = class extends EventManager {
	constructor(name, options = {}) {
		super();
		this.name = name;
		this.options = options;
		this.metrics = false;
	}
	get src() {
		return this.__src;
	}
	set src(src) {
		this.__src = src;
		(async () => {
			if (globalThis.document && !this.options.skipStyleSheet) await setupFontFace(this.name, src, this.options);
			this.loadFont(src);
		})();
	}
	async loadFont(url, filename) {
		fetch(url).then((response) => checkFetchResponseStatus(response) && response.arrayBuffer()).then((buffer) => this.fromDataBuffer(buffer, filename || url)).catch((err) => {
			const evt = new Event$1(`error`, err, `Failed to load font at ${filename || url}`);
			this.dispatch(evt);
			if (this.onerror) this.onerror(evt);
		});
	}
	async fromDataBuffer(buffer, filenameOrUrL) {
		this.fontData = new DataView(buffer);
		let type = validFontFormat(this.fontData);
		if (!type) throw new Error(`${filenameOrUrL} is either an unsupported font format, or not a font at all.`);
		await this.parseBasicData(type);
		const evt = new Event$1("load", { font: this });
		this.dispatch(evt);
		if (this.onload) this.onload(evt);
	}
	async parseBasicData(type) {
		return loadTableClasses().then((createTable) => {
			if (type === `SFNT`) this.opentype = new SFNT(this, this.fontData, createTable);
			if (type === `WOFF`) this.opentype = new WOFF$1(this, this.fontData, createTable);
			if (type === `WOFF2`) this.opentype = new WOFF2$1(this, this.fontData, createTable);
			return this.opentype;
		});
	}
	getGlyphId(char) {
		return this.opentype.tables.cmap.getGlyphId(char);
	}
	reverse(glyphid) {
		return this.opentype.tables.cmap.reverse(glyphid);
	}
	supports(char) {
		return this.getGlyphId(char) !== 0;
	}
	supportsVariation(variation) {
		return this.opentype.tables.cmap.supportsVariation(variation) !== false;
	}
	measureText(text, size = 16) {
		if (this.__unloaded) throw new Error("Cannot measure text: font was unloaded. Please reload before calling measureText()");
		let d = document.createElement("div");
		d.textContent = text;
		d.style.fontFamily = this.name;
		d.style.fontSize = `${size}px`;
		d.style.color = `transparent`;
		d.style.background = `transparent`;
		d.style.top = `0`;
		d.style.left = `0`;
		d.style.position = `absolute`;
		document.body.appendChild(d);
		let bbox = d.getBoundingClientRect();
		document.body.removeChild(d);
		const OS2 = this.opentype.tables["OS/2"];
		bbox.fontSize = size;
		bbox.ascender = OS2.sTypoAscender;
		bbox.descender = OS2.sTypoDescender;
		return bbox;
	}
	unload() {
		if (this.styleElement.parentNode) {
			this.styleElement.parentNode.removeElement(this.styleElement);
			const evt = new Event$1("unload", { font: this });
			this.dispatch(evt);
			if (this.onunload) this.onunload(evt);
		}
		this._unloaded = true;
	}
	load() {
		if (this.__unloaded) {
			delete this.__unloaded;
			document.head.appendChild(this.styleElement);
			const evt = new Event$1("load", { font: this });
			this.dispatch(evt);
			if (this.onload) this.onload(evt);
		}
	}
};
globalThis.Font = Font;
var Subtable = class extends ParsedData {
	constructor(p, plaformID, encodingID) {
		super(p);
		this.plaformID = plaformID;
		this.encodingID = encodingID;
	}
};
var Format0 = class extends Subtable {
	constructor(p, platformID, encodingID) {
		super(p, platformID, encodingID);
		this.format = 0;
		this.length = p.uint16;
		this.language = p.uint16;
		this.glyphIdArray = [...new Array(256)].map((_) => p.uint8);
	}
	supports(charCode) {
		if (charCode.charCodeAt) {
			charCode = -1;
			console.warn(`supports(character) not implemented for cmap subtable format 0. only supports(id) is implemented.`);
		}
		return 0 <= charCode && charCode <= 255;
	}
	reverse(glyphID) {
		console.warn(`reverse not implemented for cmap subtable format 0`);
		return {};
	}
	getSupportedCharCodes() {
		return [{
			start: 1,
			end: 256
		}];
	}
};
var Format2 = class extends Subtable {
	constructor(p, platformID, encodingID) {
		super(p, platformID, encodingID);
		this.format = 2;
		this.length = p.uint16;
		this.language = p.uint16;
		this.subHeaderKeys = [...new Array(256)].map((_) => p.uint16);
		const subHeaderCount = Math.max(...this.subHeaderKeys);
		const subHeaderOffset = p.currentPosition;
		lazy$1(this, `subHeaders`, () => {
			p.currentPosition = subHeaderOffset;
			return [...new Array(subHeaderCount)].map((_) => new SubHeader(p));
		});
		const glyphIndexOffset = subHeaderOffset + subHeaderCount * 8;
		lazy$1(this, `glyphIndexArray`, () => {
			p.currentPosition = glyphIndexOffset;
			return [...new Array(subHeaderCount)].map((_) => p.uint16);
		});
	}
	supports(charCode) {
		if (charCode.charCodeAt) {
			charCode = -1;
			console.warn(`supports(character) not implemented for cmap subtable format 2. only supports(id) is implemented.`);
		}
		const low = charCode && 255;
		const high = charCode && 65280;
		const subHeaderKey = this.subHeaders[high];
		const subheader = this.subHeaders[subHeaderKey];
		const first = subheader.firstCode;
		const last = first + subheader.entryCount;
		return first <= low && low <= last;
	}
	reverse(glyphID) {
		console.warn(`reverse not implemented for cmap subtable format 2`);
		return {};
	}
	getSupportedCharCodes(preservePropNames = false) {
		if (preservePropNames) return this.subHeaders.map((h) => ({
			firstCode: h.firstCode,
			lastCode: h.lastCode
		}));
		return this.subHeaders.map((h) => ({
			start: h.firstCode,
			end: h.lastCode
		}));
	}
};
var SubHeader = class {
	constructor(p) {
		this.firstCode = p.uint16;
		this.entryCount = p.uint16;
		this.lastCode = this.first + this.entryCount;
		this.idDelta = p.int16;
		this.idRangeOffset = p.uint16;
	}
};
var Format4 = class extends Subtable {
	constructor(p, platformID, encodingID) {
		super(p, platformID, encodingID);
		this.format = 4;
		this.length = p.uint16;
		this.language = p.uint16;
		this.segCountX2 = p.uint16;
		this.segCount = this.segCountX2 / 2;
		this.searchRange = p.uint16;
		this.entrySelector = p.uint16;
		this.rangeShift = p.uint16;
		const endCodePosition = p.currentPosition;
		lazy$1(this, `endCode`, () => p.readBytes(this.segCount, endCodePosition, 16));
		const startCodePosition = endCodePosition + 2 + this.segCountX2;
		lazy$1(this, `startCode`, () => p.readBytes(this.segCount, startCodePosition, 16));
		const idDeltaPosition = startCodePosition + this.segCountX2;
		lazy$1(this, `idDelta`, () => p.readBytes(this.segCount, idDeltaPosition, 16, true));
		const idRangePosition = idDeltaPosition + this.segCountX2;
		lazy$1(this, `idRangeOffset`, () => p.readBytes(this.segCount, idRangePosition, 16));
		const glyphIdArrayPosition = idRangePosition + this.segCountX2;
		const glyphIdArrayLength = this.length - (glyphIdArrayPosition - this.tableStart);
		lazy$1(this, `glyphIdArray`, () => p.readBytes(glyphIdArrayLength, glyphIdArrayPosition, 16));
		lazy$1(this, `segments`, () => this.buildSegments(idRangePosition, glyphIdArrayPosition, p));
	}
	buildSegments(idRangePosition, glyphIdArrayPosition, p) {
		const build = (_, i) => {
			let startCode = this.startCode[i], endCode = this.endCode[i], idDelta = this.idDelta[i], idRangeOffset = this.idRangeOffset[i], idRangeOffsetPointer = idRangePosition + 2 * i, glyphIDs = [];
			if (idRangeOffset === 0) for (let i = startCode + idDelta, e = endCode + idDelta; i <= e; i++) glyphIDs.push(i);
			else for (let i = 0, e = endCode - startCode; i <= e; i++) {
				p.currentPosition = idRangeOffsetPointer + idRangeOffset + i * 2;
				glyphIDs.push(p.uint16);
			}
			return {
				startCode,
				endCode,
				idDelta,
				idRangeOffset,
				glyphIDs
			};
		};
		return [...new Array(this.segCount)].map(build);
	}
	reverse(glyphID) {
		let s = this.segments.find((v) => v.glyphIDs.includes(glyphID));
		if (!s) return {};
		const code = s.startCode + s.glyphIDs.indexOf(glyphID);
		return {
			code,
			unicode: String.fromCodePoint(code)
		};
	}
	getGlyphId(charCode) {
		if (charCode.charCodeAt) charCode = charCode.charCodeAt(0);
		if (55296 <= charCode && charCode <= 57343) return 0;
		if ((charCode & 65534) === 65534 || (charCode & 65535) === 65535) return 0;
		let segment = this.segments.find((s) => s.startCode <= charCode && charCode <= s.endCode);
		if (!segment) return 0;
		return segment.glyphIDs[charCode - segment.startCode];
	}
	supports(charCode) {
		return this.getGlyphId(charCode) !== 0;
	}
	getSupportedCharCodes(preservePropNames = false) {
		if (preservePropNames) return this.segments;
		return this.segments.map((v) => ({
			start: v.startCode,
			end: v.endCode
		}));
	}
};
var Format6 = class extends Subtable {
	constructor(p, platformID, encodingID) {
		super(p, platformID, encodingID);
		this.format = 6;
		this.length = p.uint16;
		this.language = p.uint16;
		this.firstCode = p.uint16;
		this.entryCount = p.uint16;
		this.lastCode = this.firstCode + this.entryCount - 1;
		const getter = () => [...new Array(this.entryCount)].map((_) => p.uint16);
		lazy$1(this, `glyphIdArray`, getter);
	}
	supports(charCode) {
		if (charCode.charCodeAt) {
			charCode = -1;
			console.warn(`supports(character) not implemented for cmap subtable format 6. only supports(id) is implemented.`);
		}
		if (charCode < this.firstCode) return {};
		if (charCode > this.firstCode + this.entryCount) return {};
		const code = charCode - this.firstCode;
		return {
			code,
			unicode: String.fromCodePoint(code)
		};
	}
	reverse(glyphID) {
		let pos = this.glyphIdArray.indexOf(glyphID);
		if (pos > -1) return this.firstCode + pos;
	}
	getSupportedCharCodes(preservePropNames = false) {
		if (preservePropNames) return [{
			firstCode: this.firstCode,
			lastCode: this.lastCode
		}];
		return [{
			start: this.firstCode,
			end: this.lastCode
		}];
	}
};
var Format8 = class extends Subtable {
	constructor(p, platformID, encodingID) {
		super(p, platformID, encodingID);
		this.format = 8;
		p.uint16;
		this.length = p.uint32;
		this.language = p.uint32;
		this.is32 = [...new Array(8192)].map((_) => p.uint8);
		this.numGroups = p.uint32;
		const getter = () => [...new Array(this.numGroups)].map((_) => new SequentialMapGroup$1(p));
		lazy$1(this, `groups`, getter);
	}
	supports(charCode) {
		if (charCode.charCodeAt) {
			charCode = -1;
			console.warn(`supports(character) not implemented for cmap subtable format 8. only supports(id) is implemented.`);
		}
		return this.groups.findIndex((s) => s.startcharCode <= charCode && charCode <= s.endcharCode) !== -1;
	}
	reverse(glyphID) {
		console.warn(`reverse not implemented for cmap subtable format 8`);
		return {};
	}
	getSupportedCharCodes(preservePropNames = false) {
		if (preservePropNames) return this.groups;
		return this.groups.map((v) => ({
			start: v.startcharCode,
			end: v.endcharCode
		}));
	}
};
var SequentialMapGroup$1 = class {
	constructor(p) {
		this.startcharCode = p.uint32;
		this.endcharCode = p.uint32;
		this.startGlyphID = p.uint32;
	}
};
var Format10 = class extends Subtable {
	constructor(p, platformID, encodingID) {
		super(p, platformID, encodingID);
		this.format = 10;
		p.uint16;
		this.length = p.uint32;
		this.language = p.uint32;
		this.startCharCode = p.uint32;
		this.numChars = p.uint32;
		this.endCharCode = this.startCharCode + this.numChars;
		const getter = () => [...new Array(this.numChars)].map((_) => p.uint16);
		lazy$1(this, `glyphs`, getter);
	}
	supports(charCode) {
		if (charCode.charCodeAt) {
			charCode = -1;
			console.warn(`supports(character) not implemented for cmap subtable format 10. only supports(id) is implemented.`);
		}
		if (charCode < this.startCharCode) return false;
		if (charCode > this.startCharCode + this.numChars) return false;
		return charCode - this.startCharCode;
	}
	reverse(glyphID) {
		console.warn(`reverse not implemented for cmap subtable format 10`);
		return {};
	}
	getSupportedCharCodes(preservePropNames = false) {
		if (preservePropNames) return [{
			startCharCode: this.startCharCode,
			endCharCode: this.endCharCode
		}];
		return [{
			start: this.startCharCode,
			end: this.endCharCode
		}];
	}
};
var Format12 = class extends Subtable {
	constructor(p, platformID, encodingID) {
		super(p, platformID, encodingID);
		this.format = 12;
		p.uint16;
		this.length = p.uint32;
		this.language = p.uint32;
		this.numGroups = p.uint32;
		const getter = () => [...new Array(this.numGroups)].map((_) => new SequentialMapGroup(p));
		lazy$1(this, `groups`, getter);
	}
	supports(charCode) {
		if (charCode.charCodeAt) charCode = charCode.charCodeAt(0);
		if (55296 <= charCode && charCode <= 57343) return 0;
		if ((charCode & 65534) === 65534 || (charCode & 65535) === 65535) return 0;
		return this.groups.findIndex((s) => s.startCharCode <= charCode && charCode <= s.endCharCode) !== -1;
	}
	reverse(glyphID) {
		for (let group of this.groups) {
			let start = group.startGlyphID;
			if (start > glyphID) continue;
			if (start === glyphID) return group.startCharCode;
			if (start + (group.endCharCode - group.startCharCode) < glyphID) continue;
			const code = group.startCharCode + (glyphID - start);
			return {
				code,
				unicode: String.fromCodePoint(code)
			};
		}
		return {};
	}
	getSupportedCharCodes(preservePropNames = false) {
		if (preservePropNames) return this.groups;
		return this.groups.map((v) => ({
			start: v.startCharCode,
			end: v.endCharCode
		}));
	}
};
var SequentialMapGroup = class {
	constructor(p) {
		this.startCharCode = p.uint32;
		this.endCharCode = p.uint32;
		this.startGlyphID = p.uint32;
	}
};
var Format13 = class extends Subtable {
	constructor(p, platformID, encodingID) {
		super(p, platformID, encodingID);
		this.format = 13;
		p.uint16;
		this.length = p.uint32;
		this.language = p.uint32;
		this.numGroups = p.uint32;
		const getter = [...new Array(this.numGroups)].map((_) => new ConstantMapGroup(p));
		lazy$1(this, `groups`, getter);
	}
	supports(charCode) {
		if (charCode.charCodeAt) charCode = charCode.charCodeAt(0);
		return this.groups.findIndex((s) => s.startCharCode <= charCode && charCode <= s.endCharCode) !== -1;
	}
	reverse(glyphID) {
		console.warn(`reverse not implemented for cmap subtable format 13`);
		return {};
	}
	getSupportedCharCodes(preservePropNames = false) {
		if (preservePropNames) return this.groups;
		return this.groups.map((v) => ({
			start: v.startCharCode,
			end: v.endCharCode
		}));
	}
};
var ConstantMapGroup = class {
	constructor(p) {
		this.startCharCode = p.uint32;
		this.endCharCode = p.uint32;
		this.glyphID = p.uint32;
	}
};
var Format14 = class extends Subtable {
	constructor(p, platformID, encodingID) {
		super(p, platformID, encodingID);
		this.subTableStart = p.currentPosition;
		this.format = 14;
		this.length = p.uint32;
		this.numVarSelectorRecords = p.uint32;
		lazy$1(this, `varSelectors`, () => [...new Array(this.numVarSelectorRecords)].map((_) => new VariationSelector(p)));
	}
	supports() {
		console.warn(`supports not implemented for cmap subtable format 14`);
		return 0;
	}
	getSupportedCharCodes() {
		console.warn(`getSupportedCharCodes not implemented for cmap subtable format 14`);
		return [];
	}
	reverse(glyphID) {
		console.warn(`reverse not implemented for cmap subtable format 14`);
		return {};
	}
	supportsVariation(variation) {
		let v = this.varSelector.find((uvs) => uvs.varSelector === variation);
		return v ? v : false;
	}
	getSupportedVariations() {
		return this.varSelectors.map((v) => v.varSelector);
	}
};
var VariationSelector = class {
	constructor(p) {
		this.varSelector = p.uint24;
		this.defaultUVSOffset = p.Offset32;
		this.nonDefaultUVSOffset = p.Offset32;
	}
};
function createSubTable(parser, platformID, encodingID) {
	const format = parser.uint16;
	if (format === 0) return new Format0(parser, platformID, encodingID);
	if (format === 2) return new Format2(parser, platformID, encodingID);
	if (format === 4) return new Format4(parser, platformID, encodingID);
	if (format === 6) return new Format6(parser, platformID, encodingID);
	if (format === 8) return new Format8(parser, platformID, encodingID);
	if (format === 10) return new Format10(parser, platformID, encodingID);
	if (format === 12) return new Format12(parser, platformID, encodingID);
	if (format === 13) return new Format13(parser, platformID, encodingID);
	if (format === 14) return new Format14(parser, platformID, encodingID);
	return {};
}
var cmap = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.numTables = p.uint16;
		this.encodingRecords = [...new Array(this.numTables)].map((_) => new EncodingRecord(p, this.tableStart));
	}
	getSubTable(tableID) {
		return this.encodingRecords[tableID].table;
	}
	getSupportedEncodings() {
		return this.encodingRecords.map((r) => ({
			platformID: r.platformID,
			encodingId: r.encodingID
		}));
	}
	getSupportedCharCodes(platformID, encodingID) {
		const recordID = this.encodingRecords.findIndex((r) => r.platformID === platformID && r.encodingID === encodingID);
		if (recordID === -1) return false;
		return this.getSubTable(recordID).getSupportedCharCodes();
	}
	reverse(glyphid) {
		for (let i = 0; i < this.numTables; i++) {
			let code = this.getSubTable(i).reverse(glyphid);
			if (code) return code;
		}
	}
	getGlyphId(char) {
		let last = 0;
		this.encodingRecords.some((_, tableID) => {
			let t = this.getSubTable(tableID);
			if (!t.getGlyphId) return false;
			last = t.getGlyphId(char);
			return last !== 0;
		});
		return last;
	}
	supports(char) {
		return this.encodingRecords.some((_, tableID) => {
			const t = this.getSubTable(tableID);
			return t.supports && t.supports(char) !== false;
		});
	}
	supportsVariation(variation) {
		return this.encodingRecords.some((_, tableID) => {
			const t = this.getSubTable(tableID);
			return t.supportsVariation && t.supportsVariation(variation) !== false;
		});
	}
};
var EncodingRecord = class {
	constructor(p, tableStart) {
		const platformID = this.platformID = p.uint16;
		const encodingID = this.encodingID = p.uint16;
		const offset = this.offset = p.Offset32;
		lazy$1(this, `table`, () => {
			p.currentPosition = tableStart + offset;
			return createSubTable(p, platformID, encodingID);
		});
	}
};
var cmap$1 = Object.freeze({
	__proto__: null,
	cmap
});
var head = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.load({
			majorVersion: p.uint16,
			minorVersion: p.uint16,
			fontRevision: p.fixed,
			checkSumAdjustment: p.uint32,
			magicNumber: p.uint32,
			flags: p.flags(16),
			unitsPerEm: p.uint16,
			created: p.longdatetime,
			modified: p.longdatetime,
			xMin: p.int16,
			yMin: p.int16,
			xMax: p.int16,
			yMax: p.int16,
			macStyle: p.flags(16),
			lowestRecPPEM: p.uint16,
			fontDirectionHint: p.uint16,
			indexToLocFormat: p.uint16,
			glyphDataFormat: p.uint16
		});
	}
};
var head$1 = Object.freeze({
	__proto__: null,
	head
});
var hhea = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.ascender = p.fword;
		this.descender = p.fword;
		this.lineGap = p.fword;
		this.advanceWidthMax = p.ufword;
		this.minLeftSideBearing = p.fword;
		this.minRightSideBearing = p.fword;
		this.xMaxExtent = p.fword;
		this.caretSlopeRise = p.int16;
		this.caretSlopeRun = p.int16;
		this.caretOffset = p.int16;
		p.int16;
		p.int16;
		p.int16;
		p.int16;
		this.metricDataFormat = p.int16;
		this.numberOfHMetrics = p.uint16;
		p.verifyLength();
	}
};
var hhea$1 = Object.freeze({
	__proto__: null,
	hhea
});
var hmtx = class extends SimpleTable {
	constructor(dict, dataview, tables) {
		const { p } = super(dict, dataview);
		const numberOfHMetrics = tables.hhea.numberOfHMetrics;
		const numGlyphs = tables.maxp.numGlyphs;
		const metricsStart = p.currentPosition;
		lazy$1(this, `hMetrics`, () => {
			p.currentPosition = metricsStart;
			return [...new Array(numberOfHMetrics)].map((_) => new LongHorMetric(p.uint16, p.int16));
		});
		if (numberOfHMetrics < numGlyphs) {
			const lsbStart = metricsStart + numberOfHMetrics * 4;
			lazy$1(this, `leftSideBearings`, () => {
				p.currentPosition = lsbStart;
				return [...new Array(numGlyphs - numberOfHMetrics)].map((_) => p.int16);
			});
		}
	}
};
var LongHorMetric = class {
	constructor(w, b) {
		this.advanceWidth = w;
		this.lsb = b;
	}
};
var hmtx$1 = Object.freeze({
	__proto__: null,
	hmtx
});
var maxp = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.legacyFixed;
		this.numGlyphs = p.uint16;
		if (this.version === 1) {
			this.maxPoints = p.uint16;
			this.maxContours = p.uint16;
			this.maxCompositePoints = p.uint16;
			this.maxCompositeContours = p.uint16;
			this.maxZones = p.uint16;
			this.maxTwilightPoints = p.uint16;
			this.maxStorage = p.uint16;
			this.maxFunctionDefs = p.uint16;
			this.maxInstructionDefs = p.uint16;
			this.maxStackElements = p.uint16;
			this.maxSizeOfInstructions = p.uint16;
			this.maxComponentElements = p.uint16;
			this.maxComponentDepth = p.uint16;
		}
		p.verifyLength();
	}
};
var maxp$1 = Object.freeze({
	__proto__: null,
	maxp
});
var name = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.format = p.uint16;
		this.count = p.uint16;
		this.stringOffset = p.Offset16;
		this.nameRecords = [...new Array(this.count)].map((_) => new NameRecord(p, this));
		if (this.format === 1) {
			this.langTagCount = p.uint16;
			this.langTagRecords = [...new Array(this.langTagCount)].map((_) => new LangTagRecord(p.uint16, p.Offset16));
		}
		this.stringStart = this.tableStart + this.stringOffset;
	}
	get(nameID) {
		let record = this.nameRecords.find((record) => record.nameID === nameID);
		if (record) return record.string;
	}
};
var LangTagRecord = class {
	constructor(length, offset) {
		this.length = length;
		this.offset = offset;
	}
};
var NameRecord = class {
	constructor(p, nameTable) {
		this.platformID = p.uint16;
		this.encodingID = p.uint16;
		this.languageID = p.uint16;
		this.nameID = p.uint16;
		this.length = p.uint16;
		this.offset = p.Offset16;
		lazy$1(this, `string`, () => {
			p.currentPosition = nameTable.stringStart + this.offset;
			return decodeString(p, this);
		});
	}
};
function decodeString(p, record) {
	const { platformID, length } = record;
	if (length === 0) return ``;
	if (platformID === 0 || platformID === 3) {
		const str = [];
		for (let i = 0, e = length / 2; i < e; i++) str[i] = String.fromCharCode(p.uint16);
		return str.join(``);
	}
	const bytes = p.readBytes(length);
	const str = [];
	bytes.forEach(function(b, i) {
		str[i] = String.fromCharCode(b);
	});
	return str.join(``);
}
var name$1 = Object.freeze({
	__proto__: null,
	name
});
var OS2 = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.xAvgCharWidth = p.int16;
		this.usWeightClass = p.uint16;
		this.usWidthClass = p.uint16;
		this.fsType = p.uint16;
		this.ySubscriptXSize = p.int16;
		this.ySubscriptYSize = p.int16;
		this.ySubscriptXOffset = p.int16;
		this.ySubscriptYOffset = p.int16;
		this.ySuperscriptXSize = p.int16;
		this.ySuperscriptYSize = p.int16;
		this.ySuperscriptXOffset = p.int16;
		this.ySuperscriptYOffset = p.int16;
		this.yStrikeoutSize = p.int16;
		this.yStrikeoutPosition = p.int16;
		this.sFamilyClass = p.int16;
		this.panose = [...new Array(10)].map((_) => p.uint8);
		this.ulUnicodeRange1 = p.flags(32);
		this.ulUnicodeRange2 = p.flags(32);
		this.ulUnicodeRange3 = p.flags(32);
		this.ulUnicodeRange4 = p.flags(32);
		this.achVendID = p.tag;
		this.fsSelection = p.uint16;
		this.usFirstCharIndex = p.uint16;
		this.usLastCharIndex = p.uint16;
		this.sTypoAscender = p.int16;
		this.sTypoDescender = p.int16;
		this.sTypoLineGap = p.int16;
		this.usWinAscent = p.uint16;
		this.usWinDescent = p.uint16;
		if (this.version === 0) return p.verifyLength();
		this.ulCodePageRange1 = p.flags(32);
		this.ulCodePageRange2 = p.flags(32);
		if (this.version === 1) return p.verifyLength();
		this.sxHeight = p.int16;
		this.sCapHeight = p.int16;
		this.usDefaultChar = p.uint16;
		this.usBreakChar = p.uint16;
		this.usMaxContext = p.uint16;
		if (this.version <= 4) return p.verifyLength();
		this.usLowerOpticalPointSize = p.uint16;
		this.usUpperOpticalPointSize = p.uint16;
		if (this.version === 5) return p.verifyLength();
	}
};
var OS2$1 = Object.freeze({
	__proto__: null,
	OS2
});
var post = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.legacyFixed;
		this.italicAngle = p.fixed;
		this.underlinePosition = p.fword;
		this.underlineThickness = p.fword;
		this.isFixedPitch = p.uint32;
		this.minMemType42 = p.uint32;
		this.maxMemType42 = p.uint32;
		this.minMemType1 = p.uint32;
		this.maxMemType1 = p.uint32;
		if (this.version === 1 || this.version === 3) return p.verifyLength();
		this.numGlyphs = p.uint16;
		if (this.version === 2) {
			this.glyphNameIndex = [...new Array(this.numGlyphs)].map((_) => p.uint16);
			this.namesOffset = p.currentPosition;
			this.glyphNameOffsets = [1];
			for (let i = 0; i < this.numGlyphs; i++) {
				if (this.glyphNameIndex[i] < macStrings.length) {
					this.glyphNameOffsets.push(this.glyphNameOffsets[i]);
					continue;
				}
				let bytelength = p.int8;
				p.skip(bytelength);
				this.glyphNameOffsets.push(this.glyphNameOffsets[i] + bytelength + 1);
			}
		}
		if (this.version === 2.5) this.offset = [...new Array(this.numGlyphs)].map((_) => p.int8);
	}
	getGlyphName(glyphid) {
		if (this.version !== 2) {
			console.warn(`post table version ${this.version} does not support glyph name lookups`);
			return ``;
		}
		let index = this.glyphNameIndex[glyphid];
		if (index < 258) return macStrings[index];
		let offset = this.glyphNameOffsets[glyphid];
		let len = this.glyphNameOffsets[glyphid + 1] - offset - 1;
		if (len === 0) return `.notdef.`;
		this.parser.currentPosition = this.namesOffset + offset;
		return this.parser.readBytes(len, this.namesOffset + offset, 8, true).map((b) => String.fromCharCode(b)).join(``);
	}
};
const macStrings = [
	`.notdef`,
	`.null`,
	`nonmarkingreturn`,
	`space`,
	`exclam`,
	`quotedbl`,
	`numbersign`,
	`dollar`,
	`percent`,
	`ampersand`,
	`quotesingle`,
	`parenleft`,
	`parenright`,
	`asterisk`,
	`plus`,
	`comma`,
	`hyphen`,
	`period`,
	`slash`,
	`zero`,
	`one`,
	`two`,
	`three`,
	`four`,
	`five`,
	`six`,
	`seven`,
	`eight`,
	`nine`,
	`colon`,
	`semicolon`,
	`less`,
	`equal`,
	`greater`,
	`question`,
	`at`,
	`A`,
	`B`,
	`C`,
	`D`,
	`E`,
	`F`,
	`G`,
	`H`,
	`I`,
	`J`,
	`K`,
	`L`,
	`M`,
	`N`,
	`O`,
	`P`,
	`Q`,
	`R`,
	`S`,
	`T`,
	`U`,
	`V`,
	`W`,
	`X`,
	`Y`,
	`Z`,
	`bracketleft`,
	`backslash`,
	`bracketright`,
	`asciicircum`,
	`underscore`,
	`grave`,
	`a`,
	`b`,
	`c`,
	`d`,
	`e`,
	`f`,
	`g`,
	`h`,
	`i`,
	`j`,
	`k`,
	`l`,
	`m`,
	`n`,
	`o`,
	`p`,
	`q`,
	`r`,
	`s`,
	`t`,
	`u`,
	`v`,
	`w`,
	`x`,
	`y`,
	`z`,
	`braceleft`,
	`bar`,
	`braceright`,
	`asciitilde`,
	`Adieresis`,
	`Aring`,
	`Ccedilla`,
	`Eacute`,
	`Ntilde`,
	`Odieresis`,
	`Udieresis`,
	`aacute`,
	`agrave`,
	`acircumflex`,
	`adieresis`,
	`atilde`,
	`aring`,
	`ccedilla`,
	`eacute`,
	`egrave`,
	`ecircumflex`,
	`edieresis`,
	`iacute`,
	`igrave`,
	`icircumflex`,
	`idieresis`,
	`ntilde`,
	`oacute`,
	`ograve`,
	`ocircumflex`,
	`odieresis`,
	`otilde`,
	`uacute`,
	`ugrave`,
	`ucircumflex`,
	`udieresis`,
	`dagger`,
	`degree`,
	`cent`,
	`sterling`,
	`section`,
	`bullet`,
	`paragraph`,
	`germandbls`,
	`registered`,
	`copyright`,
	`trademark`,
	`acute`,
	`dieresis`,
	`notequal`,
	`AE`,
	`Oslash`,
	`infinity`,
	`plusminus`,
	`lessequal`,
	`greaterequal`,
	`yen`,
	`mu`,
	`partialdiff`,
	`summation`,
	`product`,
	`pi`,
	`integral`,
	`ordfeminine`,
	`ordmasculine`,
	`Omega`,
	`ae`,
	`oslash`,
	`questiondown`,
	`exclamdown`,
	`logicalnot`,
	`radical`,
	`florin`,
	`approxequal`,
	`Delta`,
	`guillemotleft`,
	`guillemotright`,
	`ellipsis`,
	`nonbreakingspace`,
	`Agrave`,
	`Atilde`,
	`Otilde`,
	`OE`,
	`oe`,
	`endash`,
	`emdash`,
	`quotedblleft`,
	`quotedblright`,
	`quoteleft`,
	`quoteright`,
	`divide`,
	`lozenge`,
	`ydieresis`,
	`Ydieresis`,
	`fraction`,
	`currency`,
	`guilsinglleft`,
	`guilsinglright`,
	`fi`,
	`fl`,
	`daggerdbl`,
	`periodcentered`,
	`quotesinglbase`,
	`quotedblbase`,
	`perthousand`,
	`Acircumflex`,
	`Ecircumflex`,
	`Aacute`,
	`Edieresis`,
	`Egrave`,
	`Iacute`,
	`Icircumflex`,
	`Idieresis`,
	`Igrave`,
	`Oacute`,
	`Ocircumflex`,
	`apple`,
	`Ograve`,
	`Uacute`,
	`Ucircumflex`,
	`Ugrave`,
	`dotlessi`,
	`circumflex`,
	`tilde`,
	`macron`,
	`breve`,
	`dotaccent`,
	`ring`,
	`cedilla`,
	`hungarumlaut`,
	`ogonek`,
	`caron`,
	`Lslash`,
	`lslash`,
	`Scaron`,
	`scaron`,
	`Zcaron`,
	`zcaron`,
	`brokenbar`,
	`Eth`,
	`eth`,
	`Yacute`,
	`yacute`,
	`Thorn`,
	`thorn`,
	`minus`,
	`multiply`,
	`onesuperior`,
	`twosuperior`,
	`threesuperior`,
	`onehalf`,
	`onequarter`,
	`threequarters`,
	`franc`,
	`Gbreve`,
	`gbreve`,
	`Idotaccent`,
	`Scedilla`,
	`scedilla`,
	`Cacute`,
	`cacute`,
	`Ccaron`,
	`ccaron`,
	`dcroat`
];
var post$1 = Object.freeze({
	__proto__: null,
	post
});
var BASE = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.horizAxisOffset = p.Offset16;
		this.vertAxisOffset = p.Offset16;
		lazy$1(this, `horizAxis`, () => new AxisTable({ offset: dict.offset + this.horizAxisOffset }, dataview));
		lazy$1(this, `vertAxis`, () => new AxisTable({ offset: dict.offset + this.vertAxisOffset }, dataview));
		if (this.majorVersion === 1 && this.minorVersion === 1) {
			this.itemVarStoreOffset = p.Offset32;
			lazy$1(this, `itemVarStore`, () => new AxisTable({ offset: dict.offset + this.itemVarStoreOffset }, dataview));
		}
	}
};
var AxisTable = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview, `AxisTable`);
		this.baseTagListOffset = p.Offset16;
		this.baseScriptListOffset = p.Offset16;
		lazy$1(this, `baseTagList`, () => new BaseTagListTable({ offset: dict.offset + this.baseTagListOffset }, dataview));
		lazy$1(this, `baseScriptList`, () => new BaseScriptListTable({ offset: dict.offset + this.baseScriptListOffset }, dataview));
	}
};
var BaseTagListTable = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview, `BaseTagListTable`);
		this.baseTagCount = p.uint16;
		this.baselineTags = [...new Array(this.baseTagCount)].map((_) => p.tag);
	}
};
var BaseScriptListTable = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview, `BaseScriptListTable`);
		this.baseScriptCount = p.uint16;
		const recordStart = p.currentPosition;
		lazy$1(this, `baseScriptRecords`, () => {
			p.currentPosition = recordStart;
			return [...new Array(this.baseScriptCount)].map((_) => new BaseScriptRecord(this.start, p));
		});
	}
};
var BaseScriptRecord = class {
	constructor(baseScriptListTableStart, p) {
		this.baseScriptTag = p.tag;
		this.baseScriptOffset = p.Offset16;
		lazy$1(this, `baseScriptTable`, () => {
			p.currentPosition = baseScriptListTableStart + this.baseScriptOffset;
			return new BaseScriptTable(p);
		});
	}
};
var BaseScriptTable = class {
	constructor(p) {
		this.start = p.currentPosition;
		this.baseValuesOffset = p.Offset16;
		this.defaultMinMaxOffset = p.Offset16;
		this.baseLangSysCount = p.uint16;
		this.baseLangSysRecords = [...new Array(this.baseLangSysCount)].map((_) => new BaseLangSysRecord(this.start, p));
		lazy$1(this, `baseValues`, () => {
			p.currentPosition = this.start + this.baseValuesOffset;
			return new BaseValuesTable(p);
		});
		lazy$1(this, `defaultMinMax`, () => {
			p.currentPosition = this.start + this.defaultMinMaxOffset;
			return new MinMaxTable(p);
		});
	}
};
var BaseLangSysRecord = class {
	constructor(baseScriptTableStart, p) {
		this.baseLangSysTag = p.tag;
		this.minMaxOffset = p.Offset16;
		lazy$1(this, `minMax`, () => {
			p.currentPosition = baseScriptTableStart + this.minMaxOffset;
			return new MinMaxTable(p);
		});
	}
};
var BaseValuesTable = class {
	constructor(p) {
		this.parser = p;
		this.start = p.currentPosition;
		this.defaultBaselineIndex = p.uint16;
		this.baseCoordCount = p.uint16;
		this.baseCoords = [...new Array(this.baseCoordCount)].map((_) => p.Offset16);
	}
	getTable(id) {
		this.parser.currentPosition = this.start + this.baseCoords[id];
		return new BaseCoordTable(this.parser);
	}
};
var MinMaxTable = class {
	constructor(p) {
		this.minCoord = p.Offset16;
		this.maxCoord = p.Offset16;
		this.featMinMaxCount = p.uint16;
		const recordStart = p.currentPosition;
		lazy$1(this, `featMinMaxRecords`, () => {
			p.currentPosition = recordStart;
			return [...new Array(this.featMinMaxCount)].map((_) => new FeatMinMaxRecord(p));
		});
	}
};
var FeatMinMaxRecord = class {
	constructor(p) {
		this.featureTableTag = p.tag;
		this.minCoord = p.Offset16;
		this.maxCoord = p.Offset16;
	}
};
var BaseCoordTable = class {
	constructor(p) {
		this.baseCoordFormat = p.uint16;
		this.coordinate = p.int16;
		if (this.baseCoordFormat === 2) {
			this.referenceGlyph = p.uint16;
			this.baseCoordPoint = p.uint16;
		}
		if (this.baseCoordFormat === 3) this.deviceTable = p.Offset16;
	}
};
var BASE$1 = Object.freeze({
	__proto__: null,
	BASE
});
var ClassDefinition = class {
	constructor(p) {
		this.classFormat = p.uint16;
		if (this.classFormat === 1) {
			this.startGlyphID = p.uint16;
			this.glyphCount = p.uint16;
			this.classValueArray = [...new Array(this.glyphCount)].map((_) => p.uint16);
		}
		if (this.classFormat === 2) {
			this.classRangeCount = p.uint16;
			this.classRangeRecords = [...new Array(this.classRangeCount)].map((_) => new ClassRangeRecord(p));
		}
	}
};
var ClassRangeRecord = class {
	constructor(p) {
		this.startGlyphID = p.uint16;
		this.endGlyphID = p.uint16;
		this.class = p.uint16;
	}
};
var CoverageTable = class extends ParsedData {
	constructor(p) {
		super(p);
		this.coverageFormat = p.uint16;
		if (this.coverageFormat === 1) {
			this.glyphCount = p.uint16;
			this.glyphArray = [...new Array(this.glyphCount)].map((_) => p.uint16);
		}
		if (this.coverageFormat === 2) {
			this.rangeCount = p.uint16;
			this.rangeRecords = [...new Array(this.rangeCount)].map((_) => new CoverageRangeRecord(p));
		}
	}
};
var CoverageRangeRecord = class {
	constructor(p) {
		this.startGlyphID = p.uint16;
		this.endGlyphID = p.uint16;
		this.startCoverageIndex = p.uint16;
	}
};
var ItemVariationStoreTable = class {
	constructor(table, p) {
		this.table = table;
		this.parser = p;
		this.start = p.currentPosition;
		this.format = p.uint16;
		this.variationRegionListOffset = p.Offset32;
		this.itemVariationDataCount = p.uint16;
		this.itemVariationDataOffsets = [...new Array(this.itemVariationDataCount)].map((_) => p.Offset32);
	}
};
var GDEF = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.glyphClassDefOffset = p.Offset16;
		lazy$1(this, `glyphClassDefs`, () => {
			if (this.glyphClassDefOffset === 0) return void 0;
			p.currentPosition = this.tableStart + this.glyphClassDefOffset;
			return new ClassDefinition(p);
		});
		this.attachListOffset = p.Offset16;
		lazy$1(this, `attachList`, () => {
			if (this.attachListOffset === 0) return void 0;
			p.currentPosition = this.tableStart + this.attachListOffset;
			return new AttachList(p);
		});
		this.ligCaretListOffset = p.Offset16;
		lazy$1(this, `ligCaretList`, () => {
			if (this.ligCaretListOffset === 0) return void 0;
			p.currentPosition = this.tableStart + this.ligCaretListOffset;
			return new LigCaretList(p);
		});
		this.markAttachClassDefOffset = p.Offset16;
		lazy$1(this, `markAttachClassDef`, () => {
			if (this.markAttachClassDefOffset === 0) return void 0;
			p.currentPosition = this.tableStart + this.markAttachClassDefOffset;
			return new ClassDefinition(p);
		});
		if (this.minorVersion >= 2) {
			this.markGlyphSetsDefOffset = p.Offset16;
			lazy$1(this, `markGlyphSetsDef`, () => {
				if (this.markGlyphSetsDefOffset === 0) return void 0;
				p.currentPosition = this.tableStart + this.markGlyphSetsDefOffset;
				return new MarkGlyphSetsTable(p);
			});
		}
		if (this.minorVersion === 3) {
			this.itemVarStoreOffset = p.Offset32;
			lazy$1(this, `itemVarStore`, () => {
				if (this.itemVarStoreOffset === 0) return void 0;
				p.currentPosition = this.tableStart + this.itemVarStoreOffset;
				return new ItemVariationStoreTable(p);
			});
		}
	}
};
var AttachList = class extends ParsedData {
	constructor(p) {
		super(p);
		this.coverageOffset = p.Offset16;
		this.glyphCount = p.uint16;
		this.attachPointOffsets = [...new Array(this.glyphCount)].map((_) => p.Offset16);
	}
	getPoint(pointID) {
		this.parser.currentPosition = this.start + this.attachPointOffsets[pointID];
		return new AttachPoint(this.parser);
	}
};
var AttachPoint = class {
	constructor(p) {
		this.pointCount = p.uint16;
		this.pointIndices = [...new Array(this.pointCount)].map((_) => p.uint16);
	}
};
var LigCaretList = class extends ParsedData {
	constructor(p) {
		super(p);
		this.coverageOffset = p.Offset16;
		lazy$1(this, `coverage`, () => {
			p.currentPosition = this.start + this.coverageOffset;
			return new CoverageTable(p);
		});
		this.ligGlyphCount = p.uint16;
		this.ligGlyphOffsets = [...new Array(this.ligGlyphCount)].map((_) => p.Offset16);
	}
	getLigGlyph(ligGlyphID) {
		this.parser.currentPosition = this.start + this.ligGlyphOffsets[ligGlyphID];
		return new LigGlyph(this.parser);
	}
};
var LigGlyph = class extends ParsedData {
	constructor(p) {
		super(p);
		this.caretCount = p.uint16;
		this.caretValueOffsets = [...new Array(this.caretCount)].map((_) => p.Offset16);
	}
	getCaretValue(caretID) {
		this.parser.currentPosition = this.start + this.caretValueOffsets[caretID];
		return new CaretValue(this.parser);
	}
};
var CaretValue = class {
	constructor(p) {
		this.caretValueFormat = p.uint16;
		if (this.caretValueFormat === 1) this.coordinate = p.int16;
		if (this.caretValueFormat === 2) this.caretValuePointIndex = p.uint16;
		if (this.caretValueFormat === 3) {
			this.coordinate = p.int16;
			this.deviceOffset = p.Offset16;
		}
	}
};
var MarkGlyphSetsTable = class extends ParsedData {
	constructor(p) {
		super(p);
		this.markGlyphSetTableFormat = p.uint16;
		this.markGlyphSetCount = p.uint16;
		this.coverageOffsets = [...new Array(this.markGlyphSetCount)].map((_) => p.Offset32);
	}
	getMarkGlyphSet(markGlyphSetID) {
		this.parser.currentPosition = this.start + this.coverageOffsets[markGlyphSetID];
		return new CoverageTable(this.parser);
	}
};
var GDEF$1 = Object.freeze({
	__proto__: null,
	GDEF
});
var ScriptList = class extends ParsedData {
	static EMPTY = {
		scriptCount: 0,
		scriptRecords: []
	};
	constructor(p) {
		super(p);
		this.scriptCount = p.uint16;
		this.scriptRecords = [...new Array(this.scriptCount)].map((_) => new ScriptRecord(p));
	}
};
var ScriptRecord = class {
	constructor(p) {
		this.scriptTag = p.tag;
		this.scriptOffset = p.Offset16;
	}
};
var ScriptTable = class extends ParsedData {
	constructor(p) {
		super(p);
		this.defaultLangSys = p.Offset16;
		this.langSysCount = p.uint16;
		this.langSysRecords = [...new Array(this.langSysCount)].map((_) => new LangSysRecord(p));
	}
};
var LangSysRecord = class {
	constructor(p) {
		this.langSysTag = p.tag;
		this.langSysOffset = p.Offset16;
	}
};
var LangSysTable = class {
	constructor(p) {
		this.lookupOrder = p.Offset16;
		this.requiredFeatureIndex = p.uint16;
		this.featureIndexCount = p.uint16;
		this.featureIndices = [...new Array(this.featureIndexCount)].map((_) => p.uint16);
	}
};
var FeatureList = class extends ParsedData {
	static EMPTY = {
		featureCount: 0,
		featureRecords: []
	};
	constructor(p) {
		super(p);
		this.featureCount = p.uint16;
		this.featureRecords = [...new Array(this.featureCount)].map((_) => new FeatureRecord(p));
	}
};
var FeatureRecord = class {
	constructor(p) {
		this.featureTag = p.tag;
		this.featureOffset = p.Offset16;
	}
};
var FeatureTable = class extends ParsedData {
	constructor(p) {
		super(p);
		this.featureParams = p.Offset16;
		this.lookupIndexCount = p.uint16;
		this.lookupListIndices = [...new Array(this.lookupIndexCount)].map((_) => p.uint16);
	}
	getFeatureParams() {
		if (this.featureParams > 0) {
			const p = this.parser;
			p.currentPosition = this.start + this.featureParams;
			const tag = this.featureTag;
			if (tag === `size`) return new Size(p);
			if (tag.startsWith(`cc`)) return new CharacterVariant(p);
			if (tag.startsWith(`ss`)) return new StylisticSet(p);
		}
	}
};
var CharacterVariant = class {
	constructor(p) {
		this.format = p.uint16;
		this.featUiLabelNameId = p.uint16;
		this.featUiTooltipTextNameId = p.uint16;
		this.sampleTextNameId = p.uint16;
		this.numNamedParameters = p.uint16;
		this.firstParamUiLabelNameId = p.uint16;
		this.charCount = p.uint16;
		this.character = [...new Array(this.charCount)].map((_) => p.uint24);
	}
};
var Size = class {
	constructor(p) {
		this.designSize = p.uint16;
		this.subfamilyIdentifier = p.uint16;
		this.subfamilyNameID = p.uint16;
		this.smallEnd = p.uint16;
		this.largeEnd = p.uint16;
	}
};
var StylisticSet = class {
	constructor(p) {
		this.version = p.uint16;
		this.UINameID = p.uint16;
	}
};
function undoCoverageOffsetParsing(instance) {
	instance.parser.currentPosition -= 2;
	delete instance.coverageOffset;
	delete instance.getCoverageTable;
}
var LookupType$1 = class extends ParsedData {
	constructor(p) {
		super(p);
		this.substFormat = p.uint16;
		this.coverageOffset = p.Offset16;
	}
	getCoverageTable() {
		let p = this.parser;
		p.currentPosition = this.start + this.coverageOffset;
		return new CoverageTable(p);
	}
};
var SubstLookupRecord = class {
	constructor(p) {
		this.glyphSequenceIndex = p.uint16;
		this.lookupListIndex = p.uint16;
	}
};
var LookupType1$1 = class extends LookupType$1 {
	constructor(p) {
		super(p);
		this.deltaGlyphID = p.int16;
	}
};
var LookupType2$1 = class extends LookupType$1 {
	constructor(p) {
		super(p);
		this.sequenceCount = p.uint16;
		this.sequenceOffsets = [...new Array(this.sequenceCount)].map((_) => p.Offset16);
	}
	getSequence(index) {
		let p = this.parser;
		p.currentPosition = this.start + this.sequenceOffsets[index];
		return new SequenceTable(p);
	}
};
var SequenceTable = class {
	constructor(p) {
		this.glyphCount = p.uint16;
		this.substituteGlyphIDs = [...new Array(this.glyphCount)].map((_) => p.uint16);
	}
};
var LookupType3$1 = class extends LookupType$1 {
	constructor(p) {
		super(p);
		this.alternateSetCount = p.uint16;
		this.alternateSetOffsets = [...new Array(this.alternateSetCount)].map((_) => p.Offset16);
	}
	getAlternateSet(index) {
		let p = this.parser;
		p.currentPosition = this.start + this.alternateSetOffsets[index];
		return new AlternateSetTable(p);
	}
};
var AlternateSetTable = class {
	constructor(p) {
		this.glyphCount = p.uint16;
		this.alternateGlyphIDs = [...new Array(this.glyphCount)].map((_) => p.uint16);
	}
};
var LookupType4$1 = class extends LookupType$1 {
	constructor(p) {
		super(p);
		this.ligatureSetCount = p.uint16;
		this.ligatureSetOffsets = [...new Array(this.ligatureSetCount)].map((_) => p.Offset16);
	}
	getLigatureSet(index) {
		let p = this.parser;
		p.currentPosition = this.start + this.ligatureSetOffsets[index];
		return new LigatureSetTable(p);
	}
};
var LigatureSetTable = class extends ParsedData {
	constructor(p) {
		super(p);
		this.ligatureCount = p.uint16;
		this.ligatureOffsets = [...new Array(this.ligatureCount)].map((_) => p.Offset16);
	}
	getLigature(index) {
		let p = this.parser;
		p.currentPosition = this.start + this.ligatureOffsets[index];
		return new LigatureTable(p);
	}
};
var LigatureTable = class {
	constructor(p) {
		this.ligatureGlyph = p.uint16;
		this.componentCount = p.uint16;
		this.componentGlyphIDs = [...new Array(this.componentCount - 1)].map((_) => p.uint16);
	}
};
var LookupType5$1 = class extends LookupType$1 {
	constructor(p) {
		super(p);
		if (this.substFormat === 1) {
			this.subRuleSetCount = p.uint16;
			this.subRuleSetOffsets = [...new Array(this.subRuleSetCount)].map((_) => p.Offset16);
		}
		if (this.substFormat === 2) {
			this.classDefOffset = p.Offset16;
			this.subClassSetCount = p.uint16;
			this.subClassSetOffsets = [...new Array(this.subClassSetCount)].map((_) => p.Offset16);
		}
		if (this.substFormat === 3) {
			undoCoverageOffsetParsing(this);
			this.glyphCount = p.uint16;
			this.substitutionCount = p.uint16;
			this.coverageOffsets = [...new Array(this.glyphCount)].map((_) => p.Offset16);
			this.substLookupRecords = [...new Array(this.substitutionCount)].map((_) => new SubstLookupRecord(p));
		}
	}
	getSubRuleSet(index) {
		if (this.substFormat !== 1) throw new Error(`lookup type 5.${this.substFormat} has no subrule sets.`);
		let p = this.parser;
		p.currentPosition = this.start + this.subRuleSetOffsets[index];
		return new SubRuleSetTable(p);
	}
	getSubClassSet(index) {
		if (this.substFormat !== 2) throw new Error(`lookup type 5.${this.substFormat} has no subclass sets.`);
		let p = this.parser;
		p.currentPosition = this.start + this.subClassSetOffsets[index];
		return new SubClassSetTable(p);
	}
	getCoverageTable(index) {
		if (this.substFormat !== 3 && !index) return super.getCoverageTable();
		if (!index) throw new Error(`lookup type 5.${this.substFormat} requires an coverage table index.`);
		let p = this.parser;
		p.currentPosition = this.start + this.coverageOffsets[index];
		return new CoverageTable(p);
	}
};
var SubRuleSetTable = class extends ParsedData {
	constructor(p) {
		super(p);
		this.subRuleCount = p.uint16;
		this.subRuleOffsets = [...new Array(this.subRuleCount)].map((_) => p.Offset16);
	}
	getSubRule(index) {
		let p = this.parser;
		p.currentPosition = this.start + this.subRuleOffsets[index];
		return new SubRuleTable(p);
	}
};
var SubRuleTable = class {
	constructor(p) {
		this.glyphCount = p.uint16;
		this.substitutionCount = p.uint16;
		this.inputSequence = [...new Array(this.glyphCount - 1)].map((_) => p.uint16);
		this.substLookupRecords = [...new Array(this.substitutionCount)].map((_) => new SubstLookupRecord(p));
	}
};
var SubClassSetTable = class extends ParsedData {
	constructor(p) {
		super(p);
		this.subClassRuleCount = p.uint16;
		this.subClassRuleOffsets = [...new Array(this.subClassRuleCount)].map((_) => p.Offset16);
	}
	getSubClass(index) {
		let p = this.parser;
		p.currentPosition = this.start + this.subClassRuleOffsets[index];
		return new SubClassRuleTable(p);
	}
};
var SubClassRuleTable = class extends SubRuleTable {
	constructor(p) {
		super(p);
	}
};
var LookupType6$1 = class extends LookupType$1 {
	constructor(p) {
		super(p);
		if (this.substFormat === 1) {
			this.chainSubRuleSetCount = p.uint16;
			this.chainSubRuleSetOffsets = [...new Array(this.chainSubRuleSetCount)].map((_) => p.Offset16);
		}
		if (this.substFormat === 2) {
			this.backtrackClassDefOffset = p.Offset16;
			this.inputClassDefOffset = p.Offset16;
			this.lookaheadClassDefOffset = p.Offset16;
			this.chainSubClassSetCount = p.uint16;
			this.chainSubClassSetOffsets = [...new Array(this.chainSubClassSetCount)].map((_) => p.Offset16);
		}
		if (this.substFormat === 3) {
			undoCoverageOffsetParsing(this);
			this.backtrackGlyphCount = p.uint16;
			this.backtrackCoverageOffsets = [...new Array(this.backtrackGlyphCount)].map((_) => p.Offset16);
			this.inputGlyphCount = p.uint16;
			this.inputCoverageOffsets = [...new Array(this.inputGlyphCount)].map((_) => p.Offset16);
			this.lookaheadGlyphCount = p.uint16;
			this.lookaheadCoverageOffsets = [...new Array(this.lookaheadGlyphCount)].map((_) => p.Offset16);
			this.seqLookupCount = p.uint16;
			this.seqLookupRecords = [...new Array(this.substitutionCount)].map((_) => new SequenceLookupRecord(p));
		}
	}
	getChainSubRuleSet(index) {
		if (this.substFormat !== 1) throw new Error(`lookup type 6.${this.substFormat} has no chainsubrule sets.`);
		let p = this.parser;
		p.currentPosition = this.start + this.chainSubRuleSetOffsets[index];
		return new ChainSubRuleSetTable(p);
	}
	getChainSubClassSet(index) {
		if (this.substFormat !== 2) throw new Error(`lookup type 6.${this.substFormat} has no chainsubclass sets.`);
		let p = this.parser;
		p.currentPosition = this.start + this.chainSubClassSetOffsets[index];
		return new ChainSubClassSetTable(p);
	}
	getCoverageFromOffset(offset) {
		if (this.substFormat !== 3) throw new Error(`lookup type 6.${this.substFormat} does not use contextual coverage offsets.`);
		let p = this.parser;
		p.currentPosition = this.start + offset;
		return new CoverageTable(p);
	}
};
var ChainSubRuleSetTable = class extends ParsedData {
	constructor(p) {
		super(p);
		this.chainSubRuleCount = p.uint16;
		this.chainSubRuleOffsets = [...new Array(this.chainSubRuleCount)].map((_) => p.Offset16);
	}
	getSubRule(index) {
		let p = this.parser;
		p.currentPosition = this.start + this.chainSubRuleOffsets[index];
		return new ChainSubRuleTable(p);
	}
};
var ChainSubRuleTable = class {
	constructor(p) {
		this.backtrackGlyphCount = p.uint16;
		this.backtrackSequence = [...new Array(this.backtrackGlyphCount)].map((_) => p.uint16);
		this.inputGlyphCount = p.uint16;
		this.inputSequence = [...new Array(this.inputGlyphCount - 1)].map((_) => p.uint16);
		this.lookaheadGlyphCount = p.uint16;
		this.lookAheadSequence = [...new Array(this.lookAheadGlyphCount)].map((_) => p.uint16);
		this.substitutionCount = p.uint16;
		this.substLookupRecords = [...new Array(this.SubstCount)].map((_) => new SubstLookupRecord(p));
	}
};
var ChainSubClassSetTable = class extends ParsedData {
	constructor(p) {
		super(p);
		this.chainSubClassRuleCount = p.uint16;
		this.chainSubClassRuleOffsets = [...new Array(this.chainSubClassRuleCount)].map((_) => p.Offset16);
	}
	getSubClass(index) {
		let p = this.parser;
		p.currentPosition = this.start + this.chainSubRuleOffsets[index];
		return new ChainSubClassRuleTable(p);
	}
};
var ChainSubClassRuleTable = class {
	constructor(p) {
		this.backtrackGlyphCount = p.uint16;
		this.backtrackSequence = [...new Array(this.backtrackGlyphCount)].map((_) => p.uint16);
		this.inputGlyphCount = p.uint16;
		this.inputSequence = [...new Array(this.inputGlyphCount - 1)].map((_) => p.uint16);
		this.lookaheadGlyphCount = p.uint16;
		this.lookAheadSequence = [...new Array(this.lookAheadGlyphCount)].map((_) => p.uint16);
		this.substitutionCount = p.uint16;
		this.substLookupRecords = [...new Array(this.substitutionCount)].map((_) => new SequenceLookupRecord(p));
	}
};
var SequenceLookupRecord = class extends ParsedData {
	constructor(p) {
		super(p);
		this.sequenceIndex = p.uint16;
		this.lookupListIndex = p.uint16;
	}
};
var LookupType7$1 = class extends ParsedData {
	constructor(p) {
		super(p);
		this.substFormat = p.uint16;
		this.extensionLookupType = p.uint16;
		this.extensionOffset = p.Offset32;
	}
};
var LookupType8$1 = class extends LookupType$1 {
	constructor(p) {
		super(p);
		this.backtrackGlyphCount = p.uint16;
		this.backtrackCoverageOffsets = [...new Array(this.backtrackGlyphCount)].map((_) => p.Offset16);
		this.lookaheadGlyphCount = p.uint16;
		this.lookaheadCoverageOffsets = [new Array(this.lookaheadGlyphCount)].map((_) => p.Offset16);
		this.glyphCount = p.uint16;
		this.substituteGlyphIDs = [...new Array(this.glyphCount)].map((_) => p.uint16);
	}
};
var GSUBtables = { buildSubtable: function(type, p) {
	const subtable = new [
		void 0,
		LookupType1$1,
		LookupType2$1,
		LookupType3$1,
		LookupType4$1,
		LookupType5$1,
		LookupType6$1,
		LookupType7$1,
		LookupType8$1
	][type](p);
	subtable.type = type;
	return subtable;
} };
var LookupType = class extends ParsedData {
	constructor(p) {
		super(p);
	}
};
var LookupType1 = class extends LookupType {
	constructor(p) {
		super(p);
		console.log(`lookup type 1`);
	}
};
var LookupType2 = class extends LookupType {
	constructor(p) {
		super(p);
		console.log(`lookup type 2`);
	}
};
var LookupType3 = class extends LookupType {
	constructor(p) {
		super(p);
		console.log(`lookup type 3`);
	}
};
var LookupType4 = class extends LookupType {
	constructor(p) {
		super(p);
		console.log(`lookup type 4`);
	}
};
var LookupType5 = class extends LookupType {
	constructor(p) {
		super(p);
		console.log(`lookup type 5`);
	}
};
var LookupType6 = class extends LookupType {
	constructor(p) {
		super(p);
		console.log(`lookup type 6`);
	}
};
var LookupType7 = class extends LookupType {
	constructor(p) {
		super(p);
		console.log(`lookup type 7`);
	}
};
var LookupType8 = class extends LookupType {
	constructor(p) {
		super(p);
		console.log(`lookup type 8`);
	}
};
var LookupType9 = class extends LookupType {
	constructor(p) {
		super(p);
		console.log(`lookup type 9`);
	}
};
var GPOStables = { buildSubtable: function(type, p) {
	const subtable = new [
		void 0,
		LookupType1,
		LookupType2,
		LookupType3,
		LookupType4,
		LookupType5,
		LookupType6,
		LookupType7,
		LookupType8,
		LookupType9
	][type](p);
	subtable.type = type;
	return subtable;
} };
var LookupList = class extends ParsedData {
	static EMPTY = {
		lookupCount: 0,
		lookups: []
	};
	constructor(p) {
		super(p);
		this.lookupCount = p.uint16;
		this.lookups = [...new Array(this.lookupCount)].map((_) => p.Offset16);
	}
};
var LookupTable = class extends ParsedData {
	constructor(p, type) {
		super(p);
		this.ctType = type;
		this.lookupType = p.uint16;
		this.lookupFlag = p.uint16;
		this.subTableCount = p.uint16;
		this.subtableOffsets = [...new Array(this.subTableCount)].map((_) => p.Offset16);
		this.markFilteringSet = p.uint16;
	}
	get rightToLeft() {
		return this.lookupFlag & true;
	}
	get ignoreBaseGlyphs() {
		return this.lookupFlag & true;
	}
	get ignoreLigatures() {
		return this.lookupFlag & true;
	}
	get ignoreMarks() {
		return this.lookupFlag & true;
	}
	get useMarkFilteringSet() {
		return this.lookupFlag & true;
	}
	get markAttachmentType() {
		return this.lookupFlag & true;
	}
	getSubTable(index) {
		const builder = this.ctType === `GSUB` ? GSUBtables : GPOStables;
		this.parser.currentPosition = this.start + this.subtableOffsets[index];
		return builder.buildSubtable(this.lookupType, this.parser);
	}
};
var CommonLayoutTable = class extends SimpleTable {
	constructor(dict, dataview, name) {
		const { p, tableStart } = super(dict, dataview, name);
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.scriptListOffset = p.Offset16;
		this.featureListOffset = p.Offset16;
		this.lookupListOffset = p.Offset16;
		if (this.majorVersion === 1 && this.minorVersion === 1) this.featureVariationsOffset = p.Offset32;
		const no_content = !(this.scriptListOffset || this.featureListOffset || this.lookupListOffset);
		lazy$1(this, `scriptList`, () => {
			if (no_content) return ScriptList.EMPTY;
			p.currentPosition = tableStart + this.scriptListOffset;
			return new ScriptList(p);
		});
		lazy$1(this, `featureList`, () => {
			if (no_content) return FeatureList.EMPTY;
			p.currentPosition = tableStart + this.featureListOffset;
			return new FeatureList(p);
		});
		lazy$1(this, `lookupList`, () => {
			if (no_content) return LookupList.EMPTY;
			p.currentPosition = tableStart + this.lookupListOffset;
			return new LookupList(p);
		});
		if (this.featureVariationsOffset) lazy$1(this, `featureVariations`, () => {
			if (no_content) return FeatureVariations.EMPTY;
			p.currentPosition = tableStart + this.featureVariationsOffset;
			return new FeatureVariations(p);
		});
	}
	getSupportedScripts() {
		return this.scriptList.scriptRecords.map((r) => r.scriptTag);
	}
	getScriptTable(scriptTag) {
		let record = this.scriptList.scriptRecords.find((r) => r.scriptTag === scriptTag);
		this.parser.currentPosition = this.scriptList.start + record.scriptOffset;
		let table = new ScriptTable(this.parser);
		table.scriptTag = scriptTag;
		return table;
	}
	ensureScriptTable(arg) {
		if (typeof arg === "string") return this.getScriptTable(arg);
		return arg;
	}
	getSupportedLangSys(scriptTable) {
		scriptTable = this.ensureScriptTable(scriptTable);
		const hasDefault = scriptTable.defaultLangSys !== 0;
		const supported = scriptTable.langSysRecords.map((l) => l.langSysTag);
		if (hasDefault) supported.unshift(`dflt`);
		return supported;
	}
	getDefaultLangSysTable(scriptTable) {
		scriptTable = this.ensureScriptTable(scriptTable);
		let offset = scriptTable.defaultLangSys;
		if (offset !== 0) {
			this.parser.currentPosition = scriptTable.start + offset;
			let table = new LangSysTable(this.parser);
			table.langSysTag = ``;
			table.defaultForScript = scriptTable.scriptTag;
			return table;
		}
	}
	getLangSysTable(scriptTable, langSysTag = `dflt`) {
		if (langSysTag === `dflt`) return this.getDefaultLangSysTable(scriptTable);
		scriptTable = this.ensureScriptTable(scriptTable);
		let record = scriptTable.langSysRecords.find((l) => l.langSysTag === langSysTag);
		this.parser.currentPosition = scriptTable.start + record.langSysOffset;
		let table = new LangSysTable(this.parser);
		table.langSysTag = langSysTag;
		return table;
	}
	getFeatures(langSysTable) {
		return langSysTable.featureIndices.map((index) => this.getFeature(index));
	}
	getFeature(indexOrTag) {
		let record;
		if (parseInt(indexOrTag) == indexOrTag) record = this.featureList.featureRecords[indexOrTag];
		else record = this.featureList.featureRecords.find((f) => f.featureTag === indexOrTag);
		if (!record) return;
		this.parser.currentPosition = this.featureList.start + record.featureOffset;
		let table = new FeatureTable(this.parser);
		table.featureTag = record.featureTag;
		return table;
	}
	getLookups(featureTable) {
		return featureTable.lookupListIndices.map((index) => this.getLookup(index));
	}
	getLookup(lookupIndex, type) {
		let lookupOffset = this.lookupList.lookups[lookupIndex];
		this.parser.currentPosition = this.lookupList.start + lookupOffset;
		return new LookupTable(this.parser, type);
	}
};
var GSUB = class extends CommonLayoutTable {
	constructor(dict, dataview) {
		super(dict, dataview, `GSUB`);
	}
	getLookup(lookupIndex) {
		return super.getLookup(lookupIndex, `GSUB`);
	}
};
var GSUB$1 = Object.freeze({
	__proto__: null,
	GSUB
});
var GPOS = class extends CommonLayoutTable {
	constructor(dict, dataview) {
		super(dict, dataview, `GPOS`);
	}
	getLookup(lookupIndex) {
		return super.getLookup(lookupIndex, `GPOS`);
	}
};
var GPOS$1 = Object.freeze({
	__proto__: null,
	GPOS
});
var SVG = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.offsetToSVGDocumentList = p.Offset32;
		p.currentPosition = this.tableStart + this.offsetToSVGDocumentList;
		this.documentList = new SVGDocumentList(p);
	}
};
var SVGDocumentList = class extends ParsedData {
	constructor(p) {
		super(p);
		this.numEntries = p.uint16;
		this.documentRecords = [...new Array(this.numEntries)].map((_) => new SVGDocumentRecord(p));
	}
	getDocument(documentID) {
		let record = this.documentRecords[documentID];
		if (!record) return "";
		let offset = this.start + record.svgDocOffset;
		this.parser.currentPosition = offset;
		return this.parser.readBytes(record.svgDocLength);
	}
	getDocumentForGlyph(glyphID) {
		let id = this.documentRecords.findIndex((d) => d.startGlyphID <= glyphID && glyphID <= d.endGlyphID);
		if (id === -1) return "";
		return this.getDocument(id);
	}
};
var SVGDocumentRecord = class {
	constructor(p) {
		this.startGlyphID = p.uint16;
		this.endGlyphID = p.uint16;
		this.svgDocOffset = p.Offset32;
		this.svgDocLength = p.uint32;
	}
};
var SVG$1 = Object.freeze({
	__proto__: null,
	SVG
});
var fvar = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.axesArrayOffset = p.Offset16;
		p.uint16;
		this.axisCount = p.uint16;
		this.axisSize = p.uint16;
		this.instanceCount = p.uint16;
		this.instanceSize = p.uint16;
		const axisStart = this.tableStart + this.axesArrayOffset;
		lazy$1(this, `axes`, () => {
			p.currentPosition = axisStart;
			return [...new Array(this.axisCount)].map((_) => new VariationAxisRecord(p));
		});
		const instanceStart = axisStart + this.axisCount * this.axisSize;
		lazy$1(this, `instances`, () => {
			let instances = [];
			for (let i = 0; i < this.instanceCount; i++) {
				p.currentPosition = instanceStart + i * this.instanceSize;
				instances.push(new InstanceRecord(p, this.axisCount, this.instanceSize));
			}
			return instances;
		});
	}
	getSupportedAxes() {
		return this.axes.map((a) => a.tag);
	}
	getAxis(name) {
		return this.axes.find((a) => a.tag === name);
	}
};
var VariationAxisRecord = class {
	constructor(p) {
		this.tag = p.tag;
		this.minValue = p.fixed;
		this.defaultValue = p.fixed;
		this.maxValue = p.fixed;
		this.flags = p.flags(16);
		this.axisNameID = p.uint16;
	}
};
var InstanceRecord = class {
	constructor(p, axisCount, size) {
		let start = p.currentPosition;
		this.subfamilyNameID = p.uint16;
		p.uint16;
		this.coordinates = [...new Array(axisCount)].map((_) => p.fixed);
		if (p.currentPosition - start < size) this.postScriptNameID = p.uint16;
	}
};
var fvar$1 = Object.freeze({
	__proto__: null,
	fvar
});
var cvt = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		const n = dict.length / 2;
		lazy$1(this, `items`, () => [...new Array(n)].map((_) => p.fword));
	}
};
var cvt$1 = Object.freeze({
	__proto__: null,
	cvt
});
var fpgm = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		lazy$1(this, `instructions`, () => [...new Array(dict.length)].map((_) => p.uint8));
	}
};
var fpgm$1 = Object.freeze({
	__proto__: null,
	fpgm
});
var gasp = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.numRanges = p.uint16;
		const getter = () => [...new Array(this.numRanges)].map((_) => new GASPRange(p));
		lazy$1(this, `gaspRanges`, getter);
	}
};
var GASPRange = class {
	constructor(p) {
		this.rangeMaxPPEM = p.uint16;
		this.rangeGaspBehavior = p.uint16;
	}
};
var gasp$1 = Object.freeze({
	__proto__: null,
	gasp
});
var glyf = class extends SimpleTable {
	constructor(dict, dataview) {
		super(dict, dataview);
	}
	getGlyphData(offset, length) {
		this.parser.currentPosition = this.tableStart + offset;
		return this.parser.readBytes(length);
	}
};
var glyf$1 = Object.freeze({
	__proto__: null,
	glyf
});
var loca = class extends SimpleTable {
	constructor(dict, dataview, tables) {
		const { p } = super(dict, dataview);
		const n = tables.maxp.numGlyphs + 1;
		if (tables.head.indexToLocFormat === 0) {
			this.x2 = true;
			lazy$1(this, `offsets`, () => [...new Array(n)].map((_) => p.Offset16));
		} else lazy$1(this, `offsets`, () => [...new Array(n)].map((_) => p.Offset32));
	}
	getGlyphDataOffsetAndLength(glyphID) {
		let offset = this.offsets[glyphID] * this.x2 ? 2 : 1;
		return {
			offset,
			length: (this.offsets[glyphID + 1] * this.x2 ? 2 : 1) - offset
		};
	}
};
var loca$1 = Object.freeze({
	__proto__: null,
	loca
});
var prep = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		lazy$1(this, `instructions`, () => [...new Array(dict.length)].map((_) => p.uint8));
	}
};
var prep$1 = Object.freeze({
	__proto__: null,
	prep
});
var CFF = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		lazy$1(this, `data`, () => p.readBytes());
	}
};
var CFF$1 = Object.freeze({
	__proto__: null,
	CFF
});
var CFF2 = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		lazy$1(this, `data`, () => p.readBytes());
	}
};
var CFF2$1 = Object.freeze({
	__proto__: null,
	CFF2
});
var VORG = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.defaultVertOriginY = p.int16;
		this.numVertOriginYMetrics = p.uint16;
		lazy$1(this, `vertORiginYMetrics`, () => [...new Array(this.numVertOriginYMetrics)].map((_) => new VertOriginYMetric(p)));
	}
};
var VertOriginYMetric = class {
	constructor(p) {
		this.glyphIndex = p.uint16;
		this.vertOriginY = p.int16;
	}
};
var VORG$1 = Object.freeze({
	__proto__: null,
	VORG
});
var BitmapSize = class {
	constructor(p) {
		this.indexSubTableArrayOffset = p.Offset32;
		this.indexTablesSize = p.uint32;
		this.numberofIndexSubTables = p.uint32;
		this.colorRef = p.uint32;
		this.hori = new SbitLineMetrics(p);
		this.vert = new SbitLineMetrics(p);
		this.startGlyphIndex = p.uint16;
		this.endGlyphIndex = p.uint16;
		this.ppemX = p.uint8;
		this.ppemY = p.uint8;
		this.bitDepth = p.uint8;
		this.flags = p.int8;
	}
};
var BitmapScale = class {
	constructor(p) {
		this.hori = new SbitLineMetrics(p);
		this.vert = new SbitLineMetrics(p);
		this.ppemX = p.uint8;
		this.ppemY = p.uint8;
		this.substitutePpemX = p.uint8;
		this.substitutePpemY = p.uint8;
	}
};
var SbitLineMetrics = class {
	constructor(p) {
		this.ascender = p.int8;
		this.descender = p.int8;
		this.widthMax = p.uint8;
		this.caretSlopeNumerator = p.int8;
		this.caretSlopeDenominator = p.int8;
		this.caretOffset = p.int8;
		this.minOriginSB = p.int8;
		this.minAdvanceSB = p.int8;
		this.maxBeforeBL = p.int8;
		this.minAfterBL = p.int8;
		this.pad1 = p.int8;
		this.pad2 = p.int8;
	}
};
var EBLC = class extends SimpleTable {
	constructor(dict, dataview, name) {
		const { p } = super(dict, dataview, name);
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.numSizes = p.uint32;
		lazy$1(this, `bitMapSizes`, () => [...new Array(this.numSizes)].map((_) => new BitmapSize(p)));
	}
};
var EBLC$1 = Object.freeze({
	__proto__: null,
	EBLC
});
var EBDT = class extends SimpleTable {
	constructor(dict, dataview, name) {
		const { p } = super(dict, dataview, name);
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
	}
};
var EBDT$1 = Object.freeze({
	__proto__: null,
	EBDT
});
var EBSC = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.majorVersion = p.uint16;
		this.minorVersion = p.uint16;
		this.numSizes = p.uint32;
		lazy$1(this, `bitmapScales`, () => [...new Array(this.numSizes)].map((_) => new BitmapScale(p)));
	}
};
var EBSC$1 = Object.freeze({
	__proto__: null,
	EBSC
});
var CBLC = class extends EBLC {
	constructor(dict, dataview) {
		super(dict, dataview, `CBLC`);
	}
};
var CBLC$1 = Object.freeze({
	__proto__: null,
	CBLC
});
var CBDT = class extends EBDT {
	constructor(dict, dataview) {
		super(dict, dataview, `CBDT`);
	}
};
var CBDT$1 = Object.freeze({
	__proto__: null,
	CBDT
});
var sbix = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.flags = p.flags(16);
		this.numStrikes = p.uint32;
		lazy$1(this, `strikeOffsets`, () => [...new Array(this.numStrikes)].map((_) => p.Offset32));
	}
};
var sbix$1 = Object.freeze({
	__proto__: null,
	sbix
});
var COLR = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.numBaseGlyphRecords = p.uint16;
		this.baseGlyphRecordsOffset = p.Offset32;
		this.layerRecordsOffset = p.Offset32;
		this.numLayerRecords = p.uint16;
	}
	getBaseGlyphRecord(glyphID) {
		let start = this.tableStart + this.baseGlyphRecordsOffset;
		this.parser.currentPosition = start;
		let first = new BaseGlyphRecord(this.parser);
		let firstID = first.gID;
		let end = this.tableStart + this.layerRecordsOffset - 6;
		this.parser.currentPosition = end;
		let last = new BaseGlyphRecord(this.parser);
		let lastID = last.gID;
		if (firstID === glyphID) return first;
		if (lastID === glyphID) return last;
		while (true) {
			if (start === end) break;
			let mid = start + (end - start) / 12;
			this.parser.currentPosition = mid;
			let middle = new BaseGlyphRecord(this.parser);
			let midID = middle.gID;
			if (midID === glyphID) return middle;
			else if (midID > glyphID) end = mid;
			else if (midID < glyphID) start = mid;
		}
		return false;
	}
	getLayers(glyphID) {
		let record = this.getBaseGlyphRecord(glyphID);
		this.parser.currentPosition = this.tableStart + this.layerRecordsOffset + 4 * record.firstLayerIndex;
		return [...new Array(record.numLayers)].map((_) => new LayerRecord(p));
	}
};
var BaseGlyphRecord = class {
	constructor(p) {
		this.gID = p.uint16;
		this.firstLayerIndex = p.uint16;
		this.numLayers = p.uint16;
	}
};
var LayerRecord = class {
	constructor(p) {
		this.gID = p.uint16;
		this.paletteIndex = p.uint16;
	}
};
var COLR$1 = Object.freeze({
	__proto__: null,
	COLR
});
var CPAL = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.numPaletteEntries = p.uint16;
		const numPalettes = this.numPalettes = p.uint16;
		this.numColorRecords = p.uint16;
		this.offsetFirstColorRecord = p.Offset32;
		this.colorRecordIndices = [...new Array(this.numPalettes)].map((_) => p.uint16);
		lazy$1(this, `colorRecords`, () => {
			p.currentPosition = this.tableStart + this.offsetFirstColorRecord;
			return [...new Array(this.numColorRecords)].map((_) => new ColorRecord(p));
		});
		if (this.version === 1) {
			this.offsetPaletteTypeArray = p.Offset32;
			this.offsetPaletteLabelArray = p.Offset32;
			this.offsetPaletteEntryLabelArray = p.Offset32;
			lazy$1(this, `paletteTypeArray`, () => {
				p.currentPosition = this.tableStart + this.offsetPaletteTypeArray;
				return new PaletteTypeArray(p, numPalettes);
			});
			lazy$1(this, `paletteLabelArray`, () => {
				p.currentPosition = this.tableStart + this.offsetPaletteLabelArray;
				return new PaletteLabelsArray(p, numPalettes);
			});
			lazy$1(this, `paletteEntryLabelArray`, () => {
				p.currentPosition = this.tableStart + this.offsetPaletteEntryLabelArray;
				return new PaletteEntryLabelArray(p, numPalettes);
			});
		}
	}
};
var ColorRecord = class {
	constructor(p) {
		this.blue = p.uint8;
		this.green = p.uint8;
		this.red = p.uint8;
		this.alpha = p.uint8;
	}
};
var PaletteTypeArray = class {
	constructor(p, numPalettes) {
		this.paletteTypes = [...new Array(numPalettes)].map((_) => p.uint32);
	}
};
var PaletteLabelsArray = class {
	constructor(p, numPalettes) {
		this.paletteLabels = [...new Array(numPalettes)].map((_) => p.uint16);
	}
};
var PaletteEntryLabelArray = class {
	constructor(p, numPalettes) {
		this.paletteEntryLabels = [...new Array(numPalettes)].map((_) => p.uint16);
	}
};
var CPAL$1 = Object.freeze({
	__proto__: null,
	CPAL
});
var DSIG = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint32;
		this.numSignatures = p.uint16;
		this.flags = p.uint16;
		this.signatureRecords = [...new Array(this.numSignatures)].map((_) => new SignatureRecord(p));
	}
	getData(signatureID) {
		const record = this.signatureRecords[signatureID];
		this.parser.currentPosition = this.tableStart + record.offset;
		return new SignatureBlockFormat1(this.parser);
	}
};
var SignatureRecord = class {
	constructor(p) {
		this.format = p.uint32;
		this.length = p.uint32;
		this.offset = p.Offset32;
	}
};
var SignatureBlockFormat1 = class {
	constructor(p) {
		p.uint16;
		p.uint16;
		this.signatureLength = p.uint32;
		this.signature = p.readBytes(this.signatureLength);
	}
};
var DSIG$1 = Object.freeze({
	__proto__: null,
	DSIG
});
var hdmx = class extends SimpleTable {
	constructor(dict, dataview, tables) {
		const { p } = super(dict, dataview);
		const numGlyphs = tables.hmtx.numGlyphs;
		this.version = p.uint16;
		this.numRecords = p.int16;
		this.sizeDeviceRecord = p.int32;
		this.records = [...new Array(numRecords)].map((_) => new DeviceRecord(p, numGlyphs));
	}
};
var DeviceRecord = class {
	constructor(p, numGlyphs) {
		this.pixelSize = p.uint8;
		this.maxWidth = p.uint8;
		this.widths = p.readBytes(numGlyphs);
	}
};
var hdmx$1 = Object.freeze({
	__proto__: null,
	hdmx
});
var kern = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.nTables = p.uint16;
		lazy$1(this, `tables`, () => {
			let offset = this.tableStart + 4;
			const tables = [];
			for (let i = 0; i < this.nTables; i++) {
				p.currentPosition = offset;
				let subtable = new KernSubTable(p);
				tables.push(subtable);
				offset += subtable;
			}
			return tables;
		});
	}
};
var KernSubTable = class {
	constructor(p) {
		this.version = p.uint16;
		this.length = p.uint16;
		this.coverage = p.flags(8);
		this.format = p.uint8;
		if (this.format === 0) {
			this.nPairs = p.uint16;
			this.searchRange = p.uint16;
			this.entrySelector = p.uint16;
			this.rangeShift = p.uint16;
			lazy$1(this, `pairs`, () => [...new Array(this.nPairs)].map((_) => new Pair(p)));
		}
		if (this.format === 2) console.warn(`Kern subtable format 2 is not supported: this parser currently only parses universal table data.`);
	}
	get horizontal() {
		return this.coverage[0];
	}
	get minimum() {
		return this.coverage[1];
	}
	get crossstream() {
		return this.coverage[2];
	}
	get override() {
		return this.coverage[3];
	}
};
var Pair = class {
	constructor(p) {
		this.left = p.uint16;
		this.right = p.uint16;
		this.value = p.fword;
	}
};
var kern$1 = Object.freeze({
	__proto__: null,
	kern
});
var LTSH = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.numGlyphs = p.uint16;
		this.yPels = p.readBytes(this.numGlyphs);
	}
};
var LTSH$1 = Object.freeze({
	__proto__: null,
	LTSH
});
var MERG = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.mergeClassCount = p.uint16;
		this.mergeDataOffset = p.Offset16;
		this.classDefCount = p.uint16;
		this.offsetToClassDefOffsets = p.Offset16;
		lazy$1(this, `mergeEntryMatrix`, () => [...new Array(this.mergeClassCount)].map((_) => p.readBytes(this.mergeClassCount)));
		console.warn(`Full MERG parsing is currently not supported.`);
		console.warn(`If you need this table parsed, please file an issue, or better yet, a PR.`);
	}
};
var MERG$1 = Object.freeze({
	__proto__: null,
	MERG
});
var meta = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint32;
		this.flags = p.uint32;
		p.uint32;
		this.dataMapsCount = p.uint32;
		this.dataMaps = [...new Array(this.dataMapsCount)].map((_) => new DataMap(this.tableStart, p));
	}
};
var DataMap = class {
	constructor(tableStart, p) {
		this.tableStart = tableStart;
		this.parser = p;
		this.tag = p.tag;
		this.dataOffset = p.Offset32;
		this.dataLength = p.uint32;
	}
	getData() {
		this.parser.currentField = this.tableStart + this.dataOffset;
		return this.parser.readBytes(this.dataLength);
	}
};
var meta$1 = Object.freeze({
	__proto__: null,
	meta
});
var PCLT = class extends SimpleTable {
	constructor(dict, dataview) {
		super(dict, dataview);
		console.warn(`This font uses a PCLT table, which is currently not supported by this parser.`);
		console.warn(`If you need this table parsed, please file an issue, or better yet, a PR.`);
	}
};
var PCLT$1 = Object.freeze({
	__proto__: null,
	PCLT
});
var VDMX = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.uint16;
		this.numRecs = p.uint16;
		this.numRatios = p.uint16;
		this.ratRanges = [...new Array(this.numRatios)].map((_) => new RatioRange(p));
		this.offsets = [...new Array(this.numRatios)].map((_) => p.Offset16);
		this.VDMXGroups = [...new Array(this.numRecs)].map((_) => new VDMXGroup(p));
	}
};
var RatioRange = class {
	constructor(p) {
		this.bCharSet = p.uint8;
		this.xRatio = p.uint8;
		this.yStartRatio = p.uint8;
		this.yEndRatio = p.uint8;
	}
};
var VDMXGroup = class {
	constructor(p) {
		this.recs = p.uint16;
		this.startsz = p.uint8;
		this.endsz = p.uint8;
		this.records = [...new Array(this.recs)].map((_) => new vTable(p));
	}
};
var vTable = class {
	constructor(p) {
		this.yPelHeight = p.uint16;
		this.yMax = p.int16;
		this.yMin = p.int16;
	}
};
var VDMX$1 = Object.freeze({
	__proto__: null,
	VDMX
});
var vhea = class extends SimpleTable {
	constructor(dict, dataview) {
		const { p } = super(dict, dataview);
		this.version = p.fixed;
		this.ascent = this.vertTypoAscender = p.int16;
		this.descent = this.vertTypoDescender = p.int16;
		this.lineGap = this.vertTypoLineGap = p.int16;
		this.advanceHeightMax = p.int16;
		this.minTopSideBearing = p.int16;
		this.minBottomSideBearing = p.int16;
		this.yMaxExtent = p.int16;
		this.caretSlopeRise = p.int16;
		this.caretSlopeRun = p.int16;
		this.caretOffset = p.int16;
		this.reserved = p.int16;
		this.reserved = p.int16;
		this.reserved = p.int16;
		this.reserved = p.int16;
		this.metricDataFormat = p.int16;
		this.numOfLongVerMetrics = p.uint16;
		p.verifyLength();
	}
};
var vhea$1 = Object.freeze({
	__proto__: null,
	vhea
});
var vmtx = class extends SimpleTable {
	constructor(dict, dataview, tables) {
		super(dict, dataview);
		const numOfLongVerMetrics = tables.vhea.numOfLongVerMetrics;
		const numGlyphs = tables.maxp.numGlyphs;
		const metricsStart = p.currentPosition;
		lazy(this, `vMetrics`, () => {
			p.currentPosition = metricsStart;
			return [...new Array(numOfLongVerMetrics)].map((_) => new LongVertMetric(p.uint16, p.int16));
		});
		if (numOfLongVerMetrics < numGlyphs) {
			const tsbStart = metricsStart + numOfLongVerMetrics * 4;
			lazy(this, `topSideBearings`, () => {
				p.currentPosition = tsbStart;
				return [...new Array(numGlyphs - numOfLongVerMetrics)].map((_) => p.int16);
			});
		}
	}
};
var LongVertMetric = class {
	constructor(h, b) {
		this.advanceHeight = h;
		this.topSideBearing = b;
	}
};
var vmtx$1 = Object.freeze({
	__proto__: null,
	vmtx
});

// packages/global-styles-ui/build-module/font-library/modal.mjs
const { Tabs: WCTabs } = unlock(import_components.privateApis);
const DEFAULT_TAB = {
	id: "installed-fonts",
	title: (0, import_i18n._x)("Library", "Font library")
};
const UPLOAD_TAB = {
	id: "upload-fonts",
	title: (0, import_i18n._x)("Upload", "noun")
};

// packages/global-styles-ui/build-module/preset-colors.mjs
function PresetColors() {
	const { paletteColors } = useStylesPreviewColors();
	return paletteColors.slice(0, 4).map(({ slug, color }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
		flexGrow: 1,
		height: "100%",
		background: color
	} }, `${slug}-${index}`));
}

// packages/global-styles-ui/build-module/preview-colors.mjs
const firstFrameVariants = {
	start: {
		scale: 1,
		opacity: 1
	},
	hover: {
		scale: 0,
		opacity: 0
	}
};
const StylesPreviewColors = ({ label, isFocused, withHoverView }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewWrapper, {
		label,
		isFocused,
		withHoverView,
		children: ({ key }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__unstableMotion.div, {
			variants: firstFrameVariants,
			style: {
				height: "100%",
				overflow: "hidden"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalHStack, {
				spacing: 0,
				justify: "center",
				style: {
					height: "100%",
					overflow: "hidden"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresetColors, {})
			})
		}, key)
	});
};

// packages/global-styles-ui/build-module/variations/variations-color.mjs
const propertiesToFilter = ["color"];
function ColorVariations$1({ title, gap = 2 }) {
	const colorVariations = useCurrentMergeThemeStyleVariationsWithUserConfig(propertiesToFilter);
	if (colorVariations?.length <= 1) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
		spacing: 3,
		children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Subtitle, {
			level: 3,
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalGrid, {
			gap,
			children: colorVariations.map((variation, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Variation, {
				variation,
				isPill: true,
				properties: propertiesToFilter,
				showTooltip: true,
				children: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylesPreviewColors, {})
			}, index))
		})]
	});
}

// packages/global-styles-ui/build-module/background-panel.mjs
const { BackgroundPanel: StylesBackgroundPanel } = unlock(import_block_editor.privateApis);

// packages/global-styles-ui/build-module/screen-background.mjs
const { useHasBackgroundPanel } = unlock(import_block_editor.privateApis);

// packages/global-styles-ui/build-module/dimensions-panel.mjs
const { useSettingsForBlockElement: useSettingsForBlockElement$1, DimensionsPanel: StylesDimensionsPanel } = unlock(import_block_editor.privateApis);

// packages/global-styles-ui/build-module/screen-layout.mjs
const { useHasDimensionsPanel, useSettingsForBlockElement } = unlock(import_block_editor.privateApis);

// packages/global-styles-ui/build-module/style-variations-container.mjs
function StyleVariationsContainer({ gap = 2 }) {
	const { user } = (0, import_element.useContext)(GlobalStylesContext);
	const userStyles = user?.styles;
	const fullStyleVariations = (0, import_data.useSelect)((select) => {
		const result = select(import_core_data.store).__experimentalGetCurrentThemeGlobalStylesVariations();
		return Array.isArray(result) ? result : void 0;
	}, [])?.filter((variation) => {
		return !isVariationWithProperties(variation, ["color"]) && !isVariationWithProperties(variation, ["typography", "spacing"]);
	});
	const themeVariations = (0, import_element.useMemo)(() => {
		return [...[{
			title: (0, import_i18n.__)("Default"),
			settings: {},
			styles: {}
		}, ...fullStyleVariations ?? []].map((variation) => {
			const blockStyles = variation?.styles?.blocks ? { ...variation.styles.blocks } : {};
			if (userStyles?.blocks) Object.keys(userStyles.blocks).forEach((blockName) => {
				if (userStyles.blocks?.[blockName]?.css) {
					const variationBlockStyles = blockStyles[blockName] || {};
					const customCSS = { css: `${blockStyles[blockName]?.css || ""} ${userStyles.blocks?.[blockName]?.css?.trim() || ""}` };
					blockStyles[blockName] = {
						...variationBlockStyles,
						...customCSS
					};
				}
			});
			const css = userStyles?.css || variation.styles?.css ? { css: `${variation.styles?.css || ""} ${userStyles?.css || ""}` } : {};
			const blocks = Object.keys(blockStyles).length > 0 ? { blocks: blockStyles } : {};
			const styles = {
				...variation.styles,
				...css,
				...blocks
			};
			return {
				...variation,
				settings: variation.settings ?? {},
				styles
			};
		})];
	}, [
		fullStyleVariations,
		userStyles?.blocks,
		userStyles?.css
	]);
	if (!fullStyleVariations || fullStyleVariations.length < 1) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalGrid, {
		columns: 2,
		className: "global-styles-ui-style-variations-container",
		gap,
		children: themeVariations.map((variation, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Variation, {
			variation,
			children: (isFocused) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewStyles, {
				label: variation?.title,
				withHoverView: true,
				isFocused,
				variation
			})
		}, index))
	});
}

// packages/global-styles-ui/build-module/screen-css.mjs
const { AdvancedPanel: StylesAdvancedPanel } = unlock(import_block_editor.privateApis);

// packages/global-styles-ui/build-module/screen-revisions/use-global-styles-revisions.mjs
const SITE_EDITOR_AUTHORS_QUERY = {
	per_page: -1,
	_fields: "id,name,avatar_urls",
	context: "view",
	capabilities: ["edit_theme_options"]
};
const DEFAULT_QUERY = {
	per_page: 100,
	page: 1
};
const EMPTY_ARRAY = [];
function useGlobalStylesRevisions({ query } = {}) {
	const { user: userConfig } = (0, import_element.useContext)(GlobalStylesContext);
	const _query = (0, import_element.useMemo)(() => ({
		...DEFAULT_QUERY,
		...query
	}), [query]);
	const { authors, currentUser, isDirty, revisions, isLoadingGlobalStylesRevisions, revisionsCount } = (0, import_data.useSelect)((select) => {
		const { __experimentalGetDirtyEntityRecords, getCurrentUser, getUsers, getRevisions, __experimentalGetCurrentGlobalStylesId, getEntityRecord, isResolving } = select(import_core_data.store);
		const dirtyEntityRecords = __experimentalGetDirtyEntityRecords() || [];
		const _currentUser = getCurrentUser();
		const _isDirty = dirtyEntityRecords.length > 0;
		const globalStylesId = __experimentalGetCurrentGlobalStylesId();
		const _revisionsCount = (globalStylesId ? getEntityRecord("root", "globalStyles", globalStylesId) : void 0)?._links?.["version-history"]?.[0]?.count ?? 0;
		const globalStylesRevisions = globalStylesId ? getRevisions("root", "globalStyles", globalStylesId, _query) || EMPTY_ARRAY : EMPTY_ARRAY;
		return {
			authors: getUsers(SITE_EDITOR_AUTHORS_QUERY) || EMPTY_ARRAY,
			currentUser: _currentUser,
			isDirty: _isDirty,
			revisions: globalStylesRevisions,
			isLoadingGlobalStylesRevisions: globalStylesId ? isResolving("getRevisions", [
				"root",
				"globalStyles",
				globalStylesId,
				_query
			]) : false,
			revisionsCount: _revisionsCount
		};
	}, [_query]);
	return (0, import_element.useMemo)(() => {
		if (!authors.length || isLoadingGlobalStylesRevisions) return {
			revisions: EMPTY_ARRAY,
			hasUnsavedChanges: isDirty,
			isLoading: true,
			revisionsCount
		};
		const _modifiedRevisions = revisions.map((revision) => {
			return {
				...revision,
				author: authors.find((author) => author.id === revision.author)
			};
		});
		if (revisions.length) {
			if (_modifiedRevisions[0].id !== "unsaved" && _query.page === 1) _modifiedRevisions[0].isLatest = true;
			if (isDirty && userConfig && Object.keys(userConfig).length > 0 && currentUser && _query.page === 1) {
				const unsavedRevision = {
					id: "unsaved",
					styles: userConfig?.styles,
					settings: userConfig?.settings,
					_links: userConfig?._links,
					author: {
						name: currentUser?.name || "",
						avatar_urls: currentUser?.avatar_urls || {}
					},
					modified: /* @__PURE__ */ new Date()
				};
				_modifiedRevisions.unshift(unsavedRevision);
			}
			if (_query.per_page && _query.page === Math.ceil(revisionsCount / _query.per_page)) _modifiedRevisions.push({
				id: "parent",
				styles: {},
				settings: {}
			});
		}
		return {
			revisions: _modifiedRevisions,
			hasUnsavedChanges: isDirty,
			isLoading: false,
			revisionsCount
		};
	}, [
		isDirty,
		revisions,
		currentUser,
		authors,
		userConfig,
		isLoadingGlobalStylesRevisions,
		revisionsCount,
		_query.page,
		_query.per_page
	]);
}

// \0wp-global:@wordpress/date
var require_date = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.date;
}));

// packages/global-styles-ui/build-module/screen-revisions/revisions-list.mjs
var import_date = require_date();

// packages/global-styles-ui/build-module/with-global-styles-provider.mjs
/**
* Higher-order component that wraps a component with GlobalStylesProvider.
* This allows components to access GlobalStylesContext without exposing
* the provider directly in the public API.
*
* @param Component - The component to wrap
* @return A wrapped component that accepts value, baseValue, and onChange props
*/
function withGlobalStylesProvider(Component) {
	return function WrappedComponent({ value, baseValue, onChange, ...props }) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalStylesProvider, {
			value,
			baseValue,
			onChange,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { ...props })
		});
	};
}

// packages/global-styles-ui/build-module/style-variations.mjs
/**
* Render Style Variations.
*
* @example
* ```tsx
* <StyleVariations
*   value={userConfig}
*   baseValue={baseConfig}
*   onChange={setUserConfig}
*   gap={3}
* />
* ```
*/
const StyleVariations = withGlobalStylesProvider(StyleVariationsContainer);

// packages/global-styles-ui/build-module/color-variations.mjs
/**
* Render Global Styles Color Variations.
*
* @example
* ```tsx
* <ColorVariations
*   value={userConfig}
*   baseValue={baseConfig}
*   onChange={setUserConfig}
*   title="Palettes"
*   gap={3}
* />
* ```
*/
const ColorVariations = withGlobalStylesProvider(ColorVariations$1);

// packages/global-styles-ui/build-module/typography-variations.mjs
/**
* Render Typography Variations.
*
* @example
* ```tsx
* <TypographyVariations
*   value={userConfig}
*   baseValue={baseConfig}
*   onChange={setUserConfig}
*   title="Typography"
*   gap={3}
* />
* ```
*/
const TypographyVariations = withGlobalStylesProvider(TypographyVariations$1);

// routes/styles/canvas.tsx
const { StyleBookPreview } = unlock$2(import_editor.privateApis);
function RevisionStyleBookPreview({ revisionId, section, onChangeSection, settings }) {
	const { revisions, isLoading } = useGlobalStylesRevisions();
	if (isLoading) return null;
	const selectedRevision = revisions.find((revision) => String(revision.id) === revisionId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleBookPreview, {
		path: section,
		onPathChange: onChangeSection,
		settings,
		userConfig: selectedRevision
	});
}
function Canvas() {
	const { isReady: assetsReady } = useEditorAssets();
	const navigate = useNavigate();
	const search = useSearch({ strict: false });
	const { globalStylesId, isBlockTheme } = (0, import_data.useSelect)((select) => {
		const { getCurrentTheme, __experimentalGetCurrentGlobalStylesId } = select(import_core_data.store);
		return {
			globalStylesId: __experimentalGetCurrentGlobalStylesId(),
			isBlockTheme: !!getCurrentTheme()?.is_block_theme
		};
	}, []);
	const { isReady: settingsReady, editorSettings } = useEditorSettings({ stylesId: globalStylesId });
	const section = search.section ?? "/";
	const onChangeSection = (updatedSection) => {
		navigate({ search: {
			...search,
			section: updatedSection
		} });
	};
	if (!assetsReady || !settingsReady) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			height: "100%"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
	});
	if (!isBlockTheme) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleBookPreview, {
		isStatic: true,
		settings: editorSettings
	});
	const revisionId = section.match(/^\/revisions\/(.+)$/)?.[1];
	if (revisionId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevisionStyleBookPreview, {
		revisionId,
		section,
		onChangeSection,
		settings: editorSettings
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleBookPreview, {
		path: section,
		onPathChange: onChangeSection,
		settings: editorSettings
	});
}
const canvas = Canvas;

export { canvas, stage };