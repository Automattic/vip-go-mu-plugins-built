(function(exports) {

"use strict";
// packages/block-serialization-default-parser/build-module/index.mjs
	let document;
	let offset;
	let output;
	let stack;
	/**
	* Matches block comment delimiters
	*
	* While most of this pattern is straightforward the attribute parsing
	* incorporates a tricks to make sure we don't choke on specific input
	*
	*  - since JavaScript has no possessive quantifier or atomic grouping
	*    we are emulating it with a trick
	*
	*    we want a possessive quantifier or atomic group to prevent backtracking
	*    on the `}`s should we fail to match the remainder of the pattern
	*
	*    we can emulate this with a positive lookahead and back reference
	*    (a++)*c === ((?=(a+))\1)*c
	*
	*    let's examine an example:
	*      - /(a+)*c/.test('aaaaaaaaaaaaad') fails after over 49,000 steps
	*      - /(a++)*c/.test('aaaaaaaaaaaaad') fails after 85 steps
	*      - /(?>a+)*c/.test('aaaaaaaaaaaaad') fails after 126 steps
	*
	*    this is because the possessive `++` and the atomic group `(?>)`
	*    tell the engine that all those `a`s belong together as a single group
	*    and so it won't split it up when stepping backwards to try and match
	*
	*    if we use /((?=(a+))\1)*c/ then we get the same behavior as the atomic group
	*    or possessive and prevent the backtracking because the `a+` is matched but
	*    not captured. thus, we find the long string of `a`s and remember it, then
	*    reference it as a whole unit inside our pattern
	*
	*    @see http://instanceof.me/post/52245507631/regex-emulate-atomic-grouping-with-lookahead
	*    @see http://blog.stevenlevithan.com/archives/mimic-atomic-groups
	*    @see https://javascript.info/regexp-infinite-backtracking-problem
	*
	*    once browsers reliably support atomic grouping or possessive
	*    quantifiers natively we should remove this trick and simplify
	*
	* @since 3.8.0
	* @since 4.6.1 added optimization to prevent backtracking on attribute parsing
	*/
	const tokenizer = /<!--[ \t\f\r\n]+(\/)?wp:([a-z][a-z0-9_-]*\/)?([a-z][a-z0-9_-]*)[ \t\f\r\n]+({(?:(?=([^}]+|}+(?=})|(?!}[ \t\f\r\n]+\/?-->)[^])*)\5|[^]*?)}[ \t\f\r\n]+)?(\/)?-->/g;
	/**
	* Constructs a block object.
	*
	* @param blockName    Either the abbreviated core types, e.g. "paragraph", or the fully-qualified
	*                     block type with namespace and type, e.g. "core/paragraph" or "my-plugin/csv-table".
	* @param attrs        The attributes for the block, or null if there are no attributes.
	* @param innerBlocks  An array of inner blocks.
	* @param innerHTML    The inner HTML of the block.
	* @param innerContent An array of inner content strings.
	* @return The block object.
	*/
	function Block(blockName, attrs, innerBlocks, innerHTML, innerContent) {
		return {
			blockName,
			attrs,
			innerBlocks,
			innerHTML,
			innerContent
		};
	}
	/**
	* Constructs a freeform block object.
	*
	* @param innerHTML The inner HTML of the block.
	* @return The freeform block object.
	*/
	function Freeform(innerHTML) {
		return Block(null, {}, [], innerHTML, [innerHTML]);
	}
	/**
	* Constructs a frame object.
	*
	* @param block            The block object.
	* @param tokenStart       The start offset of the token in the document.
	* @param tokenLength      The length of the token in the document.
	* @param prevOffset       The offset of the previous token in the document.
	* @param leadingHtmlStart The start offset of leading HTML before the block.
	* @return The frame object.
	*/
	function Frame(block, tokenStart, tokenLength, prevOffset, leadingHtmlStart) {
		return {
			block,
			tokenStart,
			tokenLength,
			prevOffset: prevOffset || tokenStart + tokenLength,
			leadingHtmlStart
		};
	}
	/**
	* Parser function, that converts input HTML into a block based structure.
	*
	* @param doc The HTML document to parse.
	*
	* @example
	* Input post:
	* ```html
	* <!-- wp:columns {"columns":3} -->
	* <div class="wp-block-columns has-3-columns"><!-- wp:column -->
	* <div class="wp-block-column"><!-- wp:paragraph -->
	* <p>Left</p>
	* <!-- /wp:paragraph --></div>
	* <!-- /wp:column -->
	*
	* <!-- wp:column -->
	* <div class="wp-block-column"><!-- wp:paragraph -->
	* <p><strong>Middle</strong></p>
	* <!-- /wp:paragraph --></div>
	* <!-- /wp:column -->
	*
	* <!-- wp:column -->
	* <div class="wp-block-column"></div>
	* <!-- /wp:column --></div>
	* <!-- /wp:columns -->
	* ```
	*
	* Parsing code:
	* ```js
	* import { parse } from '@wordpress/block-serialization-default-parser';
	*
	* parse( post ) === [
	*     {
	*         blockName: "core/columns",
	*         attrs: {
	*             columns: 3
	*         },
	*         innerBlocks: [
	*             {
	*                 blockName: "core/column",
	*                 attrs: null,
	*                 innerBlocks: [
	*                     {
	*                         blockName: "core/paragraph",
	*                         attrs: null,
	*                         innerBlocks: [],
	*                         innerHTML: "\n<p>Left</p>\n"
	*                     }
	*                 ],
	*                 innerHTML: '\n<div class="wp-block-column"></div>\n'
	*             },
	*             {
	*                 blockName: "core/column",
	*                 attrs: null,
	*                 innerBlocks: [
	*                     {
	*                         blockName: "core/paragraph",
	*                         attrs: null,
	*                         innerBlocks: [],
	*                         innerHTML: "\n<p><strong>Middle</strong></p>\n"
	*                     }
	*                 ],
	*                 innerHTML: '\n<div class="wp-block-column"></div>\n'
	*             },
	*             {
	*                 blockName: "core/column",
	*                 attrs: null,
	*                 innerBlocks: [],
	*                 innerHTML: '\n<div class="wp-block-column"></div>\n'
	*             }
	*         ],
	*         innerHTML: '\n<div class="wp-block-columns has-3-columns">\n\n\n\n</div>\n'
	*     }
	* ];
	* ```
	* @return A block-based representation of the input HTML.
	*/
	const parse = (doc) => {
		document = doc;
		offset = 0;
		output = [];
		stack = [];
		tokenizer.lastIndex = 0;
		do;
		while (proceed());
		return output;
	};
	/**
	* Parses the next token in the input document.
	*
	* @return Returns true when there is more tokens to parse.
	*/
	function proceed() {
		const stackDepth = stack.length;
		const [tokenType, blockName, attrs, startOffset, tokenLength] = nextToken();
		const leadingHtmlStart = startOffset > offset ? offset : null;
		switch (tokenType) {
			case "no-more-tokens":
				if (0 === stackDepth) {
					addFreeform();
					return false;
				}
				implicitlyCloseAllOpenBlocks();
				return false;
			case "void-block":
				if (0 === stackDepth) {
					if (null !== leadingHtmlStart) output.push(Freeform(document.substr(leadingHtmlStart, startOffset - leadingHtmlStart)));
					output.push(Block(blockName, attrs, [], "", []));
					offset = startOffset + tokenLength;
					return true;
				}
				addInnerBlock(Block(blockName, attrs, [], "", []), startOffset, tokenLength);
				offset = startOffset + tokenLength;
				return true;
			case "block-opener":
				stack.push(Frame(Block(blockName, attrs, [], "", []), startOffset, tokenLength, startOffset + tokenLength, leadingHtmlStart));
				offset = startOffset + tokenLength;
				return true;
			case "block-closer":
				if (0 === stackDepth) {
					addFreeform();
					return false;
				}
				if (1 === stackDepth) {
					addBlockFromStack(startOffset);
					offset = startOffset + tokenLength;
					return true;
				}
				const stackTop = stack.pop();
				const html = document.substr(stackTop.prevOffset, startOffset - stackTop.prevOffset);
				if (html) {
					stackTop.block.innerHTML += html;
					stackTop.block.innerContent.push(html);
				}
				stackTop.prevOffset = startOffset + tokenLength;
				addInnerBlock(stackTop.block, stackTop.tokenStart, stackTop.tokenLength, startOffset + tokenLength);
				offset = startOffset + tokenLength;
				return true;
			default:
				addFreeform();
				return false;
		}
	}
	/**
	* Parse JSON if valid, otherwise return null
	*
	* Note that JSON coming from the block comment
	* delimiters is constrained to be an object
	* and cannot be things like `true` or `null`
	*
	* @param input JSON input string to parse
	* @return parsed JSON if valid or null if invalid
	*/
	function parseJSON(input) {
		try {
			return JSON.parse(input);
		} catch {
			return null;
		}
	}
	/**
	* Finds the next token in the document.
	*
	* @return The next matched token.
	*/
	function nextToken() {
		const matches = tokenizer.exec(document);
		if (null === matches) return [
			"no-more-tokens",
			"",
			null,
			0,
			0
		];
		const startedAt = matches.index;
		const [match, closerMatch, namespaceMatch, nameMatch, attrsMatch, , voidMatch] = matches;
		const length = match.length;
		const isCloser = !!closerMatch;
		const isVoid = !!voidMatch;
		const name = (namespaceMatch || "core/") + nameMatch;
		const hasAttrs = !!attrsMatch;
		const attrs = hasAttrs ? parseJSON(attrsMatch) : {};
		if (isCloser && (isVoid || hasAttrs)) {}
		if (isVoid) return [
			"void-block",
			name,
			attrs,
			startedAt,
			length
		];
		if (isCloser) return [
			"block-closer",
			name,
			null,
			startedAt,
			length
		];
		return [
			"block-opener",
			name,
			attrs,
			startedAt,
			length
		];
	}
	/**
	* Adds a freeform block to the output.
	*
	* @param rawLength Optional length of the raw HTML to include as freeform content.
	*/
	function addFreeform(rawLength) {
		const length = rawLength ? rawLength : document.length - offset;
		if (0 === length) return;
		output.push(Freeform(document.substr(offset, length)));
	}
	/**
	* Adds inner block to the parent block.
	*
	* @param block       The inner block to be added to the parent.
	* @param tokenStart  The start offset of the block token in the document.
	* @param tokenLength The total length of the block token.
	* @param lastOffset  Optional offset marking the end of the current block,
	*                    used to update the parent's HTML content boundaries.
	*/
	function addInnerBlock(block, tokenStart, tokenLength, lastOffset) {
		const parent = stack[stack.length - 1];
		parent.block.innerBlocks.push(block);
		const html = document.substr(parent.prevOffset, tokenStart - parent.prevOffset);
		if (html) {
			parent.block.innerHTML += html;
			parent.block.innerContent.push(html);
		}
		parent.block.innerContent.push(null);
		parent.prevOffset = lastOffset ? lastOffset : tokenStart + tokenLength;
	}
	/**
	* Adds block from the stack to the output.
	*
	* @param endOffset Optional offset marking the end of the block's HTML content.
	*/
	function addBlockFromStack(endOffset) {
		const { block, leadingHtmlStart, prevOffset, tokenStart } = stack.pop();
		const html = endOffset ? document.substr(prevOffset, endOffset - prevOffset) : document.substr(prevOffset);
		if (html) {
			block.innerHTML += html;
			block.innerContent.push(html);
		}
		if (null !== leadingHtmlStart) output.push(Freeform(document.substr(leadingHtmlStart, tokenStart - leadingHtmlStart)));
		output.push(block);
	}
	/**
	* Closes all open blocks and adds remaining blocks and freeform content to the output list.
	*
	* @since 24.3.0
	*/
	function implicitlyCloseAllOpenBlocks() {
		let lastClosedBlock = null;
		let lastOpenerAt = document.length;
		let lastLeadingHtml = null;
		while (stack.length > 0) {
			const stackTop = stack.pop();
			let html;
			const htmlLength = lastOpenerAt - stackTop.prevOffset;
			if (htmlLength > 0) {
				html = document.substr(stackTop.prevOffset, htmlLength);
				stackTop.block.innerHTML += html;
				stackTop.block.innerContent.push(html);
			}
			if (lastClosedBlock !== null) {
				stackTop.block.innerContent.push(null);
				stackTop.block.innerBlocks.push(lastClosedBlock);
			}
			lastClosedBlock = stackTop.block;
			lastOpenerAt = stackTop.tokenStart;
			lastLeadingHtml = stackTop.leadingHtmlStart;
		}
		if (null !== lastLeadingHtml && lastOpenerAt > lastLeadingHtml) {
			const html = document.substr(lastLeadingHtml, lastOpenerAt - lastLeadingHtml);
			output.push(Freeform(html));
		}
		if (lastClosedBlock !== null) output.push(lastClosedBlock);
		offset = document.length;
	}

exports.parse = parse;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).blockSerializationDefaultParser = exports;
return exports;
})({});
//# sourceMappingURL=index.js.map