import { getConfig, privateApis, store } from "@wordpress/interactivity";

// packages/interactivity-router/build-module/html-directive-element.mjs
/** The runtime's directive attribute name parser for internal consumers. */
const { parseDirectiveName } = privateApis("I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of WordPress.");
/** Prefix of attributes eligible for directive name parsing in `toVdom()`. */
const directivePrefix = "data-wp-";
/**
* Finds the closest element, starting with `element` itself, whose content is
* inert `data-wp-html` content.
*
* Inside an interactive region, this mirrors `toVdom()`: the element has a
* `data-wp-html` entry without a suffix (as parsed by `parseDirectiveName()`;
* a unique ID is allowed), and no `data-wp-text`, `data-wp-each` or
* `data-wp-router-region` entry with any suffix or unique ID. Keep both in
* sync; `test/html-directive-element.jsdom.test.ts` compares them.
*
* @param element The element to start from, or null.
* @return The closest such element, or null when there is none.
*/
function closestHtmlDirectiveElement(element) {
	for (let current = element; current; current = current.parentElement) {
		if (!current.closest("[data-wp-interactive]")) return null;
		let hasDefaultHtmlDirective = false;
		let hasConflict = false;
		for (const { name } of current.attributes) {
			if (!name[8] || !name.startsWith(directivePrefix)) continue;
			const parsed = parseDirectiveName(name);
			if (!parsed) continue;
			const { prefix, suffix } = parsed;
			if (prefix === "html" && suffix === null) hasDefaultHtmlDirective = true;
			if ([
				"text",
				"each",
				"router-region"
			].includes(prefix)) hasConflict = true;
		}
		if (hasDefaultHtmlDirective && !hasConflict) return current;
	}
	return null;
}

// packages/interactivity-router/build-module/assets/scs.mjs
/**
* Calculates the Shortest Common Supersequence (SCS) of two sequences.
*
* A supersequence is a sequence that contains both input sequences as subsequences.
* The shortest common supersequence is the shortest possible such sequence.
*
* This implementation uses dynamic programming with a time complexity of O(mn)
* and space complexity of O(mn), where m and n are the lengths of sequences X and Y.
*
* @example
* ```ts
* const seq1 = [1, 3, 5];
* const seq2 = [2, 3, 4];
* const scs = shortestCommonSupersequence(seq1, seq2); // [1, 2, 3, 4, 5]
* ```
*
* @param X       The first sequence.
* @param Y       The second sequence.
* @param isEqual Optional equality function to compare elements.
*                Defaults to strict equality (===).
* @return The shortest common supersequence of X and Y.
*/
function shortestCommonSupersequence(X, Y, isEqual = (a, b) => a === b) {
	const m = X.length;
	const n = Y.length;
	const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
	for (let i = 0; i <= m; i++) dp[i][0] = X.slice(0, i);
	for (let j = 0; j <= n; j++) dp[0][j] = Y.slice(0, j);
	for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) if (isEqual(X[i - 1], Y[j - 1])) dp[i][j] = dp[i - 1][j - 1].concat(X[i - 1]);
	else {
		const option1 = dp[i - 1][j].concat(X[i - 1]);
		const option2 = dp[i][j - 1].concat(Y[j - 1]);
		dp[i][j] = option1.length <= option2.length ? option1 : option2;
	}
	return dp[m][n];
}

// packages/interactivity-router/build-module/assets/styles.mjs
/**
* Compares the passed style or link elements to check if they can be
* considered equal.
*
* @param a `<style>` or `<link>` element.
* @param b `<style>` or `<link>` element.
* @return Whether they are considered equal.
*/
const areNodesEqual = (a, b) => a.isEqualNode(b);
/**
* Normalizes the passed style or link element, reverting the changes
* made by {@link prepareStylePromise|`prepareStylePromise`} to the
* `data-original-media` and `media`.
*
* @example
* The following elements should be normalized to the same element:
* ```html
* <link rel="stylesheet" src="./assets/styles.css">
* <link rel="stylesheet" src="./assets/styles.css" media="all">
* <link rel="stylesheet" src="./assets/styles.css" media="preload">
* <link rel="stylesheet" src="./assets/styles.css" media="preload" data-original-media="all">
* ```
*
* @param element `<style>` or `<link>` element.
* @return Normalized node.
*/
const normalizeMedia = (element) => {
	element = element.cloneNode(true);
	const media = element.media;
	const { originalMedia } = element.dataset;
	if (media === "preload") {
		element.media = originalMedia || "all";
		element.removeAttribute("data-original-media");
	} else if (!element.media) element.media = "all";
	return element;
};
/**
* Adds the minimum style elements from Y around those in X using a
* shortest common supersequence algorithm, returning a list of
* promises for all the elements in Y.
*
* If X is empty, it appends all elements in Y to the passed parent
* element or to `document.head` instead.
*
* The returned promises resolve once the corresponding style element
* is loaded and ready. Those elements that are also in X return a
* cached promise.
*
* The algorithm ensures that the final style elements present in the
* document (or the passed `parent` element) are in the correct order
* and they are included in either X or Y.
*
* @param X      Base list of style elements.
* @param Y      List of style elements.
* @param parent Optional parent element to append to the new style elements.
* @return List of promises that resolve once the elements in Y are ready.
*/
function updateStylesWithSCS(X, Y, parent = window.document.head) {
	if (X.length === 0) return Y.map((element) => {
		const promise = prepareStylePromise(element);
		parent.appendChild(element);
		return promise;
	});
	const xNormalized = X.map(normalizeMedia);
	const yNormalized = Y.map(normalizeMedia);
	const scs = shortestCommonSupersequence(xNormalized, yNormalized, areNodesEqual);
	const xLength = X.length;
	const yLength = Y.length;
	const promises = [];
	let last = X[xLength - 1];
	let xIndex = 0;
	let yIndex = 0;
	for (const scsElement of scs) {
		const xElement = X[xIndex];
		const yElement = Y[yIndex];
		const xNormEl = xNormalized[xIndex];
		const yNormEl = yNormalized[yIndex];
		if (xIndex < xLength && areNodesEqual(xNormEl, scsElement)) {
			if (yIndex < yLength && areNodesEqual(yNormEl, scsElement)) {
				promises.push(prepareStylePromise(xElement));
				yIndex++;
			}
			xIndex++;
		} else {
			promises.push(prepareStylePromise(yElement));
			if (xIndex < xLength) xElement.before(yElement);
			else {
				last.after(yElement);
				last = yElement;
			}
			yIndex++;
		}
	}
	return promises;
}
/**
* Cache of promises per style elements.
*
* Each style element has their own associated `Promise` that resolves
* once the element has been loaded and is ready.
*/
const stylePromiseCache = /* @__PURE__ */ new WeakMap();
/**
* Prepares and returns the corresponding `Promise` for the passed style
* element.
*
* It returns the cached promise if it exists. Otherwise, constructs
* a `Promise` that resolves once the element has finished loading.
*
* For those elements that are not in the DOM yet, this function
* injects a `media="preload"` attribute to the passed element so the
* style is loaded without applying any styles to the document.
*
* @param element Style element.
* @return The associated `Promise` to the passed element.
*/
const prepareStylePromise = (element) => {
	if (stylePromiseCache.has(element)) return stylePromiseCache.get(element);
	if (window.document.contains(element) && element.media !== "preload") {
		const promise = Promise.resolve(element);
		stylePromiseCache.set(element, promise);
		return promise;
	}
	if (element.hasAttribute("media") && element.media !== "all") element.dataset.originalMedia = element.media;
	element.media = "preload";
	if (element instanceof HTMLStyleElement) {
		const promise = Promise.resolve(element);
		stylePromiseCache.set(element, promise);
		return promise;
	}
	const promise = new Promise((resolve, reject) => {
		element.addEventListener("load", () => resolve(element));
		element.addEventListener("error", (event) => {
			const { href } = event.target;
			reject(Error(`The style sheet with the following URL failed to load: ${href}`));
		});
	});
	stylePromiseCache.set(element, promise);
	return promise;
};
/**
* Prepares all style elements contained in the passed document.
*
* This function calls {@link updateStylesWithSCS|`updateStylesWithSCS`}
* to insert only the minimum amount of style elements into the DOM, so
* those present in the passed document end up in the DOM while the order
* is respected.
*
* New appended style elements contain a `media=preload` attribute to
* make them effectively disabled until they are applied with the
* {@link applyStyles|`applyStyles`} function.
*
* Note that this function alters the passed document, as it can transfer
* nodes from it to the global document.
*
* @param doc Document instance.
* @return A list of promises for each style element in the passed document.
*/
const preloadStyles = (doc) => {
	return updateStylesWithSCS(Array.from(window.document.querySelectorAll("style,link[rel=stylesheet]")), Array.from(doc.querySelectorAll("style,link[rel=stylesheet]")));
};
/**
* Traverses all style elements in the DOM, enabling only those included
* in the passed list and disabling the others.
*
* If the style element has the `data-original-media` attribute, the
* original `media` value is restored.
*
* @param styles List of style elements to apply.
*/
const applyStyles = (styles) => {
	window.document.querySelectorAll("style,link[rel=stylesheet]").forEach((el) => {
		if (el.sheet) {
			if (styles.includes(el)) {
				if (el.sheet.media.mediaText === "preload") {
					const { originalMedia = "all" } = el.dataset;
					el.sheet.media.mediaText = originalMedia;
				}
				el.sheet.disabled = false;
			} else el.sheet.disabled = true;
		}
	});
};

