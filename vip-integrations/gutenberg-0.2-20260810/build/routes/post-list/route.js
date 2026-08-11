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

// routes/post-list/route.ts
var import_data5 = __toESM(require_data());
var import_core_data3 = __toESM(require_core_data());
import { notFound } from "@wordpress/route";

// packages/views/build-module/use-view.mjs
var import_element = __toESM(require_element(), 1);
var import_data = __toESM(require_data(), 1);
var import_preferences = __toESM(require_preferences(), 1);

// packages/views/build-module/preference-keys.mjs
function generatePreferenceKey(kind, name, slug) {
  return `dataviews-${kind}-${name}-${slug}`;
}

// packages/views/build-module/resolve-view.mjs
var QUERY_PARAMS = ["page", "search"];
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function withoutQueryParams(layer) {
  const result = isPlainObject(layer) ? { ...layer } : {};
  for (const key of QUERY_PARAMS) {
    delete result[key];
  }
  return result;
}
function mergeLayer(lower, upper) {
  const result = { ...lower };
  for (const key of Object.keys(upper)) {
    const value = upper[key];
    const current = result[key];
    result[key] = isPlainObject(current) && isPlainObject(value) ? mergeLayer(current, value) : value;
  }
  return result;
}
function getLockedFilters(overrides) {
  return (overrides?.filters ?? []).filter((filter) => filter.isLocked);
}
function applyLockedFilters(view, overrides) {
  const locked = getLockedFilters(overrides);
  if (locked.length === 0) {
    return view;
  }
  const rest = (view.filters ?? []).filter(
    (filter) => !locked.some((f) => f.field === filter.field)
  );
  return { ...view, filters: [...locked, ...rest] };
}
function resolveBaseView(layers, effectiveType) {
  const { defaultView, defaultLayouts, activeViewOverrides } = layers;
  const layoutDefaults = defaultLayouts?.[effectiveType];
  return applyLockedFilters(
    [layoutDefaults, activeViewOverrides].reduce(
      (lower, upper) => mergeLayer(lower, withoutQueryParams(upper)),
      withoutQueryParams(defaultView)
    ),
    activeViewOverrides
  );
}
function resolveView(args) {
  const { defaultView, activeViewOverrides, persistedView, page, search } = args;
  const effectiveType = persistedView?.type ?? activeViewOverrides?.type ?? defaultView?.type;
  const baseView = resolveBaseView(args, effectiveType);
  const view = {
    ...applyLockedFilters(
      mergeLayer(baseView, withoutQueryParams(persistedView)),
      activeViewOverrides
    ),
    page: Number(page ?? 1),
    search: search ?? ""
  };
  return view;
}

// packages/views/build-module/load-view.mjs
var import_data2 = __toESM(require_data(), 1);
var import_preferences2 = __toESM(require_preferences(), 1);
async function loadView(config) {
  const {
    kind,
    name,
    slug,
    defaultView,
    defaultLayouts,
    activeViewOverrides,
    queryParams
  } = config;
  const preferenceKey = generatePreferenceKey(kind, name, slug);
  const persistedView = (0, import_data2.select)(
    import_preferences2.store
  ).get("core/views", preferenceKey);
  return resolveView({
    defaultView,
    defaultLayouts,
    activeViewOverrides,
    persistedView,
    page: queryParams?.page,
    search: queryParams?.search
  });
}

// packages/views/build-module/use-view-config.mjs
var import_data3 = __toESM(require_data(), 1);
var import_core_data = __toESM(require_core_data(), 1);

// packages/views/build-module/lock-unlock.mjs
var import_private_apis = __toESM(require_private_apis(), 1);
var { lock, unlock } = (0, import_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)(
  "I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.",
  "@wordpress/views"
);

