(function(exports, _wordpress_deprecated, _wordpress_private_apis, _wordpress_element, _wordpress_compose, react_jsx_runtime) {

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

_wordpress_deprecated = __toESM(_wordpress_deprecated, 1);

// packages/theme/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/theme");

// packages/theme/build-module/context.mjs
	const ThemeContext = (0, _wordpress_element.createContext)({ resolvedSettings: {
		color: {},
		cursor: void 0,
		cornerRadius: void 0
	} });

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/multiply-matrices.js
/**
	* Returns the dot product of two vectors each with a length of 3.
	*
	* @param {Vector3} a
	* @param {Vector3} b
	* @returns {number}
	*/
	function dot3(a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}
	/**
	* Transforms a vector of length 3 by a 3x3 matrix. Specify the same input and output
	* vector to transform in place.
	*
	* @param {Vector3} input
	* @param {Matrix3x3} matrix
	* @param {Vector3} [out]
	* @returns {Vector3}
	*/
	function multiply_v3_m3x3(input, matrix, out = [
		0,
		0,
		0
	]) {
		const x = dot3(input, matrix[0]);
		const y = dot3(input, matrix[1]);
		const z = dot3(input, matrix[2]);
		out[0] = x;
		out[1] = y;
		out[2] = z;
		return out;
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/util.js
/**
	* Check if a value is a string (including a String object)
	* @param {any} str - Value to check
	* @returns {str is string}
	*/
	function isString(str) {
		return type(str) === "string";
	}
	/**
	* Determine the internal JavaScript [[Class]] of an object.
	* @param {any} o - Value to check
	* @returns {string}
	*/
	function type(o) {
		return (Object.prototype.toString.call(o).match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
	}
	/**
	* @param {number} n
	* @param {{ precision?: number | undefined, unit?: string | undefined }} options
	* @returns {string}
	*/
	function serializeNumber(n, { precision = 16, unit }) {
		if (isNone(n)) return "none";
		n = +toPrecision(n, precision);
		return n + (unit ?? "");
	}
	/**
	* Check if a value corresponds to a none argument
	* @param {any} n - Value to check
	* @returns {n is null}
	*/
	function isNone(n) {
		return n === null;
	}
	/**
	* Round a number to a certain number of significant digits
	* @param {number} n - The number to round
	* @param {number} precision - Number of significant digits
	*/
	function toPrecision(n, precision) {
		if (n === 0) return 0;
		let integer = ~~n;
		let digits = 0;
		if (integer && precision) digits = ~~Math.log10(Math.abs(integer)) + 1;
		const multiplier = 10 ** (precision - digits);
		return Math.floor(n * multiplier + .5) / multiplier;
	}
	/**
	* Interpolate between two values, either of which may be a `none` value.
	* A `none` endpoint is treated as having the other endpoint's value;
	* if both are `none`, the result is `none` as well.
	* @param {number | null} start
	* @param {number | null} end
	* @param {number} p
	* @returns {number | null}
	*/
	function interpolate(start, end, p) {
		if (isNone(start) || isNaN(start)) return end;
		if (isNone(end) || isNaN(end)) return start;
		return start + (end - start) * p;
	}
	/**
	* @param {number} start
	* @param {number} end
	* @param {number} value
	*/
	function interpolateInv(start, end, value) {
		return (value - start) / (end - start);
	}
	/**
	* @param {[number, number]} from
	* @param {[number, number]} to
	* @param {number} value
	*/
	function mapRange(from, to, value) {
		if (!from || !to || from === to || from[0] === to[0] && from[1] === to[1] || isNaN(value) || value === null) return value;
		return interpolate(to[0], to[1], interpolateInv(from[0], from[1], value));
	}
	/**
	* Clamp value between the minimum and maximum
	* @param {number} min minimum value to return
	* @param {number} val the value to return if it is between min and max
	* @param {number} max maximum value to return
	*/
	function clamp(min, val, max) {
		return Math.max(Math.min(max, val), min);
	}
	/**
	* Copy sign of one value to another.
	* @param {number} to - Number to copy sign to
	* @param {number} from - Number to copy sign from
	*/
	function copySign(to, from) {
		return Math.sign(to) === Math.sign(from) ? to : -to;
	}
	/**
	* Perform pow on a signed number and copy sign to result
	* @param {number} base The base number
	* @param {number} exp The exponent
	*/
	function spow(base, exp) {
		return copySign(Math.abs(base) ** exp, base);
	}
	/**
	* Perform a divide, but return zero if the denominator is zero
	* @param {number} n The numerator
	* @param {number} d The denominator
	*/
	function zdiv(n, d) {
		return d === 0 ? 0 : n / d;
	}
	/**
	* Perform a bisect on a sorted list and locate the insertion point for
	* a value in arr to maintain sorted order.
	* @param {number[]} arr - array of sorted numbers
	* @param {number} value - value to find insertion point for
	* @param {number} lo - used to specify a the low end of a subset of the list
	* @param {number} hi - used to specify a the high end of a subset of the list
	*/
	function bisectLeft(arr, value, lo = 0, hi = arr.length) {
		while (lo < hi) {
			const mid = lo + hi >> 1;
			if (arr[mid] < value) lo = mid + 1;
			else hi = mid;
		}
		return lo;
	}
	/**
	* Determines whether an argument is an instance of a constructor, including subclasses.
	* This is done by first just checking `instanceof`,
	* and then comparing the string names of the constructors if that fails.
	* @param {any} arg
	* @param {C} constructor
	* @template {new (...args: any) => any} C
	* @returns {arg is InstanceType<C>}
	*/
	function isInstance(arg, constructor) {
		if (arg instanceof constructor) return true;
		const targetName = constructor.name;
		while (arg) {
			const proto = Object.getPrototypeOf(arg);
			const constructorName = proto?.constructor?.name;
			if (constructorName === targetName) return true;
			if (!constructorName || constructorName === "Object") return false;
			arg = proto;
		}
		return false;
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/Type.js
	var Type = class {
		type;
		coordMeta;
		coordRange;
		/** @type {[number, number]} */
		range;
		/**
		* @param {any} type
		* @param {import("./types.js").CoordMeta} coordMeta
		*/
		constructor(type, coordMeta) {
			if (typeof type === "object") this.coordMeta = type;
			if (coordMeta) {
				this.coordMeta = coordMeta;
				this.coordRange = coordMeta.range ?? coordMeta.refRange;
			}
			if (typeof type === "string") {
				let params = type.trim().match(/^(?<type><[a-z]+>)(\[(?<min>-?[.\d]+),\s*(?<max>-?[.\d]+)\])?$/);
				if (!params) throw new TypeError(`Cannot parse ${type} as a type definition.`);
				this.type = params.groups.type;
				let { min, max } = params.groups;
				if (min || max) this.range = [+min, +max];
			}
		}
		/** @returns {[number, number]} */
		get computedRange() {
			if (this.range) return this.range;
			if (this.type === "<percentage>") return this.percentageRange();
			else if (this.type === "<angle>") return [0, 360];
			return null;
		}
		get unit() {
			if (this.type === "<percentage>") return "%";
			else if (this.type === "<angle>") return "deg";
			return "";
		}
		/**
		* Map a number to the internal representation
		* @param {number} number
		*/
		resolve(number) {
			if (this.type === "<angle>") return number;
			let fromRange = this.computedRange;
			let toRange = this.coordRange;
			if (this.type === "<percentage>") toRange ??= this.percentageRange();
			return mapRange(fromRange, toRange, number);
		}
		/**
		* Serialize a number from the internal representation to a string
		* @param {number} number
		* @param {number} [precision]
		*/
		serialize(number, precision) {
			let toRange = this.type === "<percentage>" ? this.percentageRange(100) : this.computedRange;
			let unit = this.unit;
			number = mapRange(this.coordRange, toRange, number);
			return serializeNumber(number, {
				unit,
				precision
			});
		}
		toString() {
			let ret = this.type;
			if (this.range) {
				let [min = "", max = ""] = this.range;
				ret += `[${min},${max}]`;
			}
			return ret;
		}
		/**
		* Returns a percentage range for values of this type
		* @param {number} scale
		* @returns {[number, number]}
		*/
		percentageRange(scale = 1) {
			let range;
			if (this.coordMeta && this.coordMeta.range || this.coordRange && this.coordRange[0] >= 0) range = [0, 1];
			else range = [-1, 1];
			return [range[0] * scale, range[1] * scale];
		}
		static get(type, coordMeta) {
			if (isInstance(type, this)) return type;
			return new this(type, coordMeta);
		}
	};

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/Format.js
/** @import { ColorSpace, Coords } from "./types.js" */
	/** @typedef {import("./types.js").Format} FormatInterface */
	/**
	* @internal
	* Used to index {@link FormatInterface Format} objects and store an instance.
	* Not meant for external use
	*/
	const instance = Symbol("instance");
	/**
	* Remove the first element of an array type
	* @template {any[]} T
	* @typedef {T extends [any, ...infer R] ? R : T[number][]} RemoveFirstElement
	*/
	/**
	* @class Format
	* @implements {Omit<FormatInterface, "coords" | "serializeCoords">}
	* Class to hold a color serialization format
	*/
	var Format = class Format {
		type;
		name;
		spaceCoords;
		/** @type {Type[][]} */
		coords;
		/** @type {string | undefined} */
		id;
		/** @type {boolean | undefined} */
		alpha;
		/**
		* @param {FormatInterface} format
		* @param {ColorSpace} space
		*/
		constructor(format, space = format.space) {
			format[instance] = this;
			this.type = "function";
			this.name = "color";
			Object.assign(this, format);
			this.space = space;
			if (this.type === "custom") return;
			this.spaceCoords = Object.values(space.coords);
			if (!this.coords) this.coords = this.spaceCoords.map((coordMeta) => {
				let ret = ["<number>", "<percentage>"];
				if (coordMeta.type === "angle") ret.push("<angle>");
				return ret;
			});
			this.coords = this.coords.map(
				/** @param {string | string[] | Type[]} types */
				(types, i) => {
					let coordMeta = this.spaceCoords[i];
					if (typeof types === "string") types = types.trim().split(/\s*\|\s*/);
					return types.map((type) => Type.get(type, coordMeta));
				}
			);
		}
		/**
		* @param {Coords} coords
		* @param {number} precision
		* @param {Type[]} types
		*/
		serializeCoords(coords, precision, types) {
			types = coords.map((_, i) => Type.get(types?.[i] ?? this.coords[i][0], this.spaceCoords[i]));
			return coords.map((c, i) => types[i].serialize(c, precision));
		}
		/**
		* Validates the coordinates of a color against a format's coord grammar and
		* maps the coordinates to the range or refRange of the coordinates.
		* @param {Coords} coords
		* @param {[string, string, string]} types
		*/
		coerceCoords(coords, types) {
			return Object.entries(this.space.coords).map(([id, coordMeta], i) => {
				let arg = coords[i];
				if (isNone(arg) || isNaN(arg)) return arg;
				let providedType = types[i];
				let type = this.coords[i].find((c) => c.type == providedType);
				if (!type) {
					let coordName = coordMeta.name || id;
					throw new TypeError(`${providedType ?? arg?.raw ?? arg} not allowed for ${coordName} in ${this.name}()`);
				}
				arg = type.resolve(arg);
				if (type.range) types[i] = type.toString();
				return arg;
			});
		}
		/**
		* @returns {boolean | Required<FormatInterface>["serialize"]}
		*/
		canSerialize() {
			return this.type === "function" || this.serialize;
		}
		/**
		* @param {string} str
		* @returns {(import("./types.js").ColorConstructor) | undefined | null}
		*/
		parse(str) {
			return null;
		}
		/**
		* @param {Format | FormatInterface} format
		* @param {RemoveFirstElement<ConstructorParameters<typeof Format>>} args
		* @returns {Format}
		*/
		static get(format, ...args) {
			if (!format || isInstance(format, this)) return format;
			if (format[instance]) return format[instance];
			return new Format(format, ...args);
		}
	};

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/hooks.js
/**
	* A class for adding deep extensibility to any piece of JS code
	*/
	var Hooks = class {
		add(name, callback, first) {
			if (typeof arguments[0] != "string") {
				for (var name in arguments[0]) this.add(name, arguments[0][name], arguments[1]);
				return;
			}
			(Array.isArray(name) ? name : [name]).forEach(function(name) {
				this[name] = this[name] || [];
				if (callback) this[name][first ? "unshift" : "push"](callback);
			}, this);
		}
		run(name, env) {
			this[name] = this[name] || [];
			this[name].forEach(function(callback) {
				callback.call(env && env.context ? env.context : env, env);
			});
		}
	};
	/**
	* The instance of {@link Hooks} used throughout Color.js
	*/
	const hooks = new Hooks();

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/adapt.js
/** @typedef {import("./types.js").White} White */
	/** @type {Record<string, White>} */
	const WHITES = {
		D50: [
			.3457 / .3585,
			1,
			.2958 / .3585
		],
		D65: [
			.3127 / .329,
			1,
			.3583 / .329
		]
	};
	/**
	*
	* @param {string | White} name
	* @returns {White}
	*/
	function getWhite(name) {
		if (Array.isArray(name)) return name;
		return WHITES[name];
	}
	/**
	* Adapt XYZ from white point W1 to W2
	* @param {White | string} W1
	* @param {White | string} W2
	* @param {[number, number, number]} XYZ
	* @param {{ method?: string | undefined }} options
	* @returns {[number, number, number]}
	*/
	function adapt$1(W1, W2, XYZ, options = {}) {
		W1 = getWhite(W1);
		W2 = getWhite(W2);
		if (!W1 || !W2) throw new TypeError(`Missing white point to convert ${!W1 ? "from" : ""}${!W1 && !W2 ? "/" : ""}${!W2 ? "to" : ""}`);
		if (W1 === W2) return XYZ;
		let env = {
			W1,
			W2,
			XYZ,
			options
		};
		hooks.run("chromatic-adaptation-start", env);
		if (!env.M) {
			if (env.W1 === WHITES.D65 && env.W2 === WHITES.D50) env.M = [
				[
					1.0479297925449969,
					.022946870601609652,
					-.05019226628920524
				],
				[
					.02962780877005599,
					.9904344267538799,
					-.017073799063418826
				],
				[
					-.009243040646204504,
					.015055191490298152,
					.7518742814281371
				]
			];
			else if (env.W1 === WHITES.D50 && env.W2 === WHITES.D65) env.M = [
				[
					.955473421488075,
					-.02309845494876471,
					.06325924320057072
				],
				[
					-.0283697093338637,
					1.0099953980813041,
					.021041441191917323
				],
				[
					.012314014864481998,
					-.020507649298898964,
					1.330365926242124
				]
			];
		}
		hooks.run("chromatic-adaptation-end", env);
		if (env.M) return multiply_v3_m3x3(env.XYZ, env.M);
		else throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/defaults.js
	var defaults_default = {
		gamut_mapping: "css",
		precision: 5,
		deltaE: "76",
		verbose: globalThis?.process?.env?.NODE_ENV?.toLowerCase() !== "test",
		warn: function warn(msg) {
			if (this.verbose) globalThis?.console?.warn?.(msg);
		}
	};

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/parse.js
/** @import { ColorConstructor } from "./types.js" */
	/** @typedef {import("./types.js").ArgumentMeta} ArgumentMeta */
	/** @typedef {import("./types.js").ParseFunctionReturn} ParseFunctionReturn */
	/** @typedef {import("./types.js").ParseOptions} ParseOptions */
	/**
	* Convert a CSS Color string to a color object
	* @param {string} str
	* @param {ParseOptions} [options]
	* @returns {ColorConstructor}
	*/
	function parse(str, options) {
		let env = {
			str: String(str)?.trim(),
			options
		};
		hooks.run("parse-start", env);
		if (env.color) return env.color;
		env.parsed = parseFunction(env.str);
		let ret;
		let meta = env.options ? env.options.parseMeta ?? env.options.meta : null;
		if (env.parsed) {
			let name = env.parsed.name;
			let format;
			let space;
			let coords = env.parsed.args;
			let types = coords.map((c, i) => env.parsed.argMeta[i]?.type);
			if (name === "color") {
				let id = coords.shift();
				types.shift();
				let alternateId = id.startsWith("--") ? id.substring(2) : `--${id}`;
				let ids = [id, alternateId];
				format = ColorSpace.findFormat({
					name,
					id: ids,
					type: "function"
				});
				if (!format) {
					let didYouMean;
					let registryId = id in ColorSpace.registry ? id : alternateId;
					if (registryId in ColorSpace.registry) {
						let cssId = ColorSpace.registry[registryId].formats?.color?.id;
						if (cssId) didYouMean = `Did you mean ${str.replace("color(" + id, "color(" + cssId)}?`;
					}
					throw new TypeError(`Cannot parse ${env.str}. ` + (didYouMean ?? "Missing a plugin?"));
				}
				space = format.space;
				if (format.id.startsWith("--") && !id.startsWith("--")) defaults_default.warn(`${space.name} is a non-standard space and not currently supported in the CSS spec. Use prefixed color(${format.id}) instead of color(${id}).`);
				if (id.startsWith("--") && !format.id.startsWith("--")) defaults_default.warn(`${space.name} is a standard space and supported in the CSS spec. Use color(${format.id}) instead of prefixed color(${id}).`);
			} else {
				format = ColorSpace.findFormat({
					name,
					type: "function"
				});
				space = format.space;
			}
			if (meta) Object.assign(meta, {
				format,
				formatId: format.name,
				types,
				commas: env.parsed.commas
			});
			let alpha = 1;
			if (env.parsed.lastAlpha) {
				alpha = env.parsed.args.pop();
				if (meta) meta.alphaType = types.pop();
			}
			let coordCount = format.coords.length;
			if (coords.length !== coordCount) throw new TypeError(`Expected ${coordCount} coordinates for ${space.id} in ${env.str}), got ${coords.length}`);
			coords = format.coerceCoords(coords, types);
			ret = {
				spaceId: space.id,
				coords,
				alpha
			};
		} else spaceloop: for (let space of ColorSpace.all) for (let formatId in space.formats) {
			let format = space.formats[formatId];
			if (format.type !== "custom") continue;
			if (format.test && !format.test(env.str)) continue;
			let formatObject = space.getFormat(format);
			let color = formatObject.parse(env.str);
			if (color) {
				if (meta) Object.assign(meta, {
					format: formatObject,
					formatId
				});
				ret = color;
				break spaceloop;
			}
		}
		if (!ret) throw new TypeError(`Could not parse ${str} as a color. Missing a plugin?`);
		ret.alpha = isNone(ret.alpha) ? ret.alpha : ret.alpha === void 0 ? 1 : clamp(0, ret.alpha, 1);
		return ret;
	}
	/**
	* Units and multiplication factors for the internally stored numbers
	*/
	const units = {
		"%": .01,
		deg: 1,
		grad: .9,
		rad: 180 / Math.PI,
		turn: 360
	};
	const regex = {
		function: /^([a-z]+)\(((?:calc\(NaN\)|.)+?)\)$/i,
		number: /^([-+]?(?:[0-9]*\.)?[0-9]+(e[-+]?[0-9]+)?)$/i,
		unitValue: RegExp(`(${Object.keys(units).join("|")})$`),
		singleArgument: /\/?\s*(none|NaN|calc\(NaN\)|[-+\w.]+(?:%|deg|g?rad|turn)?)/g
	};
	/**
	* Parse a single function argument
	* @param {string} rawArg
	* @returns {{value: number, meta: ArgumentMeta}}
	*/
	function parseArgument(rawArg) {
		/** @type {Partial<ArgumentMeta>} */
		let meta = {};
		let unit = rawArg.match(regex.unitValue)?.[0];
		/** @type {string | number} */
		let value = meta.raw = rawArg;
		if (unit) {
			meta.type = unit === "%" ? "<percentage>" : "<angle>";
			meta.unit = unit;
			meta.unitless = Number(value.slice(0, -unit.length));
			value = meta.unitless * units[unit];
		} else if (regex.number.test(value)) {
			value = Number(value);
			meta.type = "<number>";
		} else if (value === "none") value = null;
		else if (value === "NaN" || value === "calc(NaN)") {
			value = NaN;
			meta.type = "<number>";
		} else meta.type = "<ident>";
		return {
			value,
			meta
		};
	}
	/**
	* Parse a CSS function, regardless of its name and arguments
	* @param {string} str String to parse
	* @return {ParseFunctionReturn | void}
	*/
	function parseFunction(str) {
		if (!str) return;
		str = str.trim();
		let parts = str.match(regex.function);
		if (parts) {
			let args = [];
			let argMeta = [];
			let lastAlpha = false;
			let name = parts[1].toLowerCase();
			let separators = parts[2].replace(regex.singleArgument, ($0, rawArg) => {
				let { value, meta } = parseArgument(rawArg);
				if ($0.startsWith("/") || name !== "color" && args.length === 3) lastAlpha = true;
				args.push(value);
				argMeta.push(meta);
				return "";
			});
			return {
				name,
				args,
				argMeta,
				lastAlpha,
				commas: separators.includes(","),
				rawName: parts[1],
				rawArgs: parts[2]
			};
		}
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/getColor.js
/** @import { ColorTypes, ParseOptions as GetColorOptions, PlainColorObject } from "./types.js" */
	/**
	* Resolves a color reference (object or string) to a plain color object
	* @overload
	* @param {ColorTypes} color
	* @param {GetColorOptions} [options]
	* @returns {PlainColorObject}
	*/
	/**
	* @overload
	* @param {ColorTypes[]} color
	* @param {GetColorOptions} [options]
	* @returns {PlainColorObject[]}
	*/
	function getColor(color, options) {
		if (Array.isArray(color)) return color.map((c) => getColor(c, options));
		if (!color) throw new TypeError("Empty color reference");
		if (isString(color)) color = parse(color, options);
		let space = color.space || color.spaceId;
		if (typeof space === "string") color.space = ColorSpace.get(space);
		if (color.alpha === void 0) color.alpha = 1;
		return color;
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/ColorSpace.js
/**
	* @packageDocumentation
	* Defines the class and other types related to creating color spaces.
	* For the builtin color spaces, see the `spaces` module.
	*/
	const ε$3 = 75e-6;
	/**
	* Class to represent a color space
	*/
	var ColorSpace = class ColorSpace {
		constructor(options) {
			this.id = options.id;
			this.name = options.name;
			this.base = options.base ? ColorSpace.get(options.base) : null;
			this.aliases = options.aliases;
			this.displaySpaces = options.displaySpaces?.map((space) => ColorSpace.get(space));
			this.bases = [];
			for (let base = this.base; base; base = base.base) this.bases.push(base);
			if (options.rgbGamut) this.rgbGamut = options.rgbGamut;
			if (options.linearGamut) this.linearGamut = options.linearGamut;
			if (this.base) {
				if (options.fromBase) this.fromBase = options.fromBase;
				if (options.toBase) this.toBase = options.toBase;
			}
			let coords = options.coords ?? this.base.coords;
			for (let name in coords) if (!("name" in coords[name])) coords[name].name = name;
			this.coords = coords;
			let white = options.white ?? this.base.white ?? "D65";
			this.white = getWhite(white);
			this.formats = options.formats ?? {};
			for (let name in this.formats) {
				let format = this.formats[name];
				format.type ||= "function";
				format.name ||= name;
			}
			if (!this.formats.color?.id) this.formats.color = {
				...this.formats.color ?? {},
				id: options.cssId || this.id
			};
			if (options.gamutSpace) this.gamutSpace = options.gamutSpace === "self" ? this : ColorSpace.get(options.gamutSpace);
			else if (this.isPolar) this.gamutSpace = this.base;
			else this.gamutSpace = this;
			if (this.gamutSpace.isUnbounded) this.inGamut = (coords, options) => {
				return true;
			};
			this.M = options.M ?? {};
			this.referred = options.referred;
			Object.defineProperty(this, "path", {
				value: getPath(this).reverse(),
				writable: false,
				enumerable: true,
				configurable: true
			});
			hooks.run("colorspace-init-end", this);
		}
		inGamut(coords, { epsilon = ε$3 } = {}) {
			if (!this.equals(this.gamutSpace)) {
				coords = this.to(this.gamutSpace, coords);
				return this.gamutSpace.inGamut(coords, { epsilon });
			}
			let coordMeta = Object.values(this.coords);
			return coords.every((c, i) => {
				let meta = coordMeta[i];
				if (meta.type !== "angle" && meta.range) {
					if (isNone(c)) return true;
					let [min, max] = meta.range;
					return (min === void 0 || c >= min - epsilon) && (max === void 0 || c <= max + epsilon);
				}
				return true;
			});
		}
		get isUnbounded() {
			return Object.values(this.coords).every((coord) => !("range" in coord));
		}
		get cssId() {
			return this.formats?.color?.id || this.id;
		}
		/**
		* The id of this space's hue coordinate, or null if the space is not polar
		* @returns {string | null}
		*/
		get hueId() {
			for (let id in this.coords) if (this.coords[id].type === "angle") return id;
			return null;
		}
		/**
		* The index of this space's hue coordinate within its coords array, or -1 if the space is not polar
		* @returns {number}
		*/
		get hueIndex() {
			return Object.keys(this.coords).findIndex((id) => this.coords[id].type === "angle");
		}
		get isPolar() {
			return this.hueId !== null;
		}
		/**
		* Lookup a format in this color space
		* @param {string | object | Format} format - Format id if string. If object, it's converted to a `Format` object and returned.
		* @returns {Format}
		*/
		getFormat(format) {
			if (!format) return null;
			if (format === "default") format = Object.values(this.formats)[0];
			else if (typeof format === "string") format = this.formats[format];
			let ret = Format.get(format, this);
			if (ret !== format && format.name in this.formats) this.formats[format.name] = ret;
			return ret;
		}
		/**
		* Check if this color space is the same as another color space reference.
		* Allows proxying color space objects and comparing color spaces with ids.
		* @param {string | ColorSpace} space ColorSpace object or id to compare to
		* @returns {boolean}
		*/
		equals(space) {
			if (!space) return false;
			return this === space || this.id === space || this.id === space.id;
		}
		to(space, coords) {
			if (arguments.length === 1) {
				const color = getColor(space);
				[space, coords] = [color.space, color.coords];
			}
			space = ColorSpace.get(space);
			if (this.equals(space)) return coords;
			coords = coords.map((c) => isNone(c) ? 0 : c);
			let myPath = this.path;
			let otherPath = space.path;
			let connectionSpace, connectionSpaceIndex;
			for (let i = 0; i < myPath.length; i++) if (myPath[i].equals(otherPath[i])) {
				connectionSpace = myPath[i];
				connectionSpaceIndex = i;
			} else break;
			if (!connectionSpace) throw new Error(`Cannot convert between color spaces ${this} and ${space}: no connection space was found`);
			for (let i = myPath.length - 1; i > connectionSpaceIndex; i--) coords = myPath[i].toBase(coords);
			for (let i = connectionSpaceIndex + 1; i < otherPath.length; i++) coords = otherPath[i].fromBase(coords);
			return coords;
		}
		from(space, coords) {
			if (arguments.length === 1) {
				const color = getColor(space);
				[space, coords] = [color.space, color.coords];
			}
			space = ColorSpace.get(space);
			return space.to(this, coords);
		}
		toString() {
			return `${this.name} (${this.id})`;
		}
		getMinCoords() {
			let ret = [];
			for (let id in this.coords) {
				let meta = this.coords[id];
				let range = meta.range || meta.refRange;
				ret.push(range?.min ?? 0);
			}
			return ret;
		}
		static registry = {};
		static get all() {
			return [...new Set(Object.values(ColorSpace.registry))];
		}
		static register(id, space) {
			if (arguments.length === 1) {
				space = arguments[0];
				id = space.id;
			}
			space = this.get(space);
			if (this.registry[id] && this.registry[id] !== space) throw new Error(`Duplicate color space registration: '${id}'`);
			this.registry[id] = space;
			if (arguments.length === 1 && space.aliases) for (let alias of space.aliases) this.register(alias, space);
			return space;
		}
		/**
		* Lookup ColorSpace object by name
		* @param {ColorSpace | string} name
		*/
		static get(space, ...alternatives) {
			if (!space || isInstance(space, this)) return space;
			if (type(space) === "string") {
				let ret = ColorSpace.registry[space.toLowerCase()];
				if (!ret) throw new TypeError(`No color space found with id = "${space}"`);
				return ret;
			}
			if (alternatives.length) return ColorSpace.get(...alternatives);
			throw new TypeError(`${space} is not a valid color space`);
		}
		/**
		* Look up all color spaces for a format that matches certain criteria
		* @param {object | string} filters
		* @param {Array<ColorSpace>} [spaces=ColorSpace.all]
		* @returns {Format | null}
		*/
		static findFormat(filters, spaces = ColorSpace.all) {
			if (!filters) return null;
			if (typeof filters === "string") filters = { name: filters };
			for (let space of spaces) for (let [name, format] of Object.entries(space.formats)) {
				format.name ??= name;
				format.type ??= "function";
				let matches = (!filters.name || format.name === filters.name) && (!filters.type || format.type === filters.type);
				if (filters.id) {
					let ids = format.ids || [format.id];
					let filterIds = Array.isArray(filters.id) ? filters.id : [filters.id];
					matches &&= filterIds.some((id) => ids.includes(id));
				}
				if (matches) {
					let ret = Format.get(format, space);
					if (ret !== format) space.formats[format.name] = ret;
					return ret;
				}
			}
			return null;
		}
		/**
		* Get metadata about a coordinate of a color space
		*
		* @static
		* @param {Array | string} ref
		* @param {ColorSpace | string} [workingSpace]
		* @return {Object}
		*/
		static resolveCoord(ref, workingSpace) {
			let coordType = type(ref);
			let space, coord;
			if (coordType === "string") {
				if (ref.includes(".")) [space, coord] = ref.split(".");
				else [space, coord] = [, ref];
			} else if (Array.isArray(ref)) [space, coord] = ref;
			else {
				space = ref.space;
				coord = ref.coordId;
			}
			space = ColorSpace.get(space);
			if (!space) space = workingSpace;
			if (!space) throw new TypeError(`Cannot resolve coordinate reference ${ref}: No color space specified and relative references are not allowed here`);
			coordType = type(coord);
			if (coordType === "number" || coordType === "string" && coord >= 0) {
				let meta = Object.entries(space.coords)[coord];
				if (meta) return {
					space,
					id: meta[0],
					index: coord,
					...meta[1]
				};
			}
			space = ColorSpace.get(space);
			let normalizedCoord = coord.toLowerCase();
			let i = 0;
			for (let id in space.coords) {
				let meta = space.coords[id];
				if (id.toLowerCase() === normalizedCoord || meta.name?.toLowerCase() === normalizedCoord) return {
					space,
					id,
					index: i,
					...meta
				};
				i++;
			}
			throw new TypeError(`No "${coord}" coordinate found in ${space.name}. Its coordinates are: ${Object.keys(space.coords).join(", ")}`);
		}
		static DEFAULT_FORMAT = {
			type: "functions",
			name: "color"
		};
	};
	function getPath(space) {
		let ret = [space];
		for (let s = space; s = s.base;) ret.push(s);
		return ret;
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/xyz-d65.js
	var xyz_d65_default = new ColorSpace({
		id: "xyz-d65",
		name: "XYZ D65",
		coords: {
			x: {
				refRange: [0, 1],
				name: "X"
			},
			y: {
				refRange: [0, 1],
				name: "Y"
			},
			z: {
				refRange: [0, 1],
				name: "Z"
			}
		},
		white: "D65",
		formats: { color: { ids: ["xyz-d65", "xyz"] } },
		aliases: ["xyz"]
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/RGBColorSpace.js
/** @typedef {import("./types.js").RGBOptions} RGBOptions */
	/** Convenience class for RGB color spaces */
	var RGBColorSpace = class extends ColorSpace {
		/**
		* Creates a new RGB ColorSpace.
		* If coords are not specified, they will use the default RGB coords.
		* Instead of `fromBase()` and `toBase()` functions,
		* you can specify to/from XYZ matrices and have the default `toBase()` and `fromBase()`
		* methods use them via `this.M.toXYZ` and `this.M.fromXYZ`.
		* @param {RGBOptions} options
		*/
		constructor(options) {
			if (!options.coords) options.coords = {
				r: {
					range: [0, 1],
					name: "Red"
				},
				g: {
					range: [0, 1],
					name: "Green"
				},
				b: {
					range: [0, 1],
					name: "Blue"
				}
			};
			if (!options.base) options.base = xyz_d65_default;
			let toXYZ = options.toXYZ_M ?? options.M?.toXYZ;
			let fromXYZ = options.fromXYZ_M ?? options.M?.fromXYZ;
			options.referred ??= "display";
			super(options);
			if (toXYZ && fromXYZ) {
				this.M.toXYZ = toXYZ;
				this.M.fromXYZ = fromXYZ;
			}
		}
		toBase(rgb) {
			let xyz = multiply_v3_m3x3(rgb, this.M.toXYZ);
			if (this.white !== this.base.white) xyz = adapt$1(this.white, this.base.white, xyz);
			return xyz;
		}
		fromBase(xyz) {
			xyz = adapt$1(this.base.white, this.white, xyz);
			return multiply_v3_m3x3(xyz, this.M.fromXYZ);
		}
	};

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/xyz-d50.js
	var xyz_d50_default = new ColorSpace({
		id: "xyz-d50",
		name: "XYZ D50",
		white: "D50",
		base: xyz_d65_default,
		fromBase: (coords) => adapt$1(xyz_d65_default.white, "D50", coords),
		toBase: (coords) => adapt$1("D50", xyz_d65_default.white, coords)
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/lab.js
	const ε$2 = 216 / 24389;
	const ε3 = 24 / 116;
	const κ$1 = 24389 / 27;
	let white$2 = WHITES.D50;
	var lab_default = new ColorSpace({
		id: "lab",
		name: "Lab",
		coords: {
			l: {
				refRange: [0, 100],
				name: "Lightness"
			},
			a: { refRange: [-125, 125] },
			b: { refRange: [-125, 125] }
		},
		white: white$2,
		base: xyz_d50_default,
		fromBase(XYZ) {
			let f = XYZ.map((value, i) => value / white$2[i]).map((value) => value > ε$2 ? Math.cbrt(value) : (κ$1 * value + 16) / 116);
			return [
				116 * f[1] - 16,
				500 * (f[0] - f[1]),
				200 * (f[1] - f[2])
			];
		},
		toBase(Lab) {
			let [L, a, b] = Lab;
			let f = [];
			f[1] = (L + 16) / 116;
			f[0] = a / 500 + f[1];
			f[2] = f[1] - b / 200;
			return [
				f[0] > ε3 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / κ$1,
				Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / κ$1,
				f[2] > ε3 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / κ$1
			].map((value, i) => value * white$2[i]);
		},
		formats: { lab: { coords: [
			"<percentage> | <number>",
			"<number> | <percentage>",
			"<number> | <percentage>"
		] } }
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/angles.js
/**
	* Constrain an angle to 360 degrees
	* @param {number} angle
	* @returns {number}
	*/
	function constrain(angle) {
		if (typeof angle !== "number") return angle;
		return (angle % 360 + 360) % 360;
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/lch.js
	var lch_default = new ColorSpace({
		id: "lch",
		name: "LCH",
		coords: {
			l: {
				refRange: [0, 100],
				name: "Lightness"
			},
			c: {
				refRange: [0, 150],
				name: "Chroma"
			},
			h: {
				refRange: [0, 360],
				type: "angle",
				name: "Hue"
			}
		},
		base: lab_default,
		fromBase(Lab) {
			if (this.ε === void 0) {
				let range = Object.values(this.base.coords)[1].refRange;
				let extent = range[1] - range[0];
				this.ε = extent / 1e5;
			}
			let [L, a, b] = Lab;
			let isAchromatic = Math.abs(a) < this.ε && Math.abs(b) < this.ε;
			let h = isAchromatic ? null : constrain(Math.atan2(b, a) * 180 / Math.PI);
			return [
				L,
				isAchromatic ? 0 : Math.sqrt(a ** 2 + b ** 2),
				h
			];
		},
		toBase(lch) {
			let [L, C, h] = lch;
			let a = null, b = null;
			if (!isNone(h)) {
				C = C < 0 ? 0 : C;
				a = C * Math.cos(h * Math.PI / 180);
				b = C * Math.sin(h * Math.PI / 180);
			}
			return [
				L,
				a,
				b
			];
		},
		formats: { lch: { coords: [
			"<percentage> | <number>",
			"<number> | <percentage>",
			"<number> | <angle>"
		] } }
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/deltaE2000.js
	const Gfactor = 25 ** 7;
	const π = Math.PI;
	const r2d = 180 / π;
	const d2r$1 = π / 180;
	function pow7(x) {
		const x2 = x * x;
		return x2 * x2 * x2 * x;
	}
	/**
	* @param {import("../types.js").ColorTypes} color
	* @param {import("../types.js").ColorTypes} sample
	* @param {{ kL?: number | undefined; kC?: number | undefined; kH?: number | undefined }} options
	* @returns {number}
	*/
	function deltaE2000_default(color, sample, { kL = 1, kC = 1, kH = 1 } = {}) {
		[color, sample] = getColor([color, sample]);
		let [L1, a1, b1] = lab_default.from(color);
		let C1 = lch_default.from(lab_default, [
			L1,
			a1,
			b1
		])[1];
		let [L2, a2, b2] = lab_default.from(sample);
		let C2 = lch_default.from(lab_default, [
			L2,
			a2,
			b2
		])[1];
		if (C1 < 0) C1 = 0;
		if (C2 < 0) C2 = 0;
		let C7 = pow7((C1 + C2) / 2);
		let G = .5 * (1 - Math.sqrt(C7 / (C7 + Gfactor)));
		let adash1 = (1 + G) * a1;
		let adash2 = (1 + G) * a2;
		let Cdash1 = Math.sqrt(adash1 ** 2 + b1 ** 2);
		let Cdash2 = Math.sqrt(adash2 ** 2 + b2 ** 2);
		let h1 = adash1 === 0 && b1 === 0 ? 0 : Math.atan2(b1, adash1);
		let h2 = adash2 === 0 && b2 === 0 ? 0 : Math.atan2(b2, adash2);
		if (h1 < 0) h1 += 2 * π;
		if (h2 < 0) h2 += 2 * π;
		h1 *= r2d;
		h2 *= r2d;
		let ΔL = L2 - L1;
		let ΔC = Cdash2 - Cdash1;
		let hdiff = h2 - h1;
		let hsum = h1 + h2;
		let habs = Math.abs(hdiff);
		let Δh;
		if (Cdash1 * Cdash2 === 0) Δh = 0;
		else if (habs <= 180) Δh = hdiff;
		else if (hdiff > 180) Δh = hdiff - 360;
		else if (hdiff < -180) Δh = hdiff + 360;
		else defaults_default.warn("the unthinkable has happened");
		let ΔH = 2 * Math.sqrt(Cdash2 * Cdash1) * Math.sin(Δh * d2r$1 / 2);
		let Ldash = (L1 + L2) / 2;
		let Cdash = (Cdash1 + Cdash2) / 2;
		let Cdash7 = pow7(Cdash);
		let hdash;
		if (Cdash1 * Cdash2 === 0) hdash = hsum;
		else if (habs <= 180) hdash = hsum / 2;
		else if (hsum < 360) hdash = (hsum + 360) / 2;
		else hdash = (hsum - 360) / 2;
		let lsq = (Ldash - 50) ** 2;
		let SL = 1 + .015 * lsq / Math.sqrt(20 + lsq);
		let SC = 1 + .045 * Cdash;
		let T = 1;
		T -= .17 * Math.cos((hdash - 30) * d2r$1);
		T += .24 * Math.cos(2 * hdash * d2r$1);
		T += .32 * Math.cos((3 * hdash + 6) * d2r$1);
		T -= .2 * Math.cos((4 * hdash - 63) * d2r$1);
		let SH = 1 + .015 * Cdash * T;
		let Δθ = 30 * Math.exp(-1 * ((hdash - 275) / 25) ** 2);
		let RC = 2 * Math.sqrt(Cdash7 / (Cdash7 + Gfactor));
		let RT = -1 * Math.sin(2 * Δθ * d2r$1) * RC;
		let dE = (ΔL / (kL * SL)) ** 2;
		dE += (ΔC / (kC * SC)) ** 2;
		dE += (ΔH / (kH * SH)) ** 2;
		dE += RT * (ΔC / (kC * SC)) * (ΔH / (kH * SH));
		return Math.sqrt(dE);
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/oklab.js
/** @import { Matrix3x3 } from "../types.js" */
	/**
	* Matrices used by this color space, also available as `Oklab.M`.
	* Recalculated for consistent reference white,
	* see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484
	* @type {Record<string, Matrix3x3>}
	*/
	const M$5 = {
		XYZtoLMS: [
			[
				.819022437996703,
				.3619062600528904,
				-.1288737815209879
			],
			[
				.0329836539323885,
				.9292868615863434,
				.0361446663506424
			],
			[
				.0481771893596242,
				.2642395317527308,
				.6335478284694309
			]
		],
		LMStoXYZ: [
			[
				1.2268798758459243,
				-.5578149944602171,
				.2813910456659647
			],
			[
				-.0405757452148008,
				1.112286803280317,
				-.0717110580655164
			],
			[
				-.0763729366746601,
				-.4214933324022432,
				1.5869240198367816
			]
		],
		LMStoLab: [
			[
				.210454268309314,
				.7936177747023054,
				-.0040720430116193
			],
			[
				1.9779985324311684,
				-2.42859224204858,
				.450593709617411
			],
			[
				.0259040424655478,
				.7827717124575296,
				-.8086757549230774
			]
		],
		LabtoLMS: [
			[
				1,
				.3963377773761749,
				.2158037573099136
			],
			[
				1,
				-.1055613458156586,
				-.0638541728258133
			],
			[
				1,
				-.0894841775298119,
				-1.2914855480194092
			]
		]
	};
	var oklab_default = new ColorSpace({
		id: "oklab",
		name: "Oklab",
		coords: {
			l: {
				refRange: [0, 1],
				name: "Lightness"
			},
			a: { refRange: [-.4, .4] },
			b: { refRange: [-.4, .4] }
		},
		white: "D65",
		base: xyz_d65_default,
		M: M$5,
		fromBase(XYZ) {
			let LMS = multiply_v3_m3x3(XYZ, M$5.XYZtoLMS);
			LMS[0] = Math.cbrt(LMS[0]);
			LMS[1] = Math.cbrt(LMS[1]);
			LMS[2] = Math.cbrt(LMS[2]);
			return multiply_v3_m3x3(LMS, M$5.LMStoLab, LMS);
		},
		toBase(OKLab) {
			let LMSg = multiply_v3_m3x3(OKLab, M$5.LabtoLMS);
			LMSg[0] = LMSg[0] ** 3;
			LMSg[1] = LMSg[1] ** 3;
			LMSg[2] = LMSg[2] ** 3;
			return multiply_v3_m3x3(LMSg, M$5.LMStoXYZ, LMSg);
		},
		formats: { oklab: { coords: [
			"<percentage> | <number>",
			"<number> | <percentage>",
			"<number> | <percentage>"
		] } }
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/deltaEOK.js
/**
	* More accurate color-difference formulae
	* than the simple 1976 Euclidean distance in CIE Lab
	* @param {import("../types.js").ColorTypes} color
	* @param {import("../types.js").ColorTypes} sample
	* @returns {number}
	*/
	function deltaEOK_default(color, sample) {
		[color, sample] = getColor([color, sample]);
		let [L1, a1, b1] = oklab_default.from(color);
		let [L2, a2, b2] = oklab_default.from(sample);
		let ΔL = L1 - L2;
		let Δa = a1 - a2;
		let Δb = b1 - b2;
		return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/inGamut.js
/** @import { ColorTypes } from "./types.js" */
	const ε$1 = 75e-6;
	/**
	* Check if a color is in gamut of either its own or another color space
	* @param {ColorTypes} color
	* @param {string | ColorSpace} [space]
	* @param {{ epsilon?: number | undefined }} [param2]
	* @returns {boolean}
	*/
	function inGamut(color, space, { epsilon = ε$1 } = {}) {
		color = getColor(color);
		if (!space) space = color.space;
		space = ColorSpace.get(space);
		let coords = color.coords;
		if (space !== color.space) coords = space.from(color);
		return space.inGamut(coords, { epsilon });
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/to.js
/** @import { ColorTypes, PlainColorObject, ToGamutOptions } from "./types.js" */
	/**
	* Convert to color space and return a new color
	* @param {ColorTypes} color
	* @param {string | ColorSpace} space
	* @param {{ inGamut?: boolean | ToGamutOptions | undefined }} options
	* @returns {PlainColorObject}
	*/
	function to(color, space, { inGamut } = {}) {
		color = getColor(color);
		space = ColorSpace.get(space);
		let coords = space.from(color);
		let ret = {
			space,
			coords,
			alpha: color.alpha
		};
		if (inGamut) ret = toGamut(ret, inGamut === true ? void 0 : inGamut);
		return ret;
	}
	/** @type {"color"} */
	to.returns = "color";

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/getAll.js
/** @import { ColorTypes, Coords } from "./types.js" */
	/**
	* Options for {@link getAll}
	* @typedef GetAllOptions
	* @property {string | ColorSpace | undefined} [space]
	* The color space to convert to. Defaults to the color's current space
	* @property {number | undefined} [precision]
	* The number of significant digits to round the coordinates to
	*/
	/**
	* Get the coordinates of a color in any color space
	* @overload
	* @param {ColorTypes} color
	* @param {string | ColorSpace} [options=color.space] The color space to convert to. Defaults to the color's current space
	* @returns {Coords} The color coordinates in the given color space
	*/
	/**
	* @overload
	* @param {ColorTypes} color
	* @param {GetAllOptions} [options]
	* @returns {Coords} The color coordinates in the given color space
	*/
	function getAll(color, options) {
		color = getColor(color);
		let space = ColorSpace.get(options, options?.space);
		let precision = options?.precision;
		let coords;
		if (!space || color.space.equals(space)) coords = color.coords.slice();
		else coords = space.from(color);
		return precision === void 0 ? coords : coords.map((coord) => toPrecision(coord, precision));
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/get.js
/** @import { ColorTypes, Ref } from "./types.js" */
	/**
	* @param {ColorTypes} color
	* @param {Ref} prop
	* @returns {number}
	*/
	function get(color, prop) {
		color = getColor(color);
		if (prop === "alpha") return color.alpha ?? 1;
		let { space, index } = ColorSpace.resolveCoord(prop, color.space);
		return getAll(color, space)[index];
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/oklch.js
	var oklch_default = new ColorSpace({
		id: "oklch",
		name: "OkLCh",
		coords: {
			l: {
				refRange: [0, 1],
				name: "Lightness"
			},
			c: {
				refRange: [0, .4],
				name: "Chroma"
			},
			h: {
				refRange: [0, 360],
				type: "angle",
				name: "Hue"
			}
		},
		white: "D65",
		base: oklab_default,
		fromBase: lch_default.fromBase,
		toBase: lch_default.toBase,
		formats: { oklch: { coords: [
			"<percentage> | <number>",
			"<number> | <percentage>",
			"<number> | <angle>"
		] } }
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/setAll.js
/** @import { ColorTypes, Coords, PlainColorObject } from "./types.js" */
	/**
	* Set all coordinates of a color at once, in its own color space or another.
	* Modifies the color in place.
	* @overload
	* @param {ColorTypes} color
	* @param {Coords} coords Array of coordinates
	* @param {number} [alpha]
	* @returns {PlainColorObject}
	*/
	/**
	* @overload
	* @param {ColorTypes} color
	* @param {string | ColorSpace} space The color space of the provided coordinates.
	* @param {Coords} coords Array of coordinates
	* @param {number} [alpha]
	* @returns {PlainColorObject}
	*/
	function setAll(color, space, coords, alpha) {
		color = getColor(color);
		if (Array.isArray(space)) [space, coords, alpha] = [
			color.space,
			space,
			coords
		];
		space = ColorSpace.get(space);
		color.coords = space === color.space ? coords.slice() : space.to(color.space, coords);
		if (alpha !== void 0) color.alpha = alpha;
		return color;
	}
	/** @type {"color"} */
	setAll.returns = "color";

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/set.js
/** @import { ColorTypes, PlainColorObject, Ref } from "./types.js" */
	/**
	* Set properties and return current instance
	* @overload
	* @param {ColorTypes} color
	* @param {Ref} prop
	* @param {number | ((coord: number) => number)} value
	* @returns {PlainColorObject}
	*/
	/**
	* @overload
	* @param {ColorTypes} color
	* @param {Record<string, number | ((coord: number) => number)>} props
	* @returns {PlainColorObject}
	*/
	function set(color, prop, value) {
		color = getColor(color);
		if (arguments.length === 2 && type(arguments[1]) === "object") {
			let object = arguments[1];
			for (let p in object) set(color, p, object[p]);
		} else {
			if (typeof value === "function") value = value(get(color, prop));
			if (prop === "alpha") color.alpha = value;
			else {
				let { space, index } = ColorSpace.resolveCoord(prop, color.space);
				let coords = getAll(color, space);
				coords[index] = value;
				setAll(color, space, coords);
			}
		}
		return color;
	}
	/** @type {"color"} */
	set.returns = "color";

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/clone.js
/** @import { Coords, PlainColorObject } from "./types.js" */
	/**
	* @param {PlainColorObject} color
	* @returns {PlainColorObject}
	*/
	function clone(color) {
		return {
			space: color.space,
			coords: color.coords.slice(),
			alpha: color.alpha
		};
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/distance.js
/** @import { ColorTypes } from "./types.js" */
	/**
	* Euclidean distance of colors in an arbitrary color space
	* @param {ColorTypes} color1
	* @param {ColorTypes} color2
	* @param {string | ColorSpace} space
	* @returns {number}
	*/
	function distance(color1, color2, space = "lab") {
		space = ColorSpace.get(space);
		let coords1 = space.from(color1);
		let coords2 = space.from(color2);
		return Math.sqrt(coords1.reduce((acc, c1, i) => {
			let c2 = coords2[i];
			if (isNone(c1) || isNone(c2)) return acc;
			return acc + (c2 - c1) ** 2;
		}, 0));
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/deltaE76.js
/**
	* @param {import("../types.js").ColorTypes} color
	* @param {import("../types.js").ColorTypes} sample
	* @returns {number}
	*/
	function deltaE76(color, sample) {
		return distance(color, sample, "lab");
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/deltaECMC.js
	const d2r = Math.PI / 180;
	/**
	* @param {import("../types.js").ColorTypes} color
	* @param {import("../types.js").ColorTypes} sample
	* @param {{ l?: number | undefined; c?: number | undefined }} options
	* @returns {number}
	*/
	function deltaECMC_default(color, sample, { l = 2, c = 1 } = {}) {
		[color, sample] = getColor([color, sample]);
		let [L1, a1, b1] = lab_default.from(color);
		let [, C1, H1] = lch_default.from(lab_default, [
			L1,
			a1,
			b1
		]);
		let [L2, a2, b2] = lab_default.from(sample);
		let C2 = lch_default.from(lab_default, [
			L2,
			a2,
			b2
		])[1];
		if (C1 < 0) C1 = 0;
		if (C2 < 0) C2 = 0;
		let ΔL = L1 - L2;
		let ΔC = C1 - C2;
		let Δa = a1 - a2;
		let Δb = b1 - b2;
		let H2 = Δa ** 2 + Δb ** 2 - ΔC ** 2;
		let SL = .511;
		if (L1 >= 16) SL = .040975 * L1 / (1 + .01765 * L1);
		let SC = .0638 * C1 / (1 + .0131 * C1) + .638;
		let T;
		if (isNone(H1)) H1 = 0;
		if (H1 >= 164 && H1 <= 345) T = .56 + Math.abs(.2 * Math.cos((H1 + 168) * d2r));
		else T = .36 + Math.abs(.4 * Math.cos((H1 + 35) * d2r));
		let C4 = Math.pow(C1, 4);
		let F = Math.sqrt(C4 / (C4 + 1900));
		let SH = SC * (F * T + 1 - F);
		let dE = (ΔL / (l * SL)) ** 2;
		dE += (ΔC / (c * SC)) ** 2;
		dE += H2 / SH ** 2;
		return Math.sqrt(dE);
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/xyz-abs-d65.js
	const Yw = 203;
	var xyz_abs_d65_default = new ColorSpace({
		id: "xyz-abs-d65",
		cssId: "--xyz-abs-d65",
		name: "Absolute XYZ D65",
		coords: {
			x: {
				refRange: [0, 9504.7],
				name: "Xa"
			},
			y: {
				refRange: [0, 1e4],
				name: "Ya"
			},
			z: {
				refRange: [0, 10888.3],
				name: "Za"
			}
		},
		base: xyz_d65_default,
		fromBase(XYZ) {
			return XYZ.map((v) => v * Yw);
		},
		toBase(AbsXYZ) {
			return AbsXYZ.map((v) => v / Yw);
		}
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/jzazbz.js
/** @import { Matrix3x3, Vector3 } from "../types.js" */
	const b = 1.15;
	const g = .66;
	const n = 2610 / 2 ** 14;
	const ninv = 2 ** 14 / 2610;
	const c1$1 = 3424 / 4096;
	const c2$1 = 2413 / 128;
	const c3$1 = 2392 / 128;
	const p$1 = 1.7 * 2523 / 32;
	const pinv = 32 / (1.7 * 2523);
	const d = -.56;
	const d0 = 16295499532821565e-27;
	/**
	* Matrices used by this color space, also available as `Jzazbz.M`
	* @type {Record<string, Matrix3x3>}
	*/
	const M$4 = {
		XYZtoCone: [
			[
				.41478972,
				.579999,
				.014648
			],
			[
				-.20151,
				1.120649,
				.0531008
			],
			[
				-.0166008,
				.2648,
				.6684799
			]
		],
		ConetoXYZ: [
			[
				1.9242264357876067,
				-1.0047923125953657,
				.037651404030618
			],
			[
				.35031676209499907,
				.7264811939316552,
				-.06538442294808501
			],
			[
				-.09098281098284752,
				-.3127282905230739,
				1.5227665613052603
			]
		],
		ConetoIab: [
			[
				.5,
				.5,
				0
			],
			[
				3.524,
				-4.066708,
				.542708
			],
			[
				.199076,
				1.096799,
				-1.295875
			]
		],
		IabtoCone: [
			[
				1,
				.13860504327153927,
				.05804731615611883
			],
			[
				1,
				-.1386050432715393,
				-.058047316156118904
			],
			[
				1,
				-.09601924202631895,
				-.811891896056039
			]
		]
	};
	var jzazbz_default = new ColorSpace({
		id: "jzazbz",
		name: "Jzazbz",
		coords: {
			jz: {
				refRange: [0, 1],
				name: "Jz"
			},
			az: { refRange: [-.21, .21] },
			bz: { refRange: [-.21, .21] }
		},
		base: xyz_abs_d65_default,
		M: M$4,
		fromBase(XYZ) {
			let [Xa, Ya, Za] = XYZ;
			let Xm = b * Xa - .1499999999999999 * Za;
			let Ym = g * Ya - -.33999999999999997 * Xa;
			let PQLMS = multiply_v3_m3x3([
				Xm,
				Ym,
				Za
			], M$4.XYZtoCone).map(function(val) {
				let num = c1$1 + c2$1 * spow(val / 1e4, n);
				let denom = 1 + c3$1 * spow(val / 1e4, n);
				return spow(num / denom, p$1);
			});
			let [Iz, az, bz] = multiply_v3_m3x3(PQLMS, M$4.ConetoIab);
			return [
				.43999999999999995 * Iz / (1 + d * Iz) - d0,
				az,
				bz
			];
		},
		toBase(Jzazbz) {
			let [Jz, az, bz] = Jzazbz;
			let Iz = (Jz + d0) / (.43999999999999995 - d * (Jz + d0));
			let LMS = multiply_v3_m3x3([
				Iz,
				az,
				bz
			], M$4.IabtoCone).map(function(val) {
				let num = c1$1 - spow(val, pinv);
				let denom = c3$1 * spow(val, pinv) - c2$1;
				return 1e4 * spow(num / denom, ninv);
			});
			let [Xm, Ym, Za] = multiply_v3_m3x3(LMS, M$4.ConetoXYZ);
			let Xa = (Xm + .1499999999999999 * Za) / b;
			return [
				Xa,
				(Ym + -.33999999999999997 * Xa) / g,
				Za
			];
		},
		formats: { jzazbz: { coords: [
			"<percentage> | <number>",
			"<number> | <percentage>",
			"<number> | <percentage>"
		] } }
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/jzczhz.js
	var jzczhz_default = new ColorSpace({
		id: "jzczhz",
		name: "JzCzHz",
		coords: {
			jz: {
				refRange: [0, 1],
				name: "Jz"
			},
			cz: {
				refRange: [0, .26],
				name: "Chroma"
			},
			hz: {
				refRange: [0, 360],
				type: "angle",
				name: "Hue"
			}
		},
		base: jzazbz_default,
		fromBase: lch_default.fromBase,
		toBase: lch_default.toBase,
		formats: { jzczhz: { coords: [
			"<percentage> | <number>",
			"<number> | <percentage>",
			"<number> | <angle>"
		] } }
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/deltaEJz.js
/**
	* More accurate color-difference formulae
	* than the simple 1976 Euclidean distance in Lab
	*
	* Uses JzCzHz, which has improved perceptual uniformity
	* and thus a simple Euclidean root-sum of ΔL² ΔC² ΔH²
	* gives good results.
	* @param {import("../types.js").ColorTypes} color
	* @param {import("../types.js").ColorTypes} sample
	* @returns {number}
	*/
	function deltaEJz_default(color, sample) {
		[color, sample] = getColor([color, sample]);
		let [Jz1, Cz1, Hz1] = jzczhz_default.from(color);
		let [Jz2, Cz2, Hz2] = jzczhz_default.from(sample);
		let ΔJ = Jz1 - Jz2;
		let ΔC = Cz1 - Cz2;
		if (isNone(Hz1) && isNone(Hz2)) {
			Hz1 = 0;
			Hz2 = 0;
		} else if (isNone(Hz1)) Hz1 = Hz2;
		else if (isNone(Hz2)) Hz2 = Hz1;
		let Δh = Hz1 - Hz2;
		let ΔH = 2 * Math.sqrt(Cz1 * Cz2) * Math.sin(Δh / 2 * (Math.PI / 180));
		return Math.sqrt(ΔJ ** 2 + ΔC ** 2 + ΔH ** 2);
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/ictcp.js
/** @import { Matrix3x3, Vector3 } from "../types.js" */
	const c1 = 3424 / 4096;
	const c2 = 2413 / 128;
	const c3 = 2392 / 128;
	const m1 = 2610 / 16384;
	const m2 = 2523 / 32;
	const im1 = 16384 / 2610;
	const im2 = 32 / 2523;
	/**
	* Matrices used by this color space, also available as `ICTCP.M`
	* @type {Record<string, Matrix3x3>}
	*/
	const M$3 = {
		XYZtoLMS: [
			[
				.3592832590121217,
				.6976051147779502,
				-.035891593232029
			],
			[
				-.1920808463704993,
				1.100476797037432,
				.0753748658519118
			],
			[
				.0070797844607479,
				.0748396662186362,
				.8433265453898765
			]
		],
		LMStoIPT: [
			[
				2048 / 4096,
				2048 / 4096,
				0
			],
			[
				6610 / 4096,
				-13613 / 4096,
				7003 / 4096
			],
			[
				17933 / 4096,
				-17390 / 4096,
				-543 / 4096
			]
		],
		IPTtoLMS: [
			[
				.9999999999999998,
				.0086090370379328,
				.111029625003026
			],
			[
				.9999999999999998,
				-.0086090370379328,
				-.1110296250030259
			],
			[
				.9999999999999998,
				.5600313357106791,
				-.3206271749873188
			]
		],
		LMStoXYZ: [
			[
				2.0701522183894223,
				-1.3263473389671563,
				.2066510476294053
			],
			[
				.3647385209748072,
				.6805660249472273,
				-.0453045459220347
			],
			[
				-.0497472075358123,
				-.0492609666966131,
				1.1880659249923042
			]
		]
	};
	var ictcp_default = new ColorSpace({
		id: "ictcp",
		name: "ICTCP",
		coords: {
			i: {
				refRange: [0, 1],
				name: "I"
			},
			ct: {
				refRange: [-.5, .5],
				name: "CT"
			},
			cp: {
				refRange: [-.5, .5],
				name: "CP"
			}
		},
		base: xyz_abs_d65_default,
		M: M$3,
		fromBase(XYZ) {
			return LMStoICtCp(multiply_v3_m3x3(XYZ, M$3.XYZtoLMS));
		},
		toBase(ICtCp) {
			let LMS = ICtCptoLMS(ICtCp);
			return multiply_v3_m3x3(LMS, M$3.LMStoXYZ);
		},
		formats: { ictcp: { coords: [
			"<percentage> | <number>",
			"<number> | <percentage>",
			"<number> | <percentage>"
		] } }
	});
	/**
	*
	* @param {Vector3} LMS
	* @returns {Vector3}
	*/
	function LMStoICtCp(LMS) {
		let PQLMS = LMS.map(function(val) {
			return ((c1 + c2 * (val / 1e4) ** m1) / (1 + c3 * (val / 1e4) ** m1)) ** m2;
		});
		return multiply_v3_m3x3(PQLMS, M$3.LMStoIPT);
	}
	/**
	*
	* @param {Vector3} ICtCp
	* @returns {Vector3}
	*/
	function ICtCptoLMS(ICtCp) {
		return multiply_v3_m3x3(ICtCp, M$3.IPTtoLMS).map(function(val) {
			return 1e4 * (Math.max(val ** im2 - c1, 0) / (c2 - c3 * val ** im2)) ** im1;
		});
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/deltaEITP.js
/**
	* Delta E in ICtCp space,
	* which the ITU calls Delta E ITP, which is shorter.
	* Formulae from ITU Rec. ITU-R BT.2124-0
	* @param {import("../types.js").ColorTypes} color
	* @param {import("../types.js").ColorTypes} sample
	* @returns {number}
	*/
	function deltaEITP_default(color, sample) {
		[color, sample] = getColor([color, sample]);
		let [I1, T1, P1] = ictcp_default.from(color);
		let [I2, T2, P2] = ictcp_default.from(sample);
		return 720 * Math.sqrt((I1 - I2) ** 2 + .25 * (T1 - T2) ** 2 + (P1 - P2) ** 2);
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/deltaEOK2.js
/**
	* More accurate color-difference formulae
	* than the simple 1976 Euclidean distance in CIE Lab
	* The Oklab a and b axes are scaled relative to the L axis, for better uniformity
	* Björn Ottosson said:
	* "I've recently done some tests with color distance datasets as implemented
	* in Colorio and on both the Combvd dataset and the OSA-UCS dataset a
	* scale factor of slightly more than 2 for a and b would give the best results
	* (2.016 works best for Combvd and 2.045 for the OSA-UCS dataset)."
	* @see {@link <https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-945714988>}
	* @param {import("../types.js").ColorTypes} color
	* @param {import("../types.js").ColorTypes} sample
	* @returns {number}
	*/
	function deltaEOK2_default(color, sample) {
		[color, sample] = getColor([color, sample]);
		let abscale = 2;
		let [L1, a1, b1] = oklab_default.from(color);
		let [L2, a2, b2] = oklab_default.from(sample);
		let ΔL = L1 - L2;
		let Δa = abscale * (a1 - a2);
		let Δb = abscale * (b1 - b2);
		return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/cam16.js
/** @import { Coords, Matrix3x3, Vector3 } from "../types.js" */
	/** @typedef {import("../types.js").Cam16Object} Cam16Object */
	/** @typedef {import("../types.js").Cam16Input} Cam16Input */
	/** @typedef {import("../types.js").Cam16Environment} Cam16Environment */
	const white$1 = WHITES.D65;
	const adaptedCoef = .42;
	const adaptedCoefInv = 1 / adaptedCoef;
	const tau = 2 * Math.PI;
	/**
	* Matrices used by this color space, also available as `CAM16_JMh.M`
	* @type {Record<string, Matrix3x3>}
	*/
	const M$2 = {
		cat16: [
			[
				.401288,
				.650173,
				-.051461
			],
			[
				-.250268,
				1.204414,
				.045854
			],
			[
				-.002079,
				.048952,
				.953127
			]
		],
		cat16Inv: [
			[
				1.8620678550872327,
				-1.0112546305316843,
				.14918677544445175
			],
			[
				.38752654323613717,
				.6214474419314753,
				-.008973985167612518
			],
			[
				-.015841498849333856,
				-.03412293802851557,
				1.0499644368778496
			]
		],
		m1: [
			[
				460,
				451,
				288
			],
			[
				460,
				-891,
				-261
			],
			[
				460,
				-220,
				-6300
			]
		]
	};
	const surroundMap = {
		dark: [
			.8,
			.525,
			.8
		],
		dim: [
			.9,
			.59,
			.9
		],
		average: [
			1,
			.69,
			1
		]
	};
	const hueQuadMap = {
		h: [
			20.14,
			90,
			164.25,
			237.53,
			380.14
		],
		e: [
			.8,
			.7,
			1,
			1.2,
			.8
		],
		H: [
			0,
			100,
			200,
			300,
			400
		]
	};
	const rad2deg = 180 / Math.PI;
	const deg2rad$1 = Math.PI / 180;
	/**
	* @param {Coords} coords
	* @param {number} fl
	* @returns {[number, number, number]}
	*/
	function adapt(coords, fl) {
		return coords.map((c) => {
			const x = spow(fl * Math.abs(c) * .01, adaptedCoef);
			return 400 * copySign(x, c) / (x + 27.13);
		});
	}
	/**
	* @param {Coords} adapted
	* @param {number} fl
	* @returns {[number, number, number]}
	*/
	function unadapt(adapted, fl) {
		const constant = 100 / fl * 27.13 ** adaptedCoefInv;
		return adapted.map((c) => {
			const cabs = Math.abs(c);
			return copySign(constant * spow(cabs / (400 - cabs), adaptedCoefInv), c);
		});
	}
	/**
	* @param {number} h
	*/
	function hueQuadrature(h) {
		let hp = constrain(h);
		if (hp <= hueQuadMap.h[0]) hp += 360;
		const i = bisectLeft(hueQuadMap.h, hp) - 1;
		const [hi, hii] = hueQuadMap.h.slice(i, i + 2);
		const [ei, eii] = hueQuadMap.e.slice(i, i + 2);
		const Hi = hueQuadMap.H[i];
		const t = (hp - hi) / ei;
		return Hi + 100 * t / (t + (hii - hp) / eii);
	}
	/**
	* @param {number} H
	*/
	function invHueQuadrature(H) {
		let Hp = (H % 400 + 400) % 400;
		const i = Math.floor(.01 * Hp);
		Hp = Hp % 100;
		const [hi, hii] = hueQuadMap.h.slice(i, i + 2);
		const [ei, eii] = hueQuadMap.e.slice(i, i + 2);
		return constrain((Hp * (eii * hi - ei * hii) - 100 * hi * eii) / (Hp * (eii - ei) - 100 * eii));
	}
	/**
	* @param {[number, number, number]} refWhite
	* @param {number} adaptingLuminance
	* @param {number} backgroundLuminance
	* @param {keyof typeof surroundMap} surround
	* @param {boolean} discounting
	* @returns {Cam16Environment}
	*/
	function environment(refWhite, adaptingLuminance, backgroundLuminance, surround, discounting) {
		const env = {};
		env.discounting = discounting;
		env.refWhite = refWhite;
		env.surround = surround;
		const xyzW = refWhite.map((c) => {
			return c * 100;
		});
		env.la = adaptingLuminance;
		env.yb = backgroundLuminance;
		const yw = xyzW[1];
		const rgbW = multiply_v3_m3x3(xyzW, M$2.cat16);
		let values = surroundMap[env.surround];
		const f = values[0];
		env.c = values[1];
		env.nc = values[2];
		const k4 = (1 / (5 * env.la + 1)) ** 4;
		env.fl = k4 * env.la + .1 * (1 - k4) * (1 - k4) * Math.cbrt(5 * env.la);
		env.flRoot = env.fl ** .25;
		env.n = env.yb / yw;
		env.z = 1.48 + Math.sqrt(env.n);
		env.nbb = .725 * env.n ** -.2;
		env.ncb = env.nbb;
		const d = discounting ? 1 : Math.max(Math.min(f * (1 - 1 / 3.6 * Math.exp((-env.la - 42) / 92)), 1), 0);
		env.dRgb = rgbW.map((c) => {
			return interpolate(1, yw / c, d);
		});
		env.dRgbInv = env.dRgb.map((c) => {
			return 1 / c;
		});
		const rgbAW = adapt(rgbW.map((c, i) => {
			return c * env.dRgb[i];
		}), env.fl);
		env.aW = env.nbb * (2 * rgbAW[0] + rgbAW[1] + .05 * rgbAW[2]);
		return env;
	}
	const viewingConditions$1 = environment(white$1, 64 / Math.PI * .2, 20, "average", false);
	/**
	* @param {Cam16Input} cam16
	* @param {Cam16Environment} env
	* @returns {[number, number, number]}
	*/
	function fromCam16(cam16, env) {
		if (!(cam16.J !== void 0 ^ cam16.Q !== void 0)) throw new Error("Conversion requires one and only one: 'J' or 'Q'");
		if (!(cam16.C !== void 0 ^ cam16.M !== void 0 ^ cam16.s !== void 0)) throw new Error("Conversion requires one and only one: 'C', 'M' or 's'");
		if (!(cam16.h !== void 0 ^ cam16.H !== void 0)) throw new Error("Conversion requires one and only one: 'h' or 'H'");
		if (cam16.J === 0 || cam16.Q === 0) return [
			0,
			0,
			0
		];
		let hRad = 0;
		if (cam16.h !== void 0) hRad = constrain(cam16.h) * deg2rad$1;
		else hRad = invHueQuadrature(cam16.H) * deg2rad$1;
		const cosh = Math.cos(hRad);
		const sinh = Math.sin(hRad);
		let Jroot = 0;
		if (cam16.J !== void 0) Jroot = spow(cam16.J, 1 / 2) * .1;
		else if (cam16.Q !== void 0) Jroot = .25 * env.c * cam16.Q / ((env.aW + 4) * env.flRoot);
		let alpha = 0;
		if (cam16.C !== void 0) alpha = cam16.C / Jroot;
		else if (cam16.M !== void 0) alpha = cam16.M / env.flRoot / Jroot;
		else if (cam16.s !== void 0) alpha = 4e-4 * cam16.s ** 2 * (env.aW + 4) / env.c;
		const t = spow(alpha * Math.pow(1.64 - Math.pow(.29, env.n), -.73), 10 / 9);
		const et = .25 * (Math.cos(hRad + 2) + 3.8);
		const A = env.aW * spow(Jroot, 2 / env.c / env.z);
		const p1 = 5e4 / 13 * env.nc * env.ncb * et;
		const p2 = A / env.nbb;
		const r = 23 * (p2 + .305) * zdiv(t, 23 * p1 + t * (11 * cosh + 108 * sinh));
		const a = r * cosh;
		const b = r * sinh;
		const rgb_c = unadapt(multiply_v3_m3x3([
			p2,
			a,
			b
		], M$2.m1).map((c) => {
			return c * 1 / 1403;
		}), env.fl);
		return multiply_v3_m3x3(rgb_c.map((c, i) => {
			return c * env.dRgbInv[i];
		}), M$2.cat16Inv).map((c) => {
			return c / 100;
		});
	}
	/**
	* @param {[number, number, number]} xyzd65
	* @param {Cam16Environment} env
	* @returns {Cam16Object}
	*/
	function toCam16(xyzd65, env) {
		const xyz100 = xyzd65.map((c) => {
			return c * 100;
		});
		const rgbA = adapt(multiply_v3_m3x3(xyz100, M$2.cat16).map((c, i) => {
			return c * env.dRgb[i];
		}), env.fl);
		const a = rgbA[0] + (-12 * rgbA[1] + rgbA[2]) / 11;
		const b = (rgbA[0] + rgbA[1] - 2 * rgbA[2]) / 9;
		const hRad = (Math.atan2(b, a) % tau + tau) % tau;
		const et = .25 * (Math.cos(hRad + 2) + 3.8);
		const t = 5e4 / 13 * env.nc * env.ncb * zdiv(et * Math.sqrt(a ** 2 + b ** 2), rgbA[0] + rgbA[1] + 1.05 * rgbA[2] + .305);
		const alpha = spow(t, .9) * Math.pow(1.64 - Math.pow(.29, env.n), .73);
		const A = env.nbb * (2 * rgbA[0] + rgbA[1] + .05 * rgbA[2]);
		const Jroot = spow(A / env.aW, .5 * env.c * env.z);
		const J = 100 * spow(Jroot, 2);
		const Q = 4 / env.c * Jroot * (env.aW + 4) * env.flRoot;
		const C = alpha * Jroot;
		const colorfulness = C * env.flRoot;
		const h = constrain(hRad * rad2deg);
		const H = hueQuadrature(h);
		return {
			J,
			C,
			h,
			s: 50 * spow(env.c * alpha / (env.aW + 4), 1 / 2),
			Q,
			M: colorfulness,
			H
		};
	}
	var cam16_default = new ColorSpace({
		id: "cam16-jmh",
		cssId: "--cam16-jmh",
		name: "CAM16-JMh",
		coords: {
			j: {
				refRange: [0, 100],
				name: "J"
			},
			m: {
				refRange: [0, 105],
				name: "Colorfulness"
			},
			h: {
				refRange: [0, 360],
				type: "angle",
				name: "Hue"
			}
		},
		base: xyz_d65_default,
		M: M$2,
		fromBase(xyz) {
			if (this.ε === void 0) this.ε = Object.values(this.coords)[1].refRange[1] / 1e5;
			const cam16 = toCam16(xyz, viewingConditions$1);
			const isAchromatic = Math.abs(cam16.M) < this.ε;
			return [
				cam16.J,
				isAchromatic ? 0 : cam16.M,
				isAchromatic ? null : cam16.h
			];
		},
		toBase(cam16) {
			return fromCam16({
				J: cam16[0],
				M: cam16[1],
				h: cam16[2]
			}, viewingConditions$1);
		}
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/hct.js
	const white = WHITES.D65;
	const ε = 216 / 24389;
	const κ = 24389 / 27;
	function toLstar(y) {
		return 116 * (y > ε ? Math.cbrt(y) : (κ * y + 16) / 116) - 16;
	}
	function fromLstar(lstar) {
		return lstar > 8 ? Math.pow((lstar + 16) / 116, 3) : lstar / κ;
	}
	function fromHct(coords, env) {
		let [h, c, t] = coords;
		let xyz = [];
		let j = 0;
		if (t === 0) return [
			0,
			0,
			0
		];
		let y = fromLstar(t);
		if (t > 0) j = .00379058511492914 * t ** 2 + .608983189401032 * t + .9155088574762233;
		else j = 9514440756550361e-21 * t ** 2 + .08693057439788597 * t - 21.928975842194614;
		const threshold = 2e-12;
		const max_attempts = 15;
		let attempt = 0;
		let last = Infinity;
		let best = [
			0,
			0,
			0
		];
		while (attempt <= max_attempts) {
			xyz = fromCam16({
				J: j,
				C: c,
				h
			}, env);
			const delta = Math.abs(xyz[1] - y);
			if (delta < last) {
				if (delta <= threshold) return xyz;
				best = xyz;
				last = delta;
			}
			j = j - (xyz[1] - y) * j / (2 * xyz[1]);
			attempt += 1;
		}
		return best;
	}
	function toHct(xyz, env) {
		const t = toLstar(xyz[1]);
		if (t === 0) return [
			0,
			0,
			0
		];
		const cam16 = toCam16(xyz, viewingConditions);
		return [
			constrain(cam16.h),
			cam16.C,
			t
		];
	}
	const viewingConditions = environment(white, 200 / Math.PI * fromLstar(50), fromLstar(50) * 100, "average", false);
	var hct_default = new ColorSpace({
		id: "hct",
		name: "HCT",
		coords: {
			h: {
				refRange: [0, 360],
				type: "angle",
				name: "Hue"
			},
			c: {
				refRange: [0, 145],
				name: "Colorfulness"
			},
			t: {
				refRange: [0, 100],
				name: "Tone"
			}
		},
		base: xyz_d65_default,
		fromBase(xyz) {
			if (this.ε === void 0) this.ε = Object.values(this.coords)[1].refRange[1] / 1e5;
			let hct = toHct(xyz, viewingConditions);
			if (hct[1] < this.ε) {
				hct[1] = 0;
				hct[0] = null;
			}
			return hct;
		},
		toBase(hct) {
			return fromHct(hct, viewingConditions);
		},
		formats: { color: {
			id: "--hct",
			coords: [
				"<number> | <angle>",
				"<percentage> | <number>",
				"<percentage> | <number>"
			]
		} }
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/deltaEHCT.js
	const deg2rad = Math.PI / 180;
	const ucsCoeff = [
		1,
		.007,
		.0228
	];
	/**
	* Convert HCT chroma and hue (CAM16 JMh colorfulness and hue) using UCS logic for a and b.
	* @param {Coords} coords - HCT coordinates.
	* @return {number[]}
	*/
	function convertUcsAb(coords) {
		if (coords[1] < 0) coords = hct_default.fromBase(hct_default.toBase(coords));
		const M = Math.log(Math.max(1 + ucsCoeff[2] * coords[1] * viewingConditions.flRoot, 1)) / ucsCoeff[2];
		const hrad = coords[0] * deg2rad;
		const a = M * Math.cos(hrad);
		const b = M * Math.sin(hrad);
		return [
			coords[2],
			a,
			b
		];
	}
	/**
	* Color distance using HCT.
	* @param {import("../types.js").ColorTypes} color
	* @param {import("../types.js").ColorTypes} sample
	* @returns {number}
	*/
	function deltaEHCT_default(color, sample) {
		[color, sample] = getColor([color, sample]);
		let [t1, a1, b1] = convertUcsAb(hct_default.from(color));
		let [t2, a2, b2] = convertUcsAb(hct_default.from(sample));
		return Math.sqrt((t1 - t2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/helmlab.js
/**
	* Helmlab MetricSpace — 13-stage perceptual color space.
	*
	* A data-driven analytical color space fit on COMBVD (3,813 paired human
	* color-difference judgments aggregating BFD-P, Witt 1999, RIT-DuPont, and
	* Leeds). Used internally by `deltaEHelmlab` and exposed as the CSS
	* color space `helmlab-metric` for inspectability. Its coordinate system
	* (asymmetric ab plane, L > 1 from H-K modeling, achromatic axis offset
	* from origin) is shaped for ΔE accuracy rather than author-facing
	* coordinates — for general CSS authoring use HelmGen (`helmgen`).
	*
	* Measured in this branch: ~24% lower STRESS than CIEDE2000 on COMBVD.
	*
	* Pipeline: XYZ → M1 → γ → M2 → hue correction → H-K → cubic L → dark L
	*   → hue-dep chroma scale → chroma power → L-dep chroma scale
	*   → HLC interaction → hue-dep lightness → rotation
	*
	* Reference: arXiv:2602.23010
	* @see https://github.com/Grkmyldz148/helmlab
	*/
	/** @import { Matrix3x3 } from "../types.js" */
	const { cos, sin, sqrt, atan2, exp, abs, pow, PI } = Math;
	/** Bradford CAT: Color.js D65 → Helmlab D65 (apply in fromBase before M1) */
	/** @type {Matrix3x3} */
	const CAT_TO_HELM = [
		[
			1.000042977349746,
			20718877053183e-18,
			-4361018085669474e-20
		],
		[
			26946201090235744e-21,
			.9999906145080147,
			-14898828405401079e-21
		],
		[
			-7941753620756204e-21,
			12875204405137254e-21,
			.9997859822609763
		]
	];
	/** Bradford CAT: Helmlab D65 → Color.js D65 (apply in toBase after M1_INV) */
	/** @type {Matrix3x3} */
	const CAT_FROM_HELM = [
		[
			.9999570254019492,
			-2071874272730964e-20,
			4361733292468361e-20
		],
		[
			-2694517763358666e-20,
			1.000009385946497,
			1490098223546482e-20
		],
		[
			7943459292954202e-21,
			-1287824596735154e-20,
			1.000214063706999
		]
	];
	/** @type {Matrix3x3} */
	const M1 = [
		[
			.7212986433113499,
			.45344826541531813,
			-.19288975751942616
		],
		[
			-.788211869495579,
			1.795241376757236,
			.0876172451181785
		],
		[
			-.0917700599912156,
			.45765588659459255,
			1.2922045513917677
		]
	];
	/** @type {Matrix3x3} */
	const M1_INV = [
		[
			1.065107295808859,
			-.3150044075301121,
			.1803492381741039
		],
		[
			.4721107713837796,
			.4271995765962455,
			.04150680489380985
		],
		[
			-.09156391926309541,
			-.1736709363194979,
			.7719790382558294
		]
	];
	const GAMMA = [
		.47229813098762524,
		.5149184096354483,
		.5113233386366979
	];
	const INV_GAMMA = [
		2.1173067060606283,
		1.9420552485353544,
		1.9557096741686448
	];
	/** @type {Matrix3x3} */
	const M2 = [
		[
			-.26355622180094096,
			.4168322883703174,
			.4926763141656403
		],
		[
			1.8897570508777322,
			-3.1212232034205774,
			1.0421666921060384
		],
		[
			.3585108617962056,
			1.7694028193790368,
			-1.4120626067695372
		]
	];
	/** @type {Matrix3x3} */
	const M2_INV = [
		[
			.9183897822815021,
			.5232051237088666,
			.7065804598090856
		],
		[
			1.0899090574433026,
			.07005324849041904,
			.4319776874787044
		],
		[
			1.598895729264209,
			.22061850068770233,
			.012506037355220951
		]
	];
	/** Matrices used by this color space, also available as `Helmlab.M` */
	const M$1 = {
		CAT_TO_HELM,
		CAT_FROM_HELM,
		M1,
		M1_INV,
		M2,
		M2_INV
	};
	const hue_cos1 = -.02833024015436984;
	const hue_sin1 = -.21131429516166544;
	const hue_cos2 = .2189784817615645;
	const hue_sin2 = -.06871898981942523;
	const hue_cos3 = .005506053349515315;
	const hue_sin3 = -.0641329861299175;
	const hue_cos4 = -.053592461436994296;
	const hue_sin4 = -.00954137464208059;
	const hk_weight = .2676231133101982;
	const hk_power = .8934892185255707;
	const hk_hue_mod = .7173169828841472;
	const hk_sin1 = .6915224124600773;
	const hk_cos2 = .48647127559605596;
	const hk_sin2 = .9853124591201782;
	const L_corr_p1 = .5385456675962418;
	const L_corr_p2 = .12508858146241716;
	const L_corr_p3 = .6768950256217603;
	const Lh_cos1 = -.4963251525324449;
	const Lh_sin1 = -.09564696283240552;
	const lp_dark = -.029053748937210654;
	const lp_dark_hcos = 1.3346761652952872;
	const lp_dark_hsin = -.1698908144723919;
	const cs_cos1 = -.195370576218515;
	const cs_sin1 = .5330819227283227;
	const cs_cos2 = .08863325582067766;
	const cs_sin2 = .9365540137751136;
	const cs_cos3 = .13789738139719568;
	const cs_sin3 = .061650260197979936;
	const cs_cos4 = .0641970862504494;
	const cs_sin4 = -.027401052793571013;
	const cp_cos1 = -.09900209889026965;
	const cp_sin1 = .059635520647228726;
	const cp_cos2 = -.013586499967803128;
	const cp_sin2 = .2253393118474472;
	const lc1 = -1.5239477450767043;
	const lc2 = -1.751157310240011;
	const hlc_cos1 = -.43576378069144767;
	const hlc_sin1 = 1.060094063845983;
	const hlc_cos2 = .47931193034584496;
	const hlc_sin2 = -.2622579649434462;
	const hl_cos1 = .13610794232685908;
	const hl_sin1 = .1168702235362288;
	const hl_cos2 = -.01617739641422492;
	const hl_sin2 = .038145638815030566;
	const PHI = -28.2 * PI / 180;
	const ROT_COS = cos(PHI);
	const ROT_SIN = sin(PHI);
	function hueDelta(h) {
		return hue_cos1 * cos(h) + hue_sin1 * sin(h) + hue_cos2 * cos(2 * h) + hue_sin2 * sin(2 * h) + hue_cos3 * cos(3 * h) + hue_sin3 * sin(3 * h) + hue_cos4 * cos(4 * h) + hue_sin4 * sin(4 * h);
	}
	function hueDeltaDeriv(h) {
		return .02833024015436984 * sin(h) + hue_sin1 * cos(h) + -2 * hue_cos2 * sin(2 * h) + 2 * hue_sin2 * cos(2 * h) + -3 * hue_cos3 * sin(3 * h) + 3 * hue_sin3 * cos(3 * h) + -4 * hue_cos4 * sin(4 * h) + 4 * hue_sin4 * cos(4 * h);
	}
	function chromaScaleH(h) {
		let logS = cs_cos1 * cos(h) + cs_sin1 * sin(h) + cs_cos2 * cos(2 * h) + cs_sin2 * sin(2 * h) + cs_cos3 * cos(3 * h) + cs_sin3 * sin(3 * h) + cs_cos4 * cos(4 * h) + cs_sin4 * sin(4 * h);
		return exp(logS);
	}
	function lChromaScale(L) {
		let dL = L - .5;
		return exp(clamp(-30, lc1 * dL + lc2 * dL * dL, 30));
	}
	function hlcScale(h, L) {
		let hueFactor = hlc_cos1 * cos(h) + hlc_sin1 * sin(h) + hlc_cos2 * cos(2 * h) + hlc_sin2 * sin(2 * h);
		return exp(clamp(-30, (L - .5) * hueFactor, 30));
	}
	function hueLightnessScale(h) {
		let logS = hl_cos1 * cos(h) + hl_sin1 * sin(h) + hl_cos2 * cos(2 * h) + hl_sin2 * sin(2 * h);
		return exp(logS);
	}
	function chromaPowerH(h) {
		return 1 + cp_cos1 * cos(h) + cp_sin1 * sin(h) + cp_cos2 * cos(2 * h) + cp_sin2 * sin(2 * h);
	}
	function lCorrectFwd(L, h) {
		let t = L * (1 - L);
		let result = L + L_corr_p1 * t + L_corr_p2 * t * (.5 - L) + L_corr_p3 * t * t;
		result += t * (Lh_cos1 * cos(h) + Lh_sin1 * sin(h));
		return result;
	}
	function lCorrectInv(L1, h) {
		let Lh = Lh_cos1 * cos(h) + Lh_sin1 * sin(h);
		let L = L1;
		for (let i = 0; i < 15; i++) {
			let t = L * (1 - L);
			let dt = 1 - 2 * L;
			let f = L + (L_corr_p1 + Lh) * t + L_corr_p2 * t * (.5 - L) + L_corr_p3 * t * t - L1;
			let dfdL = 1 + (L_corr_p1 + Lh) * dt + L_corr_p2 * (dt * (.5 - L) - t) + L_corr_p3 * 2 * t * dt;
			if (abs(dfdL) < 1e-10) dfdL = 1;
			L -= f / dfdL;
		}
		return L;
	}
	function darkLFwd(L, h) {
		let coeff = lp_dark + lp_dark_hcos * cos(h) + lp_dark_hsin * sin(h);
		let oml = L < 1 ? 1 - L : 0;
		let g = coeff * L * oml * oml;
		return L * exp(clamp(-30, g, 30));
	}
	function darkLInv(Ln, h) {
		let coeff = lp_dark + lp_dark_hcos * cos(h) + lp_dark_hsin * sin(h);
		let L = Ln;
		for (let i = 0; i < 12; i++) {
			let oml = L < 1 ? 1 - L : 0;
			let g = coeff * L * oml * oml;
			let eg = exp(clamp(-30, g, 30));
			let f = L * eg - Ln;
			let gp = coeff * oml * (1 - 3 * L);
			let fp = eg * (1 + L * gp);
			if (abs(fp) < 1e-10) fp = 1;
			L -= f / fp;
		}
		return L;
	}
	const fromXYZ = function(xyz) {
		let adapted = multiply_v3_m3x3(xyz, M$1.CAT_TO_HELM);
		let [lms0, lms1, lms2] = multiply_v3_m3x3(adapted, M$1.M1);
		let c0 = spow(lms0, GAMMA[0]);
		let c1 = spow(lms1, GAMMA[1]);
		let c2 = spow(lms2, GAMMA[2]);
		let [L, a, b] = multiply_v3_m3x3([
			c0,
			c1,
			c2
		], M$1.M2);
		let h = atan2(b, a);
		let C = sqrt(a * a + b * b);
		let delta = hueDelta(h);
		let hNew = h + delta;
		a = C * cos(hNew);
		b = C * sin(hNew);
		let Cr = sqrt(a * a + b * b);
		let hkBoost = hk_weight * pow(Cr, clamp(.01, hk_power, 10));
		let hr = atan2(b, a);
		let factor = 1 + hk_hue_mod * cos(hr) + hk_sin1 * sin(hr) + hk_cos2 * cos(2 * hr) + hk_sin2 * sin(2 * hr);
		L += hkBoost * factor;
		h = atan2(b, a);
		L = lCorrectFwd(L, h);
		h = atan2(b, a);
		L = darkLFwd(L, h);
		h = atan2(b, a);
		let cs = chromaScaleH(h);
		a *= cs;
		b *= cs;
		h = atan2(b, a);
		C = sqrt(a * a + b * b);
		let p = chromaPowerH(h);
		let Cn = C > 0 ? pow(C, p) : 0;
		a = Cn * cos(h);
		b = Cn * sin(h);
		let T = lChromaScale(L);
		a *= T;
		b *= T;
		h = atan2(b, a);
		let hlcS = hlcScale(h, L);
		a *= hlcS;
		b *= hlcS;
		h = atan2(b, a);
		L *= hueLightnessScale(h);
		let aRot = a * ROT_COS - b * ROT_SIN;
		let bRot = a * ROT_SIN + b * ROT_COS;
		return [
			L,
			aRot,
			bRot
		];
	};
	const toXYZ = function(lab) {
		let [L, a, b] = lab;
		let aUn = a * ROT_COS + b * ROT_SIN;
		let bUn = -a * ROT_SIN + b * ROT_COS;
		a = aUn;
		b = bUn;
		let h = atan2(b, a);
		L /= hueLightnessScale(h);
		h = atan2(b, a);
		let hlcS = hlcScale(h, L);
		a /= hlcS;
		b /= hlcS;
		let T = lChromaScale(L);
		a /= T;
		b /= T;
		h = atan2(b, a);
		let C = sqrt(a * a + b * b);
		let p = chromaPowerH(h);
		let Co = C > 0 ? pow(C, 1 / p) : 0;
		a = Co * cos(h);
		b = Co * sin(h);
		h = atan2(b, a);
		let cs = chromaScaleH(h);
		a /= cs;
		b /= cs;
		h = atan2(b, a);
		L = darkLInv(L, h);
		h = atan2(b, a);
		L = lCorrectInv(L, h);
		let Cr = sqrt(a * a + b * b);
		let hkBoost = hk_weight * pow(Cr, clamp(.01, hk_power, 10));
		let hr = atan2(b, a);
		let factor = 1 + hk_hue_mod * cos(hr) + hk_sin1 * sin(hr) + hk_cos2 * cos(2 * hr) + hk_sin2 * sin(2 * hr);
		L -= hkBoost * factor;
		let hOut = atan2(b, a);
		C = sqrt(a * a + b * b);
		let hRaw = hOut;
		for (let i = 0; i < 8; i++) {
			let f = hRaw + hueDelta(hRaw) - hOut;
			let fp = 1 + hueDeltaDeriv(hRaw);
			if (abs(fp) < 1e-10) fp = 1;
			hRaw -= f / fp;
		}
		a = C * cos(hRaw);
		b = C * sin(hRaw);
		let [lc0, lc1, lc2] = multiply_v3_m3x3([
			L,
			a,
			b
		], M$1.M2_INV);
		let l0 = spow(lc0, INV_GAMMA[0]);
		let l1 = spow(lc1, INV_GAMMA[1]);
		let l2 = spow(lc2, INV_GAMMA[2]);
		let xyz = multiply_v3_m3x3([
			l0,
			l1,
			l2
		], M$1.M1_INV);
		return multiply_v3_m3x3(xyz, M$1.CAT_FROM_HELM);
	};
	var helmlab_default = new ColorSpace({
		id: "helmlab-metric",
		name: "Helmlab MetricSpace",
		cssId: "--helmlab-metric",
		coords: {
			l: {
				refRange: [0, 1.6],
				name: "Lightness"
			},
			a: { refRange: [-1.5, 1.5] },
			b: { refRange: [-1.5, 1.5] }
		},
		white: "D65",
		base: xyz_d65_default,
		M: M$1,
		fromBase(xyz) {
			return fromXYZ(xyz);
		},
		toBase(lab) {
			return toXYZ(lab);
		}
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/deltaEHelmlab.js
	const sl = -.9155125151657894;
	const sc = 2.9268353744941558;
	const wC = 3.966003089807536;
	const p = 1.9737081170404969;
	const compress = 52.473130649294724;
	const q = .47897301074925214;
	/**
	* @param {import("../types.js").ColorTypes} color
	* @param {import("../types.js").ColorTypes} sample
	* @returns {number}
	*/
	function deltaEHelmlab_default(color, sample) {
		[color, sample] = getColor([color, sample]);
		let [L1, a1, b1] = helmlab_default.from(color);
		let [L2, a2, b2] = helmlab_default.from(sample);
		let ΔL = L1 - L2;
		let Δa = a1 - a2;
		let Δb = b1 - b2;
		let Lavg = (L1 + L2) * .5;
		let SL = 1 + sl * (Lavg - .5) ** 2;
		let Cavg = (Math.sqrt(a1 ** 2 + b1 ** 2) + Math.sqrt(a2 ** 2 + b2 ** 2)) * .5;
		let SC = 1 + sc * Cavg;
		let raw = (ΔL ** 2 / SL ** 2 + wC * (Δa ** 2 + Δb ** 2) / SC ** 2) ** (p / 2);
		return (raw / (1 + compress * raw)) ** q;
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/deltaE/index.js
/**
	* @packageDocumentation
	* This module defines all the builtin deltaE methods.
	*/
	var deltaE_default = {
		deltaE76,
		deltaECMC: deltaECMC_default,
		deltaE2000: deltaE2000_default,
		deltaEJz: deltaEJz_default,
		deltaEITP: deltaEITP_default,
		deltaEOK: deltaEOK_default,
		deltaEOK2: deltaEOK2_default,
		deltaEHCT: deltaEHCT_default,
		deltaEHelmlab: deltaEHelmlab_default
	};
	/** @typedef {keyof typeof import("./index.js").default extends `deltaE${infer Method}` ? Method : string} Methods */

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/toGamut.js
/** @import { ColorTypes, PlainColorObject } from "./types.js" */
	/** @typedef {import("./types.js").ToGamutOptions} ToGamutOptions */
	/**
	* Calculate the epsilon to 2 degrees smaller than the specified JND.
	* @param {number} jnd The target "just noticeable difference".
	* @returns {number}
	*/
	function calcEpsilon(jnd) {
		return Math.max(parseFloat(`1e${(!jnd ? 0 : Math.floor(Math.log10(Math.abs(jnd)))) - 2}`), 1e-6);
	}
	const GMAPPRESET = {
		hct: {
			method: "hct.c",
			jnd: 2,
			deltaEMethod: "hct",
			blackWhiteClamp: {}
		},
		"hct-tonal": {
			method: "hct.c",
			jnd: 0,
			deltaEMethod: "hct",
			blackWhiteClamp: {
				channel: "hct.t",
				min: 0,
				max: 100
			}
		}
	};
	/**
	* Force coordinates to be in gamut of a certain color space.
	* Mutates the color it is passed.
	* @overload
	* @param {ColorTypes} color
	* @param {ToGamutOptions} [options]
	* @returns {PlainColorObject}
	*/
	/**
	* @overload
	* @param {ColorTypes} color
	* @param {string} [space]
	* @returns {PlainColorObject}
	*/
	/**
	* @param {ColorTypes} color
	* @param {string & Partial<ToGamutOptions> | ToGamutOptions} [space]
	* @returns {PlainColorObject}
	*/
	function toGamut(color, { method = defaults_default.gamut_mapping, space = void 0, deltaEMethod = "", jnd = 2, blackWhiteClamp = void 0 } = {}) {
		color = getColor(color);
		if (isString(arguments[1])) space = arguments[1];
		else if (!space) space = color.space;
		space = ColorSpace.get(space);
		if (inGamut(color, space, { epsilon: 0 })) return color;
		let spaceColor;
		if (method === "css") spaceColor = toGamutCSS(color, { space });
		else if (method === "raytrace") spaceColor = toGamutRayTrace(color, { space });
		else {
			if (method !== "clip") {
				if (Object.prototype.hasOwnProperty.call(GMAPPRESET, method)) ({method, jnd, deltaEMethod, blackWhiteClamp} = GMAPPRESET[method]);
				let de = deltaE2000_default;
				if (deltaEMethod !== "") {
					for (let m in deltaE_default) if ("deltae" + deltaEMethod.toLowerCase() === m.toLowerCase()) {
						de = deltaE_default[m];
						break;
					}
				}
				if (jnd === 0) jnd = 1e-16;
				let clipped = toGamut(to(color, space), {
					method: "clip",
					space
				});
				if (de(color, clipped) > jnd) {
					if (blackWhiteClamp && Object.keys(blackWhiteClamp).length === 3) {
						let channelMeta = ColorSpace.resolveCoord(blackWhiteClamp.channel);
						let channel = get(to(color, channelMeta.space), channelMeta.id);
						if (isNone(channel)) channel = 0;
						if (channel >= blackWhiteClamp.max) return to({
							space: "xyz-d65",
							coords: WHITES["D65"]
						}, color.space);
						else if (channel <= blackWhiteClamp.min) return to({
							space: "xyz-d65",
							coords: [
								0,
								0,
								0
							]
						}, color.space);
					}
					let coordMeta = ColorSpace.resolveCoord(method);
					let mapSpace = coordMeta.space;
					let coordId = coordMeta.id;
					let mappedColor = to(color, mapSpace);
					mappedColor.coords.forEach((c, i) => {
						if (isNone(c)) mappedColor.coords[i] = 0;
					});
					let min = (coordMeta.range || coordMeta.refRange)[0];
					let ε = calcEpsilon(jnd);
					let low = min;
					let high = get(mappedColor, coordId);
					while (high - low > ε) {
						let clipped = clone(mappedColor);
						clipped = toGamut(clipped, {
							space,
							method: "clip"
						});
						if (de(mappedColor, clipped) - jnd < ε) low = get(mappedColor, coordId);
						else high = get(mappedColor, coordId);
						set(mappedColor, coordId, (low + high) / 2);
					}
					spaceColor = to(mappedColor, space);
				} else spaceColor = clipped;
			} else spaceColor = to(color, space);
			if (method === "clip" || !inGamut(spaceColor, space, { epsilon: 0 })) {
				let bounds = Object.values(space.coords).map((c) => c.range || []);
				spaceColor.coords = spaceColor.coords.map((c, i) => {
					let [min, max] = bounds[i];
					if (min !== void 0) c = Math.max(min, c);
					if (max !== void 0) c = Math.min(c, max);
					return c;
				});
			}
		}
		if (space !== color.space) spaceColor = to(spaceColor, color.space);
		color.coords = spaceColor.coords;
		return color;
	}
	/** @type {"color"} */
	toGamut.returns = "color";
	/**
	* The reference colors to be used if lightness is out of the range 0-1 in the
	* `Oklch` space. These are created in the `Oklab` space, as it is used by the
	* DeltaEOK calculation, so it is guaranteed to be imported.
	* @satisfies {Record<string, ColorTypes>}
	*/
	const COLORS = {
		WHITE: {
			space: oklab_default,
			coords: [
				1,
				0,
				0
			],
			alpha: 1
		},
		BLACK: {
			space: oklab_default,
			coords: [
				0,
				0,
				0
			],
			alpha: 1
		}
	};
	/**
	* Given a color `origin`, returns a new color that is in gamut using
	* the CSS Gamut Mapping Algorithm. If `space` is specified, it will be in gamut
	* in `space`, and returned in `space`. Otherwise, it will be in gamut and
	* returned in the color space of `origin`.
	* @param {ColorTypes} origin
	* @param {{ space?: string | ColorSpace | undefined }} options
	* @returns {PlainColorObject}
	*/
	function toGamutCSS(origin, { space } = {}) {
		const JND = .02;
		const ε = 1e-4;
		origin = getColor(origin);
		if (!space) space = origin.space;
		space = ColorSpace.get(space);
		if (space.isUnbounded) return to(origin, space);
		const origin_OKLCH = to(origin, oklch_default);
		let L = origin_OKLCH.coords[0];
		if (L >= 1) {
			const white = to(COLORS.WHITE, space);
			white.alpha = origin.alpha;
			return to(white, space);
		}
		if (L <= 0) {
			const black = to(COLORS.BLACK, space);
			black.alpha = origin.alpha;
			return to(black, space);
		}
		if (inGamut(origin_OKLCH, space, { epsilon: 0 })) return to(origin_OKLCH, space);
		function clip(_color) {
			const destColor = to(_color, space);
			const spaceCoords = Object.values(
				/** @type {ColorSpace} */
				space.coords
			);
			destColor.coords = destColor.coords.map((coord, index) => {
				if ("range" in spaceCoords[index]) {
					const [min, max] = spaceCoords[index].range;
					return clamp(min, coord, max);
				}
				return coord;
			});
			return destColor;
		}
		let min = 0;
		let max = origin_OKLCH.coords[1];
		let min_inGamut = true;
		let current = clone(origin_OKLCH);
		let clipped = clip(current);
		let E = deltaEOK_default(clipped, current);
		if (E < JND) return clipped;
		while (max - min > ε) {
			const chroma = (min + max) / 2;
			current.coords[1] = chroma;
			if (min_inGamut && inGamut(current, space, { epsilon: 0 })) min = chroma;
			else {
				clipped = clip(current);
				E = deltaEOK_default(clipped, current);
				if (E < JND) {
					if (JND - E < ε) break;
					else {
						min_inGamut = false;
						min = chroma;
					}
				} else max = chroma;
			}
		}
		return clipped;
	}
	/**
	* Given `start` and `end` coordinates of a 3D ray and a `bmin` and `bmax` bounding box,
	* find the intersection of the ray and box. Return an empty list if no intersect is found.`
	* @param {[number, number, number]} start
	* @param {[number, number, number]} end
	* @param {[number, number, number]} bmin
	* @param {[number, number, number]} bmax
	* @returns {[number, number, number] | []}
	*/
	function raytrace_box(start, end, bmin = [
		0,
		0,
		0
	], bmax = [
		1,
		1,
		1
	]) {
		let tfar = Infinity;
		let tnear = -Infinity;
		let direction = [];
		for (let i = 0; i < 3; i++) {
			const a = start[i];
			const d = end[i] - a;
			const bn = bmin[i];
			const bx = bmax[i];
			direction.push(d);
			if (Math.abs(d) > 1e-12) {
				const inv_d = 1 / d;
				const t1 = (bn - a) * inv_d;
				const t2 = (bx - a) * inv_d;
				tnear = Math.max(Math.min(t1, t2), tnear);
				tfar = Math.min(Math.max(t1, t2), tfar);
			} else if (a < bn || a > bx) return [];
		}
		if (tnear > tfar || tfar < 0) return [];
		if (tnear < 0) tnear = tfar;
		if (!isFinite(tnear)) return [];
		return [
			start[0] + direction[0] * tnear,
			start[1] + direction[1] * tnear,
			start[2] + direction[2] * tnear
		];
	}
	/**
	* Given a color `origin`, returns a new color that is in gamut using
	* the CSS Ray Trace Gamut Mapping Algorithm. If `space` is specified,
	* it will be in gamut `space`, and returned in `space`. Otherwise,
	* it will be in gamut and returned in the color space of `origin`.
	* @param {ColorTypes} origin
	* @param {{ space?: string | ColorSpace | undefined }} options
	* @returns {PlainColorObject}
	*/
	function toGamutRayTrace(origin, { space } = {}) {
		origin = getColor(origin);
		if (!space) space = origin.space;
		space = ColorSpace.get(space);
		if (space.isUnbounded) return to(origin, space);
		let oklchOrigin = to(origin, oklch_default);
		let [lightness, chroma, hue] = oklchOrigin.coords;
		if (lightness >= 1) {
			const white = to(COLORS.WHITE, space);
			white.alpha = origin.alpha;
			return to(white, space);
		} else if (lightness <= 0) {
			const black = to(COLORS.BLACK, space);
			black.alpha = origin.alpha;
			return to(black, space);
		}
		const originSpace = space;
		const rGamut = space.rgbGamut;
		if (rGamut !== void 0) space = rGamut;
		if (!isInstance(space, RGBColorSpace)) throw Error("An RGB gamut is required");
		let [mn, mx] = Object.values(space.coords)[0].range;
		let max = [
			mx,
			mx,
			mx
		];
		const lGamut = space.linearGamut;
		if (lGamut !== void 0) {
			mx = to({
				space,
				coords: max,
				alpha: origin.alpha
			}, lGamut).coords[0];
			max = [
				mx,
				mx,
				mx
			];
			space = lGamut;
			mn = Object.values(space.coords)[0].range[0];
		}
		let min = [
			mn,
			mn,
			mn
		];
		let rgbOrigin = to(oklchOrigin, space);
		if (!rgbOrigin.coords.every((x) => mn <= x && x <= mx)) {
			let anchor = to({
				space: oklch_default,
				coords: [
					lightness,
					0,
					hue
				]
			}, space).coords;
			const low = mn + 1e-12;
			const high = mx - 1e-12;
			let last = rgbOrigin.coords;
			for (let i = 0; i < 4; i++) {
				if (i) {
					const oklchColor = to(rgbOrigin, oklch_default);
					oklchColor.coords[0] = lightness;
					oklchColor.coords[2] = hue;
					rgbOrigin = to(oklchColor, space);
				}
				const intersection = raytrace_box(anchor, rgbOrigin.coords, min, max);
				if (intersection.length === 0) {
					rgbOrigin.coords = [...last];
					break;
				}
				if (i && rgbOrigin.coords.every((x) => low < x && x < high)) anchor = [...rgbOrigin.coords];
				last = intersection;
				rgbOrigin.coords = [...intersection];
			}
		}
		rgbOrigin = to(rgbOrigin, originSpace);
		const spaceCoords = Object.values(
			/** @type {ColorSpace} */
			originSpace.coords
		);
		rgbOrigin.coords = rgbOrigin.coords.map((coord, index) => {
			if ("range" in spaceCoords[index]) {
				const [lower, upper] = spaceCoords[index].range;
				return clamp(lower, coord, upper);
			}
			return coord;
		});
		return rgbOrigin;
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/serialize.js
/** @import { ColorTypes, ParseOptions, PlainColorObject } from "./types.js" */
	/** @typedef {import("./types.js").SerializeOptions} SerializeOptions */
	/**
	* Generic toString() method, outputs a color(spaceId ...coords) function, a functional syntax, or custom formats defined by the color space
	* @param {ColorTypes} color
	* @param {SerializeOptions & Record<string, any>} options
	* @returns {string}
	*/
	function serialize(color, options = {}) {
		let { precision = defaults_default.precision, format, inGamut: inGamut$1 = true, coords: coordFormat, alpha: alphaFormat, commas } = options;
		let ret;
		let colorWithMeta = getColor(color);
		let formatId = format;
		let parseMeta = colorWithMeta.parseMeta;
		if (parseMeta && !format) {
			if (parseMeta.format.canSerialize()) {
				format = parseMeta.format;
				formatId = parseMeta.formatId;
			}
			coordFormat ??= parseMeta.types;
			alphaFormat ??= parseMeta.alphaType;
			commas ??= parseMeta.commas;
		}
		if (formatId) format = colorWithMeta.space.getFormat(format) ?? ColorSpace.findFormat(formatId);
		if (!format) {
			format = colorWithMeta.space.getFormat("default") ?? ColorSpace.DEFAULT_FORMAT;
			formatId = format.name;
		}
		if (format && format.space && format.space !== colorWithMeta.space) colorWithMeta = to(colorWithMeta, format.space);
		let coords = colorWithMeta.coords.slice();
		inGamut$1 ||= format.toGamut;
		if (inGamut$1 && !inGamut(colorWithMeta)) coords = toGamut(clone(colorWithMeta), inGamut$1 === true ? void 0 : inGamut$1).coords;
		if (format.type === "custom") {
			if (format.serialize) ret = format.serialize(coords, colorWithMeta.alpha, options);
			else throw new TypeError(`format ${formatId} can only be used to parse colors, not for serialization`);
		} else {
			let name = format.name || "color";
			let args = format.serializeCoords(coords, precision, coordFormat);
			if (name === "color") {
				let cssId = format.id || format.ids?.[0] || colorWithMeta.space.cssId || colorWithMeta.space.id;
				args.unshift(cssId);
			}
			/** @type {string | number} */
			let alpha = colorWithMeta.alpha;
			if (alphaFormat !== void 0 && !(typeof alphaFormat === "object")) alphaFormat = typeof alphaFormat === "string" ? { type: alphaFormat } : { include: alphaFormat };
			let alphaType = alphaFormat?.type ?? "<number>";
			let serializeAlpha = alphaFormat?.include === true || format.alpha === true || alphaFormat?.include !== false && format.alpha !== false && alpha < 1;
			let strAlpha = "";
			commas ??= format.commas;
			if (serializeAlpha) {
				if (precision !== null) {
					let unit;
					if (alphaType === "<percentage>") {
						unit = "%";
						alpha *= 100;
					}
					alpha = serializeNumber(alpha, {
						precision,
						unit
					});
				}
				strAlpha = `${commas ? "," : " /"} ${alpha}`;
			}
			ret = `${name}(${args.join(commas ? ", " : " ")}${strAlpha})`;
		}
		return ret;
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/srgb-linear.js
/** @import { Matrix3x3 } from "../types.js" */
	/**
	* Matrices used by this color space, also available as `sRGB_Linear.M`
	* @type {Record<string, Matrix3x3>}
	*/
	const M = {
		toXYZ: [
			[
				.41239079926595934,
				.357584339383878,
				.1804807884018343
			],
			[
				.21263900587151027,
				.715168678767756,
				.07219231536073371
			],
			[
				.01933081871559182,
				.11919477979462598,
				.9505321522496607
			]
		],
		fromXYZ: [
			[
				3.2409699419045226,
				-1.537383177570094,
				-.4986107602930034
			],
			[
				-.9692436362808796,
				1.8759675015077202,
				.04155505740717559
			],
			[
				.05563007969699366,
				-.20397695888897652,
				1.0569715142428786
			]
		]
	};
	var srgb_linear_default = new RGBColorSpace({
		id: "srgb-linear",
		name: "Linear sRGB",
		white: "D65",
		M
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/keywords.js
/** List of CSS color keywords
	*  Note that this does not include currentColor, transparent,
	*  or system colors
	*
	*  @type {Record<string, [number, number, number]>}
	*/
	var keywords_default = {
		aliceblue: [
			240 / 255,
			248 / 255,
			1
		],
		antiquewhite: [
			250 / 255,
			235 / 255,
			215 / 255
		],
		aqua: [
			0,
			1,
			1
		],
		aquamarine: [
			127 / 255,
			1,
			212 / 255
		],
		azure: [
			240 / 255,
			1,
			1
		],
		beige: [
			245 / 255,
			245 / 255,
			220 / 255
		],
		bisque: [
			1,
			228 / 255,
			196 / 255
		],
		black: [
			0,
			0,
			0
		],
		blanchedalmond: [
			1,
			235 / 255,
			205 / 255
		],
		blue: [
			0,
			0,
			1
		],
		blueviolet: [
			138 / 255,
			43 / 255,
			226 / 255
		],
		brown: [
			165 / 255,
			42 / 255,
			42 / 255
		],
		burlywood: [
			222 / 255,
			184 / 255,
			135 / 255
		],
		cadetblue: [
			95 / 255,
			158 / 255,
			160 / 255
		],
		chartreuse: [
			127 / 255,
			1,
			0
		],
		chocolate: [
			210 / 255,
			105 / 255,
			30 / 255
		],
		coral: [
			1,
			127 / 255,
			80 / 255
		],
		cornflowerblue: [
			100 / 255,
			149 / 255,
			237 / 255
		],
		cornsilk: [
			1,
			248 / 255,
			220 / 255
		],
		crimson: [
			220 / 255,
			20 / 255,
			60 / 255
		],
		cyan: [
			0,
			1,
			1
		],
		darkblue: [
			0,
			0,
			139 / 255
		],
		darkcyan: [
			0,
			139 / 255,
			139 / 255
		],
		darkgoldenrod: [
			184 / 255,
			134 / 255,
			11 / 255
		],
		darkgray: [
			169 / 255,
			169 / 255,
			169 / 255
		],
		darkgreen: [
			0,
			100 / 255,
			0
		],
		darkgrey: [
			169 / 255,
			169 / 255,
			169 / 255
		],
		darkkhaki: [
			189 / 255,
			183 / 255,
			107 / 255
		],
		darkmagenta: [
			139 / 255,
			0,
			139 / 255
		],
		darkolivegreen: [
			85 / 255,
			107 / 255,
			47 / 255
		],
		darkorange: [
			1,
			140 / 255,
			0
		],
		darkorchid: [
			153 / 255,
			50 / 255,
			204 / 255
		],
		darkred: [
			139 / 255,
			0,
			0
		],
		darksalmon: [
			233 / 255,
			150 / 255,
			122 / 255
		],
		darkseagreen: [
			143 / 255,
			188 / 255,
			143 / 255
		],
		darkslateblue: [
			72 / 255,
			61 / 255,
			139 / 255
		],
		darkslategray: [
			47 / 255,
			79 / 255,
			79 / 255
		],
		darkslategrey: [
			47 / 255,
			79 / 255,
			79 / 255
		],
		darkturquoise: [
			0,
			206 / 255,
			209 / 255
		],
		darkviolet: [
			148 / 255,
			0,
			211 / 255
		],
		deeppink: [
			1,
			20 / 255,
			147 / 255
		],
		deepskyblue: [
			0,
			191 / 255,
			1
		],
		dimgray: [
			105 / 255,
			105 / 255,
			105 / 255
		],
		dimgrey: [
			105 / 255,
			105 / 255,
			105 / 255
		],
		dodgerblue: [
			30 / 255,
			144 / 255,
			1
		],
		firebrick: [
			178 / 255,
			34 / 255,
			34 / 255
		],
		floralwhite: [
			1,
			250 / 255,
			240 / 255
		],
		forestgreen: [
			34 / 255,
			139 / 255,
			34 / 255
		],
		fuchsia: [
			1,
			0,
			1
		],
		gainsboro: [
			220 / 255,
			220 / 255,
			220 / 255
		],
		ghostwhite: [
			248 / 255,
			248 / 255,
			1
		],
		gold: [
			1,
			215 / 255,
			0
		],
		goldenrod: [
			218 / 255,
			165 / 255,
			32 / 255
		],
		gray: [
			128 / 255,
			128 / 255,
			128 / 255
		],
		green: [
			0,
			128 / 255,
			0
		],
		greenyellow: [
			173 / 255,
			1,
			47 / 255
		],
		grey: [
			128 / 255,
			128 / 255,
			128 / 255
		],
		honeydew: [
			240 / 255,
			1,
			240 / 255
		],
		hotpink: [
			1,
			105 / 255,
			180 / 255
		],
		indianred: [
			205 / 255,
			92 / 255,
			92 / 255
		],
		indigo: [
			75 / 255,
			0,
			130 / 255
		],
		ivory: [
			1,
			1,
			240 / 255
		],
		khaki: [
			240 / 255,
			230 / 255,
			140 / 255
		],
		lavender: [
			230 / 255,
			230 / 255,
			250 / 255
		],
		lavenderblush: [
			1,
			240 / 255,
			245 / 255
		],
		lawngreen: [
			124 / 255,
			252 / 255,
			0
		],
		lemonchiffon: [
			1,
			250 / 255,
			205 / 255
		],
		lightblue: [
			173 / 255,
			216 / 255,
			230 / 255
		],
		lightcoral: [
			240 / 255,
			128 / 255,
			128 / 255
		],
		lightcyan: [
			224 / 255,
			1,
			1
		],
		lightgoldenrodyellow: [
			250 / 255,
			250 / 255,
			210 / 255
		],
		lightgray: [
			211 / 255,
			211 / 255,
			211 / 255
		],
		lightgreen: [
			144 / 255,
			238 / 255,
			144 / 255
		],
		lightgrey: [
			211 / 255,
			211 / 255,
			211 / 255
		],
		lightpink: [
			1,
			182 / 255,
			193 / 255
		],
		lightsalmon: [
			1,
			160 / 255,
			122 / 255
		],
		lightseagreen: [
			32 / 255,
			178 / 255,
			170 / 255
		],
		lightskyblue: [
			135 / 255,
			206 / 255,
			250 / 255
		],
		lightslategray: [
			119 / 255,
			136 / 255,
			153 / 255
		],
		lightslategrey: [
			119 / 255,
			136 / 255,
			153 / 255
		],
		lightsteelblue: [
			176 / 255,
			196 / 255,
			222 / 255
		],
		lightyellow: [
			1,
			1,
			224 / 255
		],
		lime: [
			0,
			1,
			0
		],
		limegreen: [
			50 / 255,
			205 / 255,
			50 / 255
		],
		linen: [
			250 / 255,
			240 / 255,
			230 / 255
		],
		magenta: [
			1,
			0,
			1
		],
		maroon: [
			128 / 255,
			0,
			0
		],
		mediumaquamarine: [
			102 / 255,
			205 / 255,
			170 / 255
		],
		mediumblue: [
			0,
			0,
			205 / 255
		],
		mediumorchid: [
			186 / 255,
			85 / 255,
			211 / 255
		],
		mediumpurple: [
			147 / 255,
			112 / 255,
			219 / 255
		],
		mediumseagreen: [
			60 / 255,
			179 / 255,
			113 / 255
		],
		mediumslateblue: [
			123 / 255,
			104 / 255,
			238 / 255
		],
		mediumspringgreen: [
			0,
			250 / 255,
			154 / 255
		],
		mediumturquoise: [
			72 / 255,
			209 / 255,
			204 / 255
		],
		mediumvioletred: [
			199 / 255,
			21 / 255,
			133 / 255
		],
		midnightblue: [
			25 / 255,
			25 / 255,
			112 / 255
		],
		mintcream: [
			245 / 255,
			1,
			250 / 255
		],
		mistyrose: [
			1,
			228 / 255,
			225 / 255
		],
		moccasin: [
			1,
			228 / 255,
			181 / 255
		],
		navajowhite: [
			1,
			222 / 255,
			173 / 255
		],
		navy: [
			0,
			0,
			128 / 255
		],
		oldlace: [
			253 / 255,
			245 / 255,
			230 / 255
		],
		olive: [
			128 / 255,
			128 / 255,
			0
		],
		olivedrab: [
			107 / 255,
			142 / 255,
			35 / 255
		],
		orange: [
			1,
			165 / 255,
			0
		],
		orangered: [
			1,
			69 / 255,
			0
		],
		orchid: [
			218 / 255,
			112 / 255,
			214 / 255
		],
		palegoldenrod: [
			238 / 255,
			232 / 255,
			170 / 255
		],
		palegreen: [
			152 / 255,
			251 / 255,
			152 / 255
		],
		paleturquoise: [
			175 / 255,
			238 / 255,
			238 / 255
		],
		palevioletred: [
			219 / 255,
			112 / 255,
			147 / 255
		],
		papayawhip: [
			1,
			239 / 255,
			213 / 255
		],
		peachpuff: [
			1,
			218 / 255,
			185 / 255
		],
		peru: [
			205 / 255,
			133 / 255,
			63 / 255
		],
		pink: [
			1,
			192 / 255,
			203 / 255
		],
		plum: [
			221 / 255,
			160 / 255,
			221 / 255
		],
		powderblue: [
			176 / 255,
			224 / 255,
			230 / 255
		],
		purple: [
			128 / 255,
			0,
			128 / 255
		],
		rebeccapurple: [
			102 / 255,
			51 / 255,
			153 / 255
		],
		red: [
			1,
			0,
			0
		],
		rosybrown: [
			188 / 255,
			143 / 255,
			143 / 255
		],
		royalblue: [
			65 / 255,
			105 / 255,
			225 / 255
		],
		saddlebrown: [
			139 / 255,
			69 / 255,
			19 / 255
		],
		salmon: [
			250 / 255,
			128 / 255,
			114 / 255
		],
		sandybrown: [
			244 / 255,
			164 / 255,
			96 / 255
		],
		seagreen: [
			46 / 255,
			139 / 255,
			87 / 255
		],
		seashell: [
			1,
			245 / 255,
			238 / 255
		],
		sienna: [
			160 / 255,
			82 / 255,
			45 / 255
		],
		silver: [
			192 / 255,
			192 / 255,
			192 / 255
		],
		skyblue: [
			135 / 255,
			206 / 255,
			235 / 255
		],
		slateblue: [
			106 / 255,
			90 / 255,
			205 / 255
		],
		slategray: [
			112 / 255,
			128 / 255,
			144 / 255
		],
		slategrey: [
			112 / 255,
			128 / 255,
			144 / 255
		],
		snow: [
			1,
			250 / 255,
			250 / 255
		],
		springgreen: [
			0,
			1,
			127 / 255
		],
		steelblue: [
			70 / 255,
			130 / 255,
			180 / 255
		],
		tan: [
			210 / 255,
			180 / 255,
			140 / 255
		],
		teal: [
			0,
			128 / 255,
			128 / 255
		],
		thistle: [
			216 / 255,
			191 / 255,
			216 / 255
		],
		tomato: [
			1,
			99 / 255,
			71 / 255
		],
		turquoise: [
			64 / 255,
			224 / 255,
			208 / 255
		],
		violet: [
			238 / 255,
			130 / 255,
			238 / 255
		],
		wheat: [
			245 / 255,
			222 / 255,
			179 / 255
		],
		white: [
			1,
			1,
			1
		],
		whitesmoke: [
			245 / 255,
			245 / 255,
			245 / 255
		],
		yellow: [
			1,
			1,
			0
		],
		yellowgreen: [
			154 / 255,
			205 / 255,
			50 / 255
		]
	};

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/srgb.js
/** @import { Coords } from "../types.js" */
	let coordGrammar = Array(3).fill("<percentage> | <number>[0, 255]");
	let coordGrammarNumber = Array(3).fill("<number>[0, 255]");
	var srgb_default = new RGBColorSpace({
		id: "srgb",
		name: "sRGB",
		base: srgb_linear_default,
		linearGamut: srgb_linear_default,
		fromBase: (rgb) => {
			return rgb.map((val) => {
				let sign = val < 0 ? -1 : 1;
				let abs = val * sign;
				if (abs > .0031308) return sign * (1.055 * abs ** (1 / 2.4) - .055);
				return 12.92 * val;
			});
		},
		toBase: (rgb) => {
			return rgb.map((val) => {
				let sign = val < 0 ? -1 : 1;
				let abs = val * sign;
				if (abs <= .04045) return val / 12.92;
				return sign * ((abs + .055) / 1.055) ** 2.4;
			});
		},
		formats: {
			rgb: { coords: coordGrammar },
			rgb_number: {
				name: "rgb",
				commas: true,
				coords: coordGrammarNumber,
				alpha: false
			},
			color: {},
			rgba: {
				coords: coordGrammar,
				commas: true,
				alpha: true
			},
			rgba_number: {
				name: "rgba",
				commas: true,
				coords: coordGrammarNumber
			},
			hex: {
				type: "custom",
				toGamut: true,
				test: (str) => /^#(([a-f0-9]{2}){3,4}|[a-f0-9]{3,4})$/i.test(str),
				parse(str) {
					if (str.length <= 5) str = str.replace(/[a-f0-9]/gi, "$&$&");
					/** @type {number[]} */
					let rgba = [];
					str.replace(/[a-f0-9]{2}/gi, (component) => {
						rgba.push(parseInt(component, 16) / 255);
					});
					return {
						spaceId: "srgb",
						coords: rgba.slice(0, 3),
						alpha: rgba.slice(3)[0]
					};
				},
				serialize: (coords, alpha, { collapse = true, alpha: alphaFormat } = {}) => {
					if (alphaFormat !== false && alpha < 1 || alphaFormat === true) coords.push(alpha);
					coords = coords.map((c) => Math.round(c * 255));
					let collapsible = collapse && coords.every((c) => c % 17 === 0);
					return "#" + coords.map((c) => {
						if (collapsible) return (c / 17).toString(16);
						return c.toString(16).padStart(2, "0");
					}).join("");
				}
			},
			keyword: {
				type: "custom",
				test: (str) => /^[a-z]+$/i.test(str),
				parse(str) {
					str = str.toLowerCase();
					let ret = {
						spaceId: "srgb",
						coords: null,
						alpha: 1
					};
					if (str === "transparent") {
						ret.coords = keywords_default.black;
						ret.alpha = 0;
					} else ret.coords = keywords_default[str];
					if (ret.coords) return ret;
				}
			}
		}
	});

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/equals.js
/** @import { ColorTypes } from "./types.js" */
	/**
	* @param {ColorTypes} color1
	* @param {ColorTypes} color2
	* @returns {boolean}
	*/
	function equals(color1, color2) {
		color1 = getColor(color1);
		color2 = getColor(color2);
		return color1.space === color2.space && color1.alpha === color2.alpha && color1.coords.every((c, i) => c === color2.coords[i]);
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/luminance.js
/**
	* Relative luminance
	*/
	/** @import { ColorTypes } from "./types.js" */
	/**
	*
	* @param {ColorTypes} color
	* @returns {number}
	*/
	function getLuminance(color) {
		return get(color, [xyz_d65_default, "y"]);
	}

// node_modules/.store/colorjs.io@0.7.1-METd09ReG36PFivDyznZ-w/node_modules/colorjs.io/src/spaces/hsl.js
	var hsl_default = new ColorSpace({
		id: "hsl",
		name: "HSL",
		coords: {
			h: {
				refRange: [0, 360],
				type: "angle",
				name: "Hue"
			},
			s: {
				range: [0, 100],
				name: "Saturation"
			},
			l: {
				range: [0, 100],
				name: "Lightness"
			}
		},
		base: srgb_default,
		rgbGamut: srgb_default,
		fromBase: (rgb) => {
			let max = Math.max(...rgb);
			let min = Math.min(...rgb);
			let [r, g, b] = rgb;
			let [h, s, l] = [
				null,
				0,
				(min + max) / 2
			];
			let d = max - min;
			if (d !== 0) {
				s = l === 0 || l === 1 ? 0 : (max - l) / Math.min(l, 1 - l);
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b: h = (r - g) / d + 4;
				}
				h = h * 60;
			}
			if (s < 0) {
				h += 180;
				s = Math.abs(s);
			}
			if (h >= 360) h -= 360;
			return [
				h,
				s * 100,
				l * 100
			];
		},
		toBase: (hsl) => {
			let [h, s, l] = hsl;
			h = h % 360;
			if (h < 0) h += 360;
			s /= 100;
			l /= 100;
			function f(n) {
				let k = (n + h / 30) % 12;
				let a = s * Math.min(l, 1 - l);
				return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
			}
			return [
				f(0),
				f(8),
				f(4)
			];
		},
		formats: {
			hsl: { coords: [
				"<number> | <angle>",
				"<percentage> | <number>",
				"<percentage> | <number>"
			] },
			hsla: {
				coords: [
					"<number> | <angle>",
					"<percentage> | <number>",
					"<percentage> | <number>"
				],
				commas: true,
				alpha: true
			}
		}
	});

// node_modules/.store/memize@2.1.1-roXbtpG2bis3Lggp7SQpAA/node_modules/memize/dist/index.js
/**
	* Memize options object.
	*
	* @typedef MemizeOptions
	*
	* @property {number} [maxSize] Maximum size of the cache.
	*/
	/**
	* Internal cache entry.
	*
	* @typedef MemizeCacheNode
	*
	* @property {?MemizeCacheNode|undefined} [prev] Previous node.
	* @property {?MemizeCacheNode|undefined} [next] Next node.
	* @property {Array<*>}                   args   Function arguments for cache
	*                                               entry.
	* @property {*}                          val    Function result.
	*/
	/**
	* Properties of the enhanced function for controlling cache.
	*
	* @typedef MemizeMemoizedFunction
	*
	* @property {()=>void} clear Clear the cache.
	*/
	/**
	* Accepts a function to be memoized, and returns a new memoized function, with
	* optional options.
	*
	* @template {(...args: any[]) => any} F
	*
	* @param {F}             fn        Function to memoize.
	* @param {MemizeOptions} [options] Options object.
	*
	* @return {((...args: Parameters<F>) => ReturnType<F>) & MemizeMemoizedFunction} Memoized function.
	*/
	function memize(fn, options) {
		var size = 0;
		/** @type {?MemizeCacheNode|undefined} */
		var head;
		/** @type {?MemizeCacheNode|undefined} */
		var tail;
		options = options || {};
		function memoized() {
			var node = head, len = arguments.length, args, i;
			searchCache: while (node) {
				if (node.args.length !== arguments.length) {
					node = node.next;
					continue;
				}
				for (i = 0; i < len; i++) if (node.args[i] !== arguments[i]) {
					node = node.next;
					continue searchCache;
				}
				if (node !== head) {
					if (node === tail) tail = node.prev;
					/** @type {MemizeCacheNode} */ node.prev.next = node.next;
					if (node.next) node.next.prev = node.prev;
					node.next = head;
					node.prev = null;
					/** @type {MemizeCacheNode} */ head.prev = node;
					head = node;
				}
				return node.val;
			}
			args = new Array(len);
			for (i = 0; i < len; i++) args[i] = arguments[i];
			node = {
				args,
				val: fn.apply(null, args)
			};
			if (head) {
				head.prev = node;
				node.next = head;
			} else tail = node;
			if (size === options.maxSize) {
				tail = tail.prev;
				/** @type {MemizeCacheNode} */ tail.next = null;
			} else size++;
			head = node;
			return node.val;
		}
		memoized.clear = function() {
			head = null;
			tail = null;
			size = 0;
		};
		return memoized;
	}

// packages/theme/build-module/prebuilt/ts/color-tokens.mjs
	var color_tokens_default = {
		transparent: [
			"background-interactive-brand-weak",
			"background-interactive-brand-weak-disabled",
			"background-interactive-error",
			"background-interactive-error-disabled",
			"background-interactive-error-weak",
			"background-interactive-error-weak-disabled",
			"background-interactive-neutral-weak",
			"background-interactive-neutral-weak-disabled"
		],
		"primary-bgFill1": ["background-interactive-brand-strong"],
		"primary-bgFill2": ["background-interactive-brand-strong-active"],
		"primary-fgFill": ["foreground-interactive-brand-strong", "foreground-interactive-brand-strong-active"],
		"primary-surface4": ["background-interactive-brand-weak-active"],
		"primary-fgSurface4": ["foreground-interactive-brand-active"],
		"primary-fgSurface3": ["foreground-interactive-brand"],
		"primary-stroke3": [
			"background-thumb-brand",
			"background-thumb-brand-active",
			"stroke-focus",
			"stroke-interactive-brand",
			"stroke-surface-brand-strong"
		],
		"primary-stroke4": ["stroke-interactive-brand-active"],
		"primary-stroke1": ["stroke-surface-brand"],
		"primary-surface1": ["background-surface-brand"],
		"info-surface2": ["background-surface-info-weak"],
		"info-surface4": ["background-surface-info"],
		"info-fgSurface4": ["foreground-content-info"],
		"info-fgSurface3": ["foreground-content-info-weak"],
		"info-stroke3": ["stroke-surface-info-strong"],
		"info-stroke1": ["stroke-surface-info"],
		"success-surface2": ["background-surface-success-weak"],
		"success-surface4": ["background-surface-success"],
		"success-fgSurface4": ["foreground-content-success"],
		"success-fgSurface3": ["foreground-content-success-weak"],
		"success-stroke3": ["stroke-surface-success-strong"],
		"success-stroke1": ["stroke-surface-success"],
		"warning-surface2": ["background-surface-warning-weak"],
		"warning-surface4": ["background-surface-warning"],
		"warning-fgSurface4": ["foreground-content-warning"],
		"warning-fgSurface3": ["foreground-content-warning-weak"],
		"warning-stroke3": ["stroke-surface-warning-strong"],
		"warning-stroke1": ["stroke-surface-warning"],
		"error-bgFill1": ["background-interactive-error-strong"],
		"error-bgFill2": ["background-interactive-error-strong-active"],
		"error-fgFill": ["foreground-interactive-error-strong", "foreground-interactive-error-strong-active"],
		"error-surface2": ["background-interactive-error-active", "background-surface-error-weak"],
		"error-surface4": ["background-interactive-error-weak-active", "background-surface-error"],
		"error-fgSurface4": ["foreground-content-error", "foreground-interactive-error-active"],
		"error-fgSurface3": ["foreground-content-error-weak", "foreground-interactive-error"],
		"error-stroke3": [
			"stroke-interactive-error",
			"stroke-interactive-error-strong",
			"stroke-surface-error-strong"
		],
		"error-stroke4": ["stroke-interactive-error-active"],
		"error-stroke1": ["stroke-surface-error"],
		"bg-surface2": ["background-surface-neutral"],
		"bg-surface5": [
			"background-interactive-brand-strong-disabled",
			"background-interactive-error-strong-disabled",
			"background-interactive-neutral-strong-disabled"
		],
		"bg-surface4": ["background-interactive-neutral-weak-active"],
		"bg-surface3": [
			"background-interactive-neutral",
			"background-interactive-neutral-active",
			"background-interactive-neutral-disabled",
			"background-surface-neutral-strong"
		],
		"bg-fgSurface4": [
			"background-thumb-neutral",
			"foreground-content-neutral",
			"foreground-interactive-neutral",
			"foreground-interactive-neutral-active",
			"foreground-interactive-neutral-weak-active"
		],
		"bg-fgSurface3": ["foreground-content-neutral-weak", "foreground-interactive-neutral-weak"],
		"bg-fgSurface2": [
			"foreground-interactive-brand-disabled",
			"foreground-interactive-brand-strong-disabled",
			"foreground-interactive-error-disabled",
			"foreground-interactive-error-strong-disabled",
			"foreground-interactive-neutral-disabled",
			"foreground-interactive-neutral-strong-disabled",
			"foreground-interactive-neutral-weak-disabled"
		],
		"bg-stroke3": [
			"background-thumb-neutral-weak",
			"stroke-interactive-neutral",
			"stroke-surface-neutral-strong"
		],
		"bg-stroke4": [
			"background-thumb-neutral-weak-active",
			"stroke-interactive-neutral-active",
			"stroke-interactive-neutral-strong"
		],
		"bg-stroke2": [
			"background-thumb-brand-disabled",
			"background-thumb-neutral-weak-disabled",
			"background-track-neutral",
			"stroke-interactive-brand-disabled",
			"stroke-interactive-error-disabled",
			"stroke-interactive-neutral-disabled",
			"stroke-surface-neutral"
		],
		"bg-stroke1": ["background-track-neutral-weak", "stroke-surface-neutral-weak"],
		"bg-bgFillInverted2": ["background-interactive-neutral-strong-active"],
		"bg-bgFillInverted1": ["background-interactive-neutral-strong"],
		"bg-fgFillInverted": ["foreground-interactive-neutral-strong", "foreground-interactive-neutral-strong-active"],
		"bg-surface1": ["background-surface-neutral-weak"],
		"caution-surface2": ["background-surface-caution-weak"],
		"caution-surface4": ["background-surface-caution"],
		"caution-fgSurface4": ["foreground-content-caution"],
		"caution-fgSurface3": ["foreground-content-caution-weak"],
		"caution-stroke3": ["stroke-surface-caution-strong"],
		"caution-stroke1": ["stroke-surface-caution"]
	};

// packages/theme/build-module/color-ramps/lib/color-utils.mjs
	const ALLOWED_SEED_COLOR_SPACES = [srgb_default];
	const objectLuminanceCache = /* @__PURE__ */ new WeakMap();
	/**
	* Get string representation of a color.
	* @param color A `PlainColorObject`, or an sRGB-parseable string (typically a
	*              hex value, e.g. `#3858e9`).
	* @return String representation
	*/
	function getColorString(color) {
		ColorSpace.register(srgb_default);
		const rgbRounded = serialize(to(color, srgb_default));
		return serialize(rgbRounded, { format: "hex" });
	}
	/**
	* Get contrast value between two colors.
	* @param colorA First color: a `PlainColorObject`, or an sRGB-parseable string.
	* @param colorB Second color: a `PlainColorObject`, or an sRGB-parseable string.
	* @return WCAG 2.1 contrast ratio
	*/
	function getContrast(colorA, colorB) {
		return getContrastFromLuminances(getRelativeLuminance(colorA), getRelativeLuminance(colorB));
	}
	/**
	* Return a color's non-negative relative luminance. Color objects use a weak
	* cache with snapshots to detect mutations.
	*
	* @param color Color to measure.
	*/
	function getRelativeLuminance(color) {
		if (typeof color === "string") {
			ColorSpace.register(srgb_default);
			return Math.max(getLuminance(color), 0);
		}
		const cachedLuminance = objectLuminanceCache.get(color);
		if (cachedLuminance && equals(cachedLuminance.color, color)) return cachedLuminance.luminance;
		const luminance = Math.max(getLuminance(color), 0);
		objectLuminanceCache.set(color, {
			color: clone(color),
			luminance
		});
		return luminance;
	}
	/**
	* Calculate a WCAG 2.1 contrast ratio from precomputed relative luminances.
	*
	* @param first  First relative luminance.
	* @param second Second relative luminance.
	*/
	function getContrastFromLuminances(first, second) {
		return first > second ? (first + .05) / (second + .05) : (second + .05) / (first + .05);
	}
	/**
	* Parse a seed-color string and assert that it has finite sRGB coordinates and
	* is fully opaque (hex, `rgb()`/`rgba()`, or a CSS named color), throwing
	* otherwise.
	* Missing RGB channels (`none`) resolve to zero.
	*
	* Rejection is deterministic regardless of which `ColorSpace`s are globally
	* registered.
	*
	* @param  seed The seed-color string to validate.
	* @return The parsed seed color.
	* @throws {Error} If `seed` is not an sRGB-parseable, fully opaque string with finite channels.
	*/
	function parseSeedColor(seed) {
		ALLOWED_SEED_COLOR_SPACES.forEach((space) => ColorSpace.register(space));
		let parsedColor;
		try {
			parsedColor = parse(seed);
		} catch {
			throw new Error(`Unsupported seed color "${seed}": expected a fully opaque hex value, an \`rgb()\`/\`rgba()\` string, or a CSS named color.`);
		}
		const { alpha = 1, coords, spaceId } = parsedColor;
		if (!ALLOWED_SEED_COLOR_SPACES.some((space) => space.id === spaceId)) throw new Error(`Unsupported seed color "${seed}": expected a fully opaque hex value, an \`rgb()\`/\`rgba()\` string, or a CSS named color, but received a \`${spaceId}\` color.`);
		for (const [index, coordinate] of coords.entries()) if (coordinate === null) coords[index] = 0;
		else if (typeof coordinate !== "number" || !Number.isFinite(coordinate)) throw new Error(`Unsupported seed color "${seed}": expected every RGB channel to be a finite number.`);
		if (alpha !== 1) throw new Error(`Unsupported seed color "${seed}": expected a fully opaque color.`);
		return parsedColor;
	}
	/**
	* Make sure that a color is valid in the sRGB gamut and convert it to OKLCH.
	* @param c A color object.
	*/
	function clampToGamut(c) {
		return to(toGamut(c, {
			space: srgb_default,
			method: "css"
		}), oklch_default);
	}

// packages/theme/build-module/color-ramps/lib/constants.mjs
	const WHITE = {
		space: oklch_default,
		coords: [
			1,
			0,
			0
		],
		alpha: 1
	};
	const BLACK = {
		space: oklch_default,
		coords: [
			0,
			0,
			0
		],
		alpha: 1
	};
	const UNIVERSAL_CONTRAST_TOPUP = .02;
	const WHITE_TEXT_CONTRAST_MARGIN = 3.1;
	const ACCENT_SCALE_BASE_LIGHTNESS_THRESHOLDS = {
		lighter: {
			min: .2,
			max: .4
		},
		darker: {
			min: .75,
			max: .98
		}
	};
	const CONTRAST_EPSILON = .004;
	const DEFAULT_SEED_COLORS = {
		background: "#fcfcfc",
		primary: "#3858e9",
		info: "#0090ff",
		success: "#4ab866",
		caution: "#f0d149",
		warning: "#f0b849",
		error: "#cc1818"
	};

// packages/theme/build-module/color-ramps/lib/utils.mjs
/**
	* Build a dependency graph from the steps configuration
	* @param config - The steps configuration object
	*/
	function buildDependencyGraph(config) {
		const dependencies = /* @__PURE__ */ new Map();
		const dependents = /* @__PURE__ */ new Map();
		Object.keys(config).forEach((step) => {
			dependencies.set(step, []);
		});
		dependents.set("seed", []);
		Object.keys(config).forEach((step) => {
			dependents.set(step, []);
		});
		Object.entries(config).forEach(([stepName, stepConfig]) => {
			const step = stepName;
			const references = [stepConfig.contrast.reference, ...stepConfig.contrast.additionalReferences ?? []];
			for (const reference of references) {
				dependencies.get(step).push(reference);
				dependents.get(reference).push(step);
			}
			if (stepConfig.sameAsIfPossible) {
				dependencies.get(step).push(stepConfig.sameAsIfPossible);
				dependents.get(stepConfig.sameAsIfPossible).push(step);
			}
		});
		return {
			dependencies,
			dependents
		};
	}
	/**
	* Topologically sort steps based on their dependencies
	* @param config - The steps configuration object
	*/
	function sortByDependency(config) {
		const { dependents } = buildDependencyGraph(config);
		const result = [];
		const visited = /* @__PURE__ */ new Set();
		const visiting = /* @__PURE__ */ new Set();
		function visit(node) {
			if (visiting.has(node)) throw new Error(`Circular dependency detected involving step: ${String(node)}`);
			if (visited.has(node)) return;
			visiting.add(node);
			(dependents.get(node) || []).forEach((dependent) => {
				visit(dependent);
			});
			visiting.delete(node);
			visited.add(node);
			if (node !== "seed") result.unshift(node);
		}
		visit("seed");
		return result;
	}
	/**
	* Return minimal set of steps that are needed to calculate `stepName` from the seed.
	* @param stepName Name of the step.
	* @param config   Configuration of the ramp.
	* @return Array of steps that `stepName` depends on.
	*/
	function stepsForStep(stepName, config) {
		const result = /* @__PURE__ */ new Set();
		function visit(step) {
			if (step === "seed" || result.has(step)) return;
			const stepConfig = config[step];
			if (!stepConfig) return;
			visit(stepConfig.contrast.reference);
			stepConfig.contrast.additionalReferences?.forEach(visit);
			if (stepConfig.sameAsIfPossible) visit(stepConfig.sameAsIfPossible);
			result.add(step);
		}
		visit(stepName);
		return Array.from(result);
	}
	/**
	* Finds out whether a lighter or a darker foreground color achieves a better
	* contrast against every reference color
	* @param references
	* @param preferLighter Whether the check should favor white foreground color
	* @return An object with "better" and "worse" properties, each holding a
	* ramp direction value.
	*/
	function computeBetterFgColorDirection(references, preferLighter) {
		const referenceColors = Array.isArray(references) ? references : [references];
		return Math.min(...referenceColors.map((reference) => getContrast(reference, BLACK))) > Math.min(...referenceColors.map((reference) => getContrast(reference, WHITE))) + (preferLighter ? 3.1 : 0) ? {
			better: "darker",
			worse: "lighter"
		} : {
			better: "lighter",
			worse: "darker"
		};
	}
	function adjustContrastTarget(target) {
		if (target === 1) return 1;
		return target + UNIVERSAL_CONTRAST_TOPUP;
	}
	/**
	* Prevent the accent scale from referencing a lightness value that
	* would prevent the algorithm from complying with the requirements
	* and cause it to generate unexpected results.
	* @param rawLightness
	* @param direction
	* @return The clamped lightness value
	*/
	function clampAccentScaleReferenceLightness(rawLightness, direction) {
		const thresholds = ACCENT_SCALE_BASE_LIGHTNESS_THRESHOLDS[direction];
		return Math.max(thresholds.min, Math.min(thresholds.max, rawLightness));
	}
	/**
	* Find the value of `L` (luminance) that produces a `C` (color) that has a
	* `value` (contrast delta) equal to zero.
	* @param calculateC     Calculate `C` from a given `L`.
	* @param calculateValue Calculate value (delta) for a given `C`.
	* @param initLowerL     Initial lower value of `L`.
	* @param initLowerValue Initial lower delta (negative).
	* @param initUpperL     Initial upper value of `L`.
	* @param initUpperValue Initial upper delta (positive).
	* @return Resulting value of type `C`.
	*/
	function solveWithBisect(calculateC, calculateValue, initLowerL, initLowerValue, initUpperL, initUpperValue) {
		let lowerL = initLowerL;
		let lowerValue = initLowerValue;
		let lowerReplaced = false;
		let upperL = initUpperL;
		let upperValue = initUpperValue;
		let upperReplaced = false;
		let bestC;
		let bestValue;
		let iterations = 0;
		while (true) {
			iterations++;
			const newL = (lowerL * upperValue - upperL * lowerValue) / (upperValue - lowerValue);
			bestC = calculateC(newL);
			bestValue = calculateValue(bestC);
			if (Math.abs(bestValue) <= .004 || iterations >= 10) break;
			if (bestValue <= 0) {
				lowerL = newL;
				lowerValue = bestValue;
				if (lowerReplaced) upperValue /= 2;
				lowerReplaced = true;
				upperReplaced = false;
			} else {
				upperL = newL;
				upperValue = bestValue;
				if (upperReplaced) lowerValue /= 2;
				upperReplaced = true;
				lowerReplaced = false;
			}
		}
		return bestC;
	}

// packages/theme/build-module/color-ramps/lib/taper-chroma.mjs
/**
	* Prepare a chroma taper for repeated target-lightness calculations.
	*
	* @param seed    Seed color in OKLCH.
	* @param options Chroma taper options.
	*/
	function createChromaTaper(seed, options = {}) {
		const gamut = options.gamut ?? srgb_default;
		const alpha = options.alpha ?? .65;
		const carry = options.carry ?? .5;
		const radiusLight = options.radiusLight ?? .2;
		const radiusDark = options.radiusDark ?? .2;
		const kLight = options.kLight ?? .85;
		const kDark = options.kDark ?? .85;
		const achromaEpsilon = options.achromaEpsilon ?? .005;
		const cSeed = Math.max(0, get(seed, [oklch_default, "c"]));
		let hSeed = get(seed, [oklch_default, "h"]);
		if (cSeed < achromaEpsilon || hSeed === null || !Number.isFinite(hSeed)) {
			if (typeof options.hueFallback === "number") hSeed = normalizeHue(options.hueFallback);
			else return (lTarget) => ({
				space: oklch_default,
				coords: [
					clamp01(lTarget),
					0,
					0
				],
				alpha: 1
			});
		}
		const lSeed = clamp01(get(seed, [oklch_default, "l"]));
		const cmaxSeed = getMaxChromaAtLH(lSeed, hSeed, gamut);
		const seedRelative = clamp01(cSeed / (cmaxSeed > 0 ? cmaxSeed : 1e-6));
		const seedCarry = Math.pow(seedRelative, clamp01(carry));
		return (lTarget) => {
			const cmaxTarget = getMaxChromaAtLH(clamp01(lTarget), hSeed, gamut);
			const cPlanned = alpha * cmaxTarget * seedCarry * continuousTaper(lSeed, lTarget, {
				radiusLight,
				radiusDark,
				kLight,
				kDark
			});
			return {
				l: clamp01(lTarget),
				c: cPlanned
			};
		};
	}
	function clamp01(x) {
		if (x < 0) return 0;
		if (x > 1) return 1;
		return x;
	}
	function normalizeHue(h) {
		let hue = h % 360;
		if (hue < 0) hue += 360;
		return hue;
	}
	function raisedCosine(u) {
		const x = clamp01(u);
		return .5 - .5 * Math.cos(Math.PI * x);
	}
	/**
	* smooth, distance-from-seed chroma taper (raised-cosine per side)
	* @param seedL
	* @param targetL
	* @param opts
	* @param opts.radiusLight
	* @param opts.radiusDark
	* @param opts.kLight
	* @param opts.kDark
	*/
	function continuousTaper(seedL, targetL, opts) {
		const d = targetL - seedL;
		if (d >= 0) {
			const u = opts.radiusLight > 0 ? Math.abs(d) / opts.radiusLight : 1;
			const w = raisedCosine(u > 1 ? 1 : u);
			return 1 - (1 - opts.kLight) * w;
		}
		const u = opts.radiusDark > 0 ? Math.abs(d) / opts.radiusDark : 1;
		const w = raisedCosine(u > 1 ? 1 : u);
		return 1 - (1 - opts.kDark) * w;
	}
	const MAX_CHROMA = .45;
	function getMaxChromaAtLH(l, h, gamutSpace) {
		const probe = {
			space: oklch_default,
			coords: [
				clamp01(l),
				MAX_CHROMA,
				normalizeHue(h)
			],
			alpha: 1
		};
		const clamped = toGamutCSS(probe, { space: gamutSpace });
		return get(clamped, [oklch_default, "c"]);
	}

// packages/theme/build-module/color-ramps/lib/find-color-with-constraints.mjs
/**
	* Difference of contrast values that grows linearly with the Y luminance.
	* We get more precise linear interpolations when we use this.
	* @param c1 First contrast.
	* @param c2 Second contrast.
	* @return Difference of logarithms.
	*/
	function cdiff(c1, c2) {
		return Math.log(c1 / c2);
	}
	/**
	* Solve for L such that:
	*  - the L applied to the seed meets the contrast target against the reference
	*  - the search is performed in one direction (ie lighter / darker)
	*  - more constraints can be applied around lightness
	* @param reference
	* @param seed
	* @param target
	* @param direction
	* @param options
	* @param options.lightnessConstraint
	* @param options.lightnessConstraint.type
	* @param options.lightnessConstraint.value
	* @param options.taperChromaOptions
	*/
	function findColorMeetingRequirements(reference, seed, target, direction, { lightnessConstraint, taperChromaOptions } = {}) {
		if (target <= 1) return {
			color: reference,
			reached: true,
			achieved: 1
		};
		const seedChroma = get(seed, [oklch_default, "c"]);
		const seedHue = get(seed, [oklch_default, "h"]);
		const taperChromaAtLightness = taperChromaOptions ? createChromaTaper(seed, taperChromaOptions) : void 0;
		function getColorForL(l) {
			let newL = l;
			let newC = seedChroma;
			if (taperChromaAtLightness) {
				const tapered = taperChromaAtLightness(newL);
				if ("l" in tapered && "c" in tapered) {
					newL = tapered.l;
					newC = tapered.c;
				} else return tapered;
			}
			return clampToGamut({
				space: oklch_default,
				coords: [
					newL,
					newC,
					seedHue
				],
				alpha: seed.alpha
			});
		}
		const mostContrastingL = direction === "lighter" ? 1 : 0;
		const mostContrastingColor = direction === "lighter" ? WHITE : BLACK;
		const highestContrast = getContrast(reference, mostContrastingColor);
		if (lightnessConstraint) {
			const colorWithExactL = getColorForL(lightnessConstraint.value);
			const exactLContrast = getContrast(reference, colorWithExactL);
			const exactLContrastMeetsTarget = cdiff(exactLContrast, target) >= -CONTRAST_EPSILON;
			if (exactLContrastMeetsTarget || lightnessConstraint.type === "force") return {
				color: colorWithExactL,
				reached: exactLContrastMeetsTarget,
				achieved: exactLContrast,
				deficit: exactLContrastMeetsTarget ? cdiff(exactLContrast, highestContrast) : cdiff(target, exactLContrast)
			};
		}
		if (cdiff(highestContrast, target) <= .004) return {
			color: mostContrastingColor,
			reached: cdiff(highestContrast, target) >= -CONTRAST_EPSILON,
			achieved: highestContrast,
			deficit: cdiff(target, highestContrast)
		};
		const lowerL = get(reference, [oklch_default, "l"]);
		const lowerContrast = cdiff(1, target);
		const upperL = mostContrastingL;
		const upperContrast = cdiff(highestContrast, target);
		return {
			color: solveWithBisect(getColorForL, (c) => cdiff(getContrast(reference, c), target), lowerL, lowerContrast, upperL, upperContrast),
			reached: true,
			achieved: target,
			deficit: cdiff(target, highestContrast)
		};
	}

// packages/theme/build-module/color-ramps/lib/index.mjs
/**
	* Calculate a complete color ramp based on the provided configuration.
	*
	* @param params                       - The calculation parameters
	* @param params.seed                  - The base color to build the ramp from
	* @param params.sortedSteps           - Steps sorted in dependency order
	* @param params.config                - Ramp configuration defining contrast requirements
	* @param params.mainDir               - Primary direction for the ramp (lighter/darker)
	* @param params.oppDir                - Opposite direction from mainDir
	* @param params.pinLightness          - Optional lightness override for a given step
	* @param params.pinLightness.stepName
	* @param params.pinLightness.value
	* @return Object containing ramp results and satisfaction status
	*/
	function calculateRamp({ seed, sortedSteps, config, mainDir, oppDir, pinLightness }) {
		const rampResults = {};
		let warnings;
		let maxDeficit = -Infinity;
		let maxDeficitDirection = "lighter";
		let maxDeficitStep;
		const calculatedColors = /* @__PURE__ */ new Map();
		calculatedColors.set("seed", seed);
		for (const stepName of sortedSteps) {
			const { contrast, lightness: stepLightnessConstraint, taperChromaOptions, sameAsIfPossible } = config[stepName];
			const referenceColors = [contrast.reference, ...contrast.additionalReferences ?? []].map((referenceName) => {
				const referenceColor = calculatedColors.get(referenceName);
				if (!referenceColor) throw new Error(`Reference color for step ${stepName} not found: ${referenceName}`);
				return referenceColor;
			});
			if (sameAsIfPossible) {
				const candidateColor = calculatedColors.get(sameAsIfPossible);
				if (!candidateColor) throw new Error(`Same-as color for step ${stepName} not found: ${sameAsIfPossible}`);
				const adjustedTarget = adjustContrastTarget(contrast.target);
				if (referenceColors.every((referenceColor) => getContrast(referenceColor, candidateColor) >= adjustedTarget)) {
					calculatedColors.set(stepName, candidateColor);
					rampResults[stepName] = getColorString(candidateColor);
					continue;
				}
			}
			function computeDirection(colors, followDirection) {
				if (followDirection === "main") return mainDir;
				if (followDirection === "opposite") return oppDir;
				if (followDirection === "best") return computeBetterFgColorDirection(colors, contrast.preferLighter).better;
				return followDirection;
			}
			const computedDir = computeDirection(referenceColors, contrast.followDirection);
			const endpoint = computedDir === "lighter" ? WHITE : BLACK;
			const referenceColor = referenceColors.reduce((tightest, current) => getContrast(current, endpoint) < getContrast(tightest, endpoint) ? current : tightest);
			const adjustedTarget = adjustContrastTarget(contrast.target);
			let lightnessConstraint;
			if (pinLightness?.stepName === stepName) lightnessConstraint = {
				value: pinLightness.value,
				type: "force"
			};
			else if (stepLightnessConstraint) lightnessConstraint = {
				value: stepLightnessConstraint(computedDir),
				type: "onlyIfSucceeds"
			};
			const searchResults = findColorMeetingRequirements(referenceColor, seed, adjustedTarget, computedDir, {
				lightnessConstraint,
				taperChromaOptions
			});
			if (!contrast.ignoreWhenAdjustingSeed && searchResults.deficit && searchResults.deficit > maxDeficit) {
				maxDeficit = searchResults.deficit;
				maxDeficitDirection = computedDir;
				maxDeficitStep = stepName;
			}
			calculatedColors.set(stepName, searchResults.color);
			rampResults[stepName] = getColorString(searchResults.color);
			if (!searchResults.reached && !contrast.ignoreWhenAdjustingSeed) {
				warnings ??= [];
				warnings.push(stepName);
			}
		}
		return {
			rampResults,
			warnings,
			maxDeficit,
			maxDeficitDirection,
			maxDeficitStep
		};
	}
	function buildRamp(seedArg, config, { mainDirection, pinLightness, rescaleToFitContrastTargets = true } = {}) {
		const parsedSeed = parseSeedColor(seedArg);
		let seed;
		try {
			seed = clampToGamut(parsedSeed);
		} catch (error) {
			throw new Error(`Invalid seed color "${seedArg}": ${error instanceof Error ? error.message : "Unknown error"}`);
		}
		let mainDir = "lighter";
		let oppDir = "darker";
		if (mainDirection) {
			mainDir = mainDirection;
			oppDir = mainDirection === "darker" ? "lighter" : "darker";
		} else {
			const { better, worse } = computeBetterFgColorDirection(seed);
			mainDir = better;
			oppDir = worse;
		}
		const sortedSteps = sortByDependency(config);
		const { rampResults, warnings, maxDeficit, maxDeficitDirection, maxDeficitStep } = calculateRamp({
			seed,
			sortedSteps,
			config,
			mainDir,
			oppDir,
			pinLightness
		});
		let bestRamp = rampResults;
		let bestWarnings = warnings;
		if (maxDeficit > .004 && rescaleToFitContrastTargets) {
			const iterSteps = stepsForStep(maxDeficitStep, config);
			function getSeedForL(l) {
				return clampToGamut(set(clone(seed), [oklch_default, "l"], l));
			}
			function getDeficitForSeed(s) {
				const iterationResults = calculateRamp({
					seed: s,
					sortedSteps: iterSteps,
					config,
					mainDir,
					oppDir,
					pinLightness
				});
				return iterationResults.maxDeficitDirection === maxDeficitDirection ? iterationResults.maxDeficit : -maxDeficit;
			}
			const lowerSeedL = maxDeficitDirection === "lighter" ? 0 : 1;
			const lowerDeficit = -maxDeficit;
			const upperSeedL = get(seed, [oklch_default, "l"]);
			const finalResult = calculateRamp({
				seed: solveWithBisect(getSeedForL, getDeficitForSeed, lowerSeedL, lowerDeficit, upperSeedL, maxDeficit),
				sortedSteps,
				config,
				mainDir,
				oppDir,
				pinLightness
			});
			bestRamp = finalResult.rampResults;
			bestWarnings = finalResult.warnings;
		}
		if (mainDir === "darker") {
			const tmpSurface1 = bestRamp.surface1;
			bestRamp.surface1 = bestRamp.surface3;
			bestRamp.surface3 = tmpSurface1;
		}
		return {
			ramp: bestRamp,
			warnings: bestWarnings,
			direction: mainDir
		};
	}

// packages/theme/build-module/color-ramps/lib/ramp-configs.mjs
	const lightnessConstraintForegroundHighContrast = (direction) => direction === "lighter" ? .9551 : .235;
	const lightnessConstraintForegroundMediumContrast = (direction) => direction === "lighter" ? .77 : .56;
	const lightnessConstraintBgFill = (direction) => direction === "lighter" ? .67 : .45;
	const BG_SURFACE_TAPER_CHROMA = { alpha: .7 };
	const FG_TAPER_CHROMA = {
		alpha: .6,
		kLight: .2,
		kDark: .2
	};
	const STROKE_TAPER_CHROMA = {
		alpha: .6,
		radiusDark: .01,
		radiusLight: .01,
		kLight: .8,
		kDark: .8
	};
	const ACCENT_SURFACE_TAPER_CHROMA = {
		alpha: .75,
		radiusDark: .01,
		radiusLight: .01
	};
	const fgSurface4Config = {
		contrast: {
			reference: "surface3",
			followDirection: "main",
			target: 7,
			preferLighter: true
		},
		lightness: lightnessConstraintForegroundHighContrast,
		taperChromaOptions: FG_TAPER_CHROMA
	};
	const BG_RAMP_CONFIG = {
		surface1: {
			contrast: {
				reference: "surface2",
				followDirection: "opposite",
				target: 1.06,
				ignoreWhenAdjustingSeed: true
			},
			taperChromaOptions: BG_SURFACE_TAPER_CHROMA
		},
		surface2: { contrast: {
			reference: "seed",
			followDirection: "main",
			target: 1
		} },
		surface3: {
			contrast: {
				reference: "surface2",
				followDirection: "main",
				target: 1.06
			},
			taperChromaOptions: BG_SURFACE_TAPER_CHROMA
		},
		surface4: {
			contrast: {
				reference: "surface2",
				followDirection: "main",
				target: 1.12
			},
			taperChromaOptions: BG_SURFACE_TAPER_CHROMA
		},
		surface5: {
			contrast: {
				reference: "surface2",
				followDirection: "main",
				target: 1.2
			},
			taperChromaOptions: BG_SURFACE_TAPER_CHROMA
		},
		surface6: {
			contrast: {
				reference: "surface2",
				followDirection: "main",
				target: 1.4
			},
			taperChromaOptions: BG_SURFACE_TAPER_CHROMA
		},
		bgFill1: {
			contrast: {
				reference: "surface2",
				followDirection: "main",
				target: 4
			},
			lightness: lightnessConstraintBgFill
		},
		bgFill2: { contrast: {
			reference: "bgFill1",
			followDirection: "main",
			target: 1.2
		} },
		bgFillInverted1: { contrast: {
			reference: "bgFillInverted2",
			followDirection: "opposite",
			target: 1.2
		} },
		bgFillInverted2: fgSurface4Config,
		bgFillDark: {
			contrast: {
				reference: "surface3",
				followDirection: "darker",
				target: 7,
				ignoreWhenAdjustingSeed: true
			},
			lightness: lightnessConstraintForegroundHighContrast,
			taperChromaOptions: FG_TAPER_CHROMA
		},
		stroke1: {
			contrast: {
				reference: "stroke3",
				followDirection: "opposite",
				target: 2.9
			},
			taperChromaOptions: STROKE_TAPER_CHROMA
		},
		stroke2: {
			contrast: {
				reference: "stroke3",
				followDirection: "opposite",
				target: 2.4
			},
			taperChromaOptions: STROKE_TAPER_CHROMA
		},
		stroke3: {
			contrast: {
				reference: "surface3",
				followDirection: "main",
				target: 3
			},
			taperChromaOptions: STROKE_TAPER_CHROMA
		},
		stroke4: {
			contrast: {
				reference: "stroke3",
				followDirection: "main",
				target: 1.5
			},
			taperChromaOptions: STROKE_TAPER_CHROMA
		},
		fgSurface1: {
			contrast: {
				reference: "surface3",
				followDirection: "main",
				target: 2,
				preferLighter: true
			},
			taperChromaOptions: FG_TAPER_CHROMA
		},
		fgSurface2: {
			contrast: {
				reference: "surface3",
				followDirection: "main",
				target: 3,
				preferLighter: true
			},
			taperChromaOptions: FG_TAPER_CHROMA
		},
		fgSurface3: {
			contrast: {
				reference: "surface3",
				followDirection: "main",
				target: 4.5,
				preferLighter: true
			},
			lightness: lightnessConstraintForegroundMediumContrast,
			taperChromaOptions: FG_TAPER_CHROMA
		},
		fgSurface4: fgSurface4Config,
		fgFill: {
			contrast: {
				reference: "bgFill1",
				additionalReferences: ["bgFill2"],
				followDirection: "best",
				target: 4.55
			},
			lightness: lightnessConstraintForegroundHighContrast,
			taperChromaOptions: FG_TAPER_CHROMA
		},
		fgFillInverted: {
			contrast: {
				reference: "bgFillInverted1",
				followDirection: "best",
				target: 4.5,
				preferLighter: true
			},
			lightness: lightnessConstraintForegroundHighContrast,
			taperChromaOptions: FG_TAPER_CHROMA
		},
		fgFillDark: {
			contrast: {
				reference: "bgFillDark",
				followDirection: "best",
				target: 4.5,
				preferLighter: true
			},
			lightness: lightnessConstraintForegroundHighContrast,
			taperChromaOptions: FG_TAPER_CHROMA
		}
	};
	const ACCENT_RAMP_CONFIG = {
		...BG_RAMP_CONFIG,
		surface1: {
			...BG_RAMP_CONFIG.surface1,
			taperChromaOptions: ACCENT_SURFACE_TAPER_CHROMA
		},
		surface2: {
			contrast: {
				reference: "bgFill1",
				followDirection: "opposite",
				target: BG_RAMP_CONFIG.bgFill1.contrast.target,
				ignoreWhenAdjustingSeed: true
			},
			taperChromaOptions: ACCENT_SURFACE_TAPER_CHROMA
		},
		surface3: {
			...BG_RAMP_CONFIG.surface3,
			taperChromaOptions: ACCENT_SURFACE_TAPER_CHROMA
		},
		surface4: {
			...BG_RAMP_CONFIG.surface4,
			taperChromaOptions: ACCENT_SURFACE_TAPER_CHROMA
		},
		surface5: {
			...BG_RAMP_CONFIG.surface5,
			taperChromaOptions: ACCENT_SURFACE_TAPER_CHROMA
		},
		surface6: {
			...BG_RAMP_CONFIG.surface6,
			taperChromaOptions: ACCENT_SURFACE_TAPER_CHROMA
		},
		bgFill1: { contrast: {
			reference: "seed",
			followDirection: "main",
			target: 1
		} },
		stroke1: { ...BG_RAMP_CONFIG.stroke1 },
		stroke2: { ...BG_RAMP_CONFIG.stroke2 },
		stroke3: {
			...BG_RAMP_CONFIG.stroke3,
			sameAsIfPossible: "fgSurface3",
			taperChromaOptions: void 0
		},
		stroke4: {
			...BG_RAMP_CONFIG.stroke4,
			taperChromaOptions: void 0
		},
		fgSurface1: {
			...BG_RAMP_CONFIG.fgSurface1,
			taperChromaOptions: void 0
		},
		fgSurface2: {
			...BG_RAMP_CONFIG.fgSurface2,
			taperChromaOptions: void 0
		},
		fgSurface3: {
			...BG_RAMP_CONFIG.fgSurface3,
			taperChromaOptions: void 0,
			sameAsIfPossible: "bgFill1"
		},
		fgSurface4: {
			...BG_RAMP_CONFIG.fgSurface4,
			taperChromaOptions: void 0
		}
	};

// packages/theme/build-module/color-ramps/index.mjs
/**
	* Creates a background ramp.
	* @param seed The seed color for the background ramp.
	*/
	function buildBgRamp(seed) {
		if (typeof seed !== "string" || seed.trim() === "") throw new Error("Seed color must be a non-empty string");
		return buildRamp(seed, BG_RAMP_CONFIG);
	}
	const STEP_TO_PIN = "surface2";
	function getBgRampInfo(ramp) {
		ColorSpace.register(srgb_default);
		return {
			mainDirection: ramp.direction,
			pinLightness: {
				stepName: STEP_TO_PIN,
				value: clampAccentScaleReferenceLightness(get(ramp.ramp[STEP_TO_PIN], [oklch_default, "l"]), ramp.direction)
			}
		};
	}
	/**
	* Creates an accent ramp (ie used by primary, success, info, warning and error
	* ramps).
	* @param seed   The seed color for the accent ramp.
	* @param bgRamp The ramp of the background on which the accent is shown.
	*/
	function buildAccentRamp(seed, bgRamp) {
		if (typeof seed !== "string" || seed.trim() === "") throw new Error("Seed color must be a non-empty string");
		const bgRampInfo = bgRamp ? getBgRampInfo(bgRamp) : void 0;
		return buildRamp(seed, ACCENT_RAMP_CONFIG, bgRampInfo);
	}

// packages/theme/build-module/color-ramps/lib/default-ramps.mjs
	const DEFAULT_RAMPS = {
		background: {
			ramp: {
				surface2: "#fcfcfc",
				bgFill1: "#555",
				bgFill2: "#484848",
				fgFill: "#f0f0f0",
				surface6: "#d6d6d6",
				surface5: "#e6e6e6",
				surface4: "#ededed",
				surface3: "#fff",
				fgSurface4: "#1e1e1e",
				fgSurface3: "#707070",
				fgSurface2: "#8d8d8d",
				fgSurface1: "#aeaeae",
				stroke3: "#8d8d8d",
				stroke4: "#6e6e6e",
				stroke2: "#dbdbdb",
				stroke1: "#f0f0f0",
				bgFillDark: "#1e1e1e",
				fgFillDark: "#f0f0f0",
				bgFillInverted2: "#1e1e1e",
				bgFillInverted1: "#2d2d2d",
				fgFillInverted: "#f0f0f0",
				surface1: "#f4f4f4"
			},
			direction: "darker"
		},
		primary: {
			ramp: {
				bgFill1: "#3858e9",
				bgFill2: "#2e49d9",
				fgFill: "#eff0f2",
				surface2: "#f6f8fe",
				surface6: "#c7d2ee",
				surface5: "#dce3f4",
				surface4: "#e5eaf7",
				surface3: "#fff",
				fgSurface4: "#0b0070",
				fgSurface3: "#3858e9",
				fgSurface2: "#5a82ff",
				fgSurface1: "#86a9ff",
				stroke3: "#3858e9",
				stroke4: "#2337c8",
				stroke2: "#9aaad1",
				stroke1: "#aebbda",
				bgFillDark: "#1a1e27",
				fgFillDark: "#eff0f2",
				bgFillInverted2: "#1a1e27",
				bgFillInverted1: "#13009f",
				fgFillInverted: "#eff0f2",
				surface1: "#ecf0fa"
			},
			direction: "darker"
		},
		info: {
			ramp: {
				bgFill1: "#0090ff",
				bgFill2: "#007fed",
				fgFill: "#12161a",
				surface2: "#f3f9ff",
				surface6: "#bcd5f2",
				surface5: "#d3e4f7",
				surface4: "#deebfa",
				surface3: "#fff",
				fgSurface4: "#001b4f",
				fgSurface3: "#006bd7",
				fgSurface2: "#008bfa",
				fgSurface1: "#59b0ff",
				stroke3: "#006bd7",
				stroke4: "#004fa9",
				stroke2: "#95b5d9",
				stroke1: "#adc6e2",
				bgFillDark: "#1a1f24",
				fgFillDark: "#eef0f2",
				bgFillInverted2: "#1a1f24",
				bgFillInverted1: "#002a69",
				fgFillInverted: "#eef0f2",
				surface1: "#e7f1fd"
			},
			direction: "darker"
		},
		success: {
			ramp: {
				bgFill1: "#4ab866",
				bgFill2: "#37a756",
				fgFill: "#1b1f1c",
				surface2: "#ebffed",
				surface6: "#89e89c",
				surface5: "#a7f5b5",
				surface4: "#c2f8ca",
				surface3: "#fff",
				fgSurface4: "#002900",
				fgSurface3: "#008030",
				fgSurface2: "#2b9f4e",
				fgSurface1: "#54c16e",
				stroke3: "#008030",
				stroke4: "#006113",
				stroke2: "#84c08f",
				stroke1: "#92d39d",
				bgFillDark: "#1b1f1c",
				fgFillDark: "#ecf2ec",
				bgFillInverted2: "#1b1f1c",
				bgFillInverted1: "#003701",
				fgFillInverted: "#ecf2ec",
				surface1: "#d4fbd9"
			},
			direction: "darker"
		},
		caution: {
			ramp: {
				bgFill1: "#f0d149",
				bgFill2: "#dcbe2f",
				fgFill: "#1f1e1b",
				surface2: "#fff9ca",
				surface6: "#e8d170",
				surface5: "#f7e28a",
				surface4: "#fee995",
				surface3: "#fff",
				fgSurface4: "#281d00",
				fgSurface3: "#836a00",
				fgSurface2: "#a48700",
				fgSurface1: "#c7a800",
				stroke3: "#836a00",
				stroke4: "#634f00",
				stroke2: "#bdb17e",
				stroke1: "#d0c28b",
				bgFillDark: "#1f1e1b",
				fgFillDark: "#faf1c9",
				bgFillInverted2: "#1f1e1b",
				bgFillInverted1: "#392c00",
				fgFillInverted: "#faf1c9",
				surface1: "#ffefa9"
			},
			direction: "darker"
		},
		warning: {
			ramp: {
				bgFill1: "#f0b849",
				bgFill2: "#dda633",
				fgFill: "#1f1e1b",
				surface2: "#fff7e1",
				surface6: "#f3cc86",
				surface5: "#fadead",
				surface4: "#fde6be",
				surface3: "#fff",
				fgSurface4: "#2e1900",
				fgSurface3: "#936300",
				fgSurface2: "#b57f00",
				fgSurface1: "#d7a02b",
				stroke3: "#936300",
				stroke4: "#704900",
				stroke2: "#c8ad7f",
				stroke1: "#e1bd7c",
				bgFillDark: "#1f1e1b",
				fgFillDark: "#f5efe5",
				bgFillInverted2: "#1f1e1b",
				bgFillInverted1: "#422800",
				fgFillInverted: "#f5efe5",
				surface1: "#ffeccb"
			},
			direction: "darker"
		},
		error: {
			ramp: {
				bgFill1: "#cc1818",
				bgFill2: "#b90000",
				fgFill: "#f2efef",
				surface2: "#fff6f5",
				surface6: "#f2c9c3",
				surface5: "#f7dbd7",
				surface4: "#fae5e1",
				surface3: "#fff",
				fgSurface4: "#470000",
				fgSurface3: "#cc1818",
				fgSurface2: "#f74c40",
				fgSurface1: "#ff8879",
				stroke3: "#cc1818",
				stroke4: "#9d0000",
				stroke2: "#d99a91",
				stroke1: "#e0afa7",
				bgFillDark: "#231c1b",
				fgFillDark: "#f2efef",
				bgFillInverted2: "#231c1b",
				bgFillInverted1: "#640000",
				fgFillInverted: "#f2efef",
				surface1: "#fcece9"
			},
			direction: "darker"
		}
	};

// packages/theme/build-module/semantic-color-contrast-pairs.mjs
/**
	* Semantic color token paths used together for normal text.
	*
	* Paths omit the shared `wpds-color` prefix so build configuration and runtime
	* tests can adapt the same pairs to DTCG token IDs and CSS custom properties.
	*/
	const MINIMUM_TEXT_CONTRAST = 4.5;
	const SEMANTIC_COLOR_CONTRAST_PAIRS = [
		{
			background: "background.interactive.neutral",
			foreground: "foreground.interactive.neutral"
		},
		{
			background: "background.interactive.neutral",
			foreground: "foreground.interactive.neutral-weak"
		},
		{
			background: "background.interactive.neutral-active",
			foreground: "foreground.interactive.neutral"
		},
		{
			background: "background.interactive.neutral-active",
			foreground: "foreground.interactive.neutral-weak"
		},
		{
			background: "background.interactive.neutral-weak-active",
			foreground: "foreground.interactive.neutral-active"
		},
		{
			background: "background.surface.neutral",
			foreground: "foreground.content.neutral"
		},
		{
			background: "background.surface.neutral-strong",
			foreground: "foreground.content.neutral"
		},
		{
			background: "background.surface.neutral-weak",
			foreground: "foreground.content.neutral"
		},
		{
			background: "background.surface.neutral",
			foreground: "foreground.content.neutral-weak"
		},
		{
			background: "background.surface.info",
			foreground: "foreground.content.info"
		},
		{
			background: "background.surface.info-weak",
			foreground: "foreground.content.info-weak"
		},
		{
			background: "background.surface.success",
			foreground: "foreground.content.success"
		},
		{
			background: "background.surface.success-weak",
			foreground: "foreground.content.success-weak"
		},
		{
			background: "background.surface.warning",
			foreground: "foreground.content.warning"
		},
		{
			background: "background.surface.warning-weak",
			foreground: "foreground.content.warning-weak"
		},
		{
			background: "background.surface.caution",
			foreground: "foreground.content.caution"
		},
		{
			background: "background.surface.caution-weak",
			foreground: "foreground.content.caution-weak"
		},
		{
			background: "background.surface.error",
			foreground: "foreground.content.error"
		},
		{
			background: "background.surface.error-weak",
			foreground: "foreground.content.error-weak"
		},
		{
			background: "background.interactive.brand-strong",
			foreground: "foreground.interactive.brand-strong"
		},
		{
			background: "background.interactive.brand-strong-active",
			foreground: "foreground.interactive.brand-strong-active"
		},
		{
			background: "background.interactive.error-strong",
			foreground: "foreground.interactive.error-strong"
		},
		{
			background: "background.interactive.error-strong-active",
			foreground: "foreground.interactive.error-strong-active"
		},
		{
			background: "background.interactive.neutral-strong",
			foreground: "foreground.interactive.neutral-strong"
		},
		{
			background: "background.interactive.neutral-strong-active",
			foreground: "foreground.interactive.neutral-strong-active"
		}
	];
	const SEMANTIC_FOCUS_CONTRAST_PAIRS = [
		"background.surface.neutral",
		"background.surface.neutral-strong",
		"background.surface.neutral-weak",
		"background.surface.brand"
	].flatMap((background) => [
		"stroke.focus",
		"background.interactive.brand-strong",
		"background.interactive.brand-strong-active"
	].map((foreground) => ({
		background,
		foreground
	})));
	function getSemanticColorCustomProperty(token) {
		return `--wpds-color-${token.replaceAll(".", "-")}`;
	}

// packages/theme/build-module/theme-provider-color-warnings.mjs
	function collectThemeProviderColorWarnings(ramps, colorValues) {
		const warnings = [];
		for (const [rampName, result] of ramps) for (const step of result.warnings ?? []) warnings.push({
			type: "ramp",
			ramp: rampName,
			step
		});
		for (const { background: backgroundToken, foreground: foregroundToken, requiredContrast } of [...SEMANTIC_COLOR_CONTRAST_PAIRS.map((pair) => ({
			...pair,
			requiredContrast: MINIMUM_TEXT_CONTRAST
		})), ...SEMANTIC_FOCUS_CONTRAST_PAIRS.map((pair) => ({
			...pair,
			requiredContrast: 3
		}))]) {
			const backgroundColor = colorValues.get(getSemanticColorCustomProperty(backgroundToken));
			const foregroundColor = colorValues.get(getSemanticColorCustomProperty(foregroundToken));
			if (backgroundColor === void 0 || foregroundColor === void 0) continue;
			const achievedContrast = getContrast(backgroundColor, foregroundColor);
			if (achievedContrast < requiredContrast) warnings.push({
				type: "contrast",
				backgroundToken,
				backgroundColor,
				foregroundToken,
				foregroundColor,
				requiredContrast,
				achievedContrast
			});
		}
		return warnings;
	}

// packages/theme/build-module/use-theme-provider-styles.mjs
	const getCachedBgRamp = memize(buildBgRamp, { maxSize: 10 });
	const getCachedAccentRamp = memize(buildAccentRamp, { maxSize: 10 });
	function getBgRamp(seed) {
		return seed === DEFAULT_SEED_COLORS.background ? DEFAULT_RAMPS.background : getCachedBgRamp(seed);
	}
	function getAccentRamp(rampName, seed, bgRamp) {
		return bgRamp === DEFAULT_RAMPS.background && seed === DEFAULT_SEED_COLORS[rampName] ? DEFAULT_RAMPS[rampName] : getCachedAccentRamp(seed, bgRamp);
	}
	const legacyWpComponentsOverridesCSS = [
		["--wp-components-color-accent", "var(--wp-admin-theme-color)"],
		["--wp-components-color-accent-darker-10", "var(--wp-admin-theme-color-darker-10)"],
		["--wp-components-color-accent-darker-20", "var(--wp-admin-theme-color-darker-20)"],
		["--wp-components-color-accent-inverted", "var(--wpds-color-foreground-interactive-brand-strong, #fff)"],
		["--wp-components-color-background", "var(--wpds-color-background-surface-neutral-strong, #fff)"],
		["--wp-components-color-foreground", "var(--wpds-color-foreground-content-neutral, #1e1e1e)"],
		["--wp-components-color-foreground-inverted", "var(--wpds-color-background-surface-neutral, #fcfcfc)"],
		["--wp-components-color-gray-100", "var(--wpds-color-background-surface-neutral, #fcfcfc)"],
		["--wp-components-color-gray-200", "var(--wpds-color-stroke-surface-neutral, #dbdbdb)"],
		["--wp-components-color-gray-300", "var(--wpds-color-stroke-surface-neutral, #dbdbdb)"],
		["--wp-components-color-gray-400", "var(--wpds-color-stroke-interactive-neutral, #8d8d8d)"],
		["--wp-components-color-gray-600", "var(--wpds-color-stroke-interactive-neutral, #8d8d8d)"],
		["--wp-components-color-gray-700", "var(--wpds-color-foreground-content-neutral-weak, #707070)"],
		["--wp-components-color-gray-800", "var(--wpds-color-foreground-content-neutral, #1e1e1e)"]
	];
	function customRgbFormat(color) {
		return to(color, srgb_default).coords.map((n) => Math.round((n ?? 0) * 255)).join(", ");
	}
	function legacyWpAdminThemeOverridesCSS(accent) {
		ColorSpace.register(srgb_default);
		const parsedAccent = to(accent, hsl_default);
		const parsedL = parsedAccent.coords[2] ?? 0;
		const darker10 = set(clone(parsedAccent), [hsl_default, "l"], Math.max(0, parsedL - 5));
		const darker20 = set(clone(parsedAccent), [hsl_default, "l"], Math.max(0, parsedL - 10));
		return [
			["--wp-admin-theme-color", getColorString(parsedAccent)],
			["--wp-admin-theme-color--rgb", customRgbFormat(parsedAccent)],
			["--wp-admin-theme-color-darker-10", getColorString(darker10)],
			["--wp-admin-theme-color-darker-10--rgb", customRgbFormat(darker10)],
			["--wp-admin-theme-color-darker-20", getColorString(darker20)],
			["--wp-admin-theme-color-darker-20--rgb", customRgbFormat(darker20)]
		];
	}
	function colorTokensCSS(computedColorRamps) {
		const entries = [];
		for (const [rampName, { ramp }] of computedColorRamps) for (const [tokenName, tokenValue] of Object.entries(ramp)) {
			const key = `${rampName === "background" ? "bg" : rampName}-${tokenName}`;
			const aliasedBy = color_tokens_default[key] ?? [];
			for (const aliasedId of aliasedBy) entries.push([`--wpds-color-${aliasedId}`, tokenValue]);
		}
		return entries;
	}
	function generateStyles({ primary, colorEntries }) {
		return Object.fromEntries([
			colorEntries,
			legacyWpAdminThemeOverridesCSS(primary),
			legacyWpComponentsOverridesCSS
		].flat());
	}
	function generateThemeProviderColors(primary, background) {
		const seeds = {
			...DEFAULT_SEED_COLORS,
			background,
			primary
		};
		const computedColorRamps = /* @__PURE__ */ new Map();
		const bgRamp = getBgRamp(seeds.background);
		for (const [rawRampName, seed] of Object.entries(seeds)) {
			const rampName = rawRampName;
			computedColorRamps.set(rampName, rampName === "background" ? bgRamp : getAccentRamp(rampName, seed, bgRamp));
		}
		const colorEntries = colorTokensCSS(computedColorRamps);
		return {
			styles: generateStyles({
				primary: seeds.primary,
				colorEntries
			}),
			warnings: collectThemeProviderColorWarnings(computedColorRamps, new Map(colorEntries))
		};
	}
	function useThemeProviderStyles({ color = {}, cursor, cornerRadius } = {}) {
		const { resolvedSettings: inheritedSettings } = (0, _wordpress_element.useContext)(ThemeContext);
		const hasColor = color.primary !== void 0 || color.background !== void 0 || inheritedSettings.color?.primary !== void 0 || inheritedSettings.color?.background !== void 0;
		const primary = hasColor ? color.primary ?? inheritedSettings.color?.primary ?? DEFAULT_SEED_COLORS.primary : void 0;
		const background = hasColor ? color.background ?? inheritedSettings.color?.background ?? DEFAULT_SEED_COLORS.background : void 0;
		const cursorControl = cursor?.control ?? inheritedSettings.cursor?.control;
		const cornerRadiusPreset = cornerRadius ?? inheritedSettings.cornerRadius ?? "subtle";
		const resolvedSettings = (0, _wordpress_element.useMemo)(() => ({
			color: {
				primary,
				background
			},
			cursor: cursorControl ? { control: cursorControl } : void 0,
			cornerRadius: cornerRadiusPreset
		}), [
			primary,
			background,
			cursorControl,
			cornerRadiusPreset
		]);
		const generatedColors = (0, _wordpress_element.useMemo)(() => {
			if (primary === void 0 || background === void 0) return {
				styles: {},
				warnings: void 0
			};
			return generateThemeProviderColors(primary, background);
		}, [primary, background]);
		return {
			resolvedSettings,
			themeProviderStyles: (0, _wordpress_element.useMemo)(() => ({
				...generatedColors.styles,
				...cursorControl && { "--wpds-cursor-control": cursorControl }
			}), [generatedColors.styles, cursorControl]),
			colorWarnings: generatedColors.warnings
		};
	}

// packages/theme/build-module/theme-provider.mjs
	const STYLE_HASH_ATTRIBUTE = "data-wp-hash";
	/**
	* Returns the shared style runtime registry.
	*
	* The registry is stored on `globalThis` so separately bundled copies of this
	* package can coordinate through the same document and style maps.
	*
	* @return The shared runtime registry.
	*/
	function getRuntime() {
		const globalScope = globalThis;
		if (globalScope.__wpStyleRuntime) return globalScope.__wpStyleRuntime;
		globalScope.__wpStyleRuntime = {
			documents: /* @__PURE__ */ new Map(),
			styles: /* @__PURE__ */ new Map(),
			injectedStyles: /* @__PURE__ */ new WeakMap()
		};
		if (typeof document !== "undefined") registerDocument(document);
		return globalScope.__wpStyleRuntime;
	}
	/**
	* Checks whether a document already contains a style tag for a hash.
	*
	* @param targetDocument Document to inspect.
	* @param hash           Stable hash for the transformed CSS.
	*
	* @return Whether the style hash already exists in the document.
	*/
	function documentContainsStyleHash(targetDocument, hash) {
		if (!targetDocument.head) return false;
		for (const style of targetDocument.head.querySelectorAll(`style[${STYLE_HASH_ATTRIBUTE}]`)) if (style.getAttribute(STYLE_HASH_ATTRIBUTE) === hash) return true;
		return false;
	}
	/**
	* Injects a registered style into a document, unless that document already
	* contains a style tag for the same hash.
	*
	* @param targetDocument Document to inject the style into.
	* @param hash           Stable hash for the transformed CSS.
	* @param css            CSS text to inject.
	*/
	function injectStyle(targetDocument, hash, css) {
		if (!targetDocument.head) return;
		const runtime = getRuntime();
		let injectedStyles = runtime.injectedStyles.get(targetDocument);
		if (!injectedStyles) {
			injectedStyles = /* @__PURE__ */ new Set();
			runtime.injectedStyles.set(targetDocument, injectedStyles);
		}
		if (injectedStyles.has(hash)) return;
		if (documentContainsStyleHash(targetDocument, hash)) {
			injectedStyles.add(hash);
			return;
		}
		const style = targetDocument.createElement("style");
		style.setAttribute(STYLE_HASH_ATTRIBUTE, hash);
		style.appendChild(targetDocument.createTextNode(css));
		targetDocument.head.appendChild(style);
		injectedStyles.add(hash);
	}
	/**
	* Registers a document as a style injection target.
	*
	* Existing registered styles are replayed into the document immediately.
	* Documents are reference-counted so multiple providers can safely register the
	* same document without one cleanup removing it while another registration is
	* still active.
	*
	* @param targetDocument Document to receive registered styles.
	* @return Cleanup function that unregisters this document registration.
	*/
	function registerDocument(targetDocument) {
		const runtime = getRuntime();
		runtime.documents.set(targetDocument, (runtime.documents.get(targetDocument) ?? 0) + 1);
		for (const [hash, css] of runtime.styles) injectStyle(targetDocument, hash, css);
		return () => {
			const count = runtime.documents.get(targetDocument);
			if (count === void 0) return;
			if (count <= 1) {
				runtime.documents.delete(targetDocument);
				return;
			}
			runtime.documents.set(targetDocument, count - 1);
		};
	}
	/**
	* Registers a style and injects it into all registered documents.
	*
	* The hash is used as the deduplication key, so calling this repeatedly with
	* the same hash will not add duplicate style tags to a document.
	* Registered styles are retained for the lifetime of the page so they can be
	* replayed into documents that are registered later.
	*
	* @param hash Stable hash for the transformed CSS.
	* @param css  CSS text to inject.
	*/
	function registerStyle(hash, css) {
		const runtime = getRuntime();
		runtime.styles.set(hash, css);
		for (const targetDocument of runtime.documents.keys()) injectStyle(targetDocument, hash, css);
	}
	registerStyle("a4c4016022", "._469c5f47eb2ba16a__wrapper{display:contents}");
	var style_module_default = { "wrapper": "_469c5f47eb2ba16a__wrapper" };
	const rootProviderCountByDocument = /* @__PURE__ */ new WeakMap();
	/**
	* Context provider that generates a theme from a set of seed color values and
	* configuration, producing a set of design token overrides as CSS custom
	* properties.
	*/
	const ThemeProvider = ({ children, color = {}, cursor, cornerRadius, isRoot = false, onColorWarnings }) => {
		const { themeProviderStyles, resolvedSettings, colorWarnings } = useThemeProviderStyles({
			color,
			cursor,
			cornerRadius
		});
		const cornerRadiusPreset = resolvedSettings.cornerRadius ?? "subtle";
		const onColorWarningsEvent = (0, _wordpress_compose.useEvent)(onColorWarnings);
		const contextValue = (0, _wordpress_element.useMemo)(() => ({ resolvedSettings }), [resolvedSettings]);
		const wrapperRef = (0, _wordpress_element.useRef)(null);
		(0, _wordpress_element.useEffect)(() => {
			if (colorWarnings !== void 0) onColorWarningsEvent(colorWarnings);
		}, [colorWarnings, onColorWarningsEvent]);
		(0, _wordpress_compose.useIsomorphicLayoutEffect)(() => {
			if (!isRoot) return;
			const doc = wrapperRef.current?.ownerDocument;
			if (!doc) return;
			const root = doc.documentElement;
			{
				const active = rootProviderCountByDocument.get(doc) ?? 0;
				if (active > 0) console.warn("ThemeProvider: More than one root provider (`isRoot`) is mounted on the same document. Their forwarded document-level styles conflict, and unmounting one can reset the others. Render a single root provider per document.");
				rootProviderCountByDocument.set(doc, active + 1);
			}
			const previous = new Map(Array.from(root.style, (key) => [key, {
				value: root.style.getPropertyValue(key),
				priority: root.style.getPropertyPriority(key)
			}]));
			const applied = [];
			const previousRootProvider = root.getAttribute("data-wpds-root-provider");
			const previousCornerRadius = root.getAttribute("data-wpds-corner-radius");
			root.setAttribute("data-wpds-root-provider", "true");
			root.setAttribute("data-wpds-corner-radius", cornerRadiusPreset);
			for (const [rawKey, rawValue] of Object.entries(themeProviderStyles)) {
				if (!rawKey.startsWith("--") || rawValue === null || rawValue === void 0) continue;
				root.style.setProperty(rawKey, String(rawValue));
				applied.push(rawKey);
			}
			return () => {
				{
					const active = rootProviderCountByDocument.get(doc) ?? 1;
					if (active <= 1) rootProviderCountByDocument.delete(doc);
					else rootProviderCountByDocument.set(doc, active - 1);
				}
				for (const key of applied) {
					const previousProperty = previous.get(key);
					if (previousProperty) root.style.setProperty(key, previousProperty.value || " ", previousProperty.priority);
					else root.style.removeProperty(key);
				}
				if (previousRootProvider === null) root.removeAttribute("data-wpds-root-provider");
				else root.setAttribute("data-wpds-root-provider", previousRootProvider);
				if (previousCornerRadius === null) root.removeAttribute("data-wpds-corner-radius");
				else root.setAttribute("data-wpds-corner-radius", previousCornerRadius);
			};
		}, [
			cornerRadiusPreset,
			isRoot,
			themeProviderStyles
		]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			ref: wrapperRef,
			"data-wpds-root-provider": isRoot || void 0,
			"data-wpds-corner-radius": cornerRadiusPreset,
			className: style_module_default.wrapper,
			style: themeProviderStyles,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeContext.Provider, {
				value: contextValue,
				children
			})
		});
	};

// packages/theme/build-module/private-apis.mjs
	function warnPrivateApi(apiName, options = {}) {
		(0, _wordpress_deprecated.default)(`\`privateApis.${apiName}\` from \`@wordpress/theme\``, {
			since: "7.1",
			version: "7.3",
			...options
		});
	}
	/**
	* @deprecated Private `@wordpress/theme` APIs will be removed in WordPress 7.3.
	* Use public `@wordpress/theme` APIs for supported theming use cases.
	*/
	const privateApis = {};
	lock(privateApis, {
		get ThemeProvider() {
			warnPrivateApi("ThemeProvider", { alternative: "`ThemeProvider` from `@wordpress/theme`" });
			return ThemeProvider;
		},
		get useThemeProviderStyles() {
			warnPrivateApi("useThemeProviderStyles", {
				alternative: "`ThemeProvider` from `@wordpress/theme` for supported theming use cases",
				hint: "`useThemeProviderStyles` has no public replacement."
			});
			return useThemeProviderStyles;
		}
	});

exports.ThemeProvider = ThemeProvider;
exports.privateApis = privateApis;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).theme = exports;
return exports;
})({}, window.wp.deprecated, window.wp.privateApis, window.wp.element, window.wp.compose, window.ReactJSXRuntime);
//# sourceMappingURL=index.js.map