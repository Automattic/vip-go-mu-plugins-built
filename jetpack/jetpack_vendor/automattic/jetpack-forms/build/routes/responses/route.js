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

// package-external:@wordpress/data
var require_data = __commonJS({
  "package-external:@wordpress/data"(exports, module) {
    module.exports = window.wp.data;
  }
});

// package-external:@wordpress/api-fetch
var require_api_fetch = __commonJS({
  "package-external:@wordpress/api-fetch"(exports, module) {
    module.exports = window.wp.apiFetch;
  }
});

// package-external:@wordpress/url
var require_url = __commonJS({
  "package-external:@wordpress/url"(exports, module) {
    module.exports = window.wp.url;
  }
});

// routes/responses/route.tsx
var import_data4 = __toESM(require_data());
import { redirect } from "@wordpress/route";

// src/dashboard/wp-build/utils/preload.ts
var import_data3 = __toESM(require_data(), 1);

// src/dashboard/store/index.js
var import_data2 = __toESM(require_data(), 1);

// src/dashboard/store/actions.js
var actions_exports = {};
__export(actions_exports, {
  addPendingAction: () => addPendingAction,
  clearInvalidRecords: () => clearInvalidRecords,
  doBulkAction: () => doBulkAction,
  invalidateCounts: () => invalidateCounts,
  invalidateFilters: () => invalidateFilters,
  invalidateFormStatusCounts: () => invalidateFormStatusCounts,
  markRecordsAsInvalid: () => markRecordsAsInvalid,
  receiveFilters: () => receiveFilters,
  removePendingAction: () => removePendingAction,
  setCounts: () => setCounts,
  setCurrentQuery: () => setCurrentQuery,
  setFormStatusCounts: () => setFormStatusCounts,
  setSelectedResponses: () => setSelectedResponses,
  updateCountsOptimistically: () => updateCountsOptimistically
});
var import_api_fetch = __toESM(require_api_fetch(), 1);

// src/dashboard/store/action-types.js
var RECEIVE_FILTERS = "RECEIVE_FILTERS";
var INVALIDATE_FILTERS = "INVALIDATE_FILTERS";
var SET_CURRENT_QUERY = "SET_CURRENT_QUERY";
var SET_SELECTED_RESPONSES = "SET_SELECTED_RESPONSES";
var SET_COUNTS = "SET_COUNTS";
var UPDATE_COUNTS_OPTIMISTICALLY = "UPDATE_COUNTS_OPTIMISTICALLY";
var INVALIDATE_COUNTS = "INVALIDATE_COUNTS";
var MARK_RECORDS_AS_INVALID = "MARK_RECORDS_AS_INVALID";
var CLEAR_INVALID_RECORDS = "CLEAR_INVALID_RECORDS";
var ADD_PENDING_ACTION = "ADD_PENDING_ACTION";
var REMOVE_PENDING_ACTION = "REMOVE_PENDING_ACTION";
var SET_FORM_STATUS_COUNTS = "SET_FORM_STATUS_COUNTS";
var INVALIDATE_FORM_STATUS_COUNTS = "INVALIDATE_FORM_STATUS_COUNTS";

