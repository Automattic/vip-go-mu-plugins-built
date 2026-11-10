// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);

// \0wp-global:@wordpress/editor
var require_editor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.editor;
}));

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/components
var require_components = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.components;
}));

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// packages/lazy-editor/build-module/hooks/use-styles-id.mjs
var import_editor = require_editor();
var import_components = require_components();
var import_element = require_element();
var import_core_data = require_core_data();
var import_data = require_data();
/**
* This is a React hook that provides the styles ID.
* Styles ID can be associated with a template.
* If a template has a styles ID, it will be used otherwise the global styles ID will be used.
*
* @param {Object} props              - The props object.
* @param {string} [props.templateId] - The ID of the template to use.
* @return The styles ID.
*/
function useStylesId({ templateId } = {}) {
	const { globalStylesId, stylesId } = (0, import_data.useSelect)((select) => {
		const coreDataSelect = select(import_core_data.store);
		const template = templateId ? coreDataSelect.getEntityRecord("postType", "wp_template", templateId) : null;
		return {
			globalStylesId: coreDataSelect.__experimentalGetCurrentGlobalStylesId(),
			stylesId: template?.styles_id
		};
	}, [templateId]);
	return stylesId || globalStylesId;
}

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
function getComputedFluidTypographyValue({ minimumFontSize, maximumFontSize, fontSize, minimumViewportWidth = DEFAULT_MINIMUM_VIEWPORT_WIDTH, maximumViewportWidth = DEFAULT_MAXIMUM_VIEWPORT_WIDTH, scaleFactor = DEFAULT_SCALE_FACTOR, minimumFontSizeLimit }) {
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
	const fluidFontSizeValue = getComputedFluidTypographyValue({
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

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/blocks
var require_blocks = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blocks;
}));

