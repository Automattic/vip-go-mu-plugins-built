(function(exports, _wordpress_element, _wordpress_i18n, _wordpress_components, _wordpress_data, _wordpress_compose, _wordpress_api_fetch, _wordpress_url, _wordpress_blocks, react_jsx_runtime) {

"use strict";
// \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// packages/server-side-render/build-module/errors.mjs
	function parseErrorMessage(error) {
		if (error?.code === "rest_invalid_param" && error.data?.params?.attributes && 1 === Object.values(error.data.params).length) return `Invalid attribute: ${error.data.params.attributes}`;
		if (error instanceof Error) return error.message;
		if (!error) return "";
		else if (typeof error.message === "string") return error.message;
		else if (typeof error === "string") return error;
		else if (Object.hasOwn(error, "toString") && typeof error.toString === "function") {
			const result = error.toString();
			if (typeof result === "string") return result;
		}
		return "";
	}

// packages/server-side-render/build-module/hook.mjs
	function rendererPath(block, attributes = null, urlQueryArgs = {}) {
		return (0, _wordpress_url.addQueryArgs)(`/wp/v2/block-renderer/${block}`, {
			context: "edit",
			...null !== attributes ? { attributes } : {},
			...urlQueryArgs
		});
	}
	function removeBlockSupportAttributes(attributes) {
		const { backgroundColor, borderColor, fontFamily, fontSize, gradient, textColor, className, ...restAttributes } = attributes;
		const { border, color, elements, shadow, spacing, typography, ...restStyles } = attributes?.style || {};
		return {
			...restAttributes,
			style: restStyles
		};
	}
	/**
	* A hook for server-side rendering a preview of dynamic blocks to display in the editor.
	*
	* Handles fetching server-rendered previews for blocks, managing loading states,
	* and automatically debouncing requests to prevent excessive API calls. It supports both
	* GET and POST requests, with POST requests used for larger attribute payloads.
	*
	* @example
	* Basic usage:
	*
	* ```jsx
	* import { RawHTML } from '@wordpress/element';
	* import { useServerSideRender } from '@wordpress/server-side-render';
	*
	* function MyServerSideRender( { attributes, block } ) {
	*   const { content, status, error } = useServerSideRender( {
	*     attributes,
	*     block,
	*   } );
	*
	*   if ( status === 'loading' ) {
	*     return <div>Loading...</div>;
	*   }
	*
	*   if ( status === 'error' ) {
	*     return <div>Error: { error }</div>;
	*   }
	*
	*   return <RawHTML>{ content }</RawHTML>;
	* }
	* ```
	*
	* @param args The hook configuration object.
	*
	* @return The server-side render response object.
	*/
	function useServerSideRender(args) {
		const [response, setResponse] = (0, _wordpress_element.useState)({ status: "idle" });
		const shouldDebounceRef = (0, _wordpress_element.useRef)(false);
		const { attributes, block, skipBlockSupportAttributes = false, httpMethod = "GET", urlQueryArgs } = args;
		let sanitizedAttributes = attributes && (0, _wordpress_blocks.sanitizeBlockAttributes)(block, attributes);
		if (skipBlockSupportAttributes && sanitizedAttributes) sanitizedAttributes = removeBlockSupportAttributes(sanitizedAttributes);
		const isPostRequest = "POST" === httpMethod;
		const path = rendererPath(block, isPostRequest ? null : sanitizedAttributes, urlQueryArgs);
		const body = isPostRequest ? JSON.stringify({ attributes: sanitizedAttributes ?? null }) : void 0;
		(0, _wordpress_element.useEffect)(() => {
			const controller = new AbortController();
			const debouncedFetch = (0, _wordpress_compose.debounce)(function() {
				setResponse({ status: "loading" });
				(0, _wordpress_api_fetch.default)({
					path,
					method: isPostRequest ? "POST" : "GET",
					body,
					headers: isPostRequest ? { "Content-Type": "application/json" } : {},
					signal: controller.signal
				}).then((res) => {
					setResponse({
						status: "success",
						content: res ? res.rendered : ""
					});
				}).catch((error) => {
					if (error instanceof Error && error.name === "AbortError") return;
					console.warn(error);
					setResponse({
						status: "error",
						error: parseErrorMessage(error)
					});
				}).finally(() => {
					shouldDebounceRef.current = true;
				});
			}, shouldDebounceRef.current ? 500 : 0);
			debouncedFetch();
			return () => {
				controller.abort();
				debouncedFetch.cancel();
			};
		}, [
			path,
			isPostRequest,
			body
		]);
		return response;
	}

// packages/server-side-render/build-module/server-side-render.mjs
	const EMPTY_OBJECT = {};
	function DefaultEmptyResponsePlaceholder({ className }) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Placeholder, {
			className,
			children: (0, _wordpress_i18n.__)("Block rendered as empty.")
		});
	}
	function DefaultErrorResponsePlaceholder({ message, className }) {
		const errorMessage = (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Error loading block: %s"), message || (0, _wordpress_i18n.__)("Unknown error"));
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Placeholder, {
			className,
			children: errorMessage
		});
	}
	function DefaultLoadingResponsePlaceholder({ children }) {
		const [showLoader, setShowLoader] = (0, _wordpress_element.useState)(false);
		(0, _wordpress_element.useEffect)(() => {
			const timeout = setTimeout(() => {
				setShowLoader(true);
			}, 1e3);
			return () => clearTimeout(timeout);
		}, []);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: { position: "relative" },
			children: [showLoader && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					position: "absolute",
					top: "50%",
					left: "50%",
					marginTop: "-9px",
					marginLeft: "-9px"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_components.Spinner, {})
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: { opacity: showLoader ? "0.3" : 1 },
				children
			})]
		});
	}
	function ServerSideRender(props) {
		const prevContentRef = (0, _wordpress_element.useRef)("");
		const { className, EmptyResponsePlaceholder = DefaultEmptyResponsePlaceholder, ErrorResponsePlaceholder = DefaultErrorResponsePlaceholder, LoadingResponsePlaceholder = DefaultLoadingResponsePlaceholder, ...restProps } = props;
		const { content, status, error } = useServerSideRender(restProps);
		(0, _wordpress_element.useEffect)(() => {
			if (content) prevContentRef.current = content;
		}, [content]);
		if (status === "loading") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LoadingResponsePlaceholder, {
			...props,
			children: !!prevContentRef.current && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_element.RawHTML, {
				className,
				children: prevContentRef.current
			})
		});
		if (status === "success" && !content) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyResponsePlaceholder, { ...props });
		if (status === "error") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorResponsePlaceholder, {
			message: error,
			...props
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_element.RawHTML, {
			className,
			children: content || ""
		});
	}
	/**
	* A component that renders server-side content for blocks.
	*
	* Note: URL query will include the current post ID when applicable.
	* This is useful for blocks that depend on the context of the current post for rendering.
	*
	* @example
	* ```jsx
	* import { ServerSideRender } from '@wordpress/server-side-render';
	* // Legacy import for WordPress 6.8 and earlier
	* // import { default as ServerSideRender } from '@wordpress/server-side-render';
	*
	* function Example() {
	*   return (
	*     <ServerSideRender
	*       block="core/archives"
	*       attributes={ { showPostCounts: true } }
	*       urlQueryArgs={ { customArg: 'value' } }
	*       className="custom-class"
	*     />
	*   );
	* }
	* ```
	*
	* @param props              Component props.
	* @param props.urlQueryArgs Additional query arguments to append to the request URL.
	* @return The rendered server-side content.
	*/
	function ServerSideRenderWithPostId({ urlQueryArgs = EMPTY_OBJECT, ...props }) {
		const currentPostId = (0, _wordpress_data.useSelect)((select) => {
			const postId = select("core/editor")?.getCurrentPostId?.();
			return postId && typeof postId === "number" ? postId : null;
		}, []);
		const newUrlQueryArgs = (0, _wordpress_element.useMemo)(() => {
			if (!currentPostId) return urlQueryArgs;
			return {
				post_id: currentPostId,
				...urlQueryArgs
			};
		}, [currentPostId, urlQueryArgs]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ServerSideRender, {
			urlQueryArgs: newUrlQueryArgs,
			...props
		});
	}

// packages/server-side-render/build-module/index.mjs
/**
	* A compatibility layer for the `ServerSideRender` component when used with `wp` global namespace.
	*
	* @deprecated Use `ServerSideRender` non-default export instead.
	*
	* @example
	* ```js
	* import ServerSideRender from '@wordpress/server-side-render';
	* ```
	*/
	const ServerSideRenderCompat = ServerSideRenderWithPostId;
	ServerSideRenderCompat.ServerSideRender = ServerSideRenderWithPostId;
	ServerSideRenderCompat.useServerSideRender = useServerSideRender;

exports.ServerSideRender = ServerSideRenderWithPostId;
exports.default = ServerSideRenderCompat;
exports.useServerSideRender = useServerSideRender;
(window.wp ||= {}).serverSideRender = exports.default;
return exports;
})({}, window.wp.element, window.wp.i18n, window.wp.components, window.wp.data, window.wp.compose, window.wp.apiFetch, window.wp.url, window.wp.blocks, window.ReactJSXRuntime);
//# sourceMappingURL=index.js.map