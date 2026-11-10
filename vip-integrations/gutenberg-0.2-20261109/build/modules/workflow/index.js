import { executeAbility, store } from "@wordpress/abilities";

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
function createGenericEventDetails(reason, event, customProperties) {
	const custom = customProperties ?? EMPTY_OBJECT;
	return {
		reason,
		event: event ?? new Event("base-ui"),
		...custom
	};
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/reason-parts.mjs
const none = "none";
const triggerPress = "trigger-press";
const outsidePress = "outside-press";
const itemPress = "item-press";
const closePress = "close-press";
const inputChange = "input-change";
const inputClear = "input-clear";
const inputPress = "input-press";
const focusOut = "focus-out";
const escapeKey = "escape-key";
const listNavigation = "list-navigation";
const keyboard = "keyboard";
const pointer = "pointer";
const imperativeAction = "imperative-action";

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
	const { overflow, overflowX, overflowY, display } = getComputedStyle(element);
	return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && display !== "inline" && display !== "contents";
}
function isLastTraversableNode(node) {
	return /^(html|body|#document)$/.test(getNodeName(node));
}
function getComputedStyle(element) {
	return getWindow(element).getComputedStyle(element);
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
const { userAgent, platform, maxTouchPoints } = readRawData();
const lowerUserAgent = userAgent.toLowerCase();
const lowerPlatform = platform.toLowerCase();

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

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/platform/engine.mjs
/** WebKit: Safari, all iOS browsers, GNOME Web. Excludes Blink. */
const webkit = typeof CSS !== "undefined" && !!CSS.supports?.("-webkit-backdrop-filter:none");
/** Gecko: Firefox. */
const gecko = !webkit && lowerUserAgent.includes("firefox");
/** Blink: Chrome, Edge, Opera, Brave, and other Chromium-based browsers. */
const blink = !webkit && lowerUserAgent.includes("chrom");

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/platform/env.mjs
/** Running in jsdom or HappyDOM (used by unit tests). */
const jsdom = /jsdom|happydom/.test(lowerUserAgent);

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
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const ARROW_UP = "ArrowUp";
const ARROW_DOWN = "ArrowDown";

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

// node_modules/.store/@floating-ui/utils@0.2.12-gOxTzMf36nCrbeHpEew-rw/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
const floor = Math.floor;

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/composite.mjs
function isDifferentGridRow(index, cols, prevRow) {
	return Math.floor(index / cols) !== prevRow;
}
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
function getGridNavigatedIndex(list, { event, orientation, loopFocus, onLoop, rtl, cols, disabledIndices, minIndex, maxIndex, prevIndex, stopEvent: stop = false }) {
	let nextIndex = prevIndex;
	let verticalDirection;
	if (event.key === "ArrowUp") verticalDirection = "up";
	else if (event.key === "ArrowDown") verticalDirection = "down";
	if (verticalDirection) {
		const rows = [];
		const rowIndexMap = [];
		let hasRoleRow = false;
		let visibleItemCount = 0;
		{
			let currentRowEl = null;
			let currentRowIndex = -1;
			list.forEach((el, idx) => {
				if (el == null) return;
				visibleItemCount += 1;
				const rowEl = closest(el, "[role=\"row\"]");
				if (rowEl) hasRoleRow = true;
				if (rowEl !== currentRowEl || currentRowIndex === -1) {
					currentRowEl = rowEl;
					currentRowIndex += 1;
					rows[currentRowIndex] = [];
				}
				rows[currentRowIndex].push(idx);
				rowIndexMap[idx] = currentRowIndex;
			});
		}
		let hasDomRows = false;
		let inferredDomCols = 0;
		if (hasRoleRow) for (const row of rows) {
			const rowLength = row.length;
			if (rowLength > inferredDomCols) inferredDomCols = rowLength;
			if (rowLength !== cols) hasDomRows = true;
		}
		const hasVirtualizedGaps = hasDomRows && visibleItemCount < list.length;
		const verticalCols = inferredDomCols || cols;
		const navigateVertically = (direction) => {
			if (!hasDomRows || prevIndex === -1) return;
			const currentRow = rowIndexMap[prevIndex];
			if (currentRow == null) return;
			const colInRow = rows[currentRow].indexOf(prevIndex);
			const step = direction === "up" ? -1 : 1;
			for (let nextRow = currentRow + step, i = 0; i < rows.length; i += 1, nextRow += step) {
				if (nextRow < 0 || nextRow >= rows.length) {
					if (!loopFocus || hasVirtualizedGaps) return;
					nextRow = nextRow < 0 ? rows.length - 1 : 0;
					if (onLoop) {
						const clampedCol = Math.min(colInRow, rows[nextRow].length - 1);
						const returnedItemIndex = onLoop(event, prevIndex, rows[nextRow][clampedCol] ?? rows[nextRow][0]);
						nextRow = rowIndexMap[returnedItemIndex] ?? nextRow;
					}
				}
				const targetRow = rows[nextRow];
				for (let col = Math.min(colInRow, targetRow.length - 1); col >= 0; col -= 1) {
					const candidate = targetRow[col];
					if (!isListIndexDisabled(list, candidate, disabledIndices)) return candidate;
				}
			}
		};
		const navigateVerticallyWithInferredRows = (direction) => {
			if (!hasVirtualizedGaps || prevIndex === -1) return;
			const colInRow = prevIndex % verticalCols;
			const rowStep = direction === "up" ? -verticalCols : verticalCols;
			const lastRowStart = maxIndex - maxIndex % verticalCols;
			const rowCount = floor(maxIndex / verticalCols) + 1;
			for (let rowStart = prevIndex - colInRow + rowStep, i = 0; i < rowCount; i += 1, rowStart += rowStep) {
				if (rowStart < 0 || rowStart > maxIndex) {
					if (!loopFocus) return;
					rowStart = rowStart < 0 ? lastRowStart : 0;
				}
				const rowEnd = Math.min(rowStart + verticalCols - 1, maxIndex);
				for (let candidate = Math.min(rowStart + colInRow, rowEnd); candidate >= rowStart; candidate -= 1) if (!isListIndexDisabled(list, candidate, disabledIndices)) return candidate;
			}
		};
		if (stop) stopEvent(event);
		const verticalCandidate = navigateVertically(verticalDirection) ?? navigateVerticallyWithInferredRows(verticalDirection);
		if (verticalCandidate !== void 0) nextIndex = verticalCandidate;
		else if (prevIndex === -1) nextIndex = verticalDirection === "up" ? maxIndex : minIndex;
		else {
			nextIndex = findNonDisabledListIndex(list, {
				startingIndex: prevIndex,
				amount: verticalCols,
				decrement: verticalDirection === "up",
				disabledIndices
			});
			if (loopFocus) {
				if (verticalDirection === "up" && (prevIndex - verticalCols < minIndex || nextIndex < 0)) {
					const col = prevIndex % verticalCols;
					const maxCol = maxIndex % verticalCols;
					const offset = maxIndex - (maxCol - col);
					if (maxCol === col) nextIndex = maxIndex;
					else nextIndex = maxCol > col ? offset : offset - verticalCols;
					if (onLoop) nextIndex = onLoop(event, prevIndex, nextIndex);
				}
				if (verticalDirection === "down" && prevIndex + verticalCols > maxIndex) {
					nextIndex = findNonDisabledListIndex(list, {
						startingIndex: prevIndex % verticalCols - verticalCols,
						amount: verticalCols,
						disabledIndices
					});
					if (onLoop) nextIndex = onLoop(event, prevIndex, nextIndex);
				}
			}
		}
		if (isIndexOutOfListBounds(list, nextIndex)) nextIndex = prevIndex;
	}
	if (orientation === "both") {
		const prevRow = floor(prevIndex / cols);
		if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
			if (stop) stopEvent(event);
			if (prevIndex % cols !== cols - 1) {
				nextIndex = findNonDisabledListIndex(list, {
					startingIndex: prevIndex,
					disabledIndices
				});
				if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
					nextIndex = findNonDisabledListIndex(list, {
						startingIndex: prevIndex - prevIndex % cols - 1,
						disabledIndices
					});
					if (onLoop) nextIndex = onLoop(event, prevIndex, nextIndex);
				}
			} else if (loopFocus) {
				nextIndex = findNonDisabledListIndex(list, {
					startingIndex: prevIndex - prevIndex % cols - 1,
					disabledIndices
				});
				if (onLoop) nextIndex = onLoop(event, prevIndex, nextIndex);
			}
			if (isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = prevIndex;
		}
		if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
			if (stop) stopEvent(event);
			if (prevIndex % cols !== 0) {
				nextIndex = findNonDisabledListIndex(list, {
					startingIndex: prevIndex,
					decrement: true,
					disabledIndices
				});
				if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
					nextIndex = findNonDisabledListIndex(list, {
						startingIndex: prevIndex + (cols - prevIndex % cols),
						decrement: true,
						disabledIndices
					});
					if (onLoop) nextIndex = onLoop(event, prevIndex, nextIndex);
				}
			} else if (loopFocus) {
				nextIndex = findNonDisabledListIndex(list, {
					startingIndex: prevIndex + (cols - prevIndex % cols),
					decrement: true,
					disabledIndices
				});
				if (onLoop) nextIndex = onLoop(event, prevIndex, nextIndex);
			}
			if (isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = prevIndex;
		}
		const lastRow = floor(maxIndex / cols) === prevRow;
		if (isIndexOutOfListBounds(list, nextIndex)) {
			if (loopFocus && lastRow) {
				nextIndex = event.key === (rtl ? "ArrowRight" : "ArrowLeft") ? maxIndex : findNonDisabledListIndex(list, {
					startingIndex: prevIndex - prevIndex % cols - 1,
					disabledIndices
				});
				if (onLoop) nextIndex = onLoop(event, prevIndex, nextIndex);
			} else nextIndex = prevIndex;
		}
	}
	return nextIndex;
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
function isElementVisible(element, styles = element ? getComputedStyle(element) : null) {
	if (!element || !element.isConnected || !styles || isHiddenByStyles(styles)) return false;
	if (typeof element.checkVisibility === "function") return element.checkVisibility();
	return styles.display !== "none" && styles.display !== "contents";
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/utils/nodes.mjs
function getNodeChildren(nodes, id, onlyOpenChildren = true) {
	return nodes.filter((node) => node.parentId === id).flatMap((child) => [...!onlyOpenChildren || child.context?.open ? [child] : [], ...getNodeChildren(nodes, child.id, onlyOpenChildren)]);
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
				const style = getComputedStyle(target);
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
	const floatingId = useId$1();
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
	return doSwitch(orientation, rtl ? key === ARROW_LEFT : key === ARROW_RIGHT, key === ARROW_DOWN);
}
function isCrossOrientationCloseKey(key, orientation, rtl, grid) {
	const vertical = rtl ? key === ARROW_RIGHT : key === ARROW_LEFT;
	const horizontal = key === ARROW_UP;
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/floating-ui-react/hooks/gridNavigation.mjs
/**
* Positional arguments are deliberate: property names of an options object
* don't minify, and the signature is locked to the caller via `typeof` on the
* `grid` option of `useListNavigation`.
*
* The injected grid navigator only ever operates on a uniform 1x1 grid (sizes are
* always `1x1` and packing is never dense), so the cell-map machinery that supports
* multi-cell items collapses to an identity transform over the item list. Calling
* `getGridNavigatedIndex` directly keeps the cell-map helpers
* (`createGridCellMap`/`getGridCellIndexOfCorner`/`getGridCellIndices`) out of
* grid-combobox bundles.
*/
function gridNavigation(event, prevIndex, listRef, orientation, loopFocus, rtl, disabledIndices, minIndex, maxIndex, cols = 2) {
	const nextIndex = getGridNavigatedIndex(listRef.current, {
		event,
		orientation,
		loopFocus,
		rtl,
		cols,
		disabledIndices,
		minIndex,
		maxIndex,
		prevIndex: prevIndex > maxIndex ? minIndex : prevIndex,
		stopEvent: true
	});
	return isIndexOutOfListBounds(listRef.current, nextIndex) ? void 0 : nextIndex;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/getHighlightReason.mjs
/**
* The `onItemHighlighted` reason for a list navigation event, matching the event type that the
* reason promises in its details.
*/
function getHighlightReason(event) {
	if (event == null) return none;
	if (event.type.startsWith("key")) return keyboard;
	if (event.type.startsWith("mouse") || event.type.startsWith("pointer")) return pointer;
	return none;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/root/ComboboxRootContext.mjs
const ComboboxRootContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
ComboboxRootContext.displayName = "ComboboxRootContext";
const ComboboxFloatingContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
ComboboxFloatingContext.displayName = "ComboboxFloatingContext";
const ComboboxDerivedItemsContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
ComboboxDerivedItemsContext.displayName = "ComboboxDerivedItemsContext";
const ComboboxHasItemsContext = /*#__PURE__*/ import__wp_global_react.createContext(false);
ComboboxHasItemsContext.displayName = "ComboboxHasItemsContext";
const ComboboxInputValueContext = /*#__PURE__*/ import__wp_global_react.createContext("");
ComboboxInputValueContext.displayName = "ComboboxInputValueContext";
function useComboboxRootContext() {
	const context = import__wp_global_react.useContext(ComboboxRootContext);
	if (!context) throw new Error("Base UI: ComboboxRootContext is missing. Combobox parts must be placed within <Combobox.Root>.");
	return context;
}
function useComboboxFloatingContext() {
	const context = import__wp_global_react.useContext(ComboboxFloatingContext);
	if (!context) throw new Error("Base UI: ComboboxFloatingContext is missing. Combobox parts must be placed within <Combobox.Root>.");
	return context;
}
function useComboboxDerivedItemsContext() {
	const context = import__wp_global_react.useContext(ComboboxDerivedItemsContext);
	if (!context) throw new Error("Base UI: ComboboxItemsContext is missing. Combobox parts must be placed within <Combobox.Root>.");
	return context;
}
function useComboboxInputValueContext() {
	return import__wp_global_react.useContext(ComboboxInputValueContext);
}
function useComboboxHasItemsContext() {
	return import__wp_global_react.useContext(ComboboxHasItemsContext);
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/store.mjs
/**
* Non-reactive values shared with the combobox parts. Nothing here is observable through
* `selectors`, so writing to a ref never notifies subscribers.
*/
const selectors = {
	id: (state) => state.id,
	labelId: (state) => state.labelId,
	items: (state) => state.items,
	selectedValue: (state) => state.selectedValue,
	hasSelectionChips: (state) => {
		const selectedValue = state.selectedValue;
		return Array.isArray(selectedValue) && selectedValue.length > 0;
	},
	hasSelectedValue: (state) => {
		const { selectedValue, selectionMode } = state;
		if (selectedValue == null) return false;
		if (selectionMode === "multiple" && Array.isArray(selectedValue)) return selectedValue.length > 0;
		return true;
	},
	hasNullItemLabel: (state, enabled) => {
		return enabled ? hasNullItemLabel(state.items) : false;
	},
	open: (state) => state.open,
	mounted: (state) => state.mounted,
	forceMounted: (state) => state.forceMounted,
	inline: (state) => state.inline,
	activeIndex: (state) => state.activeIndex,
	selectedIndex: (state) => state.selectedIndex,
	isActive: (state, index) => state.activeIndex === index,
	isSelected: (state, itemValue) => {
		const comparer = state.isItemEqualToValue;
		const selectedValue = state.selectedValue;
		if (Array.isArray(selectedValue)) return selectedValue.some((selectedItem) => compareItemEquality(itemValue, selectedItem, comparer));
		return compareItemEquality(itemValue, selectedValue, comparer);
	},
	transitionStatus: (state) => state.transitionStatus,
	popupProps: (state) => state.popupProps,
	listProps: (state) => state.listProps,
	inputProps: (state) => state.inputProps,
	triggerProps: (state) => state.triggerProps,
	itemRoot: (state) => state.itemRoot,
	positionerElement: (state) => state.positionerElement,
	listElement: (state) => state.listElement,
	popupId: (state) => state.popupId,
	triggerElement: (state) => state.triggerElement,
	inputElement: (state) => state.inputElement,
	inputGroupElement: (state) => state.inputGroupElement,
	popupSide: (state) => state.popupSide,
	openMethod: (state) => state.openMethod,
	inputInsidePopup: (state) => state.inputInsidePopup,
	inputOwnsFormValue: (state) => state.inputOwnsFormValue,
	selectionMode: (state) => state.selectionMode,
	name: (state) => state.name,
	form: (state) => state.form,
	disabled: (state) => state.disabled,
	readOnly: (state) => state.readOnly,
	required: (state) => state.required,
	grid: (state) => state.grid,
	virtualized: (state) => state.virtualized,
	itemToStringLabel: (state) => state.itemToStringLabel,
	isItemEqualToValue: (state) => state.isItemEqualToValue,
	modal: (state) => state.modal,
	autoHighlight: (state) => state.autoHighlight
};

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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/root/utils/index.mjs
/**
* Enhanced filter using Intl.Collator for more robust string matching.
* Uses the provided `itemToStringLabel` function if available, otherwise falls back to:
* • When `item` is an object with a `value` property, that property is used.
* • When `item` is a primitive (e.g. `string`), it is used directly.
*/
function createCollatorItemFilter(collatorFilter, itemToStringLabel) {
	return (item, query) => {
		if (item == null) return false;
		return collatorFilter.contains(item, query, itemToStringLabel);
	};
}

// node_modules/.store/@base-ui/utils@0.5.0--7My7Lubseca8je9LSEweA/node_modules/@base-ui/utils/stringifyLocale.mjs
function stringifyLocale(locale) {
	if (Array.isArray(locale)) return locale.map((value) => stringifyLocale(value)).join(",");
	if (locale == null) return "";
	return String(locale);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/filter.mjs
const filterCache = /* @__PURE__ */ new Map();
function getFilter(options = {}) {
	const { locale, ...restOptions } = options;
	const collatorOptions = {
		usage: "search",
		sensitivity: "base",
		ignorePunctuation: true,
		...restOptions
	};
	const cacheKey = `${stringifyLocale(locale)}|${JSON.stringify(collatorOptions)}`;
	const cachedFilter = filterCache.get(cacheKey);
	if (cachedFilter) return cachedFilter;
	const collator = new Intl.Collator(locale, collatorOptions);
	const filter = {
		contains(item, query, itemToString) {
			if (!query) return true;
			const itemString = stringifyAsLabel(item, itemToString);
			for (let i = 0; i <= itemString.length - query.length; i += 1) if (collator.compare(itemString.slice(i, i + query.length), query) === 0) return true;
			return false;
		},
		startsWith(item, query, itemToString) {
			if (!query) return true;
			const itemString = stringifyAsLabel(item, itemToString);
			return collator.compare(itemString.slice(0, query.length), query) === 0;
		},
		endsWith(item, query, itemToString) {
			if (!query) return true;
			const itemString = stringifyAsLabel(item, itemToString);
			const queryLength = query.length;
			return itemString.length >= queryLength && collator.compare(itemString.slice(itemString.length - queryLength), query) === 0;
		}
	};
	filterCache.set(cacheKey, filter);
	return filter;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/root/utils/useFilter.mjs
/**
* Matches items against a query using `Intl.Collator` for robust string matching.
*/
const useCoreFilter = getFilter;

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/scrollable.mjs
function isScrollableY(element, allowOverflowIntent = false) {
	const { overflowY } = getComputedStyle(element);
	if (overflowY !== "auto" && overflowY !== "scroll") return false;
	return allowOverflowIntent ? element.clientHeight > 0 : element.scrollHeight > element.clientHeight;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/root/utils/constants.mjs
const NO_ACTIVE_VALUE = Symbol("none");
const INITIAL_LAST_HIGHLIGHT = {
	value: NO_ACTIVE_VALUE,
	index: -1
};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/direction-context/DirectionContext.mjs
const DirectionContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
DirectionContext.displayName = "DirectionContext";
function useDirection() {
	return import__wp_global_react.useContext(DirectionContext)?.direction ?? "ltr";
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/items/itemCollection.mjs
function findCollectionItem(valueToItem, itemValue, isEqual) {
	const exactItem = valueToItem.get(itemValue);
	if (exactItem !== void 0 || isEqual === defaultItemEquality) return exactItem;
	for (const [derivedValue, item] of valueToItem) if (compareItemEquality(derivedValue, itemValue, isEqual)) return item;
}
/**
* An opaque collection created by `createItems()`.
*
* It carries the source item and derived value types so the root can infer the list item and
* selection value types.
*
* Pass it directly to the root's `items` prop; it has no public members.
*/
/**
* Internal shape of a collection. The extra members let the root project items to
* their values and resolve a selected value back to its label while items are unmounted.
*/
// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/root/AriaCombobox.mjs
/**
* @internal
*/
function AriaCombobox(props) {
	const { id: idProp, onOpenChangeComplete: onOpenChangeCompleteProp, defaultSelectedValue = null, selectedValue: selectedValueProp, onSelectedValueChange, defaultInputValue, inputValue: inputValueProp, open: openProp, defaultOpen = false, selectionMode, onItemHighlighted: onItemHighlightedProp, name: nameProp, form, disabled: disabledProp = false, readOnly = false, required = false, inputRef: inputRefProp, grid = false, items: itemsProp, filteredItems: filteredItemsProp, filter: filterProp, filterQuery: filterQueryProp, openOnInputClick = true, autoHighlight = false, keepHighlight = false, highlightItemOnHover = true, loopFocus = true, itemToStringLabel: itemToStringLabelProp, itemToStringValue, isItemEqualToValue = defaultItemEquality, virtualized = false, inline: inlineProp = false, fillInputOnItemPress = true, modal = false, limit = -1, autoComplete = "list", formAutoComplete, locale, submitOnItemClick = false } = props;
	const { clearErrors } = useFormContext();
	const { setDirty, validityData, setFilled, name: fieldName, disabled: fieldDisabled, setTouched, setFocused, validationMode, validation } = useFieldRootContext();
	const direction = useDirection();
	const id = useLabelableId({ id: idProp });
	const collatorFilter = useCoreFilter({ locale });
	const collection = Array.isArray(itemsProp) ? null : itemsProp;
	if (collection && typeof collection.label !== "function") throw new Error("Base UI: the `items` prop received an object that is not a collection, so its items cannot be read. Pass an array of items, an array of groups with items, or the result of `createItems()`. See https://base-ui.com/react/components/combobox#createitems");
	const items = collection ? collection.data : itemsProp;
	const itemToValue = collection?.value;
	const storeItems = itemToValue ? void 0 : items;
	const externalWindow = import__wp_global_react.useMemo(() => {
		if (!filteredItemsProp || !itemToValue) return;
		const flat = flattenLeafItems(filteredItemsProp);
		const values = flat.map(itemToValue);
		let valueToItem;
		return {
			values,
			findItem(itemValue, isEqual) {
				if (!valueToItem) {
					valueToItem = /* @__PURE__ */ new Map();
					for (let i = 0; i < values.length; i += 1) if (!valueToItem.has(values[i])) valueToItem.set(values[i], flat[i]);
				}
				return findCollectionItem(valueToItem, itemValue, isEqual);
			}
		};
	}, [filteredItemsProp, itemToValue]);
	const itemToStringLabel = import__wp_global_react.useMemo(() => {
		if (!collection) return itemToStringLabelProp;
		return (itemValue) => {
			return collection.label(itemValue, isItemEqualToValue, (unresolvedValue) => {
				const externalItem = externalWindow?.findItem(unresolvedValue, isItemEqualToValue);
				if (externalItem != null) return collection.itemLabel(externalItem);
				return stringifyAsLabel(unresolvedValue, itemToStringLabelProp);
			});
		};
	}, [
		collection,
		itemToStringLabelProp,
		externalWindow,
		isItemEqualToValue
	]);
	const filterItemToString = import__wp_global_react.useMemo(() => {
		if (!collection) return itemToStringLabelProp;
		return Object.assign((item) => collection.itemLabel(item), { selected: (value) => stringifyAsLabel(value, itemToStringLabel) });
	}, [
		collection,
		itemToStringLabel,
		itemToStringLabelProp
	]);
	function stringifyValueLabel(item) {
		return stringifyAsLabel(item, itemToStringLabel);
	}
	const [queryChangedAfterOpen, setQueryChangedAfterOpen] = import__wp_global_react.useState(false);
	const [closeQuery, setCloseQuery] = import__wp_global_react.useState(null);
	const previousCloseQueryRef = import__wp_global_react.useRef(closeQuery);
	const listRef = import__wp_global_react.useRef([]);
	const labelsRef = import__wp_global_react.useRef([]);
	const popupRef = import__wp_global_react.useRef(null);
	const inputRef = import__wp_global_react.useRef(null);
	const startDismissRef = import__wp_global_react.useRef(null);
	const endDismissRef = import__wp_global_react.useRef(null);
	const emptyRef = import__wp_global_react.useRef(null);
	const hadInputClearRef = import__wp_global_react.useRef(false);
	const chipsContainerRef = import__wp_global_react.useRef(null);
	const clearRef = import__wp_global_react.useRef(null);
	const selectionEventRef = import__wp_global_react.useRef(null);
	const lastHighlightRef = import__wp_global_react.useRef(INITIAL_LAST_HIGHLIGHT);
	const pendingQueryHighlightRef = import__wp_global_react.useRef(null);
	/**
	* Contains the currently visible list of item values post-filtering.
	*/
	const valuesRef = import__wp_global_react.useRef([]);
	/**
	* The item element that received the last `pointerdown`, used to detect whether a
	* `mouseup` on an item belongs to a drag-select gesture that started elsewhere.
	*/
	const pointerDownItemRef = import__wp_global_react.useRef(null);
	const disabled = fieldDisabled || disabledProp;
	const name = fieldName ?? nameProp;
	const multiple = selectionMode === "multiple";
	const single = selectionMode === "single";
	const hasInputValue = inputValueProp !== void 0 || defaultInputValue !== void 0;
	const hasItems = items !== void 0;
	const hasFilteredItemsProp = filteredItemsProp !== void 0;
	let autoHighlightMode;
	if (autoHighlight === "always") autoHighlightMode = "always";
	else autoHighlightMode = autoHighlight ? "input-change" : false;
	const [selectedValue, setSelectedValueUnwrapped] = useControlled({
		controlled: selectedValueProp,
		default: multiple ? defaultSelectedValue ?? EMPTY_ARRAY$1 : defaultSelectedValue,
		name: "Combobox",
		state: "selectedValue"
	});
	const filter = import__wp_global_react.useMemo(() => {
		if (filterProp === null) return () => true;
		if (filterProp !== void 0) return filterProp;
		return createCollatorItemFilter(collatorFilter, filterItemToString);
	}, [
		filterProp,
		collatorFilter,
		filterItemToString
	]);
	const initialDefaultInputValue = useRefWithInit(() => {
		if (hasInputValue) return defaultInputValue ?? "";
		if (single) return stringifyValueLabel(selectedValue);
		return "";
	}).current;
	const [inputValue, setInputValueUnwrapped] = useControlled({
		controlled: inputValueProp,
		default: initialDefaultInputValue,
		name: "Combobox",
		state: "inputValue"
	});
	const [open, setOpenUnwrapped] = useControlled({
		controlled: openProp,
		default: defaultOpen,
		name: "Combobox",
		state: "open"
	});
	const isGrouped = isGroupedItems(items);
	const query = !open && closeQuery !== null ? closeQuery : String(inputValue).trim();
	const selectedLabelString = single ? stringifyValueLabel(selectedValue) : "";
	const shouldBypassFiltering = single && !queryChangedAfterOpen && query !== "" && selectedLabelString.length === query.length && collatorFilter.contains(selectedLabelString, query);
	const filterQuery = shouldBypassFiltering ? "" : filterQueryProp ?? query;
	const shouldIgnoreExternalFiltering = hasItems && hasFilteredItemsProp && shouldBypassFiltering && (!collection || collection.hasValue(selectedValue, isItemEqualToValue));
	const flatItems = import__wp_global_react.useMemo(() => items ? flattenLeafItems(items) : EMPTY_ARRAY$1, [items]);
	const filteredItems = import__wp_global_react.useMemo(() => {
		if (filteredItemsProp && !shouldIgnoreExternalFiltering) return filteredItemsProp;
		if (!items) return EMPTY_ARRAY$1;
		if (isGrouped) {
			const groupedItems = items;
			const resultingGroups = [];
			let currentCount = 0;
			for (const group of groupedItems) {
				if (limit > -1 && currentCount >= limit) break;
				const remainingLimit = limit > -1 ? limit - currentCount : Infinity;
				const itemsToTake = filterQuery === "" ? group.items.slice(0, remainingLimit) : [];
				if (filterQuery !== "") for (const item of group.items) {
					if (itemsToTake.length >= remainingLimit) break;
					if (filter(item, filterQuery, filterItemToString)) itemsToTake.push(item);
				}
				if (itemsToTake.length > 0) {
					const newGroup = {
						...group,
						items: itemsToTake
					};
					resultingGroups.push(newGroup);
					currentCount += itemsToTake.length;
				}
			}
			return resultingGroups;
		}
		if (filterQuery === "") return limit > -1 ? flatItems.slice(0, limit) : flatItems;
		const limitedItems = [];
		for (const item of flatItems) {
			if (limit > -1 && limitedItems.length >= limit) break;
			if (filter(item, filterQuery, filterItemToString)) limitedItems.push(item);
		}
		return limitedItems;
	}, [
		filteredItemsProp,
		shouldIgnoreExternalFiltering,
		items,
		isGrouped,
		filterQuery,
		limit,
		filter,
		filterItemToString,
		flatItems
	]);
	/**
	* The filtered items flattened across groups and projected to their selection values.
	*/
	const flatFilteredValues = import__wp_global_react.useMemo(() => {
		if (externalWindow && filteredItems === filteredItemsProp) return externalWindow.values;
		const flat = flattenLeafItems(filteredItems);
		return itemToValue ? flat.map((item) => itemToValue(item)) : flat;
	}, [
		filteredItems,
		filteredItemsProp,
		externalWindow,
		itemToValue
	]);
	const store = useRefWithInit(() => {
		let initialSelectedIndex = null;
		if (inlineProp && open && hasItems && selectionMode !== "none") initialSelectedIndex = findSelectionIndex(flatFilteredValues, selectedValue, isItemEqualToValue, multiple);
		return new ReactStore({
			id,
			labelId: void 0,
			selectedValue,
			open,
			items: storeItems,
			selectionMode,
			name,
			form,
			disabled,
			readOnly,
			required,
			grid,
			virtualized,
			openOnInputClick,
			itemToStringLabel,
			isItemEqualToValue,
			modal,
			autoHighlight: autoHighlightMode,
			submitOnItemClick,
			hasInputValue,
			mounted: false,
			forceMounted: false,
			transitionStatus: "idle",
			inline: inlineProp,
			activeIndex: null,
			selectedIndex: initialSelectedIndex,
			popupProps: {},
			listProps: {},
			inputProps: {},
			triggerProps: {},
			itemRoot: {
				props: EMPTY_OBJECT,
				id,
				selectionMode,
				disabled,
				readOnly,
				isItemEqualToValue
			},
			positionerElement: null,
			listElement: null,
			popupId: void 0,
			triggerElement: null,
			inputElement: null,
			inputGroupElement: null,
			popupSide: null,
			openMethod: null,
			inputInsidePopup: true,
			inputOwnsFormValue: selectionMode === "none"
		}, {
			onOpenChangeComplete: NOOP,
			setOpen: NOOP,
			setInputValue: NOOP,
			setSelectedValue: NOOP,
			setIndices: NOOP,
			handleSelection: NOOP,
			forceMount: NOOP,
			requestSubmit: NOOP,
			listRef,
			labelsRef,
			popupRef,
			emptyRef,
			inputRef,
			startDismissRef,
			endDismissRef,
			chipsContainerRef,
			clearRef,
			valuesRef,
			pointerDownItemRef,
			selectionEventRef
		}, selectors);
	}).current;
	const fieldRawValue = selectionMode === "none" ? inputValue : selectedValue;
	const fieldStringValue = import__wp_global_react.useMemo(() => {
		if (selectionMode === "none") return fieldRawValue;
		if (Array.isArray(selectedValue)) return selectedValue.map((value) => stringifyAsValue(value, itemToStringValue));
		return stringifyAsValue(selectedValue, itemToStringValue);
	}, [
		fieldRawValue,
		itemToStringValue,
		selectionMode,
		selectedValue
	]);
	const onItemHighlighted = useStableCallback(onItemHighlightedProp);
	const onOpenChangeComplete = useStableCallback(onOpenChangeCompleteProp);
	const activeIndex = store.useState("activeIndex");
	const selectedIndex = store.useState("selectedIndex");
	const positionerElement = store.useState("positionerElement");
	const listElement = store.useState("listElement");
	const triggerElement = store.useState("triggerElement");
	const inputElement = store.useState("inputElement");
	const inputGroupElement = store.useState("inputGroupElement");
	const inline = store.useState("inline");
	const inputInsidePopup = store.useState("inputInsidePopup");
	const inputOwnsFormValue = store.useState("inputOwnsFormValue");
	const inputMatchesSelectedValue = single && !inputInsidePopup && inputValue === selectedLabelString;
	const triggerRef = useValueAsRef(triggerElement);
	const { openMethod, triggerProps } = useOpenInteractionType(open);
	const getStringifiedValueForForm = useStableCallback(() => fieldStringValue);
	useRegisterFieldControl(inputInsidePopup ? triggerRef : inputRef, id, fieldRawValue, getStringifiedValueForForm, !disabled, nameProp);
	const forceMount = useStableCallback(() => {
		if (items) labelsRef.current = flatFilteredValues.map(stringifyValueLabel);
		else store.set("forceMounted", true);
	});
	/**
	* Emits `onItemHighlighted` for the item at `index`, or clears the highlight when `index` is `-1`
	* (a no-op if nothing was highlighted). Keeps `lastHighlightRef` in sync with what was emitted.
	*/
	const emitHighlight = useStableCallback((value, index, type, event) => {
		if (index === -1) {
			if (lastHighlightRef.current === INITIAL_LAST_HIGHLIGHT) return;
			lastHighlightRef.current = INITIAL_LAST_HIGHLIGHT;
		} else lastHighlightRef.current = {
			value,
			index
		};
		onItemHighlighted(value, createGenericEventDetails(type, event, { index }));
	});
	const setIndices = useStableCallback((options) => {
		const update = {};
		if (options.activeIndex !== void 0) update.activeIndex = options.activeIndex;
		if (options.selectedIndex !== void 0) update.selectedIndex = options.selectedIndex;
		store.update(update);
		const activeIndexOption = options.activeIndex;
		if (activeIndexOption === void 0) return;
		const type = options.type || "none";
		if (activeIndexOption === null) emitHighlight(void 0, -1, type, options.event);
		else emitHighlight(valuesRef.current[activeIndexOption], activeIndexOption, type, options.event);
	});
	const setInputValue = useStableCallback((next, eventDetails) => {
		props.onInputValueChange?.(next, eventDetails);
		if (eventDetails.isCanceled) return;
		hadInputClearRef.current = eventDetails.reason === inputClear;
		if (eventDetails.reason === "input-change") {
			if (open && closeQuery !== null) setCloseQuery(null);
			const event = eventDetails.event;
			const inputType = event.inputType;
			if (event.type === "compositionend" || inputType != null && inputType !== "" && inputType !== "insertReplacementText") {
				const hasQuery = next.trim() !== "";
				if (hasQuery) setQueryChangedAfterOpen(true);
				pendingQueryHighlightRef.current = { hasQuery };
				const list = store.state.listElement;
				if (!store.state.virtualized && list) {
					const popup = popupRef.current;
					for (const ancestor of getOverflowAncestors(list.firstElementChild ?? list)) {
						if (!isHTMLElement(ancestor) || (popup ? !contains(popup, ancestor) : ancestor.getAttribute("role") === "dialog")) break;
						if (isScrollableY(ancestor)) {
							ancestor.scrollTop = 0;
							break;
						}
					}
				}
				if (hasQuery && autoHighlightMode && store.state.activeIndex == null && (open || inline)) store.set("activeIndex", 0);
			}
		} else if (eventDetails.reason === "input-clear" && next === "" && store.state.inputInsidePopup) pendingQueryHighlightRef.current = {
			hasQuery: false,
			selection: true
		};
		setInputValueUnwrapped(next);
	});
	const handleInterruptedReopen = useStableCallback((isInputChange) => {
		const clearsPendingInput = !isInputChange && inputInsidePopup && !inline && inputValue !== "" && (String(inputValue).trim() === closeQuery || inputValue === selectedLabelString);
		if (!isInputChange && (clearsPendingInput || inputValue === "" || inputMatchesSelectedValue)) setQueryChangedAfterOpen(false);
		setCloseQuery(null);
		if (clearsPendingInput) setInputValue("", createChangeEventDetails(inputClear));
	});
	const [preventUnmountOnClose, setPreventUnmountOnClose] = import__wp_global_react.useState(false);
	const setOpen = useStableCallback((nextOpen, eventDetails) => {
		if (open === nextOpen) return;
		if (eventDetails.reason === "escape-key" && hasItems && flatFilteredValues.length === 0 && !emptyRef.current) eventDetails.allowPropagation();
		const openEventDetails = eventDetails;
		const shouldPreventUnmountOnClose = attachPreventUnmountOnClose(openEventDetails);
		props.onOpenChange?.(nextOpen, openEventDetails);
		if (pendingQueryHighlightRef.current?.hasQuery && eventDetails.reason === "input-change" === eventDetails.isCanceled) pendingQueryHighlightRef.current = null;
		if (eventDetails.isCanceled) return;
		if (nextOpen && closeQuery !== null) handleInterruptedReopen(eventDetails.reason === inputChange);
		if (!nextOpen && queryChangedAfterOpen) {
			if (single) {
				if (!inline) setCloseQuery(query);
				if (query === "") setQueryChangedAfterOpen(false);
			} else if (multiple) {
				if (!inline) setCloseQuery(query);
				if (inputInsidePopup) setIndices({ activeIndex: null });
				if (!inputInsidePopup || inline) setInputValue("", createChangeEventDetails(inputClear, eventDetails.event, void 0, { isItemPress: eventDetails.reason === itemPress }));
			}
		}
		if (!nextOpen) setPreventUnmountOnClose(shouldPreventUnmountOnClose());
		setOpenUnwrapped(nextOpen);
		if (!nextOpen && inputInsidePopup && (eventDetails.reason === "focus-out" || eventDetails.reason === "outside-press")) {
			setTouched(true);
			setFocused(false);
			if (validationMode === "onBlur") {
				const valueToValidate = selectionMode === "none" ? inputValue : selectedValue;
				validation.commit(valueToValidate);
			}
		}
	});
	const setSelectedValue = useStableCallback((nextValue, eventDetails) => {
		onSelectedValueChange?.(nextValue, eventDetails);
		if (eventDetails.isCanceled) return;
		setSelectedValueUnwrapped(nextValue);
		if (selectionMode === "none" && popupRef.current && fillInputOnItemPress || single && !store.state.inputInsidePopup) setInputValue(stringifyValueLabel(nextValue), createChangeEventDetails(eventDetails.reason, eventDetails.event));
	});
	const handleSelection = useStableCallback((event, itemValue) => {
		const targetEl = getTarget(event);
		const overrideEvent = selectionEventRef.current ?? event;
		selectionEventRef.current = null;
		const eventDetails = createChangeEventDetails(itemPress, overrideEvent);
		const href = closest(targetEl, "a")?.getAttribute("href");
		if (href) {
			if (href.startsWith("#")) setOpen(false, eventDetails);
			return;
		}
		if (multiple) {
			const currentSelectedValue = Array.isArray(selectedValue) ? selectedValue : [];
			const isCurrentlySelected = selectedValueIncludes(currentSelectedValue, itemValue, isItemEqualToValue);
			const nextValue = isCurrentlySelected ? removeItem(currentSelectedValue, itemValue, isItemEqualToValue) : [...currentSelectedValue, itemValue];
			setSelectedValue(nextValue, eventDetails);
			if (eventDetails.isCanceled) return;
			if (!(inputRef.current ? inputRef.current.value.trim() !== "" : false)) return;
			if (store.state.inputInsidePopup) {
				setInputValue("", createChangeEventDetails(inputClear, eventDetails.event, void 0, { isItemPress: true }));
				const pendingHighlight = pendingQueryHighlightRef.current;
				if (pendingHighlight && !isCurrentlySelected) pendingHighlight.toggledValue = itemValue;
			} else setOpen(false, eventDetails);
		} else {
			setSelectedValue(itemValue, eventDetails);
			if (eventDetails.isCanceled) return;
			setOpen(false, eventDetails);
		}
	});
	const requestSubmit = useStableCallback(() => {
		const formElement = validation.inputRef.current?.form ?? store.state.inputElement?.form;
		if (formElement && typeof formElement.requestSubmit === "function") formElement.requestSubmit();
	});
	const handleUnmountCleanup = useStableCallback(() => {
		onOpenChangeComplete?.(false);
		setQueryChangedAfterOpen(false);
		setCloseQuery(null);
		if (selectionMode === "none") setIndices({
			activeIndex: null,
			selectedIndex: null
		});
		else setIndices({ activeIndex: null });
		if (multiple && inputRef.current && inputRef.current.value !== "" && !hadInputClearRef.current) setInputValue("", createChangeEventDetails(inputClear));
		if (single) {
			if (store.state.inputInsidePopup) {
				if (inputRef.current && inputRef.current.value !== "") setInputValue("", createChangeEventDetails(inputClear));
			} else {
				const stringVal = stringifyValueLabel(selectedValue);
				if (inputRef.current && inputRef.current.value !== stringVal) {
					const reason = stringVal === "" ? inputClear : none;
					setInputValue(stringVal, createChangeEventDetails(reason));
				}
			}
		}
	});
	const resolvedPopupRef = import__wp_global_react.useMemo(() => {
		if (inline && positionerElement) return { current: closest(positionerElement, "[role=\"dialog\"]") };
		return popupRef;
	}, [inline, positionerElement]);
	const { mounted, transitionStatus, forceUnmount: handleUnmount } = useUnmountAfterClose({
		open,
		ref: resolvedPopupRef,
		preventUnmountOnClose,
		setPreventUnmountOnClose,
		onUnmount: handleUnmountCleanup
	});
	import__wp_global_react.useImperativeHandle(props.actionsRef, () => ({
		unmount: handleUnmount,
		close: () => setOpen(false, createChangeEventDetails(imperativeAction))
	}), [handleUnmount, setOpen]);
	useIsoLayoutEffect(function syncSelectedIndex() {
		const closeQueryReleased = previousCloseQueryRef.current !== null && closeQuery === null;
		previousCloseQueryRef.current = closeQuery;
		if (open && (!closeQueryReleased || !hasItems)) return;
		if (!open) pointerDownItemRef.current = null;
		if (selectionMode === "none") return;
		const registry = hasItems ? flatFilteredValues : valuesRef.current;
		setIndices({ selectedIndex: findSelectionIndex(registry, selectedValue, isItemEqualToValue, multiple) });
	}, [
		open,
		closeQuery,
		selectedValue,
		selectionMode,
		multiple,
		hasItems,
		flatFilteredValues,
		isItemEqualToValue,
		setIndices
	]);
	useIsoLayoutEffect(() => {
		if (items) {
			valuesRef.current = flatFilteredValues;
			listRef.current.length = flatFilteredValues.length;
		}
	}, [items, flatFilteredValues]);
	useIsoLayoutEffect(() => {
		if (!open && pendingQueryHighlightRef.current?.hasQuery) pendingQueryHighlightRef.current = null;
	}, [open]);
	useIsoLayoutEffect(() => {
		if (!open && inline && resolvedPopupRef.current) {
			pendingQueryHighlightRef.current = null;
			return;
		}
		const candidateItems = hasItems || hasFilteredItemsProp ? flatFilteredValues : valuesRef.current;
		const pendingHighlight = pendingQueryHighlightRef.current;
		if (pendingHighlight) {
			const listIsNavigable = open || inline || store.state.positionerElement?.hidden === false;
			if (pendingHighlight.hasQuery) {
				const input = inputRef.current;
				if (!autoHighlightMode || String(inputValue).trim() === "" || inline && autoHighlightMode !== "always" && (!input || activeElement(input.ownerDocument) !== input)) pendingQueryHighlightRef.current = null;
				else if (listIsNavigable && (candidateItems[0] !== void 0 || !hasItems && !hasFilteredItemsProp)) {
					store.set("activeIndex", 0);
					pendingQueryHighlightRef.current = null;
				}
			} else if (String(inputValue).trim() === "") {
				pendingQueryHighlightRef.current = null;
				if (listIsNavigable) {
					const clearedBySelection = pendingHighlight.selection;
					if (autoHighlightMode === "always" && !clearedBySelection && store.state.selectionMode === "none") store.set("activeIndex", 0);
					queueMicrotask(() => {
						if (!store.state.open && (!store.state.inline || resolvedPopupRef.current) || inputRef.current && inputRef.current.value.trim() !== "") return;
						const currentSelectedValue = store.state.selectedValue;
						const isMultiple = store.state.selectionMode === "multiple";
						if (isMultiple && Array.isArray(currentSelectedValue) ? currentSelectedValue.length > 0 : store.state.selectionMode !== "none" && currentSelectedValue != null) {
							const registry = hasItems || hasFilteredItemsProp ? flatFilteredValues : valuesRef.current;
							const toggledIndex = findItemIndex(registry, pendingHighlight.toggledValue, store.state.isItemEqualToValue);
							store.set("activeIndex", toggledIndex !== -1 ? toggledIndex : findSelectionIndex(registry, currentSelectedValue, store.state.isItemEqualToValue, isMultiple));
						} else if (clearedBySelection) store.set("activeIndex", null);
						else if (autoHighlightMode === "always") store.set("activeIndex", 0);
					});
				}
			}
		}
		if (!open && !inline) return;
		const storeActiveIndex = store.state.activeIndex;
		if (storeActiveIndex == null) {
			if (autoHighlightMode === "always" && candidateItems.length > 0) {
				store.set("activeIndex", 0);
				return;
			}
			emitHighlight(void 0, -1, none);
			return;
		}
		if (storeActiveIndex >= candidateItems.length) {
			emitHighlight(void 0, -1, none);
			store.set("activeIndex", null);
			return;
		}
		const itemValue = candidateItems[storeActiveIndex];
		const previouslyHighlightedItemValue = lastHighlightRef.current.value;
		const isSameItem = previouslyHighlightedItemValue !== NO_ACTIVE_VALUE && compareItemEquality(itemValue, previouslyHighlightedItemValue, store.state.isItemEqualToValue);
		if (lastHighlightRef.current.index !== storeActiveIndex || !isSameItem) emitHighlight(itemValue, storeActiveIndex, none);
	}, [
		activeIndex,
		autoHighlightMode,
		emitHighlight,
		hasFilteredItemsProp,
		hasItems,
		flatFilteredValues,
		inline,
		open,
		resolvedPopupRef,
		store,
		inputValue
	]);
	useIsoLayoutEffect(() => {
		if (selectionMode === "none") {
			setFilled(String(inputValue) !== "");
			return;
		}
		setFilled(multiple ? Array.isArray(selectedValue) && selectedValue.length > 0 : selectedValue != null);
	}, [
		setFilled,
		selectionMode,
		inputValue,
		selectedValue,
		multiple
	]);
	import__wp_global_react.useEffect(() => {
		if (hasItems && autoHighlightMode && flatFilteredValues.length === 0) setIndices({ activeIndex: null });
	}, [
		hasItems,
		autoHighlightMode,
		flatFilteredValues.length,
		setIndices
	]);
	function handleQueryChanged() {
		if (open && query !== "" && query !== String(initialDefaultInputValue) && !inputMatchesSelectedValue) setQueryChangedAfterOpen(true);
	}
	function handleOpenChanged() {
		if (open && closeQuery !== null) handleInterruptedReopen(false);
	}
	let syncedSelectedLabel = false;
	function syncInputToSelectedLabel() {
		if (!syncedSelectedLabel && inputValue !== selectedLabelString) {
			syncedSelectedLabel = true;
			setInputValue(selectedLabelString, createChangeEventDetails(none));
		}
	}
	function handleSelectedValueChanged() {
		if (selectionMode === "none") return;
		clearErrors(name);
		setDirty(isSelectedValueDirty(selectedValue, validityData.initialValue, isItemEqualToValue));
		validation.change(selectedValue);
		if (single && !hasInputValue && !inputInsidePopup) syncInputToSelectedLabel();
	}
	function syncInputAfterItemsOrLabelChange() {
		if (single && !hasInputValue && !inputInsidePopup && !queryChangedAfterOpen) syncInputToSelectedLabel();
	}
	function handleInputValueChanged() {
		if (selectionMode !== "none") return;
		clearErrors(name);
		setDirty(inputValue !== validityData.initialValue);
		validation.change(inputValue);
	}
	useValueChanged(query, handleQueryChanged);
	useValueChanged(open, handleOpenChanged);
	useValueChanged(selectedValue, handleSelectedValueChanged);
	useValueChanged(selectedLabelString, syncInputAfterItemsOrLabelChange);
	useValueChanged(items, syncInputAfterItemsOrLabelChange);
	useValueChanged(inputValue, handleInputValueChanged);
	const floatingRootContext = useFloatingRootContext({
		open: inline ? true : open,
		onOpenChange: setOpen,
		elements: {
			reference: inputInsidePopup ? triggerElement : inputElement,
			floating: positionerElement
		}
	});
	const ariaHasPopup = grid ? "grid" : "listbox";
	const expanded = open || inline;
	const ariaExpanded = expanded ? "true" : "false";
	const role = import__wp_global_react.useMemo(() => {
		const isPlainInput = inputElement?.tagName === "INPUT";
		const shouldTreatAsInput = inputElement == null || isPlainInput;
		const shouldApplyAria = shouldTreatAsInput || expanded;
		const reference = shouldTreatAsInput ? {
			autoComplete: "off",
			spellCheck: "false",
			autoCorrect: "off",
			autoCapitalize: "none"
		} : {};
		if (shouldApplyAria) {
			reference.role = "combobox";
			reference["aria-expanded"] = ariaExpanded;
			reference["aria-haspopup"] = ariaHasPopup;
			reference["aria-controls"] = expanded ? listElement?.id : void 0;
			reference["aria-autocomplete"] = readOnly ? "none" : autoComplete;
		}
		return {
			reference,
			floating: { role: "presentation" }
		};
	}, [
		inputElement,
		expanded,
		ariaExpanded,
		ariaHasPopup,
		listElement?.id,
		autoComplete,
		readOnly
	]);
	const click = useClick(floatingRootContext, {
		enabled: !disabled && openOnInputClick,
		event: "mousedown-only",
		toggle: false,
		touchOpenDelay: inputInsidePopup ? 0 : 100,
		reason: inputPress
	});
	const dismiss = useDismiss(floatingRootContext, {
		enabled: !disabled && !inline,
		outsidePressEvent: {
			mouse: "sloppy",
			touch: "intentional"
		},
		bubbles: inline ? true : void 0,
		outsidePress(event) {
			const target = getTarget(event);
			return !contains(triggerElement, target) && !contains(clearRef.current, target) && !contains(chipsContainerRef.current, target) && !contains(inputGroupElement, target);
		}
	});
	const listNavigation = useListNavigation(floatingRootContext, {
		enabled: !disabled,
		id,
		listRef,
		activeIndex,
		selectedIndex,
		virtual: true,
		loopFocus,
		allowEscape: loopFocus && !autoHighlightMode,
		focusItemOnOpen: queryChangedAfterOpen || selectionMode === "none" && !autoHighlightMode ? false : "auto",
		focusItemOnHover: highlightItemOnHover,
		resetOnPointerLeave: !keepHighlight,
		orientation: grid ? "horizontal" : void 0,
		rtl: direction === "rtl",
		disabledIndices: EMPTY_ARRAY$1,
		grid: grid ? gridNavigation : void 0,
		onNavigate(nextActiveIndex, event) {
			if (!event && !open && !(inline && nextActiveIndex === null) || transitionStatus === "ending") return;
			setIndices({
				activeIndex: nextActiveIndex,
				type: getHighlightReason(event),
				event: event?.nativeEvent
			});
		}
	});
	const inputProps = import__wp_global_react.useMemo(() => mergeProps(listNavigation.reference, { onKeyDown(event) {
		if (grid && store.state.activeIndex == null && (event.key === "ArrowLeft" || event.key === "ArrowRight")) event.preventBaseUIHandler();
	} }, dismiss.reference, click.reference, role.reference), [
		listNavigation.reference,
		dismiss.reference,
		click.reference,
		role.reference,
		grid,
		store
	]);
	const popupProps = import__wp_global_react.useMemo(() => mergeProps(FOCUSABLE_POPUP_PROPS, dismiss.floating), [dismiss.floating]);
	const listProps = import__wp_global_react.useMemo(() => mergeProps(listNavigation.floating, role.floating), [listNavigation.floating, role.floating]);
	const itemRoot = import__wp_global_react.useMemo(() => {
		const listNavigationItemProps = listNavigation.item;
		return {
			props: listNavigationItemProps ? {
				...listNavigationItemProps,
				onFocus: void 0
			} : EMPTY_OBJECT,
			id,
			selectionMode,
			disabled,
			readOnly,
			isItemEqualToValue
		};
	}, [
		listNavigation.item,
		id,
		selectionMode,
		disabled,
		readOnly,
		isItemEqualToValue
	]);
	store.useContextCallback("setOpen", setOpen);
	store.useContextCallback("setInputValue", setInputValue);
	store.useContextCallback("setSelectedValue", setSelectedValue);
	store.useContextCallback("setIndices", setIndices);
	store.useContextCallback("handleSelection", handleSelection);
	store.useContextCallback("forceMount", forceMount);
	store.useContextCallback("requestSubmit", requestSubmit);
	store.useContextCallback("onOpenChangeComplete", onOpenChangeCompleteProp);
	useOnFirstRender(() => {
		store.update({
			inline: inlineProp,
			popupProps,
			listProps,
			inputProps,
			triggerProps,
			itemRoot
		});
	});
	const syncedValues = {
		id,
		selectedValue,
		open,
		mounted,
		transitionStatus,
		items: storeItems,
		inline: inlineProp,
		popupProps,
		listProps,
		inputProps,
		triggerProps,
		itemRoot,
		openMethod,
		selectionMode,
		name,
		form,
		disabled,
		readOnly,
		required,
		grid,
		virtualized,
		openOnInputClick,
		itemToStringLabel,
		modal,
		autoHighlight: autoHighlightMode,
		isItemEqualToValue,
		submitOnItemClick,
		hasInputValue
	};
	useIsoLayoutEffect(() => {
		store.update({
			...syncedValues,
			inputOwnsFormValue: selectionMode === "none" && (inlineProp || !store.state.inputInsidePopup)
		});
	}, [store, ...Object.values(syncedValues)]);
	const hiddenInputRef = useMergedRefs(inputRefProp, validation.inputRef);
	const itemsContextValue = import__wp_global_react.useMemo(() => ({
		query,
		hasItems,
		filteredItems,
		flatFilteredValues
	}), [
		query,
		hasItems,
		filteredItems,
		flatFilteredValues
	]);
	const serializedValue = import__wp_global_react.useMemo(() => {
		if (Array.isArray(fieldRawValue)) return "";
		return stringifyAsValue(fieldRawValue, itemToStringValue);
	}, [fieldRawValue, itemToStringValue]);
	const hasMultipleSelection = multiple && Array.isArray(selectedValue) && selectedValue.length > 0;
	const hiddenInputName = multiple || selectionMode === "none" && inputOwnsFormValue ? void 0 : name;
	const hiddenInputs = import__wp_global_react.useMemo(() => {
		if (!multiple || !Array.isArray(selectedValue) || !name) return null;
		return selectedValue.map((value) => {
			const currentSerializedValue = stringifyAsValue(value, itemToStringValue);
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
		selectedValue,
		form,
		name,
		itemToStringValue,
		disabled
	]);
	const children = /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import__wp_global_react.Fragment, { children: [
		props.children,
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)("input", {
			...validation.getValidationProps(disabled, {
				onFocus() {
					if (inputInsidePopup) {
						triggerElement?.focus();
						return;
					}
					(inputRef.current || triggerElement)?.focus();
				},
				onChange(event) {
					if (event.nativeEvent.defaultPrevented || disabled || readOnly) return;
					const nextValue = event.currentTarget.value;
					const nextValueLower = nextValue.toLowerCase();
					const details = createChangeEventDetails(none, event.nativeEvent);
					const findSerializedMatchIndex = () => valuesRef.current.findIndex((candidate) => stringifyAsValue(candidate, itemToStringValue).toLowerCase() === nextValueLower || stringifyValueLabel(candidate).toLowerCase() === nextValueLower);
					function handleChange() {
						if (multiple) return;
						if (selectionMode === "none") {
							setInputValue(nextValue, details);
							return;
						}
						let matchingIndex = findSerializedMatchIndex();
						if (matchingIndex === -1) matchingIndex = valuesRef.current.findIndex((_, index) => {
							const renderedLabel = labelsRef.current[index];
							return renderedLabel != null && renderedLabel.toLowerCase() === nextValueLower;
						});
						const matchingValue = matchingIndex === -1 ? void 0 : valuesRef.current[matchingIndex];
						if (matchingValue != null) setSelectedValue?.(matchingValue, details);
					}
					if (single) {
						forceMount();
						if (items && findSerializedMatchIndex() === -1) store.set("forceMounted", true);
					}
					queueMicrotask(handleChange);
				}
			}),
			id: id && hiddenInputName == null ? `${id}-hidden-input` : void 0,
			form,
			name: hiddenInputName,
			autoComplete: formAutoComplete,
			disabled,
			required: required && !hasMultipleSelection,
			readOnly,
			value: serializedValue,
			ref: hiddenInputRef,
			style: hiddenInputName ? visuallyHiddenInput : visuallyHidden,
			tabIndex: -1,
			"aria-hidden": true,
			suppressHydrationWarning: true
		}),
		hiddenInputs
	] });
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxRootContext.Provider, {
		value: store,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxFloatingContext.Provider, {
			value: floatingRootContext,
			children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxHasItemsContext.Provider, {
				value: hasItems,
				children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxDerivedItemsContext.Provider, {
					value: itemsContextValue,
					children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxInputValueContext.Provider, {
						value: inputValue,
						children
					})
				})
			})
		})
	});
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/autocomplete/root/AutocompleteRoot.mjs
/**
* Groups all parts of the autocomplete.
* Doesn't render its own HTML element.
*
* Documentation: [Base UI Autocomplete](https://base-ui.com/react/components/autocomplete)
*/
function AutocompleteRoot(props) {
	const { openOnInputClick = false, value, defaultValue, onValueChange, mode = "list", itemToStringValue, ...other } = props;
	const enableInline = (mode === "inline" || mode === "both") && !props.readOnly;
	const staticItems = mode === "inline" || mode === "none";
	const isControlled = value !== void 0;
	const [internalValue, setInternalValue] = import__wp_global_react.useState(defaultValue ?? "");
	const [inlineInputValue, setInlineInputValue] = import__wp_global_react.useState("");
	import__wp_global_react.useEffect(() => {
		if (isControlled || !enableInline) setInlineInputValue("");
	}, [
		value,
		isControlled,
		enableInline
	]);
	let resolvedInputValue;
	if (enableInline && inlineInputValue !== "") resolvedInputValue = inlineInputValue;
	else if (isControlled) resolvedInputValue = value ?? "";
	else resolvedInputValue = internalValue;
	const collator = useCoreFilter({ locale: other.locale });
	const resolvedQuery = String((isControlled ? value : internalValue) ?? "").trim();
	const resolvedFilter = staticItems || other.filter === null ? null : other.filter ?? collator.contains;
	function handleValueChange(nextValue, eventDetails) {
		setInlineInputValue("");
		if (!isControlled) setInternalValue(nextValue);
		onValueChange?.(nextValue, eventDetails);
	}
	function handleItemHighlighted(highlightedValue, eventDetails) {
		props.onItemHighlighted?.(highlightedValue, eventDetails);
		if (eventDetails.reason === "pointer") return;
		setInlineInputValue(enableInline && highlightedValue != null ? stringifyAsLabel(highlightedValue, itemToStringValue) : "");
	}
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(AriaCombobox, {
		...other,
		itemToStringLabel: itemToStringValue,
		openOnInputClick,
		selectionMode: "none",
		fillInputOnItemPress: true,
		filter: resolvedFilter,
		filterQuery: mode === "both" ? resolvedQuery : void 0,
		autoComplete: mode,
		inputValue: resolvedInputValue,
		defaultInputValue: defaultValue,
		onInputValueChange: handleValueChange,
		onItemHighlighted: handleItemHighlighted
	});
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/input/ComboboxInputDataAttributes.mjs
/**
* Present when the corresponding popup is open.
*/
const popupOpen = popupOpen$1;
/**
* Present when the input is pressed.
*/
const pressed = pressed$1;
/**
* Indicates which side the corresponding popup is positioned relative to its anchor.
* @type {'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start' | null}
*/
const popupSide = "data-popup-side";
/**
* Present when the corresponding items list is empty.
*/
const listEmpty = "data-list-empty";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/utils/stateAttributesMapping.mjs
const triggerStateAttributesMapping = {
	...pressableTriggerOpenStateMapping,
	...fieldValidityMapping,
	popupSide: (side) => side ? { [popupSide]: side } : null,
	listEmpty: (empty) => empty ? { [listEmpty]: "" } : null
};

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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/utils/parts.mjs
/**
* The popup side is only meaningful while the positioner is mounted, as the store retains the
* last resolved side after the popup unmounts.
*/
function usePopupSide(store) {
	const mounted = store.useState("mounted");
	const popupSide = store.useState("popupSide");
	const positionerElement = store.useState("positionerElement");
	return mounted && positionerElement ? popupSide : null;
}
/**
* Whether the filtered list has no items to show.
*/
function useListEmpty() {
	return useComboboxDerivedItemsContext().filteredItems.length === 0;
}
/**
* The arrow keys that move the chip highlight backwards and forwards, in that order.
*/
function getChipNavigationKeys(direction) {
	return direction === "rtl" ? ["ArrowRight", "ArrowLeft"] : ["ArrowLeft", "ArrowRight"];
}
/**
* Commits the highlighted item by clicking it, tagging the originating event so the item's
* handler can attribute the selection to it.
*/
function clickHighlightedItem(store, activeIndex, nativeEvent) {
	const listItem = store.context.listRef.current[activeIndex];
	if (listItem) {
		store.context.selectionEventRef.current = nativeEvent;
		listItem.click();
		store.context.selectionEventRef.current = null;
	}
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/chips/ComboboxChipsContext.mjs
const ComboboxChipsContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
ComboboxChipsContext.displayName = "ComboboxChipsContext";
function useComboboxChipsContext() {
	return import__wp_global_react.useContext(ComboboxChipsContext);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/positioner/ComboboxPositionerContext.mjs
const ComboboxPositionerContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
ComboboxPositionerContext.displayName = "ComboboxPositionerContext";
function useComboboxPositionerContext(optional) {
	const context = import__wp_global_react.useContext(ComboboxPositionerContext);
	if (context === void 0 && !optional) throw new Error("Base UI: <Combobox.Popup> and <Combobox.Arrow> must be used within the <Combobox.Positioner> component");
	return context;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/utils/ComboboxInternalDismissButton.mjs
/**
* @internal
*/
const ComboboxInternalDismissButton = /*#__PURE__*/ import__wp_global_react.forwardRef(function ComboboxInternalDismissButton(_, forwardedRef) {
	const store = useComboboxRootContext();
	const { buttonRef, getButtonProps } = useButton({ native: false });
	const mergedRef = useMergedRefs(forwardedRef, buttonRef);
	function handleDismiss(event) {
		store.context.setOpen(false, createChangeEventDetails(closePress, event.nativeEvent, event.currentTarget));
	}
	const dismissProps = getButtonProps({ onClick: handleDismiss });
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("span", {
		ref: mergedRef,
		...dismissProps,
		"aria-label": "Dismiss",
		tabIndex: void 0,
		style: visuallyHiddenInput
	});
});
ComboboxInternalDismissButton.displayName = "ComboboxInternalDismissButton";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/input/ComboboxInput.mjs
/**
* A text input to search for items in the list.
* Renders an `<input>` element.
*
* Documentation: [Base UI Combobox](https://base-ui.com/react/components/combobox)
*/
const ComboboxInput = /*#__PURE__*/ import__wp_global_react.forwardRef(function ComboboxInput(componentProps, forwardedRef) {
	const { render, className, disabled: disabledProp = false, id: idProp, style, ...elementProps } = componentProps;
	const { state: fieldState, disabled: fieldDisabled, setTouched, validationMode, validation } = useFieldRootContext();
	const { labelId: fieldLabelId } = useLabelableContext();
	const comboboxChipsContext = useComboboxChipsContext();
	const positioning = useComboboxPositionerContext(true);
	const hasPositionerParent = Boolean(positioning);
	const store = useComboboxRootContext();
	const inputValue = useComboboxInputValueContext();
	const direction = useDirection();
	const required = store.useState("required");
	const comboboxDisabled = store.useState("disabled");
	const readOnly = store.useState("readOnly");
	const name = store.useState("name");
	const form = store.useState("form");
	const selectionMode = store.useState("selectionMode");
	const autoHighlightMode = store.useState("autoHighlight");
	const inputProps = store.useState("inputProps");
	const triggerProps = store.useState("triggerProps");
	const open = store.useState("open");
	const mounted = store.useState("mounted");
	const selectedValue = store.useState("selectedValue");
	const rootId = store.useState("id");
	const inline = store.useState("inline");
	const modal = store.useState("modal");
	const autoHighlightEnabled = Boolean(autoHighlightMode);
	const popupSide = usePopupSide(store);
	const disabled = fieldDisabled || comboboxDisabled || disabledProp;
	const listEmpty = useListEmpty();
	const setFocused = useSetFieldFocused(disabled, store.context.inputRef);
	const isInsidePopup = hasPositionerParent || inline;
	const focusManagerModal = !isInsidePopup || modal;
	const id = useBaseUiId(idProp ?? (!isInsidePopup ? rootId : void 0));
	const fieldStateForInput = hasPositionerParent ? DEFAULT_FIELD_STATE_ATTRIBUTES : fieldState;
	const [composingValue, setComposingValue] = import__wp_global_react.useState(null);
	const isComposingRef = import__wp_global_react.useRef(false);
	const lastActiveIndexRef = import__wp_global_react.useRef(null);
	useIsoLayoutEffect(() => {
		if (!open) lastActiveIndexRef.current = null;
	}, [open]);
	const inputOwnsFormValue = selectionMode === "none" && !hasPositionerParent;
	const setInputElement = useStableCallback((element) => {
		const nextIsInsidePopup = hasPositionerParent || store.state.inline;
		if (nextIsInsidePopup && !store.state.hasInputValue) store.context.setInputValue("", createChangeEventDetails(none));
		store.update({
			inputElement: element,
			inputInsidePopup: nextIsInsidePopup,
			inputOwnsFormValue
		});
	});
	const validationProps = hasPositionerParent ? elementProps : validation.getValidationProps(disabled, elementProps);
	function clearHighlight(event) {
		store.context.setIndices({
			activeIndex: null,
			selectedIndex: null,
			type: getHighlightReason(event),
			event
		});
	}
	const state = {
		...fieldStateForInput,
		open,
		disabled,
		readOnly,
		popupSide,
		listEmpty
	};
	function handleKeyDown(event) {
		if (!comboboxChipsContext) return;
		let nextIndex;
		const renderedChipsCount = comboboxChipsContext.chipsRef.current.length;
		const [previousChipKey] = getChipNavigationKeys(direction);
		if (event.key === previousChipKey && (event.currentTarget.selectionStart ?? 0) === 0 && selectedValue.length > 0) {
			event.preventDefault();
			nextIndex = renderedChipsCount > 0 ? renderedChipsCount - 1 : void 0;
		}
		return nextIndex;
	}
	const element = useRenderElement("input", componentProps, {
		state,
		ref: [
			forwardedRef,
			store.context.inputRef,
			setInputElement
		],
		props: [
			inputProps,
			triggerProps,
			{
				value: composingValue ?? inputValue,
				"aria-readonly": readOnly || void 0,
				"aria-required": required || void 0,
				"aria-labelledby": fieldLabelId,
				disabled,
				readOnly,
				required: selectionMode === "none" ? required : void 0,
				form,
				...inputOwnsFormValue && name && { name },
				id,
				onFocus() {
					setFocused(true);
					if (!inline) return;
					const nextActiveIndex = lastActiveIndexRef.current;
					lastActiveIndexRef.current = null;
					if (nextActiveIndex == null || !Object.hasOwn(store.context.valuesRef.current, nextActiveIndex)) return;
					store.context.setIndices({ activeIndex: nextActiveIndex });
				},
				onBlur() {
					setTouched(true);
					setFocused(false);
					const activeIndex = store.state.activeIndex;
					if (inline && activeIndex !== null && autoHighlightMode !== "always") {
						lastActiveIndexRef.current = activeIndex;
						store.context.setIndices({ activeIndex: null });
					}
					if (validationMode === "onBlur") {
						const valueToValidate = selectionMode === "none" ? inputValue : selectedValue;
						validation.commit(valueToValidate);
					}
				},
				onCompositionStart(event) {
					if (android) return;
					isComposingRef.current = true;
					setComposingValue(event.currentTarget.value);
				},
				onCompositionEnd(event) {
					isComposingRef.current = false;
					const next = event.currentTarget.value;
					setComposingValue(null);
					store.context.setInputValue(next, createChangeEventDetails(inputChange, event.nativeEvent));
				},
				onChange(event) {
					const nativeEvent = event.nativeEvent;
					const inputType = nativeEvent.inputType;
					const autofillLikeInput = !inputType || inputType === "insertReplacementText";
					const shouldOpenOnInput = isComposingRef.current || !autofillLikeInput;
					function maybeOpenOnInput(trimmed) {
						if (readOnly || disabled || !trimmed || !shouldOpenOnInput) return;
						store.context.setOpen(true, createChangeEventDetails(inputChange, nativeEvent));
						if (!autoHighlightEnabled) clearHighlight(nativeEvent);
					}
					if (isComposingRef.current) {
						const nextVal = event.currentTarget.value;
						setComposingValue(nextVal);
						if (nextVal === "" && !store.state.openOnInputClick && !store.state.inputInsidePopup) store.context.setOpen(false, createChangeEventDetails(inputClear, nativeEvent));
						const trimmed = nextVal.trim();
						const shouldMaintainHighlight = autoHighlightEnabled && trimmed !== "";
						maybeOpenOnInput(trimmed);
						if (open && store.state.activeIndex !== null && !shouldMaintainHighlight) clearHighlight(nativeEvent);
						return;
					}
					const inputChangeDetails = createChangeEventDetails(inputChange, nativeEvent);
					store.context.setInputValue(event.currentTarget.value, inputChangeDetails);
					if (inputChangeDetails.isCanceled) return;
					const empty = event.currentTarget.value === "";
					const clearDetails = createChangeEventDetails(inputClear, nativeEvent);
					if (empty && !store.state.inputInsidePopup) {
						if (selectionMode === "single") store.context.setSelectedValue(null, clearDetails);
						if (!store.state.openOnInputClick) store.context.setOpen(false, clearDetails);
					}
					maybeOpenOnInput(event.currentTarget.value.trim());
					if (open && store.state.activeIndex !== null && !autoHighlightEnabled) clearHighlight(nativeEvent);
				},
				onKeyDown(event) {
					if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;
					if (disabled || readOnly) {
						if (readOnly && event.key === "Enter" && open && store.state.activeIndex !== null) stopEvent(event);
						return;
					}
					const input = event.currentTarget;
					const scrollAmount = input.scrollWidth - input.clientWidth;
					const isRTL = direction === "rtl";
					if (event.key === "Home") {
						stopEvent(event);
						const cursor = gecko && isRTL ? input.value.length : 0;
						input.setSelectionRange(cursor, cursor);
						input.scrollLeft = 0;
						return;
					}
					if (event.key === "End") {
						stopEvent(event);
						const cursor = gecko && isRTL ? 0 : input.value.length;
						input.setSelectionRange(cursor, cursor);
						input.scrollLeft = isRTL ? -scrollAmount : scrollAmount;
						return;
					}
					if (!mounted && event.key === "Escape") {
						const isClear = selectionMode === "multiple" && Array.isArray(selectedValue) ? selectedValue.length === 0 : selectedValue === null;
						const details = createChangeEventDetails(escapeKey, event.nativeEvent);
						const value = selectionMode === "multiple" ? [] : null;
						store.context.setInputValue("", details);
						store.context.setSelectedValue(value, details);
						if (!isClear && !store.state.inline && !details.isPropagationAllowed) event.stopPropagation();
						return;
					}
					if (comboboxChipsContext && event.key === "Backspace" && input.value === "" && Array.isArray(selectedValue) && selectedValue.length > 0) {
						const renderedChipsCount = comboboxChipsContext.chipsRef.current.length;
						const removalIndex = renderedChipsCount > 0 ? renderedChipsCount - 1 : selectedValue.length - 1;
						const newValue = selectedValue.filter((_, index) => index !== removalIndex);
						clearHighlight(event.nativeEvent);
						store.context.setSelectedValue(newValue, createChangeEventDetails(none, event.nativeEvent));
						return;
					}
					const nextIndex = handleKeyDown(event);
					if (nextIndex !== void 0) comboboxChipsContext?.chipsRef.current[nextIndex]?.focus();
					if (event.which === 229) return;
					if (event.key === "Enter" && open) {
						const activeIndex = store.state.activeIndex;
						const nativeEvent = event.nativeEvent;
						if (activeIndex === null) {
							if (inline) return;
							store.context.setOpen(false, createChangeEventDetails(none, nativeEvent));
							return;
						}
						stopEvent(event);
						clickHighlightedItem(store, activeIndex, nativeEvent);
					}
				}
			},
			validationProps
		],
		stateAttributesMapping: triggerStateAttributesMapping
	});
	const renderedInput = hasPositionerParent ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FieldRootContext.Provider, {
		value: DEFAULT_FIELD_ROOT_CONTEXT,
		children: element
	}) : element;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import__wp_global_react.Fragment, { children: [open && focusManagerModal && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxInternalDismissButton, { ref: store.context.startDismissRef }), renderedInput] });
});
ComboboxInput.displayName = "ComboboxInput";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/collection/GroupCollectionContext.mjs
const GroupCollectionContext = /*#__PURE__*/ import__wp_global_react.createContext(null);
GroupCollectionContext.displayName = "GroupCollectionContext";
function useGroupCollectionContext() {
	return import__wp_global_react.useContext(GroupCollectionContext);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/collection/ComboboxCollection.mjs
/**
* Renders filtered list items.
* Doesn't render its own HTML element.
*
* If rendering a flat list, pass a function child to the `List` component instead, which implicitly wraps it.
*
* Documentation: [Base UI Combobox](https://base-ui.com/react/components/combobox)
*/
function ComboboxCollection(props) {
	const { children } = props;
	const { filteredItems } = useComboboxDerivedItemsContext();
	const groupContext = useGroupCollectionContext();
	const itemsToRender = groupContext ? groupContext.items : filteredItems;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import__wp_global_react.Fragment, { children: itemsToRender.map(children) });
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/list/ComboboxList.mjs
/**
* A list container for the items.
* Renders a `<div>` element.
*
* Documentation: [Base UI Combobox](https://base-ui.com/react/components/combobox)
*/
const ComboboxList = /*#__PURE__*/ import__wp_global_react.forwardRef(function ComboboxList(componentProps, forwardedRef) {
	var _ComboboxCollection;
	const { render, className, style, children, ...elementProps } = componentProps;
	const store = useComboboxRootContext();
	const floatingRootContext = useComboboxFloatingContext();
	const hasPositionerContext = Boolean(useComboboxPositionerContext(true));
	const { filteredItems, hasItems } = useComboboxDerivedItemsContext();
	const selectionMode = store.useState("selectionMode");
	const grid = store.useState("grid");
	const readOnly = store.useState("readOnly");
	const listProps = store.useState("listProps");
	const virtualized = store.useState("virtualized");
	const forceMounted = store.useState("forceMounted");
	const multiple = selectionMode === "multiple";
	const empty = filteredItems.length === 0;
	const setPositionerElement = useStableCallback((element) => {
		store.set("positionerElement", element);
	});
	const setListElement = useStableCallback((element) => {
		store.set("listElement", element);
	});
	const resolvedChildren = import__wp_global_react.useMemo(() => {
		if (typeof children === "function") return _ComboboxCollection || (_ComboboxCollection = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxCollection, { children }));
		return children;
	}, [children]);
	const state = { empty };
	const floatingId = floatingRootContext.useState("floatingId");
	const element = useRenderElement("div", componentProps, {
		state,
		ref: [
			forwardedRef,
			setListElement,
			hasPositionerContext ? null : setPositionerElement
		],
		props: [
			listProps,
			{
				children: resolvedChildren,
				tabIndex: -1,
				id: floatingId,
				role: grid ? "grid" : "listbox",
				"aria-multiselectable": multiple ? "true" : void 0,
				"aria-readonly": !grid && readOnly ? true : void 0,
				onKeyDown(event) {
					if (store.state.disabled || store.state.readOnly) return;
					if (event.key === "Enter") {
						const activeIndex = store.state.activeIndex;
						if (activeIndex == null) return;
						stopEvent(event);
						clickHighlightedItem(store, activeIndex, event.nativeEvent);
					}
				}
			},
			elementProps
		]
	});
	if (virtualized) return element;
	const labelsRef = hasItems && !forceMounted ? void 0 : store.context.labelsRef;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeList, {
		elementsRef: store.context.listRef,
		labelsRef,
		children: element
	});
});
ComboboxList.displayName = "ComboboxList";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/internals/useInitialLiveRegionTextMutation.mjs
const LIVE_REGION_MARKER = "⁠";
const INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY = 200;
function findLastTextNode(root) {
	const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let lastTextNode = null;
	while (walker.nextNode()) {
		const textNode = walker.currentNode;
		if (textNode.nodeValue !== "") lastTextNode = textNode;
	}
	return lastTextNode;
}
/**
* @param present Whether the live region element is currently rendered. Lets a conditionally
* rendered region re-run the marker each time its element (re)appears with text.
*/
function useInitialLiveRegionTextMutation(present = true) {
	const timeout = useTimeout();
	const rootRef = import__wp_global_react.useRef(null);
	import__wp_global_react.useEffect(() => {
		if (!present || ios) return;
		const root = rootRef.current;
		if (root == null) return;
		const textNode = findLastTextNode(root);
		if (textNode == null) return;
		const originalValue = textNode.data;
		const markedValue = `${originalValue}${LIVE_REGION_MARKER}`;
		textNode.nodeValue = markedValue;
		timeout.start(200, () => {
			if (textNode.nodeValue === markedValue) textNode.nodeValue = originalValue;
		});
		return () => {
			timeout.clear();
			if (textNode.nodeValue === markedValue) textNode.nodeValue = originalValue;
		};
	}, [
		present,
		rootRef,
		timeout
	]);
	return rootRef;
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/status/ComboboxStatus.mjs
/**
* Displays a status message whose content changes are announced politely to screen readers.
* Useful for conveying the status of an asynchronously loaded list.
* This component's root element must remain mounted in the DOM to announce
* changes consistently across screen readers. Avoid hiding or removing the
* component itself with `display: none`, `hidden`, `aria-hidden`, or conditional
* rendering. Prefer updating or conditionally rendering its children instead.
* Renders a `<div>` element.
*
* Documentation: [Base UI Combobox](https://base-ui.com/react/components/combobox)
*/
const ComboboxStatus = /*#__PURE__*/ import__wp_global_react.forwardRef(function ComboboxStatus(componentProps, forwardedRef) {
	const { render, className, style, children: childrenProp, ...elementProps } = componentProps;
	const statusRef = useInitialLiveRegionTextMutation();
	return useRenderElement("div", componentProps, {
		ref: [forwardedRef, statusRef],
		props: [{
			children: childrenProp,
			role: "status",
			"aria-live": "polite",
			"aria-atomic": true
		}, elementProps]
	});
});
ComboboxStatus.displayName = "ComboboxStatus";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/item/ComboboxItemContext.mjs
const ComboboxItemContext = /*#__PURE__*/ import__wp_global_react.createContext(void 0);
ComboboxItemContext.displayName = "ComboboxItemContext";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/row/ComboboxRowContext.mjs
const ComboboxRowContext = /*#__PURE__*/ import__wp_global_react.createContext(false);
ComboboxRowContext.displayName = "ComboboxRowContext";
function useComboboxRowContext() {
	return import__wp_global_react.useContext(ComboboxRowContext);
}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/item/ComboboxItem.mjs
function ComboboxItemInner(props) {
	const { componentProps, forwardedRef, virtualized, indexFromFilter } = props;
	const { render, className, style, value: itemValue = null, index: indexProp, disabled: disabledProp = false, nativeButton = false, ...elementProps } = componentProps;
	const textRef = import__wp_global_react.useRef(null);
	const listItem = useCompositeListItem({
		guess: true,
		index: indexProp,
		textRef
	});
	const store = useComboboxRootContext();
	const isRow = useComboboxRowContext();
	const hasItems = useComboboxHasItemsContext();
	const { props: itemProps, id: rootId, selectionMode, disabled: rootDisabled, readOnly, isItemEqualToValue } = store.useState("itemRoot");
	const disabled = rootDisabled || disabledProp;
	const selectable = selectionMode !== "none";
	const index = indexProp ?? indexFromFilter ?? listItem.index;
	const hasRegistered = index !== -1;
	const highlighted = store.useState("isActive", index);
	const matchesSelectedValue = store.useState("isSelected", itemValue);
	const itemRef = import__wp_global_react.useRef(null);
	const id = rootId != null && hasRegistered ? `${rootId}-${index}` : void 0;
	const selected = matchesSelectedValue && selectable;
	useIsoLayoutEffect(() => {
		if (!(hasRegistered && (virtualized || indexProp != null))) return;
		const list = store.context.listRef.current;
		list[index] = itemRef.current;
		return () => {
			delete list[index];
		};
	}, [
		hasRegistered,
		virtualized,
		index,
		indexProp,
		store
	]);
	useIsoLayoutEffect(() => {
		if (!hasRegistered || hasItems) return;
		const visibleValues = store.context.valuesRef.current;
		visibleValues[index] = itemValue;
		return () => {
			delete visibleValues[index];
		};
	}, [
		hasRegistered,
		hasItems,
		index,
		itemValue,
		store
	]);
	useIsoLayoutEffect(() => {
		if (!hasRegistered || hasItems) return;
		const selectedValue = store.state.selectedValue;
		let nextIndex = store.state.selectedIndex;
		if (store.state.selectionMode === "multiple" && Array.isArray(selectedValue)) nextIndex = resolveSelectedIndex(index, itemValue, store.context.valuesRef.current, selectedValue, isItemEqualToValue, nextIndex);
		else if (compareItemEquality(itemValue, selectedValue, isItemEqualToValue)) nextIndex = index;
		store.set("selectedIndex", nextIndex);
	}, [
		hasRegistered,
		hasItems,
		store,
		index,
		itemValue,
		isItemEqualToValue
	]);
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
	function commitSelection(nativeEvent) {
		function selectItem() {
			store.context.handleSelection(nativeEvent, itemValue);
		}
		if (store.state.submitOnItemClick) {
			import__wp_global_react_dom.flushSync(selectItem);
			store.context.requestSubmit();
		} else selectItem();
	}
	const defaultProps = {
		id,
		role: isRow ? "gridcell" : "option",
		"aria-selected": selectable ? selected : void 0,
		tabIndex: void 0,
		onPointerDownCapture(event) {
			if (event.isPrimary) store.context.pointerDownItemRef.current = event.currentTarget;
			event.preventDefault();
		},
		onMouseDown(event) {
			event.preventDefault();
		},
		onClick(event) {
			if (disabled || readOnly) return;
			commitSelection(event.nativeEvent);
		},
		onMouseUp(event) {
			const pointerStartedOnItem = store.context.pointerDownItemRef.current === event.currentTarget;
			store.context.pointerDownItemRef.current = null;
			if (disabled || readOnly || event.button !== 0 || pointerStartedOnItem || !highlighted) return;
			commitSelection(event.nativeEvent);
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
		textRef
	}), [selected, textRef]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxItemContext.Provider, {
		value: contextValue,
		children: element
	});
}
/**
* Resolves the index from the filtered items for the virtualized fallback (no `index` prop).
* Isolated here so that this per-keystroke subscription to the derived-items context is only
* paid by virtualized items. Those re-render on every input change anyway — the parent
* virtualizer re-windows the list as the filtered set changes — so the extra subscription costs
* them nothing, while it keeps every non-virtualized item off that context.
*/
function ComboboxItemVirtualizedIndex(props) {
	const { componentProps, forwardedRef } = props;
	const isItemEqualToValue = useComboboxRootContext().useState("isItemEqualToValue");
	const { flatFilteredValues } = useComboboxDerivedItemsContext();
	const lookupValue = componentProps.value ?? null;
	const indexFromFilter = findItemIndex(flatFilteredValues, lookupValue, isItemEqualToValue);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxItemInner, {
		componentProps,
		forwardedRef,
		virtualized: true,
		indexFromFilter
	});
}
/**
* An individual item in the list.
* Renders a `<div>` element.
*
* Documentation: [Base UI Combobox](https://base-ui.com/react/components/combobox)
*/
const ComboboxItem = /*#__PURE__*/ import__wp_global_react.memo(/*#__PURE__*/ import__wp_global_react.forwardRef(function ComboboxItem(componentProps, forwardedRef) {
	const virtualized = useComboboxRootContext().useState("virtualized");
	if (virtualized && componentProps.index == null) return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxItemVirtualizedIndex, {
		componentProps,
		forwardedRef
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ComboboxItemInner, {
		componentProps,
		forwardedRef,
		virtualized,
		indexFromFilter: void 0
	});
}));
ComboboxItem.displayName = "ComboboxItem";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/autocomplete/item/AutocompleteItem.mjs
/**
* An individual item in the list.
* Renders a `<div>` element.
*
* Documentation: [Base UI Autocomplete](https://base-ui.com/react/components/autocomplete)
*/
const AutocompleteItem = ComboboxItem;

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/combobox/empty/ComboboxEmpty.mjs
/**
* Renders its children only when the list is empty.
* Requires the `items` prop on the root component.
* Announces changes politely to screen readers.
* This component's root element must remain mounted in the DOM to announce
* changes consistently across screen readers. Avoid hiding or removing the
* component itself with `display: none`, `hidden`, `aria-hidden`, or conditional
* rendering. Prefer updating or conditionally rendering its children instead.
* Renders a `<div>` element.
*
* Documentation: [Base UI Combobox](https://base-ui.com/react/components/combobox)
*/
const ComboboxEmpty = /*#__PURE__*/ import__wp_global_react.forwardRef(function ComboboxEmpty(componentProps, forwardedRef) {
	const { render, className, style, children: childrenProp, ...elementProps } = componentProps;
	const { filteredItems } = useComboboxDerivedItemsContext();
	const store = useComboboxRootContext();
	const emptyRef = useInitialLiveRegionTextMutation();
	const children = filteredItems.length === 0 ? childrenProp : null;
	return useRenderElement("div", componentProps, {
		ref: [
			forwardedRef,
			store.context.emptyRef,
			emptyRef
		],
		props: [{
			children,
			role: "status",
			"aria-live": "polite",
			"aria-atomic": true
		}, elementProps]
	});
});
ComboboxEmpty.displayName = "ComboboxEmpty";

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

// packages/icons/build-module/library/search.mjs
var search_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M5 19L9.28769 14.7123M18.25 11C18.25 13.8995 15.8995 16.25 13 16.25C10.1005 16.25 7.75 13.8995 7.75 11C7.75 8.10051 10.1005 5.75 13 5.75C15.8995 5.75 18.25 8.10051 18.25 11Z" })
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
registerStyle$10("09bae534ff", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9745ffa515d864cf__text{text-wrap:pretty;margin:0}._8882b6a7feb4fd3d__heading-2xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-p-line-height:var(--wpds-typography-line-height-2xl,40px);font-size:var(--wpds-typography-font-size-2xl,32px);line-height:var(--wpds-typography-line-height-2xl,40px)}._664e3e7687c45603__heading-xl,._8882b6a7feb4fd3d__heading-2xl{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600)}._664e3e7687c45603__heading-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-md,24px)}.dac661a5de0ed2bd__heading-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-lg,15px)}._59c7f3f740e2f96e__heading-md,.dac661a5de0ed2bd__heading-lg{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-sm,20px)}._59c7f3f740e2f96e__heading-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px)}.cf052fbad8d93b7e__heading-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._212b9cfef57a0af4__body-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-xl,32px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-xl,32px)}._07f57bc0aa36b2c6__body-lg,._212b9cfef57a0af4__body-xl{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}._07f57bc0aa36b2c6__body-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-lg,15px);line-height:var(--wpds-typography-line-height-md,24px)}._0c6da4457aec9e62__body-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px)}._0c6da4457aec9e62__body-md,.b998f87ff17b7bec__body-sm{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}.b998f87ff17b7bec__body-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
var style_module_default$3 = {
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
registerStyle$10("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
/**
* A text component for rendering content with predefined typographic variants.
* Built on design tokens for consistent typography across the UI.
*/
const Text = (0, import_element.forwardRef)(function UnforwardedText({ variant = "body-md", render, className, ...props }, ref) {
	return useRender({
		render,
		defaultTagName: "span",
		ref,
		props: mergeProps(props, { className: clsx(style_module_default$3.text, global_css_defense_module_default$3.heading, global_css_defense_module_default$3.p, style_module_default$3[variant], className) })
	});
});

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

// packages/ui/build-module/form/primitives/autocomplete/collection.mjs
function Collection({ children, ...restProps }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxCollection, {
		...restProps,
		children
	});
}

// packages/ui/build-module/form/primitives/autocomplete/empty.mjs
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
registerStyle$9("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
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
const Empty = (0, import_element.forwardRef)(function UnforwardedEmpty({ className, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxEmpty, {
		className: clsx(item_popup_module_default$6.empty, className),
		ref,
		...restProps
	});
});

// packages/ui/build-module/form/primitives/input-layout/input-layout.mjs
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
registerStyle$8("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
registerStyle$8("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default$1 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
registerStyle$8("e6c5a41f63", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._505ff76c91c9038c__input-layout{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-md,12px);background-color:var(--wpds-color-background-interactive-neutral,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:var(--wpds-border-width-xs,1px);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);height:var(--wpds-dimension-size-lg,40px);line-height:1;&.eb482a6b817df402__is-size-compact{height:var(--wpds-dimension-size-md,32px)}&._5fcbd992e43c8b58__is-size-small,&.eb482a6b817df402__is-size-compact{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-sm,8px)}&._5fcbd992e43c8b58__is-size-small{height:var(--wpds-dimension-size-sm,24px)}&._433416a57235dc04__is-disabled,&:has([data-can-disable-input-layout][data-disabled]){color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);@media (forced-colors:active){color:GrayText}&:not(.a9a2f3bdee850c03__is-borderless){background-color:var(--wpds-color-background-interactive-neutral-disabled,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText}}}&.a9a2f3bdee850c03__is-borderless{background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);border-color:transparent}&:has(.ba99c8588802f965__input-layout-slot:focus-within){--_gcd-div-outline:none;outline:none}&:hover:not(._433416a57235dc04__is-disabled,:has([data-can-disable-input-layout][data-disabled]),.a9a2f3bdee850c03__is-borderless){background-color:var(--wpds-color-background-interactive-neutral-active,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e)}&:has(:invalid[data-validity-visible]){--focus-color:var(--wpds-color-stroke-interactive-error,#cc1818);border-color:var(--wpds-color-stroke-interactive-error,#cc1818);&:hover{border-color:var(--wpds-color-stroke-interactive-error-active,#9d0000)}}}._167e32215c7469f1__slot-wrapper{display:contents}.ba99c8588802f965__input-layout-slot{align-items:center;display:flex;flex-shrink:0;&._377d165e02d0baa2__is-padding-minimal{--wp-ui-input-layout-prefix-padding-start:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px));--wp-ui-input-layout-suffix-padding-end:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}[data-slot-type=prefix] &{padding-inline-start:var(--wp-ui-input-layout-prefix-padding-start,var(--wp-ui-input-layout-padding-inline))}[data-slot-type=suffix] &{padding-inline-end:var(--wp-ui-input-layout-suffix-padding-end,var(--wp-ui-input-layout-padding-inline))}}}}");
var style_module_default$2 = {
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
		className: clsx(global_css_defense_module_default$2.div, resets_module_default$1["box-sizing"], style_module_default$2["input-layout"], style_module_default$2[`is-size-${size}`], visuallyDisabled && style_module_default$2["is-disabled"], isBorderless && style_module_default$2["is-borderless"], className),
		...restProps,
		children: [
			import_element.Children.count(prefix) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$2["slot-wrapper"],
				"data-slot-type": "prefix",
				children: prefix
			}),
			children,
			import_element.Children.count(suffix) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: style_module_default$2["slot-wrapper"],
				"data-slot-type": "suffix",
				children: suffix
			})
		]
	});
});