// routes/post-list/view-utils.ts
var import_data4 = __toESM(require_data());
var import_core_data2 = __toESM(require_core_data());
var DEFAULT_VIEW = {
  type: "table",
  sort: {
    field: "date",
    direction: "desc"
  },
  fields: ["author", "status", "date"],
  titleField: "title",
  mediaField: "featured_media",
  descriptionField: "excerpt"
};
var DEFAULT_TABLE_LAYOUT = {
  layout: {
    styles: {
      author: {
        align: "start"
      }
    }
  }
};
function getActiveViewOverridesForTab(slug) {
  if (slug === "all") {
    return {
      ...DEFAULT_TABLE_LAYOUT
    };
  }
  return {
    ...DEFAULT_TABLE_LAYOUT,
    filters: [
      {
        field: "status",
        operator: "is",
        value: slug
      }
    ]
  };
}
function getDefaultView(postType) {
  return {
    ...DEFAULT_VIEW,
    showLevels: postType?.hierarchical
  };
}
async function ensureView(type, slug, search) {
  const postTypeObject = await (0, import_data4.resolveSelect)(import_core_data2.store).getPostType(type);
  const defaultView = getDefaultView(postTypeObject);
  return loadView({
    kind: "postType",
    name: type,
    slug: "default-new",
    defaultView,
    activeViewOverrides: getActiveViewOverridesForTab(slug ?? "all"),
    queryParams: search
  });
}
function viewToQuery(view, postType) {
  const result = { _embed: "author,wp:featuredmedia" };
  if (void 0 !== view.perPage) {
    result.per_page = view.perPage;
  }
  if (void 0 !== view.page) {
    result.page = view.page;
  }
  if (![void 0, ""].includes(view.search)) {
    result.search = view.search;
  }
  if (void 0 !== view.sort?.field) {
    let sortField = view.sort.field;
    if (sortField === "attached_to") {
      sortField = "parent";
    }
    result.orderby = sortField;
  }
  if (void 0 !== view.sort?.direction) {
    result.order = view.sort.direction;
  }
  if (view.showLevels) {
    result.orderby_hierarchy = true;
  }
  const status = view.filters?.find(
    (filter) => filter.field === "status"
  );
  if (status) {
    result.status = status.value;
  } else if (postType === "attachment") {
    result.status = "inherit";
  } else {
    result.status = "draft,future,pending,private,publish";
  }
  const author = view.filters?.find(
    (filter) => filter.field === "author"
  );
  if (author && author.operator === "is") {
    result.author = author.value;
  } else if (author && author.operator === "isNot") {
    result.author_exclude = author.value;
  }
  const commentStatus = view.filters?.find(
    (filter) => filter.field === "comment_status"
  );
  if (commentStatus && commentStatus.operator === "is") {
    result.comment_status = commentStatus.value;
  } else if (commentStatus && commentStatus.operator === "isNot") {
    result.comment_status_exclude = commentStatus.value;
  }
  const mediaType = view.filters?.find(
    (filter) => filter.field === "media_type"
  );
  if (mediaType) {
    result.media_type = mediaType.value;
  }
  const date = view.filters?.find((filter) => filter.field === "date");
  if (date && date.value) {
    if (date.operator === "before") {
      result.before = date.value;
    } else if (date.operator === "after") {
      result.after = date.value;
    }
  }
  if (postType === "attachment") {
    result._embed = "wp:attached-to";
  }
  return result;
}

// routes/post-list/route.ts
var route = {
  beforeLoad: async ({ params }) => {
    try {
      const postType = await (0, import_data5.resolveSelect)(import_core_data3.store).getPostType(
        params.type
      );
      if (!postType) {
        throw notFound();
      }
    } catch {
      throw notFound();
    }
  },
  title: async ({ params }) => {
    const postType = await (0, import_data5.resolveSelect)(import_core_data3.store).getPostType(
      params.type
    );
    return postType?.labels?.name || params.type;
  },
  async canvas(context) {
    const { params, search } = context;
    const view = await ensureView(params.type, params.slug, {
      page: search.page,
      search: search.search
    });
    if (view.type !== "list") {
      return void 0;
    }
    if (search.postIds && search.postIds.length > 0) {
      const postId = search.postIds[0].toString();
      return {
        postType: params.type,
        postId,
        isPreview: true,
        editLink: `/types/${params.type}/edit/${postId}`
      };
    }
    const query = viewToQuery(view, params.type);
    const posts = await (0, import_data5.resolveSelect)(import_core_data3.store).getEntityRecords(
      "postType",
      params.type,
      { ...query, per_page: 1 }
    );
    if (posts && posts.length > 0) {
      const postId = posts[0].id.toString();
      return {
        postType: params.type,
        postId,
        isPreview: true,
        editLink: `/types/${params.type}/edit/${postId}`
      };
    }
    return void 0;
  }
};
export {
  route
};
