(function(exports, react, react_jsx_runtime, react_dom, _wordpress_data, _wordpress_element, _wordpress_i18n, _wordpress_components, _wordpress_keyboard_shortcuts, _wordpress_keycodes, _wordpress_primitives, _wordpress_private_apis, _wordpress_preferences) {

"use strict";
// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp$15 = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) {
			__defProp$15(target, name, {
				get: all[name],
				enumerable: true
			});
		}
		if (!no_symbols) {
			__defProp$15(target, Symbol.toStringTag, { value: "Module" });
		}
		return target;
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) {
					__defProp$15(to, key, {
						get: ((k) => from[k]).bind(null, key),
						enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
					});
				}
			}
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp$15(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

let react$1 = __toESM(react, 1);
react = __toESM(react);
react_dom = __toESM(react_dom, 1);

// node_modules/.store/cmdk@1.1.1-2SvSjHrFhiqsPDore7Lelw/node_modules/cmdk/dist/chunk-NZJY6EH4.mjs
	var U = 1;
	var Y$1 = .9;
	var H = .8;
	var J = .17;
	var p = .1;
	var u = .999;
	var $ = .9999;
	var k$1 = .99;
	var m = /[\\\/_+.#"@\[\(\{&]/;
	var B$1 = /[\\\/_+.#"@\[\(\{&]/g;
	var K$1 = /[\s-]/;
	var X = /[\s-]/g;
	function G(_, C, h, P, A, f, O) {
		if (f === C.length) return A === _.length ? U : k$1;
		var T = `${A},${f}`;
		if (O[T] !== void 0) return O[T];
		for (var L = P.charAt(f), c = h.indexOf(L, A), S = 0, E, N, R, M; c >= 0;) E = G(_, C, h, P, c + 1, f + 1, O), E > S && (c === A ? E *= U : m.test(_.charAt(c - 1)) ? (E *= H, R = _.slice(A, c - 1).match(B$1), R && A > 0 && (E *= Math.pow(u, R.length))) : K$1.test(_.charAt(c - 1)) ? (E *= Y$1, M = _.slice(A, c - 1).match(X), M && A > 0 && (E *= Math.pow(u, M.length))) : (E *= J, A > 0 && (E *= Math.pow(u, c - A))), _.charAt(c) !== C.charAt(f) && (E *= $)), (E < p && h.charAt(c - 1) === P.charAt(f + 1) || P.charAt(f + 1) === P.charAt(f) && h.charAt(c - 1) !== P.charAt(f)) && (N = G(_, C, h, P, c + 1, f + 2, O), N * p > E && (E = N * p)), E > S && (S = E), c = h.indexOf(L, c + 1);
		return O[T] = S, S;
	}
	function D(_) {
		return _.toLowerCase().replace(X, " ");
	}
	function W(_, C, h) {
		return _ = h && h.length > 0 ? `${_ + " " + h.join(" ")}` : _, G(_, C, D(_), D(C), 0, 0, {});
	}

// node_modules/.store/@radix-ui/primitive@1.1.7-U6Tg5_5zgTQvcXJNNg7HcQ/node_modules/@radix-ui/primitive/dist/index.mjs
	var __defProp$14 = Object.defineProperty;
	var __name$14 = (target, value) => __defProp$14(target, "name", {
		value,
		configurable: true
	});
	var canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
	function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
		return /* @__PURE__ */ __name$14(function handleEvent(event) {
			originalEventHandler?.(event);
			if (checkForDefaultPrevented === false || !event || !event.defaultPrevented) return ourEventHandler?.(event);
		}, "handleEvent");
	}
	__name$14(composeEventHandlers, "composeEventHandlers");
	function getOwnerWindow(element) {
		if (!canUseDOM) throw new Error("Cannot access window outside of the DOM");
		return element?.ownerDocument?.defaultView ?? window;
	}
	__name$14(getOwnerWindow, "getOwnerWindow");
	function getOwnerDocument(element) {
		if (!canUseDOM) throw new Error("Cannot access document outside of the DOM");
		return element?.ownerDocument ?? document;
	}
	__name$14(getOwnerDocument, "getOwnerDocument");
	function getActiveElement(node, activeDescendant = false) {
		const { activeElement } = getOwnerDocument(node);
		if (!activeElement?.nodeName) return null;
		if (isFrame(activeElement) && activeElement.contentDocument) return getActiveElement(activeElement.contentDocument.body, activeDescendant);
		if (activeDescendant) {
			const id = activeElement.getAttribute("aria-activedescendant");
			if (id) {
				const element = getOwnerDocument(activeElement).getElementById(id);
				if (element) return element;
			}
		}
		return activeElement;
	}
	__name$14(getActiveElement, "getActiveElement");
	function isFrame(element) {
		return element.tagName === "IFRAME";
	}
	__name$14(isFrame, "isFrame");

// node_modules/.store/@radix-ui/react-compose-refs@1.1.5-Yxi_9Vcwu9BZ5W9uATcsBQ/node_modules/@radix-ui/react-compose-refs/dist/index.mjs
	var __defProp$13 = Object.defineProperty;
	var __name$13 = (target, value) => __defProp$13(target, "name", {
		value,
		configurable: true
	});
	function setRef$1(ref, value) {
		if (typeof ref === "function") return ref(value);
		else if (ref !== null && ref !== void 0) ref.current = value;
	}
	__name$13(setRef$1, "setRef");
	function composeRefs(...refs) {
		return (node) => {
			let hasCleanup = false;
			const cleanups = refs.map((ref) => {
				const cleanup = setRef$1(ref, node);
				if (!hasCleanup && typeof cleanup == "function") hasCleanup = true;
				return cleanup;
			});
			if (hasCleanup) return () => {
				for (let i = 0; i < cleanups.length; i++) {
					const cleanup = cleanups[i];
					if (typeof cleanup == "function") cleanup();
					else setRef$1(refs[i], null);
				}
			};
		};
	}
	__name$13(composeRefs, "composeRefs");
	function useComposedRefs(...refs) {
		return react$1.useCallback(composeRefs(...refs), refs);
	}
	__name$13(useComposedRefs, "useComposedRefs");

// node_modules/.store/@radix-ui/react-context@1.2.2-j7-25QEapK1ImCGTa8GJpg/node_modules/@radix-ui/react-context/dist/index.mjs
	var __defProp$12 = Object.defineProperty;
	var __name$12 = (target, value) => __defProp$12(target, "name", {
		value,
		configurable: true
	});
	// @__NO_SIDE_EFFECTS__
	function createContext2(rootComponentName, defaultContext) {
		const Context = react$1.createContext(defaultContext);
		Context.displayName = rootComponentName + "Context";
		const Provider = /* @__PURE__ */ __name$12((props) => {
			const { children, ...context } = props;
			const value = react$1.useMemo(() => context, Object.values(context));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Context.Provider, {
				value,
				children
			});
		}, "Provider");
		Provider.displayName = rootComponentName + "Provider";
		function useContext2(consumerName, options = {}) {
			const { optional = false } = options;
			const context = react$1.useContext(Context);
			if (context) return context;
			if (defaultContext !== void 0) return defaultContext;
			if (optional) return void 0;
			throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
		}
		__name$12(useContext2, "useContext");
		return [Provider, useContext2];
	}
	__name$12(createContext2, "createContext");
	// @__NO_SIDE_EFFECTS__
	function createContextScope(scopeName, createContextScopeDeps = []) {
		let defaultContexts = [];
		function createContext3(rootComponentName, defaultContext) {
			const BaseContext = react$1.createContext(defaultContext);
			BaseContext.displayName = rootComponentName + "Context";
			const index = defaultContexts.length;
			defaultContexts = [...defaultContexts, defaultContext];
			const Provider = /* @__PURE__ */ __name$12((props) => {
				const { scope, children, ...context } = props;
				const Context = scope?.[scopeName]?.[index] || BaseContext;
				const value = react$1.useMemo(() => context, Object.values(context));
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Context.Provider, {
					value,
					children
				});
			}, "Provider");
			Provider.displayName = rootComponentName + "Provider";
			function useContext2(consumerName, scope, options = {}) {
				const { optional = false } = options;
				const Context = scope?.[scopeName]?.[index] || BaseContext;
				const context = react$1.useContext(Context);
				if (context) return context;
				if (defaultContext !== void 0) return defaultContext;
				if (optional) return void 0;
				throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
			}
			__name$12(useContext2, "useContext");
			return [Provider, useContext2];
		}
		__name$12(createContext3, "createContext");
		const createScope = /* @__PURE__ */ __name$12(() => {
			const scopeContexts = defaultContexts.map((defaultContext) => {
				return react$1.createContext(defaultContext);
			});
			return /* @__PURE__ */ __name$12(function useScope(scope) {
				const contexts = scope?.[scopeName] || scopeContexts;
				return react$1.useMemo(() => ({ [`__scope${scopeName}`]: {
					...scope,
					[scopeName]: contexts
				} }), [scope, contexts]);
			}, "useScope");
		}, "createScope");
		createScope.scopeName = scopeName;
		return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
	}
	__name$12(createContextScope, "createContextScope");
	function composeContextScopes(...scopes) {
		const baseScope = scopes[0];
		if (scopes.length === 1) return baseScope;
		const createScope = /* @__PURE__ */ __name$12(() => {
			const scopeHooks = scopes.map((createScope2) => ({
				useScope: createScope2(),
				scopeName: createScope2.scopeName
			}));
			return /* @__PURE__ */ __name$12(function useComposedScopes(overrideScopes) {
				const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
					const currentScope = useScope(overrideScopes)[`__scope${scopeName}`];
					return {
						...nextScopes2,
						...currentScope
					};
				}, {});
				return react$1.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
			}, "useComposedScopes");
		}, "createScope");
		createScope.scopeName = baseScope.scopeName;
		return createScope;
	}
	__name$12(composeContextScopes, "composeContextScopes");

// node_modules/.store/@radix-ui/react-use-layout-effect@1.1.4-xgr8ZdGzRbbpiAVfalj0KQ/node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
	var useLayoutEffect2 = globalThis?.document ? react$1.useLayoutEffect : () => {};

// node_modules/.store/@radix-ui/react-id@1.1.4-lJYQ8uCc9ZjR3dGsRybCAQ/node_modules/@radix-ui/react-id/dist/index.mjs
	var __defProp$11 = Object.defineProperty;
	var __name$11 = (target, value) => __defProp$11(target, "name", {
		value,
		configurable: true
	});
	var useReactId = react$1[" useId ".trim().toString()] || (() => void 0);
	var count$1 = 0;
	function useId(deterministicId) {
		const [id, setId] = react$1.useState(useReactId());
		useLayoutEffect2(() => {
			if (!deterministicId) setId((reactId) => reactId ?? String(count$1++));
		}, [deterministicId]);
		return deterministicId || (id ? `radix-${id}` : "");
	}
	__name$11(useId, "useId");

// node_modules/.store/@radix-ui/react-use-effect-event@0.0.5-Yi5oSZAZmYwW6OVrdtieoA/node_modules/@radix-ui/react-use-effect-event/dist/index.mjs
	var __defProp$10 = Object.defineProperty;
	var __name$10 = (target, value) => __defProp$10(target, "name", {
		value,
		configurable: true
	});
	var useReactEffectEvent = react$1[" useEffectEvent ".trim().toString()];
	var useReactInsertionEffect = react$1[" useInsertionEffect ".trim().toString()];
	function useEffectEvent(callback) {
		if (typeof useReactEffectEvent === "function") return useReactEffectEvent(callback);
		const ref = react$1.useRef(() => {
			throw new Error("Cannot call an event handler while rendering.");
		});
		if (typeof useReactInsertionEffect === "function") useReactInsertionEffect(() => {
			ref.current = callback;
		});
		else useLayoutEffect2(() => {
			ref.current = callback;
		});
		return react$1.useMemo(() => ((...args) => ref.current?.(...args)), []);
	}
	__name$10(useEffectEvent, "useEffectEvent");

// node_modules/.store/@radix-ui/react-use-controllable-state@1.2.6-E1gehUSActoGL_ABO78qWQ/node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
	var __defProp$9 = Object.defineProperty;
	var __name$9 = (target, value) => __defProp$9(target, "name", {
		value,
		configurable: true
	});
	var useInsertionEffect = react$1[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
	function useControllableState({ prop, defaultProp, onChange = /* @__PURE__ */ __name$9(() => {}, "onChange"), caller }) {
		const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
			defaultProp,
			onChange
		});
		const isControlled = prop !== void 0;
		const value = isControlled ? prop : uncontrolledProp;
		if (true) {
			const isControlledRef = react$1.useRef(prop !== void 0);
			react$1.useEffect(() => {
				const wasControlled = isControlledRef.current;
				if (wasControlled !== isControlled) console.warn(`${caller} is changing from ${wasControlled ? "controlled" : "uncontrolled"} to ${isControlled ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`);
				isControlledRef.current = isControlled;
			}, [isControlled, caller]);
		}
		return [value, react$1.useCallback((nextValue) => {
			if (isControlled) {
				const value2 = isFunction(nextValue) ? nextValue(prop) : nextValue;
				if (value2 !== prop) onChangeRef.current?.(value2);
			} else setUncontrolledProp(nextValue);
		}, [
			isControlled,
			prop,
			setUncontrolledProp,
			onChangeRef
		])];
	}
	__name$9(useControllableState, "useControllableState");
	function useUncontrolledState({ defaultProp, onChange }) {
		const [value, setValue] = react$1.useState(defaultProp);
		const prevValueRef = react$1.useRef(value);
		const onChangeRef = react$1.useRef(onChange);
		useInsertionEffect(() => {
			onChangeRef.current = onChange;
		}, [onChange]);
		react$1.useEffect(() => {
			if (prevValueRef.current !== value) {
				onChangeRef.current?.(value);
				prevValueRef.current = value;
			}
		}, [value, prevValueRef]);
		return [
			value,
			setValue,
			onChangeRef
		];
	}
	__name$9(useUncontrolledState, "useUncontrolledState");
	function isFunction(value) {
		return typeof value === "function";
	}
	__name$9(isFunction, "isFunction");
	var SYNC_STATE = Symbol("RADIX:SYNC_STATE");
	function useControllableStateReducer(reducer, userArgs, initialArg, init) {
		const { prop: controlledState, defaultProp, onChange: onChangeProp, caller } = userArgs;
		const isControlled = controlledState !== void 0;
		const onChange = useEffectEvent(onChangeProp);
		if (true) {
			const isControlledRef = react$1.useRef(controlledState !== void 0);
			react$1.useEffect(() => {
				const wasControlled = isControlledRef.current;
				if (wasControlled !== isControlled) console.warn(`${caller} is changing from ${wasControlled ? "controlled" : "uncontrolled"} to ${isControlled ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`);
				isControlledRef.current = isControlled;
			}, [isControlled, caller]);
		}
		const args = [{
			...initialArg,
			state: defaultProp
		}];
		if (init) args.push(init);
		const [internalState, dispatch] = react$1.useReducer((state2, action) => {
			if (action.type === SYNC_STATE) return {
				...state2,
				state: action.state
			};
			const next = reducer(state2, action);
			if (isControlled && !Object.is(next.state, state2.state)) onChange(next.state);
			return next;
		}, ...args);
		const uncontrolledState = internalState.state;
		const prevValueRef = react$1.useRef(uncontrolledState);
		react$1.useEffect(() => {
			if (prevValueRef.current !== uncontrolledState) {
				prevValueRef.current = uncontrolledState;
				if (!isControlled) onChange(uncontrolledState);
			}
		}, [
			uncontrolledState,
			prevValueRef,
			isControlled
		]);
		const state = react$1.useMemo(() => {
			if (controlledState !== void 0) return {
				...internalState,
				state: controlledState
			};
			return internalState;
		}, [internalState, controlledState]);
		react$1.useEffect(() => {
			if (isControlled && !Object.is(controlledState, internalState.state)) dispatch({
				type: SYNC_STATE,
				state: controlledState
			});
		}, [
			controlledState,
			internalState.state,
			isControlled
		]);
		return [state, dispatch];
	}
	__name$9(useControllableStateReducer, "useControllableStateReducer");

