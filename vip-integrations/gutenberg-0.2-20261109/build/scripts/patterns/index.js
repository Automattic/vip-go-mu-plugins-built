(function(exports, _wordpress_data, _wordpress_blocks, _wordpress_core_data, _wordpress_block_editor, _wordpress_private_apis, _wordpress_components, _wordpress_element, _wordpress_i18n, react_jsx_runtime, react, _wordpress_primitives, _wordpress_compose, _wordpress_a11y, _wordpress_notices, _wordpress_html_entities, _wordpress_url) {

"use strict";
// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// packages/patterns/build-module/store/reducer.mjs
	function isEditingPattern$1(state = {}, action) {
		if (action?.type === "SET_EDITING_PATTERN") return {
			...state,
			[action.clientId]: action.isEditing
		};
		return state;
	}
	var reducer_default = (0, _wordpress_data.combineReducers)({ isEditingPattern: isEditingPattern$1 });

// packages/patterns/build-module/constants.mjs
	const PATTERN_TYPES = {
		theme: "pattern",
		user: "wp_block"
	};
	const PATTERN_DEFAULT_CATEGORY = "all-patterns";
	const PATTERN_USER_CATEGORY = "my-patterns";
	const EXCLUDED_PATTERN_SOURCES = [
		"core",
		"pattern-directory/core",
		"pattern-directory/featured"
	];
	const PATTERN_SYNC_TYPES = {
		full: "fully",
		unsynced: "unsynced"
	};
	const PATTERN_OVERRIDES_BINDING_SOURCE = "core/pattern-overrides";

// packages/patterns/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		convertSyncedPatternToStatic: () => convertSyncedPatternToStatic,
		createPattern: () => createPattern,
		createPatternFromFile: () => createPatternFromFile,
		setEditingPattern: () => setEditingPattern
	}, 1);
	/**
	* Returns a generator converting one or more static blocks into a pattern, or creating a new empty pattern.
	*
	* @param title      Pattern title.
	* @param syncType   They way block is synced, 'fully' or 'unsynced'.
	* @param content    Optional serialized content of blocks to convert to pattern.
	* @param categories Ids of any selected categories.
	*/
	const createPattern = (title, syncType, content, categories) => async ({ registry }) => {
		const reusableBlock = {
			title,
			content,
			status: "publish",
			meta: syncType === PATTERN_SYNC_TYPES.unsynced ? { wp_pattern_sync_status: syncType } : void 0,
			wp_pattern_category: categories
		};
		return await registry.dispatch(_wordpress_core_data.store).saveEntityRecord("postType", "wp_block", reusableBlock);
	};
	/**
	* Create a pattern from a JSON file.
	* @param file       The JSON file instance of the pattern.
	* @param categories Ids of any selected categories.
	*/
	const createPatternFromFile = (file, categories) => async ({ dispatch }) => {
		const fileContent = await file.text();
		let parsedContent;
		try {
			parsedContent = JSON.parse(fileContent);
		} catch {
			throw new Error("Invalid JSON file");
		}
		if (parsedContent.__file !== "wp_block" || !parsedContent.title || !parsedContent.content || typeof parsedContent.title !== "string" || typeof parsedContent.content !== "string" || parsedContent.syncStatus && typeof parsedContent.syncStatus !== "string") throw new Error("Invalid pattern JSON file");
		return await dispatch.createPattern(parsedContent.title, parsedContent.syncStatus, parsedContent.content, categories);
	};
	/**
	* Returns a generator converting a synced pattern block into a static block.
	*
	* @param clientId The client ID of the block to attach.
	*/
	const convertSyncedPatternToStatic = (clientId) => ({ registry }) => {
		const patternBlock = registry.select(_wordpress_block_editor.store).getBlock(clientId);
		const existingOverrides = patternBlock.attributes?.content;
		function cloneBlocksAndRemoveBindings(blocks) {
			return blocks.map((block) => {
				let metadata = block.attributes.metadata;
				if (metadata) {
					metadata = { ...metadata };
					delete metadata.id;
					delete metadata.bindings;
					if (existingOverrides?.[metadata.name]) for (const [attributeName, value] of Object.entries(existingOverrides[metadata.name])) {
						if (!(0, _wordpress_blocks.getBlockType)(block.name)?.attributes[attributeName]) continue;
						block.attributes[attributeName] = value;
					}
				}
				return (0, _wordpress_blocks.cloneBlock)(block, { metadata: metadata && Object.keys(metadata).length > 0 ? metadata : void 0 }, cloneBlocksAndRemoveBindings(block.innerBlocks));
			});
		}
		const patternInnerBlocks = registry.select(_wordpress_block_editor.store).getBlocks(patternBlock.clientId);
		registry.dispatch(_wordpress_block_editor.store).replaceBlocks(patternBlock.clientId, cloneBlocksAndRemoveBindings(patternInnerBlocks));
	};
	/**
	* Returns an action descriptor for SET_EDITING_PATTERN action.
	*
	* @param clientId  The clientID of the pattern to target.
	* @param isEditing Whether the block should be in editing state.
	* @return Action descriptor.
	*/
	function setEditingPattern(clientId, isEditing) {
		return {
			type: "SET_EDITING_PATTERN",
			clientId,
			isEditing
		};
	}

// packages/patterns/build-module/store/constants.mjs
/**
	* Module Constants
	*/
	const STORE_NAME = "core/patterns";

// packages/patterns/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({ isEditingPattern: () => isEditingPattern }, 1);
	/**
	* Returns true if pattern is in the editing state.
	*
	* @param {Object} state    Global application state.
	* @param {string} clientId the clientID of the block.
	* @return {boolean} Whether the pattern is in the editing state.
	*/
	function isEditingPattern(state, clientId) {
		return state.isEditingPattern[clientId];
	}

// packages/patterns/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/patterns");

// packages/patterns/build-module/store/index.mjs
/**
	* Post editor data store configuration.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#registerStore
	*/
	const storeConfig = { reducer: reducer_default };
	/**
	* Store definition for the editor namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*/
	const store = (0, _wordpress_data.createReduxStore)(STORE_NAME, { ...storeConfig });
	(0, _wordpress_data.register)(store);
	unlock(store).registerPrivateActions(actions_exports);
	unlock(store).registerPrivateSelectors(selectors_exports);

// packages/patterns/build-module/api/index.mjs
/**
	* Determines whether a block is overridable.
	*
	* @param block The block to test.
	*
	* @return `true` if a block is overridable, `false` otherwise.
	*/
	function isOverridableBlock(block) {
		return !!block.attributes.metadata?.name && !!block.attributes.metadata?.bindings && Object.values(block.attributes.metadata.bindings).some((binding) => binding.source === "core/pattern-overrides");
	}