// src/dashboard/store/actions.js
function receiveFilters(filters2) {
  return {
    type: RECEIVE_FILTERS,
    filters: filters2
  };
}
var invalidateFilters = () => {
  return { type: INVALIDATE_FILTERS };
};
var invalidateCounts = () => {
  return { type: INVALIDATE_COUNTS };
};
var setSelectedResponses = (selectedResponses) => ({
  type: SET_SELECTED_RESPONSES,
  selectedResponses
});
function setCurrentQuery(currentQuery2) {
  return ({ dispatch, select, registry }) => {
    const previousQuery = select.getCurrentQuery();
    const queryWithFormat = {
      ...currentQuery2,
      fields_format: currentQuery2.fields_format ?? previousQuery.fields_format ?? "collection"
    };
    const filtersChanged = previousQuery.status !== queryWithFormat.status || previousQuery.search !== queryWithFormat.search || previousQuery.is_unread !== queryWithFormat.is_unread || previousQuery.parent !== queryWithFormat.parent || previousQuery.before !== queryWithFormat.before || previousQuery.after !== queryWithFormat.after;
    if (filtersChanged) {
      dispatch(clearInvalidRecords());
      if (registry && registry.dispatch("core")) {
        registry.dispatch("core").invalidateResolution("getEntityRecords", ["postType", "feedback", queryWithFormat]);
      }
    }
    dispatch({
      type: SET_CURRENT_QUERY,
      currentQuery: queryWithFormat
    });
  };
}
function setCounts(counts2, queryParams = {}) {
  return {
    type: SET_COUNTS,
    counts: counts2,
    queryParams
  };
}
function updateCountsOptimistically(fromStatus, toStatus, count = 1, queryParams = {}) {
  return {
    type: UPDATE_COUNTS_OPTIMISTICALLY,
    fromStatus,
    toStatus,
    count,
    queryParams
  };
}
function markRecordsAsInvalid(recordIds) {
  return {
    type: MARK_RECORDS_AS_INVALID,
    recordIds
  };
}
function clearInvalidRecords() {
  return {
    type: CLEAR_INVALID_RECORDS
  };
}
function addPendingAction(actionId) {
  return {
    type: ADD_PENDING_ACTION,
    actionId
  };
}
function removePendingAction(actionId) {
  return {
    type: REMOVE_PENDING_ACTION,
    actionId
  };
}
function setFormStatusCounts(formStatusCounts2) {
  return {
    type: SET_FORM_STATUS_COUNTS,
    formStatusCounts: formStatusCounts2
  };
}
var invalidateFormStatusCounts = () => {
  return { type: INVALIDATE_FORM_STATUS_COUNTS };
};
var doBulkAction = (ids, action) => async () => {
  try {
    await (0, import_api_fetch.default)({
      path: `wp/v2/feedback/bulk_actions`,
      method: "POST",
      data: {
        action,
        post_ids: ids
      }
    });
  } catch {
  }
};

// src/dashboard/store/reducer.js
var import_data = __toESM(require_data(), 1);
var filters = (state = {}, action) => {
  if (action.type === RECEIVE_FILTERS) {
    return action.filters;
  }
  return state;
};
var currentQuery = (state = {
  order: "desc",
  orderby: "date",
  page: 1,
  per_page: 20,
  status: "draft,publish",
  fields_format: "collection"
}, action) => {
  if (action.type === SET_CURRENT_QUERY) {
    return action.currentQuery;
  }
  return state;
};
var selectedResponsesFromCurrentDataset = (state = [], action) => {
  if (action.type === SET_SELECTED_RESPONSES) {
    return action.selectedResponses;
  }
  return state;
};
var normalizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.slice().sort().join(",");
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  return String(value);
};
var getCacheKey = (queryParams = {}) => {
  const keys = ["search", "parent", "before", "after", "is_unread"];
  const parts = keys.filter((key) => queryParams[key] !== void 0).map((key) => `${key}:${normalizeValue(queryParams[key])}`);
  return parts.length > 0 ? parts.join("|") : "default";
};
var counts = (state = {}, action) => {
  if (action.type === SET_COUNTS) {
    const cacheKey = getCacheKey(action.queryParams);
    return {
      ...state,
      [cacheKey]: action.counts
    };
  }
  if (action.type === UPDATE_COUNTS_OPTIMISTICALLY) {
    const { fromStatus, toStatus, count, queryParams } = action;
    const cacheKey = getCacheKey(queryParams);
    const currentCounts = state[cacheKey] || { inbox: 0, spam: 0, trash: 0 };
    const newCounts = { ...currentCounts };
    if (fromStatus === "inbox" || fromStatus === "publish" || fromStatus === "draft") {
      newCounts.inbox = Math.max(0, newCounts.inbox - count);
    } else if (fromStatus === "spam") {
      newCounts.spam = Math.max(0, newCounts.spam - count);
    } else if (fromStatus === "trash") {
      newCounts.trash = Math.max(0, newCounts.trash - count);
    }
    if (toStatus === "publish" || toStatus === "draft") {
      newCounts.inbox += count;
    } else if (toStatus === "spam") {
      newCounts.spam += count;
    } else if (toStatus === "trash") {
      newCounts.trash += count;
    }
    return {
      ...state,
      [cacheKey]: newCounts
    };
  }
  return state;
};
var invalidRecords = (state = /* @__PURE__ */ new Set(), action) => {
  if (action.type === MARK_RECORDS_AS_INVALID) {
    return /* @__PURE__ */ new Set([...state, ...action.recordIds]);
  }
  if (action.type === CLEAR_INVALID_RECORDS) {
    return /* @__PURE__ */ new Set();
  }
  return state;
};
var pendingActions = (state = /* @__PURE__ */ new Set(), action) => {
  if (action.type === ADD_PENDING_ACTION) {
    return /* @__PURE__ */ new Set([...state, action.actionId]);
  }
  if (action.type === REMOVE_PENDING_ACTION) {
    const newState = new Set(state);
    newState.delete(action.actionId);
    return newState;
  }
  return state;
};
var formStatusCounts = (state = null, action) => {
  if (action.type === SET_FORM_STATUS_COUNTS) {
    return action.formStatusCounts;
  }
  return state;
};
var reducer_default = (0, import_data.combineReducers)({
  selectedResponsesFromCurrentDataset,
  filters,
  currentQuery,
  counts,
  invalidRecords,
  pendingActions,
  formStatusCounts
});

