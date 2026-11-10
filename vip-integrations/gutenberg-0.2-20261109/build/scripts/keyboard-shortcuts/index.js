(function(exports, _wordpress_data, _wordpress_keycodes, _wordpress_element, react_jsx_runtime) {

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

// packages/keyboard-shortcuts/build-module/store/reducer.mjs
/**
	* Reducer returning the registered shortcuts
	*
	* @param state  Current state.
	* @param action Dispatched action.
	*
	* @return Updated state.
	*/
	function reducer(state = {}, action) {
		switch (action.type) {
			case "REGISTER_SHORTCUT": return {
				...state,
				[action.name]: {
					category: action.category,
					keyCombination: action.keyCombination,
					aliases: action.aliases,
					description: action.description
				}
			};
			case "UNREGISTER_SHORTCUT":
				const { [action.name]: actionName, ...remainingState } = state;
				return remainingState;
		}
		return state;
	}

// packages/keyboard-shortcuts/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		registerShortcut: () => registerShortcut,
		unregisterShortcut: () => unregisterShortcut
	}, 1);
	/**
	* Returns an action object used to register a new keyboard shortcut.
	*
	* @param {ShortcutConfig} config Shortcut config.
	*
	* @example
	*
	*```js
	* import { useEffect } from 'react';
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect, useDispatch } from '@wordpress/data';
	* import { __ } from '@wordpress/i18n';
	*
	* const ExampleComponent = () => {
	*     const { registerShortcut } = useDispatch( keyboardShortcutsStore );
	*
	*     useEffect( () => {
	*         registerShortcut( {
	*             name: 'custom/my-custom-shortcut',
	*             category: 'my-category',
	*             description: __( 'My custom shortcut' ),
	*             keyCombination: {
	*                 modifier: 'primary',
	*                 character: 'j',
	*             },
	*         } );
	*     }, [] );
	*
	*     const shortcut = useSelect(
	*         ( select ) =>
	*             select( keyboardShortcutsStore ).getShortcutKeyCombination(
	*                 'custom/my-custom-shortcut'
	*             ),
	*         []
	*     );
	*
	*     return shortcut ? (
	*         <p>{ __( 'Shortcut is registered.' ) }</p>
	*     ) : (
	*         <p>{ __( 'Shortcut is not registered.' ) }</p>
	*     );
	* };
	*```
	* @return {Object} action.
	*/
	function registerShortcut({ name, category, description, keyCombination, aliases }) {
		return {
			type: "REGISTER_SHORTCUT",
			name,
			category,
			keyCombination,
			aliases,
			description
		};
	}
	/**
	* Returns an action object used to unregister a keyboard shortcut.
	*
	* @param {string} name Shortcut name.
	*
	* @example
	*
	*```js
	* import { useEffect } from 'react';
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect, useDispatch } from '@wordpress/data';
	* import { __ } from '@wordpress/i18n';
	*
	* const ExampleComponent = () => {
	*     const { unregisterShortcut } = useDispatch( keyboardShortcutsStore );
	*
	*     useEffect( () => {
	*         unregisterShortcut( 'core/editor/next-region' );
	*     }, [] );
	*
	*     const shortcut = useSelect(
	*         ( select ) =>
	*             select( keyboardShortcutsStore ).getShortcutKeyCombination(
	*                 'core/editor/next-region'
	*             ),
	*         []
	*     );
	*
	*     return shortcut ? (
	*         <p>{ __( 'Shortcut is not unregistered.' ) }</p>
	*     ) : (
	*         <p>{ __( 'Shortcut is unregistered.' ) }</p>
	*     );
	* };
	*```
	* @return {Object} action.
	*/
	function unregisterShortcut(name) {
		return {
			type: "UNREGISTER_SHORTCUT",
			name
		};
	}

