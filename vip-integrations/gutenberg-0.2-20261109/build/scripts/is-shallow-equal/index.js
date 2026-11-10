(function(exports) {

"use strict";
// packages/is-shallow-equal/build-module/objects.mjs
/**
	* Returns true if the two objects are shallow equal, or false otherwise.
	*
	* @param a First object to compare.
	* @param b Second object to compare.
	*
	* @return Whether the two objects are shallow equal.
	*/
	function isShallowEqualObjects(a, b) {
		if (a === b) return true;
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		if (aKeys.length !== bKeys.length) return false;
		let i = 0;
		while (i < aKeys.length) {
			const key = aKeys[i];
			const aValue = a[key];
			if (aValue === void 0 && !b.hasOwnProperty(key) || aValue !== b[key]) return false;
			i++;
		}
		return true;
	}

// packages/is-shallow-equal/build-module/arrays.mjs
/**
	* Returns true if the two arrays are shallow equal, or false otherwise.
	*
	* @param a First array to compare.
	* @param b Second array to compare.
	*
	* @return Whether the two arrays are shallow equal.
	*/
	function isShallowEqualArrays(a, b) {
		if (a === b) return true;
		if (a.length !== b.length) return false;
		for (let i = 0, len = a.length; i < len; i++) if (a[i] !== b[i]) return false;
		return true;
	}

// packages/is-shallow-equal/build-module/index.mjs
/**
	* Returns true if the two arrays or objects are shallow equal, or false
	* otherwise. Also handles primitive values, just in case.
	*
	* @param a First object or array to compare.
	* @param b Second object or array to compare.
	*
	* @return Whether the two values are shallow equal.
	*/
	function isShallowEqual(a, b) {
		if (a && b) {
			if (a.constructor === Object && b.constructor === Object) return isShallowEqualObjects(a, b);
			else if (Array.isArray(a) && Array.isArray(b)) return isShallowEqualArrays(a, b);
		}
		return a === b;
	}

exports.default = isShallowEqual;
exports.isShallowEqual = isShallowEqual;
exports.isShallowEqualArrays = isShallowEqualArrays;
exports.isShallowEqualObjects = isShallowEqualObjects;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).isShallowEqual = exports;
return exports;
})({});
//# sourceMappingURL=index.js.map