// packages/patterns/build-module/components/overrides-panel.mjs
	const { BlockQuickNavigation } = unlock(_wordpress_block_editor.privateApis);
	function OverridesPanel() {
		const { allClientIds, supportedBlockTypesRaw } = (0, _wordpress_data.useSelect)((select) => ({
			allClientIds: select(_wordpress_block_editor.store).getClientIdsWithDescendants(),
			supportedBlockTypesRaw: select(_wordpress_block_editor.store).getSettings()?.__experimentalBlockBindingsSupportedAttributes
		}), []);
		const { getBlock } = (0, _wordpress_data.useSelect)(_wordpress_block_editor.store);
		const clientIdsWithOverrides = (0, _wordpress_element.useMemo)(() => {
			const supportedBlockTypes = Object.keys(supportedBlockTypesRaw ?? {});
			return allClientIds.filter((clientId) => {
				const block = getBlock(clientId);
				return supportedBlockTypes.includes(block.name) && isOverridableBlock(block);
			});
		}, [
			allClientIds,
			getBlock,
			supportedBlockTypesRaw
		]);
		if (!clientIdsWithOverrides?.length) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.PanelBody, {
			title: (0, _wordpress_i18n.__)("Overrides"),
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BlockQuickNavigation, { clientIds: clientIdsWithOverrides })
		});
	}

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

// node_modules/.store/@base-ui/react@1.9.0-uHNeM94OdjIeOtpyYGvL0A/node_modules/@base-ui/react/use-render/useRender.mjs
/**
	* Renders a Base UI element.
	*
	* @public
	*/
	function useRender(params) {
		return useRenderElement(params.defaultTagName ?? "div", params, params);
	}

// packages/icons/build-module/library/check.mjs
	var check_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M7 12L10 15L17 8" })
	});

// packages/icons/build-module/library/footer.mjs
	var footer_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.75 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V14.25M9.75 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V14.25M9.75 4.75V14.25M19.25 14.25V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V14.25M19.25 14.25H9.75M9.75 14.25H4.75" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M19.25 15.5V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V15.5C4.75 14.8096 5.30964 14.25 6 14.25H18C18.6904 14.25 19.25 14.8096 19.25 15.5Z",
			fill: "currentColor"
		})]
	});

// packages/icons/build-module/library/header.mjs
	var header_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.75 19.25H18C18.6904 19.25 19.25 18.6904 19.25 18V9.75M9.75 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V9.75M9.75 19.25V9.75M19.25 9.75V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V9.75M19.25 9.75H9.75M9.75 9.75H4.75" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M19.25 8.5V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V8.5C4.75 9.19036 5.30964 9.75 6 9.75H18C18.6904 9.75 19.25 9.19036 19.25 8.5Z",
			fill: "currentColor"
		})]
	});

// packages/icons/build-module/library/navigation-overlay.mjs
	var navigation_overlay_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M4.75 9.25V16C4.75 16.6904 5.30964 17.25 6 17.25H8M4.75 9.25V6C4.75 5.30964 5.30964 4.75 6 4.75H16C16.6904 4.75 17.25 5.30964 17.25 6V8M4.75 9.25H8" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M10.75 11.25C10.75 10.9739 10.9739 10.75 11.25 10.75H18.75C19.0261 10.75 19.25 10.9739 19.25 11.25V18.75C19.25 19.0261 19.0261 19.25 18.75 19.25H11.25C10.9739 19.25 10.75 19.0261 10.75 18.75V11.25Z",
			fill: "currentColor"
		})]
	});

// packages/icons/build-module/library/sidebar.mjs
	var sidebar_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.75 19.25H18C18.6904 19.25 19.25 18.6904 19.25 18V9.75M9.75 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V9.75M9.75 19.25V9.75M19.25 9.75V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V9.75M19.25 9.75H9.75M9.75 9.75H4.75" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M6 19.25H9.75V9.75H4.75V18C4.75 18.6904 5.30964 19.25 6 19.25Z",
			fill: "currentColor"
		})]
	});

// packages/icons/build-module/library/symbol-filled.mjs
	var symbol_filled_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M15.2071 6.20711L20.2929 11.2929C20.6834 11.6834 20.6834 12.3166 20.2929 12.7071L15.2071 17.7929C14.8166 18.1834 14.1834 18.1834 13.7929 17.7929L8.70711 12.7071C8.31658 12.3166 8.31658 11.6834 8.70711 11.2929L13.7929 6.20711C14.1834 5.81658 14.8166 5.81658 15.2071 6.20711Z",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.5 5.5L3.70711 11.2929C3.31658 11.6834 3.31658 12.3166 3.70711 12.7071L9.5 18.5" })]
	});

// packages/icons/build-module/library/symbol.mjs
	var symbol_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M15.2071 6.20711L20.2929 11.2929C20.6834 11.6834 20.6834 12.3166 20.2929 12.7071L15.2071 17.7929C14.8166 18.1834 14.1834 18.1834 13.7929 17.7929L8.70711 12.7071C8.31658 12.3166 8.31658 11.6834 8.70711 11.2929L13.7929 6.20711C14.1834 5.81658 14.8166 5.81658 15.2071 6.20711Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.5 5.5L3.70711 11.2929C3.31658 11.6834 3.31658 12.3166 3.70711 12.7071L9.5 18.5" })]
	});

// packages/ui/build-module/text/text.mjs
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
	registerStyle$1("09bae534ff", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._9745ffa515d864cf__text{text-wrap:pretty;margin:0}._8882b6a7feb4fd3d__heading-2xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-p-line-height:var(--wpds-typography-line-height-2xl,40px);font-size:var(--wpds-typography-font-size-2xl,32px);line-height:var(--wpds-typography-line-height-2xl,40px)}._664e3e7687c45603__heading-xl,._8882b6a7feb4fd3d__heading-2xl{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600)}._664e3e7687c45603__heading-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-md,24px)}.dac661a5de0ed2bd__heading-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-lg,15px)}._59c7f3f740e2f96e__heading-md,.dac661a5de0ed2bd__heading-lg{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-sm,20px)}._59c7f3f740e2f96e__heading-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px)}.cf052fbad8d93b7e__heading-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._212b9cfef57a0af4__body-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-xl,32px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-xl,32px)}._07f57bc0aa36b2c6__body-lg,._212b9cfef57a0af4__body-xl{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}._07f57bc0aa36b2c6__body-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-lg,15px);line-height:var(--wpds-typography-line-height-md,24px)}._0c6da4457aec9e62__body-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px)}._0c6da4457aec9e62__body-md,.b998f87ff17b7bec__body-sm{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,\"Segoe UI\",\"Roboto\",\"Oxygen-Sans\",\"Ubuntu\",\"Cantarell\",\"Helvetica Neue\",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}.b998f87ff17b7bec__body-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}");
	var style_module_default$1 = {
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
	registerStyle$1("726f348f3f", "._78c10a0773e51a91__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}._5b33aa2d48624b4f__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-weak,#707070))}&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._980b3b4776ac8f81__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._43e478b4279a076c__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._698099e25b0fb1a6__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6)._326aee4184d261fd__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}.e9576240835601ba__a,.e9576240835601ba__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}._3f05789653864a73__ol{list-style:var(--_gcd-ol-list-style,none);margin:var(--_gcd-ol-margin,0);padding-block:var(--_gcd-ol-padding-block,0);padding-inline:var(--_gcd-ol-padding-inline,0)}._3c72ff72abe57859__li{margin:var(--_gcd-li-margin,0)}[role=treeitem] span._79d16267c15d9eb2__span[aria-hidden]{display:var(--_gcd-span-display,inline);font-family:var(--_gcd-span-font-family,inherit);font-size:var(--_gcd-span-font-size,inherit);line-height:var(--_gcd-span-line-height,1);pointer-events:var(--_gcd-span-pointer-events,auto);position:var(--_gcd-span-position,static)}");
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
	const Text = (0, _wordpress_element.forwardRef)(function UnforwardedText({ variant = "body-md", render, className, ...props }, ref) {
		return useRender({
			render,
			defaultTagName: "span",
			ref,
			props: mergeProps(props, { className: clsx(style_module_default$1.text, global_css_defense_module_default.heading, global_css_defense_module_default.p, style_module_default$1[variant], className) })
		});
	});

// packages/ui/build-module/stack/stack.mjs
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
	registerStyle("67591fa198", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._8e8e79c1a2eec43b__stack{display:flex}}}");
	var style_module_default = { "stack": "_8e8e79c1a2eec43b__stack" };
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
				className: style_module_default.stack
			})
		});
	});