// packages/keyboard-shortcuts/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		getAllShortcutKeyCombinations: () => getAllShortcutKeyCombinations,
		getAllShortcutRawKeyCombinations: () => getAllShortcutRawKeyCombinations,
		getCategoryShortcuts: () => getCategoryShortcuts,
		getKeyboardShortcut: () => getKeyboardShortcut,
		getShortcutAliases: () => getShortcutAliases,
		getShortcutDescription: () => getShortcutDescription,
		getShortcutKeyCombination: () => getShortcutKeyCombination,
		getShortcutRepresentation: () => getShortcutRepresentation
	}, 1);
	/**
	* Shared reference to an empty array for cases where it is important to avoid
	* returning a new array reference on every invocation.
	*/
	const EMPTY_ARRAY = [];
	/**
	* Shortcut formatting methods.
	*/
	const FORMATTING_METHODS = {
		/**
		* Display formatting.
		*/
		display: _wordpress_keycodes.displayShortcut,
		/**
		* Raw shortcut formatting.
		*/
		raw: _wordpress_keycodes.rawShortcut,
		/**
		* ARIA label formatting.
		*/
		ariaLabel: _wordpress_keycodes.shortcutAriaLabel
	};
	/**
	* Returns a string representing the key combination.
	*
	* @param shortcut       Key combination.
	* @param representation Type of representation
	*                       (display, raw, ariaLabel).
	*
	* @return Shortcut representation.
	*/
	function getKeyCombinationRepresentation(shortcut, representation) {
		if (!shortcut) return null;
		return shortcut.modifier ? FORMATTING_METHODS[representation][shortcut.modifier](shortcut.character) : shortcut.character;
	}
	/**
	* Returns the main key combination for a given shortcut name.
	*
	* @param {Object} state Global state.
	* @param {string} name  Shortcut name.
	*
	* @example
	*
	*```js
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect } from '@wordpress/data';
	* import { createInterpolateElement } from '@wordpress/element';
	* import { sprintf } from '@wordpress/i18n';
	* const ExampleComponent = () => {
	*     const {character, modifier} = useSelect(
	*         ( select ) =>
	*             select( keyboardShortcutsStore ).getShortcutKeyCombination(
	*                 'core/editor/next-region'
	*             ),
	*         []
	*     );
	*
	*     return (
	*         <div>
	*             { createInterpolateElement(
	*                 sprintf(
	*                     'Character: <code>%s</code> / Modifier: <code>%s</code>',
	*                     character,
	*                     modifier
	*                 ),
	*                 {
	*                     code: <code />,
	*                 }
	*             ) }
	*         </div>
	*     );
	* };
	*```
	*
	* @return {ShortcutKeyCombination?} Key combination.
	*/
	function getShortcutKeyCombination(state, name) {
		return state[name] ? state[name].keyCombination : null;
	}
	/**
	* Returns a string representing the main key combination for a given shortcut name.
	*
	* @param {Object}                   state          Global state.
	* @param {string}                   name           Shortcut name.
	* @param {keyof FORMATTING_METHODS} representation Type of representation
	*                                                  (display, raw, ariaLabel).
	* @example
	*
	*```js
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect } from '@wordpress/data';
	* import { sprintf } from '@wordpress/i18n';
	*
	* const ExampleComponent = () => {
	*     const {display, raw, ariaLabel} = useSelect(
	*         ( select ) =>{
	*             return {
	*                 display: select( keyboardShortcutsStore ).getShortcutRepresentation('core/editor/next-region' ),
	*                 raw: select( keyboardShortcutsStore ).getShortcutRepresentation('core/editor/next-region','raw' ),
	*                 ariaLabel: select( keyboardShortcutsStore ).getShortcutRepresentation('core/editor/next-region', 'ariaLabel')
	*             }
	*         },
	*         []
	*     );
	*
	*     return (
	*         <ul>
	*             <li>{ sprintf( 'display string: %s', display ) }</li>
	*             <li>{ sprintf( 'raw string: %s', raw ) }</li>
	*             <li>{ sprintf( 'ariaLabel string: %s', ariaLabel ) }</li>
	*         </ul>
	*     );
	* };
	*```
	*
	* @return {?string} Shortcut representation.
	*/
	function getShortcutRepresentation(state, name, representation = "display") {
		return getKeyCombinationRepresentation(getShortcutKeyCombination(state, name), representation);
	}
	/**
	* Returns the three values used to display and describe the main key
	* combination of a registered shortcut: its display string, its
	* `aria-keyshortcuts` value and its plain-text label. Returns `null` when no
	* shortcut is registered under the name.
	*
	* The raw representation and aliases are not included; use
	* `getShortcutRepresentation` and `getShortcutAliases` for those.
	*
	* The returned object can be passed to the `shortcut` prop of the
	* `@wordpress/ui` components.
	*
	* @param {Object} state Global state.
	* @param {string} name  Shortcut name.
	*
	* @example
	*
	*```js
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect } from '@wordpress/data';
	* import { Menu } from '@wordpress/ui';
	*
	* const ExampleComponent = () => {
	*     const shortcut = useSelect(
	*         ( select ) =>
	*             select( keyboardShortcutsStore ).getKeyboardShortcut(
	*                 'core/editor/next-region'
	*             ),
	*         []
	*     );
	*
	*     return (
	*         <Menu.Item shortcut={ shortcut ?? undefined }>
	*             <Menu.ItemLabel>Next region</Menu.ItemLabel>
	*         </Menu.Item>
	*     );
	* };
	*```
	*
	* @return {WPKeyboardShortcut?} Shortcut display values.
	*/
	const getKeyboardShortcut = (0, _wordpress_data.createSelector)((state, name) => {
		const combination = getShortcutKeyCombination(state, name);
		if (!combination) return null;
		return _wordpress_keycodes.keyboardShortcut[combination.modifier ?? "undefined"](combination.character);
	}, (state, name) => [state[name]]);
	/**
	* Returns the shortcut description given its name.
	*
	* @param {Object} state Global state.
	* @param {string} name  Shortcut name.
	*
	* @example
	*
	*```js
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect } from '@wordpress/data';
	* import { __ } from '@wordpress/i18n';
	* const ExampleComponent = () => {
	*     const shortcutDescription = useSelect(
	*         ( select ) =>
	*             select( keyboardShortcutsStore ).getShortcutDescription( 'core/editor/next-region' ),
	*         []
	*     );
	*
	*     return shortcutDescription ? (
	*         <div>{ shortcutDescription }</div>
	*     ) : (
	*         <div>{ __( 'No description.' ) }</div>
	*     );
	* };
	*```
	* @return {?string} Shortcut description.
	*/
	function getShortcutDescription(state, name) {
		return state[name] ? state[name].description : null;
	}
	/**
	* Returns the aliases for a given shortcut name.
	*
	* @param {Object} state Global state.
	* @param {string} name  Shortcut name.
	* @example
	*
	*```js
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect } from '@wordpress/data';
	* import { createInterpolateElement } from '@wordpress/element';
	* import { sprintf } from '@wordpress/i18n';
	* const ExampleComponent = () => {
	*     const shortcutAliases = useSelect(
	*         ( select ) =>
	*             select( keyboardShortcutsStore ).getShortcutAliases(
	*                 'core/editor/next-region'
	*             ),
	*         []
	*     );
	*
	*     return (
	*         shortcutAliases.length > 0 && (
	*             <ul>
	*                 { shortcutAliases.map( ( { character, modifier }, index ) => (
	*                     <li key={ index }>
	*                         { createInterpolateElement(
	*                             sprintf(
	*                                 'Character: <code>%s</code> / Modifier: <code>%s</code>',
	*                                 character,
	*                                 modifier
	*                             ),
	*                             {
	*                                 code: <code />,
	*                             }
	*                         ) }
	*                     </li>
	*                 ) ) }
	*             </ul>
	*         )
	*     );
	* };
	*```
	*
	* @return {ShortcutKeyCombination[]} Key combinations.
	*/
	function getShortcutAliases(state, name) {
		return state[name] && state[name].aliases ? state[name].aliases : EMPTY_ARRAY;
	}
	/**
	* Returns the shortcuts that include aliases for a given shortcut name.
	*
	* @param {Object} state Global state.
	* @param {string} name  Shortcut name.
	* @example
	*
	*```js
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect } from '@wordpress/data';
	* import { createInterpolateElement } from '@wordpress/element';
	* import { sprintf } from '@wordpress/i18n';
	*
	* const ExampleComponent = () => {
	*     const allShortcutKeyCombinations = useSelect(
	*         ( select ) =>
	*             select( keyboardShortcutsStore ).getAllShortcutKeyCombinations(
	*                 'core/editor/next-region'
	*             ),
	*         []
	*     );
	*
	*     return (
	*         allShortcutKeyCombinations.length > 0 && (
	*             <ul>
	*                 { allShortcutKeyCombinations.map(
	*                     ( { character, modifier }, index ) => (
	*                         <li key={ index }>
	*                             { createInterpolateElement(
	*                                 sprintf(
	*                                     'Character: <code>%s</code> / Modifier: <code>%s</code>',
	*                                     character,
	*                                     modifier
	*                                 ),
	*                                 {
	*                                     code: <code />,
	*                                 }
	*                             ) }
	*                         </li>
	*                     )
	*                 ) }
	*             </ul>
	*         )
	*     );
	* };
	*```
	*
	* @return {ShortcutKeyCombination[]} Key combinations.
	*/
	const getAllShortcutKeyCombinations = (0, _wordpress_data.createSelector)((state, name) => {
		return [getShortcutKeyCombination(state, name), ...getShortcutAliases(state, name)].filter((combination) => !!combination);
	}, (state, name) => [state[name]]);
	/**
	* Returns the raw representation of all the keyboard combinations of a given shortcut name.
	*
	* @param {Object} state Global state.
	* @param {string} name  Shortcut name.
	*
	* @example
	*
	*```js
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect } from '@wordpress/data';
	* import { createInterpolateElement } from '@wordpress/element';
	* import { sprintf } from '@wordpress/i18n';
	*
	* const ExampleComponent = () => {
	*     const allShortcutRawKeyCombinations = useSelect(
	*         ( select ) =>
	*             select( keyboardShortcutsStore ).getAllShortcutRawKeyCombinations(
	*                 'core/editor/next-region'
	*             ),
	*         []
	*     );
	*
	*     return (
	*         allShortcutRawKeyCombinations.length > 0 && (
	*             <ul>
	*                 { allShortcutRawKeyCombinations.map(
	*                     ( shortcutRawKeyCombination, index ) => (
	*                         <li key={ index }>
	*                             { createInterpolateElement(
	*                                 sprintf(
	*                                     ' <code>%s</code>',
	*                                     shortcutRawKeyCombination
	*                                 ),
	*                                 {
	*                                     code: <code />,
	*                                 }
	*                             ) }
	*                         </li>
	*                     )
	*                 ) }
	*             </ul>
	*         )
	*     );
	* };
	*```
	*
	* @return {string[]} Shortcuts.
	*/
	const getAllShortcutRawKeyCombinations = (0, _wordpress_data.createSelector)((state, name) => {
		return getAllShortcutKeyCombinations(state, name).map((combination) => getKeyCombinationRepresentation(combination, "raw"));
	}, (state, name) => [state[name]]);
	/**
	* Returns the shortcut names list for a given category name.
	*
	* @param {Object} state Global state.
	* @param {string} name  Category name.
	* @example
	*
	*```js
	* import { store as keyboardShortcutsStore } from '@wordpress/keyboard-shortcuts';
	* import { useSelect } from '@wordpress/data';
	*
	* const ExampleComponent = () => {
	*     const categoryShortcuts = useSelect(
	*         ( select ) =>
	*             select( keyboardShortcutsStore ).getCategoryShortcuts(
	*                 'block'
	*             ),
	*         []
	*     );
	*
	*     return (
	*         categoryShortcuts.length > 0 && (
	*             <ul>
	*                 { categoryShortcuts.map( ( categoryShortcut ) => (
	*                     <li key={ categoryShortcut }>{ categoryShortcut }</li>
	*                 ) ) }
	*             </ul>
	*         )
	*     );
	* };
	*```
	* @return {string[]} Shortcut names.
	*/
	const getCategoryShortcuts = (0, _wordpress_data.createSelector)((state, categoryName) => {
		return Object.entries(state).filter(([, shortcut]) => shortcut.category === categoryName).map(([name]) => name);
	}, (state) => [state]);

