(function(exports, _wordpress_element, _wordpress_block_library, _wordpress_widgets, _wordpress_blocks, _wordpress_data, _wordpress_preferences, _wordpress_i18n, react, react_jsx_runtime, react_dom, _wordpress_primitives, _wordpress_compose, _wordpress_a11y, _wordpress_theme, _wordpress_private_apis, _wordpress_components, _wordpress_hooks, _wordpress_core_data, _wordpress_block_editor, _wordpress_media_utils, _wordpress_keycodes, _wordpress_keyboard_shortcuts, _wordpress_is_shallow_equal, _wordpress_dom) {

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

react = __toESM(react, 1);
react_dom = __toESM(react_dom, 1);

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
		react.useEffect(fn, EMPTY_ARRAY);
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
	const startingStyle$1 = "data-starting-style";
	/**
	* Present when the component is animating out.
	*/
	const endingStyle$1 = "data-ending-style";

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
				const startingStyleAttribute = startingStyle$1;
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
	const STARTING_HOOK = { [startingStyle$1]: "" };
	const ENDING_HOOK = { [endingStyle$1]: "" };
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
/**
	* Renders an SVG icon with a 24px default size.
	*
	* ```jsx
	* import { wordpress } from '@wordpress/icons';
	*
	* <Icon icon={ wordpress } />
	* ```
	*/
	const Icon = (0, _wordpress_element.forwardRef)(function UnforwardedIcon({ icon, size = 24, style, ...restProps }, ref) {
		const mergedStyle = icon.props.style || style ? {
			...icon.props.style,
			...style
		} : void 0;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
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
		const { current: isControlled } = react.useRef(controlled !== void 0);
		const [valueState, setValue] = react.useState(() => defaultProp);
		const value = isControlled && controlled !== void 0 ? controlled : valueState;
		{
			react.useEffect(() => {
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
			const { current: defaultValue } = react.useRef(defaultProp);
			react.useEffect(() => {
				if (!isControlled && serializeToDevModeString(defaultValue) !== serializeToDevModeString(defaultProp)) error([`A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. To suppress this warning opt to use a controlled ${name}.`].join("\n"));
			}, [defaultProp]);
		}
		return [value, react.useCallback((newValue) => {
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
	function useId(idOverride, prefix) {
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
		return useId(idOverride, "base-ui");
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/root/useCollapsibleRoot.mjs
	function useCollapsibleRoot(parameters) {
		const { open: openParam, defaultOpen = false, onOpenChange, disabled } = parameters;
		const [open, setOpen] = useControlled({
			controlled: openParam,
			default: defaultOpen,
			name: "Collapsible",
			state: "open"
		});
		const { mounted, setMounted, transitionStatus } = useTransitionStatus(open, true, true);
		const defaultPanelId = useBaseUiId();
		const [registeredPanelId, setPanelIdState] = react.useState();
		const panelId = registeredPanelId === null ? void 0 : registeredPanelId ?? defaultPanelId;
		const handleTrigger = useStableCallback((event) => {
			const nextOpen = !open;
			const eventDetails = createChangeEventDetails(triggerPress, event.nativeEvent);
			onOpenChange(nextOpen, eventDetails);
			if (eventDetails.isCanceled) return;
			setOpen(nextOpen);
		});
		return react.useMemo(() => ({
			defaultPanelId,
			disabled,
			handleTrigger,
			mounted,
			open,
			panelId,
			setMounted,
			setOpen,
			setPanelIdState,
			transitionStatus
		}), [
			defaultPanelId,
			disabled,
			handleTrigger,
			mounted,
			open,
			panelId,
			setMounted,
			setOpen,
			setPanelIdState,
			transitionStatus
		]);
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/root/CollapsibleRootContext.mjs
	const CollapsibleRootContext = /*#__PURE__*/ react.createContext(void 0);
	CollapsibleRootContext.displayName = "CollapsibleRootContext";
	function useCollapsibleRootContext() {
		const context = react.useContext(CollapsibleRootContext);
		if (context === void 0) throw new Error("Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.");
		return context;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/panel/CollapsiblePanelDataAttributes.mjs
/**
	* Present when the collapsible panel is open.
	*/
	const open = "data-open";
	/**
	* Present when the collapsible panel is closed.
	*/
	const closed = "data-closed";
	/**
	* Present when the panel begins animating in.
	*/
	const startingStyle = startingStyle$1;
	/**
	* Present when the panel is animating out.
	*/
	const endingStyle = endingStyle$1;

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/trigger/CollapsibleTriggerDataAttributes.mjs
/**
	* Present when the collapsible panel is open.
	*/
	const panelOpen = "data-panel-open";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/collapsibleOpenStateMapping.mjs
	const PANEL_OPEN_HOOK = { [open]: "" };
	const PANEL_CLOSED_HOOK = { [closed]: "" };
	const triggerOpenStateMapping = { open(value) {
		if (value) return { [panelOpen]: "" };
		return null;
	} };
	const collapsibleOpenStateMapping = { open(value) {
		if (value) return PANEL_OPEN_HOOK;
		return PANEL_CLOSED_HOOK;
	} };

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
	const CompositeRootContext = /*#__PURE__*/ react.createContext(void 0);
	CompositeRootContext.displayName = "CompositeRootContext";
	function useCompositeRootContext(optional = false) {
		const context = react.useContext(CompositeRootContext);
		if (context === void 0 && !optional) throw new Error("Base UI: CompositeRootContext is missing. Composite parts must be placed within <Composite.Root>.");
		return context;
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/utils/useFocusableWhenDisabled.mjs
	function useFocusableWhenDisabled(parameters) {
		const { focusableWhenDisabled, disabled, composite = false, tabIndex: tabIndexProp = 0, isNativeButton } = parameters;
		const isFocusableComposite = composite && focusableWhenDisabled !== false;
		const isNonFocusableComposite = composite && focusableWhenDisabled === false;
		return { props: react.useMemo(() => {
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
		const elementRef = react.useRef(null);
		const compositeRootContext = useCompositeRootContext(true);
		const isCompositeItem = compositeProp ?? compositeRootContext !== void 0;
		const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled({
			focusableWhenDisabled,
			disabled,
			composite: isCompositeItem,
			tabIndex,
			isNativeButton
		});
		react.useEffect(() => {
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
		const updateDisabled = react.useCallback(() => {
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
			getButtonProps: react.useCallback((externalProps = {}) => {
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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/panel/useCollapsiblePanel.mjs
	const EMPTY_DIMENSIONS = {
		height: void 0,
		width: void 0
	};
	function useCollapsiblePanel(parameters) {
		const { externalRef, hiddenUntilFound, id: idParam, keepMounted, mounted, onOpenChange, open, setMounted, setOpen, transitionStatus } = parameters;
		const panelRef = react.useRef(null);
		const animationTypeRef = react.useRef(null);
		const [dimensions, setDimensionsUnwrapped] = react.useState(EMPTY_DIMENSIONS);
		const lastMeasuredDimensionsRef = react.useRef(EMPTY_DIMENSIONS);
		const shouldSkipNextOpenRef = react.useRef(false);
		const shouldPreventMountAnimationRef = react.useRef(open);
		const shouldPreventActivityResumeAnimationRef = react.useRef(false);
		const [forcePanelIdle, setForcePanelIdle] = react.useState(false);
		const pendingTemporaryStyleRestoreRef = react.useRef(null);
		const mergedPanelRef = useMergedRefs(externalRef, panelRef);
		const latestOpenRef = useValueAsRef(open);
		const runOnceCloseAnimationsFinish = useAnimationsFinished(panelRef);
		const hidden = !open && !mounted;
		const panelTransitionStatus = forcePanelIdle ? "idle" : transitionStatus;
		const shouldPreventOpenAnimation = open && (shouldPreventMountAnimationRef.current || shouldPreventActivityResumeAnimationRef.current);
		const renderedDimensions = !open && mounted && animationTypeRef.current === "css-animation" && dimensions.height === void 0 && dimensions.width === void 0 ? lastMeasuredDimensionsRef.current : dimensions;
		const shouldPersistHiddenTransitionStyles = hiddenUntilFound && hidden && animationTypeRef.current !== "css-animation";
		const setDimensions = useStableCallback((nextDimensions, shouldCacheMeasurement = true) => {
			if (shouldCacheMeasurement) lastMeasuredDimensionsRef.current = nextDimensions;
			setDimensionsUnwrapped(nextDimensions);
		});
		const restorePendingTemporaryStyle = useStableCallback(() => {
			pendingTemporaryStyleRestoreRef.current?.();
			pendingTemporaryStyleRestoreRef.current = null;
		});
		const setPendingTemporaryStyleRestore = useStableCallback((restore) => {
			restorePendingTemporaryStyle();
			pendingTemporaryStyleRestoreRef.current = () => {
				pendingTemporaryStyleRestoreRef.current = null;
				restore();
			};
		});
		const markActivityResumeAnimationSuppressed = useStableCallback(() => {
			if (open && mounted && animationTypeRef.current === "css-animation") shouldPreventActivityResumeAnimationRef.current = true;
		});
		useIsoLayoutEffect(() => {
			if (!forcePanelIdle || transitionStatus === "starting") return;
			setForcePanelIdle(false);
		}, [forcePanelIdle, transitionStatus]);
		react.useEffect(() => {
			return () => {
				markActivityResumeAnimationSuppressed();
				restorePendingTemporaryStyle();
			};
		}, [markActivityResumeAnimationSuppressed, restorePendingTemporaryStyle]);
		useIsoLayoutEffect(() => {
			if (!open) {
				shouldPreventMountAnimationRef.current = false;
				shouldPreventActivityResumeAnimationRef.current = false;
			}
			const panel = panelRef.current;
			if (!panel) return;
			if (!open && pendingTemporaryStyleRestoreRef.current) restorePendingTemporaryStyle();
			const animationType = getAnimationType(panel, shouldPreventOpenAnimation);
			animationTypeRef.current = animationType;
			if (open && transitionStatus === "idle" && shouldPreventMountAnimationRef.current && animationType === "css-animation") {
				lastMeasuredDimensionsRef.current = getDimensions(panel);
				return;
			}
			if (open && transitionStatus === "starting") {
				const skipNextOpen = shouldSkipNextOpenRef.current;
				shouldSkipNextOpenRef.current = false;
				if (animationType === "none") {
					setDimensions(getDimensions(panel));
					setForcePanelIdle(true);
					return;
				}
				if (animationType === "css-transition") {
					const restoreLayoutStyles = resetLayoutStyles(panel);
					setDimensions(getDimensions(panel));
					if (!skipNextOpen) return restoreLayoutStyles;
					const restoreTransitionDuration = setTemporaryStyle(panel, "transition-duration", "0s");
					setPendingTemporaryStyleRestore(restoreTransitionDuration);
					setForcePanelIdle(true);
					return restoreLayoutStyles;
				}
				setDimensions(getDimensions(panel));
				const restoreAnimationName = setTemporaryStyle(panel, "animation-name", "none");
				if (!skipNextOpen) {
					restoreAnimationName();
					return;
				}
				const restoreAnimationDuration = setTemporaryStyle(panel, "animation-duration", "0s");
				restoreAnimationName();
				setPendingTemporaryStyleRestore(restoreAnimationDuration);
				setForcePanelIdle(true);
				return;
			}
			if (!open && mounted && (transitionStatus === "idle" || transitionStatus === "starting")) {
				if (animationType === "none") {
					setDimensions(EMPTY_DIMENSIONS, false);
					setMounted(false);
					return;
				}
				setDimensions(getDimensions(panel));
				return;
			}
			if (transitionStatus !== "ending") return;
			if (animationType === "none") {
				setMounted(false);
				return;
			}
			const nextDimensions = getDimensions(panel);
			if (!(nextDimensions.height > 0 || nextDimensions.width > 0)) {
				setMounted(false);
				return;
			}
			setDimensions(nextDimensions);
			if (animationType === "css-animation") setTemporaryStyle(panel, "animation-name", "none")();
		}, [
			mounted,
			open,
			restorePendingTemporaryStyle,
			setDimensions,
			setMounted,
			setPendingTemporaryStyleRestore,
			shouldPreventOpenAnimation,
			transitionStatus
		]);
		useOpenChangeComplete({
			enabled: open && mounted && panelTransitionStatus === "idle",
			open: true,
			ref: panelRef,
			onComplete() {
				if (!open) return;
				setDimensions(EMPTY_DIMENSIONS, false);
			}
		});
		react.useEffect(() => {
			if (open || !mounted || panelTransitionStatus !== "ending") return;
			if (!panelRef.current) {
				setMounted(false);
				setDimensions(EMPTY_DIMENSIONS, false);
				return;
			}
			const abortController = new AbortController();
			let endingStyleFrame = -1;
			function handleComplete() {
				if (latestOpenRef.current) return;
				setMounted(false);
				setDimensions(EMPTY_DIMENSIONS, false);
			}
			endingStyleFrame = AnimationFrame.request(() => {
				runOnceCloseAnimationsFinish(handleComplete, abortController.signal);
			});
			return () => {
				AnimationFrame.cancel(endingStyleFrame);
				abortController.abort();
			};
		}, [
			latestOpenRef,
			mounted,
			open,
			panelTransitionStatus,
			runOnceCloseAnimationsFinish,
			setDimensions,
			setMounted
		]);
		useIsoLayoutEffect(() => {
			const panel = panelRef.current;
			if (!panel || !hiddenUntilFound || !hidden) return;
			panel.setAttribute("hidden", "until-found");
		}, [hidden, hiddenUntilFound]);
		react.useEffect(function registerBeforeMatchListener() {
			const panel = panelRef.current;
			if (!panel) return;
			const revealDecisionTimeout = Timeout.create();
			let revertRevealFrame = -1;
			const scheduleRevealRevert = (revertSkippedMotion, restoreStartingStyle) => {
				revealDecisionTimeout.start(0, () => {
					if (latestOpenRef.current) return;
					revertRevealFrame = AnimationFrame.request(() => {
						if (latestOpenRef.current) return;
						if (revertSkippedMotion) shouldSkipNextOpenRef.current = false;
						if (restoreStartingStyle) panel.setAttribute(startingStyle, "");
						panel.setAttribute("hidden", "until-found");
					});
				});
			};
			const handleBeforeMatch = (event) => {
				const eventDetails = createChangeEventDetails(none, event);
				onOpenChange(true, eventDetails);
				if (eventDetails.isCanceled) {
					scheduleRevealRevert(false, false);
					return;
				}
				shouldSkipNextOpenRef.current = true;
				const hadStartingStyle = panel.hasAttribute(startingStyle);
				panel.removeAttribute(startingStyle);
				setOpen(true);
				scheduleRevealRevert(true, hadStartingStyle);
			};
			const cleanupBeforeMatchListener = addEventListener(panel, "beforematch", handleBeforeMatch);
			return () => {
				revealDecisionTimeout.clear();
				AnimationFrame.cancel(revertRevealFrame);
				cleanupBeforeMatchListener();
			};
		}, [
			latestOpenRef,
			onOpenChange,
			setOpen
		]);
		const shouldRender = keepMounted || hiddenUntilFound || mounted || open;
		return {
			height: renderedDimensions.height,
			props: {
				...shouldPersistHiddenTransitionStyles ? { [startingStyle]: "" } : void 0,
				hidden,
				id: idParam
			},
			ref: mergedPanelRef,
			shouldPreventOpenAnimation,
			shouldRender,
			transitionStatus: panelTransitionStatus,
			width: renderedDimensions.width
		};
	}
	function getDimensions(element) {
		return {
			height: element.scrollHeight,
			width: element.scrollWidth
		};
	}
	function getAnimationType(element, hasSuppressedMountAnimation) {
		const panelStyles = getWindow(element).getComputedStyle(element);
		const hasAnimation = (panelStyles.animationName.split(",").map((name) => name.trim()).some((name) => name !== "" && name !== "none") || hasSuppressedMountAnimation) && hasNonZeroDuration(panelStyles.animationDuration);
		const hasTransition = hasNonZeroDuration(panelStyles.transitionDuration);
		if (hasAnimation && hasTransition) {
			warn("CSS transitions and CSS animations both detected on Collapsible or Accordion panel.", "Only one of either animation type should be used.");
			return "css-transition";
		}
		if (hasTransition) return "css-transition";
		if (hasAnimation) return "css-animation";
		return "none";
	}
	function hasNonZeroDuration(value) {
		return value.split(",").map((part) => part.trim()).some((part) => part !== "" && Number.parseFloat(part) > 0);
	}
	/**
	* Temporarily overrides an inline style property and returns a cleanup that
	* restores the previous inline value and priority.
	* @param element - The element whose inline style should be updated.
	* @param property - The CSS property name to override.
	* @param value - The temporary value to assign.
	* @returns A cleanup function that restores the original inline style state.
	*/
	function setTemporaryStyle(element, property, value) {
		const previousValue = element.style.getPropertyValue(property);
		const previousPriority = element.style.getPropertyPriority(property);
		element.style.setProperty(property, value);
		return () => {
			if (previousValue === "") {
				element.style.removeProperty(property);
				return;
			}
			element.style.setProperty(property, previousValue, previousPriority);
		};
	}
	/**
	* Temporarily resets inline alignment styles that can distort scroll-based
	* size measurements, then restores them on the next animation frame.
	* @param element - The panel element being measured.
	* @returns A cleanup function that cancels the scheduled restore and reapplies
	* the original inline layout styles immediately.
	*/
	function resetLayoutStyles(element) {
		const originalLayoutStyles = {
			"justify-content": element.style.justifyContent,
			"align-items": element.style.alignItems,
			"align-content": element.style.alignContent,
			"justify-items": element.style.justifyItems
		};
		Object.keys(originalLayoutStyles).forEach((key) => {
			element.style.setProperty(key, "initial", "important");
		});
		function restoreLayoutStyles() {
			Object.entries(originalLayoutStyles).forEach(([key, value]) => {
				if (value === "") {
					element.style.removeProperty(key);
					return;
				}
				element.style.setProperty(key, value);
			});
		}
		const frame = AnimationFrame.request(restoreLayoutStyles);
		return () => {
			AnimationFrame.cancel(frame);
			restoreLayoutStyles();
		};
	}

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/button/Button.mjs
/**
	* A button component that can be used to trigger actions.
	* Renders a `<button>` element.
	*
	* Documentation: [Base UI Button](https://base-ui.com/react/components/button)
	*/
	const Button$5 = /*#__PURE__*/ react.forwardRef(function Button(componentProps, forwardedRef) {
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
	Button$5.displayName = "Button";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/root/stateAttributesMapping.mjs
	const collapsibleStateAttributesMapping = {
		...collapsibleOpenStateMapping,
		...transitionStatusMapping
	};

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/root/CollapsibleRoot.mjs
/**
	* Groups all parts of the collapsible.
	* Renders a `<div>` element.
	*
	* Documentation: [Base UI Collapsible](https://base-ui.com/react/components/collapsible)
	*/
	const CollapsibleRoot = /*#__PURE__*/ react.forwardRef(function CollapsibleRoot(componentProps, forwardedRef) {
		const { render, className, defaultOpen = false, disabled = false, onOpenChange: onOpenChangeProp, open, style, ...elementProps } = componentProps;
		const onOpenChange = useStableCallback(onOpenChangeProp);
		const collapsible = useCollapsibleRoot({
			open,
			defaultOpen,
			onOpenChange,
			disabled
		});
		const state = react.useMemo(() => ({
			open: collapsible.open,
			disabled: collapsible.disabled,
			transitionStatus: collapsible.transitionStatus
		}), [
			collapsible.open,
			collapsible.disabled,
			collapsible.transitionStatus
		]);
		const contextValue = react.useMemo(() => ({
			...collapsible,
			onOpenChange,
			state
		}), [
			collapsible,
			onOpenChange,
			state
		]);
		const element = useRenderElement("div", componentProps, {
			state,
			ref: forwardedRef,
			props: elementProps,
			stateAttributesMapping: collapsibleStateAttributesMapping
		});
		return /*#__PURE__*/ (0, react_jsx_runtime.jsx)(CollapsibleRootContext.Provider, {
			value: contextValue,
			children: element
		});
	});
	CollapsibleRoot.displayName = "CollapsibleRoot";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/trigger/CollapsibleTrigger.mjs
	const stateAttributesMapping = {
		...triggerOpenStateMapping,
		...transitionStatusMapping
	};
	/**
	* A button that opens and closes the collapsible panel.
	* Renders a `<button>` element.
	*
	* Documentation: [Base UI Collapsible](https://base-ui.com/react/components/collapsible)
	*/
	const CollapsibleTrigger = /*#__PURE__*/ react.forwardRef(function CollapsibleTrigger(componentProps, forwardedRef) {
		const { panelId, open, handleTrigger, state, disabled: contextDisabled } = useCollapsibleRootContext();
		const { className, disabled = contextDisabled, render, nativeButton = true, style, ...elementProps } = componentProps;
		const { getButtonProps, buttonRef } = useButton({
			disabled,
			native: nativeButton
		});
		return useRenderElement("button", componentProps, {
			state,
			ref: [forwardedRef, buttonRef],
			props: [
				{
					"aria-controls": open ? panelId : void 0,
					"aria-expanded": open,
					onClick: handleTrigger
				},
				elementProps,
				getButtonProps
			],
			stateAttributesMapping
		});
	});
	CollapsibleTrigger.displayName = "CollapsibleTrigger";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/panel/CollapsiblePanelCssVars.mjs
/**
	* The collapsible panel's height.
	* @type {number}
	*/
	const collapsiblePanelHeight = "--collapsible-panel-height";
	/**
	* The collapsible panel's width.
	* @type {number}
	*/
	const collapsiblePanelWidth = "--collapsible-panel-width";

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/collapsible/panel/CollapsiblePanel.mjs
/**
	* A panel with the collapsible contents.
	* Renders a `<div>` element.
	*
	* Documentation: [Base UI Collapsible](https://base-ui.com/react/components/collapsible)
	*/
	const CollapsiblePanel = /*#__PURE__*/ react.forwardRef(function CollapsiblePanel(componentProps, forwardedRef) {
		const { className, hiddenUntilFound: hiddenUntilFoundProp, keepMounted: keepMountedProp, render, id: idProp, style, ...elementProps } = componentProps;
		react.useEffect(() => {
			if (hiddenUntilFoundProp && keepMountedProp === false) warn("The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.");
		}, [hiddenUntilFoundProp, keepMountedProp]);
		const { defaultPanelId, mounted, onOpenChange, open, setMounted, setPanelIdState, setOpen, state, transitionStatus } = useCollapsibleRootContext();
		const hiddenUntilFound = hiddenUntilFoundProp ?? false;
		const keepMounted = keepMountedProp ?? false;
		const registeredId = idProp || void 0;
		const id = registeredId ?? defaultPanelId;
		useIsoLayoutEffect(() => {
			setPanelIdState((currentId) => registeredId ?? (currentId === null ? void 0 : currentId));
			return () => {
				setPanelIdState((currentId) => currentId === registeredId ? null : currentId);
			};
		}, [registeredId, setPanelIdState]);
		const { height, props, ref, shouldPreventOpenAnimation, shouldRender, transitionStatus: panelTransitionStatus, width } = useCollapsiblePanel({
			externalRef: forwardedRef,
			hiddenUntilFound,
			id,
			keepMounted,
			mounted,
			onOpenChange,
			open,
			setMounted,
			setOpen,
			transitionStatus
		});
		const panelState = {
			...state,
			transitionStatus: panelTransitionStatus
		};
		const resolvedStyle = resolveStyle(style, panelState);
		const element = useRenderElement("div", {
			...componentProps,
			style: void 0
		}, {
			state: panelState,
			ref,
			props: [
				props,
				{ style: {
					[collapsiblePanelHeight]: height === void 0 ? "auto" : `${height}px`,
					[collapsiblePanelWidth]: width === void 0 ? "auto" : `${width}px`
				} },
				elementProps,
				resolvedStyle ? { style: resolvedStyle } : void 0,
				shouldPreventOpenAnimation ? { style: { animationName: "none" } } : void 0
			],
			stateAttributesMapping: collapsibleStateAttributesMapping
		});
		if (!shouldRender) return null;
		return element;
	});
	CollapsiblePanel.displayName = "CollapsiblePanel";

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
	registerStyle$15("b081213352", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.da418dc15e63be57__spinner{background-color:transparent;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:inline-block;height:var(--wpds-dimension-size-2xs,16px);opacity:1;overflow:visible;position:relative;width:var(--wpds-dimension-size-2xs,16px)}._8b83deccaefa3c92__indicator{fill:transparent;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;transform-origin:50% 50%;@media (forced-colors:active){stroke:CanvasText}animation:_0da63cf2c7b08803__spinner-spin 1.4s linear infinite both}@keyframes _0da63cf2c7b08803__spinner-spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}}}");
	var style_module_default$15 = {
		"spinner": "da418dc15e63be57__spinner",
		"indicator": "_8b83deccaefa3c92__indicator",
		"spinner-spin": "_0da63cf2c7b08803__spinner-spin"
	};
	/**
	* A component used to notify users that their action is being processed.
	*/
	const Spinner = (0, _wordpress_element.forwardRef)(function UnforwardedSpinner({ className, color, style, ...props }, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
			className: clsx(style_module_default$15.spinner, className),
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
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				className: style_module_default$15.indicator,
				d: "m 12 0 a 12 12 0 0 1 0 24"
			})
		});
	});

// packages/ui/build-module/button/button.mjs
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
	registerStyle$14("5213e69d1b", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._0065622adacf164b__is-unstyled,.da200133bf43fd5b__button{appearance:none;padding:0}.da200133bf43fd5b__button{--wp-ui-button-font-weight:var(--wpds-typography-font-weight-emphasis,600);--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-strong,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand-strong,#fff);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-strong-disabled,#8d8d8d);--wp-ui-button-padding-block:var(--wpds-dimension-padding-xs,4px);--wp-ui-button-padding-inline:var(--wpds-dimension-padding-md,12px);--wp-ui-button-height:var(--wpds-dimension-size-lg,40px);--wp-ui-button-aspect-ratio:auto;--wp-ui-button-font-size:var(--wpds-typography-font-size-md,13px);--wp-ui-button-min-width:calc(4ch + var(--wp-ui-button-padding-inline)*2);--wp-ui-button-icon-margin:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2);--wp-ui-button-border-color:var(--wp-ui-button-background-color);--wp-ui-button-border-color-active:var(--wp-ui-button-background-color-active);--wp-ui-button-border-color-disabled:var(--wp-ui-button-background-color-disabled);--_gcd-button-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_gcd-button-font-size:var(--wp-ui-button-font-size);--_gcd-button-font-weight:var(--wp-ui-button-font-weight);align-items:center;aspect-ratio:var(--wp-ui-button-aspect-ratio);background-clip:border-box;background-color:var(--wp-ui-button-background-color);border-color:var(--wp-ui-button-border-color);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:1px;color:var(--wp-ui-button-foreground-color);display:inline-flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wp-ui-button-font-size);font-weight:var(--wp-ui-button-font-weight);gap:var(--wpds-dimension-gap-sm,8px);justify-content:center;line-height:var(--wpds-typography-line-height-sm,20px);max-width:100%;min-height:var(--wp-ui-button-height);min-width:var(--wp-ui-button-min-width);overflow-wrap:anywhere;padding-block:var(--wp-ui-button-padding-block);padding-inline:var(--wp-ui-button-padding-inline);position:relative;text-align:center;text-decoration:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}@media not (prefers-reduced-motion){transition:color .1s ease-out;*{transition:opacity .1s ease-out}}&[href]{cursor:pointer}[href]{color:inherit;text-decoration:inherit}&:not([data-disabled]):is(:hover,:active,:focus){background-color:var(--wp-ui-button-background-color-active);border-color:var(--wp-ui-button-border-color-active);color:var(--wp-ui-button-foreground-color-active)}&[data-disabled]:not(.ae4e86385fc09ecb__is-loading){background-color:var(--wp-ui-button-background-color-disabled);border-color:var(--wp-ui-button-border-color-disabled);color:var(--wp-ui-button-foreground-color-disabled);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText;color:GrayText}}}._1cca9af13b50959b__is-small{--wp-ui-button-padding-block:0px;--wp-ui-button-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-button-height:var(--wpds-dimension-size-sm,24px)}._320003790ac7a216__icon{flex-shrink:0;margin:var(--wp-ui-button-icon-margin)}.eda8df1bde0ae086__is-brand{&._3bda8905a262d2ef__is-minimal,&._70a943b10bcba04a__is-outline{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-disabled,#8d8d8d)}&._70a943b10bcba04a__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 85%,#000));--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-brand-disabled,#dbdbdb)}&._3bda8905a262d2ef__is-minimal{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000)}}.f708f8ed51243739__is-neutral{&._0e80760ce7e45532__is-solid,&._3bda8905a262d2ef__is-minimal[aria-pressed=true]{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-strong,#2d2d2d);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-strong-active,#1e1e1e);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral-strong,#f0f0f0);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-strong-active,#f0f0f0);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-strong-disabled,#8d8d8d)}&._3bda8905a262d2ef__is-minimal:not([aria-pressed=true]),&._70a943b10bcba04a__is-outline{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}&._70a943b10bcba04a__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e);--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb)}&._3bda8905a262d2ef__is-minimal:not([aria-pressed=true]){--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000)}&._3bda8905a262d2ef__is-minimal[aria-pressed=true]:not(.ae4e86385fc09ecb__is-loading){@media (forced-colors:active){background-color:SelectedItem;border-bottom-color:ButtonBorder;border-left-color:ButtonBorder;border-right-color:ButtonBorder;border-top-color:ButtonBorder;color:SelectedItemText;forced-color-adjust:none;outline-color:CanvasText;&[data-disabled]{background-color:GrayText;border-color:GrayText;color:Canvas}}}}._0065622adacf164b__is-unstyled{background:none;border:none;min-width:unset}._4ba48af8eff8f26b__is-compact{--wp-ui-button-height:var(--wpds-dimension-size-md,32px)}.ae4e86385fc09ecb__is-loading:not(._0065622adacf164b__is-unstyled){color:transparent;&:not([data-disabled]):is(:hover,:active,:focus){color:transparent}@media (forced-colors:active){color:ButtonFace}>:not(.fb9402966b19ed5d__spinner){opacity:0}}}@layer compositions{.fb9402966b19ed5d__spinner{color:var(--wp-ui-button-foreground-color);height:var(--wp-ui-button-font-size);inset:0;margin:auto;pointer-events:none;position:absolute;width:var(--wp-ui-button-font-size);>*{stroke-width:2.75}@media (prefers-reduced-motion){>*{animation:none}}@media (forced-colors:active){>*{stroke:ButtonText}}}}}");
	var style_module_default$14 = {
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
	registerStyle$14("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
	var resets_module_default$2 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
	registerStyle$14("c13e206e92", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._0f52be5f1d4ce686__outset-ring--focus-within:focus-within,._8f922cee854f2408__outset-ring--focus-visible:focus-visible,.accedd6ae8fd878e__outset-ring--focus:focus{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within,.c20f61b115485a7f__outset-ring--focus-except-active:focus{outline:none}._3ad2c88c126f2bdd__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.c20f61b115485a7f__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
	var focus_module_default = {
		"outset-ring--focus": "accedd6ae8fd878e__outset-ring--focus",
		"outset-ring--focus-visible": "_8f922cee854f2408__outset-ring--focus-visible",
		"outset-ring--focus-within": "_0f52be5f1d4ce686__outset-ring--focus-within",
		"outset-ring--focus-except-active": "c20f61b115485a7f__outset-ring--focus-except-active",
		"outset-ring--focus-within-except-active": "_3ad2c88c126f2bdd__outset-ring--focus-within-except-active"
	};
	registerStyle$14("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
	/**
	* A versatile button component with multiple variants, tones, and sizes.
	*
	* See the [Usage Guidelines](https://wordpress.github.io/gutenberg/?path=/docs/design-system-components-button-usage-guidelines--docs)
	* for when to use `Button`, `IconButton`, `Link`, or `ButtonLink`.
	*/
	const Button$4 = (0, _wordpress_element.forwardRef)(function UnforwardedButton({ tone = "brand", variant = "solid", size = "default", className, focusableWhenDisabled = true, disabled, loading, loadingAnnouncement = (0, _wordpress_i18n.__)("Loading"), children, ...props }, ref) {
		const mergedClassName = clsx(global_css_defense_module_default$2.button, resets_module_default$2["box-sizing"], focus_module_default["outset-ring--focus-except-active"], variant !== "unstyled" && style_module_default$14.button, style_module_default$14[`is-${tone}`], style_module_default$14[`is-${variant}`], style_module_default$14[`is-${size}`], loading && style_module_default$14["is-loading"], className);
		(0, _wordpress_element.useEffect)(() => {
			if (loading && loadingAnnouncement) (0, _wordpress_a11y.speak)(loadingAnnouncement);
		}, [loading, loadingAnnouncement]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Button$5, {
			ref,
			className: mergedClassName,
			focusableWhenDisabled,
			disabled: disabled ?? loading,
			...props,
			children: [children, loading && variant !== "unstyled" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, { className: style_module_default$14.spinner })]
		});
	});

// packages/ui/build-module/button/icon.mjs
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
	registerStyle$13("5213e69d1b", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._0065622adacf164b__is-unstyled,.da200133bf43fd5b__button{appearance:none;padding:0}.da200133bf43fd5b__button{--wp-ui-button-font-weight:var(--wpds-typography-font-weight-emphasis,600);--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-strong,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand-strong,#fff);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-strong-disabled,#8d8d8d);--wp-ui-button-padding-block:var(--wpds-dimension-padding-xs,4px);--wp-ui-button-padding-inline:var(--wpds-dimension-padding-md,12px);--wp-ui-button-height:var(--wpds-dimension-size-lg,40px);--wp-ui-button-aspect-ratio:auto;--wp-ui-button-font-size:var(--wpds-typography-font-size-md,13px);--wp-ui-button-min-width:calc(4ch + var(--wp-ui-button-padding-inline)*2);--wp-ui-button-icon-margin:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2);--wp-ui-button-border-color:var(--wp-ui-button-background-color);--wp-ui-button-border-color-active:var(--wp-ui-button-background-color-active);--wp-ui-button-border-color-disabled:var(--wp-ui-button-background-color-disabled);--_gcd-button-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);--_gcd-button-font-size:var(--wp-ui-button-font-size);--_gcd-button-font-weight:var(--wp-ui-button-font-weight);align-items:center;aspect-ratio:var(--wp-ui-button-aspect-ratio);background-clip:border-box;background-color:var(--wp-ui-button-background-color);border-color:var(--wp-ui-button-border-color);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:1px;color:var(--wp-ui-button-foreground-color);display:inline-flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wp-ui-button-font-size);font-weight:var(--wp-ui-button-font-weight);gap:var(--wpds-dimension-gap-sm,8px);justify-content:center;line-height:var(--wpds-typography-line-height-sm,20px);max-width:100%;min-height:var(--wp-ui-button-height);min-width:var(--wp-ui-button-min-width);overflow-wrap:anywhere;padding-block:var(--wp-ui-button-padding-block);padding-inline:var(--wp-ui-button-padding-inline);position:relative;text-align:center;text-decoration:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}@media not (prefers-reduced-motion){transition:color .1s ease-out;*{transition:opacity .1s ease-out}}&[href]{cursor:pointer}[href]{color:inherit;text-decoration:inherit}&:not([data-disabled]):is(:hover,:active,:focus){background-color:var(--wp-ui-button-background-color-active);border-color:var(--wp-ui-button-border-color-active);color:var(--wp-ui-button-foreground-color-active)}&[data-disabled]:not(.ae4e86385fc09ecb__is-loading){background-color:var(--wp-ui-button-background-color-disabled);border-color:var(--wp-ui-button-border-color-disabled);color:var(--wp-ui-button-foreground-color-disabled);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText;color:GrayText}}}._1cca9af13b50959b__is-small{--wp-ui-button-padding-block:0px;--wp-ui-button-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-button-height:var(--wpds-dimension-size-sm,24px)}._320003790ac7a216__icon{flex-shrink:0;margin:var(--wp-ui-button-icon-margin)}.eda8df1bde0ae086__is-brand{&._3bda8905a262d2ef__is-minimal,&._70a943b10bcba04a__is-outline{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-disabled,#8d8d8d)}&._70a943b10bcba04a__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 85%,#000));--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-brand-disabled,#dbdbdb)}&._3bda8905a262d2ef__is-minimal{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000)}}.f708f8ed51243739__is-neutral{&._0e80760ce7e45532__is-solid,&._3bda8905a262d2ef__is-minimal[aria-pressed=true]{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-strong,#2d2d2d);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-strong-active,#1e1e1e);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral-strong,#f0f0f0);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-strong-active,#f0f0f0);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-strong-disabled,#8d8d8d)}&._3bda8905a262d2ef__is-minimal:not([aria-pressed=true]),&._70a943b10bcba04a__is-outline{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}&._70a943b10bcba04a__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e);--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb)}&._3bda8905a262d2ef__is-minimal:not([aria-pressed=true]){--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000)}&._3bda8905a262d2ef__is-minimal[aria-pressed=true]:not(.ae4e86385fc09ecb__is-loading){@media (forced-colors:active){background-color:SelectedItem;border-bottom-color:ButtonBorder;border-left-color:ButtonBorder;border-right-color:ButtonBorder;border-top-color:ButtonBorder;color:SelectedItemText;forced-color-adjust:none;outline-color:CanvasText;&[data-disabled]{background-color:GrayText;border-color:GrayText;color:Canvas}}}}._0065622adacf164b__is-unstyled{background:none;border:none;min-width:unset}._4ba48af8eff8f26b__is-compact{--wp-ui-button-height:var(--wpds-dimension-size-md,32px)}.ae4e86385fc09ecb__is-loading:not(._0065622adacf164b__is-unstyled){color:transparent;&:not([data-disabled]):is(:hover,:active,:focus){color:transparent}@media (forced-colors:active){color:ButtonFace}>:not(.fb9402966b19ed5d__spinner){opacity:0}}}@layer compositions{.fb9402966b19ed5d__spinner{color:var(--wp-ui-button-foreground-color);height:var(--wp-ui-button-font-size);inset:0;margin:auto;pointer-events:none;position:absolute;width:var(--wp-ui-button-font-size);>*{stroke-width:2.75}@media (prefers-reduced-motion){>*{animation:none}}@media (forced-colors:active){>*{stroke:ButtonText}}}}}");
	var style_module_default$13 = {
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
	const ButtonIcon = (0, _wordpress_element.forwardRef)(function UnforwardedButtonIcon({ className, icon, ...props }, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Icon, {
			ref,
			icon,
			className: clsx(style_module_default$13.icon, className),
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
	const Button$3 = Object.assign(Button$4, { 
	/**
	* An icon component specifically designed to work well when rendered inside
	* a `Button` component.
	*/
Icon: ButtonIcon });

// packages/icons/build-module/library/caution.mjs
	var caution_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M12 8L12 13M12 14.5L12 16M4.75 12C4.75 7.99593 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12Z",
			strokeLinejoin: "round"
		})
	});

// packages/icons/build-module/library/chevron-down.mjs
	var chevron_down_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M7 11L12 15L17 11" })
	});

// packages/icons/build-module/library/close-small.mjs
	var close_small_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M7.75 16.25L16.25 7.75M16.25 16.25L7.75 7.75" })
	});

// packages/icons/build-module/library/error.mjs
	var error_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M12 9L12 14M12 15.5V17M11.1284 5.04947L3.83827 18.0097C3.46331 18.6763 3.94502 19.5 4.70985 19.5H19.2902C20.055 19.5 20.5367 18.6763 20.1617 18.0097L12.8716 5.04947C12.4893 4.36982 11.5107 4.36982 11.1284 5.04947Z" })
	});

// packages/icons/build-module/library/external.mjs
	var external_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.5 6.25H6.5C5.80964 6.25 5.25 6.80964 5.25 7.5V17.5C5.25 18.1904 5.80964 18.75 6.5 18.75H16.5C17.1904 18.75 17.75 18.1904 17.75 17.5V14.5M11.5 12.5L18.75 5.25M12.5 5.25H18.75V11.5" })
	});

// packages/icons/build-module/library/info.mjs
	var info_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M12 16V11M12 9.5V8M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z",
			strokeLinejoin: "round"
		})
	});

// packages/icons/build-module/library/more-vertical.mjs
	var more_vertical_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
				d: "M11.75 18.25L12.25 18.25L12.25 17.75L11.75 17.75L11.75 18.25Z",
				fill: "currentColor",
				stroke: "none"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
				d: "M11.75 12.25L12.25 12.25L12.25 11.75L11.75 11.75L11.75 12.25Z",
				fill: "currentColor",
				stroke: "none"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
				d: "M11.75 6.25L12.25 6.25L12.25 5.75L11.75 5.75L11.75 6.25Z",
				fill: "currentColor",
				stroke: "none"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M11.75 18.25L12.25 18.25L12.25 17.75L11.75 17.75L11.75 18.25Z" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M11.75 12.25L12.25 12.25L12.25 11.75L11.75 11.75L11.75 12.25Z" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M11.75 6.25L12.25 6.25L12.25 5.75L11.75 5.75L11.75 6.25Z" })
		]
	});

// packages/icons/build-module/library/plus.mjs
	var plus_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M12 18V6M18 12H6" })
	});

// packages/icons/build-module/library/published.mjs
	var published_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25Z",
			strokeLinejoin: "round"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9 12L11 14L15 10" })]
	});

// packages/icons/build-module/library/redo.mjs
	var redo_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M15 15L18.5 11L15 7M18.5 11H8C5 11 4.75 13.8 4.75 17" })
	});

// packages/icons/build-module/library/undo.mjs
	var undo_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M8.25 15L4.75 11L8.25 7M4.75 11H15.25C18.25 11 18.5 13.8 18.5 17" })
	});

// packages/ui/build-module/visually-hidden/visually-hidden.mjs
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
	registerStyle$12("7caae29f9e", ".e2c3cbe6ada7d785__visually-hidden{border:0;clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;overflow-wrap:normal;padding:0;position:absolute;width:1px;word-break:normal}");
	var style_module_default$12 = { "visually-hidden": "e2c3cbe6ada7d785__visually-hidden" };
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
			props: mergeProps({ className: style_module_default$12["visually-hidden"] }, restProps, { "data-visually-hidden": "" })
		});
	});

