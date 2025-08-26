import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
/******/ var __webpack_modules__ = ({

/***/ 317:
/***/ ((module) => {

module.exports = import("@wordpress/a11y");;

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  o: () => (/* binding */ actions),
  w: () => (/* binding */ state)
});

;// external "@wordpress/interactivity"
var x = (y) => {
	var x = {}; __webpack_require__.d(x, y); return x
} 
var y = (x) => (() => (x))
const interactivity_namespaceObject = x({ ["getConfig"]: () => (__WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__.getConfig), ["privateApis"]: () => (__WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__.privateApis), ["store"]: () => (__WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__.store) });
;// ./packages/interactivity-router/build-module/assets/scs.js
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

  // Create a 2D dp table where dp[i][j] is the SCS for X[0..i-1] and Y[0..j-1].
  const dp = Array.from({
    length: m + 1
  }, () => Array(n + 1).fill(null));

  // Base cases: one of the sequences is empty.
  for (let i = 0; i <= m; i++) {
    dp[i][0] = X.slice(0, i);
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = Y.slice(0, j);
  }

  // Fill in the dp table.
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (isEqual(X[i - 1], Y[j - 1])) {
        // When X[i-1] equals Y[j-1], use the reference from X.
        dp[i][j] = dp[i - 1][j - 1].concat(X[i - 1]);
      } else {
        // Choose the shorter option between appending X[i-1] or Y[j-1].
        const option1 = dp[i - 1][j].concat(X[i - 1]);
        const option2 = dp[i][j - 1].concat(Y[j - 1]);
        dp[i][j] = option1.length <= option2.length ? option1 : option2;
      }
    }
  }
  return dp[m][n];
}

