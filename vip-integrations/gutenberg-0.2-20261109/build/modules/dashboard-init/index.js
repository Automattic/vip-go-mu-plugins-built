import { registerIconResolver } from "@wordpress/widget-primitives";

// \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
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

// \0wp-global:@wordpress/data
var require_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.data;
}));

// \0wp-global:@wordpress/core-data
var require_core_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.coreData;
}));

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// node_modules/.store/domelementtype@2.3.0-KtVmORQAAqFl6uJo6Ee_zQ/node_modules/domelementtype/lib/index.js
var require_lib$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Doctype = exports.CDATA = exports.Tag = exports.Style = exports.Script = exports.Comment = exports.Directive = exports.Text = exports.Root = exports.isTag = exports.ElementType = void 0;
	/** Types of elements found in htmlparser2's DOM */
	var ElementType;
	(function(ElementType) {
		/** Type for the root element of a document */
		ElementType["Root"] = "root";
		/** Type for Text */
		ElementType["Text"] = "text";
		/** Type for <? ... ?> */
		ElementType["Directive"] = "directive";
		/** Type for <!-- ... --> */
		ElementType["Comment"] = "comment";
		/** Type for <script> tags */
		ElementType["Script"] = "script";
		/** Type for <style> tags */
		ElementType["Style"] = "style";
		/** Type for Any tag */
		ElementType["Tag"] = "tag";
		/** Type for <![CDATA[ ... ]]> */
		ElementType["CDATA"] = "cdata";
		/** Type for <!doctype ...> */
		ElementType["Doctype"] = "doctype";
	})(ElementType = exports.ElementType || (exports.ElementType = {}));
	/**
	* Tests whether an element is a tag or not.
	*
	* @param elem Element to test
	*/
	function isTag(elem) {
		return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
	}
	exports.isTag = isTag;
	/** Type for the root element of a document */
	exports.Root = ElementType.Root;
	/** Type for Text */
	exports.Text = ElementType.Text;
	/** Type for <? ... ?> */
	exports.Directive = ElementType.Directive;
	/** Type for <!-- ... --> */
	exports.Comment = ElementType.Comment;
	/** Type for <script> tags */
	exports.Script = ElementType.Script;
	/** Type for <style> tags */
	exports.Style = ElementType.Style;
	/** Type for Any tag */
	exports.Tag = ElementType.Tag;
	/** Type for <![CDATA[ ... ]]> */
	exports.CDATA = ElementType.CDATA;
	/** Type for <!doctype ...> */
	exports.Doctype = ElementType.Doctype;
}));