// packages/ui/build-module/text/text.mjs
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
	registerStyle$11("09bae534ff", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9745ffa515d864cf__text{text-wrap:pretty;margin:0}._8882b6a7feb4fd3d__heading-2xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-p-line-height:var(--wpds-typography-line-height-2xl,40px);font-size:var(--wpds-typography-font-size-2xl,32px);line-height:var(--wpds-typography-line-height-2xl,40px)}._664e3e7687c45603__heading-xl,._8882b6a7feb4fd3d__heading-2xl{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600)}._664e3e7687c45603__heading-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-md,24px)}.dac661a5de0ed2bd__heading-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-lg,15px)}._59c7f3f740e2f96e__heading-md,.dac661a5de0ed2bd__heading-lg{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-sm,20px)}._59c7f3f740e2f96e__heading-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px)}.cf052fbad8d93b7e__heading-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._212b9cfef57a0af4__body-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-xl,32px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-xl,32px)}._07f57bc0aa36b2c6__body-lg,._212b9cfef57a0af4__body-xl{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}._07f57bc0aa36b2c6__body-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-lg,15px);line-height:var(--wpds-typography-line-height-md,24px)}._0c6da4457aec9e62__body-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px)}._0c6da4457aec9e62__body-md,.b998f87ff17b7bec__body-sm{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}.b998f87ff17b7bec__body-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
	var style_module_default$11 = {
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
	registerStyle$11("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
	const Text = (0, _wordpress_element.forwardRef)(function UnforwardedText({ variant = "body-md", render, className, ...props }, ref) {
		return useRender({
			render,
			defaultTagName: "span",
			ref,
			props: mergeProps(props, { className: clsx(style_module_default$11.text, global_css_defense_module_default$1.heading, global_css_defense_module_default$1.p, style_module_default$11[variant], className) })
		});
	});

// packages/ui/build-module/card/root.mjs
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
	registerStyle$10("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
	var resets_module_default$1 = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
	registerStyle$10("ada2aa0e9f", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.bced04d30c075714__root{--wp-ui-card-padding:var(--wpds-dimension-padding-2xl,24px);--wp-ui-card-header-content-gap:var(--wpds-dimension-gap-xl,24px);--wp-ui-card-header-content-margin:calc(var(--wp-ui-card-header-content-gap) - var(--wp-ui-card-padding));background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:1px solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-lg,8px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;overflow:clip}.b4b2578de6f75764__header,.cadd1062398e929c__content{padding:var(--wp-ui-card-padding);&:not(:first-child):not(:last-child){padding-block-end:0}}.b4b2578de6f75764__header+.cadd1062398e929c__content{margin-block-start:var(--wp-ui-card-header-content-margin);padding-block-start:0}.c25959d41c245c8c__fullbleed{margin-inline:calc(var(--wp-ui-card-padding)*-1);width:calc(100% + var(--wp-ui-card-padding)*2)}.bced04d30c075714__root>:is(.b4b2578de6f75764__header,.cadd1062398e929c__content):first-child>.c25959d41c245c8c__fullbleed:first-child{margin-block-start:calc(var(--wp-ui-card-padding)*-1)}:is(.b4b2578de6f75764__header,.cadd1062398e929c__content):last-child>.c25959d41c245c8c__fullbleed:last-child{margin-block-end:calc(var(--wp-ui-card-padding)*-1)}}}");
	var style_module_default$10 = {
		"root": "bced04d30c075714__root",
		"header": "b4b2578de6f75764__header",
		"content": "cadd1062398e929c__content",
		"fullbleed": "c25959d41c245c8c__fullbleed"
	};
	/**
	* A visually contained surface that groups related content and actions.
	*
	* ```jsx
	* import { Card } from '@wordpress/ui';
	*
	* function MyComponent() {
	* 	return (
	* 		<Card.Root>
	* 			<Card.Header>
	* 				<Card.Title>Heading</Card.Title>
	* 			</Card.Header>
	* 			<Card.Content>
	* 				<p>Main content here.</p>
	* 			</Card.Content>
	* 		</Card.Root>
	* 	);
	* }
	* ```
	*/
	const Root$3 = (0, _wordpress_element.forwardRef)(function Card({ render, ...restProps }, ref) {
		const mergedClassName = clsx(style_module_default$10.root, resets_module_default$1["box-sizing"]);
		return useRender({
			defaultTagName: "div",
			render,
			ref,
			props: mergeProps({ className: mergedClassName }, restProps)
		});
	});

// packages/ui/build-module/card/header.mjs
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
	registerStyle$9("ada2aa0e9f", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.bced04d30c075714__root{--wp-ui-card-padding:var(--wpds-dimension-padding-2xl,24px);--wp-ui-card-header-content-gap:var(--wpds-dimension-gap-xl,24px);--wp-ui-card-header-content-margin:calc(var(--wp-ui-card-header-content-gap) - var(--wp-ui-card-padding));background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:1px solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-lg,8px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;overflow:clip}.b4b2578de6f75764__header,.cadd1062398e929c__content{padding:var(--wp-ui-card-padding);&:not(:first-child):not(:last-child){padding-block-end:0}}.b4b2578de6f75764__header+.cadd1062398e929c__content{margin-block-start:var(--wp-ui-card-header-content-margin);padding-block-start:0}.c25959d41c245c8c__fullbleed{margin-inline:calc(var(--wp-ui-card-padding)*-1);width:calc(100% + var(--wp-ui-card-padding)*2)}.bced04d30c075714__root>:is(.b4b2578de6f75764__header,.cadd1062398e929c__content):first-child>.c25959d41c245c8c__fullbleed:first-child{margin-block-start:calc(var(--wp-ui-card-padding)*-1)}:is(.b4b2578de6f75764__header,.cadd1062398e929c__content):last-child>.c25959d41c245c8c__fullbleed:last-child{margin-block-end:calc(var(--wp-ui-card-padding)*-1)}}}");
	var style_module_default$9 = {
		"root": "bced04d30c075714__root",
		"header": "b4b2578de6f75764__header",
		"content": "cadd1062398e929c__content",
		"fullbleed": "c25959d41c245c8c__fullbleed"
	};
	/**
	* A structural container for the card's heading area, typically containing
	* `Card.Title`.
	*/
	const Header$2 = (0, _wordpress_element.forwardRef)(function CardHeader({ render, ...props }, ref) {
		return useRender({
			defaultTagName: "div",
			render,
			ref,
			props: mergeProps({ className: style_module_default$9.header }, props)
		});
	});

// packages/ui/build-module/card/content.mjs
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
	registerStyle$8("ada2aa0e9f", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.bced04d30c075714__root{--wp-ui-card-padding:var(--wpds-dimension-padding-2xl,24px);--wp-ui-card-header-content-gap:var(--wpds-dimension-gap-xl,24px);--wp-ui-card-header-content-margin:calc(var(--wp-ui-card-header-content-gap) - var(--wp-ui-card-padding));background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:1px solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-lg,8px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;overflow:clip}.b4b2578de6f75764__header,.cadd1062398e929c__content{padding:var(--wp-ui-card-padding);&:not(:first-child):not(:last-child){padding-block-end:0}}.b4b2578de6f75764__header+.cadd1062398e929c__content{margin-block-start:var(--wp-ui-card-header-content-margin);padding-block-start:0}.c25959d41c245c8c__fullbleed{margin-inline:calc(var(--wp-ui-card-padding)*-1);width:calc(100% + var(--wp-ui-card-padding)*2)}.bced04d30c075714__root>:is(.b4b2578de6f75764__header,.cadd1062398e929c__content):first-child>.c25959d41c245c8c__fullbleed:first-child{margin-block-start:calc(var(--wp-ui-card-padding)*-1)}:is(.b4b2578de6f75764__header,.cadd1062398e929c__content):last-child>.c25959d41c245c8c__fullbleed:last-child{margin-block-end:calc(var(--wp-ui-card-padding)*-1)}}}");
	var style_module_default$8 = {
		"root": "bced04d30c075714__root",
		"header": "b4b2578de6f75764__header",
		"content": "cadd1062398e929c__content",
		"fullbleed": "c25959d41c245c8c__fullbleed"
	};
	/**
	* The main content area of the card.
	*/
	const Content$1 = (0, _wordpress_element.forwardRef)(function CardContent({ render, ...props }, ref) {
		return useRender({
			defaultTagName: "div",
			render,
			ref,
			props: mergeProps({ className: style_module_default$8.content }, props)
		});
	});

