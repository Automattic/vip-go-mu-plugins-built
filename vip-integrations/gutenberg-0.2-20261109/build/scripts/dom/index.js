(function(exports, _wordpress_deprecated) {

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

// packages/dom/build-module/focusable.mjs
	var focusable_exports = /* @__PURE__ */ __exportAll({ find: () => find$1 }, 1);
	/**
	* References:
	*
	* Focusable:
	*  - https://www.w3.org/TR/html5/editing.html#focus-management
	*
	* Sequential focus navigation:
	*  - https://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute
	*
	* Disabled elements:
	*  - https://www.w3.org/TR/html5/disabled-elements.html#disabled-elements
	*
	* getClientRects algorithm (requiring layout box):
	*  - https://www.w3.org/TR/cssom-view-1/#extension-to-the-element-interface
	*
	* AREA elements associated with an IMG:
	*  - https://w3c.github.io/html/editing.html#data-model
	*/
	/**
	* Returns a CSS selector used to query for focusable elements.
	*
	* @param sequential If set, only query elements that are sequentially
	*                   focusable. Non-interactive elements with a
	*                   negative `tabindex` are focusable but not
	*                   sequentially focusable.
	*                   https://html.spec.whatwg.org/multipage/interaction.html#the-tabindex-attribute
	*
	* @return CSS selector.
	*/
	function buildSelector(sequential) {
		return [
			sequential ? "[tabindex]:not([tabindex^=\"-\"])" : "[tabindex]",
			"a[href]",
			"button:not([disabled])",
			"input:not([type=\"hidden\"]):not([disabled])",
			"select:not([disabled])",
			"textarea:not([disabled])",
			"iframe:not([tabindex^=\"-\"])",
			"object",
			"embed",
			"summary",
			"area[href]",
			"[contenteditable]:not([contenteditable=false])"
		].join(",");
	}
	/**
	* Returns true if the specified element has a layout box and is not hidden by
	* CSS visibility or content visibility.
	*
	* @param element DOM element to test.
	*
	* @return Whether element is visible.
	*/
	function isVisible(element) {
		if (typeof element.checkVisibility === "function") {
			if (!element.checkVisibility({ visibilityProperty: true })) return false;
		} else {
			const visibility = element.ownerDocument.defaultView?.getComputedStyle(element).visibility;
			if (visibility === "hidden" || visibility === "collapse") return false;
		}
		return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
	}
	/**
	* Returns true if the specified area element is a valid focusable element, or
	* false otherwise. Area is only focusable if within a map where a named map
	* referenced by an image somewhere in the document.
	*
	* @param element DOM area element to test.
	*
	* @return Whether area element is valid for focus.
	*/
	function isValidFocusableArea(element) {
		const map = element.closest("map[name]");
		if (!map) return false;
		const img = element.ownerDocument.querySelector("img[usemap=\"#" + map.name + "\"]");
		return !!img && !img.closest("[inert]") && isVisible(img);
	}
	/**
	* Returns all focusable elements within a given context.
	*
	* @param context              Element in which to search.
	* @param options
	* @param [options.sequential] If set, only return elements that are
	*                             sequentially focusable.
	*                             Non-interactive elements with a
	*                             negative `tabindex` are focusable but
	*                             not sequentially focusable.
	*                             https://html.spec.whatwg.org/multipage/interaction.html#the-tabindex-attribute
	*
	* @return Focusable elements.
	*/
	function find$1(context, { sequential = false } = {}) {
		const elements = context.querySelectorAll(buildSelector(sequential));
		return Array.from(elements).filter((element) => {
			const { nodeName } = element;
			if ("AREA" === nodeName) return isValidFocusableArea(element);
			if (element.closest("[inert]")) return false;
			return isVisible(element);
		});
	}

// packages/dom/build-module/tabbable.mjs
	var tabbable_exports = /* @__PURE__ */ __exportAll({
		find: () => find,
		findNext: () => findNext,
		findPrevious: () => findPrevious,
		isTabbableIndex: () => isTabbableIndex
	}, 1);
	/**
	* Returns the tab index of the given element. In contrast with the tabIndex
	* property, this normalizes the default (0) to avoid browser inconsistencies,
	* operating under the assumption that this function is only ever called with a
	* focusable node.
	*
	* @see https://bugzilla.mozilla.org/show_bug.cgi?id=1190261
	*
	* @param element Element from which to retrieve.
	*
	* @return Tab index of element (default 0).
	*/
	function getTabIndex(element) {
		const tabIndex = element.getAttribute("tabindex");
		return tabIndex === null ? 0 : parseInt(tabIndex, 10);
	}
	/**
	* Returns true if the specified element is tabbable, or false otherwise.
	*
	* @param element Element to test.
	*
	* @return Whether element is tabbable.
	*/
	function isTabbableIndex(element) {
		return getTabIndex(element) !== -1;
	}
	/**
	* Returns a stateful reducer function which constructs a filtered array of
	* tabbable elements, where at most one radio input is selected for a given
	* name, giving priority to checked input, falling back to the first
	* encountered.
	*
	* @return Radio group collapse reducer.
	*/
	function createStatefulCollapseRadioGroup() {
		const CHOSEN_RADIO_BY_NAME = {};
		return function collapseRadioGroup(result, element) {
			const { nodeName, type, checked, name } = element;
			if (nodeName !== "INPUT" || type !== "radio" || !name) return result.concat(element);
			const hasChosen = CHOSEN_RADIO_BY_NAME.hasOwnProperty(name);
			if (!(checked || !hasChosen)) return result;
			if (hasChosen) {
				const hadChosenElement = CHOSEN_RADIO_BY_NAME[name];
				result = result.filter((e) => e !== hadChosenElement);
			}
			CHOSEN_RADIO_BY_NAME[name] = element;
			return result.concat(element);
		};
	}
	/**
	* An array map callback, returning an object with the element value and its
	* array index location as properties. This is used to emulate a proper stable
	* sort where equal tabIndex should be left in order of their occurrence in the
	* document.
	*
	* @param element Element.
	* @param index   Array index of element.
	*
	* @return Mapped object with element, index.
	*/
	function mapElementToObjectTabbable(element, index) {
		return {
			element,
			index
		};
	}
	/**
	* An array map callback, returning an element of the given mapped object's
	* element value.
	*
	* @param object Mapped object with element.
	*
	* @return Mapped object element.
	*/
	function mapObjectTabbableToElement(object) {
		return object.element;
	}
	/**
	* A sort comparator function used in comparing two objects of mapped elements.
	*
	* @see mapElementToObjectTabbable
	*
	* @param a First object to compare.
	* @param b Second object to compare.
	*
	* @return Comparator result.
	*/
	function compareObjectTabbables(a, b) {
		const aTabIndex = getTabIndex(a.element);
		const bTabIndex = getTabIndex(b.element);
		if (aTabIndex === bTabIndex) return a.index - b.index;
		return aTabIndex - bTabIndex;
	}
	/**
	* Given focusable elements, filters out tabbable element.
	*
	* @param focusables Focusable elements to filter.
	*
	* @return Tabbable elements.
	*/
	function filterTabbable(focusables) {
		return focusables.filter(isTabbableIndex).map(mapElementToObjectTabbable).sort(compareObjectTabbables).map(mapObjectTabbableToElement).reduce(createStatefulCollapseRadioGroup(), []);
	}
	/**
	* @param context
	* @return Tabbable elements within the context.
	*/
	function find(context) {
		return filterTabbable(find$1(context));
	}
	/**
	* Given a focusable element, find the preceding tabbable element.
	*
	* @param element The focusable element before which to look. Defaults
	*                to the active element.
	*
	* @return Preceding tabbable element.
	*/
	function findPrevious(element) {
		return filterTabbable(find$1(element.ownerDocument.body)).reverse().find((focusable) => element.compareDocumentPosition(focusable) & element.DOCUMENT_POSITION_PRECEDING);
	}
	/**
	* Given a focusable element, find the next tabbable element.
	*
	* @param element The focusable element after which to look. Defaults
	*                to the active element.
	*
	* @return Next tabbable element.
	*/
	function findNext(element) {
		return filterTabbable(find$1(element.ownerDocument.body)).find((focusable) => element.compareDocumentPosition(focusable) & element.DOCUMENT_POSITION_FOLLOWING);
	}

// packages/dom/build-module/utils/assert-is-defined.mjs
	function assertIsDefined(val, name) {
		if (val === void 0 || val === null) throw new Error(`Expected '${name}' to be defined, but received ${val}`);
	}

// packages/dom/build-module/dom/get-rectangle-from-range.mjs
/**
	* Get the rectangle of a given Range. Returns `null` if no suitable rectangle
	* can be found. Use instead of `Range.getBoundingClientRect()`, which is often
	* broken, especially for collapsed ranges.
	*
	* @param range The range.
	*
	* @return The rectangle.
	*/
	function getRectangleFromRange(range) {
		if (!range.collapsed) {
			const rects = Array.from(range.getClientRects());
			if (rects.length === 1) return rects[0];
			const filteredRects = rects.filter(({ width }) => width > 1);
			if (filteredRects.length === 0) return range.getBoundingClientRect();
			if (filteredRects.length === 1) return filteredRects[0];
			let { top: furthestTop, bottom: furthestBottom, left: furthestLeft, right: furthestRight } = filteredRects[0];
			for (const { top, bottom, left, right } of filteredRects) {
				if (top < furthestTop) furthestTop = top;
				if (bottom > furthestBottom) furthestBottom = bottom;
				if (left < furthestLeft) furthestLeft = left;
				if (right > furthestRight) furthestRight = right;
			}
			return new window.DOMRect(furthestLeft, furthestTop, furthestRight - furthestLeft, furthestBottom - furthestTop);
		}
		const { startContainer, startOffset } = range;
		const { ownerDocument } = startContainer;
		assertIsDefined(ownerDocument, "ownerDocument");
		if (startContainer.nodeType !== startContainer.TEXT_NODE && !startContainer.childNodes.length && startContainer.parentNode) {
			range = ownerDocument.createRange();
			range.setStartBefore(startContainer);
			range.collapse(true);
			return getRectangleFromRange(range);
		}
		if (startContainer.nodeType !== startContainer.TEXT_NODE) {
			let before = startContainer.childNodes[startOffset - 1];
			while (before?.lastChild) before = before.lastChild;
			let after = startContainer.childNodes[startOffset];
			while (after?.firstChild) after = after.firstChild;
			let beforeRange;
			if (before && before.nodeType === before.TEXT_NODE) {
				beforeRange = ownerDocument.createRange();
				beforeRange.setStart(before, before.length);
				beforeRange.collapse(true);
			}
			let afterRange;
			if (after && after.nodeType === after.TEXT_NODE) {
				afterRange = ownerDocument.createRange();
				afterRange.setStart(after, 0);
				afterRange.collapse(true);
			}
			if (beforeRange && afterRange) {
				const beforeRect = beforeRange.getClientRects()[0];
				const afterRect = afterRange.getClientRects()[0];
				if (beforeRect && afterRect && beforeRect.bottom <= afterRect.top) return null;
			}
			if (afterRange) range = afterRange;
			else if (beforeRange) range = beforeRange;
			else return null;
		}
		const rects = range.getClientRects();
		if (rects.length > 1) return null;
		if (rects.length === 1 && startContainer.nodeType === startContainer.TEXT_NODE && range.startOffset > 0 && range.startOffset < startContainer.length) {
			assertIsDefined(ownerDocument, "ownerDocument");
			const measure = (start, end) => {
				const charRange = ownerDocument.createRange();
				charRange.setStart(startContainer, start);
				charRange.setEnd(startContainer, end);
				return charRange.getBoundingClientRect();
			};
			const before = measure(range.startOffset - 1, range.startOffset);
			const after = measure(range.startOffset, range.startOffset + 1);
			if (before.bottom <= after.top) return null;
		}
		return rects[0] ?? null;
	}

// packages/dom/build-module/dom/compute-caret-rect.mjs
/**
	* Get the rectangle for the selection in a container.
	*
	* @param win The window of the selection.
	*
	* @return The rectangle.
	*/
	function computeCaretRect(win) {
		const selection = win.getSelection();
		assertIsDefined(selection, "selection");
		const range = selection.rangeCount ? selection.getRangeAt(0) : null;
		if (!range) return null;
		return getRectangleFromRange(range);
	}

// packages/dom/build-module/dom/document-has-text-selection.mjs
/**
	* Check whether the current document has selected text. This applies to ranges
	* of text in the document, and not selection inside `<input>` and `<textarea>`
	* elements.
	*
	* See: https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection#Related_objects.
	*
	* @param doc The document to check.
	*
	* @return True if there is selection, false if not.
	*/
	function documentHasTextSelection(doc) {
		assertIsDefined(doc.defaultView, "doc.defaultView");
		const selection = doc.defaultView.getSelection();
		assertIsDefined(selection, "selection");
		const range = selection.rangeCount ? selection.getRangeAt(0) : null;
		return !!range && !range.collapsed;
	}

// packages/dom/build-module/dom/is-html-input-element.mjs
/**
	* @param {Node} node
	* @return {node is HTMLInputElement} Whether the node is an HTMLInputElement.
	*/
	function isHTMLInputElement(node) {
		return node?.nodeName === "INPUT";
	}

// packages/dom/build-module/dom/is-text-field.mjs
/**
	* Check whether the given element is a text field, where text field is defined
	* by the ability to select within the input, or that it is contenteditable.
	*
	* See: https://html.spec.whatwg.org/#textFieldSelection
	*
	* @param node The HTML element.
	* @return True if the element is an text field, false if not.
	*/
	function isTextField(node) {
		return isHTMLInputElement(node) && node.type && ![
			"button",
			"checkbox",
			"hidden",
			"file",
			"radio",
			"image",
			"range",
			"reset",
			"submit",
			"number",
			"email",
			"time"
		].includes(node.type) || node.nodeName === "TEXTAREA" || node.contentEditable === "true";
	}

// packages/dom/build-module/dom/input-field-has-uncollapsed-selection.mjs
/**
	* Check whether the given input field or textarea contains a (uncollapsed)
	* selection of text.
	*
	* CAVEAT: Only specific text-based HTML inputs support the selection APIs
	* needed to determine whether they have a collapsed or uncollapsed selection.
	* This function defaults to returning `true` when the selection cannot be
	* inspected, such as with `<input type="time">`. The rationale is that this
	* should cause the block editor to defer to the browser's native selection
	* handling (e.g. copying and pasting), thereby reducing friction for the user.
	*
	* See: https://html.spec.whatwg.org/multipage/input.html#do-not-apply
	*
	* @param element The HTML element.
	*
	* @return Whether the input/textarea element has some "selection".
	*/
	function inputFieldHasUncollapsedSelection(element) {
		if (!isHTMLInputElement(element) && !isTextField(element)) return false;
		try {
			const { selectionStart, selectionEnd } = element;
			return selectionStart === null || selectionStart !== selectionEnd;
		} catch {
			return true;
		}
	}

// packages/dom/build-module/dom/document-has-uncollapsed-selection.mjs
/**
	* Check whether the current document has any sort of (uncollapsed) selection.
	* This includes ranges of text across elements and any selection inside
	* textual `<input>` and `<textarea>` elements.
	*
	* @param doc The document to check.
	*
	* @return Whether there is any recognizable text selection in the document.
	*/
	function documentHasUncollapsedSelection(doc) {
		return documentHasTextSelection(doc) || !!doc.activeElement && inputFieldHasUncollapsedSelection(doc.activeElement);
	}

// packages/dom/build-module/dom/document-has-selection.mjs
/**
	* Check whether the current document has a selection. This includes focus in
	* input fields, textareas, and general rich-text selection.
	*
	* @param doc The document to check.
	*
	* @return True if there is selection, false if not.
	*/
	function documentHasSelection(doc) {
		return !!doc.activeElement && (isHTMLInputElement(doc.activeElement) || isTextField(doc.activeElement) || documentHasTextSelection(doc));
	}

// packages/dom/build-module/dom/get-computed-style.mjs
/**
	* @param element
	* @return The computed style for the element.
	*/
	function getComputedStyle(element) {
		assertIsDefined(element.ownerDocument.defaultView, "element.ownerDocument.defaultView");
		return element.ownerDocument.defaultView.getComputedStyle(element);
	}

// packages/dom/build-module/dom/get-scroll-container.mjs
/**
	* Given a DOM node, finds the closest scrollable container node or the node
	* itself, if scrollable.
	*
	* @param node      Node from which to start.
	* @param direction Direction of scrollable container to search for ('vertical', 'horizontal', 'all').
	*                  Defaults to 'vertical'.
	* @return Scrollable container node, if found.
	*/
	function getScrollContainer(node, direction = "vertical") {
		if (!node) return;
		if (direction === "vertical" || direction === "all") {
			if (node.scrollHeight > node.clientHeight) {
				const { overflowY } = getComputedStyle(node);
				if (/(auto|scroll)/.test(overflowY)) return node;
			}
		}
		if (direction === "horizontal" || direction === "all") {
			if (node.scrollWidth > node.clientWidth) {
				const { overflowX } = getComputedStyle(node);
				if (/(auto|scroll)/.test(overflowX)) return node;
			}
		}
		if (node.ownerDocument === node.parentNode) return node;
		return getScrollContainer(node.parentNode, direction);
	}

// packages/dom/build-module/dom/is-element.mjs
/**
	* @param {Node | null | undefined} node
	* @return {node is Element} True if node is an Element node
	*/
	function isElement(node) {
		return !!node && node.nodeType === node.ELEMENT_NODE;
	}

// packages/dom/build-module/dom/get-offset-parent.mjs
/**
	* Returns the closest positioned element, or null under any of the conditions
	* of the offsetParent specification. Unlike offsetParent, this function is not
	* limited to HTMLElement and accepts any Node (e.g. Node.TEXT_NODE).
	*
	* @see https://drafts.csswg.org/cssom-view/#dom-htmlelement-offsetparent
	*
	* @param node Node from which to find offset parent.
	*
	* @return Offset parent.
	*/
	function getOffsetParent(node) {
		let closestElement = node.parentNode;
		while (closestElement && !isElement(closestElement)) closestElement = closestElement.parentNode;
		if (!closestElement) return null;
		if (getComputedStyle(closestElement).position !== "static") return closestElement;
		return closestElement.offsetParent;
	}

// packages/dom/build-module/dom/is-input-or-text-area.mjs
/**
	* @param {Element} element
	* @return {element is HTMLInputElement | HTMLTextAreaElement} Whether the element is an input or textarea
	*/
	function isInputOrTextArea(element) {
		return element.tagName === "INPUT" || element.tagName === "TEXTAREA";
	}

// packages/dom/build-module/dom/is-entirely-selected.mjs
/**
	* Zero width non-breaking space, used as padding in the editable DOM tree when
	* it is empty otherwise.
	*/
	const ZWNBSP = "﻿";
	/**
	* Check whether the contents of the element have been entirely selected.
	* Returns true if there is no possibility of selection.
	*
	* @param element The element to check.
	*
	* @return True if entirely selected, false if not.
	*/
	function isEntirelySelected(element) {
		if (isInputOrTextArea(element)) return element.selectionStart === 0 && element.value.length === element.selectionEnd;
		if (!element.isContentEditable) return true;
		const text = element.textContent || "";
		if (text === "" || text === ZWNBSP) return true;
		const { ownerDocument } = element;
		const { defaultView } = ownerDocument;
		assertIsDefined(defaultView, "defaultView");
		const selection = defaultView.getSelection();
		assertIsDefined(selection, "selection");
		const range = selection.rangeCount ? selection.getRangeAt(0) : null;
		if (!range) return true;
		const { startContainer, endContainer, startOffset, endOffset } = range;
		if (startContainer === element && endContainer === element && startOffset === 0 && endOffset === element.childNodes.length) return true;
		const lastChild = element.lastChild;
		assertIsDefined(lastChild, "lastChild");
		const endContainerContentLength = endContainer.nodeType === endContainer.TEXT_NODE ? endContainer.data.length : endContainer.childNodes.length;
		return isDeepChild(startContainer, element, "firstChild") && isDeepChild(endContainer, element, "lastChild") && startOffset === 0 && endOffset === endContainerContentLength;
	}
	/**
	* Check whether the contents of the element have been entirely selected.
	* Returns true if there is no possibility of selection.
	*
	* @param query     The element to check.
	* @param container The container that we suspect "query" may be a first or last child of.
	* @param propName  "firstChild" or "lastChild"
	*
	* @return True if query is a deep first/last child of container, false otherwise.
	*/
	function isDeepChild(query, container, propName) {
		let candidate = container;
		do {
			if (query === candidate) return true;
			candidate = candidate[propName];
			while (candidate && candidate.nodeType === candidate.TEXT_NODE && candidate.nodeValue === "") candidate = candidate[propName === "lastChild" ? "previousSibling" : "nextSibling"];
		} while (candidate);
		return false;
	}

// packages/dom/build-module/dom/is-form-element.mjs
/**
	*
	* Detects if element is a form element.
	*
	* @param element The element to check.
	*
	* @return True if form element and false otherwise.
	*/
	function isFormElement(element) {
		if (!element) return false;
		const { tagName } = element;
		return isInputOrTextArea(element) || tagName === "BUTTON" || tagName === "SELECT";
	}

// packages/dom/build-module/dom/is-rtl.mjs
/**
	* Whether the element's text direction is right-to-left.
	*
	* @param element The element to check.
	*
	* @return True if rtl, false if ltr.
	*/
	function isRTL(element) {
		return getComputedStyle(element).direction === "rtl";
	}

// packages/dom/build-module/dom/get-range-height.mjs
/**
	* Gets the height of the range without ignoring zero width rectangles, which
	* some browsers ignore when creating a union.
	*
	* @param range The range to check.
	* @return Height of the range or undefined if the range has no client rectangles.
	*/
	function getRangeHeight(range) {
		const rects = Array.from(range.getClientRects());
		if (!rects.length) return;
		const highestTop = Math.min(...rects.map(({ top }) => top));
		return Math.max(...rects.map(({ bottom }) => bottom)) - highestTop;
	}

// packages/dom/build-module/dom/is-selection-forward.mjs
/**
	* Returns true if the given selection object is in the forward direction, or
	* false otherwise.
	*
	* @see https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
	*
	* @param selection Selection object to check.
	*
	* @return Whether the selection is forward.
	*/
	function isSelectionForward(selection) {
		const { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
		assertIsDefined(anchorNode, "anchorNode");
		assertIsDefined(focusNode, "focusNode");
		const position = anchorNode.compareDocumentPosition(focusNode);
		if (position & anchorNode.DOCUMENT_POSITION_PRECEDING) return false;
		if (position & anchorNode.DOCUMENT_POSITION_FOLLOWING) return true;
		if (position === 0) return anchorOffset <= focusOffset;
		return true;
	}

// packages/dom/build-module/dom/caret-range-from-point.mjs
/**
	* Get a collapsed range for a given point.
	*
	* Prefers the standard `caretPositionFromPoint` API and falls back to the
	* non-standard, WebKit-originated `caretRangeFromPoint` for older browsers.
	*
	* @see https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint
	*
	* @param doc The document of the range.
	* @param x   Horizontal position within the current viewport.
	* @param y   Vertical position within the current viewport.
	*
	* @return The best range for the given point.
	*/
	function caretRangeFromPoint(doc, x, y) {
		if (doc.caretPositionFromPoint) {
			const point = doc.caretPositionFromPoint(x, y);
			if (!point) return null;
			const range = doc.createRange();
			range.setStart(point.offsetNode, point.offset);
			range.collapse(true);
			return range;
		}
		if (doc.caretRangeFromPoint) return doc.caretRangeFromPoint(x, y);
		return null;
	}

// packages/dom/build-module/dom/hidden-caret-range-from-point.mjs
/**
	* Get a collapsed range for a given point.
	* Gives the container a temporary high z-index (above any UI).
	* This is preferred over getting the UI nodes and set styles there.
	*
	* @param doc       The document of the range.
	* @param x         Horizontal position within the current viewport.
	* @param y         Vertical position within the current viewport.
	* @param container Container in which the range is expected to be found.
	*
	* @return The best range for the given point.
	*/
	function hiddenCaretRangeFromPoint(doc, x, y, container) {
		const originalZIndex = container.style.zIndex;
		const originalPosition = container.style.position;
		const originalBorderRadius = container.style.borderRadius;
		const { position = "static" } = getComputedStyle(container);
		if (position === "static") container.style.position = "relative";
		container.style.zIndex = "10000";
		container.style.borderRadius = "0";
		const range = caretRangeFromPoint(doc, x, y);
		container.style.zIndex = originalZIndex;
		container.style.position = originalPosition;
		container.style.borderRadius = originalBorderRadius;
		return range;
	}

// packages/dom/build-module/dom/is-edge.mjs
/**
	* Check whether the selection is at the edge of the container. Checks for
	* horizontal position by default. Set `onlyVertical` to true to check only
	* vertically.
	*
	* @param container    Focusable element.
	* @param isReverse    Set to true to check left, false to check right.
	* @param onlyVertical Set to true to check only vertical position.
	*
	* @return True if at the edge, false if not.
	*/
	function isEdge(container, isReverse, onlyVertical = false) {
		if (isInputOrTextArea(container) && typeof container.selectionStart === "number") {
			if (container.selectionStart !== container.selectionEnd) return false;
			if (isReverse) return container.selectionStart === 0;
			return container.value.length === container.selectionStart;
		}
		if (!container.isContentEditable) return true;
		const { ownerDocument } = container;
		const { defaultView } = ownerDocument;
		assertIsDefined(defaultView, "defaultView");
		const selection = defaultView.getSelection();
		if (!selection || !selection.rangeCount) return false;
		const range = selection.getRangeAt(0);
		const collapsedRange = range.cloneRange();
		const isForward = isSelectionForward(selection);
		const isCollapsed = selection.isCollapsed;
		if (!isCollapsed) collapsedRange.collapse(!isForward);
		const collapsedRangeRect = getRectangleFromRange(collapsedRange);
		const rangeRect = getRectangleFromRange(range);
		if (!collapsedRangeRect || !rangeRect) return false;
		const rangeHeight = getRangeHeight(range);
		if (!isCollapsed && rangeHeight && rangeHeight > collapsedRangeRect.height && isForward === isReverse) return false;
		const contentRange = ownerDocument.createRange();
		contentRange.selectNodeContents(container);
		if (Array.from(contentRange.getClientRects()).some((rect) => rect.height > 0 && (isReverse ? rect.bottom <= rangeRect.top + 1 : rect.top >= rangeRect.bottom - 1))) return false;
		if (onlyVertical) return true;
		const isReverseDir = isRTL(container) ? !isReverse : isReverse;
		const containerRect = container.getBoundingClientRect();
		const x = isReverseDir ? containerRect.left + 1 : containerRect.right - 1;
		const y = isReverse ? rangeRect.top + 1 : rangeRect.bottom - 1;
		const testRange = hiddenCaretRangeFromPoint(ownerDocument, x, y, container);
		if (!testRange || !container.contains(testRange.startContainer)) return false;
		const testRect = getRectangleFromRange(testRange);
		if (!testRect) return false;
		const verticalSide = isReverse ? "top" : "bottom";
		const horizontalSide = isReverseDir ? "left" : "right";
		const verticalDiff = testRect[verticalSide] - rangeRect[verticalSide];
		const horizontalDiff = testRect[horizontalSide] - collapsedRangeRect[horizontalSide];
		return Math.abs(verticalDiff) <= 1 && Math.abs(horizontalDiff) <= 1;
	}

// packages/dom/build-module/dom/is-horizontal-edge.mjs
/**
	* Check whether the selection is horizontally at the edge of the container.
	*
	* @param {HTMLElement} container Focusable element.
	* @param {boolean}     isReverse Set to true to check left, false for right.
	*
	* @return {boolean} True if at the horizontal edge, false if not.
	*/
	function isHorizontalEdge(container, isReverse) {
		return isEdge(container, isReverse);
	}

// packages/dom/build-module/dom/is-number-input.mjs
/**
	* Check whether the given element is an input field of type number.
	*
	* @param node The HTML node.
	*
	* @return True if the node is number input.
	*/
	function isNumberInput(node) {
		(0, _wordpress_deprecated.default)("wp.dom.isNumberInput", {
			since: "6.1",
			version: "6.5"
		});
		return isHTMLInputElement(node) && node.type === "number" && !isNaN(node.valueAsNumber);
	}

// packages/dom/build-module/dom/is-vertical-edge.mjs
/**
	* Check whether the selection is vertically at the edge of the container.
	*
	* @param {HTMLElement} container Focusable element.
	* @param {boolean}     isReverse Set to true to check top, false for bottom.
	*
	* @return {boolean} True if at the vertical edge, false if not.
	*/
	function isVerticalEdge(container, isReverse) {
		return isEdge(container, isReverse, true);
	}

// packages/dom/build-module/dom/scroll-if-no-range.mjs
/**
	* If no range range can be created or it is outside the container, the element
	* may be out of view, so scroll it into view and try again.
	*
	* @param container  The container to scroll.
	* @param alignToTop True to align to top, false to bottom.
	* @param callback   The callback to create the range.
	*
	* @return The range returned by the callback.
	*/
	function scrollIfNoRange(container, alignToTop, callback) {
		let range = callback();
		if (!range || !range.startContainer || !container.contains(range.startContainer)) {
			container.scrollIntoView(alignToTop);
			range = callback();
			if (!range || !range.startContainer || !container.contains(range.startContainer)) return null;
		}
		return range;
	}

// packages/dom/build-module/dom/place-caret-at-edge.mjs
/**
	* Gets the range to place.
	*
	* @param container Focusable element.
	* @param isReverse True for end, false for start.
	* @param x         X coordinate to vertically position.
	*
	* @return The range to place.
	*/
	function getRange(container, isReverse, x) {
		const { ownerDocument } = container;
		const isReverseDir = isRTL(container) ? !isReverse : isReverse;
		const containerRect = container.getBoundingClientRect();
		if (x === void 0) x = isReverse ? containerRect.right - 1 : containerRect.left + 1;
		else if (x <= containerRect.left) x = containerRect.left + 1;
		else if (x >= containerRect.right) x = containerRect.right - 1;
		const y = isReverseDir ? containerRect.bottom - 1 : containerRect.top + 1;
		return hiddenCaretRangeFromPoint(ownerDocument, x, y, container);
	}
	/**
	* Places the caret at start or end of a given element.
	*
	* @param container Focusable element.
	* @param isReverse True for end, false for start.
	* @param x         X coordinate to vertically position.
	*/
	function placeCaretAtEdge(container, isReverse, x) {
		if (!container) return;
		container.focus();
		if (isInputOrTextArea(container)) {
			if (typeof container.selectionStart !== "number") return;
			if (isReverse) {
				container.selectionStart = container.value.length;
				container.selectionEnd = container.value.length;
			} else {
				container.selectionStart = 0;
				container.selectionEnd = 0;
			}
			return;
		}
		if (container.contentEditable !== "true") return;
		const range = scrollIfNoRange(container, isReverse, () => getRange(container, isReverse, x));
		if (!range) return;
		const { ownerDocument } = container;
		const { defaultView } = ownerDocument;
		assertIsDefined(defaultView, "defaultView");
		const selection = defaultView.getSelection();
		assertIsDefined(selection, "selection");
		selection.removeAllRanges();
		selection.addRange(range);
	}

// packages/dom/build-module/dom/place-caret-at-horizontal-edge.mjs
/**
	* Places the caret at start or end of a given element.
	*
	* @param {HTMLElement} container Focusable element.
	* @param {boolean}     isReverse True for end, false for start.
	*/
	function placeCaretAtHorizontalEdge(container, isReverse) {
		return placeCaretAtEdge(container, isReverse, void 0);
	}

// packages/dom/build-module/dom/place-caret-at-vertical-edge.mjs
/**
	* Places the caret at the top or bottom of a given element.
	*
	* @param {HTMLElement} container Focusable element.
	* @param {boolean}     isReverse True for bottom, false for top.
	* @param {DOMRect}     [rect]    The rectangle to position the caret with.
	*/
	function placeCaretAtVerticalEdge(container, isReverse, rect) {
		return placeCaretAtEdge(container, isReverse, rect?.left);
	}

// packages/dom/build-module/dom/insert-after.mjs
/**
	* Given two DOM nodes, inserts the former in the DOM as the next sibling of
	* the latter.
	*
	* @param newNode       Node to be inserted.
	* @param referenceNode Node after which to perform the insertion.
	*/
	function insertAfter(newNode, referenceNode) {
		assertIsDefined(referenceNode.parentNode, "referenceNode.parentNode");
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

// packages/dom/build-module/dom/remove.mjs
/**
	* Given a DOM node, removes it from the DOM.
	*
	* @param node Node to be removed.
	*/
	function remove(node) {
		assertIsDefined(node.parentNode, "node.parentNode");
		node.parentNode.removeChild(node);
	}

// packages/dom/build-module/dom/replace.mjs
/**
	* Given two DOM nodes, replaces the former with the latter in the DOM.
	*
	* @param processedNode Node to be removed.
	* @param newNode       Node to be inserted in its place.
	*/
	function replace(processedNode, newNode) {
		assertIsDefined(processedNode.parentNode, "processedNode.parentNode");
		insertAfter(newNode, processedNode.parentNode);
		remove(processedNode);
	}

// packages/dom/build-module/dom/unwrap.mjs
/**
	* Unwrap the given node. This means any child nodes are moved to the parent.
	*
	* @param node The node to unwrap.
	*/
	function unwrap(node) {
		const parent = node.parentNode;
		assertIsDefined(parent, "node.parentNode");
		while (node.firstChild) parent.insertBefore(node.firstChild, node);
		parent.removeChild(node);
	}

// packages/dom/build-module/dom/replace-tag.mjs
/**
	* Replaces the given node with a new node with the given tag name.
	*
	* @param node    The node to replace
	* @param tagName The new tag name.
	*
	* @return The new node.
	*/
	function replaceTag(node, tagName) {
		const newNode = node.ownerDocument.createElement(tagName);
		while (node.firstChild) newNode.appendChild(node.firstChild);
		assertIsDefined(node.parentNode, "node.parentNode");
		node.parentNode.replaceChild(newNode, node);
		return newNode;
	}

// packages/dom/build-module/dom/wrap.mjs
/**
	* Wraps the given node with a new node with the given tag name.
	*
	* @param newNode       The node to insert.
	* @param referenceNode The node to wrap.
	*/
	function wrap(newNode, referenceNode) {
		assertIsDefined(referenceNode.parentNode, "referenceNode.parentNode");
		referenceNode.parentNode.insertBefore(newNode, referenceNode);
		newNode.appendChild(referenceNode);
	}

// packages/dom/build-module/dom/safe-html.mjs
/**
	* Strips scripts and on* attributes from HTML.
	*
	* @param html HTML to sanitize.
	*
	* @return The sanitized HTML.
	*/
	function safeHTML(html) {
		const { body } = document.implementation.createHTMLDocument("");
		body.innerHTML = html;
		const elements = body.getElementsByTagName("*");
		let elementIndex = elements.length;
		while (elementIndex--) {
			const element = elements[elementIndex];
			if (element.tagName === "SCRIPT") remove(element);
			else {
				let attributeIndex = element.attributes.length;
				while (attributeIndex--) {
					const { name: key } = element.attributes[attributeIndex];
					if (key.startsWith("on")) element.removeAttribute(key);
				}
			}
		}
		return body.innerHTML;
	}

// packages/dom/build-module/dom/strip-html.mjs
/**
	* Removes any HTML tags from the provided string.
	*
	* @param html The string containing html.
	*
	* @return The text content with any html removed.
	*/
	function stripHTML(html) {
		html = safeHTML(html);
		const doc = document.implementation.createHTMLDocument("");
		doc.body.innerHTML = html;
		return doc.body.textContent || "";
	}

// packages/dom/build-module/dom/is-empty.mjs
/**
	* Recursively checks if an element is empty. An element is not empty if it
	* contains text or contains elements with attributes such as images.
	*
	* @param element The element to check.
	*
	* @return Whether or not the element is empty.
	*/
	function isEmpty(element) {
		switch (element.nodeType) {
			case element.TEXT_NODE: return /^[ \f\n\r\t\v\u00a0]*$/.test(element.nodeValue || "");
			case element.ELEMENT_NODE:
				if (element.hasAttributes()) return false;
				else if (!element.hasChildNodes()) return true;
				return Array.from(element.childNodes).every(isEmpty);
			default: return true;
		}
	}

// packages/dom/build-module/phrasing-content.mjs
/**
	* All phrasing content elements.
	*
	* @see https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html#phrasing-content-0
	*/
	/**
	* All text-level semantic elements.
	*
	* @see https://html.spec.whatwg.org/multipage/text-level-semantics.html
	*/
	const textContentSchema = {
		strong: {},
		em: {},
		s: {},
		del: {},
		ins: {},
		a: { attributes: [
			"href",
			"target",
			"rel",
			"id"
		] },
		code: {},
		abbr: { attributes: ["title"] },
		sub: {},
		sup: {},
		br: {},
		small: {},
		q: { attributes: ["cite"] },
		dfn: { attributes: ["title"] },
		data: { attributes: ["value"] },
		time: { attributes: ["datetime"] },
		var: {},
		samp: {},
		kbd: {},
		i: {},
		b: {},
		u: {},
		mark: {},
		ruby: {},
		rt: {},
		rp: {},
		bdi: { attributes: ["dir"] },
		bdo: { attributes: ["dir"] },
		wbr: {},
		"#text": {}
	};
	/**
	* Embedded content elements.
	*
	* @see https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html#embedded-content-0
	*/
	const embeddedContentSchema = {
		audio: { attributes: [
			"src",
			"preload",
			"autoplay",
			"mediagroup",
			"loop",
			"muted"
		] },
		canvas: { attributes: ["width", "height"] },
		embed: { attributes: [
			"src",
			"type",
			"width",
			"height"
		] },
		img: { attributes: [
			"alt",
			"src",
			"srcset",
			"usemap",
			"ismap",
			"width",
			"height"
		] },
		object: { attributes: [
			"data",
			"type",
			"name",
			"usemap",
			"form",
			"width",
			"height"
		] },
		video: { attributes: [
			"src",
			"poster",
			"preload",
			"playsinline",
			"autoplay",
			"mediagroup",
			"loop",
			"muted",
			"controls",
			"width",
			"height"
		] },
		math: {
			attributes: ["display", "xmlns"],
			children: "*"
		}
	};
	const excludedElements = [
		"#text",
		"br",
		"wbr"
	];
	Object.keys(textContentSchema).filter((element) => !excludedElements.includes(element)).forEach((tag) => {
		const { [tag]: removedTag, ...restSchema } = textContentSchema;
		textContentSchema[tag].children = {
			...restSchema,
			img: embeddedContentSchema.img
		};
	});
	/**
	* Phrasing content elements.
	*
	* @see https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html#phrasing-content-0
	*/
	const phrasingContentSchema = {
		...textContentSchema,
		...embeddedContentSchema
	};
	/**
	* Get schema of possible paths for phrasing content.
	*
	* @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
	*
	* @param [context] Set to "paste" to exclude invisible elements and
	*                  sensitive data.
	*
	* @return Schema.
	*/
	function getPhrasingContentSchema(context) {
		if (context !== "paste") return phrasingContentSchema;
		const { u, abbr, data, time, wbr, bdi, bdo, ...remainingContentSchema } = {
			...phrasingContentSchema,
			ins: { children: phrasingContentSchema.ins.children },
			del: { children: phrasingContentSchema.del.children }
		};
		return remainingContentSchema;
	}
	/**
	* Find out whether or not the given node is phrasing content.
	*
	* @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
	*
	* @param node The node to test.
	*
	* @return True if phrasing content, false if not.
	*/
	function isPhrasingContent(node) {
		const tag = node.nodeName.toLowerCase();
		return getPhrasingContentSchema().hasOwnProperty(tag) || tag === "span";
	}
	/**
	* @param node
	* @return Node is text content
	*/
	function isTextContent(node) {
		const tag = node.nodeName.toLowerCase();
		return textContentSchema.hasOwnProperty(tag) || tag === "span";
	}

// packages/dom/build-module/dom/clean-node-list.mjs
	const noop = () => {};
	/**
	* Given a schema, unwraps or removes nodes, attributes and classes on a node
	* list.
	*
	* @param nodeList The nodeList to filter.
	* @param doc      The document of the nodeList.
	* @param schema   Schema for the HTML.
	* @param [inline] Whether to clean for inline mode.
	*/
	function cleanNodeList(nodeList, doc, schema, inline) {
		Array.from(nodeList).forEach((node) => {
			const tag = node.nodeName.toLowerCase();
			if (schema.hasOwnProperty(tag) && (!schema[tag].isMatch || schema[tag].isMatch?.(node))) {
				if (isElement(node)) {
					const { attributes = [], classes = [], children, require = [], allowEmpty } = schema[tag];
					if (children && !allowEmpty && isEmpty(node)) {
						if (isPhrasingContent(node) && node.hasChildNodes()) unwrap(node);
						else remove(node);
						return;
					}
					if (node.hasAttributes()) {
						Array.from(node.attributes).forEach(({ name }) => {
							if (name !== "class" && !attributes.includes(name)) node.removeAttribute(name);
						});
						if (node.classList && node.classList.length) {
							const mattchers = classes.map((item) => {
								if (item === "*") return () => true;
								else if (typeof item === "string") return (className) => className === item;
								else if (item instanceof RegExp) return (className) => item.test(className);
								return noop;
							});
							Array.from(node.classList).forEach((name) => {
								if (!mattchers.some((isMatch) => isMatch(name))) node.classList.remove(name);
							});
							if (!node.classList.length) node.removeAttribute("class");
						}
					}
					if (node.hasChildNodes()) {
						if (children === "*") return;
						if (children) {
							if (require.length && !node.querySelector(require.join(","))) {
								cleanNodeList(node.childNodes, doc, schema, inline);
								unwrap(node);
							} else if (node.parentNode && node.parentNode.nodeName === "BODY" && isPhrasingContent(node)) {
								cleanNodeList(node.childNodes, doc, schema, inline);
								if (Array.from(node.childNodes).some((child) => !isPhrasingContent(child))) unwrap(node);
							} else cleanNodeList(node.childNodes, doc, children, inline);
						} else while (node.firstChild) remove(node.firstChild);
					}
				}
			} else {
				cleanNodeList(node.childNodes, doc, schema, inline);
				if (inline && !isPhrasingContent(node) && node.nextElementSibling) insertAfter(doc.createElement("br"), node);
				unwrap(node);
			}
		});
	}

// packages/dom/build-module/dom/remove-invalid-html.mjs
/**
	* Given a schema, unwraps or removes nodes, attributes and classes on HTML.
	*
	* @param {string}  HTML     The HTML to clean up.
	* @param {Schema}  schema   Schema for the HTML.
	* @param {boolean} [inline] Whether to clean for inline mode.
	*
	* @return {string} The cleaned up HTML.
	*/
	function removeInvalidHTML(HTML, schema, inline) {
		const doc = document.implementation.createHTMLDocument("");
		doc.body.innerHTML = HTML;
		cleanNodeList(doc.body.childNodes, doc, schema, inline);
		return doc.body.innerHTML;
	}

// packages/dom/build-module/data-transfer.mjs
/**
	* Gets all files from a DataTransfer object.
	*
	* @param dataTransfer DataTransfer object to inspect.
	*
	* @return An array containing all files.
	*/
	function getFilesFromDataTransfer(dataTransfer) {
		const files = Array.from(dataTransfer.files);
		Array.from(dataTransfer.items).forEach((item) => {
			const file = item.getAsFile();
			if (file && !files.find(({ name, type, size }) => name === file.name && type === file.type && size === file.size)) files.push(file);
		});
		return files;
	}

// packages/dom/build-module/index.mjs
/**
	* Object grouping `focusable` and `tabbable` utils
	* under the keys with the same name.
	*/
	const focus = {
		focusable: focusable_exports,
		tabbable: tabbable_exports
	};

exports.__unstableStripHTML = stripHTML;
exports.computeCaretRect = computeCaretRect;
exports.documentHasSelection = documentHasSelection;
exports.documentHasTextSelection = documentHasTextSelection;
exports.documentHasUncollapsedSelection = documentHasUncollapsedSelection;
exports.focus = focus;
exports.getFilesFromDataTransfer = getFilesFromDataTransfer;
exports.getOffsetParent = getOffsetParent;
exports.getPhrasingContentSchema = getPhrasingContentSchema;
exports.getRectangleFromRange = getRectangleFromRange;
exports.getScrollContainer = getScrollContainer;
exports.insertAfter = insertAfter;
exports.isEmpty = isEmpty;
exports.isEntirelySelected = isEntirelySelected;
exports.isFormElement = isFormElement;
exports.isHorizontalEdge = isHorizontalEdge;
exports.isNumberInput = isNumberInput;
exports.isPhrasingContent = isPhrasingContent;
exports.isRTL = isRTL;
exports.isSelectionForward = isSelectionForward;
exports.isTextContent = isTextContent;
exports.isTextField = isTextField;
exports.isVerticalEdge = isVerticalEdge;
exports.placeCaretAtHorizontalEdge = placeCaretAtHorizontalEdge;
exports.placeCaretAtVerticalEdge = placeCaretAtVerticalEdge;
exports.remove = remove;
exports.removeInvalidHTML = removeInvalidHTML;
exports.replace = replace;
exports.replaceTag = replaceTag;
exports.safeHTML = safeHTML;
exports.unwrap = unwrap;
exports.wrap = wrap;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).dom = exports;
return exports;
})({}, window.wp.deprecated);
//# sourceMappingURL=index.js.map