// src/dashboard/store/resolvers.js
var resolvers_exports = {};
__export(resolvers_exports, {
  getCounts: () => getCounts,
  getFilters: () => getFilters,
  getFormStatusCounts: () => getFormStatusCounts
});
var import_api_fetch2 = __toESM(require_api_fetch(), 1);
var import_url = __toESM(require_url(), 1);
var getFilters = () => async ({ dispatch }) => {
  const results = await (0, import_api_fetch2.default)({
    path: "/wp/v2/feedback/filters"
  });
  dispatch.receiveFilters(results);
};
getFilters.shouldInvalidate = (action) => action.type === INVALIDATE_FILTERS;
var getCounts = (queryParams = {}) => async ({ dispatch }) => {
  const params = {};
  if (queryParams?.search) {
    params.search = queryParams.search;
  }
  if (queryParams?.parent) {
    params.parent = queryParams.parent;
  }
  if (queryParams?.before) {
    params.before = queryParams.before;
  }
  if (queryParams?.after) {
    params.after = queryParams.after;
  }
  if (queryParams?.is_unread !== void 0) {
    params.is_unread = queryParams.is_unread;
  }
  const path = (0, import_url.addQueryArgs)("/wp/v2/feedback/counts", params);
  const response = await (0, import_api_fetch2.default)({ path });
  dispatch.setCounts(response, queryParams);
};
getCounts.shouldInvalidate = (action) => action.type === INVALIDATE_COUNTS;
var getFormStatusCounts = () => async ({ dispatch }) => {
  const response = await (0, import_api_fetch2.default)({ path: "/wp/v2/jetpack-forms/status-counts" });
  dispatch.setFormStatusCounts(response);
};
getFormStatusCounts.shouldInvalidate = (action) => action.type === INVALIDATE_FORM_STATUS_COUNTS;

