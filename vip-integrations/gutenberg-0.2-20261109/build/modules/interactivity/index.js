// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
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

// node_modules/.store/preact@10.29.1-Z6mqfktFgyEx3dIpXJAnhg/node_modules/preact/dist/preact.module.js
function m$2(n, l) {
	for (var u in l) n[u] = l[u];
	return n;
}
function b$2(n) {
	n && n.parentNode && n.parentNode.removeChild(n);
}
function k$1(l, u, t) {
	var i, r, o, e = {};
	for (o in u) "key" == o ? i = u[o] : "ref" == o ? r = u[o] : e[o] = u[o];
	if (arguments.length > 2 && (e.children = arguments.length > 3 ? n.call(arguments, 2) : t), "function" == typeof l && null != l.defaultProps) for (o in l.defaultProps) void 0 === e[o] && (e[o] = l.defaultProps[o]);
	return x$1(l, e, i, r, null);
}
function x$1(n, t, i, r, o) {
	var e = {
		type: n,
		props: t,
		key: i,
		ref: r,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: void 0,
		__v: null == o ? ++u$3 : o,
		__i: -1,
		__u: 0
	};
	return null == o && null != l$4.vnode && l$4.vnode(e), e;
}
function S(n) {
	return n.children;
}
function C$1(n, l) {
	this.props = n, this.context = l;
}
function $(n, l) {
	if (null == l) return n.__ ? $(n.__, n.__i + 1) : null;
	for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
	return "function" == typeof n.type ? $(n) : null;
}
function I(n) {
	if (n.__P && n.__d) {
		var u = n.__v, t = u.__e, i = [], r = [], o = m$2({}, u);
		o.__v = u.__v + 1, l$4.vnode && l$4.vnode(o), q$1(n.__P, o, u, n.__n, n.__P.namespaceURI, 32 & u.__u ? [t] : null, i, null == t ? $(u) : t, !!(32 & u.__u), r), o.__v = u.__v, o.__.__k[o.__i] = o, D$1(i, o, r), u.__e = u.__ = null, o.__e != t && P(o);
	}
}
function P(n) {
	if (null != (n = n.__) && null != n.__c) return n.__e = n.__c.base = null, n.__k.some(function(l) {
		if (null != l && null != l.__e) return n.__e = n.__c.base = l.__e;
	}), P(n);
}
function A$1(n) {
	(!n.__d && (n.__d = !0) && i$4.push(n) && !H.__r++ || r$3 != l$4.debounceRendering) && ((r$3 = l$4.debounceRendering) || o$2)(H);
}
function H() {
	try {
		for (var n, l = 1; i$4.length;) i$4.length > l && i$4.sort(e$2), n = i$4.shift(), l = i$4.length, I(n);
	} finally {
		i$4.length = H.__r = 0;
	}
}
function L(n, l, u, t, i, r, o, e, f, c, s) {
	var a, h, p, v, y, _, g, m = t && t.__k || w$3, b = l.length;
	for (f = T$1(u, l, m, f, b), a = 0; a < b; a++) null != (p = u.__k[a]) && (h = -1 != p.__i && m[p.__i] || d$4, p.__i = a, _ = q$1(n, p, h, i, r, o, e, f, c, s), v = p.__e, p.ref && h.ref != p.ref && (h.ref && J(h.ref, null, p), s.push(p.ref, p.__c || v, p)), null == y && null != v && (y = v), (g = !!(4 & p.__u)) || h.__k === p.__k ? (f = j$1(p, f, n, g), g && h.__e && (h.__e = null)) : "function" == typeof p.type && void 0 !== _ ? f = _ : v && (f = v.nextSibling), p.__u &= -7);
	return u.__e = y, f;
}
function T$1(n, l, u, t, i) {
	var r, o, e, f, c, s = u.length, a = s, h = 0;
	for (n.__k = new Array(i), r = 0; r < i; r++) null != (o = l[r]) && "boolean" != typeof o && "function" != typeof o ? ("string" == typeof o || "number" == typeof o || "bigint" == typeof o || o.constructor == String ? o = n.__k[r] = x$1(null, o, null, null, null) : g$1(o) ? o = n.__k[r] = x$1(S, { children: o }, null, null, null) : void 0 === o.constructor && o.__b > 0 ? o = n.__k[r] = x$1(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : n.__k[r] = o, f = r + h, o.__ = n, o.__b = n.__b + 1, e = null, -1 != (c = o.__i = O(o, u, f, a)) && (a--, (e = u[c]) && (e.__u |= 2)), null == e || null == e.__v ? (-1 == c && (i > s ? h-- : i < s && h++), "function" != typeof o.type && (o.__u |= 4)) : c != f && (c == f - 1 ? h-- : c == f + 1 ? h++ : (c > f ? h-- : h++, o.__u |= 4))) : n.__k[r] = null;
	if (a) for (r = 0; r < s; r++) null != (e = u[r]) && 0 == (2 & e.__u) && (e.__e == t && (t = $(e)), K(e, e));
	return t;
}
function j$1(n, l, u, t) {
	var i, r;
	if ("function" == typeof n.type) {
		for (i = n.__k, r = 0; i && r < i.length; r++) i[r] && (i[r].__ = n, l = j$1(i[r], l, u, t));
		return l;
	}
	n.__e != l && (t && (l && n.type && !l.parentNode && (l = $(n)), u.insertBefore(n.__e, l || null)), l = n.__e);
	do
		l = l && l.nextSibling;
	while (null != l && 8 == l.nodeType);
	return l;
}
function O(n, l, u, t) {
	var i, r, o, e = n.key, f = n.type, c = l[u], s = null != c && 0 == (2 & c.__u);
	if (null === c && null == e || s && e == c.key && f == c.type) return u;
	if (t > (s ? 1 : 0)) {
		for (i = u - 1, r = u + 1; i >= 0 || r < l.length;) if (null != (c = l[o = i >= 0 ? i-- : r++]) && 0 == (2 & c.__u) && e == c.key && f == c.type) return o;
	}
	return -1;
}
function z$1(n, l, u) {
	"-" == l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || _$3.test(l) ? u : u + "px";
}
function N(n, l, u, t, i) {
	var r, o;
	n: if ("style" == l) if ("string" == typeof u) n.style.cssText = u;
	else {
		if ("string" == typeof t && (n.style.cssText = t = ""), t) for (l in t) u && l in u || z$1(n.style, l, "");
		if (u) for (l in u) t && u[l] == t[l] || z$1(n.style, l, u[l]);
	}
	else if ("o" == l[0] && "n" == l[1]) r = l != (l = l.replace(a$3, "$1")), o = l.toLowerCase(), l = o in n || "onFocusOut" == l || "onFocusIn" == l ? o.slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + r] = u, u ? t ? u[s$4] = t[s$4] : (u[s$4] = h$3, n.addEventListener(l, r ? v$4 : p$4, r)) : n.removeEventListener(l, r ? v$4 : p$4, r);
	else {
		if ("http://www.w3.org/2000/svg" == i) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if ("width" != l && "height" != l && "href" != l && "list" != l && "form" != l && "tabIndex" != l && "download" != l && "rowSpan" != l && "colSpan" != l && "role" != l && "popover" != l && l in n) try {
			n[l] = null == u ? "" : u;
			break n;
		} catch (n) {}
		"function" == typeof u || (null == u || !1 === u && "-" != l[4] ? n.removeAttribute(l) : n.setAttribute(l, "popover" == l && 1 == u ? "" : u));
	}
}
function V(n) {
	return function(u) {
		if (this.l) {
			var t = this.l[u.type + n];
			if (null == u[c$3]) u[c$3] = h$3++;
			else if (u[c$3] < t[s$4]) return;
			return t(l$4.event ? l$4.event(u) : u);
		}
	};
}
function q$1(n, u, t, i, r, o, e, f, c, s) {
	var a, h, p, v, y, d, _, k, x, M, $, I, P, A, H, T = u.type;
	if (void 0 !== u.constructor) return null;
	128 & t.__u && (c = !!(32 & t.__u), o = [f = u.__e = t.__e]), (a = l$4.__b) && a(u);
	n: if ("function" == typeof T) try {
		if (k = u.props, x = T.prototype && T.prototype.render, M = (a = T.contextType) && i[a.__c], $ = a ? M ? M.props.value : a.__ : i, t.__c ? _ = (h = u.__c = t.__c).__ = h.__E : (x ? u.__c = h = new T(k, $) : (u.__c = h = new C$1(k, $), h.constructor = T, h.render = Q), M && M.sub(h), h.state || (h.state = {}), h.__n = i, p = h.__d = !0, h.__h = [], h._sb = []), x && null == h.__s && (h.__s = h.state), x && null != T.getDerivedStateFromProps && (h.__s == h.state && (h.__s = m$2({}, h.__s)), m$2(h.__s, T.getDerivedStateFromProps(k, h.__s))), v = h.props, y = h.state, h.__v = u, p) x && null == T.getDerivedStateFromProps && null != h.componentWillMount && h.componentWillMount(), x && null != h.componentDidMount && h.__h.push(h.componentDidMount);
		else {
			if (x && null == T.getDerivedStateFromProps && k !== v && null != h.componentWillReceiveProps && h.componentWillReceiveProps(k, $), u.__v == t.__v || !h.__e && null != h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(k, h.__s, $)) {
				u.__v != t.__v && (h.props = k, h.state = h.__s, h.__d = !1), u.__e = t.__e, u.__k = t.__k, u.__k.some(function(n) {
					n && (n.__ = u);
				}), w$3.push.apply(h.__h, h._sb), h._sb = [], h.__h.length && e.push(h);
				break n;
			}
			null != h.componentWillUpdate && h.componentWillUpdate(k, h.__s, $), x && null != h.componentDidUpdate && h.__h.push(function() {
				h.componentDidUpdate(v, y, d);
			});
		}
		if (h.context = $, h.props = k, h.__P = n, h.__e = !1, I = l$4.__r, P = 0, x) h.state = h.__s, h.__d = !1, I && I(u), a = h.render(h.props, h.state, h.context), w$3.push.apply(h.__h, h._sb), h._sb = [];
		else do
			h.__d = !1, I && I(u), a = h.render(h.props, h.state, h.context), h.state = h.__s;
		while (h.__d && ++P < 25);
		h.state = h.__s, null != h.getChildContext && (i = m$2(m$2({}, i), h.getChildContext())), x && !p && null != h.getSnapshotBeforeUpdate && (d = h.getSnapshotBeforeUpdate(v, y)), A = null != a && a.type === S && null == a.key ? E$1(a.props.children) : a, f = L(n, g$1(A) ? A : [A], u, t, i, r, o, e, f, c, s), h.base = u.__e, u.__u &= -161, h.__h.length && e.push(h), _ && (h.__E = h.__ = null);
	} catch (n) {
		if (u.__v = null, c || null != o) if (n.then) {
			for (u.__u |= c ? 160 : 128; f && 8 == f.nodeType && f.nextSibling;) f = f.nextSibling;
			o[o.indexOf(f)] = null, u.__e = f;
		} else {
			for (H = o.length; H--;) b$2(o[H]);
			B$1(u);
		}
		else u.__e = t.__e, u.__k = t.__k, n.then || B$1(u);
		l$4.__e(n, u, t);
	}
	else null == o && u.__v == t.__v ? (u.__k = t.__k, u.__e = t.__e) : f = u.__e = G(t.__e, u, t, i, r, o, e, c, s);
	return (a = l$4.diffed) && a(u), 128 & u.__u ? void 0 : f;
}
function B$1(n) {
	n && (n.__c && (n.__c.__e = !0), n.__k && n.__k.some(B$1));
}
function D$1(n, u, t) {
	for (var i = 0; i < t.length; i++) J(t[i], t[++i], t[++i]);
	l$4.__c && l$4.__c(u, n), n.some(function(u) {
		try {
			n = u.__h, u.__h = [], n.some(function(n) {
				n.call(u);
			});
		} catch (n) {
			l$4.__e(n, u.__v);
		}
	});
}
function E$1(n) {
	return "object" != typeof n || null == n || n.__b > 0 ? n : g$1(n) ? n.map(E$1) : m$2({}, n);
}
function G(u, t, i, r, o, e, f, c, s) {
	var a, h, p, v, y, w, _, m = i.props || d$4, k = t.props, x = t.type;
	if ("svg" == x ? o = "http://www.w3.org/2000/svg" : "math" == x ? o = "http://www.w3.org/1998/Math/MathML" : o || (o = "http://www.w3.org/1999/xhtml"), null != e) {
		for (a = 0; a < e.length; a++) if ((y = e[a]) && "setAttribute" in y == !!x && (x ? y.localName == x : 3 == y.nodeType)) {
			u = y, e[a] = null;
			break;
		}
	}
	if (null == u) {
		if (null == x) return document.createTextNode(k);
		u = document.createElementNS(o, x, k.is && k), c && (l$4.__m && l$4.__m(t, e), c = !1), e = null;
	}
	if (null == x) m === k || c && u.data == k || (u.data = k);
	else {
		if (e = e && n.call(u.childNodes), !c && null != e) for (m = {}, a = 0; a < u.attributes.length; a++) m[(y = u.attributes[a]).name] = y.value;
		for (a in m) y = m[a], "dangerouslySetInnerHTML" == a ? p = y : "children" == a || a in k || "value" == a && "defaultValue" in k || "checked" == a && "defaultChecked" in k || N(u, a, null, y, o);
		for (a in k) y = k[a], "children" == a ? v = y : "dangerouslySetInnerHTML" == a ? h = y : "value" == a ? w = y : "checked" == a ? _ = y : c && "function" != typeof y || m[a] === y || N(u, a, y, m[a], o);
		if (h) c || p && (h.__html == p.__html || h.__html == u.innerHTML) || (u.innerHTML = h.__html), t.__k = [];
		else if (p && (u.innerHTML = ""), L("template" == t.type ? u.content : u, g$1(v) ? v : [v], t, i, r, "foreignObject" == x ? "http://www.w3.org/1999/xhtml" : o, e, f, e ? e[0] : i.__k && $(i, 0), c, s), null != e) for (a = e.length; a--;) b$2(e[a]);
		c || (a = "value", "progress" == x && null == w ? u.removeAttribute("value") : null != w && (w !== u[a] || "progress" == x && !w || "option" == x && w != m[a]) && N(u, a, w, m[a], o), a = "checked", null != _ && _ != u[a] && N(u, a, _, m[a], o));
	}
	return u;
}
function J(n, u, t) {
	try {
		if ("function" == typeof n) {
			var i = "function" == typeof n.__u;
			i && n.__u(), i && null == u || (n.__u = n(u));
		} else n.current = u;
	} catch (n) {
		l$4.__e(n, t);
	}
}
function K(n, u, t) {
	var i, r;
	if (l$4.unmount && l$4.unmount(n), (i = n.ref) && (i.current && i.current != n.__e || J(i, null, u)), null != (i = n.__c)) {
		if (i.componentWillUnmount) try {
			i.componentWillUnmount();
		} catch (n) {
			l$4.__e(n, u);
		}
		i.base = i.__P = null;
	}
	if (i = n.__k) for (r = 0; r < i.length; r++) i[r] && K(i[r], u, t || "function" != typeof n.type);
	t || b$2(n.__e), n.__c = n.__ = n.__e = void 0;
}
function Q(n, l, u) {
	return this.constructor(n, u);
}
function R(u, t, i) {
	var r, o, e, f;
	t == document && (t = document.documentElement), l$4.__ && l$4.__(u, t), o = (r = "function" == typeof i) ? null : i && i.__k || t.__k, e = [], f = [], q$1(t, u = (!r && i || t).__k = k$1(S, null, [u]), o || d$4, d$4, t.namespaceURI, !r && i ? [i] : o ? null : t.firstChild ? n.call(t.childNodes) : null, e, !r && i ? i : o ? o.__e : t.firstChild, r, f), D$1(e, u, f);
}
function U(n, l) {
	R(n, l, U);
}
function W(l, u, t) {
	var i, r, o, e, f = m$2({}, l.props);
	for (o in l.type && l.type.defaultProps && (e = l.type.defaultProps), u) "key" == o ? i = u[o] : "ref" == o ? r = u[o] : f[o] = void 0 === u[o] && null != e ? e[o] : u[o];
	return arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : t), x$1(l.type, f, i || l.key, r || l.ref, null);
}
function X(n) {
	function l(n) {
		var u, t;
		return this.getChildContext || (u = /* @__PURE__ */ new Set(), (t = {})[l.__c] = this, this.getChildContext = function() {
			return t;
		}, this.componentWillUnmount = function() {
			u = null;
		}, this.shouldComponentUpdate = function(n) {
			this.props.value != n.value && u.forEach(function(n) {
				n.__e = !0, A$1(n);
			});
		}, this.sub = function(n) {
			u.add(n);
			var l = n.componentWillUnmount;
			n.componentWillUnmount = function() {
				u && u.delete(n), l && l.call(n);
			};
		}), n.children;
	}
	return l.__c = "__cC" + y$3++, l.__ = n, l.Provider = l.__l = (l.Consumer = function(n, l) {
		return n.children(l);
	}).contextType = l, l;
}
var n, l$4, u$3, t$3, i$4, r$3, o$2, e$2, f$3, c$3, s$4, a$3, h$3, p$4, v$4, y$3, d$4, w$3, _$3, g$1;
var init_preact_module = __esmMin((() => {
	;
	;
	;
	;
	;
	;
	;
	;
	;
	;
	;
	;
	;
	;
	;
	;
	d$4 = {};
	w$3 = [];
	_$3 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
	g$1 = Array.isArray;
	n = w$3.slice, l$4 = { __e: function(n, l, u, t) {
		for (var i, r, o; l = l.__;) if ((i = l.__c) && !i.__) try {
			if ((r = i.constructor) && null != r.getDerivedStateFromError && (i.setState(r.getDerivedStateFromError(n)), o = i.__d), null != i.componentDidCatch && (i.componentDidCatch(n, t || {}), o = i.__d), o) return i.__E = i;
		} catch (l) {
			n = l;
		}
		throw n;
	} }, u$3 = 0, t$3 = function(n) {
		return null != n && void 0 === n.constructor;
	}, C$1.prototype.setState = function(n, l) {
		var u = null != this.__s && this.__s != this.state ? this.__s : this.__s = m$2({}, this.state);
		"function" == typeof n && (n = n(m$2({}, u), this.props)), n && m$2(u, n), null != n && this.__v && (l && this._sb.push(l), A$1(this));
	}, C$1.prototype.forceUpdate = function(n) {
		this.__v && (this.__e = !0, n && this.__h.push(n), A$1(this));
	}, C$1.prototype.render = S, i$4 = [], o$2 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$2 = function(n, l) {
		return n.__v.__b - l.__v.__b;
	}, H.__r = 0, f$3 = Math.random().toString(8), c$3 = "__d" + f$3, s$4 = "__a" + f$3, a$3 = /(PointerCapture)$|Capture$/i, h$3 = 0, p$4 = V(!1), v$4 = V(!0), y$3 = 0;
}));