// node_modules/.store/domhandler@5.0.3--f-5wDNooBv9Syy7pezZrw/node_modules/domhandler/lib/node.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports, module, this$8) => {
	var __extends = this$8 && this$8.__extends || (function() {
		var extendStatics = function(d, b) {
			extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
				d.__proto__ = b;
			} || function(d, b) {
				for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
			};
			return extendStatics(d, b);
		};
		return function(d, b) {
			if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
		};
	})();
	var __assign = this$8 && this$8.__assign || function() {
		__assign = Object.assign || function(t) {
			for (var s, i = 1, n = arguments.length; i < n; i++) {
				s = arguments[i];
				for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
			}
			return t;
		};
		return __assign.apply(this, arguments);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.cloneNode = exports.hasChildren = exports.isDocument = exports.isDirective = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = exports.Element = exports.Document = exports.CDATA = exports.NodeWithChildren = exports.ProcessingInstruction = exports.Comment = exports.Text = exports.DataNode = exports.Node = void 0;
	var domelementtype_1 = require_lib$3();
	/**
	* This object will be used as the prototype for Nodes when creating a
	* DOM-Level-1-compliant structure.
	*/
	var Node = function() {
		function Node() {
			/** Parent of the node */
			this.parent = null;
			/** Previous sibling */
			this.prev = null;
			/** Next sibling */
			this.next = null;
			/** The start index of the node. Requires `withStartIndices` on the handler to be `true. */
			this.startIndex = null;
			/** The end index of the node. Requires `withEndIndices` on the handler to be `true. */
			this.endIndex = null;
		}
		Object.defineProperty(Node.prototype, "parentNode", {
			/**
			* Same as {@link parent}.
			* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
			*/
			get: function() {
				return this.parent;
			},
			set: function(parent) {
				this.parent = parent;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(Node.prototype, "previousSibling", {
			/**
			* Same as {@link prev}.
			* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
			*/
			get: function() {
				return this.prev;
			},
			set: function(prev) {
				this.prev = prev;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(Node.prototype, "nextSibling", {
			/**
			* Same as {@link next}.
			* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
			*/
			get: function() {
				return this.next;
			},
			set: function(next) {
				this.next = next;
			},
			enumerable: false,
			configurable: true
		});
		/**
		* Clone this node, and optionally its children.
		*
		* @param recursive Clone child nodes as well.
		* @returns A clone of the node.
		*/
		Node.prototype.cloneNode = function(recursive) {
			if (recursive === void 0) recursive = false;
			return cloneNode(this, recursive);
		};
		return Node;
	}();
	exports.Node = Node;
	/**
	* A node that contains some data.
	*/
	var DataNode = function(_super) {
		__extends(DataNode, _super);
		/**
		* @param data The content of the data node
		*/
		function DataNode(data) {
			var _this = _super.call(this) || this;
			_this.data = data;
			return _this;
		}
		Object.defineProperty(DataNode.prototype, "nodeValue", {
			/**
			* Same as {@link data}.
			* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
			*/
			get: function() {
				return this.data;
			},
			set: function(data) {
				this.data = data;
			},
			enumerable: false,
			configurable: true
		});
		return DataNode;
	}(Node);
	exports.DataNode = DataNode;
	/**
	* Text within the document.
	*/
	var Text = function(_super) {
		__extends(Text, _super);
		function Text() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.type = domelementtype_1.ElementType.Text;
			return _this;
		}
		Object.defineProperty(Text.prototype, "nodeType", {
			get: function() {
				return 3;
			},
			enumerable: false,
			configurable: true
		});
		return Text;
	}(DataNode);
	exports.Text = Text;
	/**
	* Comments within the document.
	*/
	var Comment = function(_super) {
		__extends(Comment, _super);
		function Comment() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.type = domelementtype_1.ElementType.Comment;
			return _this;
		}
		Object.defineProperty(Comment.prototype, "nodeType", {
			get: function() {
				return 8;
			},
			enumerable: false,
			configurable: true
		});
		return Comment;
	}(DataNode);
	exports.Comment = Comment;
	/**
	* Processing instructions, including doc types.
	*/
	var ProcessingInstruction = function(_super) {
		__extends(ProcessingInstruction, _super);
		function ProcessingInstruction(name, data) {
			var _this = _super.call(this, data) || this;
			_this.name = name;
			_this.type = domelementtype_1.ElementType.Directive;
			return _this;
		}
		Object.defineProperty(ProcessingInstruction.prototype, "nodeType", {
			get: function() {
				return 1;
			},
			enumerable: false,
			configurable: true
		});
		return ProcessingInstruction;
	}(DataNode);
	exports.ProcessingInstruction = ProcessingInstruction;
	/**
	* A `Node` that can have children.
	*/
	var NodeWithChildren = function(_super) {
		__extends(NodeWithChildren, _super);
		/**
		* @param children Children of the node. Only certain node types can have children.
		*/
		function NodeWithChildren(children) {
			var _this = _super.call(this) || this;
			_this.children = children;
			return _this;
		}
		Object.defineProperty(NodeWithChildren.prototype, "firstChild", {
			/** First child of the node. */
			get: function() {
				var _a;
				return (_a = this.children[0]) !== null && _a !== void 0 ? _a : null;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(NodeWithChildren.prototype, "lastChild", {
			/** Last child of the node. */
			get: function() {
				return this.children.length > 0 ? this.children[this.children.length - 1] : null;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(NodeWithChildren.prototype, "childNodes", {
			/**
			* Same as {@link children}.
			* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
			*/
			get: function() {
				return this.children;
			},
			set: function(children) {
				this.children = children;
			},
			enumerable: false,
			configurable: true
		});
		return NodeWithChildren;
	}(Node);
	exports.NodeWithChildren = NodeWithChildren;
	var CDATA = function(_super) {
		__extends(CDATA, _super);
		function CDATA() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.type = domelementtype_1.ElementType.CDATA;
			return _this;
		}
		Object.defineProperty(CDATA.prototype, "nodeType", {
			get: function() {
				return 4;
			},
			enumerable: false,
			configurable: true
		});
		return CDATA;
	}(NodeWithChildren);
	exports.CDATA = CDATA;
	/**
	* The root node of the document.
	*/
	var Document = function(_super) {
		__extends(Document, _super);
		function Document() {
			var _this = _super !== null && _super.apply(this, arguments) || this;
			_this.type = domelementtype_1.ElementType.Root;
			return _this;
		}
		Object.defineProperty(Document.prototype, "nodeType", {
			get: function() {
				return 9;
			},
			enumerable: false,
			configurable: true
		});
		return Document;
	}(NodeWithChildren);
	exports.Document = Document;
	/**
	* An element within the DOM.
	*/
	var Element = function(_super) {
		__extends(Element, _super);
		/**
		* @param name Name of the tag, eg. `div`, `span`.
		* @param attribs Object mapping attribute names to attribute values.
		* @param children Children of the node.
		*/
		function Element(name, attribs, children, type) {
			if (children === void 0) children = [];
			if (type === void 0) type = name === "script" ? domelementtype_1.ElementType.Script : name === "style" ? domelementtype_1.ElementType.Style : domelementtype_1.ElementType.Tag;
			var _this = _super.call(this, children) || this;
			_this.name = name;
			_this.attribs = attribs;
			_this.type = type;
			return _this;
		}
		Object.defineProperty(Element.prototype, "nodeType", {
			get: function() {
				return 1;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(Element.prototype, "tagName", {
			/**
			* Same as {@link name}.
			* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
			*/
			get: function() {
				return this.name;
			},
			set: function(name) {
				this.name = name;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(Element.prototype, "attributes", {
			get: function() {
				var _this = this;
				return Object.keys(this.attribs).map(function(name) {
					var _a, _b;
					return {
						name,
						value: _this.attribs[name],
						namespace: (_a = _this["x-attribsNamespace"]) === null || _a === void 0 ? void 0 : _a[name],
						prefix: (_b = _this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name]
					};
				});
			},
			enumerable: false,
			configurable: true
		});
		return Element;
	}(NodeWithChildren);
	exports.Element = Element;
	/**
	* @param node Node to check.
	* @returns `true` if the node is a `Element`, `false` otherwise.
	*/
	function isTag(node) {
		return (0, domelementtype_1.isTag)(node);
	}
	exports.isTag = isTag;
	/**
	* @param node Node to check.
	* @returns `true` if the node has the type `CDATA`, `false` otherwise.
	*/
	function isCDATA(node) {
		return node.type === domelementtype_1.ElementType.CDATA;
	}
	exports.isCDATA = isCDATA;
	/**
	* @param node Node to check.
	* @returns `true` if the node has the type `Text`, `false` otherwise.
	*/
	function isText(node) {
		return node.type === domelementtype_1.ElementType.Text;
	}
	exports.isText = isText;
	/**
	* @param node Node to check.
	* @returns `true` if the node has the type `Comment`, `false` otherwise.
	*/
	function isComment(node) {
		return node.type === domelementtype_1.ElementType.Comment;
	}
	exports.isComment = isComment;
	/**
	* @param node Node to check.
	* @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
	*/
	function isDirective(node) {
		return node.type === domelementtype_1.ElementType.Directive;
	}
	exports.isDirective = isDirective;
	/**
	* @param node Node to check.
	* @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
	*/
	function isDocument(node) {
		return node.type === domelementtype_1.ElementType.Root;
	}
	exports.isDocument = isDocument;
	/**
	* @param node Node to check.
	* @returns `true` if the node has children, `false` otherwise.
	*/
	function hasChildren(node) {
		return Object.prototype.hasOwnProperty.call(node, "children");
	}
	exports.hasChildren = hasChildren;
	/**
	* Clone a node, and optionally its children.
	*
	* @param recursive Clone child nodes as well.
	* @returns A clone of the node.
	*/
	function cloneNode(node, recursive) {
		if (recursive === void 0) recursive = false;
		var result;
		if (isText(node)) result = new Text(node.data);
		else if (isComment(node)) result = new Comment(node.data);
		else if (isTag(node)) {
			var children = recursive ? cloneChildren(node.children) : [];
			var clone_1 = new Element(node.name, __assign({}, node.attribs), children);
			children.forEach(function(child) {
				return child.parent = clone_1;
			});
			if (node.namespace != null) clone_1.namespace = node.namespace;
			if (node["x-attribsNamespace"]) clone_1["x-attribsNamespace"] = __assign({}, node["x-attribsNamespace"]);
			if (node["x-attribsPrefix"]) clone_1["x-attribsPrefix"] = __assign({}, node["x-attribsPrefix"]);
			result = clone_1;
		} else if (isCDATA(node)) {
			var children = recursive ? cloneChildren(node.children) : [];
			var clone_2 = new CDATA(children);
			children.forEach(function(child) {
				return child.parent = clone_2;
			});
			result = clone_2;
		} else if (isDocument(node)) {
			var children = recursive ? cloneChildren(node.children) : [];
			var clone_3 = new Document(children);
			children.forEach(function(child) {
				return child.parent = clone_3;
			});
			if (node["x-mode"]) clone_3["x-mode"] = node["x-mode"];
			result = clone_3;
		} else if (isDirective(node)) {
			var instruction = new ProcessingInstruction(node.name, node.data);
			if (node["x-name"] != null) {
				instruction["x-name"] = node["x-name"];
				instruction["x-publicId"] = node["x-publicId"];
				instruction["x-systemId"] = node["x-systemId"];
			}
			result = instruction;
		} else throw new Error("Not implemented yet: ".concat(node.type));
		result.startIndex = node.startIndex;
		result.endIndex = node.endIndex;
		if (node.sourceCodeLocation != null) result.sourceCodeLocation = node.sourceCodeLocation;
		return result;
	}
	exports.cloneNode = cloneNode;
	function cloneChildren(childs) {
		var children = childs.map(function(child) {
			return cloneNode(child, true);
		});
		for (var i = 1; i < children.length; i++) {
			children[i].prev = children[i - 1];
			children[i - 1].next = children[i];
		}
		return children;
	}
}));

// node_modules/.store/domhandler@5.0.3--f-5wDNooBv9Syy7pezZrw/node_modules/domhandler/lib/index.js
var require_lib$2 = /* @__PURE__ */ __commonJSMin(((exports, module, this$7) => {
	var __createBinding = this$7 && this$7.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = this$7 && this$7.__exportStar || function(m, exports) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DomHandler = void 0;
	var domelementtype_1 = require_lib$3();
	var node_js_1 = require_node();
	__exportStar(require_node(), exports);
	var defaultOpts = {
		withStartIndices: false,
		withEndIndices: false,
		xmlMode: false
	};
	var DomHandler = function() {
		/**
		* @param callback Called once parsing has completed.
		* @param options Settings for the handler.
		* @param elementCB Callback whenever a tag is closed.
		*/
		function DomHandler(callback, options, elementCB) {
			/** The elements of the DOM */
			this.dom = [];
			/** The root element for the DOM */
			this.root = new node_js_1.Document(this.dom);
			/** Indicated whether parsing has been completed. */
			this.done = false;
			/** Stack of open tags. */
			this.tagStack = [this.root];
			/** A data node that is still being written to. */
			this.lastNode = null;
			/** Reference to the parser instance. Used for location information. */
			this.parser = null;
			if (typeof options === "function") {
				elementCB = options;
				options = defaultOpts;
			}
			if (typeof callback === "object") {
				options = callback;
				callback = void 0;
			}
			this.callback = callback !== null && callback !== void 0 ? callback : null;
			this.options = options !== null && options !== void 0 ? options : defaultOpts;
			this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
		}
		DomHandler.prototype.onparserinit = function(parser) {
			this.parser = parser;
		};
		DomHandler.prototype.onreset = function() {
			this.dom = [];
			this.root = new node_js_1.Document(this.dom);
			this.done = false;
			this.tagStack = [this.root];
			this.lastNode = null;
			this.parser = null;
		};
		DomHandler.prototype.onend = function() {
			if (this.done) return;
			this.done = true;
			this.parser = null;
			this.handleCallback(null);
		};
		DomHandler.prototype.onerror = function(error) {
			this.handleCallback(error);
		};
		DomHandler.prototype.onclosetag = function() {
			this.lastNode = null;
			var elem = this.tagStack.pop();
			if (this.options.withEndIndices) elem.endIndex = this.parser.endIndex;
			if (this.elementCB) this.elementCB(elem);
		};
		DomHandler.prototype.onopentag = function(name, attribs) {
			var type = this.options.xmlMode ? domelementtype_1.ElementType.Tag : void 0;
			var element = new node_js_1.Element(name, attribs, void 0, type);
			this.addNode(element);
			this.tagStack.push(element);
		};
		DomHandler.prototype.ontext = function(data) {
			var lastNode = this.lastNode;
			if (lastNode && lastNode.type === domelementtype_1.ElementType.Text) {
				lastNode.data += data;
				if (this.options.withEndIndices) lastNode.endIndex = this.parser.endIndex;
			} else {
				var node = new node_js_1.Text(data);
				this.addNode(node);
				this.lastNode = node;
			}
		};
		DomHandler.prototype.oncomment = function(data) {
			if (this.lastNode && this.lastNode.type === domelementtype_1.ElementType.Comment) {
				this.lastNode.data += data;
				return;
			}
			var node = new node_js_1.Comment(data);
			this.addNode(node);
			this.lastNode = node;
		};
		DomHandler.prototype.oncommentend = function() {
			this.lastNode = null;
		};
		DomHandler.prototype.oncdatastart = function() {
			var text = new node_js_1.Text("");
			var node = new node_js_1.CDATA([text]);
			this.addNode(node);
			text.parent = node;
			this.lastNode = text;
		};
		DomHandler.prototype.oncdataend = function() {
			this.lastNode = null;
		};
		DomHandler.prototype.onprocessinginstruction = function(name, data) {
			var node = new node_js_1.ProcessingInstruction(name, data);
			this.addNode(node);
		};
		DomHandler.prototype.handleCallback = function(error) {
			if (typeof this.callback === "function") this.callback(error, this.dom);
			else if (error) throw error;
		};
		DomHandler.prototype.addNode = function(node) {
			var parent = this.tagStack[this.tagStack.length - 1];
			var previousSibling = parent.children[parent.children.length - 1];
			if (this.options.withStartIndices) node.startIndex = this.parser.startIndex;
			if (this.options.withEndIndices) node.endIndex = this.parser.endIndex;
			parent.children.push(node);
			if (previousSibling) {
				node.prev = previousSibling;
				previousSibling.next = node;
			}
			node.parent = parent;
			this.lastNode = null;
		};
		return DomHandler;
	}();
	exports.DomHandler = DomHandler;
	exports.default = DomHandler;
}));

// node_modules/.store/html-dom-parser@5.1.2-34qJTH-vGflP2FY34V9LXQ/node_modules/html-dom-parser/lib/client/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CARRIAGE_RETURN_PLACEHOLDER_REGEX = exports.CARRIAGE_RETURN_PLACEHOLDER = exports.CARRIAGE_RETURN_REGEX = exports.CARRIAGE_RETURN = exports.CASE_SENSITIVE_TAG_NAMES_MAP = exports.CASE_SENSITIVE_TAG_NAMES = void 0;
	/**
	* SVG elements are case-sensitive.
	*
	* @see https://developer.mozilla.org/docs/Web/SVG/Element#svg_elements_a_to_z
	*/
	exports.CASE_SENSITIVE_TAG_NAMES = [
		"animateMotion",
		"animateTransform",
		"clipPath",
		"feBlend",
		"feColorMatrix",
		"feComponentTransfer",
		"feComposite",
		"feConvolveMatrix",
		"feDiffuseLighting",
		"feDisplacementMap",
		"feDropShadow",
		"feFlood",
		"feFuncA",
		"feFuncB",
		"feFuncG",
		"feFuncR",
		"feGaussianBlur",
		"feImage",
		"feMerge",
		"feMergeNode",
		"feMorphology",
		"feOffset",
		"fePointLight",
		"feSpecularLighting",
		"feSpotLight",
		"feTile",
		"feTurbulence",
		"foreignObject",
		"linearGradient",
		"radialGradient",
		"textPath"
	];
	exports.CASE_SENSITIVE_TAG_NAMES_MAP = exports.CASE_SENSITIVE_TAG_NAMES.reduce(function(accumulator, tagName) {
		accumulator[tagName.toLowerCase()] = tagName;
		return accumulator;
	}, {});
	exports.CARRIAGE_RETURN = "\r";
	exports.CARRIAGE_RETURN_REGEX = new RegExp(exports.CARRIAGE_RETURN, "g");
	exports.CARRIAGE_RETURN_PLACEHOLDER = "__HTML_DOM_PARSER_CARRIAGE_RETURN_PLACEHOLDER_".concat(Date.now(), "__");
	exports.CARRIAGE_RETURN_PLACEHOLDER_REGEX = new RegExp(exports.CARRIAGE_RETURN_PLACEHOLDER, "g");
}));

// node_modules/.store/html-dom-parser@5.1.2-34qJTH-vGflP2FY34V9LXQ/node_modules/html-dom-parser/lib/client/utilities.js
var require_utilities$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.formatAttributes = formatAttributes;
	exports.escapeSpecialCharacters = escapeSpecialCharacters;
	exports.revertEscapedCharacters = revertEscapedCharacters;
	exports.formatDOM = formatDOM;
	var domhandler_1 = require_lib$2();
	var constants_1 = require_constants();
	/**
	* Gets case-sensitive tag name.
	*
	* @param tagName - Tag name in lowercase.
	* @returns - Case-sensitive tag name.
	*/
	function getCaseSensitiveTagName(tagName) {
		return constants_1.CASE_SENSITIVE_TAG_NAMES_MAP[tagName];
	}
	/**
	* Formats DOM attributes to a hash map.
	*
	* @param attributes - List of attributes.
	* @returns - Map of attribute name to value.
	*/
	function formatAttributes(attributes) {
		var map = {};
		var index = 0;
		var attributesLength = attributes.length;
		for (; index < attributesLength; index++) {
			var attribute = attributes[index];
			map[attribute.name] = attribute.value;
		}
		return map;
	}
	/**
	* Corrects the tag name if it is case-sensitive (SVG).
	* Otherwise, returns the lowercase tag name (HTML).
	*
	* @param tagName - Lowercase tag name.
	* @returns - Formatted tag name.
	*/
	function formatTagName(tagName) {
		tagName = tagName.toLowerCase();
		var caseSensitiveTagName = getCaseSensitiveTagName(tagName);
		if (caseSensitiveTagName) return caseSensitiveTagName;
		return tagName;
	}
	/**
	* Escapes special characters before parsing.
	*
	* @param html - The HTML string.
	* @returns - HTML string with escaped special characters.
	*/
	function escapeSpecialCharacters(html) {
		return html.replace(constants_1.CARRIAGE_RETURN_REGEX, constants_1.CARRIAGE_RETURN_PLACEHOLDER);
	}
	/**
	* Reverts escaped special characters back to actual characters.
	*
	* @param text - The text with escaped characters.
	* @returns - Text with escaped characters reverted.
	*/
	function revertEscapedCharacters(text) {
		return text.replace(constants_1.CARRIAGE_RETURN_PLACEHOLDER_REGEX, constants_1.CARRIAGE_RETURN);
	}
	/**
	* Transforms DOM nodes to `domhandler` nodes.
	*
	* @param nodes - DOM nodes.
	* @param parent - Parent node.
	* @param directive - Directive.
	* @returns - Nodes.
	*/
	function formatDOM(nodes, parent, directive) {
		if (parent === void 0) parent = null;
		var domNodes = [];
		var current;
		var index = 0;
		var nodesLength = nodes.length;
		for (; index < nodesLength; index++) {
			var node = nodes[index];
			switch (node.nodeType) {
				case 1:
					var tagName = formatTagName(node.nodeName);
					current = new domhandler_1.Element(tagName, formatAttributes(node.attributes));
					current.children = formatDOM(tagName === "template" ? node.content.childNodes : node.childNodes, current);
					break;
				case 3:
					current = new domhandler_1.Text(revertEscapedCharacters(node.nodeValue));
					break;
				case 8:
					current = new domhandler_1.Comment(node.nodeValue);
					break;
				default: continue;
			}
			var prev = domNodes[index - 1] || null;
			if (prev) prev.next = current;
			current.parent = parent;
			current.prev = prev;
			current.next = null;
			domNodes.push(current);
		}
		if (directive) {
			current = new domhandler_1.ProcessingInstruction(directive.substring(0, directive.indexOf(" ")).toLowerCase(), directive);
			current.next = domNodes[0] || null;
			current.parent = parent;
			domNodes.unshift(current);
			if (domNodes[1]) domNodes[1].prev = domNodes[0];
		}
		return domNodes;
	}
}));

// node_modules/.store/html-dom-parser@5.1.2-34qJTH-vGflP2FY34V9LXQ/node_modules/html-dom-parser/lib/client/domparser.js
var require_domparser = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = domparser;
	var utilities_1 = require_utilities$2();
	var HTML = "html";
	var HEAD = "head";
	var BODY = "body";
	var FIRST_TAG_REGEX = /<([a-zA-Z]+[0-9]?)/;
	var HEAD_TAG_REGEX = /<head[^]*>/i;
	var BODY_TAG_REGEX = /<body[^]*>/i;
	var parseFromDocument = function(html, tagName) {
		/* istanbul ignore next */
		throw new Error("This browser does not support `document.implementation.createHTMLDocument`");
	};
	var parseFromString = function(html, tagName) {
		/* istanbul ignore next */
		throw new Error("This browser does not support `DOMParser.prototype.parseFromString`");
	};
	var DOMParser = typeof window === "object" && window.DOMParser;
	/**
	* DOMParser (performance: slow).
	*
	* @see https://developer.mozilla.org/docs/Web/API/DOMParser#Parsing_an_SVG_or_HTML_document
	*/
	if (typeof DOMParser === "function") {
		var domParser_1 = new DOMParser();
		var mimeType_1 = "text/html";
		/**
		* Creates an HTML document using `DOMParser.parseFromString`.
		*
		* @param html - The HTML string.
		* @param tagName - The element to render the HTML (with 'body' as fallback).
		* @returns - Document.
		*/
		parseFromString = function(html, tagName) {
			if (tagName)
 /* istanbul ignore next */
			html = "<".concat(tagName, ">").concat(html, "</").concat(tagName, ">");
			return domParser_1.parseFromString(html, mimeType_1);
		};
		parseFromDocument = parseFromString;
	}
	/**
	* DOMImplementation (performance: fair).
	*
	* @see https://developer.mozilla.org/docs/Web/API/DOMImplementation/createHTMLDocument
	*/
	if (typeof document === "object" && document.implementation) {
		var htmlDocument_1 = document.implementation.createHTMLDocument();
		/**
		* Use HTML document created by `document.implementation.createHTMLDocument`.
		*
		* @param html - The HTML string.
		* @param tagName - The element to render the HTML (with 'body' as fallback).
		* @returns - Document
		*/
		parseFromDocument = function(html, tagName) {
			if (tagName) {
				var element = htmlDocument_1.documentElement.querySelector(tagName);
				if (element) element.innerHTML = html;
				return htmlDocument_1;
			}
			htmlDocument_1.documentElement.innerHTML = html;
			return htmlDocument_1;
		};
	}
	/**
	* Template (performance: fast).
	*
	* @see https://developer.mozilla.org/docs/Web/HTML/Element/template
	*/
	var template = typeof document === "object" && document.createElement("template");
	var parseFromTemplate;
	if (template && template.content)
 /**
	* Uses a template element (content fragment) to parse HTML.
	*
	* @param html - HTML string.
	* @returns - Nodes.
	*/
	parseFromTemplate = function(html) {
		template.innerHTML = html;
		return template.content.childNodes;
	};
	/**
	* Parses HTML string to DOM nodes.
	*
	* @param html - HTML markup.
	* @returns - DOM nodes.
	*/
	function domparser(html) {
		var _a, _b;
		html = (0, utilities_1.escapeSpecialCharacters)(html);
		var match = html.match(FIRST_TAG_REGEX);
		var firstTagName = match && match[1] ? match[1].toLowerCase() : "";
		switch (firstTagName) {
			case HTML:
				var doc = parseFromString(html);
				if (!HEAD_TAG_REGEX.test(html)) {
					var element = doc.querySelector(HEAD);
					(_a = element === null || element === void 0 ? void 0 : element.parentNode) === null || _a === void 0 || _a.removeChild(element);
				}
				if (!BODY_TAG_REGEX.test(html)) {
					var element = doc.querySelector(BODY);
					(_b = element === null || element === void 0 ? void 0 : element.parentNode) === null || _b === void 0 || _b.removeChild(element);
				}
				return doc.querySelectorAll(HTML);
			case HEAD:
			case BODY:
				var elements = parseFromDocument(html).querySelectorAll(firstTagName);
				if (BODY_TAG_REGEX.test(html) && HEAD_TAG_REGEX.test(html)) return elements[0].parentNode.childNodes;
				return elements;
			default:
				if (parseFromTemplate) return parseFromTemplate(html);
				var element = parseFromDocument(html, BODY).querySelector(BODY);
				return element.childNodes;
		}
	}
}));

// node_modules/.store/html-dom-parser@5.1.2-34qJTH-vGflP2FY34V9LXQ/node_modules/html-dom-parser/lib/client/html-to-dom.js
var require_html_to_dom = /* @__PURE__ */ __commonJSMin(((exports, module, this$6) => {
	var __importDefault = this$6 && this$6.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = HTMLDOMParser;
	var domparser_1 = __importDefault(require_domparser());
	var utilities_1 = require_utilities$2();
	var DIRECTIVE_REGEX = /<(![a-zA-Z\s]+)>/;
	/**
	* Parses HTML string to DOM nodes in browser.
	*
	* @param html - HTML markup.
	* @returns - DOM elements.
	*/
	function HTMLDOMParser(html) {
		if (typeof html !== "string") throw new TypeError("First argument must be a string");
		if (!html) return [];
		var match = html.match(DIRECTIVE_REGEX);
		var directive = match ? match[1] : void 0;
		return (0, utilities_1.formatDOM)((0, domparser_1.default)(html), null, directive);
	}
}));

// node_modules/.store/react-property@2.0.2-Ud5KeAnfmYjAWwVn6x1ckQ/node_modules/react-property/lib/possibleStandardNamesOptimized.js
var require_possibleStandardNamesOptimized = /* @__PURE__ */ __commonJSMin(((exports) => {
	var SAME = 0;
	exports.SAME = SAME;
	var CAMELCASE = 1;
	exports.CAMELCASE = CAMELCASE;
	exports.possibleStandardNames = {
		accept: 0,
		acceptCharset: 1,
		"accept-charset": "acceptCharset",
		accessKey: 1,
		action: 0,
		allowFullScreen: 1,
		alt: 0,
		as: 0,
		async: 0,
		autoCapitalize: 1,
		autoComplete: 1,
		autoCorrect: 1,
		autoFocus: 1,
		autoPlay: 1,
		autoSave: 1,
		capture: 0,
		cellPadding: 1,
		cellSpacing: 1,
		challenge: 0,
		charSet: 1,
		checked: 0,
		children: 0,
		cite: 0,
		class: "className",
		classID: 1,
		className: 1,
		cols: 0,
		colSpan: 1,
		content: 0,
		contentEditable: 1,
		contextMenu: 1,
		controls: 0,
		controlsList: 1,
		coords: 0,
		crossOrigin: 1,
		dangerouslySetInnerHTML: 1,
		data: 0,
		dateTime: 1,
		default: 0,
		defaultChecked: 1,
		defaultValue: 1,
		defer: 0,
		dir: 0,
		disabled: 0,
		disablePictureInPicture: 1,
		disableRemotePlayback: 1,
		download: 0,
		draggable: 0,
		encType: 1,
		enterKeyHint: 1,
		for: "htmlFor",
		form: 0,
		formMethod: 1,
		formAction: 1,
		formEncType: 1,
		formNoValidate: 1,
		formTarget: 1,
		frameBorder: 1,
		headers: 0,
		height: 0,
		hidden: 0,
		high: 0,
		href: 0,
		hrefLang: 1,
		htmlFor: 1,
		httpEquiv: 1,
		"http-equiv": "httpEquiv",
		icon: 0,
		id: 0,
		innerHTML: 1,
		inputMode: 1,
		integrity: 0,
		is: 0,
		itemID: 1,
		itemProp: 1,
		itemRef: 1,
		itemScope: 1,
		itemType: 1,
		keyParams: 1,
		keyType: 1,
		kind: 0,
		label: 0,
		lang: 0,
		list: 0,
		loop: 0,
		low: 0,
		manifest: 0,
		marginWidth: 1,
		marginHeight: 1,
		max: 0,
		maxLength: 1,
		media: 0,
		mediaGroup: 1,
		method: 0,
		min: 0,
		minLength: 1,
		multiple: 0,
		muted: 0,
		name: 0,
		noModule: 1,
		nonce: 0,
		noValidate: 1,
		open: 0,
		optimum: 0,
		pattern: 0,
		placeholder: 0,
		playsInline: 1,
		poster: 0,
		preload: 0,
		profile: 0,
		radioGroup: 1,
		readOnly: 1,
		referrerPolicy: 1,
		rel: 0,
		required: 0,
		reversed: 0,
		role: 0,
		rows: 0,
		rowSpan: 1,
		sandbox: 0,
		scope: 0,
		scoped: 0,
		scrolling: 0,
		seamless: 0,
		selected: 0,
		shape: 0,
		size: 0,
		sizes: 0,
		span: 0,
		spellCheck: 1,
		src: 0,
		srcDoc: 1,
		srcLang: 1,
		srcSet: 1,
		start: 0,
		step: 0,
		style: 0,
		summary: 0,
		tabIndex: 1,
		target: 0,
		title: 0,
		type: 0,
		useMap: 1,
		value: 0,
		width: 0,
		wmode: 0,
		wrap: 0,
		about: 0,
		accentHeight: 1,
		"accent-height": "accentHeight",
		accumulate: 0,
		additive: 0,
		alignmentBaseline: 1,
		"alignment-baseline": "alignmentBaseline",
		allowReorder: 1,
		alphabetic: 0,
		amplitude: 0,
		arabicForm: 1,
		"arabic-form": "arabicForm",
		ascent: 0,
		attributeName: 1,
		attributeType: 1,
		autoReverse: 1,
		azimuth: 0,
		baseFrequency: 1,
		baselineShift: 1,
		"baseline-shift": "baselineShift",
		baseProfile: 1,
		bbox: 0,
		begin: 0,
		bias: 0,
		by: 0,
		calcMode: 1,
		capHeight: 1,
		"cap-height": "capHeight",
		clip: 0,
		clipPath: 1,
		"clip-path": "clipPath",
		clipPathUnits: 1,
		clipRule: 1,
		"clip-rule": "clipRule",
		color: 0,
		colorInterpolation: 1,
		"color-interpolation": "colorInterpolation",
		colorInterpolationFilters: 1,
		"color-interpolation-filters": "colorInterpolationFilters",
		colorProfile: 1,
		"color-profile": "colorProfile",
		colorRendering: 1,
		"color-rendering": "colorRendering",
		contentScriptType: 1,
		contentStyleType: 1,
		cursor: 0,
		cx: 0,
		cy: 0,
		d: 0,
		datatype: 0,
		decelerate: 0,
		descent: 0,
		diffuseConstant: 1,
		direction: 0,
		display: 0,
		divisor: 0,
		dominantBaseline: 1,
		"dominant-baseline": "dominantBaseline",
		dur: 0,
		dx: 0,
		dy: 0,
		edgeMode: 1,
		elevation: 0,
		enableBackground: 1,
		"enable-background": "enableBackground",
		end: 0,
		exponent: 0,
		externalResourcesRequired: 1,
		fill: 0,
		fillOpacity: 1,
		"fill-opacity": "fillOpacity",
		fillRule: 1,
		"fill-rule": "fillRule",
		filter: 0,
		filterRes: 1,
		filterUnits: 1,
		floodOpacity: 1,
		"flood-opacity": "floodOpacity",
		floodColor: 1,
		"flood-color": "floodColor",
		focusable: 0,
		fontFamily: 1,
		"font-family": "fontFamily",
		fontSize: 1,
		"font-size": "fontSize",
		fontSizeAdjust: 1,
		"font-size-adjust": "fontSizeAdjust",
		fontStretch: 1,
		"font-stretch": "fontStretch",
		fontStyle: 1,
		"font-style": "fontStyle",
		fontVariant: 1,
		"font-variant": "fontVariant",
		fontWeight: 1,
		"font-weight": "fontWeight",
		format: 0,
		from: 0,
		fx: 0,
		fy: 0,
		g1: 0,
		g2: 0,
		glyphName: 1,
		"glyph-name": "glyphName",
		glyphOrientationHorizontal: 1,
		"glyph-orientation-horizontal": "glyphOrientationHorizontal",
		glyphOrientationVertical: 1,
		"glyph-orientation-vertical": "glyphOrientationVertical",
		glyphRef: 1,
		gradientTransform: 1,
		gradientUnits: 1,
		hanging: 0,
		horizAdvX: 1,
		"horiz-adv-x": "horizAdvX",
		horizOriginX: 1,
		"horiz-origin-x": "horizOriginX",
		ideographic: 0,
		imageRendering: 1,
		"image-rendering": "imageRendering",
		in2: 0,
		in: 0,
		inlist: 0,
		intercept: 0,
		k1: 0,
		k2: 0,
		k3: 0,
		k4: 0,
		k: 0,
		kernelMatrix: 1,
		kernelUnitLength: 1,
		kerning: 0,
		keyPoints: 1,
		keySplines: 1,
		keyTimes: 1,
		lengthAdjust: 1,
		letterSpacing: 1,
		"letter-spacing": "letterSpacing",
		lightingColor: 1,
		"lighting-color": "lightingColor",
		limitingConeAngle: 1,
		local: 0,
		markerEnd: 1,
		"marker-end": "markerEnd",
		markerHeight: 1,
		markerMid: 1,
		"marker-mid": "markerMid",
		markerStart: 1,
		"marker-start": "markerStart",
		markerUnits: 1,
		markerWidth: 1,
		mask: 0,
		maskContentUnits: 1,
		maskUnits: 1,
		mathematical: 0,
		mode: 0,
		numOctaves: 1,
		offset: 0,
		opacity: 0,
		operator: 0,
		order: 0,
		orient: 0,
		orientation: 0,
		origin: 0,
		overflow: 0,
		overlinePosition: 1,
		"overline-position": "overlinePosition",
		overlineThickness: 1,
		"overline-thickness": "overlineThickness",
		paintOrder: 1,
		"paint-order": "paintOrder",
		panose1: 0,
		"panose-1": "panose1",
		pathLength: 1,
		patternContentUnits: 1,
		patternTransform: 1,
		patternUnits: 1,
		pointerEvents: 1,
		"pointer-events": "pointerEvents",
		points: 0,
		pointsAtX: 1,
		pointsAtY: 1,
		pointsAtZ: 1,
		prefix: 0,
		preserveAlpha: 1,
		preserveAspectRatio: 1,
		primitiveUnits: 1,
		property: 0,
		r: 0,
		radius: 0,
		refX: 1,
		refY: 1,
		renderingIntent: 1,
		"rendering-intent": "renderingIntent",
		repeatCount: 1,
		repeatDur: 1,
		requiredExtensions: 1,
		requiredFeatures: 1,
		resource: 0,
		restart: 0,
		result: 0,
		results: 0,
		rotate: 0,
		rx: 0,
		ry: 0,
		scale: 0,
		security: 0,
		seed: 0,
		shapeRendering: 1,
		"shape-rendering": "shapeRendering",
		slope: 0,
		spacing: 0,
		specularConstant: 1,
		specularExponent: 1,
		speed: 0,
		spreadMethod: 1,
		startOffset: 1,
		stdDeviation: 1,
		stemh: 0,
		stemv: 0,
		stitchTiles: 1,
		stopColor: 1,
		"stop-color": "stopColor",
		stopOpacity: 1,
		"stop-opacity": "stopOpacity",
		strikethroughPosition: 1,
		"strikethrough-position": "strikethroughPosition",
		strikethroughThickness: 1,
		"strikethrough-thickness": "strikethroughThickness",
		string: 0,
		stroke: 0,
		strokeDasharray: 1,
		"stroke-dasharray": "strokeDasharray",
		strokeDashoffset: 1,
		"stroke-dashoffset": "strokeDashoffset",
		strokeLinecap: 1,
		"stroke-linecap": "strokeLinecap",
		strokeLinejoin: 1,
		"stroke-linejoin": "strokeLinejoin",
		strokeMiterlimit: 1,
		"stroke-miterlimit": "strokeMiterlimit",
		strokeWidth: 1,
		"stroke-width": "strokeWidth",
		strokeOpacity: 1,
		"stroke-opacity": "strokeOpacity",
		suppressContentEditableWarning: 1,
		suppressHydrationWarning: 1,
		surfaceScale: 1,
		systemLanguage: 1,
		tableValues: 1,
		targetX: 1,
		targetY: 1,
		textAnchor: 1,
		"text-anchor": "textAnchor",
		textDecoration: 1,
		"text-decoration": "textDecoration",
		textLength: 1,
		textRendering: 1,
		"text-rendering": "textRendering",
		to: 0,
		transform: 0,
		typeof: 0,
		u1: 0,
		u2: 0,
		underlinePosition: 1,
		"underline-position": "underlinePosition",
		underlineThickness: 1,
		"underline-thickness": "underlineThickness",
		unicode: 0,
		unicodeBidi: 1,
		"unicode-bidi": "unicodeBidi",
		unicodeRange: 1,
		"unicode-range": "unicodeRange",
		unitsPerEm: 1,
		"units-per-em": "unitsPerEm",
		unselectable: 0,
		vAlphabetic: 1,
		"v-alphabetic": "vAlphabetic",
		values: 0,
		vectorEffect: 1,
		"vector-effect": "vectorEffect",
		version: 0,
		vertAdvY: 1,
		"vert-adv-y": "vertAdvY",
		vertOriginX: 1,
		"vert-origin-x": "vertOriginX",
		vertOriginY: 1,
		"vert-origin-y": "vertOriginY",
		vHanging: 1,
		"v-hanging": "vHanging",
		vIdeographic: 1,
		"v-ideographic": "vIdeographic",
		viewBox: 1,
		viewTarget: 1,
		visibility: 0,
		vMathematical: 1,
		"v-mathematical": "vMathematical",
		vocab: 0,
		widths: 0,
		wordSpacing: 1,
		"word-spacing": "wordSpacing",
		writingMode: 1,
		"writing-mode": "writingMode",
		x1: 0,
		x2: 0,
		x: 0,
		xChannelSelector: 1,
		xHeight: 1,
		"x-height": "xHeight",
		xlinkActuate: 1,
		"xlink:actuate": "xlinkActuate",
		xlinkArcrole: 1,
		"xlink:arcrole": "xlinkArcrole",
		xlinkHref: 1,
		"xlink:href": "xlinkHref",
		xlinkRole: 1,
		"xlink:role": "xlinkRole",
		xlinkShow: 1,
		"xlink:show": "xlinkShow",
		xlinkTitle: 1,
		"xlink:title": "xlinkTitle",
		xlinkType: 1,
		"xlink:type": "xlinkType",
		xmlBase: 1,
		"xml:base": "xmlBase",
		xmlLang: 1,
		"xml:lang": "xmlLang",
		xmlns: 0,
		"xml:space": "xmlSpace",
		xmlnsXlink: 1,
		"xmlns:xlink": "xmlnsXlink",
		xmlSpace: 1,
		y1: 0,
		y2: 0,
		y: 0,
		yChannelSelector: 1,
		z: 0,
		zoomAndPan: 1
	};
}));

// node_modules/.store/react-property@2.0.2-Ud5KeAnfmYjAWwVn6x1ckQ/node_modules/react-property/lib/index.js
var require_lib$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) Facebook, Inc. and its affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*
	* 
	*/
	const RESERVED = 0;
	const STRING = 1;
	const BOOLEANISH_STRING = 2;
	const BOOLEAN = 3;
	const OVERLOADED_BOOLEAN = 4;
	const NUMERIC = 5;
	const POSITIVE_NUMERIC = 6;
	function getPropertyInfo(name) {
		return properties.hasOwnProperty(name) ? properties[name] : null;
	}
	function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace, sanitizeURL, removeEmptyString) {
		this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
		this.attributeName = attributeName;
		this.attributeNamespace = attributeNamespace;
		this.mustUseProperty = mustUseProperty;
		this.propertyName = name;
		this.type = type;
		this.sanitizeURL = sanitizeURL;
		this.removeEmptyString = removeEmptyString;
	}
	const properties = {};
	[
		"children",
		"dangerouslySetInnerHTML",
		"defaultValue",
		"defaultChecked",
		"innerHTML",
		"suppressContentEditableWarning",
		"suppressHydrationWarning",
		"style"
	].forEach((name) => {
		properties[name] = new PropertyInfoRecord(name, RESERVED, false, name, null, false, false);
	});
	[
		["acceptCharset", "accept-charset"],
		["className", "class"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"]
	].forEach(([name, attributeName]) => {
		properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, null, false, false);
	});
	[
		"contentEditable",
		"draggable",
		"spellCheck",
		"value"
	].forEach((name) => {
		properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, name.toLowerCase(), null, false, false);
	});
	[
		"autoReverse",
		"externalResourcesRequired",
		"focusable",
		"preserveAlpha"
	].forEach((name) => {
		properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, name, null, false, false);
	});
	[
		"allowFullScreen",
		"async",
		"autoFocus",
		"autoPlay",
		"controls",
		"default",
		"defer",
		"disabled",
		"disablePictureInPicture",
		"disableRemotePlayback",
		"formNoValidate",
		"hidden",
		"loop",
		"noModule",
		"noValidate",
		"open",
		"playsInline",
		"readOnly",
		"required",
		"reversed",
		"scoped",
		"seamless",
		"itemScope"
	].forEach((name) => {
		properties[name] = new PropertyInfoRecord(name, BOOLEAN, false, name.toLowerCase(), null, false, false);
	});
	[
		"checked",
		"multiple",
		"muted",
		"selected"
	].forEach((name) => {
		properties[name] = new PropertyInfoRecord(name, BOOLEAN, true, name, null, false, false);
	});
	["capture", "download"].forEach((name) => {
		properties[name] = new PropertyInfoRecord(name, OVERLOADED_BOOLEAN, false, name, null, false, false);
	});
	[
		"cols",
		"rows",
		"size",
		"span"
	].forEach((name) => {
		properties[name] = new PropertyInfoRecord(name, POSITIVE_NUMERIC, false, name, null, false, false);
	});
	["rowSpan", "start"].forEach((name) => {
		properties[name] = new PropertyInfoRecord(name, NUMERIC, false, name.toLowerCase(), null, false, false);
	});
	const CAMELIZE = /[\-\:]([a-z])/g;
	const capitalize = (token) => token[1].toUpperCase();
	[
		"accent-height",
		"alignment-baseline",
		"arabic-form",
		"baseline-shift",
		"cap-height",
		"clip-path",
		"clip-rule",
		"color-interpolation",
		"color-interpolation-filters",
		"color-profile",
		"color-rendering",
		"dominant-baseline",
		"enable-background",
		"fill-opacity",
		"fill-rule",
		"flood-color",
		"flood-opacity",
		"font-family",
		"font-size",
		"font-size-adjust",
		"font-stretch",
		"font-style",
		"font-variant",
		"font-weight",
		"glyph-name",
		"glyph-orientation-horizontal",
		"glyph-orientation-vertical",
		"horiz-adv-x",
		"horiz-origin-x",
		"image-rendering",
		"letter-spacing",
		"lighting-color",
		"marker-end",
		"marker-mid",
		"marker-start",
		"overline-position",
		"overline-thickness",
		"paint-order",
		"panose-1",
		"pointer-events",
		"rendering-intent",
		"shape-rendering",
		"stop-color",
		"stop-opacity",
		"strikethrough-position",
		"strikethrough-thickness",
		"stroke-dasharray",
		"stroke-dashoffset",
		"stroke-linecap",
		"stroke-linejoin",
		"stroke-miterlimit",
		"stroke-opacity",
		"stroke-width",
		"text-anchor",
		"text-decoration",
		"text-rendering",
		"underline-position",
		"underline-thickness",
		"unicode-bidi",
		"unicode-range",
		"units-per-em",
		"v-alphabetic",
		"v-hanging",
		"v-ideographic",
		"v-mathematical",
		"vector-effect",
		"vert-adv-y",
		"vert-origin-x",
		"vert-origin-y",
		"word-spacing",
		"writing-mode",
		"xmlns:xlink",
		"x-height"
	].forEach((attributeName) => {
		const name = attributeName.replace(CAMELIZE, capitalize);
		properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, null, false, false);
	});
	[
		"xlink:actuate",
		"xlink:arcrole",
		"xlink:role",
		"xlink:show",
		"xlink:title",
		"xlink:type"
	].forEach((attributeName) => {
		const name = attributeName.replace(CAMELIZE, capitalize);
		properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, "http://www.w3.org/1999/xlink", false, false);
	});
	[
		"xml:base",
		"xml:lang",
		"xml:space"
	].forEach((attributeName) => {
		const name = attributeName.replace(CAMELIZE, capitalize);
		properties[name] = new PropertyInfoRecord(name, STRING, false, attributeName, "http://www.w3.org/XML/1998/namespace", false, false);
	});
	["tabIndex", "crossOrigin"].forEach((attributeName) => {
		properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, attributeName.toLowerCase(), null, false, false);
	});
	const xlinkHref = "xlinkHref";
	properties[xlinkHref] = new PropertyInfoRecord("xlinkHref", STRING, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
	[
		"src",
		"href",
		"action",
		"formAction"
	].forEach((attributeName) => {
		properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, attributeName.toLowerCase(), null, true, true);
	});
	const { CAMELCASE, SAME, possibleStandardNames: possibleStandardNamesOptimized } = require_possibleStandardNamesOptimized();
	/**
	* Checks whether a property name is a custom attribute.
	*
	* @see https://github.com/facebook/react/blob/15-stable/src/renderers/dom/shared/HTMLDOMPropertyConfig.js#L23-L25
	*
	* @type {(attribute: string) => boolean}
	*/
	const isCustomAttribute = RegExp.prototype.test.bind(/* @__PURE__ */ new RegExp("^(data|aria)-[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"));
	/**
	* @type {Record<string, string>}
	*/
	const possibleStandardNames = Object.keys(possibleStandardNamesOptimized).reduce((accumulator, standardName) => {
		const propName = possibleStandardNamesOptimized[standardName];
		if (propName === SAME) accumulator[standardName] = standardName;
		else if (propName === CAMELCASE) accumulator[standardName.toLowerCase()] = standardName;
		else accumulator[standardName] = propName;
		return accumulator;
	}, {});
	exports.BOOLEAN = BOOLEAN;
	exports.BOOLEANISH_STRING = BOOLEANISH_STRING;
	exports.NUMERIC = NUMERIC;
	exports.OVERLOADED_BOOLEAN = OVERLOADED_BOOLEAN;
	exports.POSITIVE_NUMERIC = POSITIVE_NUMERIC;
	exports.RESERVED = RESERVED;
	exports.STRING = STRING;
	exports.getPropertyInfo = getPropertyInfo;
	exports.isCustomAttribute = isCustomAttribute;
	exports.possibleStandardNames = possibleStandardNames;
}));

