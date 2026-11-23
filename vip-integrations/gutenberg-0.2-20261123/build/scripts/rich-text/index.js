(function(exports, _wordpress_data, _wordpress_escape_html, _wordpress_a11y, _wordpress_i18n, _wordpress_private_apis, _wordpress_element, _wordpress_compose, _wordpress_deprecated, _wordpress_keycodes, _wordpress_dom) {

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

// packages/rich-text/build-module/store/reducer.mjs
/**
	* Reducer managing the format types
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function formatTypes(state = {}, action) {
		switch (action.type) {
			case "ADD_FORMAT_TYPES": return {
				...state,
				...action.formatTypes.reduce((newFormatTypes, type) => ({
					...newFormatTypes,
					[type.name]: type
				}), {})
			};
			case "REMOVE_FORMAT_TYPES": return Object.fromEntries(Object.entries(state).filter(([key]) => !action.names.includes(key)));
		}
		return state;
	}
	var reducer_default = (0, _wordpress_data.combineReducers)({ formatTypes });

// packages/rich-text/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		getFormatType: () => getFormatType$1,
		getFormatTypeForBareElement: () => getFormatTypeForBareElement,
		getFormatTypeForClassName: () => getFormatTypeForClassName,
		getFormatTypes: () => getFormatTypes
	}, 1);
	/**
	* Returns all the available format types.
	*
	* @param state Data state.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as richTextStore } from '@wordpress/rich-text';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*    const { getFormatTypes } = useSelect(
	*        ( select ) => select( richTextStore ),
	*        []
	*    );
	*
	*    const availableFormats = getFormatTypes();
	*
	*    return availableFormats ? (
	*        <ul>
	*            { availableFormats?.map( ( format ) => (
	*                <li>{ format.name }</li>
	*           ) ) }
	*        </ul>
	*    ) : (
	*        __( 'No Formats available' )
	*    );
	* };
	* ```
	*
	* @return Format types.
	*/
	const getFormatTypes = (0, _wordpress_data.createSelector)((state) => Object.values(state.formatTypes), (state) => [state.formatTypes]);
	/**
	* Returns a format type by name.
	*
	* @param state Data state.
	* @param name  Format type name.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as richTextStore } from '@wordpress/rich-text';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*    const { getFormatType } = useSelect(
	*        ( select ) => select( richTextStore ),
	*        []
	*    );
	*
	*    const boldFormat = getFormatType( 'core/bold' );
	*
	*    return boldFormat ? (
	*        <ul>
	*            { Object.entries( boldFormat )?.map( ( [ key, value ] ) => (
	*                <li>
	*                    { key } : { value }
	*                </li>
	*           ) ) }
	*       </ul>
	*    ) : (
	*        __( 'Not Found' )
	*    ;
	* };
	* ```
	*
	* @return Format type.
	*/
	function getFormatType$1(state, name) {
		return state.formatTypes[name];
	}
	/**
	* Gets the format type, if any, that can handle a bare element (without a
	* data-format-type attribute), given the tag name of this element.
	*
	* @param state              Data state.
	* @param bareElementTagName The tag name of the element to find a format type
	*                           for.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as richTextStore } from '@wordpress/rich-text';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*    const { getFormatTypeForBareElement } = useSelect(
	*        ( select ) => select( richTextStore ),
	*        []
	*    );
	*
	*    const format = getFormatTypeForBareElement( 'strong' );
	*
	*    return format && <p>{ sprintf( __( 'Format name: %s' ), format.name ) }</p>;
	* }
	* ```
	*
	* @return Format type.
	*/
	function getFormatTypeForBareElement(state, bareElementTagName) {
		const formatTypes = getFormatTypes(state);
		return formatTypes.find(({ className, tagName }) => {
			return className === null && bareElementTagName === tagName;
		}) || formatTypes.find(({ className, tagName }) => {
			return className === null && "*" === tagName;
		});
	}
	/**
	* Gets the format type, if any, that can handle an element, given its classes.
	*
	* @param state            Data state.
	* @param elementClassName The classes of the element to find a format type
	*                         for.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as richTextStore } from '@wordpress/rich-text';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*    const { getFormatTypeForClassName } = useSelect(
	*        ( select ) => select( richTextStore ),
	*        []
	*    );
	*
	*    const format = getFormatTypeForClassName( 'has-inline-color' );
	*
	*    return format && <p>{ sprintf( __( 'Format name: %s' ), format.name ) }</p>;
	* };
	* ```
	*
	* @return Format type.
	*/
	function getFormatTypeForClassName(state, elementClassName) {
		return getFormatTypes(state).find(({ className }) => {
			if (className === null) return false;
			return ` ${elementClassName} `.indexOf(` ${className} `) >= 0;
		});
	}

// packages/rich-text/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		addFormatTypes: () => addFormatTypes,
		removeFormatTypes: () => removeFormatTypes
	}, 1);
	/**
	* Returns an action object used in signalling that format types have been
	* added.
	* Ignored from documentation as registerFormatType should be used instead from `@wordpress/rich-text`
	*
	* @ignore
	*
	* @param formatTypes Format types received.
	*
	* @return Action object.
	*/
	function addFormatTypes(formatTypes) {
		return {
			type: "ADD_FORMAT_TYPES",
			formatTypes: Array.isArray(formatTypes) ? formatTypes : [formatTypes]
		};
	}
	/**
	* Returns an action object used to remove a registered format type.
	*
	* Ignored from documentation as unregisterFormatType should be used instead from `@wordpress/rich-text`
	*
	* @ignore
	*
	* @param names Format name.
	*
	* @return Action object.
	*/
	function removeFormatTypes(names) {
		return {
			type: "REMOVE_FORMAT_TYPES",
			names: Array.isArray(names) ? names : [names]
		};
	}

// packages/rich-text/build-module/store/index.mjs
/**
	* Store definition for the rich-text namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*/
	const store = (0, _wordpress_data.createReduxStore)("core/rich-text", {
		reducer: reducer_default,
		selectors: selectors_exports,
		actions: actions_exports
	});
	(0, _wordpress_data.register)(store);

// packages/rich-text/build-module/is-format-equal.mjs
/**
	* Optimised equality check for format objects.
	*
	* @param format1 Format to compare.
	* @param format2 Format to compare.
	*
	* @return True if formats are equal, false if not.
	*/
	function isFormatEqual(format1, format2) {
		if (format1 === format2) return true;
		if (!format1 || !format2) return false;
		if (format1.type !== format2.type) return false;
		let attributes1 = format1.attributes;
		let attributes2 = format2.attributes;
		if (format1.unregisteredAttributes || format2.unregisteredAttributes) {
			attributes1 = {
				...attributes1,
				...format1.unregisteredAttributes
			};
			attributes2 = {
				...attributes2,
				...format2.unregisteredAttributes
			};
		}
		if (attributes1 === attributes2) return true;
		if (!attributes1 || !attributes2) return false;
		const keys1 = Object.keys(attributes1);
		const keys2 = Object.keys(attributes2);
		if (keys1.length !== keys2.length) return false;
		const length = keys1.length;
		for (let i = 0; i < length; i++) {
			const name = keys1[i];
			if (attributes1[name] !== attributes2[name]) return false;
		}
		return true;
	}

// packages/rich-text/build-module/normalise-formats.mjs
/**
	* Normalises formats: ensures subsequent adjacent equal formats have the same
	* reference.
	*
	* @param value Value to normalise formats of.
	*
	* @return New value with normalised formats.
	*/
	function normaliseFormats(value) {
		const newFormats = value.formats.slice();
		newFormats.forEach((formatsAtIndex, index) => {
			const formatsAtPreviousIndex = newFormats[index - 1];
			if (formatsAtPreviousIndex) {
				const newFormatsAtIndex = formatsAtIndex.slice();
				newFormatsAtIndex.forEach((format, formatIndex) => {
					const previousFormat = formatsAtPreviousIndex[formatIndex];
					if (isFormatEqual(format, previousFormat)) newFormatsAtIndex[formatIndex] = previousFormat;
				});
				newFormats[index] = newFormatsAtIndex;
			}
		});
		return {
			...value,
			formats: newFormats
		};
	}

// packages/rich-text/build-module/apply-format.mjs
	function replace$1(array, index, value) {
		array = array.slice();
		array[index] = value;
		return array;
	}
	/**
	* Apply a format object to a Rich Text value from the given `startIndex` to the
	* given `endIndex`. Indices are retrieved from the selection if none are
	* provided.
	*
	* @param value        Value to modify.
	* @param format       Format to apply.
	* @param [startIndex] Start index.
	* @param [endIndex]   End index.
	*
	* @return A new value with the format applied.
	*/
	function applyFormat(value, format, startIndex = value.start, endIndex = value.end) {
		const { formats, activeFormats } = value;
		const newFormats = formats.slice();
		const newActiveFormats = [...activeFormats?.filter(({ type }) => type !== format.type) || [], format];
		if (startIndex === void 0 || endIndex === void 0) return normaliseFormats({
			...value,
			formats: newFormats,
			activeFormats: newActiveFormats
		});
		if (startIndex === endIndex) {
			const startFormat = newFormats[startIndex]?.find(({ type }) => type === format.type);
			if (startFormat) {
				const index = newFormats[startIndex].indexOf(startFormat);
				while (newFormats[startIndex] && newFormats[startIndex][index] === startFormat) {
					newFormats[startIndex] = replace$1(newFormats[startIndex], index, format);
					startIndex--;
				}
				endIndex++;
				while (newFormats[endIndex] && newFormats[endIndex][index] === startFormat) {
					newFormats[endIndex] = replace$1(newFormats[endIndex], index, format);
					endIndex++;
				}
			}
		} else {
			let position = Infinity;
			for (let index = startIndex; index < endIndex; index++) if (newFormats[index]) {
				newFormats[index] = newFormats[index].filter(({ type }) => type !== format.type);
				const length = newFormats[index].length;
				if (length < position) position = length;
			} else {
				newFormats[index] = [];
				position = 0;
			}
			for (let index = startIndex; index < endIndex; index++) newFormats[index].splice(position, 0, format);
		}
		return normaliseFormats({
			...value,
			formats: newFormats,
			activeFormats: newActiveFormats
		});
	}

// packages/rich-text/build-module/create-element.mjs
/**
	* The body element reused by every call.
	*/
	let body;
	/**
	* Parse the given HTML into a body element.
	*
	* Note: The current implementation will return a shared reference, reset on
	* each call to `createElement`. Therefore, you should not hold a reference to
	* the value to operate upon asynchronously, as it may have unexpected results.
	*
	* @param document                The HTML document to use to parse.
	* @param document.implementation The DOM implementation of the document.
	* @param html                    The HTML to parse.
	*
	* @return Body element with parsed HTML.
	*/
	function createElement({ implementation }, html) {
		if (!body) body = implementation.createHTMLDocument("").body;
		body.innerHTML = html;
		return body;
	}

// packages/rich-text/build-module/get-active-formats.mjs
/**
	* Gets the all format objects at the start of the selection.
	*
	* @param value                Value to inspect.
	* @param EMPTY_ACTIVE_FORMATS Array to return if there are no active formats.
	*
	* @return Active format objects.
	*/
	function getActiveFormats(value, EMPTY_ACTIVE_FORMATS = []) {
		const { formats, start, end, activeFormats } = value;
		if (start === void 0 || end === void 0) return EMPTY_ACTIVE_FORMATS;
		if (start === end) {
			if (activeFormats) return activeFormats;
			const formatsBefore = formats[start - 1] || EMPTY_ACTIVE_FORMATS;
			const formatsAfter = formats[start] || EMPTY_ACTIVE_FORMATS;
			if (formatsBefore.length < formatsAfter.length) return formatsBefore;
			return formatsAfter;
		}
		if (!formats[start]) return EMPTY_ACTIVE_FORMATS;
		const selectedFormats = formats.slice(start, end);
		const _activeFormats = [...selectedFormats[0]];
		let i = selectedFormats.length;
		while (i--) {
			const formatsAtIndex = selectedFormats[i];
			if (!formatsAtIndex) return EMPTY_ACTIVE_FORMATS;
			let ii = _activeFormats.length;
			while (ii--) {
				const format = _activeFormats[ii];
				if (!formatsAtIndex.find((_format) => isFormatEqual(format, _format))) _activeFormats.splice(ii, 1);
			}
			if (_activeFormats.length === 0) return EMPTY_ACTIVE_FORMATS;
		}
		return _activeFormats || EMPTY_ACTIVE_FORMATS;
	}

// packages/rich-text/build-module/get-format-type.mjs
/**
	* Returns a registered format type.
	*
	* @param {string} name Format name.
	*
	* @return {FormatType|undefined} Format type.
	*/
	function getFormatType(name) {
		return (0, _wordpress_data.select)(store).getFormatType(name);
	}

