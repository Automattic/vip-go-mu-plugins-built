(function(_wordpress_element, _wordpress_i18n, _wordpress_components, _wordpress_compose, _wordpress_api_fetch, react_jsx_runtime, _wordpress_blob) {

"use strict";
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

_wordpress_api_fetch = __toESM(_wordpress_api_fetch, 1);

// packages/list-reusable-blocks/build-module/utils/file.mjs
/**
	* Reads the textual content of the given file.
	*
	* @param file - File to read
	* @return Promise that resolves to the content of the file
	*/
	function readTextFile(file) {
		const reader = new window.FileReader();
		return new Promise((resolve) => {
			reader.onload = () => {
				resolve(reader.result);
			};
			reader.readAsText(file);
		});
	}

// packages/list-reusable-blocks/build-module/utils/import.mjs
/**
	* Import a reusable block from a JSON file.
	*
	* @param file - File to import
	* @return Promise returning the imported reusable block
	*/
	async function importReusableBlock(file) {
		const fileContent = await readTextFile(file);
		let parsedContent;
		try {
			parsedContent = JSON.parse(fileContent);
		} catch {
			throw new Error("Invalid JSON file");
		}
		if (parsedContent.__file !== "wp_block" || !parsedContent.title || !parsedContent.content || typeof parsedContent.title !== "string" || typeof parsedContent.content !== "string" || parsedContent.syncStatus && typeof parsedContent.syncStatus !== "string") throw new Error("Invalid pattern JSON file");
		const postType = await (0, _wordpress_api_fetch.default)({ path: `/wp/v2/types/wp_block` });
		return await (0, _wordpress_api_fetch.default)({
			path: `/wp/v2/${postType.rest_base}`,
			data: {
				title: parsedContent.title,
				content: parsedContent.content,
				status: "publish",
				meta: parsedContent.syncStatus === "unsynced" ? { wp_pattern_sync_status: parsedContent.syncStatus } : void 0
			},
			method: "POST"
		});
	}

// packages/list-reusable-blocks/build-module/components/import-form/index.mjs
	function ImportForm({ instanceId, onUpload }) {
		const inputId = "list-reusable-blocks-import-form-" + instanceId;
		const formRef = (0, _wordpress_element.useRef)(null);
		const [isLoading, setIsLoading] = (0, _wordpress_element.useState)(false);
		const [error, setError] = (0, _wordpress_element.useState)(null);
		const [file, setFile] = (0, _wordpress_element.useState)(null);
		const onChangeFile = (event) => {
			setFile(event.target.files?.[0] || null);
			setError(null);
		};
		const onSubmit = (event) => {
			event.preventDefault();
			if (!file) return;
			setIsLoading(true);
			importReusableBlock(file).then((reusableBlock) => {
				if (!formRef.current) return;
				setIsLoading(false);
				onUpload(reusableBlock);
			}).catch((errors) => {
				if (!formRef.current) return;
				let uiMessage;
				switch (errors.message) {
					case "Invalid JSON file":
						uiMessage = (0, _wordpress_i18n.__)("Invalid JSON file");
						break;
					case "Invalid pattern JSON file":
						uiMessage = (0, _wordpress_i18n.__)("Invalid pattern JSON file");
						break;
					default: uiMessage = (0, _wordpress_i18n.__)("Unknown error");
				}
				setIsLoading(false);
				setError(uiMessage);
			});
		};
		const onDismissError = () => {
			setError(null);
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			className: "list-reusable-blocks-import-form",
			onSubmit,
			ref: formRef,
			children: [
				error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Notice, {
					status: "error",
					onRemove: () => onDismissError(),
					children: error
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
					htmlFor: inputId,
					className: "list-reusable-blocks-import-form__label",
					children: (0, _wordpress_i18n.__)("File")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					id: inputId,
					type: "file",
					onChange: onChangeFile
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
					__next40pxDefaultSize: true,
					type: "submit",
					isBusy: isLoading,
					accessibleWhenDisabled: true,
					disabled: !file || isLoading,
					variant: "secondary",
					className: "list-reusable-blocks-import-form__button",
					children: (0, _wordpress_i18n._x)("Import", "button label")
				})
			]
		});
	}
	var import_form_default = (0, _wordpress_compose.withInstanceId)(ImportForm);