// packages/ui/build-module/form/primitives/input-layout/slot.mjs
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
registerStyle$7("e6c5a41f63", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._505ff76c91c9038c__input-layout{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-md,12px);background-color:var(--wpds-color-background-interactive-neutral,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:var(--wpds-border-width-xs,1px);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);height:var(--wpds-dimension-size-lg,40px);line-height:1;&.eb482a6b817df402__is-size-compact{height:var(--wpds-dimension-size-md,32px)}&._5fcbd992e43c8b58__is-size-small,&.eb482a6b817df402__is-size-compact{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-sm,8px)}&._5fcbd992e43c8b58__is-size-small{height:var(--wpds-dimension-size-sm,24px)}&._433416a57235dc04__is-disabled,&:has([data-can-disable-input-layout][data-disabled]){color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);@media (forced-colors:active){color:GrayText}&:not(.a9a2f3bdee850c03__is-borderless){background-color:var(--wpds-color-background-interactive-neutral-disabled,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText}}}&.a9a2f3bdee850c03__is-borderless{background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);border-color:transparent}&:has(.ba99c8588802f965__input-layout-slot:focus-within){--_gcd-div-outline:none;outline:none}&:hover:not(._433416a57235dc04__is-disabled,:has([data-can-disable-input-layout][data-disabled]),.a9a2f3bdee850c03__is-borderless){background-color:var(--wpds-color-background-interactive-neutral-active,var(--wpds-color-background-surface-neutral-strong,#fff));border-color:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e)}&:has(:invalid[data-validity-visible]){--focus-color:var(--wpds-color-stroke-interactive-error,#cc1818);border-color:var(--wpds-color-stroke-interactive-error,#cc1818);&:hover{border-color:var(--wpds-color-stroke-interactive-error-active,#9d0000)}}}._167e32215c7469f1__slot-wrapper{display:contents}.ba99c8588802f965__input-layout-slot{align-items:center;display:flex;flex-shrink:0;&._377d165e02d0baa2__is-padding-minimal{--wp-ui-input-layout-prefix-padding-start:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px));--wp-ui-input-layout-suffix-padding-end:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}[data-slot-type=prefix] &{padding-inline-start:var(--wp-ui-input-layout-prefix-padding-start,var(--wp-ui-input-layout-padding-inline))}[data-slot-type=suffix] &{padding-inline-end:var(--wp-ui-input-layout-suffix-padding-end,var(--wp-ui-input-layout-padding-inline))}}}}");
var style_module_default$1 = {
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
		className: clsx(style_module_default$1["input-layout-slot"], style_module_default$1[`is-padding-${padding}`], className),
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
registerStyle$6("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
registerStyle$6("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
var focus_module_default = {
	"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
	"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
	"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
	"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
	"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
};
registerStyle$6("a53cd10a80", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9edfcd97eeaee9dc__input{--_gcd-input-padding:var(--wp-ui-input-padding-block,0px) var(--wp-ui-input-layout-padding-inline,0px);--_gcd-input-font-size:max(var(--wpds-typography-font-size-md,13px),16px);background:transparent;border:none;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:inherit;font-size:inherit;line-height:inherit;outline:none;padding-block:var(--wp-ui-input-padding-block,0);padding-inline:var(--wp-ui-input-layout-padding-inline,0);width:100%;@media (min-width:600px){--_gcd-input-font-size:inherit}&::placeholder{color:var(--wpds-color-foreground-interactive-neutral-weak,#707070)}&:disabled,&[aria-disabled=true]{--_gcd-input-placeholder-color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&::placeholder{color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}@media (forced-colors:active){color:GrayText}}&[type=email],&[type=url]{direction:ltr}&[type=number]{appearance:textfield;&::-webkit-inner-spin-button,&::-webkit-outer-spin-button{appearance:none;margin:0}}}}@layer compositions{.edc52bf0fe80b57f__layout{font-size:max(var(--wpds-typography-font-size-md,13px),16px);@media (min-width:600px){font-size:var(--wpds-typography-font-size-md,13px)}}}}");
var style_module_default = {
	"input": "_9edfcd97eeaee9dc__input",
	"layout": "edc52bf0fe80b57f__layout"
};
/**
* A low-level primitive for an input field.
*
* Prefer `InputControl` when using with a standard label and description.
*/
const Input$2 = (0, import_element.forwardRef)(function UnforwardedInput({ className, size = "default", prefix, suffix, style, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputLayout, {
		className: clsx(style_module_default.layout, focus_module_default["outset-ring--focus-within"], className),
		style,
		size,
		visuallyDisabled: restProps.disabled,
		prefix,
		suffix,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
			ref,
			className: clsx(global_css_defense_module_default$1.input, style_module_default.input),
			...restProps
		})
	});
});

// packages/ui/build-module/form/primitives/autocomplete/input.mjs
const DEFAULT_RENDER = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$2, { ...props });
const Input = (0, import_element.forwardRef)(function UnforwardedInput({ render = DEFAULT_RENDER, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxInput, {
		ref,
		render,
		...restProps
	});
});

// packages/ui/build-module/form/primitives/autocomplete/item-description.mjs
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
registerStyle$5("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
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
* Supplementary content for an autocomplete item. Its text contributes to the
* item's accessible description.
*/
const ForwardedItemDescription = (0, import_element.forwardRef)(function ItemDescription(props, ref) {
	const { className, validationToken, ...restProps } = props;
	if (validationToken !== ITEM_DESCRIPTION_DIRECT_CHILD) throw new Error("Autocomplete.ItemDescription: Missing direct autocomplete item parent. Render <Autocomplete.ItemDescription> as a direct child of <Autocomplete.Item>.");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
		ref,
		variant: "body-sm",
		className: clsx(item_popup_module_default$5["item-description"], className),
		...restProps
	});
});

// packages/ui/build-module/form/primitives/autocomplete/item-label.mjs
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
registerStyle$4("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
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
* The primary label and accessible name of an autocomplete item.
*/
const ForwardedItemLabel = (0, import_element.forwardRef)(function ItemLabel({ className, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
		ref,
		variant: "body-md",
		className: clsx(item_popup_module_default$4["item-label"], className),
		...restProps
	});
});

// packages/ui/build-module/form/primitives/autocomplete/item.mjs
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
registerStyle$3("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
registerStyle$3("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
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
registerStyle$3("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
var resets_module_default = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
const ITEM_CONTENT_COMPONENTS = {
	Label: ForwardedItemLabel,
	Description: ForwardedItemDescription,
	descriptionValidationToken: ITEM_DESCRIPTION_DIRECT_CHILD,
	validationMessage: "Autocomplete.ItemLabel must be the first direct child of every autocomplete item, followed only by Autocomplete.ItemDescription components."
};
const Item = (0, import_element.forwardRef)(function UnforwardedItem({ className, children, "aria-describedby": ariaDescribedBy, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...restProps }, ref) {
	const { contentChildren, itemAriaProps } = useItemContent(children, ITEM_CONTENT_COMPONENTS, {
		"aria-describedby": ariaDescribedBy,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutocompleteItem, {
		className: clsx(global_css_defense_module_default.div, resets_module_default["box-sizing"], item_popup_module_default$3.item, className),
		ref,
		...itemAriaProps,
		...restProps,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: item_popup_module_default$3["item-text"],
			children: contentChildren
		})
	});
});

// packages/ui/build-module/form/primitives/autocomplete/list.mjs
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
registerStyle$2("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
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
const List = (0, import_element.forwardRef)(function UnforwardedList({ className, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxList, {
		className: clsx(item_popup_module_default$2.list, className),
		ref,
		...restProps
	});
});

// packages/ui/build-module/form/primitives/autocomplete/list-body.mjs
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
registerStyle$1("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
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
/**
* A layout container for the main scrolling area in the `List`, for holding `Item`s.
*/
const ListBody = (0, import_element.forwardRef)(function UnforwardedListBody({ render, ...props }, ref) {
	return useRender({
		defaultTagName: "div",
		render,
		ref,
		props: mergeProps({ className: item_popup_module_default$1["list-scrollable-container"] }, props)
	});
});

// packages/ui/build-module/form/primitives/autocomplete/context.mjs
const AutocompleteGridContext = (0, import_element.createContext)(false);

// packages/ui/build-module/form/primitives/autocomplete/root.mjs
/**
* Low-level primitive for an autocomplete input that suggests options as
* you type. Unlike `Combobox`, the input can contain free-form text and
* suggestions only optionally autocomplete the text.
*
* There are currently no plans for higher-level components of this primitive in this package.
* Use the primitives directly, and remember to label the input field,
* usually by using the `Field` component.
*/
const Root = function Root(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutocompleteGridContext.Provider, {
		value: Boolean(props.grid),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectionProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutocompleteRoot, { ...props }) })
	});
};

// packages/ui/build-module/form/primitives/autocomplete/status.mjs
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
registerStyle("149d86e146", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._069972d5e326bada__dropdown-motion,._66136bf671f00b1f__dropdown-motion--fade-only{--wp-ui-dropdown-slide-distance:4px;--wp-ui-dropdown-slide-duration:var(--wpds-motion-duration-md,200ms);--wp-ui-dropdown-slide-easing:var(--wpds-motion-easing-expressive,cubic-bezier(0.25,0,0,1));--wp-ui-dropdown-fade-duration:var(--wpds-motion-duration-sm,100ms);--wp-ui-dropdown-fade-easing:linear;@media not (prefers-reduced-motion){transition-duration:var(--wp-ui-dropdown-slide-duration),var(--wp-ui-dropdown-fade-duration);transition-property:transform,opacity;transition-timing-function:var(--wp-ui-dropdown-slide-easing),var(--wp-ui-dropdown-fade-easing);will-change:transform,opacity}opacity:1;&[data-instant]{transition:none}&[data-ending-style],&[data-starting-style]{opacity:0}}._069972d5e326bada__dropdown-motion{transform:translate(0);&[data-side=bottom][data-ending-style],&[data-side=bottom][data-starting-style]{transform:translateY(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=top][data-ending-style],&[data-side=top][data-starting-style]{transform:translateY(var(--wp-ui-dropdown-slide-distance))}&[data-side=left][data-ending-style],&[data-side=left][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=right][data-ending-style],&[data-side=right][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&[data-side=inline-start][data-ending-style],&[data-side=inline-start][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}&[data-side=inline-end][data-ending-style],&[data-side=inline-end][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-start][data-ending-style],&:dir(rtl)[data-side=inline-start][data-starting-style]{transform:translateX(calc(var(--wp-ui-dropdown-slide-distance)*-1))}&:dir(rtl)[data-side=inline-end][data-ending-style],&:dir(rtl)[data-side=inline-end][data-starting-style]{transform:translateX(var(--wp-ui-dropdown-slide-distance))}}}}@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.f44105ad1a552523__popup{--wp-ui-popup-padding:var(--wpds-dimension-padding-xs,4px);--_wp-ui-popup-item-text-line-height:var(--wpds-typography-line-height-xs,16px);--_wp-ui-elevation-md:0 2px 3px rgba(0,0,0,.05),0 4px 5px rgba(0,0,0,.04),0 12px 12px rgba(0,0,0,.03),0 16px 16px rgba(0,0,0,.02);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-md,4px);box-shadow:var(--_wp-ui-elevation-md);display:grid;grid-template-areas:\"header\" \"status\" \"main\";grid-template-rows:auto auto minmax(0,1fr);max-height:min(var(--available-height),480px,60dvh);max-width:min(var(--available-width),var(--_wp-ui-item-popup-max-width,var(--available-width)));min-width:var(--anchor-width)}.f20f14dd818510c6__is-width-anchor{width:var(--anchor-width)}._398b31dcd487e37f__is-width-content,._481aa05a209e4968__is-width-available,.f20f14dd818510c6__is-width-anchor{--_wp-ui-item-popup-max-width:var(--available-width)}._398b31dcd487e37f__is-width-content{width:auto}._75f4d59e8cd4fbf1__is-width-sm{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-sm,320px)}._9b640ab112999a71__is-width-md{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-md,400px)}._3bf04b25e9ec1c2c__is-width-lg{--_wp-ui-item-popup-max-width:var(--wpds-dimension-surface-width-lg,560px)}._543f334dbb899cca__fixed-width-presets{&._3bf04b25e9ec1c2c__is-width-lg,&._75f4d59e8cd4fbf1__is-width-sm,&._9b640ab112999a71__is-width-md{width:min(var(--available-width),var(--_wp-ui-item-popup-max-width))}}._481aa05a209e4968__is-width-available{width:var(--available-width)}._31995ce6e72ae51c__is-align-item-with-trigger[data-side=none] .f44105ad1a552523__popup{max-height:none}.c61ae8ac6b17caf6__list-chrome{--_wp-ui-popup-selection-offset:0px;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);grid-area:main;line-height:var(--wpds-typography-line-height-sm,20px);&:has(._41ac90fbb134576c__item-icon){--_wp-ui-popup-selection-offset:calc(var(--wpds-dimension-size-2xs, 16px) + var(--wpds-dimension-gap-xs, 4px) - var(--wpds-dimension-padding-xs, 4px))}}._6f78c164f55857d2__list{display:grid;grid-template-areas:\"scrollable\" \"footer\";grid-template-rows:minmax(0,1fr) auto}.d50f53b586266e4c__list-scrollable-container{grid-area:scrollable;overflow-block:auto;overscroll-behavior:contain;scroll-padding-block:var(--wp-ui-popup-padding);&:not(:empty){padding-block:var(--wp-ui-popup-padding)}}._44be0354ea94ae76__list-footer{grid-area:footer;padding-block:var(--wp-ui-popup-padding);.d50f53b586266e4c__list-scrollable-container:not(:empty)+&{border-block-start:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb)}}.e46f00c85691b978__group:not(:first-child){margin-block-start:var(--wpds-dimension-gap-sm,8px)}._7c8dd3d445b9e0d1__group-label{align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;min-height:var(--wpds-dimension-size-sm,24px);padding-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));padding-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset))}._6590ed1ca0955506__separator{background-color:var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);height:var(--wpds-border-width-xs,1px);margin-block:var(--wpds-dimension-gap-xs,4px);margin-inline-end:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px));margin-inline-start:calc(var(--wp-ui-popup-padding) + var(--wpds-dimension-padding-sm, 8px) + var(--_wp-ui-popup-selection-offset));@media (forced-colors:active){background-color:CanvasText}}.c53905a339ee5b93__item-layout{--wp-ui-popup-item-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:var(--wpds-dimension-padding-xs,4px);align-items:center;border-radius:var(--wpds-border-radius-sm,2px);display:flex;gap:var(--wpds-dimension-gap-xs,4px);justify-content:flex-start;line-height:var(--_wp-ui-popup-item-text-line-height);margin-inline:var(--wp-ui-popup-padding);min-height:var(--wp-ui-popup-item-height);min-width:0;overflow-wrap:anywhere;padding-block:var(--wp-ui-popup-item-padding-block);padding-inline:var(--wp-ui-popup-item-padding-inline);&:has(>._41ac90fbb134576c__item-icon){align-content:center;align-items:start;display:grid;grid-template-columns:auto minmax(0,1fr);padding-inline-start:calc(var(--wp-ui-popup-item-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}}.baf88da98aa22472__item{user-select:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}&.c1884bb8f08d6b49__is-size-small{--wp-ui-popup-item-height:var(--wpds-dimension-size-sm,24px);--wp-ui-popup-item-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-popup-item-padding-block:2px}&:not([data-selected]){.bacbdc6d2167ebdd__item-indicator-icon{opacity:0}}&[data-highlighted]:not([data-disabled]){background-color:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));color:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);outline:none;@media (forced-colors:active){background-color:Highlight;color:HighlightText;forced-color-adjust:none}}&[data-disabled]{background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);&:focus-visible{--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:0}@media (forced-colors:active){color:GrayText}}}._41ac90fbb134576c__item-icon{align-items:center;display:flex;height:var(--_wp-ui-popup-item-text-line-height);justify-content:center;pointer-events:none;width:var(--wpds-dimension-size-2xs,16px)}.bacbdc6d2167ebdd__item-indicator-icon{translate:0 1px}._128e9f67dabbe8cd__item-content{align-items:center;display:flex;gap:var(--wpds-dimension-gap-xs,4px);min-width:0}._96a7e33bb57975a2__item-text{display:flex;flex-direction:column;min-width:0;row-gap:var(--wpds-dimension-gap-xs,4px)}.bad7b55318907302__item-label{--_gcd-heading-color:currentColor;min-width:0}._2e4ebd9f6d7ce5d4__item-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.baf88da98aa22472__item[data-disabled] ._2e4ebd9f6d7ce5d4__item-description,.baf88da98aa22472__item[data-highlighted]:not([data-disabled]) ._2e4ebd9f6d7ce5d4__item-description{--_gcd-heading-color:currentColor;color:inherit}._384062150817186f__loading-indicator{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px)}.c4502685591e2f57__status{grid-area:status;&:has(._384062150817186f__loading-indicator){padding-block:var(--wp-ui-popup-padding)}}._46236ecbce83a6f0__empty:not(:empty){grid-area:main}._46236ecbce83a6f0__empty:not(:empty),.c4502685591e2f57__status:not(:empty):not(:has([data-visually-hidden],._384062150817186f__loading-indicator)){--wp-ui-popup-empty-min-height:var(--wpds-dimension-size-md,32px);--wp-ui-popup-empty-padding-inline:var(--wpds-dimension-padding-md,12px);align-items:center;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px);min-height:var(--wp-ui-popup-empty-min-height);padding-inline:var(--wp-ui-popup-empty-padding-inline)}}@layer compositions{._2e4ebd9f6d7ce5d4__item-description,.bad7b55318907302__item-label{--_gcd-p-line-height:var(--_wp-ui-popup-item-text-line-height);line-height:var(--_wp-ui-popup-item-text-line-height)}._9dd46ff6c5337aad__loading-spinner{height:var(--wpds-dimension-size-3xs,12px);width:var(--wpds-dimension-size-3xs,12px)}}}");
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
* Announces a status message politely to screen readers. Use it for the
* status of an asynchronously loaded list.
*
* Keep this element mounted. Do not hide it with `display: none`, `hidden`,
* `aria-hidden`, or by omitting the component. Change or omit the children
* instead.
*/
const Status = (0, import_element.forwardRef)(function UnforwardedStatus({ className, ...restProps }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComboboxStatus, {
		className: clsx(item_popup_module_default.status, className),
		ref,
		...restProps
	});
});

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/components
var require_components = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.components;
}));

// \0wp-global:@wordpress/keyboard-shortcuts
var require_keyboard_shortcuts = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.keyboardShortcuts;
}));