// packages/ui/build-module/card/title.mjs
	const DEFAULT_TAG = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {});
	/**
	* The title for a card. Renders as a `<div>` by default — use the `render`
	* prop to swap in a semantic heading element when appropriate.
	*/
	const Title$1 = (0, _wordpress_element.forwardRef)(function CardTitle({ render = DEFAULT_TAG, children, ...props }, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Text, {
			ref,
			variant: "heading-lg",
			render,
			...props,
			children
		});
	});

// packages/ui/build-module/collapsible/panel.mjs
/**
	* A panel with the collapsible contents. Hidden when collapsed, visible
	* when expanded.
	*
	* `Collapsible` is a collection of React components that combine to render
	* a collapsible panel controlled by a button.
	*/
	const Panel = (0, _wordpress_element.forwardRef)(function CollapsiblePanel$1(props, forwardedRef) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CollapsiblePanel, {
			ref: forwardedRef,
			...props
		});
	});

// packages/ui/build-module/collapsible/root.mjs
/**
	* Groups all parts of the collapsible.
	*
	* `Collapsible` is a collection of React components that combine to render
	* a collapsible panel controlled by a button.
	*/
	const Root$2 = (0, _wordpress_element.forwardRef)(function CollapsibleRoot$1(props, forwardedRef) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CollapsibleRoot, {
			ref: forwardedRef,
			...props
		});
	});

// packages/ui/build-module/collapsible/trigger.mjs
/**
	* A button that opens and closes the collapsible panel.
	*
	* `Collapsible` is a collection of React components that combine to render
	* a collapsible panel controlled by a button.
	*/
	const Trigger = (0, _wordpress_element.forwardRef)(function CollapsibleTrigger$1(props, forwardedRef) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CollapsibleTrigger, {
			ref: forwardedRef,
			...props
		});
	});

// packages/ui/build-module/collapsible-card/root.mjs
/**
	* A card that can be expanded and collapsed. When collapsed, only the
	* header is visible.
	*
	* ```jsx
	* import { CollapsibleCard, Card } from '@wordpress/ui';
	*
	* function MyComponent() {
	* 	return (
	* 		<CollapsibleCard.Root defaultOpen>
	* 			<CollapsibleCard.Header>
	* 				<Card.Title>Heading</Card.Title>
	* 			</CollapsibleCard.Header>
	* 			<CollapsibleCard.Content>
	* 				<p>Collapsible content here.</p>
	* 			</CollapsibleCard.Content>
	* 		</CollapsibleCard.Root>
	* 	);
	* }
	* ```
	*/
	const Root$1 = (0, _wordpress_element.forwardRef)(function CollapsibleCardRoot({ render, ...restProps }, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Root$2, {
			ref,
			render: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Root$3, { render }),
			...restProps
		});
	});

// packages/ui/build-module/collapsible-card/context.mjs
	const HeaderDescriptionIdContext = (0, _wordpress_element.createContext)(null);

// packages/ui/build-module/collapsible-card/header.mjs
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
	registerStyle$7("4b918be902", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.c518fd8936700931__heading-wrapper{--_gcd-heading-color:inherit;--_gcd-heading-font-size:inherit;--_gcd-heading-font-weight:inherit;--_gcd-heading-margin:0;font-family:inherit;line-height:inherit}.fea34f4e9dfacd71__header-content{flex:1;min-width:0}._0d708389b4074955__header-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.ff044cc511d350dc__header-trigger-positioner{align-self:flex-start;flex-shrink:0;margin-block-start:calc(var(--wpds-typography-line-height-sm, 20px)/2);max-height:0;overflow:visible}.fff122094d192bfe__header-trigger-wrapper{border-radius:var(--wpds-border-radius-sm,2px);display:flex;translate:0 -50%}._2d6d78d85e28c6a1__header:focus-visible .fff122094d192bfe__header-trigger-wrapper{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}@media not (prefers-reduced-motion){.bd8376580a8ef445__header-trigger{transition:rotate .15s ease-out}}._2d6d78d85e28c6a1__header[data-panel-open] .bd8376580a8ef445__header-trigger{rotate:180deg}._2d6d78d85e28c6a1__header[data-disabled] .bd8376580a8ef445__header-trigger{color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}.b470df8119d32037__content{height:var(--collapsible-panel-height);margin-block-start:var(--wp-ui-card-header-content-margin);overflow:hidden}.b470df8119d32037__content._640cbe83366c89c3__overflow-visible{overflow:visible}.b470df8119d32037__content[hidden]:not([hidden=until-found]){display:none}.b470df8119d32037__content[data-ending-style],.b470df8119d32037__content[data-starting-style]{height:0}@media not (prefers-reduced-motion){.b470df8119d32037__content{transition:all .15s ease-out}}}@layer compositions{._51c02cc98c745389__content-inner{padding-block-start:0}._2d6d78d85e28c6a1__header{align-items:stretch;display:flex;flex-direction:row;gap:var(--wpds-dimension-gap-sm,8px);outline:none}._2d6d78d85e28c6a1__header:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}}}");
	var style_module_default$7 = {
		"heading-wrapper": "c518fd8936700931__heading-wrapper",
		"header-content": "fea34f4e9dfacd71__header-content",
		"header-description": "_0d708389b4074955__header-description",
		"header-trigger-positioner": "ff044cc511d350dc__header-trigger-positioner",
		"header-trigger-wrapper": "fff122094d192bfe__header-trigger-wrapper",
		"header": "_2d6d78d85e28c6a1__header",
		"header-trigger": "bd8376580a8ef445__header-trigger",
		"content": "b470df8119d32037__content",
		"overflow-visible": "_640cbe83366c89c3__overflow-visible",
		"content-inner": "_51c02cc98c745389__content-inner"
	};
	registerStyle$7("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
	* The header of a collapsible card. Always visible, and acts as the
	* toggle trigger — clicking anywhere on it expands or collapses the
	* card's content.
	*
	* Defaults to a `<div>` wrapper around the trigger. Since the right heading
	* level depends on the surrounding document outline, the consumer is
	* expected to opt in to heading semantics. Pass `render` to wrap the
	* trigger in a heading (e.g. `render={ <h2 /> }`), following the W3C APG
	* accordion pattern (heading wraps button).
	*
	* Avoid placing interactive elements (buttons, links, inputs) inside the
	* header, since the entire area is clickable and their events will bubble
	* to trigger the collapse toggle.
	*
	* Place full-bleed media in `CollapsibleCard.Content`, not the header.
	*/
	const Header$1 = (0, _wordpress_element.forwardRef)(function CollapsibleCardHeader({ children, className, render, "aria-describedby": ariaDescribedByProp, ...restProps }, ref) {
		const [descriptionIds, setDescriptionIds] = (0, _wordpress_element.useState)([]);
		const [orderedDescriptionIds, setOrderedDescriptionIds] = (0, _wordpress_element.useState)([]);
		const headerContentRef = (0, _wordpress_element.useRef)(null);
		const registerDescriptionId = (0, _wordpress_element.useCallback)((id) => {
			setDescriptionIds((currentDescriptionIds) => {
				if (currentDescriptionIds.includes(id)) return currentDescriptionIds;
				return [...currentDescriptionIds, id];
			});
			return () => {
				setDescriptionIds((currentDescriptionIds) => currentDescriptionIds.filter((descriptionId) => descriptionId !== id));
			};
		}, []);
		const contextValue = (0, _wordpress_element.useMemo)(() => ({ registerDescriptionId }), [registerDescriptionId]);
		(0, _wordpress_compose.useIsomorphicLayoutEffect)(() => {
			const registeredDescriptionIds = new Set(descriptionIds);
			const nextDescriptionIds = Array.from(headerContentRef.current?.querySelectorAll("[id]") ?? []).map((element) => element.id).filter((id) => registeredDescriptionIds.has(id));
			setOrderedDescriptionIds((currentDescriptionIds) => {
				if (currentDescriptionIds.length === nextDescriptionIds.length && currentDescriptionIds.every((id, index) => id === nextDescriptionIds[index])) return currentDescriptionIds;
				return nextDescriptionIds;
			});
		});
		const ariaDescribedBy = Array.from(/* @__PURE__ */ new Set([...ariaDescribedByProp?.split(/\s+/).filter(Boolean) ?? [], ...orderedDescriptionIds])).join(" ") || void 0;
		return useRender({
			defaultTagName: "div",
			render,
			ref,
			props: mergeProps(restProps, {
				className: clsx(global_css_defense_module_default.heading, style_module_default$7["heading-wrapper"], className),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HeaderDescriptionIdContext.Provider, {
					value: contextValue,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Trigger, {
						className: style_module_default$7.header,
						render: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Header$2, {}),
						nativeButton: false,
						"aria-describedby": ariaDescribedBy,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							ref: headerContentRef,
							className: style_module_default$7["header-content"],
							children
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: clsx(style_module_default$7["header-trigger-positioner"]),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: clsx(style_module_default$7["header-trigger-wrapper"], global_css_defense_module_default.div),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Icon, {
									icon: chevron_down_default,
									className: style_module_default$7["header-trigger"]
								})
							})
						})]
					})
				})
			})
		});
	});