// packages/rich-text/build-module/to-tree.mjs
	function restoreOnAttributes(attributes, isEditableTree) {
		if (isEditableTree) return attributes;
		const newAttributes = {};
		for (const key in attributes) {
			let newKey = key;
			if (key.startsWith("data-disable-rich-text-")) newKey = key.slice(23);
			newAttributes[newKey] = attributes[key];
		}
		return newAttributes;
	}
	/**
	* Converts a format object to information that can be used to create an element
	* from (type, attributes and object).
	*
	* @param options                        Named parameters.
	* @param options.type                   The format type.
	* @param options.tagName                The tag name.
	* @param options.attributes             The format attributes.
	* @param options.unregisteredAttributes The unregistered format
	*                                       attributes.
	* @param options.object                 Whether or not it is an object
	*                                       format.
	* @param options.boundaryClass          Whether or not to apply a boundary
	*                                       class.
	* @param options.isEditableTree
	*
	* @return Information to be used for element creation.
	*/
	function fromFormat({ type, tagName, attributes, unregisteredAttributes, object, boundaryClass, isEditableTree }) {
		const formatType = getFormatType(type);
		let elementAttributes = {};
		if (boundaryClass && isEditableTree) elementAttributes["data-rich-text-format-boundary"] = "true";
		if (!formatType) {
			if (attributes) elementAttributes = {
				...attributes,
				...elementAttributes
			};
			return {
				type,
				attributes: restoreOnAttributes(elementAttributes, isEditableTree),
				object
			};
		}
		elementAttributes = {
			...unregisteredAttributes,
			...elementAttributes
		};
		for (const name in attributes) {
			const key = formatType.attributes ? formatType.attributes[name] : false;
			if (key) elementAttributes[key] = attributes[name];
			else elementAttributes[name] = attributes[name];
		}
		if (formatType.className) {
			if (elementAttributes.class) elementAttributes.class = `${formatType.className} ${elementAttributes.class}`;
			else elementAttributes.class = formatType.className;
		}
		return {
			type: tagName || formatType.tagName,
			object: formatType.object,
			attributes: restoreOnAttributes(elementAttributes, isEditableTree)
		};
	}
	/**
	* Checks if both arrays of formats up until a certain index are equal.
	*
	* @param a     Array of formats to compare.
	* @param b     Array of formats to compare.
	* @param index Index to check until.
	*/
	function isEqualUntil(a, b, index) {
		do
			if (a[index] !== b[index]) return false;
		while (index--);
		return true;
	}
	function toTree({ value, preserveWhiteSpace, createEmpty, append, getLastChild, getParent, isText, getText, remove, appendText, onStartIndex, onEndIndex, isEditableTree, placeholder }) {
		const { formats, replacements, text, start, end } = value;
		const formatsLength = formats.length + 1;
		const tree = createEmpty();
		const activeFormats = getActiveFormats(value);
		const deepestActiveFormat = activeFormats[activeFormats.length - 1];
		let lastCharacterFormats;
		let lastCharacter;
		append(tree, "");
		for (let i = 0; i < formatsLength; i++) {
			let character = text.charAt(i);
			const shouldInsertPadding = isEditableTree && (!lastCharacter || lastCharacter === "\n");
			const characterFormats = formats[i];
			let pointer = getLastChild(tree);
			if (characterFormats) characterFormats.forEach((format, formatIndex) => {
				if (pointer && lastCharacterFormats && isEqualUntil(characterFormats, lastCharacterFormats, formatIndex)) {
					pointer = getLastChild(pointer);
					return;
				}
				const { type, tagName, attributes, unregisteredAttributes } = format;
				const boundaryClass = isEditableTree && format === deepestActiveFormat;
				const newNode = append(getParent(pointer), fromFormat({
					type,
					tagName,
					attributes,
					unregisteredAttributes,
					boundaryClass,
					isEditableTree
				}));
				if (isText(pointer) && getText(pointer).length === 0) remove(pointer);
				pointer = append(newNode, "");
			});
			if (i === 0) {
				if (onStartIndex && start === 0) onStartIndex(tree, pointer);
				if (onEndIndex && end === 0) onEndIndex(tree, pointer);
			}
			if (character === "￼") {
				const replacement = replacements[i];
				if (!replacement) continue;
				const { type, attributes, innerHTML } = replacement;
				const formatType = getFormatType(type);
				if (isEditableTree && type === "#comment") {
					pointer = append(getParent(pointer), {
						type: "span",
						attributes: {
							contenteditable: "false",
							"data-rich-text-comment": attributes["data-rich-text-comment"]
						}
					});
					append(append(pointer, { type: "span" }), attributes["data-rich-text-comment"].trim());
				} else if (!isEditableTree && type === "script") {
					pointer = append(getParent(pointer), fromFormat({
						type: "script",
						isEditableTree
					}));
					append(pointer, { html: decodeURIComponent(attributes["data-rich-text-script"]) });
				} else if (formatType?.contentEditable === false) {
					if (innerHTML || isEditableTree) {
						pointer = getParent(pointer);
						if (isEditableTree) {
							const attrs = {
								contenteditable: "false",
								"data-rich-text-bogus": true
							};
							if (start === i && end === i + 1) attrs["data-rich-text-format-boundary"] = true;
							pointer = append(pointer, {
								type: "span",
								attributes: attrs
							});
							if (isEditableTree && i + 1 === text.length) append(getParent(pointer), "﻿");
						}
						pointer = append(pointer, fromFormat({
							...replacement,
							isEditableTree
						}));
						if (innerHTML) append(pointer, { html: innerHTML });
					}
				} else pointer = append(getParent(pointer), fromFormat({
					...replacement,
					object: true,
					isEditableTree
				}));
				pointer = append(getParent(pointer), "");
			} else if (!preserveWhiteSpace && character === "\n") {
				pointer = append(getParent(pointer), {
					type: "br",
					attributes: isEditableTree ? { "data-rich-text-line-break": "true" } : void 0,
					object: true
				});
				pointer = append(getParent(pointer), "");
			} else {
				let runEnd = i + 1;
				while (runEnd < text.length && formats[runEnd] === characterFormats && runEnd !== start && runEnd !== end && text[runEnd] !== "￼" && (preserveWhiteSpace || text[runEnd] !== "\n")) runEnd++;
				if (runEnd > i + 1) {
					character = text.slice(i, runEnd);
					i = runEnd - 1;
				}
				if (!isText(pointer)) pointer = append(getParent(pointer), character);
				else appendText(pointer, character);
				character = text.charAt(i);
			}
			if (onStartIndex && start === i + 1) onStartIndex(tree, pointer);
			if (onEndIndex && end === i + 1) onEndIndex(tree, pointer);
			if (shouldInsertPadding && i === text.length) {
				appendText(pointer, "﻿");
				if (placeholder && text.length === 0) append(getParent(pointer), {
					type: "span",
					attributes: {
						"data-rich-text-placeholder": placeholder,
						style: "pointer-events:none;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;"
					}
				});
			}
			lastCharacterFormats = characterFormats;
			lastCharacter = character;
		}
		return tree;
	}

// packages/rich-text/build-module/to-html-string.mjs
/**
	* Create an HTML string from a Rich Text value.
	*
	* @param options                      Named arguments.
	* @param options.value                Rich text value.
	* @param [options.preserveWhiteSpace] Preserves newlines if true.
	*
	* @return HTML string.
	*/
	function toHTMLString({ value, preserveWhiteSpace }) {
		return createChildrenHTML(toTree({
			value,
			preserveWhiteSpace,
			createEmpty,
			append: append$1,
			getLastChild: getLastChild$1,
			getParent: getParent$1,
			isText: isText$1,
			getText: getText$1,
			remove: remove$2,
			appendText: appendText$1
		}).children);
	}
	/**
	* Creates the HTML of the editable tree of a value: the markup `toDom` builds
	* as nodes, with the editor-only attributes and the placeholder.
	*
	* @param $1             Named arguments.
	* @param $1.value       The value, with editor-only formats prepared.
	* @param $1.placeholder Placeholder text.
	*
	* @return The HTML.
	*/
	function toEditableHTMLString({ value, placeholder }) {
		return createChildrenHTML(toTree({
			value,
			createEmpty,
			append: append$1,
			getLastChild: getLastChild$1,
			getParent: getParent$1,
			isText: isText$1,
			getText: getText$1,
			remove: remove$2,
			appendText: appendText$1,
			isEditableTree: true,
			placeholder
		}).children);
	}
	function createEmpty() {
		return {};
	}
	function getLastChild$1({ children }) {
		return children && children[children.length - 1];
	}
	function append$1(parent, object) {
		if (typeof object === "string") object = { text: object };
		object.parent = parent;
		parent.children = parent.children || [];
		parent.children.push(object);
		return object;
	}
	function appendText$1(object, text) {
		object.text += text;
	}
	function getParent$1({ parent }) {
		return parent;
	}
	function isText$1({ text }) {
		return typeof text === "string";
	}
	function getText$1({ text }) {
		return text;
	}
	function remove$2(object) {
		const index = object.parent.children.indexOf(object);
		if (index !== -1) object.parent.children.splice(index, 1);
		return object;
	}
	function createElementHTML({ type, attributes, object, children }) {
		if (type === "#comment") return `<!--${attributes["data-rich-text-comment"]}-->`;
		let attributeString = "";
		for (const key in attributes) {
			if (!(0, _wordpress_escape_html.isValidAttributeName)(key)) continue;
			attributeString += ` ${key}="${(0, _wordpress_escape_html.escapeAttribute)(String(attributes[key]))}"`;
		}
		if (object) return `<${type}${attributeString}>`;
		return `<${type}${attributeString}>${createChildrenHTML(children)}</${type}>`;
	}
	function createChildrenHTML(children = []) {
		return children.map((child) => {
			if (child.html !== void 0) return child.html;
			return child.text === void 0 ? createElementHTML(child) : (0, _wordpress_escape_html.escapeEditableHTML)(child.text);
		}).join("");
	}

// packages/rich-text/build-module/get-text-content.mjs
/**
	* Get the textual content of a Rich Text value. This is similar to
	* `Element.textContent`.
	*
	* @param {Pick<RichTextValue, 'text'>} value Value to use.
	*
	* @return {string} The text content.
	*/
	function getTextContent({ text }) {
		return text.replaceAll("￼", "");
	}