// \0wp-global:@wordpress/keycodes
var require_keycodes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.keycodes;
}));

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// packages/workflow/build-module/utils/get-error-message.mjs
var import_data = require_data();
var import_components = require_components();
var import_keyboard_shortcuts = require_keyboard_shortcuts();
var import_keycodes = require_keycodes();
var import_html_entities = require_html_entities();
/**
* Turns whatever an ability threw into a message the user can read.
*
* @param error The value the ability threw.
* @return The message to show the user.
*/
function getErrorMessage(error) {
	let message = "";
	if (typeof error === "object" && error !== null) {
		if ("message" in error && typeof error.message === "string") message = error.message;
		if (!message && "name" in error && typeof error.name === "string") message = error.name;
	} else if (error !== null && error !== void 0) message = String(error);
	if (!message) return (0, import_i18n.__)("This ability couldn’t run. Check the browser console for details.");
	return (0, import_html_entities.decodeEntities)(message);
}

// packages/workflow/build-module/components/workflow-menu.mjs
if (typeof document !== "undefined" && !document.head.querySelector("style[data-wp-hash='715ff4efd0']")) {
	const style = document.createElement("style");
	style.setAttribute("data-wp-hash", "715ff4efd0");
	style.appendChild(document.createTextNode(":root{--wp-block-synced-color:#7a00df;--wp-block-synced-color--rgb:122,0,223;--wp-bound-block-color:var(--wp-block-synced-color);--wp-editor-canvas-background:#ddd;--wp-admin-theme-color:#3858e9;--wp-admin-theme-color--rgb:56,88,233;--wp-admin-theme-color-darker-10:#2145e6;--wp-admin-theme-color-darker-10--rgb:33.0384615385,68.7307692308,230.4615384615;--wp-admin-theme-color-darker-20:#183ad6;--wp-admin-theme-color-darker-20--rgb:23.6923076923,58.1538461538,214.3076923077;--wp-admin-border-width-focus:2px}@media (-webkit-min-device-pixel-ratio:2),(min-resolution:192dpi){:root{--wp-admin-border-width-focus:1.5px}}body.admin-color-fresh{--wp-admin-theme-color:#007cba;--wp-admin-theme-color--rgb:0,124,186;--wp-admin-theme-color-darker-10:#006ba1;--wp-admin-theme-color-darker-10--rgb:0,107,160.5;--wp-admin-theme-color-darker-20:#005a87;--wp-admin-theme-color-darker-20--rgb:0,90,135;--wp-admin-border-width-focus:2px}@media (-webkit-min-device-pixel-ratio:2),(min-resolution:192dpi){body.admin-color-fresh{--wp-admin-border-width-focus:1.5px}}.workflows-workflow-menu{border-radius:4px;margin:auto;max-width:400px;position:relative;top:calc(5% + 64px);width:calc(100% - 32px)}@media (min-width:600px){.workflows-workflow-menu{top:calc(10% + 64px)}}.workflows-workflow-menu .components-modal__content{margin:0;padding:0}.workflows-workflow-menu__overlay{align-items:start;display:block}.workflows-workflow-menu__container{will-change:transform}.workflows-workflow-menu__container:focus{outline:none}.workflows-workflow-menu__input{margin:8px}.workflows-workflow-menu__list{max-height:376px}.workflows-workflow-menu__list-body{padding:0 8px 8px}.workflows-workflow-menu__item-label{display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.workflows-workflow-menu__item mark{background:unset;color:inherit;font-weight:var(--wpds-typography-font-weight-emphasis,600)}.workflows-workflow-menu__output{padding:16px}.workflows-workflow-menu__output-header{border-bottom:1px solid #ddd;margin-bottom:16px;padding-bottom:8px}.workflows-workflow-menu__output-header h3{color:#1e1e1e;font-size:16px;font-weight:var(--wpds-typography-font-weight-emphasis,600);margin:0 0 4px}.workflows-workflow-menu__output-hint{color:#757575;font-size:12px;margin:0}.workflows-workflow-menu__output-content{max-height:400px;overflow:auto}.workflows-workflow-menu__output-content pre{background:#f0f0f0;border-radius:2px;color:#1e1e1e;font-size:12px;line-height:1.5;margin:0;overflow-wrap:anywhere;padding:12px;white-space:pre-wrap}.workflows-workflow-menu__output-error{background:#e0e0e0;border:1px solid #9e1313;border-radius:2px;color:#cc1818;padding:12px}.workflows-workflow-menu__output-error p{font-size:13px;margin:0}.workflows-workflow-menu__empty:not(:empty),.workflows-workflow-menu__executing:not(:empty){justify-content:center;padding:8px 0 16px}"));
	document.head.appendChild(style);
}
/**
* Constants
*/
const EMPTY_ARRAY = [];
const inputLabel = (0, import_i18n.__)("Run abilities and workflows");
/**
* @ignore
*/
function WorkflowMenu() {
	const { registerShortcut } = (0, import_data.useDispatch)(import_keyboard_shortcuts.store);
	const [isOpen, setIsOpen] = (0, import_element.useState)(false);
	(0, import_element.useEffect)(() => {
		registerShortcut({
			name: "core/workflows",
			category: "global",
			description: (0, import_i18n.__)("Open the workflow palette."),
			keyCombination: {
				modifier: "primary",
				character: "j"
			}
		});
	}, [registerShortcut]);
	(0, import_keyboard_shortcuts.useShortcut)("core/workflows", (0, import_keycodes.withIgnoreIMEEvents)((event) => {
		if (event.defaultPrevented) return;
		event.preventDefault();
		setIsOpen((open) => !open);
	}));
	(0, import_element.useEffect)(() => {
		if (isOpen) import("@wordpress/core-abilities");
	}, [isOpen]);
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowPalette, { onClose: () => setIsOpen(false) });
}
function WorkflowPalette({ onClose }) {
	const [search$1, setSearch] = (0, import_element.useState)("");
	const [abilityOutput, setAbilityOutput] = (0, import_element.useState)(null);
	const [isExecuting, setIsExecuting] = (0, import_element.useState)(false);
	const containerRef = (0, import_element.useRef)(null);
	const inputRef = (0, import_element.useRef)(null);
	const abilities = (0, import_data.useSelect)((select) => {
		return select(store).getAbilities() || EMPTY_ARRAY;
	}, []);
	const filteredAbilities = (0, import_element.useMemo)(() => {
		if (!search$1) return abilities;
		const searchLower = search$1.toLowerCase();
		return abilities.filter((ability) => ability.label.toLowerCase().includes(searchLower) || ability.name.toLowerCase().includes(searchLower));
	}, [abilities, search$1]);
	(0, import_element.useEffect)(() => {
		if (abilityOutput && containerRef.current) containerRef.current.focus();
	}, [abilityOutput]);
	(0, import_element.useEffect)(() => {
		if (!abilityOutput) inputRef.current?.focus();
	}, [abilityOutput]);
	const goBack = () => {
		setAbilityOutput(null);
		setIsExecuting(false);
		setSearch("");
	};
	const handleExecuteAbility = async (ability) => {
		setIsExecuting(true);
		const details = {
			name: ability.name,
			label: ability.label || ability.name,
			description: ability.description || ""
		};
		try {
			const result = await executeAbility(ability.name);
			setAbilityOutput({
				...details,
				success: true,
				data: result
			});
		} catch (error) {
			setAbilityOutput({
				...details,
				success: false,
				error: getErrorMessage(error)
			});
		} finally {
			setIsExecuting(false);
		}
	};
	const onContainerKeyDown = (event) => {
		if (abilityOutput && (event.key === "Escape" || event.key === "Backspace" || event.key === "Delete")) {
			event.preventDefault();
			event.stopPropagation();
			goBack();
		}
	};
	const items = isExecuting ? EMPTY_ARRAY : filteredAbilities;
	const showEmpty = !isExecuting && !!search$1 && !filteredAbilities.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Modal, {
		className: "workflows-workflow-menu",
		overlayClassName: "workflows-workflow-menu__overlay",
		onRequestClose: abilityOutput ? goBack : onClose,
		__experimentalHideHeader: true,
		contentLabel: (0, import_i18n.__)("Workflow palette"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "workflows-workflow-menu__container",
			onKeyDown: (0, import_keycodes.withIgnoreIMEEvents)(onContainerKeyDown),
			ref: containerRef,
			tabIndex: -1,
			role: "presentation",
			children: abilityOutput ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "workflows-workflow-menu__output",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "workflows-workflow-menu__output-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: abilityOutput.label }), abilityOutput.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "workflows-workflow-menu__output-hint",
						children: abilityOutput.description
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "workflows-workflow-menu__output-content",
					children: abilityOutput.success ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: JSON.stringify(abilityOutput.data, null, 2) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "workflows-workflow-menu__output-error",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: abilityOutput.error })
					})
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
				items: abilities,
				filteredItems: items,
				mode: "list",
				value: search$1,
				onValueChange: setSearch,
				open: true,
				inline: true,
				autoHighlight: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						ref: inputRef,
						placeholder: inputLabel,
						"aria-label": inputLabel,
						className: "workflows-workflow-menu__input",
						render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$2, { prefix: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputLayout.Slot, {
							padding: "minimal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								icon: search_default,
								style: (0, import_i18n.isRTL)() ? void 0 : { transform: "scaleX(-1)" }
							})
						}) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, {
						className: "workflows-workflow-menu__executing",
						children: isExecuting ? (0, import_i18n.__)("Executing ability…") : null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						className: "workflows-workflow-menu__empty",
						children: showEmpty ? (0, import_i18n.__)("No results found.") : null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
						className: "workflows-workflow-menu__list",
						"aria-label": (0, import_i18n.__)("Workflow suggestions"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBody, {
							className: "workflows-workflow-menu__list-body",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collection, { children: (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
								value: item,
								className: "workflows-workflow-menu__item",
								onClick: () => handleExecuteAbility(item),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForwardedItemLabel, {
									className: "workflows-workflow-menu__item-label",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.TextHighlight, {
										text: item.label,
										highlight: search$1
									})
								})
							}, item.name) })
						})
					})
				]
			})
		})
	});
}

// packages/workflow/build-module/index.mjs
const root = document.createElement("div");
document.body.appendChild(root);
(0, import_element.createRoot)(root).render((0, import_element.createElement)(WorkflowMenu));

//# sourceMappingURL=index.js.map