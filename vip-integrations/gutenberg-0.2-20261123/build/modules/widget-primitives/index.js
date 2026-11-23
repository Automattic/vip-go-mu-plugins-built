// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// packages/widget-primitives/build-module/tools/get-lazy-widget-component/get-lazy-widget-component.mjs
var import_element = require_element();
function isValidWidgetModule(module) {
	return typeof module === "object" && module !== null && "default" in module && typeof module.default === "function";
}
const componentCache = /* @__PURE__ */ new Map();
function getLazyWidgetComponent(renderModule, resolveWidgetModule) {
	const cached = componentCache.get(renderModule);
	if (cached) return cached;
	const lazyComponent = (0, import_element.lazy)(async () => {
		const module = await resolveWidgetModule(renderModule);
		if (!isValidWidgetModule(module)) throw new Error(`Invalid widget module: ${renderModule}`);
		return module;
	});
	componentCache.set(renderModule, lazyComponent);
	return lazyComponent;
}

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/widget-primitives/build-module/widget-host/widget-host.mjs
var import_jsx_runtime = require_jsx_runtime();
const WidgetHostContext = (0, import_element.createContext)({});
/**
* Provides host capabilities to the widgets below it. Merges over the
* inherited value, so capabilities can layer per subtree.
*
* @param {WidgetHostProviderProps} props Component props.
*/
function WidgetHostProvider({ value, children }) {
	const inherited = (0, import_element.useContext)(WidgetHostContext);
	const merged = (0, import_element.useMemo)(() => ({
		...inherited,
		...value
	}), [inherited, value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetHostContext.Provider, {
		value: merged,
		children
	});
}
/**
* Reads the host capabilities. Defaults to `{}`: consumers guard each
* capability and fall back to host-agnostic behavior when it is absent.
*/
function useWidgetHost() {
	return (0, import_element.useContext)(WidgetHostContext);
}

// packages/widget-primitives/build-module/widget-host/widget-actions-collector.mjs
const WidgetActionsCollectorContext = (0, import_element.createContext)(null);
function useWidgetActionsCollector() {
	return (0, import_element.useContext)(WidgetActionsCollectorContext);
}
function joinDeclarations(declarations) {
	const byId = /* @__PURE__ */ new Map();
	for (const actions of declarations.values()) for (const action of actions) byId.set(action.id, action);
	return [...byId.values()];
}
/**
* Joins what every `useWidgetActions` call under one render declares, so
* the host always receives the instance's whole list.
*
* @param {Object}    props          Component props.
* @param {ReactNode} props.children The widget's render.
*/
function WidgetActionsCollector({ children }) {
	const hostDeclare = useWidgetHost().actions?.declare;
	const [declarations] = (0, import_element.useState)(() => /* @__PURE__ */ new Map());
	const value = (0, import_element.useMemo)(() => ({
		hosted: !!hostDeclare,
		declare: (callId, actions) => {
			if (actions.length > 0) declarations.set(callId, actions);
			else declarations.delete(callId);
			hostDeclare?.(joinDeclarations(declarations));
		}
	}), [hostDeclare, declarations]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetActionsCollectorContext.Provider, {
		value,
		children
	});
}

// packages/widget-primitives/build-module/widget-identity/widget-identity.mjs
const WidgetIdentityContext = (0, import_element.createContext)({});
/**
* Provides widget-type identity to the render below it. Mounted by
* `WidgetRender` from the `widgetType` it already holds; not part of the
* public package surface.
*
* @param {WidgetIdentityProviderProps} props Component props.
*/
function WidgetIdentityProvider({ value, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetIdentityContext.Provider, {
		value,
		children
	});
}
/**
* Reads the identity of the widget type this render belongs to. Defaults
* to `{}` when no provider is above: consumers guard each field.
*/
function useWidgetIdentity() {
	return (0, import_element.useContext)(WidgetIdentityContext);
}

// packages/widget-primitives/build-module/components/widget-render/widget-render.mjs
function WidgetRender({ widgetType, attributes, setAttributes, resolveWidgetModule }) {
	const WidgetComponent = getLazyWidgetComponent(widgetType.renderModule, resolveWidgetModule);
	const identity = (0, import_element.useMemo)(() => ({ title: widgetType.title }), [widgetType.title]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetIdentityProvider, {
		value: identity,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetActionsCollector, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetComponent, {
			attributes,
			setAttributes
		}) })
	});
}

