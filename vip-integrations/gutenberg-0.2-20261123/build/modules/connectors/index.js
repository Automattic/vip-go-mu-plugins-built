// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/connectors/build-module/lock-unlock.mjs
var import_data = require_data();
var import_private_apis = require_private_apis();
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/connectors");

// packages/connectors/build-module/store.mjs
const STORE_NAME = "core/connectors";
const DEFAULT_STATE = { connectors: {} };
const actions = {
	registerConnector(slug, config) {
		return {
			type: "REGISTER_CONNECTOR",
			slug,
			config
		};
	},
	unregisterConnector(slug) {
		return {
			type: "UNREGISTER_CONNECTOR",
			slug
		};
	}
};
function reducer(state = DEFAULT_STATE, action) {
	switch (action.type) {
		case "REGISTER_CONNECTOR": return {
			...state,
			connectors: {
				...state.connectors,
				[action.slug]: {
					...state.connectors[action.slug],
					slug: action.slug,
					...action.config
				}
			}
		};
		case "UNREGISTER_CONNECTOR": {
			if (!state.connectors[action.slug]) return state;
			const { [action.slug]: _, ...rest } = state.connectors;
			return {
				...state,
				connectors: rest
			};
		}
		default: return state;
	}
}
const selectors = {
	getConnectors: (0, import_data.createSelector)((state) => Object.values(state.connectors), (state) => [state.connectors]),
	getConnector(state, slug) {
		return state.connectors[slug];
	}
};
const store = (0, import_data.createReduxStore)(STORE_NAME, { reducer });
(0, import_data.register)(store);
unlock(store).registerPrivateActions(actions);
unlock(store).registerPrivateSelectors(selectors);

// packages/connectors/build-module/api.mjs
/**
* Register a connector that will appear in the Connectors settings page.
* If a connector with the given slug already exists, the provided config
* fields will be merged into the existing connector (upsert).
*
* @param slug   Unique identifier for the connector.
* @param config Connector configuration (all fields optional when updating).
*               Omit keys you don't want to change — passing `undefined`
*               will overwrite the existing value.
*
* @example
* ```js
* import { __experimentalRegisterConnector as registerConnector, __experimentalConnectorItem as ConnectorItem } from '@wordpress/connectors';
*
* registerConnector( 'my-plugin/openai', {
*     name: 'OpenAI',
*     description: 'Text, image, and code generation with GPT.',
*     logo: <MyOpenAIIcon />,
*     render: ( { slug, name, description, logo } ) => (
*         <ConnectorItem
*             logo={ logo }
*             name={ name }
*             description={ description }
*         >
*             <MyCustomSettings />
*         </ConnectorItem>
*     ),
* } );
* ```
*/
function registerConnector(slug, config) {
	unlock((0, import_data.dispatch)(store)).registerConnector(slug, config);
}
/**
* Unregister a previously registered connector.
*
* @param slug Unique identifier of the connector to remove.
*
* @example
* ```js
* import { __experimentalUnregisterConnector as unregisterConnector } from '@wordpress/connectors';
*
* unregisterConnector( 'my-plugin/openai' );
* ```
*/
function unregisterConnector(slug) {
	unlock((0, import_data.dispatch)(store)).unregisterConnector(slug);
}