// packages/keyboard-shortcuts/build-module/store/index.mjs
/**
	* Store definition for the keyboard shortcuts namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*/
	const store = (0, _wordpress_data.createReduxStore)("core/keyboard-shortcuts", {
		reducer,
		actions: actions_exports,
		selectors: selectors_exports
	});
	(0, _wordpress_data.register)(store);

// packages/keyboard-shortcuts/build-module/hooks/use-shortcut-event-match.mjs
/**
	* Returns a function to check if a keyboard event matches a shortcut name.
	*
	* @return A function to check if a keyboard event matches a
	*         predefined shortcut combination.
	*/
	function useShortcutEventMatch() {
		const { getAllShortcutKeyCombinations } = (0, _wordpress_data.useSelect)(store);
		/**
		* A function to check if a keyboard event matches a predefined shortcut
		* combination.
		*
		* @param name  Shortcut name.
		* @param event Event to check.
		*
		* @return True if the event matches the shortcuts, false if not.
		*/
		return (0, _wordpress_element.useCallback)((name, event) => {
			return getAllShortcutKeyCombinations(name).some((combination) => {
				if (!combination) return false;
				return _wordpress_keycodes.isKeyboardEvent[combination.modifier ?? "undefined"](event, combination.character);
			});
		}, [getAllShortcutKeyCombinations]);
	}