// node_modules/.store/preact@10.29.1-Z6mqfktFgyEx3dIpXJAnhg/node_modules/preact/hooks/dist/hooks.module.js
init_preact_module();
var t$2;
var r$2;
var u$2;
var i$3;
var o$1 = 0;
var f$2 = [];
var c$2 = l$4;
var e$1 = c$2.__b;
var a$2 = c$2.__r;
var v$3 = c$2.diffed;
var l$3 = c$2.__c;
var m$1 = c$2.unmount;
var s$3 = c$2.__;
function p$3(n, t) {
	c$2.__h && c$2.__h(r$2, n, o$1 || t), o$1 = 0;
	var u = r$2.__H || (r$2.__H = {
		__: [],
		__h: []
	});
	return n >= u.__.length && u.__.push({}), u.__[n];
}
function d(n) {
	return o$1 = 1, h$2(D, n);
}
function h$2(n, u, i) {
	var o = p$3(t$2++, 2);
	if (o.t = n, !o.__c && (o.__ = [i ? i(u) : D(void 0, u), function(n) {
		var t = o.__N ? o.__N[0] : o.__[0], r = o.t(t, n);
		t !== r && (o.__N = [r, o.__[1]], o.__c.setState({}));
	}], o.__c = r$2, !r$2.__f)) {
		var f = function(n, t, r) {
			if (!o.__c.__H) return !0;
			var u = o.__c.__H.__.filter(function(n) {
				return n.__c;
			});
			if (u.every(function(n) {
				return !n.__N;
			})) return !c || c.call(this, n, t, r);
			var i = o.__c.props !== n;
			return u.some(function(n) {
				if (n.__N) {
					var t = n.__[0];
					n.__ = n.__N, n.__N = void 0, t !== n.__[0] && (i = !0);
				}
			}), c && c.call(this, n, t, r) || i;
		};
		r$2.__f = !0;
		var c = r$2.shouldComponentUpdate, e = r$2.componentWillUpdate;
		r$2.componentWillUpdate = function(n, t, r) {
			if (this.__e) {
				var u = c;
				c = void 0, f(n, t, r), c = u;
			}
			e && e.call(this, n, t, r);
		}, r$2.shouldComponentUpdate = f;
	}
	return o.__N || o.__;
}
function y$2(n, u) {
	var i = p$3(t$2++, 3);
	!c$2.__s && C(i.__H, u) && (i.__ = n, i.u = u, r$2.__H.__h.push(i));
}
function _$2(n, u) {
	var i = p$3(t$2++, 4);
	!c$2.__s && C(i.__H, u) && (i.__ = n, i.u = u, r$2.__h.push(i));
}
function A(n) {
	return o$1 = 5, T(function() {
		return { current: n };
	}, []);
}
function T(n, r) {
	var u = p$3(t$2++, 7);
	return C(u.__H, r) && (u.__ = n(), u.__H = r, u.__h = n), u.__;
}
function q(n, t) {
	return o$1 = 8, T(function() {
		return n;
	}, t);
}
function x(n) {
	var u = r$2.context[n.__c], i = p$3(t$2++, 9);
	return i.c = n, u ? (i.__ ?? (i.__ = !0, u.sub(r$2)), u.props.value) : n.__;
}
function j() {
	for (var n; n = f$2.shift();) {
		var t = n.__H;
		if (n.__P && t) try {
			t.__h.some(z), t.__h.some(B), t.__h = [];
		} catch (r) {
			t.__h = [], c$2.__e(r, n.__v);
		}
	}
}
c$2.__b = function(n) {
	r$2 = null, e$1 && e$1(n);
}, c$2.__ = function(n, t) {
	n && t.__k && t.__k.__m && (n.__m = t.__k.__m), s$3 && s$3(n, t);
}, c$2.__r = function(n) {
	a$2 && a$2(n), t$2 = 0;
	var i = (r$2 = n.__c).__H;
	i && (u$2 === r$2 ? (i.__h = [], r$2.__h = [], i.__.some(function(n) {
		n.__N && (n.__ = n.__N), n.u = n.__N = void 0;
	})) : (i.__h.some(z), i.__h.some(B), i.__h = [], t$2 = 0)), u$2 = r$2;
}, c$2.diffed = function(n) {
	v$3 && v$3(n);
	var t = n.__c;
	t && t.__H && (t.__H.__h.length && (1 !== f$2.push(t) && i$3 === c$2.requestAnimationFrame || ((i$3 = c$2.requestAnimationFrame) || w$2)(j)), t.__H.__.some(function(n) {
		n.u && (n.__H = n.u), n.u = void 0;
	})), u$2 = r$2 = null;
}, c$2.__c = function(n, t) {
	t.some(function(n) {
		try {
			n.__h.some(z), n.__h = n.__h.filter(function(n) {
				return !n.__ || B(n);
			});
		} catch (r) {
			t.some(function(n) {
				n.__h && (n.__h = []);
			}), t = [], c$2.__e(r, n.__v);
		}
	}), l$3 && l$3(n, t);
}, c$2.unmount = function(n) {
	m$1 && m$1(n);
	var t, r = n.__c;
	r && r.__H && (r.__H.__.some(function(n) {
		try {
			z(n);
		} catch (n) {
			t = n;
		}
	}), r.__H = void 0, t && c$2.__e(t, r.__v));
};
var k = "function" == typeof requestAnimationFrame;
function w$2(n) {
	var t, r = function() {
		clearTimeout(u), k && cancelAnimationFrame(t), setTimeout(n);
	}, u = setTimeout(r, 35);
	k && (t = requestAnimationFrame(r));
}
function z(n) {
	var t = r$2, u = n.__c;
	"function" == typeof u && (n.__c = void 0, u()), r$2 = t;
}
function B(n) {
	var t = r$2;
	n.__c = n.__(), r$2 = t;
}
function C(n, t) {
	return !n || n.length !== t.length || t.some(function(t, r) {
		return t !== n[r];
	});
}
function D(n, t) {
	return "function" == typeof t ? t(n) : t;
}

// node_modules/.store/@preact/signals-core@1.8.0-YrJJPniKXpf_juG_JvRhXw/node_modules/@preact/signals-core/dist/signals-core.module.js
var i$2 = Symbol.for("preact-signals");
function t$1() {
	if (!(s$2 > 1)) {
		var i, t = !1;
		while (void 0 !== h$1) {
			var r = h$1;
			h$1 = void 0;
			f$1++;
			while (void 0 !== r) {
				var o = r.o;
				r.o = void 0;
				r.f &= -3;
				if (!(8 & r.f) && c$1(r)) try {
					r.c();
				} catch (r) {
					if (!t) {
						i = r;
						t = !0;
					}
				}
				r = o;
			}
		}
		f$1 = 0;
		s$2--;
		if (t) throw i;
	} else s$2--;
}
function r$1(i) {
	if (s$2 > 0) return i();
	s$2++;
	try {
		return i();
	} finally {
		t$1();
	}
}
var o = void 0;
var h$1 = void 0;
var s$2 = 0;
var f$1 = 0;
var v$2 = 0;
function e(i) {
	if (void 0 !== o) {
		var t = i.n;
		if (void 0 === t || t.t !== o) {
			t = {
				i: 0,
				S: i,
				p: o.s,
				n: void 0,
				t: o,
				e: void 0,
				x: void 0,
				r: t
			};
			if (void 0 !== o.s) o.s.n = t;
			o.s = t;
			i.n = t;
			if (32 & o.f) i.S(t);
			return t;
		} else if (-1 === t.i) {
			t.i = 0;
			if (void 0 !== t.n) {
				t.n.p = t.p;
				if (void 0 !== t.p) t.p.n = t.n;
				t.p = o.s;
				t.n = void 0;
				o.s.n = t;
				o.s = t;
			}
			return t;
		}
	}
}
function u$1(i) {
	this.v = i;
	this.i = 0;
	this.n = void 0;
	this.t = void 0;
}
u$1.prototype.brand = i$2;
u$1.prototype.h = function() {
	return !0;
};
u$1.prototype.S = function(i) {
	if (this.t !== i && void 0 === i.e) {
		i.x = this.t;
		if (void 0 !== this.t) this.t.e = i;
		this.t = i;
	}
};
u$1.prototype.U = function(i) {
	if (void 0 !== this.t) {
		var t = i.e, r = i.x;
		if (void 0 !== t) {
			t.x = r;
			i.e = void 0;
		}
		if (void 0 !== r) {
			r.e = t;
			i.x = void 0;
		}
		if (i === this.t) this.t = r;
	}
};
u$1.prototype.subscribe = function(i) {
	var t = this;
	return E(function() {
		var r = t.value, n = o;
		o = void 0;
		try {
			i(r);
		} finally {
			o = n;
		}
	});
};
u$1.prototype.valueOf = function() {
	return this.value;
};
u$1.prototype.toString = function() {
	return this.value + "";
};
u$1.prototype.toJSON = function() {
	return this.value;
};
u$1.prototype.peek = function() {
	var i = o;
	o = void 0;
	try {
		return this.value;
	} finally {
		o = i;
	}
};
Object.defineProperty(u$1.prototype, "value", {
	get: function() {
		var i = e(this);
		if (void 0 !== i) i.i = this.i;
		return this.v;
	},
	set: function(i) {
		if (i !== this.v) {
			if (f$1 > 100) throw new Error("Cycle detected");
			this.v = i;
			this.i++;
			v$2++;
			s$2++;
			try {
				for (var r = this.t; void 0 !== r; r = r.x) r.t.N();
			} finally {
				t$1();
			}
		}
	}
});
function d$3(i) {
	return new u$1(i);
}
function c$1(i) {
	for (var t = i.s; void 0 !== t; t = t.n) if (t.S.i !== t.i || !t.S.h() || t.S.i !== t.i) return !0;
	return !1;
}
function a$1(i) {
	for (var t = i.s; void 0 !== t; t = t.n) {
		var r = t.S.n;
		if (void 0 !== r) t.r = r;
		t.S.n = t;
		t.i = -1;
		if (void 0 === t.n) {
			i.s = t;
			break;
		}
	}
}
function l$2(i) {
	var t = i.s, r = void 0;
	while (void 0 !== t) {
		var o = t.p;
		if (-1 === t.i) {
			t.S.U(t);
			if (void 0 !== o) o.n = t.n;
			if (void 0 !== t.n) t.n.p = o;
		} else r = t;
		t.S.n = t.r;
		if (void 0 !== t.r) t.r = void 0;
		t = o;
	}
	i.s = r;
}
function y$1(i) {
	u$1.call(this, void 0);
	this.x = i;
	this.s = void 0;
	this.g = v$2 - 1;
	this.f = 4;
}
(y$1.prototype = new u$1()).h = function() {
	this.f &= -3;
	if (1 & this.f) return !1;
	if (32 == (36 & this.f)) return !0;
	this.f &= -5;
	if (this.g === v$2) return !0;
	this.g = v$2;
	this.f |= 1;
	if (this.i > 0 && !c$1(this)) {
		this.f &= -2;
		return !0;
	}
	var i = o;
	try {
		a$1(this);
		o = this;
		var t = this.x();
		if (16 & this.f || this.v !== t || 0 === this.i) {
			this.v = t;
			this.f &= -17;
			this.i++;
		}
	} catch (i) {
		this.v = i;
		this.f |= 16;
		this.i++;
	}
	o = i;
	l$2(this);
	this.f &= -2;
	return !0;
};
y$1.prototype.S = function(i) {
	if (void 0 === this.t) {
		this.f |= 36;
		for (var t = this.s; void 0 !== t; t = t.n) t.S.S(t);
	}
	u$1.prototype.S.call(this, i);
};
y$1.prototype.U = function(i) {
	if (void 0 !== this.t) {
		u$1.prototype.U.call(this, i);
		if (void 0 === this.t) {
			this.f &= -33;
			for (var t = this.s; void 0 !== t; t = t.n) t.S.U(t);
		}
	}
};
y$1.prototype.N = function() {
	if (!(2 & this.f)) {
		this.f |= 6;
		for (var i = this.t; void 0 !== i; i = i.x) i.t.N();
	}
};
Object.defineProperty(y$1.prototype, "value", { get: function() {
	if (1 & this.f) throw new Error("Cycle detected");
	var i = e(this);
	this.h();
	if (void 0 !== i) i.i = this.i;
	if (16 & this.f) throw this.v;
	return this.v;
} });
function w$1(i) {
	return new y$1(i);
}
function _$1(i) {
	var r = i.u;
	i.u = void 0;
	if ("function" == typeof r) {
		s$2++;
		var n = o;
		o = void 0;
		try {
			r();
		} catch (t) {
			i.f &= -2;
			i.f |= 8;
			g(i);
			throw t;
		} finally {
			o = n;
			t$1();
		}
	}
}
function g(i) {
	for (var t = i.s; void 0 !== t; t = t.n) t.S.U(t);
	i.x = void 0;
	i.s = void 0;
	_$1(i);
}
function p$2(i) {
	if (o !== this) throw new Error("Out-of-order effect");
	l$2(this);
	o = i;
	this.f &= -2;
	if (8 & this.f) g(this);
	t$1();
}
function b$1(i) {
	this.x = i;
	this.u = void 0;
	this.s = void 0;
	this.o = void 0;
	this.f = 32;
}
b$1.prototype.c = function() {
	var i = this.S();
	try {
		if (8 & this.f) return;
		if (void 0 === this.x) return;
		var t = this.x();
		if ("function" == typeof t) this.u = t;
	} finally {
		i();
	}
};
b$1.prototype.S = function() {
	if (1 & this.f) throw new Error("Cycle detected");
	this.f |= 1;
	this.f &= -9;
	_$1(this);
	a$1(this);
	s$2++;
	var i = o;
	o = this;
	return p$2.bind(this, i);
};
b$1.prototype.N = function() {
	if (!(2 & this.f)) {
		this.f |= 2;
		this.o = h$1;
		h$1 = this;
	}
};
b$1.prototype.d = function() {
	this.f |= 8;
	if (!(1 & this.f)) g(this);
};
function E(i) {
	var t = new b$1(i);
	try {
		t.c();
	} catch (i) {
		t.d();
		throw i;
	}
	return t.d.bind(t);
}

// node_modules/.store/@preact/signals@1.3.0-z_ppW6levm_l-xtsxo7hFg/node_modules/@preact/signals/dist/signals.module.js
init_preact_module();
var v$1;
var s$1;
function l$1(n, i) {
	l$4[n] = i.bind(null, l$4[n] || function() {});
}
function d$2(n) {
	if (s$1) s$1();
	s$1 = n && n.S();
}
function p$1(n) {
	var r = this, f = n.data, o = useSignal(f);
	o.value = f;
	var e = T(function() {
		var n = r.__v;
		while (n = n.__) if (n.__c) {
			n.__c.__$f |= 4;
			break;
		}
		r.__$u.c = function() {
			var n;
			if (!t$3(e.peek()) && 3 === (null == (n = r.base) ? void 0 : n.nodeType)) r.base.data = e.peek();
			else {
				r.__$f |= 1;
				r.setState({});
			}
		};
		return w$1(function() {
			var n = o.value.value;
			return 0 === n ? 0 : !0 === n ? "" : n || "";
		});
	}, []);
	return e.value;
}
p$1.displayName = "_st";
Object.defineProperties(u$1.prototype, {
	constructor: {
		configurable: !0,
		value: void 0
	},
	type: {
		configurable: !0,
		value: p$1
	},
	props: {
		configurable: !0,
		get: function() {
			return { data: this };
		}
	},
	__b: {
		configurable: !0,
		value: 1
	}
});
l$1("__b", function(n, r) {
	if ("string" == typeof r.type) {
		var i, t = r.props;
		for (var f in t) if ("children" !== f) {
			var o = t[f];
			if (o instanceof u$1) {
				if (!i) r.__np = i = {};
				i[f] = o;
				t[f] = o.peek();
			}
		}
	}
	n(r);
});
l$1("__r", function(n, r) {
	d$2();
	var i, t = r.__c;
	if (t) {
		t.__$f &= -2;
		if (void 0 === (i = t.__$u)) t.__$u = i = function(n) {
			var r;
			E(function() {
				r = this;
			});
			r.c = function() {
				t.__$f |= 1;
				t.setState({});
			};
			return r;
		}();
	}
	v$1 = t;
	d$2(i);
	n(r);
});
l$1("__e", function(n, r, i, t) {
	d$2();
	v$1 = void 0;
	n(r, i, t);
});
l$1("diffed", function(n, r) {
	d$2();
	v$1 = void 0;
	var i;
	if ("string" == typeof r.type && (i = r.__e)) {
		var t = r.__np, f = r.props;
		if (t) {
			var o = i.U;
			if (o) for (var e in o) {
				var u = o[e];
				if (void 0 !== u && !(e in t)) {
					u.d();
					o[e] = void 0;
				}
			}
			else i.U = o = {};
			for (var a in t) {
				var c = o[a], s = t[a];
				if (void 0 === c) {
					c = _(i, a, s, f);
					o[a] = c;
				} else c.o(s, f);
			}
		}
	}
	n(r);
});
function _(n, r, i, t) {
	var f = r in n && void 0 === n.ownerSVGElement, o = d$3(i);
	return {
		o: function(n, r) {
			o.value = n;
			t = r;
		},
		d: E(function() {
			var i = o.value.value;
			if (t[r] !== i) {
				t[r] = i;
				if (f) n[r] = i;
				else if (i) n.setAttribute(r, i);
				else n.removeAttribute(r);
			}
		})
	};
}
l$1("unmount", function(n, r) {
	if ("string" == typeof r.type) {
		var i = r.__e;
		if (i) {
			var t = i.U;
			if (t) {
				i.U = void 0;
				for (var f in t) {
					var o = t[f];
					if (o) o.d();
				}
			}
		}
	} else {
		var e = r.__c;
		if (e) {
			var u = e.__$u;
			if (u) {
				e.__$u = void 0;
				u.d();
			}
		}
	}
	n(r);
});
l$1("__h", function(n, r, i, t) {
	if (t < 3 || 9 === t) r.__$f |= 2;
	n(r, i, t);
});
C$1.prototype.shouldComponentUpdate = function(n, r) {
	var i = this.__$u;
	if (!(i && void 0 !== i.s || 4 & this.__$f)) return !0;
	if (3 & this.__$f) return !0;
	for (var t in r) return !0;
	for (var f in n) if ("__source" !== f && n[f] !== this.props[f]) return !0;
	for (var o in this.props) if (!(o in n)) return !0;
	return !1;
};
function useSignal(n) {
	return T(function() {
		return d$3(n);
	}, []);
}