// packages/patterns/build-module/components/category-selector.mjs
	const unescapeString = (arg) => {
		return (0, _wordpress_html_entities.decodeEntities)(arg);
	};
	const CATEGORY_SLUG = "wp_pattern_category";
	function CategorySelector({ categoryTerms, onChange, categoryMap }) {
		const [search, setSearch] = (0, _wordpress_element.useState)("");
		const debouncedSearch = (0, _wordpress_compose.useDebounce)(setSearch, 500);
		const suggestions = (0, _wordpress_element.useMemo)(() => {
			return Array.from(categoryMap.values()).map((category) => unescapeString(category.label)).filter((category) => {
				if (search !== "") return category.toLowerCase().includes(search.toLowerCase());
				return true;
			}).sort((a, b) => a.localeCompare(b));
		}, [search, categoryMap]);
		function handleChange(termNames) {
			onChange(termNames.reduce((terms, newTerm) => {
				if (!terms.some((term) => term.toLowerCase() === newTerm.toLowerCase())) terms.push(newTerm);
				return terms;
			}, []));
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.FormTokenField, {
			className: "patterns-menu-items__convert-modal-categories",
			value: categoryTerms,
			suggestions,
			onChange: handleChange,
			onInputChange: debouncedSearch,
			label: (0, _wordpress_i18n.__)("Categories"),
			tokenizeOnBlur: true,
			__experimentalExpandOnFocus: true
		});
	}

// packages/patterns/build-module/private-hooks.mjs
/**
	* Helper hook that creates a Map with the core and user patterns categories
	* and removes any duplicates. It's used when we need to create new user
	* categories when creating or importing patterns.
	* This hook also provides a function to find or create a pattern category.
	*
	* @return The merged categories map and the callback function to find or create a category.
	*/
	function useAddPatternCategory() {
		const { saveEntityRecord, invalidateResolution } = (0, _wordpress_data.useDispatch)(_wordpress_core_data.store);
		const { corePatternCategories, userPatternCategories } = (0, _wordpress_data.useSelect)((select) => {
			const { getUserPatternCategories, getBlockPatternCategories } = select(_wordpress_core_data.store);
			return {
				corePatternCategories: getBlockPatternCategories(),
				userPatternCategories: getUserPatternCategories()
			};
		}, []);
		const categoryMap = (0, _wordpress_element.useMemo)(() => {
			const uniqueCategories = /* @__PURE__ */ new Map();
			userPatternCategories.forEach((category) => {
				uniqueCategories.set(category.label.toLowerCase(), {
					label: category.label,
					name: category.name,
					id: category.id
				});
			});
			corePatternCategories.forEach((category) => {
				if (!uniqueCategories.has(category.label.toLowerCase()) && category.name !== "query") uniqueCategories.set(category.label.toLowerCase(), {
					label: category.label,
					name: category.name
				});
			});
			return uniqueCategories;
		}, [userPatternCategories, corePatternCategories]);
		async function findOrCreateTerm(term) {
			try {
				const existingTerm = categoryMap.get(term.toLowerCase());
				if (existingTerm?.id) return existingTerm.id;
				const termData = existingTerm ? {
					name: existingTerm.label,
					slug: existingTerm.name
				} : { name: term };
				const newTerm = await saveEntityRecord("taxonomy", CATEGORY_SLUG, termData, { throwOnError: true });
				invalidateResolution("getUserPatternCategories");
				return newTerm.id;
			} catch (error) {
				if (error.code !== "term_exists") throw error;
				return error.data.term_id;
			}
		}
		return {
			categoryMap,
			findOrCreateTerm
		};
	}

// packages/patterns/build-module/components/create-pattern-modal.mjs
	function CreatePatternModal({ className = "patterns-menu-items__convert-modal", modalTitle, ...restProps }) {
		const defaultModalTitle = (0, _wordpress_data.useSelect)((select) => select(_wordpress_core_data.store).getPostType(PATTERN_TYPES.user)?.labels?.add_new_item, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Modal, {
			title: modalTitle || defaultModalTitle,
			onRequestClose: restProps.onClose,
			overlayClassName: className,
			focusOnMount: "firstContentElement",
			size: "small",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CreatePatternModalContents, { ...restProps })
		});
	}
	function CreatePatternModalContents({ confirmLabel = (0, _wordpress_i18n.__)("Add"), defaultCategories = [], content, onClose, onError, onSuccess, defaultSyncType = PATTERN_SYNC_TYPES.full, defaultTitle = "" }) {
		const [syncType, setSyncType] = (0, _wordpress_element.useState)(defaultSyncType);
		const [categoryTerms, setCategoryTerms] = (0, _wordpress_element.useState)(defaultCategories);
		const [title, setTitle] = (0, _wordpress_element.useState)(defaultTitle);
		const [isSaving, setIsSaving] = (0, _wordpress_element.useState)(false);
		const { createPattern } = unlock((0, _wordpress_data.useDispatch)(store));
		const { createErrorNotice } = (0, _wordpress_data.useDispatch)(_wordpress_notices.store);
		const { categoryMap, findOrCreateTerm } = useAddPatternCategory();
		async function onCreate(patternTitle, sync) {
			if (!title || isSaving) return;
			try {
				setIsSaving(true);
				const categories = await Promise.all(categoryTerms.map((termName) => findOrCreateTerm(termName)));
				onSuccess({
					pattern: await createPattern(patternTitle, sync, typeof content === "function" ? content() : content, categories),
					categoryId: PATTERN_DEFAULT_CATEGORY
				});
			} catch (error) {
				createErrorNotice(error.message, {
					type: "snackbar",
					id: "pattern-create"
				});
				onError?.();
			} finally {
				setIsSaving(false);
				setCategoryTerms([]);
				setTitle("");
			}
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
			onSubmit: (event) => {
				event.preventDefault();
				onCreate(title, syncType);
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
				direction: "column",
				gap: "lg",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.TextControl, {
						label: (0, _wordpress_i18n.__)("Name"),
						value: title,
						onChange: setTitle,
						placeholder: (0, _wordpress_i18n.__)("My pattern"),
						className: "patterns-create-modal__name-input"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CategorySelector, {
						categoryTerms,
						onChange: setCategoryTerms,
						categoryMap
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ToggleControl, {
						label: (0, _wordpress_i18n._x)("Synced", "pattern (singular)"),
						help: (0, _wordpress_i18n.__)("Sync this pattern across multiple locations."),
						checked: syncType === PATTERN_SYNC_TYPES.full,
						onChange: () => {
							setSyncType(syncType === PATTERN_SYNC_TYPES.full ? PATTERN_SYNC_TYPES.unsynced : PATTERN_SYNC_TYPES.full);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
						gap: "sm",
						justify: "end",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "tertiary",
							onClick: () => {
								onClose();
								setTitle("");
							},
							children: (0, _wordpress_i18n.__)("Cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "primary",
							type: "submit",
							"aria-disabled": !title || isSaving,
							isBusy: isSaving,
							children: confirmLabel
						})]
					})
				]
			})
		});
	}

