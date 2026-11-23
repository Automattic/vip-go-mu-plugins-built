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

// \0wp-global:@wordpress/i18n
var require_i18n = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.i18n;
}));

// \0wp-global:@wordpress/patterns
var require_patterns = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.patterns;
}));

// \0wp-global:@wordpress/private-apis
var require_private_apis = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.privateApis;
}));

// packages/core-actions/build-module/lock-unlock.mjs
var import_i18n = require_i18n();
var import_patterns = require_patterns();
var import_private_apis = require_private_apis();
const { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/core-actions");

// \0wp-global:react/jsx-runtime
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.ReactJSXRuntime;
}));

// packages/core-actions/build-module/wp_block/duplicate-pattern/action.mjs
var import_jsx_runtime = require_jsx_runtime();
const { CreatePatternModalContents, useDuplicatePatternProps } = unlock(import_patterns.privateApis);
const duplicatePattern = {
	isEligible: (item) => item.type !== "wp_template_part",
	RenderModal: ({ items, closeModal }) => {
		const [item] = items;
		const duplicatedProps = useDuplicatePatternProps({
			pattern: item,
			onSuccess: () => closeModal?.()
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePatternModalContents, {
			onClose: closeModal,
			confirmLabel: (0, import_i18n._x)("Duplicate", "action label"),
			...duplicatedProps
		});
	}
};

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

// node_modules/.store/client-zip@2.4.5-5vcV2f6Upgr_SIgmkeGQpA/node_modules/client-zip/index.js
"stream" in Blob.prototype || Object.defineProperty(Blob.prototype, "stream", { value() {
	return new Response(this).body;
} }), "setBigUint64" in DataView.prototype || Object.defineProperty(DataView.prototype, "setBigUint64", { value(e, n, t) {
	const i = Number(4294967295n & n), r = Number(n >> 32n);
	this.setUint32(e + (t ? 0 : 4), i, t), this.setUint32(e + (t ? 4 : 0), r, t);
} });
var e = (e) => new DataView(new ArrayBuffer(e));
var n = (e) => new Uint8Array(e.buffer || e);
var t = (e) => new TextEncoder().encode(String(e));
var i = (e) => Math.min(4294967295, Number(e));
var r = (e) => Math.min(65535, Number(e));
function f(e, i) {
	if (void 0 === i || i instanceof Date || (i = new Date(i)), e instanceof File) return {
		isFile: 1,
		t: i || new Date(e.lastModified),
		i: e.stream()
	};
	if (e instanceof Response) return {
		isFile: 1,
		t: i || new Date(e.headers.get("Last-Modified") || Date.now()),
		i: e.body
	};
	if (void 0 === i) i = /* @__PURE__ */ new Date();
	else if (isNaN(i)) throw new Error("Invalid modification date.");
	if (void 0 === e) return {
		isFile: 0,
		t: i
	};
	if ("string" == typeof e) return {
		isFile: 1,
		t: i,
		i: t(e)
	};
	if (e instanceof Blob) return {
		isFile: 1,
		t: i,
		i: e.stream()
	};
	if (e instanceof Uint8Array || e instanceof ReadableStream) return {
		isFile: 1,
		t: i,
		i: e
	};
	if (e instanceof ArrayBuffer || ArrayBuffer.isView(e)) return {
		isFile: 1,
		t: i,
		i: n(e)
	};
	if (Symbol.asyncIterator in e) return {
		isFile: 1,
		t: i,
		i: o(e[Symbol.asyncIterator]())
	};
	throw new TypeError("Unsupported input format.");
}
function o(e, n = e) {
	return new ReadableStream({
		async pull(n) {
			let t = 0;
			for (; n.desiredSize > t;) {
				const i = await e.next();
				if (!i.value) {
					n.close();
					break;
				}
				{
					const e = a(i.value);
					n.enqueue(e), t += e.byteLength;
				}
			}
		},
		cancel(e) {
			n.throw?.(e);
		}
	});
}
function a(e) {
	return "string" == typeof e ? t(e) : e instanceof Uint8Array ? e : n(e);
}
function s(e, i, r) {
	let [f, o] = function(e) {
		return e ? e instanceof Uint8Array ? [e, 1] : ArrayBuffer.isView(e) || e instanceof ArrayBuffer ? [n(e), 1] : [t(e), 0] : [void 0, 0];
	}(i);
	if (e instanceof File) return {
		o: d(f || t(e.name)),
		u: BigInt(e.size),
		l: o
	};
	if (e instanceof Response) {
		const n = e.headers.get("content-disposition"), i = n && n.match(/;\s*filename\*?=["']?(.*?)["']?$/i), a = i && i[1] || e.url && new URL(e.url).pathname.split("/").findLast(Boolean), s = a && decodeURIComponent(a), u = r || +e.headers.get("content-length");
		return {
			o: d(f || t(s)),
			u: BigInt(u),
			l: o
		};
	}
	return f = d(f, void 0 !== e || void 0 !== r), "string" == typeof e ? {
		o: f,
		u: BigInt(t(e).length),
		l: o
	} : e instanceof Blob ? {
		o: f,
		u: BigInt(e.size),
		l: o
	} : e instanceof ArrayBuffer || ArrayBuffer.isView(e) ? {
		o: f,
		u: BigInt(e.byteLength),
		l: o
	} : {
		o: f,
		u: u(e, r),
		l: o
	};
}
function u(e, n) {
	return n > -1 ? BigInt(n) : e ? void 0 : 0n;
}
function d(e, n = 1) {
	if (!e || e.every(((c) => 47 === c))) throw new Error("The file must have a name.");
	if (n) for (; 47 === e[e.length - 1];) e = e.subarray(0, -1);
	else 47 !== e[e.length - 1] && (e = new Uint8Array([...e, 47]));
	return e;
}
var l = /* @__PURE__ */ new Uint32Array(256);
for (let e = 0; e < 256; ++e) {
	let n = e;
	for (let e = 0; e < 8; ++e) n = n >>> 1 ^ (1 & n && 3988292384);
	l[e] = n;
}
function y(e, n = 0) {
	n ^= -1;
	for (var t = 0, i = e.length; t < i; t++) n = n >>> 8 ^ l[255 & n ^ e[t]];
	return (-1 ^ n) >>> 0;
}
function w(e, n, t = 0) {
	const i = e.getSeconds() >> 1 | e.getMinutes() << 5 | e.getHours() << 11, r = e.getDate() | e.getMonth() + 1 << 5 | e.getFullYear() - 1980 << 9;
	n.setUint16(t, i, 1), n.setUint16(t + 2, r, 1);
}
function B({ o: e, l: n }, t) {
	return 8 * (!n || (t ?? function(e) {
		try {
			b.decode(e);
		} catch {
			return 0;
		}
		return 1;
	}(e)));
}
var b = new TextDecoder("utf8", { fatal: 1 });
function p(t, i = 0) {
	const r = e(30);
	return r.setUint32(0, 1347093252), r.setUint32(4, 754976768 | i), w(t.t, r, 10), r.setUint16(26, t.o.length, 1), n(r);
}
async function* g(e) {
	let { i: n } = e;
	if ("then" in n && (n = await n), n instanceof Uint8Array) yield n, e.m = y(n, 0), e.u = BigInt(n.length);
	else {
		e.u = 0n;
		const t = n.getReader();
		for (;;) {
			const { value: n, done: i } = await t.read();
			if (i) break;
			e.m = y(n, e.m), e.u += BigInt(n.length), yield n;
		}
	}
}
function I(t, r) {
	const f = e(16 + (r ? 8 : 0));
	return f.setUint32(0, 1347094280), f.setUint32(4, t.isFile ? t.m : 0, 1), r ? (f.setBigUint64(8, t.u, 1), f.setBigUint64(16, t.u, 1)) : (f.setUint32(8, i(t.u), 1), f.setUint32(12, i(t.u), 1)), n(f);
}
function v(t, r, f = 0, o = 0) {
	const a = e(46);
	return a.setUint32(0, 1347092738), a.setUint32(4, 755182848), a.setUint16(8, 2048 | f), w(t.t, a, 12), a.setUint32(16, t.isFile ? t.m : 0, 1), a.setUint32(20, i(t.u), 1), a.setUint32(24, i(t.u), 1), a.setUint16(28, t.o.length, 1), a.setUint16(30, o, 1), a.setUint16(40, t.isFile ? 33204 : 16893, 1), a.setUint32(42, i(r), 1), n(a);
}
function h(t, i, r) {
	const f = e(r);
	return f.setUint16(0, 1, 1), f.setUint16(2, r - 4, 1), 16 & r && (f.setBigUint64(4, t.u, 1), f.setBigUint64(12, t.u, 1)), f.setBigUint64(r - 8, i, 1), n(f);
}
function D(e) {
	return e instanceof File || e instanceof Response ? [[e], [e]] : [[
		e.input,
		e.name,
		e.size
	], [e.input, e.lastModified]];
}
var S = (e) => function(e) {
	let n = BigInt(22), t = 0n, i = 0;
	for (const r of e) {
		if (!r.o) throw new Error("Every file must have a non-empty name.");
		if (void 0 === r.u) throw new Error(`Missing size for file "${new TextDecoder().decode(r.o)}".`);
		const e = r.u >= 4294967295n, f = t >= 4294967295n;
		t += BigInt(46 + r.o.length + (e && 8)) + r.u, n += BigInt(r.o.length + 46 + (12 * f | 28 * e)), i || (i = e);
	}
	return (i || t >= 4294967295n) && (n += BigInt(76)), n + t;
}(function* (e) {
	for (const n of e) yield s(...D(n)[0]);
}(e));
function A(e, n = {}) {
	const t = {
		"Content-Type": "application/zip",
		"Content-Disposition": "attachment"
	};
	return ("bigint" == typeof n.length || Number.isInteger(n.length)) && n.length > 0 && (t["Content-Length"] = String(n.length)), n.metadata && (t["Content-Length"] = String(S(n.metadata))), new Response(N(e, n), { headers: t });
}
function N(t, a = {}) {
	const u = function(e) {
		const n = e[Symbol.iterator in e ? Symbol.iterator : Symbol.asyncIterator]();
		return {
			async next() {
				const e = await n.next();
				if (e.done) return e;
				const [t, i] = D(e.value);
				return {
					done: 0,
					value: Object.assign(f(...i), s(...t))
				};
			},
			throw: n.throw?.bind(n),
			[Symbol.asyncIterator]() {
				return this;
			}
		};
	}(t);
	return o(async function* (t, f) {
		const o = [];
		let a = 0n, s = 0n, u = 0;
		for await (const e of t) {
			const n = B(e, f.buffersAreUTF8);
			yield p(e, n), yield new Uint8Array(e.o), e.isFile && (yield* g(e));
			const t = e.u >= 4294967295n, i = 12 * (a >= 4294967295n) | 28 * t;
			yield I(e, t), o.push(v(e, a, n, i)), o.push(e.o), i && o.push(h(e, a, i)), t && (a += 8n), s++, a += BigInt(46 + e.o.length) + e.u, u || (u = t);
		}
		let d = 0n;
		for (const e of o) yield e, d += BigInt(e.length);
		if (u || a >= 4294967295n) {
			const t = e(76);
			t.setUint32(0, 1347094022), t.setBigUint64(4, BigInt(44), 1), t.setUint32(12, 755182848), t.setBigUint64(24, s, 1), t.setBigUint64(32, s, 1), t.setBigUint64(40, d, 1), t.setBigUint64(48, a, 1), t.setUint32(56, 1347094023), t.setBigUint64(64, a + d, 1), t.setUint32(72, 1, 1), yield n(t);
		}
		const l = e(22);
		l.setUint32(0, 1347093766), l.setUint16(8, r(s), 1), l.setUint16(10, r(s), 1), l.setUint32(12, i(d), 1), l.setUint32(16, i(a), 1), yield n(l);
	}(u, a), u);
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

// \0wp-global:@wordpress/blob
var require_blob = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.blob;
}));

// \0wp-global:@wordpress/primitives
var require_primitives = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.primitives;
}));