// packages/interactivity/build-module/proxies/registry.mjs
/**
* Proxies for each object.
*/
const objToProxy = /* @__PURE__ */ new WeakMap();
const proxyToObj = /* @__PURE__ */ new WeakMap();
/**
* Namespaces for each created proxy.
*/
const proxyToNs = /* @__PURE__ */ new WeakMap();
/**
* Object types that can be proxied.
*/
const supported = /* @__PURE__ */ new Set([Object, Array]);
/**
* Returns a proxy to the passed object with the given handlers, assigning the
* specified namespace to it. If a proxy for the passed object was created
* before, that proxy is returned.
*
* @param namespace The namespace that will be associated to this proxy.
* @param obj       The object to proxify.
* @param handlers  Handlers that the proxy will use.
*
* @throws Error if the object cannot be proxified. Use {@link shouldProxy} to
*         check if a proxy can be created for a specific object.
*
* @return The created proxy.
*/
const createProxy = (namespace, obj, handlers) => {
	if (!shouldProxy(obj)) throw Error("This object cannot be proxified.");
	if (!objToProxy.has(obj)) {
		const proxy = new Proxy(obj, handlers);
		objToProxy.set(obj, proxy);
		proxyToObj.set(proxy, obj);
		proxyToNs.set(proxy, namespace);
	}
	return objToProxy.get(obj);
};
/**
* Returns the proxy for the given object. If there is no associated proxy, the
* function returns `undefined`.
*
* @param obj Object from which to know the proxy.
* @return Associated proxy or `undefined`.
*/
const getProxyFromObject = (obj) => objToProxy.get(obj);
/**
* Gets the namespace associated with the given proxy.
*
* Proxies have a namespace assigned upon creation. See {@link createProxy}.
*
* @param proxy Proxy.
* @return Namespace.
*/
const getNamespaceFromProxy = (proxy) => proxyToNs.get(proxy);
/**
* Checks if a given object can be proxied.
*
* @param candidate Object to know whether it can be proxied.
* @return True if the passed instance can be proxied.
*/
const shouldProxy = (candidate) => {
	if (typeof candidate !== "object" || candidate === null) return false;
	return !proxyToNs.has(candidate) && supported.has(candidate.constructor);
};
/**
* Returns the target object for the passed proxy. If the passed object is not a registered proxy, the
* function returns `undefined`.
*
* @param proxy Proxy from which to know the target.
* @return The target object or `undefined`.
*/
const getObjectFromProxy = (proxy) => proxyToObj.get(proxy);

// packages/interactivity/build-module/namespaces.mjs
const namespaceStack = [];
const getNamespace = () => namespaceStack.slice(-1)[0];
const setNamespace = (namespace) => {
	namespaceStack.push(namespace);
};
const resetNamespace = () => {
	namespaceStack.pop();
};

// packages/interactivity/build-module/utils.mjs
/**
* Executes a callback function after the next frame is rendered.
*
* Both arms below — the `requestAnimationFrame` call and the 100 ms
* `setTimeout` fallback — funnel through the same inner `setTimeout`, so the
* callback always runs *one macrotask after* whichever arm wins, not inside
* that arm's own turn. That deferral, not registration order, is the
* property this function is relied on for: it is what makes a callback
* registered inside a `requestAnimationFrame` callback wait for the next
* task instead of running in the same one, and it is why consumers that
* need a settled frame (rather than a settled microtask) schedule through
* this function. This is *not* a FIFO guarantee — when two registrations'
* arms race, the funnel does not preserve the order they were registered
* in; it reproduces whatever order the races themselves produce.
*
* @param callback The callback function to be executed.
* @return A promise that resolves after the callback function is executed.
*/
const afterNextFrame = (callback) => {
	return new Promise((resolve) => {
		const done = () => {
			clearTimeout(timeout);
			window.cancelAnimationFrame(raf);
			setTimeout(() => {
				callback();
				resolve();
			});
		};
		const timeout = setTimeout(done, 100);
		const raf = window.requestAnimationFrame(done);
	});
};
/**
* Returns a promise that resolves after yielding to main.
*
* @return Promise<void>
*/
const splitTask = typeof window.scheduler?.yield === "function" ? window.scheduler.yield.bind(window.scheduler) : () => {
	return new Promise((resolve) => {
		setTimeout(resolve, 0);
	});
};
/**
* Executes the passed callback on `DOMContentLoaded`, or immediately if that
* event has already been triggered.
*
* This function depends on `PerformanceNavigationTiming` (see
* https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming) to
* detect whether the event has been dispatched.
*
* @param callback Function to execute on `DOMContentLoaded`.
*/
const onDOMReady = (callback) => {
	const [navigation] = performance.getEntriesByType("navigation");
	if (navigation.domContentLoadedEventStart > 0) callback();
	else document.addEventListener("DOMContentLoaded", callback);
};
/**
* Subscribes to changes in any signal accessed inside the callback, re-running
* the callback whenever those signals change. The callback and any cleanup it
* returns run without an ambient directive scope; when either returns or
* throws, the scope frame that was on top before it ran is on top again.
*
* @example
* ```js
* const unwatch = watch( () => {
*   console.log( state.counter );
* } );
*
* // Later, to stop watching:
* unwatch();
* ```
*
* @param callback The callback to execute when a dependency changes.
* @return A cleanup function to stop watching.
*/
const watch = (callback) => E(() => runWithoutScope(() => {
	const cleanup = callback();
	return typeof cleanup === "function" ? () => runWithoutScope(cleanup) : cleanup;
}));
/**
* Creates a Flusher object that can be used to flush computed values and notify listeners.
*
* Using the mangled properties:
* this.c: this._callback
* this.x: this._compute
* https://github.com/preactjs/signals/blob/main/mangle.json
*
* @param compute The function that computes the value to be flushed.
* @param notify  The function that notifies listeners when the value is flushed.
* @return The Flusher object with `flush` and `dispose` properties.
*/
function createFlusher(compute, notify) {
	let flush = () => void 0;
	const dispose = E(function() {
		flush = this.c.bind(this);
		this.x = compute;
		this.c = notify;
		return compute();
	});
	return {
		flush,
		dispose
	};
}
/**
* Custom hook that executes a callback function whenever a signal is triggered.
* Version of `useSignalEffect` with a `useEffect`-like execution. This hook
* implementation comes from this PR, but we added short-cirtuiting to avoid
* infinite loops: https://github.com/preactjs/signals/pull/290
*
* @param callback The callback function to be executed.
*/
function useSignalEffect(callback) {
	y$2(() => {
		let eff = null;
		let isExecuting = false;
		const notify = async () => {
			if (eff && !isExecuting) {
				isExecuting = true;
				await afterNextFrame(eff.flush);
				isExecuting = false;
			}
		};
		eff = createFlusher(callback, notify);
		return eff.dispose;
	}, []);
}
function withScope(func) {
	const scope = getScope();
	const ns = getNamespace();
	let wrapped;
	if (func?.constructor?.name === "GeneratorFunction") wrapped = async (...args) => {
		const gen = func(...args);
		let value;
		let it;
		let error;
		while (true) {
			setNamespace(ns);
			setScope(scope);
			try {
				it = error ? gen.throw(error) : gen.next(value);
				error = void 0;
			} catch (e) {
				throw e;
			} finally {
				resetScope();
				resetNamespace();
			}
			try {
				value = await it.value;
			} catch (e) {
				error = e;
			}
			if (it.done) {
				if (error) throw error;
				else break;
			}
		}
		return value;
	};
	else wrapped = (...args) => {
		setNamespace(ns);
		setScope(scope);
		try {
			return func(...args);
		} finally {
			resetNamespace();
			resetScope();
		}
	};
	if (func.sync) {
		const syncAwareWrapped = wrapped;
		syncAwareWrapped.sync = true;
		return syncAwareWrapped;
	}
	return wrapped;
}
/**
* Accepts a function that contains imperative code which runs whenever any of
* the accessed _reactive_ properties (e.g., values from the global state or the
* context) is modified.
*
* This hook makes the element's scope available so functions like
* `getElement()` and `getContext()` can be used inside the passed callback.
*
* @param callback The hook callback.
*/
function useWatch(callback) {
	useSignalEffect(withScope(callback));
}
/**
* Accepts a function that contains imperative code which runs only after the
* element's first render, mainly useful for initialization logic.
*
* This hook makes the element's scope available so functions like
* `getElement()` and `getContext()` can be used inside the passed callback.
*
* @param callback The hook callback.
*/
function useInit(callback) {
	y$2(withScope(callback), []);
}
/**
* Accepts a function that contains imperative, possibly effectful code. The
* effects run after browser paint, without blocking it.
*
* This hook is equivalent to Preact's `useEffect` and makes the element's scope
* available so functions like `getElement()` and `getContext()` can be used
* inside the passed callback.
*
* @param callback Imperative function that can return a cleanup
*                 function.
* @param inputs   If present, effect will only activate if the
*                 values in the list change (using `===`).
*/
function useEffect(callback, inputs) {
	y$2(withScope(callback), inputs);
}
/**
* Accepts a function that contains imperative, possibly effectful code. Use
* this to read layout from the DOM and synchronously re-render.
*
* This hook is equivalent to Preact's `useLayoutEffect` and makes the element's
* scope available so functions like `getElement()` and `getContext()` can be
* used inside the passed callback.
*
* @param callback Imperative function that can return a cleanup
*                 function.
* @param inputs   If present, effect will only activate if the
*                 values in the list change (using `===`).
*/
function useLayoutEffect(callback, inputs) {
	_$2(withScope(callback), inputs);
}
/**
* Returns a memoized version of the callback that only changes if one of the
* inputs has changed (using `===`).
*
* This hook is equivalent to Preact's `useCallback` and makes the element's
* scope available so functions like `getElement()` and `getContext()` can be
* used inside the passed callback.
*
* @param callback Callback function.
* @param inputs   If present, the callback will only be updated if the
*                 values in the list change (using `===`).
*
* @return The callback function.
*/
function useCallback(callback, inputs) {
	return q(withScope(callback), inputs);
}
/**
* Returns the memoized output of the passed factory function, allowing access
* to the current element's scope.
*
* This hook is equivalent to Preact's `useMemo` and makes the element's scope
* available so functions like `getElement()` and `getContext()` can be used
* inside the passed factory function. Note that `useMemo` will only recompute
* the memoized value when one of the inputs has changed.
*
* @param factory Factory function that returns that value for memoization.
* @param inputs  If present, the factory will only be run to recompute if the
*                values in the list change (using `===`).
*
* @return The memoized value.
*/
function useMemo(factory, inputs) {
	return T(withScope(factory), inputs);
}
/**
* Creates a root fragment by replacing a node or an array of nodes in a parent element.
* For wrapperless hydration.
* See https://gist.github.com/developit/f4c67a2ede71dc2fab7f357f39cff28c
*
* @param parent      The parent element where the nodes will be replaced.
* @param replaceNode The node or array of nodes to replace in the parent element.
* @return The created root fragment.
*/
const createRootFragment = (parent, replaceNode) => {
	replaceNode = [].concat(replaceNode);
	const sibling = replaceNode[replaceNode.length - 1].nextSibling;
	function insert(child, root) {
		parent.insertBefore(child, root || sibling);
	}
	return parent.__k = {
		nodeType: 1,
		parentNode: parent,
		firstChild: replaceNode[0],
		childNodes: replaceNode,
		insertBefore: insert,
		appendChild: insert,
		removeChild(c) {
			parent.removeChild(c);
		},
		contains(c) {
			parent.contains(c);
		}
	};
};
/**
* Transforms a kebab-case string to camelCase.
*
* @param str The kebab-case string to transform to camelCase.
* @return The transformed camelCase string.
*/
function kebabToCamelCase(str) {
	return str.replace(/^-+|-+$/g, "").toLowerCase().replace(/-([a-z])/g, function(_match, group1) {
		return group1.toUpperCase();
	});
}
const logged = /* @__PURE__ */ new Set();
/**
* Shows a warning with `message` if environment is not `production`.
*
* Based on the `@wordpress/warning` package.
*
* @param message Message to show in the warning.
*/
const warn = (message) => {
	if (logged.has(message)) return;
	console.warn(message);
	try {
		throw Error(message);
	} catch {}
	logged.add(message);
};
/**
* Checks whether a property key leads out of an object's own data:
* `__proto__` to its prototype, `constructor` to its constructor, and
* `prototype` to a function's prototype.
*
* @param key The property key.
* @return Whether the key is reserved.
*/
const isReservedKey = (key) => key === "__proto__" || key === "constructor" || key === "prototype";
/**
* Reads a property that an object owns, ignoring inherited properties such
* as `Object.prototype.valueOf`.
*
* @param object The object to read.
* @param key    The property key.
* @return The value, or `undefined` if the object doesn't own the property.
*/
const getOwnProperty = (object, key) => Object.prototype.hasOwnProperty.call(object, key) ? object[key] : void 0;
/**
* `JSON.parse()` reviver that removes keys named `__proto__`.
*
* `JSON.parse()` creates `__proto__` as an own property. Copying it by
* assignment, as in a `for...in` loop or `Object.assign()`, replaces the
* target's prototype instead.
*
* @param key   The property key.
* @param value The parsed value.
* @return The value, or `undefined` to remove the key.
*/
const jsonReviver = (key, value) => key === "__proto__" ? void 0 : value;
/**
* Checks if the passed `candidate` is a plain object with just the `Object`
* prototype.
*
* @param candidate The item to check.
* @return Whether `candidate` is a plain object.
*/
const isPlainObject = (candidate) => Boolean(candidate && typeof candidate === "object" && candidate.constructor === Object);
/**
* Indicates that the passed `callback` requires synchronous access to the event object.
*
* @param callback The event callback.
* @return Altered event callback.
*/
function withSyncEvent(callback) {
	const syncAware = callback;
	syncAware.sync = true;
	return syncAware;
}
const readOnlyMap = /* @__PURE__ */ new WeakMap();
/**
* Creates a proxy handler that prevents any modifications to the target object.
*
* @param errorMessage Custom error message to display when modification is attempted.
* @return Proxy handler for read-only behavior.
*/
const createDeepReadOnlyHandlers = (errorMessage) => {
	const handleError = () => {
		warn(errorMessage);
		return false;
	};
	return {
		get(target, prop) {
			const value = target[prop];
			if (value && typeof value === "object") return deepReadOnly(value, { errorMessage });
			return value;
		},
		set: handleError,
		deleteProperty: handleError,
		defineProperty: handleError
	};
};
/**
* Creates a deeply read-only proxy of an object.
*
* This function recursively wraps an object and all its nested objects in
* proxies that prevent any modifications. All mutation operations (`set`,
* `deleteProperty`, and `defineProperty`) will silently fail in production and
* emit warnings in development (when `globalThis.SCRIPT_DEBUG` is true).
*
* The wrapping is lazy: nested objects are only wrapped when accessed, making
* this efficient for large or deeply nested structures.
*
* Proxies are cached using a WeakMap, so calling this function multiple times
* with the same object will return the same proxy instance.
*
* @param obj                  The object to make read-only.
* @param options              Optional configuration.
* @param options.errorMessage Custom error message to display when modification is attempted.
* @return A read-only proxy of the object.
*/
function deepReadOnly(obj, options) {
	const errorMessage = options?.errorMessage ?? "Cannot modify read-only object";
	if (!readOnlyMap.has(obj)) {
		const handlers = createDeepReadOnlyHandlers(errorMessage);
		readOnlyMap.set(obj, new Proxy(obj, handlers));
	}
	return readOnlyMap.get(obj);
}
const navigationSignal = d$3(0);
/**
* Unique identifier for the current browser session of the interactivity
* runtime. Generated once when the module is first evaluated. Used by the
* router to tag history entries so that, after a full page reload, popstate
* events for entries created in a previous session trigger a full reload
* instead of a client-side navigation that would leave stale content.
*/
const sessionId = Math.random().toString(36).slice(2);
/**
* Recursively clones the passed object.
*
* @param source Source object.
* @return Cloned object.
*/
function deepClone(source) {
	if (isPlainObject(source)) return Object.fromEntries(Object.entries(source).map(([key, value]) => [key, deepClone(value)]));
	if (Array.isArray(source)) return source.map((i) => deepClone(i));
	return source;
}