// \0wp-global:react
var require__wp_global_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.React;
}));

// node_modules/.store/inline-style-parser@0.2.7-0pzZt5vIgRg_a5400vDBmA/node_modules/inline-style-parser/cjs/index.js
var require_cjs$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var COMMENT_REGEX = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
	var NEWLINE_REGEX = /\n/g;
	var WHITESPACE_REGEX = /^\s*/;
	var PROPERTY_REGEX = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/;
	var COLON_REGEX = /^:\s*/;
	var VALUE_REGEX = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/;
	var SEMICOLON_REGEX = /^[;\s]*/;
	var TRIM_REGEX = /^\s+|\s+$/g;
	var NEWLINE = "\n";
	var FORWARD_SLASH = "/";
	var ASTERISK = "*";
	var EMPTY_STRING = "";
	var TYPE_COMMENT = "comment";
	var TYPE_DECLARATION = "declaration";
	/**
	* @param {String} style
	* @param {Object} [options]
	* @return {Object[]}
	* @throws {TypeError}
	* @throws {Error}
	*/
	function index(style, options) {
		if (typeof style !== "string") throw new TypeError("First argument must be a string");
		if (!style) return [];
		options = options || {};
		/**
		* Positional.
		*/
		var lineno = 1;
		var column = 1;
		/**
		* Update lineno and column based on `str`.
		*
		* @param {String} str
		*/
		function updatePosition(str) {
			var lines = str.match(NEWLINE_REGEX);
			if (lines) lineno += lines.length;
			var i = str.lastIndexOf(NEWLINE);
			column = ~i ? str.length - i : column + str.length;
		}
		/**
		* Mark position and patch `node.position`.
		*
		* @return {Function}
		*/
		function position() {
			var start = {
				line: lineno,
				column
			};
			return function(node) {
				node.position = new Position(start);
				whitespace();
				return node;
			};
		}
		/**
		* Store position information for a node.
		*
		* @constructor
		* @property {Object} start
		* @property {Object} end
		* @property {undefined|String} source
		*/
		function Position(start) {
			this.start = start;
			this.end = {
				line: lineno,
				column
			};
			this.source = options.source;
		}
		/**
		* Non-enumerable source string.
		*/
		Position.prototype.content = style;
		/**
		* Error `msg`.
		*
		* @param {String} msg
		* @throws {Error}
		*/
		function error(msg) {
			var err = /* @__PURE__ */ new Error(options.source + ":" + lineno + ":" + column + ": " + msg);
			err.reason = msg;
			err.filename = options.source;
			err.line = lineno;
			err.column = column;
			err.source = style;
			if (options.silent);
			else throw err;
		}
		/**
		* Match `re` and return captures.
		*
		* @param {RegExp} re
		* @return {undefined|Array}
		*/
		function match(re) {
			var m = re.exec(style);
			if (!m) return;
			var str = m[0];
			updatePosition(str);
			style = style.slice(str.length);
			return m;
		}
		/**
		* Parse whitespace.
		*/
		function whitespace() {
			match(WHITESPACE_REGEX);
		}
		/**
		* Parse comments.
		*
		* @param {Object[]} [rules]
		* @return {Object[]}
		*/
		function comments(rules) {
			var c;
			rules = rules || [];
			while (c = comment()) if (c !== false) rules.push(c);
			return rules;
		}
		/**
		* Parse comment.
		*
		* @return {Object}
		* @throws {Error}
		*/
		function comment() {
			var pos = position();
			if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;
			var i = 2;
			while (EMPTY_STRING != style.charAt(i) && (ASTERISK != style.charAt(i) || FORWARD_SLASH != style.charAt(i + 1))) ++i;
			i += 2;
			if (EMPTY_STRING === style.charAt(i - 1)) return error("End of comment missing");
			var str = style.slice(2, i - 2);
			column += 2;
			updatePosition(str);
			style = style.slice(i);
			column += 2;
			return pos({
				type: TYPE_COMMENT,
				comment: str
			});
		}
		/**
		* Parse declaration.
		*
		* @return {Object}
		* @throws {Error}
		*/
		function declaration() {
			var pos = position();
			var prop = match(PROPERTY_REGEX);
			if (!prop) return;
			comment();
			if (!match(COLON_REGEX)) return error("property missing ':'");
			var val = match(VALUE_REGEX);
			var ret = pos({
				type: TYPE_DECLARATION,
				property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),
				value: val ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING)) : EMPTY_STRING
			});
			match(SEMICOLON_REGEX);
			return ret;
		}
		/**
		* Parse declarations.
		*
		* @return {Object[]}
		*/
		function declarations() {
			var decls = [];
			comments(decls);
			var decl;
			while (decl = declaration()) if (decl !== false) {
				decls.push(decl);
				comments(decls);
			}
			return decls;
		}
		whitespace();
		return declarations();
	}
	/**
	* Trim `str`.
	*
	* @param {String} str
	* @return {String}
	*/
	function trim(str) {
		return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;
	}
	module.exports = index;
}));