// packages/patterns/build-module/components/duplicate-pattern-modal.mjs
	function getTermLabels(pattern, categories) {
		if (pattern.type !== PATTERN_TYPES.user) return categories.core?.filter((category) => pattern.categories?.includes(category.name)).map((category) => category.label);
		return categories.user?.filter((category) => pattern.wp_pattern_category?.includes(category.id)).map((category) => category.label);
	}
	function useDuplicatePatternProps({ pattern, onSuccess }) {
		const { createSuccessNotice } = (0, _wordpress_data.useDispatch)(_wordpress_notices.store);
		const categories = (0, _wordpress_data.useSelect)((select) => {
			const { getUserPatternCategories, getBlockPatternCategories } = select(_wordpress_core_data.store);
			return {
				core: getBlockPatternCategories(),
				user: getUserPatternCategories()
			};
		});
		if (!pattern) return null;
		return {
			content: pattern.content,
			defaultCategories: getTermLabels(pattern, categories),
			defaultSyncType: pattern.type !== PATTERN_TYPES.user ? PATTERN_SYNC_TYPES.unsynced : pattern.wp_pattern_sync_status || PATTERN_SYNC_TYPES.full,
			defaultTitle: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n._x)("%s (Copy)", "pattern"), typeof pattern.title === "string" ? pattern.title : pattern.title.raw),
			onSuccess: ({ pattern: newPattern }) => {
				createSuccessNotice((0, _wordpress_i18n.sprintf)((0, _wordpress_i18n._x)("\"%s\" duplicated.", "pattern"), newPattern.title.raw), {
					type: "snackbar",
					id: "patterns-create"
				});
				onSuccess?.({ pattern: newPattern });
			}
		};
	}
	function DuplicatePatternModal({ pattern, onClose, onSuccess }) {
		const duplicatedProps = useDuplicatePatternProps({
			pattern,
			onSuccess
		});
		if (!pattern) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CreatePatternModal, {
			modalTitle: (0, _wordpress_i18n.__)("Duplicate pattern"),
			confirmLabel: (0, _wordpress_i18n.__)("Duplicate"),
			onClose,
			onError: onClose,
			...duplicatedProps
		});
	}

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

// node_modules/.store/lower-case@2.0.2-5YZP5nczP5_f_8Vt5KBPjA/node_modules/lower-case/dist.es2015/index.js
/**
	* Lower case as a function.
	*/
	function lowerCase(str) {
		return str.toLowerCase();
	}

// node_modules/.store/no-case@3.0.4-R4Hzt6qn-erEsTak7ojDpg/node_modules/no-case/dist.es2015/index.js
	var DEFAULT_SPLIT_REGEXP = [/([a-z0-9])([A-Z])/g, /([A-Z])([A-Z][a-z])/g];
	var DEFAULT_STRIP_REGEXP = /[^A-Z0-9]+/gi;
	/**
	* Normalize the string into something other libraries can manipulate easier.
	*/
	function noCase(input, options) {
		if (options === void 0) options = {};
		var _a = options.splitRegexp, splitRegexp = _a === void 0 ? DEFAULT_SPLIT_REGEXP : _a, _b = options.stripRegexp, stripRegexp = _b === void 0 ? DEFAULT_STRIP_REGEXP : _b, _c = options.transform, transform = _c === void 0 ? lowerCase : _c, _d = options.delimiter, delimiter = _d === void 0 ? " " : _d;
		var result = replace(replace(input, splitRegexp, "$1\0$2"), stripRegexp, "\0");
		var start = 0;
		var end = result.length;
		while (result.charAt(start) === "\0") start++;
		while (result.charAt(end - 1) === "\0") end--;
		return result.slice(start, end).split("\0").map(transform).join(delimiter);
	}
	/**
	* Replace `re` in the input string with the replacement value.
	*/
	function replace(input, re, value) {
		if (re instanceof RegExp) return input.replace(re, value);
		return re.reduce(function(input, re) {
			return input.replace(re, value);
		}, input);
	}

// node_modules/.store/dot-case@3.0.4-hi-rLWlWmiZ169n4dWcbUA/node_modules/dot-case/dist.es2015/index.js
	function dotCase(input, options) {
		if (options === void 0) options = {};
		return noCase(input, __assign({ delimiter: "." }, options));
	}

// node_modules/.store/param-case@3.0.4-rdAht_VwpGpefPRylN2bTA/node_modules/param-case/dist.es2015/index.js
	function paramCase(input, options) {
		if (options === void 0) options = {};
		return dotCase(input, __assign({ delimiter: "-" }, options));
	}

// packages/patterns/build-module/components/create-template-part-modal/utils.mjs
	const EMPTY_ARRAY = [];
	function useExistingTemplateParts() {
		return (0, _wordpress_data.useSelect)((select) => select(_wordpress_core_data.store).getEntityRecords("postType", "wp_template_part", { per_page: -1 }) ?? EMPTY_ARRAY, []);
	}
	/**
	* Return a unique template part title based on
	* the given title and existing template parts.
	*
	* @param title         The original template part title.
	* @param templateParts The array of template part entities.
	* @return A unique template part title.
	*/
	function getUniqueTemplatePartTitle(title, templateParts) {
		const lowercaseTitle = title.toLowerCase();
		const existingTitles = templateParts.map((templatePart) => templatePart.title.rendered.toLowerCase());
		if (!existingTitles.includes(lowercaseTitle)) return title;
		let suffix = 2;
		while (existingTitles.includes(`${lowercaseTitle} ${suffix}`)) suffix++;
		return `${title} ${suffix}`;
	}
	/**
	* Get a valid slug for a template part.
	* Currently template parts only allow latin chars.
	* The fallback slug will receive suffix by default.
	*
	* @param title The template part title.
	* @return A valid template part slug.
	*/
	function getCleanTemplatePartSlug(title) {
		return paramCase(title).replace(/[^\w-]+/g, "") || "wp-custom-part";
	}