// packages/interactivity/build-module/scopes.mjs
const scopeStack = [];
/**
* Retrieves the scope at the top of the scope stack.
*
* An empty stack entry represents a deliberate scope-less execution frame and
* is returned as `undefined`.
*
* @return The current scope, or `undefined` when no scope is installed.
*/
const getScope = () => scopeStack.slice(-1)[0];
/**
* Installs a scope at the top of the scope stack.
*
* Omitting the scope installs an empty execution frame for code that must not
* inherit a caller's directive scope.
*
* @param scope Scope to install, or `undefined` for an empty execution frame.
*/
const setScope = (scope) => {
	scopeStack.push(scope);
};
/**
* Removes the current scope from the scope stack.
*/
const resetScope = () => {
	scopeStack.pop();
};
/**
* Runs a callback without inheriting an ambient directive scope.
*
* Installs an empty execution frame on top of the scope stack, runs the
* callback, and removes that frame whether the callback returns or throws, as
* `withScope()` does with the scope it captured. Errors thrown by the callback
* are rethrown.
*
* @param fn Callback to execute without an ambient directive scope.
* @return The callback's return value.
*/
const runWithoutScope = (fn) => {
	setScope();
	try {
		return fn();
	} finally {
		resetScope();
	}
};
const throwNotInScope = (method) => {
	throw Error(`Cannot call \`${method}()\` when there is no scope. If you are using an async function, please consider using a generator instead. If you are using some sort of async callbacks, like \`setTimeout\`, please wrap the callback with \`withScope(callback)\`.`);
};
/**
* Retrieves the context inherited by the element evaluating a function from the
* store. The returned value depends on the element and the namespace where the
* function calling `getContext()` exists.
*
* @param namespace Store namespace. By default, the namespace where the calling
*                  function exists is used.
* @return The context content.
*/
const getContext = (namespace) => {
	const scope = getScope();
	if (!scope) throwNotInScope("getContext");
	return scope.context[namespace || getNamespace()];
};
/**
* Retrieves a representation of the element where a function from the store
* is being evaluated. Such representation is read-only, and contains a
* reference to the DOM element, its props and a local reactive state.
*
* @return Element representation.
*/
const getElement = () => {
	const scope = getScope();
	let deepReadOnlyOptions = {};
	if (!scope) throwNotInScope("getElement");
	deepReadOnlyOptions = { errorMessage: "Don't mutate the attributes from `getElement`, use `data-wp-bind` to modify the attributes of an element instead." };
	const { ref, attributes } = scope;
	return Object.freeze({
		ref: ref.current,
		attributes: deepReadOnly(attributes, deepReadOnlyOptions)
	});
};
const navigationContextSignal = d$3(0);
function getServerContext(namespace) {
	const scope = getScope();
	if (!scope) throwNotInScope("getServerContext");
	getServerContext.subscribe = navigationContextSignal.value;
	return deepClone(scope.serverContext[namespace || getNamespace()]);
}
getServerContext.subscribe = 0;

// packages/interactivity/build-module/proxies/signals.mjs
/**
* Identifier for property computeds not associated to any scope.
*/
const NO_SCOPE = {};
/**
* Structure that manages reactivity for a property in a state object. It uses
* signals to keep track of property value or getter modifications.
*/
var PropSignal = class {
	/**
	* Proxy that holds the property this PropSignal is associated with.
	*/
	owner;
	/**
	* Relation of computeds by scope. These computeds are read-only signals
	* that depend on whether the property is a value or a getter and,
	* therefore, can return different values depending on the scope in which
	* the getter is accessed.
	*/
	computedsByScope;
	/**
	* Signal with the value assigned to the related property.
	*/
	valueSignal;
	/**
	* Signal with the getter assigned to the related property.
	*/
	getterSignal;
	/**
	* Pending getter to be consolidated.
	*/
	pendingGetter;
	/**
	* Structure that manages reactivity for a property in a state object, using
	* signals to keep track of property value or getter modifications.
	*
	* @param owner Proxy that holds the property this instance is associated
	*              with.
	*/
	constructor(owner) {
		this.owner = owner;
		this.computedsByScope = /* @__PURE__ */ new WeakMap();
	}
	/**
	* Changes the internal value. If a getter was set before, it is set to
	* `undefined`.
	*
	* @param value New value.
	*/
	setValue(value) {
		this.update({ value });
	}
	/**
	* Changes the internal getter. If a value was set before, it is set to
	* `undefined`.
	*
	* @param getter New getter.
	*/
	setGetter(getter) {
		this.update({ get: getter });
	}
	/**
	* Changes the internal getter asynchronously.
	*
	* The update is made in a microtask, which prevents issues with getters
	* accessing the state, and ensures the update occurs before any render.
	*
	* @param getter New getter.
	*/
	setPendingGetter(getter) {
		this.pendingGetter = getter;
		queueMicrotask(() => this.consolidateGetter());
	}
	/**
	* Consolidate the pending value of the getter.
	*/
	consolidateGetter() {
		const getter = this.pendingGetter;
		if (getter) {
			this.pendingGetter = void 0;
			this.update({ get: getter });
		}
	}
	/**
	* Returns the computed that holds the result of evaluating the prop in the
	* current scope.
	*
	* These computeds are read-only signals that depend on whether the property
	* is a value or a getter and, therefore, can return different values
	* depending on the scope in which the getter is accessed.
	*
	* @return Computed that depends on the scope.
	*/
	getComputed() {
		const scope = getScope() || NO_SCOPE;
		if (!this.valueSignal && !this.getterSignal) this.update({});
		if (this.pendingGetter) this.consolidateGetter();
		if (!this.computedsByScope.has(scope)) {
			const callback = () => {
				const getter = this.getterSignal?.value;
				return getter ? getter.call(this.owner) : this.valueSignal?.value;
			};
			setNamespace(getNamespaceFromProxy(this.owner));
			this.computedsByScope.set(scope, w$1(withScope(callback)));
			resetNamespace();
		}
		return this.computedsByScope.get(scope);
	}
	/**
	*  Updates the internal signals for the value and the getter of the
	*  corresponding prop.
	*
	* @param param0
	* @param param0.get   New getter.
	* @param param0.value New value.
	*/
	update({ get, value }) {
		if (!this.valueSignal) {
			this.valueSignal = d$3(value);
			this.getterSignal = d$3(get);
		} else if (value !== this.valueSignal.peek() || get !== this.getterSignal.peek()) r$1(() => {
			this.valueSignal.value = value;
			this.getterSignal.value = get;
		});
	}
};

// packages/interactivity/build-module/proxies/state.mjs
/**
* Set of built-in symbols.
*/
const wellKnownSymbols = new Set(Object.getOwnPropertyNames(Symbol).map((key) => Symbol[key]).filter((value) => typeof value === "symbol"));
/**
* Relates each proxy with a map of {@link PropSignal} instances, representing
* the proxy's accessed properties.
*/
const proxyToProps = /* @__PURE__ */ new WeakMap();
/**
*  Checks whether a {@link PropSignal | `PropSignal`} instance exists for the
*  given property in the passed proxy.
*
* @param proxy Proxy of a state object or array.
* @param key   The property key.
* @return `true` when it exists; false otherwise.
*/
const hasPropSignal = (proxy, key) => proxyToProps.has(proxy) && proxyToProps.get(proxy).has(key);
/**
* Returns the {@link PropSignal | `PropSignal`} instance associated with the
* specified prop in the passed proxy.
*
* The `PropSignal` instance is generated if it doesn't exist yet, using the
* `initial` parameter to initialize the internal signals.
*
* @param proxy   Proxy of a state object or array.
* @param key     The property key.
* @param initial Initial data for the `PropSignal` instance.
* @return The `PropSignal` instance.
*/
const getPropSignal = (proxy, key, initial) => {
	if (!proxyToProps.has(proxy)) proxyToProps.set(proxy, /* @__PURE__ */ new Map());
	key = typeof key === "number" ? `${key}` : key;
	const props = proxyToProps.get(proxy);
	if (!props.has(key)) {
		const ns = getNamespaceFromProxy(proxy);
		const prop = new PropSignal(proxy);
		props.set(key, prop);
		if (initial) {
			const { get, value } = initial;
			if (get) prop.setGetter(get);
			else prop.setValue(shouldProxy(value) ? proxifyState(ns, value) : value);
		}
	}
	return props.get(key);
};
/**
* Relates each proxied object (i.e., the original object) with a signal that
* tracks changes in the number of properties.
*/
const objToIterable = /* @__PURE__ */ new WeakMap();
/**
* When this flag is `true`, it avoids any signal subscription, overriding state
* props' "reactive" behavior.
*/
let peeking = false;
const PENDING_GETTER = Symbol("PENDING_GETTER");
/**
* Handlers for reactive objects and arrays in the state.
*/
const stateHandlers = {
	get(target, key, receiver) {
		if (peeking || !Object.prototype.hasOwnProperty.call(target, key) && key in target || typeof key === "symbol" && wellKnownSymbols.has(key)) return Reflect.get(target, key, receiver);
		const desc = Object.getOwnPropertyDescriptor(target, key);
		const result = getPropSignal(receiver, key, desc).getComputed().value;
		if (result === PENDING_GETTER) throw PENDING_GETTER;
		if (typeof result === "function") {
			const ns = getNamespaceFromProxy(receiver);
			return (...args) => {
				setNamespace(ns);
				try {
					return result.call(receiver, ...args);
				} finally {
					resetNamespace();
				}
			};
		}
		return result;
	},
	set(target, key, value, receiver) {
		setNamespace(getNamespaceFromProxy(receiver));
		try {
			return Reflect.set(target, key, value, receiver);
		} finally {
			resetNamespace();
		}
	},
	defineProperty(target, key, desc) {
		const isNew = !(key in target);
		const result = Reflect.defineProperty(target, key, desc);
		if (result) {
			const receiver = getProxyFromObject(target);
			const prop = getPropSignal(receiver, key);
			const { get, value } = desc;
			if (get) prop.setGetter(get);
			else {
				const ns = getNamespaceFromProxy(receiver);
				prop.setValue(shouldProxy(value) ? proxifyState(ns, value) : value);
			}
			if (isNew && objToIterable.has(target)) objToIterable.get(target).value++;
			if (Array.isArray(target) && proxyToProps.get(receiver)?.has("length")) getPropSignal(receiver, "length").setValue(target.length);
		}
		return result;
	},
	deleteProperty(target, key) {
		const result = Reflect.deleteProperty(target, key);
		if (result) {
			getPropSignal(getProxyFromObject(target), key).setValue(void 0);
			if (objToIterable.has(target)) objToIterable.get(target).value++;
		}
		return result;
	},
	ownKeys(target) {
		if (!objToIterable.has(target)) objToIterable.set(target, d$3(0));
		objToIterable._ = objToIterable.get(target).value;
		return Reflect.ownKeys(target);
	}
};
/**
* Returns the proxy associated with the given state object, creating it if it
* does not exist.
*
* @param namespace The namespace that will be associated to this proxy.
* @param obj       The object to proxify.
*
* @throws Error if the object cannot be proxified. Use {@link shouldProxy} to
*         check if a proxy can be created for a specific object.
*
* @return The associated proxy.
*/
const proxifyState = (namespace, obj) => {
	return createProxy(namespace, obj, stateHandlers);
};
/**
* Reads the value of the specified property without subscribing to it.
*
* @param obj The object to read the property from.
* @param key The property key.
* @return The property value.
*/
const peek = (obj, key) => {
	peeking = true;
	try {
		return obj[key];
	} finally {
		peeking = false;
	}
};
/**
* Internal recursive implementation for {@link deepMerge | `deepMerge`}.
*
* @param target   The target object.
* @param source   The source object containing new values and props.
* @param override Whether existing props should be overwritten or not (`true`
*                 by default).
*/
const deepMergeRecursive = (target, source, override = true) => {
	if (!(isPlainObject(target) && isPlainObject(source))) return;
	let hasNewKeys = false;
	for (const key in source) {
		if (isReservedKey(key)) continue;
		const isNew = !(key in target);
		hasNewKeys = hasNewKeys || isNew;
		const desc = Object.getOwnPropertyDescriptor(source, key);
		const proxy = getProxyFromObject(target);
		const propSignal = !!proxy && hasPropSignal(proxy, key) && getPropSignal(proxy, key);
		if (typeof desc.get === "function" || typeof desc.set === "function") {
			if (override || isNew) {
				Object.defineProperty(target, key, {
					...desc,
					configurable: true,
					enumerable: true
				});
				if (desc.get && propSignal) propSignal.setPendingGetter(desc.get);
			}
		} else if (isPlainObject(source[key])) {
			const targetValue = Object.getOwnPropertyDescriptor(target, key)?.value;
			if (isNew || override && !isPlainObject(targetValue)) {
				target[key] = {};
				if (propSignal) {
					const ns = getNamespaceFromProxy(proxy);
					propSignal.setValue(proxifyState(ns, target[key]));
				}
				deepMergeRecursive(target[key], source[key], override);
			} else if (isPlainObject(targetValue)) deepMergeRecursive(target[key], source[key], override);
		} else if (override || isNew) {
			Object.defineProperty(target, key, desc);
			if (propSignal) {
				const { value } = desc;
				const ns = getNamespaceFromProxy(proxy);
				propSignal.setValue(shouldProxy(value) ? proxifyState(ns, value) : value);
			}
		}
	}
	if (hasNewKeys && objToIterable.has(target)) objToIterable.get(target).value++;
};
/**
* Recursively updates prop values inside the passed `target` and nested plain
* objects, using the values present in `source`. References to plain objects
* are kept, only updating props containing primitives or arrays. Arrays are
* replaced instead of merged or concatenated.
*
* If the `override` parameter is set to `false`, then all values in `target`
* are preserved, and only new properties from `source` are added.
*
* @param target   The target object.
* @param source   The source object containing new values and props.
* @param override Whether existing props should be overwritten or not (`true`
*                 by default).
*/
const deepMerge = (target, source, override = true) => r$1(() => deepMergeRecursive(getObjectFromProxy(target) || target, source, override));

// packages/interactivity/build-module/proxies/store.mjs
/**
* Identifies the store proxies handling the root objects of each store.
*/
const storeRoots = /* @__PURE__ */ new WeakSet();
/**
* Handlers for store proxies.
*/
const storeHandlers = { get: (target, key, receiver) => {
	const result = Reflect.get(target, key);
	const ns = getNamespaceFromProxy(receiver);
	if (typeof result === "undefined" && storeRoots.has(receiver)) {
		const obj = {};
		Reflect.set(target, key, obj);
		return proxifyStore(ns, obj, false);
	}
	if (typeof result === "function") {
		setNamespace(ns);
		const scoped = withScope(result);
		resetNamespace();
		return scoped;
	}
	if (isPlainObject(result) && shouldProxy(result)) return proxifyStore(ns, result, false);
	return result;
} };
/**
* Returns the proxy associated with the given store object, creating it if it
* does not exist.
*
* @param namespace The namespace that will be associated to this proxy.
* @param obj       The object to proxify.
*
* @param isRoot    Whether the passed object is the store root object.
* @throws Error if the object cannot be proxified. Use {@link shouldProxy} to
*         check if a proxy can be created for a specific object.
*
* @return The associated proxy.
*/
const proxifyStore = (namespace, obj, isRoot = true) => {
	const proxy = createProxy(namespace, obj, storeHandlers);
	if (proxy && isRoot) storeRoots.add(proxy);
	return proxy;
};

// packages/interactivity/build-module/proxies/context.mjs
const contextObjectToProxy = /* @__PURE__ */ new WeakMap();
const contextObjectToFallback = /* @__PURE__ */ new WeakMap();
const contextProxies = /* @__PURE__ */ new WeakSet();
const descriptor = Reflect.getOwnPropertyDescriptor;
const contextHandlers = {
	get: (target, key) => {
		const fallback = contextObjectToFallback.get(target);
		const currentProp = target[key];
		return key in target ? currentProp : fallback[key];
	},
	set: (target, key, value) => {
		const fallback = contextObjectToFallback.get(target);
		const obj = key in target || !(key in fallback) ? target : fallback;
		obj[key] = value;
		return true;
	},
	ownKeys: (target) => [.../* @__PURE__ */ new Set([...Object.keys(contextObjectToFallback.get(target)), ...Object.keys(target)])],
	getOwnPropertyDescriptor: (target, key) => descriptor(target, key) || descriptor(contextObjectToFallback.get(target), key),
	has: (target, key) => Reflect.has(target, key) || Reflect.has(contextObjectToFallback.get(target), key)
};
/**
* Wraps a context object with a proxy to reproduce the context stack. The proxy
* uses the passed `inherited` context as a fallback to look up for properties
* that don't exist in the given context. Also, updated properties are modified
* where they are defined, or added to the main context when they don't exist.
*
* @param current   Current context.
* @param inherited Inherited context, used as fallback.
*
* @return The wrapped context object.
*/
const proxifyContext = (current, inherited = {}) => {
	if (contextProxies.has(current)) throw Error("This object cannot be proxified.");
	contextObjectToFallback.set(current, inherited);
	if (!contextObjectToProxy.has(current)) {
		const proxy = new Proxy(current, contextHandlers);
		contextObjectToProxy.set(current, proxy);
		contextProxies.add(proxy);
	}
	return contextObjectToProxy.get(current);
};