;// ./packages/interactivity-router/build-module/assets/styles.js
/**
 * Internal dependencies
 */

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
const normalizeMedia = element => {
  element = element.cloneNode(true);
  const media = element.media;
  const {
    originalMedia
  } = element.dataset;
  if (media === 'preload') {
    element.media = originalMedia || 'all';
    element.removeAttribute('data-original-media');
  } else if (!element.media) {
    element.media = 'all';
  }
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
  if (X.length === 0) {
    return Y.map(element => {
      const promise = prepareStylePromise(element);
      parent.appendChild(element);
      return promise;
    });
  }

  // Create normalized arrays for comparison.
  const xNormalized = X.map(normalizeMedia);
  const yNormalized = Y.map(normalizeMedia);

  // The `scs` array contains normalized elements.
  const scs = shortestCommonSupersequence(xNormalized, yNormalized, areNodesEqual);
  const xLength = X.length;
  const yLength = Y.length;
  const promises = [];
  let last = X[xLength - 1];
  let xIndex = 0;
  let yIndex = 0;
  for (const scsElement of scs) {
    // Actual elements that will end up in the DOM.
    const xElement = X[xIndex];
    const yElement = Y[yIndex];
    // Normalized elements for comparison.
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
      if (xIndex < xLength) {
        xElement.before(yElement);
      } else {
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
const stylePromiseCache = new WeakMap();

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
const prepareStylePromise = element => {
  if (stylePromiseCache.has(element)) {
    return stylePromiseCache.get(element);
  }

  // When the element exists in the main document and its media attribute
  // is not "preload", that means the element comes from the initial page.
  // The `media` attribute doesn't need to be handled in this case.
  if (window.document.contains(element) && element.media !== 'preload') {
    const promise = Promise.resolve(element);
    stylePromiseCache.set(element, promise);
    return promise;
  }
  if (element.hasAttribute('media') && element.media !== 'all') {
    element.dataset.originalMedia = element.media;
  }
  element.media = 'preload';
  if (element instanceof HTMLStyleElement) {
    const promise = Promise.resolve(element);
    stylePromiseCache.set(element, promise);
    return promise;
  }
  const promise = new Promise((resolve, reject) => {
    element.addEventListener('load', () => resolve(element));
    element.addEventListener('error', event => {
      const {
        href
      } = event.target;
      reject(Error(`The style sheet with the following URL failed to load: ${href}`));
    });
  });
  stylePromiseCache.set(element, promise);
  return promise;
};

/**
 * Cache of style promise lists per URL.
 *
 * It contains the list of style elements associated to the page with the
 * passed URL. The original order is preserved to respect the CSS cascade.
 *
 * Each included promise resolves when the associated style element is ready.
 */
const styleSheetCache = new Map();

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
 * @param doc Document instance.
 * @param url URL for the passed document.
 * @return A list of promises for each style element in the passed document.
 */
const preloadStyles = (doc, url) => {
  if (!styleSheetCache.has(url)) {
    const currentStyleElements = Array.from(window.document.querySelectorAll('style,link[rel=stylesheet]'));
    const newStyleElements = Array.from(doc.querySelectorAll('style,link[rel=stylesheet]'));

    // Set styles in order.
    const stylePromises = updateStylesWithSCS(currentStyleElements, newStyleElements);
    styleSheetCache.set(url, stylePromises);
  }
  return styleSheetCache.get(url);
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
const applyStyles = styles => {
  window.document.querySelectorAll('style,link[rel=stylesheet]').forEach(el => {
    if (el.sheet) {
      if (styles.includes(el)) {
        // Only update mediaText when necessary.
        if (el.sheet.media.mediaText === 'preload') {
          const {
            originalMedia = 'all'
          } = el.dataset;
          el.sheet.media.mediaText = originalMedia;
        }
        el.sheet.disabled = false;
      } else {
        el.sheet.disabled = true;
      }
    }
  });
};

;// ./packages/interactivity-router/build-module/assets/dynamic-importmap/resolver.js
/* wp:polyfill */
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
  if (url.indexOf(':') === -1) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}
function resolveIfNotPlainOrUrl(relUrl, parentUrl) {
  const hIdx = parentUrl.indexOf('#'),
    qIdx = parentUrl.indexOf('?');
  if (hIdx + qIdx > -2) {
    parentUrl = parentUrl.slice(0,
    // eslint-disable-next-line no-nested-ternary
    hIdx === -1 ? qIdx : qIdx === -1 || qIdx > hIdx ? hIdx : qIdx);
  }
  if (relUrl.indexOf('\\') !== -1) {
    relUrl = relUrl.replace(backslashRegEx, '/');
  }
  // protocol-relative
  if (relUrl[0] === '/' && relUrl[1] === '/') {
    return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
  }
  // relative-url
  else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) || relUrl.length === 1 && (relUrl += '/')) || relUrl[0] === '/') {
    const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
    // Disabled, but these cases will give inconsistent results for deep backtracking
    //if (parentUrl[parentProtocol.length] !== '/')
    //  throw new Error('Cannot resolve');
    // read pathname from parent URL
    // pathname taken to be part after leading "/"
    let pathname;
    if (parentUrl[parentProtocol.length + 1] === '/') {
      // resolving to a :// so we need to read out the auth and host
      if (parentProtocol !== 'file:') {
        pathname = parentUrl.slice(parentProtocol.length + 2);
        pathname = pathname.slice(pathname.indexOf('/') + 1);
      } else {
        pathname = parentUrl.slice(8);
      }
    } else {
      // resolving to :/ so pathname is the /... part
      pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
    }
    if (relUrl[0] === '/') {
      return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;
    }

    // join together and split for removal of .. and . segments
    // looping the string instead of anything fancy for perf reasons
    // '../../../../../z' resolved to 'x/y' is just 'z'
    const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;
    const output = [];
    let segmentIndex = -1;
    for (let i = 0; i < segmented.length; i++) {
      // busy reading a segment - only terminate on '/'
      if (segmentIndex !== -1) {
        if (segmented[i] === '/') {
          output.push(segmented.slice(segmentIndex, i + 1));
          segmentIndex = -1;
        }
        continue;
      }
      // new segment - check if it is relative
      else if (segmented[i] === '.') {
        // ../ segment
        if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
          output.pop();
          i += 2;
          continue;
        }
        // ./ segment
        else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
          i += 1;
          continue;
        }
      }
      // it is the start of a new segment
      while (segmented[i] === '/') {
        i++;
      }
      segmentIndex = i;
    }
    // finish reading out the last segment
    if (segmentIndex !== -1) {
      output.push(segmented.slice(segmentIndex));
    }
    return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
  }
}
function resolveUrl(relUrl, parentUrl) {
  return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (isURL(relUrl) ? relUrl : resolveIfNotPlainOrUrl('./' + relUrl, parentUrl));
}
function getMatch(path, matchObj) {
  if (matchObj[path]) {
    return path;
  }
  let sepIndex = path.length;
  do {
    const segment = path.slice(0, sepIndex + 1);
    if (segment in matchObj) {
      return segment;
    }
  } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1);
}
function applyPackages(id, packages) {
  const pkgName = getMatch(id, packages);
  if (pkgName) {
    const pkg = packages[pkgName];
    if (pkg === null) {
      return;
    }
    return pkg + id.slice(pkgName.length);
  }
}
function resolveImportMap(importMap, resolvedOrPlain, parentUrl) {
  let scopeUrl = parentUrl && getMatch(parentUrl, importMap.scopes);
  while (scopeUrl) {
    const packageResolution = applyPackages(resolvedOrPlain, importMap.scopes[scopeUrl]);
    if (packageResolution) {
      return packageResolution;
    }
    scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), importMap.scopes);
  }
  return applyPackages(resolvedOrPlain, importMap.imports) || resolvedOrPlain.indexOf(':') !== -1 && resolvedOrPlain;
}
function resolveAndComposePackages(packages, outPackages, baseUrl, parentMap) {
  for (const p in packages) {
    const resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
    const target = packages[p];
    if (typeof target !== 'string') {
      continue;
    }
    const mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(target, baseUrl) || target, baseUrl);
    if (mapped) {
      outPackages[resolvedLhs] = mapped;
      continue;
    }
    // console.warn(
    // 	`Mapping "${ p }" -> "${ packages[ p ] }" does not resolve`
    // );
  }
}
function resolveAndComposeImportMap(json, baseUrl, parentMap) {
  const outMap = {
    imports: Object.assign({}, parentMap.imports),
    scopes: Object.assign({}, parentMap.scopes)
  };
  if (json.imports) {
    resolveAndComposePackages(json.imports, outMap.imports, baseUrl, parentMap);
  }
  if (json.scopes) {
    for (const s in json.scopes) {
      const resolvedScope = resolveUrl(s, baseUrl);
      resolveAndComposePackages(json.scopes[s], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, parentMap);
    }
  }
  return outMap;
}
let importMap = {
  imports: {},
  scopes: {}
};