// node_modules/.store/@radix-ui/react-slot@1.3.3-gXjH-EJQB-ydh9AEtBi9Xg/node_modules/@radix-ui/react-slot/dist/index.mjs
	var __defProp$8 = Object.defineProperty;
	var __name$8 = (target, value) => __defProp$8(target, "name", {
		value,
		configurable: true
	});
	// @__NO_SIDE_EFFECTS__
	function createSlot(ownerName) {
		const Slot2 = react$1.forwardRef((props, forwardedRef) => {
			let { children, ...slotProps } = props;
			let slottableElement = null;
			let hasSlottable = false;
			const newChildren = [];
			if (isLazyComponent(children) && typeof use === "function") children = use(children._payload);
			react$1.Children.forEach(children, (maybeSlottable) => {
				if (isSlottable(maybeSlottable)) {
					hasSlottable = true;
					const slottable = maybeSlottable;
					let child = "child" in slottable.props ? slottable.props.child : slottable.props.children;
					if (isLazyComponent(child) && typeof use === "function") child = use(child._payload);
					slottableElement = getSlottableElementFromSlottable(slottable, child);
					newChildren.push(slottableElement?.props?.children);
				} else newChildren.push(maybeSlottable);
			});
			if (slottableElement) slottableElement = react$1.cloneElement(slottableElement, void 0, newChildren);
			else if (!hasSlottable && react$1.Children.count(children) === 1 && react$1.isValidElement(children)) slottableElement = children;
			const slottableElementRef = slottableElement ? getElementRef$1(slottableElement) : void 0;
			const composedRef = useComposedRefs(forwardedRef, slottableElementRef);
			if (!slottableElement) {
				if (children || children === 0) throw new Error(hasSlottable ? createSlottableError(ownerName) : createSlotError(ownerName));
				return children;
			}
			const mergedProps = mergeProps(slotProps, slottableElement.props ?? {});
			if (slottableElement.type !== react$1.Fragment) mergedProps.ref = forwardedRef ? composedRef : slottableElementRef;
			return react$1.cloneElement(slottableElement, mergedProps);
		});
		Slot2.displayName = `${ownerName}.Slot`;
		return Slot2;
	}
	__name$8(createSlot, "createSlot");
	var SLOTTABLE_IDENTIFIER = Symbol.for("radix.slottable");
	// @__NO_SIDE_EFFECTS__
	function createSlottable(ownerName) {
		const Slottable2 = /* @__PURE__ */ __name$8((props) => "child" in props ? props.children(props.child) : props.children, "Slottable");
		Slottable2.displayName = `${ownerName}.Slottable`;
		Slottable2.__radixId = SLOTTABLE_IDENTIFIER;
		return Slottable2;
	}
	__name$8(createSlottable, "createSlottable");
	var getSlottableElementFromSlottable = /* @__PURE__ */ __name$8((slottable, child) => {
		if ("child" in slottable.props) {
			const child2 = slottable.props.child;
			if (!react$1.isValidElement(child2)) return null;
			return react$1.cloneElement(child2, void 0, slottable.props.children(child2.props.children));
		}
		return react$1.isValidElement(child) ? child : null;
	}, "getSlottableElementFromSlottable");
	function mergeProps(slotProps, childProps) {
		const overrideProps = { ...childProps };
		for (const propName in childProps) {
			const slotPropValue = slotProps[propName];
			const childPropValue = childProps[propName];
			if (/^on[A-Z]/.test(propName)) {
				if (slotPropValue && childPropValue) overrideProps[propName] = (...args) => {
					const result = childPropValue(...args);
					slotPropValue(...args);
					return result;
				};
				else if (slotPropValue) overrideProps[propName] = slotPropValue;
			} else if (propName === "style") overrideProps[propName] = {
				...slotPropValue,
				...childPropValue
			};
			else if (propName === "className") overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
		}
		return {
			...slotProps,
			...overrideProps
		};
	}
	__name$8(mergeProps, "mergeProps");
	function getElementRef$1(element) {
		let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
		let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
		if (mayWarn) return element.ref;
		getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
		mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
		if (mayWarn) return element.props.ref;
		return element.props.ref || element.ref;
	}
	__name$8(getElementRef$1, "getElementRef");
	function isSlottable(child) {
		return react$1.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
	}
	__name$8(isSlottable, "isSlottable");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	function isLazyComponent(element) {
		return element != null && typeof element === "object" && "$$typeof" in element && element.$$typeof === REACT_LAZY_TYPE && "_payload" in element && isPromiseLike(element._payload);
	}
	__name$8(isLazyComponent, "isLazyComponent");
	function isPromiseLike(value) {
		return typeof value === "object" && value !== null && "then" in value;
	}
	__name$8(isPromiseLike, "isPromiseLike");
	var createSlotError = /* @__PURE__ */ __name$8((ownerName) => {
		return `${ownerName} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`;
	}, "createSlotError");
	var createSlottableError = /* @__PURE__ */ __name$8((ownerName) => {
		return `${ownerName} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`;
	}, "createSlottableError");
	var use = react$1[" use ".trim().toString()];

// node_modules/.store/@radix-ui/react-primitive@2.1.10-zeSsoG72bCPsw9Cm9y8JEw/node_modules/@radix-ui/react-primitive/dist/index.mjs
	var __defProp$7 = Object.defineProperty;
	var __name$7 = (target, value) => __defProp$7(target, "name", {
		value,
		configurable: true
	});
	var Primitive = [
		"a",
		"button",
		"div",
		"form",
		"h2",
		"h3",
		"img",
		"input",
		"label",
		"li",
		"nav",
		"ol",
		"p",
		"select",
		"span",
		"svg",
		"ul"
	].reduce((primitive, node) => {
		const Slot = createSlot(`Primitive.${node}`);
		const Node = react$1.forwardRef((props, forwardedRef) => {
			const { asChild, ...primitiveProps } = props;
			const Comp = asChild ? Slot : node;
			if (typeof window !== "undefined") window[Symbol.for("radix-ui")] = true;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Comp, {
				...primitiveProps,
				ref: forwardedRef
			});
		});
		Node.displayName = `Primitive.${node}`;
		return {
			...primitive,
			[node]: Node
		};
	}, {});
	function dispatchDiscreteCustomEvent(target, event) {
		if (target) react_dom.flushSync(() => target.dispatchEvent(event));
	}
	__name$7(dispatchDiscreteCustomEvent, "dispatchDiscreteCustomEvent");

// node_modules/.store/@radix-ui/react-use-callback-ref@1.1.4-e0xqDXwla-RxBDlP4otgfA/node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
	var __defProp$6 = Object.defineProperty;
	var __name$6 = (target, value) => __defProp$6(target, "name", {
		value,
		configurable: true
	});
	function useCallbackRef$1(callback) {
		const callbackRef = react$1.useRef(callback);
		react$1.useEffect(() => {
			callbackRef.current = callback;
		});
		return react$1.useMemo(() => ((...args) => callbackRef.current?.(...args)), []);
	}
	__name$6(useCallbackRef$1, "useCallbackRef");

// node_modules/.store/@radix-ui/react-dismissable-layer@1.1.19-TH-TBgk6yZ9haPsxC6i4zw/node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
	var __defProp$5 = Object.defineProperty;
	var __name$5 = (target, value) => __defProp$5(target, "name", {
		value,
		configurable: true
	});
	var CONTEXT_UPDATE = "dismissableLayer.update";
	var POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
	var FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
	var originalBodyPointerEvents;
	var DismissableLayerContext = react$1.createContext({
		layers: /* @__PURE__ */ new Set(),
		layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
		branches: /* @__PURE__ */ new Set(),
		dismissableSurfaces: /* @__PURE__ */ new Set()
	});
	var DismissableLayer = /* @__PURE__ */ react$1.forwardRef(/* @__PURE__ */ __name$5(function DismissableLayer2(props, forwardedRef) {
		const { disableOutsidePointerEvents = false, deferPointerDownOutside = false, onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside, onDismiss, ...layerProps } = props;
		const context = react$1.useContext(DismissableLayerContext);
		const [node, setNode] = react$1.useState(null);
		const ownerDocument = node?.ownerDocument ?? globalThis?.document;
		const [, force] = react$1.useState({});
		const composedRefs = useComposedRefs(forwardedRef, setNode);
		const layers = Array.from(context.layers);
		const [highestLayerWithOutsidePointerEventsDisabled] = [...context.layersWithOutsidePointerEventsDisabled].slice(-1);
		const highestLayerWithOutsidePointerEventsDisabledIndex = highestLayerWithOutsidePointerEventsDisabled ? layers.indexOf(highestLayerWithOutsidePointerEventsDisabled) : -1;
		const index = node ? layers.indexOf(node) : -1;
		const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
		const isPointerEventsEnabled = index >= highestLayerWithOutsidePointerEventsDisabledIndex;
		const isDeferredPointerDownOutsideRef = react$1.useRef(false);
		const pointerDownOutside = usePointerDownOutside((event) => {
			onPointerDownOutside?.(event);
			onInteractOutside?.(event);
			if (!event.defaultPrevented) onDismiss?.();
		}, {
			ownerDocument,
			deferPointerDownOutside,
			isDeferredPointerDownOutsideRef,
			dismissableSurfaces: context.dismissableSurfaces,
			shouldHandlePointerDownOutside: react$1.useCallback((target) => {
				if (!(target instanceof Node)) return false;
				const isPointerDownOnBranch = [...context.branches].some((branch) => branch.contains(target));
				return isPointerEventsEnabled && !isPointerDownOnBranch;
			}, [context.branches, isPointerEventsEnabled])
		});
		const focusOutside = useFocusOutside((event) => {
			if (deferPointerDownOutside && isDeferredPointerDownOutsideRef.current) return;
			const target = event.target;
			if ([...context.branches].some((branch) => branch.contains(target))) return;
			onFocusOutside?.(event);
			onInteractOutside?.(event);
			if (!event.defaultPrevented) onDismiss?.();
		}, ownerDocument);
		const isHighestLayer = node ? index === layers.length - 1 : false;
		const handleKeyDown = useCallbackRef$1((event) => {
			if (event.key !== "Escape") return;
			onEscapeKeyDown?.(event);
			if (!event.defaultPrevented && onDismiss) {
				event.preventDefault();
				onDismiss();
			}
		});
		react$1.useEffect(() => {
			if (!isHighestLayer) return;
			ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
			return () => ownerDocument.removeEventListener("keydown", handleKeyDown, { capture: true });
		}, [
			ownerDocument,
			isHighestLayer,
			handleKeyDown
		]);
		react$1.useEffect(() => {
			if (!node) return;
			if (disableOutsidePointerEvents) {
				if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
					originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
					ownerDocument.body.style.pointerEvents = "none";
				}
				context.layersWithOutsidePointerEventsDisabled.add(node);
			}
			context.layers.add(node);
			dispatchUpdate();
			return () => {
				if (disableOutsidePointerEvents) {
					context.layersWithOutsidePointerEventsDisabled.delete(node);
					if (context.layersWithOutsidePointerEventsDisabled.size === 0) ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
				}
			};
		}, [
			node,
			ownerDocument,
			disableOutsidePointerEvents,
			context
		]);
		react$1.useEffect(() => {
			return () => {
				if (!node) return;
				context.layers.delete(node);
				context.layersWithOutsidePointerEventsDisabled.delete(node);
				dispatchUpdate();
			};
		}, [node, context]);
		react$1.useEffect(() => {
			const handleUpdate = /* @__PURE__ */ __name$5(() => force({}), "handleUpdate");
			document.addEventListener(CONTEXT_UPDATE, handleUpdate);
			return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
		}, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Primitive.div, {
			...layerProps,
			ref: composedRefs,
			style: {
				pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : void 0,
				...props.style
			},
			onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture),
			onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture),
			onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, pointerDownOutside.onPointerDownCapture)
		});
	}, "DismissableLayer"));
	function useDismissableLayerSurface() {
		const context = react$1.useContext(DismissableLayerContext);
		const [node, setNode] = react$1.useState(null);
		react$1.useEffect(() => {
			if (!node) return;
			context.dismissableSurfaces.add(node);
			return () => {
				context.dismissableSurfaces.delete(node);
			};
		}, [node, context.dismissableSurfaces]);
		return setNode;
	}
	__name$5(useDismissableLayerSurface, "useDismissableLayerSurface");
	var IS_TRUE = /* @__PURE__ */ __name$5(() => true, "IS_TRUE");
	function usePointerDownOutside(onPointerDownOutside, args) {
		const { ownerDocument = globalThis?.document, deferPointerDownOutside = false, isDeferredPointerDownOutsideRef, dismissableSurfaces, shouldHandlePointerDownOutside = IS_TRUE } = args;
		const handlePointerDownOutside = useCallbackRef$1(onPointerDownOutside);
		const isPointerInsideReactTreeRef = react$1.useRef(false);
		const isPointerDownOutsideRef = react$1.useRef(false);
		const interceptedOutsideInteractionEventsRef = react$1.useRef(/* @__PURE__ */ new Map());
		const handleClickRef = react$1.useRef(() => {});
		react$1.useEffect(() => {
			function resetOutsideInteraction() {
				isPointerDownOutsideRef.current = false;
				isDeferredPointerDownOutsideRef.current = false;
				interceptedOutsideInteractionEventsRef.current.clear();
			}
			__name$5(resetOutsideInteraction, "resetOutsideInteraction");
			function isOutsideInteractionIntercepted() {
				return Array.from(interceptedOutsideInteractionEventsRef.current.values()).some(Boolean);
			}
			__name$5(isOutsideInteractionIntercepted, "isOutsideInteractionIntercepted");
			function handleInteractionCapture(event) {
				if (!isPointerDownOutsideRef.current) return;
				const target = event.target;
				if (!(target instanceof Node && [...dismissableSurfaces].some((surface) => surface.contains(target)))) interceptedOutsideInteractionEventsRef.current.set(event.type, true);
				if (event.type === "click") window.setTimeout(() => {
					if (isPointerDownOutsideRef.current) handleClickRef.current();
				}, 0);
			}
			__name$5(handleInteractionCapture, "handleInteractionCapture");
			function handleInteractionBubble(event) {
				if (isPointerDownOutsideRef.current) interceptedOutsideInteractionEventsRef.current.set(event.type, false);
			}
			__name$5(handleInteractionBubble, "handleInteractionBubble");
			const handlePointerDown = /* @__PURE__ */ __name$5((event) => {
				if (event.target && !isPointerInsideReactTreeRef.current) {
					let handleAndDispatchPointerDownOutsideEvent2 = function() {
						ownerDocument.removeEventListener("click", handleClickRef.current);
						const wasOutsideInteractionIntercepted = isOutsideInteractionIntercepted();
						resetOutsideInteraction();
						if (!wasOutsideInteractionIntercepted) handleAndDispatchCustomEvent(POINTER_DOWN_OUTSIDE, handlePointerDownOutside, eventDetail, { discrete: true });
					};
					__name$5(handleAndDispatchPointerDownOutsideEvent2, "handleAndDispatchPointerDownOutsideEvent");
					if (!shouldHandlePointerDownOutside(event.target)) {
						ownerDocument.removeEventListener("click", handleClickRef.current);
						resetOutsideInteraction();
						isPointerInsideReactTreeRef.current = false;
						return;
					}
					const eventDetail = { originalEvent: event };
					isPointerDownOutsideRef.current = true;
					isDeferredPointerDownOutsideRef.current = deferPointerDownOutside && event.button === 0;
					interceptedOutsideInteractionEventsRef.current.clear();
					if (!deferPointerDownOutside || event.button !== 0) handleAndDispatchPointerDownOutsideEvent2();
					else {
						ownerDocument.removeEventListener("click", handleClickRef.current);
						handleClickRef.current = handleAndDispatchPointerDownOutsideEvent2;
						ownerDocument.addEventListener("click", handleClickRef.current, { once: true });
					}
				} else {
					ownerDocument.removeEventListener("click", handleClickRef.current);
					resetOutsideInteraction();
				}
				isPointerInsideReactTreeRef.current = false;
			}, "handlePointerDown");
			const outsideInteractionEvents = [
				"pointerup",
				"mousedown",
				"mouseup",
				"touchstart",
				"touchend",
				"click"
			];
			for (const eventName of outsideInteractionEvents) {
				ownerDocument.addEventListener(eventName, handleInteractionCapture, true);
				ownerDocument.addEventListener(eventName, handleInteractionBubble);
			}
			const timerId = window.setTimeout(() => {
				ownerDocument.addEventListener("pointerdown", handlePointerDown);
			}, 0);
			return () => {
				window.clearTimeout(timerId);
				ownerDocument.removeEventListener("pointerdown", handlePointerDown);
				ownerDocument.removeEventListener("click", handleClickRef.current);
				for (const eventName of outsideInteractionEvents) {
					ownerDocument.removeEventListener(eventName, handleInteractionCapture, true);
					ownerDocument.removeEventListener(eventName, handleInteractionBubble);
				}
			};
		}, [
			ownerDocument,
			handlePointerDownOutside,
			deferPointerDownOutside,
			isDeferredPointerDownOutsideRef,
			dismissableSurfaces,
			shouldHandlePointerDownOutside
		]);
		return { onPointerDownCapture: /* @__PURE__ */ __name$5(() => isPointerInsideReactTreeRef.current = true, "onPointerDownCapture") };
	}
	__name$5(usePointerDownOutside, "usePointerDownOutside");
	function useFocusOutside(onFocusOutside, ownerDocument = globalThis?.document) {
		const handleFocusOutside = useCallbackRef$1(onFocusOutside);
		const isFocusInsideReactTreeRef = react$1.useRef(false);
		react$1.useEffect(() => {
			const handleFocus = /* @__PURE__ */ __name$5((event) => {
				if (event.target && !isFocusInsideReactTreeRef.current) handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, { originalEvent: event }, { discrete: false });
			}, "handleFocus");
			ownerDocument.addEventListener("focusin", handleFocus);
			return () => ownerDocument.removeEventListener("focusin", handleFocus);
		}, [ownerDocument, handleFocusOutside]);
		return {
			onFocusCapture: /* @__PURE__ */ __name$5(() => isFocusInsideReactTreeRef.current = true, "onFocusCapture"),
			onBlurCapture: /* @__PURE__ */ __name$5(() => isFocusInsideReactTreeRef.current = false, "onBlurCapture")
		};
	}
	__name$5(useFocusOutside, "useFocusOutside");
	function dispatchUpdate() {
		const event = new CustomEvent(CONTEXT_UPDATE);
		document.dispatchEvent(event);
	}
	__name$5(dispatchUpdate, "dispatchUpdate");
	function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
		const target = detail.originalEvent.target;
		const event = new CustomEvent(name, {
			bubbles: false,
			cancelable: true,
			detail
		});
		if (handler) target.addEventListener(name, handler, { once: true });
		if (discrete) dispatchDiscreteCustomEvent(target, event);
		else target.dispatchEvent(event);
	}
	__name$5(handleAndDispatchCustomEvent, "handleAndDispatchCustomEvent");