// packages/interactivity/build-module/store.mjs
const stores = /* @__PURE__ */ new Map();
const rawStores = /* @__PURE__ */ new Map();
const storeLocks = /* @__PURE__ */ new Map();
const storeConfigs = /* @__PURE__ */ new Map();
const serverStates = /* @__PURE__ */ new Map();
/**
* Gets the defined config for the store with the passed namespace.
*
* @param namespace Store's namespace from which to retrieve the config.
* @return Defined config for the given namespace.
*/
const getConfig = (namespace) => storeConfigs.get(namespace || getNamespace()) || {};
function getServerState(namespace) {
	const ns = namespace || getNamespace();
	if (!serverStates.has(ns)) serverStates.set(ns, {});
	getServerState.subscribe = navigationSignal.value;
	return deepClone(serverStates.get(ns));
}
getServerState.subscribe = 0;
const universalUnlock = "I acknowledge that using a private store means my plugin will inevitably break on the next store release.";
function store(namespace, { state = {}, ...block } = {}, { lock = false } = {}) {
	if (!stores.has(namespace)) {
		if (lock !== "I acknowledge that using a private store means my plugin will inevitably break on the next store release.") storeLocks.set(namespace, lock);
		const rawStore = {
			state: proxifyState(namespace, isPlainObject(state) ? state : {}),
			...block
		};
		const proxifiedStore = proxifyStore(namespace, rawStore);
		rawStores.set(namespace, rawStore);
		stores.set(namespace, proxifiedStore);
	} else {
		if (lock !== "I acknowledge that using a private store means my plugin will inevitably break on the next store release." && !storeLocks.has(namespace)) storeLocks.set(namespace, lock);
		else {
			const storeLock = storeLocks.get(namespace);
			if (!(lock === "I acknowledge that using a private store means my plugin will inevitably break on the next store release." || lock !== true && lock === storeLock)) {
				if (!storeLock) throw Error("Cannot lock a public store");
				else throw Error("Cannot unlock a private store with an invalid lock code");
			}
		}
		const target = rawStores.get(namespace);
		deepMerge(target, block);
		deepMerge(target.state, state);
	}
	return stores.get(namespace);
}
const parseServerData = (dom = document) => {
	const jsonDataScriptTag = dom.querySelector("script[id=\"wp-script-module-data-@wordpress/interactivity\"]") ?? dom.querySelector("script[id=\"wp-interactivity-data\"]");
	if (jsonDataScriptTag instanceof HTMLScriptElement) try {
		return JSON.parse(jsonDataScriptTag.text, jsonReviver);
	} catch {}
	return {};
};
const populateServerData = (data) => {
	serverStates.clear();
	storeConfigs.clear();
	if (isPlainObject(data?.state)) Object.entries(data.state).forEach(([namespace, state]) => {
		const st = store(namespace, {}, { lock: universalUnlock });
		deepMerge(st.state, state, false);
		serverStates.set(namespace, state);
	});
	if (isPlainObject(data?.config)) Object.entries(data.config).forEach(([namespace, config]) => {
		storeConfigs.set(namespace, config);
	});
	if (isPlainObject(data?.derivedStateClosures)) Object.entries(data.derivedStateClosures).forEach(([namespace, paths]) => {
		const st = store(namespace, {}, { lock: universalUnlock });
		paths.forEach((path) => {
			const pathParts = path.split(".");
			const prop = pathParts.splice(-1, 1)[0];
			const parent = pathParts.reduce((prev, key) => peek(prev, key), st);
			const desc = Object.getOwnPropertyDescriptor(parent, prop);
			if (isPlainObject(desc?.value)) parent[prop] = PENDING_GETTER;
		});
	});
};