// packages/widget-primitives/build-module/widget-host/host-link.mjs
/**
* Anchor that mounts the host router's link when the target is one of the
* host's own routes, and a plain anchor otherwise. A `download`, or a
* `_blank` target, keeps the plain anchor: a new document leaves the app.
*
* Composes through the `render` prop of a UI link, which merges its own
* anchor props in.
*
* @param {HostLinkProps} props Component props.
*/
const HostLink = (0, import_element.forwardRef)(function UnforwardedHostLink({ href, children, ...props }, ref) {
	const { links } = useWidgetHost();
	const { download, target } = props;
	const opensNewDocument = download !== void 0 && download !== false || /^_blank$/i.test(target ?? "");
	const path = links && !opensNewDocument ? links.match(href) : null;
	if (links && path !== null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(links.Link, {
		ref,
		path,
		...props,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		ref,
		href,
		...props,
		children
	});
});

// packages/widget-primitives/build-module/hooks/use-widget-actions.mjs
const NO_ACTIONS = [];
function isSameAction(a, b) {
	const left = a;
	const right = b;
	const keys = Object.keys(left);
	return keys.length === Object.keys(right).length && keys.every((key) => Object.is(left[key], right[key]) || typeof left[key] === "function" && typeof right[key] === "function");
}
function isSameList(a, b) {
	return a.length === b.length && a.every((action, index) => isSameAction(action, b[index]));
}
/**
* Declares the actions a mounted widget wants its host to place. The list
* is this call's whole set: leave out what does not apply. Calls from
* several components of one widget compose. The list is compared by value,
* so it can be written inline, and a callback always runs its latest
* version.
*
* @param {WidgetRuntimeAction[]} actions The actions to place.
* @return {boolean} Whether the host places them.
*/
function useWidgetActions(actions) {
	const hostDeclare = useWidgetHost().actions?.declare;
	const collector = useWidgetActionsCollector();
	const callId = (0, import_element.useId)();
	const declare = (0, import_element.useMemo)(() => collector ? (next) => collector.declare(callId, next) : hostDeclare, [
		collector,
		hostDeclare,
		callId
	]);
	const latestRef = (0, import_element.useRef)(actions);
	const declaredRef = (0, import_element.useRef)(null);
	(0, import_element.useLayoutEffect)(() => {
		latestRef.current = actions;
		if (!declare || declaredRef.current && isSameList(declaredRef.current, actions)) return;
		declaredRef.current = actions;
		declare(actions.map((action) => {
			if (!("callback" in action)) return action;
			return {
				...action,
				callback: () => {
					const current = latestRef.current.find(({ id }) => id === action.id);
					return current && "callback" in current ? current.callback() : void 0;
				}
			};
		}));
	});
	(0, import_element.useLayoutEffect)(() => () => {
		declaredRef.current = null;
		declare?.(NO_ACTIONS);
	}, [declare]);
	return collector ? collector.hosted : !!hostDeclare;
}

// packages/widget-primitives/build-module/field-types/field-types.mjs
const FIELD_TYPE_NAME_PATTERN = /^[a-z][a-z0-9-]*(\/[a-z][a-z0-9-]*)?$/;
const fieldTypes = /* @__PURE__ */ new Map();
/**
* Registers a field type.
*
* First registration wins: a name that is
* already registered, or is not a valid name, is ignored.
*
* @param fieldType Field type definition to register.
* @return The registered definition, or `undefined` when ignored.
*/
function registerFieldType(fieldType) {
	if (!FIELD_TYPE_NAME_PATTERN.test(fieldType.name) || fieldTypes.has(fieldType.name)) return;
	fieldTypes.set(fieldType.name, fieldType);
	return fieldType;
}
/**
* Converts fields referencing registered field types into
* plain DataViews fields: default settings are merged into the field's
* own properties (giving the field precedence), `type` is updated to
* the `baseType` from the definition, and `isValid` is combined rule by rule.
*
* Fields with an unregistered `type` remain unchanged, maintaining DataViews' original types and handling of unknown types.
*
* @param fields - The fields to be resolved.
* @return Fields with registered types converted into specific properties per field.
*/
function resolveFields(fields) {
	return fields.map((field) => {
		const fieldType = field.type ? fieldTypes.get(field.type) : void 0;
		if (!fieldType) return field;
		const { name, baseType, isValid, ...fieldDefaults } = fieldType;
		const { type, isValid: fieldIsValid, ...rest } = field;
		return {
			...fieldDefaults,
			...rest,
			type: baseType,
			...isValid || fieldIsValid ? { isValid: {
				...isValid,
				...fieldIsValid
			} } : {}
		};
	});
}

// packages/widget-primitives/build-module/icon-resolver/icon-resolver.mjs
let iconResolver;
/**
* Registers the icon resolver. First registration wins.
*
* @param resolver Resolver turning a reference into a renderable icon.
* @return The registered resolver, or `undefined` when ignored.
*/
function registerIconResolver(resolver) {
	if (iconResolver) return;
	iconResolver = resolver;
	return resolver;
}
/**
* Resolves an icon reference through the registered resolver. An
* unresolvable reference degrades to `null` rather than breaking.
*
* @param reference Icon reference to resolve.
* @return The renderable icon, or `null`.
*/
async function resolveIcon(reference) {
	if (!iconResolver) return null;
	try {
		return await iconResolver(reference);
	} catch {
		return null;
	}
}

// packages/widget-primitives/build-module/hooks/use-widget-types.mjs
const pendingIcon = (0, import_element.createElement)("svg", { viewBox: "0 0 24 24" });
/**
* Emitted actions carry only renderable icons: a wire reference holds the
* slot with the stand-in while it resolves; anything else non-renderable
* drops.
*
* @param actions     Declared actions, from the record or the module.
* @param holdPending Whether wire references resolve later (record actions).
*/
function withRenderableIcons(actions, holdPending) {
	return actions.map(({ icon, ...action }) => {
		if ((0, import_element.isValidElement)(icon)) return {
			...action,
			icon
		};
		if (holdPending && typeof icon === "string") return {
			...action,
			icon: pendingIcon
		};
		return action;
	});
}
function mergeAttributes(recordAttributes, moduleAttributes) {
	if (!recordAttributes) return moduleAttributes;
	if (!moduleAttributes) return recordAttributes;
	const moduleById = new Map(moduleAttributes.map((attribute) => [attribute.id, attribute]));
	const recordIds = new Set(recordAttributes.map((attribute) => attribute.id));
	return [...recordAttributes.map((attribute) => {
		const moduleAttribute = moduleById.get(attribute.id);
		if (!moduleAttribute?.isValid || !attribute.isValid) return {
			...moduleAttribute,
			...attribute
		};
		return {
			...moduleAttribute,
			...attribute,
			isValid: {
				...moduleAttribute.isValid,
				...attribute.isValid
			}
		};
	}), ...moduleAttributes.filter((attribute) => !recordIds.has(attribute.id))];
}
const DEFAULT_API_VERSION = 1;
function recordOverlay(record) {
	return {
		name: record.name,
		renderModule: record.render_module ?? "",
		...record.presentation ? { presentation: record.presentation } : {},
		...record.category ? { category: record.category } : {},
		...record.description ? { description: record.description } : {},
		...record.help ? { help: record.help } : {},
		...record.keywords ? { keywords: record.keywords } : {}
	};
}
/**
* Resolves widget types from host-supplied records.
*
* For each record it dynamically imports `widget_module` and merges the
* module's default export with the runtime fields (`name`, `renderModule`).
* A record without a metadata module resolves from its own fields alone,
* so a widget declared entirely by its manifest needs no module stub.
* A record's `attributes` lead the module's, merged by `id` with `isValid`
* merged rule by rule; the merged schema passes through `resolveFields`, so
* attributes referencing registered field types reach hosts as plain
* DataViews fields. Icon references resolve through the registered icon
* resolver, off the loading flag: widget types emit as soon as their modules
* land, and each resolved icon patches in afterwards. Action icon references
* resolve the same way. A record's `example` stands in when the module
* declares none.
* Pass `null`/`undefined` while records are still loading.
*
* @param records Host-supplied records, or `null`/`undefined` while loading.
*/
function useWidgetTypes(records) {
	const [widgetTypes, setWidgetTypes] = (0, import_element.useState)([]);
	const [isResolvingWidgetTypes, setIsResolvingWidgetTypes] = (0, import_element.useState)(true);
	(0, import_element.useEffect)(() => {
		if (records === null || records === void 0) {
			setIsResolvingWidgetTypes(true);
			return;
		}
		if (records.length === 0) {
			setWidgetTypes([]);
			setIsResolvingWidgetTypes(false);
			return;
		}
		let cancelled = false;
		setIsResolvingWidgetTypes(true);
		Promise.all(records.map(async (record) => {
			if (!record.widget_module) {
				if (!record.render_module) return null;
				return {
					apiVersion: DEFAULT_API_VERSION,
					title: record.title ?? record.name,
					...record.attributes ? { attributes: resolveFields(record.attributes) } : {},
					...record.example ? { example: record.example } : {},
					...record.icon ? { icon: pendingIcon } : {},
					...record.actions ? { actions: withRenderableIcons(record.actions, true) } : {},
					...recordOverlay(record)
				};
			}
			try {
				const module = await import(
					/* webpackIgnore: true */
					/* @vite-ignore */
					record.widget_module
);
				if (!module?.default) return null;
				const metadata = module.default;
				const icon = ((0, import_element.isValidElement)(metadata.icon) ? metadata.icon : void 0) ?? (record.icon ? pendingIcon : void 0);
				const actions = record.actions ?? metadata.actions;
				const attributes = mergeAttributes(record.attributes, metadata.attributes);
				const example = metadata.example ?? record.example;
				return {
					apiVersion: DEFAULT_API_VERSION,
					...metadata,
					...attributes ? { attributes: resolveFields(attributes) } : {},
					...example ? { example } : {},
					icon,
					title: record.title ?? metadata.title ?? record.name,
					...actions ? { actions: withRenderableIcons(actions, actions === record.actions) } : {},
					...recordOverlay(record)
				};
			} catch {
				return null;
			}
		})).then((results) => {
			if (cancelled) return;
			setWidgetTypes(results.filter((t) => t !== null));
			setIsResolvingWidgetTypes(false);
			for (const record of records) {
				if (!record.icon) continue;
				resolveIcon(record.icon).then((resolved) => {
					if (cancelled) return;
					setWidgetTypes((prev) => prev.map((widgetType) => {
						if (widgetType.name !== record.name) return widgetType;
						if (resolved) return {
							...widgetType,
							icon: resolved
						};
						return widgetType.icon === pendingIcon ? {
							...widgetType,
							icon: void 0
						} : widgetType;
					}));
				});
			}
			for (const record of records) for (const action of record.actions ?? []) {
				if (typeof action.icon !== "string") continue;
				resolveIcon(action.icon).then((resolved) => {
					if (cancelled) return;
					setWidgetTypes((prev) => prev.map((type) => {
						if (type.name !== record.name) return type;
						return {
							...type,
							actions: type.actions?.map((entry) => {
								if (entry.id !== action.id) return entry;
								if (resolved) return {
									...entry,
									icon: resolved
								};
								return entry.icon === pendingIcon ? {
									...entry,
									icon: void 0
								} : entry;
							})
						};
					}));
				});
			}
		});
		return () => {
			cancelled = true;
		};
	}, [records]);
	return [widgetTypes, isResolvingWidgetTypes];
}

export { HostLink, WidgetHostProvider, WidgetRender, registerFieldType, registerIconResolver, useWidgetActions, useWidgetHost, useWidgetIdentity, useWidgetTypes };
//# sourceMappingURL=index.js.map