// TODO: check if this baseURI should change per document, and so
// it need to be passed as a parameter to methods like `resolve`.
const baseUrl = document.baseURI;
const pageBaseUrl = baseUrl;

/**
 * Extends the internal dynamic import map with the passed one.
 *
 * @param importMapIn         Import map.
 * @param importMapIn.imports Imports declaration.
 * @param importMapIn.scopes  Scopes declaration.
 */
function resolver_addImportMap(importMapIn) {
  importMap = resolveAndComposeImportMap(importMapIn, pageBaseUrl, importMap);
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

;// ./node_modules/es-module-lexer/dist/lexer.js
/* es-module-lexer 1.5.4 */
var ImportType;!function(A){A[A.Static=1]="Static",A[A.Dynamic=2]="Dynamic",A[A.ImportMeta=3]="ImportMeta",A[A.StaticSourcePhase=4]="StaticSourcePhase",A[A.DynamicSourcePhase=5]="DynamicSourcePhase"}(ImportType||(ImportType={}));const A=1===new Uint8Array(new Uint16Array([1]).buffer)[0];function parse(E,g="@"){if(!C)return init.then((()=>parse(E)));const I=E.length+1,w=(C.__heap_base.value||C.__heap_base)+4*I-C.memory.buffer.byteLength;w>0&&C.memory.grow(Math.ceil(w/65536));const K=C.sa(I-1);if((A?B:Q)(E,new Uint16Array(C.memory.buffer,K,I)),!C.parse())throw Object.assign(new Error(`Parse error ${g}:${E.slice(0,C.e()).split("\n").length}:${C.e()-E.lastIndexOf("\n",C.e()-1)}`),{idx:C.e()});const D=[],o=[];for(;C.ri();){const A=C.is(),Q=C.ie(),B=C.it(),g=C.ai(),I=C.id(),w=C.ss(),K=C.se();let o;C.ip()&&(o=k(E.slice(-1===I?A-1:A,-1===I?Q+1:Q))),D.push({n:o,t:B,s:A,e:Q,ss:w,se:K,d:I,a:g})}for(;C.re();){const A=C.es(),Q=C.ee(),B=C.els(),g=C.ele(),I=E.slice(A,Q),w=I[0],K=B<0?void 0:E.slice(B,g),D=K?K[0]:"";o.push({s:A,e:Q,ls:B,le:g,n:'"'===w||"'"===w?k(I):I,ln:'"'===D||"'"===D?k(K):K})}function k(A){try{return(0,eval)(A)}catch(A){}}return[D,o,!!C.f(),!!C.ms()]}function Q(A,Q){const B=A.length;let C=0;for(;C<B;){const B=A.charCodeAt(C);Q[C++]=(255&B)<<8|B>>>8}}function B(A,Q){const B=A.length;let C=0;for(;C<B;)Q[C]=A.charCodeAt(C++)}let C;const init=WebAssembly.compile((E="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","undefined"!=typeof Buffer?Buffer.from(E,"base64"):Uint8Array.from(atob(E),(A=>A.charCodeAt(0))))).then(WebAssembly.instantiate).then((({exports:A})=>{C=A}));var E;
;// ./packages/interactivity-router/build-module/assets/dynamic-importmap/fetch.js
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
 * Internal dependencies
 */

const fetching = (url, parent) => {
  return ` fetching ${url}${parent ? ` from ${parent}` : ''}`;
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
  } catch (e) {
    throw Error(`Network error${fetching(url, parent)}.`);
  }
  if (!res.ok) {
    throw Error(`Error ${res.status}${fetching(url, parent)}.`);
  }
  const contentType = res.headers.get('content-type');
  if (!jsContentType.test(contentType)) {
    throw Error(`Bad Content-Type "${contentType}"${fetching(url, parent)}.`);
  }
  return {
    responseUrl: res.url,
    source: await res.text()
  };
}