// packages/interactivity/build-module/vdom.mjs
init_preact_module();
/** Associates opaque HTML props with script-free snapshots owned by the live document's template-contents document. */
const htmlFallbacks = /* @__PURE__ */ new WeakMap();
/** Opaque HTML props whose snapshot holds an element's server-rendered content, not `<template>` content. */
const htmlServerContents = /* @__PURE__ */ new WeakSet();
/** Number of `<template>` element contents being converted around the current conversion. */
let templateContentDepth = 0;
const directivePrefix = `data-wp-`;
const namespaces = [];
const currentNamespace = () => namespaces[namespaces.length - 1] ?? null;
const isObject = (item) => Boolean(item && typeof item === "object" && item.constructor === Object);
const invalidCharsRegex = /[^a-z0-9-_]/i;
/**
* Checks whether a directive name part is reserved after trimming hyphens and
* lowercasing it, as `kebabToCamelCase()` does: `data-wp-each--constructor-`
* names the item `constructor`.
*
* Directive names, suffixes, unique IDs and namespaces become property keys:
* `data-wp-bind--[attribute]`, for example, assigns to the element's props.
*
* @param part Part of a directive name.
* @return Whether the part is reserved.
*/
const isReservedNamePart = (part) => isReservedKey(part.replace(/^-+|-+$/g, "").toLowerCase());
/**
* Splits a directive attribute name into its prefix, suffix and unique ID.
*
* @param directiveName The full attribute name, starting with `data-wp-`.
* @return The parsed name, or null when the part after `data-wp-` contains
*         unsupported characters, starts with a hyphen or has a reserved part.
*/
function parseDirectiveName(directiveName) {
	const parsed = splitDirectiveName(directiveName);
	if (parsed && (isReservedNamePart(parsed.prefix) || parsed.suffix !== null && parsed.suffix.split("--").some(isReservedNamePart) || parsed.uniqueId !== null && isReservedNamePart(parsed.uniqueId))) return null;
	return parsed;
}
function splitDirectiveName(directiveName) {
	const name = directiveName.substring(8);
	if (invalidCharsRegex.test(name)) return null;
	const suffixIndex = name.indexOf("--");
	if (suffixIndex === 0 || name[0] === "-") return null;
	if (suffixIndex === -1) return {
		prefix: name,
		suffix: null,
		uniqueId: null
	};
	const prefix = name.substring(0, suffixIndex);
	const remaining = name.substring(suffixIndex);
	if (remaining.startsWith("---") && remaining[3] !== "-") return {
		prefix,
		suffix: null,
		uniqueId: remaining.substring(3) || null
	};
	let suffix = remaining.substring(2);
	const uniqueIdIndex = suffix.indexOf("---");
	if (uniqueIdIndex !== -1 && suffix.substring(uniqueIdIndex)[3] !== "-") {
		const uniqueId = suffix.substring(uniqueIdIndex + 3) || null;
		suffix = suffix.substring(0, uniqueIdIndex) || null;
		return {
			prefix,
			suffix,
			uniqueId
		};
	}
	return {
		prefix,
		suffix: suffix || null,
		uniqueId: null
	};
}
const nsPathRegExp = /^([\w_\/-]+)::(.+)$/;
/**
* Copies a node tree into the target's owner document, omitting script
* elements recursively. HTML-namespace template contents are traversed
* separately because they are not ordinary child nodes of their template
* element; elements named `template` in other namespaces use their child nodes.
*
* @param source The node whose child nodes are copied.
* @param target The fragment or cloned node that receives those children.
*/
function copyFallbackChildren(source, target) {
	for (const child of Array.from(source.childNodes)) {
		if (child.nodeType === 1 && child.localName === "script") continue;
		const clone = target.ownerDocument.importNode(child, false);
		target.appendChild(clone);
		if (child.nodeType === 1 && child.namespaceURI === "http://www.w3.org/1999/xhtml" && child.localName === "template") copyFallbackChildren(child.content, clone.content);
		else copyFallbackChildren(child, clone);
	}
}
/**
* Gets the inert template-contents document associated with the live document.
*
* @return The live document's shared template-contents owner document.
*/
function getTemplateContentsOwnerDocument() {
	return document.createElement("template").content.ownerDocument;
}
/**
* Reads the script-free fallback snapshot recorded for an element vnode. The
* snapshot is owned by the live document's shared template-contents document.
* Callers must leave it detached and unmodified; insert a clone.
*
* @param element The element vnode passed to a directive callback.
* @return The detached fallback snapshot, or `undefined` when absent.
*/
function getHtmlFallback(element) {
	const htmlProps = element.props.dangerouslySetInnerHTML;
	return htmlProps && htmlFallbacks.get(htmlProps);
}
/**
* Reads the script-free snapshot of an element's server-rendered content: the
* snapshot that {@link getHtmlFallback} returns, when `toVdom()` built the
* vnode from markup outside every `<template>` element's content. Callers must
* leave it detached and unmodified; insert a clone.
*
* @param element The element vnode passed to a directive callback.
* @return The detached snapshot, or `undefined` for a vnode built from
*         `<template>` content or not built by `toVdom()`.
*/
function getHtmlServerContent(element) {
	const htmlProps = element.props.dangerouslySetInnerHTML;
	return htmlProps && htmlServerContents.has(htmlProps) ? htmlFallbacks.get(htmlProps) : void 0;
}
/**
* Parses the namespace and value from a directive attribute value.
*
* JSON is retained only when it produces a plain object. All other values use
* the raw value after any namespace prefix has been removed. Keys named
* `__proto__` are removed from the parsed JSON.
*
* @param rawValue The raw directive attribute value.
* @return An object with the optional `namespace` and interpreted `value`.
*/
function parseDirectiveValue(rawValue) {
	const regexResult = nsPathRegExp.exec(rawValue);
	const namespace = regexResult?.[1] ?? null;
	const rawDirectiveValue = regexResult?.[2] ?? rawValue;
	let value = rawDirectiveValue;
	if (/^\s*\{/.test(rawDirectiveValue)) try {
		const parsedValue = JSON.parse(rawDirectiveValue, jsonReviver);
		if (isObject(parsedValue)) value = parsedValue;
	} catch {}
	return {
		namespace,
		value
	};
}
const directiveMaps = /* @__PURE__ */ new WeakSet();
/**
* Checks whether the passed value is a directive map created by `toVdom()`.
*
* @param value The value to check.
* @return Whether the value is a directive map created by `toVdom()`.
*/
const isDirectiveMap = (value) => typeof value === "object" && value !== null && directiveMaps.has(value);
/**
* Gets the namespace named by the parsed value of a `data-wp-interactive`
* attribute: the value itself when it is a string, or the `namespace` string of
* an object. It is the single place that interprets these values, so
* {@link toVdom} and its callers resolve a `data-wp-interactive` attribute to
* the same namespace.
*
* @param value The `value` returned by {@link parseDirectiveValue} for the
*              attribute.
* @return The namespace, or null when the value names none or a reserved key.
*/
const getInteractiveNamespace = (value) => {
	const namespace = typeof value === "string" ? value : typeof value?.namespace === "string" ? value.namespace : null;
	return isReservedKey(namespace) ? null : namespace;
};
/**
* Recursive function that transforms a DOM tree into vDOM.
* Directive attributes are interpreted with {@link parseDirectiveValue}.
*
* Unprefixed directives get the namespace of the nearest `data-wp-interactive`
* at or above their element within `root`. Where there is none, the namespace
* passed as `namespace` applies, as if `root` sat inside a
* `data-wp-interactive` that names it; `null` stands for no namespace. When
* `namespace` is omitted, the namespace in effect where the conversion is
* requested applies: the enclosing conversion's for `<template>` content, and
* `null` for a top-level call. The ancestors of `root` are never read. A
* namespace prefix in a directive value always takes precedence.
*
* @example
* ```js
* // The directives of the region resolve against `my-plugin`, the namespace
* // of the interactive element that contains it.
* toVdom( region, 'my-plugin' );
* ```
*
* @param root      The root element or node to start traversing on.
* @param namespace Optional namespace for the unprefixed directives that no
*                  `data-wp-interactive` within `root` governs.
* @return The resulting vDOM tree.
*/
function toVdom(root, namespace) {
	if (namespace === void 0) return convertToVdom(root);
	namespaces.push(namespace);
	try {
		return convertToVdom(root);
	} finally {
		namespaces.pop();
	}
}
function convertToVdom(root) {
	const nodesToRemove = /* @__PURE__ */ new Set();
	const nodesToReplace = /* @__PURE__ */ new Set();
	const treeWalker = document.createTreeWalker(root, 205);
	function walk(node) {
		const { nodeType } = node;
		if (nodeType === 3) return node.data;
		if (nodeType === 4) {
			nodesToReplace.add(node);
			return node.data;
		}
		if (nodeType === 8 || nodeType === 7) {
			nodesToRemove.add(node);
			return null;
		}
		const elementNode = node;
		const localName = elementNode.localName;
		const props = {};
		const children = [];
		const directives = [];
		let island = false;
		const attributeNames = elementNode.getAttributeNames();
		for (let i = 0; i < attributeNames.length; i++) {
			const attributeName = attributeNames[i];
			const attributeValue = elementNode.getAttribute(attributeName) ?? "";
			if (attributeName[directivePrefix.length] && attributeName.slice(0, directivePrefix.length) === directivePrefix) {
				if (attributeName === "data-wp-ignore") warn("The data-wp-ignore directive has been removed. The element and its descendants are now hydrated like any other element. Please remove the attribute.");
				const { namespace, value } = parseDirectiveValue(attributeValue);
				if (attributeName === "data-wp-interactive") {
					island = true;
					namespaces.push(getInteractiveNamespace(value));
				} else if (isReservedKey(namespace)) warn(`Found reserved namespace "${namespace}" in directive: ${attributeName}.`);
				else directives.push([
					attributeName,
					namespace,
					value
				]);
				props[attributeName] = attributeValue;
				continue;
			} else if (attributeName === "ref") continue;
			if (attributeValue === "" && elementNode[attributeName] === true) props[attributeName] = true;
			else props[attributeName] = attributeValue;
		}
		if (directives.length) {
			props.__directives = directives.reduce((obj, [name, ns, value]) => {
				const directiveParsed = parseDirectiveName(name);
				if (directiveParsed === null) {
					warn(`Found malformed directive name: ${name}.`);
					return obj;
				}
				const { prefix, suffix, uniqueId } = directiveParsed;
				obj[prefix] = obj[prefix] || [];
				obj[prefix].push({
					namespace: ns ?? currentNamespace(),
					value,
					suffix,
					uniqueId
				});
				return obj;
			}, Object.create(null));
			directiveMaps.add(props.__directives);
			for (const prefix in props.__directives) props.__directives[prefix].sort((a, b) => {
				const aSuffix = a.suffix ?? "";
				const bSuffix = b.suffix ?? "";
				if (aSuffix !== bSuffix) return aSuffix < bSuffix ? -1 : 1;
				const aId = a.uniqueId ?? "";
				const bId = b.uniqueId ?? "";
				return +(aId > bId) - +(aId < bId);
			});
		}
		if (props.__directives?.html) {
			const conflictingPrefixes = [
				"text",
				"each",
				"router-region"
			].filter((prefix) => prefix in props.__directives);
			if (conflictingPrefixes.length) {
				warn(`The data-wp-html directive was ignored because it conflicts with ${conflictingPrefixes.map((prefix) => `data-wp-${prefix}`).join(", ")}.`);
				delete props.__directives.html;
			}
		}
		const hasDefaultHtmlDirective = props.__directives?.html?.some(({ suffix }) => suffix === null);
		if (props.__directives?.["each-child"] || hasDefaultHtmlDirective) {
			const htmlProps = { __html: elementNode.innerHTML };
			props.dangerouslySetInnerHTML = htmlProps;
			if (hasDefaultHtmlDirective) {
				const snapshot = getTemplateContentsOwnerDocument().createDocumentFragment();
				copyFallbackChildren(elementNode, snapshot);
				htmlFallbacks.set(htmlProps, snapshot);
				if (!templateContentDepth) htmlServerContents.add(htmlProps);
			}
		} else if (localName === "template") {
			templateContentDepth++;
			try {
				props.content = [...elementNode.content.childNodes].map((childNode) => toVdom(childNode));
			} finally {
				templateContentDepth--;
			}
		} else {
			let child = treeWalker.firstChild();
			if (child) {
				while (child) {
					const vnode = walk(child);
					if (vnode) children.push(vnode);
					child = treeWalker.nextSibling();
				}
				treeWalker.parentNode();
			}
		}
		if (island) namespaces.pop();
		return k$1(localName, props, children);
	}
	const vdom = walk(treeWalker.currentNode);
	nodesToRemove.forEach((node) => node.remove());
	nodesToReplace.forEach((node) => node.replaceWith(new window.Text(node.data)));
	return vdom;
}

// packages/interactivity/build-module/hooks.mjs
init_preact_module();
function isNonDefaultDirectiveSuffix(entry) {
	return entry.suffix !== null;
}
function isDefaultDirectiveSuffix(entry) {
	return entry.suffix === null;
}
const context = X({
	client: Object.create(null),
	server: Object.create(null)
});
const directiveCallbacks = Object.create(null);
const directivePriorities = Object.create(null);
/**
* Registers a new directive type in the Interactivity API runtime.
*
* @example
* ```js
* directive(
*   'alert', // Name without the `data-wp-` prefix.
*   ( { directives: { alert }, element, evaluate } ) => {
*     const defaultEntry = alert.find( isDefaultDirectiveSuffix );
*     element.props.onclick = () => { alert( evaluate( defaultEntry ) ); }
*   }
* )
* ```
*
* The previous code registers a custom directive type for displaying an alert
* message whenever an element using it is clicked. The message text is obtained
* from the store under the inherited namespace, using `evaluate`.
*
* When the HTML is processed by the Interactivity API, any element containing
* the `data-wp-alert` directive will have the `onclick` event handler, e.g.,
*
* ```html
* <div data-wp-interactive="messages">
*   <button data-wp-alert="state.alert">Click me!</button>
* </div>
* ```
* Note that, in the previous example, the directive callback gets the path
* value (`state.alert`) from the directive entry with suffix `null`. A
* custom suffix can also be specified by appending `--` to the directive
* attribute, followed by the suffix, like in the following HTML snippet:
*
* ```html
* <div data-wp-interactive="myblock">
*   <button
*     data-wp-color--text="state.text"
*     data-wp-color--background="state.background"
*   >Click me!</button>
* </div>
* ```
*
* This could be an hypothetical implementation of the custom directive used in
* the snippet above.
*
* @example
* ```js
* directive(
*   'color', // Name without prefix and suffix.
*   ( { directives: { color: colors }, ref, evaluate } ) =>
*     colors.forEach( ( color ) => {
*       if ( color.suffix = 'text' ) {
*         ref.style.setProperty(
*           'color',
*           evaluate( color.text )
*         );
*       }
*       if ( color.suffix = 'background' ) {
*         ref.style.setProperty(
*           'background-color',
*           evaluate( color.background )
*         );
*       }
*     } );
*   }
* )
* ```
*
* @param name             Directive name, without the `data-wp-` prefix.
* @param callback         Function that runs the directive logic.
* @param options          Options object.
* @param options.priority Option to control the directive execution order. The
*                         lesser, the highest priority. Default is `10`.
*/
const directive = (name, callback, { priority = 10 } = {}) => {
	directiveCallbacks[name] = callback;
	directivePriorities[name] = priority;
};
const isInheritedMethod = (parent, key, value) => {
	if (typeof value !== "function" || parent === null || parent === void 0) return false;
	const obj = Object(parent);
	const target = getObjectFromProxy(obj);
	if (target && Object.prototype.hasOwnProperty.call(target, key)) return false;
	for (let proto = Object.getPrototypeOf(target ?? obj); proto !== null; proto = Object.getPrototypeOf(proto)) {
		const descriptor = Object.getOwnPropertyDescriptor(proto, key);
		if (descriptor) return target ? typeof descriptor.value === "function" : descriptor.value === value;
	}
	return false;
};
const resolve = (path, namespace) => {
	if (!namespace) {
		warn(`Namespace missing for "${path}". The value for that path won't be resolved.`);
		return;
	}
	const pathParts = path.split(".");
	if (isReservedKey(namespace) || pathParts.some(isReservedKey)) {
		warn(`The path "${path}" in the "${namespace}" namespace contains a reserved property name. The value for that path won't be resolved.`);
		return;
	}
	let resolvedStore = stores.get(namespace);
	if (typeof resolvedStore === "undefined") resolvedStore = store(namespace, {}, { lock: universalUnlock });
	const current = {
		...resolvedStore,
		context: getOwnProperty(getScope().context, namespace)
	};
	try {
		let parent;
		let value = current;
		for (const key of pathParts) {
			parent = value;
			value = value[key];
		}
		if (isInheritedMethod(parent, pathParts[pathParts.length - 1], value)) {
			warn(`The path "${path}" in the "${namespace}" namespace ends in an inherited method. The value for that path won't be resolved.`);
			return;
		}
		return value;
	} catch (e) {
		if (e === PENDING_GETTER) return PENDING_GETTER;
	}
};
/**
* Creates an evaluator bound to a directive scope.
*
* Returned functions restore the caller's scope when the wrapped call throws.
*
* @param args       Arguments used to bind the evaluator to a scope.
* @param args.scope Scope used to resolve directive values.
* @return An evaluator for directive entries.
*/
const getEvaluate = ({ scope }) => (entry) => {
	let { value: path, namespace } = entry;
	if (typeof path !== "string") throw new Error("The `value` prop should be a string path");
	const hasNegationOperator = path[0] === "!" && !!(path = path.slice(1));
	setScope(scope);
	const value = resolve(path, namespace);
	if (typeof value === "function") {
		if (hasNegationOperator) {
			warn(`The value of "${path}" is a function and cannot be negated. Please use derived state instead.`);
			resetScope();
			return;
		}
		resetScope();
		const wrappedFunction = (...functionArgs) => {
			setScope(scope);
			try {
				return value(...functionArgs);
			} finally {
				resetScope();
			}
		};
		if (value.sync) {
			const syncAwareFunction = wrappedFunction;
			syncAwareFunction.sync = true;
		}
		return wrappedFunction;
	}
	const result = value;
	resetScope();
	return hasNegationOperator && value !== PENDING_GETTER ? !result : result;
};
const getPriorityLevels = (directives) => {
	const byPriority = Object.keys(directives).reduce((obj, name) => {
		if (directiveCallbacks[name]) {
			const priority = directivePriorities[name];
			(obj[priority] = obj[priority] || []).push(name);
		}
		return obj;
	}, {});
	return Object.entries(byPriority).sort(([p1], [p2]) => parseInt(p1) - parseInt(p2)).map(([, arr]) => arr);
};
const Directives = ({ directives, priorityLevels: [currentPriorityLevel, ...nextPriorityLevels], element, originalProps, previousScope }) => {
	const scope = A({}).current;
	scope.evaluate = q(getEvaluate({ scope }), []);
	const { client, server } = x(context);
	scope.context = client;
	scope.serverContext = server;
	scope.ref = previousScope?.ref || A(null);
	element = W(element, { ref: scope.ref });
	scope.attributes = element.props;
	const children = nextPriorityLevels.length > 0 ? k$1(Directives, {
		directives,
		priorityLevels: nextPriorityLevels,
		element,
		originalProps,
		previousScope: scope
	}) : element;
	const props = {
		...originalProps,
		children
	};
	const directiveArgs = {
		directives,
		props,
		element,
		context,
		evaluate: scope.evaluate
	};
	setScope(scope);
	try {
		for (const directiveName of currentPriorityLevel) {
			const wrapper = directiveCallbacks[directiveName]?.(directiveArgs);
			if (wrapper !== void 0) props.children = wrapper;
		}
	} finally {
		resetScope();
	}
	return props.children;
};
const old = l$4.vnode;
l$4.vnode = (vnode) => {
	if (vnode.props.__directives && !isDirectiveMap(vnode.props.__directives)) delete vnode.props.__directives;
	if (vnode.props.__directives) {
		const props = vnode.props;
		const directives = props.__directives;
		if (directives.key) vnode.key = directives.key.find(isDefaultDirectiveSuffix).value;
		delete props.__directives;
		const priorityLevels = getPriorityLevels(directives);
		if (priorityLevels.length > 0) {
			vnode.props = {
				directives,
				priorityLevels,
				originalProps: props,
				type: vnode.type,
				element: k$1(vnode.type, props),
				top: true
			};
			vnode.type = Directives;
		}
	}
	if (old) old(vnode);
};

// packages/interactivity/build-module/directives/utils/restricted-bindings.mjs
/**
* Attributes that can be bound on an `object` element, besides `aria-*`
* attributes and `data-*` attributes other than directives.
*
* WordPress only allows an `object` element in post content when it has
* checked the values of its `data` and `type` attributes, which the runtime
* cannot repeat. Binding is therefore limited to attributes that cannot change
* what the element loads: `width`, `height`, and the global attributes KSES
* allows on any element, except that every `aria-*` attribute is allowed where
* KSES lists only some. A `data-wp-*` attribute is refused because it is a
* directive, which could bind `data` or `type` once rendered.
*
* The server enforces the same set when it processes directives, in
* `WP_Interactivity_API::data_wp_bind_processor()`, so both refuse the same
* bindings.
*/
const objectAttributes = /* @__PURE__ */ new Set([
	"class",
	"dir",
	"height",
	"hidden",
	"id",
	"lang",
	"role",
	"style",
	"tabindex",
	"title",
	"width"
]);
/**
* Checks whether an attribute can be bound on an element. Only `object`
* elements limit their bindings.
*
* @param type      Element type, as in the vDOM.
* @param attribute Name of the bound attribute.
* @return Whether the attribute can be bound.
*/
const isBindingAllowed = (type, attribute) => {
	if (typeof type !== "string" || type.toLowerCase() !== "object") return true;
	const name = attribute.toLowerCase();
	return objectAttributes.has(name) || name.startsWith("aria-") || name.startsWith("data-") && !name.startsWith("data-wp-");
};

// packages/interactivity/build-module/directives/utils/warnings.mjs
const warnSuffixNotSupported = (prefix, suffix) => {
	warn(`Suffixes for the data-wp-${prefix} directive are not supported. Ignoring the directive with suffix "${suffix}".`);
};
const warnEventNameWithTwoHyphens = (prefix, eventName) => {
	{
		const [event, ...rest] = eventName.split("--");
		warn(`The data-wp-${prefix}--${eventName} directive listens for an event named "${eventName}". Two-hyphen unique IDs are no longer supported. If you meant to add a unique ID, please use data-wp-${prefix}--${event}---${rest.join("--")} instead.`);
	}
};
const warnUniqueIdNotSupported = (prefix, uniqueId) => {
	warn(`Unique IDs are not supported for the data-wp-${prefix} directive. Ignoring the directive with unique ID "${uniqueId}".`);
};
const warnUnbindableProp = (suffix) => {
	warn(`The data-wp-bind directive can't set the "${suffix}" prop. Ignoring data-wp-bind--${suffix}.`);
};
const warnEventHandlerBindNotSupported = (attribute) => {
	warn(`Binding event handler attributes is not supported. Please use "data-wp-on--${attribute.slice(2)}" instead.`);
};
const warnWithSyncEvent = (wrongPrefix, rightPrefix) => {
	warn(`The usage of data-wp-${wrongPrefix} is deprecated and will stop working in WordPress 7.0. Please, use data-wp-${rightPrefix} with the withSyncEvent() helper from now on.`);
};

// packages/interactivity/build-module/directives/utils/url.mjs
/**
* Attributes whose value is a URL, and which therefore have to be checked
* before they are bound. Some of them, like `href` on an anchor or `action` on
* a form, execute a `javascript:` URL when the element is activated.
*
* This list mirrors wp_kses_uri_attributes() in PHP. It also includes some names
* that cannot be bound today, as hardening against future changes.
*/
const urlAttributes = /* @__PURE__ */ new Set([
	"action",
	"archive",
	"background",
	"cite",
	"classid",
	"codebase",
	"data",
	"formaction",
	"href",
	"icon",
	"longdesc",
	"manifest",
	"poster",
	"profile",
	"src",
	"usemap",
	"xlink:href",
	"xlinkhref",
	"xmlns"
]);
/**
* Matches a string whose URL scheme is `javascript`.
*
* @see https://url.spec.whatwg.org/#concept-basic-url-parser
*
* - Remove any leading and trailing C0 control or space from input.
* - Remove all ASCII tab or newline from input.
*
* Then check for a `javascript:` scheme.
*
* This check is inspired by React DOM's `sanitizeURL` function.
*
* @see https://github.com/react/react/blob/07dde64da1abd1525120b9ae49672386486e33c3/packages/react-dom-bindings/src/shared/sanitizeURL.js
*/
const isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
/**
* Gets the value to bind to a URL attribute.
*
* Null, undefined and booleans are returned as they are. Any other value is
* converted to a string once, and that string is both checked and returned, so
* the URL that is checked is the URL that is bound.
*
* @param value Value to bind.
* @return The value to bind, or null if it is a `javascript:` URL or cannot be
*         converted to a string.
*/
function getSafeUrl(value) {
	if (value === null || value === void 0 || typeof value === "boolean") return value;
	try {
		const url = String(value);
		return isJavaScriptProtocol.test(url) ? null : url;
	} catch {
		return null;
	}
}

// packages/interactivity/build-module/directives/bind.mjs
const internalProps = /* @__PURE__ */ new Set([
	"__directives",
	"children",
	"dangerouslysetinnerhtml"
]);
directive("bind", ({ directives: { bind }, element, evaluate }) => {
	bind.filter(isNonDefaultDirectiveSuffix).forEach((entry) => {
		if (entry.uniqueId) {
			warnUniqueIdNotSupported("bind", entry.uniqueId);
			return;
		}
		const attribute = entry.suffix;
		const name = attribute.toLowerCase();
		if (internalProps.has(name) || name === "content" && element.type === "template" || isReservedKey(attribute)) {
			warnUnbindableProp(attribute);
			return;
		}
		if (/^on/i.test(attribute)) {
			warnEventHandlerBindNotSupported(attribute);
			return;
		}
		if (!isBindingAllowed(element.type, attribute)) {
			warn(`The "${attribute}" attribute cannot be bound on an "object" element. The directive data-wp-bind--${attribute} was ignored.`);
			return;
		}
		if (attribute === "protocol" && (element.type === "a" || element.type === "area")) {
			delete element.props[attribute];
			return;
		}
		let result = evaluate(entry);
		if (result === PENDING_GETTER) return;
		if (typeof result === "function") result = result();
		if (urlAttributes.has(attribute.toLowerCase())) result = getSafeUrl(result);
		element.props[attribute] = result;
		useInit(() => {
			const el = element.ref.current;
			if (attribute === "style") {
				if (typeof result === "string") el.style.cssText = result;
				return;
			} else if (attribute !== "width" && attribute !== "height" && attribute !== "href" && attribute !== "list" && attribute !== "form" && attribute !== "tabIndex" && attribute !== "download" && attribute !== "rowSpan" && attribute !== "colSpan" && attribute !== "role" && attribute !== "popover" && attribute in el) try {
				el[attribute] = result === null || result === void 0 ? "" : result;
				return;
			} catch {}
			if (result !== null && result !== void 0 && (result !== false || attribute[4] === "-")) el.setAttribute(attribute, attribute === "popover" && result === true ? "" : result);
			else el.removeAttribute(attribute);
		});
	});
});

// packages/interactivity/build-module/directives/class.mjs
directive("class", ({ directives: { class: classNames }, element, evaluate }) => {
	classNames.filter(isNonDefaultDirectiveSuffix).forEach((entry) => {
		const className = entry.uniqueId ? `${entry.suffix}---${entry.uniqueId}` : entry.suffix;
		let result = evaluate(entry);
		if (result === PENDING_GETTER) return;
		if (typeof result === "function") result = result();
		const currentClass = typeof element.props.class === "string" ? element.props.class : "";
		const classFinder = new RegExp(`(^|\\s)${className}(\\s|$)`, "g");
		if (!result) element.props.class = currentClass.replace(classFinder, " ").trim();
		else if (!classFinder.test(currentClass)) element.props.class = currentClass ? `${currentClass} ${className}` : className;
		useInit(() => {
			if (!result) element.ref.current.classList.remove(className);
			else element.ref.current.classList.add(className);
		});
	});
});

// packages/interactivity/build-module/directives/context.mjs
init_preact_module();
directive("context", ({ directives: { context }, props: { children }, context: inheritedContext }) => {
	const entries = context.filter(isDefaultDirectiveSuffix).reverse();
	if (!entries.length) {
		warn("The usage of data-wp-context--unique-id (two hyphens) is not supported. To add a unique ID to the directive, please use data-wp-context---unique-id (three hyphens) instead.");
		return;
	}
	const { Provider } = inheritedContext;
	const { client: inheritedClient, server: inheritedServer } = x(inheritedContext);
	const client = A(Object.create(null));
	const server = Object.create(null);
	const result = {
		client: Object.assign(Object.create(null), inheritedClient),
		server: Object.assign(Object.create(null), inheritedServer)
	};
	const namespaces = /* @__PURE__ */ new Set();
	entries.forEach(({ value, namespace, uniqueId }) => {
		if (!isPlainObject(value)) {
			warn(`The value of data-wp-context${uniqueId ? `---${uniqueId}` : ""} on the ${namespace} namespace must be a valid stringified JSON object.`);
			return;
		}
		if (!getOwnProperty(client.current, namespace)) client.current[namespace] = proxifyState(namespace, {});
		deepMerge(client.current[namespace], deepClone(value), false);
		server[namespace] = value;
		namespaces.add(namespace);
	});
	namespaces.forEach((namespace) => {
		result.client[namespace] = proxifyContext(client.current[namespace], getOwnProperty(inheritedClient, namespace));
		result.server[namespace] = proxifyContext(server[namespace], getOwnProperty(inheritedServer, namespace));
	});
	return k$1(Provider, { value: result }, children);
}, { priority: 5 });

// packages/interactivity/build-module/directives/each.mjs
init_preact_module();
/**
* Obtains the given item key based on the passed `eachKey` entry. Used by the
* `wp-each` directive.
*
* The item key is computed using `getEvaluate` with a mocked scope simulating
* the specific context that inner directives will inherit, i.e., including the
* item under the corresponding item prop.
*
* @param inheritedValue Inherited context value.
* @param namespace      Namespace for the `wp-each` directive.
* @param item           Item from the list of items pointed by `wp-each`.
* @param itemProp       Prop in which the item is accessible from the context.
* @param eachKey        Directive entry pointing to the item's key.
* @return The evaluated key for the passed item.
*/
const evaluateItemKey = (inheritedValue, namespace, item, itemProp, eachKey) => {
	const clientContextWithItem = Object.assign(Object.create(null), inheritedValue.client, { [namespace]: {
		...getOwnProperty(inheritedValue.client, namespace),
		[itemProp]: item
	} });
	const scope = {
		...getScope(),
		context: clientContextWithItem,
		serverContext: inheritedValue.server
	};
	return eachKey ? getEvaluate({ scope })(eachKey) : item;
};
/**
* Generates an `Iterable` from the passed items that returns, for each item, a
* tuple with the item, its context and its evaluated key. Used by the `wp-each`
* directive.
*
* @param inheritedValue Inherited context value.
* @param namespace      Namespace for the `wp-each` directive.
* @param items          List of items pointed by `wp-each`.
* @param itemProp       Prop in which items are accessible from the context.
* @param eachKey        Directive entry pointing to the item's key.
* @return Generator that yields items along with their context and key.
*/
const useItemContexts = function* (inheritedValue, namespace, items, itemProp, eachKey) {
	const { current: itemContexts } = A(/* @__PURE__ */ new Map());
	for (const item of items) {
		const key = evaluateItemKey(inheritedValue, namespace, item, itemProp, eachKey);
		if (!itemContexts.has(key)) itemContexts.set(key, proxifyContext(proxifyState(namespace, { [itemProp]: void 0 }), getOwnProperty(inheritedValue.client, namespace)));
		yield [
			item,
			itemContexts.get(key),
			key
		];
	}
};
directive("each", ({ directives: { each, "each-key": eachKey }, context: inheritedContext, element, evaluate }) => {
	if (element.type !== "template") {
		warn("The data-wp-each directive can only be used on <template> elements.");
		return;
	}
	const { Provider } = inheritedContext;
	const inheritedValue = x(inheritedContext);
	const [entry] = each;
	const { namespace, suffix, uniqueId } = entry;
	if (each.length > 1) {
		warn("The usage of multiple data-wp-each directives on the same element is not supported. Please pick only one.");
		return;
	}
	if (uniqueId) {
		warnUniqueIdNotSupported("each", uniqueId);
		return;
	}
	let iterable = evaluate(entry);
	if (iterable === PENDING_GETTER) return;
	if (typeof iterable === "function") iterable = iterable();
	if (typeof iterable?.[Symbol.iterator] !== "function") return;
	const itemProp = suffix ? kebabToCamelCase(suffix) : "item";
	const result = [];
	const itemContexts = useItemContexts(inheritedValue, namespace, iterable, itemProp, eachKey?.[0]);
	for (const [item, itemContext, key] of itemContexts) {
		const mergedContext = {
			client: Object.assign(Object.create(null), inheritedValue.client, { [namespace]: itemContext }),
			server: Object.assign(Object.create(null), inheritedValue.server)
		};
		mergedContext.client[namespace][itemProp] = item;
		result.push(k$1(Provider, {
			value: mergedContext,
			key
		}, element.props.content));
	}
	return result;
}, { priority: 20 });
directive("each-child", ({ directives: { "each-child": eachChild }, element, evaluate }) => {
	const entry = eachChild.find(isDefaultDirectiveSuffix);
	if (!entry) return;
	return evaluate(entry) === PENDING_GETTER ? element : null;
}, { priority: 1 });

// packages/interactivity/build-module/html.mjs
/** Empty HTML accepted by HTML sinks, including under Trusted Types enforcement. */
const emptyHTML = globalThis.trustedTypes?.emptyHTML ?? "";
const trustedHtmlByToken = /* @__PURE__ */ new WeakMap();
/**
* Marks a string (or native `TrustedHTML`) as trusted so the `data-wp-html`
* directive renders it as markup. Other values empty the bound element,
* except pending values and the server's token representation, which keep
* its content.
*
* This function never sanitizes or otherwise processes the HTML passed
* here, the same responsibility you take on using `dangerouslySetInnerHTML`
* in React. Treating untrusted input as trusted is an XSS risk: never pass
* it raw, unescaped user input, and never pass it a `context` value
* directly. `context` is for selecting *which* trusted markup to show; the
* markup itself should come from `state`, computed by your own code from a
* source it trusts.
*
* The returned token is opaque and identity-based, not content-based: it
* carries no inspectable trace of the HTML it wraps. Adding it to
* `data-wp-context`, spreading it into a new object, or serializing it as
* JSON does not carry the "trusted" marker with it — only a `data-wp-html`
* reference that resolves directly to the exact value this function
* returned is ever rendered as HTML.
*
* This package creates no Trusted Types policy of its own. On a site that
* enforces Trusted Types, pass a `TrustedHTML` value from the site's own
* policy: `asDangerousHTML( policy.createHTML( markup ) )`. A rejected value
* empties the element.
*
* "Trusted" here only means the `data-wp-html` directive will render it and
* the Interactivity API won't process directives inside it. It's still live
* browser HTML once rendered. Content that isn't safe to render as HTML
* isn't made safe by this function.
*
* @param  html Raw HTML string, or a native `TrustedHTML` value from a
*              site-provided Trusted Types policy, to render.
*
* @throws {TypeError} If `html` is neither a string nor a native `TrustedHTML`
*                     value.
*
* @return An opaque token the `data-wp-html` directive recognizes as trusted HTML.
*
* @example
* ```js
* import { asDangerousHTML, store } from '@wordpress/interactivity';
*
* store( 'myPlugin', {
* 	state: {
* 		get description() {
* 			return asDangerousHTML(
* 				'<p>A <strong>formatted</strong> description.</p>'
* 			);
* 		},
* 	},
* } );
* ```
*/
function asDangerousHTML(html) {
	const { trustedTypes } = globalThis;
	if (typeof html !== "string" && !trustedTypes?.isHTML(html)) throw new TypeError("asDangerousHTML() expects a string or a native TrustedHTML value.");
	const token = Object.freeze(Object.create(null));
	trustedHtmlByToken.set(token, html);
	return token;
}
/**
* Checks whether a value was produced by `asDangerousHTML()`.
*
* @param value Value to check.
*
* @return Whether the value is a trusted HTML token.
*/
function isDangerousHTML(value) {
	return typeof value === "object" && value !== null && trustedHtmlByToken.has(value);
}
/**
* Retrieves the HTML value a trusted HTML token represents.
*
* @param token A token previously returned by `asDangerousHTML()`.
*
* @return The HTML value the token represents.
*/
function getDangerousHTML(token) {
	return trustedHtmlByToken.get(token);
}

// packages/interactivity/build-module/directives/html.mjs
/**
* Checks whether a value is `{ wpServerHtml: true }`, the server's
* representation of a trusted HTML token in the page's data.
*
* @param value Value to check.
*
* @return Whether the value is the server token representation.
*/
const isServerHTMLRepresentation = (value) => isPlainObject(value) && value.wpServerHtml === true;
/**
* Lists the HTML-namespace `<template>` elements of a fragment, in tree order,
* without those inside template contents.
*
* @param content The fragment to search.
*
* @return The template elements.
*/
const getTemplates = (content) => Array.from(content.querySelectorAll("template")).filter((template) => template.namespaceURI === "http://www.w3.org/1999/xhtml");
/**
* Checks whether two server content snapshots hold the same nodes: the same
* names, attributes and data, in the same order, at every depth. Unlike
* `isEqualNode()` alone, the contents of `<template>` elements are compared
* too.
*
* @param content A detached snapshot.
* @param other   Another detached snapshot.
*
* @return Whether the snapshots hold the same nodes.
*/
const isSameServerContent = (content, other) => {
	if (!content.isEqualNode(other)) return false;
	const otherTemplates = getTemplates(other);
	return getTemplates(content).every((template, index) => isSameServerContent(template.content, otherTemplates[index].content));
};
directive("html", ({ directives: { html: htmlEntries }, element, evaluate }) => {
	const entry = htmlEntries.find(isDefaultDirectiveSuffix);
	const lastAppliedKey = A(void 0);
	const previousHost = A(null);
	const previousInputs = A(null);
	const previousServerContent = A(void 0);
	const owedServerContent = A(void 0);
	const shownServerContent = A(void 0);
	const preactHtml = A();
	let result;
	if (!entry) warn("The usage of data-wp-html--suffix is not supported. Please use data-wp-html instead.");
	else if (entry.uniqueId) warnUniqueIdNotSupported("html", entry.uniqueId);
	else try {
		result = evaluate(entry);
		if (typeof result === "function") result = result();
	} catch {
		result = void 0;
	}
	const active = !!entry && !entry.uniqueId;
	const serverHTMLRepresentation = isServerHTMLRepresentation(result);
	const preserveContent = result === PENDING_GETTER || serverHTMLRepresentation;
	const trusted = isDangerousHTML(result);
	const resolvedValue = trusted ? getDangerousHTML(result) : emptyHTML;
	const fallback = getHtmlFallback(element);
	const serverContent = getHtmlServerContent(element);
	useLayoutEffect(() => {
		const node = element.ref.current;
		const hostChanged = previousHost.current !== node;
		const inputs = [
			result,
			active,
			preserveContent,
			serverHTMLRepresentation,
			trusted,
			resolvedValue,
			element.ref
		];
		const inputsChanged = previousInputs.current === null || inputs.some((input, index) => input !== previousInputs.current[index]);
		previousInputs.current = inputs;
		if (hostChanged) {
			previousHost.current = node;
			lastAppliedKey.current = void 0;
			owedServerContent.current = void 0;
			shownServerContent.current = preserveContent ? serverContent : void 0;
			if (active && preserveContent && !node.hasChildNodes() && fallback?.hasChildNodes()) node.append(node.ownerDocument.importNode(fallback, true));
		} else if (serverContent !== previousServerContent.current) {
			owedServerContent.current = serverContent;
			queueMicrotask(() => {
				afterNextFrame(() => {
					if (owedServerContent.current === serverContent) owedServerContent.current = void 0;
				});
			});
		}
		previousServerContent.current = serverContent;
		if (!active) return;
		const owed = owedServerContent.current;
		if (preserveContent && owed) {
			owedServerContent.current = void 0;
			if (!shownServerContent.current || !isSameServerContent(shownServerContent.current, owed)) node.replaceChildren(node.ownerDocument.importNode(owed, true));
			shownServerContent.current = owed;
			lastAppliedKey.current = void 0;
			return;
		}
		if (!hostChanged && !inputsChanged) return;
		if (preserveContent) {
			if (serverHTMLRepresentation) lastAppliedKey.current = void 0;
			return;
		}
		shownServerContent.current = void 0;
		if (!trusted && result !== null && result !== void 0) warn("data-wp-html: the value is not trusted HTML. Use asDangerousHTML() to explicitly trust the markup.");
		const key = String(resolvedValue);
		if (lastAppliedKey.current === key) return;
		if (lastAppliedKey.current === void 0 && node.innerHTML === key) {
			lastAppliedKey.current = key;
			return;
		}
		try {
			node.innerHTML = resolvedValue;
		} catch (error) {
			node.innerHTML = emptyHTML;
			warn(`data-wp-html: the browser rejected this HTML value, so the element was emptied. ${error}`);
		}
		lastAppliedKey.current = key;
	}, [
		result,
		active,
		preserveContent,
		serverHTMLRepresentation,
		trusted,
		resolvedValue,
		fallback,
		serverContent,
		element.ref,
		element
	]);
	if (active) {
		preactHtml.current ??= { __html: emptyHTML };
		element.props.dangerouslySetInnerHTML = preactHtml.current;
		element.props.children = void 0;
	}
});

// packages/interactivity/build-module/directives/init.mjs
directive("init", ({ directives: { init }, evaluate }) => {
	init.forEach((entry) => {
		if (entry.suffix !== null) {
			warnSuffixNotSupported("init", entry.suffix);
			return;
		}
		useInit(() => {
			let start;
			start = performance.now();
			let result = evaluate(entry);
			if (typeof result === "function") result = result();
			performance.measure(`interactivity api init ${entry.namespace}`, {
				start,
				end: performance.now(),
				detail: { devtools: { track: `IA: init ${entry.namespace}` } }
			});
			return result;
		});
	});
});

// packages/interactivity/build-module/directives/on.mjs
/**
* Wraps event object to warn about access of synchronous properties and methods.
*
* For all store actions attached to an event listener the event object is proxied via this function, unless the action
* uses the `withSyncEvent()` utility to indicate that it requires synchronous access to the event object.
*
* At the moment, the proxied event only emits warnings when synchronous properties or methods are being accessed. In
* the future this will be changed and result in an error. The current temporary behavior allows implementers to update
* their relevant actions to use `withSyncEvent()`.
*
* For additional context, see https://github.com/WordPress/gutenberg/issues/64944.
*
* @param event Event object.
* @return Proxied event object.
*/
function wrapEventAsync(event) {
	return new Proxy(event, { get(target, prop, receiver) {
		const value = target[prop];
		switch (prop) {
			case "currentTarget":
				warn(`Accessing the synchronous event.${prop} property in a store action without wrapping it in withSyncEvent() is deprecated and will stop working in WordPress 7.0. Please wrap the store action in withSyncEvent().`);
				break;
			case "preventDefault":
			case "stopImmediatePropagation":
			case "stopPropagation": warn(`Using the synchronous event.${prop}() function in a store action without wrapping it in withSyncEvent() is deprecated and will stop working in WordPress 7.0. Please wrap the store action in withSyncEvent().`);
		}
		if (value instanceof Function) return function(...args) {
			return value.apply(this === receiver ? target : this, args);
		};
		return value;
	} });
}
/**
* Creates a directive that adds an event listener to the global window or
* document object using the full directive suffix as its event name.
*
* @param type 'window' or 'document'
* @return Directive callback that manages the global event listener.
*/
const getGlobalEventDirective = (type) => {
	return ({ directives, evaluate }) => {
		directives[`on-${type}`].filter(isNonDefaultDirectiveSuffix).forEach((entry) => {
			const eventName = entry.suffix;
			if (eventName.includes("--")) warnEventNameWithTwoHyphens(`on-${type}`, eventName);
			useInit(() => {
				const cb = (event) => {
					const result = evaluate(entry);
					if (typeof result === "function") {
						if (!result?.sync) event = wrapEventAsync(event);
						result(event);
					}
				};
				const globalVar = type === "window" ? window : document;
				globalVar.addEventListener(eventName, cb);
				return () => globalVar.removeEventListener(eventName, cb);
			});
		});
	};
};
/**
* Creates a directive that adds an async event listener to the global window or
* document object.
*
* Unlike the synchronous directives, the deprecated async directives still cut
* the event name at `--`, so the legacy two-hyphen unique ID syntax keeps
* working until they are removed.
*
* @param type 'window' or 'document'
*/
const getGlobalAsyncEventDirective = (type) => {
	return ({ directives, evaluate }) => {
		directives[`on-async-${type}`].filter(isNonDefaultDirectiveSuffix).forEach((entry) => {
			warnWithSyncEvent(`on-async-${type}`, `on-${type}`);
			const eventName = entry.suffix.split("--", 1)[0];
			useInit(() => {
				const cb = async (event) => {
					await splitTask();
					const result = evaluate(entry);
					if (typeof result === "function") result(event);
				};
				const globalVar = type === "window" ? window : document;
				globalVar.addEventListener(eventName, cb, { passive: true });
				return () => globalVar.removeEventListener(eventName, cb);
			});
		});
	};
};
directive("on", ({ directives: { on }, element, evaluate }) => {
	const events = /* @__PURE__ */ new Map();
	on.filter(isNonDefaultDirectiveSuffix).forEach((entry) => {
		const eventType = entry.suffix;
		if (eventType.includes("--")) warnEventNameWithTwoHyphens("on", eventType);
		if (!events.has(eventType)) events.set(eventType, /* @__PURE__ */ new Set());
		events.get(eventType).add(entry);
	});
	events.forEach((entries, eventType) => {
		const existingHandler = element.props[`on${eventType}`];
		element.props[`on${eventType}`] = (event) => {
			if (existingHandler) existingHandler(event);
			entries.forEach((entry) => {
				let start;
				start = performance.now();
				const result = evaluate(entry);
				if (typeof result === "function") {
					if (!result?.sync) event = wrapEventAsync(event);
					result(event);
				}
				performance.measure(`interactivity api on ${entry.namespace}`, {
					start,
					end: performance.now(),
					detail: { devtools: { track: `IA: on ${entry.namespace}` } }
				});
			});
		};
	});
});
directive("on-async", ({ directives: { "on-async": onAsync }, element, evaluate }) => {
	warnWithSyncEvent("on-async", "on");
	const events = /* @__PURE__ */ new Map();
	onAsync.filter(isNonDefaultDirectiveSuffix).forEach((entry) => {
		const event = entry.suffix.split("--", 1)[0];
		if (!events.has(event)) events.set(event, /* @__PURE__ */ new Set());
		events.get(event).add(entry);
	});
	events.forEach((entries, eventType) => {
		const existingHandler = element.props[`on${eventType}`];
		element.props[`on${eventType}`] = (event) => {
			if (existingHandler) existingHandler(event);
			entries.forEach(async (entry) => {
				await splitTask();
				const result = evaluate(entry);
				if (typeof result === "function") result(event);
			});
		};
	});
});
directive("on-window", getGlobalEventDirective("window"));
directive("on-document", getGlobalEventDirective("document"));
directive("on-async-window", getGlobalAsyncEventDirective("window"));
directive("on-async-document", getGlobalAsyncEventDirective("document"));

// packages/interactivity/build-module/directives/router-region.mjs
init_preact_module();
/**
* Relates each router region with its current vDOM content. Used by the
* `router-region` directive.
*
* Keys are router region IDs, and values are signals with the corresponding
* VNode rendered inside. If the value is `null`, that means the regions should
* not be rendered. If the value is `undefined`, the region is already contained
* inside another router region and does not need to change its children.
*/
const routerRegions = /* @__PURE__ */ new Map();
directive("router-region", ({ directives: { "router-region": routerRegion } }) => {
	const entry = routerRegion.find(isDefaultDirectiveSuffix);
	if (!entry) return;
	if (entry.suffix) {
		warnSuffixNotSupported("router-region", entry.suffix);
		return;
	}
	if (entry.uniqueId) {
		warnUniqueIdNotSupported("router-region", entry.uniqueId);
		return;
	}
	const regionId = typeof entry.value === "string" ? entry.value : entry.value.id;
	if (!routerRegions.has(regionId)) routerRegions.set(regionId, d$3());
	const vdom = routerRegions.get(regionId).value;
	_$2(() => {
		if (vdom && typeof vdom.type !== "string") navigationContextSignal.value = navigationContextSignal.peek() + 1;
	}, [vdom]);
	if (vdom && typeof vdom.type !== "string") {
		const previousScope = getScope();
		return W(vdom, { previousScope });
	}
	return vdom;
}, { priority: 1 });

// packages/interactivity/build-module/directives/run.mjs
directive("run", ({ directives: { run }, evaluate }) => {
	run.forEach((entry) => {
		if (entry.suffix !== null) {
			warnSuffixNotSupported("run", entry.suffix);
			return;
		}
		let result = evaluate(entry);
		if (typeof result === "function") result = result();
		return result;
	});
});

// packages/interactivity/build-module/directives/style.mjs
const newRule = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g;
const ruleClean = /\/\*[^]*?\*\/|  +/g;
const ruleNewline = /\n+/g;
const empty = " ";
/**
* Converts a CSS declaration list, like the value of a `style` attribute, into
* an object that maps each property to its value.
*
* Only top-level `property: value;` declarations are read. Nested blocks are
* skipped, because a `style` attribute can't contain them. The returned object
* doesn't inherit from `Object.prototype`, so a property name can't reach an
* inherited value.
*
* Based on the parser by Cristian Bote (@cristianbote) for Goober.
* https://unpkg.com/browse/goober@2.1.13/src/core/astish.js
*
* @param val CSS string.
* @return CSS object.
*/
const cssStringToObject = (val) => {
	const result = Object.create(null);
	const css = val.replace(ruleClean, "");
	let depth = 0;
	let block;
	newRule.lastIndex = 0;
	while (block = newRule.exec(css)) if (block[4] !== void 0) depth = Math.max(0, depth - 1);
	else if (block[3] !== void 0) depth++;
	else if (depth === 0) result[block[1]] = block[2].replace(ruleNewline, empty).trim();
	return result;
};
/**
* Checks whether a value is an object that inherits from `Object.prototype` or
* has no prototype.
*
* @param value The value to check.
* @return Whether the value is such an object.
*/
const isStyleObject = (value) => {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
};
/**
* Copies the own enumerable data properties of an object into an object
* without a prototype. Accessor properties are skipped, so no getter runs.
*
* @param object The object to copy.
* @return The copy.
*/
const copyDataProperties = (object) => {
	const copy = Object.create(null);
	for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(object))) if (desc.enumerable && "value" in desc) copy[key] = desc.value;
	return copy;
};
directive("style", ({ directives: { style }, element, evaluate }) => {
	style.filter(isNonDefaultDirectiveSuffix).forEach((entry) => {
		if (entry.uniqueId) {
			warnUniqueIdNotSupported("style", entry.uniqueId);
			return;
		}
		const styleProp = entry.suffix;
		let result = evaluate(entry);
		if (result === PENDING_GETTER) return;
		if (typeof result === "function") result = result();
		if (typeof element.props.style === "string") element.props.style = cssStringToObject(element.props.style);
		else if (isStyleObject(element.props.style)) element.props.style = copyDataProperties(element.props.style);
		else element.props.style = Object.create(null);
		if (!result) delete element.props.style[styleProp];
		else element.props.style[styleProp] = result;
		useInit(() => {
			if (!result) element.ref.current.style.removeProperty(styleProp);
			else element.ref.current.style.setProperty(styleProp, result);
		});
	});
});

