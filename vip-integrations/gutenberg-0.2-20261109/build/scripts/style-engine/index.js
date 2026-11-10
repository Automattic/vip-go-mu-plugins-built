(function(exports) {

"use strict";
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

// packages/style-engine/build-module/styles/constants.mjs
	const VARIABLE_REFERENCE_PREFIX = "var:";

// packages/style-engine/build-module/styles/utils.mjs
/**
	* Helper util to return a value from a certain path of the object.
	* Path is specified as an array of properties, like `[ 'x', 'y' ]`.
	*
	* @param object Input object.
	* @param path   Path to the object property.
	* @return Value of the object property at the specified path.
	*/
	const getStyleValueByPath = (object, path) => {
		let value = object;
		path.forEach((fieldName) => {
			value = value?.[fieldName];
		});
		return value;
	};
	/**
	* Returns a JSON representation of the generated CSS rules.
	*
	* @param style   Style object.
	* @param options Options object with settings to adjust how the styles are generated.
	* @param path    An array of strings representing the path to the style value in the style object.
	* @param ruleKey A CSS property key.
	*
	* @return GeneratedCSSRule[] CSS rules.
	*/
	function generateRule(style, options, path, ruleKey) {
		const styleValue = getStyleValueByPath(style, path);
		return styleValue ? [{
			selector: options?.selector,
			key: ruleKey,
			value: getCSSValueFromRawStyle(styleValue)
		}] : [];
	}
	/**
	* Returns a JSON representation of the generated CSS rules taking into account box model properties, top, right, bottom, left.
	*
	* @param style                Style object.
	* @param options              Options object with settings to adjust how the styles are generated.
	* @param path                 An array of strings representing the path to the style value in the style object.
	* @param ruleKeys             An array of CSS property keys and patterns.
	* @param individualProperties The "sides" or individual properties for which to generate rules.
	*
	* @return GeneratedCSSRule[]  CSS rules.
	*/
	function generateBoxRules(style, options, path, ruleKeys, individualProperties = [
		"top",
		"right",
		"bottom",
		"left"
	]) {
		const boxStyle = getStyleValueByPath(style, path);
		if (!boxStyle) return [];
		const rules = [];
		if (typeof boxStyle === "string") rules.push({
			selector: options?.selector,
			key: ruleKeys.default,
			value: getCSSValueFromRawStyle(boxStyle)
		});
		else {
			const sideRules = individualProperties.reduce((acc, side) => {
				const value = getCSSValueFromRawStyle(getStyleValueByPath(boxStyle, [side]));
				if (value) acc.push({
					selector: options?.selector,
					key: ruleKeys?.individual.replace("%s", upperFirst(side)),
					value
				});
				return acc;
			}, []);
			rules.push(...sideRules);
		}
		return rules;
	}
	/**
	* Returns a WordPress CSS custom var value from incoming style preset value,
	* if one is detected.
	*
	* The preset value is a string and follows the pattern `var:description|context|slug`.
	*
	* Example:
	*
	* `getCSSValueFromRawStyle( 'var:preset|color|heavenlyBlue' )` // returns 'var(--wp--preset--color--heavenly-blue)'
	*
	* @param styleValue A string representing a raw CSS value. Non-strings won't be processed.
	*
	* @return A CSS custom var value if the incoming style value is a preset value.
	*/
	function getCSSValueFromRawStyle(styleValue) {
		if (typeof styleValue === "string" && styleValue.startsWith("var:")) return `var(--wp--${styleValue.slice(VARIABLE_REFERENCE_PREFIX.length).split("|").map((presetVariable) => paramCase(presetVariable, { splitRegexp: [
			/([a-z0-9])([A-Z])/g,
			/([0-9])([a-z])/g,
			/([A-Za-z])([0-9])/g,
			/([A-Z])([A-Z][a-z])/g
		] })).join("--")})`;
		return styleValue;
	}
	/**
	* Capitalizes the first letter in a string.
	*
	* @param string The string whose first letter the function will capitalize.
	*
	* @return String with the first letter capitalized.
	*/
	function upperFirst(string) {
		const [firstLetter, ...rest] = string;
		return firstLetter.toUpperCase() + rest.join("");
	}
	/**
	* Converts an array of strings into a camelCase string.
	*
	* @param strings The strings to join into a camelCase string.
	*
	* @return camelCase string.
	*/
	function camelCaseJoin(strings) {
		const [firstItem, ...rest] = strings;
		return firstItem.toLowerCase() + rest.map(upperFirst).join("");
	}
	/**
	* Safely decodes a URI with `decodeURI`. Returns the URI unmodified if
	* `decodeURI` throws an error.
	*
	* @param {string} uri URI to decode.
	*
	* @example
	* ```js
	* const badUri = safeDecodeURI( '%z' ); // does not throw an Error, simply returns '%z'
	* ```
	*
	* @return {string} Decoded URI if possible.
	*/
	function safeDecodeURI(uri) {
		try {
			return decodeURI(uri);
		} catch {
			return uri;
		}
	}

// packages/style-engine/build-module/styles/border/index.mjs
/**
	* Creates a function for generating CSS rules when the style path is the same as the camelCase CSS property used in React.
	*
	* @param path An array of strings representing the path to the style value in the style object.
	*
	* @return A function that generates CSS rules.
	*/
	function createBorderGenerateFunction(path) {
		return (style, options) => generateRule(style, options, path, camelCaseJoin(path));
	}
	/**
	* Creates a function for generating border-{top,bottom,left,right}-{color,style,width} CSS rules.
	*
	* @param edge The edge to create CSS rules for.
	*
	* @return A function that generates CSS rules.
	*/
	function createBorderEdgeGenerateFunction(edge) {
		return (style, options) => {
			return [
				"color",
				"style",
				"width"
			].flatMap((key) => {
				return createBorderGenerateFunction([
					"border",
					edge,
					key
				])(style, options);
			});
		};
	}
	var border_default = [
		{
			name: "color",
			generate: createBorderGenerateFunction(["border", "color"])
		},
		{
			name: "style",
			generate: createBorderGenerateFunction(["border", "style"])
		},
		{
			name: "width",
			generate: createBorderGenerateFunction(["border", "width"])
		},
		{
			name: "radius",
			generate: (style, options) => {
				return generateBoxRules(style, options, ["border", "radius"], {
					default: "borderRadius",
					individual: "border%sRadius"
				}, [
					"topLeft",
					"topRight",
					"bottomLeft",
					"bottomRight"
				]);
			}
		},
		{
			name: "borderTop",
			generate: createBorderEdgeGenerateFunction("top")
		},
		{
			name: "borderRight",
			generate: createBorderEdgeGenerateFunction("right")
		},
		{
			name: "borderBottom",
			generate: createBorderEdgeGenerateFunction("bottom")
		},
		{
			name: "borderLeft",
			generate: createBorderEdgeGenerateFunction("left")
		}
	];

// packages/style-engine/build-module/styles/color/background.mjs
	const background = {
		name: "background",
		generate: (style, options) => {
			return generateRule(style, options, ["color", "background"], "backgroundColor");
		}
	};

// packages/style-engine/build-module/styles/color/gradient.mjs
	const gradient = {
		name: "gradient",
		generate: (style, options) => {
			return generateRule(style, options, ["color", "gradient"], "background");
		}
	};

// packages/style-engine/build-module/styles/color/text.mjs
	const text = {
		name: "text",
		generate: (style, options) => {
			return generateRule(style, options, ["color", "text"], "color");
		}
	};

// packages/style-engine/build-module/styles/color/index.mjs
	var color_default = [
		text,
		gradient,
		background
	];

// packages/style-engine/build-module/styles/dimensions/index.mjs
	var dimensions_default = [
		{
			name: "height",
			generate: (style, options) => {
				return generateRule(style, options, ["dimensions", "height"], "height");
			}
		},
		{
			name: "minHeight",
			generate: (style, options) => {
				return generateRule(style, options, ["dimensions", "minHeight"], "minHeight");
			}
		},
		{
			name: "minWidth",
			generate: (style, options) => {
				return generateRule(style, options, ["dimensions", "minWidth"], "minWidth");
			}
		},
		{
			name: "aspectRatio",
			generate: (style, options) => {
				return generateRule(style, options, ["dimensions", "aspectRatio"], "aspectRatio");
			}
		},
		{
			name: "width",
			generate: (style, options) => {
				return generateRule(style, options, ["dimensions", "width"], "width");
			}
		},
		{
			name: "objectFit",
			generate: (style, options) => {
				return generateRule(style, options, ["dimensions", "objectFit"], "objectFit");
			}
		}
	];

// packages/style-engine/build-module/styles/background/index.mjs
	const backgroundImage = {
		name: "backgroundImage",
		generate: (style, options) => {
			const _backgroundImage = style?.background?.backgroundImage;
			const gradient = getCSSValueFromRawStyle(style?.background?.gradient) || "";
			if (!_backgroundImage && !gradient) return [];
			const cssValue = [gradient, typeof _backgroundImage === "object" && _backgroundImage?.url ? `url( '${encodeURI(safeDecodeURI(_backgroundImage.url))}' )` : getCSSValueFromRawStyle(_backgroundImage)].filter(Boolean).join(", ");
			return !!cssValue ? [{
				selector: options.selector,
				key: "backgroundImage",
				value: cssValue
			}] : [];
		}
	};
	const backgroundPosition = {
		name: "backgroundPosition",
		generate: (style, options) => {
			return generateRule(style, options, ["background", "backgroundPosition"], "backgroundPosition");
		}
	};
	const backgroundRepeat = {
		name: "backgroundRepeat",
		generate: (style, options) => {
			return generateRule(style, options, ["background", "backgroundRepeat"], "backgroundRepeat");
		}
	};
	const backgroundSize = {
		name: "backgroundSize",
		generate: (style, options) => {
			return generateRule(style, options, ["background", "backgroundSize"], "backgroundSize");
		}
	};
	const backgroundAttachment = {
		name: "backgroundAttachment",
		generate: (style, options) => {
			return generateRule(style, options, ["background", "backgroundAttachment"], "backgroundAttachment");
		}
	};
	/**
	* The values `background-clip` accepts. Anything else generates no CSS.
	*/
	const VALID_BACKGROUND_CLIP_VALUES = [
		"border-box",
		"padding-box",
		"content-box",
		"text"
	];
	var background_default = [
		backgroundImage,
		backgroundPosition,
		backgroundRepeat,
		backgroundSize,
		backgroundAttachment,
		{
			name: "backgroundClip",
			generate: (style, options) => {
				const value = style?.background?.backgroundClip;
				if (!value || !VALID_BACKGROUND_CLIP_VALUES.includes(value)) return [];
				const rules = [{
					selector: options.selector,
					key: "backgroundClip",
					value
				}];
				if (value === "text") rules.push({
					selector: options.selector,
					key: "-webkit-background-clip",
					value: "text"
				}, {
					selector: options.selector,
					key: "-webkit-text-fill-color",
					value: "transparent"
				});
				else rules.push({
					selector: options.selector,
					key: "-webkit-text-fill-color",
					value: "currentColor"
				});
				return rules;
			}
		}
	];

// packages/style-engine/build-module/styles/shadow/index.mjs
	var shadow_default = [{
		name: "shadow",
		generate: (style, options) => {
			return generateRule(style, options, ["shadow"], "boxShadow");
		}
	}];

// packages/style-engine/build-module/styles/outline/index.mjs
	var outline_default = [
		{
			name: "color",
			generate: (style, options, path = ["outline", "color"], ruleKey = "outlineColor") => {
				return generateRule(style, options, path, ruleKey);
			}
		},
		{
			name: "style",
			generate: (style, options, path = ["outline", "style"], ruleKey = "outlineStyle") => {
				return generateRule(style, options, path, ruleKey);
			}
		},
		{
			name: "offset",
			generate: (style, options, path = ["outline", "offset"], ruleKey = "outlineOffset") => {
				return generateRule(style, options, path, ruleKey);
			}
		},
		{
			name: "width",
			generate: (style, options, path = ["outline", "width"], ruleKey = "outlineWidth") => {
				return generateRule(style, options, path, ruleKey);
			}
		}
	];

// packages/style-engine/build-module/styles/spacing/padding.mjs
	const padding = {
		name: "padding",
		generate: (style, options) => {
			return generateBoxRules(style, options, ["spacing", "padding"], {
				default: "padding",
				individual: "padding%s"
			});
		}
	};

// packages/style-engine/build-module/styles/spacing/margin.mjs
	const margin = {
		name: "margin",
		generate: (style, options) => {
			return generateBoxRules(style, options, ["spacing", "margin"], {
				default: "margin",
				individual: "margin%s"
			});
		}
	};

// packages/style-engine/build-module/styles/spacing/index.mjs
	var spacing_default = [margin, padding];

// packages/style-engine/build-module/styles/typography/index.mjs
	var typography_default = [
		{
			name: "fontFamily",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "fontFamily"], "fontFamily");
			}
		},
		{
			name: "fontSize",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "fontSize"], "fontSize");
			}
		},
		{
			name: "fontStyle",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "fontStyle"], "fontStyle");
			}
		},
		{
			name: "fontWeight",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "fontWeight"], "fontWeight");
			}
		},
		{
			name: "letterSpacing",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "letterSpacing"], "letterSpacing");
			}
		},
		{
			name: "lineHeight",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "lineHeight"], "lineHeight");
			}
		},
		{
			name: "textColumns",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "textColumns"], "columnCount");
			}
		},
		{
			name: "textDecoration",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "textDecoration"], "textDecoration");
			}
		},
		{
			name: "textIndent",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "textIndent"], "textIndent");
			}
		},
		{
			name: "textShadow",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "textShadow"], "textShadow");
			}
		},
		{
			name: "textTransform",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "textTransform"], "textTransform");
			}
		},
		{
			name: "writingMode",
			generate: (style, options) => {
				return generateRule(style, options, ["typography", "writingMode"], "writingMode");
			}
		}
	];