// packages/keyboard-shortcuts/build-module/context.mjs
	const globalShortcuts = /* @__PURE__ */ new Set();
	const globalListener = (event) => {
		for (const keyboardShortcut of globalShortcuts) keyboardShortcut(event);
	};
	const context = (0, _wordpress_element.createContext)({
		add: (shortcut) => {
			if (globalShortcuts.size === 0) document.addEventListener("keydown", globalListener);
			globalShortcuts.add(shortcut);
		},
		delete: (shortcut) => {
			globalShortcuts.delete(shortcut);
			if (globalShortcuts.size === 0) document.removeEventListener("keydown", globalListener);
		}
	});
	context.displayName = "KeyboardShortcutsContext";

// packages/keyboard-shortcuts/build-module/hooks/use-shortcut.mjs
/**
	* Attach a keyboard shortcut handler.
	*
	* @param name               Shortcut name.
	* @param callback           Shortcut callback.
	* @param options            Shortcut options.
	* @param options.isDisabled Whether to disable the shortcut.
	*/
	function useShortcut(name, callback, { isDisabled = false } = {}) {
		const shortcuts = (0, _wordpress_element.useContext)(context);
		const isMatch = useShortcutEventMatch();
		const callbackRef = (0, _wordpress_element.useRef)(void 0);
		(0, _wordpress_element.useEffect)(() => {
			callbackRef.current = callback;
		}, [callback]);
		(0, _wordpress_element.useEffect)(() => {
			if (isDisabled) return;
			function _callback(event) {
				if (isMatch(name, event) && callbackRef.current) callbackRef.current(event);
			}
			shortcuts.add(_callback);
			return () => {
				shortcuts.delete(_callback);
			};
		}, [
			name,
			isDisabled,
			shortcuts,
			isMatch
		]);
	}

// packages/keyboard-shortcuts/build-module/components/shortcut-provider.mjs
	const { Provider } = context;
	/**
	* Handles callbacks added to context by `useShortcut`.
	* Adding a provider allows to register contextual shortcuts
	* that are only active when a certain part of the UI is focused.
	*
	* @param props Props to pass to `div`.
	*
	* @return Component.
	*/
	function ShortcutProvider(props) {
		const [keyboardShortcuts] = (0, _wordpress_element.useState)(() => /* @__PURE__ */ new Set());
		function onKeyDown(event) {
			if (props.onKeyDown) props.onKeyDown(event);
			const nativeEvent = event.nativeEvent;
			for (const keyboardShortcut of keyboardShortcuts) keyboardShortcut(nativeEvent);
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Provider, {
			value: keyboardShortcuts,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				...props,
				onKeyDown
			})
		});
	}

exports.ShortcutProvider = ShortcutProvider;
exports.__unstableUseShortcutEventMatch = useShortcutEventMatch;
exports.store = store;
exports.useShortcut = useShortcut;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).keyboardShortcuts = exports;
return exports;
})({}, window.wp.data, window.wp.keycodes, window.wp.element, window.ReactJSXRuntime);
//# sourceMappingURL=index.js.map