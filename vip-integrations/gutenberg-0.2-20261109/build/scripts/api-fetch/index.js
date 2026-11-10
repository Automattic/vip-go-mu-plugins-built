(function(exports, _wordpress_i18n, _wordpress_private_apis, _wordpress_url) {

"use strict";
// packages/api-fetch/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/api-fetch");

// packages/api-fetch/build-module/middlewares/nonce.mjs
/**
	* @param nonce
	*
	* @return  A middleware to enhance a request with a nonce.
	*/
	function createNonceMiddleware(nonce) {
		const middleware = (options, next) => {
			const { headers = {} } = options;
			for (const headerName in headers) if (headerName.toLowerCase() === "x-wp-nonce" && headers[headerName] === middleware.nonce) return next(options);
			return next({
				...options,
				headers: {
					...headers,
					"X-WP-Nonce": middleware.nonce
				}
			});
		};
		middleware.nonce = nonce;
		return middleware;
	}

// packages/api-fetch/build-module/middlewares/namespace-endpoint.mjs
	const namespaceAndEndpointMiddleware = (options, next) => {
		let path = options.path;
		let namespaceTrimmed, endpointTrimmed;
		if (typeof options.namespace === "string" && typeof options.endpoint === "string") {
			namespaceTrimmed = options.namespace.replace(/^\/|\/$/g, "");
			endpointTrimmed = options.endpoint.replace(/^\//, "");
			if (endpointTrimmed) path = namespaceTrimmed + "/" + endpointTrimmed;
			else path = namespaceTrimmed;
		}
		delete options.namespace;
		delete options.endpoint;
		return next({
			...options,
			path
		});
	};

// packages/api-fetch/build-module/middlewares/root-url.mjs
/**
	* @param rootURL
	* @return  Root URL middleware.
	*/
	const createRootURLMiddleware = (rootURL) => (options, next) => {
		return namespaceAndEndpointMiddleware(options, (optionsWithPath) => {
			let url = optionsWithPath.url;
			let path = optionsWithPath.path;
			let apiRoot;
			if (typeof path === "string") {
				apiRoot = rootURL;
				if (-1 !== rootURL.indexOf("?")) path = path.replace("?", "&");
				path = path.replace(/^\//, "");
				if ("string" === typeof apiRoot && -1 !== apiRoot.indexOf("?")) path = path.replace("?", "&");
				url = apiRoot + path;
			}
			return next({
				...optionsWithPath,
				url
			});
		});
	};

// packages/api-fetch/build-module/middlewares/preloading.mjs
	const ENABLE_MULTI_USE = Symbol("preloadingEnableMultiUse");
	const CLEAR = Symbol("preloadingClear");
	/**
	* @param preloadedData
	* @return Preloading middleware.
	*/
	function createPreloadingMiddleware(preloadedData) {
		const { OPTIONS = {}, ...GET } = Object.fromEntries(Object.entries(preloadedData).map(([path, data]) => [(0, _wordpress_url.normalizePath)(path), data]));
		const unusedGet = new Set(Object.keys(GET));
		const unusedOptions = new Set(Object.keys(OPTIONS));
		let multiUse = false;
		const middleware = (options, next) => {
			const { parse = true } = options;
			let rawPath = options.path;
			if (!rawPath && options.url) {
				const { rest_route: pathFromQuery, ...queryArgs } = (0, _wordpress_url.getQueryArgs)(options.url);
				if (typeof pathFromQuery === "string") rawPath = (0, _wordpress_url.addQueryArgs)(pathFromQuery, queryArgs);
			}
			if (typeof rawPath !== "string") return next(options);
			const method = options.method || "GET";
			const path = (0, _wordpress_url.normalizePath)(rawPath);
			if ("GET" === method && GET[path]) {
				const data = GET[path];
				if (!multiUse) delete GET[path];
				unusedGet.delete(path);
				return prepareResponse(data, !!parse);
			} else if ("OPTIONS" === method && OPTIONS[path]) {
				const data = OPTIONS[path];
				if (!multiUse) delete OPTIONS[path];
				unusedOptions.delete(path);
				return prepareResponse(data, !!parse);
			}
			return next(options);
		};
		middleware[ENABLE_MULTI_USE] = () => {
			multiUse = true;
		};
		middleware[CLEAR] = () => {
			const tags = [...Array.from(unusedGet, (p) => `GET ${p}`), ...Array.from(unusedOptions, (p) => `OPTIONS ${p}`)];
			if (tags.length) console.warn("[api-fetch][preload] Some preloads were never consumed:", tags);
			else console.log("[api-fetch][preload] All preloads consumed.");
			unusedGet.clear();
			unusedOptions.clear();
			for (const key of Object.keys(GET)) delete GET[key];
			for (const key of Object.keys(OPTIONS)) delete OPTIONS[key];
		};
		return middleware;
	}
	/**
	* This is a helper function that sends a success response.
	*
	* @param responseData
	* @param parse
	* @return Promise with the response.
	*/
	function prepareResponse(responseData, parse) {
		if (parse) return Promise.resolve(responseData.body);
		try {
			return Promise.resolve(new window.Response(JSON.stringify(responseData.body), {
				status: 200,
				statusText: "OK",
				headers: responseData.headers
			}));
		} catch {
			Object.entries(responseData.headers).forEach(([key, value]) => {
				if (key.toLowerCase() === "link") responseData.headers[key] = value.replace(/<([^>]+)>/, (_, url) => `<${encodeURI(url)}>`);
			});
			return Promise.resolve(parse ? responseData.body : new window.Response(JSON.stringify(responseData.body), {
				status: 200,
				statusText: "OK",
				headers: responseData.headers
			}));
		}
	}

// packages/api-fetch/build-module/middlewares/fetch-all-middleware.mjs
/**
	* Apply query arguments to both URL and Path, whichever is present.
	*
	* @param {APIFetchOptions}                   props     The request options
	* @param {Record< string, string | number >} queryArgs
	* @return  The request with the modified query args
	*/
	const modifyQuery = ({ path, url, ...options }, queryArgs) => ({
		...options,
		url: url && (0, _wordpress_url.addQueryArgs)(url, queryArgs),
		path: path && (0, _wordpress_url.addQueryArgs)(path, queryArgs)
	});
	/**
	* Duplicates parsing functionality from apiFetch.
	*
	* @param response
	* @return Parsed response json.
	*/
	const parseResponse = (response) => response.json ? response.json() : Promise.reject(response);
	/**
	* @param linkHeader
	* @return The parsed link header.
	*/
	const parseLinkHeader = (linkHeader) => {
		if (!linkHeader) return {};
		const match = linkHeader.match(/<([^>]+)>; rel="next"/);
		return match ? { next: match[1] } : {};
	};
	/**
	* @param response
	* @return  The next page URL.
	*/
	const getNextPageUrl = (response) => {
		const { next } = parseLinkHeader(response.headers.get("link"));
		return next;
	};
	/**
	* @param options
	* @return True if the request contains an unbounded query.
	*/
	const requestContainsUnboundedQuery = (options) => {
		const pathIsUnbounded = !!options.path && options.path.indexOf("per_page=-1") !== -1;
		const urlIsUnbounded = !!options.url && options.url.indexOf("per_page=-1") !== -1;
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
		if (options.parse === false) return next(options);
		if (!requestContainsUnboundedQuery(options)) return next(options);
		const response = await apiFetch({
			...modifyQuery(options, { per_page: 100 }),
			parse: false
		});
		const results = await parseResponse(response);
		if (!Array.isArray(results)) return results;
		let nextPage = getNextPageUrl(response);
		if (!nextPage) return results;
		let mergedResults = [].concat(results);
		while (nextPage) {
			const nextResponse = await apiFetch({
				...options,
				path: void 0,
				url: nextPage,
				parse: false
			});
			const nextResults = await parseResponse(nextResponse);
			mergedResults = mergedResults.concat(nextResults);
			nextPage = getNextPageUrl(nextResponse);
		}
		return mergedResults;
	};

// packages/api-fetch/build-module/middlewares/http-v1.mjs
/**
	* Set of HTTP methods which are eligible to be overridden.
	*/
	const OVERRIDE_METHODS = /* @__PURE__ */ new Set([
		"PATCH",
		"PUT",
		"DELETE"
	]);
	/**
	* Default request method.
	*
	* "A request has an associated method (a method). Unless stated otherwise it
	* is `GET`."
	*
	* @see  https://fetch.spec.whatwg.org/#requests
	*/
	const DEFAULT_METHOD = "GET";
	/**
	* API Fetch middleware which overrides the request method for HTTP v1
	* compatibility leveraging the REST API X-HTTP-Method-Override header.
	*
	* @param options
	* @param next
	*/
	const httpV1Middleware = (options, next) => {
		const { method = DEFAULT_METHOD } = options;
		if (OVERRIDE_METHODS.has(method.toUpperCase())) options = {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options.headers,
				"X-HTTP-Method-Override": method
			},
			method: "POST"
		};
		return next(options);
	};

// packages/api-fetch/build-module/middlewares/user-locale.mjs
	const userLocaleMiddleware = (options, next) => {
		if (typeof options.url === "string" && !(0, _wordpress_url.hasQueryArg)(options.url, "_locale")) options.url = (0, _wordpress_url.addQueryArgs)(options.url, { _locale: "user" });
		if (typeof options.path === "string" && !(0, _wordpress_url.hasQueryArg)(options.path, "_locale")) options.path = (0, _wordpress_url.addQueryArgs)(options.path, { _locale: "user" });
		return next(options);
	};

// packages/api-fetch/build-module/utils/response.mjs
/**
	* Reads the response body as JSON, normalizing a parse failure into an
	* `invalid_json` error.
	*
	* Only the success path passes `allowEmptyBody`: `parseAndThrowError` throws
	* whatever this returns, and callers read `code` off it.
	*
	* @param response
	* @param allowEmptyBody Resolve an empty body to `null` instead of throwing.
	* @return Parsed response.
	*/
	async function parseJsonAndNormalizeError(response, allowEmptyBody = false) {
		try {
			if (typeof response.text !== "function") return await response.json();
			const text = await response.text();
			if (allowEmptyBody && text === "") return null;
			return JSON.parse(text);
		} catch {
			throw {
				code: "invalid_json",
				message: (0, _wordpress_i18n.__)("The response is not a valid JSON response."),
				data: { status: response.status }
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
		if (!shouldParseResponse) return response;
		if (response.status === 204) return null;
		return await parseJsonAndNormalizeError(response, true);
	}
	/**
	* Parses a response, throwing an error if parsing the response fails.
	*
	* @param response
	* @param shouldParseResponse
	* @return Never returns, always throws.
	*/
	async function parseAndThrowError(response, shouldParseResponse = true) {
		if (!shouldParseResponse) throw response;
		const error = await parseJsonAndNormalizeError(response);
		if (error && typeof error === "object" && !Array.isArray(error) && error.data === void 0) throw {
			...error,
			data: { status: response.status }
		};
		throw error;
	}

// packages/api-fetch/build-module/middlewares/media-upload.mjs
/**
	* @param options
	* @return True if the request is for media upload.
	*/
	function isMediaUploadRequest(options) {
		const isCreateMethod = !!options.method && options.method === "POST";
		return (!!options.path && options.path.indexOf("/wp/v2/media") !== -1 || !!options.url && options.url.indexOf("/wp/v2/media") !== -1) && isCreateMethod;
	}
	/**
	* Middleware handling media upload failures and retries.
	* @param options
	* @param next
	*/
	const mediaUploadMiddleware = (options, next) => {
		if (!isMediaUploadRequest(options)) return next(options);
		let retries = 0;
		const maxRetries = 5;
		/**
		* @param attachmentId
		* @return Processed post response.
		*/
		const postProcess = (attachmentId) => {
			retries++;
			return next({
				path: `/wp/v2/media/${attachmentId}/post-process`,
				method: "POST",
				data: { action: "create-image-subsizes" },
				parse: false
			}).catch(() => {
				if (retries < maxRetries) return postProcess(attachmentId);
				next({
					path: `/wp/v2/media/${attachmentId}?force=true`,
					method: "DELETE"
				});
				return Promise.reject();
			});
		};
		return next({
			...options,
			parse: false
		}).catch((response) => {
			if (!(response instanceof globalThis.Response)) return Promise.reject(response);
			const attachmentId = response.headers.get("x-wp-upload-attachment-id");
			if (response.status >= 500 && response.status < 600 && attachmentId) return postProcess(attachmentId).catch(() => {
				if (options.parse !== false) return Promise.reject({
					code: "post_process",
					message: (0, _wordpress_i18n.__)("Media upload failed. If this is a photo or a large image, please scale it down and try again.")
				});
				return Promise.reject(response);
			});
			return parseAndThrowError(response, options.parse);
		}).then((response) => parseResponseAndNormalizeError(response, options.parse));
	};

// packages/api-fetch/build-module/middlewares/theme-preview.mjs
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
	const createThemePreviewMiddleware = (themePath) => (options, next) => {
		if (typeof options.url === "string") {
			const wpThemePreview = (0, _wordpress_url.getQueryArg)(options.url, "wp_theme_preview");
			if (wpThemePreview === void 0) options.url = (0, _wordpress_url.addQueryArgs)(options.url, { wp_theme_preview: themePath });
			else if (wpThemePreview === "") options.url = (0, _wordpress_url.removeQueryArgs)(options.url, "wp_theme_preview");
		}
		if (typeof options.path === "string") {
			const wpThemePreview = (0, _wordpress_url.getQueryArg)(options.path, "wp_theme_preview");
			if (wpThemePreview === void 0) options.path = (0, _wordpress_url.addQueryArgs)(options.path, { wp_theme_preview: themePath });
			else if (wpThemePreview === "") options.path = (0, _wordpress_url.removeQueryArgs)(options.path, "wp_theme_preview");
		}
		return next(options);
	};

// packages/api-fetch/build-module/index.mjs
/**
	* Default set of header values which should be sent with every request unless
	* explicitly provided through apiFetch options.
	*/
	const DEFAULT_HEADERS = { Accept: "application/json, */*;q=0.1" };
	/**
	* Default set of fetch option values which should be sent with every request
	* unless explicitly provided through apiFetch options.
	*/
	const DEFAULT_OPTIONS = { credentials: "include" };
	const middlewares = [
		userLocaleMiddleware,
		namespaceAndEndpointMiddleware,
		httpV1Middleware,
		fetchAllMiddleware
	];
	/**
	* Register a middleware
	*
	* @param middleware
	*/
	function registerMiddleware(middleware) {
		middlewares.unshift(middleware);
	}
	/**
	* Unregister a middleware
	*
	* @param middleware
	* @return Whether the middleware was registered.
	*/
	function unregisterMiddleware(middleware) {
		const index = middlewares.indexOf(middleware);
		if (index === -1) return false;
		middlewares.splice(index, 1);
		return true;
	}
	function enablePreloadMultiUse() {
		for (const middleware of middlewares) middleware[ENABLE_MULTI_USE]?.();
	}
	function clearPreloadedData() {
		for (const middleware of middlewares) middleware[CLEAR]?.();
	}
	/**
	* The default fetch handler, using `window.fetch`. Exposed so it can be
	* restored after `setFetchHandler` overrides it.
	*
	* @param options The options for the fetch.
	*/
	const defaultFetchHandler = (options) => {
		const { url, path, data, parse = true, ...remainingOptions } = options;
		let { body, headers } = options;
		headers = {
			...DEFAULT_HEADERS,
			...headers
		};
		if (data) {
			body = JSON.stringify(data);
			headers["Content-Type"] = "application/json";
		}
		return globalThis.fetch(url || path || window.location.href, {
			...DEFAULT_OPTIONS,
			...remainingOptions,
			body,
			headers
		}).then((response) => {
			if (!response.ok) return parseAndThrowError(response, parse);
			return parseResponseAndNormalizeError(response, parse);
		}, (err) => {
			if (err && err.name === "AbortError") throw err;
			if (!globalThis.navigator.onLine) throw {
				code: "offline_error",
				message: (0, _wordpress_i18n.__)("Unable to connect. Please check your Internet connection.")
			};
			throw {
				code: "fetch_error",
				message: (0, _wordpress_i18n.__)("Could not get a valid response from the server.")
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
	const apiFetch = (options) => {
		return middlewares.reduceRight((next, middleware) => {
			return (workingOptions) => middleware(workingOptions, next);
		}, fetchHandler)(options).catch((error) => {
			if (error.code !== "rest_cookie_invalid_nonce") return Promise.reject(error);
			return globalThis.fetch(apiFetch.nonceEndpoint).then((response) => {
				if (!response.ok) return Promise.reject(error);
				return response.text();
			}).then((text) => {
				apiFetch.nonceMiddleware.nonce = text;
				return apiFetch(options);
			});
		});
	};
	apiFetch.use = registerMiddleware;
	apiFetch.unregister = unregisterMiddleware;
	apiFetch.setFetchHandler = setFetchHandler;
	apiFetch.defaultFetchHandler = defaultFetchHandler;
	apiFetch.privateApis = {};
	lock(apiFetch.privateApis, {
		enablePreloadMultiUse,
		clearPreloadedData
	});
	apiFetch.createNonceMiddleware = createNonceMiddleware;
	apiFetch.createPreloadingMiddleware = createPreloadingMiddleware;
	apiFetch.createRootURLMiddleware = createRootURLMiddleware;
	apiFetch.fetchAllMiddleware = fetchAllMiddleware;
	apiFetch.httpV1Middleware = httpV1Middleware;
	apiFetch.mediaUploadMiddleware = mediaUploadMiddleware;
	apiFetch.createThemePreviewMiddleware = createThemePreviewMiddleware;

exports.default = apiFetch;
(window.wp ||= {}).apiFetch = exports.default;
return exports;
})({}, window.wp.i18n, window.wp.privateApis, window.wp.url);
//# sourceMappingURL=index.js.map