;// ./packages/interactivity-router/build-module/assets/dynamic-importmap/loader.js
/* wp:polyfill */
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
 * External dependencies
 */


/**
 * Internal dependencies
 */


const initPromise = init;

/**
 * Script element containing the initial page's import map.
 */
const initialImportMapElement = window.document.querySelector('script#wp-importmap[type=importmap]');

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
const skip = id => Object.keys(initialImportMap.imports).includes(id);
const fetchCache = {};
const registry = {};

// Init registry with importamp content.
Object.keys(initialImportMap.imports).forEach(id => {
  registry[id] = {
    blobUrl: id
  };
});
async function loadAll(load, seen) {
  if (load.blobUrl || seen[load.url]) {
    return;
  }
  seen[load.url] = 1;
  await load.linkPromise;
  await Promise.all(load.deps.map(dep => loadAll(dep, seen)));
}
function urlJsString(url) {
  return `'${url.replace(/'/g, "\\'")}'`;
}
const createBlob = (source, type = 'text/javascript') => URL.createObjectURL(new Blob([source], {
  type
}));
function resolveDeps(load, seen) {
  if (load.blobUrl || !seen[load.url]) {
    return;
  }
  seen[load.url] = 0;
  for (const dep of load.deps) {
    resolveDeps(dep, seen);
  }
  const [imports, exports] = load.analysis;
  const source = load.source;
  let resolvedSource = '';
  if (!imports.length) {
    resolvedSource += source;
  } else {
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
    for (const {
      s: start,
      ss: statementStart,
      se: statementEnd,
      d: dynamicImportIndex
    } of imports) {
      // static import
      if (dynamicImportIndex === -1) {
        const depLoad = load.deps[depIndex++];
        let blobUrl = depLoad.blobUrl;
        const cycleShell = !blobUrl;
        if (cycleShell) {
          // Circular shell creation
          if (!(blobUrl = depLoad.shellUrl)) {
            blobUrl = depLoad.shellUrl = createBlob(`export function u$_(m){${depLoad.analysis[1].map(({
              s,
              e
            }, i) => {
              const q = depLoad.source[s] === '"' || depLoad.source[s] === "'";
              return `e$_${i}=m${q ? `[` : '.'}${depLoad.source.slice(s, e)}${q ? `]` : ''}`;
            }).join(',')}}${depLoad.analysis[1].length ? `let ${depLoad.analysis[1].map((_, i) => `e$_${i}`).join(',')};` : ''}export {${depLoad.analysis[1].map(({
              s,
              e
            }, i) => `e$_${i} as ${depLoad.source.slice(s, e)}`).join(',')}}\n//# sourceURL=${depLoad.responseUrl}?cycle`);
          }
        }
        pushStringTo(start - 1);
        resolvedSource += `/*${source.slice(start - 1, statementEnd)}*/${urlJsString(blobUrl)}`;

        // circular shell execution
        if (!cycleShell && depLoad.shellUrl) {
          resolvedSource += `;import*as m$_${depIndex} from'${depLoad.blobUrl}';import{u$_ as u$_${depIndex}}from'${depLoad.shellUrl}';u$_${depIndex}(m$_${depIndex})`;
          depLoad.shellUrl = undefined;
        }
        lastIndex = statementEnd;
      }
      // import.meta
      else if (dynamicImportIndex === -2) {
        throw Error('The import.meta property is not supported.');
      }
      // dynamic import
      else {
        pushStringTo(statementStart);
        resolvedSource += `wpInteractivityRouterImport(`;
        dynamicImportEndStack.push(statementEnd - 1);
        lastIndex = start;
      }
    }

    // progressive cycle binding updates
    if (load.shellUrl) {
      resolvedSource += `\n;import{u$_}from'${load.shellUrl}';try{u$_({${exports.filter(e => e.ln).map(({
        s,
        e,
        ln
      }) => `${source.slice(s, e)}:${ln}`).join(',')}})}catch(_){};\n`;
    }
    pushStringTo(source.length);
  }

  // ensure we have a proper sourceURL
  let hasSourceURL = false;
  resolvedSource = resolvedSource.replace(sourceMapURLRegEx, (match, isMapping, url) => {
    hasSourceURL = !isMapping;
    return match.replace(url, () => new URL(url, load.responseUrl).toString());
  });
  if (!hasSourceURL) {
    resolvedSource += '\n//# sourceURL=' + load.responseUrl;
  }
  load.blobUrl = createBlob(resolvedSource);
  load.source = undefined; // free memory
}
const sourceMapURLRegEx = /\n\/\/# source(Mapping)?URL=([^\n]+)\s*((;|\/\/[^#][^\n]*)\s*)*$/;
function getOrCreateLoad(url, fetchOpts, parent) {
  let load = registry[url];
  if (load) {
    return load;
  }
  load = {
    url
  };
  if (registry[url]) {
    // If there's a naming conflict, keep incrementing until unique
    let i = 0;
    while (registry[load.url + ++i]) {
      /* no-op */
    }
    load.url += i;
  }
  registry[load.url] = load;
  load.fetchPromise = (async () => {
    let source;
    ({
      responseUrl: load.responseUrl,
      source: source
    } = await (fetchCache[url] || fetchModule(url, fetchOpts, parent)));
    try {
      load.analysis = parse(source, load.url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      load.analysis = [[], [], false, false];
    }
    load.source = source;
    return load;
  })();
  load.linkPromise = load.fetchPromise.then(async () => {
    let childFetchOpts = fetchOpts;
    load.deps = (await Promise.all(load.analysis[0].map(async ({
      n,
      d
    }) => {
      if (d !== -1 || !n) {
        return undefined;
      }
      const responseUrl = resolve(n, load.responseUrl || load.url);
      if (skip && skip(responseUrl)) {
        return {
          blobUrl: responseUrl
        };
      }
      // remove integrity for child fetches
      if (childFetchOpts.integrity) {
        childFetchOpts = {
          ...childFetchOpts,
          integrity: undefined
        };
      }
      return getOrCreateLoad(responseUrl, childFetchOpts, load.responseUrl).fetchPromise;
    }))).filter(l => l);
  });
  return load;
}
const dynamicImport = u => import(/* webpackIgnore: true */u);

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
  await initPromise;
  const load = getOrCreateLoad(url, fetchOpts, null);
  const seen = {};
  await loadAll(load, seen);
  resolveDeps(load, seen);
  // microtask scheduling – can help ensure Blob is fully ready
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
  // if the preloaded module ended up with a shell (circular refs), finalize it
  if (load.shellUrl) {
    (await dynamicImport(load.shellUrl)).u$_(module);
  }
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
  const load = await preloadModule(url, fetchOpts);
  return importPreloadedModule(load);
}