// node_modules/.store/style-to-object@1.0.14-_Cx3y5Jja6I2KyQ5HLMLIQ/node_modules/style-to-object/cjs/index.js
var require_cjs$1 = /* @__PURE__ */ __commonJSMin(((exports, module, this$5) => {
	var __importDefault = this$5 && this$5.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = StyleToObject;
	const inline_style_parser_1 = __importDefault(require_cjs$2());
	/**
	* Parses inline style to object.
	*
	* @param style - Inline style.
	* @param iterator - Iterator.
	* @returns - Style object or null.
	*
	* @example Parsing inline style to object:
	*
	* ```js
	* import parse from 'style-to-object';
	* parse('line-height: 42;'); // { 'line-height': '42' }
	* ```
	*/
	function StyleToObject(style, iterator) {
		let styleObject = null;
		if (!style || typeof style !== "string") return styleObject;
		const declarations = (0, inline_style_parser_1.default)(style);
		const hasIterator = typeof iterator === "function";
		declarations.forEach((declaration) => {
			if (declaration.type !== "declaration") return;
			const { property, value } = declaration;
			if (hasIterator) iterator(property, value, declaration);
			else if (value) {
				styleObject = styleObject || {};
				styleObject[property] = value;
			}
		});
		return styleObject;
	}
}));

