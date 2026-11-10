(function(exports, _wordpress_api_fetch) {

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

// packages/preferences-persistence/build-module/create/debounce-async.mjs
/**
	* Performs a leading edge debounce of async functions.
	*
	* If three functions are throttled at the same time:
	* - The first happens immediately.
	* - The second is never called.
	* - The third happens `delayMS` milliseconds after the first has resolved.
	*
	* This is distinct from `{ debounce } from @wordpress/compose` in that it
	* waits for promise resolution.
	*
	* @param func    A function that returns a promise.
	* @param delayMS A delay in milliseconds.
	*
	* @return A function that debounce whatever function is passed
	*         to it.
	*/
	function debounceAsync(func, delayMS) {
		let timeoutId;
		let activePromise;
		return async function debounced(...args) {
			if (!activePromise && !timeoutId) return new Promise((resolve, reject) => {
				activePromise = func(...args).then((...thenArgs) => {
					resolve(...thenArgs);
				}).catch((error) => {
					reject(error);
				}).finally(() => {
					activePromise = null;
				});
			});
			if (activePromise) await activePromise;
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			return new Promise((resolve, reject) => {
				timeoutId = setTimeout(() => {
					activePromise = func(...args).then((...thenArgs) => {
						resolve(...thenArgs);
					}).catch((error) => {
						reject(error);
					}).finally(() => {
						activePromise = null;
						timeoutId = null;
					});
				}, delayMS);
			});
		};
	}

// packages/preferences-persistence/build-module/is-preferences-data.mjs
/**
	* Checks whether persisted data is a preferences object. Empty user meta
	* reaches the client as `[]` or `''`, which must not be used as preferences.
	*
	* @param data The persisted data.
	*
	* @return Whether the data is a preferences object.
	*/
	function isPreferencesData(data) {
		return !!data && typeof data === "object" && !Array.isArray(data);
	}

// packages/preferences-persistence/build-module/local-storage.mjs
/**
	* Reads and parses a JSON value from local storage.
	*
	* @param key The local storage key.
	*
	* @return The parsed value, or `null` when the value is missing or invalid,
	*         or local storage is unavailable.
	*/
	function readStoredJSON(key) {
		try {
			const value = window.localStorage.getItem(key);
			return value === null ? null : JSON.parse(value);
		} catch {
			return null;
		}
	}
	/**
	* Stores a value in local storage as JSON.
	*
	* Failures, such as blocked storage or an exceeded quota, are ignored.
	*
	* @param key   The local storage key.
	* @param value The value to store.
	*/
	function writeStoredJSON(key, value) {
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch {}
	}

// packages/preferences-persistence/build-module/migrations/preferences-package-data/convert-complementary-areas.mjs
	function convertComplementaryAreas(state) {
		return Object.keys(state).reduce((stateAccumulator, scope) => {
			const scopeData = state[scope];
			if (scopeData?.complementaryArea) {
				const updatedScopeData = { ...scopeData };
				delete updatedScopeData.complementaryArea;
				updatedScopeData.isComplementaryAreaVisible = true;
				stateAccumulator[scope] = updatedScopeData;
				return stateAccumulator;
			}
			return stateAccumulator;
		}, { ...state });
	}

// packages/preferences-persistence/build-module/migrations/preferences-package-data/convert-editor-settings.mjs
	const copyScope = (scope) => isPreferencesData(scope) ? { ...scope } : void 0;
	function convertEditorSettings(data) {
		const newData = { ...data };
		const editPost = copyScope(data["core/edit-post"]);
		const editSite = copyScope(data["core/edit-site"]);
		[
			"allowRightClickOverrides",
			"distractionFree",
			"editorMode",
			"fixedToolbar",
			"focusMode",
			"hiddenBlockTypes",
			"inactivePanels",
			"keepCaretInsideBlock",
			"mostUsedBlocks",
			"openPanels",
			"showBlockBreadcrumbs",
			"showIconLabels",
			"showListViewByDefault",
			"isPublishSidebarEnabled",
			"isComplementaryAreaVisible",
			"pinnedItems"
		].forEach((setting) => {
			if (editPost?.[setting] !== void 0) {
				newData.core = {
					...copyScope(newData.core),
					[setting]: editPost[setting]
				};
				delete editPost[setting];
			}
			if (editSite?.[setting] !== void 0) delete editSite[setting];
		});
		if (editPost && Object.keys(editPost).length > 0) newData["core/edit-post"] = editPost;
		else delete newData["core/edit-post"];
		if (editSite && Object.keys(editSite).length > 0) newData["core/edit-site"] = editSite;
		else delete newData["core/edit-site"];
		return newData;
	}

// packages/preferences-persistence/build-module/migrations/preferences-package-data/index.mjs
	function convertPreferencesPackageData(data) {
		let newData = convertComplementaryAreas(data);
		newData = convertEditorSettings(newData);
		return newData;
	}

// packages/preferences-persistence/build-module/get-newest-data.mjs
/**
	* Picks the most recently modified preferences from the server data and the
	* local storage backup, ignoring either when it is not a preferences object.
	*
	* @param serverData             Preferences data from the server.
	* @param localStorageRestoreKey The key of the local storage backup.
	*
	* @return The newest preferences data, or `null` when neither is valid.
	*/
	function pickNewestData(serverData, localStorageRestoreKey) {
		const storedData = readStoredJSON(localStorageRestoreKey);
		const localData = isPreferencesData(storedData) ? storedData : null;
		if (!isPreferencesData(serverData)) return localData;
		const serverModified = Date.parse(serverData._modified ?? "") || 0;
		const localModified = Date.parse(localData?._modified ?? "") || 0;
		return localData && localModified > serverModified ? localData : serverData;
	}
	/**
	* Gets the newest persisted preferences, migrated to the current format.
	*
	* @param serverData             Preferences data from the server.
	* @param localStorageRestoreKey The key of the local storage backup.
	*
	* @return The migrated preferences, or `undefined` when there are none.
	*/
	function getNewestData(serverData, localStorageRestoreKey) {
		const newestData = pickNewestData(serverData, localStorageRestoreKey);
		return newestData ? convertPreferencesPackageData(newestData) : void 0;
	}

// packages/preferences-persistence/build-module/create/index.mjs
/**
	* Creates a persistence layer that stores data in WordPress user meta via the
	* REST API.
	*
	* @param {CreateOptions}        [options]
	* @param {PreferencesData|null} [options.preloadedData]          Any persisted preferences data that should be preloaded.
	*                                                                When set, the persistence layer will avoid fetching data
	*                                                                from the REST API.
	* @param {string}               [options.localStorageRestoreKey] The key to use for restoring the localStorage backup, used
	*                                                                when the persistence layer calls `localStorage.getItem` or
	*                                                                `localStorage.setItem`.
	* @param {number}               [options.requestDebounceMS]      Debounce requests to the API so that they only occur at
	*                                                                minimum every `requestDebounceMS` milliseconds, and don't
	*                                                                swamp the server. Defaults to 2500ms.
	*
	* @return A persistence layer for WordPress user meta.
	*/
	function create({ preloadedData, localStorageRestoreKey = "WP_PREFERENCES_RESTORE_DATA", requestDebounceMS = 2500 } = {}) {
		let cache = isPreferencesData(preloadedData) ? preloadedData : void 0;
		const debouncedApiFetch = debounceAsync(_wordpress_api_fetch.default, requestDebounceMS);
		async function get() {
			if (cache) return cache;
			const user = await (0, _wordpress_api_fetch.default)({ path: "/wp/v2/users/me?context=edit" });
			cache = getNewestData(user?.meta?.persisted_preferences, localStorageRestoreKey) ?? {};
			return cache;
		}
		function set(newData) {
			const dataWithTimestamp = {
				...newData,
				_modified: (/* @__PURE__ */ new Date()).toISOString()
			};
			cache = dataWithTimestamp;
			writeStoredJSON(localStorageRestoreKey, dataWithTimestamp);
			debouncedApiFetch({
				path: "/wp/v2/users/me",
				method: "PUT",
				keepalive: true,
				data: { meta: { persisted_preferences: dataWithTimestamp } }
			}).catch(() => {});
		}
		return {
			get,
			set
		};
	}

// packages/preferences-persistence/build-module/migrations/legacy-local-storage-data/move-feature-preferences.mjs
/**
	* Move the 'features' object in local storage from the sourceStoreName to the
	* preferences store data structure.
	*
	* Previously, editors used a data structure like this for feature preferences:
	* ```js
	* {
	*     'core/edit-post': {
	*         preferences: {
	*             features; {
	*                 topToolbar: true,
	*                 // ... other boolean 'feature' preferences
	*             },
	*         },
	*     },
	* }
	* ```
	*
	* And for a while these feature preferences lived in the interface package:
	* ```js
	* {
	*     'core/interface': {
	*         preferences: {
	*             features: {
	*                 'core/edit-post': {
	*                     topToolbar: true
	*                 }
	*             }
	*         }
	*     }
	* }
	* ```
	*
	* In the preferences store, 'features' aren't considered special, they're
	* merged to the root level of the scope along with other preferences:
	* ```js
	* {
	*     'core/preferences': {
	*         preferences: {
	*             'core/edit-post': {
	*                 topToolbar: true,
	*                 // ... any other preferences.
	*             }
	*         }
	*     }
	* }
	* ```
	*
	* This function handles moving from either the source store or the interface
	* store to the preferences data structure.
	*
	* @param state           The state before migration.
	* @param sourceStoreName The name of the store that has persisted
	*                        preferences to migrate to the preferences
	*                        package.
	* @return The migrated state
	*/
	function moveFeaturePreferences(state, sourceStoreName) {
		const preferencesStoreName = "core/preferences";
		const interfaceStoreName = "core/interface";
		const interfaceFeatures = state?.[interfaceStoreName]?.preferences?.features?.[sourceStoreName];
		const sourceFeatures = state?.[sourceStoreName]?.preferences?.features;
		const featuresToMigrate = interfaceFeatures ? interfaceFeatures : sourceFeatures;
		if (!featuresToMigrate) return state;
		const existingPreferences = state?.[preferencesStoreName]?.preferences;
		if (existingPreferences?.[sourceStoreName]) return state;
		let updatedInterfaceState;
		if (interfaceFeatures) {
			const otherInterfaceState = state?.[interfaceStoreName];
			const otherInterfaceScopes = state?.[interfaceStoreName]?.preferences?.features;
			updatedInterfaceState = { [interfaceStoreName]: {
				...otherInterfaceState,
				preferences: { features: {
					...otherInterfaceScopes,
					[sourceStoreName]: void 0
				} }
			} };
		}
		let updatedSourceState;
		if (sourceFeatures) {
			const otherSourceState = state?.[sourceStoreName];
			const sourcePreferences = state?.[sourceStoreName]?.preferences;
			updatedSourceState = { [sourceStoreName]: {
				...otherSourceState,
				preferences: {
					...sourcePreferences,
					features: void 0
				}
			} };
		}
		return {
			...state,
			[preferencesStoreName]: { preferences: {
				...existingPreferences,
				[sourceStoreName]: featuresToMigrate
			} },
			...updatedInterfaceState,
			...updatedSourceState
		};
	}

// packages/preferences-persistence/build-module/migrations/legacy-local-storage-data/move-third-party-feature-preferences.mjs
/**
	* The interface package previously had a public API that could be used by
	* plugins to set persisted boolean 'feature' preferences.
	*
	* While usage was likely non-existent or very small, this function ensures
	* those are migrated to the preferences data structure. The interface
	* package's APIs have now been deprecated and use the preferences store.
	*
	* This will convert data that looks like this:
	* ```js
	* {
	*     'core/interface': {
	*         preferences: {
	*             features: {
	*                 'my-plugin': {
	*                     myPluginFeature: true
	*                 }
	*             }
	*         }
	*     }
	* }
	* ```
	*
	* To this:
	* ```js
	*  * {
	*     'core/preferences': {
	*         preferences: {
	*             'my-plugin': {
	*                 myPluginFeature: true
	*             }
	*         }
	*     }
	* }
	* ```
	*
	* @param state The local storage state
	*
	* @return The state with third party preferences moved to the
	*         preferences data structure.
	*/
	function moveThirdPartyFeaturePreferencesToPreferences(state) {
		const interfaceStoreName = "core/interface";
		const preferencesStoreName = "core/preferences";
		const interfaceScopes = state?.[interfaceStoreName]?.preferences?.features;
		const interfaceScopeKeys = interfaceScopes ? Object.keys(interfaceScopes) : [];
		if (!interfaceScopeKeys?.length) return state;
		return interfaceScopeKeys.reduce(function(convertedState, scope) {
			if (scope.startsWith("core")) return convertedState;
			const featuresToMigrate = interfaceScopes?.[scope];
			if (!featuresToMigrate) return convertedState;
			if (convertedState?.[preferencesStoreName]?.preferences?.[scope]) return convertedState;
			const otherPreferencesScopes = convertedState?.[preferencesStoreName]?.preferences;
			const otherInterfaceState = convertedState?.[interfaceStoreName];
			const otherInterfaceScopes = convertedState?.[interfaceStoreName]?.preferences?.features;
			return {
				...convertedState,
				[preferencesStoreName]: { preferences: {
					...otherPreferencesScopes,
					[scope]: featuresToMigrate
				} },
				[interfaceStoreName]: {
					...otherInterfaceState,
					preferences: { features: {
						...otherInterfaceScopes,
						[scope]: void 0
					} }
				}
			};
		}, state);
	}

// packages/preferences-persistence/build-module/migrations/legacy-local-storage-data/move-individual-preference.mjs
	const identity = (arg) => arg;
	/**
	* Migrates an individual item inside the `preferences` object for a package's store.
	*
	* Previously, some packages had individual 'preferences' of any data type, and many used
	* complex nested data structures. For example:
	* ```js
	* {
	*     'core/edit-post': {
	*         preferences: {
	*             panels: {
	*                 publish: {
	*                     opened: true,
	*                     enabled: true,
	*                 }
	*             },
	*             // ...other preferences.
	*         },
	*     },
	* }
	*
	* This function supports moving an individual preference like 'panels' above into the
	* preferences package data structure.
	*
	* It supports moving a preference to a particular scope in the preferences store and
	* optionally converting the data using a `convert` function.
	*
	* ```
	*
	* @param state        The original state.
	* @param migrate      An options object that contains details of the migration.
	* @param migrate.from The name of the store to migrate from.
	* @param migrate.to   The scope in the preferences store to migrate to.
	* @param key          The key in the preferences object to migrate.
	* @param convert      A function that converts preferences from one format to another.
	*/
	function moveIndividualPreferenceToPreferences(state, { from: sourceStoreName, to: scope }, key, convert = identity) {
		const preferencesStoreName = "core/preferences";
		const sourcePreference = state?.[sourceStoreName]?.preferences?.[key];
		if (sourcePreference === void 0) return state;
		if (state?.[preferencesStoreName]?.preferences?.[scope]?.[key]) return state;
		const otherScopes = state?.[preferencesStoreName]?.preferences;
		const otherPreferences = state?.[preferencesStoreName]?.preferences?.[scope];
		const otherSourceState = state?.[sourceStoreName];
		const allSourcePreferences = state?.[sourceStoreName]?.preferences;
		const convertedPreferences = convert({ [key]: sourcePreference });
		return {
			...state,
			[preferencesStoreName]: { preferences: {
				...otherScopes,
				[scope]: {
					...otherPreferences,
					...convertedPreferences
				}
			} },
			[sourceStoreName]: {
				...otherSourceState,
				preferences: {
					...allSourcePreferences,
					[key]: void 0
				}
			}
		};
	}

// packages/preferences-persistence/build-module/migrations/legacy-local-storage-data/move-interface-enable-items.mjs
/**
	* Migrates interface 'enableItems' data to the preferences store.
	*
	* The interface package stores this data in this format:
	* ```js
	* {
	*     enableItems: {
	*         singleEnableItems: {
	* 	           complementaryArea: {
	*                 'core/edit-post': 'edit-post/document',
	*                 'core/edit-site': 'edit-site/global-styles',
	*             }
	*         },
	*         multipleEnableItems: {
	*             pinnedItems: {
	*                 'core/edit-post': {
	*                     'plugin-1': true,
	*                 },
	*                 'core/edit-site': {
	*                     'plugin-2': true,
	*                 },
	*             },
	*         }
	*     }
	* }
	* ```
	*
	* and it should be converted it to:
	* ```js
	* {
	*     'core/edit-post': {
	*         complementaryArea: 'edit-post/document',
	*         pinnedItems: {
	*             'plugin-1': true,
	*         },
	*     },
	*     'core/edit-site': {
	*         complementaryArea: 'edit-site/global-styles',
	*         pinnedItems: {
	*             'plugin-2': true,
	*         },
	*     },
	* }
	* ```
	*
	* @param state The local storage state.
	*/
	function moveInterfaceEnableItems(state) {
		const interfaceStoreName = "core/interface";
		const preferencesStoreName = "core/preferences";
		const sourceEnableItems = state?.[interfaceStoreName]?.enableItems;
		if (!sourceEnableItems) return state;
		const allPreferences = state?.[preferencesStoreName]?.preferences ?? {};
		const sourceComplementaryAreas = sourceEnableItems?.singleEnableItems?.complementaryArea ?? {};
		const preferencesWithConvertedComplementaryAreas = Object.keys(sourceComplementaryAreas).reduce((accumulator, scope) => {
			const data = sourceComplementaryAreas[scope];
			if (accumulator?.[scope]?.complementaryArea) return accumulator;
			return {
				...accumulator,
				[scope]: {
					...accumulator[scope],
					complementaryArea: data
				}
			};
		}, allPreferences);
		const sourcePinnedItems = sourceEnableItems?.multipleEnableItems?.pinnedItems ?? {};
		const allConvertedData = Object.keys(sourcePinnedItems).reduce((accumulator, scope) => {
			const data = sourcePinnedItems[scope];
			if (accumulator?.[scope]?.pinnedItems) return accumulator;
			return {
				...accumulator,
				[scope]: {
					...accumulator[scope],
					pinnedItems: data
				}
			};
		}, preferencesWithConvertedComplementaryAreas);
		const otherInterfaceItems = state[interfaceStoreName];
		return {
			...state,
			[preferencesStoreName]: { preferences: allConvertedData },
			[interfaceStoreName]: {
				...otherInterfaceItems,
				enableItems: void 0
			}
		};
	}

// packages/preferences-persistence/build-module/migrations/legacy-local-storage-data/convert-edit-post-panels.mjs
/**
	* Convert the post editor's panels state from:
	* ```
	* {
	*     panels: {
	*         tags: {
	*             enabled: true,
	*             opened: true,
	*         },
	*         permalinks: {
	*             enabled: false,
	*             opened: false,
	*         },
	*     },
	* }
	* ```
	*
	* to a new, more concise data structure:
	* {
	*     inactivePanels: [
	*         'permalinks',
	*     ],
	*     openPanels: [
	*         'tags',
	*     ],
	* }
	*
	* @param preferences A preferences object.
	*
	* @return The converted data.
	*/
	function convertEditPostPanels(preferences) {
		const panels = preferences?.panels ?? {};
		return Object.keys(panels).reduce((convertedData, panelName) => {
			const panel = panels[panelName];
			if (panel?.enabled === false) convertedData.inactivePanels.push(panelName);
			if (panel?.opened === true) convertedData.openPanels.push(panelName);
			return convertedData;
		}, {
			inactivePanels: [],
			openPanels: []
		});
	}

// packages/preferences-persistence/build-module/migrations/legacy-local-storage-data/index.mjs
/**
	* Gets the legacy local storage data for a given user.
	*
	* @param userId The user id.
	*
	* @return The local storage data.
	*/
	function getLegacyData(userId) {
		return readStoredJSON(`WP_DATA_USER_${userId}`);
	}
	/**
	* Converts data from the old `@wordpress/data` package format.
	*
	* @param data The legacy data in its original format.
	*
	* @return The converted data or `undefined` if there was
	*         nothing to convert.
	*/
	function convertLegacyData(data) {
		if (!data) return;
		data = moveFeaturePreferences(data, "core/edit-widgets");
		data = moveFeaturePreferences(data, "core/customize-widgets");
		data = moveFeaturePreferences(data, "core/edit-post");
		data = moveFeaturePreferences(data, "core/edit-site");
		data = moveThirdPartyFeaturePreferencesToPreferences(data);
		data = moveInterfaceEnableItems(data);
		data = moveIndividualPreferenceToPreferences(data, {
			from: "core/edit-post",
			to: "core/edit-post"
		}, "hiddenBlockTypes");
		data = moveIndividualPreferenceToPreferences(data, {
			from: "core/edit-post",
			to: "core/edit-post"
		}, "editorMode");
		data = moveIndividualPreferenceToPreferences(data, {
			from: "core/edit-post",
			to: "core/edit-post"
		}, "panels", convertEditPostPanels);
		data = moveIndividualPreferenceToPreferences(data, {
			from: "core/editor",
			to: "core"
		}, "isPublishSidebarEnabled");
		data = moveIndividualPreferenceToPreferences(data, {
			from: "core/edit-post",
			to: "core"
		}, "isPublishSidebarEnabled");
		data = moveIndividualPreferenceToPreferences(data, {
			from: "core/edit-site",
			to: "core/edit-site"
		}, "editorMode");
		const preferences = data?.["core/preferences"]?.preferences;
		return isPreferencesData(preferences) ? preferences : void 0;
	}
	/**
	* Gets the legacy local storage data for the given user and returns the
	* data converted to the new format.
	*
	* @param userId The user id.
	*
	* @return The converted data or undefined if no local
	*         storage data could be found.
	*/
	function convertLegacyLocalStorageData(userId) {
		return convertLegacyData(getLegacyData(userId));
	}

// packages/preferences-persistence/build-module/index.mjs
/**
	* Creates the persistence layer with preloaded data.
	*
	* It prioritizes any data from the server, but falls back first to localStorage
	* restore data, and then to any legacy data.
	*
	* This function is used internally by WordPress in an inline script, so
	* prefixed with `__unstable`.
	*
	* @param serverData Preferences data preloaded from the server.
	* @param userId     The user id.
	*
	* @return The persistence layer initialized with the preloaded data.
	*/
	function __unstableCreatePersistenceLayer(serverData, userId) {
		const localStorageRestoreKey = `WP_PREFERENCES_USER_${userId}`;
		return create({
			preloadedData: getNewestData(serverData, localStorageRestoreKey) ?? convertLegacyLocalStorageData(userId) ?? {},
			localStorageRestoreKey
		});
	}

exports.__unstableCreatePersistenceLayer = __unstableCreatePersistenceLayer;
exports.create = create;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).preferencesPersistence = exports;
return exports;
})({}, window.wp.apiFetch);
//# sourceMappingURL=index.js.map