;// ./packages/interactivity-router/build-module/assets/dynamic-importmap/index.js
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
 * Internal dependencies
 */


// TODO: check if this baseURI should change per document, and so
// it need to be passed as a parameter to methods like `importWithMap`
// and `preloadWithMap`.
const dynamic_importmap_baseUrl = document.baseURI;
const dynamic_importmap_pageBaseUrl = dynamic_importmap_baseUrl;
Object.defineProperty(self, 'wpInteractivityRouterImport', {
  value: importShim,
  writable: false,
  enumerable: false,
  configurable: false
});
async function importShim(id) {
  await initPromise;
  return topLevelLoad(resolve(id, dynamic_importmap_pageBaseUrl), {
    credentials: 'same-origin'
  });
}

/**
 * Imports the module with the passed ID.
 *
 * The module is resolved against the internal dynamic import map,
 * extended with the passed import map.
 *
 * @param id          Module ID.
 * @param importMapIn Import map.
 * @return Resolved module.
 */
async function importWithMap(id, importMapIn) {
  addImportMap(importMapIn);
  return importShim(id);
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
  resolver_addImportMap(importMapIn);
  await initPromise;
  return preloadModule(resolve(id, dynamic_importmap_pageBaseUrl), {
    credentials: 'same-origin'
  });
}