// node_modules/.store/@radix-ui/react-focus-scope@1.1.16-YPQp7Tv7wxmVoy-hNvj09g/node_modules/@radix-ui/react-focus-scope/dist/index.mjs
	var __defProp$4 = Object.defineProperty;
	var __name$4 = (target, value) => __defProp$4(target, "name", {
		value,
		configurable: true
	});
	var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
	var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
	var EVENT_OPTIONS = {
		bubbles: false,
		cancelable: true
	};
	var FocusScope = /* @__PURE__ */ react$1.forwardRef(/* @__PURE__ */ __name$4(function FocusScope2(props, forwardedRef) {
		const { loop = false, trapped = false, onMountAutoFocus: onMountAutoFocusProp, onUnmountAutoFocus: onUnmountAutoFocusProp, ...scopeProps } = props;
		const [container, setContainer] = react$1.useState(null);
		const onMountAutoFocus = useCallbackRef$1(onMountAutoFocusProp);
		const onUnmountAutoFocus = useCallbackRef$1(onUnmountAutoFocusProp);
		const lastFocusedElementRef = react$1.useRef(null);
		const composedRefs = useComposedRefs(forwardedRef, setContainer);
		const focusScope = react$1.useRef({
			paused: false,
			pause() {
				this.paused = true;
			},
			resume() {
				this.paused = false;
			}
		}).current;
		react$1.useEffect(() => {
			if (trapped) {
				let handleFocusIn2 = function(event) {
					if (focusScope.paused || !container) return;
					const target = event.target;
					if (container.contains(target)) lastFocusedElementRef.current = target;
					else focus(lastFocusedElementRef.current, { select: true });
				}, handleFocusOut2 = function(event) {
					if (focusScope.paused || !container) return;
					const relatedTarget = event.relatedTarget;
					if (relatedTarget === null) return;
					if (!container.contains(relatedTarget)) focus(lastFocusedElementRef.current, { select: true });
				}, handleMutations2 = function(mutations) {
					if (document.activeElement !== document.body) return;
					for (const mutation of mutations) if (mutation.removedNodes.length > 0) focus(container);
				};
				__name$4(handleFocusIn2, "handleFocusIn");
				__name$4(handleFocusOut2, "handleFocusOut");
				__name$4(handleMutations2, "handleMutations");
				document.addEventListener("focusin", handleFocusIn2);
				document.addEventListener("focusout", handleFocusOut2);
				const mutationObserver = new MutationObserver(handleMutations2);
				if (container) mutationObserver.observe(container, {
					childList: true,
					subtree: true
				});
				return () => {
					document.removeEventListener("focusin", handleFocusIn2);
					document.removeEventListener("focusout", handleFocusOut2);
					mutationObserver.disconnect();
				};
			}
		}, [
			trapped,
			container,
			focusScope.paused
		]);
		react$1.useEffect(() => {
			if (container) {
				focusScopesStack.add(focusScope);
				const previouslyFocusedElement = document.activeElement;
				if (!container.contains(previouslyFocusedElement)) {
					const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
					container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
					container.dispatchEvent(mountEvent);
					if (!mountEvent.defaultPrevented) {
						focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
						if (document.activeElement === previouslyFocusedElement) focus(container);
					}
				}
				return () => {
					container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
					setTimeout(() => {
						const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
						container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
						container.dispatchEvent(unmountEvent);
						if (!unmountEvent.defaultPrevented) focus(previouslyFocusedElement ?? document.body, { select: true });
						container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
						focusScopesStack.remove(focusScope);
					}, 0);
				};
			}
		}, [
			container,
			onMountAutoFocus,
			onUnmountAutoFocus,
			focusScope
		]);
		const handleKeyDown = react$1.useCallback((event) => {
			if (!loop && !trapped) return;
			if (focusScope.paused) return;
			const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
			const focusedElement = document.activeElement;
			if (isTabKey && focusedElement) {
				const container2 = event.currentTarget;
				const [first, last] = getTabbableEdges(container2);
				if (!(first && last)) {
					if (focusedElement === container2) event.preventDefault();
				} else if (!event.shiftKey && focusedElement === last) {
					event.preventDefault();
					if (loop) focus(first, { select: true });
				} else if (event.shiftKey && focusedElement === first) {
					event.preventDefault();
					if (loop) focus(last, { select: true });
				}
			}
		}, [
			loop,
			trapped,
			focusScope.paused
		]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Primitive.div, {
			tabIndex: -1,
			...scopeProps,
			ref: composedRefs,
			onKeyDown: handleKeyDown
		});
	}, "FocusScope"));
	function focusFirst(candidates, { select = false } = {}) {
		const previouslyFocusedElement = document.activeElement;
		for (const candidate of candidates) {
			focus(candidate, { select });
			if (document.activeElement !== previouslyFocusedElement) return;
		}
	}
	__name$4(focusFirst, "focusFirst");
	function getTabbableEdges(container) {
		const candidates = getTabbableCandidates(container);
		return [findVisible(candidates, container), findVisible(candidates.reverse(), container)];
	}
	__name$4(getTabbableEdges, "getTabbableEdges");
	function getTabbableCandidates(container) {
		const nodes = [];
		const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, { acceptNode: /* @__PURE__ */ __name$4((node) => {
			const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
			if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
			return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
		}, "acceptNode") });
		while (walker.nextNode()) nodes.push(walker.currentNode);
		return nodes;
	}
	__name$4(getTabbableCandidates, "getTabbableCandidates");
	function findVisible(elements, container) {
		const canUseCheckVisibility = typeof container.checkVisibility === "function" && container.checkVisibility({ checkVisibilityCSS: true });
		for (const element of elements) if (!(canUseCheckVisibility ? !element.checkVisibility({ checkVisibilityCSS: true }) : isHidden(element, { upTo: container }))) return element;
	}
	__name$4(findVisible, "findVisible");
	function isHidden(node, { upTo }) {
		if (getComputedStyle(node).visibility === "hidden") return true;
		while (node) {
			if (upTo !== void 0 && node === upTo) return false;
			if (getComputedStyle(node).display === "none") return true;
			node = node.parentElement;
		}
		return false;
	}
	__name$4(isHidden, "isHidden");
	function isSelectableInput(element) {
		return element instanceof HTMLInputElement && "select" in element;
	}
	__name$4(isSelectableInput, "isSelectableInput");
	function focus(element, { select = false } = {}) {
		if (element && element.focus) {
			const previouslyFocusedElement = document.activeElement;
			element.focus({ preventScroll: true });
			if (element !== previouslyFocusedElement && isSelectableInput(element) && select) element.select();
		}
	}
	__name$4(focus, "focus");
	var focusScopesStack = createFocusScopesStack();
	function createFocusScopesStack() {
		let stack = [];
		return {
			add(focusScope) {
				const activeFocusScope = stack[0];
				if (focusScope !== activeFocusScope) activeFocusScope?.pause();
				stack = arrayRemove(stack, focusScope);
				stack.unshift(focusScope);
			},
			remove(focusScope) {
				stack = arrayRemove(stack, focusScope);
				stack[0]?.resume();
			}
		};
	}
	__name$4(createFocusScopesStack, "createFocusScopesStack");
	function arrayRemove(array, item) {
		const updatedArray = [...array];
		const index = updatedArray.indexOf(item);
		if (index !== -1) updatedArray.splice(index, 1);
		return updatedArray;
	}
	__name$4(arrayRemove, "arrayRemove");
	function removeLinks(items) {
		return items.filter((item) => item.tagName !== "A");
	}
	__name$4(removeLinks, "removeLinks");

// node_modules/.store/@radix-ui/react-portal@1.1.17-c107g9qJPrY_oXR9dwaImg/node_modules/@radix-ui/react-portal/dist/index.mjs
	var __defProp$3 = Object.defineProperty;
	var __name$3 = (target, value) => __defProp$3(target, "name", {
		value,
		configurable: true
	});
	var Portal = /* @__PURE__ */ react$1.forwardRef(/* @__PURE__ */ __name$3(function Portal2(props, forwardedRef) {
		const { container: containerProp, ...portalProps } = props;
		const [mounted, setMounted] = react$1.useState(false);
		useLayoutEffect2(() => setMounted(true), []);
		const container = containerProp || mounted && globalThis?.document?.body;
		return container ? react_dom.createPortal(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Primitive.div, {
			...portalProps,
			ref: forwardedRef
		}), container) : null;
	}, "Portal"));

// node_modules/.store/@radix-ui/react-presence@1.1.10-HIhysypzaG_K5sVxhG5Wig/node_modules/@radix-ui/react-presence/dist/index.mjs
	var __defProp$2 = Object.defineProperty;
	var __name$2 = (target, value) => __defProp$2(target, "name", {
		value,
		configurable: true
	});
	function useStateMachine(initialState, machine) {
		return react$1.useReducer((state, event) => {
			return machine[state][event] ?? state;
		}, initialState);
	}
	__name$2(useStateMachine, "useStateMachine");
	var Presence = /* @__PURE__ */ __name$2((props) => {
		const { present, children } = props;
		const presence = usePresence(present);
		const child = typeof children === "function" ? children({ present: presence.isPresent }) : react$1.Children.only(children);
		const ref = useStableComposedRefs(presence.ref, getElementRef(child));
		return typeof children === "function" || presence.isPresent ? react$1.cloneElement(child, { ref }) : null;
	}, "Presence");
	function usePresence(present) {
		const [node, setNode] = react$1.useState();
		const stylesRef = react$1.useRef(null);
		const prevPresentRef = react$1.useRef(present);
		const prevAnimationNameRef = react$1.useRef("none");
		const mountAnimationNameRef = react$1.useRef(void 0);
		const [state, send] = useStateMachine(present ? "mounted" : "unmounted", {
			mounted: {
				UNMOUNT: "unmounted",
				ANIMATION_OUT: "unmountSuspended"
			},
			unmountSuspended: {
				MOUNT: "mounted",
				ANIMATION_END: "unmounted"
			},
			unmounted: { MOUNT: "mounted" }
		});
		react$1.useEffect(() => {
			if (state === "mounted") {
				prevAnimationNameRef.current = mountAnimationNameRef.current ?? getAnimationName(stylesRef.current);
				mountAnimationNameRef.current = void 0;
			} else prevAnimationNameRef.current = "none";
		}, [state]);
		useLayoutEffect2(() => {
			const styles = stylesRef.current;
			const wasPresent = prevPresentRef.current;
			if (wasPresent !== present) {
				const prevAnimationName = prevAnimationNameRef.current;
				const currentAnimationName = getAnimationName(styles);
				if (present) {
					mountAnimationNameRef.current = currentAnimationName;
					send("MOUNT");
				} else if (currentAnimationName === "none" || styles?.display === "none") send("UNMOUNT");
				else if (wasPresent && prevAnimationName !== currentAnimationName) send("ANIMATION_OUT");
				else send("UNMOUNT");
				prevPresentRef.current = present;
			}
		}, [present, send]);
		useLayoutEffect2(() => {
			if (node) {
				let timeoutId;
				const ownerWindow = node.ownerDocument.defaultView ?? window;
				const handleAnimationEnd = /* @__PURE__ */ __name$2((event) => {
					const isCurrentAnimation = getAnimationName(stylesRef.current).includes(CSS.escape(event.animationName));
					if (event.target === node && isCurrentAnimation) {
						send("ANIMATION_END");
						if (!prevPresentRef.current) {
							const currentFillMode = node.style.animationFillMode;
							node.style.animationFillMode = "forwards";
							timeoutId = ownerWindow.setTimeout(() => {
								if (node.style.animationFillMode === "forwards") node.style.animationFillMode = currentFillMode;
							});
						}
					}
				}, "handleAnimationEnd");
				const handleAnimationStart = /* @__PURE__ */ __name$2((event) => {
					if (event.target === node) prevAnimationNameRef.current = getAnimationName(stylesRef.current);
				}, "handleAnimationStart");
				node.addEventListener("animationstart", handleAnimationStart);
				node.addEventListener("animationcancel", handleAnimationEnd);
				node.addEventListener("animationend", handleAnimationEnd);
				return () => {
					ownerWindow.clearTimeout(timeoutId);
					node.removeEventListener("animationstart", handleAnimationStart);
					node.removeEventListener("animationcancel", handleAnimationEnd);
					node.removeEventListener("animationend", handleAnimationEnd);
				};
			} else send("ANIMATION_END");
		}, [node, send]);
		return {
			isPresent: ["mounted", "unmountSuspended"].includes(state),
			ref: react$1.useCallback((node2) => {
				if (node2) {
					const styles = getComputedStyle(node2);
					stylesRef.current = styles;
					mountAnimationNameRef.current = getAnimationName(styles);
				} else stylesRef.current = null;
				setNode(node2);
			}, [])
		};
	}
	__name$2(usePresence, "usePresence");
	function setRef(ref, value) {
		if (typeof ref === "function") return ref(value);
		else if (ref !== null && ref !== void 0) ref.current = value;
	}
	__name$2(setRef, "setRef");
	function useStableComposedRefs(...refs) {
		const refsRef = react$1.useRef(refs);
		refsRef.current = refs;
		return react$1.useCallback((node) => {
			const currentRefs = refsRef.current;
			let hasCleanup = false;
			const cleanups = currentRefs.map((ref) => {
				const cleanup = setRef(ref, node);
				if (!hasCleanup && typeof cleanup === "function") hasCleanup = true;
				return cleanup;
			});
			if (hasCleanup) return () => {
				for (let i = 0; i < cleanups.length; i++) {
					const cleanup = cleanups[i];
					if (typeof cleanup === "function") cleanup();
					else setRef(currentRefs[i], null);
				}
			};
		}, []);
	}
	__name$2(useStableComposedRefs, "useStableComposedRefs");
	function getAnimationName(styles) {
		return styles?.animationName || "none";
	}
	__name$2(getAnimationName, "getAnimationName");
	function getElementRef(element) {
		let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
		let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
		if (mayWarn) return element.ref;
		getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
		mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
		if (mayWarn) return element.props.ref;
		return element.props.ref || element.ref;
	}
	__name$2(getElementRef, "getElementRef");

// node_modules/.store/@radix-ui/react-focus-guards@1.1.6-J8NRBkK6-zVq-z3xjKlU6Q/node_modules/@radix-ui/react-focus-guards/dist/index.mjs
	var __defProp$1 = Object.defineProperty;
	var __name$1 = (target, value) => __defProp$1(target, "name", {
		value,
		configurable: true
	});
	var count = 0;
	var guards = null;
	function FocusGuards(props) {
		useFocusGuards();
		return props.children;
	}
	__name$1(FocusGuards, "FocusGuards");
	function useFocusGuards() {
		react$1.useEffect(() => {
			if (!guards) guards = {
				start: createFocusGuard(),
				end: createFocusGuard()
			};
			const { start, end } = guards;
			if (document.body.firstElementChild !== start) document.body.insertAdjacentElement("afterbegin", start);
			if (document.body.lastElementChild !== end) document.body.insertAdjacentElement("beforeend", end);
			count++;
			return () => {
				if (count === 1) {
					guards?.start.remove();
					guards?.end.remove();
					guards = null;
				}
				count = Math.max(0, count - 1);
			};
		}, []);
	}
	__name$1(useFocusGuards, "useFocusGuards");
	function createFocusGuard() {
		const element = document.createElement("span");
		element.setAttribute("data-radix-focus-guard", "");
		element.tabIndex = 0;
		element.style.outline = "none";
		element.style.opacity = "0";
		element.style.position = "fixed";
		element.style.pointerEvents = "none";
		return element;
	}
	__name$1(createFocusGuard, "createFocusGuard");