// packages/interactivity/build-module/directives/text.mjs
directive("text", ({ directives: { text }, element, evaluate }) => {
	const entries = text.filter(isDefaultDirectiveSuffix);
	if (!entries.length) {
		warn("The usage of data-wp-text--suffix is not supported. Please use data-wp-text instead.");
		return;
	}
	entries.forEach((entry) => {
		if (entry.uniqueId) {
			warnUniqueIdNotSupported("text", entry.uniqueId);
			return;
		}
		try {
			let result = evaluate(entry);
			if (result === PENDING_GETTER) return;
			if (typeof result === "function") result = result();
			element.props.children = typeof result === "object" ? null : result.toString();
		} catch {
			element.props.children = null;
		}
	});
});

// packages/interactivity/build-module/directives/watch.mjs
directive("watch", ({ directives: { watch }, evaluate }) => {
	watch.forEach((entry) => {
		if (entry.suffix !== null) {
			warnSuffixNotSupported("watch", entry.suffix);
			return;
		}
		useWatch(() => {
			let start;
			start = performance.now();
			let result = evaluate(entry);
			if (typeof result === "function") result = result();
			performance.measure(`interactivity api watch ${entry.namespace}`, {
				start,
				end: performance.now(),
				detail: { devtools: { track: `IA: watch ${entry.namespace}` } }
			});
			return result;
		});
	});
});

