(function(exports, _wordpress_data, _wordpress_i18n, _wordpress_element, _wordpress_dom, _wordpress_rich_text, _wordpress_deprecated, _wordpress_warning, _wordpress_private_apis, _wordpress_hooks, _wordpress_block_serialization_default_parser, _wordpress_autop, _wordpress_is_shallow_equal, react_jsx_runtime, _wordpress_html_entities, _wordpress_shortcode, _wordpress_blob) {

"use strict";
// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
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
_wordpress_warning = __toESM(_wordpress_warning, 1);

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
		var result = replace$1(replace$1(input, splitRegexp, "$1\0$2"), stripRegexp, "\0");
		var start = 0;
		var end = result.length;
		while (result.charAt(start) === "\0") start++;
		while (result.charAt(end - 1) === "\0") end--;
		return result.slice(start, end).split("\0").map(transform).join(delimiter);
	}
	/**
	* Replace `re` in the input string with the replacement value.
	*/
	function replace$1(input, re, value) {
		if (re instanceof RegExp) return input.replace(re, value);
		return re.reduce(function(input, re) {
			return input.replace(re, value);
		}, input);
	}

// node_modules/.store/pascal-case@3.1.2-khtSA9hpCTEVLYfMgyRdoA/node_modules/pascal-case/dist.es2015/index.js
	function pascalCaseTransform(input, index) {
		var firstChar = input.charAt(0);
		var lowerChars = input.substr(1).toLowerCase();
		if (index > 0 && firstChar >= "0" && firstChar <= "9") return "_" + firstChar + lowerChars;
		return "" + firstChar.toUpperCase() + lowerChars;
	}
	function pascalCase(input, options) {
		if (options === void 0) options = {};
		return noCase(input, __assign({
			delimiter: "",
			transform: pascalCaseTransform
		}, options));
	}

// node_modules/.store/camel-case@4.1.2-5Gz5buNb7xjdcDcS4uJ7xw/node_modules/camel-case/dist.es2015/index.js
	function camelCaseTransform(input, index) {
		if (index === 0) return input.toLowerCase();
		return pascalCaseTransform(input, index);
	}
	function camelCase(input, options) {
		if (options === void 0) options = {};
		return pascalCase(input, __assign({ transform: camelCaseTransform }, options));
	}

// node_modules/.store/colord@2.10.0-Qx66Amv6c9C3nDPQDizV6Q/node_modules/colord/index.mjs
	for (var r$1 = {
		grad: .9,
		turn: 360,
		rad: 360 / (2 * Math.PI)
	}, t$1 = function(r) {
		return "string" == typeof r ? r.length > 0 : "number" == typeof r;
	}, n = function(r, t, n) {
		return void 0 === t && (t = 0), void 0 === n && (n = Math.pow(10, t)), Math.round(n * r) / n + 0;
	}, u = function(r, t, n) {
		return void 0 === t && (t = 0), void 0 === n && (n = 1), r > n ? n : r > t ? r : t;
	}, e$1 = function(r) {
		return (r = isFinite(r) ? r % 360 : 0) < 0 ? r + 360 : r;
	}, o$1 = function(r, t) {
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
	}, s = /^#([0-9a-f]{3,8})$/i, d$1 = function(r, t) {
		var n = r.charCodeAt(t);
		return (15 & n) + 9 * (n >> 6);
	}, h = function(r, t) {
		return d$1(r, t) << 4 | d$1(r, t + 1);
	}, b$1 = [], f$1 = 0; f$1 < 256; f$1++) b$1.push((f$1 < 16 ? "0" : "") + f$1.toString(16));
	var g = function(r) {
		return b$1[u(r, 0, 255)];
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
	var v$1 = function(r) {
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
			h: e$1(r.h),
			s: u(r.s, 0, 100),
			l: u(r.l, 0, 100),
			a: u(r.a)
		};
	};
	var p = function(r) {
		return {
			h: o$1(r.h),
			s: n(r.s),
			l: n(r.l),
			a: n(r.a, 3)
		};
	};
	var m$1 = function(r) {
		return v$1((n = (t = r).s, {
			h: t.h,
			s: (n *= ((u = t.l) < 50 ? u : 100 - u) / 100) > 0 ? 2 * n / (u + n) * 100 : 0,
			v: u + n,
			a: t.a
		}));
		var t, n, u;
	};
	var y$1 = function(r) {
		return {
			h: (t = c(r)).h,
			s: (e = (200 - (n = t.s)) * (u = t.v) / 100) > 0 && e < 200 ? n * u / 100 / (e <= 100 ? e : 200 - e) * 100 : 0,
			l: e / 2,
			a: t.a
		};
		var t, n, u, e;
	};
	var N$1 = /^hsla?\(\s*([+-]?(?:\d*\.\d+|\d+))(deg|rad|grad|turn)?\s*,\s*([+-]?(?:\d*\.\d+|\d+))%\s*,\s*([+-]?(?:\d*\.\d+|\d+))%\s*(?:,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i;
	var x$1 = /^hsla?\(\s*([+-]?(?:\d*\.\d+|\d+))(deg|rad|grad|turn)?\s+([+-]?(?:\d*\.\d+|\d+))%\s+([+-]?(?:\d*\.\d+|\d+))%\s*(?:\/\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i;
	var M$1 = /^rgba?\(\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*(?:,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i;
	var H$1 = /^rgba?\(\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s+([+-]?(?:\d*\.\d+|\d+))(%)?\s+([+-]?(?:\d*\.\d+|\d+))(%)?\s*(?:\/\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i;
	var $$1 = {
		string: [
			[function(r) {
				if (!s.test(r)) return null;
				var t = r.length;
				return t <= 5 ? {
					r: 17 * d$1(r, 1),
					g: 17 * d$1(r, 2),
					b: 17 * d$1(r, 3),
					a: 5 === t ? n(17 * d$1(r, 4) / 255, 2) : 1
				} : 7 === t || 9 === t ? {
					r: h(r, 1),
					g: h(r, 3),
					b: h(r, 5),
					a: 9 === t ? n(h(r, 7) / 255, 2) : 1
				} : null;
			}, "hex"],
			[function(r) {
				var t = M$1.exec(r) || H$1.exec(r);
				return t ? t[2] !== t[4] || t[4] !== t[6] ? null : a({
					r: Number(t[1]) / (t[2] ? 100 / 255 : 1),
					g: Number(t[3]) / (t[4] ? 100 / 255 : 1),
					b: Number(t[5]) / (t[6] ? 100 / 255 : 1),
					a: void 0 === t[7] ? 1 : Number(t[7]) / (t[8] ? 100 : 1)
				}) : null;
			}, "rgb"],
			[function(t) {
				var n = N$1.exec(t) || x$1.exec(t);
				if (!n) return null;
				var u, e;
				return m$1(l({
					h: (u = n[1], e = n[2], void 0 === e && (e = "deg"), Number(u) * (r$1[e] || 1)),
					s: Number(n[3]),
					l: Number(n[4]),
					a: void 0 === n[5] ? 1 : Number(n[5]) / (n[6] ? 100 : 1)
				}));
			}, "hsl"]
		],
		object: [
			[function(r) {
				var n = r.r, u = r.g, e = r.b, o = r.a, i = void 0 === o ? 1 : o;
				return t$1(n) && t$1(u) && t$1(e) ? a({
					r: Number(n),
					g: Number(u),
					b: Number(e),
					a: Number(i)
				}) : null;
			}, "rgb"],
			[function(r) {
				var n = r.h, u = r.s, e = r.l, o = r.a, a = void 0 === o ? 1 : o;
				if (!t$1(n) || !t$1(u) || !t$1(e)) return null;
				return m$1(l({
					h: Number(n),
					s: Number(u),
					l: Number(e),
					a: Number(a)
				}));
			}, "hsl"],
			[function(r) {
				var n = r.h, o = r.s, a = r.v, i = r.a, s = void 0 === i ? 1 : i;
				if (!t$1(n) || !t$1(o) || !t$1(a)) return null;
				return v$1(function(r) {
					return {
						h: e$1(r.h),
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
		return "string" == typeof r ? j(r.trim(), $$1.string) : "object" == typeof r && null !== r ? j(r, $$1.object) : [null, void 0];
	};
	var k = function(r, t) {
		var n = y$1(r);
		return {
			h: n.h,
			s: u(n.s + 100 * t, 0, 100),
			l: n.l,
			a: n.a
		};
	};
	var E$1 = function(r) {
		return (299 * r.r + 587 * r.g + 114 * r.b) / 1e3 / 255;
	};
	var R$1 = function(r, t) {
		var n = y$1(r);
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
			return n(E$1(this.rgba), 2);
		}, r.prototype.isDark = function() {
			return E$1(this.rgba) < .5;
		}, r.prototype.isLight = function() {
			return E$1(this.rgba) >= .5;
		}, r.prototype.toHex = function() {
			return r = i(this.rgba), t = r.r, u = r.g, e = r.b, a = (o = r.a) < 1 ? g(n(255 * o)) : "", "#" + g(t) + g(u) + g(e) + a;
			var r, t, u, e, o, a;
		}, r.prototype.toRgb = function() {
			return i(this.rgba);
		}, r.prototype.toRgbString = function() {
			return r = i(this.rgba), t = r.r, n = r.g, u = r.b, (e = r.a) < 1 ? "rgba(" + t + ", " + n + ", " + u + ", " + e + ")" : "rgb(" + t + ", " + n + ", " + u + ")";
			var r, t, n, u, e;
		}, r.prototype.toHsl = function() {
			return p(y$1(this.rgba));
		}, r.prototype.toHslString = function() {
			return r = p(y$1(this.rgba)), t = r.h, n = r.s, u = r.l, (e = r.a) < 1 ? "hsla(" + t + ", " + n + "%, " + u + "%, " + e + ")" : "hsl(" + t + ", " + n + "%, " + u + "%)";
			var r, t, n, u, e;
		}, r.prototype.toHsv = function() {
			return r = c(this.rgba), {
				h: o$1(r.h),
				s: n(r.s),
				v: n(r.v),
				a: n(r.a, 3)
			};
			var r;
		}, r.prototype.invert = function() {
			return A$1({
				r: 255 - (r = this.rgba).r,
				g: 255 - r.g,
				b: 255 - r.b,
				a: r.a
			});
			var r;
		}, r.prototype.saturate = function(r) {
			return void 0 === r && (r = .1), A$1(k(this.rgba, r));
		}, r.prototype.desaturate = function(r) {
			return void 0 === r && (r = .1), A$1(k(this.rgba, -r));
		}, r.prototype.grayscale = function() {
			return A$1(k(this.rgba, -1));
		}, r.prototype.lighten = function(r) {
			return void 0 === r && (r = .1), A$1(R$1(this.rgba, r));
		}, r.prototype.darken = function(r) {
			return void 0 === r && (r = .1), A$1(R$1(this.rgba, -r));
		}, r.prototype.rotate = function(r) {
			return void 0 === r && (r = 15), this.hue(y$1(this.rgba).h + r);
		}, r.prototype.alpha = function(r) {
			return "number" == typeof r ? A$1({
				r: (t = this.rgba).r,
				g: t.g,
				b: t.b,
				a: r
			}) : n(this.rgba.a, 3);
			var t;
		}, r.prototype.hue = function(r) {
			var t = y$1(this.rgba);
			return "number" == typeof r ? A$1({
				h: r,
				s: t.s,
				l: t.l,
				a: t.a
			}) : o$1(t.h);
		}, r.prototype.isEqual = function(r) {
			return this.toHex() === A$1(r).toHex();
		}, r;
	}();
	var A$1 = function(r) {
		return r instanceof q ? r : new q(r);
	};
	var C$1 = [];
	var D$1 = function(r) {
		r.forEach(function(r) {
			C$1.indexOf(r) < 0 && (r(q, $$1), C$1.push(r));
		});
	};

// node_modules/.store/colord@2.10.0-Qx66Amv6c9C3nDPQDizV6Q/node_modules/colord/plugins/names.mjs
	var e = function(e, f) {
		var a = {
			white: "#ffffff",
			bisque: "#ffe4c4",
			blue: "#0000ff",
			cadetblue: "#5f9ea0",
			chartreuse: "#7fff00",
			chocolate: "#d2691e",
			coral: "#ff7f50",
			antiquewhite: "#faebd7",
			aqua: "#00ffff",
			azure: "#f0ffff",
			whitesmoke: "#f5f5f5",
			papayawhip: "#ffefd5",
			plum: "#dda0dd",
			blanchedalmond: "#ffebcd",
			black: "#000000",
			gold: "#ffd700",
			goldenrod: "#daa520",
			gainsboro: "#dcdcdc",
			cornsilk: "#fff8dc",
			cornflowerblue: "#6495ed",
			burlywood: "#deb887",
			aquamarine: "#7fffd4",
			beige: "#f5f5dc",
			crimson: "#dc143c",
			cyan: "#00ffff",
			darkblue: "#00008b",
			darkcyan: "#008b8b",
			darkgoldenrod: "#b8860b",
			darkkhaki: "#bdb76b",
			darkgray: "#a9a9a9",
			darkgreen: "#006400",
			darkgrey: "#a9a9a9",
			peachpuff: "#ffdab9",
			darkmagenta: "#8b008b",
			darkred: "#8b0000",
			darkorchid: "#9932cc",
			darkorange: "#ff8c00",
			darkslateblue: "#483d8b",
			gray: "#808080",
			darkslategray: "#2f4f4f",
			darkslategrey: "#2f4f4f",
			deeppink: "#ff1493",
			deepskyblue: "#00bfff",
			wheat: "#f5deb3",
			firebrick: "#b22222",
			floralwhite: "#fffaf0",
			ghostwhite: "#f8f8ff",
			darkviolet: "#9400d3",
			magenta: "#ff00ff",
			green: "#008000",
			dodgerblue: "#1e90ff",
			grey: "#808080",
			honeydew: "#f0fff0",
			hotpink: "#ff69b4",
			blueviolet: "#8a2be2",
			forestgreen: "#228b22",
			lawngreen: "#7cfc00",
			indianred: "#cd5c5c",
			indigo: "#4b0082",
			fuchsia: "#ff00ff",
			brown: "#a52a2a",
			maroon: "#800000",
			mediumblue: "#0000cd",
			lightcoral: "#f08080",
			darkturquoise: "#00ced1",
			lightcyan: "#e0ffff",
			ivory: "#fffff0",
			lightyellow: "#ffffe0",
			lightsalmon: "#ffa07a",
			lightseagreen: "#20b2aa",
			linen: "#faf0e6",
			mediumaquamarine: "#66cdaa",
			lemonchiffon: "#fffacd",
			lime: "#00ff00",
			khaki: "#f0e68c",
			mediumseagreen: "#3cb371",
			limegreen: "#32cd32",
			mediumspringgreen: "#00fa9a",
			lightskyblue: "#87cefa",
			lightblue: "#add8e6",
			midnightblue: "#191970",
			lightpink: "#ffb6c1",
			mistyrose: "#ffe4e1",
			moccasin: "#ffe4b5",
			mintcream: "#f5fffa",
			lightslategray: "#778899",
			lightslategrey: "#778899",
			navajowhite: "#ffdead",
			navy: "#000080",
			mediumvioletred: "#c71585",
			powderblue: "#b0e0e6",
			palegoldenrod: "#eee8aa",
			oldlace: "#fdf5e6",
			paleturquoise: "#afeeee",
			mediumturquoise: "#48d1cc",
			mediumorchid: "#ba55d3",
			rebeccapurple: "#663399",
			lightsteelblue: "#b0c4de",
			mediumslateblue: "#7b68ee",
			thistle: "#d8bfd8",
			tan: "#d2b48c",
			orchid: "#da70d6",
			mediumpurple: "#9370db",
			purple: "#800080",
			pink: "#ffc0cb",
			skyblue: "#87ceeb",
			springgreen: "#00ff7f",
			palegreen: "#98fb98",
			red: "#ff0000",
			yellow: "#ffff00",
			slateblue: "#6a5acd",
			lavenderblush: "#fff0f5",
			peru: "#cd853f",
			palevioletred: "#db7093",
			violet: "#ee82ee",
			teal: "#008080",
			slategray: "#708090",
			slategrey: "#708090",
			aliceblue: "#f0f8ff",
			darkseagreen: "#8fbc8f",
			darkolivegreen: "#556b2f",
			greenyellow: "#adff2f",
			seagreen: "#2e8b57",
			seashell: "#fff5ee",
			tomato: "#ff6347",
			silver: "#c0c0c0",
			sienna: "#a0522d",
			lavender: "#e6e6fa",
			lightgreen: "#90ee90",
			orange: "#ffa500",
			orangered: "#ff4500",
			steelblue: "#4682b4",
			royalblue: "#4169e1",
			turquoise: "#40e0d0",
			yellowgreen: "#9acd32",
			salmon: "#fa8072",
			saddlebrown: "#8b4513",
			sandybrown: "#f4a460",
			rosybrown: "#bc8f8f",
			darksalmon: "#e9967a",
			lightgoldenrodyellow: "#fafad2",
			snow: "#fffafa",
			lightgrey: "#d3d3d3",
			lightgray: "#d3d3d3",
			dimgray: "#696969",
			dimgrey: "#696969",
			olivedrab: "#6b8e23",
			olive: "#808000"
		}, r = {};
		for (var d in a) r[a[d]] = d;
		var l = {};
		e.prototype.toName = function(f) {
			if (!(this.rgba.a || this.rgba.r || this.rgba.g || this.rgba.b)) return "transparent";
			var d, i, n = r[this.toHex()];
			if (n) return n;
			if (null == f ? void 0 : f.closest) {
				var o = this.toRgb(), t = 1 / 0, b = "black";
				if (!l.length) for (var c in a) l[c] = new e(a[c]).toRgb();
				for (var g in a) {
					var u = (d = o, i = l[g], Math.pow(d.r - i.r, 2) + Math.pow(d.g - i.g, 2) + Math.pow(d.b - i.b, 2));
					u < t && (t = u, b = g);
				}
				return b;
			}
		};
		f.string.push([function(f) {
			var r = f.toLowerCase(), d = "transparent" === r ? "#0000" : a[r];
			return d ? new e(d).toRgb() : null;
		}, "name"]);
	};

// node_modules/.store/colord@2.10.0-Qx66Amv6c9C3nDPQDizV6Q/node_modules/colord/plugins/a11y.mjs
	var o = function(o) {
		var t = o / 255;
		return t < .04045 ? t / 12.92 : Math.pow((t + .055) / 1.055, 2.4);
	};
	var t = function(t) {
		return .2126 * o(t.r) + .7152 * o(t.g) + .0722 * o(t.b);
	};
	var r = function(o) {
		o.prototype.luminance = function() {
			return o = t(this.rgba), void 0 === (r = 2) && (r = 0), void 0 === n && (n = Math.pow(10, r)), Math.round(n * o) / n + 0;
			var o, r, n;
		}, o.prototype.contrast = function(r) {
			void 0 === r && (r = "#FFF");
			var n, a, i, e, v, u, d, c = r instanceof o ? r : new o(r);
			return e = this.rgba, v = c.toRgb(), u = t(e), d = t(v), n = u > d ? (u + .05) / (d + .05) : (d + .05) / (u + .05), void 0 === (a = 2) && (a = 0), void 0 === i && (i = Math.pow(10, a)), Math.floor(i * n) / i + 0;
		}, o.prototype.isReadable = function(o, t) {
			return void 0 === o && (o = "#FFF"), void 0 === t && (t = {}), this.contrast(o) >= (e = void 0 === (i = (r = t).size) ? "normal" : i, "AAA" === (a = void 0 === (n = r.level) ? "AA" : n) && "normal" === e ? 7 : "AA" === a && "large" === e ? 3 : 4.5);
			var r, n, a, i, e;
		};
	};

// packages/blocks/build-module/api/constants.mjs
	const BLOCK_ICON_DEFAULT = "block-default";
	/**
	* Array of valid keys in a block type settings deprecation object.
	*/
	const DEPRECATED_ENTRY_KEYS = [
		"attributes",
		"supports",
		"save",
		"migrate",
		"isEligible",
		"apiVersion"
	];
	const __EXPERIMENTAL_STYLE_PROPERTY = {
		"--wp--style--color--link": {
			value: ["color", "link"],
			support: ["color", "link"]
		},
		aspectRatio: {
			value: ["dimensions", "aspectRatio"],
			support: ["dimensions", "aspectRatio"],
			useEngine: true
		},
		background: {
			value: ["color", "gradient"],
			support: ["color", "gradients"],
			useEngine: true
		},
		backgroundColor: {
			value: ["color", "background"],
			support: ["color", "background"],
			requiresOptOut: true,
			useEngine: true
		},
		backgroundImage: {
			value: ["background", "backgroundImage"],
			support: ["background", "backgroundImage"],
			useEngine: true
		},
		backgroundRepeat: {
			value: ["background", "backgroundRepeat"],
			support: ["background", "backgroundRepeat"],
			useEngine: true
		},
		backgroundSize: {
			value: ["background", "backgroundSize"],
			support: ["background", "backgroundSize"],
			useEngine: true
		},
		backgroundPosition: {
			value: ["background", "backgroundPosition"],
			support: ["background", "backgroundPosition"],
			useEngine: true
		},
		backgroundGradient: {
			value: ["background", "gradient"],
			support: ["background", "gradient"],
			useEngine: true
		},
		backgroundClip: {
			value: ["background", "backgroundClip"],
			support: ["background", "backgroundClip"],
			useEngine: true
		},
		borderColor: {
			value: ["border", "color"],
			support: ["__experimentalBorder", "color"],
			useEngine: true
		},
		borderRadius: {
			value: ["border", "radius"],
			support: ["__experimentalBorder", "radius"],
			properties: {
				borderTopLeftRadius: "topLeft",
				borderTopRightRadius: "topRight",
				borderBottomLeftRadius: "bottomLeft",
				borderBottomRightRadius: "bottomRight"
			},
			useEngine: true
		},
		borderStyle: {
			value: ["border", "style"],
			support: ["__experimentalBorder", "style"],
			useEngine: true
		},
		borderWidth: {
			value: ["border", "width"],
			support: ["__experimentalBorder", "width"],
			useEngine: true
		},
		borderTopColor: {
			value: [
				"border",
				"top",
				"color"
			],
			support: ["__experimentalBorder", "color"],
			useEngine: true
		},
		borderTopStyle: {
			value: [
				"border",
				"top",
				"style"
			],
			support: ["__experimentalBorder", "style"],
			useEngine: true
		},
		borderTopWidth: {
			value: [
				"border",
				"top",
				"width"
			],
			support: ["__experimentalBorder", "width"],
			useEngine: true
		},
		borderRightColor: {
			value: [
				"border",
				"right",
				"color"
			],
			support: ["__experimentalBorder", "color"],
			useEngine: true
		},
		borderRightStyle: {
			value: [
				"border",
				"right",
				"style"
			],
			support: ["__experimentalBorder", "style"],
			useEngine: true
		},
		borderRightWidth: {
			value: [
				"border",
				"right",
				"width"
			],
			support: ["__experimentalBorder", "width"],
			useEngine: true
		},
		borderBottomColor: {
			value: [
				"border",
				"bottom",
				"color"
			],
			support: ["__experimentalBorder", "color"],
			useEngine: true
		},
		borderBottomStyle: {
			value: [
				"border",
				"bottom",
				"style"
			],
			support: ["__experimentalBorder", "style"],
			useEngine: true
		},
		borderBottomWidth: {
			value: [
				"border",
				"bottom",
				"width"
			],
			support: ["__experimentalBorder", "width"],
			useEngine: true
		},
		borderLeftColor: {
			value: [
				"border",
				"left",
				"color"
			],
			support: ["__experimentalBorder", "color"],
			useEngine: true
		},
		borderLeftStyle: {
			value: [
				"border",
				"left",
				"style"
			],
			support: ["__experimentalBorder", "style"],
			useEngine: true
		},
		borderLeftWidth: {
			value: [
				"border",
				"left",
				"width"
			],
			support: ["__experimentalBorder", "width"],
			useEngine: true
		},
		color: {
			value: ["color", "text"],
			support: ["color", "text"],
			requiresOptOut: true,
			useEngine: true
		},
		columnCount: {
			value: ["typography", "textColumns"],
			support: ["typography", "textColumns"],
			useEngine: true
		},
		filter: {
			value: ["filter", "duotone"],
			support: ["filter", "duotone"]
		},
		linkColor: {
			value: [
				"elements",
				"link",
				"color",
				"text"
			],
			support: ["color", "link"]
		},
		captionColor: {
			value: [
				"elements",
				"caption",
				"color",
				"text"
			],
			support: ["color", "caption"]
		},
		buttonColor: {
			value: [
				"elements",
				"button",
				"color",
				"text"
			],
			support: ["color", "button"]
		},
		buttonBackgroundColor: {
			value: [
				"elements",
				"button",
				"color",
				"background"
			],
			support: ["color", "button"]
		},
		headingColor: {
			value: [
				"elements",
				"heading",
				"color",
				"text"
			],
			support: ["color", "heading"]
		},
		headingBackgroundColor: {
			value: [
				"elements",
				"heading",
				"color",
				"background"
			],
			support: ["color", "heading"]
		},
		fontFamily: {
			value: ["typography", "fontFamily"],
			support: ["typography", "__experimentalFontFamily"],
			useEngine: true
		},
		fontSize: {
			value: ["typography", "fontSize"],
			support: ["typography", "fontSize"],
			useEngine: true
		},
		fontStyle: {
			value: ["typography", "fontStyle"],
			support: ["typography", "__experimentalFontStyle"],
			useEngine: true
		},
		fontWeight: {
			value: ["typography", "fontWeight"],
			support: ["typography", "__experimentalFontWeight"],
			useEngine: true
		},
		lineHeight: {
			value: ["typography", "lineHeight"],
			support: ["typography", "lineHeight"],
			useEngine: true
		},
		margin: {
			value: ["spacing", "margin"],
			support: ["spacing", "margin"],
			properties: {
				marginTop: "top",
				marginRight: "right",
				marginBottom: "bottom",
				marginLeft: "left"
			},
			useEngine: true
		},
		minHeight: {
			value: ["dimensions", "minHeight"],
			support: ["dimensions", "minHeight"],
			useEngine: true
		},
		minWidth: {
			value: ["dimensions", "minWidth"],
			support: ["dimensions", "minWidth"],
			useEngine: true
		},
		height: {
			value: ["dimensions", "height"],
			support: ["dimensions", "height"],
			useEngine: true
		},
		width: {
			value: ["dimensions", "width"],
			support: ["dimensions", "width"],
			useEngine: true
		},
		padding: {
			value: ["spacing", "padding"],
			support: ["spacing", "padding"],
			properties: {
				paddingTop: "top",
				paddingRight: "right",
				paddingBottom: "bottom",
				paddingLeft: "left"
			},
			useEngine: true
		},
		textAlign: {
			value: ["typography", "textAlign"],
			support: ["typography", "textAlign"],
			useEngine: false
		},
		textDecoration: {
			value: ["typography", "textDecoration"],
			support: ["typography", "__experimentalTextDecoration"],
			useEngine: true
		},
		textTransform: {
			value: ["typography", "textTransform"],
			support: ["typography", "__experimentalTextTransform"],
			useEngine: true
		},
		letterSpacing: {
			value: ["typography", "letterSpacing"],
			support: ["typography", "__experimentalLetterSpacing"],
			useEngine: true
		},
		textIndent: {
			value: ["typography", "textIndent"],
			support: ["typography", "textIndent"],
			useEngine: true
		},
		textShadow: {
			value: ["typography", "textShadow"],
			support: ["typography", "textShadow"],
			useEngine: true
		},
		writingMode: {
			value: ["typography", "writingMode"],
			support: ["typography", "__experimentalWritingMode"],
			useEngine: true
		},
		"--wp--style--root--padding": {
			value: ["spacing", "padding"],
			support: ["spacing", "padding"],
			properties: {
				"--wp--style--root--padding-top": "top",
				"--wp--style--root--padding-right": "right",
				"--wp--style--root--padding-bottom": "bottom",
				"--wp--style--root--padding-left": "left"
			},
			rootOnly: true
		}
	};
	const __EXPERIMENTAL_ELEMENTS = {
		link: "a:where(:not(.wp-element-button))",
		heading: "h1, h2, h3, h4, h5, h6",
		h1: "h1",
		h2: "h2",
		h3: "h3",
		h4: "h4",
		h5: "h5",
		h6: "h6",
		button: ".wp-element-button, .wp-block-button__link",
		caption: ".wp-element-caption, .wp-block-audio figcaption, .wp-block-embed figcaption, .wp-block-gallery figcaption, .wp-block-image figcaption, .wp-block-table figcaption, .wp-block-video figcaption",
		cite: "cite",
		label: "label",
		select: "select",
		textInput: "textarea, input:where([type=email],[type=number],[type=password],[type=search],[type=tel],[type=text],[type=url])"
	};
	const __EXPERIMENTAL_PATHS_WITH_OVERRIDE = {
		"color.duotone": true,
		"color.gradients": true,
		"color.palette": true,
		"dimensions.aspectRatios": true,
		"typography.fontSizes": true,
		"spacing.spacingSizes": true
	};

// packages/blocks/build-module/api/i18n-block.json
	var i18n_block_default = {
		title: "block title",
		description: "block description",
		keywords: ["block keyword"],
		styles: [{ "label": "block style label" }],
		variations: [{
			"title": "block variation title",
			"description": "block variation description",
			"keywords": ["block variation keyword"]
		}]
	};

// packages/blocks/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/blocks");

// packages/blocks/build-module/api/registration.mjs
	function isObject$2(object) {
		return object !== null && typeof object === "object";
	}
	/**
	* Sets the server side block definition of blocks.
	*
	* Ignored from documentation due to being marked as unstable.
	*
	* @ignore
	*
	* @param definitions Server-side block definitions
	*/
	function unstable__bootstrapServerSideBlockDefinitions(definitions) {
		const { addBootstrappedBlockType } = unlock((0, _wordpress_data.dispatch)(store));
		for (const [name, blockType] of Object.entries(definitions)) addBootstrappedBlockType(name, blockType);
	}
	/**
	* Gets block settings from metadata loaded from `block.json` file
	*
	* @param metadata            Block metadata loaded from `block.json`.
	* @param metadata.textdomain Textdomain to use with translations.
	*
	* @return Block settings.
	*/
	function getBlockSettingsFromMetadata({ textdomain, ...metadata }) {
		const allowedFields = [
			"apiVersion",
			"title",
			"category",
			"parent",
			"ancestor",
			"icon",
			"description",
			"keywords",
			"attributes",
			"providesContext",
			"usesContext",
			"selectors",
			"supports",
			"styles",
			"example",
			"variations",
			"blockHooks",
			"allowedBlocks"
		];
		const settings = Object.fromEntries(Object.entries(metadata).filter(([key]) => allowedFields.includes(key)));
		if (textdomain) Object.keys(i18n_block_default).forEach((key) => {
			if (!settings[key]) return;
			settings[key] = translateBlockSettingUsingI18nSchema(i18n_block_default[key], settings[key], textdomain);
		});
		return settings;
	}
	function registerBlockType(blockNameOrMetadata, settings) {
		const name = isObject$2(blockNameOrMetadata) ? blockNameOrMetadata.name : blockNameOrMetadata;
		if (typeof name !== "string") {
			(0, _wordpress_warning.default)("Block names must be strings.");
			return;
		}
		if (!/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(name)) {
			(0, _wordpress_warning.default)("Block names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-block");
			return;
		}
		if ((0, _wordpress_data.select)(store).getBlockType(name)) {
			(0, _wordpress_warning.default)("Block \"" + name + "\" is already registered.");
			return;
		}
		const { addBootstrappedBlockType, addUnprocessedBlockType } = unlock((0, _wordpress_data.dispatch)(store));
		if (isObject$2(blockNameOrMetadata)) addBootstrappedBlockType(name, getBlockSettingsFromMetadata(blockNameOrMetadata));
		addUnprocessedBlockType(name, settings);
		return (0, _wordpress_data.select)(store).getBlockType(name);
	}
	/**
	* Translates block settings provided with metadata using the i18n schema.
	*
	* @param i18nSchema   I18n schema for the block setting.
	* @param settingValue Value for the block setting.
	* @param textdomain   Textdomain to use with translations.
	*
	* @return Translated setting.
	*/
	function translateBlockSettingUsingI18nSchema(i18nSchema, settingValue, textdomain) {
		if (typeof i18nSchema === "string" && typeof settingValue === "string") return (0, _wordpress_i18n._x)(settingValue, i18nSchema, textdomain);
		if (Array.isArray(i18nSchema) && i18nSchema.length && Array.isArray(settingValue)) return settingValue.map((value) => translateBlockSettingUsingI18nSchema(i18nSchema[0], value, textdomain));
		if (isObject$2(i18nSchema) && Object.entries(i18nSchema).length && isObject$2(settingValue)) return Object.keys(settingValue).reduce((accumulator, key) => {
			if (!i18nSchema[key]) {
				accumulator[key] = settingValue[key];
				return accumulator;
			}
			accumulator[key] = translateBlockSettingUsingI18nSchema(i18nSchema[key], settingValue[key], textdomain);
			return accumulator;
		}, {});
		return settingValue;
	}
	/**
	* Registers a new block collection to group blocks in the same namespace in the inserter.
	*
	* @param namespace      The namespace to group blocks by in the inserter; corresponds to the block namespace.
	* @param settings       The block collection settings.
	* @param settings.title The title to display in the block inserter.
	* @param settings.icon  The icon to display in the block inserter.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { registerBlockCollection, registerBlockType } from '@wordpress/blocks';
	*
	* // Register the collection.
	* registerBlockCollection( 'my-collection', {
	*     title: __( 'Custom Collection' ),
	* } );
	*
	* // Register a block in the same namespace to add it to the collection.
	* registerBlockType( 'my-collection/block-name', {
	*     title: __( 'My First Block' ),
	*     edit: () => <div>{ __( 'Hello from the editor!' ) }</div>,
	*     save: () => <div>'Hello from the saved content!</div>,
	* } );
	* ```
	*/
	function registerBlockCollection(namespace, { title, icon }) {
		(0, _wordpress_data.dispatch)(store).addBlockCollection(namespace, title, icon);
	}
	/**
	* Unregisters a block.
	*
	* @param name Block name.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { unregisterBlockType } from '@wordpress/blocks';
	*
	* const ExampleComponent = () => {
	*     return (
	*         <Button
	*             onClick={ () =>
	*                 unregisterBlockType( 'my-collection/block-name' )
	*             }
	*         >
	*             { __( 'Unregister my custom block.' ) }
	*         </Button>
	*     );
	* };
	* ```
	*
	* @return The previous block value, if it has been successfully
	*         unregistered; otherwise `undefined`.
	*/
	function unregisterBlockType(name) {
		const oldBlock = (0, _wordpress_data.select)(store).getBlockType(name);
		if (!oldBlock) {
			(0, _wordpress_warning.default)("Block \"" + name + "\" is not registered.");
			return;
		}
		(0, _wordpress_data.dispatch)(store).removeBlockTypes(name);
		return oldBlock;
	}
	/**
	* Assigns name of block for handling non-block content.
	*
	* @param blockName Block name.
	*/
	function setFreeformContentHandlerName(blockName) {
		(0, _wordpress_data.dispatch)(store).setFreeformFallbackBlockName(blockName);
	}
	/**
	* Retrieves name of block handling non-block content, or undefined if no
	* handler has been defined.
	*
	* @return Block name.
	*/
	function getFreeformContentHandlerName() {
		return (0, _wordpress_data.select)(store).getFreeformFallbackBlockName();
	}
	/**
	* Retrieves name of block used for handling grouping interactions.
	*
	* @return Block name.
	*/
	function getGroupingBlockName() {
		return (0, _wordpress_data.select)(store).getGroupingBlockName();
	}
	/**
	* Assigns name of block handling unregistered block types.
	*
	* @param blockName Block name.
	*/
	function setUnregisteredTypeHandlerName(blockName) {
		(0, _wordpress_data.dispatch)(store).setUnregisteredFallbackBlockName(blockName);
	}
	/**
	* Retrieves name of block handling unregistered block types, or undefined if no
	* handler has been defined.
	*
	* @return Block name.
	*/
	function getUnregisteredTypeHandlerName() {
		return (0, _wordpress_data.select)(store).getUnregisteredFallbackBlockName();
	}
	/**
	* Assigns the default block name.
	*
	* @param name Block name.
	*
	* @example
	* ```js
	* import { setDefaultBlockName } from '@wordpress/blocks';
	*
	* const ExampleComponent = () => {
	*
	*     return (
	*         <Button onClick={ () => setDefaultBlockName( 'core/heading' ) }>
	*             { __( 'Set the default block to Heading' ) }
	*         </Button>
	*     );
	* };
	* ```
	*/
	function setDefaultBlockName(name) {
		(0, _wordpress_data.dispatch)(store).setDefaultBlockName(name);
	}
	/**
	* Assigns name of block for handling block grouping interactions.
	*
	* This function lets you select a different block to group other blocks in instead of the
	* default `core/group` block. This function must be used in a component or when the DOM is fully
	* loaded. See https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dom-ready/
	*
	* @param name Block name.
	*
	* @example
	* ```js
	* import { setGroupingBlockName } from '@wordpress/blocks';
	*
	* const ExampleComponent = () => {
	*
	*     return (
	*         <Button onClick={ () => setGroupingBlockName( 'core/columns' ) }>
	*             { __( 'Wrap in columns' ) }
	*         </Button>
	*     );
	* };
	* ```
	*/
	function setGroupingBlockName(name) {
		(0, _wordpress_data.dispatch)(store).setGroupingBlockName(name);
	}
	/**
	* Retrieves the default block name.
	*
	* @return Block name.
	*/
	function getDefaultBlockName() {
		return (0, _wordpress_data.select)(store).getDefaultBlockName();
	}
	/**
	* Returns a registered block type.
	*
	* @param name Block name.
	*
	* @return Block type.
	*/
	function getBlockType(name) {
		return (0, _wordpress_data.select)(store)?.getBlockType(name);
	}
	/**
	* Returns all registered blocks.
	*
	* @return Block settings.
	*/
	function getBlockTypes() {
		return (0, _wordpress_data.select)(store).getBlockTypes();
	}
	/**
	* Returns the block support value for a feature, if defined.
	*
	* @param nameOrType      Block name or type object
	* @param feature         Feature to retrieve, as a dot-separated path or an
	*                        array of path segments
	* @param defaultSupports Default value to return if not
	*                        explicitly defined
	*
	* @return Block support value
	*/
	function getBlockSupport(nameOrType, feature, defaultSupports) {
		return (0, _wordpress_data.select)(store).getBlockSupport(nameOrType, feature, defaultSupports);
	}
	/**
	* Returns true if the block defines support for a feature, or false otherwise.
	*
	* @param nameOrType      Block name or type object.
	* @param feature         Feature to test, as a dot-separated path or an array
	*                        of path segments.
	* @param defaultSupports Whether feature is supported by
	*                        default if not explicitly defined.
	*
	* @return Whether block supports feature.
	*/
	function hasBlockSupport(nameOrType, feature, defaultSupports) {
		return (0, _wordpress_data.select)(store).hasBlockSupport(nameOrType, feature, defaultSupports);
	}
	/**
	* Determines whether or not the given block is a reusable block. This is a
	* special block type that is used to point to a global block stored via the
	* API.
	*
	* @param blockOrType Block or Block Type to test.
	*
	* @return Whether the given block is a reusable block.
	*/
	function isReusableBlock(blockOrType) {
		return blockOrType?.name === "core/block";
	}
	/**
	* Determines whether or not the given block is a template part. This is a
	* special block type that allows composing a page template out of reusable
	* design elements.
	*
	* @param blockOrType Block or Block Type to test.
	*
	* @return Whether the given block is a template part.
	*/
	function isTemplatePart(blockOrType) {
		return blockOrType?.name === "core/template-part";
	}
	/**
	* Returns an array with the child blocks of a given block.
	*
	* @param blockName Name of block (example: “latest-posts”).
	*
	* @return Array of child block names.
	*/
	const getChildBlockNames = (blockName) => {
		return (0, _wordpress_data.select)(store).getChildBlockNames(blockName);
	};
	/**
	* Returns a boolean indicating if a block has child blocks or not.
	*
	* @param blockName Name of block (example: “latest-posts”).
	*
	* @return True if a block contains child blocks and false otherwise.
	*/
	const hasChildBlocks = (blockName) => {
		return (0, _wordpress_data.select)(store).hasChildBlocks(blockName);
	};
	/**
	* Returns a boolean indicating if a block has at least one child block with inserter support.
	*
	* @param blockName Block type name.
	*
	* @return True if a block contains at least one child blocks with inserter support
	*         and false otherwise.
	*/
	const hasChildBlocksWithInserterSupport = (blockName) => {
		return (0, _wordpress_data.select)(store).hasChildBlocksWithInserterSupport(blockName);
	};
	/**
	* Registers a new block style for the given block types.
	*
	* For more information on connecting the styles with CSS
	* [the official documentation](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-styles/#styles).
	*
	* @param blockNames     Name of blocks e.g. “core/latest-posts” or `[“core/group”, “core/columns”]`.
	* @param styleVariation Object containing `name` which is the class name applied to the block and `label` which identifies the variation to the user.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { registerBlockStyle } from '@wordpress/blocks';
	* import { Button } from '@wordpress/components';
	*
	*
	* const ExampleComponent = () => {
	*     return (
	*         <Button
	*             onClick={ () => {
	*                 registerBlockStyle( 'core/quote', {
	*                     name: 'fancy-quote',
	*                     label: __( 'Fancy Quote' ),
	*                 } );
	*             } }
	*         >
	*             { __( 'Add a new block style for core/quote' ) }
	*         </Button>
	*     );
	* };
	* ```
	*/
	const registerBlockStyle = (blockNames, styleVariation) => {
		(0, _wordpress_data.dispatch)(store).addBlockStyles(blockNames, styleVariation);
	};
	/**
	* Unregisters a block style for the given block.
	*
	* @param blockName          Name of block (example: “core/latest-posts”).
	* @param styleVariationName Name of class applied to the block.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { unregisterBlockStyle } from '@wordpress/blocks';
	* import { Button } from '@wordpress/components';
	*
	* const ExampleComponent = () => {
	*     return (
	*     <Button
	*         onClick={ () => {
	*             unregisterBlockStyle( 'core/quote', 'plain' );
	*         } }
	*     >
	*         { __( 'Remove the "Plain" block style for core/quote' ) }
	*     </Button>
	*     );
	* };
	* ```
	*/
	const unregisterBlockStyle = (blockName, styleVariationName) => {
		(0, _wordpress_data.dispatch)(store).removeBlockStyles(blockName, styleVariationName);
	};
	/**
	* Returns an array with the variations of a given block type.
	* Ignored from documentation as the recommended usage is via useSelect from `@wordpress/data`.
	*
	* @ignore
	*
	* @param blockName Name of block (example: “core/columns”).
	* @param scope     Block variation scope name.
	*
	* @return Block variations.
	*/
	const getBlockVariations = (blockName, scope) => {
		return (0, _wordpress_data.select)(store).getBlockVariations(blockName, scope);
	};
	/**
	* Registers a new block variation for the given block type.
	*
	* For more information on block variations see
	* [the official documentation ](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/).
	*
	* @param blockName Name of the block (example: “core/columns”).
	* @param variation Object describing a block variation.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { registerBlockVariation } from '@wordpress/blocks';
	* import { Button } from '@wordpress/components';
	*
	* const ExampleComponent = () => {
	*     return (
	*         <Button
	*             onClick={ () => {
	*                 registerBlockVariation( 'core/embed', {
	*                     name: 'custom',
	*                     title: __( 'My Custom Embed' ),
	*                     attributes: { providerNameSlug: 'custom' },
	*                 } );
	*             } }
	*          >
	*              __( 'Add a custom variation for core/embed' ) }
	*         </Button>
	*     );
	* };
	* ```
	*/
	const registerBlockVariation = (blockName, variation) => {
		if (Array.isArray(variation)) {
			for (const v of variation) if (typeof v.name !== "string") (0, _wordpress_warning.default)("Variation names must be unique strings.");
		} else if (typeof variation.name !== "string") (0, _wordpress_warning.default)("Variation names must be unique strings.");
		(0, _wordpress_data.dispatch)(store).addBlockVariations(blockName, variation);
	};
	/**
	* Unregisters a block variation defined for the given block type.
	*
	* @param blockName     Name of the block (example: “core/columns”).
	* @param variationName Name of the variation defined for the block.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { unregisterBlockVariation } from '@wordpress/blocks';
	* import { Button } from '@wordpress/components';
	*
	* const ExampleComponent = () => {
	*     return (
	*         <Button
	*             onClick={ () => {
	*                 unregisterBlockVariation( 'core/embed', 'youtube' );
	*             } }
	*         >
	*             { __( 'Remove the YouTube variation from core/embed' ) }
	*         </Button>
	*     );
	* };
	* ```
	*/
	const unregisterBlockVariation = (blockName, variationName) => {
		(0, _wordpress_data.dispatch)(store).removeBlockVariations(blockName, variationName);
	};
	/**
	* Registers a new block bindings source with an object defining its
	* behavior. Once registered, the source is available to be connected
	* to the supported block attributes.
	*
	* @since 6.7.0 Introduced in WordPress core.
	*
	* @param source Object describing a block bindings source.
	*
	* @example
	* ```js
	* import { _x } from '@wordpress/i18n';
	* import { registerBlockBindingsSource } from '@wordpress/blocks'
	*
	* registerBlockBindingsSource( {
	*     name: 'plugin/my-custom-source',
	*     label: _x( 'My Custom Source', 'block bindings source' ),
	*     usesContext: [ 'postType' ],
	*     getValues: getSourceValues,
	*     setValues: updateMyCustomValuesInBatch,
	*     canUserEditValue: () => true,
	* } );
	* ```
	*/
	const registerBlockBindingsSource = (source) => {
		const { name, label, usesContext, getValues, setValues, canUserEditValue, getFieldsList } = source;
		const existingSource = unlock((0, _wordpress_data.select)(store)).getBlockBindingsSource(name);
		const serverProps = ["label", "usesContext"];
		for (const prop in existingSource) if (!serverProps.includes(prop) && existingSource[prop]) {
			(0, _wordpress_warning.default)("Block bindings source \"" + name + "\" is already registered.");
			return;
		}
		if (!name) {
			(0, _wordpress_warning.default)("Block bindings source must contain a name.");
			return;
		}
		if (typeof name !== "string") {
			(0, _wordpress_warning.default)("Block bindings source name must be a string.");
			return;
		}
		if (/[A-Z]+/.test(name)) {
			(0, _wordpress_warning.default)("Block bindings source name must not contain uppercase characters.");
			return;
		}
		if (!/^[a-z0-9/-]+$/.test(name)) {
			(0, _wordpress_warning.default)("Block bindings source name must contain only valid characters: lowercase characters, hyphens, or digits. Example: my-plugin/my-custom-source.");
			return;
		}
		if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(name)) {
			(0, _wordpress_warning.default)("Block bindings source name must contain a namespace and valid characters. Example: my-plugin/my-custom-source.");
			return;
		}
		if (!label && !existingSource?.label) {
			(0, _wordpress_warning.default)("Block bindings source must contain a label.");
			return;
		}
		if (label && typeof label !== "string") {
			(0, _wordpress_warning.default)("Block bindings source label must be a string.");
			return;
		}
		if (label && existingSource?.label && label !== existingSource?.label) (0, _wordpress_warning.default)("Block bindings \"" + name + "\" source label was overridden.");
		if (usesContext && !Array.isArray(usesContext)) {
			(0, _wordpress_warning.default)("Block bindings source usesContext must be an array.");
			return;
		}
		if (getValues && typeof getValues !== "function") {
			(0, _wordpress_warning.default)("Block bindings source getValues must be a function.");
			return;
		}
		if (setValues && typeof setValues !== "function") {
			(0, _wordpress_warning.default)("Block bindings source setValues must be a function.");
			return;
		}
		if (canUserEditValue && typeof canUserEditValue !== "function") {
			(0, _wordpress_warning.default)("Block bindings source canUserEditValue must be a function.");
			return;
		}
		if (getFieldsList && typeof getFieldsList !== "function") {
			(0, _wordpress_warning.default)("Block bindings source getFieldsList must be a function.");
			return;
		}
		return unlock((0, _wordpress_data.dispatch)(store)).addBlockBindingsSource(source);
	};
	/**
	* Unregisters a block bindings source by providing its name.
	*
	* @since 6.7.0 Introduced in WordPress core.
	*
	* @param name The name of the block bindings source to unregister.
	*
	* @example
	* ```js
	* import { unregisterBlockBindingsSource } from '@wordpress/blocks';
	*
	* unregisterBlockBindingsSource( 'plugin/my-custom-source' );
	* ```
	*/
	function unregisterBlockBindingsSource(name) {
		if (!getBlockBindingsSource(name)) {
			(0, _wordpress_warning.default)("Block bindings source \"" + name + "\" is not registered.");
			return;
		}
		unlock((0, _wordpress_data.dispatch)(store)).removeBlockBindingsSource(name);
	}
	/**
	* Returns a registered block bindings source by its name.
	*
	* @since 6.7.0 Introduced in WordPress core.
	*
	* @param name Block bindings source name.
	*
	* @return Block bindings source.
	*/
	function getBlockBindingsSource(name) {
		return unlock((0, _wordpress_data.select)(store)).getBlockBindingsSource(name);
	}
	/**
	* Returns all registered block bindings sources.
	*
	* @since 6.7.0 Introduced in WordPress core.
	*
	* @return Block bindings sources.
	*/
	function getBlockBindingsSources() {
		return unlock((0, _wordpress_data.select)(store)).getAllBlockBindingsSources();
	}

// packages/blocks/build-module/api/utils.mjs
	D$1([e, r]);
	/**
	* Array of icon colors containing a color to be used if the icon color
	* was not explicitly set but the icon background color was.
	*/
	const ICON_COLORS = ["#191e23", "#f8f9f9"];
	/**
	* Determines whether the block's attributes are equal to the default attributes
	* which means the block is unmodified.
	*
	* @param block Block Object.
	* @param role  Optional role to filter attributes for modification check.
	*
	* @return Whether the block is an unmodified block.
	*/
	function isUnmodifiedBlock(block, role) {
		const blockAttributes = getBlockType(block.name)?.attributes ?? {};
		const attributesByRole = role ? Object.entries(blockAttributes).filter(([key, definition]) => {
			if (role === "content" && key === "metadata") return Object.keys(block.attributes[key]?.bindings ?? {}).length > 0;
			return definition.role === role || definition.__experimentalRole === role;
		}) : [];
		return (!!attributesByRole.length ? attributesByRole : Object.entries(blockAttributes)).every(([key, definition]) => {
			const value = block.attributes[key];
			if (definition.hasOwnProperty("default")) return value === definition.default;
			if (definition.type === "rich-text") return !value?.length;
			return value === void 0;
		});
	}
	/**
	* Determines whether the block is a default block and its attributes are equal
	* to the default attributes which means the block is unmodified.
	*
	* @param block Block Object
	* @param role  Optional role to filter attributes for modification check.
	*
	* @return Whether the block is an unmodified default block.
	*/
	function isUnmodifiedDefaultBlock(block, role) {
		return block.name === getDefaultBlockName() && isUnmodifiedBlock(block, role);
	}
	/**
	* Function that checks if the parameter is a valid icon.
	*
	* @param icon Parameter to be checked.
	*
	* @return True if the parameter is a valid icon and false otherwise.
	*/
	function isValidIcon(icon) {
		return !!icon && (typeof icon === "string" || (0, _wordpress_element.isValidElement)(icon) || typeof icon === "function" || icon instanceof _wordpress_element.Component);
	}
	/**
	* Function that receives an icon as set by the blocks during the registration
	* and returns a new icon object that is normalized so we can rely on just on possible icon structure
	* in the codebase.
	*
	* @param icon Render behavior of a block type icon;
	*             one of a Dashicon slug, an element, or a component.
	*
	* @return Object describing the icon.
	*/
	function normalizeIconObject(icon) {
		const resolvedIcon = icon || "block-default";
		if (isValidIcon(resolvedIcon)) return { src: resolvedIcon };
		const iconDescriptor = resolvedIcon;
		if ("background" in iconDescriptor) {
			const colordBgColor = A$1(iconDescriptor.background);
			const getColorContrast = (iconColor) => colordBgColor.contrast(iconColor);
			const maxContrast = Math.max(...ICON_COLORS.map(getColorContrast));
			return {
				...iconDescriptor,
				foreground: iconDescriptor.foreground ? iconDescriptor.foreground : ICON_COLORS.find((iconColor) => getColorContrast(iconColor) === maxContrast),
				shadowColor: colordBgColor.alpha(.3).toRgbString()
			};
		}
		return iconDescriptor;
	}
	/**
	* Normalizes block type passed as param. When string is passed then
	* it converts it to the matching block type object.
	* It passes the original object otherwise.
	*
	* @param blockTypeOrName Block type or name.
	*
	* @return Block type.
	*/
	function normalizeBlockType(blockTypeOrName) {
		if (typeof blockTypeOrName === "string") return getBlockType(blockTypeOrName);
		return blockTypeOrName;
	}
	/**
	* Get the label for the block, usually this is either the block title,
	* or the value of the block's `label` function when that's specified.
	*
	* @param blockType  The block type.
	* @param attributes The values of the block's attributes.
	* @param context    The intended use for the label.
	*
	* @return The block label.
	*/
	function getBlockLabel(blockType, attributes, context = "visual") {
		const { __experimentalLabel: getLabel, title } = blockType;
		const label = getLabel && getLabel(attributes, { context });
		if (!label) return title;
		if (label.toPlainText) return label.toPlainText();
		return (0, _wordpress_dom.__unstableStripHTML)(label);
	}
	/**
	* Get a label for the block for use by screenreaders, this is more descriptive
	* than the visual label and includes the block title and the value of the
	* `getLabel` function if it's specified.
	*
	* @param blockType  The block type.
	* @param attributes The values of the block's attributes.
	* @param position   The position of the block in the block list.
	* @param direction  The direction of the block layout.
	*
	* @return The block label.
	*/
	function getAccessibleBlockLabel(blockType, attributes, position, direction = "vertical") {
		const title = blockType?.title ?? "";
		const label = blockType ? getBlockLabel(blockType, attributes, "accessibility") : "";
		const hasPosition = position !== void 0;
		const hasLabel = label && label !== title;
		if (hasPosition && direction === "vertical") {
			if (hasLabel) return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%1$s Block. Row %2$d. %3$s"), title, position, label);
			return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%1$s Block. Row %2$d"), title, position);
		} else if (hasPosition && direction === "horizontal") {
			if (hasLabel) return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%1$s Block. Column %2$d. %3$s"), title, position, label);
			return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%1$s Block. Column %2$d"), title, position);
		}
		if (hasLabel) return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%1$s Block. %2$s"), title, label);
		return (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s Block"), title);
	}
	function getDefault(attributeSchema) {
		if (attributeSchema.default !== void 0) return attributeSchema.default;
		if (attributeSchema.type === "rich-text") return new _wordpress_rich_text.RichTextData();
	}
	/**
	* Check if a block is registered.
	*
	* @param name The block's name.
	*
	* @return Whether the block is registered.
	*/
	function isBlockRegistered(name) {
		return getBlockType(name) !== void 0;
	}
	/**
	* Ensure attributes contains only values defined by block type, and merge
	* default values for missing attributes.
	*
	* @param name       The block's name.
	* @param attributes The block's attributes.
	* @return The sanitized attributes.
	*/
	function sanitizeBlockAttributes(name, attributes) {
		const blockType = getBlockType(name);
		if (void 0 === blockType) throw new Error(`Block type '${name}' is not registered.`);
		return Object.entries(blockType.attributes).reduce((accumulator, [key, schema]) => {
			const value = attributes[key];
			if (void 0 !== value) {
				if (schema.type === "rich-text") {
					if (value instanceof _wordpress_rich_text.RichTextData) accumulator[key] = value;
					else if (typeof value === "string") accumulator[key] = _wordpress_rich_text.RichTextData.fromHTMLString(value);
				} else if (schema.type === "string" && value instanceof _wordpress_rich_text.RichTextData) accumulator[key] = value.toHTMLString();
				else accumulator[key] = value;
			} else {
				const _default = getDefault(schema);
				if (void 0 !== _default) accumulator[key] = _default;
			}
			if (["node", "children"].indexOf(schema.source ?? "") !== -1) {
				if (typeof accumulator[key] === "string") accumulator[key] = [accumulator[key]];
				else if (!Array.isArray(accumulator[key])) accumulator[key] = [];
			}
			return accumulator;
		}, {});
	}
	function __experimentalSanitizeBlockAttributes(name, attributes) {
		(0, _wordpress_deprecated.default)("__experimentalSanitizeBlockAttributes", {
			since: "7.1",
			alternative: "sanitizeBlockAttributes"
		});
		return sanitizeBlockAttributes(name, attributes);
	}
	/**
	* Filter block attributes by `role` and return their names.
	*
	* @param name Block attribute's name.
	* @param role The role of a block attribute.
	*
	* @return The attribute names that have the provided role.
	*/
	function getBlockAttributesNamesByRole(name, role) {
		const attributes = getBlockType(name)?.attributes;
		if (!attributes) return [];
		const attributesNames = Object.keys(attributes);
		if (!role) return attributesNames;
		return attributesNames.filter((attributeName) => {
			const attribute = attributes[attributeName];
			if (attribute?.role === role) return true;
			if (attribute?.__experimentalRole === role) {
				(0, _wordpress_deprecated.default)("__experimentalRole attribute", {
					since: "6.7",
					version: "6.8",
					alternative: "role attribute",
					hint: `Check the block.json of the ${name} block.`
				});
				return true;
			}
			return false;
		});
	}
	const __experimentalGetBlockAttributesNamesByRole = (...args) => {
		(0, _wordpress_deprecated.default)("__experimentalGetBlockAttributesNamesByRole", {
			since: "6.7",
			version: "6.8",
			alternative: "getBlockAttributesNamesByRole"
		});
		return getBlockAttributesNamesByRole(...args);
	};
	/**
	* Checks if a block is a content block by examining its attributes.
	* A block is considered a content block if it has at least one attribute
	* with a role of 'content'.
	*
	* @param name The name of the block to check.
	* @return Whether the block is a content block.
	*/
	function isContentBlock(name) {
		const blockType = getBlockType(name);
		const attributes = blockType?.attributes;
		if ((blockType?.supports)?.contentRole) return true;
		if (!attributes) return false;
		return !!Object.keys(attributes)?.some((attributeKey) => {
			const attribute = attributes[attributeKey];
			return attribute?.role === "content" || attribute?.__experimentalRole === "content";
		});
	}
	/**
	* Return a new object with the specified keys omitted.
	*
	* @param object Original object.
	* @param keys   Keys to be omitted.
	*
	* @return Object with omitted keys.
	*/
	function omit(object, keys) {
		const keysArray = Array.isArray(keys) ? keys : [keys];
		return Object.fromEntries(Object.entries(object).filter(([key]) => !keysArray.includes(key)));
	}

// packages/blocks/build-module/store/reducer.mjs
/**
	* Default set of categories.
	*/
	const DEFAULT_CATEGORIES = [
		{
			slug: "text",
			title: (0, _wordpress_i18n.__)("Text")
		},
		{
			slug: "media",
			title: (0, _wordpress_i18n.__)("Media")
		},
		{
			slug: "design",
			title: (0, _wordpress_i18n.__)("Design")
		},
		{
			slug: "widgets",
			title: (0, _wordpress_i18n.__)("Widgets")
		},
		{
			slug: "theme",
			title: (0, _wordpress_i18n.__)("Theme")
		},
		{
			slug: "embed",
			title: (0, _wordpress_i18n.__)("Embeds")
		},
		{
			slug: "reusable",
			title: (0, _wordpress_i18n.__)("Reusable blocks")
		}
	];
	function keyBlockTypesByName(types) {
		return types.reduce((newBlockTypes, block) => ({
			...newBlockTypes,
			[block.name]: block
		}), {});
	}
	function getUniqueItemsByName(items) {
		return items.reduce((acc, currentItem) => {
			if (!acc.some((item) => item.name === currentItem.name)) acc.push(currentItem);
			return acc;
		}, []);
	}
	function bootstrappedBlockTypes(state = {}, action) {
		switch (action.type) {
			case "ADD_BOOTSTRAPPED_BLOCK_TYPE":
				const { name, blockType } = action;
				if (state[name]) return state;
				const newDefinition = Object.fromEntries(Object.entries(blockType).filter(([, value]) => value !== null && value !== void 0).map(([key, value]) => [camelCase(key), value]));
				newDefinition.name = name;
				return {
					...state,
					[name]: newDefinition
				};
			case "REMOVE_BLOCK_TYPES": return omit(state, action.names);
		}
		return state;
	}
	/**
	* Reducer managing the unprocessed block types in a form passed when registering the by block.
	* It's for internal use only. It allows recomputing the processed block types on-demand after block type filters
	* get added or removed.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function unprocessedBlockTypes(state = {}, action) {
		switch (action.type) {
			case "ADD_UNPROCESSED_BLOCK_TYPE": return {
				...state,
				[action.name]: action.blockType
			};
			case "REMOVE_BLOCK_TYPES": return omit(state, action.names);
		}
		return state;
	}
	/**
	* Reducer managing the processed block types with all filters applied.
	* The state is derived from the `unprocessedBlockTypes` reducer.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function blockTypes(state = {}, action) {
		switch (action.type) {
			case "ADD_BLOCK_TYPES": return {
				...state,
				...keyBlockTypesByName(action.blockTypes)
			};
			case "REMOVE_BLOCK_TYPES": return omit(state, action.names);
		}
		return state;
	}
	/**
	* Reducer managing the block styles.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function blockStyles(state = {}, action) {
		switch (action.type) {
			case "ADD_BLOCK_TYPES": return {
				...state,
				...Object.fromEntries(Object.entries(keyBlockTypesByName(action.blockTypes)).map(([name, blockType]) => [name, getUniqueItemsByName([...(blockType.styles ?? []).map((style) => ({
					...style,
					source: "block"
				})), ...(state[blockType.name] ?? []).filter(({ source }) => "block" !== source)])]))
			};
			case "ADD_BLOCK_STYLES":
				const updatedStyles = {};
				action.blockNames.forEach((blockName) => {
					updatedStyles[blockName] = getUniqueItemsByName([...state[blockName] ?? [], ...action.styles]);
				});
				return {
					...state,
					...updatedStyles
				};
			case "REMOVE_BLOCK_STYLES": return {
				...state,
				[action.blockName]: (state[action.blockName] ?? []).filter((style) => action.styleNames.indexOf(style.name) === -1)
			};
		}
		return state;
	}
	/**
	* Reducer managing the block variations.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function blockVariations(state = {}, action) {
		switch (action.type) {
			case "ADD_BLOCK_TYPES": return {
				...state,
				...Object.fromEntries(Object.entries(keyBlockTypesByName(action.blockTypes)).map(([name, blockType]) => {
					return [name, getUniqueItemsByName([...(blockType.variations ?? []).map((variation) => ({
						...variation,
						source: "block"
					})), ...(state[blockType.name] ?? []).filter(({ source }) => "block" !== source)])];
				}))
			};
			case "ADD_BLOCK_VARIATIONS": return {
				...state,
				[action.blockName]: getUniqueItemsByName([...state[action.blockName] ?? [], ...action.variations])
			};
			case "REMOVE_BLOCK_VARIATIONS": return {
				...state,
				[action.blockName]: (state[action.blockName] ?? []).filter((variation) => action.variationNames.indexOf(variation.name) === -1)
			};
		}
		return state;
	}
	/**
	* Higher-order Reducer creating a reducer keeping track of given block name.
	*
	* @param setActionType Action type.
	*
	* @return Reducer.
	*/
	function createBlockNameSetterReducer(setActionType) {
		return (state = null, action) => {
			switch (action.type) {
				case "REMOVE_BLOCK_TYPES":
					if (action.names.indexOf(state) !== -1) return null;
					return state;
				case setActionType: return action.name || null;
			}
			return state;
		};
	}
	const defaultBlockName = createBlockNameSetterReducer("SET_DEFAULT_BLOCK_NAME");
	const freeformFallbackBlockName = createBlockNameSetterReducer("SET_FREEFORM_FALLBACK_BLOCK_NAME");
	const unregisteredFallbackBlockName = createBlockNameSetterReducer("SET_UNREGISTERED_FALLBACK_BLOCK_NAME");
	const groupingBlockName = createBlockNameSetterReducer("SET_GROUPING_BLOCK_NAME");
	/**
	* Reducer managing the categories
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function categories(state = DEFAULT_CATEGORIES, action) {
		switch (action.type) {
			case "SET_CATEGORIES":
				const uniqueCategories = /* @__PURE__ */ new Map();
				(action.categories || []).forEach((category) => {
					uniqueCategories.set(category.slug, category);
				});
				return [...uniqueCategories.values()];
			case "UPDATE_CATEGORY":
				if (!action.category || !Object.keys(action.category).length) return state;
				if (state.find(({ slug }) => slug === action.slug)) return state.map((category) => {
					if (category.slug === action.slug) return {
						...category,
						...action.category
					};
					return category;
				});
		}
		return state;
	}
	function collections(state = {}, action) {
		switch (action.type) {
			case "ADD_BLOCK_COLLECTION": return {
				...state,
				[action.namespace]: {
					title: action.title,
					icon: action.icon
				}
			};
			case "REMOVE_BLOCK_COLLECTION": return omit(state, action.namespace);
		}
		return state;
	}
	/**
	* Merges usesContext with existing values, potentially defined in the server registration.
	*
	* @param existingUsesContext Existing `usesContext`.
	* @param newUsesContext      Newly added `usesContext`.
	* @return Merged `usesContext`.
	*/
	function getMergedUsesContext(existingUsesContext = [], newUsesContext = []) {
		const mergedArrays = Array.from(new Set(existingUsesContext.concat(newUsesContext)));
		return mergedArrays.length > 0 ? mergedArrays : void 0;
	}
	function blockBindingsSources(state = {}, action) {
		switch (action.type) {
			case "ADD_BLOCK_BINDINGS_SOURCE": return {
				...state,
				[action.name]: {
					label: action.label || state[action.name]?.label,
					usesContext: getMergedUsesContext(state[action.name]?.usesContext, action.usesContext),
					getValues: action.getValues,
					setValues: action.setValues,
					canUserEditValue: action.setValues && action.canUserEditValue,
					getFieldsList: action.getFieldsList
				}
			};
			case "REMOVE_BLOCK_BINDINGS_SOURCE": return omit(state, action.name);
		}
		return state;
	}
	var reducer_default = (0, _wordpress_data.combineReducers)({
		bootstrappedBlockTypes,
		unprocessedBlockTypes,
		blockTypes,
		blockStyles,
		blockVariations,
		defaultBlockName,
		freeformFallbackBlockName,
		unregisteredFallbackBlockName,
		groupingBlockName,
		categories,
		collections,
		blockBindingsSources
	});

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

// node_modules/.store/fast-deep-equal@3.1.3-Dk0kpzcWCOUHE1bkOO2LLA/node_modules/fast-deep-equal/es6/index.js
	var require_es6 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = function equal(a, b) {
			if (a === b) return true;
			if (a && b && typeof a == "object" && typeof b == "object") {
				if (a.constructor !== b.constructor) return false;
				var length, i, keys;
				if (Array.isArray(a)) {
					length = a.length;
					if (length != b.length) return false;
					for (i = length; i-- !== 0;) if (!equal(a[i], b[i])) return false;
					return true;
				}
				if (a instanceof Map && b instanceof Map) {
					if (a.size !== b.size) return false;
					for (i of a.entries()) if (!b.has(i[0])) return false;
					for (i of a.entries()) if (!equal(i[1], b.get(i[0]))) return false;
					return true;
				}
				if (a instanceof Set && b instanceof Set) {
					if (a.size !== b.size) return false;
					for (i of a.entries()) if (!b.has(i[0])) return false;
					return true;
				}
				if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
					length = a.length;
					if (length != b.length) return false;
					for (i = length; i-- !== 0;) if (a[i] !== b[i]) return false;
					return true;
				}
				if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
				if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
				if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
				keys = Object.keys(a);
				length = keys.length;
				if (length !== Object.keys(b).length) return false;
				for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
				for (i = length; i-- !== 0;) {
					var key = keys[i];
					if (!equal(a[key], b[key])) return false;
				}
				return true;
			}
			return a !== a && b !== b;
		};
	}));

// packages/blocks/build-module/store/utils.mjs
var import_remove_accents = /* @__PURE__ */ __toESM(require_remove_accents(), 1);
var import_es6 = /* @__PURE__ */ __toESM(require_es6(), 1);
/**
	* Helper util to return a value from a certain path of the object.
	* Path is specified as either:
	* - a string of properties, separated by dots, for example: "x.y".
	* - an array of properties, for example `[ 'x', 'y' ]`.
	* You can also specify a default value in case the result is nullish.
	*
	* @param object       Input object.
	* @param path         Path to the object property.
	* @param defaultValue Default value if the value at the specified path is nullish.
	* @return Value of the object property at the specified path.
	*/
	const getValueFromObjectPath = (object, path, defaultValue) => {
		const normalizedPath = Array.isArray(path) ? path : path.split(".");
		let value = object;
		normalizedPath.forEach((fieldName) => {
			value = value?.[fieldName];
		});
		return value ?? defaultValue;
	};
	function isObject$1(candidate) {
		return typeof candidate === "object" && candidate !== null && candidate.constructor === Object;
	}
	/**
	* Determine whether a set of object properties matches a given object.
	*
	* Given an object of block attributes and an object of variation attributes,
	* this function checks recursively whether all the variation attributes are
	* present in the block attributes object.
	*
	* @param blockAttributes     The object to inspect.
	* @param variationAttributes The object of property values to match.
	* @return Whether the block attributes match the variation attributes.
	*/
	function matchesAttributes(blockAttributes, variationAttributes) {
		if (isObject$1(blockAttributes) && isObject$1(variationAttributes)) return Object.entries(variationAttributes).every(([key, value]) => matchesAttributes(blockAttributes?.[key], value));
		return blockAttributes === variationAttributes;
	}

// packages/blocks/build-module/store/private-selectors.mjs
	var private_selectors_exports = /* @__PURE__ */ __exportAll({
		getAllBlockBindingsSources: () => getAllBlockBindingsSources,
		getBlockBindingsSource: () => getBlockBindingsSource$1,
		getBlockBindingsSourceFieldsList: () => getBlockBindingsSourceFieldsList,
		getBlockKeyboardShortcuts: () => getBlockKeyboardShortcuts,
		getBlockVariationsRaw: () => getBlockVariationsRaw,
		getBootstrappedBlockType: () => getBootstrappedBlockType,
		getSupportedStyles: () => getSupportedStyles,
		getUnprocessedBlockTypes: () => getUnprocessedBlockTypes,
		hasContentRoleAttribute: () => hasContentRoleAttribute
	}, 1);
	const ROOT_BLOCK_SUPPORTS = [
		"background",
		"backgroundColor",
		"color",
		"linkColor",
		"captionColor",
		"buttonColor",
		"headingColor",
		"fontFamily",
		"fontSize",
		"fontStyle",
		"fontWeight",
		"lineHeight",
		"padding",
		"contentSize",
		"wideSize",
		"blockGap",
		"textAlign",
		"textDecoration",
		"textIndent",
		"textTransform",
		"textShadow",
		"letterSpacing"
	];
	const ELEMENT_BLOCK_SUPPORTS = [
		...ROOT_BLOCK_SUPPORTS,
		"backgroundGradient",
		"backgroundImage",
		"backgroundSize",
		"borderColor",
		"borderRadius",
		"borderStyle",
		"borderWidth",
		"margin",
		"shadow",
		"writingMode"
	];
	/**
	* Filters the list of supported styles for a given element.
	*
	* @param blockSupports list of supported styles.
	* @param name          block name.
	* @param element       element name.
	*
	* @return filtered list of supported styles.
	*/
	function filterElementBlockSupports(blockSupports, name, element) {
		return blockSupports.filter((support) => {
			if (support === "fontSize" && element === "heading") return false;
			if (support === "textDecoration" && !name && element !== "link") return false;
			if (support === "textTransform" && !name && !([
				"heading",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6"
			].includes(element) || element === "button" || element === "caption" || element === "text")) return false;
			if (support === "letterSpacing" && !name && !([
				"heading",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6"
			].includes(element) || element === "button" || element === "caption" || element === "text")) return false;
			if (support === "textIndent" && !name) return false;
			if (support === "textColumns" && !name) return false;
			const isElement = !name && !!element && element in __EXPERIMENTAL_ELEMENTS;
			if ([
				"blockGap",
				"contentSize",
				"wideSize"
			].includes(support) && isElement) return false;
			return true;
		});
	}
	/**
	* Returns the list of supported styles for a given block name and element.
	*/
	const getSupportedStyles = (0, _wordpress_data.createSelector)((state, name, element) => {
		if (!name) return filterElementBlockSupports(!!element && element in __EXPERIMENTAL_ELEMENTS ? ELEMENT_BLOCK_SUPPORTS : ROOT_BLOCK_SUPPORTS, name, element);
		const blockType = getBlockType$1(state, name);
		if (!blockType) return [];
		const supportKeys = [];
		const supports = blockType?.supports;
		if ((supports?.spacing)?.blockGap) supportKeys.push("blockGap");
		if (supports?.shadow) supportKeys.push("shadow");
		const stylePropertyMap = __EXPERIMENTAL_STYLE_PROPERTY;
		Object.keys(stylePropertyMap).forEach((styleName) => {
			if (!stylePropertyMap[styleName].support) return;
			if (stylePropertyMap[styleName].requiresOptOut) {
				if (supports && stylePropertyMap[styleName].support[0] in supports && getValueFromObjectPath(supports, stylePropertyMap[styleName].support) !== false) {
					supportKeys.push(styleName);
					return;
				}
			}
			if (supports && getValueFromObjectPath(supports, stylePropertyMap[styleName].support, false)) supportKeys.push(styleName);
		});
		return filterElementBlockSupports(supportKeys, name, element);
	}, (state, name) => [state.blockTypes[name]]);
	/**
	* Returns the bootstrapped block type metadata for a give block name.
	*
	* @param state Data state.
	* @param name  Block name.
	*
	* @return Bootstrapped block type metadata for a block.
	*/
	function getBootstrappedBlockType(state, name) {
		return state.bootstrappedBlockTypes[name];
	}
	/**
	* Returns all the unprocessed (before applying the `registerBlockType` filter)
	* block type settings as passed during block registration.
	*
	* @param state Data state.
	*
	* @return Unprocessed block type settings for all blocks.
	*/
	function getUnprocessedBlockTypes(state) {
		return state.unprocessedBlockTypes;
	}
	/**
	* Returns the registered block variations of every block type, keyed by block
	* name. The reference changes whenever a variation is added or removed, so it
	* can serve as a cache dependency.
	*
	* @param state Data state.
	*
	* @return Block variations keyed by block name.
	*/
	function getBlockVariationsRaw(state) {
		return state.blockVariations;
	}
	/**
	* Returns all the block bindings sources registered.
	*
	* @param state Data state.
	*
	* @return All the registered sources and their properties.
	*/
	function getAllBlockBindingsSources(state) {
		return state.blockBindingsSources;
	}
	/**
	* Returns a specific block bindings source.
	*
	* @param state      Data state.
	* @param sourceName Name of the source to get.
	*
	* @return The specific block binding source and its properties.
	*/
	function getBlockBindingsSource$1(state, sourceName) {
		return state.blockBindingsSources[sourceName];
	}
	/**
	* Compute the fields list for a specific block bindings source.
	*
	* @param state        Data state.
	* @param source       Block bindings source.
	* @param blockContext Block context.
	*
	* @return List of fields for the specific source.
	*/
	const getBlockBindingsSourceFieldsList = (0, _wordpress_data.createRegistrySelector)((select) => (0, _wordpress_data.createSelector)((state, source, blockContext) => {
		if (!source.getFieldsList) return [];
		const context = {};
		if (source?.usesContext?.length) for (const key of source.usesContext) context[key] = blockContext[key];
		return source.getFieldsList({
			select,
			context
		});
	}, (state, source, blockContext) => [
		source.getFieldsList,
		source.usesContext,
		blockContext
	]));
	/**
	* Returns every keyboard shortcut declared by a registered block type, through
	* either a block variation or a block transform.
	*
	* @param state Data state.
	*
	* @return The declared shortcuts, each paired with the block change it makes.
	*/
	const getBlockKeyboardShortcuts = (0, _wordpress_data.createSelector)((state) => {
		const shortcuts = [];
		for (const blockName of Object.keys(state.blockTypes)) {
			for (const variation of state.blockVariations[blockName] ?? []) {
				if (!variation.shortcut) continue;
				shortcuts.push({
					...variation.shortcut,
					targetBlockName: blockName,
					blockNames: [blockName],
					variationName: variation.name
				});
			}
			const transforms = state.blockTypes[blockName]?.transforms;
			for (const transform of transforms?.to ?? []) {
				if (transform.type !== "block") continue;
				const targetBlockName = transform.blocks?.[0];
				if (!targetBlockName) continue;
				for (const shortcut of transform.shortcuts ?? []) shortcuts.push({
					...shortcut,
					targetBlockName,
					blockNames: [blockName],
					variationName: shortcut.variationName ?? transform.variationName
				});
			}
			for (const transform of transforms?.from ?? []) {
				if (transform.type !== "block" || !transform.blocks?.length) continue;
				for (const shortcut of transform.shortcuts ?? []) shortcuts.push({
					...shortcut,
					targetBlockName: blockName,
					blockNames: transform.blocks,
					variationName: shortcut.variationName ?? transform.variationName
				});
			}
		}
		return shortcuts;
	}, (state) => [state.blockTypes, state.blockVariations]);
	/**
	* Determines if any of the block type's attributes have
	* the content role attribute.
	*
	* @param state         Data state.
	* @param blockTypeName Block type name.
	* @return Whether block type has content role attribute.
	*/
	const hasContentRoleAttribute = (state, blockTypeName) => {
		const blockType = getBlockType$1(state, blockTypeName);
		if (!blockType) return false;
		return Object.values(blockType.attributes).some(({ role, __experimentalRole }) => {
			if (role === "content") return true;
			if (__experimentalRole === "content") {
				(0, _wordpress_deprecated.default)("__experimentalRole attribute", {
					since: "6.7",
					version: "6.8",
					alternative: "role attribute",
					hint: `Check the block.json of the ${blockTypeName} block.`
				});
				return true;
			}
			return false;
		});
	};

// packages/blocks/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		__experimentalHasContentRoleAttribute: () => __experimentalHasContentRoleAttribute,
		getActiveBlockVariation: () => getActiveBlockVariation,
		getBlockStyles: () => getBlockStyles,
		getBlockSupport: () => getBlockSupport$1,
		getBlockType: () => getBlockType$1,
		getBlockTypes: () => getBlockTypes$1,
		getBlockVariations: () => getBlockVariations$1,
		getCategories: () => getCategories$1,
		getChildBlockNames: () => getChildBlockNames$1,
		getCollections: () => getCollections,
		getDefaultBlockName: () => getDefaultBlockName$1,
		getDefaultBlockVariation: () => getDefaultBlockVariation,
		getFreeformFallbackBlockName: () => getFreeformFallbackBlockName,
		getGroupingBlockName: () => getGroupingBlockName$1,
		getUnregisteredFallbackBlockName: () => getUnregisteredFallbackBlockName,
		hasBlockSupport: () => hasBlockSupport$1,
		hasChildBlocks: () => hasChildBlocks$1,
		hasChildBlocksWithInserterSupport: () => hasChildBlocksWithInserterSupport$1,
		isMatchingSearchTerm: () => isMatchingSearchTerm
	}, 1);
	/**
	* Given a block name or block type object, returns the corresponding
	* normalized block type object.
	*
	* @param state      Blocks state.
	* @param nameOrType Block name or type object
	*
	* @return Block type object.
	*/
	const getNormalizedBlockType = (state, nameOrType) => "string" === typeof nameOrType ? getBlockType$1(state, nameOrType) : nameOrType;
	/**
	* Returns all the available block types.
	*
	* @param state Data state.
	*
	* @example
	* ```js
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const blockTypes = useSelect(
	*         ( select ) => select( blocksStore ).getBlockTypes(),
	*         []
	*     );
	*
	*     return (
	*         <ul>
	*             { blockTypes.map( ( block ) => (
	*                 <li key={ block.name }>{ block.title }</li>
	*             ) ) }
	*         </ul>
	*     );
	* };
	* ```
	*
	* @return Block Types.
	*/
	const getBlockTypes$1 = (0, _wordpress_data.createSelector)((state) => Object.values(state.blockTypes), (state) => [state.blockTypes]);
	/**
	* Returns a block type by name.
	*
	* @param state Data state.
	* @param name  Block type name.
	*
	* @example
	* ```js
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const paragraphBlock = useSelect( ( select ) =>
	*         ( select ) => select( blocksStore ).getBlockType( 'core/paragraph' ),
	*         []
	*     );
	*
	*     return (
	*         <ul>
	*             { paragraphBlock &&
	*                 Object.entries( paragraphBlock.supports ).map(
	*                     ( blockSupportsEntry ) => {
	*                         const [ propertyName, value ] = blockSupportsEntry;
	*                         return (
	*                             <li
	*                                 key={ propertyName }
	*                             >{ `${ propertyName } : ${ value }` }</li>
	*                         );
	*                     }
	*                 ) }
	*         </ul>
	*     );
	* };
	* ```
	*
	* @return Block Type.
	*/
	function getBlockType$1(state, name) {
		return state.blockTypes[name];
	}
	/**
	* Returns block styles by block name.
	*
	* @param state Data state.
	* @param name  Block type name.
	*
	* @example
	* ```js
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const buttonBlockStyles = useSelect( ( select ) =>
	*         select( blocksStore ).getBlockStyles( 'core/button' ),
	*         []
	*     );
	*
	*     return (
	*         <ul>
	*             { buttonBlockStyles &&
	*                 buttonBlockStyles.map( ( style ) => (
	*                     <li key={ style.name }>{ style.label }</li>
	*                 ) ) }
	*         </ul>
	*     );
	* };
	* ```
	*
	* @return Block Styles.
	*/
	function getBlockStyles(state, name) {
		return state.blockStyles[name];
	}
	/**
	* Returns block variations by block name.
	*
	* @param state     Data state.
	* @param blockName Block type name.
	* @param scope     Block variation scope name.
	*
	* @example
	* ```js
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const socialLinkVariations = useSelect( ( select ) =>
	*         select( blocksStore ).getBlockVariations( 'core/social-link' ),
	*         []
	*     );
	*
	*     return (
	*         <ul>
	*             { socialLinkVariations &&
	*                 socialLinkVariations.map( ( variation ) => (
	*                     <li key={ variation.name }>{ variation.title }</li>
	*             ) ) }
	*     </ul>
	*     );
	* };
	* ```
	*
	* @return Block variations.
	*/
	const getBlockVariations$1 = (0, _wordpress_data.createSelector)((state, blockName, scope) => {
		const variations = state.blockVariations[blockName];
		if (!variations || !scope) return variations;
		return variations.filter((variation) => {
			return (variation.scope || ["block", "inserter"]).includes(scope);
		});
	}, (state, blockName) => [state.blockVariations[blockName]]);
	/**
	* Returns the active block variation for a given block based on its attributes.
	* Variations are determined by their `isActive` property.
	* Which is either an array of block attribute keys or a function.
	*
	* In case of an array of block attribute keys, the `attributes` are compared
	* to the variation's attributes using strict equality check.
	*
	* In case of function type, the function should accept a block's attributes
	* and the variation's attributes and determines if a variation is active.
	* A function that accepts a block's attributes and the variation's attributes and determines if a variation is active.
	*
	* @param state        Data state.
	* @param blockName    Name of block (example: "core/columns").
	* @param attributes   Block attributes used to determine active variation.
	* @param scope        Block variation scope name.
	* @param innerContent Block inner content used to determine the active
	*                     variation for blocks (such as the Custom HTML block)
	*                     whose variations declare static inner content.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { store as blockEditorStore } from '@wordpress/block-editor';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     // This example assumes that a core/embed block is the first block in the Block Editor.
	*     const activeBlockVariation = useSelect( ( select ) => {
	*         // Retrieve the list of blocks.
	*         const [ firstBlock ] = select( blockEditorStore ).getBlocks()
	*
	*         // Return the active block variation for the first block.
	*         return select( blocksStore ).getActiveBlockVariation(
	*             firstBlock.name,
	*             firstBlock.attributes
	*         );
	*     }, [] );
	*
	*     return activeBlockVariation && activeBlockVariation.name === 'spotify' ? (
	*         <p>{ __( 'Spotify variation' ) }</p>
	*         ) : (
	*         <p>{ __( 'Other variation' ) }</p>
	*     );
	* };
	* ```
	*
	* @return Active block variation.
	*/
	function getActiveBlockVariation(state, blockName, attributes, scope, innerContent) {
		const variations = getBlockVariations$1(state, blockName, scope);
		if (!variations) return variations;
		if (innerContent) {
			const innerContentMatch = variations.find((variation) => variation.innerContent && (0, import_es6.default)(variation.innerContent, innerContent));
			if (innerContentMatch) return innerContentMatch;
		}
		const blockType = getBlockType$1(state, blockName);
		const attributeKeys = Object.keys(blockType?.attributes || {});
		let match;
		let maxMatchedAttributes = 0;
		for (const variation of variations) {
			if (variation.innerContent) continue;
			if (Array.isArray(variation.isActive)) {
				const definedAttributes = variation.isActive.filter((attribute) => {
					const topLevelAttribute = attribute.split(".")[0];
					return attributeKeys.includes(topLevelAttribute);
				});
				const definedAttributesLength = definedAttributes.length;
				if (definedAttributesLength === 0) continue;
				if (definedAttributes.every((attribute) => {
					const variationAttributeValue = getValueFromObjectPath(variation.attributes, attribute);
					if (variationAttributeValue === void 0) return false;
					let blockAttributeValue = getValueFromObjectPath(attributes, attribute);
					if (blockAttributeValue instanceof _wordpress_rich_text.RichTextData) blockAttributeValue = blockAttributeValue.toHTMLString();
					return matchesAttributes(blockAttributeValue, variationAttributeValue);
				}) && definedAttributesLength > maxMatchedAttributes) {
					match = variation;
					maxMatchedAttributes = definedAttributesLength;
				}
			} else if (variation.isActive?.(attributes, variation.attributes)) return match || variation;
		}
		if (!match && ["block", "transform"].includes(scope)) match = variations.find((variation) => variation?.isDefault && !Object.hasOwn(variation, "isActive"));
		return match;
	}
	/**
	* Returns the default block variation for the given block type.
	* When there are multiple variations annotated as the default one,
	* the last added item is picked. This simplifies registering overrides.
	* When there is no default variation set, it returns the first item.
	*
	* @param state     Data state.
	* @param blockName Block type name.
	* @param scope     Block variation scope name.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const defaultEmbedBlockVariation = useSelect( ( select ) =>
	*         select( blocksStore ).getDefaultBlockVariation( 'core/embed' ),
	*         []
	*     );
	*
	*     return (
	*         defaultEmbedBlockVariation && (
	*             <p>
	*                 { sprintf(
	*                     __( 'core/embed default variation: %s' ),
	*                     defaultEmbedBlockVariation.title
	*                 ) }
	*             </p>
	*         )
	*     );
	* };
	* ```
	*
	* @return The default block variation.
	*/
	function getDefaultBlockVariation(state, blockName, scope) {
		const variations = getBlockVariations$1(state, blockName, scope);
		return [...variations || []].reverse().find(({ isDefault }) => !!isDefault) || variations?.[0];
	}
	/**
	* Returns all the available block categories.
	*
	* @param state Data state.
	*
	* @example
	* ```js
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect, } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const blockCategories = useSelect( ( select ) =>
	*         select( blocksStore ).getCategories(),
	*         []
	*     );
	*
	*     return (
	*         <ul>
	*             { blockCategories.map( ( category ) => (
	*                 <li key={ category.slug }>{ category.title }</li>
	*             ) ) }
	*         </ul>
	*     );
	* };
	* ```
	*
	* @return Categories list.
	*/
	function getCategories$1(state) {
		return state.categories;
	}
	/**
	* Returns all the available collections.
	*
	* @param state Data state.
	*
	* @example
	* ```js
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const blockCollections = useSelect( ( select ) =>
	*         select( blocksStore ).getCollections(),
	*         []
	*     );
	*
	*     return (
	*         <ul>
	*             { Object.values( blockCollections ).length > 0 &&
	*                 Object.values( blockCollections ).map( ( collection ) => (
	*                     <li key={ collection.title }>{ collection.title }</li>
	*             ) ) }
	*         </ul>
	*     );
	* };
	* ```
	*
	* @return Collections list.
	*/
	function getCollections(state) {
		return state.collections;
	}
	/**
	* Returns the name of the default block name.
	*
	* @param state Data state.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const defaultBlockName = useSelect( ( select ) =>
	*         select( blocksStore ).getDefaultBlockName(),
	*         []
	*     );
	*
	*     return (
	*         defaultBlockName && (
	*             <p>
	*                 { sprintf( __( 'Default block name: %s' ), defaultBlockName ) }
	*             </p>
	*         )
	*     );
	* };
	* ```
	*
	* @return Default block name.
	*/
	function getDefaultBlockName$1(state) {
		return state.defaultBlockName;
	}
	/**
	* Returns the name of the block for handling non-block content.
	*
	* @param state Data state.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const freeformFallbackBlockName = useSelect( ( select ) =>
	*         select( blocksStore ).getFreeformFallbackBlockName(),
	*         []
	*     );
	*
	*     return (
	*         freeformFallbackBlockName && (
	*             <p>
	*                 { sprintf( __(
	*                     'Freeform fallback block name: %s' ),
	*                     freeformFallbackBlockName
	*                 ) }
	*             </p>
	*         )
	*     );
	* };
	* ```
	*
	* @return Name of the block for handling non-block content.
	*/
	function getFreeformFallbackBlockName(state) {
		return state.freeformFallbackBlockName;
	}
	/**
	* Returns the name of the block for handling unregistered blocks.
	*
	* @param state Data state.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const unregisteredFallbackBlockName = useSelect( ( select ) =>
	*         select( blocksStore ).getUnregisteredFallbackBlockName(),
	*         []
	*     );
	*
	*     return (
	*         unregisteredFallbackBlockName && (
	*             <p>
	*                 { sprintf( __(
	*                     'Unregistered fallback block name: %s' ),
	*                     unregisteredFallbackBlockName
	*                 ) }
	*             </p>
	*         )
	*     );
	* };
	* ```
	*
	* @return Name of the block for handling unregistered blocks.
	*/
	function getUnregisteredFallbackBlockName(state) {
		return state.unregisteredFallbackBlockName;
	}
	/**
	* Returns the name of the block for handling the grouping of blocks.
	*
	* @param state Data state.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const groupingBlockName = useSelect( ( select ) =>
	*         select( blocksStore ).getGroupingBlockName(),
	*         []
	*     );
	*
	*     return (
	*         groupingBlockName && (
	*             <p>
	*                 { sprintf(
	*                     __( 'Default grouping block name: %s' ),
	*                     groupingBlockName
	*                 ) }
	*             </p>
	*         )
	*     );
	* };
	* ```
	*
	* @return Name of the block for handling the grouping of blocks.
	*/
	function getGroupingBlockName$1(state) {
		return state.groupingBlockName;
	}
	/**
	* Returns an array with the child blocks of a given block.
	*
	* @param state     Data state.
	* @param blockName Block type name.
	*
	* @example
	* ```js
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const childBlockNames = useSelect( ( select ) =>
	*         select( blocksStore ).getChildBlockNames( 'core/navigation' ),
	*         []
	*     );
	*
	*     return (
	*         <ul>
	*             { childBlockNames &&
	*                 childBlockNames.map( ( child ) => (
	*                     <li key={ child }>{ child }</li>
	*             ) ) }
	*         </ul>
	*     );
	* };
	* ```
	*
	* @return Array of child block names.
	*/
	const getChildBlockNames$1 = (0, _wordpress_data.createSelector)((state, blockName) => {
		return getBlockTypes$1(state).filter((blockType) => {
			return blockType.parent?.includes(blockName);
		}).map(({ name }) => name);
	}, (state) => [state.blockTypes]);
	/**
	* Returns the block support value for a feature, if defined.
	*
	* @param state           Data state.
	* @param nameOrType      Block name or type object
	* @param feature         Feature to retrieve
	* @param defaultSupports Default value to return if not
	*                        explicitly defined
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const paragraphBlockSupportValue = useSelect( ( select ) =>
	*         select( blocksStore ).getBlockSupport( 'core/paragraph', 'anchor' ),
	*         []
	*     );
	*
	*     return (
	*         <p>
	*             { sprintf(
	*                 __( 'core/paragraph supports.anchor value: %s' ),
	*                 paragraphBlockSupportValue
	*             ) }
	*         </p>
	*     );
	* };
	* ```
	*
	* @return Block support value
	*/
	const getBlockSupport$1 = (state, nameOrType, feature, defaultSupports) => {
		const blockType = getNormalizedBlockType(state, nameOrType);
		if (!blockType?.supports) return defaultSupports;
		return getValueFromObjectPath(blockType.supports, feature, defaultSupports);
	};
	/**
	* Returns true if the block defines support for a feature, or false otherwise.
	*
	* @param state           Data state.
	* @param nameOrType      Block name or type object.
	* @param feature         Feature to test.
	* @param defaultSupports Whether feature is supported by
	*                        default if not explicitly defined.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const paragraphBlockSupportClassName = useSelect( ( select ) =>
	*         select( blocksStore ).hasBlockSupport( 'core/paragraph', 'className' ),
	*         []
	*     );
	*
	*     return (
	*         <p>
	*             { sprintf(
	*                 __( 'core/paragraph supports custom class name?: %s' ),
	*                 paragraphBlockSupportClassName
	*             ) }
	*         /p>
	*     );
	* };
	* ```
	*
	* @return Whether block supports feature.
	*/
	function hasBlockSupport$1(state, nameOrType, feature, defaultSupports) {
		return !!getBlockSupport$1(state, nameOrType, feature, defaultSupports);
	}
	/**
	* Normalizes a search term string: removes accents, converts to lowercase, removes extra whitespace.
	*
	* @param term Search term to normalize.
	* @return Normalized search term.
	*/
	function getNormalizedSearchTerm(term) {
		return (0, import_remove_accents.default)(term ?? "").toLowerCase().trim();
	}
	/**
	* Returns true if the block type by the given name or object value matches a
	* search term, or false otherwise.
	*
	* @param state      Blocks state.
	* @param nameOrType Block name or type object.
	* @param searchTerm Search term by which to filter.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const termFound = useSelect(
	*         ( select ) =>
	*             select( blocksStore ).isMatchingSearchTerm(
	*                 'core/navigation',
	*                 'theme'
	*             ),
	*             []
	*         );
	*
	*     return (
	*         <p>
	*             { sprintf(
	*                 __(
	*                     'Search term was found in the title, keywords, category or description in block.json: %s'
	*                 ),
	*                 termFound
	*             ) }
	*         </p>
	*     );
	* };
	* ```
	*
	* @return Whether block type matches search term.
	*/
	function isMatchingSearchTerm(state, nameOrType, searchTerm = "") {
		const blockType = getNormalizedBlockType(state, nameOrType);
		const normalizedSearchTerm = getNormalizedSearchTerm(searchTerm);
		const isSearchMatch = (candidate) => getNormalizedSearchTerm(candidate).includes(normalizedSearchTerm);
		return isSearchMatch(blockType?.title) || blockType?.keywords?.some(isSearchMatch) || isSearchMatch(blockType?.category) || typeof blockType?.description === "string" && isSearchMatch(blockType.description);
	}
	/**
	* Returns a boolean indicating if a block has child blocks or not.
	*
	* @param state     Data state.
	* @param blockName Block type name.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const navigationBlockHasChildBlocks = useSelect( ( select ) =>
	*         select( blocksStore ).hasChildBlocks( 'core/navigation' ),
	*         []
	*     );
	*
	*     return (
	*         <p>
	*             { sprintf(
	*                 __( 'core/navigation has child blocks: %s' ),
	*                 navigationBlockHasChildBlocks
	*             ) }
	*         </p>
	*     );
	* };
	* ```
	*
	* @return True if a block contains child blocks and false otherwise.
	*/
	const hasChildBlocks$1 = (state, blockName) => {
		return getChildBlockNames$1(state, blockName).length > 0;
	};
	/**
	* Returns a boolean indicating if a block has at least one child block with inserter support.
	*
	* @param state     Data state.
	* @param blockName Block type name.
	*
	* @example
	* ```js
	* import { __, sprintf } from '@wordpress/i18n';
	* import { store as blocksStore } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const navigationBlockHasChildBlocksWithInserterSupport = useSelect( ( select ) =>
	*         select( blocksStore ).hasChildBlocksWithInserterSupport(
	*             'core/navigation'
	*         ),
	*         []
	*     );
	*
	*     return (
	*         <p>
	*             { sprintf(
	*                 __( 'core/navigation has child blocks with inserter support: %s' ),
	*                 navigationBlockHasChildBlocksWithInserterSupport
	*             ) }
	*         </p>
	*     );
	* };
	* ```
	*
	* @return True if a block contains at least one child blocks with inserter support
	*                   and false otherwise.
	*/
	const hasChildBlocksWithInserterSupport$1 = (state, blockName) => {
		return getChildBlockNames$1(state, blockName).some((childBlockName) => {
			return hasBlockSupport$1(state, childBlockName, "inserter", true);
		});
	};
	const __experimentalHasContentRoleAttribute = (...args) => {
		(0, _wordpress_deprecated.default)("__experimentalHasContentRoleAttribute", {
			since: "6.7",
			version: "6.8",
			hint: "This is a private selector."
		});
		return hasContentRoleAttribute(...args);
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

// node_modules/.store/react-is@19.3.0-h9DBeE4BCfrMSfxZZXEDFw/node_modules/react-is/cjs/react-is.development.js
/**
	* @license React
	* react-is.development.js
	*
	* Copyright (c) Meta Platforms, Inc. and affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var require_react_is_development = /* @__PURE__ */ __commonJSMin(((exports) => {
		(function() {
			function typeOf(object) {
				if ("object" === typeof object && null !== object) {
					var $$typeof = object.$$typeof;
					switch ($$typeof) {
						case REACT_ELEMENT_TYPE: switch (object = object.type, object) {
							case REACT_FRAGMENT_TYPE:
							case REACT_PROFILER_TYPE:
							case REACT_STRICT_MODE_TYPE:
							case REACT_SUSPENSE_TYPE:
							case REACT_SUSPENSE_LIST_TYPE:
							case REACT_VIEW_TRANSITION_TYPE: return object;
							default: switch (object = object && object.$$typeof, object) {
								case REACT_CONTEXT_TYPE:
								case REACT_FORWARD_REF_TYPE:
								case REACT_LAZY_TYPE:
								case REACT_MEMO_TYPE: return object;
								case REACT_CONSUMER_TYPE: return object;
								default: return $$typeof;
							}
						}
						case REACT_PORTAL_TYPE: return $$typeof;
					}
				}
			}
			var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
			exports.ContextConsumer = REACT_CONSUMER_TYPE;
			exports.ContextProvider = REACT_CONTEXT_TYPE;
			exports.Element = REACT_ELEMENT_TYPE;
			exports.ForwardRef = REACT_FORWARD_REF_TYPE;
			exports.Fragment = REACT_FRAGMENT_TYPE;
			exports.Lazy = REACT_LAZY_TYPE;
			exports.Memo = REACT_MEMO_TYPE;
			exports.Portal = REACT_PORTAL_TYPE;
			exports.Profiler = REACT_PROFILER_TYPE;
			exports.StrictMode = REACT_STRICT_MODE_TYPE;
			exports.Suspense = REACT_SUSPENSE_TYPE;
			exports.SuspenseList = REACT_SUSPENSE_LIST_TYPE;
			exports.isContextConsumer = function(object) {
				return typeOf(object) === REACT_CONSUMER_TYPE;
			};
			exports.isContextProvider = function(object) {
				return typeOf(object) === REACT_CONTEXT_TYPE;
			};
			exports.isElement = function(object) {
				return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
			};
			exports.isForwardRef = function(object) {
				return typeOf(object) === REACT_FORWARD_REF_TYPE;
			};
			exports.isFragment = function(object) {
				return typeOf(object) === REACT_FRAGMENT_TYPE;
			};
			exports.isLazy = function(object) {
				return typeOf(object) === REACT_LAZY_TYPE;
			};
			exports.isMemo = function(object) {
				return typeOf(object) === REACT_MEMO_TYPE;
			};
			exports.isPortal = function(object) {
				return typeOf(object) === REACT_PORTAL_TYPE;
			};
			exports.isProfiler = function(object) {
				return typeOf(object) === REACT_PROFILER_TYPE;
			};
			exports.isStrictMode = function(object) {
				return typeOf(object) === REACT_STRICT_MODE_TYPE;
			};
			exports.isSuspense = function(object) {
				return typeOf(object) === REACT_SUSPENSE_TYPE;
			};
			exports.isSuspenseList = function(object) {
				return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
			};
			exports.isValidElementType = function(type) {
				return "string" === typeof type || "function" === typeof type || type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_VIEW_TRANSITION_TYPE || "object" === typeof type && null !== type && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_CONSUMER_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_CLIENT_REFERENCE || void 0 !== type.getModuleId) ? !0 : !1;
			};
			exports.typeOf = typeOf;
		})();
	}));

// node_modules/.store/react-is@19.3.0-h9DBeE4BCfrMSfxZZXEDFw/node_modules/react-is/index.js
	var require_react_is = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		module.exports = require_react_is_development();
	}));

// packages/blocks/build-module/store/process-block-type.mjs
	var import_react_is = require_react_is();
	/**
	* Mapping of legacy category slugs to their latest normal values, used to
	* accommodate updates of the default set of block categories.
	*/
	const LEGACY_CATEGORY_MAPPING = {
		common: "text",
		formatting: "text",
		layout: "design"
	};
	/**
	* Merge block variations bootstrapped from the server and client.
	*
	* When a variation is registered in both places, its properties are merged.
	*
	* @param bootstrappedVariations - A block type variations from the server.
	* @param clientVariations       - A block type variations from the client.
	* @return The merged array of block variations.
	*/
	function mergeBlockVariations(bootstrappedVariations = [], clientVariations = []) {
		const result = [...bootstrappedVariations];
		clientVariations.forEach((clientVariation) => {
			const index = result.findIndex((bootstrappedVariation) => bootstrappedVariation.name === clientVariation.name);
			if (index !== -1) result[index] = {
				...result[index],
				...clientVariation
			};
			else result.push(clientVariation);
		});
		return result;
	}
	/**
	* Takes the unprocessed block type settings, merges them with block type metadata
	* and applies all the existing filters for the registered block type.
	* Next, it validates all the settings and performs additional processing to the block type definition.
	*
	* @param name          Block name.
	* @param blockSettings Unprocessed block type settings.
	*
	* @return The block, if it has been processed and can be registered; otherwise `undefined`.
	*/
	const processBlockType = (name, blockSettings) => ({ select }) => {
		const bootstrappedBlockType = select.getBootstrappedBlockType(name);
		const blockType = {
			apiVersion: 1,
			name,
			icon: BLOCK_ICON_DEFAULT,
			keywords: [],
			attributes: {},
			providesContext: {},
			usesContext: [],
			selectors: {},
			supports: {},
			styles: [],
			blockHooks: {},
			save: () => null,
			...bootstrappedBlockType,
			...blockSettings,
			variations: mergeBlockVariations(Array.isArray(bootstrappedBlockType?.variations) ? bootstrappedBlockType.variations : [], Array.isArray(blockSettings?.variations) ? blockSettings.variations : [])
		};
		if (!blockType.attributes || typeof blockType.attributes !== "object") {
			(0, _wordpress_warning.default)("The block \"" + name + "\" is registering attributes as `null` or `undefined`. Use an empty object (`attributes: {}`) or exclude the `attributes` key.");
			blockType.attributes = {};
		}
		const settings = (0, _wordpress_hooks.applyFilters)("blocks.registerBlockType", blockType, name, null);
		if (settings.apiVersion <= 2) (0, _wordpress_deprecated.default)("Block with API version 2 or lower", {
			since: "6.9",
			hint: `The block "${name}" is registered with API version ${settings.apiVersion}. This means that the post editor may work as a non-iframe editor. Since all editors are planned to work as iframes in the future, set the \`apiVersion\` field to 3 and test the block inside the iframe editor.`,
			link: "https://developer.wordpress.org/block-editor/reference-guides/block-api/block-api-versions/block-migration-for-iframe-editor-compatibility/"
		});
		if (settings.description && typeof settings.description !== "string") (0, _wordpress_deprecated.default)("Declaring non-string block descriptions", { since: "6.2" });
		if (settings.deprecated) settings.deprecated = settings.deprecated.map((deprecation) => Object.fromEntries(Object.entries((0, _wordpress_hooks.applyFilters)("blocks.registerBlockType", {
			...omit(blockType, DEPRECATED_ENTRY_KEYS),
			...deprecation
		}, blockType.name, deprecation)).filter(([key]) => DEPRECATED_ENTRY_KEYS.includes(key))));
		if (!isPlainObject(settings)) {
			(0, _wordpress_warning.default)("Block settings must be a valid object.");
			return;
		}
		if (typeof settings.save !== "function") {
			(0, _wordpress_warning.default)("The \"save\" property must be a valid function.");
			return;
		}
		if ("edit" in settings && !(0, import_react_is.isValidElementType)(settings.edit)) {
			(0, _wordpress_warning.default)("The \"edit\" property must be a valid component.");
			return;
		}
		if (typeof settings.category === "string" && LEGACY_CATEGORY_MAPPING.hasOwnProperty(settings.category)) settings.category = LEGACY_CATEGORY_MAPPING[settings.category];
		if ("category" in settings && !select.getCategories().some(({ slug }) => slug === settings.category)) {
			(0, _wordpress_warning.default)("The block \"" + name + "\" is registered with an invalid category \"" + settings.category + "\".");
			delete settings.category;
		}
		if (!("title" in settings) || settings.title === "") {
			(0, _wordpress_warning.default)("The block \"" + name + "\" must have a title.");
			return;
		}
		if (typeof settings.title !== "string") {
			(0, _wordpress_warning.default)("Block titles must be strings.");
			return;
		}
		const icon = normalizeIconObject(settings.icon);
		settings.icon = icon;
		if (!isValidIcon(icon.src)) {
			(0, _wordpress_warning.default)("The icon passed is invalid. The icon should be a string, an element, a function, or an object following the specifications documented in https://developer.wordpress.org/block-editor/developers/block-api/block-registration/#icon-optional");
			return;
		}
		if (typeof settings?.parent === "string" || settings?.parent instanceof String) {
			settings.parent = [settings.parent];
			(0, _wordpress_warning.default)("Parent must be undefined or an array of strings (block types), but it is a string.");
		}
		if (!Array.isArray(settings?.parent) && settings?.parent !== void 0) {
			(0, _wordpress_warning.default)("Parent must be undefined or an array of block types, but it is " + settings.parent);
			return;
		}
		if (1 === settings?.parent?.length && name === settings.parent[0]) {
			(0, _wordpress_warning.default)("Block \"" + name + "\" cannot be a parent of itself. Please remove the block name from the parent list.");
			return;
		}
		return settings;
	};

// packages/blocks/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		__experimentalReapplyBlockFilters: () => __experimentalReapplyBlockFilters,
		addBlockCollection: () => addBlockCollection,
		addBlockStyles: () => addBlockStyles,
		addBlockTypes: () => addBlockTypes,
		addBlockVariations: () => addBlockVariations,
		reapplyBlockTypeFilters: () => reapplyBlockTypeFilters,
		removeBlockCollection: () => removeBlockCollection,
		removeBlockStyles: () => removeBlockStyles,
		removeBlockTypes: () => removeBlockTypes,
		removeBlockVariations: () => removeBlockVariations,
		setCategories: () => setCategories$1,
		setDefaultBlockName: () => setDefaultBlockName$1,
		setFreeformFallbackBlockName: () => setFreeformFallbackBlockName,
		setGroupingBlockName: () => setGroupingBlockName$1,
		setUnregisteredFallbackBlockName: () => setUnregisteredFallbackBlockName,
		updateCategory: () => updateCategory$1
	}, 1);
	/**
	* Returns an action object used in signalling that block types have been added.
	* Ignored from documentation as the recommended usage for this action through registerBlockType from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param blockTypes Object or array of objects representing blocks to added.
	*
	* @return Action object.
	*/
	function addBlockTypes(blockTypes) {
		return {
			type: "ADD_BLOCK_TYPES",
			blockTypes: Array.isArray(blockTypes) ? blockTypes : [blockTypes]
		};
	}
	/**
	* Signals that all block types should be computed again.
	* It uses stored unprocessed block types and all the most recent list of registered filters.
	*
	* It addresses the issue where third party block filters get registered after third party blocks. A sample sequence:
	*   1. Filter A.
	*   2. Block B.
	*   3. Block C.
	*   4. Filter D.
	*   5. Filter E.
	*   6. Block F.
	*   7. Filter G.
	* In this scenario some filters would not get applied for all blocks because they are registered too late.
	*/
	function reapplyBlockTypeFilters() {
		return ({ dispatch, select }) => {
			const processedBlockTypes = [];
			for (const [name, settings] of Object.entries(select.getUnprocessedBlockTypes())) {
				const result = dispatch(processBlockType(name, settings));
				if (result) processedBlockTypes.push(result);
			}
			if (!processedBlockTypes.length) return;
			dispatch.addBlockTypes(processedBlockTypes);
		};
	}
	function __experimentalReapplyBlockFilters() {
		(0, _wordpress_deprecated.default)("wp.data.dispatch( \"core/blocks\" ).__experimentalReapplyBlockFilters", {
			since: "6.4",
			alternative: "reapplyBlockFilters"
		});
		return reapplyBlockTypeFilters();
	}
	/**
	* Returns an action object used to remove a registered block type.
	* Ignored from documentation as the recommended usage for this action through unregisterBlockType from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param names Block name or array of block names to be removed.
	*
	* @return Action object.
	*/
	function removeBlockTypes(names) {
		return {
			type: "REMOVE_BLOCK_TYPES",
			names: Array.isArray(names) ? names : [names]
		};
	}
	/**
	* Returns an action object used in signalling that new block styles have been added.
	* Ignored from documentation as the recommended usage for this action through registerBlockStyle from `@wordpress/blocks`.
	*
	* @param blockNames Block names to register new styles for.
	* @param styles     Block style object or array of block style objects.
	*
	* @ignore
	*
	* @return Action object.
	*/
	function addBlockStyles(blockNames, styles) {
		return {
			type: "ADD_BLOCK_STYLES",
			styles: Array.isArray(styles) ? styles : [styles],
			blockNames: Array.isArray(blockNames) ? blockNames : [blockNames]
		};
	}
	/**
	* Returns an action object used in signalling that block styles have been removed.
	* Ignored from documentation as the recommended usage for this action through unregisterBlockStyle from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param blockName  Block name.
	* @param styleNames Block style names or array of block style names.
	*
	* @return Action object.
	*/
	function removeBlockStyles(blockName, styleNames) {
		return {
			type: "REMOVE_BLOCK_STYLES",
			styleNames: Array.isArray(styleNames) ? styleNames : [styleNames],
			blockName
		};
	}
	/**
	* Returns an action object used in signalling that new block variations have been added.
	* Ignored from documentation as the recommended usage for this action through registerBlockVariation from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param blockName  Block name.
	* @param variations Block variations.
	*
	* @return Action object.
	*/
	function addBlockVariations(blockName, variations) {
		return {
			type: "ADD_BLOCK_VARIATIONS",
			variations: Array.isArray(variations) ? variations : [variations],
			blockName
		};
	}
	/**
	* Returns an action object used in signalling that block variations have been removed.
	* Ignored from documentation as the recommended usage for this action through unregisterBlockVariation from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param blockName      Block name.
	* @param variationNames Block variation names.
	*
	* @return Action object.
	*/
	function removeBlockVariations(blockName, variationNames) {
		return {
			type: "REMOVE_BLOCK_VARIATIONS",
			variationNames: Array.isArray(variationNames) ? variationNames : [variationNames],
			blockName
		};
	}
	/**
	* Returns an action object used to set the default block name.
	* Ignored from documentation as the recommended usage for this action through setDefaultBlockName from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param name Block name.
	*
	* @return Action object.
	*/
	function setDefaultBlockName$1(name) {
		return {
			type: "SET_DEFAULT_BLOCK_NAME",
			name
		};
	}
	/**
	* Returns an action object used to set the name of the block used as a fallback
	* for non-block content.
	* Ignored from documentation as the recommended usage for this action through setFreeformContentHandlerName from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param name Block name.
	*
	* @return Action object.
	*/
	function setFreeformFallbackBlockName(name) {
		return {
			type: "SET_FREEFORM_FALLBACK_BLOCK_NAME",
			name
		};
	}
	/**
	* Returns an action object used to set the name of the block used as a fallback
	* for unregistered blocks.
	* Ignored from documentation as the recommended usage for this action through setUnregisteredTypeHandlerName from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param name Block name.
	*
	* @return Action object.
	*/
	function setUnregisteredFallbackBlockName(name) {
		return {
			type: "SET_UNREGISTERED_FALLBACK_BLOCK_NAME",
			name
		};
	}
	/**
	* Returns an action object used to set the name of the block used
	* when grouping other blocks
	* eg: in "Group/Ungroup" interactions
	* Ignored from documentation as the recommended usage for this action through setGroupingBlockName from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param name Block name.
	*
	* @return Action object.
	*/
	function setGroupingBlockName$1(name) {
		return {
			type: "SET_GROUPING_BLOCK_NAME",
			name
		};
	}
	/**
	* Returns an action object used to set block categories.
	* Ignored from documentation as the recommended usage for this action through setCategories from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param categories Block categories.
	*
	* @return Action object.
	*/
	function setCategories$1(categories) {
		return {
			type: "SET_CATEGORIES",
			categories
		};
	}
	/**
	* Returns an action object used to update a category.
	* Ignored from documentation as the recommended usage for this action through updateCategory from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param slug     Block category slug.
	* @param category Object containing the category properties that should be updated.
	*
	* @return Action object.
	*/
	function updateCategory$1(slug, category) {
		return {
			type: "UPDATE_CATEGORY",
			slug,
			category
		};
	}
	/**
	* Returns an action object used to add block collections
	* Ignored from documentation as the recommended usage for this action through registerBlockCollection from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param namespace The namespace of the blocks to put in the collection
	* @param title     The title to display in the block inserter
	* @param icon      (optional) The icon to display in the block inserter
	*
	* @return Action object.
	*/
	function addBlockCollection(namespace, title, icon) {
		return {
			type: "ADD_BLOCK_COLLECTION",
			namespace,
			title,
			icon
		};
	}
	/**
	* Returns an action object used to remove block collections
	* Ignored from documentation as the recommended usage for this action through unregisterBlockCollection from `@wordpress/blocks`.
	*
	* @ignore
	*
	* @param namespace The namespace of the blocks to put in the collection
	*
	* @return Action object.
	*/
	function removeBlockCollection(namespace) {
		return {
			type: "REMOVE_BLOCK_COLLECTION",
			namespace
		};
	}

// packages/blocks/build-module/store/private-actions.mjs
	var private_actions_exports = /* @__PURE__ */ __exportAll({
		addBlockBindingsSource: () => addBlockBindingsSource,
		addBootstrappedBlockType: () => addBootstrappedBlockType,
		addUnprocessedBlockType: () => addUnprocessedBlockType,
		removeBlockBindingsSource: () => removeBlockBindingsSource
	}, 1);
	/**
	* Add bootstrapped block type metadata to the store. These metadata usually come from
	* the `block.json` file and are either statically bootstrapped from the server, or
	* passed as the `metadata` parameter to the `registerBlockType` function.
	*
	* @param name      Block name.
	* @param blockType Block type metadata.
	*/
	function addBootstrappedBlockType(name, blockType) {
		return {
			type: "ADD_BOOTSTRAPPED_BLOCK_TYPE",
			name,
			blockType
		};
	}
	/**
	* Add unprocessed block type settings to the store. These data are passed as the
	* `settings` parameter to the client-side `registerBlockType` function.
	*
	* @param name      Block name.
	* @param blockType Unprocessed block type settings.
	*/
	function addUnprocessedBlockType(name, blockType) {
		return ({ dispatch }) => {
			dispatch({
				type: "ADD_UNPROCESSED_BLOCK_TYPE",
				name,
				blockType
			});
			const processedBlockType = dispatch(processBlockType(name, blockType));
			if (!processedBlockType) return;
			dispatch.addBlockTypes(processedBlockType);
		};
	}
	/**
	* Adds new block bindings source.
	*
	* @param source The source to register.
	*/
	function addBlockBindingsSource(source) {
		return {
			type: "ADD_BLOCK_BINDINGS_SOURCE",
			name: source.name,
			label: source.label,
			usesContext: source.usesContext,
			getValues: source.getValues,
			setValues: source.setValues,
			canUserEditValue: source.canUserEditValue,
			getFieldsList: source.getFieldsList
		};
	}
	/**
	* Removes existing block bindings source.
	*
	* @param name Name of the source to remove.
	*/
	function removeBlockBindingsSource(name) {
		return {
			type: "REMOVE_BLOCK_BINDINGS_SOURCE",
			name
		};
	}

// packages/blocks/build-module/store/constants.mjs
	const STORE_NAME = "core/blocks";

// packages/blocks/build-module/store/index.mjs
/**
	* Store definition for the blocks namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*/
	const store = (0, _wordpress_data.createReduxStore)(STORE_NAME, {
		reducer: reducer_default,
		selectors: selectors_exports,
		actions: actions_exports
	});
	(0, _wordpress_data.register)(store);
	unlock(store).registerPrivateSelectors(private_selectors_exports);
	unlock(store).registerPrivateActions(private_actions_exports);

// node_modules/.store/uuid@14.0.2-ALlTd6-Rf9bZs703d7TIjQ/node_modules/uuid/dist/stringify.js
	const byteToHex = [];
	for (let i = 0; i < 256; ++i) byteToHex.push((i + 256).toString(16).slice(1));
	function unsafeStringify(arr, offset = 0) {
		return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
	}

// node_modules/.store/uuid@14.0.2-ALlTd6-Rf9bZs703d7TIjQ/node_modules/uuid/dist/rng.js
	const rnds8 = /* @__PURE__ */ new Uint8Array(16);
	function rng() {
		return crypto.getRandomValues(rnds8);
	}

// node_modules/.store/uuid@14.0.2-ALlTd6-Rf9bZs703d7TIjQ/node_modules/uuid/dist/v4.js
	function v4(options, buf, offset) {
		if (!buf && !options && crypto.randomUUID) return crypto.randomUUID();
		return _v4(options, buf, offset);
	}
	function _v4(options, buf, offset) {
		options = options || {};
		const rnds = options.random ?? options.rng?.() ?? rng();
		if (rnds.length < 16) throw new Error("Random bytes length must be >= 16");
		rnds[6] = rnds[6] & 15 | 64;
		rnds[8] = rnds[8] & 63 | 128;
		if (buf) {
			offset = offset || 0;
			if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
			for (let i = 0; i < 16; ++i) buf[offset + i] = rnds[i];
			return buf;
		}
		return unsafeStringify(rnds);
	}

// packages/blocks/build-module/api/factory.mjs
/**
	* Returns whether a transform is a transform from or to another block type.
	*
	* @param transform The transform object to test.
	*
	* @return Whether the transform is of type `block`.
	*/
	const isBlockTypeTransform = (transform) => transform?.type === "block";
	const getBlockTypeWithTransformMetadata = (blockType, transform) => transform.variationName ? {
		...blockType,
		variationName: transform.variationName
	} : blockType;
	/**
	* Returns a block object given its type and attributes.
	*
	* @param name         Block name.
	* @param attributes   Block attributes.
	* @param innerBlocks  Nested blocks.
	* @param innerContent Static HTML fragments interleaved with inner blocks,
	*                     where `null` entries mark inner block positions. Only
	*                     applies to the Custom HTML block.
	*
	* @return Block object.
	*/
	function createBlock(name, attributes = {}, innerBlocks = [], innerContent) {
		if (!isBlockRegistered(name)) return createBlock("core/missing", {
			originalName: name,
			originalContent: "",
			originalUndelimitedContent: ""
		});
		const sanitizedAttributes = sanitizeBlockAttributes(name, attributes);
		const block = {
			clientId: v4(),
			name,
			isValid: true,
			attributes: sanitizedAttributes,
			innerBlocks
		};
		if (innerContent) {
			if (name === "core/html") block.innerContent = innerContent;
			else (0, _wordpress_warning.default)(`The innerContent argument passed to createBlock for the "${name}" block was ignored. Only the Custom HTML block stores static inner content.`);
		}
		return block;
	}
	/**
	* Given an array of InnerBlocks templates or Block Objects,
	* returns an array of created Blocks from them.
	* It handles the case of having InnerBlocks as Blocks by
	* converting them to the proper format to continue recursively.
	*
	* @param innerBlocksOrTemplate Nested blocks or InnerBlocks templates.
	*
	* @return Array of Block objects.
	*/
	function createBlocksFromInnerBlocksTemplate(innerBlocksOrTemplate = []) {
		return innerBlocksOrTemplate.map((innerBlock) => {
			const [name, attributes, innerBlocks = [], innerContent] = Array.isArray(innerBlock) ? innerBlock : [
				innerBlock.name,
				innerBlock.attributes,
				innerBlock.innerBlocks,
				innerBlock.innerContent
			];
			return createBlock(name, attributes, createBlocksFromInnerBlocksTemplate(innerBlocks), innerContent);
		});
	}
	/**
	* Given a block object, returns a copy of the block object while sanitizing its attributes,
	* optionally merging new attributes and/or replacing its inner blocks.
	*
	* @param block           Block instance.
	* @param mergeAttributes Block attributes.
	* @param newInnerBlocks  Nested blocks.
	*
	* @return A cloned block.
	*/
	function cloneSanitizedBlock(block, mergeAttributes = {}, newInnerBlocks) {
		const { name } = block;
		if (!isBlockRegistered(name)) return createBlock("core/missing", {
			originalName: name,
			originalContent: "",
			originalUndelimitedContent: ""
		});
		const clientId = v4();
		const sanitizedAttributes = sanitizeBlockAttributes(name, {
			...block.attributes,
			...mergeAttributes
		});
		return {
			...block,
			clientId,
			attributes: sanitizedAttributes,
			innerBlocks: newInnerBlocks || block.innerBlocks.map((innerBlock) => cloneSanitizedBlock(innerBlock))
		};
	}
	function __experimentalCloneSanitizedBlock(block, mergeAttributes = {}, newInnerBlocks) {
		(0, _wordpress_deprecated.default)("__experimentalCloneSanitizedBlock", {
			since: "7.1",
			alternative: "cloneSanitizedBlock"
		});
		return cloneSanitizedBlock(block, mergeAttributes, newInnerBlocks);
	}
	/**
	* Given a block object, returns a copy of the block object,
	* optionally merging new attributes and/or replacing its inner blocks.
	*
	* @param block           Block instance.
	* @param mergeAttributes Block attributes.
	* @param newInnerBlocks  Nested blocks.
	*
	* @return A cloned block.
	*/
	function cloneBlock(block, mergeAttributes = {}, newInnerBlocks) {
		const clientId = v4();
		return {
			...block,
			clientId,
			attributes: {
				...block.attributes,
				...mergeAttributes
			},
			innerBlocks: newInnerBlocks || block.innerBlocks.map((innerBlock) => cloneBlock(innerBlock))
		};
	}
	/**
	* Returns a boolean indicating whether a transform is possible based on
	* various bits of context.
	*
	* @param transform The transform object to validate.
	* @param direction Is this a 'from' or 'to' transform.
	* @param blocks    The blocks to transform from.
	*
	* @return Is the transform possible?
	*/
	const isPossibleTransformForSource = (transform, direction, blocks) => {
		if (!blocks.length) return false;
		const isMultiBlock = blocks.length > 1;
		const firstBlockName = blocks[0].name;
		if (!(isWildcardBlockTransform(transform) || !isMultiBlock || transform.isMultiBlock)) return false;
		if (!isWildcardBlockTransform(transform) && !blocks.every((block) => block.name === firstBlockName)) return false;
		const sourceBlock = blocks[0];
		if (!(direction !== "from" || transform.blocks.indexOf(sourceBlock.name) !== -1 || isWildcardBlockTransform(transform))) return false;
		if (!isMultiBlock && direction === "from" && isContainerGroupBlock(sourceBlock.name) && isContainerGroupBlock(transform.blockName)) return false;
		if (!maybeCheckTransformIsMatch(transform, blocks)) return false;
		return true;
	};
	/**
	* Returns block types that the 'blocks' can be transformed into, based on
	* 'from' transforms on other blocks.
	*
	* @param blocks The blocks to transform from.
	*
	* @return Block types that the blocks can be transformed into.
	*/
	const getBlockTypesForPossibleFromTransforms = (blocks) => {
		if (!blocks.length) return [];
		return getBlockTypes().flatMap((blockType) => {
			return getBlockTransforms("from", blockType.name).filter(isBlockTypeTransform).filter((transform) => isPossibleTransformForSource(transform, "from", blocks)).map((transform) => getBlockTypeWithTransformMetadata(blockType, transform));
		});
	};
	/**
	* Returns block types that the 'blocks' can be transformed into, based on
	* the source block's own 'to' transforms.
	*
	* @param blocks The blocks to transform from.
	*
	* @return Block types that the source can be transformed into.
	*/
	const getBlockTypesForPossibleToTransforms = (blocks) => {
		if (!blocks.length) return [];
		const sourceBlock = blocks[0];
		const blockType = getBlockType(sourceBlock.name);
		return (blockType ? getBlockTransforms("to", blockType.name) : []).filter(isBlockTypeTransform).filter((transform) => isPossibleTransformForSource(transform, "to", blocks)).flatMap((transformation) => {
			return (transformation.blocks ?? []).map((name) => {
				const transformedBlockType = getBlockType(name);
				return transformedBlockType ? getBlockTypeWithTransformMetadata(transformedBlockType, transformation) : void 0;
			});
		}).filter((bt) => !!bt);
	};
	/**
	* Determines whether transform is a "block" type
	* and if so whether it is a "wildcard" transform
	* ie: targets "any" block type
	*
	* @param t the Block transform object
	*
	* @return whether transform is a wildcard transform
	*/
	const isWildcardBlockTransform = (t) => isBlockTypeTransform(t) && Array.isArray(t.blocks) && t.blocks.includes("*");
	/**
	* Determines whether the given Block is the core Block which
	* acts as a container Block for other Blocks as part of the
	* Grouping mechanics
	*
	* @param name the name of the Block to test against
	*
	* @return whether or not the Block is the container Block type
	*/
	const isContainerGroupBlock = (name) => name === getGroupingBlockName();
	/**
	* Returns an array of block types that the set of blocks received as argument
	* can be transformed into.
	*
	* @param blocks Blocks array.
	*
	* @return Block types that the blocks argument can be transformed to.
	*/
	function getPossibleBlockTransformations(blocks) {
		if (!blocks.length) return [];
		const blockTypesForFromTransforms = getBlockTypesForPossibleFromTransforms(blocks);
		const blockTypesForToTransforms = getBlockTypesForPossibleToTransforms(blocks);
		const blockTypesByNameAndVariation = /* @__PURE__ */ new Map();
		for (const blockType of [...blockTypesForFromTransforms, ...blockTypesForToTransforms]) {
			const key = blockType.variationName ? `${blockType.name}/${blockType.variationName}` : blockType.name;
			if (!blockTypesByNameAndVariation.has(key)) blockTypesByNameAndVariation.set(key, blockType);
		}
		return [...blockTypesByNameAndVariation.values()];
	}
	/**
	* Given an array of transforms, returns the highest-priority transform where
	* the predicate function returns a truthy value. A higher-priority transform
	* is one with a lower priority value (i.e. first in priority order). Returns
	* null if the transforms set is empty or the predicate function returns a
	* falsey value for all entries.
	*
	* @param transforms Transforms to search.
	* @param predicate  Function returning true on matching transform.
	*
	* @return Highest-priority transform candidate.
	*/
	function findTransform(transforms, predicate) {
		const priority = (t) => t.priority ?? 10;
		const candidates = transforms.filter((t) => predicate(t)).toSorted((t1, t2) => priority(t1) - priority(t2));
		return candidates.length > 0 ? candidates[0] : null;
	}
	/**
	* Returns normal block transforms for a given transform direction, optionally
	* for a specific block by name, or an empty array if there are no transforms.
	* If no block name is provided, returns transforms for all blocks. A normal
	* transform object includes `blockName` as a property.
	*
	* @param direction       Transform direction ("to", "from").
	* @param blockTypeOrName Block type or name.
	*
	* @return Block transforms for direction.
	*/
	function getBlockTransforms(direction, blockTypeOrName) {
		if (blockTypeOrName === void 0) return getBlockTypes().map(({ name }) => getBlockTransforms(direction, name)).flat();
		const blockType = normalizeBlockType(blockTypeOrName);
		const directionTransforms = blockType?.transforms?.[direction];
		if (!blockType || !Array.isArray(directionTransforms)) return [];
		return directionTransforms.map((transform) => ({
			...transform,
			blockName: blockType.name
		}));
	}
	/**
	* Checks that a given transforms isMatch method passes for given source blocks.
	*
	* @param transform A transform object.
	* @param blocks    Blocks array.
	*
	* @return True if given blocks are a match for the transform.
	*/
	function maybeCheckTransformIsMatch(transform, blocks) {
		if (typeof transform.isMatch !== "function") return true;
		const sourceBlock = blocks[0];
		const attributes = transform.isMultiBlock ? blocks.map((block) => block.attributes) : sourceBlock.attributes;
		const block = transform.isMultiBlock ? blocks : sourceBlock;
		return transform.isMatch(attributes, block);
	}
	/**
	* Switch one or more blocks into one or more blocks of the new block type.
	*
	* @param blocks        Blocks array or block object.
	* @param name          Block name.
	* @param variationName Optional target block variation name.
	*
	* @return Array of blocks or null.
	*/
	function switchToBlockType(blocks, name, variationName) {
		const blocksArray = Array.isArray(blocks) ? blocks : [blocks];
		const isMultiBlock = blocksArray.length > 1;
		const firstBlock = blocksArray[0];
		const sourceName = firstBlock.name;
		const transformationsFrom = getBlockTransforms("from", name).filter(isBlockTypeTransform);
		const transformationsTo = getBlockTransforms("to", sourceName).filter(isBlockTypeTransform);
		const isMatchingVariation = (t) => variationName ? t.variationName === variationName : !t.variationName;
		const transformation = findTransform(transformationsTo, (t) => isMatchingVariation(t) && (isWildcardBlockTransform(t) || t.blocks.indexOf(name) !== -1) && (!isMultiBlock || !!t.isMultiBlock) && maybeCheckTransformIsMatch(t, blocksArray)) || findTransform(transformationsFrom, (t) => isMatchingVariation(t) && (isWildcardBlockTransform(t) || t.blocks.indexOf(sourceName) !== -1) && (!isMultiBlock || !!t.isMultiBlock) && maybeCheckTransformIsMatch(t, blocksArray));
		if (!transformation) return null;
		let transformationResults;
		if (transformation.isMultiBlock) {
			if ("__experimentalConvert" in transformation) transformationResults = transformation.__experimentalConvert(blocksArray);
			else transformationResults = transformation.transform(blocksArray.map((currentBlock) => currentBlock.attributes), blocksArray.map((currentBlock) => currentBlock.innerBlocks));
		} else if ("__experimentalConvert" in transformation) transformationResults = transformation.__experimentalConvert(firstBlock);
		else transformationResults = transformation.transform(firstBlock.attributes, firstBlock.innerBlocks);
		if (transformationResults === null || typeof transformationResults !== "object") return null;
		transformationResults = Array.isArray(transformationResults) ? transformationResults : [transformationResults];
		if (transformationResults.some((result) => !getBlockType(result.name))) return null;
		if (!transformationResults.some((result) => result.name === name)) return null;
		return transformationResults.map((result, index, results) => {
			/**
			* Filters an individual transform result from block transformation.
			* All of the original blocks are passed, since transformations are
			* many-to-many, not one-to-one.
			*
			* @param transformedBlock The transformed block.
			* @param blocks           Original blocks transformed.
			* @param index            Index of the transformed block on the array of results.
			* @param results          An array all the blocks that resulted from the transformation.
			*/
			return (0, _wordpress_hooks.applyFilters)("blocks.switchToBlockType.transformedBlock", result, blocks, index, results);
		});
	}
	const getBlockFromExample = (name, example) => createBlock(name, example.attributes, (example.innerBlocks ?? []).map((innerBlock) => getBlockFromExample(innerBlock.name, innerBlock)), example.innerContent);

// packages/blocks/build-module/api/parser/serialize-raw-block.mjs
/**
	* Serializes a block node into the native HTML-comment-powered block format.
	* CAVEAT: This function is intended for re-serializing blocks as parsed by
	* valid parsers and skips any validation steps. This is NOT a generic
	* serialization function for in-memory blocks. For most purposes, see the
	* following functions available in the `@wordpress/blocks` package:
	*
	* @see serializeBlock
	* @see serialize
	*
	* For more on the format of block nodes as returned by valid parsers:
	*
	* @see `@wordpress/block-serialization-default-parser` package
	* @see `@wordpress/block-serialization-spec-parser` package
	*
	* @param rawBlock     A block node as returned by a valid parser.
	* @param [options={}] Serialization options.
	*
	* @return An HTML string representing a block.
	*/
	function serializeRawBlock(rawBlock, options = {}) {
		const { isCommentDelimited = true } = options;
		const { blockName, attrs = {}, innerBlocks = [], innerContent = [] } = rawBlock;
		let childIndex = 0;
		const content = innerContent.map((item) => item !== null ? item : serializeRawBlock(innerBlocks[childIndex++], options)).join("\n").replace(/\n+/g, "\n").trim();
		return isCommentDelimited ? getCommentDelimitedContent(blockName ?? void 0, attrs, content) : content;
	}

// packages/blocks/build-module/api/serializer.mjs
/**
	* Returns the block's default classname from its name.
	*
	* @param blockName The block name.
	*
	* @return The block's default class.
	*/
	function getBlockDefaultClassName(blockName) {
		const className = "wp-block-" + blockName.replace(/\//, "-").replace(/^core-/, "");
		return (0, _wordpress_hooks.applyFilters)("blocks.getBlockDefaultClassName", className, blockName);
	}
	/**
	* Returns the block's default menu item classname from its name.
	*
	* @param blockName The block name.
	*
	* @return The block's default menu item class.
	*/
	function getBlockMenuDefaultClassName(blockName) {
		const className = "editor-block-list-item-" + blockName.replace(/\//, "-").replace(/^core-/, "");
		return (0, _wordpress_hooks.applyFilters)("blocks.getBlockMenuDefaultClassName", className, blockName);
	}
	const blockPropsProvider = {};
	const innerBlocksPropsProvider = {};
	/**
	* Call within a save function to get the props for the block wrapper.
	*
	* @param props Optional. Props to pass to the element.
	*/
	function getBlockProps(props = {}) {
		const { blockType, attributes } = blockPropsProvider;
		return getBlockProps.skipFilters ? props : (0, _wordpress_hooks.applyFilters)("blocks.getSaveContent.extraProps", { ...props }, blockType, attributes);
	}
	/**
	* Call within a save function to get the props for the inner blocks wrapper.
	*
	* @param props Optional. Props to pass to the element.
	*/
	function getInnerBlocksProps(props = {}) {
		const { innerBlocks } = innerBlocksPropsProvider;
		if (!Array.isArray(innerBlocks)) return {
			...props,
			children: innerBlocks
		};
		const html = serialize(innerBlocks, { isInnerBlocks: true });
		const children = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_element.RawHTML, { children: html });
		return {
			...props,
			children
		};
	}
	/**
	* Given a block type containing a save render implementation and attributes, returns the
	* enhanced element to be saved or string when raw HTML expected.
	*
	* @param blockTypeOrName Block type or name.
	* @param attributes      Block attributes.
	* @param innerBlocks     Nested blocks, or an element to render in their place.
	*
	* @return Save element or raw HTML string.
	*/
	function getSaveElement(blockTypeOrName, attributes, innerBlocks = []) {
		const blockType = normalizeBlockType(blockTypeOrName);
		if (!blockType?.save) return null;
		let save = blockType.save;
		if (save.prototype instanceof _wordpress_element.Component) {
			const instance = new save({ attributes });
			save = instance.render.bind(instance);
		}
		blockPropsProvider.blockType = blockType;
		blockPropsProvider.attributes = attributes;
		innerBlocksPropsProvider.innerBlocks = innerBlocks;
		let element = save({
			attributes,
			innerBlocks
		});
		if (element !== null && typeof element === "object" && (0, _wordpress_hooks.hasFilter)("blocks.getSaveContent.extraProps") && !((blockType.apiVersion ?? 0) > 1)) {
			/**
			* Filters the props applied to the block save result element.
			*
			* @param props      Props applied to save element.
			* @param blockType  Block type definition.
			* @param attributes Block attributes.
			*/
			const props = (0, _wordpress_hooks.applyFilters)("blocks.getSaveContent.extraProps", { ...element.props }, blockType, attributes);
			if (!(0, _wordpress_is_shallow_equal.isShallowEqual)(props, element.props)) element = (0, _wordpress_element.cloneElement)(element, props);
		}
		/**
		* Filters the save result of a block during serialization.
		*
		* @param element    Block save result.
		* @param blockType  Block type definition.
		* @param attributes Block attributes.
		*/
		return (0, _wordpress_hooks.applyFilters)("blocks.getSaveElement", element, blockType, attributes);
	}
	/**
	* Given a block type containing a save render implementation and attributes, returns the
	* static markup to be saved.
	*
	* @param blockTypeOrName Block type or name.
	* @param attributes      Block attributes.
	* @param innerBlocks     Nested blocks.
	*
	* @return Save content.
	*/
	function getSaveContent(blockTypeOrName, attributes, innerBlocks) {
		const blockType = normalizeBlockType(blockTypeOrName);
		if (!blockType) return "";
		return (0, _wordpress_element.renderToString)(getSaveElement(blockType, attributes, innerBlocks));
	}
	/**
	* Returns attributes which are to be saved and serialized into the block
	* comment delimiter.
	*
	* When a block exists in memory it contains as its attributes both those
	* parsed the block comment delimiter _and_ those which matched from the
	* contents of the block.
	*
	* This function returns only those attributes which are needed to persist and
	* which cannot be matched from the block content.
	*
	* @param blockType  Block type.
	* @param attributes Attributes from in-memory block data.
	*
	* @return Subset of attributes for comment serialization.
	*/
	function getCommentAttributes(blockType, attributes) {
		return Object.entries(blockType.attributes ?? {}).reduce((accumulator, [key, attributeSchema]) => {
			const value = attributes[key];
			if (void 0 === value) return accumulator;
			if (attributeSchema.source !== void 0) return accumulator;
			if (attributeSchema.role === "local") return accumulator;
			if (attributeSchema.__experimentalRole === "local") {
				(0, _wordpress_deprecated.default)("__experimentalRole attribute", {
					since: "6.7",
					version: "6.8",
					alternative: "role attribute",
					hint: `Check the block.json of the ${blockType?.name} block.`
				});
				return accumulator;
			}
			if ("default" in attributeSchema && JSON.stringify(attributeSchema.default) === JSON.stringify(value)) return accumulator;
			accumulator[key] = value;
			return accumulator;
		}, {});
	}
	/**
	* Given an attributes object, returns a string in the serialized attributes
	* format prepared for post content.
	*
	* @param attributes Attributes object.
	*
	* @return Serialized attributes.
	*/
	function serializeAttributes(attributes) {
		return JSON.stringify(attributes).replaceAll("\\\\", "\\u005c").replaceAll("--", "\\u002d\\u002d").replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026").replaceAll("\\\"", "\\u0022");
	}
	/**
	* Given the static HTML fragments of the Custom HTML block and its inner
	* blocks, returns the block's inner HTML markup by interleaving the fragments
	* with the serialized inner blocks.
	*
	* @param innerContent Static HTML fragments, `null` marking inner block positions.
	* @param innerBlocks  Inner blocks.
	*
	* @return HTML.
	*/
	function serializeInnerContent(innerContent, innerBlocks) {
		let childIndex = 0;
		const parts = innerContent.map((item) => {
			if (item !== null) return item;
			const innerBlock = innerBlocks[childIndex++];
			return innerBlock ? serializeBlock(innerBlock, { isInnerBlocks: true }) : "";
		});
		for (; childIndex < innerBlocks.length; childIndex++) parts.push(serializeBlock(innerBlocks[childIndex], { isInnerBlocks: true }));
		return parts.join("").trim();
	}
	/**
	* Given a block object, returns the Block's Inner HTML markup.
	*
	* @param block Block instance.
	*
	* @return HTML.
	*/
	function getBlockInnerHTML(block) {
		if (block.innerContent && block.name === "core/html") return serializeInnerContent(block.innerContent, block.innerBlocks);
		let saveContent = block.originalContent ?? "";
		if (block.isValid || block.innerBlocks.length) try {
			saveContent = getSaveContent(block.name, block.attributes, block.innerBlocks);
		} catch {}
		return saveContent;
	}
	/**
	* Returns the content of a block, including comment delimiters.
	*
	* @param rawBlockName Block name.
	* @param attributes   Block attributes.
	* @param content      Block save content.
	*
	* @return Comment-delimited block content.
	*/
	function getCommentDelimitedContent(rawBlockName, attributes, content) {
		const serializedAttributes = attributes && Object.entries(attributes).length ? serializeAttributes(attributes) + " " : "";
		const blockName = rawBlockName?.startsWith("core/") ? rawBlockName.slice(5) : rawBlockName;
		if (!content) return `<!-- wp:${blockName} ${serializedAttributes}/-->`;
		return `<!-- wp:${blockName} ${serializedAttributes}-->\n` + content + `\n<!-- /wp:${blockName} -->`;
	}
	/**
	* Returns the content of a block, including comment delimiters, determining
	* serialized attributes and content form from the current state of the block.
	*
	* @param block                 Block instance.
	* @param options               Serialization options.
	*
	* @param options.isInnerBlocks
	* @return Serialized block.
	*/
	function serializeBlock(block, { isInnerBlocks = false } = {}) {
		if (!block.isValid && block.__unstableBlockSource) return serializeRawBlock(block.__unstableBlockSource);
		const blockName = block.name;
		const saveContent = getBlockInnerHTML(block);
		if (blockName === getUnregisteredTypeHandlerName() || !isInnerBlocks && blockName === getFreeformContentHandlerName()) return saveContent;
		const blockType = getBlockType(blockName);
		if (!blockType) return saveContent;
		return getCommentDelimitedContent(blockName, getCommentAttributes(blockType, block.attributes), saveContent);
	}
	const __unstableSerializeAndClean = (() => {
		const cache = /* @__PURE__ */ new WeakMap();
		return (blocks) => {
			const cached = cache.get(blocks);
			if (cached !== void 0) return cached;
			let effectiveBlocks = blocks;
			if (effectiveBlocks.length === 1 && isUnmodifiedDefaultBlock(effectiveBlocks[0])) effectiveBlocks = [];
			let content = serialize(effectiveBlocks);
			if (effectiveBlocks.length === 1 && effectiveBlocks[0].name === getFreeformContentHandlerName() && effectiveBlocks[0].name === "core/freeform") content = (0, _wordpress_autop.removep)(content);
			cache.set(blocks, content);
			return content;
		};
	})();
	/**
	* Takes a block or set of blocks and returns the serialized post content.
	*
	* @param blocks  Block(s) to serialize.
	* @param options Serialization options.
	*
	* @return The post content.
	*/
	function serialize(blocks, options) {
		return (Array.isArray(blocks) ? blocks : [blocks]).map((block) => serializeBlock(block, options)).join("\n\n");
	}

// node_modules/.store/simple-html-tokenizer@0.5.7-XqyG3gha3SmBXttNwRHo8w/node_modules/simple-html-tokenizer/dist/es6/index.js
	var HEXCHARCODE = /^#[xX]([A-Fa-f0-9]+)$/;
	var CHARCODE = /^#([0-9]+)$/;
	var NAMED = /^([A-Za-z0-9]+)$/;
	var EntityParser = function() {
		function EntityParser(named) {
			this.named = named;
		}
		EntityParser.prototype.parse = function(entity) {
			if (!entity) return;
			var matches = entity.match(HEXCHARCODE);
			if (matches) return String.fromCharCode(parseInt(matches[1], 16));
			matches = entity.match(CHARCODE);
			if (matches) return String.fromCharCode(parseInt(matches[1], 10));
			matches = entity.match(NAMED);
			if (matches) return this.named[matches[1]];
		};
		return EntityParser;
	}();
	var WSP = /[\t\n\f ]/;
	var ALPHA = /[A-Za-z]/;
	var CRLF = /\r\n?/g;
	function isSpace(char) {
		return WSP.test(char);
	}
	function isAlpha(char) {
		return ALPHA.test(char);
	}
	function preprocessInput(input) {
		return input.replace(CRLF, "\n");
	}
	var EventedTokenizer = function() {
		function EventedTokenizer(delegate, entityParser) {
			this.delegate = delegate;
			this.entityParser = entityParser;
			this.state = "beforeData";
			this.line = -1;
			this.column = -1;
			this.input = "";
			this.index = -1;
			this.tagNameBuffer = "";
			this.states = {
				beforeData: function() {
					var char = this.peek();
					if (char === "<") {
						this.transitionTo("tagOpen");
						this.markTagStart();
						this.consume();
					} else {
						if (char === "\n") {
							var tag = this.tagNameBuffer.toLowerCase();
							if (tag === "pre" || tag === "textarea") this.consume();
						}
						this.transitionTo("data");
						this.delegate.beginData();
					}
				},
				data: function() {
					var char = this.peek();
					if (char === "<") {
						this.delegate.finishData();
						this.transitionTo("tagOpen");
						this.markTagStart();
						this.consume();
					} else if (char === "&") {
						this.consume();
						this.delegate.appendToData(this.consumeCharRef() || "&");
					} else {
						this.consume();
						this.delegate.appendToData(char);
					}
				},
				tagOpen: function() {
					var char = this.consume();
					if (char === "!") this.transitionTo("markupDeclarationOpen");
					else if (char === "/") this.transitionTo("endTagOpen");
					else if (char === "@" || char === ":" || isAlpha(char)) {
						this.transitionTo("tagName");
						this.tagNameBuffer = "";
						this.delegate.beginStartTag();
						this.appendToTagName(char);
					}
				},
				markupDeclarationOpen: function() {
					if (this.consume() === "-" && this.input.charAt(this.index) === "-") {
						this.consume();
						this.transitionTo("commentStart");
						this.delegate.beginComment();
					}
				},
				commentStart: function() {
					var char = this.consume();
					if (char === "-") this.transitionTo("commentStartDash");
					else if (char === ">") {
						this.delegate.finishComment();
						this.transitionTo("beforeData");
					} else {
						this.delegate.appendToCommentData(char);
						this.transitionTo("comment");
					}
				},
				commentStartDash: function() {
					var char = this.consume();
					if (char === "-") this.transitionTo("commentEnd");
					else if (char === ">") {
						this.delegate.finishComment();
						this.transitionTo("beforeData");
					} else {
						this.delegate.appendToCommentData("-");
						this.transitionTo("comment");
					}
				},
				comment: function() {
					var char = this.consume();
					if (char === "-") this.transitionTo("commentEndDash");
					else this.delegate.appendToCommentData(char);
				},
				commentEndDash: function() {
					var char = this.consume();
					if (char === "-") this.transitionTo("commentEnd");
					else {
						this.delegate.appendToCommentData("-" + char);
						this.transitionTo("comment");
					}
				},
				commentEnd: function() {
					var char = this.consume();
					if (char === ">") {
						this.delegate.finishComment();
						this.transitionTo("beforeData");
					} else {
						this.delegate.appendToCommentData("--" + char);
						this.transitionTo("comment");
					}
				},
				tagName: function() {
					var char = this.consume();
					if (isSpace(char)) this.transitionTo("beforeAttributeName");
					else if (char === "/") this.transitionTo("selfClosingStartTag");
					else if (char === ">") {
						this.delegate.finishTag();
						this.transitionTo("beforeData");
					} else this.appendToTagName(char);
				},
				beforeAttributeName: function() {
					var char = this.peek();
					if (isSpace(char)) {
						this.consume();
						return;
					} else if (char === "/") {
						this.transitionTo("selfClosingStartTag");
						this.consume();
					} else if (char === ">") {
						this.consume();
						this.delegate.finishTag();
						this.transitionTo("beforeData");
					} else if (char === "=") {
						this.delegate.reportSyntaxError("attribute name cannot start with equals sign");
						this.transitionTo("attributeName");
						this.delegate.beginAttribute();
						this.consume();
						this.delegate.appendToAttributeName(char);
					} else {
						this.transitionTo("attributeName");
						this.delegate.beginAttribute();
					}
				},
				attributeName: function() {
					var char = this.peek();
					if (isSpace(char)) {
						this.transitionTo("afterAttributeName");
						this.consume();
					} else if (char === "/") {
						this.delegate.beginAttributeValue(false);
						this.delegate.finishAttributeValue();
						this.consume();
						this.transitionTo("selfClosingStartTag");
					} else if (char === "=") {
						this.transitionTo("beforeAttributeValue");
						this.consume();
					} else if (char === ">") {
						this.delegate.beginAttributeValue(false);
						this.delegate.finishAttributeValue();
						this.consume();
						this.delegate.finishTag();
						this.transitionTo("beforeData");
					} else if (char === "\"" || char === "'" || char === "<") {
						this.delegate.reportSyntaxError(char + " is not a valid character within attribute names");
						this.consume();
						this.delegate.appendToAttributeName(char);
					} else {
						this.consume();
						this.delegate.appendToAttributeName(char);
					}
				},
				afterAttributeName: function() {
					var char = this.peek();
					if (isSpace(char)) {
						this.consume();
						return;
					} else if (char === "/") {
						this.delegate.beginAttributeValue(false);
						this.delegate.finishAttributeValue();
						this.consume();
						this.transitionTo("selfClosingStartTag");
					} else if (char === "=") {
						this.consume();
						this.transitionTo("beforeAttributeValue");
					} else if (char === ">") {
						this.delegate.beginAttributeValue(false);
						this.delegate.finishAttributeValue();
						this.consume();
						this.delegate.finishTag();
						this.transitionTo("beforeData");
					} else {
						this.delegate.beginAttributeValue(false);
						this.delegate.finishAttributeValue();
						this.transitionTo("attributeName");
						this.delegate.beginAttribute();
						this.consume();
						this.delegate.appendToAttributeName(char);
					}
				},
				beforeAttributeValue: function() {
					var char = this.peek();
					if (isSpace(char)) this.consume();
					else if (char === "\"") {
						this.transitionTo("attributeValueDoubleQuoted");
						this.delegate.beginAttributeValue(true);
						this.consume();
					} else if (char === "'") {
						this.transitionTo("attributeValueSingleQuoted");
						this.delegate.beginAttributeValue(true);
						this.consume();
					} else if (char === ">") {
						this.delegate.beginAttributeValue(false);
						this.delegate.finishAttributeValue();
						this.consume();
						this.delegate.finishTag();
						this.transitionTo("beforeData");
					} else {
						this.transitionTo("attributeValueUnquoted");
						this.delegate.beginAttributeValue(false);
						this.consume();
						this.delegate.appendToAttributeValue(char);
					}
				},
				attributeValueDoubleQuoted: function() {
					var char = this.consume();
					if (char === "\"") {
						this.delegate.finishAttributeValue();
						this.transitionTo("afterAttributeValueQuoted");
					} else if (char === "&") this.delegate.appendToAttributeValue(this.consumeCharRef() || "&");
					else this.delegate.appendToAttributeValue(char);
				},
				attributeValueSingleQuoted: function() {
					var char = this.consume();
					if (char === "'") {
						this.delegate.finishAttributeValue();
						this.transitionTo("afterAttributeValueQuoted");
					} else if (char === "&") this.delegate.appendToAttributeValue(this.consumeCharRef() || "&");
					else this.delegate.appendToAttributeValue(char);
				},
				attributeValueUnquoted: function() {
					var char = this.peek();
					if (isSpace(char)) {
						this.delegate.finishAttributeValue();
						this.consume();
						this.transitionTo("beforeAttributeName");
					} else if (char === "/") {
						this.delegate.finishAttributeValue();
						this.consume();
						this.transitionTo("selfClosingStartTag");
					} else if (char === "&") {
						this.consume();
						this.delegate.appendToAttributeValue(this.consumeCharRef() || "&");
					} else if (char === ">") {
						this.delegate.finishAttributeValue();
						this.consume();
						this.delegate.finishTag();
						this.transitionTo("beforeData");
					} else {
						this.consume();
						this.delegate.appendToAttributeValue(char);
					}
				},
				afterAttributeValueQuoted: function() {
					var char = this.peek();
					if (isSpace(char)) {
						this.consume();
						this.transitionTo("beforeAttributeName");
					} else if (char === "/") {
						this.consume();
						this.transitionTo("selfClosingStartTag");
					} else if (char === ">") {
						this.consume();
						this.delegate.finishTag();
						this.transitionTo("beforeData");
					} else this.transitionTo("beforeAttributeName");
				},
				selfClosingStartTag: function() {
					if (this.peek() === ">") {
						this.consume();
						this.delegate.markTagAsSelfClosing();
						this.delegate.finishTag();
						this.transitionTo("beforeData");
					} else this.transitionTo("beforeAttributeName");
				},
				endTagOpen: function() {
					var char = this.consume();
					if (char === "@" || char === ":" || isAlpha(char)) {
						this.transitionTo("tagName");
						this.tagNameBuffer = "";
						this.delegate.beginEndTag();
						this.appendToTagName(char);
					}
				}
			};
			this.reset();
		}
		EventedTokenizer.prototype.reset = function() {
			this.transitionTo("beforeData");
			this.input = "";
			this.index = 0;
			this.line = 1;
			this.column = 0;
			this.delegate.reset();
		};
		EventedTokenizer.prototype.transitionTo = function(state) {
			this.state = state;
		};
		EventedTokenizer.prototype.tokenize = function(input) {
			this.reset();
			this.tokenizePart(input);
			this.tokenizeEOF();
		};
		EventedTokenizer.prototype.tokenizePart = function(input) {
			this.input += preprocessInput(input);
			while (this.index < this.input.length) {
				var handler = this.states[this.state];
				if (handler !== void 0) handler.call(this);
				else throw new Error("unhandled state " + this.state);
			}
		};
		EventedTokenizer.prototype.tokenizeEOF = function() {
			this.flushData();
		};
		EventedTokenizer.prototype.flushData = function() {
			if (this.state === "data") {
				this.delegate.finishData();
				this.transitionTo("beforeData");
			}
		};
		EventedTokenizer.prototype.peek = function() {
			return this.input.charAt(this.index);
		};
		EventedTokenizer.prototype.consume = function() {
			var char = this.peek();
			this.index++;
			if (char === "\n") {
				this.line++;
				this.column = 0;
			} else this.column++;
			return char;
		};
		EventedTokenizer.prototype.consumeCharRef = function() {
			var endIndex = this.input.indexOf(";", this.index);
			if (endIndex === -1) return;
			var entity = this.input.slice(this.index, endIndex);
			var chars = this.entityParser.parse(entity);
			if (chars) {
				var count = entity.length;
				while (count) {
					this.consume();
					count--;
				}
				this.consume();
				return chars;
			}
		};
		EventedTokenizer.prototype.markTagStart = function() {
			this.delegate.tagOpen();
		};
		EventedTokenizer.prototype.appendToTagName = function(char) {
			this.tagNameBuffer += char;
			this.delegate.appendToTagName(char);
		};
		return EventedTokenizer;
	}();
	var Tokenizer = function() {
		function Tokenizer(entityParser, options) {
			if (options === void 0) options = {};
			this.options = options;
			this.token = null;
			this.startLine = 1;
			this.startColumn = 0;
			this.tokens = [];
			this.tokenizer = new EventedTokenizer(this, entityParser);
			this._currentAttribute = void 0;
		}
		Tokenizer.prototype.tokenize = function(input) {
			this.tokens = [];
			this.tokenizer.tokenize(input);
			return this.tokens;
		};
		Tokenizer.prototype.tokenizePart = function(input) {
			this.tokens = [];
			this.tokenizer.tokenizePart(input);
			return this.tokens;
		};
		Tokenizer.prototype.tokenizeEOF = function() {
			this.tokens = [];
			this.tokenizer.tokenizeEOF();
			return this.tokens[0];
		};
		Tokenizer.prototype.reset = function() {
			this.token = null;
			this.startLine = 1;
			this.startColumn = 0;
		};
		Tokenizer.prototype.current = function() {
			var token = this.token;
			if (token === null) throw new Error("token was unexpectedly null");
			if (arguments.length === 0) return token;
			for (var i = 0; i < arguments.length; i++) if (token.type === arguments[i]) return token;
			throw new Error("token type was unexpectedly " + token.type);
		};
		Tokenizer.prototype.push = function(token) {
			this.token = token;
			this.tokens.push(token);
		};
		Tokenizer.prototype.currentAttribute = function() {
			return this._currentAttribute;
		};
		Tokenizer.prototype.addLocInfo = function() {
			if (this.options.loc) this.current().loc = {
				start: {
					line: this.startLine,
					column: this.startColumn
				},
				end: {
					line: this.tokenizer.line,
					column: this.tokenizer.column
				}
			};
			this.startLine = this.tokenizer.line;
			this.startColumn = this.tokenizer.column;
		};
		Tokenizer.prototype.beginData = function() {
			this.push({
				type: "Chars",
				chars: ""
			});
		};
		Tokenizer.prototype.appendToData = function(char) {
			this.current("Chars").chars += char;
		};
		Tokenizer.prototype.finishData = function() {
			this.addLocInfo();
		};
		Tokenizer.prototype.beginComment = function() {
			this.push({
				type: "Comment",
				chars: ""
			});
		};
		Tokenizer.prototype.appendToCommentData = function(char) {
			this.current("Comment").chars += char;
		};
		Tokenizer.prototype.finishComment = function() {
			this.addLocInfo();
		};
		Tokenizer.prototype.tagOpen = function() {};
		Tokenizer.prototype.beginStartTag = function() {
			this.push({
				type: "StartTag",
				tagName: "",
				attributes: [],
				selfClosing: false
			});
		};
		Tokenizer.prototype.beginEndTag = function() {
			this.push({
				type: "EndTag",
				tagName: ""
			});
		};
		Tokenizer.prototype.finishTag = function() {
			this.addLocInfo();
		};
		Tokenizer.prototype.markTagAsSelfClosing = function() {
			this.current("StartTag").selfClosing = true;
		};
		Tokenizer.prototype.appendToTagName = function(char) {
			this.current("StartTag", "EndTag").tagName += char;
		};
		Tokenizer.prototype.beginAttribute = function() {
			this._currentAttribute = [
				"",
				"",
				false
			];
		};
		Tokenizer.prototype.appendToAttributeName = function(char) {
			this.currentAttribute()[0] += char;
		};
		Tokenizer.prototype.beginAttributeValue = function(isQuoted) {
			this.currentAttribute()[2] = isQuoted;
		};
		Tokenizer.prototype.appendToAttributeValue = function(char) {
			this.currentAttribute()[1] += char;
		};
		Tokenizer.prototype.finishAttributeValue = function() {
			this.current("StartTag").attributes.push(this._currentAttribute);
		};
		Tokenizer.prototype.reportSyntaxError = function(message) {
			this.current().syntaxError = message;
		};
		return Tokenizer;
	}();

// packages/blocks/build-module/api/validation/logger.mjs
	function createLogger() {
		/**
		* Creates a log handler with block validation prefix.
		*
		* @param logger Original logger function.
		*
		* @return Augmented logger function.
		*/
		function createLogHandler(logger) {
			return (message, ...args) => logger("Block validation: " + message, ...args);
		}
		return {
			error: createLogHandler(console.error),
			warning: createLogHandler(console.warn),
			getItems() {
				return [];
			}
		};
	}
	function createQueuedLogger() {
		/**
		* The list of enqueued log actions to print.
		*/
		const queue = [];
		const logger = createLogger();
		return {
			error(...args) {
				queue.push({
					log: logger.error,
					args
				});
			},
			warning(...args) {
				queue.push({
					log: logger.warning,
					args
				});
			},
			getItems() {
				return queue;
			}
		};
	}

// packages/blocks/build-module/api/validation/index.mjs
	const identity = (x) => x;
	/**
	* Globally matches any consecutive whitespace
	*/
	const REGEXP_WHITESPACE = /[\t\n\r\v\f ]+/g;
	/**
	* Matches a string containing only whitespace
	*/
	const REGEXP_ONLY_WHITESPACE = /^[\t\n\r\v\f ]*$/;
	/**
	* Matches a CSS URL type value
	*/
	const REGEXP_STYLE_URL_TYPE = /^url\s*\(['"\s]*(.*?)['"\s]*\)$/;
	/**
	* Boolean attributes are attributes whose presence as being assigned is
	* meaningful, even if only empty.
	*
	* See: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
	* Extracted from: https://html.spec.whatwg.org/multipage/indices.html#attributes-3
	*
	* Object.keys( Array.from( document.querySelectorAll( '#attributes-1 > tbody > tr' ) )
	*     .filter( ( tr ) => tr.lastChild.textContent.indexOf( 'Boolean attribute' ) !== -1 )
	*     .reduce( ( result, tr ) => Object.assign( result, {
	*         [ tr.firstChild.textContent.trim() ]: true
	*     } ), {} ) ).sort();
	*/
	const BOOLEAN_ATTRIBUTES = [
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
	];
	/**
	* Enumerated attributes are attributes which must be of a specific value form.
	* Like boolean attributes, these are meaningful if specified, even if not of a
	* valid enumerated value.
	*
	* See: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#enumerated-attribute
	* Extracted from: https://html.spec.whatwg.org/multipage/indices.html#attributes-3
	*
	* Object.keys( Array.from( document.querySelectorAll( '#attributes-1 > tbody > tr' ) )
	*     .filter( ( tr ) => /^("(.+?)";?\s*)+/.test( tr.lastChild.textContent.trim() ) )
	*     .reduce( ( result, tr ) => Object.assign( result, {
	*         [ tr.firstChild.textContent.trim() ]: true
	*     } ), {} ) ).sort();
	*/
	const ENUMERATED_ATTRIBUTES = [
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
	];
	/**
	* Meaningful attributes are those who cannot be safely ignored when omitted in
	* one HTML markup string and not another.
	*/
	const MEANINGFUL_ATTRIBUTES = [...BOOLEAN_ATTRIBUTES, ...ENUMERATED_ATTRIBUTES];
	/**
	* Array of functions which receive a text string on which to apply normalizing
	* behavior for consideration in text token equivalence, carefully ordered from
	* least-to-most expensive operations.
	*
	*/
	const TEXT_NORMALIZATIONS = [identity, getTextWithCollapsedWhitespace];
	/**
	* Regular expression matching a named character reference. In lieu of bundling
	* a full set of references, the pattern covers the minimal necessary to test
	* positively against the full set.
	*
	* "The ampersand must be followed by one of the names given in the named
	* character references section, using the same case."
	*
	* Tested against "12.5 Named character references":
	*
	* ```
	* const references = Array.from( document.querySelectorAll(
	*     '#named-character-references-table tr[id^=entity-] td:first-child'
	* ) ).map( ( code ) => code.textContent )
	* references.every( ( reference ) => /^[\da-z]+$/i.test( reference ) )
	* ```
	*
	* @see https://html.spec.whatwg.org/multipage/syntax.html#character-references
	* @see https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references
	*/
	const REGEXP_NAMED_CHARACTER_REFERENCE = /^[\da-z]+$/i;
	/**
	* Regular expression matching a decimal character reference.
	*
	* "The ampersand must be followed by a U+0023 NUMBER SIGN character (#),
	* followed by one or more ASCII digits, representing a base-ten integer"
	*
	* @see https://html.spec.whatwg.org/multipage/syntax.html#character-references
	*/
	const REGEXP_DECIMAL_CHARACTER_REFERENCE = /^#\d+$/;
	/**
	* Regular expression matching a hexadecimal character reference.
	*
	* "The ampersand must be followed by a U+0023 NUMBER SIGN character (#), which
	* must be followed by either a U+0078 LATIN SMALL LETTER X character (x) or a
	* U+0058 LATIN CAPITAL LETTER X character (X), which must then be followed by
	* one or more ASCII hex digits, representing a hexadecimal integer"
	*
	* @see https://html.spec.whatwg.org/multipage/syntax.html#character-references
	*/
	const REGEXP_HEXADECIMAL_CHARACTER_REFERENCE = /^#x[\da-f]+$/i;
	/**
	* Returns true if the given string is a valid character reference segment, or
	* false otherwise. The text should be stripped of `&` and `;` demarcations.
	*
	* @param text Text to test.
	*
	* @return Whether text is valid character reference.
	*/
	function isValidCharacterReference(text) {
		return REGEXP_NAMED_CHARACTER_REFERENCE.test(text) || REGEXP_DECIMAL_CHARACTER_REFERENCE.test(text) || REGEXP_HEXADECIMAL_CHARACTER_REFERENCE.test(text);
	}
	/**
	* Substitute EntityParser class for `simple-html-tokenizer` which uses the
	* implementation of `decodeEntities` from `html-entities`, in order to avoid
	* bundling a massive named character reference.
	*
	* @see https://github.com/tildeio/simple-html-tokenizer/tree/HEAD/src/entity-parser.ts
	*/
	var DecodeEntityParser = class {
		/**
		* Returns a substitute string for an entity string sequence between `&`
		* and `;`, or undefined if no substitution should occur.
		*
		* @param entity Entity fragment discovered in HTML.
		*
		* @return Entity substitute value.
		*/
		parse(entity) {
			if (isValidCharacterReference(entity)) return (0, _wordpress_html_entities.decodeEntities)("&" + entity + ";");
		}
	};
	/**
	* Given a specified string, returns an array of strings split by consecutive
	* whitespace, ignoring leading or trailing whitespace.
	*
	* @param text Original text.
	*
	* @return Text pieces split on whitespace.
	*/
	function getTextPiecesSplitOnWhitespace(text) {
		return text.trim().split(REGEXP_WHITESPACE);
	}
	/**
	* Given a specified string, returns a new trimmed string where all consecutive
	* whitespace is collapsed to a single space.
	*
	* @param text Original text.
	*
	* @return Trimmed text with consecutive whitespace collapsed.
	*/
	function getTextWithCollapsedWhitespace(text) {
		return getTextPiecesSplitOnWhitespace(text).join(" ");
	}
	/**
	* Returns attribute pairs of the given StartTag token, including only pairs
	* where the value is non-empty or the attribute is a boolean attribute, an
	* enumerated attribute, or a custom data- attribute.
	*
	* @see MEANINGFUL_ATTRIBUTES
	*
	* @param token StartTag token.
	*
	* @return Attribute pairs.
	*/
	function getMeaningfulAttributePairs(token) {
		return (token.attributes ?? []).filter((pair) => {
			const [key, value] = pair;
			return value || key.indexOf("data-") === 0 || MEANINGFUL_ATTRIBUTES.includes(key);
		});
	}
	/**
	* Returns true if two text tokens (with `chars` property) are equivalent, or
	* false otherwise.
	*
	* @param actual   Actual token.
	* @param expected Expected token.
	* @param logger   Validation logger object.
	*
	* @return Whether two text tokens are equivalent.
	*/
	function isEquivalentTextTokens(actual, expected, logger = createLogger()) {
		let actualChars = actual.chars;
		let expectedChars = expected.chars;
		for (let i = 0; i < TEXT_NORMALIZATIONS.length; i++) {
			const normalize = TEXT_NORMALIZATIONS[i];
			actualChars = normalize(actualChars);
			expectedChars = normalize(expectedChars);
			if (actualChars === expectedChars) return true;
		}
		logger.warning("Expected text `%s`, saw `%s`.", expected.chars, actual.chars);
		return false;
	}
	/**
	* Given a CSS length value, returns a normalized CSS length value for strict equality
	* comparison.
	*
	* @param value CSS length value.
	*
	* @return Normalized CSS length value.
	*/
	function getNormalizedLength(value) {
		if (0 === parseFloat(value)) return "0";
		if (value.indexOf(".") === 0) return "0" + value;
		return value;
	}
	/**
	* Given a style value, returns a normalized style value for strict equality
	* comparison.
	*
	* @param value Style value.
	*
	* @return Normalized style value.
	*/
	function getNormalizedStyleValue(value) {
		return getTextPiecesSplitOnWhitespace(value).map(getNormalizedLength).join(" ").replace(REGEXP_STYLE_URL_TYPE, "url($1)");
	}
	/**
	* Given a style attribute string, returns an object of style properties.
	*
	* @param text Style attribute.
	*
	* @return Style properties.
	*/
	function getStyleProperties(text) {
		const pairs = text.replace(/;?\s*$/, "").split(";").map((style) => {
			const [key, ...valueParts] = style.split(":");
			const value = valueParts.join(":");
			return [key.trim(), getNormalizedStyleValue(value.trim())];
		});
		return Object.fromEntries(pairs);
	}
	/**
	* Attribute-specific equality handlers
	*/
	const isEqualAttributesOfName = {
		class: (actual, expected) => {
			const [actualPieces, expectedPieces] = [actual, expected].map(getTextPiecesSplitOnWhitespace);
			const actualDiff = actualPieces.filter((c) => !expectedPieces.includes(c));
			const expectedDiff = expectedPieces.filter((c) => !actualPieces.includes(c));
			return actualDiff.length === 0 && expectedDiff.length === 0;
		},
		style: (actual, expected) => {
			return (0, import_es6.default)(...[actual, expected].map(getStyleProperties));
		},
		...Object.fromEntries(BOOLEAN_ATTRIBUTES.map((attribute) => [attribute, () => true]))
	};
	/**
	* Given two sets of attribute tuples, returns true if the attribute sets are
	* equivalent.
	*
	* @param actual   Actual attributes tuples.
	* @param expected Expected attributes tuples.
	* @param logger   Validation logger object.
	*
	* @return Whether attributes are equivalent.
	*/
	function isEqualTagAttributePairs(actual, expected, logger = createLogger()) {
		if (actual.length !== expected.length) {
			logger.warning("Expected attributes %o, instead saw %o.", expected, actual);
			return false;
		}
		const expectedAttributes = {};
		for (let i = 0; i < expected.length; i++) expectedAttributes[expected[i][0].toLowerCase()] = expected[i][1];
		for (let i = 0; i < actual.length; i++) {
			const [name, actualValue] = actual[i];
			const nameLower = name.toLowerCase();
			if (!expectedAttributes.hasOwnProperty(nameLower)) {
				logger.warning("Encountered unexpected attribute `%s`.", name);
				return false;
			}
			const expectedValue = expectedAttributes[nameLower];
			const isEqualAttributes = isEqualAttributesOfName[nameLower];
			if (isEqualAttributes) {
				if (!isEqualAttributes(actualValue, expectedValue)) {
					logger.warning("Expected attribute `%s` of value `%s`, saw `%s`.", name, expectedValue, actualValue);
					return false;
				}
			} else if (actualValue !== expectedValue) {
				logger.warning("Expected attribute `%s` of value `%s`, saw `%s`.", name, expectedValue, actualValue);
				return false;
			}
		}
		return true;
	}
	/**
	* Token-type-specific equality handlers
	*/
	const isEqualTokensOfType = {
		StartTag: (actual, expected, logger = createLogger()) => {
			if (actual.tagName !== expected.tagName && actual.tagName.toLowerCase() !== expected.tagName.toLowerCase()) {
				logger.warning("Expected tag name `%s`, instead saw `%s`.", expected.tagName, actual.tagName);
				return false;
			}
			return isEqualTagAttributePairs(...[actual, expected].map(getMeaningfulAttributePairs), logger);
		},
		Chars: isEquivalentTextTokens,
		Comment: isEquivalentTextTokens
	};
	/**
	* Given an array of tokens, returns the first token which is not purely
	* whitespace.
	*
	* Mutates the tokens array.
	*
	* @param tokens Set of tokens to search.
	*
	* @return Next non-whitespace token.
	*/
	function getNextNonWhitespaceToken(tokens) {
		let token;
		while (token = tokens.shift()) {
			if (token.type !== "Chars") return token;
			if (!REGEXP_ONLY_WHITESPACE.test(token.chars)) return token;
		}
	}
	/**
	* Tokenize an HTML string, gracefully handling any errors thrown during
	* underlying tokenization.
	*
	* @param html   HTML string to tokenize.
	* @param logger Validation logger object.
	*
	* @return Array of valid tokenized HTML elements, or null on error
	*/
	function getHTMLTokens(html, logger = createLogger()) {
		try {
			return new Tokenizer(new DecodeEntityParser()).tokenize(html);
		} catch {
			logger.warning("Malformed HTML detected: %s", html);
		}
		return null;
	}
	/**
	* Returns true if the next HTML token closes the current token.
	*
	* @param currentToken Current token to compare with.
	* @param nextToken    Next token to compare against.
	*
	* @return true if `nextToken` closes `currentToken`, false otherwise
	*/
	function isClosedByToken(currentToken, nextToken) {
		if (!currentToken.selfClosing) return false;
		if (nextToken && nextToken.tagName === currentToken.tagName && nextToken.type === "EndTag") return true;
		return false;
	}
	/**
	* Returns true if the given HTML strings are effectively equivalent, or
	* false otherwise. Invalid HTML is not considered equivalent, even if the
	* strings directly match.
	*
	* @param actual   Actual HTML string.
	* @param expected Expected HTML string.
	* @param logger   Validation logger object.
	*
	* @return Whether HTML strings are equivalent.
	*/
	function isEquivalentHTML(actual, expected, logger = createLogger()) {
		if (actual === expected) return true;
		const [actualTokens, expectedTokens] = [actual, expected].map((html) => getHTMLTokens(html, logger));
		if (!actualTokens || !expectedTokens) return false;
		let actualToken, expectedToken;
		while (actualToken = getNextNonWhitespaceToken(actualTokens)) {
			expectedToken = getNextNonWhitespaceToken(expectedTokens);
			if (!expectedToken) {
				logger.warning("Expected end of content, instead saw %o.", actualToken);
				return false;
			}
			if (actualToken.type !== expectedToken.type) {
				logger.warning("Expected token of type `%s` (%o), instead saw `%s` (%o).", expectedToken.type, expectedToken, actualToken.type, actualToken);
				return false;
			}
			const isEqualTokens = isEqualTokensOfType[actualToken.type];
			if (isEqualTokens && !isEqualTokens(actualToken, expectedToken, logger)) return false;
			if (isClosedByToken(actualToken, expectedTokens[0])) getNextNonWhitespaceToken(expectedTokens);
			else if (isClosedByToken(expectedToken, actualTokens[0])) getNextNonWhitespaceToken(actualTokens);
		}
		if (expectedToken = getNextNonWhitespaceToken(expectedTokens)) {
			logger.warning("Expected %o, instead saw end of content.", expectedToken);
			return false;
		}
		return true;
	}
	/**
	* Returns an object with `isValid` property set to `true` if the parsed block
	* is valid given the input content. A block is considered valid if, when serialized
	* with assumed attributes, the content matches the original value. If block is
	* invalid, this function returns all validations issues as well.
	*
	* @param block           Block object.
	* @param blockTypeOrName Block type or name, inferred from block if not given.
	*
	* @return Validation results.
	*/
	function validateBlock(block, blockTypeOrName = block.name) {
		if (block.name === getFreeformContentHandlerName() || block.name === getUnregisteredTypeHandlerName()) return [true, []];
		const logger = createQueuedLogger();
		const blockType = normalizeBlockType(blockTypeOrName);
		let generatedBlockContent;
		try {
			generatedBlockContent = getSaveContent(blockType, block.attributes);
		} catch (error) {
			logger.error("Block validation failed because an error occurred while generating block content:\n\n%s", error.toString());
			return [false, logger.getItems()];
		}
		const isValid = isEquivalentHTML(block.originalContent, generatedBlockContent, logger);
		if (!isValid) logger.error("Block validation failed for `%s` (%o).\n\nContent generated by `save` function:\n\n%s\n\nContent retrieved from post body:\n\n%s", blockType.name, blockType, generatedBlockContent, block.originalContent);
		return [isValid, logger.getItems()];
	}
	/**
	* Returns true if the parsed block is valid given the input content. A block
	* is considered valid if, when serialized with assumed attributes, the content
	* matches the original value.
	*
	* Logs to console in development environments when invalid.
	*
	* @deprecated Use validateBlock instead to avoid data loss.
	*
	* @param      blockTypeOrName      Block type.
	* @param      attributes           Parsed block attributes.
	* @param      originalBlockContent Original block content.
	*
	* @return Whether block is valid.
	*/
	function isValidBlockContent(blockTypeOrName, attributes, originalBlockContent) {
		(0, _wordpress_deprecated.default)("isValidBlockContent introduces opportunity for data loss", {
			since: "12.6",
			plugin: "Gutenberg",
			alternative: "validateBlock"
		});
		const blockType = normalizeBlockType(blockTypeOrName);
		const [isValid] = validateBlock({
			clientId: "",
			name: blockType.name,
			isValid: true,
			attributes,
			innerBlocks: [],
			originalContent: originalBlockContent
		}, blockType);
		return isValid;
	}

// packages/blocks/build-module/api/parser/convert-legacy-block.mjs
/**
	* Convert legacy blocks to their canonical form. This function is used
	* both in the parser level for previous content and to convert such blocks
	* used in Custom Post Types templates.
	*
	* @param name       The block's name
	* @param attributes The block's attributes
	*
	* @return The block's name and attributes, changed accordingly if a match was found
	*/
	function convertLegacyBlockNameAndAttributes(name, attributes) {
		const newAttributes = { ...attributes };
		if ("core/cover-image" === name) name = "core/cover";
		if ("core/text" === name || "core/cover-text" === name) name = "core/paragraph";
		if (name && name.indexOf("core/social-link-") === 0) {
			newAttributes.service = name.substring(17);
			name = "core/social-link";
		}
		if (name && name.indexOf("core-embed/") === 0) {
			const providerSlug = name.substring(11);
			const deprecated = {
				speaker: "speaker-deck",
				polldaddy: "crowdsignal"
			};
			newAttributes.providerNameSlug = providerSlug in deprecated ? deprecated[providerSlug] : providerSlug;
			if (!["amazon-kindle", "wordpress"].includes(providerSlug)) newAttributes.responsive = true;
			name = "core/embed";
		}
		if (name === "core/post-comment-author") name = "core/comment-author-name";
		if (name === "core/post-comment-content") name = "core/comment-content";
		if (name === "core/post-comment-date") name = "core/comment-date";
		if (name === "core/comments-query-loop") {
			name = "core/comments";
			const className = newAttributes.className ?? "";
			if (!className.includes("wp-block-comments-query-loop")) newAttributes.className = ["wp-block-comments-query-loop", className].join(" ");
		}
		if (name === "core/post-comments") {
			name = "core/comments";
			newAttributes.legacy = true;
		}
		const layout = attributes.layout;
		if (layout?.type === "grid" && typeof layout?.columnCount === "string") newAttributes.layout = {
			...newAttributes.layout,
			columnCount: parseInt(layout.columnCount, 10)
		};
		const styleLayout = attributes.style?.layout;
		if (typeof styleLayout?.columnSpan === "string") {
			const columnSpanNumber = parseInt(styleLayout.columnSpan, 10);
			newAttributes.style = {
				...newAttributes.style,
				layout: {
					...newAttributes.style?.layout,
					columnSpan: isNaN(columnSpanNumber) ? void 0 : columnSpanNumber
				}
			};
		}
		if (typeof styleLayout?.rowSpan === "string") {
			const rowSpanNumber = parseInt(styleLayout.rowSpan, 10);
			newAttributes.style = {
				...newAttributes.style,
				layout: {
					...newAttributes.style?.layout,
					rowSpan: isNaN(rowSpanNumber) ? void 0 : rowSpanNumber
				}
			};
		}
		return [name, newAttributes];
	}

// node_modules/.store/hpq@1.4.0-W9NdSIZtdLeCHL5yGEJLvQ/node_modules/hpq/es/get-path.js
/**
	* Given object and string of dot-delimited path segments, returns value at
	* path or undefined if path cannot be resolved.
	*
	* @param object Lookup object
	* @param path   Path to resolve
	* @return       Resolved value
	*/
	function getPath(object, path) {
		var segments = path.split(".");
		var segment;
		while (segment = segments.shift()) {
			if (!(segment in object)) return;
			object = object[segment];
		}
		return object;
	}

// node_modules/.store/hpq@1.4.0-W9NdSIZtdLeCHL5yGEJLvQ/node_modules/hpq/es/index.js
/**
	* Internal dependencies
	*/
	/**
	* Function returning a DOM document created by `createHTMLDocument`. The same
	* document is returned between invocations.
	*
	* @return DOM document.
	*/
	var getDocument = function() {
		var doc;
		return function() {
			if (!doc) doc = document.implementation.createHTMLDocument("");
			return doc;
		};
	}();
	/**
	* Given a markup string or DOM element, creates an object aligning with the
	* shape of the matchers object, or the value returned by the matcher.
	*
	* @param source Source content
	* @param matchers Matcher function or object of matchers
	*/
	/**
	* Given a markup string or DOM element, creates an object aligning with the
	* shape of the matchers object, or the value returned by the matcher.
	*
	* @param source Source content
	* @param matchers Matcher function or object of matchers
	*/
	function parse$2(source, matchers) {
		if (!matchers) return;
		if ("string" === typeof source) {
			var doc = getDocument();
			doc.body.innerHTML = source;
			source = doc.body;
		}
		if (typeof matchers === "function") return matchers(source);
		if (Object !== matchers.constructor) return;
		return Object.keys(matchers).reduce(function(memo, key) {
			var inner = matchers[key];
			memo[key] = parse$2(source, inner);
			return memo;
		}, {});
	}
	/**
	* Generates a function which matches node of type selector, returning an
	* attribute by property if the attribute exists. If no selector is passed,
	* returns property of the query element.
	*
	* @param name Property name
	* @return Property value
	*/
	/**
	* Generates a function which matches node of type selector, returning an
	* attribute by property if the attribute exists. If no selector is passed,
	* returns property of the query element.
	*
	* @param selector Optional selector
	* @param name Property name
	* @return Property value
	*/
	function prop(arg1, arg2) {
		var name;
		var selector;
		if (1 === arguments.length) {
			name = arg1;
			selector = void 0;
		} else {
			name = arg2;
			selector = arg1;
		}
		return function(node) {
			var match = node;
			if (selector) match = node.querySelector(selector);
			if (match) return getPath(match, name);
		};
	}
	/**
	* Generates a function which matches node of type selector, returning an
	* attribute by name if the attribute exists. If no selector is passed,
	* returns attribute of the query element.
	*
	* @param name Attribute name
	* @return Attribute value
	*/
	/**
	* Generates a function which matches node of type selector, returning an
	* attribute by name if the attribute exists. If no selector is passed,
	* returns attribute of the query element.
	*
	* @param selector Optional selector
	* @param name Attribute name
	* @return Attribute value
	*/
	function attr(arg1, arg2) {
		var name;
		var selector;
		if (1 === arguments.length) {
			name = arg1;
			selector = void 0;
		} else {
			name = arg2;
			selector = arg1;
		}
		return function(node) {
			var attributes = prop(selector, "attributes")(node);
			if (attributes && Object.prototype.hasOwnProperty.call(attributes, name)) return attributes[name].value;
		};
	}
	/**
	* Convenience for `prop( selector, 'textContent' )`.
	*
	* @see prop()
	*
	* @param selector Optional selector
	* @return Text content
	*/
	function text(selector) {
		return prop(selector, "textContent");
	}
	/**
	* Creates a new matching context by first finding elements matching selector
	* using querySelectorAll before then running another `parse` on `matchers`
	* scoped to the matched elements.
	*
	* @see parse()
	*
	* @param selector Selector to match
	* @param matchers Matcher function or object of matchers
	* @return Matcher function which returns an array of matched value(s)
	*/
	function query(selector, matchers) {
		return function(node) {
			var matches = node.querySelectorAll(selector);
			return [].map.call(matches, function(match) {
				return parse$2(match, matchers);
			});
		};
	}

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

// packages/blocks/build-module/api/children.mjs
/**
	* Given block children, returns a serialize-capable WordPress element.
	*
	* @param children Block children object to convert.
	*
	* @return A serialize-capable element.
	*/
	function getSerializeCapableElement(children) {
		return children;
	}
	/**
	* Given block children, returns an array of block nodes.
	*
	* @param children Block children object to convert.
	*
	* @return An array of individual block nodes.
	*/
	function getChildrenArray(children) {
		(0, _wordpress_deprecated.default)("wp.blocks.children.getChildrenArray", {
			since: "6.1",
			version: "6.3",
			link: "https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/introducing-attributes-and-editable-fields/"
		});
		return children;
	}
	/**
	* Given two or more block nodes, returns a new block node representing a
	* concatenation of its values.
	*
	* @param blockNodes Block nodes to concatenate.
	*
	* @return Concatenated block node.
	*/
	function concat(...blockNodes) {
		(0, _wordpress_deprecated.default)("wp.blocks.children.concat", {
			since: "6.1",
			version: "6.3",
			alternative: "wp.richText.concat",
			link: "https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/introducing-attributes-and-editable-fields/"
		});
		const result = [];
		for (let i = 0; i < blockNodes.length; i++) {
			const blockNode = Array.isArray(blockNodes[i]) ? blockNodes[i] : [blockNodes[i]];
			for (let j = 0; j < blockNode.length; j++) {
				const child = blockNode[j];
				if (typeof child === "string" && typeof result[result.length - 1] === "string") result[result.length - 1] += child;
				else result.push(child);
			}
		}
		return result;
	}
	/**
	* Given an iterable set of DOM nodes, returns equivalent block children.
	* Ignores any non-element/text nodes included in set.
	*
	* @param domNodes Iterable set of DOM nodes to convert.
	*
	* @return Block children equivalent to DOM nodes.
	*/
	function fromDOM$1(domNodes) {
		(0, _wordpress_deprecated.default)("wp.blocks.children.fromDOM", {
			since: "6.1",
			version: "6.3",
			alternative: "wp.richText.create",
			link: "https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/introducing-attributes-and-editable-fields/"
		});
		const result = [];
		for (let i = 0; i < domNodes.length; i++) try {
			result.push(fromDOM(domNodes[i]));
		} catch {}
		return result;
	}
	/**
	* Given a block node, returns its HTML string representation.
	*
	* @param children Block node(s) to convert to string.
	*
	* @return String HTML representation of block node.
	*/
	function toHTML$1(children) {
		(0, _wordpress_deprecated.default)("wp.blocks.children.toHTML", {
			since: "6.1",
			version: "6.3",
			alternative: "wp.richText.toHTMLString",
			link: "https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/introducing-attributes-and-editable-fields/"
		});
		const element = getSerializeCapableElement(children);
		return (0, _wordpress_element.renderToString)(element);
	}
	/**
	* Given a selector, returns an hpq matcher generating a BlockChildren value
	* matching the selector result.
	*
	* @param selector DOM selector.
	*
	* @return hpq matcher.
	*/
	function matcher$1(selector) {
		(0, _wordpress_deprecated.default)("wp.blocks.children.matcher", {
			since: "6.1",
			version: "6.3",
			alternative: "html source",
			link: "https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/introducing-attributes-and-editable-fields/"
		});
		return (domNode) => {
			let match = domNode;
			if (selector) match = domNode.querySelector(selector);
			if (match) return fromDOM$1(match.childNodes);
			return [];
		};
	}
	/**
	* Object of utility functions used in managing block attribute values of
	* source `children`.
	*
	* @see https://github.com/WordPress/gutenberg/pull/10439
	*
	* @deprecated since 4.0. The `children` source should not be used, and can be
	*             replaced by the `html` source.
	*
	* @private
	*/
	var children_default = {
		concat,
		getChildrenArray,
		fromDOM: fromDOM$1,
		toHTML: toHTML$1,
		matcher: matcher$1
	};

// packages/blocks/build-module/api/node.mjs
/**
	* Given a single node and a node type (e.g. `'br'`), returns true if the node
	* corresponds to that type, false otherwise.
	*
	* @param node Block node to test
	* @param type Node to type to test against.
	*
	* @return Whether node is of intended type.
	*/
	function isNodeOfType(node, type) {
		(0, _wordpress_deprecated.default)("wp.blocks.node.isNodeOfType", {
			since: "6.1",
			version: "6.3",
			link: "https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/introducing-attributes-and-editable-fields/"
		});
		return typeof node !== "string" && node?.type === type;
	}
	/**
	* Given an object implementing the NamedNodeMap interface, returns a plain
	* object equivalent value of name, value key-value pairs.
	*
	* @see https://dom.spec.whatwg.org/#interface-namednodemap
	*
	* @param nodeMap NamedNodeMap to convert to object.
	*
	* @return Object equivalent value of NamedNodeMap.
	*/
	function getNamedNodeMapAsObject(nodeMap) {
		const result = {};
		for (let i = 0; i < nodeMap.length; i++) {
			const { name, value } = nodeMap[i];
			result[name] = value;
		}
		return result;
	}
	/**
	* Given a DOM Element or Text node, returns an equivalent block node. Throws
	* if passed any node type other than element or text.
	*
	* @throws {TypeError} If non-element/text node is passed.
	*
	* @param  domNode DOM node to convert.
	*
	* @return Block node equivalent to DOM node.
	*/
	function fromDOM(domNode) {
		(0, _wordpress_deprecated.default)("wp.blocks.node.fromDOM", {
			since: "6.1",
			version: "6.3",
			alternative: "wp.richText.create",
			link: "https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/introducing-attributes-and-editable-fields/"
		});
		if (domNode.nodeType === domNode.TEXT_NODE) return domNode.nodeValue;
		if (domNode.nodeType !== domNode.ELEMENT_NODE) throw new TypeError("A block node can only be created from a node of type text or element.");
		return {
			type: domNode.nodeName.toLowerCase(),
			props: {
				...getNamedNodeMapAsObject(domNode.attributes),
				children: fromDOM$1(domNode.childNodes)
			}
		};
	}
	/**
	* Given a block node, returns its HTML string representation.
	*
	* @param node Block node to convert to string.
	*
	* @return String HTML representation of block node.
	*/
	function toHTML(node) {
		(0, _wordpress_deprecated.default)("wp.blocks.node.toHTML", {
			since: "6.1",
			version: "6.3",
			alternative: "wp.richText.toHTMLString",
			link: "https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/introducing-attributes-and-editable-fields/"
		});
		return toHTML$1([node]);
	}
	/**
	* Given a selector, returns an hpq matcher generating a BlockNode value
	* matching the selector result.
	*
	* @param selector DOM selector.
	*
	* @return hpq matcher.
	*/
	function matcher(selector) {
		(0, _wordpress_deprecated.default)("wp.blocks.node.matcher", {
			since: "6.1",
			version: "6.3",
			alternative: "html source",
			link: "https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/introducing-attributes-and-editable-fields/"
		});
		return (domNode) => {
			let match = domNode;
			if (selector) match = domNode.querySelector(selector);
			try {
				return fromDOM(match);
			} catch {
				return null;
			}
		};
	}
	/**
	* Object of utility functions used in managing block attribute values of
	* source `node`.
	*
	* @see https://github.com/WordPress/gutenberg/pull/10439
	*
	* @deprecated since 4.0. The `node` source should not be used, and can be
	*             replaced by the `html` source.
	*
	* @private
	*/
	var node_default = {
		isNodeOfType,
		fromDOM,
		toHTML,
		matcher
	};

// packages/blocks/build-module/api/matchers.mjs
	function html(selector, multilineTag) {
		return (domNode) => {
			let match = domNode;
			if (selector) match = domNode.querySelector(selector);
			if (!match) return "";
			if (multilineTag) {
				let value = "";
				const length = match.children.length;
				for (let index = 0; index < length; index++) {
					const child = match.children[index];
					if (child.nodeName.toLowerCase() !== multilineTag) continue;
					value += child.outerHTML;
				}
				return value;
			}
			return match.innerHTML;
		};
	}
	const richText = (selector, preserveWhiteSpace) => (el) => {
		const target = selector ? el.querySelector(selector) : el;
		return target ? _wordpress_rich_text.RichTextData.fromHTMLElement(target, { preserveWhiteSpace }) : _wordpress_rich_text.RichTextData.empty();
	};

// packages/blocks/build-module/api/parser/get-block-attributes.mjs
/**
	* Higher-order hpq matcher which enhances an attribute matcher to return true
	* or false depending on whether the original matcher returns undefined. This
	* is useful for boolean attributes (e.g. disabled) whose attribute values may
	* be technically falsey (empty string), though their mere presence should be
	* enough to infer as true.
	*
	* @param matcher Original hpq matcher.
	*
	* @return Enhanced hpq matcher.
	*/
	const toBooleanAttributeMatcher = (matcher) => (domNode) => matcher(domNode) !== void 0;
	/**
	* Returns true if value is of the given JSON schema type, or false otherwise.
	*
	* @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.25
	*
	* @param value Value to test.
	* @param type  Type to test.
	*
	* @return Whether value is of type.
	*/
	function isOfType(value, type) {
		switch (type) {
			case "rich-text": return value instanceof _wordpress_rich_text.RichTextData;
			case "string": return typeof value === "string";
			case "boolean": return typeof value === "boolean";
			case "object": return !!value && value.constructor === Object;
			case "null": return value === null;
			case "array": return Array.isArray(value);
			case "integer":
			case "number": return typeof value === "number";
		}
		return true;
	}
	/**
	* Returns true if value is of an array of given JSON schema types, or false
	* otherwise.
	*
	* @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.25
	*
	* @param value Value to test.
	* @param types Types to test.
	*
	* @return Whether value is of types.
	*/
	function isOfTypes(value, types) {
		return types.some((type) => isOfType(value, type));
	}
	/**
	* Given an attribute key, an attribute's schema, a block's raw content and the
	* commentAttributes returns the attribute value depending on its source
	* definition of the given attribute key.
	*
	* @param attributeKey      Attribute key.
	* @param attributeSchema   Attribute's schema.
	* @param innerDOM          Parsed DOM of block's inner HTML.
	* @param commentAttributes Block's comment attributes.
	* @param innerHTML         Raw HTML from block node's innerHTML property.
	*
	* @return Attribute value.
	*/
	function getBlockAttribute(attributeKey, attributeSchema, innerDOM, commentAttributes, innerHTML) {
		let value;
		switch (attributeSchema.source) {
			case void 0:
				value = commentAttributes ? commentAttributes[attributeKey] : void 0;
				break;
			case "raw":
				value = innerHTML;
				break;
			case "attribute":
			case "property":
			case "html":
			case "text":
			case "rich-text":
			case "children":
			case "node":
			case "query":
			case "tag": value = parseWithAttributeSchema(innerDOM, attributeSchema);
		}
		if (!isValidByType(value, attributeSchema.type) || !isValidByEnum(value, attributeSchema.enum)) value = void 0;
		if (value === void 0) value = getDefault(attributeSchema);
		return value;
	}
	/**
	* Returns true if value is valid per the given block attribute schema type
	* definition, or false otherwise.
	*
	* @see https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1
	*
	* @param value Value to test.
	* @param type  Block attribute schema type.
	*
	* @return Whether value is valid.
	*/
	function isValidByType(value, type) {
		return type === void 0 || isOfTypes(value, Array.isArray(type) ? type : [type]);
	}
	/**
	* Returns true if value is valid per the given block attribute schema enum
	* definition, or false otherwise.
	*
	* @see https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.2
	*
	* @param value   Value to test.
	* @param enumSet Block attribute schema enum.
	*
	* @return Whether value is valid.
	*/
	function isValidByEnum(value, enumSet) {
		return !Array.isArray(enumSet) || enumSet.includes(value);
	}
	const matcherFromSource = memize((sourceConfig) => {
		switch (sourceConfig.source) {
			case "attribute": {
				const matcher = attr(sourceConfig.selector, sourceConfig.attribute);
				if (sourceConfig.type === "boolean") return toBooleanAttributeMatcher(matcher);
				return matcher;
			}
			case "html": return html(sourceConfig.selector, sourceConfig.multiline);
			case "text": return text(sourceConfig.selector);
			case "rich-text": return richText(sourceConfig.selector, sourceConfig.__unstablePreserveWhiteSpace);
			case "children": return matcher$1(sourceConfig.selector);
			case "node": return matcher(sourceConfig.selector);
			case "query":
				const subMatchers = Object.fromEntries(Object.entries(sourceConfig.query).map(([key, subSourceConfig]) => [key, matcherFromSource(subSourceConfig)]));
				return query(sourceConfig.selector, subMatchers);
			case "tag": {
				const matcher = prop(sourceConfig.selector, "nodeName");
				return (domNode) => matcher(domNode)?.toLowerCase();
			}
			default:
				console.error(`Unknown source type "${sourceConfig.source}"`);
				return;
		}
	});
	/**
	* Parse a HTML string into DOM tree.
	*
	* Content is missing whenever there is nothing to parse, such as a self-closing
	* shortcode, and is treated as empty markup: `hpq` hands anything that is not a
	* string straight to the matcher, so passing it through would give the matchers
	* a missing node to work with.
	*
	* @param innerHTML HTML string or already parsed DOM node.
	*
	* @return Parsed DOM node.
	*/
	function parseHtml(innerHTML) {
		return parse$2(innerHTML ?? "", (h) => h);
	}
	/**
	* Given a block's raw content and an attribute's schema returns the attribute's
	* value depending on its source.
	*
	* @param innerHTML       Block's raw content.
	* @param attributeSchema Attribute's schema.
	*
	* @return Attribute value.
	*/
	function parseWithAttributeSchema(innerHTML, attributeSchema) {
		return matcherFromSource(attributeSchema)(parseHtml(innerHTML));
	}
	/**
	* Returns the block attributes of a registered block node given its type.
	*
	* @param blockTypeOrName Block type or name.
	* @param innerHTML       Raw block content.
	* @param attributes      Known block attributes (from delimiters).
	*
	* @return All block attributes.
	*/
	function getBlockAttributes(blockTypeOrName, innerHTML, attributes = {}) {
		const doc = parseHtml(innerHTML);
		const blockType = normalizeBlockType(blockTypeOrName);
		const blockAttributes = Object.fromEntries(Object.entries(blockType?.attributes ?? {}).map(([key, schema]) => [key, getBlockAttribute(key, schema, doc, attributes, innerHTML)]));
		return (0, _wordpress_hooks.applyFilters)("blocks.getBlockAttributes", blockAttributes, blockType, innerHTML, attributes);
	}

// packages/blocks/build-module/api/parser/fix-custom-classname.mjs
	const CLASS_ATTR_SCHEMA = {
		type: "string",
		source: "attribute",
		selector: "[data-custom-class-name] > *",
		attribute: "class"
	};
	/**
	* Given an HTML string, returns an array of class names assigned to the root
	* element in the markup.
	*
	* @param innerHTML Markup string from which to extract classes.
	*
	* @return Array of class names assigned to the root element.
	*/
	function getHTMLRootElementClasses(innerHTML) {
		const parsed = parseWithAttributeSchema(`<div data-custom-class-name>${innerHTML}</div>`, CLASS_ATTR_SCHEMA);
		return parsed ? parsed.trim().split(/\s+/) : [];
	}
	/**
	* Given a parsed set of block attributes, if the block supports custom class
	* names and an unknown class (per the block's serialization behavior) is
	* found, the unknown classes are treated as custom classes. This prevents the
	* block from being considered as invalid.
	*
	* @param blockAttributes Original block attributes.
	* @param blockType       Block type settings.
	* @param innerHTML       Original block markup.
	*
	* @return Filtered block attributes.
	*/
	function fixCustomClassname(blockAttributes, blockType, innerHTML) {
		if (!hasBlockSupport(blockType, "customClassName", true)) return blockAttributes;
		const modifiedBlockAttributes = { ...blockAttributes };
		const { className: omittedClassName, ...attributesSansClassName } = modifiedBlockAttributes;
		const serialized = getSaveContent(blockType, attributesSansClassName);
		const defaultClasses = getHTMLRootElementClasses(serialized);
		const customClasses = getHTMLRootElementClasses(innerHTML).filter((className) => !defaultClasses.includes(className));
		if (customClasses.length) modifiedBlockAttributes.className = customClasses.join(" ");
		else if (serialized) delete modifiedBlockAttributes.className;
		return modifiedBlockAttributes;
	}

// packages/blocks/build-module/api/parser/fix-global-attribute.mjs
/**
	* Given an HTML string and an attribute schema, returns the specified attribute
	* value from the root element in the markup.
	*
	* @param innerHTML       Markup string from which to extract the attribute.
	* @param dataAttribute   The data attribute name to use as wrapper.
	* @param attributeSchema The attribute schema configuration.
	*
	* @return The attribute value assigned to the root element.
	*/
	function getHTMLRootElement(innerHTML, dataAttribute, attributeSchema) {
		return parseWithAttributeSchema(`<div ${dataAttribute}>${innerHTML}</div>`, attributeSchema);
	}
	/**
	* Whether any element in the markup carries the attribute with this value.
	*
	* @param innerHTML     Original block markup.
	* @param attributeName Attribute to look for.
	* @param value         Value the block attributes hold.
	*
	* @return Whether the markup still carries the value.
	*/
	function hasHTMLAttributeValue(innerHTML, attributeName, value) {
		if (!attributeName || typeof value !== "string" || !value) return false;
		const doc = document.implementation.createHTMLDocument("");
		doc.body.innerHTML = innerHTML;
		return Array.from(doc.body.querySelectorAll(`[${attributeName}]`)).some((element) => element.getAttribute(attributeName) === value);
	}
	/**
	* Given a parsed set of block attributes, if the block supports the specified attribute,
	* the attribute is synced with the block's markup: assigned when the markup carries it,
	* and removed when the markup does not.
	*
	* @param blockAttributes Original block attributes.
	* @param blockType       Block type settings.
	* @param innerHTML       Original block markup.
	* @param supportKey      The block support key to check and attribute key to set.
	* @param dataAttribute   The data attribute name to use as wrapper.
	* @param attributeSchema The attribute schema configuration.
	*
	* @return Filtered block attributes.
	*/
	function fixGlobalAttribute(blockAttributes, blockType, innerHTML, supportKey, dataAttribute, attributeSchema) {
		if (!hasBlockSupport(blockType, supportKey, false)) return blockAttributes;
		const modifiedBlockAttributes = { ...blockAttributes };
		const attributeValue = getHTMLRootElement(innerHTML, dataAttribute, attributeSchema);
		if (attributeValue) modifiedBlockAttributes[supportKey] = attributeValue;
		else if (innerHTML.trim() && !hasHTMLAttributeValue(innerHTML, attributeSchema.attribute, modifiedBlockAttributes[supportKey])) delete modifiedBlockAttributes[supportKey];
		return modifiedBlockAttributes;
	}

// packages/blocks/build-module/api/parser/apply-built-in-validation-fixes.mjs
	const ARIA_LABEL_ATTR_SCHEMA = {
		type: "string",
		source: "attribute",
		selector: "[data-aria-label] > *",
		attribute: "aria-label"
	};
	const ANCHOR_ATTR_SCHEMA = {
		type: "string",
		source: "attribute",
		selector: "[data-anchor] > *",
		attribute: "id"
	};
	/**
	* Attempts to fix block invalidation by applying built-in validation fixes
	* like moving all extra classNames to the className attribute.
	*
	* @param block     block object.
	* @param blockType Block type. This is normalize not necessary and
	*                  can be inferred from the block name,
	*                  but it's here for performance reasons.
	*
	* @return Fixed block object
	*/
	function applyBuiltInValidationFixes(block, blockType) {
		const { attributes, originalContent } = block;
		let updatedBlockAttributes = attributes;
		updatedBlockAttributes = fixCustomClassname(attributes, blockType, originalContent ?? "");
		updatedBlockAttributes = fixGlobalAttribute(updatedBlockAttributes, blockType, originalContent ?? "", "ariaLabel", "data-aria-label", ARIA_LABEL_ATTR_SCHEMA);
		updatedBlockAttributes = fixGlobalAttribute(updatedBlockAttributes, blockType, originalContent ?? "", "anchor", "data-anchor", ANCHOR_ATTR_SCHEMA);
		return {
			...block,
			attributes: updatedBlockAttributes
		};
	}

// packages/blocks/build-module/api/parser/apply-block-deprecated-versions.mjs
/**
	* Function that takes no arguments and always returns false.
	*
	* @return Always returns false.
	*/
	function stubFalse() {
		return false;
	}
	/**
	* Given a block object, returns a new copy of the block with any applicable
	* deprecated migrations applied, or the original block if it was both valid
	* and no eligible migrations exist.
	*
	* @param block     Parsed and invalid block object.
	* @param rawBlock  Raw block object.
	* @param blockType Block type. This is normalize not necessary and
	*                  can be inferred from the block name,
	*                  but it's here for performance reasons.
	*
	* @return Migrated block object.
	*/
	function applyBlockDeprecatedVersions(block, rawBlock, blockType) {
		const parsedAttributes = rawBlock.attrs ?? {};
		const { deprecated: deprecatedDefinitions } = blockType;
		if (!deprecatedDefinitions || !deprecatedDefinitions.length) return block;
		for (let i = 0; i < deprecatedDefinitions.length; i++) {
			const { isEligible = stubFalse } = deprecatedDefinitions[i];
			if (block.isValid && !isEligible(parsedAttributes, block.innerBlocks, {
				blockNode: rawBlock,
				block
			})) continue;
			const deprecatedBlockType = Object.assign(omit(blockType, DEPRECATED_ENTRY_KEYS), deprecatedDefinitions[i]);
			let migratedBlock = {
				...block,
				attributes: getBlockAttributes(deprecatedBlockType, block.originalContent ?? "", parsedAttributes)
			};
			let [isValid] = validateBlock(migratedBlock, deprecatedBlockType);
			if (!isValid) {
				migratedBlock = applyBuiltInValidationFixes(migratedBlock, deprecatedBlockType);
				[isValid] = validateBlock(migratedBlock, deprecatedBlockType);
			}
			if (!isValid) continue;
			let migratedInnerBlocks = migratedBlock.innerBlocks;
			let migratedAttributes = migratedBlock.attributes;
			const { migrate } = deprecatedBlockType;
			if (migrate) {
				let migrated = migrate(migratedAttributes, block.innerBlocks);
				if (!Array.isArray(migrated)) migrated = [migrated];
				[migratedAttributes = parsedAttributes, migratedInnerBlocks = block.innerBlocks] = migrated;
			}
			block = {
				...block,
				attributes: migratedAttributes,
				innerBlocks: migratedInnerBlocks,
				isValid: true,
				validationIssues: []
			};
		}
		return block;
	}

// packages/blocks/build-module/api/parser/index.mjs
/**
	* Convert legacy blocks to their canonical form. This function is used
	* both in the parser level for previous content and to convert such blocks
	* used in Custom Post Types templates.
	*
	* @param rawBlock
	*
	* @return The block's name and attributes, changed accordingly if a match was found
	*/
	function convertLegacyBlocks(rawBlock) {
		const [correctName, correctedAttributes] = convertLegacyBlockNameAndAttributes(rawBlock.blockName, rawBlock.attrs ?? {});
		return {
			...rawBlock,
			blockName: correctName,
			attrs: correctedAttributes
		};
	}
	/**
	* Normalize the raw block by applying the fallback block name if none given,
	* sanitize the parsed HTML...
	*
	* @param rawBlock The raw block object.
	* @param options  Extra options for handling block parsing.
	*
	* @return The normalized block object.
	*/
	function normalizeRawBlock(rawBlock, options) {
		const fallbackBlockName = getFreeformContentHandlerName();
		const rawBlockName = rawBlock.blockName || getFreeformContentHandlerName();
		const rawAttributes = rawBlock.attrs || {};
		const rawInnerBlocks = rawBlock.innerBlocks || [];
		let rawInnerHTML = rawBlock.innerHTML.trim();
		if (rawBlockName === fallbackBlockName && rawBlockName === "core/freeform" && !options?.__unstableSkipAutop) rawInnerHTML = (0, _wordpress_autop.autop)(rawInnerHTML).trim();
		return {
			...rawBlock,
			blockName: rawBlockName,
			attrs: rawAttributes,
			innerHTML: rawInnerHTML,
			innerBlocks: rawInnerBlocks
		};
	}
	/**
	* Uses the "unregistered blockType" to create a block object.
	*
	* @param rawBlock block.
	*
	* @return The unregistered block object.
	*/
	function createMissingBlockType(rawBlock) {
		const unregisteredFallbackBlock = getUnregisteredTypeHandlerName() || getFreeformContentHandlerName();
		const originalUndelimitedContent = serializeRawBlock(rawBlock, { isCommentDelimited: false });
		const originalContent = serializeRawBlock(rawBlock, { isCommentDelimited: true });
		return {
			blockName: unregisteredFallbackBlock,
			attrs: {
				originalName: rawBlock.blockName,
				originalContent,
				originalUndelimitedContent
			},
			innerHTML: rawBlock.blockName ? originalContent : rawBlock.innerHTML,
			innerBlocks: rawBlock.innerBlocks,
			innerContent: rawBlock.innerContent
		};
	}
	/**
	* Validates a block and wraps with validation meta.
	*
	* The name here is regrettable but `validateBlock` is already taken.
	*
	* @param unvalidatedBlock
	* @param blockType
	* @return validated block, with auto-fixes if initially invalid
	*/
	function applyBlockValidation(unvalidatedBlock, blockType) {
		const [isValid] = validateBlock(unvalidatedBlock, blockType);
		if (isValid) return {
			...unvalidatedBlock,
			isValid,
			validationIssues: []
		};
		const fixedBlock = applyBuiltInValidationFixes(unvalidatedBlock, blockType);
		const [isFixedValid, validationIssues] = validateBlock(fixedBlock, blockType);
		return {
			...fixedBlock,
			isValid: isFixedValid,
			validationIssues
		};
	}
	/**
	* Given a raw block returned by grammar parsing, returns a fully parsed block.
	*
	* @param rawBlock The raw block object.
	* @param options  Extra options for handling block parsing.
	*
	* @return Fully parsed block.
	*/
	function parseRawBlock(rawBlock, options) {
		let normalizedBlock = normalizeRawBlock(rawBlock, options);
		normalizedBlock = convertLegacyBlocks(normalizedBlock);
		let blockType = getBlockType(normalizedBlock.blockName);
		if (!blockType) {
			normalizedBlock = createMissingBlockType(normalizedBlock);
			blockType = getBlockType(normalizedBlock.blockName);
		}
		const isFallbackBlock = normalizedBlock.blockName === getFreeformContentHandlerName() || normalizedBlock.blockName === getUnregisteredTypeHandlerName();
		if (!blockType || !normalizedBlock.innerHTML && isFallbackBlock) return;
		const parsedInnerBlocks = normalizedBlock.innerBlocks.map((innerBlock) => parseRawBlock(innerBlock, options)).filter((innerBlock) => !!innerBlock);
		const parsedBlock = createBlock(normalizedBlock.blockName, getBlockAttributes(blockType, normalizedBlock.innerHTML, normalizedBlock.attrs), parsedInnerBlocks);
		parsedBlock.originalContent = normalizedBlock.innerHTML;
		if (blockType.name === "core/html") {
			parsedBlock.innerContent = normalizedBlock.innerContent ?? [normalizedBlock.innerHTML];
			parsedBlock.isValid = true;
			parsedBlock.validationIssues = [];
			return parsedBlock;
		}
		const validatedBlock = applyBlockValidation(parsedBlock, blockType);
		const { validationIssues } = validatedBlock;
		const updatedBlock = applyBlockDeprecatedVersions(validatedBlock, normalizedBlock, blockType);
		if (!updatedBlock.isValid) updatedBlock.__unstableBlockSource = rawBlock;
		if (!validatedBlock.isValid && updatedBlock.isValid && !options?.__unstableSkipMigrationLogs) {
			console.groupCollapsed("Updated Block: %s", blockType.name);
			console.info("Block successfully updated for `%s` (%o).\n\nNew content generated by `save` function:\n\n%s\n\nContent retrieved from post body:\n\n%s", blockType.name, blockType, getSaveContent(blockType, updatedBlock.attributes), updatedBlock.originalContent);
			console.groupEnd();
		} else if (!validatedBlock.isValid && !updatedBlock.isValid) validationIssues.forEach(({ log, args }) => log(...args));
		return updatedBlock;
	}
	/**
	* Utilizes an optimized token-driven parser based on the Gutenberg grammar spec
	* defined through a parsing expression grammar to take advantage of the regular
	* cadence provided by block delimiters -- composed syntactically through HTML
	* comments -- which, given a general HTML document as an input, returns a block
	* list array representation.
	*
	* This is a recursive-descent parser that scans linearly once through the input
	* document. Instead of directly recursing it utilizes a trampoline mechanism to
	* prevent stack overflow. This initial pass is mainly interested in separating
	* and isolating the blocks serialized in the document and manifestly not in the
	* content within the blocks.
	*
	* @see
	* https://developer.wordpress.org/block-editor/packages/packages-block-serialization-default-parser/
	*
	* @param content The post content.
	* @param options Extra options for handling block parsing.
	*
	* @return Block list.
	*/
	function parse(content, options) {
		return (0, _wordpress_block_serialization_default_parser.parse)(content).reduce((accumulator, rawBlock) => {
			const block = parseRawBlock(rawBlock, options);
			if (block) accumulator.push(block);
			return accumulator;
		}, []);
	}

// packages/blocks/build-module/api/raw-handling/get-raw-transforms.mjs
	function getRawTransforms() {
		return getBlockTransforms("from").filter((transform) => transform.type === "raw").map((transform) => ({
			...transform,
			isMatch: transform.isMatch ?? ((node) => !!transform.selector && node.matches(transform.selector))
		}));
	}

// packages/blocks/build-module/api/raw-handling/html-to-blocks.mjs
/**
	* Converts HTML directly to blocks. Looks for a matching transform for each
	* top-level tag. The HTML should be filtered to not have any text between
	* top-level tags and formatted in a way that blocks can handle the HTML.
	*
	* @param html    HTML to convert.
	* @param handler The handler calling htmlToBlocks: either rawHandler
	*                or pasteHandler.
	*
	* @return An array of blocks.
	*/
	function htmlToBlocks(html, handler) {
		const doc = document.implementation.createHTMLDocument("");
		doc.body.innerHTML = html;
		return Array.from(doc.body.children).flatMap((node) => {
			const transforms = getRawTransforms();
			const rawTransform = findTransform(transforms, (transform) => transform.isMatch(node));
			if (!rawTransform) return createBlock("core/html", {}, [], [node.outerHTML]);
			const { transform, blockName } = rawTransform;
			let block;
			if (transform) {
				const transformed = transform(node, handler);
				if (Array.isArray(transformed)) return transformed;
				block = transformed;
			} else block = createBlock(blockName, getBlockAttributes(blockName, node.outerHTML));
			const { originalContent, ...fixedBlock } = applyBuiltInValidationFixes({
				...block,
				originalContent: node.outerHTML
			}, getBlockType(block.name));
			return fixedBlock;
		});
	}

// packages/blocks/build-module/api/raw-handling/normalise-blocks.mjs
	function normaliseBlocks(HTML, options = {}) {
		const decuDoc = document.implementation.createHTMLDocument("");
		const accuDoc = document.implementation.createHTMLDocument("");
		const decu = decuDoc.body;
		const accu = accuDoc.body;
		decu.innerHTML = HTML;
		while (decu.firstChild) {
			const node = decu.firstChild;
			if (node.nodeType === node.TEXT_NODE) {
				if ((0, _wordpress_dom.isEmpty)(node)) decu.removeChild(node);
				else {
					if (!accu.lastChild || accu.lastChild.nodeName !== "P") accu.appendChild(accuDoc.createElement("P"));
					accu.lastChild.appendChild(node);
				}
			} else if (node.nodeType === node.ELEMENT_NODE) {
				if (node.nodeName === "BR") {
					if (node.nextSibling && node.nextSibling.nodeName === "BR") {
						accu.appendChild(accuDoc.createElement("P"));
						decu.removeChild(node.nextSibling);
					}
					if (accu.lastChild && accu.lastChild.nodeName === "P" && accu.lastChild.hasChildNodes()) accu.lastChild.appendChild(node);
					else decu.removeChild(node);
				} else if (node.nodeName === "P") {
					if ((0, _wordpress_dom.isEmpty)(node) && !options.raw) decu.removeChild(node);
					else accu.appendChild(node);
				} else if ((0, _wordpress_dom.isPhrasingContent)(node)) {
					if (!accu.lastChild || accu.lastChild.nodeName !== "P") accu.appendChild(accuDoc.createElement("P"));
					accu.lastChild.appendChild(node);
				} else accu.appendChild(node);
			} else decu.removeChild(node);
		}
		return accu.innerHTML;
	}

// packages/blocks/build-module/api/raw-handling/special-comment-converter.mjs
/**
	* Looks for `<!--nextpage-->` and `<!--more-->` comments and
	* replaces them with a custom element representing a future block.
	*
	* The custom element is a way to bypass the rest of the `raw-handling`
	* transforms, which would eliminate other kinds of node with which to carry
	* `<!--more-->`'s data: nodes with `data` attributes, empty paragraphs, etc.
	*
	* The custom element is then expected to be recognized by any registered
	* block's `raw` transform.
	*
	* @param node The node to be processed.
	* @param doc  The document of the node.
	*/
	function specialCommentConverter(node, doc) {
		if (node.nodeType !== node.COMMENT_NODE) return;
		if (node.nodeValue !== "nextpage" && node.nodeValue.indexOf("more") !== 0) return;
		const block = createBlock$1(node, doc);
		if (!node.parentNode || node.parentNode.nodeName !== "P") (0, _wordpress_dom.replace)(node, block);
		else {
			const childNodes = Array.from(node.parentNode.childNodes);
			const nodeIndex = childNodes.indexOf(node);
			const wrapperNode = node.parentNode.parentNode || doc.body;
			const paragraphBuilder = (acc, child) => {
				if (!acc) acc = doc.createElement("p");
				acc.appendChild(child);
				return acc;
			};
			[
				childNodes.slice(0, nodeIndex).reduce(paragraphBuilder, null),
				block,
				childNodes.slice(nodeIndex + 1).reduce(paragraphBuilder, null)
			].forEach((element) => element && wrapperNode.insertBefore(element, node.parentNode));
			(0, _wordpress_dom.remove)(node.parentNode);
		}
	}
	function createBlock$1(commentNode, doc) {
		if (commentNode.nodeValue === "nextpage") return createNextpage(doc);
		const customText = commentNode.nodeValue.slice(4).trim();
		let sibling = commentNode;
		let noTeaser = false;
		while (sibling = sibling.nextSibling) if (sibling.nodeType === sibling.COMMENT_NODE && sibling.nodeValue === "noteaser") {
			noTeaser = true;
			(0, _wordpress_dom.remove)(sibling);
			break;
		}
		return createMore(customText, noTeaser, doc);
	}
	function createMore(customText, noTeaser, doc) {
		const node = doc.createElement("wp-block");
		node.dataset.block = "core/more";
		if (customText) node.dataset.customText = customText;
		if (noTeaser) node.dataset.noTeaser = "";
		return node;
	}
	function createNextpage(doc) {
		const node = doc.createElement("wp-block");
		node.dataset.block = "core/nextpage";
		return node;
	}

// packages/blocks/build-module/api/raw-handling/list-reducer.mjs
	function isList$1(node) {
		return node.nodeName === "OL" || node.nodeName === "UL";
	}
	function shallowTextContent(element) {
		return Array.from(element.childNodes).map(({ nodeValue = "" }) => nodeValue).join("");
	}
	function listReducer(node) {
		if (!isList$1(node)) return;
		const list = node;
		const prevElement = list.previousElementSibling;
		if (prevElement && prevElement.nodeName === node.nodeName && list.children.length === 1) {
			while (list.firstChild) prevElement.appendChild(list.firstChild);
			list.parentNode.removeChild(list);
		}
		const parentElement = node.parentNode;
		if (parentElement && parentElement.nodeName === "LI" && parentElement.children.length === 1 && !/\S/.test(shallowTextContent(parentElement))) {
			const parentListItem = parentElement;
			const prevListItem = parentListItem.previousElementSibling;
			const parentList = parentListItem.parentNode;
			if (prevListItem) {
				prevListItem.appendChild(list);
				parentList.removeChild(parentListItem);
			}
		}
		if (parentElement && isList$1(parentElement)) {
			const prevListItem = list.previousElementSibling;
			if (prevListItem) prevListItem.appendChild(node);
			else (0, _wordpress_dom.unwrap)(node);
		}
	}

// packages/blocks/build-module/api/raw-handling/blockquote-normaliser.mjs
	function blockquoteNormaliser(options = {}) {
		return (bq) => {
			if (bq.nodeName !== "BLOCKQUOTE") return;
			const node = bq;
			node.innerHTML = normaliseBlocks(node.innerHTML, options);
		};
	}

// packages/blocks/build-module/api/raw-handling/figure-content-reducer.mjs
/**
	* Whether or not the given node is figure content.
	*
	* @param node   The node to check.
	* @param schema The schema to use.
	*
	* @return True if figure content, false if not.
	*/
	function isFigureContent(node, schema) {
		const tag = node.nodeName.toLowerCase();
		if (tag === "figcaption" || (0, _wordpress_dom.isTextContent)(node)) return false;
		return tag in ((schema?.figure)?.children ?? {});
	}
	/**
	* Whether or not the given node can have an anchor.
	*
	* @param node   The node to check.
	* @param schema The schema to use.
	*
	* @return True if it can, false if not.
	*/
	function canHaveAnchor(node, schema) {
		return node.nodeName.toLowerCase() in ((schema?.figure)?.children?.a?.children ?? {});
	}
	/**
	* Wraps the given element in a figure element.
	*
	* @param element       The element to wrap.
	* @param beforeElement The element before which to place the figure.
	*/
	function wrapFigureContent(element, beforeElement = element) {
		const figure = element.ownerDocument.createElement("figure");
		beforeElement.parentNode.insertBefore(figure, beforeElement);
		figure.appendChild(element);
	}
	/**
	* This filter takes figure content out of paragraphs, wraps it in a figure
	* element, and moves any anchors with it if needed.
	*
	* @param node   The node to filter.
	* @param doc    The document of the node.
	* @param schema The schema to use.
	*/
	function figureContentReducer(node, doc, schema) {
		if (!schema || !isFigureContent(node, schema)) return;
		let nodeToInsert = node;
		const parentNode = node.parentNode;
		if (canHaveAnchor(node, schema) && parentNode.nodeName === "A" && parentNode.childNodes.length === 1) nodeToInsert = node.parentNode;
		const wrapper = nodeToInsert.closest("p,div");
		if (wrapper) {
			const element = node;
			if (!element.classList) wrapFigureContent(nodeToInsert, wrapper);
			else if (element.classList.contains("alignright") || element.classList.contains("alignleft") || element.classList.contains("aligncenter") || !wrapper.textContent.trim()) wrapFigureContent(nodeToInsert, wrapper);
		} else wrapFigureContent(nodeToInsert);
	}

// packages/blocks/build-module/api/raw-handling/shortcode-converter.mjs
	const castArray = (maybeArray) => Array.isArray(maybeArray) ? maybeArray : [maybeArray];
	const beforeLineRegexp = /(^|\n|<p>|<br\s*\/?>)\s*$/;
	const afterLineRegexp = /^\s*($|\n|<\/p>|<br\s*\/?>)/;
	function segmentHTMLToShortcodeBlock(HTML, lastIndex = 0, excludedBlockNames = []) {
		const transformsFrom = getBlockTransforms("from").filter((transform) => transform.type === "shortcode");
		const transformation = findTransform(transformsFrom, (transform) => excludedBlockNames.indexOf(transform.blockName) === -1 && castArray(transform.tag).some((tag) => (0, _wordpress_shortcode.regexp)(tag).test(HTML)));
		if (!transformation) return [HTML];
		const transformTag = castArray(transformation.tag).find((tag) => (0, _wordpress_shortcode.regexp)(tag).test(HTML));
		const previousIndex = lastIndex;
		const match = (0, _wordpress_shortcode.next)(transformTag, HTML, lastIndex);
		if (!match) return [HTML];
		lastIndex = match.index + match.content.length;
		const beforeHTML = HTML.substr(0, match.index);
		const afterHTML = HTML.substr(lastIndex);
		const isLineStart = beforeLineRegexp.test(beforeHTML);
		const isLineEnd = afterLineRegexp.test(afterHTML);
		if (!isLineStart && !isLineEnd) return segmentHTMLToShortcodeBlock(HTML, lastIndex);
		if (transformation.isMatch && !transformation.isMatch(match.shortcode.attrs)) return segmentHTMLToShortcodeBlock(HTML, previousIndex, [...excludedBlockNames, transformation.blockName]);
		let blocks = [];
		if (typeof transformation.transform === "function") {
			blocks = [].concat(transformation.transform(match.shortcode.attrs, match));
			blocks = blocks.map((block) => {
				block.originalContent = match.shortcode.content;
				return applyBuiltInValidationFixes(block, getBlockType(block.name));
			});
		} else {
			const blockType = getBlockType(transformation.blockName);
			if (!blockType) return [HTML];
			const transformAttributes = transformation.attributes ?? blockType.attributes;
			const attributes = Object.fromEntries(Object.entries(transformAttributes).filter(([, schema]) => schema.shortcode).map(([key, schema]) => [key, schema.shortcode(match.shortcode.attrs, match)]));
			const transformationBlockType = {
				...blockType,
				attributes: transformAttributes
			};
			let block = createBlock(transformation.blockName, getBlockAttributes(transformationBlockType, match.shortcode.content, attributes));
			block.originalContent = match.shortcode.content;
			block = applyBuiltInValidationFixes(block, transformationBlockType);
			blocks = [block];
		}
		if (isLineStart && isLineEnd) return [
			...segmentHTMLToShortcodeBlock(beforeHTML.replace(beforeLineRegexp, "")),
			...blocks,
			...segmentHTMLToShortcodeBlock(afterHTML.replace(afterLineRegexp, ""))
		];
		if (!blocks.every((block) => [
			"left",
			"center",
			"right"
		].includes(block.attributes.align))) return segmentHTMLToShortcodeBlock(HTML, lastIndex);
		if (isLineStart) {
			const lineStart = beforeHTML.search(beforeLineRegexp);
			return [
				...segmentHTMLToShortcodeBlock(beforeHTML.slice(0, lineStart)),
				...blocks,
				...segmentHTMLToShortcodeBlock(beforeHTML.slice(lineStart) + afterHTML)
			];
		}
		return [
			...segmentHTMLToShortcodeBlock(beforeHTML),
			...blocks,
			...segmentHTMLToShortcodeBlock(afterHTML.replace(afterLineRegexp, ""))
		];
	}

// packages/blocks/build-module/api/raw-handling/utils.mjs
	function getBlockContentSchemaFromTransforms(transforms, context) {
		const schemaArgs = {
			phrasingContentSchema: (0, _wordpress_dom.getPhrasingContentSchema)(context),
			isPaste: context === "paste"
		};
		const schemas = transforms.map(({ isMatch, blockName, schema }) => {
			const hasAnchorSupport = hasBlockSupport(blockName, "anchor");
			schema = typeof schema === "function" ? schema(schemaArgs) : schema;
			if (!hasAnchorSupport && !isMatch) return schema;
			if (!schema) return {};
			return Object.fromEntries(Object.entries(schema).map(([key, value]) => {
				let attributes = value.attributes || [];
				if (hasAnchorSupport) attributes = [...attributes, "id"];
				return [key, {
					...value,
					attributes,
					isMatch: isMatch ? isMatch : void 0
				}];
			}));
		});
		function mergeTagNameSchemaProperties(objValue, srcValue, key) {
			switch (key) {
				case "children":
					if (objValue === "*" || srcValue === "*") return "*";
					return mergeSchemas({ ...objValue || {} }, srcValue || {});
				case "attributes":
				case "require": return Array.from(/* @__PURE__ */ new Set([...objValue || [], ...srcValue || []]));
				case "isMatch":
					if (!objValue || !srcValue) return;
					return (...args) => {
						return objValue(...args) || srcValue(...args);
					};
				case "classes":
					if ((objValue || []).includes("*") || (srcValue || []).includes("*")) return ["*"];
					return [...objValue || [], ...srcValue || []];
			}
		}
		function mergeTagNameSchemas(a, b) {
			if (a === b) return a;
			for (const key in b) if (a[key]) a[key] = mergeTagNameSchemaProperties(a[key], b[key], key);
			else if (Array.isArray(b[key])) a[key] = b[key].slice();
			else a[key] = { ...b[key] };
			return a;
		}
		function mergeSchemas(a, b) {
			if (a === b) return a;
			for (const key in b) if (a[key]) a[key] = mergeTagNameSchemas(a[key], b[key]);
			else if (Array.isArray(b[key])) a[key] = b[key].slice();
			else a[key] = { ...b[key] };
			return a;
		}
		return schemas.reduce(mergeSchemas, {});
	}
	/**
	* Gets the block content schema, which is extracted and merged from all
	* registered blocks with raw transforms.
	*
	* @param context Set to "paste" when in paste context, where the
	*                schema is more strict.
	*
	* @return A complete block content schema.
	*/
	function getBlockContentSchema(context) {
		return getBlockContentSchemaFromTransforms(getRawTransforms(), context);
	}
	/**
	* Checks whether HTML can be considered plain text. That is, it does not contain
	* any elements that are not line breaks, or it only contains a single non-semantic
	* wrapper element (span) with no semantic child elements.
	*
	* @param HTML The HTML to check.
	*
	* @return Whether the HTML can be considered plain text.
	*/
	function isPlain(HTML) {
		if (!/<(?!br[ />])/i.test(HTML)) return true;
		const doc = document.implementation.createHTMLDocument("");
		doc.body.innerHTML = HTML;
		if (doc.body.children.length !== 1) return false;
		const wrapper = doc.body.children.item(0);
		const descendants = wrapper.getElementsByTagName("*");
		for (let i = 0; i < descendants.length; i++) if (descendants.item(i).tagName !== "BR") return false;
		if (wrapper.tagName !== "SPAN") return false;
		return true;
	}
	/**
	* Given node filters, deeply filters and mutates a NodeList.
	*
	* @param nodeList The nodeList to filter.
	* @param filters  An array of functions that can mutate with the provided node.
	* @param doc      The document of the nodeList.
	* @param schema   The schema to use.
	*/
	function deepFilterNodeList(nodeList, filters, doc, schema) {
		Array.from(nodeList).forEach((node) => {
			deepFilterNodeList(node.childNodes, filters, doc, schema);
			filters.forEach((item) => {
				if (!doc.contains(node)) return;
				item(node, doc, schema);
			});
		});
	}
	/**
	* Given node filters, deeply filters HTML tags.
	* Filters from the deepest nodes to the top.
	*
	* @param HTML    The HTML to filter.
	* @param filters An array of functions that can mutate with the provided node.
	* @param schema  The schema to use.
	*
	* @return The filtered HTML.
	*/
	function deepFilterHTML(HTML, filters = [], schema) {
		const doc = document.implementation.createHTMLDocument("");
		doc.body.innerHTML = HTML;
		deepFilterNodeList(doc.body.childNodes, filters, doc, schema);
		return doc.body.innerHTML;
	}
	/**
	* Gets a sibling within text-level context.
	*
	* @param node  The subject node.
	* @param which "next" or "previous".
	*/
	function getSibling(node, which) {
		const sibling = node[`${which}Sibling`];
		if (sibling && (0, _wordpress_dom.isPhrasingContent)(sibling)) return sibling;
		const { parentNode } = node;
		if (!parentNode || !(0, _wordpress_dom.isPhrasingContent)(parentNode)) return;
		return getSibling(parentNode, which);
	}

// packages/blocks/build-module/api/raw-handling/comment-remover.mjs
/**
	* Looks for comments, and removes them.
	*
	* @param node The node to be processed.
	*/
	function commentRemover(node) {
		if (node.nodeType === node.COMMENT_NODE) (0, _wordpress_dom.remove)(node);
	}

// packages/blocks/build-module/api/raw-handling/is-inline-content.mjs
/**
	* Checks if the given node should be considered inline content, optionally
	* depending on a context tag.
	*
	* @param node       Node name.
	* @param contextTag Tag name.
	*
	* @return True if the node is inline content, false if not.
	*/
	function isInline(node, contextTag) {
		if ((0, _wordpress_dom.isTextContent)(node)) return true;
		if (!contextTag) return false;
		const tag = node.nodeName.toLowerCase();
		return [[
			"ul",
			"li",
			"ol"
		], [
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6"
		]].some((tagGroup) => [tag, contextTag].filter((t) => !tagGroup.includes(t)).length === 0);
	}
	function deepCheck(nodes, contextTag) {
		return nodes.every((node) => isInline(node, contextTag) && deepCheck(Array.from(node.children), contextTag));
	}
	function isDoubleBR(node) {
		return node.nodeName === "BR" && !!node.previousSibling && node.previousSibling.nodeName === "BR";
	}
	function isInlineContent(HTML, contextTag) {
		const doc = document.implementation.createHTMLDocument("");
		doc.body.innerHTML = HTML;
		const nodes = Array.from(doc.body.children);
		return !nodes.some(isDoubleBR) && deepCheck(nodes, contextTag);
	}

// packages/blocks/build-module/api/raw-handling/phrasing-content-reducer.mjs
	function phrasingContentReducer(node, doc) {
		if (node.nodeName === "SPAN" && node.style) {
			const { fontWeight, fontStyle, textDecorationLine, textDecoration, verticalAlign } = node.style;
			const element = node;
			if (fontWeight === "bold" || fontWeight === "700") (0, _wordpress_dom.wrap)(doc.createElement("strong"), element);
			if (fontStyle === "italic") (0, _wordpress_dom.wrap)(doc.createElement("em"), element);
			if (textDecorationLine === "line-through" || textDecoration.includes("line-through")) (0, _wordpress_dom.wrap)(doc.createElement("s"), element);
			if (verticalAlign === "super") (0, _wordpress_dom.wrap)(doc.createElement("sup"), element);
			else if (verticalAlign === "sub") (0, _wordpress_dom.wrap)(doc.createElement("sub"), element);
		} else if (node.nodeName === "B") (0, _wordpress_dom.replaceTag)(node, "strong");
		else if (node.nodeName === "I") (0, _wordpress_dom.replaceTag)(node, "em");
		else if (node.nodeName === "A") {
			const anchor = node;
			if (anchor.target && anchor.target.toLowerCase() === "_blank") anchor.rel = "noopener";
			else {
				anchor.removeAttribute("target");
				anchor.removeAttribute("rel");
			}
			if (anchor.name && !anchor.id) anchor.id = anchor.name;
			if (anchor.id && !anchor.ownerDocument.querySelector(`[href="#${anchor.id}"]`)) anchor.removeAttribute("id");
		}
	}

// packages/blocks/build-module/api/raw-handling/head-remover.mjs
	function headRemover(node) {
		if (node.nodeName !== "SCRIPT" && node.nodeName !== "NOSCRIPT" && node.nodeName !== "TEMPLATE" && node.nodeName !== "STYLE") return;
		node.parentNode.removeChild(node);
	}

// packages/blocks/build-module/api/raw-handling/ms-list-ignore.mjs
/**
	* Looks for comments, and removes them.
	*
	* @param node The node to be processed.
	*/
	function msListIgnore(node) {
		if (node.nodeType !== node.ELEMENT_NODE) return;
		const el = node;
		const style = el.getAttribute("style");
		if (!style || !style.includes("mso-list")) return;
		if (style.split(";").reduce((acc, rule) => {
			const [key, value] = rule.split(":");
			if (key && value) acc[key.trim().toLowerCase()] = value.trim().toLowerCase();
			return acc;
		}, {})["mso-list"] === "ignore") el.remove();
	}

// packages/blocks/build-module/api/raw-handling/ms-list-converter.mjs
	function isList(node) {
		return node.nodeName === "OL" || node.nodeName === "UL";
	}
	function msListConverter(node, doc) {
		if (node.nodeName !== "P") return;
		const element = node;
		const style = element.getAttribute("style");
		if (!style || !style.includes("mso-list")) return;
		const prevNode = element.previousElementSibling;
		if (!prevNode || !isList(prevNode)) {
			const type = element.textContent.trim().slice(0, 1);
			const isNumeric = /[1iIaA]/.test(type);
			const newListNode = doc.createElement(isNumeric ? "ol" : "ul");
			if (isNumeric) newListNode.setAttribute("type", type);
			element.parentNode.insertBefore(newListNode, element);
		}
		const listNode = element.previousElementSibling;
		const listType = listNode.nodeName;
		const listItem = doc.createElement("li");
		let receivingNode = listNode;
		listItem.innerHTML = deepFilterHTML(element.innerHTML, [msListIgnore]);
		const matches = /mso-list\s*:[^;]+level([0-9]+)/i.exec(style);
		let level = matches ? parseInt(matches[1], 10) - 1 || 0 : 0;
		while (level--) {
			receivingNode = receivingNode.lastChild || receivingNode;
			if (isList(receivingNode)) receivingNode = receivingNode.lastChild || receivingNode;
		}
		if (!isList(receivingNode)) receivingNode = receivingNode.appendChild(doc.createElement(listType));
		receivingNode.appendChild(listItem);
		element.parentNode.removeChild(element);
	}

// packages/blocks/build-module/api/raw-handling/image-corrector.mjs
	function imageCorrector(img) {
		if (img.nodeName !== "IMG") return;
		const node = img;
		if (node.src.indexOf("file:") === 0) node.src = "";
		if (node.src.indexOf("data:") === 0) {
			const [properties, data] = node.src.split(",");
			const [type] = properties.slice(5).split(";");
			if (!data || !type) {
				node.src = "";
				return;
			}
			let decoded;
			try {
				decoded = atob(data);
			} catch {
				node.src = "";
				return;
			}
			const uint8Array = new Uint8Array(decoded.length);
			for (let i = 0; i < uint8Array.length; i++) uint8Array[i] = decoded.charCodeAt(i);
			const subtype = type.slice(type.indexOf("/") + 1);
			const name = `image-${v4().slice(0, 8)}.${subtype}`;
			const file = new window.File([uint8Array], name, { type });
			node.src = (0, _wordpress_blob.createBlobURL)(file);
		}
		if (node.height === 1 || node.width === 1) node.parentNode.removeChild(node);
	}

// packages/blocks/build-module/api/raw-handling/div-normaliser.mjs
	function divNormaliser(div) {
		if (div.nodeName !== "DIV") return;
		const node = div;
		node.innerHTML = normaliseBlocks(node.innerHTML);
	}

// node_modules/.store/marked@18.0.13-B-tDZfJAz9zUYDQYWjYtzA/node_modules/marked/lib/marked.esm.js
/**
	* marked v18.0.13 - a markdown parser
	* Copyright (c) 2018-2026, MarkedJS. (MIT License)
	* Copyright (c) 2011-2018, Christopher Jeffrey. (MIT License)
	* https://github.com/markedjs/marked
	*/
	/**
	* DO NOT EDIT THIS FILE
	* The code in this file is generated from files in ./src/
	*/
	function A() {
		return {
			async: !1,
			breaks: !1,
			extensions: null,
			gfm: !0,
			hooks: null,
			pedantic: !1,
			renderer: null,
			silent: !1,
			tokenizer: null,
			walkTokens: null
		};
	}
	var T = A();
	function U(l) {
		T = l;
	}
	var E = { exec: () => null };
	function I(l) {
		let e = [];
		return (t) => {
			let n = Math.max(0, Math.min(3, t - 1)), i = e[n];
			return i || (i = l(n), e[n] = i), i;
		};
	}
	function d(l, e = "") {
		let t = typeof l == "string" ? l : l.source, n = {
			replace: (i, r) => {
				let o = typeof r == "string" ? r : r.source;
				return o = o.replace(m.caret, "$1"), t = t.replace(i, o), n;
			},
			getRegex: () => new RegExp(t, e)
		};
		return n;
	}
	var we = ((l = "") => {
		try {
			return !!new RegExp("(?<=1)(?<!1)" + l);
		} catch {
			return !1;
		}
	})();
	var m = {
		codeRemoveIndent: /^(?: {0,3}\t| {1,4})/gm,
		outputLinkReplace: /\\([\[\]])/g,
		indentCodeCompensation: /^(\s+)(?:```)/,
		beginningSpace: /^\s+/,
		endingHash: /#$/,
		startingSpaceChar: /^ /,
		endingSpaceChar: / $/,
		endingSpaceTabChar: /[ \t]$/,
		nonSpaceChar: /[^ ]/,
		newLineCharGlobal: /\n/g,
		tabCharGlobal: /\t/g,
		multipleSpaceGlobal: /\s+/g,
		blankLine: /^[ \t]*$/,
		doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
		blockquoteStart: /^ {0,3}>/,
		blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
		blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
		listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
		listIsTask: /^\[[ xX]\] +\S/,
		listReplaceTask: /^\[[ xX]\] +/,
		listTaskCheckbox: /\[[ xX]\]/,
		anyLine: /\n.*\n/,
		hrefBrackets: /^<(.*)>$/,
		tableDelimiter: /[:|]/,
		tableAlignChars: /^\||\| *$/g,
		tableRowBlankLine: /\n[ \t]*$/,
		tableAlignRight: /^ *-+: *$/,
		tableAlignCenter: /^ *:-+: *$/,
		tableAlignLeft: /^ *:-+ *$/,
		startATag: /^<a /i,
		endATag: /^<\/a>/i,
		startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
		endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
		startAngleBracket: /^</,
		endAngleBracket: />$/,
		pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
		unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
		escapeTest: /[&<>"']/,
		escapeReplace: /[&<>"']/g,
		escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
		escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
		caret: /(^|[^\[])\^/g,
		percentDecode: /%25/g,
		findPipe: /\|/g,
		splitPipe: / \|/,
		slashPipe: /\\\|/g,
		carriageReturn: /\r\n|\r/g,
		spaceLine: /^ +$/gm,
		notSpaceStart: /^\S*/,
		endingNewline: /\n$/,
		listItemRegex: (l) => new RegExp(`^( {0,3}${l})((?:[	 ][^\\n]*)?(?:\\n|$))`),
		nextBulletRegex: I((l) => new RegExp(`^ {0,${l}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),
		hrRegex: I((l) => new RegExp(`^ {0,${l}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),
		fencesBeginRegex: I((l) => new RegExp(`^ {0,${l}}(?:\`\`\`|~~~)`)),
		headingBeginRegex: I((l) => new RegExp(`^ {0,${l}}#`)),
		htmlBeginRegex: I((l) => new RegExp(`^ {0,${l}}(?:</?(?:${H})(?: +|$|/?>)|<(?:script|pre|style|textarea|!--))`, "i")),
		blockquoteBeginRegex: I((l) => new RegExp(`^ {0,${l}}>`))
	};
	var ye = /^(?:[ \t]*(?:\n|$))+/;
	var Pe = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
	var Se = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
	var v = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
	var _e = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
	var K = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
	var le = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
	var ue = d(le).replace(/bull/g, K).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
	var $e = d(le).replace(/bull/g, K).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
	var W = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/;
	var Le = /^[^\n]+/;
	var X = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
	var ze = d(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", X).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
	var Ee = d(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, K).getRegex();
	var H = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
	var J = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
	var Me = d("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", J).replace("tag", H).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
	var pe = (l) => d(W).replace("hr", v).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", l).replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H).getRegex();
	var Ae = pe(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/);
	var Ie = pe(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/);
	var V = {
		blockquote: d(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Ie).getRegex(),
		code: Pe,
		def: ze,
		fences: Se,
		heading: _e,
		hr: v,
		html: Me,
		lheading: ue,
		list: Ee,
		newline: ye,
		paragraph: Ae,
		table: E,
		text: Le
	};
	var ie = d("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", v).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H).getRegex();
	var Be = {
		...V,
		lheading: $e,
		table: ie,
		paragraph: d(W).replace("hr", v).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", ie).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H).getRegex()
	};
	var De = {
		...V,
		html: d(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", J).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
		def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
		heading: /^(#{1,6})(.*)(?:\n+|$)/,
		fences: E,
		lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
		paragraph: d(W).replace("hr", v).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ue).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
	};
	var qe = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
	var ve = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
	var ce = /^( {2,}|\\)\n(?!\s*$)[ \t]*/;
	var He = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
	var _ = /[\p{P}\p{S}]/u;
	var C = /[\s\p{P}\p{S}]/u;
	var Z = /[^\s\p{P}\p{S}]/u;
	var Ze = d(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, C).getRegex();
	var Ge = /[\p{Pi}\p{Ps}"']/u;
	var he = /(?!~)[\p{P}\p{S}]/u;
	var Qe = /(?!~)[\s\p{P}\p{S}]/u;
	var Ne = /(?:[^\s\p{P}\p{S}]|~)/u;
	var je = d(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", we ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
	var de = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
	var Ue = d(de, "u").replace(/punct/g, _).getRegex();
	var Fe = d(de, "u").replace(/punct/g, he).getRegex();
	var We = d(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/, "u").replace(/openQuote/g, Ge).replace(/punct/g, _).getRegex();
	var ke = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
	var Xe = d(ke, "gu").replace(/notPunctSpace/g, Z).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
	var Je = d(ke, "gu").replace(/notPunctSpace/g, Ne).replace(/punctSpace/g, Qe).replace(/punct/g, he).getRegex();
	var Ye = d("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, Z).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
	var et = d("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, Z).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
	var nt = d("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, Z).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
	var rt = d(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, _).getRegex();
	var it = d("^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, Z).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
	var ot = d(/\\(punct)/, "gu").replace(/punct/g, _).getRegex();
	var at = d(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
	var lt = d(J).replace("(?:-->|$)", "-->").getRegex();
	var ut = d("^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", lt).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
	var ge = /\[(?:\\[\s\S]|[^\[\]\\])*\]/;
	var N = d(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace("brackets", ge).getRegex();
	var pt = d(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", N).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
	var ct = d(/^!?\[(label)\]\[(ref)\]/).replace("label", N).replace("ref", X).getRegex();
	var ht = d(/^!?\[(ref)\](?:\[\])?/).replace("ref", X).getRegex();
	var oe = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/;
	var dt = d(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace("brackets", ge).getRegex();
	var kt = d("reflink|nolink(?!\\()", "g").replace("reflink", d(/^!?\[(label)\]\[(ref)\]/).replace("label", dt).replace("ref", oe).getRegex()).replace("nolink", d(/^!?\[(ref)\](?:\[\])?/).replace("ref", oe).getRegex()).getRegex();
	var ae = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
	var Y = {
		_backpedal: E,
		anyPunctuation: ot,
		autolink: at,
		blockSkip: je,
		br: ce,
		code: ve,
		del: E,
		delLDelim: E,
		delRDelim: E,
		emStrongLDelim: Ue,
		emStrongRDelimAst: Xe,
		emStrongRDelimUnd: et,
		escape: qe,
		link: pt,
		nolink: ht,
		punctuation: Ze,
		reflink: ct,
		reflinkSearch: kt,
		tag: ut,
		text: He,
		url: E
	};
	var gt = {
		...Y,
		emStrongLDelim: We,
		emStrongRDelimAst: Ye,
		emStrongRDelimUnd: nt,
		link: d(/^!?\[(label)\]\((.*?)\)/).replace("label", N).getRegex(),
		reflink: d(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", N).getRegex()
	};
	var F = {
		...Y,
		emStrongRDelimAst: Je,
		emStrongLDelim: Fe,
		delLDelim: rt,
		delRDelim: it,
		url: d(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ae).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),
		_backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
		del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
		text: d(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ae).getRegex()
	};
	var ft = {
		...F,
		br: d(ce).replace("{2,}", "*").getRegex(),
		text: d(F.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
	};
	var G = {
		normal: V,
		gfm: Be,
		pedantic: De
	};
	var B = {
		normal: Y,
		gfm: F,
		breaks: ft,
		pedantic: gt
	};
	var mt = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	};
	var fe = (l) => mt[l];
	function R(l, e) {
		if (e) {
			if (m.escapeTest.test(l)) return l.replace(m.escapeReplace, fe);
		} else if (m.escapeTestNoEncode.test(l)) return l.replace(m.escapeReplaceNoEncode, fe);
		return l;
	}
	function ee(l) {
		try {
			l = encodeURI(l).replace(m.percentDecode, "%");
		} catch {
			return null;
		}
		return l;
	}
	function te(l, e) {
		let n = l.replace(m.findPipe, (r, o, s) => {
			let u = !1, a = o;
			for (; --a >= 0 && s[a] === "\\";) u = !u;
			return u ? "|" : " |";
		}).split(m.splitPipe), i = 0;
		if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
		else for (; n.length < e;) n.push("");
		for (; i < n.length; i++) n[i] = n[i].trim().replace(m.slashPipe, "|");
		return n;
	}
	function $(l, e, t) {
		let n = l.length;
		if (n === 0) return "";
		let i = 0;
		for (; i < n;) {
			let r = l.charAt(n - i - 1);
			if (r === e && !t) i++;
			else if (r !== e && t) i++;
			else break;
		}
		return l.slice(0, n - i);
	}
	function ne(l) {
		let e = l.split(`
`), t = e.length - 1;
		for (; t >= 0 && m.blankLine.test(e[t]);) t--;
		return e.length - t <= 2 ? l : e.slice(0, t + 1).join(`
`);
	}
	function D(l) {
		return l.toLowerCase().toUpperCase().toLowerCase();
	}
	function me(l, e) {
		if (l.indexOf(e[1]) === -1) return -1;
		let t = 0;
		for (let n = 0; n < l.length; n++) if (l[n] === "\\") n++;
		else if (l[n] === e[0]) t++;
		else if (l[n] === e[1] && (t--, t < 0)) return n;
		return t > 0 ? -2 : -1;
	}
	function xe(l, e = 0) {
		let t = e, n = "";
		for (let i of l) if (i === "	") {
			let r = 4 - t % 4;
			n += " ".repeat(r), t += r;
		} else n += i, t++;
		return n;
	}
	function be(l, e, t, n, i) {
		let r = e.href, o = e.title || null, s = l[1].replace(i.other.outputLinkReplace, "$1"), u = l[0].charAt(0) === "!";
		n.state.inLink = !0;
		let a = n.state.linkEmitted, p = n.state.inRawBlock;
		n.state.linkEmitted = !1;
		let c = n.inlineTokens(s), h = n.state.linkEmitted;
		if (n.state.linkEmitted = a, n.state.inLink = !1, !u) {
			if (h) {
				n.state.inRawBlock = p;
				return;
			}
			n.state.linkEmitted = !0;
		}
		return {
			type: u ? "image" : "link",
			raw: t,
			href: r,
			title: o,
			text: s,
			tokens: c
		};
	}
	function xt(l, e, t) {
		let n = l.match(t.other.indentCodeCompensation);
		if (n === null) return e;
		let i = n[1];
		return e.split(`
`).map((r) => {
			let o = r.match(t.other.beginningSpace);
			if (o === null) return r;
			let [s] = o;
			return r.slice(Math.min(s.length, i.length));
		}).join(`
`);
	}
	function Re(l, e, t, n) {
		if (!e.includes("<")) return !1;
		for (let i = 0; i < e.length; i++) {
			if (e[i] === "\\") {
				i++;
				continue;
			}
			if (e[i] === "`") {
				let s = n.inline.code.exec(e.slice(i));
				if (s) {
					i += s[0].length - 1;
					continue;
				}
			}
			if (e[i] !== "<") continue;
			let r = l.slice(t + i), o = n.inline.tag.exec(r) || n.inline.autolink.exec(r);
			if (o) {
				if (o[0].length > e.length - i) return !0;
				i += o[0].length - 1;
			}
		}
		return !1;
	}
	var y = class {
		options;
		rules;
		lexer;
		constructor(e) {
			this.options = e || T;
		}
		space(e) {
			let t = this.rules.block.newline.exec(e);
			if (t && t[0].length > 0) return {
				type: "space",
				raw: t[0]
			};
		}
		code(e) {
			let t = this.rules.block.code.exec(e);
			if (t) {
				let n = this.options.pedantic ? t[0] : ne(t[0]);
				return {
					type: "code",
					raw: n,
					codeBlockStyle: "indented",
					text: n.replace(this.rules.other.codeRemoveIndent, "")
				};
			}
		}
		fences(e) {
			let t = this.rules.block.fences.exec(e);
			if (t) {
				let n = t[0], i = xt(n, t[3] || "", this.rules);
				return {
					type: "code",
					raw: n,
					lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
					text: i
				};
			}
		}
		heading(e) {
			let t = this.rules.block.heading.exec(e);
			if (t) {
				let n = t[2].trim();
				if (this.rules.other.endingHash.test(n)) {
					let i = $(n, "#");
					(this.options.pedantic || !i || this.rules.other.endingSpaceTabChar.test(i)) && (n = i.trim());
				}
				return {
					type: "heading",
					raw: $(t[0], `
`),
					depth: t[1].length,
					text: n,
					tokens: this.lexer.inline(n)
				};
			}
		}
		hr(e) {
			let t = this.rules.block.hr.exec(e);
			if (t) return {
				type: "hr",
				raw: $(t[0], `
`)
			};
		}
		blockquote(e) {
			let t = this.rules.block.blockquote.exec(e);
			if (t) {
				let n = $(t[0], `
`).split(`
`), i = "", r = "", o = [];
				for (; n.length > 0;) {
					let s = !1, u = [], a = 0;
					for (; a < n.length; a++) if (this.rules.other.blockquoteStart.test(n[a])) u.push(n[a]), s = !0;
					else if (!s) u.push(n[a]);
					else break;
					n = n.slice(a);
					let p = u.join(`
`), c = p.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
					i = i ? `${i}
${p}` : p, r = r ? `${r}
${c}` : c;
					let h = this.lexer.state.top;
					if (this.lexer.state.top = !0, this.lexer.blockTokens(c, o, !0), this.lexer.state.top = h, n.length === 0) break;
					let k = o.at(-1);
					if (k?.type === "code") break;
					if (k?.type === "blockquote") {
						let O = k, g = n.join(`
`), w = O.raw + `
` + g.replace(this.rules.other.blockquoteSetextReplace2, ""), z = this.blockquote(w);
						o[o.length - 1] = z, i = `${i}
${g}`, r = r.substring(0, r.length - O.text.length) + z.text;
						break;
					} else if (k?.type === "list") {
						let O = k, g = O.raw + `
` + n.join(`
`), w = this.list(g);
						o[o.length - 1] = w, i = i.substring(0, i.length - k.raw.length) + w.raw, r = r.substring(0, r.length - O.raw.length) + w.raw, n = g.substring(o.at(-1).raw.length).split(`
`);
						continue;
					}
				}
				return {
					type: "blockquote",
					raw: i,
					tokens: o,
					text: r
				};
			}
		}
		list(e) {
			let t = this.rules.block.list.exec(e);
			if (t) {
				let n = t[1].trim(), i = n.length > 1, r = {
					type: "list",
					raw: "",
					ordered: i,
					start: i ? +n.slice(0, -1) : "",
					loose: !1,
					items: []
				};
				n = i ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = i ? n : "[*+-]");
				let o = this.rules.other.listItemRegex(n), s = !1;
				for (; e;) {
					let a = !1, p = "", c = "";
					if (!(t = o.exec(e)) || this.rules.block.hr.test(e)) break;
					p = t[0], e = e.substring(p.length);
					let h = xe(t[2].split(`
`, 1)[0], t[1].length), k = e.split(`
`, 1)[0], O = !h.trim(), g = 0;
					if (this.options.pedantic ? (g = 2, c = h.trimStart()) : O ? g = t[1].length + 1 : (g = h.search(this.rules.other.nonSpaceChar), g = g > 4 ? 1 : g, c = h.slice(g), g += t[1].length), O && this.rules.other.blankLine.test(k) && (p += k + `
`, e = e.substring(k.length + 1), a = !0), !a) {
						let w = this.rules.other.nextBulletRegex(g), z = this.rules.other.hrRegex(g), re = this.rules.other.fencesBeginRegex(g), se = this.rules.other.headingBeginRegex(g), Te = this.rules.other.htmlBeginRegex(g), Oe = this.rules.other.blockquoteBeginRegex(g);
						for (; e;) {
							let j = e.split(`
`, 1)[0], q;
							if (k = j, this.options.pedantic ? (k = k.replace(this.rules.other.listReplaceNesting, "  "), q = k) : q = k.replace(this.rules.other.tabCharGlobal, "    "), re.test(k) || se.test(k) || Te.test(k) || Oe.test(k) || w.test(k) || z.test(k)) break;
							if (q.search(this.rules.other.nonSpaceChar) >= g || !k.trim()) c += `
` + q.slice(g);
							else {
								if (O || h.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || re.test(h) || se.test(h) || z.test(h)) break;
								c += `
` + k;
							}
							O = !k.trim(), p += j + `
`, e = e.substring(j.length + 1), h = q.slice(g);
						}
					}
					r.loose || (s ? r.loose = !0 : this.rules.other.doubleBlankLine.test(p) && (s = !0)), r.items.push({
						type: "list_item",
						raw: p,
						task: !!this.options.gfm && this.rules.other.listIsTask.test(c),
						loose: !1,
						text: c,
						tokens: []
					}), r.raw += p;
				}
				let u = r.items.at(-1);
				if (u) u.raw = u.raw.trimEnd(), u.text = u.text.trimEnd();
				else return;
				r.raw = r.raw.trimEnd();
				for (let a of r.items) if (this.lexer.state.top = !1, a.tokens = this.lexer.blockTokens(a.text, []), !r.loose) {
					let p = a.tokens.filter((h) => h.type === "space");
					r.loose = p.length > 0 && p.some((h) => this.rules.other.anyLine.test(h.raw));
				}
				for (let a of r.items) {
					let p = a.tokens[0];
					if (a.task && (p?.type === "text" || p?.type === "paragraph")) {
						a.text = a.text.replace(this.rules.other.listReplaceTask, ""), p.raw = p.raw.replace(this.rules.other.listReplaceTask, ""), p.text = p.text.replace(this.rules.other.listReplaceTask, "");
						for (let h = this.lexer.inlineQueue.length - 1; h >= 0; h--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[h].src)) {
							this.lexer.inlineQueue[h].src = this.lexer.inlineQueue[h].src.replace(this.rules.other.listReplaceTask, "");
							break;
						}
						let c = this.rules.other.listTaskCheckbox.exec(a.raw);
						if (c) {
							let h = {
								type: "checkbox",
								raw: c[0] + " ",
								checked: c[0] !== "[ ]"
							};
							a.checked = h.checked, r.loose ? a.tokens[0] && ["paragraph", "text"].includes(a.tokens[0].type) && "tokens" in a.tokens[0] && a.tokens[0].tokens ? (a.tokens[0].raw = h.raw + a.tokens[0].raw, a.tokens[0].text = h.raw + a.tokens[0].text, a.tokens[0].tokens.unshift(h)) : a.tokens.unshift({
								type: "paragraph",
								raw: h.raw,
								text: h.raw,
								tokens: [h]
							}) : a.tokens.unshift(h);
						}
					} else a.task && (a.task = !1);
				}
				if (r.loose) for (let a of r.items) {
					a.loose = !0;
					for (let p of a.tokens) p.type === "text" && (p.type = "paragraph");
				}
				return r;
			}
		}
		html(e) {
			let t = this.rules.block.html.exec(e);
			if (t) {
				let n = ne(t[0]);
				return {
					type: "html",
					block: !0,
					raw: n,
					pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
					text: n
				};
			}
		}
		def(e) {
			let t = this.rules.block.def.exec(e);
			if (t) {
				let n = D(t[1]).replace(this.rules.other.multipleSpaceGlobal, " "), i = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
				return {
					type: "def",
					tag: n,
					raw: $(t[0], `
`),
					href: i,
					title: r
				};
			}
		}
		table(e) {
			let t = this.rules.block.table.exec(e);
			if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
			let n = te(t[1]), i = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], o = {
				type: "table",
				raw: $(t[0], `
`),
				header: [],
				align: [],
				rows: []
			};
			if (n.length === i.length) {
				for (let s of i) this.rules.other.tableAlignRight.test(s) ? o.align.push("right") : this.rules.other.tableAlignCenter.test(s) ? o.align.push("center") : this.rules.other.tableAlignLeft.test(s) ? o.align.push("left") : o.align.push(null);
				for (let s = 0; s < n.length; s++) o.header.push({
					text: n[s],
					tokens: this.lexer.inline(n[s]),
					header: !0,
					align: o.align[s]
				});
				for (let s of r) o.rows.push(te(s, o.header.length).map((u, a) => ({
					text: u,
					tokens: this.lexer.inline(u),
					header: !1,
					align: o.align[a]
				})));
				return o;
			}
		}
		lheading(e) {
			let t = this.rules.block.lheading.exec(e);
			if (t) {
				let n = t[1].trim();
				return {
					type: "heading",
					raw: $(t[0], `
`),
					depth: t[2].charAt(0) === "=" ? 1 : 2,
					text: n,
					tokens: this.lexer.inline(n)
				};
			}
		}
		paragraph(e) {
			let t = this.rules.block.paragraph.exec(e);
			if (t) {
				let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
				return {
					type: "paragraph",
					raw: t[0],
					text: n,
					tokens: this.lexer.inline(n)
				};
			}
		}
		text(e) {
			let t = this.rules.block.text.exec(e);
			if (t) return {
				type: "text",
				raw: t[0],
				text: t[0],
				tokens: this.lexer.inline(t[0])
			};
		}
		escape(e) {
			let t = this.rules.inline.escape.exec(e);
			if (t) return {
				type: "escape",
				raw: t[0],
				text: t[1]
			};
		}
		tag(e) {
			let t = this.rules.inline.tag.exec(e);
			if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
				type: "html",
				raw: t[0],
				inLink: this.lexer.state.inLink,
				inRawBlock: this.lexer.state.inRawBlock,
				block: !1,
				text: t[0]
			};
		}
		link(e) {
			let t = this.rules.inline.link.exec(e);
			if (t) {
				let n = t[0].charAt(0) === "!" ? 2 : 1;
				if (!this.options.pedantic && Re(e, t[1], n, this.rules)) return;
				let i = t[2].trim();
				if (!this.options.pedantic && this.rules.other.startAngleBracket.test(i)) {
					if (!this.rules.other.endAngleBracket.test(i)) return;
					let s = $(i.slice(0, -1), "\\");
					if ((i.length - s.length) % 2 === 0) return;
				} else {
					let s = me(t[2], "()");
					if (s === -2) return;
					if (s > -1) {
						let a = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + s;
						t[2] = t[2].substring(0, s), t[0] = t[0].substring(0, a).trim(), t[3] = "";
					}
				}
				let r = t[2], o = "";
				if (this.options.pedantic) {
					let s = this.rules.other.pedanticHrefTitle.exec(r);
					s && (r = s[1], o = s[3]);
				} else o = t[3] ? t[3].slice(1, -1) : "";
				return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(i) ? r = r.slice(1) : r = r.slice(1, -1)), be(t, {
					href: r && r.replace(this.rules.inline.anyPunctuation, "$1"),
					title: o && o.replace(this.rules.inline.anyPunctuation, "$1")
				}, t[0], this.lexer, this.rules);
			}
		}
		reflink(e, t) {
			let n;
			if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
				let i = n[0].charAt(0) === "!" ? 2 : 1;
				if (!this.options.pedantic && Re(e, n[1], i, this.rules)) return;
				let o = t[D((n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "))];
				if (!o) {
					let s = n[0].charAt(0);
					return {
						type: "text",
						raw: s,
						text: s
					};
				}
				return be(n, o, n[0], this.lexer, this.rules);
			}
		}
		emStrong(e, t, n = "") {
			let i = this.rules.inline.emStrongLDelim.exec(e);
			if (!i || !i[1] && !i[2] && !i[3] && !i[4] || i[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
			if (!(i[1] || i[3] || "") || !n || this.rules.inline.punctuation.exec(n)) {
				let o = [...i[0]].length - 1, s, u, a = o, p = 0, c = i[0][0], h = n === c, k = c === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
				for (k.lastIndex = 0, t = t.slice(-1 * e.length + o); (i = k.exec(t)) !== null;) {
					if (s = i[1] || i[2] || i[3] || i[4] || i[5] || i[6], !s) continue;
					if (u = [...s].length, i[3] || i[4]) {
						a += u;
						continue;
					} else if (i[5] || i[6]) {
						if (o % 3 && !((o + u) % 3)) {
							p += u;
							continue;
						}
						if (h) break;
					}
					if (a -= u, a > 0) continue;
					u = Math.min(u, u + a + p);
					let O = [...i[0]][0].length, g = e.slice(0, o + i.index + O + u);
					if (Math.min(o, u) % 2) {
						let z = g.slice(1, -1);
						return {
							type: "em",
							raw: g,
							text: z,
							tokens: this.lexer.inlineTokens(z)
						};
					}
					let w = g.slice(2, -2);
					return {
						type: "strong",
						raw: g,
						text: w,
						tokens: this.lexer.inlineTokens(w)
					};
				}
			}
		}
		codespan(e) {
			let t = this.rules.inline.code.exec(e);
			if (t) {
				let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), i = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
				return i && r && (n = n.substring(1, n.length - 1)), {
					type: "codespan",
					raw: t[0],
					text: n
				};
			}
		}
		br(e) {
			let t = this.rules.inline.br.exec(e);
			if (t) return {
				type: "br",
				raw: t[0]
			};
		}
		del(e, t, n = "") {
			let i = this.rules.inline.delLDelim.exec(e);
			if (!i) return;
			if (!(i[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
				let o = [...i[0]].length - 1, s, u, a = o, p = this.rules.inline.delRDelim;
				for (p.lastIndex = 0, t = t.slice(-1 * e.length + o); (i = p.exec(t)) !== null;) {
					if (s = i[1] || i[2] || i[3] || i[4] || i[5] || i[6], !s || (u = [...s].length, u !== o)) continue;
					if (i[3] || i[4]) {
						a += u;
						continue;
					}
					if (a -= u, a > 0) continue;
					u = Math.min(u, u + a);
					let c = [...i[0]][0].length, h = e.slice(0, o + i.index + c + u), k = h.slice(o, -o);
					return {
						type: "del",
						raw: h,
						text: k,
						tokens: this.lexer.inlineTokens(k)
					};
				}
			}
		}
		autolink(e) {
			let t = this.rules.inline.autolink.exec(e);
			if (t) {
				let n, i;
				return t[2] === "@" ? (n = t[1], i = "mailto:" + n) : (n = t[1], i = n), {
					type: "link",
					raw: t[0],
					text: n,
					href: i,
					autolink: !0,
					tokens: [{
						type: "text",
						raw: n,
						text: n
					}]
				};
			}
		}
		url(e) {
			let t;
			if (t = this.rules.inline.url.exec(e)) {
				let n, i;
				if (t[2] === "@") n = t[0], i = "mailto:" + n;
				else {
					let r;
					do
						r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
					while (r !== t[0]);
					n = t[0], t[1] === "www." ? i = "http://" + t[0] : i = t[0];
				}
				return {
					type: "link",
					raw: t[0],
					text: n,
					href: i,
					autolink: !0,
					tokens: [{
						type: "text",
						raw: n,
						text: n
					}]
				};
			}
		}
		inlineText(e) {
			let t = this.rules.inline.text.exec(e);
			if (t) {
				let n = this.lexer.state.inRawBlock;
				return {
					type: "text",
					raw: t[0],
					text: t[0],
					escaped: n
				};
			}
		}
	};
	var x = class l {
		tokens;
		options;
		state;
		inlineQueue;
		tokenizer;
		constructor(e) {
			this.tokens = [], this.tokens.links = Object.create(null), this.options = e || T, this.options.tokenizer = this.options.tokenizer || new y(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
				inLink: !1,
				inRawBlock: !1,
				linkEmitted: !1,
				top: !0
			};
			let t = {
				other: m,
				block: G.normal,
				inline: B.normal
			};
			this.options.pedantic ? (t.block = G.pedantic, t.inline = B.pedantic) : this.options.gfm && (t.block = G.gfm, this.options.breaks ? t.inline = B.breaks : t.inline = B.gfm), this.tokenizer.rules = t;
		}
		static get rules() {
			return {
				block: G,
				inline: B
			};
		}
		static lex(e, t) {
			return new l(t).lex(e);
		}
		static lexInline(e, t) {
			return new l(t).inlineTokens(e);
		}
		lex(e) {
			e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
			for (let t = 0; t < this.inlineQueue.length; t++) {
				let n = this.inlineQueue[t];
				this.inlineTokens(n.src, n.tokens);
			}
			return this.inlineQueue = [], this.tokens;
		}
		blockTokens(e, t = [], n = !1) {
			this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));
			let i = 1 / 0;
			for (; e;) {
				if (e.length < i) i = e.length;
				else {
					this.infiniteLoopError(e.charCodeAt(0));
					break;
				}
				let r;
				if (this.options.extensions?.block?.some((s) => (r = s.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), !0) : !1)) continue;
				if (r = this.tokenizer.space(e)) {
					e = e.substring(r.raw.length);
					let s = t.at(-1);
					r.raw.length === 1 && s !== void 0 ? s.raw += `
` : t.push(r);
					continue;
				}
				if (r = this.tokenizer.code(e)) {
					e = e.substring(r.raw.length);
					let s = t.at(-1);
					s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.at(-1).src = s.text) : t.push(r);
					continue;
				}
				if (r = this.tokenizer.fences(e)) {
					e = e.substring(r.raw.length), t.push(r);
					continue;
				}
				if (r = this.tokenizer.heading(e)) {
					e = e.substring(r.raw.length), t.push(r);
					continue;
				}
				if (r = this.tokenizer.hr(e)) {
					e = e.substring(r.raw.length), t.push(r);
					continue;
				}
				if (r = this.tokenizer.blockquote(e)) {
					e = e.substring(r.raw.length), t.push(r);
					continue;
				}
				if (r = this.tokenizer.list(e)) {
					e = e.substring(r.raw.length), t.push(r);
					continue;
				}
				if (r = this.tokenizer.html(e)) {
					e = e.substring(r.raw.length), t.push(r);
					continue;
				}
				if (r = this.tokenizer.def(e)) {
					e = e.substring(r.raw.length);
					let s = t.at(-1);
					s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.raw, this.inlineQueue.at(-1).src = s.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = {
						href: r.href,
						title: r.title
					}, t.push(r));
					continue;
				}
				if (r = this.tokenizer.table(e)) {
					e = e.substring(r.raw.length), t.push(r);
					continue;
				}
				if (r = this.tokenizer.lheading(e)) {
					e = e.substring(r.raw.length), t.push(r);
					continue;
				}
				let o = e;
				if (this.options.extensions?.startBlock) {
					let s = 1 / 0, u = e.slice(1), a;
					this.options.extensions.startBlock.forEach((p) => {
						a = p.call({ lexer: this }, u), typeof a == "number" && a >= 0 && (s = Math.min(s, a));
					}), s < 1 / 0 && s >= 0 && (o = e.substring(0, s + 1));
				}
				if (this.state.top && (r = this.tokenizer.paragraph(o))) {
					let s = t.at(-1);
					n && s?.type === "paragraph" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r), n = o.length !== e.length, e = e.substring(r.raw.length);
					continue;
				}
				if (r = this.tokenizer.text(e)) {
					e = e.substring(r.raw.length);
					let s = t.at(-1);
					s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r);
					continue;
				}
				if (e) {
					this.infiniteLoopError(e.charCodeAt(0));
					break;
				}
			}
			return this.state.top = !0, t;
		}
		inline(e, t = []) {
			return this.inlineQueue.push({
				src: e,
				tokens: t
			}), t;
		}
		linkInText(e) {
			if (!e.includes("[")) return !1;
			let t = this.tokenizer.rules.inline.link;
			for (let n of e.matchAll(this.tokenizer.rules.inline.blockSkip)) if (t.test(n[0]) && e.charAt(n.index - 1) !== "!") return !0;
			for (let n of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
				let i = n[0], r = i.lastIndexOf("[");
				if (!(i.charAt(0) === "!" || !Object.hasOwn(this.tokens.links, D(i.slice(r + 1, -1)))) && !(r > 1 && this.linkInText(i.slice(1, r - 1)))) return !0;
			}
			return !1;
		}
		inlineTokens(e, t = []) {
			this.tokenizer.lexer = this;
			let n = e;
			if (this.tokens.links && e.includes("[")) {
				let s = this.tokenizer.rules.inline.reflinkSearch, u = (a) => {
					let p = a.lastIndexOf("[");
					if (!Object.hasOwn(this.tokens.links, D(a.slice(p + 1, -1)))) return a;
					if (p > 1 && a.charAt(0) !== "!") {
						let c = a.slice(1, p - 1);
						if (this.linkInText(c)) return "[" + c.replace(s, u) + "][" + "a".repeat(a.length - p - 2) + "]";
					}
					return "[" + "a".repeat(a.length - 2) + "]";
				};
				n = n.replace(s, u);
			}
			n = n.replace(this.tokenizer.rules.inline.anyPunctuation, (s) => "+".repeat(s.length)), n = n.replace(this.tokenizer.rules.inline.blockSkip, (s, u, a) => {
				let p = a ? a.length : 0;
				return s.slice(0, p) + "[" + "a".repeat(s.length - p - 2) + "]";
			}), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
			let i = !1, r = "", o = 1 / 0;
			for (; e;) {
				if (e.length < o) o = e.length;
				else {
					this.infiniteLoopError(e.charCodeAt(0));
					break;
				}
				i || (r = ""), i = !1;
				let s;
				if (this.options.extensions?.inline?.some((a) => (s = a.call({ lexer: this }, e, t)) ? (e = e.substring(s.raw.length), t.push(s), !0) : !1)) continue;
				if (s = this.tokenizer.escape(e)) {
					e = e.substring(s.raw.length), t.push(s);
					continue;
				}
				if (s = this.tokenizer.tag(e)) {
					e = e.substring(s.raw.length), t.push(s);
					continue;
				}
				if (s = this.tokenizer.link(e)) {
					e = e.substring(s.raw.length), t.push(s);
					continue;
				}
				if (s = this.tokenizer.reflink(e, this.tokens.links)) {
					e = e.substring(s.raw.length);
					let a = t.at(-1);
					s.type === "text" && a?.type === "text" ? (a.raw += s.raw, a.text += s.text) : t.push(s);
					continue;
				}
				if (s = this.tokenizer.emStrong(e, n, r)) {
					e = e.substring(s.raw.length), t.push(s);
					continue;
				}
				if (s = this.tokenizer.codespan(e)) {
					e = e.substring(s.raw.length), t.push(s);
					continue;
				}
				if (s = this.tokenizer.br(e)) {
					e = e.substring(s.raw.length), t.push(s);
					continue;
				}
				if (s = this.tokenizer.del(e, n, r)) {
					e = e.substring(s.raw.length), t.push(s);
					continue;
				}
				if (s = this.tokenizer.autolink(e)) {
					e = e.substring(s.raw.length), t.push(s);
					continue;
				}
				if (!this.state.inLink && (s = this.tokenizer.url(e))) {
					e = e.substring(s.raw.length), t.push(s);
					continue;
				}
				let u = e;
				if (this.options.extensions?.startInline) {
					let a = 1 / 0, p = e.slice(1), c;
					this.options.extensions.startInline.forEach((h) => {
						c = h.call({ lexer: this }, p), typeof c == "number" && c >= 0 && (a = Math.min(a, c));
					}), a < 1 / 0 && a >= 0 && (u = e.substring(0, a + 1));
				}
				if (s = this.tokenizer.inlineText(u)) {
					e = e.substring(s.raw.length), s.raw.slice(-1) !== "_" && (r = s.raw.slice(-1)), i = !0;
					let a = t.at(-1);
					a?.type === "text" ? (a.raw += s.raw, a.text += s.text) : t.push(s);
					continue;
				}
				if (e) {
					this.infiniteLoopError(e.charCodeAt(0));
					break;
				}
			}
			return t;
		}
		infiniteLoopError(e) {
			let t = "Infinite loop on byte: " + e;
			if (this.options.silent) console.error(t);
			else throw new Error(t);
		}
	};
	var P = class {
		options;
		parser;
		constructor(e) {
			this.options = e || T;
		}
		space(e) {
			return "";
		}
		code({ text: e, lang: t, escaped: n }) {
			let i = (t || "").match(m.notSpaceStart)?.[0], r = e ? e.replace(m.endingNewline, "") + `
` : "";
			return i ? "<pre><code class=\"language-" + R(i) + "\">" + (n ? r : R(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : R(r, !0)) + `</code></pre>
`;
		}
		blockquote({ tokens: e }) {
			return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
		}
		html({ text: e }) {
			return e;
		}
		def(e) {
			return "";
		}
		heading({ tokens: e, depth: t }) {
			return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
		}
		hr(e) {
			return `<hr>
`;
		}
		list(e) {
			let t = e.ordered, n = e.start, i = "";
			for (let s = 0; s < e.items.length; s++) {
				let u = e.items[s];
				i += this.listitem(u);
			}
			let r = t ? "ol" : "ul", o = t && n !== 1 ? " start=\"" + n + "\"" : "";
			return "<" + r + o + `>
` + i + "</" + r + `>
`;
		}
		listitem(e) {
			return `<li>${this.parser.parse(e.tokens)}</li>
`;
		}
		checkbox({ checked: e }) {
			return "<input " + (e ? "checked=\"\" " : "") + "disabled=\"\" type=\"checkbox\"> ";
		}
		paragraph({ tokens: e }) {
			return `<p>${this.parser.parseInline(e)}</p>
`;
		}
		table(e) {
			let t = "", n = "";
			for (let r = 0; r < e.header.length; r++) n += this.tablecell(e.header[r]);
			t += this.tablerow({ text: n });
			let i = "";
			for (let r = 0; r < e.rows.length; r++) {
				let o = e.rows[r];
				n = "";
				for (let s = 0; s < o.length; s++) n += this.tablecell(o[s]);
				i += this.tablerow({ text: n });
			}
			return i && (i = `<tbody>${i}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + i + `</table>
`;
		}
		tablerow({ text: e }) {
			return `<tr>
${e}</tr>
`;
		}
		tablecell(e) {
			let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
			return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
		}
		strong({ tokens: e }) {
			return `<strong>${this.parser.parseInline(e)}</strong>`;
		}
		em({ tokens: e }) {
			return `<em>${this.parser.parseInline(e)}</em>`;
		}
		codespan({ text: e }) {
			return `<code>${R(e, !0)}</code>`;
		}
		br(e) {
			return "<br>";
		}
		del({ tokens: e }) {
			return `<del>${this.parser.parseInline(e)}</del>`;
		}
		link({ href: e, title: t, text: n, tokens: i, autolink: r }) {
			let o = r ? R(n, !0) : this.parser.parseInline(i), s = ee(e);
			if (s === null) return o;
			e = R(s, r);
			let u = "<a href=\"" + e + "\"";
			return t && (u += " title=\"" + R(t) + "\""), u += ">" + o + "</a>", u;
		}
		image({ href: e, title: t, text: n, tokens: i }) {
			i && (n = this.parser.parseInline(i, this.parser.textRenderer));
			let r = ee(e);
			if (r === null) return R(n);
			e = r;
			let o = `<img src="${R(e)}" alt="${R(n)}"`;
			return t && (o += ` title="${R(t)}"`), o += ">", o;
		}
		text(e) {
			return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : R(e.text);
		}
	};
	var L = class {
		strong({ text: e }) {
			return e;
		}
		em({ text: e }) {
			return e;
		}
		codespan({ text: e }) {
			return e;
		}
		del({ text: e }) {
			return e;
		}
		html({ text: e }) {
			return e;
		}
		text({ text: e }) {
			return e;
		}
		link({ text: e }) {
			return "" + e;
		}
		image({ text: e }) {
			return "" + e;
		}
		br() {
			return "";
		}
		checkbox({ raw: e }) {
			return e;
		}
	};
	var b = class l {
		options;
		renderer;
		textRenderer;
		constructor(e) {
			this.options = e || T, this.options.renderer = this.options.renderer || new P(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new L();
		}
		static parse(e, t) {
			return new l(t).parse(e);
		}
		static parseInline(e, t) {
			return new l(t).parseInline(e);
		}
		parse(e) {
			this.renderer.parser = this;
			let t = "";
			for (let n = 0; n < e.length; n++) {
				let i = e[n];
				if (this.options.extensions?.renderers?.[i.type]) {
					let o = i, s = this.options.extensions.renderers[o.type].call({ parser: this }, o);
					if (s !== !1 || ![
						"space",
						"hr",
						"heading",
						"code",
						"table",
						"blockquote",
						"list",
						"checkbox",
						"html",
						"def",
						"paragraph",
						"text"
					].includes(o.type)) {
						t += s || "";
						continue;
					}
				}
				let r = i;
				switch (r.type) {
					case "space":
						t += this.renderer.space(r);
						break;
					case "hr":
						t += this.renderer.hr(r);
						break;
					case "heading":
						t += this.renderer.heading(r);
						break;
					case "code":
						t += this.renderer.code(r);
						break;
					case "table":
						t += this.renderer.table(r);
						break;
					case "blockquote":
						t += this.renderer.blockquote(r);
						break;
					case "list":
						t += this.renderer.list(r);
						break;
					case "checkbox":
						t += this.renderer.checkbox(r);
						break;
					case "html":
						t += this.renderer.html(r);
						break;
					case "def":
						t += this.renderer.def(r);
						break;
					case "paragraph":
						t += this.renderer.paragraph(r);
						break;
					case "text":
						t += this.renderer.text(r);
						break;
					default: {
						let o = "Token with \"" + r.type + "\" type was not found.";
						if (this.options.silent) return console.error(o), "";
						throw new Error(o);
					}
				}
			}
			return t;
		}
		parseInline(e, t = this.renderer) {
			this.renderer.parser = this;
			let n = "";
			for (let i = 0; i < e.length; i++) {
				let r = e[i];
				if (this.options.extensions?.renderers?.[r.type]) {
					let s = this.options.extensions.renderers[r.type].call({ parser: this }, r);
					if (s !== !1 || ![
						"escape",
						"html",
						"link",
						"image",
						"checkbox",
						"strong",
						"em",
						"codespan",
						"br",
						"del",
						"text"
					].includes(r.type)) {
						n += s || "";
						continue;
					}
				}
				let o = r;
				switch (o.type) {
					case "escape":
						n += t.text(o);
						break;
					case "html":
						n += t.html(o);
						break;
					case "link":
						n += t.link(o);
						break;
					case "image":
						n += t.image(o);
						break;
					case "checkbox":
						n += t.checkbox(o);
						break;
					case "strong":
						n += t.strong(o);
						break;
					case "em":
						n += t.em(o);
						break;
					case "codespan":
						n += t.codespan(o);
						break;
					case "br":
						n += t.br(o);
						break;
					case "del":
						n += t.del(o);
						break;
					case "text":
						n += t.text(o);
						break;
					default: {
						let s = "Token with \"" + o.type + "\" type was not found.";
						if (this.options.silent) return console.error(s), "";
						throw new Error(s);
					}
				}
			}
			return n;
		}
	};
	var S = class {
		options;
		block;
		constructor(e) {
			this.options = e || T;
		}
		static passThroughHooks = /* @__PURE__ */ new Set([
			"preprocess",
			"postprocess",
			"processAllTokens",
			"emStrongMask"
		]);
		static passThroughHooksRespectAsync = /* @__PURE__ */ new Set([
			"preprocess",
			"postprocess",
			"processAllTokens"
		]);
		preprocess(e) {
			return e;
		}
		postprocess(e) {
			return e;
		}
		processAllTokens(e) {
			return e;
		}
		emStrongMask(e) {
			return e;
		}
		provideLexer(e = this.block) {
			return e ? x.lex : x.lexInline;
		}
		provideParser(e = this.block) {
			return e ? b.parse : b.parseInline;
		}
	};
	var Q = class {
		defaults = A();
		options = this.setOptions;
		parse = this.parseMarkdown(!0);
		parseInline = this.parseMarkdown(!1);
		Parser = b;
		Renderer = P;
		TextRenderer = L;
		Lexer = x;
		Tokenizer = y;
		Hooks = S;
		constructor(...e) {
			this.use(...e);
		}
		walkTokens(e, t) {
			let n = [];
			for (let i of e) switch (n = n.concat(t.call(this, i)), i.type) {
				case "table": {
					let r = i;
					for (let o of r.header) n = n.concat(this.walkTokens(o.tokens, t));
					for (let o of r.rows) for (let s of o) n = n.concat(this.walkTokens(s.tokens, t));
					break;
				}
				case "list": {
					let r = i;
					n = n.concat(this.walkTokens(r.items, t));
					break;
				}
				default: {
					let r = i;
					this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach((o) => {
						let s = r[o].flat(1 / 0);
						n = n.concat(this.walkTokens(s, t));
					}) : r.tokens && (n = n.concat(this.walkTokens(r.tokens, t)));
				}
			}
			return n;
		}
		use(...e) {
			let t = this.defaults.extensions || {
				renderers: {},
				childTokens: {}
			};
			return e.forEach((n) => {
				let i = { ...n };
				if (i.async = this.defaults.async || i.async || !1, n.extensions && (n.extensions.forEach((r) => {
					if (!r.name) throw new Error("extension name required");
					if ("renderer" in r) {
						let o = t.renderers[r.name];
						o ? t.renderers[r.name] = function(...s) {
							let u = r.renderer.apply(this, s);
							return u === !1 && (u = o.apply(this, s)), u;
						} : t.renderers[r.name] = r.renderer;
					}
					if ("tokenizer" in r) {
						if (!r.level || r.level !== "block" && r.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
						let o = t[r.level];
						o ? o.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
					}
					"childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
				}), i.extensions = t), n.renderer) {
					let r = this.defaults.renderer || new P(this.defaults);
					for (let o in n.renderer) {
						if (!(o in r)) throw new Error(`renderer '${o}' does not exist`);
						if (["options", "parser"].includes(o)) continue;
						let s = o, u = n.renderer[s], a = r[s];
						r[s] = (...p) => {
							let c = u.apply(r, p);
							return c === !1 && (c = a.apply(r, p)), c || "";
						};
					}
					i.renderer = r;
				}
				if (n.tokenizer) {
					let r = this.defaults.tokenizer || new y(this.defaults);
					for (let o in n.tokenizer) {
						if (!(o in r)) throw new Error(`tokenizer '${o}' does not exist`);
						if ([
							"options",
							"rules",
							"lexer"
						].includes(o)) continue;
						let s = o, u = n.tokenizer[s], a = r[s];
						r[s] = (...p) => {
							let c = u.apply(r, p);
							return c === !1 && (c = a.apply(r, p)), c;
						};
					}
					i.tokenizer = r;
				}
				if (n.hooks) {
					let r = this.defaults.hooks || new S();
					for (let o in n.hooks) {
						if (!(o in r)) throw new Error(`hook '${o}' does not exist`);
						if (["options", "block"].includes(o)) continue;
						let s = o, u = n.hooks[s], a = r[s];
						S.passThroughHooks.has(o) ? r[s] = (p) => {
							if (this.defaults.async && S.passThroughHooksRespectAsync.has(o)) return (async () => {
								let h = await u.call(r, p);
								return a.call(r, h);
							})();
							let c = u.call(r, p);
							return a.call(r, c);
						} : r[s] = (...p) => {
							if (this.defaults.async) return (async () => {
								let h = await u.apply(r, p);
								return h === !1 && (h = await a.apply(r, p)), h;
							})();
							let c = u.apply(r, p);
							return c === !1 && (c = a.apply(r, p)), c;
						};
					}
					i.hooks = r;
				}
				if (n.walkTokens) {
					let r = this.defaults.walkTokens, o = n.walkTokens;
					i.walkTokens = function(s) {
						let u = [];
						return u.push(o.call(this, s)), r && (u = u.concat(r.call(this, s))), u;
					};
				}
				this.defaults = {
					...this.defaults,
					...i
				};
			}), this;
		}
		setOptions(e) {
			return this.defaults = {
				...this.defaults,
				...e
			}, this;
		}
		lexer(e, t) {
			return x.lex(e, t ?? this.defaults);
		}
		parser(e, t) {
			return b.parse(e, t ?? this.defaults);
		}
		parseMarkdown(e) {
			return (n, i) => {
				let r = { ...i }, o = {
					...this.defaults,
					...r
				}, s = this.onError(!!o.silent, !!o.async);
				if (this.defaults.async === !0 && r.async === !1) return s(/* @__PURE__ */ new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
				if (typeof n > "u" || n === null) return s(/* @__PURE__ */ new Error("marked(): input parameter is undefined or null"));
				if (typeof n != "string") return s(/* @__PURE__ */ new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
				if (o.hooks && (o.hooks.options = o, o.hooks.block = e), o.async) return (async () => {
					let u = o.hooks ? await o.hooks.preprocess(n) : n, p = await (o.hooks ? await o.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(u, o), c = o.hooks ? await o.hooks.processAllTokens(p) : p;
					o.walkTokens && await Promise.all(this.walkTokens(c, o.walkTokens));
					let k = await (o.hooks ? await o.hooks.provideParser(e) : e ? b.parse : b.parseInline)(c, o);
					return o.hooks ? await o.hooks.postprocess(k) : k;
				})().catch(s);
				try {
					o.hooks && (n = o.hooks.preprocess(n));
					let a = (o.hooks ? o.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(n, o);
					o.hooks && (a = o.hooks.processAllTokens(a)), o.walkTokens && this.walkTokens(a, o.walkTokens);
					let c = (o.hooks ? o.hooks.provideParser(e) : e ? b.parse : b.parseInline)(a, o);
					return o.hooks && (c = o.hooks.postprocess(c)), c;
				} catch (u) {
					return s(u);
				}
			};
		}
		onError(e, t) {
			return (n) => {
				if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
					let i = "<p>An error occurred:</p><pre>" + R(n.message + "", !0) + "</pre>";
					return t ? Promise.resolve(i) : i;
				}
				if (t) return Promise.reject(n);
				throw n;
			};
		}
	};
	var M = new Q();
	function f(l, e) {
		return M.parse(l, e);
	}
	f.options = f.setOptions = function(l) {
		return M.setOptions(l), f.defaults = M.defaults, U(f.defaults), f;
	};
	f.getDefaults = A;
	f.defaults = T;
	function bt(...l) {
		return M.use(...l), f.defaults = M.defaults, U(f.defaults), f;
	}
	f.use = bt;
	f.walkTokens = function(l, e) {
		return M.walkTokens(l, e);
	};
	f.parseInline = M.parseInline;
	f.Parser = b;
	f.parser = b.parse;
	f.Renderer = P;
	f.TextRenderer = L;
	f.Lexer = x;
	f.lexer = x.lex;
	f.Tokenizer = y;
	f.Hooks = S;
	f.parse = f;
	var un = f.options;
	var pn = f.setOptions;
	var cn = f.walkTokens;
	var hn = f.parseInline;
	var kn = b.parse;
	var gn = x.lex;

// packages/blocks/build-module/api/raw-handling/markdown-converter.mjs
	function escapeBodyText(value) {
		return value.replace(/&(?!#?\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	const converter = new Q({
		gfm: true,
		breaks: true,
		renderer: {
			code({ text, lang }) {
				const language = (lang || "").match(/^\S*/)?.[0];
				return `<pre><code${language ? ` class="${language} language-${language}"` : ""}>${escapeBodyText(text)}</code></pre>`;
			},
			text(token) {
				if ("tokens" in token && token.tokens || "escaped" in token && token.escaped) return false;
				return escapeBodyText(token.text);
			}
		}
	});
	/**
	* Corrects the Slack Markdown variant of the code block.
	* If uncorrected, it will be converted to inline code.
	*
	* @see https://get.slack.help/hc/en-us/articles/202288908-how-can-i-add-formatting-to-my-messages-#code-blocks
	*
	* @param text The potential Markdown text to correct.
	*
	* @return The corrected Markdown.
	*/
	function slackMarkdownVariantCorrector(text) {
		return text.replace(/((?:^|\n)```)([^\n`]+)(```(?:$|\n))/, (match, p1, p2, p3) => `${p1}\n${p2}\n${p3}`);
	}
	function bulletsToAsterisks(text) {
		return text.replace(/(^|\n)•( +)/g, "$1*$2");
	}
	/**
	* Escapes an ordered-list marker at the start of single-line input so prose
	* like "18. May 2021" isn't parsed as `<ol start="18"><li>May 2021</li></ol>`.
	*
	* @param text The potential Markdown text to correct.
	*/
	function escapeSingleLineOrderedListMarker(text) {
		if (text.includes("\n")) return text;
		return text.replace(/^(\d+)\.(\s)/, "$1\\.$2");
	}
	const correctors = [
		escapeSingleLineOrderedListMarker,
		bulletsToAsterisks,
		slackMarkdownVariantCorrector
	];
	/**
	* Converts a piece of text into HTML based on any Markdown present.
	* Also decodes any encoded HTML.
	*
	* @param text The plain text to convert.
	*
	* @return HTML.
	*/
	function markdownConverter(text) {
		return converter.parse(correctors.reduce((current, corrector) => corrector(current), text), { async: false });
	}

// packages/blocks/build-module/api/raw-handling/iframe-remover.mjs
/**
	* Removes iframes.
	*
	* @param iframe The node to check.
	*/
	function iframeRemover(iframe) {
		if (iframe.nodeName === "IFRAME") {
			const node = iframe;
			const text = node.ownerDocument.createTextNode(node.src);
			node.parentNode.replaceChild(text, node);
		}
	}

// packages/blocks/build-module/api/raw-handling/google-docs-uid-remover.mjs
	function googleDocsUIdRemover(node) {
		const el = node;
		if (!el.id || el.id.indexOf("docs-internal-guid-") !== 0) return;
		if (el.tagName === "B") (0, _wordpress_dom.unwrap)(node);
		else el.removeAttribute("id");
	}

// packages/blocks/build-module/api/raw-handling/non-breaking-space-corrector.mjs
/**
	* Replaces non-breaking spaces at the start and end of a text node with
	* regular spaces. Browsers insert them where text meets an element, such as
	* before a link, and Word puts them at the end of lines. Spaces left at the
	* end of a line or doubled up are removed by `htmlFormattingRemover`. Text
	* that is nothing but non-breaking spaces, on its own, is left alone.
	*
	* @param node The node to be processed.
	*/
	function nonBreakingSpaceCorrector(node) {
		if (node.nodeType !== node.TEXT_NODE) return;
		if (node.parentElement?.closest("pre")) return;
		const text = node;
		if (/^\u00a0+$/.test(text.data) && !getSibling(node, "previous") && !getSibling(node, "next")) return;
		text.data = text.data.replace(/^\u00a0+|\u00a0+$/g, " ");
	}

// packages/blocks/build-module/api/raw-handling/html-formatting-remover.mjs
	function isFormattingSpace(character) {
		return character === " " || character === "\r" || character === "\n" || character === "	";
	}
	/**
	* Removes spacing that formats HTML.
	*
	* @see https://www.w3.org/TR/css-text-3/#white-space-processing
	*
	* @param node The node to be processed.
	*/
	function htmlFormattingRemover(node) {
		if (node.nodeType !== node.TEXT_NODE) return;
		let parent = node;
		while (parent = parent.parentNode) if (parent.nodeType === parent.ELEMENT_NODE && parent.nodeName === "PRE") return;
		const textNode = node;
		let newData = textNode.data.replace(/[ \r\n\t]+/g, " ");
		if (newData[0] === " ") {
			const previousSibling = getSibling(node, "previous");
			if (!previousSibling || previousSibling.nodeName === "BR" || previousSibling.textContent.slice(-1) === " ") newData = newData.slice(1);
		}
		if (newData[newData.length - 1] === " ") {
			const nextSibling = getSibling(node, "next");
			if (!nextSibling || nextSibling.nodeName === "BR" || nextSibling.nodeType === nextSibling.TEXT_NODE && isFormattingSpace(nextSibling.textContent[0])) newData = newData.slice(0, -1);
		}
		if (!newData) node.parentNode.removeChild(node);
		else textNode.data = newData;
	}

// packages/blocks/build-module/api/raw-handling/format-space-corrector.mjs
/**
	* Moves a space from one edge of an element out to the surrounding text.
	*
	* This runs alongside `htmlFormattingRemover`, which already strips an edge
	* space whenever the outside is separated (a block edge, a line break, or a
	* neighbour that ends/starts with a space). So an edge space only survives to
	* here when it abuts real content with no separator, in which case it always
	* needs hoisting out — no further checks required.
	*
	* `htmlFormattingRemover` also runs first, collapsing every run of `[ \r\n\t]`
	* to a single regular space, so the edge can only be a lone `' '` by now. A
	* non-breaking space (`&nbsp;`) is intentionally left untouched by both filters,
	* hence the strict `=== ' '` check rather than a general whitespace test.
	*
	* @param node      The element to be processed.
	* @param doc       The document of the node.
	* @param isLeading Whether to process the leading (`true`) or trailing edge.
	*/
	function moveEdgeSpace(node, doc, isLeading) {
		const child = isLeading ? node.firstChild : node.lastChild;
		if (!child || child.nodeType !== node.TEXT_NODE) return;
		const text = child;
		const edgeIndex = isLeading ? 0 : text.data.length - 1;
		if (text.data[edgeIndex] !== " ") return;
		text.data = isLeading ? text.data.slice(1) : text.data.slice(0, -1);
		if (!text.data) node.removeChild(text);
		node.parentNode.insertBefore(doc.createTextNode(" "), isLeading ? node : node.nextSibling);
	}
	/**
	* Moves leading and trailing spaces out of inline formatting elements, so that
	* the formatting (a link, bold, italic…) wraps only its meaningful content.
	*
	* Some editors, notably Google Docs, place the space that separates a word from
	* an adjacent link *inside* the formatting element (e.g.
	* `before<a> text</a>after`). That leading/trailing space is purely
	* presentational and ends up underlined/linked, so it is hoisted to the
	* surrounding text instead (`before <a>text</a>after`).
	*
	* @param node The node to be processed.
	* @param doc  The document of the node.
	*/
	function formatSpaceCorrector(node, doc) {
		if (node.nodeType !== node.ELEMENT_NODE || !(0, _wordpress_dom.isPhrasingContent)(node)) return;
		moveEdgeSpace(node, doc, true);
		moveEdgeSpace(node, doc, false);
	}

// packages/blocks/build-module/api/raw-handling/br-remover.mjs
/**
	* Removes trailing br elements from text-level content.
	*
	* @param node Node to check.
	*/
	function brRemover(node) {
		if (node.nodeName !== "BR") return;
		if (getSibling(node, "next")) return;
		node.parentNode.removeChild(node);
	}

// packages/blocks/build-module/api/raw-handling/empty-paragraph-remover.mjs
/**
	* Removes empty paragraph elements.
	*
	* @param node Node to check.
	*/
	function emptyParagraphRemover(node) {
		if (node.nodeName !== "P") return;
		if (node.hasChildNodes()) return;
		node.parentNode.removeChild(node);
	}

// packages/blocks/build-module/api/raw-handling/slack-paragraph-corrector.mjs
/**
	* Replaces Slack paragraph markup with a double line break (later converted to
	* a proper paragraph).
	*
	* @param node Node to check.
	*/
	function slackParagraphCorrector(node) {
		if (node.nodeName !== "SPAN") return;
		if (node.getAttribute("data-stringify-type") !== "paragraph-break") return;
		const parentNode = node.parentNode;
		parentNode.insertBefore(node.ownerDocument.createElement("br"), node);
		parentNode.insertBefore(node.ownerDocument.createElement("br"), node);
		parentNode.removeChild(node);
	}

// packages/blocks/build-module/api/raw-handling/latex-to-math.mjs
	function isLatexMathMode(text) {
		const lettersRegex = /[\p{L}\s]+/gu;
		let match;
		while (match = lettersRegex.exec(text)) {
			if (text[match.index - 1] === "{") continue;
			let sequence = match[0];
			if (text[match.index - 1] === "\\") sequence = sequence.replace(/^[a-zA-Z]+/, "");
			if (sequence.length < 6) continue;
			return false;
		}
		if (/\\[a-zA-Z]+\s*\{/g.test(text)) return true;
		if ([
			(t) => t.includes("^") && !t.startsWith("^"),
			(t) => [
				"=",
				"+",
				"-",
				"/",
				"*"
			].some((operator) => t.includes(operator)),
			(t) => /\\[a-zA-Z]+/g.test(t)
		].filter((clue) => clue(text)).length >= 2) return true;
		return false;
	}

// packages/blocks/build-module/api/raw-handling/heading-transformer.mjs
/**
	* Transforms paragraphs with heading semantics into proper heading tags.
	*
	* This handles cases where content (like from Microsoft Word Online) comes in as
	* <p> tags with role="heading" and aria-level attributes, and converts them to
	* proper <h1>, <h2>, etc. tags.
	*
	* @param node The node to check and potentially transform.
	*/
	function headingTransformer(node) {
		if (node.nodeType !== node.ELEMENT_NODE) return;
		const element = node;
		if (element.tagName === "P" && element.getAttribute("role") === "heading" && element.hasAttribute("aria-level")) {
			const level = parseInt(element.getAttribute("aria-level"), 10);
			if (level >= 1 && level <= 6) {
				const headingTag = `H${level}`;
				const newHeading = element.ownerDocument.createElement(headingTag);
				Array.from(element.attributes).forEach((attr) => {
					if (attr.name !== "role" && attr.name !== "aria-level") newHeading.setAttribute(attr.name, attr.value);
				});
				while (element.firstChild) newHeading.appendChild(element.firstChild);
				element.parentNode.replaceChild(newHeading, element);
			}
		}
	}

// packages/blocks/build-module/api/raw-handling/paste-handler.mjs
	const log = (...args) => window?.console?.log?.(...args);
	/**
	* Filters HTML to only contain phrasing content.
	*
	* @param HTML The HTML to filter.
	*
	* @return HTML only containing phrasing content.
	*/
	function filterInlineHTML(HTML) {
		HTML = deepFilterHTML(HTML, [
			headRemover,
			googleDocsUIdRemover,
			msListIgnore,
			phrasingContentReducer,
			commentRemover
		]);
		HTML = (0, _wordpress_dom.removeInvalidHTML)(HTML, (0, _wordpress_dom.getPhrasingContentSchema)("paste"), true);
		HTML = deepFilterHTML(HTML, [
			nonBreakingSpaceCorrector,
			htmlFormattingRemover,
			formatSpaceCorrector,
			brRemover
		]);
		log("Processed inline HTML:\n\n", HTML);
		return HTML;
	}
	/**
	* Converts an HTML string to known blocks. Strips everything else.
	*
	* @param options
	* @param options.HTML      The HTML to convert.
	* @param options.plainText Plain text version.
	* @param options.mode      Handle content as blocks or inline content.
	*                          * 'AUTO': Decide based on the content passed.
	*                          * 'INLINE': Always handle as inline content, and return string.
	*                          * 'BLOCKS': Always handle as blocks, and return array of blocks.
	* @param options.tagName   The tag into which content will be inserted.
	*
	* @return A list of blocks or a string, depending on `handlerMode`.
	*/
	function pasteHandler({ HTML = "", plainText = "", mode = "AUTO", tagName }) {
		log("Received HTML (pasteHandler):\n\n", HTML);
		log("Received plain text (pasteHandler):\n\n", plainText);
		HTML = HTML.replace(/<meta[^>]+>/g, "");
		HTML = HTML.replace(/^\s*<html[^>]*>\s*<body[^>]*>(?:\s*<!--\s*StartFragment\s*-->)?/i, "");
		HTML = HTML.replace(/(?:<!--\s*EndFragment\s*-->\s*)?<\/body>\s*<\/html>\s*$/i, "");
		if (mode !== "INLINE") {
			const content = HTML ? HTML : plainText;
			if (content.indexOf("<!-- wp:") !== -1) {
				const parseResult = parse(content);
				if (!(parseResult.length === 1 && parseResult[0].name === "core/freeform")) return parseResult;
			}
		}
		HTML = HTML.normalize();
		HTML = deepFilterHTML(HTML, [slackParagraphCorrector]);
		const isPlainText = plainText && (!HTML || isPlain(HTML));
		if (isPlainText && isLatexMathMode(plainText)) return [createBlock("core/math", { latex: plainText })];
		if (isPlainText) {
			HTML = plainText;
			if (!/^\s+$/.test(plainText)) HTML = markdownConverter(HTML);
		}
		const pieces = segmentHTMLToShortcodeBlock(HTML);
		const hasShortcodes = pieces.length > 1;
		if (isPlainText && !hasShortcodes) {
			if (mode === "AUTO" && plainText.indexOf("\n") === -1 && plainText.indexOf("<p>") !== 0 && HTML.indexOf("<p>") === 0) mode = "INLINE";
		}
		if (mode === "INLINE") return filterInlineHTML(HTML);
		if (mode === "AUTO" && !hasShortcodes && isInlineContent(HTML, tagName)) return filterInlineHTML(HTML);
		const phrasingContentSchema = (0, _wordpress_dom.getPhrasingContentSchema)("paste");
		const blockContentSchema = getBlockContentSchema("paste");
		const blocks = pieces.map((piece) => {
			if (typeof piece !== "string") return piece;
			const filters = [
				googleDocsUIdRemover,
				msListConverter,
				headRemover,
				listReducer,
				imageCorrector,
				phrasingContentReducer,
				specialCommentConverter,
				commentRemover,
				iframeRemover,
				figureContentReducer,
				blockquoteNormaliser(),
				divNormaliser,
				headingTransformer
			];
			const schema = {
				...blockContentSchema,
				...phrasingContentSchema
			};
			piece = deepFilterHTML(piece, filters, blockContentSchema);
			piece = (0, _wordpress_dom.removeInvalidHTML)(piece, schema, false);
			piece = normaliseBlocks(piece);
			piece = deepFilterHTML(piece, [
				nonBreakingSpaceCorrector,
				htmlFormattingRemover,
				formatSpaceCorrector,
				brRemover,
				emptyParagraphRemover
			], blockContentSchema);
			log("Processed HTML piece:\n\n", piece);
			return htmlToBlocks(piece, pasteHandler);
		}).flat().filter(Boolean);
		if (mode === "AUTO" && blocks.length === 1 && hasBlockSupport(blocks[0].name, "__unstablePasteTextInline", false)) {
			const trimRegex = /^[\n]+|[\n]+$/g;
			const trimmedPlainText = plainText.replace(trimRegex, "");
			if (trimmedPlainText !== "" && trimmedPlainText.indexOf("\n") === -1) return (0, _wordpress_dom.removeInvalidHTML)(getBlockInnerHTML(blocks[0]), phrasingContentSchema, false).replace(trimRegex, "");
		}
		return blocks;
	}

// packages/blocks/build-module/api/raw-handling/index.mjs
	function deprecatedGetPhrasingContentSchema(context) {
		(0, _wordpress_deprecated.default)("wp.blocks.getPhrasingContentSchema", {
			since: "5.6",
			alternative: "wp.dom.getPhrasingContentSchema"
		});
		return (0, _wordpress_dom.getPhrasingContentSchema)(context);
	}
	/**
	* Converts an HTML string to known blocks.
	*
	* @param options      Options.
	* @param options.HTML The HTML to convert.
	*
	* @example
	* ```js
	* import { rawHandler } from '@wordpress/blocks';
	*
	* const blocks = rawHandler( { HTML: '<p>Hello</p><p>World</p>' } );
	* ```
	*
	* @return A list of blocks.
	*/
	function rawHandler({ HTML = "" }) {
		if (HTML.indexOf("<!-- wp:") !== -1) {
			const parseResult = parse(HTML);
			if (!(parseResult.length === 1 && parseResult[0].name === "core/freeform")) return parseResult;
		}
		const pieces = segmentHTMLToShortcodeBlock(HTML);
		const blockContentSchema = getBlockContentSchema();
		return pieces.map((piece) => {
			if (typeof piece !== "string") return piece;
			const filters = [
				listReducer,
				specialCommentConverter,
				figureContentReducer,
				blockquoteNormaliser({ raw: true })
			];
			piece = deepFilterHTML(piece, filters, blockContentSchema);
			piece = normaliseBlocks(piece, { raw: true });
			return htmlToBlocks(piece, rawHandler);
		}).flat().filter(Boolean);
	}

// packages/blocks/build-module/api/categories.mjs
/**
	* Returns all the block categories.
	* Ignored from documentation as the recommended usage is via useSelect from `@wordpress/data`.
	*
	* @ignore
	*
	* @return Block categories.
	*/
	function getCategories() {
		return (0, _wordpress_data.select)(store).getCategories();
	}
	/**
	* Sets the block categories.
	*
	* @param categories Block categories.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { store as blocksStore, setCategories } from '@wordpress/blocks';
	* import { useSelect } from '@wordpress/data';
	* import { Button } from '@wordpress/components';
	*
	* const ExampleComponent = () => {
	*     // Retrieve the list of current categories.
	*     const blockCategories = useSelect(
	*         ( select ) => select( blocksStore ).getCategories(),
	*         []
	*     );
	*
	*     return (
	*         <Button
	*             onClick={ () => {
	*                 // Add a custom category to the existing list.
	*                 setCategories( [
	*                     ...blockCategories,
	*                     { title: 'Custom Category', slug: 'custom-category' },
	*                 ] );
	*             } }
	*         >
	*             { __( 'Add a new custom block category' ) }
	*         </Button>
	*     );
	* };
	* ```
	*/
	function setCategories(categories) {
		(0, _wordpress_data.dispatch)(store).setCategories(categories);
	}
	/**
	* Updates a category.
	*
	* @param slug     Block category slug.
	* @param category Object containing the category properties
	*                 that should be updated.
	*
	* @example
	* ```js
	* import { __ } from '@wordpress/i18n';
	* import { updateCategory } from '@wordpress/blocks';
	* import { Button } from '@wordpress/components';
	*
	* const ExampleComponent = () => {
	*     return (
	*         <Button
	*             onClick={ () => {
	*                 updateCategory( 'text', { title: __( 'Written Word' ) } );
	*             } }
	*         >
	*             { __( 'Update Text category title' ) }
	*         </Button>
	* )    ;
	* };
	* ```
	*/
	function updateCategory(slug, category) {
		(0, _wordpress_data.dispatch)(store).updateCategory(slug, category);
	}

// packages/blocks/build-module/api/templates.mjs
/**
	* Checks whether a list of blocks matches a template by comparing the block names.
	*
	* @param blocks   Block list.
	* @param template Block template.
	*
	* @return Whether the list of blocks matches a templates.
	*/
	function doBlocksMatchTemplate(blocks = [], template = []) {
		return blocks.length === template.length && template.every(([name, , innerBlocksTemplate], index) => {
			const block = blocks[index];
			return name === block.name && doBlocksMatchTemplate(block.innerBlocks, innerBlocksTemplate);
		});
	}
	const isHTMLAttribute = (attributeDefinition) => attributeDefinition?.source === "html";
	const isQueryAttribute = (attributeDefinition) => attributeDefinition?.source === "query";
	function normalizeAttributes(schema, values) {
		if (!values) return {};
		return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, normalizeAttribute(schema[key], value)]));
	}
	function normalizeAttribute(definition, value) {
		if (isHTMLAttribute(definition) && Array.isArray(value)) return (0, _wordpress_element.renderToString)(value);
		if (isQueryAttribute(definition) && value) return value.map((subValues) => {
			return normalizeAttributes(definition.query, subValues);
		});
		return value;
	}
	/**
	* Synchronize a block list with a block template.
	*
	* Synchronizing a block list with a block template means that we loop over the blocks
	* keep the block as is if it matches the block at the same position in the template
	* (If it has the same name) and if doesn't match, we create a new block based on the template.
	* Extra blocks not present in the template are removed.
	*
	* @param blocks   Block list.
	* @param template Block template.
	*
	* @return Updated Block list.
	*/
	function synchronizeBlocksWithTemplate(blocks = [], template) {
		if (!template) return blocks;
		return template.map(([name, attributes, innerBlocksTemplate], index) => {
			const block = blocks[index];
			if (block && block.name === name) {
				const innerBlocks = synchronizeBlocksWithTemplate(block.innerBlocks, innerBlocksTemplate);
				return {
					...block,
					innerBlocks
				};
			}
			const normalizedAttributes = normalizeAttributes(getBlockType(name)?.attributes ?? {}, attributes);
			const [blockName, blockAttributes] = convertLegacyBlockNameAndAttributes(name, normalizedAttributes);
			return createBlock(blockName, blockAttributes, synchronizeBlocksWithTemplate([], innerBlocksTemplate));
		});
	}

// packages/blocks/build-module/api/index.mjs
	const editableRootKey = Symbol("editableRoot");
	const privateApis = {};
	lock(privateApis, {
		isContentBlock,
		editableRootKey,
		parseRawBlock,
		applyBuiltInValidationFixes
	});

// packages/blocks/build-module/deprecated.mjs
/**
	* A Higher Order Component used to inject BlockContent using context to the
	* wrapped component.
	*
	* @deprecated
	*
	* @param OriginalComponent The component to enhance.
	* @return The same component.
	*/
	function withBlockContentContext(OriginalComponent) {
		(0, _wordpress_deprecated.default)("wp.blocks.withBlockContentContext", { since: "6.1" });
		return OriginalComponent;
	}

exports.__EXPERIMENTAL_ELEMENTS = __EXPERIMENTAL_ELEMENTS;
exports.__EXPERIMENTAL_PATHS_WITH_OVERRIDE = __EXPERIMENTAL_PATHS_WITH_OVERRIDE;
exports.__EXPERIMENTAL_STYLE_PROPERTY = __EXPERIMENTAL_STYLE_PROPERTY;
exports.__experimentalCloneSanitizedBlock = __experimentalCloneSanitizedBlock;
exports.__experimentalGetAccessibleBlockLabel = getAccessibleBlockLabel;
exports.__experimentalGetBlockAttributesNamesByRole = __experimentalGetBlockAttributesNamesByRole;
exports.__experimentalGetBlockLabel = getBlockLabel;
exports.__experimentalSanitizeBlockAttributes = __experimentalSanitizeBlockAttributes;
exports.__unstableGetBlockProps = getBlockProps;
exports.__unstableGetInnerBlocksProps = getInnerBlocksProps;
exports.__unstableSerializeAndClean = __unstableSerializeAndClean;
exports.children = children_default;
exports.cloneBlock = cloneBlock;
exports.cloneSanitizedBlock = cloneSanitizedBlock;
exports.createBlock = createBlock;
exports.createBlocksFromInnerBlocksTemplate = createBlocksFromInnerBlocksTemplate;
exports.doBlocksMatchTemplate = doBlocksMatchTemplate;
exports.findTransform = findTransform;
exports.getBlockAttributes = getBlockAttributes;
exports.getBlockAttributesNamesByRole = getBlockAttributesNamesByRole;
exports.getBlockBindingsSource = getBlockBindingsSource;
exports.getBlockBindingsSources = getBlockBindingsSources;
exports.getBlockContent = getBlockInnerHTML;
exports.getBlockDefaultClassName = getBlockDefaultClassName;
exports.getBlockFromExample = getBlockFromExample;
exports.getBlockMenuDefaultClassName = getBlockMenuDefaultClassName;
exports.getBlockSupport = getBlockSupport;
exports.getBlockTransforms = getBlockTransforms;
exports.getBlockType = getBlockType;
exports.getBlockTypes = getBlockTypes;
exports.getBlockVariations = getBlockVariations;
exports.getCategories = getCategories;
exports.getChildBlockNames = getChildBlockNames;
exports.getDefaultBlockName = getDefaultBlockName;
exports.getFreeformContentHandlerName = getFreeformContentHandlerName;
exports.getGroupingBlockName = getGroupingBlockName;
exports.getPhrasingContentSchema = deprecatedGetPhrasingContentSchema;
exports.getPossibleBlockTransformations = getPossibleBlockTransformations;
exports.getSaveContent = getSaveContent;
exports.getSaveElement = getSaveElement;
exports.getUnregisteredTypeHandlerName = getUnregisteredTypeHandlerName;
exports.hasBlockSupport = hasBlockSupport;
exports.hasChildBlocks = hasChildBlocks;
exports.hasChildBlocksWithInserterSupport = hasChildBlocksWithInserterSupport;
exports.isReusableBlock = isReusableBlock;
exports.isTemplatePart = isTemplatePart;
exports.isUnmodifiedBlock = isUnmodifiedBlock;
exports.isUnmodifiedDefaultBlock = isUnmodifiedDefaultBlock;
exports.isValidBlockContent = isValidBlockContent;
exports.isValidIcon = isValidIcon;
exports.node = node_default;
exports.normalizeIconObject = normalizeIconObject;
exports.parse = parse;
exports.parseWithAttributeSchema = parseWithAttributeSchema;
exports.pasteHandler = pasteHandler;
exports.privateApis = privateApis;
exports.rawHandler = rawHandler;
exports.registerBlockBindingsSource = registerBlockBindingsSource;
exports.registerBlockCollection = registerBlockCollection;
exports.registerBlockStyle = registerBlockStyle;
exports.registerBlockType = registerBlockType;
exports.registerBlockVariation = registerBlockVariation;
exports.sanitizeBlockAttributes = sanitizeBlockAttributes;
exports.serialize = serialize;
exports.serializeRawBlock = serializeRawBlock;
exports.setCategories = setCategories;
exports.setDefaultBlockName = setDefaultBlockName;
exports.setFreeformContentHandlerName = setFreeformContentHandlerName;
exports.setGroupingBlockName = setGroupingBlockName;
exports.setUnregisteredTypeHandlerName = setUnregisteredTypeHandlerName;
exports.store = store;
exports.switchToBlockType = switchToBlockType;
exports.synchronizeBlocksWithTemplate = synchronizeBlocksWithTemplate;
exports.unregisterBlockBindingsSource = unregisterBlockBindingsSource;
exports.unregisterBlockStyle = unregisterBlockStyle;
exports.unregisterBlockType = unregisterBlockType;
exports.unregisterBlockVariation = unregisterBlockVariation;
exports.unstable__bootstrapServerSideBlockDefinitions = unstable__bootstrapServerSideBlockDefinitions;
exports.updateCategory = updateCategory;
exports.validateBlock = validateBlock;
exports.withBlockContentContext = withBlockContentContext;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).blocks = exports;
return exports;
})({}, window.wp.data, window.wp.i18n, window.wp.element, window.wp.dom, window.wp.richText, window.wp.deprecated, window.wp.warning, window.wp.privateApis, window.wp.hooks, window.wp.blockSerializationDefaultParser, window.wp.autop, window.wp.isShallowEqual, window.ReactJSXRuntime, window.wp.htmlEntities, window.wp.shortcode, window.wp.blob);
//# sourceMappingURL=index.js.map