;// ./packages/interactivity-router/build-module/assets/script-modules.js
/**
 * Internal dependencies
 */


/**
 * IDs of modules that should be resolved by the browser rather than
 * processed internally.
 */
const resolvedScriptModules = new Set();

/**
 * Marks the specified module as natively resolved.
 * @param url Script module URL.
 */
const markScriptModuleAsResolved = url => {
  resolvedScriptModules.add(url);
};

/**
 * Resolves and fetches modules present in the passed document, using the
 * document's import map to resolve them.
 *
 * @param doc Document containing the modules to preload.
 * @return Array of promises that resolve to a `ScriptModuleLoad` instance.
 */
const preloadScriptModules = doc => {
  // Extract the import map from the document.
  const importMapElement = doc.querySelector('script#wp-importmap[type=importmap]');
  const importMap = importMapElement ? JSON.parse(importMapElement.text) : {
    imports: {},
    scopes: {}
  };

  // Remove imports also in the initial page's import map.
  // Those should be handled natively.
  for (const key in initialImportMap.imports) {
    delete importMap.imports[key];
  }

  // Get the URL of all modules contained in the document.
  const moduleUrls = [...doc.querySelectorAll('script[type=module][src]')].map(s => s.src);

  // Resolve and fetch those not resolved natively.
  return moduleUrls.filter(url => !resolvedScriptModules.has(url)).map(url => preloadWithMap(url, importMap));
};

/**
 * Imports modules respresented by the passed `ScriptModuleLoad` instances.
 *
 * @param modules Array of `MoudleLoad` instances.
 * @return Promise that resolves once all modules are imported.
 */
const importScriptModules = modules => Promise.all(modules.map(m => importPreloadedModule(m)));

;// ./packages/interactivity-router/build-module/index.js
/* wp:polyfill */
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */


const {
  directivePrefix,
  getRegionRootFragment,
  initialVdom,
  toVdom,
  render,
  parseServerData,
  populateServerData,
  batch
} = (0,interactivity_namespaceObject.privateApis)('I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of WordPress.');
const regionAttr = `data-${directivePrefix}-router-region`;
const interactiveAttr = `data-${directivePrefix}-interactive`;
const regionsSelector = `[${interactiveAttr}][${regionAttr}]:not([${interactiveAttr}] [${interactiveAttr}])`;
// The cache of visited and prefetched pages, stylesheets and scripts.
const pages = new Map();

// Helper to remove domain and hash from the URL. We are only interesting in
// caching the path and the query.
const getPagePath = url => {
  const u = new URL(url, window.location.href);
  return u.pathname + u.search;
};

/**
 * Parses the given region's directive.
 *
 * @param region Region element.
 * @return Data contained in the region directive value.
 */
const parseRegionAttribute = region => {
  const value = region.getAttribute(regionAttr);
  try {
    const {
      id,
      attachTo
    } = JSON.parse(value);
    return {
      id,
      attachTo
    };
  } catch (e) {
    return {
      id: value
    };
  }
};