// packages/global-styles-engine/build-module/core/selectors.mjs
/**
* Determine the CSS selector for the block type and target provided, returning
* it if available.
*
* @param blockType        The block's type.
* @param target           The desired selector's target e.g. `root`, delimited string, or array path.
* @param options          Options object.
* @param options.fallback Whether or not to fallback to broader selector.
*
* @return The CSS selector or `null` if no selector available.
*/
function getBlockSelector(blockType, target = "root", options = {}) {
	if (!target) return null;
	const { fallback = false } = options;
	const { name, selectors, supports } = blockType;
	const hasSelectors = selectors && Object.keys(selectors).length > 0;
	const path = Array.isArray(target) ? target.join(".") : target;
	let rootSelector = null;
	if (hasSelectors && selectors.root) rootSelector = selectors?.root;
	else if (supports?.__experimentalSelector) rootSelector = supports.__experimentalSelector;
	else rootSelector = ".wp-block-" + name.replace("core/", "").replace("/", "-");
	if (path === "root") return rootSelector;
	const pathArray = Array.isArray(target) ? target : target.split(".");
	if (pathArray.length === 1) {
		const fallbackSelector = fallback ? rootSelector : null;
		if (hasSelectors) return getValueFromObjectPath(selectors, `${path}.root`, null) || getValueFromObjectPath(selectors, path, null) || fallbackSelector;
		const featureSelector = supports ? getValueFromObjectPath(supports, `${path}.__experimentalSelector`, null) : void 0;
		if (!featureSelector) return fallbackSelector;
		return scopeSelector(rootSelector, featureSelector);
	}
	let subfeatureSelector;
	if (hasSelectors) subfeatureSelector = getValueFromObjectPath(selectors, path, null);
	if (subfeatureSelector) return subfeatureSelector;
	if (fallback) return getBlockSelector(blockType, pathArray[0], options);
	return null;
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
var p = function(r) {
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
		return p(y(this.rgba));
	}, r.prototype.toHslString = function() {
		return r = p(y(this.rgba)), t = r.h, n = r.s, u = r.l, (e = r.a) < 1 ? "hsla(" + t + ", " + n + "%, " + u + "%, " + e + ")" : "hsl(" + t + ", " + n + "%, " + u + "%)";
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
function getViewportBreakpointValueInPixels(value) {
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
function getViewportBreakpoints(configOrSettings) {
	const viewportSettings = getViewportSettings(configOrSettings);
	const breakpoints = {};
	const breakpointValuesInPixels = {};
	Object.keys(DEFAULT_VIEWPORT_BREAKPOINTS).forEach((breakpoint) => {
		const key = breakpoint;
		const value = viewportSettings[key];
		const px = getViewportBreakpointValueInPixels(value);
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
	const breakpoints = getViewportBreakpoints(configOrSettings);
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
const BLOCK_SUPPORT_FEATURE_LEVEL_SELECTORS = {
	__experimentalBorder: "border",
	color: "color",
	dimensions: "dimensions",
	spacing: "spacing",
	typography: "typography"
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
function getPresetsSvgFilters(blockPresets = {}) {
	return PRESET_METADATA.filter((metadata) => metadata.path.at(-1) === "duotone").flatMap((metadata) => {
		const presetByOrigin = getValueFromObjectPath(blockPresets, metadata.path, {});
		return [
			"default",
			"theme",
			"custom"
		].filter((origin) => presetByOrigin[origin]).flatMap((origin) => presetByOrigin[origin].map((preset) => getDuotoneFilter(`wp-duotone-${preset.slug}`, preset.colors))).join("");
	});
}
function flattenTree(input = {}, prefix, token) {
	let result = [];
	Object.keys(input).forEach((key) => {
		const newKey = prefix + kebabCase(key.replace("/", "-"));
		const newLeaf = input[key];
		if (newLeaf instanceof Object) {
			const newPrefix = newKey + token;
			result = [...result, ...flattenTree(newLeaf, newPrefix, token)];
		} else result.push(`${newKey}: ${newLeaf}`);
	});
	return result;
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
* Resolves the selector for a given block support feature.
*
* If the block defines a feature-level selector (as a string or an object
* with a `root` key), that selector is returned. Otherwise the fallback
* selector is used.
*
* @param {FeatureSelectors|undefined} featureSelectors The block's feature selectors.
* @param {string}                     featureKey       The feature key to resolve.
* @param {string}                     fallback         The default selector.
* @return {string} The resolved selector.
*/
function resolveFeatureSelector(featureSelectors, featureKey, fallback) {
	if (!featureSelectors || typeof featureSelectors === "string") return fallback;
	const feature = featureSelectors[featureKey];
	if (typeof feature === "string") return feature;
	if (feature && typeof feature === "object" && typeof feature.root === "string") return feature.root;
	return fallback;
}
/**
* Collects CSS variable declarations for a single preset metadata entry
* across all origins.
*
* @param {Record<string,any>}             presets        The preset values keyed by origin.
* @param {GlobalStylesConfig['settings']} mergedSettings The merged global styles settings.
* @param {PresetMetadata}                 presetMetadata The preset metadata.
* @return {string[]} The CSS variable declarations.
*/
function getPresetVarDeclarations(presets, mergedSettings, { path, valueKey, valueFunc, cssVarInfix }) {
	const presetByOrigin = getValueFromObjectPath(presets, path, []);
	const declarations = [];
	for (const origin of [
		"default",
		"theme",
		"custom"
	]) {
		if (!presetByOrigin[origin]) continue;
		for (const value of presetByOrigin[origin]) {
			const slug = kebabCase(value.slug);
			if (valueKey && !valueFunc) declarations.push(`--wp--preset--${cssVarInfix}--${slug}: ${value[valueKey]}`);
			else if (valueFunc && typeof valueFunc === "function") declarations.push(`--wp--preset--${cssVarInfix}--${slug}: ${valueFunc(value, mergedSettings)}`);
		}
	}
	return declarations;
}
const generateCustomProperties = (tree, blockSelectors) => {
	const nodes = getNodesWithSettings(tree, blockSelectors);
	let ruleset = "";
	for (const { presets, custom, selector, featureSelectors } of nodes) {
		const defaultSelector = selector;
		const varsBySelector = { [defaultSelector]: [] };
		if (tree?.settings) for (const metadata of PRESET_METADATA) {
			const declarations = getPresetVarDeclarations(presets, tree.settings, metadata);
			if (declarations.length === 0) continue;
			const target = resolveFeatureSelector(featureSelectors, metadata.path[0], defaultSelector);
			if (!varsBySelector[target]) varsBySelector[target] = [];
			varsBySelector[target].push(...declarations);
		}
		const customProps = flattenTree(custom, "--wp--custom--", "--");
		if (customProps.length > 0) varsBySelector[defaultSelector].push(...customProps);
		for (const [ruleSelector, declarations] of Object.entries(varsBySelector)) if (declarations.length > 0) ruleset += `${ruleSelector}{${declarations.join(";")};}`;
	}
	return ruleset;
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
const transformToStyles = (tree, blockSelectors, hasBlockGapSupport, hasFallbackGapSupport, disableLayoutStyles = false, disableRootPadding = false, styleOptions = {}) => transformToStylesWithTextClipBase(tree, blockSelectors, hasBlockGapSupport, hasFallbackGapSupport, disableLayoutStyles, disableRootPadding, styleOptions);
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
function generateSvgFilters(tree, blockSelectors) {
	return getNodesWithSettings(tree, blockSelectors).flatMap(({ presets }) => {
		return getPresetsSvgFilters(presets);
	});
}
const getSelectorsConfig = (blockType, rootSelector) => {
	if (blockType?.selectors && Object.keys(blockType.selectors).length > 0) return blockType.selectors;
	const config = { root: rootSelector };
	Object.entries(BLOCK_SUPPORT_FEATURE_LEVEL_SELECTORS).forEach(([featureKey, featureName]) => {
		const featureSelector = getBlockSelector(blockType, featureKey);
		if (featureSelector) config[featureName] = featureSelector;
	});
	return config;
};
const getBlockSelectors = (blockTypes, variationInstanceId) => {
	const { getBlockStyles } = (0, import_data.select)(import_blocks.store);
	const result = {};
	blockTypes.forEach((blockType) => {
		const name = blockType.name;
		const selector = getBlockSelector(blockType);
		if (!selector) return;
		let duotoneSelector = getBlockSelector(blockType, "filter.duotone");
		if (!duotoneSelector) {
			const rootSelector = getBlockSelector(blockType);
			const duotoneSupport = (0, import_blocks.getBlockSupport)(blockType, "color.__experimentalDuotone", false);
			if (typeof duotoneSupport === "string" && rootSelector) duotoneSelector = scopeSelector(rootSelector, duotoneSupport);
		}
		const hasLayoutSupport = !!blockType?.supports?.layout || !!blockType?.supports?.__experimentalLayout;
		const blockGapSupport = blockType?.supports?.spacing?.blockGap;
		const fallbackGapValue = typeof blockGapSupport === "object" && !Array.isArray(blockGapSupport) ? blockGapSupport.__experimentalDefault : void 0;
		const blockStyleVariations = getBlockStyles(name);
		const styleVariationSelectors = {};
		blockStyleVariations?.forEach((variation) => {
			const variationSuffix = variationInstanceId ? `-${variationInstanceId}` : "";
			const variationName = `${variation.name}${variationSuffix}`;
			const styleVariationSelector = getBlockStyleVariationSelector(variationName, selector);
			styleVariationSelectors[variationName] = styleVariationSelector;
		});
		const featureSelectors = getSelectorsConfig(blockType, selector);
		result[name] = {
			duotoneSelector: duotoneSelector ?? void 0,
			fallbackGapValue,
			featureSelectors: Object.keys(featureSelectors).length ? featureSelectors : void 0,
			hasLayoutSupport,
			name,
			selector,
			styleVariationSelectors: blockStyleVariations?.length ? styleVariationSelectors : void 0
		};
	});
	return result;
};
/**
* If there is a separator block whose color is defined in theme.json via background,
* update the separator color to the same value by using border color.
*
* @param config Theme.json configuration file object
* @return Theme.json configuration file object updated
*/
function updateConfigWithSeparator(config) {
	const blocks = config.styles?.blocks;
	const separatorBlock = blocks?.["core/separator"];
	if (separatorBlock && separatorBlock.color?.background && !separatorBlock.color?.text && !separatorBlock.border?.color) return {
		...config,
		styles: {
			...config.styles,
			blocks: {
				...blocks,
				"core/separator": {
					...separatorBlock,
					color: {
						...separatorBlock.color,
						text: separatorBlock.color?.background
					}
				}
			}
		}
	};
	return config;
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
/**
* Returns the global styles output based on the current state of global styles config loaded in the editor context.
*
* @param config     Global styles configuration
* @param blockTypes Array of block types from WordPress blocks store
* @param options    Options for rendering global styles
* @return Array of stylesheets and settings
*/
function generateGlobalStyles(config = {}, blockTypes = [], options = {}) {
	const { hasBlockGapSupport: hasBlockGapSupportOption, hasFallbackGapSupport: hasFallbackGapSupportOption, disableLayoutStyles = false, disableRootPadding = false, styleOptions = {} } = options;
	const blocks = blockTypes.length > 0 ? blockTypes : (0, import_blocks.getBlockTypes)();
	const blockGap = getSetting(config, "spacing.blockGap");
	const hasBlockGapSupport = hasBlockGapSupportOption ?? (blockGap !== null && blockGap !== void 0);
	const hasFallbackGapSupport = hasFallbackGapSupportOption ?? !hasBlockGapSupport;
	if (!config?.styles || !config?.settings) return [[], {}];
	const updatedConfig = updateConfigWithSeparator(config);
	const blockSelectors = getBlockSelectors(blocks);
	const customProperties = generateCustomProperties(updatedConfig, blockSelectors);
	const globalStyles = transformToStyles(updatedConfig, blockSelectors, hasBlockGapSupport, hasFallbackGapSupport, disableLayoutStyles, disableRootPadding, styleOptions);
	const svgs = generateSvgFilters(updatedConfig, blockSelectors);
	return [[
		{
			css: customProperties,
			isGlobalStyles: true
		},
		{
			css: globalStyles,
			isGlobalStyles: true
		},
		{
			css: updatedConfig?.styles?.css ?? "",
			isGlobalStyles: true
		},
		{
			assets: svgs,
			__unstableType: "svgs",
			isGlobalStyles: true
		}
	], updatedConfig.settings];
}

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/lazy-editor/build-module/hooks/use-global-styles.mjs
function useUserGlobalStyles(id) {
	const { userGlobalStyles } = (0, import_data.useSelect)((select) => {
		if (id === void 0) return { userGlobalStyles: void 0 };
		const { getEntityRecord, getEditedEntityRecord, canUser } = select(import_core_data.store);
		const userCanEditGlobalStyles = canUser("update", {
			kind: "root",
			name: "globalStyles",
			id
		});
		let record;
		if (typeof userCanEditGlobalStyles === "boolean") {
			if (userCanEditGlobalStyles) record = getEditedEntityRecord("root", "globalStyles", id);
			else record = getEntityRecord("root", "globalStyles", id, { context: "view" });
		}
		return { userGlobalStyles: record };
	}, [id]);
	return (0, import_element.useMemo)(() => {
		if (!userGlobalStyles) return { user: void 0 };
		return { user: userGlobalStyles };
	}, [userGlobalStyles]);
}

// packages/lazy-editor/build-module/lock-unlock.mjs
var import_private_apis = require_private_apis();
const { unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/lazy-editor");

// packages/lazy-editor/build-module/hooks/use-editor-settings.mjs
/**
* This is a React hook that provides the editor settings from the REST API.
*
* @param {Object}        props            - The props object.
* @param {string|number} [props.stylesId] - The ID of the user's global styles to use.
* @return Editor settings.
*/
function useEditorSettings({ stylesId }) {
	const { editorSettings, blockTypes } = (0, import_data.useSelect)((select) => ({
		editorSettings: unlock(select(import_core_data.store)).getEditorSettings(),
		blockTypes: select(import_blocks.store).getBlockTypes()
	}), []);
	const { user: globalStyles } = useUserGlobalStyles(stylesId);
	const [globalStylesCSS] = (0, import_element.useMemo)(() => generateGlobalStyles(globalStyles, blockTypes), [globalStyles, blockTypes]);
	const hasEditorSettings = !!editorSettings;
	const styles = (0, import_element.useMemo)(() => {
		if (!hasEditorSettings) return [];
		return [...editorSettings?.styles ?? [], ...globalStylesCSS];
	}, [
		hasEditorSettings,
		editorSettings?.styles,
		globalStylesCSS
	]);
	return {
		isReady: hasEditorSettings,
		editorSettings: (0, import_element.useMemo)(() => ({
			...editorSettings ?? {},
			styles
		}), [editorSettings, styles])
	};
}

// packages/asset-loader/build-module/index.mjs
/**
* Injects or extends the import map with new module entries.
*
* @param scriptModules - Object mapping module specifiers to URLs
*/
function injectImportMap(scriptModules) {
	if (!scriptModules || Object.keys(scriptModules).length === 0) return;
	const existingMapElement = document.querySelector("script#wp-importmap[type=importmap]");
	if (existingMapElement) try {
		const existingMap = JSON.parse(existingMapElement.text);
		if (!existingMap.imports) existingMap.imports = {};
		existingMap.imports = {
			...existingMap.imports,
			...scriptModules
		};
		existingMapElement.text = JSON.stringify(existingMap, null, 2);
	} catch (error) {
		console.error("Failed to parse or update import map:", error);
	}
	else {
		const script = document.createElement("script");
		script.type = "importmap";
		script.id = "wp-importmap";
		script.text = JSON.stringify({ imports: scriptModules }, null, 2);
		document.head.appendChild(script);
	}
}
function loadStylesheet(handle, styleData) {
	return new Promise((resolve) => {
		if (!styleData.src) {
			resolve();
			return;
		}
		if (document.getElementById(handle + "-css")) {
			resolve();
			return;
		}
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = styleData.src + (styleData.version ? "?ver=" + styleData.version : "");
		link.id = handle + "-css";
		link.media = styleData.media || "all";
		link.onload = () => resolve();
		link.onerror = () => {
			console.error(`Failed to load stylesheet: ${handle}`);
			resolve();
		};
		document.head.appendChild(link);
	});
}
function loadScript(handle, scriptData) {
	if (!scriptData.src) {
		const marker = document.createElement("script");
		marker.id = handle + "-js";
		marker.textContent = "// Processed: " + handle;
		return marker;
	}
	const script = document.createElement("script");
	script.src = scriptData.src + (scriptData.version ? "?ver=" + scriptData.version : "");
	script.id = handle + "-js";
	script.async = false;
	return script;
}
function injectInlineStyle(handle, inlineStyle, position) {
	let styleContent = "";
	if (Array.isArray(inlineStyle)) styleContent = inlineStyle.join("\n");
	else if (typeof inlineStyle === "string") styleContent = inlineStyle;
	if (styleContent && styleContent.trim()) {
		const styleId = handle + "-" + position + "-inline-css";
		if (!document.getElementById(styleId)) {
			const style = document.createElement("style");
			style.id = styleId;
			style.textContent = styleContent.trim();
			document.head.appendChild(style);
		}
	}
}
function injectInlineScript(handle, inlineScript, position) {
	let scriptContent = inlineScript;
	if (Array.isArray(scriptContent)) scriptContent = scriptContent.join("\n");
	const script = document.createElement("script");
	script.id = handle + "-" + position + "-js";
	script.textContent = scriptContent.trim();
	return script;
}
function buildDependencyOrderedList(assetsData) {
	const visited = /* @__PURE__ */ new Set();
	const visiting = /* @__PURE__ */ new Set();
	const orderedList = [];
	function visit(handle) {
		if (visited.has(handle)) return;
		if (visiting.has(handle)) {
			console.warn(`Circular dependency detected for handle: ${handle}`);
			return;
		}
		visiting.add(handle);
		if (assetsData[handle]) (assetsData[handle].deps || []).forEach((dep) => {
			if (assetsData[dep]) visit(dep);
		});
		visiting.delete(handle);
		visited.add(handle);
		if (assetsData[handle]) orderedList.push(handle);
	}
	Object.keys(assetsData).forEach((handle) => {
		visit(handle);
	});
	return orderedList;
}
async function performScriptLoad(scriptElements, destination) {
	let parallel = [];
	for (const scriptElement of scriptElements) {
		if (scriptElement.src) {
			const loader = Promise.withResolvers();
			scriptElement.onload = () => loader.resolve();
			scriptElement.onerror = () => {
				console.error(`Failed to load script: ${scriptElement.id}`);
				loader.resolve();
			};
			parallel.push(loader.promise);
		} else {
			await Promise.all(parallel);
			parallel = [];
		}
		destination.appendChild(scriptElement);
	}
	await Promise.all(parallel);
	parallel = [];
}
async function loadAssets(scriptsData, inlineScripts, stylesData, inlineStyles, htmlTemplates, scriptModules) {
	if (scriptModules) injectImportMap(scriptModules);
	const orderedStyles = buildDependencyOrderedList(stylesData);
	const orderedScripts = buildDependencyOrderedList(scriptsData);
	const stylePromises = [];
	for (const handle of orderedStyles) {
		const beforeInline = inlineStyles.before?.[handle];
		if (beforeInline) injectInlineStyle(handle, beforeInline, "before");
		stylePromises.push(loadStylesheet(handle, stylesData[handle]));
		const afterInline = inlineStyles.after?.[handle];
		if (afterInline) injectInlineStyle(handle, afterInline, "after");
	}
	const scriptElements = [];
	for (const handle of orderedScripts) {
		const beforeInline = inlineScripts.before?.[handle];
		if (beforeInline) scriptElements.push(injectInlineScript(handle, beforeInline, "before"));
		scriptElements.push(loadScript(handle, scriptsData[handle]));
		const afterInline = inlineScripts.after?.[handle];
		if (afterInline) scriptElements.push(injectInlineScript(handle, afterInline, "after"));
	}
	const scriptsPromise = performScriptLoad(scriptElements, document.body);
	await Promise.all([Promise.all(stylePromises), scriptsPromise]);
	if (htmlTemplates && htmlTemplates.length > 0) htmlTemplates.forEach((templateHtml) => {
		const scriptMatch = templateHtml.match(/<script([^>]*)>(.*?)<\/script>/is);
		if (scriptMatch) {
			const attributes = scriptMatch[1];
			const content = scriptMatch[2];
			const script = document.createElement("script");
			const idMatch = attributes.match(/id=["']([^"']+)["']/);
			if (idMatch) script.id = idMatch[1];
			const typeMatch = attributes.match(/type=["']([^"']+)["']/);
			if (typeMatch) script.type = typeMatch[1];
			script.textContent = content;
			document.body.appendChild(script);
		}
	});
}

// packages/lazy-editor/build-module/hooks/use-editor-assets.mjs
let loadAssetsPromise;
async function loadEditorAssets() {
	const load = async () => {
		const editorAssets = await unlock((0, import_data.resolveSelect)(import_core_data.store)).getEditorAssets();
		await loadAssets(editorAssets.scripts || {}, editorAssets.inline_scripts || {
			before: {},
			after: {}
		}, editorAssets.styles || {}, editorAssets.inline_styles || {
			before: {},
			after: {}
		}, editorAssets.html_templates || [], editorAssets.script_modules || {});
	};
	if (!loadAssetsPromise) loadAssetsPromise = load();
	return loadAssetsPromise;
}
/**
* This is a React hook that handles loading editor assets from the REST API.
*
* @return Editor assets loading state.
*/
function useEditorAssets() {
	const editorAssets = (0, import_data.useSelect)((select) => {
		return unlock(select(import_core_data.store)).getEditorAssets();
	}, []);
	const [assetsLoaded, setAssetsLoaded] = (0, import_element.useState)(false);
	(0, import_element.useEffect)(() => {
		if (editorAssets && !assetsLoaded) loadEditorAssets().then(() => {
			setAssetsLoaded(true);
		}).catch((error) => {
			console.error("Failed to load editor assets:", error);
		});
	}, [editorAssets, assetsLoaded]);
	return {
		isReady: !!editorAssets && assetsLoaded,
		assetsLoaded
	};
}

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/lazy-editor/build-module/components/editor/index.mjs
var import_jsx_runtime = require_jsx_runtime();
const { Editor: PrivateEditor, BackButton, PreferencesModal, ToolsMoreMenuGroup, SiteExport } = unlock(import_editor.privateApis);
/**
* Lazy-loading editor component that handles asset loading and settings initialization.
*
* @param {Object}    props                   Component props
* @param {string}    props.postType          Optional post type to edit. If not provided, resolves to homepage.
* @param {string}    props.postId            Optional post ID to edit. If not provided, resolves to homepage.
* @param {Object}    props.settings          Optional extra settings to merge with editor settings
* @param {ReactNode} props.backButton        Optional back button to render in editor header
* @param {Function}  props.onActionPerformed Optional callback run after a post action
* @param {string}    props.initialViewport   Optional device type the entity opens at
* @param {string}    props.renderingMode     Optional rendering mode the editor stays in, for a route that shows the site rather than one piece of content
* @return The editor component with loading states
*/
function Editor({ postType, postId, settings, backButton, onActionPerformed, initialViewport, renderingMode }) {
	const homePage = (0, import_data.useSelect)((select) => {
		if (postType || postId) return null;
		const { getHomePage } = unlock(select(import_core_data.store));
		return getHomePage();
	}, [postType, postId]);
	const resolvedPostType = postType || homePage?.postType;
	const resolvedPostId = postId || homePage?.postId;
	const templateId = (0, import_data.useSelect)((select) => {
		if (!resolvedPostType || !resolvedPostId) return;
		if (resolvedPostType === "wp_template") return resolvedPostId;
		return unlock(select(import_core_data.store)).getTemplateId(resolvedPostType, resolvedPostId);
	}, [resolvedPostType, resolvedPostId]);
	const stylesId = useStylesId({ templateId });
	const { isReady: settingsReady, editorSettings } = useEditorSettings({ stylesId });
	const { isReady: assetsReady } = useEditorAssets();
	const finalSettings = (0, import_element.useMemo)(() => ({
		...editorSettings,
		...settings,
		styles: [...editorSettings.styles ?? [], ...settings?.styles ?? []]
	}), [editorSettings, settings]);
	if (!settingsReady || !assetsReady) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			height: "100vh"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Spinner, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrivateEditor, {
		postType: resolvedPostType,
		postId: resolvedPostId,
		templateId,
		settings: finalSettings,
		styles: finalSettings.styles,
		onActionPerformed,
		initialViewport,
		renderingMode,
		children: [
			backButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackButton, { children: backButton }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferencesModal, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolsMoreMenuGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteExport, {}) })
		]
	});
}

// \0wp-global:@wordpress/block-editor
var require_block_editor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blockEditor;
}));

// packages/lazy-editor/build-module/components/preview/index.mjs
var import_i18n = require_i18n();
var import_block_editor = require_block_editor();
if (typeof document !== "undefined" && !document.head.querySelector("style[data-wp-hash='95327475c1']")) {
	const style = document.createElement("style");
	style.setAttribute("data-wp-hash", "95327475c1");
	style.appendChild(document.createTextNode(".lazy-editor-block-preview__container{align-items:center;border-radius:4px;display:flex;flex-direction:column;height:100%;justify-content:center}.dataviews-view-grid .lazy-editor-block-preview__container .block-editor-block-preview__container{height:100%}.dataviews-view-table .lazy-editor-block-preview__container{text-wrap:balance;text-wrap:pretty;flex-grow:0;width:96px}"));
	document.head.appendChild(style);
}
const { useStyle } = unlock(import_editor.privateApis);
function PreviewContent({ blocks, content, description }) {
	const descriptionId = (0, import_element.useId)();
	const backgroundColor = useStyle("color.background");
	const actualBlocks = (0, import_element.useMemo)(() => {
		return blocks ?? (0, import_blocks.parse)(content, { __unstableSkipMigrationLogs: true });
	}, [content, blocks]);
	const isEmpty = !actualBlocks?.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lazy-editor-block-preview__container",
		style: { backgroundColor },
		"aria-describedby": !!description ? descriptionId : void 0,
		children: [
			isEmpty && (0, import_i18n.__)("Empty."),
			!isEmpty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockPreview.Async, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockPreview, { blocks: actualBlocks }) }),
			!!description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				hidden: true,
				id: descriptionId,
				children: description
			})
		]
	});
}
function Preview({ blocks, content, description }) {
	const stylesId = useStylesId();
	const { isReady: settingsReady, editorSettings } = useEditorSettings({ stylesId });
	const { isReady: assetsReady } = useEditorAssets();
	const finalSettings = (0, import_element.useMemo)(() => ({
		...editorSettings,
		isPreviewMode: true
	}), [editorSettings]);
	if (!settingsReady || !assetsReady) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockEditorProvider, {
		settings: finalSettings,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewContent, {
			blocks,
			content,
			description
		})
	});
}

export { Editor, Preview, loadEditorAssets, useEditorAssets, useEditorSettings };
//# sourceMappingURL=index.js.map