// packages/style-engine/build-module/styles/index.mjs
	const styleDefinitions = [
		...border_default,
		...color_default,
		...dimensions_default,
		...outline_default,
		...spacing_default,
		...typography_default,
		...shadow_default,
		...background_default
	];

// packages/style-engine/build-module/index.mjs
/**
	* Generates a stylesheet for a given style object and selector.
	*
	* @since 6.1.0 Introduced in WordPress core.
	*
	* @param style   Style object, for example, the value of a block's attributes.style object or the top level styles in theme.json
	* @param options Options object with settings to adjust how the styles are generated.
	*
	* @example
	* ```js
	* import { compileCSS } from '@wordpress/style-engine';
	*
	* // With a selector, a full stylesheet string is returned.
	* compileCSS(
	* 	{ spacing: { padding: '10px', margin: '12px' } },
	* 	{ selector: '.my-block' }
	* );
	* // '.my-block { margin: 12px; padding: 10px; }'
	*
	* // Without a selector, inline declarations are returned.
	* compileCSS( { spacing: { padding: '10px', margin: '12px' } } );
	* // 'margin: 12px; padding: 10px;'
	* ```
	*
	* @return A generated stylesheet or inline style declarations.
	*/
	function compileCSS(style, options = {}) {
		const rules = getCSSRules(style, options);
		if (!options?.selector) {
			const inlineRules = [];
			rules.forEach((rule) => {
				inlineRules.push(`${rule.key.startsWith("-") ? rule.key : paramCase(rule.key)}: ${rule.value};`);
			});
			return inlineRules.join(" ");
		}
		const groupedRules = rules.reduce((acc, rule) => {
			const { selector } = rule;
			if (!selector) return acc;
			if (!acc[selector]) acc[selector] = [];
			acc[selector].push(rule);
			return acc;
		}, {});
		return Object.keys(groupedRules).reduce((acc, subSelector) => {
			acc.push(`${subSelector} { ${groupedRules[subSelector].map((rule) => `${rule.key.startsWith("-") ? rule.key : paramCase(rule.key)}: ${rule.value};`).join(" ")} }`);
			return acc;
		}, []).join("\n");
	}
	/**
	* Returns a JSON representation of the generated CSS rules.
	*
	* @since 6.1.0 Introduced in WordPress core.
	*
	* @param style   Style object, for example, the value of a block's attributes.style object or the top level styles in theme.json
	* @param options Options object with settings to adjust how the styles are generated.
	*
	* @example
	* ```js
	* import { getCSSRules } from '@wordpress/style-engine';
	*
	* getCSSRules(
	* 	{ spacing: { padding: '10px', margin: '12px' } },
	* 	{ selector: '.my-block' }
	* );
	* // [
	* //   { selector: '.my-block', key: 'margin', value: '12px' },
	* //   { selector: '.my-block', key: 'padding', value: '10px' },
	* // ]
	* ```
	*
	* @return A collection of objects containing the selector, if any, the CSS property key (camelcase) and parsed CSS value.
	*/
	function getCSSRules(style, options = {}) {
		const rules = [];
		styleDefinitions.forEach((definition) => {
			if (typeof definition.generate === "function") rules.push(...definition.generate(style, options));
		});
		return rules;
	}

exports.VALID_BACKGROUND_CLIP_VALUES = VALID_BACKGROUND_CLIP_VALUES;
exports.compileCSS = compileCSS;
exports.getCSSRules = getCSSRules;
exports.getCSSValueFromRawStyle = getCSSValueFromRawStyle;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).styleEngine = exports;
return exports;
})({});
//# sourceMappingURL=index.js.map