// packages/list-reusable-blocks/build-module/components/import-dropdown/index.mjs
	function ImportDropdown({ onUpload }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Dropdown, {
			popoverProps: { placement: "bottom-start" },
			contentClassName: "list-reusable-blocks-import-dropdown__content",
			renderToggle: ({ isOpen, onToggle }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Button, {
				size: "compact",
				className: "list-reusable-blocks-import-dropdown__button",
				"aria-expanded": isOpen,
				onClick: onToggle,
				variant: "primary",
				children: (0, _wordpress_i18n.__)("Import from JSON")
			}),
			renderContent: ({ onClose }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(import_form_default, { onUpload: (0, _wordpress_compose.pipe)(onClose, onUpload) })
		});
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

// node_modules/.store/remove-accents@0.5.0-S_lnImruWgc6kBSjIJlPgw/node_modules/remove-accents/index.js
	var require_remove_accents = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		var characterMap = {
			"À": "A",
			"Á": "A",
			"Â": "A",
			"Ã": "A",
			"Ä": "A",
			"Å": "A",
			"Ấ": "A",
			"Ắ": "A",
			"Ẳ": "A",
			"Ẵ": "A",
			"Ặ": "A",
			"Æ": "AE",
			"Ầ": "A",
			"Ằ": "A",
			"Ȃ": "A",
			"Ả": "A",
			"Ạ": "A",
			"Ẩ": "A",
			"Ẫ": "A",
			"Ậ": "A",
			"Ç": "C",
			"Ḉ": "C",
			"È": "E",
			"É": "E",
			"Ê": "E",
			"Ë": "E",
			"Ế": "E",
			"Ḗ": "E",
			"Ề": "E",
			"Ḕ": "E",
			"Ḝ": "E",
			"Ȇ": "E",
			"Ẻ": "E",
			"Ẽ": "E",
			"Ẹ": "E",
			"Ể": "E",
			"Ễ": "E",
			"Ệ": "E",
			"Ì": "I",
			"Í": "I",
			"Î": "I",
			"Ï": "I",
			"Ḯ": "I",
			"Ȋ": "I",
			"Ỉ": "I",
			"Ị": "I",
			"Ð": "D",
			"Ñ": "N",
			"Ò": "O",
			"Ó": "O",
			"Ô": "O",
			"Õ": "O",
			"Ö": "O",
			"Ø": "O",
			"Ố": "O",
			"Ṍ": "O",
			"Ṓ": "O",
			"Ȏ": "O",
			"Ỏ": "O",
			"Ọ": "O",
			"Ổ": "O",
			"Ỗ": "O",
			"Ộ": "O",
			"Ờ": "O",
			"Ở": "O",
			"Ỡ": "O",
			"Ớ": "O",
			"Ợ": "O",
			"Ù": "U",
			"Ú": "U",
			"Û": "U",
			"Ü": "U",
			"Ủ": "U",
			"Ụ": "U",
			"Ử": "U",
			"Ữ": "U",
			"Ự": "U",
			"Ý": "Y",
			"à": "a",
			"á": "a",
			"â": "a",
			"ã": "a",
			"ä": "a",
			"å": "a",
			"ấ": "a",
			"ắ": "a",
			"ẳ": "a",
			"ẵ": "a",
			"ặ": "a",
			"æ": "ae",
			"ầ": "a",
			"ằ": "a",
			"ȃ": "a",
			"ả": "a",
			"ạ": "a",
			"ẩ": "a",
			"ẫ": "a",
			"ậ": "a",
			"ç": "c",
			"ḉ": "c",
			"è": "e",
			"é": "e",
			"ê": "e",
			"ë": "e",
			"ế": "e",
			"ḗ": "e",
			"ề": "e",
			"ḕ": "e",
			"ḝ": "e",
			"ȇ": "e",
			"ẻ": "e",
			"ẽ": "e",
			"ẹ": "e",
			"ể": "e",
			"ễ": "e",
			"ệ": "e",
			"ì": "i",
			"í": "i",
			"î": "i",
			"ï": "i",
			"ḯ": "i",
			"ȋ": "i",
			"ỉ": "i",
			"ị": "i",
			"ð": "d",
			"ñ": "n",
			"ò": "o",
			"ó": "o",
			"ô": "o",
			"õ": "o",
			"ö": "o",
			"ø": "o",
			"ố": "o",
			"ṍ": "o",
			"ṓ": "o",
			"ȏ": "o",
			"ỏ": "o",
			"ọ": "o",
			"ổ": "o",
			"ỗ": "o",
			"ộ": "o",
			"ờ": "o",
			"ở": "o",
			"ỡ": "o",
			"ớ": "o",
			"ợ": "o",
			"ù": "u",
			"ú": "u",
			"û": "u",
			"ü": "u",
			"ủ": "u",
			"ụ": "u",
			"ử": "u",
			"ữ": "u",
			"ự": "u",
			"ý": "y",
			"ÿ": "y",
			"Ā": "A",
			"ā": "a",
			"Ă": "A",
			"ă": "a",
			"Ą": "A",
			"ą": "a",
			"Ć": "C",
			"ć": "c",
			"Ĉ": "C",
			"ĉ": "c",
			"Ċ": "C",
			"ċ": "c",
			"Č": "C",
			"č": "c",
			"C̆": "C",
			"c̆": "c",
			"Ď": "D",
			"ď": "d",
			"Đ": "D",
			"đ": "d",
			"Ē": "E",
			"ē": "e",
			"Ĕ": "E",
			"ĕ": "e",
			"Ė": "E",
			"ė": "e",
			"Ę": "E",
			"ę": "e",
			"Ě": "E",
			"ě": "e",
			"Ĝ": "G",
			"Ǵ": "G",
			"ĝ": "g",
			"ǵ": "g",
			"Ğ": "G",
			"ğ": "g",
			"Ġ": "G",
			"ġ": "g",
			"Ģ": "G",
			"ģ": "g",
			"Ĥ": "H",
			"ĥ": "h",
			"Ħ": "H",
			"ħ": "h",
			"Ḫ": "H",
			"ḫ": "h",
			"Ĩ": "I",
			"ĩ": "i",
			"Ī": "I",
			"ī": "i",
			"Ĭ": "I",
			"ĭ": "i",
			"Į": "I",
			"į": "i",
			"İ": "I",
			"ı": "i",
			"Ĳ": "IJ",
			"ĳ": "ij",
			"Ĵ": "J",
			"ĵ": "j",
			"Ķ": "K",
			"ķ": "k",
			"Ḱ": "K",
			"ḱ": "k",
			"K̆": "K",
			"k̆": "k",
			"Ĺ": "L",
			"ĺ": "l",
			"Ļ": "L",
			"ļ": "l",
			"Ľ": "L",
			"ľ": "l",
			"Ŀ": "L",
			"ŀ": "l",
			"Ł": "l",
			"ł": "l",
			"Ḿ": "M",
			"ḿ": "m",
			"M̆": "M",
			"m̆": "m",
			"Ń": "N",
			"ń": "n",
			"Ņ": "N",
			"ņ": "n",
			"Ň": "N",
			"ň": "n",
			"ŉ": "n",
			"N̆": "N",
			"n̆": "n",
			"Ō": "O",
			"ō": "o",
			"Ŏ": "O",
			"ŏ": "o",
			"Ő": "O",
			"ő": "o",
			"Œ": "OE",
			"œ": "oe",
			"P̆": "P",
			"p̆": "p",
			"Ŕ": "R",
			"ŕ": "r",
			"Ŗ": "R",
			"ŗ": "r",
			"Ř": "R",
			"ř": "r",
			"R̆": "R",
			"r̆": "r",
			"Ȓ": "R",
			"ȓ": "r",
			"Ś": "S",
			"ś": "s",
			"Ŝ": "S",
			"ŝ": "s",
			"Ş": "S",
			"Ș": "S",
			"ș": "s",
			"ş": "s",
			"Š": "S",
			"š": "s",
			"Ţ": "T",
			"ţ": "t",
			"ț": "t",
			"Ț": "T",
			"Ť": "T",
			"ť": "t",
			"Ŧ": "T",
			"ŧ": "t",
			"T̆": "T",
			"t̆": "t",
			"Ũ": "U",
			"ũ": "u",
			"Ū": "U",
			"ū": "u",
			"Ŭ": "U",
			"ŭ": "u",
			"Ů": "U",
			"ů": "u",
			"Ű": "U",
			"ű": "u",
			"Ų": "U",
			"ų": "u",
			"Ȗ": "U",
			"ȗ": "u",
			"V̆": "V",
			"v̆": "v",
			"Ŵ": "W",
			"ŵ": "w",
			"Ẃ": "W",
			"ẃ": "w",
			"X̆": "X",
			"x̆": "x",
			"Ŷ": "Y",
			"ŷ": "y",
			"Ÿ": "Y",
			"Y̆": "Y",
			"y̆": "y",
			"Ź": "Z",
			"ź": "z",
			"Ż": "Z",
			"ż": "z",
			"Ž": "Z",
			"ž": "z",
			"ſ": "s",
			"ƒ": "f",
			"Ơ": "O",
			"ơ": "o",
			"Ư": "U",
			"ư": "u",
			"Ǎ": "A",
			"ǎ": "a",
			"Ǐ": "I",
			"ǐ": "i",
			"Ǒ": "O",
			"ǒ": "o",
			"Ǔ": "U",
			"ǔ": "u",
			"Ǖ": "U",
			"ǖ": "u",
			"Ǘ": "U",
			"ǘ": "u",
			"Ǚ": "U",
			"ǚ": "u",
			"Ǜ": "U",
			"ǜ": "u",
			"Ứ": "U",
			"ứ": "u",
			"Ṹ": "U",
			"ṹ": "u",
			"Ǻ": "A",
			"ǻ": "a",
			"Ǽ": "AE",
			"ǽ": "ae",
			"Ǿ": "O",
			"ǿ": "o",
			"Þ": "TH",
			"þ": "th",
			"Ṕ": "P",
			"ṕ": "p",
			"Ṥ": "S",
			"ṥ": "s",
			"X́": "X",
			"x́": "x",
			"Ѓ": "Г",
			"ѓ": "г",
			"Ќ": "К",
			"ќ": "к",
			"A̋": "A",
			"a̋": "a",
			"E̋": "E",
			"e̋": "e",
			"I̋": "I",
			"i̋": "i",
			"Ǹ": "N",
			"ǹ": "n",
			"Ồ": "O",
			"ồ": "o",
			"Ṑ": "O",
			"ṑ": "o",
			"Ừ": "U",
			"ừ": "u",
			"Ẁ": "W",
			"ẁ": "w",
			"Ỳ": "Y",
			"ỳ": "y",
			"Ȁ": "A",
			"ȁ": "a",
			"Ȅ": "E",
			"ȅ": "e",
			"Ȉ": "I",
			"ȉ": "i",
			"Ȍ": "O",
			"ȍ": "o",
			"Ȑ": "R",
			"ȑ": "r",
			"Ȕ": "U",
			"ȕ": "u",
			"B̌": "B",
			"b̌": "b",
			"Č̣": "C",
			"č̣": "c",
			"Ê̌": "E",
			"ê̌": "e",
			"F̌": "F",
			"f̌": "f",
			"Ǧ": "G",
			"ǧ": "g",
			"Ȟ": "H",
			"ȟ": "h",
			"J̌": "J",
			"ǰ": "j",
			"Ǩ": "K",
			"ǩ": "k",
			"M̌": "M",
			"m̌": "m",
			"P̌": "P",
			"p̌": "p",
			"Q̌": "Q",
			"q̌": "q",
			"Ř̩": "R",
			"ř̩": "r",
			"Ṧ": "S",
			"ṧ": "s",
			"V̌": "V",
			"v̌": "v",
			"W̌": "W",
			"w̌": "w",
			"X̌": "X",
			"x̌": "x",
			"Y̌": "Y",
			"y̌": "y",
			"A̧": "A",
			"a̧": "a",
			"B̧": "B",
			"b̧": "b",
			"Ḑ": "D",
			"ḑ": "d",
			"Ȩ": "E",
			"ȩ": "e",
			"Ɛ̧": "E",
			"ɛ̧": "e",
			"Ḩ": "H",
			"ḩ": "h",
			"I̧": "I",
			"i̧": "i",
			"Ɨ̧": "I",
			"ɨ̧": "i",
			"M̧": "M",
			"m̧": "m",
			"O̧": "O",
			"o̧": "o",
			"Q̧": "Q",
			"q̧": "q",
			"U̧": "U",
			"u̧": "u",
			"X̧": "X",
			"x̧": "x",
			"Z̧": "Z",
			"z̧": "z",
			"й": "и",
			"Й": "И",
			"ё": "е",
			"Ё": "Е"
		};
		var chars = Object.keys(characterMap).join("|");
		var allAccents = new RegExp(chars, "g");
		var firstAccent = new RegExp(chars, "");
		function matcher(match) {
			return characterMap[match];
		}
		var removeAccents = function(string) {
			return string.replace(allAccents, matcher);
		};
		var hasAccents = function(string) {
			return !!string.match(firstAccent);
		};
		module.exports = removeAccents;
		module.exports.has = hasAccents;
		module.exports.remove = removeAccents;
	}));