// packages/rich-text/build-module/create.mjs
	function createEmptyValue() {
		return {
			formats: [],
			replacements: [],
			text: ""
		};
	}
	function toFormat({ tagName, attributes }) {
		let formatType;
		if (attributes && attributes.class) {
			formatType = (0, _wordpress_data.select)(store).getFormatTypeForClassName(attributes.class);
			if (formatType) {
				attributes.class = ` ${attributes.class} `.replace(` ${formatType.className} `, " ").trim();
				if (!attributes.class) delete attributes.class;
			}
		}
		if (!formatType) formatType = (0, _wordpress_data.select)(store).getFormatTypeForBareElement(tagName);
		if (!formatType) return attributes ? {
			type: tagName,
			attributes
		} : { type: tagName };
		if (formatType.__experimentalCreatePrepareEditableTree && !formatType.__experimentalCreateOnChangeEditableValue) return null;
		if (!attributes) return {
			formatType,
			type: formatType.name,
			tagName
		};
		const registeredAttributes = {};
		const unregisteredAttributes = {};
		const _attributes = { ...attributes };
		for (const key in formatType.attributes) {
			const name = formatType.attributes[key];
			registeredAttributes[key] = _attributes[name];
			delete _attributes[name];
			if (typeof registeredAttributes[key] === "undefined") delete registeredAttributes[key];
		}
		for (const name in _attributes) unregisteredAttributes[name] = attributes[name];
		if (formatType.contentEditable === false) delete unregisteredAttributes.contenteditable;
		const format = {
			formatType,
			type: formatType.name,
			tagName
		};
		if (Object.keys(registeredAttributes).length) format.attributes = registeredAttributes;
		if (Object.keys(unregisteredAttributes).length) format.unregisteredAttributes = unregisteredAttributes;
		return format;
	}
	/**
	* The RichTextData class is used to instantiate a wrapper around rich text
	* values, with methods that can be used to transform or manipulate the data.
	*
	* - Create an empty instance: `new RichTextData()`.
	* - Create one from an HTML string: `RichTextData.fromHTMLString(
	*   '<em>hello</em>' )`.
	* - Create one from a wrapper HTMLElement: `RichTextData.fromHTMLElement(
	*   document.querySelector( 'p' ) )`.
	* - Create one from plain text: `RichTextData.fromPlainText( '1\n2' )`.
	* - Create one from a rich text value: `new RichTextData( { text: '...',
	*   formats: [ ... ] } )`.
	*
	* @todo Add methods to manipulate the data, such as applyFormat, slice etc.
	*/
	var RichTextData = class RichTextData {
		#value;
		static empty() {
			return new RichTextData();
		}
		static fromPlainText(text) {
			return new RichTextData(create({ text }));
		}
		static fromHTMLString(html) {
			return new RichTextData(create({ html }));
		}
		/**
		* Create a RichTextData instance from an HTML element.
		*
		* @param htmlElement                The HTML element to create the instance from.
		* @param options                    Options.
		* @param options.preserveWhiteSpace Whether to preserve white space.
		* @return The RichTextData instance.
		*/
		static fromHTMLElement(htmlElement, options = {}) {
			const { preserveWhiteSpace = false } = options;
			const element = preserveWhiteSpace ? htmlElement : collapseWhiteSpace(htmlElement);
			const richTextData = new RichTextData(create({ element }));
			Object.defineProperty(richTextData, "originalHTML", { value: htmlElement.innerHTML });
			return richTextData;
		}
		constructor(init = createEmptyValue()) {
			this.#value = init;
		}
		toPlainText() {
			return getTextContent(this.#value);
		}
		/**
		* Convert the rich text value to an HTML string.
		*
		* @param options                    Options.
		* @param options.preserveWhiteSpace Whether to preserve white space.
		* @return The HTML string.
		*/
		toHTMLString({ preserveWhiteSpace } = {}) {
			return this.originalHTML || toHTMLString({
				value: this.#value,
				preserveWhiteSpace
			});
		}
		valueOf() {
			return this.toHTMLString();
		}
		toString() {
			return this.toHTMLString();
		}
		toJSON() {
			return this.toHTMLString();
		}
		get length() {
			return this.text.length;
		}
		get formats() {
			return this.#value.formats;
		}
		get replacements() {
			return this.#value.replacements;
		}
		get text() {
			return this.#value.text;
		}
	};
	for (const name of Object.getOwnPropertyNames(String.prototype)) {
		if (RichTextData.prototype.hasOwnProperty(name)) continue;
		Object.defineProperty(RichTextData.prototype, name, { value(...args) {
			return this.toHTMLString()[name](...args);
		} });
	}
	/**
	* Create a RichText value from an `Element` tree (DOM), an HTML string or a
	* plain text string, with optionally a `Range` object to set the selection. If
	* called without any input, an empty value will be created. The optional
	* functions can be used to filter out content.
	*
	* A value will have the following shape, which you are strongly encouraged not
	* to modify without the use of helper functions:
	*
	* ```js
	* {
	*   text: string,
	*   formats: Array,
	*   replacements: Array,
	*   ?start: number,
	*   ?end: number,
	* }
	* ```
	*
	* As you can see, text and formatting are separated. `text` holds the text,
	* including any replacement characters for objects and lines. `formats`,
	* `objects` and `lines` are all sparse arrays of the same length as `text`. It
	* holds information about the formatting at the relevant text indices. Finally
	* `start` and `end` state which text indices are selected. They are only
	* provided if a `Range` was given.
	*
	* @param [options]                          Optional named arguments.
	* @param [options.element]                  Element to create value from.
	* @param [options.text]                     Text to create value from.
	* @param [options.html]                     HTML to create value from.
	* @param [options.range]                    Range to create value from.
	* @param [options.__unstableIsEditableTree]
	* @return A rich text value.
	*/
	function create({ element, text, html, range, __unstableIsEditableTree: isEditableTree } = {}) {
		if (html instanceof RichTextData) return {
			text: html.text,
			formats: html.formats,
			replacements: html.replacements
		};
		if (typeof text === "string" && text.length > 0) return {
			formats: Array(text.length),
			replacements: Array(text.length),
			text
		};
		if (typeof html === "string" && html.length > 0) element = createElement(document, html);
		if (typeof element !== "object") return createEmptyValue();
		return createFromElement({
			element,
			range,
			isEditableTree
		});
	}
	/**
	* Helper to accumulate the value's selection start and end from the current
	* node and range.
	*
	* @param accumulator Object to accumulate into.
	* @param node        Node to create value with.
	* @param range       Range to create value with.
	* @param value       Value that is being accumulated.
	*/
	function accumulateSelection(accumulator, node, range, value) {
		if (!range) return;
		const { parentNode } = node;
		const { startContainer, startOffset, endContainer, endOffset } = range;
		const currentLength = accumulator.text.length;
		if (value.start !== void 0) accumulator.start = currentLength + value.start;
		else if (node === startContainer && node.nodeType === node.TEXT_NODE) accumulator.start = currentLength + startOffset;
		else if (parentNode === startContainer && node === startContainer.childNodes[startOffset]) accumulator.start = currentLength;
		else if (parentNode === startContainer && node === startContainer.childNodes[startOffset - 1]) accumulator.start = currentLength + value.text.length;
		else if (node === startContainer) accumulator.start = currentLength;
		if (value.end !== void 0) accumulator.end = currentLength + value.end;
		else if (node === endContainer && node.nodeType === node.TEXT_NODE) accumulator.end = currentLength + endOffset;
		else if (parentNode === endContainer && node === endContainer.childNodes[endOffset - 1]) accumulator.end = currentLength + value.text.length;
		else if (parentNode === endContainer && node === endContainer.childNodes[endOffset]) accumulator.end = currentLength;
		else if (node === endContainer) accumulator.end = currentLength + endOffset;
	}
	/**
	* Adjusts the start and end offsets from a range based on a text filter.
	*
	* @param node   Node of which the text should be filtered.
	* @param range  The range to filter.
	* @param filter Function to use to filter the text.
	*
	* @return Object containing range properties.
	*/
	function filterRange(node, range, filter) {
		if (!range) return;
		const { startContainer, endContainer } = range;
		let { startOffset, endOffset } = range;
		if (node === startContainer) startOffset = filter(node.nodeValue.slice(0, startOffset)).length;
		if (node === endContainer) endOffset = filter(node.nodeValue.slice(0, endOffset)).length;
		return {
			startContainer,
			startOffset,
			endContainer,
			endOffset
		};
	}
	/**
	* Collapse any whitespace used for HTML formatting to one space character,
	* because it will also be displayed as such by the browser.
	*
	* We need to strip it from the content because we use white-space: pre-wrap for
	* displaying editable rich text. Without using white-space: pre-wrap, the
	* browser will litter the content with non breaking spaces, among other issues.
	* See packages/rich-text/src/component/use-default-style.js.
	*
	* @see
	* https://developer.mozilla.org/en-US/docs/Web/CSS/white-space-collapse#collapsing_of_white_space
	*
	* @param element
	* @param isRoot
	* @param hasPrecedingSpace
	* @param hasTrailingSpace
	*
	* @return New element with collapsed whitespace.
	*/
	function collapseWhiteSpace(element, isRoot = true, hasPrecedingSpace = false, hasTrailingSpace = false) {
		if (isRoot) {
			element = element.cloneNode(true);
			element.normalize();
		}
		const nodes = element.childNodes;
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node.nodeType === node.TEXT_NODE) {
				let newNodeValue = node.nodeValue;
				if (/[\n\t\r\f]/.test(newNodeValue)) newNodeValue = newNodeValue.replace(/[\n\t\r\f]+/g, " ");
				if (newNodeValue.indexOf("  ") !== -1) newNodeValue = newNodeValue.replace(/ {2,}/g, " ");
				if (i === 0 && newNodeValue.startsWith(" ") && (isRoot || hasPrecedingSpace)) newNodeValue = newNodeValue.slice(1);
				if (i === nodes.length - 1 && newNodeValue.endsWith(" ") && (isRoot || hasTrailingSpace)) newNodeValue = newNodeValue.slice(0, -1);
				node.nodeValue = newNodeValue;
			} else if (node.nodeType === node.ELEMENT_NODE) {
				const { previousSibling, nextSibling } = node;
				const prevHasSpace = previousSibling?.textContent.endsWith(" ");
				const nextHasSpace = nextSibling?.textContent.startsWith(" ");
				collapseWhiteSpace(node, false, previousSibling ? prevHasSpace : isRoot || hasPrecedingSpace, nextSibling ? nextHasSpace : isRoot || hasTrailingSpace);
			}
		}
		return element;
	}
	/**
	* We need to normalise line breaks to `\n` so they are consistent across
	* platforms and serialised properly. Not removing \r would cause it to
	* linger and result in double line breaks when whitespace is preserved.
	*/
	const CARRIAGE_RETURN = "\r";
	/**
	* Removes reserved characters used by rich-text (zero width non breaking spaces
	* added by `toTree` and object replacement characters).
	*
	* @param string
	*/
	function removeReservedCharacters(string) {
		return string.replace(new RegExp(`[${"﻿"}${"￼"}${CARRIAGE_RETURN}]`, "gu"), "");
	}
	/**
	* Creates a Rich Text value from a DOM element and range.
	*
	* @param options                  Named arguments.
	* @param [options.element]        Element to create value from.
	* @param [options.range]          Range to create value from.
	* @param [options.isEditableTree]
	*
	* @return A rich text value.
	*/
	function createFromElement({ element, range, isEditableTree }) {
		const accumulator = createEmptyValue();
		if (!element) return accumulator;
		if (!element.hasChildNodes()) {
			accumulateSelection(accumulator, element, range, createEmptyValue());
			return accumulator;
		}
		const length = element.childNodes.length;
		for (let index = 0; index < length; index++) {
			const node = element.childNodes[index];
			const tagName = node.nodeName.toLowerCase();
			if (node.nodeType === node.TEXT_NODE) {
				const text = removeReservedCharacters(node.nodeValue);
				range = filterRange(node, range, removeReservedCharacters);
				accumulateSelection(accumulator, node, range, { text });
				accumulator.formats.length += text.length;
				accumulator.replacements.length += text.length;
				accumulator.text += text;
				continue;
			}
			if (node.nodeType === node.COMMENT_NODE || node.nodeType === node.ELEMENT_NODE && node.tagName === "SPAN" && node.hasAttribute("data-rich-text-comment")) {
				const value = {
					formats: Array(1),
					replacements: [{
						type: "#comment",
						attributes: { "data-rich-text-comment": node.nodeType === node.COMMENT_NODE ? node.nodeValue : node.getAttribute("data-rich-text-comment") }
					}],
					text: "￼"
				};
				accumulateSelection(accumulator, node, range, value);
				mergePair(accumulator, value);
				continue;
			}
			if (node.nodeType !== node.ELEMENT_NODE) continue;
			if (isEditableTree && tagName === "br" && !node.getAttribute("data-rich-text-line-break")) {
				accumulateSelection(accumulator, node, range, createEmptyValue());
				continue;
			}
			if (tagName === "script") {
				const value = {
					formats: Array(1),
					replacements: [{
						type: tagName,
						attributes: { "data-rich-text-script": node.getAttribute("data-rich-text-script") || encodeURIComponent(node.innerHTML) }
					}],
					text: "￼"
				};
				accumulateSelection(accumulator, node, range, value);
				mergePair(accumulator, value);
				continue;
			}
			if (tagName === "br") {
				accumulateSelection(accumulator, node, range, createEmptyValue());
				mergePair(accumulator, create({ text: "\n" }));
				continue;
			}
			const format = toFormat({
				tagName,
				attributes: getAttributes({ element: node })
			});
			if (format?.formatType?.contentEditable === false) {
				delete format.formatType;
				accumulateSelection(accumulator, node, range, createEmptyValue());
				mergePair(accumulator, {
					formats: Array(1),
					replacements: [{
						...format,
						innerHTML: node.innerHTML
					}],
					text: "￼"
				});
				continue;
			}
			if (format) delete format.formatType;
			const value = createFromElement({
				element: node,
				range,
				isEditableTree
			});
			accumulateSelection(accumulator, node, range, value);
			if (!format || node.getAttribute("data-rich-text-placeholder") || node.getAttribute("data-rich-text-bogus")) mergePair(accumulator, value);
			else if (value.text.length === 0) {
				if (format.attributes) mergePair(accumulator, {
					formats: Array(1),
					replacements: [format],
					text: "￼"
				});
			} else {
				function mergeFormats(formats) {
					if (mergeFormats.formats === formats) return mergeFormats.newFormats;
					const newFormats = formats ? [format, ...formats] : [format];
					mergeFormats.formats = formats;
					mergeFormats.newFormats = newFormats;
					return newFormats;
				}
				mergeFormats.newFormats = [format];
				mergePair(accumulator, {
					...value,
					formats: Array.from(value.formats, mergeFormats)
				});
			}
		}
		return accumulator;
	}
	/**
	* Gets the attributes of an element in object shape.
	*
	* @param options         Named arguments.
	* @param options.element Element to get attributes from.
	*
	* @return Attribute object or `undefined` if the element has no attributes.
	*/
	function getAttributes({ element }) {
		if (!element.hasAttributes()) return;
		const length = element.attributes.length;
		let accumulator;
		for (let i = 0; i < length; i++) {
			const { name, value } = element.attributes[i];
			if (name.indexOf("data-rich-text-") === 0) continue;
			const safeName = /^on/i.test(name) ? "data-disable-rich-text-" + name : name;
			accumulator = accumulator || {};
			accumulator[safeName] = value;
		}
		return accumulator;
	}

// packages/rich-text/build-module/concat.mjs
/**
	* Concats a pair of rich text values. Not that this mutates `a` and does NOT
	* normalise formats!
	*
	* @param a Value to mutate.
	* @param b Value to add read from.
	*
	* @return `a`, mutated.
	*/
	function mergePair(a, b) {
		a.formats = a.formats.concat(b.formats);
		a.replacements = a.replacements.concat(b.replacements);
		a.text += b.text;
		return a;
	}
	/**
	* Combine all Rich Text values into one. This is similar to
	* `String.prototype.concat`.
	*
	* @param values Objects to combine.
	*
	* @return A new value combining all given records.
	*/
	function concat(...values) {
		return normaliseFormats(values.reduce(mergePair, create()));
	}

