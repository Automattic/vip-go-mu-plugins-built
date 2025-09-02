import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
/******/ // The require scope
/******/ var __webpack_require__ = {};
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

;// external "@wordpress/interactivity"
var x = (y) => {
	var x = {}; __webpack_require__.d(x, y); return x
} 
var y = (x) => (() => (x))
const interactivity_namespaceObject = x({ ["getContext"]: () => (__WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__.getContext), ["store"]: () => (__WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__.store) });
;// ./packages/block-library/build-module/accordion/view.js
/**
 * WordPress dependencies
 */

const {
  state
} = (0,interactivity_namespaceObject.store)('core/accordion', {
  state: {
    get isOpen() {
      const {
        isOpen,
        id
      } = (0,interactivity_namespaceObject.getContext)();
      return isOpen.includes(id);
    }
  },
  actions: {
    toggle: () => {
      const context = (0,interactivity_namespaceObject.getContext)();
      const {
        id,
        autoclose
      } = context;
      if (autoclose) {
        context.isOpen = state.isOpen ? [] : [id];
      } else if (state.isOpen) {
        context.isOpen = context.isOpen.filter(item => item !== id);
      } else {
        context.isOpen.push(id);
      }
    }
  },
  callbacks: {
    initIsOpen: () => {
      const context = (0,interactivity_namespaceObject.getContext)();
      const {
        id,
        openByDefault
      } = context;
      if (openByDefault) {
        context.isOpen.push(id);
      }
    }
  }
});

