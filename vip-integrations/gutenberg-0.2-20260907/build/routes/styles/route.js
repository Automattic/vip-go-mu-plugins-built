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

// package-external:@wordpress/html-entities
var require_html_entities = __commonJS({
  "package-external:@wordpress/html-entities"(exports, module) {
    module.exports = window.wp.htmlEntities;
  }
});

// package-external:@wordpress/i18n
var require_i18n = __commonJS({
  "package-external:@wordpress/i18n"(exports, module) {
    module.exports = window.wp.i18n;
  }
});

// package-external:@wordpress/url
var require_url = __commonJS({
  "package-external:@wordpress/url"(exports, module) {
    module.exports = window.wp.url;
  }
});

// routes/styles/route.ts
var import_data = __toESM(require_data());
var import_core_data = __toESM(require_core_data());
var import_html_entities = __toESM(require_html_entities());
var import_i18n2 = __toESM(require_i18n());
import { notFound } from "@wordpress/route";

// routes/styles/previewed-theme.ts
var import_i18n = __toESM(require_i18n());
var import_url = __toESM(require_url());
var THEME_PREVIEW_ADMIN_PAGE = "theme-preview-wp-admin";
var previewedStylesheet = (() => {
  const value = (0, import_url.getQueryArg)(window.location.href, "wp_theme_preview");
  return typeof value === "string" ? value : "";
})();
function getPreviewedStylesheet() {
  return previewedStylesheet;
}
function isThemePreviewAdminPage() {
  return new URLSearchParams(window.location.search).get("page") === THEME_PREVIEW_ADMIN_PAGE;
}
function getPreviewTitle(themeName) {
  return themeName ? (0, import_i18n.sprintf)(
    /* translators: %s: Theme name. */
    (0, import_i18n.__)("Previewing %s"),
    themeName
  ) : (0, import_i18n.__)("Theme Preview");
}

// routes/styles/route.ts
async function isBlockTheme() {
  const currentTheme = await (0, import_data.resolveSelect)(import_core_data.store).getCurrentTheme();
  return !!currentTheme?.is_block_theme;
}
var route = {
  beforeLoad: () => {
    if (isThemePreviewAdminPage() && !getPreviewedStylesheet()) {
      throw notFound();
    }
  },
  title: async () => {
    if (!getPreviewedStylesheet()) {
      return (0, import_i18n2.__)("Styles");
    }
    const theme = await (0, import_data.resolveSelect)(import_core_data.store).getCurrentTheme();
    return getPreviewTitle(
      theme?.name?.rendered ? (0, import_html_entities.decodeEntities)(theme.name.rendered) : void 0
    );
  },
  // Classic themes have no global styles to edit, so the style book is all
  // this route has to show.
  stage: isBlockTheme,
  async canvas(context) {
    if (context.search.preview === "stylebook" || !await isBlockTheme()) {
      return null;
    }
    return {
      isPreview: true
    };
  }
};
export {
  route
};