// packages/patterns/build-module/components/create-template-part-modal/index.mjs
	function getAreaRadioId(value, instanceId) {
		return `patterns-create-template-part-modal__area-option-${value}-${instanceId}`;
	}
	function getAreaRadioDescriptionId(value, instanceId) {
		return `patterns-create-template-part-modal__area-option-description-${value}-${instanceId}`;
	}
	/**
	* A React component that renders a modal for creating a template part. The modal displays a title and the contents for creating the template part.
	* @param props            The component props.
	* @param props.modalTitle
	*/
	function CreateTemplatePartModal({ modalTitle, ...restProps }) {
		const defaultModalTitle = (0, _wordpress_data.useSelect)((select) => select(_wordpress_core_data.store).getPostType("wp_template_part")?.labels?.add_new_item, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Modal, {
			title: modalTitle || defaultModalTitle,
			onRequestClose: restProps.closeModal,
			overlayClassName: "patterns-create-template-part-modal",
			focusOnMount: "firstContentElement",
			size: "medium",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CreateTemplatePartModalContents, { ...restProps })
		});
	}
	/**
	* Helper function to retrieve the corresponding icon by area name.
	*
	* @param {string} areaOrIconName The area name (e.g., 'header', 'navigation-overlay').
	*
	* @return {Object} The corresponding icon.
	*/
	const getTemplatePartIcon = (areaOrIconName) => {
		if ("header" === areaOrIconName) return header_default;
		else if ("footer" === areaOrIconName) return footer_default;
		else if ("sidebar" === areaOrIconName) return sidebar_default;
		else if ("navigation-overlay" === areaOrIconName) return navigation_overlay_default;
		return symbol_filled_default;
	};
	/**
	* A React component that renders the content of a model for creating a template part.
	*
	* @param {Object}   props                             - The component props.
	* @param {string}   [props.defaultArea=uncategorized] - The default area for the template part.
	* @param {Array}    [props.blocks=[]]                 - The blocks to be included in the template part.
	* @param {string}   [props.confirmLabel='Add']        - The label for the confirm button.
	* @param {Function} props.closeModal                  - Function to close the modal.
	* @param {Function} props.onCreate                    - Function to call when the template part is successfully created.
	* @param {Function} [props.onError]                   - Function to call when there is an error creating the template part.
	* @param {string}   [props.defaultTitle='']           - The default title for the template part.
	*/
	function CreateTemplatePartModalContents({ defaultArea = "uncategorized", blocks = [], confirmLabel = (0, _wordpress_i18n.__)("Add"), closeModal, onCreate, onError, defaultTitle = "" }) {
		const { createErrorNotice } = (0, _wordpress_data.useDispatch)(_wordpress_notices.store);
		const { saveEntityRecord } = (0, _wordpress_data.useDispatch)(_wordpress_core_data.store);
		const existingTemplateParts = useExistingTemplateParts();
		const [title, setTitle] = (0, _wordpress_element.useState)(defaultTitle);
		const [area, setArea] = (0, _wordpress_element.useState)(defaultArea);
		const [isSubmitting, setIsSubmitting] = (0, _wordpress_element.useState)(false);
		const instanceId = (0, _wordpress_compose.useInstanceId)(CreateTemplatePartModal);
		const defaultTemplatePartAreas = (0, _wordpress_data.useSelect)((select) => select(_wordpress_core_data.store).getCurrentTheme()?.default_template_part_areas, []);
		async function createTemplatePart() {
			if (!title || isSubmitting) return;
			try {
				setIsSubmitting(true);
				const uniqueTitle = getUniqueTemplatePartTitle(title, existingTemplateParts);
				const cleanSlug = getCleanTemplatePartSlug(uniqueTitle);
				await onCreate(await saveEntityRecord("postType", "wp_template_part", {
					slug: cleanSlug,
					title: uniqueTitle,
					content: (0, _wordpress_blocks.serialize)(blocks),
					area
				}, { throwOnError: true }));
			} catch (error) {
				const errorMessage = error instanceof Error && "code" in error && error.message && error.code !== "unknown_error" ? error.message : (0, _wordpress_i18n.__)("An error occurred while creating the template part.");
				createErrorNotice(errorMessage, { type: "snackbar" });
				onError?.();
			} finally {
				setIsSubmitting(false);
			}
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
			onSubmit: async (event) => {
				event.preventDefault();
				await createTemplatePart();
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.__experimentalVStack, {
				spacing: "4",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.TextControl, {
						label: (0, _wordpress_i18n.__)("Name"),
						value: title,
						onChange: setTitle,
						required: true
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
						className: "patterns-create-template-part-modal__area-fieldset",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.BaseControl.VisualLabel, {
							as: "legend",
							children: (0, _wordpress_i18n.__)("Area")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "patterns-create-template-part-modal__area-radio-group",
							children: (defaultTemplatePartAreas ?? []).map((item) => {
								const icon = getTemplatePartIcon(item.icon);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "patterns-create-template-part-modal__area-radio-wrapper",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "radio",
											id: getAreaRadioId(item.area, instanceId),
											name: `patterns-create-template-part-modal__area-${instanceId}`,
											value: item.area,
											checked: area === item.area,
											onChange: () => {
												setArea(item.area);
											},
											"aria-describedby": getAreaRadioDescriptionId(item.area, instanceId)
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Icon, {
											icon,
											className: "patterns-create-template-part-modal__area-radio-icon"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
											htmlFor: getAreaRadioId(item.area, instanceId),
											className: "patterns-create-template-part-modal__area-radio-label",
											children: item.label
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Icon, {
											icon: check_default,
											className: "patterns-create-template-part-modal__area-radio-checkmark"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "patterns-create-template-part-modal__area-radio-description",
											id: getAreaRadioDescriptionId(item.area, instanceId),
											children: item.description
										})
									]
								}, item.area);
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.__experimentalHStack, {
						justify: "right",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "tertiary",
							onClick: () => {
								closeModal();
							},
							children: (0, _wordpress_i18n.__)("Cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "primary",
							type: "submit",
							"aria-disabled": !title || isSubmitting,
							isBusy: isSubmitting,
							children: confirmLabel
						})]
					})
				]
			})
		});
	}