// src/dashboard/store/selectors.js
var selectors_exports = {};
__export(selectors_exports, {
  getCounts: () => getCounts2,
  getCurrentQuery: () => getCurrentQuery,
  getCurrentStatus: () => getCurrentStatus,
  getFilters: () => getFilters2,
  getFormStatusCounts: () => getFormStatusCounts2,
  getInboxCount: () => getInboxCount,
  getInvalidRecords: () => getInvalidRecords,
  getPendingActions: () => getPendingActions,
  getSelectedResponsesCount: () => getSelectedResponsesCount,
  getSelectedResponsesFromCurrentDataset: () => getSelectedResponsesFromCurrentDataset,
  getSpamCount: () => getSpamCount,
  getTrashCount: () => getTrashCount,
  hasPendingActions: () => hasPendingActions,
  isRecordInvalid: () => isRecordInvalid
});
var getFilters2 = (state) => state.filters;
var getCurrentQuery = (state) => state.currentQuery;
var getCurrentStatus = (state) => state.currentQuery?.status ?? "draft,publish";
var getSelectedResponsesFromCurrentDataset = (state) => state.selectedResponsesFromCurrentDataset;
var getSelectedResponsesCount = (state) => state.selectedResponsesFromCurrentDataset.length;
var getCounts2 = (state, queryParams = {}) => {
  const cacheKey = getCacheKey(queryParams);
  return state.counts[cacheKey] || { inbox: 0, spam: 0, trash: 0 };
};
var getInboxCount = (state, queryParams = {}) => {
  const counts2 = getCounts2(state, queryParams);
  return counts2.inbox;
};
var getSpamCount = (state, queryParams = {}) => {
  const counts2 = getCounts2(state, queryParams);
  return counts2.spam;
};
var getTrashCount = (state, queryParams = {}) => {
  const counts2 = getCounts2(state, queryParams);
  return counts2.trash;
};
var getInvalidRecords = (state) => {
  return state.invalidRecords || /* @__PURE__ */ new Set();
};
var isRecordInvalid = (state, recordId) => {
  return state.invalidRecords?.has(recordId) || false;
};
var getPendingActions = (state) => {
  return state.pendingActions || /* @__PURE__ */ new Set();
};
var hasPendingActions = (state) => {
  return (state.pendingActions?.size ?? 0) > 0;
};
var getFormStatusCounts2 = (state) => {
  return state.formStatusCounts;
};

// src/dashboard/store/index.js
var STORE_NAME = "FORM_RESPONSES";
var store = (0, import_data2.createReduxStore)(STORE_NAME, {
  actions: actions_exports,
  reducer: reducer_default,
  selectors: selectors_exports,
  resolvers: resolvers_exports
});
(0, import_data2.register)(store);

// src/dashboard/wp-build/utils/preload.ts
async function preloadGlobalInboxCounts() {
  await (0, import_data3.resolveSelect)(STORE_NAME).getCounts({});
}
async function preloadGlobalTabCounts() {
  await preloadGlobalInboxCounts();
}

// routes/responses/route.tsx
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
  inspector: ({ search }) => {
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
    await (0, import_data4.resolveSelect)("core").getEntityRecords("postType", "feedback", {
      per_page: 20,
      page: search.page || 1,
      status,
      orderby: "date",
      order: "desc",
      fields_format: "collection"
    });
    await preloadGlobalTabCounts();
  },
  /**
   * Validates that the route can be accessed.
   * Checks if the feedback post type exists.
   */
  beforeLoad: async () => {
    const hash = window.location.hash;
    const legacyMatch = hash.match(/^#\/responses\?(.*)$/);
    if (legacyMatch) {
      const params = new URLSearchParams(legacyMatch[1]);
      const r = params.get("r");
      if (r) {
        const status = params.get("status") || "inbox";
        const validStatuses = ["inbox", "spam", "trash"];
        const view = validStatuses.includes(status) ? status : "inbox";
        const hasMarkAsSpam = params.has("mark_as_spam");
        let redirectUrl = `/responses/${view}?responseIds=${encodeURIComponent(
          JSON.stringify([r])
        )}`;
        if (hasMarkAsSpam) {
          redirectUrl += "&mark_as_spam=1";
        }
        throw redirect({
          href: redirectUrl
        });
      }
    }
    try {
      await (0, import_data4.resolveSelect)("core").getPostType("feedback");
    } catch {
    }
  }
};
export {
  route
};