// packages/ui/build-module/collapsible-card/content.mjs
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
	registerStyle$6("4b918be902", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.c518fd8936700931__heading-wrapper{--_gcd-heading-color:inherit;--_gcd-heading-font-size:inherit;--_gcd-heading-font-weight:inherit;--_gcd-heading-margin:0;font-family:inherit;line-height:inherit}.fea34f4e9dfacd71__header-content{flex:1;min-width:0}._0d708389b4074955__header-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.ff044cc511d350dc__header-trigger-positioner{align-self:flex-start;flex-shrink:0;margin-block-start:calc(var(--wpds-typography-line-height-sm, 20px)/2);max-height:0;overflow:visible}.fff122094d192bfe__header-trigger-wrapper{border-radius:var(--wpds-border-radius-sm,2px);display:flex;translate:0 -50%}._2d6d78d85e28c6a1__header:focus-visible .fff122094d192bfe__header-trigger-wrapper{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}@media not (prefers-reduced-motion){.bd8376580a8ef445__header-trigger{transition:rotate .15s ease-out}}._2d6d78d85e28c6a1__header[data-panel-open] .bd8376580a8ef445__header-trigger{rotate:180deg}._2d6d78d85e28c6a1__header[data-disabled] .bd8376580a8ef445__header-trigger{color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}.b470df8119d32037__content{height:var(--collapsible-panel-height);margin-block-start:var(--wp-ui-card-header-content-margin);overflow:hidden}.b470df8119d32037__content._640cbe83366c89c3__overflow-visible{overflow:visible}.b470df8119d32037__content[hidden]:not([hidden=until-found]){display:none}.b470df8119d32037__content[data-ending-style],.b470df8119d32037__content[data-starting-style]{height:0}@media not (prefers-reduced-motion){.b470df8119d32037__content{transition:all .15s ease-out}}}@layer compositions{._51c02cc98c745389__content-inner{padding-block-start:0}._2d6d78d85e28c6a1__header{align-items:stretch;display:flex;flex-direction:row;gap:var(--wpds-dimension-gap-sm,8px);outline:none}._2d6d78d85e28c6a1__header:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}}}");
	var style_module_default$6 = {
		"heading-wrapper": "c518fd8936700931__heading-wrapper",
		"header-content": "fea34f4e9dfacd71__header-content",
		"header-description": "_0d708389b4074955__header-description",
		"header-trigger-positioner": "ff044cc511d350dc__header-trigger-positioner",
		"header-trigger-wrapper": "fff122094d192bfe__header-trigger-wrapper",
		"header": "_2d6d78d85e28c6a1__header",
		"header-trigger": "bd8376580a8ef445__header-trigger",
		"content": "b470df8119d32037__content",
		"overflow-visible": "_640cbe83366c89c3__overflow-visible",
		"content-inner": "_51c02cc98c745389__content-inner"
	};
	/**
	* The collapsible content area of the card. Hidden when collapsed,
	* visible when expanded.
	*/
	const Content = (0, _wordpress_element.forwardRef)(function CollapsibleCardContent({ className, render, children, hiddenUntilFound = true, ...restProps }, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Panel, {
			ref,
			className: (state) => clsx(style_module_default$6.content, state.open && state.transitionStatus === "idle" && style_module_default$6["overflow-visible"], className),
			hiddenUntilFound,
			...restProps,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Content$1, {
				className: style_module_default$6["content-inner"],
				render,
				children
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
				className: style_module_default$5.stack
			})
		});
	});