// packages/patterns/build-module/components/rename-pattern-modal.mjs
	function RenamePatternModal({ onClose, onError, onSuccess, pattern, ...props }) {
		const originalName = (0, _wordpress_html_entities.decodeEntities)(pattern.title);
		const [name, setName] = (0, _wordpress_element.useState)(originalName);
		const [isSaving, setIsSaving] = (0, _wordpress_element.useState)(false);
		const { editEntityRecord, __experimentalSaveSpecifiedEntityEdits: saveSpecifiedEntityEdits } = (0, _wordpress_data.useDispatch)(_wordpress_core_data.store);
		const { createSuccessNotice, createErrorNotice } = (0, _wordpress_data.useDispatch)(_wordpress_notices.store);
		const onRename = async (event) => {
			event.preventDefault();
			if (!name || name === pattern.title || isSaving) return;
			try {
				await editEntityRecord("postType", pattern.type, pattern.id, { title: name });
				setIsSaving(true);
				setName("");
				onClose?.();
				const savedRecord = await saveSpecifiedEntityEdits("postType", pattern.type, pattern.id, ["title"], { throwOnError: true });
				onSuccess?.(savedRecord);
				createSuccessNotice((0, _wordpress_i18n.__)("Pattern renamed"), {
					type: "snackbar",
					id: "pattern-update"
				});
			} catch (error) {
				onError?.();
				const restError = error;
				const errorMessage = restError.message && restError.code !== "unknown_error" ? restError.message : (0, _wordpress_i18n.__)("An error occurred while renaming the pattern.");
				createErrorNotice(errorMessage, {
					type: "snackbar",
					id: "pattern-update"
				});
			} finally {
				setIsSaving(false);
				setName("");
			}
		};
		const onRequestClose = () => {
			onClose?.();
			setName("");
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Modal, {
			title: (0, _wordpress_i18n.__)("Rename"),
			...props,
			onRequestClose: onClose,
			focusOnMount: "firstContentElement",
			size: "small",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
				onSubmit: onRename,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
					direction: "column",
					gap: "lg",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.TextControl, {
						label: (0, _wordpress_i18n.__)("Name"),
						value: name,
						onChange: setName,
						required: true
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
						gap: "sm",
						justify: "end",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "tertiary",
							onClick: onRequestClose,
							children: (0, _wordpress_i18n.__)("Cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "primary",
							type: "submit",
							children: (0, _wordpress_i18n.__)("Save")
						})]
					})]
				})
			})
		});
	}

// packages/patterns/build-module/components/pattern-convert-button.mjs
/**
	* Menu control to convert block(s) to a pattern block.
	*
	* @return The menu control or null.
	*/
	function PatternConvertButton({ clientIds, rootClientId, closeBlockSettingsMenu }) {
		const { createSuccessNotice } = (0, _wordpress_data.useDispatch)(_wordpress_notices.store);
		const { replaceBlocks, updateBlockAttributes } = (0, _wordpress_data.useDispatch)(_wordpress_block_editor.store);
		const { setEditingPattern } = unlock((0, _wordpress_data.useDispatch)(store));
		const [isModalOpen, setIsModalOpen] = (0, _wordpress_element.useState)(false);
		const { getBlockAttributes } = (0, _wordpress_data.useSelect)(_wordpress_block_editor.store);
		const canConvert = (0, _wordpress_data.useSelect)((select) => {
			const { canUser } = select(_wordpress_core_data.store);
			const { getBlocksByClientId, canInsertBlockType, getBlockRootClientId } = select(_wordpress_block_editor.store);
			const rootId = rootClientId || (clientIds.length > 0 ? getBlockRootClientId(clientIds[0]) : void 0);
			const blocks = getBlocksByClientId(clientIds) ?? [];
			const hasReusableBlockSupport = (blockName) => {
				const blockType = (0, _wordpress_blocks.getBlockType)(blockName);
				const hasParent = blockType && "parent" in blockType;
				return (0, _wordpress_blocks.hasBlockSupport)(blockName, "reusable", !hasParent);
			};
			const isSyncedPattern = blocks.length === 1 && blocks[0] && (0, _wordpress_blocks.isReusableBlock)(blocks[0]) && !!select(_wordpress_core_data.store).getEntityRecord("postType", "wp_block", blocks[0].attributes.ref);
			return !(blocks.length === 1 && blocks?.[0]?.attributes?.metadata?.patternName) && !isSyncedPattern && canInsertBlockType("core/block", rootId) && blocks.every((block) => !!block && block.isValid && hasReusableBlockSupport(block.name)) && !!canUser("create", {
				kind: "postType",
				name: "wp_block"
			});
		}, [clientIds, rootClientId]);
		const { getBlocksByClientId } = (0, _wordpress_data.useSelect)(_wordpress_block_editor.store);
		const getContent = (0, _wordpress_element.useCallback)(() => (0, _wordpress_blocks.serialize)(getBlocksByClientId(clientIds)), [getBlocksByClientId, clientIds]);
		if (!canConvert) return null;
		const handleSuccess = ({ pattern }) => {
			if (pattern.wp_pattern_sync_status === PATTERN_SYNC_TYPES.unsynced) {
				if (clientIds?.length === 1) {
					const existingAttributes = getBlockAttributes(clientIds[0]);
					updateBlockAttributes(clientIds[0], { metadata: {
						...existingAttributes?.metadata ? existingAttributes.metadata : {},
						patternName: `core/block/${pattern.id}`,
						name: pattern.title.raw
					} });
				}
			} else {
				const newBlock = (0, _wordpress_blocks.createBlock)("core/block", { ref: pattern.id });
				replaceBlocks(clientIds, newBlock);
				setEditingPattern(newBlock.clientId, true);
			}
			createSuccessNotice(pattern.wp_pattern_sync_status === PATTERN_SYNC_TYPES.unsynced ? (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Unsynced pattern created: %s"), pattern.title.raw) : (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Synced pattern created: %s"), pattern.title.raw), {
				type: "snackbar",
				id: "convert-to-pattern-success"
			});
			setIsModalOpen(false);
			closeBlockSettingsMenu();
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.MenuItem, {
			icon: symbol_default,
			onClick: () => setIsModalOpen(true),
			"aria-expanded": isModalOpen,
			"aria-haspopup": "dialog",
			children: (0, _wordpress_i18n.__)("Create pattern")
		}), isModalOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CreatePatternModal, {
			content: getContent,
			onSuccess: (pattern) => {
				handleSuccess(pattern);
			},
			onError: () => {
				setIsModalOpen(false);
			},
			onClose: () => {
				setIsModalOpen(false);
			}
		})] });
	}

// packages/patterns/build-module/components/patterns-manage-button.mjs
	function PatternsManageButton({ clientId, onClose }) {
		const [showConfirmDialog, setShowConfirmDialog] = (0, _wordpress_element.useState)(false);
		const { attributes, canDetach, isVisible, managePatternsUrl, isSyncedPattern, isUnsyncedPattern, canEdit } = (0, _wordpress_data.useSelect)((select) => {
			const { canRemoveBlock, getBlock, canEditBlock } = select(_wordpress_block_editor.store);
			const { canUser } = select(_wordpress_core_data.store);
			const block = getBlock(clientId);
			const _isUnsyncedPattern = !!block?.attributes?.metadata?.patternName;
			const _isSyncedPattern = !!block && (0, _wordpress_blocks.isReusableBlock)(block) && !!canUser("read", {
				kind: "postType",
				name: "wp_block",
				id: block.attributes.ref
			});
			return {
				attributes: block.attributes,
				canEdit: canEditBlock(clientId),
				canDetach: _isUnsyncedPattern || _isSyncedPattern && canRemoveBlock(clientId),
				isUnsyncedPattern: _isUnsyncedPattern,
				isSyncedPattern: _isSyncedPattern,
				isVisible: _isUnsyncedPattern || _isSyncedPattern,
				managePatternsUrl: canUser("create", {
					kind: "postType",
					name: "wp_template"
				}) ? (0, _wordpress_url.addQueryArgs)("site-editor.php", { p: "/pattern" }) : (0, _wordpress_url.addQueryArgs)("edit.php", { post_type: "wp_block" })
			};
		}, [clientId]);
		const { updateBlockAttributes } = (0, _wordpress_data.useDispatch)(_wordpress_block_editor.store);
		const { convertSyncedPatternToStatic } = unlock((0, _wordpress_data.useDispatch)(store));
		if (!isVisible || !canEdit) return null;
		const handleDetach = () => {
			if (isSyncedPattern) convertSyncedPatternToStatic(clientId);
			if (isUnsyncedPattern) {
				const { patternName, ...attributesWithoutPatternName } = attributes?.metadata ?? {};
				updateBlockAttributes(clientId, { metadata: attributesWithoutPatternName });
			}
			onClose?.();
			setShowConfirmDialog(false);
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [canDetach && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.MenuItem, {
			onClick: () => setShowConfirmDialog(true),
			children: (0, _wordpress_i18n.__)("Detach")
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.__experimentalConfirmDialog, {
			isOpen: showConfirmDialog,
			onConfirm: handleDetach,
			onCancel: () => setShowConfirmDialog(false),
			confirmButtonText: (0, _wordpress_i18n.__)("Detach"),
			size: "medium",
			title: (0, _wordpress_i18n.__)("Detach pattern?"),
			__experimentalHideHeader: false,
			children: isSyncedPattern ? (0, _wordpress_i18n.__)("The blocks will be separated from the original pattern and will be fully editable. Future changes to the pattern will not apply here.") : (0, _wordpress_i18n.__)("Blocks will no longer be associated with this pattern and will be fully editable.")
		})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.MenuItem, {
			href: managePatternsUrl,
			children: (0, _wordpress_i18n.__)("Manage patterns")
		})] });
	}

