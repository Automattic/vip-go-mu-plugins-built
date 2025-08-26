/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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

// UNUSED EXPORTS: ServerSideRender, useServerSideRender

;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// external ["wp","components"]
const external_wp_components_namespaceObject = window["wp"]["components"];
;// external ["wp","data"]
const external_wp_data_namespaceObject = window["wp"]["data"];
;// external ["wp","compose"]
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;// external ["wp","apiFetch"]
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_namespaceObject);
;// external ["wp","url"]
const external_wp_url_namespaceObject = window["wp"]["url"];
;// external ["wp","blocks"]
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// ./packages/server-side-render/build-module/hook.js
/**
 * WordPress dependencies
 */





function rendererPath(block, attributes = null, urlQueryArgs = {}) {
  return (0,external_wp_url_namespaceObject.addQueryArgs)(`/wp/v2/block-renderer/${block}`, {
    context: 'edit',
    ...(null !== attributes ? {
      attributes
    } : {}),
    ...urlQueryArgs
  });
}
function removeBlockSupportAttributes(attributes) {
  const {
    backgroundColor,
    borderColor,
    fontFamily,
    fontSize,
    gradient,
    textColor,
    className,
    ...restAttributes
  } = attributes;
  const {
    border,
    color,
    elements,
    shadow,
    spacing,
    typography,
    ...restStyles
  } = attributes?.style || {};
  return {
    ...restAttributes,
    style: restStyles
  };
}

/**
 * @typedef {Object} ServerSideRenderResponse
 * @property {string} status    - The current request status: 'idle', 'loading', 'success', or 'error'.
 * @property {string} [content] - The rendered block content (available when status is 'success').
 * @property {string} [error]   - The error message (available when status is 'error').
 */

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
 * @param {Object}  args                                    The hook configuration object.
 * @param {Object}  args.attributes                         The block attributes to be sent to the server for rendering.
 * @param {string}  args.block                              The identifier of the block to be serverside rendered. Example: 'core/archives'.
 * @param {boolean} [args.skipBlockSupportAttributes=false] Whether to remove block support attributes before sending.
 * @param {string}  [args.httpMethod='GET']                 The HTTP method to use ('GET' or 'POST'). Default is 'GET'.
 * @param {Object}  [args.urlQueryArgs]                     Additional query arguments to append to the request URL.
 *
 * @return {ServerSideRenderResponse} The server-side render response object.
 */
function useServerSideRender(args) {
  var _sanitizedAttributes;
  const [response, setResponse] = (0,external_wp_element_namespaceObject.useState)({
    status: 'idle'
  });
  const shouldDebounceRef = (0,external_wp_element_namespaceObject.useRef)(false);
  const {
    attributes,
    block,
    skipBlockSupportAttributes = false,
    httpMethod = 'GET',
    urlQueryArgs
  } = args;
  let sanitizedAttributes = attributes && (0,external_wp_blocks_namespaceObject.__experimentalSanitizeBlockAttributes)(block, attributes);
  if (skipBlockSupportAttributes) {
    sanitizedAttributes = removeBlockSupportAttributes(sanitizedAttributes);
  }

  // If httpMethod is 'POST', send the attributes in the request body instead of the URL.
  // This allows sending a larger attributes object than in a GET request, where the attributes are in the URL.
  const isPostRequest = 'POST' === httpMethod;
  const urlAttributes = isPostRequest ? null : sanitizedAttributes;
  const path = rendererPath(block, urlAttributes, urlQueryArgs);
  const body = isPostRequest ? JSON.stringify({
    attributes: (_sanitizedAttributes = sanitizedAttributes) !== null && _sanitizedAttributes !== void 0 ? _sanitizedAttributes : null
  }) : undefined;
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const controller = new AbortController();
    const debouncedFetch = (0,external_wp_compose_namespaceObject.debounce)(function () {
      {
        setResponse({
          status: 'loading'
        });
        external_wp_apiFetch_default()({
          path,
          method: isPostRequest ? 'POST' : 'GET',
          body,
          headers: isPostRequest ? {
            'Content-Type': 'application/json'
          } : {},
          signal: controller.signal
        }).then(res => {
          setResponse({
            status: 'success',
            content: res ? res.rendered : ''
          });
        }).catch(error => {
          // The request was aborted, do not update the response.
          if (error.name === 'AbortError') {
            return;
          }
          setResponse({
            status: 'error',
            error: error.message
          });
        }).finally(() => {
          // Debounce requests after first fetch.
          shouldDebounceRef.current = true;
        });
      }
    }, shouldDebounceRef.current ? 500 : 0);
    debouncedFetch();
    return () => {
      controller.abort();
      debouncedFetch.cancel();
    };
  }, [path, isPostRequest, body]);
  return response;
}

