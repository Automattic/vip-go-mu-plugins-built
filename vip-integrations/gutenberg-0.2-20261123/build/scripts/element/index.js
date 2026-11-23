(function(exports, react, _wordpress_escape_html, react_dom, react_dom_client) {

"use strict";
// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
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

react_dom = __toESM(react_dom, 1);

// packages/element/build-module/react.mjs
/**
	* Concatenate two or more React children objects.
	*
	* @param childrenArguments - Array of children arguments (array of arrays/strings/objects) to concatenate.
	* @return The concatenated value.
	*/
	function concatChildren(...childrenArguments) {
		return childrenArguments.reduce((accumulator, children, i) => {
			react.Children.forEach(children, (child, j) => {
				if ((0, react.isValidElement)(child) && typeof child !== "string") child = (0, react.cloneElement)(child, { key: [i, j].join() });
				accumulator.push(child);
			});
			return accumulator;
		}, []);
	}
	/**
	* Switches the nodeName of all the elements in the children object.
	*
	* @param children Children object.
	* @param nodeName Node name.
	*
	* @return  The updated children object.
	*/
	function switchChildrenNodeName(children, nodeName) {
		return children && react.Children.map(children, (elt, index) => {
			if (typeof elt?.valueOf() === "string") return (0, react.createElement)(nodeName, { key: index }, elt);
			if (!(0, react.isValidElement)(elt)) return elt;
			const { children: childrenProp, ...props } = elt.props;
			return (0, react.createElement)(nodeName, {
				key: index,
				...props
			}, childrenProp);
		});
	}

// packages/element/build-module/create-interpolate-element.mjs
	let indoc;
	let offset;
	let output;
	let stack;
	/**
	* Matches tags in the localized string
	*
	* This is used for extracting the tag pattern groups for parsing the localized
	* string and along with the map converting it to a react element.
	*
	* There are four references extracted using this tokenizer:
	*
	* match: Full match of the tag (i.e. <strong>, </strong>, <br/>)
	* isClosing: The closing slash, if it exists.
	* name: The name portion of the tag (strong, br) (if )
	* isSelfClosed: The slash on a self closing tag, if it exists.
	*/
	const tokenizer = /<(\/)?(\w+)\s*(\/)?>/g;
	/**
	* Tracks recursive-descent parse state.
	*
	* This is a Stack frame holding parent elements until all children have been
	* parsed.
	*
	* @private
	* @param element          A parent element which may still have
	*                         nested children not yet parsed.
	* @param tokenStart       Offset at which parent element first
	*                         appears.
	* @param tokenLength      Length of string marking start of parent
	*                         element.
	* @param prevOffset       Running offset at which parsing should
	*                         continue.
	* @param leadingTextStart Offset at which last closing element
	*                         finished, used for finding text between
	*                         elements.
	*
	* @return The stack frame tracking parse progress.
	*/
	function createFrame(element, tokenStart, tokenLength, prevOffset, leadingTextStart) {
		return {
			element,
			tokenStart,
			tokenLength,
			prevOffset,
			leadingTextStart,
			children: []
		};
	}
	/**
	* This function creates an interpolated element from a passed in string with
	* specific tags matching how the string should be converted to an element via
	* the conversion map value.
	*
	* @example
	* For example, for the given string:
	*
	* "This is a <span>string</span> with <a>a link</a> and a self-closing
	* <CustomComponentB/> tag"
	*
	* You would have something like this as the conversionMap value:
	*
	* ```js
	* {
	*     span: <span />,
	*     a: <a href={ 'https://github.com' } />,
	*     CustomComponentB: <CustomComponent />,
	* }
	* ```
	*
	* @param  interpolatedString The interpolation string to be parsed.
	* @param  conversionMap      The map used to convert the string to
	*                            a react element.
	* @throws {TypeError}
	* @return A wp element.
	*/
	function createInterpolateElement(interpolatedString, conversionMap) {
		indoc = interpolatedString;
		offset = 0;
		output = [];
		stack = [];
		tokenizer.lastIndex = 0;
		if (!isValidConversionMap(conversionMap)) throw new TypeError("The conversionMap provided is not valid. It must be an object with values that are React Elements");
		do;
		while (proceed(conversionMap));
		return (0, react.createElement)(react.Fragment, null, ...output);
	}
	/**
	* Validate conversion map.
	*
	* A map is considered valid if it's an object and every value in the object
	* is a React Element
	*
	* @private
	*
	* @param conversionMap The map being validated.
	*
	* @return True means the map is valid.
	*/
	const isValidConversionMap = (conversionMap) => {
		const isObject = typeof conversionMap === "object" && conversionMap !== null;
		const values = isObject && Object.values(conversionMap);
		return isObject && values.length > 0 && values.every((element) => (0, react.isValidElement)(element));
	};
	/**
	* This is the iterator over the matches in the string.
	*
	* @private
	*
	* @param conversionMap The conversion map for the string.
	*
	* @return true for continuing to iterate, false for finished.
	*/
	function proceed(conversionMap) {
		const [tokenType, name, startOffset, tokenLength] = nextToken();
		const stackDepth = stack.length;
		const leadingTextStart = startOffset > offset ? offset : null;
		if (name && !Object.keys(conversionMap).includes(name)) {
			addText();
			return false;
		}
		switch (tokenType) {
			case "no-more-tokens":
				if (stackDepth !== 0) {
					const { leadingTextStart: stackLeadingText, tokenStart } = stack.pop();
					output.push(indoc.substr(stackLeadingText, tokenStart));
				}
				addText();
				return false;
			case "self-closed":
				if (0 === stackDepth) {
					if (null !== leadingTextStart) output.push(indoc.substr(leadingTextStart, startOffset - leadingTextStart));
					output.push(conversionMap[name]);
					offset = startOffset + tokenLength;
					return true;
				}
				addChild(createFrame(conversionMap[name], startOffset, tokenLength));
				offset = startOffset + tokenLength;
				return true;
			case "opener":
				stack.push(createFrame(conversionMap[name], startOffset, tokenLength, startOffset + tokenLength, leadingTextStart));
				offset = startOffset + tokenLength;
				return true;
			case "closer":
				if (0 === stackDepth) {
					console.warn(`Unmatched closing tag '</${name}>' in createInterpolateElement. The rest of the string was not interpolated.`);
					addText();
					return false;
				}
				if (1 === stackDepth) {
					closeOuterElement(startOffset);
					offset = startOffset + tokenLength;
					return true;
				}
				const stackTop = stack.pop();
				const text = indoc.substr(stackTop.prevOffset, startOffset - stackTop.prevOffset);
				stackTop.children.push(text);
				stackTop.prevOffset = startOffset + tokenLength;
				const frame = createFrame(stackTop.element, stackTop.tokenStart, stackTop.tokenLength, startOffset + tokenLength);
				frame.children = stackTop.children;
				addChild(frame);
				offset = startOffset + tokenLength;
				return true;
			default:
				addText();
				return false;
		}
	}
	/**
	* Grabs the next token match in the string and returns it's details.
	*
	* @private
	*
	* @return An array of details for the token matched.
	*/
	function nextToken() {
		const matches = tokenizer.exec(indoc);
		if (null === matches) return ["no-more-tokens"];
		const startedAt = matches.index;
		const [match, isClosing, name, isSelfClosed] = matches;
		const length = match.length;
		if (isSelfClosed) return [
			"self-closed",
			name,
			startedAt,
			length
		];
		if (isClosing) return [
			"closer",
			name,
			startedAt,
			length
		];
		return [
			"opener",
			name,
			startedAt,
			length
		];
	}
	/**
	* Pushes text extracted from the indoc string to the output stack given the
	* current rawLength value and offset (if rawLength is provided ) or the
	* indoc.length and offset.
	*
	* @private
	*/
	function addText() {
		const length = indoc.length - offset;
		if (0 === length) return;
		output.push(indoc.substr(offset, length));
	}
	/**
	* Pushes a child element to the associated parent element's children for the
	* parent currently active in the stack.
	*
	* @private
	*
	* @param {Frame} frame The Frame containing the child element and it's
	*                      token information.
	*/
	function addChild(frame) {
		const { element, tokenStart, tokenLength, prevOffset, children } = frame;
		const parent = stack[stack.length - 1];
		const text = indoc.substr(parent.prevOffset, tokenStart - parent.prevOffset);
		if (text) parent.children.push(text);
		parent.children.push((0, react.cloneElement)(element, null, ...children));
		parent.prevOffset = prevOffset ? prevOffset : tokenStart + tokenLength;
	}
	/**
	* This is called for closing tags. It creates the element currently active in
	* the stack.
	*
	* @private
	*
	* @param {number} endOffset Offset at which the closing tag for the element
	*                           begins in the string. If this is greater than the
	*                           prevOffset attached to the element, then this
	*                           helps capture any remaining nested text nodes in
	*                           the element.
	*/
	function closeOuterElement(endOffset) {
		const { element, leadingTextStart, prevOffset, tokenStart, children } = stack.pop();
		const text = endOffset ? indoc.substr(prevOffset, endOffset - prevOffset) : indoc.substr(prevOffset);
		if (text) children.push(text);
		if (null !== leadingTextStart) output.push(indoc.substr(leadingTextStart, tokenStart - leadingTextStart));
		output.push((0, react.cloneElement)(element, null, ...children));
	}

// packages/element/build-module/platform.mjs
/**
	* Component used to detect the current Platform being used.
	* Use Platform.OS === 'web' to detect if running on web environment.
	*
	* Here is an example of how to use the select method:
	* @example
	* ```js
	* import { Platform } from '@wordpress/element';
	*
	* const placeholderLabel = Platform.select( {
	*   web: __( 'Drag images, upload new ones or select files from your library.' ),
	*   default: __( 'Add media' ),
	* } );
	* ```
	*/
	const Platform = {
		/** Platform identifier. Will always be `'web'` in this module. */
		OS: "web",
		/**
		* Select a value based on the platform.
		*
		* @template T
		* @param    spec - Object with optional platform-specific values.
		* @return The selected value.
		*/
		select(spec) {
			return "web" in spec ? spec.web : spec.default;
		},
		/** Whether the platform is web */
		isWeb: true
	};

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

// packages/element/build-module/raw-html.mjs
/**
	* Component used to render unescaped HTML.
	*
	* Note: The `renderElement` serializer will remove the `div` wrapper
	* unless non-children props are present; typically when preparing a block for saving.
	*
	* @example
	* ```jsx
	* import { RawHTML } from '@wordpress/element';
	*
	* const Component = () => <RawHTML><h3>Hello world</h3></RawHTML>;
	* // Edit: <div><h3>Hello world</h3></div>
	* // save: <h3>Hello world</h3>
	* ```
	*
	* @param {RawHTMLProps} props Children should be a string of HTML or an array
	*                             of strings. Other props will be passed through
	*                             to the div wrapper.
	*
	* @return Dangerously-rendering component.
	*/
	function RawHTML({ children, ...props }) {
		let rawHtml = "";
		react.Children.toArray(children).forEach((child) => {
			if (typeof child === "string" && child.trim() !== "") rawHtml += child;
		});
		return (0, react.createElement)("div", {
			dangerouslySetInnerHTML: { __html: rawHtml },
			...props
		});
	}

// packages/element/build-module/serialize.mjs
/**
	* Parts of this source were derived and modified from fast-react-render,
	* released under the MIT license.
	*
	* https://github.com/alt-j/fast-react-render
	*
	* Copyright (c) 2016 Andrey Morozov
	*
	* Permission is hereby granted, free of charge, to any person obtaining a copy
	* of this software and associated documentation files (the "Software"), to deal
	* in the Software without restriction, including without limitation the rights
	* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	* copies of the Software, and to permit persons to whom the Software is
	* furnished to do so, subject to the following conditions:
	*
	* The above copyright notice and this permission notice shall be included in
	* all copies or substantial portions of the Software.
	*
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	* THE SOFTWARE.
	*/
	/** @typedef {React.ReactElement} ReactElement */
	const Context = (0, react.createContext)(void 0);
	Context.displayName = "ElementContext";
	const { Provider, Consumer } = Context;
	const ForwardRef = (0, react.forwardRef)(() => {
		return null;
	});
	const Memo = (0, react.memo)(() => {
		return null;
	});
	/**
	* Valid attribute types.
	*/
	const ATTRIBUTES_TYPES = /* @__PURE__ */ new Set([
		"string",
		"boolean",
		"number"
	]);
	/**
	* Element tags which can be self-closing.
	*/
	const SELF_CLOSING_TAGS = /* @__PURE__ */ new Set([
		"area",
		"base",
		"br",
		"col",
		"command",
		"embed",
		"hr",
		"img",
		"input",
		"keygen",
		"link",
		"meta",
		"param",
		"source",
		"track",
		"wbr"
	]);
	/**
	* Boolean attributes are attributes whose presence as being assigned is
	* meaningful, even if only empty.
	*
	* See: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
	* Extracted from: https://html.spec.whatwg.org/multipage/indices.html#attributes-3
	*
	* Object.keys( [ ...document.querySelectorAll( '#attributes-1 > tbody > tr' ) ]
	*     .filter( ( tr ) => tr.lastChild.textContent.indexOf( 'Boolean attribute' ) !== -1 )
	*     .reduce( ( result, tr ) => Object.assign( result, {
	*         [ tr.firstChild.textContent.trim() ]: true
	*     } ), {} ) ).sort();
	*/
	const BOOLEAN_ATTRIBUTES = /* @__PURE__ */ new Set([
		"allowfullscreen",
		"allowpaymentrequest",
		"allowusermedia",
		"async",
		"autofocus",
		"autoplay",
		"checked",
		"controls",
		"default",
		"defer",
		"disabled",
		"download",
		"formnovalidate",
		"hidden",
		"ismap",
		"itemscope",
		"loop",
		"multiple",
		"muted",
		"nomodule",
		"novalidate",
		"open",
		"playsinline",
		"readonly",
		"required",
		"reversed",
		"selected",
		"typemustmatch"
	]);
	/**
	* Enumerated attributes are attributes which must be of a specific value form.
	* Like boolean attributes, these are meaningful if specified, even if not of a
	* valid enumerated value.
	*
	* See: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#enumerated-attribute
	* Extracted from: https://html.spec.whatwg.org/multipage/indices.html#attributes-3
	*
	* Object.keys( [ ...document.querySelectorAll( '#attributes-1 > tbody > tr' ) ]
	*     .filter( ( tr ) => /^("(.+?)";?\s*)+/.test( tr.lastChild.textContent.trim() ) )
	*     .reduce( ( result, tr ) => Object.assign( result, {
	*         [ tr.firstChild.textContent.trim() ]: true
	*     } ), {} ) ).sort();
	*
	* Some notable omissions:
	*
	*  - `alt`: https://blog.whatwg.org/omit-alt
	*/
	const ENUMERATED_ATTRIBUTES = /* @__PURE__ */ new Set([
		"autocapitalize",
		"autocomplete",
		"charset",
		"contenteditable",
		"crossorigin",
		"decoding",
		"dir",
		"draggable",
		"enctype",
		"formenctype",
		"formmethod",
		"http-equiv",
		"inputmode",
		"kind",
		"method",
		"preload",
		"scope",
		"shape",
		"spellcheck",
		"translate",
		"type",
		"wrap"
	]);
	/**
	* Set of CSS style properties which support assignment of unitless numbers.
	* Used in rendering of style properties, where `px` unit is assumed unless
	* property is included in this set or value is zero.
	*
	* Generated via:
	*
	* Object.entries( document.createElement( 'div' ).style )
	*     .filter( ( [ key ] ) => (
	*         ! /^(webkit|ms|moz)/.test( key ) &&
	*         ( e.style[ key ] = 10 ) &&
	*         e.style[ key ] === '10'
	*     ) )
	*     .map( ( [ key ] ) => key )
	*     .sort();
	*/
	const CSS_PROPERTIES_SUPPORTS_UNITLESS = /* @__PURE__ */ new Set([
		"animation",
		"animationIterationCount",
		"baselineShift",
		"borderImageOutset",
		"borderImageSlice",
		"borderImageWidth",
		"columnCount",
		"cx",
		"cy",
		"fillOpacity",
		"flexGrow",
		"flexShrink",
		"floodOpacity",
		"fontWeight",
		"gridColumnEnd",
		"gridColumnStart",
		"gridRowEnd",
		"gridRowStart",
		"lineHeight",
		"opacity",
		"order",
		"orphans",
		"r",
		"rx",
		"ry",
		"shapeImageThreshold",
		"stopOpacity",
		"strokeDasharray",
		"strokeDashoffset",
		"strokeMiterlimit",
		"strokeOpacity",
		"strokeWidth",
		"tabSize",
		"widows",
		"x",
		"y",
		"zIndex",
		"zoom"
	]);
	/**
	* Returns true if the specified string is prefixed by one of an array of
	* possible prefixes.
	* @param string
	* @param prefixes
	*/
	function hasPrefix(string, prefixes) {
		return prefixes.some((prefix) => string.indexOf(prefix) === 0);
	}
	/**
	* Returns true if the given prop name should be ignored in attributes
	* serialization, or false otherwise.
	* @param attribute
	*/
	function isInternalAttribute(attribute) {
		return "key" === attribute || "children" === attribute;
	}
	/**
	* Returns the normal form of the element's attribute value for HTML.
	* @param attribute
	* @param value
	*/
	function getNormalAttributeValue(attribute, value) {
		switch (attribute) {
			case "style": return renderStyle(value);
		}
		return value;
	}
	/**
	* This is a map of all SVG attributes that have dashes. Map(lower case prop => dashed lower case attribute).
	* We need this to render e.g strokeWidth as stroke-width.
	*
	* List from: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute.
	*/
	const SVG_ATTRIBUTE_WITH_DASHES_LIST = [
		"accentHeight",
		"alignmentBaseline",
		"arabicForm",
		"baselineShift",
		"capHeight",
		"clipPath",
		"clipRule",
		"colorInterpolation",
		"colorInterpolationFilters",
		"colorProfile",
		"colorRendering",
		"dominantBaseline",
		"enableBackground",
		"fillOpacity",
		"fillRule",
		"floodColor",
		"floodOpacity",
		"fontFamily",
		"fontSize",
		"fontSizeAdjust",
		"fontStretch",
		"fontStyle",
		"fontVariant",
		"fontWeight",
		"glyphName",
		"glyphOrientationHorizontal",
		"glyphOrientationVertical",
		"horizAdvX",
		"horizOriginX",
		"imageRendering",
		"letterSpacing",
		"lightingColor",
		"markerEnd",
		"markerMid",
		"markerStart",
		"overlinePosition",
		"overlineThickness",
		"paintOrder",
		"panose1",
		"pointerEvents",
		"renderingIntent",
		"shapeRendering",
		"stopColor",
		"stopOpacity",
		"strikethroughPosition",
		"strikethroughThickness",
		"strokeDasharray",
		"strokeDashoffset",
		"strokeLinecap",
		"strokeLinejoin",
		"strokeMiterlimit",
		"strokeOpacity",
		"strokeWidth",
		"textAnchor",
		"textDecoration",
		"textRendering",
		"underlinePosition",
		"underlineThickness",
		"unicodeBidi",
		"unicodeRange",
		"unitsPerEm",
		"vAlphabetic",
		"vHanging",
		"vIdeographic",
		"vMathematical",
		"vectorEffect",
		"vertAdvY",
		"vertOriginX",
		"vertOriginY",
		"wordSpacing",
		"writingMode",
		"xmlnsXlink",
		"xHeight"
	].reduce((map, attribute) => {
		map[attribute.toLowerCase()] = attribute;
		return map;
	}, {});
	/**
	* This is a map of all case-sensitive SVG attributes. Map(lowercase key => proper case attribute).
	* The keys are lower-cased for more robust lookup.
	* Note that this list only contains attributes that contain at least one capital letter.
	* Lowercase attributes don't need mapping, since we lowercase all attributes by default.
	*/
	const CASE_SENSITIVE_SVG_ATTRIBUTES = [
		"allowReorder",
		"attributeName",
		"attributeType",
		"autoReverse",
		"baseFrequency",
		"baseProfile",
		"calcMode",
		"clipPathUnits",
		"contentScriptType",
		"contentStyleType",
		"diffuseConstant",
		"edgeMode",
		"externalResourcesRequired",
		"filterRes",
		"filterUnits",
		"glyphRef",
		"gradientTransform",
		"gradientUnits",
		"kernelMatrix",
		"kernelUnitLength",
		"keyPoints",
		"keySplines",
		"keyTimes",
		"lengthAdjust",
		"limitingConeAngle",
		"markerHeight",
		"markerUnits",
		"markerWidth",
		"maskContentUnits",
		"maskUnits",
		"numOctaves",
		"pathLength",
		"patternContentUnits",
		"patternTransform",
		"patternUnits",
		"pointsAtX",
		"pointsAtY",
		"pointsAtZ",
		"preserveAlpha",
		"preserveAspectRatio",
		"primitiveUnits",
		"refX",
		"refY",
		"repeatCount",
		"repeatDur",
		"requiredExtensions",
		"requiredFeatures",
		"specularConstant",
		"specularExponent",
		"spreadMethod",
		"startOffset",
		"stdDeviation",
		"stitchTiles",
		"suppressContentEditableWarning",
		"suppressHydrationWarning",
		"surfaceScale",
		"systemLanguage",
		"tableValues",
		"targetX",
		"targetY",
		"textLength",
		"viewBox",
		"viewTarget",
		"xChannelSelector",
		"yChannelSelector"
	].reduce((map, attribute) => {
		map[attribute.toLowerCase()] = attribute;
		return map;
	}, {});
	/**
	* This is a map of all SVG attributes that have colons.
	* Keys are lower-cased and stripped of their colons for more robust lookup.
	*/
	const SVG_ATTRIBUTES_WITH_COLONS = [
		"xlink:actuate",
		"xlink:arcrole",
		"xlink:href",
		"xlink:role",
		"xlink:show",
		"xlink:title",
		"xlink:type",
		"xml:base",
		"xml:lang",
		"xml:space",
		"xmlns:xlink"
	].reduce((map, attribute) => {
		map[attribute.replace(":", "").toLowerCase()] = attribute;
		return map;
	}, {});
	/**
	* Returns the normal form of the element's attribute name for HTML.
	* @param attribute
	*/
	function getNormalAttributeName(attribute) {
		switch (attribute) {
			case "htmlFor": return "for";
			case "className": return "class";
		}
		const attributeLowerCase = attribute.toLowerCase();
		if (CASE_SENSITIVE_SVG_ATTRIBUTES[attributeLowerCase]) return CASE_SENSITIVE_SVG_ATTRIBUTES[attributeLowerCase];
		else if (SVG_ATTRIBUTE_WITH_DASHES_LIST[attributeLowerCase]) return paramCase(SVG_ATTRIBUTE_WITH_DASHES_LIST[attributeLowerCase]);
		else if (SVG_ATTRIBUTES_WITH_COLONS[attributeLowerCase]) return SVG_ATTRIBUTES_WITH_COLONS[attributeLowerCase];
		return attributeLowerCase;
	}
	/**
	* Returns the normal form of the style property name for HTML.
	*
	* - Converts property names to kebab-case, e.g. 'backgroundColor' → 'background-color'
	* - Leaves custom attributes alone, e.g. '--myBackgroundColor' → '--myBackgroundColor'
	* - Converts vendor-prefixed property names to -kebab-case, e.g. 'MozTransform' → '-moz-transform'
	* @param property
	*/
	function getNormalStylePropertyName(property) {
		if (property.startsWith("--")) return property;
		if (hasPrefix(property, [
			"ms",
			"O",
			"Moz",
			"Webkit"
		])) return "-" + paramCase(property);
		return paramCase(property);
	}
	/**
	* Returns the normal form of the style property value for HTML. Appends a
	* default pixel unit if numeric, not a unitless property, and not zero.
	* @param property
	* @param value
	*/
	function getNormalStylePropertyValue(property, value) {
		if (typeof value === "number" && 0 !== value && !hasPrefix(property, ["--"]) && !CSS_PROPERTIES_SUPPORTS_UNITLESS.has(property)) return value + "px";
		return value;
	}
	/**
	* Serializes a React element to string.
	* @param element
	* @param context
	* @param legacyContext
	*/
	function renderElement(element, context, legacyContext = {}) {
		if (null === element || void 0 === element || false === element) return "";
		if (Array.isArray(element)) return renderChildren(element, context, legacyContext);
		switch (typeof element) {
			case "string": return (0, _wordpress_escape_html.escapeHTML)(element);
			case "number": return element.toString();
		}
		const { type, props } = element;
		switch (type) {
			case react.StrictMode:
			case react.Fragment: return renderChildren(props.children, context, legacyContext);
			case RawHTML:
				const { children, ...wrapperProps } = props;
				return renderNativeComponent(!Object.keys(wrapperProps).length ? null : "div", {
					...wrapperProps,
					dangerouslySetInnerHTML: { __html: children }
				}, context, legacyContext);
		}
		switch (typeof type) {
			case "string": return renderNativeComponent(type, props, context, legacyContext);
			case "function":
				if (type.prototype && typeof type.prototype.render === "function") return renderComponent(type, props, context, legacyContext);
				return renderElement(type(props, legacyContext), context, legacyContext);
		}
		switch (type && type.$$typeof) {
			case Provider.$$typeof: return renderChildren(props.children, props.value, legacyContext);
			case Consumer.$$typeof:
				const contextValue = context !== void 0 ? context : (type._context || type)._currentValue;
				return renderElement(props.children(contextValue), context, legacyContext);
			case ForwardRef.$$typeof: return renderElement(type.render(props), context, legacyContext);
			case Memo.$$typeof: return renderElement((0, react.createElement)(type.type, props), context, legacyContext);
		}
		return "";
	}
	/**
	* Serializes a native component type to string.
	* @param type
	* @param props
	* @param context
	* @param legacyContext
	*/
	function renderNativeComponent(type, props, context, legacyContext = {}) {
		let content = "";
		if (type === "textarea" && props.hasOwnProperty("value")) {
			content = renderChildren(props.value, context, legacyContext);
			const { value, ...restProps } = props;
			props = restProps;
		} else if (props.dangerouslySetInnerHTML && typeof props.dangerouslySetInnerHTML.__html === "string") content = props.dangerouslySetInnerHTML.__html;
		else if (typeof props.children !== "undefined") content = renderChildren(props.children, context, legacyContext);
		if (!type) return content;
		const attributes = renderAttributes(props);
		if (SELF_CLOSING_TAGS.has(type)) return "<" + type + attributes + "/>";
		return "<" + type + attributes + ">" + content + "</" + type + ">";
	}
	/**
	* Serializes a non-native component type to string.
	* @param Component
	* @param props
	* @param context
	* @param legacyContext
	*/
	function renderComponent(Component, props, context, legacyContext = {}) {
		const instance = new Component(props, legacyContext);
		if (typeof instance.getChildContext === "function") Object.assign(legacyContext, instance.getChildContext());
		return renderElement(instance.render(), context, legacyContext);
	}
	/**
	* Serializes an array of children to string.
	* @param children
	* @param context
	* @param legacyContext
	*/
	function renderChildren(children, context, legacyContext = {}) {
		let result = "";
		const childrenArray = Array.isArray(children) ? children : [children];
		for (let i = 0; i < childrenArray.length; i++) {
			const child = childrenArray[i];
			result += renderElement(child, context, legacyContext);
		}
		return result;
	}
	/**
	* Renders a props object as a string of HTML attributes.
	* @param props
	*/
	function renderAttributes(props) {
		let result = "";
		for (const key in props) {
			const attribute = getNormalAttributeName(key);
			if (!(0, _wordpress_escape_html.isValidAttributeName)(attribute)) continue;
			let value = getNormalAttributeValue(key, props[key]);
			if (!ATTRIBUTES_TYPES.has(typeof value)) continue;
			if (isInternalAttribute(key)) continue;
			const isBooleanAttribute = BOOLEAN_ATTRIBUTES.has(attribute);
			if (isBooleanAttribute && value === false) continue;
			const isMeaningfulAttribute = isBooleanAttribute || hasPrefix(key, ["data-", "aria-"]) || ENUMERATED_ATTRIBUTES.has(attribute);
			if (typeof value === "boolean" && !isMeaningfulAttribute) continue;
			result += " " + attribute;
			if (isBooleanAttribute) continue;
			if (typeof value === "string") value = (0, _wordpress_escape_html.escapeAttribute)(value);
			result += "=\"" + value + "\"";
		}
		return result;
	}
	/**
	* Renders a style object as a string attribute value.
	* @param style
	*/
	function renderStyle(style) {
		if (!isPlainObject(style)) return style;
		let result;
		const styleObj = style;
		for (const property in styleObj) {
			const value = styleObj[property];
			if (null === value || void 0 === value) continue;
			if (result) result += ";";
			else result = "";
			const normalName = getNormalStylePropertyName(property);
			const normalValue = getNormalStylePropertyValue(property, value);
			result += normalName + ":" + normalValue;
		}
		return result;
	}

// packages/element/build-module/react-platform.mjs
	const { createPortal, flushSync, findDOMNode, render, hydrate, unmountComponentAtNode } = react_dom;

// packages/element/build-module/utils.mjs
/**
	* Checks if the provided WP element is empty.
	*
	* @param element WP element to check.
	* @return True when an element is considered empty.
	*/
	const isEmptyElement = (element) => {
		if (typeof element === "number") return false;
		if (typeof element?.valueOf() === "string" || Array.isArray(element)) return !element.length;
		return !element;
	};

Object.defineProperty(exports, "Children", {
  enumerable: true,
  get: function () {
    return react.Children;
  }
});
Object.defineProperty(exports, "Component", {
  enumerable: true,
  get: function () {
    return react.Component;
  }
});
Object.defineProperty(exports, "Fragment", {
  enumerable: true,
  get: function () {
    return react.Fragment;
  }
});
exports.Platform = Platform;
Object.defineProperty(exports, "PureComponent", {
  enumerable: true,
  get: function () {
    return react.PureComponent;
  }
});
exports.RawHTML = RawHTML;
Object.defineProperty(exports, "StrictMode", {
  enumerable: true,
  get: function () {
    return react.StrictMode;
  }
});
Object.defineProperty(exports, "Suspense", {
  enumerable: true,
  get: function () {
    return react.Suspense;
  }
});
Object.defineProperty(exports, "cloneElement", {
  enumerable: true,
  get: function () {
    return react.cloneElement;
  }
});
exports.concatChildren = concatChildren;
Object.defineProperty(exports, "createContext", {
  enumerable: true,
  get: function () {
    return react.createContext;
  }
});
Object.defineProperty(exports, "createElement", {
  enumerable: true,
  get: function () {
    return react.createElement;
  }
});
exports.createInterpolateElement = createInterpolateElement;
exports.createPortal = createPortal;
Object.defineProperty(exports, "createRef", {
  enumerable: true,
  get: function () {
    return react.createRef;
  }
});
Object.defineProperty(exports, "createRoot", {
  enumerable: true,
  get: function () {
    return react_dom_client.createRoot;
  }
});
exports.findDOMNode = findDOMNode;
exports.flushSync = flushSync;
Object.defineProperty(exports, "forwardRef", {
  enumerable: true,
  get: function () {
    return react.forwardRef;
  }
});
exports.hydrate = hydrate;
Object.defineProperty(exports, "hydrateRoot", {
  enumerable: true,
  get: function () {
    return react_dom_client.hydrateRoot;
  }
});
exports.isEmptyElement = isEmptyElement;
Object.defineProperty(exports, "isValidElement", {
  enumerable: true,
  get: function () {
    return react.isValidElement;
  }
});
Object.defineProperty(exports, "lazy", {
  enumerable: true,
  get: function () {
    return react.lazy;
  }
});
Object.defineProperty(exports, "memo", {
  enumerable: true,
  get: function () {
    return react.memo;
  }
});
exports.render = render;
exports.renderToString = renderElement;
Object.defineProperty(exports, "startTransition", {
  enumerable: true,
  get: function () {
    return react.startTransition;
  }
});
exports.switchChildrenNodeName = switchChildrenNodeName;
exports.unmountComponentAtNode = unmountComponentAtNode;
Object.defineProperty(exports, "useCallback", {
  enumerable: true,
  get: function () {
    return react.useCallback;
  }
});
Object.defineProperty(exports, "useContext", {
  enumerable: true,
  get: function () {
    return react.useContext;
  }
});
Object.defineProperty(exports, "useDebugValue", {
  enumerable: true,
  get: function () {
    return react.useDebugValue;
  }
});
Object.defineProperty(exports, "useDeferredValue", {
  enumerable: true,
  get: function () {
    return react.useDeferredValue;
  }
});
Object.defineProperty(exports, "useEffect", {
  enumerable: true,
  get: function () {
    return react.useEffect;
  }
});
Object.defineProperty(exports, "useId", {
  enumerable: true,
  get: function () {
    return react.useId;
  }
});
Object.defineProperty(exports, "useImperativeHandle", {
  enumerable: true,
  get: function () {
    return react.useImperativeHandle;
  }
});
Object.defineProperty(exports, "useInsertionEffect", {
  enumerable: true,
  get: function () {
    return react.useInsertionEffect;
  }
});
Object.defineProperty(exports, "useLayoutEffect", {
  enumerable: true,
  get: function () {
    return react.useLayoutEffect;
  }
});
Object.defineProperty(exports, "useMemo", {
  enumerable: true,
  get: function () {
    return react.useMemo;
  }
});
Object.defineProperty(exports, "useReducer", {
  enumerable: true,
  get: function () {
    return react.useReducer;
  }
});
Object.defineProperty(exports, "useRef", {
  enumerable: true,
  get: function () {
    return react.useRef;
  }
});
Object.defineProperty(exports, "useState", {
  enumerable: true,
  get: function () {
    return react.useState;
  }
});
Object.defineProperty(exports, "useSyncExternalStore", {
  enumerable: true,
  get: function () {
    return react.useSyncExternalStore;
  }
});
Object.defineProperty(exports, "useTransition", {
  enumerable: true,
  get: function () {
    return react.useTransition;
  }
});
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).element = exports;
return exports;
})({}, window.React, window.wp.escapeHtml, window.ReactDOM, window.ReactDOM);
//# sourceMappingURL=index.js.map