// packages/patterns/build-module/components/index.mjs
	function PatternsMenuItems({ rootClientId }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.BlockSettingsMenuControls, { children: ({ selectedClientIds, onClose }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PatternConvertButton, {
			clientIds: selectedClientIds,
			rootClientId,
			closeBlockSettingsMenu: onClose
		}), selectedClientIds.length === 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PatternsManageButton, {
			clientId: selectedClientIds[0],
			onClose
		})] }) });
	}

// packages/patterns/build-module/components/rename-pattern-category-modal.mjs
	function RenamePatternCategoryModal({ category, existingCategories, onClose, onError, onSuccess, ...props }) {
		const id = (0, _wordpress_element.useId)();
		const textControlRef = (0, _wordpress_element.useRef)(void 0);
		const [name, setName] = (0, _wordpress_element.useState)((0, _wordpress_html_entities.decodeEntities)(category.name));
		const [isSaving, setIsSaving] = (0, _wordpress_element.useState)(false);
		const [validationMessage, setValidationMessage] = (0, _wordpress_element.useState)(false);
		const validationMessageId = validationMessage ? `patterns-rename-pattern-category-modal__validation-message-${id}` : void 0;
		const { saveEntityRecord, invalidateResolution } = (0, _wordpress_data.useDispatch)(_wordpress_core_data.store);
		const { createErrorNotice, createSuccessNotice } = (0, _wordpress_data.useDispatch)(_wordpress_notices.store);
		const onChange = (newName) => {
			if (validationMessage) setValidationMessage(void 0);
			setName(newName);
		};
		const onSave = async (event) => {
			event.preventDefault();
			if (isSaving) return;
			if (!name || name === category.name) {
				const message = (0, _wordpress_i18n.__)("Please enter a new name for this category.");
				(0, _wordpress_a11y.speak)(message, "assertive");
				setValidationMessage(message);
				textControlRef.current?.focus();
				return;
			}
			if (existingCategories.patternCategories.find((existingCategory) => {
				return existingCategory.id !== category.id && existingCategory.label.toLowerCase() === name.toLowerCase();
			})) {
				const message = (0, _wordpress_i18n.__)("This category already exists. Please use a different name.");
				(0, _wordpress_a11y.speak)(message, "assertive");
				setValidationMessage(message);
				textControlRef.current?.focus();
				return;
			}
			try {
				setIsSaving(true);
				const savedRecord = await saveEntityRecord("taxonomy", CATEGORY_SLUG, {
					id: category.id,
					slug: category.slug,
					name
				});
				invalidateResolution("getUserPatternCategories");
				onSuccess?.(savedRecord);
				onClose();
				createSuccessNotice((0, _wordpress_i18n.__)("Pattern category renamed."), {
					type: "snackbar",
					id: "pattern-category-update"
				});
			} catch (error) {
				onError?.();
				createErrorNotice(error.message, {
					type: "snackbar",
					id: "pattern-category-update"
				});
			} finally {
				setIsSaving(false);
				setName("");
			}
		};
		const onRequestClose = () => {
			onClose();
			setName("");
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Modal, {
			title: (0, _wordpress_i18n.__)("Rename"),
			onRequestClose,
			...props,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
				onSubmit: onSave,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
					direction: "column",
					gap: "lg",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
						direction: "column",
						gap: "sm",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.TextControl, {
							ref: textControlRef,
							label: (0, _wordpress_i18n.__)("Name"),
							value: name,
							onChange,
							"aria-describedby": validationMessageId,
							required: true
						}), validationMessage && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "patterns-rename-pattern-category-modal__validation-message",
							id: validationMessageId,
							children: validationMessage
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
						gap: "sm",
						justify: "end",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "tertiary",
							onClick: onRequestClose,
							children: (0, _wordpress_i18n.__)("Cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "primary",
							type: "submit",
							"aria-disabled": !name || name === category.name || isSaving,
							isBusy: isSaving,
							children: (0, _wordpress_i18n.__)("Save")
						})]
					})]
				})
			})
		});
	}

// packages/patterns/build-module/components/allow-overrides-modal.mjs
	function AllowOverridesModal({ placeholder, initialName = "", onClose, onSave }) {
		const [editedBlockName, setEditedBlockName] = (0, _wordpress_element.useState)(initialName);
		const descriptionId = (0, _wordpress_element.useId)();
		const isNameValid = !!editedBlockName.trim();
		const handleSubmit = () => {
			if (editedBlockName !== initialName) {
				const message = (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Block name changed to: \"%s\"."), editedBlockName);
				(0, _wordpress_a11y.speak)(message, "assertive");
			}
			onSave(editedBlockName);
			onClose();
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Modal, {
			title: (0, _wordpress_i18n.__)("Enable overrides"),
			onRequestClose: onClose,
			focusOnMount: "firstContentElement",
			aria: { describedby: descriptionId },
			size: "small",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
				onSubmit: (event) => {
					event.preventDefault();
					if (!isNameValid) return;
					handleSubmit();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
					direction: "column",
					gap: "xl",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Text, {
							id: descriptionId,
							children: (0, _wordpress_i18n.__)("Overrides are changes you make to a block within a synced pattern instance. Use overrides to customize a synced pattern instance to suit its new context. Name this block to specify an override.")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.TextControl, {
							value: editedBlockName,
							label: (0, _wordpress_i18n.__)("Name"),
							help: (0, _wordpress_i18n.__)("For example, if you are creating a recipe pattern, you use \"Recipe Title\", \"Recipe Description\", etc."),
							placeholder,
							onChange: setEditedBlockName
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
							gap: "sm",
							justify: "end",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
								__next40pxDefaultSize: true,
								variant: "tertiary",
								onClick: onClose,
								children: (0, _wordpress_i18n.__)("Cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
								__next40pxDefaultSize: true,
								"aria-disabled": !isNameValid,
								variant: "primary",
								type: "submit",
								children: (0, _wordpress_i18n.__)("Enable")
							})]
						})
					]
				})
			})
		});
	}
	function DisallowOverridesModal({ onClose, onSave }) {
		const descriptionId = (0, _wordpress_element.useId)();
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Modal, {
			title: (0, _wordpress_i18n.__)("Disable overrides"),
			onRequestClose: onClose,
			aria: { describedby: descriptionId },
			size: "small",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
				onSubmit: (event) => {
					event.preventDefault();
					onSave();
					onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
					direction: "column",
					gap: "xl",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Text, {
						id: descriptionId,
						children: (0, _wordpress_i18n.__)("Are you sure you want to disable overrides? Disabling overrides will revert all applied overrides for this block throughout instances of this pattern.")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Stack, {
						gap: "sm",
						justify: "end",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "tertiary",
							onClick: onClose,
							children: (0, _wordpress_i18n.__)("Cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
							__next40pxDefaultSize: true,
							variant: "primary",
							type: "submit",
							children: (0, _wordpress_i18n.__)("Disable")
						})]
					})]
				})
			})
		});
	}

