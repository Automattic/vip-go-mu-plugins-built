var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// package-external:@wordpress/i18n
var require_i18n = __commonJS({
  "package-external:@wordpress/i18n"(exports, module) {
    module.exports = window.wp.i18n;
  }
});

// package-external:@wordpress/element
var require_element = __commonJS({
  "package-external:@wordpress/element"(exports, module) {
    module.exports = window.wp.element;
  }
});

// vendor-external:react
var require_react = __commonJS({
  "vendor-external:react"(exports, module) {
    module.exports = window.React;
  }
});

// vendor-external:react/jsx-runtime
var require_jsx_runtime = __commonJS({
  "vendor-external:react/jsx-runtime"(exports, module) {
    module.exports = window.ReactJSXRuntime;
  }
});

// vendor-external:react-dom
var require_react_dom = __commonJS({
  "vendor-external:react-dom"(exports, module) {
    module.exports = window.ReactDOM;
  }
});

// package-external:@wordpress/primitives
var require_primitives = __commonJS({
  "package-external:@wordpress/primitives"(exports, module) {
    module.exports = window.wp.primitives;
  }
});

// package-external:@wordpress/compose
var require_compose = __commonJS({
  "package-external:@wordpress/compose"(exports, module) {
    module.exports = window.wp.compose;
  }
});

// package-external:@wordpress/private-apis
var require_private_apis = __commonJS({
  "package-external:@wordpress/private-apis"(exports, module) {
    module.exports = window.wp.privateApis;
  }
});

// package-external:@wordpress/components
var require_components = __commonJS({
  "package-external:@wordpress/components"(exports, module) {
    module.exports = window.wp.components;
  }
});

// package-external:@wordpress/core-data
var require_core_data = __commonJS({
  "package-external:@wordpress/core-data"(exports, module) {
    module.exports = window.wp.coreData;
  }
});

// package-external:@wordpress/data
var require_data = __commonJS({
  "package-external:@wordpress/data"(exports, module) {
    module.exports = window.wp.data;
  }
});

// node_modules/fast-deep-equal/es6/index.js
var require_es6 = __commonJS({
  "node_modules/fast-deep-equal/es6/index.js"(exports, module) {
    "use strict";
    module.exports = function equal(a2, b2) {
      if (a2 === b2) return true;
      if (a2 && b2 && typeof a2 == "object" && typeof b2 == "object") {
        if (a2.constructor !== b2.constructor) return false;
        var length, i2, keys;
        if (Array.isArray(a2)) {
          length = a2.length;
          if (length != b2.length) return false;
          for (i2 = length; i2-- !== 0; )
            if (!equal(a2[i2], b2[i2])) return false;
          return true;
        }
        if (a2 instanceof Map && b2 instanceof Map) {
          if (a2.size !== b2.size) return false;
          for (i2 of a2.entries())
            if (!b2.has(i2[0])) return false;
          for (i2 of a2.entries())
            if (!equal(i2[1], b2.get(i2[0]))) return false;
          return true;
        }
        if (a2 instanceof Set && b2 instanceof Set) {
          if (a2.size !== b2.size) return false;
          for (i2 of a2.entries())
            if (!b2.has(i2[0])) return false;
          return true;
        }
        if (ArrayBuffer.isView(a2) && ArrayBuffer.isView(b2)) {
          length = a2.length;
          if (length != b2.length) return false;
          for (i2 = length; i2-- !== 0; )
            if (a2[i2] !== b2[i2]) return false;
          return true;
        }
        if (a2.constructor === RegExp) return a2.source === b2.source && a2.flags === b2.flags;
        if (a2.valueOf !== Object.prototype.valueOf) return a2.valueOf() === b2.valueOf();
        if (a2.toString !== Object.prototype.toString) return a2.toString() === b2.toString();
        keys = Object.keys(a2);
        length = keys.length;
        if (length !== Object.keys(b2).length) return false;
        for (i2 = length; i2-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b2, keys[i2])) return false;
        for (i2 = length; i2-- !== 0; ) {
          var key = keys[i2];
          if (!equal(a2[key], b2[key])) return false;
        }
        return true;
      }
      return a2 !== a2 && b2 !== b2;
    };
  }
});

// package-external:@wordpress/date
var require_date = __commonJS({
  "package-external:@wordpress/date"(exports, module) {
    module.exports = window.wp.date;
  }
});

// node_modules/deepmerge/dist/cjs.js
var require_cjs = __commonJS({
  "node_modules/deepmerge/dist/cjs.js"(exports, module) {
    "use strict";
    var isMergeableObject = function isMergeableObject2(value) {
      return isNonNullObject(value) && !isSpecial(value);
    };
    function isNonNullObject(value) {
      return !!value && typeof value === "object";
    }
    function isSpecial(value) {
      var stringValue = Object.prototype.toString.call(value);
      return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
    }
    var canUseSymbol = typeof Symbol === "function" && Symbol.for;
    var REACT_ELEMENT_TYPE = canUseSymbol ? /* @__PURE__ */ Symbol.for("react.element") : 60103;
    function isReactElement(value) {
      return value.$$typeof === REACT_ELEMENT_TYPE;
    }
    function emptyTarget(val) {
      return Array.isArray(val) ? [] : {};
    }
    function cloneUnlessOtherwiseSpecified(value, options) {
      return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
    }
    function defaultArrayMerge(target, source, options) {
      return target.concat(source).map(function(element) {
        return cloneUnlessOtherwiseSpecified(element, options);
      });
    }
    function getMergeFunction(key, options) {
      if (!options.customMerge) {
        return deepmerge;
      }
      var customMerge = options.customMerge(key);
      return typeof customMerge === "function" ? customMerge : deepmerge;
    }
    function getEnumerableOwnPropertySymbols(target) {
      return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
        return Object.propertyIsEnumerable.call(target, symbol);
      }) : [];
    }
    function getKeys(target) {
      return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
    }
    function propertyIsOnObject(object, property) {
      try {
        return property in object;
      } catch (_) {
        return false;
      }
    }
    function propertyIsUnsafe(target, key) {
      return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
    }
    function mergeObject(target, source, options) {
      var destination = {};
      if (options.isMergeableObject(target)) {
        getKeys(target).forEach(function(key) {
          destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
      }
      getKeys(source).forEach(function(key) {
        if (propertyIsUnsafe(target, key)) {
          return;
        }
        if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
          destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
        } else {
          destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
        }
      });
      return destination;
    }
    function deepmerge(target, source, options) {
      options = options || {};
      options.arrayMerge = options.arrayMerge || defaultArrayMerge;
      options.isMergeableObject = options.isMergeableObject || isMergeableObject;
      options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
      var sourceIsArray = Array.isArray(source);
      var targetIsArray = Array.isArray(target);
      var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
      if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
      } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
      } else {
        return mergeObject(target, source, options);
      }
    }
    deepmerge.all = function deepmergeAll(array, options) {
      if (!Array.isArray(array)) {
        throw new Error("first argument should be an array");
      }
      return array.reduce(function(prev, next) {
        return deepmerge(prev, next, options);
      }, {});
    };
    var deepmerge_1 = deepmerge;
    module.exports = deepmerge_1;
  }
});

// package-external:@wordpress/notices
var require_notices = __commonJS({
  "package-external:@wordpress/notices"(exports, module) {
    module.exports = window.wp.notices;
  }
});

// package-external:@wordpress/api-fetch
var require_api_fetch = __commonJS({
  "package-external:@wordpress/api-fetch"(exports, module) {
    module.exports = window.wp.apiFetch;
  }
});

// node_modules/clsx/dist/clsx.mjs
function r(e2) {
  var t2, f2, n2 = "";
  if ("string" == typeof e2 || "number" == typeof e2) n2 += e2;
  else if ("object" == typeof e2) if (Array.isArray(e2)) {
    var o2 = e2.length;
    for (t2 = 0; t2 < o2; t2++) e2[t2] && (f2 = r(e2[t2])) && (n2 && (n2 += " "), n2 += f2);
  } else for (f2 in e2) e2[f2] && (n2 && (n2 += " "), n2 += f2);
  return n2;
}
function clsx() {
  for (var e2, t2, f2 = 0, n2 = "", o2 = arguments.length; f2 < o2; f2++) (e2 = arguments[f2]) && (t2 = r(e2)) && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
var clsx_default = clsx;

// packages/ui/build-module/badge/badge.mjs
var import_element2 = __toESM(require_element(), 1);

// node_modules/@base-ui/utils/useControlled.mjs
var React = __toESM(require_react(), 1);

// node_modules/@base-ui/utils/error.mjs
var set;
if (true) {
  set = /* @__PURE__ */ new Set();
}
function error(...messages) {
  if (true) {
    const messageKey = messages.join(" ");
    if (!set.has(messageKey)) {
      set.add(messageKey);
      console.error(`Base UI: ${messageKey}`);
    }
  }
}

// node_modules/@base-ui/utils/useControlled.mjs
function useControlled({
  controlled,
  default: defaultProp,
  name,
  state = "value"
}) {
  const {
    current: isControlled
  } = React.useRef(controlled !== void 0);
  const [valueState, setValue] = React.useState(defaultProp);
  const value = isControlled ? controlled : valueState;
  if (true) {
    React.useEffect(() => {
      if (isControlled !== (controlled !== void 0)) {
        error([`A component is changing the ${isControlled ? "" : "un"}controlled ${state} state of ${name} to be ${isControlled ? "un" : ""}controlled.`, "Elements should not switch from uncontrolled to controlled (or vice versa).", `Decide between using a controlled or uncontrolled ${name} element for the lifetime of the component.`, "The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.", "More info: https://fb.me/react-controlled-components"].join("\n"));
      }
    }, [state, name, controlled]);
    const {
      current: defaultValue
    } = React.useRef(defaultProp);
    React.useEffect(() => {
      if (!isControlled && serializeToDevModeString(defaultValue) !== serializeToDevModeString(defaultProp)) {
        error([`A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. To suppress this warning opt to use a controlled ${name}.`].join("\n"));
      }
    }, [defaultProp]);
  }
  const setValueIfUncontrolled = React.useCallback((newValue) => {
    if (!isControlled) {
      setValue(newValue);
    }
  }, []);
  return [value, setValueIfUncontrolled];
}
function serializeToDevModeString(input) {
  let nextId = 0;
  const seen = /* @__PURE__ */ new WeakMap();
  try {
    const result = JSON.stringify(input, function replacer(key, value) {
      if (key === "_owner" && this != null && typeof this === "object" && "$$typeof" in this) {
        return void 0;
      }
      if (typeof value === "bigint") {
        return `__bigint__:${value}`;
      }
      if (value !== null && typeof value === "object") {
        const id = seen.get(value);
        if (id !== void 0) {
          return `__object__:${id}`;
        }
        seen.set(value, nextId);
        nextId += 1;
      }
      return value;
    });
    return result ?? `__top__:${typeof input}`;
  } catch {
    return "__unserializable__";
  }
}

// node_modules/@base-ui/utils/safeReact.mjs
var React2 = __toESM(require_react(), 1);
var SafeReact = {
  ...React2
};

// node_modules/@base-ui/utils/useRefWithInit.mjs
var React3 = __toESM(require_react(), 1);
var UNINITIALIZED = {};
function useRefWithInit(init, initArg) {
  const ref = React3.useRef(UNINITIALIZED);
  if (ref.current === UNINITIALIZED) {
    ref.current = init(initArg);
  }
  return ref;
}

// node_modules/@base-ui/utils/useStableCallback.mjs
var useInsertionEffect = SafeReact.useInsertionEffect;
var useSafeInsertionEffect = (
  // React 17 doesn't have useInsertionEffect.
  useInsertionEffect && // Preact replaces useInsertionEffect with useLayoutEffect and fires too late.
  useInsertionEffect !== SafeReact.useLayoutEffect ? useInsertionEffect : (fn) => fn()
);
function useStableCallback(callback) {
  const stable = useRefWithInit(createStableCallback).current;
  stable.next = callback;
  useSafeInsertionEffect(stable.effect);
  return stable.trampoline;
}
function createStableCallback() {
  const stable = {
    next: void 0,
    callback: assertNotCalled,
    trampoline: (...args) => stable.callback?.(...args),
    effect: () => {
      stable.callback = stable.next;
    }
  };
  return stable;
}
function assertNotCalled() {
  if (true) {
    throw (
      /* minify-error-disabled */
      new Error("Base UI: Cannot call an event handler while rendering.")
    );
  }
}

// node_modules/@base-ui/utils/warn.mjs
var set2;
if (true) {
  set2 = /* @__PURE__ */ new Set();
}
function warn(...messages) {
  if (true) {
    const messageKey = messages.join(" ");
    if (!set2.has(messageKey)) {
      set2.add(messageKey);
      console.warn(`Base UI: ${messageKey}`);
    }
  }
}

// node_modules/@base-ui/utils/useIsoLayoutEffect.mjs
var React4 = __toESM(require_react(), 1);
var noop = () => {
};
var useIsoLayoutEffect = typeof document !== "undefined" ? React4.useLayoutEffect : noop;

// node_modules/@base-ui/react/internals/useRenderElement.mjs
var React7 = __toESM(require_react(), 1);

// node_modules/@base-ui/utils/useMergedRefs.mjs
function useMergedRefs(a2, b2, c2, d2) {
  const forkRef = useRefWithInit(createForkRef).current;
  if (didChange(forkRef, a2, b2, c2, d2)) {
    update(forkRef, [a2, b2, c2, d2]);
  }
  return forkRef.callback;
}
function useMergedRefsN(refs) {
  const forkRef = useRefWithInit(createForkRef).current;
  if (didChangeN(forkRef, refs)) {
    update(forkRef, refs);
  }
  return forkRef.callback;
}
function createForkRef() {
  return {
    callback: null,
    cleanup: null,
    refs: []
  };
}
function didChange(forkRef, a2, b2, c2, d2) {
  return forkRef.refs[0] !== a2 || forkRef.refs[1] !== b2 || forkRef.refs[2] !== c2 || forkRef.refs[3] !== d2;
}
function didChangeN(forkRef, newRefs) {
  return forkRef.refs.length !== newRefs.length || forkRef.refs.some((ref, index) => ref !== newRefs[index]);
}
function update(forkRef, refs) {
  forkRef.refs = refs;
  if (refs.every((ref) => ref == null)) {
    forkRef.callback = null;
    return;
  }
  forkRef.callback = (instance) => {
    if (forkRef.cleanup) {
      forkRef.cleanup();
      forkRef.cleanup = null;
    }
    if (instance != null) {
      const cleanupCallbacks = Array(refs.length).fill(null);
      for (let i2 = 0; i2 < refs.length; i2 += 1) {
        const ref = refs[i2];
        if (ref == null) {
          continue;
        }
        switch (typeof ref) {
          case "function": {
            const refCleanup = ref(instance);
            if (typeof refCleanup === "function") {
              cleanupCallbacks[i2] = refCleanup;
            }
            break;
          }
          case "object": {
            ref.current = instance;
            break;
          }
          default:
        }
      }
      forkRef.cleanup = () => {
        for (let i2 = 0; i2 < refs.length; i2 += 1) {
          const ref = refs[i2];
          if (ref == null) {
            continue;
          }
          switch (typeof ref) {
            case "function": {
              const cleanupCallback = cleanupCallbacks[i2];
              if (typeof cleanupCallback === "function") {
                cleanupCallback();
              } else {
                void ref(null);
              }
              break;
            }
            case "object": {
              ref.current = null;
              break;
            }
            default:
          }
        }
      };
    }
  };
}

// node_modules/@base-ui/utils/getReactElementRef.mjs
var React6 = __toESM(require_react(), 1);

// node_modules/@base-ui/utils/reactVersion.mjs
var React5 = __toESM(require_react(), 1);
var majorVersion = parseInt(React5.version, 10);
function isReactVersionAtLeast(reactVersionToCheck) {
  return majorVersion >= reactVersionToCheck;
}

// node_modules/@base-ui/utils/getReactElementRef.mjs
function getReactElementRef(element) {
  if (!/* @__PURE__ */ React6.isValidElement(element)) {
    return null;
  }
  const reactElement = element;
  const propsWithRef = reactElement.props;
  return (isReactVersionAtLeast(19) ? propsWithRef?.ref : reactElement.ref) ?? null;
}

// node_modules/@base-ui/utils/mergeObjects.mjs
function mergeObjects(a2, b2) {
  if (a2 && !b2) {
    return a2;
  }
  if (!a2 && b2) {
    return b2;
  }
  if (a2 || b2) {
    return {
      ...a2,
      ...b2
    };
  }
  return void 0;
}

// node_modules/@base-ui/utils/empty.mjs
function NOOP() {
}
var EMPTY_ARRAY = Object.freeze([]);
var EMPTY_OBJECT = Object.freeze({});

// node_modules/@base-ui/react/internals/getStateAttributesProps.mjs
function getStateAttributesProps(state, customMapping) {
  const props = {};
  for (const key in state) {
    const value = state[key];
    if (customMapping?.hasOwnProperty(key)) {
      const customProps = customMapping[key](value);
      if (customProps != null) {
        Object.assign(props, customProps);
      }
      continue;
    }
    if (value === true) {
      props[`data-${key.toLowerCase()}`] = "";
    } else if (value) {
      props[`data-${key.toLowerCase()}`] = value.toString();
    }
  }
  return props;
}

// node_modules/@base-ui/react/utils/resolveClassName.mjs
function resolveClassName(className, state) {
  return typeof className === "function" ? className(state) : className;
}

// node_modules/@base-ui/react/utils/resolveStyle.mjs
function resolveStyle(style, state) {
  return typeof style === "function" ? style(state) : style;
}

// node_modules/@base-ui/react/merge-props/mergeProps.mjs
var EMPTY_PROPS = {};
function mergeProps(a2, b2, c2, d2, e2) {
  if (!c2 && !d2 && !e2 && !a2) {
    return createInitialMergedProps(b2);
  }
  let merged = createInitialMergedProps(a2);
  if (b2) {
    merged = mergeInto(merged, b2);
  }
  if (c2) {
    merged = mergeInto(merged, c2);
  }
  if (d2) {
    merged = mergeInto(merged, d2);
  }
  if (e2) {
    merged = mergeInto(merged, e2);
  }
  return merged;
}
function mergePropsN(props) {
  if (props.length === 0) {
    return EMPTY_PROPS;
  }
  if (props.length === 1) {
    return createInitialMergedProps(props[0]);
  }
  let merged = createInitialMergedProps(props[0]);
  for (let i2 = 1; i2 < props.length; i2 += 1) {
    merged = mergeInto(merged, props[i2]);
  }
  return merged;
}
function createInitialMergedProps(inputProps) {
  if (isPropsGetter(inputProps)) {
    return {
      ...resolvePropsGetter(inputProps, EMPTY_PROPS)
    };
  }
  return copyInitialProps(inputProps);
}
function mergeInto(merged, inputProps) {
  if (isPropsGetter(inputProps)) {
    return resolvePropsGetter(inputProps, merged);
  }
  return mutablyMergeInto(merged, inputProps);
}
function copyInitialProps(inputProps) {
  const copiedProps = {
    ...inputProps
  };
  for (const propName in copiedProps) {
    const propValue = copiedProps[propName];
    if (isEventHandler(propName, propValue)) {
      copiedProps[propName] = wrapEventHandler(propValue);
    }
  }
  return copiedProps;
}
function mutablyMergeInto(mergedProps, externalProps) {
  if (!externalProps) {
    return mergedProps;
  }
  for (const propName in externalProps) {
    const externalPropValue = externalProps[propName];
    switch (propName) {
      case "style": {
        mergedProps[propName] = mergeObjects(mergedProps.style, externalPropValue);
        break;
      }
      case "className": {
        mergedProps[propName] = mergeClassNames(mergedProps.className, externalPropValue);
        break;
      }
      default: {
        if (isEventHandler(propName, externalPropValue)) {
          mergedProps[propName] = mergeEventHandlers(mergedProps[propName], externalPropValue);
        } else {
          mergedProps[propName] = externalPropValue;
        }
      }
    }
  }
  return mergedProps;
}
function isEventHandler(key, value) {
  const code0 = key.charCodeAt(0);
  const code1 = key.charCodeAt(1);
  const code2 = key.charCodeAt(2);
  return code0 === 111 && code1 === 110 && code2 >= 65 && code2 <= 90 && (typeof value === "function" || typeof value === "undefined");
}
function isPropsGetter(inputProps) {
  return typeof inputProps === "function";
}
function resolvePropsGetter(inputProps, previousProps) {
  if (isPropsGetter(inputProps)) {
    return inputProps(previousProps);
  }
  return inputProps ?? EMPTY_PROPS;
}
function mergeEventHandlers(ourHandler, theirHandler) {
  if (!theirHandler) {
    return ourHandler;
  }
  if (!ourHandler) {
    return wrapEventHandler(theirHandler);
  }
  return (...args) => {
    const event = args[0];
    if (isSyntheticEvent(event)) {
      const baseUIEvent = event;
      makeEventPreventable(baseUIEvent);
      const result2 = theirHandler(...args);
      if (!baseUIEvent.baseUIHandlerPrevented) {
        ourHandler?.(...args);
      }
      return result2;
    }
    const result = theirHandler(...args);
    ourHandler?.(...args);
    return result;
  };
}
function wrapEventHandler(handler) {
  if (!handler) {
    return handler;
  }
  return (...args) => {
    const event = args[0];
    if (isSyntheticEvent(event)) {
      makeEventPreventable(event);
    }
    return handler(...args);
  };
}
function makeEventPreventable(event) {
  event.preventBaseUIHandler = () => {
    event.baseUIHandlerPrevented = true;
  };
  return event;
}
function mergeClassNames(ourClassName, theirClassName) {
  if (theirClassName) {
    if (ourClassName) {
      return theirClassName + " " + ourClassName;
    }
    return theirClassName;
  }
  return ourClassName;
}
function isSyntheticEvent(event) {
  return event != null && typeof event === "object" && "nativeEvent" in event;
}

// node_modules/@base-ui/react/internals/useRenderElement.mjs
var import_react = __toESM(require_react(), 1);
function useRenderElement(element, componentProps, params = {}) {
  const renderProp = componentProps.render;
  const outProps = useRenderElementProps(componentProps, params);
  if (params.enabled === false) {
    return null;
  }
  const state = params.state ?? EMPTY_OBJECT;
  return evaluateRenderProp(element, renderProp, outProps, state);
}
function useRenderElementProps(componentProps, params = {}) {
  const {
    className: classNameProp,
    style: styleProp,
    render: renderProp
  } = componentProps;
  const {
    state = EMPTY_OBJECT,
    ref,
    props,
    stateAttributesMapping: stateAttributesMapping3,
    enabled = true
  } = params;
  const className = enabled ? resolveClassName(classNameProp, state) : void 0;
  const style = enabled ? resolveStyle(styleProp, state) : void 0;
  const stateProps = enabled ? getStateAttributesProps(state, stateAttributesMapping3) : EMPTY_OBJECT;
  const resolvedProps = enabled && props ? resolveRenderFunctionProps(props) : void 0;
  const outProps = enabled ? mergeObjects(stateProps, resolvedProps) ?? {} : EMPTY_OBJECT;
  if (typeof document !== "undefined") {
    if (!enabled) {
      void useMergedRefs(null, null);
    } else if (Array.isArray(ref)) {
      outProps.ref = useMergedRefsN([outProps.ref, getReactElementRef(renderProp), ...ref]);
    } else {
      outProps.ref = useMergedRefs(outProps.ref, getReactElementRef(renderProp), ref);
    }
  }
  if (!enabled) {
    return EMPTY_OBJECT;
  }
  if (className !== void 0) {
    outProps.className = mergeClassNames(outProps.className, className);
  }
  if (style !== void 0) {
    outProps.style = mergeObjects(outProps.style, style);
  }
  return outProps;
}
function resolveRenderFunctionProps(props) {
  if (Array.isArray(props)) {
    return mergePropsN(props);
  }
  return mergeProps(void 0, props);
}
var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
var COMPONENT_IDENTIFIER_PATTERN = /^[A-Z][A-Za-z0-9$]*$/;
var LOWERCASE_CHARACTER_PATTERN = /[a-z]/;
function evaluateRenderProp(element, render4, props, state) {
  if (render4) {
    if (typeof render4 === "function") {
      if (true) {
        warnIfRenderPropLooksLikeComponent(render4);
      }
      return render4(props, state);
    }
    const mergedProps = mergeProps(props, render4.props);
    mergedProps.ref = props.ref;
    let newElement = render4;
    if (newElement?.$$typeof === REACT_LAZY_TYPE) {
      const children = React7.Children.toArray(render4);
      newElement = children[0];
    }
    if (true) {
      if (!/* @__PURE__ */ React7.isValidElement(newElement)) {
        throw new Error(["Base UI: The `render` prop was provided an invalid React element as `React.isValidElement(render)` is `false`.", "A valid React element must be provided to the `render` prop because it is cloned with props to replace the default element.", "https://base-ui.com/r/invalid-render-prop"].join("\n"));
      }
    }
    return /* @__PURE__ */ React7.cloneElement(newElement, mergedProps);
  }
  if (element) {
    if (typeof element === "string") {
      return renderTag(element, props);
    }
  }
  throw new Error(true ? "Base UI: Render element or function are not defined." : formatErrorMessage_default(8));
}
function warnIfRenderPropLooksLikeComponent(renderFn) {
  const functionName = renderFn.name;
  if (functionName.length === 0) {
    return;
  }
  if (!COMPONENT_IDENTIFIER_PATTERN.test(functionName)) {
    return;
  }
  if (!LOWERCASE_CHARACTER_PATTERN.test(functionName)) {
    return;
  }
  warn(`The \`render\` prop received a function named \`${functionName}\` that starts with an uppercase letter.`, "This usually means a React component was passed directly as `render={Component}`.", "Base UI calls `render` as a plain function, which can break the Rules of Hooks during reconciliation.", "If this is an intentional render callback, rename it to start with a lowercase letter.", "Use `render={<Component />}` or `render={(props) => <Component {...props} />}` instead.", "https://base-ui.com/r/invalid-render-prop");
}
function renderTag(Tag, props) {
  if (Tag === "button") {
    return /* @__PURE__ */ (0, import_react.createElement)("button", {
      type: "button",
      ...props,
      key: props.key
    });
  }
  if (Tag === "img") {
    return /* @__PURE__ */ (0, import_react.createElement)("img", {
      alt: "",
      ...props,
      key: props.key
    });
  }
  return /* @__PURE__ */ React7.createElement(Tag, props);
}

// node_modules/@base-ui/utils/useId.mjs
var React8 = __toESM(require_react(), 1);
var globalId = 0;
function useGlobalId(idOverride, prefix = "mui") {
  const [defaultId, setDefaultId] = React8.useState(idOverride);
  const id = idOverride || defaultId;
  React8.useEffect(() => {
    if (defaultId == null) {
      globalId += 1;
      setDefaultId(`${prefix}-${globalId}`);
    }
  }, [defaultId, prefix]);
  return id;
}
var maybeReactUseId = SafeReact.useId;
function useId(idOverride, prefix) {
  if (maybeReactUseId !== void 0) {
    const reactId = maybeReactUseId();
    return idOverride ?? (prefix ? `${prefix}-${reactId}` : reactId);
  }
  return useGlobalId(idOverride, prefix);
}

// node_modules/@base-ui/react/internals/useBaseUiId.mjs
function useBaseUiId(idOverride) {
  return useId(idOverride, "base-ui");
}

// node_modules/@base-ui/react/collapsible/root/useCollapsibleRoot.mjs
var React11 = __toESM(require_react(), 1);

// node_modules/@base-ui/react/internals/reason-parts.mjs
var reason_parts_exports = {};
__export(reason_parts_exports, {
  cancelOpen: () => cancelOpen,
  chipRemovePress: () => chipRemovePress,
  clearPress: () => clearPress,
  closePress: () => closePress,
  closeWatcher: () => closeWatcher,
  decrementPress: () => decrementPress,
  disabled: () => disabled,
  drag: () => drag,
  escapeKey: () => escapeKey,
  focusOut: () => focusOut,
  imperativeAction: () => imperativeAction,
  incrementPress: () => incrementPress,
  initial: () => initial,
  inputBlur: () => inputBlur,
  inputChange: () => inputChange,
  inputClear: () => inputClear,
  inputPaste: () => inputPaste,
  inputPress: () => inputPress,
  itemPress: () => itemPress,
  keyboard: () => keyboard,
  linkPress: () => linkPress,
  listNavigation: () => listNavigation,
  missing: () => missing,
  none: () => none,
  outsidePress: () => outsidePress,
  pointer: () => pointer,
  scrub: () => scrub,
  siblingOpen: () => siblingOpen,
  swipe: () => swipe,
  trackPress: () => trackPress,
  triggerFocus: () => triggerFocus,
  triggerHover: () => triggerHover,
  triggerPress: () => triggerPress,
  wheel: () => wheel,
  windowResize: () => windowResize
});
var none = "none";
var triggerPress = "trigger-press";
var triggerHover = "trigger-hover";
var triggerFocus = "trigger-focus";
var outsidePress = "outside-press";
var itemPress = "item-press";
var closePress = "close-press";
var linkPress = "link-press";
var clearPress = "clear-press";
var chipRemovePress = "chip-remove-press";
var trackPress = "track-press";
var incrementPress = "increment-press";
var decrementPress = "decrement-press";
var inputChange = "input-change";
var inputClear = "input-clear";
var inputBlur = "input-blur";
var inputPaste = "input-paste";
var inputPress = "input-press";
var focusOut = "focus-out";
var escapeKey = "escape-key";
var closeWatcher = "close-watcher";
var listNavigation = "list-navigation";
var keyboard = "keyboard";
var pointer = "pointer";
var drag = "drag";
var wheel = "wheel";
var scrub = "scrub";
var cancelOpen = "cancel-open";
var siblingOpen = "sibling-open";
var disabled = "disabled";
var missing = "missing";
var initial = "initial";
var imperativeAction = "imperative-action";
var swipe = "swipe";
var windowResize = "window-resize";

// node_modules/@base-ui/react/internals/createBaseUIEventDetails.mjs
function createChangeEventDetails(reason, event, trigger, customProperties) {
  let canceled = false;
  let allowPropagation = false;
  const custom = customProperties ?? EMPTY_OBJECT;
  const details = {
    reason,
    event: event ?? new Event("base-ui"),
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      allowPropagation = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return allowPropagation;
    },
    trigger,
    ...custom
  };
  return details;
}

// node_modules/@base-ui/react/internals/useTransitionStatus.mjs
var React10 = __toESM(require_react(), 1);

// node_modules/@base-ui/utils/useOnMount.mjs
var React9 = __toESM(require_react(), 1);
function useOnMount(fn) {
  React9.useEffect(fn, EMPTY_ARRAY);
}

// node_modules/@base-ui/utils/useAnimationFrame.mjs
var EMPTY = null;
var LAST_RAF = globalThis.requestAnimationFrame;
var Scheduler = class {
  /* This implementation uses an array as a backing data-structure for frame callbacks.
   * It allows `O(1)` callback cancelling by inserting a `null` in the array, though it
   * never calls the native `cancelAnimationFrame` if there are no frames left. This can
   * be much more efficient if there is a call pattern that alterns as
   * "request-cancel-request-cancel-…".
   * But in the case of "request-request-…-cancel-cancel-…", it leaves the final animation
   * frame to run anyway. We turn that frame into a `O(1)` no-op via `callbacksCount`. */
  callbacks = [];
  callbacksCount = 0;
  nextId = 1;
  startId = 1;
  isScheduled = false;
  tick = (timestamp) => {
    this.isScheduled = false;
    const currentCallbacks = this.callbacks;
    const currentCallbacksCount = this.callbacksCount;
    this.callbacks = [];
    this.callbacksCount = 0;
    this.startId = this.nextId;
    if (currentCallbacksCount > 0) {
      for (let i2 = 0; i2 < currentCallbacks.length; i2 += 1) {
        currentCallbacks[i2]?.(timestamp);
      }
    }
  };
  request(fn) {
    const id = this.nextId;
    this.nextId += 1;
    this.callbacks.push(fn);
    this.callbacksCount += 1;
    const didRAFChange = LAST_RAF !== requestAnimationFrame && (LAST_RAF = requestAnimationFrame, true);
    if (!this.isScheduled || didRAFChange) {
      requestAnimationFrame(this.tick);
      this.isScheduled = true;
    }
    return id;
  }
  cancel(id) {
    const index = id - this.startId;
    if (index < 0 || index >= this.callbacks.length) {
      return;
    }
    this.callbacks[index] = null;
    this.callbacksCount -= 1;
  }
};
var scheduler = new Scheduler();
var AnimationFrame = class _AnimationFrame {
  static create() {
    return new _AnimationFrame();
  }
  static request(fn) {
    return scheduler.request(fn);
  }
  static cancel(id) {
    return scheduler.cancel(id);
  }
  currentId = EMPTY;
  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  request(fn) {
    this.cancel();
    this.currentId = scheduler.request(() => {
      this.currentId = EMPTY;
      fn();
    });
  }
  cancel = () => {
    if (this.currentId !== EMPTY) {
      scheduler.cancel(this.currentId);
      this.currentId = EMPTY;
    }
  };
  disposeEffect = () => {
    return this.cancel;
  };
};
function useAnimationFrame() {
  const timeout = useRefWithInit(AnimationFrame.create).current;
  useOnMount(timeout.disposeEffect);
  return timeout;
}

// node_modules/@base-ui/react/internals/useTransitionStatus.mjs
function useTransitionStatus(open, enableIdleState = false, deferEndingState = false) {
  const [transitionStatus, setTransitionStatus] = React10.useState(open && enableIdleState ? "idle" : void 0);
  const [mounted, setMounted] = React10.useState(open);
  if (open && !mounted) {
    setMounted(true);
    setTransitionStatus("starting");
  }
  if (!open && mounted && transitionStatus !== "ending" && !deferEndingState) {
    setTransitionStatus("ending");
  }
  if (!open && !mounted && transitionStatus === "ending") {
    setTransitionStatus(void 0);
  }
  useIsoLayoutEffect(() => {
    if (!open && mounted && transitionStatus !== "ending" && deferEndingState) {
      const frame = AnimationFrame.request(() => {
        setTransitionStatus("ending");
      });
      return () => {
        AnimationFrame.cancel(frame);
      };
    }
    return void 0;
  }, [open, mounted, transitionStatus, deferEndingState]);
  useIsoLayoutEffect(() => {
    if (!open || enableIdleState) {
      return void 0;
    }
    const frame = AnimationFrame.request(() => {
      setTransitionStatus(void 0);
    });
    return () => {
      AnimationFrame.cancel(frame);
    };
  }, [enableIdleState, open]);
  useIsoLayoutEffect(() => {
    if (!open || !enableIdleState) {
      return void 0;
    }
    if (open && mounted && transitionStatus !== "idle") {
      setTransitionStatus("starting");
    }
    const frame = AnimationFrame.request(() => {
      setTransitionStatus("idle");
    });
    return () => {
      AnimationFrame.cancel(frame);
    };
  }, [enableIdleState, open, mounted, transitionStatus]);
  return {
    mounted,
    setMounted,
    transitionStatus
  };
}

// node_modules/@base-ui/react/collapsible/root/useCollapsibleRoot.mjs
function useCollapsibleRoot(parameters) {
  const {
    open: openParam,
    defaultOpen,
    onOpenChange,
    disabled: disabled2
  } = parameters;
  const [open, setOpen] = useControlled({
    controlled: openParam,
    default: defaultOpen,
    name: "Collapsible",
    state: "open"
  });
  const {
    mounted,
    setMounted,
    transitionStatus
  } = useTransitionStatus(open, true, true);
  const defaultPanelId = useBaseUiId();
  const [registeredPanelId, setPanelIdState] = React11.useState();
  const panelId = registeredPanelId === null ? void 0 : registeredPanelId ?? defaultPanelId;
  const handleTrigger = useStableCallback((event) => {
    const nextOpen = !open;
    const eventDetails = createChangeEventDetails(reason_parts_exports.triggerPress, event.nativeEvent);
    onOpenChange(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setOpen(nextOpen);
  });
  return React11.useMemo(() => ({
    defaultPanelId,
    disabled: disabled2,
    handleTrigger,
    mounted,
    open,
    panelId,
    setMounted,
    setOpen,
    setPanelIdState,
    transitionStatus
  }), [defaultPanelId, disabled2, handleTrigger, mounted, open, panelId, setMounted, setOpen, setPanelIdState, transitionStatus]);
}

// node_modules/@base-ui/react/collapsible/root/CollapsibleRootContext.mjs
var React12 = __toESM(require_react(), 1);
var CollapsibleRootContext = /* @__PURE__ */ React12.createContext(void 0);
if (true) CollapsibleRootContext.displayName = "CollapsibleRootContext";
function useCollapsibleRootContext() {
  const context = React12.useContext(CollapsibleRootContext);
  if (context === void 0) {
    throw new Error(true ? "Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>." : formatErrorMessage_default(15));
  }
  return context;
}

// node_modules/@base-ui/react/internals/stateAttributesMapping.mjs
var TransitionStatusDataAttributes = /* @__PURE__ */ (function(TransitionStatusDataAttributes2) {
  TransitionStatusDataAttributes2["startingStyle"] = "data-starting-style";
  TransitionStatusDataAttributes2["endingStyle"] = "data-ending-style";
  return TransitionStatusDataAttributes2;
})({});
var STARTING_HOOK = {
  "data-starting-style": ""
};
var ENDING_HOOK = {
  "data-ending-style": ""
};
var transitionStatusMapping = {
  transitionStatus(value) {
    if (value === "starting") {
      return STARTING_HOOK;
    }
    if (value === "ending") {
      return ENDING_HOOK;
    }
    return null;
  }
};

// node_modules/@base-ui/react/collapsible/panel/CollapsiblePanelDataAttributes.mjs
var CollapsiblePanelDataAttributes = (function(CollapsiblePanelDataAttributes2) {
  CollapsiblePanelDataAttributes2["open"] = "data-open";
  CollapsiblePanelDataAttributes2["closed"] = "data-closed";
  CollapsiblePanelDataAttributes2[CollapsiblePanelDataAttributes2["startingStyle"] = TransitionStatusDataAttributes.startingStyle] = "startingStyle";
  CollapsiblePanelDataAttributes2[CollapsiblePanelDataAttributes2["endingStyle"] = TransitionStatusDataAttributes.endingStyle] = "endingStyle";
  return CollapsiblePanelDataAttributes2;
})({});

// node_modules/@base-ui/react/collapsible/trigger/CollapsibleTriggerDataAttributes.mjs
var CollapsibleTriggerDataAttributes = /* @__PURE__ */ (function(CollapsibleTriggerDataAttributes2) {
  CollapsibleTriggerDataAttributes2["panelOpen"] = "data-panel-open";
  return CollapsibleTriggerDataAttributes2;
})({});

// node_modules/@base-ui/react/utils/collapsibleOpenStateMapping.mjs
var PANEL_OPEN_HOOK = {
  [CollapsiblePanelDataAttributes.open]: ""
};
var PANEL_CLOSED_HOOK = {
  [CollapsiblePanelDataAttributes.closed]: ""
};
var triggerOpenStateMapping = {
  open(value) {
    if (value) {
      return {
        [CollapsibleTriggerDataAttributes.panelOpen]: ""
      };
    }
    return null;
  }
};
var collapsibleOpenStateMapping = {
  open(value) {
    if (value) {
      return PANEL_OPEN_HOOK;
    }
    return PANEL_CLOSED_HOOK;
  }
};

// node_modules/@base-ui/react/internals/use-button/useButton.mjs
var React15 = __toESM(require_react(), 1);

// node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
  return typeof window !== "undefined";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}

// node_modules/@base-ui/react/internals/composite/root/CompositeRootContext.mjs
var React13 = __toESM(require_react(), 1);
var CompositeRootContext = /* @__PURE__ */ React13.createContext(void 0);
if (true) CompositeRootContext.displayName = "CompositeRootContext";
function useCompositeRootContext(optional = false) {
  const context = React13.useContext(CompositeRootContext);
  if (context === void 0 && !optional) {
    throw new Error(true ? "Base UI: CompositeRootContext is missing. Composite parts must be placed within <Composite.Root>." : formatErrorMessage_default(16));
  }
  return context;
}

// node_modules/@base-ui/react/utils/useFocusableWhenDisabled.mjs
var React14 = __toESM(require_react(), 1);
function useFocusableWhenDisabled(parameters) {
  const {
    focusableWhenDisabled,
    disabled: disabled2,
    composite = false,
    tabIndex: tabIndexProp = 0,
    isNativeButton
  } = parameters;
  const isFocusableComposite = composite && focusableWhenDisabled !== false;
  const isNonFocusableComposite = composite && focusableWhenDisabled === false;
  const props = React14.useMemo(() => {
    const additionalProps = {
      // allow Tabbing away from focusableWhenDisabled elements
      onKeyDown(event) {
        if (disabled2 && focusableWhenDisabled && event.key !== "Tab") {
          event.preventDefault();
        }
      }
    };
    if (!composite) {
      additionalProps.tabIndex = tabIndexProp;
      if (!isNativeButton && disabled2) {
        additionalProps.tabIndex = focusableWhenDisabled ? tabIndexProp : -1;
      }
    }
    if (isNativeButton && (focusableWhenDisabled || isFocusableComposite) || !isNativeButton && disabled2) {
      additionalProps["aria-disabled"] = disabled2;
    }
    if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite)) {
      additionalProps.disabled = disabled2;
    }
    return additionalProps;
  }, [composite, disabled2, focusableWhenDisabled, isFocusableComposite, isNonFocusableComposite, isNativeButton, tabIndexProp]);
  return {
    props
  };
}

// node_modules/@base-ui/utils/owner.mjs
function ownerDocument(node) {
  return node?.ownerDocument || document;
}

// node_modules/@base-ui/react/utils/dispatchClickWithModifiers.mjs
function dispatchClickWithModifiers(target, sourceEvent, {
  detail = 0
} = {}) {
  target.dispatchEvent(new (getWindow(target)).PointerEvent("click", {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail,
    shiftKey: sourceEvent.shiftKey,
    ctrlKey: sourceEvent.ctrlKey,
    altKey: sourceEvent.altKey,
    metaKey: sourceEvent.metaKey
  }));
}

// node_modules/@base-ui/react/internals/use-button/useButton.mjs
function useButton(parameters = {}) {
  const {
    disabled: disabled2 = false,
    focusableWhenDisabled,
    tabIndex = 0,
    native: isNativeButton = true,
    composite: compositeProp
  } = parameters;
  const elementRef = React15.useRef(null);
  const compositeRootContext = useCompositeRootContext(true);
  const isCompositeItem = compositeProp ?? compositeRootContext !== void 0;
  const {
    props: focusableWhenDisabledProps
  } = useFocusableWhenDisabled({
    focusableWhenDisabled,
    disabled: disabled2,
    composite: isCompositeItem,
    tabIndex,
    isNativeButton
  });
  if (true) {
    React15.useEffect(() => {
      if (!elementRef.current) {
        return;
      }
      const isButtonTag = isButtonElement(elementRef.current);
      if (isNativeButton) {
        if (!isButtonTag) {
          const ownerStackMessage = SafeReact.captureOwnerStack?.() || "";
          const message2 = "A component that acts as a button expected a native <button> because the `nativeButton` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the `render` prop, or set `nativeButton` to `false`.";
          error(`${message2}${ownerStackMessage}`);
        }
      } else if (isButtonTag) {
        const ownerStackMessage = SafeReact.captureOwnerStack?.() || "";
        const message2 = "A component that acts as a button expected a non-<button> because the `nativeButton` prop is false. Rendering a <button> keeps native behavior while Base UI applies non-native attributes and handlers, which can add unintended extra attributes (such as `role` or `aria-disabled`). Use a non-<button> in the `render` prop, or set `nativeButton` to `true`.";
        error(`${message2}${ownerStackMessage}`);
      }
    }, [isNativeButton]);
  }
  const updateDisabled = React15.useCallback(() => {
    const element = elementRef.current;
    if (!isButtonElement(element)) {
      return;
    }
    if (isCompositeItem && disabled2 && focusableWhenDisabledProps.disabled === void 0 && element.disabled) {
      element.disabled = false;
    }
  }, [disabled2, focusableWhenDisabledProps.disabled, isCompositeItem]);
  useIsoLayoutEffect(updateDisabled, [updateDisabled]);
  const getButtonProps = React15.useCallback((externalProps = {}) => {
    const {
      onClick: externalOnClick,
      onMouseDown: externalOnMouseDown,
      onKeyUp: externalOnKeyUp,
      onKeyDown: externalOnKeyDown,
      onPointerDown: externalOnPointerDown,
      ...otherExternalProps
    } = externalProps;
    return mergeProps({
      onClick(event) {
        if (disabled2) {
          event.preventDefault();
          return;
        }
        externalOnClick?.(event);
      },
      onMouseDown(event) {
        if (!disabled2) {
          externalOnMouseDown?.(event);
        }
      },
      onKeyDown(event) {
        if (disabled2) {
          return;
        }
        makeEventPreventable(event);
        externalOnKeyDown?.(event);
        if (event.baseUIHandlerPrevented) {
          return;
        }
        const isCurrentTarget = event.target === event.currentTarget;
        const currentTarget = event.currentTarget;
        const isButton = isButtonElement(currentTarget);
        const isLink = !isNativeButton && isValidLinkElement(currentTarget);
        const shouldClick = isCurrentTarget && (isNativeButton ? isButton : !isLink);
        const isEnterKey = event.key === "Enter";
        const isSpaceKey = event.key === " ";
        const role = currentTarget.getAttribute("role");
        const isTextNavigationRole = role?.startsWith("menuitem") || role === "option" || role === "gridcell";
        if (isCurrentTarget && isCompositeItem && isSpaceKey) {
          if (event.defaultPrevented && isTextNavigationRole) {
            return;
          }
          event.preventDefault();
          if (!isNativeButton || isButton) {
            event.preventBaseUIHandler();
            dispatchClickWithModifiers(currentTarget, event);
          }
          return;
        }
        if (!shouldClick || isNativeButton || !isSpaceKey && !isEnterKey) {
          if (isCurrentTarget && isLink && isSpaceKey) {
            event.preventDefault();
          }
          return;
        }
        if (event.defaultPrevented) {
          return;
        }
        event.preventDefault();
        if (isEnterKey) {
          event.preventBaseUIHandler();
          dispatchClickWithModifiers(currentTarget, event);
        }
      },
      onKeyUp(event) {
        if (disabled2) {
          return;
        }
        makeEventPreventable(event);
        externalOnKeyUp?.(event);
        if (event.target === event.currentTarget && isNativeButton && isCompositeItem && isButtonElement(event.currentTarget) && event.key === " ") {
          event.preventDefault();
          return;
        }
        if (event.baseUIHandlerPrevented) {
          return;
        }
        if (event.target === event.currentTarget && !isNativeButton && !isCompositeItem && !event.defaultPrevented && event.key === " ") {
          event.preventBaseUIHandler();
          dispatchClickWithModifiers(event.currentTarget, event);
        }
      },
      onPointerDown(event) {
        if (disabled2) {
          event.preventDefault();
          return;
        }
        externalOnPointerDown?.(event);
      }
    }, isNativeButton ? {
      type: "button"
    } : {
      role: "button"
    }, focusableWhenDisabledProps, otherExternalProps);
  }, [disabled2, focusableWhenDisabledProps, isCompositeItem, isNativeButton]);
  const buttonRef = useStableCallback((element) => {
    elementRef.current = element;
    updateDisabled();
  });
  return {
    getButtonProps,
    buttonRef
  };
}
function isButtonElement(elem) {
  return isHTMLElement(elem) && elem.tagName === "BUTTON";
}
function isValidLinkElement(elem) {
  return isHTMLElement(elem) && elem.tagName === "A" && Boolean(elem.href);
}

// node_modules/@base-ui/react/collapsible/panel/useCollapsiblePanel.mjs
var React17 = __toESM(require_react(), 1);

// node_modules/@base-ui/utils/addEventListener.mjs
function addEventListener(target, type, listener, options) {
  target.addEventListener(type, listener, options);
  return () => {
    target.removeEventListener(type, listener, options);
  };
}

// node_modules/@base-ui/utils/useValueAsRef.mjs
function useValueAsRef(value) {
  const latest = useRefWithInit(createLatestRef, value).current;
  latest.next = value;
  useIsoLayoutEffect(latest.effect);
  return latest;
}
function createLatestRef(value) {
  const latest = {
    current: value,
    next: value,
    effect: () => {
      latest.current = latest.next;
    }
  };
  return latest;
}

// node_modules/@base-ui/react/internals/useOpenChangeComplete.mjs
var React16 = __toESM(require_react(), 1);

// node_modules/@base-ui/react/internals/useAnimationsFinished.mjs
var ReactDOM = __toESM(require_react_dom(), 1);

// node_modules/@base-ui/react/utils/resolveRef.mjs
function resolveRef(maybeRef) {
  if (maybeRef == null) {
    return maybeRef;
  }
  return "current" in maybeRef ? maybeRef.current : maybeRef;
}

// node_modules/@base-ui/react/internals/useAnimationsFinished.mjs
function useAnimationsFinished(elementOrRef, waitForStartingStyleRemoved = false) {
  const frame = useAnimationFrame();
  return useStableCallback((fnToExecute, signal = null) => {
    frame.cancel();
    const element = resolveRef(elementOrRef);
    if (element == null) {
      return;
    }
    const resolvedElement = element;
    const done = () => {
      ReactDOM.flushSync(fnToExecute);
    };
    if (typeof resolvedElement.getAnimations !== "function" || globalThis.BASE_UI_ANIMATIONS_DISABLED) {
      fnToExecute();
      return;
    }
    function exec() {
      Promise.all(resolvedElement.getAnimations().map((animation) => animation.finished)).then(() => {
        if (!signal?.aborted) {
          done();
        }
      }, () => {
        if (signal?.aborted) {
          return;
        }
        const currentAnimations = resolvedElement.getAnimations();
        if (currentAnimations.some((animation) => animation.pending || animation.playState !== "finished")) {
          exec();
          return;
        }
        done();
      });
    }
    if (waitForStartingStyleRemoved) {
      const startingStyleAttribute = "data-starting-style";
      if (!resolvedElement.hasAttribute(startingStyleAttribute)) {
        frame.request(exec);
        return;
      }
      const attributeObserver = new MutationObserver(() => {
        if (!resolvedElement.hasAttribute(startingStyleAttribute)) {
          attributeObserver.disconnect();
          exec();
        }
      });
      attributeObserver.observe(resolvedElement, {
        attributes: true,
        attributeFilter: [startingStyleAttribute]
      });
      signal?.addEventListener("abort", () => attributeObserver.disconnect(), {
        once: true
      });
      return;
    }
    frame.request(exec);
  });
}

// node_modules/@base-ui/react/internals/useOpenChangeComplete.mjs
function useOpenChangeComplete(parameters) {
  const {
    enabled = true,
    open,
    ref,
    onComplete: onCompleteParam
  } = parameters;
  const onComplete = useStableCallback(onCompleteParam);
  const runOnceAnimationsFinish = useAnimationsFinished(ref, open);
  React16.useEffect(() => {
    if (!enabled) {
      return void 0;
    }
    const abortController = new AbortController();
    runOnceAnimationsFinish(onComplete, abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [enabled, open, onComplete, runOnceAnimationsFinish]);
}

// node_modules/@base-ui/react/collapsible/panel/useCollapsiblePanel.mjs
var EMPTY_DIMENSIONS = {
  height: void 0,
  width: void 0
};
function useCollapsiblePanel(parameters) {
  const {
    externalRef,
    hiddenUntilFound,
    id: idParam,
    keepMounted,
    mounted,
    onOpenChange,
    open,
    setMounted,
    setOpen,
    transitionStatus
  } = parameters;
  const panelRef = React17.useRef(null);
  const animationTypeRef = React17.useRef(null);
  const [dimensions, setDimensionsUnwrapped] = React17.useState(EMPTY_DIMENSIONS);
  const lastMeasuredDimensionsRef = React17.useRef(EMPTY_DIMENSIONS);
  const shouldSkipNextOpenRef = React17.useRef(false);
  const shouldPreventMountAnimationRef = React17.useRef(open);
  const shouldPreventActivityResumeAnimationRef = React17.useRef(false);
  const [forcePanelIdle, setForcePanelIdle] = React17.useState(false);
  const pendingTemporaryStyleRestoreRef = React17.useRef(null);
  const mergedPanelRef = useMergedRefs(externalRef, panelRef);
  const latestOpenRef = useValueAsRef(open);
  const runOnceCloseAnimationsFinish = useAnimationsFinished(panelRef);
  const hidden = !open && !mounted;
  const panelTransitionStatus = forcePanelIdle ? "idle" : transitionStatus;
  const shouldPreventOpenAnimation = open && // These 2 refs are safe to read in render, they are only written from committed
  // layout/effect paths and gate one-shot motion suppression for the next open
  // lifecycle. They intentionally expose the last committed motion snapshot.
  (shouldPreventMountAnimationRef.current || shouldPreventActivityResumeAnimationRef.current);
  const renderedDimensions = !open && mounted && // These 2 refs are also safe to read in render, both hold the last committed
  // animation mode and measurement. This fallback only restores a previously
  // measured pixel size after the live dimensions state has been reset back to `auto`.
  animationTypeRef.current === "css-animation" && dimensions.height === void 0 && dimensions.width === void 0 ? lastMeasuredDimensionsRef.current : dimensions;
  const shouldPersistHiddenTransitionStyles = hiddenUntilFound && hidden && animationTypeRef.current !== "css-animation";
  const setDimensions = useStableCallback((nextDimensions, shouldCacheMeasurement = true) => {
    if (shouldCacheMeasurement) {
      lastMeasuredDimensionsRef.current = nextDimensions;
    }
    setDimensionsUnwrapped(nextDimensions);
  });
  const restorePendingTemporaryStyle = useStableCallback(() => {
    pendingTemporaryStyleRestoreRef.current?.();
    pendingTemporaryStyleRestoreRef.current = null;
  });
  const setPendingTemporaryStyleRestore = useStableCallback((restore) => {
    restorePendingTemporaryStyle();
    pendingTemporaryStyleRestoreRef.current = () => {
      pendingTemporaryStyleRestoreRef.current = null;
      restore();
    };
  });
  const markActivityResumeAnimationSuppressed = useStableCallback(() => {
    if (open && mounted && animationTypeRef.current === "css-animation") {
      shouldPreventActivityResumeAnimationRef.current = true;
    }
  });
  useIsoLayoutEffect(() => {
    if (!forcePanelIdle || transitionStatus === "starting") {
      return;
    }
    setForcePanelIdle(false);
  }, [forcePanelIdle, transitionStatus]);
  React17.useEffect(() => {
    return () => {
      markActivityResumeAnimationSuppressed();
      restorePendingTemporaryStyle();
    };
  }, [markActivityResumeAnimationSuppressed, restorePendingTemporaryStyle]);
  useIsoLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return void 0;
    }
    if (!open && pendingTemporaryStyleRestoreRef.current) {
      restorePendingTemporaryStyle();
    }
    const animationType = getAnimationType(panel, shouldPreventOpenAnimation);
    animationTypeRef.current = animationType;
    if (open && transitionStatus === "idle" && shouldPreventMountAnimationRef.current && animationType === "css-animation") {
      lastMeasuredDimensionsRef.current = getDimensions(panel);
      return void 0;
    }
    if (open && transitionStatus === "starting") {
      const skipNextOpen = shouldSkipNextOpenRef.current;
      shouldSkipNextOpenRef.current = false;
      if (animationType === "none") {
        setDimensions(getDimensions(panel));
        setForcePanelIdle(true);
        return void 0;
      }
      if (animationType === "css-transition") {
        const restoreLayoutStyles = resetLayoutStyles(panel);
        setDimensions(getDimensions(panel));
        if (!skipNextOpen) {
          return restoreLayoutStyles;
        }
        const restoreTransitionDuration = setTemporaryStyle(panel, "transition-duration", "0s");
        setPendingTemporaryStyleRestore(restoreTransitionDuration);
        setForcePanelIdle(true);
        return restoreLayoutStyles;
      }
      setDimensions(getDimensions(panel));
      const restoreAnimationName = setTemporaryStyle(panel, "animation-name", "none");
      if (!skipNextOpen) {
        restoreAnimationName();
        return void 0;
      }
      const restoreAnimationDuration = setTemporaryStyle(panel, "animation-duration", "0s");
      restoreAnimationName();
      setPendingTemporaryStyleRestore(restoreAnimationDuration);
      setForcePanelIdle(true);
      return void 0;
    }
    if (!open && mounted && (transitionStatus === "idle" || transitionStatus === "starting")) {
      shouldPreventMountAnimationRef.current = false;
      shouldPreventActivityResumeAnimationRef.current = false;
      if (animationType === "none") {
        setDimensions(EMPTY_DIMENSIONS, false);
        setMounted(false);
        return void 0;
      }
      setDimensions(getDimensions(panel));
      return void 0;
    }
    if (transitionStatus !== "ending") {
      return void 0;
    }
    if (animationType === "none") {
      setMounted(false);
      return void 0;
    }
    const nextDimensions = getDimensions(panel);
    const hasMeasuredSize = nextDimensions.height > 0 || nextDimensions.width > 0;
    if (!hasMeasuredSize) {
      setMounted(false);
      return void 0;
    }
    setDimensions(nextDimensions);
    if (animationType === "css-animation") {
      const restoreAnimationName = setTemporaryStyle(panel, "animation-name", "none");
      restoreAnimationName();
    }
    return void 0;
  }, [mounted, open, restorePendingTemporaryStyle, setDimensions, setMounted, setPendingTemporaryStyleRestore, shouldPreventOpenAnimation, transitionStatus]);
  useOpenChangeComplete({
    enabled: open && mounted && panelTransitionStatus === "idle",
    open: true,
    ref: panelRef,
    onComplete() {
      if (!open) {
        return;
      }
      setDimensions(EMPTY_DIMENSIONS, false);
    }
  });
  React17.useEffect(() => {
    if (open || !mounted || panelTransitionStatus !== "ending") {
      return void 0;
    }
    const panel = panelRef.current;
    if (!panel) {
      return void 0;
    }
    const abortController = new AbortController();
    let endingStyleFrame = -1;
    function handleComplete() {
      if (latestOpenRef.current) {
        return;
      }
      setMounted(false);
      setDimensions(EMPTY_DIMENSIONS, false);
    }
    endingStyleFrame = AnimationFrame.request(() => {
      runOnceCloseAnimationsFinish(handleComplete, abortController.signal);
    });
    return () => {
      AnimationFrame.cancel(endingStyleFrame);
      abortController.abort();
    };
  }, [latestOpenRef, mounted, open, panelTransitionStatus, runOnceCloseAnimationsFinish, setDimensions, setMounted]);
  useIsoLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || !hiddenUntilFound || !hidden) {
      return;
    }
    panel.setAttribute("hidden", "until-found");
  }, [hidden, hiddenUntilFound]);
  React17.useEffect(function registerBeforeMatchListener() {
    const panel = panelRef.current;
    if (!panel) {
      return void 0;
    }
    function handleBeforeMatch(event) {
      const eventDetails = createChangeEventDetails(reason_parts_exports.none, event);
      onOpenChange(true, eventDetails);
      if (eventDetails.isCanceled) {
        return;
      }
      shouldSkipNextOpenRef.current = true;
      setOpen(true);
    }
    return addEventListener(panel, "beforematch", handleBeforeMatch);
  }, [onOpenChange, setOpen]);
  const shouldRender = keepMounted || hiddenUntilFound || mounted || open;
  return {
    height: renderedDimensions.height,
    props: {
      ...shouldPersistHiddenTransitionStyles ? {
        [CollapsiblePanelDataAttributes.startingStyle]: ""
      } : void 0,
      hidden,
      id: idParam
    },
    ref: mergedPanelRef,
    shouldPreventOpenAnimation,
    shouldRender,
    transitionStatus: panelTransitionStatus,
    width: renderedDimensions.width
  };
}
function getDimensions(element) {
  return {
    height: element.scrollHeight,
    width: element.scrollWidth
  };
}
function getAnimationType(element, hasSuppressedMountAnimation) {
  const panelStyles = getWindow(element).getComputedStyle(element);
  const hasAnimation = (panelStyles.animationName.split(",").map((name) => name.trim()).some((name) => name !== "" && name !== "none") || hasSuppressedMountAnimation) && hasNonZeroDuration(panelStyles.animationDuration);
  const hasTransition = hasNonZeroDuration(panelStyles.transitionDuration);
  if (hasAnimation && hasTransition) {
    if (true) {
      warn("CSS transitions and CSS animations both detected on Collapsible or Accordion panel.", "Only one of either animation type should be used.");
    }
    return "css-transition";
  }
  if (hasTransition) {
    return "css-transition";
  }
  if (hasAnimation) {
    return "css-animation";
  }
  return "none";
}
function hasNonZeroDuration(value) {
  return value.split(",").map((part) => part.trim()).some((part) => part !== "" && Number.parseFloat(part) > 0);
}
function setTemporaryStyle(element, property, value) {
  const previousValue = element.style.getPropertyValue(property);
  const previousPriority = element.style.getPropertyPriority(property);
  element.style.setProperty(property, value);
  return () => {
    if (previousValue === "") {
      element.style.removeProperty(property);
      return;
    }
    element.style.setProperty(property, previousValue, previousPriority);
  };
}
function resetLayoutStyles(element) {
  const originalLayoutStyles = {
    "justify-content": element.style.justifyContent,
    "align-items": element.style.alignItems,
    "align-content": element.style.alignContent,
    "justify-items": element.style.justifyItems
  };
  Object.keys(originalLayoutStyles).forEach((key) => {
    element.style.setProperty(key, "initial", "important");
  });
  function restoreLayoutStyles() {
    Object.entries(originalLayoutStyles).forEach(([key, value]) => {
      if (value === "") {
        element.style.removeProperty(key);
        return;
      }
      element.style.setProperty(key, value);
    });
  }
  const frame = AnimationFrame.request(restoreLayoutStyles);
  return () => {
    AnimationFrame.cancel(frame);
    restoreLayoutStyles();
  };
}

// node_modules/@base-ui/utils/useTimeout.mjs
var EMPTY2 = 0;
var Timeout = class _Timeout {
  static create() {
    return new _Timeout();
  }
  currentId = EMPTY2;
  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  start(delay, fn) {
    this.clear();
    this.currentId = setTimeout(() => {
      this.currentId = EMPTY2;
      fn();
    }, delay);
  }
  isStarted() {
    return this.currentId !== EMPTY2;
  }
  clear = () => {
    if (this.currentId !== EMPTY2) {
      clearTimeout(this.currentId);
      this.currentId = EMPTY2;
    }
  };
  disposeEffect = () => {
    return this.clear;
  };
};
function useTimeout() {
  const timeout = useRefWithInit(Timeout.create).current;
  useOnMount(timeout.disposeEffect);
  return timeout;
}

// node_modules/@base-ui/react/internals/shadowDom.mjs
function activeElement(doc) {
  let element = doc.activeElement;
  while (element?.shadowRoot?.activeElement != null) {
    element = element.shadowRoot.activeElement;
  }
  return element;
}
function getTarget(event) {
  if ("composedPath" in event) {
    return event.composedPath()[0];
  }
  return event.target;
}

// node_modules/@base-ui/react/internals/field-root-context/FieldRootContext.mjs
var React18 = __toESM(require_react(), 1);

// node_modules/@base-ui/react/internals/field-constants/constants.mjs
var DEFAULT_VALIDITY_STATE = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: null,
  valueMissing: false
};
var DEFAULT_FIELD_STATE_ATTRIBUTES = {
  valid: null,
  touched: false,
  dirty: false,
  filled: false,
  focused: false
};
var DEFAULT_FIELD_ROOT_STATE = {
  disabled: false,
  ...DEFAULT_FIELD_STATE_ATTRIBUTES
};
var fieldValidityMapping = {
  valid(value) {
    if (value === null) {
      return null;
    }
    if (value) {
      return {
        "data-valid": ""
      };
    }
    return {
      "data-invalid": ""
    };
  }
};

// node_modules/@base-ui/react/internals/field-root-context/FieldRootContext.mjs
var DEFAULT_FIELD_ROOT_CONTEXT = {
  invalid: void 0,
  name: void 0,
  validityData: {
    state: DEFAULT_VALIDITY_STATE,
    errors: [],
    error: "",
    value: "",
    initialValue: null
  },
  setValidityData: NOOP,
  disabled: void 0,
  setTouched: NOOP,
  setDirty: NOOP,
  setFilled: NOOP,
  setFocused: NOOP,
  validationMode: "onSubmit",
  shouldValidateOnChange: () => false,
  state: DEFAULT_FIELD_ROOT_STATE,
  registerFieldControl: NOOP,
  validation: {
    getValidationProps: (_disabled, props = EMPTY_OBJECT) => props,
    inputRef: {
      current: null
    },
    registeredInputs: /* @__PURE__ */ new Map(),
    registerInput: NOOP,
    getInputControl: () => null,
    commit: async () => {
    },
    change: NOOP
  }
};
var FieldRootContext = /* @__PURE__ */ React18.createContext(DEFAULT_FIELD_ROOT_CONTEXT);
if (true) FieldRootContext.displayName = "FieldRootContext";
function useFieldRootContext(optional = true) {
  const context = React18.useContext(FieldRootContext);
  if (context.setValidityData === NOOP && !optional) {
    throw new Error(true ? "Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>." : formatErrorMessage_default(28));
  }
  return context;
}

// node_modules/@base-ui/react/internals/field-register-control/useRegisterFieldControl.mjs
function useRegisterFieldControl(controlRef, id, value, getFormValueOverride, enabled = true, name) {
  const {
    registerFieldControl
  } = useFieldRootContext();
  const sourceRef = useRefWithInit(() => /* @__PURE__ */ Symbol());
  useIsoLayoutEffect(() => {
    const source = sourceRef.current;
    if (!enabled) {
      registerFieldControl(source, void 0);
      return;
    }
    const registration = {
      controlRef,
      getValue: getFormValueOverride,
      id,
      name,
      value
    };
    registerFieldControl(source, registration);
  }, [controlRef, enabled, getFormValueOverride, id, name, registerFieldControl, sourceRef, value]);
  useIsoLayoutEffect(() => {
    const source = sourceRef.current;
    return () => {
      registerFieldControl(source, void 0);
    };
  }, [registerFieldControl, sourceRef]);
}

// node_modules/@base-ui/react/internals/form-context/FormContext.mjs
var React19 = __toESM(require_react(), 1);
var FormContext = /* @__PURE__ */ React19.createContext({
  elementRef: {
    current: null
  },
  formRef: {
    current: {
      fields: /* @__PURE__ */ new Map()
    }
  },
  errors: {},
  clearErrors: NOOP,
  validationMode: "onSubmit",
  submitAttemptedRef: {
    current: false
  }
});
if (true) FormContext.displayName = "FormContext";
function useFormContext() {
  return React19.useContext(FormContext);
}

// node_modules/@base-ui/react/internals/labelable-provider/useLabelableId.mjs
var React21 = __toESM(require_react(), 1);

// node_modules/@base-ui/react/internals/labelable-provider/LabelableContext.mjs
var React20 = __toESM(require_react(), 1);
var LabelableContext = /* @__PURE__ */ React20.createContext({
  controlId: void 0,
  registerControlId: NOOP,
  labelId: void 0,
  setLabelId: NOOP,
  messageIds: [],
  setMessageIds: NOOP,
  getDescriptionProps: (externalProps) => externalProps
});
if (true) LabelableContext.displayName = "LabelableContext";
function useLabelableContext() {
  return React20.useContext(LabelableContext);
}

// node_modules/@base-ui/react/internals/labelable-provider/useLabelableId.mjs
function useLabelableId(params = {}) {
  const {
    id,
    implicit = false,
    controlRef
  } = params;
  const {
    controlId,
    registerControlId
  } = useLabelableContext();
  const defaultId = useBaseUiId(id);
  const controlIdForEffect = implicit ? controlId : void 0;
  const controlSourceRef = useRefWithInit(() => /* @__PURE__ */ Symbol());
  const hasRegisteredRef = React21.useRef(false);
  const hadExplicitIdRef = React21.useRef(id != null);
  const unregisterControlId = useStableCallback(() => {
    if (!hasRegisteredRef.current || registerControlId === NOOP) {
      return;
    }
    hasRegisteredRef.current = false;
    registerControlId(controlSourceRef.current, void 0);
  });
  useIsoLayoutEffect(() => {
    if (registerControlId === NOOP) {
      return void 0;
    }
    let nextId;
    if (implicit) {
      const elem = controlRef?.current;
      if (isElement(elem) && elem.closest("label") != null) {
        nextId = id ?? null;
      } else {
        nextId = controlIdForEffect ?? defaultId;
      }
    } else if (id != null) {
      hadExplicitIdRef.current = true;
      nextId = id;
    } else if (hadExplicitIdRef.current) {
      nextId = defaultId;
    } else {
      unregisterControlId();
      return void 0;
    }
    if (nextId === void 0) {
      unregisterControlId();
      return void 0;
    }
    hasRegisteredRef.current = true;
    registerControlId(controlSourceRef.current, nextId);
    return void 0;
  }, [id, controlRef, controlIdForEffect, registerControlId, implicit, defaultId, controlSourceRef, unregisterControlId]);
  React21.useEffect(() => {
    return unregisterControlId;
  }, [unregisterControlId]);
  return controlId ?? defaultId;
}

// node_modules/@base-ui/react/button/Button.mjs
var React22 = __toESM(require_react(), 1);
var Button = /* @__PURE__ */ React22.forwardRef(function Button2(componentProps, forwardedRef) {
  const {
    render: render4,
    className,
    disabled: disabled2 = false,
    focusableWhenDisabled = false,
    nativeButton = true,
    style,
    ...elementProps
  } = componentProps;
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled: disabled2,
    focusableWhenDisabled,
    native: nativeButton
  });
  const state = {
    disabled: disabled2
  };
  return useRenderElement("button", componentProps, {
    state,
    ref: [forwardedRef, buttonRef],
    props: [elementProps, getButtonProps]
  });
});
if (true) Button.displayName = "Button";

// node_modules/@base-ui/react/field/item/FieldItemContext.mjs
var React23 = __toESM(require_react(), 1);
var FieldItemContext = /* @__PURE__ */ React23.createContext({
  disabled: false
});
if (true) FieldItemContext.displayName = "FieldItemContext";
function useFieldItemContext() {
  const context = React23.useContext(FieldItemContext);
  return context;
}

// node_modules/@base-ui/react/field/root/useFieldValidation.mjs
var React24 = __toESM(require_react(), 1);

// node_modules/@base-ui/react/field/utils/getCombinedFieldValidityData.mjs
function getCombinedFieldValidityData(validityData, invalid) {
  return {
    ...validityData,
    state: {
      ...validityData.state,
      valid: !invalid && validityData.state.valid
    }
  };
}

// node_modules/@base-ui/react/field/root/useFieldValidation.mjs
var validityKeys = Object.keys(DEFAULT_VALIDITY_STATE);
function isEligibleInput(input, formElement) {
  if (input.matches(":disabled")) {
    return false;
  }
  if (!formElement || input.form === formElement) {
    return true;
  }
  return input.form === null && !input.hasAttribute("form");
}
function findRepresentativeInput(inputs, formElement) {
  let fallback = null;
  for (const input of inputs.keys()) {
    if (!isEligibleInput(input, formElement)) {
      continue;
    }
    if (!input.validity.valid) {
      return input;
    }
    fallback ??= input;
  }
  return fallback;
}
function clearCustomValidity(element, inputs) {
  for (const input of inputs.keys()) {
    input.setCustomValidity("");
  }
  element?.setCustomValidity("");
}
function useFieldValidation(params) {
  const {
    elementRef,
    formRef
  } = useFormContext();
  const {
    setValidityData,
    validate,
    validityData,
    validationDebounceTime,
    invalid,
    markedDirtyRef,
    state,
    shouldValidateOnChange,
    registeredFieldIdRef
  } = params;
  const {
    controlId,
    getDescriptionProps
  } = useLabelableContext();
  const timeout = useTimeout();
  const inputRef = React24.useRef(null);
  const registeredInputs = useRefWithInit(() => /* @__PURE__ */ new Map()).current;
  const validationCommitIdRef = React24.useRef(0);
  const registerInput = React24.useCallback((element, registration) => {
    registeredInputs.set(element, registration);
    return () => {
      registeredInputs.delete(element);
    };
  }, [registeredInputs]);
  const getInputControl = useStableCallback(() => {
    const element = findRepresentativeInput(registeredInputs, elementRef.current);
    return element && registeredInputs.get(element)?.controlRef.current || null;
  });
  const commit = useStableCallback(async (value, revalidate = false) => {
    validationCommitIdRef.current += 1;
    const validationCommitId = validationCommitIdRef.current;
    function updateRegisteredFieldValidity(nextValidityData2, externalInvalid = invalid) {
      const fieldId = registeredFieldIdRef.current ?? controlId;
      if (fieldId == null) {
        return;
      }
      const currentFieldData = formRef.current.fields.get(fieldId);
      if (!currentFieldData) {
        return;
      }
      const validityDataWithFormErrors = getCombinedFieldValidityData(nextValidityData2, externalInvalid);
      formRef.current.fields.set(fieldId, {
        ...currentFieldData,
        validityData: validityDataWithFormErrors
      });
    }
    function publishAllValid(input, externalInvalid) {
      const nextValidityData2 = {
        value,
        state: {
          ...DEFAULT_VALIDITY_STATE,
          valid: true
        },
        error: "",
        errors: [],
        initialValue: validityData.initialValue
      };
      clearCustomValidity(input, registeredInputs);
      updateRegisteredFieldValidity(nextValidityData2, externalInvalid);
      setValidityData(nextValidityData2);
    }
    const element = registeredInputs.size > 0 ? findRepresentativeInput(registeredInputs, elementRef.current) : inputRef.current;
    if (revalidate) {
      if (state.valid !== false || !element) {
        return;
      }
      const currentNativeValidity = element.validity;
      if (!currentNativeValidity.valueMissing) {
        publishAllValid(element, false);
        return;
      }
      for (const key of validityKeys) {
        if (key !== "valid" && key !== "valueMissing" && key !== "customError" && currentNativeValidity[key]) {
          return;
        }
      }
    }
    function getState(el) {
      const computedState = validityKeys.reduce((acc, key) => {
        acc[key] = el.validity[key];
        return acc;
      }, {});
      let hasOnlyValueMissingError = false;
      for (const key of validityKeys) {
        if (key === "valid") {
          continue;
        }
        if (key === "valueMissing" && computedState[key]) {
          hasOnlyValueMissingError = true;
        } else if (computedState[key]) {
          return computedState;
        }
      }
      if (hasOnlyValueMissingError && !markedDirtyRef.current) {
        computedState.valid = true;
        computedState.valueMissing = false;
      }
      return computedState;
    }
    timeout.clear();
    let result = null;
    let validationErrors = [];
    const nextState = element ? getState(element) : {
      ...DEFAULT_VALIDITY_STATE,
      valid: true
    };
    let defaultValidationMessage;
    const isValidatingOnChange = shouldValidateOnChange();
    if (element && element.validationMessage && !isValidatingOnChange) {
      defaultValidationMessage = element.validationMessage;
      validationErrors = [element.validationMessage];
    } else {
      const formValues = Array.from(formRef.current.fields.values()).reduce((acc, field) => {
        if (field.name) {
          acc[field.name] = field.getValue();
        }
        return acc;
      }, {});
      const resultOrPromise = validate(value, formValues);
      if (typeof resultOrPromise === "object" && resultOrPromise !== null && "then" in resultOrPromise) {
        result = await resultOrPromise;
        if (validationCommitId !== validationCommitIdRef.current) {
          return;
        }
      } else {
        result = resultOrPromise;
      }
      if (result !== null) {
        nextState.valid = false;
        nextState.customError = true;
        if (Array.isArray(result)) {
          validationErrors = result;
          element?.setCustomValidity(result.join("\n"));
        } else if (result) {
          validationErrors = [result];
          element?.setCustomValidity(result);
        }
      } else if (isValidatingOnChange) {
        clearCustomValidity(element, registeredInputs);
        nextState.customError = false;
        if (element && element.validationMessage) {
          defaultValidationMessage = element.validationMessage;
          validationErrors = [element.validationMessage];
        } else if ((!element || element.validity.valid) && !nextState.valid) {
          nextState.valid = true;
        }
      }
    }
    const nextValidityData = {
      value,
      state: nextState,
      error: defaultValidationMessage ?? (Array.isArray(result) ? result[0] : result ?? ""),
      errors: validationErrors,
      initialValue: validityData.initialValue
    };
    updateRegisteredFieldValidity(nextValidityData);
    setValidityData(nextValidityData);
  });
  const change = useStableCallback((value) => {
    timeout.clear();
    const validateOnChange = shouldValidateOnChange();
    if (validateOnChange && value !== "" && validationDebounceTime) {
      validationCommitIdRef.current += 1;
      timeout.start(validationDebounceTime, () => {
        commit(value);
      });
    } else {
      commit(value, !validateOnChange);
    }
  });
  const getValidationProps = React24.useCallback((disabled2, externalProps = {}) => mergeProps(getDescriptionProps(externalProps), state.valid === false && !state.disabled && !disabled2 ? {
    "aria-invalid": true
  } : EMPTY_OBJECT), [getDescriptionProps, state.disabled, state.valid]);
  return React24.useMemo(() => ({
    getValidationProps,
    inputRef,
    registeredInputs,
    registerInput,
    getInputControl,
    commit,
    change
  }), [getValidationProps, registeredInputs, registerInput, getInputControl, commit, change]);
}

// node_modules/@base-ui/react/collapsible/index.parts.mjs
var index_parts_exports = {};
__export(index_parts_exports, {
  Panel: () => CollapsiblePanel,
  Root: () => CollapsibleRoot,
  Trigger: () => CollapsibleTrigger
});

// node_modules/@base-ui/react/collapsible/root/CollapsibleRoot.mjs
var React25 = __toESM(require_react(), 1);

// node_modules/@base-ui/react/collapsible/root/stateAttributesMapping.mjs
var collapsibleStateAttributesMapping = {
  ...collapsibleOpenStateMapping,
  ...transitionStatusMapping
};

// node_modules/@base-ui/react/collapsible/root/CollapsibleRoot.mjs
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var CollapsibleRoot = /* @__PURE__ */ React25.forwardRef(function CollapsibleRoot2(componentProps, forwardedRef) {
  const {
    render: render4,
    className,
    defaultOpen = false,
    disabled: disabled2 = false,
    onOpenChange: onOpenChangeProp,
    open,
    style,
    ...elementProps
  } = componentProps;
  const onOpenChange = useStableCallback(onOpenChangeProp);
  const collapsible = useCollapsibleRoot({
    open,
    defaultOpen,
    onOpenChange,
    disabled: disabled2
  });
  const state = React25.useMemo(() => ({
    open: collapsible.open,
    disabled: collapsible.disabled,
    transitionStatus: collapsible.transitionStatus
  }), [collapsible.open, collapsible.disabled, collapsible.transitionStatus]);
  const contextValue = React25.useMemo(() => ({
    ...collapsible,
    onOpenChange,
    state
  }), [collapsible, onOpenChange, state]);
  const element = useRenderElement("div", componentProps, {
    state,
    ref: forwardedRef,
    props: elementProps,
    stateAttributesMapping: collapsibleStateAttributesMapping
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleRootContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (true) CollapsibleRoot.displayName = "CollapsibleRoot";

// node_modules/@base-ui/react/collapsible/trigger/CollapsibleTrigger.mjs
var React26 = __toESM(require_react(), 1);
var stateAttributesMapping = {
  ...triggerOpenStateMapping,
  ...transitionStatusMapping
};
var CollapsibleTrigger = /* @__PURE__ */ React26.forwardRef(function CollapsibleTrigger2(componentProps, forwardedRef) {
  const {
    panelId,
    open,
    handleTrigger,
    state,
    disabled: contextDisabled
  } = useCollapsibleRootContext();
  const {
    className,
    disabled: disabled2 = contextDisabled,
    render: render4,
    nativeButton = true,
    style,
    ...elementProps
  } = componentProps;
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled: disabled2,
    focusableWhenDisabled: true,
    native: nativeButton
  });
  const element = useRenderElement("button", componentProps, {
    state,
    ref: [forwardedRef, buttonRef],
    props: [{
      "aria-controls": open ? panelId : void 0,
      "aria-expanded": open,
      onClick: handleTrigger
    }, elementProps, getButtonProps],
    stateAttributesMapping
  });
  return element;
});
if (true) CollapsibleTrigger.displayName = "CollapsibleTrigger";

// node_modules/@base-ui/react/collapsible/panel/CollapsiblePanel.mjs
var React27 = __toESM(require_react(), 1);

// node_modules/@base-ui/react/collapsible/panel/CollapsiblePanelCssVars.mjs
var CollapsiblePanelCssVars = /* @__PURE__ */ (function(CollapsiblePanelCssVars2) {
  CollapsiblePanelCssVars2["collapsiblePanelHeight"] = "--collapsible-panel-height";
  CollapsiblePanelCssVars2["collapsiblePanelWidth"] = "--collapsible-panel-width";
  return CollapsiblePanelCssVars2;
})({});

// node_modules/@base-ui/react/collapsible/panel/CollapsiblePanel.mjs
var CollapsiblePanel = /* @__PURE__ */ React27.forwardRef(function CollapsiblePanel2(componentProps, forwardedRef) {
  const {
    className,
    hiddenUntilFound: hiddenUntilFoundProp,
    keepMounted: keepMountedProp,
    render: render4,
    id: idProp,
    style,
    ...elementProps
  } = componentProps;
  if (true) {
    React27.useEffect(() => {
      if (hiddenUntilFoundProp && keepMountedProp === false) {
        warn("The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.");
      }
    }, [hiddenUntilFoundProp, keepMountedProp]);
  }
  const {
    defaultPanelId,
    mounted,
    onOpenChange,
    open,
    setMounted,
    setPanelIdState,
    setOpen,
    state,
    transitionStatus
  } = useCollapsibleRootContext();
  const hiddenUntilFound = hiddenUntilFoundProp ?? false;
  const keepMounted = keepMountedProp ?? false;
  const registeredId = idProp || void 0;
  const id = registeredId ?? defaultPanelId;
  useIsoLayoutEffect(() => {
    setPanelIdState((currentId) => registeredId ?? (currentId === null ? void 0 : currentId));
    return () => {
      setPanelIdState((currentId) => currentId === registeredId ? null : currentId);
    };
  }, [registeredId, setPanelIdState]);
  const {
    height,
    props,
    ref,
    shouldPreventOpenAnimation,
    shouldRender,
    transitionStatus: panelTransitionStatus,
    width
  } = useCollapsiblePanel({
    externalRef: forwardedRef,
    hiddenUntilFound,
    id,
    keepMounted,
    mounted,
    onOpenChange,
    open,
    setMounted,
    setOpen,
    transitionStatus
  });
  const panelState = {
    ...state,
    transitionStatus: panelTransitionStatus
  };
  const resolvedStyle = resolveStyle(style, panelState);
  const element = useRenderElement("div", {
    ...componentProps,
    style: void 0
  }, {
    state: panelState,
    ref,
    props: [
      props,
      {
        style: {
          [CollapsiblePanelCssVars.collapsiblePanelHeight]: height === void 0 ? "auto" : `${height}px`,
          [CollapsiblePanelCssVars.collapsiblePanelWidth]: width === void 0 ? "auto" : `${width}px`
        }
      },
      elementProps,
      resolvedStyle ? {
        style: resolvedStyle
      } : void 0,
      // Resolve the public `style` prop so temporary `animationName: 'none'`
      // can still win after user's inline styles have been merged.
      shouldPreventOpenAnimation ? {
        style: {
          animationName: "none"
        }
      } : void 0
    ],
    stateAttributesMapping: collapsibleStateAttributesMapping
  });
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (true) CollapsiblePanel.displayName = "CollapsiblePanel";

// node_modules/@base-ui/react/utils/useRegisteredLabelId.mjs
function useRegisteredLabelId(idProp, setLabelId) {
  const id = useBaseUiId(idProp);
  useIsoLayoutEffect(() => {
    setLabelId(id);
    return () => {
      setLabelId((currentId) => currentId === id ? void 0 : currentId);
    };
  }, [id, setLabelId]);
  return id;
}

// node_modules/@base-ui/react/internals/labelable-provider/useLabel.mjs
function useLabel(params = {}) {
  const {
    id: idProp,
    fallbackControlId,
    native = false,
    setLabelId: setLabelIdProp,
    focusControl: focusControlProp
  } = params;
  const {
    controlId: contextControlId,
    setLabelId: setContextLabelId
  } = useLabelableContext();
  const syncLabelId = useStableCallback((nextLabelId) => {
    setContextLabelId(nextLabelId);
    setLabelIdProp?.(nextLabelId);
  });
  const id = useRegisteredLabelId(idProp, syncLabelId);
  const resolvedControlId = contextControlId ?? fallbackControlId;
  function focusControl(event) {
    if (focusControlProp) {
      focusControlProp(event, resolvedControlId);
      return;
    }
    if (!resolvedControlId) {
      return;
    }
    const controlElement = ownerDocument(event.currentTarget).getElementById(resolvedControlId);
    if (isHTMLElement(controlElement)) {
      focusElementWithVisible(controlElement);
    }
  }
  function handleInteraction(event) {
    const target = getTarget(event.nativeEvent);
    if (target?.closest("button,input,select,textarea")) {
      return;
    }
    if (!event.defaultPrevented && event.detail > 1) {
      event.preventDefault();
    }
    if (native) {
      return;
    }
    focusControl(event);
  }
  return native ? {
    id,
    htmlFor: resolvedControlId ?? void 0,
    onMouseDown: handleInteraction
  } : {
    id,
    onClick: handleInteraction,
    onPointerDown(event) {
      event.preventDefault();
    }
  };
}
function focusElementWithVisible(element) {
  element.focus({
    // Available from Chrome 144+ (January 2026).
    // Safari and Firefox already support it.
    focusVisible: true
  });
}

// node_modules/@base-ui/react/field/index.parts.mjs
var index_parts_exports2 = {};
__export(index_parts_exports2, {
  Control: () => FieldControl,
  Description: () => FieldDescription,
  Error: () => FieldError,
  Item: () => FieldItem,
  Label: () => FieldLabel,
  Root: () => FieldRoot,
  Validity: () => FieldValidity
});

// node_modules/@base-ui/react/field/root/FieldRoot.mjs
var React31 = __toESM(require_react(), 1);

// node_modules/@base-ui/react/fieldset/root/FieldsetRootContext.mjs
var React28 = __toESM(require_react(), 1);
var FieldsetRootContext = /* @__PURE__ */ React28.createContext(void 0);
if (true) FieldsetRootContext.displayName = "FieldsetRootContext";
function useFieldsetRootContext(optional = false) {
  const context = React28.useContext(FieldsetRootContext);
  if (!context && !optional) {
    throw new Error(true ? "Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>." : formatErrorMessage_default(86));
  }
  return context;
}

// node_modules/@base-ui/react/internals/labelable-provider/LabelableProvider.mjs
var React29 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var LabelableProvider = function LabelableProvider2(props) {
  const defaultId = useBaseUiId();
  const initialControlId = props.controlId === void 0 ? defaultId : props.controlId;
  const [controlId, setControlIdState] = React29.useState(initialControlId);
  const [labelId, setLabelId] = React29.useState(props.labelId);
  const [messageIds, setMessageIds] = React29.useState([]);
  const registrationsRef = useRefWithInit(() => /* @__PURE__ */ new Map());
  const {
    messageIds: parentMessageIds
  } = useLabelableContext();
  const registerControlId = useStableCallback((source, nextId) => {
    const registrations = registrationsRef.current;
    if (nextId === void 0) {
      registrations.delete(source);
      return;
    }
    registrations.set(source, nextId);
    setControlIdState((prev) => {
      if (registrations.size === 0) {
        return void 0;
      }
      let nextControlId;
      for (const id of registrations.values()) {
        if (prev !== void 0 && id === prev) {
          return prev;
        }
        if (nextControlId === void 0) {
          nextControlId = id;
        }
      }
      return nextControlId;
    });
  });
  const getDescriptionProps = React29.useCallback((externalProps) => {
    const ids = externalProps["aria-describedby"] ? externalProps["aria-describedby"].split(" ") : [];
    ids.push(...parentMessageIds, ...messageIds);
    return {
      ...externalProps,
      "aria-describedby": Array.from(new Set(ids)).join(" ") || void 0
    };
  }, [parentMessageIds, messageIds]);
  const contextValue = React29.useMemo(() => ({
    controlId,
    registerControlId,
    labelId,
    setLabelId,
    messageIds,
    setMessageIds,
    getDescriptionProps
  }), [controlId, registerControlId, labelId, setLabelId, messageIds, setMessageIds, getDescriptionProps]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LabelableContext.Provider, {
    value: contextValue,
    children: props.children
  });
};
if (true) LabelableProvider.displayName = "LabelableProvider";

// node_modules/@base-ui/react/internals/field-register-control/useFieldControlRegistration.mjs
var React30 = __toESM(require_react(), 1);
function useFieldControlRegistration(params) {
  const {
    commit,
    invalid,
    markedDirtyRef,
    name,
    setRegisteredFieldName,
    registeredFieldIdRef,
    setValidityData,
    validityData
  } = params;
  const {
    formRef
  } = useFormContext();
  const activeFieldControlSourceRef = React30.useRef(null);
  const registrationRef = React30.useRef(null);
  const initialValueCapturedRef = React30.useRef(false);
  const getValueForForm = useStableCallback(() => {
    const registration = registrationRef.current;
    if (!registration) {
      return void 0;
    }
    if (registration.getValue) {
      return registration.getValue();
    }
    return registration.value;
  });
  function getRegistrationValue(registration) {
    return registration.value === void 0 ? getValueForForm() : registration.value;
  }
  const validate = useStableCallback(() => {
    const registration = registrationRef.current;
    markedDirtyRef.current = true;
    if (!registration) {
      commit(validityData.value);
      return;
    }
    commit(getRegistrationValue(registration));
  });
  function refreshRegistration() {
    const registration = registrationRef.current;
    if (!registration || !registration.id) {
      return;
    }
    formRef.current.fields.set(registration.id, {
      getValue: getValueForForm,
      name: name ?? registration.name,
      controlRef: registration.controlRef,
      validityData: getCombinedFieldValidityData(validityData, invalid),
      validate
    });
  }
  function deleteRegistration(id = registrationRef.current?.id) {
    if (id) {
      formRef.current.fields.delete(id);
    }
  }
  function captureInitialValue(registration) {
    if (initialValueCapturedRef.current) {
      return;
    }
    initialValueCapturedRef.current = true;
    const initialValue = getRegistrationValue(registration);
    setValidityData((prev) => prev.initialValue === initialValue ? prev : {
      ...prev,
      initialValue
    });
  }
  useIsoLayoutEffect(() => {
    const registration = registrationRef.current;
    if (!registration || !registration.id) {
      return;
    }
    setRegisteredFieldName(name ? void 0 : registration.name);
    formRef.current.fields.set(registration.id, {
      getValue: getValueForForm,
      name: name ?? registration.name,
      controlRef: registration.controlRef,
      validityData: getCombinedFieldValidityData(validityData, invalid),
      validate
    });
  }, [formRef, getValueForForm, invalid, name, setRegisteredFieldName, validate, validityData]);
  useIsoLayoutEffect(() => {
    const fields = formRef.current.fields;
    return () => {
      const id = registrationRef.current?.id;
      if (id) {
        fields.delete(id);
      }
    };
  }, [formRef]);
  const register = useStableCallback((source, registration) => {
    if (!registration) {
      if (activeFieldControlSourceRef.current === source) {
        activeFieldControlSourceRef.current = null;
        deleteRegistration();
        registrationRef.current = null;
        setRegisteredFieldName(void 0);
        registeredFieldIdRef.current = void 0;
      }
      return;
    }
    const previousId = registrationRef.current?.id;
    activeFieldControlSourceRef.current = source;
    registrationRef.current = registration;
    if (!name) {
      setRegisteredFieldName(registration.name);
    }
    registeredFieldIdRef.current = registration.id;
    if (previousId && previousId !== registration.id) {
      deleteRegistration(previousId);
    }
    captureInitialValue(registration);
    refreshRegistration();
  });
  return [validate, register];
}

// node_modules/@base-ui/react/field/root/FieldRoot.mjs
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var FieldRootInner = /* @__PURE__ */ React31.forwardRef(function FieldRootInner2(componentProps, forwardedRef) {
  const {
    errors,
    validationMode: formValidationMode,
    submitAttemptedRef
  } = useFormContext();
  const {
    render: render4,
    className,
    validate: validateProp,
    validationDebounceTime = 0,
    validationMode = formValidationMode,
    name,
    disabled: disabledProp = false,
    invalid: invalidProp,
    dirty: dirtyProp,
    touched: touchedProp,
    actionsRef,
    style,
    ...elementProps
  } = componentProps;
  const disabledFieldset = useFieldsetRootContext(true)?.disabled;
  const validate = useStableCallback(validateProp || (() => null));
  const disabled2 = disabledFieldset || disabledProp;
  const [touchedState, setTouchedUnwrapped] = React31.useState(false);
  const [dirtyState, setDirtyUnwrapped] = React31.useState(false);
  const [filled, setFilled] = React31.useState(false);
  const [focused, setFocused] = React31.useState(false);
  const dirty = dirtyProp ?? dirtyState;
  const touched = touchedProp ?? touchedState;
  const markedDirtyRef = React31.useRef(dirty);
  const registeredFieldIdRef = React31.useRef(void 0);
  const [registeredFieldName, setRegisteredFieldName] = React31.useState();
  const effectiveName = name ?? registeredFieldName;
  useIsoLayoutEffect(() => {
    if (dirtyProp !== void 0) {
      markedDirtyRef.current = dirtyProp;
    }
  }, [dirtyProp]);
  const setDirty = useStableCallback((value) => {
    if (dirtyProp !== void 0) {
      return;
    }
    if (value) {
      markedDirtyRef.current = true;
    }
    setDirtyUnwrapped(value);
  });
  const setTouched = useStableCallback((value) => {
    if (touchedProp !== void 0) {
      return;
    }
    setTouchedUnwrapped(value);
  });
  const shouldValidateOnChange = useStableCallback(() => validationMode === "onChange" || validationMode === "onSubmit" && submitAttemptedRef.current);
  const formError = effectiveName && Object.hasOwn(errors, effectiveName) ? errors[effectiveName] : null;
  const hasFormError = !!(Array.isArray(formError) ? formError.length : formError);
  const invalid = invalidProp === true || hasFormError;
  const [validityData, setValidityData] = React31.useState({
    state: DEFAULT_VALIDITY_STATE,
    error: "",
    errors: [],
    value: null,
    initialValue: null
  });
  const valid = !invalid && (disabled2 ? null : validityData.state.valid);
  const state = React31.useMemo(() => ({
    disabled: disabled2,
    touched,
    dirty,
    valid,
    filled,
    focused
  }), [disabled2, touched, dirty, valid, filled, focused]);
  const validation = useFieldValidation({
    setValidityData,
    validate,
    validityData,
    validationDebounceTime,
    invalid,
    markedDirtyRef,
    state,
    shouldValidateOnChange,
    registeredFieldIdRef
  });
  const [validateFieldControl, registerFieldControl] = useFieldControlRegistration({
    commit: validation.commit,
    invalid,
    markedDirtyRef,
    name,
    setRegisteredFieldName,
    registeredFieldIdRef,
    setValidityData,
    validityData
  });
  React31.useImperativeHandle(actionsRef, () => ({
    validate: validateFieldControl
  }), [validateFieldControl]);
  const contextValue = React31.useMemo(() => ({
    invalid,
    name: effectiveName,
    validityData,
    setValidityData,
    disabled: disabled2,
    setTouched,
    setDirty,
    setFilled,
    setFocused,
    validationMode,
    shouldValidateOnChange,
    state,
    registerFieldControl,
    validation
  }), [invalid, effectiveName, validityData, disabled2, setTouched, setDirty, setFilled, setFocused, validationMode, shouldValidateOnChange, state, registerFieldControl, validation]);
  const element = useRenderElement("div", componentProps, {
    ref: forwardedRef,
    state,
    props: elementProps,
    stateAttributesMapping: fieldValidityMapping
  });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FieldRootContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (true) FieldRootInner.displayName = "FieldRootInner";
var FieldRoot = /* @__PURE__ */ React31.forwardRef(function FieldRoot2(componentProps, forwardedRef) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(LabelableProvider, {
    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FieldRootInner, {
      ...componentProps,
      ref: forwardedRef
    })
  });
});
if (true) FieldRoot.displayName = "FieldRoot";

// node_modules/@base-ui/react/field/label/FieldLabel.mjs
var React32 = __toESM(require_react(), 1);
var FieldLabel = /* @__PURE__ */ React32.forwardRef(function FieldLabel2(componentProps, forwardedRef) {
  const {
    render: render4,
    className,
    style,
    id: idProp,
    nativeLabel = true,
    ...elementProps
  } = componentProps;
  const fieldRootContext = useFieldRootContext(false);
  const fieldItemContext = useFieldItemContext();
  const {
    labelId
  } = useLabelableContext();
  const state = {
    ...fieldRootContext.state,
    disabled: fieldRootContext.disabled || fieldItemContext.disabled
  };
  const labelRef = React32.useRef(null);
  const labelProps = useLabel({
    id: labelId ?? idProp,
    native: nativeLabel
  });
  if (true) {
    React32.useEffect(() => {
      if (!labelRef.current) {
        return;
      }
      const isLabelTag = labelRef.current.tagName === "LABEL";
      if (nativeLabel) {
        if (!isLabelTag) {
          const ownerStackMessage = SafeReact.captureOwnerStack?.() || "";
          const message2 = "<Field.Label> expected a <label> element because the `nativeLabel` prop is true. Rendering a non-<label> disables native label association, so `htmlFor` will not work. Use a real <label> in the `render` prop, or set `nativeLabel` to `false`.";
          error(`${message2}${ownerStackMessage}`);
        }
      } else if (isLabelTag) {
        const ownerStackMessage = SafeReact.captureOwnerStack?.() || "";
        const message2 = "<Field.Label> expected a non-<label> element because the `nativeLabel` prop is false. Rendering a <label> assumes native label behavior while Base UI treats it as non-native, which can cause unexpected pointer behavior. Use a non-<label> in the `render` prop, or set `nativeLabel` to `true`.";
        error(`${message2}${ownerStackMessage}`);
      }
    }, [nativeLabel]);
  }
  const element = useRenderElement("label", componentProps, {
    ref: [forwardedRef, labelRef],
    state,
    props: [labelProps, elementProps],
    stateAttributesMapping: fieldValidityMapping
  });
  return element;
});
if (true) FieldLabel.displayName = "FieldLabel";

// node_modules/@base-ui/react/field/error/FieldError.mjs
var React33 = __toESM(require_react(), 1);
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var stateAttributesMapping2 = {
  ...fieldValidityMapping,
  ...transitionStatusMapping
};
var FieldError = /* @__PURE__ */ React33.forwardRef(function FieldError2(componentProps, forwardedRef) {
  const {
    render: render4,
    id: idProp,
    className,
    match: match2,
    style,
    ...elementProps
  } = componentProps;
  const id = useBaseUiId(idProp);
  const {
    validityData,
    state: fieldState,
    name
  } = useFieldRootContext(false);
  const {
    setMessageIds
  } = useLabelableContext();
  const {
    errors
  } = useFormContext();
  const formError = name && Object.hasOwn(errors, name) ? errors[name] : null;
  const hasFormError = !!(Array.isArray(formError) ? formError.length : formError);
  const hasSpecificMatch = typeof match2 === "string";
  let rendered = false;
  if (match2 === true) {
    rendered = true;
  } else if (fieldState.disabled) {
    rendered = false;
  } else if (hasSpecificMatch) {
    rendered = Boolean(validityData.state[match2]);
  } else {
    rendered = hasFormError || validityData.state.valid === false;
  }
  const {
    mounted,
    transitionStatus,
    setMounted
  } = useTransitionStatus(rendered);
  useIsoLayoutEffect(() => {
    if (!rendered || !id) {
      return void 0;
    }
    setMessageIds((v2) => v2.concat(id));
    return () => {
      setMessageIds((v2) => v2.filter((item) => item !== id));
    };
  }, [rendered, id, setMessageIds]);
  const errorRef = React33.useRef(null);
  const [lastRenderedMessage, setLastRenderedMessage] = React33.useState(null);
  const [lastRenderedMessageKey, setLastRenderedMessageKey] = React33.useState(null);
  let error2 = validityData.error;
  if (!hasSpecificMatch && hasFormError) {
    error2 = formError;
  } else if (validityData.errors.length > 1) {
    error2 = validityData.errors;
  }
  let errorMessage = error2;
  if (Array.isArray(error2)) {
    errorMessage = error2.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ul", {
      children: error2.map((message2) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("li", {
        children: message2
      }, message2))
    }) : error2[0];
  }
  const errorKey = Array.isArray(error2) ? JSON.stringify(error2) : error2;
  if (rendered && errorKey !== lastRenderedMessageKey) {
    setLastRenderedMessageKey(errorKey);
    setLastRenderedMessage(errorMessage);
  }
  useOpenChangeComplete({
    open: rendered,
    ref: errorRef,
    onComplete() {
      if (!rendered) {
        setMounted(false);
      }
    }
  });
  const state = {
    ...fieldState,
    transitionStatus
  };
  const element = useRenderElement("div", componentProps, {
    ref: [forwardedRef, errorRef],
    state,
    props: [{
      id,
      children: rendered ? errorMessage : lastRenderedMessage
    }, elementProps],
    stateAttributesMapping: stateAttributesMapping2,
    enabled: mounted
  });
  if (!mounted) {
    return null;
  }
  return element;
});
if (true) FieldError.displayName = "FieldError";

// node_modules/@base-ui/react/field/description/FieldDescription.mjs
var React34 = __toESM(require_react(), 1);
var FieldDescription = /* @__PURE__ */ React34.forwardRef(function FieldDescription2(componentProps, forwardedRef) {
  const {
    render: render4,
    id: idProp,
    className,
    style,
    ...elementProps
  } = componentProps;
  const id = useBaseUiId(idProp);
  const fieldRootContext = useFieldRootContext(false);
  const fieldItemContext = useFieldItemContext();
  const {
    setMessageIds
  } = useLabelableContext();
  const state = {
    ...fieldRootContext.state,
    disabled: fieldRootContext.disabled || fieldItemContext.disabled
  };
  useIsoLayoutEffect(() => {
    if (!id) {
      return void 0;
    }
    setMessageIds((v2) => v2.concat(id));
    return () => {
      setMessageIds((v2) => v2.filter((item) => item !== id));
    };
  }, [id, setMessageIds]);
  const element = useRenderElement("p", componentProps, {
    ref: forwardedRef,
    state,
    props: [{
      id
    }, elementProps],
    stateAttributesMapping: fieldValidityMapping
  });
  return element;
});
if (true) FieldDescription.displayName = "FieldDescription";

// node_modules/@base-ui/react/field/control/FieldControl.mjs
var React35 = __toESM(require_react(), 1);
var FieldControl = /* @__PURE__ */ React35.forwardRef(function FieldControl2(componentProps, forwardedRef) {
  const {
    render: render4,
    className,
    id: idProp,
    name: nameProp,
    value: valueProp,
    disabled: disabledProp = false,
    onValueChange,
    defaultValue,
    autoFocus = false,
    style,
    ...elementProps
  } = componentProps;
  const {
    state: fieldState,
    name: fieldName,
    disabled: fieldDisabled,
    setTouched,
    setDirty,
    validityData,
    setFocused,
    setFilled,
    validationMode,
    validation
  } = useFieldRootContext();
  const {
    clearErrors
  } = useFormContext();
  const disabled2 = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const state = {
    ...fieldState,
    disabled: disabled2
  };
  const {
    labelId
  } = useLabelableContext();
  const id = useLabelableId({
    id: idProp
  });
  useIsoLayoutEffect(() => {
    const hasExternalValue = valueProp != null;
    if (validation.inputRef.current?.value || hasExternalValue && valueProp !== "") {
      setFilled(true);
    } else if (hasExternalValue && valueProp === "") {
      setFilled(false);
    }
  }, [validation.inputRef, setFilled, valueProp]);
  const inputRef = React35.useRef(null);
  useIsoLayoutEffect(() => {
    if (autoFocus && inputRef.current === activeElement(ownerDocument(inputRef.current))) {
      setFocused(true);
    }
  }, [autoFocus, setFocused]);
  const [valueUnwrapped] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "FieldControl",
    state: "value"
  });
  const isControlled = valueProp !== void 0;
  const value = isControlled ? valueUnwrapped : void 0;
  const getValueFromInput = useStableCallback(() => validation.inputRef.current?.value);
  useRegisterFieldControl(validation.inputRef, id, value, getValueFromInput, !disabled2, nameProp);
  const element = useRenderElement("input", componentProps, {
    ref: [forwardedRef, inputRef],
    state,
    props: [{
      id,
      disabled: disabled2,
      name,
      ref: validation.inputRef,
      "aria-labelledby": labelId,
      autoFocus,
      ...isControlled ? {
        value
      } : {
        defaultValue
      },
      onChange(event) {
        const inputValue = event.currentTarget.value;
        onValueChange?.(inputValue, createChangeEventDetails(reason_parts_exports.none, event.nativeEvent));
        setDirty(inputValue !== (validityData.initialValue ?? ""));
        setFilled(inputValue !== "");
        if (!event.nativeEvent.defaultPrevented) {
          clearErrors(name);
          validation.change(inputValue);
        }
      },
      onFocus() {
        setFocused(true);
      },
      onBlur(event) {
        setTouched(true);
        setFocused(false);
        if (validationMode === "onBlur") {
          validation.commit(event.currentTarget.value);
        }
      },
      onKeyDown(event) {
        if (event.currentTarget.tagName === "INPUT" && event.key === "Enter") {
          setTouched(true);
          validation.commit(event.currentTarget.value);
        }
      }
    }, elementProps, (props) => validation.getValidationProps(disabled2, props)],
    stateAttributesMapping: fieldValidityMapping
  });
  return element;
});
if (true) FieldControl.displayName = "FieldControl";

// node_modules/@base-ui/react/field/validity/FieldValidity.mjs
var React36 = __toESM(require_react(), 1);
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var FieldValidity = function FieldValidity2(props) {
  const {
    children
  } = props;
  const {
    validityData,
    invalid
  } = useFieldRootContext(false);
  const combinedFieldValidityData = React36.useMemo(() => getCombinedFieldValidityData(validityData, invalid), [validityData, invalid]);
  const isInvalid = combinedFieldValidityData.state.valid === false;
  const {
    transitionStatus
  } = useTransitionStatus(isInvalid);
  const fieldValidityState = React36.useMemo(() => {
    return {
      ...combinedFieldValidityData,
      validity: combinedFieldValidityData.state,
      transitionStatus
    };
  }, [combinedFieldValidityData, transitionStatus]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(React36.Fragment, {
    children: children(fieldValidityState)
  });
};
if (true) FieldValidity.displayName = "FieldValidity";

// node_modules/@base-ui/react/field/item/FieldItem.mjs
var React37 = __toESM(require_react(), 1);
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var FieldItem = /* @__PURE__ */ React37.forwardRef(function FieldItem2(componentProps, forwardedRef) {
  const {
    render: render4,
    className,
    style,
    disabled: disabledProp = false,
    ...elementProps
  } = componentProps;
  const {
    state: fieldState,
    disabled: rootDisabled
  } = useFieldRootContext(false);
  const disabled2 = rootDisabled || disabledProp;
  const state = {
    ...fieldState,
    disabled: disabled2
  };
  const fieldItemContext = React37.useMemo(() => ({
    disabled: disabled2
  }), [disabled2]);
  const element = useRenderElement("div", componentProps, {
    ref: forwardedRef,
    state,
    props: elementProps,
    stateAttributesMapping: fieldValidityMapping
  });
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(LabelableProvider, {
    children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(FieldItemContext.Provider, {
      value: fieldItemContext,
      children: element
    })
  });
});
if (true) FieldItem.displayName = "FieldItem";

// node_modules/@base-ui/react/input/Input.mjs
var React38 = __toESM(require_react(), 1);
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var Input = /* @__PURE__ */ React38.forwardRef(function Input2(props, forwardedRef) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(index_parts_exports2.Control, {
    ref: forwardedRef,
    ...props
  });
});
if (true) Input.displayName = "Input";

// node_modules/@base-ui/react/use-render/useRender.mjs
function useRender(params) {
  return useRenderElement(params.defaultTagName ?? "div", params, params);
}

// packages/ui/build-module/text/text.mjs
var import_element = __toESM(require_element(), 1);
var STYLE_HASH_ATTRIBUTE = "data-wp-hash";
function getRuntime() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument(targetDocument) {
  const runtime = getRuntime();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle(hash, css) {
  const runtime = getRuntime();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle("a495f9d138", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._83ed8a8da5dd50ea__text{margin:0}._14437cfb77831647__heading-2xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-2xl,32px);--_gcd-p-line-height:var(--wpds-typography-line-height-2xl,40px);font-size:var(--wpds-typography-font-size-2xl,32px);line-height:var(--wpds-typography-line-height-2xl,40px)}._14437cfb77831647__heading-2xl,._3c78b7fa9b4072dd__heading-xl{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600)}._3c78b7fa9b4072dd__heading-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-md,24px)}.aa58f227716bcde2__heading-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-lg,15px)}.aa58f227716bcde2__heading-lg,.fc4da56d8dfe52c4__heading-md{font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-sm,20px)}.fc4da56d8dfe52c4__heading-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px)}.a9b78c7c82e8dff7__heading-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-emphasis,600);--_gcd-p-font-size:var(--wpds-typography-font-size-xs,11px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-family:var(--wpds-typography-font-family-heading,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wpds-typography-line-height-xs,16px);text-transform:uppercase}._305ff559e52180d5__body-xl{--_gcd-heading-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-xl,20px);--_gcd-p-line-height:var(--wpds-typography-line-height-xl,32px);font-size:var(--wpds-typography-font-size-xl,20px);line-height:var(--wpds-typography-line-height-xl,32px)}._305ff559e52180d5__body-xl,.ca1aa3fc2029e958__body-lg{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}.ca1aa3fc2029e958__body-lg{--_gcd-heading-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-lg,15px);--_gcd-p-line-height:var(--wpds-typography-line-height-md,24px);font-size:var(--wpds-typography-font-size-lg,15px);line-height:var(--wpds-typography-line-height-md,24px)}._131101940be12424__body-md{--_gcd-heading-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-md,13px);--_gcd-p-line-height:var(--wpds-typography-line-height-sm,20px);font-size:var(--wpds-typography-font-size-md,13px);line-height:var(--wpds-typography-line-height-sm,20px)}._0e8d87a42c1f75fa__body-sm,._131101940be12424__body-md{font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-weight:var(--wpds-typography-font-weight-default,400)}._0e8d87a42c1f75fa__body-sm{--_gcd-heading-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-heading-font-weight:var(--wpds-typography-font-weight-default,400);--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}');
}
var style_default = { "text": "_83ed8a8da5dd50ea__text", "heading-2xl": "_14437cfb77831647__heading-2xl", "heading-xl": "_3c78b7fa9b4072dd__heading-xl", "heading-lg": "aa58f227716bcde2__heading-lg", "heading-md": "fc4da56d8dfe52c4__heading-md", "heading-sm": "a9b78c7c82e8dff7__heading-sm", "body-xl": "_305ff559e52180d5__body-xl", "body-lg": "ca1aa3fc2029e958__body-lg", "body-md": "_131101940be12424__body-md", "body-sm": "_0e8d87a42c1f75fa__body-sm" };
if (typeof process === "undefined" || true) {
  registerStyle("af6d9984a6", "._6defc79820e382c6__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}.d2cff2e5dea83bd1__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._547d86373d02e108__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._8c15fd0ed9f28ba4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._43cec3e1eec1066d__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6).e97669c6d9a38497__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}._2c0831b0499dbd6e__a,._2c0831b0499dbd6e__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}");
}
var global_css_defense_default = { "button": "_6defc79820e382c6__button", "input": "d2cff2e5dea83bd1__input", "textarea": "_547d86373d02e108__textarea", "div": "_8c15fd0ed9f28ba4__div", "p": "_43cec3e1eec1066d__p", "heading": "e97669c6d9a38497__heading", "a": "_2c0831b0499dbd6e__a" };
var Text = (0, import_element.forwardRef)(function Text2({ variant = "body-md", render: render4, className, ...props }, ref) {
  const element = useRender({
    render: render4,
    defaultTagName: "span",
    ref,
    props: mergeProps(props, {
      className: clsx_default(
        style_default.text,
        global_css_defense_default.heading,
        global_css_defense_default.p,
        style_default[variant],
        className
      )
    })
  });
  return element;
});

// packages/ui/build-module/badge/badge.mjs
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE2 = "data-wp-hash";
function getRuntime2() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument2(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash2(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE2}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE2) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle2(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime2();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash2(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE2, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument2(targetDocument) {
  const runtime = getRuntime2();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle2(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle2(hash, css) {
  const runtime = getRuntime2();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle2(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle2("9db2873e7f", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._96e6251aad1a6136__badge{border-radius:var(--wpds-border-radius-lg,8px);padding-block:var(--wpds-dimension-padding-xs,4px);padding-inline:var(--wpds-dimension-padding-sm,8px)}._99f7158cb520f750__is-high-intent{background-color:var(--wpds-color-background-surface-error,#f6e6e3);color:var(--wpds-color-foreground-content-error,#470000)}.c20ebef2365bc8b7__is-medium-intent{background-color:var(--wpds-color-background-surface-warning,#fde6be);color:var(--wpds-color-foreground-content-warning,#2e1900)}._365e1626c6202e52__is-low-intent{background-color:var(--wpds-color-background-surface-caution,#fee995);color:var(--wpds-color-foreground-content-caution,#281d00)}._33f8198127ddf4ef__is-stable-intent{background-color:var(--wpds-color-background-surface-success,#c6f7cd);color:var(--wpds-color-foreground-content-success,#002900)}._04c1aca8fc449412__is-informational-intent{background-color:var(--wpds-color-background-surface-info,#deebfa);color:var(--wpds-color-foreground-content-info,#001b4f)}._90726e69d495ec19__is-draft-intent{background-color:var(--wpds-color-background-surface-neutral-weak,#f4f4f4);color:var(--wpds-color-foreground-content-neutral,#1e1e1e)}._898f4a544993bd39__is-none-intent{background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);padding-block:calc(var(--wpds-dimension-padding-xs, 4px) - var(--wpds-border-width-xs, 1px));padding-inline:calc(var(--wpds-dimension-padding-sm, 8px) - var(--wpds-border-width-xs, 1px))}}}");
}
var style_default2 = { "badge": "_96e6251aad1a6136__badge", "is-high-intent": "_99f7158cb520f750__is-high-intent", "is-medium-intent": "c20ebef2365bc8b7__is-medium-intent", "is-low-intent": "_365e1626c6202e52__is-low-intent", "is-stable-intent": "_33f8198127ddf4ef__is-stable-intent", "is-informational-intent": "_04c1aca8fc449412__is-informational-intent", "is-draft-intent": "_90726e69d495ec19__is-draft-intent", "is-none-intent": "_898f4a544993bd39__is-none-intent" };
var Badge = (0, import_element2.forwardRef)(function Badge2({ intent = "none", className, ...props }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    Text,
    {
      ref,
      className: clsx_default(
        style_default2.badge,
        style_default2[`is-${intent}-intent`],
        className
      ),
      ...props,
      variant: "body-sm"
    }
  );
});

// packages/ui/build-module/button/button.mjs
var import_element3 = __toESM(require_element(), 1);
var import_i18n = __toESM(require_i18n(), 1);
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
import { speak } from "@wordpress/a11y";
var STYLE_HASH_ATTRIBUTE3 = "data-wp-hash";
function getRuntime3() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument3(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash3(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE3}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE3) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle3(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime3();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash3(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE3, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument3(targetDocument) {
  const runtime = getRuntime3();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle3(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle3(hash, css) {
  const runtime = getRuntime3();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle3(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle3("effc4e3032", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._97b0fc33c028be1a__button,.abbb272e2ce49bd6__is-unstyled{appearance:none;padding:0}._97b0fc33c028be1a__button{--wp-ui-button-font-weight:var(--wpds-typography-font-weight-emphasis,600);--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-strong,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand-strong,#fff);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-strong-disabled,#8d8d8d);--wp-ui-button-padding-block:var(--wpds-dimension-padding-xs,4px);--wp-ui-button-padding-inline:var(--wpds-dimension-padding-md,12px);--wp-ui-button-height:var(--wpds-dimension-size-lg,40px);--wp-ui-button-aspect-ratio:auto;--wp-ui-button-font-size:var(--wpds-typography-font-size-md,13px);--wp-ui-button-min-width:calc(4ch + var(--wp-ui-button-padding-inline)*2);--wp-ui-button-icon-margin:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2);--wp-ui-button-border-color:var(--wp-ui-button-background-color);--wp-ui-button-border-color-active:var(--wp-ui-button-background-color-active);--wp-ui-button-border-color-disabled:var(--wp-ui-button-background-color-disabled);--_gcd-button-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);--_gcd-button-font-size:var(--wp-ui-button-font-size);--_gcd-button-font-weight:var(--wp-ui-button-font-weight);align-items:center;aspect-ratio:var(--wp-ui-button-aspect-ratio);background-clip:border-box;background-color:var(--wp-ui-button-background-color);border-color:var(--wp-ui-button-border-color);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:1px;color:var(--wp-ui-button-foreground-color);display:inline-flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wp-ui-button-font-size);font-weight:var(--wp-ui-button-font-weight);gap:var(--wpds-dimension-gap-sm,8px);justify-content:center;line-height:var(--wpds-typography-line-height-sm,20px);max-width:100%;min-height:var(--wp-ui-button-height);min-width:var(--wp-ui-button-min-width);overflow-wrap:anywhere;padding-block:var(--wp-ui-button-padding-block);padding-inline:var(--wp-ui-button-padding-inline);position:relative;text-align:center;text-decoration:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}@media not (prefers-reduced-motion){transition:color .1s ease-out;*{transition:opacity .1s ease-out}}&[href]{cursor:pointer}[href]{color:inherit;text-decoration:inherit}&:not([data-disabled]):is(:hover,:active,:focus){background-color:var(--wp-ui-button-background-color-active);border-color:var(--wp-ui-button-border-color-active);color:var(--wp-ui-button-foreground-color-active)}&[data-disabled]:not(._914b42f315c0e580__is-loading){background-color:var(--wp-ui-button-background-color-disabled);border-color:var(--wp-ui-button-border-color-disabled);color:var(--wp-ui-button-foreground-color-disabled);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText;color:GrayText}}&:before{aspect-ratio:1;border:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid;border-block-end-color:transparent;border-block-start-color:var(--wp-ui-button-foreground-color);border-inline-end-color:var(--wp-ui-button-foreground-color);border-inline-start-color:transparent;border-radius:50%;box-sizing:border-box;content:"";display:block;height:var(--wp-ui-button-font-size);left:50%;opacity:0;pointer-events:none;position:absolute;top:50%;transform:translate(-50%,-50%);@media not (prefers-reduced-motion){transition:opacity .1s ease-out}@media (forced-colors:active){border-block-end-style:none;border-bottom-color:ButtonText;border-inline-start-style:none;border-left-color:ButtonText;border-right-color:ButtonText;border-top-color:ButtonText}}}._908205475f9f2a92__is-small{--wp-ui-button-padding-block:0px;--wp-ui-button-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-button-height:var(--wpds-dimension-size-sm,24px)}._9f6fc6553aeb36fe__icon{margin:var(--wp-ui-button-icon-margin)}.dd460c965226cc77__is-brand{&._62d5a778b7b258ee__is-outline,&.ad0619a3217c6a5b__is-minimal{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-disabled,#8d8d8d)}&._62d5a778b7b258ee__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 85%,#000));--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-brand-disabled,#dbdbdb)}&.ad0619a3217c6a5b__is-minimal{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000)}}.e722a8f96726aa99__is-neutral{&.ad0619a3217c6a5b__is-minimal[aria-pressed=true],&.b50b3358c5fb4d0b__is-solid{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-strong,#2d2d2d);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-strong-active,#1e1e1e);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral-strong,#f0f0f0);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-strong-active,#f0f0f0);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-strong-disabled,#8d8d8d)}&._62d5a778b7b258ee__is-outline,&.ad0619a3217c6a5b__is-minimal:not([aria-pressed=true]){--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}&._62d5a778b7b258ee__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e);--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb)}&.ad0619a3217c6a5b__is-minimal:not([aria-pressed=true]){--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000)}}.abbb272e2ce49bd6__is-unstyled{background:none;border:none;min-width:unset}.cf59cf1b69629838__is-compact{--wp-ui-button-height:var(--wpds-dimension-size-md,32px)}._914b42f315c0e580__is-loading:not(.abbb272e2ce49bd6__is-unstyled){color:transparent;&:not([data-disabled]):is(:hover,:active,:focus){color:transparent}@media (forced-colors:active){color:ButtonFace}*{opacity:0}&:before{opacity:1;transition-delay:.05s;@media not (prefers-reduced-motion){animation:_5a1d53da6f830c8d__loading-animation 1s linear infinite}}}}@keyframes _5a1d53da6f830c8d__loading-animation{0%{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(1turn)}}}');
}
var style_default3 = { "button": "_97b0fc33c028be1a__button", "is-unstyled": "abbb272e2ce49bd6__is-unstyled", "is-loading": "_914b42f315c0e580__is-loading", "is-small": "_908205475f9f2a92__is-small", "icon": "_9f6fc6553aeb36fe__icon", "is-brand": "dd460c965226cc77__is-brand", "is-outline": "_62d5a778b7b258ee__is-outline", "is-minimal": "ad0619a3217c6a5b__is-minimal", "is-neutral": "e722a8f96726aa99__is-neutral", "is-solid": "b50b3358c5fb4d0b__is-solid", "is-compact": "cf59cf1b69629838__is-compact", "loading-animation": "_5a1d53da6f830c8d__loading-animation" };
if (typeof process === "undefined" || true) {
  registerStyle3("10f3806643", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._336cd3e4e743482f__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
}
var resets_default = { "box-sizing": "_336cd3e4e743482f__box-sizing" };
if (typeof process === "undefined" || true) {
  registerStyle3("96553466c8", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._64de9947bf305b7a__outset-ring--focus-within-visible:focus-within:has(:focus-visible),.af79fb116edb0dd7__outset-ring--focus:focus,.dfcfdc28396e5d98__outset-ring--focus-visible:focus-visible,.e5cd9ee879f6403a__outset-ring--focus-within:focus-within,:focus-visible ._81935a08e952f267__outset-ring--focus-parent-visible{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within,.abc777e9713fa711__outset-ring--focus-except-active:focus{outline:none}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.abc777e9713fa711__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
}
var focus_module_default = { "outset-ring--focus": "af79fb116edb0dd7__outset-ring--focus", "outset-ring--focus-visible": "dfcfdc28396e5d98__outset-ring--focus-visible", "outset-ring--focus-within": "e5cd9ee879f6403a__outset-ring--focus-within", "outset-ring--focus-within-visible": "_64de9947bf305b7a__outset-ring--focus-within-visible", "outset-ring--focus-parent-visible": "_81935a08e952f267__outset-ring--focus-parent-visible", "outset-ring--focus-except-active": "abc777e9713fa711__outset-ring--focus-except-active", "outset-ring--focus-within-except-active": "_3c9f5ee9fc9c136d__outset-ring--focus-within-except-active" };
if (typeof process === "undefined" || true) {
  registerStyle3("af6d9984a6", "._6defc79820e382c6__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}.d2cff2e5dea83bd1__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._547d86373d02e108__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._8c15fd0ed9f28ba4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._43cec3e1eec1066d__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6).e97669c6d9a38497__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}._2c0831b0499dbd6e__a,._2c0831b0499dbd6e__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}");
}
var global_css_defense_default2 = { "button": "_6defc79820e382c6__button", "input": "d2cff2e5dea83bd1__input", "textarea": "_547d86373d02e108__textarea", "div": "_8c15fd0ed9f28ba4__div", "p": "_43cec3e1eec1066d__p", "heading": "e97669c6d9a38497__heading", "a": "_2c0831b0499dbd6e__a" };
var Button3 = (0, import_element3.forwardRef)(
  function Button22({
    tone = "brand",
    variant = "solid",
    size = "default",
    className,
    focusableWhenDisabled = true,
    disabled: disabled2,
    loading,
    loadingAnnouncement = (0, import_i18n.__)("Loading"),
    children,
    ...props
  }, ref) {
    const mergedClassName = clsx_default(
      global_css_defense_default2.button,
      resets_default["box-sizing"],
      focus_module_default["outset-ring--focus-except-active"],
      variant !== "unstyled" && style_default3.button,
      style_default3[`is-${tone}`],
      style_default3[`is-${variant}`],
      style_default3[`is-${size}`],
      loading && style_default3["is-loading"],
      className
    );
    (0, import_element3.useEffect)(() => {
      if (loading && loadingAnnouncement) {
        speak(loadingAnnouncement);
      }
    }, [loading, loadingAnnouncement]);
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      Button,
      {
        ref,
        className: mergedClassName,
        focusableWhenDisabled,
        disabled: disabled2 ?? loading,
        ...props,
        children
      }
    );
  }
);

// packages/ui/build-module/button/icon.mjs
var import_element5 = __toESM(require_element(), 1);

// packages/ui/build-module/icon/icon.mjs
var import_element4 = __toESM(require_element(), 1);
var import_primitives = __toESM(require_primitives(), 1);
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
var Icon = (0, import_element4.forwardRef)(function Icon2({ icon, size = 24, ...restProps }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    import_primitives.SVG,
    {
      ref,
      ...icon.props,
      ...restProps,
      width: size,
      height: size
    }
  );
});

// packages/ui/build-module/button/icon.mjs
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE4 = "data-wp-hash";
function getRuntime4() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument4(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash4(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE4}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE4) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle4(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime4();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash4(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE4, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument4(targetDocument) {
  const runtime = getRuntime4();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle4(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle4(hash, css) {
  const runtime = getRuntime4();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle4(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle4("effc4e3032", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._97b0fc33c028be1a__button,.abbb272e2ce49bd6__is-unstyled{appearance:none;padding:0}._97b0fc33c028be1a__button{--wp-ui-button-font-weight:var(--wpds-typography-font-weight-emphasis,600);--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-strong,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-strong-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 93%,#000));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand-strong,#fff);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-strong-active,#fff);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-strong-disabled,#8d8d8d);--wp-ui-button-padding-block:var(--wpds-dimension-padding-xs,4px);--wp-ui-button-padding-inline:var(--wpds-dimension-padding-md,12px);--wp-ui-button-height:var(--wpds-dimension-size-lg,40px);--wp-ui-button-aspect-ratio:auto;--wp-ui-button-font-size:var(--wpds-typography-font-size-md,13px);--wp-ui-button-min-width:calc(4ch + var(--wp-ui-button-padding-inline)*2);--wp-ui-button-icon-margin:calc((var(--wpds-dimension-size-2xs, 16px) - var(--wpds-dimension-size-sm, 24px))/2);--wp-ui-button-border-color:var(--wp-ui-button-background-color);--wp-ui-button-border-color-active:var(--wp-ui-button-background-color-active);--wp-ui-button-border-color-disabled:var(--wp-ui-button-background-color-disabled);--_gcd-button-font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);--_gcd-button-font-size:var(--wp-ui-button-font-size);--_gcd-button-font-weight:var(--wp-ui-button-font-weight);align-items:center;aspect-ratio:var(--wp-ui-button-aspect-ratio);background-clip:border-box;background-color:var(--wp-ui-button-background-color);border-color:var(--wp-ui-button-border-color);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:1px;color:var(--wp-ui-button-foreground-color);display:inline-flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wp-ui-button-font-size);font-weight:var(--wp-ui-button-font-weight);gap:var(--wpds-dimension-gap-sm,8px);justify-content:center;line-height:var(--wpds-typography-line-height-sm,20px);max-width:100%;min-height:var(--wp-ui-button-height);min-width:var(--wp-ui-button-min-width);overflow-wrap:anywhere;padding-block:var(--wp-ui-button-padding-block);padding-inline:var(--wp-ui-button-padding-inline);position:relative;text-align:center;text-decoration:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}@media not (prefers-reduced-motion){transition:color .1s ease-out;*{transition:opacity .1s ease-out}}&[href]{cursor:pointer}[href]{color:inherit;text-decoration:inherit}&:not([data-disabled]):is(:hover,:active,:focus){background-color:var(--wp-ui-button-background-color-active);border-color:var(--wp-ui-button-border-color-active);color:var(--wp-ui-button-foreground-color-active)}&[data-disabled]:not(._914b42f315c0e580__is-loading){background-color:var(--wp-ui-button-background-color-disabled);border-color:var(--wp-ui-button-border-color-disabled);color:var(--wp-ui-button-foreground-color-disabled);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText;color:GrayText}}&:before{aspect-ratio:1;border:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid;border-block-end-color:transparent;border-block-start-color:var(--wp-ui-button-foreground-color);border-inline-end-color:var(--wp-ui-button-foreground-color);border-inline-start-color:transparent;border-radius:50%;box-sizing:border-box;content:"";display:block;height:var(--wp-ui-button-font-size);left:50%;opacity:0;pointer-events:none;position:absolute;top:50%;transform:translate(-50%,-50%);@media not (prefers-reduced-motion){transition:opacity .1s ease-out}@media (forced-colors:active){border-block-end-style:none;border-bottom-color:ButtonText;border-inline-start-style:none;border-left-color:ButtonText;border-right-color:ButtonText;border-top-color:ButtonText}}}._908205475f9f2a92__is-small{--wp-ui-button-padding-block:0px;--wp-ui-button-padding-inline:var(--wpds-dimension-padding-sm,8px);--wp-ui-button-height:var(--wpds-dimension-size-sm,24px)}._9f6fc6553aeb36fe__icon{margin:var(--wp-ui-button-icon-margin)}.dd460c965226cc77__is-brand{&._62d5a778b7b258ee__is-outline,&.ad0619a3217c6a5b__is-minimal{--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-brand-disabled,#8d8d8d)}&._62d5a778b7b258ee__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-brand,var(--wp-admin-theme-color,#3858e9));--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 85%,#000));--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-brand-disabled,#dbdbdb)}&.ad0619a3217c6a5b__is-minimal{--wp-ui-button-background-color:var(--wpds-color-background-interactive-brand-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-brand-weak-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 12%,#fff));--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-brand-weak-disabled,#0000)}}.e722a8f96726aa99__is-neutral{&.ad0619a3217c6a5b__is-minimal[aria-pressed=true],&.b50b3358c5fb4d0b__is-solid{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-strong,#2d2d2d);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-strong-active,#1e1e1e);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-strong-disabled,#e6e6e6);--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral-strong,#f0f0f0);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-strong-active,#f0f0f0);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-strong-disabled,#8d8d8d)}&._62d5a778b7b258ee__is-outline,&.ad0619a3217c6a5b__is-minimal:not([aria-pressed=true]){--wp-ui-button-foreground-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);--wp-ui-button-foreground-color-active:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);--wp-ui-button-foreground-color-disabled:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}&._62d5a778b7b258ee__is-outline{--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);--wp-ui-button-border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);--wp-ui-button-border-color-active:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e);--wp-ui-button-border-color-disabled:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb)}&.ad0619a3217c6a5b__is-minimal:not([aria-pressed=true]){--wp-ui-button-background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);--wp-ui-button-background-color-active:var(--wpds-color-background-interactive-neutral-weak-active,#ededed);--wp-ui-button-background-color-disabled:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000)}}.abbb272e2ce49bd6__is-unstyled{background:none;border:none;min-width:unset}.cf59cf1b69629838__is-compact{--wp-ui-button-height:var(--wpds-dimension-size-md,32px)}._914b42f315c0e580__is-loading:not(.abbb272e2ce49bd6__is-unstyled){color:transparent;&:not([data-disabled]):is(:hover,:active,:focus){color:transparent}@media (forced-colors:active){color:ButtonFace}*{opacity:0}&:before{opacity:1;transition-delay:.05s;@media not (prefers-reduced-motion){animation:_5a1d53da6f830c8d__loading-animation 1s linear infinite}}}}@keyframes _5a1d53da6f830c8d__loading-animation{0%{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(1turn)}}}');
}
var style_default4 = { "button": "_97b0fc33c028be1a__button", "is-unstyled": "abbb272e2ce49bd6__is-unstyled", "is-loading": "_914b42f315c0e580__is-loading", "is-small": "_908205475f9f2a92__is-small", "icon": "_9f6fc6553aeb36fe__icon", "is-brand": "dd460c965226cc77__is-brand", "is-outline": "_62d5a778b7b258ee__is-outline", "is-minimal": "ad0619a3217c6a5b__is-minimal", "is-neutral": "e722a8f96726aa99__is-neutral", "is-solid": "b50b3358c5fb4d0b__is-solid", "is-compact": "cf59cf1b69629838__is-compact", "loading-animation": "_5a1d53da6f830c8d__loading-animation" };
var ButtonIcon = (0, import_element5.forwardRef)(
  function ButtonIcon2({ className, icon, ...props }, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      Icon,
      {
        ref,
        icon,
        className: clsx_default(style_default4.icon, className),
        size: 24,
        ...props
      }
    );
  }
);

// packages/ui/build-module/button/index.mjs
ButtonIcon.displayName = "Button.Icon";
var Button4 = Object.assign(Button3, {
  /**
   * An icon component specifically designed to work well when rendered inside
   * a `Button` component.
   */
  Icon: ButtonIcon
});

// node_modules/@date-fns/tz/tzName/index.js
function tzName(timeZone, date, format7 = "long") {
  return new Intl.DateTimeFormat("en-US", {
    // Enforces engine to render the time. Without the option JavaScriptCore omits it.
    hour: "numeric",
    timeZone,
    timeZoneName: format7
  }).format(date).split(/\s/g).slice(2).join(" ");
}

// node_modules/@date-fns/tz/tzOffset/index.js
var offsetFormatCache = {};
var offsetCache = {};
function tzOffset(timeZone, date) {
  try {
    const format7 = offsetFormatCache[timeZone] ||= new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset"
    }).format;
    const offsetStr = format7(date).split("GMT")[1];
    if (offsetStr in offsetCache) return offsetCache[offsetStr];
    return calcOffset(offsetStr, offsetStr.split(":"));
  } catch {
    if (timeZone in offsetCache) return offsetCache[timeZone];
    const captures = timeZone?.match(offsetRe);
    if (captures) return calcOffset(timeZone, captures.slice(1));
    return NaN;
  }
}
var offsetRe = /([+-]\d\d):?(\d\d)?/;
function calcOffset(cacheStr, values) {
  const hours = +(values[0] || 0);
  const minutes = +(values[1] || 0);
  const seconds = +(values[2] || 0) / 60;
  return offsetCache[cacheStr] = hours * 60 + minutes > 0 ? hours * 60 + minutes + seconds : hours * 60 - minutes - seconds;
}

// node_modules/@date-fns/tz/date/mini.js
var TZDateMini = class _TZDateMini extends Date {
  //#region static
  constructor(...args) {
    super();
    if (args.length > 1 && typeof args[args.length - 1] === "string") {
      this.timeZone = args.pop();
    }
    this.internal = /* @__PURE__ */ new Date();
    if (isNaN(tzOffset(this.timeZone, this))) {
      this.setTime(NaN);
    } else {
      if (!args.length) {
        this.setTime(Date.now());
      } else if (typeof args[0] === "number" && (args.length === 1 || args.length === 2 && typeof args[1] !== "number")) {
        this.setTime(args[0]);
      } else if (typeof args[0] === "string") {
        this.setTime(+new Date(args[0]));
      } else if (args[0] instanceof Date) {
        this.setTime(+args[0]);
      } else {
        this.setTime(+new Date(...args));
        adjustToSystemTZ(this, args);
      }
    }
  }
  static tz(tz, ...args) {
    return args.length ? new _TZDateMini(...args, tz) : new _TZDateMini(Date.now(), tz);
  }
  //#endregion
  //#region time zone
  withTimeZone(timeZone) {
    return new _TZDateMini(+this, timeZone);
  }
  getTimezoneOffset() {
    const offset = -tzOffset(this.timeZone, this);
    return offset > 0 ? Math.floor(offset) : Math.ceil(offset);
  }
  //#endregion
  //#region time
  setTime(_time) {
    Date.prototype.setTime.apply(this, arguments);
    syncToInternal(this);
    return +this;
  }
  //#endregion
  //#region date-fns integration
  [/* @__PURE__ */ Symbol.for("constructDateFrom")](date) {
    return new _TZDateMini(+new Date(date), this.timeZone);
  }
  //#endregion
};
var re = /^(get|set)(?!UTC)/;
Object.getOwnPropertyNames(Date.prototype).forEach((method) => {
  if (!re.test(method)) return;
  const utcMethod = method.replace(re, "$1UTC");
  if (!TZDateMini.prototype[utcMethod]) return;
  if (method.startsWith("get")) {
    TZDateMini.prototype[method] = function() {
      return this.internal[utcMethod]();
    };
  } else {
    TZDateMini.prototype[method] = function() {
      Date.prototype[utcMethod].apply(this.internal, arguments);
      syncFromInternal(this);
      return +this;
    };
    TZDateMini.prototype[utcMethod] = function() {
      Date.prototype[utcMethod].apply(this, arguments);
      syncToInternal(this);
      return +this;
    };
  }
});
function syncToInternal(date) {
  date.internal.setTime(+date);
  date.internal.setUTCSeconds(date.internal.getUTCSeconds() - // Round after converting minutes to seconds to avoid fractional offset
  // precision errors from historical offsets.
  Math.round(-tzOffset(date.timeZone, date) * 60));
}
function syncFromInternal(date) {
  Date.prototype.setFullYear.call(date, date.internal.getUTCFullYear(), date.internal.getUTCMonth(), date.internal.getUTCDate());
  Date.prototype.setHours.call(date, date.internal.getUTCHours(), date.internal.getUTCMinutes(), date.internal.getUTCSeconds(), date.internal.getUTCMilliseconds());
  adjustToSystemTZ(date);
}
function adjustToSystemTZ(date, constructorArgs) {
  const expectedInternalTime = Array.isArray(constructorArgs) ? constructorArgsToInternalTime(constructorArgs) : +date.internal;
  const offsetWithSeconds = tzOffset(date.timeZone, date);
  const offset = offsetWithSeconds > 0 ? Math.floor(offsetWithSeconds) : Math.ceil(offsetWithSeconds);
  const prevHour = /* @__PURE__ */ new Date(+date);
  prevHour.setUTCHours(prevHour.getUTCHours() - 1);
  const systemOffset = -(/* @__PURE__ */ new Date(+date)).getTimezoneOffset();
  const prevHourSystemOffset = -(/* @__PURE__ */ new Date(+prevHour)).getTimezoneOffset();
  const systemDSTChange = systemOffset - prevHourSystemOffset;
  let systemOffsetForDiff = systemOffset;
  if (systemDSTChange && systemOffset !== offset) {
    const systemHour = Date.prototype.getHours.apply(date);
    const expectedHour = Array.isArray(constructorArgs) ? constructorArgs[3] || 0 : date.internal.getUTCHours();
    if (systemHour !== expectedHour) {
      const testDate = /* @__PURE__ */ new Date(+date);
      const testOffsetDiff = systemOffset - offset;
      if (testOffsetDiff) testDate.setUTCMinutes(testDate.getUTCMinutes() + testOffsetDiff);
      const testOffsetWithSeconds = tzOffset(date.timeZone, testDate);
      const testOffset = testOffsetWithSeconds > 0 ? Math.floor(testOffsetWithSeconds) : Math.ceil(testOffsetWithSeconds);
      if (testOffset === offset) systemOffsetForDiff = prevHourSystemOffset;
    }
  }
  const offsetDiff = systemOffsetForDiff - offset;
  if (offsetDiff)
    Date.prototype.setUTCMinutes.call(date, Date.prototype.getUTCMinutes.call(date) + offsetDiff);
  const systemDate = /* @__PURE__ */ new Date(+date);
  systemDate.setUTCSeconds(0);
  const systemSecondsOffset = systemOffset > 0 ? systemDate.getSeconds() : (systemDate.getSeconds() - 60) % 60;
  const secondsOffset = Math.round(-(tzOffset(date.timeZone, date) * 60)) % 60;
  if (secondsOffset || systemSecondsOffset)
    Date.prototype.setUTCSeconds.call(date, Date.prototype.getUTCSeconds.call(date) + secondsOffset + systemSecondsOffset);
  const postOffsetWithSeconds = tzOffset(date.timeZone, date);
  const postOffset = postOffsetWithSeconds > 0 ? Math.floor(postOffsetWithSeconds) : Math.ceil(postOffsetWithSeconds);
  const postSystemOffset = -(/* @__PURE__ */ new Date(+date)).getTimezoneOffset();
  const postOffsetDiff = postSystemOffset - postOffset;
  const offsetChanged = postOffset !== offset;
  const postDiff = postOffsetDiff - offsetDiff;
  const targetDSTShift = postOffset - offset;
  const postOffsetCandidate = expectedInternalTime - postOffset * 60 * 1e3;
  const normalizedTargetDSTGap = targetDSTShift > 0 && targetInternalTime(date) - expectedInternalTime === targetDSTShift * 60 * 1e3 && targetInternalTime(date, postOffsetCandidate) !== expectedInternalTime;
  if (offsetChanged && postDiff && !normalizedTargetDSTGap) {
    Date.prototype.setUTCMinutes.call(date, Date.prototype.getUTCMinutes.call(date) + postDiff);
    const newOffsetWithSeconds = tzOffset(date.timeZone, date);
    const newOffset = newOffsetWithSeconds > 0 ? Math.floor(newOffsetWithSeconds) : Math.ceil(newOffsetWithSeconds);
    const offsetChange = postOffset - newOffset;
    if (offsetChange && postDiff < 0) {
      Date.prototype.setUTCMinutes.call(date, Date.prototype.getUTCMinutes.call(date) + offsetChange);
    }
  }
  syncToInternal(date);
  const expectedTime = constructorArgs ? expectedInternalTime : expectedInternalTime + secondsOffset * 1e3;
  const drift = expectedTime - +date.internal;
  if (drift && Math.abs(drift) < 30 * 60 * 1e3) {
    Date.prototype.setTime.call(date, +date + drift);
    syncToInternal(date);
  }
}
function constructorArgsToInternalTime(args) {
  return Date.UTC(args[0], args.length > 1 ? args[1] : 0, args.length > 2 ? args[2] : 1, ...args.slice(3));
}
function targetInternalTime(date, time) {
  const internal = new Date(time ?? +date);
  internal.setUTCSeconds(internal.getUTCSeconds() - Math.round(-tzOffset(date.timeZone, internal) * 60));
  return +internal;
}

// node_modules/@date-fns/tz/date/index.js
var TZDate = class _TZDate extends TZDateMini {
  //#region static
  static tz(tz, ...args) {
    return args.length ? new _TZDate(...args, tz) : new _TZDate(Date.now(), tz);
  }
  //#endregion
  //#region representation
  toISOString() {
    const [sign, hours, minutes] = this.tzComponents();
    const tz = `${sign}${hours}:${minutes}`;
    return this.internal.toISOString().slice(0, -1) + tz;
  }
  toString() {
    return `${this.toDateString()} ${this.toTimeString()}`;
  }
  toDateString() {
    const [day, date, month, year] = this.internal.toUTCString().split(" ");
    return `${day?.slice(0, -1)} ${month} ${date} ${year}`;
  }
  toTimeString() {
    const time = this.internal.toUTCString().split(" ")[4];
    const [sign, hours, minutes] = this.tzComponents();
    return `${time} GMT${sign}${hours}${minutes} (${tzName(this.timeZone, this)})`;
  }
  toLocaleString(locales, options) {
    return Date.prototype.toLocaleString.call(this, locales, {
      ...options,
      timeZone: options?.timeZone || this.timeZone
    });
  }
  toLocaleDateString(locales, options) {
    return Date.prototype.toLocaleDateString.call(this, locales, {
      ...options,
      timeZone: options?.timeZone || this.timeZone
    });
  }
  toLocaleTimeString(locales, options) {
    return Date.prototype.toLocaleTimeString.call(this, locales, {
      ...options,
      timeZone: options?.timeZone || this.timeZone
    });
  }
  //#endregion
  //#region private
  tzComponents() {
    const offset = this.getTimezoneOffset();
    const sign = offset > 0 ? "-" : "+";
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
    const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
    return [sign, hours, minutes];
  }
  //#endregion
  withTimeZone(timeZone) {
    return new _TZDate(+this, timeZone);
  }
  //#region date-fns integration
  [/* @__PURE__ */ Symbol.for("constructDateFrom")](date) {
    return new _TZDate(+new Date(date), this.timeZone);
  }
  //#endregion
};

// node_modules/date-fns/constants.js
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
var minTime = -maxTime;
var millisecondsInWeek = 6048e5;
var millisecondsInDay = 864e5;
var millisecondsInMinute = 6e4;
var millisecondsInHour = 36e5;
var millisecondsInSecond = 1e3;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;
var constructFromSymbol = /* @__PURE__ */ Symbol.for("constructDateFrom");

// node_modules/date-fns/constructFrom.js
function constructFrom(date, value) {
  if (typeof date === "function") return date(value);
  if (date && typeof date === "object" && constructFromSymbol in date)
    return date[constructFromSymbol](value);
  if (date instanceof Date) return new date.constructor(value);
  return new Date(value);
}

// node_modules/date-fns/toDate.js
function toDate(argument, context) {
  return constructFrom(context || argument, argument);
}

// node_modules/date-fns/addDays.js
function addDays(date, amount, options) {
  const _date = toDate(date, options?.in);
  if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
  if (!amount) return _date;
  _date.setDate(_date.getDate() + amount);
  return _date;
}

// node_modules/date-fns/addMonths.js
function addMonths(date, amount, options) {
  const _date = toDate(date, options?.in);
  if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
  if (!amount) {
    return _date;
  }
  const dayOfMonth = _date.getDate();
  const endOfDesiredMonth = constructFrom(options?.in || date, _date.getTime());
  endOfDesiredMonth.setMonth(_date.getMonth() + amount + 1, 0);
  const daysInMonth = endOfDesiredMonth.getDate();
  if (dayOfMonth >= daysInMonth) {
    return endOfDesiredMonth;
  } else {
    _date.setFullYear(
      endOfDesiredMonth.getFullYear(),
      endOfDesiredMonth.getMonth(),
      dayOfMonth
    );
    return _date;
  }
}

// node_modules/date-fns/_lib/defaultOptions.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/date-fns/startOfWeek.js
function startOfWeek(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/startOfISOWeek.js
function startOfISOWeek(date, options) {
  return startOfWeek(date, { ...options, weekStartsOn: 1 });
}

// node_modules/date-fns/getISOWeekYear.js
function getISOWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
  const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}

// node_modules/date-fns/_lib/normalizeDates.js
function normalizeDates(context, ...dates) {
  const normalize = constructFrom.bind(
    null,
    context || dates.find((date) => typeof date === "object")
  );
  return dates.map(normalize);
}

// node_modules/date-fns/startOfDay.js
function startOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/differenceInCalendarDays.js
function differenceInCalendarDays(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  const laterStartOfDay = startOfDay(laterDate_);
  const earlierStartOfDay = startOfDay(earlierDate_);
  const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
  const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
  return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
}

// node_modules/date-fns/startOfISOWeekYear.js
function startOfISOWeekYear(date, options) {
  const year = getISOWeekYear(date, options);
  const fourthOfJanuary = constructFrom(options?.in || date, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return startOfISOWeek(fourthOfJanuary);
}

// node_modules/date-fns/addWeeks.js
function addWeeks(date, amount, options) {
  return addDays(date, amount * 7, options);
}

// node_modules/date-fns/addYears.js
function addYears(date, amount, options) {
  return addMonths(date, amount * 12, options);
}

// node_modules/date-fns/areIntervalsOverlapping.js
function areIntervalsOverlapping(intervalLeft, intervalRight, options) {
  const [leftStartTime, leftEndTime] = [
    +toDate(intervalLeft.start, options?.in),
    +toDate(intervalLeft.end, options?.in)
  ].sort((a2, b2) => a2 - b2);
  const [rightStartTime, rightEndTime] = [
    +toDate(intervalRight.start, options?.in),
    +toDate(intervalRight.end, options?.in)
  ].sort((a2, b2) => a2 - b2);
  if (options?.inclusive)
    return leftStartTime <= rightEndTime && rightStartTime <= leftEndTime;
  return leftStartTime < rightEndTime && rightStartTime < leftEndTime;
}

// node_modules/date-fns/max.js
function max(dates, options) {
  let result;
  let context = options?.in;
  dates.forEach((date) => {
    if (!context && typeof date === "object")
      context = constructFrom.bind(null, date);
    const date_ = toDate(date, context);
    if (!result || result < date_ || isNaN(+date_)) result = date_;
  });
  return constructFrom(context, result || NaN);
}

// node_modules/date-fns/min.js
function min(dates, options) {
  let result;
  let context = options?.in;
  dates.forEach((date) => {
    if (!context && typeof date === "object")
      context = constructFrom.bind(null, date);
    const date_ = toDate(date, context);
    if (!result || result > date_ || isNaN(+date_)) result = date_;
  });
  return constructFrom(context, result || NaN);
}

// node_modules/date-fns/isSameDay.js
function isSameDay(laterDate, earlierDate, options) {
  const [dateLeft_, dateRight_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  return +startOfDay(dateLeft_) === +startOfDay(dateRight_);
}

// node_modules/date-fns/isDate.js
function isDate(value) {
  return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}

// node_modules/date-fns/isValid.js
function isValid(date) {
  return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
}

// node_modules/date-fns/differenceInCalendarMonths.js
function differenceInCalendarMonths(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  const yearsDiff = laterDate_.getFullYear() - earlierDate_.getFullYear();
  const monthsDiff = laterDate_.getMonth() - earlierDate_.getMonth();
  return yearsDiff * 12 + monthsDiff;
}

// node_modules/date-fns/endOfMonth.js
function endOfMonth(date, options) {
  const _date = toDate(date, options?.in);
  const month = _date.getMonth();
  _date.setFullYear(_date.getFullYear(), month + 1, 0);
  _date.setHours(23, 59, 59, 999);
  return _date;
}

// node_modules/date-fns/_lib/normalizeInterval.js
function normalizeInterval(context, interval) {
  const [start, end] = normalizeDates(context, interval.start, interval.end);
  return { start, end };
}

// node_modules/date-fns/eachMonthOfInterval.js
function eachMonthOfInterval(interval, options) {
  const { start, end } = normalizeInterval(options?.in, interval);
  let reversed = +start > +end;
  const endTime = reversed ? +start : +end;
  const date = reversed ? end : start;
  date.setHours(0, 0, 0, 0);
  date.setDate(1);
  let step = options?.step ?? 1;
  if (!step) return [];
  if (step < 0) {
    step = -step;
    reversed = !reversed;
  }
  const dates = [];
  while (+date <= endTime) {
    dates.push(constructFrom(start, date));
    date.setMonth(date.getMonth() + step);
  }
  return reversed ? dates.reverse() : dates;
}

// node_modules/date-fns/startOfMonth.js
function startOfMonth(date, options) {
  const _date = toDate(date, options?.in);
  _date.setDate(1);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/endOfYear.js
function endOfYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  _date.setFullYear(year + 1, 0, 0);
  _date.setHours(23, 59, 59, 999);
  return _date;
}

// node_modules/date-fns/startOfYear.js
function startOfYear(date, options) {
  const date_ = toDate(date, options?.in);
  date_.setFullYear(date_.getFullYear(), 0, 1);
  date_.setHours(0, 0, 0, 0);
  return date_;
}

// node_modules/date-fns/eachYearOfInterval.js
function eachYearOfInterval(interval, options) {
  const { start, end } = normalizeInterval(options?.in, interval);
  let reversed = +start > +end;
  const endTime = reversed ? +start : +end;
  const date = reversed ? end : start;
  date.setHours(0, 0, 0, 0);
  date.setMonth(0, 1);
  let step = options?.step ?? 1;
  if (!step) return [];
  if (step < 0) {
    step = -step;
    reversed = !reversed;
  }
  const dates = [];
  while (+date <= endTime) {
    dates.push(constructFrom(start, date));
    date.setFullYear(date.getFullYear() + step);
  }
  return reversed ? dates.reverse() : dates;
}

// node_modules/date-fns/endOfWeek.js
function endOfWeek(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
  _date.setDate(_date.getDate() + diff);
  _date.setHours(23, 59, 59, 999);
  return _date;
}

// node_modules/date-fns/endOfISOWeek.js
function endOfISOWeek(date, options) {
  return endOfWeek(date, { ...options, weekStartsOn: 1 });
}

// node_modules/date-fns/locale/en-US/_lib/formatDistance.js
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
var formatDistance = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};

// node_modules/date-fns/locale/_lib/buildFormatLongFn.js
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format7 = args.formats[width] || args.formats[args.defaultWidth];
    return format7;
  };
}

// node_modules/date-fns/locale/en-US/_lib/formatLong.js
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};

// node_modules/date-fns/locale/en-US/_lib/formatRelative.js
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

// node_modules/date-fns/locale/_lib/buildLocalizeFn.js
function buildLocalizeFn(args) {
  return (value, options) => {
    const context = options?.context ? String(options.context) : "standalone";
    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index];
  };
}

// node_modules/date-fns/locale/en-US/_lib/localize.js
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
var ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};

// node_modules/date-fns/locale/_lib/buildMatchFn.js
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
      // [TODO] -- I challenge you to fix the type
      findKey(parsePatterns, (pattern) => pattern.test(matchedString))
    );
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? (
      // [TODO] -- I challenge you to fix the type
      options.valueCallback(value)
    ) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}

// node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}

// node_modules/date-fns/locale/en-US/_lib/match.js
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};

// node_modules/date-fns/locale/en-US.js
var enUS = {
  code: "en-US",
  formatDistance,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};

// node_modules/date-fns/getDayOfYear.js
function getDayOfYear(date, options) {
  const _date = toDate(date, options?.in);
  const diff = differenceInCalendarDays(_date, startOfYear(_date));
  const dayOfYear = diff + 1;
  return dayOfYear;
}

// node_modules/date-fns/getISOWeek.js
function getISOWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/getWeekYear.js
function getWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
  const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
  if (+_date >= +startOfNextYear) {
    return year + 1;
  } else if (+_date >= +startOfThisYear) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/startOfWeekYear.js
function startOfWeekYear(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const year = getWeekYear(date, options);
  const firstWeek = constructFrom(options?.in || date, 0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  const _date = startOfWeek(firstWeek, options);
  return _date;
}

// node_modules/date-fns/getWeek.js
function getWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/_lib/addLeadingZeros.js
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}

// node_modules/date-fns/_lib/format/lightFormatters.js
var lightFormatters = {
  // Year
  y(date, token) {
    const signedYear = date.getFullYear();
    const year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  // Month
  M(date, token) {
    const month = date.getMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d(date, token) {
    return addLeadingZeros(date.getDate(), token.length);
  },
  // AM or PM
  a(date, token) {
    const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },
  // Hour [1-12]
  h(date, token) {
    return addLeadingZeros(date.getHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H(date, token) {
    return addLeadingZeros(date.getHours(), token.length);
  },
  // Minute
  m(date, token) {
    return addLeadingZeros(date.getMinutes(), token.length);
  },
  // Second
  s(date, token) {
    return addLeadingZeros(date.getSeconds(), token.length);
  },
  // Fraction of second
  S(date, token) {
    const numberOfDigits = token.length;
    const milliseconds = date.getMilliseconds();
    const fractionalSeconds = Math.trunc(
      milliseconds * Math.pow(10, numberOfDigits - 3)
    );
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};

// node_modules/date-fns/_lib/format/formatters.js
var dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
};
var formatters = {
  // Era
  G: function(date, token, localize2) {
    const era = date.getFullYear() > 0 ? 1 : 0;
    switch (token) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return localize2.era(era, { width: "abbreviated" });
      // A, B
      case "GGGGG":
        return localize2.era(era, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return localize2.era(era, { width: "wide" });
    }
  },
  // Year
  y: function(date, token, localize2) {
    if (token === "yo") {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize2.ordinalNumber(year, { unit: "year" });
    }
    return lightFormatters.y(date, token);
  },
  // Local week-numbering year
  Y: function(date, token, localize2, options) {
    const signedWeekYear = getWeekYear(date, options);
    const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      const twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize2.ordinalNumber(weekYear, { unit: "year" });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function(date, token) {
    const isoWeekYear = getISOWeekYear(date);
    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function(date, token) {
    const year = date.getFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "Q":
        return String(quarter);
      // 01, 02, 03, 04
      case "QQ":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "formatting"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "formatting"
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone quarter
  q: function(date, token, localize2) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "q":
        return String(quarter);
      // 01, 02, 03, 04
      case "qq":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return localize2.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return localize2.quarter(quarter, {
          width: "abbreviated",
          context: "standalone"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return localize2.quarter(quarter, {
          width: "narrow",
          context: "standalone"
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return localize2.quarter(quarter, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Month
  M: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters.M(date, token);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "MMM":
        return localize2.month(month, {
          width: "abbreviated",
          context: "formatting"
        });
      // J, F, ..., D
      case "MMMMM":
        return localize2.month(month, {
          width: "narrow",
          context: "formatting"
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return localize2.month(month, { width: "wide", context: "formatting" });
    }
  },
  // Stand-alone month
  L: function(date, token, localize2) {
    const month = date.getMonth();
    switch (token) {
      // 1, 2, ..., 12
      case "L":
        return String(month + 1);
      // 01, 02, ..., 12
      case "LL":
        return addLeadingZeros(month + 1, 2);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return localize2.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "LLL":
        return localize2.month(month, {
          width: "abbreviated",
          context: "standalone"
        });
      // J, F, ..., D
      case "LLLLL":
        return localize2.month(month, {
          width: "narrow",
          context: "standalone"
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return localize2.month(month, { width: "wide", context: "standalone" });
    }
  },
  // Local week of year
  w: function(date, token, localize2, options) {
    const week = getWeek(date, options);
    if (token === "wo") {
      return localize2.ordinalNumber(week, { unit: "week" });
    }
    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function(date, token, localize2) {
    const isoWeek = getISOWeek(date);
    if (token === "Io") {
      return localize2.ordinalNumber(isoWeek, { unit: "week" });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function(date, token, localize2) {
    if (token === "do") {
      return localize2.ordinalNumber(date.getDate(), { unit: "date" });
    }
    return lightFormatters.d(date, token);
  },
  // Day of year
  D: function(date, token, localize2) {
    const dayOfYear = getDayOfYear(date);
    if (token === "Do") {
      return localize2.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    switch (token) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "EEEEE":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "EEEEEE":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "EEEE":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Local day of week
  e: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case "e":
        return String(localDayOfWeek);
      // Padded numerical value
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th
      case "eo":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "eee":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "eeeee":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "eeeeee":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "eeee":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone local day of week
  c: function(date, token, localize2, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (same as in `e`)
      case "c":
        return String(localDayOfWeek);
      // Padded numerical value
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th
      case "co":
        return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "ccc":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone"
        });
      // T
      case "ccccc":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "standalone"
        });
      // Tu
      case "cccccc":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "standalone"
        });
      // Tuesday
      case "cccc":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // ISO day of week
  i: function(date, token, localize2) {
    const dayOfWeek = date.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      // 2
      case "i":
        return String(isoDayOfWeek);
      // 02
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      // 2nd
      case "io":
        return localize2.ordinalNumber(isoDayOfWeek, { unit: "day" });
      // Tue
      case "iii":
        return localize2.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "iiiii":
        return localize2.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "iiiiii":
        return localize2.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "iiii":
      default:
        return localize2.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM or PM
  a: function(date, token, localize2) {
    const hours = date.getHours();
    const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM, PM, midnight, noon
  b: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }
    switch (token) {
      case "b":
      case "bb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function(date, token, localize2) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return localize2.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Hour [1-12]
  h: function(date, token, localize2) {
    if (token === "ho") {
      let hours = date.getHours() % 12;
      if (hours === 0) hours = 12;
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return lightFormatters.h(date, token);
  },
  // Hour [0-23]
  H: function(date, token, localize2) {
    if (token === "Ho") {
      return localize2.ordinalNumber(date.getHours(), { unit: "hour" });
    }
    return lightFormatters.H(date, token);
  },
  // Hour [0-11]
  K: function(date, token, localize2) {
    const hours = date.getHours() % 12;
    if (token === "Ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function(date, token, localize2) {
    let hours = date.getHours();
    if (hours === 0) hours = 24;
    if (token === "ko") {
      return localize2.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function(date, token, localize2) {
    if (token === "mo") {
      return localize2.ordinalNumber(date.getMinutes(), { unit: "minute" });
    }
    return lightFormatters.m(date, token);
  },
  // Second
  s: function(date, token, localize2) {
    if (token === "so") {
      return localize2.ordinalNumber(date.getSeconds(), { unit: "second" });
    }
    return lightFormatters.s(date, token);
  },
  // Fraction of second
  S: function(date, token) {
    return lightFormatters.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      // Hours and optional minutes
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX":
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX":
      // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      // Hours and optional minutes
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx":
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx":
      // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (GMT)
  O: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();
    switch (token) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Seconds timestamp
  t: function(date, token, _localize) {
    const timestamp = Math.trunc(+date / 1e3);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function(date, token, _localize) {
    return addLeadingZeros(+date, token.length);
  }
};
function formatTimezoneShort(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.trunc(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, delimiter);
}
function formatTimezone(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
  const minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

// node_modules/date-fns/_lib/format/longFormatters.js
var dateLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "P":
      return formatLong2.date({ width: "short" });
    case "PP":
      return formatLong2.date({ width: "medium" });
    case "PPP":
      return formatLong2.date({ width: "long" });
    case "PPPP":
    default:
      return formatLong2.date({ width: "full" });
  }
};
var timeLongFormatter = (pattern, formatLong2) => {
  switch (pattern) {
    case "p":
      return formatLong2.time({ width: "short" });
    case "pp":
      return formatLong2.time({ width: "medium" });
    case "ppp":
      return formatLong2.time({ width: "long" });
    case "pppp":
    default:
      return formatLong2.time({ width: "full" });
  }
};
var dateTimeLongFormatter = (pattern, formatLong2) => {
  const matchResult = pattern.match(/(P+)(p+)?/) || [];
  const datePattern = matchResult[1];
  const timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong2);
  }
  let dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong2.dateTime({ width: "short" });
      break;
    case "PP":
      dateTimeFormat = formatLong2.dateTime({ width: "medium" });
      break;
    case "PPP":
      dateTimeFormat = formatLong2.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong2.dateTime({ width: "full" });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
};
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};

// node_modules/date-fns/_lib/protectedTokens.js
var dayOfYearTokenRE = /^D+$/;
var weekYearTokenRE = /^Y+$/;
var throwTokens = ["D", "DD", "YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return dayOfYearTokenRE.test(token);
}
function isProtectedWeekYearToken(token) {
  return weekYearTokenRE.test(token);
}
function warnOrThrowProtectedError(token, format7, input) {
  const _message = message(token, format7, input);
  console.warn(_message);
  if (throwTokens.includes(token)) throw new RangeError(_message);
}
function message(token, format7, input) {
  const subject = token[0] === "Y" ? "years" : "days of the month";
  return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format7}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}

// node_modules/date-fns/format.js
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function format(date, formatStr, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const originalDate = toDate(date, options?.in);
  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
    const firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      const longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp).map((substring) => {
    if (substring === "''") {
      return { isToken: false, value: "'" };
    }
    const firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return { isToken: false, value: cleanEscapedString(substring) };
    }
    if (formatters[firstCharacter]) {
      return { isToken: true, value: substring };
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
      );
    }
    return { isToken: false, value: substring };
  });
  if (locale.localize.preprocessor) {
    parts = locale.localize.preprocessor(originalDate, parts);
  }
  const formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale
  };
  return parts.map((part) => {
    if (!part.isToken) return part.value;
    const token = part.value;
    if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
      warnOrThrowProtectedError(token, formatStr, String(date));
    }
    const formatter = formatters[token[0]];
    return formatter(originalDate, token, locale.localize, formatterOptions);
  }).join("");
}
function cleanEscapedString(input) {
  const matched = input.match(escapedStringRegExp);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp, "'");
}

// node_modules/date-fns/getDaysInMonth.js
function getDaysInMonth(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const monthIndex = _date.getMonth();
  const lastDayOfMonth = constructFrom(_date, 0);
  lastDayOfMonth.setFullYear(year, monthIndex + 1, 0);
  lastDayOfMonth.setHours(0, 0, 0, 0);
  return lastDayOfMonth.getDate();
}

// node_modules/date-fns/getDefaultOptions.js
function getDefaultOptions2() {
  return Object.assign({}, getDefaultOptions());
}

// node_modules/date-fns/getISODay.js
function getISODay(date, options) {
  const day = toDate(date, options?.in).getDay();
  return day === 0 ? 7 : day;
}

// node_modules/date-fns/getMonth.js
function getMonth(date, options) {
  return toDate(date, options?.in).getMonth();
}

// node_modules/date-fns/getYear.js
function getYear(date, options) {
  return toDate(date, options?.in).getFullYear();
}

// node_modules/date-fns/isAfter.js
function isAfter(date, dateToCompare) {
  return +toDate(date) > +toDate(dateToCompare);
}

// node_modules/date-fns/isBefore.js
function isBefore(date, dateToCompare) {
  return +toDate(date) < +toDate(dateToCompare);
}

// node_modules/date-fns/transpose.js
function transpose(date, constructor) {
  const date_ = isConstructor(constructor) ? new constructor(0) : constructFrom(constructor, 0);
  date_.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  date_.setHours(
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
  return date_;
}
function isConstructor(constructor) {
  return typeof constructor === "function" && constructor.prototype?.constructor === constructor;
}

// node_modules/date-fns/parse/_lib/Setter.js
var TIMEZONE_UNIT_PRIORITY = 10;
var Setter = class {
  subPriority = 0;
  validate(_utcDate, _options) {
    return true;
  }
};
var ValueSetter = class extends Setter {
  constructor(value, validateValue, setValue, priority, subPriority) {
    super();
    this.value = value;
    this.validateValue = validateValue;
    this.setValue = setValue;
    this.priority = priority;
    if (subPriority) {
      this.subPriority = subPriority;
    }
  }
  validate(date, options) {
    return this.validateValue(date, this.value, options);
  }
  set(date, flags, options) {
    return this.setValue(date, flags, this.value, options);
  }
};
var DateTimezoneSetter = class extends Setter {
  priority = TIMEZONE_UNIT_PRIORITY;
  subPriority = -1;
  constructor(context, reference) {
    super();
    this.context = context || ((date) => constructFrom(reference, date));
  }
  set(date, flags) {
    if (flags.timestampIsSet) return date;
    return constructFrom(date, transpose(date, this.context));
  }
};

// node_modules/date-fns/parse/_lib/Parser.js
var Parser = class {
  run(dateString, token, match2, options) {
    const result = this.parse(dateString, token, match2, options);
    if (!result) {
      return null;
    }
    return {
      setter: new ValueSetter(
        result.value,
        this.validate,
        this.set,
        this.priority,
        this.subPriority
      ),
      rest: result.rest
    };
  }
  validate(_utcDate, _value, _options) {
    return true;
  }
};

// node_modules/date-fns/parse/_lib/parsers/EraParser.js
var EraParser = class extends Parser {
  priority = 140;
  parse(dateString, token, match2) {
    switch (token) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return match2.era(dateString, { width: "abbreviated" }) || match2.era(dateString, { width: "narrow" });
      // A, B
      case "GGGGG":
        return match2.era(dateString, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return match2.era(dateString, { width: "wide" }) || match2.era(dateString, { width: "abbreviated" }) || match2.era(dateString, { width: "narrow" });
    }
  }
  set(date, flags, value) {
    flags.era = value;
    date.setFullYear(value, 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = ["R", "u", "t", "T"];
};

// node_modules/date-fns/parse/_lib/constants.js
var numericPatterns = {
  month: /^(1[0-2]|0?\d)/,
  // 0 to 12
  date: /^(3[0-1]|[0-2]?\d)/,
  // 0 to 31
  dayOfYear: /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
  // 0 to 366
  week: /^(5[0-3]|[0-4]?\d)/,
  // 0 to 53
  hour23h: /^(2[0-3]|[0-1]?\d)/,
  // 0 to 23
  hour24h: /^(2[0-4]|[0-1]?\d)/,
  // 0 to 24
  hour11h: /^(1[0-1]|0?\d)/,
  // 0 to 11
  hour12h: /^(1[0-2]|0?\d)/,
  // 0 to 12
  minute: /^[0-5]?\d/,
  // 0 to 59
  second: /^[0-5]?\d/,
  // 0 to 59
  singleDigit: /^\d/,
  // 0 to 9
  twoDigits: /^\d{1,2}/,
  // 0 to 99
  threeDigits: /^\d{1,3}/,
  // 0 to 999
  fourDigits: /^\d{1,4}/,
  // 0 to 9999
  anyDigitsSigned: /^-?\d+/,
  singleDigitSigned: /^-?\d/,
  // 0 to 9, -0 to -9
  twoDigitsSigned: /^-?\d{1,2}/,
  // 0 to 99, -0 to -99
  threeDigitsSigned: /^-?\d{1,3}/,
  // 0 to 999, -0 to -999
  fourDigitsSigned: /^-?\d{1,4}/
  // 0 to 9999, -0 to -9999
};
var timezonePatterns = {
  basicOptionalMinutes: /^([+-])(\d{2})(\d{2})?|Z/,
  basic: /^([+-])(\d{2})(\d{2})|Z/,
  basicOptionalSeconds: /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
  extended: /^([+-])(\d{2}):(\d{2})|Z/,
  extendedOptionalSeconds: /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/
};

// node_modules/date-fns/parse/_lib/utils.js
function mapValue(parseFnResult, mapFn) {
  if (!parseFnResult) {
    return parseFnResult;
  }
  return {
    value: mapFn(parseFnResult.value),
    rest: parseFnResult.rest
  };
}
function parseNumericPattern(pattern, dateString) {
  const matchResult = dateString.match(pattern);
  if (!matchResult) {
    return null;
  }
  return {
    value: parseInt(matchResult[0], 10),
    rest: dateString.slice(matchResult[0].length)
  };
}
function parseTimezonePattern(pattern, dateString) {
  const matchResult = dateString.match(pattern);
  if (!matchResult) {
    return null;
  }
  if (matchResult[0] === "Z") {
    return {
      value: 0,
      rest: dateString.slice(1)
    };
  }
  const sign = matchResult[1] === "+" ? 1 : -1;
  const hours = matchResult[2] ? parseInt(matchResult[2], 10) : 0;
  const minutes = matchResult[3] ? parseInt(matchResult[3], 10) : 0;
  const seconds = matchResult[5] ? parseInt(matchResult[5], 10) : 0;
  return {
    value: sign * (hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * millisecondsInSecond),
    rest: dateString.slice(matchResult[0].length)
  };
}
function parseAnyDigitsSigned(dateString) {
  return parseNumericPattern(numericPatterns.anyDigitsSigned, dateString);
}
function parseNDigits(n2, dateString) {
  switch (n2) {
    case 1:
      return parseNumericPattern(numericPatterns.singleDigit, dateString);
    case 2:
      return parseNumericPattern(numericPatterns.twoDigits, dateString);
    case 3:
      return parseNumericPattern(numericPatterns.threeDigits, dateString);
    case 4:
      return parseNumericPattern(numericPatterns.fourDigits, dateString);
    default:
      return parseNumericPattern(new RegExp("^\\d{1," + n2 + "}"), dateString);
  }
}
function parseNDigitsSigned(n2, dateString) {
  switch (n2) {
    case 1:
      return parseNumericPattern(numericPatterns.singleDigitSigned, dateString);
    case 2:
      return parseNumericPattern(numericPatterns.twoDigitsSigned, dateString);
    case 3:
      return parseNumericPattern(numericPatterns.threeDigitsSigned, dateString);
    case 4:
      return parseNumericPattern(numericPatterns.fourDigitsSigned, dateString);
    default:
      return parseNumericPattern(new RegExp("^-?\\d{1," + n2 + "}"), dateString);
  }
}
function dayPeriodEnumToHours(dayPeriod) {
  switch (dayPeriod) {
    case "morning":
      return 4;
    case "evening":
      return 17;
    case "pm":
    case "noon":
    case "afternoon":
      return 12;
    case "am":
    case "midnight":
    case "night":
    default:
      return 0;
  }
}
function normalizeTwoDigitYear(twoDigitYear, currentYear) {
  const isCommonEra = currentYear > 0;
  const absCurrentYear = isCommonEra ? currentYear : 1 - currentYear;
  let result;
  if (absCurrentYear <= 50) {
    result = twoDigitYear || 100;
  } else {
    const rangeEnd = absCurrentYear + 50;
    const rangeEndCentury = Math.trunc(rangeEnd / 100) * 100;
    const isPreviousCentury = twoDigitYear >= rangeEnd % 100;
    result = twoDigitYear + rangeEndCentury - (isPreviousCentury ? 100 : 0);
  }
  return isCommonEra ? result : 1 - result;
}
function isLeapYearIndex(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}

// node_modules/date-fns/parse/_lib/parsers/YearParser.js
var YearParser = class extends Parser {
  priority = 130;
  incompatibleTokens = ["Y", "R", "u", "w", "I", "i", "e", "c", "t", "T"];
  parse(dateString, token, match2) {
    const valueCallback = (year) => ({
      year,
      isTwoDigitYear: token === "yy"
    });
    switch (token) {
      case "y":
        return mapValue(parseNDigits(4, dateString), valueCallback);
      case "yo":
        return mapValue(
          match2.ordinalNumber(dateString, {
            unit: "year"
          }),
          valueCallback
        );
      default:
        return mapValue(parseNDigits(token.length, dateString), valueCallback);
    }
  }
  validate(_date, value) {
    return value.isTwoDigitYear || value.year > 0;
  }
  set(date, flags, value) {
    const currentYear = date.getFullYear();
    if (value.isTwoDigitYear) {
      const normalizedTwoDigitYear = normalizeTwoDigitYear(
        value.year,
        currentYear
      );
      date.setFullYear(normalizedTwoDigitYear, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    const year = !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
    date.setFullYear(year, 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
};

// node_modules/date-fns/parse/_lib/parsers/LocalWeekYearParser.js
var LocalWeekYearParser = class extends Parser {
  priority = 130;
  parse(dateString, token, match2) {
    const valueCallback = (year) => ({
      year,
      isTwoDigitYear: token === "YY"
    });
    switch (token) {
      case "Y":
        return mapValue(parseNDigits(4, dateString), valueCallback);
      case "Yo":
        return mapValue(
          match2.ordinalNumber(dateString, {
            unit: "year"
          }),
          valueCallback
        );
      default:
        return mapValue(parseNDigits(token.length, dateString), valueCallback);
    }
  }
  validate(_date, value) {
    return value.isTwoDigitYear || value.year > 0;
  }
  set(date, flags, value, options) {
    const currentYear = getWeekYear(date, options);
    if (value.isTwoDigitYear) {
      const normalizedTwoDigitYear = normalizeTwoDigitYear(
        value.year,
        currentYear
      );
      date.setFullYear(
        normalizedTwoDigitYear,
        0,
        options.firstWeekContainsDate
      );
      date.setHours(0, 0, 0, 0);
      return startOfWeek(date, options);
    }
    const year = !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
    date.setFullYear(year, 0, options.firstWeekContainsDate);
    date.setHours(0, 0, 0, 0);
    return startOfWeek(date, options);
  }
  incompatibleTokens = [
    "y",
    "R",
    "u",
    "Q",
    "q",
    "M",
    "L",
    "I",
    "d",
    "D",
    "i",
    "t",
    "T"
  ];
};

// node_modules/date-fns/parse/_lib/parsers/ISOWeekYearParser.js
var ISOWeekYearParser = class extends Parser {
  priority = 130;
  parse(dateString, token) {
    if (token === "R") {
      return parseNDigitsSigned(4, dateString);
    }
    return parseNDigitsSigned(token.length, dateString);
  }
  set(date, _flags, value) {
    const firstWeekOfYear = constructFrom(date, 0);
    firstWeekOfYear.setFullYear(value, 0, 4);
    firstWeekOfYear.setHours(0, 0, 0, 0);
    return startOfISOWeek(firstWeekOfYear);
  }
  incompatibleTokens = [
    "G",
    "y",
    "Y",
    "u",
    "Q",
    "q",
    "M",
    "L",
    "w",
    "d",
    "D",
    "e",
    "c",
    "t",
    "T"
  ];
};

// node_modules/date-fns/parse/_lib/parsers/ExtendedYearParser.js
var ExtendedYearParser = class extends Parser {
  priority = 130;
  parse(dateString, token) {
    if (token === "u") {
      return parseNDigitsSigned(4, dateString);
    }
    return parseNDigitsSigned(token.length, dateString);
  }
  set(date, _flags, value) {
    date.setFullYear(value, 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = ["G", "y", "Y", "R", "w", "I", "i", "e", "c", "t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/QuarterParser.js
var QuarterParser = class extends Parser {
  priority = 120;
  parse(dateString, token, match2) {
    switch (token) {
      // 1, 2, 3, 4
      case "Q":
      case "QQ":
        return parseNDigits(token.length, dateString);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return match2.ordinalNumber(dateString, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return match2.quarter(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.quarter(dateString, {
          width: "narrow",
          context: "formatting"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return match2.quarter(dateString, {
          width: "narrow",
          context: "formatting"
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return match2.quarter(dateString, {
          width: "wide",
          context: "formatting"
        }) || match2.quarter(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.quarter(dateString, {
          width: "narrow",
          context: "formatting"
        });
    }
  }
  validate(_date, value) {
    return value >= 1 && value <= 4;
  }
  set(date, _flags, value) {
    date.setMonth((value - 1) * 3, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "M",
    "L",
    "w",
    "I",
    "d",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T"
  ];
};

// node_modules/date-fns/parse/_lib/parsers/StandAloneQuarterParser.js
var StandAloneQuarterParser = class extends Parser {
  priority = 120;
  parse(dateString, token, match2) {
    switch (token) {
      // 1, 2, 3, 4
      case "q":
      case "qq":
        return parseNDigits(token.length, dateString);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return match2.ordinalNumber(dateString, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return match2.quarter(dateString, {
          width: "abbreviated",
          context: "standalone"
        }) || match2.quarter(dateString, {
          width: "narrow",
          context: "standalone"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return match2.quarter(dateString, {
          width: "narrow",
          context: "standalone"
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return match2.quarter(dateString, {
          width: "wide",
          context: "standalone"
        }) || match2.quarter(dateString, {
          width: "abbreviated",
          context: "standalone"
        }) || match2.quarter(dateString, {
          width: "narrow",
          context: "standalone"
        });
    }
  }
  validate(_date, value) {
    return value >= 1 && value <= 4;
  }
  set(date, _flags, value) {
    date.setMonth((value - 1) * 3, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = [
    "Y",
    "R",
    "Q",
    "M",
    "L",
    "w",
    "I",
    "d",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T"
  ];
};

// node_modules/date-fns/parse/_lib/parsers/MonthParser.js
var MonthParser = class extends Parser {
  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "Q",
    "L",
    "w",
    "I",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T"
  ];
  priority = 110;
  parse(dateString, token, match2) {
    const valueCallback = (value) => value - 1;
    switch (token) {
      // 1, 2, ..., 12
      case "M":
        return mapValue(
          parseNumericPattern(numericPatterns.month, dateString),
          valueCallback
        );
      // 01, 02, ..., 12
      case "MM":
        return mapValue(parseNDigits(2, dateString), valueCallback);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return mapValue(
          match2.ordinalNumber(dateString, {
            unit: "month"
          }),
          valueCallback
        );
      // Jan, Feb, ..., Dec
      case "MMM":
        return match2.month(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.month(dateString, { width: "narrow", context: "formatting" });
      // J, F, ..., D
      case "MMMMM":
        return match2.month(dateString, {
          width: "narrow",
          context: "formatting"
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return match2.month(dateString, { width: "wide", context: "formatting" }) || match2.month(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.month(dateString, { width: "narrow", context: "formatting" });
    }
  }
  validate(_date, value) {
    return value >= 0 && value <= 11;
  }
  set(date, _flags, value) {
    date.setMonth(value, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
};

// node_modules/date-fns/parse/_lib/parsers/StandAloneMonthParser.js
var StandAloneMonthParser = class extends Parser {
  priority = 110;
  parse(dateString, token, match2) {
    const valueCallback = (value) => value - 1;
    switch (token) {
      // 1, 2, ..., 12
      case "L":
        return mapValue(
          parseNumericPattern(numericPatterns.month, dateString),
          valueCallback
        );
      // 01, 02, ..., 12
      case "LL":
        return mapValue(parseNDigits(2, dateString), valueCallback);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return mapValue(
          match2.ordinalNumber(dateString, {
            unit: "month"
          }),
          valueCallback
        );
      // Jan, Feb, ..., Dec
      case "LLL":
        return match2.month(dateString, {
          width: "abbreviated",
          context: "standalone"
        }) || match2.month(dateString, { width: "narrow", context: "standalone" });
      // J, F, ..., D
      case "LLLLL":
        return match2.month(dateString, {
          width: "narrow",
          context: "standalone"
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return match2.month(dateString, { width: "wide", context: "standalone" }) || match2.month(dateString, {
          width: "abbreviated",
          context: "standalone"
        }) || match2.month(dateString, { width: "narrow", context: "standalone" });
    }
  }
  validate(_date, value) {
    return value >= 0 && value <= 11;
  }
  set(date, _flags, value) {
    date.setMonth(value, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "Q",
    "M",
    "w",
    "I",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T"
  ];
};

// node_modules/date-fns/setWeek.js
function setWeek(date, week, options) {
  const date_ = toDate(date, options?.in);
  const diff = getWeek(date_, options) - week;
  date_.setDate(date_.getDate() - diff * 7);
  return toDate(date_, options?.in);
}

// node_modules/date-fns/parse/_lib/parsers/LocalWeekParser.js
var LocalWeekParser = class extends Parser {
  priority = 100;
  parse(dateString, token, match2) {
    switch (token) {
      case "w":
        return parseNumericPattern(numericPatterns.week, dateString);
      case "wo":
        return match2.ordinalNumber(dateString, { unit: "week" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(_date, value) {
    return value >= 1 && value <= 53;
  }
  set(date, _flags, value, options) {
    return startOfWeek(setWeek(date, value, options), options);
  }
  incompatibleTokens = [
    "y",
    "R",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "I",
    "d",
    "D",
    "i",
    "t",
    "T"
  ];
};

// node_modules/date-fns/setISOWeek.js
function setISOWeek(date, week, options) {
  const _date = toDate(date, options?.in);
  const diff = getISOWeek(_date, options) - week;
  _date.setDate(_date.getDate() - diff * 7);
  return _date;
}

// node_modules/date-fns/parse/_lib/parsers/ISOWeekParser.js
var ISOWeekParser = class extends Parser {
  priority = 100;
  parse(dateString, token, match2) {
    switch (token) {
      case "I":
        return parseNumericPattern(numericPatterns.week, dateString);
      case "Io":
        return match2.ordinalNumber(dateString, { unit: "week" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(_date, value) {
    return value >= 1 && value <= 53;
  }
  set(date, _flags, value) {
    return startOfISOWeek(setISOWeek(date, value));
  }
  incompatibleTokens = [
    "y",
    "Y",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "w",
    "d",
    "D",
    "e",
    "c",
    "t",
    "T"
  ];
};

// node_modules/date-fns/parse/_lib/parsers/DateParser.js
var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var DAYS_IN_MONTH_LEAP_YEAR = [
  31,
  29,
  31,
  30,
  31,
  30,
  31,
  31,
  30,
  31,
  30,
  31
];
var DateParser = class extends Parser {
  priority = 90;
  subPriority = 1;
  parse(dateString, token, match2) {
    switch (token) {
      case "d":
        return parseNumericPattern(numericPatterns.date, dateString);
      case "do":
        return match2.ordinalNumber(dateString, { unit: "date" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(date, value) {
    const year = date.getFullYear();
    const isLeapYear = isLeapYearIndex(year);
    const month = date.getMonth();
    if (isLeapYear) {
      return value >= 1 && value <= DAYS_IN_MONTH_LEAP_YEAR[month];
    } else {
      return value >= 1 && value <= DAYS_IN_MONTH[month];
    }
  }
  set(date, _flags, value) {
    date.setDate(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "Q",
    "w",
    "I",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T"
  ];
};

// node_modules/date-fns/parse/_lib/parsers/DayOfYearParser.js
var DayOfYearParser = class extends Parser {
  priority = 90;
  subpriority = 1;
  parse(dateString, token, match2) {
    switch (token) {
      case "D":
      case "DD":
        return parseNumericPattern(numericPatterns.dayOfYear, dateString);
      case "Do":
        return match2.ordinalNumber(dateString, { unit: "date" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(date, value) {
    const year = date.getFullYear();
    const isLeapYear = isLeapYearIndex(year);
    if (isLeapYear) {
      return value >= 1 && value <= 366;
    } else {
      return value >= 1 && value <= 365;
    }
  }
  set(date, _flags, value) {
    date.setMonth(0, value);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "Q",
    "M",
    "L",
    "w",
    "I",
    "d",
    "E",
    "i",
    "e",
    "c",
    "t",
    "T"
  ];
};

// node_modules/date-fns/setDay.js
function setDay(date, day, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const date_ = toDate(date, options?.in);
  const currentDay = date_.getDay();
  const remainder = day % 7;
  const dayIndex = (remainder + 7) % 7;
  const delta = 7 - weekStartsOn;
  const diff = day < 0 || day > 6 ? day - (currentDay + delta) % 7 : (dayIndex + delta) % 7 - (currentDay + delta) % 7;
  return addDays(date_, diff, options);
}

// node_modules/date-fns/parse/_lib/parsers/DayParser.js
var DayParser = class extends Parser {
  priority = 90;
  parse(dateString, token, match2) {
    switch (token) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return match2.day(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
      // T
      case "EEEEE":
        return match2.day(dateString, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "EEEEEE":
        return match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
      // Tuesday
      case "EEEE":
      default:
        return match2.day(dateString, { width: "wide", context: "formatting" }) || match2.day(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
    }
  }
  validate(_date, value) {
    return value >= 0 && value <= 6;
  }
  set(date, _flags, value, options) {
    date = setDay(date, value, options);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = ["D", "i", "e", "c", "t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/LocalDayParser.js
var LocalDayParser = class extends Parser {
  priority = 90;
  parse(dateString, token, match2, options) {
    const valueCallback = (value) => {
      const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
      return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
    };
    switch (token) {
      // 3
      case "e":
      case "ee":
        return mapValue(parseNDigits(token.length, dateString), valueCallback);
      // 3rd
      case "eo":
        return mapValue(
          match2.ordinalNumber(dateString, {
            unit: "day"
          }),
          valueCallback
        );
      // Tue
      case "eee":
        return match2.day(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
      // T
      case "eeeee":
        return match2.day(dateString, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "eeeeee":
        return match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
      // Tuesday
      case "eeee":
      default:
        return match2.day(dateString, { width: "wide", context: "formatting" }) || match2.day(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
    }
  }
  validate(_date, value) {
    return value >= 0 && value <= 6;
  }
  set(date, _flags, value, options) {
    date = setDay(date, value, options);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = [
    "y",
    "R",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "I",
    "d",
    "D",
    "E",
    "i",
    "c",
    "t",
    "T"
  ];
};

// node_modules/date-fns/parse/_lib/parsers/StandAloneLocalDayParser.js
var StandAloneLocalDayParser = class extends Parser {
  priority = 90;
  parse(dateString, token, match2, options) {
    const valueCallback = (value) => {
      const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
      return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
    };
    switch (token) {
      // 3
      case "c":
      case "cc":
        return mapValue(parseNDigits(token.length, dateString), valueCallback);
      // 3rd
      case "co":
        return mapValue(
          match2.ordinalNumber(dateString, {
            unit: "day"
          }),
          valueCallback
        );
      // Tue
      case "ccc":
        return match2.day(dateString, {
          width: "abbreviated",
          context: "standalone"
        }) || match2.day(dateString, { width: "short", context: "standalone" }) || match2.day(dateString, { width: "narrow", context: "standalone" });
      // T
      case "ccccc":
        return match2.day(dateString, {
          width: "narrow",
          context: "standalone"
        });
      // Tu
      case "cccccc":
        return match2.day(dateString, { width: "short", context: "standalone" }) || match2.day(dateString, { width: "narrow", context: "standalone" });
      // Tuesday
      case "cccc":
      default:
        return match2.day(dateString, { width: "wide", context: "standalone" }) || match2.day(dateString, {
          width: "abbreviated",
          context: "standalone"
        }) || match2.day(dateString, { width: "short", context: "standalone" }) || match2.day(dateString, { width: "narrow", context: "standalone" });
    }
  }
  validate(_date, value) {
    return value >= 0 && value <= 6;
  }
  set(date, _flags, value, options) {
    date = setDay(date, value, options);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = [
    "y",
    "R",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "I",
    "d",
    "D",
    "E",
    "i",
    "e",
    "t",
    "T"
  ];
};

// node_modules/date-fns/setISODay.js
function setISODay(date, day, options) {
  const date_ = toDate(date, options?.in);
  const currentDay = getISODay(date_, options);
  const diff = day - currentDay;
  return addDays(date_, diff, options);
}

// node_modules/date-fns/parse/_lib/parsers/ISODayParser.js
var ISODayParser = class extends Parser {
  priority = 90;
  parse(dateString, token, match2) {
    const valueCallback = (value) => {
      if (value === 0) {
        return 7;
      }
      return value;
    };
    switch (token) {
      // 2
      case "i":
      case "ii":
        return parseNDigits(token.length, dateString);
      // 2nd
      case "io":
        return match2.ordinalNumber(dateString, { unit: "day" });
      // Tue
      case "iii":
        return mapValue(
          match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          }),
          valueCallback
        );
      // T
      case "iiiii":
        return mapValue(
          match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          }),
          valueCallback
        );
      // Tu
      case "iiiiii":
        return mapValue(
          match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          }),
          valueCallback
        );
      // Tuesday
      case "iiii":
      default:
        return mapValue(
          match2.day(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "short",
            context: "formatting"
          }) || match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          }),
          valueCallback
        );
    }
  }
  validate(_date, value) {
    return value >= 1 && value <= 7;
  }
  set(date, _flags, value) {
    date = setISODay(date, value);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  incompatibleTokens = [
    "y",
    "Y",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "w",
    "d",
    "D",
    "E",
    "e",
    "c",
    "t",
    "T"
  ];
};

// node_modules/date-fns/parse/_lib/parsers/AMPMParser.js
var AMPMParser = class extends Parser {
  priority = 80;
  parse(dateString, token, match2) {
    switch (token) {
      case "a":
      case "aa":
      case "aaa":
        return match2.dayPeriod(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaaa":
        return match2.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return match2.dayPeriod(dateString, {
          width: "wide",
          context: "formatting"
        }) || match2.dayPeriod(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting"
        });
    }
  }
  set(date, _flags, value) {
    date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
    return date;
  }
  incompatibleTokens = ["b", "B", "H", "k", "t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/AMPMMidnightParser.js
var AMPMMidnightParser = class extends Parser {
  priority = 80;
  parse(dateString, token, match2) {
    switch (token) {
      case "b":
      case "bb":
      case "bbb":
        return match2.dayPeriod(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbbb":
        return match2.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return match2.dayPeriod(dateString, {
          width: "wide",
          context: "formatting"
        }) || match2.dayPeriod(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting"
        });
    }
  }
  set(date, _flags, value) {
    date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
    return date;
  }
  incompatibleTokens = ["a", "B", "H", "k", "t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/DayPeriodParser.js
var DayPeriodParser = class extends Parser {
  priority = 80;
  parse(dateString, token, match2) {
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return match2.dayPeriod(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBBB":
        return match2.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return match2.dayPeriod(dateString, {
          width: "wide",
          context: "formatting"
        }) || match2.dayPeriod(dateString, {
          width: "abbreviated",
          context: "formatting"
        }) || match2.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting"
        });
    }
  }
  set(date, _flags, value) {
    date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
    return date;
  }
  incompatibleTokens = ["a", "b", "t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/Hour1to12Parser.js
var Hour1to12Parser = class extends Parser {
  priority = 70;
  parse(dateString, token, match2) {
    switch (token) {
      case "h":
        return parseNumericPattern(numericPatterns.hour12h, dateString);
      case "ho":
        return match2.ordinalNumber(dateString, { unit: "hour" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(_date, value) {
    return value >= 1 && value <= 12;
  }
  set(date, _flags, value) {
    const isPM = date.getHours() >= 12;
    if (isPM && value < 12) {
      date.setHours(value + 12, 0, 0, 0);
    } else if (!isPM && value === 12) {
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(value, 0, 0, 0);
    }
    return date;
  }
  incompatibleTokens = ["H", "K", "k", "t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/Hour0to23Parser.js
var Hour0to23Parser = class extends Parser {
  priority = 70;
  parse(dateString, token, match2) {
    switch (token) {
      case "H":
        return parseNumericPattern(numericPatterns.hour23h, dateString);
      case "Ho":
        return match2.ordinalNumber(dateString, { unit: "hour" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(_date, value) {
    return value >= 0 && value <= 23;
  }
  set(date, _flags, value) {
    date.setHours(value, 0, 0, 0);
    return date;
  }
  incompatibleTokens = ["a", "b", "h", "K", "k", "t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/Hour0To11Parser.js
var Hour0To11Parser = class extends Parser {
  priority = 70;
  parse(dateString, token, match2) {
    switch (token) {
      case "K":
        return parseNumericPattern(numericPatterns.hour11h, dateString);
      case "Ko":
        return match2.ordinalNumber(dateString, { unit: "hour" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(_date, value) {
    return value >= 0 && value <= 11;
  }
  set(date, _flags, value) {
    const isPM = date.getHours() >= 12;
    if (isPM && value < 12) {
      date.setHours(value + 12, 0, 0, 0);
    } else {
      date.setHours(value, 0, 0, 0);
    }
    return date;
  }
  incompatibleTokens = ["h", "H", "k", "t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/Hour1To24Parser.js
var Hour1To24Parser = class extends Parser {
  priority = 70;
  parse(dateString, token, match2) {
    switch (token) {
      case "k":
        return parseNumericPattern(numericPatterns.hour24h, dateString);
      case "ko":
        return match2.ordinalNumber(dateString, { unit: "hour" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(_date, value) {
    return value >= 1 && value <= 24;
  }
  set(date, _flags, value) {
    const hours = value <= 24 ? value % 24 : value;
    date.setHours(hours, 0, 0, 0);
    return date;
  }
  incompatibleTokens = ["a", "b", "h", "H", "K", "t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/MinuteParser.js
var MinuteParser = class extends Parser {
  priority = 60;
  parse(dateString, token, match2) {
    switch (token) {
      case "m":
        return parseNumericPattern(numericPatterns.minute, dateString);
      case "mo":
        return match2.ordinalNumber(dateString, { unit: "minute" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(_date, value) {
    return value >= 0 && value <= 59;
  }
  set(date, _flags, value) {
    date.setMinutes(value, 0, 0);
    return date;
  }
  incompatibleTokens = ["t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/SecondParser.js
var SecondParser = class extends Parser {
  priority = 50;
  parse(dateString, token, match2) {
    switch (token) {
      case "s":
        return parseNumericPattern(numericPatterns.second, dateString);
      case "so":
        return match2.ordinalNumber(dateString, { unit: "second" });
      default:
        return parseNDigits(token.length, dateString);
    }
  }
  validate(_date, value) {
    return value >= 0 && value <= 59;
  }
  set(date, _flags, value) {
    date.setSeconds(value, 0);
    return date;
  }
  incompatibleTokens = ["t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/FractionOfSecondParser.js
var FractionOfSecondParser = class extends Parser {
  priority = 30;
  parse(dateString, token) {
    const valueCallback = (value) => Math.trunc(value * Math.pow(10, -token.length + 3));
    return mapValue(parseNDigits(token.length, dateString), valueCallback);
  }
  set(date, _flags, value) {
    date.setMilliseconds(value);
    return date;
  }
  incompatibleTokens = ["t", "T"];
};

// node_modules/date-fns/parse/_lib/parsers/ISOTimezoneWithZParser.js
var ISOTimezoneWithZParser = class extends Parser {
  priority = 10;
  parse(dateString, token) {
    switch (token) {
      case "X":
        return parseTimezonePattern(
          timezonePatterns.basicOptionalMinutes,
          dateString
        );
      case "XX":
        return parseTimezonePattern(timezonePatterns.basic, dateString);
      case "XXXX":
        return parseTimezonePattern(
          timezonePatterns.basicOptionalSeconds,
          dateString
        );
      case "XXXXX":
        return parseTimezonePattern(
          timezonePatterns.extendedOptionalSeconds,
          dateString
        );
      case "XXX":
      default:
        return parseTimezonePattern(timezonePatterns.extended, dateString);
    }
  }
  set(date, flags, value) {
    if (flags.timestampIsSet) return date;
    return constructFrom(
      date,
      date.getTime() - getTimezoneOffsetInMilliseconds(date) - value
    );
  }
  incompatibleTokens = ["t", "T", "x"];
};

// node_modules/date-fns/parse/_lib/parsers/ISOTimezoneParser.js
var ISOTimezoneParser = class extends Parser {
  priority = 10;
  parse(dateString, token) {
    switch (token) {
      case "x":
        return parseTimezonePattern(
          timezonePatterns.basicOptionalMinutes,
          dateString
        );
      case "xx":
        return parseTimezonePattern(timezonePatterns.basic, dateString);
      case "xxxx":
        return parseTimezonePattern(
          timezonePatterns.basicOptionalSeconds,
          dateString
        );
      case "xxxxx":
        return parseTimezonePattern(
          timezonePatterns.extendedOptionalSeconds,
          dateString
        );
      case "xxx":
      default:
        return parseTimezonePattern(timezonePatterns.extended, dateString);
    }
  }
  set(date, flags, value) {
    if (flags.timestampIsSet) return date;
    return constructFrom(
      date,
      date.getTime() - getTimezoneOffsetInMilliseconds(date) - value
    );
  }
  incompatibleTokens = ["t", "T", "X"];
};

// node_modules/date-fns/parse/_lib/parsers/TimestampSecondsParser.js
var TimestampSecondsParser = class extends Parser {
  priority = 40;
  parse(dateString) {
    return parseAnyDigitsSigned(dateString);
  }
  set(date, _flags, value) {
    return [constructFrom(date, value * 1e3), { timestampIsSet: true }];
  }
  incompatibleTokens = "*";
};

// node_modules/date-fns/parse/_lib/parsers/TimestampMillisecondsParser.js
var TimestampMillisecondsParser = class extends Parser {
  priority = 20;
  parse(dateString) {
    return parseAnyDigitsSigned(dateString);
  }
  set(date, _flags, value) {
    return [constructFrom(date, value), { timestampIsSet: true }];
  }
  incompatibleTokens = "*";
};

// node_modules/date-fns/parse/_lib/parsers.js
var parsers = {
  G: new EraParser(),
  y: new YearParser(),
  Y: new LocalWeekYearParser(),
  R: new ISOWeekYearParser(),
  u: new ExtendedYearParser(),
  Q: new QuarterParser(),
  q: new StandAloneQuarterParser(),
  M: new MonthParser(),
  L: new StandAloneMonthParser(),
  w: new LocalWeekParser(),
  I: new ISOWeekParser(),
  d: new DateParser(),
  D: new DayOfYearParser(),
  E: new DayParser(),
  e: new LocalDayParser(),
  c: new StandAloneLocalDayParser(),
  i: new ISODayParser(),
  a: new AMPMParser(),
  b: new AMPMMidnightParser(),
  B: new DayPeriodParser(),
  h: new Hour1to12Parser(),
  H: new Hour0to23Parser(),
  K: new Hour0To11Parser(),
  k: new Hour1To24Parser(),
  m: new MinuteParser(),
  s: new SecondParser(),
  S: new FractionOfSecondParser(),
  X: new ISOTimezoneWithZParser(),
  x: new ISOTimezoneParser(),
  t: new TimestampSecondsParser(),
  T: new TimestampMillisecondsParser()
};

// node_modules/date-fns/parse.js
var formattingTokensRegExp2 = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp2 = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp2 = /^'([^]*?)'?$/;
var doubleQuoteRegExp2 = /''/g;
var notWhitespaceRegExp = /\S/;
var unescapedLatinCharacterRegExp2 = /[a-zA-Z]/;
function parse(dateStr, formatStr, referenceDate, options) {
  const invalidDate = () => constructFrom(options?.in || referenceDate, NaN);
  const defaultOptions2 = getDefaultOptions2();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  if (!formatStr)
    return dateStr ? invalidDate() : toDate(referenceDate, options?.in);
  const subFnOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale
  };
  const setters = [new DateTimezoneSetter(options?.in, referenceDate)];
  const tokens = formatStr.match(longFormattingTokensRegExp2).map((substring) => {
    const firstCharacter = substring[0];
    if (firstCharacter in longFormatters) {
      const longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp2);
  const usedTokens = [];
  for (let token of tokens) {
    if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token)) {
      warnOrThrowProtectedError(token, formatStr, dateStr);
    }
    if (!options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
      warnOrThrowProtectedError(token, formatStr, dateStr);
    }
    const firstCharacter = token[0];
    const parser = parsers[firstCharacter];
    if (parser) {
      const { incompatibleTokens } = parser;
      if (Array.isArray(incompatibleTokens)) {
        const incompatibleToken = usedTokens.find(
          (usedToken) => incompatibleTokens.includes(usedToken.token) || usedToken.token === firstCharacter
        );
        if (incompatibleToken) {
          throw new RangeError(
            `The format string mustn't contain \`${incompatibleToken.fullToken}\` and \`${token}\` at the same time`
          );
        }
      } else if (parser.incompatibleTokens === "*" && usedTokens.length > 0) {
        throw new RangeError(
          `The format string mustn't contain \`${token}\` and any other token at the same time`
        );
      }
      usedTokens.push({ token: firstCharacter, fullToken: token });
      const parseResult = parser.run(
        dateStr,
        token,
        locale.match,
        subFnOptions
      );
      if (!parseResult) {
        return invalidDate();
      }
      setters.push(parseResult.setter);
      dateStr = parseResult.rest;
    } else {
      if (firstCharacter.match(unescapedLatinCharacterRegExp2)) {
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
        );
      }
      if (token === "''") {
        token = "'";
      } else if (firstCharacter === "'") {
        token = cleanEscapedString2(token);
      }
      if (dateStr.indexOf(token) === 0) {
        dateStr = dateStr.slice(token.length);
      } else {
        return invalidDate();
      }
    }
  }
  if (dateStr.length > 0 && notWhitespaceRegExp.test(dateStr)) {
    return invalidDate();
  }
  const uniquePrioritySetters = setters.map((setter) => setter.priority).sort((a2, b2) => b2 - a2).filter((priority, index, array) => array.indexOf(priority) === index).map(
    (priority) => setters.filter((setter) => setter.priority === priority).sort((a2, b2) => b2.subPriority - a2.subPriority)
  ).map((setterArray) => setterArray[0]);
  let date = toDate(referenceDate, options?.in);
  if (isNaN(+date)) return invalidDate();
  const flags = {};
  for (const setter of uniquePrioritySetters) {
    if (!setter.validate(date, subFnOptions)) {
      return invalidDate();
    }
    const result = setter.set(date, flags, subFnOptions);
    if (Array.isArray(result)) {
      date = result[0];
      Object.assign(flags, result[1]);
    } else {
      date = result;
    }
  }
  return date;
}
function cleanEscapedString2(input) {
  return input.match(escapedStringRegExp2)[1].replace(doubleQuoteRegExp2, "'");
}

// node_modules/date-fns/isSameMonth.js
function isSameMonth(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  return laterDate_.getFullYear() === earlierDate_.getFullYear() && laterDate_.getMonth() === earlierDate_.getMonth();
}

// node_modules/date-fns/isSameYear.js
function isSameYear(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  return laterDate_.getFullYear() === earlierDate_.getFullYear();
}

// node_modules/date-fns/subDays.js
function subDays(date, amount, options) {
  return addDays(date, -amount, options);
}

// node_modules/date-fns/parseISO.js
function parseISO(argument, options) {
  const invalidDate = () => constructFrom(options?.in, NaN);
  const additionalDigits = options?.additionalDigits ?? 2;
  const dateStrings = splitDateString(argument);
  let date;
  if (dateStrings.date) {
    const parseYearResult = parseYear(dateStrings.date, additionalDigits);
    date = parseDate(parseYearResult.restDateString, parseYearResult.year);
  }
  if (!date || isNaN(+date)) return invalidDate();
  const timestamp = +date;
  let time = 0;
  let offset;
  if (dateStrings.time) {
    time = parseTime(dateStrings.time);
    if (isNaN(time)) return invalidDate();
  }
  if (dateStrings.timezone) {
    offset = parseTimezone(dateStrings.timezone);
    if (isNaN(offset)) return invalidDate();
  } else {
    const tmpDate = new Date(timestamp + time);
    const result = toDate(0, options?.in);
    result.setFullYear(
      tmpDate.getUTCFullYear(),
      tmpDate.getUTCMonth(),
      tmpDate.getUTCDate()
    );
    result.setHours(
      tmpDate.getUTCHours(),
      tmpDate.getUTCMinutes(),
      tmpDate.getUTCSeconds(),
      tmpDate.getUTCMilliseconds()
    );
    return result;
  }
  return toDate(timestamp + time + offset, options?.in);
}
var patterns = {
  dateTimeDelimiter: /[T ]/,
  timeZoneDelimiter: /[Z ]/i,
  timezone: /([Z+-].*)$/
};
var dateRegex = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/;
var timeRegex = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/;
var timezoneRegex = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function splitDateString(dateString) {
  const dateStrings = {};
  const array = dateString.split(patterns.dateTimeDelimiter);
  let timeString;
  if (array.length > 2) {
    return dateStrings;
  }
  if (/:/.test(array[0])) {
    timeString = array[0];
  } else {
    dateStrings.date = array[0];
    timeString = array[1];
    if (patterns.timeZoneDelimiter.test(dateStrings.date)) {
      dateStrings.date = dateString.split(patterns.timeZoneDelimiter)[0];
      timeString = dateString.substr(
        dateStrings.date.length,
        dateString.length
      );
    }
  }
  if (timeString) {
    const token = patterns.timezone.exec(timeString);
    if (token) {
      dateStrings.time = timeString.replace(token[1], "");
      dateStrings.timezone = token[1];
    } else {
      dateStrings.time = timeString;
    }
  }
  return dateStrings;
}
function parseYear(dateString, additionalDigits) {
  const regex = new RegExp(
    "^(?:(\\d{4}|[+-]\\d{" + (4 + additionalDigits) + "})|(\\d{2}|[+-]\\d{" + (2 + additionalDigits) + "})$)"
  );
  const captures = dateString.match(regex);
  if (!captures) return { year: NaN, restDateString: "" };
  const year = captures[1] ? parseInt(captures[1]) : null;
  const century = captures[2] ? parseInt(captures[2]) : null;
  return {
    year: century === null ? year : century * 100,
    restDateString: dateString.slice((captures[1] || captures[2]).length)
  };
}
function parseDate(dateString, year) {
  if (year === null) return /* @__PURE__ */ new Date(NaN);
  const captures = dateString.match(dateRegex);
  if (!captures) return /* @__PURE__ */ new Date(NaN);
  const isWeekDate = !!captures[4];
  const dayOfYear = parseDateUnit(captures[1]);
  const month = parseDateUnit(captures[2]) - 1;
  const day = parseDateUnit(captures[3]);
  const week = parseDateUnit(captures[4]);
  const dayOfWeek = parseDateUnit(captures[5]) - 1;
  if (isWeekDate) {
    if (!validateWeekDate(year, week, dayOfWeek)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    return dayOfISOWeekYear(year, week, dayOfWeek);
  } else {
    const date = /* @__PURE__ */ new Date(0);
    if (!validateDate(year, month, day) || !validateDayOfYearDate(year, dayOfYear)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    date.setUTCFullYear(year, month, Math.max(dayOfYear, day));
    return date;
  }
}
function parseDateUnit(value) {
  return value ? parseInt(value) : 1;
}
function parseTime(timeString) {
  const captures = timeString.match(timeRegex);
  if (!captures) return NaN;
  const hours = parseTimeUnit(captures[1]);
  const minutes = parseTimeUnit(captures[2]);
  const seconds = parseTimeUnit(captures[3]);
  if (!validateTime(hours, minutes, seconds)) {
    return NaN;
  }
  return hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * 1e3;
}
function parseTimeUnit(value) {
  return value && parseFloat(value.replace(",", ".")) || 0;
}
function parseTimezone(timezoneString) {
  if (timezoneString === "Z") return 0;
  const captures = timezoneString.match(timezoneRegex);
  if (!captures) return 0;
  const sign = captures[1] === "+" ? -1 : 1;
  const hours = parseInt(captures[2]);
  const minutes = captures[3] && parseInt(captures[3]) || 0;
  if (!validateTimezone(hours, minutes)) {
    return NaN;
  }
  return sign * (hours * millisecondsInHour + minutes * millisecondsInMinute);
}
function dayOfISOWeekYear(isoWeekYear, week, day) {
  const date = /* @__PURE__ */ new Date(0);
  date.setUTCFullYear(isoWeekYear, 0, 4);
  const fourthOfJanuaryDay = date.getUTCDay() || 7;
  const diff = (week - 1) * 7 + day + 1 - fourthOfJanuaryDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}
var daysInMonths = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isLeapYearIndex2(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}
function validateDate(year, month, date) {
  return month >= 0 && month <= 11 && date >= 1 && date <= (daysInMonths[month] || (isLeapYearIndex2(year) ? 29 : 28));
}
function validateDayOfYearDate(year, dayOfYear) {
  return dayOfYear >= 1 && dayOfYear <= (isLeapYearIndex2(year) ? 366 : 365);
}
function validateWeekDate(_year, week, day) {
  return week >= 1 && week <= 53 && day >= 0 && day <= 6;
}
function validateTime(hours, minutes, seconds) {
  if (hours === 24) {
    return minutes === 0 && seconds === 0;
  }
  return seconds >= 0 && seconds < 60 && minutes >= 0 && minutes < 60 && hours >= 0 && hours < 25;
}
function validateTimezone(_hours, minutes) {
  return minutes >= 0 && minutes <= 59;
}

// node_modules/date-fns/setMonth.js
function setMonth(date, month, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();
  const day = _date.getDate();
  const midMonth = constructFrom(options?.in || date, 0);
  midMonth.setFullYear(year, month, 15);
  midMonth.setHours(0, 0, 0, 0);
  const daysInMonth = getDaysInMonth(midMonth);
  _date.setMonth(month, Math.min(day, daysInMonth));
  return _date;
}

// node_modules/date-fns/setYear.js
function setYear(date, year, options) {
  const date_ = toDate(date, options?.in);
  if (isNaN(+date_)) return constructFrom(options?.in || date, NaN);
  date_.setFullYear(year);
  return date_;
}

// node_modules/date-fns/subMonths.js
function subMonths(date, amount, options) {
  return addMonths(date, -amount, options);
}

// node_modules/date-fns/subWeeks.js
function subWeeks(date, amount, options) {
  return addWeeks(date, -amount, options);
}

// node_modules/date-fns/subYears.js
function subYears(date, amount, options) {
  return addYears(date, -amount, options);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getBroadcastWeeksInMonth.js
var FIVE_WEEKS = 5;
var FOUR_WEEKS = 4;
function getBroadcastWeeksInMonth(month, dateLib) {
  const firstDayOfMonth = dateLib.startOfMonth(month);
  const firstDayOfWeek = firstDayOfMonth.getDay() > 0 ? firstDayOfMonth.getDay() : 7;
  const broadcastStartDate = dateLib.addDays(month, -firstDayOfWeek + 1);
  const lastDateOfLastWeek = dateLib.addDays(broadcastStartDate, FIVE_WEEKS * 7 - 1);
  const numberOfWeeks = dateLib.getMonth(month) === dateLib.getMonth(lastDateOfLastWeek) ? FIVE_WEEKS : FOUR_WEEKS;
  return numberOfWeeks;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/startOfBroadcastWeek.js
function startOfBroadcastWeek(date, dateLib) {
  const firstOfMonth = dateLib.startOfMonth(date);
  const dayOfWeek = firstOfMonth.getDay();
  if (dayOfWeek === 1) {
    return firstOfMonth;
  } else if (dayOfWeek === 0) {
    return dateLib.addDays(firstOfMonth, -1 * 6);
  } else {
    return dateLib.addDays(firstOfMonth, -1 * (dayOfWeek - 1));
  }
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/endOfBroadcastWeek.js
function endOfBroadcastWeek(date, dateLib) {
  const startDate = startOfBroadcastWeek(date, dateLib);
  const numberOfWeeks = getBroadcastWeeksInMonth(date, dateLib);
  const endDate = dateLib.addDays(startDate, numberOfWeeks * 7 - 1);
  return endDate;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/locale/en-US.js
var enUS2 = {
  ...enUS,
  labels: {
    labelDayButton: (date, modifiers, options, dateLib) => {
      let formatDate2;
      if (dateLib && typeof dateLib.format === "function") {
        formatDate2 = dateLib.format.bind(dateLib);
      } else {
        formatDate2 = (d2, pattern) => format(d2, pattern, { locale: enUS, ...options });
      }
      let label = formatDate2(date, "PPPP");
      if (modifiers.today)
        label = `Today, ${label}`;
      if (modifiers.selected)
        label = `${label}, selected`;
      return label;
    },
    labelMonthDropdown: "Choose the Month",
    labelNext: "Go to the Next Month",
    labelPrevious: "Go to the Previous Month",
    labelWeekNumber: (weekNumber) => `Week ${weekNumber}`,
    labelYearDropdown: "Choose the Year",
    labelGrid: (date, options, dateLib) => {
      let formatDate2;
      if (dateLib && typeof dateLib.format === "function") {
        formatDate2 = dateLib.format.bind(dateLib);
      } else {
        formatDate2 = (d2, pattern) => format(d2, pattern, { locale: enUS, ...options });
      }
      return formatDate2(date, "LLLL yyyy");
    },
    labelGridcell: (date, modifiers, options, dateLib) => {
      let formatDate2;
      if (dateLib && typeof dateLib.format === "function") {
        formatDate2 = dateLib.format.bind(dateLib);
      } else {
        formatDate2 = (d2, pattern) => format(d2, pattern, { locale: enUS, ...options });
      }
      let label = formatDate2(date, "PPPP");
      if (modifiers?.today) {
        label = `Today, ${label}`;
      }
      return label;
    },
    labelNav: "Navigation bar",
    labelWeekNumberHeader: "Week Number",
    labelWeekday: (date, options, dateLib) => {
      let formatDate2;
      if (dateLib && typeof dateLib.format === "function") {
        formatDate2 = dateLib.format.bind(dateLib);
      } else {
        formatDate2 = (d2, pattern) => format(d2, pattern, { locale: enUS, ...options });
      }
      return formatDate2(date, "cccc");
    }
  }
};

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/classes/DateLib.js
var DateLib = class _DateLib {
  /**
   * Creates an instance of `DateLib`.
   *
   * @param options Configuration options for the date library.
   * @param overrides Custom overrides for the date library functions.
   */
  constructor(options, overrides) {
    this.today = () => {
      if (this.overrides?.today) {
        return this.overrides.today();
      }
      if (this.options.timeZone) {
        return TZDate.tz(this.options.timeZone);
      }
      const DateCtor = this.options.Date ?? Date;
      return new DateCtor();
    };
    this.newDate = (year, monthIndex, date) => {
      if (this.overrides?.newDate) {
        return this.overrides.newDate(year, monthIndex, date);
      }
      if (this.options.timeZone) {
        return new TZDate(year, monthIndex, date, this.options.timeZone);
      }
      return new Date(year, monthIndex, date);
    };
    this.addDays = (date, amount) => {
      return this.overrides?.addDays ? this.overrides.addDays(date, amount) : addDays(date, amount);
    };
    this.addMonths = (date, amount) => {
      return this.overrides?.addMonths ? this.overrides.addMonths(date, amount) : addMonths(date, amount);
    };
    this.addWeeks = (date, amount) => {
      return this.overrides?.addWeeks ? this.overrides.addWeeks(date, amount) : addWeeks(date, amount);
    };
    this.addYears = (date, amount) => {
      return this.overrides?.addYears ? this.overrides.addYears(date, amount) : addYears(date, amount);
    };
    this.differenceInCalendarDays = (dateLeft, dateRight) => {
      return this.overrides?.differenceInCalendarDays ? this.overrides.differenceInCalendarDays(dateLeft, dateRight) : differenceInCalendarDays(dateLeft, dateRight);
    };
    this.differenceInCalendarMonths = (dateLeft, dateRight) => {
      return this.overrides?.differenceInCalendarMonths ? this.overrides.differenceInCalendarMonths(dateLeft, dateRight) : differenceInCalendarMonths(dateLeft, dateRight);
    };
    this.eachMonthOfInterval = (interval) => {
      return this.overrides?.eachMonthOfInterval ? this.overrides.eachMonthOfInterval(interval) : eachMonthOfInterval(interval);
    };
    this.eachYearOfInterval = (interval) => {
      const years = this.overrides?.eachYearOfInterval ? this.overrides.eachYearOfInterval(interval) : eachYearOfInterval(interval);
      const uniqueYears = new Set(years.map((d2) => this.getYear(d2)));
      if (uniqueYears.size === years.length) {
        return years;
      }
      const yearsArray = [];
      uniqueYears.forEach((y2) => {
        yearsArray.push(new Date(y2, 0, 1));
      });
      return yearsArray;
    };
    this.endOfBroadcastWeek = (date) => {
      return this.overrides?.endOfBroadcastWeek ? this.overrides.endOfBroadcastWeek(date) : endOfBroadcastWeek(date, this);
    };
    this.endOfISOWeek = (date) => {
      return this.overrides?.endOfISOWeek ? this.overrides.endOfISOWeek(date) : endOfISOWeek(date);
    };
    this.endOfMonth = (date) => {
      return this.overrides?.endOfMonth ? this.overrides.endOfMonth(date) : endOfMonth(date);
    };
    this.endOfWeek = (date, options2) => {
      return this.overrides?.endOfWeek ? this.overrides.endOfWeek(date, options2) : endOfWeek(date, this.options);
    };
    this.endOfYear = (date) => {
      return this.overrides?.endOfYear ? this.overrides.endOfYear(date) : endOfYear(date);
    };
    this.format = (date, formatStr, _options) => {
      const formatted = this.overrides?.format ? this.overrides.format(date, formatStr, this.options) : format(date, formatStr, this.options);
      if (this.options.numerals && this.options.numerals !== "latn") {
        return this.replaceDigits(formatted);
      }
      return formatted;
    };
    this.getISOWeek = (date) => {
      return this.overrides?.getISOWeek ? this.overrides.getISOWeek(date) : getISOWeek(date);
    };
    this.getMonth = (date, _options) => {
      return this.overrides?.getMonth ? this.overrides.getMonth(date, this.options) : getMonth(date, this.options);
    };
    this.getYear = (date, _options) => {
      return this.overrides?.getYear ? this.overrides.getYear(date, this.options) : getYear(date, this.options);
    };
    this.getWeek = (date, _options) => {
      return this.overrides?.getWeek ? this.overrides.getWeek(date, this.options) : getWeek(date, this.options);
    };
    this.isAfter = (date, dateToCompare) => {
      return this.overrides?.isAfter ? this.overrides.isAfter(date, dateToCompare) : isAfter(date, dateToCompare);
    };
    this.isBefore = (date, dateToCompare) => {
      return this.overrides?.isBefore ? this.overrides.isBefore(date, dateToCompare) : isBefore(date, dateToCompare);
    };
    this.isDate = (value) => {
      return this.overrides?.isDate ? this.overrides.isDate(value) : isDate(value);
    };
    this.isSameDay = (dateLeft, dateRight) => {
      return this.overrides?.isSameDay ? this.overrides.isSameDay(dateLeft, dateRight) : isSameDay(dateLeft, dateRight);
    };
    this.isSameMonth = (dateLeft, dateRight) => {
      return this.overrides?.isSameMonth ? this.overrides.isSameMonth(dateLeft, dateRight) : isSameMonth(dateLeft, dateRight);
    };
    this.isSameYear = (dateLeft, dateRight) => {
      return this.overrides?.isSameYear ? this.overrides.isSameYear(dateLeft, dateRight) : isSameYear(dateLeft, dateRight);
    };
    this.max = (dates) => {
      return this.overrides?.max ? this.overrides.max(dates) : max(dates);
    };
    this.min = (dates) => {
      return this.overrides?.min ? this.overrides.min(dates) : min(dates);
    };
    this.setMonth = (date, month) => {
      return this.overrides?.setMonth ? this.overrides.setMonth(date, month) : setMonth(date, month);
    };
    this.setYear = (date, year) => {
      return this.overrides?.setYear ? this.overrides.setYear(date, year) : setYear(date, year);
    };
    this.startOfBroadcastWeek = (date, _dateLib) => {
      return this.overrides?.startOfBroadcastWeek ? this.overrides.startOfBroadcastWeek(date, this) : startOfBroadcastWeek(date, this);
    };
    this.startOfDay = (date) => {
      return this.overrides?.startOfDay ? this.overrides.startOfDay(date) : startOfDay(date);
    };
    this.startOfISOWeek = (date) => {
      return this.overrides?.startOfISOWeek ? this.overrides.startOfISOWeek(date) : startOfISOWeek(date);
    };
    this.startOfMonth = (date) => {
      return this.overrides?.startOfMonth ? this.overrides.startOfMonth(date) : startOfMonth(date);
    };
    this.startOfWeek = (date, _options) => {
      return this.overrides?.startOfWeek ? this.overrides.startOfWeek(date, this.options) : startOfWeek(date, this.options);
    };
    this.startOfYear = (date) => {
      return this.overrides?.startOfYear ? this.overrides.startOfYear(date) : startOfYear(date);
    };
    this.options = { locale: enUS2, ...options };
    this.overrides = overrides;
  }
  /**
   * Generates a mapping of Arabic digits (0-9) to the target numbering system
   * digits.
   *
   * @since 9.5.0
   * @returns A record mapping Arabic digits to the target numerals.
   */
  getDigitMap() {
    const { numerals = "latn" } = this.options;
    const formatter = new Intl.NumberFormat("en-US", {
      numberingSystem: numerals
    });
    const digitMap = {};
    for (let i2 = 0; i2 < 10; i2++) {
      digitMap[i2.toString()] = formatter.format(i2);
    }
    return digitMap;
  }
  /**
   * Replaces Arabic digits in a string with the target numbering system digits.
   *
   * @since 9.5.0
   * @param input The string containing Arabic digits.
   * @returns The string with digits replaced.
   */
  replaceDigits(input) {
    const digitMap = this.getDigitMap();
    return input.replace(/\d/g, (digit) => digitMap[digit] || digit);
  }
  /**
   * Formats a number using the configured numbering system.
   *
   * @since 9.5.0
   * @param value The number to format.
   * @returns The formatted number as a string.
   */
  formatNumber(value) {
    return this.replaceDigits(value.toString());
  }
  /**
   * Returns the preferred ordering for month and year labels for the current
   * locale.
   */
  getMonthYearOrder() {
    const code = this.options.locale?.code;
    if (!code) {
      return "month-first";
    }
    return _DateLib.yearFirstLocales.has(code) ? "year-first" : "month-first";
  }
  /**
   * Formats the month/year pair respecting locale conventions.
   *
   * @since 9.11.0
   */
  formatMonthYear(date) {
    const { locale, timeZone, numerals } = this.options;
    const localeCode = locale?.code;
    if (localeCode && _DateLib.yearFirstLocales.has(localeCode)) {
      try {
        const intl = new Intl.DateTimeFormat(localeCode, {
          month: "long",
          year: "numeric",
          timeZone,
          numberingSystem: numerals
        });
        const formatted = intl.format(date);
        return formatted;
      } catch {
      }
    }
    const pattern = this.getMonthYearOrder() === "year-first" ? "y LLLL" : "LLLL y";
    return this.format(date, pattern);
  }
};
DateLib.yearFirstLocales = /* @__PURE__ */ new Set([
  "eu",
  "hu",
  "ja",
  "ja-Hira",
  "ja-JP",
  "ko",
  "ko-KR",
  "lt",
  "lt-LT",
  "lv",
  "lv-LV",
  "mn",
  "mn-MN",
  "zh",
  "zh-CN",
  "zh-HK",
  "zh-TW"
]);
var defaultDateLib = new DateLib();

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/classes/CalendarDay.js
var CalendarDay = class {
  constructor(date, displayMonth, dateLib = defaultDateLib) {
    this.date = date;
    this.displayMonth = displayMonth;
    this.outside = Boolean(displayMonth && !dateLib.isSameMonth(date, displayMonth));
    this.dateLib = dateLib;
    this.isoDate = dateLib.format(date, "yyyy-MM-dd");
    this.displayMonthId = dateLib.format(displayMonth, "yyyy-MM");
    this.dateMonthId = dateLib.format(date, "yyyy-MM");
  }
  /**
   * Checks if this day is equal to another `CalendarDay`, considering both the
   * date and the displayed month.
   *
   * @param day The `CalendarDay` to compare with.
   * @returns `true` if the days are equal, otherwise `false`.
   */
  isEqualTo(day) {
    return this.dateLib.isSameDay(day.date, this.date) && this.dateLib.isSameMonth(day.displayMonth, this.displayMonth);
  }
};

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/classes/CalendarMonth.js
var CalendarMonth = class {
  constructor(month, weeks) {
    this.date = month;
    this.weeks = weeks;
  }
};

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/classes/CalendarWeek.js
var CalendarWeek = class {
  constructor(weekNumber, days) {
    this.days = days;
    this.weekNumber = weekNumber;
  }
};

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/custom-components.js
var custom_components_exports = {};
__export(custom_components_exports, {
  CaptionLabel: () => CaptionLabel,
  Chevron: () => Chevron,
  Day: () => Day,
  DayButton: () => DayButton,
  Dropdown: () => Dropdown,
  DropdownNav: () => DropdownNav,
  Footer: () => Footer,
  Month: () => Month,
  MonthCaption: () => MonthCaption,
  MonthGrid: () => MonthGrid,
  Months: () => Months,
  MonthsDropdown: () => MonthsDropdown,
  Nav: () => Nav,
  NextMonthButton: () => NextMonthButton,
  Option: () => Option,
  PreviousMonthButton: () => PreviousMonthButton,
  Root: () => Root,
  Select: () => Select,
  Week: () => Week,
  WeekNumber: () => WeekNumber,
  WeekNumberHeader: () => WeekNumberHeader,
  Weekday: () => Weekday,
  Weekdays: () => Weekdays,
  Weeks: () => Weeks,
  YearsDropdown: () => YearsDropdown
});

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/CaptionLabel.js
var import_react3 = __toESM(require_react(), 1);
function CaptionLabel(props) {
  return import_react3.default.createElement("span", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Chevron.js
var import_react4 = __toESM(require_react(), 1);
function Chevron(props) {
  const { size = 24, orientation = "left", className, style } = props;
  return import_react4.default.createElement(
    "svg",
    { className, style, width: size, height: size, viewBox: "0 0 24 24" },
    orientation === "up" && import_react4.default.createElement("polygon", { points: "6.77 17 12.5 11.43 18.24 17 20 15.28 12.5 8 5 15.28" }),
    orientation === "down" && import_react4.default.createElement("polygon", { points: "6.77 8 12.5 13.57 18.24 8 20 9.72 12.5 17 5 9.72" }),
    orientation === "left" && import_react4.default.createElement("polygon", { points: "16 18.112 9.81111111 12 16 5.87733333 14.0888889 4 6 12 14.0888889 20" }),
    orientation === "right" && import_react4.default.createElement("polygon", { points: "8 18.112 14.18888889 12 8 5.87733333 9.91111111 4 18 12 9.91111111 20" })
  );
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Day.js
var import_react5 = __toESM(require_react(), 1);
function Day(props) {
  const { day, modifiers, ...tdProps } = props;
  return import_react5.default.createElement("td", { ...tdProps });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/DayButton.js
var import_react6 = __toESM(require_react(), 1);
function DayButton(props) {
  const { day, modifiers, ...buttonProps } = props;
  const ref = import_react6.default.useRef(null);
  import_react6.default.useEffect(() => {
    if (modifiers.focused)
      ref.current?.focus();
  }, [modifiers.focused]);
  return import_react6.default.createElement("button", { ref, ...buttonProps });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Dropdown.js
var import_react8 = __toESM(require_react(), 1);

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/UI.js
var UI;
(function(UI2) {
  UI2["Root"] = "root";
  UI2["Chevron"] = "chevron";
  UI2["Day"] = "day";
  UI2["DayButton"] = "day_button";
  UI2["CaptionLabel"] = "caption_label";
  UI2["Dropdowns"] = "dropdowns";
  UI2["Dropdown"] = "dropdown";
  UI2["DropdownRoot"] = "dropdown_root";
  UI2["Footer"] = "footer";
  UI2["MonthGrid"] = "month_grid";
  UI2["MonthCaption"] = "month_caption";
  UI2["MonthsDropdown"] = "months_dropdown";
  UI2["Month"] = "month";
  UI2["Months"] = "months";
  UI2["Nav"] = "nav";
  UI2["NextMonthButton"] = "button_next";
  UI2["PreviousMonthButton"] = "button_previous";
  UI2["Week"] = "week";
  UI2["Weeks"] = "weeks";
  UI2["Weekday"] = "weekday";
  UI2["Weekdays"] = "weekdays";
  UI2["WeekNumber"] = "week_number";
  UI2["WeekNumberHeader"] = "week_number_header";
  UI2["YearsDropdown"] = "years_dropdown";
})(UI || (UI = {}));
var DayFlag;
(function(DayFlag2) {
  DayFlag2["disabled"] = "disabled";
  DayFlag2["hidden"] = "hidden";
  DayFlag2["outside"] = "outside";
  DayFlag2["focused"] = "focused";
  DayFlag2["today"] = "today";
})(DayFlag || (DayFlag = {}));
var SelectionState;
(function(SelectionState2) {
  SelectionState2["range_end"] = "range_end";
  SelectionState2["range_middle"] = "range_middle";
  SelectionState2["range_start"] = "range_start";
  SelectionState2["selected"] = "selected";
})(SelectionState || (SelectionState = {}));
var Animation;
(function(Animation2) {
  Animation2["weeks_before_enter"] = "weeks_before_enter";
  Animation2["weeks_before_exit"] = "weeks_before_exit";
  Animation2["weeks_after_enter"] = "weeks_after_enter";
  Animation2["weeks_after_exit"] = "weeks_after_exit";
  Animation2["caption_after_enter"] = "caption_after_enter";
  Animation2["caption_after_exit"] = "caption_after_exit";
  Animation2["caption_before_enter"] = "caption_before_enter";
  Animation2["caption_before_exit"] = "caption_before_exit";
})(Animation || (Animation = {}));

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/useDayPicker.js
var import_react7 = __toESM(require_react(), 1);
var dayPickerContext = (0, import_react7.createContext)(void 0);
function useDayPicker() {
  const context = (0, import_react7.useContext)(dayPickerContext);
  if (context === void 0) {
    throw new Error("useDayPicker() must be used within a custom component.");
  }
  return context;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Dropdown.js
function Dropdown(props) {
  const { options, className, ...selectProps } = props;
  const { classNames, components, styles } = useDayPicker();
  const cssClassSelect = [classNames[UI.Dropdown], className].join(" ");
  const selectedOption = options?.find(({ value }) => value === selectProps.value);
  return import_react8.default.createElement(
    "span",
    { "data-disabled": selectProps.disabled, className: classNames[UI.DropdownRoot], style: styles?.[UI.DropdownRoot] },
    import_react8.default.createElement(components.Select, { className: cssClassSelect, ...selectProps }, options?.map(({ value, label, disabled: disabled2 }) => import_react8.default.createElement(components.Option, { key: value, value, disabled: disabled2 }, label))),
    import_react8.default.createElement(
      "span",
      { className: classNames[UI.CaptionLabel], style: styles?.[UI.CaptionLabel], "aria-hidden": true },
      selectedOption?.label,
      import_react8.default.createElement(components.Chevron, { orientation: "down", size: 18, className: classNames[UI.Chevron], style: styles?.[UI.Chevron] })
    )
  );
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/DropdownNav.js
var import_react9 = __toESM(require_react(), 1);
function DropdownNav(props) {
  return import_react9.default.createElement("div", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Footer.js
var import_react10 = __toESM(require_react(), 1);
function Footer(props) {
  return import_react10.default.createElement("div", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Month.js
var import_react11 = __toESM(require_react(), 1);
function Month(props) {
  const { calendarMonth, displayIndex, ...divProps } = props;
  return import_react11.default.createElement("div", { ...divProps }, props.children);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/MonthCaption.js
var import_react12 = __toESM(require_react(), 1);
function MonthCaption(props) {
  const { calendarMonth, displayIndex, ...divProps } = props;
  return import_react12.default.createElement("div", { ...divProps });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/MonthGrid.js
var import_react13 = __toESM(require_react(), 1);
function MonthGrid(props) {
  return import_react13.default.createElement("table", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Months.js
var import_react14 = __toESM(require_react(), 1);
function Months(props) {
  return import_react14.default.createElement("div", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/MonthsDropdown.js
var import_react15 = __toESM(require_react(), 1);
function MonthsDropdown(props) {
  const { components } = useDayPicker();
  return import_react15.default.createElement(components.Dropdown, { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Nav.js
var import_react16 = __toESM(require_react(), 1);
function Nav(props) {
  const { onPreviousClick, onNextClick, previousMonth, nextMonth, ...navProps } = props;
  const { components, classNames, styles, labels: { labelPrevious: labelPrevious2, labelNext: labelNext2 } } = useDayPicker();
  const handleNextClick = (0, import_react16.useCallback)((e2) => {
    if (nextMonth) {
      onNextClick?.(e2);
    }
  }, [nextMonth, onNextClick]);
  const handlePreviousClick = (0, import_react16.useCallback)((e2) => {
    if (previousMonth) {
      onPreviousClick?.(e2);
    }
  }, [previousMonth, onPreviousClick]);
  return import_react16.default.createElement(
    "nav",
    { ...navProps },
    import_react16.default.createElement(
      components.PreviousMonthButton,
      { type: "button", className: classNames[UI.PreviousMonthButton], style: styles?.[UI.PreviousMonthButton], tabIndex: previousMonth ? void 0 : -1, "aria-disabled": previousMonth ? void 0 : true, "aria-label": labelPrevious2(previousMonth), onClick: handlePreviousClick },
      import_react16.default.createElement(components.Chevron, { disabled: previousMonth ? void 0 : true, className: classNames[UI.Chevron], style: styles?.[UI.Chevron], orientation: "left" })
    ),
    import_react16.default.createElement(
      components.NextMonthButton,
      { type: "button", className: classNames[UI.NextMonthButton], style: styles?.[UI.NextMonthButton], tabIndex: nextMonth ? void 0 : -1, "aria-disabled": nextMonth ? void 0 : true, "aria-label": labelNext2(nextMonth), onClick: handleNextClick },
      import_react16.default.createElement(components.Chevron, { disabled: nextMonth ? void 0 : true, orientation: "right", className: classNames[UI.Chevron], style: styles?.[UI.Chevron] })
    )
  );
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/NextMonthButton.js
var import_react17 = __toESM(require_react(), 1);
function NextMonthButton(props) {
  return import_react17.default.createElement("button", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Option.js
var import_react18 = __toESM(require_react(), 1);
function Option(props) {
  return import_react18.default.createElement("option", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/PreviousMonthButton.js
var import_react19 = __toESM(require_react(), 1);
function PreviousMonthButton(props) {
  return import_react19.default.createElement("button", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Root.js
var import_react20 = __toESM(require_react(), 1);
function Root(props) {
  const { rootRef, ...rest } = props;
  return import_react20.default.createElement("div", { ...rest, ref: rootRef });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Select.js
var import_react21 = __toESM(require_react(), 1);
function Select(props) {
  return import_react21.default.createElement("select", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Week.js
var import_react22 = __toESM(require_react(), 1);
function Week(props) {
  const { week, ...trProps } = props;
  return import_react22.default.createElement("tr", { ...trProps });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Weekday.js
var import_react23 = __toESM(require_react(), 1);
function Weekday(props) {
  return import_react23.default.createElement("th", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Weekdays.js
var import_react24 = __toESM(require_react(), 1);
function Weekdays(props) {
  return import_react24.default.createElement(
    "thead",
    { "aria-hidden": true },
    import_react24.default.createElement("tr", { ...props })
  );
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/WeekNumber.js
var import_react25 = __toESM(require_react(), 1);
function WeekNumber(props) {
  const { week, ...thProps } = props;
  return import_react25.default.createElement("th", { ...thProps });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/WeekNumberHeader.js
var import_react26 = __toESM(require_react(), 1);
function WeekNumberHeader(props) {
  return import_react26.default.createElement("th", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/Weeks.js
var import_react27 = __toESM(require_react(), 1);
function Weeks(props) {
  return import_react27.default.createElement("tbody", { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/components/YearsDropdown.js
var import_react28 = __toESM(require_react(), 1);
function YearsDropdown(props) {
  const { components } = useDayPicker();
  return import_react28.default.createElement(components.Dropdown, { ...props });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/DayPicker.js
var import_react33 = __toESM(require_react(), 1);

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/utils/rangeIncludesDate.js
function rangeIncludesDate(range, date, excludeEnds = false, dateLib = defaultDateLib) {
  let { from, to } = range;
  const { differenceInCalendarDays: differenceInCalendarDays2, isSameDay: isSameDay2 } = dateLib;
  if (from && to) {
    const isRangeInverted = differenceInCalendarDays2(to, from) < 0;
    if (isRangeInverted) {
      [from, to] = [to, from];
    }
    const isInRange = differenceInCalendarDays2(date, from) >= (excludeEnds ? 1 : 0) && differenceInCalendarDays2(to, date) >= (excludeEnds ? 1 : 0);
    return isInRange;
  }
  if (!excludeEnds && to) {
    return isSameDay2(to, date);
  }
  if (!excludeEnds && from) {
    return isSameDay2(from, date);
  }
  return false;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/utils/typeguards.js
function isDateInterval(matcher) {
  return Boolean(matcher && typeof matcher === "object" && "before" in matcher && "after" in matcher);
}
function isDateRange(value) {
  return Boolean(value && typeof value === "object" && "from" in value);
}
function isDateAfterType(value) {
  return Boolean(value && typeof value === "object" && "after" in value);
}
function isDateBeforeType(value) {
  return Boolean(value && typeof value === "object" && "before" in value);
}
function isDayOfWeekType(value) {
  return Boolean(value && typeof value === "object" && "dayOfWeek" in value);
}
function isDatesArray(value, dateLib) {
  return Array.isArray(value) && value.every(dateLib.isDate);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/utils/dateMatchModifiers.js
function dateMatchModifiers(date, matchers, dateLib = defaultDateLib) {
  const matchersArr = !Array.isArray(matchers) ? [matchers] : matchers;
  const { isSameDay: isSameDay2, differenceInCalendarDays: differenceInCalendarDays2, isAfter: isAfter2 } = dateLib;
  return matchersArr.some((matcher) => {
    if (typeof matcher === "boolean") {
      return matcher;
    }
    if (dateLib.isDate(matcher)) {
      return isSameDay2(date, matcher);
    }
    if (isDatesArray(matcher, dateLib)) {
      return matcher.some((matcherDate) => isSameDay2(date, matcherDate));
    }
    if (isDateRange(matcher)) {
      return rangeIncludesDate(matcher, date, false, dateLib);
    }
    if (isDayOfWeekType(matcher)) {
      if (!Array.isArray(matcher.dayOfWeek)) {
        return matcher.dayOfWeek === date.getDay();
      }
      return matcher.dayOfWeek.includes(date.getDay());
    }
    if (isDateInterval(matcher)) {
      const diffBefore = differenceInCalendarDays2(matcher.before, date);
      const diffAfter = differenceInCalendarDays2(matcher.after, date);
      const isDayBefore = diffBefore > 0;
      const isDayAfter = diffAfter < 0;
      const isClosedInterval = isAfter2(matcher.before, matcher.after);
      if (isClosedInterval) {
        return isDayAfter && isDayBefore;
      } else {
        return isDayBefore || isDayAfter;
      }
    }
    if (isDateAfterType(matcher)) {
      return differenceInCalendarDays2(date, matcher.after) > 0;
    }
    if (isDateBeforeType(matcher)) {
      return differenceInCalendarDays2(matcher.before, date) > 0;
    }
    if (typeof matcher === "function") {
      return matcher(date);
    }
    return false;
  });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/createGetModifiers.js
function createGetModifiers(days, props, navStart, navEnd, dateLib) {
  const { disabled: disabled2, hidden, modifiers, showOutsideDays, broadcastCalendar, today = dateLib.today() } = props;
  const { isSameDay: isSameDay2, isSameMonth: isSameMonth2, startOfMonth: startOfMonth2, isBefore: isBefore2, endOfMonth: endOfMonth2, isAfter: isAfter2 } = dateLib;
  const computedNavStart = navStart && startOfMonth2(navStart);
  const computedNavEnd = navEnd && endOfMonth2(navEnd);
  const internalModifiersMap = {
    [DayFlag.focused]: [],
    [DayFlag.outside]: [],
    [DayFlag.disabled]: [],
    [DayFlag.hidden]: [],
    [DayFlag.today]: []
  };
  const customModifiersMap = {};
  for (const day of days) {
    const { date, displayMonth } = day;
    const isOutside = Boolean(displayMonth && !isSameMonth2(date, displayMonth));
    const isBeforeNavStart = Boolean(computedNavStart && isBefore2(date, computedNavStart));
    const isAfterNavEnd = Boolean(computedNavEnd && isAfter2(date, computedNavEnd));
    const isDisabled = Boolean(disabled2 && dateMatchModifiers(date, disabled2, dateLib));
    const isHidden = Boolean(hidden && dateMatchModifiers(date, hidden, dateLib)) || isBeforeNavStart || isAfterNavEnd || // Broadcast calendar will show outside days as default
    !broadcastCalendar && !showOutsideDays && isOutside || broadcastCalendar && showOutsideDays === false && isOutside;
    const isToday = isSameDay2(date, today);
    if (isOutside)
      internalModifiersMap.outside.push(day);
    if (isDisabled)
      internalModifiersMap.disabled.push(day);
    if (isHidden)
      internalModifiersMap.hidden.push(day);
    if (isToday)
      internalModifiersMap.today.push(day);
    if (modifiers) {
      Object.keys(modifiers).forEach((name) => {
        const modifierValue = modifiers?.[name];
        const isMatch = modifierValue ? dateMatchModifiers(date, modifierValue, dateLib) : false;
        if (!isMatch)
          return;
        if (customModifiersMap[name]) {
          customModifiersMap[name].push(day);
        } else {
          customModifiersMap[name] = [day];
        }
      });
    }
  }
  return (day) => {
    const dayFlags = {
      [DayFlag.focused]: false,
      [DayFlag.disabled]: false,
      [DayFlag.hidden]: false,
      [DayFlag.outside]: false,
      [DayFlag.today]: false
    };
    const customModifiers = {};
    for (const name in internalModifiersMap) {
      const days2 = internalModifiersMap[name];
      dayFlags[name] = days2.some((d2) => d2 === day);
    }
    for (const name in customModifiersMap) {
      customModifiers[name] = customModifiersMap[name].some((d2) => d2 === day);
    }
    return {
      ...dayFlags,
      // custom modifiers should override all the previous ones
      ...customModifiers
    };
  };
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getClassNamesForModifiers.js
function getClassNamesForModifiers(modifiers, classNames, modifiersClassNames = {}) {
  const modifierClassNames = Object.entries(modifiers).filter(([, active]) => active === true).reduce((previousValue, [key]) => {
    if (modifiersClassNames[key]) {
      previousValue.push(modifiersClassNames[key]);
    } else if (classNames[DayFlag[key]]) {
      previousValue.push(classNames[DayFlag[key]]);
    } else if (classNames[SelectionState[key]]) {
      previousValue.push(classNames[SelectionState[key]]);
    }
    return previousValue;
  }, [classNames[UI.Day]]);
  return modifierClassNames;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getComponents.js
function getComponents(customComponents) {
  return {
    ...custom_components_exports,
    ...customComponents
  };
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getDataAttributes.js
function getDataAttributes(props) {
  const dataAttributes = {
    "data-mode": props.mode ?? void 0,
    "data-required": "required" in props ? props.required : void 0,
    "data-multiple-months": props.numberOfMonths && props.numberOfMonths > 1 || void 0,
    "data-week-numbers": props.showWeekNumber || void 0,
    "data-broadcast-calendar": props.broadcastCalendar || void 0,
    "data-nav-layout": props.navLayout || void 0
  };
  Object.entries(props).forEach(([key, val]) => {
    if (key.startsWith("data-")) {
      dataAttributes[key] = val;
    }
  });
  return dataAttributes;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getDefaultClassNames.js
function getDefaultClassNames() {
  const classNames = {};
  for (const key in UI) {
    classNames[UI[key]] = `rdp-${UI[key]}`;
  }
  for (const key in DayFlag) {
    classNames[DayFlag[key]] = `rdp-${DayFlag[key]}`;
  }
  for (const key in SelectionState) {
    classNames[SelectionState[key]] = `rdp-${SelectionState[key]}`;
  }
  for (const key in Animation) {
    classNames[Animation[key]] = `rdp-${Animation[key]}`;
  }
  return classNames;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/formatters/index.js
var formatters_exports = {};
__export(formatters_exports, {
  formatCaption: () => formatCaption,
  formatDay: () => formatDay,
  formatMonthDropdown: () => formatMonthDropdown,
  formatWeekNumber: () => formatWeekNumber,
  formatWeekNumberHeader: () => formatWeekNumberHeader,
  formatWeekdayName: () => formatWeekdayName,
  formatYearDropdown: () => formatYearDropdown
});

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/formatters/formatCaption.js
function formatCaption(month, options, dateLib) {
  const lib = dateLib ?? new DateLib(options);
  return lib.formatMonthYear(month);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/formatters/formatDay.js
function formatDay(date, options, dateLib) {
  return (dateLib ?? new DateLib(options)).format(date, "d");
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/formatters/formatMonthDropdown.js
function formatMonthDropdown(month, dateLib = defaultDateLib) {
  return dateLib.format(month, "LLLL");
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/formatters/formatWeekdayName.js
function formatWeekdayName(weekday, options, dateLib) {
  return (dateLib ?? new DateLib(options)).format(weekday, "cccccc");
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/formatters/formatWeekNumber.js
function formatWeekNumber(weekNumber, dateLib = defaultDateLib) {
  if (weekNumber < 10) {
    return dateLib.formatNumber(`0${weekNumber.toLocaleString()}`);
  }
  return dateLib.formatNumber(`${weekNumber.toLocaleString()}`);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/formatters/formatWeekNumberHeader.js
function formatWeekNumberHeader() {
  return ``;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/formatters/formatYearDropdown.js
function formatYearDropdown(year, dateLib = defaultDateLib) {
  return dateLib.format(year, "yyyy");
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getFormatters.js
function getFormatters(customFormatters) {
  return {
    ...formatters_exports,
    ...customFormatters
  };
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/index.js
var labels_exports = {};
__export(labels_exports, {
  labelDayButton: () => labelDayButton,
  labelGrid: () => labelGrid,
  labelGridcell: () => labelGridcell,
  labelMonthDropdown: () => labelMonthDropdown,
  labelNav: () => labelNav,
  labelNext: () => labelNext,
  labelPrevious: () => labelPrevious,
  labelWeekNumber: () => labelWeekNumber,
  labelWeekNumberHeader: () => labelWeekNumberHeader,
  labelWeekday: () => labelWeekday,
  labelYearDropdown: () => labelYearDropdown
});

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelDayButton.js
function labelDayButton(date, modifiers, options, dateLib) {
  let label = (dateLib ?? new DateLib(options)).format(date, "PPPP");
  if (modifiers.today)
    label = `Today, ${label}`;
  if (modifiers.selected)
    label = `${label}, selected`;
  return label;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelGrid.js
function labelGrid(date, options, dateLib) {
  const lib = dateLib ?? new DateLib(options);
  return lib.formatMonthYear(date);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelGridcell.js
function labelGridcell(date, modifiers, options, dateLib) {
  let label = (dateLib ?? new DateLib(options)).format(date, "PPPP");
  if (modifiers?.today) {
    label = `Today, ${label}`;
  }
  return label;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelMonthDropdown.js
function labelMonthDropdown(_options) {
  return "Choose the Month";
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelNav.js
function labelNav() {
  return "";
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelNext.js
var defaultLabel = "Go to the Next Month";
function labelNext(_month, _options) {
  return defaultLabel;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelPrevious.js
function labelPrevious(_month) {
  return "Go to the Previous Month";
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelWeekday.js
function labelWeekday(date, options, dateLib) {
  return (dateLib ?? new DateLib(options)).format(date, "cccc");
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelWeekNumber.js
function labelWeekNumber(weekNumber, _options) {
  return `Week ${weekNumber}`;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelWeekNumberHeader.js
function labelWeekNumberHeader(_options) {
  return "Week Number";
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/labels/labelYearDropdown.js
function labelYearDropdown(_options) {
  return "Choose the Year";
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getLabels.js
var resolveLabel = (defaultLabel2, customLabel, localeLabel) => {
  if (customLabel)
    return customLabel;
  if (localeLabel) {
    return typeof localeLabel === "function" ? localeLabel : (..._args) => localeLabel;
  }
  return defaultLabel2;
};
function getLabels(customLabels, options) {
  const localeLabels = options.locale?.labels ?? {};
  return {
    ...labels_exports,
    ...customLabels ?? {},
    labelDayButton: resolveLabel(labelDayButton, customLabels?.labelDayButton, localeLabels.labelDayButton),
    labelMonthDropdown: resolveLabel(labelMonthDropdown, customLabels?.labelMonthDropdown, localeLabels.labelMonthDropdown),
    labelNext: resolveLabel(labelNext, customLabels?.labelNext, localeLabels.labelNext),
    labelPrevious: resolveLabel(labelPrevious, customLabels?.labelPrevious, localeLabels.labelPrevious),
    labelWeekNumber: resolveLabel(labelWeekNumber, customLabels?.labelWeekNumber, localeLabels.labelWeekNumber),
    labelYearDropdown: resolveLabel(labelYearDropdown, customLabels?.labelYearDropdown, localeLabels.labelYearDropdown),
    labelGrid: resolveLabel(labelGrid, customLabels?.labelGrid, localeLabels.labelGrid),
    labelGridcell: resolveLabel(labelGridcell, customLabels?.labelGridcell, localeLabels.labelGridcell),
    labelNav: resolveLabel(labelNav, customLabels?.labelNav, localeLabels.labelNav),
    labelWeekNumberHeader: resolveLabel(labelWeekNumberHeader, customLabels?.labelWeekNumberHeader, localeLabels.labelWeekNumberHeader),
    labelWeekday: resolveLabel(labelWeekday, customLabels?.labelWeekday, localeLabels.labelWeekday)
  };
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getMonthOptions.js
function getMonthOptions(displayMonth, navStart, navEnd, formatters2, dateLib) {
  const { startOfMonth: startOfMonth2, startOfYear: startOfYear2, endOfYear: endOfYear2, eachMonthOfInterval: eachMonthOfInterval2, getMonth: getMonth2 } = dateLib;
  const months = eachMonthOfInterval2({
    start: startOfYear2(displayMonth),
    end: endOfYear2(displayMonth)
  });
  const options = months.map((month) => {
    const label = formatters2.formatMonthDropdown(month, dateLib);
    const value = getMonth2(month);
    const disabled2 = navStart && month < startOfMonth2(navStart) || navEnd && month > startOfMonth2(navEnd) || false;
    return { value, label, disabled: disabled2 };
  });
  return options;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getStyleForModifiers.js
function getStyleForModifiers(dayModifiers, styles = {}, modifiersStyles = {}) {
  let style = { ...styles?.[UI.Day] };
  Object.entries(dayModifiers).filter(([, active]) => active === true).forEach(([modifier]) => {
    style = {
      ...style,
      ...modifiersStyles?.[modifier]
    };
  });
  return style;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getWeekdays.js
function getWeekdays(dateLib, ISOWeek, broadcastCalendar, today) {
  const referenceToday = today ?? dateLib.today();
  const start = broadcastCalendar ? dateLib.startOfBroadcastWeek(referenceToday, dateLib) : ISOWeek ? dateLib.startOfISOWeek(referenceToday) : dateLib.startOfWeek(referenceToday);
  const days = [];
  for (let i2 = 0; i2 < 7; i2++) {
    const day = dateLib.addDays(start, i2);
    days.push(day);
  }
  return days;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getYearOptions.js
function getYearOptions(navStart, navEnd, formatters2, dateLib, reverse = false) {
  if (!navStart)
    return void 0;
  if (!navEnd)
    return void 0;
  const { startOfYear: startOfYear2, endOfYear: endOfYear2, eachYearOfInterval: eachYearOfInterval2, getYear: getYear2 } = dateLib;
  const firstNavYear = startOfYear2(navStart);
  const lastNavYear = endOfYear2(navEnd);
  const years = eachYearOfInterval2({ start: firstNavYear, end: lastNavYear });
  if (reverse)
    years.reverse();
  return years.map((year) => {
    const label = formatters2.formatYearDropdown(year, dateLib);
    return {
      value: getYear2(year),
      label,
      disabled: false
    };
  });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/noonDateLib.js
function createNoonOverrides(timeZone, options = {}) {
  const { weekStartsOn, locale } = options;
  const fallbackWeekStartsOn = weekStartsOn ?? locale?.options?.weekStartsOn ?? 0;
  const toNoonTZDate = (date) => {
    const normalizedDate = typeof date === "number" || typeof date === "string" ? new Date(date) : date;
    return new TZDate(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate(), 12, 0, 0, timeZone);
  };
  const toCalendarDate2 = (date) => {
    const zoned = toNoonTZDate(date);
    return new Date(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), 0, 0, 0, 0);
  };
  return {
    today: () => {
      return toNoonTZDate(TZDate.tz(timeZone));
    },
    newDate: (year, monthIndex, date) => {
      return new TZDate(year, monthIndex, date, 12, 0, 0, timeZone);
    },
    startOfDay: (date) => {
      return toNoonTZDate(date);
    },
    startOfWeek: (date, options2) => {
      const base = toNoonTZDate(date);
      const weekStartsOnValue = options2?.weekStartsOn ?? fallbackWeekStartsOn;
      const diff = (base.getDay() - weekStartsOnValue + 7) % 7;
      base.setDate(base.getDate() - diff);
      return base;
    },
    startOfISOWeek: (date) => {
      const base = toNoonTZDate(date);
      const diff = (base.getDay() - 1 + 7) % 7;
      base.setDate(base.getDate() - diff);
      return base;
    },
    startOfMonth: (date) => {
      const base = toNoonTZDate(date);
      base.setDate(1);
      return base;
    },
    startOfYear: (date) => {
      const base = toNoonTZDate(date);
      base.setMonth(0, 1);
      return base;
    },
    endOfWeek: (date, options2) => {
      const base = toNoonTZDate(date);
      const weekStartsOnValue = options2?.weekStartsOn ?? fallbackWeekStartsOn;
      const endDow = (weekStartsOnValue + 6) % 7;
      const diff = (endDow - base.getDay() + 7) % 7;
      base.setDate(base.getDate() + diff);
      return base;
    },
    endOfISOWeek: (date) => {
      const base = toNoonTZDate(date);
      const diff = (7 - base.getDay()) % 7;
      base.setDate(base.getDate() + diff);
      return base;
    },
    endOfMonth: (date) => {
      const base = toNoonTZDate(date);
      base.setMonth(base.getMonth() + 1, 0);
      return base;
    },
    endOfYear: (date) => {
      const base = toNoonTZDate(date);
      base.setMonth(11, 31);
      return base;
    },
    eachMonthOfInterval: (interval) => {
      const start = toNoonTZDate(interval.start);
      const end = toNoonTZDate(interval.end);
      const result = [];
      const cursor = new TZDate(start.getFullYear(), start.getMonth(), 1, 12, 0, 0, timeZone);
      const endKey = end.getFullYear() * 12 + end.getMonth();
      while (cursor.getFullYear() * 12 + cursor.getMonth() <= endKey) {
        result.push(new TZDate(cursor, timeZone));
        cursor.setMonth(cursor.getMonth() + 1, 1);
      }
      return result;
    },
    // Normalize to noon once before arithmetic (avoid DST/midnight edge cases),
    // mutate the same TZDate, and return it.
    addDays: (date, amount) => {
      const base = toNoonTZDate(date);
      base.setDate(base.getDate() + amount);
      return base;
    },
    addWeeks: (date, amount) => {
      const base = toNoonTZDate(date);
      base.setDate(base.getDate() + amount * 7);
      return base;
    },
    addMonths: (date, amount) => {
      const base = toNoonTZDate(date);
      base.setMonth(base.getMonth() + amount);
      return base;
    },
    addYears: (date, amount) => {
      const base = toNoonTZDate(date);
      base.setFullYear(base.getFullYear() + amount);
      return base;
    },
    eachYearOfInterval: (interval) => {
      const start = toNoonTZDate(interval.start);
      const end = toNoonTZDate(interval.end);
      const years = [];
      const cursor = new TZDate(start.getFullYear(), 0, 1, 12, 0, 0, timeZone);
      while (cursor.getFullYear() <= end.getFullYear()) {
        years.push(new TZDate(cursor, timeZone));
        cursor.setFullYear(cursor.getFullYear() + 1, 0, 1);
      }
      return years;
    },
    getWeek: (date, options2) => {
      const base = toCalendarDate2(date);
      return getWeek(base, {
        weekStartsOn: options2?.weekStartsOn ?? fallbackWeekStartsOn,
        firstWeekContainsDate: options2?.firstWeekContainsDate ?? locale?.options?.firstWeekContainsDate ?? 1
      });
    },
    getISOWeek: (date) => {
      const base = toCalendarDate2(date);
      return getISOWeek(base);
    },
    differenceInCalendarDays: (dateLeft, dateRight) => {
      const left = toCalendarDate2(dateLeft);
      const right = toCalendarDate2(dateRight);
      return differenceInCalendarDays(left, right);
    },
    differenceInCalendarMonths: (dateLeft, dateRight) => {
      const left = toCalendarDate2(dateLeft);
      const right = toCalendarDate2(dateRight);
      return differenceInCalendarMonths(left, right);
    }
  };
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/useAnimation.js
var import_react29 = __toESM(require_react(), 1);
var asHtmlElement = (element) => {
  if (element instanceof HTMLElement)
    return element;
  return null;
};
var queryMonthEls = (element) => [
  ...element.querySelectorAll("[data-animated-month]") ?? []
];
var queryMonthEl = (element) => asHtmlElement(element.querySelector("[data-animated-month]"));
var queryCaptionEl = (element) => asHtmlElement(element.querySelector("[data-animated-caption]"));
var queryWeeksEl = (element) => asHtmlElement(element.querySelector("[data-animated-weeks]"));
var queryNavEl = (element) => asHtmlElement(element.querySelector("[data-animated-nav]"));
var queryWeekdaysEl = (element) => asHtmlElement(element.querySelector("[data-animated-weekdays]"));
function useAnimation(rootElRef, enabled, { classNames, months, focused, dateLib }) {
  const previousRootElSnapshotRef = (0, import_react29.useRef)(null);
  const previousMonthsRef = (0, import_react29.useRef)(months);
  const animatingRef = (0, import_react29.useRef)(false);
  (0, import_react29.useLayoutEffect)(() => {
    const previousMonths = previousMonthsRef.current;
    previousMonthsRef.current = months;
    if (!enabled || !rootElRef.current || // safety check because the ref can be set to anything by consumers
    !(rootElRef.current instanceof HTMLElement) || // validation required for the animation to work as expected
    months.length === 0 || previousMonths.length === 0 || months.length !== previousMonths.length) {
      return;
    }
    const isSameMonth2 = dateLib.isSameMonth(months[0].date, previousMonths[0].date);
    const isAfterPreviousMonth = dateLib.isAfter(months[0].date, previousMonths[0].date);
    const captionAnimationClass = isAfterPreviousMonth ? classNames[Animation.caption_after_enter] : classNames[Animation.caption_before_enter];
    const weeksAnimationClass = isAfterPreviousMonth ? classNames[Animation.weeks_after_enter] : classNames[Animation.weeks_before_enter];
    const previousRootElSnapshot = previousRootElSnapshotRef.current;
    const rootElSnapshot = rootElRef.current.cloneNode(true);
    if (rootElSnapshot instanceof HTMLElement) {
      const currentMonthElsSnapshot = queryMonthEls(rootElSnapshot);
      currentMonthElsSnapshot.forEach((currentMonthElSnapshot) => {
        if (!(currentMonthElSnapshot instanceof HTMLElement))
          return;
        const previousMonthElSnapshot = queryMonthEl(currentMonthElSnapshot);
        if (previousMonthElSnapshot && currentMonthElSnapshot.contains(previousMonthElSnapshot)) {
          currentMonthElSnapshot.removeChild(previousMonthElSnapshot);
        }
        const captionEl = queryCaptionEl(currentMonthElSnapshot);
        if (captionEl) {
          captionEl.classList.remove(captionAnimationClass);
        }
        const weeksEl = queryWeeksEl(currentMonthElSnapshot);
        if (weeksEl) {
          weeksEl.classList.remove(weeksAnimationClass);
        }
      });
      previousRootElSnapshotRef.current = rootElSnapshot;
    } else {
      previousRootElSnapshotRef.current = null;
    }
    if (animatingRef.current || isSameMonth2 || // skip animation if a day is focused because it can cause issues to the animation and is better for a11y
    focused) {
      return;
    }
    const previousMonthEls = previousRootElSnapshot instanceof HTMLElement ? queryMonthEls(previousRootElSnapshot) : [];
    const currentMonthEls = queryMonthEls(rootElRef.current);
    if (currentMonthEls?.every((el) => el instanceof HTMLElement) && previousMonthEls?.every((el) => el instanceof HTMLElement)) {
      animatingRef.current = true;
      const cleanUpFunctions = [];
      rootElRef.current.style.isolation = "isolate";
      const navEl = queryNavEl(rootElRef.current);
      if (navEl) {
        navEl.style.zIndex = "1";
      }
      currentMonthEls.forEach((currentMonthEl, index) => {
        const previousMonthEl = previousMonthEls[index];
        if (!previousMonthEl) {
          return;
        }
        currentMonthEl.style.position = "relative";
        currentMonthEl.style.overflow = "hidden";
        const captionEl = queryCaptionEl(currentMonthEl);
        if (captionEl) {
          captionEl.classList.add(captionAnimationClass);
        }
        const weeksEl = queryWeeksEl(currentMonthEl);
        if (weeksEl) {
          weeksEl.classList.add(weeksAnimationClass);
        }
        const cleanUp = () => {
          animatingRef.current = false;
          if (rootElRef.current) {
            rootElRef.current.style.isolation = "";
          }
          if (navEl) {
            navEl.style.zIndex = "";
          }
          if (captionEl) {
            captionEl.classList.remove(captionAnimationClass);
          }
          if (weeksEl) {
            weeksEl.classList.remove(weeksAnimationClass);
          }
          currentMonthEl.style.position = "";
          currentMonthEl.style.overflow = "";
          if (currentMonthEl.contains(previousMonthEl)) {
            currentMonthEl.removeChild(previousMonthEl);
          }
        };
        cleanUpFunctions.push(cleanUp);
        previousMonthEl.style.pointerEvents = "none";
        previousMonthEl.style.position = "absolute";
        previousMonthEl.style.overflow = "hidden";
        previousMonthEl.setAttribute("aria-hidden", "true");
        const previousWeekdaysEl = queryWeekdaysEl(previousMonthEl);
        if (previousWeekdaysEl) {
          previousWeekdaysEl.style.opacity = "0";
        }
        const previousCaptionEl = queryCaptionEl(previousMonthEl);
        if (previousCaptionEl) {
          previousCaptionEl.classList.add(isAfterPreviousMonth ? classNames[Animation.caption_before_exit] : classNames[Animation.caption_after_exit]);
          previousCaptionEl.addEventListener("animationend", cleanUp);
        }
        const previousWeeksEl = queryWeeksEl(previousMonthEl);
        if (previousWeeksEl) {
          previousWeeksEl.classList.add(isAfterPreviousMonth ? classNames[Animation.weeks_before_exit] : classNames[Animation.weeks_after_exit]);
        }
        currentMonthEl.insertBefore(previousMonthEl, currentMonthEl.firstChild);
      });
    }
  });
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/useCalendar.js
var import_react31 = __toESM(require_react(), 1);

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getDates.js
function getDates(displayMonths, maxDate, props, dateLib) {
  const firstMonth = displayMonths[0];
  const lastMonth = displayMonths[displayMonths.length - 1];
  const { ISOWeek, fixedWeeks, broadcastCalendar } = props ?? {};
  const { addDays: addDays2, differenceInCalendarDays: differenceInCalendarDays2, differenceInCalendarMonths: differenceInCalendarMonths2, endOfBroadcastWeek: endOfBroadcastWeek2, endOfISOWeek: endOfISOWeek2, endOfMonth: endOfMonth2, endOfWeek: endOfWeek2, isAfter: isAfter2, startOfBroadcastWeek: startOfBroadcastWeek2, startOfISOWeek: startOfISOWeek2, startOfWeek: startOfWeek2 } = dateLib;
  const startWeekFirstDate = broadcastCalendar ? startOfBroadcastWeek2(firstMonth, dateLib) : ISOWeek ? startOfISOWeek2(firstMonth) : startOfWeek2(firstMonth);
  const displayMonthsWeekEnd = broadcastCalendar ? endOfBroadcastWeek2(lastMonth) : ISOWeek ? endOfISOWeek2(endOfMonth2(lastMonth)) : endOfWeek2(endOfMonth2(lastMonth));
  const constraintWeekEnd = maxDate && (broadcastCalendar ? endOfBroadcastWeek2(maxDate) : ISOWeek ? endOfISOWeek2(maxDate) : endOfWeek2(maxDate));
  const gridEndDate = constraintWeekEnd && isAfter2(displayMonthsWeekEnd, constraintWeekEnd) ? constraintWeekEnd : displayMonthsWeekEnd;
  const nOfDays = differenceInCalendarDays2(gridEndDate, startWeekFirstDate);
  const nOfMonths = differenceInCalendarMonths2(lastMonth, firstMonth) + 1;
  const dates = [];
  for (let i2 = 0; i2 <= nOfDays; i2++) {
    const date = addDays2(startWeekFirstDate, i2);
    dates.push(date);
  }
  const nrOfDaysWithFixedWeeks = broadcastCalendar ? 35 : 42;
  const extraDates = nrOfDaysWithFixedWeeks * nOfMonths;
  if (fixedWeeks && dates.length < extraDates) {
    const daysToAdd = extraDates - dates.length;
    for (let i2 = 0; i2 < daysToAdd; i2++) {
      const date = addDays2(dates[dates.length - 1], 1);
      dates.push(date);
    }
  }
  return dates;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getDays.js
function getDays(calendarMonths) {
  const initialDays = [];
  return calendarMonths.reduce((days, month) => {
    const weekDays = month.weeks.reduce((weekDays2, week) => {
      return weekDays2.concat(week.days.slice());
    }, initialDays.slice());
    return days.concat(weekDays.slice());
  }, initialDays.slice());
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getDisplayMonths.js
function getDisplayMonths(firstDisplayedMonth, calendarEndMonth, props, dateLib) {
  const { numberOfMonths = 1 } = props;
  const months = [];
  for (let i2 = 0; i2 < numberOfMonths; i2++) {
    const month = dateLib.addMonths(firstDisplayedMonth, i2);
    if (calendarEndMonth && month > calendarEndMonth) {
      break;
    }
    months.push(month);
  }
  return months;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getInitialMonth.js
function getInitialMonth(props, navStart, navEnd, dateLib) {
  const { month, defaultMonth, today = dateLib.today(), numberOfMonths = 1 } = props;
  let initialMonth = month || defaultMonth || today;
  const { differenceInCalendarMonths: differenceInCalendarMonths2, addMonths: addMonths2, startOfMonth: startOfMonth2 } = dateLib;
  if (navEnd && differenceInCalendarMonths2(navEnd, initialMonth) < numberOfMonths - 1) {
    const offset = -1 * (numberOfMonths - 1);
    initialMonth = addMonths2(navEnd, offset);
  }
  if (navStart && differenceInCalendarMonths2(initialMonth, navStart) < 0) {
    initialMonth = navStart;
  }
  return startOfMonth2(initialMonth);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getMonths.js
function getMonths(displayMonths, dates, props, dateLib) {
  const { addDays: addDays2, endOfBroadcastWeek: endOfBroadcastWeek2, endOfISOWeek: endOfISOWeek2, endOfMonth: endOfMonth2, endOfWeek: endOfWeek2, getISOWeek: getISOWeek2, getWeek: getWeek2, startOfBroadcastWeek: startOfBroadcastWeek2, startOfISOWeek: startOfISOWeek2, startOfWeek: startOfWeek2 } = dateLib;
  const dayPickerMonths = displayMonths.reduce((months, month) => {
    const firstDateOfFirstWeek = props.broadcastCalendar ? startOfBroadcastWeek2(month, dateLib) : props.ISOWeek ? startOfISOWeek2(month) : startOfWeek2(month);
    const lastDateOfLastWeek = props.broadcastCalendar ? endOfBroadcastWeek2(month) : props.ISOWeek ? endOfISOWeek2(endOfMonth2(month)) : endOfWeek2(endOfMonth2(month));
    const monthDates = dates.filter((date) => {
      return date >= firstDateOfFirstWeek && date <= lastDateOfLastWeek;
    });
    const nrOfDaysWithFixedWeeks = props.broadcastCalendar ? 35 : 42;
    if (props.fixedWeeks && monthDates.length < nrOfDaysWithFixedWeeks) {
      const extraDates = dates.filter((date) => {
        const daysToAdd = nrOfDaysWithFixedWeeks - monthDates.length;
        return date > lastDateOfLastWeek && date <= addDays2(lastDateOfLastWeek, daysToAdd);
      });
      monthDates.push(...extraDates);
    }
    const weeks = monthDates.reduce((weeks2, date) => {
      const weekNumber = props.ISOWeek ? getISOWeek2(date) : getWeek2(date);
      const week = weeks2.find((week2) => week2.weekNumber === weekNumber);
      const day = new CalendarDay(date, month, dateLib);
      if (!week) {
        weeks2.push(new CalendarWeek(weekNumber, [day]));
      } else {
        week.days.push(day);
      }
      return weeks2;
    }, []);
    const dayPickerMonth = new CalendarMonth(month, weeks);
    months.push(dayPickerMonth);
    return months;
  }, []);
  if (!props.reverseMonths) {
    return dayPickerMonths;
  } else {
    return dayPickerMonths.reverse();
  }
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getNavMonth.js
function getNavMonths(props, dateLib) {
  let { startMonth, endMonth } = props;
  const { startOfYear: startOfYear2, startOfDay: startOfDay2, startOfMonth: startOfMonth2, endOfMonth: endOfMonth2, addYears: addYears2, endOfYear: endOfYear2, today } = dateLib;
  const hasYearDropdown = props.captionLayout === "dropdown" || props.captionLayout === "dropdown-years";
  if (startMonth) {
    startMonth = startOfMonth2(startMonth);
  } else if (!startMonth && hasYearDropdown) {
    startMonth = startOfYear2(addYears2(props.today ?? today(), -100));
  }
  if (endMonth) {
    endMonth = endOfMonth2(endMonth);
  } else if (!endMonth && hasYearDropdown) {
    endMonth = endOfYear2(props.today ?? today());
  }
  return [
    startMonth ? startOfDay2(startMonth) : startMonth,
    endMonth ? startOfDay2(endMonth) : endMonth
  ];
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getNextMonth.js
function getNextMonth(firstDisplayedMonth, calendarEndMonth, options, dateLib) {
  if (options.disableNavigation) {
    return void 0;
  }
  const { pagedNavigation, numberOfMonths = 1 } = options;
  const { startOfMonth: startOfMonth2, addMonths: addMonths2, differenceInCalendarMonths: differenceInCalendarMonths2 } = dateLib;
  const offset = pagedNavigation ? numberOfMonths : 1;
  const month = startOfMonth2(firstDisplayedMonth);
  if (!calendarEndMonth) {
    return addMonths2(month, offset);
  }
  const monthsDiff = differenceInCalendarMonths2(calendarEndMonth, firstDisplayedMonth);
  if (monthsDiff < numberOfMonths) {
    return void 0;
  }
  return addMonths2(month, offset);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getPreviousMonth.js
function getPreviousMonth(firstDisplayedMonth, calendarStartMonth, options, dateLib) {
  if (options.disableNavigation) {
    return void 0;
  }
  const { pagedNavigation, numberOfMonths } = options;
  const { startOfMonth: startOfMonth2, addMonths: addMonths2, differenceInCalendarMonths: differenceInCalendarMonths2 } = dateLib;
  const offset = pagedNavigation ? numberOfMonths ?? 1 : 1;
  const month = startOfMonth2(firstDisplayedMonth);
  if (!calendarStartMonth) {
    return addMonths2(month, -offset);
  }
  const monthsDiff = differenceInCalendarMonths2(month, calendarStartMonth);
  if (monthsDiff <= 0) {
    return void 0;
  }
  return addMonths2(month, -offset);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getWeeks.js
function getWeeks(months) {
  const initialWeeks = [];
  return months.reduce((weeks, month) => {
    return weeks.concat(month.weeks.slice());
  }, initialWeeks.slice());
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/useControlledValue.js
var import_react30 = __toESM(require_react(), 1);
function useControlledValue(defaultValue, controlledValue) {
  const [uncontrolledValue, setValue] = (0, import_react30.useState)(defaultValue);
  const value = controlledValue === void 0 ? uncontrolledValue : controlledValue;
  return [value, setValue];
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/useCalendar.js
function useCalendar(props, dateLib) {
  const [navStart, navEnd] = getNavMonths(props, dateLib);
  const { startOfMonth: startOfMonth2, endOfMonth: endOfMonth2 } = dateLib;
  const initialMonth = getInitialMonth(props, navStart, navEnd, dateLib);
  const [firstMonth, setFirstMonth] = useControlledValue(
    initialMonth,
    // initialMonth is always computed from props.month if provided
    props.month ? initialMonth : void 0
  );
  (0, import_react31.useEffect)(() => {
    const newInitialMonth = getInitialMonth(props, navStart, navEnd, dateLib);
    setFirstMonth(newInitialMonth);
  }, [props.timeZone]);
  const { months, weeks, days, previousMonth, nextMonth } = (0, import_react31.useMemo)(() => {
    const displayMonths = getDisplayMonths(firstMonth, navEnd, { numberOfMonths: props.numberOfMonths }, dateLib);
    const dates = getDates(displayMonths, props.endMonth ? endOfMonth2(props.endMonth) : void 0, {
      ISOWeek: props.ISOWeek,
      fixedWeeks: props.fixedWeeks,
      broadcastCalendar: props.broadcastCalendar
    }, dateLib);
    const months2 = getMonths(displayMonths, dates, {
      broadcastCalendar: props.broadcastCalendar,
      fixedWeeks: props.fixedWeeks,
      ISOWeek: props.ISOWeek,
      reverseMonths: props.reverseMonths
    }, dateLib);
    const weeks2 = getWeeks(months2);
    const days2 = getDays(months2);
    const previousMonth2 = getPreviousMonth(firstMonth, navStart, props, dateLib);
    const nextMonth2 = getNextMonth(firstMonth, navEnd, props, dateLib);
    return {
      months: months2,
      weeks: weeks2,
      days: days2,
      previousMonth: previousMonth2,
      nextMonth: nextMonth2
    };
  }, [
    dateLib,
    firstMonth.getTime(),
    navEnd?.getTime(),
    navStart?.getTime(),
    props.disableNavigation,
    props.broadcastCalendar,
    props.endMonth?.getTime(),
    props.fixedWeeks,
    props.ISOWeek,
    props.numberOfMonths,
    props.pagedNavigation,
    props.reverseMonths
  ]);
  const { disableNavigation, onMonthChange } = props;
  const isDayInCalendar = (day) => weeks.some((week) => week.days.some((d2) => d2.isEqualTo(day)));
  const goToMonth = (date) => {
    if (disableNavigation) {
      return;
    }
    let newMonth = startOfMonth2(date);
    if (navStart && newMonth < startOfMonth2(navStart)) {
      newMonth = startOfMonth2(navStart);
    }
    if (navEnd && newMonth > startOfMonth2(navEnd)) {
      newMonth = startOfMonth2(navEnd);
    }
    setFirstMonth(newMonth);
    onMonthChange?.(newMonth);
  };
  const goToDay = (day) => {
    if (isDayInCalendar(day)) {
      return;
    }
    goToMonth(day.date);
  };
  const calendar = {
    months,
    weeks,
    days,
    navStart,
    navEnd,
    previousMonth,
    nextMonth,
    goToMonth,
    goToDay
  };
  return calendar;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/useFocus.js
var import_react32 = __toESM(require_react(), 1);

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/calculateFocusTarget.js
var FocusTargetPriority;
(function(FocusTargetPriority2) {
  FocusTargetPriority2[FocusTargetPriority2["Today"] = 0] = "Today";
  FocusTargetPriority2[FocusTargetPriority2["Selected"] = 1] = "Selected";
  FocusTargetPriority2[FocusTargetPriority2["LastFocused"] = 2] = "LastFocused";
  FocusTargetPriority2[FocusTargetPriority2["FocusedModifier"] = 3] = "FocusedModifier";
})(FocusTargetPriority || (FocusTargetPriority = {}));
function isFocusableDay(modifiers) {
  return !modifiers[DayFlag.disabled] && !modifiers[DayFlag.hidden] && !modifiers[DayFlag.outside];
}
function calculateFocusTarget(days, getModifiers, isSelected, lastFocused) {
  let focusTarget;
  let foundFocusTargetPriority = -1;
  for (const day of days) {
    const modifiers = getModifiers(day);
    if (isFocusableDay(modifiers)) {
      if (modifiers[DayFlag.focused] && foundFocusTargetPriority < FocusTargetPriority.FocusedModifier) {
        focusTarget = day;
        foundFocusTargetPriority = FocusTargetPriority.FocusedModifier;
      } else if (lastFocused?.isEqualTo(day) && foundFocusTargetPriority < FocusTargetPriority.LastFocused) {
        focusTarget = day;
        foundFocusTargetPriority = FocusTargetPriority.LastFocused;
      } else if (isSelected(day.date) && foundFocusTargetPriority < FocusTargetPriority.Selected) {
        focusTarget = day;
        foundFocusTargetPriority = FocusTargetPriority.Selected;
      } else if (modifiers[DayFlag.today] && foundFocusTargetPriority < FocusTargetPriority.Today) {
        focusTarget = day;
        foundFocusTargetPriority = FocusTargetPriority.Today;
      }
    }
  }
  if (!focusTarget) {
    focusTarget = days.find((day) => isFocusableDay(getModifiers(day)));
  }
  return focusTarget;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getFocusableDate.js
function getFocusableDate(moveBy, moveDir, refDate, navStart, navEnd, props, dateLib) {
  const { ISOWeek, broadcastCalendar } = props;
  const { addDays: addDays2, addMonths: addMonths2, addWeeks: addWeeks2, addYears: addYears2, endOfBroadcastWeek: endOfBroadcastWeek2, endOfISOWeek: endOfISOWeek2, endOfWeek: endOfWeek2, max: max2, min: min2, startOfBroadcastWeek: startOfBroadcastWeek2, startOfISOWeek: startOfISOWeek2, startOfWeek: startOfWeek2 } = dateLib;
  const moveFns = {
    day: addDays2,
    week: addWeeks2,
    month: addMonths2,
    year: addYears2,
    startOfWeek: (date) => broadcastCalendar ? startOfBroadcastWeek2(date, dateLib) : ISOWeek ? startOfISOWeek2(date) : startOfWeek2(date),
    endOfWeek: (date) => broadcastCalendar ? endOfBroadcastWeek2(date) : ISOWeek ? endOfISOWeek2(date) : endOfWeek2(date)
  };
  let focusableDate = moveFns[moveBy](refDate, moveDir === "after" ? 1 : -1);
  if (moveDir === "before" && navStart) {
    focusableDate = max2([navStart, focusableDate]);
  } else if (moveDir === "after" && navEnd) {
    focusableDate = min2([navEnd, focusableDate]);
  }
  return focusableDate;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/helpers/getNextFocus.js
function getNextFocus(moveBy, moveDir, refDay, calendarStartMonth, calendarEndMonth, props, dateLib, attempt = 0) {
  if (attempt > 365) {
    return void 0;
  }
  const focusableDate = getFocusableDate(moveBy, moveDir, refDay.date, calendarStartMonth, calendarEndMonth, props, dateLib);
  const isDisabled = Boolean(props.disabled && dateMatchModifiers(focusableDate, props.disabled, dateLib));
  const isHidden = Boolean(props.hidden && dateMatchModifiers(focusableDate, props.hidden, dateLib));
  const targetMonth = focusableDate;
  const focusDay = new CalendarDay(focusableDate, targetMonth, dateLib);
  if (!isDisabled && !isHidden) {
    return focusDay;
  }
  return getNextFocus(moveBy, moveDir, focusDay, calendarStartMonth, calendarEndMonth, props, dateLib, attempt + 1);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/useFocus.js
function useFocus(props, calendar, getModifiers, isSelected, dateLib) {
  const { autoFocus } = props;
  const [lastFocused, setLastFocused] = (0, import_react32.useState)();
  const focusTarget = calculateFocusTarget(calendar.days, getModifiers, isSelected || (() => false), lastFocused);
  const [focusedDay, setFocused] = (0, import_react32.useState)(autoFocus ? focusTarget : void 0);
  const blur = () => {
    setLastFocused(focusedDay);
    setFocused(void 0);
  };
  const moveFocus = (moveBy, moveDir) => {
    if (!focusedDay)
      return;
    const nextFocus = getNextFocus(moveBy, moveDir, focusedDay, calendar.navStart, calendar.navEnd, props, dateLib);
    if (!nextFocus)
      return;
    if (props.disableNavigation) {
      const isNextInCalendar = calendar.days.some((day) => day.isEqualTo(nextFocus));
      if (!isNextInCalendar) {
        return;
      }
    }
    calendar.goToDay(nextFocus);
    setFocused(nextFocus);
  };
  const isFocusTarget = (day) => {
    return Boolean(focusTarget?.isEqualTo(day));
  };
  const useFocus2 = {
    isFocusTarget,
    setFocused,
    focused: focusedDay,
    blur,
    moveFocus
  };
  return useFocus2;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/selection/useMulti.js
function useMulti(props, dateLib) {
  const { selected: initiallySelected, required, onSelect } = props;
  const [internallySelected, setSelected] = useControlledValue(initiallySelected, onSelect ? initiallySelected : void 0);
  const selected = !onSelect ? internallySelected : initiallySelected;
  const { isSameDay: isSameDay2 } = dateLib;
  const isSelected = (date) => {
    return selected?.some((d2) => isSameDay2(d2, date)) ?? false;
  };
  const { min: min2, max: max2 } = props;
  const select = (triggerDate, modifiers, e2) => {
    let newDates = [...selected ?? []];
    if (isSelected(triggerDate)) {
      if (selected?.length === min2) {
        return;
      }
      if (required && selected?.length === 1) {
        return;
      }
      newDates = selected?.filter((d2) => !isSameDay2(d2, triggerDate));
    } else {
      if (selected?.length === max2) {
        newDates = [triggerDate];
      } else {
        newDates = [...newDates, triggerDate];
      }
    }
    if (!onSelect) {
      setSelected(newDates);
    }
    onSelect?.(newDates, triggerDate, modifiers, e2);
    return newDates;
  };
  return {
    selected,
    select,
    isSelected
  };
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/utils/addToRange.js
function addToRange(date, initialRange, min2 = 0, max2 = 0, required = false, dateLib = defaultDateLib) {
  const { from, to } = initialRange || {};
  const { isSameDay: isSameDay2, isAfter: isAfter2, isBefore: isBefore2 } = dateLib;
  let range;
  if (!from && !to) {
    range = { from: date, to: min2 > 0 ? void 0 : date };
  } else if (from && !to) {
    if (isSameDay2(from, date)) {
      if (min2 === 0) {
        range = { from, to: date };
      } else if (required) {
        range = { from, to: void 0 };
      } else {
        range = void 0;
      }
    } else if (isBefore2(date, from)) {
      range = { from: date, to: from };
    } else {
      range = { from, to: date };
    }
  } else if (from && to) {
    if (isSameDay2(from, date) && isSameDay2(to, date)) {
      if (required) {
        range = { from, to };
      } else {
        range = void 0;
      }
    } else if (isSameDay2(from, date)) {
      range = { from, to: min2 > 0 ? void 0 : date };
    } else if (isSameDay2(to, date)) {
      range = { from: date, to: min2 > 0 ? void 0 : date };
    } else if (isBefore2(date, from)) {
      range = { from: date, to };
    } else if (isAfter2(date, from)) {
      range = { from, to: date };
    } else if (isAfter2(date, to)) {
      range = { from, to: date };
    } else {
      throw new Error("Invalid range");
    }
  }
  if (range?.from && range?.to) {
    const diff = dateLib.differenceInCalendarDays(range.to, range.from);
    if (max2 > 0 && diff > max2) {
      range = { from: date, to: void 0 };
    } else if (min2 > 1 && diff < min2) {
      range = { from: date, to: void 0 };
    }
  }
  return range;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/utils/rangeContainsDayOfWeek.js
function rangeContainsDayOfWeek(range, dayOfWeek, dateLib = defaultDateLib) {
  const dayOfWeekArr = !Array.isArray(dayOfWeek) ? [dayOfWeek] : dayOfWeek;
  let date = range.from;
  const totalDays = dateLib.differenceInCalendarDays(range.to, range.from);
  const totalDaysLimit = Math.min(totalDays, 6);
  for (let i2 = 0; i2 <= totalDaysLimit; i2++) {
    if (dayOfWeekArr.includes(date.getDay())) {
      return true;
    }
    date = dateLib.addDays(date, 1);
  }
  return false;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/utils/rangeOverlaps.js
function rangeOverlaps(rangeLeft, rangeRight, dateLib = defaultDateLib) {
  return rangeIncludesDate(rangeLeft, rangeRight.from, false, dateLib) || rangeIncludesDate(rangeLeft, rangeRight.to, false, dateLib) || rangeIncludesDate(rangeRight, rangeLeft.from, false, dateLib) || rangeIncludesDate(rangeRight, rangeLeft.to, false, dateLib);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/utils/rangeContainsModifiers.js
function rangeContainsModifiers(range, modifiers, dateLib = defaultDateLib) {
  const matchers = Array.isArray(modifiers) ? modifiers : [modifiers];
  const nonFunctionMatchers = matchers.filter((matcher) => typeof matcher !== "function");
  const nonFunctionMatchersResult = nonFunctionMatchers.some((matcher) => {
    if (typeof matcher === "boolean")
      return matcher;
    if (dateLib.isDate(matcher)) {
      return rangeIncludesDate(range, matcher, false, dateLib);
    }
    if (isDatesArray(matcher, dateLib)) {
      return matcher.some((date) => rangeIncludesDate(range, date, false, dateLib));
    }
    if (isDateRange(matcher)) {
      if (matcher.from && matcher.to) {
        return rangeOverlaps(range, { from: matcher.from, to: matcher.to }, dateLib);
      }
      return false;
    }
    if (isDayOfWeekType(matcher)) {
      return rangeContainsDayOfWeek(range, matcher.dayOfWeek, dateLib);
    }
    if (isDateInterval(matcher)) {
      const isClosedInterval = dateLib.isAfter(matcher.before, matcher.after);
      if (isClosedInterval) {
        return rangeOverlaps(range, {
          from: dateLib.addDays(matcher.after, 1),
          to: dateLib.addDays(matcher.before, -1)
        }, dateLib);
      }
      return dateMatchModifiers(range.from, matcher, dateLib) || dateMatchModifiers(range.to, matcher, dateLib);
    }
    if (isDateAfterType(matcher) || isDateBeforeType(matcher)) {
      return dateMatchModifiers(range.from, matcher, dateLib) || dateMatchModifiers(range.to, matcher, dateLib);
    }
    return false;
  });
  if (nonFunctionMatchersResult) {
    return true;
  }
  const functionMatchers = matchers.filter((matcher) => typeof matcher === "function");
  if (functionMatchers.length) {
    let date = range.from;
    const totalDays = dateLib.differenceInCalendarDays(range.to, range.from);
    for (let i2 = 0; i2 <= totalDays; i2++) {
      if (functionMatchers.some((matcher) => matcher(date))) {
        return true;
      }
      date = dateLib.addDays(date, 1);
    }
  }
  return false;
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/selection/useRange.js
function useRange(props, dateLib) {
  const { disabled: disabled2, excludeDisabled, resetOnSelect, selected: initiallySelected, required, onSelect } = props;
  const [internallySelected, setSelected] = useControlledValue(initiallySelected, onSelect ? initiallySelected : void 0);
  const selected = !onSelect ? internallySelected : initiallySelected;
  const isSelected = (date) => selected && rangeIncludesDate(selected, date, false, dateLib);
  const select = (triggerDate, modifiers, e2) => {
    const { min: min2, max: max2 } = props;
    let newRange;
    if (triggerDate) {
      const selectedFrom = selected?.from;
      const selectedTo = selected?.to;
      const hasFullRange = !!selectedFrom && !!selectedTo;
      const isClickingSingleDayRange = !!selectedFrom && !!selectedTo && dateLib.isSameDay(selectedFrom, selectedTo) && dateLib.isSameDay(triggerDate, selectedFrom);
      if (resetOnSelect && (hasFullRange || !selected?.from)) {
        if (!required && isClickingSingleDayRange) {
          newRange = void 0;
        } else {
          newRange = { from: triggerDate, to: void 0 };
        }
      } else {
        newRange = addToRange(triggerDate, selected, min2, max2, required, dateLib);
      }
    }
    if (excludeDisabled && disabled2 && newRange?.from && newRange.to) {
      if (rangeContainsModifiers({ from: newRange.from, to: newRange.to }, disabled2, dateLib)) {
        newRange.from = triggerDate;
        newRange.to = void 0;
      }
    }
    if (!onSelect) {
      setSelected(newRange);
    }
    onSelect?.(newRange, triggerDate, modifiers, e2);
    return newRange;
  };
  return {
    selected,
    select,
    isSelected
  };
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/selection/useSingle.js
function useSingle(props, dateLib) {
  const { selected: initiallySelected, required, onSelect } = props;
  const [internallySelected, setSelected] = useControlledValue(initiallySelected, onSelect ? initiallySelected : void 0);
  const selected = !onSelect ? internallySelected : initiallySelected;
  const { isSameDay: isSameDay2 } = dateLib;
  const isSelected = (compareDate) => {
    return selected ? isSameDay2(selected, compareDate) : false;
  };
  const select = (triggerDate, modifiers, e2) => {
    let newDate = triggerDate;
    if (!required && selected && selected && isSameDay2(triggerDate, selected)) {
      newDate = void 0;
    }
    if (!onSelect) {
      setSelected(newDate);
    }
    if (required) {
      onSelect?.(newDate, triggerDate, modifiers, e2);
    } else {
      onSelect?.(newDate, triggerDate, modifiers, e2);
    }
    return newDate;
  };
  return {
    selected,
    select,
    isSelected
  };
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/useSelection.js
function useSelection(props, dateLib) {
  const single = useSingle(props, dateLib);
  const multi = useMulti(props, dateLib);
  const range = useRange(props, dateLib);
  switch (props.mode) {
    case "single":
      return single;
    case "multiple":
      return multi;
    case "range":
      return range;
    default:
      return void 0;
  }
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/utils/toTimeZone.js
function toTimeZone(date, timeZone) {
  if (date instanceof TZDate && date.timeZone === timeZone) {
    return date;
  }
  return new TZDate(date, timeZone);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/utils/convertMatchersToTimeZone.js
function toZoneNoon(date, timeZone, noonSafe) {
  if (!noonSafe)
    return toTimeZone(date, timeZone);
  const zoned = toTimeZone(date, timeZone);
  const noonZoned = new TZDate(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), 12, 0, 0, timeZone);
  return new Date(noonZoned.getTime());
}
function convertMatcher(matcher, timeZone, noonSafe) {
  if (typeof matcher === "boolean" || typeof matcher === "function") {
    return matcher;
  }
  if (matcher instanceof Date) {
    return toZoneNoon(matcher, timeZone, noonSafe);
  }
  if (Array.isArray(matcher)) {
    return matcher.map((value) => value instanceof Date ? toZoneNoon(value, timeZone, noonSafe) : value);
  }
  if (isDateRange(matcher)) {
    return {
      ...matcher,
      from: matcher.from ? toTimeZone(matcher.from, timeZone) : matcher.from,
      to: matcher.to ? toTimeZone(matcher.to, timeZone) : matcher.to
    };
  }
  if (isDateInterval(matcher)) {
    return {
      before: toZoneNoon(matcher.before, timeZone, noonSafe),
      after: toZoneNoon(matcher.after, timeZone, noonSafe)
    };
  }
  if (isDateAfterType(matcher)) {
    return {
      after: toZoneNoon(matcher.after, timeZone, noonSafe)
    };
  }
  if (isDateBeforeType(matcher)) {
    return {
      before: toZoneNoon(matcher.before, timeZone, noonSafe)
    };
  }
  return matcher;
}
function convertMatchersToTimeZone(matchers, timeZone, noonSafe) {
  if (!matchers) {
    return matchers;
  }
  if (Array.isArray(matchers)) {
    return matchers.map((matcher) => convertMatcher(matcher, timeZone, noonSafe));
  }
  return convertMatcher(matchers, timeZone, noonSafe);
}

// node_modules/@daypicker/react/node_modules/react-day-picker/dist/esm/DayPicker.js
function DayPicker(initialProps) {
  let props = initialProps;
  const timeZone = props.timeZone;
  if (timeZone) {
    props = {
      ...initialProps,
      timeZone
    };
    if (props.today) {
      props.today = toTimeZone(props.today, timeZone);
    }
    if (props.month) {
      props.month = toTimeZone(props.month, timeZone);
    }
    if (props.defaultMonth) {
      props.defaultMonth = toTimeZone(props.defaultMonth, timeZone);
    }
    if (props.startMonth) {
      props.startMonth = toTimeZone(props.startMonth, timeZone);
    }
    if (props.endMonth) {
      props.endMonth = toTimeZone(props.endMonth, timeZone);
    }
    if (props.mode === "single" && props.selected) {
      props.selected = toTimeZone(props.selected, timeZone);
    } else if (props.mode === "multiple" && props.selected) {
      props.selected = props.selected?.map((date) => toTimeZone(date, timeZone));
    } else if (props.mode === "range" && props.selected) {
      props.selected = {
        from: props.selected.from ? toTimeZone(props.selected.from, timeZone) : props.selected.from,
        to: props.selected.to ? toTimeZone(props.selected.to, timeZone) : props.selected.to
      };
    }
    if (props.disabled !== void 0) {
      props.disabled = convertMatchersToTimeZone(props.disabled, timeZone);
    }
    if (props.hidden !== void 0) {
      props.hidden = convertMatchersToTimeZone(props.hidden, timeZone);
    }
    if (props.modifiers) {
      const nextModifiers = {};
      Object.keys(props.modifiers).forEach((key) => {
        nextModifiers[key] = convertMatchersToTimeZone(props.modifiers?.[key], timeZone);
      });
      props.modifiers = nextModifiers;
    }
  }
  const { components, formatters: formatters2, labels, dateLib, locale, classNames } = (0, import_react33.useMemo)(() => {
    const locale2 = { ...enUS2, ...props.locale };
    const weekStartsOn = props.broadcastCalendar ? 1 : props.weekStartsOn;
    const noonOverrides = props.noonSafe && props.timeZone ? createNoonOverrides(props.timeZone, {
      weekStartsOn,
      locale: locale2
    }) : void 0;
    const overrides = props.dateLib && noonOverrides ? { ...noonOverrides, ...props.dateLib } : props.dateLib ?? noonOverrides;
    const dateLib2 = new DateLib({
      locale: locale2,
      weekStartsOn,
      firstWeekContainsDate: props.firstWeekContainsDate,
      useAdditionalWeekYearTokens: props.useAdditionalWeekYearTokens,
      useAdditionalDayOfYearTokens: props.useAdditionalDayOfYearTokens,
      timeZone: props.timeZone,
      numerals: props.numerals
    }, overrides);
    return {
      dateLib: dateLib2,
      components: getComponents(props.components),
      formatters: getFormatters(props.formatters),
      labels: getLabels(props.labels, dateLib2.options),
      locale: locale2,
      classNames: { ...getDefaultClassNames(), ...props.classNames }
    };
  }, [
    props.locale,
    props.broadcastCalendar,
    props.weekStartsOn,
    props.firstWeekContainsDate,
    props.useAdditionalWeekYearTokens,
    props.useAdditionalDayOfYearTokens,
    props.timeZone,
    props.numerals,
    props.dateLib,
    props.noonSafe,
    props.components,
    props.formatters,
    props.labels,
    props.classNames
  ]);
  if (!props.today) {
    props = { ...props, today: dateLib.today() };
  }
  const { captionLayout, mode, navLayout, numberOfMonths = 1, onDayBlur, onDayClick, onDayFocus, onDayKeyDown, onDayMouseEnter, onDayMouseLeave, onNextClick, onPrevClick, showWeekNumber, styles } = props;
  const { formatCaption: formatCaption2, formatDay: formatDay2, formatMonthDropdown: formatMonthDropdown2, formatWeekNumber: formatWeekNumber2, formatWeekNumberHeader: formatWeekNumberHeader2, formatWeekdayName: formatWeekdayName2, formatYearDropdown: formatYearDropdown2 } = formatters2;
  const calendar = useCalendar(props, dateLib);
  const { days, months, navStart, navEnd, previousMonth, nextMonth, goToMonth } = calendar;
  const getModifiers = createGetModifiers(days, props, navStart, navEnd, dateLib);
  const { isSelected, select, selected: selectedValue } = useSelection(props, dateLib) ?? {};
  const { blur, focused, isFocusTarget, moveFocus, setFocused } = useFocus(props, calendar, getModifiers, isSelected ?? (() => false), dateLib);
  const { labelDayButton: labelDayButton2, labelGridcell: labelGridcell2, labelGrid: labelGrid2, labelMonthDropdown: labelMonthDropdown2, labelNav: labelNav2, labelPrevious: labelPrevious2, labelNext: labelNext2, labelWeekday: labelWeekday2, labelWeekNumber: labelWeekNumber2, labelWeekNumberHeader: labelWeekNumberHeader2, labelYearDropdown: labelYearDropdown2 } = labels;
  const weekdays = (0, import_react33.useMemo)(() => getWeekdays(dateLib, props.ISOWeek, props.broadcastCalendar, props.today), [dateLib, props.ISOWeek, props.broadcastCalendar, props.today]);
  const isInteractive = mode !== void 0 || onDayClick !== void 0;
  const handlePreviousClick = (0, import_react33.useCallback)(() => {
    if (!previousMonth)
      return;
    goToMonth(previousMonth);
    onPrevClick?.(previousMonth);
  }, [previousMonth, goToMonth, onPrevClick]);
  const handleNextClick = (0, import_react33.useCallback)(() => {
    if (!nextMonth)
      return;
    goToMonth(nextMonth);
    onNextClick?.(nextMonth);
  }, [goToMonth, nextMonth, onNextClick]);
  const handleDayClick = (0, import_react33.useCallback)((day, m2) => (e2) => {
    e2.preventDefault();
    e2.stopPropagation();
    setFocused(day);
    if (m2.disabled) {
      return;
    }
    select?.(day.date, m2, e2);
    onDayClick?.(day.date, m2, e2);
  }, [select, onDayClick, setFocused]);
  const handleDayFocus = (0, import_react33.useCallback)((day, m2) => (e2) => {
    setFocused(day);
    onDayFocus?.(day.date, m2, e2);
  }, [onDayFocus, setFocused]);
  const handleDayBlur = (0, import_react33.useCallback)((day, m2) => (e2) => {
    blur();
    onDayBlur?.(day.date, m2, e2);
  }, [blur, onDayBlur]);
  const handleDayKeyDown = (0, import_react33.useCallback)((day, modifiers) => (e2) => {
    const keyMap = {
      ArrowLeft: [
        e2.shiftKey ? "month" : "day",
        props.dir === "rtl" ? "after" : "before"
      ],
      ArrowRight: [
        e2.shiftKey ? "month" : "day",
        props.dir === "rtl" ? "before" : "after"
      ],
      ArrowDown: [e2.shiftKey ? "year" : "week", "after"],
      ArrowUp: [e2.shiftKey ? "year" : "week", "before"],
      PageUp: [e2.shiftKey ? "year" : "month", "before"],
      PageDown: [e2.shiftKey ? "year" : "month", "after"],
      Home: ["startOfWeek", "before"],
      End: ["endOfWeek", "after"]
    };
    if (keyMap[e2.key]) {
      e2.preventDefault();
      e2.stopPropagation();
      const [moveBy, moveDir] = keyMap[e2.key];
      moveFocus(moveBy, moveDir);
    }
    onDayKeyDown?.(day.date, modifiers, e2);
  }, [moveFocus, onDayKeyDown, props.dir]);
  const handleDayMouseEnter = (0, import_react33.useCallback)((day, modifiers) => (e2) => {
    onDayMouseEnter?.(day.date, modifiers, e2);
  }, [onDayMouseEnter]);
  const handleDayMouseLeave = (0, import_react33.useCallback)((day, modifiers) => (e2) => {
    onDayMouseLeave?.(day.date, modifiers, e2);
  }, [onDayMouseLeave]);
  const handleMonthChange = (0, import_react33.useCallback)((date, monthOffset) => (e2) => {
    const selectedMonth = Number(e2.target.value);
    const month = dateLib.setMonth(dateLib.startOfMonth(date), selectedMonth);
    goToMonth(dateLib.addMonths(month, -monthOffset));
  }, [dateLib, goToMonth]);
  const handleYearChange = (0, import_react33.useCallback)((date, monthOffset) => (e2) => {
    const selectedYear = Number(e2.target.value);
    const month = dateLib.setYear(dateLib.startOfMonth(date), selectedYear);
    goToMonth(dateLib.addMonths(month, -monthOffset));
  }, [dateLib, goToMonth]);
  const { className, style } = (0, import_react33.useMemo)(() => ({
    className: [classNames[UI.Root], props.className].filter(Boolean).join(" "),
    style: { ...styles?.[UI.Root], ...props.style }
  }), [classNames, props.className, props.style, styles]);
  const dataAttributes = getDataAttributes(props);
  const getDropdownStyle = (dropdown) => {
    const dropdownStyle = styles?.[UI.Dropdown];
    const specificDropdownStyle = styles?.[dropdown];
    if (!dropdownStyle && !specificDropdownStyle) {
      return void 0;
    }
    return {
      ...dropdownStyle,
      ...specificDropdownStyle
    };
  };
  const rootElRef = (0, import_react33.useRef)(null);
  useAnimation(rootElRef, Boolean(props.animate), {
    classNames,
    months,
    focused,
    dateLib
  });
  const contextValue = {
    dayPickerProps: props,
    selected: selectedValue,
    select,
    isSelected,
    months,
    nextMonth,
    previousMonth,
    goToMonth,
    getModifiers,
    components,
    classNames,
    styles,
    labels,
    formatters: formatters2
  };
  return import_react33.default.createElement(
    dayPickerContext.Provider,
    { value: contextValue },
    import_react33.default.createElement(
      components.Root,
      { rootRef: props.animate ? rootElRef : void 0, className, style, dir: props.dir, id: props.id, lang: props.lang ?? locale.code, nonce: props.nonce, title: props.title, role: props.role, "aria-label": props["aria-label"], "aria-labelledby": props["aria-labelledby"], ...dataAttributes },
      import_react33.default.createElement(
        components.Months,
        { className: classNames[UI.Months], style: styles?.[UI.Months] },
        !props.hideNavigation && !navLayout && import_react33.default.createElement(components.Nav, { "data-animated-nav": props.animate ? "true" : void 0, className: classNames[UI.Nav], style: styles?.[UI.Nav], "aria-label": labelNav2(), onPreviousClick: handlePreviousClick, onNextClick: handleNextClick, previousMonth, nextMonth }),
        months.map((calendarMonth, displayIndex) => {
          const monthOffset = props.reverseMonths ? months.length - 1 - displayIndex : displayIndex;
          return import_react33.default.createElement(
            components.Month,
            {
              "data-animated-month": props.animate ? "true" : void 0,
              className: classNames[UI.Month],
              style: styles?.[UI.Month],
              // biome-ignore lint/suspicious/noArrayIndexKey: breaks animation
              key: displayIndex,
              displayIndex,
              calendarMonth
            },
            navLayout === "around" && !props.hideNavigation && displayIndex === 0 && import_react33.default.createElement(
              components.PreviousMonthButton,
              { type: "button", className: classNames[UI.PreviousMonthButton], style: styles?.[UI.PreviousMonthButton], tabIndex: previousMonth ? void 0 : -1, "aria-disabled": previousMonth ? void 0 : true, "aria-label": labelPrevious2(previousMonth), onClick: handlePreviousClick, "data-animated-button": props.animate ? "true" : void 0 },
              import_react33.default.createElement(components.Chevron, { disabled: previousMonth ? void 0 : true, className: classNames[UI.Chevron], style: styles?.[UI.Chevron], orientation: props.dir === "rtl" ? "right" : "left" })
            ),
            import_react33.default.createElement(components.MonthCaption, { "data-animated-caption": props.animate ? "true" : void 0, className: classNames[UI.MonthCaption], style: styles?.[UI.MonthCaption], calendarMonth, displayIndex }, captionLayout?.startsWith("dropdown") ? import_react33.default.createElement(
              components.DropdownNav,
              { className: classNames[UI.Dropdowns], style: styles?.[UI.Dropdowns] },
              (() => {
                const monthControl = captionLayout === "dropdown" || captionLayout === "dropdown-months" ? import_react33.default.createElement(components.MonthsDropdown, { key: "month", className: classNames[UI.MonthsDropdown], "aria-label": labelMonthDropdown2(), disabled: Boolean(props.disableNavigation), onChange: handleMonthChange(calendarMonth.date, monthOffset), options: getMonthOptions(calendarMonth.date, navStart, navEnd, formatters2, dateLib), style: getDropdownStyle(UI.MonthsDropdown), value: dateLib.getMonth(calendarMonth.date) }) : import_react33.default.createElement("span", { key: "month" }, formatMonthDropdown2(calendarMonth.date, dateLib));
                const yearControl = captionLayout === "dropdown" || captionLayout === "dropdown-years" ? import_react33.default.createElement(components.YearsDropdown, { key: "year", className: classNames[UI.YearsDropdown], "aria-label": labelYearDropdown2(dateLib.options), disabled: Boolean(props.disableNavigation), onChange: handleYearChange(calendarMonth.date, monthOffset), options: getYearOptions(navStart, navEnd, formatters2, dateLib, Boolean(props.reverseYears)), style: getDropdownStyle(UI.YearsDropdown), value: dateLib.getYear(calendarMonth.date) }) : import_react33.default.createElement("span", { key: "year" }, formatYearDropdown2(calendarMonth.date, dateLib));
                const controls = dateLib.getMonthYearOrder() === "year-first" ? [yearControl, monthControl] : [monthControl, yearControl];
                return controls;
              })(),
              import_react33.default.createElement("span", { role: "status", "aria-live": "polite", style: {
                border: 0,
                clip: "rect(0 0 0 0)",
                height: "1px",
                margin: "-1px",
                overflow: "hidden",
                padding: 0,
                position: "absolute",
                width: "1px",
                whiteSpace: "nowrap",
                wordWrap: "normal"
              } }, formatCaption2(calendarMonth.date, dateLib.options, dateLib))
            ) : import_react33.default.createElement(components.CaptionLabel, { className: classNames[UI.CaptionLabel], style: styles?.[UI.CaptionLabel], role: "status", "aria-live": "polite" }, formatCaption2(calendarMonth.date, dateLib.options, dateLib))),
            navLayout === "around" && !props.hideNavigation && displayIndex === numberOfMonths - 1 && import_react33.default.createElement(
              components.NextMonthButton,
              { type: "button", className: classNames[UI.NextMonthButton], style: styles?.[UI.NextMonthButton], tabIndex: nextMonth ? void 0 : -1, "aria-disabled": nextMonth ? void 0 : true, "aria-label": labelNext2(nextMonth), onClick: handleNextClick, "data-animated-button": props.animate ? "true" : void 0 },
              import_react33.default.createElement(components.Chevron, { disabled: nextMonth ? void 0 : true, className: classNames[UI.Chevron], style: styles?.[UI.Chevron], orientation: props.dir === "rtl" ? "left" : "right" })
            ),
            displayIndex === numberOfMonths - 1 && navLayout === "after" && !props.hideNavigation && import_react33.default.createElement(components.Nav, { "data-animated-nav": props.animate ? "true" : void 0, className: classNames[UI.Nav], style: styles?.[UI.Nav], "aria-label": labelNav2(), onPreviousClick: handlePreviousClick, onNextClick: handleNextClick, previousMonth, nextMonth }),
            import_react33.default.createElement(
              components.MonthGrid,
              { role: "grid", "aria-multiselectable": mode === "multiple" || mode === "range", "aria-label": labelGrid2(calendarMonth.date, dateLib.options, dateLib) || void 0, className: classNames[UI.MonthGrid], style: styles?.[UI.MonthGrid] },
              !props.hideWeekdays && import_react33.default.createElement(
                components.Weekdays,
                { "data-animated-weekdays": props.animate ? "true" : void 0, className: classNames[UI.Weekdays], style: styles?.[UI.Weekdays] },
                showWeekNumber && import_react33.default.createElement(components.WeekNumberHeader, { "aria-label": labelWeekNumberHeader2(dateLib.options), className: classNames[UI.WeekNumberHeader], style: styles?.[UI.WeekNumberHeader], scope: "col" }, formatWeekNumberHeader2()),
                weekdays.map((weekday) => import_react33.default.createElement(components.Weekday, { "aria-label": labelWeekday2(weekday, dateLib.options, dateLib), className: classNames[UI.Weekday], key: String(weekday), style: styles?.[UI.Weekday], scope: "col" }, formatWeekdayName2(weekday, dateLib.options, dateLib)))
              ),
              import_react33.default.createElement(components.Weeks, { "data-animated-weeks": props.animate ? "true" : void 0, className: classNames[UI.Weeks], style: styles?.[UI.Weeks] }, calendarMonth.weeks.map((week) => {
                return import_react33.default.createElement(
                  components.Week,
                  { className: classNames[UI.Week], key: week.weekNumber, style: styles?.[UI.Week], week },
                  showWeekNumber && import_react33.default.createElement(components.WeekNumber, { week, style: styles?.[UI.WeekNumber], "aria-label": labelWeekNumber2(week.weekNumber, {
                    locale
                  }), className: classNames[UI.WeekNumber], scope: "row", role: "rowheader" }, formatWeekNumber2(week.weekNumber, dateLib)),
                  week.days.map((day) => {
                    const { date } = day;
                    const modifiers = getModifiers(day);
                    modifiers[DayFlag.focused] = !modifiers.hidden && Boolean(focused?.isEqualTo(day));
                    modifiers[SelectionState.selected] = isSelected?.(date) || modifiers.selected;
                    if (isDateRange(selectedValue)) {
                      const { from, to } = selectedValue;
                      modifiers[SelectionState.range_start] = Boolean(from && to && dateLib.isSameDay(date, from));
                      modifiers[SelectionState.range_end] = Boolean(from && to && dateLib.isSameDay(date, to));
                      modifiers[SelectionState.range_middle] = rangeIncludesDate(selectedValue, date, true, dateLib);
                    }
                    const style2 = getStyleForModifiers(modifiers, styles, props.modifiersStyles);
                    const className2 = getClassNamesForModifiers(modifiers, classNames, props.modifiersClassNames);
                    const ariaLabel = !isInteractive && !modifiers.hidden ? labelGridcell2(date, modifiers, dateLib.options, dateLib) : void 0;
                    return import_react33.default.createElement(components.Day, { key: `${day.isoDate}_${day.displayMonthId}`, day, modifiers, className: className2.join(" "), style: style2, role: "gridcell", "aria-selected": modifiers.selected || void 0, "aria-label": ariaLabel, "data-day": day.isoDate, "data-month": day.outside ? day.dateMonthId : void 0, "data-selected": modifiers.selected || void 0, "data-disabled": modifiers.disabled || void 0, "data-hidden": modifiers.hidden || void 0, "data-outside": day.outside || void 0, "data-focused": modifiers.focused || void 0, "data-today": modifiers.today || void 0 }, !modifiers.hidden && isInteractive ? import_react33.default.createElement(components.DayButton, { className: classNames[UI.DayButton], style: styles?.[UI.DayButton], type: "button", day, modifiers, disabled: !modifiers.focused && modifiers.disabled || void 0, "aria-disabled": modifiers.focused && modifiers.disabled || void 0, tabIndex: isFocusTarget(day) ? 0 : -1, "aria-label": labelDayButton2(date, modifiers, dateLib.options, dateLib), onClick: handleDayClick(day, modifiers), onBlur: handleDayBlur(day, modifiers), onFocus: handleDayFocus(day, modifiers), onKeyDown: handleDayKeyDown(day, modifiers), onMouseEnter: handleDayMouseEnter(day, modifiers), onMouseLeave: handleDayMouseLeave(day, modifiers) }, formatDay2(date, dateLib.options, dateLib)) : !modifiers.hidden && formatDay2(day.date, dateLib.options, dateLib));
                  })
                );
              }))
            )
          );
        })
      ),
      props.footer && import_react33.default.createElement(components.Footer, { className: classNames[UI.Footer], style: styles?.[UI.Footer], role: "status", "aria-live": "polite" }, props.footer)
    )
  );
}

// packages/ui/build-module/calendar/calendar.mjs
var import_element11 = __toESM(require_element(), 1);

// packages/ui/build-module/calendar/utils/components.mjs
var import_element7 = __toESM(require_element(), 1);
var import_compose = __toESM(require_compose(), 1);

// packages/icons/build-module/library/chevron-down.mjs
var import_primitives2 = __toESM(require_primitives(), 1);
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
var chevron_down_default = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_primitives2.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_primitives2.Path, { d: "M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" }) });

// packages/icons/build-module/library/chevron-left.mjs
var import_primitives3 = __toESM(require_primitives(), 1);
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
var chevron_left_default = /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_primitives3.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_primitives3.Path, { d: "M14.6 7l-1.2-1L8 12l5.4 6 1.2-1-4.6-5z" }) });

// packages/icons/build-module/library/chevron-right.mjs
var import_primitives4 = __toESM(require_primitives(), 1);
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var chevron_right_default = /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_primitives4.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_primitives4.Path, { d: "M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1 5.4-6z" }) });

// packages/icons/build-module/library/close-small.mjs
var import_primitives5 = __toESM(require_primitives(), 1);
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
var close_small_default = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_primitives5.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_primitives5.Path, { d: "M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z" }) });

// packages/icons/build-module/library/envelope.mjs
var import_primitives6 = __toESM(require_primitives(), 1);
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
var envelope_default = /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_primitives6.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_primitives6.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M3 7c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm2-.5h14c.3 0 .5.2.5.5v1L12 13.5 4.5 7.9V7c0-.3.2-.5.5-.5Zm-.5 3.3V17c0 .3.2.5.5.5h14c.3 0 .5-.2.5-.5V9.8L12 15.4 4.5 9.8Z" }) });

// packages/icons/build-module/library/error.mjs
var import_primitives7 = __toESM(require_primitives(), 1);
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
var error_default = /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_primitives7.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_primitives7.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M12.218 5.377a.25.25 0 0 0-.436 0l-7.29 12.96a.25.25 0 0 0 .218.373h14.58a.25.25 0 0 0 .218-.372l-7.29-12.96Zm-1.743-.735c.669-1.19 2.381-1.19 3.05 0l7.29 12.96a1.75 1.75 0 0 1-1.525 2.608H4.71a1.75 1.75 0 0 1-1.525-2.608l7.29-12.96ZM12.75 17.46h-1.5v-1.5h1.5v1.5Zm-1.5-3h1.5v-5h-1.5v5Z" }) });

// packages/icons/build-module/library/link.mjs
var import_primitives8 = __toESM(require_primitives(), 1);
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
var link_default = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_primitives8.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_primitives8.Path, { d: "M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z" }) });

// packages/icons/build-module/library/mobile.mjs
var import_primitives9 = __toESM(require_primitives(), 1);
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
var mobile_default = /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_primitives9.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_primitives9.Path, { d: "M15 4H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm.5 14c0 .3-.2.5-.5.5H9c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h6c.3 0 .5.2.5.5v12zm-4.5-.5h2V16h-2v1.5z" }) });

// packages/icons/build-module/library/pencil.mjs
var import_primitives10 = __toESM(require_primitives(), 1);
var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
var pencil_default = /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_primitives10.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_primitives10.Path, { d: "m19 7-3-3-8.5 8.5-1 4 4-1L19 7Zm-7 11.5H5V20h7v-1.5Z" }) });

// packages/icons/build-module/library/published.mjs
var import_primitives11 = __toESM(require_primitives(), 1);
var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
var published_default = /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_primitives11.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_primitives11.Path, { fillRule: "evenodd", clipRule: "evenodd", d: "M12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm11.53-1.47-1.06-1.06L11 12.94l-1.47-1.47-1.06 1.06L11 15.06l4.53-4.53Z" }) });

// packages/icons/build-module/library/seen.mjs
var import_primitives12 = __toESM(require_primitives(), 1);
var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
var seen_default = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_primitives12.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_primitives12.Path, { d: "M3.99961 13C4.67043 13.3354 4.6703 13.3357 4.67017 13.3359L4.67298 13.3305C4.67621 13.3242 4.68184 13.3135 4.68988 13.2985C4.70595 13.2686 4.7316 13.2218 4.76695 13.1608C4.8377 13.0385 4.94692 12.8592 5.09541 12.6419C5.39312 12.2062 5.84436 11.624 6.45435 11.0431C7.67308 9.88241 9.49719 8.75 11.9996 8.75C14.502 8.75 16.3261 9.88241 17.5449 11.0431C18.1549 11.624 18.6061 12.2062 18.9038 12.6419C19.0523 12.8592 19.1615 13.0385 19.2323 13.1608C19.2676 13.2218 19.2933 13.2686 19.3093 13.2985C19.3174 13.3135 19.323 13.3242 19.3262 13.3305L19.3291 13.3359C19.3289 13.3357 19.3288 13.3354 19.9996 13C20.6704 12.6646 20.6703 12.6643 20.6701 12.664L20.6697 12.6632L20.6688 12.6614L20.6662 12.6563L20.6583 12.6408C20.6517 12.6282 20.6427 12.6108 20.631 12.5892C20.6078 12.5459 20.5744 12.4852 20.5306 12.4096C20.4432 12.2584 20.3141 12.0471 20.1423 11.7956C19.7994 11.2938 19.2819 10.626 18.5794 9.9569C17.1731 8.61759 14.9972 7.25 11.9996 7.25C9.00203 7.25 6.82614 8.61759 5.41987 9.9569C4.71736 10.626 4.19984 11.2938 3.85694 11.7956C3.68511 12.0471 3.55605 12.2584 3.4686 12.4096C3.42484 12.4852 3.39142 12.5459 3.36818 12.5892C3.35656 12.6108 3.34748 12.6282 3.34092 12.6408L3.33297 12.6563L3.33041 12.6614L3.32948 12.6632L3.32911 12.664C3.32894 12.6643 3.32879 12.6646 3.99961 13ZM11.9996 16C13.9326 16 15.4996 14.433 15.4996 12.5C15.4996 10.567 13.9326 9 11.9996 9C10.0666 9 8.49961 10.567 8.49961 12.5C8.49961 14.433 10.0666 16 11.9996 16Z" }) });

// packages/icons/build-module/library/unseen.mjs
var import_primitives13 = __toESM(require_primitives(), 1);
var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
var unseen_default = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_primitives13.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_primitives13.Path, { d: "M20.7 12.7s0-.1-.1-.2c0-.2-.2-.4-.4-.6-.3-.5-.9-1.2-1.6-1.8-.7-.6-1.5-1.3-2.6-1.8l-.6 1.4c.9.4 1.6 1 2.1 1.5.6.6 1.1 1.2 1.4 1.6.1.2.3.4.3.5v.1l.7-.3.7-.3Zm-5.2-9.3-1.8 4c-.5-.1-1.1-.2-1.7-.2-3 0-5.2 1.4-6.6 2.7-.7.7-1.2 1.3-1.6 1.8-.2.3-.3.5-.4.6 0 0 0 .1-.1.2s0 0 .7.3l.7.3V13c0-.1.2-.3.3-.5.3-.4.7-1 1.4-1.6 1.2-1.2 3-2.3 5.5-2.3H13v.3c-.4 0-.8-.1-1.1-.1-1.9 0-3.5 1.6-3.5 3.5s.6 2.3 1.6 2.9l-2 4.4.9.4 7.6-16.2-.9-.4Zm-3 12.6c1.7-.2 3-1.7 3-3.5s-.2-1.4-.6-1.9L12.4 16Z" }) });

// packages/ui/build-module/calendar/utils/root-context.mjs
var import_element6 = __toESM(require_element(), 1);
var RootContext = (0, import_element6.createContext)({});

// packages/ui/build-module/calendar/utils/components.mjs
var import_jsx_runtime24 = __toESM(require_jsx_runtime(), 1);
var PreviewDashStartAndEnd = () => {
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
    "svg",
    {
      viewBox: "0 0 32 32",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      stroke: "currentColor",
      strokeDasharray: "3.7677",
      strokeDashoffset: "3.2",
      strokeWidth: "1",
      children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("path", { d: "M29.5,0.5 h-27 a2,2 0 0 0 -2,2 v27 a2,2 0 0 0 2,2 h27 a2,2 0 0 0 2,-2 v-27 a2,2 0 0 0 -2,-2" })
    }
  );
};
var PreviewDashStart = () => {
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
    "svg",
    {
      viewBox: "0 0 32 32",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      stroke: "currentColor",
      strokeDasharray: "3.84516",
      strokeDashoffset: "1.9226",
      strokeWidth: "1",
      children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("path", { d: "M32,0.5 h-29.5 a2,2 0 0 0 -2,2 v27 a2,2 0 0 0 2,2 h30" })
    }
  );
};
var PreviewDashMiddle = () => {
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(
    "svg",
    {
      viewBox: "0 0 32 32",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      stroke: "currentColor",
      strokeDasharray: "3.9 4",
      strokeDashoffset: "2",
      strokeWidth: "1",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("line", { x1: "0", y1: "0.5", x2: "100", y2: "0.5" }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("line", { x1: "0", y1: "31.5", x2: "100", y2: "31.5" })
      ]
    }
  );
};
var PreviewDashEnd = () => {
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
    "svg",
    {
      viewBox: "0 0 32 32",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      stroke: "currentColor",
      strokeDasharray: "3.84516",
      strokeDashoffset: "1.9226",
      strokeWidth: "1",
      children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("path", { d: "M0,0.5 h29.5 a2,2 0 0 1 2,2 v27 a2,2 0 0 1 -2,2 h-29.5" })
    }
  );
};
function Day2(props) {
  const { day, modifiers, children, ...tdProps } = props;
  let PreviewDash;
  if (modifiers.preview_start && modifiers.preview_end) {
    PreviewDash = PreviewDashStartAndEnd;
  } else if (modifiers.preview_start) {
    PreviewDash = PreviewDashStart;
  } else if (modifiers.preview_end) {
    PreviewDash = PreviewDashEnd;
  } else if (modifiers.preview) {
    PreviewDash = PreviewDashMiddle;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("td", { ...tdProps, children: [
    PreviewDash && /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(PreviewDash, {}),
    children
  ] });
}
function Root2({ rootRef, ...props }) {
  const { render: render4, ref } = (0, import_element7.useContext)(RootContext);
  const mergedRef = (0, import_compose.useMergeRefs)([rootRef ?? null, ref ?? null]);
  return useRender({
    render: render4,
    defaultTagName: "div",
    ref: mergedRef,
    props
  });
}
function Chevron2({ orientation, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
    Icon,
    {
      className,
      icon: orientation === "right" ? chevron_right_default : chevron_left_default
    }
  );
}
function NavButton({
  className,
  "aria-disabled": ariaDisabled,
  ...props
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
    Button4,
    {
      ...props,
      className,
      variant: "minimal",
      tone: "neutral",
      size: "compact",
      disabled: ariaDisabled === true || ariaDisabled === "true",
      focusableWhenDisabled: true
    }
  );
}

// packages/ui/build-module/calendar/utils/constants.mjs
var STYLE_HASH_ATTRIBUTE5 = "data-wp-hash";
function getRuntime5() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument5(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash5(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE5}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE5) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle5(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime5();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash5(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE5, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument5(targetDocument) {
  const runtime = getRuntime5();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle5(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle5(hash, css) {
  const runtime = getRuntime5();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle5(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle5("6a1312fdcf", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._2c7ac60ba97b3411__root{--wp-ui-calendar-cell-size:var(--wpds-dimension-size-md,32px);--wp-ui-calendar-range-middle-background-color:color-mix(in srgb,var(--wpds-color-background-interactive-brand-strong,var(--wp-admin-theme-color,#3858e9)) 4%,transparent);--wp-ui-calendar-preview-border-color:color-mix(in srgb,var(--wpds-color-background-interactive-brand-strong,var(--wp-admin-theme-color,#3858e9)) 16%,transparent);background-color:var(--wpds-color-background-surface-neutral-strong,#fff);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:inline-block;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wpds-typography-font-size-md,13px);font-weight:var(--wpds-typography-font-weight-default,400);position:relative;z-index:0}._172c492625235710__day{padding:0;position:relative;&:has(._1b64226e315835f8__day-button:disabled){color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}&:has(._1b64226e315835f8__day-button:focus-visible),&:has(._1b64226e315835f8__day-button:hover:not(:disabled)){color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9))}}._1b64226e315835f8__day-button{align-items:center;background:none;border:none;border-radius:var(--wpds-border-radius-sm,2px);color:inherit;cursor:var(--wpds-cursor-control,pointer);display:flex;font:inherit;font-variant-numeric:tabular-nums;height:var(--wp-ui-calendar-cell-size);justify-content:center;margin:0;padding:0;position:relative;width:var(--wp-ui-calendar-cell-size);&:before{border:none;border-radius:var(--wpds-border-radius-sm,2px);z-index:-1}&:after,&:before{content:"";inset:0;position:absolute}&:after{pointer-events:none;z-index:1}&:disabled{cursor:revert;@media (forced-colors:active){text-decoration:line-through}}}._66b9a8120581fd4b__caption-label{align-items:center;border:0;display:inline-flex;position:relative;text-transform:capitalize;white-space:nowrap;z-index:1}._228eede754134437__chevron{fill:currentColor;display:inline-block;height:var(--wpds-dimension-size-2xs,16px);width:var(--wpds-dimension-size-2xs,16px)}._2c7ac60ba97b3411__root[dir=rtl] ._66b1d4a7b488b496__nav ._228eede754134437__chevron{transform:rotate(180deg);transform-origin:50%}._337e5337d49b7f3d__month-caption{align-content:center;display:flex;height:var(--wp-ui-calendar-cell-size);justify-content:center;margin-bottom:var(--wpds-dimension-gap-md,12px)}._110e46230c68e498__months{display:flex;flex-wrap:wrap;gap:var(--wpds-dimension-gap-lg,16px);justify-content:center;max-width:fit-content;position:relative}._92915239fedb1fea__month-grid{border-collapse:separate;border-spacing:0 var(--wpds-dimension-gap-xs,4px)}._66b1d4a7b488b496__nav{align-items:center;display:flex;height:var(--wp-ui-calendar-cell-size);inset-block-start:0;inset-inline-end:0;inset-inline-start:0;justify-content:space-between;position:absolute}._7207199709ca5776__weekday{color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-weight:var(--wpds-typography-font-weight-default,400);height:var(--wp-ui-calendar-cell-size);padding:0;text-align:center;text-transform:uppercase;width:var(--wp-ui-calendar-cell-size)}._058175f0f9c495e0__today:after{border:2px solid;border-radius:50%;content:"";height:0;inset-block-start:2px;inset-inline-end:2px;position:absolute;width:0;z-index:1}.acb642920fb0bef5__selected:not(._165d91a726feca9c__range-middle){&:has(._1b64226e315835f8__day-button,._1b64226e315835f8__day-button:hover:not(:disabled)){color:var(--wpds-color-foreground-interactive-neutral-strong,#f0f0f0)}&:has(._1b64226e315835f8__day-button:disabled){color:var(--wpds-color-foreground-interactive-neutral-strong-disabled,#8d8d8d)}._1b64226e315835f8__day-button{&:before{background-color:var(--wpds-color-background-interactive-neutral-strong,#2d2d2d);border:1px solid transparent}&:disabled:before{background-color:var(--wpds-color-background-interactive-neutral-strong-disabled,#e6e6e6)}&:hover:not(:disabled):before{background-color:var(--wpds-color-background-interactive-neutral-strong-active,#1e1e1e)}}}.c259c5c255fda10f__outside{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}._4d8957a0ca4ec8f0__hidden{visibility:hidden}.f2523033db055ffe__range-start:not(.c04a453de7b11520__range-end) ._1b64226e315835f8__day-button{&,&:before{border-end-end-radius:0;border-start-end-radius:0}}._165d91a726feca9c__range-middle ._1b64226e315835f8__day-button{&:before{background-color:var(--wp-ui-calendar-range-middle-background-color);border-color:transparent;border-radius:0;border-style:solid;border-width:1px 0}}.c04a453de7b11520__range-end:not(.f2523033db055ffe__range-start) ._1b64226e315835f8__day-button{&,&:before{border-end-start-radius:0;border-start-start-radius:0}}._81b244e7c541d95e__preview svg{color:var(--wp-ui-calendar-preview-border-color);inset:0;pointer-events:none;position:absolute;@media (forced-colors:active){color:inherit}}._2c7ac60ba97b3411__root[dir=rtl] ._81b244e7c541d95e__preview svg{transform:scaleX(-1)}._81b244e7c541d95e__preview._165d91a726feca9c__range-middle ._1b64226e315835f8__day-button:before{border:none}@keyframes _255a1a462a5377db__slide-in-left{0%{transform:translateX(-100%)}to{transform:translateX(0)}}@keyframes c21e45f616d6db39__slide-in-right{0%{transform:translateX(100%)}to{transform:translateX(0)}}@keyframes aed80001de9ae226__slide-out-left{0%{transform:translateX(0)}to{transform:translateX(-100%)}}@keyframes _7d4779a7f29408f2__slide-out-right{0%{transform:translateX(0)}to{transform:translateX(100%)}}@keyframes _83ba6321b055d687__fade-in{0%{opacity:0}to{opacity:1}}@keyframes _96fbead71248d210__fade-out{0%{opacity:1}to{opacity:0}}._1563bccb09e39c30__caption-after-enter,._60ac2a7fc3208801__weeks-before-exit,._735dacf9052adecd__caption-before-exit,._7f73a6ab85101202__weeks-after-exit,._805d698b56ba4a29__weeks-after-enter,._9721326fbc23a5fb__weeks-before-enter,.c7a3082839155d29__caption-after-exit,.cb8a5ec82ad0885e__caption-before-enter{animation-duration:0s;animation-fill-mode:forwards;animation-timing-function:var(--wpds-motion-easing-balanced,cubic-bezier(.4,0,.2,1));@media not (prefers-reduced-motion){animation-duration:var(--wpds-motion-duration-lg,.3s)}}._2c7ac60ba97b3411__root[dir=rtl] ._805d698b56ba4a29__weeks-after-enter,._9721326fbc23a5fb__weeks-before-enter{animation-name:_255a1a462a5377db__slide-in-left}._2c7ac60ba97b3411__root[dir=rtl] ._7f73a6ab85101202__weeks-after-exit,._60ac2a7fc3208801__weeks-before-exit{animation-name:aed80001de9ae226__slide-out-left}._2c7ac60ba97b3411__root[dir=rtl] ._9721326fbc23a5fb__weeks-before-enter,._805d698b56ba4a29__weeks-after-enter{animation-name:c21e45f616d6db39__slide-in-right}._2c7ac60ba97b3411__root[dir=rtl] ._60ac2a7fc3208801__weeks-before-exit,._7f73a6ab85101202__weeks-after-exit{animation-name:_7d4779a7f29408f2__slide-out-right}._1563bccb09e39c30__caption-after-enter,.cb8a5ec82ad0885e__caption-before-enter{animation-name:_83ba6321b055d687__fade-in}._735dacf9052adecd__caption-before-exit,.c7a3082839155d29__caption-after-exit{animation-name:_96fbead71248d210__fade-out}}@layer compositions{._395a75bb1930f57e__nav-button{--wp-ui-button-aspect-ratio:1;--wp-ui-button-padding-inline:0px;--wp-ui-button-min-width:unset;--wp-ui-button-height:var(--wp-ui-calendar-cell-size)}}}');
}
var style_default5 = { "root": "_2c7ac60ba97b3411__root", "day": "_172c492625235710__day", "day-button": "_1b64226e315835f8__day-button", "caption-label": "_66b9a8120581fd4b__caption-label", "chevron": "_228eede754134437__chevron", "nav": "_66b1d4a7b488b496__nav", "month-caption": "_337e5337d49b7f3d__month-caption", "months": "_110e46230c68e498__months", "month-grid": "_92915239fedb1fea__month-grid", "weekday": "_7207199709ca5776__weekday", "today": "_058175f0f9c495e0__today", "selected": "acb642920fb0bef5__selected", "range-middle": "_165d91a726feca9c__range-middle", "outside": "c259c5c255fda10f__outside", "hidden": "_4d8957a0ca4ec8f0__hidden", "range-start": "f2523033db055ffe__range-start", "range-end": "c04a453de7b11520__range-end", "preview": "_81b244e7c541d95e__preview", "weeks-before-enter": "_9721326fbc23a5fb__weeks-before-enter", "weeks-before-exit": "_60ac2a7fc3208801__weeks-before-exit", "weeks-after-enter": "_805d698b56ba4a29__weeks-after-enter", "weeks-after-exit": "_7f73a6ab85101202__weeks-after-exit", "caption-after-enter": "_1563bccb09e39c30__caption-after-enter", "caption-after-exit": "c7a3082839155d29__caption-after-exit", "caption-before-enter": "cb8a5ec82ad0885e__caption-before-enter", "caption-before-exit": "_735dacf9052adecd__caption-before-exit", "slide-in-left": "_255a1a462a5377db__slide-in-left", "slide-out-left": "aed80001de9ae226__slide-out-left", "slide-in-right": "c21e45f616d6db39__slide-in-right", "slide-out-right": "_7d4779a7f29408f2__slide-out-right", "fade-in": "_83ba6321b055d687__fade-in", "fade-out": "_96fbead71248d210__fade-out", "nav-button": "_395a75bb1930f57e__nav-button" };
if (typeof process === "undefined" || true) {
  registerStyle5("10f3806643", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._336cd3e4e743482f__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
}
var resets_default2 = { "box-sizing": "_336cd3e4e743482f__box-sizing" };
if (typeof process === "undefined" || true) {
  registerStyle5("96553466c8", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._64de9947bf305b7a__outset-ring--focus-within-visible:focus-within:has(:focus-visible),.af79fb116edb0dd7__outset-ring--focus:focus,.dfcfdc28396e5d98__outset-ring--focus-visible:focus-visible,.e5cd9ee879f6403a__outset-ring--focus-within:focus-within,:focus-visible ._81935a08e952f267__outset-ring--focus-parent-visible{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within,.abc777e9713fa711__outset-ring--focus-except-active:focus{outline:none}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.abc777e9713fa711__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
}
var focus_module_default2 = { "outset-ring--focus": "af79fb116edb0dd7__outset-ring--focus", "outset-ring--focus-visible": "dfcfdc28396e5d98__outset-ring--focus-visible", "outset-ring--focus-within": "e5cd9ee879f6403a__outset-ring--focus-within", "outset-ring--focus-within-visible": "_64de9947bf305b7a__outset-ring--focus-within-visible", "outset-ring--focus-parent-visible": "_81935a08e952f267__outset-ring--focus-parent-visible", "outset-ring--focus-except-active": "abc777e9713fa711__outset-ring--focus-except-active", "outset-ring--focus-within-except-active": "_3c9f5ee9fc9c136d__outset-ring--focus-within-except-active" };
if (typeof process === "undefined" || true) {
  registerStyle5("af6d9984a6", "._6defc79820e382c6__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}.d2cff2e5dea83bd1__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._547d86373d02e108__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._8c15fd0ed9f28ba4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._43cec3e1eec1066d__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6).e97669c6d9a38497__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}._2c0831b0499dbd6e__a,._2c0831b0499dbd6e__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}");
}
var global_css_defense_default3 = { "button": "_6defc79820e382c6__button", "input": "d2cff2e5dea83bd1__input", "textarea": "_547d86373d02e108__textarea", "div": "_8c15fd0ed9f28ba4__div", "p": "_43cec3e1eec1066d__p", "heading": "e97669c6d9a38497__heading", "a": "_2c0831b0499dbd6e__a" };
var CLASSNAMES = {
  root: clsx_default(style_default5.root, resets_default2["box-sizing"]),
  day: style_default5.day,
  day_button: clsx_default(
    style_default5["day-button"],
    global_css_defense_default3.button,
    focus_module_default2["outset-ring--focus-visible"]
  ),
  outside: style_default5.outside,
  caption_label: style_default5["caption-label"],
  button_next: style_default5["nav-button"],
  button_previous: style_default5["nav-button"],
  chevron: style_default5.chevron,
  nav: style_default5.nav,
  month_caption: style_default5["month-caption"],
  months: style_default5.months,
  month_grid: style_default5["month-grid"],
  weekday: style_default5.weekday,
  today: style_default5.today,
  selected: style_default5.selected,
  /*
   * Disabled days are styled through `:has(.day-button:disabled)` rather than
   * a modifier class on the cell, because the two are not equivalent: the
   * focused day keeps its button enabled so it stays reachable. Mapped to
   * `undefined` on purpose, so `@daypicker/react` doesn't fall back to its
   * own `rdp-disabled` class for a modifier we don't style.
   */
  disabled: void 0,
  hidden: style_default5.hidden,
  range_start: style_default5["range-start"],
  range_end: style_default5["range-end"],
  range_middle: style_default5["range-middle"],
  weeks_before_enter: style_default5["weeks-before-enter"],
  weeks_before_exit: style_default5["weeks-before-exit"],
  weeks_after_enter: style_default5["weeks-after-enter"],
  weeks_after_exit: style_default5["weeks-after-exit"],
  caption_after_enter: style_default5["caption-after-enter"],
  caption_after_exit: style_default5["caption-after-exit"],
  caption_before_enter: style_default5["caption-before-enter"],
  caption_before_exit: style_default5["caption-before-exit"]
};
var MODIFIER_CLASSNAMES = {
  preview: style_default5.preview
};
var COMMON_PROPS = {
  animate: true,
  // Only show days in the current month
  showOutsideDays: false,
  // Hide week number column
  showWeekNumber: false,
  // Show weekdays row
  hideWeekdays: false,
  // Month and year caption are not interactive
  captionLayout: "label",
  // Show a variable number of weeks depending on the month
  fixedWeeks: false,
  // Show navigation buttons
  hideNavigation: false,
  // Class names
  classNames: CLASSNAMES,
  // Default role
  role: "application",
  components: {
    Day: Day2,
    Root: Root2,
    Chevron: Chevron2,
    PreviousMonthButton: NavButton,
    NextMonthButton: NavButton
  }
};

// packages/ui/build-module/calendar/utils/misc.mjs
function clampNumberOfMonths(numberOfMonths) {
  return Math.min(3, Math.max(1, numberOfMonths));
}

// packages/ui/build-module/calendar/utils/use-controlled-value.mjs
var import_element8 = __toESM(require_element(), 1);
function useControlledValue2({
  defaultValue,
  onChange,
  value: valueProp
}) {
  const hasValue = typeof valueProp !== "undefined";
  const initialValue = hasValue ? valueProp : defaultValue;
  const [state, setState] = (0, import_element8.useState)(initialValue);
  const value = hasValue ? valueProp : state;
  const uncontrolledSetValue = (0, import_element8.useCallback)(
    (nextValue, ...args) => {
      setState(nextValue);
      onChange?.(nextValue, ...args);
    },
    [onChange]
  );
  let setValue;
  if (hasValue && typeof onChange === "function") {
    setValue = onChange;
  } else if (!hasValue && typeof onChange === "function") {
    setValue = uncontrolledSetValue;
  } else {
    setValue = setState;
  }
  return [value, setValue];
}

// packages/ui/build-module/calendar/utils/use-localization-props.mjs
var import_i18n2 = __toESM(require_i18n(), 1);
var import_element9 = __toESM(require_element(), 1);
function isLocaleRTL(locale) {
  const direction = locale.getTextInfo?.().direction;
  if (direction) {
    return direction === "rtl";
  }
  return [
    "ar",
    // Arabic
    "he",
    // Hebrew
    "fa",
    // Persian (Farsi)
    "ur",
    // Urdu
    "ps",
    // Pashto
    "syr",
    // Syriac
    "dv",
    // Divehi
    "ku",
    // Kurdish (Sorani)
    "ckb",
    // Central Kurdish (Sorani)
    "ug",
    // Uyghur
    "yi"
    // Yiddish
  ].includes(locale.language);
}
function getSupportedLocaleCode(localeCode) {
  if (!localeCode) {
    return;
  }
  let supportedLocaleCode;
  try {
    supportedLocaleCode = Intl.DateTimeFormat.supportedLocalesOf([
      localeCode
    ])[0];
  } catch {
  }
  return supportedLocaleCode;
}
function getWeekStartsOn(locale) {
  const firstDay = (locale.getWeekInfo?.() ?? locale.weekInfo)?.firstDay;
  if (firstDay === void 0 || firstDay < 1 || firstDay > 7) {
    return;
  }
  return firstDay % 7;
}
var useLocalizationProps = ({
  locale,
  timeZone,
  mode
}) => {
  return (0, import_element9.useMemo)(() => {
    const isLocaleString = typeof locale === "string";
    const dateFnsLocale = isLocaleString ? enUS : locale;
    const supportedLocaleCode = getSupportedLocaleCode(
      isLocaleString ? locale : locale.code
    );
    const localeCode = supportedLocaleCode ?? "en-US";
    const intlLocale = new Intl.Locale(
      localeCode
    );
    const weekStartsOn = isLocaleString || supportedLocaleCode !== void 0 ? getWeekStartsOn(intlLocale) : void 0;
    const monthNameFormatter = new Intl.DateTimeFormat(localeCode, {
      calendar: "gregory",
      year: "numeric",
      month: "long",
      timeZone
    });
    const weekdayNarrowFormatter = new Intl.DateTimeFormat(localeCode, {
      calendar: "gregory",
      weekday: "narrow",
      timeZone
    });
    const weekdayLongFormatter = new Intl.DateTimeFormat(localeCode, {
      calendar: "gregory",
      weekday: "long",
      timeZone
    });
    const fullDateFormatter = new Intl.DateTimeFormat(localeCode, {
      calendar: "gregory",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone
    });
    const dayNumberFormatter = new Intl.DateTimeFormat(localeCode, {
      calendar: "gregory",
      day: "numeric",
      timeZone
    });
    return {
      "aria-label": mode === "single" ? (0, import_i18n2.__)("Date calendar") : (0, import_i18n2.__)("Date range calendar"),
      labels: {
        /** The label for the navigation toolbar. */
        labelNav: () => (0, import_i18n2.__)("Navigation bar"),
        /**
         * The label for the month grid.
         * @param date
         */
        labelGrid: monthNameFormatter.format,
        /**
         * The label for the gridcell, when the calendar is not interactive.
         * @param date
         * @param modifiers
         */
        labelGridcell: (date, modifiers) => {
          const formattedDate = fullDateFormatter.format(date);
          let label = formattedDate;
          if (modifiers?.today) {
            label = (0, import_i18n2.sprintf)(
              // translators: %s is the full date (e.g. "Monday, April 29, 2025")
              (0, import_i18n2.__)("Today, %s"),
              formattedDate
            );
          }
          return label;
        },
        /** The label for the "next month" button. */
        labelNext: () => (0, import_i18n2.__)("Go to the Next Month"),
        /** The label for the "previous month" button. */
        labelPrevious: () => (0, import_i18n2.__)("Go to the Previous Month"),
        /**
         * The label for the day button.
         * @param date
         * @param modifiers
         */
        labelDayButton: (date, modifiers) => {
          const formattedDate = fullDateFormatter.format(date);
          let label = formattedDate;
          if (modifiers?.today && modifiers?.selected) {
            return (0, import_i18n2.sprintf)(
              // translators: %s is the full date (e.g. "Monday, April 29, 2025")
              (0, import_i18n2.__)("Today, %s, selected"),
              formattedDate
            );
          }
          if (modifiers?.today) {
            label = (0, import_i18n2.sprintf)(
              // translators: %s is the full date (e.g. "Monday, April 29, 2025")
              (0, import_i18n2.__)("Today, %s"),
              formattedDate
            );
          }
          if (modifiers?.selected) {
            label = (0, import_i18n2.sprintf)(
              // translators: %s is the full date (e.g. "Monday, April 29, 2025")
              (0, import_i18n2.__)("%s, selected"),
              formattedDate
            );
          }
          return label;
        },
        /**
         * The label for the weekday.
         * @param date
         */
        labelWeekday: weekdayLongFormatter.format
      },
      locale: dateFnsLocale,
      lang: localeCode,
      dir: isLocaleRTL(intlLocale) ? "rtl" : "ltr",
      ...weekStartsOn === void 0 ? {} : { weekStartsOn },
      formatters: {
        formatDay: dayNumberFormatter.format,
        formatWeekdayName: weekdayNarrowFormatter.format,
        formatCaption: monthNameFormatter.format
      },
      timeZone
    };
  }, [locale, timeZone, mode]);
};

// packages/ui/build-module/calendar/utils/use-preserve-day-focus.mjs
var import_compose2 = __toESM(require_compose(), 1);
var import_element10 = __toESM(require_element(), 1);
function usePreserveDayFocus(forwardedRef, month) {
  const rootRef = (0, import_element10.useRef)(null);
  const hadDayFocusRef = (0, import_element10.useRef)(false);
  const mergedRef = (0, import_compose2.useMergeRefs)([rootRef, forwardedRef]);
  const monthIndex = month ? month.getFullYear() * 12 + month.getMonth() : void 0;
  const onDayFocus = (0, import_element10.useCallback)(() => {
    hadDayFocusRef.current = true;
  }, []);
  const onDayBlur = (0, import_element10.useCallback)(() => {
    hadDayFocusRef.current = false;
  }, []);
  (0, import_element10.useEffect)(() => {
    if (!hadDayFocusRef.current) {
      return;
    }
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const { activeElement: activeElement2, body } = root.ownerDocument;
    if (activeElement2 !== body) {
      const grid = activeElement2?.closest('[role="grid"]');
      hadDayFocusRef.current = !!grid && root.contains(grid);
      return;
    }
    hadDayFocusRef.current = false;
    const focusTarget = root.querySelector(
      '[role="grid"] button[tabindex="0"]:not(:disabled)'
    );
    const enabledControl = root.querySelector(
      'button:not(:disabled):not([aria-disabled="true"])'
    );
    const focusableControl = root.querySelector(
      "button:not(:disabled)"
    );
    (focusTarget ?? enabledControl ?? focusableControl)?.focus();
  }, [monthIndex]);
  return { ref: mergedRef, onDayFocus, onDayBlur };
}

// packages/ui/build-module/calendar/calendar.mjs
var import_jsx_runtime25 = __toESM(require_jsx_runtime(), 1);
var Calendar = (0, import_element11.forwardRef)(
  function Calendar2({
    defaultValue,
    value: valueProp,
    onValueChange,
    numberOfMonths = 1,
    locale = enUS2,
    timeZone,
    month,
    render: render4,
    labels: customLabels,
    ...props
  }, ref) {
    const localizationProps = useLocalizationProps({
      locale,
      timeZone,
      mode: "single"
    });
    const labels = (0, import_element11.useMemo)(
      () => customLabels ? { ...localizationProps.labels, ...customLabels } : localizationProps.labels,
      [localizationProps.labels, customLabels]
    );
    const onChange = (0, import_element11.useCallback)(
      (selected2, triggerDate, modifiers, e2) => {
        onValueChange?.(
          selected2 ?? null,
          triggerDate,
          modifiers,
          e2
        );
      },
      [onValueChange]
    );
    const [selected, setSelected] = useControlledValue2({
      defaultValue,
      value: valueProp,
      onChange
    });
    const dayFocusProps = usePreserveDayFocus(ref, month);
    const rootContextValue = (0, import_element11.useMemo)(
      () => ({ render: render4, ref: dayFocusProps.ref }),
      [render4, dayFocusProps.ref]
    );
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(RootContext.Provider, { value: rootContextValue, children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
      DayPicker,
      {
        ...COMMON_PROPS,
        ...localizationProps,
        ...props,
        role: "application",
        mode: "single",
        month,
        numberOfMonths: clampNumberOfMonths(numberOfMonths),
        labels,
        selected: selected ?? void 0,
        onSelect: setSelected,
        onDayFocus: dayFocusProps.onDayFocus,
        onDayBlur: dayFocusProps.onDayBlur
      }
    ) });
  }
);

// packages/ui/build-module/calendar/range-calendar.mjs
var import_element12 = __toESM(require_element(), 1);
var import_jsx_runtime26 = __toESM(require_jsx_runtime(), 1);
function usePreviewRange({
  value,
  hoveredDate,
  excludeDisabled,
  min: min2,
  max: max2,
  disabled: disabled2
}) {
  return (0, import_element12.useMemo)(() => {
    if (!hoveredDate || !value?.from) {
      return;
    }
    let previewHighlight;
    let potentialNewRange;
    if (hoveredDate < value.from) {
      previewHighlight = {
        from: hoveredDate,
        to: value.from
      };
      potentialNewRange = {
        from: hoveredDate,
        to: value.to ?? value.from
      };
    } else if (value.to && hoveredDate > value.from && hoveredDate < value.to) {
      previewHighlight = {
        from: value.from,
        to: hoveredDate
      };
      potentialNewRange = {
        from: value.from,
        to: hoveredDate
      };
    } else if (hoveredDate > value.from) {
      previewHighlight = {
        from: value.to ?? value.from,
        to: hoveredDate
      };
      potentialNewRange = {
        from: value.from,
        to: hoveredDate
      };
    }
    if (min2 !== void 0 && min2 > 0 && potentialNewRange && differenceInCalendarDays(
      potentialNewRange.to,
      potentialNewRange.from
    ) < min2) {
      previewHighlight = {
        from: hoveredDate,
        to: hoveredDate
      };
    }
    if (max2 !== void 0 && max2 > 0 && potentialNewRange && differenceInCalendarDays(
      potentialNewRange.to,
      potentialNewRange.from
    ) > max2) {
      previewHighlight = {
        from: hoveredDate,
        to: hoveredDate
      };
    }
    if (excludeDisabled && disabled2 && potentialNewRange && rangeContainsModifiers(potentialNewRange, disabled2)) {
      previewHighlight = {
        from: hoveredDate,
        to: hoveredDate
      };
    }
    return previewHighlight;
  }, [value, hoveredDate, excludeDisabled, min2, max2, disabled2]);
}
var RangeCalendar = (0, import_element12.forwardRef)(
  function RangeCalendar2({
    defaultValue,
    value: valueProp,
    onValueChange,
    numberOfMonths = 1,
    excludeDisabled,
    min: min2,
    max: max2,
    disabled: disabled2,
    locale = enUS2,
    timeZone,
    month,
    render: render4,
    labels: customLabels,
    ...props
  }, ref) {
    const localizationProps = useLocalizationProps({
      locale,
      timeZone,
      mode: "range"
    });
    const labels = (0, import_element12.useMemo)(
      () => customLabels ? { ...localizationProps.labels, ...customLabels } : localizationProps.labels,
      [localizationProps.labels, customLabels]
    );
    const onChange = (0, import_element12.useCallback)(
      (selected2, triggerDate, modifiers2, e2) => {
        onValueChange?.(
          selected2 ?? null,
          triggerDate,
          modifiers2,
          e2
        );
      },
      [onValueChange]
    );
    const [selected, setSelected] = useControlledValue2({
      defaultValue,
      value: valueProp,
      onChange
    });
    const dayFocusProps = usePreserveDayFocus(ref, month);
    const [hoveredDate, setHoveredDate] = (0, import_element12.useState)(
      void 0
    );
    const previewRange = usePreviewRange({
      value: selected,
      hoveredDate,
      excludeDisabled,
      min: min2,
      max: max2,
      disabled: disabled2
    });
    const modifiers = (0, import_element12.useMemo)(() => {
      return {
        preview: previewRange,
        preview_start: previewRange?.from,
        preview_end: previewRange?.to
      };
    }, [previewRange]);
    const rootContextValue = (0, import_element12.useMemo)(
      () => ({ render: render4, ref: dayFocusProps.ref }),
      [render4, dayFocusProps.ref]
    );
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(RootContext.Provider, { value: rootContextValue, children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
      DayPicker,
      {
        ...COMMON_PROPS,
        ...localizationProps,
        ...props,
        role: "application",
        mode: "range",
        month,
        numberOfMonths: clampNumberOfMonths(numberOfMonths),
        disabled: disabled2,
        excludeDisabled,
        min: min2,
        max: max2,
        labels,
        selected: selected ?? void 0,
        onSelect: setSelected,
        onDayFocus: dayFocusProps.onDayFocus,
        onDayBlur: dayFocusProps.onDayBlur,
        onDayMouseEnter: (date) => setHoveredDate(date),
        onDayMouseLeave: () => setHoveredDate(void 0),
        modifiers,
        modifiersClassNames: MODIFIER_CLASSNAMES
      }
    ) });
  }
);

// packages/ui/build-module/card/index.mjs
var card_exports = {};
__export(card_exports, {
  Content: () => Content,
  FullBleed: () => FullBleed,
  Header: () => Header,
  Root: () => Root3,
  Title: () => Title
});

// packages/ui/build-module/card/root.mjs
var import_element13 = __toESM(require_element(), 1);
var STYLE_HASH_ATTRIBUTE6 = "data-wp-hash";
function getRuntime6() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument6(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash6(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE6}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE6) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle6(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime6();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash6(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE6, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument6(targetDocument) {
  const runtime = getRuntime6();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle6(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle6(hash, css) {
  const runtime = getRuntime6();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle6(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle6("10f3806643", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._336cd3e4e743482f__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
}
var resets_default3 = { "box-sizing": "_336cd3e4e743482f__box-sizing" };
if (typeof process === "undefined" || true) {
  registerStyle6("cb866dcef6", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._02872bf298eadc43__root{--wp-ui-card-padding:var(--wpds-dimension-padding-2xl,24px);--wp-ui-card-header-content-gap:var(--wpds-dimension-gap-xl,24px);--wp-ui-card-header-content-margin:calc(var(--wp-ui-card-header-content-gap) - var(--wp-ui-card-padding));background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:1px solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-lg,8px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;overflow:clip}._5dffdaf2a6e669ac__content,.bbccc92e6ba5662d__header{padding:var(--wp-ui-card-padding);&:not(:first-child):not(:last-child){padding-block-end:0}}.bbccc92e6ba5662d__header+._5dffdaf2a6e669ac__content{margin-block-start:var(--wp-ui-card-header-content-margin);padding-block-start:0}.c1fa192587e1b4a6__fullbleed{margin-inline:calc(var(--wp-ui-card-padding)*-1);width:calc(100% + var(--wp-ui-card-padding)*2)}._02872bf298eadc43__root>:is(.bbccc92e6ba5662d__header,._5dffdaf2a6e669ac__content):first-child>.c1fa192587e1b4a6__fullbleed:first-child{margin-block-start:calc(var(--wp-ui-card-padding)*-1)}:is(.bbccc92e6ba5662d__header,._5dffdaf2a6e669ac__content):last-child>.c1fa192587e1b4a6__fullbleed:last-child{margin-block-end:calc(var(--wp-ui-card-padding)*-1)}}}");
}
var style_default6 = { "root": "_02872bf298eadc43__root", "header": "bbccc92e6ba5662d__header", "content": "_5dffdaf2a6e669ac__content", "fullbleed": "c1fa192587e1b4a6__fullbleed" };
var Root3 = (0, import_element13.forwardRef)(function Card({ render: render4, ...restProps }, ref) {
  const mergedClassName = clsx_default(style_default6.root, resets_default3["box-sizing"]);
  const element = useRender({
    defaultTagName: "div",
    render: render4,
    ref,
    props: mergeProps({ className: mergedClassName }, restProps)
  });
  return element;
});

// packages/ui/build-module/card/header.mjs
var import_element14 = __toESM(require_element(), 1);
var STYLE_HASH_ATTRIBUTE7 = "data-wp-hash";
function getRuntime7() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument7(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash7(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE7}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE7) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle7(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime7();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash7(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE7, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument7(targetDocument) {
  const runtime = getRuntime7();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle7(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle7(hash, css) {
  const runtime = getRuntime7();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle7(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle7("cb866dcef6", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._02872bf298eadc43__root{--wp-ui-card-padding:var(--wpds-dimension-padding-2xl,24px);--wp-ui-card-header-content-gap:var(--wpds-dimension-gap-xl,24px);--wp-ui-card-header-content-margin:calc(var(--wp-ui-card-header-content-gap) - var(--wp-ui-card-padding));background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:1px solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-lg,8px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;overflow:clip}._5dffdaf2a6e669ac__content,.bbccc92e6ba5662d__header{padding:var(--wp-ui-card-padding);&:not(:first-child):not(:last-child){padding-block-end:0}}.bbccc92e6ba5662d__header+._5dffdaf2a6e669ac__content{margin-block-start:var(--wp-ui-card-header-content-margin);padding-block-start:0}.c1fa192587e1b4a6__fullbleed{margin-inline:calc(var(--wp-ui-card-padding)*-1);width:calc(100% + var(--wp-ui-card-padding)*2)}._02872bf298eadc43__root>:is(.bbccc92e6ba5662d__header,._5dffdaf2a6e669ac__content):first-child>.c1fa192587e1b4a6__fullbleed:first-child{margin-block-start:calc(var(--wp-ui-card-padding)*-1)}:is(.bbccc92e6ba5662d__header,._5dffdaf2a6e669ac__content):last-child>.c1fa192587e1b4a6__fullbleed:last-child{margin-block-end:calc(var(--wp-ui-card-padding)*-1)}}}");
}
var style_default7 = { "root": "_02872bf298eadc43__root", "header": "bbccc92e6ba5662d__header", "content": "_5dffdaf2a6e669ac__content", "fullbleed": "c1fa192587e1b4a6__fullbleed" };
var Header = (0, import_element14.forwardRef)(
  function CardHeader({ render: render4, ...props }, ref) {
    const element = useRender({
      defaultTagName: "div",
      render: render4,
      ref,
      props: mergeProps({ className: style_default7.header }, props)
    });
    return element;
  }
);

// packages/ui/build-module/card/content.mjs
var import_element15 = __toESM(require_element(), 1);
var STYLE_HASH_ATTRIBUTE8 = "data-wp-hash";
function getRuntime8() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument8(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash8(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE8}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE8) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle8(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime8();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash8(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE8, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument8(targetDocument) {
  const runtime = getRuntime8();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle8(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle8(hash, css) {
  const runtime = getRuntime8();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle8(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle8("cb866dcef6", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._02872bf298eadc43__root{--wp-ui-card-padding:var(--wpds-dimension-padding-2xl,24px);--wp-ui-card-header-content-gap:var(--wpds-dimension-gap-xl,24px);--wp-ui-card-header-content-margin:calc(var(--wp-ui-card-header-content-gap) - var(--wp-ui-card-padding));background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:1px solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-lg,8px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;overflow:clip}._5dffdaf2a6e669ac__content,.bbccc92e6ba5662d__header{padding:var(--wp-ui-card-padding);&:not(:first-child):not(:last-child){padding-block-end:0}}.bbccc92e6ba5662d__header+._5dffdaf2a6e669ac__content{margin-block-start:var(--wp-ui-card-header-content-margin);padding-block-start:0}.c1fa192587e1b4a6__fullbleed{margin-inline:calc(var(--wp-ui-card-padding)*-1);width:calc(100% + var(--wp-ui-card-padding)*2)}._02872bf298eadc43__root>:is(.bbccc92e6ba5662d__header,._5dffdaf2a6e669ac__content):first-child>.c1fa192587e1b4a6__fullbleed:first-child{margin-block-start:calc(var(--wp-ui-card-padding)*-1)}:is(.bbccc92e6ba5662d__header,._5dffdaf2a6e669ac__content):last-child>.c1fa192587e1b4a6__fullbleed:last-child{margin-block-end:calc(var(--wp-ui-card-padding)*-1)}}}");
}
var style_default8 = { "root": "_02872bf298eadc43__root", "header": "bbccc92e6ba5662d__header", "content": "_5dffdaf2a6e669ac__content", "fullbleed": "c1fa192587e1b4a6__fullbleed" };
var Content = (0, import_element15.forwardRef)(
  function CardContent({ render: render4, ...props }, ref) {
    const element = useRender({
      defaultTagName: "div",
      render: render4,
      ref,
      props: mergeProps({ className: style_default8.content }, props)
    });
    return element;
  }
);

// packages/ui/build-module/card/full-bleed.mjs
var import_element16 = __toESM(require_element(), 1);
var STYLE_HASH_ATTRIBUTE9 = "data-wp-hash";
function getRuntime9() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument9(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash9(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE9}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE9) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle9(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime9();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash9(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE9, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument9(targetDocument) {
  const runtime = getRuntime9();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle9(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle9(hash, css) {
  const runtime = getRuntime9();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle9(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle9("cb866dcef6", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._02872bf298eadc43__root{--wp-ui-card-padding:var(--wpds-dimension-padding-2xl,24px);--wp-ui-card-header-content-gap:var(--wpds-dimension-gap-xl,24px);--wp-ui-card-header-content-margin:calc(var(--wp-ui-card-header-content-gap) - var(--wp-ui-card-padding));background-color:var(--wpds-color-background-surface-neutral-strong,#fff);border:1px solid var(--wpds-color-stroke-surface-neutral,#dbdbdb);border-radius:var(--wpds-border-radius-lg,8px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-direction:column;overflow:clip}._5dffdaf2a6e669ac__content,.bbccc92e6ba5662d__header{padding:var(--wp-ui-card-padding);&:not(:first-child):not(:last-child){padding-block-end:0}}.bbccc92e6ba5662d__header+._5dffdaf2a6e669ac__content{margin-block-start:var(--wp-ui-card-header-content-margin);padding-block-start:0}.c1fa192587e1b4a6__fullbleed{margin-inline:calc(var(--wp-ui-card-padding)*-1);width:calc(100% + var(--wp-ui-card-padding)*2)}._02872bf298eadc43__root>:is(.bbccc92e6ba5662d__header,._5dffdaf2a6e669ac__content):first-child>.c1fa192587e1b4a6__fullbleed:first-child{margin-block-start:calc(var(--wp-ui-card-padding)*-1)}:is(.bbccc92e6ba5662d__header,._5dffdaf2a6e669ac__content):last-child>.c1fa192587e1b4a6__fullbleed:last-child{margin-block-end:calc(var(--wp-ui-card-padding)*-1)}}}");
}
var style_default9 = { "root": "_02872bf298eadc43__root", "header": "bbccc92e6ba5662d__header", "content": "_5dffdaf2a6e669ac__content", "fullbleed": "c1fa192587e1b4a6__fullbleed" };
var FullBleed = (0, import_element16.forwardRef)(
  function CardFullBleed({ render: render4, ...props }, ref) {
    const element = useRender({
      defaultTagName: "div",
      render: render4,
      ref,
      props: mergeProps(
        { className: style_default9.fullbleed },
        props
      )
    });
    return element;
  }
);

// packages/ui/build-module/card/title.mjs
var import_element17 = __toESM(require_element(), 1);
var import_jsx_runtime27 = __toESM(require_jsx_runtime(), 1);
var DEFAULT_TAG = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("div", {});
var Title = (0, import_element17.forwardRef)(
  function CardTitle({ render: render4 = DEFAULT_TAG, children, ...props }, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
      Text,
      {
        ref,
        variant: "heading-lg",
        render: render4,
        ...props,
        children
      }
    );
  }
);

// packages/ui/build-module/collapsible/panel.mjs
var import_element18 = __toESM(require_element(), 1);
var import_jsx_runtime28 = __toESM(require_jsx_runtime(), 1);
var Panel = (0, import_element18.forwardRef)(
  function CollapsiblePanel3(props, forwardedRef) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(index_parts_exports.Panel, { ref: forwardedRef, ...props });
  }
);

// packages/ui/build-module/collapsible/root.mjs
var import_element19 = __toESM(require_element(), 1);
var import_jsx_runtime29 = __toESM(require_jsx_runtime(), 1);
var Root4 = (0, import_element19.forwardRef)(
  function CollapsibleRoot3(props, forwardedRef) {
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(index_parts_exports.Root, { ref: forwardedRef, ...props });
  }
);

// packages/ui/build-module/collapsible/trigger.mjs
var import_element20 = __toESM(require_element(), 1);
var import_jsx_runtime30 = __toESM(require_jsx_runtime(), 1);
var Trigger = (0, import_element20.forwardRef)(
  function CollapsibleTrigger3(props, forwardedRef) {
    return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(index_parts_exports.Trigger, { ref: forwardedRef, ...props });
  }
);

// packages/ui/build-module/collapsible-card/index.mjs
var collapsible_card_exports = {};
__export(collapsible_card_exports, {
  Content: () => Content2,
  Header: () => Header2,
  HeaderDescription: () => HeaderDescription,
  Root: () => Root32
});

// packages/ui/build-module/collapsible-card/root.mjs
var import_element21 = __toESM(require_element(), 1);
var import_jsx_runtime31 = __toESM(require_jsx_runtime(), 1);
var Root32 = (0, import_element21.forwardRef)(
  function CollapsibleCardRoot({ render: render4, ...restProps }, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
      Root4,
      {
        ref,
        render: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Root3, { render: render4 }),
        ...restProps
      }
    );
  }
);

// packages/ui/build-module/collapsible-card/header.mjs
var import_compose3 = __toESM(require_compose(), 1);
var import_element23 = __toESM(require_element(), 1);

// packages/ui/build-module/collapsible-card/context.mjs
var import_element22 = __toESM(require_element(), 1);
var HeaderDescriptionIdContext = (0, import_element22.createContext)(null);

// packages/ui/build-module/collapsible-card/header.mjs
var import_jsx_runtime32 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE10 = "data-wp-hash";
function getRuntime10() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument10(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash10(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE10}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE10) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle10(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime10();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash10(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE10, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument10(targetDocument) {
  const runtime = getRuntime10();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle10(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle10(hash, css) {
  const runtime = getRuntime10();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle10(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle10("64bdb4d46e", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._626190151275d6d3__heading-wrapper{--_gcd-heading-color:inherit;--_gcd-heading-font-size:inherit;--_gcd-heading-font-weight:inherit;--_gcd-heading-margin:0;font-family:inherit;line-height:inherit}.cab17c7a373cb60d__header-content{flex:1;min-width:0}._92ebbaa30c8a1d05__header-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.dd89d27c4f15912d__header-trigger-positioner{align-self:flex-start;flex-shrink:0;margin-block-start:calc(var(--wpds-typography-line-height-sm, 20px)/2);max-height:0;overflow:visible}.bcfab5f2448bafef__header-trigger-wrapper{border-radius:var(--wpds-border-radius-sm,2px);display:flex;translate:0 -50%}._3106f8d2b0330faa__header-trigger{@media not (prefers-reduced-motion){transition:rotate .15s ease-out}}._5d2dfcb4085c6d0f__header[data-panel-open] ._3106f8d2b0330faa__header-trigger{rotate:180deg}._5d2dfcb4085c6d0f__header[data-disabled] ._3106f8d2b0330faa__header-trigger{color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}.e34cf37ccd0d81e0__content{height:var(--collapsible-panel-height);margin-block-start:var(--wp-ui-card-header-content-margin);overflow:hidden;&._03cfdbcd710393c9__overflow-visible{overflow:visible}&[hidden]:not([hidden=until-found]){display:none}&[data-ending-style],&[data-starting-style]{height:0}@media not (prefers-reduced-motion){transition:all .15s ease-out}}}@layer compositions{._41bfdbf7b6c087c2__content-inner{padding-block-start:0}._5d2dfcb4085c6d0f__header{align-items:stretch;display:flex;flex-direction:row;gap:var(--wpds-dimension-gap-sm,8px);outline:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}}}}");
}
var style_default10 = { "heading-wrapper": "_626190151275d6d3__heading-wrapper", "header-content": "cab17c7a373cb60d__header-content", "header-description": "_92ebbaa30c8a1d05__header-description", "header-trigger-positioner": "dd89d27c4f15912d__header-trigger-positioner", "header-trigger-wrapper": "bcfab5f2448bafef__header-trigger-wrapper", "header-trigger": "_3106f8d2b0330faa__header-trigger", "header": "_5d2dfcb4085c6d0f__header", "content": "e34cf37ccd0d81e0__content", "overflow-visible": "_03cfdbcd710393c9__overflow-visible", "content-inner": "_41bfdbf7b6c087c2__content-inner" };
if (typeof process === "undefined" || true) {
  registerStyle10("af6d9984a6", "._6defc79820e382c6__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}.d2cff2e5dea83bd1__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._547d86373d02e108__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._8c15fd0ed9f28ba4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._43cec3e1eec1066d__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6).e97669c6d9a38497__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}._2c0831b0499dbd6e__a,._2c0831b0499dbd6e__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}");
}
var global_css_defense_default4 = { "button": "_6defc79820e382c6__button", "input": "d2cff2e5dea83bd1__input", "textarea": "_547d86373d02e108__textarea", "div": "_8c15fd0ed9f28ba4__div", "p": "_43cec3e1eec1066d__p", "heading": "e97669c6d9a38497__heading", "a": "_2c0831b0499dbd6e__a" };
if (typeof process === "undefined" || true) {
  registerStyle10("96553466c8", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._64de9947bf305b7a__outset-ring--focus-within-visible:focus-within:has(:focus-visible),.af79fb116edb0dd7__outset-ring--focus:focus,.dfcfdc28396e5d98__outset-ring--focus-visible:focus-visible,.e5cd9ee879f6403a__outset-ring--focus-within:focus-within,:focus-visible ._81935a08e952f267__outset-ring--focus-parent-visible{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within,.abc777e9713fa711__outset-ring--focus-except-active:focus{outline:none}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.abc777e9713fa711__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
}
var focus_module_default3 = { "outset-ring--focus": "af79fb116edb0dd7__outset-ring--focus", "outset-ring--focus-visible": "dfcfdc28396e5d98__outset-ring--focus-visible", "outset-ring--focus-within": "e5cd9ee879f6403a__outset-ring--focus-within", "outset-ring--focus-within-visible": "_64de9947bf305b7a__outset-ring--focus-within-visible", "outset-ring--focus-parent-visible": "_81935a08e952f267__outset-ring--focus-parent-visible", "outset-ring--focus-except-active": "abc777e9713fa711__outset-ring--focus-except-active", "outset-ring--focus-within-except-active": "_3c9f5ee9fc9c136d__outset-ring--focus-within-except-active" };
var Header2 = (0, import_element23.forwardRef)(
  function CollapsibleCardHeader({
    children,
    className,
    render: render4,
    "aria-describedby": ariaDescribedByProp,
    ...restProps
  }, ref) {
    const [descriptionIds, setDescriptionIds] = (0, import_element23.useState)(
      []
    );
    const [orderedDescriptionIds, setOrderedDescriptionIds] = (0, import_element23.useState)([]);
    const headerContentRef = (0, import_element23.useRef)(null);
    const registerDescriptionId = (0, import_element23.useCallback)((id) => {
      setDescriptionIds((currentDescriptionIds) => {
        if (currentDescriptionIds.includes(id)) {
          return currentDescriptionIds;
        }
        return [...currentDescriptionIds, id];
      });
      return () => {
        setDescriptionIds(
          (currentDescriptionIds) => currentDescriptionIds.filter(
            (descriptionId) => descriptionId !== id
          )
        );
      };
    }, []);
    const contextValue = (0, import_element23.useMemo)(
      () => ({ registerDescriptionId }),
      [registerDescriptionId]
    );
    (0, import_compose3.useIsomorphicLayoutEffect)(() => {
      const registeredDescriptionIds = new Set(descriptionIds);
      const nextDescriptionIds = Array.from(
        headerContentRef.current?.querySelectorAll("[id]") ?? []
      ).map((element) => element.id).filter((id) => registeredDescriptionIds.has(id));
      setOrderedDescriptionIds((currentDescriptionIds) => {
        if (currentDescriptionIds.length === nextDescriptionIds.length && currentDescriptionIds.every(
          (id, index) => id === nextDescriptionIds[index]
        )) {
          return currentDescriptionIds;
        }
        return nextDescriptionIds;
      });
    });
    const ariaDescribedBy = Array.from(
      /* @__PURE__ */ new Set([
        ...ariaDescribedByProp?.split(/\s+/).filter(Boolean) ?? [],
        ...orderedDescriptionIds
      ])
    ).join(" ") || void 0;
    return useRender({
      defaultTagName: "div",
      render: render4,
      ref,
      props: mergeProps(restProps, {
        className: clsx_default(
          global_css_defense_default4.heading,
          style_default10["heading-wrapper"],
          className
        ),
        children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(HeaderDescriptionIdContext.Provider, { value: contextValue, children: /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(
          Trigger,
          {
            className: style_default10.header,
            render: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Header, {}),
            nativeButton: false,
            "aria-describedby": ariaDescribedBy,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
                "div",
                {
                  ref: headerContentRef,
                  className: style_default10["header-content"],
                  children
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
                "div",
                {
                  className: clsx_default(
                    style_default10["header-trigger-positioner"]
                  ),
                  children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
                    "div",
                    {
                      className: clsx_default(
                        style_default10["header-trigger-wrapper"],
                        global_css_defense_default4.div,
                        // While the interactive trigger element is the whole header,
                        // the focus ring will be displayed only on the icon to visually
                        // emulate it being the button.
                        focus_module_default3["outset-ring--focus-parent-visible"]
                      ),
                      children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
                        Icon,
                        {
                          icon: chevron_down_default,
                          className: style_default10["header-trigger"]
                        }
                      )
                    }
                  )
                }
              )
            ]
          }
        ) })
      })
    });
  }
);

// packages/ui/build-module/collapsible-card/header-description.mjs
var import_element24 = __toESM(require_element(), 1);
var import_jsx_runtime33 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE11 = "data-wp-hash";
function getRuntime11() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument11(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash11(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE11}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE11) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle11(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime11();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash11(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE11, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument11(targetDocument) {
  const runtime = getRuntime11();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle11(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle11(hash, css) {
  const runtime = getRuntime11();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle11(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle11("64bdb4d46e", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._626190151275d6d3__heading-wrapper{--_gcd-heading-color:inherit;--_gcd-heading-font-size:inherit;--_gcd-heading-font-weight:inherit;--_gcd-heading-margin:0;font-family:inherit;line-height:inherit}.cab17c7a373cb60d__header-content{flex:1;min-width:0}._92ebbaa30c8a1d05__header-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.dd89d27c4f15912d__header-trigger-positioner{align-self:flex-start;flex-shrink:0;margin-block-start:calc(var(--wpds-typography-line-height-sm, 20px)/2);max-height:0;overflow:visible}.bcfab5f2448bafef__header-trigger-wrapper{border-radius:var(--wpds-border-radius-sm,2px);display:flex;translate:0 -50%}._3106f8d2b0330faa__header-trigger{@media not (prefers-reduced-motion){transition:rotate .15s ease-out}}._5d2dfcb4085c6d0f__header[data-panel-open] ._3106f8d2b0330faa__header-trigger{rotate:180deg}._5d2dfcb4085c6d0f__header[data-disabled] ._3106f8d2b0330faa__header-trigger{color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}.e34cf37ccd0d81e0__content{height:var(--collapsible-panel-height);margin-block-start:var(--wp-ui-card-header-content-margin);overflow:hidden;&._03cfdbcd710393c9__overflow-visible{overflow:visible}&[hidden]:not([hidden=until-found]){display:none}&[data-ending-style],&[data-starting-style]{height:0}@media not (prefers-reduced-motion){transition:all .15s ease-out}}}@layer compositions{._41bfdbf7b6c087c2__content-inner{padding-block-start:0}._5d2dfcb4085c6d0f__header{align-items:stretch;display:flex;flex-direction:row;gap:var(--wpds-dimension-gap-sm,8px);outline:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}}}}");
}
var style_default11 = { "heading-wrapper": "_626190151275d6d3__heading-wrapper", "header-content": "cab17c7a373cb60d__header-content", "header-description": "_92ebbaa30c8a1d05__header-description", "header-trigger-positioner": "dd89d27c4f15912d__header-trigger-positioner", "header-trigger-wrapper": "bcfab5f2448bafef__header-trigger-wrapper", "header-trigger": "_3106f8d2b0330faa__header-trigger", "header": "_5d2dfcb4085c6d0f__header", "content": "e34cf37ccd0d81e0__content", "overflow-visible": "_03cfdbcd710393c9__overflow-visible", "content-inner": "_41bfdbf7b6c087c2__content-inner" };
var DEFAULT_TAG2 = /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("div", {});
var HeaderDescription = (0, import_element24.forwardRef)(function CollapsibleCardHeaderDescription({ children, className, id: idProp, render: render4 = DEFAULT_TAG2, ...restProps }, ref) {
  const generatedId = (0, import_element24.useId)();
  const descriptionId = idProp ?? generatedId;
  const context = (0, import_element24.useContext)(HeaderDescriptionIdContext);
  if (!context) {
    throw new Error(
      "CollapsibleCard.HeaderDescription: Missing parent <CollapsibleCard.Header>. Render <CollapsibleCard.HeaderDescription> inside <CollapsibleCard.Header>."
    );
  }
  (0, import_element24.useEffect)(() => {
    return context?.registerDescriptionId(descriptionId);
  }, [context, descriptionId]);
  return /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(
    Text,
    {
      ref,
      variant: "body-md",
      render: render4,
      id: descriptionId,
      "aria-hidden": "true",
      className: clsx_default(style_default11["header-description"], className),
      ...restProps,
      children
    }
  );
});

// packages/ui/build-module/collapsible-card/content.mjs
var import_element25 = __toESM(require_element(), 1);
var import_jsx_runtime34 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE12 = "data-wp-hash";
function getRuntime12() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument12(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash12(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE12}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE12) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle12(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime12();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash12(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE12, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument12(targetDocument) {
  const runtime = getRuntime12();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle12(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle12(hash, css) {
  const runtime = getRuntime12();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle12(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle12("64bdb4d46e", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._626190151275d6d3__heading-wrapper{--_gcd-heading-color:inherit;--_gcd-heading-font-size:inherit;--_gcd-heading-font-weight:inherit;--_gcd-heading-margin:0;font-family:inherit;line-height:inherit}.cab17c7a373cb60d__header-content{flex:1;min-width:0}._92ebbaa30c8a1d05__header-description{color:var(--wpds-color-foreground-content-neutral-weak,#707070)}.dd89d27c4f15912d__header-trigger-positioner{align-self:flex-start;flex-shrink:0;margin-block-start:calc(var(--wpds-typography-line-height-sm, 20px)/2);max-height:0;overflow:visible}.bcfab5f2448bafef__header-trigger-wrapper{border-radius:var(--wpds-border-radius-sm,2px);display:flex;translate:0 -50%}._3106f8d2b0330faa__header-trigger{@media not (prefers-reduced-motion){transition:rotate .15s ease-out}}._5d2dfcb4085c6d0f__header[data-panel-open] ._3106f8d2b0330faa__header-trigger{rotate:180deg}._5d2dfcb4085c6d0f__header[data-disabled] ._3106f8d2b0330faa__header-trigger{color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}.e34cf37ccd0d81e0__content{height:var(--collapsible-panel-height);margin-block-start:var(--wp-ui-card-header-content-margin);overflow:hidden;&._03cfdbcd710393c9__overflow-visible{overflow:visible}&[hidden]:not([hidden=until-found]){display:none}&[data-ending-style],&[data-starting-style]{height:0}@media not (prefers-reduced-motion){transition:all .15s ease-out}}}@layer compositions{._41bfdbf7b6c087c2__content-inner{padding-block-start:0}._5d2dfcb4085c6d0f__header{align-items:stretch;display:flex;flex-direction:row;gap:var(--wpds-dimension-gap-sm,8px);outline:none;&:not([data-disabled]){cursor:var(--wpds-cursor-control,pointer)}}}}");
}
var style_default12 = { "heading-wrapper": "_626190151275d6d3__heading-wrapper", "header-content": "cab17c7a373cb60d__header-content", "header-description": "_92ebbaa30c8a1d05__header-description", "header-trigger-positioner": "dd89d27c4f15912d__header-trigger-positioner", "header-trigger-wrapper": "bcfab5f2448bafef__header-trigger-wrapper", "header-trigger": "_3106f8d2b0330faa__header-trigger", "header": "_5d2dfcb4085c6d0f__header", "content": "e34cf37ccd0d81e0__content", "overflow-visible": "_03cfdbcd710393c9__overflow-visible", "content-inner": "_41bfdbf7b6c087c2__content-inner" };
var Content2 = (0, import_element25.forwardRef)(
  function CollapsibleCardContent({ className, render: render4, children, hiddenUntilFound = true, ...restProps }, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
      Panel,
      {
        ref,
        className: (state) => clsx_default(
          style_default12.content,
          state.open && state.transitionStatus === "idle" && style_default12["overflow-visible"],
          className
        ),
        hiddenUntilFound,
        ...restProps,
        children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
          Content,
          {
            className: style_default12["content-inner"],
            render: render4,
            children
          }
        )
      }
    );
  }
);

// packages/ui/build-module/stack/stack.mjs
var import_element26 = __toESM(require_element(), 1);
var STYLE_HASH_ATTRIBUTE13 = "data-wp-hash";
function getRuntime13() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument13(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash13(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE13}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE13) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle13(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime13();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash13(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE13, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument13(targetDocument) {
  const runtime = getRuntime13();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle13(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle13(hash, css) {
  const runtime = getRuntime13();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle13(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle13("32aba35fe1", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._19ce0419607e1896__stack{display:flex}}}");
}
var style_default13 = { "stack": "_19ce0419607e1896__stack" };
var gapTokens = {
  xs: "var(--wpds-dimension-gap-xs, 4px)",
  sm: "var(--wpds-dimension-gap-sm, 8px)",
  md: "var(--wpds-dimension-gap-md, 12px)",
  lg: "var(--wpds-dimension-gap-lg, 16px)",
  xl: "var(--wpds-dimension-gap-xl, 24px)",
  "2xl": "var(--wpds-dimension-gap-2xl, 32px)",
  "3xl": "var(--wpds-dimension-gap-3xl, 40px)"
};
var Stack = (0, import_element26.forwardRef)(function Stack2({ direction, gap, align, justify, wrap, render: render4, ...props }, ref) {
  const style = {
    gap: gap && gapTokens[gap],
    alignItems: align,
    justifyContent: justify,
    flexDirection: direction,
    flexWrap: wrap
  };
  const element = useRender({
    render: render4,
    ref,
    props: mergeProps(props, { style, className: style_default13.stack })
  });
  return element;
});

// packages/ui/build-module/visually-hidden/visually-hidden.mjs
var import_element27 = __toESM(require_element(), 1);
var STYLE_HASH_ATTRIBUTE14 = "data-wp-hash";
function getRuntime14() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument14(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash14(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE14}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE14) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle14(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime14();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash14(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE14, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument14(targetDocument) {
  const runtime = getRuntime14();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle14(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle14(hash, css) {
  const runtime = getRuntime14();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle14(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle14("fa606a57ae", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.f37b9e2e191ebd66__visually-hidden{word-wrap:normal;border:0;clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;word-break:normal}}}");
}
var style_default14 = { "visually-hidden": "f37b9e2e191ebd66__visually-hidden" };
var VisuallyHidden = (0, import_element27.forwardRef)(
  function VisuallyHidden2({ render: render4, ...restProps }, ref) {
    const element = useRender({
      render: render4,
      ref,
      props: mergeProps(
        { className: style_default14["visually-hidden"] },
        restProps,
        {
          // @ts-expect-error Arbitrary data-* attributes aren't indexable on the typed div props. Kept hardcoded so consumers can't change or remove it.
          "data-visually-hidden": ""
        }
      )
    });
    return element;
  }
);

// packages/ui/build-module/form/primitives/input/input.mjs
var import_element30 = __toESM(require_element(), 1);

// packages/ui/build-module/form/primitives/input-layout/input-layout.mjs
var import_element28 = __toESM(require_element(), 1);
var import_jsx_runtime35 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE15 = "data-wp-hash";
function getRuntime15() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument15(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash15(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE15}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE15) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle15(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime15();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash15(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE15, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument15(targetDocument) {
  const runtime = getRuntime15();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle15(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle15(hash, css) {
  const runtime = getRuntime15();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle15(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle15("af6d9984a6", "._6defc79820e382c6__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}.d2cff2e5dea83bd1__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._547d86373d02e108__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._8c15fd0ed9f28ba4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._43cec3e1eec1066d__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6).e97669c6d9a38497__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}._2c0831b0499dbd6e__a,._2c0831b0499dbd6e__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}");
}
var global_css_defense_default5 = { "button": "_6defc79820e382c6__button", "input": "d2cff2e5dea83bd1__input", "textarea": "_547d86373d02e108__textarea", "div": "_8c15fd0ed9f28ba4__div", "p": "_43cec3e1eec1066d__p", "heading": "e97669c6d9a38497__heading", "a": "_2c0831b0499dbd6e__a" };
if (typeof process === "undefined" || true) {
  registerStyle15("10f3806643", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._336cd3e4e743482f__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
}
var resets_default4 = { "box-sizing": "_336cd3e4e743482f__box-sizing" };
if (typeof process === "undefined" || true) {
  registerStyle15("4767ce195b", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.cb2baafdc08746bb__input-layout{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-md,12px);background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:var(--wpds-border-width-xs,1px);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:max(var(--wpds-typography-font-size-md,13px),16px);height:var(--wpds-dimension-size-lg,40px);line-height:1;@media (min-width:600px){font-size:var(--wpds-typography-font-size-md,13px)}&._0c807a84cbb94e0c__is-size-compact{height:var(--wpds-dimension-size-md,32px)}&._0c807a84cbb94e0c__is-size-compact,&.ed67cda122dc1e7b__is-size-small{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-sm,8px)}&.ed67cda122dc1e7b__is-size-small{height:var(--wpds-dimension-size-sm,24px)}&._6fb7104732387680__is-disabled,&:has([data-can-disable-input-layout][data-disabled]){background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);border-color:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText;color:GrayText}}&._8097270636ca6100__is-borderless{border-color:transparent}&:has(._0d7afad74a057888__input-layout-slot:focus-within){outline:none}&:hover:not(._6fb7104732387680__is-disabled,:has([data-can-disable-input-layout][data-disabled]),._8097270636ca6100__is-borderless){border-color:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e)}&:has(:invalid[data-validity-visible]){--focus-color:var(--wpds-color-stroke-interactive-error,#cc1818);border-color:var(--wpds-color-stroke-interactive-error,#cc1818);&:hover{border-color:var(--wpds-color-stroke-interactive-error-active,#9d0000)}}}.c192b41a12b4387b__slot-wrapper{display:contents}._0d7afad74a057888__input-layout-slot{align-items:center;display:flex;&._0c952682762ca288__is-padding-minimal{--wp-ui-input-layout-prefix-padding-start:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px));--wp-ui-input-layout-suffix-padding-end:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}[data-slot-type=prefix] &{padding-inline-start:var(--wp-ui-input-layout-prefix-padding-start,var(--wp-ui-input-layout-padding-inline))}[data-slot-type=suffix] &{padding-inline-end:var(--wp-ui-input-layout-suffix-padding-end,var(--wp-ui-input-layout-padding-inline))}}}}');
}
var style_default15 = { "input-layout": "cb2baafdc08746bb__input-layout", "is-size-compact": "_0c807a84cbb94e0c__is-size-compact", "is-size-small": "ed67cda122dc1e7b__is-size-small", "is-disabled": "_6fb7104732387680__is-disabled", "is-borderless": "_8097270636ca6100__is-borderless", "input-layout-slot": "_0d7afad74a057888__input-layout-slot", "slot-wrapper": "c192b41a12b4387b__slot-wrapper", "is-padding-minimal": "_0c952682762ca288__is-padding-minimal" };
var InputLayout = (0, import_element28.forwardRef)(
  function InputLayout2({
    className,
    children,
    visuallyDisabled,
    size = "default",
    isBorderless,
    prefix,
    suffix,
    ...restProps
  }, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)(
      "div",
      {
        ref,
        className: clsx_default(
          global_css_defense_default5.div,
          resets_default4["box-sizing"],
          style_default15["input-layout"],
          style_default15[`is-size-${size}`],
          visuallyDisabled && style_default15["is-disabled"],
          isBorderless && style_default15["is-borderless"],
          className
        ),
        ...restProps,
        children: [
          import_element28.Children.count(prefix) > 0 && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(
            "div",
            {
              className: style_default15["slot-wrapper"],
              "data-slot-type": "prefix",
              children: prefix
            }
          ),
          children,
          import_element28.Children.count(suffix) > 0 && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(
            "div",
            {
              className: style_default15["slot-wrapper"],
              "data-slot-type": "suffix",
              children: suffix
            }
          )
        ]
      }
    );
  }
);

// packages/ui/build-module/form/primitives/input-layout/slot.mjs
var import_element29 = __toESM(require_element(), 1);
var import_jsx_runtime36 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE16 = "data-wp-hash";
function getRuntime16() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument16(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash16(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE16}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE16) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle16(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime16();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash16(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE16, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument16(targetDocument) {
  const runtime = getRuntime16();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle16(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle16(hash, css) {
  const runtime = getRuntime16();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle16(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle16("4767ce195b", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.cb2baafdc08746bb__input-layout{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-md,12px);background-color:var(--wpds-color-background-interactive-neutral-weak,#0000);border-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d);border-radius:var(--wpds-border-radius-sm,2px);border-style:solid;border-width:var(--wpds-border-width-xs,1px);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:max(var(--wpds-typography-font-size-md,13px),16px);height:var(--wpds-dimension-size-lg,40px);line-height:1;@media (min-width:600px){font-size:var(--wpds-typography-font-size-md,13px)}&._0c807a84cbb94e0c__is-size-compact{height:var(--wpds-dimension-size-md,32px)}&._0c807a84cbb94e0c__is-size-compact,&.ed67cda122dc1e7b__is-size-small{--wp-ui-input-layout-padding-inline:var(--wpds-dimension-padding-sm,8px)}&.ed67cda122dc1e7b__is-size-small{height:var(--wpds-dimension-size-sm,24px)}&._6fb7104732387680__is-disabled,&:has([data-can-disable-input-layout][data-disabled]){background-color:var(--wpds-color-background-interactive-neutral-weak-disabled,#0000);border-color:var(--wpds-color-stroke-interactive-neutral-disabled,#dbdbdb);color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);@media (forced-colors:active){border-bottom-color:GrayText;border-left-color:GrayText;border-right-color:GrayText;border-top-color:GrayText;color:GrayText}}&._8097270636ca6100__is-borderless{border-color:transparent}&:has(._0d7afad74a057888__input-layout-slot:focus-within){outline:none}&:hover:not(._6fb7104732387680__is-disabled,:has([data-can-disable-input-layout][data-disabled]),._8097270636ca6100__is-borderless){border-color:var(--wpds-color-stroke-interactive-neutral-active,#6e6e6e)}&:has(:invalid[data-validity-visible]){--focus-color:var(--wpds-color-stroke-interactive-error,#cc1818);border-color:var(--wpds-color-stroke-interactive-error,#cc1818);&:hover{border-color:var(--wpds-color-stroke-interactive-error-active,#9d0000)}}}.c192b41a12b4387b__slot-wrapper{display:contents}._0d7afad74a057888__input-layout-slot{align-items:center;display:flex;&._0c952682762ca288__is-padding-minimal{--wp-ui-input-layout-prefix-padding-start:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px));--wp-ui-input-layout-suffix-padding-end:calc(var(--wp-ui-input-layout-padding-inline) - var(--wpds-dimension-padding-xs, 4px))}[data-slot-type=prefix] &{padding-inline-start:var(--wp-ui-input-layout-prefix-padding-start,var(--wp-ui-input-layout-padding-inline))}[data-slot-type=suffix] &{padding-inline-end:var(--wp-ui-input-layout-suffix-padding-end,var(--wp-ui-input-layout-padding-inline))}}}}');
}
var style_default16 = { "input-layout": "cb2baafdc08746bb__input-layout", "is-size-compact": "_0c807a84cbb94e0c__is-size-compact", "is-size-small": "ed67cda122dc1e7b__is-size-small", "is-disabled": "_6fb7104732387680__is-disabled", "is-borderless": "_8097270636ca6100__is-borderless", "input-layout-slot": "_0d7afad74a057888__input-layout-slot", "slot-wrapper": "c192b41a12b4387b__slot-wrapper", "is-padding-minimal": "_0c952682762ca288__is-padding-minimal" };
var InputLayoutSlot = (0, import_element29.forwardRef)(function InputLayoutSlot2({ padding = "default", className, ...restProps }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
    "div",
    {
      ref,
      className: clsx_default(
        style_default16["input-layout-slot"],
        style_default16[`is-padding-${padding}`],
        className
      ),
      ...restProps
    }
  );
});
InputLayoutSlot.displayName = "InputLayout.Slot";

// packages/ui/build-module/form/primitives/input-layout/index.mjs
var InputLayout3 = Object.assign(InputLayout, {
  Slot: InputLayoutSlot
});

// packages/ui/build-module/form/primitives/input/input.mjs
var import_jsx_runtime37 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE17 = "data-wp-hash";
function getRuntime17() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument17(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash17(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE17}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE17) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle17(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime17();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash17(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE17, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument17(targetDocument) {
  const runtime = getRuntime17();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle17(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle17(hash, css) {
  const runtime = getRuntime17();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle17(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle17("af6d9984a6", "._6defc79820e382c6__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}.d2cff2e5dea83bd1__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._547d86373d02e108__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._8c15fd0ed9f28ba4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._43cec3e1eec1066d__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6).e97669c6d9a38497__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}._2c0831b0499dbd6e__a,._2c0831b0499dbd6e__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}");
}
var global_css_defense_default6 = { "button": "_6defc79820e382c6__button", "input": "d2cff2e5dea83bd1__input", "textarea": "_547d86373d02e108__textarea", "div": "_8c15fd0ed9f28ba4__div", "p": "_43cec3e1eec1066d__p", "heading": "e97669c6d9a38497__heading", "a": "_2c0831b0499dbd6e__a" };
if (typeof process === "undefined" || true) {
  registerStyle17("96553466c8", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._64de9947bf305b7a__outset-ring--focus-within-visible:focus-within:has(:focus-visible),.af79fb116edb0dd7__outset-ring--focus:focus,.dfcfdc28396e5d98__outset-ring--focus-visible:focus-visible,.e5cd9ee879f6403a__outset-ring--focus-within:focus-within,:focus-visible ._81935a08e952f267__outset-ring--focus-parent-visible{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within,.abc777e9713fa711__outset-ring--focus-except-active:focus{outline:none}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.abc777e9713fa711__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
}
var focus_module_default4 = { "outset-ring--focus": "af79fb116edb0dd7__outset-ring--focus", "outset-ring--focus-visible": "dfcfdc28396e5d98__outset-ring--focus-visible", "outset-ring--focus-within": "e5cd9ee879f6403a__outset-ring--focus-within", "outset-ring--focus-within-visible": "_64de9947bf305b7a__outset-ring--focus-within-visible", "outset-ring--focus-parent-visible": "_81935a08e952f267__outset-ring--focus-parent-visible", "outset-ring--focus-except-active": "abc777e9713fa711__outset-ring--focus-except-active", "outset-ring--focus-within-except-active": "_3c9f5ee9fc9c136d__outset-ring--focus-within-except-active" };
if (typeof process === "undefined" || true) {
  registerStyle17("41fce05ee0", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._2ae7be2fc1bb17a3__input{--_gcd-input-padding:var(--wp-ui-input-padding-block,0px) var(--wp-ui-input-layout-padding-inline,0px);background:transparent;border:none;color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);font-family:inherit;font-size:inherit;line-height:inherit;outline:none;padding-block:var(--wp-ui-input-padding-block,0);padding-inline:var(--wp-ui-input-layout-padding-inline,0);width:100%;&::placeholder{color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d)}&:disabled,&[aria-disabled=true]{color:var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d);@media (forced-colors:active){color:GrayText}}&[type=email],&[type=url]{direction:ltr}&[type=number]{appearance:textfield;&::-webkit-inner-spin-button,&::-webkit-outer-spin-button{appearance:none;margin:0}}}}}");
}
var style_default17 = { "input": "_2ae7be2fc1bb17a3__input" };
var Input3 = (0, import_element30.forwardRef)(function Input22({ className, size = "default", prefix, suffix, style, ...restProps }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime37.jsx)(
    InputLayout3,
    {
      className: clsx_default(
        focus_module_default4["outset-ring--focus-within"],
        className
      ),
      style,
      size,
      visuallyDisabled: restProps.disabled,
      prefix,
      suffix,
      children: /* @__PURE__ */ (0, import_jsx_runtime37.jsx)(
        Input,
        {
          ref,
          className: clsx_default(global_css_defense_default6.input, style_default17.input),
          ...restProps
        }
      )
    }
  );
});

// packages/ui/build-module/form/primitives/control-with-error/control-with-error.mjs
var import_i18n3 = __toESM(require_i18n(), 1);
var import_element32 = __toESM(require_element(), 1);

// packages/ui/build-module/spinner/spinner.mjs
var import_element31 = __toESM(require_element(), 1);
var import_jsx_runtime38 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE18 = "data-wp-hash";
function getRuntime18() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument18(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash18(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE18}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE18) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle18(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime18();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash18(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE18, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument18(targetDocument) {
  const runtime = getRuntime18();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle18(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle18(hash, css) {
  const runtime = getRuntime18();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle18(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle18("bbbecfe373", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.ab4d64c07c0ba587__spinner{background-color:transparent;display:inline-block;height:var(--wpds-dimension-size-2xs,16px);opacity:1;overflow:visible;position:relative;width:var(--wpds-dimension-size-2xs,16px)}.a7654e10245bb7d2__indicator,.dc51f80c84b35fe2__track{fill:transparent;stroke-width:1.5px}.dc51f80c84b35fe2__track{stroke:var(--wpds-color-background-track-neutral,#dbdbdb)}.a7654e10245bb7d2__indicator{stroke:var(--wpds-color-background-thumb-brand,var(--wp-admin-theme-color,#3858e9));stroke-linecap:round;animation:_02322d973909703c__spinner-spin 1.4s linear infinite both;transform-origin:50% 50%}@keyframes _02322d973909703c__spinner-spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}}}");
}
var style_default18 = { "spinner": "ab4d64c07c0ba587__spinner", "track": "dc51f80c84b35fe2__track", "indicator": "a7654e10245bb7d2__indicator", "spinner-spin": "_02322d973909703c__spinner-spin" };
var Spinner = (0, import_element31.forwardRef)(
  function Spinner2({ className, ...props }, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)(
      "svg",
      {
        className: clsx_default(style_default18.spinner, className),
        viewBox: "0 0 100 100",
        xmlns: "http://www.w3.org/2000/svg",
        role: "presentation",
        focusable: "false",
        ...props,
        ref,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
            "circle",
            {
              className: style_default18.track,
              cx: "50",
              cy: "50",
              r: "50",
              vectorEffect: "non-scaling-stroke"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
            "path",
            {
              className: style_default18.indicator,
              d: "m 50 0 a 50 50 0 0 1 50 50",
              vectorEffect: "non-scaling-stroke"
            }
          )
        ]
      }
    );
  }
);

// packages/ui/build-module/form/primitives/validity-indicator/validity-indicator.mjs
var import_jsx_runtime39 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE19 = "data-wp-hash";
function getRuntime19() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument19(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash19(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE19}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE19) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle19(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime19();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash19(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE19, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument19(targetDocument) {
  const runtime = getRuntime19();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle19(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle19(hash, css) {
  const runtime = getRuntime19();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle19(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle19("af6d9984a6", "._6defc79820e382c6__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}.d2cff2e5dea83bd1__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._547d86373d02e108__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._8c15fd0ed9f28ba4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._43cec3e1eec1066d__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6).e97669c6d9a38497__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}._2c0831b0499dbd6e__a,._2c0831b0499dbd6e__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}");
}
var global_css_defense_default7 = { "button": "_6defc79820e382c6__button", "input": "d2cff2e5dea83bd1__input", "textarea": "_547d86373d02e108__textarea", "div": "_8c15fd0ed9f28ba4__div", "p": "_43cec3e1eec1066d__p", "heading": "e97669c6d9a38497__heading", "a": "_2c0831b0499dbd6e__a" };
if (typeof process === "undefined" || true) {
  registerStyle19("d7b0469ef4", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{._7a7ac88e306348e7__indicator{--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);--_gcd-p-margin:var(--wpds-dimension-gap-sm,8px) 0 0;align-items:flex-start;color:var(--wpds-color-foreground-content-neutral-weak,#707070);display:flex;font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);gap:var(--wpds-dimension-gap-xs,4px);line-height:var(--wpds-typography-line-height-xs,16px);margin-block:var(--wpds-dimension-gap-sm,8px) 0;margin-inline:0;@media not (prefers-reduced-motion){animation:_48722cc5dd090ce4__indicator-jump var(--wpds-motion-duration-md,.2s) cubic-bezier(.68,-.55,.27,1.55)}}._57a3bbbfbe38a5c6__is-invalid{color:var(--wpds-color-foreground-content-error-weak,#cc1818)}._9e944dc198aac10b__is-valid{color:var(--wpds-color-foreground-content-success-weak,#008030)}.e482806667437c6a__indicator-icon{flex-shrink:0}._6e46434cc23019d2__indicator-spinner{height:var(--wpds-dimension-size-3xs,12px);margin:2px;width:var(--wpds-dimension-size-3xs,12px)}@keyframes _48722cc5dd090ce4__indicator-jump{0%{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}}}');
}
var style_default19 = { "indicator": "_7a7ac88e306348e7__indicator", "indicator-jump": "_48722cc5dd090ce4__indicator-jump", "is-invalid": "_57a3bbbfbe38a5c6__is-invalid", "is-valid": "_9e944dc198aac10b__is-valid", "indicator-icon": "e482806667437c6a__indicator-icon", "indicator-spinner": "_6e46434cc23019d2__indicator-spinner" };
var ICON = {
  valid: published_default,
  invalid: error_default
};
function ValidityIndicator({
  id,
  type,
  message: message2
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime39.jsxs)(
    "p",
    {
      id,
      className: clsx_default(
        global_css_defense_default7.p,
        style_default19.indicator,
        style_default19[`is-${type}`]
      ),
      children: [
        type === "validating" ? /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(Spinner, { className: style_default19["indicator-spinner"] }) : /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(
          Icon,
          {
            className: style_default19["indicator-icon"],
            icon: ICON[type],
            size: 16,
            fill: "currentColor"
          }
        ),
        message2
      ]
    }
  );
}

// packages/ui/build-module/form/primitives/control-with-error/control-with-error.mjs
var import_jsx_runtime40 = __toESM(require_jsx_runtime(), 1);
function appendRequiredIndicator(label, required, markWhenOptional) {
  let suffix;
  if (required && !markWhenOptional) {
    suffix = `(${(0, import_i18n3.__)("Required")})`;
  } else if (!required && markWhenOptional) {
    suffix = `(${(0, import_i18n3.__)("Optional")})`;
  }
  if (!suffix) {
    return label;
  }
  if (typeof label === "string") {
    return `${label} ${suffix}`;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(import_jsx_runtime40.Fragment, { children: [
    label,
    " ",
    suffix
  ] });
}
var VALIDITY_VISIBLE_ATTRIBUTE = "data-validity-visible";
var ControlWithError = (0, import_element32.forwardRef)(function ControlWithError2({
  required,
  markWhenOptional,
  customValidity,
  getValidityTarget,
  children,
  render: render4,
  ...restProps
}, forwardedRef) {
  const [errorMessage, setErrorMessage] = (0, import_element32.useState)();
  const [statusMessage, setStatusMessage] = (0, import_element32.useState)();
  const [showMessage, setShowMessage] = (0, import_element32.useState)(false);
  const [isTouched, setIsTouched] = (0, import_element32.useState)(false);
  const wrapperRef = (0, import_element32.useRef)(null);
  (0, import_element32.useEffect)(() => {
    const validityTarget = getValidityTarget();
    const handler = () => {
      if (customValidity?.type !== "validating") {
        setErrorMessage(validityTarget?.validationMessage);
      }
      setShowMessage(true);
      validityTarget?.setAttribute(VALIDITY_VISIBLE_ATTRIBUTE, "");
    };
    validityTarget?.addEventListener("invalid", handler);
    return () => validityTarget?.removeEventListener("invalid", handler);
  }, [customValidity?.type, getValidityTarget]);
  (0, import_element32.useEffect)(() => {
    const validityTarget = getValidityTarget();
    const suppressNativePopover = (event) => {
      event.preventDefault();
      if (!event.isTrusted) {
        return;
      }
      const target = event.target;
      const firstErrorInForm = Array.from(
        target.form?.elements ?? []
      ).find((el) => !el.validity.valid);
      if (!target.form || firstErrorInForm === target) {
        target.focus();
      }
    };
    const radioSiblings = validityTarget?.type === "radio" && validityTarget?.name ? Array.from(
      wrapperRef.current?.querySelectorAll(
        `input[type="radio"][name="${validityTarget?.name}"]`
      ) ?? []
    ).filter((sibling) => sibling !== validityTarget) : [];
    validityTarget?.addEventListener("invalid", suppressNativePopover);
    radioSiblings.forEach(
      (sibling) => sibling.addEventListener("invalid", suppressNativePopover)
    );
    return () => {
      validityTarget?.removeEventListener(
        "invalid",
        suppressNativePopover
      );
      radioSiblings.forEach(
        (sibling) => sibling.removeEventListener("invalid", suppressNativePopover)
      );
    };
  }, [getValidityTarget]);
  (0, import_element32.useEffect)(() => {
    const validityTarget = getValidityTarget();
    if (!customValidity?.type) {
      validityTarget?.setCustomValidity("");
      setErrorMessage(validityTarget?.validationMessage);
      setStatusMessage(void 0);
      return;
    }
    switch (customValidity.type) {
      case "validating": {
        validityTarget?.setCustomValidity("");
        setErrorMessage(void 0);
        setStatusMessage({
          type: "validating",
          message: customValidity.message
        });
        break;
      }
      case "valid": {
        validityTarget?.setCustomValidity("");
        setErrorMessage(validityTarget?.validationMessage);
        setStatusMessage({
          type: "valid",
          message: customValidity.message
        });
        break;
      }
      case "invalid": {
        validityTarget?.setCustomValidity(
          customValidity.message ?? ""
        );
        setErrorMessage(validityTarget?.validationMessage);
        setStatusMessage(void 0);
        break;
      }
    }
  }, [customValidity, getValidityTarget]);
  (0, import_element32.useEffect)(() => {
    if (!isTouched || showMessage) {
      return;
    }
    if (customValidity?.type === "validating") {
      const timer = setTimeout(() => {
        setShowMessage(true);
      }, 1e3);
      return () => clearTimeout(timer);
    }
    setShowMessage(true);
  }, [isTouched, customValidity?.type, showMessage]);
  const onBlur = (event) => {
    if (isTouched) {
      return;
    }
    if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
      setIsTouched(true);
      getValidityTarget()?.setAttribute(VALIDITY_VISIBLE_ATTRIBUTE, "");
    }
  };
  const messageId = (0, import_element32.useId)();
  const message2 = (() => {
    if (errorMessage) {
      return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
        ValidityIndicator,
        {
          id: messageId,
          type: "invalid",
          message: errorMessage
        }
      );
    }
    if (statusMessage?.type) {
      return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
        ValidityIndicator,
        {
          id: messageId,
          type: statusMessage.type,
          message: statusMessage.message
        }
      );
    }
    return null;
  })();
  const visibleMessage = showMessage ? message2 : null;
  (0, import_element32.useEffect)(() => {
    const target = getValidityTarget();
    if (!target) {
      return;
    }
    function setDescribedBy(el, shouldAdd) {
      const ids = (el.getAttribute("aria-describedby") ?? "").split(" ").filter((id) => id && id !== messageId);
      if (shouldAdd) {
        ids.push(messageId);
      }
      if (ids.length) {
        el.setAttribute("aria-describedby", ids.join(" "));
      } else {
        el.removeAttribute("aria-describedby");
      }
    }
    setDescribedBy(target, !!visibleMessage);
    return () => setDescribedBy(target, false);
  }, [visibleMessage, messageId, getValidityTarget]);
  return useRender({
    render: render4,
    defaultTagName: "div",
    ref: [forwardedRef, wrapperRef],
    props: mergeProps(restProps, {
      onBlur,
      children: /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(import_jsx_runtime40.Fragment, { children: [
        (0, import_element32.cloneElement)(children, {
          label: appendRequiredIndicator(
            children.props.label,
            required,
            markWhenOptional
          ),
          required
        }),
        visibleMessage
      ] })
    })
  });
});

// packages/ui/build-module/form/primitives/field/index.mjs
var field_exports = {};
__export(field_exports, {
  Control: () => Control,
  Description: () => Description,
  Details: () => Details,
  Item: () => Item,
  Label: () => Label,
  Root: () => Root5
});

// packages/ui/build-module/form/primitives/field/root.mjs
var import_element33 = __toESM(require_element(), 1);
var import_jsx_runtime41 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE20 = "data-wp-hash";
function getRuntime20() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument20(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash20(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE20}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE20) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle20(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime20();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash20(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE20, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument20(targetDocument) {
  const runtime = getRuntime20();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle20(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle20(hash, css) {
  const runtime = getRuntime20();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle20(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle20("10f3806643", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._336cd3e4e743482f__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
}
var resets_default5 = { "box-sizing": "_336cd3e4e743482f__box-sizing" };
var DEFAULT_RENDER = (props) => /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(Stack, { ...props, direction: "column", gap: "sm" });
var Root5 = (0, import_element33.forwardRef)(function Root22({ className, render: render4 = DEFAULT_RENDER, ...restProps }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(
    index_parts_exports2.Root,
    {
      ref,
      className: clsx_default(resets_default5["box-sizing"], className),
      render: render4,
      ...restProps
    }
  );
});

// packages/ui/build-module/form/primitives/field/item.mjs
var import_element34 = __toESM(require_element(), 1);
var import_jsx_runtime42 = __toESM(require_jsx_runtime(), 1);
var Item = (0, import_element34.forwardRef)(function Item2(props, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(index_parts_exports2.Item, { ref, ...props });
});

// packages/ui/build-module/form/primitives/field/label.mjs
var import_element35 = __toESM(require_element(), 1);
var import_jsx_runtime43 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE21 = "data-wp-hash";
function getRuntime21() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument21(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash21(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE21}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE21) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle21(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime21();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash21(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE21, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument21(targetDocument) {
  const runtime = getRuntime21();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle21(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle21(hash, css) {
  const runtime = getRuntime21();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle21(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle21("e08ffbfdae", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._2d5ad850b2f90964__label{--wp-ui-field-label-line-height:var(--wpds-typography-line-height-xs,16px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wp-ui-field-label-line-height);text-transform:uppercase;&._17c4214649230bea__is-plain{font-size:var(--wpds-typography-font-size-md,13px);text-transform:none}}._08a3750500e0233f__description{--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);--_gcd-p-margin:0;text-wrap:pretty;color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}');
}
var field_default = { "label": "_2d5ad850b2f90964__label", "is-plain": "_17c4214649230bea__is-plain", "description": "_08a3750500e0233f__description" };
var Label = (0, import_element35.forwardRef)(
  function Label2({ className, hideFromVision, variant, ...restProps }, ref) {
    const label = /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(
      index_parts_exports2.Label,
      {
        ref,
        className: clsx_default(
          field_default.label,
          variant && field_default[`is-${variant}`],
          className
        ),
        ...restProps
      }
    );
    if (hideFromVision) {
      return /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(VisuallyHidden, { render: label });
    }
    return label;
  }
);

// packages/ui/build-module/form/primitives/field/description.mjs
var import_element36 = __toESM(require_element(), 1);
var import_jsx_runtime44 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE22 = "data-wp-hash";
function getRuntime22() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument22(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash22(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE22}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE22) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle22(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime22();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash22(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE22, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument22(targetDocument) {
  const runtime = getRuntime22();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle22(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle22(hash, css) {
  const runtime = getRuntime22();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle22(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle22("af6d9984a6", "._6defc79820e382c6__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}.d2cff2e5dea83bd1__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._547d86373d02e108__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._8c15fd0ed9f28ba4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._43cec3e1eec1066d__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6).e97669c6d9a38497__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}._2c0831b0499dbd6e__a,._2c0831b0499dbd6e__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}");
}
var global_css_defense_default8 = { "button": "_6defc79820e382c6__button", "input": "d2cff2e5dea83bd1__input", "textarea": "_547d86373d02e108__textarea", "div": "_8c15fd0ed9f28ba4__div", "p": "_43cec3e1eec1066d__p", "heading": "e97669c6d9a38497__heading", "a": "_2c0831b0499dbd6e__a" };
if (typeof process === "undefined" || true) {
  registerStyle22("e08ffbfdae", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._2d5ad850b2f90964__label{--wp-ui-field-label-line-height:var(--wpds-typography-line-height-xs,16px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wp-ui-field-label-line-height);text-transform:uppercase;&._17c4214649230bea__is-plain{font-size:var(--wpds-typography-font-size-md,13px);text-transform:none}}._08a3750500e0233f__description{--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);--_gcd-p-margin:0;text-wrap:pretty;color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}');
}
var field_default2 = { "label": "_2d5ad850b2f90964__label", "is-plain": "_17c4214649230bea__is-plain", "description": "_08a3750500e0233f__description" };
var Description = (0, import_element36.forwardRef)(function Description2({ className, ...restProps }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(
    index_parts_exports2.Description,
    {
      ref,
      className: clsx_default(
        global_css_defense_default8.p,
        field_default2.description,
        className
      ),
      ...restProps
    }
  );
});

// packages/ui/build-module/form/primitives/field/details.mjs
var import_element37 = __toESM(require_element(), 1);
var import_i18n4 = __toESM(require_i18n(), 1);
var import_jsx_runtime45 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE23 = "data-wp-hash";
function getRuntime23() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument23(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash23(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE23}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE23) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle23(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime23();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash23(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE23, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument23(targetDocument) {
  const runtime = getRuntime23();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle23(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle23(hash, css) {
  const runtime = getRuntime23();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle23(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle23("e08ffbfdae", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._2d5ad850b2f90964__label{--wp-ui-field-label-line-height:var(--wpds-typography-line-height-xs,16px);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wpds-typography-font-size-xs,11px);font-weight:var(--wpds-typography-font-weight-emphasis,600);line-height:var(--wp-ui-field-label-line-height);text-transform:uppercase;&._17c4214649230bea__is-plain{font-size:var(--wpds-typography-font-size-md,13px);text-transform:none}}._08a3750500e0233f__description{--_gcd-p-font-size:var(--wpds-typography-font-size-sm,12px);--_gcd-p-line-height:var(--wpds-typography-line-height-xs,16px);--_gcd-p-margin:0;text-wrap:pretty;color:var(--wpds-color-foreground-content-neutral-weak,#707070);font-family:var(--wpds-typography-font-family-body,-apple-system,system-ui,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Helvetica Neue",sans-serif);font-size:var(--wpds-typography-font-size-sm,12px);line-height:var(--wpds-typography-line-height-xs,16px)}}}');
}
var field_default3 = { "label": "_2d5ad850b2f90964__label", "is-plain": "_17c4214649230bea__is-plain", "description": "_08a3750500e0233f__description" };
var Details = (0, import_element37.forwardRef)(
  function Details2({ className, ...restProps }, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime45.jsxs)(import_jsx_runtime45.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(VisuallyHidden, { render: /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(index_parts_exports2.Description, {}), children: (0, import_i18n4.__)("More details follow the field.") }),
      /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(
        "div",
        {
          ref,
          className: clsx_default(field_default3.description, className),
          ...restProps
        }
      )
    ] });
  }
);

// packages/ui/build-module/form/primitives/field/control.mjs
var import_element38 = __toESM(require_element(), 1);
var import_jsx_runtime46 = __toESM(require_jsx_runtime(), 1);
var Control = (0, import_element38.forwardRef)(
  function Control2(props, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(index_parts_exports2.Control, { ref, ...props });
  }
);

// packages/ui/build-module/form/input-control/input-control.mjs
var import_element39 = __toESM(require_element(), 1);
var import_jsx_runtime47 = __toESM(require_jsx_runtime(), 1);
var InputControl = (0, import_element39.forwardRef)(
  function InputControl2({
    className,
    label,
    description,
    details,
    hideLabelFromVision,
    ...restProps
  }, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)(field_exports.Root, { className, children: [
      /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(field_exports.Label, { hideFromVision: hideLabelFromVision, children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(Input3, { ref, ...restProps }),
      description && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(field_exports.Description, { children: description }),
      details && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(field_exports.Details, { children: details })
    ] });
  }
);

// packages/ui/build-module/form/with-validation/validated-input-control/validated-input-control.mjs
var import_element40 = __toESM(require_element(), 1);
var import_compose4 = __toESM(require_compose(), 1);
var import_jsx_runtime48 = __toESM(require_jsx_runtime(), 1);
var ValidatedInputControl = (0, import_element40.forwardRef)(function ValidatedInputControl2({ required, markWhenOptional, customValidity, ...restProps }, forwardedRef) {
  const validityTargetRef = (0, import_element40.useRef)(null);
  const mergedRefs = (0, import_compose4.useMergeRefs)([forwardedRef, validityTargetRef]);
  return /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
    ControlWithError,
    {
      required,
      markWhenOptional,
      customValidity,
      getValidityTarget: () => validityTargetRef.current,
      children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(InputControl, { ref: mergedRefs, ...restProps })
    }
  );
});

// packages/ui/build-module/link/link.mjs
var import_element41 = __toESM(require_element(), 1);
var import_i18n5 = __toESM(require_i18n(), 1);
var import_jsx_runtime49 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE24 = "data-wp-hash";
function getRuntime24() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument24(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash24(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE24}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE24) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle24(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime24();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash24(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE24, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument24(targetDocument) {
  const runtime = getRuntime24();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle24(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle24(hash, css) {
  const runtime = getRuntime24();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle24(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle24("10f3806643", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._336cd3e4e743482f__box-sizing{box-sizing:border-box;*,:after,:before{box-sizing:inherit}}}}");
}
var resets_default6 = { "box-sizing": "_336cd3e4e743482f__box-sizing" };
if (typeof process === "undefined" || true) {
  registerStyle24("96553466c8", "@layer wp-ui{@layer utilities, components, compositions, overrides;@layer utilities{._64de9947bf305b7a__outset-ring--focus-within-visible:focus-within:has(:focus-visible),.af79fb116edb0dd7__outset-ring--focus:focus,.dfcfdc28396e5d98__outset-ring--focus-visible:focus-visible,.e5cd9ee879f6403a__outset-ring--focus-within:focus-within,:focus-visible ._81935a08e952f267__outset-ring--focus-parent-visible{--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within,.abc777e9713fa711__outset-ring--focus-except-active:focus{outline:none}._3c9f5ee9fc9c136d__outset-ring--focus-within-except-active:focus-within:not(:has(:active)),.abc777e9713fa711__outset-ring--focus-except-active:focus:not(:active){--_gcd-a-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));--_gcd-div-outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px)) solid var(--focus-color,var(--wpds-color-stroke-focus,var(--wp-admin-theme-color,#3858e9)));outline-offset:var(--wpds-border-width-focus,var(--wp-admin-border-width-focus,2px))}}}");
}
var focus_module_default5 = { "outset-ring--focus": "af79fb116edb0dd7__outset-ring--focus", "outset-ring--focus-visible": "dfcfdc28396e5d98__outset-ring--focus-visible", "outset-ring--focus-within": "e5cd9ee879f6403a__outset-ring--focus-within", "outset-ring--focus-within-visible": "_64de9947bf305b7a__outset-ring--focus-within-visible", "outset-ring--focus-parent-visible": "_81935a08e952f267__outset-ring--focus-parent-visible", "outset-ring--focus-except-active": "abc777e9713fa711__outset-ring--focus-except-active", "outset-ring--focus-within-except-active": "_3c9f5ee9fc9c136d__outset-ring--focus-within-except-active" };
if (typeof process === "undefined" || true) {
  registerStyle24("e8e6a9be37", '@layer wp-ui{@layer utilities, components, compositions, overrides;@layer components{.d4250949359b05ce__link{text-decoration-thickness:from-font;text-underline-offset:.2em}.c6055659b8e2cd2c__is-brand,.c6055659b8e2cd2c__is-brand:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9));color:var(--wpds-color-foreground-interactive-brand,var(--wp-admin-theme-color,#3858e9))}.c6055659b8e2cd2c__is-brand:active,.c6055659b8e2cd2c__is-brand:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000));color:var(--wpds-color-foreground-interactive-brand-active,color-mix(in oklch,var(--wp-admin-theme-color,#3858e9) 52%,#000))}._92e0dfcaeee15b88__is-neutral,._92e0dfcaeee15b88__is-neutral:visited{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral,#1e1e1e);text-decoration-color:var(--wpds-color-stroke-interactive-neutral,#8d8d8d)}._92e0dfcaeee15b88__is-neutral:active,._92e0dfcaeee15b88__is-neutral:hover{--_gcd-a-color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e);color:var(--wpds-color-foreground-interactive-neutral-active,#1e1e1e)}.cf122a9bf1035d42__is-unstyled{--_gcd-a-color:inherit;color:inherit;text-decoration:none}._0cb411afac4c86c7__link-icon{display:inline-block;font-weight:var(--wpds-typography-font-weight-default,400);line-height:1;margin-inline-start:var(--wpds-dimension-padding-xs,4px);text-decoration:none}._0cb411afac4c86c7__link-icon:after{content:"\\2197"}._0cb411afac4c86c7__link-icon:dir(rtl):after{content:"\\2196"}}}');
}
var style_default20 = { "link": "d4250949359b05ce__link", "is-brand": "c6055659b8e2cd2c__is-brand", "is-neutral": "_92e0dfcaeee15b88__is-neutral", "is-unstyled": "cf122a9bf1035d42__is-unstyled", "link-icon": "_0cb411afac4c86c7__link-icon" };
if (typeof process === "undefined" || true) {
  registerStyle24("af6d9984a6", "._6defc79820e382c6__button{box-sizing:var(--_gcd-button-box-sizing,border-box);font-family:var(--_gcd-button-font-family,inherit);font-size:var(--_gcd-button-font-size,inherit);font-weight:var(--_gcd-button-font-weight,inherit)}.d2cff2e5dea83bd1__input{box-sizing:var(--_gcd-input-box-sizing,border-box);font-family:var(--_gcd-input-font-family,inherit);font-size:var(--_gcd-input-font-size,inherit);font-weight:var(--_gcd-input-font-weight,inherit);margin:var(--_gcd-input-margin,0);&:is(textarea,[type=text],[type=password],[type=color],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){background-color:var(--_gcd-input-background-color,transparent);border:var(--_gcd-input-border,none);border-radius:var(--_gcd-input-border-radius,0);box-shadow:var(--_gcd-input-box-shadow,0 0 0 transparent);color:var(--_gcd-input-color,var(--wpds-color-foreground-interactive-neutral,#1e1e1e));&:focus{border-color:var(--_gcd-input-border-color-focus,var(--wp-admin-theme-color));box-shadow:var(--_gcd-input-box-shadow-focus,none);outline:var(--_gcd-input-outline-focus,none)}&:disabled{background:var(--_gcd-input-background-disabled,transparent);border-color:var(--_gcd-input-border-color-disabled,transparent);box-shadow:var(--_gcd-input-box-shadow-disabled,none);color:var(--_gcd-input-color-disabled,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}&::placeholder{color:var(--_gcd-input-placeholder-color,var(--wpds-color-foreground-interactive-neutral-disabled,#8d8d8d))}}&:is(textarea,[type=text],[type=password],[type=date],[type=datetime],[type=datetime-local],[type=email],[type=month],[type=number],[type=search],[type=tel],[type=time],[type=url],[type=week]){line-height:var(--_gcd-input-line-height,inherit);min-height:var(--_gcd-input-min-height,auto);padding:var(--_gcd-input-padding,0)}}._547d86373d02e108__textarea{box-sizing:var(--_gcd-textarea-box-sizing,border-box);overflow:var(--_gcd-textarea-overflow,auto);resize:var(--_gcd-textarea-resize,block)}._8c15fd0ed9f28ba4__div{outline:var(--_gcd-div-outline,0 solid transparent)}p._43cec3e1eec1066d__p{font-size:var(--_gcd-p-font-size,13px);line-height:var(--_gcd-p-line-height,1.5);margin:var(--_gcd-p-margin,0)}:is(h1,h2,h3,h4,h5,h6).e97669c6d9a38497__heading{color:var(--_gcd-heading-color,var(--wpds-color-foreground-content-neutral,#1e1e1e));font-size:var(--_gcd-heading-font-size,inherit);font-weight:var(--_gcd-heading-font-weight,var(--wpds-typography-font-weight-emphasis,600));margin:var(--_gcd-heading-margin,0)}._2c0831b0499dbd6e__a,._2c0831b0499dbd6e__a:is(:hover,:focus,:active){border-radius:var(--_gcd-a-border-radius,0);box-shadow:var(--_gcd-a-box-shadow,none);color:var(--_gcd-a-color,inherit);outline:var(--_gcd-a-outline,0 solid transparent);transition:var(--_gcd-a-transition,none)}");
}
var global_css_defense_default9 = { "button": "_6defc79820e382c6__button", "input": "d2cff2e5dea83bd1__input", "textarea": "_547d86373d02e108__textarea", "div": "_8c15fd0ed9f28ba4__div", "p": "_43cec3e1eec1066d__p", "heading": "e97669c6d9a38497__heading", "a": "_2c0831b0499dbd6e__a" };
var Link = (0, import_element41.forwardRef)(function Link2({
  children,
  variant = "default",
  tone = "brand",
  openInNewTab = false,
  render: render4,
  className,
  ...props
}, ref) {
  const element = useRender({
    render: render4,
    defaultTagName: "a",
    ref,
    props: mergeProps(props, {
      className: clsx_default(
        global_css_defense_default9.a,
        resets_default6["box-sizing"],
        focus_module_default5["outset-ring--focus-except-active"],
        variant !== "unstyled" && style_default20.link,
        variant !== "unstyled" && style_default20[`is-${tone}`],
        variant === "unstyled" && style_default20["is-unstyled"],
        className
      ),
      target: openInNewTab ? "_blank" : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime49.jsxs)(import_jsx_runtime49.Fragment, { children: [
        children,
        openInNewTab && /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(
          "span",
          {
            className: style_default20["link-icon"],
            role: "img",
            "aria-label": (
              /* translators: accessibility text appended to link text */
              (0, import_i18n5.__)("(opens in a new tab)")
            )
          }
        )
      ] })
    })
  });
  return element;
});

// packages/admin-ui/build-module/navigable-region/index.mjs
var import_element42 = __toESM(require_element(), 1);
var import_jsx_runtime50 = __toESM(require_jsx_runtime(), 1);
var NavigableRegion = (0, import_element42.forwardRef)(
  ({ children, className, ariaLabel, as: Tag = "div", ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime50.jsx)(
      Tag,
      {
        ref,
        className: clsx_default("admin-ui-navigable-region", className),
        "aria-label": ariaLabel,
        role: "region",
        tabIndex: "-1",
        ...props,
        children
      }
    );
  }
);
NavigableRegion.displayName = "NavigableRegion";
var navigable_region_default = NavigableRegion;

// packages/admin-ui/build-module/navigation/index.mjs
var import_i18n6 = __toESM(require_i18n(), 1);
var import_jsx_runtime51 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE25 = "data-wp-hash";
function getRuntime25() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument25(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash25(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE25}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE25) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle25(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime25();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash25(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE25, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument25(targetDocument) {
  const runtime = getRuntime25();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle25(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle25(hash, css) {
  const runtime = getRuntime25();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle25(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle25("72ef022400", ".bfb5a2dd8cceebd3__list{--focus-ring-size:calc(var(--wpds-border-width-focus, var(--wp-admin-border-width-focus, 2px))*2);list-style:none;margin:calc(var(--focus-ring-size)*-1);overflow-x:auto;padding:var(--focus-ring-size);scroll-padding:var(--focus-ring-size)}.a4759b4cb2c8bd92__li{flex-shrink:0}._07da506d3f2d9afe__item{align-items:center;color:var(--wpds-color-foreground-interactive-neutral-weak,#707070);display:flex;font-weight:var(--wpds-typography-font-weight-default,400);min-block-size:44px;min-inline-size:44px;text-decoration:none}._07da506d3f2d9afe__item:hover,._07da506d3f2d9afe__item[aria-current=page]{color:var(--wpds-color-foreground-interactive-neutral-weak-active,#1e1e1e)}._07da506d3f2d9afe__item[aria-current=page]{font-weight:var(--wpds-typography-font-weight-emphasis,600)}");
}
var style_default21 = { "list": "bfb5a2dd8cceebd3__list", "li": "a4759b4cb2c8bd92__li", "item": "_07da506d3f2d9afe__item" };
var Navigation = ({
  items,
  currentHref,
  ariaLabel = (0, import_i18n6.__)("Sections"),
  linkComponent,
  className
}) => {
  if (!items.length) {
    return null;
  }
  const LinkComponent = linkComponent ?? "a";
  if (true) {
    const invalidItem = items.find(
      (item) => typeof item.href !== "string"
    );
    if (invalidItem) {
      throw new Error(
        `Navigation: item "${invalidItem.label}" is missing an \`href\` prop.`
      );
    }
    const duplicate = items.find(
      (item, index) => items.findIndex((other) => other.href === item.href) !== index
    );
    if (duplicate) {
      throw new Error(
        `Navigation: duplicate \`href\` "${duplicate.href}". Each item must have a unique \`href\` so a single item receives \`aria-current="page"\`.`
      );
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("nav", { "aria-label": ariaLabel, className, children: /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(
    Stack,
    {
      render: /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("ul", { role: "list" }),
      direction: "row",
      align: "center",
      gap: "md",
      className: style_default21.list,
      children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("li", { className: style_default21.li, children: /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(
        Text,
        {
          variant: "body-md",
          className: style_default21.item,
          render: /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(
            Link,
            {
              variant: "unstyled",
              "aria-current": item.href === currentHref ? "page" : void 0,
              render: /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(LinkComponent, { href: item.href })
            }
          ),
          children: item.label
        }
      ) }, item.href))
    }
  ) });
};
var navigation_default = Navigation;

// packages/admin-ui/build-module/page/sidebar-toggle-slot.mjs
var import_components2 = __toESM(require_components(), 1);
var { Fill: SidebarToggleFill, Slot: SidebarToggleSlot } = (0, import_components2.createSlotFill)("SidebarToggle");

// packages/admin-ui/build-module/page/header.mjs
var import_jsx_runtime52 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE26 = "data-wp-hash";
function getRuntime26() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument26(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash26(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE26}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE26) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle26(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime26();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash26(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE26, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument26(targetDocument) {
  const runtime = getRuntime26();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle26(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle26(hash, css) {
  const runtime = getRuntime26();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle26(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle26("89e4060c20", "._956b6df0898efed0__page{text-wrap:pretty;background-color:var(--wpds-color-background-surface-neutral,#fcfcfc);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-flow:column;height:100%;position:relative;z-index:1}._0625b55e82a0d93d__header{background:var(--wpds-color-background-surface-neutral-strong,#fff);border-block-end:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);inset-block-start:0;padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px);position:sticky;z-index:1}.a43c44d5ae28b2e8__header-content{min-height:var(--wpds-dimension-size-md,32px)}.b7cb5b9daf3a3b25__header-actions{flex-shrink:0}._8113be94e7caf73c__header-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._9a776c7f70996f61__header-visual{display:grid;flex-shrink:0;grid-template-columns:1fr;grid-template-rows:1fr;height:var(--wpds-dimension-size-sm,24px);width:var(--wpds-dimension-size-sm,24px);>*{grid-column:1/-1;grid-row:1/-1;max-height:100%;max-width:100%}}.d5e0920cd15d35bc__sidebar-toggle-slot:empty{display:none}._60fea2f6bf5319cd__header-subtitle{color:var(--wpds-color-foreground-content-neutral-weak,#707070);padding-block-end:var(--wpds-dimension-padding-xs,4px)}._0625b55e82a0d93d__header._4b0f17e503d11619__has-navigation,._0625b55e82a0d93d__header._4b0f17e503d11619__has-navigation ._60fea2f6bf5319cd__header-subtitle{padding-block-end:0}._673c99dcbfb58211__header-navigation{margin-block-start:var(--wpds-dimension-gap-md,12px)}.be5e57d029ec4036__content{display:flex;flex-direction:column;flex-grow:1;overflow:auto;&._128806d0b26e3a50__has-padding{padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px)}}");
}
var style_default22 = { "page": "_956b6df0898efed0__page", "header": "_0625b55e82a0d93d__header", "header-content": "a43c44d5ae28b2e8__header-content", "header-actions": "b7cb5b9daf3a3b25__header-actions", "header-title": "_8113be94e7caf73c__header-title", "header-visual": "_9a776c7f70996f61__header-visual", "sidebar-toggle-slot": "d5e0920cd15d35bc__sidebar-toggle-slot", "header-subtitle": "_60fea2f6bf5319cd__header-subtitle", "has-navigation": "_4b0f17e503d11619__has-navigation", "header-navigation": "_673c99dcbfb58211__header-navigation", "content": "be5e57d029ec4036__content", "has-padding": "_128806d0b26e3a50__has-padding" };
function Header3({
  headingLevel = 1,
  breadcrumbs,
  badges,
  visual,
  title,
  subTitle,
  actions,
  navigation,
  components,
  showSidebarToggle = true
}) {
  const HeadingTag = `h${headingLevel}`;
  const hasNavigation = !!navigation?.items?.length;
  return /* @__PURE__ */ (0, import_jsx_runtime52.jsxs)(
    Stack,
    {
      direction: "column",
      className: clsx_default(
        style_default22.header,
        hasNavigation && style_default22["has-navigation"]
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime52.jsxs)(
          Stack,
          {
            className: style_default22["header-content"],
            direction: "row",
            gap: "sm",
            justify: "space-between",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime52.jsxs)(Stack, { direction: "row", gap: "sm", align: "center", justify: "start", children: [
                showSidebarToggle && /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(
                  SidebarToggleSlot,
                  {
                    bubblesVirtually: true,
                    className: style_default22["sidebar-toggle-slot"]
                  }
                ),
                visual && /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(
                  "div",
                  {
                    className: style_default22["header-visual"],
                    "aria-hidden": "true",
                    children: visual
                  }
                ),
                title && /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(
                  Text,
                  {
                    className: style_default22["header-title"],
                    render: /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(HeadingTag, {}),
                    variant: "heading-lg",
                    children: title
                  }
                ),
                breadcrumbs,
                badges
              ] }),
              actions && /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(
                Stack,
                {
                  align: "center",
                  className: style_default22["header-actions"],
                  direction: "row",
                  gap: "sm",
                  children: actions
                }
              )
            ]
          }
        ),
        subTitle && /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(
          Text,
          {
            render: /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("p", {}),
            variant: "body-md",
            className: style_default22["header-subtitle"],
            children: subTitle
          }
        ),
        hasNavigation && /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(
          navigation_default,
          {
            ...navigation,
            linkComponent: components?.link,
            className: style_default22["header-navigation"]
          }
        )
      ]
    }
  );
}

// packages/admin-ui/build-module/page/index.mjs
var import_jsx_runtime53 = __toESM(require_jsx_runtime(), 1);
var STYLE_HASH_ATTRIBUTE27 = "data-wp-hash";
function getRuntime27() {
  const globalScope = globalThis;
  if (globalScope.__wpStyleRuntime) {
    return globalScope.__wpStyleRuntime;
  }
  globalScope.__wpStyleRuntime = {
    documents: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map(),
    injectedStyles: /* @__PURE__ */ new WeakMap()
  };
  if (typeof document !== "undefined") {
    registerDocument27(document);
  }
  return globalScope.__wpStyleRuntime;
}
function documentContainsStyleHash27(targetDocument, hash) {
  if (!targetDocument.head) {
    return false;
  }
  for (const style of targetDocument.head.querySelectorAll(
    `style[${STYLE_HASH_ATTRIBUTE27}]`
  )) {
    if (style.getAttribute(STYLE_HASH_ATTRIBUTE27) === hash) {
      return true;
    }
  }
  return false;
}
function injectStyle27(targetDocument, hash, css) {
  if (!targetDocument.head) {
    return;
  }
  const runtime = getRuntime27();
  let injectedStyles = runtime.injectedStyles.get(targetDocument);
  if (!injectedStyles) {
    injectedStyles = /* @__PURE__ */ new Set();
    runtime.injectedStyles.set(targetDocument, injectedStyles);
  }
  if (injectedStyles.has(hash)) {
    return;
  }
  if (documentContainsStyleHash27(targetDocument, hash)) {
    injectedStyles.add(hash);
    return;
  }
  const style = targetDocument.createElement("style");
  style.setAttribute(STYLE_HASH_ATTRIBUTE27, hash);
  style.appendChild(targetDocument.createTextNode(css));
  targetDocument.head.appendChild(style);
  injectedStyles.add(hash);
}
function registerDocument27(targetDocument) {
  const runtime = getRuntime27();
  runtime.documents.set(
    targetDocument,
    (runtime.documents.get(targetDocument) ?? 0) + 1
  );
  for (const [hash, css] of runtime.styles) {
    injectStyle27(targetDocument, hash, css);
  }
  return () => {
    const count = runtime.documents.get(targetDocument);
    if (count === void 0) {
      return;
    }
    if (count <= 1) {
      runtime.documents.delete(targetDocument);
      return;
    }
    runtime.documents.set(targetDocument, count - 1);
  };
}
function registerStyle27(hash, css) {
  const runtime = getRuntime27();
  runtime.styles.set(hash, css);
  for (const targetDocument of runtime.documents.keys()) {
    injectStyle27(targetDocument, hash, css);
  }
}
if (typeof process === "undefined" || true) {
  registerStyle27("89e4060c20", "._956b6df0898efed0__page{text-wrap:pretty;background-color:var(--wpds-color-background-surface-neutral,#fcfcfc);color:var(--wpds-color-foreground-content-neutral,#1e1e1e);display:flex;flex-flow:column;height:100%;position:relative;z-index:1}._0625b55e82a0d93d__header{background:var(--wpds-color-background-surface-neutral-strong,#fff);border-block-end:var(--wpds-border-width-xs,1px) solid var(--wpds-color-stroke-surface-neutral-weak,#f0f0f0);inset-block-start:0;padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px);position:sticky;z-index:1}.a43c44d5ae28b2e8__header-content{min-height:var(--wpds-dimension-size-md,32px)}.b7cb5b9daf3a3b25__header-actions{flex-shrink:0}._8113be94e7caf73c__header-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}._9a776c7f70996f61__header-visual{display:grid;flex-shrink:0;grid-template-columns:1fr;grid-template-rows:1fr;height:var(--wpds-dimension-size-sm,24px);width:var(--wpds-dimension-size-sm,24px);>*{grid-column:1/-1;grid-row:1/-1;max-height:100%;max-width:100%}}.d5e0920cd15d35bc__sidebar-toggle-slot:empty{display:none}._60fea2f6bf5319cd__header-subtitle{color:var(--wpds-color-foreground-content-neutral-weak,#707070);padding-block-end:var(--wpds-dimension-padding-xs,4px)}._0625b55e82a0d93d__header._4b0f17e503d11619__has-navigation,._0625b55e82a0d93d__header._4b0f17e503d11619__has-navigation ._60fea2f6bf5319cd__header-subtitle{padding-block-end:0}._673c99dcbfb58211__header-navigation{margin-block-start:var(--wpds-dimension-gap-md,12px)}.be5e57d029ec4036__content{display:flex;flex-direction:column;flex-grow:1;overflow:auto;&._128806d0b26e3a50__has-padding{padding:var(--wpds-dimension-padding-lg,16px) var(--wpds-dimension-padding-2xl,24px)}}");
}
var style_default23 = { "page": "_956b6df0898efed0__page", "header": "_0625b55e82a0d93d__header", "header-content": "a43c44d5ae28b2e8__header-content", "header-actions": "b7cb5b9daf3a3b25__header-actions", "header-title": "_8113be94e7caf73c__header-title", "header-visual": "_9a776c7f70996f61__header-visual", "sidebar-toggle-slot": "d5e0920cd15d35bc__sidebar-toggle-slot", "header-subtitle": "_60fea2f6bf5319cd__header-subtitle", "has-navigation": "_4b0f17e503d11619__has-navigation", "header-navigation": "_673c99dcbfb58211__header-navigation", "content": "be5e57d029ec4036__content", "has-padding": "_128806d0b26e3a50__has-padding" };
function Page({
  headingLevel,
  breadcrumbs,
  badges,
  visual,
  title,
  subTitle,
  children,
  className,
  actions,
  navigation,
  components,
  ariaLabel,
  hasPadding = false,
  showSidebarToggle = true
}) {
  const classes = clsx_default(style_default23.page, className);
  const effectiveAriaLabel = ariaLabel ?? (typeof title === "string" ? title : "");
  return /* @__PURE__ */ (0, import_jsx_runtime53.jsxs)(navigable_region_default, { className: classes, ariaLabel: effectiveAriaLabel, children: [
    (title || breadcrumbs || badges || actions || visual || !!navigation?.items?.length) && /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(
      Header3,
      {
        headingLevel,
        breadcrumbs,
        badges,
        visual,
        title,
        subTitle,
        actions,
        navigation,
        components,
        showSidebarToggle
      }
    ),
    hasPadding ? /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(
      "div",
      {
        className: clsx_default(
          style_default23.content,
          style_default23["has-padding"]
        ),
        children
      }
    ) : children
  ] });
}
Page.SidebarToggleFill = SidebarToggleFill;
var page_default = Page;

// routes/experiments-home/stage.tsx
var import_components30 = __toESM(require_components());
var import_core_data = __toESM(require_core_data());
var import_data = __toESM(require_data());

// packages/dataviews/build-module/constants.mjs
var import_i18n7 = __toESM(require_i18n(), 1);
var OPERATOR_IS_ANY = "isAny";
var OPERATOR_IS_NONE = "isNone";
var OPERATOR_IS_ALL = "isAll";
var OPERATOR_IS_NOT_ALL = "isNotAll";
var OPERATOR_BETWEEN = "between";
var OPERATOR_IN_THE_PAST = "inThePast";
var OPERATOR_OVER = "over";
var OPERATOR_IS = "is";
var OPERATOR_IS_NOT = "isNot";
var OPERATOR_LESS_THAN = "lessThan";
var OPERATOR_GREATER_THAN = "greaterThan";
var OPERATOR_LESS_THAN_OR_EQUAL = "lessThanOrEqual";
var OPERATOR_GREATER_THAN_OR_EQUAL = "greaterThanOrEqual";
var OPERATOR_BEFORE = "before";
var OPERATOR_AFTER = "after";
var OPERATOR_BEFORE_INC = "beforeInc";
var OPERATOR_AFTER_INC = "afterInc";
var OPERATOR_CONTAINS = "contains";
var OPERATOR_NOT_CONTAINS = "notContains";
var OPERATOR_STARTS_WITH = "startsWith";
var OPERATOR_ON = "on";
var OPERATOR_NOT_ON = "notOn";
var sortLabels = {
  asc: (0, import_i18n7.__)("Sort ascending"),
  desc: (0, import_i18n7.__)("Sort descending")
};

// packages/dataviews/build-module/lock-unlock.mjs
var import_private_apis = __toESM(require_private_apis(), 1);
var { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)(
  "I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.",
  "@wordpress/dataviews"
);

// packages/dataviews/build-module/hooks/use-elements.mjs
var import_element43 = __toESM(require_element(), 1);
var EMPTY_ARRAY2 = [];
function useElements({
  elements,
  getElements
}) {
  const staticElements = Array.isArray(elements) && elements.length > 0 ? elements : EMPTY_ARRAY2;
  const [records, setRecords] = (0, import_element43.useState)(staticElements);
  const [isLoading, setIsLoading] = (0, import_element43.useState)(false);
  (0, import_element43.useEffect)(() => {
    if (!getElements) {
      setRecords(staticElements);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    getElements().then((fetchedElements) => {
      if (!cancelled) {
        const dynamicElements = Array.isArray(fetchedElements) && fetchedElements.length > 0 ? fetchedElements : staticElements;
        setRecords(dynamicElements);
      }
    }).catch(() => {
      if (!cancelled) {
        setRecords(staticElements);
      }
    }).finally(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [getElements, staticElements]);
  return {
    elements: records,
    isLoading
  };
}

// packages/dataviews/build-module/utils/operators.mjs
var import_i18n8 = __toESM(require_i18n(), 1);
var import_element44 = __toESM(require_element(), 1);
var import_date2 = __toESM(require_date(), 1);

// packages/dataviews/build-module/field-types/utils/parse-time.mjs
var ZONE_DESIGNATOR = /(?:[Zz]|[+-](?:[01]\d|2[0-3]):?[0-5]\d)$/;
var TIME_FORMATS = ["HH:mm", "HH:mm:ss"];
var REFERENCE_DATE = new Date(2e3, 0, 1);
function parseTime2(value) {
  if (typeof value !== "string") {
    return null;
  }
  const time = value.trim().replace(ZONE_DESIGNATOR, "");
  for (const timeFormat of TIME_FORMATS) {
    const parsed = parse(time, timeFormat, REFERENCE_DATE);
    if (isValid(parsed)) {
      return parsed.getHours() * 3600 + parsed.getMinutes() * 60 + parsed.getSeconds();
    }
  }
  return null;
}

// packages/dataviews/build-module/utils/operators.mjs
var import_jsx_runtime54 = __toESM(require_jsx_runtime(), 1);
var filterTextWrappers = {
  Name: /* @__PURE__ */ (0, import_jsx_runtime54.jsx)("span", { className: "dataviews-filters__summary-filter-text-name" }),
  Value: /* @__PURE__ */ (0, import_jsx_runtime54.jsx)("span", { className: "dataviews-filters__summary-filter-text-value" })
};
function toComparableTemporals(fieldValue, filterValue) {
  const filterTime = parseTime2(filterValue);
  if (filterTime !== null) {
    return [parseTime2(fieldValue) ?? NaN, filterTime];
  }
  return [
    (0, import_date2.getDate)(fieldValue).getTime(),
    (0, import_date2.getDate)(filterValue).getTime()
  ];
}
function getRelativeDate(value, unit) {
  switch (unit) {
    case "days":
      return subDays(/* @__PURE__ */ new Date(), value);
    case "weeks":
      return subWeeks(/* @__PURE__ */ new Date(), value);
    case "months":
      return subMonths(/* @__PURE__ */ new Date(), value);
    case "years":
      return subYears(/* @__PURE__ */ new Date(), value);
    default:
      return /* @__PURE__ */ new Date();
  }
}
var isNoneOperatorDefinition = {
  /* translators: DataViews operator name */
  label: (0, import_i18n8.__)("Is none of"),
  filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
    (0, import_i18n8.sprintf)(
      /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author is none of: Admin, Editor". */
      (0, import_i18n8.__)("<Name>%1$s is none of: </Name><Value>%2$s</Value>"),
      filter.name,
      activeElements.map((element) => element.label).join(", ")
    ),
    filterTextWrappers
  ),
  filter: ((item, field, filterValue) => {
    if (!filterValue?.length) {
      return true;
    }
    const fieldValue = field.getValue({ item });
    if (Array.isArray(fieldValue)) {
      return !filterValue.some(
        (fv) => fieldValue.includes(fv)
      );
    } else if (typeof fieldValue === "string") {
      return !filterValue.includes(fieldValue);
    }
    return false;
  }),
  selection: "multi"
};
var OPERATORS = [
  {
    name: OPERATOR_IS_ANY,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Includes"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author is any: Admin, Editor". */
        (0, import_i18n8.__)("<Name>%1$s includes: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements.map((element) => element.label).join(", ")
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (!filterValue?.length) {
        return true;
      }
      const fieldValue = field.getValue({ item });
      if (Array.isArray(fieldValue)) {
        return filterValue.some(
          (fv) => fieldValue.includes(fv)
        );
      } else if (typeof fieldValue === "string") {
        return filterValue.includes(fieldValue);
      }
      return false;
    },
    selection: "multi"
  },
  {
    name: OPERATOR_IS_NONE,
    ...isNoneOperatorDefinition
  },
  {
    name: OPERATOR_IS_ALL,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Includes all"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author includes all: Admin, Editor". */
        (0, import_i18n8.__)("<Name>%1$s includes all: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements.map((element) => element.label).join(", ")
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (!filterValue?.length) {
        return true;
      }
      return filterValue.every((value) => {
        return field.getValue({ item })?.includes(value);
      });
    },
    selection: "multi"
  },
  {
    name: OPERATOR_IS_NOT_ALL,
    ...isNoneOperatorDefinition
  },
  {
    name: OPERATOR_BETWEEN,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Between (inc)"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Item count"). 2: Filter value min. 3: Filter value max. e.g.: "Item count between (inc): 10 and 180". */
        (0, import_i18n8.__)(
          "<Name>%1$s between (inc): </Name><Value>%2$s and %3$s</Value>"
        ),
        filter.name,
        activeElements[0].label[0],
        activeElements[0].label[1]
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (!Array.isArray(filterValue) || filterValue.length !== 2 || // An unfilled bound is `undefined` from the controls, `''`
      // when it arrives from a persisted view, or `null` once
      // `undefined` round-trips through JSON persistence.
      filterValue.includes(void 0) || filterValue.includes("") || filterValue.includes(null)) {
        return true;
      }
      const fieldValue = field.getValue({ item });
      const [min2, max2] = filterValue.map(parseTime2);
      if (min2 !== null && max2 !== null) {
        const value = parseTime2(fieldValue);
        return value !== null && value >= min2 && value <= max2;
      }
      if (typeof fieldValue === "number" || fieldValue instanceof Date || typeof fieldValue === "string") {
        return fieldValue >= filterValue[0] && fieldValue <= filterValue[1];
      }
      return false;
    },
    selection: "custom"
  },
  {
    name: OPERATOR_IN_THE_PAST,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("In the past"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "7 days"): "Date is in the past: 7 days". */
        (0, import_i18n8.__)(
          "<Name>%1$s is in the past: </Name><Value>%2$s</Value>"
        ),
        filter.name,
        `${activeElements[0].value.value} ${activeElements[0].value.unit}`
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue?.value === void 0 || filterValue?.unit === void 0) {
        return true;
      }
      const targetDate = getRelativeDate(
        filterValue.value,
        filterValue.unit
      );
      const fieldValue = (0, import_date2.getDate)(field.getValue({ item }));
      return fieldValue >= targetDate && fieldValue <= /* @__PURE__ */ new Date();
    },
    selection: "custom"
  },
  {
    name: OPERATOR_OVER,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Over"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "7 days"): "Date is over: 7 days". */
        (0, import_i18n8.__)("<Name>%1$s is over: </Name><Value>%2$s</Value>"),
        filter.name,
        `${activeElements[0].value.value} ${activeElements[0].value.unit}`
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue?.value === void 0 || filterValue?.unit === void 0) {
        return true;
      }
      const targetDate = getRelativeDate(
        filterValue.value,
        filterValue.unit
      );
      const fieldValue = (0, import_date2.getDate)(field.getValue({ item }));
      return fieldValue < targetDate;
    },
    selection: "custom"
  },
  {
    name: OPERATOR_IS,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Is"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author is: Admin". */
        (0, import_i18n8.__)("<Name>%1$s is: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      return filterValue === field.getValue({ item }) || filterValue === void 0;
    },
    selection: "single"
  },
  {
    name: OPERATOR_IS_NOT,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Is not"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author is not: Admin". */
        (0, import_i18n8.__)("<Name>%1$s is not: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      return filterValue !== field.getValue({ item });
    },
    selection: "single"
  },
  {
    name: OPERATOR_LESS_THAN,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Less than"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Count"). 2: Filter value (e.g. "10"): "Count is less than: 10". */
        (0, import_i18n8.__)("<Name>%1$s is less than: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const fieldValue = field.getValue({ item });
      return fieldValue < filterValue;
    },
    selection: "single"
  },
  {
    name: OPERATOR_GREATER_THAN,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Greater than"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Count"). 2: Filter value (e.g. "10"): "Count is greater than: 10". */
        (0, import_i18n8.__)(
          "<Name>%1$s is greater than: </Name><Value>%2$s</Value>"
        ),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const fieldValue = field.getValue({ item });
      return fieldValue > filterValue;
    },
    selection: "single"
  },
  {
    name: OPERATOR_LESS_THAN_OR_EQUAL,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Less than or equal"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Count"). 2: Filter value (e.g. "10"): "Count is less than or equal to: 10". */
        (0, import_i18n8.__)(
          "<Name>%1$s is less than or equal to: </Name><Value>%2$s</Value>"
        ),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const fieldValue = field.getValue({ item });
      return fieldValue <= filterValue;
    },
    selection: "single"
  },
  {
    name: OPERATOR_GREATER_THAN_OR_EQUAL,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Greater than or equal"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Count"). 2: Filter value (e.g. "10"): "Count is greater than or equal to: 10". */
        (0, import_i18n8.__)(
          "<Name>%1$s is greater than or equal to: </Name><Value>%2$s</Value>"
        ),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const fieldValue = field.getValue({ item });
      return fieldValue >= filterValue;
    },
    selection: "single"
  },
  {
    name: OPERATOR_BEFORE,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Before"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is before: 2024-01-01". */
        (0, import_i18n8.__)("<Name>%1$s is before: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const [fieldTemporal, filterTemporal] = toComparableTemporals(
        field.getValue({ item }),
        filterValue
      );
      return fieldTemporal < filterTemporal;
    },
    selection: "single"
  },
  {
    name: OPERATOR_AFTER,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("After"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is after: 2024-01-01". */
        (0, import_i18n8.__)("<Name>%1$s is after: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const [fieldTemporal, filterTemporal] = toComparableTemporals(
        field.getValue({ item }),
        filterValue
      );
      return fieldTemporal > filterTemporal;
    },
    selection: "single"
  },
  {
    name: OPERATOR_BEFORE_INC,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Before (inc)"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is on or before: 2024-01-01". */
        (0, import_i18n8.__)(
          "<Name>%1$s is on or before: </Name><Value>%2$s</Value>"
        ),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const [fieldTemporal, filterTemporal] = toComparableTemporals(
        field.getValue({ item }),
        filterValue
      );
      return fieldTemporal <= filterTemporal;
    },
    selection: "single"
  },
  {
    name: OPERATOR_AFTER_INC,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("After (inc)"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is on or after: 2024-01-01". */
        (0, import_i18n8.__)(
          "<Name>%1$s is on or after: </Name><Value>%2$s</Value>"
        ),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const [fieldTemporal, filterTemporal] = toComparableTemporals(
        field.getValue({ item }),
        filterValue
      );
      return fieldTemporal >= filterTemporal;
    },
    selection: "single"
  },
  {
    name: OPERATOR_CONTAINS,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Contains"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Title"). 2: Filter value (e.g. "Hello"): "Title contains: Hello". */
        (0, import_i18n8.__)("<Name>%1$s contains: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const fieldValue = field.getValue({ item });
      return typeof fieldValue === "string" && filterValue && fieldValue.toLowerCase().includes(String(filterValue).toLowerCase());
    },
    selection: "single"
  },
  {
    name: OPERATOR_NOT_CONTAINS,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Doesn't contain"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Title"). 2: Filter value (e.g. "Hello"): "Title doesn't contain: Hello". */
        (0, import_i18n8.__)(
          "<Name>%1$s doesn't contain: </Name><Value>%2$s</Value>"
        ),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const fieldValue = field.getValue({ item });
      return typeof fieldValue === "string" && filterValue && !fieldValue.toLowerCase().includes(String(filterValue).toLowerCase());
    },
    selection: "single"
  },
  {
    name: OPERATOR_STARTS_WITH,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Starts with"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Title"). 2: Filter value (e.g. "Hello"): "Title starts with: Hello". */
        (0, import_i18n8.__)("<Name>%1$s starts with: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const fieldValue = field.getValue({ item });
      return typeof fieldValue === "string" && filterValue && fieldValue.toLowerCase().startsWith(String(filterValue).toLowerCase());
    },
    selection: "single"
  },
  {
    name: OPERATOR_ON,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("On"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is: 2024-01-01". */
        (0, import_i18n8.__)("<Name>%1$s is: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const [fieldTemporal, filterTemporal] = toComparableTemporals(
        field.getValue({ item }),
        filterValue
      );
      return fieldTemporal === filterTemporal;
    },
    selection: "single"
  },
  {
    name: OPERATOR_NOT_ON,
    /* translators: DataViews operator name */
    label: (0, import_i18n8.__)("Not on"),
    filterText: (filter, activeElements) => (0, import_element44.createInterpolateElement)(
      (0, import_i18n8.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is not: 2024-01-01". */
        (0, import_i18n8.__)("<Name>%1$s is not: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const [fieldTemporal, filterTemporal] = toComparableTemporals(
        field.getValue({ item }),
        filterValue
      );
      return fieldTemporal !== filterTemporal;
    },
    selection: "single"
  }
];
var getOperatorByName = (name) => OPERATORS.find((op) => op.name === name);
var getAllOperatorNames = () => OPERATORS.map((op) => op.name);

// packages/dataviews/build-module/components/dataform-controls/checkbox.mjs
var import_element53 = __toESM(require_element(), 1);

// packages/dataviews/build-module/components/validated-form-controls/checkbox-control.mjs
var import_element45 = __toESM(require_element(), 1);
var import_compose5 = __toESM(require_compose(), 1);
var import_components3 = __toESM(require_components(), 1);
var import_jsx_runtime55 = __toESM(require_jsx_runtime(), 1);
var UnforwardedValidatedCheckboxControl = ({
  required,
  customValidity,
  markWhenOptional,
  ...restProps
}, forwardedRef) => {
  const validityTargetRef = (0, import_element45.useRef)(null);
  const mergedRefs = (0, import_compose5.useMergeRefs)([forwardedRef, validityTargetRef]);
  return /* @__PURE__ */ (0, import_jsx_runtime55.jsx)(
    ControlWithError,
    {
      className: "dataviews-validated-control",
      required,
      markWhenOptional,
      ref: mergedRefs,
      customValidity,
      getValidityTarget: () => validityTargetRef.current?.querySelector(
        'input[type="checkbox"]'
      ),
      children: /* @__PURE__ */ (0, import_jsx_runtime55.jsx)(
        import_components3.CheckboxControl,
        {
          ...restProps
        }
      )
    }
  );
};
var ValidatedCheckboxControl = (0, import_element45.forwardRef)(UnforwardedValidatedCheckboxControl);
ValidatedCheckboxControl.displayName = "ValidatedCheckboxControl";

// packages/dataviews/build-module/components/validated-form-controls/combobox-control.mjs
var import_element46 = __toESM(require_element(), 1);
var import_compose6 = __toESM(require_compose(), 1);
var import_components4 = __toESM(require_components(), 1);
var import_jsx_runtime56 = __toESM(require_jsx_runtime(), 1);
var UnforwardedValidatedComboboxControl = ({
  required,
  customValidity,
  markWhenOptional,
  ...restProps
}, forwardedRef) => {
  const validityTargetRef = (0, import_element46.useRef)(null);
  const mergedRefs = (0, import_compose6.useMergeRefs)([forwardedRef, validityTargetRef]);
  (0, import_element46.useEffect)(() => {
    const input = validityTargetRef.current?.querySelector(
      'input[role="combobox"]'
    );
    if (input) {
      input.required = required ?? false;
    }
  }, [required]);
  return (
    // TODO: Bug - Missing value error is not cleared immediately on change, waits for blur.
    /* @__PURE__ */ (0, import_jsx_runtime56.jsx)(
      ControlWithError,
      {
        className: "dataviews-validated-control",
        required,
        markWhenOptional,
        ref: mergedRefs,
        customValidity,
        getValidityTarget: () => validityTargetRef.current?.querySelector(
          'input[role="combobox"]'
        ),
        children: /* @__PURE__ */ (0, import_jsx_runtime56.jsx)(import_components4.ComboboxControl, { ...restProps })
      }
    )
  );
};
var ValidatedComboboxControl = (0, import_element46.forwardRef)(UnforwardedValidatedComboboxControl);
ValidatedComboboxControl.displayName = "ValidatedComboboxControl";

// packages/dataviews/build-module/components/validated-form-controls/form-token-field.mjs
var import_element47 = __toESM(require_element(), 1);
var import_components5 = __toESM(require_components(), 1);
var import_jsx_runtime57 = __toESM(require_jsx_runtime(), 1);
var UnforwardedValidatedFormTokenField = ({
  required,
  customValidity,
  markWhenOptional,
  ...restProps
}, forwardedRef) => {
  const validityTargetRef = (0, import_element47.useRef)(null);
  return /* @__PURE__ */ (0, import_jsx_runtime57.jsxs)(
    "div",
    {
      className: "dataviews-validated-control__wrapper-with-error-delegate",
      ref: forwardedRef,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime57.jsx)(
          ControlWithError,
          {
            className: "dataviews-validated-control",
            required,
            markWhenOptional,
            customValidity,
            getValidityTarget: () => validityTargetRef.current,
            children: /* @__PURE__ */ (0, import_jsx_runtime57.jsx)(import_components5.FormTokenField, { ...restProps })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime57.jsx)(
          "input",
          {
            className: "dataviews-validated-control__error-delegate",
            type: "text",
            ref: validityTargetRef,
            required,
            value: restProps.value && restProps.value.length > 0 ? "hasvalue" : "",
            tabIndex: -1,
            onChange: () => {
            },
            onFocus: (e2) => {
              e2.target.previousElementSibling?.querySelector(
                'input[type="text"]'
              )?.focus();
            }
          }
        )
      ]
    }
  );
};
var ValidatedFormTokenField = (0, import_element47.forwardRef)(UnforwardedValidatedFormTokenField);
ValidatedFormTokenField.displayName = "ValidatedFormTokenField";

// packages/dataviews/build-module/components/validated-form-controls/number-control.mjs
var import_element48 = __toESM(require_element(), 1);
var import_compose7 = __toESM(require_compose(), 1);
var import_components6 = __toESM(require_components(), 1);
var import_jsx_runtime58 = __toESM(require_jsx_runtime(), 1);
var UnforwardedValidatedNumberControl = ({
  required,
  customValidity,
  markWhenOptional,
  ...restProps
}, forwardedRef) => {
  const validityTargetRef = (0, import_element48.useRef)(null);
  const mergedRefs = (0, import_compose7.useMergeRefs)([forwardedRef, validityTargetRef]);
  return /* @__PURE__ */ (0, import_jsx_runtime58.jsx)(
    ControlWithError,
    {
      className: "dataviews-validated-control",
      required,
      markWhenOptional,
      customValidity,
      getValidityTarget: () => validityTargetRef.current,
      children: /* @__PURE__ */ (0, import_jsx_runtime58.jsx)(import_components6.__experimentalNumberControl, { ref: mergedRefs, ...restProps })
    }
  );
};
var ValidatedNumberControl = (0, import_element48.forwardRef)(UnforwardedValidatedNumberControl);
ValidatedNumberControl.displayName = "ValidatedNumberControl";

// packages/dataviews/build-module/components/validated-form-controls/radio-control.mjs
var import_element49 = __toESM(require_element(), 1);
var import_compose8 = __toESM(require_compose(), 1);
var import_components7 = __toESM(require_components(), 1);
var import_jsx_runtime59 = __toESM(require_jsx_runtime(), 1);
var UnforwardedValidatedRadioControl = ({
  required,
  customValidity,
  markWhenOptional,
  ...restProps
}, forwardedRef) => {
  const validityTargetRef = (0, import_element49.useRef)(null);
  const mergedRefs = (0, import_compose8.useMergeRefs)([forwardedRef, validityTargetRef]);
  return /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
    ControlWithError,
    {
      className: "dataviews-validated-control",
      required,
      markWhenOptional,
      ref: mergedRefs,
      customValidity,
      getValidityTarget: () => validityTargetRef.current?.querySelector(
        'input[type="radio"]'
      ),
      children: /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(import_components7.RadioControl, { ...restProps })
    }
  );
};
var ValidatedRadioControl = (0, import_element49.forwardRef)(UnforwardedValidatedRadioControl);
ValidatedRadioControl.displayName = "ValidatedRadioControl";

// packages/dataviews/build-module/components/validated-form-controls/select-control.mjs
var import_element50 = __toESM(require_element(), 1);
var import_compose9 = __toESM(require_compose(), 1);
var import_components8 = __toESM(require_components(), 1);
var import_jsx_runtime60 = __toESM(require_jsx_runtime(), 1);
var UnforwardedValidatedSelectControl = ({
  required,
  customValidity,
  markWhenOptional,
  ...restProps
}, forwardedRef) => {
  const validityTargetRef = (0, import_element50.useRef)(null);
  const mergedRefs = (0, import_compose9.useMergeRefs)([forwardedRef, validityTargetRef]);
  return /* @__PURE__ */ (0, import_jsx_runtime60.jsx)(
    ControlWithError,
    {
      className: "dataviews-validated-control",
      required,
      markWhenOptional,
      customValidity,
      getValidityTarget: () => validityTargetRef.current,
      children: /* @__PURE__ */ (0, import_jsx_runtime60.jsx)(
        import_components8.SelectControl,
        {
          ref: mergedRefs,
          // A runtime boolean cannot statically discriminate
          // SelectControl's single/multiple props union.
          ...restProps
        }
      )
    }
  );
};
var ValidatedSelectControl = (0, import_element50.forwardRef)(UnforwardedValidatedSelectControl);
ValidatedSelectControl.displayName = "ValidatedSelectControl";

// packages/dataviews/build-module/components/validated-form-controls/toggle-control.mjs
var import_element51 = __toESM(require_element(), 1);
var import_compose10 = __toESM(require_compose(), 1);
var import_components9 = __toESM(require_components(), 1);
var import_jsx_runtime61 = __toESM(require_jsx_runtime(), 1);
var UnforwardedValidatedToggleControl = ({
  required,
  customValidity,
  markWhenOptional,
  ...restProps
}, forwardedRef) => {
  const validityTargetRef = (0, import_element51.useRef)(null);
  const mergedRefs = (0, import_compose10.useMergeRefs)([forwardedRef, validityTargetRef]);
  return /* @__PURE__ */ (0, import_jsx_runtime61.jsx)(
    ControlWithError,
    {
      className: "dataviews-validated-control",
      required,
      markWhenOptional,
      customValidity,
      getValidityTarget: () => validityTargetRef.current,
      children: /* @__PURE__ */ (0, import_jsx_runtime61.jsx)(
        import_components9.ToggleControl,
        {
          ref: mergedRefs,
          required,
          ...restProps
        }
      )
    }
  );
};
var ValidatedToggleControl = (0, import_element51.forwardRef)(UnforwardedValidatedToggleControl);
ValidatedToggleControl.displayName = "ValidatedToggleControl";

// packages/dataviews/build-module/components/validated-form-controls/toggle-group-control.mjs
var import_element52 = __toESM(require_element(), 1);
var import_components10 = __toESM(require_components(), 1);
var import_jsx_runtime62 = __toESM(require_jsx_runtime(), 1);
var UnforwardedValidatedToggleGroupControl = ({
  required,
  customValidity,
  markWhenOptional,
  ...restProps
}, forwardedRef) => {
  const validityTargetRef = (0, import_element52.useRef)(null);
  const nameAttr = (0, import_element52.useId)();
  return /* @__PURE__ */ (0, import_jsx_runtime62.jsxs)("div", { className: "dataviews-validated-control__wrapper-with-error-delegate", children: [
    /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
      ControlWithError,
      {
        className: "dataviews-validated-control",
        required,
        markWhenOptional,
        customValidity,
        getValidityTarget: () => validityTargetRef.current,
        children: /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(import_components10.__experimentalToggleGroupControl, { ref: forwardedRef, ...restProps })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
      "input",
      {
        className: "dataviews-validated-control__error-delegate",
        type: "radio",
        ref: validityTargetRef,
        required,
        checked: restProps.value !== void 0,
        tabIndex: -1,
        name: nameAttr,
        onChange: () => {
        },
        onFocus: (e2) => {
          e2.target.previousElementSibling?.querySelector(
            '[data-active-item="true"]'
          )?.focus();
        }
      }
    )
  ] });
};
var ValidatedToggleGroupControl = (0, import_element52.forwardRef)(UnforwardedValidatedToggleGroupControl);
ValidatedToggleGroupControl.displayName = "ValidatedToggleGroupControl";

// packages/dataviews/build-module/components/dataform-controls/utils/get-custom-validity.mjs
function getCustomValidity(isValid2, validity) {
  let customValidity;
  if (isValid2?.required && validity?.required) {
    customValidity = validity.required.message ? {
      type: validity.required.type,
      message: validity.required.message
    } : void 0;
  } else if (isValid2?.pattern && validity?.pattern) {
    customValidity = validity.pattern;
  } else if (isValid2?.min && validity?.min) {
    customValidity = validity.min;
  } else if (isValid2?.max && validity?.max) {
    customValidity = validity.max;
  } else if (isValid2?.minLength && validity?.minLength) {
    customValidity = validity.minLength;
  } else if (isValid2?.maxLength && validity?.maxLength) {
    customValidity = validity.maxLength;
  } else if (isValid2?.elements && validity?.elements) {
    customValidity = validity.elements;
  } else if (validity?.custom) {
    customValidity = validity.custom;
  }
  return customValidity;
}

// packages/dataviews/build-module/components/dataform-controls/checkbox.mjs
var import_jsx_runtime63 = __toESM(require_jsx_runtime(), 1);
function Checkbox({
  field,
  onChange,
  data,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const { getValue, setValue, label, description, isValid: isValid2 } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  const onChangeControl = (0, import_element53.useCallback)(() => {
    onChange(
      setValue({ item: data, value: !getValue({ item: data }) })
    );
  }, [data, getValue, onChange, setValue]);
  return /* @__PURE__ */ (0, import_jsx_runtime63.jsx)(
    ValidatedCheckboxControl,
    {
      required: !!field.isValid?.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      hidden: hideLabelFromVision,
      label,
      help: description,
      checked: getValue({ item: data }),
      onChange: onChangeControl,
      disabled: disabled2
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/combobox.mjs
var import_components11 = __toESM(require_components(), 1);
var import_element54 = __toESM(require_element(), 1);
var import_jsx_runtime64 = __toESM(require_jsx_runtime(), 1);
function Combobox({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  const { label, description, placeholder, getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data }) ?? "";
  const onChangeControl = (0, import_element54.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue ?? "" })),
    [data, onChange, setValue]
  );
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime64.jsx)(import_components11.Spinner, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime64.jsx)(
    ValidatedComboboxControl,
    {
      required: !!field.isValid?.required,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      value,
      help: description,
      placeholder,
      options: elements,
      onChange: onChangeControl,
      hideLabelFromVision,
      allowReset: true,
      expandOnFocus: true
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/datetime.mjs
var import_components13 = __toESM(require_components(), 1);
var import_element57 = __toESM(require_element(), 1);
var import_i18n10 = __toESM(require_i18n(), 1);
var import_date4 = __toESM(require_date(), 1);
import { speak as speak2 } from "@wordpress/a11y";

// packages/dataviews/build-module/components/dataform-controls/utils/relative-date-control.mjs
var import_components12 = __toESM(require_components(), 1);
var import_element55 = __toESM(require_element(), 1);
var import_i18n9 = __toESM(require_i18n(), 1);
var import_jsx_runtime65 = __toESM(require_jsx_runtime(), 1);
var TIME_UNITS_OPTIONS = {
  [OPERATOR_IN_THE_PAST]: [
    { value: "days", label: (0, import_i18n9.__)("Days") },
    { value: "weeks", label: (0, import_i18n9.__)("Weeks") },
    { value: "months", label: (0, import_i18n9.__)("Months") },
    { value: "years", label: (0, import_i18n9.__)("Years") }
  ],
  [OPERATOR_OVER]: [
    { value: "days", label: (0, import_i18n9.__)("Days ago") },
    { value: "weeks", label: (0, import_i18n9.__)("Weeks ago") },
    { value: "months", label: (0, import_i18n9.__)("Months ago") },
    { value: "years", label: (0, import_i18n9.__)("Years ago") }
  ]
};
function RelativeDateControl({
  className,
  data,
  field,
  onChange,
  hideLabelFromVision,
  operator
}) {
  const options = TIME_UNITS_OPTIONS[operator === OPERATOR_IN_THE_PAST ? "inThePast" : "over"];
  const { id, label, description, getValue, setValue } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  const fieldValue = getValue({ item: data });
  const { value: relValue = "", unit = options[0].value } = fieldValue && typeof fieldValue === "object" ? fieldValue : {};
  const onChangeValue = (0, import_element55.useCallback)(
    (newValue) => onChange(
      setValue({
        item: data,
        value: { value: Number(newValue), unit }
      })
    ),
    [onChange, setValue, data, unit]
  );
  const onChangeUnit = (0, import_element55.useCallback)(
    (newUnit) => onChange(
      setValue({
        item: data,
        value: { value: relValue, unit: newUnit }
      })
    ),
    [onChange, setValue, data, relValue]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime65.jsx)(
    import_components12.BaseControl,
    {
      id,
      className: clsx_default(className, "dataviews-controls__relative-date"),
      label,
      hideLabelFromVision,
      help: description,
      children: /* @__PURE__ */ (0, import_jsx_runtime65.jsxs)(Stack, { direction: "row", gap: "sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime65.jsx)(
          import_components12.__experimentalNumberControl,
          {
            className: "dataviews-controls__relative-date-number",
            spinControls: "none",
            min: 1,
            step: 1,
            value: relValue,
            onChange: onChangeValue,
            disabled: disabled2
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime65.jsx)(
          import_components12.SelectControl,
          {
            className: "dataviews-controls__relative-date-unit",
            label: (0, import_i18n9.__)("Unit"),
            value: unit,
            options,
            onChange: onChangeUnit,
            hideLabelFromVision: true,
            disabled: disabled2
          }
        )
      ] })
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/utils/to-calendar-date.mjs
function toCalendarDate(date, timeZone) {
  return timeZone ? new TZDate(date, timeZone) : date;
}

// packages/dataviews/build-module/components/dataform-controls/utils/use-disabled-date-matchers.mjs
var import_element56 = __toESM(require_element(), 1);
function useDisabledDateMatchers(isValid2, parseDateFn) {
  const minConstraint = typeof isValid2.min?.constraint === "string" ? isValid2.min.constraint : void 0;
  const maxConstraint = typeof isValid2.max?.constraint === "string" ? isValid2.max.constraint : void 0;
  const disabledMatchers = (0, import_element56.useMemo)(() => {
    const matchers = [];
    if (minConstraint) {
      const minDate = parseDateFn(minConstraint);
      if (minDate) {
        matchers.push({ before: minDate });
      }
    }
    if (maxConstraint) {
      const maxDate = parseDateFn(maxConstraint);
      if (maxDate) {
        matchers.push({ after: maxDate });
      }
    }
    return matchers.length > 0 ? matchers : void 0;
  }, [minConstraint, maxConstraint, parseDateFn]);
  return { minConstraint, maxConstraint, disabledMatchers };
}

// packages/dataviews/build-module/field-types/utils/parse-date-time.mjs
var import_date3 = __toESM(require_date(), 1);
function parseDateTime(dateTimeString) {
  if (!dateTimeString) {
    return null;
  }
  const parsed = (0, import_date3.getDate)(dateTimeString);
  return parsed && isValid(parsed) ? parsed : null;
}

// packages/dataviews/build-module/components/dataform-controls/datetime.mjs
var import_jsx_runtime66 = __toESM(require_jsx_runtime(), 1);
var formatDateTime = (value) => {
  if (!value) {
    return "";
  }
  return (0, import_date4.dateI18n)("Y-m-d\\TH:i", (0, import_date4.getDate)(value));
};
function CalendarDateTimeControl({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity,
  config
}) {
  const { compact } = config || {};
  const { id, label, description, setValue, getValue, isValid: isValid2 } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  const fieldValue = getValue({ item: data });
  const value = typeof fieldValue === "string" ? fieldValue : void 0;
  const { timezone } = (0, import_date4.getSettings)();
  const timeZone = timezone.string || (0, import_date4.dateI18n)("P");
  const [calendarMonth, setCalendarMonth] = (0, import_element57.useState)(() => {
    const parsedDate = parseDateTime(value);
    return toCalendarDate(parsedDate || /* @__PURE__ */ new Date(), timeZone);
  });
  (0, import_element57.useEffect)(() => {
    const parsedDate = parseDateTime(value);
    if (parsedDate) {
      const targetMonth = toCalendarDate(parsedDate, timeZone);
      setCalendarMonth(
        (currentMonth) => isSameMonth(
          targetMonth,
          toCalendarDate(currentMonth, timeZone)
        ) ? currentMonth : targetMonth
      );
    }
  }, [timeZone, value]);
  const inputControlRef = (0, import_element57.useRef)(null);
  const validationTimeoutRef = (0, import_element57.useRef)(void 0);
  const { minConstraint, maxConstraint, disabledMatchers } = useDisabledDateMatchers(isValid2, parseDateTime);
  const onChangeCallback = (0, import_element57.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  (0, import_element57.useEffect)(() => {
    return () => clearTimeout(validationTimeoutRef.current);
  }, []);
  const onSelectDate = (0, import_element57.useCallback)(
    (newDate) => {
      if (newDate) {
        const wpDate = (0, import_date4.dateI18n)("Y-m-d", newDate);
        const wpTime = value ? (0, import_date4.dateI18n)("H:i", (0, import_date4.getDate)(value)) : "00:00";
        const finalDateTime = (0, import_date4.getDate)(`${wpDate}T${wpTime}`);
        onChangeCallback(finalDateTime.toISOString());
      } else {
        onChangeCallback(void 0);
      }
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = setTimeout(() => {
        const input = inputControlRef.current;
        if (!input) {
          return;
        }
        input.dispatchEvent(
          new Event("invalid", { cancelable: true })
        );
        if (input.validationMessage) {
          speak2(input.validationMessage);
        }
      }, 0);
    },
    [onChangeCallback, value]
  );
  const handleManualDateTimeChange = (0, import_element57.useCallback)(
    (newValue) => {
      if (newValue) {
        const dateTime = (0, import_date4.getDate)(newValue);
        onChangeCallback(dateTime.toISOString());
        const parsedDate = parseDateTime(dateTime.toISOString());
        if (parsedDate) {
          setCalendarMonth(toCalendarDate(parsedDate, timeZone));
        }
      } else {
        onChangeCallback(void 0);
      }
    },
    [onChangeCallback, timeZone]
  );
  const { format: fieldFormat } = field;
  const weekStartsOn = fieldFormat.weekStartsOn ?? (0, import_date4.getSettings)().l10n.startOfWeek;
  let displayLabel = label;
  if (isValid2?.required && !markWhenOptional && !hideLabelFromVision) {
    displayLabel = `${label} (${(0, import_i18n10.__)("Required")})`;
  } else if (!isValid2?.required && markWhenOptional && !hideLabelFromVision) {
    displayLabel = `${label} (${(0, import_i18n10.__)("Optional")})`;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime66.jsx)(
    import_components13.BaseControl,
    {
      id,
      label: displayLabel,
      help: description,
      hideLabelFromVision,
      children: /* @__PURE__ */ (0, import_jsx_runtime66.jsxs)(Stack, { direction: "column", gap: "lg", children: [
        /* @__PURE__ */ (0, import_jsx_runtime66.jsx)(
          ValidatedInputControl,
          {
            ref: inputControlRef,
            required: !!isValid2?.required,
            customValidity: getCustomValidity(isValid2, validity),
            type: "datetime-local",
            label: (0, import_i18n10.__)("Date time"),
            hideLabelFromVision: true,
            value: formatDateTime(value),
            onValueChange: handleManualDateTimeChange,
            disabled: disabled2,
            min: minConstraint ? formatDateTime(minConstraint) : void 0,
            max: maxConstraint ? formatDateTime(maxConstraint) : void 0
          }
        ),
        !compact && /* @__PURE__ */ (0, import_jsx_runtime66.jsx)(
          Calendar,
          {
            style: { width: "100%" },
            value: value ? parseDateTime(value) : null,
            onValueChange: onSelectDate,
            month: calendarMonth,
            onMonthChange: setCalendarMonth,
            timeZone,
            weekStartsOn,
            disabled: disabled2 || disabledMatchers
          }
        )
      ] })
    }
  );
}
function DateTime({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  operator,
  validity,
  config
}) {
  if (operator === OPERATOR_IN_THE_PAST || operator === OPERATOR_OVER) {
    return /* @__PURE__ */ (0, import_jsx_runtime66.jsx)(
      RelativeDateControl,
      {
        className: "dataviews-controls__datetime",
        data,
        field,
        onChange,
        hideLabelFromVision,
        operator
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime66.jsx)(
    CalendarDateTimeControl,
    {
      data,
      field,
      onChange,
      hideLabelFromVision,
      markWhenOptional,
      validity,
      config
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/date.mjs
var import_components14 = __toESM(require_components(), 1);
var import_element58 = __toESM(require_element(), 1);
var import_i18n11 = __toESM(require_i18n(), 1);
var import_date5 = __toESM(require_date(), 1);
import { speak as speak3 } from "@wordpress/a11y";
var import_jsx_runtime67 = __toESM(require_jsx_runtime(), 1);
var DATE_PRESETS = [
  {
    id: "today",
    label: (0, import_i18n11.__)("Today"),
    getValue: () => (0, import_date5.getDate)(null)
  },
  {
    id: "yesterday",
    label: (0, import_i18n11.__)("Yesterday"),
    getValue: () => {
      const today = (0, import_date5.getDate)(null);
      return subDays(today, 1);
    }
  },
  {
    id: "past-week",
    label: (0, import_i18n11.__)("Past week"),
    getValue: () => {
      const today = (0, import_date5.getDate)(null);
      return subDays(today, 7);
    }
  },
  {
    id: "past-month",
    label: (0, import_i18n11.__)("Past month"),
    getValue: () => {
      const today = (0, import_date5.getDate)(null);
      return subMonths(today, 1);
    }
  }
];
var DATE_RANGE_PRESETS = [
  {
    id: "last-7-days",
    label: (0, import_i18n11.__)("Last 7 days"),
    getValue: () => {
      const today = (0, import_date5.getDate)(null);
      return [subDays(today, 7), today];
    }
  },
  {
    id: "last-30-days",
    label: (0, import_i18n11.__)("Last 30 days"),
    getValue: () => {
      const today = (0, import_date5.getDate)(null);
      return [subDays(today, 30), today];
    }
  },
  {
    id: "month-to-date",
    label: (0, import_i18n11.__)("Month to date"),
    getValue: () => {
      const today = (0, import_date5.getDate)(null);
      return [startOfMonth(today), today];
    }
  },
  {
    id: "last-year",
    label: (0, import_i18n11.__)("Last year"),
    getValue: () => {
      const today = (0, import_date5.getDate)(null);
      return [subYears(today, 1), today];
    }
  },
  {
    id: "year-to-date",
    label: (0, import_i18n11.__)("Year to date"),
    getValue: () => {
      const today = (0, import_date5.getDate)(null);
      return [startOfYear(today), today];
    }
  }
];
var parseDate2 = (dateString) => {
  if (!dateString) {
    return null;
  }
  const parsed = parseISO(dateString);
  return isValid(parsed) ? parsed : null;
};
var formatDate = (date) => {
  if (!date) {
    return "";
  }
  return typeof date === "string" ? date : format(date, "yyyy-MM-dd");
};
function ValidatedDateControl({
  field,
  validity,
  inputRefs,
  isTouched,
  setIsTouched,
  children
}) {
  const { isValid: isValid2 } = field;
  const [customValidity, setCustomValidity] = (0, import_element58.useState)(void 0);
  const validateRefs = (0, import_element58.useCallback)(() => {
    const refs = Array.isArray(inputRefs) ? inputRefs : [inputRefs];
    for (const ref of refs) {
      const input = ref.current;
      if (input && !input.validity.valid) {
        setCustomValidity({
          type: "invalid",
          message: input.validationMessage
        });
        return;
      }
    }
    setCustomValidity(void 0);
  }, [inputRefs]);
  (0, import_element58.useEffect)(() => {
    const refs = Array.isArray(inputRefs) ? inputRefs : [inputRefs];
    const result = validity ? getCustomValidity(isValid2, validity) : void 0;
    for (const ref of refs) {
      const input = ref.current;
      if (input) {
        input.setCustomValidity(
          result?.type === "invalid" && result.message ? result.message : ""
        );
      }
    }
  }, [inputRefs, isValid2, validity]);
  (0, import_element58.useEffect)(() => {
    const refs = Array.isArray(inputRefs) ? inputRefs : [inputRefs];
    const handleInvalid = (event) => {
      event.preventDefault();
      setIsTouched(true);
    };
    for (const ref of refs) {
      ref.current?.addEventListener("invalid", handleInvalid);
    }
    return () => {
      for (const ref of refs) {
        ref.current?.removeEventListener("invalid", handleInvalid);
      }
    };
  }, [inputRefs, setIsTouched]);
  (0, import_element58.useEffect)(() => {
    if (!isTouched) {
      return;
    }
    const result = validity ? getCustomValidity(isValid2, validity) : void 0;
    if (result) {
      setCustomValidity(result);
    } else {
      validateRefs();
    }
  }, [isTouched, isValid2, validity, validateRefs]);
  (0, import_element58.useEffect)(() => {
    if (isTouched && customValidity?.message) {
      speak3(customValidity.message);
    }
  }, [isTouched, customValidity?.message]);
  const onBlur = (event) => {
    if (isTouched) {
      return;
    }
    if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
      setIsTouched(true);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime67.jsxs)("div", { onBlur, children: [
    children,
    customValidity && /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
      ValidityIndicator,
      {
        type: customValidity.type,
        message: customValidity.message
      }
    )
  ] });
}
function CalendarDateControl({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const {
    id,
    label,
    description,
    setValue,
    getValue,
    isValid: isValid2,
    format: fieldFormat
  } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  const [selectedPresetId, setSelectedPresetId] = (0, import_element58.useState)(
    null
  );
  const weekStartsOn = fieldFormat.weekStartsOn ?? (0, import_date5.getSettings)().l10n.startOfWeek;
  const fieldValue = getValue({ item: data });
  const value = typeof fieldValue === "string" ? fieldValue : void 0;
  const [calendarMonth, setCalendarMonth] = (0, import_element58.useState)(() => {
    const parsedDate = parseDate2(value);
    return parsedDate || /* @__PURE__ */ new Date();
  });
  (0, import_element58.useEffect)(() => {
    const parsedDate = parseDate2(value);
    if (parsedDate) {
      setCalendarMonth(
        (currentMonth) => isSameMonth(parsedDate, currentMonth) ? currentMonth : parsedDate
      );
    }
  }, [value]);
  const [isTouched, setIsTouched] = (0, import_element58.useState)(false);
  const validityTargetRef = (0, import_element58.useRef)(null);
  const { minConstraint, maxConstraint, disabledMatchers } = useDisabledDateMatchers(isValid2, parseDate2);
  const onChangeCallback = (0, import_element58.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  const onSelectDate = (0, import_element58.useCallback)(
    (newDate) => {
      const dateValue = newDate ? formatDate(newDate) : void 0;
      onChangeCallback(dateValue);
      setSelectedPresetId(null);
      setIsTouched(true);
    },
    [onChangeCallback]
  );
  const handlePresetClick = (0, import_element58.useCallback)(
    (preset) => {
      const presetDate = preset.getValue();
      const dateValue = formatDate(presetDate);
      setCalendarMonth(presetDate);
      onChangeCallback(dateValue);
      setSelectedPresetId(preset.id);
      setIsTouched(true);
    },
    [onChangeCallback]
  );
  const handleManualDateChange = (0, import_element58.useCallback)(
    (newValue) => {
      onChangeCallback(newValue);
      if (newValue) {
        const parsedDate = parseDate2(newValue);
        if (parsedDate) {
          setCalendarMonth(parsedDate);
        }
      }
      setSelectedPresetId(null);
      setIsTouched(true);
    },
    [onChangeCallback]
  );
  let displayLabel = label;
  if (isValid2?.required && !markWhenOptional) {
    displayLabel = `${label} (${(0, import_i18n11.__)("Required")})`;
  } else if (!isValid2?.required && markWhenOptional) {
    displayLabel = `${label} (${(0, import_i18n11.__)("Optional")})`;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
    ValidatedDateControl,
    {
      field,
      validity,
      inputRefs: validityTargetRef,
      isTouched,
      setIsTouched,
      children: /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
        import_components14.BaseControl,
        {
          id,
          className: "dataviews-controls__date",
          label: displayLabel,
          help: description,
          hideLabelFromVision,
          children: /* @__PURE__ */ (0, import_jsx_runtime67.jsxs)(Stack, { direction: "column", gap: "lg", children: [
            /* @__PURE__ */ (0, import_jsx_runtime67.jsxs)(
              Stack,
              {
                direction: "row",
                gap: "sm",
                wrap: "wrap",
                justify: "flex-start",
                children: [
                  DATE_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
                      import_components14.Button,
                      {
                        className: "dataviews-controls__date-preset",
                        variant: "tertiary",
                        isPressed: isSelected,
                        size: "small",
                        disabled: disabled2,
                        accessibleWhenDisabled: true,
                        onClick: () => handlePresetClick(preset),
                        children: preset.label
                      },
                      preset.id
                    );
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
                    import_components14.Button,
                    {
                      className: "dataviews-controls__date-preset",
                      variant: "tertiary",
                      isPressed: !selectedPresetId,
                      size: "small",
                      disabled: !!selectedPresetId || disabled2,
                      accessibleWhenDisabled: true,
                      children: (0, import_i18n11.__)("Custom")
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
              import_components14.__experimentalInputControl,
              {
                ref: validityTargetRef,
                type: "date",
                label: (0, import_i18n11.__)("Date"),
                hideLabelFromVision: true,
                value,
                onChange: handleManualDateChange,
                required: !!field.isValid?.required,
                disabled: disabled2,
                min: minConstraint,
                max: maxConstraint
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
              Calendar,
              {
                style: { width: "100%" },
                value: value ? parseDate2(value) : null,
                onValueChange: onSelectDate,
                month: calendarMonth,
                onMonthChange: setCalendarMonth,
                weekStartsOn,
                disabled: disabled2 || disabledMatchers,
                disableNavigation: disabled2
              }
            )
          ] })
        }
      )
    }
  );
}
function CalendarDateRangeControl({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const {
    id,
    label,
    description,
    getValue,
    setValue,
    isValid: isValid2,
    format: fieldFormat
  } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  let value;
  const fieldValue = getValue({ item: data });
  if (Array.isArray(fieldValue) && fieldValue.length === 2 && fieldValue.every((date) => typeof date === "string")) {
    value = fieldValue;
  }
  const weekStartsOn = fieldFormat.weekStartsOn ?? (0, import_date5.getSettings)().l10n.startOfWeek;
  const { minConstraint, maxConstraint, disabledMatchers } = useDisabledDateMatchers(isValid2, parseDate2);
  const onChangeCallback = (0, import_element58.useCallback)(
    (newValue) => {
      onChange(
        setValue({
          item: data,
          value: newValue
        })
      );
    },
    [data, onChange, setValue]
  );
  const [selectedPresetId, setSelectedPresetId] = (0, import_element58.useState)(
    null
  );
  const selectedRange = (0, import_element58.useMemo)(() => {
    if (!value) {
      return null;
    }
    const [from, to] = value;
    return {
      from: parseDate2(from) || void 0,
      to: parseDate2(to) || void 0
    };
  }, [value]);
  const [calendarMonth, setCalendarMonth] = (0, import_element58.useState)(() => {
    return selectedRange?.from || /* @__PURE__ */ new Date();
  });
  const [fromValue, toValue] = value ?? [];
  (0, import_element58.useEffect)(() => {
    setCalendarMonth((currentMonth) => {
      const from = parseDate2(fromValue);
      const to = parseDate2(toValue);
      const targetMonth = from ?? to;
      const isRangeVisible = from && to ? areIntervalsOverlapping(
        { start: from, end: to },
        {
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth)
        },
        { inclusive: true }
      ) : [from, to].some(
        (date) => date && isSameMonth(date, currentMonth)
      );
      return targetMonth && !isRangeVisible ? targetMonth : currentMonth;
    });
  }, [fromValue, toValue]);
  const [isTouched, setIsTouched] = (0, import_element58.useState)(false);
  const fromInputRef = (0, import_element58.useRef)(null);
  const toInputRef = (0, import_element58.useRef)(null);
  const updateDateRange = (0, import_element58.useCallback)(
    (fromDate, toDate2) => {
      if (!fromDate && !toDate2) {
        onChangeCallback(void 0);
        return;
      }
      onChangeCallback([
        formatDate(fromDate),
        formatDate(toDate2)
      ]);
    },
    [onChangeCallback]
  );
  const onSelectCalendarRange = (0, import_element58.useCallback)(
    (newRange) => {
      updateDateRange(newRange?.from, newRange?.to);
      setSelectedPresetId(null);
      setIsTouched(true);
    },
    [updateDateRange]
  );
  const handlePresetClick = (0, import_element58.useCallback)(
    (preset) => {
      const [startDate, endDate] = preset.getValue();
      setCalendarMonth(startDate);
      updateDateRange(startDate, endDate);
      setSelectedPresetId(preset.id);
      setIsTouched(true);
    },
    [updateDateRange]
  );
  const handleManualDateChange = (0, import_element58.useCallback)(
    (fromOrTo, newValue) => {
      const [currentFrom, currentTo] = value || [
        void 0,
        void 0
      ];
      const updatedFrom = fromOrTo === "from" ? newValue : currentFrom;
      const updatedTo = fromOrTo === "to" ? newValue : currentTo;
      updateDateRange(updatedFrom, updatedTo);
      if (newValue) {
        const parsedDate = parseDate2(newValue);
        if (parsedDate) {
          setCalendarMonth(parsedDate);
        }
      }
      setSelectedPresetId(null);
      setIsTouched(true);
    },
    [value, updateDateRange]
  );
  let displayLabel = label;
  if (field.isValid?.required && !markWhenOptional) {
    displayLabel = `${label} (${(0, import_i18n11.__)("Required")})`;
  } else if (!field.isValid?.required && markWhenOptional) {
    displayLabel = `${label} (${(0, import_i18n11.__)("Optional")})`;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
    ValidatedDateControl,
    {
      field,
      validity,
      inputRefs: [fromInputRef, toInputRef],
      isTouched,
      setIsTouched,
      children: /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
        import_components14.BaseControl,
        {
          id,
          className: "dataviews-controls__date",
          label: displayLabel,
          help: description,
          hideLabelFromVision,
          children: /* @__PURE__ */ (0, import_jsx_runtime67.jsxs)(Stack, { direction: "column", gap: "lg", children: [
            /* @__PURE__ */ (0, import_jsx_runtime67.jsxs)(
              Stack,
              {
                direction: "row",
                gap: "sm",
                wrap: "wrap",
                justify: "flex-start",
                children: [
                  DATE_RANGE_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
                      import_components14.Button,
                      {
                        className: "dataviews-controls__date-preset",
                        variant: "tertiary",
                        isPressed: isSelected,
                        size: "small",
                        disabled: disabled2,
                        accessibleWhenDisabled: true,
                        onClick: () => handlePresetClick(preset),
                        children: preset.label
                      },
                      preset.id
                    );
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
                    import_components14.Button,
                    {
                      className: "dataviews-controls__date-preset",
                      variant: "tertiary",
                      isPressed: !selectedPresetId,
                      size: "small",
                      accessibleWhenDisabled: true,
                      disabled: !!selectedPresetId || disabled2,
                      children: (0, import_i18n11.__)("Custom")
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime67.jsxs)(
              Stack,
              {
                direction: "row",
                gap: "sm",
                justify: "space-between",
                className: "dataviews-controls__date-range-inputs",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
                    import_components14.__experimentalInputControl,
                    {
                      ref: fromInputRef,
                      type: "date",
                      label: (0, import_i18n11.__)("From"),
                      hideLabelFromVision: true,
                      value: value?.[0],
                      onChange: (newValue) => handleManualDateChange("from", newValue),
                      required: !!field.isValid?.required,
                      disabled: disabled2,
                      min: minConstraint,
                      max: maxConstraint
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
                    import_components14.__experimentalInputControl,
                    {
                      ref: toInputRef,
                      type: "date",
                      label: (0, import_i18n11.__)("To"),
                      hideLabelFromVision: true,
                      value: value?.[1],
                      onChange: (newValue) => handleManualDateChange("to", newValue),
                      required: !!field.isValid?.required,
                      disabled: disabled2,
                      min: minConstraint,
                      max: maxConstraint
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
              RangeCalendar,
              {
                style: { width: "100%" },
                value: selectedRange,
                onValueChange: onSelectCalendarRange,
                month: calendarMonth,
                onMonthChange: setCalendarMonth,
                weekStartsOn,
                disabled: disabled2 || disabledMatchers
              }
            )
          ] })
        }
      )
    }
  );
}
function DateControl({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  operator,
  validity
}) {
  if (operator === OPERATOR_IN_THE_PAST || operator === OPERATOR_OVER) {
    return /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
      RelativeDateControl,
      {
        className: "dataviews-controls__date",
        data,
        field,
        onChange,
        hideLabelFromVision,
        operator
      }
    );
  }
  if (operator === OPERATOR_BETWEEN) {
    return /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
      CalendarDateRangeControl,
      {
        data,
        field,
        onChange,
        hideLabelFromVision,
        markWhenOptional,
        validity
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(
    CalendarDateControl,
    {
      data,
      field,
      onChange,
      hideLabelFromVision,
      markWhenOptional,
      validity
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/select.mjs
var import_components15 = __toESM(require_components(), 1);
var import_element59 = __toESM(require_element(), 1);
var import_jsx_runtime68 = __toESM(require_jsx_runtime(), 1);
function Select2({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const { type, label, description, getValue, setValue, isValid: isValid2 } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  const isMultiple = type === "array";
  const value = getValue({ item: data }) ?? (isMultiple ? [] : "");
  const onChangeControl = (0, import_element59.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime68.jsx)(import_components15.Spinner, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime68.jsx)(
    ValidatedSelectControl,
    {
      required: !!field.isValid?.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      value,
      help: description,
      options: elements,
      onChange: onChangeControl,
      hideLabelFromVision,
      multiple: isMultiple,
      disabled: disabled2
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/adaptive-select.mjs
var import_jsx_runtime69 = __toESM(require_jsx_runtime(), 1);
var ELEMENTS_THRESHOLD = 10;
function AdaptiveSelect(props) {
  const { field } = props;
  const { elements } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  if (elements.length >= ELEMENTS_THRESHOLD) {
    return /* @__PURE__ */ (0, import_jsx_runtime69.jsx)(Combobox, { ...props });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime69.jsx)(Select2, { ...props });
}

// packages/dataviews/build-module/components/dataform-controls/utils/validated-input.mjs
var import_element60 = __toESM(require_element(), 1);
var import_jsx_runtime70 = __toESM(require_jsx_runtime(), 1);
function ValidatedText({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  type,
  prefix,
  suffix,
  validity
}) {
  const { label, placeholder, description, getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data });
  const disabled2 = field.isDisabled({ item: data, field });
  const onValueChangeControl = (0, import_element60.useCallback)(
    (newValue) => onChange(
      setValue({
        item: data,
        value: newValue
      })
    ),
    [data, setValue, onChange]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime70.jsx)(
    ValidatedInputControl,
    {
      required: !!isValid2.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      placeholder,
      value: value ?? "",
      description: typeof description === "string" ? description : void 0,
      details: typeof description === "string" ? void 0 : description,
      onValueChange: onValueChangeControl,
      hideLabelFromVision,
      type,
      prefix,
      suffix,
      disabled: disabled2,
      pattern: isValid2.pattern ? isValid2.pattern.constraint : void 0,
      minLength: isValid2.minLength ? isValid2.minLength.constraint : void 0,
      maxLength: isValid2.maxLength ? isValid2.maxLength.constraint : void 0
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/email.mjs
var import_jsx_runtime71 = __toESM(require_jsx_runtime(), 1);
function Email({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime71.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        markWhenOptional,
        validity,
        type: "email",
        prefix: /* @__PURE__ */ (0, import_jsx_runtime71.jsx)(InputLayout3.Slot, { padding: "minimal", children: /* @__PURE__ */ (0, import_jsx_runtime71.jsx)(Icon, { icon: envelope_default }) })
      }
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/telephone.mjs
var import_jsx_runtime72 = __toESM(require_jsx_runtime(), 1);
function Telephone({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        markWhenOptional,
        validity,
        type: "tel",
        prefix: /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(InputLayout3.Slot, { padding: "minimal", children: /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(Icon, { icon: mobile_default }) })
      }
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/url.mjs
var import_jsx_runtime73 = __toESM(require_jsx_runtime(), 1);
function Url({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime73.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        markWhenOptional,
        validity,
        type: "url",
        prefix: /* @__PURE__ */ (0, import_jsx_runtime73.jsx)(InputLayout3.Slot, { padding: "minimal", children: /* @__PURE__ */ (0, import_jsx_runtime73.jsx)(Icon, { icon: link_default }) })
      }
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/utils/validated-number.mjs
var import_components16 = __toESM(require_components(), 1);
var import_element61 = __toESM(require_element(), 1);
var import_i18n12 = __toESM(require_i18n(), 1);
var import_jsx_runtime74 = __toESM(require_jsx_runtime(), 1);
function toNumberOrEmpty(value) {
  if (value === "" || value === void 0) {
    return "";
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}
function BetweenControls({
  value,
  onChange,
  hideLabelFromVision,
  step
}) {
  const [min2 = "", max2 = ""] = value;
  const onChangeMin = (0, import_element61.useCallback)(
    (newValue) => onChange([toNumberOrEmpty(newValue), max2]),
    [onChange, max2]
  );
  const onChangeMax = (0, import_element61.useCallback)(
    (newValue) => onChange([min2, toNumberOrEmpty(newValue)]),
    [onChange, min2]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime74.jsx)(
    import_components16.BaseControl,
    {
      help: (0, import_i18n12.__)("The max. value must be greater than the min. value."),
      children: /* @__PURE__ */ (0, import_jsx_runtime74.jsxs)(import_components16.Flex, { direction: "row", gap: 4, children: [
        /* @__PURE__ */ (0, import_jsx_runtime74.jsx)(
          import_components16.__experimentalNumberControl,
          {
            label: (0, import_i18n12.__)("Min."),
            value: min2,
            max: max2 ? Number(max2) - step : void 0,
            onChange: onChangeMin,
            hideLabelFromVision,
            step
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime74.jsx)(
          import_components16.__experimentalNumberControl,
          {
            label: (0, import_i18n12.__)("Max."),
            value: max2,
            min: min2 ? Number(min2) + step : void 0,
            onChange: onChangeMax,
            hideLabelFromVision,
            step
          }
        )
      ] })
    }
  );
}
function ValidatedNumber({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  operator,
  validity
}) {
  const decimals = field.format?.decimals ?? 0;
  const step = Math.pow(10, Math.abs(decimals) * -1);
  const { label, description, getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data }) ?? "";
  const disabled2 = field.isDisabled({ item: data, field });
  const onChangeControl = (0, import_element61.useCallback)(
    (newValue) => {
      onChange(
        setValue({
          item: data,
          // Do not convert an empty string or undefined to a number,
          // otherwise there's a mismatch between the UI control (empty)
          // and the data relied by onChange (0).
          value: ["", void 0].includes(newValue) ? void 0 : Number(newValue)
        })
      );
    },
    [data, onChange, setValue]
  );
  const onChangeBetweenControls = (0, import_element61.useCallback)(
    (newValue) => {
      onChange(
        setValue({
          item: data,
          value: newValue
        })
      );
    },
    [data, onChange, setValue]
  );
  if (operator === OPERATOR_BETWEEN) {
    let valueBetween = ["", ""];
    if (Array.isArray(value) && value.length === 2 && value.every(
      (element) => typeof element === "number" || element === ""
    )) {
      valueBetween = value;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime74.jsx)(
      BetweenControls,
      {
        value: valueBetween,
        onChange: onChangeBetweenControls,
        hideLabelFromVision,
        step
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime74.jsx)(
    ValidatedNumberControl,
    {
      required: !!isValid2.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      help: description,
      value,
      onChange: onChangeControl,
      hideLabelFromVision,
      step,
      min: typeof isValid2.min?.constraint === "number" ? isValid2.min.constraint : void 0,
      max: typeof isValid2.max?.constraint === "number" ? isValid2.max.constraint : void 0,
      disabled: disabled2
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/integer.mjs
var import_jsx_runtime75 = __toESM(require_jsx_runtime(), 1);
function Integer(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime75.jsx)(ValidatedNumber, { ...props });
}

// packages/dataviews/build-module/components/dataform-controls/number.mjs
var import_jsx_runtime76 = __toESM(require_jsx_runtime(), 1);
function Number2(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime76.jsx)(ValidatedNumber, { ...props });
}

// packages/dataviews/build-module/components/dataform-controls/radio.mjs
var import_components17 = __toESM(require_components(), 1);
var import_element62 = __toESM(require_element(), 1);
var import_jsx_runtime77 = __toESM(require_jsx_runtime(), 1);
function Radio({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const { label, description, getValue, setValue, isValid: isValid2 } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  const value = getValue({ item: data });
  const onChangeControl = (0, import_element62.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(import_components17.Spinner, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
    ValidatedRadioControl,
    {
      required: !!field.isValid?.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      help: description,
      onChange: onChangeControl,
      options: elements,
      selected: value,
      hideLabelFromVision,
      disabled: disabled2
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/text.mjs
var import_element63 = __toESM(require_element(), 1);
var import_jsx_runtime78 = __toESM(require_jsx_runtime(), 1);
function Text3({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  config,
  validity
}) {
  const { prefix, suffix } = config || {};
  return /* @__PURE__ */ (0, import_jsx_runtime78.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        markWhenOptional,
        validity,
        prefix: prefix ? (0, import_element63.createElement)(prefix) : void 0,
        suffix: suffix ? (0, import_element63.createElement)(suffix) : void 0
      }
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/time.mjs
var import_components18 = __toESM(require_components(), 1);
var import_element64 = __toESM(require_element(), 1);
var import_i18n13 = __toESM(require_i18n(), 1);
var import_jsx_runtime79 = __toESM(require_jsx_runtime(), 1);
function getStep(timeFormat, values) {
  const tokens = (timeFormat ?? "").replace(/\\./g, "");
  const hasSeconds = tokens.includes("s") || values.some((value) => (parseTime2(value) ?? 0) % 60 !== 0);
  return hasSeconds ? 1 : void 0;
}
function toInputValue(value) {
  const seconds = parseTime2(value);
  if (seconds === null) {
    return "";
  }
  const parts = [
    Math.floor(seconds / 3600),
    Math.floor(seconds % 3600 / 60)
  ];
  if (seconds % 60 !== 0) {
    parts.push(seconds % 60);
  }
  return parts.map((part) => String(part).padStart(2, "0")).join(":");
}
function BetweenControls2({
  value,
  onChange,
  hideLabelFromVision,
  disabled: disabled2,
  step,
  min: min2,
  max: max2
}) {
  const [from = "", to = ""] = value;
  const onChangeFrom = (0, import_element64.useCallback)(
    (newValue) => onChange([newValue ?? "", to]),
    [onChange, to]
  );
  const onChangeTo = (0, import_element64.useCallback)(
    (newValue) => onChange([from, newValue ?? ""]),
    [onChange, from]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime79.jsx)(
    import_components18.BaseControl,
    {
      help: (0, import_i18n13.__)("The end time must be later than the start time."),
      children: /* @__PURE__ */ (0, import_jsx_runtime79.jsxs)(Stack, { direction: "row", gap: "sm", justify: "space-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime79.jsx)(
          ValidatedInputControl,
          {
            type: "time",
            label: (0, import_i18n13.__)("From"),
            value: from,
            onValueChange: onChangeFrom,
            hideLabelFromVision,
            disabled: disabled2,
            step,
            min: min2,
            max: to || max2
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime79.jsx)(
          ValidatedInputControl,
          {
            type: "time",
            label: (0, import_i18n13.__)("To"),
            value: to,
            onValueChange: onChangeTo,
            hideLabelFromVision,
            disabled: disabled2,
            step,
            min: from || min2,
            max: max2
          }
        )
      ] })
    }
  );
}
function Time({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  operator,
  validity
}) {
  const { label, placeholder, description, getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data });
  const disabled2 = field.isDisabled({ item: data, field });
  const timeFormat = field.format?.time;
  const min2 = typeof isValid2.min?.constraint === "string" ? isValid2.min.constraint : void 0;
  const max2 = typeof isValid2.max?.constraint === "string" ? isValid2.max.constraint : void 0;
  const onChangeControl = (0, import_element64.useCallback)(
    (newValue) => onChange(
      setValue({
        item: data,
        value: newValue === "" ? void 0 : newValue
      })
    ),
    [data, onChange, setValue]
  );
  const onChangeBetweenControls = (0, import_element64.useCallback)(
    ([from, to]) => onChange(
      setValue({
        item: data,
        // An unfilled bound is stored as `undefined`, which the
        // `between` operator reads as "do not apply the filter".
        value: [from || void 0, to || void 0]
      })
    ),
    [data, onChange, setValue]
  );
  if (operator === OPERATOR_BETWEEN) {
    let valueBetween = ["", ""];
    if (Array.isArray(value) && value.length === 2) {
      valueBetween = [
        toInputValue(value[0]),
        toInputValue(value[1])
      ];
    }
    return /* @__PURE__ */ (0, import_jsx_runtime79.jsx)(
      BetweenControls2,
      {
        value: valueBetween,
        onChange: onChangeBetweenControls,
        hideLabelFromVision,
        disabled: disabled2,
        step: getStep(timeFormat, valueBetween),
        min: min2,
        max: max2
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime79.jsx)(
    ValidatedInputControl,
    {
      required: !!isValid2.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      type: "time",
      label,
      placeholder,
      description: typeof description === "string" ? description : void 0,
      details: typeof description === "string" ? void 0 : description,
      value: toInputValue(value),
      onValueChange: onChangeControl,
      hideLabelFromVision,
      disabled: disabled2,
      step: getStep(timeFormat, [value]),
      min: min2,
      max: max2
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/toggle.mjs
var import_element65 = __toESM(require_element(), 1);
var import_jsx_runtime80 = __toESM(require_jsx_runtime(), 1);
function Toggle({
  field,
  onChange,
  data,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const { label, description, getValue, setValue, isValid: isValid2 } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  const onChangeControl = (0, import_element65.useCallback)(() => {
    onChange(
      setValue({ item: data, value: !getValue({ item: data }) })
    );
  }, [onChange, setValue, data, getValue]);
  return /* @__PURE__ */ (0, import_jsx_runtime80.jsx)(
    ValidatedToggleControl,
    {
      required: !!isValid2.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      hidden: hideLabelFromVision,
      label,
      help: description,
      checked: getValue({ item: data }),
      onChange: onChangeControl,
      disabled: disabled2
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/textarea.mjs
var import_components19 = __toESM(require_components(), 1);
var import_element66 = __toESM(require_element(), 1);
var import_jsx_runtime81 = __toESM(require_jsx_runtime(), 1);
var { ValidatedTextareaControl } = unlock(import_components19.privateApis);
function Textarea({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  config,
  validity
}) {
  const { rows = 4 } = config || {};
  const disabled2 = field.isDisabled({ item: data, field });
  const { label, placeholder, description, setValue, isValid: isValid2 } = field;
  const value = field.getValue({ item: data });
  const onChangeControl = (0, import_element66.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime81.jsx)(
    ValidatedTextareaControl,
    {
      required: !!isValid2.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      placeholder,
      value: value ?? "",
      help: description,
      onChange: onChangeControl,
      rows,
      disabled: disabled2,
      minLength: isValid2.minLength ? isValid2.minLength.constraint : void 0,
      maxLength: isValid2.maxLength ? isValid2.maxLength.constraint : void 0,
      hideLabelFromVision
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/toggle-group.mjs
var import_components20 = __toESM(require_components(), 1);
var import_element67 = __toESM(require_element(), 1);
var import_jsx_runtime82 = __toESM(require_jsx_runtime(), 1);
function ToggleGroup({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const { getValue, setValue, isValid: isValid2 } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  const value = getValue({ item: data });
  const onChangeControl = (0, import_element67.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime82.jsx)(import_components20.Spinner, {});
  }
  if (elements.length === 0) {
    return null;
  }
  const selectedOption = elements.find((el) => el.value === value);
  return /* @__PURE__ */ (0, import_jsx_runtime82.jsx)(
    ValidatedToggleGroupControl,
    {
      required: !!field.isValid?.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      isBlock: true,
      label: field.label,
      help: selectedOption?.description || field.description,
      onChange: onChangeControl,
      value,
      hideLabelFromVision,
      children: elements.map((el) => /* @__PURE__ */ (0, import_jsx_runtime82.jsx)(
        import_components20.__experimentalToggleGroupControlOption,
        {
          label: el.label,
          value: el.value,
          disabled: disabled2
        },
        el.value
      ))
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/array.mjs
var import_components21 = __toESM(require_components(), 1);
var import_element68 = __toESM(require_element(), 1);
var import_jsx_runtime83 = __toESM(require_jsx_runtime(), 1);
function ArrayControl({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const { label, placeholder, description, getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data });
  const disabled2 = field.isDisabled({ item: data, field });
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  const arrayValueAsElements = (0, import_element68.useMemo)(
    () => Array.isArray(value) ? value.map((token) => {
      const element = elements?.find(
        (suggestion) => suggestion.value === token
      );
      return element || { value: token, label: token };
    }) : [],
    [value, elements]
  );
  const onChangeControl = (0, import_element68.useCallback)(
    (tokens) => {
      const valueTokens = tokens.map((token) => {
        if (typeof token === "object" && "value" in token) {
          return token.value;
        }
        return token;
      });
      onChange(setValue({ item: data, value: valueTokens }));
    },
    [onChange, setValue, data]
  );
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime83.jsx)(import_components21.Spinner, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime83.jsx)(
    ValidatedFormTokenField,
    {
      required: !!isValid2?.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      label: hideLabelFromVision ? void 0 : label,
      value: arrayValueAsElements,
      onChange: onChangeControl,
      placeholder,
      suggestions: elements?.map((element) => element.value),
      disabled: disabled2,
      __experimentalValidateInput: (token) => {
        if (field.isValid?.elements && elements) {
          return elements.some(
            (element) => element.value === token || element.label === token
          );
        }
        return true;
      },
      __experimentalExpandOnFocus: elements && elements.length > 0,
      help: description ?? (field.isValid?.elements ? "" : void 0),
      displayTransform: (token) => {
        if (typeof token === "object" && "label" in token) {
          return token.label;
        }
        if (typeof token === "string" && elements) {
          const element = elements.find(
            (el) => el.value === token
          );
          return element?.label || token;
        }
        return token;
      },
      __experimentalRenderItem: ({ item }) => {
        if (typeof item === "string" && elements) {
          const element = elements.find(
            (el) => el.value === item
          );
          return /* @__PURE__ */ (0, import_jsx_runtime83.jsx)("span", { children: element?.label || item });
        }
        return /* @__PURE__ */ (0, import_jsx_runtime83.jsx)("span", { children: item });
      }
    }
  );
}

// node_modules/colord/index.mjs
var r2 = { grad: 0.9, turn: 360, rad: 360 / (2 * Math.PI) };
var t = function(r3) {
  return "string" == typeof r3 ? r3.length > 0 : "number" == typeof r3;
};
var n = function(r3, t2, n2) {
  return void 0 === t2 && (t2 = 0), void 0 === n2 && (n2 = Math.pow(10, t2)), Math.round(n2 * r3) / n2 + 0;
};
var e = function(r3, t2, n2) {
  return void 0 === t2 && (t2 = 0), void 0 === n2 && (n2 = 1), r3 > n2 ? n2 : r3 > t2 ? r3 : t2;
};
var u = function(r3) {
  return (r3 = isFinite(r3) ? r3 % 360 : 0) > 0 ? r3 : r3 + 360;
};
var a = function(r3) {
  return { r: e(r3.r, 0, 255), g: e(r3.g, 0, 255), b: e(r3.b, 0, 255), a: e(r3.a) };
};
var o = function(r3) {
  return { r: n(r3.r), g: n(r3.g), b: n(r3.b), a: n(r3.a, 3) };
};
var i = /^#([0-9a-f]{3,8})$/i;
var s = function(r3) {
  var t2 = r3.toString(16);
  return t2.length < 2 ? "0" + t2 : t2;
};
var h = function(r3) {
  var t2 = r3.r, n2 = r3.g, e2 = r3.b, u2 = r3.a, a2 = Math.max(t2, n2, e2), o2 = a2 - Math.min(t2, n2, e2), i2 = o2 ? a2 === t2 ? (n2 - e2) / o2 : a2 === n2 ? 2 + (e2 - t2) / o2 : 4 + (t2 - n2) / o2 : 0;
  return { h: 60 * (i2 < 0 ? i2 + 6 : i2), s: a2 ? o2 / a2 * 100 : 0, v: a2 / 255 * 100, a: u2 };
};
var b = function(r3) {
  var t2 = r3.h, n2 = r3.s, e2 = r3.v, u2 = r3.a;
  t2 = t2 / 360 * 6, n2 /= 100, e2 /= 100;
  var a2 = Math.floor(t2), o2 = e2 * (1 - n2), i2 = e2 * (1 - (t2 - a2) * n2), s2 = e2 * (1 - (1 - t2 + a2) * n2), h2 = a2 % 6;
  return { r: 255 * [e2, i2, o2, o2, s2, e2][h2], g: 255 * [s2, e2, e2, i2, o2, o2][h2], b: 255 * [o2, o2, s2, e2, e2, i2][h2], a: u2 };
};
var g = function(r3) {
  return { h: u(r3.h), s: e(r3.s, 0, 100), l: e(r3.l, 0, 100), a: e(r3.a) };
};
var d = function(r3) {
  return { h: n(r3.h), s: n(r3.s), l: n(r3.l), a: n(r3.a, 3) };
};
var f = function(r3) {
  return b((n2 = (t2 = r3).s, { h: t2.h, s: (n2 *= ((e2 = t2.l) < 50 ? e2 : 100 - e2) / 100) > 0 ? 2 * n2 / (e2 + n2) * 100 : 0, v: e2 + n2, a: t2.a }));
  var t2, n2, e2;
};
var c = function(r3) {
  return { h: (t2 = h(r3)).h, s: (u2 = (200 - (n2 = t2.s)) * (e2 = t2.v) / 100) > 0 && u2 < 200 ? n2 * e2 / 100 / (u2 <= 100 ? u2 : 200 - u2) * 100 : 0, l: u2 / 2, a: t2.a };
  var t2, n2, e2, u2;
};
var l = /^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var p = /^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var v = /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var m = /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;
var y = { string: [[function(r3) {
  var t2 = i.exec(r3);
  return t2 ? (r3 = t2[1]).length <= 4 ? { r: parseInt(r3[0] + r3[0], 16), g: parseInt(r3[1] + r3[1], 16), b: parseInt(r3[2] + r3[2], 16), a: 4 === r3.length ? n(parseInt(r3[3] + r3[3], 16) / 255, 2) : 1 } : 6 === r3.length || 8 === r3.length ? { r: parseInt(r3.substr(0, 2), 16), g: parseInt(r3.substr(2, 2), 16), b: parseInt(r3.substr(4, 2), 16), a: 8 === r3.length ? n(parseInt(r3.substr(6, 2), 16) / 255, 2) : 1 } : null : null;
}, "hex"], [function(r3) {
  var t2 = v.exec(r3) || m.exec(r3);
  return t2 ? t2[2] !== t2[4] || t2[4] !== t2[6] ? null : a({ r: Number(t2[1]) / (t2[2] ? 100 / 255 : 1), g: Number(t2[3]) / (t2[4] ? 100 / 255 : 1), b: Number(t2[5]) / (t2[6] ? 100 / 255 : 1), a: void 0 === t2[7] ? 1 : Number(t2[7]) / (t2[8] ? 100 : 1) }) : null;
}, "rgb"], [function(t2) {
  var n2 = l.exec(t2) || p.exec(t2);
  if (!n2) return null;
  var e2, u2, a2 = g({ h: (e2 = n2[1], u2 = n2[2], void 0 === u2 && (u2 = "deg"), Number(e2) * (r2[u2] || 1)), s: Number(n2[3]), l: Number(n2[4]), a: void 0 === n2[5] ? 1 : Number(n2[5]) / (n2[6] ? 100 : 1) });
  return f(a2);
}, "hsl"]], object: [[function(r3) {
  var n2 = r3.r, e2 = r3.g, u2 = r3.b, o2 = r3.a, i2 = void 0 === o2 ? 1 : o2;
  return t(n2) && t(e2) && t(u2) ? a({ r: Number(n2), g: Number(e2), b: Number(u2), a: Number(i2) }) : null;
}, "rgb"], [function(r3) {
  var n2 = r3.h, e2 = r3.s, u2 = r3.l, a2 = r3.a, o2 = void 0 === a2 ? 1 : a2;
  if (!t(n2) || !t(e2) || !t(u2)) return null;
  var i2 = g({ h: Number(n2), s: Number(e2), l: Number(u2), a: Number(o2) });
  return f(i2);
}, "hsl"], [function(r3) {
  var n2 = r3.h, a2 = r3.s, o2 = r3.v, i2 = r3.a, s2 = void 0 === i2 ? 1 : i2;
  if (!t(n2) || !t(a2) || !t(o2)) return null;
  var h2 = (function(r4) {
    return { h: u(r4.h), s: e(r4.s, 0, 100), v: e(r4.v, 0, 100), a: e(r4.a) };
  })({ h: Number(n2), s: Number(a2), v: Number(o2), a: Number(s2) });
  return b(h2);
}, "hsv"]] };
var N = function(r3, t2) {
  for (var n2 = 0; n2 < t2.length; n2++) {
    var e2 = t2[n2][0](r3);
    if (e2) return [e2, t2[n2][1]];
  }
  return [null, void 0];
};
var x = function(r3) {
  return "string" == typeof r3 ? N(r3.trim(), y.string) : "object" == typeof r3 && null !== r3 ? N(r3, y.object) : [null, void 0];
};
var M = function(r3, t2) {
  var n2 = c(r3);
  return { h: n2.h, s: e(n2.s + 100 * t2, 0, 100), l: n2.l, a: n2.a };
};
var H = function(r3) {
  return (299 * r3.r + 587 * r3.g + 114 * r3.b) / 1e3 / 255;
};
var $ = function(r3, t2) {
  var n2 = c(r3);
  return { h: n2.h, s: n2.s, l: e(n2.l + 100 * t2, 0, 100), a: n2.a };
};
var j = (function() {
  function r3(r4) {
    this.parsed = x(r4)[0], this.rgba = this.parsed || { r: 0, g: 0, b: 0, a: 1 };
  }
  return r3.prototype.isValid = function() {
    return null !== this.parsed;
  }, r3.prototype.brightness = function() {
    return n(H(this.rgba), 2);
  }, r3.prototype.isDark = function() {
    return H(this.rgba) < 0.5;
  }, r3.prototype.isLight = function() {
    return H(this.rgba) >= 0.5;
  }, r3.prototype.toHex = function() {
    return r4 = o(this.rgba), t2 = r4.r, e2 = r4.g, u2 = r4.b, i2 = (a2 = r4.a) < 1 ? s(n(255 * a2)) : "", "#" + s(t2) + s(e2) + s(u2) + i2;
    var r4, t2, e2, u2, a2, i2;
  }, r3.prototype.toRgb = function() {
    return o(this.rgba);
  }, r3.prototype.toRgbString = function() {
    return r4 = o(this.rgba), t2 = r4.r, n2 = r4.g, e2 = r4.b, (u2 = r4.a) < 1 ? "rgba(" + t2 + ", " + n2 + ", " + e2 + ", " + u2 + ")" : "rgb(" + t2 + ", " + n2 + ", " + e2 + ")";
    var r4, t2, n2, e2, u2;
  }, r3.prototype.toHsl = function() {
    return d(c(this.rgba));
  }, r3.prototype.toHslString = function() {
    return r4 = d(c(this.rgba)), t2 = r4.h, n2 = r4.s, e2 = r4.l, (u2 = r4.a) < 1 ? "hsla(" + t2 + ", " + n2 + "%, " + e2 + "%, " + u2 + ")" : "hsl(" + t2 + ", " + n2 + "%, " + e2 + "%)";
    var r4, t2, n2, e2, u2;
  }, r3.prototype.toHsv = function() {
    return r4 = h(this.rgba), { h: n(r4.h), s: n(r4.s), v: n(r4.v), a: n(r4.a, 3) };
    var r4;
  }, r3.prototype.invert = function() {
    return w({ r: 255 - (r4 = this.rgba).r, g: 255 - r4.g, b: 255 - r4.b, a: r4.a });
    var r4;
  }, r3.prototype.saturate = function(r4) {
    return void 0 === r4 && (r4 = 0.1), w(M(this.rgba, r4));
  }, r3.prototype.desaturate = function(r4) {
    return void 0 === r4 && (r4 = 0.1), w(M(this.rgba, -r4));
  }, r3.prototype.grayscale = function() {
    return w(M(this.rgba, -1));
  }, r3.prototype.lighten = function(r4) {
    return void 0 === r4 && (r4 = 0.1), w($(this.rgba, r4));
  }, r3.prototype.darken = function(r4) {
    return void 0 === r4 && (r4 = 0.1), w($(this.rgba, -r4));
  }, r3.prototype.rotate = function(r4) {
    return void 0 === r4 && (r4 = 15), this.hue(this.hue() + r4);
  }, r3.prototype.alpha = function(r4) {
    return "number" == typeof r4 ? w({ r: (t2 = this.rgba).r, g: t2.g, b: t2.b, a: r4 }) : n(this.rgba.a, 3);
    var t2;
  }, r3.prototype.hue = function(r4) {
    var t2 = c(this.rgba);
    return "number" == typeof r4 ? w({ h: r4, s: t2.s, l: t2.l, a: t2.a }) : n(t2.h);
  }, r3.prototype.isEqual = function(r4) {
    return this.toHex() === w(r4).toHex();
  }, r3;
})();
var w = function(r3) {
  return r3 instanceof j ? r3 : new j(r3);
};

// packages/dataviews/build-module/components/dataform-controls/color.mjs
var import_components22 = __toESM(require_components(), 1);
var import_element69 = __toESM(require_element(), 1);
var import_i18n14 = __toESM(require_i18n(), 1);
var import_jsx_runtime84 = __toESM(require_jsx_runtime(), 1);
var ColorPickerDropdown = ({
  color,
  onColorChange,
  disabled: disabled2
}) => {
  const validColor = color && w(color).isValid() ? color : "#ffffff";
  return /* @__PURE__ */ (0, import_jsx_runtime84.jsx)(
    import_components22.Dropdown,
    {
      className: "dataviews-controls__color-picker-dropdown",
      popoverProps: { resize: false },
      renderToggle: ({ onToggle }) => /* @__PURE__ */ (0, import_jsx_runtime84.jsx)(
        import_components22.Button,
        {
          onClick: onToggle,
          "aria-label": (0, import_i18n14.__)("Open color picker"),
          size: "small",
          disabled: disabled2,
          accessibleWhenDisabled: true,
          icon: () => /* @__PURE__ */ (0, import_jsx_runtime84.jsx)(import_components22.ColorIndicator, { colorValue: validColor })
        }
      ),
      renderContent: () => /* @__PURE__ */ (0, import_jsx_runtime84.jsx)(import_components22.__experimentalDropdownContentWrapper, { paddingSize: "none", children: /* @__PURE__ */ (0, import_jsx_runtime84.jsx)(
        import_components22.ColorPicker,
        {
          color: validColor,
          onChange: onColorChange,
          enableAlpha: true
        }
      ) })
    }
  );
};
function Color({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const { label, placeholder, description, setValue, isValid: isValid2 } = field;
  const disabled2 = field.isDisabled({ item: data, field });
  const value = field.getValue({ item: data }) || "";
  const handleColorChange = (0, import_element69.useCallback)(
    (newColor) => {
      onChange(setValue({ item: data, value: newColor }));
    },
    [data, onChange, setValue]
  );
  const handleInputChange = (0, import_element69.useCallback)(
    (newValue) => {
      onChange(setValue({ item: data, value: newValue || "" }));
    },
    [data, onChange, setValue]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime84.jsx)(
    ValidatedInputControl,
    {
      required: !!field.isValid?.required,
      markWhenOptional,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      placeholder,
      value,
      description: typeof description === "string" ? description : void 0,
      details: typeof description === "string" ? void 0 : description,
      onValueChange: handleInputChange,
      hideLabelFromVision,
      type: "text",
      disabled: disabled2,
      prefix: /* @__PURE__ */ (0, import_jsx_runtime84.jsx)(InputLayout3.Slot, { padding: "minimal", children: /* @__PURE__ */ (0, import_jsx_runtime84.jsx)(
        ColorPickerDropdown,
        {
          color: value,
          onColorChange: handleColorChange,
          disabled: disabled2
        }
      ) })
    }
  );
}

// packages/dataviews/build-module/components/dataform-controls/password.mjs
var import_components23 = __toESM(require_components(), 1);
var import_element70 = __toESM(require_element(), 1);
var import_i18n15 = __toESM(require_i18n(), 1);
var import_jsx_runtime85 = __toESM(require_jsx_runtime(), 1);
function Password({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const [isVisible, setIsVisible] = (0, import_element70.useState)(false);
  const disabled2 = field.isDisabled({ item: data, field });
  const toggleVisibility = (0, import_element70.useCallback)(() => {
    setIsVisible((prev) => !prev);
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime85.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        markWhenOptional,
        validity,
        type: isVisible ? "text" : "password",
        suffix: /* @__PURE__ */ (0, import_jsx_runtime85.jsx)(InputLayout3.Slot, { padding: "minimal", children: /* @__PURE__ */ (0, import_jsx_runtime85.jsx)(
          import_components23.Button,
          {
            icon: isVisible ? unseen_default : seen_default,
            onClick: toggleVisibility,
            size: "small",
            label: isVisible ? (0, import_i18n15.__)("Hide password") : (0, import_i18n15.__)("Show password"),
            disabled: disabled2,
            accessibleWhenDisabled: true
          }
        ) })
      }
    }
  );
}

// packages/dataviews/build-module/field-types/utils/has-elements.mjs
function hasElements(field) {
  return Array.isArray(field.elements) && field.elements.length > 0 || typeof field.getElements === "function";
}

// packages/dataviews/build-module/components/dataform-controls/index.mjs
var import_jsx_runtime86 = __toESM(require_jsx_runtime(), 1);
var FORM_CONTROLS = {
  adaptiveSelect: AdaptiveSelect,
  array: ArrayControl,
  checkbox: Checkbox,
  color: Color,
  combobox: Combobox,
  datetime: DateTime,
  date: DateControl,
  email: Email,
  telephone: Telephone,
  url: Url,
  integer: Integer,
  number: Number2,
  password: Password,
  radio: Radio,
  select: Select2,
  text: Text3,
  time: Time,
  toggle: Toggle,
  textarea: Textarea,
  toggleGroup: ToggleGroup
};
function isEditConfig(value) {
  return value && typeof value === "object" && typeof value.control === "string";
}
function createConfiguredControl(config) {
  const { control, ...controlConfig } = config;
  const BaseControlType = getControlByType(control);
  if (BaseControlType === null) {
    return null;
  }
  return function ConfiguredControl(props) {
    return /* @__PURE__ */ (0, import_jsx_runtime86.jsx)(BaseControlType, { ...props, config: controlConfig });
  };
}
function getControl(field, fallback) {
  if (typeof field.Edit === "function") {
    return field.Edit;
  }
  if (typeof field.Edit === "string") {
    return getControlByType(field.Edit);
  }
  if (isEditConfig(field.Edit)) {
    return createConfiguredControl(field.Edit);
  }
  if (hasElements(field) && field.type !== "array") {
    return getControlByType("adaptiveSelect");
  }
  if (fallback === null) {
    return null;
  }
  return getControlByType(fallback);
}
function getControlByType(type) {
  if (Object.keys(FORM_CONTROLS).includes(type)) {
    return FORM_CONTROLS[type];
  }
  return null;
}

// packages/dataviews/build-module/field-types/utils/get-filter-by.mjs
function getFilterBy(field, defaultOperators, validOperators) {
  if (field.filterBy === false) {
    return false;
  }
  const operators = field.filterBy?.operators?.filter(
    (op) => validOperators.includes(op)
  ) ?? defaultOperators;
  if (operators.length === 0) {
    return false;
  }
  return {
    isPrimary: !!field.filterBy?.isPrimary,
    operators
  };
}
var get_filter_by_default = getFilterBy;

// packages/dataviews/build-module/field-types/utils/get-value-from-id.mjs
var getValueFromId = (id) => ({ item }) => {
  const path = id.split(".");
  let value = item;
  for (const segment of path) {
    if (value.hasOwnProperty(segment)) {
      value = value[segment];
    } else {
      value = void 0;
    }
  }
  return value;
};
var get_value_from_id_default = getValueFromId;

// packages/dataviews/build-module/field-types/utils/set-value-from-id.mjs
var setValueFromId = (id) => ({ value }) => {
  const path = id.split(".");
  const result = {};
  let current = result;
  for (const segment of path.slice(0, -1)) {
    current[segment] = {};
    current = current[segment];
  }
  current[path.at(-1)] = value;
  return result;
};
var set_value_from_id_default = setValueFromId;

// packages/dataviews/build-module/field-types/email.mjs
var import_i18n16 = __toESM(require_i18n(), 1);

// packages/dataviews/build-module/field-types/utils/render-from-elements.mjs
function RenderFromElements({
  item,
  field
}) {
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  const value = field.getValue({ item });
  if (isLoading) {
    return value;
  }
  if (elements.length === 0) {
    return value;
  }
  return elements?.find((element) => element.value === value)?.label || field.getValue({ item });
}

// packages/dataviews/build-module/field-types/utils/render-default.mjs
var import_jsx_runtime87 = __toESM(require_jsx_runtime(), 1);
function render({
  item,
  field
}) {
  if (field.hasElements) {
    return /* @__PURE__ */ (0, import_jsx_runtime87.jsx)(RenderFromElements, { item, field });
  }
  return field.getValueFormatted({ item, field });
}

// packages/dataviews/build-module/field-types/utils/sort-text.mjs
var sort_text_default = (a2, b2, direction) => {
  return direction === "asc" ? a2.localeCompare(b2) : b2.localeCompare(a2);
};

// packages/dataviews/build-module/field-types/utils/is-valid-required.mjs
function isValidRequired(item, field) {
  const value = field.getValue({ item });
  return ![void 0, "", null].includes(value);
}

// packages/dataviews/build-module/field-types/utils/is-valid-min-length.mjs
function isValidMinLength(item, field) {
  if (typeof field.isValid.minLength?.constraint !== "number") {
    return false;
  }
  const value = field.getValue({ item });
  if ([void 0, "", null].includes(value)) {
    return true;
  }
  return String(value).length >= field.isValid.minLength.constraint;
}

// packages/dataviews/build-module/field-types/utils/is-valid-max-length.mjs
function isValidMaxLength(item, field) {
  if (typeof field.isValid.maxLength?.constraint !== "number") {
    return false;
  }
  const value = field.getValue({ item });
  if ([void 0, "", null].includes(value)) {
    return true;
  }
  return String(value).length <= field.isValid.maxLength.constraint;
}

// packages/dataviews/build-module/field-types/utils/is-valid-pattern.mjs
function isValidPattern(item, field) {
  if (field.isValid.pattern?.constraint === void 0) {
    return true;
  }
  try {
    const regexp = new RegExp(field.isValid.pattern.constraint);
    const value = field.getValue({ item });
    if ([void 0, "", null].includes(value)) {
      return true;
    }
    return regexp.test(String(value));
  } catch {
    return false;
  }
}

// packages/dataviews/build-module/field-types/utils/is-valid-elements.mjs
function isValidElements(item, field) {
  const elements = field.elements ?? [];
  const validValues = elements.map((el) => el.value);
  if (validValues.length === 0) {
    return true;
  }
  const value = field.getValue({ item });
  return [].concat(value).every((v2) => validValues.includes(v2));
}

// packages/dataviews/build-module/field-types/utils/get-value-formatted-default.mjs
function getValueFormatted({
  item,
  field
}) {
  return field.getValue({ item });
}
var get_value_formatted_default_default = getValueFormatted;

// packages/dataviews/build-module/field-types/email.mjs
var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
function isValidCustom(item, field) {
  const value = field.getValue({ item });
  if (![void 0, "", null].includes(value) && !emailRegex.test(value)) {
    return (0, import_i18n16.__)("Value must be a valid email address.");
  }
  return null;
}
var email_default = {
  type: "email",
  render,
  Edit: "email",
  sort: sort_text_default,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [OPERATOR_IS_ANY, OPERATOR_IS_NONE],
  validOperators: [
    OPERATOR_IS,
    OPERATOR_IS_NOT,
    OPERATOR_CONTAINS,
    OPERATOR_NOT_CONTAINS,
    OPERATOR_STARTS_WITH,
    // Multiple selection
    OPERATOR_IS_ANY,
    OPERATOR_IS_NONE,
    OPERATOR_IS_ALL,
    OPERATOR_IS_NOT_ALL
  ],
  format: {},
  getValueFormatted: get_value_formatted_default_default,
  validate: {
    required: isValidRequired,
    pattern: isValidPattern,
    minLength: isValidMinLength,
    maxLength: isValidMaxLength,
    elements: isValidElements,
    custom: isValidCustom
  }
};

// packages/dataviews/build-module/field-types/integer.mjs
var import_i18n17 = __toESM(require_i18n(), 1);

// packages/dataviews/build-module/field-types/utils/sort-number.mjs
var sort_number_default = (a2, b2, direction) => {
  return direction === "asc" ? a2 - b2 : b2 - a2;
};

// packages/dataviews/build-module/field-types/utils/is-valid-min.mjs
function isValidMin(item, field) {
  if (typeof field.isValid.min?.constraint !== "number") {
    return false;
  }
  const value = field.getValue({ item });
  if ([void 0, "", null].includes(value)) {
    return true;
  }
  return Number(value) >= field.isValid.min.constraint;
}

// packages/dataviews/build-module/field-types/utils/is-valid-max.mjs
function isValidMax(item, field) {
  if (typeof field.isValid.max?.constraint !== "number") {
    return false;
  }
  const value = field.getValue({ item });
  if ([void 0, "", null].includes(value)) {
    return true;
  }
  return Number(value) <= field.isValid.max.constraint;
}

// packages/dataviews/build-module/field-types/integer.mjs
var format2 = {
  separatorThousand: ","
};
function getValueFormatted2({
  item,
  field
}) {
  let value = field.getValue({ item });
  if (value === null || value === void 0) {
    return "";
  }
  value = Number(value);
  if (!Number.isFinite(value)) {
    return String(value);
  }
  let formatInteger;
  if (field.type !== "integer") {
    formatInteger = format2;
  } else {
    formatInteger = field.format;
  }
  const { separatorThousand } = formatInteger;
  const integerValue = Math.trunc(value);
  if (!separatorThousand) {
    return String(integerValue);
  }
  return String(integerValue).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    separatorThousand
  );
}
function isValidCustom2(item, field) {
  const value = field.getValue({ item });
  if (![void 0, "", null].includes(value) && !Number.isInteger(value)) {
    return (0, import_i18n17.__)("Value must be an integer.");
  }
  return null;
}
var integer_default = {
  type: "integer",
  render,
  Edit: "integer",
  sort: sort_number_default,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [
    OPERATOR_IS,
    OPERATOR_IS_NOT,
    OPERATOR_LESS_THAN,
    OPERATOR_GREATER_THAN,
    OPERATOR_LESS_THAN_OR_EQUAL,
    OPERATOR_GREATER_THAN_OR_EQUAL,
    OPERATOR_BETWEEN
  ],
  validOperators: [
    // Single-selection
    OPERATOR_IS,
    OPERATOR_IS_NOT,
    OPERATOR_LESS_THAN,
    OPERATOR_GREATER_THAN,
    OPERATOR_LESS_THAN_OR_EQUAL,
    OPERATOR_GREATER_THAN_OR_EQUAL,
    OPERATOR_BETWEEN,
    // Multiple-selection
    OPERATOR_IS_ANY,
    OPERATOR_IS_NONE,
    OPERATOR_IS_ALL,
    OPERATOR_IS_NOT_ALL
  ],
  format: format2,
  getValueFormatted: getValueFormatted2,
  validate: {
    required: isValidRequired,
    min: isValidMin,
    max: isValidMax,
    elements: isValidElements,
    custom: isValidCustom2
  }
};

// packages/dataviews/build-module/field-types/number.mjs
var import_i18n18 = __toESM(require_i18n(), 1);
var format3 = {
  separatorThousand: ",",
  separatorDecimal: ".",
  decimals: 2
};
function getValueFormatted3({
  item,
  field
}) {
  let value = field.getValue({ item });
  if (value === null || value === void 0) {
    return "";
  }
  value = Number(value);
  if (!Number.isFinite(value)) {
    return String(value);
  }
  let formatNumber;
  if (field.type !== "number") {
    formatNumber = format3;
  } else {
    formatNumber = field.format;
  }
  const { separatorThousand, separatorDecimal, decimals } = formatNumber;
  const fixedValue = value.toFixed(decimals);
  const [integerPart, decimalPart] = fixedValue.split(".");
  const formattedInteger = separatorThousand ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separatorThousand) : integerPart;
  return decimals === 0 ? formattedInteger : formattedInteger + separatorDecimal + decimalPart;
}
function isEmpty(value) {
  return value === "" || value === void 0 || value === null;
}
function isValidCustom3(item, field) {
  const value = field.getValue({ item });
  if (!isEmpty(value) && !Number.isFinite(value)) {
    return (0, import_i18n18.__)("Value must be a number.");
  }
  return null;
}
var number_default = {
  type: "number",
  render,
  Edit: "number",
  sort: sort_number_default,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [
    OPERATOR_IS,
    OPERATOR_IS_NOT,
    OPERATOR_LESS_THAN,
    OPERATOR_GREATER_THAN,
    OPERATOR_LESS_THAN_OR_EQUAL,
    OPERATOR_GREATER_THAN_OR_EQUAL,
    OPERATOR_BETWEEN
  ],
  validOperators: [
    // Single-selection
    OPERATOR_IS,
    OPERATOR_IS_NOT,
    OPERATOR_LESS_THAN,
    OPERATOR_GREATER_THAN,
    OPERATOR_LESS_THAN_OR_EQUAL,
    OPERATOR_GREATER_THAN_OR_EQUAL,
    OPERATOR_BETWEEN,
    // Multiple-selection
    OPERATOR_IS_ANY,
    OPERATOR_IS_NONE,
    OPERATOR_IS_ALL,
    OPERATOR_IS_NOT_ALL
  ],
  format: format3,
  getValueFormatted: getValueFormatted3,
  validate: {
    required: isValidRequired,
    min: isValidMin,
    max: isValidMax,
    elements: isValidElements,
    custom: isValidCustom3
  }
};

// packages/dataviews/build-module/field-types/text.mjs
var text_default = {
  type: "text",
  render,
  Edit: "text",
  sort: sort_text_default,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [OPERATOR_IS_ANY, OPERATOR_IS_NONE],
  validOperators: [
    // Single selection
    OPERATOR_IS,
    OPERATOR_IS_NOT,
    OPERATOR_CONTAINS,
    OPERATOR_NOT_CONTAINS,
    OPERATOR_STARTS_WITH,
    // Multiple selection
    OPERATOR_IS_ANY,
    OPERATOR_IS_NONE,
    OPERATOR_IS_ALL,
    OPERATOR_IS_NOT_ALL
  ],
  format: {},
  getValueFormatted: get_value_formatted_default_default,
  validate: {
    required: isValidRequired,
    pattern: isValidPattern,
    minLength: isValidMinLength,
    maxLength: isValidMaxLength,
    elements: isValidElements
  }
};

// packages/dataviews/build-module/field-types/datetime.mjs
var import_date8 = __toESM(require_date(), 1);

// packages/dataviews/build-module/field-types/utils/is-valid-boundary.mjs
var import_date7 = __toESM(require_date(), 1);
function parseDateLike(value) {
  if (!isValid(new Date(value))) {
    return null;
  }
  const parsed = (0, import_date7.getDate)(value);
  return parsed && isValid(parsed) ? parsed.getTime() : null;
}
function validateBoundary(item, field, boundary, parse2) {
  const constraint = field.isValid[boundary]?.constraint;
  if (typeof constraint !== "string") {
    return false;
  }
  const value = field.getValue({ item });
  const boundaryValue = Array.isArray(value) ? value[boundary === "min" ? 0 : value.length - 1] : value;
  if (boundaryValue === void 0 || boundaryValue === null || boundaryValue === "") {
    return true;
  }
  const parsedConstraint = parse2(constraint);
  const parsedValue = parse2(String(boundaryValue));
  if (parsedConstraint === null || parsedValue === null) {
    return false;
  }
  return boundary === "min" ? parsedValue >= parsedConstraint : parsedValue <= parsedConstraint;
}
function isValidMinDate(item, field) {
  return validateBoundary(item, field, "min", parseDateLike);
}
function isValidMaxDate(item, field) {
  return validateBoundary(item, field, "max", parseDateLike);
}
function isValidMinTime(item, field) {
  return validateBoundary(item, field, "min", parseTime2);
}
function isValidMaxTime(item, field) {
  return validateBoundary(item, field, "max", parseTime2);
}

// packages/dataviews/build-module/field-types/datetime.mjs
var format4 = {
  datetime: (0, import_date8.getSettings)().formats.datetime,
  weekStartsOn: (0, import_date8.getSettings)().l10n.startOfWeek
};
function getValueFormatted4({
  item,
  field
}) {
  const value = field.getValue({ item });
  if (["", void 0, null].includes(value)) {
    return "";
  }
  let formatDatetime;
  if (field.type !== "datetime") {
    formatDatetime = format4;
  } else {
    formatDatetime = field.format;
  }
  return (0, import_date8.dateI18n)(formatDatetime.datetime, (0, import_date8.getDate)(value));
}
var sort = (a2, b2, direction) => {
  const timeA = new Date(a2).getTime();
  const timeB = new Date(b2).getTime();
  return direction === "asc" ? timeA - timeB : timeB - timeA;
};
var datetime_default = {
  type: "datetime",
  render,
  Edit: "datetime",
  sort,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [
    OPERATOR_ON,
    OPERATOR_NOT_ON,
    OPERATOR_BEFORE,
    OPERATOR_AFTER,
    OPERATOR_BEFORE_INC,
    OPERATOR_AFTER_INC,
    OPERATOR_IN_THE_PAST,
    OPERATOR_OVER
  ],
  validOperators: [
    OPERATOR_ON,
    OPERATOR_NOT_ON,
    OPERATOR_BEFORE,
    OPERATOR_AFTER,
    OPERATOR_BEFORE_INC,
    OPERATOR_AFTER_INC,
    OPERATOR_IN_THE_PAST,
    OPERATOR_OVER
  ],
  format: format4,
  getValueFormatted: getValueFormatted4,
  validate: {
    required: isValidRequired,
    elements: isValidElements,
    min: isValidMinDate,
    max: isValidMaxDate
  }
};

// packages/dataviews/build-module/field-types/date.mjs
var import_date9 = __toESM(require_date(), 1);
var format5 = {
  date: (0, import_date9.getSettings)().formats.date,
  weekStartsOn: (0, import_date9.getSettings)().l10n.startOfWeek
};
function getValueFormatted5({
  item,
  field
}) {
  const value = field.getValue({ item });
  if (["", void 0, null].includes(value)) {
    return "";
  }
  let formatDate2;
  if (field.type !== "date") {
    formatDate2 = format5;
  } else {
    formatDate2 = field.format;
  }
  return (0, import_date9.dateI18n)(formatDate2.date, (0, import_date9.getDate)(value));
}
var sort2 = (a2, b2, direction) => {
  const timeA = new Date(a2).getTime();
  const timeB = new Date(b2).getTime();
  return direction === "asc" ? timeA - timeB : timeB - timeA;
};
var date_default = {
  type: "date",
  render,
  Edit: "date",
  sort: sort2,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [
    OPERATOR_ON,
    OPERATOR_NOT_ON,
    OPERATOR_BEFORE,
    OPERATOR_AFTER,
    OPERATOR_BEFORE_INC,
    OPERATOR_AFTER_INC,
    OPERATOR_IN_THE_PAST,
    OPERATOR_OVER,
    OPERATOR_BETWEEN
  ],
  validOperators: [
    OPERATOR_ON,
    OPERATOR_NOT_ON,
    OPERATOR_BEFORE,
    OPERATOR_AFTER,
    OPERATOR_BEFORE_INC,
    OPERATOR_AFTER_INC,
    OPERATOR_IN_THE_PAST,
    OPERATOR_OVER,
    OPERATOR_BETWEEN
  ],
  format: format5,
  getValueFormatted: getValueFormatted5,
  validate: {
    required: isValidRequired,
    elements: isValidElements,
    min: isValidMinDate,
    max: isValidMaxDate
  }
};

// packages/dataviews/build-module/field-types/time.mjs
var import_date10 = __toESM(require_date(), 1);
var format6 = {
  time: (0, import_date10.getSettings)().formats.time
};
var ANCHOR_DATE = "2000-01-01";
function toAnchoredDate(secondsSinceMidnight) {
  const hours = Math.floor(secondsSinceMidnight / 3600);
  const minutes = Math.floor(secondsSinceMidnight % 3600 / 60);
  const seconds = secondsSinceMidnight % 60;
  const time = [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  return (0, import_date10.getDate)(`${ANCHOR_DATE}T${time}`);
}
function getValueFormatted6({
  item,
  field
}) {
  const secondsSinceMidnight = parseTime2(field.getValue({ item }));
  if (secondsSinceMidnight === null) {
    return "";
  }
  let formatTime;
  if (field.type !== "time") {
    formatTime = format6;
  } else {
    formatTime = field.format;
  }
  return (0, import_date10.dateI18n)(formatTime.time, toAnchoredDate(secondsSinceMidnight));
}
var sort3 = (a2, b2, direction) => {
  const timeA = parseTime2(a2);
  const timeB = parseTime2(b2);
  if (timeA === null || timeB === null) {
    if (timeA === timeB) {
      return 0;
    }
    return timeA === null ? 1 : -1;
  }
  return direction === "asc" ? timeA - timeB : timeB - timeA;
};
var time_default = {
  type: "time",
  render,
  Edit: "time",
  sort: sort3,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [
    OPERATOR_ON,
    OPERATOR_NOT_ON,
    OPERATOR_BEFORE,
    OPERATOR_AFTER,
    OPERATOR_BEFORE_INC,
    OPERATOR_AFTER_INC,
    OPERATOR_BETWEEN
  ],
  validOperators: [
    OPERATOR_ON,
    OPERATOR_NOT_ON,
    OPERATOR_BEFORE,
    OPERATOR_AFTER,
    OPERATOR_BEFORE_INC,
    OPERATOR_AFTER_INC,
    OPERATOR_BETWEEN
  ],
  format: format6,
  getValueFormatted: getValueFormatted6,
  validate: {
    required: isValidRequired,
    elements: isValidElements,
    min: isValidMinTime,
    max: isValidMaxTime
  }
};

// packages/dataviews/build-module/field-types/boolean.mjs
var import_i18n19 = __toESM(require_i18n(), 1);

// packages/dataviews/build-module/field-types/utils/is-valid-required-for-bool.mjs
function isValidRequiredForBool(item, field) {
  const value = field.getValue({ item });
  return value === true;
}

// packages/dataviews/build-module/field-types/boolean.mjs
function getValueFormatted7({
  item,
  field
}) {
  const value = field.getValue({ item });
  if (value === true) {
    return (0, import_i18n19.__)("True");
  }
  if (value === false) {
    return (0, import_i18n19.__)("False");
  }
  return "";
}
function isValidCustom4(item, field) {
  const value = field.getValue({ item });
  if (![void 0, "", null].includes(value) && ![true, false].includes(value)) {
    return (0, import_i18n19.__)("Value must be true, false, or undefined");
  }
  return null;
}
var sort4 = (a2, b2, direction) => {
  const boolA = Boolean(a2);
  const boolB = Boolean(b2);
  if (boolA === boolB) {
    return 0;
  }
  if (direction === "asc") {
    return boolA ? 1 : -1;
  }
  return boolA ? -1 : 1;
};
var boolean_default = {
  type: "boolean",
  render,
  Edit: "checkbox",
  sort: sort4,
  validate: {
    required: isValidRequiredForBool,
    elements: isValidElements,
    custom: isValidCustom4
  },
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [OPERATOR_IS, OPERATOR_IS_NOT],
  validOperators: [OPERATOR_IS, OPERATOR_IS_NOT],
  format: {},
  getValueFormatted: getValueFormatted7
};

// packages/dataviews/build-module/field-types/media.mjs
var media_default = {
  type: "media",
  render: () => null,
  Edit: null,
  sort: () => 0,
  enableSorting: false,
  enableGlobalSearch: false,
  defaultOperators: [],
  validOperators: [],
  format: {},
  getValueFormatted: get_value_formatted_default_default,
  // cannot validate any constraint, so
  // the only available validation for the field author
  // would be providing a custom validator.
  validate: {}
};

// packages/dataviews/build-module/field-types/array.mjs
var import_i18n20 = __toESM(require_i18n(), 1);

// packages/dataviews/build-module/field-types/utils/is-valid-required-for-array.mjs
function isValidRequiredForArray(item, field) {
  const value = field.getValue({ item });
  return Array.isArray(value) && value.length > 0 && value.every(
    (element) => ![void 0, "", null].includes(element)
  );
}

// packages/dataviews/build-module/field-types/array.mjs
function getValueFormatted8({
  item,
  field
}) {
  const value = field.getValue({ item });
  const arr = Array.isArray(value) ? value : [];
  return arr.join(", ");
}
function render2({ item, field }) {
  return getValueFormatted8({ item, field });
}
function isValidCustom5(item, field) {
  const value = field.getValue({ item });
  if ([void 0, "", null].includes(value)) {
    return null;
  }
  if (!Array.isArray(value)) {
    return (0, import_i18n20.__)("Value must be an array.");
  }
  if (!value.every((v2) => typeof v2 === "string")) {
    return (0, import_i18n20.__)("Every value must be a string.");
  }
  return null;
}
var sort5 = (a2, b2, direction) => {
  const arrA = Array.isArray(a2) ? a2 : [];
  const arrB = Array.isArray(b2) ? b2 : [];
  if (arrA.length !== arrB.length) {
    return direction === "asc" ? arrA.length - arrB.length : arrB.length - arrA.length;
  }
  const joinedA = arrA.join(",");
  const joinedB = arrB.join(",");
  return direction === "asc" ? joinedA.localeCompare(joinedB) : joinedB.localeCompare(joinedA);
};
var array_default = {
  type: "array",
  render: render2,
  Edit: "array",
  sort: sort5,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [OPERATOR_IS_ANY, OPERATOR_IS_NONE],
  validOperators: [
    OPERATOR_IS_ANY,
    OPERATOR_IS_NONE,
    OPERATOR_IS_ALL,
    OPERATOR_IS_NOT_ALL
  ],
  format: {},
  getValueFormatted: getValueFormatted8,
  validate: {
    required: isValidRequiredForArray,
    elements: isValidElements,
    custom: isValidCustom5
  }
};

// packages/dataviews/build-module/field-types/password.mjs
function getValueFormatted9({
  item,
  field
}) {
  return field.getValue({ item }) ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "";
}
var password_default = {
  type: "password",
  render,
  Edit: "password",
  sort: () => 0,
  // Passwords should not be sortable for security reasons
  enableSorting: false,
  enableGlobalSearch: false,
  defaultOperators: [],
  validOperators: [],
  format: {},
  getValueFormatted: getValueFormatted9,
  validate: {
    required: isValidRequired,
    pattern: isValidPattern,
    minLength: isValidMinLength,
    maxLength: isValidMaxLength,
    elements: isValidElements
  }
};

// packages/dataviews/build-module/field-types/telephone.mjs
var telephone_default = {
  type: "telephone",
  render,
  Edit: "telephone",
  sort: sort_text_default,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [OPERATOR_IS_ANY, OPERATOR_IS_NONE],
  validOperators: [
    OPERATOR_IS,
    OPERATOR_IS_NOT,
    OPERATOR_CONTAINS,
    OPERATOR_NOT_CONTAINS,
    OPERATOR_STARTS_WITH,
    // Multiple selection
    OPERATOR_IS_ANY,
    OPERATOR_IS_NONE,
    OPERATOR_IS_ALL,
    OPERATOR_IS_NOT_ALL
  ],
  format: {},
  getValueFormatted: get_value_formatted_default_default,
  validate: {
    required: isValidRequired,
    pattern: isValidPattern,
    minLength: isValidMinLength,
    maxLength: isValidMaxLength,
    elements: isValidElements
  }
};

// packages/dataviews/build-module/field-types/color.mjs
var import_i18n21 = __toESM(require_i18n(), 1);
var import_jsx_runtime88 = __toESM(require_jsx_runtime(), 1);
function render3({ item, field }) {
  if (field.hasElements) {
    return /* @__PURE__ */ (0, import_jsx_runtime88.jsx)(RenderFromElements, { item, field });
  }
  const value = get_value_formatted_default_default({ item, field });
  if (!value || !w(value).isValid()) {
    return value;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime88.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime88.jsx)(
      "div",
      {
        style: {
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: value,
          border: "1px solid #ddd",
          flexShrink: 0
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime88.jsx)("span", { children: value })
  ] });
}
function isValidCustom6(item, field) {
  const value = field.getValue({ item });
  if (![void 0, "", null].includes(value) && !w(value).isValid()) {
    return (0, import_i18n21.__)("Value must be a valid color.");
  }
  return null;
}
var sort6 = (a2, b2, direction) => {
  const colorA = w(a2);
  const colorB = w(b2);
  if (!colorA.isValid() && !colorB.isValid()) {
    return 0;
  }
  if (!colorA.isValid()) {
    return direction === "asc" ? 1 : -1;
  }
  if (!colorB.isValid()) {
    return direction === "asc" ? -1 : 1;
  }
  const hslA = colorA.toHsl();
  const hslB = colorB.toHsl();
  if (hslA.h !== hslB.h) {
    return direction === "asc" ? hslA.h - hslB.h : hslB.h - hslA.h;
  }
  if (hslA.s !== hslB.s) {
    return direction === "asc" ? hslA.s - hslB.s : hslB.s - hslA.s;
  }
  return direction === "asc" ? hslA.l - hslB.l : hslB.l - hslA.l;
};
var color_default = {
  type: "color",
  render: render3,
  Edit: "color",
  sort: sort6,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [OPERATOR_IS_ANY, OPERATOR_IS_NONE],
  validOperators: [
    OPERATOR_IS,
    OPERATOR_IS_NOT,
    OPERATOR_IS_ANY,
    OPERATOR_IS_NONE
  ],
  format: {},
  getValueFormatted: get_value_formatted_default_default,
  validate: {
    required: isValidRequired,
    elements: isValidElements,
    custom: isValidCustom6
  }
};

// packages/dataviews/build-module/field-types/url.mjs
var url_default = {
  type: "url",
  render,
  Edit: "url",
  sort: sort_text_default,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [OPERATOR_IS_ANY, OPERATOR_IS_NONE],
  validOperators: [
    OPERATOR_IS,
    OPERATOR_IS_NOT,
    OPERATOR_CONTAINS,
    OPERATOR_NOT_CONTAINS,
    OPERATOR_STARTS_WITH,
    // Multiple selection
    OPERATOR_IS_ANY,
    OPERATOR_IS_NONE,
    OPERATOR_IS_ALL,
    OPERATOR_IS_NOT_ALL
  ],
  format: {},
  getValueFormatted: get_value_formatted_default_default,
  validate: {
    required: isValidRequired,
    pattern: isValidPattern,
    minLength: isValidMinLength,
    maxLength: isValidMaxLength,
    elements: isValidElements
  }
};

// packages/dataviews/build-module/field-types/no-type.mjs
var sort7 = (a2, b2, direction) => {
  if (typeof a2 === "number" && typeof b2 === "number") {
    return sort_number_default(a2, b2, direction);
  }
  return sort_text_default(a2, b2, direction);
};
var no_type_default = {
  // type: no type for this one
  render,
  Edit: null,
  sort: sort7,
  enableSorting: true,
  enableGlobalSearch: false,
  defaultOperators: [OPERATOR_IS, OPERATOR_IS_NOT],
  validOperators: getAllOperatorNames(),
  format: {},
  getValueFormatted: get_value_formatted_default_default,
  validate: {
    required: isValidRequired,
    elements: isValidElements
  }
};

// packages/dataviews/build-module/field-types/utils/get-is-valid.mjs
function supportsNumericRangeConstraint(type) {
  return type === "integer" || type === "number";
}
function supportsStringRangeConstraint(type) {
  return type === "date" || type === "datetime" || type === "time";
}
function normalizeRangeRule(value, fieldType, key) {
  const validator = fieldType.validate[key];
  if (validator && (typeof value === "number" && supportsNumericRangeConstraint(fieldType.type) || typeof value === "string" && supportsStringRangeConstraint(fieldType.type))) {
    return { constraint: value, validate: validator };
  }
  return void 0;
}
function getIsValid(field, fieldType) {
  const rules = field.isValid;
  let required;
  if (rules?.required === true && fieldType.validate.required !== void 0) {
    required = {
      constraint: true,
      validate: fieldType.validate.required
    };
  }
  let elements;
  if ((rules?.elements === true || // elements is enabled unless the field opts-out
  rules?.elements === void 0 && (!!field.elements || !!field.getElements)) && fieldType.validate.elements !== void 0) {
    elements = {
      constraint: true,
      validate: fieldType.validate.elements
    };
  }
  const min2 = normalizeRangeRule(rules?.min, fieldType, "min");
  const max2 = normalizeRangeRule(rules?.max, fieldType, "max");
  const minLengthValue = rules?.minLength;
  let minLength;
  if (typeof minLengthValue === "number" && fieldType.validate.minLength !== void 0) {
    minLength = {
      constraint: minLengthValue,
      validate: fieldType.validate.minLength
    };
  }
  const maxLengthValue = rules?.maxLength;
  let maxLength;
  if (typeof maxLengthValue === "number" && fieldType.validate.maxLength !== void 0) {
    maxLength = {
      constraint: maxLengthValue,
      validate: fieldType.validate.maxLength
    };
  }
  const patternValue = rules?.pattern;
  let pattern;
  if (patternValue !== void 0 && fieldType.validate.pattern !== void 0) {
    pattern = {
      constraint: patternValue,
      validate: fieldType.validate.pattern
    };
  }
  const custom = rules?.custom ?? fieldType.validate.custom;
  return {
    required,
    elements,
    min: min2,
    max: max2,
    minLength,
    maxLength,
    pattern,
    custom
  };
}

// packages/dataviews/build-module/field-types/utils/get-filter.mjs
function getFilter(fieldType) {
  return fieldType.validOperators.reduce((accumulator, operator) => {
    const operatorObj = getOperatorByName(operator);
    if (operatorObj?.filter) {
      accumulator[operator] = operatorObj.filter;
    }
    return accumulator;
  }, {});
}

// packages/dataviews/build-module/field-types/utils/get-format.mjs
function getFormat(field, fieldType) {
  return {
    ...fieldType.format,
    ...field.format
  };
}
var get_format_default = getFormat;

// packages/dataviews/build-module/field-types/index.mjs
function getFieldTypeByName(type) {
  const found = [
    email_default,
    integer_default,
    number_default,
    text_default,
    datetime_default,
    date_default,
    time_default,
    boolean_default,
    media_default,
    array_default,
    password_default,
    telephone_default,
    color_default,
    url_default
  ].find((fieldType) => fieldType?.type === type);
  if (!!found) {
    return found;
  }
  return no_type_default;
}
function normalizeFields(fields) {
  return fields.map((field) => {
    const fieldType = getFieldTypeByName(field.type);
    const getValue = field.getValue || get_value_from_id_default(field.id);
    const sort8 = function(a2, b2, direction) {
      const aValue = getValue({ item: a2 });
      const bValue = getValue({ item: b2 });
      return field.sort ? field.sort(aValue, bValue, direction) : fieldType.sort(aValue, bValue, direction);
    };
    return {
      id: field.id,
      label: field.label || field.id,
      header: field.header || field.label || field.id,
      description: field.description,
      placeholder: field.placeholder,
      getValue,
      setValue: field.setValue || set_value_from_id_default(field.id),
      elements: field.elements,
      getElements: field.getElements,
      hasElements: hasElements(field),
      isVisible: field.isVisible,
      isDisabled: typeof field.isDisabled === "function" ? field.isDisabled : () => !!field.isDisabled,
      enableHiding: field.enableHiding ?? true,
      readOnly: field.readOnly ?? false,
      // The type provides defaults for the following props
      type: fieldType.type,
      render: field.render ?? fieldType.render,
      Edit: getControl(field, fieldType.Edit),
      sort: sort8,
      enableSorting: field.enableSorting ?? fieldType.enableSorting,
      enableGlobalSearch: field.enableGlobalSearch ?? fieldType.enableGlobalSearch,
      isValid: getIsValid(field, fieldType),
      filterBy: get_filter_by_default(
        field,
        fieldType.defaultOperators,
        fieldType.validOperators
      ),
      filter: getFilter(fieldType),
      format: get_format_default(field, fieldType),
      getValueFormatted: field.getValueFormatted ?? fieldType.getValueFormatted
    };
  });
}

// packages/dataviews/build-module/dataform/index.mjs
var import_element81 = __toESM(require_element(), 1);

// packages/dataviews/build-module/components/dataform-context/index.mjs
var import_element71 = __toESM(require_element(), 1);
var import_jsx_runtime89 = __toESM(require_jsx_runtime(), 1);
var DataFormContext = (0, import_element71.createContext)({
  fields: []
});
DataFormContext.displayName = "DataFormContext";
function DataFormProvider({
  fields,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime89.jsx)(DataFormContext.Provider, { value: { fields }, children });
}
var dataform_context_default = DataFormContext;

// packages/dataviews/build-module/components/dataform-layouts/data-form-layout.mjs
var import_element80 = __toESM(require_element(), 1);

// packages/dataviews/build-module/components/dataform-layouts/regular/index.mjs
var import_element72 = __toESM(require_element(), 1);
var import_components24 = __toESM(require_components(), 1);

// packages/dataviews/build-module/components/dataform-layouts/normalize-form.mjs
var import_i18n22 = __toESM(require_i18n(), 1);
var DEFAULT_LAYOUT = {
  type: "regular",
  labelPosition: "top"
};
var normalizeCardSummaryField = (sum) => {
  if (typeof sum === "string") {
    return [{ id: sum, visibility: "when-collapsed" }];
  }
  return sum.map((item) => {
    if (typeof item === "string") {
      return { id: item, visibility: "when-collapsed" };
    }
    return { id: item.id, visibility: item.visibility };
  });
};
function normalizeLayout(layout) {
  let normalizedLayout = DEFAULT_LAYOUT;
  if (layout?.type === "regular") {
    normalizedLayout = {
      type: "regular",
      labelPosition: layout?.labelPosition ?? "top"
    };
  } else if (layout?.type === "panel") {
    const summary = layout.summary ?? [];
    const normalizedSummary = Array.isArray(summary) ? summary : [summary];
    const openAs = layout?.openAs;
    let normalizedOpenAs;
    if (typeof openAs === "object" && openAs.type === "modal") {
      normalizedOpenAs = {
        type: "modal",
        applyLabel: openAs.applyLabel?.trim() || (0, import_i18n22.__)("Apply"),
        cancelLabel: openAs.cancelLabel?.trim() || (0, import_i18n22.__)("Cancel")
      };
    } else if (openAs === "modal") {
      normalizedOpenAs = {
        type: "modal",
        applyLabel: (0, import_i18n22.__)("Apply"),
        cancelLabel: (0, import_i18n22.__)("Cancel")
      };
    } else {
      normalizedOpenAs = { type: "dropdown" };
    }
    normalizedLayout = {
      type: "panel",
      labelPosition: layout?.labelPosition ?? "side",
      openAs: normalizedOpenAs,
      summary: normalizedSummary,
      editVisibility: layout?.editVisibility ?? "on-hover"
    };
  } else if (layout?.type === "card") {
    if (layout.withHeader === false) {
      normalizedLayout = {
        type: "card",
        withHeader: false,
        isOpened: true,
        summary: [],
        isCollapsible: false
      };
    } else {
      const summary = layout.summary ?? [];
      normalizedLayout = {
        type: "card",
        withHeader: true,
        isOpened: typeof layout.isOpened === "boolean" ? layout.isOpened : true,
        summary: normalizeCardSummaryField(summary),
        isCollapsible: layout.isCollapsible === void 0 ? true : layout.isCollapsible
      };
    }
  } else if (layout?.type === "row") {
    normalizedLayout = {
      type: "row",
      alignment: layout?.alignment ?? "center",
      styles: layout?.styles ?? {}
    };
  } else if (layout?.type === "details") {
    normalizedLayout = {
      type: "details",
      summary: layout?.summary ?? ""
    };
  }
  return normalizedLayout;
}
function normalizeForm(form) {
  const normalizedFormLayout = normalizeLayout(form?.layout);
  const normalizedFields = (form.fields ?? []).map(
    (field) => {
      if (typeof field === "string") {
        return {
          id: field,
          layout: normalizedFormLayout
        };
      }
      const fieldLayout = field.layout ? normalizeLayout(field.layout) : normalizedFormLayout;
      return {
        id: field.id,
        layout: fieldLayout,
        ...!!field.label && { label: field.label },
        ...!!field.description && {
          description: field.description
        },
        ..."children" in field && Array.isArray(field.children) && {
          children: normalizeForm({
            fields: field.children,
            layout: DEFAULT_LAYOUT
          }).fields
        }
      };
    }
  );
  return {
    layout: normalizedFormLayout,
    fields: normalizedFields
  };
}
var normalize_form_default = normalizeForm;

// packages/dataviews/build-module/components/dataform-layouts/regular/index.mjs
var import_jsx_runtime90 = __toESM(require_jsx_runtime(), 1);
function Header4({ title }) {
  return /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(
    Stack,
    {
      direction: "column",
      className: "dataforms-layouts-regular__header",
      gap: "lg",
      children: /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(Stack, { direction: "row", align: "center", children: /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(import_components24.__experimentalHeading, { level: 2, size: 13, children: title }) })
    }
  );
}
function FormRegularField({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const { fields } = (0, import_element72.useContext)(dataform_context_default);
  const layout = field.layout;
  const form = (0, import_element72.useMemo)(
    () => ({
      layout: DEFAULT_LAYOUT,
      fields: !!field.children ? field.children : []
    }),
    [field]
  );
  if (!!field.children) {
    return /* @__PURE__ */ (0, import_jsx_runtime90.jsxs)(import_jsx_runtime90.Fragment, { children: [
      !hideLabelFromVision && field.label && /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(Header4, { title: field.label }),
      /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(
        DataFormLayout,
        {
          data,
          form,
          onChange,
          validity: validity?.children
        }
      )
    ] });
  }
  const labelPosition = layout.labelPosition;
  const fieldDefinition = fields.find(
    (fieldDef) => fieldDef.id === field.id
  );
  if (!fieldDefinition || !fieldDefinition.Edit) {
    return null;
  }
  if (labelPosition === "side") {
    return /* @__PURE__ */ (0, import_jsx_runtime90.jsxs)(
      Stack,
      {
        direction: "row",
        className: "dataforms-layouts-regular__field",
        gap: "sm",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(
            "div",
            {
              className: clsx_default(
                "dataforms-layouts-regular__field-label",
                `dataforms-layouts-regular__field-label--label-position-${labelPosition}`
              ),
              children: /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(import_components24.BaseControl.VisualLabel, { children: fieldDefinition.label })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime90.jsx)("div", { className: "dataforms-layouts-regular__field-control", children: fieldDefinition.readOnly === true ? /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(
            fieldDefinition.render,
            {
              item: data,
              field: fieldDefinition
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(
            fieldDefinition.Edit,
            {
              data,
              field: fieldDefinition,
              onChange,
              hideLabelFromVision: true,
              markWhenOptional,
              validity
            },
            fieldDefinition.id
          ) })
        ]
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime90.jsx)("div", { className: "dataforms-layouts-regular__field", children: fieldDefinition.readOnly === true ? /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(import_jsx_runtime90.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime90.jsxs)(import_jsx_runtime90.Fragment, { children: [
    !hideLabelFromVision && labelPosition !== "none" && /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(import_components24.BaseControl.VisualLabel, { children: fieldDefinition.label }),
    /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(
      fieldDefinition.render,
      {
        item: data,
        field: fieldDefinition
      }
    )
  ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(
    fieldDefinition.Edit,
    {
      data,
      field: fieldDefinition,
      onChange,
      hideLabelFromVision: labelPosition === "none" ? true : hideLabelFromVision,
      markWhenOptional,
      validity
    }
  ) });
}

// packages/dataviews/build-module/components/dataform-layouts/panel/modal.mjs
var import_deepmerge2 = __toESM(require_cjs(), 1);
var import_components27 = __toESM(require_components(), 1);
var import_element76 = __toESM(require_element(), 1);
var import_compose12 = __toESM(require_compose(), 1);

// packages/dataviews/build-module/components/dataform-layouts/panel/summary-button.mjs
var import_components26 = __toESM(require_components(), 1);
var import_i18n23 = __toESM(require_i18n(), 1);
var import_compose11 = __toESM(require_compose(), 1);

// packages/dataviews/build-module/components/dataform-layouts/panel/utils/get-label-classname.mjs
function getLabelClassName(labelPosition, showError) {
  return clsx_default(
    "dataforms-layouts-panel__field-label",
    `dataforms-layouts-panel__field-label--label-position-${labelPosition}`,
    { "has-error": showError }
  );
}
var get_label_classname_default = getLabelClassName;

// packages/dataviews/build-module/components/dataform-layouts/panel/field-label-content.mjs
var import_components25 = __toESM(require_components(), 1);
var import_jsx_runtime91 = __toESM(require_jsx_runtime(), 1);
function FieldLabelContent({
  showError,
  errorMessage,
  fieldLabel,
  errorId
}) {
  if (!showError) {
    return /* @__PURE__ */ (0, import_jsx_runtime91.jsx)(import_jsx_runtime91.Fragment, { children: fieldLabel });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime91.jsxs)("span", { className: "dataforms-layouts-panel__field-label-error-content", children: [
    /* @__PURE__ */ (0, import_jsx_runtime91.jsx)(import_components25.Icon, { icon: error_default, size: 16 }),
    /* @__PURE__ */ (0, import_jsx_runtime91.jsx)(VisuallyHidden, { id: errorId, children: errorMessage }),
    fieldLabel
  ] });
}
var field_label_content_default = FieldLabelContent;

// packages/dataviews/build-module/components/dataform-layouts/panel/utils/get-first-validation-error.mjs
function getFirstValidationError(validity) {
  if (!validity) {
    return void 0;
  }
  const validityRules = Object.keys(validity).filter(
    (key) => key !== "children"
  );
  for (const key of validityRules) {
    const rule = validity[key];
    if (rule === void 0) {
      continue;
    }
    if (rule.type === "invalid") {
      if (rule.message) {
        return rule.message;
      }
      if (key === "required") {
        return "A required field is empty";
      }
      return "Unidentified validation error";
    }
  }
  if (validity.children) {
    for (const childValidity of Object.values(validity.children)) {
      const childError = getFirstValidationError(childValidity);
      if (childError) {
        return childError;
      }
    }
  }
  return void 0;
}
var get_first_validation_error_default = getFirstValidationError;

// packages/dataviews/build-module/components/dataform-layouts/panel/summary-button.mjs
var import_jsx_runtime92 = __toESM(require_jsx_runtime(), 1);
function SummaryButton({
  data,
  field,
  fieldLabel,
  summaryFields,
  validity,
  touched,
  disabled: disabled2,
  isOpen,
  onClick
}) {
  const { labelPosition, editVisibility } = field.layout;
  const errorMessage = get_first_validation_error_default(validity);
  const showError = touched && !!errorMessage;
  const labelClassName = get_label_classname_default(labelPosition, showError);
  const className = clsx_default(
    "dataforms-layouts-panel__field-trigger",
    `dataforms-layouts-panel__field-trigger--label-${labelPosition}`,
    {
      "is-disabled": disabled2,
      "dataforms-layouts-panel__field-trigger--edit-always": editVisibility === "always"
    }
  );
  const controlId = (0, import_compose11.useInstanceId)(
    SummaryButton,
    "dataforms-layouts-panel__field-control"
  );
  const errorId = `${controlId}-error`;
  const ariaLabel = showError ? (0, import_i18n23.sprintf)(
    // translators: %s: Field name.
    (0, import_i18n23._x)("Edit %s (has errors)", "field"),
    fieldLabel || ""
  ) : (0, import_i18n23.sprintf)(
    // translators: %s: Field name.
    (0, import_i18n23._x)("Edit %s", "field"),
    fieldLabel || ""
  );
  return /* @__PURE__ */ (0, import_jsx_runtime92.jsxs)("div", { className, children: [
    labelPosition !== "none" && /* @__PURE__ */ (0, import_jsx_runtime92.jsx)("span", { className: labelClassName, children: /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
      field_label_content_default,
      {
        showError,
        errorMessage,
        fieldLabel,
        errorId
      }
    ) }),
    labelPosition === "none" && showError && /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
      field_label_content_default,
      {
        showError: true,
        errorMessage,
        errorId
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
      "span",
      {
        id: `${controlId}`,
        className: "dataforms-layouts-panel__field-control",
        children: summaryFields.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
          "span",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
              gap: "2px"
            },
            children: summaryFields.map((summaryField) => /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
              "span",
              {
                style: { width: "100%" },
                children: /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
                  summaryField.render,
                  {
                    item: data,
                    field: summaryField
                  }
                )
              },
              summaryField.id
            ))
          }
        ) : summaryFields.map((summaryField) => /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
          summaryField.render,
          {
            item: data,
            field: summaryField
          },
          summaryField.id
        ))
      }
    ),
    !disabled2 && /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
      import_components26.Button,
      {
        className: "dataforms-layouts-panel__field-trigger-icon",
        label: ariaLabel,
        icon: pencil_default,
        size: "small",
        "aria-expanded": isOpen,
        "aria-haspopup": "dialog",
        "aria-describedby": showError ? `${controlId} ${errorId}` : controlId,
        onClick
      }
    )
  ] });
}

// packages/dataviews/build-module/hooks/use-form-validity.mjs
var import_deepmerge = __toESM(require_cjs(), 1);
var import_es6 = __toESM(require_es6(), 1);
var import_element73 = __toESM(require_element(), 1);
var import_i18n24 = __toESM(require_i18n(), 1);
function isFormValid(formValidity) {
  if (!formValidity) {
    return true;
  }
  return Object.values(formValidity).every((fieldValidation) => {
    return Object.entries(fieldValidation).every(
      ([key, validation]) => {
        if (key === "children" && validation && typeof validation === "object") {
          return isFormValid(validation);
        }
        return validation.type !== "invalid" && validation.type !== "validating";
      }
    );
  });
}
function getFormFieldsToValidate(form, fields) {
  const normalizedForm = normalize_form_default(form);
  if (normalizedForm.fields.length === 0) {
    return [];
  }
  const fieldsMap = /* @__PURE__ */ new Map();
  fields.forEach((field) => {
    fieldsMap.set(field.id, field);
  });
  function processFormField(formField) {
    if ("children" in formField && Array.isArray(formField.children)) {
      const processedChildren = formField.children.map(processFormField).filter((child) => child !== null);
      if (processedChildren.length === 0) {
        return null;
      }
      const fieldDef2 = fieldsMap.get(formField.id);
      if (fieldDef2) {
        const [normalizedField2] = normalizeFields([
          fieldDef2
        ]);
        return {
          id: formField.id,
          children: processedChildren,
          field: normalizedField2
        };
      }
      return {
        id: formField.id,
        children: processedChildren
      };
    }
    const fieldDef = fieldsMap.get(formField.id);
    if (!fieldDef) {
      return null;
    }
    const [normalizedField] = normalizeFields([fieldDef]);
    return {
      id: formField.id,
      children: [],
      field: normalizedField
    };
  }
  const toValidate = normalizedForm.fields.map(processFormField).filter((field) => field !== null);
  return toValidate;
}
function setValidityAtPath(formValidity, fieldValidity, path) {
  if (!formValidity) {
    formValidity = {};
  }
  if (path.length === 0) {
    return formValidity;
  }
  const result = { ...formValidity };
  let current = result;
  for (let i2 = 0; i2 < path.length - 1; i2++) {
    const segment = path[i2];
    if (!current[segment]) {
      current[segment] = {};
    }
    current[segment] = { ...current[segment] };
    current = current[segment];
  }
  const finalKey = path[path.length - 1];
  current[finalKey] = {
    ...current[finalKey] || {},
    ...fieldValidity
  };
  return result;
}
function removeValidationProperty(formValidity, path, property) {
  if (!formValidity || path.length === 0) {
    return formValidity;
  }
  const result = { ...formValidity };
  let current = result;
  for (let i2 = 0; i2 < path.length - 1; i2++) {
    const segment = path[i2];
    if (!current[segment]) {
      return formValidity;
    }
    current[segment] = { ...current[segment] };
    current = current[segment];
  }
  const finalKey = path[path.length - 1];
  if (!current[finalKey]) {
    return formValidity;
  }
  const fieldValidity = { ...current[finalKey] };
  delete fieldValidity[property];
  if (Object.keys(fieldValidity).length === 0) {
    delete current[finalKey];
  } else {
    current[finalKey] = fieldValidity;
  }
  if (Object.keys(result).length === 0) {
    return void 0;
  }
  return result;
}
function handleElementsValidationAsync(promise, formField, promiseHandler) {
  const { elementsCounterRef, setFormValidity, path, item } = promiseHandler;
  const currentToken = (elementsCounterRef.current[formField.id] || 0) + 1;
  elementsCounterRef.current[formField.id] = currentToken;
  promise.then((result) => {
    if (currentToken !== elementsCounterRef.current[formField.id]) {
      return;
    }
    if (!Array.isArray(result)) {
      setFormValidity((prev) => {
        const newFormValidity = setValidityAtPath(
          prev,
          {
            elements: {
              type: "invalid",
              message: (0, import_i18n24.__)("Could not validate elements.")
            }
          },
          [...path, formField.id]
        );
        return newFormValidity;
      });
      return;
    }
    if (formField.field?.isValid.elements && !formField.field.isValid.elements.validate(item, {
      ...formField.field,
      elements: result
    })) {
      setFormValidity((prev) => {
        const newFormValidity = setValidityAtPath(
          prev,
          {
            elements: {
              type: "invalid",
              message: (0, import_i18n24.__)(
                "Value must be one of the elements."
              )
            }
          },
          [...path, formField.id]
        );
        return newFormValidity;
      });
    } else {
      setFormValidity((prev) => {
        return removeValidationProperty(
          prev,
          [...path, formField.id],
          "elements"
        );
      });
    }
  }).catch((error2) => {
    if (currentToken !== elementsCounterRef.current[formField.id]) {
      return;
    }
    let errorMessage;
    if (error2 instanceof Error) {
      errorMessage = error2.message;
    } else {
      errorMessage = String(error2) || (0, import_i18n24.__)(
        "Unknown error when running elements validation asynchronously."
      );
    }
    setFormValidity((prev) => {
      const newFormValidity = setValidityAtPath(
        prev,
        {
          elements: {
            type: "invalid",
            message: errorMessage
          }
        },
        [...path, formField.id]
      );
      return newFormValidity;
    });
  });
}
function handleCustomValidationAsync(promise, formField, promiseHandler) {
  const { customCounterRef, setFormValidity, path } = promiseHandler;
  const currentToken = (customCounterRef.current[formField.id] || 0) + 1;
  customCounterRef.current[formField.id] = currentToken;
  promise.then((result) => {
    if (currentToken !== customCounterRef.current[formField.id]) {
      return;
    }
    if (result === null) {
      setFormValidity((prev) => {
        return removeValidationProperty(
          prev,
          [...path, formField.id],
          "custom"
        );
      });
      return;
    }
    if (typeof result === "string") {
      setFormValidity((prev) => {
        const newFormValidity = setValidityAtPath(
          prev,
          {
            custom: {
              type: "invalid",
              message: result
            }
          },
          [...path, formField.id]
        );
        return newFormValidity;
      });
      return;
    }
    setFormValidity((prev) => {
      const newFormValidity = setValidityAtPath(
        prev,
        {
          custom: {
            type: "invalid",
            message: (0, import_i18n24.__)("Validation could not be processed.")
          }
        },
        [...path, formField.id]
      );
      return newFormValidity;
    });
  }).catch((error2) => {
    if (currentToken !== customCounterRef.current[formField.id]) {
      return;
    }
    let errorMessage;
    if (error2 instanceof Error) {
      errorMessage = error2.message;
    } else {
      errorMessage = String(error2) || (0, import_i18n24.__)(
        "Unknown error when running custom validation asynchronously."
      );
    }
    setFormValidity((prev) => {
      const newFormValidity = setValidityAtPath(
        prev,
        {
          custom: {
            type: "invalid",
            message: errorMessage
          }
        },
        [...path, formField.id]
      );
      return newFormValidity;
    });
  });
}
function isFormFieldHidden(formField, item) {
  return formField.children.length === 0 && !!formField.field?.isVisible && !formField.field.isVisible(item);
}
function validateFormField(item, formField, promiseHandler) {
  if (isFormFieldHidden(formField, item)) {
    const { customCounterRef, elementsCounterRef } = promiseHandler;
    if (customCounterRef.current[formField.id]) {
      customCounterRef.current[formField.id] += 1;
    }
    if (elementsCounterRef.current[formField.id]) {
      elementsCounterRef.current[formField.id] += 1;
    }
    return void 0;
  }
  if (formField.field?.isValid.required && !formField.field.isValid.required.validate(item, formField.field)) {
    return {
      required: { type: "invalid" }
    };
  }
  if (formField.field?.isValid.pattern && !formField.field.isValid.pattern.validate(item, formField.field)) {
    return {
      pattern: {
        type: "invalid",
        message: (0, import_i18n24.__)("Value does not match the required pattern.")
      }
    };
  }
  if (formField.field?.isValid.min && !formField.field.isValid.min.validate(item, formField.field)) {
    return {
      min: {
        type: "invalid",
        message: (0, import_i18n24.__)("Value is below the minimum.")
      }
    };
  }
  if (formField.field?.isValid.max && !formField.field.isValid.max.validate(item, formField.field)) {
    return {
      max: {
        type: "invalid",
        message: (0, import_i18n24.__)("Value is above the maximum.")
      }
    };
  }
  if (formField.field?.isValid.minLength && !formField.field.isValid.minLength.validate(item, formField.field)) {
    return {
      minLength: {
        type: "invalid",
        message: (0, import_i18n24.__)("Value is too short.")
      }
    };
  }
  if (formField.field?.isValid.maxLength && !formField.field.isValid.maxLength.validate(item, formField.field)) {
    return {
      maxLength: {
        type: "invalid",
        message: (0, import_i18n24.__)("Value is too long.")
      }
    };
  }
  if (formField.field?.isValid.elements && formField.field.hasElements && !formField.field.getElements && Array.isArray(formField.field.elements) && !formField.field.isValid.elements.validate(item, formField.field)) {
    return {
      elements: {
        type: "invalid",
        message: (0, import_i18n24.__)("Value must be one of the elements.")
      }
    };
  }
  let customError;
  if (!!formField.field && formField.field.isValid.custom) {
    try {
      const value = formField.field.getValue({ item });
      customError = formField.field.isValid.custom(
        (0, import_deepmerge.default)(
          item,
          formField.field.setValue({
            item,
            value
          })
        ),
        formField.field
      );
    } catch (error2) {
      let errorMessage;
      if (error2 instanceof Error) {
        errorMessage = error2.message;
      } else {
        errorMessage = String(error2) || (0, import_i18n24.__)("Unknown error when running custom validation.");
      }
      return {
        custom: {
          type: "invalid",
          message: errorMessage
        }
      };
    }
  }
  if (typeof customError === "string") {
    return {
      custom: {
        type: "invalid",
        message: customError
      }
    };
  }
  const fieldValidity = {};
  if (!!formField.field && formField.field.isValid.elements && formField.field.hasElements && typeof formField.field.getElements === "function") {
    handleElementsValidationAsync(
      formField.field.getElements(),
      formField,
      promiseHandler
    );
    fieldValidity.elements = {
      type: "validating",
      message: (0, import_i18n24.__)("Validating\u2026")
    };
  }
  if (customError instanceof Promise) {
    handleCustomValidationAsync(customError, formField, promiseHandler);
    fieldValidity.custom = {
      type: "validating",
      message: (0, import_i18n24.__)("Validating\u2026")
    };
  }
  if (Object.keys(fieldValidity).length > 0) {
    return fieldValidity;
  }
  if (formField.children.length > 0) {
    const result = {};
    formField.children.forEach((child) => {
      result[child.id] = validateFormField(item, child, {
        ...promiseHandler,
        path: [...promiseHandler.path, formField.id, "children"]
      });
    });
    const filteredResult = {};
    Object.entries(result).forEach(([key, value]) => {
      if (value !== void 0) {
        filteredResult[key] = value;
      }
    });
    if (Object.keys(filteredResult).length === 0) {
      return void 0;
    }
    return {
      children: filteredResult
    };
  }
  return void 0;
}
function getFormFieldValue(formField, item) {
  const fieldValue = formField?.field?.getValue({ item });
  const isHidden = isFormFieldHidden(formField, item);
  if (formField.children.length === 0) {
    return { value: fieldValue, isHidden };
  }
  const childrenValues = formField.children.map(
    (child) => getFormFieldValue(child, item)
  );
  return {
    value: fieldValue,
    isHidden,
    children: childrenValues
  };
}
function useFormValidity(item, fields, form) {
  const [formValidity, setFormValidity] = (0, import_element73.useState)();
  const customCounterRef = (0, import_element73.useRef)({});
  const elementsCounterRef = (0, import_element73.useRef)({});
  const previousValuesRef = (0, import_element73.useRef)({});
  const validate = (0, import_element73.useCallback)(() => {
    const promiseHandler = {
      customCounterRef,
      elementsCounterRef,
      setFormValidity,
      path: [],
      item
    };
    const formFieldsToValidate = getFormFieldsToValidate(form, fields);
    if (formFieldsToValidate.length === 0) {
      setFormValidity(void 0);
      return;
    }
    const newFormValidity = {};
    const untouchedFields = [];
    formFieldsToValidate.forEach((formField) => {
      const value = getFormFieldValue(formField, item);
      if (previousValuesRef.current.hasOwnProperty(formField.id) && (0, import_es6.default)(
        previousValuesRef.current[formField.id],
        value
      )) {
        untouchedFields.push(formField.id);
        return;
      }
      previousValuesRef.current[formField.id] = value;
      const fieldValidity = validateFormField(
        item,
        formField,
        promiseHandler
      );
      if (fieldValidity !== void 0) {
        newFormValidity[formField.id] = fieldValidity;
      }
    });
    setFormValidity((existingFormValidity) => {
      let validity = {
        ...existingFormValidity,
        ...newFormValidity
      };
      const fieldsToKeep = [
        ...untouchedFields,
        ...Object.keys(newFormValidity)
      ];
      Object.keys(validity).forEach((key) => {
        if (validity && !fieldsToKeep.includes(key)) {
          delete validity[key];
        }
      });
      if (Object.keys(validity).length === 0) {
        validity = void 0;
      }
      const areEqual = (0, import_es6.default)(existingFormValidity, validity);
      if (areEqual) {
        return existingFormValidity;
      }
      return validity;
    });
  }, [item, fields, form]);
  (0, import_element73.useEffect)(() => {
    validate();
  }, [validate]);
  return {
    validity: formValidity,
    isValid: isFormValid(formValidity)
  };
}
var use_form_validity_default = useFormValidity;

// packages/dataviews/build-module/hooks/use-reveal-validity.mjs
var import_element74 = __toESM(require_element(), 1);
function useRevealValidity(ref, shouldReveal) {
  const revealValidity = (0, import_element74.useCallback)(() => {
    const inputs = ref.current?.querySelectorAll("input, textarea, select");
    let revealedCount = 0;
    inputs?.forEach((input) => {
      if (input.willValidate && !input.validity.valid) {
        revealedCount++;
        input.dispatchEvent(
          new Event("invalid", { cancelable: true })
        );
      }
    });
    return revealedCount;
  }, [ref]);
  (0, import_element74.useEffect)(() => {
    if (shouldReveal) {
      revealValidity();
    }
  }, [shouldReveal, revealValidity]);
  return revealValidity;
}

// packages/dataviews/build-module/components/dataform-layouts/panel/utils/use-field-from-form-field.mjs
var import_element75 = __toESM(require_element(), 1);

// packages/dataviews/build-module/components/dataform-layouts/get-summary-fields.mjs
function extractSummaryIds(summary) {
  if (Array.isArray(summary)) {
    return summary.map(
      (item) => typeof item === "string" ? item : item.id
    );
  }
  return [];
}
var getSummaryFields = (summaryField, fields) => {
  if (Array.isArray(summaryField) && summaryField.length > 0) {
    const summaryIds = extractSummaryIds(summaryField);
    return summaryIds.map(
      (summaryId) => fields.find((_field) => _field.id === summaryId)
    ).filter((_field) => _field !== void 0);
  }
  return [];
};

// packages/dataviews/build-module/components/dataform-layouts/panel/utils/use-field-from-form-field.mjs
var getFieldDefinition = (field, fields) => {
  const fieldDefinition = fields.find((_field) => _field.id === field.id);
  if (!fieldDefinition) {
    return fields.find((_field) => {
      if (!!field.children) {
        const simpleChildren = field.children.filter(
          (child) => !child.children
        );
        if (simpleChildren.length === 0) {
          return false;
        }
        return _field.id === simpleChildren[0].id;
      }
      return _field.id === field.id;
    });
  }
  return fieldDefinition;
};
function useFieldFromFormField(field) {
  const { fields } = (0, import_element75.useContext)(dataform_context_default);
  const layout = field.layout;
  const summaryFields = getSummaryFields(layout.summary, fields);
  const fieldDefinition = getFieldDefinition(field, fields);
  const fieldLabel = !!field.children ? field.label : fieldDefinition?.label;
  if (summaryFields.length === 0) {
    return {
      summaryFields: fieldDefinition ? [fieldDefinition] : [],
      fieldDefinition,
      fieldLabel
    };
  }
  return {
    summaryFields,
    fieldDefinition,
    fieldLabel
  };
}
var use_field_from_form_field_default = useFieldFromFormField;

// packages/dataviews/build-module/components/dataform-layouts/panel/modal.mjs
var import_jsx_runtime93 = __toESM(require_jsx_runtime(), 1);
function ModalContent({
  data,
  field,
  onChange,
  fieldLabel,
  onClose,
  touched
}) {
  const { openAs } = field.layout;
  const { applyLabel, cancelLabel } = openAs;
  const { fields } = (0, import_element76.useContext)(dataform_context_default);
  const [changes, setChanges] = (0, import_element76.useState)({});
  const modalData = (0, import_element76.useMemo)(() => {
    return (0, import_deepmerge2.default)(data, changes, {
      arrayMerge: (target, source) => source
    });
  }, [data, changes]);
  const form = (0, import_element76.useMemo)(
    () => ({
      layout: DEFAULT_LAYOUT,
      fields: !!field.children ? field.children : (
        // If not explicit children return the field id itself.
        [{ id: field.id, layout: DEFAULT_LAYOUT }]
      )
    }),
    [field]
  );
  const fieldsAsFieldType = fields.map((f2) => ({
    ...f2,
    Edit: f2.Edit === null ? void 0 : f2.Edit,
    isValid: {
      required: f2.isValid.required?.constraint,
      elements: f2.isValid.elements?.constraint,
      min: f2.isValid.min?.constraint,
      max: f2.isValid.max?.constraint,
      pattern: f2.isValid.pattern?.constraint,
      minLength: f2.isValid.minLength?.constraint,
      maxLength: f2.isValid.maxLength?.constraint
    }
  }));
  const { validity } = use_form_validity_default(modalData, fieldsAsFieldType, form);
  const onApply = () => {
    onChange(changes);
    onClose();
  };
  const handleOnChange = (newValue) => {
    setChanges(
      (prev) => (0, import_deepmerge2.default)(prev, newValue, {
        arrayMerge: (target, source) => source
      })
    );
  };
  const focusOnMountRef = (0, import_compose12.useFocusOnMount)("firstInputElement");
  const contentRef = (0, import_element76.useRef)(null);
  const mergedRef = (0, import_compose12.useMergeRefs)([focusOnMountRef, contentRef]);
  useRevealValidity(contentRef, touched);
  return /* @__PURE__ */ (0, import_jsx_runtime93.jsxs)(
    import_components27.Modal,
    {
      className: "dataforms-layouts-panel__modal",
      onRequestClose: onClose,
      isFullScreen: false,
      title: fieldLabel,
      size: "medium",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime93.jsx)("div", { ref: mergedRef, children: /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(
          DataFormLayout,
          {
            data: modalData,
            form,
            onChange: handleOnChange,
            validity,
            children: (FieldLayout, childField, childFieldValidity, markWhenOptional) => /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(
              FieldLayout,
              {
                data: modalData,
                field: childField,
                onChange: handleOnChange,
                hideLabelFromVision: form.fields.length < 2,
                markWhenOptional,
                validity: childFieldValidity
              },
              childField.id
            )
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime93.jsxs)(
          Stack,
          {
            direction: "row",
            className: "dataforms-layouts-panel__modal-footer",
            gap: "md",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(import_components27.__experimentalSpacer, { style: { flex: 1 } }),
              /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(
                import_components27.Button,
                {
                  variant: "tertiary",
                  onClick: onClose,
                  __next40pxDefaultSize: true,
                  children: cancelLabel
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(
                import_components27.Button,
                {
                  variant: "primary",
                  onClick: onApply,
                  __next40pxDefaultSize: true,
                  children: applyLabel
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function PanelModal({
  data,
  field,
  onChange,
  validity
}) {
  const [touched, setTouched] = (0, import_element76.useState)(false);
  const [isOpen, setIsOpen] = (0, import_element76.useState)(false);
  const { fieldDefinition, fieldLabel, summaryFields } = use_field_from_form_field_default(field);
  if (!fieldDefinition) {
    return null;
  }
  const handleClose = () => {
    setIsOpen(false);
    setTouched(true);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime93.jsxs)(import_jsx_runtime93.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(
      SummaryButton,
      {
        data,
        field,
        fieldLabel,
        summaryFields,
        validity,
        touched,
        disabled: fieldDefinition.readOnly === true,
        onClick: () => setIsOpen(true),
        isOpen
      }
    ),
    isOpen && /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(
      ModalContent,
      {
        data,
        field,
        onChange,
        fieldLabel: fieldLabel ?? "",
        onClose: handleClose,
        touched
      }
    )
  ] });
}
var modal_default = PanelModal;

// packages/dataviews/build-module/components/dataform-layouts/panel/dropdown.mjs
var import_components28 = __toESM(require_components(), 1);
var import_i18n25 = __toESM(require_i18n(), 1);
var import_element77 = __toESM(require_element(), 1);
var import_compose13 = __toESM(require_compose(), 1);
var import_jsx_runtime94 = __toESM(require_jsx_runtime(), 1);
function DropdownHeader({
  title,
  onClose
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(
    Stack,
    {
      direction: "column",
      className: "dataforms-layouts-panel__dropdown-header",
      gap: "lg",
      children: /* @__PURE__ */ (0, import_jsx_runtime94.jsxs)(Stack, { direction: "row", gap: "sm", align: "center", children: [
        title && /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(import_components28.__experimentalHeading, { level: 2, size: 13, children: title }),
        /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(import_components28.__experimentalSpacer, { style: { flex: 1 } }),
        onClose && /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(
          import_components28.Button,
          {
            label: (0, import_i18n25.__)("Close"),
            icon: close_small_default,
            onClick: onClose,
            size: "small"
          }
        )
      ] })
    }
  );
}
function DropdownContentWithValidation({
  touched,
  children
}) {
  const ref = (0, import_element77.useRef)(null);
  useRevealValidity(ref, touched);
  return /* @__PURE__ */ (0, import_jsx_runtime94.jsx)("div", { ref, children });
}
function PanelDropdown({
  data,
  field,
  onChange,
  validity
}) {
  const [touched, setTouched] = (0, import_element77.useState)(false);
  const [popoverAnchor, setPopoverAnchor] = (0, import_element77.useState)(
    null
  );
  const popoverProps = (0, import_element77.useMemo)(
    () => ({
      // Anchor the popover to the middle of the entire row so that it doesn't
      // move around when the label changes.
      anchor: popoverAnchor,
      placement: "left-start",
      offset: 36,
      shift: true
    }),
    [popoverAnchor]
  );
  const [dialogRef, dialogProps] = (0, import_compose13.__experimentalUseDialog)({
    focusOnMount: "firstInputElement"
  });
  const form = (0, import_element77.useMemo)(
    () => ({
      layout: DEFAULT_LAYOUT,
      fields: !!field.children ? field.children : (
        // If not explicit children return the field id itself.
        [{ id: field.id, layout: DEFAULT_LAYOUT }]
      )
    }),
    [field]
  );
  const formValidity = (0, import_element77.useMemo)(() => {
    if (validity === void 0) {
      return void 0;
    }
    if (!!field.children) {
      return validity?.children;
    }
    return { [field.id]: validity };
  }, [validity, field]);
  const { fieldDefinition, fieldLabel, summaryFields } = use_field_from_form_field_default(field);
  if (!fieldDefinition) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(
    "div",
    {
      ref: setPopoverAnchor,
      className: "dataforms-layouts-panel__field-dropdown-anchor",
      children: /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(
        import_components28.Dropdown,
        {
          contentClassName: "dataforms-layouts-panel__field-dropdown",
          popoverProps,
          focusOnMount: false,
          onToggle: (willOpen) => {
            if (!willOpen) {
              setTouched(true);
            }
          },
          renderToggle: ({ isOpen, onToggle }) => /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(
            SummaryButton,
            {
              data,
              field,
              fieldLabel,
              summaryFields,
              validity,
              touched,
              disabled: fieldDefinition.readOnly === true,
              isOpen,
              onClick: onToggle
            }
          ),
          renderContent: ({ onClose }) => /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(DropdownContentWithValidation, { touched, children: /* @__PURE__ */ (0, import_jsx_runtime94.jsxs)("div", { ref: dialogRef, ...dialogProps, children: [
            /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(
              DropdownHeader,
              {
                title: fieldLabel,
                onClose
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(
              DataFormLayout,
              {
                data,
                form,
                onChange,
                validity: formValidity,
                children: (FieldLayout, childField, childFieldValidity, markWhenOptional) => /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(
                  FieldLayout,
                  {
                    data,
                    field: childField,
                    onChange,
                    hideLabelFromVision: (form?.fields ?? []).length < 2,
                    markWhenOptional,
                    validity: childFieldValidity
                  },
                  childField.id
                )
              }
            )
          ] }) })
        }
      )
    }
  );
}
var dropdown_default = PanelDropdown;

// packages/dataviews/build-module/components/dataform-layouts/panel/index.mjs
var import_jsx_runtime95 = __toESM(require_jsx_runtime(), 1);
function FormPanelField({
  data,
  field,
  onChange,
  validity
}) {
  const layout = field.layout;
  if (layout.openAs.type === "modal") {
    return /* @__PURE__ */ (0, import_jsx_runtime95.jsx)(
      modal_default,
      {
        data,
        field,
        onChange,
        validity
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime95.jsx)(
    dropdown_default,
    {
      data,
      field,
      onChange,
      validity
    }
  );
}

// packages/dataviews/build-module/components/dataform-layouts/card/index.mjs
var import_element78 = __toESM(require_element(), 1);
var import_compose14 = __toESM(require_compose(), 1);
import { speak as speak4 } from "@wordpress/a11y";

// packages/dataviews/build-module/components/dataform-layouts/get-validation-message.mjs
var import_i18n26 = __toESM(require_i18n(), 1);
function countInvalidFields(validity) {
  if (!validity) {
    return 0;
  }
  let count = 0;
  const validityRules = Object.keys(validity).filter(
    (key) => key !== "children"
  );
  for (const key of validityRules) {
    const rule = validity[key];
    if (rule?.type === "invalid") {
      count++;
    }
  }
  if (validity.children) {
    for (const childValidity of Object.values(validity.children)) {
      count += countInvalidFields(childValidity);
    }
  }
  return count;
}
function getValidationMessage(validity) {
  const invalidCount = countInvalidFields(validity);
  if (invalidCount === 0) {
    return void 0;
  }
  return (0, import_i18n26.sprintf)(
    /* translators: %d: Number of fields that need attention */
    (0, import_i18n26._n)(
      "%d field needs attention",
      "%d fields need attention",
      invalidCount
    ),
    invalidCount
  );
}

// packages/dataviews/build-module/components/dataform-layouts/validation-badge.mjs
var import_jsx_runtime96 = __toESM(require_jsx_runtime(), 1);
function ValidationBadge({
  validity
}) {
  const message2 = getValidationMessage(validity);
  if (!message2) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime96.jsx)(Badge, { intent: "high", children: message2 });
}

// packages/dataviews/build-module/components/dataform-layouts/card/index.mjs
var import_jsx_runtime97 = __toESM(require_jsx_runtime(), 1);
function isSummaryFieldVisible(summaryField, summaryConfig, isOpen) {
  if (!summaryConfig || Array.isArray(summaryConfig) && summaryConfig.length === 0) {
    return false;
  }
  const summaryConfigArray = Array.isArray(summaryConfig) ? summaryConfig : [summaryConfig];
  const fieldConfig = summaryConfigArray.find((config) => {
    if (typeof config === "string") {
      return config === summaryField.id;
    }
    if (typeof config === "object" && "id" in config) {
      return config.id === summaryField.id;
    }
    return false;
  });
  if (!fieldConfig) {
    return false;
  }
  if (typeof fieldConfig === "string") {
    return true;
  }
  if (typeof fieldConfig === "object" && "visibility" in fieldConfig) {
    return fieldConfig.visibility === "always" || fieldConfig.visibility === "when-collapsed" && !isOpen;
  }
  return true;
}
function HeaderContent({
  data,
  fields,
  label,
  layout,
  isOpen,
  touched,
  validity
}) {
  const summaryFields = getSummaryFields(layout.summary, fields);
  const visibleSummaryFields = summaryFields.filter(
    (summaryField) => isSummaryFieldVisible(summaryField, layout.summary, isOpen)
  );
  const hasBadge = touched && layout.isCollapsible;
  const hasSummary = visibleSummaryFields.length > 0 && layout.withHeader;
  return /* @__PURE__ */ (0, import_jsx_runtime97.jsxs)(
    Stack,
    {
      align: "center",
      justify: "space-between",
      className: "dataforms-layouts-card__field-header-content",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(card_exports.Title, { children: label }),
        (hasBadge || hasSummary) && /* @__PURE__ */ (0, import_jsx_runtime97.jsxs)(collapsible_card_exports.HeaderDescription, { className: "dataforms-layouts-card__field-header-content-description", children: [
          hasBadge && /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(ValidationBadge, { validity }),
          hasSummary && /* @__PURE__ */ (0, import_jsx_runtime97.jsx)("div", { className: "dataforms-layouts-card__field-summary", children: visibleSummaryFields.map((summaryField) => /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(
            summaryField.render,
            {
              item: data,
              field: summaryField
            },
            summaryField.id
          )) })
        ] })
      ]
    }
  );
}
function BodyContent({
  data,
  field,
  form,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity,
  withHeader
}) {
  if (field.children) {
    return /* @__PURE__ */ (0, import_jsx_runtime97.jsxs)(import_jsx_runtime97.Fragment, { children: [
      field.description && /* @__PURE__ */ (0, import_jsx_runtime97.jsx)("div", { className: "dataforms-layouts-card__field-description", children: field.description }),
      /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(
        DataFormLayout,
        {
          data,
          form,
          onChange,
          validity: validity?.children
        }
      )
    ] });
  }
  const SingleFieldLayout = getFormFieldLayout("regular")?.component;
  if (!SingleFieldLayout) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(
    SingleFieldLayout,
    {
      data,
      field,
      onChange,
      hideLabelFromVision: hideLabelFromVision || withHeader,
      markWhenOptional,
      validity
    }
  );
}
function FormCardField({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const { fields } = (0, import_element78.useContext)(dataform_context_default);
  const layout = field.layout;
  const contentRef = (0, import_element78.useRef)(null);
  const hasFocusedContentRef = (0, import_element78.useRef)(false);
  const form = (0, import_element78.useMemo)(
    () => ({
      layout: DEFAULT_LAYOUT,
      fields: field.children ?? []
    }),
    [field]
  );
  const { isOpened, isCollapsible } = layout;
  const [isOpen, setIsOpen] = (0, import_element78.useState)(isOpened);
  const [touched, setTouched] = (0, import_element78.useState)(false);
  (0, import_element78.useEffect)(() => {
    setIsOpen(isOpened);
  }, [isOpened]);
  const handleOpenChange = (0, import_element78.useCallback)((open) => {
    if (!open) {
      setTouched(true);
    }
    setIsOpen(open);
  }, []);
  const revealValidity = useRevealValidity(
    contentRef,
    (isCollapsible ? isOpen : true) && touched
  );
  const handleContentFocus = (0, import_element78.useCallback)(() => {
    hasFocusedContentRef.current = true;
  }, []);
  const handleFocusOutside = (0, import_element78.useCallback)(() => {
    if (!hasFocusedContentRef.current) {
      return;
    }
    setTouched(true);
    if (isCollapsible && !isOpen) {
      return;
    }
    const revealedCount = revealValidity();
    const message2 = getValidationMessage(validity);
    if (revealedCount > 0 && message2) {
      speak4(message2, "polite");
    }
  }, [isCollapsible, isOpen, revealValidity, validity]);
  const focusOutsideProps = (0, import_compose14.__experimentalUseFocusOutside)(handleFocusOutside);
  let label = field.label;
  let withHeader;
  if (field.children) {
    withHeader = !!label && layout.withHeader;
  } else {
    const fieldDefinition = fields.find(
      (fieldDef) => fieldDef.id === field.id
    );
    if (!fieldDefinition || !fieldDefinition.Edit) {
      return null;
    }
    label = fieldDefinition.label;
    withHeader = !!label && layout.withHeader;
  }
  const bodyContent = /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(
    BodyContent,
    {
      data,
      field,
      form,
      onChange,
      hideLabelFromVision,
      markWhenOptional,
      validity,
      withHeader
    }
  );
  const headerContent = /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(
    HeaderContent,
    {
      data,
      fields,
      label,
      layout,
      isOpen: isCollapsible ? !!isOpen : true,
      touched,
      validity
    }
  );
  if (withHeader && isCollapsible) {
    return /* @__PURE__ */ (0, import_jsx_runtime97.jsxs)(
      collapsible_card_exports.Root,
      {
        className: "dataforms-layouts-card__field",
        open: isOpen,
        onOpenChange: handleOpenChange,
        ...focusOutsideProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(collapsible_card_exports.Header, { children: headerContent }),
          /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(
            collapsible_card_exports.Content,
            {
              ref: contentRef,
              onFocus: handleContentFocus,
              children: bodyContent
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime97.jsxs)(
    card_exports.Root,
    {
      className: "dataforms-layouts-card__field",
      ...focusOutsideProps,
      children: [
        withHeader && /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(card_exports.Header, { children: headerContent }),
        /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(card_exports.Content, { ref: contentRef, onFocus: handleContentFocus, children: bodyContent })
      ]
    }
  );
}

// packages/dataviews/build-module/components/dataform-layouts/row/index.mjs
var import_components29 = __toESM(require_components(), 1);
var import_jsx_runtime98 = __toESM(require_jsx_runtime(), 1);
function Header5({ title }) {
  return /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(
    Stack,
    {
      direction: "column",
      className: "dataforms-layouts-row__header",
      gap: "lg",
      children: /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(Stack, { direction: "row", align: "center", children: /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(import_components29.__experimentalHeading, { level: 2, size: 13, children: title }) })
    }
  );
}
var EMPTY_WRAPPER = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(import_jsx_runtime98.Fragment, { children });
function FormRowField({
  data,
  field,
  onChange,
  hideLabelFromVision,
  markWhenOptional,
  validity
}) {
  const layout = field.layout;
  if (!!field.children) {
    const form = {
      layout: DEFAULT_LAYOUT,
      fields: field.children
    };
    return /* @__PURE__ */ (0, import_jsx_runtime98.jsxs)("div", { className: "dataforms-layouts-row__field", children: [
      !hideLabelFromVision && field.label && /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(Header5, { title: field.label }),
      /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(Stack, { direction: "row", align: layout.alignment, gap: "lg", children: /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(
        DataFormLayout,
        {
          data,
          form,
          onChange,
          validity: validity?.children,
          as: EMPTY_WRAPPER,
          children: (FieldLayout, childField, childFieldValidity) => /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(
            "div",
            {
              className: "dataforms-layouts-row__field-control",
              style: layout.styles[childField.id],
              children: /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(
                FieldLayout,
                {
                  data,
                  field: childField,
                  onChange,
                  hideLabelFromVision,
                  markWhenOptional,
                  validity: childFieldValidity
                }
              )
            },
            childField.id
          )
        }
      ) })
    ] });
  }
  const RegularLayout = getFormFieldLayout("regular")?.component;
  if (!RegularLayout) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(import_jsx_runtime98.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime98.jsx)("div", { className: "dataforms-layouts-row__field-control", children: /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(
    RegularLayout,
    {
      data,
      field,
      onChange,
      markWhenOptional,
      validity
    }
  ) }) });
}

// packages/dataviews/build-module/components/dataform-layouts/details/index.mjs
var import_element79 = __toESM(require_element(), 1);
var import_i18n27 = __toESM(require_i18n(), 1);
var import_compose15 = __toESM(require_compose(), 1);
import { speak as speak5 } from "@wordpress/a11y";
var import_jsx_runtime99 = __toESM(require_jsx_runtime(), 1);
function FormDetailsField({
  data,
  field,
  onChange,
  validity
}) {
  const { fields } = (0, import_element79.useContext)(dataform_context_default);
  const detailsRef = (0, import_element79.useRef)(null);
  const contentRef = (0, import_element79.useRef)(null);
  const hasFocusedContentRef = (0, import_element79.useRef)(false);
  const [touched, setTouched] = (0, import_element79.useState)(false);
  const [isOpen, setIsOpen] = (0, import_element79.useState)(false);
  const form = (0, import_element79.useMemo)(
    () => ({
      layout: DEFAULT_LAYOUT,
      fields: field.children ?? []
    }),
    [field]
  );
  (0, import_element79.useEffect)(() => {
    const details = detailsRef.current;
    if (!details) {
      return;
    }
    const handleToggle = () => {
      const nowOpen = details.open;
      if (!nowOpen) {
        setTouched(true);
      }
      setIsOpen(nowOpen);
    };
    details.addEventListener("toggle", handleToggle);
    return () => {
      details.removeEventListener("toggle", handleToggle);
    };
  }, []);
  const revealValidity = useRevealValidity(contentRef, isOpen && touched);
  const handleContentFocus = (0, import_element79.useCallback)(() => {
    hasFocusedContentRef.current = true;
  }, []);
  const handleFocusOutside = (0, import_element79.useCallback)(() => {
    if (!hasFocusedContentRef.current) {
      return;
    }
    setTouched(true);
    if (!detailsRef.current?.open) {
      return;
    }
    const revealedCount = revealValidity();
    const message2 = getValidationMessage(validity);
    if (revealedCount > 0 && message2) {
      speak5(message2, "polite");
    }
  }, [revealValidity, validity]);
  const focusOutsideProps = (0, import_compose15.__experimentalUseFocusOutside)(handleFocusOutside);
  if (!field.children) {
    return null;
  }
  const summaryFieldId = field.layout.summary ?? "";
  const summaryField = summaryFieldId ? fields.find((fieldDef) => fieldDef.id === summaryFieldId) : void 0;
  let summaryContent;
  if (summaryField && summaryField.render) {
    summaryContent = /* @__PURE__ */ (0, import_jsx_runtime99.jsx)(summaryField.render, { item: data, field: summaryField });
  } else {
    summaryContent = field.label || (0, import_i18n27.__)("More details");
  }
  return /* @__PURE__ */ (0, import_jsx_runtime99.jsxs)(
    "details",
    {
      ref: detailsRef,
      className: "dataforms-layouts-details__details",
      ...focusOutsideProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime99.jsx)("summary", { className: "dataforms-layouts-details__summary", children: /* @__PURE__ */ (0, import_jsx_runtime99.jsxs)(
          Stack,
          {
            direction: "row",
            align: "center",
            gap: "md",
            className: "dataforms-layouts-details__summary-content",
            children: [
              summaryContent,
              touched && /* @__PURE__ */ (0, import_jsx_runtime99.jsx)(ValidationBadge, { validity })
            ]
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime99.jsx)(
          "div",
          {
            ref: contentRef,
            className: "dataforms-layouts-details__content",
            onFocus: handleContentFocus,
            children: /* @__PURE__ */ (0, import_jsx_runtime99.jsx)(
              DataFormLayout,
              {
                data,
                form,
                onChange,
                validity: validity?.children
              }
            )
          }
        )
      ]
    }
  );
}

// packages/dataviews/build-module/components/dataform-layouts/index.mjs
var import_jsx_runtime100 = __toESM(require_jsx_runtime(), 1);
var FORM_FIELD_LAYOUTS = [
  {
    type: "regular",
    component: FormRegularField,
    wrapper: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime100.jsx)(
      Stack,
      {
        direction: "column",
        className: "dataforms-layouts__wrapper",
        gap: "lg",
        children
      }
    )
  },
  {
    type: "panel",
    component: FormPanelField,
    wrapper: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime100.jsx)(
      Stack,
      {
        direction: "column",
        className: "dataforms-layouts__wrapper",
        gap: "md",
        children
      }
    )
  },
  {
    type: "card",
    component: FormCardField,
    wrapper: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime100.jsx)(
      Stack,
      {
        direction: "column",
        className: "dataforms-layouts__wrapper",
        gap: "xl",
        children
      }
    )
  },
  {
    type: "row",
    component: FormRowField,
    wrapper: ({
      children,
      layout
    }) => /* @__PURE__ */ (0, import_jsx_runtime100.jsx)(
      Stack,
      {
        direction: "column",
        className: "dataforms-layouts__wrapper",
        gap: "lg",
        children: /* @__PURE__ */ (0, import_jsx_runtime100.jsx)("div", { className: "dataforms-layouts-row__field", children: /* @__PURE__ */ (0, import_jsx_runtime100.jsx)(
          Stack,
          {
            direction: "row",
            gap: "lg",
            align: layout.alignment,
            children
          }
        ) })
      }
    )
  },
  {
    type: "details",
    component: FormDetailsField
  }
];
function getFormFieldLayout(type) {
  return FORM_FIELD_LAYOUTS.find((layout) => layout.type === type);
}

// packages/dataviews/build-module/components/dataform-layouts/data-form-layout.mjs
var import_jsx_runtime101 = __toESM(require_jsx_runtime(), 1);
var DEFAULT_WRAPPER = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime101.jsx)(Stack, { direction: "column", className: "dataforms-layouts__wrapper", gap: "lg", children });
function DataFormLayout({
  data,
  form,
  onChange,
  validity,
  children,
  as
}) {
  const { fields: fieldDefinitions } = (0, import_element80.useContext)(dataform_context_default);
  const markWhenOptional = (0, import_element80.useMemo)(() => {
    const requiredCount = fieldDefinitions.filter(
      (f2) => !!f2.isValid?.required
    ).length;
    const optionalCount = fieldDefinitions.length - requiredCount;
    return requiredCount > optionalCount;
  }, [fieldDefinitions]);
  function getFieldDefinition2(field) {
    return fieldDefinitions.find(
      (fieldDefinition) => fieldDefinition.id === field.id
    );
  }
  const Wrapper = as ?? getFormFieldLayout(form.layout.type)?.wrapper ?? DEFAULT_WRAPPER;
  return /* @__PURE__ */ (0, import_jsx_runtime101.jsx)(Wrapper, { layout: form.layout, children: form.fields.map((formField) => {
    const FieldLayout = getFormFieldLayout(formField.layout.type)?.component;
    if (!FieldLayout) {
      return null;
    }
    const fieldDefinition = !formField.children ? getFieldDefinition2(formField) : void 0;
    if (fieldDefinition && fieldDefinition.isVisible && !fieldDefinition.isVisible(data)) {
      return null;
    }
    if (children) {
      return children(
        FieldLayout,
        formField,
        validity?.[formField.id],
        markWhenOptional
      );
    }
    return /* @__PURE__ */ (0, import_jsx_runtime101.jsx)(
      FieldLayout,
      {
        data,
        field: formField,
        onChange,
        markWhenOptional,
        validity: validity?.[formField.id]
      },
      formField.id
    );
  }) });
}

// packages/dataviews/build-module/dataform/index.mjs
var import_jsx_runtime102 = __toESM(require_jsx_runtime(), 1);
function DataForm({
  data,
  form,
  fields,
  onChange,
  validity
}) {
  const normalizedForm = (0, import_element81.useMemo)(() => normalize_form_default(form), [form]);
  const normalizedFields = (0, import_element81.useMemo)(
    () => normalizeFields(fields),
    [fields]
  );
  if (!form.fields) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime102.jsx)(DataFormProvider, { fields: normalizedFields, children: /* @__PURE__ */ (0, import_jsx_runtime102.jsx)(
    DataFormLayout,
    {
      data,
      form: normalizedForm,
      onChange,
      validity
    }
  ) });
}

// routes/experiments-home/stage.tsx
var import_element82 = __toESM(require_element());
var import_i18n28 = __toESM(require_i18n());
var import_notices = __toESM(require_notices());

// routes/experiments-home/style.scss
if (typeof document !== "undefined" && true && !document.head.querySelector("style[data-wp-hash='97a1d43e1a']")) {
  const style = document.createElement("style");
  style.setAttribute("data-wp-hash", "97a1d43e1a");
  style.appendChild(document.createTextNode(".experiments-page__container{box-sizing:border-box;margin-inline:auto;max-width:680px;padding:24px;width:100%}"));
  document.head.appendChild(style);
}

// routes/experiments-home/api.ts
var import_api_fetch = __toESM(require_api_fetch());
async function fetchExperiments() {
  const response = await (0, import_api_fetch.default)({
    path: "/wp/v2/settings",
    method: "OPTIONS"
  });
  const properties = response?.schema?.properties?.["gutenberg-experiments"]?.properties ?? {};
  return Object.entries(properties).map(([id, schema]) => ({
    id,
    label: schema.title ?? id,
    description: schema.description ?? "",
    group: schema.group ?? "other",
    groupLabel: schema.group_label ?? ""
  }));
}

// routes/experiments-home/stage.tsx
var import_jsx_runtime103 = __toESM(require_jsx_runtime());
function ExperimentsPage() {
  const [experiments, setExperiments] = (0, import_element82.useState)(
    null
  );
  (0, import_element82.useEffect)(() => {
    fetchExperiments().then(setExperiments).catch(() => setExperiments([]));
  }, []);
  const {
    editedRecord,
    save: saveSettings,
    edit
  } = (0, import_core_data.useEntityRecord)("root", "site", void 0);
  const siteSettings = editedRecord;
  const { createSuccessNotice, createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  const gutenbergExperiments = (0, import_element82.useMemo)(
    () => siteSettings?.["gutenberg-experiments"] || {},
    [siteSettings]
  );
  const settings = (0, import_element82.useMemo)(() => {
    const combined = {};
    for (const exp of experiments ?? []) {
      combined[exp.id] = false;
    }
    for (const [key, value] of Object.entries(gutenbergExperiments)) {
      combined[key] = Boolean(value);
    }
    const activeTemplates = siteSettings?.active_templates;
    combined.active_templates = typeof activeTemplates === "object" && activeTemplates !== null;
    return combined;
  }, [experiments, gutenbergExperiments, siteSettings]);
  const setSettings = async (values) => {
    const [changedId] = Object.keys(values);
    const changedExperiment = (experiments ?? []).find(
      (exp) => exp.id === changedId
    );
    const editPayload = {};
    if ("active_templates" in values) {
      editPayload.active_templates = values.active_templates ? {} : null;
      delete values.active_templates;
    }
    if (Object.keys(values).length > 0) {
      editPayload["gutenberg-experiments"] = {
        ...gutenbergExperiments,
        ...values
      };
    }
    const groupLabel = changedExperiment?.groupLabel ?? "";
    edit(editPayload);
    try {
      await saveSettings();
      createSuccessNotice(
        (0, import_i18n28.sprintf)(
          /* translators: %s: Experiment group name, e.g. "Blocks". */
          (0, import_i18n28.__)("%s settings updated."),
          groupLabel
        ),
        { type: "snackbar" }
      );
    } catch {
      createErrorNotice(
        (0, import_i18n28.sprintf)(
          /* translators: %s: Experiment group name, e.g. "Blocks". */
          (0, import_i18n28.__)("Failed to update %s settings."),
          groupLabel
        ),
        { type: "snackbar" }
      );
    }
  };
  const fields = (0, import_element82.useMemo)(() => {
    if (!experiments?.length) {
      return [];
    }
    return experiments.map((experiment) => ({
      Edit: "toggle",
      id: experiment.id,
      label: experiment.label,
      description: experiment.description,
      type: "boolean"
    }));
  }, [experiments]);
  const formFields = (0, import_element82.useMemo)(() => {
    if (!experiments?.length) {
      return [];
    }
    const groups = /* @__PURE__ */ new Map();
    experiments.forEach((experiment) => {
      const slug = experiment.group || "other";
      if (!groups.has(slug)) {
        groups.set(slug, {
          label: experiment.groupLabel || slug,
          items: []
        });
      }
      groups.get(slug).items.push(experiment.id);
    });
    return Array.from(groups.entries()).map(([slug, group]) => ({
      id: `gutenberg-experiments--${slug}`,
      label: group.label,
      layout: {
        type: "card",
        withHeader: true,
        isCollapsible: true,
        isOpened: true
      },
      children: group.items
    }));
  }, [experiments]);
  if (experiments === null || !siteSettings) {
    return /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(import_components30.Spinner, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(
    page_default,
    {
      title: (0, import_i18n28.__)("Gutenberg Experiments"),
      subTitle: (0, import_i18n28.__)(
        "The latest block and full site editing features before they ship in a WordPress release."
      ),
      children: /* @__PURE__ */ (0, import_jsx_runtime103.jsxs)(
        Stack,
        {
          className: "experiments-page__container",
          direction: "column",
          gap: "md",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(card_exports.Root, { children: /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(card_exports.Content, { children: /* @__PURE__ */ (0, import_jsx_runtime103.jsxs)(Stack, { direction: "column", gap: "md", children: [
              /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(Text, { variant: "body-lg", render: /* @__PURE__ */ (0, import_jsx_runtime103.jsx)("p", {}), children: (0, import_i18n28.__)(
                "The Gutenberg plugin adds editing, customization, and site building to WordPress, and gives early adopters access to the latest block and full site editing features before they ship in a WordPress release."
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(Text, { variant: "body-lg", render: /* @__PURE__ */ (0, import_jsx_runtime103.jsx)("p", {}), children: (0, import_element82.createInterpolateElement)(
                (0, import_i18n28.__)(
                  "The experiments below are in active development, so expect rough edges and changes over time. To learn more about the project and how to build with blocks, see the <a>Block Editor Handbook</a>."
                ),
                {
                  a: /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(
                    Link,
                    {
                      href: "https://developer.wordpress.org/block-editor/",
                      openInNewTab: true
                    }
                  )
                }
              ) })
            ] }) }) }),
            /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(
              DataForm,
              {
                data: settings,
                fields,
                form: {
                  layout: { type: "card" },
                  fields: formFields
                },
                onChange: (values) => {
                  setSettings(values);
                }
              }
            )
          ]
        }
      )
    }
  );
}
function Stage() {
  return /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(ExperimentsPage, {});
}
var stage = Stage;
export {
  stage
};