// node_modules/.store/style-to-js@1.1.21-YWabfUQk6wCnqmIJu3Ly9Q/node_modules/style-to-js/cjs/utilities.js
var require_utilities$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.camelCase = void 0;
	var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
	var HYPHEN_REGEX = /-([a-z])/g;
	var NO_HYPHEN_REGEX = /^[^-]+$/;
	var VENDOR_PREFIX_REGEX = /^-(webkit|moz|ms|o|khtml)-/;
	var MS_VENDOR_PREFIX_REGEX = /^-(ms)-/;
	/**
	* Checks whether to skip camelCase.
	*/
	var skipCamelCase = function(property) {
		return !property || NO_HYPHEN_REGEX.test(property) || CUSTOM_PROPERTY_REGEX.test(property);
	};
	/**
	* Replacer that capitalizes first character.
	*/
	var capitalize = function(match, character) {
		return character.toUpperCase();
	};
	/**
	* Replacer that removes beginning hyphen of vendor prefix property.
	*/
	var trimHyphen = function(match, prefix) {
		return "".concat(prefix, "-");
	};
	/**
	* CamelCases a CSS property.
	*/
	var camelCase = function(property, options) {
		if (options === void 0) options = {};
		if (skipCamelCase(property)) return property;
		property = property.toLowerCase();
		if (options.reactCompat) property = property.replace(MS_VENDOR_PREFIX_REGEX, trimHyphen);
		else property = property.replace(VENDOR_PREFIX_REGEX, trimHyphen);
		return property.replace(HYPHEN_REGEX, capitalize);
	};
	exports.camelCase = camelCase;
}));