// \0wp-global:@wordpress/components
var require_components = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.components;
}));

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/connectors/build-module/connector-item.mjs
var import_components = require_components();
var import_element = require_element();
var import_i18n = require_i18n();
var import_jsx_runtime = require_jsx_runtime();
function ConnectorItem({ className, logo, name, description, actionArea, children }) {
	const headingId = (0, import_element.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalItem, {
		className,
		role: "listitem",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
			spacing: 4,
			role: "group",
			"aria-labelledby": headingId,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, {
				alignment: "center",
				spacing: 4,
				wrap: true,
				children: [
					logo,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.FlexBlock, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, {
						spacing: 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalText, {
							weight: "var(--wpds-typography-font-weight-emphasis, 600)",
							size: 15,
							id: headingId,
							as: "h2",
							children: name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalText, {
							variant: "muted",
							size: 12,
							children: description
						})]
					}) }),
					actionArea
				]
			}), children]
		})
	});
}
function getHelpLinkLabel(helpUrl, helpLabel) {
	if (helpLabel) return helpLabel;
	if (!helpUrl) return;
	try {
		return new URL(helpUrl).hostname;
	} catch {
		return helpUrl;
	}
}
function createConnectorHelpLink(helpUrl, helpLabel, message) {
	if (!helpUrl) return;
	return (0, import_element.createInterpolateElement)((0, import_i18n.sprintf)(message, "<a></a>"), { a: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ExternalLink, {
		href: helpUrl,
		children: getHelpLinkLabel(helpUrl, helpLabel)
	}) });
}
function useConnectorSettingsSave(onSave, fallbackErrorMessage) {
	const [isSaving, setIsSaving] = (0, import_element.useState)(false);
	const [saveError, setSaveError] = (0, import_element.useState)(null);
	const handleSave = async (value) => {
		setSaveError(null);
		setIsSaving(true);
		try {
			await onSave?.(value);
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : fallbackErrorMessage);
		} finally {
			setIsSaving(false);
		}
	};
	return {
		isSaving,
		saveError,
		setSaveError,
		handleSave
	};
}
function ConnectorSettingsFrame({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalVStack, {
		spacing: 4,
		className: "connector-settings",
		children
	});
}
function ConnectorSettingsFooter({ readOnly, onRemove, canSave, isSaving, onSave }) {
	if (readOnly) {
		if (!onRemove) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalHStack, {
			justify: "flex-start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
				variant: "link",
				isDestructive: true,
				onClick: onRemove,
				children: (0, import_i18n.__)("Remove and replace")
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.__experimentalHStack, {
		justify: "flex-start",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Button, {
			__next40pxDefaultSize: true,
			variant: "primary",
			disabled: !canSave || isSaving,
			accessibleWhenDisabled: true,
			isBusy: isSaving,
			onClick: onSave,
			children: (0, import_i18n.__)("Save")
		})
	});
}
/**
* Default settings form for connectors.
*
* @param props              - Component props.
* @param props.onSave       - Callback invoked with the API key when the user saves.
* @param props.onRemove     - Callback invoked when the user removes the connector.
* @param props.initialValue - Initial value for the API key field.
* @param props.helpUrl      - URL to documentation for obtaining an API key.
* @param props.helpLabel    - Custom label for the help link. Defaults to the URL's hostname.
* @param props.readOnly     - Whether the form is in read-only mode.
* @param props.keySource    - The source of the API key: 'env', 'constant', 'database', or 'none'.
*/
function DefaultConnectorSettings({ onSave, onRemove, initialValue = "", helpUrl, helpLabel, readOnly = false, keySource }) {
	const [apiKey, setApiKey] = (0, import_element.useState)(initialValue);
	const { isSaving, saveError, setSaveError, handleSave } = useConnectorSettingsSave(onSave, (0, import_i18n.__)("It was not possible to connect to the provider using this key."));
	const helpLink = createConnectorHelpLink(helpUrl, helpLabel, (0, import_i18n.__)("Get your API key at %s"));
	const isExternallyConfigured = keySource === "env" || keySource === "constant";
	const getHelp = () => {
		if (isExternallyConfigured) {
			if (keySource === "env") return (0, import_i18n.__)("This API key is configured using an environment variable.");
			if (keySource === "constant") return (0, import_i18n.__)("This API key is configured as a constant.");
		}
		if (readOnly) return helpUrl ? createConnectorHelpLink(helpUrl, helpLabel, (0, import_i18n.__)("Your API key is stored securely. You can manage it at %s")) : (0, import_i18n.__)("Your API key is stored securely.");
		if (saveError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			role: "alert",
			className: "connector-settings__error",
			children: saveError
		});
		return helpLink;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConnectorSettingsFrame, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.TextControl, {
		label: (0, import_i18n.__)("API Key"),
		value: apiKey,
		onChange: (value) => {
			if (!readOnly) {
				setSaveError(null);
				setApiKey(value);
			}
		},
		placeholder: (0, import_i18n.__)("Enter your API key"),
		disabled: readOnly || isSaving,
		autoComplete: "off",
		help: getHelp()
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorSettingsFooter, {
		readOnly,
		onRemove,
		canSave: !!apiKey,
		isSaving,
		onSave: () => handleSave(apiKey)
	})] });
}
/**
* Default settings form for application password connectors.
*
* @param props                 - Component props.
* @param props.onSave          - Callback invoked with the username and application password.
* @param props.onRemove        - Callback invoked when the credentials are removed.
* @param props.initialUsername - Initial value for the username field.
* @param props.helpUrl         - URL where users can create an application password.
* @param props.helpLabel       - Custom label for the help link. Defaults to the URL's hostname.
* @param props.readOnly        - Whether the form is in read-only mode.
* @param props.keySource       - The source of the credentials: 'env', 'constant', 'database', or 'none'.
*/
function ApplicationPasswordConnectorSettings({ onSave, onRemove, initialUsername = "", helpUrl, helpLabel, readOnly = false, keySource }) {
	const [username, setUsername] = (0, import_element.useState)(initialUsername);
	const [applicationPassword, setApplicationPassword] = (0, import_element.useState)("");
	const { isSaving, saveError, setSaveError, handleSave } = useConnectorSettingsSave(onSave, (0, import_i18n.__)("It was not possible to save these credentials."));
	let applicationPasswordHelp = createConnectorHelpLink(helpUrl, helpLabel, (0, import_i18n.__)("Create an application password at %s"));
	if (keySource === "env") applicationPasswordHelp = (0, import_i18n.__)("These credentials are configured using an environment variable.");
	else if (keySource === "constant") applicationPasswordHelp = (0, import_i18n.__)("These credentials are configured as a constant.");
	else if (readOnly) applicationPasswordHelp = (0, import_i18n.__)("Your application password is stored securely.");
	if (saveError) applicationPasswordHelp = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		role: "alert",
		className: "connector-settings__error",
		children: saveError
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConnectorSettingsFrame, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.TextControl, {
			label: (0, import_i18n.__)("Username"),
			value: username,
			onChange: (value) => {
				if (!readOnly) {
					setSaveError(null);
					setUsername(value);
				}
			},
			placeholder: (0, import_i18n.__)("Enter your username"),
			disabled: readOnly || isSaving,
			autoComplete: "username"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.TextControl, {
			label: (0, import_i18n.__)("Application password"),
			value: readOnly ? "••••••••••••••••" : applicationPassword,
			onChange: (value) => {
				if (!readOnly) {
					setSaveError(null);
					setApplicationPassword(value);
				}
			},
			type: "password",
			placeholder: (0, import_i18n.__)("Enter your application password"),
			disabled: readOnly || isSaving,
			autoComplete: "new-password",
			help: applicationPasswordHelp
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorSettingsFooter, {
			readOnly,
			onRemove,
			canSave: !!username.trim() && !!applicationPassword,
			isSaving,
			onSave: () => handleSave({
				username: username.trim(),
				applicationPassword
			})
		})
	] });
}

// packages/connectors/build-module/private-apis.mjs
const privateApis = {};
lock(privateApis, {
	store,
	STORE_NAME
});

export { ApplicationPasswordConnectorSettings as __experimentalApplicationPasswordConnectorSettings, ConnectorItem as __experimentalConnectorItem, DefaultConnectorSettings as __experimentalDefaultConnectorSettings, registerConnector as __experimentalRegisterConnector, unregisterConnector as __experimentalUnregisterConnector, privateApis };
//# sourceMappingURL=index.js.map