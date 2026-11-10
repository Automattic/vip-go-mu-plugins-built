(function(exports, _wordpress_data, _wordpress_deprecated, _wordpress_components, _wordpress_i18n, _wordpress_element, _wordpress_primitives, react_jsx_runtime, _wordpress_a11y, _wordpress_compose, _wordpress_private_apis) {

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

_wordpress_deprecated = __toESM(_wordpress_deprecated, 1);

// packages/preferences/build-module/store/reducer.mjs
/**
	* Reducer returning the defaults for user preferences.
	*
	* This is kept intentionally separate from the preferences
	* themselves so that defaults are not persisted.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function defaults(state = {}, action) {
		if (action.type === "SET_PREFERENCE_DEFAULTS") {
			const { scope, defaults: values } = action;
			return {
				...state,
				[scope]: {
					...state[scope],
					...values
				}
			};
		}
		return state;
	}
	/**
	* Higher order reducer that does the following:
	* - Merges any data from the persistence layer into the state when the
	*   `SET_PERSISTENCE_LAYER` action is received.
	* - Passes any preferences changes to the persistence layer.
	*
	* @param reducer The preferences reducer.
	*
	* @return The enhanced reducer.
	*/
	function withPersistenceLayer(reducer) {
		let persistenceLayer;
		return (state, action) => {
			if (action.type === "SET_PERSISTENCE_LAYER") {
				const { persistenceLayer: persistence, persistedData } = action;
				persistenceLayer = persistence;
				return persistedData;
			}
			const nextState = reducer(state, action);
			if (action.type === "SET_PREFERENCE_VALUE") persistenceLayer?.set(nextState);
			return nextState;
		};
	}
	/**
	* Reducer returning the user preferences.
	*
	* @param {Object} state  Current state.
	* @param {Object} action Dispatched action.
	*
	* @return {Object} Updated state.
	*/
	const preferences = withPersistenceLayer((state = {}, action) => {
		if (action.type === "SET_PREFERENCE_VALUE") {
			const { scope, name, value } = action;
			return {
				...state,
				[scope]: {
					...state[scope],
					[name]: value
				}
			};
		}
		return state;
	});
	var reducer_default = (0, _wordpress_data.combineReducers)({
		defaults,
		preferences
	});

// packages/preferences/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		set: () => set,
		setDefaults: () => setDefaults,
		setPersistenceLayer: () => setPersistenceLayer,
		toggle: () => toggle
	}, 1);
	/**
	* Returns an action object used in signalling that a preference should be
	* toggled.
	*
	* @param {string} scope The preference scope (e.g. core/edit-post).
	* @param {string} name  The preference name.
	*/
	function toggle(scope, name) {
		return function({ select, dispatch }) {
			const currentValue = select.get(scope, name);
			dispatch.set(scope, name, !currentValue);
		};
	}
	/**
	* Returns an action object used in signalling that a preference should be set
	* to a value
	*
	* @param {string} scope The preference scope (e.g. core/edit-post).
	* @param {string} name  The preference name.
	* @param {*}      value The value to set.
	*
	* @return {SetAction} Action object.
	*/
	function set(scope, name, value) {
		return {
			type: "SET_PREFERENCE_VALUE",
			scope,
			name,
			value
		};
	}
	/**
	* Returns an action object used in signalling that preference defaults should
	* be set.
	*
	* @param scope    The preference scope (e.g. core/edit-post).
	* @param defaults A key/value map of preference names to values.
	*
	* @return Action object.
	*/
	function setDefaults(scope, defaults) {
		return {
			type: "SET_PREFERENCE_DEFAULTS",
			scope,
			defaults
		};
	}
	/**
	* Sets the persistence layer.
	*
	* When a persistence layer is set, the preferences store will:
	* - call `get` immediately and update the store state to the value returned.
	* - call `set` with all preferences whenever a preference changes value.
	*
	* `setPersistenceLayer` should ideally be dispatched at the start of an
	* application's lifecycle, before any other actions have been dispatched to
	* the preferences store.
	*
	* @param persistenceLayer The persistence layer.
	*
	* @return Action object.
	*/
	async function setPersistenceLayer(persistenceLayer) {
		return {
			type: "SET_PERSISTENCE_LAYER",
			persistenceLayer,
			persistedData: await persistenceLayer.get()
		};
	}