// packages/icons/build-module/library/download.mjs
var import_primitives = require_primitives();
var download_default = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.SVG, {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	style: { fill: "none" },
	stroke: "currentColor",
	strokeWidth: "1.5",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_primitives.Path, { d: "M12 3V16M6 10.5L12 16L17.5 10.5M4.75 15V19.25H19.25V15" })
});

// \0wp-global:@wordpress/html-entities
var require_html_entities = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = window.wp.htmlEntities;
}));

// packages/core-actions/build-module/shared/utils.mjs
var import_remove_accents = /* @__PURE__ */ __toESM(require_remove_accents(), 1);
var import_blob = require_blob();
var import_html_entities = require_html_entities();
function getItemTitle(item, fallback = (0, import_i18n.__)("(no title)")) {
	let title = "";
	if (typeof item.title === "string") title = (0, import_html_entities.decodeEntities)(item.title);
	else if (item.title && "rendered" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.rendered);
	else if (item.title && "raw" in item.title) title = (0, import_html_entities.decodeEntities)(item.title.raw);
	return title || fallback;
}

// packages/core-actions/build-module/wp_block/export-pattern/action.mjs
function getJsonFromItem(item) {
	return JSON.stringify({
		__file: item.type,
		title: getItemTitle(item),
		content: typeof item.content === "string" ? item.content : item.content?.raw,
		syncStatus: item.wp_pattern_sync_status
	}, null, 2);
}
const exportPattern = {
	icon: download_default,
	isEligible: (item) => item.type === "wp_block",
	callback: async (items) => {
		if (items.length === 1) return (0, import_blob.downloadBlob)(`${paramCase((0, import_remove_accents.default)(getItemTitle(items[0]) || items[0].slug))}.json`, getJsonFromItem(items[0]), "application/json");
		const nameCount = {};
		const filesToZip = items.map((item) => {
			const name = paramCase((0, import_remove_accents.default)(getItemTitle(item) || item.slug));
			nameCount[name] = (nameCount[name] || 0) + 1;
			return {
				name: `${name + (nameCount[name] > 1 ? "-" + (nameCount[name] - 1) : "")}.json`,
				lastModified: /* @__PURE__ */ new Date(),
				input: getJsonFromItem(item)
			};
		});
		return (0, import_blob.downloadBlob)((0, import_i18n.__)("patterns-export") + ".zip", await A(filesToZip).blob(), "application/zip");
	}
};

// packages/core-actions/build-module/wp_block/index.mjs
const actions = {
	"duplicate-pattern": duplicatePattern,
	"export-pattern": exportPattern
};

export { actions as default };
//# sourceMappingURL=wp_block.js.map