// packages/interactivity/build-module/hydration.mjs
init_preact_module();
const regionRootFragments = /* @__PURE__ */ new WeakMap();
const getRegionRootFragment = (regions) => {
	const region = Array.isArray(regions) ? regions[0] : regions;
	if (!region.parentElement) throw Error("The passed region should be an element with a parent.");
	if (!regionRootFragments.has(region)) regionRootFragments.set(region, createRootFragment(region.parentElement, regions));
	return regionRootFragments.get(region);
};
const initialVdom = /* @__PURE__ */ new WeakMap();
let resolveInitialVdom;
const initialVdomPromise = new Promise((resolve) => {
	resolveInitialVdom = resolve;
});
/**
* Hydrates the document's top-level interactive islands and initializes the
* router's initial vDOM. Islands without an interactive ancestor are selected
* before any hydration can change the document. Nested islands run only as part
* of their outer island's tree.
*
* @return A promise that resolves once all eligible islands are hydrated.
*/
const hydrateRegions = async () => {
	const nodes = [...document.querySelectorAll(`[data-wp-interactive]`)].filter((node) => !node.parentElement?.closest("[data-wp-interactive]"));
	for (const node of nodes) {
		await splitTask();
		const fragment = getRegionRootFragment(node);
		const vdom = toVdom(node);
		initialVdom.set(node, vdom);
		await splitTask();
		U(vdom, fragment);
	}
	resolveInitialVdom(initialVdom);
};

// node_modules/.store/preact@10.29.1-Z6mqfktFgyEx3dIpXJAnhg/node_modules/preact/devtools/dist/devtools.module.js
var i$1;
var init_devtools_module = __esmMin((() => {
	init_preact_module();
	;
	null != (i$1 = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : void 0) && i$1.__PREACT_DEVTOOLS__ && i$1.__PREACT_DEVTOOLS__.attachPreact("10.29.1", l$4, {
		Fragment: S,
		Component: C$1
	});
}));

// node_modules/.store/preact@10.29.1-Z6mqfktFgyEx3dIpXJAnhg/node_modules/preact/debug/dist/debug.module.js
var debug_module_exports = /* @__PURE__ */ __exportAll({
	getCurrentVNode: () => c,
	getDisplayName: () => a,
	getOwnerStack: () => f,
	resetPropWarnings: () => r
});
function r() {
	t = {};
}
function a(e) {
	return e.type === S ? "Fragment" : "function" == typeof e.type ? e.type.displayName || e.type.name : "string" == typeof e.type ? e.type : "#text";
}
function c() {
	return i.length > 0 ? i[i.length - 1] : null;
}
function u(e) {
	return "function" == typeof e.type && e.type != S;
}
function f(n) {
	for (var e = [n], o = n; null != o.__o;) e.push(o.__o), o = o.__o;
	return e.reduce(function(n, e) {
		n += "  in " + a(e);
		var o = e.__source;
		return o ? n += " (at " + o.fileName + ":" + o.lineNumber + ")" : l && console.warn("Add @babel/plugin-transform-react-jsx-source to get a more detailed component stack. Note that you should not add it to production builds of your App for bundle size reasons."), l = !1, n + "\n";
	}, "");
}
function p(n) {
	var e = [];
	return n.__k ? (n.__k.forEach(function(n) {
		n && "function" == typeof n.type ? e.push.apply(e, p(n)) : n && "string" == typeof n.type && e.push(n.type);
	}), e) : e;
}
function h(n) {
	return n ? "function" == typeof n.type ? null == n.__ ? null != n.__e && null != n.__e.parentNode ? n.__e.parentNode.localName : "" : h(n.__) : n.type : "";
}
function y(n) {
	return "table" === n || "tfoot" === n || "tbody" === n || "thead" === n || "td" === n || "tr" === n || "th" === n;
}
function w(n) {
	var e = n.props, o = a(n), t = "";
	for (var r in e) if (e.hasOwnProperty(r) && "children" !== r) {
		var i = e[r];
		"function" == typeof i && (i = "function " + (i.displayName || i.name) + "() {}"), i = Object(i) !== i || i.toString ? i + "" : Object.prototype.toString.call(i), t += " " + r + "=" + JSON.stringify(i);
	}
	var s = e.children;
	return "<" + o + t + (s && s.length ? ">..</" + o + ">" : " />");
}
var t, i, s, l, d$1, v, m, b;
var init_debug_module = __esmMin((() => {
	init_preact_module();
	init_devtools_module();
	t = {};
	i = [];
	s = [];
	l = !0;
	d$1 = "function" == typeof WeakMap;
	v = C$1.prototype.setState;
	C$1.prototype.setState = function(n, e) {
		return null == this.__v && null == this.state && console.warn("Calling \"this.setState\" inside the constructor of a component is a no-op and might be a bug in your application. Instead, set \"this.state = {}\" directly.\n\n" + f(c())), v.call(this, n, e);
	};
	m = /^(address|article|aside|blockquote|details|div|dl|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hgroup|hr|main|menu|nav|ol|p|pre|search|section|table|ul)$/;
	b = C$1.prototype.forceUpdate;
	C$1.prototype.forceUpdate = function(n) {
		return null == this.__v ? console.warn("Calling \"this.forceUpdate\" inside the constructor of a component is a no-op and might be a bug in your application.\n\n" + f(c())) : this.__P ?? console.warn("Can't call \"this.forceUpdate\" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.\n\n" + f(this.__v)), b.call(this, n);
	}, l$4.__m = function(n, e) {
		var o = n.type, t = e.map(function(n) {
			return n && n.localName;
		}).filter(Boolean);
		console.error("Expected a DOM node of type \"" + o + "\" but found \"" + t.join(", ") + "\" as available DOM-node(s), this is caused by the SSR'd HTML containing different DOM-nodes compared to the hydrated one.\n\n" + f(n));
	}, function() {
		(function() {
			var n = l$4.__b, o = l$4.diffed, t = l$4.__, r = l$4.vnode, a = l$4.__r;
			l$4.diffed = function(n) {
				u(n) && s.pop(), i.pop(), o && o(n);
			}, l$4.__b = function(e) {
				u(e) && i.push(e), n && n(e);
			}, l$4.__ = function(n, e) {
				s = [], t && t(n, e);
			}, l$4.vnode = function(n) {
				n.__o = s.length > 0 ? s[s.length - 1] : null, r && r(n);
			}, l$4.__r = function(n) {
				u(n) && s.push(n), a && a(n);
			};
		})();
		var n = !1, o = l$4.__b, r = l$4.diffed, c = l$4.vnode, l = l$4.__r, v = l$4.__e, b = l$4.__, g = l$4.__h, E = d$1 ? {
			useEffect: /* @__PURE__ */ new WeakMap(),
			useLayoutEffect: /* @__PURE__ */ new WeakMap(),
			lazyPropTypes: /* @__PURE__ */ new WeakMap()
		} : null, k = [];
		l$4.__e = function(n, e, o, t) {
			if (e && e.__c && "function" == typeof n.then) {
				var r = n;
				n = /* @__PURE__ */ new Error("Missing Suspense. The throwing component was: " + a(e));
				for (var i = e; i; i = i.__) if (i.__c && i.__c.__c) {
					n = r;
					break;
				}
				if (n instanceof Error) throw n;
			}
			try {
				(t = t || {}).componentStack = f(e), v(n, e, o, t), "function" != typeof n.then && setTimeout(function() {
					throw n;
				});
			} catch (n) {
				throw n;
			}
		}, l$4.__ = function(n, e) {
			if (!e) throw new Error("Undefined parent passed to render(), this is the second argument.\nCheck if the element is available in the DOM/has the correct id.");
			var o;
			switch (e.nodeType) {
				case 1:
				case 11:
				case 9:
					o = !0;
					break;
				default: o = !1;
			}
			if (!o) {
				var t = a(n);
				throw new Error("Expected a valid HTML node as a second argument to render.	Received " + e + " instead: render(<" + t + " />, " + e + ");");
			}
			b && b(n, e);
		}, l$4.__b = function(e) {
			var r = e.type;
			if (n = !0, void 0 === r) throw new Error("Undefined component passed to createElement()\n\nYou likely forgot to export your component or might have mixed up default and named imports" + w(e) + "\n\n" + f(e));
			if (null != r && "object" == typeof r) {
				if (void 0 !== r.__k && void 0 !== r.__e) throw new Error("Invalid type passed to createElement(): " + r + "\n\nDid you accidentally pass a JSX literal as JSX twice?\n\n  let My" + a(e) + " = " + w(r) + ";\n  let vnode = <My" + a(e) + " />;\n\nThis usually happens when you export a JSX literal and not the component.\n\n" + f(e));
				throw new Error("Invalid type passed to createElement(): " + (Array.isArray(r) ? "array" : r));
			}
			if (void 0 !== e.ref && "function" != typeof e.ref && "object" != typeof e.ref && !("$$typeof" in e)) throw new Error("Component's \"ref\" property should be a function, or an object created by createRef(), but got [" + typeof e.ref + "] instead\n" + w(e) + "\n\n" + f(e));
			if ("string" == typeof e.type) {
				for (var i in e.props) if ("o" === i[0] && "n" === i[1] && "function" != typeof e.props[i] && null != e.props[i]) throw new Error("Component's \"" + i + "\" property should be a function, but got [" + typeof e.props[i] + "] instead\n" + w(e) + "\n\n" + f(e));
			}
			if ("function" == typeof e.type && e.type.propTypes) {
				if ("Lazy" === e.type.displayName && E && !E.lazyPropTypes.has(e.type)) {
					var s = "PropTypes are not supported on lazy(). Use propTypes on the wrapped component itself. ";
					try {
						var c = e.type();
						E.lazyPropTypes.set(e.type, !0), console.warn(s + "Component wrapped in lazy() is " + a(c));
					} catch (n) {
						console.warn(s + "We will log the wrapped component's name once it is loaded.");
					}
				}
				var l = e.props;
				e.type.__f && delete (l = function(n, e) {
					for (var o in e) n[o] = e[o];
					return n;
				}({}, l)).ref, function(n, e, o, r, a) {
					Object.keys(n).forEach(function(o) {
						var i;
						try {
							i = n[o](e, o, r, "prop", null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
						} catch (n) {
							i = n;
						}
						i && !(i.message in t) && (t[i.message] = !0, console.error("Failed prop type: " + i.message + (a && "\n" + a() || "")));
					});
				}(e.type.propTypes, l, 0, a(e), function() {
					return f(e);
				});
			}
			o && o(e);
		};
		var T, _ = 0;
		l$4.__r = function(e) {
			l && l(e), n = !0;
			var o = e.__c;
			if (o === T ? _++ : _ = 1, _ >= 25) throw new Error("Too many re-renders. This is limited to prevent an infinite loop which may lock up your browser. The component causing this is: " + a(e));
			T = o;
		}, l$4.__h = function(e, o, t) {
			if (!e || !n) throw new Error("Hook can only be invoked from render methods.");
			g && g(e, o, t);
		};
		var O = function(n, e) {
			return {
				get: function() {
					var o = "get" + n + e;
					k && k.indexOf(o) < 0 && (k.push(o), console.warn("getting vnode." + n + " is deprecated, " + e));
				},
				set: function() {
					var o = "set" + n + e;
					k && k.indexOf(o) < 0 && (k.push(o), console.warn("setting vnode." + n + " is not allowed, " + e));
				}
			};
		}, I = {
			nodeName: O("nodeName", "use vnode.type"),
			attributes: O("attributes", "use vnode.props"),
			children: O("children", "use vnode.props.children")
		}, M = Object.create({}, I);
		l$4.vnode = function(n) {
			var e = n.props;
			if (null !== n.type && null != e && ("__source" in e || "__self" in e)) {
				var o = n.props = {};
				for (var t in e) {
					var r = e[t];
					"__source" === t ? n.__source = r : "__self" === t ? n.__self = r : o[t] = r;
				}
			}
			n.__proto__ = M, c && c(n);
		}, l$4.diffed = function(e) {
			var o, t = e.type, i = e.__;
			if (e.__k && e.__k.forEach(function(n) {
				if ("object" == typeof n && n && void 0 === n.type) {
					var o = Object.keys(n).join(",");
					throw new Error("Objects are not valid as a child. Encountered an object with the keys {" + o + "}.\n\n" + f(e));
				}
			}), e.__c === T && (_ = 0), "string" == typeof t && (y(t) || "p" === t || "a" === t || "button" === t)) {
				var s = h(i);
				if ("" !== s && y(t)) "table" === t && "td" !== s && y(s) ? console.error("Improper nesting of table. Your <table> should not have a table-node parent." + w(e) + "\n\n" + f(e)) : "thead" !== t && "tfoot" !== t && "tbody" !== t || "table" === s ? "tr" === t && "thead" !== s && "tfoot" !== s && "tbody" !== s ? console.error("Improper nesting of table. Your <tr> should have a <thead/tbody/tfoot> parent." + w(e) + "\n\n" + f(e)) : "td" === t && "tr" !== s ? console.error("Improper nesting of table. Your <td> should have a <tr> parent." + w(e) + "\n\n" + f(e)) : "th" === t && "tr" !== s && console.error("Improper nesting of table. Your <th> should have a <tr>." + w(e) + "\n\n" + f(e)) : console.error("Improper nesting of table. Your <thead/tbody/tfoot> should have a <table> parent." + w(e) + "\n\n" + f(e));
				else if ("p" === t) {
					var c = p(e).filter(function(n) {
						return m.test(n);
					});
					c.length && console.error("Improper nesting of paragraph. Your <p> should not have " + c.join(", ") + " as child-elements." + w(e) + "\n\n" + f(e));
				} else "a" !== t && "button" !== t || -1 !== p(e).indexOf(t) && console.error("Improper nesting of interactive content. Your <" + t + "> should not have other " + ("a" === t ? "anchor" : "button") + " tags as child-elements." + w(e) + "\n\n" + f(e));
			}
			if (n = !1, r && r(e), null != e.__k) for (var l = [], u = 0; u < e.__k.length; u++) {
				var d = e.__k[u];
				if (d && null != d.key) {
					var v = d.key;
					if (-1 !== l.indexOf(v)) {
						console.error("Following component has two or more children with the same key attribute: \"" + v + "\". This may cause glitches and misbehavior in rendering process. Component: \n\n" + w(e) + "\n\n" + f(e));
						break;
					}
					l.push(v);
				}
			}
			if (null != e.__c && null != e.__c.__H) {
				var b = e.__c.__H.__;
				if (b) for (var g = 0; g < b.length; g += 1) {
					var E = b[g];
					if (E.__H) {
						for (var k = 0; k < E.__H.length; k++) if ((o = E.__H[k]) != o) {
							var O = a(e);
							console.warn("Invalid argument passed to hook. Hooks should not be called with NaN in the dependency array. Hook index " + g + " in component " + O + " was called with NaN.");
						}
					}
				}
			}
		};
	}();
}));

// packages/interactivity/build-module/index.mjs
init_preact_module();
await Promise.resolve().then(() => (init_debug_module(), debug_module_exports));
const requiredConsent = "I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of WordPress.";
/**
* Returns the consent-gated private APIs used by internal consumers.
*
* @param lock Required acknowledgment of private API use.
* @return The private interactivity APIs.
*/
const privateApis = (lock) => {
	if (lock === requiredConsent) return {
		getRegionRootFragment,
		initialVdomPromise,
		toVdom,
		parseDirectiveName,
		parseDirectiveValue,
		getInteractiveNamespace,
		directive,
		getNamespace,
		h: k$1,
		cloneElement: W,
		render: R,
		proxifyState,
		parseServerData,
		populateServerData,
		batch: r$1,
		routerRegions,
		deepReadOnly,
		navigationSignal,
		sessionId,
		warn,
		afterNextFrame,
		getScope,
		/** Runs a callback without a directive scope and restores the caller's stack. */
		runWithoutScope
	};
	throw new Error("Forbidden access.");
};
populateServerData(parseServerData());
onDOMReady(hydrateRegions);
window.history.replaceState({
	...window.history.state,
	wpInteractivityId: sessionId
}, "");
window.addEventListener("popstate", (event) => {
	if (event.state !== null && event.state?.wpInteractivityId !== sessionId) window.location.reload();
});

export { asDangerousHTML, getConfig, getContext, getElement, getServerContext, getServerState, privateApis, splitTask, store, useCallback, useEffect, useInit, useLayoutEffect, useMemo, A as useRef, d as useState, useWatch, watch, withScope, withSyncEvent };
//# sourceMappingURL=index.js.map