// node_modules/.store/style-to-js@1.1.21-YWabfUQk6wCnqmIJu3Ly9Q/node_modules/style-to-js/cjs/index.js
var require_cjs = /* @__PURE__ */ __commonJSMin(((exports, module, this$4) => {
	var style_to_object_1 = (this$4 && this$4.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	})(require_cjs$1());
	var utilities_1 = require_utilities$1();
	/**
	* Parses CSS inline style to JavaScript object (camelCased).
	*/
	function StyleToJS(style, options) {
		var output = {};
		if (!style || typeof style !== "string") return output;
		(0, style_to_object_1.default)(style, function(property, value) {
			if (property && value) output[(0, utilities_1.camelCase)(property, options)] = value;
		});
		return output;
	}
	StyleToJS.default = StyleToJS;
	module.exports = StyleToJS;
}));

// node_modules/.store/html-react-parser@5.2.11-8Ma2aKKhlE1mznzJC1qE_Q/node_modules/html-react-parser/lib/utilities.js
var require_utilities = /* @__PURE__ */ __commonJSMin(((exports, module, this$3) => {
	var __importDefault = this$3 && this$3.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.returnFirstArg = exports.canTextBeChildOfNode = exports.ELEMENTS_WITH_NO_TEXT_CHILDREN = exports.PRESERVE_CUSTOM_ATTRIBUTES = void 0;
	exports.isCustomComponent = isCustomComponent;
	exports.setStyleProp = setStyleProp;
	var react_1 = require__wp_global_react();
	var style_to_js_1 = __importDefault(require_cjs());
	var RESERVED_SVG_MATHML_ELEMENTS = /* @__PURE__ */ new Set([
		"annotation-xml",
		"color-profile",
		"font-face",
		"font-face-src",
		"font-face-uri",
		"font-face-format",
		"font-face-name",
		"missing-glyph"
	]);
	/**
	* Check if a tag is a custom component.
	*
	* @see {@link https://github.com/facebook/react/blob/v16.6.3/packages/react-dom/src/shared/isCustomComponent.js}
	*
	* @param tagName - Tag name.
	* @param props - Props passed to the element.
	* @returns - Whether the tag is custom component.
	*/
	function isCustomComponent(tagName, props) {
		if (!tagName.includes("-")) return Boolean(props && typeof props.is === "string");
		if (RESERVED_SVG_MATHML_ELEMENTS.has(tagName)) return false;
		return true;
	}
	var styleOptions = { reactCompat: true };
	/**
	* Sets style prop.
	*
	* @param style - Inline style.
	* @param props - Props object.
	*/
	function setStyleProp(style, props) {
		if (typeof style !== "string") return;
		if (!style.trim()) {
			props.style = {};
			return;
		}
		try {
			props.style = (0, style_to_js_1.default)(style, styleOptions);
		} catch (error) {
			props.style = {};
		}
	}
	/**
	* @see https://reactjs.org/blog/2017/09/08/dom-attributes-in-react-16.html
	*/
	exports.PRESERVE_CUSTOM_ATTRIBUTES = Number(react_1.version.split(".")[0]) >= 16;
	/**
	* @see https://github.com/facebook/react/blob/cae635054e17a6f107a39d328649137b83f25972/packages/react-dom/src/client/validateDOMNesting.js#L213
	*/
	exports.ELEMENTS_WITH_NO_TEXT_CHILDREN = /* @__PURE__ */ new Set([
		"tr",
		"tbody",
		"thead",
		"tfoot",
		"colgroup",
		"table",
		"head",
		"html",
		"frameset"
	]);
	/**
	* Checks if the given node can contain text nodes
	*
	* @param node - Element node.
	* @returns - Whether the node can contain text nodes.
	*/
	var canTextBeChildOfNode = function(node) {
		return !exports.ELEMENTS_WITH_NO_TEXT_CHILDREN.has(node.name);
	};
	exports.canTextBeChildOfNode = canTextBeChildOfNode;
	/**
	* Returns the first argument as is.
	*
	* @param arg - The argument to be returned.
	* @returns - The input argument `arg`.
	*/
	var returnFirstArg = function(arg) {
		return arg;
	};
	exports.returnFirstArg = returnFirstArg;
}));

