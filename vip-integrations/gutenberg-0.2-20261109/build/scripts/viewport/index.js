(function(exports, _wordpress_compose, _wordpress_data, _wordpress_element) {

"use strict";
// \0rolldown/runtime.js
	var __defProp = Object.defineProperty;
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) {
			__defProp(target, name, {
				get: all[name],
				enumerable: true
			});
		}
		if (!no_symbols) {
			__defProp(target, Symbol.toStringTag, { value: "Module" });
		}
		return target;
	};

// packages/viewport/build-module/store/reducer.mjs
/**
	* Reducer returning the viewport state, as keys of breakpoint queries with
	* boolean value representing whether query is matched.
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function reducer(state = {}, action) {
		switch (action.type) {
			case "SET_IS_MATCHING": return action.values;
		}
		return state;
	}

// packages/viewport/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({ setIsMatching: () => setIsMatching }, 1);
	/**
	* Returns an action object used in signalling that viewport queries have been
	* updated. Values are specified as an object of breakpoint query keys where
	* value represents whether query matches.
	* Ignored from documentation as it is for internal use only.
	*
	* @ignore
	*
	* @param values Breakpoint query matches.
	*
	* @return Action object.
	*/
	function setIsMatching(values) {
		return {
			type: "SET_IS_MATCHING",
			values
		};
	}

// packages/viewport/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({ isViewportMatch: () => isViewportMatch }, 1);
	/**
	* Returns true if the viewport matches the given query, or false otherwise.
	*
	* @param state Viewport state object.
	* @param query Query string. Includes operator and breakpoint name,
	*              space separated. Operator defaults to >=.
	*
	* @example
	*
	* ```js
	* import { store as viewportStore } from '@wordpress/viewport';
	* import { useSelect } from '@wordpress/data';
	* import { __ } from '@wordpress/i18n';
	* const ExampleComponent = () => {
	*     const isMobile = useSelect(
	*         ( select ) => select( viewportStore ).isViewportMatch( '< small' ),
	*         []
	*     );
	*
	*     return isMobile ? (
	*         <div>{ __( 'Mobile' ) }</div>
	*     ) : (
	*         <div>{ __( 'Not Mobile' ) }</div>
	*     );
	* };
	* ```
	*
	* @return Whether viewport matches query.
	*/
	function isViewportMatch(state, query) {
		if (query.indexOf(" ") === -1) query = ">= " + query;
		return !!state[query];
	}

// packages/viewport/build-module/store/index.mjs
/**
	* Store definition for the viewport namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*/
	const store = (0, _wordpress_data.createReduxStore)("core/viewport", {
		reducer,
		actions: actions_exports,
		selectors: selectors_exports
	});
	(0, _wordpress_data.register)(store);

// packages/viewport/build-module/listener.mjs
	const addDimensionsEventListener = (breakpoints, operators) => {
		/**
		* Callback invoked when media query state should be updated. Is invoked a
		* maximum of one time per call stack.
		*/
		const setIsMatching = (0, _wordpress_compose.debounce)(() => {
			const values = Object.fromEntries(queries.map(([key, query]) => [key, query.matches]));
			(0, _wordpress_data.dispatch)(store).setIsMatching(values);
		}, 0, { leading: true });
		/**
		* Hash of breakpoint names with generated MediaQueryList for corresponding
		* media query.
		*
		* @see https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
		* @see https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList
		*/
		const operatorEntries = Object.entries(operators);
		const queries = Object.entries(breakpoints).flatMap(([name, width]) => {
			return operatorEntries.map(([operator, condition]) => {
				const list = window.matchMedia(`screen and (${condition}: ${width}px)`);
				list.addEventListener("change", setIsMatching);
				return [`${operator} ${name}`, list];
			});
		});
		window.addEventListener("orientationchange", setIsMatching);
		setIsMatching();
		setIsMatching.flush();
	};

// packages/viewport/build-module/with-viewport-match.mjs
/**
	* Higher-order component creator, creating a new component which renders with
	* the given prop names, where the value passed to the underlying component is
	* the result of the query assigned as the object's value.
	*
	* @see isViewportMatch
	*
	* @param queries Object of prop name to viewport query.
	*
	* @example
	*
	* ```jsx
	* function MyComponent( { isMobile } ) {
	* 	return (
	* 		<div>Currently: { isMobile ? 'Mobile' : 'Not Mobile' }</div>
	* 	);
	* }
	*
	* MyComponent = withViewportMatch( { isMobile: '< small' } )( MyComponent );
	* ```
	*
	* @return Higher-order component.
	*/
	const withViewportMatch = (queries) => {
		const queryEntries = Object.entries(queries);
		const useViewPortQueriesResult = () => Object.fromEntries(queryEntries.map(([key, query]) => {
			let [operator, breakpointName] = query.split(" ");
			if (breakpointName === void 0) {
				breakpointName = operator;
				operator = ">=";
			}
			return [key, (0, _wordpress_compose.useViewportMatch)(breakpointName, operator)];
		}));
		return (0, _wordpress_compose.createHigherOrderComponent)((WrappedComponent) => {
			return function WithViewportMatch(props) {
				const queriesResult = useViewPortQueriesResult();
				return (0, _wordpress_element.createElement)(WrappedComponent, {
					...props,
					...queriesResult
				});
			};
		}, "withViewportMatch");
	};

// packages/viewport/build-module/if-viewport-matches.mjs
/**
	* Higher-order component creator, creating a new component which renders if
	* the viewport query is satisfied.
	*
	* @see withViewportMatches
	*
	* @param query Viewport query.
	*
	* @example
	*
	* ```jsx
	* function MyMobileComponent() {
	* 	return <div>I'm only rendered on mobile viewports!</div>;
	* }
	*
	* MyMobileComponent = ifViewportMatches( '< small' )( MyMobileComponent );
	* ```
	*
	* @return Higher-order component.
	*/
	const ifViewportMatches = (query) => (0, _wordpress_compose.createHigherOrderComponent)((0, _wordpress_compose.compose)([withViewportMatch({ isViewportMatch: query }), (0, _wordpress_compose.ifCondition)((props) => props.isViewportMatch)]), "ifViewportMatches");

// packages/viewport/build-module/index.mjs
	addDimensionsEventListener({
		huge: 1440,
		wide: 1280,
		large: 960,
		medium: 782,
		small: 600,
		mobile: 480
	}, {
		"<": "max-width",
		">=": "min-width"
	});

exports.ifViewportMatches = ifViewportMatches;
exports.store = store;
exports.withViewportMatch = withViewportMatch;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).viewport = exports;
return exports;
})({}, window.wp.compose, window.wp.data, window.wp.element);
//# sourceMappingURL=index.js.map