// packages/patterns/build-module/components/pattern-overrides-controls.mjs
	function PatternOverridesControls({ attributes, setAttributes, name: blockName }) {
		const controlId = (0, _wordpress_element.useId)();
		const [showAllowOverridesModal, setShowAllowOverridesModal] = (0, _wordpress_element.useState)(false);
		const [showDisallowOverridesModal, setShowDisallowOverridesModal] = (0, _wordpress_element.useState)(false);
		const hasName = !!attributes.metadata?.name;
		const defaultBindings = attributes.metadata?.bindings?.__default;
		const hasOverrides = hasName && defaultBindings?.source === "core/pattern-overrides";
		const isConnectedToOtherSources = defaultBindings?.source && defaultBindings.source !== "core/pattern-overrides";
		const { updateBlockBindings } = (0, _wordpress_block_editor.useBlockBindingsUtils)();
		function updateBindings(isChecked, customName) {
			if (customName) setAttributes({ metadata: {
				...attributes.metadata,
				name: customName
			} });
			updateBlockBindings({ __default: isChecked ? { source: PATTERN_OVERRIDES_BINDING_SOURCE } : void 0 });
		}
		if (isConnectedToOtherSources) return null;
		const hasUnsupportedImageAttributes = blockName === "core/image" && !!attributes.href?.length;
		const helpText = !hasOverrides && hasUnsupportedImageAttributes ? (0, _wordpress_i18n.__)(`Overrides currently don't support image links. Remove the link first before enabling overrides.`) : (0, _wordpress_i18n.__)("Allow changes to this block throughout instances of this pattern.");
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.InspectorControls, {
				group: "advanced",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.BaseControl, {
					id: controlId,
					label: (0, _wordpress_i18n.__)("Overrides"),
					help: helpText,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
						__next40pxDefaultSize: true,
						className: "pattern-overrides-control__allow-overrides-button",
						variant: "secondary",
						"aria-haspopup": "dialog",
						onClick: () => {
							if (hasOverrides) setShowDisallowOverridesModal(true);
							else setShowAllowOverridesModal(true);
						},
						disabled: !hasOverrides && hasUnsupportedImageAttributes,
						accessibleWhenDisabled: true,
						children: hasOverrides ? (0, _wordpress_i18n.__)("Disable overrides") : (0, _wordpress_i18n.__)("Enable overrides")
					})
				})
			}),
			showAllowOverridesModal && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AllowOverridesModal, {
				initialName: attributes.metadata?.name,
				onClose: () => setShowAllowOverridesModal(false),
				onSave: (newName) => {
					updateBindings(true, newName);
				}
			}),
			showDisallowOverridesModal && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DisallowOverridesModal, {
				onClose: () => setShowDisallowOverridesModal(false),
				onSave: () => updateBindings(false)
			})
		] });
	}

// packages/patterns/build-module/components/reset-overrides-control.mjs
	const CONTENT = "content";
	function ResetOverridesControl(props) {
		const name = props.attributes.metadata?.name;
		const registry = (0, _wordpress_data.useRegistry)();
		const isOverridden = (0, _wordpress_data.useSelect)((select) => {
			if (!name) return;
			const { getBlockAttributes, getBlockParentsByBlockName } = select(_wordpress_block_editor.store);
			const [patternClientId] = getBlockParentsByBlockName(props.clientId, "core/block", true);
			if (!patternClientId) return;
			const overrides = getBlockAttributes(patternClientId)[CONTENT];
			if (!overrides) return;
			return overrides.hasOwnProperty(name);
		}, [props.clientId, name]);
		function onClick() {
			const { getBlockAttributes, getBlockParentsByBlockName } = registry.select(_wordpress_block_editor.store);
			const [patternClientId] = getBlockParentsByBlockName(props.clientId, "core/block", true);
			if (!patternClientId) return;
			const overrides = getBlockAttributes(patternClientId)[CONTENT];
			if (!overrides.hasOwnProperty(name)) return;
			const { updateBlockAttributes, __unstableMarkLastChangeAsPersistent } = registry.dispatch(_wordpress_block_editor.store);
			__unstableMarkLastChangeAsPersistent();
			let newOverrides = { ...overrides };
			delete newOverrides[name];
			if (!Object.keys(newOverrides).length) newOverrides = void 0;
			updateBlockAttributes(patternClientId, { [CONTENT]: newOverrides });
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_block_editor.__unstableBlockToolbarLastItem, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ToolbarGroup, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ToolbarButton, {
			onClick,
			disabled: !isOverridden,
			children: (0, _wordpress_i18n.__)("Reset")
		}) }) });
	}

// packages/patterns/build-module/private-apis.mjs
	const privateApis = {};
	lock(privateApis, {
		OverridesPanel,
		CreatePatternModal,
		CreatePatternModalContents,
		DuplicatePatternModal,
		CreateTemplatePartModal,
		CreateTemplatePartModalContents,
		isOverridableBlock,
		useDuplicatePatternProps,
		RenamePatternModal,
		PatternsMenuItems,
		RenamePatternCategoryModal,
		PatternOverridesControls,
		ResetOverridesControl,
		useAddPatternCategory,
		PATTERN_TYPES,
		PATTERN_DEFAULT_CATEGORY,
		PATTERN_USER_CATEGORY,
		EXCLUDED_PATTERN_SOURCES,
		PATTERN_SYNC_TYPES
	});

exports.privateApis = privateApis;
exports.store = store;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).patterns = exports;
return exports;
})({}, window.wp.data, window.wp.blocks, window.wp.coreData, window.wp.blockEditor, window.wp.privateApis, window.wp.components, window.wp.element, window.wp.i18n, window.ReactJSXRuntime, window.React, window.wp.primitives, window.wp.compose, window.wp.a11y, window.wp.notices, window.wp.htmlEntities, window.wp.url);
//# sourceMappingURL=index.js.map