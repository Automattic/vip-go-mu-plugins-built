/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ build_module)
});

;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// ./packages/api-fetch/build-module/middlewares/nonce.js
/**
 * Internal dependencies
 */

/**
 * @param nonce
 *
 * @return  A middleware to enhance a request with a nonce.
 */
function createNonceMiddleware(nonce) {
  const middleware = (options, next) => {
    const {
      headers = {}
    } = options;

    // If an 'X-WP-Nonce' header (or any case-insensitive variation
    // thereof) was specified, no need to add a nonce header.
    for (const headerName in headers) {
      if (headerName.toLowerCase() === 'x-wp-nonce' && headers[headerName] === middleware.nonce) {
        return next(options);
      }
    }
    return next({
      ...options,
      headers: {
        ...headers,
        'X-WP-Nonce': middleware.nonce
      }
    });
  };
  middleware.nonce = nonce;
  return middleware;
}
/* harmony default export */ const nonce = (createNonceMiddleware);

;// ./packages/api-fetch/build-module/middlewares/namespace-endpoint.js
/**
 * Internal dependencies
 */

const namespaceAndEndpointMiddleware = (options, next) => {
  let path = options.path;
  let namespaceTrimmed, endpointTrimmed;
  if (typeof options.namespace === 'string' && typeof options.endpoint === 'string') {
    namespaceTrimmed = options.namespace.replace(/^\/|\/$/g, '');
    endpointTrimmed = options.endpoint.replace(/^\//, '');
    if (endpointTrimmed) {
      path = namespaceTrimmed + '/' + endpointTrimmed;
    } else {
      path = namespaceTrimmed;
    }
  }
  delete options.namespace;
  delete options.endpoint;
  return next({
    ...options,
    path
  });
};
/* harmony default export */ const namespace_endpoint = (namespaceAndEndpointMiddleware);

;// ./packages/api-fetch/build-module/middlewares/root-url.js
/**
 * Internal dependencies
 */



/**
 * @param rootURL
 * @return  Root URL middleware.
 */
const createRootURLMiddleware = rootURL => (options, next) => {
  return namespace_endpoint(options, optionsWithPath => {
    let url = optionsWithPath.url;
    let path = optionsWithPath.path;
    let apiRoot;
    if (typeof path === 'string') {
      apiRoot = rootURL;
      if (-1 !== rootURL.indexOf('?')) {
        path = path.replace('?', '&');
      }
      path = path.replace(/^\//, '');

      // API root may already include query parameter prefix if site is
      // configured to use plain permalinks.
      if ('string' === typeof apiRoot && -1 !== apiRoot.indexOf('?')) {
        path = path.replace('?', '&');
      }
      url = apiRoot + path;
    }
    return next({
      ...optionsWithPath,
      url
    });
  });
};
/* harmony default export */ const root_url = (createRootURLMiddleware);

;// external ["wp","url"]
const external_wp_url_namespaceObject = window["wp"]["url"];
;// ./packages/api-fetch/build-module/middlewares/preloading.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

/**
 * @param preloadedData
 * @return Preloading middleware.
 */
function createPreloadingMiddleware(preloadedData) {
  const cache = Object.fromEntries(Object.entries(preloadedData).map(([path, data]) => [(0,external_wp_url_namespaceObject.normalizePath)(path), data]));
  return (options, next) => {
    const {
      parse = true
    } = options;
    let rawPath = options.path;
    if (!rawPath && options.url) {
      const {
        rest_route: pathFromQuery,
        ...queryArgs
      } = (0,external_wp_url_namespaceObject.getQueryArgs)(options.url);
      if (typeof pathFromQuery === 'string') {
        rawPath = (0,external_wp_url_namespaceObject.addQueryArgs)(pathFromQuery, queryArgs);
      }
    }
    if (typeof rawPath !== 'string') {
      return next(options);
    }
    const method = options.method || 'GET';
    const path = (0,external_wp_url_namespaceObject.normalizePath)(rawPath);
    if ('GET' === method && cache[path]) {
      const cacheData = cache[path];

      // Unsetting the cache key ensures that the data is only used a single time.
      delete cache[path];
      return prepareResponse(cacheData, !!parse);
    } else if ('OPTIONS' === method && cache[method] && cache[method][path]) {
      const cacheData = cache[method][path];

      // Unsetting the cache key ensures that the data is only used a single time.
      delete cache[method][path];
      return prepareResponse(cacheData, !!parse);
    }
    return next(options);
  };
}

/**
 * This is a helper function that sends a success response.
 *
 * @param responseData
 * @param parse
 * @return Promise with the response.
 */
function prepareResponse(responseData, parse) {
  if (parse) {
    return Promise.resolve(responseData.body);
  }
  try {
    return Promise.resolve(new window.Response(JSON.stringify(responseData.body), {
      status: 200,
      statusText: 'OK',
      headers: responseData.headers
    }));
  } catch {
    // See: https://github.com/WordPress/gutenberg/issues/67358#issuecomment-2621163926.
    Object.entries(responseData.headers).forEach(([key, value]) => {
      if (key.toLowerCase() === 'link') {
        responseData.headers[key] = value.replace(/<([^>]+)>/, (_, url) => `<${encodeURI(url)}>`);
      }
    });
    return Promise.resolve(parse ? responseData.body : new window.Response(JSON.stringify(responseData.body), {
      status: 200,
      statusText: 'OK',
      headers: responseData.headers
    }));
  }
}
/* harmony default export */ const preloading = (createPreloadingMiddleware);

;// ./packages/api-fetch/build-module/middlewares/fetch-all-middleware.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

/**
 * Apply query arguments to both URL and Path, whichever is present.
 *
 * @param {APIFetchOptions}                   props     The request options
 * @param {Record< string, string | number >} queryArgs
 * @return  The request with the modified query args
 */
const modifyQuery = ({
  path,
  url,
  ...options
}, queryArgs) => ({
  ...options,
  url: url && (0,external_wp_url_namespaceObject.addQueryArgs)(url, queryArgs),
  path: path && (0,external_wp_url_namespaceObject.addQueryArgs)(path, queryArgs)
});

/**
 * Duplicates parsing functionality from apiFetch.
 *
 * @param response
 * @return Parsed response json.
 */
const parseResponse = response => response.json ? response.json() : Promise.reject(response);

/**
 * @param linkHeader
 * @return The parsed link header.
 */
const parseLinkHeader = linkHeader => {
  if (!linkHeader) {
    return {};
  }
  const match = linkHeader.match(/<([^>]+)>; rel="next"/);
  return match ? {
    next: match[1]
  } : {};
};

/**
 * @param response
 * @return  The next page URL.
 */
const getNextPageUrl = response => {
  const {
    next
  } = parseLinkHeader(response.headers.get('link'));
  return next;
};

/**
 * @param options
 * @return True if the request contains an unbounded query.
 */
const requestContainsUnboundedQuery = options => {
  const pathIsUnbounded = !!options.path && options.path.indexOf('per_page=-1') !== -1;
  const urlIsUnbounded = !!options.url && options.url.indexOf('per_page=-1') !== -1;
  return pathIsUnbounded || urlIsUnbounded;
};

/**
 * The REST API enforces an upper limit on the per_page option. To handle large
 * collections, apiFetch consumers can pass `per_page=-1`; this middleware will
 * then recursively assemble a full response array from all available pages.
 * @param options
 * @param next
 */
const fetchAllMiddleware = async (options, next) => {
  if (options.parse === false) {
    // If a consumer has opted out of parsing, do not apply middleware.
    return next(options);
  }
  if (!requestContainsUnboundedQuery(options)) {
    // If neither url nor path is requesting all items, do not apply middleware.
    return next(options);
  }

  // Retrieve requested page of results.
  const response = await build_module({
    ...modifyQuery(options, {
      per_page: 100
    }),
    // Ensure headers are returned for page 1.
    parse: false
  });
  const results = await parseResponse(response);
  if (!Array.isArray(results)) {
    // We have no reliable way of merging non-array results.
    return results;
  }
  let nextPage = getNextPageUrl(response);
  if (!nextPage) {
    // There are no further pages to request.
    return results;
  }

  // Iteratively fetch all remaining pages until no "next" header is found.
  let mergedResults = [].concat(results);
  while (nextPage) {
    const nextResponse = await build_module({
      ...options,
      // Ensure the URL for the next page is used instead of any provided path.
      path: undefined,
      url: nextPage,
      // Ensure we still get headers so we can identify the next page.
      parse: false
    });
    const nextResults = await parseResponse(nextResponse);
    mergedResults = mergedResults.concat(nextResults);
    nextPage = getNextPageUrl(nextResponse);
  }
  return mergedResults;
};
/* harmony default export */ const fetch_all_middleware = (fetchAllMiddleware);

;// ./packages/api-fetch/build-module/middlewares/http-v1.js
/**
 * Internal dependencies
 */

/**
 * Set of HTTP methods which are eligible to be overridden.
 */
const OVERRIDE_METHODS = new Set(['PATCH', 'PUT', 'DELETE']);

/**
 * Default request method.
 *
 * "A request has an associated method (a method). Unless stated otherwise it
 * is `GET`."
 *
 * @see  https://fetch.spec.whatwg.org/#requests
 */
const DEFAULT_METHOD = 'GET';

/**
 * API Fetch middleware which overrides the request method for HTTP v1
 * compatibility leveraging the REST API X-HTTP-Method-Override header.
 *
 * @param options
 * @param next
 */
const httpV1Middleware = (options, next) => {
  const {
    method = DEFAULT_METHOD
  } = options;
  if (OVERRIDE_METHODS.has(method.toUpperCase())) {
    options = {
      ...options,
      headers: {
        ...options.headers,
        'X-HTTP-Method-Override': method,
        'Content-Type': 'application/json'
      },
      method: 'POST'
    };
  }
  return next(options);
};
/* harmony default export */ const http_v1 = (httpV1Middleware);

;// ./packages/api-fetch/build-module/middlewares/user-locale.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

const userLocaleMiddleware = (options, next) => {
  if (typeof options.url === 'string' && !(0,external_wp_url_namespaceObject.hasQueryArg)(options.url, '_locale')) {
    options.url = (0,external_wp_url_namespaceObject.addQueryArgs)(options.url, {
      _locale: 'user'
    });
  }
  if (typeof options.path === 'string' && !(0,external_wp_url_namespaceObject.hasQueryArg)(options.path, '_locale')) {
    options.path = (0,external_wp_url_namespaceObject.addQueryArgs)(options.path, {
      _locale: 'user'
    });
  }
  return next(options);
};
/* harmony default export */ const user_locale = (userLocaleMiddleware);

;// ./packages/api-fetch/build-module/utils/response.js
/**
 * WordPress dependencies
 */


/**
 * Calls the `json` function on the Response, throwing an error if the response
 * doesn't have a json function or if parsing the json itself fails.
 *
 * @param response
 * @return Parsed response.
 */
async function parseJsonAndNormalizeError(response) {
  try {
    return await response.json();
  } catch {
    throw {
      code: 'invalid_json',
      message: (0,external_wp_i18n_namespaceObject.__)('The response is not a valid JSON response.')
    };
  }
}

/**
 * Parses the apiFetch response properly and normalize response errors.
 *
 * @param response
 * @param shouldParseResponse
 *
 * @return Parsed response.
 */
async function parseResponseAndNormalizeError(response, shouldParseResponse = true) {
  if (!shouldParseResponse) {
    return response;
  }
  if (response.status === 204) {
    return null;
  }
  return await parseJsonAndNormalizeError(response);
}

/**
 * Parses a response, throwing an error if parsing the response fails.
 *
 * @param response
 * @param shouldParseResponse
 * @return Never returns, always throws.
 */
async function parseAndThrowError(response, shouldParseResponse = true) {
  if (!shouldParseResponse) {
    throw response;
  }

  // Parse the response JSON and throw it as an error.
  throw await parseJsonAndNormalizeError(response);
}

;// ./packages/api-fetch/build-module/middlewares/media-upload.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

/**
 * @param options
 * @return True if the request is for media upload.
 */
function isMediaUploadRequest(options) {
  const isCreateMethod = !!options.method && options.method === 'POST';
  const isMediaEndpoint = !!options.path && options.path.indexOf('/wp/v2/media') !== -1 || !!options.url && options.url.indexOf('/wp/v2/media') !== -1;
  return isMediaEndpoint && isCreateMethod;
}

/**
 * Middleware handling media upload failures and retries.
 * @param options
 * @param next
 */
const mediaUploadMiddleware = (options, next) => {
  if (!isMediaUploadRequest(options)) {
    return next(options);
  }
  let retries = 0;
  const maxRetries = 5;

  /**
   * @param attachmentId
   * @return Processed post response.
   */
  const postProcess = attachmentId => {
    retries++;
    return next({
      path: `/wp/v2/media/${attachmentId}/post-process`,
      method: 'POST',
      data: {
        action: 'create-image-subsizes'
      },
      parse: false
    }).catch(() => {
      if (retries < maxRetries) {
        return postProcess(attachmentId);
      }
      next({
        path: `/wp/v2/media/${attachmentId}?force=true`,
        method: 'DELETE'
      });
      return Promise.reject();
    });
  };
  return next({
    ...options,
    parse: false
  }).catch(response => {
    // `response` could actually be an error thrown by `defaultFetchHandler`.
    if (!(response instanceof globalThis.Response)) {
      return Promise.reject(response);
    }
    const attachmentId = response.headers.get('x-wp-upload-attachment-id');
    if (response.status >= 500 && response.status < 600 && attachmentId) {
      return postProcess(attachmentId).catch(() => {
        if (options.parse !== false) {
          return Promise.reject({
            code: 'post_process',
            message: (0,external_wp_i18n_namespaceObject.__)('Media upload failed. If this is a photo or a large image, please scale it down and try again.')
          });
        }
        return Promise.reject(response);
      });
    }
    return parseAndThrowError(response, options.parse);
  }).then(response => parseResponseAndNormalizeError(response, options.parse));
};
/* harmony default export */ const media_upload = (mediaUploadMiddleware);

;// ./packages/api-fetch/build-module/middlewares/theme-preview.js
/**
 * WordPress dependencies
 */

/**
 * Internal dependencies
 */

/**
 * This appends a `wp_theme_preview` parameter to the REST API request URL if
 * the admin URL contains a `theme` GET parameter.
 *
 * If the REST API request URL has contained the `wp_theme_preview` parameter as `''`,
 * then bypass this middleware.
 *
 * @param themePath
 * @return  Preloading middleware.
 */
const createThemePreviewMiddleware = themePath => (options, next) => {
  if (typeof options.url === 'string') {
    const wpThemePreview = (0,external_wp_url_namespaceObject.getQueryArg)(options.url, 'wp_theme_preview');
    if (wpThemePreview === undefined) {
      options.url = (0,external_wp_url_namespaceObject.addQueryArgs)(options.url, {
        wp_theme_preview: themePath
      });
    } else if (wpThemePreview === '') {
      options.url = (0,external_wp_url_namespaceObject.removeQueryArgs)(options.url, 'wp_theme_preview');
    }
  }
  if (typeof options.path === 'string') {
    const wpThemePreview = (0,external_wp_url_namespaceObject.getQueryArg)(options.path, 'wp_theme_preview');
    if (wpThemePreview === undefined) {
      options.path = (0,external_wp_url_namespaceObject.addQueryArgs)(options.path, {
        wp_theme_preview: themePath
      });
    } else if (wpThemePreview === '') {
      options.path = (0,external_wp_url_namespaceObject.removeQueryArgs)(options.path, 'wp_theme_preview');
    }
  }
  return next(options);
};
/* harmony default export */ const theme_preview = (createThemePreviewMiddleware);

;// ./packages/api-fetch/build-module/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */










/**
 * Default set of header values which should be sent with every request unless
 * explicitly provided through apiFetch options.
 */
const DEFAULT_HEADERS = {
  // The backend uses the Accept header as a condition for considering an
  // incoming request as a REST request.
  //
  // See: https://core.trac.wordpress.org/ticket/44534
  Accept: 'application/json, */*;q=0.1'
};

/**
 * Default set of fetch option values which should be sent with every request
 * unless explicitly provided through apiFetch options.
 */
const DEFAULT_OPTIONS = {
  credentials: 'include'
};
const middlewares = [user_locale, namespace_endpoint, http_v1, fetch_all_middleware];

/**
 * Register a middleware
 *
 * @param middleware
 */
function registerMiddleware(middleware) {
  middlewares.unshift(middleware);
}
const defaultFetchHandler = nextOptions => {
  const {
    url,
    path,
    data,
    parse = true,
    ...remainingOptions
  } = nextOptions;
  let {
    body,
    headers
  } = nextOptions;

  // Merge explicitly-provided headers with default values.
  headers = {
    ...DEFAULT_HEADERS,
    ...headers
  };

  // The `data` property is a shorthand for sending a JSON body.
  if (data) {
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }
  const responsePromise = globalThis.fetch(
  // Fall back to explicitly passing `window.location` which is the behavior if `undefined` is passed.
  url || path || window.location.href, {
    ...DEFAULT_OPTIONS,
    ...remainingOptions,
    body,
    headers
  });
  return responsePromise.then(response => {
    // If the response is not 2xx, still parse the response body as JSON
    // but throw the JSON as error.
    if (!response.ok) {
      return parseAndThrowError(response, parse);
    }
    return parseResponseAndNormalizeError(response, parse);
  }, err => {
    // Re-throw AbortError for the users to handle it themselves.
    if (err && err.name === 'AbortError') {
      throw err;
    }

    // If the browser reports being offline, we'll just assume that
    // this is why the request failed.
    if (!globalThis.navigator.onLine) {
      throw {
        code: 'offline_error',
        message: (0,external_wp_i18n_namespaceObject.__)('Unable to connect. Please check your Internet connection.')
      };
    }

    // Hard to diagnose further due to how Window.fetch reports errors.
    throw {
      code: 'fetch_error',
      message: (0,external_wp_i18n_namespaceObject.__)('Could not get a valid response from the server.')
    };
  });
};
let fetchHandler = defaultFetchHandler;

/**
 * Defines a custom fetch handler for making the requests that will override
 * the default one using window.fetch
 *
 * @param newFetchHandler The new fetch handler
 */
function setFetchHandler(newFetchHandler) {
  fetchHandler = newFetchHandler;
}
/**
 * Fetch
 *
 * @param options The options for the fetch.
 * @return A promise representing the request processed via the registered middlewares.
 */
const apiFetch = options => {
  // creates a nested function chain that calls all middlewares and finally the `fetchHandler`,
  // converting `middlewares = [ m1, m2, m3 ]` into:
  // ```
  // opts1 => m1( opts1, opts2 => m2( opts2, opts3 => m3( opts3, fetchHandler ) ) );
  // ```
  const enhancedHandler = middlewares.reduceRight((next, middleware) => {
    return workingOptions => middleware(workingOptions, next);
  }, fetchHandler);
  return enhancedHandler(options).catch(error => {
    if (error.code !== 'rest_cookie_invalid_nonce') {
      return Promise.reject(error);
    }

    // If the nonce is invalid, refresh it and try again.
    return globalThis.fetch(apiFetch.nonceEndpoint).then(response => {
      // If the nonce refresh fails, it means we failed to recover from the original
      // `rest_cookie_invalid_nonce` error and that it's time to finally re-throw it.
      if (!response.ok) {
        return Promise.reject(error);
      }
      return response.text();
    }).then(text => {
      apiFetch.nonceMiddleware.nonce = text;
      return apiFetch(options);
    });
  });
};
apiFetch.use = registerMiddleware;
apiFetch.setFetchHandler = setFetchHandler;
apiFetch.createNonceMiddleware = nonce;
apiFetch.createPreloadingMiddleware = preloading;
apiFetch.createRootURLMiddleware = root_url;
apiFetch.fetchAllMiddleware = fetch_all_middleware;
apiFetch.mediaUploadMiddleware = media_upload;
apiFetch.createThemePreviewMiddleware = theme_preview;
/* harmony default export */ const build_module = (apiFetch);


(window.wp = window.wp || {}).apiFetch = __webpack_exports__["default"];
/******/ })()
;