// node_modules/.store/tslib@2.8.1-LT-dxu1EkVy7OUDyVf5glQ/node_modules/tslib/tslib.es6.mjs
	var __assign = function() {
		__assign = Object.assign || function __assign(t) {
			for (var s, i = 1, n = arguments.length; i < n; i++) {
				s = arguments[i];
				for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
			}
			return t;
		};
		return __assign.apply(this, arguments);
	};
	function __rest(s, e) {
		var t = {};
		for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
		if (s != null && typeof Object.getOwnPropertySymbols === "function") {
			for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
		}
		return t;
	}
	function __spreadArray(to, from, pack) {
		if (pack || arguments.length === 2) {
			for (var i = 0, l = from.length, ar; i < l; i++) if (ar || !(i in from)) {
				if (!ar) ar = Array.prototype.slice.call(from, 0, i);
				ar[i] = from[i];
			}
		}
		return to.concat(ar || Array.prototype.slice.call(from));
	}

// node_modules/.store/react-remove-scroll-bar@2.3.8-4TFmpYw1N_ya2Y7i0xBtxQ/node_modules/react-remove-scroll-bar/dist/es2015/constants.js
	var zeroRightClassName = "right-scroll-bar-position";
	var fullWidthClassName = "width-before-scroll-bar";
	var noScrollbarsClassName = "with-scroll-bars-hidden";
	/**
	* Name of a CSS variable containing the amount of "hidden" scrollbar
	* ! might be undefined ! use will fallback!
	*/
	var removedBarSizeVariable = "--removed-body-scroll-bar-size";

// node_modules/.store/use-callback-ref@1.3.3-CY49Gx_8xVP_WAvrqWfBkg/node_modules/use-callback-ref/dist/es2015/assignRef.js
/**
	* Assigns a value for a given ref, no matter of the ref format
	* @param {RefObject} ref - a callback function or ref object
	* @param value - a new value
	*
	* @see https://github.com/theKashey/use-callback-ref#assignref
	* @example
	* const refObject = useRef();
	* const refFn = (ref) => {....}
	*
	* assignRef(refObject, "refValue");
	* assignRef(refFn, "refValue");
	*/
	function assignRef(ref, value) {
		if (typeof ref === "function") ref(value);
		else if (ref) ref.current = value;
		return ref;
	}

// node_modules/.store/use-callback-ref@1.3.3-CY49Gx_8xVP_WAvrqWfBkg/node_modules/use-callback-ref/dist/es2015/useRef.js
/**
	* creates a MutableRef with ref change callback
	* @param initialValue - initial ref value
	* @param {Function} callback - a callback to run when value changes
	*
	* @example
	* const ref = useCallbackRef(0, (newValue, oldValue) => console.log(oldValue, '->', newValue);
	* ref.current = 1;
	* // prints 0 -> 1
	*
	* @see https://reactjs.org/docs/hooks-reference.html#useref
	* @see https://github.com/theKashey/use-callback-ref#usecallbackref---to-replace-reactuseref
	* @returns {MutableRefObject}
	*/
	function useCallbackRef(initialValue, callback) {
		var ref = (0, react.useState)(function() {
			return {
				value: initialValue,
				callback,
				facade: {
					get current() {
						return ref.value;
					},
					set current(value) {
						var last = ref.value;
						if (last !== value) {
							ref.value = value;
							ref.callback(value, last);
						}
					}
				}
			};
		})[0];
		ref.callback = callback;
		return ref.facade;
	}

// node_modules/.store/use-callback-ref@1.3.3-CY49Gx_8xVP_WAvrqWfBkg/node_modules/use-callback-ref/dist/es2015/useMergeRef.js
	var useIsomorphicLayoutEffect = typeof window !== "undefined" ? react.useLayoutEffect : react.useEffect;
	var currentValues = /* @__PURE__ */ new WeakMap();
	/**
	* Merges two or more refs together providing a single interface to set their value
	* @param {RefObject|Ref} refs
	* @returns {MutableRefObject} - a new ref, which translates all changes to {refs}
	*
	* @see {@link mergeRefs} a version without buit-in memoization
	* @see https://github.com/theKashey/use-callback-ref#usemergerefs
	* @example
	* const Component = React.forwardRef((props, ref) => {
	*   const ownRef = useRef();
	*   const domRef = useMergeRefs([ref, ownRef]); // 👈 merge together
	*   return <div ref={domRef}>...</div>
	* }
	*/
	function useMergeRefs(refs, defaultValue) {
		var callbackRef = useCallbackRef(defaultValue || null, function(newValue) {
			return refs.forEach(function(ref) {
				return assignRef(ref, newValue);
			});
		});
		useIsomorphicLayoutEffect(function() {
			var oldValue = currentValues.get(callbackRef);
			if (oldValue) {
				var prevRefs_1 = new Set(oldValue);
				var nextRefs_1 = new Set(refs);
				var current_1 = callbackRef.current;
				prevRefs_1.forEach(function(ref) {
					if (!nextRefs_1.has(ref)) assignRef(ref, null);
				});
				nextRefs_1.forEach(function(ref) {
					if (!prevRefs_1.has(ref)) assignRef(ref, current_1);
				});
			}
			currentValues.set(callbackRef, refs);
		}, [refs]);
		return callbackRef;
	}

// node_modules/.store/use-sidecar@1.1.3-6pQBe5oGIq-z4KtBgLaB5w/node_modules/use-sidecar/dist/es2015/medium.js
	function ItoI(a) {
		return a;
	}
	function innerCreateMedium(defaults, middleware) {
		if (middleware === void 0) middleware = ItoI;
		var buffer = [];
		var assigned = false;
		return {
			read: function() {
				if (assigned) throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
				if (buffer.length) return buffer[buffer.length - 1];
				return defaults;
			},
			useMedium: function(data) {
				var item = middleware(data, assigned);
				buffer.push(item);
				return function() {
					buffer = buffer.filter(function(x) {
						return x !== item;
					});
				};
			},
			assignSyncMedium: function(cb) {
				assigned = true;
				while (buffer.length) {
					var cbs = buffer;
					buffer = [];
					cbs.forEach(cb);
				}
				buffer = {
					push: function(x) {
						return cb(x);
					},
					filter: function() {
						return buffer;
					}
				};
			},
			assignMedium: function(cb) {
				assigned = true;
				var pendingQueue = [];
				if (buffer.length) {
					var cbs = buffer;
					buffer = [];
					cbs.forEach(cb);
					pendingQueue = buffer;
				}
				var executeQueue = function() {
					var cbs = pendingQueue;
					pendingQueue = [];
					cbs.forEach(cb);
				};
				var cycle = function() {
					return Promise.resolve().then(executeQueue);
				};
				cycle();
				buffer = {
					push: function(x) {
						pendingQueue.push(x);
						cycle();
					},
					filter: function(filter) {
						pendingQueue = pendingQueue.filter(filter);
						return buffer;
					}
				};
			}
		};
	}
	function createSidecarMedium(options) {
		if (options === void 0) options = {};
		var medium = innerCreateMedium(null);
		medium.options = __assign({
			async: true,
			ssr: false
		}, options);
		return medium;
	}

// node_modules/.store/use-sidecar@1.1.3-6pQBe5oGIq-z4KtBgLaB5w/node_modules/use-sidecar/dist/es2015/exports.js
	var SideCar = function(_a) {
		var sideCar = _a.sideCar, rest = __rest(_a, ["sideCar"]);
		if (!sideCar) throw new Error("Sidecar: please provide `sideCar` property to import the right car");
		var Target = sideCar.read();
		if (!Target) throw new Error("Sidecar medium not found");
		return react.createElement(Target, __assign({}, rest));
	};
	SideCar.isSideCarExport = true;
	function exportSidecar(medium, exported) {
		medium.useMedium(exported);
		return SideCar;
	}

// node_modules/.store/react-remove-scroll@2.7.2-g5JjNH6M9u1FDMe3NHg_3Q/node_modules/react-remove-scroll/dist/es2015/medium.js
	var effectCar = createSidecarMedium();

// node_modules/.store/react-remove-scroll@2.7.2-g5JjNH6M9u1FDMe3NHg_3Q/node_modules/react-remove-scroll/dist/es2015/UI.js
	var nothing = function() {};
	/**
	* Removes scrollbar from the page and contain the scroll within the Lock
	*/
	var RemoveScroll = react.forwardRef(function(props, parentRef) {
		var ref = react.useRef(null);
		var _a = react.useState({
			onScrollCapture: nothing,
			onWheelCapture: nothing,
			onTouchMoveCapture: nothing
		}), callbacks = _a[0], setCallbacks = _a[1];
		var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noRelative = props.noRelative, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, gapMode = props.gapMode, rest = __rest(props, [
			"forwardProps",
			"children",
			"className",
			"removeScrollBar",
			"enabled",
			"shards",
			"sideCar",
			"noRelative",
			"noIsolation",
			"inert",
			"allowPinchZoom",
			"as",
			"gapMode"
		]);
		var SideCar = sideCar;
		var containerRef = useMergeRefs([ref, parentRef]);
		var containerProps = __assign(__assign({}, rest), callbacks);
		return react.createElement(react.Fragment, null, enabled && react.createElement(SideCar, {
			sideCar: effectCar,
			removeScrollBar,
			shards,
			noRelative,
			noIsolation,
			inert,
			setCallbacks,
			allowPinchZoom: !!allowPinchZoom,
			lockRef: ref,
			gapMode
		}), forwardProps ? react.cloneElement(react.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : react.createElement(Container, __assign({}, containerProps, {
			className,
			ref: containerRef
		}), children));
	});
	RemoveScroll.defaultProps = {
		enabled: true,
		removeScrollBar: true,
		inert: false
	};
	RemoveScroll.classNames = {
		fullWidth: fullWidthClassName,
		zeroRight: zeroRightClassName
	};

// node_modules/.store/get-nonce@1.0.1-T9SDetHAbMT8POt0PFKPhQ/node_modules/get-nonce/dist/es2015/index.js
	var currentNonce;
	var getNonce = function() {
		if (currentNonce) return currentNonce;
		if (typeof __webpack_nonce__ !== "undefined") return __webpack_nonce__;
	};

// node_modules/.store/react-style-singleton@2.2.3-HhrrM8n2z-BDpx6IHTz-qw/node_modules/react-style-singleton/dist/es2015/singleton.js
	function makeStyleTag() {
		if (!document) return null;
		var tag = document.createElement("style");
		tag.type = "text/css";
		var nonce = getNonce();
		if (nonce) tag.setAttribute("nonce", nonce);
		return tag;
	}
	function injectStyles(tag, css) {
		if (tag.styleSheet) tag.styleSheet.cssText = css;
		else tag.appendChild(document.createTextNode(css));
	}
	function insertStyleTag(tag) {
		(document.head || document.getElementsByTagName("head")[0]).appendChild(tag);
	}
	var stylesheetSingleton = function() {
		var counter = 0;
		var stylesheet = null;
		return {
			add: function(style) {
				if (counter == 0) {
					if (stylesheet = makeStyleTag()) {
						injectStyles(stylesheet, style);
						insertStyleTag(stylesheet);
					}
				}
				counter++;
			},
			remove: function() {
				counter--;
				if (!counter && stylesheet) {
					stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);
					stylesheet = null;
				}
			}
		};
	};

// node_modules/.store/react-style-singleton@2.2.3-HhrrM8n2z-BDpx6IHTz-qw/node_modules/react-style-singleton/dist/es2015/hook.js
/**
	* creates a hook to control style singleton
	* @see {@link styleSingleton} for a safer component version
	* @example
	* ```tsx
	* const useStyle = styleHookSingleton();
	* ///
	* useStyle('body { overflow: hidden}');
	*/
	var styleHookSingleton = function() {
		var sheet = stylesheetSingleton();
		return function(styles, isDynamic) {
			react.useEffect(function() {
				sheet.add(styles);
				return function() {
					sheet.remove();
				};
			}, [styles && isDynamic]);
		};
	};

// node_modules/.store/react-style-singleton@2.2.3-HhrrM8n2z-BDpx6IHTz-qw/node_modules/react-style-singleton/dist/es2015/component.js
/**
	* create a Component to add styles on demand
	* - styles are added when first instance is mounted
	* - styles are removed when the last instance is unmounted
	* - changing styles in runtime does nothing unless dynamic is set. But with multiple components that can lead to the undefined behavior
	*/
	var styleSingleton = function() {
		var useStyle = styleHookSingleton();
		var Sheet = function(_a) {
			var styles = _a.styles, dynamic = _a.dynamic;
			useStyle(styles, dynamic);
			return null;
		};
		return Sheet;
	};

// node_modules/.store/react-remove-scroll-bar@2.3.8-4TFmpYw1N_ya2Y7i0xBtxQ/node_modules/react-remove-scroll-bar/dist/es2015/utils.js
	var zeroGap = {
		left: 0,
		top: 0,
		right: 0,
		gap: 0
	};
	var parse = function(x) {
		return parseInt(x || "", 10) || 0;
	};
	var getOffset = function(gapMode) {
		var cs = window.getComputedStyle(document.body);
		var left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
		var top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
		var right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
		return [
			parse(left),
			parse(top),
			parse(right)
		];
	};
	var getGapWidth = function(gapMode) {
		if (gapMode === void 0) gapMode = "margin";
		if (typeof window === "undefined") return zeroGap;
		var offsets = getOffset(gapMode);
		var documentWidth = document.documentElement.clientWidth;
		var windowWidth = window.innerWidth;
		return {
			left: offsets[0],
			top: offsets[1],
			right: offsets[2],
			gap: Math.max(0, windowWidth - documentWidth + offsets[2] - offsets[0])
		};
	};