;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./packages/server-side-render/build-module/server-side-render.js
/**
 * WordPress dependencies
 */





/**
 * Internal dependencies
 */


const EMPTY_OBJECT = {};
function DefaultEmptyResponsePlaceholder({
  className
}) {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Placeholder, {
    className: className,
    children: (0,external_wp_i18n_namespaceObject.__)('Block rendered as empty.')
  });
}
function DefaultErrorResponsePlaceholder({
  message,
  className
}) {
  const errorMessage = (0,external_wp_i18n_namespaceObject.sprintf)(
  // translators: %s: error message describing the problem
  (0,external_wp_i18n_namespaceObject.__)('Error loading block: %s'), message);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Placeholder, {
    className: className,
    children: errorMessage
  });
}
function DefaultLoadingResponsePlaceholder({
  children
}) {
  const [showLoader, setShowLoader] = (0,external_wp_element_namespaceObject.useState)(false);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    // Schedule showing the Spinner after 1 second.
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsxs)("div", {
    style: {
      position: 'relative'
    },
    children: [showLoader && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: '-9px',
        marginLeft: '-9px'
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Spinner, {})
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)("div", {
      style: {
        opacity: showLoader ? '0.3' : 1
      },
      children: children
    })]
  });
}
function ServerSideRender(props) {
  const prevContentRef = (0,external_wp_element_namespaceObject.useRef)('');
  const {
    className,
    EmptyResponsePlaceholder = DefaultEmptyResponsePlaceholder,
    ErrorResponsePlaceholder = DefaultErrorResponsePlaceholder,
    LoadingResponsePlaceholder = DefaultLoadingResponsePlaceholder,
    ...restProps
  } = props;
  const {
    content,
    status,
    error
  } = useServerSideRender(restProps);

  // Store the previous successful HTML response to show while loading.
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (content) {
      prevContentRef.current = content;
    }
  }, [content]);
  if (status === 'loading') {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(LoadingResponsePlaceholder, {
      ...props,
      children: !!prevContentRef.current && /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_element_namespaceObject.RawHTML, {
        className: className,
        children: prevContentRef.current
      })
    });
  }
  if (status === 'success' && !content) {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(EmptyResponsePlaceholder, {
      ...props
    });
  }
  if (status === 'error') {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(ErrorResponsePlaceholder, {
      message: error,
      ...props
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_element_namespaceObject.RawHTML, {
    className: className,
    children: content
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
 * @param {Object}   props                                    Component props.
 * @param {string}   props.block                              The identifier of the block to be serverside rendered.
 * @param {Object}   props.attributes                         The block attributes to be sent to the server for rendering.
 * @param {string}   [props.className]                        Additional classes to apply to the wrapper element.
 * @param {string}   [props.httpMethod='GET']                 The HTTP method to use ('GET' or 'POST'). Default is 'GET'
 * @param {Object}   [props.urlQueryArgs]                     Additional query arguments to append to the request URL.
 * @param {boolean}  [props.skipBlockSupportAttributes=false] Whether to remove block support attributes before sending.
 * @param {Function} [props.EmptyResponsePlaceholder]         Component rendered when the API response is empty.
 * @param {Function} [props.ErrorResponsePlaceholder]         Component rendered when the API response is an error.
 * @param {Function} [props.LoadingResponsePlaceholder]       Component rendered while the API request is loading.
 *
 * @return {JSX.Element} The rendered server-side content.
 */
function ServerSideRenderWithPostId({
  urlQueryArgs = EMPTY_OBJECT,
  ...props
}) {
  const currentPostId = (0,external_wp_data_namespaceObject.useSelect)(select => {
    // FIXME: @wordpress/server-side-render should not depend on @wordpress/editor.
    // It is used by blocks that can be loaded into a *non-post* block editor.
    // eslint-disable-next-line @wordpress/data-no-store-string-literals
    const postId = select('core/editor')?.getCurrentPostId();

    // For templates and template parts we use a custom ID format.
    // Since they aren't real posts, we don't want to use their ID
    // for server-side rendering. Since they use a string based ID,
    // we can assume real post IDs are numbers.
    return postId && typeof postId === 'number' ? postId : null;
  }, []);
  const newUrlQueryArgs = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!currentPostId) {
      return urlQueryArgs;
    }
    return {
      post_id: currentPostId,
      ...urlQueryArgs
    };
  }, [currentPostId, urlQueryArgs]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(ServerSideRender, {
    urlQueryArgs: newUrlQueryArgs,
    ...props
  });
}

;// ./packages/server-side-render/build-module/index.js
/**
 * Internal dependencies
 */



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


/* harmony default export */ const build_module = (ServerSideRenderCompat);

(window.wp = window.wp || {}).serverSideRender = __webpack_exports__["default"];
/******/ })()
;