// packages/preferences/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({ get: () => get }, 1);
	const withDeprecatedKeys = (originalGet) => (state, scope, name) => {
		if ([
			"allowRightClickOverrides",
			"distractionFree",
			"editorMode",
			"fixedToolbar",
			"focusMode",
			"hiddenBlockTypes",
			"inactivePanels",
			"keepCaretInsideBlock",
			"mostUsedBlocks",
			"openPanels",
			"showBlockBreadcrumbs",
			"showIconLabels",
			"showListViewByDefault",
			"isPublishSidebarEnabled",
			"isComplementaryAreaVisible",
			"pinnedItems"
		].includes(name) && ["core/edit-post", "core/edit-site"].includes(scope)) {
			(0, _wordpress_deprecated.default)(`wp.data.select( 'core/preferences' ).get( '${scope}', '${name}' )`, {
				since: "6.5",
				alternative: `wp.data.select( 'core/preferences' ).get( 'core', '${name}' )`
			});
			return originalGet(state, "core", name);
		}
		return originalGet(state, scope, name);
	};
	/**
	* Returns a boolean indicating whether a preference is active for a particular
	* scope.
	*
	* @param {StoreState} state The store state.
	* @param {string}     scope The scope of the feature (e.g. core/edit-post).
	* @param {string}     name  The name of the feature.
	*
	* @return {*} Is the feature enabled?
	*/
	const get = withDeprecatedKeys((state, scope, name) => {
		const value = state.preferences[scope]?.[name];
		return value !== void 0 ? value : state.defaults[scope]?.[name];
	});

// packages/preferences/build-module/store/constants.mjs
/**
	* The identifier for the data store.
	*/
	const STORE_NAME = "core/preferences";

// packages/preferences/build-module/store/index.mjs
/**
	* Store definition for the preferences namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*/
	const store = (0, _wordpress_data.createReduxStore)(STORE_NAME, {
		reducer: reducer_default,
		actions: actions_exports,
		selectors: selectors_exports
	});
	(0, _wordpress_data.register)(store);

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

// packages/icons/build-module/library/check.mjs
	var check_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M7 12L10 15L17 8" })
	});

// packages/icons/build-module/library/chevron-left.mjs
	var chevron_left_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M14 6.5L9 12L14 17.5" })
	});

// packages/icons/build-module/library/chevron-right.mjs
	var chevron_right_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M10 6.5L15 12L10 17.5" })
	});

// packages/preferences/build-module/components/preference-toggle-menu-item/index.mjs
	function PreferenceToggleMenuItem({ scope, name, label, info, messageActivated, messageDeactivated, shortcut, handleToggling = true, onToggle = () => null, disabled = false }) {
		const isActive = (0, _wordpress_data.useSelect)((select) => !!select(store).get(scope, name), [scope, name]);
		const { toggle } = (0, _wordpress_data.useDispatch)(store);
		const speakMessage = () => {
			if (isActive) {
				const message = messageDeactivated || (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Preference deactivated - %s"), label);
				(0, _wordpress_a11y.speak)(message);
			} else {
				const message = messageActivated || (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Preference activated - %s"), label);
				(0, _wordpress_a11y.speak)(message);
			}
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.MenuItem, {
			icon: isActive ? check_default : null,
			isSelected: isActive,
			onClick: () => {
				onToggle();
				if (handleToggling) toggle(scope, name);
				speakMessage();
			},
			role: "menuitemcheckbox",
			info,
			shortcut,
			disabled,
			children: label
		});
	}

// packages/preferences/build-module/components/preference-base-option/index.mjs
	function BaseOption({ help, label, isChecked, onChange, children }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "preference-base-option",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.ToggleControl, {
				help,
				label,
				checked: isChecked,
				onChange
			}), children]
		});
	}

// packages/preferences/build-module/components/preference-toggle-control/index.mjs
	function PreferenceToggleControl(props) {
		const { scope, featureName, onToggle = () => {}, ...remainingProps } = props;
		const isChecked = (0, _wordpress_data.useSelect)((select) => !!select(store).get(scope, featureName), [scope, featureName]);
		const { toggle } = (0, _wordpress_data.useDispatch)(store);
		const onChange = () => {
			onToggle();
			toggle(scope, featureName);
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BaseOption, {
			...remainingProps,
			onChange,
			isChecked
		});
	}

// packages/preferences/build-module/components/preferences-modal/index.mjs
	function PreferencesModal({ closeModal, children }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Modal, {
			className: "preferences-modal",
			title: (0, _wordpress_i18n.__)("Preferences"),
			onRequestClose: closeModal,
			children
		});
	}