// node_modules/.store/react-remove-scroll-bar@2.3.8-4TFmpYw1N_ya2Y7i0xBtxQ/node_modules/react-remove-scroll-bar/dist/es2015/component.js
	var Style = styleSingleton();
	var lockAttribute = "data-scroll-locked";
	var getStyles = function(_a, allowRelative, gapMode, important) {
		var left = _a.left, top = _a.top, right = _a.right, gap = _a.gap;
		if (gapMode === void 0) gapMode = "margin";
		return "\n  .".concat(noScrollbarsClassName, " {\n   overflow: hidden ").concat(important, ";\n   padding-right: ").concat(gap, "px ").concat(important, ";\n  }\n  body[").concat(lockAttribute, "] {\n    overflow: hidden ").concat(important, ";\n    overscroll-behavior: contain;\n    ").concat([
			allowRelative && "position: relative ".concat(important, ";"),
			gapMode === "margin" && "\n    padding-left: ".concat(left, "px;\n    padding-top: ").concat(top, "px;\n    padding-right: ").concat(right, "px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(gap, "px ").concat(important, ";\n    "),
			gapMode === "padding" && "padding-right: ".concat(gap, "px ").concat(important, ";")
		].filter(Boolean).join(""), "\n  }\n  \n  .").concat(zeroRightClassName, " {\n    right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " {\n    margin-right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(zeroRightClassName, " .").concat(zeroRightClassName, " {\n    right: 0 ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " .").concat(fullWidthClassName, " {\n    margin-right: 0 ").concat(important, ";\n  }\n  \n  body[").concat(lockAttribute, "] {\n    ").concat(removedBarSizeVariable, ": ").concat(gap, "px;\n  }\n");
	};
	var getCurrentUseCounter = function() {
		var counter = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
		return isFinite(counter) ? counter : 0;
	};
	var useLockAttribute = function() {
		react.useEffect(function() {
			document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString());
			return function() {
				var newCounter = getCurrentUseCounter() - 1;
				if (newCounter <= 0) document.body.removeAttribute(lockAttribute);
				else document.body.setAttribute(lockAttribute, newCounter.toString());
			};
		}, []);
	};
	/**
	* Removes page scrollbar and blocks page scroll when mounted
	*/
	var RemoveScrollBar = function(_a) {
		var noRelative = _a.noRelative, noImportant = _a.noImportant, _b = _a.gapMode, gapMode = _b === void 0 ? "margin" : _b;
		useLockAttribute();
		var gap = react.useMemo(function() {
			return getGapWidth(gapMode);
		}, [gapMode]);
		return react.createElement(Style, { styles: getStyles(gap, !noRelative, gapMode, !noImportant ? "!important" : "") });
	};

// node_modules/.store/react-remove-scroll@2.7.2-g5JjNH6M9u1FDMe3NHg_3Q/node_modules/react-remove-scroll/dist/es2015/aggresiveCapture.js
	var passiveSupported = false;
	if (typeof window !== "undefined") try {
		var options = Object.defineProperty({}, "passive", { get: function() {
			passiveSupported = true;
			return true;
		} });
		window.addEventListener("test", options, options);
		window.removeEventListener("test", options, options);
	} catch (err) {
		passiveSupported = false;
	}
	var nonPassive = passiveSupported ? { passive: false } : false;

// node_modules/.store/react-remove-scroll@2.7.2-g5JjNH6M9u1FDMe3NHg_3Q/node_modules/react-remove-scroll/dist/es2015/handleScroll.js
	var alwaysContainsScroll = function(node) {
		return node.tagName === "TEXTAREA";
	};
	var elementCanBeScrolled = function(node, overflow) {
		if (!(node instanceof Element)) return false;
		var styles = window.getComputedStyle(node);
		return styles[overflow] !== "hidden" && !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible");
	};
	var elementCouldBeVScrolled = function(node) {
		return elementCanBeScrolled(node, "overflowY");
	};
	var elementCouldBeHScrolled = function(node) {
		return elementCanBeScrolled(node, "overflowX");
	};
	var locationCouldBeScrolled = function(axis, node) {
		var ownerDocument = node.ownerDocument;
		var current = node;
		do {
			if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) current = current.host;
			if (elementCouldBeScrolled(axis, current)) {
				var _a = getScrollVariables(axis, current);
				if (_a[1] > _a[2]) return true;
			}
			current = current.parentNode;
		} while (current && current !== ownerDocument.body);
		return false;
	};
	var getVScrollVariables = function(_a) {
		return [
			_a.scrollTop,
			_a.scrollHeight,
			_a.clientHeight
		];
	};
	var getHScrollVariables = function(_a) {
		return [
			_a.scrollLeft,
			_a.scrollWidth,
			_a.clientWidth
		];
	};
	var elementCouldBeScrolled = function(axis, node) {
		return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
	};
	var getScrollVariables = function(axis, node) {
		return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
	};
	var getDirectionFactor = function(axis, direction) {
		/**
		* If the element's direction is rtl (right-to-left), then scrollLeft is 0 when the scrollbar is at its rightmost position,
		* and then increasingly negative as you scroll towards the end of the content.
		* @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
		*/
		return axis === "h" && direction === "rtl" ? -1 : 1;
	};
	var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
		var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
		var delta = directionFactor * sourceDelta;
		var target = event.target;
		var targetInLock = endTarget.contains(target);
		var shouldCancelScroll = false;
		var isDeltaPositive = delta > 0;
		var availableScroll = 0;
		var availableScrollTop = 0;
		do {
			if (!target) break;
			var _a = getScrollVariables(axis, target), position = _a[0];
			var elementScroll = _a[1] - _a[2] - directionFactor * position;
			if (position || elementScroll) {
				if (elementCouldBeScrolled(axis, target)) {
					availableScroll += elementScroll;
					availableScrollTop += position;
				}
			}
			var parent_1 = target.parentNode;
			target = parent_1 && parent_1.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? parent_1.host : parent_1;
		} while (!targetInLock && target !== document.body || targetInLock && (endTarget.contains(target) || endTarget === target));
		if (isDeltaPositive && (noOverscroll && Math.abs(availableScroll) < 1 || !noOverscroll && delta > availableScroll)) shouldCancelScroll = true;
		else if (!isDeltaPositive && (noOverscroll && Math.abs(availableScrollTop) < 1 || !noOverscroll && -delta > availableScrollTop)) shouldCancelScroll = true;
		return shouldCancelScroll;
	};

// node_modules/.store/react-remove-scroll@2.7.2-g5JjNH6M9u1FDMe3NHg_3Q/node_modules/react-remove-scroll/dist/es2015/SideEffect.js
	var getTouchXY = function(event) {
		return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
	};
	var getDeltaXY = function(event) {
		return [event.deltaX, event.deltaY];
	};
	var extractRef = function(ref) {
		return ref && "current" in ref ? ref.current : ref;
	};
	var deltaCompare = function(x, y) {
		return x[0] === y[0] && x[1] === y[1];
	};
	var generateStyle = function(id) {
		return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
	};
	var idCounter = 0;
	var lockStack = [];
	function RemoveScrollSideCar(props) {
		var shouldPreventQueue = react.useRef([]);
		var touchStartRef = react.useRef([0, 0]);
		var activeAxis = react.useRef();
		var id = react.useState(idCounter++)[0];
		var Style = react.useState(styleSingleton)[0];
		var lastProps = react.useRef(props);
		react.useEffect(function() {
			lastProps.current = props;
		}, [props]);
		react.useEffect(function() {
			if (props.inert) {
				document.body.classList.add("block-interactivity-".concat(id));
				var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
				allow_1.forEach(function(el) {
					return el.classList.add("allow-interactivity-".concat(id));
				});
				return function() {
					document.body.classList.remove("block-interactivity-".concat(id));
					allow_1.forEach(function(el) {
						return el.classList.remove("allow-interactivity-".concat(id));
					});
				};
			}
		}, [
			props.inert,
			props.lockRef.current,
			props.shards
		]);
		var shouldCancelEvent = react.useCallback(function(event, parent) {
			if ("touches" in event && event.touches.length === 2 || event.type === "wheel" && event.ctrlKey) return !lastProps.current.allowPinchZoom;
			var touch = getTouchXY(event);
			var touchStart = touchStartRef.current;
			var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
			var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
			var currentAxis;
			var target = event.target;
			var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
			if ("touches" in event && moveDirection === "h" && target.type === "range") return false;
			var selection = window.getSelection();
			var anchorNode = selection && selection.anchorNode;
			if (anchorNode ? anchorNode === target || anchorNode.contains(target) : false) return false;
			var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
			if (!canBeScrolledInMainDirection) return true;
			if (canBeScrolledInMainDirection) currentAxis = moveDirection;
			else {
				currentAxis = moveDirection === "v" ? "h" : "v";
				canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
			}
			if (!canBeScrolledInMainDirection) return false;
			if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) activeAxis.current = currentAxis;
			if (!currentAxis) return true;
			var cancelingAxis = activeAxis.current || currentAxis;
			return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
		}, []);
		var shouldPrevent = react.useCallback(function(_event) {
			var event = _event;
			if (!lockStack.length || lockStack[lockStack.length - 1] !== Style) return;
			var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
			var sourceEvent = shouldPreventQueue.current.filter(function(e) {
				return e.name === event.type && (e.target === event.target || event.target === e.shadowParent) && deltaCompare(e.delta, delta);
			})[0];
			if (sourceEvent && sourceEvent.should) {
				if (event.cancelable) event.preventDefault();
				return;
			}
			if (!sourceEvent) {
				var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
					return node.contains(event.target);
				});
				if (shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation) {
					if (event.cancelable) event.preventDefault();
				}
			}
		}, []);
		var shouldCancel = react.useCallback(function(name, delta, target, should) {
			var event = {
				name,
				delta,
				target,
				should,
				shadowParent: getOutermostShadowParent(target)
			};
			shouldPreventQueue.current.push(event);
			setTimeout(function() {
				shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e) {
					return e !== event;
				});
			}, 1);
		}, []);
		var scrollTouchStart = react.useCallback(function(event) {
			touchStartRef.current = getTouchXY(event);
			activeAxis.current = void 0;
		}, []);
		var scrollWheel = react.useCallback(function(event) {
			shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
		}, []);
		var scrollTouchMove = react.useCallback(function(event) {
			shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
		}, []);
		react.useEffect(function() {
			lockStack.push(Style);
			props.setCallbacks({
				onScrollCapture: scrollWheel,
				onWheelCapture: scrollWheel,
				onTouchMoveCapture: scrollTouchMove
			});
			document.addEventListener("wheel", shouldPrevent, nonPassive);
			document.addEventListener("touchmove", shouldPrevent, nonPassive);
			document.addEventListener("touchstart", scrollTouchStart, nonPassive);
			return function() {
				lockStack = lockStack.filter(function(inst) {
					return inst !== Style;
				});
				document.removeEventListener("wheel", shouldPrevent, nonPassive);
				document.removeEventListener("touchmove", shouldPrevent, nonPassive);
				document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
			};
		}, []);
		var removeScrollBar = props.removeScrollBar, inert = props.inert;
		return react.createElement(react.Fragment, null, inert ? react.createElement(Style, { styles: generateStyle(id) }) : null, removeScrollBar ? react.createElement(RemoveScrollBar, {
			noRelative: props.noRelative,
			gapMode: props.gapMode
		}) : null);
	}
	function getOutermostShadowParent(node) {
		var shadowParent = null;
		while (node !== null) {
			if (node instanceof ShadowRoot) {
				shadowParent = node.host;
				node = node.host;
			}
			node = node.parentNode;
		}
		return shadowParent;
	}

// node_modules/.store/react-remove-scroll@2.7.2-g5JjNH6M9u1FDMe3NHg_3Q/node_modules/react-remove-scroll/dist/es2015/sidecar.js
	var sidecar_default = exportSidecar(effectCar, RemoveScrollSideCar);

// node_modules/.store/react-remove-scroll@2.7.2-g5JjNH6M9u1FDMe3NHg_3Q/node_modules/react-remove-scroll/dist/es2015/Combination.js
	var ReactRemoveScroll = react.forwardRef(function(props, ref) {
		return react.createElement(RemoveScroll, __assign({}, props, {
			ref,
			sideCar: sidecar_default
		}));
	});
	ReactRemoveScroll.classNames = RemoveScroll.classNames;

// node_modules/.store/aria-hidden@1.2.6--GO2Ve_nUkubj48l2T3YZg/node_modules/aria-hidden/dist/es2015/index.js
	var getDefaultParent = function(originalTarget) {
		if (typeof document === "undefined") return null;
		return (Array.isArray(originalTarget) ? originalTarget[0] : originalTarget).ownerDocument.body;
	};
	var counterMap = /* @__PURE__ */ new WeakMap();
	var uncontrolledNodes = /* @__PURE__ */ new WeakMap();
	var markerMap = {};
	var lockCount = 0;
	var unwrapHost = function(node) {
		return node && (node.host || unwrapHost(node.parentNode));
	};
	var correctTargets = function(parent, targets) {
		return targets.map(function(target) {
			if (parent.contains(target)) return target;
			var correctedTarget = unwrapHost(target);
			if (correctedTarget && parent.contains(correctedTarget)) return correctedTarget;
			console.error("aria-hidden", target, "in not contained inside", parent, ". Doing nothing");
			return null;
		}).filter(function(x) {
			return Boolean(x);
		});
	};
	/**
	* Marks everything except given node(or nodes) as aria-hidden
	* @param {Element | Element[]} originalTarget - elements to keep on the page
	* @param [parentNode] - top element, defaults to document.body
	* @param {String} [markerName] - a special attribute to mark every node
	* @param {String} [controlAttribute] - html Attribute to control
	* @return {Undo} undo command
	*/
	var applyAttributeToOthers = function(originalTarget, parentNode, markerName, controlAttribute) {
		var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
		if (!markerMap[markerName]) markerMap[markerName] = /* @__PURE__ */ new WeakMap();
		var markerCounter = markerMap[markerName];
		var hiddenNodes = [];
		var elementsToKeep = /* @__PURE__ */ new Set();
		var elementsToStop = new Set(targets);
		var keep = function(el) {
			if (!el || elementsToKeep.has(el)) return;
			elementsToKeep.add(el);
			keep(el.parentNode);
		};
		targets.forEach(keep);
		var deep = function(parent) {
			if (!parent || elementsToStop.has(parent)) return;
			Array.prototype.forEach.call(parent.children, function(node) {
				if (elementsToKeep.has(node)) deep(node);
				else try {
					var attr = node.getAttribute(controlAttribute);
					var alreadyHidden = attr !== null && attr !== "false";
					var counterValue = (counterMap.get(node) || 0) + 1;
					var markerValue = (markerCounter.get(node) || 0) + 1;
					counterMap.set(node, counterValue);
					markerCounter.set(node, markerValue);
					hiddenNodes.push(node);
					if (counterValue === 1 && alreadyHidden) uncontrolledNodes.set(node, true);
					if (markerValue === 1) node.setAttribute(markerName, "true");
					if (!alreadyHidden) node.setAttribute(controlAttribute, "true");
				} catch (e) {
					console.error("aria-hidden: cannot operate on ", node, e);
				}
			});
		};
		deep(parentNode);
		elementsToKeep.clear();
		lockCount++;
		return function() {
			hiddenNodes.forEach(function(node) {
				var counterValue = counterMap.get(node) - 1;
				var markerValue = markerCounter.get(node) - 1;
				counterMap.set(node, counterValue);
				markerCounter.set(node, markerValue);
				if (!counterValue) {
					if (!uncontrolledNodes.has(node)) node.removeAttribute(controlAttribute);
					uncontrolledNodes.delete(node);
				}
				if (!markerValue) node.removeAttribute(markerName);
			});
			lockCount--;
			if (!lockCount) {
				counterMap = /* @__PURE__ */ new WeakMap();
				counterMap = /* @__PURE__ */ new WeakMap();
				uncontrolledNodes = /* @__PURE__ */ new WeakMap();
				markerMap = {};
			}
		};
	};
	/**
	* Marks everything except given node(or nodes) as aria-hidden
	* @param {Element | Element[]} originalTarget - elements to keep on the page
	* @param [parentNode] - top element, defaults to document.body
	* @param {String} [markerName] - a special attribute to mark every node
	* @return {Undo} undo command
	*/
	var hideOthers = function(originalTarget, parentNode, markerName) {
		if (markerName === void 0) markerName = "data-aria-hidden";
		var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
		var activeParentNode = parentNode || getDefaultParent(originalTarget);
		if (!activeParentNode) return function() {
			return null;
		};
		targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll("[aria-live], script")));
		return applyAttributeToOthers(targets, activeParentNode, markerName, "aria-hidden");
	};

