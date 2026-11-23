(function(exports, _wordpress_element, _wordpress_router, _wordpress_commands, _wordpress_i18n, _wordpress_primitives, react_jsx_runtime, _wordpress_core_data, _wordpress_data, _wordpress_url, _wordpress_compose, _wordpress_html_entities, _wordpress_private_apis) {

"use strict";
// packages/icons/build-module/library/external.mjs
	var external_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.5 6.25H6.5C5.80964 6.25 5.25 6.80964 5.25 7.5V17.5C5.25 18.1904 5.80964 18.75 6.5 18.75H16.5C17.1904 18.75 17.75 18.1904 17.75 17.5V14.5M11.5 12.5L18.75 5.25M12.5 5.25H18.75V11.5" })
	});

// packages/icons/build-module/library/layout.mjs
	var layout_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.75 19.25H18C18.6904 19.25 19.25 18.6904 19.25 18V9.75M9.75 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V9.75M9.75 19.25V9.75M19.25 9.75V6C19.25 5.30964 18.6904 4.75 18 4.75H6C5.30964 4.75 4.75 5.30964 4.75 6V9.75M19.25 9.75H9.75M9.75 9.75H4.75" })
	});

// packages/icons/build-module/library/page.mjs
	var page_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M8.5 8.25H15.5M8.5 11.75H15.5M8.5 15.25H15.5M18.25 18V6C18.25 5.30964 17.6904 4.75 17 4.75H7C6.30964 4.75 5.75 5.30964 5.75 6L5.75 18C5.75 18.6904 6.30964 19.25 7 19.25H17C17.6904 19.25 18.25 18.6904 18.25 18Z" })
	});

// packages/icons/build-module/library/post.mjs
	var post_default = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M4.76776 11.5178L7.76777 8.51776M4 15H20M4 19H13M6 6.74999L9.53554 10.2855C10.1688 9.65226 10.3913 8.76379 10.2031 7.95118L12.5178 6.26776L10.0178 3.76776L8.33435 6.08246C7.52174 5.89422 6.63327 6.11673 6 6.74999Z" })
	});

// packages/icons/build-module/library/symbol-filled.mjs
	var symbol_filled_default = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_wordpress_primitives.SVG, {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		style: { fill: "none" },
		stroke: "currentColor",
		strokeWidth: "1.5",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, {
			d: "M15.2071 6.20711L20.2929 11.2929C20.6834 11.6834 20.6834 12.3166 20.2929 12.7071L15.2071 17.7929C14.8166 18.1834 14.1834 18.1834 13.7929 17.7929L8.70711 12.7071C8.31658 12.3166 8.31658 11.6834 8.70711 11.2929L13.7929 6.20711C14.1834 5.81658 14.8166 5.81658 15.2071 6.20711Z",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_primitives.Path, { d: "M9.5 5.5L3.70711 11.2929C3.31658 11.6834 3.31658 12.3166 3.70711 12.7071L9.5 18.5" })]
	});