// packages/rich-text/build-module/get-active-format.mjs
/**
	* Gets the format object by type at the start of the selection. This can be
	* used to get e.g. the URL of a link format at the current selection, but also
	* to check if a format is active at the selection. Returns undefined if there
	* is no format at the selection.
	*
	* @param value      Value to inspect.
	* @param formatType Format type to look for.
	*
	* @return Active format object of the specified
	*                                    type, or undefined.
	*/
	function getActiveFormat(value, formatType) {
		return getActiveFormats(value).find(({ type }) => type === formatType);
	}

// packages/rich-text/build-module/get-active-object.mjs
/**
	* Gets the active object, if there is any.
	*
	* @param {RichTextValue} value Value to inspect.
	*
	* @return {RichTextFormat|void} Active object, or undefined.
	*/
	function getActiveObject({ start, end, replacements, text }) {
		if (start === void 0 || start + 1 !== end || text[start] !== "￼") return;
		return replacements[start];
	}

// packages/rich-text/build-module/is-collapsed.mjs
/**
	* Check if the selection of a Rich Text value is collapsed or not. Collapsed
	* means that no characters are selected, but there is a caret present. If there
	* is no selection, `undefined` will be returned. This is similar to
	* `window.getSelection().isCollapsed()`.
	*
	* @param props       The rich text value to check.
	* @param props.start
	* @param props.end
	* @return True if the selection is collapsed, false if not, undefined if there is no selection.
	*/
	function isCollapsed({ start, end }) {
		if (start === void 0 || end === void 0) return;
		return start === end;
	}

// packages/rich-text/build-module/is-empty.mjs
/**
	* Check if a Rich Text value is Empty, meaning it contains no text or any
	* objects (such as images).
	*
	* @param {RichTextValue} value Value to use.
	*
	* @return {boolean} True if the value is empty, false if not.
	*/
	function isEmpty({ text }) {
		return text.length === 0;
	}

// packages/rich-text/build-module/join.mjs
/**
	* Combine an array of Rich Text values into one, optionally separated by
	* `separator`, which can be a Rich Text value, HTML string, or plain text
	* string. This is similar to `Array.prototype.join`.
	*
	* @param values      An array of values to join.
	* @param [separator] Separator string or value.
	*
	* @return A new combined value.
	*/
	function join(values, separator = "") {
		if (typeof separator === "string") separator = create({ text: separator });
		return normaliseFormats(values.reduce((accumulator, { formats, replacements, text }) => ({
			formats: accumulator.formats.concat(separator.formats, formats),
			replacements: accumulator.replacements.concat(separator.replacements, replacements),
			text: accumulator.text + separator.text + text
		})));
	}

// packages/rich-text/build-module/register-format-type.mjs
/**
	* Registers a new format provided a unique name and an object defining its
	* behavior.
	*
	* @param name     Format name.
	* @param settings Format settings. `name` is injected from the first argument.
	*
	* @return The format, if it has been successfully registered; otherwise
	*         `undefined`.
	*/
	function registerFormatType(name, settings) {
		const formatType = {
			name,
			...settings
		};
		if (typeof formatType.name !== "string") {
			window.console.error("Format names must be strings.");
			return;
		}
		if (!/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(formatType.name)) {
			window.console.error("Format names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-format");
			return;
		}
		if ((0, _wordpress_data.select)(store).getFormatType(formatType.name)) {
			window.console.error("Format \"" + formatType.name + "\" is already registered.");
			return;
		}
		if (typeof formatType.tagName !== "string" || formatType.tagName === "") {
			window.console.error("Format tag names must be a string.");
			return;
		}
		if ((typeof formatType.className !== "string" || formatType.className === "") && formatType.className !== null) {
			window.console.error("Format class names must be a string, or null to handle bare elements.");
			return;
		}
		if (formatType.className !== null && !/^[_a-zA-Z]+[a-zA-Z0-9_-]*$/.test(formatType.className)) {
			window.console.error("A class name must begin with a letter, followed by any number of hyphens, underscores, letters, or numbers.");
			return;
		}
		if (formatType.className === null) {
			const formatTypeForBareElement = (0, _wordpress_data.select)(store).getFormatTypeForBareElement(formatType.tagName);
			if (formatTypeForBareElement && formatTypeForBareElement.name !== "core/unknown") {
				window.console.error(`Format "${formatTypeForBareElement.name}" is already registered to handle bare tag name "${formatType.tagName}".`);
				return;
			}
		} else {
			const formatTypeForClassName = (0, _wordpress_data.select)(store).getFormatTypeForClassName(formatType.className);
			if (formatTypeForClassName) {
				window.console.error(`Format "${formatTypeForClassName.name}" is already registered to handle class name "${formatType.className}".`);
				return;
			}
		}
		if (!("title" in formatType) || formatType.title === "") {
			window.console.error("The format \"" + formatType.name + "\" must have a title.");
			return;
		}
		if ((formatType.keywords?.length ?? 0) > 3) {
			window.console.error("The format \"" + formatType.name + "\" can have a maximum of 3 keywords.");
			return;
		}
		if (typeof formatType.title !== "string") {
			window.console.error("Format titles must be strings.");
			return;
		}
		(0, _wordpress_data.dispatch)(store).addFormatTypes(formatType);
		return formatType;
	}

// packages/rich-text/build-module/remove-format.mjs
/**
	* Remove any format object from a Rich Text value by type from the given
	* `startIndex` to the given `endIndex`. Indices are retrieved from the
	* selection if none are provided.
	*
	* @param value        Value to modify.
	* @param formatType   Format type to remove.
	* @param [startIndex] Start index.
	* @param [endIndex]   End index.
	*
	* @return A new value with the format applied.
	*/
	function removeFormat(value, formatType, startIndex = value.start, endIndex = value.end) {
		const { formats, activeFormats } = value;
		const newFormats = formats.slice();
		const newActiveFormats = activeFormats?.filter(({ type }) => type !== formatType) || [];
		if (startIndex === void 0 || endIndex === void 0) return normaliseFormats({
			...value,
			formats: newFormats,
			activeFormats: newActiveFormats
		});
		if (startIndex === endIndex) {
			const format = newFormats[startIndex]?.find(({ type }) => type === formatType);
			if (format) {
				while (newFormats[startIndex]?.find((newFormat) => newFormat === format)) {
					filterFormats(newFormats, startIndex, formatType);
					startIndex--;
				}
				endIndex++;
				while (newFormats[endIndex]?.find((newFormat) => newFormat === format)) {
					filterFormats(newFormats, endIndex, formatType);
					endIndex++;
				}
			}
		} else for (let i = startIndex; i < endIndex; i++) if (newFormats[i]) filterFormats(newFormats, i, formatType);
		return normaliseFormats({
			...value,
			formats: newFormats,
			activeFormats: newActiveFormats
		});
	}
	function filterFormats(formats, index, formatType) {
		const newFormats = formats[index].filter(({ type }) => type !== formatType);
		if (newFormats.length) formats[index] = newFormats;
		else delete formats[index];
	}

// packages/rich-text/build-module/insert.mjs
/**
	* Insert a Rich Text value, an HTML string, or a plain text string, into a
	* Rich Text value at the given `startIndex`. Any content between `startIndex`
	* and `endIndex` will be removed. Indices are retrieved from the selection if
	* none are provided. Without a selection, the value is appended.
	*
	* @param value         Value to modify.
	* @param valueToInsert Value to insert.
	* @param [startIndex]  Start index.
	* @param [endIndex]    End index.
	*
	* @return A new value with the value inserted.
	*/
	function insert(value, valueToInsert, startIndex = value.start ?? value.text.length, endIndex = value.end ?? startIndex) {
		const { formats, replacements, text } = value;
		if (typeof valueToInsert === "string") valueToInsert = create({ text: valueToInsert });
		const index = startIndex + valueToInsert.text.length;
		return normaliseFormats({
			formats: formats.slice(0, startIndex).concat(valueToInsert.formats, formats.slice(endIndex)),
			replacements: replacements.slice(0, startIndex).concat(valueToInsert.replacements, replacements.slice(endIndex)),
			text: text.slice(0, startIndex) + valueToInsert.text + text.slice(endIndex),
			start: index,
			end: index
		});
	}

// packages/rich-text/build-module/remove.mjs
/**
	* Remove content from a Rich Text value between the given `startIndex` and
	* `endIndex`. Indices are retrieved from the selection if none are provided.
	*
	* @param {RichTextValue} value        Value to modify.
	* @param {number}        [startIndex] Start index.
	* @param {number}        [endIndex]   End index.
	*
	* @return {RichTextValue} A new value with the content removed.
	*/
	function remove(value, startIndex, endIndex) {
		return insert(value, create(), startIndex, endIndex);
	}

// packages/rich-text/build-module/replace.mjs
/**
	* Search a Rich Text value and replace the match(es) with `replacement`. This
	* is similar to `String.prototype.replace`.
	*
	* @param {RichTextValue}                 value       The value to modify.
	* @param {RegExp|string}                 pattern     A RegExp object or literal. Can also be
	*                                                    a string. It is treated as a verbatim
	*                                                    string and is not interpreted as a
	*                                                    regular expression. Only the first
	*                                                    occurrence will be replaced.
	* @param {Function|string|RichTextValue} replacement The match or matches are
	*                                                    replaced with the specified
	*                                                    value, the value returned by
	*                                                    the specified function, or
	*                                                    the given rich text value.
	*
	* @return {RichTextValue} A new value with replacements applied.
	*/
	function replace({ formats, replacements, text, start, end }, pattern, replacement) {
		text = text.replace(pattern, (match, ...rest) => {
			const hasGroups = typeof rest[rest.length - 1] === "object";
			const offset = rest[rest.length - (hasGroups ? 3 : 2)];
			let newText = replacement;
			let newFormats;
			let newReplacements;
			if (typeof newText === "function") newText = newText(match, ...rest);
			if (typeof newText === "object") {
				newFormats = newText.formats;
				newReplacements = newText.replacements;
				newText = newText.text;
			} else {
				newFormats = Array(newText.length);
				newReplacements = Array(newText.length);
				if (formats[offset]) newFormats = newFormats.fill(formats[offset]);
			}
			formats = formats.slice(0, offset).concat(newFormats, formats.slice(offset + match.length));
			replacements = replacements.slice(0, offset).concat(newReplacements, replacements.slice(offset + match.length));
			if (start !== void 0) start = end = offset + newText.length;
			return newText;
		});
		return normaliseFormats({
			formats,
			replacements,
			text,
			start,
			end
		});
	}

// packages/rich-text/build-module/insert-object.mjs
/**
	* Insert a format as an object into a Rich Text value at the given
	* `startIndex`. Any content between `startIndex` and `endIndex` will be
	* removed. Indices are retrieved from the selection if none are provided.
	*
	* @param {RichTextValue}  value          Value to modify.
	* @param {RichTextFormat} formatToInsert Format to insert as object.
	* @param {number}         [startIndex]   Start index.
	* @param {number}         [endIndex]     End index.
	*
	* @return {RichTextValue} A new value with the object inserted.
	*/
	function insertObject(value, formatToInsert, startIndex, endIndex) {
		const valueToInsert = {
			formats: Array(1),
			replacements: [formatToInsert],
			text: "￼"
		};
		return insert(value, valueToInsert, startIndex, endIndex);
	}

// packages/rich-text/build-module/slice.mjs
/**
	* Slice a Rich Text value from `startIndex` to `endIndex`. Indices are
	* retrieved from the selection if none are provided. This is similar to
	* `String.prototype.slice`.
	*
	* @param value        Value to modify.
	* @param [startIndex] Start index.
	* @param [endIndex]   End index.
	*
	* @return A new extracted value.
	*/
	function slice(value, startIndex = value.start, endIndex = value.end) {
		const { formats, replacements, text } = value;
		if (startIndex === void 0 || endIndex === void 0) return { ...value };
		return {
			formats: formats.slice(startIndex, endIndex),
			replacements: replacements.slice(startIndex, endIndex),
			text: text.slice(startIndex, endIndex)
		};
	}

// packages/rich-text/build-module/split.mjs
/**
	* Split a Rich Text value in two at the given `startIndex` and `endIndex`, or
	* split at the given separator. This is similar to `String.prototype.split`.
	* Indices are retrieved from the selection if none are provided.
	*
	* @param richTextValue Value to split.
	* @param [string]      Start index, or string at which to split.
	* @param [endIndex]    End index, when splitting at indices.
	*
	* @return An array of new values.
	*/
	function split(richTextValue, string, endIndex) {
		if (typeof string !== "string") return splitAtSelection(richTextValue, string, endIndex);
		const { formats, replacements, text, start, end } = richTextValue;
		let nextStart = 0;
		return text.split(string).map((substring) => {
			const startIndex = nextStart;
			const value = {
				formats: formats.slice(startIndex, startIndex + substring.length),
				replacements: replacements.slice(startIndex, startIndex + substring.length),
				text: substring
			};
			nextStart += string.length + substring.length;
			if (start !== void 0 && end !== void 0) {
				if (start >= startIndex && start < nextStart) value.start = start - startIndex;
				else if (start < startIndex && end > startIndex) value.start = 0;
				if (end >= startIndex && end < nextStart) value.end = end - startIndex;
				else if (start < nextStart && end > nextStart) value.end = substring.length;
			}
			return value;
		});
	}
	function splitAtSelection({ formats, replacements, text, start, end }, startIndex = start, endIndex = end) {
		if (startIndex === void 0 || endIndex === void 0) return;
		return [{
			formats: formats.slice(0, startIndex),
			replacements: replacements.slice(0, startIndex),
			text: text.slice(0, startIndex)
		}, {
			formats: formats.slice(endIndex),
			replacements: replacements.slice(endIndex),
			text: text.slice(endIndex),
			start: 0,
			end: 0
		}];
	}