// node_modules/.store/html-react-parser@5.2.11-8Ma2aKKhlE1mznzJC1qE_Q/node_modules/html-react-parser/lib/attributes-to-props.js
var require_attributes_to_props = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = attributesToProps;
	var react_property_1 = require_lib$1();
	var utilities_1 = require_utilities();
	var UNCONTROLLED_COMPONENT_ATTRIBUTES = ["checked", "value"];
	var UNCONTROLLED_COMPONENT_NAMES = [
		"input",
		"select",
		"textarea"
	];
	var valueOnlyInputs = {
		reset: true,
		submit: true
	};
	/**
	* Converts HTML/SVG DOM attributes to React props.
	*
	* @param attributes - HTML/SVG DOM attributes.
	* @param nodeName - DOM node name.
	* @returns - React props.
	*/
	function attributesToProps(attributes, nodeName) {
		if (attributes === void 0) attributes = {};
		var props = {};
		var isInputValueOnly = Boolean(attributes.type && valueOnlyInputs[attributes.type]);
		for (var attributeName in attributes) {
			var attributeValue = attributes[attributeName];
			if ((0, react_property_1.isCustomAttribute)(attributeName)) {
				props[attributeName] = attributeValue;
				continue;
			}
			var attributeNameLowerCased = attributeName.toLowerCase();
			var propName = getPropName(attributeNameLowerCased);
			if (propName) {
				var propertyInfo = (0, react_property_1.getPropertyInfo)(propName);
				if (UNCONTROLLED_COMPONENT_ATTRIBUTES.includes(propName) && UNCONTROLLED_COMPONENT_NAMES.includes(nodeName) && !isInputValueOnly) propName = getPropName("default" + attributeNameLowerCased);
				props[propName] = attributeValue;
				switch (propertyInfo && propertyInfo.type) {
					case react_property_1.BOOLEAN:
						props[propName] = true;
						break;
					case react_property_1.OVERLOADED_BOOLEAN: if (attributeValue === "") props[propName] = true;
				}
				continue;
			}
			if (utilities_1.PRESERVE_CUSTOM_ATTRIBUTES) props[attributeName] = attributeValue;
		}
		(0, utilities_1.setStyleProp)(attributes.style, props);
		return props;
	}
	/**
	* Gets prop name from lowercased attribute name.
	*
	* @param attributeName - Lowercased attribute name.
	* @returns - Prop name.
	*/
	function getPropName(attributeName) {
		return react_property_1.possibleStandardNames[attributeName];
	}
}));