// packages/list-reusable-blocks/build-module/utils/export.mjs
	var import_remove_accents = /* @__PURE__ */ __toESM(require_remove_accents(), 1);
	/**
	* Export a reusable block as a JSON file.
	*
	* @param id - The ID of the reusable block to export
	*/
	async function exportReusableBlock(id) {
		const postType = await (0, _wordpress_api_fetch.default)({ path: `/wp/v2/types/wp_block` });
		const post = await (0, _wordpress_api_fetch.default)({ path: `/wp/v2/${postType.rest_base}/${id}?context=edit` });
		const title = post.title.raw;
		const content = post.content.raw;
		const syncStatus = post.wp_pattern_sync_status;
		const fileContent = JSON.stringify({
			__file: "wp_block",
			title,
			content,
			syncStatus
		}, null, 2);
		const fileName = paramCase((0, import_remove_accents.default)(title)) + ".json";
		(0, _wordpress_blob.downloadBlob)(fileName, fileContent, "application/json");
	}

// packages/list-reusable-blocks/build-module/index.mjs
	document.body.addEventListener("click", (event) => {
		const target = event.target;
		if (!target.classList.contains("wp-list-reusable-blocks__export")) return;
		event.preventDefault();
		const blockId = target.dataset.id;
		if (blockId) exportReusableBlock(Number(blockId));
	});
	document.addEventListener("DOMContentLoaded", () => {
		const button = document.querySelector(".page-title-action");
		if (!button) return;
		const showNotice = () => {
			const notice = document.createElement("div");
			notice.className = "notice notice-success is-dismissible";
			notice.innerHTML = `<p>${(0, _wordpress_i18n.__)("Pattern imported successfully!")}</p>`;
			const headerEnd = document.querySelector(".wp-header-end");
			if (!headerEnd || !headerEnd.parentNode) return;
			headerEnd.parentNode.insertBefore(notice, headerEnd);
		};
		const container = document.createElement("div");
		container.className = "list-reusable-blocks__container";
		if (!button.parentNode) return;
		button.parentNode.insertBefore(container, button);
		(0, _wordpress_element.createRoot)(container).render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_element.StrictMode, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImportDropdown, { onUpload: showNotice }) }));
	});

(window.wp ||= {}).listReusableBlocks = undefined;
})(window.wp.element, window.wp.i18n, window.wp.components, window.wp.compose, window.wp.apiFetch, window.ReactJSXRuntime, window.wp.blob);
//# sourceMappingURL=index.js.map