// packages/preferences/build-module/components/preferences-modal-section/index.mjs
	const Section = ({ description, title, children }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
		className: "preferences-modal__section",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("legend", {
			className: "preferences-modal__section-legend",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
				className: "preferences-modal__section-title",
				children: title
			}), description && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: "preferences-modal__section-description",
				children: description
			})]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "preferences-modal__section-content",
			children
		})]
	});

// packages/preferences/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/preferences");

// packages/preferences/build-module/components/preferences-modal-tabs/index.mjs
	const { Tabs: WCTabs } = unlock(_wordpress_components.privateApis);
	const PREFERENCES_MENU = "preferences-menu";
	function PreferencesModalTabs({ sections }) {
		const isLargeViewport = (0, _wordpress_compose.useViewportMatch)("medium");
		const [activeMenu, setActiveMenu] = (0, _wordpress_element.useState)(PREFERENCES_MENU);
		/**
		* Create helper objects from `sections` for easier data handling.
		* `tabs` is used for creating the `Tabs` and `sectionsContentMap`
		* is used for easier access to active tab's content.
		*/
		const { tabs, sectionsContentMap } = (0, _wordpress_element.useMemo)(() => {
			let mappedTabs = {
				tabs: [],
				sectionsContentMap: {}
			};
			if (sections.length) mappedTabs = sections.reduce((accumulator, { name, tabLabel: title, content }) => {
				accumulator.tabs.push({
					name,
					title
				});
				accumulator.sectionsContentMap[name] = content;
				return accumulator;
			}, {
				tabs: [],
				sectionsContentMap: {}
			});
			return mappedTabs;
		}, [sections]);
		let modalContent;
		if (isLargeViewport) modalContent = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "preferences__tabs",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(WCTabs, {
				defaultTabId: activeMenu !== PREFERENCES_MENU ? activeMenu : void 0,
				onSelect: setActiveMenu,
				orientation: "vertical",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(WCTabs.TabList, {
					className: "preferences__tabs-tablist",
					children: tabs.map((tab) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WCTabs.Tab, {
						tabId: tab.name,
						className: "preferences__tabs-tab",
						children: tab.title
					}, tab.name))
				}), tabs.map((tab) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WCTabs.TabPanel, {
					tabId: tab.name,
					className: "preferences__tabs-tabpanel",
					focusable: false,
					children: sectionsContentMap[tab.name] || null
				}, tab.name))]
			})
		});
		else modalContent = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.Navigator, {
			initialPath: "/",
			className: "preferences__provider",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Navigator.Screen, {
				path: "/",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Card, {
					isBorderless: true,
					size: "small",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.CardBody, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.__experimentalItemGroup, { children: tabs.map((tab) => {
						return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Navigator.Button, {
							path: `/${tab.name}`,
							as: _wordpress_components.__experimentalItem,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.__experimentalHStack, {
								justify: "space-between",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.FlexItem, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.__experimentalTruncate, { children: tab.title }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.FlexItem, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(icon_default, { icon: (0, _wordpress_i18n.isRTL)() ? chevron_left_default : chevron_right_default }) })]
							})
						}, tab.name);
					}) }) })
				})
			}), sections.length && sections.map((section) => {
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Navigator.Screen, {
					path: `/${section.name}`,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.Card, {
						isBorderless: true,
						size: "large",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_components.CardHeader, {
							isBorderless: false,
							justify: "left",
							size: "small",
							gap: "6",
							as: "div",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Navigator.BackButton, {
								icon: (0, _wordpress_i18n.isRTL)() ? chevron_right_default : chevron_left_default,
								label: (0, _wordpress_i18n.__)("Back")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.__experimentalText, {
								size: "16",
								children: section.tabLabel
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.CardBody, { children: section.content })]
					})
				}, `${section.name}-menu`);
			})]
		});
		return modalContent;
	}

// packages/preferences/build-module/private-apis.mjs
	const privateApis = {};
	lock(privateApis, {
		PreferenceBaseOption: BaseOption,
		PreferenceToggleControl,
		PreferencesModal,
		PreferencesModalSection: Section,
		PreferencesModalTabs
	});

exports.PreferenceToggleMenuItem = PreferenceToggleMenuItem;
exports.privateApis = privateApis;
exports.store = store;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).preferences = exports;
return exports;
})({}, window.wp.data, window.wp.deprecated, window.wp.components, window.wp.i18n, window.wp.element, window.wp.primitives, window.ReactJSXRuntime, window.wp.a11y, window.wp.compose, window.wp.privateApis);
//# sourceMappingURL=index.js.map