(function(exports) {

"use strict";
// packages/hooks/build-module/validateNamespace.mjs
/**
	* Validate a namespace string.
	*
	* @param namespace The namespace to validate - should take the form
	*                  `vendor/plugin/function`.
	*
	* @return Whether the namespace is valid.
	*/
	function validateNamespace(namespace) {
		if ("string" !== typeof namespace || "" === namespace) {
			console.error("The namespace must be a non-empty string.");
			return false;
		}
		if (!/^[a-zA-Z][a-zA-Z0-9_.\-\/]*$/.test(namespace)) {
			console.error("The namespace can only contain numbers, letters, dashes, periods, underscores and slashes.");
			return false;
		}
		return true;
	}

// packages/hooks/build-module/validateHookName.mjs
/**
	* Validate a hookName string.
	*
	* @param hookName The hook name to validate. Should be a non empty string containing
	*                 only numbers, letters, dashes, periods and underscores. Also,
	*                 the hook name cannot begin with `__`.
	*
	* @return Whether the hook name is valid.
	*/
	function validateHookName(hookName) {
		if ("string" !== typeof hookName || "" === hookName) {
			console.error("The hook name must be a non-empty string.");
			return false;
		}
		if (/^__/.test(hookName)) {
			console.error("The hook name cannot begin with `__`.");
			return false;
		}
		if (!/^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(hookName)) {
			console.error("The hook name can only contain numbers, letters, dashes, periods and underscores.");
			return false;
		}
		return true;
	}

// packages/hooks/build-module/createAddHook.mjs
/**
	* Returns a function which, when invoked, will add a hook.
	*
	* @param hooks    Hooks instance.
	* @param storeKey
	*
	* @return  Function that adds a new hook.
	*/
	function createAddHook(hooks, storeKey) {
		return function addHook(hookName, namespace, callback, priority = 10) {
			const hooksStore = hooks[storeKey];
			if (!validateHookName(hookName)) return;
			if (!validateNamespace(namespace)) return;
			if ("function" !== typeof callback) {
				console.error("The hook callback must be a function.");
				return;
			}
			if ("number" !== typeof priority) {
				console.error("If specified, the hook priority must be a number.");
				return;
			}
			const handler = {
				callback,
				priority,
				namespace
			};
			if (hooksStore[hookName]) {
				const handlers = hooksStore[hookName].handlers;
				let i;
				for (i = handlers.length; i > 0; i--) if (priority >= handlers[i - 1].priority) break;
				if (i === handlers.length) handlers[i] = handler;
				else handlers.splice(i, 0, handler);
				hooksStore.__current.forEach((hookInfo) => {
					if (hookInfo.name === hookName && hookInfo.currentIndex >= i) hookInfo.currentIndex++;
				});
			} else hooksStore[hookName] = {
				handlers: [handler],
				runs: 0
			};
			if (hookName !== "hookAdded") hooks.doAction("hookAdded", hookName, namespace, callback, priority);
		};
	}

// packages/hooks/build-module/createRemoveHook.mjs
	function createRemoveHook(hooks, storeKey, removeAll = false) {
		return function removeHook(hookName, namespace) {
			const hooksStore = hooks[storeKey];
			if (!validateHookName(hookName)) return;
			if (!removeAll && !validateNamespace(namespace)) return;
			if (!hooksStore[hookName]) return 0;
			let handlersRemoved = 0;
			if (removeAll) {
				handlersRemoved = hooksStore[hookName].handlers.length;
				hooksStore[hookName] = {
					runs: hooksStore[hookName].runs,
					handlers: []
				};
			} else {
				const handlers = hooksStore[hookName].handlers;
				for (let i = handlers.length - 1; i >= 0; i--) if (handlers[i].namespace === namespace) {
					handlers.splice(i, 1);
					handlersRemoved++;
					hooksStore.__current.forEach((hookInfo) => {
						if (hookInfo.name === hookName && hookInfo.currentIndex >= i) hookInfo.currentIndex--;
					});
				}
			}
			if (hookName !== "hookRemoved") hooks.doAction("hookRemoved", hookName, namespace);
			return handlersRemoved;
		};
	}

// packages/hooks/build-module/createHasHook.mjs
/**
	* Returns a function which, when invoked, will return whether any handlers are
	* attached to a particular hook.
	*
	* @param hooks    Hooks instance.
	* @param storeKey
	*
	* @return  Function that returns whether any handlers are
	*                   attached to a particular hook and optional namespace.
	*/
	function createHasHook(hooks, storeKey) {
		return function hasHook(hookName, namespace) {
			const hooksStore = hooks[storeKey];
			if ("undefined" !== typeof namespace) return hookName in hooksStore && hooksStore[hookName].handlers.some((hook) => hook.namespace === namespace);
			return hookName in hooksStore;
		};
	}

// packages/hooks/build-module/createRunHook.mjs
/**
	* Returns a function which, when invoked, will execute all callbacks
	* registered to a hook of the specified type, optionally returning the final
	* value of the call chain.
	*
	* @param hooks          Hooks instance.
	* @param storeKey
	* @param returnFirstArg Whether each hook callback is expected to return its first argument.
	* @param async          Whether the hook callback should be run asynchronously
	*
	* @return Function that runs hook callbacks.
	*/
	function createRunHook(hooks, storeKey, returnFirstArg, async) {
		return function runHook(hookName, ...args) {
			const hooksStore = hooks[storeKey];
			if (!hooksStore[hookName]) hooksStore[hookName] = {
				handlers: [],
				runs: 0
			};
			hooksStore[hookName].runs++;
			const handlers = hooksStore[hookName].handlers;
			if ("hookAdded" !== hookName && hooksStore.all) handlers.push(...hooksStore.all.handlers);
			if (!handlers || !handlers.length) return returnFirstArg ? args[0] : void 0;
			const hookInfo = {
				name: hookName,
				currentIndex: 0
			};
			async function asyncRunner() {
				try {
					hooksStore.__current.add(hookInfo);
					let result = returnFirstArg ? args[0] : void 0;
					while (hookInfo.currentIndex < handlers.length) {
						result = await handlers[hookInfo.currentIndex].callback.apply(null, args);
						if (returnFirstArg) args[0] = result;
						hookInfo.currentIndex++;
					}
					return returnFirstArg ? result : void 0;
				} finally {
					hooksStore.__current.delete(hookInfo);
				}
			}
			function syncRunner() {
				try {
					hooksStore.__current.add(hookInfo);
					let result = returnFirstArg ? args[0] : void 0;
					while (hookInfo.currentIndex < handlers.length) {
						result = handlers[hookInfo.currentIndex].callback.apply(null, args);
						if (returnFirstArg) args[0] = result;
						hookInfo.currentIndex++;
					}
					return returnFirstArg ? result : void 0;
				} finally {
					hooksStore.__current.delete(hookInfo);
				}
			}
			return (async ? asyncRunner : syncRunner)();
		};
	}

// packages/hooks/build-module/createCurrentHook.mjs
/**
	* Returns a function which, when invoked, will return the name of the
	* currently running hook, or `null` if no hook of the given type is currently
	* running.
	*
	* @param hooks    Hooks instance.
	* @param storeKey
	*
	* @return Function that returns the current hook name or null.
	*/
	function createCurrentHook(hooks, storeKey) {
		return function currentHook() {
			const hooksStore = hooks[storeKey];
			return Array.from(hooksStore.__current).at(-1)?.name ?? null;
		};
	}

// packages/hooks/build-module/createDoingHook.mjs
/**
	* Returns a function which, when invoked, will return whether a hook is
	* currently being executed.
	*
	* @param hooks    Hooks instance.
	* @param storeKey
	*
	* @return Function that returns whether a hook is currently
	*                     being executed.
	*/
	function createDoingHook(hooks, storeKey) {
		return function doingHook(hookName) {
			const hooksStore = hooks[storeKey];
			if ("undefined" === typeof hookName) return hooksStore.__current.size > 0;
			return Array.from(hooksStore.__current).some((hook) => hook.name === hookName);
		};
	}

// packages/hooks/build-module/createDidHook.mjs
/**
	* Returns a function which, when invoked, will return the number of times a
	* hook has been called.
	*
	* @param hooks    Hooks instance.
	* @param storeKey
	*
	* @return  Function that returns a hook's call count.
	*/
	function createDidHook(hooks, storeKey) {
		return function didHook(hookName) {
			const hooksStore = hooks[storeKey];
			if (!validateHookName(hookName)) return;
			return hooksStore[hookName] && hooksStore[hookName].runs ? hooksStore[hookName].runs : 0;
		};
	}

// packages/hooks/build-module/createHooks.mjs
/**
	* Internal class for constructing hooks. Use `createHooks()` function
	*
	* Note, it is necessary to expose this class to make its type public.
	*
	* @private
	*/
	var _Hooks = class {
		actions;
		filters;
		addAction;
		addFilter;
		removeAction;
		removeFilter;
		hasAction;
		hasFilter;
		removeAllActions;
		removeAllFilters;
		doAction;
		doActionAsync;
		applyFilters;
		applyFiltersAsync;
		currentAction;
		currentFilter;
		doingAction;
		doingFilter;
		didAction;
		didFilter;
		constructor() {
			this.actions = Object.create(null);
			this.actions.__current = /* @__PURE__ */ new Set();
			this.filters = Object.create(null);
			this.filters.__current = /* @__PURE__ */ new Set();
			this.addAction = createAddHook(this, "actions");
			this.addFilter = createAddHook(this, "filters");
			this.removeAction = createRemoveHook(this, "actions");
			this.removeFilter = createRemoveHook(this, "filters");
			this.hasAction = createHasHook(this, "actions");
			this.hasFilter = createHasHook(this, "filters");
			this.removeAllActions = createRemoveHook(this, "actions", true);
			this.removeAllFilters = createRemoveHook(this, "filters", true);
			this.doAction = createRunHook(this, "actions", false, false);
			this.doActionAsync = createRunHook(this, "actions", false, true);
			this.applyFilters = createRunHook(this, "filters", true, false);
			this.applyFiltersAsync = createRunHook(this, "filters", true, true);
			this.currentAction = createCurrentHook(this, "actions");
			this.currentFilter = createCurrentHook(this, "filters");
			this.doingAction = createDoingHook(this, "actions");
			this.doingFilter = createDoingHook(this, "filters");
			this.didAction = createDidHook(this, "actions");
			this.didFilter = createDidHook(this, "filters");
		}
	};
	/**
	* Returns an instance of the hooks object.
	*
	* @return A Hooks instance.
	*/
	function createHooks() {
		return new _Hooks();
	}

// packages/hooks/build-module/index.mjs
	const defaultHooks = createHooks();
	const { addAction, addFilter, removeAction, removeFilter, hasAction, hasFilter, removeAllActions, removeAllFilters, doAction, doActionAsync, applyFilters, applyFiltersAsync, currentAction, currentFilter, doingAction, doingFilter, didAction, didFilter, actions, filters } = defaultHooks;

exports.actions = actions;
exports.addAction = addAction;
exports.addFilter = addFilter;
exports.applyFilters = applyFilters;
exports.applyFiltersAsync = applyFiltersAsync;
exports.createHooks = createHooks;
exports.currentAction = currentAction;
exports.currentFilter = currentFilter;
exports.defaultHooks = defaultHooks;
exports.didAction = didAction;
exports.didFilter = didFilter;
exports.doAction = doAction;
exports.doActionAsync = doActionAsync;
exports.doingAction = doingAction;
exports.doingFilter = doingFilter;
exports.filters = filters;
exports.hasAction = hasAction;
exports.hasFilter = hasFilter;
exports.removeAction = removeAction;
exports.removeAllActions = removeAllActions;
exports.removeAllFilters = removeAllFilters;
exports.removeFilter = removeFilter;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).hooks = exports;
return exports;
})({});
//# sourceMappingURL=index.js.map