// packages/interactivity-router/build-module/assets/dynamic-importmap/resolver.mjs
/**
* This code is derived from the following projects:
*
* 1. dynamic-importmap (https://github.com/keller-mark/dynamic-importmap)
* 2. es-module-shims (https://github.com/guybedford/es-module-shims)
*
* The original implementation was created by Guy Bedford in es-module-shims,
* then adapted by Mark Keller in dynamic-importmap, and further modified
* for use in this project.
*
* Both projects are licensed under the MIT license.
*
* MIT License: https://opensource.org/licenses/MIT
*/
const backslashRegEx = /\\/g;
function isURL(url) {
	if (url.indexOf(":") === -1) return false;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
function resolveIfNotPlainOrUrl(relUrl, parentUrl) {
	const hIdx = parentUrl.indexOf("#"), qIdx = parentUrl.indexOf("?");
	if (hIdx + qIdx > -2) parentUrl = parentUrl.slice(0, hIdx === -1 ? qIdx : qIdx === -1 || qIdx > hIdx ? hIdx : qIdx);
	if (relUrl.indexOf("\\") !== -1) relUrl = relUrl.replace(backslashRegEx, "/");
	if (relUrl[0] === "/" && relUrl[1] === "/") return parentUrl.slice(0, parentUrl.indexOf(":") + 1) + relUrl;
	else if (relUrl[0] === "." && (relUrl[1] === "/" || relUrl[1] === "." && (relUrl[2] === "/" || relUrl.length === 2 && (relUrl += "/")) || relUrl.length === 1 && (relUrl += "/")) || relUrl[0] === "/") {
		const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(":") + 1);
		let pathname;
		if (parentUrl[parentProtocol.length + 1] === "/") {
			if (parentProtocol !== "file:") {
				pathname = parentUrl.slice(parentProtocol.length + 2);
				pathname = pathname.slice(pathname.indexOf("/") + 1);
			} else pathname = parentUrl.slice(8);
		} else pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === "/"));
		if (relUrl[0] === "/") return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;
		const segmented = pathname.slice(0, pathname.lastIndexOf("/") + 1) + relUrl;
		const output = [];
		let segmentIndex = -1;
		for (let i = 0; i < segmented.length; i++) {
			if (segmentIndex !== -1) {
				if (segmented[i] === "/") {
					output.push(segmented.slice(segmentIndex, i + 1));
					segmentIndex = -1;
				}
				continue;
			} else if (segmented[i] === ".") {
				if (segmented[i + 1] === "." && (segmented[i + 2] === "/" || i + 2 === segmented.length)) {
					output.pop();
					i += 2;
					continue;
				} else if (segmented[i + 1] === "/" || i + 1 === segmented.length) {
					i += 1;
					continue;
				}
			}
			while (segmented[i] === "/") i++;
			segmentIndex = i;
		}
		if (segmentIndex !== -1) output.push(segmented.slice(segmentIndex));
		return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join("");
	}
}
function resolveUrl(relUrl, parentUrl) {
	return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (isURL(relUrl) ? relUrl : resolveIfNotPlainOrUrl("./" + relUrl, parentUrl));
}
function getMatch(path, matchObj) {
	if (matchObj[path]) return path;
	let sepIndex = path.length;
	do {
		const segment = path.slice(0, sepIndex + 1);
		if (segment in matchObj) return segment;
	} while ((sepIndex = path.lastIndexOf("/", sepIndex - 1)) !== -1);
}
function applyPackages(id, packages) {
	const pkgName = getMatch(id, packages);
	if (pkgName) {
		const pkg = packages[pkgName];
		if (pkg === null) return;
		return pkg + id.slice(pkgName.length);
	}
}
function resolveImportMap(importMap, resolvedOrPlain, parentUrl) {
	let scopeUrl = parentUrl && getMatch(parentUrl, importMap.scopes);
	while (scopeUrl) {
		const packageResolution = applyPackages(resolvedOrPlain, importMap.scopes[scopeUrl]);
		if (packageResolution) return packageResolution;
		scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf("/")), importMap.scopes);
	}
	return applyPackages(resolvedOrPlain, importMap.imports) || resolvedOrPlain.indexOf(":") !== -1 && resolvedOrPlain;
}
function resolveAndComposePackages(packages, outPackages, baseUrl, parentMap) {
	for (const p in packages) {
		const resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
		const target = packages[p];
		if (typeof target !== "string") continue;
		const mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(target, baseUrl) || target, baseUrl);
		if (mapped) {
			outPackages[resolvedLhs] = mapped;
			continue;
		}
	}
}
function resolveAndComposeImportMap(json, baseUrl, parentMap) {
	const outMap = {
		imports: Object.assign({}, parentMap.imports),
		scopes: Object.assign({}, parentMap.scopes)
	};
	if (json.imports) resolveAndComposePackages(json.imports, outMap.imports, baseUrl, parentMap);
	if (json.scopes) for (const s in json.scopes) {
		const resolvedScope = resolveUrl(s, baseUrl);
		resolveAndComposePackages(json.scopes[s], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, parentMap);
	}
	return outMap;
}
let importMap = {
	imports: {},
	scopes: {}
};
const pageBaseUrl$1 = document.baseURI;
/**
* Extends the internal dynamic import map with the passed one.
*
* @param importMapIn         Import map.
* @param importMapIn.imports Imports declaration.
* @param importMapIn.scopes  Scopes declaration.
*/
function addImportMap(importMapIn) {
	importMap = resolveAndComposeImportMap(importMapIn, pageBaseUrl$1, importMap);
}
/**
* Resolves the URL of the passed module ID against the current internal
* dynamic import map.
*
* @param id        Module ID.
* @param parentUrl Parent URL, in case the module ID is relative.
* @return Resolved module URL.
*/
function resolve(id, parentUrl) {
	const urlResolved = resolveIfNotPlainOrUrl(id, parentUrl);
	return resolveImportMap(importMap, urlResolved || id, parentUrl) || id;
}

