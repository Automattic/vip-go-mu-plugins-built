var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// package-external:@wordpress/data
var require_data = __commonJS({
  "package-external:@wordpress/data"(exports, module) {
    module.exports = window.wp.data;
  }
});

// routes/responses/route.tsx
var import_data = __toESM(require_data());
var route = {
  /**
   * Determines when to show the inspector panel.
   * Only show when a single response is selected.
   * @param props                    - Props used while determining when to show the inspector panel.
   * @param props.search             - The search parameters.
   * @param props.search.responseIds - The IDs of the responses to show in the inspector panel.
   *
   * @return                         - Whether to show the inspector panel.
   */
  inspector: async ({ search }) => {
    return !!(search?.responseIds && search.responseIds.length === 1);
  },
  /**
   * Preloads data before the route renders.
   * @param props             - Props used while preloading data before the route renders.
   * @param props.params      - The parameters.
   * @param props.params.view - The view.
   * @param props.search      - The search parameters.
   * @param props.search.page - The page number.
   */
  loader: async ({
    params,
    search
  }) => {
    let status = "publish";
    if (params.view === "spam") {
      status = "spam";
    } else if (params.view === "trash") {
      status = "trash";
    }
    await (0, import_data.resolveSelect)("core").getEntityRecords("postType", "feedback", {
      per_page: 20,
      page: search.page || 1,
      status,
      orderby: "date",
      order: "desc"
    });
  },
  /**
   * Validates that the route can be accessed.
   * Checks if the feedback post type exists.
   */
  beforeLoad: async () => {
    try {
      await (0, import_data.resolveSelect)("core").getPostType("feedback");
    } catch {
    }
  }
};
export {
  route
};
