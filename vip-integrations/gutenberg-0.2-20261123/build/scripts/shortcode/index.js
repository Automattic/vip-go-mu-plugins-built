(function(exports) {

"use strict";
// node_modules/.store/memize@2.1.1-roXbtpG2bis3Lggp7SQpAA/node_modules/memize/dist/index.js
/**
	* Memize options object.
	*
	* @typedef MemizeOptions
	*
	* @property {number} [maxSize] Maximum size of the cache.
	*/
	/**
	* Internal cache entry.
	*
	* @typedef MemizeCacheNode
	*
	* @property {?MemizeCacheNode|undefined} [prev] Previous node.
	* @property {?MemizeCacheNode|undefined} [next] Next node.
	* @property {Array<*>}                   args   Function arguments for cache
	*                                               entry.
	* @property {*}                          val    Function result.
	*/
	/**
	* Properties of the enhanced function for controlling cache.
	*
	* @typedef MemizeMemoizedFunction
	*
	* @property {()=>void} clear Clear the cache.
	*/
	/**
	* Accepts a function to be memoized, and returns a new memoized function, with
	* optional options.
	*
	* @template {(...args: any[]) => any} F
	*
	* @param {F}             fn        Function to memoize.
	* @param {MemizeOptions} [options] Options object.
	*
	* @return {((...args: Parameters<F>) => ReturnType<F>) & MemizeMemoizedFunction} Memoized function.
	*/
	function memize(fn, options) {
		var size = 0;
		/** @type {?MemizeCacheNode|undefined} */
		var head;
		/** @type {?MemizeCacheNode|undefined} */
		var tail;
		options = options || {};
		function memoized() {
			var node = head, len = arguments.length, args, i;
			searchCache: while (node) {
				if (node.args.length !== arguments.length) {
					node = node.next;
					continue;
				}
				for (i = 0; i < len; i++) if (node.args[i] !== arguments[i]) {
					node = node.next;
					continue searchCache;
				}
				if (node !== head) {
					if (node === tail) tail = node.prev;
					/** @type {MemizeCacheNode} */ node.prev.next = node.next;
					if (node.next) node.next.prev = node.prev;
					node.next = head;
					node.prev = null;
					/** @type {MemizeCacheNode} */ head.prev = node;
					head = node;
				}
				return node.val;
			}
			args = new Array(len);
			for (i = 0; i < len; i++) args[i] = arguments[i];
			node = {
				args,
				val: fn.apply(null, args)
			};
			if (head) {
				head.prev = node;
				node.next = head;
			} else tail = node;
			if (size === options.maxSize) {
				tail = tail.prev;
				/** @type {MemizeCacheNode} */ tail.next = null;
			} else size++;
			head = node;
			return node.val;
		}
		memoized.clear = function() {
			head = null;
			tail = null;
			size = 0;
		};
		return memoized;
	}

// packages/shortcode/build-module/index.mjs
/**
	* Find the next matching shortcode.
	*
	* @param tag   Shortcode tag.
	* @param text  Text to search.
	* @param index Index to start search from.
	*
	* @return Matched information.
	*/
	function next(tag, text, index = 0) {
		const re = regexp(tag);
		re.lastIndex = index;
		const match = re.exec(text);
		if (!match) return;
		if ("[" === match[1] && "]" === match[7]) return next(tag, text, re.lastIndex);
		const result = {
			index: match.index,
			content: match[0],
			shortcode: fromMatch(match)
		};
		if (match[1]) {
			result.content = result.content.slice(1);
			result.index++;
		}
		if (match[7]) result.content = result.content.slice(0, -1);
		return result;
	}
	/**
	* Replace matching shortcodes in a block of text.
	*
	* @param tag      Shortcode tag.
	* @param text     Text to search.
	* @param callback Function to process the match and return
	*                 replacement string.
	*
	* @return Text with shortcodes replaced.
	*/
	function replace(tag, text, callback) {
		return text.replace(regexp(tag), (...args) => {
			const match = args[0];
			const left = args[1];
			const right = args[7];
			if (left === "[" && right === "]") return match;
			const result = callback(fromMatch(args));
			return result || result === "" ? left + result + right : match;
		});
	}
	/**
	* Generate a string from shortcode parameters.
	*
	* Creates a shortcode instance and returns a string.
	*
	* Accepts the same `options` as the `shortcode()` constructor, containing a
	* `tag` string, a string or object of `attrs`, a boolean indicating whether to
	* format the shortcode using a `single` tag, and a `content` string.
	*
	* @param options Shortcode options.
	*
	* @return String representation of the shortcode.
	*/
	function string(options) {
		return new Shortcode(options).string();
	}
	/**
	* Generate a RegExp to identify a shortcode.
	*
	* The base regex is functionally equivalent to the one found in
	* `get_shortcode_regex()` in `wp-includes/shortcodes.php`.
	*
	* Capture groups:
	*
	* 1. An extra `[` to allow for escaping shortcodes with double `[[]]`
	* 2. The shortcode name
	* 3. The shortcode argument list
	* 4. The self closing `/`
	* 5. The content of a shortcode when it wraps some content.
	* 6. The closing tag.
	* 7. An extra `]` to allow for escaping shortcodes with double `[[]]`
	*
	* @param tag Shortcode tag.
	*
	* @return Shortcode RegExp.
	*/
	function regexp(tag) {
		return new RegExp("\\[(\\[?)(" + tag + ")(?![\\w-])([^\\]\\/]*(?:\\/(?!\\])[^\\]\\/]*)*?)(?:(\\/)\\]|\\](?:([^\\[]*(?:\\[(?!\\/\\2\\])[^\\[]*)*)(\\[\\/\\2\\]))?)(\\]?)", "g");
	}
	/**
	* Parse shortcode attributes.
	*
	* Shortcodes accept many types of attributes. These can chiefly be divided into
	* named and numeric attributes:
	*
	* Named attributes are assigned on a key/value basis, while numeric attributes
	* are treated as an array.
	*
	* Named attributes can be formatted as either `name="value"`, `name='value'`,
	* or `name=value`. Numeric attributes can be formatted as `"value"` or just
	* `value`.
	*
	* @param {string} text Serialised shortcode attributes.
	*
	* @return {ShortcodeAttrs} Parsed shortcode attributes.
	*/
	const attrs = memize((text) => {
		const named = {};
		const numeric = [];
		const pattern = /([\w-]+)\s*=\s*"([^"]*)"(?:\s|$)|([\w-]+)\s*=\s*'([^']*)'(?:\s|$)|([\w-]+)\s*=\s*([^\s'"]+)(?:\s|$)|"([^"]*)"(?:\s|$)|'([^']*)'(?:\s|$)|(\S+)(?:\s|$)/g;
		text = text.replace(/[\u00a0\u200b]/g, " ");
		let match;
		while (match = pattern.exec(text)) if (match[1]) named[match[1].toLowerCase()] = match[2];
		else if (match[3]) named[match[3].toLowerCase()] = match[4];
		else if (match[5]) named[match[5].toLowerCase()] = match[6];
		else if (match[7]) numeric.push(match[7]);
		else if (match[8]) numeric.push(match[8]);
		else if (match[9]) numeric.push(match[9]);
		return {
			named,
			numeric
		};
	});
	/**
	* Generate a Shortcode Object from a RegExp match.
	*
	* Accepts a `match` object from calling `regexp.exec()` on a `RegExp` generated
	* by `regexp()`. `match` can also be set to the `arguments` from a callback
	* passed to `regexp.replace()`.
	*
	* @param match Match array.
	*
	* @return Shortcode instance.
	*/
	function fromMatch(match) {
		let type;
		if (match[4]) type = "self-closing";
		else if (match[6]) type = "closed";
		else type = "single";
		return new Shortcode({
			tag: match[2],
			attrs: match[3],
			type,
			content: match[5]
		});
	}
	/**
	* Creates a shortcode instance.
	*
	* To access a raw representation of a shortcode, pass an `options` object,
	* containing a `tag` string, a string or object of `attrs`, a string indicating
	* the `type` of the shortcode ('single', 'self-closing', or 'closed'), and a
	* `content` string.
	*/
	var Shortcode = class {
		tag;
		type;
		content;
		attrs;
		static next = next;
		static replace = replace;
		static string = string;
		static regexp = regexp;
		static attrs = attrs;
		static fromMatch = fromMatch;
		constructor(options) {
			const { tag, attrs: attributes, type, content } = options;
			this.tag = tag;
			this.type = type;
			this.content = content;
			this.attrs = {
				named: {},
				numeric: []
			};
			if (!attributes) return;
			if (typeof attributes === "string") this.attrs = attrs(attributes);
			else if ("named" in attributes && "numeric" in attributes && attributes.named !== void 0 && attributes.numeric !== void 0) this.attrs = attributes;
			else Object.entries(attributes).forEach(([key, value]) => {
				if (value !== void 0) this.set(key, String(value));
			});
		}
		/**
		* Get a shortcode attribute.
		*
		* Automatically detects whether `attr` is named or numeric and routes it
		* accordingly.
		*
		* @param attr Attribute key.
		*
		* @return Attribute value.
		*/
		get(attr) {
			if (typeof attr === "number") return this.attrs.numeric[attr];
			return this.attrs.named[attr];
		}
		/**
		* Set a shortcode attribute.
		*
		* Automatically detects whether `attr` is named or numeric and routes it
		* accordingly.
		*
		* @param attr  Attribute key.
		* @param value Attribute value.
		*
		* @return Shortcode instance.
		*/
		set(attr, value) {
			if (typeof attr === "number") this.attrs.numeric[attr] = value;
			else this.attrs.named[attr] = value;
			return this;
		}
		/**
		* Transform the shortcode into a string.
		*
		* @return String representation of the shortcode.
		*/
		string() {
			let text = "[" + this.tag;
			this.attrs.numeric.forEach((value) => {
				if (/\s/.test(value)) text += " \"" + value + "\"";
				else text += " " + value;
			});
			Object.entries(this.attrs.named).forEach(([name, value]) => {
				text += " " + name + "=\"" + value + "\"";
			});
			if ("single" === this.type) return text + "]";
			else if ("self-closing" === this.type) return text + " /]";
			text += "]";
			if (this.content) text += this.content;
			return text + "[/" + this.tag + "]";
		}
	};

exports.attrs = attrs;
exports.default = Shortcode;
exports.fromMatch = fromMatch;
exports.next = next;
exports.regexp = regexp;
exports.replace = replace;
exports.string = string;
(window.wp ||= {}).shortcode = exports.default;
return exports;
})({});
//# sourceMappingURL=index.js.map