// packages/rich-text/build-module/is-range-equal.mjs
/**
	* Returns true if two ranges are equal, or false otherwise. Ranges are
	* considered equal if their start and end occur in the same container and
	* offset.
	*
	* @param a First range object to test.
	* @param b First range object to test.
	*
	* @return Whether the two ranges are equal.
	*/
	function isRangeEqual(a, b) {
		return a === b || a && b && a.startContainer === b.startContainer && a.startOffset === b.startOffset && a.endContainer === b.endContainer && a.endOffset === b.endOffset;
	}

// packages/rich-text/build-module/to-dom.mjs
/**
	* MathML namespace URI.
	*
	* @see https://www.w3.org/1998/Math/MathML/
	*/
	const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
	/**
	* Creates a path as an array of indices from the given root node to the given
	* node.
	*
	* @param node     Node to find the path of.
	* @param rootNode Root node to find the path from.
	* @param path     Initial path to build on.
	*
	* @return The path from the root node to the node.
	*/
	function createPathToNode(node, rootNode, path) {
		const parentNode = node.parentNode;
		let i = 0;
		while (node = node.previousSibling) i++;
		path = [i, ...path];
		if (parentNode !== rootNode) path = createPathToNode(parentNode, rootNode, path);
		return path;
	}
	/**
	* Gets a node given a path (array of indices) from the given node.
	*
	* @param node Root node to find the wanted node in.
	* @param path Path (indices) to the wanted node.
	*
	* @return Object with the found node and the remaining offset (if any).
	*/
	function getNodeByPath(node, path) {
		path = [...path];
		while (node && path.length > 1) node = node.childNodes[path.shift()];
		return {
			node,
			offset: path[0]
		};
	}
	function append(element, child) {
		if (child.html !== void 0) return element.innerHTML += child.html;
		if (typeof child === "string") child = element.ownerDocument.createTextNode(child);
		const { type, attributes } = child;
		if (type) {
			if (type === "#comment") child = element.ownerDocument.createComment(attributes["data-rich-text-comment"]);
			else {
				const parentNamespace = element.namespaceURI;
				if (type === "math") child = element.ownerDocument.createElementNS(MATHML_NAMESPACE, type);
				else if (parentNamespace === MATHML_NAMESPACE) {
					if (element.tagName === "MTEXT") child = element.ownerDocument.createElement(type);
					else child = element.ownerDocument.createElementNS(MATHML_NAMESPACE, type);
				} else child = element.ownerDocument.createElement(type);
				for (const key in attributes) child.setAttribute(key, attributes[key]);
			}
		}
		return element.appendChild(child);
	}
	function appendText(node, text) {
		node.appendData(text);
	}
	function getLastChild({ lastChild }) {
		return lastChild;
	}
	function getParent({ parentNode }) {
		return parentNode;
	}
	function isText(node) {
		return node.nodeType === node.TEXT_NODE;
	}
	function getText({ nodeValue }) {
		return nodeValue;
	}
	function remove$1(node) {
		return node.parentNode.removeChild(node);
	}
	function toDom({ value, prepareEditableTree, isEditableTree = true, placeholder, doc = document }) {
		let startPath = [];
		let endPath = [];
		if (prepareEditableTree) value = {
			...value,
			formats: prepareEditableTree(value)
		};
		/**
		* Returns a new instance of a DOM tree upon which RichText operations can be
		* applied.
		*
		* Note: The current implementation will return a shared reference, reset on
		* each call to `createEmpty`. Therefore, you should not hold a reference to
		* the value to operate upon asynchronously, as it may have unexpected results.
		*
		* @return RichText tree.
		*/
		const createEmpty = () => createElement(doc, "");
		return {
			body: toTree({
				value,
				createEmpty,
				append,
				getLastChild,
				getParent,
				isText,
				getText,
				remove: remove$1,
				appendText,
				onStartIndex(body, pointer) {
					startPath = createPathToNode(pointer, body, [pointer.nodeValue.length]);
				},
				onEndIndex(body, pointer) {
					endPath = createPathToNode(pointer, body, [pointer.nodeValue.length]);
				},
				isEditableTree,
				placeholder
			}),
			selection: {
				startPath,
				endPath
			}
		};
	}
	/**
	* Returns the position in the DOM, as a node and an offset within it, of an
	* offset in a value, inside the element the value is rendered in. The tree is
	* built with the same handlers and placeholder as the element, so the path
	* matches it.
	*
	* @param $1                       Named arguments.
	* @param $1.value                 The value rendered in the element.
	* @param $1.offset                Offset in the value.
	* @param $1.element               The live element.
	* @param [$1.prepareEditableTree] Function to filter editable formats.
	* @param [$1.placeholder]         Placeholder text.
	*
	* @return The position.
	*/
	function getDomPosition({ value, offset, element, prepareEditableTree, placeholder }) {
		const { selection } = toDom({
			value: {
				...value,
				start: offset,
				end: offset
			},
			prepareEditableTree,
			placeholder,
			doc: element.ownerDocument
		});
		return getNodeByPath(element, selection.startPath);
	}
	/**
	* Create an `Element` tree from a Rich Text value and applies the difference to
	* the `Element` tree contained by `current`.
	*
	* @param options                       Named arguments.
	* @param options.value                 Value to apply.
	* @param options.current               The live root node to apply the element tree to.
	* @param [options.prepareEditableTree] Function to filter editorable formats.
	* @param [options.__unstableDomOnly]   Only apply elements, no selection.
	* @param [options.placeholder]         Placeholder text.
	*/
	function apply({ value, current, prepareEditableTree, __unstableDomOnly, placeholder }) {
		if (__unstableDomOnly && !current.firstChild) {
			current.innerHTML = toEditableHTMLString({
				value: prepareEditableTree ? {
					...value,
					formats: prepareEditableTree(value)
				} : value,
				placeholder
			});
			return;
		}
		const { body, selection } = toDom({
			value,
			prepareEditableTree,
			placeholder,
			doc: current.ownerDocument
		});
		applyValue(body, current);
		if (value.start !== void 0 && !__unstableDomOnly) applySelection(selection, current);
	}
	function applyValue(future, current) {
		let i = 0;
		let futureChild;
		while (futureChild = future.firstChild) {
			const currentChild = current.childNodes[i];
			if (!currentChild) current.appendChild(futureChild);
			else if (!currentChild.isEqualNode(futureChild)) {
				if (currentChild.nodeName !== futureChild.nodeName || currentChild.nodeType === currentChild.TEXT_NODE && currentChild.data !== futureChild.data) current.replaceChild(futureChild, currentChild);
				else {
					const currentAttributes = currentChild.attributes;
					const futureAttributes = futureChild.attributes;
					if (currentAttributes) {
						let ii = currentAttributes.length;
						while (ii--) {
							const { name } = currentAttributes[ii];
							if (!futureChild.getAttribute(name)) currentChild.removeAttribute(name);
						}
					}
					if (futureAttributes) for (let ii = 0; ii < futureAttributes.length; ii++) {
						const { name, value } = futureAttributes[ii];
						if (currentChild.getAttribute(name) !== value) currentChild.setAttribute(name, value);
					}
					applyValue(futureChild, currentChild);
					future.removeChild(futureChild);
				}
			} else future.removeChild(futureChild);
			i++;
		}
		while (current.childNodes[i]) current.removeChild(current.childNodes[i]);
	}
	function applySelection({ startPath, endPath }, current) {
		const { node: startContainer, offset: startOffset } = getNodeByPath(current, startPath);
		const { node: endContainer, offset: endOffset } = getNodeByPath(current, endPath);
		const { ownerDocument } = current;
		const { defaultView } = ownerDocument;
		const selection = defaultView.getSelection();
		const range = ownerDocument.createRange();
		range.setStart(startContainer, startOffset);
		range.setEnd(endContainer, endOffset);
		const { activeElement } = ownerDocument;
		if (selection.rangeCount > 0) {
			if (isRangeEqual(range, selection.getRangeAt(0))) return;
			selection.removeAllRanges();
		}
		selection.addRange(range);
		if (activeElement !== ownerDocument.activeElement) {
			if (activeElement instanceof defaultView.HTMLElement) activeElement.focus();
		}
	}

