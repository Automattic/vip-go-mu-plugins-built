(function(exports, _wordpress_element, _wordpress_i18n, react_jsx_runtime) {

"use strict";
// packages/react-i18n/build-module/index.mjs
/**
	* Utility to make a new context value
	*
	* @param i18n
	*/
	function makeContextValue(i18n) {
		return {
			__: i18n.__.bind(i18n),
			_x: i18n._x.bind(i18n),
			_n: i18n._n.bind(i18n),
			_nx: i18n._nx.bind(i18n),
			isRTL: i18n.isRTL.bind(i18n),
			hasTranslation: i18n.hasTranslation.bind(i18n)
		};
	}
	const I18nContext = (0, _wordpress_element.createContext)(makeContextValue(_wordpress_i18n.defaultI18n));
	I18nContext.displayName = "I18nContext";
	/**
	* The `I18nProvider` should be mounted above any localized components:
	*
	* @example
	* ```js
	* import { createI18n } from '@wordpress/i18n';
	* import { I18nProvider } from '@wordpress/react-i18n';
	* const i18n = createI18n();
	*
	* ReactDom.render(
	* 	<I18nProvider i18n={ i18n }>
	* 		<App />
	* 	</I18nProvider>,
	* 	el
	* );
	* ```
	*
	* You can also instantiate the provider without the `i18n` prop. In that case it will use the
	* default `I18n` instance exported from `@wordpress/i18n`.
	*
	* @param props i18n provider props.
	* @return Children wrapped in the I18nProvider.
	*/
	function I18nProvider(props) {
		const { children, i18n = _wordpress_i18n.defaultI18n } = props;
		const [update, forceUpdate] = (0, _wordpress_element.useReducer)(() => [], []);
		(0, _wordpress_element.useEffect)(() => i18n.subscribe(forceUpdate), [i18n]);
		const value = (0, _wordpress_element.useMemo)(() => makeContextValue(i18n), [i18n, update]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(I18nContext.Provider, {
			value,
			children
		});
	}
	/**
	* React hook providing access to i18n functions. It exposes the `__`, `_x`, `_n`, `_nx`,
	* `isRTL` and `hasTranslation` functions from [`@wordpress/i18n`](../i18n).
	* Refer to their documentation there.
	*
	* @example
	* ```js
	* import { useI18n } from '@wordpress/react-i18n';
	*
	* function MyComponent() {
	* 	const { __ } = useI18n();
	* 	return __( 'Hello, world!' );
	* }
	* ```
	*/
	const useI18n = () => (0, _wordpress_element.useContext)(I18nContext);
	/**
	* React higher-order component that passes the i18n translate functions (the same set
	* as exposed by the `useI18n` hook) to the wrapped component as props.
	*
	* @example
	* ```js
	* import { withI18n } from '@wordpress/react-i18n';
	*
	* function MyComponent( { __ } ) {
	* 	return __( 'Hello, world!' );
	* }
	*
	* export default withI18n( MyComponent );
	* ```
	*
	* @param InnerComponent React component to be wrapped and receive the i18n functions like `__`
	* @return The wrapped component
	*/
	function withI18n(InnerComponent) {
		const EnhancedComponent = (props) => {
			const i18nProps = useI18n();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InnerComponent, {
				...props,
				...i18nProps
			});
		};
		EnhancedComponent.displayName = `WithI18n(${InnerComponent.displayName || InnerComponent.name || "Component"})`;
		return EnhancedComponent;
	}

exports.I18nProvider = I18nProvider;
exports.useI18n = useI18n;
exports.withI18n = withI18n;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).reactI18n = exports;
return exports;
})({}, window.wp.element, window.wp.i18n, window.ReactJSXRuntime);
//# sourceMappingURL=index.js.map