// node_modules/.store/es-module-lexer@1.7.0-gHi57fYnqFW7Bwxoq90PCA/node_modules/es-module-lexer/dist/lexer.asm.js
let e;
let a;
let r;
let i = 2 << 19;
const s = 1 === new Uint8Array(new Uint16Array([1]).buffer)[0] ? function(e, a) {
	const r = e.length;
	let i = 0;
	for (; i < r;) a[i] = e.charCodeAt(i++);
} : function(e, a) {
	const r = e.length;
	let i = 0;
	for (; i < r;) {
		const r = e.charCodeAt(i);
		a[i++] = (255 & r) << 8 | r >>> 8;
	}
};
const f = "xportmportlassforetaourceeferromsyncunctionssertvoyiedelecontininstantybreareturdebuggeawaithrwhileifcatcfinallels";
let t;
let c;
let n;
function parse(k, l = "@") {
	t = k, c = l;
	const u = 2 * t.length + (2 << 18);
	if (u > i || !e) {
		for (; u > i;) i *= 2;
		a = new ArrayBuffer(i), s(f, new Uint16Array(a, 16, 114)), e = function(e, a, r) {
			"use asm";
			var i = new e.Int8Array(r), s = new e.Int16Array(r), f = new e.Int32Array(r), t = new e.Uint8Array(r);
			new e.Uint16Array(r);
			var n = 1040;
			function b() {
				var e = 0, a = 0, r = 0, t = 0, c = 0, b = 0, u = 0;
				u = n;
				n = n + 10240 | 0;
				i[812] = 1;
				i[811] = 0;
				s[403] = 0;
				s[404] = 0;
				f[71] = f[2];
				i[813] = 0;
				f[70] = 0;
				i[810] = 0;
				f[72] = u + 2048;
				f[73] = u;
				i[814] = 0;
				e = (f[3] | 0) + -2 | 0;
				f[74] = e;
				a = e + (f[68] << 1) | 0;
				f[75] = a;
				e: while (1) {
					r = e + 2 | 0;
					f[74] = r;
					if (e >>> 0 >= a >>> 0) {
						t = 18;
						break;
					}
					a: do
						switch (s[r >> 1] | 0) {
							case 9:
							case 10:
							case 11:
							case 12:
							case 13:
							case 32: break;
							case 101:
								if ((((s[404] | 0) == 0 ? H(r) | 0 : 0) ? (m(e + 4 | 0, 16, 10) | 0) == 0 : 0) ? (k(), (i[812] | 0) == 0) : 0) {
									t = 9;
									break e;
								} else t = 17;
								break;
							case 105:
								if (H(r) | 0 ? (m(e + 4 | 0, 26, 10) | 0) == 0 : 0) {
									l();
									t = 17;
								} else t = 17;
								break;
							case 59:
								t = 17;
								break;
							case 47: switch (s[e + 4 >> 1] | 0) {
								case 47:
									P();
									break a;
								case 42:
									y(1);
									break a;
								default:
									t = 16;
									break e;
							}
							default:
								t = 16;
								break e;
						}
					while (0);
					if ((t | 0) == 17) {
						t = 0;
						f[71] = f[74];
					}
					e = f[74] | 0;
					a = f[75] | 0;
				}
				if ((t | 0) == 9) {
					e = f[74] | 0;
					f[71] = e;
					t = 19;
				} else if ((t | 0) == 16) {
					i[812] = 0;
					f[74] = e;
					t = 19;
				} else if ((t | 0) == 18) if (!(i[810] | 0)) {
					e = r;
					t = 19;
				} else e = 0;
				do
					if ((t | 0) == 19) {
						e: while (1) {
							a = e + 2 | 0;
							f[74] = a;
							if (e >>> 0 >= (f[75] | 0) >>> 0) {
								t = 92;
								break;
							}
							a: do
								switch (s[a >> 1] | 0) {
									case 9:
									case 10:
									case 11:
									case 12:
									case 13:
									case 32: break;
									case 101:
										if (((s[404] | 0) == 0 ? H(a) | 0 : 0) ? (m(e + 4 | 0, 16, 10) | 0) == 0 : 0) {
											k();
											t = 91;
										} else t = 91;
										break;
									case 105:
										if (H(a) | 0 ? (m(e + 4 | 0, 26, 10) | 0) == 0 : 0) {
											l();
											t = 91;
										} else t = 91;
										break;
									case 99:
										if ((H(a) | 0 ? (m(e + 4 | 0, 36, 8) | 0) == 0 : 0) ? V(s[e + 12 >> 1] | 0) | 0 : 0) {
											i[814] = 1;
											t = 91;
										} else t = 91;
										break;
									case 40:
										r = f[72] | 0;
										e = s[404] | 0;
										t = e & 65535;
										f[r + (t << 3) >> 2] = 1;
										a = f[71] | 0;
										s[404] = e + 1 << 16 >> 16;
										f[r + (t << 3) + 4 >> 2] = a;
										t = 91;
										break;
									case 41:
										a = s[404] | 0;
										if (!(a << 16 >> 16)) {
											t = 36;
											break e;
										}
										r = a + -1 << 16 >> 16;
										s[404] = r;
										t = s[403] | 0;
										a = t & 65535;
										if (t << 16 >> 16 != 0 ? (f[(f[72] | 0) + ((r & 65535) << 3) >> 2] | 0) == 5 : 0) {
											a = f[(f[73] | 0) + (a + -1 << 2) >> 2] | 0;
											r = a + 4 | 0;
											if (!(f[r >> 2] | 0)) f[r >> 2] = (f[71] | 0) + 2;
											f[a + 12 >> 2] = e + 4;
											s[403] = t + -1 << 16 >> 16;
											t = 91;
										} else t = 91;
										break;
									case 123:
										t = f[71] | 0;
										r = f[65] | 0;
										e = t;
										do
											if ((s[t >> 1] | 0) == 41 & (r | 0) != 0 ? (f[r + 4 >> 2] | 0) == (t | 0) : 0) {
												a = f[66] | 0;
												f[65] = a;
												if (!a) {
													f[61] = 0;
													break;
												} else {
													f[a + 32 >> 2] = 0;
													break;
												}
											}
										while (0);
										r = f[72] | 0;
										a = s[404] | 0;
										t = a & 65535;
										f[r + (t << 3) >> 2] = (i[814] | 0) == 0 ? 2 : 6;
										s[404] = a + 1 << 16 >> 16;
										f[r + (t << 3) + 4 >> 2] = e;
										i[814] = 0;
										t = 91;
										break;
									case 125:
										e = s[404] | 0;
										if (!(e << 16 >> 16)) {
											t = 49;
											break e;
										}
										r = f[72] | 0;
										t = e + -1 << 16 >> 16;
										s[404] = t;
										if ((f[r + ((t & 65535) << 3) >> 2] | 0) == 4) {
											h();
											t = 91;
										} else t = 91;
										break;
									case 39:
										v(39);
										t = 91;
										break;
									case 34:
										v(34);
										t = 91;
										break;
									case 47: switch (s[e + 4 >> 1] | 0) {
										case 47:
											P();
											break a;
										case 42:
											y(1);
											break a;
										default:
											e = f[71] | 0;
											a = s[e >> 1] | 0;
											r: do
												if (!(U(a) | 0)) if (a << 16 >> 16 == 41) {
													r = s[404] | 0;
													if (!(D(f[(f[72] | 0) + ((r & 65535) << 3) + 4 >> 2] | 0) | 0)) t = 65;
												} else t = 64;
												else switch (a << 16 >> 16) {
													case 46: if (((s[e + -2 >> 1] | 0) + -48 & 65535) < 10) {
														t = 64;
														break r;
													} else break r;
													case 43: if ((s[e + -2 >> 1] | 0) == 43) {
														t = 64;
														break r;
													} else break r;
													case 45: if ((s[e + -2 >> 1] | 0) == 45) {
														t = 64;
														break r;
													} else break r;
													default: break r;
												}
											while (0);
											if ((t | 0) == 64) {
												r = s[404] | 0;
												t = 65;
											}
											r: do
												if ((t | 0) == 65) {
													t = 0;
													if (r << 16 >> 16 != 0 ? (c = f[72] | 0, b = (r & 65535) + -1 | 0, a << 16 >> 16 == 102 ? (f[c + (b << 3) >> 2] | 0) == 1 : 0) : 0) {
														if ((s[e + -2 >> 1] | 0) == 111 ? $(f[c + (b << 3) + 4 >> 2] | 0, 44, 3) | 0 : 0) break;
													} else t = 69;
													if ((t | 0) == 69 ? a << 16 >> 16 == 125 : 0) {
														t = f[72] | 0;
														r = r & 65535;
														if (p(f[t + (r << 3) + 4 >> 2] | 0) | 0) break;
														if ((f[t + (r << 3) >> 2] | 0) == 6) break;
													}
													if (!(o(e) | 0)) {
														switch (a << 16 >> 16) {
															case 0: break r;
															case 47: if (i[813] | 0) break r;
														}
														t = f[67] | 0;
														if ((t | 0 ? e >>> 0 >= (f[t >> 2] | 0) >>> 0 : 0) ? e >>> 0 <= (f[t + 4 >> 2] | 0) >>> 0 : 0) {
															g();
															i[813] = 0;
															t = 91;
															break a;
														}
														r = f[3] | 0;
														do {
															if (e >>> 0 <= r >>> 0) break;
															e = e + -2 | 0;
															f[71] = e;
															a = s[e >> 1] | 0;
														} while (!(E(a) | 0));
														if (F(a) | 0) {
															do {
																if (e >>> 0 <= r >>> 0) break;
																e = e + -2 | 0;
																f[71] = e;
															} while (F(s[e >> 1] | 0) | 0);
															if (j(e) | 0) {
																g();
																i[813] = 0;
																t = 91;
																break a;
															}
														}
														i[813] = 1;
														t = 91;
														break a;
													}
												}
											while (0);
											g();
											i[813] = 0;
											t = 91;
											break a;
									}
									case 96:
										r = f[72] | 0;
										a = s[404] | 0;
										t = a & 65535;
										f[r + (t << 3) + 4 >> 2] = f[71];
										s[404] = a + 1 << 16 >> 16;
										f[r + (t << 3) >> 2] = 3;
										h();
										t = 91;
										break;
									default: t = 91;
								}
							while (0);
							if ((t | 0) == 91) {
								t = 0;
								f[71] = f[74];
							}
							e = f[74] | 0;
						}
						if ((t | 0) == 36) {
							T();
							e = 0;
							break;
						} else if ((t | 0) == 49) {
							T();
							e = 0;
							break;
						} else if ((t | 0) == 92) {
							e = (i[810] | 0) == 0 ? (s[403] | s[404]) << 16 >> 16 == 0 : 0;
							break;
						}
					}
				while (0);
				n = u;
				return e | 0;
			}
			function k() {
				var e = 0, a = 0, r = 0, t = 0, c = 0, n = 0, b = 0, k = 0, l = 0, o = 0, h = 0, d = 0, C = 0, g = 0;
				k = f[74] | 0;
				l = f[67] | 0;
				g = k + 12 | 0;
				f[74] = g;
				r = w(1) | 0;
				e = f[74] | 0;
				if (!((e | 0) == (g | 0) ? !(I(r) | 0) : 0)) C = 3;
				e: do
					if ((C | 0) == 3) {
						a: do
							switch (r << 16 >> 16) {
								case 123:
									f[74] = e + 2;
									e = w(1) | 0;
									a = f[74] | 0;
									while (1) {
										if (W(e) | 0) {
											v(e);
											e = (f[74] | 0) + 2 | 0;
											f[74] = e;
										} else {
											q(e) | 0;
											e = f[74] | 0;
										}
										w(1) | 0;
										e = A(a, e) | 0;
										if (e << 16 >> 16 == 44) {
											f[74] = (f[74] | 0) + 2;
											e = w(1) | 0;
										}
										if (e << 16 >> 16 == 125) {
											C = 15;
											break;
										}
										g = a;
										a = f[74] | 0;
										if ((a | 0) == (g | 0)) {
											C = 12;
											break;
										}
										if (a >>> 0 > (f[75] | 0) >>> 0) {
											C = 14;
											break;
										}
									}
									if ((C | 0) == 12) {
										T();
										break e;
									} else if ((C | 0) == 14) {
										T();
										break e;
									} else if ((C | 0) == 15) {
										i[811] = 1;
										f[74] = (f[74] | 0) + 2;
										break a;
									}
									break;
								case 42:
									f[74] = e + 2;
									w(1) | 0;
									g = f[74] | 0;
									A(g, g) | 0;
									break;
								default:
									i[812] = 0;
									switch (r << 16 >> 16) {
										case 100:
											k = e + 14 | 0;
											f[74] = k;
											switch ((w(1) | 0) << 16 >> 16) {
												case 97:
													a = f[74] | 0;
													if ((m(a + 2 | 0, 80, 8) | 0) == 0 ? (c = a + 10 | 0, F(s[c >> 1] | 0) | 0) : 0) {
														f[74] = c;
														w(0) | 0;
														C = 22;
													}
													break;
												case 102:
													C = 22;
													break;
												case 99:
													a = f[74] | 0;
													if (((m(a + 2 | 0, 36, 8) | 0) == 0 ? (t = a + 10 | 0, g = s[t >> 1] | 0, V(g) | 0 | g << 16 >> 16 == 123) : 0) ? (f[74] = t, n = w(1) | 0, n << 16 >> 16 != 123) : 0) {
														d = n;
														C = 31;
													}
											}
											r: do
												if ((C | 0) == 22 ? (b = f[74] | 0, (m(b + 2 | 0, 88, 14) | 0) == 0) : 0) {
													r = b + 16 | 0;
													a = s[r >> 1] | 0;
													if (!(V(a) | 0)) switch (a << 16 >> 16) {
														case 40:
														case 42: break;
														default: break r;
													}
													f[74] = r;
													a = w(1) | 0;
													if (a << 16 >> 16 == 42) {
														f[74] = (f[74] | 0) + 2;
														a = w(1) | 0;
													}
													if (a << 16 >> 16 != 40) {
														d = a;
														C = 31;
													}
												}
											while (0);
											if ((C | 0) == 31 ? (o = f[74] | 0, q(d) | 0, h = f[74] | 0, h >>> 0 > o >>> 0) : 0) {
												O(e, k, o, h);
												f[74] = (f[74] | 0) + -2;
												break e;
											}
											O(e, k, 0, 0);
											f[74] = e + 12;
											break e;
										case 97:
											f[74] = e + 10;
											w(0) | 0;
											e = f[74] | 0;
											C = 35;
											break;
										case 102:
											C = 35;
											break;
										case 99:
											if ((m(e + 2 | 0, 36, 8) | 0) == 0 ? (a = e + 10 | 0, E(s[a >> 1] | 0) | 0) : 0) {
												f[74] = a;
												g = w(1) | 0;
												C = f[74] | 0;
												q(g) | 0;
												g = f[74] | 0;
												O(C, g, C, g);
												f[74] = (f[74] | 0) + -2;
												break e;
											}
											e = e + 4 | 0;
											f[74] = e;
											break;
										case 108:
										case 118: break;
										default: break e;
									}
									if ((C | 0) == 35) {
										f[74] = e + 16;
										e = w(1) | 0;
										if (e << 16 >> 16 == 42) {
											f[74] = (f[74] | 0) + 2;
											e = w(1) | 0;
										}
										C = f[74] | 0;
										q(e) | 0;
										g = f[74] | 0;
										O(C, g, C, g);
										f[74] = (f[74] | 0) + -2;
										break e;
									}
									f[74] = e + 6;
									i[812] = 0;
									r = w(1) | 0;
									e = f[74] | 0;
									r = (q(r) | 32) << 16 >> 16 == 123;
									t = f[74] | 0;
									if (r) {
										f[74] = t + 2;
										g = w(1) | 0;
										e = f[74] | 0;
										q(g) | 0;
									}
									r: while (1) {
										a = f[74] | 0;
										if ((a | 0) == (e | 0)) break;
										O(e, a, e, a);
										a = w(1) | 0;
										if (r) switch (a << 16 >> 16) {
											case 93:
											case 125: break e;
										}
										e = f[74] | 0;
										if (a << 16 >> 16 != 44) {
											C = 51;
											break;
										}
										f[74] = e + 2;
										a = w(1) | 0;
										e = f[74] | 0;
										switch (a << 16 >> 16) {
											case 91:
											case 123:
												C = 51;
												break r;
										}
										q(a) | 0;
									}
									if ((C | 0) == 51) f[74] = e + -2;
									if (!r) break e;
									f[74] = t + -2;
									break e;
							}
						while (0);
						g = (w(1) | 0) << 16 >> 16 == 102;
						e = f[74] | 0;
						if (g ? (m(e + 2 | 0, 74, 6) | 0) == 0 : 0) {
							f[74] = e + 8;
							u(k, w(1) | 0, 0);
							e = (l | 0) == 0 ? 248 : l + 16 | 0;
							while (1) {
								e = f[e >> 2] | 0;
								if (!e) break e;
								f[e + 12 >> 2] = 0;
								f[e + 8 >> 2] = 0;
								e = e + 16 | 0;
							}
						}
						f[74] = e + -2;
					}
				while (0);
			}
			function l() {
				var e = 0, a = 0, r = 0, t = 0, c = 0, n = 0, b = 0;
				b = f[74] | 0;
				c = b + 12 | 0;
				f[74] = c;
				e = w(1) | 0;
				t = f[74] | 0;
				e: do
					if (e << 16 >> 16 != 46) {
						if (!(e << 16 >> 16 == 115 & t >>> 0 > c >>> 0)) {
							if (!(e << 16 >> 16 == 100 & t >>> 0 > (b + 10 | 0) >>> 0)) {
								t = 0;
								n = 28;
								break;
							}
							if (m(t + 2 | 0, 66, 8) | 0) {
								a = t;
								e = 100;
								t = 0;
								n = 59;
								break;
							}
							e = t + 10 | 0;
							if (!(V(s[e >> 1] | 0) | 0)) {
								a = t;
								e = 100;
								t = 0;
								n = 59;
								break;
							}
							f[74] = e;
							e = w(1) | 0;
							if (e << 16 >> 16 == 42) {
								e = 42;
								t = 2;
								n = 61;
								break;
							}
							f[74] = t;
							t = 0;
							n = 28;
							break;
						}
						if ((m(t + 2 | 0, 56, 10) | 0) == 0 ? (r = t + 12 | 0, V(s[r >> 1] | 0) | 0) : 0) {
							f[74] = r;
							e = w(1) | 0;
							a = f[74] | 0;
							if ((a | 0) != (r | 0)) {
								if (e << 16 >> 16 != 102) {
									t = 1;
									n = 28;
									break;
								}
								if (m(a + 2 | 0, 74, 6) | 0) {
									e = 102;
									t = 1;
									n = 59;
									break;
								}
								if (!(E(s[a + 8 >> 1] | 0) | 0)) {
									e = 102;
									t = 1;
									n = 59;
									break;
								}
							}
							f[74] = t;
							t = 0;
							n = 28;
						} else {
							a = t;
							e = 115;
							t = 0;
							n = 59;
						}
					} else {
						f[74] = t + 2;
						switch ((w(1) | 0) << 16 >> 16) {
							case 109:
								e = f[74] | 0;
								if (m(e + 2 | 0, 50, 6) | 0) break e;
								a = f[71] | 0;
								if (!(G(a) | 0) ? (s[a >> 1] | 0) == 46 : 0) break e;
								d(b, b, e + 8 | 0, 2);
								break e;
							case 115:
								e = f[74] | 0;
								if (m(e + 2 | 0, 56, 10) | 0) break e;
								a = f[71] | 0;
								if (!(G(a) | 0) ? (s[a >> 1] | 0) == 46 : 0) break e;
								f[74] = e + 12;
								e = w(1) | 0;
								t = 1;
								n = 28;
								break e;
							case 100:
								e = f[74] | 0;
								if (m(e + 2 | 0, 66, 8) | 0) break e;
								a = f[71] | 0;
								if (!(G(a) | 0) ? (s[a >> 1] | 0) == 46 : 0) break e;
								f[74] = e + 10;
								e = w(1) | 0;
								t = 2;
								n = 28;
								break e;
							default: break e;
						}
					}
				while (0);
				e: do
					if ((n | 0) == 28) {
						if (e << 16 >> 16 == 40) {
							r = f[72] | 0;
							a = s[404] | 0;
							c = a & 65535;
							f[r + (c << 3) >> 2] = 5;
							e = f[74] | 0;
							s[404] = a + 1 << 16 >> 16;
							f[r + (c << 3) + 4 >> 2] = e;
							if ((s[f[71] >> 1] | 0) == 46) break;
							f[74] = e + 2;
							a = w(1) | 0;
							d(b, f[74] | 0, 0, e);
							if (!t) e = f[65] | 0;
							else {
								e = f[65] | 0;
								f[e + 28 >> 2] = (t | 0) == 1 ? 5 : 7;
							}
							c = f[73] | 0;
							b = s[403] | 0;
							s[403] = b + 1 << 16 >> 16;
							f[c + ((b & 65535) << 2) >> 2] = e;
							switch (a << 16 >> 16) {
								case 39:
									v(39);
									break;
								case 34:
									v(34);
									break;
								default:
									f[74] = (f[74] | 0) + -2;
									break e;
							}
							e = (f[74] | 0) + 2 | 0;
							f[74] = e;
							switch ((w(1) | 0) << 16 >> 16) {
								case 44:
									f[74] = (f[74] | 0) + 2;
									w(1) | 0;
									c = f[65] | 0;
									f[c + 4 >> 2] = e;
									b = f[74] | 0;
									f[c + 16 >> 2] = b;
									i[c + 24 >> 0] = 1;
									f[74] = b + -2;
									break e;
								case 41:
									s[404] = (s[404] | 0) + -1 << 16 >> 16;
									b = f[65] | 0;
									f[b + 4 >> 2] = e;
									f[b + 12 >> 2] = (f[74] | 0) + 2;
									i[b + 24 >> 0] = 1;
									s[403] = (s[403] | 0) + -1 << 16 >> 16;
									break e;
								default:
									f[74] = (f[74] | 0) + -2;
									break e;
							}
						}
						if (!((t | 0) == 0 & e << 16 >> 16 == 123)) {
							switch (e << 16 >> 16) {
								case 42:
								case 39:
								case 34:
									n = 61;
									break e;
							}
							a = f[74] | 0;
							n = 59;
							break;
						}
						e = f[74] | 0;
						if (s[404] | 0) {
							f[74] = e + -2;
							break;
						}
						while (1) {
							if (e >>> 0 >= (f[75] | 0) >>> 0) break;
							e = w(1) | 0;
							if (!(W(e) | 0)) {
								if (e << 16 >> 16 == 125) {
									n = 49;
									break;
								}
							} else v(e);
							e = (f[74] | 0) + 2 | 0;
							f[74] = e;
						}
						if ((n | 0) == 49) f[74] = (f[74] | 0) + 2;
						c = (w(1) | 0) << 16 >> 16 == 102;
						e = f[74] | 0;
						if (c ? m(e + 2 | 0, 74, 6) | 0 : 0) {
							T();
							break;
						}
						f[74] = e + 8;
						e = w(1) | 0;
						if (W(e) | 0) {
							u(b, e, 0);
							break;
						} else {
							T();
							break;
						}
					}
				while (0);
				if ((n | 0) == 59) if ((a | 0) == (c | 0)) f[74] = b + 10;
				else n = 61;
				do
					if ((n | 0) == 61) {
						if (!((e << 16 >> 16 == 42 | (t | 0) != 2) & (s[404] | 0) == 0)) {
							f[74] = (f[74] | 0) + -2;
							break;
						}
						e = f[75] | 0;
						a = f[74] | 0;
						while (1) {
							if (a >>> 0 >= e >>> 0) {
								n = 68;
								break;
							}
							r = s[a >> 1] | 0;
							if (W(r) | 0) {
								n = 66;
								break;
							}
							n = a + 2 | 0;
							f[74] = n;
							a = n;
						}
						if ((n | 0) == 66) {
							u(b, r, t);
							break;
						} else if ((n | 0) == 68) {
							T();
							break;
						}
					}
				while (0);
			}
			function u(e, a, r) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				var i = 0, t = 0;
				i = (f[74] | 0) + 2 | 0;
				switch (a << 16 >> 16) {
					case 39:
						v(39);
						t = 5;
						break;
					case 34:
						v(34);
						t = 5;
						break;
					default: T();
				}
				do
					if ((t | 0) == 5) {
						d(e, i, f[74] | 0, 1);
						if ((r | 0) > 0) f[(f[65] | 0) + 28 >> 2] = (r | 0) == 1 ? 4 : 6;
						f[74] = (f[74] | 0) + 2;
						a = w(0) | 0;
						r = a << 16 >> 16 == 97;
						if (r) {
							i = f[74] | 0;
							if (m(i + 2 | 0, 102, 10) | 0) t = 13;
						} else {
							i = f[74] | 0;
							if (!(((a << 16 >> 16 == 119 ? (s[i + 2 >> 1] | 0) == 105 : 0) ? (s[i + 4 >> 1] | 0) == 116 : 0) ? (s[i + 6 >> 1] | 0) == 104 : 0)) t = 13;
						}
						if ((t | 0) == 13) {
							f[74] = i + -2;
							break;
						}
						f[74] = i + ((r ? 6 : 4) << 1);
						if ((w(1) | 0) << 16 >> 16 != 123) {
							f[74] = i;
							break;
						}
						r = f[74] | 0;
						a = r;
						e: while (1) {
							f[74] = a + 2;
							a = w(1) | 0;
							switch (a << 16 >> 16) {
								case 39:
									v(39);
									f[74] = (f[74] | 0) + 2;
									a = w(1) | 0;
									break;
								case 34:
									v(34);
									f[74] = (f[74] | 0) + 2;
									a = w(1) | 0;
									break;
								default: a = q(a) | 0;
							}
							if (a << 16 >> 16 != 58) {
								t = 22;
								break;
							}
							f[74] = (f[74] | 0) + 2;
							switch ((w(1) | 0) << 16 >> 16) {
								case 39:
									v(39);
									break;
								case 34:
									v(34);
									break;
								default:
									t = 26;
									break e;
							}
							f[74] = (f[74] | 0) + 2;
							switch ((w(1) | 0) << 16 >> 16) {
								case 125:
									t = 31;
									break e;
								case 44: break;
								default:
									t = 30;
									break e;
							}
							f[74] = (f[74] | 0) + 2;
							if ((w(1) | 0) << 16 >> 16 == 125) {
								t = 31;
								break;
							}
							a = f[74] | 0;
						}
						if ((t | 0) == 22) {
							f[74] = i;
							break;
						} else if ((t | 0) == 26) {
							f[74] = i;
							break;
						} else if ((t | 0) == 30) {
							f[74] = i;
							break;
						} else if ((t | 0) == 31) {
							t = f[65] | 0;
							f[t + 16 >> 2] = r;
							f[t + 12 >> 2] = (f[74] | 0) + 2;
							break;
						}
					}
				while (0);
			}
			function o(e) {
				e = e | 0;
				e: do
					switch (s[e >> 1] | 0) {
						case 100: switch (s[e + -2 >> 1] | 0) {
							case 105:
								e = $(e + -4 | 0, 112, 2) | 0;
								break e;
							case 108:
								e = $(e + -4 | 0, 116, 3) | 0;
								break e;
							default:
								e = 0;
								break e;
						}
						case 101: switch (s[e + -2 >> 1] | 0) {
							case 115: switch (s[e + -4 >> 1] | 0) {
								case 108:
									e = B(e + -6 | 0, 101) | 0;
									break e;
								case 97:
									e = B(e + -6 | 0, 99) | 0;
									break e;
								default:
									e = 0;
									break e;
							}
							case 116:
								e = $(e + -4 | 0, 122, 4) | 0;
								break e;
							case 117:
								e = $(e + -4 | 0, 130, 6) | 0;
								break e;
							default:
								e = 0;
								break e;
						}
						case 102:
							if ((s[e + -2 >> 1] | 0) == 111 ? (s[e + -4 >> 1] | 0) == 101 : 0) switch (s[e + -6 >> 1] | 0) {
								case 99:
									e = $(e + -8 | 0, 142, 6) | 0;
									break e;
								case 112:
									e = $(e + -8 | 0, 154, 2) | 0;
									break e;
								default:
									e = 0;
									break e;
							}
							else e = 0;
							break;
						case 107:
							e = $(e + -2 | 0, 158, 4) | 0;
							break;
						case 110:
							e = e + -2 | 0;
							if (B(e, 105) | 0) e = 1;
							else e = $(e, 166, 5) | 0;
							break;
						case 111:
							e = B(e + -2 | 0, 100) | 0;
							break;
						case 114:
							e = $(e + -2 | 0, 176, 7) | 0;
							break;
						case 116:
							e = $(e + -2 | 0, 190, 4) | 0;
							break;
						case 119: switch (s[e + -2 >> 1] | 0) {
							case 101:
								e = B(e + -4 | 0, 110) | 0;
								break e;
							case 111:
								e = $(e + -4 | 0, 198, 3) | 0;
								break e;
							default:
								e = 0;
								break e;
						}
						default: e = 0;
					}
				while (0);
				return e | 0;
			}
			function h() {
				var e = 0, a = 0, r = 0, i = 0;
				a = f[75] | 0;
				r = f[74] | 0;
				e: while (1) {
					e = r + 2 | 0;
					if (r >>> 0 >= a >>> 0) {
						a = 10;
						break;
					}
					switch (s[e >> 1] | 0) {
						case 96:
							a = 7;
							break e;
						case 36:
							if ((s[r + 4 >> 1] | 0) == 123) {
								a = 6;
								break e;
							}
							break;
						case 92: e = r + 4 | 0;
					}
					r = e;
				}
				if ((a | 0) == 6) {
					e = r + 4 | 0;
					f[74] = e;
					a = f[72] | 0;
					i = s[404] | 0;
					r = i & 65535;
					f[a + (r << 3) >> 2] = 4;
					s[404] = i + 1 << 16 >> 16;
					f[a + (r << 3) + 4 >> 2] = e;
				} else if ((a | 0) == 7) {
					f[74] = e;
					r = f[72] | 0;
					i = (s[404] | 0) + -1 << 16 >> 16;
					s[404] = i;
					if ((f[r + ((i & 65535) << 3) >> 2] | 0) != 3) T();
				} else if ((a | 0) == 10) {
					f[74] = e;
					T();
				}
			}
			function w(e) {
				e = e | 0;
				var a = 0, r = 0, i = 0;
				r = f[74] | 0;
				e: do {
					a = s[r >> 1] | 0;
					a: do
						if (a << 16 >> 16 != 47) if (e) if (V(a) | 0) break;
						else break e;
						else if (F(a) | 0) break;
						else break e;
						else switch (s[r + 2 >> 1] | 0) {
							case 47:
								P();
								break a;
							case 42:
								y(e);
								break a;
							default:
								a = 47;
								break e;
						}
					while (0);
					i = f[74] | 0;
					r = i + 2 | 0;
					f[74] = r;
				} while (i >>> 0 < (f[75] | 0) >>> 0);
				return a | 0;
			}
			function d(e, a, r, s) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				s = s | 0;
				var t = 0, c = 0;
				c = f[69] | 0;
				f[69] = c + 36;
				t = f[65] | 0;
				f[((t | 0) == 0 ? 244 : t + 32 | 0) >> 2] = c;
				f[66] = t;
				f[65] = c;
				f[c + 8 >> 2] = e;
				if (2 == (s | 0)) {
					e = 3;
					t = r;
				} else {
					t = 1 == (s | 0);
					e = t ? 1 : 2;
					t = t ? r + 2 | 0 : 0;
				}
				f[c + 12 >> 2] = t;
				f[c + 28 >> 2] = e;
				f[c >> 2] = a;
				f[c + 4 >> 2] = r;
				f[c + 16 >> 2] = 0;
				f[c + 20 >> 2] = s;
				a = 1 == (s | 0);
				i[c + 24 >> 0] = a & 1;
				f[c + 32 >> 2] = 0;
				if (a | 2 == (s | 0)) i[811] = 1;
			}
			function v(e) {
				e = e | 0;
				var a = 0, r = 0, i = 0, t = 0;
				t = f[75] | 0;
				a = f[74] | 0;
				while (1) {
					i = a + 2 | 0;
					if (a >>> 0 >= t >>> 0) {
						a = 9;
						break;
					}
					r = s[i >> 1] | 0;
					if (r << 16 >> 16 == e << 16 >> 16) {
						a = 10;
						break;
					}
					if (r << 16 >> 16 == 92) {
						r = a + 4 | 0;
						if ((s[r >> 1] | 0) == 13) {
							a = a + 6 | 0;
							a = (s[a >> 1] | 0) == 10 ? a : r;
						} else a = r;
					} else if (Z(r) | 0) {
						a = 9;
						break;
					} else a = i;
				}
				if ((a | 0) == 9) {
					f[74] = i;
					T();
				} else if ((a | 0) == 10) f[74] = i;
			}
			function A(e, a) {
				e = e | 0;
				a = a | 0;
				var r = 0, i = 0, t = 0, c = 0;
				r = f[74] | 0;
				i = s[r >> 1] | 0;
				c = (e | 0) == (a | 0);
				t = c ? 0 : e;
				c = c ? 0 : a;
				if (i << 16 >> 16 == 97) {
					f[74] = r + 4;
					r = w(1) | 0;
					e = f[74] | 0;
					if (W(r) | 0) {
						v(r);
						a = (f[74] | 0) + 2 | 0;
						f[74] = a;
					} else {
						q(r) | 0;
						a = f[74] | 0;
					}
					i = w(1) | 0;
					r = f[74] | 0;
				}
				if ((r | 0) != (e | 0)) O(e, a, t, c);
				return i | 0;
			}
			function C() {
				var e = 0, a = 0, r = 0;
				r = f[75] | 0;
				a = f[74] | 0;
				e: while (1) {
					e = a + 2 | 0;
					if (a >>> 0 >= r >>> 0) {
						a = 6;
						break;
					}
					switch (s[e >> 1] | 0) {
						case 13:
						case 10:
							a = 6;
							break e;
						case 93:
							a = 7;
							break e;
						case 92: e = a + 4 | 0;
					}
					a = e;
				}
				if ((a | 0) == 6) {
					f[74] = e;
					T();
					e = 0;
				} else if ((a | 0) == 7) {
					f[74] = e;
					e = 93;
				}
				return e | 0;
			}
			function g() {
				var e = 0, a = 0, r = 0;
				e: while (1) {
					e = f[74] | 0;
					a = e + 2 | 0;
					f[74] = a;
					if (e >>> 0 >= (f[75] | 0) >>> 0) {
						r = 7;
						break;
					}
					switch (s[a >> 1] | 0) {
						case 13:
						case 10:
							r = 7;
							break e;
						case 47: break e;
						case 91:
							C() | 0;
							break;
						case 92: f[74] = e + 4;
					}
				}
				if ((r | 0) == 7) T();
			}
			function p(e) {
				e = e | 0;
				switch (s[e >> 1] | 0) {
					case 62:
						e = (s[e + -2 >> 1] | 0) == 61;
						break;
					case 41:
					case 59:
						e = 1;
						break;
					case 104:
						e = $(e + -2 | 0, 218, 4) | 0;
						break;
					case 121:
						e = $(e + -2 | 0, 226, 6) | 0;
						break;
					case 101:
						e = $(e + -2 | 0, 238, 3) | 0;
						break;
					default: e = 0;
				}
				return e | 0;
			}
			function y(e) {
				e = e | 0;
				var a = 0, r = 0, i = 0, t = 0, c = 0;
				t = (f[74] | 0) + 2 | 0;
				f[74] = t;
				r = f[75] | 0;
				while (1) {
					a = t + 2 | 0;
					if (t >>> 0 >= r >>> 0) break;
					i = s[a >> 1] | 0;
					if (!e ? Z(i) | 0 : 0) break;
					if (i << 16 >> 16 == 42 ? (s[t + 4 >> 1] | 0) == 47 : 0) {
						c = 8;
						break;
					}
					t = a;
				}
				if ((c | 0) == 8) {
					f[74] = a;
					a = t + 4 | 0;
				}
				f[74] = a;
			}
			function m(e, a, r) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				var s = 0, f = 0;
				e: do
					if (!r) e = 0;
					else {
						while (1) {
							s = i[e >> 0] | 0;
							f = i[a >> 0] | 0;
							if (s << 24 >> 24 != f << 24 >> 24) break;
							r = r + -1 | 0;
							if (!r) {
								e = 0;
								break e;
							} else {
								e = e + 1 | 0;
								a = a + 1 | 0;
							}
						}
						e = (s & 255) - (f & 255) | 0;
					}
				while (0);
				return e | 0;
			}
			function I(e) {
				e = e | 0;
				e: do
					switch (e << 16 >> 16) {
						case 38:
						case 37:
						case 33:
							e = 1;
							break;
						default: if ((e & -8) << 16 >> 16 == 40 | (e + -58 & 65535) < 6) e = 1;
						else {
							switch (e << 16 >> 16) {
								case 91:
								case 93:
								case 94:
									e = 1;
									break e;
							}
							e = (e + -123 & 65535) < 4;
						}
					}
				while (0);
				return e | 0;
			}
			function U(e) {
				e = e | 0;
				e: do
					switch (e << 16 >> 16) {
						case 38:
						case 37:
						case 33: break;
						default: if (!((e + -58 & 65535) < 6 | (e + -40 & 65535) < 7 & e << 16 >> 16 != 41)) {
							switch (e << 16 >> 16) {
								case 91:
								case 94: break e;
							}
							return e << 16 >> 16 != 125 & (e + -123 & 65535) < 4 | 0;
						}
					}
				while (0);
				return 1;
			}
			function x(e) {
				e = e | 0;
				var a = 0;
				a = s[e >> 1] | 0;
				e: do
					if ((a + -9 & 65535) >= 5) {
						switch (a << 16 >> 16) {
							case 160:
							case 32:
								a = 1;
								break e;
						}
						if (I(a) | 0) return a << 16 >> 16 != 46 | (G(e) | 0) | 0;
						else a = 0;
					} else a = 1;
				while (0);
				return a | 0;
			}
			function S(e) {
				e = e | 0;
				var a = 0, r = 0, i = 0, t = 0;
				r = n;
				n = n + 16 | 0;
				i = r;
				f[i >> 2] = 0;
				f[68] = e;
				a = f[3] | 0;
				t = a + (e << 1) | 0;
				e = t + 2 | 0;
				s[t >> 1] = 0;
				f[i >> 2] = e;
				f[69] = e;
				f[61] = 0;
				f[65] = 0;
				f[63] = 0;
				f[62] = 0;
				f[67] = 0;
				f[64] = 0;
				n = r;
				return a | 0;
			}
			function O(e, a, r, s) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				s = s | 0;
				var t = 0, c = 0;
				t = f[69] | 0;
				f[69] = t + 20;
				c = f[67] | 0;
				f[((c | 0) == 0 ? 248 : c + 16 | 0) >> 2] = t;
				f[67] = t;
				f[t >> 2] = e;
				f[t + 4 >> 2] = a;
				f[t + 8 >> 2] = r;
				f[t + 12 >> 2] = s;
				f[t + 16 >> 2] = 0;
				i[811] = 1;
			}
			function $(e, a, r) {
				e = e | 0;
				a = a | 0;
				r = r | 0;
				var i = 0, s = 0;
				i = e + (0 - r << 1) | 0;
				s = i + 2 | 0;
				e = f[3] | 0;
				if (s >>> 0 >= e >>> 0 ? (m(s, a, r << 1) | 0) == 0 : 0) if ((s | 0) == (e | 0)) e = 1;
				else e = x(i) | 0;
				else e = 0;
				return e | 0;
			}
			function j(e) {
				e = e | 0;
				switch (s[e >> 1] | 0) {
					case 107:
						e = $(e + -2 | 0, 158, 4) | 0;
						break;
					case 101:
						if ((s[e + -2 >> 1] | 0) == 117) e = $(e + -4 | 0, 130, 6) | 0;
						else e = 0;
						break;
					default: e = 0;
				}
				return e | 0;
			}
			function B(e, a) {
				e = e | 0;
				a = a | 0;
				var r = 0;
				r = f[3] | 0;
				if (r >>> 0 <= e >>> 0 ? (s[e >> 1] | 0) == a << 16 >> 16 : 0) if ((r | 0) == (e | 0)) r = 1;
				else r = E(s[e + -2 >> 1] | 0) | 0;
				else r = 0;
				return r | 0;
			}
			function E(e) {
				e = e | 0;
				e: do
					if ((e + -9 & 65535) < 5) e = 1;
					else {
						switch (e << 16 >> 16) {
							case 32:
							case 160:
								e = 1;
								break e;
						}
						e = e << 16 >> 16 != 46 & (I(e) | 0);
					}
				while (0);
				return e | 0;
			}
			function P() {
				var e = 0, a = 0, r = 0;
				e = f[75] | 0;
				r = f[74] | 0;
				e: while (1) {
					a = r + 2 | 0;
					if (r >>> 0 >= e >>> 0) break;
					switch (s[a >> 1] | 0) {
						case 13:
						case 10: break e;
						default: r = a;
					}
				}
				f[74] = a;
			}
			function q(e) {
				e = e | 0;
				while (1) {
					if (V(e) | 0) break;
					if (I(e) | 0) break;
					e = (f[74] | 0) + 2 | 0;
					f[74] = e;
					e = s[e >> 1] | 0;
					if (!(e << 16 >> 16)) {
						e = 0;
						break;
					}
				}
				return e | 0;
			}
			function z() {
				var e = 0;
				e = f[(f[63] | 0) + 20 >> 2] | 0;
				switch (e | 0) {
					case 1:
						e = -1;
						break;
					case 2:
						e = -2;
						break;
					default: e = e - (f[3] | 0) >> 1;
				}
				return e | 0;
			}
			function D(e) {
				e = e | 0;
				if (!($(e, 204, 5) | 0) ? !($(e, 44, 3) | 0) : 0) e = $(e, 214, 2) | 0;
				else e = 1;
				return e | 0;
			}
			function F(e) {
				e = e | 0;
				switch (e << 16 >> 16) {
					case 160:
					case 32:
					case 12:
					case 11:
					case 9:
						e = 1;
						break;
					default: e = 0;
				}
				return e | 0;
			}
			function G(e) {
				e = e | 0;
				if ((s[e >> 1] | 0) == 46 ? (s[e + -2 >> 1] | 0) == 46 : 0) e = (s[e + -4 >> 1] | 0) == 46;
				else e = 0;
				return e | 0;
			}
			function H(e) {
				e = e | 0;
				if ((f[3] | 0) == (e | 0)) e = 1;
				else e = x(e + -2 | 0) | 0;
				return e | 0;
			}
			function J() {
				var e = 0;
				e = f[(f[64] | 0) + 12 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function K() {
				var e = 0;
				e = f[(f[63] | 0) + 12 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function L() {
				var e = 0;
				e = f[(f[64] | 0) + 8 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function M() {
				var e = 0;
				e = f[(f[63] | 0) + 16 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function N() {
				var e = 0;
				e = f[(f[63] | 0) + 4 >> 2] | 0;
				if (!e) e = -1;
				else e = e - (f[3] | 0) >> 1;
				return e | 0;
			}
			function Q() {
				var e = 0;
				e = f[63] | 0;
				e = f[((e | 0) == 0 ? 244 : e + 32 | 0) >> 2] | 0;
				f[63] = e;
				return (e | 0) != 0 | 0;
			}
			function R() {
				var e = 0;
				e = f[64] | 0;
				e = f[((e | 0) == 0 ? 248 : e + 16 | 0) >> 2] | 0;
				f[64] = e;
				return (e | 0) != 0 | 0;
			}
			function T() {
				i[810] = 1;
				f[70] = (f[74] | 0) - (f[3] | 0) >> 1;
				f[74] = (f[75] | 0) + 2;
			}
			function V(e) {
				e = e | 0;
				return (e | 128) << 16 >> 16 == 160 | (e + -9 & 65535) < 5 | 0;
			}
			function W(e) {
				e = e | 0;
				return e << 16 >> 16 == 39 | e << 16 >> 16 == 34 | 0;
			}
			function X() {
				return (f[(f[63] | 0) + 8 >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function Y() {
				return (f[(f[64] | 0) + 4 >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function Z(e) {
				e = e | 0;
				return e << 16 >> 16 == 13 | e << 16 >> 16 == 10 | 0;
			}
			function _() {
				return (f[f[63] >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function ee() {
				return (f[f[64] >> 2] | 0) - (f[3] | 0) >> 1 | 0;
			}
			function ae() {
				return t[(f[63] | 0) + 24 >> 0] | 0;
			}
			function re(e) {
				e = e | 0;
				f[3] = e;
			}
			function ie() {
				return f[(f[63] | 0) + 28 >> 2] | 0;
			}
			function se() {
				return (i[811] | 0) != 0 | 0;
			}
			function fe() {
				return (i[812] | 0) != 0 | 0;
			}
			function te() {
				return f[70] | 0;
			}
			function ce(e) {
				e = e | 0;
				n = e + 992 + 15 & -16;
				return 992;
			}
			return {
				su: ce,
				ai: M,
				e: te,
				ee: Y,
				ele: J,
				els: L,
				es: ee,
				f: fe,
				id: z,
				ie: N,
				ip: ae,
				is: _,
				it: ie,
				ms: se,
				p: b,
				re: R,
				ri: Q,
				sa: S,
				se: K,
				ses: re,
				ss: X
			};
		}("undefined" != typeof self ? self : global, {}, a), r = e.su(i - (2 << 17));
	}
	const h = t.length + 1;
	e.ses(r), e.sa(h - 1), s(t, new Uint16Array(a, r, h)), e.p() || (n = e.e(), o());
	const w = [], d = [];
	for (; e.ri();) {
		const a = e.is(), r = e.ie(), i = e.ai(), s = e.id(), f = e.ss(), c = e.se(), n = e.it();
		let k;
		e.ip() && (k = b(-1 === s ? a : a + 1, t.charCodeAt(-1 === s ? a - 1 : a))), w.push({
			t: n,
			n: k,
			s: a,
			e: r,
			ss: f,
			se: c,
			d: s,
			a: i
		});
	}
	for (; e.re();) {
		const a = e.es(), r = e.ee(), i = e.els(), s = e.ele(), f = t.charCodeAt(a), c = i >= 0 ? t.charCodeAt(i) : -1;
		d.push({
			s: a,
			e: r,
			ls: i,
			le: s,
			n: 34 === f || 39 === f ? b(a + 1, f) : t.slice(a, r),
			ln: i < 0 ? void 0 : 34 === c || 39 === c ? b(i + 1, c) : t.slice(i, s)
		});
	}
	return [
		w,
		d,
		!!e.f(),
		!!e.ms()
	];
}
function b(e, a) {
	n = e;
	let r = "", i = n;
	for (;;) {
		n >= t.length && o();
		const e = t.charCodeAt(n);
		if (e === a) break;
		92 === e ? (r += t.slice(i, n), r += k(), i = n) : (8232 === e || 8233 === e || u(e) && o(), ++n);
	}
	return r += t.slice(i, n++), r;
}
function k() {
	let e = t.charCodeAt(++n);
	switch (++n, e) {
		case 110: return "\n";
		case 114: return "\r";
		case 120: return String.fromCharCode(l(2));
		case 117: return function() {
			const e = t.charCodeAt(n);
			let a;
			123 === e ? (++n, a = l(t.indexOf("}", n) - n), ++n, a > 1114111 && o()) : a = l(4);
			return a <= 65535 ? String.fromCharCode(a) : (a -= 65536, String.fromCharCode(55296 + (a >> 10), 56320 + (1023 & a)));
		}();
		case 116: return "	";
		case 98: return "\b";
		case 118: return "\v";
		case 102: return "\f";
		case 13: 10 === t.charCodeAt(n) && ++n;
		case 10: return "";
		case 56:
		case 57: o();
		default:
			if (e >= 48 && e <= 55) {
				let a = t.substr(n - 1, 3).match(/^[0-7]+/)[0], r = parseInt(a, 8);
				return r > 255 && (a = a.slice(0, -1), r = parseInt(a, 8)), n += a.length - 1, e = t.charCodeAt(n), "0" === a && 56 !== e && 57 !== e || o(), String.fromCharCode(r);
			}
			return u(e) ? "" : String.fromCharCode(e);
	}
}
function l(e) {
	const a = n;
	let r = 0, i = 0;
	for (let a = 0; a < e; ++a, ++n) {
		let e, s = t.charCodeAt(n);
		if (95 !== s) {
			if (s >= 97) e = s - 97 + 10;
			else if (s >= 65) e = s - 65 + 10;
			else {
				if (!(s >= 48 && s <= 57)) break;
				e = s - 48;
			}
			if (e >= 16) break;
			i = s, r = 16 * r + e;
		} else 95 !== i && 0 !== a || o(), i = s;
	}
	return 95 !== i && n - a === e || o(), r;
}
function u(e) {
	return 13 === e || 10 === e;
}
function o() {
	throw Object.assign(Error(`Parse error ${c}:${t.slice(0, n).split("\n").length}:${n - t.lastIndexOf("\n", n - 1)}`), { idx: n });
}

// packages/interactivity-router/build-module/assets/dynamic-importmap/fetch.mjs
const fetching = (url, parent) => {
	return ` fetching ${url}${parent ? ` from ${parent}` : ""}`;
};
const jsContentType = /^(text|application)\/(x-)?javascript(;|$)/;
/**
* Fetches the passed module URL and return the corresponding `ModuleLoad`
* instance. If the passed URL does not point to a JS file, the function
* throws and error.
*
* @param url       Module URL.
* @param fetchOpts Fetch init options.
* @param parent    Parent module URL referencing this URL (if any).
* @return Promise with a `ModuleLoad` instance.
*/
async function fetchModule(url, fetchOpts, parent) {
	let res;
	try {
		res = await fetch(url, fetchOpts);
	} catch {
		throw Error(`Network error${fetching(url, parent)}.`);
	}
	if (!res.ok) throw Error(`Error ${res.status}${fetching(url, parent)}.`);
	const contentType = res.headers.get("content-type");
	if (!jsContentType.test(contentType)) throw Error(`Bad Content-Type "${contentType}"${fetching(url, parent)}.`);
	return {
		responseUrl: res.url,
		source: await res.text()
	};
}

// packages/interactivity-router/build-module/assets/dynamic-importmap/loader.mjs
/**
* This code is derived from the following projects:
*
* 1. dynamic-importmap (https://github.com/keller-mark/dynamic-importmap)
* 2. es-module-shims (https://github.com/guybedford/es-module-shims)
*
* The original implementation was created by Guy Bedford in es-module-shims,
* then adapted by Mark Keller in dynamic-importmap, and further modified
* for use in this project.
*
* Both projects are licensed under the MIT license.
*
* MIT License: https://opensource.org/licenses/MIT
*/
/**
* Script element containing the initial page's import map.
*/
const initialImportMapElement = window.document.querySelector("script#wp-importmap[type=importmap]");
/**
* Data from the initial page's import map.
*
* Pages containing any of the imports present on the original page
* in their import maps should ignore them, as those imports would
* be handled natively.
*/
const initialImportMap = initialImportMapElement ? JSON.parse(initialImportMapElement.text) : {
	imports: {},
	scopes: {}
};
const skip = (id) => Object.keys(initialImportMap.imports).includes(id);
const fetchCache = {};
const registry = {};
Object.keys(initialImportMap.imports).forEach((id) => {
	registry[id] = { blobUrl: id };
});
async function loadAll(load, seen) {
	if (load.blobUrl || seen[load.url]) return;
	seen[load.url] = 1;
	await load.linkPromise;
	await Promise.all(load.deps.map((dep) => loadAll(dep, seen)));
}
function urlJsString(url) {
	return `'${url.replace(/'/g, "\\'")}'`;
}
const createBlob = (source, type = "text/javascript") => URL.createObjectURL(new Blob([source], { type }));
function resolveDeps(load, seen) {
	if (load.blobUrl || !seen[load.url]) return;
	seen[load.url] = 0;
	for (const dep of load.deps) resolveDeps(dep, seen);
	const [imports, exports] = load.analysis;
	const source = load.source;
	let resolvedSource = "";
	if (!imports.length) resolvedSource += source;
	else {
		let lastIndex = 0;
		let depIndex = 0;
		const dynamicImportEndStack = [];
		function pushStringTo(originalIndex) {
			while (dynamicImportEndStack.length && dynamicImportEndStack[dynamicImportEndStack.length - 1] < originalIndex) {
				const dynamicImportEnd = dynamicImportEndStack.pop();
				resolvedSource += `${source.slice(lastIndex, dynamicImportEnd)}, ${urlJsString(load.responseUrl)}`;
				lastIndex = dynamicImportEnd;
			}
			resolvedSource += source.slice(lastIndex, originalIndex);
			lastIndex = originalIndex;
		}
		for (const { s: start, ss: statementStart, se: statementEnd, d: dynamicImportIndex } of imports) if (dynamicImportIndex === -1) {
			const depLoad = load.deps[depIndex++];
			let blobUrl = depLoad.blobUrl;
			const cycleShell = !blobUrl;
			if (cycleShell) {
				if (!(blobUrl = depLoad.shellUrl)) blobUrl = depLoad.shellUrl = createBlob(`export function u$_(m){${depLoad.analysis[1].map(({ s, e }, i) => {
					const q = depLoad.source[s] === "\"" || depLoad.source[s] === "'";
					return `e$_${i}=m${q ? `[` : "."}${depLoad.source.slice(s, e)}${q ? `]` : ""}`;
				}).join(",")}}${depLoad.analysis[1].length ? `let ${depLoad.analysis[1].map((_, i) => `e$_${i}`).join(",")};` : ""}export {${depLoad.analysis[1].map(({ s, e }, i) => `e$_${i} as ${depLoad.source.slice(s, e)}`).join(",")}}\n//# sourceURL=${depLoad.responseUrl}?cycle`);
			}
			pushStringTo(start - 1);
			resolvedSource += `/*${source.slice(start - 1, statementEnd)}*/${urlJsString(blobUrl)}`;
			if (!cycleShell && depLoad.shellUrl) {
				resolvedSource += `;import*as m$_${depIndex} from'${depLoad.blobUrl}';import{u$_ as u$_${depIndex}}from'${depLoad.shellUrl}';u$_${depIndex}(m$_${depIndex})`;
				depLoad.shellUrl = void 0;
			}
			lastIndex = statementEnd;
		} else if (dynamicImportIndex === -2) throw Error("The import.meta property is not supported.");
		else {
			pushStringTo(statementStart);
			resolvedSource += `wpInteractivityRouterImport(`;
			dynamicImportEndStack.push(statementEnd - 1);
			lastIndex = start;
		}
		if (load.shellUrl) resolvedSource += `\n;import{u$_}from'${load.shellUrl}';try{u$_({${exports.filter((e) => e.ln).map(({ s, e, ln }) => `${source.slice(s, e)}:${ln}`).join(",")}})}catch(_){};\n`;
		pushStringTo(source.length);
	}
	let hasSourceURL = false;
	resolvedSource = resolvedSource.replace(sourceMapURLRegEx, (match, isMapping, url) => {
		hasSourceURL = !isMapping;
		return match.replace(url, () => new URL(url, load.responseUrl).toString());
	});
	if (!hasSourceURL) resolvedSource += "\n//# sourceURL=" + load.responseUrl;
	load.blobUrl = createBlob(resolvedSource);
	load.source = void 0;
}
const sourceMapURLRegEx = /\n\/\/# source(Mapping)?URL=([^\n]+)\s*((;|\/\/[^#][^\n]*)\s*)*$/;
function getOrCreateLoad(url, fetchOpts, parent) {
	let load = registry[url];
	if (load) return load;
	load = { url };
	if (registry[url]) {
		let i = 0;
		while (registry[load.url + ++i]);
		load.url += i;
	}
	registry[load.url] = load;
	load.fetchPromise = (async () => {
		let source;
		({responseUrl: load.responseUrl, source: source} = await (fetchCache[url] || fetchModule(url, fetchOpts, parent)));
		try {
			load.analysis = parse(source, load.url);
		} catch (e) {
			console.error(e);
			load.analysis = [
				[],
				[],
				false,
				false
			];
		}
		load.source = source;
		return load;
	})();
	load.linkPromise = load.fetchPromise.then(async () => {
		let childFetchOpts = fetchOpts;
		load.deps = (await Promise.all(load.analysis[0].map(async ({ n, d }) => {
			if (d !== -1 || !n) return;
			const responseUrl = resolve(n, load.responseUrl || load.url);
			if (skip && skip(responseUrl)) return { blobUrl: responseUrl };
			if (childFetchOpts.integrity) childFetchOpts = {
				...childFetchOpts,
				integrity: void 0
			};
			return getOrCreateLoad(responseUrl, childFetchOpts, load.responseUrl).fetchPromise;
		}))).filter((l) => l);
	});
	return load;
}
const dynamicImport = (u) => import(
	/* webpackIgnore: true */
	u
);
/**
* Resolves the passed module URL and fetches the corresponding module
* and their dependencies, returning a `ModuleLoad` object once all
* of them have been fetched.
*
* @param url       Module URL.
* @param fetchOpts Fetch options.
* @return A promise with a `ModuleLoad` instance.
*/
async function preloadModule(url, fetchOpts) {
	const load = getOrCreateLoad(url, fetchOpts, null);
	const seen = {};
	await loadAll(load, seen);
	resolveDeps(load, seen);
	await Promise.resolve();
	return load;
}
/**
* Imports the module represented by the passed `ModuleLoad` instance.
*
* @param load The `ModuleLoad` instance representing the module.
* @return A promise with the imported module.
*/
async function importPreloadedModule(load) {
	const module = await dynamicImport(load.blobUrl);
	if (load.shellUrl) (await dynamicImport(load.shellUrl)).u$_(module);
	return module;
}
/**
* Imports the module represented by the passed module URL.
*
* The module URL and all its dependencies are resolved using the
* current status of the internal dynamic import map.
*
* @param url       Module URL.
* @param fetchOpts Fetch options.
* @return A promise with the imported module.
*/
async function topLevelLoad(url, fetchOpts) {
	return importPreloadedModule(await preloadModule(url, fetchOpts));
}

// packages/interactivity-router/build-module/assets/dynamic-importmap/index.mjs
/**
* This code is derived from the following projects:
*
* 1. dynamic-importmap (https://github.com/keller-mark/dynamic-importmap)
* 2. es-module-shims (https://github.com/guybedford/es-module-shims)
*
* The original implementation was created by Guy Bedford in es-module-shims,
* then adapted by Mark Keller in dynamic-importmap, and further modified
* for use in this project.
*
* Both projects are licensed under the MIT license.
*
* MIT License: https://opensource.org/licenses/MIT
*/
const pageBaseUrl = document.baseURI;
Object.defineProperty(self, "wpInteractivityRouterImport", {
	value: importShim,
	writable: false,
	enumerable: false,
	configurable: false
});
async function importShim(id) {
	return topLevelLoad(resolve(id, pageBaseUrl), { credentials: "same-origin" });
}
/**
* Preloads the module with the passed ID along with its dependencies.
*
* The module is resolved against the internal dynamic import map,
* extended with the passed import map.
*
* @param id          Module ID.
* @param importMapIn Import map.
* @return Resolved `ModuleLoad` instance.
*/
async function preloadWithMap(id, importMapIn) {
	addImportMap(importMapIn);
	return preloadModule(resolve(id, pageBaseUrl), { credentials: "same-origin" });
}

// packages/interactivity-router/build-module/assets/script-modules.mjs
/**
* IDs of modules that should be resolved by the browser rather than
* processed internally.
*/
const resolvedScriptModules = /* @__PURE__ */ new Set();
/**
* Marks the specified module as natively resolved.
* @param url Script module URL.
*/
const markScriptModuleAsResolved = (url) => {
	resolvedScriptModules.add(url);
};
/**
* Resolves and fetches modules present in the passed document, using the
* document's import map to resolve them.
*
* @param doc Document containing the modules to preload.
* @return Array of promises that resolve to a `ScriptModuleLoad` instance.
*/
const preloadScriptModules = (doc) => {
	const importMapElement = doc.querySelector("script#wp-importmap[type=importmap]");
	const importMap = importMapElement ? JSON.parse(importMapElement.text) : {
		imports: {},
		scopes: {}
	};
	for (const key in initialImportMap.imports) delete importMap.imports[key];
	return [...doc.querySelectorAll("script[type=module][src][data-wp-router-options]")].filter((script) => {
		try {
			return JSON.parse(script.getAttribute("data-wp-router-options"))?.loadOnClientNavigation === true;
		} catch {
			return false;
		}
	}).map((script) => script.src).filter((url) => !resolvedScriptModules.has(url)).map((url) => preloadWithMap(url, importMap));
};
/**
* Imports modules represented by the passed `ScriptModuleLoad` instances.
*
* @param modules Array of `ModuleLoad` instances.
* @return Promise that resolves once all modules are imported.
*/
const importScriptModules = (modules) => Promise.all(modules.map((m) => importPreloadedModule(m)));

// packages/interactivity-router/build-module/index.mjs
const { getRegionRootFragment, initialVdomPromise, toVdom, parseDirectiveValue, getInteractiveNamespace, render, parseServerData, populateServerData, batch, routerRegions, h: createElement, navigationSignal, sessionId, warn, afterNextFrame, getScope, runWithoutScope } = privateApis("I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of WordPress.");
const regionAttr = `data-wp-router-region`;
const interactiveAttr = `data-wp-interactive`;
const regionsSelector = `[${interactiveAttr}][${regionAttr}], [${interactiveAttr}] [${regionAttr}]`;
/**
* Finds router regions outside `data-wp-html` content, in document order.
*
* A region is admitted when it carries `data-wp-interactive` itself or sits
* inside an element that does; a region without its own `data-wp-interactive`
* uses the namespace of its nearest interactive ancestor. Regions with neither
* are never hydrated and are not discovered.
*
* The `data-wp-html` check starts at the region's parent, because
* `data-wp-router-region` takes precedence over `data-wp-html` on the region
* itself. Regions nested in other regions are kept, so `preparePage()` can
* handle them as part of their parent's content.
*
* @param dom Document whose regions should be discovered.
* @return Router region elements that carry or inherit a namespace, outside
*         `data-wp-html` content.
*/
const discoverRegions = (dom) => Array.from(dom.querySelectorAll(regionsSelector)).filter((region) => !closestHtmlDirectiveElement(region.parentElement));
const pages = /* @__PURE__ */ new Map();
const getPagePath = (url) => {
	const u = new URL(url, window.location.href);
	return u.pathname + u.search;
};
/**
* Parses the given region's directive using the runtime's shared directive
* value parser.
*
* @param region Region element.
* @return The region `id` and optional `attachTo` selector.
*/
const parseRegionAttribute = (region) => {
	const { value } = parseDirectiveValue(region.getAttribute(regionAttr) ?? "");
	if (typeof value === "string") return { id: value };
	return {
		id: value.id,
		attachTo: value.attachTo
	};
};
/**
* Extracts the region id from a `data-wp-router-region` attribute value.
*
* The parser returns either a string or an object with an `id` property. Only
* a nonempty string id counts; anything else yields `null`.
*
* @param value The raw `data-wp-router-region` attribute value, or `null`.
* @return The region id, or `null` when no usable id is present.
*/
const parseRegionId = (value) => {
	if (value === null) return null;
	const { value: parsedValue } = parseDirectiveValue(value);
	const id = typeof parsedValue === "string" ? parsedValue : parsedValue.id;
	return typeof id === "string" && id ? id : null;
};
/**
* Converts a top-level router region to vDOM.
*
* The region's unprefixed directives resolve against the namespace of its
* nearest `data-wp-interactive` ancestor in the document that supplied it,
* exactly as hydrating that document would resolve them. A
* `data-wp-interactive` on the region or inside it takes precedence. A region
* without such an ancestor is converted without a namespace.
*
* @param region Region element, in the document that supplies it.
* @return The region's vDOM.
*/
const regionToVdom = (region) => {
	const ancestor = region.parentElement?.closest(`[${interactiveAttr}]`);
	return ancestor ? toVdom(region, getInteractiveNamespace(parseDirectiveValue(ancestor.getAttribute(interactiveAttr) ?? "").value)) : toVdom(region);
};
/**
* Clones the content of the router region vDOM passed as argument.
*
* The function creates a new VNode instance removing all priority levels up to
* the one containing the router-region directive, which should have evaluated
* in advance.
*
* @param vdom A router region's VNode.
* @return The VNode for the passed router region's content.
*/
const cloneRouterRegionContent = (vdom) => {
	if (!vdom) return vdom;
	const allPriorityLevels = vdom.props.priorityLevels;
	const routerRegionLevel = allPriorityLevels.findIndex((level) => level.includes("router-region"));
	const priorityLevels = routerRegionLevel !== -1 ? allPriorityLevels.slice(routerRegionLevel + 1) : allPriorityLevels;
	return priorityLevels.length > 0 ? createElement(vdom.type, {
		...vdom.props,
		priorityLevels
	}) : vdom.props.element;
};
/**
* IDs of router regions with an `attachTo` property pointing to the same parent
* element.
*/
const regionsToAttachByParent = /* @__PURE__ */ new WeakMap();
/**
* Map of root fragments by parent element, used to render router regions with
* the `attachTo` property. Those elements with the same parent are rendered
* together in the corresponding root fragment.
*/
const rootFragmentsByParent = /* @__PURE__ */ new WeakMap();
/**
* Set of router regions using the `attachTo` property that are present in the
* initial page.
*
* These regions should be treated as regular regions without the `attachTo`
* attribute as they don't need to be appended; they are already in the HTML.
*/
const initialRegionsToAttach = /* @__PURE__ */ new Set();
/**
* Checks whether a fetched response can be processed as a page.
*
* Only a successful, same-origin response that the browser would display as
* an HTML page is accepted. Any other response, such as an uploaded file
* served with a non-HTML content type, is rejected so that none of its content
* is processed.
*
* @param response The fetched response.
* @return Whether the response can be processed as a page.
*/
const isValidPageResponse = (response) => {
	if (response.status !== 200) return false;
	try {
		if (new URL(response.url).origin !== window.location.origin) return false;
	} catch {
		return false;
	}
	const contentType = response.headers.get("content-type") ?? "";
	if (contentType.includes(",") || contentType.split(";")[0].trim().toLowerCase() !== "text/html") return false;
	return true;
};
/**
* Fetches and prepares a page from a given URL.
*
* @param url          The path and query of the page to fetch.
* @param options      Options for the fetch operation.
* @param options.html Optional HTML content. If provided, the function will use
*                     this instead of fetching from the URL.
* @return             A Promise that resolves to the prepared page, or false if
*                     there was an error during fetching or preparation, or if
*                     the fetched response is not a valid page.
*/
const fetchPage = async (url, { html }) => {
	try {
		if (!html) {
			const requestUrl = new URL(url, window.location.href);
			if (requestUrl.origin !== window.location.origin) return false;
			const res = await window.fetch(requestUrl.href);
			if (!isValidPageResponse(res)) return false;
			html = await res.text();
		}
		const dom = new window.DOMParser().parseFromString(html, "text/html");
		return await preparePage(url, dom);
	} catch {
		return false;
	}
};
/**
* Processes a DOM document to extract router regions and related resources.
*
* This function analyzes the provided DOM document and creates a virtual DOM
* representation of regions marked with a `router-region` directive outside
* `data-wp-html` content.
* It also extracts and preloads associated styles and scripts to prepare for
* rendering the page.
*
* @param url             The URL associated with the page, used for asset
*                        loading and caching.
* @param dom             The DOM document to process.
* @param vdomParams      Optional parameters for virtual DOM processing.
* @param vdomParams.vdom An optional existing virtual DOM cache to check for
*                        regions. If a region exists in this cache, it will be
*                        reused instead of creating a new vDOM representation.
* @return                A Promise that resolves to a {@link Page} object
*                        containing the virtual DOM for discovered router regions,
*                        preloaded styles and scripts, page title, and initial
*                        server-rendered data.
*/
const preparePage = async (url, dom, { vdom } = {}) => {
	dom.querySelectorAll("noscript").forEach((el) => el.remove());
	const regions = Object.create(null);
	const regionsToAttach = Object.create(null);
	discoverRegions(dom).forEach((region) => {
		const { id, attachTo } = parseRegionAttribute(region);
		if (region.parentElement.closest(`[${regionAttr}]`)) regions[id] = void 0;
		else regions[id] = vdom?.has(region) ? vdom.get(region) : regionToVdom(region);
		if (attachTo && !initialRegionsToAttach.has(id)) regionsToAttach[id] = attachTo;
	});
	const title = dom.querySelector("title")?.innerText;
	const initialData = parseServerData(dom);
	const [styles, scriptModules] = await Promise.all([Promise.all(preloadStyles(dom)), Promise.all(preloadScriptModules(dom))]);
	return {
		regions,
		regionsToAttach,
		styles,
		scriptModules,
		title,
		initialData,
		url
	};
};
/**
* Finds the first element matching `selector` in the live document that
* neither has inert `data-wp-html` content nor sits inside it.
*
* @param selector CSS selector resolved against the live document.
* @return The first usable element, or null if none exists or the selector
*         is invalid.
*/
const resolveAttachTarget = (selector) => {
	try {
		for (const element of document.querySelectorAll(selector)) if (!closestHtmlDirectiveElement(element)) return element;
	} catch {}
	return null;
};
/**
* Renders a page by applying styles, populating server data, rendering regions,
* and updating the document title. Pending attachments resolve against the live
* document on every render, including history restores. A region without a
* usable target is omitted from this render without altering the cached page.
* Preact callbacks invoked while attaching regions run without a directive
* scope.
*
* @param page The {@link Page} object to render.
*/
const renderPage = (page) => {
	applyStyles(page.styles);
	const regions = Object.assign(Object.create(null), page.regions);
	batch(() => {
		populateServerData(page.initialData);
		navigationSignal.value += 1;
		routerRegions.forEach((signal) => {
			signal.value = null;
		});
		const parentsToUpdate = /* @__PURE__ */ new Set();
		for (const id in page.regionsToAttach) {
			const parent = resolveAttachTarget(page.regionsToAttach[id]);
			if (!parent) {
				delete regions[id];
				continue;
			}
			if (!regionsToAttachByParent.has(parent)) regionsToAttachByParent.set(parent, []);
			const ids = regionsToAttachByParent.get(parent);
			if (!ids.includes(id)) {
				ids.push(id);
				parentsToUpdate.add(parent);
			}
		}
		for (const id in regions) if (routerRegions.has(id)) routerRegions.get(id).value = cloneRouterRegionContent(regions[id]);
		parentsToUpdate.forEach((parent) => {
			const vdoms = regionsToAttachByParent.get(parent).map((id) => regions[id]);
			if (!rootFragmentsByParent.has(parent)) {
				const roots = vdoms.map(({ props, type }) => {
					const elementType = typeof type === "function" ? props.type : type;
					const region = document.createElement(elementType);
					parent.appendChild(region);
					return region;
				});
				rootFragmentsByParent.set(parent, getRegionRootFragment(roots));
			}
			const fragment = rootFragmentsByParent.get(parent);
			runWithoutScope(() => render(vdoms, fragment));
		});
	});
	if (page.title) document.title = page.title;
};
/**
* Loads the given page forcing a full page reload.
*
* The function returns a promise that won't resolve, useful to prevent any
* potential feedback indicating that the navigation has finished while the new
* page is being loaded.
*
* @param href The page href.
* @return Promise that never resolves.
*/
const forcePageReload = (href) => {
	window.location.assign(href);
	return new Promise(() => {});
};
const LIFECYCLE_RELEASE_BOUND = 1e4;
const reloadAndDischarge = (token) => {
	try {
		window.location.reload();
	} finally {
		if (currentNavigationId === token && (state.navigating || state.initiator !== null && state.initiator !== void 0)) batch(() => {
			if (state.navigating) state.navigating = false;
			if (state.initiator !== null) state.initiator = null;
		});
	}
};
window.addEventListener("popstate", async () => {
	const pagePath = getPagePath(window.location.href);
	const token = ++navigationId;
	currentNavigationId = token;
	setTimeout(() => {
		if (currentNavigationId === token && state.navigating) state.navigating = false;
	}, LIFECYCLE_RELEASE_BOUND);
	if (!pages.has(pagePath)) {
		reloadAndDischarge(token);
		return;
	}
	try {
		if (state.initiator !== null && state.initiator !== void 0) state.initiator = null;
		const page = await pages.get(pagePath);
		if (!page) {
			reloadAndDischarge(token);
			return;
		}
		if (currentNavigationId === token) batch(() => {
			state.navigating = true;
			state.initiator = null;
		});
		batch(() => {
			state.url = window.location.href;
			renderPage(page);
		});
		if (currentNavigationId === token) afterNextFrame(() => {
			if (currentNavigationId === token) state.navigating = false;
		});
	} catch (error) {
		if (currentNavigationId === token && state.navigating) afterNextFrame(() => {
			if (currentNavigationId === token) state.navigating = false;
		});
		throw error;
	}
});
discoverRegions(document).forEach((region) => {
	const { id, attachTo } = parseRegionAttribute(region);
	if (attachTo) initialRegionsToAttach.add(id);
});
window.document.querySelectorAll("script[type=module][src]").forEach(({ src }) => markScriptModuleAsResolved(src));
(async () => {
	const initialVdomMap = await initialVdomPromise;
	pages.set(getPagePath(window.location.href), Promise.resolve(preparePage(getPagePath(window.location.href), document, { vdom: initialVdomMap })));
})();
let navigatingTo = "";
let navigationId = 0;
let currentNavigationId = 0;
let hasLoadedNavigationTextsData = false;
const navigationTexts = {
	loading: "Loading page, please wait.",
	loaded: "Page Loaded."
};
/**
* Resolves the `initiator` option of `actions.navigate()` into the value
* published on `state.initiator`.
*
* A nonempty string is returned as is; `null` suppresses attribution silently.
* When the option is omitted, the initiator is derived from
* whatever directive scope is ambient when the action is called: the id of
* the closest router region (including the element itself), or `null` when
* there is none. An unwrapped `watch()` callback contributes no scope, while
* a `withScope()`-wrapped callback contributes the scope it installed. An
* empty string or any other invalid value warns when `SCRIPT_DEBUG` is
* enabled, resolves to `null`, and never derives an initiator.
*
* Derivation never throws. It returns `null` for a call made outside any
* scope, for a scope whose `ref.current` is not an element, and for an
* element with no enclosing region. There is no `isConnected` check on
* purpose: a detached element still inside a region reports that region.
*
* It must run synchronously at the start of `navigate()`, before any
* `yield`, because the store proxy only keeps the caller's scope active for
* the synchronous part of the call. Timer callbacks and awaited
* continuations run without it.
*
* @param declared The raw `options.initiator` value passed to `navigate()`.
* @return The value to publish on `state.initiator`.
*/
const resolveInitiator = (declared) => {
	if (typeof declared === "string" && declared !== "") return declared;
	if (declared === null) return null;
	if (declared === void 0) {
		const element = getScope()?.ref?.current;
		if (typeof element?.closest !== "function") return null;
		const region = element.closest(`[${regionAttr}]`);
		if (!region) return null;
		return parseRegionId(region.getAttribute(regionAttr));
	}
	warn("The `initiator` option of `actions.navigate()` must be a nonempty string or null. Ignoring the value.");
	return null;
};
const { state: privateState } = store("core/router/private", { state: { navigation: {
	hasStarted: false,
	hasFinished: false
} } }, { lock: true });
const { state, actions } = store("core/router", {
	state: { get navigation() {
		warn(`The usage of state.navigation.{hasStarted|hasFinished} from core/router is deprecated and will stop working in WordPress 7.1.`);
		return privateState.navigation;
	} },
	actions: {
		/**
		* Navigates to the specified page.
		*
		* This function normalizes the passed href, fetches the page HTML if
		* needed, and updates any interactive regions whose contents have
		* changed. It also creates a new entry in the browser session history.
		*
		* @param href                               The page href.
		* @param [options]                          Options object.
		* @param [options.force]                    If true, it forces re-fetching the URL.
		* @param [options.html]                     HTML string to be used instead of fetching the requested URL.
		* @param [options.replace]                  If true, it replaces the current entry in the browser session history.
		* @param [options.timeout]                  Time until the navigation is aborted, in milliseconds. Default is 10000.
		* @param [options.loadingAnimation]         Whether an animation should be shown while navigating. Default to `true`.
		* @param [options.screenReaderAnnouncement] Whether a message for screen readers should be announced while navigating. Default to `true`.
		* @param [options.initiator]                Who started the navigation. A nonempty string is used as is; `null` suppresses attribution silently; omitting it derives the value from the directive scope. An empty string or any other invalid value warns when `SCRIPT_DEBUG` is enabled, resolves to `null`, and never derives an initiator.
		*
		* @return  Promise that resolves once the navigation is completed or aborted.
		*/
		*navigate(href, options = {}) {
			options = Object.assign(Object.create(null), options);
			const { clientNavigationDisabled } = getConfig();
			if (clientNavigationDisabled) yield forcePageReload(href);
			const initiator = resolveInitiator(options.initiator);
			const pagePath = getPagePath(href);
			const { navigation } = privateState;
			const { loadingAnimation = true, screenReaderAnnouncement = true, timeout = 1e4 } = options;
			navigatingTo = href;
			actions.prefetch(pagePath, options);
			const timeoutPromise = new Promise((resolve) => setTimeout(resolve, timeout));
			const loadingTimeout = setTimeout(() => {
				if (navigatingTo !== href) return;
				if (loadingAnimation) {
					navigation.hasStarted = true;
					navigation.hasFinished = false;
				}
				if (screenReaderAnnouncement) a11ySpeak("loading");
			}, 400);
			const token = ++navigationId;
			currentNavigationId = token;
			try {
				batch(() => {
					state.navigating = true;
					state.initiator = initiator;
				});
				const page = yield Promise.race([pages.get(pagePath), timeoutPromise]);
				clearTimeout(loadingTimeout);
				if (navigatingTo !== href) return;
				if (page && !page.initialData?.config?.["core/router"]?.clientNavigationDisabled) {
					yield importScriptModules(page.scriptModules);
					batch(() => {
						state.url = href;
						if (loadingAnimation) {
							navigation.hasStarted = false;
							navigation.hasFinished = true;
						}
						renderPage(page);
					});
					window.history[options.replace ? "replaceState" : "pushState"]({ wpInteractivityId: sessionId }, "", href);
					if (screenReaderAnnouncement) a11ySpeak("loaded");
					const { hash } = new URL(href, window.location.href);
					if (hash) document.querySelector(hash)?.scrollIntoView();
				} else {
					setTimeout(() => {
						if (currentNavigationId === token && state.navigating) state.navigating = false;
					}, LIFECYCLE_RELEASE_BOUND);
					yield forcePageReload(href);
				}
			} finally {
				if (currentNavigationId === token) afterNextFrame(() => {
					if (currentNavigationId === token) state.navigating = false;
				});
			}
		},
		/**
		* Prefetches the page with the passed URL.
		*
		* The function normalizes the URL and stores internally the fetch
		* promise, to avoid triggering a second fetch for an ongoing request.
		*
		* @param url             The page URL.
		* @param [options]       Options object.
		* @param [options.force] Force fetching the URL again.
		* @param [options.html]  HTML string to be used instead of fetching the requested URL.
		*
		* @return  Promise that resolves once the page has been fetched.
		*/
		*prefetch(url, options = {}) {
			options = Object.assign(Object.create(null), options);
			const { clientNavigationDisabled } = getConfig();
			if (clientNavigationDisabled) return;
			const pagePath = getPagePath(url);
			if (options.force || !pages.has(pagePath)) pages.set(pagePath, fetchPage(pagePath, { html: options.html }));
			yield pages.get(pagePath);
		}
	}
});
state.url = state.url || window.location.href;
/**
* Announces a message to screen readers.
*
* This is a wrapper around the `@wordpress/a11y` package's `speak` function. It handles importing
* the package on demand and should be used instead of calling `a11y.speak` directly.
*
* @param messageKey The message to be announced by assistive technologies.
*/
function a11ySpeak(messageKey) {
	if (!hasLoadedNavigationTextsData) {
		hasLoadedNavigationTextsData = true;
		const script = document.querySelector("script[id=\"wp-script-module-data-@wordpress/interactivity-router\"]");
		if (script instanceof HTMLScriptElement) try {
			const parsed = JSON.parse(script.text);
			if (typeof parsed?.i18n?.loading === "string") navigationTexts.loading = parsed.i18n.loading;
			if (typeof parsed?.i18n?.loaded === "string") navigationTexts.loaded = parsed.i18n.loaded;
		} catch {}
		else {
			if (state.navigation.texts?.loading) navigationTexts.loading = state.navigation.texts.loading;
			if (state.navigation.texts?.loaded) navigationTexts.loaded = state.navigation.texts.loaded;
		}
	}
	const message = navigationTexts[messageKey];
	import("@wordpress/a11y").then(({ speak }) => speak(message), () => {});
}

export { actions, state };
//# sourceMappingURL=index.js.map