// packages/rich-text/build-module/toggle-format.mjs
/**
	* Toggles a format object to a Rich Text value at the current selection.
	*
	* @param value  Value to modify.
	* @param format Format to apply or remove.
	*
	* @return A new value with the format applied or removed.
	*/
	function toggleFormat(value, format) {
		if (getActiveFormat(value, format.type)) {
			if (format.title) (0, _wordpress_a11y.speak)((0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s removed."), format.title), "assertive");
			return removeFormat(value, format.type);
		}
		if (format.title) (0, _wordpress_a11y.speak)((0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s applied."), format.title), "assertive");
		return applyFormat(value, format);
	}

// packages/rich-text/build-module/unregister-format-type.mjs
/**
	* Unregisters a format.
	*
	* @param name Format name.
	*
	* @return The previous format value, if it has
	*                                        been successfully unregistered;
	*                                        otherwise `undefined`.
	*/
	function unregisterFormatType(name) {
		const oldFormat = (0, _wordpress_data.select)(store).getFormatType(name);
		if (!oldFormat) {
			window.console.error(`Format ${name} is not registered.`);
			return;
		}
		(0, _wordpress_data.dispatch)(store).removeFormatTypes(name);
		return oldFormat;
	}

// packages/rich-text/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/rich-text");

// packages/rich-text/build-module/hook/default-style.mjs
/**
	* In HTML, leading and trailing spaces are not visible, and multiple spaces
	* elsewhere are visually reduced to one space. This rule prevents spaces from
	* collapsing so all space is visible in the editor and can be removed. It also
	* prevents some browsers from inserting non-breaking spaces at the end of a
	* line to prevent the space from visually disappearing. Sometimes these non
	* breaking spaces can linger in the editor causing unwanted non breaking spaces
	* in between words. If also prevent Firefox from inserting a trailing `br` node
	* to visualise any trailing space, causing the element to be saved.
	*
	* > Authors are encouraged to set the 'white-space' property on editing hosts
	* > and on markup that was originally created through these editing mechanisms
	* > to the value 'pre-wrap'. Default HTML whitespace handling is not well
	* > suited to WYSIWYG editing, and line wrapping will not work correctly in
	* > some corner cases if 'white-space' is left at its default value.
	*
	* https://html.spec.whatwg.org/multipage/interaction.html#best-practices-for-in-page-editors
	*/
	const whiteSpace = "pre-wrap";
	function setDefaultStyle(element) {
		element.style.whiteSpace = element.style.whiteSpace || whiteSpace;
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

// packages/rich-text/build-module/hook/use-boundary-style.mjs
	function useBoundaryStyle({ record, ref }) {
		const { activeFormats = [], replacements, start } = record.current;
		const activeReplacement = start === void 0 ? void 0 : replacements[start];
		(0, _wordpress_element.useEffect)(() => {
			if ((!activeFormats || !activeFormats.length) && !activeReplacement) return;
			const boundarySelector = "*[data-rich-text-format-boundary]";
			const element = ref.current.querySelector(boundarySelector);
			if (!element) return;
			const { ownerDocument } = element;
			const { defaultView } = ownerDocument;
			const computedStyle = defaultView.getComputedStyle(element);
			const newColor = A(computedStyle.color).alpha(.2).toRgbString();
			const style = `${`[contenteditable="true"]:focus ${boundarySelector}`} {${`background-color: ${newColor}`}}`;
			const globalStyleId = "rich-text-boundary-style";
			let globalStyle = ownerDocument.getElementById(globalStyleId);
			if (!globalStyle) {
				globalStyle = ownerDocument.createElement("style");
				globalStyle.id = globalStyleId;
				ownerDocument.head.appendChild(globalStyle);
			}
			if (globalStyle.innerHTML !== style) globalStyle.innerHTML = style;
		}, [
			ref,
			activeFormats,
			activeReplacement
		]);
	}

// packages/rich-text/build-module/hook/event-listeners/copy-handler.mjs
	function onCopy(field, event) {
		const { record, handleChange } = field.props.current;
		if (event.defaultPrevented || isCollapsed(record.current)) return;
		const selectedRecord = slice(record.current);
		const plainText = getTextContent(selectedRecord);
		const html = toHTMLString({ value: selectedRecord });
		event.clipboardData.setData("text/plain", plainText);
		event.clipboardData.setData("text/html", html);
		event.clipboardData.setData("rich-text", "true");
		event.preventDefault();
		if (event.type === "cut") handleChange(remove(record.current));
	}

// packages/rich-text/build-module/hook/event-listeners/select-object.mjs
	function onClick(field, event) {
		const target = event.target;
		if (target === field.element || target.textContent && target.isContentEditable) return;
		const { ownerDocument } = target;
		const { defaultView } = ownerDocument;
		const selection = defaultView.getSelection();
		if (selection.containsNode(target)) return;
		const range = ownerDocument.createRange();
		const nodeToSelect = target.isContentEditable ? target : target.closest("[contenteditable]");
		range.selectNode(nodeToSelect);
		selection.removeAllRanges();
		selection.addRange(range);
		event.preventDefault();
	}
	function onFocusIn(field, event) {
		if (event.relatedTarget && !field.element.contains(event.relatedTarget)) onClick(field, event);
	}

// packages/rich-text/build-module/hook/event-listeners/format-boundaries.mjs
	const EMPTY_ACTIVE_FORMATS$1 = [];
	function onKeyDown(field, event) {
		const { keyCode, shiftKey, altKey, metaKey, ctrlKey } = event;
		if (shiftKey || altKey || metaKey || ctrlKey || keyCode !== _wordpress_keycodes.LEFT && keyCode !== _wordpress_keycodes.RIGHT) return;
		const { record, applyRecord, forceRender } = field.props.current;
		const { text, formats, start, end, activeFormats: currentActiveFormats = [] } = record.current;
		const collapsed = isCollapsed(record.current);
		const { defaultView } = field.element.ownerDocument;
		const { direction } = defaultView.getComputedStyle(field.element);
		const reverseKey = direction === "rtl" ? _wordpress_keycodes.RIGHT : _wordpress_keycodes.LEFT;
		const isReverse = event.keyCode === reverseKey;
		if (collapsed && currentActiveFormats.length === 0) {
			if (start === 0 && isReverse) return;
			if (end === text.length && !isReverse) return;
		}
		if (!collapsed || start === void 0) return;
		const formatsBefore = formats[start - 1] || EMPTY_ACTIVE_FORMATS$1;
		const formatsAfter = formats[start] || EMPTY_ACTIVE_FORMATS$1;
		const destination = isReverse ? formatsBefore : formatsAfter;
		const isIncreasing = currentActiveFormats.every((format, index) => format === destination[index]);
		let newActiveFormatsLength = currentActiveFormats.length;
		if (!isIncreasing) newActiveFormatsLength--;
		else if (newActiveFormatsLength < destination.length) newActiveFormatsLength++;
		if (newActiveFormatsLength === currentActiveFormats.length) {
			record.current._newActiveFormats = destination;
			return;
		}
		event.preventDefault();
		const newActiveFormats = (isIncreasing ? destination : isReverse ? formatsAfter : formatsBefore).slice(0, newActiveFormatsLength);
		const newValue = {
			...record.current,
			activeFormats: newActiveFormats
		};
		record.current = newValue;
		applyRecord(newValue);
		forceRender();
	}

// packages/rich-text/build-module/hook/event-listeners/delete.mjs
	function onBeforeInput(field, event) {
		if (event.defaultPrevented || !event.inputType.startsWith("deleteContent")) return;
		const { createRecord, handleChange } = field.props.current;
		const currentValue = createRecord();
		const { start, end, text } = currentValue;
		if (start === 0 && end !== 0 && end === text.length) {
			handleChange(remove(currentValue));
			event.preventDefault();
		}
	}

// packages/rich-text/build-module/update-formats.mjs
/**
	* Efficiently updates all the formats from `start` (including) until `end`
	* (excluding) with the active formats. Mutates `value`.
	*
	* @param options         Named paramentes.
	* @param options.value   Value te update.
	* @param options.start   Index to update from.
	* @param options.end     Index to update until.
	* @param options.formats Replacement formats.
	*
	* @return Mutated value.
	*/
	function updateFormats({ value, start, end, formats }) {
		const min = Math.min(start, end);
		const max = Math.max(start, end);
		const formatsBefore = value.formats[min - 1] || [];
		const formatsAfter = value.formats[max] || [];
		value.activeFormats = formats.map((format, index) => {
			if (formatsBefore[index]) {
				if (isFormatEqual(format, formatsBefore[index])) return formatsBefore[index];
			} else if (formatsAfter[index]) {
				if (isFormatEqual(format, formatsAfter[index])) return formatsAfter[index];
			}
			return format;
		});
		while (--end >= start) if (value.activeFormats.length > 0) value.formats[end] = value.activeFormats;
		else delete value.formats[end];
		return value;
	}

// packages/rich-text/build-module/owns-selection.mjs
/**
	* Returns true when the element owns the document selection: either the
	* element itself has focus, or its contentEditable editing host has focus
	* (e.g. an editable block editor canvas wrapper) and the selection is fully
	* contained within the element.
	*
	* @param element The editable element.
	*
	* @return Whether the element owns the document selection.
	*/
	function ownsSelection(element) {
		const { ownerDocument } = element;
		const { activeElement } = ownerDocument;
		if (activeElement === element) return true;
		if (!activeElement || activeElement.contentEditable !== "true" || element.contentEditable !== "true" || !activeElement.contains(element)) return false;
		const selection = ownerDocument.defaultView?.getSelection();
		if (!selection) return false;
		const { anchorNode, focusNode } = selection;
		return !!anchorNode && !!focusNode && element.contains(anchorNode) && element.contains(focusNode);
	}

// packages/rich-text/build-module/hook/event-listeners/input-and-selection.mjs
/**
	* All inserting input types that would insert HTML into the DOM.
	*
	* @see https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes
	*/
	const INSERTION_INPUT_TYPES_TO_IGNORE = /* @__PURE__ */ new Set([
		"insertParagraph",
		"insertOrderedList",
		"insertUnorderedList",
		"insertHorizontalRule",
		"insertLink"
	]);
	const EMPTY_ACTIVE_FORMATS = [];
	const PLACEHOLDER_ATTR_NAME = "data-rich-text-placeholder";
	function onPointerDown(field) {
		const { defaultView } = field.element.ownerDocument;
		field.isPointerDown = true;
		function onPointerUp() {
			field.isPointerDown = false;
			defaultView.removeEventListener("pointerup", onPointerUp);
			defaultView.removeEventListener("pointercancel", onPointerUp);
		}
		defaultView.addEventListener("pointerup", onPointerUp);
		defaultView.addEventListener("pointercancel", onPointerUp);
	}
	function onInput(field, event) {
		if (field.isComposing) return;
		let inputType;
		if (event && "inputType" in event) inputType = event.inputType;
		const { record, applyRecord, createRecord, handleChange } = field.props.current;
		if (inputType && (inputType.indexOf("format") === 0 || INSERTION_INPUT_TYPES_TO_IGNORE.has(inputType))) {
			applyRecord(record.current);
			return;
		}
		const currentValue = createRecord();
		const { start } = record.current;
		if (start === void 0 || currentValue.start === void 0) {
			handleChange(currentValue);
			return;
		}
		const clearFormats = !isCollapsed(record.current) && currentValue.start <= start;
		const oldActiveFormats = getActiveFormats(record.current, EMPTY_ACTIVE_FORMATS);
		handleChange(updateFormats({
			value: currentValue,
			start,
			end: currentValue.start,
			formats: clearFormats ? [] : oldActiveFormats
		}));
	}
	/**
	* Syncs the selection to local state. A callback for the `selectionchange`
	* event, and for the capture phase of events that consume the selection,
	* which run before `selectionchange` is delivered.
	*
	* @param field The field.
	*/
	function handleSelectionChange(field) {
		const { element } = field;
		const { ownerDocument } = element;
		const { defaultView } = ownerDocument;
		const { record, applyRecord, createRecord, onSelectionChange } = field.props.current;
		if (element.contentEditable !== "true") return;
		if (ownerDocument.activeElement !== element && !ownsSelection(element)) return;
		if (field.isComposing) return;
		const selection = defaultView.getSelection();
		const { selectionSnapshot } = field;
		if (selectionSnapshot && selectionSnapshot.anchorNode === selection.anchorNode && selectionSnapshot.anchorOffset === selection.anchorOffset && selectionSnapshot.focusNode === selection.focusNode && selectionSnapshot.focusOffset === selection.focusOffset && selectionSnapshot.processedStart === record.current.start && selectionSnapshot.processedEnd === record.current.end) return;
		const { start, end, text } = createRecord();
		const oldRecord = record.current;
		if (text.length === 0) applyRecord({
			...oldRecord,
			start,
			end
		});
		field.selectionSnapshot = {
			anchorNode: selection.anchorNode,
			anchorOffset: selection.anchorOffset,
			focusNode: selection.focusNode,
			focusOffset: selection.focusOffset,
			processedStart: start,
			processedEnd: end
		};
		if (text !== oldRecord.text) {
			onInput(field);
			return;
		}
		if (start === oldRecord.start && end === oldRecord.end) return;
		const newValue = {
			...oldRecord,
			start,
			end,
			activeFormats: oldRecord._newActiveFormats,
			_newActiveFormats: void 0
		};
		newValue.activeFormats = getActiveFormats(newValue, EMPTY_ACTIVE_FORMATS);
		record.current = newValue;
		applyRecord(newValue, { domOnly: true });
		onSelectionChange(start, end);
	}
	function onCompositionStart(field) {
		field.isComposing = true;
		field.element.querySelector(`[${PLACEHOLDER_ATTR_NAME}]`)?.remove();
	}
	function onCompositionEnd(field) {
		field.isComposing = false;
		onInput(field, { inputType: "insertText" });
	}
	function onFocus(field, event) {
		const { element } = field;
		const { defaultView } = element.ownerDocument;
		if (event.target !== element) return;
		if (element.contentEditable !== "true") return;
		const { record, isSelected, onSelectionChange, applyRecord } = field.props.current;
		if (element.parentElement.closest("[contenteditable=\"true\"]")) {
			const selection = defaultView.getSelection();
			if (!selection.anchorNode || !element.contains(selection.anchorNode)) {
				if (isSelected && record.current.start !== void 0) applyRecord(record.current);
				else selection.collapse(element, 0);
			}
			return;
		}
		if (!isSelected) {
			const index = void 0;
			record.current = {
				...record.current,
				start: index,
				end: index,
				activeFormats: EMPTY_ACTIVE_FORMATS
			};
			field.selectionSnapshot = void 0;
		} else if (!field.isPointerDown) applyRecord(record.current);
		onSelectionChange(record.current.start, record.current.end);
		window.queueMicrotask(() => handleSelectionChange(field));
	}

// packages/rich-text/build-module/hook/event-listeners/selection-change-compat.mjs
/**
	* Sometimes some browsers are not firing a `selectionchange` event when
	* changing the selection by mouse or keyboard. This hook makes sure that, if we
	* detect no `selectionchange` or `input` event between the up and down events,
	* we fire a `selectionchange` event.
	*
	* @param field The field.
	* @param event The pointer or key down event.
	*/
	function onDown(field, event) {
		const { ownerDocument } = field.element;
		const { defaultView } = ownerDocument;
		const selection = defaultView?.getSelection();
		const type = event.type === "keydown" ? "keyup" : "pointerup";
		function getRange() {
			return selection.rangeCount ? selection.getRangeAt(0) : null;
		}
		const range = getRange();
		function onCancel() {
			ownerDocument.removeEventListener(type, onUp);
			ownerDocument.removeEventListener("selectionchange", onCancel);
			ownerDocument.removeEventListener("input", onCancel);
		}
		function onUp() {
			onCancel();
			if (isRangeEqual(range, getRange())) return;
			ownerDocument.dispatchEvent(new Event("selectionchange"));
		}
		ownerDocument.addEventListener(type, onUp);
		ownerDocument.addEventListener("selectionchange", onCancel);
		ownerDocument.addEventListener("input", onCancel);
	}

// packages/rich-text/build-module/hook/event-listeners/index.mjs
	const first = {
		keydown: {
			selection: [handleSelectionChange, onKeyDown],
			target: [onDown]
		},
		beforeinput: { selection: [handleSelectionChange] },
		copy: { selection: [handleSelectionChange] },
		cut: { selection: [handleSelectionChange] },
		paste: { selection: [handleSelectionChange] },
		input: { selection: [onInput] },
		compositionstart: { selection: [onCompositionStart] },
		compositionend: { selection: [onCompositionEnd] },
		selectionchange: { selection: [handleSelectionChange] },
		focusin: { target: [onFocus, onFocusIn] },
		pointerdown: { target: [onPointerDown, onDown] }
	};
	const defaults = {
		beforeinput: { selection: [onBeforeInput] },
		copy: { selection: [onCopy] },
		cut: { selection: [onCopy] },
		click: { target: [onClick] }
	};
	const fields = /* @__PURE__ */ new WeakMap();
	const documents = /* @__PURE__ */ new WeakSet();
	function forEachField(node, callback) {
		for (; node; node = node.parentNode) {
			const field = fields.get(node);
			if (field) callback(field);
		}
	}
	function addListeners(ownerDocument, handlers, capture) {
		const defaultView = ownerDocument.defaultView;
		for (const [eventType, { selection, target }] of Object.entries(handlers)) defaultView.addEventListener(eventType, (event) => {
			if (selection) {
				const anchorNode = defaultView.getSelection()?.anchorNode;
				forEachField(anchorNode ?? ownerDocument.activeElement, (field) => {
					if (ownsSelection(field.element)) for (const handler of selection) handler(field, event);
				});
			}
			if (target) forEachField(event.target, (field) => {
				for (const handler of target) handler(field, event);
			});
		}, capture);
	}
	function useEventListenerProps(props) {
		const propsRef = (0, _wordpress_element.useRef)(props);
		(0, _wordpress_element.useInsertionEffect)(() => {
			propsRef.current = props;
		});
		return propsRef;
	}
	function addField(element, props) {
		const { ownerDocument } = element;
		fields.set(element, {
			element,
			props
		});
		if (!documents.has(ownerDocument)) {
			documents.add(ownerDocument);
			addListeners(ownerDocument, first, true);
			addListeners(ownerDocument, defaults, false);
		}
		return () => {
			fields.delete(element);
		};
	}

// packages/rich-text/build-module/hook/use-format-types.mjs
/**
	* Set of all interactive content tags.
	*
	* @see https://html.spec.whatwg.org/multipage/dom.html#interactive-content
	*/
	const interactiveContentTags = /* @__PURE__ */ new Set([
		"a",
		"audio",
		"button",
		"details",
		"embed",
		"iframe",
		"input",
		"label",
		"select",
		"textarea",
		"video"
	]);
	const FORMAT_TYPES_KEY = "formatTypes";
	function isFormatTypeAllowed({ name, interactive, tagName }, allowedFormats, withoutInteractiveFormatting) {
		if (allowedFormats && !allowedFormats.includes(name)) return false;
		if (withoutInteractiveFormatting && (interactive || interactiveContentTags.has(tagName))) return false;
		return true;
	}
	function prefixSelectKeys(selected, prefix) {
		if (typeof selected !== "object" || selected === null) return { [prefix]: selected };
		return Object.fromEntries(Object.entries(selected).map(([key, value]) => [`${prefix}.${key}`, value]));
	}
	function getPrefixedSelectKeys(selected, prefix) {
		if (selected[prefix]) return selected[prefix];
		return Object.keys(selected).filter((key) => key.startsWith(prefix + ".")).reduce((accumulator, key) => {
			accumulator[key.slice(prefix.length + 1)] = selected[key];
			return accumulator;
		}, {});
	}
	/**
	* This hook provides RichText with the `formatTypes` and its derived props from
	* experimental format type settings.
	*
	* @param {Object}  options                                    Options
	* @param {Array}   options.allowedFormats                     Allowed formats
	* @param {boolean} options.withoutInteractiveFormatting       Whether to clean the interactive formatting or not.
	* @param {Object}  options.__unstableFormatTypeHandlerContext Context object passed to experimental format type methods.
	*/
	function useFormatTypes({ allowedFormats, withoutInteractiveFormatting, __unstableFormatTypeHandlerContext }) {
		const { [FORMAT_TYPES_KEY]: allFormatTypes, ...keyedSelected } = (0, _wordpress_data.useSelect)((select) => {
			const selected = { [FORMAT_TYPES_KEY]: select(store).getFormatTypes() };
			if (!__unstableFormatTypeHandlerContext) return selected;
			for (const type of selected[FORMAT_TYPES_KEY]) if (type.__experimentalGetPropsForEditableTreePreparation && isFormatTypeAllowed(type, allowedFormats, withoutInteractiveFormatting)) Object.assign(selected, prefixSelectKeys(type.__experimentalGetPropsForEditableTreePreparation(select, __unstableFormatTypeHandlerContext), type.name));
			return selected;
		}, [
			allowedFormats,
			withoutInteractiveFormatting,
			__unstableFormatTypeHandlerContext
		]);
		const formatTypes = (0, _wordpress_element.useMemo)(() => allFormatTypes.filter((type) => isFormatTypeAllowed(type, allowedFormats, withoutInteractiveFormatting)), [
			allFormatTypes,
			allowedFormats,
			withoutInteractiveFormatting
		]);
		const dispatch = (0, _wordpress_data.useDispatch)();
		const prepareHandlers = [];
		const valueHandlers = [];
		const changeHandlers = [];
		const dependencies = [];
		for (const key in keyedSelected) dependencies.push(keyedSelected[key]);
		formatTypes.forEach((type) => {
			if (type.__experimentalCreatePrepareEditableTree && __unstableFormatTypeHandlerContext) {
				const handler = type.__experimentalCreatePrepareEditableTree(getPrefixedSelectKeys(keyedSelected, type.name), __unstableFormatTypeHandlerContext);
				if (type.__experimentalCreateOnChangeEditableValue) valueHandlers.push(handler);
				else prepareHandlers.push(handler);
			}
			if (type.__experimentalCreateOnChangeEditableValue && __unstableFormatTypeHandlerContext) {
				let dispatchers = {};
				if (type.__experimentalGetPropsForEditableTreeChangeHandler) dispatchers = type.__experimentalGetPropsForEditableTreeChangeHandler(dispatch, __unstableFormatTypeHandlerContext);
				const selected = getPrefixedSelectKeys(keyedSelected, type.name);
				changeHandlers.push(type.__experimentalCreateOnChangeEditableValue({
					...typeof selected === "object" ? selected : {},
					...dispatchers
				}, __unstableFormatTypeHandlerContext));
			}
		});
		return {
			formatTypes,
			prepareHandlers,
			valueHandlers,
			changeHandlers,
			dependencies
		};
	}

// packages/rich-text/build-module/hook/index.mjs
	const getDomPositionKey = Symbol("getDomPosition");
	/**
	* Whether a selection may be set into the element: it (or an editing host
	* around it) has focus. Otherwise the focus handler sets the selection once
	* focus arrives.
	*
	* @param {HTMLElement} element The editable element.
	*
	* @return {boolean} Whether the element has focus.
	*/
	function hasFocus(element) {
		const { activeElement } = element.ownerDocument;
		return activeElement === element || activeElement?.contentEditable === "true" && activeElement.contains(element);
	}
	function useRichTextBase({ value = "", selectionStart, selectionEnd, placeholder, onSelectionChange, preserveWhiteSpace, onChange, __unstableDisableFormats: disableFormats, __unstableIsSelected: isSelected, __unstableDependencies = [], __unstableAfterParse, __unstableBeforeSerialize, __unstableAddInvisibleFormats }) {
		const registry = (0, _wordpress_data.useRegistry)();
		const [, forceRender] = (0, _wordpress_element.useReducer)(() => ({}), void 0);
		const ref = (0, _wordpress_element.useRef)(void 0);
		function createRecord() {
			const { ownerDocument: { defaultView } } = ref.current;
			const selection = defaultView.getSelection();
			const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
			return create({
				element: ref.current,
				range,
				__unstableIsEditableTree: true
			});
		}
		function applyRecord(newRecord, { domOnly } = {}) {
			apply({
				value: newRecord,
				current: ref.current,
				prepareEditableTree: __unstableAddInvisibleFormats,
				__unstableDomOnly: domOnly,
				placeholder
			});
		}
		const _valueRef = (0, _wordpress_element.useRef)(value);
		const recordRef = (0, _wordpress_element.useRef)(void 0);
		function setRecordFromProps() {
			const activeFormats = recordRef.current?.activeFormats;
			_valueRef.current = value;
			let parsed = value;
			if (!(parsed instanceof RichTextData)) parsed = parsed ? RichTextData.fromHTMLString(parsed) : RichTextData.empty();
			recordRef.current = {
				text: parsed.text,
				formats: parsed.formats,
				replacements: parsed.replacements,
				activeFormats
			};
			if (disableFormats) {
				recordRef.current.formats = Array(value.length);
				recordRef.current.replacements = Array(value.length);
			}
			if (__unstableAfterParse) recordRef.current.formats = __unstableAfterParse(recordRef.current);
			recordRef.current.start = selectionStart;
			recordRef.current.end = selectionEnd;
		}
		if (!recordRef.current) setRecordFromProps();
		else if (selectionStart !== recordRef.current.start || selectionEnd !== recordRef.current.end) recordRef.current = {
			...recordRef.current,
			start: selectionStart,
			end: selectionEnd,
			activeFormats: void 0
		};
		const sentSelectionRef = (0, _wordpress_element.useRef)([]);
		function sendSelection(start, end) {
			sentSelectionRef.current = [start, end];
			onSelectionChange(start, end);
		}
		/**
		* Sync the value to global state. The node tree and selection will also be
		* updated if differences are found.
		*
		* @param {Object} newRecord The record to sync and apply.
		*/
		function handleChange(newRecord) {
			recordRef.current = newRecord;
			applyRecord(newRecord);
			if (disableFormats) _valueRef.current = newRecord.text;
			else {
				const newFormats = __unstableBeforeSerialize ? __unstableBeforeSerialize(newRecord) : newRecord.formats;
				newRecord = {
					...newRecord,
					formats: newFormats
				};
				if (typeof value === "string") _valueRef.current = toHTMLString({
					value: newRecord,
					preserveWhiteSpace
				});
				else _valueRef.current = new RichTextData(newRecord);
			}
			const { start, end, formats, text } = recordRef.current;
			registry.batch(() => {
				sendSelection(start, end);
				onChange(_valueRef.current, {
					__unstableFormats: formats,
					__unstableText: text
				});
			});
			forceRender();
		}
		(0, _wordpress_element.useLayoutEffect)(() => {
			if (value === _valueRef.current) return;
			setRecordFromProps();
			applyRecord(recordRef.current, { domOnly: !hasFocus(ref.current) });
			forceRender();
		}, [value]);
		(0, _wordpress_element.useLayoutEffect)(() => {
			const [sentStart, sentEnd] = sentSelectionRef.current;
			sentSelectionRef.current = [];
			if (isSelected && (selectionStart !== sentStart || selectionEnd !== sentEnd) && hasFocus(ref.current)) applyRecord(recordRef.current);
			else if (recordRef.current.start === void 0 && ref.current.querySelector("[data-rich-text-format-boundary]")) applyRecord(recordRef.current);
		}, [
			selectionStart,
			selectionEnd,
			isSelected
		]);
		useBoundaryStyle({
			record: recordRef,
			ref
		});
		const eventListenerProps = useEventListenerProps({
			record: recordRef,
			handleChange,
			applyRecord,
			createRecord,
			isSelected,
			onSelectionChange: sendSelection,
			forceRender
		});
		const richTextRef = (0, _wordpress_compose.useRefEffect)((element) => {
			ref.current = element;
			setDefaultStyle(element);
			const removeField = addField(element, eventListenerProps);
			setRecordFromProps();
			applyRecord(recordRef.current, { domOnly: !hasFocus(element) });
			return removeField;
		}, [placeholder, ...__unstableDependencies]);
		return {
			value: recordRef.current,
			getValue: () => recordRef.current,
			onChange: handleChange,
			ref: richTextRef,
			[getDomPositionKey]: (0, _wordpress_element.useCallback)((offset) => getDomPosition({
				value: recordRef.current,
				offset: Math.min(offset, recordRef.current.text.length),
				element: ref.current,
				prepareEditableTree: __unstableAddInvisibleFormats,
				placeholder
			}), [__unstableAddInvisibleFormats, placeholder])
		};
	}
	function useRichText({ allowedFormats, withoutInteractiveFormatting, onChange, __unstableDependencies = [], __unstableFormatTypeHandlerContext, ...props }) {
		const { formatTypes, prepareHandlers, valueHandlers, changeHandlers, dependencies } = useFormatTypes({
			allowedFormats,
			withoutInteractiveFormatting,
			__unstableFormatTypeHandlerContext
		});
		function addEditorOnlyFormats(record) {
			return valueHandlers.reduce((accumulator, fn) => fn(accumulator, record.text), record.formats);
		}
		function removeEditorOnlyFormats(record) {
			formatTypes.forEach((formatType) => {
				if (formatType.__experimentalCreatePrepareEditableTree) record = removeFormat(record, formatType.name, 0, record.text.length);
			});
			return record.formats;
		}
		function addInvisibleFormats(record) {
			return prepareHandlers.reduce((accumulator, fn) => fn(accumulator, record.text), record.formats);
		}
		return {
			...useRichTextBase({
				...props,
				onChange(value, { __unstableFormats, __unstableText }) {
					onChange(value, {
						__unstableFormats,
						__unstableText
					});
					Object.values(changeHandlers).forEach((changeHandler) => {
						changeHandler(__unstableFormats, __unstableText);
					});
				},
				__unstableDependencies: [...dependencies, ...__unstableDependencies],
				__unstableAfterParse: addEditorOnlyFormats,
				__unstableBeforeSerialize: removeEditorOnlyFormats,
				__unstableAddInvisibleFormats: addInvisibleFormats
			}),
			formatTypes
		};
	}
	function useDeprecatedRichText(props) {
		(0, _wordpress_deprecated.default)("`__unstableUseRichText` hook", { since: "7.0" });
		return useRichTextBase(props);
	}

// packages/rich-text/build-module/contexts.mjs
/**
	* Holds a Set of keyboard shortcut callbacks registered by format types (via
	* `RichTextShortcut`). The rich text field that owns the editable element
	* provides the Set and dispatches the callbacks on `keydown`. Outside a field,
	* callbacks go to a default Set that nothing dispatches.
	*/
	const KeyboardShortcutContext = (0, _wordpress_element.createContext)(/* @__PURE__ */ new Set());
	KeyboardShortcutContext.displayName = "KeyboardShortcutContext";
	/**
	* Holds a Set of `InputEvent` callbacks registered by format types (via
	* `RichTextInputEvent`). The rich text field that owns the editable element
	* provides the Set and dispatches the callbacks on `input`. Outside a field,
	* callbacks go to a default Set that nothing dispatches.
	*/
	const InputEventContext = (0, _wordpress_element.createContext)(/* @__PURE__ */ new Set());
	InputEventContext.displayName = "InputEventContext";

// packages/rich-text/build-module/keyboard-shortcut.mjs
	function RichTextShortcut({ character, type, onUse }) {
		const keyboardShortcuts = (0, _wordpress_element.useContext)(KeyboardShortcutContext);
		const stableOnUse = (0, _wordpress_compose.useEvent)(onUse);
		(0, _wordpress_element.useEffect)(() => {
			function callback(event) {
				if (_wordpress_keycodes.isKeyboardEvent[type](event, character)) {
					stableOnUse();
					event.preventDefault();
				}
			}
			keyboardShortcuts.add(callback);
			return () => {
				keyboardShortcuts.delete(callback);
			};
		}, [
			character,
			type,
			keyboardShortcuts,
			stableOnUse
		]);
		return null;
	}

// packages/rich-text/build-module/input-event.mjs
	function RichTextInputEvent({ inputType, onInput }) {
		const callbacks = (0, _wordpress_element.useContext)(InputEventContext);
		const stableOnInput = (0, _wordpress_compose.useEvent)(onInput);
		(0, _wordpress_element.useEffect)(() => {
			function callback(event) {
				if (event.inputType === inputType) {
					stableOnInput();
					event.preventDefault();
				}
			}
			callbacks.add(callback);
			return () => {
				callbacks.delete(callback);
			};
		}, [
			inputType,
			callbacks,
			stableOnInput
		]);
		return null;
	}

// packages/rich-text/build-module/event-listeners.mjs
/**
	* Attaches a `keydown` listener that dispatches the keyboard shortcut
	* callbacks format types registered through `KeyboardShortcutContext`.
	*
	* @param keyboardShortcuts The Set the field provides on the context.
	*
	* @return Function that attaches the listener to an element and returns its
	*         cleanup function.
	*/
	const shortcutsListener = (keyboardShortcuts) => (element) => {
		function onKeyDown(event) {
			for (const keyboardShortcut of keyboardShortcuts) keyboardShortcut(event);
		}
		element.addEventListener("keydown", onKeyDown);
		return () => {
			element.removeEventListener("keydown", onKeyDown);
		};
	};
	/**
	* Attaches an `input` listener that dispatches the `InputEvent` callbacks
	* format types registered through `InputEventContext`.
	*
	* @param inputEvents The Set the field provides on the context.
	*
	* @return Function that attaches the listener to an element and returns its
	*         cleanup function.
	*/
	const inputEventsListener = (inputEvents) => (element) => {
		function onInput(event) {
			for (const inputEventHandler of inputEvents) inputEventHandler(event);
		}
		element.addEventListener("input", onInput);
		return () => {
			element.removeEventListener("input", onInput);
		};
	};

// packages/rich-text/build-module/subscribe-owned-listener.mjs
	const { subscribeDelegatedListener } = unlock(_wordpress_compose.privateApis);
	const registries = /* @__PURE__ */ new WeakMap();
	/**
	* Listens for events on the element. Unlike an element listener, it also
	* fires when the selection is inside the element but a focused editing host
	* around it (e.g. the editable canvas wrapper) is the event target.
	*
	* @param element   The editable element.
	* @param eventType DOM event name.
	* @param callback  Listener to be invoked with the event.
	* @param capture   Use the capture phase. Defaults to `false`.
	*
	* @return Unsubscribe function.
	*/
	function subscribeOwnedListener(element, eventType, callback, capture = false) {
		const { ownerDocument } = element;
		let byEvent = registries.get(ownerDocument);
		if (!byEvent) {
			byEvent = /* @__PURE__ */ new Map();
			registries.set(ownerDocument, byEvent);
		}
		const key = capture ? `${eventType}:capture` : eventType;
		const elements = byEvent.get(key) ?? /* @__PURE__ */ new WeakMap();
		if (!byEvent.has(key)) {
			byEvent.set(key, elements);
			subscribeDelegatedListener(ownerDocument, eventType, (event) => {
				const { defaultView, activeElement } = ownerDocument;
				const anchorNode = defaultView?.getSelection()?.anchorNode;
				for (let node = anchorNode ?? activeElement; node; node = node.parentNode) {
					const callbacks = elements.get(node);
					if (callbacks && ownsSelection(node)) for (const cb of callbacks) cb(event);
				}
			}, capture);
		}
		let set = elements.get(element);
		if (!set) {
			set = /* @__PURE__ */ new Set();
			elements.set(element, set);
		}
		set.add(callback);
		return () => {
			set.delete(callback);
		};
	}

// packages/rich-text/build-module/private-apis.mjs
/**
	* Private `@wordpress/rich-text` APIs.
	*/
	const privateApis = {};
	lock(privateApis, {
		useRichText,
		getDomPositionKey,
		useFormatTypes,
		KeyboardShortcutContext,
		InputEventContext,
		RichTextShortcut,
		RichTextInputEvent,
		shortcutsListener,
		inputEventsListener,
		ownsSelection,
		subscribeOwnedListener
	});

// packages/rich-text/build-module/hook/use-anchor-ref.mjs
/**
	* This hook, to be used in a format type's Edit component, returns the active
	* element that is formatted, or the selection range if no format is active.
	* The returned value is meant to be used for positioning UI, e.g. by passing it
	* to the `Popover` component.
	*
	* @param {Object}                 options          Named parameters.
	* @param {RefObject<HTMLElement>} options.ref      React ref of the element
	*                                                  containing  the editable content.
	* @param {RichTextValue}          options.value    Value to check for selection.
	* @param {FormatType}             options.settings The format type's settings.
	*
	* @return {Element|Range} The active element or selection range.
	*/
	function useAnchorRef({ ref, value, settings = {} }) {
		(0, _wordpress_deprecated.default)("`useAnchorRef` hook", {
			since: "6.1",
			alternative: "`useAnchor` hook"
		});
		const { tagName, className, name } = settings;
		const activeFormat = name ? getActiveFormat(value, name) : void 0;
		return (0, _wordpress_element.useMemo)(() => {
			if (!ref.current) return;
			const { ownerDocument: { defaultView } } = ref.current;
			const selection = defaultView.getSelection();
			if (!selection.rangeCount) return;
			const range = selection.getRangeAt(0);
			if (!activeFormat) return range;
			let element = range.startContainer;
			element = element.nextElementSibling || element;
			while (element.nodeType !== element.ELEMENT_NODE) element = element.parentNode;
			return element.closest(tagName + (className ? "." + className : ""));
		}, [
			activeFormat,
			value.start,
			value.end,
			tagName,
			className
		]);
	}

// packages/rich-text/build-module/hook/use-anchor.mjs
/**
	* Given a range and a format tag name and class name, returns the closest
	* format element.
	*
	* @param range                  The Range to check.
	* @param editableContentElement The editable wrapper.
	* @param tagName                The tag name of the format element.
	* @param className              The class name of the format element.
	* @return                       The format element, if found.
	*/
	function getFormatElement(range, editableContentElement, tagName, className) {
		let element = range.startContainer;
		if (element.nodeType === element.TEXT_NODE && element instanceof window.Text && range.startOffset === element.length && element.nextSibling) {
			element = element.nextSibling;
			while (element.firstChild) element = element.firstChild;
		}
		if (element.nodeType !== element.ELEMENT_NODE) {
			if (!element.parentElement) return;
			element = element.parentElement;
		}
		if (element === editableContentElement) return;
		if (!editableContentElement.contains(element)) return;
		const selector = tagName + (className ? "." + className : "");
		if (!selector) return;
		if (!(element instanceof window.HTMLElement)) return;
		let closestElement = element;
		while (closestElement && closestElement !== editableContentElement) {
			if (closestElement.matches(selector)) return closestElement;
			closestElement = closestElement.parentElement;
		}
	}
	/**
	* Creates a virtual anchor element for a range.
	*
	* @param range                  The range to create a virtual anchor element for.
	* @param editableContentElement The editable wrapper.
	* @return                       The virtual anchor element.
	*/
	function createVirtualAnchorElement(range, editableContentElement) {
		return {
			contextElement: editableContentElement,
			getBoundingClientRect() {
				if (editableContentElement.contains(range.startContainer)) return (0, _wordpress_dom.getRectangleFromRange)(range) ?? range.getBoundingClientRect();
				return editableContentElement.getBoundingClientRect();
			}
		};
	}
	/**
	* Get the anchor: a format element if there is a matching one based on the
	* tagName and className or a range otherwise.
	*
	* @param editableContentElement The editable wrapper.
	* @param tagName                The tag name of the format element.
	* @param className              The class name of the format element.
	* @return                       The anchor.
	*/
	function getAnchor(editableContentElement, tagName, className) {
		if (!editableContentElement) return;
		const { ownerDocument } = editableContentElement;
		const { defaultView } = ownerDocument;
		const selection = defaultView?.getSelection();
		if (!selection) return;
		if (!selection.rangeCount) return;
		const range = selection.getRangeAt(0);
		if (!range || !range.startContainer) return;
		if (!tagName && !className) return createVirtualAnchorElement(range, editableContentElement);
		return getFormatElement(range, editableContentElement, tagName, className) ?? createVirtualAnchorElement(range, editableContentElement);
	}
	const DEFAULT_SETTINGS = {
		tagName: "",
		className: ""
	};
	/**
	* This hook, to be used in a format type's Edit component, returns the active
	* element that is formatted, or a virtual element for the selection range if
	* no format is active. The returned value is meant to be used for positioning
	* UI, e.g. by passing it to the `Popover` component via the `anchor` prop.
	*
	* @param obj                        Named parameters.
	* @param obj.editableContentElement The element containing the editable content.
	* @param obj.settings               The format type's settings.
	* @return                           The active element or selection range.
	*/
	function useAnchor({ editableContentElement, settings }) {
		const { tagName, className } = settings ?? DEFAULT_SETTINGS;
		const isActive = !!(settings && "isActive" in settings && settings.isActive);
		const [anchor, setAnchor] = (0, _wordpress_element.useState)(() => getAnchor(editableContentElement, tagName, className ?? ""));
		const wasActive = (0, _wordpress_compose.usePrevious)(isActive);
		(0, _wordpress_element.useLayoutEffect)(() => {
			if (!editableContentElement) return;
			function callback() {
				setAnchor(getAnchor(editableContentElement, tagName, className ?? ""));
			}
			function attach() {
				ownerDocument.addEventListener("selectionchange", callback);
			}
			function detach() {
				ownerDocument.removeEventListener("selectionchange", callback);
			}
			const { ownerDocument } = editableContentElement;
			if (ownsSelection(editableContentElement) || !wasActive && isActive || wasActive && !isActive) {
				setAnchor(getAnchor(editableContentElement, tagName, className ?? ""));
				attach();
			}
			editableContentElement.addEventListener("focusin", attach);
			editableContentElement.addEventListener("focusout", detach);
			return () => {
				detach();
				editableContentElement.removeEventListener("focusin", attach);
				editableContentElement.removeEventListener("focusout", detach);
			};
		}, [
			editableContentElement,
			tagName,
			className,
			isActive,
			wasActive
		]);
		return anchor;
	}

// packages/rich-text/build-module/index.mjs
	function __experimentalRichText() {}

exports.RichTextData = RichTextData;
exports.__experimentalRichText = __experimentalRichText;
exports.__unstableCreateElement = createElement;
exports.__unstableToDom = toDom;
exports.__unstableUseRichText = useDeprecatedRichText;
exports.applyFormat = applyFormat;
exports.concat = concat;
exports.create = create;
exports.getActiveFormat = getActiveFormat;
exports.getActiveFormats = getActiveFormats;
exports.getActiveObject = getActiveObject;
exports.getTextContent = getTextContent;
exports.insert = insert;
exports.insertObject = insertObject;
exports.isCollapsed = isCollapsed;
exports.isEmpty = isEmpty;
exports.join = join;
exports.privateApis = privateApis;
exports.registerFormatType = registerFormatType;
exports.remove = remove;
exports.removeFormat = removeFormat;
exports.replace = replace;
exports.slice = slice;
exports.split = split;
exports.store = store;
exports.toHTMLString = toHTMLString;
exports.toggleFormat = toggleFormat;
exports.unregisterFormatType = unregisterFormatType;
exports.useAnchor = useAnchor;
exports.useAnchorRef = useAnchorRef;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).richText = exports;
return exports;
})({}, window.wp.data, window.wp.escapeHtml, window.wp.a11y, window.wp.i18n, window.wp.privateApis, window.wp.element, window.wp.compose, window.wp.deprecated, window.wp.keycodes, window.wp.dom);
//# sourceMappingURL=index.js.map