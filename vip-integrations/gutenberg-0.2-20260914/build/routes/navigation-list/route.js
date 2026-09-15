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

// package-external:@wordpress/core-data
var require_core_data = __commonJS({
  "package-external:@wordpress/core-data"(exports, module) {
    module.exports = window.wp.coreData;
  }
});

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

// package-external:@wordpress/preferences
var require_preferences = __commonJS({
  "package-external:@wordpress/preferences"(exports, module) {
    module.exports = window.wp.preferences;
  }
});

// package-external:@wordpress/private-apis
var require_private_apis = __commonJS({
  "package-external:@wordpress/private-apis"(exports, module) {
    module.exports = window.wp.privateApis;
  }
});

// routes/navigation-list/route.ts
var import_data5 = __toESM(require_data());
var import_core_data3 = __toESM(require_core_data());
var import_i18n = __toESM(require_i18n());
import { notFound } from "@wordpress/route";

// routes/navigation-list/view-utils.ts
var import_data4 = __toESM(require_data());
var import_core_data2 = __toESM(require_core_data());

// packages/views/build-module/use-view.mjs
var import_element = __toESM(require_element(), 1);
var import_data = __toESM(require_data(), 1);
var import_preferences = __toESM(require_preferences(), 1);

// packages/views/build-module/load-view.mjs
var import_data2 = __toESM(require_data(), 1);
var import_preferences2 = __toESM(require_preferences(), 1);

// packages/views/build-module/use-view-config.mjs
var import_data3 = __toESM(require_data(), 1);
var import_core_data = __toESM(require_core_data(), 1);

// packages/views/build-module/lock-unlock.mjs
var import_private_apis = __toESM(require_private_apis(), 1);
var { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)(
  "I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.",
  "@wordpress/views"
);

// routes/lock-unlock/index.ts
var import_private_apis2 = __toESM(require_private_apis());
var { lock: lock2, unlock: unlock2 } = (0, import_private_apis2.__dangerousOptInToUnstableAPIsOnlyForCoreModules)(
  "I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.",
  "@wordpress/routes"
);

// routes/navigation-list/view-utils.ts
var NAVIGATION_POST_TYPE = "wp_navigation";
async function loadNavigationViewConfig() {
  const config = await unlock2((0, import_data4.resolveSelect)(import_core_data2.store)).getViewConfig(
    "postType",
    NAVIGATION_POST_TYPE
  );
  return {
    default_view: config?.default_view,
    default_layouts: config?.default_layouts,
    view_list: config?.view_list
  };
}

// routes/navigation-list/route.ts
var NAVIGATION_POST_TYPE2 = "wp_navigation";
var PRELOADED_NAVIGATION_MENUS_QUERY = {
  per_page: -1,
  status: ["publish", "draft"],
  order: "desc",
  orderby: "date"
};
var route = {
  async beforeLoad() {
    const theme = await (0, import_data5.resolveSelect)(import_core_data3.store).getCurrentTheme();
    if (!theme?.is_block_theme) {
      throw notFound();
    }
  },
  title: () => (0, import_i18n.__)("Navigation"),
  canvas: async ({
    search
  }) => {
    const navigations = await (0, import_data5.resolveSelect)(import_core_data3.store).getEntityRecords(
      "postType",
      NAVIGATION_POST_TYPE2,
      PRELOADED_NAVIGATION_MENUS_QUERY
    );
    const firstNavigation = navigations?.[0];
    if (!firstNavigation) {
      return { postType: NAVIGATION_POST_TYPE2, isPreview: true };
    }
    const postId = search.ids ? parseInt(search.ids[0]) : firstNavigation.id;
    return {
      postType: NAVIGATION_POST_TYPE2,
      postId,
      isPreview: true
    };
  },
  loader: async () => {
    await Promise.all([
      // Preload the view configuration the stage resolves its view from.
      loadNavigationViewConfig(),
      // Preload navigation menus
      (0, import_data5.resolveSelect)(import_core_data3.store).getEntityRecords(
        "postType",
        NAVIGATION_POST_TYPE2,
        PRELOADED_NAVIGATION_MENUS_QUERY
      ),
      (0, import_data5.resolveSelect)(import_core_data3.store).canUser("create", {
        kind: "postType",
        name: NAVIGATION_POST_TYPE2
      }),
      // Preload post type object (what usePostFields needs)
      (0, import_data5.resolveSelect)(import_core_data3.store).getPostType(NAVIGATION_POST_TYPE2),
      // Preload users data (what usePostFields needs for author field)
      (0, import_data5.resolveSelect)(import_core_data3.store).getEntityRecords("root", "user", {
        per_page: -1
      })
    ]);
  }
};
export {
  route
};