/**
 * Fetches and prepares a page from a given URL.
 *
 * @param url          The URL of the page to fetch.
 * @param options      Options for the fetch operation.
 * @param options.html Optional HTML content. If provided, the function will use
 *                     this instead of fetching from the URL.
 * @return             A Promise that resolves to the prepared page, or false if
 *                     there was an error during fetching or preparation.
 */
const fetchPage = async (url, {
  html
}) => {
  try {
    if (!html) {
      const res = await window.fetch(url);
      if (res.status !== 200) {
        return false;
      }
      html = await res.text();
    }
    const dom = new window.DOMParser().parseFromString(html, 'text/html');
    return await preparePage(url, dom);
  } catch (e) {
    return false;
  }
};

/**
 * Processes a DOM document to extract router regions and related resources.
 *
 * This function analyzes the provided DOM document and creates a virtual DOM
 * representation of all HTML regions marked with a `router-region` directive.
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
 *                        containing the virtual DOM for all router regions,
 *                        preloaded styles and scripts, page title, and initial
 *                        server-rendered data.
 */
const preparePage = async (url, dom, {
  vdom
} = {}) => {
  // Remove all noscript elements as they're irrelevant when request is served via router.
  // This prevents browsers from extracting styles from noscript tags.
  dom.querySelectorAll('noscript').forEach(el => el.remove());
  const regions = {};
  const regionsToAttach = {};
  dom.querySelectorAll(regionsSelector).forEach(region => {
    const {
      id,
      attachTo
    } = parseRegionAttribute(region);
    regions[id] = vdom?.has(region) ? vdom.get(region) : toVdom(region);
    if (attachTo) {
      regionsToAttach[id] = attachTo;
    }
  });
  const title = dom.querySelector('title')?.innerText;
  const initialData = parseServerData(dom);

  // Wait for styles and modules to be ready.
  const [styles, scriptModules] = await Promise.all([Promise.all(preloadStyles(dom, url)), Promise.all(preloadScriptModules(dom))]);
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
 * Renders a page by applying styles, populating server data, rendering regions,
 * and updating the document title.
 *
 * @param page The {@link Page} object to render.
 */
const renderPage = page => {
  applyStyles(page.styles);

  // Clone regionsToAttach.
  const regionsToAttach = {
    ...page.regionsToAttach
  };
  batch(() => {
    populateServerData(page.initialData);
    document.querySelectorAll(regionsSelector).forEach(region => {
      const {
        id
      } = parseRegionAttribute(region);
      const fragment = getRegionRootFragment(region);
      render(page.regions[id], fragment);
      // If this is an attached region, remove it from the list.
      delete regionsToAttach[id];
    });

    // Render unattached regions.
    for (const id in regionsToAttach) {
      const parent = document.querySelector(regionsToAttach[id]);

      // Get the type from the vnode. If wrapped with Directives, get the
      // original type from `props.type`.
      const {
        props,
        type
      } = page.regions[id];
      const elementType = typeof type === 'function' ? props.type : type;

      // Create an element with the obtained type where the region will be
      // rendered. The type should match the one of the root vnode.
      const region = document.createElement(elementType);
      parent.appendChild(region);
      const fragment = getRegionRootFragment(region);
      render(page.regions[id], fragment);
    }
  });
  if (page.title) {
    document.title = page.title;
  }
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
const forcePageReload = href => {
  window.location.assign(href);
  return new Promise(() => {});
};

// Listen to the back and forward buttons and restore the page if it's in the
// cache.
window.addEventListener('popstate', async () => {
  const pagePath = getPagePath(window.location.href); // Remove hash.
  const page = pages.has(pagePath) && (await pages.get(pagePath));
  if (page) {
    renderPage(page);
    // Update the URL in the state.
    state.url = window.location.href;
  } else {
    window.location.reload();
  }
});

// Initialize the router and cache the initial page using the initial vDOM.
window.document.querySelectorAll('script[type=module][src]').forEach(({
  src
}) => markScriptModuleAsResolved(src));
pages.set(getPagePath(window.location.href), Promise.resolve(preparePage(getPagePath(window.location.href), document, {
  vdom: initialVdom
})));

// Variable to store the current navigation.
let navigatingTo = '';
let hasLoadedNavigationTextsData = false;
const navigationTexts = {
  loading: 'Loading page, please wait.',
  loaded: 'Page Loaded.'
};
const {
  state,
  actions
} = (0,interactivity_namespaceObject.store)('core/router', {
  state: {
    url: window.location.href,
    navigation: {
      hasStarted: false,
      hasFinished: false
    }
  },
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
     *
     * @return  Promise that resolves once the navigation is completed or aborted.
     */
    *navigate(href, options = {}) {
      const {
        clientNavigationDisabled
      } = (0,interactivity_namespaceObject.getConfig)();
      if (clientNavigationDisabled) {
        yield forcePageReload(href);
      }
      const pagePath = getPagePath(href);
      const {
        navigation
      } = state;
      const {
        loadingAnimation = true,
        screenReaderAnnouncement = true,
        timeout = 10000
      } = options;
      navigatingTo = href;
      actions.prefetch(pagePath, options);

      // Create a promise that resolves when the specified timeout ends.
      // The timeout value is 10 seconds by default.
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, timeout));

      // Don't update the navigation status immediately, wait 400 ms.
      const loadingTimeout = setTimeout(() => {
        if (navigatingTo !== href) {
          return;
        }
        if (loadingAnimation) {
          navigation.hasStarted = true;
          navigation.hasFinished = false;
        }
        if (screenReaderAnnouncement) {
          a11ySpeak('loading');
        }
      }, 400);
      const page = yield Promise.race([pages.get(pagePath), timeoutPromise]);

      // Dismiss loading message if it hasn't been added yet.
      clearTimeout(loadingTimeout);

      // Once the page is fetched, the destination URL could have changed
      // (e.g., by clicking another link in the meantime). If so, bail
      // out, and let the newer execution to update the HTML.
      if (navigatingTo !== href) {
        return;
      }
      if (page && !page.initialData?.config?.['core/router']?.clientNavigationDisabled) {
        yield importScriptModules(page.scriptModules);
        renderPage(page);
        window.history[options.replace ? 'replaceState' : 'pushState']({}, '', href);

        // Update the URL in the state.
        state.url = href;

        // Update the navigation status once the the new page rendering
        // has been completed.
        if (loadingAnimation) {
          navigation.hasStarted = false;
          navigation.hasFinished = true;
        }
        if (screenReaderAnnouncement) {
          a11ySpeak('loaded');
        }

        // Scroll to the anchor if exits in the link.
        const {
          hash
        } = new URL(href, window.location.href);
        if (hash) {
          document.querySelector(hash)?.scrollIntoView();
        }
      } else {
        yield forcePageReload(href);
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
      const {
        clientNavigationDisabled
      } = (0,interactivity_namespaceObject.getConfig)();
      if (clientNavigationDisabled) {
        return;
      }
      const pagePath = getPagePath(url);
      if (options.force || !pages.has(pagePath)) {
        pages.set(pagePath, fetchPage(pagePath, {
          html: options.html
        }));
      }
      yield pages.get(pagePath);
    }
  }
});

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
    const content = document.getElementById('wp-script-module-data-@wordpress/interactivity-router')?.textContent;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        if (typeof parsed?.i18n?.loading === 'string') {
          navigationTexts.loading = parsed.i18n.loading;
        }
        if (typeof parsed?.i18n?.loaded === 'string') {
          navigationTexts.loaded = parsed.i18n.loaded;
        }
      } catch {}
    } else {
      // Fallback to localized strings from Interactivity API state.
      // @todo This block is for Core < 6.7.0. Remove when support is dropped.

      // @ts-expect-error
      if (state.navigation.texts?.loading) {
        // @ts-expect-error
        navigationTexts.loading = state.navigation.texts.loading;
      }
      // @ts-expect-error
      if (state.navigation.texts?.loaded) {
        // @ts-expect-error
        navigationTexts.loaded = state.navigation.texts.loaded;
      }
    }
  }
  const message = navigationTexts[messageKey];
  Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 317)).then(({
    speak
  }) => speak(message),
  // Ignore failures to load the a11y module.
  () => {});
}

var __webpack_exports__actions = __webpack_exports__.o;
var __webpack_exports__state = __webpack_exports__.w;
export { __webpack_exports__actions as actions, __webpack_exports__state as state };