// node_modules/.store/@radix-ui/react-dialog@1.1.23-ytDSaPyJAw3b9aD4KkIiOA/node_modules/@radix-ui/react-dialog/dist/index.mjs
	var __defProp = Object.defineProperty;
	var __name = (target, value) => __defProp(target, "name", {
		value,
		configurable: true
	});
	var DIALOG_NAME = "Dialog";
	var [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME);
	var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
	var Dialog = /* @__PURE__ */ __name((props) => {
		const { __scopeDialog, children, open: openProp, defaultOpen, onOpenChange, modal = true } = props;
		const triggerRef = react$1.useRef(null);
		const contentRef = react$1.useRef(null);
		const [open, setOpen] = useControllableState({
			prop: openProp,
			defaultProp: defaultOpen ?? false,
			onChange: onOpenChange,
			caller: DIALOG_NAME
		});
		const [titleCount, setTitleCount] = react$1.useState(0);
		const [descriptionCount, setDescriptionCount] = react$1.useState(0);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DialogProvider, {
			scope: __scopeDialog,
			triggerRef,
			contentRef,
			contentId: useId(),
			titleId: useId(),
			descriptionId: useId(),
			titlePresent: titleCount > 0,
			descriptionPresent: descriptionCount > 0,
			setTitleCount,
			setDescriptionCount,
			open,
			onOpenChange: setOpen,
			onOpenToggle: react$1.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
			modal,
			children
		});
	}, "Dialog");
	var PORTAL_NAME = "DialogPortal";
	var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME, { forceMount: void 0 });
	var DialogPortal = /* @__PURE__ */ __name((props) => {
		const { __scopeDialog, forceMount, children, container } = props;
		const context = useDialogContext(PORTAL_NAME, __scopeDialog);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PortalProvider, {
			scope: __scopeDialog,
			forceMount,
			children: react$1.Children.map(children, (child) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Presence, {
				present: forceMount || context.open,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Portal, {
					asChild: true,
					container,
					children: child
				})
			}))
		});
	}, "DialogPortal");
	var OVERLAY_NAME = "DialogOverlay";
	var DialogOverlay = /* @__PURE__ */ react$1.forwardRef(/* @__PURE__ */ __name(function DialogOverlay2(props, forwardedRef) {
		const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
		const { forceMount = portalContext.forceMount, ...overlayProps } = props;
		const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
		return context.modal ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Presence, {
			present: forceMount || context.open,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DialogOverlayImpl, {
				...overlayProps,
				ref: forwardedRef
			})
		}) : null;
	}, "DialogOverlay"));
	var Slot = createSlot("DialogOverlay.RemoveScroll");
	var DialogOverlayImpl = /* @__PURE__ */ react$1.forwardRef(/* @__PURE__ */ __name(function DialogOverlayImpl2(props, forwardedRef) {
		const { __scopeDialog, ...overlayProps } = props;
		const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
		const registerDismissableSurface = useDismissableLayerSurface();
		const composedRefs = useComposedRefs(forwardedRef, registerDismissableSurface);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReactRemoveScroll, {
			as: Slot,
			allowPinchZoom: true,
			shards: [context.contentRef],
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Primitive.div, {
				"data-state": getState(context.open),
				...overlayProps,
				ref: composedRefs,
				style: {
					pointerEvents: "auto",
					...overlayProps.style
				}
			})
		});
	}, "DialogOverlayImpl"));
	var CONTENT_NAME = "DialogContent";
	var DialogContent = /* @__PURE__ */ react$1.forwardRef(/* @__PURE__ */ __name(function DialogContent2(props, forwardedRef) {
		const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
		const { forceMount = portalContext.forceMount, ...contentProps } = props;
		const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Presence, {
			present: forceMount || context.open,
			children: context.modal ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DialogContentModal, {
				...contentProps,
				ref: forwardedRef
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DialogContentNonModal, {
				...contentProps,
				ref: forwardedRef
			})
		});
	}, "DialogContent"));
	var DialogContentModal = /* @__PURE__ */ react$1.forwardRef(/* @__PURE__ */ __name(function DialogContentModal2(props, forwardedRef) {
		const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
		const contentRef = react$1.useRef(null);
		const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
		react$1.useEffect(() => {
			const content = contentRef.current;
			if (content) return hideOthers(content);
		}, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DialogContentImpl, {
			...props,
			ref: composedRefs,
			trapFocus: context.open,
			disableOutsidePointerEvents: context.open,
			onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
				event.preventDefault();
				context.triggerRef.current?.focus();
			}),
			onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
				const originalEvent = event.detail.originalEvent;
				const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
				if (originalEvent.button === 2 || ctrlLeftClick) event.preventDefault();
			}),
			onFocusOutside: composeEventHandlers(props.onFocusOutside, (event) => event.preventDefault())
		});
	}, "DialogContentModal"));
	var DialogContentNonModal = /* @__PURE__ */ react$1.forwardRef(/* @__PURE__ */ __name(function DialogContentNonModal2(props, forwardedRef) {
		const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
		const hasInteractedOutsideRef = react$1.useRef(false);
		const hasPointerDownOutsideRef = react$1.useRef(false);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DialogContentImpl, {
			...props,
			ref: forwardedRef,
			trapFocus: false,
			disableOutsidePointerEvents: false,
			onCloseAutoFocus: (event) => {
				props.onCloseAutoFocus?.(event);
				if (!event.defaultPrevented) {
					if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
					event.preventDefault();
				}
				hasInteractedOutsideRef.current = false;
				hasPointerDownOutsideRef.current = false;
			},
			onInteractOutside: (event) => {
				props.onInteractOutside?.(event);
				if (!event.defaultPrevented) {
					hasInteractedOutsideRef.current = true;
					if (event.detail.originalEvent.type === "pointerdown") hasPointerDownOutsideRef.current = true;
				}
				const target = event.target;
				if (context.triggerRef.current?.contains(target)) event.preventDefault();
				if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) event.preventDefault();
			}
		});
	}, "DialogContentNonModal"));
	var DialogContentImpl = /* @__PURE__ */ react$1.forwardRef(/* @__PURE__ */ __name(function DialogContentImpl2(props, forwardedRef) {
		const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
		const context = useDialogContext(CONTENT_NAME, __scopeDialog);
		useFocusGuards();
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FocusScope, {
			asChild: true,
			loop: true,
			trapped: trapFocus,
			onMountAutoFocus: onOpenAutoFocus,
			onUnmountAutoFocus: onCloseAutoFocus,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DismissableLayer, {
				role: "dialog",
				id: context.contentId,
				"aria-describedby": context.descriptionPresent ? context.descriptionId : void 0,
				"aria-labelledby": context.titlePresent ? context.titleId : void 0,
				"data-state": getState(context.open),
				...contentProps,
				ref: forwardedRef,
				deferPointerDownOutside: true,
				onDismiss: () => context.onOpenChange(false)
			})
		}) });
	}, "DialogContentImpl"));
	function getState(open) {
		return open ? "open" : "closed";
	}
	__name(getState, "getState");

// node_modules/.store/cmdk@1.1.1-2SvSjHrFhiqsPDore7Lelw/node_modules/cmdk/dist/index.mjs
	var N = "[cmdk-group=\"\"]";
	var Y = "[cmdk-group-items=\"\"]";
	var be = "[cmdk-group-heading=\"\"]";
	var le = "[cmdk-item=\"\"]";
	var ce = `${le}:not([aria-disabled="true"])`;
	var Z = "cmdk-item-select";
	var T = "data-value";
	var Re = (r, o, n) => W(r, o, n);
	var ue = react$1.createContext(void 0);
	var K = () => react$1.useContext(ue);
	var de = react$1.createContext(void 0);
	var ee = () => react$1.useContext(de);
	var fe = react$1.createContext(void 0);
	var me = react$1.forwardRef((r, o) => {
		let n = L(() => {
			var e, a;
			return {
				search: "",
				value: (a = (e = r.value) != null ? e : r.defaultValue) != null ? a : "",
				selectedItemId: void 0,
				filtered: {
					count: 0,
					items: /* @__PURE__ */ new Map(),
					groups: /* @__PURE__ */ new Set()
				}
			};
		}), u = L(() => /* @__PURE__ */ new Set()), c = L(() => /* @__PURE__ */ new Map()), d = L(() => /* @__PURE__ */ new Map()), f = L(() => /* @__PURE__ */ new Set()), p = pe(r), { label: b, children: m, value: R, onValueChange: x, filter: C, shouldFilter: S, loop: A, disablePointerSelection: ge = !1, vimBindings: j = !0, ...O } = r, $ = useId(), q = useId(), _ = useId(), I = react$1.useRef(null), v = ke();
		k(() => {
			if (R !== void 0) {
				let e = R.trim();
				n.current.value = e, E.emit();
			}
		}, [R]), k(() => {
			v(6, ne);
		}, []);
		let E = react$1.useMemo(() => ({
			subscribe: (e) => (f.current.add(e), () => f.current.delete(e)),
			snapshot: () => n.current,
			setState: (e, a, s) => {
				var i, l, g, y;
				if (!Object.is(n.current[e], a)) {
					if (n.current[e] = a, e === "search") J(), z(), v(1, W);
					else if (e === "value") {
						if (document.activeElement.hasAttribute("cmdk-input") || document.activeElement.hasAttribute("cmdk-root")) {
							let h = document.getElementById(_);
							h ? h.focus() : (i = document.getElementById($)) == null || i.focus();
						}
						if (v(7, () => {
							var h;
							n.current.selectedItemId = (h = M()) == null ? void 0 : h.id, E.emit();
						}), s || v(5, ne), ((l = p.current) == null ? void 0 : l.value) !== void 0) {
							let h = a != null ? a : "";
							(y = (g = p.current).onValueChange) == null || y.call(g, h);
							return;
						}
					}
					E.emit();
				}
			},
			emit: () => {
				f.current.forEach((e) => e());
			}
		}), []), U = react$1.useMemo(() => ({
			value: (e, a, s) => {
				var i;
				a !== ((i = d.current.get(e)) == null ? void 0 : i.value) && (d.current.set(e, {
					value: a,
					keywords: s
				}), n.current.filtered.items.set(e, te(a, s)), v(2, () => {
					z(), E.emit();
				}));
			},
			item: (e, a) => (u.current.add(e), a && (c.current.has(a) ? c.current.get(a).add(e) : c.current.set(a, /* @__PURE__ */ new Set([e]))), v(3, () => {
				J(), z(), n.current.value || W(), E.emit();
			}), () => {
				d.current.delete(e), u.current.delete(e), n.current.filtered.items.delete(e);
				let s = M();
				v(4, () => {
					J(), (s == null ? void 0 : s.getAttribute("id")) === e && W(), E.emit();
				});
			}),
			group: (e) => (c.current.has(e) || c.current.set(e, /* @__PURE__ */ new Set()), () => {
				d.current.delete(e), c.current.delete(e);
			}),
			filter: () => p.current.shouldFilter,
			label: b || r["aria-label"],
			getDisablePointerSelection: () => p.current.disablePointerSelection,
			listId: $,
			inputId: _,
			labelId: q,
			listInnerRef: I
		}), []);
		function te(e, a) {
			var i, l;
			let s = (l = (i = p.current) == null ? void 0 : i.filter) != null ? l : Re;
			return e ? s(e, n.current.search, a) : 0;
		}
		function z() {
			if (!n.current.search || p.current.shouldFilter === !1) return;
			let e = n.current.filtered.items, a = [];
			n.current.filtered.groups.forEach((i) => {
				let l = c.current.get(i), g = 0;
				l.forEach((y) => {
					let h = e.get(y);
					g = Math.max(h, g);
				}), a.push([i, g]);
			});
			let s = I.current;
			V().sort((i, l) => {
				var h, F;
				let g = i.getAttribute("id"), y = l.getAttribute("id");
				return ((h = e.get(y)) != null ? h : 0) - ((F = e.get(g)) != null ? F : 0);
			}).forEach((i) => {
				let l = i.closest(Y);
				l ? l.appendChild(i.parentElement === l ? i : i.closest(`${Y} > *`)) : s.appendChild(i.parentElement === s ? i : i.closest(`${Y} > *`));
			}), a.sort((i, l) => l[1] - i[1]).forEach((i) => {
				var g;
				let l = (g = I.current) == null ? void 0 : g.querySelector(`${N}[${T}="${encodeURIComponent(i[0])}"]`);
				l?.parentElement.appendChild(l);
			});
		}
		function W() {
			let e = V().find((s) => s.getAttribute("aria-disabled") !== "true"), a = e == null ? void 0 : e.getAttribute(T);
			E.setState("value", a || void 0);
		}
		function J() {
			var a, s, i, l;
			if (!n.current.search || p.current.shouldFilter === !1) {
				n.current.filtered.count = u.current.size;
				return;
			}
			n.current.filtered.groups = /* @__PURE__ */ new Set();
			let e = 0;
			for (let g of u.current) {
				let F = te((s = (a = d.current.get(g)) == null ? void 0 : a.value) != null ? s : "", (l = (i = d.current.get(g)) == null ? void 0 : i.keywords) != null ? l : []);
				n.current.filtered.items.set(g, F), F > 0 && e++;
			}
			for (let [g, y] of c.current) for (let h of y) if (n.current.filtered.items.get(h) > 0) {
				n.current.filtered.groups.add(g);
				break;
			}
			n.current.filtered.count = e;
		}
		function ne() {
			var a, s, i;
			let e = M();
			e && (((a = e.parentElement) == null ? void 0 : a.firstChild) === e && ((i = (s = e.closest(N)) == null ? void 0 : s.querySelector(be)) == null || i.scrollIntoView({ block: "nearest" })), e.scrollIntoView({ block: "nearest" }));
		}
		function M() {
			var e;
			return (e = I.current) == null ? void 0 : e.querySelector(`${le}[aria-selected="true"]`);
		}
		function V() {
			var e;
			return Array.from(((e = I.current) == null ? void 0 : e.querySelectorAll(ce)) || []);
		}
		function X(e) {
			let s = V()[e];
			s && E.setState("value", s.getAttribute(T));
		}
		function Q(e) {
			var g;
			let a = M(), s = V(), i = s.findIndex((y) => y === a), l = s[i + e];
			(g = p.current) != null && g.loop && (l = i + e < 0 ? s[s.length - 1] : i + e === s.length ? s[0] : s[i + e]), l && E.setState("value", l.getAttribute(T));
		}
		function re(e) {
			let a = M(), s = a == null ? void 0 : a.closest(N), i;
			for (; s && !i;) s = e > 0 ? we(s, N) : De(s, N), i = s == null ? void 0 : s.querySelector(ce);
			i ? E.setState("value", i.getAttribute(T)) : Q(e);
		}
		let oe = () => X(V().length - 1), ie = (e) => {
			e.preventDefault(), e.metaKey ? oe() : e.altKey ? re(1) : Q(1);
		}, se = (e) => {
			e.preventDefault(), e.metaKey ? X(0) : e.altKey ? re(-1) : Q(-1);
		};
		return react$1.createElement(Primitive.div, {
			ref: o,
			tabIndex: -1,
			...O,
			"cmdk-root": "",
			onKeyDown: (e) => {
				var s;
				(s = O.onKeyDown) == null || s.call(O, e);
				let a = e.nativeEvent.isComposing || e.keyCode === 229;
				if (!(e.defaultPrevented || a)) switch (e.key) {
					case "n":
					case "j":
						j && e.ctrlKey && ie(e);
						break;
					case "ArrowDown":
						ie(e);
						break;
					case "p":
					case "k":
						j && e.ctrlKey && se(e);
						break;
					case "ArrowUp":
						se(e);
						break;
					case "Home":
						e.preventDefault(), X(0);
						break;
					case "End":
						e.preventDefault(), oe();
						break;
					case "Enter": {
						e.preventDefault();
						let i = M();
						if (i) {
							let l = new Event(Z);
							i.dispatchEvent(l);
						}
					}
				}
			}
		}, react$1.createElement("label", {
			"cmdk-label": "",
			htmlFor: U.inputId,
			id: U.labelId,
			style: Te
		}, b), B(r, (e) => react$1.createElement(de.Provider, { value: E }, react$1.createElement(ue.Provider, { value: U }, e))));
	});
	var he = react$1.forwardRef((r, o) => {
		var _, I;
		let n = useId(), u = react$1.useRef(null), c = react$1.useContext(fe), d = K(), f = pe(r), p = (I = (_ = f.current) == null ? void 0 : _.forceMount) != null ? I : c == null ? void 0 : c.forceMount;
		k(() => {
			if (!p) return d.item(n, c == null ? void 0 : c.id);
		}, [p]);
		let b = ve(n, u, [
			r.value,
			r.children,
			u
		], r.keywords), m = ee(), R = P((v) => v.value && v.value === b.current), x = P((v) => p || d.filter() === !1 ? !0 : v.search ? v.filtered.items.get(n) > 0 : !0);
		react$1.useEffect(() => {
			let v = u.current;
			if (!(!v || r.disabled)) return v.addEventListener(Z, C), () => v.removeEventListener(Z, C);
		}, [
			x,
			r.onSelect,
			r.disabled
		]);
		function C() {
			var v, E;
			S(), (E = (v = f.current).onSelect) == null || E.call(v, b.current);
		}
		function S() {
			m.setState("value", b.current, !0);
		}
		if (!x) return null;
		let { disabled: A, value: ge, onSelect: j, forceMount: O, keywords: $, ...q } = r;
		return react$1.createElement(Primitive.div, {
			ref: composeRefs(u, o),
			...q,
			id: n,
			"cmdk-item": "",
			role: "option",
			"aria-disabled": !!A,
			"aria-selected": !!R,
			"data-disabled": !!A,
			"data-selected": !!R,
			onPointerMove: A || d.getDisablePointerSelection() ? void 0 : S,
			onClick: A ? void 0 : C
		}, r.children);
	});
	var Ee = react$1.forwardRef((r, o) => {
		let { heading: n, children: u, forceMount: c, ...d } = r, f = useId(), p = react$1.useRef(null), b = react$1.useRef(null), m = useId(), R = K(), x = P((S) => c || R.filter() === !1 ? !0 : S.search ? S.filtered.groups.has(f) : !0);
		k(() => R.group(f), []), ve(f, p, [
			r.value,
			r.heading,
			b
		]);
		let C = react$1.useMemo(() => ({
			id: f,
			forceMount: c
		}), [c]);
		return react$1.createElement(Primitive.div, {
			ref: composeRefs(p, o),
			...d,
			"cmdk-group": "",
			role: "presentation",
			hidden: x ? void 0 : !0
		}, n && react$1.createElement("div", {
			ref: b,
			"cmdk-group-heading": "",
			"aria-hidden": !0,
			id: m
		}, n), B(r, (S) => react$1.createElement("div", {
			"cmdk-group-items": "",
			role: "group",
			"aria-labelledby": n ? m : void 0
		}, react$1.createElement(fe.Provider, { value: C }, S))));
	});
	var ye = react$1.forwardRef((r, o) => {
		let { alwaysRender: n, ...u } = r, c = react$1.useRef(null), d = P((f) => !f.search);
		return !n && !d ? null : react$1.createElement(Primitive.div, {
			ref: composeRefs(c, o),
			...u,
			"cmdk-separator": "",
			role: "separator"
		});
	});
	var Se = react$1.forwardRef((r, o) => {
		let { onValueChange: n, ...u } = r, c = r.value != null, d = ee(), f = P((m) => m.search), p = P((m) => m.selectedItemId), b = K();
		return react$1.useEffect(() => {
			r.value != null && d.setState("search", r.value);
		}, [r.value]), react$1.createElement(Primitive.input, {
			ref: o,
			...u,
			"cmdk-input": "",
			autoComplete: "off",
			autoCorrect: "off",
			spellCheck: !1,
			"aria-autocomplete": "list",
			role: "combobox",
			"aria-expanded": !0,
			"aria-controls": b.listId,
			"aria-labelledby": b.labelId,
			"aria-activedescendant": p,
			id: b.inputId,
			type: "text",
			value: c ? r.value : f,
			onChange: (m) => {
				c || d.setState("search", m.target.value), n?.(m.target.value);
			}
		});
	});
	var Ce = react$1.forwardRef((r, o) => {
		let { children: n, label: u = "Suggestions", ...c } = r, d = react$1.useRef(null), f = react$1.useRef(null), p = P((m) => m.selectedItemId), b = K();
		return react$1.useEffect(() => {
			if (f.current && d.current) {
				let m = f.current, R = d.current, x, C = new ResizeObserver(() => {
					x = requestAnimationFrame(() => {
						let S = m.offsetHeight;
						R.style.setProperty("--cmdk-list-height", S.toFixed(1) + "px");
					});
				});
				return C.observe(m), () => {
					cancelAnimationFrame(x), C.unobserve(m);
				};
			}
		}, []), react$1.createElement(Primitive.div, {
			ref: composeRefs(d, o),
			...c,
			"cmdk-list": "",
			role: "listbox",
			tabIndex: -1,
			"aria-activedescendant": p,
			"aria-label": u,
			id: b.listId
		}, B(r, (m) => react$1.createElement("div", {
			ref: composeRefs(f, b.listInnerRef),
			"cmdk-list-sizer": ""
		}, m)));
	});
	var xe = react$1.forwardRef((r, o) => {
		let { open: n, onOpenChange: u, overlayClassName: c, contentClassName: d, container: f, ...p } = r;
		return react$1.createElement(Dialog, {
			open: n,
			onOpenChange: u
		}, react$1.createElement(DialogPortal, { container: f }, react$1.createElement(DialogOverlay, {
			"cmdk-overlay": "",
			className: c
		}), react$1.createElement(DialogContent, {
			"aria-label": r.label,
			"cmdk-dialog": "",
			className: d
		}, react$1.createElement(me, {
			ref: o,
			...p
		}))));
	});
	var Ie = react$1.forwardRef((r, o) => P((u) => u.filtered.count === 0) ? react$1.createElement(Primitive.div, {
		ref: o,
		...r,
		"cmdk-empty": "",
		role: "presentation"
	}) : null);
	var Pe = react$1.forwardRef((r, o) => {
		let { progress: n, children: u, label: c = "Loading...", ...d } = r;
		return react$1.createElement(Primitive.div, {
			ref: o,
			...d,
			"cmdk-loading": "",
			role: "progressbar",
			"aria-valuenow": n,
			"aria-valuemin": 0,
			"aria-valuemax": 100,
			"aria-label": c
		}, B(r, (f) => react$1.createElement("div", { "aria-hidden": !0 }, f)));
	});
	var _e = Object.assign(me, {
		List: Ce,
		Item: he,
		Input: Se,
		Group: Ee,
		Separator: ye,
		Dialog: xe,
		Empty: Ie,
		Loading: Pe
	});
	function we(r, o) {
		let n = r.nextElementSibling;
		for (; n;) {
			if (n.matches(o)) return n;
			n = n.nextElementSibling;
		}
	}
	function De(r, o) {
		let n = r.previousElementSibling;
		for (; n;) {
			if (n.matches(o)) return n;
			n = n.previousElementSibling;
		}
	}
	function pe(r) {
		let o = react$1.useRef(r);
		return k(() => {
			o.current = r;
		}), o;
	}
	var k = typeof window == "undefined" ? react$1.useEffect : react$1.useLayoutEffect;
	function L(r) {
		let o = react$1.useRef();
		return o.current === void 0 && (o.current = r()), o;
	}
	function P(r) {
		let o = ee(), n = () => r(o.snapshot());
		return react$1.useSyncExternalStore(o.subscribe, n, n);
	}
	function ve(r, o, n, u = []) {
		let c = react$1.useRef(), d = K();
		return k(() => {
			var b;
			let f = (() => {
				var m;
				for (let R of n) {
					if (typeof R == "string") return R.trim();
					if (typeof R == "object" && "current" in R) return R.current ? (m = R.current.textContent) == null ? void 0 : m.trim() : c.current;
				}
			})(), p = u.map((m) => m.trim());
			d.value(r, f, p), (b = o.current) == null || b.setAttribute(T, f), c.current = f;
		}), c;
	}
	var ke = () => {
		let [r, o] = react$1.useState(), n = L(() => /* @__PURE__ */ new Map());
		return k(() => {
			n.current.forEach((u) => u()), n.current = /* @__PURE__ */ new Map();
		}, [r]), (u, c) => {
			n.current.set(u, c), o({});
		};
	};
	function Me(r) {
		let o = r.type;
		return typeof o == "function" ? o(r.props) : "render" in o ? o.render(r.props) : r;
	}
	function B({ asChild: r, children: o }, n) {
		return r && react$1.isValidElement(o) ? react$1.cloneElement(Me(o), { ref: o.ref }, n(o.props.children)) : n(o);
	}
	var Te = {
		position: "absolute",
		width: "1px",
		height: "1px",
		padding: "0",
		margin: "-1px",
		overflow: "hidden",
		clip: "rect(0, 0, 0, 0)",
		whiteSpace: "nowrap",
		borderWidth: "0"
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

// packages/icons/build-module/icon/index.mjs
/**
	* Return an SVG icon.
	*
	* @param props The component props.
	*
	* @return Icon component
	*/
	var icon_default = (0, _wordpress_element.forwardRef)(({ icon, size = 24, style, ...props }, ref) => {
		const intrinsicStyle = icon.props.style;
		const mergedStyle = intrinsicStyle || style ? {
			...intrinsicStyle,
			...style
		} : void 0;
		return (0, _wordpress_element.cloneElement)(icon, {
			width: size,
			height: size,
			...props,
			...mergedStyle ? { style: mergedStyle } : {},
			ref
		});
	});

// packages/icons/build-module/library/arrow-right.mjs
	var arrow_right_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M4 12L19 12M14 17L19 12L14 7" })
	});