// node_modules/.store/html-react-parser@5.2.11-8Ma2aKKhlE1mznzJC1qE_Q/node_modules/html-react-parser/lib/dom-to-react.js
var require_dom_to_react = /* @__PURE__ */ __commonJSMin(((exports, module, this$2) => {
	var __importDefault = this$2 && this$2.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = domToReact;
	var react_1 = require__wp_global_react();
	var attributes_to_props_1 = __importDefault(require_attributes_to_props());
	var utilities_1 = require_utilities();
	var React = {
		cloneElement: react_1.cloneElement,
		createElement: react_1.createElement,
		isValidElement: react_1.isValidElement
	};
	/**
	* Converts DOM nodes to JSX element(s).
	*
	* @param nodes - DOM nodes.
	* @param options - Options.
	* @returns - String or JSX element(s).
	*/
	function domToReact(nodes, options) {
		if (options === void 0) options = {};
		var reactElements = [];
		var hasReplace = typeof options.replace === "function";
		var transform = options.transform || utilities_1.returnFirstArg;
		var _a = options.library || React, cloneElement = _a.cloneElement, createElement = _a.createElement, isValidElement = _a.isValidElement;
		var nodesLength = nodes.length;
		for (var index = 0; index < nodesLength; index++) {
			var node = nodes[index];
			if (hasReplace) {
				var replaceElement = options.replace(node, index);
				if (isValidElement(replaceElement)) {
					if (nodesLength > 1) replaceElement = cloneElement(replaceElement, { key: replaceElement.key || index });
					reactElements.push(transform(replaceElement, node, index));
					continue;
				}
			}
			if (node.type === "text") {
				var isWhitespace = !node.data.trim().length;
				if (isWhitespace && node.parent && !(0, utilities_1.canTextBeChildOfNode)(node.parent)) continue;
				if (options.trim && isWhitespace) continue;
				reactElements.push(transform(node.data, node, index));
				continue;
			}
			var element = node;
			var props = {};
			if (skipAttributesToProps(element)) {
				(0, utilities_1.setStyleProp)(element.attribs.style, element.attribs);
				props = element.attribs;
			} else if (element.attribs) props = (0, attributes_to_props_1.default)(element.attribs, element.name);
			var children = void 0;
			switch (node.type) {
				case "script":
				case "style":
					if (node.children[0]) props.dangerouslySetInnerHTML = { __html: node.children[0].data };
					break;
				case "tag":
					if (node.name === "textarea" && node.children[0]) props.defaultValue = node.children[0].data;
					else if (node.children && node.children.length) children = domToReact(node.children, options);
					break;
				default: continue;
			}
			if (nodesLength > 1) props.key = index;
			reactElements.push(transform(createElement(node.name, props, children), node, index));
		}
		return reactElements.length === 1 ? reactElements[0] : reactElements;
	}
	/**
	* Determines whether DOM element attributes should be transformed to props.
	* Web Components should not have their attributes transformed except for `style`.
	*
	* @param node - Element node.
	* @returns - Whether the node attributes should be converted to props.
	*/
	function skipAttributesToProps(node) {
		return utilities_1.PRESERVE_CUSTOM_ATTRIBUTES && node.type === "tag" && (0, utilities_1.isCustomComponent)(node.name, node.attribs);
	}
}));

// node_modules/.store/html-react-parser@5.2.11-8Ma2aKKhlE1mznzJC1qE_Q/node_modules/html-react-parser/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports, module, this$1) => {
	var __importDefault = this$1 && this$1.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.htmlToDOM = exports.domToReact = exports.attributesToProps = exports.Text = exports.ProcessingInstruction = exports.Element = exports.Comment = void 0;
	exports.default = HTMLReactParser;
	var html_dom_parser_1 = __importDefault(require_html_to_dom());
	exports.htmlToDOM = html_dom_parser_1.default;
	var attributes_to_props_1 = __importDefault(require_attributes_to_props());
	exports.attributesToProps = attributes_to_props_1.default;
	var dom_to_react_1 = __importDefault(require_dom_to_react());
	exports.domToReact = dom_to_react_1.default;
	var domhandler_1 = require_lib$2();
	Object.defineProperty(exports, "Comment", {
		enumerable: true,
		get: function() {
			return domhandler_1.Comment;
		}
	});
	Object.defineProperty(exports, "Element", {
		enumerable: true,
		get: function() {
			return domhandler_1.Element;
		}
	});
	Object.defineProperty(exports, "ProcessingInstruction", {
		enumerable: true,
		get: function() {
			return domhandler_1.ProcessingInstruction;
		}
	});
	Object.defineProperty(exports, "Text", {
		enumerable: true,
		get: function() {
			return domhandler_1.Text;
		}
	});
	var domParserOptions = { lowerCaseAttributeNames: false };
	/**
	* Converts HTML string to React elements.
	*
	* @param html - HTML string.
	* @param options - Parser options.
	* @returns - React element(s), empty array, or string.
	*/
	function HTMLReactParser(html, options) {
		if (typeof html !== "string") throw new TypeError("First argument must be a string");
		if (!html) return [];
		return (0, dom_to_react_1.default)((0, html_dom_parser_1.default)(html, (options === null || options === void 0 ? void 0 : options.htmlparser2) || domParserOptions), options);
	}
}));

// node_modules/.store/html-react-parser@5.2.11-8Ma2aKKhlE1mznzJC1qE_Q/node_modules/html-react-parser/esm/index.mjs
var import_data = require_data();
var import_core_data = require_core_data();
var import_i18n = require_i18n();
var import_lib = /* @__PURE__ */ __toESM(require_lib(), 1);
var esm_default = import_lib.default.default || import_lib.default;

// \0wp-global:@wordpress/dom
var require_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.dom;
}));

// \0wp-global:@wordpress/element
var require_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.element;
}));

// packages/dashboard-init/build-module/icons/index.mjs
var import_dom = require_dom();
var import_element = require_element();
/**
* Registers the dashboard's icon resolver: references resolve against
* the `icon` entity, and the record's SVG content becomes the element.
*/
function registerDashboardIconResolver() {
	registerIconResolver(async (reference) => {
		const record = await (0, import_data.resolveSelect)(import_core_data.store).getEntityRecord("root", "icon", reference);
		if (!record?.content) return null;
		const parsed = esm_default((0, import_dom.safeHTML)(record.content.trim()));
		const found = Array.isArray(parsed) ? parsed.find(import_element.isValidElement) : parsed;
		if (!(0, import_element.isValidElement)(found)) return null;
		const element = found;
		return element.props.fill ? element : (0, import_element.cloneElement)(element, { fill: "currentColor" });
	});
}

// packages/dashboard-init/build-module/index.mjs
/**
* Register the widget-modules discovery entity and the icon resolver
* before the dashboard renders, so the stage's `getEntityRecords` read
* resolves and feeds the records to `useWidgetTypes`.
*
* This function is mandatory - all init modules must export 'init'.
*/
async function init() {
	if ((0, import_data.select)(import_core_data.store).getEntityConfig("root", "widgetModule")) return;
	registerDashboardIconResolver();
	(0, import_data.dispatch)(import_core_data.store).addEntities([{
		name: "widgetModule",
		kind: "root",
		key: "name",
		baseURL: "/wp/v2/widget-modules",
		plural: "widgetModules",
		label: (0, import_i18n.__)("Widget modules"),
		supportsPagination: false
	}]);
}

export { init };
//# sourceMappingURL=index.js.map