// packages/ui/build-module/notice/root.mjs
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
	registerStyle$4("37477070fb", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{.ccc29f9575c4c758__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
	var resets_module_default = { "box-sizing": "ccc29f9575c4c758__box-sizing" };
	registerStyle$4("e57e872b6c", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._173ad03087dbb509__notice{--icon-height:var(--wpds-dimension-size-sm,24px);--text-vertical-padding:calc((var(--icon-height) - var(--wpds-typography-line-height-sm, 20px))/2);--wp-ui-notice-background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-neutral,#dbdbdb);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);align-items:start;background-color:var(--wp-ui-notice-background-color);border:1px solid var(--wp-ui-notice-border-color);border-radius:var(--wpds-border-radius-lg,8px);container-type:inline-size;display:grid;grid-template-columns:auto 1fr auto;isolation:isolate;padding:var(--wpds-dimension-padding-md,12px)}._86733bd626c7e048__icon{color:var(--wp-ui-notice-decorative-icon-color);grid-column:1;grid-row:1;margin-inline-end:var(--wpds-dimension-gap-xs,4px)}._6688caffadaf5a66__description{color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}._48b3142dec93ee87__actions{display:flex;flex-wrap:wrap;gap:var(--wpds-dimension-gap-md,12px);grid-column:2}._173ad03087dbb509__notice:has(._6688caffadaf5a66__description) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions{margin-block-start:var(--wpds-dimension-gap-sm,8px)}.adcfc74c7c481a8b__action-button{flex-shrink:0}.b0ce2ddf3e16f445__action-link{flex-shrink:0;&:not(:first-child){margin-inline-start:var(--wpds-dimension-gap-xs,4px)}&:not(:last-child){margin-inline-end:var(--wpds-dimension-gap-xs,4px)}}._234d6ae581e5eb29__close-icon{grid-column:3;grid-row:1;margin-inline-start:var(--wpds-dimension-gap-xs,4px)}._4e822398b0e00dd5__is-info{--wp-ui-notice-background-color:var(--wpds-color-background-surface-info-weak,#f3f9ff);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-info,#adc6e2);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-info,#001b4f);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-info-weak,#006bd7)}._1ef9a1d966bd5220__is-warning{--wp-ui-notice-background-color:var(--wpds-color-background-surface-warning-weak,#fff7e1);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-warning,#e1bd7c);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-warning,#2e1900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-warning-weak,#936300)}.e98dc9c1e2c0bf3b__is-success{--wp-ui-notice-background-color:var(--wpds-color-background-surface-success-weak,#ebffed);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-success,#92d39d);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-success,#002900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-success-weak,#008030)}._673065a55bda7056__is-error{--wp-ui-notice-background-color:var(--wpds-color-background-surface-error-weak,#fff6f5);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-error,#e0afa7);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-error,#470000);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-error-weak,#cc1818)}@container (max-width: 320px){._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._6688caffadaf5a66__description{grid-column:1/3}}}@layer compositions{._6d6c0651ee903d00__title{--_gcd-heading-color:var(--wp-ui-notice-text-color);color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}.b0ce2ddf3e16f445__action-link{margin-block:auto}._234d6ae581e5eb29__close-icon,.adcfc74c7c481a8b__action-button,.b0ce2ddf3e16f445__action-link{mix-blend-mode:luminosity;@media (forced-colors:active){mix-blend-mode:normal}}}}");
	var style_module_default$4 = {
		"notice": "_173ad03087dbb509__notice",
		"icon": "_86733bd626c7e048__icon",
		"description": "_6688caffadaf5a66__description",
		"actions": "_48b3142dec93ee87__actions",
		"title": "_6d6c0651ee903d00__title",
		"action-button": "adcfc74c7c481a8b__action-button",
		"action-link": "b0ce2ddf3e16f445__action-link",
		"close-icon": "_234d6ae581e5eb29__close-icon",
		"is-info": "_4e822398b0e00dd5__is-info",
		"is-warning": "_1ef9a1d966bd5220__is-warning",
		"is-success": "e98dc9c1e2c0bf3b__is-success",
		"is-error": "_673065a55bda7056__is-error"
	};
	const icons = {
		neutral: null,
		info: info_default,
		warning: caution_default,
		success: published_default,
		error: error_default
	};
	/**
	* A notice component that communicates system status and provides actions.
	* Render inside `Notice.List` to announce added or changed messages. Outside
	* a list, it does not announce its content to assistive technology.
	*
	* ```jsx
	* import { Notice } from '@wordpress/ui';
	*
	* function MyComponent() {
	* 	return (
	* 		<Notice.Root intent="info">
	* 			<Notice.Title>Heading</Notice.Title>
	* 			<Notice.Description>Body text</Notice.Description>
	* 			<Notice.Actions>
	* 				<Notice.ActionButton>Action</Notice.ActionButton>
	* 			</Notice.Actions>
	* 			<Notice.CloseIconButton onClick={() => {}} />
	* 		</Notice.Root>
	* 	);
	* }
	* ```
	*/
	const Root = (0, _wordpress_element.forwardRef)(function Notice({ intent = "neutral", children, icon, render, politeness = "polite", spokenMessage, ...restProps }, ref) {
		const iconElement = icon === null ? null : icon ?? icons[intent];
		const defaultProps = {
			className: clsx(style_module_default$4.notice, style_module_default$4[`is-${intent}`], resets_module_default["box-sizing"]),
			"data-wp-ui-notice-politeness": politeness,
			"data-wp-ui-notice-spoken-message": spokenMessage,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [children, iconElement && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Icon, {
				className: style_module_default$4.icon,
				icon: iconElement
			})] })
		};
		return useRender({
			defaultTagName: "div",
			render,
			ref,
			props: mergeProps(defaultProps, restProps)
		});
	});

// packages/ui/build-module/notice/title.mjs
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
	registerStyle$3("e57e872b6c", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._173ad03087dbb509__notice{--icon-height:var(--wpds-dimension-size-sm,24px);--text-vertical-padding:calc((var(--icon-height) - var(--wpds-typography-line-height-sm, 20px))/2);--wp-ui-notice-background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-neutral,#dbdbdb);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);align-items:start;background-color:var(--wp-ui-notice-background-color);border:1px solid var(--wp-ui-notice-border-color);border-radius:var(--wpds-border-radius-lg,8px);container-type:inline-size;display:grid;grid-template-columns:auto 1fr auto;isolation:isolate;padding:var(--wpds-dimension-padding-md,12px)}._86733bd626c7e048__icon{color:var(--wp-ui-notice-decorative-icon-color);grid-column:1;grid-row:1;margin-inline-end:var(--wpds-dimension-gap-xs,4px)}._6688caffadaf5a66__description{color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}._48b3142dec93ee87__actions{display:flex;flex-wrap:wrap;gap:var(--wpds-dimension-gap-md,12px);grid-column:2}._173ad03087dbb509__notice:has(._6688caffadaf5a66__description) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions{margin-block-start:var(--wpds-dimension-gap-sm,8px)}.adcfc74c7c481a8b__action-button{flex-shrink:0}.b0ce2ddf3e16f445__action-link{flex-shrink:0;&:not(:first-child){margin-inline-start:var(--wpds-dimension-gap-xs,4px)}&:not(:last-child){margin-inline-end:var(--wpds-dimension-gap-xs,4px)}}._234d6ae581e5eb29__close-icon{grid-column:3;grid-row:1;margin-inline-start:var(--wpds-dimension-gap-xs,4px)}._4e822398b0e00dd5__is-info{--wp-ui-notice-background-color:var(--wpds-color-background-surface-info-weak,#f3f9ff);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-info,#adc6e2);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-info,#001b4f);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-info-weak,#006bd7)}._1ef9a1d966bd5220__is-warning{--wp-ui-notice-background-color:var(--wpds-color-background-surface-warning-weak,#fff7e1);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-warning,#e1bd7c);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-warning,#2e1900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-warning-weak,#936300)}.e98dc9c1e2c0bf3b__is-success{--wp-ui-notice-background-color:var(--wpds-color-background-surface-success-weak,#ebffed);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-success,#92d39d);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-success,#002900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-success-weak,#008030)}._673065a55bda7056__is-error{--wp-ui-notice-background-color:var(--wpds-color-background-surface-error-weak,#fff6f5);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-error,#e0afa7);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-error,#470000);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-error-weak,#cc1818)}@container (max-width: 320px){._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._6688caffadaf5a66__description{grid-column:1/3}}}@layer compositions{._6d6c0651ee903d00__title{--_gcd-heading-color:var(--wp-ui-notice-text-color);color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}.b0ce2ddf3e16f445__action-link{margin-block:auto}._234d6ae581e5eb29__close-icon,.adcfc74c7c481a8b__action-button,.b0ce2ddf3e16f445__action-link{mix-blend-mode:luminosity;@media (forced-colors:active){mix-blend-mode:normal}}}}");
	var style_module_default$3 = {
		"notice": "_173ad03087dbb509__notice",
		"icon": "_86733bd626c7e048__icon",
		"description": "_6688caffadaf5a66__description",
		"actions": "_48b3142dec93ee87__actions",
		"title": "_6d6c0651ee903d00__title",
		"action-button": "adcfc74c7c481a8b__action-button",
		"action-link": "b0ce2ddf3e16f445__action-link",
		"close-icon": "_234d6ae581e5eb29__close-icon",
		"is-info": "_4e822398b0e00dd5__is-info",
		"is-warning": "_1ef9a1d966bd5220__is-warning",
		"is-success": "e98dc9c1e2c0bf3b__is-success",
		"is-error": "_673065a55bda7056__is-error"
	};
	/**
	* A short heading that communicates the main message of the notice.
	*/
	const Title = (0, _wordpress_element.forwardRef)(function NoticeTitle({ className, ...props }, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Text, {
			ref,
			variant: "heading-md",
			className: clsx(style_module_default$3.title, className),
			...props
		});
	});

// packages/ui/build-module/notice/description.mjs
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
	registerStyle$2("e57e872b6c", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._173ad03087dbb509__notice{--icon-height:var(--wpds-dimension-size-sm,24px);--text-vertical-padding:calc((var(--icon-height) - var(--wpds-typography-line-height-sm, 20px))/2);--wp-ui-notice-background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-neutral,#dbdbdb);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);align-items:start;background-color:var(--wp-ui-notice-background-color);border:1px solid var(--wp-ui-notice-border-color);border-radius:var(--wpds-border-radius-lg,8px);container-type:inline-size;display:grid;grid-template-columns:auto 1fr auto;isolation:isolate;padding:var(--wpds-dimension-padding-md,12px)}._86733bd626c7e048__icon{color:var(--wp-ui-notice-decorative-icon-color);grid-column:1;grid-row:1;margin-inline-end:var(--wpds-dimension-gap-xs,4px)}._6688caffadaf5a66__description{color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}._48b3142dec93ee87__actions{display:flex;flex-wrap:wrap;gap:var(--wpds-dimension-gap-md,12px);grid-column:2}._173ad03087dbb509__notice:has(._6688caffadaf5a66__description) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions{margin-block-start:var(--wpds-dimension-gap-sm,8px)}.adcfc74c7c481a8b__action-button{flex-shrink:0}.b0ce2ddf3e16f445__action-link{flex-shrink:0;&:not(:first-child){margin-inline-start:var(--wpds-dimension-gap-xs,4px)}&:not(:last-child){margin-inline-end:var(--wpds-dimension-gap-xs,4px)}}._234d6ae581e5eb29__close-icon{grid-column:3;grid-row:1;margin-inline-start:var(--wpds-dimension-gap-xs,4px)}._4e822398b0e00dd5__is-info{--wp-ui-notice-background-color:var(--wpds-color-background-surface-info-weak,#f3f9ff);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-info,#adc6e2);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-info,#001b4f);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-info-weak,#006bd7)}._1ef9a1d966bd5220__is-warning{--wp-ui-notice-background-color:var(--wpds-color-background-surface-warning-weak,#fff7e1);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-warning,#e1bd7c);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-warning,#2e1900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-warning-weak,#936300)}.e98dc9c1e2c0bf3b__is-success{--wp-ui-notice-background-color:var(--wpds-color-background-surface-success-weak,#ebffed);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-success,#92d39d);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-success,#002900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-success-weak,#008030)}._673065a55bda7056__is-error{--wp-ui-notice-background-color:var(--wpds-color-background-surface-error-weak,#fff6f5);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-error,#e0afa7);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-error,#470000);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-error-weak,#cc1818)}@container (max-width: 320px){._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._6688caffadaf5a66__description{grid-column:1/3}}}@layer compositions{._6d6c0651ee903d00__title{--_gcd-heading-color:var(--wp-ui-notice-text-color);color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}.b0ce2ddf3e16f445__action-link{margin-block:auto}._234d6ae581e5eb29__close-icon,.adcfc74c7c481a8b__action-button,.b0ce2ddf3e16f445__action-link{mix-blend-mode:luminosity;@media (forced-colors:active){mix-blend-mode:normal}}}}");
	var style_module_default$2 = {
		"notice": "_173ad03087dbb509__notice",
		"icon": "_86733bd626c7e048__icon",
		"description": "_6688caffadaf5a66__description",
		"actions": "_48b3142dec93ee87__actions",
		"title": "_6d6c0651ee903d00__title",
		"action-button": "adcfc74c7c481a8b__action-button",
		"action-link": "b0ce2ddf3e16f445__action-link",
		"close-icon": "_234d6ae581e5eb29__close-icon",
		"is-info": "_4e822398b0e00dd5__is-info",
		"is-warning": "_1ef9a1d966bd5220__is-warning",
		"is-success": "e98dc9c1e2c0bf3b__is-success",
		"is-error": "_673065a55bda7056__is-error"
	};
	/**
	* The description text for a notice.
	*/
	const Description = (0, _wordpress_element.forwardRef)(function NoticeDescription({ className, ...props }, ref) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Text, {
			ref,
			variant: "body-md",
			className: clsx(style_module_default$2.description, className),
			...props
		});
	});

// packages/ui/build-module/notice/actions.mjs
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
	registerStyle$1("e57e872b6c", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._173ad03087dbb509__notice{--icon-height:var(--wpds-dimension-size-sm,24px);--text-vertical-padding:calc((var(--icon-height) - var(--wpds-typography-line-height-sm, 20px))/2);--wp-ui-notice-background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-neutral,#dbdbdb);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);align-items:start;background-color:var(--wp-ui-notice-background-color);border:1px solid var(--wp-ui-notice-border-color);border-radius:var(--wpds-border-radius-lg,8px);container-type:inline-size;display:grid;grid-template-columns:auto 1fr auto;isolation:isolate;padding:var(--wpds-dimension-padding-md,12px)}._86733bd626c7e048__icon{color:var(--wp-ui-notice-decorative-icon-color);grid-column:1;grid-row:1;margin-inline-end:var(--wpds-dimension-gap-xs,4px)}._6688caffadaf5a66__description{color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}._48b3142dec93ee87__actions{display:flex;flex-wrap:wrap;gap:var(--wpds-dimension-gap-md,12px);grid-column:2}._173ad03087dbb509__notice:has(._6688caffadaf5a66__description) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions{margin-block-start:var(--wpds-dimension-gap-sm,8px)}.adcfc74c7c481a8b__action-button{flex-shrink:0}.b0ce2ddf3e16f445__action-link{flex-shrink:0;&:not(:first-child){margin-inline-start:var(--wpds-dimension-gap-xs,4px)}&:not(:last-child){margin-inline-end:var(--wpds-dimension-gap-xs,4px)}}._234d6ae581e5eb29__close-icon{grid-column:3;grid-row:1;margin-inline-start:var(--wpds-dimension-gap-xs,4px)}._4e822398b0e00dd5__is-info{--wp-ui-notice-background-color:var(--wpds-color-background-surface-info-weak,#f3f9ff);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-info,#adc6e2);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-info,#001b4f);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-info-weak,#006bd7)}._1ef9a1d966bd5220__is-warning{--wp-ui-notice-background-color:var(--wpds-color-background-surface-warning-weak,#fff7e1);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-warning,#e1bd7c);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-warning,#2e1900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-warning-weak,#936300)}.e98dc9c1e2c0bf3b__is-success{--wp-ui-notice-background-color:var(--wpds-color-background-surface-success-weak,#ebffed);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-success,#92d39d);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-success,#002900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-success-weak,#008030)}._673065a55bda7056__is-error{--wp-ui-notice-background-color:var(--wpds-color-background-surface-error-weak,#fff6f5);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-error,#e0afa7);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-error,#470000);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-error-weak,#cc1818)}@container (max-width: 320px){._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._6688caffadaf5a66__description{grid-column:1/3}}}@layer compositions{._6d6c0651ee903d00__title{--_gcd-heading-color:var(--wp-ui-notice-text-color);color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}.b0ce2ddf3e16f445__action-link{margin-block:auto}._234d6ae581e5eb29__close-icon,.adcfc74c7c481a8b__action-button,.b0ce2ddf3e16f445__action-link{mix-blend-mode:luminosity;@media (forced-colors:active){mix-blend-mode:normal}}}}");
	var style_module_default$1 = {
		"notice": "_173ad03087dbb509__notice",
		"icon": "_86733bd626c7e048__icon",
		"description": "_6688caffadaf5a66__description",
		"actions": "_48b3142dec93ee87__actions",
		"title": "_6d6c0651ee903d00__title",
		"action-button": "adcfc74c7c481a8b__action-button",
		"action-link": "b0ce2ddf3e16f445__action-link",
		"close-icon": "_234d6ae581e5eb29__close-icon",
		"is-info": "_4e822398b0e00dd5__is-info",
		"is-warning": "_1ef9a1d966bd5220__is-warning",
		"is-success": "e98dc9c1e2c0bf3b__is-success",
		"is-error": "_673065a55bda7056__is-error"
	};
	/**
	* A container for Notice.ActionButton and Notice.ActionLink.
	*/
	const Actions = (0, _wordpress_element.forwardRef)(function NoticeActions({ render, ...props }, ref) {
		return useRender({
			defaultTagName: "div",
			render,
			ref,
			props: mergeProps({ className: style_module_default$1.actions }, props)
		});
	});

// packages/ui/build-module/notice/action-button.mjs
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
	registerStyle("e57e872b6c", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._173ad03087dbb509__notice{--icon-height:var(--wpds-dimension-size-sm,24px);--text-vertical-padding:calc((var(--icon-height) - var(--wpds-typography-line-height-sm, 20px))/2);--wp-ui-notice-background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-neutral,#dbdbdb);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-neutral,#1e1e1e);align-items:start;background-color:var(--wp-ui-notice-background-color);border:1px solid var(--wp-ui-notice-border-color);border-radius:var(--wpds-border-radius-lg,8px);container-type:inline-size;display:grid;grid-template-columns:auto 1fr auto;isolation:isolate;padding:var(--wpds-dimension-padding-md,12px)}._86733bd626c7e048__icon{color:var(--wp-ui-notice-decorative-icon-color);grid-column:1;grid-row:1;margin-inline-end:var(--wpds-dimension-gap-xs,4px)}._6688caffadaf5a66__description{color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}._48b3142dec93ee87__actions{display:flex;flex-wrap:wrap;gap:var(--wpds-dimension-gap-md,12px);grid-column:2}._173ad03087dbb509__notice:has(._6688caffadaf5a66__description) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions{margin-block-start:var(--wpds-dimension-gap-sm,8px)}.adcfc74c7c481a8b__action-button{flex-shrink:0}.b0ce2ddf3e16f445__action-link{flex-shrink:0;&:not(:first-child){margin-inline-start:var(--wpds-dimension-gap-xs,4px)}&:not(:last-child){margin-inline-end:var(--wpds-dimension-gap-xs,4px)}}._234d6ae581e5eb29__close-icon{grid-column:3;grid-row:1;margin-inline-start:var(--wpds-dimension-gap-xs,4px)}._4e822398b0e00dd5__is-info{--wp-ui-notice-background-color:var(--wpds-color-background-surface-info-weak,#f3f9ff);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-info,#adc6e2);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-info,#001b4f);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-info-weak,#006bd7)}._1ef9a1d966bd5220__is-warning{--wp-ui-notice-background-color:var(--wpds-color-background-surface-warning-weak,#fff7e1);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-warning,#e1bd7c);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-warning,#2e1900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-warning-weak,#936300)}.e98dc9c1e2c0bf3b__is-success{--wp-ui-notice-background-color:var(--wpds-color-background-surface-success-weak,#ebffed);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-success,#92d39d);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-success,#002900);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-success-weak,#008030)}._673065a55bda7056__is-error{--wp-ui-notice-background-color:var(--wpds-color-background-surface-error-weak,#fff6f5);--wp-ui-notice-border-color:var(--wpds-color-stroke-surface-error,#e0afa7);--wp-ui-notice-text-color:var(--wpds-color-foreground-content-error,#470000);--wp-ui-notice-decorative-icon-color:var(--wpds-color-foreground-content-error-weak,#cc1818)}@container (max-width: 320px){._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._48b3142dec93ee87__actions,._173ad03087dbb509__notice:has(._6d6c0651ee903d00__title) ._6688caffadaf5a66__description{grid-column:1/3}}}@layer compositions{._6d6c0651ee903d00__title{--_gcd-heading-color:var(--wp-ui-notice-text-color);color:var(--wp-ui-notice-text-color);grid-column:2;padding-block:var(--text-vertical-padding)}.b0ce2ddf3e16f445__action-link{margin-block:auto}._234d6ae581e5eb29__close-icon,.adcfc74c7c481a8b__action-button,.b0ce2ddf3e16f445__action-link{mix-blend-mode:luminosity;@media (forced-colors:active){mix-blend-mode:normal}}}}");
	var style_module_default = {
		"notice": "_173ad03087dbb509__notice",
		"icon": "_86733bd626c7e048__icon",
		"description": "_6688caffadaf5a66__description",
		"actions": "_48b3142dec93ee87__actions",
		"title": "_6d6c0651ee903d00__title",
		"action-button": "adcfc74c7c481a8b__action-button",
		"action-link": "b0ce2ddf3e16f445__action-link",
		"close-icon": "_234d6ae581e5eb29__close-icon",
		"is-info": "_4e822398b0e00dd5__is-info",
		"is-warning": "_1ef9a1d966bd5220__is-warning",
		"is-success": "e98dc9c1e2c0bf3b__is-success",
		"is-error": "_673065a55bda7056__is-error"
	};
	/**
	* An action button for use within Notice.Actions.
	*/
	const ActionButton = (0, _wordpress_element.forwardRef)(function NoticeActionButton({ className, loading, loadingAnnouncement, variant, ...props }, ref) {
		const loadingProps = loading !== void 0 ? {
			loading,
			loadingAnnouncement: loadingAnnouncement ?? ""
		} : {};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button$3, {
			...props,
			...loadingProps,
			ref,
			size: "compact",
			tone: "neutral",
			variant,
			className: clsx(style_module_default["action-button"], style_module_default[`is-action-button-${variant}`], className)
		});
	});

// packages/ui/build-module/utils/use-enable-wp-compat-overlay-slot.mjs
/**
	* Opts the host application into the `@wordpress/ui` compat overlay slot —
	* a body-level container into which `@wordpress/ui` overlays portal so they
	* reliably stack above `@wordpress/components` overlays in mixed-library
	* compositions.
	*
	* Call once from a component that mounts for the lifetime of the app
	* (typically the root). Idempotent and one-way: a single caller should not
	* be able to turn off shared infrastructure for everyone else; if the slot
	* isn't wanted, simply don't call this hook.
	*
	* The opt-in applies to the whole window, including other React roots and
	* package copies, and remains enabled after the calling component unmounts.
	* Explicit portal containers still take precedence.
	*
	* Where `window.wp.components` is on the global — the typical setup for
	* plugins enqueueing `wp-components` through WordPress's script-loader —
	* the slot auto-enables and this hook is a no-op.
	*/
	function useEnableWpCompatOverlaySlot() {
		if (typeof window === "undefined") return;
		const internalWindow = window;
		if (internalWindow.__wpUiCompatOverlaySlotEnabled !== true) internalWindow.__wpUiCompatOverlaySlotEnabled = true;
	}

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

// packages/customize-widgets/build-module/components/error-boundary/index.mjs
	function getErrorNotice() {
		return {
			title: (0, _wordpress_i18n.__)("The editor has crashed"),
			description: (0, _wordpress_i18n.__)("An unknown error occurred. Reload your browser to try again, or copy the error to report the problem or search.")
		};
	}
	function getErrorName(error) {
		return error instanceof Error && error.name || "Error";
	}
	function getErrorMessage(error) {
		if (typeof error === "string" && error) return error;
		if (typeof error?.message === "string" && error.message) return error.message;
		return "An unknown error occurred.";
	}
	function getErrorSections(error, componentStack) {
		const sections = [{
			label: getErrorName(error),
			content: getErrorMessage(error)
		}];
		if (error?.stack) sections.push({
			label: "Stack",
			content: error.stack.trim(),
			preformatted: true
		});
		if (componentStack) sections.push({
			label: "Component stack",
			content: componentStack.trim(),
			preformatted: true
		});
		sections.push({
			label: "Environment",
			content: `User agent: ${window.navigator.userAgent}`,
			preformatted: true
		});
		return sections;
	}
	function getErrorReport(error, componentStack) {
		return ["### Error report", ...getErrorSections(error, componentStack).map(({ label, content, preformatted }) => `**${label}**\n\n${preformatted ? `\`\`\`\n${content}\n\`\`\`` : content}`)].join("\n\n");
	}
	function CopyButton({ text, children, variant = "outline" }) {
		const ref = (0, _wordpress_compose.useCopyToClipboard)(text);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ActionButton, {
			variant,
			ref,
			children
		});
	}
	function ErrorReport({ error, componentStack }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stack, {
			className: "customize-widgets-error-boundary__report",
			direction: "column",
			gap: "md",
			children: getErrorSections(error, componentStack).map(({ label, content }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
				direction: "column",
				gap: "xs",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Text, {
					variant: "heading-md",
					children: label
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
					className: "customize-widgets-error-boundary__report-section",
					children: content
				})]
			}, label))
		});
	}
	function ErrorDetails({ error, componentStack }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Root$1, {
			className: "customize-widgets-error-boundary__details",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Header$1, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Title$1, { children: (0, _wordpress_i18n.__)("Error details") }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Content, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorReport, {
				error,
				componentStack
			}) })]
		});
	}
	var ErrorBoundary = class extends _wordpress_element.Component {
		constructor() {
			super(...arguments);
			this.state = {
				error: null,
				componentStack: null
			};
		}
		componentDidCatch(error, errorInfo) {
			const { title, description } = getErrorNotice();
			(0, _wordpress_a11y.speak)(`${title}. ${description}`, "assertive");
			this.setState({ componentStack: errorInfo?.componentStack });
			(0, _wordpress_hooks.doAction)("editor.ErrorBoundary.errorLogged", error, errorInfo);
		}
		static getDerivedStateFromError(error) {
			return { error };
		}
		render() {
			const { error, componentStack } = this.state;
			if (!error) return this.props.children;
			const { title, description } = getErrorNotice();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
				className: "customize-widgets-error-boundary",
				direction: "column",
				gap: "lg",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Root, {
					intent: "error",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Title, { children: title }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Description, { children: description }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Actions, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
							variant: "solid",
							text: () => getErrorReport(error, componentStack),
							children: (0, _wordpress_i18n._x)("Copy error", "button label")
						}) })
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorDetails, {
					error,
					componentStack
				})]
			});
		}
	};

// packages/customize-widgets/build-module/components/block-inspector-button/index.mjs
	function BlockInspectorButton({ inspector, closeMenu, ...props }) {
		const selectedBlockClientId = (0, _wordpress_data.useSelect)((select) => select(_wordpress_block_editor.store).getSelectedBlockClientId(), []);
		const selectedBlock = (0, _wordpress_element.useMemo)(() => document.getElementById(`block-${selectedBlockClientId}`), [selectedBlockClientId]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.MenuItem, {
			onClick: () => {
				inspector.open({ returnFocusWhenClose: selectedBlock });
				closeMenu();
			},
			...props,
			children: (0, _wordpress_i18n.__)("Show more settings")
		});
	}

// packages/customize-widgets/build-module/store/reducer.mjs
/**
	* Reducer tracking whether the inserter is open.
	*
	* @param {boolean|Object} state
	* @param {Object}         action
	*/
	function blockInserterPanel(state = false, action) {
		switch (action.type) {
			case "SET_IS_INSERTER_OPENED": return action.value;
		}
		return state;
	}
	var reducer_default = (0, _wordpress_data.combineReducers)({ blockInserterPanel });

// packages/customize-widgets/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		__experimentalGetInsertionPoint: () => __experimentalGetInsertionPoint,
		isInserterOpened: () => isInserterOpened
	}, 1);
	const EMPTY_INSERTION_POINT = {
		rootClientId: void 0,
		insertionIndex: void 0
	};
	/**
	* Returns true if the inserter is opened.
	*
	* @param {Object} state Global application state.
	*
	* @example
	* ```js
	* import { store as customizeWidgetsStore } from '@wordpress/customize-widgets';
	* import { __ } from '@wordpress/i18n';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*    const { isInserterOpened } = useSelect(
	*        ( select ) => select( customizeWidgetsStore ),
	*        []
	*    );
	*
	*    return isInserterOpened()
	*        ? __( 'Inserter is open' )
	*        : __( 'Inserter is closed.' );
	* };
	* ```
	*
	* @return {boolean} Whether the inserter is opened.
	*/
	function isInserterOpened(state) {
		return !!state.blockInserterPanel;
	}
	/**
	* Get the insertion point for the inserter.
	*
	* @param {Object} state Global application state.
	*
	* @return {Object} The root client ID and index to insert at.
	*/
	function __experimentalGetInsertionPoint(state) {
		if (typeof state.blockInserterPanel === "boolean") return EMPTY_INSERTION_POINT;
		return state.blockInserterPanel;
	}

// packages/customize-widgets/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({ setIsInserterOpened: () => setIsInserterOpened }, 1);
	/**
	* Returns an action object used to open/close the inserter.
	*
	* @param {boolean|Object} value                Whether the inserter should be
	*                                              opened (true) or closed (false).
	*                                              To specify an insertion point,
	*                                              use an object.
	* @param {string}         value.rootClientId   The root client ID to insert at.
	* @param {number}         value.insertionIndex The index to insert at.
	*
	* @example
	* ```js
	* import { useState } from 'react';
	* import { store as customizeWidgetsStore } from '@wordpress/customize-widgets';
	* import { __ } from '@wordpress/i18n';
	* import { useDispatch } from '@wordpress/data';
	* import { Button } from '@wordpress/components';
	*
	* const ExampleComponent = () => {
	*   const { setIsInserterOpened } = useDispatch( customizeWidgetsStore );
	*   const [ isOpen, setIsOpen ] = useState( false );
	*
	*    return (
	*        <Button
	*            onClick={ () => {
	*                setIsInserterOpened( ! isOpen );
	*                setIsOpen( ! isOpen );
	*            } }
	*        >
	*            { __( 'Open/close inserter' ) }
	*        </Button>
	*    );
	* };
	* ```
	*
	* @return {Object} Action object.
	*/
	function setIsInserterOpened(value) {
		return {
			type: "SET_IS_INSERTER_OPENED",
			value
		};
	}

// packages/customize-widgets/build-module/store/constants.mjs
/**
	* Module Constants
	*/
	const STORE_NAME = "core/customize-widgets";

// packages/customize-widgets/build-module/store/index.mjs
/**
	* Store definition for the edit widgets namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*
	* @type {Object}
	*/
	const store = (0, _wordpress_data.createReduxStore)(STORE_NAME, {
		reducer: reducer_default,
		selectors: selectors_exports,
		actions: actions_exports
	});
	(0, _wordpress_data.register)(store);

// packages/customize-widgets/build-module/components/inserter/index.mjs
	function Inserter({ setIsOpened }) {
		const inserterTitleId = (0, _wordpress_compose.useInstanceId)(Inserter, "customize-widget-layout__inserter-panel-title");
		const insertionPoint = (0, _wordpress_data.useSelect)((select) => select(store).__experimentalGetInsertionPoint(), []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "customize-widgets-layout__inserter-panel",
			"aria-labelledby": inserterTitleId,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "customize-widgets-layout__inserter-panel-header",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
					id: inserterTitleId,
					className: "customize-widgets-layout__inserter-panel-header-title",
					children: (0, _wordpress_i18n.__)("Add a block")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
					size: "small",
					icon: close_small_default,
					onClick: () => setIsOpened(false),
					"aria-label": (0, _wordpress_i18n.__)("Close inserter")
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "customize-widgets-layout__inserter-panel-content",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.__experimentalLibrary, {
					rootClientId: insertionPoint.rootClientId,
					__experimentalInsertionIndex: insertionPoint.insertionIndex,
					showInserterHelpPanel: true,
					onSelect: () => setIsOpened(false)
				})
			})]
		});
	}

// packages/customize-widgets/build-module/components/keyboard-shortcut-help-modal/config.mjs
	const textFormattingShortcuts = [
		{
			keyCombination: {
				modifier: "primary",
				character: "b"
			},
			description: (0, _wordpress_i18n.__)("Make the selected text bold.")
		},
		{
			keyCombination: {
				modifier: "primary",
				character: "i"
			},
			description: (0, _wordpress_i18n.__)("Make the selected text italic.")
		},
		{
			keyCombination: {
				modifier: "primary",
				character: "k"
			},
			description: (0, _wordpress_i18n.__)("Convert the selected text into a link.")
		},
		{
			keyCombination: {
				modifier: "primaryShift",
				character: "k"
			},
			description: (0, _wordpress_i18n.__)("Remove a link.")
		},
		{
			keyCombination: { character: "[[" },
			description: (0, _wordpress_i18n.__)("Insert a link to a post or page.")
		},
		{
			keyCombination: {
				modifier: "primary",
				character: "u"
			},
			description: (0, _wordpress_i18n.__)("Underline the selected text.")
		},
		{
			keyCombination: {
				modifier: "access",
				character: "d"
			},
			description: (0, _wordpress_i18n.__)("Strikethrough the selected text.")
		},
		{
			keyCombination: {
				modifier: "access",
				character: "x"
			},
			description: (0, _wordpress_i18n.__)("Make the selected text inline code.")
		},
		{
			keyCombination: {
				modifier: "access",
				character: "0"
			},
			aliases: [{
				modifier: "access",
				character: "7"
			}],
			description: (0, _wordpress_i18n.__)("Convert the current heading to a paragraph.")
		},
		{
			keyCombination: {
				modifier: "access",
				character: "1-6"
			},
			description: (0, _wordpress_i18n.__)("Convert the current paragraph or heading to a heading of level 1 to 6.")
		},
		{
			keyCombination: {
				modifier: "primaryShift",
				character: "SPACE"
			},
			description: (0, _wordpress_i18n.__)("Add non breaking space.")
		}
	];

// packages/customize-widgets/build-module/components/keyboard-shortcut-help-modal/shortcut.mjs
	function KeyCombination({ keyCombination, forceAriaLabel }) {
		const shortcut = keyCombination.modifier ? _wordpress_keycodes.displayShortcutList[keyCombination.modifier](keyCombination.character) : keyCombination.character;
		const ariaLabel = keyCombination.modifier ? _wordpress_keycodes.shortcutAriaLabel[keyCombination.modifier](keyCombination.character) : keyCombination.character;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", {
			className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-key-combination",
			"aria-label": forceAriaLabel || ariaLabel,
			children: (Array.isArray(shortcut) ? shortcut : [shortcut]).map((character, index) => {
				if (character === "+") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_element.Fragment, { children: character }, index);
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", {
					className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-key",
					children: character
				}, index);
			})
		});
	}
	function Shortcut({ description, keyCombination, aliases = [], ariaLabel }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-description",
			children: description
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-term",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(KeyCombination, {
				keyCombination,
				forceAriaLabel: ariaLabel
			}), aliases.map((alias, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(KeyCombination, {
				keyCombination: alias,
				forceAriaLabel: ariaLabel
			}, index))]
		})] });
	}

// packages/customize-widgets/build-module/components/keyboard-shortcut-help-modal/dynamic-shortcut.mjs
	function DynamicShortcut({ name }) {
		const { keyCombination, description, aliases } = (0, _wordpress_data.useSelect)((select) => {
			const { getShortcutKeyCombination, getShortcutDescription, getShortcutAliases } = select(_wordpress_keyboard_shortcuts.store);
			return {
				keyCombination: getShortcutKeyCombination(name),
				aliases: getShortcutAliases(name),
				description: getShortcutDescription(name)
			};
		}, [name]);
		if (!keyCombination) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Shortcut, {
			keyCombination,
			description,
			aliases
		});
	}

// packages/customize-widgets/build-module/components/keyboard-shortcut-help-modal/index.mjs
	const ShortcutList = ({ shortcuts }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
		className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-list",
		role: "list",
		children: shortcuts.map((shortcut, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
			className: "customize-widgets-keyboard-shortcut-help-modal__shortcut",
			children: typeof shortcut === "string" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DynamicShortcut, { name: shortcut }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Shortcut, { ...shortcut })
		}, index))
	});
	const ShortcutSection = ({ title, shortcuts, className }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: clsx("customize-widgets-keyboard-shortcut-help-modal__section", className),
		children: [!!title && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
			className: "customize-widgets-keyboard-shortcut-help-modal__section-title",
			children: title
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ShortcutList, { shortcuts })]
	});
	const ShortcutCategorySection = ({ title, categoryName, additionalShortcuts = [] }) => {
		const categoryShortcuts = (0, _wordpress_data.useSelect)((select) => {
			return select(_wordpress_keyboard_shortcuts.store).getCategoryShortcuts(categoryName);
		}, [categoryName]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ShortcutSection, {
			title,
			shortcuts: categoryShortcuts.concat(additionalShortcuts)
		});
	};
	function KeyboardShortcutHelpModal({ isModalActive, toggleModal }) {
		const { registerShortcut } = (0, _wordpress_data.useDispatch)(_wordpress_keyboard_shortcuts.store);
		(0, _wordpress_element.useEffect)(() => {
			registerShortcut({
				name: "core/customize-widgets/keyboard-shortcuts",
				category: "main",
				description: (0, _wordpress_i18n.__)("Display these keyboard shortcuts."),
				keyCombination: {
					modifier: "access",
					character: "h"
				}
			});
		}, [registerShortcut]);
		(0, _wordpress_keyboard_shortcuts.useShortcut)("core/customize-widgets/keyboard-shortcuts", toggleModal);
		if (!isModalActive) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.Modal, {
			className: "customize-widgets-keyboard-shortcut-help-modal",
			title: (0, _wordpress_i18n.__)("Keyboard shortcuts"),
			onRequestClose: toggleModal,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ShortcutSection, {
					className: "customize-widgets-keyboard-shortcut-help-modal__main-shortcuts",
					shortcuts: ["core/customize-widgets/keyboard-shortcuts"]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ShortcutCategorySection, {
					title: (0, _wordpress_i18n.__)("Global shortcuts"),
					categoryName: "global"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ShortcutCategorySection, {
					title: (0, _wordpress_i18n.__)("Selection shortcuts"),
					categoryName: "selection"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ShortcutCategorySection, {
					title: (0, _wordpress_i18n.__)("Block shortcuts"),
					categoryName: "block",
					additionalShortcuts: [{
						keyCombination: { character: "/" },
						description: (0, _wordpress_i18n.__)("Change the block type after adding a new paragraph."),
						ariaLabel: (0, _wordpress_i18n.__)("Forward-slash")
					}]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ShortcutSection, {
					title: (0, _wordpress_i18n.__)("Text formatting"),
					shortcuts: textFormattingShortcuts
				})
			]
		});
	}

// packages/customize-widgets/build-module/components/more-menu/index.mjs
	function MoreMenu() {
		const [isKeyboardShortcutsModalActive, setIsKeyboardShortcutsModalVisible] = (0, _wordpress_element.useState)(false);
		const toggleKeyboardShortcutsModal = () => setIsKeyboardShortcutsModalVisible(!isKeyboardShortcutsModalActive);
		(0, _wordpress_keyboard_shortcuts.useShortcut)("core/customize-widgets/keyboard-shortcuts", toggleKeyboardShortcutsModal);
		const { toggle } = (0, _wordpress_data.useDispatch)(_wordpress_preferences.store);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ToolbarDropdownMenu, {
			icon: more_vertical_default,
			label: (0, _wordpress_i18n.__)("Options"),
			popoverProps: {
				placement: "bottom-end",
				className: "more-menu-dropdown__content"
			},
			toggleProps: {
				tooltipPosition: "bottom",
				size: "compact"
			},
			children: () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.MenuGroup, {
					label: (0, _wordpress_i18n._x)("View", "noun"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_preferences.PreferenceToggleMenuItem, {
						scope: "core/customize-widgets",
						name: "fixedToolbar",
						label: (0, _wordpress_i18n.__)("Top toolbar"),
						info: (0, _wordpress_i18n.__)("Access all block and document tools in a single place"),
						messageActivated: (0, _wordpress_i18n.__)("Top toolbar activated"),
						messageDeactivated: (0, _wordpress_i18n.__)("Top toolbar deactivated")
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.MenuGroup, {
					label: (0, _wordpress_i18n.__)("Tools"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.MenuItem, {
							onClick: () => {
								setIsKeyboardShortcutsModalVisible(true);
							},
							shortcut: _wordpress_keycodes.displayShortcut.access("h"),
							children: (0, _wordpress_i18n.__)("Keyboard shortcuts")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.MenuItem, {
							onClick: () => toggle("core/customize-widgets", "welcomeGuide"),
							children: (0, _wordpress_i18n.__)("Welcome Guide")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.MenuItem, {
							role: "menuitem",
							icon: external_default,
							href: (0, _wordpress_i18n.__)("https://wordpress.org/documentation/article/block-based-widgets-editor/"),
							target: "_blank",
							rel: "noopener",
							children: [(0, _wordpress_i18n.__)("Help"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VisuallyHidden, {
								render: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}),
								children: (0, _wordpress_i18n.__)("(opens in a new tab)")
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.MenuGroup, {
					label: (0, _wordpress_i18n.__)("Preferences"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_preferences.PreferenceToggleMenuItem, {
						scope: "core/customize-widgets",
						name: "keepCaretInsideBlock",
						label: (0, _wordpress_i18n.__)("Contain text cursor inside block"),
						info: (0, _wordpress_i18n.__)("Aids screen readers by stopping text caret from leaving blocks."),
						messageActivated: (0, _wordpress_i18n.__)("Contain text cursor inside block activated"),
						messageDeactivated: (0, _wordpress_i18n.__)("Contain text cursor inside block deactivated")
					})
				})
			] })
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(KeyboardShortcutHelpModal, {
			isModalActive: isKeyboardShortcutsModalActive,
			toggleModal: toggleKeyboardShortcutsModal
		})] });
	}

// packages/customize-widgets/build-module/components/header/index.mjs
	function Header({ sidebar, inserter, isInserterOpened, setIsInserterOpened, isFixedToolbarActive }) {
		const [[hasUndo, hasRedo], setUndoRedo] = (0, _wordpress_element.useState)([sidebar.hasUndo(), sidebar.hasRedo()]);
		const shortcut = (0, _wordpress_keycodes.isAppleOS)() ? _wordpress_keycodes.displayShortcut.primaryShift("z") : _wordpress_keycodes.displayShortcut.primary("y");
		(0, _wordpress_element.useEffect)(() => {
			return sidebar.subscribeHistory(() => {
				setUndoRedo([sidebar.hasUndo(), sidebar.hasRedo()]);
			});
		}, [sidebar]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: clsx("customize-widgets-header", { "is-fixed-toolbar-active": isFixedToolbarActive }),
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_block_editor.NavigableToolbar, {
				className: "customize-widgets-header-toolbar",
				"aria-label": (0, _wordpress_i18n.__)("Document tools"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ToolbarItem, {
						as: _wordpress_components.Button,
						icon: !(0, _wordpress_i18n.isRTL)() ? undo_default : redo_default,
						label: (0, _wordpress_i18n.__)("Undo"),
						shortcut: _wordpress_keycodes.displayShortcut.primary("z"),
						"aria-disabled": !hasUndo,
						onClick: hasUndo ? sidebar.undo : void 0,
						size: "compact",
						className: "customize-widgets-editor-history-button undo-button"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ToolbarItem, {
						as: _wordpress_components.Button,
						icon: !(0, _wordpress_i18n.isRTL)() ? redo_default : undo_default,
						label: (0, _wordpress_i18n.__)("Redo"),
						shortcut,
						"aria-disabled": !hasRedo,
						onClick: hasRedo ? sidebar.redo : void 0,
						size: "compact",
						className: "customize-widgets-editor-history-button redo-button"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ToolbarItem, {
						as: _wordpress_components.Button,
						className: "customize-widgets-header-toolbar__inserter-toggle",
						isPressed: isInserterOpened,
						variant: "primary",
						icon: plus_default,
						label: (0, _wordpress_i18n._x)("Add block", "Generic label for block inserter button"),
						onClick: () => {
							setIsInserterOpened((isOpen) => !isOpen);
						},
						size: "compact"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MoreMenu, {})
				]
			})
		}), (0, _wordpress_element.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inserter, { setIsOpened: setIsInserterOpened }), inserter.contentContainer[0])] });
	}

// packages/customize-widgets/build-module/components/inserter/use-inserter.mjs
	function useInserter(inserter) {
		const isInserterOpened = (0, _wordpress_data.useSelect)((select) => select(store).isInserterOpened(), []);
		const { setIsInserterOpened } = (0, _wordpress_data.useDispatch)(store);
		(0, _wordpress_element.useEffect)(() => {
			if (isInserterOpened) inserter.open();
			else inserter.close();
		}, [inserter, isInserterOpened]);
		return [isInserterOpened, (0, _wordpress_element.useCallback)((updater) => {
			let isOpen = updater;
			if (typeof updater === "function") isOpen = updater((0, _wordpress_data.select)(store).isInserterOpened());
			setIsInserterOpened(isOpen);
		}, [setIsInserterOpened])];
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

// packages/customize-widgets/build-module/utils.mjs
var import_es6 = /* @__PURE__ */ __toESM(require_es6(), 1);
/**
	* Convert settingId to widgetId.
	*
	* @param {string} settingId The setting id.
	* @return {string} The widget id.
	*/
	function settingIdToWidgetId(settingId) {
		const matches = settingId.match(/^widget_(.+)(?:\[(\d+)\])$/);
		if (matches) return `${matches[1]}-${parseInt(matches[2], 10)}`;
		return settingId;
	}
	/**
	* Transform a block to a customizable widget.
	*
	* @param {WPBlock} block          The block to be transformed from.
	* @param {Object}  existingWidget The widget to be extended from.
	* @return {Object} The transformed widget.
	*/
	function blockToWidget(block, existingWidget = null) {
		let widget;
		if (block.name === "core/legacy-widget" && (block.attributes.id || block.attributes.instance)) {
			if (block.attributes.id) widget = { id: block.attributes.id };
			else {
				const { encoded, hash, raw, ...rest } = block.attributes.instance;
				widget = {
					idBase: block.attributes.idBase,
					instance: {
						...existingWidget?.instance,
						is_widget_customizer_js_value: true,
						encoded_serialized_instance: encoded,
						instance_hash_key: hash,
						raw_instance: raw,
						...rest
					}
				};
			}
		} else widget = {
			idBase: "block",
			widgetClass: "WP_Widget_Block",
			instance: { raw_instance: { content: (0, _wordpress_blocks.serialize)(block) } }
		};
		const { form, rendered, ...restExistingWidget } = existingWidget || {};
		return {
			...restExistingWidget,
			...widget
		};
	}
	/**
	* Transform a widget to a block.
	*
	* @param {Object} widget          The widget to be transformed from.
	* @param {string} widget.id       The widget id.
	* @param {string} widget.idBase   The id base of the widget.
	* @param {number} widget.number   The number/index of the widget.
	* @param {Object} widget.instance The instance of the widget.
	* @return {WPBlock} The transformed block.
	*/
	function widgetToBlock({ id, idBase, number, instance }) {
		let block;
		const { encoded_serialized_instance: encoded, instance_hash_key: hash, raw_instance: raw, ...rest } = instance;
		if (idBase === "block") {
			const parsedBlocks = (0, _wordpress_blocks.parse)(raw.content ?? "", { __unstableSkipAutop: true });
			block = parsedBlocks.length ? parsedBlocks[0] : (0, _wordpress_blocks.createBlock)("core/paragraph", {});
		} else if (number) block = (0, _wordpress_blocks.createBlock)("core/legacy-widget", {
			idBase,
			instance: {
				encoded,
				hash,
				raw,
				...rest
			}
		});
		else block = (0, _wordpress_blocks.createBlock)("core/legacy-widget", { id });
		return (0, _wordpress_widgets.addWidgetIdToBlock)(block, id);
	}

// packages/customize-widgets/build-module/components/sidebar-block-editor/use-sidebar-block-editor.mjs
	function widgetsToBlocks(widgets) {
		return widgets.map((widget) => widgetToBlock(widget));
	}
	function useSidebarBlockEditor(sidebar) {
		const [blocks, setBlocks] = (0, _wordpress_element.useState)(() => widgetsToBlocks(sidebar.getWidgets()));
		(0, _wordpress_element.useEffect)(() => {
			return sidebar.subscribe((prevWidgets, nextWidgets) => {
				setBlocks((prevBlocks) => {
					const prevWidgetsMap = new Map(prevWidgets.map((widget) => [widget.id, widget]));
					const prevBlocksMap = new Map(prevBlocks.map((block) => [(0, _wordpress_widgets.getWidgetIdFromBlock)(block), block]));
					const nextBlocks = nextWidgets.map((nextWidget) => {
						const prevWidget = prevWidgetsMap.get(nextWidget.id);
						if (prevWidget && prevWidget === nextWidget) return prevBlocksMap.get(nextWidget.id);
						return widgetToBlock(nextWidget);
					});
					if ((0, _wordpress_is_shallow_equal.isShallowEqual)(prevBlocks, nextBlocks)) return prevBlocks;
					return nextBlocks;
				});
			});
		}, [sidebar]);
		const onChangeBlocks = (0, _wordpress_element.useCallback)((nextBlocks) => {
			setBlocks((prevBlocks) => {
				if ((0, _wordpress_is_shallow_equal.isShallowEqual)(prevBlocks, nextBlocks)) return prevBlocks;
				const prevBlocksMap = new Map(prevBlocks.map((block) => [(0, _wordpress_widgets.getWidgetIdFromBlock)(block), block]));
				const nextWidgets = nextBlocks.map((nextBlock) => {
					const widgetId = (0, _wordpress_widgets.getWidgetIdFromBlock)(nextBlock);
					if (widgetId && prevBlocksMap.has(widgetId)) {
						const prevBlock = prevBlocksMap.get(widgetId);
						const prevWidget = sidebar.getWidget(widgetId);
						if ((0, import_es6.default)(nextBlock, prevBlock) && prevWidget) return prevWidget;
						return blockToWidget(nextBlock, prevWidget);
					}
					return blockToWidget(nextBlock);
				});
				if ((0, _wordpress_is_shallow_equal.isShallowEqual)(sidebar.getWidgets(), nextWidgets)) return prevBlocks;
				const addedWidgetIds = sidebar.setWidgets(nextWidgets);
				return nextBlocks.reduce((updatedNextBlocks, nextBlock, index) => {
					const addedWidgetId = addedWidgetIds[index];
					if (addedWidgetId !== null) {
						if (updatedNextBlocks === nextBlocks) updatedNextBlocks = nextBlocks.slice();
						updatedNextBlocks[index] = (0, _wordpress_widgets.addWidgetIdToBlock)(nextBlock, addedWidgetId);
					}
					return updatedNextBlocks;
				}, nextBlocks);
			});
		}, [sidebar]);
		return [
			blocks,
			onChangeBlocks,
			onChangeBlocks
		];
	}

// packages/customize-widgets/build-module/components/focus-control/index.mjs
	const FocusControlContext = (0, _wordpress_element.createContext)();
	FocusControlContext.displayName = "FocusControlContext";
	function FocusControl({ api, sidebarControls, children }) {
		const [focusedWidgetIdRef, setFocusedWidgetIdRef] = (0, _wordpress_element.useState)({ current: null });
		const focusWidget = (0, _wordpress_element.useCallback)((widgetId) => {
			for (const sidebarControl of sidebarControls) if (sidebarControl.setting.get().includes(widgetId)) {
				sidebarControl.sectionInstance.expand({ completeCallback() {
					setFocusedWidgetIdRef({ current: widgetId });
				} });
				break;
			}
		}, [sidebarControls]);
		(0, _wordpress_element.useEffect)(() => {
			function handleFocus(settingId) {
				const widgetId = settingIdToWidgetId(settingId);
				focusWidget(widgetId);
			}
			let previewBound = false;
			function handleReady() {
				api.previewer.preview.bind("focus-control-for-setting", handleFocus);
				previewBound = true;
			}
			api.previewer.bind("ready", handleReady);
			return () => {
				api.previewer.unbind("ready", handleReady);
				if (previewBound) api.previewer.preview.unbind("focus-control-for-setting", handleFocus);
			};
		}, [api, focusWidget]);
		const context = (0, _wordpress_element.useMemo)(() => [focusedWidgetIdRef, focusWidget], [focusedWidgetIdRef, focusWidget]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FocusControlContext.Provider, {
			value: context,
			children
		});
	}
	const useFocusControl = () => (0, _wordpress_element.useContext)(FocusControlContext);

// packages/customize-widgets/build-module/components/focus-control/use-blocks-focus-control.mjs
	function useBlocksFocusControl(blocks) {
		const { selectBlock } = (0, _wordpress_data.useDispatch)(_wordpress_block_editor.store);
		const [focusedWidgetIdRef] = useFocusControl();
		const blocksRef = (0, _wordpress_element.useRef)(blocks);
		(0, _wordpress_element.useEffect)(() => {
			blocksRef.current = blocks;
		}, [blocks]);
		(0, _wordpress_element.useEffect)(() => {
			if (focusedWidgetIdRef.current) {
				const focusedBlock = blocksRef.current.find((block) => (0, _wordpress_widgets.getWidgetIdFromBlock)(block) === focusedWidgetIdRef.current);
				if (focusedBlock) {
					selectBlock(focusedBlock.clientId);
					document.querySelector(`[data-block="${focusedBlock.clientId}"]`)?.focus();
				}
			}
		}, [focusedWidgetIdRef, selectBlock]);
	}

// packages/customize-widgets/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/customize-widgets");

// packages/customize-widgets/build-module/components/sidebar-block-editor/sidebar-editor-provider.mjs
	const { ExperimentalBlockEditorProvider } = unlock(_wordpress_block_editor.privateApis);
	function SidebarEditorProvider({ sidebar, settings, children }) {
		const [blocks, onInput, onChange] = useSidebarBlockEditor(sidebar);
		useBlocksFocusControl(blocks);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExperimentalBlockEditorProvider, {
			value: blocks,
			onInput,
			onChange,
			settings,
			useSubRegistry: false,
			children
		});
	}

// packages/customize-widgets/build-module/components/welcome-guide/index.mjs
	function WelcomeGuide({ sidebar }) {
		const { set: setPreference } = (0, _wordpress_data.useDispatch)(_wordpress_preferences.store);
		const isEntirelyBlockWidgets = sidebar.getWidgets().every((widget) => widget.id.startsWith("block-"));
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "customize-widgets-welcome-guide",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "customize-widgets-welcome-guide__image__wrapper",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("picture", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("source", {
						srcSet: "https://s.w.org/images/block-editor/welcome-editor.svg",
						media: "(prefers-reduced-motion: reduce)"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						className: "customize-widgets-welcome-guide__image",
						src: "https://s.w.org/images/block-editor/welcome-editor.gif",
						width: "312",
						height: "240",
						alt: ""
					})] })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
					className: "customize-widgets-welcome-guide__heading",
					children: (0, _wordpress_i18n.__)("Welcome to block Widgets")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "customize-widgets-welcome-guide__text",
					children: isEntirelyBlockWidgets ? (0, _wordpress_i18n.__)("Your theme provides different “block” areas for you to add and edit content.\xA0Try adding a search bar, social icons, or other types of blocks here and see how they’ll look on your site.") : (0, _wordpress_i18n.__)("You can now add any block to your site’s widget areas. Don’t worry, all of your favorite widgets still work flawlessly.")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
					size: "compact",
					variant: "primary",
					onClick: () => setPreference("core/customize-widgets", "welcomeGuide", false),
					children: (0, _wordpress_i18n.__)("Got it")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("hr", { className: "customize-widgets-welcome-guide__separator" }),
				!isEntirelyBlockWidgets && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: "customize-widgets-welcome-guide__more-info",
					children: [
						(0, _wordpress_i18n.__)("Want to stick with the old widgets?"),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ExternalLink, {
							href: (0, _wordpress_i18n.__)("https://wordpress.org/plugins/classic-widgets/"),
							children: (0, _wordpress_i18n.__)("Get the Classic Widgets plugin.")
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: "customize-widgets-welcome-guide__more-info",
					children: [
						(0, _wordpress_i18n.__)("New to the block editor?"),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ExternalLink, {
							href: (0, _wordpress_i18n.__)("https://wordpress.org/documentation/article/wordpress-block-editor/"),
							children: (0, _wordpress_i18n.__)("Here's a detailed guide.")
						})
					]
				})
			]
		});
	}

// packages/customize-widgets/build-module/components/keyboard-shortcuts/index.mjs
	const { usesNativeUndo } = unlock(_wordpress_block_editor.privateApis);
	function KeyboardShortcuts({ undo, redo, save }) {
		(0, _wordpress_keyboard_shortcuts.useShortcut)("core/customize-widgets/undo", (event) => {
			if (usesNativeUndo(event)) return;
			undo();
			event.preventDefault();
		});
		(0, _wordpress_keyboard_shortcuts.useShortcut)("core/customize-widgets/redo", (event) => {
			if (usesNativeUndo(event)) return;
			redo();
			event.preventDefault();
		});
		(0, _wordpress_keyboard_shortcuts.useShortcut)("core/customize-widgets/save", (event) => {
			event.preventDefault();
			save();
		});
		return null;
	}
	function KeyboardShortcutsRegister() {
		const { registerShortcut, unregisterShortcut } = (0, _wordpress_data.useDispatch)(_wordpress_keyboard_shortcuts.store);
		(0, _wordpress_element.useEffect)(() => {
			registerShortcut({
				name: "core/customize-widgets/undo",
				category: "global",
				description: (0, _wordpress_i18n.__)("Undo your last changes."),
				keyCombination: {
					modifier: "primary",
					character: "z"
				}
			});
			registerShortcut({
				name: "core/customize-widgets/redo",
				category: "global",
				description: (0, _wordpress_i18n.__)("Redo your last undo."),
				keyCombination: {
					modifier: "primaryShift",
					character: "z"
				},
				aliases: (0, _wordpress_keycodes.isAppleOS)() ? [] : [{
					modifier: "primary",
					character: "y"
				}]
			});
			registerShortcut({
				name: "core/customize-widgets/save",
				category: "global",
				description: (0, _wordpress_i18n.__)("Save your changes."),
				keyCombination: {
					modifier: "primary",
					character: "s"
				}
			});
			return () => {
				unregisterShortcut("core/customize-widgets/undo");
				unregisterShortcut("core/customize-widgets/redo");
				unregisterShortcut("core/customize-widgets/save");
			};
		}, [registerShortcut]);
		return null;
	}
	KeyboardShortcuts.Register = KeyboardShortcutsRegister;

// packages/customize-widgets/build-module/components/block-appender/index.mjs
	function BlockAppender(props) {
		const ref = (0, _wordpress_element.useRef)();
		const isBlocksListEmpty = (0, _wordpress_data.useSelect)((select) => select(_wordpress_block_editor.store).getBlockCount() === 0);
		(0, _wordpress_element.useEffect)(() => {
			if (isBlocksListEmpty && ref.current) {
				const { ownerDocument } = ref.current;
				if (!ownerDocument.activeElement || ownerDocument.activeElement === ownerDocument.body) ref.current.focus();
			}
		}, [isBlocksListEmpty]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.ButtonBlockAppender, {
			...props,
			ref
		});
	}

// packages/customize-widgets/build-module/components/sidebar-block-editor/index.mjs
	const { ExperimentalBlockCanvas: BlockCanvas } = unlock(_wordpress_block_editor.privateApis);
	function SidebarBlockEditor({ blockEditorSettings, sidebar, inserter, inspector }) {
		const [isInserterOpened, setIsInserterOpened] = useInserter(inserter);
		const isMediumViewport = (0, _wordpress_compose.useViewportMatch)("small");
		const { hasUploadPermissions, isFixedToolbarActive, keepCaretInsideBlock, isWelcomeGuideActive } = (0, _wordpress_data.useSelect)((select) => {
			const { get } = select(_wordpress_preferences.store);
			return {
				hasUploadPermissions: select(_wordpress_core_data.store).canUser("create", {
					kind: "postType",
					name: "attachment"
				}) ?? true,
				isFixedToolbarActive: !!get("core/customize-widgets", "fixedToolbar"),
				keepCaretInsideBlock: !!get("core/customize-widgets", "keepCaretInsideBlock"),
				isWelcomeGuideActive: !!get("core/customize-widgets", "welcomeGuide")
			};
		}, []);
		const settings = (0, _wordpress_element.useMemo)(() => {
			let mediaUploadBlockEditor;
			if (hasUploadPermissions) mediaUploadBlockEditor = ({ onError, ...argumentsObject }) => {
				(0, _wordpress_media_utils.uploadMedia)({
					wpAllowedMimeTypes: blockEditorSettings.allowedMimeTypes,
					onError: ({ message }) => onError(message),
					...argumentsObject
				});
			};
			return {
				...blockEditorSettings,
				__experimentalSetIsInserterOpened: setIsInserterOpened,
				mediaUpload: mediaUploadBlockEditor,
				hasFixedToolbar: isFixedToolbarActive || !isMediumViewport,
				keepCaretInsideBlock,
				__unstableHasCustomAppender: true
			};
		}, [
			hasUploadPermissions,
			blockEditorSettings,
			isFixedToolbarActive,
			isMediumViewport,
			keepCaretInsideBlock,
			setIsInserterOpened
		]);
		if (isWelcomeGuideActive) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WelcomeGuide, { sidebar });
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(KeyboardShortcuts.Register, {}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(SidebarEditorProvider, {
				sidebar,
				settings,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(KeyboardShortcuts, {
						undo: sidebar.undo,
						redo: sidebar.redo,
						save: sidebar.save
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Header, {
						sidebar,
						inserter,
						isInserterOpened,
						setIsInserterOpened,
						isFixedToolbarActive: isFixedToolbarActive || !isMediumViewport
					}),
					(isFixedToolbarActive || !isMediumViewport) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.BlockToolbar, { hideDragHandle: true }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BlockCanvas, {
						shouldIframe: false,
						styles: settings.defaultEditorStyles,
						height: "100%",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.BlockList, { renderAppender: BlockAppender })
					}),
					(0, _wordpress_element.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
						onSubmit: (event) => event.preventDefault(),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.BlockInspector, {})
					}), inspector.contentContainer[0])
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.__unstableBlockSettingsMenuFirstItem, { children: ({ onClose }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BlockInspectorButton, {
				inspector,
				closeMenu: onClose
			}) })
		] });
	}

// packages/customize-widgets/build-module/components/sidebar-controls/index.mjs
	const SidebarControlsContext = (0, _wordpress_element.createContext)();
	SidebarControlsContext.displayName = "SidebarControlsContext";
	function SidebarControls({ sidebarControls, activeSidebarControl, children }) {
		const context = (0, _wordpress_element.useMemo)(() => ({
			sidebarControls,
			activeSidebarControl
		}), [sidebarControls, activeSidebarControl]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SidebarControlsContext.Provider, {
			value: context,
			children
		});
	}
	function useSidebarControls() {
		const { sidebarControls } = (0, _wordpress_element.useContext)(SidebarControlsContext);
		return sidebarControls;
	}
	function useActiveSidebarControl() {
		const { activeSidebarControl } = (0, _wordpress_element.useContext)(SidebarControlsContext);
		return activeSidebarControl;
	}

// packages/customize-widgets/build-module/components/customize-widgets/use-clear-selected-block.mjs
/**
	* We can't just use <BlockSelectionClearer> because the customizer has
	* many root nodes rather than just one in the post editor.
	* We need to listen to the focus events in all those roots, and also in
	* the preview iframe.
	* This hook will clear the selected block when focusing outside the editor,
	* with a few exceptions:
	* 1. Focusing on popovers, including `@wordpress/ui` overlays.
	* 2. Focusing on the inspector.
	* 3. Focusing on any modals/dialogs.
	* These cases are normally triggered by user interactions from the editor,
	* not by explicitly focusing outside the editor, hence no need for clearing.
	*
	* @param {Object} sidebarControl The sidebar control instance.
	* @param {Object} popoverRef     The ref object of the popover node container.
	*/
	function useClearSelectedBlock(sidebarControl, popoverRef) {
		const { hasSelectedBlock, hasMultiSelection } = (0, _wordpress_data.useSelect)(_wordpress_block_editor.store);
		const { clearSelectedBlock } = (0, _wordpress_data.useDispatch)(_wordpress_block_editor.store);
		(0, _wordpress_element.useEffect)(() => {
			if (popoverRef.current && sidebarControl) {
				const inspector = sidebarControl.inspector;
				const container = sidebarControl.container[0];
				const ownerDocument = container.ownerDocument;
				const ownerWindow = ownerDocument.defaultView;
				function handleClearSelectedBlock(element) {
					if ((hasSelectedBlock() || hasMultiSelection()) && element && ownerDocument.contains(element) && !container.contains(element) && !popoverRef.current.contains(element) && !element.closest("[data-wp-compat-overlay-slot]") && !element.closest("[role=\"dialog\"]") && !inspector.expanded()) clearSelectedBlock();
				}
				function handleMouseDown(event) {
					handleClearSelectedBlock(event.target);
				}
				function handleBlur() {
					handleClearSelectedBlock(ownerDocument.activeElement);
				}
				ownerDocument.addEventListener("mousedown", handleMouseDown);
				ownerWindow.addEventListener("blur", handleBlur);
				return () => {
					ownerDocument.removeEventListener("mousedown", handleMouseDown);
					ownerWindow.removeEventListener("blur", handleBlur);
				};
			}
		}, [
			popoverRef,
			sidebarControl,
			hasSelectedBlock,
			hasMultiSelection,
			clearSelectedBlock
		]);
	}

// packages/customize-widgets/build-module/components/customize-widgets/index.mjs
	function CustomizeWidgets({ api, sidebarControls, blockEditorSettings }) {
		const [activeSidebarControl, setActiveSidebarControl] = (0, _wordpress_element.useState)(null);
		const parentContainer = document.getElementById("customize-theme-controls");
		const popoverRef = (0, _wordpress_element.useRef)();
		const adminPrimary = (0, _wordpress_element.useMemo)(() => getAdminThemeColors().primary, []);
		useEnableWpCompatOverlaySlot();
		useClearSelectedBlock(activeSidebarControl, popoverRef);
		(0, _wordpress_element.useEffect)(() => {
			const unsubscribers = sidebarControls.map((sidebarControl) => sidebarControl.subscribe((expanded) => {
				if (expanded) setActiveSidebarControl(sidebarControl);
			}));
			return () => {
				unsubscribers.forEach((unsubscriber) => unsubscriber());
			};
		}, [sidebarControls]);
		const activeSidebar = activeSidebarControl && (0, _wordpress_element.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SidebarBlockEditor, {
			blockEditorSettings,
			sidebar: activeSidebarControl.sidebarAdapter,
			inserter: activeSidebarControl.inserter,
			inspector: activeSidebarControl.inspector
		}, activeSidebarControl.id) }), activeSidebarControl.container[0]);
		const popover = parentContainer && (0, _wordpress_element.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "customize-widgets-popover",
			ref: popoverRef,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Popover.Slot, {})
		}), parentContainer);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.SlotFillProvider, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_theme.ThemeProvider, {
			isRoot: true,
			color: { primary: adminPrimary },
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SidebarControls, {
				sidebarControls,
				activeSidebarControl,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(FocusControl, {
					api,
					sidebarControls,
					children: [activeSidebar, popover]
				})
			})
		}) });
	}

// packages/customize-widgets/build-module/controls/inspector-section.mjs
	function getInspectorSection() {
		const { wp: { customize } } = window;
		return class InspectorSection extends customize.Section {
			constructor(id, options) {
				super(id, options);
				this.parentSection = options.parentSection;
				this.returnFocusWhenClose = null;
				this._isOpen = false;
			}
			get isOpen() {
				return this._isOpen;
			}
			set isOpen(value) {
				this._isOpen = value;
				this.triggerActiveCallbacks();
			}
			ready() {
				this.contentContainer[0].classList.add("customize-widgets-layout__inspector");
			}
			isContextuallyActive() {
				return this.isOpen;
			}
			onChangeExpanded(expanded, args) {
				super.onChangeExpanded(expanded, args);
				if (this.parentSection && !args.unchanged) {
					if (expanded) this.parentSection.collapse({ manualTransition: true });
					else this.parentSection.expand({
						manualTransition: true,
						completeCallback: () => {
							if (this.returnFocusWhenClose && !this.contentContainer[0].contains(this.returnFocusWhenClose)) this.returnFocusWhenClose.focus();
						}
					});
				}
			}
			open({ returnFocusWhenClose } = {}) {
				this.isOpen = true;
				this.returnFocusWhenClose = returnFocusWhenClose;
				this.expand({ allowMultiple: true });
			}
			close() {
				this.collapse({ allowMultiple: true });
			}
			collapse(options) {
				this.isOpen = false;
				super.collapse(options);
			}
			triggerActiveCallbacks() {
				this.active.callbacks.fireWith(this.active, [false, true]);
			}
		};
	}

// packages/customize-widgets/build-module/controls/sidebar-section.mjs
	const getInspectorSectionId = (sidebarId) => `widgets-inspector-${sidebarId}`;
	function getSidebarSection() {
		const { wp: { customize } } = window;
		const reduceMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		let isReducedMotion = reduceMotionMediaQuery.matches;
		reduceMotionMediaQuery.addEventListener("change", (event) => {
			isReducedMotion = event.matches;
		});
		return class SidebarSection extends customize.Section {
			ready() {
				const InspectorSection = getInspectorSection();
				this.inspector = new InspectorSection(getInspectorSectionId(this.id), {
					title: (0, _wordpress_i18n.__)("Block Settings"),
					parentSection: this,
					customizeAction: [
						(0, _wordpress_i18n.__)("Customizing"),
						(0, _wordpress_i18n.__)("Widgets"),
						this.params.title
					].join(" ▸ ")
				});
				customize.section.add(this.inspector);
				this.contentContainer[0].classList.add("customize-widgets__sidebar-section");
			}
			hasSubSectionOpened() {
				return this.inspector.expanded();
			}
			onChangeExpanded(expanded, _args) {
				const controls = this.controls();
				const args = {
					..._args,
					completeCallback() {
						controls.forEach((control) => {
							control.onChangeSectionExpanded?.(expanded, args);
						});
						_args.completeCallback?.();
					}
				};
				if (args.manualTransition) {
					if (expanded) {
						this.contentContainer.addClass(["busy", "open"]);
						this.contentContainer.removeClass("is-sub-section-open");
						this.contentContainer.closest(".wp-full-overlay").addClass("section-open");
					} else {
						this.contentContainer.addClass(["busy", "is-sub-section-open"]);
						this.contentContainer.closest(".wp-full-overlay").addClass("section-open");
						this.contentContainer.removeClass("open");
					}
					const handleTransitionEnd = () => {
						this.contentContainer.removeClass("busy");
						args.completeCallback();
					};
					if (isReducedMotion) handleTransitionEnd();
					else this.contentContainer.one("transitionend", handleTransitionEnd);
				} else super.onChangeExpanded(expanded, args);
			}
		};
	}

// packages/customize-widgets/build-module/components/sidebar-block-editor/sidebar-adapter.mjs
	const { wp: wp$2 } = window;
	function parseWidgetId(widgetId) {
		const matches = widgetId.match(/^(.+)-(\d+)$/);
		if (matches) return {
			idBase: matches[1],
			number: parseInt(matches[2], 10)
		};
		return { idBase: widgetId };
	}
	function widgetIdToSettingId(widgetId) {
		const { idBase, number } = parseWidgetId(widgetId);
		if (number) return `widget_${idBase}[${number}]`;
		return `widget_${idBase}`;
	}
	/**
	* This is a custom debounce function to call different callbacks depending on
	* whether it's the _leading_ call or not.
	*
	* @param {Function} leading  The callback that gets called first.
	* @param {Function} callback The callback that gets called after the first time.
	* @param {number}   timeout  The debounced time in milliseconds.
	* @return {Function} The debounced function.
	*/
	function debounce(leading, callback, timeout) {
		let isLeading = false;
		let timerID;
		function debounced(...args) {
			const result = (isLeading ? callback : leading).apply(this, args);
			isLeading = true;
			clearTimeout(timerID);
			timerID = setTimeout(() => {
				isLeading = false;
			}, timeout);
			return result;
		}
		debounced.cancel = () => {
			isLeading = false;
			clearTimeout(timerID);
		};
		return debounced;
	}
	var SidebarAdapter = class {
		constructor(setting, api) {
			this.setting = setting;
			this.api = api;
			this.locked = false;
			this.widgetsCache = /* @__PURE__ */ new WeakMap();
			this.subscribers = /* @__PURE__ */ new Set();
			this.history = [this._getWidgetIds().map((widgetId) => this.getWidget(widgetId))];
			this.historyIndex = 0;
			this.historySubscribers = /* @__PURE__ */ new Set();
			this._debounceSetHistory = debounce(this._pushHistory, this._replaceHistory, 1e3);
			this.setting.bind(this._handleSettingChange.bind(this));
			this.api.bind("change", this._handleAllSettingsChange.bind(this));
			this.undo = this.undo.bind(this);
			this.redo = this.redo.bind(this);
			this.save = this.save.bind(this);
		}
		subscribe(callback) {
			this.subscribers.add(callback);
			return () => {
				this.subscribers.delete(callback);
			};
		}
		getWidgets() {
			return this.history[this.historyIndex];
		}
		_emit(...args) {
			for (const callback of this.subscribers) callback(...args);
		}
		_getWidgetIds() {
			return this.setting.get();
		}
		_pushHistory() {
			this.history = [...this.history.slice(0, this.historyIndex + 1), this._getWidgetIds().map((widgetId) => this.getWidget(widgetId))];
			this.historyIndex += 1;
			this.historySubscribers.forEach((listener) => listener());
		}
		_replaceHistory() {
			this.history[this.historyIndex] = this._getWidgetIds().map((widgetId) => this.getWidget(widgetId));
		}
		_handleSettingChange() {
			if (this.locked) return;
			const prevWidgets = this.getWidgets();
			this._pushHistory();
			this._emit(prevWidgets, this.getWidgets());
		}
		_handleAllSettingsChange(setting) {
			if (this.locked) return;
			if (!setting.id.startsWith("widget_")) return;
			const widgetId = settingIdToWidgetId(setting.id);
			if (!this.setting.get().includes(widgetId)) return;
			const prevWidgets = this.getWidgets();
			this._pushHistory();
			this._emit(prevWidgets, this.getWidgets());
		}
		_createWidget(widget) {
			const widgetModel = wp$2.customize.Widgets.availableWidgets.findWhere({ id_base: widget.idBase });
			let number = widget.number;
			if (widgetModel.get("is_multi") && !number) {
				widgetModel.set("multi_number", widgetModel.get("multi_number") + 1);
				number = widgetModel.get("multi_number");
			}
			const settingId = number ? `widget_${widget.idBase}[${number}]` : `widget_${widget.idBase}`;
			const settingArgs = {
				transport: wp$2.customize.Widgets.data.selectiveRefreshableWidgets[widgetModel.get("id_base")] ? "postMessage" : "refresh",
				previewer: this.setting.previewer
			};
			this.api.create(settingId, settingId, "", settingArgs).set(widget.instance);
			return settingIdToWidgetId(settingId);
		}
		_removeWidget(widget) {
			const settingId = widgetIdToSettingId(widget.id);
			const setting = this.api(settingId);
			if (setting) {
				const instance = setting.get();
				this.widgetsCache.delete(instance);
			}
			this.api.remove(settingId);
		}
		_updateWidget(widget) {
			const prevWidget = this.getWidget(widget.id);
			if (prevWidget === widget) return widget.id;
			if (prevWidget.idBase && widget.idBase && prevWidget.idBase === widget.idBase) {
				const settingId = widgetIdToSettingId(widget.id);
				this.api(settingId).set(widget.instance);
				return widget.id;
			}
			this._removeWidget(widget);
			return this._createWidget(widget);
		}
		getWidget(widgetId) {
			if (!widgetId) return null;
			const { idBase, number } = parseWidgetId(widgetId);
			const settingId = widgetIdToSettingId(widgetId);
			const setting = this.api(settingId);
			if (!setting) return null;
			const instance = setting.get();
			if (this.widgetsCache.has(instance)) return this.widgetsCache.get(instance);
			const widget = {
				id: widgetId,
				idBase,
				number,
				instance
			};
			this.widgetsCache.set(instance, widget);
			return widget;
		}
		_updateWidgets(nextWidgets) {
			this.locked = true;
			const addedWidgetIds = [];
			const nextWidgetIds = nextWidgets.map((nextWidget) => {
				if (nextWidget.id && this.getWidget(nextWidget.id)) {
					addedWidgetIds.push(null);
					return this._updateWidget(nextWidget);
				}
				const widgetId = this._createWidget(nextWidget);
				addedWidgetIds.push(widgetId);
				return widgetId;
			});
			this.getWidgets().filter((widget) => !nextWidgetIds.includes(widget.id)).forEach((widget) => this._removeWidget(widget));
			this.setting.set(nextWidgetIds);
			this.locked = false;
			return addedWidgetIds;
		}
		setWidgets(nextWidgets) {
			const addedWidgetIds = this._updateWidgets(nextWidgets);
			this._debounceSetHistory();
			return addedWidgetIds;
		}
		/**
		* Undo/Redo related features
		*/
		hasUndo() {
			return this.historyIndex > 0;
		}
		hasRedo() {
			return this.historyIndex < this.history.length - 1;
		}
		_seek(historyIndex) {
			const currentWidgets = this.getWidgets();
			this.historyIndex = historyIndex;
			const widgets = this.history[this.historyIndex];
			this._updateWidgets(widgets);
			this._emit(currentWidgets, this.getWidgets());
			this.historySubscribers.forEach((listener) => listener());
			this._debounceSetHistory.cancel();
		}
		undo() {
			if (!this.hasUndo()) return;
			this._seek(this.historyIndex - 1);
		}
		redo() {
			if (!this.hasRedo()) return;
			this._seek(this.historyIndex + 1);
		}
		subscribeHistory(listener) {
			this.historySubscribers.add(listener);
			return () => {
				this.historySubscribers.delete(listener);
			};
		}
		save() {
			this.api.previewer.save();
		}
	};

// packages/customize-widgets/build-module/controls/inserter-outer-section.mjs
	function getInserterOuterSection() {
		const { wp: { customize } } = window;
		const OuterSection = customize.OuterSection;
		customize.OuterSection = class extends OuterSection {
			onChangeExpanded(expanded, args) {
				if (expanded) customize.section.each((section) => {
					if (section.params.type === "outer" && section.id !== this.id) {
						if (section.expanded()) section.collapse();
					}
				});
				return super.onChangeExpanded(expanded, args);
			}
		};
		customize.sectionConstructor.outer = customize.OuterSection;
		return class InserterOuterSection extends customize.OuterSection {
			constructor(...args) {
				super(...args);
				this.params.type = "outer";
				this.activeElementBeforeExpanded = null;
				this.contentContainer[0].ownerDocument.defaultView.addEventListener("keydown", (event) => {
					if (this.expanded() && (event.keyCode === _wordpress_keycodes.ESCAPE || event.code === "Escape") && !event.defaultPrevented) {
						event.preventDefault();
						event.stopPropagation();
						(0, _wordpress_data.dispatch)(store).setIsInserterOpened(false);
					}
				}, true);
				this.contentContainer.addClass("widgets-inserter");
				this.isFromInternalAction = false;
				this.expanded.bind(() => {
					if (!this.isFromInternalAction) (0, _wordpress_data.dispatch)(store).setIsInserterOpened(this.expanded());
					this.isFromInternalAction = false;
				});
			}
			open() {
				if (!this.expanded()) {
					const contentContainer = this.contentContainer[0];
					this.activeElementBeforeExpanded = contentContainer.ownerDocument.activeElement;
					this.isFromInternalAction = true;
					this.expand({ completeCallback() {
						const searchBox = _wordpress_dom.focus.tabbable.find(contentContainer)[1];
						if (searchBox) searchBox.focus();
					} });
				}
			}
			close() {
				if (this.expanded()) {
					const contentContainer = this.contentContainer[0];
					const activeElement = contentContainer.ownerDocument.activeElement;
					this.isFromInternalAction = true;
					this.collapse({ completeCallback() {
						if (contentContainer.contains(activeElement)) {
							if (this.activeElementBeforeExpanded) this.activeElementBeforeExpanded.focus();
						}
					} });
				}
			}
		};
	}

// packages/customize-widgets/build-module/controls/sidebar-control.mjs
	const getInserterId = (controlId) => `widgets-inserter-${controlId}`;
	function getSidebarControl() {
		const { wp: { customize } } = window;
		return class SidebarControl extends customize.Control {
			constructor(...args) {
				super(...args);
				this.subscribers = /* @__PURE__ */ new Set();
			}
			ready() {
				const InserterOuterSection = getInserterOuterSection();
				this.inserter = new InserterOuterSection(getInserterId(this.id), {});
				customize.section.add(this.inserter);
				this.sectionInstance = customize.section(this.section());
				this.inspector = this.sectionInstance.inspector;
				this.sidebarAdapter = new SidebarAdapter(this.setting, customize);
			}
			subscribe(callback) {
				this.subscribers.add(callback);
				return () => {
					this.subscribers.delete(callback);
				};
			}
			onChangeSectionExpanded(expanded, args) {
				if (!args.unchanged) {
					if (!expanded) (0, _wordpress_data.dispatch)(store).setIsInserterOpened(false);
					this.subscribers.forEach((subscriber) => subscriber(expanded, args));
				}
			}
		};
	}

// packages/customize-widgets/build-module/filters/move-to-sidebar.mjs
	const withMoveToSidebarToolbarItem = (0, _wordpress_compose.createHigherOrderComponent)((BlockEdit) => (props) => {
		let widgetId = (0, _wordpress_widgets.getWidgetIdFromBlock)(props);
		const sidebarControls = useSidebarControls();
		const activeSidebarControl = useActiveSidebarControl();
		const hasMultipleSidebars = sidebarControls?.length > 1;
		const blockName = props.name;
		const clientId = props.clientId;
		const canInsertBlockInSidebar = (0, _wordpress_data.useSelect)((select) => {
			return select(_wordpress_block_editor.store).canInsertBlockType(blockName, "");
		}, [blockName]);
		const block = (0, _wordpress_data.useSelect)((select) => select(_wordpress_block_editor.store).getBlock(clientId), [clientId]);
		const { removeBlock } = (0, _wordpress_data.useDispatch)(_wordpress_block_editor.store);
		const [, focusWidget] = useFocusControl();
		function moveToSidebar(sidebarControlId) {
			const newSidebarControl = sidebarControls.find((sidebarControl) => sidebarControl.id === sidebarControlId);
			if (widgetId) {
				/**
				* If there's a widgetId, move it to the other sidebar.
				*/
				const oldSetting = activeSidebarControl.setting;
				const newSetting = newSidebarControl.setting;
				oldSetting(oldSetting().filter((id) => id !== widgetId));
				newSetting([...newSetting(), widgetId]);
			} else {
				/**
				* If there isn't a widgetId, it's most likely a inner block.
				* First, remove the block in the original sidebar,
				* then, create a new widget in the new sidebar and get back its widgetId.
				*/
				const sidebarAdapter = newSidebarControl.sidebarAdapter;
				removeBlock(clientId);
				widgetId = sidebarAdapter.setWidgets([...sidebarAdapter.getWidgets(), blockToWidget(block)]).reverse().find((id) => !!id);
			}
			focusWidget(widgetId);
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BlockEdit, { ...props }, "edit"), hasMultipleSidebars && canInsertBlockInSidebar && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.BlockControls, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_widgets.MoveToWidgetArea, {
			widgetAreas: sidebarControls.map((sidebarControl) => ({
				id: sidebarControl.id,
				name: sidebarControl.params.label,
				description: sidebarControl.params.description
			})),
			currentWidgetAreaId: activeSidebarControl?.id,
			onSelect: moveToSidebar
		}) })] });
	}, "withMoveToSidebarToolbarItem");
	(0, _wordpress_hooks.addFilter)("editor.BlockEdit", "core/customize-widgets/block-edit", withMoveToSidebarToolbarItem);

// packages/customize-widgets/build-module/filters/replace-media-upload.mjs
	const replaceMediaUpload = () => _wordpress_media_utils.MediaUpload;
	(0, _wordpress_hooks.addFilter)("editor.MediaUpload", "core/edit-widgets/replace-media-upload", replaceMediaUpload);

// packages/customize-widgets/build-module/filters/wide-widget-display.mjs
	const { wp: wp$1 } = window;
	const withWideWidgetDisplay = (0, _wordpress_compose.createHigherOrderComponent)((BlockEdit) => (props) => {
		const { idBase } = props.attributes;
		const isWide = wp$1.customize.Widgets.data.availableWidgets.find((widget) => widget.id_base === idBase)?.is_wide ?? false;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BlockEdit, {
			...props,
			isWide
		}, "edit");
	}, "withWideWidgetDisplay");
	(0, _wordpress_hooks.addFilter)("editor.BlockEdit", "core/customize-widgets/wide-widget-display", withWideWidgetDisplay);

// packages/customize-widgets/build-module/index.mjs
	const { wp } = window;
	const DISABLED_BLOCKS = [
		"core/more",
		"core/block",
		"core/freeform",
		"core/template-part"
	];
	const ENABLE_EXPERIMENTAL_FSE_BLOCKS = false;
	/**
	* Initializes the widgets block editor in the customizer.
	*
	* @param {string} editorName          The editor name.
	* @param {Object} blockEditorSettings Block editor settings.
	*/
	function initialize(editorName, blockEditorSettings) {
		(0, _wordpress_data.dispatch)(_wordpress_preferences.store).setDefaults("core/customize-widgets", {
			fixedToolbar: false,
			welcomeGuide: true
		});
		(0, _wordpress_data.dispatch)(_wordpress_blocks.store).reapplyBlockTypeFilters();
		const coreBlocks = (0, _wordpress_block_library.__experimentalGetCoreBlocks)().filter((block) => {
			return !(DISABLED_BLOCKS.includes(block.name) || block.name.startsWith("core/post") || block.name.startsWith("core/query") || block.name.startsWith("core/site") || block.name.startsWith("core/navigation") || block.name.startsWith("core/term"));
		});
		(0, _wordpress_block_library.registerCoreBlocks)(coreBlocks);
		(0, _wordpress_widgets.registerLegacyWidgetBlock)();
		(0, _wordpress_block_library.__experimentalRegisterExperimentalCoreBlocks)({ enableFSEBlocks: ENABLE_EXPERIMENTAL_FSE_BLOCKS });
		(0, _wordpress_widgets.registerLegacyWidgetVariations)(blockEditorSettings);
		(0, _wordpress_widgets.registerWidgetGroupBlock)();
		(0, _wordpress_blocks.setFreeformContentHandlerName)("core/html");
		const SidebarControl = getSidebarControl(blockEditorSettings);
		wp.customize.sectionConstructor.sidebar = getSidebarSection();
		wp.customize.controlConstructor.sidebar_block_editor = SidebarControl;
		const container = document.createElement("div");
		document.body.appendChild(container);
		wp.customize.bind("ready", () => {
			const sidebarControls = [];
			wp.customize.control.each((control) => {
				if (control instanceof SidebarControl) sidebarControls.push(control);
			});
			(0, _wordpress_element.createRoot)(container).render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_element.StrictMode, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomizeWidgets, {
				api: wp.customize,
				sidebarControls,
				blockEditorSettings
			}) }));
		});
	}

exports.initialize = initialize;
exports.store = store;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).customizeWidgets = exports;
return exports;
})({}, window.wp.element, window.wp.blockLibrary, window.wp.widgets, window.wp.blocks, window.wp.data, window.wp.preferences, window.wp.i18n, window.React, window.ReactJSXRuntime, window.ReactDOM, window.wp.primitives, window.wp.compose, window.wp.a11y, window.wp.theme, window.wp.privateApis, window.wp.components, window.wp.hooks, window.wp.coreData, window.wp.blockEditor, window.wp.mediaUtils, window.wp.keycodes, window.wp.keyboardShortcuts, window.wp.isShallowEqual, window.wp.dom);
//# sourceMappingURL=index.js.map