// packages/core-commands/build-module/admin-navigation-commands.mjs
	const getViewSiteCommand = () => function useViewSiteCommand() {
		const homeUrl = (0, _wordpress_data.useSelect)((select) => {
			return select(_wordpress_core_data.store).getEntityRecord("root", "__unstableBase")?.home;
		}, []);
		return {
			isLoading: false,
			commands: (0, _wordpress_element.useMemo)(() => {
				if (!homeUrl) return [];
				return [{
					name: "core/view-site",
					label: (0, _wordpress_i18n.__)("View site"),
					icon: external_default,
					category: "view",
					callback: ({ close }) => {
						close();
						window.open(homeUrl, "_blank");
					}
				}];
			}, [homeUrl])
		};
	};
	function useAdminNavigationCommands(menuCommands) {
		const commands = (0, _wordpress_element.useMemo)(() => {
			return (menuCommands ?? []).map((menuCommand) => {
				const label = (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Go to: %s"), menuCommand.label);
				return {
					name: menuCommand.name,
					label,
					searchLabel: label,
					category: "view",
					callback: ({ close }) => {
						document.location = menuCommand.url;
						close();
					}
				};
			});
		}, [menuCommands]);
		(0, _wordpress_commands.useCommands)(commands);
		(0, _wordpress_commands.useCommandLoader)({
			name: "core/view-site",
			hook: getViewSiteCommand()
		});
	}

// packages/core-commands/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/core-commands");

// packages/core-commands/build-module/utils/order-entity-records-by-search.mjs
	function orderEntityRecordsBySearch(records = [], search = "") {
		if (!Array.isArray(records) || !records.length) return [];
		if (!search) return records;
		const priority = [];
		const nonPriority = [];
		for (let i = 0; i < records.length; i++) {
			const record = records[i];
			if (record?.title?.raw?.toLowerCase()?.includes(search?.toLowerCase())) priority.push(record);
			else nonPriority.push(record);
		}
		return priority.concat(nonPriority);
	}

// packages/core-commands/build-module/site-editor-navigation-commands.mjs
	const { useHistory } = unlock(_wordpress_router.privateApis);
	const icons = {
		post: post_default,
		page: page_default,
		wp_template: layout_default,
		wp_template_part: symbol_filled_default
	};
	function useDebouncedValue(value) {
		const [debouncedValue, setDebouncedValue] = (0, _wordpress_element.useState)("");
		const debounced = (0, _wordpress_compose.useDebounce)(setDebouncedValue, 250);
		(0, _wordpress_element.useEffect)(() => {
			debounced(value);
			return () => debounced.cancel();
		}, [debounced, value]);
		return debouncedValue;
	}
	const ROUTE_MAPPING = {
		"/template": "/templates",
		"/pattern": "/patterns"
	};
	function getSiteEditorPage() {
		return window.__experimentalExtensibleSiteEditor ? "admin.php?page=site-editor-v2" : "site-editor.php";
	}
	function mapRoute(path) {
		if (!window.__experimentalExtensibleSiteEditor) return path;
		for (const [oldPath, newPath] of Object.entries(ROUTE_MAPPING)) if (path === oldPath || path.startsWith(oldPath + "?")) {
			if (path.includes("postType=wp_template_part")) return "/template-parts";
			return path.replace(oldPath, newPath);
		}
		return path;
	}
	function isInSiteEditor() {
		const path = (0, _wordpress_url.getPath)(window.location.href);
		return path?.includes("site-editor.php") || path?.includes("page=site-editor-v2");
	}
	const getNavigationCommandLoaderPerPostType = (postType) => function useNavigationCommandLoader({ search }) {
		const history = useHistory();
		const { isBlockBasedTheme, canCreateTemplate } = (0, _wordpress_data.useSelect)((select) => {
			return {
				isBlockBasedTheme: select(_wordpress_core_data.store).getCurrentTheme()?.is_block_theme,
				canCreateTemplate: select(_wordpress_core_data.store).canUser("create", {
					kind: "postType",
					name: "wp_template"
				})
			};
		}, []);
		const delayedSearch = useDebouncedValue(search);
		const { records, isLoading } = (0, _wordpress_data.useSelect)((select) => {
			if (!delayedSearch) return { isLoading: false };
			const query = {
				search: delayedSearch,
				per_page: 10,
				orderby: "relevance",
				status: [
					"publish",
					"future",
					"draft",
					"pending",
					"private"
				]
			};
			return {
				records: select(_wordpress_core_data.store).getEntityRecords("postType", postType, query),
				isLoading: !select(_wordpress_core_data.store).hasFinishedResolution("getEntityRecords", [
					"postType",
					postType,
					query
				])
			};
		}, [delayedSearch]);
		return {
			commands: (0, _wordpress_element.useMemo)(() => {
				return (records ?? []).map((record) => {
					const command = {
						name: postType + "-" + record.id,
						searchLabel: record.title?.rendered + " " + record.id,
						label: record.title?.rendered ? (0, _wordpress_html_entities.decodeEntities)(record.title?.rendered) : (0, _wordpress_i18n.__)("(no title)"),
						icon: icons[postType],
						category: "edit"
					};
					if (!canCreateTemplate || postType === "post" || postType === "page" && !isBlockBasedTheme) return {
						...command,
						callback: ({ close }) => {
							const args = {
								post: record.id,
								action: "edit"
							};
							const targetUrl = (0, _wordpress_url.addQueryArgs)("post.php", args);
							document.location = targetUrl;
							close();
						}
					};
					const isSiteEditor = isInSiteEditor();
					return {
						...command,
						callback: ({ close }) => {
							if (isSiteEditor) history.navigate(`/${postType}/${record.id}?canvas=edit`);
							else document.location = (0, _wordpress_url.addQueryArgs)(getSiteEditorPage(), {
								p: `/${postType}/${record.id}`,
								canvas: "edit"
							});
							close();
						}
					};
				});
			}, [
				canCreateTemplate,
				records,
				isBlockBasedTheme,
				history
			]),
			isLoading
		};
	};
	const getNavigationCommandLoaderPerTemplate = (templateType) => function useNavigationCommandLoader({ search }) {
		const history = useHistory();
		const { isBlockBasedTheme, canCreateTemplate } = (0, _wordpress_data.useSelect)((select) => {
			return {
				isBlockBasedTheme: select(_wordpress_core_data.store).getCurrentTheme()?.is_block_theme,
				canCreateTemplate: select(_wordpress_core_data.store).canUser("create", {
					kind: "postType",
					name: templateType
				})
			};
		}, []);
		const { records, isLoading } = (0, _wordpress_data.useSelect)((select) => {
			const { getEntityRecords } = select(_wordpress_core_data.store);
			const query = { per_page: -1 };
			return {
				records: getEntityRecords("postType", templateType, query),
				isLoading: !select(_wordpress_core_data.store).hasFinishedResolution("getEntityRecords", [
					"postType",
					templateType,
					query
				])
			};
		}, []);
		const orderedRecords = (0, _wordpress_element.useMemo)(() => {
			return orderEntityRecordsBySearch(records, search).slice(0, 10);
		}, [records, search]);
		return {
			commands: (0, _wordpress_element.useMemo)(() => {
				if (!canCreateTemplate || !isBlockBasedTheme && templateType !== "wp_template_part") return [];
				const isSiteEditor = (0, _wordpress_url.getPath)(window.location.href)?.includes("site-editor.php");
				const result = [];
				result.push(...orderedRecords.map((record) => {
					return {
						name: templateType + "-" + record.id,
						searchLabel: record.title?.rendered + " " + record.id,
						label: record.title?.rendered ? record.title?.rendered : (0, _wordpress_i18n.__)("(no title)"),
						icon: icons[templateType],
						category: "edit",
						callback: ({ close }) => {
							if (isSiteEditor) history.navigate(`/${templateType}/${record.id}?canvas=edit`);
							else document.location = (0, _wordpress_url.addQueryArgs)(getSiteEditorPage(), {
								p: `/${templateType}/${record.id}`,
								canvas: "edit"
							});
							close();
						}
					};
				}));
				if (orderedRecords?.length > 0 && templateType === "wp_template_part") result.push({
					name: "core/edit-site/open-template-parts",
					label: (0, _wordpress_i18n.__)("Go to: Template parts"),
					category: "view",
					callback: ({ close }) => {
						if (isSiteEditor) history.navigate(mapRoute("/pattern?postType=wp_template_part&categoryId=all-parts"));
						else document.location = (0, _wordpress_url.addQueryArgs)(getSiteEditorPage(), {
							p: mapRoute("/pattern"),
							postType: "wp_template_part",
							categoryId: "all-parts"
						});
						close();
					}
				});
				return result;
			}, [
				canCreateTemplate,
				isBlockBasedTheme,
				orderedRecords,
				history
			]),
			isLoading
		};
	};
	const getSiteEditorBasicNavigationCommands = () => function useSiteEditorBasicNavigationCommands() {
		const history = useHistory();
		const isSiteEditor = isInSiteEditor();
		const { isBlockBasedTheme, canCreateTemplate, canCreatePatterns } = (0, _wordpress_data.useSelect)((select) => {
			return {
				isBlockBasedTheme: select(_wordpress_core_data.store).getCurrentTheme()?.is_block_theme,
				canCreateTemplate: select(_wordpress_core_data.store).canUser("create", {
					kind: "postType",
					name: "wp_template"
				}),
				canCreatePatterns: select(_wordpress_core_data.store).canUser("create", {
					kind: "postType",
					name: "wp_block"
				})
			};
		}, []);
		return {
			commands: (0, _wordpress_element.useMemo)(() => {
				const result = [];
				if (canCreateTemplate && isBlockBasedTheme) {
					result.push({
						name: "core/edit-site/open-styles",
						label: (0, _wordpress_i18n.__)("Go to: Styles"),
						category: "view",
						callback: ({ close }) => {
							if (isSiteEditor) history.navigate("/styles");
							else document.location = (0, _wordpress_url.addQueryArgs)(getSiteEditorPage(), { p: "/styles" });
							close();
						}
					});
					result.push({
						name: "core/edit-site/open-navigation",
						label: (0, _wordpress_i18n.__)("Go to: Navigation"),
						category: "view",
						callback: ({ close }) => {
							if (isSiteEditor) history.navigate("/navigation");
							else document.location = (0, _wordpress_url.addQueryArgs)(getSiteEditorPage(), { p: "/navigation" });
							close();
						}
					});
					result.push({
						name: "core/edit-site/open-templates",
						label: (0, _wordpress_i18n.__)("Go to: Templates"),
						category: "view",
						callback: ({ close }) => {
							if (isSiteEditor) history.navigate(mapRoute("/template"));
							else document.location = (0, _wordpress_url.addQueryArgs)(getSiteEditorPage(), { p: mapRoute("/template") });
							close();
						}
					});
				}
				if (canCreatePatterns) result.push({
					name: "core/edit-site/open-patterns",
					label: (0, _wordpress_i18n.__)("Go to: Patterns"),
					category: "view",
					callback: ({ close }) => {
						if (canCreateTemplate) {
							if (isSiteEditor) history.navigate(mapRoute("/pattern"));
							else document.location = (0, _wordpress_url.addQueryArgs)(getSiteEditorPage(), { p: mapRoute("/pattern") });
							close();
						} else document.location.href = "edit.php?post_type=wp_block";
					}
				});
				return result;
			}, [
				history,
				isSiteEditor,
				canCreateTemplate,
				canCreatePatterns,
				isBlockBasedTheme
			]),
			isLoading: false
		};
	};
	const getGlobalStylesOpenCssCommands = () => function useGlobalStylesOpenCssCommands() {
		const history = useHistory();
		const isSiteEditor = isInSiteEditor();
		const { canEditCSS, isBlockBasedTheme } = (0, _wordpress_data.useSelect)((select) => {
			const { getEntityRecord, __experimentalGetCurrentGlobalStylesId, getCurrentTheme } = select(_wordpress_core_data.store);
			const globalStylesId = __experimentalGetCurrentGlobalStylesId();
			return {
				canEditCSS: !!(globalStylesId ? getEntityRecord("root", "globalStyles", globalStylesId) : void 0)?._links?.["wp:action-edit-css"],
				isBlockBasedTheme: getCurrentTheme()?.is_block_theme
			};
		}, []);
		return {
			isLoading: false,
			commands: (0, _wordpress_element.useMemo)(() => {
				if (!canEditCSS || !isBlockBasedTheme) return [];
				return [{
					name: "core/open-styles-css",
					label: (0, _wordpress_i18n.__)("Open custom CSS"),
					category: "view",
					callback: ({ close }) => {
						close();
						if (isSiteEditor) history.navigate("/styles?section=/css");
						else document.location = (0, _wordpress_url.addQueryArgs)(getSiteEditorPage(), {
							p: "/styles",
							section: "/css"
						});
					}
				}];
			}, [
				history,
				canEditCSS,
				isSiteEditor,
				isBlockBasedTheme
			])
		};
	};
	function useSiteEditorNavigationCommands(isNetworkAdmin) {
		(0, _wordpress_commands.useCommandLoader)({
			name: "core/edit-site/navigate-pages",
			hook: getNavigationCommandLoaderPerPostType("page"),
			disabled: isNetworkAdmin
		});
		(0, _wordpress_commands.useCommandLoader)({
			name: "core/edit-site/navigate-posts",
			hook: getNavigationCommandLoaderPerPostType("post"),
			disabled: isNetworkAdmin
		});
		(0, _wordpress_commands.useCommandLoader)({
			name: "core/edit-site/navigate-templates",
			hook: getNavigationCommandLoaderPerTemplate("wp_template"),
			disabled: isNetworkAdmin
		});
		(0, _wordpress_commands.useCommandLoader)({
			name: "core/edit-site/navigate-template-parts",
			hook: getNavigationCommandLoaderPerTemplate("wp_template_part"),
			disabled: isNetworkAdmin
		});
		(0, _wordpress_commands.useCommandLoader)({
			name: "core/edit-site/basic-navigation",
			hook: getSiteEditorBasicNavigationCommands(),
			context: "site-editor",
			disabled: isNetworkAdmin
		});
		(0, _wordpress_commands.useCommandLoader)({
			name: "core/edit-site/global-styles-css",
			hook: getGlobalStylesOpenCssCommands(),
			disabled: isNetworkAdmin
		});
	}

// packages/core-commands/build-module/private-apis.mjs
	function useCommands() {
		useAdminNavigationCommands();
		useSiteEditorNavigationCommands();
	}
	const privateApis = {};
	lock(privateApis, { useCommands });

// packages/core-commands/build-module/index.mjs
	const { RouterProvider } = unlock(_wordpress_router.privateApis);
	function CommandPalette({ settings }) {
		const { menu_commands: menuCommands, is_network_admin: isNetworkAdmin } = settings;
		useAdminNavigationCommands(menuCommands);
		useSiteEditorNavigationCommands(isNetworkAdmin);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RouterProvider, {
			pathArg: "p",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_commands.CommandMenu, {})
		});
	}
	/**
	* Initializes the Command Palette.
	*
	* @param settings Command palette settings.
	*/
	function initializeCommandPalette(settings) {
		const root = document.createElement("div");
		document.body.appendChild(root);
		(0, _wordpress_element.createRoot)(root).render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_element.StrictMode, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandPalette, { settings }) }));
	}

exports.initializeCommandPalette = initializeCommandPalette;
exports.privateApis = privateApis;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).coreCommands = exports;
return exports;
})({}, window.wp.element, window.wp.router, window.wp.commands, window.wp.i18n, window.wp.primitives, window.ReactJSXRuntime, window.wp.coreData, window.wp.data, window.wp.url, window.wp.compose, window.wp.htmlEntities, window.wp.privateApis);
//# sourceMappingURL=index.js.map