// packages/icons/build-module/library/search.mjs
	var search_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M5 19L9.28769 14.7123M18.25 11C18.25 13.8995 15.8995 16.25 13 16.25C10.1005 16.25 7.75 13.8995 7.75 11C7.75 8.10051 10.1005 5.75 13 5.75C15.8995 5.75 18.25 8.10051 18.25 11Z" })
	});

// packages/commands/build-module/store/reducer.mjs
/**
	* Reducer returning the registered commands
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function commands(state = {}, action) {
		switch (action.type) {
			case "REGISTER_COMMAND": return {
				...state,
				[action.name]: {
					name: action.name,
					label: action.label,
					searchLabel: action.searchLabel,
					context: action.context,
					category: action.category,
					callback: action.callback,
					icon: action.icon,
					keywords: action.keywords
				}
			};
			case "UNREGISTER_COMMAND": {
				const { [action.name]: _, ...remainingState } = state;
				return remainingState;
			}
		}
		return state;
	}
	/**
	* Reducer returning the command loaders
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function commandLoaders(state = {}, action) {
		switch (action.type) {
			case "REGISTER_COMMAND_LOADER": return {
				...state,
				[action.name]: {
					name: action.name,
					context: action.context,
					category: action.category,
					hook: action.hook
				}
			};
			case "UNREGISTER_COMMAND_LOADER": {
				const { [action.name]: _, ...remainingState } = state;
				return remainingState;
			}
		}
		return state;
	}
	/**
	* Reducer returning the command palette open state.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function isOpen$1(state = false, action) {
		switch (action.type) {
			case "OPEN": return true;
			case "CLOSE": return false;
		}
		return state;
	}
	/**
	* Reducer returning the command palette's active context.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function context(state = "root", action) {
		switch (action.type) {
			case "SET_CONTEXT": return action.context;
		}
		return state;
	}
	function loaderStates(state = {}, action) {
		switch (action.type) {
			case "SET_LOADER_LOADING": {
				if (action.isLoading) return {
					...state,
					[action.name]: true
				};
				if (!(action.name in state)) return state;
				const { [action.name]: _, ...remainingState } = state;
				return remainingState;
			}
		}
		return state;
	}
	const reducer = (0, _wordpress_data.combineReducers)({
		commands,
		commandLoaders,
		isOpen: isOpen$1,
		context,
		loaderStates
	});

// packages/commands/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		close: () => close,
		open: () => open,
		registerCommand: () => registerCommand,
		registerCommandLoader: () => registerCommandLoader,
		unregisterCommand: () => unregisterCommand,
		unregisterCommandLoader: () => unregisterCommandLoader
	}, 1);
	/**
	* Command categories allowed via registerCommand.
	* The 'workflow' category is reserved for internal use
	* and cannot be registered through this API.
	*/
	const REGISTERABLE_CATEGORIES = /* @__PURE__ */ new Set([
		"command",
		"view",
		"edit",
		"action"
	]);
	/**
	* Returns an action object used to register a new command.
	*
	* @param config Command config.
	*
	* @return action.
	*/
	function registerCommand(config) {
		let { category } = config;
		if (!category || !REGISTERABLE_CATEGORIES.has(category)) category = "action";
		return {
			type: "REGISTER_COMMAND",
			...config,
			category
		};
	}
	/**
	* Returns an action object used to unregister a command.
	*
	* @param name Command name.
	*
	* @return action.
	*/
	function unregisterCommand(name) {
		return {
			type: "UNREGISTER_COMMAND",
			name
		};
	}
	/**
	* Register command loader.
	*
	* @param config Command loader config.
	*
	* @return action.
	*/
	function registerCommandLoader(config) {
		let { category } = config;
		if (!category || !REGISTERABLE_CATEGORIES.has(category)) category = "action";
		return {
			type: "REGISTER_COMMAND_LOADER",
			...config,
			category
		};
	}
	/**
	* Unregister command loader hook.
	*
	* @param name Command loader name.
	*
	* @return action.
	*/
	function unregisterCommandLoader(name) {
		return {
			type: "UNREGISTER_COMMAND_LOADER",
			name
		};
	}
	/**
	* Opens the command palette.
	*
	* @return action.
	*/
	function open() {
		return { type: "OPEN" };
	}
	/**
	* Closes the command palette.
	*
	* @return action.
	*/
	function close() {
		return { type: "CLOSE" };
	}

// packages/commands/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		getCommandLoaders: () => getCommandLoaders,
		getCommands: () => getCommands,
		getContext: () => getContext,
		isOpen: () => isOpen
	}, 1);
	/**
	* Returns the registered static commands.
	*
	* @param state      State tree.
	* @param contextual Whether to return only contextual commands.
	*
	* @return The list of registered commands.
	*/
	const getCommands = (0, _wordpress_data.createSelector)((state, contextual = false) => Object.values(state.commands).filter((command) => {
		const isContextual = command.context && command.context === state.context;
		return contextual ? isContextual : !isContextual;
	}), (state) => [state.commands, state.context]);
	/**
	* Returns the registered command loaders.
	*
	* @param state      State tree.
	* @param contextual Whether to return only contextual command loaders.
	*
	* @return The list of registered command loaders.
	*/
	const getCommandLoaders = (0, _wordpress_data.createSelector)((state, contextual = false) => Object.values(state.commandLoaders).filter((loader) => {
		const isContextual = loader.context && loader.context === state.context;
		return contextual ? isContextual : !isContextual;
	}), (state) => [state.commandLoaders, state.context]);
	/**
	* Returns whether the command palette is open.
	*
	* @param state State tree.
	*
	* @return Returns whether the command palette is open.
	*/
	function isOpen(state) {
		return state.isOpen;
	}
	/**
	* Returns whether the active context.
	*
	* @param state State tree.
	*
	* @return Context.
	*/
	function getContext(state) {
		return state.context;
	}

// packages/commands/build-module/store/private-actions.mjs
	var private_actions_exports = /* @__PURE__ */ __exportAll({
		setContext: () => setContext,
		setLoaderLoading: () => setLoaderLoading
	}, 1);
	/**
	* Sets the active context.
	*
	* @param {string} context Context.
	*
	* @return {Object} action.
	*/
	function setContext(context) {
		return {
			type: "SET_CONTEXT",
			context
		};
	}
	/**
	* Sets whether a command loader is currently loading.
	*
	* @param {string}  name      Command loader name.
	* @param {boolean} isLoading Whether the loader is loading.
	*
	* @return {Object} action.
	*/
	function setLoaderLoading(name, isLoading) {
		return {
			type: "SET_LOADER_LOADING",
			name,
			isLoading
		};
	}

// packages/commands/build-module/store/private-selectors.mjs
	var private_selectors_exports = /* @__PURE__ */ __exportAll({ isLoading: () => isLoading }, 1);
	/**
	* Returns whether any command loader is currently loading.
	*
	* @param {Object} state State tree.
	*
	* @return {boolean} Whether any loader is loading.
	*/
	function isLoading(state) {
		return Object.entries(state.loaderStates).some(([name, loading]) => loading && !!state.commandLoaders[name]);
	}

// packages/commands/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/commands");

// packages/commands/build-module/store/index.mjs
/**
	* Store definition for the commands namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*
	* @example
	* ```js
	* import { store as commandsStore } from '@wordpress/commands';
	* import { useDispatch } from '@wordpress/data';
	* ...
	* const { open: openCommandCenter } = useDispatch( commandsStore );
	* ```
	*/
	const store = (0, _wordpress_data.createReduxStore)("core/commands", {
		reducer,
		actions: actions_exports,
		selectors: selectors_exports
	});
	(0, _wordpress_data.register)(store);
	unlock(store).registerPrivateActions(private_actions_exports);
	unlock(store).registerPrivateSelectors(private_selectors_exports);

// packages/commands/build-module/components/use-recent-commands.mjs
	const MAX_RECENTLY_SAVED = 30;
	const MAX_RECENTLY_DISPLAYED = 5;
	const EMPTY_ARRAY = [];
	const EMPTY_COMMANDS = [];
	const EMPTY_SET = /* @__PURE__ */ new Set();
	function recordUsage(name) {
		const next = [name, ...((0, _wordpress_data.select)(_wordpress_preferences.store).get("core/commands", "recentlyUsed") ?? []).filter((n) => n !== name)].slice(0, MAX_RECENTLY_SAVED);
		(0, _wordpress_data.dispatch)(_wordpress_preferences.store).set("core/commands", "recentlyUsed", next);
	}
	/**
	* Reports a loader's loading state to the store, and clears it on unmount so
	* a loader removed mid-load does not keep the palette loading.
	*
	* @param name    Command loader name.
	* @param loading Whether the loader is loading.
	*/
	function useLoaderLoadingState(name, loading) {
		const { setLoaderLoading } = unlock((0, _wordpress_data.useDispatch)(store));
		(0, _wordpress_element.useEffect)(() => {
			setLoaderLoading(name, loading);
		}, [
			setLoaderLoading,
			name,
			loading
		]);
		(0, _wordpress_element.useEffect)(() => {
			return () => setLoaderLoading(name, false);
		}, [setLoaderLoading, name]);
	}
	function useLoaderCollector(hook, name, filterNames, onResolved) {
		const { isLoading: loading, commands = EMPTY_COMMANDS } = hook({ search: "" }) ?? {};
		useLoaderLoadingState(name, loading);
		const filtered = (0, _wordpress_element.useMemo)(() => filterNames ? commands.filter((c) => filterNames.has(c.name)) : commands, [commands, filterNames]);
		(0, _wordpress_element.useEffect)(() => {
			onResolved(name, filtered);
		}, [
			onResolved,
			name,
			filtered
		]);
		(0, _wordpress_element.useEffect)(() => {
			return () => onResolved(name, []);
		}, [onResolved, name]);
	}
	function useRecentCommands() {
		const { contextualCommands, staticCommands, contextualLoaders, staticLoaders, recentlyUsedNames = EMPTY_ARRAY } = (0, _wordpress_data.useSelect)((select) => {
			const { getCommands, getCommandLoaders } = select(store);
			return {
				contextualCommands: getCommands(true),
				staticCommands: getCommands(false),
				contextualLoaders: getCommandLoaders(true),
				staticLoaders: getCommandLoaders(false),
				recentlyUsedNames: select(_wordpress_preferences.store).get("core/commands", "recentlyUsed")
			};
		}, []);
		const [resolvedMap, setResolvedMap] = (0, _wordpress_element.useState)(() => /* @__PURE__ */ new Map());
		const onResolved = (0, _wordpress_element.useCallback)((loaderName, cmds) => {
			setResolvedMap((prev) => {
				const prevCmds = prev.get(loaderName);
				if (prevCmds && prevCmds.length === cmds.length && prevCmds.every((c, i) => c.name === cmds[i].name)) return prev;
				const next = new Map(prev);
				next.set(loaderName, cmds);
				return next;
			});
		}, []);
		const { recentNames, recentSet } = (0, _wordpress_element.useMemo)(() => {
			const names = recentlyUsedNames.slice(0, MAX_RECENTLY_DISPLAYED);
			return {
				recentNames: names,
				recentSet: new Set(names)
			};
		}, [recentlyUsedNames]);
		const loaders = (0, _wordpress_element.useMemo)(() => [...contextualLoaders, ...staticLoaders], [contextualLoaders, staticLoaders]);
		const commands = (0, _wordpress_element.useMemo)(() => {
			const allByName = /* @__PURE__ */ new Map();
			[...contextualCommands, ...staticCommands].forEach((c) => allByName.set(c.name, c));
			for (const cmds of resolvedMap.values()) cmds.forEach((c) => {
				if (!allByName.has(c.name)) allByName.set(c.name, c);
			});
			return recentNames.map((n) => allByName.get(n)).filter((c) => !!c);
		}, [
			contextualCommands,
			staticCommands,
			resolvedMap,
			recentNames
		]);
		if (!recentlyUsedNames.length) return {
			commands: EMPTY_COMMANDS,
			loaders: [],
			recentSet: EMPTY_SET,
			onResolved
		};
		return {
			commands,
			loaders,
			recentSet,
			onResolved
		};
	}

