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

// package-external:@wordpress/components
var require_components = __commonJS({
  "package-external:@wordpress/components"(exports, module) {
    module.exports = window.wp.components;
  }
});

// vendor-external:react/jsx-runtime
var require_jsx_runtime = __commonJS({
  "vendor-external:react/jsx-runtime"(exports, module) {
    module.exports = window.ReactJSXRuntime;
  }
});

// package-external:@wordpress/element
var require_element = __commonJS({
  "package-external:@wordpress/element"(exports, module) {
    module.exports = window.wp.element;
  }
});

// package-external:@wordpress/compose
var require_compose = __commonJS({
  "package-external:@wordpress/compose"(exports, module) {
    module.exports = window.wp.compose;
  }
});

// vendor-external:react
var require_react = __commonJS({
  "vendor-external:react"(exports, module) {
    module.exports = window.React;
  }
});

// vendor-external:react-dom
var require_react_dom = __commonJS({
  "vendor-external:react-dom"(exports, module) {
    module.exports = window.ReactDOM;
  }
});

// ../../../node_modules/.pnpm/use-sync-external-store@1.6.0_react@18.3.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
var require_use_sync_external_store_shim_development = __commonJS({
  "../../../node_modules/.pnpm/use-sync-external-store@1.6.0_react@18.3.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
    "use strict";
    (function() {
      function is(x2, y2) {
        return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
      }
      function useSyncExternalStore$2(subscribe2, getSnapshot) {
        didWarnOld18Alpha || void 0 === React36.startTransition || (didWarnOld18Alpha = true, console.error(
          "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
        ));
        var value = getSnapshot();
        if (!didWarnUncachedGetSnapshot) {
          var cachedValue = getSnapshot();
          objectIs(value, cachedValue) || (console.error(
            "The result of getSnapshot should be cached to avoid an infinite loop"
          ), didWarnUncachedGetSnapshot = true);
        }
        cachedValue = useState35({
          inst: { value, getSnapshot }
        });
        var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
        useLayoutEffect4(
          function() {
            inst.value = value;
            inst.getSnapshot = getSnapshot;
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          },
          [subscribe2, value, getSnapshot]
        );
        useEffect24(
          function() {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            return subscribe2(function() {
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            });
          },
          [subscribe2]
        );
        useDebugValue(value);
        return value;
      }
      function checkIfSnapshotChanged(inst) {
        var latestGetSnapshot = inst.getSnapshot;
        inst = inst.value;
        try {
          var nextValue = latestGetSnapshot();
          return !objectIs(inst, nextValue);
        } catch (error2) {
          return true;
        }
      }
      function useSyncExternalStore$1(subscribe2, getSnapshot) {
        return getSnapshot();
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React36 = require_react(), objectIs = "function" === typeof Object.is ? Object.is : is, useState35 = React36.useState, useEffect24 = React36.useEffect, useLayoutEffect4 = React36.useLayoutEffect, useDebugValue = React36.useDebugValue, didWarnOld18Alpha = false, didWarnUncachedGetSnapshot = false, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
      exports.useSyncExternalStore = void 0 !== React36.useSyncExternalStore ? React36.useSyncExternalStore : shim;
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// ../../../node_modules/.pnpm/use-sync-external-store@1.6.0_react@18.3.1/node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "../../../node_modules/.pnpm/use-sync-external-store@1.6.0_react@18.3.1/node_modules/use-sync-external-store/shim/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_use_sync_external_store_shim_development();
    }
  }
});

// package-external:@wordpress/primitives
var require_primitives = __commonJS({
  "package-external:@wordpress/primitives"(exports, module) {
    module.exports = window.wp.primitives;
  }
});

// package-external:@wordpress/private-apis
var require_private_apis = __commonJS({
  "package-external:@wordpress/private-apis"(exports, module) {
    module.exports = window.wp.privateApis;
  }
});

// package-external:@wordpress/keycodes
var require_keycodes = __commonJS({
  "package-external:@wordpress/keycodes"(exports, module) {
    module.exports = window.wp.keycodes;
  }
});

// package-external:@wordpress/data
var require_data = __commonJS({
  "package-external:@wordpress/data"(exports, module) {
    module.exports = window.wp.data;
  }
});

// ../../../node_modules/.pnpm/remove-accents@0.5.0/node_modules/remove-accents/index.js
var require_remove_accents = __commonJS({
  "../../../node_modules/.pnpm/remove-accents@0.5.0/node_modules/remove-accents/index.js"(exports, module) {
    var characterMap = {
      "\xC0": "A",
      "\xC1": "A",
      "\xC2": "A",
      "\xC3": "A",
      "\xC4": "A",
      "\xC5": "A",
      "\u1EA4": "A",
      "\u1EAE": "A",
      "\u1EB2": "A",
      "\u1EB4": "A",
      "\u1EB6": "A",
      "\xC6": "AE",
      "\u1EA6": "A",
      "\u1EB0": "A",
      "\u0202": "A",
      "\u1EA2": "A",
      "\u1EA0": "A",
      "\u1EA8": "A",
      "\u1EAA": "A",
      "\u1EAC": "A",
      "\xC7": "C",
      "\u1E08": "C",
      "\xC8": "E",
      "\xC9": "E",
      "\xCA": "E",
      "\xCB": "E",
      "\u1EBE": "E",
      "\u1E16": "E",
      "\u1EC0": "E",
      "\u1E14": "E",
      "\u1E1C": "E",
      "\u0206": "E",
      "\u1EBA": "E",
      "\u1EBC": "E",
      "\u1EB8": "E",
      "\u1EC2": "E",
      "\u1EC4": "E",
      "\u1EC6": "E",
      "\xCC": "I",
      "\xCD": "I",
      "\xCE": "I",
      "\xCF": "I",
      "\u1E2E": "I",
      "\u020A": "I",
      "\u1EC8": "I",
      "\u1ECA": "I",
      "\xD0": "D",
      "\xD1": "N",
      "\xD2": "O",
      "\xD3": "O",
      "\xD4": "O",
      "\xD5": "O",
      "\xD6": "O",
      "\xD8": "O",
      "\u1ED0": "O",
      "\u1E4C": "O",
      "\u1E52": "O",
      "\u020E": "O",
      "\u1ECE": "O",
      "\u1ECC": "O",
      "\u1ED4": "O",
      "\u1ED6": "O",
      "\u1ED8": "O",
      "\u1EDC": "O",
      "\u1EDE": "O",
      "\u1EE0": "O",
      "\u1EDA": "O",
      "\u1EE2": "O",
      "\xD9": "U",
      "\xDA": "U",
      "\xDB": "U",
      "\xDC": "U",
      "\u1EE6": "U",
      "\u1EE4": "U",
      "\u1EEC": "U",
      "\u1EEE": "U",
      "\u1EF0": "U",
      "\xDD": "Y",
      "\xE0": "a",
      "\xE1": "a",
      "\xE2": "a",
      "\xE3": "a",
      "\xE4": "a",
      "\xE5": "a",
      "\u1EA5": "a",
      "\u1EAF": "a",
      "\u1EB3": "a",
      "\u1EB5": "a",
      "\u1EB7": "a",
      "\xE6": "ae",
      "\u1EA7": "a",
      "\u1EB1": "a",
      "\u0203": "a",
      "\u1EA3": "a",
      "\u1EA1": "a",
      "\u1EA9": "a",
      "\u1EAB": "a",
      "\u1EAD": "a",
      "\xE7": "c",
      "\u1E09": "c",
      "\xE8": "e",
      "\xE9": "e",
      "\xEA": "e",
      "\xEB": "e",
      "\u1EBF": "e",
      "\u1E17": "e",
      "\u1EC1": "e",
      "\u1E15": "e",
      "\u1E1D": "e",
      "\u0207": "e",
      "\u1EBB": "e",
      "\u1EBD": "e",
      "\u1EB9": "e",
      "\u1EC3": "e",
      "\u1EC5": "e",
      "\u1EC7": "e",
      "\xEC": "i",
      "\xED": "i",
      "\xEE": "i",
      "\xEF": "i",
      "\u1E2F": "i",
      "\u020B": "i",
      "\u1EC9": "i",
      "\u1ECB": "i",
      "\xF0": "d",
      "\xF1": "n",
      "\xF2": "o",
      "\xF3": "o",
      "\xF4": "o",
      "\xF5": "o",
      "\xF6": "o",
      "\xF8": "o",
      "\u1ED1": "o",
      "\u1E4D": "o",
      "\u1E53": "o",
      "\u020F": "o",
      "\u1ECF": "o",
      "\u1ECD": "o",
      "\u1ED5": "o",
      "\u1ED7": "o",
      "\u1ED9": "o",
      "\u1EDD": "o",
      "\u1EDF": "o",
      "\u1EE1": "o",
      "\u1EDB": "o",
      "\u1EE3": "o",
      "\xF9": "u",
      "\xFA": "u",
      "\xFB": "u",
      "\xFC": "u",
      "\u1EE7": "u",
      "\u1EE5": "u",
      "\u1EED": "u",
      "\u1EEF": "u",
      "\u1EF1": "u",
      "\xFD": "y",
      "\xFF": "y",
      "\u0100": "A",
      "\u0101": "a",
      "\u0102": "A",
      "\u0103": "a",
      "\u0104": "A",
      "\u0105": "a",
      "\u0106": "C",
      "\u0107": "c",
      "\u0108": "C",
      "\u0109": "c",
      "\u010A": "C",
      "\u010B": "c",
      "\u010C": "C",
      "\u010D": "c",
      "C\u0306": "C",
      "c\u0306": "c",
      "\u010E": "D",
      "\u010F": "d",
      "\u0110": "D",
      "\u0111": "d",
      "\u0112": "E",
      "\u0113": "e",
      "\u0114": "E",
      "\u0115": "e",
      "\u0116": "E",
      "\u0117": "e",
      "\u0118": "E",
      "\u0119": "e",
      "\u011A": "E",
      "\u011B": "e",
      "\u011C": "G",
      "\u01F4": "G",
      "\u011D": "g",
      "\u01F5": "g",
      "\u011E": "G",
      "\u011F": "g",
      "\u0120": "G",
      "\u0121": "g",
      "\u0122": "G",
      "\u0123": "g",
      "\u0124": "H",
      "\u0125": "h",
      "\u0126": "H",
      "\u0127": "h",
      "\u1E2A": "H",
      "\u1E2B": "h",
      "\u0128": "I",
      "\u0129": "i",
      "\u012A": "I",
      "\u012B": "i",
      "\u012C": "I",
      "\u012D": "i",
      "\u012E": "I",
      "\u012F": "i",
      "\u0130": "I",
      "\u0131": "i",
      "\u0132": "IJ",
      "\u0133": "ij",
      "\u0134": "J",
      "\u0135": "j",
      "\u0136": "K",
      "\u0137": "k",
      "\u1E30": "K",
      "\u1E31": "k",
      "K\u0306": "K",
      "k\u0306": "k",
      "\u0139": "L",
      "\u013A": "l",
      "\u013B": "L",
      "\u013C": "l",
      "\u013D": "L",
      "\u013E": "l",
      "\u013F": "L",
      "\u0140": "l",
      "\u0141": "l",
      "\u0142": "l",
      "\u1E3E": "M",
      "\u1E3F": "m",
      "M\u0306": "M",
      "m\u0306": "m",
      "\u0143": "N",
      "\u0144": "n",
      "\u0145": "N",
      "\u0146": "n",
      "\u0147": "N",
      "\u0148": "n",
      "\u0149": "n",
      "N\u0306": "N",
      "n\u0306": "n",
      "\u014C": "O",
      "\u014D": "o",
      "\u014E": "O",
      "\u014F": "o",
      "\u0150": "O",
      "\u0151": "o",
      "\u0152": "OE",
      "\u0153": "oe",
      "P\u0306": "P",
      "p\u0306": "p",
      "\u0154": "R",
      "\u0155": "r",
      "\u0156": "R",
      "\u0157": "r",
      "\u0158": "R",
      "\u0159": "r",
      "R\u0306": "R",
      "r\u0306": "r",
      "\u0212": "R",
      "\u0213": "r",
      "\u015A": "S",
      "\u015B": "s",
      "\u015C": "S",
      "\u015D": "s",
      "\u015E": "S",
      "\u0218": "S",
      "\u0219": "s",
      "\u015F": "s",
      "\u0160": "S",
      "\u0161": "s",
      "\u0162": "T",
      "\u0163": "t",
      "\u021B": "t",
      "\u021A": "T",
      "\u0164": "T",
      "\u0165": "t",
      "\u0166": "T",
      "\u0167": "t",
      "T\u0306": "T",
      "t\u0306": "t",
      "\u0168": "U",
      "\u0169": "u",
      "\u016A": "U",
      "\u016B": "u",
      "\u016C": "U",
      "\u016D": "u",
      "\u016E": "U",
      "\u016F": "u",
      "\u0170": "U",
      "\u0171": "u",
      "\u0172": "U",
      "\u0173": "u",
      "\u0216": "U",
      "\u0217": "u",
      "V\u0306": "V",
      "v\u0306": "v",
      "\u0174": "W",
      "\u0175": "w",
      "\u1E82": "W",
      "\u1E83": "w",
      "X\u0306": "X",
      "x\u0306": "x",
      "\u0176": "Y",
      "\u0177": "y",
      "\u0178": "Y",
      "Y\u0306": "Y",
      "y\u0306": "y",
      "\u0179": "Z",
      "\u017A": "z",
      "\u017B": "Z",
      "\u017C": "z",
      "\u017D": "Z",
      "\u017E": "z",
      "\u017F": "s",
      "\u0192": "f",
      "\u01A0": "O",
      "\u01A1": "o",
      "\u01AF": "U",
      "\u01B0": "u",
      "\u01CD": "A",
      "\u01CE": "a",
      "\u01CF": "I",
      "\u01D0": "i",
      "\u01D1": "O",
      "\u01D2": "o",
      "\u01D3": "U",
      "\u01D4": "u",
      "\u01D5": "U",
      "\u01D6": "u",
      "\u01D7": "U",
      "\u01D8": "u",
      "\u01D9": "U",
      "\u01DA": "u",
      "\u01DB": "U",
      "\u01DC": "u",
      "\u1EE8": "U",
      "\u1EE9": "u",
      "\u1E78": "U",
      "\u1E79": "u",
      "\u01FA": "A",
      "\u01FB": "a",
      "\u01FC": "AE",
      "\u01FD": "ae",
      "\u01FE": "O",
      "\u01FF": "o",
      "\xDE": "TH",
      "\xFE": "th",
      "\u1E54": "P",
      "\u1E55": "p",
      "\u1E64": "S",
      "\u1E65": "s",
      "X\u0301": "X",
      "x\u0301": "x",
      "\u0403": "\u0413",
      "\u0453": "\u0433",
      "\u040C": "\u041A",
      "\u045C": "\u043A",
      "A\u030B": "A",
      "a\u030B": "a",
      "E\u030B": "E",
      "e\u030B": "e",
      "I\u030B": "I",
      "i\u030B": "i",
      "\u01F8": "N",
      "\u01F9": "n",
      "\u1ED2": "O",
      "\u1ED3": "o",
      "\u1E50": "O",
      "\u1E51": "o",
      "\u1EEA": "U",
      "\u1EEB": "u",
      "\u1E80": "W",
      "\u1E81": "w",
      "\u1EF2": "Y",
      "\u1EF3": "y",
      "\u0200": "A",
      "\u0201": "a",
      "\u0204": "E",
      "\u0205": "e",
      "\u0208": "I",
      "\u0209": "i",
      "\u020C": "O",
      "\u020D": "o",
      "\u0210": "R",
      "\u0211": "r",
      "\u0214": "U",
      "\u0215": "u",
      "B\u030C": "B",
      "b\u030C": "b",
      "\u010C\u0323": "C",
      "\u010D\u0323": "c",
      "\xCA\u030C": "E",
      "\xEA\u030C": "e",
      "F\u030C": "F",
      "f\u030C": "f",
      "\u01E6": "G",
      "\u01E7": "g",
      "\u021E": "H",
      "\u021F": "h",
      "J\u030C": "J",
      "\u01F0": "j",
      "\u01E8": "K",
      "\u01E9": "k",
      "M\u030C": "M",
      "m\u030C": "m",
      "P\u030C": "P",
      "p\u030C": "p",
      "Q\u030C": "Q",
      "q\u030C": "q",
      "\u0158\u0329": "R",
      "\u0159\u0329": "r",
      "\u1E66": "S",
      "\u1E67": "s",
      "V\u030C": "V",
      "v\u030C": "v",
      "W\u030C": "W",
      "w\u030C": "w",
      "X\u030C": "X",
      "x\u030C": "x",
      "Y\u030C": "Y",
      "y\u030C": "y",
      "A\u0327": "A",
      "a\u0327": "a",
      "B\u0327": "B",
      "b\u0327": "b",
      "\u1E10": "D",
      "\u1E11": "d",
      "\u0228": "E",
      "\u0229": "e",
      "\u0190\u0327": "E",
      "\u025B\u0327": "e",
      "\u1E28": "H",
      "\u1E29": "h",
      "I\u0327": "I",
      "i\u0327": "i",
      "\u0197\u0327": "I",
      "\u0268\u0327": "i",
      "M\u0327": "M",
      "m\u0327": "m",
      "O\u0327": "O",
      "o\u0327": "o",
      "Q\u0327": "Q",
      "q\u0327": "q",
      "U\u0327": "U",
      "u\u0327": "u",
      "X\u0327": "X",
      "x\u0327": "x",
      "Z\u0327": "Z",
      "z\u0327": "z",
      "\u0439": "\u0438",
      "\u0419": "\u0418",
      "\u0451": "\u0435",
      "\u0401": "\u0415"
    };
    var chars = Object.keys(characterMap).join("|");
    var allAccents = new RegExp(chars, "g");
    var firstAccent = new RegExp(chars, "");
    function matcher(match2) {
      return characterMap[match2];
    }
    var removeAccents2 = function(string) {
      return string.replace(allAccents, matcher);
    };
    var hasAccents = function(string) {
      return !!string.match(firstAccent);
    };
    module.exports = removeAccents2;
    module.exports.has = hasAccents;
    module.exports.remove = removeAccents2;
  }
});

// ../../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/es6/index.js
var require_es6 = __commonJS({
  "../../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/es6/index.js"(exports, module) {
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

// package-external:@wordpress/warning
var require_warning = __commonJS({
  "package-external:@wordpress/warning"(exports, module) {
    module.exports = window.wp.warning;
  }
});

// ../../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js
var require_ms = __commonJS({
  "../../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js"(exports, module) {
    var s2 = 1e3;
    var m2 = s2 * 60;
    var h2 = m2 * 60;
    var d2 = h2 * 24;
    var w2 = d2 * 7;
    var y2 = d2 * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match2 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match2) {
        return;
      }
      var n2 = parseFloat(match2[1]);
      var type = (match2[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n2 * y2;
        case "weeks":
        case "week":
        case "w":
          return n2 * w2;
        case "days":
        case "day":
        case "d":
          return n2 * d2;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n2 * h2;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n2 * m2;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n2 * s2;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n2;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d2) {
        return Math.round(ms / d2) + "d";
      }
      if (msAbs >= h2) {
        return Math.round(ms / h2) + "h";
      }
      if (msAbs >= m2) {
        return Math.round(ms / m2) + "m";
      }
      if (msAbs >= s2) {
        return Math.round(ms / s2) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d2) {
        return plural(ms, msAbs, d2, "day");
      }
      if (msAbs >= h2) {
        return plural(ms, msAbs, h2, "hour");
      }
      if (msAbs >= m2) {
        return plural(ms, msAbs, m2, "minute");
      }
      if (msAbs >= s2) {
        return plural(ms, msAbs, s2, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n2, name) {
      var isPlural = msAbs >= n2 * 1.5;
      return Math.round(ms / n2) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// ../../../node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/common.js
var require_common = __commonJS({
  "../../../node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/common.js"(exports, module) {
    function setup2(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i2 = 0; i2 < namespace.length; i2++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i2);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug2(...args) {
          if (!debug2.enabled) {
            return;
          }
          const self2 = debug2;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self2.diff = ms;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match2, format6) => {
            if (match2 === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format6];
            if (typeof formatter === "function") {
              const val = args[index];
              match2 = formatter.call(self2, val);
              args.splice(index, 1);
              index--;
            }
            return match2;
          });
          createDebug.formatArgs.call(self2, args);
          const logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug2.namespace = namespace;
        debug2.useColors = createDebug.useColors();
        debug2.color = createDebug.selectColor(namespace);
        debug2.extend = extend;
        debug2.destroy = createDebug.destroy;
        Object.defineProperty(debug2, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v2) => {
            enableOverride = v2;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug2);
        }
        return debug2;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup2;
  }
});

// ../../../node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "../../../node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/browser.js"(exports, module) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m2;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m2 = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m2[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c2 = "color: " + this.color;
      args.splice(1, 0, c2, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match2) => {
        if (match2 === "%%") {
          return;
        }
        index++;
        if (match2 === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c2);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error2) {
      }
    }
    function load() {
      let r3;
      try {
        r3 = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error2) {
      }
      if (!r3 && typeof process !== "undefined" && "env" in process) {
        r3 = process.env.DEBUG;
      }
      return r3;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error2) {
      }
    }
    module.exports = require_common()(exports);
    var { formatters: formatters2 } = module.exports;
    formatters2.j = function(v2) {
      try {
        return JSON.stringify(v2);
      } catch (error2) {
        return "[UnexpectedJSONParseError]: " + error2.message;
      }
    };
  }
});

// package-external:@wordpress/api-fetch
var require_api_fetch = __commonJS({
  "package-external:@wordpress/api-fetch"(exports, module) {
    module.exports = window.wp.apiFetch;
  }
});

// package-external:@wordpress/notices
var require_notices = __commonJS({
  "package-external:@wordpress/notices"(exports, module) {
    module.exports = window.wp.notices;
  }
});

// package-external:@wordpress/url
var require_url = __commonJS({
  "package-external:@wordpress/url"(exports, module) {
    module.exports = window.wp.url;
  }
});

// package-external:@wordpress/core-data
var require_core_data = __commonJS({
  "package-external:@wordpress/core-data"(exports, module) {
    module.exports = window.wp.coreData;
  }
});

// package-external:@wordpress/html-entities
var require_html_entities = __commonJS({
  "package-external:@wordpress/html-entities"(exports, module) {
    module.exports = window.wp.htmlEntities;
  }
});

// ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
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

// ../../../node_modules/.pnpm/@wordpress+admin-ui@1.7.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@wordpress/admin-ui/build-module/navigable-region/index.mjs
var import_element = __toESM(require_element(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var NavigableRegion = (0, import_element.forwardRef)(
  ({ children, className, ariaLabel, as: Tag = "div", ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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

// ../../../node_modules/.pnpm/@wordpress+admin-ui@1.7.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@wordpress/admin-ui/build-module/page/header.mjs
var import_components2 = __toESM(require_components(), 1);

// ../../../node_modules/.pnpm/@wordpress+admin-ui@1.7.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@wordpress/admin-ui/build-module/page/sidebar-toggle-slot.mjs
var import_components = __toESM(require_components(), 1);
var { Fill: SidebarToggleFill, Slot: SidebarToggleSlot } = (0, import_components.createSlotFill)("SidebarToggle");

// ../../../node_modules/.pnpm/@wordpress+admin-ui@1.7.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@wordpress/admin-ui/build-module/page/header.mjs
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function Header({
  breadcrumbs,
  badges,
  title,
  subTitle,
  actions,
  showSidebarToggle = true
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_components2.__experimentalVStack, { className: "admin-ui-page__header", as: "header", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_components2.__experimentalHStack, { justify: "space-between", spacing: 2, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_components2.__experimentalHStack, { spacing: 2, justify: "left", children: [
        showSidebarToggle && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          SidebarToggleSlot,
          {
            bubblesVirtually: true,
            className: "admin-ui-page__sidebar-toggle-slot"
          }
        ),
        title && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_components2.__experimentalHeading, { as: "h2", level: 3, weight: 500, truncate: true, children: title }),
        breadcrumbs,
        badges
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        import_components2.__experimentalHStack,
        {
          style: { width: "auto", flexShrink: 0 },
          spacing: 2,
          className: "admin-ui-page__header-actions",
          children: actions
        }
      )
    ] }),
    subTitle && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "admin-ui-page__header-subtitle", children: subTitle })
  ] });
}

// ../../../node_modules/.pnpm/@wordpress+admin-ui@1.7.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@wordpress/admin-ui/build-module/page/index.mjs
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function Page({
  breadcrumbs,
  badges,
  title,
  subTitle,
  children,
  className,
  actions,
  hasPadding = false,
  showSidebarToggle = true
}) {
  const classes = clsx_default("admin-ui-page", className);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(navigable_region_default, { className: classes, ariaLabel: title, children: [
    (title || breadcrumbs || badges) && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      Header,
      {
        breadcrumbs,
        badges,
        title,
        subTitle,
        actions,
        showSidebarToggle
      }
    ),
    hasPadding ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "admin-ui-page__content has-padding", children }) : children
  ] });
}
Page.SidebarToggleFill = SidebarToggleFill;
var page_default = Page;

// routes/forms/stage.tsx
var import_components50 = __toESM(require_components());

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/dataviews/index.mjs
var import_element54 = __toESM(require_element(), 1);
var import_compose12 = __toESM(require_compose(), 1);

// ../../../node_modules/.pnpm/@base-ui+utils@0.2.4_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/utils/esm/useRefWithInit.js
var React = __toESM(require_react(), 1);
var UNINITIALIZED = {};
function useRefWithInit(init2, initArg) {
  const ref = React.useRef(UNINITIALIZED);
  if (ref.current === UNINITIALIZED) {
    ref.current = init2(initArg);
  }
  return ref;
}

// ../../../node_modules/.pnpm/@base-ui+react@1.1.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/react/esm/utils/useRenderElement.js
var React4 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui+utils@0.2.4_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/utils/esm/useMergedRefs.js
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
                ref(null);
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

// ../../../node_modules/.pnpm/@base-ui+utils@0.2.4_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/utils/esm/getReactElementRef.js
var React3 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui+utils@0.2.4_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/utils/esm/reactVersion.js
var React2 = __toESM(require_react(), 1);
var majorVersion = parseInt(React2.version, 10);
function isReactVersionAtLeast(reactVersionToCheck) {
  return majorVersion >= reactVersionToCheck;
}

// ../../../node_modules/.pnpm/@base-ui+utils@0.2.4_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/utils/esm/getReactElementRef.js
function getReactElementRef(element) {
  if (!/* @__PURE__ */ React3.isValidElement(element)) {
    return null;
  }
  const reactElement = element;
  const propsWithRef = reactElement.props;
  return (isReactVersionAtLeast(19) ? propsWithRef?.ref : reactElement.ref) ?? null;
}

// ../../../node_modules/.pnpm/@base-ui+utils@0.2.4_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/utils/esm/mergeObjects.js
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

// ../../../node_modules/.pnpm/@base-ui+react@1.1.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/react/esm/utils/getStateAttributesProps.js
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

// ../../../node_modules/.pnpm/@base-ui+react@1.1.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/react/esm/utils/resolveClassName.js
function resolveClassName(className, state) {
  return typeof className === "function" ? className(state) : className;
}

// ../../../node_modules/.pnpm/@base-ui+react@1.1.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/react/esm/utils/resolveStyle.js
function resolveStyle(style, state) {
  return typeof style === "function" ? style(state) : style;
}

// ../../../node_modules/.pnpm/@base-ui+react@1.1.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/react/esm/merge-props/mergeProps.js
var EMPTY_PROPS = {};
function mergeProps(a2, b2, c2, d2, e2) {
  let merged = {
    ...resolvePropsGetter(a2, EMPTY_PROPS)
  };
  if (b2) {
    merged = mergeOne(merged, b2);
  }
  if (c2) {
    merged = mergeOne(merged, c2);
  }
  if (d2) {
    merged = mergeOne(merged, d2);
  }
  if (e2) {
    merged = mergeOne(merged, e2);
  }
  return merged;
}
function mergePropsN(props) {
  if (props.length === 0) {
    return EMPTY_PROPS;
  }
  if (props.length === 1) {
    return resolvePropsGetter(props[0], EMPTY_PROPS);
  }
  let merged = {
    ...resolvePropsGetter(props[0], EMPTY_PROPS)
  };
  for (let i2 = 1; i2 < props.length; i2 += 1) {
    merged = mergeOne(merged, props[i2]);
  }
  return merged;
}
function mergeOne(merged, inputProps) {
  if (isPropsGetter(inputProps)) {
    return inputProps(merged);
  }
  return mutablyMergeInto(merged, inputProps);
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
    return theirHandler;
  }
  return (event) => {
    if (isSyntheticEvent(event)) {
      const baseUIEvent = event;
      makeEventPreventable(baseUIEvent);
      const result2 = theirHandler(baseUIEvent);
      if (!baseUIEvent.baseUIHandlerPrevented) {
        ourHandler?.(baseUIEvent);
      }
      return result2;
    }
    const result = theirHandler(event);
    ourHandler?.(event);
    return result;
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

// ../../../node_modules/.pnpm/@base-ui+utils@0.2.4_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/utils/esm/empty.js
var EMPTY_ARRAY = Object.freeze([]);
var EMPTY_OBJECT = Object.freeze({});

// ../../../node_modules/.pnpm/@base-ui+react@1.1.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/react/esm/utils/useRenderElement.js
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
    stateAttributesMapping: stateAttributesMapping2,
    enabled = true
  } = params;
  const className = enabled ? resolveClassName(classNameProp, state) : void 0;
  const style = enabled ? resolveStyle(styleProp, state) : void 0;
  const stateProps = enabled ? getStateAttributesProps(state, stateAttributesMapping2) : EMPTY_OBJECT;
  const outProps = enabled ? mergeObjects(stateProps, Array.isArray(props) ? mergePropsN(props) : props) ?? EMPTY_OBJECT : EMPTY_OBJECT;
  if (typeof document !== "undefined") {
    if (!enabled) {
      useMergedRefs(null, null);
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
function evaluateRenderProp(element, render4, props, state) {
  if (render4) {
    if (typeof render4 === "function") {
      return render4(props, state);
    }
    const mergedProps = mergeProps(props, render4.props);
    mergedProps.ref = props.ref;
    return /* @__PURE__ */ React4.cloneElement(render4, mergedProps);
  }
  if (element) {
    if (typeof element === "string") {
      return renderTag(element, props);
    }
  }
  throw new Error(true ? "Base UI: Render element or function are not defined." : formatErrorMessage(8));
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
  return /* @__PURE__ */ React4.createElement(Tag, props);
}

// ../../../node_modules/.pnpm/@floating-ui+utils@0.2.10/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
  return typeof window !== "undefined";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}

// ../../../node_modules/.pnpm/@floating-ui+utils@0.2.10/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var floor = Math.floor;

// ../../../node_modules/.pnpm/@base-ui+react@1.1.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui/react/esm/use-render/useRender.js
function useRender(params) {
  return useRenderElement(params.defaultTagName ?? "div", params, params);
}

// ../../../node_modules/.pnpm/@wordpress+ui@0.6.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/ui/build-module/stack/stack.mjs
var import_element2 = __toESM(require_element(), 1);
if (typeof document !== "undefined" && !document.head.querySelector("style[data-wp-hash='71d20935c2']")) {
  const style = document.createElement("style");
  style.setAttribute("data-wp-hash", "71d20935c2");
  style.appendChild(document.createTextNode("@layer wp-ui-utilities, wp-ui-components, wp-ui-compositions, wp-ui-overrides;@layer wp-ui-components{._19ce0419607e1896__stack{display:flex}}"));
  document.head.appendChild(style);
}
var style_default = { "stack": "_19ce0419607e1896__stack" };
var Stack = (0, import_element2.forwardRef)(function Stack2({ direction, gap, align, justify, wrap, render: render4, ...props }, ref) {
  const style = {
    gap: gap && `var(--wpds-dimension-gap-${gap})`,
    alignItems: align,
    justifyContent: justify,
    flexDirection: direction,
    flexWrap: wrap
  };
  const element = useRender({
    render: render4,
    ref,
    props: mergeProps(props, { style, className: style_default.stack })
  });
  return element;
});

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/arrow-down.mjs
var import_primitives = __toESM(require_primitives(), 1);
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var arrow_down_default = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_primitives.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_primitives.Path, { d: "m16.5 13.5-3.7 3.7V4h-1.5v13.2l-3.8-3.7-1 1 5.5 5.6 5.5-5.6z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/arrow-left.mjs
var import_primitives2 = __toESM(require_primitives(), 1);
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var arrow_left_default = /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_primitives2.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_primitives2.Path, { d: "M20 11.2H6.8l3.7-3.7-1-1L3.9 12l5.6 5.5 1-1-3.7-3.7H20z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/arrow-right.mjs
var import_primitives3 = __toESM(require_primitives(), 1);
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var arrow_right_default = /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_primitives3.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_primitives3.Path, { d: "m14.5 6.5-1 1 3.7 3.7H4v1.6h13.2l-3.7 3.7 1 1 5.6-5.5z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/arrow-up.mjs
var import_primitives4 = __toESM(require_primitives(), 1);
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var arrow_up_default = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_primitives4.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_primitives4.Path, { d: "M12 3.9 6.5 9.5l1 1 3.8-3.7V20h1.5V6.8l3.7 3.7 1-1z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/block-table.mjs
var import_primitives5 = __toESM(require_primitives(), 1);
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
var block_table_default = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_primitives5.SVG, { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_primitives5.Path, { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v3.5h-15V5c0-.3.2-.5.5-.5zm8 5.5h6.5v3.5H13V10zm-1.5 3.5h-7V10h7v3.5zm-7 5.5v-4h7v4.5H5c-.3 0-.5-.2-.5-.5zm14.5.5h-6V15h6.5v4c0 .3-.2.5-.5.5z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/category.mjs
var import_primitives6 = __toESM(require_primitives(), 1);
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
var category_default = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_primitives6.SVG, { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
  import_primitives6.Path,
  {
    d: "M6 5.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM4 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm11-.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM13 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V6zm5 8.5h-3a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5zM15 13a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2h-3zm-9 1.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5zM4 15a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3z",
    fillRule: "evenodd",
    clipRule: "evenodd"
  }
) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/check.mjs
var import_primitives7 = __toESM(require_primitives(), 1);
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
var check_default = /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_primitives7.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_primitives7.Path, { d: "M16.5 7.5 10 13.9l-2.5-2.4-1 1 3.5 3.6 7.5-7.6z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/chevron-right.mjs
var import_primitives8 = __toESM(require_primitives(), 1);
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
var chevron_right_default = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_primitives8.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_primitives8.Path, { d: "M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1 5.4-6z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/close-small.mjs
var import_primitives9 = __toESM(require_primitives(), 1);
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
var close_small_default = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_primitives9.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_primitives9.Path, { d: "M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/cog.mjs
var import_primitives10 = __toESM(require_primitives(), 1);
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
var cog_default = /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_primitives10.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
  import_primitives10.Path,
  {
    fillRule: "evenodd",
    d: "M10.289 4.836A1 1 0 0111.275 4h1.306a1 1 0 01.987.836l.244 1.466c.787.26 1.503.679 2.108 1.218l1.393-.522a1 1 0 011.216.437l.653 1.13a1 1 0 01-.23 1.273l-1.148.944a6.025 6.025 0 010 2.435l1.149.946a1 1 0 01.23 1.272l-.653 1.13a1 1 0 01-1.216.437l-1.394-.522c-.605.54-1.32.958-2.108 1.218l-.244 1.466a1 1 0 01-.987.836h-1.306a1 1 0 01-.986-.836l-.244-1.466a5.995 5.995 0 01-2.108-1.218l-1.394.522a1 1 0 01-1.217-.436l-.653-1.131a1 1 0 01.23-1.272l1.149-.946a6.026 6.026 0 010-2.435l-1.148-.944a1 1 0 01-.23-1.272l.653-1.131a1 1 0 011.217-.437l1.393.522a5.994 5.994 0 012.108-1.218l.244-1.466zM14.929 12a3 3 0 11-6 0 3 3 0 016 0z",
    clipRule: "evenodd"
  }
) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/envelope.mjs
var import_primitives11 = __toESM(require_primitives(), 1);
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var envelope_default = /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_primitives11.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
  import_primitives11.Path,
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M3 7c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm2-.5h14c.3 0 .5.2.5.5v1L12 13.5 4.5 7.9V7c0-.3.2-.5.5-.5Zm-.5 3.3V17c0 .3.2.5.5.5h14c.3 0 .5-.2.5-.5V9.8L12 15.4 4.5 9.8Z"
  }
) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/error.mjs
var import_primitives12 = __toESM(require_primitives(), 1);
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
var error_default = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_primitives12.SVG, { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
  import_primitives12.Path,
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12.218 5.377a.25.25 0 0 0-.436 0l-7.29 12.96a.25.25 0 0 0 .218.373h14.58a.25.25 0 0 0 .218-.372l-7.29-12.96Zm-1.743-.735c.669-1.19 2.381-1.19 3.05 0l7.29 12.96a1.75 1.75 0 0 1-1.525 2.608H4.71a1.75 1.75 0 0 1-1.525-2.608l7.29-12.96ZM12.75 17.46h-1.5v-1.5h1.5v1.5Zm-1.5-3h1.5v-5h-1.5v5Z"
  }
) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/format-list-bullets-rtl.mjs
var import_primitives13 = __toESM(require_primitives(), 1);
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
var format_list_bullets_rtl_default = /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_primitives13.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_primitives13.Path, { d: "M4 8.8h8.9V7.2H4v1.6zm0 7h8.9v-1.5H4v1.5zM18 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/format-list-bullets.mjs
var import_primitives14 = __toESM(require_primitives(), 1);
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
var format_list_bullets_default = /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_primitives14.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_primitives14.Path, { d: "M11.1 15.8H20v-1.5h-8.9v1.5zm0-8.6v1.5H20V7.2h-8.9zM6 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/funnel.mjs
var import_primitives15 = __toESM(require_primitives(), 1);
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
var funnel_default = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_primitives15.SVG, { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_primitives15.Path, { d: "M10 17.5H14V16H10V17.5ZM6 6V7.5H18V6H6ZM8 12.5H16V11H8V12.5Z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/link.mjs
var import_primitives16 = __toESM(require_primitives(), 1);
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
var link_default = /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_primitives16.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_primitives16.Path, { d: "M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/mobile.mjs
var import_primitives17 = __toESM(require_primitives(), 1);
var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
var mobile_default = /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_primitives17.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_primitives17.Path, { d: "M15 4H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm.5 14c0 .3-.2.5-.5.5H9c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h6c.3 0 .5.2.5.5v12zm-4.5-.5h2V16h-2v1.5z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/more-vertical.mjs
var import_primitives18 = __toESM(require_primitives(), 1);
var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
var more_vertical_default = /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_primitives18.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_primitives18.Path, { d: "M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/next.mjs
var import_primitives19 = __toESM(require_primitives(), 1);
var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
var next_default = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_primitives19.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_primitives19.Path, { d: "M6.6 6L5.4 7l4.5 5-4.5 5 1.1 1 5.5-6-5.4-6zm6 0l-1.1 1 4.5 5-4.5 5 1.1 1 5.5-6-5.5-6z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/plus.mjs
var import_primitives20 = __toESM(require_primitives(), 1);
var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
var plus_default = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_primitives20.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_primitives20.Path, { d: "M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/previous.mjs
var import_primitives21 = __toESM(require_primitives(), 1);
var import_jsx_runtime24 = __toESM(require_jsx_runtime(), 1);
var previous_default = /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_primitives21.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_primitives21.Path, { d: "M11.6 7l-1.1-1L5 12l5.5 6 1.1-1L7 12l4.6-5zm6 0l-1.1-1-5.5 6 5.5 6 1.1-1-4.6-5 4.6-5z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/scheduled.mjs
var import_primitives22 = __toESM(require_primitives(), 1);
var import_jsx_runtime25 = __toESM(require_jsx_runtime(), 1);
var scheduled_default = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(import_primitives22.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
  import_primitives22.Path,
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm9 1V8h-1.5v3.5h-2V13H13Z"
  }
) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/search.mjs
var import_primitives23 = __toESM(require_primitives(), 1);
var import_jsx_runtime26 = __toESM(require_jsx_runtime(), 1);
var search_default = /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(import_primitives23.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(import_primitives23.Path, { d: "M13 5c-3.3 0-6 2.7-6 6 0 1.4.5 2.7 1.3 3.7l-3.8 3.8 1.1 1.1 3.8-3.8c1 .8 2.3 1.3 3.7 1.3 3.3 0 6-2.7 6-6S16.3 5 13 5zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/seen.mjs
var import_primitives24 = __toESM(require_primitives(), 1);
var import_jsx_runtime27 = __toESM(require_jsx_runtime(), 1);
var seen_default = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(import_primitives24.SVG, { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(import_primitives24.Path, { d: "M3.99961 13C4.67043 13.3354 4.6703 13.3357 4.67017 13.3359L4.67298 13.3305C4.67621 13.3242 4.68184 13.3135 4.68988 13.2985C4.70595 13.2686 4.7316 13.2218 4.76695 13.1608C4.8377 13.0385 4.94692 12.8592 5.09541 12.6419C5.39312 12.2062 5.84436 11.624 6.45435 11.0431C7.67308 9.88241 9.49719 8.75 11.9996 8.75C14.502 8.75 16.3261 9.88241 17.5449 11.0431C18.1549 11.624 18.6061 12.2062 18.9038 12.6419C19.0523 12.8592 19.1615 13.0385 19.2323 13.1608C19.2676 13.2218 19.2933 13.2686 19.3093 13.2985C19.3174 13.3135 19.323 13.3242 19.3262 13.3305L19.3291 13.3359C19.3289 13.3357 19.3288 13.3354 19.9996 13C20.6704 12.6646 20.6703 12.6643 20.6701 12.664L20.6697 12.6632L20.6688 12.6614L20.6662 12.6563L20.6583 12.6408C20.6517 12.6282 20.6427 12.6108 20.631 12.5892C20.6078 12.5459 20.5744 12.4852 20.5306 12.4096C20.4432 12.2584 20.3141 12.0471 20.1423 11.7956C19.7994 11.2938 19.2819 10.626 18.5794 9.9569C17.1731 8.61759 14.9972 7.25 11.9996 7.25C9.00203 7.25 6.82614 8.61759 5.41987 9.9569C4.71736 10.626 4.19984 11.2938 3.85694 11.7956C3.68511 12.0471 3.55605 12.2584 3.4686 12.4096C3.42484 12.4852 3.39142 12.5459 3.36818 12.5892C3.35656 12.6108 3.34748 12.6282 3.34092 12.6408L3.33297 12.6563L3.33041 12.6614L3.32948 12.6632L3.32911 12.664C3.32894 12.6643 3.32879 12.6646 3.99961 13ZM11.9996 16C13.9326 16 15.4996 14.433 15.4996 12.5C15.4996 10.567 13.9326 9 11.9996 9C10.0666 9 8.49961 10.567 8.49961 12.5C8.49961 14.433 10.0666 16 11.9996 16Z" }) });

// ../../../node_modules/.pnpm/@wordpress+icons@11.6.0_react@18.3.1/node_modules/@wordpress/icons/build-module/library/unseen.mjs
var import_primitives25 = __toESM(require_primitives(), 1);
var import_jsx_runtime28 = __toESM(require_jsx_runtime(), 1);
var unseen_default = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_primitives25.SVG, { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_primitives25.Path, { d: "M20.7 12.7s0-.1-.1-.2c0-.2-.2-.4-.4-.6-.3-.5-.9-1.2-1.6-1.8-.7-.6-1.5-1.3-2.6-1.8l-.6 1.4c.9.4 1.6 1 2.1 1.5.6.6 1.1 1.2 1.4 1.6.1.2.3.4.3.5v.1l.7-.3.7-.3Zm-5.2-9.3-1.8 4c-.5-.1-1.1-.2-1.7-.2-3 0-5.2 1.4-6.6 2.7-.7.7-1.2 1.3-1.6 1.8-.2.3-.3.5-.4.6 0 0 0 .1-.1.2s0 0 .7.3l.7.3V13c0-.1.2-.3.3-.5.3-.4.7-1 1.4-1.6 1.2-1.2 3-2.3 5.5-2.3H13v.3c-.4 0-.8-.1-1.1-.1-1.9 0-3.5 1.6-3.5 3.5s.6 2.3 1.6 2.9l-2 4.4.9.4 7.6-16.2-.9-.4Zm-3 12.6c1.7-.2 3-1.7 3-3.5s-.2-1.4-.6-1.9L12.4 16Z" }) });

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-context/index.mjs
var import_element3 = __toESM(require_element(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/constants.mjs
var import_i18n = __toESM(require_i18n(), 1);
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
var SORTING_DIRECTIONS = ["asc", "desc"];
var sortArrows = { asc: "\u2191", desc: "\u2193" };
var sortValues = { asc: "ascending", desc: "descending" };
var sortLabels = {
  asc: (0, import_i18n.__)("Sort ascending"),
  desc: (0, import_i18n.__)("Sort descending")
};
var sortIcons = {
  asc: arrow_up_default,
  desc: arrow_down_default
};
var LAYOUT_TABLE = "table";
var LAYOUT_GRID = "grid";
var LAYOUT_LIST = "list";
var LAYOUT_ACTIVITY = "activity";
var LAYOUT_PICKER_GRID = "pickerGrid";
var LAYOUT_PICKER_TABLE = "pickerTable";

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-context/index.mjs
var DataViewsContext = (0, import_element3.createContext)({
  view: { type: LAYOUT_TABLE },
  onChangeView: () => {
  },
  fields: [],
  data: [],
  paginationInfo: {
    totalItems: 0,
    totalPages: 0
  },
  selection: [],
  onChangeSelection: () => {
  },
  setOpenedFilter: () => {
  },
  openedFilter: null,
  getItemId: (item) => item.id,
  isItemClickable: () => true,
  renderItemLink: void 0,
  containerWidth: 0,
  containerRef: (0, import_element3.createRef)(),
  resizeObserverRef: () => {
  },
  defaultLayouts: { list: {}, grid: {}, table: {} },
  filters: [],
  isShowingFilter: false,
  setIsShowingFilter: () => {
  },
  hasInfiniteScrollHandler: false,
  config: {
    perPageSizes: []
  }
});
DataViewsContext.displayName = "DataViewsContext";
var dataviews_context_default = DataViewsContext;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/index.mjs
var import_i18n21 = __toESM(require_i18n(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/table/index.mjs
var import_i18n9 = __toESM(require_i18n(), 1);
var import_components8 = __toESM(require_components(), 1);
var import_element10 = __toESM(require_element(), 1);
var import_keycodes = __toESM(require_keycodes(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-selection-checkbox/index.mjs
var import_components3 = __toESM(require_components(), 1);
var import_i18n2 = __toESM(require_i18n(), 1);
var import_jsx_runtime29 = __toESM(require_jsx_runtime(), 1);
function DataViewsSelectionCheckbox({
  selection,
  onChangeSelection,
  item,
  getItemId,
  titleField,
  disabled: disabled2,
  ...extraProps
}) {
  const id = getItemId(item);
  const checked = !disabled2 && selection.includes(id);
  const selectionLabel = titleField?.getValue?.({ item }) || (0, import_i18n2.__)("(no title)");
  return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
    import_components3.CheckboxControl,
    {
      className: "dataviews-selection-checkbox",
      "aria-label": selectionLabel,
      "aria-disabled": disabled2,
      checked,
      onChange: () => {
        if (disabled2) {
          return;
        }
        onChangeSelection(
          selection.includes(id) ? selection.filter((itemId) => id !== itemId) : [...selection, id]
        );
      },
      ...extraProps
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-item-actions/index.mjs
var import_components4 = __toESM(require_components(), 1);
var import_i18n3 = __toESM(require_i18n(), 1);
var import_element4 = __toESM(require_element(), 1);
var import_data = __toESM(require_data(), 1);
var import_compose = __toESM(require_compose(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/lock-unlock.mjs
var import_private_apis = __toESM(require_private_apis(), 1);
var { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)(
  "I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.",
  "@wordpress/dataviews"
);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-item-actions/index.mjs
var import_jsx_runtime30 = __toESM(require_jsx_runtime(), 1);
var { Menu, kebabCase } = unlock(import_components4.privateApis);
function ButtonTrigger({
  action,
  onClick,
  items,
  variant
}) {
  const label = typeof action.label === "string" ? action.label : action.label(items);
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
    import_components4.Button,
    {
      disabled: !!action.disabled,
      accessibleWhenDisabled: true,
      size: "compact",
      variant,
      onClick,
      children: label
    }
  );
}
function MenuItemTrigger({
  action,
  onClick,
  items
}) {
  const label = typeof action.label === "string" ? action.label : action.label(items);
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Menu.Item, { disabled: action.disabled, onClick, children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Menu.ItemLabel, { children: label }) });
}
function ActionModal({
  action,
  items,
  closeModal
}) {
  const label = typeof action.label === "string" ? action.label : action.label(items);
  const modalHeader = typeof action.modalHeader === "function" ? action.modalHeader(items) : action.modalHeader;
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
    import_components4.Modal,
    {
      title: modalHeader || label,
      __experimentalHideHeader: !!action.hideModalHeader,
      onRequestClose: closeModal,
      focusOnMount: action.modalFocusOnMount ?? true,
      size: action.modalSize || "medium",
      overlayClassName: `dataviews-action-modal dataviews-action-modal__${kebabCase(
        action.id
      )}`,
      children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(action.RenderModal, { items, closeModal })
    }
  );
}
function ActionsMenuGroup({
  actions,
  item,
  registry,
  setActiveModalAction
}) {
  const { primaryActions, regularActions } = (0, import_element4.useMemo)(() => {
    return actions.reduce(
      (acc, action) => {
        (action.isPrimary ? acc.primaryActions : acc.regularActions).push(action);
        return acc;
      },
      {
        primaryActions: [],
        regularActions: []
      }
    );
  }, [actions]);
  const renderActionGroup = (actionList) => actionList.map((action) => /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
    MenuItemTrigger,
    {
      action,
      onClick: () => {
        if ("RenderModal" in action) {
          setActiveModalAction(action);
          return;
        }
        action.callback([item], { registry });
      },
      items: [item]
    },
    action.id
  ));
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)(Menu.Group, { children: [
    renderActionGroup(primaryActions),
    primaryActions.length > 0 && regularActions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Menu.Separator, {}),
    renderActionGroup(regularActions)
  ] });
}
function ItemActions({
  item,
  actions,
  isCompact
}) {
  const registry = (0, import_data.useRegistry)();
  const { primaryActions, eligibleActions } = (0, import_element4.useMemo)(() => {
    const _eligibleActions = actions.filter(
      (action) => !action.isEligible || action.isEligible(item)
    );
    const _primaryActions = _eligibleActions.filter(
      (action) => action.isPrimary
    );
    return {
      primaryActions: _primaryActions,
      eligibleActions: _eligibleActions
    };
  }, [actions, item]);
  const isMobileViewport = (0, import_compose.useViewportMatch)("medium", "<");
  if (isCompact) {
    return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
      CompactItemActions,
      {
        item,
        actions: eligibleActions,
        isSmall: true,
        registry
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)(
    Stack,
    {
      direction: "row",
      justify: "flex-end",
      className: "dataviews-item-actions",
      style: {
        flexShrink: 0,
        width: "auto"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
          PrimaryActions,
          {
            item,
            actions: primaryActions,
            registry
          }
        ),
        (primaryActions.length < eligibleActions.length || // Since we hide primary actions on mobile, we need to show the menu
        // there if there are any actions at all.
        isMobileViewport) && /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
          CompactItemActions,
          {
            item,
            actions: eligibleActions,
            registry
          }
        )
      ]
    }
  );
}
function CompactItemActions({
  item,
  actions,
  isSmall,
  registry
}) {
  const [activeModalAction, setActiveModalAction] = (0, import_element4.useState)(
    null
  );
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)(import_jsx_runtime30.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)(Menu, { placement: "bottom-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
        Menu.TriggerButton,
        {
          render: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
            import_components4.Button,
            {
              size: isSmall ? "small" : "compact",
              icon: more_vertical_default,
              label: (0, import_i18n3.__)("Actions"),
              accessibleWhenDisabled: true,
              disabled: !actions.length,
              className: "dataviews-all-actions-button"
            }
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Menu.Popover, { children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
        ActionsMenuGroup,
        {
          actions,
          item,
          registry,
          setActiveModalAction
        }
      ) })
    ] }),
    !!activeModalAction && /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
      ActionModal,
      {
        action: activeModalAction,
        items: [item],
        closeModal: () => setActiveModalAction(null)
      }
    )
  ] });
}
function PrimaryActions({
  item,
  actions,
  registry,
  buttonVariant
}) {
  const [activeModalAction, setActiveModalAction] = (0, import_element4.useState)(null);
  const isMobileViewport = (0, import_compose.useViewportMatch)("medium", "<");
  if (isMobileViewport) {
    return null;
  }
  if (!Array.isArray(actions) || actions.length === 0) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)(import_jsx_runtime30.Fragment, { children: [
    actions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
      ButtonTrigger,
      {
        action,
        onClick: () => {
          if ("RenderModal" in action) {
            setActiveModalAction(action);
            return;
          }
          action.callback([item], { registry });
        },
        items: [item],
        variant: buttonVariant
      },
      action.id
    )),
    !!activeModalAction && /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
      ActionModal,
      {
        action: activeModalAction,
        items: [item],
        closeModal: () => setActiveModalAction(null)
      }
    )
  ] });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-bulk-actions/index.mjs
var import_components5 = __toESM(require_components(), 1);
var import_i18n5 = __toESM(require_i18n(), 1);
var import_element5 = __toESM(require_element(), 1);
var import_data2 = __toESM(require_data(), 1);
var import_compose2 = __toESM(require_compose(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/utils/get-footer-message.mjs
var import_i18n4 = __toESM(require_i18n(), 1);
function getFooterMessage(selectionCount, itemsCount, totalItems) {
  if (selectionCount > 0) {
    return (0, import_i18n4.sprintf)(
      /* translators: %d: number of items. */
      (0, import_i18n4._n)("%d Item selected", "%d Items selected", selectionCount),
      selectionCount
    );
  }
  if (totalItems > itemsCount) {
    return (0, import_i18n4.sprintf)(
      /* translators: %1$d: number of items. %2$d: total number of items. */
      (0, import_i18n4._n)("%1$d of %2$d Item", "%1$d of %2$d Items", totalItems),
      itemsCount,
      totalItems
    );
  }
  return (0, import_i18n4.sprintf)(
    /* translators: %d: number of items. */
    (0, import_i18n4._n)("%d Item", "%d Items", itemsCount),
    itemsCount
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-bulk-actions/index.mjs
var import_jsx_runtime31 = __toESM(require_jsx_runtime(), 1);
function ActionWithModal({
  action,
  items,
  ActionTriggerComponent
}) {
  const [isModalOpen, setIsModalOpen] = (0, import_element5.useState)(false);
  const actionTriggerProps = {
    action,
    onClick: () => {
      setIsModalOpen(true);
    },
    items
  };
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)(import_jsx_runtime31.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(ActionTriggerComponent, { ...actionTriggerProps }),
    isModalOpen && /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
      ActionModal,
      {
        action,
        items,
        closeModal: () => setIsModalOpen(false)
      }
    )
  ] });
}
function useHasAPossibleBulkAction(actions, item) {
  return (0, import_element5.useMemo)(() => {
    return actions.some((action) => {
      return action.supportsBulk && (!action.isEligible || action.isEligible(item));
    });
  }, [actions, item]);
}
function useSomeItemHasAPossibleBulkAction(actions, data) {
  return (0, import_element5.useMemo)(() => {
    return data.some((item) => {
      return actions.some((action) => {
        return action.supportsBulk && (!action.isEligible || action.isEligible(item));
      });
    });
  }, [actions, data]);
}
function BulkSelectionCheckbox({
  selection,
  onChangeSelection,
  data,
  actions,
  getItemId
}) {
  const selectableItems = (0, import_element5.useMemo)(() => {
    return data.filter((item) => {
      return actions.some(
        (action) => action.supportsBulk && (!action.isEligible || action.isEligible(item))
      );
    });
  }, [data, actions]);
  const selectedItems = data.filter(
    (item) => selection.includes(getItemId(item)) && selectableItems.includes(item)
  );
  const areAllSelected = selectedItems.length === selectableItems.length;
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
    import_components5.CheckboxControl,
    {
      className: "dataviews-view-table-selection-checkbox",
      checked: areAllSelected,
      indeterminate: !areAllSelected && !!selectedItems.length,
      onChange: () => {
        if (areAllSelected) {
          onChangeSelection([]);
        } else {
          onChangeSelection(
            selectableItems.map((item) => getItemId(item))
          );
        }
      },
      "aria-label": areAllSelected ? (0, import_i18n5.__)("Deselect all") : (0, import_i18n5.__)("Select all")
    }
  );
}
function ActionTrigger({
  action,
  onClick,
  isBusy,
  items
}) {
  const label = typeof action.label === "string" ? action.label : action.label(items);
  const isMobile = (0, import_compose2.useViewportMatch)("medium", "<");
  if (isMobile) {
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
      import_components5.Button,
      {
        disabled: isBusy,
        accessibleWhenDisabled: true,
        label,
        icon: action.icon,
        size: "compact",
        onClick,
        isBusy
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
    import_components5.Button,
    {
      disabled: isBusy,
      accessibleWhenDisabled: true,
      size: "compact",
      onClick,
      isBusy,
      children: label
    }
  );
}
var EMPTY_ARRAY2 = [];
function ActionButton({
  action,
  selectedItems,
  actionInProgress,
  setActionInProgress
}) {
  const registry = (0, import_data2.useRegistry)();
  const selectedEligibleItems = (0, import_element5.useMemo)(() => {
    return selectedItems.filter((item) => {
      return !action.isEligible || action.isEligible(item);
    });
  }, [action, selectedItems]);
  if ("RenderModal" in action) {
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
      ActionWithModal,
      {
        action,
        items: selectedEligibleItems,
        ActionTriggerComponent: ActionTrigger
      },
      action.id
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
    ActionTrigger,
    {
      action,
      onClick: async () => {
        setActionInProgress(action.id);
        await action.callback(selectedItems, {
          registry
        });
        setActionInProgress(null);
      },
      items: selectedEligibleItems,
      isBusy: actionInProgress === action.id
    },
    action.id
  );
}
function renderFooterContent(data, actions, getItemId, selection, actionsToShow, selectedItems, actionInProgress, setActionInProgress, onChangeSelection, paginationInfo) {
  const message2 = getFooterMessage(
    selection.length,
    data.length,
    paginationInfo.totalItems
  );
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)(
    Stack,
    {
      direction: "row",
      className: "dataviews-bulk-actions-footer__container",
      gap: "sm",
      align: "center",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
          BulkSelectionCheckbox,
          {
            selection,
            onChangeSelection,
            data,
            actions,
            getItemId
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("span", { className: "dataviews-bulk-actions-footer__item-count", children: message2 }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)(
          Stack,
          {
            direction: "row",
            className: "dataviews-bulk-actions-footer__action-buttons",
            gap: "2xs",
            children: [
              actionsToShow.map((action) => {
                return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
                  ActionButton,
                  {
                    action,
                    selectedItems,
                    actionInProgress,
                    setActionInProgress
                  },
                  action.id
                );
              }),
              selectedItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
                import_components5.Button,
                {
                  icon: close_small_default,
                  showTooltip: true,
                  tooltipPosition: "top",
                  size: "compact",
                  label: (0, import_i18n5.__)("Cancel"),
                  disabled: !!actionInProgress,
                  accessibleWhenDisabled: false,
                  onClick: () => {
                    onChangeSelection(EMPTY_ARRAY2);
                  }
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function FooterContent({
  selection,
  actions,
  onChangeSelection,
  data,
  getItemId,
  paginationInfo
}) {
  const [actionInProgress, setActionInProgress] = (0, import_element5.useState)(
    null
  );
  const footerContentRef = (0, import_element5.useRef)(null);
  const isMobile = (0, import_compose2.useViewportMatch)("medium", "<");
  const bulkActions = (0, import_element5.useMemo)(
    () => actions.filter((action) => action.supportsBulk),
    [actions]
  );
  const selectableItems = (0, import_element5.useMemo)(() => {
    return data.filter((item) => {
      return bulkActions.some(
        (action) => !action.isEligible || action.isEligible(item)
      );
    });
  }, [data, bulkActions]);
  const selectedItems = (0, import_element5.useMemo)(() => {
    return data.filter(
      (item) => selection.includes(getItemId(item)) && selectableItems.includes(item)
    );
  }, [selection, data, getItemId, selectableItems]);
  const actionsToShow = (0, import_element5.useMemo)(
    () => actions.filter((action) => {
      return action.supportsBulk && (!isMobile || action.icon) && selectedItems.some(
        (item) => !action.isEligible || action.isEligible(item)
      );
    }),
    [actions, selectedItems, isMobile]
  );
  if (!actionInProgress) {
    if (footerContentRef.current) {
      footerContentRef.current = null;
    }
    return renderFooterContent(
      data,
      actions,
      getItemId,
      selection,
      actionsToShow,
      selectedItems,
      actionInProgress,
      setActionInProgress,
      onChangeSelection,
      paginationInfo
    );
  } else if (!footerContentRef.current) {
    footerContentRef.current = renderFooterContent(
      data,
      actions,
      getItemId,
      selection,
      actionsToShow,
      selectedItems,
      actionInProgress,
      setActionInProgress,
      onChangeSelection,
      paginationInfo
    );
  }
  return footerContentRef.current;
}
function BulkActionsFooter() {
  const {
    data,
    selection,
    actions = EMPTY_ARRAY2,
    onChangeSelection,
    getItemId,
    paginationInfo
  } = (0, import_element5.useContext)(dataviews_context_default);
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
    FooterContent,
    {
      selection,
      onChangeSelection,
      data,
      actions,
      getItemId,
      paginationInfo
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/table/column-header-menu.mjs
var import_i18n6 = __toESM(require_i18n(), 1);
var import_components6 = __toESM(require_components(), 1);
var import_element6 = __toESM(require_element(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/utils/get-hideable-fields.mjs
function getHideableFields(view, fields) {
  const togglableFields = [
    view?.titleField,
    view?.mediaField,
    view?.descriptionField
  ].filter(Boolean);
  return fields.filter(
    (f2) => !togglableFields.includes(f2.id) && f2.type !== "media" && f2.enableHiding !== false
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/table/column-header-menu.mjs
var import_jsx_runtime32 = __toESM(require_jsx_runtime(), 1);
var { Menu: Menu2 } = unlock(import_components6.privateApis);
function WithMenuSeparators({ children }) {
  return import_element6.Children.toArray(children).filter(Boolean).map((child, i2) => /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(import_element6.Fragment, { children: [
    i2 > 0 && /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.Separator, {}),
    child
  ] }, i2));
}
var _HeaderMenu = (0, import_element6.forwardRef)(function HeaderMenu({
  fieldId,
  view,
  fields,
  onChangeView,
  onHide,
  setOpenedFilter,
  canMove = true,
  canInsertLeft = true,
  canInsertRight = true
}, ref) {
  const visibleFieldIds = view.fields ?? [];
  const index = visibleFieldIds?.indexOf(fieldId);
  const isSorted = view.sort?.field === fieldId;
  let isHidable = false;
  let isSortable = false;
  let canAddFilter = false;
  let operators = [];
  const field = fields.find((f2) => f2.id === fieldId);
  const { setIsShowingFilter } = (0, import_element6.useContext)(dataviews_context_default);
  if (!field) {
    return null;
  }
  isHidable = field.enableHiding !== false;
  isSortable = field.enableSorting !== false;
  const header = field.header;
  operators = !!field.filterBy && field.filterBy?.operators || [];
  canAddFilter = !view.filters?.some((_filter) => fieldId === _filter.field) && !!(field.hasElements || field.Edit) && field.filterBy !== false && !field.filterBy?.isPrimary;
  if (!isSortable && !canMove && !isHidable && !canAddFilter) {
    return header;
  }
  const hiddenFields = getHideableFields(view, fields).filter(
    (f2) => !visibleFieldIds.includes(f2.id)
  );
  const canInsert = (canInsertLeft || canInsertRight) && !!hiddenFields.length;
  const isRtl = (0, import_i18n6.isRTL)();
  return /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(Menu2, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(
      Menu2.TriggerButton,
      {
        render: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
          import_components6.Button,
          {
            size: "compact",
            className: "dataviews-view-table-header-button",
            ref,
            variant: "tertiary"
          }
        ),
        children: [
          header,
          view.sort && isSorted && /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("span", { "aria-hidden": "true", children: sortArrows[view.sort.direction] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.Popover, { style: { minWidth: "240px" }, children: /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(WithMenuSeparators, { children: [
      isSortable && /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.Group, { children: SORTING_DIRECTIONS.map(
        (direction) => {
          const isChecked = view.sort && isSorted && view.sort.direction === direction;
          const value = `${fieldId}-${direction}`;
          return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
            Menu2.RadioItem,
            {
              name: "view-table-sorting",
              value,
              checked: isChecked,
              onChange: () => {
                onChangeView({
                  ...view,
                  sort: {
                    field: fieldId,
                    direction
                  },
                  showLevels: false
                });
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.ItemLabel, { children: sortLabels[direction] })
            },
            value
          );
        }
      ) }),
      canAddFilter && /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.Group, { children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
        Menu2.Item,
        {
          prefix: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(import_components6.Icon, { icon: funnel_default }),
          onClick: () => {
            setOpenedFilter(fieldId);
            setIsShowingFilter(true);
            onChangeView({
              ...view,
              page: 1,
              filters: [
                ...view.filters || [],
                {
                  field: fieldId,
                  value: void 0,
                  operator: operators[0]
                }
              ]
            });
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.ItemLabel, { children: (0, import_i18n6.__)("Add filter") })
        }
      ) }),
      (canMove || isHidable || canInsert) && field && /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(Menu2.Group, { children: [
        canMove && /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
          Menu2.Item,
          {
            prefix: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(import_components6.Icon, { icon: arrow_left_default }),
            disabled: isRtl ? index >= visibleFieldIds.length - 1 : index < 1,
            onClick: () => {
              const targetIndex = isRtl ? index + 1 : index - 1;
              const newFields = [
                ...visibleFieldIds
              ];
              newFields.splice(index, 1);
              newFields.splice(
                targetIndex,
                0,
                fieldId
              );
              onChangeView({
                ...view,
                fields: newFields
              });
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.ItemLabel, { children: (0, import_i18n6.__)("Move left") })
          }
        ),
        canMove && /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
          Menu2.Item,
          {
            prefix: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(import_components6.Icon, { icon: arrow_right_default }),
            disabled: isRtl ? index < 1 : index >= visibleFieldIds.length - 1,
            onClick: () => {
              const targetIndex = isRtl ? index - 1 : index + 1;
              const newFields = [
                ...visibleFieldIds
              ];
              newFields.splice(index, 1);
              newFields.splice(
                targetIndex,
                0,
                fieldId
              );
              onChangeView({
                ...view,
                fields: newFields
              });
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.ItemLabel, { children: (0, import_i18n6.__)("Move right") })
          }
        ),
        canInsertLeft && !!hiddenFields.length && /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(Menu2, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.SubmenuTriggerItem, { children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.ItemLabel, { children: (0, import_i18n6.__)("Insert left") }) }),
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.Popover, { children: hiddenFields.map((hiddenField) => {
            const insertIndex = isRtl ? index + 1 : index;
            return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
              Menu2.Item,
              {
                onClick: () => {
                  onChangeView({
                    ...view,
                    fields: [
                      ...visibleFieldIds.slice(
                        0,
                        insertIndex
                      ),
                      hiddenField.id,
                      ...visibleFieldIds.slice(
                        insertIndex
                      )
                    ]
                  });
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.ItemLabel, { children: hiddenField.label })
              },
              hiddenField.id
            );
          }) })
        ] }),
        canInsertRight && !!hiddenFields.length && /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(Menu2, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.SubmenuTriggerItem, { children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.ItemLabel, { children: (0, import_i18n6.__)("Insert right") }) }),
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.Popover, { children: hiddenFields.map((hiddenField) => {
            const insertIndex = isRtl ? index : index + 1;
            return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
              Menu2.Item,
              {
                onClick: () => {
                  onChangeView({
                    ...view,
                    fields: [
                      ...visibleFieldIds.slice(
                        0,
                        insertIndex
                      ),
                      hiddenField.id,
                      ...visibleFieldIds.slice(
                        insertIndex
                      )
                    ]
                  });
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.ItemLabel, { children: hiddenField.label })
              },
              hiddenField.id
            );
          }) })
        ] }),
        isHidable && field && /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
          Menu2.Item,
          {
            prefix: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(import_components6.Icon, { icon: unseen_default }),
            onClick: () => {
              onHide(field);
              onChangeView({
                ...view,
                fields: visibleFieldIds.filter(
                  (id) => id !== fieldId
                )
              });
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Menu2.ItemLabel, { children: (0, import_i18n6.__)("Hide column") })
          }
        )
      ] })
    ] }) })
  ] });
});
var ColumnHeaderMenu = _HeaderMenu;
var column_header_menu_default = ColumnHeaderMenu;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/utils/item-click-wrapper.mjs
var import_element7 = __toESM(require_element(), 1);
var import_jsx_runtime33 = __toESM(require_jsx_runtime(), 1);
function getClickableItemProps({
  item,
  isItemClickable,
  onClickItem,
  className
}) {
  if (!isItemClickable(item) || !onClickItem) {
    return { className };
  }
  return {
    className: className ? `${className} ${className}--clickable` : void 0,
    role: "button",
    tabIndex: 0,
    onClick: (event) => {
      event.stopPropagation();
      onClickItem(item);
    },
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === "" || event.key === " ") {
        event.stopPropagation();
        onClickItem(item);
      }
    }
  };
}
function ItemClickWrapper({
  item,
  isItemClickable,
  onClickItem,
  renderItemLink,
  className,
  children,
  ...extraProps
}) {
  if (!isItemClickable(item)) {
    return /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("div", { className, ...extraProps, children });
  }
  if (renderItemLink) {
    const renderedElement = renderItemLink({
      item,
      className: `${className} ${className}--clickable`,
      ...extraProps,
      children
    });
    return (0, import_element7.cloneElement)(renderedElement, {
      onClick: (event) => {
        event.stopPropagation();
        if (renderedElement.props.onClick) {
          renderedElement.props.onClick(event);
        }
      },
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === "" || event.key === " ") {
          event.stopPropagation();
          if (renderedElement.props.onKeyDown) {
            renderedElement.props.onKeyDown(event);
          }
        }
      }
    });
  }
  const clickProps = getClickableItemProps({
    item,
    isItemClickable,
    onClickItem,
    className
  });
  return /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("div", { ...clickProps, ...extraProps, children });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/table/column-primary.mjs
var import_jsx_runtime34 = __toESM(require_jsx_runtime(), 1);
function ColumnPrimary({
  item,
  level,
  titleField,
  mediaField,
  descriptionField,
  onClickItem,
  renderItemLink,
  isItemClickable
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)(Stack, { direction: "row", gap: "sm", align: "flex-start", justify: "flex-start", children: [
    mediaField && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
      ItemClickWrapper,
      {
        item,
        isItemClickable,
        onClickItem,
        renderItemLink,
        className: "dataviews-view-table__cell-content-wrapper dataviews-column-primary__media",
        "aria-label": isItemClickable(item) && (!!onClickItem || !!renderItemLink) && !!titleField ? titleField.getValue?.({ item }) : void 0,
        children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
          mediaField.render,
          {
            item,
            field: mediaField,
            config: { sizes: "32px" }
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)(
      Stack,
      {
        direction: "column",
        align: "flex-start",
        className: "dataviews-view-table__primary-column-content",
        children: [
          titleField && /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)(
            ItemClickWrapper,
            {
              item,
              isItemClickable,
              onClickItem,
              renderItemLink,
              className: "dataviews-view-table__cell-content-wrapper dataviews-title-field",
              children: [
                level !== void 0 && level > 0 && /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("span", { className: "dataviews-view-table__level", children: [
                  Array(level).fill("\u2014").join(" "),
                  "\xA0"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(titleField.render, { item, field: titleField })
              ]
            }
          ),
          descriptionField && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
            descriptionField.render,
            {
              item,
              field: descriptionField
            }
          )
        ]
      }
    )
  ] });
}
var column_primary_default = ColumnPrimary;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/table/use-is-horizontal-scroll-end.mjs
var import_compose3 = __toESM(require_compose(), 1);
var import_element8 = __toESM(require_element(), 1);
var import_i18n7 = __toESM(require_i18n(), 1);
var isScrolledToEnd = (element) => {
  if ((0, import_i18n7.isRTL)()) {
    const scrollLeft = Math.abs(element.scrollLeft);
    return scrollLeft <= 1;
  }
  return element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;
};
function useIsHorizontalScrollEnd({
  scrollContainerRef,
  enabled = false
}) {
  const [isHorizontalScrollEnd, setIsHorizontalScrollEnd] = (0, import_element8.useState)(false);
  const handleIsHorizontalScrollEnd = (0, import_compose3.useDebounce)(
    (0, import_element8.useCallback)(() => {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        setIsHorizontalScrollEnd(isScrolledToEnd(scrollContainer));
      }
    }, [scrollContainerRef, setIsHorizontalScrollEnd]),
    200
  );
  (0, import_element8.useEffect)(() => {
    if (typeof window === "undefined" || !enabled || !scrollContainerRef.current) {
      return () => {
      };
    }
    handleIsHorizontalScrollEnd();
    scrollContainerRef.current.addEventListener(
      "scroll",
      handleIsHorizontalScrollEnd
    );
    window.addEventListener("resize", handleIsHorizontalScrollEnd);
    return () => {
      scrollContainerRef.current?.removeEventListener(
        "scroll",
        handleIsHorizontalScrollEnd
      );
      window.removeEventListener("resize", handleIsHorizontalScrollEnd);
    };
  }, [scrollContainerRef, enabled]);
  return isHorizontalScrollEnd;
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/utils/get-data-by-group.mjs
function getDataByGroup(data, groupByField) {
  return data.reduce((groups, item) => {
    const groupName = groupByField.getValue({ item });
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName)?.push(item);
    return groups;
  }, /* @__PURE__ */ new Map());
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-view-config/properties-section.mjs
var import_components7 = __toESM(require_components(), 1);
var import_i18n8 = __toESM(require_i18n(), 1);
var import_element9 = __toESM(require_element(), 1);
var import_jsx_runtime35 = __toESM(require_jsx_runtime(), 1);
function FieldItem({
  field,
  isVisible: isVisible2,
  onToggleVisibility
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(import_components7.__experimentalItem, { onClick: field.enableHiding ? onToggleVisibility : void 0, children: /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)(Stack, { direction: "row", gap: "xs", justify: "flex-start", align: "center", children: [
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("div", { style: { height: 24, width: 24 }, children: isVisible2 && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(import_components7.Icon, { icon: check_default }) }),
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("span", { className: "dataviews-view-config__label", children: field.label })
  ] }) });
}
function isDefined(item) {
  return !!item;
}
function PropertiesSection({
  showLabel = true
}) {
  const { view, fields, onChangeView } = (0, import_element9.useContext)(dataviews_context_default);
  const regularFields = getHideableFields(view, fields);
  if (!regularFields?.length) {
    return null;
  }
  const titleField = fields.find((f2) => f2.id === view.titleField);
  const previewField = fields.find((f2) => f2.id === view.mediaField);
  const descriptionField = fields.find(
    (f2) => f2.id === view.descriptionField
  );
  const lockedFields = [
    {
      field: titleField,
      isVisibleFlag: "showTitle"
    },
    {
      field: previewField,
      isVisibleFlag: "showMedia"
    },
    {
      field: descriptionField,
      isVisibleFlag: "showDescription"
    }
  ].filter(({ field }) => isDefined(field));
  const visibleFieldIds = view.fields ?? [];
  const visibleRegularFieldsCount = regularFields.filter(
    (f2) => visibleFieldIds.includes(f2.id)
  ).length;
  const visibleLockedFields = lockedFields.filter(
    ({ isVisibleFlag }) => (
      // @ts-expect-error
      view[isVisibleFlag] ?? true
    )
  );
  const totalVisibleFields = visibleLockedFields.length + visibleRegularFieldsCount;
  const isSingleVisibleLockedField = totalVisibleFields === 1 && visibleLockedFields.length === 1;
  return /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)(Stack, { direction: "column", className: "dataviews-field-control", children: [
    showLabel && /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(import_components7.BaseControl.VisualLabel, { children: (0, import_i18n8.__)("Properties") }),
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(
      Stack,
      {
        direction: "column",
        className: "dataviews-view-config__properties",
        children: /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)(import_components7.__experimentalItemGroup, { isBordered: true, isSeparated: true, size: "medium", children: [
          lockedFields.map(({ field, isVisibleFlag }) => {
            const isVisible2 = view[isVisibleFlag] ?? true;
            const fieldToRender = isSingleVisibleLockedField && isVisible2 ? { ...field, enableHiding: false } : field;
            return /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(
              FieldItem,
              {
                field: fieldToRender,
                isVisible: isVisible2,
                onToggleVisibility: () => {
                  onChangeView({
                    ...view,
                    [isVisibleFlag]: !isVisible2
                  });
                }
              },
              field.id
            );
          }),
          regularFields.map((field) => {
            const isVisible2 = visibleFieldIds.includes(field.id);
            const fieldToRender = totalVisibleFields === 1 && isVisible2 ? { ...field, enableHiding: false } : field;
            return /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(
              FieldItem,
              {
                field: fieldToRender,
                isVisible: isVisible2,
                onToggleVisibility: () => {
                  onChangeView({
                    ...view,
                    fields: isVisible2 ? visibleFieldIds.filter(
                      (fieldId) => fieldId !== field.id
                    ) : [...visibleFieldIds, field.id]
                  });
                }
              },
              field.id
            );
          })
        ] })
      }
    )
  ] });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/table/index.mjs
var import_jsx_runtime36 = __toESM(require_jsx_runtime(), 1);
function TableColumnField({
  item,
  fields,
  column,
  align
}) {
  const field = fields.find((f2) => f2.id === column);
  if (!field) {
    return null;
  }
  const className = clsx_default("dataviews-view-table__cell-content-wrapper", {
    "dataviews-view-table__cell-align-end": align === "end",
    "dataviews-view-table__cell-align-center": align === "center"
  });
  return /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("div", { className, children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(field.render, { item, field }) });
}
function TableRow({
  hasBulkActions,
  item,
  level,
  actions,
  fields,
  id,
  view,
  titleField,
  mediaField,
  descriptionField,
  selection,
  getItemId,
  isItemClickable,
  onClickItem,
  renderItemLink,
  onChangeSelection,
  isActionsColumnSticky,
  posinset
}) {
  const { paginationInfo } = (0, import_element10.useContext)(dataviews_context_default);
  const hasPossibleBulkAction = useHasAPossibleBulkAction(actions, item);
  const isSelected2 = hasPossibleBulkAction && selection.includes(id);
  const {
    showTitle = true,
    showMedia = true,
    showDescription = true,
    infiniteScrollEnabled
  } = view;
  const isTouchDeviceRef = (0, import_element10.useRef)(false);
  const columns = view.fields ?? [];
  const hasPrimaryColumn = titleField && showTitle || mediaField && showMedia || descriptionField && showDescription;
  return /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)(
    "tr",
    {
      className: clsx_default("dataviews-view-table__row", {
        "is-selected": hasPossibleBulkAction && isSelected2,
        "has-bulk-actions": hasPossibleBulkAction
      }),
      onTouchStart: () => {
        isTouchDeviceRef.current = true;
      },
      "aria-setsize": infiniteScrollEnabled ? paginationInfo.totalItems : void 0,
      "aria-posinset": posinset,
      role: infiniteScrollEnabled ? "article" : void 0,
      onMouseDown: (event) => {
        const isMetaClick = (0, import_keycodes.isAppleOS)() ? event.metaKey : event.ctrlKey;
        if (event.button === 0 && isMetaClick && window.navigator.userAgent.toLowerCase().includes("firefox")) {
          event?.preventDefault();
        }
      },
      onClick: (event) => {
        if (!hasPossibleBulkAction) {
          return;
        }
        const isModifierKeyPressed = (0, import_keycodes.isAppleOS)() ? event.metaKey : event.ctrlKey;
        if (isModifierKeyPressed && !isTouchDeviceRef.current && document.getSelection()?.type !== "Range") {
          onChangeSelection(
            selection.includes(id) ? selection.filter((itemId) => id !== itemId) : [...selection, id]
          );
        }
      },
      children: [
        hasBulkActions && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("td", { className: "dataviews-view-table__checkbox-column", children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("div", { className: "dataviews-view-table__cell-content-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
          DataViewsSelectionCheckbox,
          {
            item,
            selection,
            onChangeSelection,
            getItemId,
            titleField,
            disabled: !hasPossibleBulkAction
          }
        ) }) }),
        hasPrimaryColumn && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
          column_primary_default,
          {
            item,
            level,
            titleField: showTitle ? titleField : void 0,
            mediaField: showMedia ? mediaField : void 0,
            descriptionField: showDescription ? descriptionField : void 0,
            isItemClickable,
            onClickItem,
            renderItemLink
          }
        ) }),
        columns.map((column) => {
          const { width, maxWidth, minWidth, align } = view.layout?.styles?.[column] ?? {};
          return /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
            "td",
            {
              style: {
                width,
                maxWidth,
                minWidth
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
                TableColumnField,
                {
                  fields,
                  item,
                  column,
                  align
                }
              )
            },
            column
          );
        }),
        !!actions?.length && // Disable reason: we are not making the element interactive,
        // but preventing any click events from bubbling up to the
        // table row. This allows us to add a click handler to the row
        // itself (to toggle row selection) without erroneously
        // intercepting click events from ItemActions.
        /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
        /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
          "td",
          {
            className: clsx_default("dataviews-view-table__actions-column", {
              "dataviews-view-table__actions-column--sticky": true,
              "dataviews-view-table__actions-column--stuck": isActionsColumnSticky
            }),
            onClick: (e2) => e2.stopPropagation(),
            children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(ItemActions, { item, actions })
          }
        )
      ]
    }
  );
}
function ViewTable({
  actions,
  data,
  fields,
  getItemId,
  getItemLevel,
  isLoading = false,
  onChangeView,
  onChangeSelection,
  selection,
  setOpenedFilter,
  onClickItem,
  isItemClickable,
  renderItemLink,
  view,
  className,
  empty
}) {
  const { containerRef } = (0, import_element10.useContext)(dataviews_context_default);
  const headerMenuRefs = (0, import_element10.useRef)(/* @__PURE__ */ new Map());
  const headerMenuToFocusRef = (0, import_element10.useRef)();
  const [nextHeaderMenuToFocus, setNextHeaderMenuToFocus] = (0, import_element10.useState)();
  const hasBulkActions = useSomeItemHasAPossibleBulkAction(actions, data);
  const [contextMenuAnchor, setContextMenuAnchor] = (0, import_element10.useState)(null);
  (0, import_element10.useEffect)(() => {
    if (headerMenuToFocusRef.current) {
      headerMenuToFocusRef.current.focus();
      headerMenuToFocusRef.current = void 0;
    }
  });
  const tableNoticeId = (0, import_element10.useId)();
  const isHorizontalScrollEnd = useIsHorizontalScrollEnd({
    scrollContainerRef: containerRef,
    enabled: !!actions?.length
  });
  if (nextHeaderMenuToFocus) {
    headerMenuToFocusRef.current = nextHeaderMenuToFocus;
    setNextHeaderMenuToFocus(void 0);
    return;
  }
  const onHide = (field) => {
    const hidden = headerMenuRefs.current.get(field.id);
    const fallback = hidden ? headerMenuRefs.current.get(hidden.fallback) : void 0;
    setNextHeaderMenuToFocus(fallback?.node);
  };
  const handleHeaderContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const virtualAnchor = {
      getBoundingClientRect: () => ({
        x: event.clientX,
        y: event.clientY,
        top: event.clientY,
        left: event.clientX,
        right: event.clientX,
        bottom: event.clientY,
        width: 0,
        height: 0,
        toJSON: () => ({})
      })
    };
    window.requestAnimationFrame(() => {
      setContextMenuAnchor(virtualAnchor);
    });
  };
  const hasData = !!data?.length;
  const titleField = fields.find((field) => field.id === view.titleField);
  const mediaField = fields.find((field) => field.id === view.mediaField);
  const descriptionField = fields.find(
    (field) => field.id === view.descriptionField
  );
  const groupField = view.groupBy?.field ? fields.find((f2) => f2.id === view.groupBy?.field) : null;
  const dataByGroup = groupField ? getDataByGroup(data, groupField) : null;
  const { showTitle = true, showMedia = true, showDescription = true } = view;
  const hasPrimaryColumn = titleField && showTitle || mediaField && showMedia || descriptionField && showDescription;
  const columns = view.fields ?? [];
  const headerMenuRef = (column, index) => (node) => {
    if (node) {
      headerMenuRefs.current.set(column, {
        node,
        fallback: columns[index > 0 ? index - 1 : 1]
      });
    } else {
      headerMenuRefs.current.delete(column);
    }
  };
  const isInfiniteScroll = view.infiniteScrollEnabled && !dataByGroup;
  const isRtl = (0, import_i18n9.isRTL)();
  return /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)(import_jsx_runtime36.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)(
      "table",
      {
        className: clsx_default("dataviews-view-table", className, {
          [`has-${view.layout?.density}-density`]: view.layout?.density && ["compact", "comfortable"].includes(
            view.layout.density
          ),
          "has-bulk-actions": hasBulkActions
        }),
        "aria-busy": isLoading,
        "aria-describedby": tableNoticeId,
        role: isInfiniteScroll ? "feed" : void 0,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("colgroup", { children: [
            hasBulkActions && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("col", { className: "dataviews-view-table__col-checkbox" }),
            hasPrimaryColumn && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("col", { className: "dataviews-view-table__col-first-data" }),
            columns.map((column, index) => /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
              "col",
              {
                className: clsx_default(
                  `dataviews-view-table__col-${column}`,
                  {
                    "dataviews-view-table__col-first-data": !hasPrimaryColumn && index === 0
                  }
                )
              },
              `col-${column}`
            )),
            !!actions?.length && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("col", { className: "dataviews-view-table__col-actions" })
          ] }),
          contextMenuAnchor && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
            import_components8.Popover,
            {
              anchor: contextMenuAnchor,
              onClose: () => setContextMenuAnchor(null),
              placement: "bottom-start",
              children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(PropertiesSection, { showLabel: false })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("thead", { onContextMenu: handleHeaderContextMenu, children: /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("tr", { className: "dataviews-view-table__row", children: [
            hasBulkActions && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
              "th",
              {
                className: "dataviews-view-table__checkbox-column",
                scope: "col",
                onContextMenu: handleHeaderContextMenu,
                children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
                  BulkSelectionCheckbox,
                  {
                    selection,
                    onChangeSelection,
                    data,
                    actions,
                    getItemId
                  }
                )
              }
            ),
            hasPrimaryColumn && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("th", { scope: "col", children: titleField && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
              column_header_menu_default,
              {
                ref: headerMenuRef(
                  titleField.id,
                  0
                ),
                fieldId: titleField.id,
                view,
                fields,
                onChangeView,
                onHide,
                setOpenedFilter,
                canMove: false,
                canInsertLeft: isRtl ? view.layout?.enableMoving ?? true : false,
                canInsertRight: isRtl ? false : view.layout?.enableMoving ?? true
              }
            ) }),
            columns.map((column, index) => {
              const { width, maxWidth, minWidth, align } = view.layout?.styles?.[column] ?? {};
              const canInsertOrMove = view.layout?.enableMoving ?? true;
              return /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
                "th",
                {
                  style: {
                    width,
                    maxWidth,
                    minWidth,
                    textAlign: align
                  },
                  "aria-sort": view.sort?.direction && view.sort?.field === column ? sortValues[view.sort.direction] : void 0,
                  scope: "col",
                  children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
                    column_header_menu_default,
                    {
                      ref: headerMenuRef(column, index),
                      fieldId: column,
                      view,
                      fields,
                      onChangeView,
                      onHide,
                      setOpenedFilter,
                      canMove: canInsertOrMove,
                      canInsertLeft: canInsertOrMove,
                      canInsertRight: canInsertOrMove
                    }
                  )
                },
                column
              );
            }),
            !!actions?.length && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
              "th",
              {
                className: clsx_default(
                  "dataviews-view-table__actions-column",
                  {
                    "dataviews-view-table__actions-column--sticky": true,
                    "dataviews-view-table__actions-column--stuck": !isHorizontalScrollEnd
                  }
                ),
                children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("span", { className: "dataviews-view-table-header", children: (0, import_i18n9.__)("Actions") })
              }
            )
          ] }) }),
          hasData && groupField && dataByGroup ? Array.from(dataByGroup.entries()).map(
            ([groupName, groupItems]) => /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("tbody", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("tr", { className: "dataviews-view-table__group-header-row", children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
                "td",
                {
                  colSpan: columns.length + (hasPrimaryColumn ? 1 : 0) + (hasBulkActions ? 1 : 0) + (actions?.length ? 1 : 0),
                  className: "dataviews-view-table__group-header-cell",
                  children: view.groupBy?.showLabel === false ? groupName : (0, import_i18n9.sprintf)(
                    // translators: 1: The label of the field e.g. "Date". 2: The value of the field, e.g.: "May 2022".
                    (0, import_i18n9.__)("%1$s: %2$s"),
                    groupField.label,
                    groupName
                  )
                }
              ) }),
              groupItems.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
                TableRow,
                {
                  item,
                  level: view.showLevels && typeof getItemLevel === "function" ? getItemLevel(item) : void 0,
                  hasBulkActions,
                  actions,
                  fields,
                  id: getItemId(item) || index.toString(),
                  view,
                  titleField,
                  mediaField,
                  descriptionField,
                  selection,
                  getItemId,
                  onChangeSelection,
                  onClickItem,
                  renderItemLink,
                  isItemClickable,
                  isActionsColumnSticky: !isHorizontalScrollEnd
                },
                getItemId(item)
              ))
            ] }, `group-${groupName}`)
          ) : /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("tbody", { children: hasData && data.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(
            TableRow,
            {
              item,
              level: view.showLevels && typeof getItemLevel === "function" ? getItemLevel(item) : void 0,
              hasBulkActions,
              actions,
              fields,
              id: getItemId(item) || index.toString(),
              view,
              titleField,
              mediaField,
              descriptionField,
              selection,
              getItemId,
              onChangeSelection,
              onClickItem,
              renderItemLink,
              isItemClickable,
              isActionsColumnSticky: !isHorizontalScrollEnd,
              posinset: isInfiniteScroll ? index + 1 : void 0
            },
            getItemId(item)
          )) })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)(
      "div",
      {
        className: clsx_default({
          "dataviews-loading": isLoading,
          "dataviews-no-results": !hasData && !isLoading
        }),
        id: tableNoticeId,
        children: [
          !hasData && (isLoading ? /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(import_components8.Spinner, {}) }) : empty),
          hasData && isLoading && /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("p", { className: "dataviews-loading-more", children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(import_components8.Spinner, {}) })
        ]
      }
    )
  ] });
}
var table_default = ViewTable;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/grid/index.mjs
var import_components11 = __toESM(require_components(), 1);
var import_i18n12 = __toESM(require_i18n(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/grid/composite-grid.mjs
var import_components10 = __toESM(require_components(), 1);
var import_i18n11 = __toESM(require_i18n(), 1);
var import_compose4 = __toESM(require_compose(), 1);
var import_keycodes2 = __toESM(require_keycodes(), 1);
var import_element12 = __toESM(require_element(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/grid/preview-size-picker.mjs
var import_components9 = __toESM(require_components(), 1);
var import_i18n10 = __toESM(require_i18n(), 1);
var import_element11 = __toESM(require_element(), 1);
var import_jsx_runtime37 = __toESM(require_jsx_runtime(), 1);
var imageSizes = [
  {
    value: 120,
    breakpoint: 1
  },
  {
    value: 170,
    breakpoint: 1
  },
  {
    value: 230,
    breakpoint: 1
  },
  {
    value: 290,
    breakpoint: 1112
    // at minimum image width, 4 images display at this container size
  },
  {
    value: 350,
    breakpoint: 1636
    // at minimum image width, 6 images display at this container size
  },
  {
    value: 430,
    breakpoint: 588
    // at minimum image width, 2 images display at this container size
  }
];
var DEFAULT_PREVIEW_SIZE = imageSizes[2].value;
function useGridColumns() {
  const context = (0, import_element11.useContext)(dataviews_context_default);
  const view = context.view;
  return (0, import_element11.useMemo)(() => {
    const containerWidth = context.containerWidth;
    const gap = 32;
    const previewSize = view.layout?.previewSize ?? DEFAULT_PREVIEW_SIZE;
    const columns = Math.floor(
      (containerWidth + gap) / (previewSize + gap)
    );
    return Math.max(1, columns);
  }, [context.containerWidth, view.layout?.previewSize]);
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/grid/composite-grid.mjs
var import_jsx_runtime38 = __toESM(require_jsx_runtime(), 1);
var { Badge } = unlock(import_components10.privateApis);
function chunk(array, size) {
  const chunks = [];
  for (let i2 = 0, j2 = array.length; i2 < j2; i2 += size) {
    chunks.push(array.slice(i2, i2 + size));
  }
  return chunks;
}
var GridItem = (0, import_element12.forwardRef)(function GridItem2({
  view,
  selection,
  onChangeSelection,
  onClickItem,
  isItemClickable,
  renderItemLink,
  getItemId,
  item,
  actions,
  mediaField,
  titleField,
  descriptionField,
  regularFields,
  badgeFields,
  hasBulkActions,
  config,
  ...props
}, ref) {
  const { showTitle = true, showMedia = true, showDescription = true } = view;
  const hasBulkAction = useHasAPossibleBulkAction(actions, item);
  const id = getItemId(item);
  const instanceId = (0, import_compose4.useInstanceId)(GridItem2);
  const isSelected2 = selection.includes(id);
  const renderedMediaField = mediaField?.render ? /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
    mediaField.render,
    {
      item,
      field: mediaField,
      config
    }
  ) : null;
  const renderedTitleField = showTitle && titleField?.render ? /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(titleField.render, { item, field: titleField }) : null;
  const shouldRenderMedia = showMedia && renderedMediaField;
  let mediaA11yProps;
  let titleA11yProps;
  if (isItemClickable(item) && onClickItem) {
    if (renderedTitleField) {
      mediaA11yProps = {
        "aria-labelledby": `dataviews-view-grid__title-field-${instanceId}`
      };
      titleA11yProps = {
        id: `dataviews-view-grid__title-field-${instanceId}`
      };
    } else {
      mediaA11yProps = {
        "aria-label": (0, import_i18n11.__)("Navigate to item")
      };
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)(
    Stack,
    {
      direction: "column",
      ...props,
      ref,
      className: clsx_default(
        props.className,
        "dataviews-view-grid__row__gridcell",
        "dataviews-view-grid__card",
        {
          "is-selected": hasBulkAction && isSelected2
        }
      ),
      onClickCapture: (event) => {
        props.onClickCapture?.(event);
        if ((0, import_keycodes2.isAppleOS)() ? event.metaKey : event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          if (!hasBulkAction) {
            return;
          }
          onChangeSelection(
            selection.includes(id) ? selection.filter((itemId) => id !== itemId) : [...selection, id]
          );
        }
      },
      children: [
        shouldRenderMedia && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
          ItemClickWrapper,
          {
            item,
            isItemClickable,
            onClickItem,
            renderItemLink,
            className: "dataviews-view-grid__media",
            ...mediaA11yProps,
            children: renderedMediaField
          }
        ),
        hasBulkActions && shouldRenderMedia && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
          DataViewsSelectionCheckbox,
          {
            item,
            selection,
            onChangeSelection,
            getItemId,
            titleField,
            disabled: !hasBulkAction
          }
        ),
        !showTitle && shouldRenderMedia && !!actions?.length && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("div", { className: "dataviews-view-grid__media-actions", children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(ItemActions, { item, actions, isCompact: true }) }),
        showTitle && /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)(
          Stack,
          {
            direction: "row",
            gap: "xs",
            className: "dataviews-view-grid__title-actions",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
                ItemClickWrapper,
                {
                  item,
                  isItemClickable,
                  onClickItem,
                  renderItemLink,
                  className: "dataviews-view-grid__title-field dataviews-title-field",
                  ...titleA11yProps,
                  children: renderedTitleField
                }
              ),
              !!actions?.length && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
                ItemActions,
                {
                  item,
                  actions,
                  isCompact: true
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)(Stack, { direction: "column", gap: "2xs", children: [
          showDescription && descriptionField?.render && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
            descriptionField.render,
            {
              item,
              field: descriptionField
            }
          ),
          !!badgeFields?.length && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
            Stack,
            {
              direction: "row",
              className: "dataviews-view-grid__badge-fields",
              gap: "xs",
              wrap: "wrap",
              align: "top",
              justify: "flex-start",
              children: badgeFields.map((field) => {
                return /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
                  Badge,
                  {
                    className: "dataviews-view-grid__field-value",
                    children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
                      field.render,
                      {
                        item,
                        field
                      }
                    )
                  },
                  field.id
                );
              })
            }
          ),
          !!regularFields?.length && /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
            Stack,
            {
              direction: "column",
              className: "dataviews-view-grid__fields",
              gap: "2xs",
              children: regularFields.map((field) => {
                return /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
                  import_components10.Flex,
                  {
                    className: "dataviews-view-grid__field",
                    gap: 1,
                    justify: "flex-start",
                    expanded: true,
                    style: { height: "auto" },
                    direction: "row",
                    children: /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)(import_jsx_runtime38.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(import_components10.Tooltip, { text: field.label, children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(import_components10.FlexItem, { className: "dataviews-view-grid__field-name", children: field.header }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
                        import_components10.FlexItem,
                        {
                          className: "dataviews-view-grid__field-value",
                          style: { maxHeight: "none" },
                          children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
                            field.render,
                            {
                              item,
                              field
                            }
                          )
                        }
                      )
                    ] })
                  },
                  field.id
                );
              })
            }
          )
        ] })
      ]
    }
  );
});
function CompositeGrid({
  data,
  isInfiniteScroll,
  className,
  isLoading,
  view,
  fields,
  selection,
  onChangeSelection,
  onClickItem,
  isItemClickable,
  renderItemLink,
  getItemId,
  actions
}) {
  const { paginationInfo, resizeObserverRef } = (0, import_element12.useContext)(dataviews_context_default);
  const gridColumns = useGridColumns();
  const hasBulkActions = useSomeItemHasAPossibleBulkAction(actions, data);
  const titleField = fields.find(
    (field) => field.id === view?.titleField
  );
  const mediaField = fields.find(
    (field) => field.id === view?.mediaField
  );
  const descriptionField = fields.find(
    (field) => field.id === view?.descriptionField
  );
  const otherFields = view.fields ?? [];
  const { regularFields, badgeFields } = otherFields.reduce(
    (accumulator, fieldId) => {
      const field = fields.find((f2) => f2.id === fieldId);
      if (!field) {
        return accumulator;
      }
      const key = view.layout?.badgeFields?.includes(fieldId) ? "badgeFields" : "regularFields";
      accumulator[key].push(field);
      return accumulator;
    },
    { regularFields: [], badgeFields: [] }
  );
  const size = "900px";
  const totalRows = Math.ceil(data.length / gridColumns);
  return /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
    import_components10.Composite,
    {
      role: isInfiniteScroll ? "feed" : "grid",
      className: clsx_default("dataviews-view-grid", className),
      focusWrap: true,
      "aria-busy": isLoading,
      "aria-rowcount": isInfiniteScroll ? void 0 : totalRows,
      ref: resizeObserverRef,
      children: chunk(data, gridColumns).map((row, i2) => /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
        import_components10.Composite.Row,
        {
          render: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
            "div",
            {
              role: "row",
              "aria-rowindex": i2 + 1,
              "aria-label": (0, import_i18n11.sprintf)(
                /* translators: %d: The row number in the grid */
                (0, import_i18n11.__)("Row %d"),
                i2 + 1
              ),
              className: "dataviews-view-grid__row",
              style: {
                gridTemplateColumns: `repeat( ${gridColumns}, minmax(0, 1fr) )`
              }
            }
          ),
          children: row.map((item, indexInRow) => {
            const index = i2 * gridColumns + indexInRow;
            return /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
              import_components10.Composite.Item,
              {
                render: (props) => /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(
                  GridItem,
                  {
                    ...props,
                    role: isInfiniteScroll ? "article" : "gridcell",
                    "aria-setsize": isInfiniteScroll ? paginationInfo.totalItems : void 0,
                    "aria-posinset": isInfiniteScroll ? index + 1 : void 0,
                    view,
                    selection,
                    onChangeSelection,
                    onClickItem,
                    isItemClickable,
                    renderItemLink,
                    getItemId,
                    item,
                    actions,
                    mediaField,
                    titleField,
                    descriptionField,
                    regularFields,
                    badgeFields,
                    hasBulkActions,
                    config: {
                      sizes: size
                    }
                  }
                )
              },
              getItemId(item)
            );
          })
        },
        i2
      ))
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/grid/index.mjs
var import_jsx_runtime39 = __toESM(require_jsx_runtime(), 1);
function ViewGrid({
  actions,
  data,
  fields,
  getItemId,
  isLoading,
  onChangeSelection,
  onClickItem,
  isItemClickable,
  renderItemLink,
  selection,
  view,
  className,
  empty
}) {
  const hasData = !!data?.length;
  const groupField = view.groupBy?.field ? fields.find((f2) => f2.id === view.groupBy?.field) : null;
  const dataByGroup = groupField ? getDataByGroup(data, groupField) : null;
  const isInfiniteScroll = view.infiniteScrollEnabled && !dataByGroup;
  const gridProps = {
    className,
    isLoading,
    view,
    fields,
    selection,
    onChangeSelection,
    onClickItem,
    isItemClickable,
    renderItemLink,
    getItemId,
    actions
  };
  return /* @__PURE__ */ (0, import_jsx_runtime39.jsxs)(import_jsx_runtime39.Fragment, {
    // Render multiple groups.
    children: [
      hasData && groupField && dataByGroup && /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(Stack, { direction: "column", gap: "md", children: Array.from(dataByGroup.entries()).map(
        ([groupName, groupItems]) => /* @__PURE__ */ (0, import_jsx_runtime39.jsxs)(
          Stack,
          {
            direction: "column",
            gap: "xs",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("h3", { className: "dataviews-view-grid__group-header", children: view.groupBy?.showLabel === false ? groupName : (0, import_i18n12.sprintf)(
                // translators: 1: The label of the field e.g. "Date". 2: The value of the field, e.g.: "May 2022".
                (0, import_i18n12.__)("%1$s: %2$s"),
                groupField.label,
                groupName
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(
                CompositeGrid,
                {
                  ...gridProps,
                  data: groupItems,
                  isInfiniteScroll: false
                }
              )
            ]
          },
          groupName
        )
      ) }),
      // Render a single grid with all data.
      hasData && !dataByGroup && /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(
        CompositeGrid,
        {
          ...gridProps,
          data,
          isInfiniteScroll: !!isInfiniteScroll
        }
      ),
      // Render empty state.
      !hasData && /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(
        "div",
        {
          className: clsx_default({
            "dataviews-loading": isLoading,
            "dataviews-no-results": !isLoading
          }),
          children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(import_components11.Spinner, {}) }) : empty
        }
      ),
      hasData && isLoading && /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("p", { className: "dataviews-loading-more", children: /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(import_components11.Spinner, {}) })
    ]
  });
}
var grid_default = ViewGrid;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/list/index.mjs
var import_compose5 = __toESM(require_compose(), 1);
var import_components12 = __toESM(require_components(), 1);
var import_element13 = __toESM(require_element(), 1);
var import_i18n13 = __toESM(require_i18n(), 1);
var import_data3 = __toESM(require_data(), 1);
var import_jsx_runtime40 = __toESM(require_jsx_runtime(), 1);
var { Menu: Menu3 } = unlock(import_components12.privateApis);
function generateItemWrapperCompositeId(idPrefix) {
  return `${idPrefix}-item-wrapper`;
}
function generatePrimaryActionCompositeId(idPrefix, primaryActionId) {
  return `${idPrefix}-primary-action-${primaryActionId}`;
}
function generateDropdownTriggerCompositeId(idPrefix) {
  return `${idPrefix}-dropdown`;
}
function PrimaryActionGridCell({
  idPrefix,
  primaryAction,
  item
}) {
  const registry = (0, import_data3.useRegistry)();
  const [isModalOpen, setIsModalOpen] = (0, import_element13.useState)(false);
  const compositeItemId = generatePrimaryActionCompositeId(
    idPrefix,
    primaryAction.id
  );
  const label = typeof primaryAction.label === "string" ? primaryAction.label : primaryAction.label([item]);
  return "RenderModal" in primaryAction ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("div", { role: "gridcell", children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
    import_components12.Composite.Item,
    {
      id: compositeItemId,
      render: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
        import_components12.Button,
        {
          disabled: !!primaryAction.disabled,
          accessibleWhenDisabled: true,
          text: label,
          size: "small",
          onClick: () => setIsModalOpen(true)
        }
      ),
      children: isModalOpen && /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
        ActionModal,
        {
          action: primaryAction,
          items: [item],
          closeModal: () => setIsModalOpen(false)
        }
      )
    }
  ) }, primaryAction.id) : /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("div", { role: "gridcell", children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
    import_components12.Composite.Item,
    {
      id: compositeItemId,
      render: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
        import_components12.Button,
        {
          disabled: !!primaryAction.disabled,
          accessibleWhenDisabled: true,
          size: "small",
          onClick: () => {
            primaryAction.callback([item], { registry });
          },
          children: label
        }
      )
    }
  ) }, primaryAction.id);
}
function ListItem({
  view,
  actions,
  idPrefix,
  isSelected: isSelected2,
  item,
  titleField,
  mediaField,
  descriptionField,
  onSelect,
  otherFields,
  onDropdownTriggerKeyDown,
  posinset
}) {
  const {
    showTitle = true,
    showMedia = true,
    showDescription = true,
    infiniteScrollEnabled
  } = view;
  const itemRef = (0, import_element13.useRef)(null);
  const labelId = `${idPrefix}-label`;
  const descriptionId = `${idPrefix}-description`;
  const registry = (0, import_data3.useRegistry)();
  const [isHovered, setIsHovered] = (0, import_element13.useState)(false);
  const [activeModalAction, setActiveModalAction] = (0, import_element13.useState)(
    null
  );
  const handleHover = ({ type }) => {
    const isHover = type === "mouseenter";
    setIsHovered(isHover);
  };
  const { paginationInfo } = (0, import_element13.useContext)(dataviews_context_default);
  (0, import_element13.useEffect)(() => {
    if (isSelected2) {
      itemRef.current?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "nearest"
      });
    }
  }, [isSelected2]);
  const { primaryAction, eligibleActions } = (0, import_element13.useMemo)(() => {
    const _eligibleActions = actions.filter(
      (action) => !action.isEligible || action.isEligible(item)
    );
    const _primaryActions = _eligibleActions.filter(
      (action) => action.isPrimary
    );
    return {
      primaryAction: _primaryActions[0],
      eligibleActions: _eligibleActions
    };
  }, [actions, item]);
  const hasOnlyOnePrimaryAction = primaryAction && actions.length === 1;
  const renderedMediaField = showMedia && mediaField?.render ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("div", { className: "dataviews-view-list__media-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
    mediaField.render,
    {
      item,
      field: mediaField,
      config: { sizes: "52px" }
    }
  ) }) : null;
  const renderedTitleField = showTitle && titleField?.render ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(titleField.render, { item, field: titleField }) : null;
  const usedActions = eligibleActions?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(
    Stack,
    {
      direction: "row",
      gap: "sm",
      className: "dataviews-view-list__item-actions",
      children: [
        primaryAction && /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
          PrimaryActionGridCell,
          {
            idPrefix,
            primaryAction,
            item
          }
        ),
        !hasOnlyOnePrimaryAction && /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)("div", { role: "gridcell", children: [
          /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(Menu3, { placement: "bottom-end", children: [
            /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
              Menu3.TriggerButton,
              {
                render: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
                  import_components12.Composite.Item,
                  {
                    id: generateDropdownTriggerCompositeId(
                      idPrefix
                    ),
                    render: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
                      import_components12.Button,
                      {
                        size: "small",
                        icon: more_vertical_default,
                        label: (0, import_i18n13.__)("Actions"),
                        accessibleWhenDisabled: true,
                        disabled: !actions.length,
                        onKeyDown: onDropdownTriggerKeyDown
                      }
                    )
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(Menu3.Popover, { children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
              ActionsMenuGroup,
              {
                actions: eligibleActions,
                item,
                registry,
                setActiveModalAction
              }
            ) })
          ] }),
          !!activeModalAction && /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
            ActionModal,
            {
              action: activeModalAction,
              items: [item],
              closeModal: () => setActiveModalAction(null)
            }
          )
        ] })
      ]
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
    import_components12.Composite.Row,
    {
      ref: itemRef,
      render: (
        /* aria-posinset breaks Composite.Row if passed to it directly. */
        /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
          "div",
          {
            "aria-posinset": posinset,
            "aria-setsize": infiniteScrollEnabled ? paginationInfo.totalItems : void 0
          }
        )
      ),
      role: infiniteScrollEnabled ? "article" : "row",
      className: clsx_default({
        "is-selected": isSelected2,
        "is-hovered": isHovered
      }),
      onMouseEnter: handleHover,
      onMouseLeave: handleHover,
      children: /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(
        Stack,
        {
          direction: "row",
          className: "dataviews-view-list__item-wrapper",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("div", { role: "gridcell", children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
              import_components12.Composite.Item,
              {
                id: generateItemWrapperCompositeId(idPrefix),
                "aria-pressed": isSelected2,
                "aria-labelledby": labelId,
                "aria-describedby": descriptionId,
                className: "dataviews-view-list__item",
                onClick: () => onSelect(item)
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(
              Stack,
              {
                direction: "row",
                gap: "sm",
                justify: "start",
                align: "flex-start",
                style: { flex: 1 },
                children: [
                  renderedMediaField,
                  /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(
                    Stack,
                    {
                      direction: "column",
                      gap: "2xs",
                      className: "dataviews-view-list__field-wrapper",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(Stack, { direction: "row", align: "center", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
                            "div",
                            {
                              className: "dataviews-title-field",
                              id: labelId,
                              style: { flex: 1 },
                              children: renderedTitleField
                            }
                          ),
                          usedActions
                        ] }),
                        showDescription && descriptionField?.render && /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("div", { className: "dataviews-view-list__field", children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
                          descriptionField.render,
                          {
                            item,
                            field: descriptionField
                          }
                        ) }),
                        /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
                          "div",
                          {
                            className: "dataviews-view-list__fields",
                            id: descriptionId,
                            children: otherFields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(
                              "div",
                              {
                                className: "dataviews-view-list__field",
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
                                    import_components12.VisuallyHidden,
                                    {
                                      as: "span",
                                      className: "dataviews-view-list__field-label",
                                      children: field.label
                                    }
                                  ),
                                  /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("span", { className: "dataviews-view-list__field-value", children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
                                    field.render,
                                    {
                                      item,
                                      field
                                    }
                                  ) })
                                ]
                              },
                              field.id
                            ))
                          }
                        )
                      ]
                    }
                  )
                ]
              }
            )
          ]
        }
      )
    }
  );
}
function isDefined2(item) {
  return !!item;
}
function ViewList(props) {
  const {
    actions,
    data,
    fields,
    getItemId,
    isLoading,
    onChangeSelection,
    selection,
    view,
    className,
    empty
  } = props;
  const baseId = (0, import_compose5.useInstanceId)(ViewList, "view-list");
  const selectedItem = data?.findLast(
    (item) => selection.includes(getItemId(item))
  );
  const titleField = fields.find((field) => field.id === view.titleField);
  const mediaField = fields.find((field) => field.id === view.mediaField);
  const descriptionField = fields.find(
    (field) => field.id === view.descriptionField
  );
  const otherFields = (view?.fields ?? []).map((fieldId) => fields.find((f2) => fieldId === f2.id)).filter(isDefined2);
  const onSelect = (item) => onChangeSelection([getItemId(item)]);
  const generateCompositeItemIdPrefix = (0, import_element13.useCallback)(
    (item) => `${baseId}-${getItemId(item)}`,
    [baseId, getItemId]
  );
  const isActiveCompositeItem = (0, import_element13.useCallback)(
    (item, idToCheck) => {
      return idToCheck.startsWith(
        generateCompositeItemIdPrefix(item)
      );
    },
    [generateCompositeItemIdPrefix]
  );
  const [activeCompositeId, setActiveCompositeId] = (0, import_element13.useState)(void 0);
  (0, import_element13.useEffect)(() => {
    if (selectedItem) {
      setActiveCompositeId(
        generateItemWrapperCompositeId(
          generateCompositeItemIdPrefix(selectedItem)
        )
      );
    }
  }, [selectedItem, generateCompositeItemIdPrefix]);
  const activeItemIndex = data.findIndex(
    (item) => isActiveCompositeItem(item, activeCompositeId ?? "")
  );
  const previousActiveItemIndex = (0, import_compose5.usePrevious)(activeItemIndex);
  const isActiveIdInList = activeItemIndex !== -1;
  const selectCompositeItem = (0, import_element13.useCallback)(
    (targetIndex, generateCompositeId) => {
      const clampedIndex = Math.min(
        data.length - 1,
        Math.max(0, targetIndex)
      );
      if (!data[clampedIndex]) {
        return;
      }
      const itemIdPrefix = generateCompositeItemIdPrefix(
        data[clampedIndex]
      );
      const targetCompositeItemId = generateCompositeId(itemIdPrefix);
      setActiveCompositeId(targetCompositeItemId);
      document.getElementById(targetCompositeItemId)?.focus();
    },
    [data, generateCompositeItemIdPrefix]
  );
  (0, import_element13.useEffect)(() => {
    const wasActiveIdInList = previousActiveItemIndex !== void 0 && previousActiveItemIndex !== -1;
    if (!isActiveIdInList && wasActiveIdInList) {
      selectCompositeItem(
        previousActiveItemIndex,
        generateItemWrapperCompositeId
      );
    }
  }, [isActiveIdInList, selectCompositeItem, previousActiveItemIndex]);
  const onDropdownTriggerKeyDown = (0, import_element13.useCallback)(
    (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        selectCompositeItem(
          activeItemIndex + 1,
          generateDropdownTriggerCompositeId
        );
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        selectCompositeItem(
          activeItemIndex - 1,
          generateDropdownTriggerCompositeId
        );
      }
    },
    [selectCompositeItem, activeItemIndex]
  );
  const hasData = data?.length;
  if (!hasData) {
    return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
      "div",
      {
        className: clsx_default({
          "dataviews-loading": isLoading,
          "dataviews-no-results": !hasData && !isLoading
        }),
        children: !hasData && (isLoading ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(import_components12.Spinner, {}) }) : empty)
      }
    );
  }
  const groupField = view.groupBy?.field ? fields.find((field) => field.id === view.groupBy?.field) : null;
  const dataByGroup = groupField ? getDataByGroup(data, groupField) : null;
  if (hasData && groupField && dataByGroup) {
    return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
      import_components12.Composite,
      {
        id: `${baseId}`,
        render: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("div", {}),
        className: "dataviews-view-list__group",
        role: "grid",
        activeId: activeCompositeId,
        setActiveId: setActiveCompositeId,
        children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
          Stack,
          {
            direction: "column",
            gap: "md",
            className: clsx_default("dataviews-view-list", className),
            children: Array.from(dataByGroup.entries()).map(
              ([groupName, groupItems]) => /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(
                Stack,
                {
                  direction: "column",
                  gap: "xs",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("h3", { className: "dataviews-view-list__group-header", children: view.groupBy?.showLabel === false ? groupName : (0, import_i18n13.sprintf)(
                      // translators: 1: The label of the field e.g. "Date". 2: The value of the field, e.g.: "May 2022".
                      (0, import_i18n13.__)("%1$s: %2$s"),
                      groupField.label,
                      groupName
                    ) }),
                    groupItems.map((item) => {
                      const id = generateCompositeItemIdPrefix(item);
                      return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
                        ListItem,
                        {
                          view,
                          idPrefix: id,
                          actions,
                          item,
                          isSelected: item === selectedItem,
                          onSelect,
                          mediaField,
                          titleField,
                          descriptionField,
                          otherFields,
                          onDropdownTriggerKeyDown
                        },
                        id
                      );
                    })
                  ]
                },
                groupName
              )
            )
          }
        )
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)(import_jsx_runtime40.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
      import_components12.Composite,
      {
        id: baseId,
        render: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("div", {}),
        className: clsx_default("dataviews-view-list", className, {
          [`has-${view.layout?.density}-density`]: view.layout?.density && ["compact", "comfortable"].includes(
            view.layout.density
          )
        }),
        role: view.infiniteScrollEnabled ? "feed" : "grid",
        activeId: activeCompositeId,
        setActiveId: setActiveCompositeId,
        children: data.map((item, index) => {
          const id = generateCompositeItemIdPrefix(item);
          return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
            ListItem,
            {
              view,
              idPrefix: id,
              actions,
              item,
              isSelected: item === selectedItem,
              onSelect,
              mediaField,
              titleField,
              descriptionField,
              otherFields,
              onDropdownTriggerKeyDown,
              posinset: view.infiniteScrollEnabled ? index + 1 : void 0
            },
            id
          );
        })
      }
    ),
    hasData && isLoading && /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "dataviews-loading-more", children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(import_components12.Spinner, {}) })
  ] });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/activity/index.mjs
var import_components14 = __toESM(require_components(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/activity/activity-group.mjs
var import_i18n14 = __toESM(require_i18n(), 1);
var import_element14 = __toESM(require_element(), 1);
var import_jsx_runtime41 = __toESM(require_jsx_runtime(), 1);
function ActivityGroup({
  groupName,
  groupData,
  groupField,
  showLabel = true,
  children
}) {
  const groupHeader = showLabel ? (0, import_element14.createInterpolateElement)(
    // translators: %s: The label of the field e.g. "Status".
    (0, import_i18n14.sprintf)((0, import_i18n14.__)("%s: <groupName />"), groupField.label).trim(),
    {
      groupName: /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(
        groupField.render,
        {
          item: groupData[0],
          field: groupField
        }
      )
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(groupField.render, { item: groupData[0], field: groupField });
  return /* @__PURE__ */ (0, import_jsx_runtime41.jsxs)(
    Stack,
    {
      direction: "column",
      className: "dataviews-view-activity__group",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime41.jsx)("h3", { className: "dataviews-view-activity__group-header", children: groupHeader }),
        children
      ]
    },
    groupName
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/activity/activity-item.mjs
var import_components13 = __toESM(require_components(), 1);
var import_element15 = __toESM(require_element(), 1);
var import_data4 = __toESM(require_data(), 1);
var import_compose6 = __toESM(require_compose(), 1);
var import_jsx_runtime42 = __toESM(require_jsx_runtime(), 1);
function ActivityItem(props) {
  const {
    view,
    actions,
    item,
    titleField,
    mediaField,
    descriptionField,
    otherFields,
    posinset,
    onClickItem,
    renderItemLink,
    isItemClickable
  } = props;
  const {
    showTitle = true,
    showMedia = true,
    showDescription = true,
    infiniteScrollEnabled
  } = view;
  const itemRef = (0, import_element15.useRef)(null);
  const registry = (0, import_data4.useRegistry)();
  const { paginationInfo } = (0, import_element15.useContext)(dataviews_context_default);
  const { primaryActions, eligibleActions } = (0, import_element15.useMemo)(() => {
    const _eligibleActions = actions.filter(
      (action) => !action.isEligible || action.isEligible(item)
    );
    const _primaryActions = _eligibleActions.filter(
      (action) => action.isPrimary
    );
    return {
      primaryActions: _primaryActions,
      eligibleActions: _eligibleActions
    };
  }, [actions, item]);
  const isMobileViewport = (0, import_compose6.useViewportMatch)("medium", "<");
  const density = view.layout?.density ?? "balanced";
  const mediaContent = showMedia && density !== "compact" && mediaField?.render ? /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
    mediaField.render,
    {
      item,
      field: mediaField,
      config: {
        sizes: density === "comfortable" ? "32px" : "24px"
      }
    }
  ) : null;
  const renderedMediaField = /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("div", { className: "dataviews-view-activity__item-type-icon", children: mediaContent || /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
    "span",
    {
      className: "dataviews-view-activity__item-bullet",
      "aria-hidden": "true"
    }
  ) });
  const renderedTitleField = showTitle && titleField?.render ? /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(titleField.render, { item, field: titleField }) : null;
  const verticalGap = (0, import_element15.useMemo)(() => {
    switch (density) {
      case "comfortable":
        return "sm";
      default:
        return "xs";
    }
  }, [density]);
  return /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
    "div",
    {
      ref: itemRef,
      role: infiniteScrollEnabled ? "article" : void 0,
      "aria-posinset": posinset,
      "aria-setsize": infiniteScrollEnabled ? paginationInfo.totalItems : void 0,
      className: clsx_default(
        "dataviews-view-activity__item",
        density === "compact" && "is-compact",
        density === "balanced" && "is-balanced",
        density === "comfortable" && "is-comfortable"
      ),
      children: /* @__PURE__ */ (0, import_jsx_runtime42.jsxs)(Stack, { direction: "row", gap: "md", justify: "start", align: "flex-start", children: [
        /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
          Stack,
          {
            direction: "column",
            gap: "2xs",
            align: "center",
            className: "dataviews-view-activity__item-type",
            children: renderedMediaField
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime42.jsxs)(
          Stack,
          {
            direction: "column",
            gap: verticalGap,
            align: "flex-start",
            className: "dataviews-view-activity__item-content",
            children: [
              renderedTitleField && /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
                ItemClickWrapper,
                {
                  item,
                  isItemClickable,
                  onClickItem,
                  renderItemLink,
                  className: "dataviews-view-activity__item-title",
                  children: renderedTitleField
                }
              ),
              showDescription && descriptionField && /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("div", { className: "dataviews-view-activity__item-description", children: /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
                descriptionField.render,
                {
                  item,
                  field: descriptionField
                }
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("div", { className: "dataviews-view-activity__item-fields", children: otherFields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime42.jsxs)(
                "div",
                {
                  className: "dataviews-view-activity__item-field",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
                      import_components13.VisuallyHidden,
                      {
                        as: "span",
                        className: "dataviews-view-activity__item-field-label",
                        children: field.label
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("span", { className: "dataviews-view-activity__item-field-value", children: /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
                      field.render,
                      {
                        item,
                        field
                      }
                    ) })
                  ]
                },
                field.id
              )) }),
              !!primaryActions?.length && /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
                PrimaryActions,
                {
                  item,
                  actions: primaryActions,
                  registry,
                  buttonVariant: "secondary"
                }
              )
            ]
          }
        ),
        (primaryActions.length < eligibleActions.length || // Since we hide primary actions on mobile, we need to show the menu
        // there if there are any actions at all.
        isMobileViewport && // At the same time, only show the menu if there are actions to show.
        eligibleActions.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("div", { className: "dataviews-view-activity__item-actions", children: /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
          ItemActions,
          {
            item,
            actions: eligibleActions,
            isCompact: true
          }
        ) })
      ] })
    }
  );
}
var activity_item_default = ActivityItem;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/activity/activity-items.mjs
var import_react3 = __toESM(require_react(), 1);
function isDefined3(item) {
  return !!item;
}
function ActivityItems(props) {
  const { data, fields, getItemId, view } = props;
  const titleField = fields.find((field) => field.id === view.titleField);
  const mediaField = fields.find((field) => field.id === view.mediaField);
  const descriptionField = fields.find(
    (field) => field.id === view.descriptionField
  );
  const otherFields = (view?.fields ?? []).map((fieldId) => fields.find((f2) => fieldId === f2.id)).filter(isDefined3);
  return data.map((item, index) => {
    return /* @__PURE__ */ (0, import_react3.createElement)(
      activity_item_default,
      {
        ...props,
        key: getItemId(item),
        item,
        mediaField,
        titleField,
        descriptionField,
        otherFields,
        posinset: view.infiniteScrollEnabled ? index + 1 : void 0
      }
    );
  });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/activity/index.mjs
var import_jsx_runtime43 = __toESM(require_jsx_runtime(), 1);
function ViewActivity(props) {
  const { empty, data, fields, isLoading, view, className } = props;
  const hasData = data?.length;
  if (!hasData) {
    return /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(
      "div",
      {
        className: clsx_default({
          "dataviews-loading": isLoading,
          "dataviews-no-results": !hasData && !isLoading
        }),
        children: !hasData && (isLoading ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(import_components14.Spinner, {}) }) : empty)
      }
    );
  }
  const wrapperClassName = clsx_default("dataviews-view-activity", className);
  const groupField = view.groupBy?.field ? fields.find((field) => field.id === view.groupBy?.field) : null;
  const dataByGroup = groupField ? getDataByGroup(data, groupField) : null;
  const groupedEntries = dataByGroup ? Array.from(dataByGroup.entries()) : [];
  if (hasData && groupField && dataByGroup) {
    return /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(Stack, { direction: "column", gap: "xs", className: wrapperClassName, children: groupedEntries.map(
      ([groupName, groupData]) => /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(
        ActivityGroup,
        {
          groupName,
          groupData,
          groupField,
          showLabel: view.groupBy?.showLabel !== false,
          children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(
            ActivityItems,
            {
              ...props,
              data: groupData
            }
          )
        },
        groupName
      )
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)(import_jsx_runtime43.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(
      "div",
      {
        className: wrapperClassName,
        role: view.infiniteScrollEnabled ? "feed" : void 0,
        children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(ActivityItems, { ...props })
      }
    ),
    hasData && isLoading && /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "dataviews-loading-more", children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(import_components14.Spinner, {}) })
  ] });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/picker-grid/index.mjs
var import_components17 = __toESM(require_components(), 1);
var import_i18n17 = __toESM(require_i18n(), 1);
var import_compose7 = __toESM(require_compose(), 1);
var import_element19 = __toESM(require_element(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-picker-footer/index.mjs
var import_components16 = __toESM(require_components(), 1);
var import_data5 = __toESM(require_data(), 1);
var import_element17 = __toESM(require_element(), 1);
var import_i18n16 = __toESM(require_i18n(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-pagination/index.mjs
var import_components15 = __toESM(require_components(), 1);
var import_element16 = __toESM(require_element(), 1);
var import_i18n15 = __toESM(require_i18n(), 1);
var import_jsx_runtime44 = __toESM(require_jsx_runtime(), 1);
function DataViewsPagination() {
  const {
    view,
    onChangeView,
    paginationInfo: { totalItems = 0, totalPages }
  } = (0, import_element16.useContext)(dataviews_context_default);
  if (!totalItems || !totalPages || view.infiniteScrollEnabled) {
    return null;
  }
  const currentPage = view.page ?? 1;
  const pageSelectOptions = Array.from(Array(totalPages)).map(
    (_, i2) => {
      const page = i2 + 1;
      return {
        value: page.toString(),
        label: page.toString(),
        "aria-label": currentPage === page ? (0, import_i18n15.sprintf)(
          // translators: 1: current page number. 2: total number of pages.
          (0, import_i18n15.__)("Page %1$d of %2$d"),
          currentPage,
          totalPages
        ) : page.toString()
      };
    }
  );
  return !!totalItems && totalPages !== 1 && /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)(
    Stack,
    {
      direction: "row",
      className: "dataviews-pagination",
      justify: "end",
      align: "center",
      gap: "lg",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(
          Stack,
          {
            direction: "row",
            justify: "flex-start",
            align: "center",
            gap: "2xs",
            className: "dataviews-pagination__page-select",
            children: (0, import_element16.createInterpolateElement)(
              (0, import_i18n15.sprintf)(
                // translators: 1: Current page number, 2: Total number of pages.
                (0, import_i18n15._x)(
                  "<div>Page</div>%1$s<div>of %2$d</div>",
                  "paging"
                ),
                "<CurrentPage />",
                totalPages
              ),
              {
                div: /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("div", { "aria-hidden": true }),
                CurrentPage: /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(
                  import_components15.SelectControl,
                  {
                    "aria-label": (0, import_i18n15.__)("Current page"),
                    value: currentPage.toString(),
                    options: pageSelectOptions,
                    onChange: (newValue) => {
                      onChangeView({
                        ...view,
                        page: +newValue
                      });
                    },
                    size: "small",
                    variant: "minimal"
                  }
                )
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)(Stack, { direction: "row", gap: "2xs", align: "center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(
            import_components15.Button,
            {
              onClick: () => onChangeView({
                ...view,
                page: currentPage - 1
              }),
              disabled: currentPage === 1,
              accessibleWhenDisabled: true,
              label: (0, import_i18n15.__)("Previous page"),
              icon: (0, import_i18n15.isRTL)() ? next_default : previous_default,
              showTooltip: true,
              size: "compact",
              tooltipPosition: "top"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(
            import_components15.Button,
            {
              onClick: () => onChangeView({ ...view, page: currentPage + 1 }),
              disabled: currentPage >= totalPages,
              accessibleWhenDisabled: true,
              label: (0, import_i18n15.__)("Next page"),
              icon: (0, import_i18n15.isRTL)() ? previous_default : next_default,
              showTooltip: true,
              size: "compact",
              tooltipPosition: "top"
            }
          )
        ] })
      ]
    }
  );
}
var dataviews_pagination_default = (0, import_element16.memo)(DataViewsPagination);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-picker-footer/index.mjs
var import_jsx_runtime45 = __toESM(require_jsx_runtime(), 1);
function useIsMultiselectPicker(actions) {
  return (0, import_element17.useMemo)(() => {
    return actions?.every((action) => action.supportsBulk);
  }, [actions]);
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/utils/grid-items.mjs
var import_element18 = __toESM(require_element(), 1);
var import_jsx_runtime46 = __toESM(require_jsx_runtime(), 1);
var GridItems = (0, import_element18.forwardRef)(({ className, previewSize, ...props }, ref) => {
  return /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(
    "div",
    {
      ref,
      className: clsx_default("dataviews-view-grid-items", className),
      style: {
        gridTemplateColumns: previewSize && `repeat(auto-fill, minmax(${previewSize}px, 1fr))`
      },
      ...props
    }
  );
});

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/picker-grid/index.mjs
var import_jsx_runtime47 = __toESM(require_jsx_runtime(), 1);
var { Badge: Badge2 } = unlock(import_components17.privateApis);
function GridItem3({
  view,
  multiselect,
  selection,
  onChangeSelection,
  getItemId,
  item,
  mediaField,
  titleField,
  descriptionField,
  regularFields,
  badgeFields,
  config,
  posinset,
  setsize
}) {
  const { showTitle = true, showMedia = true, showDescription = true } = view;
  const id = getItemId(item);
  const isSelected2 = selection.includes(id);
  const renderedMediaField = mediaField?.render ? /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
    mediaField.render,
    {
      item,
      field: mediaField,
      config
    }
  ) : null;
  const renderedTitleField = showTitle && titleField?.render ? /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(titleField.render, { item, field: titleField }) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)(
    import_components17.Composite.Item,
    {
      "aria-label": titleField ? titleField.getValue({ item }) || (0, import_i18n17.__)("(no title)") : void 0,
      render: ({ children, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(Stack, { direction: "column", children, ...props }),
      role: "option",
      "aria-posinset": posinset,
      "aria-setsize": setsize,
      className: clsx_default("dataviews-view-picker-grid__card", {
        "is-selected": isSelected2
      }),
      "aria-selected": isSelected2,
      onClick: () => {
        if (isSelected2) {
          onChangeSelection(
            selection.filter((itemId) => id !== itemId)
          );
        } else {
          const newSelection = multiselect ? [...selection, id] : [id];
          onChangeSelection(newSelection);
        }
      },
      children: [
        showMedia && renderedMediaField && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("div", { className: "dataviews-view-picker-grid__media", children: renderedMediaField }),
        showMedia && renderedMediaField && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
          DataViewsSelectionCheckbox,
          {
            item,
            selection,
            onChangeSelection,
            getItemId,
            titleField,
            disabled: false,
            "aria-hidden": true,
            tabIndex: -1
          }
        ),
        showTitle && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
          Stack,
          {
            direction: "row",
            justify: "space-between",
            className: "dataviews-view-picker-grid__title-actions",
            children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("div", { className: "dataviews-view-picker-grid__title-field dataviews-title-field", children: renderedTitleField })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)(Stack, { direction: "column", gap: "2xs", children: [
          showDescription && descriptionField?.render && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
            descriptionField.render,
            {
              item,
              field: descriptionField
            }
          ),
          !!badgeFields?.length && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
            Stack,
            {
              direction: "row",
              className: "dataviews-view-picker-grid__badge-fields",
              gap: "xs",
              wrap: "wrap",
              align: "top",
              justify: "flex-start",
              children: badgeFields.map((field) => {
                return /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
                  Badge2,
                  {
                    className: "dataviews-view-picker-grid__field-value",
                    children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
                      field.render,
                      {
                        item,
                        field
                      }
                    )
                  },
                  field.id
                );
              })
            }
          ),
          !!regularFields?.length && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
            Stack,
            {
              direction: "column",
              className: "dataviews-view-picker-grid__fields",
              gap: "2xs",
              children: regularFields.map((field) => {
                return /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
                  import_components17.Flex,
                  {
                    className: "dataviews-view-picker-grid__field",
                    gap: 1,
                    justify: "flex-start",
                    expanded: true,
                    style: { height: "auto" },
                    direction: "row",
                    children: /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)(import_jsx_runtime47.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(import_components17.FlexItem, { className: "dataviews-view-picker-grid__field-name", children: field.header }),
                      /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
                        import_components17.FlexItem,
                        {
                          className: "dataviews-view-picker-grid__field-value",
                          style: { maxHeight: "none" },
                          children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
                            field.render,
                            {
                              item,
                              field
                            }
                          )
                        }
                      )
                    ] })
                  },
                  field.id
                );
              })
            }
          )
        ] })
      ]
    },
    id
  );
}
function GridGroup({
  groupName,
  groupField,
  showLabel = true,
  children
}) {
  const headerId = (0, import_compose7.useInstanceId)(
    GridGroup,
    "dataviews-view-picker-grid-group__header"
  );
  return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)(
    Stack,
    {
      direction: "column",
      gap: "xs",
      role: "group",
      "aria-labelledby": headerId,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
          "h3",
          {
            className: "dataviews-view-picker-grid-group__header",
            id: headerId,
            children: showLabel ? (0, import_i18n17.sprintf)(
              // translators: 1: The label of the field e.g. "Date". 2: The value of the field, e.g.: "May 2022".
              (0, import_i18n17.__)("%1$s: %2$s"),
              groupField.label,
              groupName
            ) : groupName
          }
        ),
        children
      ]
    },
    groupName
  );
}
function ViewPickerGrid({
  actions,
  data,
  fields,
  getItemId,
  isLoading,
  onChangeSelection,
  selection,
  view,
  className,
  empty
}) {
  const { resizeObserverRef, paginationInfo, itemListLabel } = (0, import_element19.useContext)(dataviews_context_default);
  const titleField = fields.find(
    (field) => field.id === view?.titleField
  );
  const mediaField = fields.find(
    (field) => field.id === view?.mediaField
  );
  const descriptionField = fields.find(
    (field) => field.id === view?.descriptionField
  );
  const otherFields = view.fields ?? [];
  const { regularFields, badgeFields } = otherFields.reduce(
    (accumulator, fieldId) => {
      const field = fields.find((f2) => f2.id === fieldId);
      if (!field) {
        return accumulator;
      }
      const key = view.layout?.badgeFields?.includes(fieldId) ? "badgeFields" : "regularFields";
      accumulator[key].push(field);
      return accumulator;
    },
    { regularFields: [], badgeFields: [] }
  );
  const hasData = !!data?.length;
  const usedPreviewSize = view.layout?.previewSize;
  const isMultiselect = useIsMultiselectPicker(actions);
  const size = "900px";
  const groupField = view.groupBy?.field ? fields.find((f2) => f2.id === view.groupBy?.field) : null;
  const dataByGroup = groupField ? getDataByGroup(data, groupField) : null;
  const isInfiniteScroll = view.infiniteScrollEnabled && !dataByGroup;
  const currentPage = view?.page ?? 1;
  const perPage = view?.perPage ?? 0;
  const setSize = isInfiniteScroll ? paginationInfo?.totalItems : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)(import_jsx_runtime47.Fragment, {
    // Render multiple groups.
    children: [
      hasData && groupField && dataByGroup && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
        import_components17.Composite,
        {
          virtualFocus: true,
          orientation: "horizontal",
          role: "listbox",
          "aria-multiselectable": isMultiselect,
          className: clsx_default(
            "dataviews-view-picker-grid",
            className
          ),
          "aria-label": itemListLabel,
          render: ({ children, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
            Stack,
            {
              direction: "column",
              gap: "md",
              children,
              ...props
            }
          ),
          children: Array.from(dataByGroup.entries()).map(
            ([groupName, groupItems]) => /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
              GridGroup,
              {
                groupName,
                groupField,
                showLabel: view.groupBy?.showLabel !== false,
                children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
                  GridItems,
                  {
                    previewSize: usedPreviewSize,
                    style: {
                      gridTemplateColumns: usedPreviewSize && `repeat(auto-fill, minmax(${usedPreviewSize}px, 1fr))`
                    },
                    "aria-busy": isLoading,
                    ref: resizeObserverRef,
                    children: groupItems.map((item) => {
                      const posInSet = (currentPage - 1) * perPage + data.indexOf(item) + 1;
                      return /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
                        GridItem3,
                        {
                          view,
                          multiselect: isMultiselect,
                          selection,
                          onChangeSelection,
                          getItemId,
                          item,
                          mediaField,
                          titleField,
                          descriptionField,
                          regularFields,
                          badgeFields,
                          config: {
                            sizes: size
                          },
                          posinset: posInSet,
                          setsize: setSize
                        },
                        getItemId(item)
                      );
                    })
                  }
                )
              },
              groupName
            )
          )
        }
      ),
      // Render a single grid with all data.
      hasData && !dataByGroup && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
        import_components17.Composite,
        {
          render: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
            GridItems,
            {
              className: clsx_default(
                "dataviews-view-picker-grid",
                className
              ),
              previewSize: usedPreviewSize,
              "aria-busy": isLoading,
              ref: resizeObserverRef
            }
          ),
          virtualFocus: true,
          orientation: "horizontal",
          role: "listbox",
          "aria-multiselectable": isMultiselect,
          "aria-label": itemListLabel,
          children: data.map((item, index) => {
            let posinset = isInfiniteScroll ? index + 1 : void 0;
            if (!isInfiniteScroll) {
              posinset = (currentPage - 1) * perPage + index + 1;
            }
            return /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
              GridItem3,
              {
                view,
                multiselect: isMultiselect,
                selection,
                onChangeSelection,
                getItemId,
                item,
                mediaField,
                titleField,
                descriptionField,
                regularFields,
                badgeFields,
                config: {
                  sizes: size
                },
                posinset,
                setsize: setSize
              },
              getItemId(item)
            );
          })
        }
      ),
      // Render empty state.
      !hasData && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(
        "div",
        {
          className: clsx_default({
            "dataviews-loading": isLoading,
            "dataviews-no-results": !isLoading
          }),
          children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(import_components17.Spinner, {}) }) : empty
        }
      ),
      hasData && isLoading && /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("p", { className: "dataviews-loading-more", children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(import_components17.Spinner, {}) })
    ]
  });
}
var picker_grid_default = ViewPickerGrid;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/picker-table/index.mjs
var import_i18n18 = __toESM(require_i18n(), 1);
var import_components18 = __toESM(require_components(), 1);
var import_element20 = __toESM(require_element(), 1);
var import_jsx_runtime48 = __toESM(require_jsx_runtime(), 1);
function TableColumnField2({
  item,
  fields,
  column,
  align
}) {
  const field = fields.find((f2) => f2.id === column);
  if (!field) {
    return null;
  }
  const className = clsx_default("dataviews-view-table__cell-content-wrapper", {
    "dataviews-view-table__cell-align-end": align === "end",
    "dataviews-view-table__cell-align-center": align === "center"
  });
  return /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("div", { className, children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(field.render, { item, field }) });
}
function TableRow2({
  item,
  fields,
  id,
  view,
  titleField,
  mediaField,
  descriptionField,
  selection,
  getItemId,
  onChangeSelection,
  multiselect,
  posinset
}) {
  const { paginationInfo } = (0, import_element20.useContext)(dataviews_context_default);
  const isSelected2 = selection.includes(id);
  const [isHovered, setIsHovered] = (0, import_element20.useState)(false);
  const {
    showTitle = true,
    showMedia = true,
    showDescription = true,
    infiniteScrollEnabled
  } = view;
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const columns = view.fields ?? [];
  const hasPrimaryColumn = titleField && showTitle || mediaField && showMedia || descriptionField && showDescription;
  return /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)(
    import_components18.Composite.Item,
    {
      render: ({ children, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
        "tr",
        {
          className: clsx_default("dataviews-view-table__row", {
            "is-selected": isSelected2,
            "is-hovered": isHovered
          }),
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          children,
          ...props
        }
      ),
      "aria-selected": isSelected2,
      "aria-setsize": paginationInfo.totalItems || void 0,
      "aria-posinset": posinset,
      role: infiniteScrollEnabled ? "article" : "option",
      onClick: () => {
        if (isSelected2) {
          onChangeSelection(
            selection.filter((itemId) => id !== itemId)
          );
        } else {
          const newSelection = multiselect ? [...selection, id] : [id];
          onChangeSelection(newSelection);
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
          "td",
          {
            className: "dataviews-view-table__checkbox-column",
            role: "presentation",
            children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("div", { className: "dataviews-view-table__cell-content-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
              DataViewsSelectionCheckbox,
              {
                item,
                selection,
                onChangeSelection,
                getItemId,
                titleField,
                disabled: false,
                "aria-hidden": true,
                tabIndex: -1
              }
            ) })
          }
        ),
        hasPrimaryColumn && /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("td", { role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
          column_primary_default,
          {
            item,
            titleField: showTitle ? titleField : void 0,
            mediaField: showMedia ? mediaField : void 0,
            descriptionField: showDescription ? descriptionField : void 0,
            isItemClickable: () => false
          }
        ) }),
        columns.map((column) => {
          const { width, maxWidth, minWidth, align } = view.layout?.styles?.[column] ?? {};
          return /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
            "td",
            {
              style: {
                width,
                maxWidth,
                minWidth
              },
              role: "presentation",
              children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
                TableColumnField2,
                {
                  fields,
                  item,
                  column,
                  align
                }
              )
            },
            column
          );
        })
      ]
    },
    id
  );
}
function ViewPickerTable({
  actions,
  data,
  fields,
  getItemId,
  isLoading = false,
  onChangeView,
  onChangeSelection,
  selection,
  setOpenedFilter,
  view,
  className,
  empty
}) {
  const headerMenuRefs = (0, import_element20.useRef)(/* @__PURE__ */ new Map());
  const headerMenuToFocusRef = (0, import_element20.useRef)();
  const [nextHeaderMenuToFocus, setNextHeaderMenuToFocus] = (0, import_element20.useState)();
  const isMultiselect = useIsMultiselectPicker(actions) ?? false;
  (0, import_element20.useEffect)(() => {
    if (headerMenuToFocusRef.current) {
      headerMenuToFocusRef.current.focus();
      headerMenuToFocusRef.current = void 0;
    }
  });
  const tableNoticeId = (0, import_element20.useId)();
  if (nextHeaderMenuToFocus) {
    headerMenuToFocusRef.current = nextHeaderMenuToFocus;
    setNextHeaderMenuToFocus(void 0);
    return;
  }
  const onHide = (field) => {
    const hidden = headerMenuRefs.current.get(field.id);
    const fallback = hidden ? headerMenuRefs.current.get(hidden.fallback) : void 0;
    setNextHeaderMenuToFocus(fallback?.node);
  };
  const hasData = !!data?.length;
  const titleField = fields.find((field) => field.id === view.titleField);
  const mediaField = fields.find((field) => field.id === view.mediaField);
  const descriptionField = fields.find(
    (field) => field.id === view.descriptionField
  );
  const groupField = view.groupBy?.field ? fields.find((f2) => f2.id === view.groupBy?.field) : null;
  const dataByGroup = groupField ? getDataByGroup(data, groupField) : null;
  const { showTitle = true, showMedia = true, showDescription = true } = view;
  const hasPrimaryColumn = titleField && showTitle || mediaField && showMedia || descriptionField && showDescription;
  const columns = view.fields ?? [];
  const headerMenuRef = (column, index) => (node) => {
    if (node) {
      headerMenuRefs.current.set(column, {
        node,
        fallback: columns[index > 0 ? index - 1 : 1]
      });
    } else {
      headerMenuRefs.current.delete(column);
    }
  };
  const isInfiniteScroll = view.infiniteScrollEnabled && !dataByGroup;
  return /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)(import_jsx_runtime48.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)(
      "table",
      {
        className: clsx_default(
          "dataviews-view-table",
          "dataviews-view-picker-table",
          className,
          {
            [`has-${view.layout?.density}-density`]: view.layout?.density && ["compact", "comfortable"].includes(
              view.layout.density
            )
          }
        ),
        "aria-busy": isLoading,
        "aria-describedby": tableNoticeId,
        role: isInfiniteScroll ? "feed" : "listbox",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("thead", { role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)(
            "tr",
            {
              className: "dataviews-view-table__row",
              role: "presentation",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("th", { className: "dataviews-view-table__checkbox-column", children: isMultiselect && /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
                  BulkSelectionCheckbox,
                  {
                    selection,
                    onChangeSelection,
                    data,
                    actions,
                    getItemId
                  }
                ) }),
                hasPrimaryColumn && /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("th", { children: titleField && /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
                  column_header_menu_default,
                  {
                    ref: headerMenuRef(
                      titleField.id,
                      0
                    ),
                    fieldId: titleField.id,
                    view,
                    fields,
                    onChangeView,
                    onHide,
                    setOpenedFilter,
                    canMove: false
                  }
                ) }),
                columns.map((column, index) => {
                  const { width, maxWidth, minWidth, align } = view.layout?.styles?.[column] ?? {};
                  return /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
                    "th",
                    {
                      style: {
                        width,
                        maxWidth,
                        minWidth,
                        textAlign: align
                      },
                      "aria-sort": view.sort?.direction && view.sort?.field === column ? sortValues[view.sort.direction] : void 0,
                      scope: "col",
                      children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
                        column_header_menu_default,
                        {
                          ref: headerMenuRef(column, index),
                          fieldId: column,
                          view,
                          fields,
                          onChangeView,
                          onHide,
                          setOpenedFilter,
                          canMove: view.layout?.enableMoving ?? true
                        }
                      )
                    },
                    column
                  );
                })
              ]
            }
          ) }),
          hasData && groupField && dataByGroup ? Array.from(dataByGroup.entries()).map(
            ([groupName, groupItems]) => /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)(
              import_components18.Composite,
              {
                virtualFocus: true,
                orientation: "vertical",
                render: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("tbody", { role: "group" }),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
                    "tr",
                    {
                      className: "dataviews-view-table__group-header-row",
                      role: "presentation",
                      children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
                        "td",
                        {
                          colSpan: columns.length + (hasPrimaryColumn ? 1 : 0) + 1,
                          className: "dataviews-view-table__group-header-cell",
                          role: "presentation",
                          children: view.groupBy?.showLabel === false ? groupName : (0, import_i18n18.sprintf)(
                            // translators: 1: The label of the field e.g. "Date". 2: The value of the field, e.g.: "May 2022".
                            (0, import_i18n18.__)("%1$s: %2$s"),
                            groupField.label,
                            groupName
                          )
                        }
                      )
                    }
                  ),
                  groupItems.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
                    TableRow2,
                    {
                      item,
                      fields,
                      id: getItemId(item) || index.toString(),
                      view,
                      titleField,
                      mediaField,
                      descriptionField,
                      selection,
                      getItemId,
                      onChangeSelection,
                      multiselect: isMultiselect
                    },
                    getItemId(item)
                  ))
                ]
              },
              `group-${groupName}`
            )
          ) : /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
            import_components18.Composite,
            {
              render: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("tbody", { role: "presentation" }),
              virtualFocus: true,
              orientation: "vertical",
              children: hasData && data.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(
                TableRow2,
                {
                  item,
                  fields,
                  id: getItemId(item) || index.toString(),
                  view,
                  titleField,
                  mediaField,
                  descriptionField,
                  selection,
                  getItemId,
                  onChangeSelection,
                  multiselect: isMultiselect,
                  posinset: index + 1
                },
                getItemId(item)
              ))
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)(
      "div",
      {
        className: clsx_default({
          "dataviews-loading": isLoading,
          "dataviews-no-results": !hasData && !isLoading
        }),
        id: tableNoticeId,
        children: [
          !hasData && (isLoading ? /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(import_components18.Spinner, {}) }) : empty),
          hasData && isLoading && /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("p", { className: "dataviews-loading-more", children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(import_components18.Spinner, {}) })
        ]
      }
    )
  ] });
}
var picker_table_default = ViewPickerTable;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/utils/preview-size-picker.mjs
var import_components19 = __toESM(require_components(), 1);
var import_i18n19 = __toESM(require_i18n(), 1);
var import_element21 = __toESM(require_element(), 1);
var import_jsx_runtime49 = __toESM(require_jsx_runtime(), 1);
var imageSizes2 = [
  {
    value: 120,
    breakpoint: 1
  },
  {
    value: 170,
    breakpoint: 1
  },
  {
    value: 230,
    breakpoint: 1
  },
  {
    value: 290,
    breakpoint: 1112
    // at minimum image width, 4 images display at this container size
  },
  {
    value: 350,
    breakpoint: 1636
    // at minimum image width, 6 images display at this container size
  },
  {
    value: 430,
    breakpoint: 588
    // at minimum image width, 2 images display at this container size
  }
];
function PreviewSizePicker() {
  const context = (0, import_element21.useContext)(dataviews_context_default);
  const view = context.view;
  const breakValues = imageSizes2.filter((size) => {
    return context.containerWidth >= size.breakpoint;
  });
  const layoutPreviewSize = view.layout?.previewSize ?? 230;
  const previewSizeToUse = breakValues.map((size, index) => ({ ...size, index })).filter((size) => size.value <= layoutPreviewSize).sort((a2, b2) => b2.value - a2.value)[0]?.index ?? 0;
  const marks = breakValues.map((size, index) => {
    return {
      value: index
    };
  });
  return /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(
    import_components19.RangeControl,
    {
      __next40pxDefaultSize: true,
      showTooltip: false,
      label: (0, import_i18n19.__)("Preview size"),
      value: previewSizeToUse,
      min: 0,
      max: breakValues.length - 1,
      withInputField: false,
      onChange: (value = 0) => {
        context.onChangeView({
          ...view,
          layout: {
            ...view.layout,
            previewSize: breakValues[value].value
          }
        });
      },
      step: 1,
      marks
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/utils/density-picker.mjs
var import_components20 = __toESM(require_components(), 1);
var import_i18n20 = __toESM(require_i18n(), 1);
var import_element22 = __toESM(require_element(), 1);
var import_jsx_runtime50 = __toESM(require_jsx_runtime(), 1);
function DensityPicker() {
  const context = (0, import_element22.useContext)(dataviews_context_default);
  const view = context.view;
  return /* @__PURE__ */ (0, import_jsx_runtime50.jsxs)(
    import_components20.__experimentalToggleGroupControl,
    {
      size: "__unstable-large",
      label: (0, import_i18n20.__)("Density"),
      value: view.layout?.density || "balanced",
      onChange: (value) => {
        context.onChangeView({
          ...view,
          layout: {
            ...view.layout,
            density: value
          }
        });
      },
      isBlock: true,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)(
          import_components20.__experimentalToggleGroupControlOption,
          {
            value: "comfortable",
            label: (0, import_i18n20._x)(
              "Comfortable",
              "Density option for DataView layout"
            )
          },
          "comfortable"
        ),
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)(
          import_components20.__experimentalToggleGroupControlOption,
          {
            value: "balanced",
            label: (0, import_i18n20._x)("Balanced", "Density option for DataView layout")
          },
          "balanced"
        ),
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)(
          import_components20.__experimentalToggleGroupControlOption,
          {
            value: "compact",
            label: (0, import_i18n20._x)("Compact", "Density option for DataView layout")
          },
          "compact"
        )
      ]
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layouts/index.mjs
var VIEW_LAYOUTS = [
  {
    type: LAYOUT_TABLE,
    label: (0, import_i18n21.__)("Table"),
    component: table_default,
    icon: block_table_default,
    viewConfigOptions: DensityPicker
  },
  {
    type: LAYOUT_GRID,
    label: (0, import_i18n21.__)("Grid"),
    component: grid_default,
    icon: category_default,
    viewConfigOptions: PreviewSizePicker
  },
  {
    type: LAYOUT_LIST,
    label: (0, import_i18n21.__)("List"),
    component: ViewList,
    icon: (0, import_i18n21.isRTL)() ? format_list_bullets_rtl_default : format_list_bullets_default,
    viewConfigOptions: DensityPicker
  },
  {
    type: LAYOUT_ACTIVITY,
    label: (0, import_i18n21.__)("Activity"),
    component: ViewActivity,
    icon: scheduled_default,
    viewConfigOptions: DensityPicker
  },
  {
    type: LAYOUT_PICKER_GRID,
    label: (0, import_i18n21.__)("Grid"),
    component: picker_grid_default,
    icon: category_default,
    viewConfigOptions: PreviewSizePicker,
    isPicker: true
  },
  {
    type: LAYOUT_PICKER_TABLE,
    label: (0, import_i18n21.__)("Table"),
    component: picker_table_default,
    icon: block_table_default,
    viewConfigOptions: DensityPicker,
    isPicker: true
  }
];

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/filters.mjs
var import_element30 = __toESM(require_element(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/filter.mjs
var import_components23 = __toESM(require_components(), 1);
var import_i18n24 = __toESM(require_i18n(), 1);
var import_element27 = __toESM(require_element(), 1);

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/XMCVU3LR.js
function noop(..._) {
}
function applyState(argument, currentValue) {
  if (isUpdater(argument)) {
    const value = isLazyValue(currentValue) ? currentValue() : currentValue;
    return argument(value);
  }
  return argument;
}
function isUpdater(argument) {
  return typeof argument === "function";
}
function isLazyValue(value) {
  return typeof value === "function";
}
function hasOwnProperty(object, prop) {
  if (typeof Object.hasOwn === "function") {
    return Object.hasOwn(object, prop);
  }
  return Object.prototype.hasOwnProperty.call(object, prop);
}
function chain(...fns) {
  return (...args) => {
    for (const fn of fns) {
      if (typeof fn === "function") {
        fn(...args);
      }
    }
  };
}
function normalizeString(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function omit(object, keys) {
  const result = { ...object };
  for (const key of keys) {
    if (hasOwnProperty(result, key)) {
      delete result[key];
    }
  }
  return result;
}
function pick(object, paths) {
  const result = {};
  for (const key of paths) {
    if (hasOwnProperty(object, key)) {
      result[key] = object[key];
    }
  }
  return result;
}
function identity(value) {
  return value;
}
function invariant(condition, message2) {
  if (condition) return;
  if (typeof message2 !== "string") throw new Error("Invariant failed");
  throw new Error(message2);
}
function getKeys(obj) {
  return Object.keys(obj);
}
function isFalsyBooleanCallback(booleanOrCallback, ...args) {
  const result = typeof booleanOrCallback === "function" ? booleanOrCallback(...args) : booleanOrCallback;
  if (result == null) return false;
  return !result;
}
function disabledFromProps(props) {
  return props.disabled || props["aria-disabled"] === true || props["aria-disabled"] === "true";
}
function removeUndefinedValues(obj) {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== void 0) {
      result[key] = obj[key];
    }
  }
  return result;
}
function defaultValue(...values) {
  for (const value of values) {
    if (value !== void 0) return value;
  }
  return void 0;
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/YXGXYGQX.js
var import_react4 = __toESM(require_react(), 1);
function setRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
function isValidElementWithRef(element) {
  if (!element) return false;
  if (!(0, import_react4.isValidElement)(element)) return false;
  if ("ref" in element.props) return true;
  if ("ref" in element) return true;
  return false;
}
function getRefProperty(element) {
  if (!isValidElementWithRef(element)) return null;
  const props = { ...element.props };
  return props.ref || element.ref;
}
function mergeProps2(base, overrides) {
  const props = { ...base };
  for (const key in overrides) {
    if (!hasOwnProperty(overrides, key)) continue;
    if (key === "className") {
      const prop = "className";
      props[prop] = base[prop] ? `${base[prop]} ${overrides[prop]}` : overrides[prop];
      continue;
    }
    if (key === "style") {
      const prop = "style";
      props[prop] = base[prop] ? { ...base[prop], ...overrides[prop] } : overrides[prop];
      continue;
    }
    const overrideValue = overrides[key];
    if (typeof overrideValue === "function" && key.startsWith("on")) {
      const baseValue = base[key];
      if (typeof baseValue === "function") {
        props[key] = (...args) => {
          overrideValue(...args);
          baseValue(...args);
        };
        continue;
      }
    }
    props[key] = overrideValue;
  }
  return props;
}

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/3DNM6L6E.js
var canUseDOM = checkIsBrowser();
function checkIsBrowser() {
  var _a;
  return typeof window !== "undefined" && !!((_a = window.document) == null ? void 0 : _a.createElement);
}
function getDocument(node) {
  if (!node) return document;
  if ("self" in node) return node.document;
  return node.ownerDocument || document;
}
function getActiveElement(node, activeDescendant = false) {
  var _a;
  const { activeElement: activeElement2 } = getDocument(node);
  if (!(activeElement2 == null ? void 0 : activeElement2.nodeName)) {
    return null;
  }
  if (isFrame(activeElement2) && ((_a = activeElement2.contentDocument) == null ? void 0 : _a.body)) {
    return getActiveElement(
      activeElement2.contentDocument.body,
      activeDescendant
    );
  }
  if (activeDescendant) {
    const id = activeElement2.getAttribute("aria-activedescendant");
    if (id) {
      const element = getDocument(activeElement2).getElementById(id);
      if (element) {
        return element;
      }
    }
  }
  return activeElement2;
}
function contains(parent, child) {
  return parent === child || parent.contains(child);
}
function isFrame(element) {
  return element.tagName === "IFRAME";
}
function isButton(element) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "button") return true;
  if (tagName === "input" && element.type) {
    return buttonInputTypes.indexOf(element.type) !== -1;
  }
  return false;
}
var buttonInputTypes = [
  "button",
  "color",
  "file",
  "image",
  "reset",
  "submit"
];
function isVisible(element) {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility();
  }
  const htmlElement = element;
  return htmlElement.offsetWidth > 0 || htmlElement.offsetHeight > 0 || element.getClientRects().length > 0;
}
function isTextField(element) {
  try {
    const isTextInput = element instanceof HTMLInputElement && element.selectionStart !== null;
    const isTextArea = element.tagName === "TEXTAREA";
    return isTextInput || isTextArea || false;
  } catch (_error) {
    return false;
  }
}
function isTextbox(element) {
  return element.isContentEditable || isTextField(element);
}
function getTextboxValue(element) {
  if (isTextField(element)) {
    return element.value;
  }
  if (element.isContentEditable) {
    const range = getDocument(element).createRange();
    range.selectNodeContents(element);
    return range.toString();
  }
  return "";
}
function getTextboxSelection(element) {
  let start = 0;
  let end = 0;
  if (isTextField(element)) {
    start = element.selectionStart || 0;
    end = element.selectionEnd || 0;
  } else if (element.isContentEditable) {
    const selection = getDocument(element).getSelection();
    if ((selection == null ? void 0 : selection.rangeCount) && selection.anchorNode && contains(element, selection.anchorNode) && selection.focusNode && contains(element, selection.focusNode)) {
      const range = selection.getRangeAt(0);
      const nextRange = range.cloneRange();
      nextRange.selectNodeContents(element);
      nextRange.setEnd(range.startContainer, range.startOffset);
      start = nextRange.toString().length;
      nextRange.setEnd(range.endContainer, range.endOffset);
      end = nextRange.toString().length;
    }
  }
  return { start, end };
}
function getPopupRole(element, fallback) {
  const allowedPopupRoles = ["dialog", "menu", "listbox", "tree", "grid"];
  const role = element == null ? void 0 : element.getAttribute("role");
  if (role && allowedPopupRoles.indexOf(role) !== -1) {
    return role;
  }
  return fallback;
}
function getScrollingElement(element) {
  if (!element) return null;
  const isScrollableOverflow = (overflow) => {
    if (overflow === "auto") return true;
    if (overflow === "scroll") return true;
    return false;
  };
  if (element.clientHeight && element.scrollHeight > element.clientHeight) {
    const { overflowY } = getComputedStyle(element);
    if (isScrollableOverflow(overflowY)) return element;
  } else if (element.clientWidth && element.scrollWidth > element.clientWidth) {
    const { overflowX } = getComputedStyle(element);
    if (isScrollableOverflow(overflowX)) return element;
  }
  return getScrollingElement(element.parentElement) || document.scrollingElement || document.body;
}
function setSelectionRange(element, ...args) {
  if (/text|search|password|tel|url/i.test(element.type)) {
    element.setSelectionRange(...args);
  }
}
function sortBasedOnDOMPosition(items, getElement) {
  const pairs = items.map((item, index) => [index, item]);
  let isOrderDifferent = false;
  pairs.sort(([indexA, a2], [indexB, b2]) => {
    const elementA = getElement(a2);
    const elementB = getElement(b2);
    if (elementA === elementB) return 0;
    if (!elementA || !elementB) return 0;
    if (isElementPreceding(elementA, elementB)) {
      if (indexA > indexB) {
        isOrderDifferent = true;
      }
      return -1;
    }
    if (indexA < indexB) {
      isOrderDifferent = true;
    }
    return 1;
  });
  if (isOrderDifferent) {
    return pairs.map(([_, item]) => item);
  }
  return items;
}
function isElementPreceding(a2, b2) {
  return Boolean(
    b2.compareDocumentPosition(a2) & Node.DOCUMENT_POSITION_PRECEDING
  );
}

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/SNHYQNEZ.js
function isTouchDevice() {
  return canUseDOM && !!navigator.maxTouchPoints;
}
function isApple() {
  if (!canUseDOM) return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform);
}
function isSafari() {
  return canUseDOM && isApple() && /apple/i.test(navigator.vendor);
}
function isFirefox() {
  return canUseDOM && /firefox\//i.test(navigator.userAgent);
}

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/utils/events.js
function isPortalEvent(event) {
  return Boolean(
    event.currentTarget && !contains(event.currentTarget, event.target)
  );
}
function isSelfTarget(event) {
  return event.target === event.currentTarget;
}
function isOpeningInNewTab(event) {
  const element = event.currentTarget;
  if (!element) return false;
  const isAppleDevice = isApple();
  if (isAppleDevice && !event.metaKey) return false;
  if (!isAppleDevice && !event.ctrlKey) return false;
  const tagName = element.tagName.toLowerCase();
  if (tagName === "a") return true;
  if (tagName === "button" && element.type === "submit") return true;
  if (tagName === "input" && element.type === "submit") return true;
  return false;
}
function isDownloading(event) {
  const element = event.currentTarget;
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  if (!event.altKey) return false;
  if (tagName === "a") return true;
  if (tagName === "button" && element.type === "submit") return true;
  if (tagName === "input" && element.type === "submit") return true;
  return false;
}
function fireBlurEvent(element, eventInit) {
  const event = new FocusEvent("blur", eventInit);
  const defaultAllowed = element.dispatchEvent(event);
  const bubbleInit = { ...eventInit, bubbles: true };
  element.dispatchEvent(new FocusEvent("focusout", bubbleInit));
  return defaultAllowed;
}
function fireKeyboardEvent(element, type, eventInit) {
  const event = new KeyboardEvent(type, eventInit);
  return element.dispatchEvent(event);
}
function fireClickEvent(element, eventInit) {
  const event = new MouseEvent("click", eventInit);
  return element.dispatchEvent(event);
}
function isFocusEventOutside(event, container) {
  const containerElement = container || event.currentTarget;
  const relatedTarget = event.relatedTarget;
  return !relatedTarget || !contains(containerElement, relatedTarget);
}
function queueBeforeEvent(element, type, callback, timeout) {
  const createTimer = (callback2) => {
    if (timeout) {
      const timerId2 = setTimeout(callback2, timeout);
      return () => clearTimeout(timerId2);
    }
    const timerId = requestAnimationFrame(callback2);
    return () => cancelAnimationFrame(timerId);
  };
  const cancelTimer = createTimer(() => {
    element.removeEventListener(type, callSync, true);
    callback();
  });
  const callSync = () => {
    cancelTimer();
    callback();
  };
  element.addEventListener(type, callSync, { once: true, capture: true });
  return cancelTimer;
}
function addGlobalEventListener(type, listener, options, scope = window) {
  const children = [];
  try {
    scope.document.addEventListener(type, listener, options);
    for (const frame of Array.from(scope.frames)) {
      children.push(addGlobalEventListener(type, listener, options, frame));
    }
  } catch (e2) {
  }
  const removeEventListener = () => {
    try {
      scope.document.removeEventListener(type, listener, options);
    } catch (e2) {
    }
    for (const remove of children) {
      remove();
    }
  };
  return removeEventListener;
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/KPHZR4MB.js
var React5 = __toESM(require_react(), 1);
var import_react5 = __toESM(require_react(), 1);
var _React = { ...React5 };
var useReactId = _React.useId;
var useReactDeferredValue = _React.useDeferredValue;
var useReactInsertionEffect = _React.useInsertionEffect;
var useSafeLayoutEffect = canUseDOM ? import_react5.useLayoutEffect : import_react5.useEffect;
function useInitialValue(value) {
  const [initialValue] = (0, import_react5.useState)(value);
  return initialValue;
}
function useLiveRef(value) {
  const ref = (0, import_react5.useRef)(value);
  useSafeLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
function useEvent(callback) {
  const ref = (0, import_react5.useRef)(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  if (useReactInsertionEffect) {
    useReactInsertionEffect(() => {
      ref.current = callback;
    });
  } else {
    ref.current = callback;
  }
  return (0, import_react5.useCallback)((...args) => {
    var _a;
    return (_a = ref.current) == null ? void 0 : _a.call(ref, ...args);
  }, []);
}
function useTransactionState(callback) {
  const [state, setState] = (0, import_react5.useState)(null);
  useSafeLayoutEffect(() => {
    if (state == null) return;
    if (!callback) return;
    let prevState = null;
    callback((prev) => {
      prevState = prev;
      return state;
    });
    return () => {
      callback(prevState);
    };
  }, [state, callback]);
  return [state, setState];
}
function useMergeRefs(...refs) {
  return (0, import_react5.useMemo)(() => {
    if (!refs.some(Boolean)) return;
    return (value) => {
      for (const ref of refs) {
        setRef(ref, value);
      }
    };
  }, refs);
}
function useId3(defaultId) {
  if (useReactId) {
    const reactId = useReactId();
    if (defaultId) return defaultId;
    return reactId;
  }
  const [id, setId] = (0, import_react5.useState)(defaultId);
  useSafeLayoutEffect(() => {
    if (defaultId || id) return;
    const random = Math.random().toString(36).slice(2, 8);
    setId(`id-${random}`);
  }, [defaultId, id]);
  return defaultId || id;
}
function useTagName(refOrElement, type) {
  const stringOrUndefined = (type2) => {
    if (typeof type2 !== "string") return;
    return type2;
  };
  const [tagName, setTagName] = (0, import_react5.useState)(() => stringOrUndefined(type));
  useSafeLayoutEffect(() => {
    const element = refOrElement && "current" in refOrElement ? refOrElement.current : refOrElement;
    setTagName((element == null ? void 0 : element.tagName.toLowerCase()) || stringOrUndefined(type));
  }, [refOrElement, type]);
  return tagName;
}
function useAttribute(refOrElement, attributeName, defaultValue2) {
  const initialValue = useInitialValue(defaultValue2);
  const [attribute, setAttribute] = (0, import_react5.useState)(initialValue);
  (0, import_react5.useEffect)(() => {
    const element = refOrElement && "current" in refOrElement ? refOrElement.current : refOrElement;
    if (!element) return;
    const callback = () => {
      const value = element.getAttribute(attributeName);
      setAttribute(value == null ? initialValue : value);
    };
    const observer = new MutationObserver(callback);
    observer.observe(element, { attributeFilter: [attributeName] });
    callback();
    return () => observer.disconnect();
  }, [refOrElement, attributeName, initialValue]);
  return attribute;
}
function useUpdateEffect(effect, deps) {
  const mounted = (0, import_react5.useRef)(false);
  (0, import_react5.useEffect)(() => {
    if (mounted.current) {
      return effect();
    }
    mounted.current = true;
  }, deps);
  (0, import_react5.useEffect)(
    () => () => {
      mounted.current = false;
    },
    []
  );
}
function useUpdateLayoutEffect(effect, deps) {
  const mounted = (0, import_react5.useRef)(false);
  useSafeLayoutEffect(() => {
    if (mounted.current) {
      return effect();
    }
    mounted.current = true;
  }, deps);
  useSafeLayoutEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );
}
function useForceUpdate() {
  return (0, import_react5.useReducer)(() => [], []);
}
function useBooleanEvent(booleanOrCallback) {
  return useEvent(
    typeof booleanOrCallback === "function" ? booleanOrCallback : () => booleanOrCallback
  );
}
function useWrapElement(props, callback, deps = []) {
  const wrapElement = (0, import_react5.useCallback)(
    (element) => {
      if (props.wrapElement) {
        element = props.wrapElement(element);
      }
      return callback(element);
    },
    [...deps, props.wrapElement]
  );
  return { ...props, wrapElement };
}
function useMetadataProps(props, key, value) {
  const parent = props.onLoadedMetadataCapture;
  const onLoadedMetadataCapture = (0, import_react5.useMemo)(() => {
    return Object.assign(() => {
    }, { ...parent, [key]: value });
  }, [parent, key, value]);
  return [parent == null ? void 0 : parent[key], { onLoadedMetadataCapture }];
}
var hasInstalledGlobalEventListeners = false;
function useIsMouseMoving() {
  (0, import_react5.useEffect)(() => {
    if (hasInstalledGlobalEventListeners) return;
    addGlobalEventListener("mousemove", setMouseMoving, true);
    addGlobalEventListener("mousedown", resetMouseMoving, true);
    addGlobalEventListener("mouseup", resetMouseMoving, true);
    addGlobalEventListener("keydown", resetMouseMoving, true);
    addGlobalEventListener("scroll", resetMouseMoving, true);
    hasInstalledGlobalEventListeners = true;
  }, []);
  const isMouseMoving = useEvent(() => mouseMoving);
  return isMouseMoving;
}
var mouseMoving = false;
var previousScreenX = 0;
var previousScreenY = 0;
function hasMouseMovement(event) {
  const movementX = event.movementX || event.screenX - previousScreenX;
  const movementY = event.movementY || event.screenY - previousScreenY;
  previousScreenX = event.screenX;
  previousScreenY = event.screenY;
  return movementX || movementY || false;
}
function setMouseMoving(event) {
  if (!hasMouseMovement(event)) return;
  mouseMoving = true;
}
function resetMouseMoving() {
  mouseMoving = false;
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/GWSL6KNJ.js
var React6 = __toESM(require_react(), 1);
var import_jsx_runtime51 = __toESM(require_jsx_runtime(), 1);
function forwardRef22(render4) {
  const Role = React6.forwardRef(
    // @ts-ignore Incompatible with React 19 types. Ignore for now.
    (props, ref) => render4({ ...props, ref })
  );
  Role.displayName = render4.displayName || render4.name;
  return Role;
}
function memo22(Component, propsAreEqual) {
  return React6.memo(Component, propsAreEqual);
}
function createElement3(Type, props) {
  const { wrapElement, render: render4, ...rest } = props;
  const mergedRef = useMergeRefs(props.ref, getRefProperty(render4));
  let element;
  if (React6.isValidElement(render4)) {
    const renderProps = {
      // @ts-ignore Incompatible with React 19 types. Ignore for now.
      ...render4.props,
      ref: mergedRef
    };
    element = React6.cloneElement(render4, mergeProps2(rest, renderProps));
  } else if (render4) {
    element = render4(rest);
  } else {
    element = /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(Type, { ...rest });
  }
  if (wrapElement) {
    return wrapElement(element);
  }
  return element;
}
function createHook(useProps) {
  const useRole = (props = {}) => {
    return useProps(props);
  };
  useRole.displayName = useProps.name;
  return useRole;
}
function createStoreContext(providers = [], scopedProviders = []) {
  const context = React6.createContext(void 0);
  const scopedContext = React6.createContext(void 0);
  const useContext210 = () => React6.useContext(context);
  const useScopedContext = (onlyScoped = false) => {
    const scoped = React6.useContext(scopedContext);
    const store3 = useContext210();
    if (onlyScoped) return scoped;
    return scoped || store3;
  };
  const useProviderContext = () => {
    const scoped = React6.useContext(scopedContext);
    const store3 = useContext210();
    if (scoped && scoped === store3) return;
    return store3;
  };
  const ContextProvider = (props) => {
    return providers.reduceRight(
      (children, Provider) => /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(Provider, { ...props, children }),
      /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(context.Provider, { ...props })
    );
  };
  const ScopedContextProvider = (props) => {
    return /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(ContextProvider, { ...props, children: scopedProviders.reduceRight(
      (children, Provider) => /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(Provider, { ...props, children }),
      /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(scopedContext.Provider, { ...props })
    ) });
  };
  return {
    context,
    scopedContext,
    useContext: useContext210,
    useScopedContext,
    useProviderContext,
    ContextProvider,
    ScopedContextProvider
  };
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/SMPCIMZM.js
var ctx = createStoreContext();
var useCollectionContext = ctx.useContext;
var useCollectionScopedContext = ctx.useScopedContext;
var useCollectionProviderContext = ctx.useProviderContext;
var CollectionContextProvider = ctx.ContextProvider;
var CollectionScopedContextProvider = ctx.ScopedContextProvider;

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/AVVXDJMZ.js
var import_react6 = __toESM(require_react(), 1);
var ctx2 = createStoreContext(
  [CollectionContextProvider],
  [CollectionScopedContextProvider]
);
var useCompositeContext = ctx2.useContext;
var useCompositeScopedContext = ctx2.useScopedContext;
var useCompositeProviderContext = ctx2.useProviderContext;
var CompositeContextProvider = ctx2.ContextProvider;
var CompositeScopedContextProvider = ctx2.ScopedContextProvider;
var CompositeItemContext = (0, import_react6.createContext)(
  void 0
);
var CompositeRowContext = (0, import_react6.createContext)(
  void 0
);

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/5VQZOHHZ.js
function findFirstEnabledItem(items, excludeId) {
  return items.find((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}
function getEnabledItem(store3, id) {
  if (!id) return null;
  return store3.item(id) || null;
}
function groupItemsByRows(items) {
  const rows = [];
  for (const item of items) {
    const row = rows.find((currentRow) => {
      var _a;
      return ((_a = currentRow[0]) == null ? void 0 : _a.rowId) === item.rowId;
    });
    if (row) {
      row.push(item);
    } else {
      rows.push([item]);
    }
  }
  return rows;
}
function selectTextField(element, collapseToEnd = false) {
  if (isTextField(element)) {
    element.setSelectionRange(
      collapseToEnd ? element.value.length : 0,
      element.value.length
    );
  } else if (element.isContentEditable) {
    const selection = getDocument(element).getSelection();
    selection == null ? void 0 : selection.selectAllChildren(element);
    if (collapseToEnd) {
      selection == null ? void 0 : selection.collapseToEnd();
    }
  }
}
var FOCUS_SILENTLY = /* @__PURE__ */ Symbol("FOCUS_SILENTLY");
function focusSilently(element) {
  element[FOCUS_SILENTLY] = true;
  element.focus({ preventScroll: true });
}
function silentlyFocused(element) {
  const isSilentlyFocused = element[FOCUS_SILENTLY];
  delete element[FOCUS_SILENTLY];
  return isSilentlyFocused;
}
function isItem(store3, element, exclude) {
  if (!element) return false;
  if (element === exclude) return false;
  const item = store3.item(element.id);
  if (!item) return false;
  if (exclude && item.element === exclude) return false;
  return true;
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/Z2O3VLAQ.js
var import_react7 = __toESM(require_react(), 1);
var TagName = "div";
var useCollectionItem = createHook(
  function useCollectionItem2({
    store: store3,
    shouldRegisterItem = true,
    getItem = identity,
    // @ts-expect-error This prop may come from a collection renderer.
    element,
    ...props
  }) {
    const context = useCollectionContext();
    store3 = store3 || context;
    const id = useId3(props.id);
    const ref = (0, import_react7.useRef)(element);
    (0, import_react7.useEffect)(() => {
      const element2 = ref.current;
      if (!id) return;
      if (!element2) return;
      if (!shouldRegisterItem) return;
      const item = getItem({ id, element: element2 });
      return store3 == null ? void 0 : store3.renderItem(item);
    }, [id, shouldRegisterItem, getItem, store3]);
    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref)
    };
    return removeUndefinedValues(props);
  }
);
var CollectionItem = forwardRef22(function CollectionItem2(props) {
  const htmlProps = useCollectionItem(props);
  return createElement3(TagName, htmlProps);
});

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/SWN3JYXT.js
var import_react8 = __toESM(require_react(), 1);
var FocusableContext = (0, import_react8.createContext)(true);

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/utils/focus.js
var selector = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], summary, iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false'])";
function isFocusable(element) {
  if (!element.matches(selector)) return false;
  if (!isVisible(element)) return false;
  if (element.closest("[inert]")) return false;
  return true;
}
function getClosestFocusable(element) {
  while (element && !isFocusable(element)) {
    element = element.closest(selector);
  }
  return element || null;
}
function hasFocus(element) {
  const activeElement2 = getActiveElement(element);
  if (!activeElement2) return false;
  if (activeElement2 === element) return true;
  const activeDescendant = activeElement2.getAttribute("aria-activedescendant");
  if (!activeDescendant) return false;
  return activeDescendant === element.id;
}
function hasFocusWithin(element) {
  const activeElement2 = getActiveElement(element);
  if (!activeElement2) return false;
  if (contains(element, activeElement2)) return true;
  const activeDescendant = activeElement2.getAttribute("aria-activedescendant");
  if (!activeDescendant) return false;
  if (!("id" in element)) return false;
  if (activeDescendant === element.id) return true;
  return !!element.querySelector(`#${CSS.escape(activeDescendant)}`);
}
function focusIfNeeded(element) {
  if (!hasFocusWithin(element) && isFocusable(element)) {
    element.focus();
  }
}
function focusIntoView(element, options) {
  if (!("scrollIntoView" in element)) {
    element.focus();
  } else {
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: "nearest", inline: "nearest", ...options });
  }
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/U6HHPQDW.js
var import_react9 = __toESM(require_react(), 1);
var TagName2 = "div";
var isSafariBrowser = isSafari();
var alwaysFocusVisibleInputTypes = [
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password",
  "number",
  "date",
  "month",
  "week",
  "time",
  "datetime",
  "datetime-local"
];
var safariFocusAncestorSymbol = /* @__PURE__ */ Symbol("safariFocusAncestor");
function markSafariFocusAncestor(element, value) {
  if (!element) return;
  element[safariFocusAncestorSymbol] = value;
}
function isAlwaysFocusVisible(element) {
  const { tagName, readOnly, type } = element;
  if (tagName === "TEXTAREA" && !readOnly) return true;
  if (tagName === "SELECT" && !readOnly) return true;
  if (tagName === "INPUT" && !readOnly) {
    return alwaysFocusVisibleInputTypes.includes(type);
  }
  if (element.isContentEditable) return true;
  const role = element.getAttribute("role");
  if (role === "combobox" && element.dataset.name) {
    return true;
  }
  return false;
}
function getLabels(element) {
  if ("labels" in element) {
    return element.labels;
  }
  return null;
}
function isNativeCheckboxOrRadio(element) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "input" && element.type) {
    return element.type === "radio" || element.type === "checkbox";
  }
  return false;
}
function isNativeTabbable(tagName) {
  if (!tagName) return true;
  return tagName === "button" || tagName === "summary" || tagName === "input" || tagName === "select" || tagName === "textarea" || tagName === "a";
}
function supportsDisabledAttribute(tagName) {
  if (!tagName) return true;
  return tagName === "button" || tagName === "input" || tagName === "select" || tagName === "textarea";
}
function getTabIndex(focusable, trulyDisabled, nativeTabbable, supportsDisabled, tabIndexProp) {
  if (!focusable) {
    return tabIndexProp;
  }
  if (trulyDisabled) {
    if (nativeTabbable && !supportsDisabled) {
      return -1;
    }
    return;
  }
  if (nativeTabbable) {
    return tabIndexProp;
  }
  return tabIndexProp || 0;
}
function useDisableEvent(onEvent, disabled2) {
  return useEvent((event) => {
    onEvent == null ? void 0 : onEvent(event);
    if (event.defaultPrevented) return;
    if (disabled2) {
      event.stopPropagation();
      event.preventDefault();
    }
  });
}
var hasInstalledGlobalEventListeners2 = false;
var isKeyboardModality = true;
function onGlobalMouseDown(event) {
  const target = event.target;
  if (target && "hasAttribute" in target) {
    if (!target.hasAttribute("data-focus-visible")) {
      isKeyboardModality = false;
    }
  }
}
function onGlobalKeyDown(event) {
  if (event.metaKey) return;
  if (event.ctrlKey) return;
  if (event.altKey) return;
  isKeyboardModality = true;
}
var useFocusable = createHook(
  function useFocusable2({
    focusable = true,
    accessibleWhenDisabled,
    autoFocus,
    onFocusVisible,
    ...props
  }) {
    const ref = (0, import_react9.useRef)(null);
    (0, import_react9.useEffect)(() => {
      if (!focusable) return;
      if (hasInstalledGlobalEventListeners2) return;
      addGlobalEventListener("mousedown", onGlobalMouseDown, true);
      addGlobalEventListener("keydown", onGlobalKeyDown, true);
      hasInstalledGlobalEventListeners2 = true;
    }, [focusable]);
    if (isSafariBrowser) {
      (0, import_react9.useEffect)(() => {
        if (!focusable) return;
        const element = ref.current;
        if (!element) return;
        if (!isNativeCheckboxOrRadio(element)) return;
        const labels = getLabels(element);
        if (!labels) return;
        const onMouseUp = () => queueMicrotask(() => element.focus());
        for (const label of labels) {
          label.addEventListener("mouseup", onMouseUp);
        }
        return () => {
          for (const label of labels) {
            label.removeEventListener("mouseup", onMouseUp);
          }
        };
      }, [focusable]);
    }
    const disabled2 = focusable && disabledFromProps(props);
    const trulyDisabled = !!disabled2 && !accessibleWhenDisabled;
    const [focusVisible, setFocusVisible] = (0, import_react9.useState)(false);
    (0, import_react9.useEffect)(() => {
      if (!focusable) return;
      if (trulyDisabled && focusVisible) {
        setFocusVisible(false);
      }
    }, [focusable, trulyDisabled, focusVisible]);
    (0, import_react9.useEffect)(() => {
      if (!focusable) return;
      if (!focusVisible) return;
      const element = ref.current;
      if (!element) return;
      if (typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver(() => {
        if (!isFocusable(element)) {
          setFocusVisible(false);
        }
      });
      observer.observe(element);
      return () => observer.disconnect();
    }, [focusable, focusVisible]);
    const onKeyPressCapture = useDisableEvent(
      props.onKeyPressCapture,
      disabled2
    );
    const onMouseDownCapture = useDisableEvent(
      props.onMouseDownCapture,
      disabled2
    );
    const onClickCapture = useDisableEvent(props.onClickCapture, disabled2);
    const onMouseDownProp = props.onMouseDown;
    const onMouseDown = useEvent((event) => {
      onMouseDownProp == null ? void 0 : onMouseDownProp(event);
      if (event.defaultPrevented) return;
      if (!focusable) return;
      const element = event.currentTarget;
      if (!isSafariBrowser) return;
      if (isPortalEvent(event)) return;
      if (!isButton(element) && !isNativeCheckboxOrRadio(element)) return;
      let receivedFocus = false;
      const onFocus = () => {
        receivedFocus = true;
      };
      const options = { capture: true, once: true };
      element.addEventListener("focusin", onFocus, options);
      const focusableContainer = getClosestFocusable(element.parentElement);
      markSafariFocusAncestor(focusableContainer, true);
      queueBeforeEvent(element, "mouseup", () => {
        element.removeEventListener("focusin", onFocus, true);
        markSafariFocusAncestor(focusableContainer, false);
        if (receivedFocus) return;
        focusIfNeeded(element);
      });
    });
    const handleFocusVisible = (event, currentTarget) => {
      if (currentTarget) {
        event.currentTarget = currentTarget;
      }
      if (!focusable) return;
      const element = event.currentTarget;
      if (!element) return;
      if (!hasFocus(element)) return;
      onFocusVisible == null ? void 0 : onFocusVisible(event);
      if (event.defaultPrevented) return;
      element.dataset.focusVisible = "true";
      setFocusVisible(true);
    };
    const onKeyDownCaptureProp = props.onKeyDownCapture;
    const onKeyDownCapture = useEvent((event) => {
      onKeyDownCaptureProp == null ? void 0 : onKeyDownCaptureProp(event);
      if (event.defaultPrevented) return;
      if (!focusable) return;
      if (focusVisible) return;
      if (event.metaKey) return;
      if (event.altKey) return;
      if (event.ctrlKey) return;
      if (!isSelfTarget(event)) return;
      const element = event.currentTarget;
      const applyFocusVisible = () => handleFocusVisible(event, element);
      queueBeforeEvent(element, "focusout", applyFocusVisible);
    });
    const onFocusCaptureProp = props.onFocusCapture;
    const onFocusCapture = useEvent((event) => {
      onFocusCaptureProp == null ? void 0 : onFocusCaptureProp(event);
      if (event.defaultPrevented) return;
      if (!focusable) return;
      if (!isSelfTarget(event)) {
        setFocusVisible(false);
        return;
      }
      const element = event.currentTarget;
      const applyFocusVisible = () => handleFocusVisible(event, element);
      if (isKeyboardModality || isAlwaysFocusVisible(event.target)) {
        queueBeforeEvent(event.target, "focusout", applyFocusVisible);
      } else {
        setFocusVisible(false);
      }
    });
    const onBlurProp = props.onBlur;
    const onBlur = useEvent((event) => {
      onBlurProp == null ? void 0 : onBlurProp(event);
      if (!focusable) return;
      if (!isFocusEventOutside(event)) return;
      event.currentTarget.removeAttribute("data-focus-visible");
      setFocusVisible(false);
    });
    const autoFocusOnShow = (0, import_react9.useContext)(FocusableContext);
    const autoFocusRef = useEvent((element) => {
      if (!focusable) return;
      if (!autoFocus) return;
      if (!element) return;
      if (!autoFocusOnShow) return;
      queueMicrotask(() => {
        if (hasFocus(element)) return;
        if (!isFocusable(element)) return;
        element.focus();
      });
    });
    const tagName = useTagName(ref);
    const nativeTabbable = focusable && isNativeTabbable(tagName);
    const supportsDisabled = focusable && supportsDisabledAttribute(tagName);
    const styleProp = props.style;
    const style = (0, import_react9.useMemo)(() => {
      if (trulyDisabled) {
        return { pointerEvents: "none", ...styleProp };
      }
      return styleProp;
    }, [trulyDisabled, styleProp]);
    props = {
      "data-focus-visible": focusable && focusVisible || void 0,
      "data-autofocus": autoFocus || void 0,
      "aria-disabled": disabled2 || void 0,
      ...props,
      ref: useMergeRefs(ref, autoFocusRef, props.ref),
      style,
      tabIndex: getTabIndex(
        focusable,
        trulyDisabled,
        nativeTabbable,
        supportsDisabled,
        props.tabIndex
      ),
      disabled: supportsDisabled && trulyDisabled ? true : void 0,
      // TODO: Test Focusable contentEditable.
      contentEditable: disabled2 ? void 0 : props.contentEditable,
      onKeyPressCapture,
      onClickCapture,
      onMouseDownCapture,
      onMouseDown,
      onKeyDownCapture,
      onFocusCapture,
      onBlur
    };
    return removeUndefinedValues(props);
  }
);
var Focusable = forwardRef22(function Focusable2(props) {
  const htmlProps = useFocusable(props);
  return createElement3(TagName2, htmlProps);
});

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/PZ3OL7I2.js
var import_react10 = __toESM(require_react(), 1);
var TagName3 = "button";
function isNativeClick(event) {
  if (!event.isTrusted) return false;
  const element = event.currentTarget;
  if (event.key === "Enter") {
    return isButton(element) || element.tagName === "SUMMARY" || element.tagName === "A";
  }
  if (event.key === " ") {
    return isButton(element) || element.tagName === "SUMMARY" || element.tagName === "INPUT" || element.tagName === "SELECT";
  }
  return false;
}
var symbol = /* @__PURE__ */ Symbol("command");
var useCommand = createHook(
  function useCommand2({ clickOnEnter = true, clickOnSpace = true, ...props }) {
    const ref = (0, import_react10.useRef)(null);
    const [isNativeButton, setIsNativeButton] = (0, import_react10.useState)(false);
    (0, import_react10.useEffect)(() => {
      if (!ref.current) return;
      setIsNativeButton(isButton(ref.current));
    }, []);
    const [active, setActive] = (0, import_react10.useState)(false);
    const activeRef = (0, import_react10.useRef)(false);
    const disabled2 = disabledFromProps(props);
    const [isDuplicate, metadataProps] = useMetadataProps(props, symbol, true);
    const onKeyDownProp = props.onKeyDown;
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      const element = event.currentTarget;
      if (event.defaultPrevented) return;
      if (isDuplicate) return;
      if (disabled2) return;
      if (!isSelfTarget(event)) return;
      if (isTextField(element)) return;
      if (element.isContentEditable) return;
      const isEnter = clickOnEnter && event.key === "Enter";
      const isSpace = clickOnSpace && event.key === " ";
      const shouldPreventEnter = event.key === "Enter" && !clickOnEnter;
      const shouldPreventSpace = event.key === " " && !clickOnSpace;
      if (shouldPreventEnter || shouldPreventSpace) {
        event.preventDefault();
        return;
      }
      if (isEnter || isSpace) {
        const nativeClick = isNativeClick(event);
        if (isEnter) {
          if (!nativeClick) {
            event.preventDefault();
            const { view, ...eventInit } = event;
            const click = () => fireClickEvent(element, eventInit);
            if (isFirefox()) {
              queueBeforeEvent(element, "keyup", click);
            } else {
              queueMicrotask(click);
            }
          }
        } else if (isSpace) {
          activeRef.current = true;
          if (!nativeClick) {
            event.preventDefault();
            setActive(true);
          }
        }
      }
    });
    const onKeyUpProp = props.onKeyUp;
    const onKeyUp = useEvent((event) => {
      onKeyUpProp == null ? void 0 : onKeyUpProp(event);
      if (event.defaultPrevented) return;
      if (isDuplicate) return;
      if (disabled2) return;
      if (event.metaKey) return;
      const isSpace = clickOnSpace && event.key === " ";
      if (activeRef.current && isSpace) {
        activeRef.current = false;
        if (!isNativeClick(event)) {
          event.preventDefault();
          setActive(false);
          const element = event.currentTarget;
          const { view, ...eventInit } = event;
          queueMicrotask(() => fireClickEvent(element, eventInit));
        }
      }
    });
    props = {
      "data-active": active || void 0,
      type: isNativeButton ? "button" : void 0,
      ...metadataProps,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onKeyDown,
      onKeyUp
    };
    props = useFocusable(props);
    return props;
  }
);
var Command = forwardRef22(function Command2(props) {
  const htmlProps = useCommand(props);
  return createElement3(TagName3, htmlProps);
});

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/SXKM4CGU.js
function getInternal(store3, key) {
  const internals = store3.__unstableInternals;
  invariant(internals, "Invalid store");
  return internals[key];
}
function createStore(initialState, ...stores) {
  let state = initialState;
  let prevStateBatch = state;
  let lastUpdate = /* @__PURE__ */ Symbol();
  let destroy = noop;
  const instances = /* @__PURE__ */ new Set();
  const updatedKeys = /* @__PURE__ */ new Set();
  const setups = /* @__PURE__ */ new Set();
  const listeners = /* @__PURE__ */ new Set();
  const batchListeners = /* @__PURE__ */ new Set();
  const disposables = /* @__PURE__ */ new WeakMap();
  const listenerKeys = /* @__PURE__ */ new WeakMap();
  const storeSetup = (callback) => {
    setups.add(callback);
    return () => setups.delete(callback);
  };
  const storeInit = () => {
    const initialized = instances.size;
    const instance = /* @__PURE__ */ Symbol();
    instances.add(instance);
    const maybeDestroy = () => {
      instances.delete(instance);
      if (instances.size) return;
      destroy();
    };
    if (initialized) return maybeDestroy;
    const desyncs = getKeys(state).map(
      (key) => chain(
        ...stores.map((store3) => {
          var _a;
          const storeState = (_a = store3 == null ? void 0 : store3.getState) == null ? void 0 : _a.call(store3);
          if (!storeState) return;
          if (!hasOwnProperty(storeState, key)) return;
          return sync(store3, [key], (state2) => {
            setState(
              key,
              state2[key],
              // @ts-expect-error - Not public API. This is just to prevent
              // infinite loops.
              true
            );
          });
        })
      )
    );
    const teardowns = [];
    for (const setup2 of setups) {
      teardowns.push(setup2());
    }
    const cleanups = stores.map(init);
    destroy = chain(...desyncs, ...teardowns, ...cleanups);
    return maybeDestroy;
  };
  const sub = (keys, listener, set2 = listeners) => {
    set2.add(listener);
    listenerKeys.set(listener, keys);
    return () => {
      var _a;
      (_a = disposables.get(listener)) == null ? void 0 : _a();
      disposables.delete(listener);
      listenerKeys.delete(listener);
      set2.delete(listener);
    };
  };
  const storeSubscribe = (keys, listener) => sub(keys, listener);
  const storeSync = (keys, listener) => {
    disposables.set(listener, listener(state, state));
    return sub(keys, listener);
  };
  const storeBatch = (keys, listener) => {
    disposables.set(listener, listener(state, prevStateBatch));
    return sub(keys, listener, batchListeners);
  };
  const storePick = (keys) => createStore(pick(state, keys), finalStore);
  const storeOmit = (keys) => createStore(omit(state, keys), finalStore);
  const getState = () => state;
  const setState = (key, value, fromStores = false) => {
    var _a;
    if (!hasOwnProperty(state, key)) return;
    const nextValue = applyState(value, state[key]);
    if (nextValue === state[key]) return;
    if (!fromStores) {
      for (const store3 of stores) {
        (_a = store3 == null ? void 0 : store3.setState) == null ? void 0 : _a.call(store3, key, nextValue);
      }
    }
    const prevState = state;
    state = { ...state, [key]: nextValue };
    const thisUpdate = /* @__PURE__ */ Symbol();
    lastUpdate = thisUpdate;
    updatedKeys.add(key);
    const run = (listener, prev, uKeys) => {
      var _a2;
      const keys = listenerKeys.get(listener);
      const updated = (k) => uKeys ? uKeys.has(k) : k === key;
      if (!keys || keys.some(updated)) {
        (_a2 = disposables.get(listener)) == null ? void 0 : _a2();
        disposables.set(listener, listener(state, prev));
      }
    };
    for (const listener of listeners) {
      run(listener, prevState);
    }
    queueMicrotask(() => {
      if (lastUpdate !== thisUpdate) return;
      const snapshot = state;
      for (const listener of batchListeners) {
        run(listener, prevStateBatch, updatedKeys);
      }
      prevStateBatch = snapshot;
      updatedKeys.clear();
    });
  };
  const finalStore = {
    getState,
    setState,
    __unstableInternals: {
      setup: storeSetup,
      init: storeInit,
      subscribe: storeSubscribe,
      sync: storeSync,
      batch: storeBatch,
      pick: storePick,
      omit: storeOmit
    }
  };
  return finalStore;
}
function setup(store3, ...args) {
  if (!store3) return;
  return getInternal(store3, "setup")(...args);
}
function init(store3, ...args) {
  if (!store3) return;
  return getInternal(store3, "init")(...args);
}
function subscribe(store3, ...args) {
  if (!store3) return;
  return getInternal(store3, "subscribe")(...args);
}
function sync(store3, ...args) {
  if (!store3) return;
  return getInternal(store3, "sync")(...args);
}
function batch(store3, ...args) {
  if (!store3) return;
  return getInternal(store3, "batch")(...args);
}
function omit2(store3, ...args) {
  if (!store3) return;
  return getInternal(store3, "omit")(...args);
}
function pick2(store3, ...args) {
  if (!store3) return;
  return getInternal(store3, "pick")(...args);
}
function mergeStore(...stores) {
  var _a;
  const initialState = {};
  for (const store22 of stores) {
    const nextState = (_a = store22 == null ? void 0 : store22.getState) == null ? void 0 : _a.call(store22);
    if (nextState) {
      Object.assign(initialState, nextState);
    }
  }
  const store3 = createStore(initialState, ...stores);
  return Object.assign({}, ...stores, store3);
}
function throwOnConflictingProps(props, store3) {
  if (false) return;
  if (!store3) return;
  const defaultKeys = Object.entries(props).filter(([key, value]) => key.startsWith("default") && value !== void 0).map(([key]) => {
    var _a;
    const stateKey = key.replace("default", "");
    return `${((_a = stateKey[0]) == null ? void 0 : _a.toLowerCase()) || ""}${stateKey.slice(1)}`;
  });
  if (!defaultKeys.length) return;
  const storeState = store3.getState();
  const conflictingProps = defaultKeys.filter(
    (key) => hasOwnProperty(storeState, key)
  );
  if (!conflictingProps.length) return;
  throw new Error(
    `Passing a store prop in conjunction with a default state is not supported.

const store = useSelectStore();
<SelectProvider store={store} defaultValue="Apple" />
                ^             ^

Instead, pass the default state to the topmost store:

const store = useSelectStore({ defaultValue: "Apple" });
<SelectProvider store={store} />

See https://github.com/ariakit/ariakit/pull/2745 for more details.

If there's a particular need for this, please submit a feature request at https://github.com/ariakit/ariakit
`
  );
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/Q5W46E73.js
var React7 = __toESM(require_react(), 1);
var import_shim = __toESM(require_shim(), 1);
var { useSyncExternalStore } = import_shim.default;
var noopSubscribe = () => () => {
};
function useStoreState(store3, keyOrSelector = identity) {
  const storeSubscribe = React7.useCallback(
    (callback) => {
      if (!store3) return noopSubscribe();
      return subscribe(store3, null, callback);
    },
    [store3]
  );
  const getSnapshot = () => {
    const key = typeof keyOrSelector === "string" ? keyOrSelector : null;
    const selector2 = typeof keyOrSelector === "function" ? keyOrSelector : null;
    const state = store3 == null ? void 0 : store3.getState();
    if (selector2) return selector2(state);
    if (!state) return;
    if (!key) return;
    if (!hasOwnProperty(state, key)) return;
    return state[key];
  };
  return useSyncExternalStore(storeSubscribe, getSnapshot, getSnapshot);
}
function useStoreStateObject(store3, object) {
  const objRef = React7.useRef(
    {}
  );
  const storeSubscribe = React7.useCallback(
    (callback) => {
      if (!store3) return noopSubscribe();
      return subscribe(store3, null, callback);
    },
    [store3]
  );
  const getSnapshot = () => {
    const state = store3 == null ? void 0 : store3.getState();
    let updated = false;
    const obj = objRef.current;
    for (const prop in object) {
      const keyOrSelector = object[prop];
      if (typeof keyOrSelector === "function") {
        const value = keyOrSelector(state);
        if (value !== obj[prop]) {
          obj[prop] = value;
          updated = true;
        }
      }
      if (typeof keyOrSelector === "string") {
        if (!state) continue;
        if (!hasOwnProperty(state, keyOrSelector)) continue;
        const value = state[keyOrSelector];
        if (value !== obj[prop]) {
          obj[prop] = value;
          updated = true;
        }
      }
    }
    if (updated) {
      objRef.current = { ...obj };
    }
    return objRef.current;
  };
  return useSyncExternalStore(storeSubscribe, getSnapshot, getSnapshot);
}
function useStoreProps(store3, props, key, setKey) {
  const value = hasOwnProperty(props, key) ? props[key] : void 0;
  const setValue = setKey ? props[setKey] : void 0;
  const propsRef = useLiveRef({ value, setValue });
  useSafeLayoutEffect(() => {
    return sync(store3, [key], (state, prev) => {
      const { value: value2, setValue: setValue2 } = propsRef.current;
      if (!setValue2) return;
      if (state[key] === prev[key]) return;
      if (state[key] === value2) return;
      setValue2(state[key]);
    });
  }, [store3, key]);
  useSafeLayoutEffect(() => {
    if (value === void 0) return;
    store3.setState(key, value);
    return batch(store3, [key], () => {
      if (value === void 0) return;
      store3.setState(key, value);
    });
  });
}
function useStore(createStore2, props) {
  const [store3, setStore] = React7.useState(() => createStore2(props));
  useSafeLayoutEffect(() => init(store3), [store3]);
  const useState210 = React7.useCallback(
    (keyOrSelector) => useStoreState(store3, keyOrSelector),
    [store3]
  );
  const memoizedStore = React7.useMemo(
    () => ({ ...store3, useState: useState210 }),
    [store3, useState210]
  );
  const updateStore = useEvent(() => {
    setStore((store22) => createStore2({ ...props, ...store22.getState() }));
  });
  return [memoizedStore, updateStore];
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/WZWDIE3S.js
var import_react11 = __toESM(require_react(), 1);
var import_jsx_runtime52 = __toESM(require_jsx_runtime(), 1);
var TagName4 = "button";
function isEditableElement(element) {
  if (isTextbox(element)) return true;
  return element.tagName === "INPUT" && !isButton(element);
}
function getNextPageOffset(scrollingElement, pageUp = false) {
  const height = scrollingElement.clientHeight;
  const { top } = scrollingElement.getBoundingClientRect();
  const pageSize = Math.max(height * 0.875, height - 40) * 1.5;
  const pageOffset = pageUp ? height - pageSize + top : pageSize + top;
  if (scrollingElement.tagName === "HTML") {
    return pageOffset + scrollingElement.scrollTop;
  }
  return pageOffset;
}
function getItemOffset(itemElement, pageUp = false) {
  const { top } = itemElement.getBoundingClientRect();
  if (pageUp) {
    return top + itemElement.clientHeight;
  }
  return top;
}
function findNextPageItemId(element, store3, next, pageUp = false) {
  var _a;
  if (!store3) return;
  if (!next) return;
  const { renderedItems } = store3.getState();
  const scrollingElement = getScrollingElement(element);
  if (!scrollingElement) return;
  const nextPageOffset = getNextPageOffset(scrollingElement, pageUp);
  let id;
  let prevDifference;
  for (let i2 = 0; i2 < renderedItems.length; i2 += 1) {
    const previousId = id;
    id = next(i2);
    if (!id) break;
    if (id === previousId) continue;
    const itemElement = (_a = getEnabledItem(store3, id)) == null ? void 0 : _a.element;
    if (!itemElement) continue;
    const itemOffset = getItemOffset(itemElement, pageUp);
    const difference = itemOffset - nextPageOffset;
    const absDifference = Math.abs(difference);
    if (pageUp && difference <= 0 || !pageUp && difference >= 0) {
      if (prevDifference !== void 0 && prevDifference < absDifference) {
        id = previousId;
      }
      break;
    }
    prevDifference = absDifference;
  }
  return id;
}
function targetIsAnotherItem(event, store3) {
  if (isSelfTarget(event)) return false;
  return isItem(store3, event.target);
}
var useCompositeItem = createHook(
  function useCompositeItem2({
    store: store3,
    rowId: rowIdProp,
    preventScrollOnKeyDown = false,
    moveOnKeyPress = true,
    tabbable = false,
    getItem: getItemProp,
    "aria-setsize": ariaSetSizeProp,
    "aria-posinset": ariaPosInSetProp,
    ...props
  }) {
    const context = useCompositeContext();
    store3 = store3 || context;
    const id = useId3(props.id);
    const ref = (0, import_react11.useRef)(null);
    const row = (0, import_react11.useContext)(CompositeRowContext);
    const disabled2 = disabledFromProps(props);
    const trulyDisabled = disabled2 && !props.accessibleWhenDisabled;
    const {
      rowId,
      baseElement,
      isActiveItem,
      ariaSetSize,
      ariaPosInSet,
      isTabbable
    } = useStoreStateObject(store3, {
      rowId(state) {
        if (rowIdProp) return rowIdProp;
        if (!state) return;
        if (!(row == null ? void 0 : row.baseElement)) return;
        if (row.baseElement !== state.baseElement) return;
        return row.id;
      },
      baseElement(state) {
        return (state == null ? void 0 : state.baseElement) || void 0;
      },
      isActiveItem(state) {
        return !!state && state.activeId === id;
      },
      ariaSetSize(state) {
        if (ariaSetSizeProp != null) return ariaSetSizeProp;
        if (!state) return;
        if (!(row == null ? void 0 : row.ariaSetSize)) return;
        if (row.baseElement !== state.baseElement) return;
        return row.ariaSetSize;
      },
      ariaPosInSet(state) {
        if (ariaPosInSetProp != null) return ariaPosInSetProp;
        if (!state) return;
        if (!(row == null ? void 0 : row.ariaPosInSet)) return;
        if (row.baseElement !== state.baseElement) return;
        const itemsInRow = state.renderedItems.filter(
          (item) => item.rowId === rowId
        );
        return row.ariaPosInSet + itemsInRow.findIndex((item) => item.id === id);
      },
      isTabbable(state) {
        if (!(state == null ? void 0 : state.renderedItems.length)) return true;
        if (state.virtualFocus) return false;
        if (tabbable) return true;
        if (state.activeId === null) return false;
        const item = store3 == null ? void 0 : store3.item(state.activeId);
        if (item == null ? void 0 : item.disabled) return true;
        if (!(item == null ? void 0 : item.element)) return true;
        return state.activeId === id;
      }
    });
    const getItem = (0, import_react11.useCallback)(
      (item) => {
        var _a;
        const nextItem = {
          ...item,
          id: id || item.id,
          rowId,
          disabled: !!trulyDisabled,
          children: (_a = item.element) == null ? void 0 : _a.textContent
        };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, rowId, trulyDisabled, getItemProp]
    );
    const onFocusProp = props.onFocus;
    const hasFocusedComposite = (0, import_react11.useRef)(false);
    const onFocus = useEvent((event) => {
      onFocusProp == null ? void 0 : onFocusProp(event);
      if (event.defaultPrevented) return;
      if (isPortalEvent(event)) return;
      if (!id) return;
      if (!store3) return;
      if (targetIsAnotherItem(event, store3)) return;
      const { virtualFocus, baseElement: baseElement2 } = store3.getState();
      store3.setActiveId(id);
      if (isTextbox(event.currentTarget)) {
        selectTextField(event.currentTarget);
      }
      if (!virtualFocus) return;
      if (!isSelfTarget(event)) return;
      if (isEditableElement(event.currentTarget)) return;
      if (!(baseElement2 == null ? void 0 : baseElement2.isConnected)) return;
      if (isSafari() && event.currentTarget.hasAttribute("data-autofocus")) {
        event.currentTarget.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        });
      }
      hasFocusedComposite.current = true;
      const fromComposite = event.relatedTarget === baseElement2 || isItem(store3, event.relatedTarget);
      if (fromComposite) {
        focusSilently(baseElement2);
      } else {
        baseElement2.focus();
      }
    });
    const onBlurCaptureProp = props.onBlurCapture;
    const onBlurCapture = useEvent((event) => {
      onBlurCaptureProp == null ? void 0 : onBlurCaptureProp(event);
      if (event.defaultPrevented) return;
      const state = store3 == null ? void 0 : store3.getState();
      if ((state == null ? void 0 : state.virtualFocus) && hasFocusedComposite.current) {
        hasFocusedComposite.current = false;
        event.preventDefault();
        event.stopPropagation();
      }
    });
    const onKeyDownProp = props.onKeyDown;
    const preventScrollOnKeyDownProp = useBooleanEvent(preventScrollOnKeyDown);
    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (event.defaultPrevented) return;
      if (!isSelfTarget(event)) return;
      if (!store3) return;
      const { currentTarget } = event;
      const state = store3.getState();
      const item = store3.item(id);
      const isGrid2 = !!(item == null ? void 0 : item.rowId);
      const isVertical = state.orientation !== "horizontal";
      const isHorizontal = state.orientation !== "vertical";
      const canHomeEnd = () => {
        if (isGrid2) return true;
        if (isHorizontal) return true;
        if (!state.baseElement) return true;
        if (!isTextField(state.baseElement)) return true;
        return false;
      };
      const keyMap = {
        ArrowUp: (isGrid2 || isVertical) && store3.up,
        ArrowRight: (isGrid2 || isHorizontal) && store3.next,
        ArrowDown: (isGrid2 || isVertical) && store3.down,
        ArrowLeft: (isGrid2 || isHorizontal) && store3.previous,
        Home: () => {
          if (!canHomeEnd()) return;
          if (!isGrid2 || event.ctrlKey) {
            return store3 == null ? void 0 : store3.first();
          }
          return store3 == null ? void 0 : store3.previous(-1);
        },
        End: () => {
          if (!canHomeEnd()) return;
          if (!isGrid2 || event.ctrlKey) {
            return store3 == null ? void 0 : store3.last();
          }
          return store3 == null ? void 0 : store3.next(-1);
        },
        PageUp: () => {
          return findNextPageItemId(currentTarget, store3, store3 == null ? void 0 : store3.up, true);
        },
        PageDown: () => {
          return findNextPageItemId(currentTarget, store3, store3 == null ? void 0 : store3.down);
        }
      };
      const action = keyMap[event.key];
      if (action) {
        if (isTextbox(currentTarget)) {
          const selection = getTextboxSelection(currentTarget);
          const isLeft = isHorizontal && event.key === "ArrowLeft";
          const isRight = isHorizontal && event.key === "ArrowRight";
          const isUp = isVertical && event.key === "ArrowUp";
          const isDown = isVertical && event.key === "ArrowDown";
          if (isRight || isDown) {
            const { length: valueLength } = getTextboxValue(currentTarget);
            if (selection.end !== valueLength) return;
          } else if ((isLeft || isUp) && selection.start !== 0) return;
        }
        const nextId = action();
        if (preventScrollOnKeyDownProp(event) || nextId !== void 0) {
          if (!moveOnKeyPressProp(event)) return;
          event.preventDefault();
          store3.move(nextId);
        }
      }
    });
    const providerValue = (0, import_react11.useMemo)(
      () => ({ id, baseElement }),
      [id, baseElement]
    );
    props = useWrapElement(
      props,
      (element) => /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(CompositeItemContext.Provider, { value: providerValue, children: element }),
      [providerValue]
    );
    props = {
      id,
      "data-active-item": isActiveItem || void 0,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      tabIndex: isTabbable ? props.tabIndex : -1,
      onFocus,
      onBlurCapture,
      onKeyDown
    };
    props = useCommand(props);
    props = useCollectionItem({
      store: store3,
      ...props,
      getItem,
      shouldRegisterItem: id ? props.shouldRegisterItem : false
    });
    return removeUndefinedValues({
      ...props,
      "aria-setsize": ariaSetSize,
      "aria-posinset": ariaPosInSet
    });
  }
);
var CompositeItem = memo22(
  forwardRef22(function CompositeItem2(props) {
    const htmlProps = useCompositeItem(props);
    return createElement3(TagName4, htmlProps);
  })
);

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/7PRQYBBV.js
function toArray(arg) {
  if (Array.isArray(arg)) {
    return arg;
  }
  return typeof arg !== "undefined" ? [arg] : [];
}
function flatten2DArray(array) {
  const flattened = [];
  for (const row of array) {
    flattened.push(...row);
  }
  return flattened;
}
function reverseArray(array) {
  return array.slice().reverse();
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/ZMWF7ASR.js
var import_react12 = __toESM(require_react(), 1);
var import_jsx_runtime53 = __toESM(require_jsx_runtime(), 1);
var TagName5 = "div";
function isGrid(items) {
  return items.some((item) => !!item.rowId);
}
function isPrintableKey(event) {
  const target = event.target;
  if (target && !isTextField(target)) return false;
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey;
}
function isModifierKey(event) {
  return event.key === "Shift" || event.key === "Control" || event.key === "Alt" || event.key === "Meta";
}
function useKeyboardEventProxy(store3, onKeyboardEvent, previousElementRef) {
  return useEvent((event) => {
    var _a;
    onKeyboardEvent == null ? void 0 : onKeyboardEvent(event);
    if (event.defaultPrevented) return;
    if (event.isPropagationStopped()) return;
    if (!isSelfTarget(event)) return;
    if (isModifierKey(event)) return;
    if (isPrintableKey(event)) return;
    const state = store3.getState();
    const activeElement2 = (_a = getEnabledItem(store3, state.activeId)) == null ? void 0 : _a.element;
    if (!activeElement2) return;
    const { view, ...eventInit } = event;
    const previousElement = previousElementRef == null ? void 0 : previousElementRef.current;
    if (activeElement2 !== previousElement) {
      activeElement2.focus();
    }
    if (!fireKeyboardEvent(activeElement2, event.type, eventInit)) {
      event.preventDefault();
    }
    if (event.currentTarget.contains(activeElement2)) {
      event.stopPropagation();
    }
  });
}
function findFirstEnabledItemInTheLastRow(items) {
  return findFirstEnabledItem(
    flatten2DArray(reverseArray(groupItemsByRows(items)))
  );
}
function useScheduleFocus(store3) {
  const [scheduled, setScheduled] = (0, import_react12.useState)(false);
  const schedule = (0, import_react12.useCallback)(() => setScheduled(true), []);
  const activeItem = store3.useState(
    (state) => getEnabledItem(store3, state.activeId)
  );
  (0, import_react12.useEffect)(() => {
    const activeElement2 = activeItem == null ? void 0 : activeItem.element;
    if (!scheduled) return;
    if (!activeElement2) return;
    setScheduled(false);
    activeElement2.focus({ preventScroll: true });
  }, [activeItem, scheduled]);
  return schedule;
}
var useComposite = createHook(
  function useComposite2({
    store: store3,
    composite = true,
    focusOnMove = composite,
    moveOnKeyPress = true,
    ...props
  }) {
    const context = useCompositeProviderContext();
    store3 = store3 || context;
    invariant(
      store3,
      "Composite must receive a `store` prop or be wrapped in a CompositeProvider component."
    );
    const ref = (0, import_react12.useRef)(null);
    const previousElementRef = (0, import_react12.useRef)(null);
    const scheduleFocus = useScheduleFocus(store3);
    const moves = store3.useState("moves");
    const [, setBaseElement] = useTransactionState(
      composite ? store3.setBaseElement : null
    );
    (0, import_react12.useEffect)(() => {
      var _a;
      if (!store3) return;
      if (!moves) return;
      if (!composite) return;
      if (!focusOnMove) return;
      const { activeId: activeId2 } = store3.getState();
      const itemElement = (_a = getEnabledItem(store3, activeId2)) == null ? void 0 : _a.element;
      if (!itemElement) return;
      focusIntoView(itemElement);
    }, [store3, moves, composite, focusOnMove]);
    useSafeLayoutEffect(() => {
      if (!store3) return;
      if (!moves) return;
      if (!composite) return;
      const { baseElement, activeId: activeId2 } = store3.getState();
      const isSelfAcive = activeId2 === null;
      if (!isSelfAcive) return;
      if (!baseElement) return;
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      if (previousElement) {
        fireBlurEvent(previousElement, { relatedTarget: baseElement });
      }
      if (!hasFocus(baseElement)) {
        baseElement.focus();
      }
    }, [store3, moves, composite]);
    const activeId = store3.useState("activeId");
    const virtualFocus = store3.useState("virtualFocus");
    useSafeLayoutEffect(() => {
      var _a;
      if (!store3) return;
      if (!composite) return;
      if (!virtualFocus) return;
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      if (!previousElement) return;
      const activeElement2 = (_a = getEnabledItem(store3, activeId)) == null ? void 0 : _a.element;
      const relatedTarget = activeElement2 || getActiveElement(previousElement);
      if (relatedTarget === previousElement) return;
      fireBlurEvent(previousElement, { relatedTarget });
    }, [store3, activeId, virtualFocus, composite]);
    const onKeyDownCapture = useKeyboardEventProxy(
      store3,
      props.onKeyDownCapture,
      previousElementRef
    );
    const onKeyUpCapture = useKeyboardEventProxy(
      store3,
      props.onKeyUpCapture,
      previousElementRef
    );
    const onFocusCaptureProp = props.onFocusCapture;
    const onFocusCapture = useEvent((event) => {
      onFocusCaptureProp == null ? void 0 : onFocusCaptureProp(event);
      if (event.defaultPrevented) return;
      if (!store3) return;
      const { virtualFocus: virtualFocus2 } = store3.getState();
      if (!virtualFocus2) return;
      const previousActiveElement = event.relatedTarget;
      const isSilentlyFocused = silentlyFocused(event.currentTarget);
      if (isSelfTarget(event) && isSilentlyFocused) {
        event.stopPropagation();
        previousElementRef.current = previousActiveElement;
      }
    });
    const onFocusProp = props.onFocus;
    const onFocus = useEvent((event) => {
      onFocusProp == null ? void 0 : onFocusProp(event);
      if (event.defaultPrevented) return;
      if (!composite) return;
      if (!store3) return;
      const { relatedTarget } = event;
      const { virtualFocus: virtualFocus2 } = store3.getState();
      if (virtualFocus2) {
        if (isSelfTarget(event) && !isItem(store3, relatedTarget)) {
          queueMicrotask(scheduleFocus);
        }
      } else if (isSelfTarget(event)) {
        store3.setActiveId(null);
      }
    });
    const onBlurCaptureProp = props.onBlurCapture;
    const onBlurCapture = useEvent((event) => {
      var _a;
      onBlurCaptureProp == null ? void 0 : onBlurCaptureProp(event);
      if (event.defaultPrevented) return;
      if (!store3) return;
      const { virtualFocus: virtualFocus2, activeId: activeId2 } = store3.getState();
      if (!virtualFocus2) return;
      const activeElement2 = (_a = getEnabledItem(store3, activeId2)) == null ? void 0 : _a.element;
      const nextActiveElement = event.relatedTarget;
      const nextActiveElementIsItem = isItem(store3, nextActiveElement);
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      if (isSelfTarget(event) && nextActiveElementIsItem) {
        if (nextActiveElement === activeElement2) {
          if (previousElement && previousElement !== nextActiveElement) {
            fireBlurEvent(previousElement, event);
          }
        } else if (activeElement2) {
          fireBlurEvent(activeElement2, event);
        } else if (previousElement) {
          fireBlurEvent(previousElement, event);
        }
        event.stopPropagation();
      } else {
        const targetIsItem = isItem(store3, event.target);
        if (!targetIsItem && activeElement2) {
          fireBlurEvent(activeElement2, event);
        }
      }
    });
    const onKeyDownProp = props.onKeyDown;
    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);
    const onKeyDown = useEvent((event) => {
      var _a;
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (event.nativeEvent.isComposing) return;
      if (event.defaultPrevented) return;
      if (!store3) return;
      if (!isSelfTarget(event)) return;
      const { orientation, renderedItems, activeId: activeId2 } = store3.getState();
      const activeItem = getEnabledItem(store3, activeId2);
      if ((_a = activeItem == null ? void 0 : activeItem.element) == null ? void 0 : _a.isConnected) return;
      const isVertical = orientation !== "horizontal";
      const isHorizontal = orientation !== "vertical";
      const grid = isGrid(renderedItems);
      const isHorizontalKey = event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End";
      if (isHorizontalKey && isTextField(event.currentTarget)) return;
      const up = () => {
        if (grid) {
          const item = findFirstEnabledItemInTheLastRow(renderedItems);
          return item == null ? void 0 : item.id;
        }
        return store3 == null ? void 0 : store3.last();
      };
      const keyMap = {
        ArrowUp: (grid || isVertical) && up,
        ArrowRight: (grid || isHorizontal) && store3.first,
        ArrowDown: (grid || isVertical) && store3.first,
        ArrowLeft: (grid || isHorizontal) && store3.last,
        Home: store3.first,
        End: store3.last,
        PageUp: store3.first,
        PageDown: store3.last
      };
      const action = keyMap[event.key];
      if (action) {
        const id = action();
        if (id !== void 0) {
          if (!moveOnKeyPressProp(event)) return;
          event.preventDefault();
          store3.move(id);
        }
      }
    });
    props = useWrapElement(
      props,
      (element) => /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(CompositeContextProvider, { value: store3, children: element }),
      [store3]
    );
    const activeDescendant = store3.useState((state) => {
      var _a;
      if (!store3) return;
      if (!composite) return;
      if (!state.virtualFocus) return;
      return (_a = getEnabledItem(store3, state.activeId)) == null ? void 0 : _a.id;
    });
    props = {
      "aria-activedescendant": activeDescendant,
      ...props,
      ref: useMergeRefs(ref, setBaseElement, props.ref),
      onKeyDownCapture,
      onKeyUpCapture,
      onFocusCapture,
      onFocus,
      onBlurCapture,
      onKeyDown
    };
    const focusable = store3.useState(
      (state) => composite && (state.virtualFocus || state.activeId === null)
    );
    props = useFocusable({ focusable, ...props });
    return props;
  }
);
var Composite5 = forwardRef22(function Composite22(props) {
  const htmlProps = useComposite(props);
  return createElement3(TagName5, htmlProps);
});

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/LVDQFHCH.js
var ctx3 = createStoreContext();
var useDisclosureContext = ctx3.useContext;
var useDisclosureScopedContext = ctx3.useScopedContext;
var useDisclosureProviderContext = ctx3.useProviderContext;
var DisclosureContextProvider = ctx3.ContextProvider;
var DisclosureScopedContextProvider = ctx3.ScopedContextProvider;

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/A62MDFCW.js
var import_react13 = __toESM(require_react(), 1);
var ctx4 = createStoreContext(
  [DisclosureContextProvider],
  [DisclosureScopedContextProvider]
);
var useDialogContext = ctx4.useContext;
var useDialogScopedContext = ctx4.useScopedContext;
var useDialogProviderContext = ctx4.useProviderContext;
var DialogContextProvider = ctx4.ContextProvider;
var DialogScopedContextProvider = ctx4.ScopedContextProvider;
var DialogHeadingContext = (0, import_react13.createContext)(void 0);
var DialogDescriptionContext = (0, import_react13.createContext)(void 0);

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/6B3RXHKP.js
var import_react14 = __toESM(require_react(), 1);
var import_react_dom = __toESM(require_react_dom(), 1);
var import_jsx_runtime54 = __toESM(require_jsx_runtime(), 1);
var TagName6 = "div";
function afterTimeout(timeoutMs, cb) {
  const timeoutId = setTimeout(cb, timeoutMs);
  return () => clearTimeout(timeoutId);
}
function afterPaint2(cb) {
  let raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(cb);
  });
  return () => cancelAnimationFrame(raf);
}
function parseCSSTime(...times) {
  return times.join(", ").split(", ").reduce((longestTime, currentTimeString) => {
    const multiplier = currentTimeString.endsWith("ms") ? 1 : 1e3;
    const currentTime = Number.parseFloat(currentTimeString || "0s") * multiplier;
    if (currentTime > longestTime) return currentTime;
    return longestTime;
  }, 0);
}
function isHidden(mounted, hidden, alwaysVisible) {
  return !alwaysVisible && hidden !== false && (!mounted || !!hidden);
}
var useDisclosureContent = createHook(function useDisclosureContent2({ store: store3, alwaysVisible, ...props }) {
  const context = useDisclosureProviderContext();
  store3 = store3 || context;
  invariant(
    store3,
    "DisclosureContent must receive a `store` prop or be wrapped in a DisclosureProvider component."
  );
  const ref = (0, import_react14.useRef)(null);
  const id = useId3(props.id);
  const [transition, setTransition] = (0, import_react14.useState)(null);
  const open = store3.useState("open");
  const mounted = store3.useState("mounted");
  const animated = store3.useState("animated");
  const contentElement = store3.useState("contentElement");
  const otherElement = useStoreState(store3.disclosure, "contentElement");
  useSafeLayoutEffect(() => {
    if (!ref.current) return;
    store3 == null ? void 0 : store3.setContentElement(ref.current);
  }, [store3]);
  useSafeLayoutEffect(() => {
    let previousAnimated;
    store3 == null ? void 0 : store3.setState("animated", (animated2) => {
      previousAnimated = animated2;
      return true;
    });
    return () => {
      if (previousAnimated === void 0) return;
      store3 == null ? void 0 : store3.setState("animated", previousAnimated);
    };
  }, [store3]);
  useSafeLayoutEffect(() => {
    if (!animated) return;
    if (!(contentElement == null ? void 0 : contentElement.isConnected)) {
      setTransition(null);
      return;
    }
    return afterPaint2(() => {
      setTransition(open ? "enter" : mounted ? "leave" : null);
    });
  }, [animated, contentElement, open, mounted]);
  useSafeLayoutEffect(() => {
    if (!store3) return;
    if (!animated) return;
    if (!transition) return;
    if (!contentElement) return;
    const stopAnimation = () => store3 == null ? void 0 : store3.setState("animating", false);
    const stopAnimationSync = () => (0, import_react_dom.flushSync)(stopAnimation);
    if (transition === "leave" && open) return;
    if (transition === "enter" && !open) return;
    if (typeof animated === "number") {
      const timeout2 = animated;
      return afterTimeout(timeout2, stopAnimationSync);
    }
    const {
      transitionDuration,
      animationDuration,
      transitionDelay,
      animationDelay
    } = getComputedStyle(contentElement);
    const {
      transitionDuration: transitionDuration2 = "0",
      animationDuration: animationDuration2 = "0",
      transitionDelay: transitionDelay2 = "0",
      animationDelay: animationDelay2 = "0"
    } = otherElement ? getComputedStyle(otherElement) : {};
    const delay = parseCSSTime(
      transitionDelay,
      animationDelay,
      transitionDelay2,
      animationDelay2
    );
    const duration = parseCSSTime(
      transitionDuration,
      animationDuration,
      transitionDuration2,
      animationDuration2
    );
    const timeout = delay + duration;
    if (!timeout) {
      if (transition === "enter") {
        store3.setState("animated", false);
      }
      stopAnimation();
      return;
    }
    const frameRate = 1e3 / 60;
    const maxTimeout = Math.max(timeout - frameRate, 0);
    return afterTimeout(maxTimeout, stopAnimationSync);
  }, [store3, animated, contentElement, otherElement, open, transition]);
  props = useWrapElement(
    props,
    (element) => /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(DialogScopedContextProvider, { value: store3, children: element }),
    [store3]
  );
  const hidden = isHidden(mounted, props.hidden, alwaysVisible);
  const styleProp = props.style;
  const style = (0, import_react14.useMemo)(() => {
    if (hidden) {
      return { ...styleProp, display: "none" };
    }
    return styleProp;
  }, [hidden, styleProp]);
  props = {
    id,
    "data-open": open || void 0,
    "data-enter": transition === "enter" || void 0,
    "data-leave": transition === "leave" || void 0,
    hidden,
    ...props,
    ref: useMergeRefs(id ? store3.setContentElement : null, ref, props.ref),
    style
  };
  return removeUndefinedValues(props);
});
var DisclosureContentImpl = forwardRef22(function DisclosureContentImpl2(props) {
  const htmlProps = useDisclosureContent(props);
  return createElement3(TagName6, htmlProps);
});
var DisclosureContent = forwardRef22(function DisclosureContent2({
  unmountOnHide,
  ...props
}) {
  const context = useDisclosureProviderContext();
  const store3 = props.store || context;
  const mounted = useStoreState(
    store3,
    (state) => !unmountOnHide || (state == null ? void 0 : state.mounted)
  );
  if (mounted === false) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(DisclosureContentImpl, { ...props });
});

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/75BJEVSH.js
function createDisclosureStore(props = {}) {
  const store3 = mergeStore(
    props.store,
    omit2(props.disclosure, ["contentElement", "disclosureElement"])
  );
  throwOnConflictingProps(props, store3);
  const syncState = store3 == null ? void 0 : store3.getState();
  const open = defaultValue(
    props.open,
    syncState == null ? void 0 : syncState.open,
    props.defaultOpen,
    false
  );
  const animated = defaultValue(props.animated, syncState == null ? void 0 : syncState.animated, false);
  const initialState = {
    open,
    animated,
    animating: !!animated && open,
    mounted: open,
    contentElement: defaultValue(syncState == null ? void 0 : syncState.contentElement, null),
    disclosureElement: defaultValue(syncState == null ? void 0 : syncState.disclosureElement, null)
  };
  const disclosure = createStore(initialState, store3);
  setup(
    disclosure,
    () => sync(disclosure, ["animated", "animating"], (state) => {
      if (state.animated) return;
      disclosure.setState("animating", false);
    })
  );
  setup(
    disclosure,
    () => subscribe(disclosure, ["open"], () => {
      if (!disclosure.getState().animated) return;
      disclosure.setState("animating", true);
    })
  );
  setup(
    disclosure,
    () => sync(disclosure, ["open", "animating"], (state) => {
      disclosure.setState("mounted", state.open || state.animating);
    })
  );
  return {
    ...disclosure,
    disclosure: props.disclosure,
    setOpen: (value) => disclosure.setState("open", value),
    show: () => disclosure.setState("open", true),
    hide: () => disclosure.setState("open", false),
    toggle: () => disclosure.setState("open", (open2) => !open2),
    stopAnimation: () => disclosure.setState("animating", false),
    setContentElement: (value) => disclosure.setState("contentElement", value),
    setDisclosureElement: (value) => disclosure.setState("disclosureElement", value)
  };
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/WLZ6H5FH.js
function useDisclosureStoreProps(store3, update3, props) {
  useUpdateEffect(update3, [props.store, props.disclosure]);
  useStoreProps(store3, props, "open", "setOpen");
  useStoreProps(store3, props, "mounted", "setMounted");
  useStoreProps(store3, props, "animated");
  return Object.assign(store3, { disclosure: props.disclosure });
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/JMU4N4M5.js
var ctx5 = createStoreContext(
  [DialogContextProvider],
  [DialogScopedContextProvider]
);
var usePopoverContext = ctx5.useContext;
var usePopoverScopedContext = ctx5.useScopedContext;
var usePopoverProviderContext = ctx5.useProviderContext;
var PopoverContextProvider = ctx5.ContextProvider;
var PopoverScopedContextProvider = ctx5.ScopedContextProvider;

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/N5XGANPW.js
function getCommonParent(items) {
  var _a;
  const firstItem = items.find((item) => !!item.element);
  const lastItem = [...items].reverse().find((item) => !!item.element);
  let parentElement = (_a = firstItem == null ? void 0 : firstItem.element) == null ? void 0 : _a.parentElement;
  while (parentElement && (lastItem == null ? void 0 : lastItem.element)) {
    const parent = parentElement;
    if (lastItem && parent.contains(lastItem.element)) {
      return parentElement;
    }
    parentElement = parentElement.parentElement;
  }
  return getDocument(parentElement).body;
}
function getPrivateStore(store3) {
  return store3 == null ? void 0 : store3.__unstablePrivateStore;
}
function createCollectionStore(props = {}) {
  var _a;
  throwOnConflictingProps(props, props.store);
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  const items = defaultValue(
    props.items,
    syncState == null ? void 0 : syncState.items,
    props.defaultItems,
    []
  );
  const itemsMap = new Map(items.map((item) => [item.id, item]));
  const initialState = {
    items,
    renderedItems: defaultValue(syncState == null ? void 0 : syncState.renderedItems, [])
  };
  const syncPrivateStore = getPrivateStore(props.store);
  const privateStore = createStore(
    { items, renderedItems: initialState.renderedItems },
    syncPrivateStore
  );
  const collection = createStore(initialState, props.store);
  const sortItems = (renderedItems) => {
    const sortedItems = sortBasedOnDOMPosition(renderedItems, (i2) => i2.element);
    privateStore.setState("renderedItems", sortedItems);
    collection.setState("renderedItems", sortedItems);
  };
  setup(collection, () => init(privateStore));
  setup(privateStore, () => {
    return batch(privateStore, ["items"], (state) => {
      collection.setState("items", state.items);
    });
  });
  setup(privateStore, () => {
    return batch(privateStore, ["renderedItems"], (state) => {
      let firstRun = true;
      let raf = requestAnimationFrame(() => {
        const { renderedItems } = collection.getState();
        if (state.renderedItems === renderedItems) return;
        sortItems(state.renderedItems);
      });
      if (typeof IntersectionObserver !== "function") {
        return () => cancelAnimationFrame(raf);
      }
      const ioCallback = () => {
        if (firstRun) {
          firstRun = false;
          return;
        }
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => sortItems(state.renderedItems));
      };
      const root = getCommonParent(state.renderedItems);
      const observer = new IntersectionObserver(ioCallback, { root });
      for (const item of state.renderedItems) {
        if (!item.element) continue;
        observer.observe(item.element);
      }
      return () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
      };
    });
  });
  const mergeItem = (item, setItems, canDeleteFromMap = false) => {
    let prevItem;
    setItems((items2) => {
      const index = items2.findIndex(({ id }) => id === item.id);
      const nextItems = items2.slice();
      if (index !== -1) {
        prevItem = items2[index];
        const nextItem = { ...prevItem, ...item };
        nextItems[index] = nextItem;
        itemsMap.set(item.id, nextItem);
      } else {
        nextItems.push(item);
        itemsMap.set(item.id, item);
      }
      return nextItems;
    });
    const unmergeItem = () => {
      setItems((items2) => {
        if (!prevItem) {
          if (canDeleteFromMap) {
            itemsMap.delete(item.id);
          }
          return items2.filter(({ id }) => id !== item.id);
        }
        const index = items2.findIndex(({ id }) => id === item.id);
        if (index === -1) return items2;
        const nextItems = items2.slice();
        nextItems[index] = prevItem;
        itemsMap.set(item.id, prevItem);
        return nextItems;
      });
    };
    return unmergeItem;
  };
  const registerItem = (item) => mergeItem(
    item,
    (getItems) => privateStore.setState("items", getItems),
    true
  );
  return {
    ...collection,
    registerItem,
    renderItem: (item) => chain(
      registerItem(item),
      mergeItem(
        item,
        (getItems) => privateStore.setState("renderedItems", getItems)
      )
    ),
    item: (id) => {
      if (!id) return null;
      let item = itemsMap.get(id);
      if (!item) {
        const { items: items2 } = privateStore.getState();
        item = items2.find((item2) => item2.id === id);
        if (item) {
          itemsMap.set(id, item);
        }
      }
      return item || null;
    },
    // @ts-expect-error Internal
    __unstablePrivateStore: privateStore
  };
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/GVAFFF2B.js
function useCollectionStoreProps(store3, update3, props) {
  useUpdateEffect(update3, [props.store]);
  useStoreProps(store3, props, "items", "setItems");
  return store3;
}

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/RVTIKFRL.js
var NULL_ITEM = { id: null };
function findFirstEnabledItem2(items, excludeId) {
  return items.find((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}
function getEnabledItems(items, excludeId) {
  return items.filter((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}
function getItemsInRow(items, rowId) {
  return items.filter((item) => item.rowId === rowId);
}
function flipItems(items, activeId, shouldInsertNullItem = false) {
  const index = items.findIndex((item) => item.id === activeId);
  return [
    ...items.slice(index + 1),
    ...shouldInsertNullItem ? [NULL_ITEM] : [],
    ...items.slice(0, index)
  ];
}
function groupItemsByRows2(items) {
  const rows = [];
  for (const item of items) {
    const row = rows.find((currentRow) => {
      var _a;
      return ((_a = currentRow[0]) == null ? void 0 : _a.rowId) === item.rowId;
    });
    if (row) {
      row.push(item);
    } else {
      rows.push([item]);
    }
  }
  return rows;
}
function getMaxRowLength(array) {
  let maxLength = 0;
  for (const { length } of array) {
    if (length > maxLength) {
      maxLength = length;
    }
  }
  return maxLength;
}
function createEmptyItem(rowId) {
  return {
    id: "__EMPTY_ITEM__",
    disabled: true,
    rowId
  };
}
function normalizeRows(rows, activeId, focusShift) {
  const maxLength = getMaxRowLength(rows);
  for (const row of rows) {
    for (let i2 = 0; i2 < maxLength; i2 += 1) {
      const item = row[i2];
      if (!item || focusShift && item.disabled) {
        const isFirst = i2 === 0;
        const previousItem = isFirst && focusShift ? findFirstEnabledItem2(row) : row[i2 - 1];
        row[i2] = previousItem && activeId !== previousItem.id && focusShift ? previousItem : createEmptyItem(previousItem == null ? void 0 : previousItem.rowId);
      }
    }
  }
  return rows;
}
function verticalizeItems(items) {
  const rows = groupItemsByRows2(items);
  const maxLength = getMaxRowLength(rows);
  const verticalized = [];
  for (let i2 = 0; i2 < maxLength; i2 += 1) {
    for (const row of rows) {
      const item = row[i2];
      if (item) {
        verticalized.push({
          ...item,
          // If there's no rowId, it means that it's not a grid composite, but
          // a single row instead. So, instead of verticalizing it, that is,
          // assigning a different rowId based on the column index, we keep it
          // undefined so they will be part of the same row. This is useful
          // when using up/down on one-dimensional composites.
          rowId: item.rowId ? `${i2}` : void 0
        });
      }
    }
  }
  return verticalized;
}
function createCompositeStore(props = {}) {
  var _a;
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  const collection = createCollectionStore(props);
  const activeId = defaultValue(
    props.activeId,
    syncState == null ? void 0 : syncState.activeId,
    props.defaultActiveId
  );
  const initialState = {
    ...collection.getState(),
    id: defaultValue(
      props.id,
      syncState == null ? void 0 : syncState.id,
      `id-${Math.random().toString(36).slice(2, 8)}`
    ),
    activeId,
    baseElement: defaultValue(syncState == null ? void 0 : syncState.baseElement, null),
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState == null ? void 0 : syncState.includesBaseElement,
      activeId === null
    ),
    moves: defaultValue(syncState == null ? void 0 : syncState.moves, 0),
    orientation: defaultValue(
      props.orientation,
      syncState == null ? void 0 : syncState.orientation,
      "both"
    ),
    rtl: defaultValue(props.rtl, syncState == null ? void 0 : syncState.rtl, false),
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState == null ? void 0 : syncState.virtualFocus,
      false
    ),
    focusLoop: defaultValue(props.focusLoop, syncState == null ? void 0 : syncState.focusLoop, false),
    focusWrap: defaultValue(props.focusWrap, syncState == null ? void 0 : syncState.focusWrap, false),
    focusShift: defaultValue(props.focusShift, syncState == null ? void 0 : syncState.focusShift, false)
  };
  const composite = createStore(initialState, collection, props.store);
  setup(
    composite,
    () => sync(composite, ["renderedItems", "activeId"], (state) => {
      composite.setState("activeId", (activeId2) => {
        var _a2;
        if (activeId2 !== void 0) return activeId2;
        return (_a2 = findFirstEnabledItem2(state.renderedItems)) == null ? void 0 : _a2.id;
      });
    })
  );
  const getNextId = (direction = "next", options = {}) => {
    var _a2, _b;
    const defaultState = composite.getState();
    const {
      skip = 0,
      activeId: activeId2 = defaultState.activeId,
      focusShift = defaultState.focusShift,
      focusLoop = defaultState.focusLoop,
      focusWrap = defaultState.focusWrap,
      includesBaseElement = defaultState.includesBaseElement,
      renderedItems = defaultState.renderedItems,
      rtl = defaultState.rtl
    } = options;
    const isVerticalDirection = direction === "up" || direction === "down";
    const isNextDirection = direction === "next" || direction === "down";
    const canReverse = isNextDirection ? rtl && !isVerticalDirection : !rtl || isVerticalDirection;
    const canShift = focusShift && !skip;
    let items = !isVerticalDirection ? renderedItems : flatten2DArray(
      normalizeRows(groupItemsByRows2(renderedItems), activeId2, canShift)
    );
    items = canReverse ? reverseArray(items) : items;
    items = isVerticalDirection ? verticalizeItems(items) : items;
    if (activeId2 == null) {
      return (_a2 = findFirstEnabledItem2(items)) == null ? void 0 : _a2.id;
    }
    const activeItem = items.find((item) => item.id === activeId2);
    if (!activeItem) {
      return (_b = findFirstEnabledItem2(items)) == null ? void 0 : _b.id;
    }
    const isGrid2 = items.some((item) => item.rowId);
    const activeIndex = items.indexOf(activeItem);
    const nextItems = items.slice(activeIndex + 1);
    const nextItemsInRow = getItemsInRow(nextItems, activeItem.rowId);
    if (skip) {
      const nextEnabledItemsInRow = getEnabledItems(nextItemsInRow, activeId2);
      const nextItem2 = nextEnabledItemsInRow.slice(skip)[0] || // If we can't find an item, just return the last one.
      nextEnabledItemsInRow[nextEnabledItemsInRow.length - 1];
      return nextItem2 == null ? void 0 : nextItem2.id;
    }
    const canLoop = focusLoop && (isVerticalDirection ? focusLoop !== "horizontal" : focusLoop !== "vertical");
    const canWrap = isGrid2 && focusWrap && (isVerticalDirection ? focusWrap !== "horizontal" : focusWrap !== "vertical");
    const hasNullItem = isNextDirection ? (!isGrid2 || isVerticalDirection) && canLoop && includesBaseElement : isVerticalDirection ? includesBaseElement : false;
    if (canLoop) {
      const loopItems = canWrap && !hasNullItem ? items : getItemsInRow(items, activeItem.rowId);
      const sortedItems = flipItems(loopItems, activeId2, hasNullItem);
      const nextItem2 = findFirstEnabledItem2(sortedItems, activeId2);
      return nextItem2 == null ? void 0 : nextItem2.id;
    }
    if (canWrap) {
      const nextItem2 = findFirstEnabledItem2(
        // We can use nextItems, which contains all the next items, including
        // items from other rows, to wrap between rows. However, if there is a
        // null item (the composite container), we'll only use the next items in
        // the row. So moving next from the last item will focus on the
        // composite container. On grid composites, horizontal navigation never
        // focuses on the composite container, only vertical.
        hasNullItem ? nextItemsInRow : nextItems,
        activeId2
      );
      const nextId = hasNullItem ? (nextItem2 == null ? void 0 : nextItem2.id) || null : nextItem2 == null ? void 0 : nextItem2.id;
      return nextId;
    }
    const nextItem = findFirstEnabledItem2(nextItemsInRow, activeId2);
    if (!nextItem && hasNullItem) {
      return null;
    }
    return nextItem == null ? void 0 : nextItem.id;
  };
  return {
    ...collection,
    ...composite,
    setBaseElement: (element) => composite.setState("baseElement", element),
    setActiveId: (id) => composite.setState("activeId", id),
    move: (id) => {
      if (id === void 0) return;
      composite.setState("activeId", id);
      composite.setState("moves", (moves) => moves + 1);
    },
    first: () => {
      var _a2;
      return (_a2 = findFirstEnabledItem2(composite.getState().renderedItems)) == null ? void 0 : _a2.id;
    },
    last: () => {
      var _a2;
      return (_a2 = findFirstEnabledItem2(reverseArray(composite.getState().renderedItems))) == null ? void 0 : _a2.id;
    },
    next: (options) => {
      if (options !== void 0 && typeof options === "number") {
        options = { skip: options };
      }
      return getNextId("next", options);
    },
    previous: (options) => {
      if (options !== void 0 && typeof options === "number") {
        options = { skip: options };
      }
      return getNextId("previous", options);
    },
    down: (options) => {
      if (options !== void 0 && typeof options === "number") {
        options = { skip: options };
      }
      return getNextId("down", options);
    },
    up: (options) => {
      if (options !== void 0 && typeof options === "number") {
        options = { skip: options };
      }
      return getNextId("up", options);
    }
  };
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/IQYAUKXT.js
function useCompositeStoreOptions(props) {
  const id = useId3(props.id);
  return { id, ...props };
}
function useCompositeStoreProps(store3, update3, props) {
  store3 = useCollectionStoreProps(store3, update3, props);
  useStoreProps(store3, props, "activeId", "setActiveId");
  useStoreProps(store3, props, "includesBaseElement");
  useStoreProps(store3, props, "virtualFocus");
  useStoreProps(store3, props, "orientation");
  useStoreProps(store3, props, "rtl");
  useStoreProps(store3, props, "focusLoop");
  useStoreProps(store3, props, "focusWrap");
  useStoreProps(store3, props, "focusShift");
  return store3;
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/CVCFNOHX.js
var import_react15 = __toESM(require_react(), 1);
var ComboboxListRoleContext = (0, import_react15.createContext)(
  void 0
);
var ctx6 = createStoreContext(
  [PopoverContextProvider, CompositeContextProvider],
  [PopoverScopedContextProvider, CompositeScopedContextProvider]
);
var useComboboxContext = ctx6.useContext;
var useComboboxScopedContext = ctx6.useScopedContext;
var useComboboxProviderContext = ctx6.useProviderContext;
var ComboboxContextProvider = ctx6.ContextProvider;
var ComboboxScopedContextProvider = ctx6.ScopedContextProvider;
var ComboboxItemValueContext = (0, import_react15.createContext)(
  void 0
);
var ComboboxItemCheckedContext = (0, import_react15.createContext)(false);

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/KMAUV3TY.js
function createDialogStore(props = {}) {
  return createDisclosureStore(props);
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/4NYSH4UO.js
function useDialogStoreProps(store3, update3, props) {
  return useDisclosureStoreProps(store3, update3, props);
}

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/__chunks/BFGNM53A.js
function createPopoverStore({
  popover: otherPopover,
  ...props
} = {}) {
  const store3 = mergeStore(
    props.store,
    omit2(otherPopover, [
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement"
    ])
  );
  throwOnConflictingProps(props, store3);
  const syncState = store3 == null ? void 0 : store3.getState();
  const dialog = createDialogStore({ ...props, store: store3 });
  const placement = defaultValue(
    props.placement,
    syncState == null ? void 0 : syncState.placement,
    "bottom"
  );
  const initialState = {
    ...dialog.getState(),
    placement,
    currentPlacement: placement,
    anchorElement: defaultValue(syncState == null ? void 0 : syncState.anchorElement, null),
    popoverElement: defaultValue(syncState == null ? void 0 : syncState.popoverElement, null),
    arrowElement: defaultValue(syncState == null ? void 0 : syncState.arrowElement, null),
    rendered: /* @__PURE__ */ Symbol("rendered")
  };
  const popover = createStore(initialState, dialog, store3);
  return {
    ...dialog,
    ...popover,
    setAnchorElement: (element) => popover.setState("anchorElement", element),
    setPopoverElement: (element) => popover.setState("popoverElement", element),
    setArrowElement: (element) => popover.setState("arrowElement", element),
    render: () => popover.setState("rendered", /* @__PURE__ */ Symbol("rendered"))
  };
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/B6FLPFJM.js
function usePopoverStoreProps(store3, update3, props) {
  useUpdateEffect(update3, [props.popover]);
  useStoreProps(store3, props, "placement");
  return useDialogStoreProps(store3, update3, props);
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/4POTBZ2J.js
var TagName7 = "div";
var usePopoverAnchor = createHook(
  function usePopoverAnchor2({ store: store3, ...props }) {
    const context = usePopoverProviderContext();
    store3 = store3 || context;
    props = {
      ...props,
      ref: useMergeRefs(store3 == null ? void 0 : store3.setAnchorElement, props.ref)
    };
    return props;
  }
);
var PopoverAnchor = forwardRef22(function PopoverAnchor2(props) {
  const htmlProps = usePopoverAnchor(props);
  return createElement3(TagName7, htmlProps);
});

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/X6LNAU2F.js
var import_react16 = __toESM(require_react(), 1);
var TagName8 = "div";
function getMouseDestination(event) {
  const relatedTarget = event.relatedTarget;
  if ((relatedTarget == null ? void 0 : relatedTarget.nodeType) === Node.ELEMENT_NODE) {
    return relatedTarget;
  }
  return null;
}
function hoveringInside(event) {
  const nextElement = getMouseDestination(event);
  if (!nextElement) return false;
  return contains(event.currentTarget, nextElement);
}
var symbol2 = /* @__PURE__ */ Symbol("composite-hover");
function movingToAnotherItem(event) {
  let dest = getMouseDestination(event);
  if (!dest) return false;
  do {
    if (hasOwnProperty(dest, symbol2) && dest[symbol2]) return true;
    dest = dest.parentElement;
  } while (dest);
  return false;
}
var useCompositeHover = createHook(
  function useCompositeHover2({
    store: store3,
    focusOnHover = true,
    blurOnHoverEnd = !!focusOnHover,
    ...props
  }) {
    const context = useCompositeContext();
    store3 = store3 || context;
    invariant(
      store3,
      "CompositeHover must be wrapped in a Composite component."
    );
    const isMouseMoving = useIsMouseMoving();
    const onMouseMoveProp = props.onMouseMove;
    const focusOnHoverProp = useBooleanEvent(focusOnHover);
    const onMouseMove = useEvent((event) => {
      onMouseMoveProp == null ? void 0 : onMouseMoveProp(event);
      if (event.defaultPrevented) return;
      if (!isMouseMoving()) return;
      if (!focusOnHoverProp(event)) return;
      if (!hasFocusWithin(event.currentTarget)) {
        const baseElement = store3 == null ? void 0 : store3.getState().baseElement;
        if (baseElement && !hasFocus(baseElement)) {
          baseElement.focus();
        }
      }
      store3 == null ? void 0 : store3.setActiveId(event.currentTarget.id);
    });
    const onMouseLeaveProp = props.onMouseLeave;
    const blurOnHoverEndProp = useBooleanEvent(blurOnHoverEnd);
    const onMouseLeave = useEvent((event) => {
      var _a;
      onMouseLeaveProp == null ? void 0 : onMouseLeaveProp(event);
      if (event.defaultPrevented) return;
      if (!isMouseMoving()) return;
      if (hoveringInside(event)) return;
      if (movingToAnotherItem(event)) return;
      if (!focusOnHoverProp(event)) return;
      if (!blurOnHoverEndProp(event)) return;
      store3 == null ? void 0 : store3.setActiveId(null);
      (_a = store3 == null ? void 0 : store3.getState().baseElement) == null ? void 0 : _a.focus();
    });
    const ref = (0, import_react16.useCallback)((element) => {
      if (!element) return;
      element[symbol2] = true;
    }, []);
    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onMouseMove,
      onMouseLeave
    };
    return removeUndefinedValues(props);
  }
);
var CompositeHover = memo22(
  forwardRef22(function CompositeHover2(props) {
    const htmlProps = useCompositeHover(props);
    return createElement3(TagName8, htmlProps);
  })
);

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/combobox/combobox.js
var import_react17 = __toESM(require_react(), 1);
var TagName9 = "input";
function isFirstItemAutoSelected(items, activeValue, autoSelect) {
  if (!autoSelect) return false;
  const firstItem = items.find((item) => !item.disabled && item.value);
  return (firstItem == null ? void 0 : firstItem.value) === activeValue;
}
function hasCompletionString(value, activeValue) {
  if (!activeValue) return false;
  if (value == null) return false;
  value = normalizeString(value);
  return activeValue.length > value.length && activeValue.toLowerCase().indexOf(value.toLowerCase()) === 0;
}
function isInputEvent(event) {
  return event.type === "input";
}
function isAriaAutoCompleteValue(value) {
  return value === "inline" || value === "list" || value === "both" || value === "none";
}
function getDefaultAutoSelectId(items) {
  const item = items.find((item2) => {
    var _a;
    if (item2.disabled) return false;
    return ((_a = item2.element) == null ? void 0 : _a.getAttribute("role")) !== "tab";
  });
  return item == null ? void 0 : item.id;
}
var useCombobox = createHook(
  function useCombobox2({
    store: store3,
    focusable = true,
    autoSelect: autoSelectProp = false,
    getAutoSelectId,
    setValueOnChange,
    showMinLength = 0,
    showOnChange,
    showOnMouseDown,
    showOnClick = showOnMouseDown,
    showOnKeyDown,
    showOnKeyPress = showOnKeyDown,
    blurActiveItemOnClick,
    setValueOnClick = true,
    moveOnKeyPress = true,
    autoComplete = "list",
    ...props
  }) {
    const context = useComboboxProviderContext();
    store3 = store3 || context;
    invariant(
      store3,
      "Combobox must receive a `store` prop or be wrapped in a ComboboxProvider component."
    );
    const ref = (0, import_react17.useRef)(null);
    const [valueUpdated, forceValueUpdate] = useForceUpdate();
    const canAutoSelectRef = (0, import_react17.useRef)(false);
    const composingRef = (0, import_react17.useRef)(false);
    const autoSelect = store3.useState(
      (state) => state.virtualFocus && autoSelectProp
    );
    const inline = autoComplete === "inline" || autoComplete === "both";
    const [canInline, setCanInline] = (0, import_react17.useState)(inline);
    useUpdateLayoutEffect(() => {
      if (!inline) return;
      setCanInline(true);
    }, [inline]);
    const storeValue = store3.useState("value");
    const prevSelectedValueRef = (0, import_react17.useRef)(void 0);
    (0, import_react17.useEffect)(() => {
      return sync(store3, ["selectedValue", "activeId"], (_, prev) => {
        prevSelectedValueRef.current = prev.selectedValue;
      });
    }, []);
    const inlineActiveValue = store3.useState((state) => {
      var _a;
      if (!inline) return;
      if (!canInline) return;
      if (state.activeValue && Array.isArray(state.selectedValue)) {
        if (state.selectedValue.includes(state.activeValue)) return;
        if ((_a = prevSelectedValueRef.current) == null ? void 0 : _a.includes(state.activeValue)) return;
      }
      return state.activeValue;
    });
    const items = store3.useState("renderedItems");
    const open = store3.useState("open");
    const contentElement = store3.useState("contentElement");
    const value = (0, import_react17.useMemo)(() => {
      if (!inline) return storeValue;
      if (!canInline) return storeValue;
      const firstItemAutoSelected = isFirstItemAutoSelected(
        items,
        inlineActiveValue,
        autoSelect
      );
      if (firstItemAutoSelected) {
        if (hasCompletionString(storeValue, inlineActiveValue)) {
          const slice = (inlineActiveValue == null ? void 0 : inlineActiveValue.slice(storeValue.length)) || "";
          return storeValue + slice;
        }
        return storeValue;
      }
      return inlineActiveValue || storeValue;
    }, [inline, canInline, items, inlineActiveValue, autoSelect, storeValue]);
    (0, import_react17.useEffect)(() => {
      const element = ref.current;
      if (!element) return;
      const onCompositeItemMove = () => setCanInline(true);
      element.addEventListener("combobox-item-move", onCompositeItemMove);
      return () => {
        element.removeEventListener("combobox-item-move", onCompositeItemMove);
      };
    }, []);
    (0, import_react17.useEffect)(() => {
      if (!inline) return;
      if (!canInline) return;
      if (!inlineActiveValue) return;
      const firstItemAutoSelected = isFirstItemAutoSelected(
        items,
        inlineActiveValue,
        autoSelect
      );
      if (!firstItemAutoSelected) return;
      if (!hasCompletionString(storeValue, inlineActiveValue)) return;
      let cleanup = noop;
      queueMicrotask(() => {
        const element = ref.current;
        if (!element) return;
        const { start: prevStart, end: prevEnd } = getTextboxSelection(element);
        const nextStart = storeValue.length;
        const nextEnd = inlineActiveValue.length;
        setSelectionRange(element, nextStart, nextEnd);
        cleanup = () => {
          if (!hasFocus(element)) return;
          const { start, end } = getTextboxSelection(element);
          if (start !== nextStart) return;
          if (end !== nextEnd) return;
          setSelectionRange(element, prevStart, prevEnd);
        };
      });
      return () => cleanup();
    }, [
      valueUpdated,
      inline,
      canInline,
      inlineActiveValue,
      items,
      autoSelect,
      storeValue
    ]);
    const scrollingElementRef = (0, import_react17.useRef)(null);
    const getAutoSelectIdProp = useEvent(getAutoSelectId);
    const autoSelectIdRef = (0, import_react17.useRef)(null);
    (0, import_react17.useEffect)(() => {
      if (!open) return;
      if (!contentElement) return;
      const scrollingElement = getScrollingElement(contentElement);
      if (!scrollingElement) return;
      scrollingElementRef.current = scrollingElement;
      const onUserScroll = () => {
        canAutoSelectRef.current = false;
      };
      const onScroll = () => {
        if (!store3) return;
        if (!canAutoSelectRef.current) return;
        const { activeId } = store3.getState();
        if (activeId === null) return;
        if (activeId === autoSelectIdRef.current) return;
        canAutoSelectRef.current = false;
      };
      const options = { passive: true, capture: true };
      scrollingElement.addEventListener("wheel", onUserScroll, options);
      scrollingElement.addEventListener("touchmove", onUserScroll, options);
      scrollingElement.addEventListener("scroll", onScroll, options);
      return () => {
        scrollingElement.removeEventListener("wheel", onUserScroll, true);
        scrollingElement.removeEventListener("touchmove", onUserScroll, true);
        scrollingElement.removeEventListener("scroll", onScroll, true);
      };
    }, [open, contentElement, store3]);
    useSafeLayoutEffect(() => {
      if (!storeValue) return;
      if (composingRef.current) return;
      canAutoSelectRef.current = true;
    }, [storeValue]);
    useSafeLayoutEffect(() => {
      if (autoSelect !== "always" && open) return;
      canAutoSelectRef.current = open;
    }, [autoSelect, open]);
    const resetValueOnSelect = store3.useState("resetValueOnSelect");
    useUpdateEffect(() => {
      var _a, _b;
      const canAutoSelect = canAutoSelectRef.current;
      if (!store3) return;
      if (!open) return;
      if (!canAutoSelect && !resetValueOnSelect) return;
      const { baseElement, contentElement: contentElement2, activeId } = store3.getState();
      if (baseElement && !hasFocus(baseElement)) return;
      if (contentElement2 == null ? void 0 : contentElement2.hasAttribute("data-placing")) {
        const observer = new MutationObserver(forceValueUpdate);
        observer.observe(contentElement2, { attributeFilter: ["data-placing"] });
        return () => observer.disconnect();
      }
      if (autoSelect && canAutoSelect) {
        const userAutoSelectId = getAutoSelectIdProp(items);
        const autoSelectId = userAutoSelectId !== void 0 ? userAutoSelectId : (_a = getDefaultAutoSelectId(items)) != null ? _a : store3.first();
        autoSelectIdRef.current = autoSelectId;
        store3.move(autoSelectId != null ? autoSelectId : null);
      } else {
        const element = (_b = store3.item(activeId || store3.first())) == null ? void 0 : _b.element;
        if (element && "scrollIntoView" in element) {
          element.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }
      return;
    }, [
      store3,
      open,
      valueUpdated,
      storeValue,
      autoSelect,
      resetValueOnSelect,
      getAutoSelectIdProp,
      items
    ]);
    (0, import_react17.useEffect)(() => {
      if (!inline) return;
      const combobox = ref.current;
      if (!combobox) return;
      const elements = [combobox, contentElement].filter(
        (value2) => !!value2
      );
      const onBlur2 = (event) => {
        if (elements.every((el) => isFocusEventOutside(event, el))) {
          store3 == null ? void 0 : store3.setValue(value);
        }
      };
      for (const element of elements) {
        element.addEventListener("focusout", onBlur2);
      }
      return () => {
        for (const element of elements) {
          element.removeEventListener("focusout", onBlur2);
        }
      };
    }, [inline, contentElement, store3, value]);
    const canShow = (event) => {
      const currentTarget = event.currentTarget;
      return currentTarget.value.length >= showMinLength;
    };
    const onChangeProp = props.onChange;
    const showOnChangeProp = useBooleanEvent(showOnChange != null ? showOnChange : canShow);
    const setValueOnChangeProp = useBooleanEvent(
      // If the combobox is combined with tags, the value will be set by the tag
      // input component.
      setValueOnChange != null ? setValueOnChange : !store3.tag
    );
    const onChange = useEvent((event) => {
      onChangeProp == null ? void 0 : onChangeProp(event);
      if (event.defaultPrevented) return;
      if (!store3) return;
      const currentTarget = event.currentTarget;
      const { value: value2, selectionStart, selectionEnd } = currentTarget;
      const nativeEvent = event.nativeEvent;
      canAutoSelectRef.current = true;
      if (isInputEvent(nativeEvent)) {
        if (nativeEvent.isComposing) {
          canAutoSelectRef.current = false;
          composingRef.current = true;
        }
        if (inline) {
          const textInserted = nativeEvent.inputType === "insertText" || nativeEvent.inputType === "insertCompositionText";
          const caretAtEnd = selectionStart === value2.length;
          setCanInline(textInserted && caretAtEnd);
        }
      }
      if (setValueOnChangeProp(event)) {
        const isSameValue = value2 === store3.getState().value;
        store3.setValue(value2);
        queueMicrotask(() => {
          setSelectionRange(currentTarget, selectionStart, selectionEnd);
        });
        if (inline && autoSelect && isSameValue) {
          forceValueUpdate();
        }
      }
      if (showOnChangeProp(event)) {
        store3.show();
      }
      if (!autoSelect || !canAutoSelectRef.current) {
        store3.setActiveId(null);
      }
    });
    const onCompositionEndProp = props.onCompositionEnd;
    const onCompositionEnd = useEvent((event) => {
      canAutoSelectRef.current = true;
      composingRef.current = false;
      onCompositionEndProp == null ? void 0 : onCompositionEndProp(event);
      if (event.defaultPrevented) return;
      if (!autoSelect) return;
      forceValueUpdate();
    });
    const onMouseDownProp = props.onMouseDown;
    const blurActiveItemOnClickProp = useBooleanEvent(
      blurActiveItemOnClick != null ? blurActiveItemOnClick : (() => !!(store3 == null ? void 0 : store3.getState().includesBaseElement))
    );
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const showOnClickProp = useBooleanEvent(showOnClick != null ? showOnClick : canShow);
    const onMouseDown = useEvent((event) => {
      onMouseDownProp == null ? void 0 : onMouseDownProp(event);
      if (event.defaultPrevented) return;
      if (event.button) return;
      if (event.ctrlKey) return;
      if (!store3) return;
      if (blurActiveItemOnClickProp(event)) {
        store3.setActiveId(null);
      }
      if (setValueOnClickProp(event)) {
        store3.setValue(value);
      }
      if (showOnClickProp(event)) {
        queueBeforeEvent(event.currentTarget, "mouseup", store3.show);
      }
    });
    const onKeyDownProp = props.onKeyDown;
    const showOnKeyPressProp = useBooleanEvent(showOnKeyPress != null ? showOnKeyPress : canShow);
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (!event.repeat) {
        canAutoSelectRef.current = false;
      }
      if (event.defaultPrevented) return;
      if (event.ctrlKey) return;
      if (event.altKey) return;
      if (event.shiftKey) return;
      if (event.metaKey) return;
      if (!store3) return;
      const { open: open2 } = store3.getState();
      if (open2) return;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (showOnKeyPressProp(event)) {
          event.preventDefault();
          store3.show();
        }
      }
    });
    const onBlurProp = props.onBlur;
    const onBlur = useEvent((event) => {
      canAutoSelectRef.current = false;
      onBlurProp == null ? void 0 : onBlurProp(event);
      if (event.defaultPrevented) return;
    });
    const id = useId3(props.id);
    const ariaAutoComplete = isAriaAutoCompleteValue(autoComplete) ? autoComplete : void 0;
    const isActiveItem = store3.useState((state) => state.activeId === null);
    props = {
      id,
      role: "combobox",
      "aria-autocomplete": ariaAutoComplete,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      "aria-expanded": open,
      "aria-controls": contentElement == null ? void 0 : contentElement.id,
      "data-active-item": isActiveItem || void 0,
      value,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onChange,
      onCompositionEnd,
      onMouseDown,
      onKeyDown,
      onBlur
    };
    props = useComposite({
      store: store3,
      focusable,
      ...props,
      // Enable inline autocomplete when the user moves from the combobox input
      // to an item.
      moveOnKeyPress: (event) => {
        if (isFalsyBooleanCallback(moveOnKeyPress, event)) return false;
        if (inline) setCanInline(true);
        return true;
      }
    });
    props = usePopoverAnchor({ store: store3, ...props });
    return { autoComplete: "off", ...props };
  }
);
var Combobox = forwardRef22(function Combobox2(props) {
  const htmlProps = useCombobox(props);
  return createElement3(TagName9, htmlProps);
});

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/IBXZ2LQC.js
var import_react18 = __toESM(require_react(), 1);
var import_jsx_runtime55 = __toESM(require_jsx_runtime(), 1);
var TagName10 = "div";
function isSelected(storeValue, itemValue) {
  if (itemValue == null) return;
  if (storeValue == null) return false;
  if (Array.isArray(storeValue)) {
    return storeValue.includes(itemValue);
  }
  return storeValue === itemValue;
}
function getItemRole(popupRole) {
  var _a;
  const itemRoleByPopupRole = {
    menu: "menuitem",
    listbox: "option",
    tree: "treeitem"
  };
  const key = popupRole;
  return (_a = itemRoleByPopupRole[key]) != null ? _a : "option";
}
var useComboboxItem = createHook(
  function useComboboxItem2({
    store: store3,
    value,
    hideOnClick,
    setValueOnClick,
    selectValueOnClick = true,
    resetValueOnSelect,
    focusOnHover = false,
    moveOnKeyPress = true,
    getItem: getItemProp,
    ...props
  }) {
    var _a;
    const context = useComboboxScopedContext();
    store3 = store3 || context;
    invariant(
      store3,
      "ComboboxItem must be wrapped in a ComboboxList or ComboboxPopover component."
    );
    const { resetValueOnSelectState, multiSelectable, selected } = useStoreStateObject(store3, {
      resetValueOnSelectState: "resetValueOnSelect",
      multiSelectable(state) {
        return Array.isArray(state.selectedValue);
      },
      selected(state) {
        return isSelected(state.selectedValue, value);
      }
    });
    const getItem = (0, import_react18.useCallback)(
      (item) => {
        const nextItem = { ...item, value };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [value, getItemProp]
    );
    setValueOnClick = setValueOnClick != null ? setValueOnClick : !multiSelectable;
    hideOnClick = hideOnClick != null ? hideOnClick : value != null && !multiSelectable;
    const onClickProp = props.onClick;
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const selectValueOnClickProp = useBooleanEvent(selectValueOnClick);
    const resetValueOnSelectProp = useBooleanEvent(
      (_a = resetValueOnSelect != null ? resetValueOnSelect : resetValueOnSelectState) != null ? _a : multiSelectable
    );
    const hideOnClickProp = useBooleanEvent(hideOnClick);
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented) return;
      if (isDownloading(event)) return;
      if (isOpeningInNewTab(event)) return;
      if (value != null) {
        if (selectValueOnClickProp(event)) {
          if (resetValueOnSelectProp(event)) {
            store3 == null ? void 0 : store3.resetValue();
          }
          store3 == null ? void 0 : store3.setSelectedValue((prevValue) => {
            if (!Array.isArray(prevValue)) return value;
            if (prevValue.includes(value)) {
              return prevValue.filter((v2) => v2 !== value);
            }
            return [...prevValue, value];
          });
        }
        if (setValueOnClickProp(event)) {
          store3 == null ? void 0 : store3.setValue(value);
        }
      }
      if (hideOnClickProp(event)) {
        store3 == null ? void 0 : store3.hide();
      }
    });
    const onKeyDownProp = props.onKeyDown;
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (event.defaultPrevented) return;
      const baseElement = store3 == null ? void 0 : store3.getState().baseElement;
      if (!baseElement) return;
      if (hasFocus(baseElement)) return;
      const printable = event.key.length === 1;
      if (printable || event.key === "Backspace" || event.key === "Delete") {
        queueMicrotask(() => baseElement.focus());
        if (isTextField(baseElement)) {
          store3 == null ? void 0 : store3.setValue(baseElement.value);
        }
      }
    });
    if (multiSelectable && selected != null) {
      props = {
        "aria-selected": selected,
        ...props
      };
    }
    props = useWrapElement(
      props,
      (element) => /* @__PURE__ */ (0, import_jsx_runtime55.jsx)(ComboboxItemValueContext.Provider, { value, children: /* @__PURE__ */ (0, import_jsx_runtime55.jsx)(ComboboxItemCheckedContext.Provider, { value: selected != null ? selected : false, children: element }) }),
      [value, selected]
    );
    const popupRole = (0, import_react18.useContext)(ComboboxListRoleContext);
    props = {
      role: getItemRole(popupRole),
      children: value,
      ...props,
      onClick,
      onKeyDown
    };
    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);
    props = useCompositeItem({
      store: store3,
      ...props,
      getItem,
      // Dispatch a custom event on the combobox input when moving to an item
      // with the keyboard so the Combobox component can enable inline
      // autocompletion.
      moveOnKeyPress: (event) => {
        if (!moveOnKeyPressProp(event)) return false;
        const moveEvent = new Event("combobox-item-move");
        const baseElement = store3 == null ? void 0 : store3.getState().baseElement;
        baseElement == null ? void 0 : baseElement.dispatchEvent(moveEvent);
        return true;
      }
    });
    props = useCompositeHover({ store: store3, focusOnHover, ...props });
    return props;
  }
);
var ComboboxItem = memo22(
  forwardRef22(function ComboboxItem2(props) {
    const htmlProps = useComboboxItem(props);
    return createElement3(TagName10, htmlProps);
  })
);

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/combobox/combobox-item-value.js
var import_react19 = __toESM(require_react(), 1);
var import_jsx_runtime56 = __toESM(require_jsx_runtime(), 1);
var TagName11 = "span";
function normalizeValue(value) {
  return normalizeString(value).toLowerCase();
}
function getOffsets(string, values) {
  const offsets = [];
  for (const value of values) {
    let pos = 0;
    const length = value.length;
    while (string.indexOf(value, pos) !== -1) {
      const index = string.indexOf(value, pos);
      if (index !== -1) {
        offsets.push([index, length]);
      }
      pos = index + 1;
    }
  }
  return offsets;
}
function filterOverlappingOffsets(offsets) {
  return offsets.filter(([offset, length], i2, arr) => {
    return !arr.some(
      ([o2, l2], j2) => j2 !== i2 && o2 <= offset && o2 + l2 >= offset + length
    );
  });
}
function sortOffsets(offsets) {
  return offsets.sort(([a2], [b2]) => a2 - b2);
}
function splitValue(itemValue, userValue) {
  if (!itemValue) return itemValue;
  if (!userValue) return itemValue;
  const userValues = toArray(userValue).filter(Boolean).map(normalizeValue);
  const parts = [];
  const span = (value, autocomplete = false) => /* @__PURE__ */ (0, import_jsx_runtime56.jsx)(
    "span",
    {
      "data-autocomplete-value": autocomplete ? "" : void 0,
      "data-user-value": autocomplete ? void 0 : "",
      children: value
    },
    parts.length
  );
  const offsets = sortOffsets(
    filterOverlappingOffsets(
      // Convert userValues into a set to avoid duplicates
      getOffsets(normalizeValue(itemValue), new Set(userValues))
    )
  );
  if (!offsets.length) {
    parts.push(span(itemValue, true));
    return parts;
  }
  const [firstOffset] = offsets[0];
  const values = [
    itemValue.slice(0, firstOffset),
    ...offsets.flatMap(([offset, length], i2) => {
      var _a;
      const value = itemValue.slice(offset, offset + length);
      const nextOffset = (_a = offsets[i2 + 1]) == null ? void 0 : _a[0];
      const nextValue = itemValue.slice(offset + length, nextOffset);
      return [value, nextValue];
    })
  ];
  values.forEach((value, i2) => {
    if (!value) return;
    parts.push(span(value, i2 % 2 === 0));
  });
  return parts;
}
var useComboboxItemValue = createHook(function useComboboxItemValue2({ store: store3, value, userValue, ...props }) {
  const context = useComboboxScopedContext();
  store3 = store3 || context;
  const itemContext = (0, import_react19.useContext)(ComboboxItemValueContext);
  const itemValue = value != null ? value : itemContext;
  const inputValue = useStoreState(store3, (state) => userValue != null ? userValue : state == null ? void 0 : state.value);
  const children = (0, import_react19.useMemo)(() => {
    if (!itemValue) return;
    if (!inputValue) return itemValue;
    return splitValue(itemValue, inputValue);
  }, [itemValue, inputValue]);
  props = {
    children,
    ...props
  };
  return removeUndefinedValues(props);
});
var ComboboxItemValue = forwardRef22(function ComboboxItemValue2(props) {
  const htmlProps = useComboboxItemValue(props);
  return createElement3(TagName11, htmlProps);
});

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/combobox/combobox-label.js
var TagName12 = "label";
var useComboboxLabel = createHook(
  function useComboboxLabel2({ store: store3, ...props }) {
    const context = useComboboxProviderContext();
    store3 = store3 || context;
    invariant(
      store3,
      "ComboboxLabel must receive a `store` prop or be wrapped in a ComboboxProvider component."
    );
    const comboboxId = store3.useState((state) => {
      var _a;
      return (_a = state.baseElement) == null ? void 0 : _a.id;
    });
    props = {
      htmlFor: comboboxId,
      ...props
    };
    return removeUndefinedValues(props);
  }
);
var ComboboxLabel = memo22(
  forwardRef22(function ComboboxLabel2(props) {
    const htmlProps = useComboboxLabel(props);
    return createElement3(TagName12, htmlProps);
  })
);

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/2G6YEJT4.js
var import_react20 = __toESM(require_react(), 1);
var import_jsx_runtime57 = __toESM(require_jsx_runtime(), 1);
var TagName13 = "div";
var useComboboxList = createHook(
  function useComboboxList2({ store: store3, alwaysVisible, ...props }) {
    const scopedContext = useComboboxScopedContext(true);
    const context = useComboboxContext();
    store3 = store3 || context;
    const scopedContextSameStore = !!store3 && store3 === scopedContext;
    invariant(
      store3,
      "ComboboxList must receive a `store` prop or be wrapped in a ComboboxProvider component."
    );
    const ref = (0, import_react20.useRef)(null);
    const id = useId3(props.id);
    const mounted = store3.useState("mounted");
    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? { ...props.style, display: "none" } : props.style;
    const multiSelectable = store3.useState(
      (state) => Array.isArray(state.selectedValue)
    );
    const role = useAttribute(ref, "role", props.role);
    const isCompositeRole = role === "listbox" || role === "tree" || role === "grid";
    const ariaMultiSelectable = isCompositeRole ? multiSelectable || void 0 : void 0;
    const [hasListboxInside, setHasListboxInside] = (0, import_react20.useState)(false);
    const contentElement = store3.useState("contentElement");
    useSafeLayoutEffect(() => {
      if (!mounted) return;
      const element = ref.current;
      if (!element) return;
      if (contentElement !== element) return;
      const callback = () => {
        setHasListboxInside(!!element.querySelector("[role='listbox']"));
      };
      const observer = new MutationObserver(callback);
      observer.observe(element, {
        subtree: true,
        childList: true,
        attributeFilter: ["role"]
      });
      callback();
      return () => observer.disconnect();
    }, [mounted, contentElement]);
    if (!hasListboxInside) {
      props = {
        role: "listbox",
        "aria-multiselectable": ariaMultiSelectable,
        ...props
      };
    }
    props = useWrapElement(
      props,
      (element) => /* @__PURE__ */ (0, import_jsx_runtime57.jsx)(ComboboxScopedContextProvider, { value: store3, children: /* @__PURE__ */ (0, import_jsx_runtime57.jsx)(ComboboxListRoleContext.Provider, { value: role, children: element }) }),
      [store3, role]
    );
    const setContentElement = id && (!scopedContext || !scopedContextSameStore) ? store3.setContentElement : null;
    props = {
      id,
      hidden,
      ...props,
      ref: useMergeRefs(setContentElement, ref, props.ref),
      style
    };
    return removeUndefinedValues(props);
  }
);
var ComboboxList = forwardRef22(function ComboboxList2(props) {
  const htmlProps = useComboboxList(props);
  return createElement3(TagName13, htmlProps);
});

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/XSIEPKGA.js
var import_react21 = __toESM(require_react(), 1);
var TagValueContext = (0, import_react21.createContext)(null);
var TagRemoveIdContext = (0, import_react21.createContext)(
  null
);
var ctx7 = createStoreContext(
  [CompositeContextProvider],
  [CompositeScopedContextProvider]
);
var useTagContext = ctx7.useContext;
var useTagScopedContext = ctx7.useScopedContext;
var useTagProviderContext = ctx7.useProviderContext;
var TagContextProvider = ctx7.ContextProvider;
var TagScopedContextProvider = ctx7.ScopedContextProvider;

// ../../../node_modules/.pnpm/@ariakit+core@0.4.18/node_modules/@ariakit/core/esm/combobox/combobox-store.js
var isTouchSafari = isSafari() && isTouchDevice();
function createComboboxStore({
  tag,
  ...props
} = {}) {
  const store3 = mergeStore(props.store, pick2(tag, ["value", "rtl"]));
  throwOnConflictingProps(props, store3);
  const tagState = tag == null ? void 0 : tag.getState();
  const syncState = store3 == null ? void 0 : store3.getState();
  const activeId = defaultValue(
    props.activeId,
    syncState == null ? void 0 : syncState.activeId,
    props.defaultActiveId,
    null
  );
  const composite = createCompositeStore({
    ...props,
    activeId,
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState == null ? void 0 : syncState.includesBaseElement,
      true
    ),
    orientation: defaultValue(
      props.orientation,
      syncState == null ? void 0 : syncState.orientation,
      "vertical"
    ),
    focusLoop: defaultValue(props.focusLoop, syncState == null ? void 0 : syncState.focusLoop, true),
    focusWrap: defaultValue(props.focusWrap, syncState == null ? void 0 : syncState.focusWrap, true),
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState == null ? void 0 : syncState.virtualFocus,
      true
    )
  });
  const popover = createPopoverStore({
    ...props,
    placement: defaultValue(
      props.placement,
      syncState == null ? void 0 : syncState.placement,
      "bottom-start"
    )
  });
  const value = defaultValue(
    props.value,
    syncState == null ? void 0 : syncState.value,
    props.defaultValue,
    ""
  );
  const selectedValue = defaultValue(
    props.selectedValue,
    syncState == null ? void 0 : syncState.selectedValue,
    tagState == null ? void 0 : tagState.values,
    props.defaultSelectedValue,
    ""
  );
  const multiSelectable = Array.isArray(selectedValue);
  const initialState = {
    ...composite.getState(),
    ...popover.getState(),
    value,
    selectedValue,
    resetValueOnSelect: defaultValue(
      props.resetValueOnSelect,
      syncState == null ? void 0 : syncState.resetValueOnSelect,
      multiSelectable
    ),
    resetValueOnHide: defaultValue(
      props.resetValueOnHide,
      syncState == null ? void 0 : syncState.resetValueOnHide,
      multiSelectable && !tag
    ),
    activeValue: syncState == null ? void 0 : syncState.activeValue
  };
  const combobox = createStore(initialState, composite, popover, store3);
  if (isTouchSafari) {
    setup(
      combobox,
      () => sync(combobox, ["virtualFocus"], () => {
        combobox.setState("virtualFocus", false);
      })
    );
  }
  setup(combobox, () => {
    if (!tag) return;
    return chain(
      sync(combobox, ["selectedValue"], (state) => {
        if (!Array.isArray(state.selectedValue)) return;
        tag.setValues(state.selectedValue);
      }),
      sync(tag, ["values"], (state) => {
        combobox.setState("selectedValue", state.values);
      })
    );
  });
  setup(
    combobox,
    () => sync(combobox, ["resetValueOnHide", "mounted"], (state) => {
      if (!state.resetValueOnHide) return;
      if (state.mounted) return;
      combobox.setState("value", value);
    })
  );
  setup(
    combobox,
    () => sync(combobox, ["open"], (state) => {
      if (state.open) return;
      combobox.setState("activeId", activeId);
      combobox.setState("moves", 0);
    })
  );
  setup(
    combobox,
    () => sync(combobox, ["moves", "activeId"], (state, prevState) => {
      if (state.moves === prevState.moves) {
        combobox.setState("activeValue", void 0);
      }
    })
  );
  setup(
    combobox,
    () => batch(combobox, ["moves", "renderedItems"], (state, prev) => {
      if (state.moves === prev.moves) return;
      const { activeId: activeId2 } = combobox.getState();
      const activeItem = composite.item(activeId2);
      combobox.setState("activeValue", activeItem == null ? void 0 : activeItem.value);
    })
  );
  return {
    ...popover,
    ...composite,
    ...combobox,
    tag,
    setValue: (value2) => combobox.setState("value", value2),
    resetValue: () => combobox.setState("value", initialState.value),
    setSelectedValue: (selectedValue2) => combobox.setState("selectedValue", selectedValue2)
  };
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/__chunks/SVN33SY6.js
function useComboboxStoreOptions(props) {
  const tag = useTagContext();
  props = {
    ...props,
    tag: props.tag !== void 0 ? props.tag : tag
  };
  return useCompositeStoreOptions(props);
}
function useComboboxStoreProps(store3, update3, props) {
  useUpdateEffect(update3, [props.tag]);
  useStoreProps(store3, props, "value", "setValue");
  useStoreProps(store3, props, "selectedValue", "setSelectedValue");
  useStoreProps(store3, props, "resetValueOnHide");
  useStoreProps(store3, props, "resetValueOnSelect");
  return Object.assign(
    useCompositeStoreProps(
      usePopoverStoreProps(store3, update3, props),
      update3,
      props
    ),
    { tag: props.tag }
  );
}
function useComboboxStore(props = {}) {
  props = useComboboxStoreOptions(props);
  const [store3, update3] = useStore(createComboboxStore, props);
  return useComboboxStoreProps(store3, update3, props);
}

// ../../../node_modules/.pnpm/@ariakit+react-core@0.4.21_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@ariakit/react-core/esm/combobox/combobox-provider.js
var import_jsx_runtime58 = __toESM(require_jsx_runtime(), 1);
function ComboboxProvider(props = {}) {
  const store3 = useComboboxStore(props);
  return /* @__PURE__ */ (0, import_jsx_runtime58.jsx)(ComboboxContextProvider, { value: store3, children: props.children });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/search-widget.mjs
var import_remove_accents = __toESM(require_remove_accents(), 1);
var import_compose8 = __toESM(require_compose(), 1);
var import_i18n22 = __toESM(require_i18n(), 1);
var import_element24 = __toESM(require_element(), 1);
var import_components21 = __toESM(require_components(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/utils.mjs
var EMPTY_ARRAY3 = [];
var getCurrentValue = (filterDefinition, currentFilter) => {
  if (filterDefinition.singleSelection) {
    return currentFilter?.value;
  }
  if (Array.isArray(currentFilter?.value)) {
    return currentFilter.value;
  }
  if (!Array.isArray(currentFilter?.value) && !!currentFilter?.value) {
    return [currentFilter.value];
  }
  return EMPTY_ARRAY3;
};

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/hooks/use-elements.mjs
var import_element23 = __toESM(require_element(), 1);
var EMPTY_ARRAY4 = [];
function useElements({
  elements,
  getElements
}) {
  const staticElements = Array.isArray(elements) && elements.length > 0 ? elements : EMPTY_ARRAY4;
  const [records, setRecords] = (0, import_element23.useState)(staticElements);
  const [isLoading, setIsLoading] = (0, import_element23.useState)(false);
  (0, import_element23.useEffect)(() => {
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/search-widget.mjs
var import_jsx_runtime59 = __toESM(require_jsx_runtime(), 1);
function normalizeSearchInput(input = "") {
  return (0, import_remove_accents.default)(input.trim().toLowerCase());
}
var getNewValue = (filterDefinition, currentFilter, value) => {
  if (filterDefinition.singleSelection) {
    return value;
  }
  if (Array.isArray(currentFilter?.value)) {
    return currentFilter.value.includes(value) ? currentFilter.value.filter((v2) => v2 !== value) : [...currentFilter.value, value];
  }
  return [value];
};
function generateFilterElementCompositeItemId(prefix, filterElementValue) {
  return `${prefix}-${filterElementValue}`;
}
var MultiSelectionOption = ({ selected }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
    "span",
    {
      className: clsx_default(
        "dataviews-filters__search-widget-listitem-multi-selection",
        { "is-selected": selected }
      ),
      children: selected && /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(import_components21.Icon, { icon: check_default })
    }
  );
};
var SingleSelectionOption = ({ selected }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
    "span",
    {
      className: clsx_default(
        "dataviews-filters__search-widget-listitem-single-selection",
        { "is-selected": selected }
      )
    }
  );
};
function ListBox({ view, filter, onChangeView }) {
  const baseId = (0, import_compose8.useInstanceId)(ListBox, "dataviews-filter-list-box");
  const [activeCompositeId, setActiveCompositeId] = (0, import_element24.useState)(
    // When there are one or less operators, the first item is set as active
    // (by setting the initial `activeId` to `undefined`).
    // With 2 or more operators, the focus is moved on the operators control
    // (by setting the initial `activeId` to `null`), meaning that there won't
    // be an active item initially. Focus is then managed via the
    // `onFocusVisible` callback.
    filter.operators?.length === 1 ? void 0 : null
  );
  const currentFilter = view.filters?.find(
    (f2) => f2.field === filter.field
  );
  const currentValue = getCurrentValue(filter, currentFilter);
  return /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
    import_components21.Composite,
    {
      virtualFocus: true,
      focusLoop: true,
      activeId: activeCompositeId,
      setActiveId: setActiveCompositeId,
      role: "listbox",
      className: "dataviews-filters__search-widget-listbox",
      "aria-label": (0, import_i18n22.sprintf)(
        /* translators: List of items for a filter. 1: Filter name. e.g.: "List of: Author". */
        (0, import_i18n22.__)("List of: %1$s"),
        filter.name
      ),
      onFocusVisible: () => {
        if (!activeCompositeId && filter.elements.length) {
          setActiveCompositeId(
            generateFilterElementCompositeItemId(
              baseId,
              filter.elements[0].value
            )
          );
        }
      },
      render: /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(import_components21.Composite.Typeahead, {}),
      children: filter.elements.map((element) => /* @__PURE__ */ (0, import_jsx_runtime59.jsxs)(
        import_components21.Composite.Hover,
        {
          render: /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
            import_components21.Composite.Item,
            {
              id: generateFilterElementCompositeItemId(
                baseId,
                element.value
              ),
              render: /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
                "div",
                {
                  "aria-label": element.label,
                  role: "option",
                  className: "dataviews-filters__search-widget-listitem"
                }
              ),
              onClick: () => {
                const newFilters = currentFilter ? [
                  ...(view.filters ?? []).map(
                    (_filter) => {
                      if (_filter.field === filter.field) {
                        return {
                          ..._filter,
                          operator: currentFilter.operator || filter.operators[0],
                          value: getNewValue(
                            filter,
                            currentFilter,
                            element.value
                          )
                        };
                      }
                      return _filter;
                    }
                  )
                ] : [
                  ...view.filters ?? [],
                  {
                    field: filter.field,
                    operator: filter.operators[0],
                    value: getNewValue(
                      filter,
                      currentFilter,
                      element.value
                    )
                  }
                ];
                onChangeView({
                  ...view,
                  page: 1,
                  filters: newFilters
                });
              }
            }
          ),
          children: [
            filter.singleSelection && /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
              SingleSelectionOption,
              {
                selected: currentValue === element.value
              }
            ),
            !filter.singleSelection && /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
              MultiSelectionOption,
              {
                selected: currentValue.includes(element.value)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime59.jsx)("span", { children: element.label })
          ]
        },
        element.value
      ))
    }
  );
}
function ComboboxList22({ view, filter, onChangeView }) {
  const [searchValue, setSearchValue] = (0, import_element24.useState)("");
  const deferredSearchValue = (0, import_element24.useDeferredValue)(searchValue);
  const currentFilter = view.filters?.find(
    (_filter) => _filter.field === filter.field
  );
  const currentValue = getCurrentValue(filter, currentFilter);
  const matches = (0, import_element24.useMemo)(() => {
    const normalizedSearch = normalizeSearchInput(deferredSearchValue);
    return filter.elements.filter(
      (item) => normalizeSearchInput(item.label).includes(normalizedSearch)
    );
  }, [filter.elements, deferredSearchValue]);
  return /* @__PURE__ */ (0, import_jsx_runtime59.jsxs)(
    ComboboxProvider,
    {
      selectedValue: currentValue,
      setSelectedValue: (value) => {
        const newFilters = currentFilter ? [
          ...(view.filters ?? []).map((_filter) => {
            if (_filter.field === filter.field) {
              return {
                ..._filter,
                operator: currentFilter.operator || filter.operators[0],
                value
              };
            }
            return _filter;
          })
        ] : [
          ...view.filters ?? [],
          {
            field: filter.field,
            operator: filter.operators[0],
            value
          }
        ];
        onChangeView({
          ...view,
          page: 1,
          filters: newFilters
        });
      },
      setValue: setSearchValue,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime59.jsxs)("div", { className: "dataviews-filters__search-widget-filter-combobox__wrapper", children: [
          /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
            ComboboxLabel,
            {
              render: /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(import_components21.VisuallyHidden, { children: (0, import_i18n22.__)("Search items") }),
              children: (0, import_i18n22.__)("Search items")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
            Combobox,
            {
              autoSelect: "always",
              placeholder: (0, import_i18n22.__)("Search"),
              className: "dataviews-filters__search-widget-filter-combobox__input"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime59.jsx)("div", { className: "dataviews-filters__search-widget-filter-combobox__icon", children: /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(import_components21.Icon, { icon: search_default }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime59.jsxs)(
          ComboboxList,
          {
            className: "dataviews-filters__search-widget-filter-combobox-list",
            alwaysVisible: true,
            children: [
              matches.map((element) => {
                return /* @__PURE__ */ (0, import_jsx_runtime59.jsxs)(
                  ComboboxItem,
                  {
                    resetValueOnSelect: false,
                    value: element.value,
                    className: "dataviews-filters__search-widget-listitem",
                    hideOnClick: false,
                    setValueOnClick: false,
                    focusOnHover: true,
                    children: [
                      filter.singleSelection && /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
                        SingleSelectionOption,
                        {
                          selected: currentValue === element.value
                        }
                      ),
                      !filter.singleSelection && /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
                        MultiSelectionOption,
                        {
                          selected: currentValue.includes(
                            element.value
                          )
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime59.jsxs)("span", { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(
                          ComboboxItemValue,
                          {
                            className: "dataviews-filters__search-widget-filter-combobox-item-value",
                            value: element.label
                          }
                        ),
                        !!element.description && /* @__PURE__ */ (0, import_jsx_runtime59.jsx)("span", { className: "dataviews-filters__search-widget-listitem-description", children: element.description })
                      ] })
                    ]
                  },
                  element.value
                );
              }),
              !matches.length && /* @__PURE__ */ (0, import_jsx_runtime59.jsx)("p", { children: (0, import_i18n22.__)("No results found") })
            ]
          }
        )
      ]
    }
  );
}
function SearchWidget(props) {
  const { elements, isLoading } = useElements({
    elements: props.filter.elements,
    getElements: props.filter.getElements
  });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime59.jsx)("div", { className: "dataviews-filters__search-widget-no-elements", children: /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(import_components21.Spinner, {}) });
  }
  if (elements.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime59.jsx)("div", { className: "dataviews-filters__search-widget-no-elements", children: (0, import_i18n22.__)("No elements found") });
  }
  const Widget = elements.length > 10 ? ComboboxList22 : ListBox;
  return /* @__PURE__ */ (0, import_jsx_runtime59.jsx)(Widget, { ...props, filter: { ...props.filter, elements } });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/input-widget.mjs
var import_es6 = __toESM(require_es6(), 1);
var import_compose9 = __toESM(require_compose(), 1);
var import_element25 = __toESM(require_element(), 1);
var import_components22 = __toESM(require_components(), 1);
var import_jsx_runtime60 = __toESM(require_jsx_runtime(), 1);
function InputWidget({
  filter,
  view,
  onChangeView,
  fields
}) {
  const currentFilter = view.filters?.find(
    (f2) => f2.field === filter.field
  );
  const currentValue = getCurrentValue(filter, currentFilter);
  const field = (0, import_element25.useMemo)(() => {
    const currentField = fields.find((f2) => f2.id === filter.field);
    if (currentField) {
      return {
        ...currentField,
        // Deactivate validation for filters.
        isValid: {},
        // Configure getValue/setValue as if Item was a plain object.
        getValue: ({ item }) => item[currentField.id],
        setValue: ({ value }) => ({
          [currentField.id]: value
        })
      };
    }
    return currentField;
  }, [fields, filter.field]);
  const data = (0, import_element25.useMemo)(() => {
    return (view.filters ?? []).reduce(
      (acc, activeFilter) => {
        acc[activeFilter.field] = activeFilter.value;
        return acc;
      },
      {}
    );
  }, [view.filters]);
  const handleChange = (0, import_compose9.useEvent)((updatedData) => {
    if (!field || !currentFilter) {
      return;
    }
    const nextValue = field.getValue({ item: updatedData });
    if ((0, import_es6.default)(nextValue, currentValue)) {
      return;
    }
    onChangeView({
      ...view,
      filters: (view.filters ?? []).map(
        (_filter) => _filter.field === filter.field ? {
          ..._filter,
          operator: currentFilter.operator || filter.operators[0],
          // Consider empty strings as undefined:
          //
          // - undefined as value means the filter is unset: the filter widget displays no value and the search returns all records
          // - empty string as value means "search empty string": returns only the records that have an empty string as value
          //
          // In practice, this means the filter will not be able to find an empty string as the value.
          value: nextValue === "" ? void 0 : nextValue
        } : _filter
      )
    });
  });
  if (!field || !field.Edit || !currentFilter) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime60.jsx)(
    import_components22.Flex,
    {
      className: "dataviews-filters__user-input-widget",
      gap: 2.5,
      direction: "column",
      children: /* @__PURE__ */ (0, import_jsx_runtime60.jsx)(
        field.Edit,
        {
          hideLabelFromVision: true,
          data,
          field,
          operator: currentFilter.operator,
          onChange: handleChange
        }
      )
    }
  );
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/constants.js
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
var minTime = -maxTime;
var millisecondsInWeek = 6048e5;
var millisecondsInDay = 864e5;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;
var constructFromSymbol = /* @__PURE__ */ Symbol.for("constructDateFrom");

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/constructFrom.js
function constructFrom(date, value) {
  if (typeof date === "function") return date(value);
  if (date && typeof date === "object" && constructFromSymbol in date)
    return date[constructFromSymbol](value);
  if (date instanceof Date) return new date.constructor(value);
  return new Date(value);
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/toDate.js
function toDate(argument, context) {
  return constructFrom(context || argument, argument);
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/addDays.js
function addDays(date, amount, options) {
  const _date = toDate(date, options?.in);
  if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
  if (!amount) return _date;
  _date.setDate(_date.getDate() + amount);
  return _date;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/addMonths.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/_lib/defaultOptions.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/startOfWeek.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/startOfISOWeek.js
function startOfISOWeek(date, options) {
  return startOfWeek(date, { ...options, weekStartsOn: 1 });
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/getISOWeekYear.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/_lib/normalizeDates.js
function normalizeDates(context, ...dates) {
  const normalize = constructFrom.bind(
    null,
    context || dates.find((date) => typeof date === "object")
  );
  return dates.map(normalize);
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/startOfDay.js
function startOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/differenceInCalendarDays.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/startOfISOWeekYear.js
function startOfISOWeekYear(date, options) {
  const year = getISOWeekYear(date, options);
  const fourthOfJanuary = constructFrom(options?.in || date, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return startOfISOWeek(fourthOfJanuary);
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/addWeeks.js
function addWeeks(date, amount, options) {
  return addDays(date, amount * 7, options);
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/addYears.js
function addYears(date, amount, options) {
  return addMonths(date, amount * 12, options);
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/isDate.js
function isDate(value) {
  return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/isValid.js
function isValid(date) {
  return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/startOfMonth.js
function startOfMonth(date, options) {
  const _date = toDate(date, options?.in);
  _date.setDate(1);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/startOfYear.js
function startOfYear(date, options) {
  const date_ = toDate(date, options?.in);
  date_.setFullYear(date_.getFullYear(), 0, 1);
  date_.setHours(0, 0, 0, 0);
  return date_;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/en-US/_lib/formatDistance.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/_lib/buildFormatLongFn.js
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format6 = args.formats[width] || args.formats[args.defaultWidth];
    return format6;
  };
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/en-US/_lib/formatLong.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/en-US/_lib/formatRelative.js
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/_lib/buildLocalizeFn.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/en-US/_lib/localize.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/_lib/buildMatchFn.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/en-US/_lib/match.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/locale/en-US.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/getDayOfYear.js
function getDayOfYear(date, options) {
  const _date = toDate(date, options?.in);
  const diff = differenceInCalendarDays(_date, startOfYear(_date));
  const dayOfYear = diff + 1;
  return dayOfYear;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/getISOWeek.js
function getISOWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/getWeekYear.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/startOfWeekYear.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/getWeek.js
function getWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/_lib/addLeadingZeros.js
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/_lib/format/lightFormatters.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/_lib/format/formatters.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/_lib/format/longFormatters.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/_lib/protectedTokens.js
var dayOfYearTokenRE = /^D+$/;
var weekYearTokenRE = /^Y+$/;
var throwTokens = ["D", "DD", "YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return dayOfYearTokenRE.test(token);
}
function isProtectedWeekYearToken(token) {
  return weekYearTokenRE.test(token);
}
function warnOrThrowProtectedError(token, format6, input) {
  const _message = message(token, format6, input);
  console.warn(_message);
  if (throwTokens.includes(token)) throw new RangeError(_message);
}
function message(token, format6, input) {
  const subject = token[0] === "Y" ? "years" : "days of the month";
  return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format6}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/format.js
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

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/subDays.js
function subDays(date, amount, options) {
  return addDays(date, -amount, options);
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/subMonths.js
function subMonths(date, amount, options) {
  return addMonths(date, -amount, options);
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/subWeeks.js
function subWeeks(date, amount, options) {
  return addWeeks(date, -amount, options);
}

// ../../../node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/subYears.js
function subYears(date, amount, options) {
  return addYears(date, -amount, options);
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/utils/operators.mjs
var import_i18n23 = __toESM(require_i18n(), 1);
var import_element26 = __toESM(require_element(), 1);
var import_date = __toESM(require_date(), 1);
var import_jsx_runtime61 = __toESM(require_jsx_runtime(), 1);
var filterTextWrappers = {
  Name: /* @__PURE__ */ (0, import_jsx_runtime61.jsx)("span", { className: "dataviews-filters__summary-filter-text-name" }),
  Value: /* @__PURE__ */ (0, import_jsx_runtime61.jsx)("span", { className: "dataviews-filters__summary-filter-text-value" })
};
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
  label: (0, import_i18n23.__)("Is none of"),
  filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
    (0, import_i18n23.sprintf)(
      /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author is none of: Admin, Editor". */
      (0, import_i18n23.__)("<Name>%1$s is none of: </Name><Value>%2$s</Value>"),
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
    label: (0, import_i18n23.__)("Includes"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author is any: Admin, Editor". */
        (0, import_i18n23.__)("<Name>%1$s includes: </Name><Value>%2$s</Value>"),
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
    label: (0, import_i18n23.__)("Includes all"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author includes all: Admin, Editor". */
        (0, import_i18n23.__)("<Name>%1$s includes all: </Name><Value>%2$s</Value>"),
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
    label: (0, import_i18n23.__)("Between (inc)"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Item count"). 2: Filter value min. 3: Filter value max. e.g.: "Item count between (inc): 10 and 180". */
        (0, import_i18n23.__)(
          "<Name>%1$s between (inc): </Name><Value>%2$s and %3$s</Value>"
        ),
        filter.name,
        activeElements[0].label[0],
        activeElements[0].label[1]
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (!Array.isArray(filterValue) || filterValue.length !== 2 || filterValue[0] === void 0 || filterValue[1] === void 0) {
        return true;
      }
      const fieldValue = field.getValue({ item });
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
    label: (0, import_i18n23.__)("In the past"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "7 days"): "Date is in the past: 7 days". */
        (0, import_i18n23.__)(
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
      const fieldValue = (0, import_date.getDate)(field.getValue({ item }));
      return fieldValue >= targetDate && fieldValue <= /* @__PURE__ */ new Date();
    },
    selection: "custom"
  },
  {
    name: OPERATOR_OVER,
    /* translators: DataViews operator name */
    label: (0, import_i18n23.__)("Over"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "7 days"): "Date is over: 7 days". */
        (0, import_i18n23.__)("<Name>%1$s is over: </Name><Value>%2$s</Value>"),
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
      const fieldValue = (0, import_date.getDate)(field.getValue({ item }));
      return fieldValue < targetDate;
    },
    selection: "custom"
  },
  {
    name: OPERATOR_IS,
    /* translators: DataViews operator name */
    label: (0, import_i18n23.__)("Is"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author is: Admin". */
        (0, import_i18n23.__)("<Name>%1$s is: </Name><Value>%2$s</Value>"),
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
    label: (0, import_i18n23.__)("Is not"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Author"). 2: Filter value (e.g. "Admin"): "Author is not: Admin". */
        (0, import_i18n23.__)("<Name>%1$s is not: </Name><Value>%2$s</Value>"),
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
    label: (0, import_i18n23.__)("Less than"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Count"). 2: Filter value (e.g. "10"): "Count is less than: 10". */
        (0, import_i18n23.__)("<Name>%1$s is less than: </Name><Value>%2$s</Value>"),
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
    label: (0, import_i18n23.__)("Greater than"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Count"). 2: Filter value (e.g. "10"): "Count is greater than: 10". */
        (0, import_i18n23.__)(
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
    label: (0, import_i18n23.__)("Less than or equal"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Count"). 2: Filter value (e.g. "10"): "Count is less than or equal to: 10". */
        (0, import_i18n23.__)(
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
    label: (0, import_i18n23.__)("Greater than or equal"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Count"). 2: Filter value (e.g. "10"): "Count is greater than or equal to: 10". */
        (0, import_i18n23.__)(
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
    label: (0, import_i18n23.__)("Before"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is before: 2024-01-01". */
        (0, import_i18n23.__)("<Name>%1$s is before: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const filterDate = (0, import_date.getDate)(filterValue);
      const fieldDate = (0, import_date.getDate)(field.getValue({ item }));
      return fieldDate < filterDate;
    },
    selection: "single"
  },
  {
    name: OPERATOR_AFTER,
    /* translators: DataViews operator name */
    label: (0, import_i18n23.__)("After"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is after: 2024-01-01". */
        (0, import_i18n23.__)("<Name>%1$s is after: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const filterDate = (0, import_date.getDate)(filterValue);
      const fieldDate = (0, import_date.getDate)(field.getValue({ item }));
      return fieldDate > filterDate;
    },
    selection: "single"
  },
  {
    name: OPERATOR_BEFORE_INC,
    /* translators: DataViews operator name */
    label: (0, import_i18n23.__)("Before (inc)"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is on or before: 2024-01-01". */
        (0, import_i18n23.__)(
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
      const filterDate = (0, import_date.getDate)(filterValue);
      const fieldDate = (0, import_date.getDate)(field.getValue({ item }));
      return fieldDate <= filterDate;
    },
    selection: "single"
  },
  {
    name: OPERATOR_AFTER_INC,
    /* translators: DataViews operator name */
    label: (0, import_i18n23.__)("After (inc)"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is on or after: 2024-01-01". */
        (0, import_i18n23.__)(
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
      const filterDate = (0, import_date.getDate)(filterValue);
      const fieldDate = (0, import_date.getDate)(field.getValue({ item }));
      return fieldDate >= filterDate;
    },
    selection: "single"
  },
  {
    name: OPERATOR_CONTAINS,
    /* translators: DataViews operator name */
    label: (0, import_i18n23.__)("Contains"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Title"). 2: Filter value (e.g. "Hello"): "Title contains: Hello". */
        (0, import_i18n23.__)("<Name>%1$s contains: </Name><Value>%2$s</Value>"),
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
    label: (0, import_i18n23.__)("Doesn't contain"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Title"). 2: Filter value (e.g. "Hello"): "Title doesn't contain: Hello". */
        (0, import_i18n23.__)(
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
    label: (0, import_i18n23.__)("Starts with"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Title"). 2: Filter value (e.g. "Hello"): "Title starts with: Hello". */
        (0, import_i18n23.__)("<Name>%1$s starts with: </Name><Value>%2$s</Value>"),
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
    label: (0, import_i18n23.__)("On"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is: 2024-01-01". */
        (0, import_i18n23.__)("<Name>%1$s is: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const filterDate = (0, import_date.getDate)(filterValue);
      const fieldDate = (0, import_date.getDate)(field.getValue({ item }));
      return filterDate.getTime() === fieldDate.getTime();
    },
    selection: "single"
  },
  {
    name: OPERATOR_NOT_ON,
    /* translators: DataViews operator name */
    label: (0, import_i18n23.__)("Not on"),
    filterText: (filter, activeElements) => (0, import_element26.createInterpolateElement)(
      (0, import_i18n23.sprintf)(
        /* translators: 1: Filter name (e.g. "Date"). 2: Filter value (e.g. "2024-01-01"): "Date is not: 2024-01-01". */
        (0, import_i18n23.__)("<Name>%1$s is not: </Name><Value>%2$s</Value>"),
        filter.name,
        activeElements[0].label
      ),
      filterTextWrappers
    ),
    filter(item, field, filterValue) {
      if (filterValue === void 0) {
        return true;
      }
      const filterDate = (0, import_date.getDate)(filterValue);
      const fieldDate = (0, import_date.getDate)(field.getValue({ item }));
      return filterDate.getTime() !== fieldDate.getTime();
    },
    selection: "single"
  }
];
var getOperatorByName = (name) => OPERATORS.find((op) => op.name === name);
var getAllOperatorNames = () => OPERATORS.map((op) => op.name);
var isSingleSelectionOperator = (name) => OPERATORS.filter((op) => op.selection === "single").some(
  (op) => op.name === name
);
var isRegisteredOperator = (name) => OPERATORS.some((op) => op.name === name);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/filter.mjs
var import_jsx_runtime62 = __toESM(require_jsx_runtime(), 1);
var ENTER = "Enter";
var SPACE = " ";
var FilterText = ({
  activeElements,
  filterInView,
  filter
}) => {
  if (activeElements === void 0 || activeElements.length === 0) {
    return filter.name;
  }
  const operator = getOperatorByName(filterInView?.operator);
  if (operator !== void 0) {
    return operator.filterText(filter, activeElements);
  }
  return (0, import_i18n24.sprintf)(
    /* translators: 1: Filter name e.g.: "Unknown status for Author". */
    (0, import_i18n24.__)("Unknown status for %1$s"),
    filter.name
  );
};
function OperatorSelector({
  filter,
  view,
  onChangeView
}) {
  const operatorOptions = filter.operators?.map((operator) => ({
    value: operator,
    label: getOperatorByName(operator)?.label || operator
  }));
  const currentFilter = view.filters?.find(
    (_filter) => _filter.field === filter.field
  );
  const value = currentFilter?.operator || filter.operators[0];
  return operatorOptions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime62.jsxs)(
    Stack,
    {
      direction: "row",
      gap: "xs",
      justify: "flex-start",
      className: "dataviews-filters__summary-operators-container",
      align: "center",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(import_components23.FlexItem, { className: "dataviews-filters__summary-operators-filter-name", children: filter.name }),
        /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
          import_components23.SelectControl,
          {
            className: "dataviews-filters__summary-operators-filter-select",
            label: (0, import_i18n24.__)("Conditions"),
            value,
            options: operatorOptions,
            onChange: (newValue) => {
              const newOperator = newValue;
              const currentOperator = currentFilter?.operator;
              const newFilters = currentFilter ? [
                ...(view.filters ?? []).map(
                  (_filter) => {
                    if (_filter.field === filter.field) {
                      const currentOpSelectionModel = getOperatorByName(
                        currentOperator
                      )?.selection;
                      const newOpSelectionModel = getOperatorByName(
                        newOperator
                      )?.selection;
                      const shouldResetValue = currentOpSelectionModel !== newOpSelectionModel || [
                        currentOpSelectionModel,
                        newOpSelectionModel
                      ].includes("custom");
                      return {
                        ..._filter,
                        value: shouldResetValue ? void 0 : _filter.value,
                        operator: newOperator
                      };
                    }
                    return _filter;
                  }
                )
              ] : [
                ...view.filters ?? [],
                {
                  field: filter.field,
                  operator: newOperator,
                  value: void 0
                }
              ];
              onChangeView({
                ...view,
                page: 1,
                filters: newFilters
              });
            },
            size: "small",
            variant: "minimal",
            hideLabelFromVision: true
          }
        )
      ]
    }
  );
}
function Filter({
  addFilterRef,
  openedFilter,
  fields,
  ...commonProps
}) {
  const toggleRef = (0, import_element27.useRef)(null);
  const { filter, view, onChangeView } = commonProps;
  const filterInView = view.filters?.find(
    (f2) => f2.field === filter.field
  );
  let activeElements = [];
  const field = (0, import_element27.useMemo)(() => {
    const currentField = fields.find((f2) => f2.id === filter.field);
    if (currentField) {
      return {
        ...currentField,
        // Configure getValue as if Item was a plain object.
        // See related input-widget.tsx
        getValue: ({ item }) => item[currentField.id]
      };
    }
    return currentField;
  }, [fields, filter.field]);
  const { elements } = useElements({
    elements: filter.elements,
    getElements: filter.getElements
  });
  if (elements.length > 0) {
    activeElements = elements.filter((element) => {
      if (filter.singleSelection) {
        return element.value === filterInView?.value;
      }
      return filterInView?.value?.includes(element.value);
    });
  } else if (Array.isArray(filterInView?.value)) {
    const label = filterInView.value.map((v2) => {
      const formattedValue = field?.getValueFormatted({
        item: { [field.id]: v2 },
        field
      });
      return formattedValue || String(v2);
    });
    activeElements = [
      {
        value: filterInView.value,
        // @ts-ignore
        label
      }
    ];
  } else if (typeof filterInView?.value === "object") {
    activeElements = [
      { value: filterInView.value, label: filterInView.value }
    ];
  } else if (filterInView?.value !== void 0) {
    const label = field !== void 0 ? field.getValueFormatted({
      item: { [field.id]: filterInView.value },
      field
    }) : String(filterInView.value);
    activeElements = [
      {
        value: filterInView.value,
        label
      }
    ];
  }
  const isPrimary = filter.isPrimary;
  const isLocked = filterInView?.isLocked;
  const hasValues = !isLocked && filterInView?.value !== void 0;
  const canResetOrRemove = !isLocked && (!isPrimary || hasValues);
  return /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
    import_components23.Dropdown,
    {
      defaultOpen: openedFilter === filter.field,
      contentClassName: "dataviews-filters__summary-popover",
      popoverProps: { placement: "bottom-start", role: "dialog" },
      onClose: () => {
        toggleRef.current?.focus();
      },
      renderToggle: ({ isOpen, onToggle }) => /* @__PURE__ */ (0, import_jsx_runtime62.jsxs)("div", { className: "dataviews-filters__summary-chip-container", children: [
        /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
          import_components23.Tooltip,
          {
            text: (0, import_i18n24.sprintf)(
              /* translators: 1: Filter name. */
              (0, import_i18n24.__)("Filter by: %1$s"),
              filter.name.toLowerCase()
            ),
            placement: "top",
            children: /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
              "div",
              {
                className: clsx_default(
                  "dataviews-filters__summary-chip",
                  {
                    "has-reset": canResetOrRemove,
                    "has-values": hasValues,
                    "is-not-clickable": isLocked
                  }
                ),
                role: "button",
                tabIndex: isLocked ? -1 : 0,
                onClick: () => {
                  if (!isLocked) {
                    onToggle();
                  }
                },
                onKeyDown: (event) => {
                  if (!isLocked && [ENTER, SPACE].includes(event.key)) {
                    onToggle();
                    event.preventDefault();
                  }
                },
                "aria-disabled": isLocked,
                "aria-pressed": isOpen,
                "aria-expanded": isOpen,
                ref: toggleRef,
                children: /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
                  FilterText,
                  {
                    activeElements,
                    filterInView,
                    filter
                  }
                )
              }
            )
          }
        ),
        canResetOrRemove && /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
          import_components23.Tooltip,
          {
            text: isPrimary ? (0, import_i18n24.__)("Reset") : (0, import_i18n24.__)("Remove"),
            placement: "top",
            children: /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
              "button",
              {
                className: clsx_default(
                  "dataviews-filters__summary-chip-remove",
                  { "has-values": hasValues }
                ),
                onClick: () => {
                  onChangeView({
                    ...view,
                    page: 1,
                    filters: view.filters?.filter(
                      (_filter) => _filter.field !== filter.field
                    )
                  });
                  if (!isPrimary) {
                    addFilterRef.current?.focus();
                  } else {
                    toggleRef.current?.focus();
                  }
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(import_components23.Icon, { icon: close_small_default })
              }
            )
          }
        )
      ] }),
      renderContent: () => {
        return /* @__PURE__ */ (0, import_jsx_runtime62.jsxs)(Stack, { direction: "column", justify: "flex-start", children: [
          /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(OperatorSelector, { ...commonProps }),
          commonProps.filter.hasElements ? /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(
            SearchWidget,
            {
              ...commonProps,
              filter: {
                ...commonProps.filter,
                elements
              }
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime62.jsx)(InputWidget, { ...commonProps, fields })
        ] });
      }
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/add-filter.mjs
var import_components24 = __toESM(require_components(), 1);
var import_i18n25 = __toESM(require_i18n(), 1);
var import_element28 = __toESM(require_element(), 1);
var import_jsx_runtime63 = __toESM(require_jsx_runtime(), 1);
var { Menu: Menu4 } = unlock(import_components24.privateApis);
function AddFilterMenu({
  filters,
  view,
  onChangeView,
  setOpenedFilter,
  triggerProps
}) {
  const inactiveFilters = filters.filter((filter) => !filter.isVisible);
  return /* @__PURE__ */ (0, import_jsx_runtime63.jsxs)(Menu4, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime63.jsx)(Menu4.TriggerButton, { ...triggerProps }),
    /* @__PURE__ */ (0, import_jsx_runtime63.jsx)(Menu4.Popover, { children: inactiveFilters.map((filter) => {
      return /* @__PURE__ */ (0, import_jsx_runtime63.jsx)(
        Menu4.Item,
        {
          onClick: () => {
            setOpenedFilter(filter.field);
            onChangeView({
              ...view,
              page: 1,
              filters: [
                ...view.filters || [],
                {
                  field: filter.field,
                  value: void 0,
                  operator: filter.operators[0]
                }
              ]
            });
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime63.jsx)(Menu4.ItemLabel, { children: filter.name })
        },
        filter.field
      );
    }) })
  ] });
}
function AddFilter({ filters, view, onChangeView, setOpenedFilter }, ref) {
  if (!filters.length || filters.every(({ isPrimary }) => isPrimary)) {
    return null;
  }
  const inactiveFilters = filters.filter((filter) => !filter.isVisible);
  return /* @__PURE__ */ (0, import_jsx_runtime63.jsx)(
    AddFilterMenu,
    {
      triggerProps: {
        render: /* @__PURE__ */ (0, import_jsx_runtime63.jsx)(
          import_components24.Button,
          {
            accessibleWhenDisabled: true,
            size: "compact",
            className: "dataviews-filters-button",
            variant: "tertiary",
            disabled: !inactiveFilters.length,
            ref
          }
        ),
        children: (0, import_i18n25.__)("Add filter")
      },
      ...{ filters, view, onChangeView, setOpenedFilter }
    }
  );
}
var add_filter_default = (0, import_element28.forwardRef)(AddFilter);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/reset-filters.mjs
var import_components25 = __toESM(require_components(), 1);
var import_i18n26 = __toESM(require_i18n(), 1);
var import_jsx_runtime64 = __toESM(require_jsx_runtime(), 1);
function ResetFilter({
  filters,
  view,
  onChangeView
}) {
  const isPrimary = (field) => filters.some(
    (_filter) => _filter.field === field && _filter.isPrimary
  );
  const isDisabled = !view.search && !view.filters?.some(
    (_filter) => !_filter.isLocked && (_filter.value !== void 0 || !isPrimary(_filter.field))
  );
  return /* @__PURE__ */ (0, import_jsx_runtime64.jsx)(
    import_components25.Button,
    {
      disabled: isDisabled,
      accessibleWhenDisabled: true,
      size: "compact",
      variant: "tertiary",
      className: "dataviews-filters__reset-button",
      onClick: () => {
        onChangeView({
          ...view,
          page: 1,
          search: "",
          filters: view.filters?.filter((f2) => !!f2.isLocked) || []
        });
      },
      children: (0, import_i18n26.__)("Reset")
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/use-filters.mjs
var import_element29 = __toESM(require_element(), 1);
function useFilters(fields, view) {
  return (0, import_element29.useMemo)(() => {
    const filters = [];
    fields.forEach((field) => {
      if (field.filterBy === false || !field.hasElements && !field.Edit) {
        return;
      }
      const operators = field.filterBy.operators;
      const isPrimary = !!field.filterBy?.isPrimary;
      const isLocked = view.filters?.some(
        (f2) => f2.field === field.id && !!f2.isLocked
      ) ?? false;
      filters.push({
        field: field.id,
        name: field.label,
        elements: field.elements,
        getElements: field.getElements,
        hasElements: field.hasElements,
        singleSelection: operators.some(
          (op) => isSingleSelectionOperator(op)
        ),
        operators,
        isVisible: isLocked || isPrimary || !!view.filters?.some(
          (f2) => f2.field === field.id && isRegisteredOperator(f2.operator)
        ),
        isPrimary,
        isLocked
      });
    });
    filters.sort((a2, b2) => {
      if (a2.isLocked && !b2.isLocked) {
        return -1;
      }
      if (!a2.isLocked && b2.isLocked) {
        return 1;
      }
      if (a2.isPrimary && !b2.isPrimary) {
        return -1;
      }
      if (!a2.isPrimary && b2.isPrimary) {
        return 1;
      }
      return a2.name.localeCompare(b2.name);
    });
    return filters;
  }, [fields, view]);
}
var use_filters_default = useFilters;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/filters.mjs
var import_jsx_runtime65 = __toESM(require_jsx_runtime(), 1);
function Filters({ className }) {
  const { fields, view, onChangeView, openedFilter, setOpenedFilter } = (0, import_element30.useContext)(dataviews_context_default);
  const addFilterRef = (0, import_element30.useRef)(null);
  const filters = use_filters_default(fields, view);
  const addFilter = /* @__PURE__ */ (0, import_jsx_runtime65.jsx)(
    add_filter_default,
    {
      filters,
      view,
      onChangeView,
      ref: addFilterRef,
      setOpenedFilter
    },
    "add-filter"
  );
  const visibleFilters = filters.filter((filter) => filter.isVisible);
  if (visibleFilters.length === 0) {
    return null;
  }
  const filterComponents = [
    ...visibleFilters.map((filter) => {
      return /* @__PURE__ */ (0, import_jsx_runtime65.jsx)(
        Filter,
        {
          filter,
          view,
          fields,
          onChangeView,
          addFilterRef,
          openedFilter
        },
        filter.field
      );
    }),
    addFilter
  ];
  filterComponents.push(
    /* @__PURE__ */ (0, import_jsx_runtime65.jsx)(
      ResetFilter,
      {
        filters,
        view,
        onChangeView
      },
      "reset-filters"
    )
  );
  return /* @__PURE__ */ (0, import_jsx_runtime65.jsx)(
    Stack,
    {
      direction: "row",
      justify: "flex-start",
      gap: "xs",
      style: { width: "fit-content" },
      wrap: "wrap",
      className,
      children: filterComponents
    }
  );
}
var filters_default = (0, import_element30.memo)(Filters);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/toggle.mjs
var import_element31 = __toESM(require_element(), 1);
var import_components26 = __toESM(require_components(), 1);
var import_i18n27 = __toESM(require_i18n(), 1);
var import_jsx_runtime66 = __toESM(require_jsx_runtime(), 1);
function FiltersToggle() {
  const {
    filters,
    view,
    onChangeView,
    setOpenedFilter,
    isShowingFilter,
    setIsShowingFilter
  } = (0, import_element31.useContext)(dataviews_context_default);
  const buttonRef = (0, import_element31.useRef)(null);
  const onChangeViewWithFilterVisibility = (0, import_element31.useCallback)(
    (_view) => {
      onChangeView(_view);
      setIsShowingFilter(true);
    },
    [onChangeView, setIsShowingFilter]
  );
  const visibleFilters = filters.filter((filter) => filter.isVisible);
  const hasVisibleFilters = !!visibleFilters.length;
  if (filters.length === 0) {
    return null;
  }
  const addFilterButtonProps = {
    label: (0, import_i18n27.__)("Add filter"),
    "aria-expanded": false,
    isPressed: false
  };
  const toggleFiltersButtonProps = {
    label: (0, import_i18n27._x)("Filter", "verb"),
    "aria-expanded": isShowingFilter,
    isPressed: isShowingFilter,
    onClick: () => {
      if (!isShowingFilter) {
        setOpenedFilter(null);
      }
      setIsShowingFilter(!isShowingFilter);
    }
  };
  const buttonComponent = /* @__PURE__ */ (0, import_jsx_runtime66.jsx)(
    import_components26.Button,
    {
      ref: buttonRef,
      className: "dataviews-filters__visibility-toggle",
      size: "compact",
      icon: funnel_default,
      ...hasVisibleFilters ? toggleFiltersButtonProps : addFilterButtonProps
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime66.jsx)("div", { className: "dataviews-filters__container-visibility-toggle", children: !hasVisibleFilters ? /* @__PURE__ */ (0, import_jsx_runtime66.jsx)(
    AddFilterMenu,
    {
      filters,
      view,
      onChangeView: onChangeViewWithFilterVisibility,
      setOpenedFilter,
      triggerProps: { render: buttonComponent }
    }
  ) : /* @__PURE__ */ (0, import_jsx_runtime66.jsx)(
    FilterVisibilityToggle,
    {
      buttonRef,
      filtersCount: view.filters?.length,
      children: buttonComponent
    }
  ) });
}
function FilterVisibilityToggle({
  buttonRef,
  filtersCount,
  children
}) {
  (0, import_element31.useEffect)(
    () => () => {
      buttonRef.current?.focus();
    },
    [buttonRef]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime66.jsxs)(import_jsx_runtime66.Fragment, { children: [
    children,
    !!filtersCount && /* @__PURE__ */ (0, import_jsx_runtime66.jsx)("span", { className: "dataviews-filters-toggle__count", children: filtersCount })
  ] });
}
var toggle_default = FiltersToggle;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-filters/filters-toggled.mjs
var import_element32 = __toESM(require_element(), 1);
var import_jsx_runtime67 = __toESM(require_jsx_runtime(), 1);
function FiltersToggled(props) {
  const { isShowingFilter } = (0, import_element32.useContext)(dataviews_context_default);
  if (!isShowingFilter) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime67.jsx)(filters_default, { ...props });
}
var filters_toggled_default = FiltersToggled;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-layout/index.mjs
var import_element33 = __toESM(require_element(), 1);
var import_i18n28 = __toESM(require_i18n(), 1);
var import_jsx_runtime68 = __toESM(require_jsx_runtime(), 1);
function DataViewsLayout({ className }) {
  const {
    actions = [],
    data,
    fields,
    getItemId,
    getItemLevel,
    isLoading,
    view,
    onChangeView,
    selection,
    onChangeSelection,
    setOpenedFilter,
    onClickItem,
    isItemClickable,
    renderItemLink,
    defaultLayouts: defaultLayouts2,
    empty = /* @__PURE__ */ (0, import_jsx_runtime68.jsx)("p", { children: (0, import_i18n28.__)("No results") })
  } = (0, import_element33.useContext)(dataviews_context_default);
  const ViewComponent = VIEW_LAYOUTS.find(
    (v2) => v2.type === view.type && defaultLayouts2[v2.type]
  )?.component;
  return /* @__PURE__ */ (0, import_jsx_runtime68.jsx)(
    ViewComponent,
    {
      className,
      actions,
      data,
      fields,
      getItemId,
      getItemLevel,
      isLoading,
      onChangeView,
      onChangeSelection,
      selection,
      setOpenedFilter,
      onClickItem,
      renderItemLink,
      isItemClickable,
      view,
      empty
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-footer/index.mjs
var import_element34 = __toESM(require_element(), 1);
var import_jsx_runtime69 = __toESM(require_jsx_runtime(), 1);
var EMPTY_ARRAY5 = [];
function DataViewsFooter() {
  const {
    view,
    paginationInfo: { totalItems = 0, totalPages },
    data,
    actions = EMPTY_ARRAY5
  } = (0, import_element34.useContext)(dataviews_context_default);
  const hasBulkActions = useSomeItemHasAPossibleBulkAction(actions, data) && [LAYOUT_TABLE, LAYOUT_GRID].includes(view.type);
  if (!totalItems || !totalPages || totalPages <= 1 && !hasBulkActions) {
    return null;
  }
  return !!totalItems && /* @__PURE__ */ (0, import_jsx_runtime69.jsxs)(
    Stack,
    {
      direction: "row",
      justify: "end",
      align: "center",
      className: "dataviews-footer",
      gap: "xs",
      children: [
        hasBulkActions && /* @__PURE__ */ (0, import_jsx_runtime69.jsx)(BulkActionsFooter, {}),
        /* @__PURE__ */ (0, import_jsx_runtime69.jsx)(dataviews_pagination_default, {})
      ]
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-search/index.mjs
var import_i18n29 = __toESM(require_i18n(), 1);
var import_element35 = __toESM(require_element(), 1);
var import_components27 = __toESM(require_components(), 1);
var import_compose10 = __toESM(require_compose(), 1);
var import_jsx_runtime70 = __toESM(require_jsx_runtime(), 1);
var DataViewsSearch = (0, import_element35.memo)(function Search({ label }) {
  const { view, onChangeView } = (0, import_element35.useContext)(dataviews_context_default);
  const [search, setSearch, debouncedSearch] = (0, import_compose10.useDebouncedInput)(
    view.search
  );
  (0, import_element35.useEffect)(() => {
    setSearch(view.search ?? "");
  }, [view.search, setSearch]);
  const onChangeViewRef = (0, import_element35.useRef)(onChangeView);
  const viewRef = (0, import_element35.useRef)(view);
  (0, import_element35.useEffect)(() => {
    onChangeViewRef.current = onChangeView;
    viewRef.current = view;
  }, [onChangeView, view]);
  (0, import_element35.useEffect)(() => {
    if (debouncedSearch !== viewRef.current?.search) {
      onChangeViewRef.current({
        ...viewRef.current,
        page: 1,
        search: debouncedSearch
      });
    }
  }, [debouncedSearch]);
  const searchLabel = label || (0, import_i18n29.__)("Search");
  return /* @__PURE__ */ (0, import_jsx_runtime70.jsx)(
    import_components27.SearchControl,
    {
      className: "dataviews-search",
      onChange: setSearch,
      value: search,
      label: searchLabel,
      placeholder: searchLabel,
      size: "compact"
    }
  );
});
var dataviews_search_default = DataViewsSearch;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-view-config/index.mjs
var import_components29 = __toESM(require_components(), 1);
var import_i18n31 = __toESM(require_i18n(), 1);
var import_element37 = __toESM(require_element(), 1);
var import_warning = __toESM(require_warning(), 1);
var import_compose11 = __toESM(require_compose(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-view-config/infinite-scroll-toggle.mjs
var import_components28 = __toESM(require_components(), 1);
var import_i18n30 = __toESM(require_i18n(), 1);
var import_element36 = __toESM(require_element(), 1);
var import_jsx_runtime71 = __toESM(require_jsx_runtime(), 1);
function InfiniteScrollToggle() {
  const context = (0, import_element36.useContext)(dataviews_context_default);
  const { view, onChangeView } = context;
  const infiniteScrollEnabled = view.infiniteScrollEnabled ?? false;
  if (!context.hasInfiniteScrollHandler) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime71.jsx)(
    import_components28.ToggleControl,
    {
      label: (0, import_i18n30.__)("Enable infinite scroll"),
      help: (0, import_i18n30.__)(
        "Automatically load more content as you scroll, instead of showing pagination links."
      ),
      checked: infiniteScrollEnabled,
      onChange: (newValue) => {
        onChangeView({
          ...view,
          infiniteScrollEnabled: newValue
        });
      }
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataviews-view-config/index.mjs
var import_jsx_runtime72 = __toESM(require_jsx_runtime(), 1);
var { Menu: Menu5 } = unlock(import_components29.privateApis);
var DATAVIEWS_CONFIG_POPOVER_PROPS = {
  className: "dataviews-config__popover",
  placement: "bottom-end",
  offset: 9
};
function ViewTypeMenu() {
  const { view, onChangeView, defaultLayouts: defaultLayouts2 } = (0, import_element37.useContext)(dataviews_context_default);
  const availableLayouts = Object.keys(defaultLayouts2);
  if (availableLayouts.length <= 1) {
    return null;
  }
  const activeView = VIEW_LAYOUTS.find((v2) => view.type === v2.type);
  return /* @__PURE__ */ (0, import_jsx_runtime72.jsxs)(Menu5, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
      Menu5.TriggerButton,
      {
        render: /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
          import_components29.Button,
          {
            size: "compact",
            icon: activeView?.icon,
            label: (0, import_i18n31.__)("Layout")
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(Menu5.Popover, { children: availableLayouts.map((layout) => {
      const config = VIEW_LAYOUTS.find(
        (v2) => v2.type === layout
      );
      if (!config) {
        return null;
      }
      return /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
        Menu5.RadioItem,
        {
          value: layout,
          name: "view-actions-available-view",
          checked: layout === view.type,
          hideOnClick: true,
          onChange: (e2) => {
            switch (e2.target.value) {
              case "list":
              case "grid":
              case "table":
              case "pickerGrid":
              case "pickerTable":
              case "activity":
                const viewWithoutLayout = { ...view };
                if ("layout" in viewWithoutLayout) {
                  delete viewWithoutLayout.layout;
                }
                return onChangeView({
                  ...viewWithoutLayout,
                  type: e2.target.value,
                  ...defaultLayouts2[e2.target.value]
                });
            }
            (0, import_warning.default)("Invalid dataview");
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(Menu5.ItemLabel, { children: config.label })
        },
        layout
      );
    }) })
  ] });
}
function SortFieldControl() {
  const { view, fields, onChangeView } = (0, import_element37.useContext)(dataviews_context_default);
  const orderOptions = (0, import_element37.useMemo)(() => {
    const sortableFields = fields.filter(
      (field) => field.enableSorting !== false
    );
    return sortableFields.map((field) => {
      return {
        label: field.label,
        value: field.id
      };
    });
  }, [fields]);
  return /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
    import_components29.SelectControl,
    {
      __next40pxDefaultSize: true,
      label: (0, import_i18n31.__)("Sort by"),
      value: view.sort?.field,
      options: orderOptions,
      onChange: (value) => {
        onChangeView({
          ...view,
          sort: {
            direction: view?.sort?.direction || "desc",
            field: value
          },
          showLevels: false
        });
      }
    }
  );
}
function SortDirectionControl() {
  const { view, fields, onChangeView } = (0, import_element37.useContext)(dataviews_context_default);
  const sortableFields = fields.filter(
    (field) => field.enableSorting !== false
  );
  if (sortableFields.length === 0) {
    return null;
  }
  let value = view.sort?.direction;
  if (!value && view.sort?.field) {
    value = "desc";
  }
  return /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
    import_components29.__experimentalToggleGroupControl,
    {
      className: "dataviews-view-config__sort-direction",
      __next40pxDefaultSize: true,
      isBlock: true,
      label: (0, import_i18n31.__)("Order"),
      value,
      onChange: (newDirection) => {
        if (newDirection === "asc" || newDirection === "desc") {
          onChangeView({
            ...view,
            sort: {
              direction: newDirection,
              field: view.sort?.field || // If there is no field assigned as the sorting field assign the first sortable field.
              fields.find(
                (field) => field.enableSorting !== false
              )?.id || ""
            },
            showLevels: false
          });
          return;
        }
        (0, import_warning.default)("Invalid direction");
      },
      children: SORTING_DIRECTIONS.map((direction) => {
        return /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
          import_components29.__experimentalToggleGroupControlOptionIcon,
          {
            value: direction,
            icon: sortIcons[direction],
            label: sortLabels[direction]
          },
          direction
        );
      })
    }
  );
}
function ItemsPerPageControl() {
  const { view, config, onChangeView } = (0, import_element37.useContext)(dataviews_context_default);
  const { infiniteScrollEnabled } = view;
  if (!config || !config.perPageSizes || config.perPageSizes.length < 2 || config.perPageSizes.length > 6 || infiniteScrollEnabled) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
    import_components29.__experimentalToggleGroupControl,
    {
      __next40pxDefaultSize: true,
      isBlock: true,
      label: (0, import_i18n31.__)("Items per page"),
      value: view.perPage || 10,
      disabled: !view?.sort?.field,
      onChange: (newItemsPerPage) => {
        const newItemsPerPageNumber = typeof newItemsPerPage === "number" || newItemsPerPage === void 0 ? newItemsPerPage : parseInt(newItemsPerPage, 10);
        onChangeView({
          ...view,
          perPage: newItemsPerPageNumber,
          page: 1
        });
      },
      children: config.perPageSizes.map((value) => {
        return /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
          import_components29.__experimentalToggleGroupControlOption,
          {
            value,
            label: value.toString()
          },
          value
        );
      })
    }
  );
}
function SettingsSection({
  title,
  description,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime72.jsxs)(import_components29.__experimentalGrid, { columns: 12, className: "dataviews-settings-section", gap: 4, children: [
    /* @__PURE__ */ (0, import_jsx_runtime72.jsxs)("div", { className: "dataviews-settings-section__sidebar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
        import_components29.__experimentalHeading,
        {
          level: 2,
          className: "dataviews-settings-section__title",
          children: title
        }
      ),
      description && /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
        import_components29.__experimentalText,
        {
          variant: "muted",
          className: "dataviews-settings-section__description",
          children: description
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
      import_components29.__experimentalGrid,
      {
        columns: 8,
        gap: 4,
        className: "dataviews-settings-section__content",
        children
      }
    )
  ] });
}
function DataviewsViewConfigDropdown() {
  const { view } = (0, import_element37.useContext)(dataviews_context_default);
  const popoverId = (0, import_compose11.useInstanceId)(
    _DataViewsViewConfig,
    "dataviews-view-config-dropdown"
  );
  const activeLayout = VIEW_LAYOUTS.find(
    (layout) => layout.type === view.type
  );
  return /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
    import_components29.Dropdown,
    {
      expandOnMobile: true,
      popoverProps: {
        ...DATAVIEWS_CONFIG_POPOVER_PROPS,
        id: popoverId
      },
      renderToggle: ({ onToggle, isOpen }) => {
        return /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
          import_components29.Button,
          {
            size: "compact",
            icon: cog_default,
            label: (0, import_i18n31._x)("View options", "View is used as a noun"),
            onClick: onToggle,
            "aria-expanded": isOpen ? "true" : "false",
            "aria-controls": popoverId
          }
        );
      },
      renderContent: () => /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
        import_components29.__experimentalDropdownContentWrapper,
        {
          paddingSize: "medium",
          className: "dataviews-config__popover-content-wrapper",
          children: /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(
            Stack,
            {
              direction: "column",
              className: "dataviews-view-config",
              gap: "lg",
              children: /* @__PURE__ */ (0, import_jsx_runtime72.jsxs)(SettingsSection, { title: (0, import_i18n31.__)("Appearance"), children: [
                /* @__PURE__ */ (0, import_jsx_runtime72.jsxs)(
                  Stack,
                  {
                    direction: "row",
                    gap: "xs",
                    className: "is-divided-in-two",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(SortFieldControl, {}),
                      /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(SortDirectionControl, {})
                    ]
                  }
                ),
                !!activeLayout?.viewConfigOptions && /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(activeLayout.viewConfigOptions, {}),
                /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(InfiniteScrollToggle, {}),
                /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(ItemsPerPageControl, {}),
                /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(PropertiesSection, {})
              ] })
            }
          )
        }
      )
    }
  );
}
function _DataViewsViewConfig() {
  return /* @__PURE__ */ (0, import_jsx_runtime72.jsxs)(import_jsx_runtime72.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(ViewTypeMenu, {}),
    /* @__PURE__ */ (0, import_jsx_runtime72.jsx)(DataviewsViewConfigDropdown, {})
  ] });
}
var DataViewsViewConfig = (0, import_element37.memo)(_DataViewsViewConfig);
var dataviews_view_config_default = DataViewsViewConfig;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/checkbox.mjs
var import_components30 = __toESM(require_components(), 1);
var import_element38 = __toESM(require_element(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/utils/get-custom-validity.mjs
function getCustomValidity(isValid2, validity) {
  let customValidity;
  if (isValid2?.required && validity?.required) {
    customValidity = validity?.required?.message ? validity.required : void 0;
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/checkbox.mjs
var import_jsx_runtime73 = __toESM(require_jsx_runtime(), 1);
var { ValidatedCheckboxControl } = unlock(import_components30.privateApis);
function Checkbox({
  field,
  onChange,
  data,
  hideLabelFromVision,
  validity
}) {
  const { getValue, setValue, label, description, isValid: isValid2 } = field;
  const onChangeControl = (0, import_element38.useCallback)(() => {
    onChange(
      setValue({ item: data, value: !getValue({ item: data }) })
    );
  }, [data, getValue, onChange, setValue]);
  return /* @__PURE__ */ (0, import_jsx_runtime73.jsx)(
    ValidatedCheckboxControl,
    {
      required: !!field.isValid?.required,
      customValidity: getCustomValidity(isValid2, validity),
      hidden: hideLabelFromVision,
      label,
      help: description,
      checked: getValue({ item: data }),
      onChange: onChangeControl
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/combobox.mjs
var import_components31 = __toESM(require_components(), 1);
var import_element39 = __toESM(require_element(), 1);
var import_jsx_runtime74 = __toESM(require_jsx_runtime(), 1);
var { ValidatedComboboxControl } = unlock(import_components31.privateApis);
function Combobox3({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  const { label, description, placeholder, getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data }) ?? "";
  const onChangeControl = (0, import_element39.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue ?? "" })),
    [data, onChange, setValue]
  );
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime74.jsx)(import_components31.Spinner, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime74.jsx)(
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/datetime.mjs
var import_components33 = __toESM(require_components(), 1);
var import_element41 = __toESM(require_element(), 1);
var import_i18n33 = __toESM(require_i18n(), 1);
var import_date3 = __toESM(require_date(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/utils/relative-date-control.mjs
var import_components32 = __toESM(require_components(), 1);
var import_element40 = __toESM(require_element(), 1);
var import_i18n32 = __toESM(require_i18n(), 1);
var import_jsx_runtime75 = __toESM(require_jsx_runtime(), 1);
var TIME_UNITS_OPTIONS = {
  [OPERATOR_IN_THE_PAST]: [
    { value: "days", label: (0, import_i18n32.__)("Days") },
    { value: "weeks", label: (0, import_i18n32.__)("Weeks") },
    { value: "months", label: (0, import_i18n32.__)("Months") },
    { value: "years", label: (0, import_i18n32.__)("Years") }
  ],
  [OPERATOR_OVER]: [
    { value: "days", label: (0, import_i18n32.__)("Days ago") },
    { value: "weeks", label: (0, import_i18n32.__)("Weeks ago") },
    { value: "months", label: (0, import_i18n32.__)("Months ago") },
    { value: "years", label: (0, import_i18n32.__)("Years ago") }
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
  const { id, label, getValue, setValue } = field;
  const fieldValue = getValue({ item: data });
  const { value: relValue = "", unit = options[0].value } = fieldValue && typeof fieldValue === "object" ? fieldValue : {};
  const onChangeValue = (0, import_element40.useCallback)(
    (newValue) => onChange(
      setValue({
        item: data,
        value: { value: Number(newValue), unit }
      })
    ),
    [onChange, setValue, data, unit]
  );
  const onChangeUnit = (0, import_element40.useCallback)(
    (newUnit) => onChange(
      setValue({
        item: data,
        value: { value: relValue, unit: newUnit }
      })
    ),
    [onChange, setValue, data, relValue]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime75.jsx)(
    import_components32.BaseControl,
    {
      id,
      className: clsx_default(className, "dataviews-controls__relative-date"),
      label,
      hideLabelFromVision,
      children: /* @__PURE__ */ (0, import_jsx_runtime75.jsxs)(Stack, { direction: "row", gap: "xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime75.jsx)(
          import_components32.__experimentalNumberControl,
          {
            __next40pxDefaultSize: true,
            className: "dataviews-controls__relative-date-number",
            spinControls: "none",
            min: 1,
            step: 1,
            value: relValue,
            onChange: onChangeValue
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime75.jsx)(
          import_components32.SelectControl,
          {
            className: "dataviews-controls__relative-date-unit",
            __next40pxDefaultSize: true,
            label: (0, import_i18n32.__)("Unit"),
            value: unit,
            options,
            onChange: onChangeUnit,
            hideLabelFromVision: true
          }
        )
      ] })
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/parse-date-time.mjs
var import_date2 = __toESM(require_date(), 1);
function parseDateTime(dateTimeString) {
  if (!dateTimeString) {
    return null;
  }
  const parsed = (0, import_date2.getDate)(dateTimeString);
  return parsed && isValid(parsed) ? parsed : null;
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/datetime.mjs
var import_jsx_runtime76 = __toESM(require_jsx_runtime(), 1);
var { DateCalendar, ValidatedInputControl } = unlock(import_components33.privateApis);
var formatDateTime = (date) => {
  if (!date) {
    return "";
  }
  if (typeof date === "string") {
    return date;
  }
  return format(date, "yyyy-MM-dd'T'HH:mm");
};
function CalendarDateTimeControl({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  const { id, label, description, setValue, getValue, isValid: isValid2 } = field;
  const fieldValue = getValue({ item: data });
  const value = typeof fieldValue === "string" ? fieldValue : void 0;
  const [calendarMonth, setCalendarMonth] = (0, import_element41.useState)(() => {
    const parsedDate = parseDateTime(value);
    return parsedDate || /* @__PURE__ */ new Date();
  });
  const inputControlRef = (0, import_element41.useRef)(null);
  const validationTimeoutRef = (0, import_element41.useRef)();
  const previousFocusRef = (0, import_element41.useRef)(null);
  const onChangeCallback = (0, import_element41.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  (0, import_element41.useEffect)(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);
  const onSelectDate = (0, import_element41.useCallback)(
    (newDate) => {
      let dateTimeValue;
      if (newDate) {
        let finalDateTime = newDate;
        if (value) {
          const currentDateTime = parseDateTime(value);
          if (currentDateTime) {
            finalDateTime = new Date(newDate);
            finalDateTime.setHours(currentDateTime.getHours());
            finalDateTime.setMinutes(
              currentDateTime.getMinutes()
            );
          }
        }
        dateTimeValue = finalDateTime.toISOString();
        onChangeCallback(dateTimeValue);
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
        }
      } else {
        onChangeCallback(void 0);
      }
      previousFocusRef.current = inputControlRef.current && inputControlRef.current.ownerDocument.activeElement;
      validationTimeoutRef.current = setTimeout(() => {
        if (inputControlRef.current) {
          inputControlRef.current.focus();
          inputControlRef.current.blur();
          onChangeCallback(dateTimeValue);
          if (previousFocusRef.current && previousFocusRef.current instanceof HTMLElement) {
            previousFocusRef.current.focus();
          }
        }
      }, 0);
    },
    [onChangeCallback, value]
  );
  const handleManualDateTimeChange = (0, import_element41.useCallback)(
    (newValue) => {
      if (newValue) {
        const dateTime = new Date(newValue);
        onChangeCallback(dateTime.toISOString());
        const parsedDate = parseDateTime(dateTime.toISOString());
        if (parsedDate) {
          setCalendarMonth(parsedDate);
        }
      } else {
        onChangeCallback(void 0);
      }
    },
    [onChangeCallback]
  );
  const { format: fieldFormat } = field;
  const weekStartsOn = fieldFormat.weekStartsOn ?? (0, import_date3.getSettings)().l10n.startOfWeek;
  const {
    timezone: { string: timezoneString }
  } = (0, import_date3.getSettings)();
  const displayLabel = isValid2?.required && !hideLabelFromVision ? `${label} (${(0, import_i18n33.__)("Required")})` : label;
  return /* @__PURE__ */ (0, import_jsx_runtime76.jsx)(
    import_components33.BaseControl,
    {
      id,
      label: displayLabel,
      help: description,
      hideLabelFromVision,
      children: /* @__PURE__ */ (0, import_jsx_runtime76.jsxs)(Stack, { direction: "column", gap: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime76.jsx)(
          DateCalendar,
          {
            style: { width: "100%" },
            selected: value ? parseDateTime(value) || void 0 : void 0,
            onSelect: onSelectDate,
            month: calendarMonth,
            onMonthChange: setCalendarMonth,
            timeZone: timezoneString || void 0,
            weekStartsOn
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime76.jsx)(
          ValidatedInputControl,
          {
            ref: inputControlRef,
            __next40pxDefaultSize: true,
            required: !!isValid2?.required,
            customValidity: getCustomValidity(isValid2, validity),
            type: "datetime-local",
            label: (0, import_i18n33.__)("Date time"),
            hideLabelFromVision: true,
            value: value ? formatDateTime(
              parseDateTime(value) || void 0
            ) : "",
            onChange: handleManualDateTimeChange
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
  operator,
  validity
}) {
  if (operator === OPERATOR_IN_THE_PAST || operator === OPERATOR_OVER) {
    return /* @__PURE__ */ (0, import_jsx_runtime76.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime76.jsx)(
    CalendarDateTimeControl,
    {
      data,
      field,
      onChange,
      hideLabelFromVision,
      validity
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/date.mjs
var import_components34 = __toESM(require_components(), 1);
var import_element42 = __toESM(require_element(), 1);
var import_i18n34 = __toESM(require_i18n(), 1);
var import_date4 = __toESM(require_date(), 1);
var import_jsx_runtime77 = __toESM(require_jsx_runtime(), 1);
var { DateCalendar: DateCalendar2, DateRangeCalendar } = unlock(import_components34.privateApis);
var DATE_PRESETS = [
  {
    id: "today",
    label: (0, import_i18n34.__)("Today"),
    getValue: () => (0, import_date4.getDate)(null)
  },
  {
    id: "yesterday",
    label: (0, import_i18n34.__)("Yesterday"),
    getValue: () => {
      const today = (0, import_date4.getDate)(null);
      return subDays(today, 1);
    }
  },
  {
    id: "past-week",
    label: (0, import_i18n34.__)("Past week"),
    getValue: () => {
      const today = (0, import_date4.getDate)(null);
      return subDays(today, 7);
    }
  },
  {
    id: "past-month",
    label: (0, import_i18n34.__)("Past month"),
    getValue: () => {
      const today = (0, import_date4.getDate)(null);
      return subMonths(today, 1);
    }
  }
];
var DATE_RANGE_PRESETS = [
  {
    id: "last-7-days",
    label: (0, import_i18n34.__)("Last 7 days"),
    getValue: () => {
      const today = (0, import_date4.getDate)(null);
      return [subDays(today, 7), today];
    }
  },
  {
    id: "last-30-days",
    label: (0, import_i18n34.__)("Last 30 days"),
    getValue: () => {
      const today = (0, import_date4.getDate)(null);
      return [subDays(today, 30), today];
    }
  },
  {
    id: "month-to-date",
    label: (0, import_i18n34.__)("Month to date"),
    getValue: () => {
      const today = (0, import_date4.getDate)(null);
      return [startOfMonth(today), today];
    }
  },
  {
    id: "last-year",
    label: (0, import_i18n34.__)("Last year"),
    getValue: () => {
      const today = (0, import_date4.getDate)(null);
      return [subYears(today, 1), today];
    }
  },
  {
    id: "year-to-date",
    label: (0, import_i18n34.__)("Year to date"),
    getValue: () => {
      const today = (0, import_date4.getDate)(null);
      return [startOfYear(today), today];
    }
  }
];
var parseDate = (dateString) => {
  if (!dateString) {
    return null;
  }
  const parsed = (0, import_date4.getDate)(dateString);
  return parsed && isValid(parsed) ? parsed : null;
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
  const [customValidity, setCustomValidity] = (0, import_element42.useState)(void 0);
  const validateRefs = (0, import_element42.useCallback)(() => {
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
  (0, import_element42.useEffect)(() => {
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
  (0, import_element42.useEffect)(() => {
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
  (0, import_element42.useEffect)(() => {
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
  const onBlur = (event) => {
    if (isTouched) {
      return;
    }
    if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
      setIsTouched(true);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime77.jsxs)("div", { onBlur, children: [
    children,
    /* @__PURE__ */ (0, import_jsx_runtime77.jsx)("div", { "aria-live": "polite", children: customValidity && /* @__PURE__ */ (0, import_jsx_runtime77.jsxs)(
      "p",
      {
        className: clsx_default(
          "components-validated-control__indicator",
          customValidity.type === "invalid" ? "is-invalid" : void 0,
          customValidity.type === "valid" ? "is-valid" : void 0
        ),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
            import_components34.Icon,
            {
              className: "components-validated-control__indicator-icon",
              icon: error_default,
              size: 16,
              fill: "currentColor"
            }
          ),
          customValidity.message
        ]
      }
    ) })
  ] });
}
function CalendarDateControl({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  const {
    id,
    label,
    setValue,
    getValue,
    isValid: isValid2,
    format: fieldFormat
  } = field;
  const [selectedPresetId, setSelectedPresetId] = (0, import_element42.useState)(
    null
  );
  const weekStartsOn = fieldFormat.weekStartsOn ?? (0, import_date4.getSettings)().l10n.startOfWeek;
  const fieldValue = getValue({ item: data });
  const value = typeof fieldValue === "string" ? fieldValue : void 0;
  const [calendarMonth, setCalendarMonth] = (0, import_element42.useState)(() => {
    const parsedDate = parseDate(value);
    return parsedDate || /* @__PURE__ */ new Date();
  });
  const [isTouched, setIsTouched] = (0, import_element42.useState)(false);
  const validityTargetRef = (0, import_element42.useRef)(null);
  const onChangeCallback = (0, import_element42.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  const onSelectDate = (0, import_element42.useCallback)(
    (newDate) => {
      const dateValue = newDate ? format(newDate, "yyyy-MM-dd") : void 0;
      onChangeCallback(dateValue);
      setSelectedPresetId(null);
      setIsTouched(true);
    },
    [onChangeCallback]
  );
  const handlePresetClick = (0, import_element42.useCallback)(
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
  const handleManualDateChange = (0, import_element42.useCallback)(
    (newValue) => {
      onChangeCallback(newValue);
      if (newValue) {
        const parsedDate = parseDate(newValue);
        if (parsedDate) {
          setCalendarMonth(parsedDate);
        }
      }
      setSelectedPresetId(null);
      setIsTouched(true);
    },
    [onChangeCallback]
  );
  const {
    timezone: { string: timezoneString }
  } = (0, import_date4.getSettings)();
  const displayLabel = isValid2?.required ? `${label} (${(0, import_i18n34.__)("Required")})` : label;
  return /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
    ValidatedDateControl,
    {
      field,
      validity,
      inputRefs: validityTargetRef,
      isTouched,
      setIsTouched,
      children: /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
        import_components34.BaseControl,
        {
          id,
          className: "dataviews-controls__date",
          label: displayLabel,
          hideLabelFromVision,
          children: /* @__PURE__ */ (0, import_jsx_runtime77.jsxs)(Stack, { direction: "column", gap: "md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime77.jsxs)(
              Stack,
              {
                direction: "row",
                gap: "xs",
                wrap: "wrap",
                justify: "flex-start",
                children: [
                  DATE_PRESETS.map((preset) => {
                    const isSelected2 = selectedPresetId === preset.id;
                    return /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
                      import_components34.Button,
                      {
                        className: "dataviews-controls__date-preset",
                        variant: "tertiary",
                        isPressed: isSelected2,
                        size: "small",
                        onClick: () => handlePresetClick(preset),
                        children: preset.label
                      },
                      preset.id
                    );
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
                    import_components34.Button,
                    {
                      className: "dataviews-controls__date-preset",
                      variant: "tertiary",
                      isPressed: !selectedPresetId,
                      size: "small",
                      disabled: !!selectedPresetId,
                      accessibleWhenDisabled: false,
                      children: (0, import_i18n34.__)("Custom")
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
              import_components34.__experimentalInputControl,
              {
                __next40pxDefaultSize: true,
                ref: validityTargetRef,
                type: "date",
                label: (0, import_i18n34.__)("Date"),
                hideLabelFromVision: true,
                value,
                onChange: handleManualDateChange,
                required: !!field.isValid?.required
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
              DateCalendar2,
              {
                style: { width: "100%" },
                selected: value ? parseDate(value) || void 0 : void 0,
                onSelect: onSelectDate,
                month: calendarMonth,
                onMonthChange: setCalendarMonth,
                timeZone: timezoneString || void 0,
                weekStartsOn
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
  validity
}) {
  const { id, label, getValue, setValue, format: fieldFormat } = field;
  let value;
  const fieldValue = getValue({ item: data });
  if (Array.isArray(fieldValue) && fieldValue.length === 2 && fieldValue.every((date) => typeof date === "string")) {
    value = fieldValue;
  }
  const weekStartsOn = fieldFormat.weekStartsOn ?? (0, import_date4.getSettings)().l10n.startOfWeek;
  const onChangeCallback = (0, import_element42.useCallback)(
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
  const [selectedPresetId, setSelectedPresetId] = (0, import_element42.useState)(
    null
  );
  const selectedRange = (0, import_element42.useMemo)(() => {
    if (!value) {
      return { from: void 0, to: void 0 };
    }
    const [from, to] = value;
    return {
      from: parseDate(from) || void 0,
      to: parseDate(to) || void 0
    };
  }, [value]);
  const [calendarMonth, setCalendarMonth] = (0, import_element42.useState)(() => {
    return selectedRange.from || /* @__PURE__ */ new Date();
  });
  const [isTouched, setIsTouched] = (0, import_element42.useState)(false);
  const fromInputRef = (0, import_element42.useRef)(null);
  const toInputRef = (0, import_element42.useRef)(null);
  const updateDateRange = (0, import_element42.useCallback)(
    (fromDate, toDate2) => {
      if (fromDate && toDate2) {
        onChangeCallback([
          formatDate(fromDate),
          formatDate(toDate2)
        ]);
      } else if (!fromDate && !toDate2) {
        onChangeCallback(void 0);
      }
    },
    [onChangeCallback]
  );
  const onSelectCalendarRange = (0, import_element42.useCallback)(
    (newRange) => {
      updateDateRange(newRange?.from, newRange?.to);
      setSelectedPresetId(null);
      setIsTouched(true);
    },
    [updateDateRange]
  );
  const handlePresetClick = (0, import_element42.useCallback)(
    (preset) => {
      const [startDate, endDate] = preset.getValue();
      setCalendarMonth(startDate);
      updateDateRange(startDate, endDate);
      setSelectedPresetId(preset.id);
      setIsTouched(true);
    },
    [updateDateRange]
  );
  const handleManualDateChange = (0, import_element42.useCallback)(
    (fromOrTo, newValue) => {
      const [currentFrom, currentTo] = value || [
        void 0,
        void 0
      ];
      const updatedFrom = fromOrTo === "from" ? newValue : currentFrom;
      const updatedTo = fromOrTo === "to" ? newValue : currentTo;
      updateDateRange(updatedFrom, updatedTo);
      if (newValue) {
        const parsedDate = parseDate(newValue);
        if (parsedDate) {
          setCalendarMonth(parsedDate);
        }
      }
      setSelectedPresetId(null);
      setIsTouched(true);
    },
    [value, updateDateRange]
  );
  const { timezone } = (0, import_date4.getSettings)();
  const displayLabel = field.isValid?.required ? `${label} (${(0, import_i18n34.__)("Required")})` : label;
  return /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
    ValidatedDateControl,
    {
      field,
      validity,
      inputRefs: [fromInputRef, toInputRef],
      isTouched,
      setIsTouched,
      children: /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
        import_components34.BaseControl,
        {
          id,
          className: "dataviews-controls__date",
          label: displayLabel,
          hideLabelFromVision,
          children: /* @__PURE__ */ (0, import_jsx_runtime77.jsxs)(Stack, { direction: "column", gap: "md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime77.jsxs)(
              Stack,
              {
                direction: "row",
                gap: "xs",
                wrap: "wrap",
                justify: "flex-start",
                children: [
                  DATE_RANGE_PRESETS.map((preset) => {
                    const isSelected2 = selectedPresetId === preset.id;
                    return /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
                      import_components34.Button,
                      {
                        className: "dataviews-controls__date-preset",
                        variant: "tertiary",
                        isPressed: isSelected2,
                        size: "small",
                        onClick: () => handlePresetClick(preset),
                        children: preset.label
                      },
                      preset.id
                    );
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
                    import_components34.Button,
                    {
                      className: "dataviews-controls__date-preset",
                      variant: "tertiary",
                      isPressed: !selectedPresetId,
                      size: "small",
                      accessibleWhenDisabled: false,
                      disabled: !!selectedPresetId,
                      children: (0, import_i18n34.__)("Custom")
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime77.jsxs)(
              Stack,
              {
                direction: "row",
                gap: "xs",
                justify: "space-between",
                className: "dataviews-controls__date-range-inputs",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
                    import_components34.__experimentalInputControl,
                    {
                      __next40pxDefaultSize: true,
                      ref: fromInputRef,
                      type: "date",
                      label: (0, import_i18n34.__)("From"),
                      hideLabelFromVision: true,
                      value: value?.[0],
                      onChange: (newValue) => handleManualDateChange("from", newValue),
                      required: !!field.isValid?.required
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
                    import_components34.__experimentalInputControl,
                    {
                      __next40pxDefaultSize: true,
                      ref: toInputRef,
                      type: "date",
                      label: (0, import_i18n34.__)("To"),
                      hideLabelFromVision: true,
                      value: value?.[1],
                      onChange: (newValue) => handleManualDateChange("to", newValue),
                      required: !!field.isValid?.required
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
              DateRangeCalendar,
              {
                style: { width: "100%" },
                selected: selectedRange,
                onSelect: onSelectCalendarRange,
                month: calendarMonth,
                onMonthChange: setCalendarMonth,
                timeZone: timezone.string || void 0,
                weekStartsOn
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
  operator,
  validity
}) {
  if (operator === OPERATOR_IN_THE_PAST || operator === OPERATOR_OVER) {
    return /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
      CalendarDateRangeControl,
      {
        data,
        field,
        onChange,
        hideLabelFromVision,
        validity
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime77.jsx)(
    CalendarDateControl,
    {
      data,
      field,
      onChange,
      hideLabelFromVision,
      validity
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/email.mjs
var import_components36 = __toESM(require_components(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/utils/validated-input.mjs
var import_components35 = __toESM(require_components(), 1);
var import_element43 = __toESM(require_element(), 1);
var import_jsx_runtime78 = __toESM(require_jsx_runtime(), 1);
var { ValidatedInputControl: ValidatedInputControl2 } = unlock(import_components35.privateApis);
function ValidatedText({
  data,
  field,
  onChange,
  hideLabelFromVision,
  type,
  prefix,
  suffix,
  validity
}) {
  const { label, placeholder, description, getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data });
  const onChangeControl = (0, import_element43.useCallback)(
    (newValue) => onChange(
      setValue({
        item: data,
        value: newValue
      })
    ),
    [data, setValue, onChange]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime78.jsx)(
    ValidatedInputControl2,
    {
      required: !!isValid2.required,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      placeholder,
      value: value ?? "",
      help: description,
      onChange: onChangeControl,
      hideLabelFromVision,
      type,
      prefix,
      suffix,
      pattern: isValid2.pattern ? isValid2.pattern.constraint : void 0,
      minLength: isValid2.minLength ? isValid2.minLength.constraint : void 0,
      maxLength: isValid2.maxLength ? isValid2.maxLength.constraint : void 0,
      __next40pxDefaultSize: true
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/email.mjs
var import_jsx_runtime79 = __toESM(require_jsx_runtime(), 1);
function Email({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime79.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        validity,
        type: "email",
        prefix: /* @__PURE__ */ (0, import_jsx_runtime79.jsx)(import_components36.__experimentalInputControlPrefixWrapper, { variant: "icon", children: /* @__PURE__ */ (0, import_jsx_runtime79.jsx)(import_components36.Icon, { icon: envelope_default }) })
      }
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/telephone.mjs
var import_components37 = __toESM(require_components(), 1);
var import_jsx_runtime80 = __toESM(require_jsx_runtime(), 1);
function Telephone({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime80.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        validity,
        type: "tel",
        prefix: /* @__PURE__ */ (0, import_jsx_runtime80.jsx)(import_components37.__experimentalInputControlPrefixWrapper, { variant: "icon", children: /* @__PURE__ */ (0, import_jsx_runtime80.jsx)(import_components37.Icon, { icon: mobile_default }) })
      }
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/url.mjs
var import_components38 = __toESM(require_components(), 1);
var import_jsx_runtime81 = __toESM(require_jsx_runtime(), 1);
function Url({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime81.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        validity,
        type: "url",
        prefix: /* @__PURE__ */ (0, import_jsx_runtime81.jsx)(import_components38.__experimentalInputControlPrefixWrapper, { variant: "icon", children: /* @__PURE__ */ (0, import_jsx_runtime81.jsx)(import_components38.Icon, { icon: link_default }) })
      }
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/utils/validated-number.mjs
var import_components39 = __toESM(require_components(), 1);
var import_element44 = __toESM(require_element(), 1);
var import_i18n35 = __toESM(require_i18n(), 1);
var import_jsx_runtime82 = __toESM(require_jsx_runtime(), 1);
var { ValidatedNumberControl } = unlock(import_components39.privateApis);
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
  const [min = "", max = ""] = value;
  const onChangeMin = (0, import_element44.useCallback)(
    (newValue) => onChange([toNumberOrEmpty(newValue), max]),
    [onChange, max]
  );
  const onChangeMax = (0, import_element44.useCallback)(
    (newValue) => onChange([min, toNumberOrEmpty(newValue)]),
    [onChange, min]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime82.jsx)(
    import_components39.BaseControl,
    {
      help: (0, import_i18n35.__)("The max. value must be greater than the min. value."),
      children: /* @__PURE__ */ (0, import_jsx_runtime82.jsxs)(import_components39.Flex, { direction: "row", gap: 4, children: [
        /* @__PURE__ */ (0, import_jsx_runtime82.jsx)(
          import_components39.__experimentalNumberControl,
          {
            label: (0, import_i18n35.__)("Min."),
            value: min,
            max: max ? Number(max) - step : void 0,
            onChange: onChangeMin,
            __next40pxDefaultSize: true,
            hideLabelFromVision,
            step
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime82.jsx)(
          import_components39.__experimentalNumberControl,
          {
            label: (0, import_i18n35.__)("Max."),
            value: max,
            min: min ? Number(min) + step : void 0,
            onChange: onChangeMax,
            __next40pxDefaultSize: true,
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
  operator,
  validity
}) {
  const decimals = field.format?.decimals ?? 0;
  const step = Math.pow(10, Math.abs(decimals) * -1);
  const { label, description, getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data }) ?? "";
  const onChangeControl = (0, import_element44.useCallback)(
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
  const onChangeBetweenControls = (0, import_element44.useCallback)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime82.jsx)(
      BetweenControls,
      {
        value: valueBetween,
        onChange: onChangeBetweenControls,
        hideLabelFromVision,
        step
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime82.jsx)(
    ValidatedNumberControl,
    {
      required: !!isValid2.required,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      help: description,
      value,
      onChange: onChangeControl,
      __next40pxDefaultSize: true,
      hideLabelFromVision,
      step,
      min: isValid2.min ? isValid2.min.constraint : void 0,
      max: isValid2.max ? isValid2.max.constraint : void 0
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/integer.mjs
var import_jsx_runtime83 = __toESM(require_jsx_runtime(), 1);
function Integer(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime83.jsx)(ValidatedNumber, { ...props });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/number.mjs
var import_jsx_runtime84 = __toESM(require_jsx_runtime(), 1);
function Number2(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime84.jsx)(ValidatedNumber, { ...props });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/radio.mjs
var import_components40 = __toESM(require_components(), 1);
var import_element45 = __toESM(require_element(), 1);
var import_jsx_runtime85 = __toESM(require_jsx_runtime(), 1);
var { ValidatedRadioControl } = unlock(import_components40.privateApis);
function Radio({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  const { label, description, getValue, setValue, isValid: isValid2 } = field;
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  const value = getValue({ item: data });
  const onChangeControl = (0, import_element45.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime85.jsx)(import_components40.Spinner, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime85.jsx)(
    ValidatedRadioControl,
    {
      required: !!field.isValid?.required,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      help: description,
      onChange: onChangeControl,
      options: elements,
      selected: value,
      hideLabelFromVision
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/select.mjs
var import_components41 = __toESM(require_components(), 1);
var import_element46 = __toESM(require_element(), 1);
var import_jsx_runtime86 = __toESM(require_jsx_runtime(), 1);
var { ValidatedSelectControl } = unlock(import_components41.privateApis);
function Select({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  const { type, label, description, getValue, setValue, isValid: isValid2 } = field;
  const isMultiple = type === "array";
  const value = getValue({ item: data }) ?? (isMultiple ? [] : "");
  const onChangeControl = (0, import_element46.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime86.jsx)(import_components41.Spinner, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime86.jsx)(
    ValidatedSelectControl,
    {
      required: !!field.isValid?.required,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      value,
      help: description,
      options: elements,
      onChange: onChangeControl,
      __next40pxDefaultSize: true,
      hideLabelFromVision,
      multiple: isMultiple
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/text.mjs
var import_element47 = __toESM(require_element(), 1);
var import_jsx_runtime87 = __toESM(require_jsx_runtime(), 1);
function Text2({
  data,
  field,
  onChange,
  hideLabelFromVision,
  config,
  validity
}) {
  const { prefix, suffix } = config || {};
  return /* @__PURE__ */ (0, import_jsx_runtime87.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        validity,
        prefix: prefix ? (0, import_element47.createElement)(prefix) : void 0,
        suffix: suffix ? (0, import_element47.createElement)(suffix) : void 0
      }
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/toggle.mjs
var import_components42 = __toESM(require_components(), 1);
var import_element48 = __toESM(require_element(), 1);
var import_jsx_runtime88 = __toESM(require_jsx_runtime(), 1);
var { ValidatedToggleControl } = unlock(import_components42.privateApis);
function Toggle({
  field,
  onChange,
  data,
  hideLabelFromVision,
  validity
}) {
  const { label, description, getValue, setValue, isValid: isValid2 } = field;
  const onChangeControl = (0, import_element48.useCallback)(() => {
    onChange(
      setValue({ item: data, value: !getValue({ item: data }) })
    );
  }, [onChange, setValue, data, getValue]);
  return /* @__PURE__ */ (0, import_jsx_runtime88.jsx)(
    ValidatedToggleControl,
    {
      required: !!isValid2.required,
      customValidity: getCustomValidity(isValid2, validity),
      hidden: hideLabelFromVision,
      label,
      help: description,
      checked: getValue({ item: data }),
      onChange: onChangeControl
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/textarea.mjs
var import_components43 = __toESM(require_components(), 1);
var import_element49 = __toESM(require_element(), 1);
var import_jsx_runtime89 = __toESM(require_jsx_runtime(), 1);
var { ValidatedTextareaControl } = unlock(import_components43.privateApis);
function Textarea({
  data,
  field,
  onChange,
  hideLabelFromVision,
  config,
  validity
}) {
  const { rows = 4 } = config || {};
  const { label, placeholder, description, setValue, isValid: isValid2 } = field;
  const value = field.getValue({ item: data });
  const onChangeControl = (0, import_element49.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime89.jsx)(
    ValidatedTextareaControl,
    {
      required: !!isValid2.required,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      placeholder,
      value: value ?? "",
      help: description,
      onChange: onChangeControl,
      rows,
      minLength: isValid2.minLength ? isValid2.minLength.constraint : void 0,
      maxLength: isValid2.maxLength ? isValid2.maxLength.constraint : void 0,
      __next40pxDefaultSize: true,
      hideLabelFromVision
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/toggle-group.mjs
var import_components44 = __toESM(require_components(), 1);
var import_element50 = __toESM(require_element(), 1);
var import_jsx_runtime90 = __toESM(require_jsx_runtime(), 1);
var { ValidatedToggleGroupControl } = unlock(import_components44.privateApis);
function ToggleGroup({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  const { getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data });
  const onChangeControl = (0, import_element50.useCallback)(
    (newValue) => onChange(setValue({ item: data, value: newValue })),
    [data, onChange, setValue]
  );
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(import_components44.Spinner, {});
  }
  if (elements.length === 0) {
    return null;
  }
  const selectedOption = elements.find((el) => el.value === value);
  return /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(
    ValidatedToggleGroupControl,
    {
      required: !!field.isValid?.required,
      customValidity: getCustomValidity(isValid2, validity),
      __next40pxDefaultSize: true,
      isBlock: true,
      label: field.label,
      help: selectedOption?.description || field.description,
      onChange: onChangeControl,
      value,
      hideLabelFromVision,
      children: elements.map((el) => /* @__PURE__ */ (0, import_jsx_runtime90.jsx)(
        import_components44.__experimentalToggleGroupControlOption,
        {
          label: el.label,
          value: el.value
        },
        el.value
      ))
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/array.mjs
var import_components45 = __toESM(require_components(), 1);
var import_element51 = __toESM(require_element(), 1);
var import_jsx_runtime91 = __toESM(require_jsx_runtime(), 1);
var { ValidatedFormTokenField } = unlock(import_components45.privateApis);
function ArrayControl({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  const { label, placeholder, getValue, setValue, isValid: isValid2 } = field;
  const value = getValue({ item: data });
  const { elements, isLoading } = useElements({
    elements: field.elements,
    getElements: field.getElements
  });
  const arrayValueAsElements = (0, import_element51.useMemo)(
    () => Array.isArray(value) ? value.map((token) => {
      const element = elements?.find(
        (suggestion) => suggestion.value === token
      );
      return element || { value: token, label: token };
    }) : [],
    [value, elements]
  );
  const onChangeControl = (0, import_element51.useCallback)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime91.jsx)(import_components45.Spinner, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime91.jsx)(
    ValidatedFormTokenField,
    {
      required: !!isValid2?.required,
      customValidity: getCustomValidity(isValid2, validity),
      label: hideLabelFromVision ? void 0 : label,
      value: arrayValueAsElements,
      onChange: onChangeControl,
      placeholder,
      suggestions: elements?.map((element) => element.value),
      __experimentalValidateInput: (token) => {
        if (field.isValid?.elements && elements) {
          return elements.some(
            (element) => element.value === token || element.label === token
          );
        }
        return true;
      },
      __experimentalExpandOnFocus: elements && elements.length > 0,
      __experimentalShowHowTo: !field.isValid?.elements,
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
          return /* @__PURE__ */ (0, import_jsx_runtime91.jsx)("span", { children: element?.label || item });
        }
        return /* @__PURE__ */ (0, import_jsx_runtime91.jsx)("span", { children: item });
      }
    }
  );
}

// ../../../node_modules/.pnpm/colord@2.9.3/node_modules/colord/index.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/color.mjs
var import_components46 = __toESM(require_components(), 1);
var import_element52 = __toESM(require_element(), 1);
var import_jsx_runtime92 = __toESM(require_jsx_runtime(), 1);
var { ValidatedInputControl: ValidatedInputControl3, Picker } = unlock(import_components46.privateApis);
var ColorPicker = ({
  color,
  onColorChange
}) => {
  const validColor = color && w(color).isValid() ? color : "#ffffff";
  return /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
    import_components46.Dropdown,
    {
      renderToggle: ({ onToggle, isOpen }) => /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(import_components46.__experimentalInputControlPrefixWrapper, { variant: "icon", children: /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
        "button",
        {
          type: "button",
          onClick: onToggle,
          style: {
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: validColor,
            border: "1px solid #ddd",
            cursor: "pointer",
            outline: isOpen ? "2px solid #007cba" : "none",
            outlineOffset: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            margin: 0
          },
          "aria-label": "Open color picker"
        }
      ) }),
      renderContent: () => /* @__PURE__ */ (0, import_jsx_runtime92.jsx)("div", { style: { padding: "16px" }, children: /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
        Picker,
        {
          color: w(validColor),
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
  validity
}) {
  const { label, placeholder, description, setValue, isValid: isValid2 } = field;
  const value = field.getValue({ item: data }) || "";
  const handleColorChange = (0, import_element52.useCallback)(
    (colorObject) => {
      onChange(setValue({ item: data, value: colorObject.toHex() }));
    },
    [data, onChange, setValue]
  );
  const handleInputChange = (0, import_element52.useCallback)(
    (newValue) => {
      onChange(setValue({ item: data, value: newValue || "" }));
    },
    [data, onChange, setValue]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
    ValidatedInputControl3,
    {
      required: !!field.isValid?.required,
      customValidity: getCustomValidity(isValid2, validity),
      label,
      placeholder,
      value,
      help: description,
      onChange: handleInputChange,
      hideLabelFromVision,
      type: "text",
      prefix: /* @__PURE__ */ (0, import_jsx_runtime92.jsx)(
        ColorPicker,
        {
          color: value,
          onColorChange: handleColorChange
        }
      )
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/password.mjs
var import_components47 = __toESM(require_components(), 1);
var import_element53 = __toESM(require_element(), 1);
var import_i18n36 = __toESM(require_i18n(), 1);
var import_jsx_runtime93 = __toESM(require_jsx_runtime(), 1);
function Password({
  data,
  field,
  onChange,
  hideLabelFromVision,
  validity
}) {
  const [isVisible2, setIsVisible] = (0, import_element53.useState)(false);
  const toggleVisibility = (0, import_element53.useCallback)(() => {
    setIsVisible((prev) => !prev);
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(
    ValidatedText,
    {
      ...{
        data,
        field,
        onChange,
        hideLabelFromVision,
        validity,
        type: isVisible2 ? "text" : "password",
        suffix: /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(import_components47.__experimentalInputControlSuffixWrapper, { variant: "control", children: /* @__PURE__ */ (0, import_jsx_runtime93.jsx)(
          import_components47.Button,
          {
            icon: isVisible2 ? unseen_default : seen_default,
            onClick: toggleVisibility,
            size: "small",
            label: isVisible2 ? (0, import_i18n36.__)("Hide password") : (0, import_i18n36.__)("Show password")
          }
        ) })
      }
    }
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/has-elements.mjs
function hasElements(field) {
  return Array.isArray(field.elements) && field.elements.length > 0 || typeof field.getElements === "function";
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/components/dataform-controls/index.mjs
var import_jsx_runtime94 = __toESM(require_jsx_runtime(), 1);
var FORM_CONTROLS = {
  array: ArrayControl,
  checkbox: Checkbox,
  color: Color,
  combobox: Combobox3,
  datetime: DateTime,
  date: DateControl,
  email: Email,
  telephone: Telephone,
  url: Url,
  integer: Integer,
  number: Number2,
  password: Password,
  radio: Radio,
  select: Select,
  text: Text2,
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
    return /* @__PURE__ */ (0, import_jsx_runtime94.jsx)(BaseControlType, { ...props, config: controlConfig });
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
    return getControlByType("select");
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/get-filter-by.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/get-value-from-id.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/set-value-from-id.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/email.mjs
var import_i18n37 = __toESM(require_i18n(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/render-from-elements.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/render-default.mjs
var import_jsx_runtime95 = __toESM(require_jsx_runtime(), 1);
function render({
  item,
  field
}) {
  if (field.hasElements) {
    return /* @__PURE__ */ (0, import_jsx_runtime95.jsx)(RenderFromElements, { item, field });
  }
  return field.getValueFormatted({ item, field });
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/sort-text.mjs
var sort_text_default = (a2, b2, direction) => {
  return direction === "asc" ? a2.localeCompare(b2) : b2.localeCompare(a2);
};

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/is-valid-required.mjs
function isValidRequired(item, field) {
  const value = field.getValue({ item });
  return ![void 0, "", null].includes(value);
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/is-valid-min-length.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/is-valid-max-length.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/is-valid-pattern.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/is-valid-elements.mjs
function isValidElements(item, field) {
  const elements = field.elements ?? [];
  const validValues = elements.map((el) => el.value);
  if (validValues.length === 0) {
    return true;
  }
  const value = field.getValue({ item });
  return [].concat(value).every((v2) => validValues.includes(v2));
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/get-value-formatted-default.mjs
function getValueFormatted({
  item,
  field
}) {
  return field.getValue({ item });
}
var get_value_formatted_default_default = getValueFormatted;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/email.mjs
var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
function isValidCustom(item, field) {
  const value = field.getValue({ item });
  if (![void 0, "", null].includes(value) && !emailRegex.test(value)) {
    return (0, import_i18n37.__)("Value must be a valid email address.");
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/integer.mjs
var import_i18n38 = __toESM(require_i18n(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/sort-number.mjs
var sort_number_default = (a2, b2, direction) => {
  return direction === "asc" ? a2 - b2 : b2 - a2;
};

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/is-valid-min.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/is-valid-max.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/integer.mjs
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
    return (0, import_i18n38.__)("Value must be an integer.");
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/number.mjs
var import_i18n39 = __toESM(require_i18n(), 1);
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
function isEmpty2(value) {
  return value === "" || value === void 0 || value === null;
}
function isValidCustom3(item, field) {
  const value = field.getValue({ item });
  if (!isEmpty2(value) && !Number.isFinite(value)) {
    return (0, import_i18n39.__)("Value must be a number.");
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/text.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/datetime.mjs
var import_date6 = __toESM(require_date(), 1);
var format4 = {
  datetime: (0, import_date6.getSettings)().formats.datetime,
  weekStartsOn: (0, import_date6.getSettings)().l10n.startOfWeek
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
  return (0, import_date6.dateI18n)(formatDatetime.datetime, (0, import_date6.getDate)(value));
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
    elements: isValidElements
  }
};

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/date.mjs
var import_date7 = __toESM(require_date(), 1);
var format5 = {
  date: (0, import_date7.getSettings)().formats.date,
  weekStartsOn: (0, import_date7.getSettings)().l10n.startOfWeek
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
  return (0, import_date7.dateI18n)(formatDate2.date, (0, import_date7.getDate)(value));
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
    elements: isValidElements
  }
};

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/boolean.mjs
var import_i18n40 = __toESM(require_i18n(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/is-valid-required-for-bool.mjs
function isValidRequiredForBool(item, field) {
  const value = field.getValue({ item });
  return value === true;
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/boolean.mjs
function getValueFormatted6({
  item,
  field
}) {
  const value = field.getValue({ item });
  if (value === true) {
    return (0, import_i18n40.__)("True");
  }
  if (value === false) {
    return (0, import_i18n40.__)("False");
  }
  return "";
}
function isValidCustom4(item, field) {
  const value = field.getValue({ item });
  if (![void 0, "", null].includes(value) && ![true, false].includes(value)) {
    return (0, import_i18n40.__)("Value must be true, false, or undefined");
  }
  return null;
}
var sort3 = (a2, b2, direction) => {
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
  sort: sort3,
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
  getValueFormatted: getValueFormatted6
};

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/media.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/array.mjs
var import_i18n41 = __toESM(require_i18n(), 1);

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/is-valid-required-for-array.mjs
function isValidRequiredForArray(item, field) {
  const value = field.getValue({ item });
  return Array.isArray(value) && value.length > 0 && value.every(
    (element) => ![void 0, "", null].includes(element)
  );
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/array.mjs
function getValueFormatted7({
  item,
  field
}) {
  const value = field.getValue({ item });
  const arr = Array.isArray(value) ? value : [];
  return arr.join(", ");
}
function render2({ item, field }) {
  return getValueFormatted7({ item, field });
}
function isValidCustom5(item, field) {
  const value = field.getValue({ item });
  if (![void 0, "", null].includes(value) && !Array.isArray(value)) {
    return (0, import_i18n41.__)("Value must be an array.");
  }
  if (!value.every((v2) => typeof v2 === "string")) {
    return (0, import_i18n41.__)("Every value must be a string.");
  }
  return null;
}
var sort4 = (a2, b2, direction) => {
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
  sort: sort4,
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
  getValueFormatted: getValueFormatted7,
  validate: {
    required: isValidRequiredForArray,
    elements: isValidElements,
    custom: isValidCustom5
  }
};

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/password.mjs
function getValueFormatted8({
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
  getValueFormatted: getValueFormatted8,
  validate: {
    required: isValidRequired,
    pattern: isValidPattern,
    minLength: isValidMinLength,
    maxLength: isValidMaxLength,
    elements: isValidElements
  }
};

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/telephone.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/color.mjs
var import_i18n42 = __toESM(require_i18n(), 1);
var import_jsx_runtime96 = __toESM(require_jsx_runtime(), 1);
function render3({ item, field }) {
  if (field.hasElements) {
    return /* @__PURE__ */ (0, import_jsx_runtime96.jsx)(RenderFromElements, { item, field });
  }
  const value = get_value_formatted_default_default({ item, field });
  if (!value || !w(value).isValid()) {
    return value;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime96.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime96.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime96.jsx)("span", { children: value })
  ] });
}
function isValidCustom6(item, field) {
  const value = field.getValue({ item });
  if (![void 0, "", null].includes(value) && !w(value).isValid()) {
    return (0, import_i18n42.__)("Value must be a valid color.");
  }
  return null;
}
var sort5 = (a2, b2, direction) => {
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
  sort: sort5,
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/url.mjs
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/no-type.mjs
var sort6 = (a2, b2, direction) => {
  if (typeof a2 === "number" && typeof b2 === "number") {
    return sort_number_default(a2, b2, direction);
  }
  return sort_text_default(a2, b2, direction);
};
var no_type_default = {
  // type: no type for this one
  render,
  Edit: null,
  sort: sort6,
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/get-is-valid.mjs
function getIsValid(field, fieldType) {
  let required;
  if (field.isValid?.required === true && fieldType.validate.required !== void 0) {
    required = {
      constraint: true,
      validate: fieldType.validate.required
    };
  }
  let elements;
  if ((field.isValid?.elements === true || // elements is enabled unless the field opts-out
  field.isValid?.elements === void 0 && (!!field.elements || !!field.getElements)) && fieldType.validate.elements !== void 0) {
    elements = {
      constraint: true,
      validate: fieldType.validate.elements
    };
  }
  let min;
  if (typeof field.isValid?.min === "number" && fieldType.validate.min !== void 0) {
    min = {
      constraint: field.isValid.min,
      validate: fieldType.validate.min
    };
  }
  let max;
  if (typeof field.isValid?.max === "number" && fieldType.validate.max !== void 0) {
    max = {
      constraint: field.isValid.max,
      validate: fieldType.validate.max
    };
  }
  let minLength;
  if (typeof field.isValid?.minLength === "number" && fieldType.validate.minLength !== void 0) {
    minLength = {
      constraint: field.isValid.minLength,
      validate: fieldType.validate.minLength
    };
  }
  let maxLength;
  if (typeof field.isValid?.maxLength === "number" && fieldType.validate.maxLength !== void 0) {
    maxLength = {
      constraint: field.isValid.maxLength,
      validate: fieldType.validate.maxLength
    };
  }
  let pattern;
  if (field.isValid?.pattern !== void 0 && fieldType.validate.pattern !== void 0) {
    pattern = {
      constraint: field.isValid?.pattern,
      validate: fieldType.validate.pattern
    };
  }
  const custom = field.isValid?.custom ?? fieldType.validate.custom;
  return {
    required,
    elements,
    min,
    max,
    minLength,
    maxLength,
    pattern,
    custom
  };
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/get-filter.mjs
function getFilter(fieldType) {
  return fieldType.validOperators.reduce((accumulator, operator) => {
    const operatorObj = getOperatorByName(operator);
    if (operatorObj?.filter) {
      accumulator[operator] = operatorObj.filter;
    }
    return accumulator;
  }, {});
}

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/utils/get-format.mjs
function getFormat(field, fieldType) {
  return {
    ...fieldType.format,
    ...field.format
  };
}
var get_format_default = getFormat;

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/field-types/index.mjs
function getFieldTypeByName(type) {
  const found = [
    email_default,
    integer_default,
    number_default,
    text_default,
    datetime_default,
    date_default,
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
    const sort7 = function(a2, b2, direction) {
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
      enableHiding: field.enableHiding ?? true,
      readOnly: field.readOnly ?? false,
      // The type provides defaults for the following props
      type: fieldType.type,
      render: field.render ?? fieldType.render,
      Edit: getControl(field, fieldType.Edit),
      sort: sort7,
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

// ../../../node_modules/.pnpm/@wordpress+dataviews@11.3.0_@types+react@18.3.26_react@18.3.1_stylelint@16.26.1/node_modules/@wordpress/dataviews/build-module/dataviews/index.mjs
var import_jsx_runtime97 = __toESM(require_jsx_runtime(), 1);
var defaultGetItemId = (item) => item.id;
var defaultIsItemClickable = () => true;
var EMPTY_ARRAY6 = [];
var dataViewsLayouts = VIEW_LAYOUTS.filter(
  (viewLayout) => !viewLayout.isPicker
);
function DefaultUI({
  header,
  search = true,
  searchLabel = void 0
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime97.jsxs)(import_jsx_runtime97.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime97.jsxs)(
      Stack,
      {
        direction: "row",
        align: "top",
        justify: "space-between",
        className: "dataviews__view-actions",
        gap: "2xs",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime97.jsxs)(
            Stack,
            {
              direction: "row",
              justify: "start",
              gap: "xs",
              className: "dataviews__search",
              children: [
                search && /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(dataviews_search_default, { label: searchLabel }),
                /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(toggle_default, {})
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime97.jsxs)(Stack, { direction: "row", gap: "2xs", style: { flexShrink: 0 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(dataviews_view_config_default, {}),
            header
          ] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(filters_toggled_default, { className: "dataviews-filters__container" }),
    /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(DataViewsLayout, {}),
    /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(DataViewsFooter, {})
  ] });
}
function DataViews({
  view,
  onChangeView,
  fields,
  search = true,
  searchLabel = void 0,
  actions = EMPTY_ARRAY6,
  data,
  getItemId = defaultGetItemId,
  getItemLevel,
  isLoading = false,
  paginationInfo,
  defaultLayouts: defaultLayoutsProperty,
  selection: selectionProperty,
  onChangeSelection,
  onClickItem,
  renderItemLink,
  isItemClickable = defaultIsItemClickable,
  header,
  children,
  config = { perPageSizes: [10, 20, 50, 100] },
  empty
}) {
  const { infiniteScrollHandler } = paginationInfo;
  const containerRef = (0, import_element54.useRef)(null);
  const [containerWidth, setContainerWidth] = (0, import_element54.useState)(0);
  const resizeObserverRef = (0, import_compose12.useResizeObserver)(
    (resizeObserverEntries) => {
      setContainerWidth(
        resizeObserverEntries[0].borderBoxSize[0].inlineSize
      );
    },
    { box: "border-box" }
  );
  const [selectionState, setSelectionState] = (0, import_element54.useState)([]);
  const isUncontrolled = selectionProperty === void 0 || onChangeSelection === void 0;
  const selection = isUncontrolled ? selectionState : selectionProperty;
  const [openedFilter, setOpenedFilter] = (0, import_element54.useState)(null);
  function setSelectionWithChange(value) {
    const newValue = typeof value === "function" ? value(selection) : value;
    if (isUncontrolled) {
      setSelectionState(newValue);
    }
    if (onChangeSelection) {
      onChangeSelection(newValue);
    }
  }
  const _fields = (0, import_element54.useMemo)(() => normalizeFields(fields), [fields]);
  const _selection = (0, import_element54.useMemo)(() => {
    return selection.filter(
      (id) => data.some((item) => getItemId(item) === id)
    );
  }, [selection, data, getItemId]);
  const filters = use_filters_default(_fields, view);
  const hasPrimaryOrLockedFilters = (0, import_element54.useMemo)(
    () => (filters || []).some(
      (filter) => filter.isPrimary || filter.isLocked
    ),
    [filters]
  );
  const [isShowingFilter, setIsShowingFilter] = (0, import_element54.useState)(
    hasPrimaryOrLockedFilters
  );
  (0, import_element54.useEffect)(() => {
    if (hasPrimaryOrLockedFilters && !isShowingFilter) {
      setIsShowingFilter(true);
    }
  }, [hasPrimaryOrLockedFilters, isShowingFilter]);
  (0, import_element54.useEffect)(() => {
    if (!view.infiniteScrollEnabled || !containerRef.current) {
      return;
    }
    const handleScroll = (0, import_compose12.throttle)((event) => {
      const target = event.target;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        infiniteScrollHandler?.();
      }
    }, 100);
    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, [infiniteScrollHandler, view.infiniteScrollEnabled]);
  const defaultLayouts2 = (0, import_element54.useMemo)(
    () => Object.fromEntries(
      Object.entries(defaultLayoutsProperty).filter(
        ([layoutType]) => {
          return dataViewsLayouts.some(
            (viewLayout) => viewLayout.type === layoutType
          );
        }
      )
    ),
    [defaultLayoutsProperty]
  );
  if (!defaultLayouts2[view.type]) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(
    dataviews_context_default.Provider,
    {
      value: {
        view,
        onChangeView,
        fields: _fields,
        actions,
        data,
        isLoading,
        paginationInfo,
        selection: _selection,
        onChangeSelection: setSelectionWithChange,
        openedFilter,
        setOpenedFilter,
        getItemId,
        getItemLevel,
        isItemClickable,
        onClickItem,
        renderItemLink,
        containerWidth,
        containerRef,
        resizeObserverRef,
        defaultLayouts: defaultLayouts2,
        filters,
        isShowingFilter,
        setIsShowingFilter,
        config,
        empty,
        hasInfiniteScrollHandler: !!infiniteScrollHandler
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime97.jsx)("div", { className: "dataviews-wrapper", ref: containerRef, children: children ?? /* @__PURE__ */ (0, import_jsx_runtime97.jsx)(
        DefaultUI,
        {
          header,
          search,
          searchLabel
        }
      ) })
    }
  );
}
var DataViewsSubComponents = DataViews;
DataViewsSubComponents.BulkActionToolbar = BulkActionsFooter;
DataViewsSubComponents.Filters = filters_default;
DataViewsSubComponents.FiltersToggled = filters_toggled_default;
DataViewsSubComponents.FiltersToggle = toggle_default;
DataViewsSubComponents.Layout = DataViewsLayout;
DataViewsSubComponents.LayoutSwitcher = ViewTypeMenu;
DataViewsSubComponents.Pagination = DataViewsPagination;
DataViewsSubComponents.Search = dataviews_search_default;
DataViewsSubComponents.ViewConfig = DataviewsViewConfigDropdown;
DataViewsSubComponents.Footer = DataViewsFooter;
var dataviews_default = DataViewsSubComponents;

// routes/forms/stage.tsx
var import_date9 = __toESM(require_date());
var import_element62 = __toESM(require_element());
var import_i18n49 = __toESM(require_i18n());
import { useSearch, useNavigate as useNavigate2 } from "@wordpress/route";

// ../../js-packages/analytics/index.jsx
var import_debug = __toESM(require_browser(), 1);
var debug = (0, import_debug.default)("dops:analytics");
var _superProps;
var _user;
window._tkq = window._tkq || [];
window.ga = window.ga || function() {
  (window.ga.q = window.ga.q || []).push(arguments);
};
window.ga.l = +/* @__PURE__ */ new Date();
function buildQuerystring(group, name) {
  let uriComponent = "";
  if ("object" === typeof group) {
    for (const key in group) {
      uriComponent += "&x_" + encodeURIComponent(key) + "=" + encodeURIComponent(group[key]);
    }
    debug("Bumping stats %o", group);
  } else {
    uriComponent = "&x_" + encodeURIComponent(group) + "=" + encodeURIComponent(name);
    debug('Bumping stat "%s" in group "%s"', name, group);
  }
  return uriComponent;
}
function buildQuerystringNoPrefix(group, name) {
  let uriComponent = "";
  if ("object" === typeof group) {
    for (const key in group) {
      uriComponent += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(group[key]);
    }
    debug("Built stats %o", group);
  } else {
    uriComponent = "&" + encodeURIComponent(group) + "=" + encodeURIComponent(name);
    debug('Built stat "%s" in group "%s"', name, group);
  }
  return uriComponent;
}
var analytics = {
  initialize: function(userId, username, superProps) {
    analytics.setUser(userId, username);
    analytics.setSuperProps(superProps);
    analytics.identifyUser();
  },
  setGoogleAnalyticsEnabled: function(googleAnalyticsEnabled, googleAnalyticsKey = null) {
    this.googleAnalyticsEnabled = googleAnalyticsEnabled;
    this.googleAnalyticsKey = googleAnalyticsKey;
  },
  setMcAnalyticsEnabled: function(mcAnalyticsEnabled) {
    this.mcAnalyticsEnabled = mcAnalyticsEnabled;
  },
  setUser: function(userId, username) {
    _user = { ID: userId, username };
  },
  setSuperProps: function(superProps) {
    _superProps = superProps;
  },
  /**
   * Add global properties to be applied to all "tracks" events.
   * This function will add the new properties, overwrite the existing one.
   * Unlike `setSuperProps()`, it will not replace the whole object.
   *
   * @param {object} props - Super props to add.
   */
  assignSuperProps: function(props) {
    _superProps = Object.assign(_superProps || {}, props);
  },
  mc: {
    bumpStat: function(group, name) {
      const uriComponent = buildQuerystring(group, name);
      if (analytics.mcAnalyticsEnabled) {
        new Image().src = document.location.protocol + "//pixel.wp.com/g.gif?v=wpcom-no-pv" + uriComponent + "&t=" + Math.random();
      }
    },
    bumpStatWithPageView: function(group, name) {
      const uriComponent = buildQuerystringNoPrefix(group, name);
      if (analytics.mcAnalyticsEnabled) {
        new Image().src = document.location.protocol + "//pixel.wp.com/g.gif?v=wpcom" + uriComponent + "&t=" + Math.random();
      }
    }
  },
  // pageView is a wrapper for pageview events across Tracks and GA
  pageView: {
    record: function(urlPath, pageTitle) {
      analytics.tracks.recordPageView(urlPath);
      analytics.ga.recordPageView(urlPath, pageTitle);
    }
  },
  purchase: {
    record: function(transactionId, itemName, itemId, revenue, price, qty, currency) {
      analytics.ga.recordPurchase(transactionId, itemName, itemId, revenue, price, qty, currency);
    }
  },
  tracks: {
    recordEvent: function(eventName, eventProperties) {
      eventProperties = eventProperties || {};
      if (eventName.indexOf("akismet_") !== 0 && eventName.indexOf("jetpack_") !== 0) {
        debug('- Event name must be prefixed by "akismet_" or "jetpack_"');
        return;
      }
      if (_superProps) {
        debug("- Super Props: %o", _superProps);
        eventProperties = Object.assign(eventProperties, _superProps);
      }
      debug(
        'Record event "%s" called with props %s',
        eventName,
        JSON.stringify(eventProperties)
      );
      window._tkq.push(["recordEvent", eventName, eventProperties]);
    },
    recordJetpackClick: function(target) {
      const props = "object" === typeof target ? target : { target };
      analytics.tracks.recordEvent("jetpack_wpa_click", props);
    },
    recordPageView: function(urlPath) {
      analytics.tracks.recordEvent("akismet_page_view", {
        path: urlPath
      });
    },
    setOptOut: function(isOptingOut) {
      debug("Pushing setOptOut: %o", isOptingOut);
      window._tkq.push(["setOptOut", isOptingOut]);
    }
  },
  // Google Analytics usage and event stat tracking
  ga: {
    initialized: false,
    initialize: function() {
      let parameters = {};
      if (!analytics.ga.initialized) {
        if (_user) {
          parameters = {
            userId: "u-" + _user.ID
          };
        }
        window.ga("create", this.googleAnalyticsKey, "auto", parameters);
        analytics.ga.initialized = true;
      }
    },
    recordPageView: function(urlPath, pageTitle) {
      analytics.ga.initialize();
      debug("Recording Page View ~ [URL: " + urlPath + "] [Title: " + pageTitle + "]");
      if (this.googleAnalyticsEnabled) {
        window.ga("set", "page", urlPath);
        window.ga("send", {
          hitType: "pageview",
          page: urlPath,
          title: pageTitle
        });
      }
    },
    recordEvent: function(category, action, label, value) {
      analytics.ga.initialize();
      let debugText = "Recording Event ~ [Category: " + category + "] [Action: " + action + "]";
      if ("undefined" !== typeof label) {
        debugText += " [Option Label: " + label + "]";
      }
      if ("undefined" !== typeof value) {
        debugText += " [Option Value: " + value + "]";
      }
      debug(debugText);
      if (this.googleAnalyticsEnabled) {
        window.ga("send", "event", category, action, label, value);
      }
    },
    recordPurchase: function(transactionId, itemName, itemId, revenue, price, qty, currency) {
      window.ga("require", "ecommerce");
      window.ga("ecommerce:addTransaction", {
        id: transactionId,
        // Transaction ID. Required.
        // 'affiliation': 'Acme Clothing',   // Affiliation or store name.
        revenue,
        // Grand Total.
        // 'tax': '1.29',                     // Tax.
        currency
        // local currency code.
      });
      window.ga("ecommerce:addItem", {
        id: transactionId,
        // Transaction ID. Required.
        name: itemName,
        // Product name. Required.
        sku: itemId,
        // SKU/code.
        // 'category': 'Party Toys',         // Category or variation.
        price,
        // Unit price.
        quantity: qty
        // Quantity.
      });
      window.ga("ecommerce:send");
    }
  },
  identifyUser: function() {
    if (_user) {
      window._tkq.push(["identifyUser", _user.ID, _user.username]);
    }
  },
  setProperties: function(properties) {
    window._tkq.push(["setProperties", properties]);
  },
  clearedIdentity: function() {
    window._tkq.push(["clearIdentity"]);
  }
};
var analytics_default = analytics;

// src/dashboard/components/create-form-button/index.tsx
var import_components48 = __toESM(require_components(), 1);
var import_element56 = __toESM(require_element(), 1);
var import_i18n44 = __toESM(require_i18n(), 1);

// src/dashboard/hooks/use-create-form.ts
var import_element55 = __toESM(require_element(), 1);

// src/hooks/use-config-value.ts
var import_data7 = __toESM(require_data(), 1);

// src/store/config/index.ts
var import_data6 = __toESM(require_data(), 1);

// src/store/config/actions.ts
var actions_exports = {};
__export(actions_exports, {
  invalidateConfig: () => invalidateConfig,
  receiveConfig: () => receiveConfig,
  receiveConfigValue: () => receiveConfigValue,
  refreshConfig: () => refreshConfig,
  setConfigError: () => setConfigError,
  setConfigLoading: () => setConfigLoading
});

// src/store/config/action-types.ts
var RECEIVE_CONFIG = "RECEIVE_CONFIG";
var RECEIVE_CONFIG_VALUE = "RECEIVE_CONFIG_VALUE";
var INVALIDATE_CONFIG = "INVALIDATE_CONFIG";
var SET_CONFIG_LOADING = "SET_CONFIG_LOADING";
var SET_CONFIG_ERROR = "SET_CONFIG_ERROR";

// src/store/config/resolvers.ts
var resolvers_exports = {};
__export(resolvers_exports, {
  getConfig: () => getConfig
});
var import_api_fetch = __toESM(require_api_fetch(), 1);

// src/store/constants.ts
var import_i18n43 = __toESM(require_i18n(), 1);
var UNKNOWN_ERROR_MESSAGE = (0, import_i18n43.__)("Unknown error", "jetpack-forms");

// src/store/config/resolvers.ts
var fetchConfigData = async (dispatch) => {
  dispatch(setConfigLoading(true));
  try {
    const result = await (0, import_api_fetch.default)({
      path: "/wp/v2/feedback/config"
    });
    dispatch(receiveConfig(result));
  } catch (e2) {
    const message2 = e2 instanceof Error ? e2.message : UNKNOWN_ERROR_MESSAGE;
    dispatch(setConfigError(message2));
  } finally {
    dispatch(setConfigLoading(false));
  }
};
function getConfig() {
  return async ({ dispatch }) => {
    await fetchConfigData(dispatch);
  };
}
getConfig.isFulfilled = (state) => {
  return state.config !== null || state.isLoading;
};
getConfig.shouldInvalidate = (action) => {
  return action.type === INVALIDATE_CONFIG;
};

// src/store/config/actions.ts
var receiveConfig = (config) => ({
  type: RECEIVE_CONFIG,
  config
});
var receiveConfigValue = (key, value) => ({
  type: RECEIVE_CONFIG_VALUE,
  key,
  value
});
var invalidateConfig = () => ({
  type: INVALIDATE_CONFIG
});
var setConfigLoading = (isLoading) => ({
  type: SET_CONFIG_LOADING,
  isLoading
});
var setConfigError = (error2) => ({
  type: SET_CONFIG_ERROR,
  error: error2
});
var refreshConfig = () => getConfig();

// src/store/config/reducer.ts
var DEFAULT_STATE = {
  config: null,
  isLoading: false,
  error: null
};
function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_CONFIG_LOADING:
      return {
        ...state,
        isLoading: !!action.isLoading,
        error: action.isLoading ? null : state.error
      };
    case SET_CONFIG_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error ?? UNKNOWN_ERROR_MESSAGE
      };
    case RECEIVE_CONFIG:
      return {
        ...state,
        config: action.config ?? null,
        isLoading: false,
        error: null
      };
    case RECEIVE_CONFIG_VALUE:
      return {
        ...state,
        config: {
          ...state.config ?? {},
          [action.key]: action.value
        }
      };
    case INVALIDATE_CONFIG:
      return {
        ...state,
        config: null,
        isLoading: false
      };
    default:
      return state;
  }
}

// src/store/config/selectors.ts
var selectors_exports = {};
__export(selectors_exports, {
  getConfig: () => getConfig2,
  getConfigError: () => getConfigError,
  getConfigValue: () => getConfigValue,
  isConfigLoading: () => isConfigLoading
});
var getConfig2 = (state) => state.config;
var getConfigValue = (state, key) => state.config?.[key];
var isConfigLoading = (state) => state.isLoading;
var getConfigError = (state) => state.error;

// src/store/config/index.ts
var CONFIG_STORE = "jetpack/forms/config";
var store = (0, import_data6.createReduxStore)(CONFIG_STORE, {
  reducer,
  actions: actions_exports,
  selectors: selectors_exports,
  resolvers: resolvers_exports
});
(0, import_data6.register)(store);

// src/hooks/use-config-value.ts
function useConfigValue(key) {
  return (0, import_data7.useSelect)(
    (select) => {
      const configSelect = select(CONFIG_STORE);
      const config = configSelect.getConfig();
      return config?.[key];
    },
    [key]
  );
}

// src/dashboard/hooks/use-create-form.ts
var openFormLinkInNewTab = (url) => {
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
function useCreateForm() {
  const newFormNonce = useConfigValue("newFormNonce");
  const isCentralFormManagementEnabled = useConfigValue("isCentralFormManagementEnabled");
  const adminUrl = useConfigValue("adminUrl");
  const ajaxUrl = useConfigValue("ajaxUrl");
  const createForm = (0, import_element55.useCallback)(
    async (formPattern) => {
      const data = new FormData();
      data.append("action", "create_new_form");
      data.append("newFormNonce", newFormNonce);
      if (formPattern) {
        data.append("pattern", formPattern);
      }
      const fetchUrl = ajaxUrl || window.ajaxurl;
      const response = await fetch(fetchUrl, { method: "POST", body: data });
      const {
        success,
        post_url: postUrl,
        data: message2
      } = await response.json();
      if (success === false) {
        throw new Error(message2);
      }
      return postUrl;
    },
    [newFormNonce, ajaxUrl]
  );
  const openNewForm = (0, import_element55.useCallback)(
    async ({ formPattern, showPatterns, analyticsEvent }) => {
      try {
        if (isCentralFormManagementEnabled === true) {
          analyticsEvent?.({ formPattern: formPattern ?? "" });
          const url = `${adminUrl || ""}post-new.php?post_type=jetpack_form`;
          openFormLinkInNewTab(url);
          return;
        }
        const postUrl = await createForm(formPattern);
        if (postUrl) {
          analyticsEvent?.({ formPattern });
          const url = `${postUrl}${showPatterns && !formPattern ? "&showJetpackFormsPatterns" : ""}`;
          openFormLinkInNewTab(url);
        }
      } catch (error2) {
        console.error(error2.message);
      }
    },
    [createForm, isCentralFormManagementEnabled, adminUrl]
  );
  return { createForm, openNewForm };
}

// src/dashboard/components/create-form-button/index.tsx
var import_jsx_runtime98 = __toESM(require_jsx_runtime(), 1);
function CreateFormButton({
  label = (0, import_i18n44.__)("Create a form", "jetpack-forms"),
  showPatterns = false,
  variant = "secondary"
}) {
  const { openNewForm } = useCreateForm();
  const onButtonClickHandler = (0, import_element56.useCallback)(
    () => openNewForm({
      showPatterns,
      analyticsEvent: () => {
        analytics_default.tracks.recordEvent("jetpack_wpa_forms_landing_page_cta_click", {
          button: "forms"
        });
      }
    }),
    [openNewForm, showPatterns]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime98.jsx)(
    import_components48.Button,
    {
      size: "compact",
      variant,
      onClick: onButtonClickHandler,
      icon: plus_default,
      className: "create-form-button",
      children: label
    }
  );
}

// src/dashboard/components/empty-responses/index.tsx
var import_components49 = __toESM(require_components(), 1);
var import_data10 = __toESM(require_data(), 1);
var import_element58 = __toESM(require_element(), 1);
var import_i18n45 = __toESM(require_i18n(), 1);

// src/hooks/use-plugin-installation.ts
var import_data8 = __toESM(require_data(), 1);
var import_element57 = __toESM(require_element(), 1);
var import_notices = __toESM(require_notices(), 1);

// src/blocks/contact-form/util/plugin-management.js
var import_api_fetch2 = __toESM(require_api_fetch(), 1);

// src/store/integrations/index.ts
var import_data9 = __toESM(require_data(), 1);

// src/store/integrations/actions.ts
var actions_exports2 = {};
__export(actions_exports2, {
  invalidateIntegrations: () => invalidateIntegrations,
  receiveIntegrations: () => receiveIntegrations,
  refreshIntegrations: () => refreshIntegrations,
  setIntegrationsError: () => setIntegrationsError,
  setIntegrationsLoading: () => setIntegrationsLoading
});

// src/store/integrations/action-types.ts
var RECEIVE_INTEGRATIONS = "RECEIVE_INTEGRATIONS";
var INVALIDATE_INTEGRATIONS = "INVALIDATE_INTEGRATIONS";
var SET_INTEGRATIONS_LOADING = "SET_INTEGRATIONS_LOADING";
var SET_INTEGRATIONS_ERROR = "SET_INTEGRATIONS_ERROR";

// src/store/integrations/resolvers.ts
var resolvers_exports2 = {};
__export(resolvers_exports2, {
  getIntegrations: () => getIntegrations,
  resetMetadataFlag: () => resetMetadataFlag
});
var import_api_fetch3 = __toESM(require_api_fetch(), 1);
var import_url3 = __toESM(require_url(), 1);
var hasLoadedMeta = false;
var resetMetadataFlag = () => {
  hasLoadedMeta = false;
};
var fetchIntegrationsMetadata = () => async ({ dispatch }) => {
  const metadataPath = "/wp/v2/feedback/integrations-metadata";
  const metadata = await (0, import_api_fetch3.default)({ path: metadataPath });
  const partialIntegrations = metadata.map((meta) => ({
    ...meta,
    pluginFile: null,
    isInstalled: false,
    isActive: false,
    isConnected: false,
    needsConnection: meta.type === "service",
    version: null,
    settingsUrl: null,
    details: {},
    __isPartial: true
    // Flag to indicate this is metadata-only
  }));
  dispatch(receiveIntegrations(partialIntegrations));
};
var fetchFullIntegrations = () => async ({ dispatch }) => {
  const fullPath = (0, import_url3.addQueryArgs)("/wp/v2/feedback/integrations", { version: 2 });
  const fullIntegrations = await (0, import_api_fetch3.default)({ path: fullPath });
  dispatch(receiveIntegrations(fullIntegrations));
};
var getIntegrations = () => async ({ dispatch }) => {
  dispatch(setIntegrationsLoading(true));
  try {
    if (!hasLoadedMeta) {
      await fetchIntegrationsMetadata()({ dispatch });
      hasLoadedMeta = true;
    }
    await fetchFullIntegrations()({ dispatch });
  } catch (e2) {
    const message2 = e2 instanceof Error ? e2.message : UNKNOWN_ERROR_MESSAGE;
    dispatch(setIntegrationsError(message2));
  } finally {
    dispatch(setIntegrationsLoading(false));
  }
};
getIntegrations.shouldInvalidate = (action) => action.type === INVALIDATE_INTEGRATIONS;

// src/store/integrations/actions.ts
var receiveIntegrations = (items) => ({
  type: RECEIVE_INTEGRATIONS,
  items
});
var invalidateIntegrations = () => ({
  type: INVALIDATE_INTEGRATIONS
});
var setIntegrationsLoading = (isLoading) => ({
  type: SET_INTEGRATIONS_LOADING,
  isLoading
});
var setIntegrationsError = (error2) => ({
  type: SET_INTEGRATIONS_ERROR,
  error: error2
});
var refreshIntegrations = () => getIntegrations();

// src/store/integrations/reducer.ts
var DEFAULT_STATE2 = {
  items: null,
  isLoading: false,
  error: null
};
function reducer2(state = DEFAULT_STATE2, action) {
  switch (action.type) {
    case SET_INTEGRATIONS_LOADING:
      return {
        ...state,
        isLoading: !!action.isLoading,
        error: action.isLoading ? null : state.error
      };
    case SET_INTEGRATIONS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error ?? UNKNOWN_ERROR_MESSAGE
      };
    case RECEIVE_INTEGRATIONS:
      return {
        ...state,
        items: action.items,
        isLoading: false,
        error: null
      };
    case INVALIDATE_INTEGRATIONS:
      return {
        ...state,
        items: null,
        isLoading: false
      };
    default:
      return state;
  }
}

// src/store/integrations/selectors.ts
var selectors_exports2 = {};
__export(selectors_exports2, {
  getIntegrations: () => getIntegrations2,
  getIntegrationsError: () => getIntegrationsError,
  isIntegrationsLoading: () => isIntegrationsLoading
});
var getIntegrations2 = (state) => state.items;
var isIntegrationsLoading = (state) => state.isLoading;
var getIntegrationsError = (state) => state.error;

// src/store/integrations/index.ts
var INTEGRATIONS_STORE = "jetpack/forms/integrations";
var store2 = (0, import_data9.createReduxStore)(INTEGRATIONS_STORE, {
  reducer: reducer2,
  actions: actions_exports2,
  selectors: selectors_exports2,
  resolvers: resolvers_exports2
});
(0, import_data9.register)(store2);

// src/dashboard/components/empty-responses/index.tsx
var import_jsx_runtime99 = __toESM(require_jsx_runtime(), 1);
var EmptyWrapper = ({ heading = "", body = "", actions = null }) => /* @__PURE__ */ (0, import_jsx_runtime99.jsxs)(import_components49.__experimentalVStack, { alignment: "center", spacing: "2", children: [
  heading && /* @__PURE__ */ (0, import_jsx_runtime99.jsx)(import_components49.__experimentalText, { as: "h3", weight: "500", size: "15", children: heading }),
  body && /* @__PURE__ */ (0, import_jsx_runtime99.jsx)(import_components49.__experimentalText, { variant: "muted", children: body }),
  actions && /* @__PURE__ */ (0, import_jsx_runtime99.jsx)("span", { style: { marginBlockStart: "16px" }, children: actions })
] });

// ../../js-packages/components/build/components/jetpack-logo/index.js
var import_jsx_runtime100 = __toESM(require_jsx_runtime(), 1);
var import_i18n46 = __toESM(require_i18n(), 1);
var JetpackLogo = ({ logoColor = "#069e08", showText = true, className, height = 32, title, ...otherProps }) => {
  const viewBox = showText ? "0 0 118 32" : "0 0 32 32";
  const logoTitle = title ?? (0, import_i18n46.__)("Jetpack Logo", "jetpack-components");
  return (0, import_jsx_runtime100.jsxs)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    x: "0px",
    y: "0px",
    viewBox,
    className: clsx_default("jetpack-logo", className),
    "aria-labelledby": "jetpack-logo-title",
    height,
    ...otherProps,
    // role="img" is required to prevent VoiceOver on Safari reading the content of the SVG
    role: "img",
    children: [(0, import_jsx_runtime100.jsx)("title", { id: "jetpack-logo-title", children: logoTitle }), (0, import_jsx_runtime100.jsx)("path", { fill: logoColor, d: "M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z M15,19H7l8-16V19z M17,29V13h8L17,29z" }), showText && (0, import_jsx_runtime100.jsxs)(import_jsx_runtime100.Fragment, { children: [(0, import_jsx_runtime100.jsx)("path", { d: "M41.3,26.6c-0.5-0.7-0.9-1.4-1.3-2.1c2.3-1.4,3-2.5,3-4.6V8h-3V6h6v13.4C46,22.8,45,24.8,41.3,26.6z" }), (0, import_jsx_runtime100.jsx)("path", { d: "M65,18.4c0,1.1,0.8,1.3,1.4,1.3c0.5,0,2-0.2,2.6-0.4v2.1c-0.9,0.3-2.5,0.5-3.7,0.5c-1.5,0-3.2-0.5-3.2-3.1V12H60v-2h2.1V7.1 H65V10h4v2h-4V18.4z" }), (0, import_jsx_runtime100.jsx)("path", { d: "M71,10h3v1.3c1.1-0.8,1.9-1.3,3.3-1.3c2.5,0,4.5,1.8,4.5,5.6s-2.2,6.3-5.8,6.3c-0.9,0-1.3-0.1-2-0.3V28h-3V10z M76.5,12.3 c-0.8,0-1.6,0.4-2.5,1.2v5.9c0.6,0.1,0.9,0.2,1.8,0.2c2,0,3.2-1.3,3.2-3.9C79,13.4,78.1,12.3,76.5,12.3z" }), (0, import_jsx_runtime100.jsx)("path", { d: "M93,22h-3v-1.5c-0.9,0.7-1.9,1.5-3.5,1.5c-1.5,0-3.1-1.1-3.1-3.2c0-2.9,2.5-3.4,4.2-3.7l2.4-0.3v-0.3c0-1.5-0.5-2.3-2-2.3 c-0.7,0-2.3,0.5-3.7,1.1L84,11c1.2-0.4,3-1,4.4-1c2.7,0,4.6,1.4,4.6,4.7L93,22z M90,16.4l-2.2,0.4c-0.7,0.1-1.4,0.5-1.4,1.6 c0,0.9,0.5,1.4,1.3,1.4s1.5-0.5,2.3-1V16.4z" }), (0, import_jsx_runtime100.jsx)("path", { d: "M104.5,21.3c-1.1,0.4-2.2,0.6-3.5,0.6c-4.2,0-5.9-2.4-5.9-5.9c0-3.7,2.3-6,6.1-6c1.4,0,2.3,0.2,3.2,0.5V13 c-0.8-0.3-2-0.6-3.2-0.6c-1.7,0-3.2,0.9-3.2,3.6c0,2.9,1.5,3.8,3.3,3.8c0.9,0,1.9-0.2,3.2-0.7V21.3z" }), (0, import_jsx_runtime100.jsx)("path", { d: "M110,15.2c0.2-0.3,0.2-0.8,3.8-5.2h3.7l-4.6,5.7l5,6.3h-3.7l-4.2-5.8V22h-3V6h3V15.2z" }), (0, import_jsx_runtime100.jsx)("path", { d: "M58.5,21.3c-1.5,0.5-2.7,0.6-4.2,0.6c-3.6,0-5.8-1.8-5.8-6c0-3.1,1.9-5.9,5.5-5.9s4.9,2.5,4.9,4.9c0,0.8,0,1.5-0.1,2h-7.3 c0.1,2.5,1.5,2.8,3.6,2.8c1.1,0,2.2-0.3,3.4-0.7C58.5,19,58.5,21.3,58.5,21.3z M56,15c0-1.4-0.5-2.9-2-2.9c-1.4,0-2.3,1.3-2.4,2.9 C51.6,15,56,15,56,15z" })] })]
  });
};
var jetpack_logo_default = JetpackLogo;

// src/dashboard/components/forms-logo/index.tsx
var import_jsx_runtime101 = __toESM(require_jsx_runtime(), 1);
function FormsLogo() {
  return /* @__PURE__ */ (0, import_jsx_runtime101.jsxs)(Stack, { align: "center", gap: "xs", children: [
    /* @__PURE__ */ (0, import_jsx_runtime101.jsx)(jetpack_logo_default, { showText: false, width: 20 }),
    "Forms"
  ] });
}

// src/dashboard/hooks/use-delete-form.ts
var import_data11 = __toESM(require_data(), 1);
var import_element60 = __toESM(require_element(), 1);
var import_i18n47 = __toESM(require_i18n(), 1);
var import_notices2 = __toESM(require_notices(), 1);

// src/dashboard/hooks/use-forms-data.ts
var import_core_data = __toESM(require_core_data(), 1);
var import_element59 = __toESM(require_element(), 1);
var import_html_entities = __toESM(require_html_entities(), 1);
function getFormsListQuery(page, perPage, search, status) {
  const queryParams = {
    context: "edit",
    jetpack_forms_context: "dashboard",
    order: "desc",
    orderby: "modified",
    page,
    per_page: perPage,
    status
  };
  if (search) {
    queryParams.search = search;
  }
  return queryParams;
}
function useFormsData(page, perPage, search, status) {
  const query = (0, import_element59.useMemo)(() => {
    return getFormsListQuery(page, perPage, search, status);
  }, [page, perPage, search, status]);
  const {
    records: rawRecords,
    hasResolved,
    totalItems,
    totalPages
  } = (0, import_core_data.useEntityRecords)("postType", "jetpack_form", query);
  const records = (rawRecords || []).map((item) => {
    const typedItem = item;
    return {
      id: typedItem.id,
      title: (0, import_html_entities.decodeEntities)(typedItem.title?.rendered || ""),
      status: typedItem.status,
      modified: typedItem.modified,
      entriesCount: typedItem.entries_count ?? 0,
      editUrl: typedItem.edit_url
    };
  });
  return {
    records,
    isLoading: !hasResolved,
    totalItems: totalItems ?? 0,
    totalPages: totalPages ?? 0
  };
}

// src/dashboard/hooks/use-delete-form.ts
function useDeleteForm({
  view,
  setView,
  recordsLength,
  statusQuery
}) {
  const [isDeleting, setIsDeleting] = (0, import_element60.useState)(false);
  const [isPermanentDeleteConfirmOpen, setIsPermanentDeleteConfirmOpen] = (0, import_element60.useState)(false);
  const [permanentDeleteItems, setPermanentDeleteItems] = (0, import_element60.useState)([]);
  const { saveEntityRecord, deleteEntityRecord, invalidateResolution } = (0, import_data11.useDispatch)(
    "core"
  );
  const { createSuccessNotice, createErrorNotice } = (0, import_data11.useDispatch)(import_notices2.store);
  const page = view.page ?? 1;
  const perPage = view.perPage ?? 20;
  const search = view.search ?? "";
  const currentQuery = (0, import_element60.useMemo)(
    () => getFormsListQuery(page, perPage, search, statusQuery),
    [page, perPage, search, statusQuery]
  );
  const invalidateListQueries = (0, import_element60.useCallback)(
    (query) => {
      invalidateResolution("getEntityRecords", ["postType", "jetpack_form", query]);
      invalidateResolution("getEntityRecords", [
        "postType",
        "jetpack_form",
        { ...query, per_page: 1, _fields: "id" }
      ]);
    },
    [invalidateResolution]
  );
  const restoreItemsToPublish = (0, import_element60.useCallback)(
    async (items, {
      successNoticeIdPrefix,
      errorNoticeIdPrefix
    }) => {
      const promises = await Promise.allSettled(
        items.map(
          (item) => saveEntityRecord(
            "postType",
            "jetpack_form",
            { id: item.id, status: "publish" },
            { throwOnError: true }
          )
        )
      );
      const restoredCount = promises.filter((p2) => p2.status === "fulfilled").length;
      const failedCount = promises.length - restoredCount;
      if (restoredCount) {
        const successMessage = restoredCount === 1 ? (0, import_i18n47.__)("Form restored.", "jetpack-forms") : (0, import_i18n47.sprintf)(
          /* translators: %d: number of forms. */
          (0, import_i18n47._n)("%d form restored.", "%d forms restored.", restoredCount, "jetpack-forms"),
          restoredCount
        );
        createSuccessNotice(successMessage, {
          type: "snackbar",
          id: `${successNoticeIdPrefix}-${Date.now()}`
        });
      }
      if (failedCount) {
        createErrorNotice(
          (0, import_i18n47.sprintf)(
            /* translators: %d: number of forms. */
            (0, import_i18n47._n)(
              "Could not restore %d form.",
              "Could not restore %d forms.",
              failedCount,
              "jetpack-forms"
            ),
            failedCount
          ),
          { type: "snackbar", id: `${errorNoticeIdPrefix}-${Date.now()}` }
        );
      }
      return { restoredCount, failedCount };
    },
    [createErrorNotice, createSuccessNotice, saveEntityRecord]
  );
  const restoreForms = (0, import_element60.useCallback)(
    async (items) => {
      if (isDeleting || !items?.length) {
        return;
      }
      setIsDeleting(true);
      const currentQuerySnapshot = currentQuery;
      let shouldNavigateToPreviousPage = false;
      try {
        const { restoredCount } = await restoreItemsToPublish(items, {
          successNoticeIdPrefix: "restore-forms",
          errorNoticeIdPrefix: "restore-forms-error"
        });
        shouldNavigateToPreviousPage = page > 1 && restoredCount >= recordsLength;
        if (restoredCount && shouldNavigateToPreviousPage) {
          setView({ ...view, page: page - 1 });
        }
      } finally {
        setIsDeleting(false);
        invalidateListQueries(currentQuerySnapshot);
        if (shouldNavigateToPreviousPage) {
          invalidateListQueries(
            getFormsListQuery(page - 1, perPage, search, statusQuery)
          );
        }
      }
    },
    [
      currentQuery,
      invalidateListQueries,
      isDeleting,
      page,
      perPage,
      recordsLength,
      restoreItemsToPublish,
      search,
      setView,
      statusQuery,
      view
    ]
  );
  const undoTrashForms = (0, import_element60.useCallback)(
    async (items) => {
      if (isDeleting || !items?.length) {
        return;
      }
      setIsDeleting(true);
      const currentQuerySnapshot = currentQuery;
      try {
        await restoreItemsToPublish(items, {
          successNoticeIdPrefix: "undo-trash-forms",
          errorNoticeIdPrefix: "undo-trash-forms-error"
        });
      } finally {
        setIsDeleting(false);
        invalidateListQueries(currentQuerySnapshot);
      }
    },
    [currentQuery, invalidateListQueries, isDeleting, restoreItemsToPublish]
  );
  const trashForms = (0, import_element60.useCallback)(
    async (items) => {
      if (isDeleting || !items?.length) {
        return;
      }
      setIsDeleting(true);
      const currentQuerySnapshot = currentQuery;
      let shouldNavigateToPreviousPage = false;
      try {
        const promises = await Promise.allSettled(
          items.map(
            (item) => deleteEntityRecord(
              "postType",
              "jetpack_form",
              item.id,
              { force: false },
              { throwOnError: true }
            )
          )
        );
        const trashedItems = items.filter(
          (_, index) => promises[index]?.status === "fulfilled"
        );
        const trashedCount = trashedItems.length;
        const failedCount = items.length - trashedCount;
        if (trashedCount) {
          const successMessage = trashedCount === 1 ? (0, import_i18n47.__)("Form moved to trash.", "jetpack-forms") : (0, import_i18n47.sprintf)(
            /* translators: %d: number of forms. */
            (0, import_i18n47._n)(
              "%d form moved to trash.",
              "%d forms moved to trash.",
              trashedCount,
              "jetpack-forms"
            ),
            trashedCount
          );
          createSuccessNotice(successMessage, {
            type: "snackbar",
            id: `trash-forms-${Date.now()}`,
            actions: [
              {
                label: (0, import_i18n47.__)("Undo", "jetpack-forms"),
                onClick: () => void undoTrashForms(trashedItems)
              }
            ]
          });
          shouldNavigateToPreviousPage = page > 1 && trashedCount >= recordsLength;
          if (shouldNavigateToPreviousPage) {
            setView({ ...view, page: page - 1 });
          }
        }
        if (failedCount) {
          createErrorNotice(
            (0, import_i18n47.sprintf)(
              /* translators: %d: number of forms. */
              (0, import_i18n47._n)(
                "Could not move %d form to trash.",
                "Could not move %d forms to trash.",
                failedCount,
                "jetpack-forms"
              ),
              failedCount
            ),
            { type: "snackbar", id: `trash-forms-error-${Date.now()}` }
          );
        }
      } finally {
        setIsDeleting(false);
        invalidateListQueries(currentQuerySnapshot);
        if (shouldNavigateToPreviousPage) {
          invalidateListQueries(
            getFormsListQuery(page - 1, perPage, search, statusQuery)
          );
        }
      }
    },
    [
      createErrorNotice,
      createSuccessNotice,
      currentQuery,
      deleteEntityRecord,
      invalidateListQueries,
      isDeleting,
      page,
      perPage,
      recordsLength,
      search,
      setView,
      statusQuery,
      undoTrashForms,
      view
    ]
  );
  const openPermanentDeleteConfirm = (0, import_element60.useCallback)((items) => {
    setPermanentDeleteItems(items || []);
    setIsPermanentDeleteConfirmOpen(true);
  }, []);
  const closePermanentDeleteConfirm = (0, import_element60.useCallback)(() => {
    setIsPermanentDeleteConfirmOpen(false);
    setPermanentDeleteItems([]);
  }, []);
  const confirmPermanentDelete = (0, import_element60.useCallback)(async () => {
    if (!permanentDeleteItems.length || isDeleting) {
      return;
    }
    setIsPermanentDeleteConfirmOpen(false);
    setIsDeleting(true);
    const currentQuerySnapshot = currentQuery;
    let shouldNavigateToPreviousPage = false;
    try {
      const promises = await Promise.allSettled(
        permanentDeleteItems.map(
          (item) => deleteEntityRecord(
            "postType",
            "jetpack_form",
            item.id,
            { force: true },
            { throwOnError: true }
          )
        )
      );
      const deletedCount = promises.filter((p2) => p2.status === "fulfilled").length;
      const failedCount = promises.length - deletedCount;
      if (deletedCount) {
        const successMessage = deletedCount === 1 ? (0, import_i18n47.__)("Form deleted permanently.", "jetpack-forms") : (0, import_i18n47.sprintf)(
          /* translators: %d: number of forms. */
          (0, import_i18n47._n)(
            "%d form deleted permanently.",
            "%d forms deleted permanently.",
            deletedCount,
            "jetpack-forms"
          ),
          deletedCount
        );
        createSuccessNotice(successMessage, {
          type: "snackbar",
          id: `delete-forms-permanently-${Date.now()}`
        });
        shouldNavigateToPreviousPage = page > 1 && deletedCount >= recordsLength;
        if (shouldNavigateToPreviousPage) {
          setView({ ...view, page: page - 1 });
        }
      }
      if (failedCount) {
        createErrorNotice(
          (0, import_i18n47.sprintf)(
            /* translators: %d: number of forms. */
            (0, import_i18n47._n)(
              "Could not permanently delete %d form.",
              "Could not permanently delete %d forms.",
              failedCount,
              "jetpack-forms"
            ),
            failedCount
          ),
          { type: "snackbar", id: `delete-forms-permanently-error-${Date.now()}` }
        );
      }
    } catch {
      createErrorNotice((0, import_i18n47.__)("Could not delete forms permanently.", "jetpack-forms"), {
        type: "snackbar",
        id: `delete-forms-permanently-error-${Date.now()}`
      });
    } finally {
      setIsDeleting(false);
      setPermanentDeleteItems([]);
      invalidateListQueries(currentQuerySnapshot);
      if (shouldNavigateToPreviousPage) {
        invalidateListQueries(
          getFormsListQuery(page - 1, perPage, search, statusQuery)
        );
      }
    }
  }, [
    createErrorNotice,
    createSuccessNotice,
    currentQuery,
    deleteEntityRecord,
    invalidateListQueries,
    isDeleting,
    page,
    perPage,
    permanentDeleteItems,
    recordsLength,
    search,
    setView,
    statusQuery,
    view
  ]);
  return {
    isDeleting,
    trashForms,
    restoreForms,
    isPermanentDeleteConfirmOpen,
    openPermanentDeleteConfirm,
    closePermanentDeleteConfirm,
    confirmPermanentDelete
  };
}

// src/dashboard/wp-build/components/dataviews-header-row/index.tsx
var import_element61 = __toESM(require_element(), 1);
var import_i18n48 = __toESM(require_i18n(), 1);
import { useNavigate } from "@wordpress/route";

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/index.parts.js
var index_parts_exports = {};
__export(index_parts_exports, {
  Indicator: () => TabsIndicator,
  List: () => TabsList,
  Panel: () => TabsPanel,
  Root: () => TabsRoot,
  Tab: () => TabsTab
});

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/root/TabsRoot.js
var React19 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useControlled.js
var React8 = __toESM(require_react(), 1);
function useControlled({
  controlled,
  default: defaultProp,
  name,
  state = "value"
}) {
  const {
    current: isControlled
  } = React8.useRef(controlled !== void 0);
  const [valueState, setValue] = React8.useState(defaultProp);
  const value = isControlled ? controlled : valueState;
  if (true) {
    React8.useEffect(() => {
      if (isControlled !== (controlled !== void 0)) {
        console.error([`Base UI: A component is changing the ${isControlled ? "" : "un"}controlled ${state} state of ${name} to be ${isControlled ? "un" : ""}controlled.`, "Elements should not switch from uncontrolled to controlled (or vice versa).", `Decide between using a controlled or uncontrolled ${name} element for the lifetime of the component.`, "The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.", "More info: https://fb.me/react-controlled-components"].join("\n"));
      }
    }, [state, name, controlled]);
    const {
      current: defaultValue2
    } = React8.useRef(defaultProp);
    React8.useEffect(() => {
      if (!isControlled && JSON.stringify(defaultValue2) !== JSON.stringify(defaultProp)) {
        console.error([`Base UI: A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. To suppress this warning opt to use a controlled ${name}.`].join("\n"));
      }
    }, [JSON.stringify(defaultProp)]);
  }
  const setValueIfUncontrolled = React8.useCallback((newValue) => {
    if (!isControlled) {
      setValue(newValue);
    }
  }, []);
  return [value, setValueIfUncontrolled];
}

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useStableCallback.js
var React10 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useRefWithInit.js
var React9 = __toESM(require_react(), 1);
var UNINITIALIZED2 = {};
function useRefWithInit2(init2, initArg) {
  const ref = React9.useRef(UNINITIALIZED2);
  if (ref.current === UNINITIALIZED2) {
    ref.current = init2(initArg);
  }
  return ref;
}

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useStableCallback.js
var useInsertionEffect = React10[`useInsertionEffect${Math.random().toFixed(1)}`.slice(0, -3)];
var useSafeInsertionEffect = (
  // React 17 doesn't have useInsertionEffect.
  useInsertionEffect && // Preact replaces useInsertionEffect with useLayoutEffect and fires too late.
  useInsertionEffect !== React10.useLayoutEffect ? useInsertionEffect : (fn) => fn()
);
function useStableCallback(callback) {
  const stable = useRefWithInit2(createStableCallback).current;
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
    throw new Error("Base UI: Cannot call an event handler while rendering.");
  }
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/utils/useRenderElement.js
var React13 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useMergedRefs.js
function useMergedRefs2(a2, b2, c2, d2) {
  const forkRef = useRefWithInit2(createForkRef2).current;
  if (didChange2(forkRef, a2, b2, c2, d2)) {
    update2(forkRef, [a2, b2, c2, d2]);
  }
  return forkRef.callback;
}
function useMergedRefsN2(refs) {
  const forkRef = useRefWithInit2(createForkRef2).current;
  if (didChangeN2(forkRef, refs)) {
    update2(forkRef, refs);
  }
  return forkRef.callback;
}
function createForkRef2() {
  return {
    callback: null,
    cleanup: null,
    refs: []
  };
}
function didChange2(forkRef, a2, b2, c2, d2) {
  return forkRef.refs[0] !== a2 || forkRef.refs[1] !== b2 || forkRef.refs[2] !== c2 || forkRef.refs[3] !== d2;
}
function didChangeN2(forkRef, newRefs) {
  return forkRef.refs.length !== newRefs.length || forkRef.refs.some((ref, index) => ref !== newRefs[index]);
}
function update2(forkRef, refs) {
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
                ref(null);
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

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/getReactElementRef.js
var React12 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/reactVersion.js
var React11 = __toESM(require_react(), 1);
var majorVersion2 = parseInt(React11.version, 10);
function isReactVersionAtLeast2(reactVersionToCheck) {
  return majorVersion2 >= reactVersionToCheck;
}

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/getReactElementRef.js
function getReactElementRef2(element) {
  if (!/* @__PURE__ */ React12.isValidElement(element)) {
    return null;
  }
  const reactElement = element;
  const propsWithRef = reactElement.props;
  return (isReactVersionAtLeast2(19) ? propsWithRef?.ref : reactElement.ref) ?? null;
}

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/mergeObjects.js
function mergeObjects2(a2, b2) {
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

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/utils/getStateAttributesProps.js
function getStateAttributesProps2(state, customMapping) {
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

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/utils/resolveClassName.js
function resolveClassName2(className, state) {
  return typeof className === "function" ? className(state) : className;
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/utils/resolveStyle.js
function resolveStyle2(style, state) {
  return typeof style === "function" ? style(state) : style;
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/merge-props/mergeProps.js
var EMPTY_PROPS2 = {};
function mergeProps3(a2, b2, c2, d2, e2) {
  let merged = {
    ...resolvePropsGetter2(a2, EMPTY_PROPS2)
  };
  if (b2) {
    merged = mergeOne2(merged, b2);
  }
  if (c2) {
    merged = mergeOne2(merged, c2);
  }
  if (d2) {
    merged = mergeOne2(merged, d2);
  }
  if (e2) {
    merged = mergeOne2(merged, e2);
  }
  return merged;
}
function mergePropsN2(props) {
  if (props.length === 0) {
    return EMPTY_PROPS2;
  }
  if (props.length === 1) {
    return resolvePropsGetter2(props[0], EMPTY_PROPS2);
  }
  let merged = {
    ...resolvePropsGetter2(props[0], EMPTY_PROPS2)
  };
  for (let i2 = 1; i2 < props.length; i2 += 1) {
    merged = mergeOne2(merged, props[i2]);
  }
  return merged;
}
function mergeOne2(merged, inputProps) {
  if (isPropsGetter2(inputProps)) {
    return inputProps(merged);
  }
  return mutablyMergeInto2(merged, inputProps);
}
function mutablyMergeInto2(mergedProps, externalProps) {
  if (!externalProps) {
    return mergedProps;
  }
  for (const propName in externalProps) {
    const externalPropValue = externalProps[propName];
    switch (propName) {
      case "style": {
        mergedProps[propName] = mergeObjects2(mergedProps.style, externalPropValue);
        break;
      }
      case "className": {
        mergedProps[propName] = mergeClassNames2(mergedProps.className, externalPropValue);
        break;
      }
      default: {
        if (isEventHandler2(propName, externalPropValue)) {
          mergedProps[propName] = mergeEventHandlers2(mergedProps[propName], externalPropValue);
        } else {
          mergedProps[propName] = externalPropValue;
        }
      }
    }
  }
  return mergedProps;
}
function isEventHandler2(key, value) {
  const code0 = key.charCodeAt(0);
  const code1 = key.charCodeAt(1);
  const code2 = key.charCodeAt(2);
  return code0 === 111 && code1 === 110 && code2 >= 65 && code2 <= 90 && (typeof value === "function" || typeof value === "undefined");
}
function isPropsGetter2(inputProps) {
  return typeof inputProps === "function";
}
function resolvePropsGetter2(inputProps, previousProps) {
  if (isPropsGetter2(inputProps)) {
    return inputProps(previousProps);
  }
  return inputProps ?? EMPTY_PROPS2;
}
function mergeEventHandlers2(ourHandler, theirHandler) {
  if (!theirHandler) {
    return ourHandler;
  }
  if (!ourHandler) {
    return theirHandler;
  }
  return (event) => {
    if (isSyntheticEvent2(event)) {
      const baseUIEvent = event;
      makeEventPreventable2(baseUIEvent);
      const result2 = theirHandler(baseUIEvent);
      if (!baseUIEvent.baseUIHandlerPrevented) {
        ourHandler?.(baseUIEvent);
      }
      return result2;
    }
    const result = theirHandler(event);
    ourHandler?.(event);
    return result;
  };
}
function makeEventPreventable2(event) {
  event.preventBaseUIHandler = () => {
    event.baseUIHandlerPrevented = true;
  };
  return event;
}
function mergeClassNames2(ourClassName, theirClassName) {
  if (theirClassName) {
    if (ourClassName) {
      return theirClassName + " " + ourClassName;
    }
    return theirClassName;
  }
  return ourClassName;
}
function isSyntheticEvent2(event) {
  return event != null && typeof event === "object" && "nativeEvent" in event;
}

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/empty.js
var EMPTY_ARRAY7 = Object.freeze([]);
var EMPTY_OBJECT2 = Object.freeze({});

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/utils/useRenderElement.js
var import_react22 = __toESM(require_react(), 1);
function useRenderElement2(element, componentProps, params = {}) {
  const renderProp = componentProps.render;
  const outProps = useRenderElementProps2(componentProps, params);
  if (params.enabled === false) {
    return null;
  }
  const state = params.state ?? EMPTY_OBJECT2;
  return evaluateRenderProp2(element, renderProp, outProps, state);
}
function useRenderElementProps2(componentProps, params = {}) {
  const {
    className: classNameProp,
    style: styleProp,
    render: renderProp
  } = componentProps;
  const {
    state = EMPTY_OBJECT2,
    ref,
    props,
    stateAttributesMapping: stateAttributesMapping2,
    enabled = true
  } = params;
  const className = enabled ? resolveClassName2(classNameProp, state) : void 0;
  const style = enabled ? resolveStyle2(styleProp, state) : void 0;
  const stateProps = enabled ? getStateAttributesProps2(state, stateAttributesMapping2) : EMPTY_OBJECT2;
  const outProps = enabled ? mergeObjects2(stateProps, Array.isArray(props) ? mergePropsN2(props) : props) ?? EMPTY_OBJECT2 : EMPTY_OBJECT2;
  if (typeof document !== "undefined") {
    if (!enabled) {
      useMergedRefs2(null, null);
    } else if (Array.isArray(ref)) {
      outProps.ref = useMergedRefsN2([outProps.ref, getReactElementRef2(renderProp), ...ref]);
    } else {
      outProps.ref = useMergedRefs2(outProps.ref, getReactElementRef2(renderProp), ref);
    }
  }
  if (!enabled) {
    return EMPTY_OBJECT2;
  }
  if (className !== void 0) {
    outProps.className = mergeClassNames2(outProps.className, className);
  }
  if (style !== void 0) {
    outProps.style = mergeObjects2(outProps.style, style);
  }
  return outProps;
}
function evaluateRenderProp2(element, render4, props, state) {
  if (render4) {
    if (typeof render4 === "function") {
      return render4(props, state);
    }
    const mergedProps = mergeProps3(props, render4.props);
    mergedProps.ref = props.ref;
    return /* @__PURE__ */ React13.cloneElement(render4, mergedProps);
  }
  if (element) {
    if (typeof element === "string") {
      return renderTag2(element, props);
    }
  }
  throw new Error(true ? "Base UI: Render element or function are not defined." : formatErrorMessage(8));
}
function renderTag2(Tag, props) {
  if (Tag === "button") {
    return /* @__PURE__ */ (0, import_react22.createElement)("button", {
      type: "button",
      ...props,
      key: props.key
    });
  }
  if (Tag === "img") {
    return /* @__PURE__ */ (0, import_react22.createElement)("img", {
      alt: "",
      ...props,
      key: props.key
    });
  }
  return /* @__PURE__ */ React13.createElement(Tag, props);
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/list/CompositeList.js
var React16 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js
var React14 = __toESM(require_react(), 1);
var noop2 = () => {
};
var useIsoLayoutEffect = typeof document !== "undefined" ? React14.useLayoutEffect : noop2;

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/list/CompositeListContext.js
var React15 = __toESM(require_react(), 1);
var CompositeListContext = /* @__PURE__ */ React15.createContext({
  register: () => {
  },
  unregister: () => {
  },
  subscribeMapChange: () => {
    return () => {
    };
  },
  elementsRef: {
    current: []
  },
  nextIndexRef: {
    current: 0
  }
});
if (true) CompositeListContext.displayName = "CompositeListContext";
function useCompositeListContext() {
  return React15.useContext(CompositeListContext);
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/list/CompositeList.js
var import_jsx_runtime102 = __toESM(require_jsx_runtime(), 1);
function CompositeList(props) {
  const {
    children,
    elementsRef,
    labelsRef,
    onMapChange: onMapChangeProp
  } = props;
  const onMapChange = useStableCallback(onMapChangeProp);
  const nextIndexRef = React16.useRef(0);
  const listeners = useRefWithInit2(createListeners).current;
  const map = useRefWithInit2(createMap).current;
  const [mapTick, setMapTick] = React16.useState(0);
  const lastTickRef = React16.useRef(mapTick);
  const register3 = useStableCallback((node, metadata) => {
    map.set(node, metadata ?? null);
    lastTickRef.current += 1;
    setMapTick(lastTickRef.current);
  });
  const unregister = useStableCallback((node) => {
    map.delete(node);
    lastTickRef.current += 1;
    setMapTick(lastTickRef.current);
  });
  const sortedMap = React16.useMemo(() => {
    disableEslintWarning(mapTick);
    const newMap = /* @__PURE__ */ new Map();
    const sortedNodes = Array.from(map.keys()).filter((node) => node.isConnected).sort(sortByDocumentPosition);
    sortedNodes.forEach((node, index) => {
      const metadata = map.get(node) ?? {};
      newMap.set(node, {
        ...metadata,
        index
      });
    });
    return newMap;
  }, [map, mapTick]);
  useIsoLayoutEffect(() => {
    if (typeof MutationObserver !== "function" || sortedMap.size === 0) {
      return void 0;
    }
    const mutationObserver = new MutationObserver((entries) => {
      const diff = /* @__PURE__ */ new Set();
      const updateDiff = (node) => diff.has(node) ? diff.delete(node) : diff.add(node);
      entries.forEach((entry) => {
        entry.removedNodes.forEach(updateDiff);
        entry.addedNodes.forEach(updateDiff);
      });
      if (diff.size === 0) {
        lastTickRef.current += 1;
        setMapTick(lastTickRef.current);
      }
    });
    sortedMap.forEach((_, node) => {
      if (node.parentElement) {
        mutationObserver.observe(node.parentElement, {
          childList: true
        });
      }
    });
    return () => {
      mutationObserver.disconnect();
    };
  }, [sortedMap]);
  useIsoLayoutEffect(() => {
    const shouldUpdateLengths = lastTickRef.current === mapTick;
    if (shouldUpdateLengths) {
      if (elementsRef.current.length !== sortedMap.size) {
        elementsRef.current.length = sortedMap.size;
      }
      if (labelsRef && labelsRef.current.length !== sortedMap.size) {
        labelsRef.current.length = sortedMap.size;
      }
      nextIndexRef.current = sortedMap.size;
    }
    onMapChange(sortedMap);
  }, [onMapChange, sortedMap, elementsRef, labelsRef, mapTick]);
  useIsoLayoutEffect(() => {
    return () => {
      elementsRef.current = [];
    };
  }, [elementsRef]);
  useIsoLayoutEffect(() => {
    return () => {
      if (labelsRef) {
        labelsRef.current = [];
      }
    };
  }, [labelsRef]);
  const subscribeMapChange = useStableCallback((fn) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  });
  useIsoLayoutEffect(() => {
    listeners.forEach((l2) => l2(sortedMap));
  }, [listeners, sortedMap]);
  const contextValue = React16.useMemo(() => ({
    register: register3,
    unregister,
    subscribeMapChange,
    elementsRef,
    labelsRef,
    nextIndexRef
  }), [register3, unregister, subscribeMapChange, elementsRef, labelsRef, nextIndexRef]);
  return /* @__PURE__ */ (0, import_jsx_runtime102.jsx)(CompositeListContext.Provider, {
    value: contextValue,
    children
  });
}
function createMap() {
  return /* @__PURE__ */ new Map();
}
function createListeners() {
  return /* @__PURE__ */ new Set();
}
function sortByDocumentPosition(a2, b2) {
  const position = a2.compareDocumentPosition(b2);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    return -1;
  }
  if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
    return 1;
  }
  return 0;
}
function disableEslintWarning(_) {
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/direction-provider/DirectionContext.js
var React17 = __toESM(require_react(), 1);
var DirectionContext = /* @__PURE__ */ React17.createContext(void 0);
if (true) DirectionContext.displayName = "DirectionContext";
function useDirection() {
  const context = React17.useContext(DirectionContext);
  return context?.direction ?? "ltr";
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/root/TabsRootContext.js
var React18 = __toESM(require_react(), 1);
var TabsRootContext = /* @__PURE__ */ React18.createContext(void 0);
if (true) TabsRootContext.displayName = "TabsRootContext";
function useTabsRootContext() {
  const context = React18.useContext(TabsRootContext);
  if (context === void 0) {
    throw new Error(true ? "Base UI: TabsRootContext is missing. Tabs parts must be placed within <Tabs.Root>." : formatErrorMessage(64));
  }
  return context;
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/root/TabsRootDataAttributes.js
var TabsRootDataAttributes = /* @__PURE__ */ (function(TabsRootDataAttributes2) {
  TabsRootDataAttributes2["activationDirection"] = "data-activation-direction";
  TabsRootDataAttributes2["orientation"] = "data-orientation";
  return TabsRootDataAttributes2;
})({});

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/root/stateAttributesMapping.js
var tabsStateAttributesMapping = {
  tabActivationDirection: (dir) => ({
    [TabsRootDataAttributes.activationDirection]: dir
  })
};

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/root/TabsRoot.js
var import_jsx_runtime103 = __toESM(require_jsx_runtime(), 1);
var TabsRoot = /* @__PURE__ */ React19.forwardRef(function TabsRoot2(componentProps, forwardedRef) {
  const {
    className,
    defaultValue: defaultValue2 = 0,
    onValueChange: onValueChangeProp,
    orientation = "horizontal",
    render: render4,
    value: valueProp,
    ...elementProps
  } = componentProps;
  const direction = useDirection();
  const tabPanelRefs = React19.useRef([]);
  const [mountedTabPanels, setMountedTabPanels] = React19.useState(() => /* @__PURE__ */ new Map());
  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue2,
    name: "Tabs",
    state: "value"
  });
  const [tabMap, setTabMap] = React19.useState(() => /* @__PURE__ */ new Map());
  const [tabActivationDirection, setTabActivationDirection] = React19.useState("none");
  const onValueChange = useStableCallback((newValue, eventDetails) => {
    onValueChangeProp?.(newValue, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setValue(newValue);
    setTabActivationDirection(eventDetails.activationDirection);
  });
  const registerMountedTabPanel = useStableCallback((panelValue, panelId) => {
    setMountedTabPanels((prev) => {
      if (prev.get(panelValue) === panelId) {
        return prev;
      }
      const next = new Map(prev);
      next.set(panelValue, panelId);
      return next;
    });
  });
  const unregisterMountedTabPanel = useStableCallback((panelValue, panelId) => {
    setMountedTabPanels((prev) => {
      if (!prev.has(panelValue) || prev.get(panelValue) !== panelId) {
        return prev;
      }
      const next = new Map(prev);
      next.delete(panelValue);
      return next;
    });
  });
  const getTabPanelIdByValue = React19.useCallback((tabValue) => {
    return mountedTabPanels.get(tabValue);
  }, [mountedTabPanels]);
  const getTabIdByPanelValue = React19.useCallback((tabPanelValue) => {
    for (const tabMetadata of tabMap.values()) {
      if (tabPanelValue === tabMetadata?.value) {
        return tabMetadata?.id;
      }
    }
    return void 0;
  }, [tabMap]);
  const getTabElementBySelectedValue = React19.useCallback((selectedValue) => {
    if (selectedValue === void 0) {
      return null;
    }
    for (const [tabElement, tabMetadata] of tabMap.entries()) {
      if (tabMetadata != null && selectedValue === (tabMetadata.value ?? tabMetadata.index)) {
        return tabElement;
      }
    }
    return null;
  }, [tabMap]);
  const tabsContextValue = React19.useMemo(() => ({
    direction,
    getTabElementBySelectedValue,
    getTabIdByPanelValue,
    getTabPanelIdByValue,
    onValueChange,
    orientation,
    registerMountedTabPanel,
    setTabMap,
    unregisterMountedTabPanel,
    tabActivationDirection,
    value
  }), [direction, getTabElementBySelectedValue, getTabIdByPanelValue, getTabPanelIdByValue, onValueChange, orientation, registerMountedTabPanel, setTabMap, unregisterMountedTabPanel, tabActivationDirection, value]);
  const state = {
    orientation,
    tabActivationDirection
  };
  const element = useRenderElement2("div", componentProps, {
    state,
    ref: forwardedRef,
    props: elementProps,
    stateAttributesMapping: tabsStateAttributesMapping
  });
  return /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(TabsRootContext.Provider, {
    value: tabsContextValue,
    children: /* @__PURE__ */ (0, import_jsx_runtime103.jsx)(CompositeList, {
      elementsRef: tabPanelRefs,
      children: element
    })
  });
});
if (true) TabsRoot.displayName = "TabsRoot";

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/tab/TabsTab.js
var React28 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/owner.js
function ownerDocument(node) {
  return node?.ownerDocument || document;
}

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useId.js
var React21 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/safeReact.js
var React20 = __toESM(require_react(), 1);
var SafeReact = {
  ...React20
};

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useId.js
var globalId = 0;
function useGlobalId(idOverride, prefix = "mui") {
  const [defaultId, setDefaultId] = React21.useState(idOverride);
  const id = idOverride || defaultId;
  React21.useEffect(() => {
    if (defaultId == null) {
      globalId += 1;
      setDefaultId(`${prefix}-${globalId}`);
    }
  }, [defaultId, prefix]);
  return id;
}
var maybeReactUseId = SafeReact.useId;
function useId4(idOverride, prefix) {
  if (maybeReactUseId !== void 0) {
    const reactId = maybeReactUseId();
    return idOverride ?? (prefix ? `${prefix}-${reactId}` : reactId);
  }
  return useGlobalId(idOverride, prefix);
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/utils/useBaseUiId.js
function useBaseUiId(idOverride) {
  return useId4(idOverride, "base-ui");
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/use-button/useButton.js
var React24 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/error.js
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

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/root/CompositeRootContext.js
var React22 = __toESM(require_react(), 1);
var CompositeRootContext = /* @__PURE__ */ React22.createContext(void 0);
if (true) CompositeRootContext.displayName = "CompositeRootContext";
function useCompositeRootContext(optional = false) {
  const context = React22.useContext(CompositeRootContext);
  if (context === void 0 && !optional) {
    throw new Error(true ? "Base UI: CompositeRootContext is missing. Composite parts must be placed within <Composite.Root>." : formatErrorMessage(16));
  }
  return context;
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/utils/useFocusableWhenDisabled.js
var React23 = __toESM(require_react(), 1);
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
  const props = React23.useMemo(() => {
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

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/use-button/useButton.js
function useButton(parameters = {}) {
  const {
    disabled: disabled2 = false,
    focusableWhenDisabled,
    tabIndex = 0,
    native: isNativeButton = true
  } = parameters;
  const elementRef = React24.useRef(null);
  const isCompositeItem = useCompositeRootContext(true) !== void 0;
  const isValidLink = useStableCallback(() => {
    const element = elementRef.current;
    return Boolean(element?.tagName === "A" && element?.href);
  });
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
    React24.useEffect(() => {
      if (!elementRef.current) {
        return;
      }
      const isButtonTag = elementRef.current.tagName === "BUTTON";
      if (isNativeButton) {
        if (!isButtonTag) {
          error("A component that acts as a button was not rendered as a native <button>, which does not match the default. Ensure that the element passed to the `render` prop of the component is a real <button>, or set the `nativeButton` prop on the component to `false`.");
        }
      } else if (isButtonTag) {
        error("A component that acts as a button was rendered as a native <button>, which does not match the default. Ensure that the element passed to the `render` prop of the component is not a real <button>, or set the `nativeButton` prop on the component to `true`.");
      }
    }, [isNativeButton]);
  }
  const updateDisabled = React24.useCallback(() => {
    const element = elementRef.current;
    if (!isButtonElement(element)) {
      return;
    }
    if (isCompositeItem && disabled2 && focusableWhenDisabledProps.disabled === void 0 && element.disabled) {
      element.disabled = false;
    }
  }, [disabled2, focusableWhenDisabledProps.disabled, isCompositeItem]);
  useIsoLayoutEffect(updateDisabled, [updateDisabled]);
  const getButtonProps = React24.useCallback((externalProps = {}) => {
    const {
      onClick: externalOnClick,
      onMouseDown: externalOnMouseDown,
      onKeyUp: externalOnKeyUp,
      onKeyDown: externalOnKeyDown,
      onPointerDown: externalOnPointerDown,
      ...otherExternalProps
    } = externalProps;
    const type = isNativeButton ? "button" : void 0;
    return mergeProps3({
      type,
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
        if (!disabled2) {
          makeEventPreventable2(event);
          externalOnKeyDown?.(event);
        }
        if (event.baseUIHandlerPrevented) {
          return;
        }
        const shouldClick = event.target === event.currentTarget && !isNativeButton && !isValidLink() && !disabled2;
        const isEnterKey = event.key === "Enter";
        const isSpaceKey = event.key === " ";
        if (shouldClick) {
          if (isSpaceKey || isEnterKey) {
            event.preventDefault();
          }
          if (isEnterKey) {
            externalOnClick?.(event);
          }
        }
      },
      onKeyUp(event) {
        if (!disabled2) {
          makeEventPreventable2(event);
          externalOnKeyUp?.(event);
        }
        if (event.baseUIHandlerPrevented) {
          return;
        }
        if (event.target === event.currentTarget && !isNativeButton && !disabled2 && event.key === " ") {
          externalOnClick?.(event);
        }
      },
      onPointerDown(event) {
        if (disabled2) {
          event.preventDefault();
          return;
        }
        externalOnPointerDown?.(event);
      }
    }, !isNativeButton ? {
      role: "button"
    } : void 0, focusableWhenDisabledProps, otherExternalProps);
  }, [disabled2, focusableWhenDisabledProps, isNativeButton, isValidLink]);
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

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/constants.js
var ACTIVE_COMPOSITE_ITEM = "data-composite-item-active";

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/item/useCompositeItem.js
var React26 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/list/useCompositeListItem.js
var React25 = __toESM(require_react(), 1);
var IndexGuessBehavior = /* @__PURE__ */ (function(IndexGuessBehavior2) {
  IndexGuessBehavior2[IndexGuessBehavior2["None"] = 0] = "None";
  IndexGuessBehavior2[IndexGuessBehavior2["GuessFromOrder"] = 1] = "GuessFromOrder";
  return IndexGuessBehavior2;
})({});
function useCompositeListItem(params = {}) {
  const {
    label,
    metadata,
    textRef,
    indexGuessBehavior,
    index: externalIndex
  } = params;
  const {
    register: register3,
    unregister,
    subscribeMapChange,
    elementsRef,
    labelsRef,
    nextIndexRef
  } = useCompositeListContext();
  const indexRef = React25.useRef(-1);
  const [index, setIndex] = React25.useState(externalIndex ?? (indexGuessBehavior === IndexGuessBehavior.GuessFromOrder ? () => {
    if (indexRef.current === -1) {
      const newIndex = nextIndexRef.current;
      nextIndexRef.current += 1;
      indexRef.current = newIndex;
    }
    return indexRef.current;
  } : -1));
  const componentRef = React25.useRef(null);
  const ref = React25.useCallback((node) => {
    componentRef.current = node;
    if (index !== -1 && node !== null) {
      elementsRef.current[index] = node;
      if (labelsRef) {
        const isLabelDefined = label !== void 0;
        labelsRef.current[index] = isLabelDefined ? label : textRef?.current?.textContent ?? node.textContent;
      }
    }
  }, [index, elementsRef, labelsRef, label, textRef]);
  useIsoLayoutEffect(() => {
    if (externalIndex != null) {
      return void 0;
    }
    const node = componentRef.current;
    if (node) {
      register3(node, metadata);
      return () => {
        unregister(node);
      };
    }
    return void 0;
  }, [externalIndex, register3, unregister, metadata]);
  useIsoLayoutEffect(() => {
    if (externalIndex != null) {
      return void 0;
    }
    return subscribeMapChange((map) => {
      const i2 = componentRef.current ? map.get(componentRef.current)?.index : null;
      if (i2 != null) {
        setIndex(i2);
      }
    });
  }, [externalIndex, subscribeMapChange, setIndex]);
  return React25.useMemo(() => ({
    ref,
    index
  }), [index, ref]);
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/item/useCompositeItem.js
function useCompositeItem3(params = {}) {
  const {
    highlightItemOnHover,
    highlightedIndex,
    onHighlightedIndexChange
  } = useCompositeRootContext();
  const {
    ref,
    index
  } = useCompositeListItem(params);
  const isHighlighted = highlightedIndex === index;
  const itemRef = React26.useRef(null);
  const mergedRef = useMergedRefs2(ref, itemRef);
  const compositeProps = React26.useMemo(() => ({
    tabIndex: isHighlighted ? 0 : -1,
    onFocus() {
      onHighlightedIndexChange(index);
    },
    onMouseMove() {
      const item = itemRef.current;
      if (!highlightItemOnHover || !item) {
        return;
      }
      const disabled2 = item.hasAttribute("disabled") || item.ariaDisabled === "true";
      if (!isHighlighted && !disabled2) {
        item.focus();
      }
    }
  }), [isHighlighted, onHighlightedIndexChange, index, highlightItemOnHover]);
  return {
    compositeProps,
    compositeRef: mergedRef,
    index
  };
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/list/TabsListContext.js
var React27 = __toESM(require_react(), 1);
var TabsListContext = /* @__PURE__ */ React27.createContext(void 0);
if (true) TabsListContext.displayName = "TabsListContext";
function useTabsListContext() {
  const context = React27.useContext(TabsListContext);
  if (context === void 0) {
    throw new Error(true ? "Base UI: TabsListContext is missing. TabsList parts must be placed within <Tabs.List>." : formatErrorMessage(65));
  }
  return context;
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/utils/reason-parts.js
var reason_parts_exports = {};
__export(reason_parts_exports, {
  cancelOpen: () => cancelOpen,
  chipRemovePress: () => chipRemovePress,
  clearPress: () => clearPress,
  closePress: () => closePress,
  decrementPress: () => decrementPress,
  disabled: () => disabled,
  drag: () => drag,
  escapeKey: () => escapeKey,
  focusOut: () => focusOut,
  imperativeAction: () => imperativeAction,
  incrementPress: () => incrementPress,
  inputBlur: () => inputBlur,
  inputChange: () => inputChange,
  inputClear: () => inputClear,
  inputPaste: () => inputPaste,
  itemPress: () => itemPress,
  keyboard: () => keyboard,
  linkPress: () => linkPress,
  listNavigation: () => listNavigation,
  none: () => none,
  outsidePress: () => outsidePress,
  pointer: () => pointer,
  scrub: () => scrub,
  siblingOpen: () => siblingOpen,
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
var focusOut = "focus-out";
var escapeKey = "escape-key";
var listNavigation = "list-navigation";
var keyboard = "keyboard";
var pointer = "pointer";
var drag = "drag";
var wheel = "wheel";
var scrub = "scrub";
var cancelOpen = "cancel-open";
var siblingOpen = "sibling-open";
var disabled = "disabled";
var imperativeAction = "imperative-action";
var windowResize = "window-resize";

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/utils/createBaseUIEventDetails.js
function createChangeEventDetails(reason, event, trigger, customProperties) {
  let canceled = false;
  let allowPropagation = false;
  const custom = customProperties ?? EMPTY_OBJECT2;
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

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/floating-ui-react/utils/constants.js
var ARROW_LEFT = "ArrowLeft";
var ARROW_RIGHT = "ArrowRight";
var ARROW_UP = "ArrowUp";
var ARROW_DOWN = "ArrowDown";

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/floating-ui-react/utils/element.js
function activeElement(doc) {
  let element = doc.activeElement;
  while (element?.shadowRoot?.activeElement != null) {
    element = element.shadowRoot.activeElement;
  }
  return element;
}
function contains2(parent, child) {
  if (!parent || !child) {
    return false;
  }
  const rootNode = child.getRootNode?.();
  if (parent.contains(child)) {
    return true;
  }
  if (rootNode && isShadowRoot(rootNode)) {
    let next = child;
    while (next) {
      if (parent === next) {
        return true;
      }
      next = next.parentNode || next.host;
    }
  }
  return false;
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/floating-ui-react/utils/event.js
function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/floating-ui-react/utils/composite.js
function isDifferentGridRow(index, cols, prevRow) {
  return Math.floor(index / cols) !== prevRow;
}
function isIndexOutOfListBounds(listRef, index) {
  return index < 0 || index >= listRef.current.length;
}
function getMinListIndex(listRef, disabledIndices) {
  return findNonDisabledListIndex(listRef, {
    disabledIndices
  });
}
function getMaxListIndex(listRef, disabledIndices) {
  return findNonDisabledListIndex(listRef, {
    decrement: true,
    startingIndex: listRef.current.length,
    disabledIndices
  });
}
function findNonDisabledListIndex(listRef, {
  startingIndex = -1,
  decrement = false,
  disabledIndices,
  amount = 1
} = {}) {
  let index = startingIndex;
  do {
    index += decrement ? -amount : amount;
  } while (index >= 0 && index <= listRef.current.length - 1 && isListIndexDisabled(listRef, index, disabledIndices));
  return index;
}
function getGridNavigatedIndex(listRef, {
  event,
  orientation,
  loopFocus,
  rtl,
  cols,
  disabledIndices,
  minIndex,
  maxIndex,
  prevIndex,
  stopEvent: stop = false
}) {
  let nextIndex = prevIndex;
  const rows = [];
  const rowIndexMap = {};
  let hasRoleRow = false;
  {
    let currentRowEl = null;
    let currentRowIndex = -1;
    listRef.current.forEach((el, idx) => {
      if (el == null) {
        return;
      }
      const rowEl = el.closest('[role="row"]');
      if (rowEl) {
        hasRoleRow = true;
      }
      if (rowEl !== currentRowEl || currentRowIndex === -1) {
        currentRowEl = rowEl;
        currentRowIndex += 1;
        rows[currentRowIndex] = [];
      }
      rows[currentRowIndex].push(idx);
      rowIndexMap[idx] = currentRowIndex;
    });
  }
  const hasDomRows = hasRoleRow && rows.length > 0 && rows.some((row) => row.length !== cols);
  function navigateVertically(direction) {
    if (!hasDomRows || prevIndex === -1) {
      return void 0;
    }
    const currentRow = rowIndexMap[prevIndex];
    if (currentRow == null) {
      return void 0;
    }
    const colInRow = rows[currentRow].indexOf(prevIndex);
    let nextRow = direction === "up" ? currentRow - 1 : currentRow + 1;
    if (loopFocus) {
      if (nextRow < 0) {
        nextRow = rows.length - 1;
      } else if (nextRow >= rows.length) {
        nextRow = 0;
      }
    }
    const visited = /* @__PURE__ */ new Set();
    while (nextRow >= 0 && nextRow < rows.length && !visited.has(nextRow)) {
      visited.add(nextRow);
      const targetRow = rows[nextRow];
      if (targetRow.length === 0) {
        nextRow = direction === "up" ? nextRow - 1 : nextRow + 1;
        continue;
      }
      const clampedCol = Math.min(colInRow, targetRow.length - 1);
      for (let col = clampedCol; col >= 0; col -= 1) {
        const candidate = targetRow[col];
        if (!isListIndexDisabled(listRef, candidate, disabledIndices)) {
          return candidate;
        }
      }
      nextRow = direction === "up" ? nextRow - 1 : nextRow + 1;
      if (loopFocus) {
        if (nextRow < 0) {
          nextRow = rows.length - 1;
        } else if (nextRow >= rows.length) {
          nextRow = 0;
        }
      }
    }
    return void 0;
  }
  if (event.key === ARROW_UP) {
    const domBasedCandidate = navigateVertically("up");
    if (domBasedCandidate !== void 0) {
      if (stop) {
        stopEvent(event);
      }
      nextIndex = domBasedCandidate;
    } else {
      if (stop) {
        stopEvent(event);
      }
      if (prevIndex === -1) {
        nextIndex = maxIndex;
      } else {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: nextIndex,
          amount: cols,
          decrement: true,
          disabledIndices
        });
        if (loopFocus && (prevIndex - cols < minIndex || nextIndex < 0)) {
          const col = prevIndex % cols;
          const maxCol = maxIndex % cols;
          const offset = maxIndex - (maxCol - col);
          if (maxCol === col) {
            nextIndex = maxIndex;
          } else {
            nextIndex = maxCol > col ? offset : offset - cols;
          }
        }
      }
      if (isIndexOutOfListBounds(listRef, nextIndex)) {
        nextIndex = prevIndex;
      }
    }
  }
  if (event.key === ARROW_DOWN) {
    const domBasedCandidate = navigateVertically("down");
    if (domBasedCandidate !== void 0) {
      if (stop) {
        stopEvent(event);
      }
      nextIndex = domBasedCandidate;
    } else {
      if (stop) {
        stopEvent(event);
      }
      if (prevIndex === -1) {
        nextIndex = minIndex;
      } else {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex,
          amount: cols,
          disabledIndices
        });
        if (loopFocus && prevIndex + cols > maxIndex) {
          nextIndex = findNonDisabledListIndex(listRef, {
            startingIndex: prevIndex % cols - cols,
            amount: cols,
            disabledIndices
          });
        }
      }
      if (isIndexOutOfListBounds(listRef, nextIndex)) {
        nextIndex = prevIndex;
      }
    }
  }
  if (orientation === "both") {
    const prevRow = floor(prevIndex / cols);
    if (event.key === (rtl ? ARROW_LEFT : ARROW_RIGHT)) {
      if (stop) {
        stopEvent(event);
      }
      if (prevIndex % cols !== cols - 1) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex,
          disabledIndices
        });
        if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
          nextIndex = findNonDisabledListIndex(listRef, {
            startingIndex: prevIndex - prevIndex % cols - 1,
            disabledIndices
          });
        }
      } else if (loopFocus) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex - prevIndex % cols - 1,
          disabledIndices
        });
      }
      if (isDifferentGridRow(nextIndex, cols, prevRow)) {
        nextIndex = prevIndex;
      }
    }
    if (event.key === (rtl ? ARROW_RIGHT : ARROW_LEFT)) {
      if (stop) {
        stopEvent(event);
      }
      if (prevIndex % cols !== 0) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex,
          decrement: true,
          disabledIndices
        });
        if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
          nextIndex = findNonDisabledListIndex(listRef, {
            startingIndex: prevIndex + (cols - prevIndex % cols),
            decrement: true,
            disabledIndices
          });
        }
      } else if (loopFocus) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex + (cols - prevIndex % cols),
          decrement: true,
          disabledIndices
        });
      }
      if (isDifferentGridRow(nextIndex, cols, prevRow)) {
        nextIndex = prevIndex;
      }
    }
    const lastRow = floor(maxIndex / cols) === prevRow;
    if (isIndexOutOfListBounds(listRef, nextIndex)) {
      if (loopFocus && lastRow) {
        nextIndex = event.key === (rtl ? ARROW_RIGHT : ARROW_LEFT) ? maxIndex : findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex - prevIndex % cols - 1,
          disabledIndices
        });
      } else {
        nextIndex = prevIndex;
      }
    }
  }
  return nextIndex;
}
function createGridCellMap(sizes, cols, dense) {
  const cellMap = [];
  let startIndex = 0;
  sizes.forEach(({
    width,
    height
  }, index) => {
    if (width > cols) {
      if (true) {
        throw new Error(true ? `[Floating UI]: Invalid grid - item width at index ${index} is greater than grid columns` : formatErrorMessage(29, index));
      }
    }
    let itemPlaced = false;
    if (dense) {
      startIndex = 0;
    }
    while (!itemPlaced) {
      const targetCells = [];
      for (let i2 = 0; i2 < width; i2 += 1) {
        for (let j2 = 0; j2 < height; j2 += 1) {
          targetCells.push(startIndex + i2 + j2 * cols);
        }
      }
      if (startIndex % cols + width <= cols && targetCells.every((cell) => cellMap[cell] == null)) {
        targetCells.forEach((cell) => {
          cellMap[cell] = index;
        });
        itemPlaced = true;
      } else {
        startIndex += 1;
      }
    }
  });
  return [...cellMap];
}
function getGridCellIndexOfCorner(index, sizes, cellMap, cols, corner) {
  if (index === -1) {
    return -1;
  }
  const firstCellIndex = cellMap.indexOf(index);
  const sizeItem = sizes[index];
  switch (corner) {
    case "tl":
      return firstCellIndex;
    case "tr":
      if (!sizeItem) {
        return firstCellIndex;
      }
      return firstCellIndex + sizeItem.width - 1;
    case "bl":
      if (!sizeItem) {
        return firstCellIndex;
      }
      return firstCellIndex + (sizeItem.height - 1) * cols;
    case "br":
      return cellMap.lastIndexOf(index);
    default:
      return -1;
  }
}
function getGridCellIndices(indices, cellMap) {
  return cellMap.flatMap((index, cellIndex) => indices.includes(index) ? [cellIndex] : []);
}
function isListIndexDisabled(listRef, index, disabledIndices) {
  if (typeof disabledIndices === "function") {
    return disabledIndices(index);
  }
  if (disabledIndices) {
    return disabledIndices.includes(index);
  }
  const element = listRef.current[index];
  if (!element) {
    return false;
  }
  return element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true";
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/tab/TabsTab.js
var TabsTab = /* @__PURE__ */ React28.forwardRef(function TabsTab2(componentProps, forwardedRef) {
  const {
    className,
    disabled: disabled2 = false,
    render: render4,
    value,
    id: idProp,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    value: activeTabValue,
    getTabPanelIdByValue,
    orientation
  } = useTabsRootContext();
  const {
    activateOnFocus,
    highlightedTabIndex,
    onTabActivation,
    setHighlightedTabIndex,
    tabsListElement
  } = useTabsListContext();
  const id = useBaseUiId(idProp);
  const tabMetadata = React28.useMemo(() => ({
    disabled: disabled2,
    id,
    value
  }), [disabled2, id, value]);
  const {
    compositeProps,
    compositeRef,
    index
    // hook is used instead of the CompositeItem component
    // because the index is needed for Tab internals
  } = useCompositeItem3({
    metadata: tabMetadata
  });
  const active = value === activeTabValue;
  const isNavigatingRef = React28.useRef(false);
  useIsoLayoutEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }
    if (!(active && index > -1 && highlightedTabIndex !== index)) {
      return;
    }
    const listElement = tabsListElement;
    if (listElement != null) {
      const activeEl = activeElement(ownerDocument(listElement));
      if (activeEl && contains2(listElement, activeEl)) {
        return;
      }
    }
    setHighlightedTabIndex(index);
  }, [active, index, highlightedTabIndex, setHighlightedTabIndex, disabled2, tabsListElement]);
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled: disabled2,
    native: nativeButton,
    focusableWhenDisabled: true
  });
  const tabPanelId = getTabPanelIdByValue(value);
  const isPressingRef = React28.useRef(false);
  const isMainButtonRef = React28.useRef(false);
  function onClick(event) {
    if (active || disabled2) {
      return;
    }
    onTabActivation(value, createChangeEventDetails(reason_parts_exports.none, event.nativeEvent, void 0, {
      activationDirection: "none"
    }));
  }
  function onFocus(event) {
    if (active) {
      return;
    }
    if (index > -1) {
      setHighlightedTabIndex(index);
    }
    if (disabled2) {
      return;
    }
    if (activateOnFocus && (!isPressingRef.current || // keyboard or touch focus
    isPressingRef.current && isMainButtonRef.current)) {
      onTabActivation(value, createChangeEventDetails(reason_parts_exports.none, event.nativeEvent, void 0, {
        activationDirection: "none"
      }));
    }
  }
  function onPointerDown(event) {
    if (active || disabled2) {
      return;
    }
    isPressingRef.current = true;
    function handlePointerUp() {
      isPressingRef.current = false;
      isMainButtonRef.current = false;
    }
    if (!event.button || event.button === 0) {
      isMainButtonRef.current = true;
      const doc = ownerDocument(event.currentTarget);
      doc.addEventListener("pointerup", handlePointerUp, {
        once: true
      });
    }
  }
  const state = React28.useMemo(() => ({
    disabled: disabled2,
    active,
    orientation
  }), [disabled2, active, orientation]);
  const element = useRenderElement2("button", componentProps, {
    state,
    ref: [forwardedRef, buttonRef, compositeRef],
    props: [compositeProps, {
      role: "tab",
      "aria-controls": tabPanelId,
      "aria-selected": active,
      id,
      onClick,
      onFocus,
      onPointerDown,
      [ACTIVE_COMPOSITE_ITEM]: active ? "" : void 0,
      onKeyDownCapture() {
        isNavigatingRef.current = true;
      }
    }, elementProps, getButtonProps]
  });
  return element;
});
if (true) TabsTab.displayName = "TabsTab";

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/indicator/TabsIndicator.js
var React31 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useForcedRerendering.js
var React29 = __toESM(require_react(), 1);
function useForcedRerendering() {
  const [, setState] = React29.useState({});
  return React29.useCallback(() => {
    setState({});
  }, []);
}

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/useOnMount.js
var React30 = __toESM(require_react(), 1);
var EMPTY = [];
function useOnMount(fn) {
  React30.useEffect(fn, EMPTY);
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/indicator/prehydrationScript.min.js
var script = '!function(){const t=document.currentScript.previousElementSibling;if(!t)return;const e=t.closest(\'[role="tablist"]\');if(!e)return;const i=e.querySelector("[data-active]");if(!i)return;if(0===i.offsetWidth||0===e.offsetWidth)return;const l=getComputedStyle(e).direction;let n=0,o=0,c=0,r=0,f=0,s=0;if(null!=i&&null!=e){const t=e.getBoundingClientRect(),{left:u,top:d,width:h,height:p}=i.getBoundingClientRect();n=u-t.left+e.scrollLeft-e.clientLeft,c=d-t.top+e.scrollTop-e.clientTop,f=h,s=p,o="ltr"===l?e.scrollWidth-n-f-e.clientLeft:n-e.clientLeft,r=e.scrollHeight-c-s-e.clientTop}function u(e,i){t.style.setProperty(`--active-tab-${e}`,`${i}px`)}u("left",n),u("right",o),u("top",c),u("bottom",r),u("width",f),u("height",s),f>0&&s>0&&t.removeAttribute("hidden")}();';

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/indicator/TabsIndicatorCssVars.js
var TabsIndicatorCssVars = /* @__PURE__ */ (function(TabsIndicatorCssVars2) {
  TabsIndicatorCssVars2["activeTabLeft"] = "--active-tab-left";
  TabsIndicatorCssVars2["activeTabRight"] = "--active-tab-right";
  TabsIndicatorCssVars2["activeTabTop"] = "--active-tab-top";
  TabsIndicatorCssVars2["activeTabBottom"] = "--active-tab-bottom";
  TabsIndicatorCssVars2["activeTabWidth"] = "--active-tab-width";
  TabsIndicatorCssVars2["activeTabHeight"] = "--active-tab-height";
  return TabsIndicatorCssVars2;
})({});

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/indicator/TabsIndicator.js
var import_jsx_runtime104 = __toESM(require_jsx_runtime(), 1);
var stateAttributesMapping = {
  ...tabsStateAttributesMapping,
  activeTabPosition: () => null,
  activeTabSize: () => null
};
var TabsIndicator = /* @__PURE__ */ React31.forwardRef(function TabIndicator(componentProps, forwardedRef) {
  const {
    className,
    render: render4,
    renderBeforeHydration = false,
    ...elementProps
  } = componentProps;
  const {
    getTabElementBySelectedValue,
    orientation,
    tabActivationDirection,
    value
  } = useTabsRootContext();
  const {
    tabsListElement
  } = useTabsListContext();
  const [isMounted, setIsMounted] = React31.useState(false);
  const {
    value: activeTabValue
  } = useTabsRootContext();
  const direction = useDirection();
  useOnMount(() => setIsMounted(true));
  const rerender = useForcedRerendering();
  React31.useEffect(() => {
    if (value != null && tabsListElement != null && typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(rerender);
      resizeObserver.observe(tabsListElement);
      return () => {
        resizeObserver.disconnect();
      };
    }
    return void 0;
  }, [value, tabsListElement, rerender]);
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;
  let width = 0;
  let height = 0;
  let isTabSelected = false;
  if (value != null && tabsListElement != null) {
    const activeTab = getTabElementBySelectedValue(value);
    isTabSelected = true;
    if (activeTab != null) {
      const tabsListRect = tabsListElement.getBoundingClientRect();
      const {
        left: tabLeft,
        top: tabTop,
        width: computedWidth,
        height: computedHeight
      } = activeTab.getBoundingClientRect();
      left = tabLeft - tabsListRect.left + tabsListElement.scrollLeft - tabsListElement.clientLeft;
      top = tabTop - tabsListRect.top + tabsListElement.scrollTop - tabsListElement.clientTop;
      width = computedWidth;
      height = computedHeight;
      right = direction === "ltr" ? tabsListElement.scrollWidth - left - width - tabsListElement.clientLeft : left - tabsListElement.clientLeft;
      bottom = tabsListElement.scrollHeight - top - height - tabsListElement.clientTop;
    }
  }
  const activeTabPosition = React31.useMemo(() => isTabSelected ? {
    left,
    right,
    top,
    bottom
  } : null, [left, right, top, bottom, isTabSelected]);
  const activeTabSize = React31.useMemo(() => isTabSelected ? {
    width,
    height
  } : null, [width, height, isTabSelected]);
  const style = React31.useMemo(() => {
    if (!isTabSelected) {
      return void 0;
    }
    return {
      [TabsIndicatorCssVars.activeTabLeft]: `${left}px`,
      [TabsIndicatorCssVars.activeTabRight]: `${right}px`,
      [TabsIndicatorCssVars.activeTabTop]: `${top}px`,
      [TabsIndicatorCssVars.activeTabBottom]: `${bottom}px`,
      [TabsIndicatorCssVars.activeTabWidth]: `${width}px`,
      [TabsIndicatorCssVars.activeTabHeight]: `${height}px`
    };
  }, [left, right, top, bottom, width, height, isTabSelected]);
  const displayIndicator = isTabSelected && width > 0 && height > 0;
  const state = React31.useMemo(() => ({
    orientation,
    activeTabPosition,
    activeTabSize,
    tabActivationDirection
  }), [orientation, activeTabPosition, activeTabSize, tabActivationDirection]);
  const element = useRenderElement2("span", componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      role: "presentation",
      style,
      hidden: !displayIndicator
      // do not display the indicator before the layout is settled
    }, elementProps, {
      suppressHydrationWarning: true
    }],
    stateAttributesMapping
  });
  if (activeTabValue == null) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime104.jsxs)(React31.Fragment, {
    children: [element, !isMounted && renderBeforeHydration && /* @__PURE__ */ (0, import_jsx_runtime104.jsx)("script", {
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML: {
        __html: script
      },
      suppressHydrationWarning: true
    })]
  });
});
if (true) TabsIndicator.displayName = "TabsIndicator";

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/panel/TabsPanel.js
var React32 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/panel/TabsPanelDataAttributes.js
var TabsPanelDataAttributes = /* @__PURE__ */ (function(TabsPanelDataAttributes2) {
  TabsPanelDataAttributes2["index"] = "data-index";
  TabsPanelDataAttributes2["activationDirection"] = "data-activation-direction";
  TabsPanelDataAttributes2["orientation"] = "data-orientation";
  TabsPanelDataAttributes2["hidden"] = "data-hidden";
  return TabsPanelDataAttributes2;
})({});

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/panel/TabsPanel.js
var TabsPanel = /* @__PURE__ */ React32.forwardRef(function TabPanel(componentProps, forwardedRef) {
  const {
    className,
    value,
    render: render4,
    keepMounted = false,
    ...elementProps
  } = componentProps;
  const {
    value: selectedValue,
    getTabIdByPanelValue,
    orientation,
    tabActivationDirection,
    registerMountedTabPanel,
    unregisterMountedTabPanel
  } = useTabsRootContext();
  const id = useBaseUiId();
  const metadata = React32.useMemo(() => ({
    id,
    value
  }), [id, value]);
  const {
    ref: listItemRef,
    index
  } = useCompositeListItem({
    metadata
  });
  const hidden = value !== selectedValue;
  const correspondingTabId = getTabIdByPanelValue(value);
  const state = React32.useMemo(() => ({
    hidden,
    orientation,
    tabActivationDirection
  }), [hidden, orientation, tabActivationDirection]);
  const element = useRenderElement2("div", componentProps, {
    state,
    ref: [forwardedRef, listItemRef],
    props: [{
      "aria-labelledby": correspondingTabId,
      hidden,
      id: id ?? void 0,
      role: "tabpanel",
      tabIndex: hidden ? -1 : 0,
      [TabsPanelDataAttributes.index]: index
    }, elementProps],
    stateAttributesMapping: tabsStateAttributesMapping
  });
  useIsoLayoutEffect(() => {
    if (hidden && !keepMounted) {
      return void 0;
    }
    if (id == null) {
      return void 0;
    }
    registerMountedTabPanel(value, id);
    return () => {
      unregisterMountedTabPanel(value, id);
    };
  }, [hidden, keepMounted, value, id, registerMountedTabPanel, unregisterMountedTabPanel]);
  const shouldRender = !hidden || keepMounted;
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (true) TabsPanel.displayName = "TabsPanel";

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/list/TabsList.js
var React35 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/root/CompositeRoot.js
var React34 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/root/useCompositeRoot.js
var React33 = __toESM(require_react(), 1);

// ../../../node_modules/.pnpm/@base-ui-components+utils@0.2.2_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/utils/esm/isElementDisabled.js
function isElementDisabled(element) {
  return element == null || element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true";
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/composite.js
var ARROW_UP2 = "ArrowUp";
var ARROW_DOWN2 = "ArrowDown";
var ARROW_LEFT2 = "ArrowLeft";
var ARROW_RIGHT2 = "ArrowRight";
var HOME = "Home";
var END = "End";
var HORIZONTAL_KEYS = /* @__PURE__ */ new Set([ARROW_LEFT2, ARROW_RIGHT2]);
var HORIZONTAL_KEYS_WITH_EXTRA_KEYS = /* @__PURE__ */ new Set([ARROW_LEFT2, ARROW_RIGHT2, HOME, END]);
var VERTICAL_KEYS = /* @__PURE__ */ new Set([ARROW_UP2, ARROW_DOWN2]);
var VERTICAL_KEYS_WITH_EXTRA_KEYS = /* @__PURE__ */ new Set([ARROW_UP2, ARROW_DOWN2, HOME, END]);
var ARROW_KEYS = /* @__PURE__ */ new Set([...HORIZONTAL_KEYS, ...VERTICAL_KEYS]);
var ALL_KEYS = /* @__PURE__ */ new Set([...ARROW_KEYS, HOME, END]);
var SHIFT = "Shift";
var CONTROL = "Control";
var ALT = "Alt";
var META = "Meta";
var MODIFIER_KEYS = /* @__PURE__ */ new Set([SHIFT, CONTROL, ALT, META]);
function isInputElement(element) {
  return isHTMLElement(element) && element.tagName === "INPUT";
}
function isNativeInput(element) {
  if (isInputElement(element) && element.selectionStart != null) {
    return true;
  }
  if (isHTMLElement(element) && element.tagName === "TEXTAREA") {
    return true;
  }
  return false;
}
function scrollIntoViewIfNeeded2(scrollContainer, element, direction, orientation) {
  if (!scrollContainer || !element || !element.scrollTo) {
    return;
  }
  let targetX = scrollContainer.scrollLeft;
  let targetY = scrollContainer.scrollTop;
  const isOverflowingX = scrollContainer.clientWidth < scrollContainer.scrollWidth;
  const isOverflowingY = scrollContainer.clientHeight < scrollContainer.scrollHeight;
  if (isOverflowingX && orientation !== "vertical") {
    const elementOffsetLeft = getOffset(scrollContainer, element, "left");
    const containerStyles = getStyles(scrollContainer);
    const elementStyles = getStyles(element);
    if (direction === "ltr") {
      if (elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight > scrollContainer.scrollLeft + scrollContainer.clientWidth - containerStyles.scrollPaddingRight) {
        targetX = elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight - scrollContainer.clientWidth + containerStyles.scrollPaddingRight;
      } else if (elementOffsetLeft - elementStyles.scrollMarginLeft < scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft) {
        targetX = elementOffsetLeft - elementStyles.scrollMarginLeft - containerStyles.scrollPaddingLeft;
      }
    }
    if (direction === "rtl") {
      if (elementOffsetLeft - elementStyles.scrollMarginRight < scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft) {
        targetX = elementOffsetLeft - elementStyles.scrollMarginLeft - containerStyles.scrollPaddingLeft;
      } else if (elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight > scrollContainer.scrollLeft + scrollContainer.clientWidth - containerStyles.scrollPaddingRight) {
        targetX = elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight - scrollContainer.clientWidth + containerStyles.scrollPaddingRight;
      }
    }
  }
  if (isOverflowingY && orientation !== "horizontal") {
    const elementOffsetTop = getOffset(scrollContainer, element, "top");
    const containerStyles = getStyles(scrollContainer);
    const elementStyles = getStyles(element);
    if (elementOffsetTop - elementStyles.scrollMarginTop < scrollContainer.scrollTop + containerStyles.scrollPaddingTop) {
      targetY = elementOffsetTop - elementStyles.scrollMarginTop - containerStyles.scrollPaddingTop;
    } else if (elementOffsetTop + element.offsetHeight + elementStyles.scrollMarginBottom > scrollContainer.scrollTop + scrollContainer.clientHeight - containerStyles.scrollPaddingBottom) {
      targetY = elementOffsetTop + element.offsetHeight + elementStyles.scrollMarginBottom - scrollContainer.clientHeight + containerStyles.scrollPaddingBottom;
    }
  }
  scrollContainer.scrollTo({
    left: targetX,
    top: targetY,
    behavior: "auto"
  });
}
function getOffset(ancestor, element, side) {
  const propName = side === "left" ? "offsetLeft" : "offsetTop";
  let result = 0;
  while (element.offsetParent) {
    result += element[propName];
    if (element.offsetParent === ancestor) {
      break;
    }
    element = element.offsetParent;
  }
  return result;
}
function getStyles(element) {
  const styles = getComputedStyle(element);
  return {
    scrollMarginTop: parseFloat(styles.scrollMarginTop) || 0,
    scrollMarginRight: parseFloat(styles.scrollMarginRight) || 0,
    scrollMarginBottom: parseFloat(styles.scrollMarginBottom) || 0,
    scrollMarginLeft: parseFloat(styles.scrollMarginLeft) || 0,
    scrollPaddingTop: parseFloat(styles.scrollPaddingTop) || 0,
    scrollPaddingRight: parseFloat(styles.scrollPaddingRight) || 0,
    scrollPaddingBottom: parseFloat(styles.scrollPaddingBottom) || 0,
    scrollPaddingLeft: parseFloat(styles.scrollPaddingLeft) || 0
  };
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/root/useCompositeRoot.js
var EMPTY_ARRAY8 = [];
function useCompositeRoot(params) {
  const {
    itemSizes,
    cols = 1,
    loopFocus = true,
    dense = false,
    orientation = "both",
    direction,
    highlightedIndex: externalHighlightedIndex,
    onHighlightedIndexChange: externalSetHighlightedIndex,
    rootRef: externalRef,
    enableHomeAndEndKeys = false,
    stopEventPropagation = false,
    disabledIndices,
    modifierKeys = EMPTY_ARRAY8
  } = params;
  const [internalHighlightedIndex, internalSetHighlightedIndex] = React33.useState(0);
  const isGrid2 = cols > 1;
  const rootRef = React33.useRef(null);
  const mergedRef = useMergedRefs2(rootRef, externalRef);
  const elementsRef = React33.useRef([]);
  const hasSetDefaultIndexRef = React33.useRef(false);
  const highlightedIndex = externalHighlightedIndex ?? internalHighlightedIndex;
  const onHighlightedIndexChange = useStableCallback((index, shouldScrollIntoView = false) => {
    (externalSetHighlightedIndex ?? internalSetHighlightedIndex)(index);
    if (shouldScrollIntoView) {
      const newActiveItem = elementsRef.current[index];
      scrollIntoViewIfNeeded2(rootRef.current, newActiveItem, direction, orientation);
    }
  });
  const onMapChange = useStableCallback((map) => {
    if (map.size === 0 || hasSetDefaultIndexRef.current) {
      return;
    }
    hasSetDefaultIndexRef.current = true;
    const sortedElements = Array.from(map.keys());
    const activeItem = sortedElements.find((compositeElement) => compositeElement?.hasAttribute(ACTIVE_COMPOSITE_ITEM)) ?? null;
    const activeIndex = activeItem ? sortedElements.indexOf(activeItem) : -1;
    if (activeIndex !== -1) {
      onHighlightedIndexChange(activeIndex);
    }
    scrollIntoViewIfNeeded2(rootRef.current, activeItem, direction, orientation);
  });
  const props = React33.useMemo(() => ({
    "aria-orientation": orientation === "both" ? void 0 : orientation,
    ref: mergedRef,
    onFocus(event) {
      const element = rootRef.current;
      if (!element || !isNativeInput(event.target)) {
        return;
      }
      event.target.setSelectionRange(0, event.target.value.length ?? 0);
    },
    onKeyDown(event) {
      const RELEVANT_KEYS = enableHomeAndEndKeys ? ALL_KEYS : ARROW_KEYS;
      if (!RELEVANT_KEYS.has(event.key)) {
        return;
      }
      if (isModifierKeySet(event, modifierKeys)) {
        return;
      }
      const element = rootRef.current;
      if (!element) {
        return;
      }
      const isRtl = direction === "rtl";
      const horizontalForwardKey = isRtl ? ARROW_LEFT2 : ARROW_RIGHT2;
      const forwardKey = {
        horizontal: horizontalForwardKey,
        vertical: ARROW_DOWN2,
        both: horizontalForwardKey
      }[orientation];
      const horizontalBackwardKey = isRtl ? ARROW_RIGHT2 : ARROW_LEFT2;
      const backwardKey = {
        horizontal: horizontalBackwardKey,
        vertical: ARROW_UP2,
        both: horizontalBackwardKey
      }[orientation];
      if (isNativeInput(event.target) && !isElementDisabled(event.target)) {
        const selectionStart = event.target.selectionStart;
        const selectionEnd = event.target.selectionEnd;
        const textContent = event.target.value ?? "";
        if (selectionStart == null || event.shiftKey || selectionStart !== selectionEnd) {
          return;
        }
        if (event.key !== backwardKey && selectionStart < textContent.length) {
          return;
        }
        if (event.key !== forwardKey && selectionStart > 0) {
          return;
        }
      }
      let nextIndex = highlightedIndex;
      const minIndex = getMinListIndex(elementsRef, disabledIndices);
      const maxIndex = getMaxListIndex(elementsRef, disabledIndices);
      if (isGrid2) {
        const sizes = itemSizes || Array.from({
          length: elementsRef.current.length
        }, () => ({
          width: 1,
          height: 1
        }));
        const cellMap = createGridCellMap(sizes, cols, dense);
        const minGridIndex = cellMap.findIndex((index) => index != null && !isListIndexDisabled(elementsRef, index, disabledIndices));
        const maxGridIndex = cellMap.reduce((foundIndex, index, cellIndex) => index != null && !isListIndexDisabled(elementsRef, index, disabledIndices) ? cellIndex : foundIndex, -1);
        nextIndex = cellMap[getGridNavigatedIndex({
          current: cellMap.map((itemIndex) => itemIndex ? elementsRef.current[itemIndex] : null)
        }, {
          event,
          orientation,
          loopFocus,
          cols,
          // treat undefined (empty grid spaces) as disabled indices so we
          // don't end up in them
          disabledIndices: getGridCellIndices([...disabledIndices || elementsRef.current.map((_, index) => isListIndexDisabled(elementsRef, index) ? index : void 0), void 0], cellMap),
          minIndex: minGridIndex,
          maxIndex: maxGridIndex,
          prevIndex: getGridCellIndexOfCorner(
            highlightedIndex > maxIndex ? minIndex : highlightedIndex,
            sizes,
            cellMap,
            cols,
            // use a corner matching the edge closest to the direction we're
            // moving in so we don't end up in the same item. Prefer
            // top/left over bottom/right.
            // eslint-disable-next-line no-nested-ternary
            event.key === ARROW_DOWN2 ? "bl" : event.key === ARROW_RIGHT2 ? "tr" : "tl"
          ),
          rtl: isRtl
        })];
      }
      const forwardKeys = {
        horizontal: [horizontalForwardKey],
        vertical: [ARROW_DOWN2],
        both: [horizontalForwardKey, ARROW_DOWN2]
      }[orientation];
      const backwardKeys = {
        horizontal: [horizontalBackwardKey],
        vertical: [ARROW_UP2],
        both: [horizontalBackwardKey, ARROW_UP2]
      }[orientation];
      const preventedKeys = isGrid2 ? RELEVANT_KEYS : {
        horizontal: enableHomeAndEndKeys ? HORIZONTAL_KEYS_WITH_EXTRA_KEYS : HORIZONTAL_KEYS,
        vertical: enableHomeAndEndKeys ? VERTICAL_KEYS_WITH_EXTRA_KEYS : VERTICAL_KEYS,
        both: RELEVANT_KEYS
      }[orientation];
      if (enableHomeAndEndKeys) {
        if (event.key === HOME) {
          nextIndex = minIndex;
        } else if (event.key === END) {
          nextIndex = maxIndex;
        }
      }
      if (nextIndex === highlightedIndex && (forwardKeys.includes(event.key) || backwardKeys.includes(event.key))) {
        if (loopFocus && nextIndex === maxIndex && forwardKeys.includes(event.key)) {
          nextIndex = minIndex;
        } else if (loopFocus && nextIndex === minIndex && backwardKeys.includes(event.key)) {
          nextIndex = maxIndex;
        } else {
          nextIndex = findNonDisabledListIndex(elementsRef, {
            startingIndex: nextIndex,
            decrement: backwardKeys.includes(event.key),
            disabledIndices
          });
        }
      }
      if (nextIndex !== highlightedIndex && !isIndexOutOfListBounds(elementsRef, nextIndex)) {
        if (stopEventPropagation) {
          event.stopPropagation();
        }
        if (preventedKeys.has(event.key)) {
          event.preventDefault();
        }
        onHighlightedIndexChange(nextIndex, true);
        queueMicrotask(() => {
          elementsRef.current[nextIndex]?.focus();
        });
      }
    }
  }), [cols, dense, direction, disabledIndices, elementsRef, enableHomeAndEndKeys, highlightedIndex, isGrid2, itemSizes, loopFocus, mergedRef, modifierKeys, onHighlightedIndexChange, orientation, stopEventPropagation]);
  return React33.useMemo(() => ({
    props,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    disabledIndices,
    onMapChange,
    relayKeyboardEvent: props.onKeyDown
  }), [props, highlightedIndex, onHighlightedIndexChange, elementsRef, disabledIndices, onMapChange]);
}
function isModifierKeySet(event, ignoredModifierKeys) {
  for (const key of MODIFIER_KEYS.values()) {
    if (ignoredModifierKeys.includes(key)) {
      continue;
    }
    if (event.getModifierState(key)) {
      return true;
    }
  }
  return false;
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/composite/root/CompositeRoot.js
var import_jsx_runtime105 = __toESM(require_jsx_runtime(), 1);
function CompositeRoot(componentProps) {
  const {
    render: render4,
    className,
    refs = EMPTY_ARRAY7,
    props = EMPTY_ARRAY7,
    state = EMPTY_OBJECT2,
    stateAttributesMapping: stateAttributesMapping2,
    highlightedIndex: highlightedIndexProp,
    onHighlightedIndexChange: onHighlightedIndexChangeProp,
    orientation,
    dense,
    itemSizes,
    loopFocus,
    cols,
    enableHomeAndEndKeys,
    onMapChange: onMapChangeProp,
    stopEventPropagation = true,
    rootRef,
    disabledIndices,
    modifierKeys,
    highlightItemOnHover = false,
    tag = "div",
    ...elementProps
  } = componentProps;
  const direction = useDirection();
  const {
    props: defaultProps,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    onMapChange: onMapChangeUnwrapped,
    relayKeyboardEvent
  } = useCompositeRoot({
    itemSizes,
    cols,
    loopFocus,
    dense,
    orientation,
    highlightedIndex: highlightedIndexProp,
    onHighlightedIndexChange: onHighlightedIndexChangeProp,
    rootRef,
    stopEventPropagation,
    enableHomeAndEndKeys,
    direction,
    disabledIndices,
    modifierKeys
  });
  const element = useRenderElement2(tag, componentProps, {
    state,
    ref: refs,
    props: [defaultProps, ...props, elementProps],
    stateAttributesMapping: stateAttributesMapping2
  });
  const contextValue = React34.useMemo(() => ({
    highlightedIndex,
    onHighlightedIndexChange,
    highlightItemOnHover,
    relayKeyboardEvent
  }), [highlightedIndex, onHighlightedIndexChange, highlightItemOnHover, relayKeyboardEvent]);
  return /* @__PURE__ */ (0, import_jsx_runtime105.jsx)(CompositeRootContext.Provider, {
    value: contextValue,
    children: /* @__PURE__ */ (0, import_jsx_runtime105.jsx)(CompositeList, {
      elementsRef,
      onMapChange: (newMap) => {
        onMapChangeProp?.(newMap);
        onMapChangeUnwrapped(newMap);
      },
      children: element
    })
  });
}

// ../../../node_modules/.pnpm/@base-ui-components+react@1.0.0-rc.0_@types+react@18.3.26_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@base-ui-components/react/esm/tabs/list/TabsList.js
var import_jsx_runtime106 = __toESM(require_jsx_runtime(), 1);
var TabsList = /* @__PURE__ */ React35.forwardRef(function TabsList2(componentProps, forwardedRef) {
  const {
    activateOnFocus = false,
    className,
    loopFocus = true,
    render: render4,
    ...elementProps
  } = componentProps;
  const {
    getTabElementBySelectedValue,
    onValueChange,
    orientation,
    value,
    setTabMap,
    tabActivationDirection
  } = useTabsRootContext();
  const [highlightedTabIndex, setHighlightedTabIndex] = React35.useState(0);
  const [tabsListElement, setTabsListElement] = React35.useState(null);
  const detectActivationDirection = useActivationDirectionDetector(
    value,
    // the old value
    orientation,
    tabsListElement,
    getTabElementBySelectedValue
  );
  const onTabActivation = useStableCallback((newValue, eventDetails) => {
    if (newValue !== value) {
      const activationDirection = detectActivationDirection(newValue);
      eventDetails.activationDirection = activationDirection;
      onValueChange(newValue, eventDetails);
    }
  });
  const state = React35.useMemo(() => ({
    orientation,
    tabActivationDirection
  }), [orientation, tabActivationDirection]);
  const defaultProps = {
    "aria-orientation": orientation === "vertical" ? "vertical" : void 0,
    role: "tablist"
  };
  const tabsListContextValue = React35.useMemo(() => ({
    activateOnFocus,
    highlightedTabIndex,
    onTabActivation,
    setHighlightedTabIndex,
    tabsListElement,
    value
  }), [activateOnFocus, highlightedTabIndex, onTabActivation, setHighlightedTabIndex, tabsListElement, value]);
  return /* @__PURE__ */ (0, import_jsx_runtime106.jsx)(TabsListContext.Provider, {
    value: tabsListContextValue,
    children: /* @__PURE__ */ (0, import_jsx_runtime106.jsx)(CompositeRoot, {
      render: render4,
      className,
      state,
      refs: [forwardedRef, setTabsListElement],
      props: [defaultProps, elementProps],
      stateAttributesMapping: tabsStateAttributesMapping,
      highlightedIndex: highlightedTabIndex,
      enableHomeAndEndKeys: true,
      loopFocus,
      orientation,
      onHighlightedIndexChange: setHighlightedTabIndex,
      onMapChange: setTabMap,
      disabledIndices: EMPTY_ARRAY7
    })
  });
});
if (true) TabsList.displayName = "TabsList";
function getInset(tab, tabsList) {
  const {
    left: tabLeft,
    top: tabTop
  } = tab.getBoundingClientRect();
  const {
    left: listLeft,
    top: listTop
  } = tabsList.getBoundingClientRect();
  const left = tabLeft - listLeft;
  const top = tabTop - listTop;
  return {
    left,
    top
  };
}
function useActivationDirectionDetector(activeTabValue, orientation, tabsListElement, getTabElement) {
  const [previousTabEdge, setPreviousTabEdge] = React35.useState(null);
  useIsoLayoutEffect(() => {
    if (activeTabValue == null || tabsListElement == null) {
      setPreviousTabEdge(null);
      return;
    }
    const activeTab = getTabElement(activeTabValue);
    if (activeTab == null) {
      setPreviousTabEdge(null);
      return;
    }
    const {
      left,
      top
    } = getInset(activeTab, tabsListElement);
    setPreviousTabEdge(orientation === "horizontal" ? left : top);
  }, [orientation, getTabElement, tabsListElement, activeTabValue]);
  return React35.useCallback((newValue) => {
    if (newValue === activeTabValue) {
      return "none";
    }
    if (newValue == null) {
      setPreviousTabEdge(null);
      return "none";
    }
    if (newValue != null && tabsListElement != null) {
      const activeTabElement = getTabElement(newValue);
      if (activeTabElement != null) {
        const {
          left,
          top
        } = getInset(activeTabElement, tabsListElement);
        if (previousTabEdge == null) {
          setPreviousTabEdge(orientation === "horizontal" ? left : top);
          return "none";
        }
        if (orientation === "horizontal") {
          if (left < previousTabEdge) {
            setPreviousTabEdge(left);
            return "left";
          }
          if (left > previousTabEdge) {
            setPreviousTabEdge(left);
            return "right";
          }
        } else if (top < previousTabEdge) {
          setPreviousTabEdge(top);
          return "up";
        } else if (top > previousTabEdge) {
          setPreviousTabEdge(top);
          return "down";
        }
      }
    }
    return "none";
  }, [getTabElement, orientation, previousTabEdge, tabsListElement, activeTabValue]);
}

// src/dashboard/components/tabs/list.tsx
var import_compose13 = __toESM(require_compose(), 1);
var import_react23 = __toESM(require_react(), 1);

// src/dashboard/components/tabs/style.scss
if (typeof document !== "undefined" && !document.head.querySelector("style[data-wp-hash='b037ec6f12']")) {
  const style = document.createElement("style");
  style.setAttribute("data-wp-hash", "b037ec6f12");
  style.appendChild(document.createTextNode(':root{--wpds-border-width-focus:1.5px;--wpds-color-stroke-interactive-neutral-strong:#1e1e1e;--wpds-color-fg-interactive-neutral:#50575e;--wpds-color-fg-interactive-neutral-active:#1e1e1e;--wpds-color-fg-interactive-neutral-disabled:#ccc;--wpds-color-stroke-focus-brand:#2271b1;--wpds-color-bg-interactive-neutral-weak-active:#f0f0f1;--wpds-border-radius-small:2px;--wpds-spacing-05:4px;--wpds-spacing-10:8px;--wpds-spacing-15:12px;--wpds-spacing-20:16px;--wpds-spacing-50:40px;--wpds-spacing-60:48px}.jp-forms-tabs__tablist{align-items:stretch;display:flex;overflow-x:auto;--direction-factor:1;--direction-start:left;--direction-end:right}.jp-forms-tabs__tablist:dir(rtl){--direction-factor:-1;--direction-start:right;--direction-end:left}.jp-forms-tabs__tablist{position:relative}.jp-forms-tabs__tablist[data-orientation=horizontal]{width:fit-content;--fade-width:4rem;--fade-gradient-base:#0000 0%,#000 var(--fade-width);--fade-gradient-composed:var(--fade-gradient-base),#000 60%,#0000 50%}.jp-forms-tabs__tablist[data-orientation=horizontal].jp-forms-tabs__is-overflowing-first{mask-image:linear-gradient(to var(--direction-end),var(--fade-gradient-base))}.jp-forms-tabs__tablist[data-orientation=horizontal].jp-forms-tabs__is-overflowing-last{mask-image:linear-gradient(to var(--direction-start),var(--fade-gradient-base))}.jp-forms-tabs__tablist[data-orientation=horizontal].jp-forms-tabs__is-overflowing-first.jp-forms-tabs__is-overflowing-last{mask-image:linear-gradient(to right,var(--fade-gradient-composed)),linear-gradient(to left,var(--fade-gradient-composed))}.jp-forms-tabs__tablist[data-orientation=horizontal].jp-forms-tabs__has-compact-density{gap:1rem}.jp-forms-tabs__tablist[data-orientation=vertical]{flex-direction:column}@media not (prefers-reduced-motion){.jp-forms-tabs__indicator{transition-duration:.2s;transition-property:translate,width,height,border-radius,border-block;transition-timing-function:ease-out}}.jp-forms-tabs__indicator{outline:2px solid #0000;outline-offset:-1px;pointer-events:none;position:absolute}.jp-forms-tabs__indicator[data-orientation=horizontal]{background-color:var(--wpds-color-stroke-interactive-neutral-strong);bottom:0;height:var(--wpds-border-width-focus);left:0;translate:var(--active-tab-left) 0;width:var(--active-tab-width);z-index:1}.jp-forms-tabs__indicator[data-orientation=vertical]{background-color:var(--wpds-color-bg-interactive-neutral-weak-active);border-radius:var(--wpds-border-radius-small);height:var(--active-tab-height);left:50%;top:0;translate:-50% var(--active-tab-top);width:100%;z-index:0}.jp-forms-tabs__tablist[data-select-on-move=true]:has(:focus-visible) .jp-forms-tabs__indicator[data-orientation=vertical]{border:var(--wpds-border-width-focus) solid var(--wpds-color-stroke-focus-brand)}.jp-forms-tabs__tab{align-items:center;background:#0000;border:none;border-radius:0;box-shadow:none;color:var(--wpds-color-fg-interactive-neutral);cursor:pointer;display:flex;flex:1 0 auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif;font-size:13px;font-weight:400;line-height:1.2;outline:none;padding:0;position:relative;white-space:nowrap;z-index:1}.jp-forms-tabs__tab[data-disabled]{color:var(--wpds-color-fg-interactive-neutral-disabled);cursor:default}@media (forced-colors:active){.jp-forms-tabs__tab[data-disabled]{color:GrayText}}.jp-forms-tabs__tab:not([data-disabled]):is(:hover,:focus-visible){color:var(--wpds-color-fg-interactive-neutral-active)}.jp-forms-tabs__tab:after{border-radius:var(--wpds-border-radius-small);opacity:0;outline:var(--wpds-border-width-focus) solid var(--wpds-color-stroke-focus-brand);pointer-events:none;position:absolute;z-index:-1}@media not (prefers-reduced-motion){.jp-forms-tabs__tab:after{transition:opacity .1s linear}}.jp-forms-tabs__tab:focus-visible:after{opacity:1}[data-orientation=horizontal] .jp-forms-tabs__tab{height:var(--wpds-spacing-60);padding-inline:var(--wpds-spacing-20);scroll-margin:24px}[data-orientation=horizontal] .jp-forms-tabs__tab:after{content:"";inset:var(--wpds-spacing-15)}.jp-forms-tabs__has-compact-density[data-orientation=horizontal] .jp-forms-tabs__tab{padding-inline:0}.jp-forms-tabs__has-compact-density[data-orientation=horizontal] .jp-forms-tabs__tab:after{inset-inline:2px}[data-orientation=vertical] .jp-forms-tabs__tab{min-height:var(--wpds-spacing-50);padding:var(--wpds-spacing-10) var(--wpds-spacing-15)}[data-orientation=vertical][data-select-on-move=false] .jp-forms-tabs__tab:after{content:"";inset:var(--wpds-border-width-focus)}.jp-forms-tabs__tab__children{align-items:center;display:flex;flex-grow:1}[data-orientation=horizontal] .jp-forms-tabs__tab__children{justify-content:center}[data-orientation=vertical] .jp-forms-tabs__tab__children{justify-content:start}.jp-forms-tabs__tab__chevron{fill:currentColor;flex-shrink:0;height:24px;margin-inline-end:calc(var(--wpds-spacing-05)*-1)}[data-orientation=horizontal] .jp-forms-tabs__tab__chevron{display:none}.jp-forms-tabs__tab__chevron{opacity:0}[role=tab]:is([aria-selected=true],:focus-visible,:hover) .jp-forms-tabs__tab__chevron{opacity:1}@media not (prefers-reduced-motion){[data-select-on-move=true] [role=tab]:is([aria-selected=true]) .jp-forms-tabs__tab__chevron{transition:opacity .15s linear .15s}}.jp-forms-tabs__tab__chevron:dir(rtl){rotate:180deg}.jp-forms-tabs__tabpanel:focus{box-shadow:none;outline:none}.jp-forms-tabs__tabpanel:focus-visible{box-shadow:0 0 0 var(--wpds-border-width-focus) var(--wpds-color-stroke-focus-brand);outline:2px solid #0000;outline-offset:0}'));
  document.head.appendChild(style);
}

// src/dashboard/components/tabs/list.tsx
var import_jsx_runtime107 = __toESM(require_jsx_runtime(), 1);
var DEFAULT_SCROLL_MARGIN = 0;
var List = (0, import_react23.forwardRef)(function TabList({ children, density = "default", className, activateOnFocus, render: render4, ...otherProps }, forwardedRef) {
  const [listEl, setListEl] = (0, import_react23.useState)(null);
  const [overflow, setOverflow] = (0, import_react23.useState)({
    first: false,
    last: false
  });
  (0, import_react23.useEffect)(() => {
    if (!listEl) {
      return;
    }
    const localListEl = listEl;
    function measureOverflow() {
      if (!localListEl) {
        setOverflow({
          first: false,
          last: false
        });
        return;
      }
      const { scrollWidth, clientWidth, scrollLeft } = localListEl;
      setOverflow({
        first: scrollLeft > DEFAULT_SCROLL_MARGIN,
        last: scrollLeft + clientWidth < scrollWidth - DEFAULT_SCROLL_MARGIN
      });
    }
    const resizeObserver = new ResizeObserver(measureOverflow);
    resizeObserver.observe(localListEl);
    let scrollTick = false;
    function throttleMeasureOverflowOnScroll() {
      if (!scrollTick) {
        requestAnimationFrame(() => {
          measureOverflow();
          scrollTick = false;
        });
        scrollTick = true;
      }
    }
    localListEl.addEventListener("scroll", throttleMeasureOverflowOnScroll, { passive: true });
    measureOverflow();
    return () => {
      localListEl.removeEventListener("scroll", throttleMeasureOverflowOnScroll);
      resizeObserver.disconnect();
    };
  }, [listEl]);
  const setListElRef = (0, import_react23.useCallback)((el) => setListEl(el), []);
  const mergedListRef = (0, import_compose13.useMergeRefs)([forwardedRef, setListElRef]);
  const renderTabList = (0, import_react23.useCallback)(
    (props, state) => {
      const newProps = {
        ...props,
        tabIndex: props.tabIndex ?? -1
      };
      if ((0, import_react23.isValidElement)(render4)) {
        return (0, import_react23.cloneElement)(render4, newProps);
      } else if (typeof render4 === "function") {
        return render4(newProps, state);
      }
      return /* @__PURE__ */ (0, import_jsx_runtime107.jsx)("div", { ...newProps });
    },
    [render4]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime107.jsxs)(
    index_parts_exports.List,
    {
      ref: mergedListRef,
      activateOnFocus,
      "data-select-on-move": activateOnFocus ? "true" : "false",
      className: clsx_default(
        "jp-forms-tabs__tablist",
        overflow.first && "jp-forms-tabs__is-overflowing-first",
        overflow.last && "jp-forms-tabs__is-overflowing-last",
        `jp-forms-tabs__has-${density}-density`,
        className
      ),
      render: renderTabList,
      ...otherProps,
      children: [
        children,
        /* @__PURE__ */ (0, import_jsx_runtime107.jsx)(index_parts_exports.Indicator, { className: "jp-forms-tabs__indicator" })
      ]
    }
  );
});

// src/dashboard/components/tabs/panel.tsx
var import_react24 = __toESM(require_react(), 1);
var import_jsx_runtime108 = __toESM(require_jsx_runtime(), 1);
var Panel = (0, import_react24.forwardRef)(function TabPanel2({ className, focusable = true, tabIndex, ...otherProps }, forwardedRef) {
  return /* @__PURE__ */ (0, import_jsx_runtime108.jsx)(
    index_parts_exports.Panel,
    {
      ref: forwardedRef,
      tabIndex: tabIndex ?? (focusable ? 0 : -1),
      className: clsx_default("jp-forms-tabs__tabpanel", className),
      ...otherProps
    }
  );
});

// src/dashboard/components/tabs/root.tsx
var import_react25 = __toESM(require_react(), 1);
var import_jsx_runtime109 = __toESM(require_jsx_runtime(), 1);
var Root = (0, import_react25.forwardRef)(function TabsRoot3({ ...otherProps }, forwardedRef) {
  return /* @__PURE__ */ (0, import_jsx_runtime109.jsx)(index_parts_exports.Root, { ref: forwardedRef, ...otherProps });
});

// src/dashboard/components/tabs/tab.tsx
var import_react26 = __toESM(require_react(), 1);
var import_jsx_runtime110 = __toESM(require_jsx_runtime(), 1);
var ChevronRight = (props) => {
  return (0, import_react26.cloneElement)(chevron_right_default, props);
};
var Tab = (0, import_react26.forwardRef)(function Tab2({ className, children, ...otherProps }, forwardedRef) {
  return /* @__PURE__ */ (0, import_jsx_runtime110.jsxs)(
    index_parts_exports.Tab,
    {
      ref: forwardedRef,
      className: clsx_default("jp-forms-tabs__tab", className),
      ...otherProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime110.jsx)("span", { className: "jp-forms-tabs__tab__children", children }),
        /* @__PURE__ */ (0, import_jsx_runtime110.jsx)(ChevronRight, { className: "jp-forms-tabs__tab__chevron" })
      ]
    }
  );
});

// src/dashboard/wp-build/components/dataviews-header-row/style.scss
if (typeof document !== "undefined" && !document.head.querySelector("style[data-wp-hash='4e7133a61d']")) {
  const style = document.createElement("style");
  style.setAttribute("data-wp-hash", "4e7133a61d");
  style.appendChild(document.createTextNode(".jp-forms-dataviews__view-actions{border-bottom:1px solid var(--wpds-color-stroke-surface-neutral,#e0e0e0);box-sizing:border-box;container-type:inline-size;flex-shrink:0;overflow-x:auto;padding-inline:20px;width:100%}@container (width < 500px){.jp-forms-dataviews__view-actions{--wp-ui-stack-justify:flex-start;align-items:flex-start;flex-direction:column}}.jp-forms-dataviews__view-actions>div:not(:empty){min-height:48px}.jp-forms-dataviews-filters__container,.jp-forms-dataviews-filters__container:not(:empty){padding:0}.jp-forms-dataviews-filters__container:not(:empty){padding-block:12px;padding-inline:20px}"));
  document.head.appendChild(style);
}

// src/dashboard/wp-build/components/dataviews-header-row/index.tsx
var import_jsx_runtime111 = __toESM(require_jsx_runtime(), 1);
function DataViewsHeaderRow({ activeTab }) {
  const navigate = useNavigate();
  const onTabChange = (0, import_element61.useCallback)(
    (nextValue) => {
      if (nextValue === "forms") {
        navigate({ href: "/forms" });
        return;
      }
      navigate({ href: "/responses/inbox" });
    },
    [navigate]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime111.jsxs)(import_jsx_runtime111.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime111.jsxs)(
      Stack,
      {
        align: "center",
        className: "jp-forms-dataviews__view-actions",
        gap: "sm",
        justify: "space-between",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime111.jsx)(Stack, { align: "center", gap: "sm", children: /* @__PURE__ */ (0, import_jsx_runtime111.jsx)(Root, { value: activeTab, onValueChange: onTabChange, children: /* @__PURE__ */ (0, import_jsx_runtime111.jsxs)(List, { density: "compact", children: [
            /* @__PURE__ */ (0, import_jsx_runtime111.jsx)(Tab, { value: "responses", children: (0, import_i18n48.__)("Responses", "jetpack-forms") }),
            /* @__PURE__ */ (0, import_jsx_runtime111.jsx)(Tab, { value: "forms", children: (0, import_i18n48.__)("Forms", "jetpack-forms") })
          ] }) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime111.jsxs)(Stack, { align: "center", gap: "sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime111.jsx)(dataviews_default.Search, {}),
            /* @__PURE__ */ (0, import_jsx_runtime111.jsx)(dataviews_default.ViewConfig, {})
          ] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime111.jsx)(dataviews_default.FiltersToggled, { className: "jp-forms-dataviews-filters__container" })
  ] });
}

// routes/forms/stage.tsx
var import_jsx_runtime112 = __toESM(require_jsx_runtime());
var DEFAULT_VIEW = {
  type: "table",
  search: "",
  filters: [{ field: "status", operator: "is", value: "all" }],
  page: 1,
  perPage: 20,
  titleField: "title",
  fields: ["entries", "status", "modified"]
};
var defaultLayouts = {
  table: {},
  list: {}
};
function StageInner() {
  const navigate = useNavigate2();
  const searchParams = useSearch({ from: "/forms" });
  const dateSettings = (0, import_date9.getSettings)();
  const [view, setView] = (0, import_element62.useState)(() => ({
    ...DEFAULT_VIEW,
    search: searchParams?.search || ""
  }));
  (0, import_element62.useEffect)(() => {
    const urlSearch = searchParams?.search || "";
    if (urlSearch !== view.search) {
      setView((previous) => ({ ...previous, search: urlSearch }));
    }
  }, [searchParams?.search]);
  const statusQuery = (0, import_element62.useMemo)(() => {
    const statusFilterValue = view.filters?.find((filter) => filter.field === "status")?.value;
    const nonTrashStatuses = "publish,draft,pending,future,private";
    if (!statusFilterValue || statusFilterValue === "all") {
      return nonTrashStatuses;
    }
    return statusFilterValue;
  }, [view.filters]);
  const isViewingTrash = (0, import_element62.useMemo)(() => {
    const statusFilterValue = view.filters?.find((filter) => filter.field === "status")?.value;
    return statusFilterValue === "trash";
  }, [view.filters]);
  const { records, isLoading, totalItems, totalPages } = useFormsData(
    view.page ?? 1,
    view.perPage ?? 20,
    view.search ?? "",
    statusQuery
  );
  const {
    isDeleting,
    trashForms,
    restoreForms,
    isPermanentDeleteConfirmOpen,
    openPermanentDeleteConfirm,
    closePermanentDeleteConfirm,
    confirmPermanentDelete
  } = useDeleteForm({
    view,
    setView,
    recordsLength: records?.length ?? 0,
    statusQuery
  });
  const [selection, setSelection] = (0, import_element62.useState)([]);
  const [pendingPermanentDeleteCount, setPendingPermanentDeleteCount] = (0, import_element62.useState)(0);
  (0, import_element62.useEffect)(() => {
    setSelection([]);
  }, [view.page, view.perPage, view.search, view.filters]);
  const onOpenPermanentDeleteConfirm = (0, import_element62.useCallback)(
    (items) => {
      setPendingPermanentDeleteCount(items?.length ?? 0);
      openPermanentDeleteConfirm(items);
    },
    [openPermanentDeleteConfirm]
  );
  const onClosePermanentDeleteConfirm = (0, import_element62.useCallback)(() => {
    setPendingPermanentDeleteCount(0);
    closePermanentDeleteConfirm();
  }, [closePermanentDeleteConfirm]);
  const onConfirmPermanentDelete = (0, import_element62.useCallback)(async () => {
    setPendingPermanentDeleteCount(0);
    try {
      await confirmPermanentDelete();
    } finally {
      setSelection([]);
    }
  }, [confirmPermanentDelete]);
  const statusLabel = (0, import_element62.useCallback)((status) => {
    switch (status) {
      case "publish":
        return (0, import_i18n49.__)("Published", "jetpack-forms");
      case "draft":
        return (0, import_i18n49.__)("Draft", "jetpack-forms");
      case "pending":
        return (0, import_i18n49.__)("Pending review", "jetpack-forms");
      case "future":
        return (0, import_i18n49.__)("Scheduled", "jetpack-forms");
      case "private":
        return (0, import_i18n49.__)("Private", "jetpack-forms");
      default:
        return status;
    }
  }, []);
  const fields = (0, import_element62.useMemo)(
    () => [
      {
        id: "title",
        label: (0, import_i18n49.__)("Form name", "jetpack-forms"),
        getValue: ({ item }) => item.title,
        render: ({ item }) => item.title || (0, import_i18n49.__)("(no title)", "jetpack-forms"),
        enableSorting: false,
        enableHiding: false
      },
      {
        id: "entries",
        label: (0, import_i18n49.__)("Entries", "jetpack-forms"),
        getValue: ({ item }) => item.entriesCount ?? 0,
        render: ({ item }) => item.entriesCount ?? 0,
        enableSorting: false
      },
      {
        id: "status",
        label: (0, import_i18n49.__)("Status", "jetpack-forms"),
        getValue: ({ item }) => item.status,
        render: ({ item }) => statusLabel(item.status),
        elements: [
          { label: (0, import_i18n49.__)("All", "jetpack-forms"), value: "all" },
          { label: (0, import_i18n49.__)("Published", "jetpack-forms"), value: "publish" },
          { label: (0, import_i18n49.__)("Draft", "jetpack-forms"), value: "draft" },
          { label: (0, import_i18n49.__)("Pending review", "jetpack-forms"), value: "pending" },
          { label: (0, import_i18n49.__)("Scheduled", "jetpack-forms"), value: "future" },
          { label: (0, import_i18n49.__)("Private", "jetpack-forms"), value: "private" },
          { label: (0, import_i18n49.__)("Trash", "jetpack-forms"), value: "trash" }
        ],
        filterBy: { operators: ["is"], isPrimary: true },
        enableSorting: false
      },
      {
        id: "modified",
        label: (0, import_i18n49.__)("Last updated", "jetpack-forms"),
        type: "date",
        render: ({ item }) => (0, import_date9.dateI18n)(dateSettings.formats.datetime, item.modified),
        enableSorting: false
      }
    ],
    [dateSettings.formats.datetime, statusLabel]
  );
  const actions = (0, import_element62.useMemo)(() => {
    const actionsList = [
      {
        id: "view-responses",
        isPrimary: false,
        label: (0, import_i18n49.__)("View responses", "jetpack-forms"),
        supportsBulk: false,
        callback() {
        }
      },
      {
        id: "edit-form",
        isPrimary: false,
        label: (0, import_i18n49.__)("Edit", "jetpack-forms"),
        supportsBulk: false,
        async callback(items) {
          const [item] = items;
          if (!item) {
            return;
          }
          const fallbackEditUrl = `post.php?post=${item.id}&action=edit&post_type=jetpack_form`;
          const editUrl = item.editUrl || fallbackEditUrl;
          const url = new URL(editUrl, window.location.origin);
          window.location.href = url.toString();
        }
      }
    ];
    if (isViewingTrash) {
      actionsList.push({
        id: "restore-form",
        isPrimary: false,
        label: (0, import_i18n49.__)("Restore", "jetpack-forms"),
        supportsBulk: true,
        async callback(items) {
          if (isDeleting) {
            return;
          }
          try {
            await restoreForms(items);
          } finally {
            setSelection([]);
          }
        }
      });
      actionsList.push({
        id: "delete-form-permanently",
        isPrimary: false,
        label: (0, import_i18n49.__)("Delete permanently", "jetpack-forms"),
        supportsBulk: true,
        async callback(items) {
          if (isDeleting) {
            return;
          }
          if (!items?.length) {
            return;
          }
          onOpenPermanentDeleteConfirm(items);
        }
      });
      return actionsList;
    }
    actionsList.push({
      id: "trash-form",
      isPrimary: false,
      label: (0, import_i18n49.__)("Trash", "jetpack-forms"),
      supportsBulk: true,
      async callback(items) {
        if (isDeleting) {
          return;
        }
        try {
          await trashForms(items);
        } finally {
          setSelection([]);
        }
      }
    });
    return actionsList;
  }, [isDeleting, isViewingTrash, onOpenPermanentDeleteConfirm, restoreForms, trashForms]);
  const paginationInfo = (0, import_element62.useMemo)(
    () => ({
      totalItems: totalItems ?? 0,
      totalPages: totalPages ?? 0
    }),
    [totalItems, totalPages]
  );
  const onChangeView = (0, import_element62.useCallback)(
    (newView) => {
      setView(newView);
      if (newView.search !== view.search) {
        navigate({
          search: {
            ...searchParams,
            search: newView.search || void 0
          }
        });
      }
    },
    [navigate, searchParams, view.search]
  );
  const headerActions = (0, import_element62.useMemo)(() => [/* @__PURE__ */ (0, import_jsx_runtime112.jsx)(CreateFormButton, {}, "create")], []);
  const getItemId = (0, import_element62.useCallback)((item) => String(item.id), []);
  return /* @__PURE__ */ (0, import_jsx_runtime112.jsx)(
    page_default,
    {
      showSidebarToggle: false,
      title: /* @__PURE__ */ (0, import_jsx_runtime112.jsx)(FormsLogo, {}),
      subTitle: (0, import_i18n49.__)("View and manage all your forms in one place.", "jetpack-forms"),
      actions: headerActions,
      hasPadding: false,
      children: /* @__PURE__ */ (0, import_jsx_runtime112.jsxs)(
        dataviews_default,
        {
          paginationInfo,
          fields,
          actions,
          data: records || [],
          isLoading,
          empty: /* @__PURE__ */ (0, import_jsx_runtime112.jsx)(
            EmptyWrapper,
            {
              heading: (0, import_i18n49.__)("You're set up. No forms yet.", "jetpack-forms"),
              body: (0, import_i18n49.__)(
                "Create a shared form pattern to manage and reuse it across your site.",
                "jetpack-forms"
              ),
              actions: /* @__PURE__ */ (0, import_jsx_runtime112.jsx)(
                CreateFormButton,
                {
                  label: (0, import_i18n49.__)("Create a new form", "jetpack-forms"),
                  variant: "primary"
                }
              )
            }
          ),
          view,
          onChangeView,
          selection,
          onChangeSelection: setSelection,
          getItemId,
          defaultLayouts,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime112.jsxs)(
              import_components50.__experimentalConfirmDialog,
              {
                onCancel: onClosePermanentDeleteConfirm,
                onConfirm: onConfirmPermanentDelete,
                isOpen: isPermanentDeleteConfirmOpen,
                confirmButtonText: (0, import_i18n49.__)("Delete permanently", "jetpack-forms"),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime112.jsx)("h3", { children: (0, import_i18n49.__)("Delete permanently", "jetpack-forms") }),
                  /* @__PURE__ */ (0, import_jsx_runtime112.jsx)("p", { children: pendingPermanentDeleteCount === 1 ? (0, import_i18n49.__)(
                    "This will permanently delete this form. This action cannot be undone.",
                    "jetpack-forms"
                  ) : (0, import_i18n49.sprintf)(
                    /* translators: %d: number of forms */
                    (0, import_i18n49._n)(
                      "This will permanently delete %d form. This action cannot be undone.",
                      "This will permanently delete %d forms. This action cannot be undone.",
                      pendingPermanentDeleteCount,
                      "jetpack-forms"
                    ),
                    pendingPermanentDeleteCount
                  ) })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime112.jsx)(DataViewsHeaderRow, { activeTab: "forms" }),
            /* @__PURE__ */ (0, import_jsx_runtime112.jsx)(dataviews_default.Layout, {}),
            /* @__PURE__ */ (0, import_jsx_runtime112.jsx)(dataviews_default.Footer, {})
          ]
        }
      )
    }
  );
}
var Stage = () => /* @__PURE__ */ (0, import_jsx_runtime112.jsx)(StageInner, {});
export {
  Stage as stage
};
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
