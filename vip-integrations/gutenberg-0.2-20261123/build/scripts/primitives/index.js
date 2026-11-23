(function(exports, _wordpress_element, react_jsx_runtime) {

"use strict";
// node_modules/.store/clsx@2.1.1-XOLP1vUL9vEGfpiXm37fAw/node_modules/clsx/dist/clsx.mjs
	function r(e) {
		var t, f, n = "";
		if ("string" == typeof e || "number" == typeof e) n += e;
		else if ("object" == typeof e) if (Array.isArray(e)) {
			var o = e.length;
			for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
		} else for (f in e) e[f] && (n && (n += " "), n += f);
		return n;
	}
	function clsx() {
		for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
		return n;
	}

// packages/primitives/build-module/svg/index.mjs
/**
	* @param {React.ComponentPropsWithoutRef<'circle'>} props
	*
	* @return {React.JSX.Element} Circle component
	*/
	const Circle = (props) => (0, _wordpress_element.createElement)("circle", props);
	/**
	* @param {React.ComponentPropsWithoutRef<'g'>} props
	*
	* @return {React.JSX.Element} G component
	*/
	const G = (props) => (0, _wordpress_element.createElement)("g", props);
	/**
	* @param {React.ComponentPropsWithoutRef<'line'>} props
	*
	* @return {React.JSX.Element} Path component
	*/
	const Line = (props) => (0, _wordpress_element.createElement)("line", props);
	/**
	* @param {React.ComponentPropsWithoutRef<'path'>} props
	*
	* @return {React.JSX.Element} Path component
	*/
	const Path = (props) => (0, _wordpress_element.createElement)("path", props);
	/**
	* @param {React.ComponentPropsWithoutRef<'polygon'>} props
	*
	* @return {React.JSX.Element} Polygon component
	*/
	const Polygon = (props) => (0, _wordpress_element.createElement)("polygon", props);
	/**
	* @param {React.ComponentPropsWithoutRef<'rect'>} props
	*
	* @return {React.JSX.Element} Rect component
	*/
	const Rect = (props) => (0, _wordpress_element.createElement)("rect", props);
	/**
	* @param {React.ComponentPropsWithoutRef<'defs'>} props
	*
	* @return {React.JSX.Element} Defs component
	*/
	const Defs = (props) => (0, _wordpress_element.createElement)("defs", props);
	/**
	* @param {React.ComponentPropsWithoutRef<'radialGradient'>} props
	*
	* @return {React.JSX.Element} RadialGradient component
	*/
	const RadialGradient = (props) => (0, _wordpress_element.createElement)("radialGradient", props);
	/**
	* @param {React.ComponentPropsWithoutRef<'linearGradient'>} props
	*
	* @return {React.JSX.Element} LinearGradient component
	*/
	const LinearGradient = (props) => (0, _wordpress_element.createElement)("linearGradient", props);
	/**
	* @param {React.ComponentPropsWithoutRef<'stop'>} props
	*
	* @return {React.JSX.Element} Stop component
	*/
	const Stop = (props) => (0, _wordpress_element.createElement)("stop", props);
	const SVG = (0, _wordpress_element.forwardRef)(
		/**
		* @param {SVGProps}                          props isPressed indicates whether the SVG should appear as pressed.
		*                                                  Other props will be passed through to svg component.
		* @param {React.ForwardedRef<SVGSVGElement>} ref   The forwarded ref to the SVG element.
		*
		* @return {React.JSX.Element} Stop component
		*/
		({ className, isPressed, ...props }, ref) => {
			const appliedProps = {
				...props,
				className: clsx(className, { "is-pressed": isPressed }) || void 0,
				"aria-hidden": true,
				focusable: false
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...appliedProps,
				ref
			});
		}
	);
	SVG.displayName = "SVG";

// packages/primitives/build-module/horizontal-rule/index.mjs
	const HorizontalRule = "hr";

// packages/primitives/build-module/block-quotation/index.mjs
	const BlockQuotation = "blockquote";

// packages/primitives/build-module/view/index.mjs
	const View = "div";

exports.BlockQuotation = BlockQuotation;
exports.Circle = Circle;
exports.Defs = Defs;
exports.G = G;
exports.HorizontalRule = HorizontalRule;
exports.Line = Line;
exports.LinearGradient = LinearGradient;
exports.Path = Path;
exports.Polygon = Polygon;
exports.RadialGradient = RadialGradient;
exports.Rect = Rect;
exports.SVG = SVG;
exports.Stop = Stop;
exports.View = View;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).primitives = exports;
return exports;
})({}, window.wp.element, window.ReactJSXRuntime);
//# sourceMappingURL=index.js.map