// packages/commands/build-module/components/command-menu.mjs
	const ITEM_ID_PREFIX = "command-palette-item-";
	const inputLabel = (0, _wordpress_i18n.__)("Search commands and settings");
	/**
	* Fallback icons per command category, used when a command provides no icon of
	* its own. Navigating somewhere reads the same way across the palette, so `view`
	* commands are expected to rely on this rather than pass an icon.
	*/
	const CATEGORY_FALLBACK_ICONS = { view: arrow_right_default };
	/**
	* Translatable labels for command categories.
	*/
	const CATEGORY_LABELS = {
		command: (0, _wordpress_i18n.__)("Command"),
		view: (0, _wordpress_i18n.__)("View"),
		edit: (0, _wordpress_i18n.__)("Edit"),
		action: (0, _wordpress_i18n.__)("Action"),
		workflow: (0, _wordpress_i18n.__)("Workflow")
	};
	/**
	* Whether `WCIcon` can render the value. Plugins in plain JS may still pass
	* dashicon names or components, so this accepts more than the `icon` type.
	*
	* @param icon Value to check.
	*
	* @return Whether the value is a renderable icon.
	*/
	function isValidIcon(icon) {
		return typeof icon === "string" && icon !== "" || typeof icon === "function" || (0, _wordpress_element.isValidElement)(icon);
	}
	function CommandItem({ command, search, category, valuePrefix }) {
		const { close } = (0, _wordpress_data.useDispatch)(store);
		const commandCategory = category ?? command.category;
		const categoryLabel = commandCategory ? CATEGORY_LABELS[commandCategory] : void 0;
		const fallbackIcon = commandCategory ? CATEGORY_FALLBACK_ICONS[commandCategory] : void 0;
		const icon = isValidIcon(command.icon) ? command.icon : fallbackIcon;
		const label = command.searchLabel ?? command.label;
		const value = valuePrefix ? `${valuePrefix}${command.name}` : label;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_e.Item, {
			id: `${ITEM_ID_PREFIX}${value.toLowerCase()}`,
			value,
			keywords: valuePrefix ? [...command.keywords ?? [], label] : command.keywords,
			onSelect: () => {
				recordUsage(command.name);
				command.callback({ close });
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.__experimentalHStack, {
				alignment: "left",
				className: clsx("commands-command-menu__item", { "has-icon": !!icon }),
				children: [
					icon && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Icon, {
						icon,
						size: 24
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "commands-command-menu__item-label",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.TextHighlight, {
							text: command.label,
							highlight: search
						})
					}),
					categoryLabel && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "commands-command-menu__item-category",
						children: categoryLabel
					})
				]
			})
		}, command.name);
	}
	function CommandMenuLoader({ name, search, hook, category, valuePrefix }) {
		const { isLoading: loading, commands = [] } = hook({ search }) ?? {};
		useLoaderLoadingState(name, loading);
		if (!commands.length) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: commands.map((command) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandItem, {
			command,
			search,
			category: command.category ?? category,
			valuePrefix
		}, command.name)) });
	}
	function CommandMenuLoaderWrapper({ hook, ...props }) {
		const currentLoaderRef = (0, _wordpress_element.useRef)(hook);
		const [key, setKey] = (0, _wordpress_element.useState)(0);
		(0, _wordpress_element.useEffect)(() => {
			if (currentLoaderRef.current !== hook) {
				currentLoaderRef.current = hook;
				setKey((prevKey) => prevKey + 1);
			}
		}, [hook]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandMenuLoader, {
			hook: currentLoaderRef.current,
			...props
		}, key);
	}
	function CommandList({ search, commands, loaders, valuePrefix }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [commands.map((command) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandItem, {
			command,
			search,
			valuePrefix
		}, command.name)), loaders.map((loader) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandMenuLoaderWrapper, {
			name: loader.name,
			search,
			hook: loader.hook,
			category: loader.category,
			valuePrefix
		}, loader.name))] });
	}
	function RecentLoaderRunner({ hook, name, filterNames, onResolved }) {
		useLoaderCollector(hook, name, filterNames, onResolved);
		return null;
	}
	function RecentGroup() {
		const { commands, loaders, recentSet, onResolved } = useRecentCommands();
		if (!commands.length && !loaders.length) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_e.Group, {
			heading: (0, _wordpress_i18n.__)("Recent"),
			children: [loaders.map((loader) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RecentLoaderRunner, {
				name: loader.name,
				hook: loader.hook,
				filterNames: recentSet,
				onResolved
			}, loader.name)), commands.map((command) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandItem, {
				command,
				search: "",
				valuePrefix: "recent-"
			}, command.name))]
		});
	}
	function SuggestionsGroup() {
		const { commands, loaders } = (0, _wordpress_data.useSelect)((select) => {
			const { getCommands, getCommandLoaders } = select(store);
			return {
				commands: getCommands(true),
				loaders: getCommandLoaders(true)
			};
		}, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_e.Group, {
			heading: (0, _wordpress_i18n.__)("Suggestions"),
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandList, {
				search: "",
				commands,
				loaders
			})
		});
	}
	function ResultsGroup({ search }) {
		const { commands, contextualCommands, loaders, contextualLoaders } = (0, _wordpress_data.useSelect)((select) => {
			const { getCommands, getCommandLoaders } = select(store);
			return {
				commands: getCommands(false),
				contextualCommands: getCommands(true),
				loaders: getCommandLoaders(false),
				contextualLoaders: getCommandLoaders(true)
			};
		}, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_e.Group, {
			heading: (0, _wordpress_i18n.__)("Results"),
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandList, {
				search,
				commands,
				loaders
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandList, {
				search,
				commands: contextualCommands,
				loaders: contextualLoaders
			})]
		});
	}
	function CommandInput({ search, setSearch }) {
		const commandMenuInput = (0, _wordpress_element.useRef)(null);
		const _value = P((state) => state.value);
		const selectedItemId = _value ? `${ITEM_ID_PREFIX}${_value}` : null;
		(0, _wordpress_element.useEffect)(() => {
			commandMenuInput.current.focus();
		}, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_e.Input, {
			ref: commandMenuInput,
			value: search,
			onValueChange: setSearch,
			placeholder: inputLabel,
			"aria-activedescendant": selectedItemId ?? void 0
		});
	}
	/**
	* @ignore
	*/
	function CommandMenu() {
		const { registerShortcut } = (0, _wordpress_data.useDispatch)(_wordpress_keyboard_shortcuts.store);
		const [search$1, setSearch] = (0, _wordpress_element.useState)("");
		const { isOpen: paletteIsOpen, loadersLoading } = (0, _wordpress_data.useSelect)((select) => ({
			isOpen: select(store).isOpen(),
			loadersLoading: unlock(select(store)).isLoading()
		}), []);
		const { open, close } = (0, _wordpress_data.useDispatch)(store);
		(0, _wordpress_element.useEffect)(() => {
			registerShortcut({
				name: "core/commands",
				category: "global",
				description: (0, _wordpress_i18n.__)("Open the command palette."),
				keyCombination: {
					modifier: "primary",
					character: "k"
				}
			});
		}, [registerShortcut]);
		(0, _wordpress_keyboard_shortcuts.useShortcut)("core/commands", (0, _wordpress_keycodes.withIgnoreIMEEvents)((event) => {
			if (event.defaultPrevented) return;
			event.preventDefault();
			if (paletteIsOpen) close();
			else open();
		}));
		const closeAndReset = () => {
			setSearch("");
			close();
		};
		if (!paletteIsOpen) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Modal, {
			className: "commands-command-menu",
			overlayClassName: "commands-command-menu__overlay",
			onRequestClose: closeAndReset,
			__experimentalHideHeader: true,
			size: "medium",
			contentLabel: (0, _wordpress_i18n.__)("Command palette"),
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "commands-command-menu__container",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_e, {
					label: inputLabel,
					loop: true,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "commands-command-menu__header",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(icon_default, {
							className: "commands-command-menu__header-search-icon",
							icon: search_default
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandInput, {
							search: search$1,
							setSearch
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_e.List, {
						label: (0, _wordpress_i18n.__)("Command suggestions"),
						children: [
							search$1 && !loadersLoading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_e.Empty, { children: (0, _wordpress_i18n.__)("No results found.") }),
							!search$1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RecentGroup, {}),
							!search$1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SuggestionsGroup, {}),
							search$1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ResultsGroup, { search: search$1 })
						]
					})]
				})
			})
		});
	}

// packages/commands/build-module/hooks/use-command-context.mjs
/**
	* Sets the active context of the command palette
	*
	* @param context Context to set.
	*/
	function useCommandContext(context) {
		const { getContext } = (0, _wordpress_data.useSelect)(store);
		const initialContext = (0, _wordpress_element.useRef)(getContext());
		const { setContext } = unlock((0, _wordpress_data.useDispatch)(store));
		(0, _wordpress_element.useEffect)(() => {
			setContext(context);
		}, [context, setContext]);
		(0, _wordpress_element.useEffect)(() => {
			const initialContextRef = initialContext.current;
			return () => setContext(initialContextRef);
		}, [setContext]);
	}

// packages/commands/build-module/private-apis.mjs
/**
	* @private
	*/
	const privateApis = {};
	lock(privateApis, { useCommandContext });

// packages/commands/build-module/hooks/use-command.mjs
/**
	* Attach a command to the command palette. Used for static commands.
	*
	* @param command command config.
	*
	* @example
	* ```js
	* import { useCommand } from '@wordpress/commands';
	* import { plus } from '@wordpress/icons';
	*
	* useCommand( {
	*     name: 'myplugin/my-command-name',
	*     label: __( 'Add new post' ),
	*	   icon: plus,
	*     category: 'command',
	*     callback: ({ close }) => {
	*         document.location.href = 'post-new.php';
	*         close();
	*     },
	* } );
	* ```
	*/
	function useCommand(command) {
		const { registerCommand, unregisterCommand } = (0, _wordpress_data.useDispatch)(store);
		const currentCallbackRef = (0, _wordpress_element.useRef)(command.callback);
		(0, _wordpress_element.useEffect)(() => {
			currentCallbackRef.current = command.callback;
		}, [command.callback]);
		(0, _wordpress_element.useEffect)(() => {
			if (command.disabled) return;
			registerCommand({
				name: command.name,
				context: command.context,
				category: command.category,
				label: command.label,
				searchLabel: command.searchLabel,
				icon: command.icon,
				keywords: command.keywords,
				callback: (...args) => currentCallbackRef.current(...args)
			});
			return () => {
				unregisterCommand(command.name);
			};
		}, [
			command.name,
			command.label,
			command.searchLabel,
			command.icon,
			command.context,
			command.category,
			command.keywords,
			command.disabled,
			registerCommand,
			unregisterCommand
		]);
	}
	/**
	* Attach multiple commands to the command palette. Used for static commands.
	*
	* @param commands Array of command configs.
	*
	* @example
	* ```js
	* import { useCommands } from '@wordpress/commands';
	* import { plus, pencil } from '@wordpress/icons';
	*
	* useCommands( [
	*     {
	*         name: 'myplugin/add-post',
	*         label: __( 'Add new post' ),
	*         icon: plus,
	*         category: 'command',
	*         callback: ({ close }) => {
	*             document.location.href = 'post-new.php';
	*             close();
	*         },
	*     },
	*     {
	*         name: 'myplugin/edit-posts',
	*         label: __( 'Edit posts' ),
	*         icon: pencil,
	*         category: 'view',
	*         callback: ({ close }) => {
	*             document.location.href = 'edit.php';
	*             close();
	*         },
	*     },
	* ] );
	* ```
	*/
	function useCommands(commands) {
		const { registerCommand, unregisterCommand } = (0, _wordpress_data.useDispatch)(store);
		const currentCallbacksRef = (0, _wordpress_element.useRef)({});
		(0, _wordpress_element.useEffect)(() => {
			if (!commands) return;
			commands.forEach((command) => {
				if (command.callback) currentCallbacksRef.current[command.name] = command.callback;
			});
		}, [commands]);
		(0, _wordpress_element.useEffect)(() => {
			if (!commands) return;
			commands.forEach((command) => {
				if (command.disabled) return;
				registerCommand({
					name: command.name,
					context: command.context,
					category: command.category,
					label: command.label,
					searchLabel: command.searchLabel,
					icon: command.icon,
					keywords: command.keywords,
					callback: (...args) => {
						const callback = currentCallbacksRef.current[command.name];
						if (callback) callback(...args);
					}
				});
			});
			return () => {
				commands.forEach((command) => {
					unregisterCommand(command.name);
				});
			};
		}, [
			commands,
			registerCommand,
			unregisterCommand
		]);
	}

// packages/commands/build-module/hooks/use-command-loader.mjs
/**
	* Attach a command loader to the command palette. Used for dynamic commands.
	*
	* The palette always calls the most recent `hook`. Changing the `hook` instance
	* doesn't re-render the palette.
	*
	* @param loader command loader config.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { addQueryArgs } from '@wordpress/url';
	* import { useCommandLoader } from '@wordpress/commands';
	* import { page } from '@wordpress/icons';
	* import { useSelect } from '@wordpress/data';
	* import { store as coreStore } from '@wordpress/core-data';
	* import { useMemo } from '@wordpress/element';
	*
	* function usePageSearchCommandLoader( { search } ) {
	*     // Retrieve the pages for the "search" term.
	*     const { records, isLoading } = useSelect(
	*         ( select ) => {
	*             const { getEntityRecords } = select( coreStore );
	*             const query = {
	*                 search: !! search ? search : undefined,
	*                 per_page: 10,
	*                 orderby: search ? 'relevance' : 'date',
	*             };
	*             return {
	*                 records: getEntityRecords( 'postType', 'page', query ),
	*                 isLoading: ! select( coreStore ).hasFinishedResolution(
	*                     'getEntityRecords',
	*                     [ 'postType', 'page', query ]
	*                 ),
	*             };
	*         },
	*         [ search ]
	*     );
	*
	*     // Create the commands.
	*     const commands = useMemo( () => {
	*         return ( records ?? [] ).slice( 0, 10 ).map( ( record ) => {
	*             return {
	*                 name: record.title?.rendered + ' ' + record.id,
	*                 label: record.title?.rendered
	*                     ? record.title?.rendered
	*                     : __( '(no title)' ),
	*                 icon: page,
	*                 category: 'edit',
	*                 callback: ( { close } ) => {
	*                     const args = {
	* 							p: '/page',
	* 							postId: record.id,
	*                     };
	*                     document.location = addQueryArgs( 'site-editor.php', args );
	*                     close();
	*                 },
	*             };
	*         } );
	*     }, [ records ] );
	*
	*     return {
	*         commands,
	*         isLoading,
	*     };
	* }
	*
	* useCommandLoader( {
	*     name: 'myplugin/page-search',
	*     hook: usePageSearchCommandLoader,
	* } );
	* ```
	*/
	function useCommandLoader(loader) {
		const { registerCommandLoader, unregisterCommandLoader } = (0, _wordpress_data.useDispatch)(store);
		const currentHookRef = (0, _wordpress_element.useRef)(loader.hook);
		(0, _wordpress_element.useEffect)(() => {
			currentHookRef.current = loader.hook;
		}, [loader.hook]);
		const hook = (0, _wordpress_element.useCallback)((...args) => currentHookRef.current(...args), []);
		(0, _wordpress_element.useEffect)(() => {
			if (loader.disabled) return;
			registerCommandLoader({
				name: loader.name,
				hook,
				context: loader.context,
				category: loader.category
			});
			return () => {
				unregisterCommandLoader(loader.name);
			};
		}, [
			loader.name,
			hook,
			loader.context,
			loader.category,
			loader.disabled,
			registerCommandLoader,
			unregisterCommandLoader
		]);
	}

exports.CommandMenu = CommandMenu;
exports.privateApis = privateApis;
exports.store = store;
exports.useCommand = useCommand;
exports.useCommandLoader = useCommandLoader;
exports.useCommands = useCommands;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).commands = exports;
return exports;
})({}, window.React, window.ReactJSXRuntime, window.ReactDOM, window.wp.data, window.wp.element, window.wp.i18n, window.wp.components, window.wp.keyboardShortcuts, window.wp.keycodes, window.wp.primitives, window.wp.privateApis, window.wp.preferences);
//# sourceMappingURL=index.js.map