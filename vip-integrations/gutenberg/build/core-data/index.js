/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 3249:
/***/ ((module) => {

"use strict";


function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

/**
 * Given an instance of EquivalentKeyMap, returns its internal value pair tuple
 * for a key, if one exists. The tuple members consist of the last reference
 * value for the key (used in efficient subsequent lookups) and the value
 * assigned for the key at the leaf node.
 *
 * @param {EquivalentKeyMap} instance EquivalentKeyMap instance.
 * @param {*} key                     The key for which to return value pair.
 *
 * @return {?Array} Value pair, if exists.
 */
function getValuePair(instance, key) {
  var _map = instance._map,
      _arrayTreeMap = instance._arrayTreeMap,
      _objectTreeMap = instance._objectTreeMap; // Map keeps a reference to the last object-like key used to set the
  // value, which can be used to shortcut immediately to the value.

  if (_map.has(key)) {
    return _map.get(key);
  } // Sort keys to ensure stable retrieval from tree.


  var properties = Object.keys(key).sort(); // Tree by type to avoid conflicts on numeric object keys, empty value.

  var map = Array.isArray(key) ? _arrayTreeMap : _objectTreeMap;

  for (var i = 0; i < properties.length; i++) {
    var property = properties[i];
    map = map.get(property);

    if (map === undefined) {
      return;
    }

    var propertyValue = key[property];
    map = map.get(propertyValue);

    if (map === undefined) {
      return;
    }
  }

  var valuePair = map.get('_ekm_value');

  if (!valuePair) {
    return;
  } // If reached, it implies that an object-like key was set with another
  // reference, so delete the reference and replace with the current.


  _map.delete(valuePair[0]);

  valuePair[0] = key;
  map.set('_ekm_value', valuePair);

  _map.set(key, valuePair);

  return valuePair;
}
/**
 * Variant of a Map object which enables lookup by equivalent (deeply equal)
 * object and array keys.
 */


var EquivalentKeyMap =
/*#__PURE__*/
function () {
  /**
   * Constructs a new instance of EquivalentKeyMap.
   *
   * @param {Iterable.<*>} iterable Initial pair of key, value for map.
   */
  function EquivalentKeyMap(iterable) {
    _classCallCheck(this, EquivalentKeyMap);

    this.clear();

    if (iterable instanceof EquivalentKeyMap) {
      // Map#forEach is only means of iterating with support for IE11.
      var iterablePairs = [];
      iterable.forEach(function (value, key) {
        iterablePairs.push([key, value]);
      });
      iterable = iterablePairs;
    }

    if (iterable != null) {
      for (var i = 0; i < iterable.length; i++) {
        this.set(iterable[i][0], iterable[i][1]);
      }
    }
  }
  /**
   * Accessor property returning the number of elements.
   *
   * @return {number} Number of elements.
   */


  _createClass(EquivalentKeyMap, [{
    key: "set",

    /**
     * Add or update an element with a specified key and value.
     *
     * @param {*} key   The key of the element to add.
     * @param {*} value The value of the element to add.
     *
     * @return {EquivalentKeyMap} Map instance.
     */
    value: function set(key, value) {
      // Shortcut non-object-like to set on internal Map.
      if (key === null || _typeof(key) !== 'object') {
        this._map.set(key, value);

        return this;
      } // Sort keys to ensure stable assignment into tree.


      var properties = Object.keys(key).sort();
      var valuePair = [key, value]; // Tree by type to avoid conflicts on numeric object keys, empty value.

      var map = Array.isArray(key) ? this._arrayTreeMap : this._objectTreeMap;

      for (var i = 0; i < properties.length; i++) {
        var property = properties[i];

        if (!map.has(property)) {
          map.set(property, new EquivalentKeyMap());
        }

        map = map.get(property);
        var propertyValue = key[property];

        if (!map.has(propertyValue)) {
          map.set(propertyValue, new EquivalentKeyMap());
        }

        map = map.get(propertyValue);
      } // If an _ekm_value exists, there was already an equivalent key. Before
      // overriding, ensure that the old key reference is removed from map to
      // avoid memory leak of accumulating equivalent keys. This is, in a
      // sense, a poor man's WeakMap, while still enabling iterability.


      var previousValuePair = map.get('_ekm_value');

      if (previousValuePair) {
        this._map.delete(previousValuePair[0]);
      }

      map.set('_ekm_value', valuePair);

      this._map.set(key, valuePair);

      return this;
    }
    /**
     * Returns a specified element.
     *
     * @param {*} key The key of the element to return.
     *
     * @return {?*} The element associated with the specified key or undefined
     *              if the key can't be found.
     */

  }, {
    key: "get",
    value: function get(key) {
      // Shortcut non-object-like to get from internal Map.
      if (key === null || _typeof(key) !== 'object') {
        return this._map.get(key);
      }

      var valuePair = getValuePair(this, key);

      if (valuePair) {
        return valuePair[1];
      }
    }
    /**
     * Returns a boolean indicating whether an element with the specified key
     * exists or not.
     *
     * @param {*} key The key of the element to test for presence.
     *
     * @return {boolean} Whether an element with the specified key exists.
     */

  }, {
    key: "has",
    value: function has(key) {
      if (key === null || _typeof(key) !== 'object') {
        return this._map.has(key);
      } // Test on the _presence_ of the pair, not its value, as even undefined
      // can be a valid member value for a key.


      return getValuePair(this, key) !== undefined;
    }
    /**
     * Removes the specified element.
     *
     * @param {*} key The key of the element to remove.
     *
     * @return {boolean} Returns true if an element existed and has been
     *                   removed, or false if the element does not exist.
     */

  }, {
    key: "delete",
    value: function _delete(key) {
      if (!this.has(key)) {
        return false;
      } // This naive implementation will leave orphaned child trees. A better
      // implementation should traverse and remove orphans.


      this.set(key, undefined);
      return true;
    }
    /**
     * Executes a provided function once per each key/value pair, in insertion
     * order.
     *
     * @param {Function} callback Function to execute for each element.
     * @param {*}        thisArg  Value to use as `this` when executing
     *                            `callback`.
     */

  }, {
    key: "forEach",
    value: function forEach(callback) {
      var _this = this;

      var thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this;

      this._map.forEach(function (value, key) {
        // Unwrap value from object-like value pair.
        if (key !== null && _typeof(key) === 'object') {
          value = value[1];
        }

        callback.call(thisArg, value, key, _this);
      });
    }
    /**
     * Removes all elements.
     */

  }, {
    key: "clear",
    value: function clear() {
      this._map = new Map();
      this._arrayTreeMap = new Map();
      this._objectTreeMap = new Map();
    }
  }, {
    key: "size",
    get: function get() {
      return this._map.size;
    }
  }]);

  return EquivalentKeyMap;
}();

module.exports = EquivalentKeyMap;


/***/ }),

/***/ 7734:
/***/ ((module) => {

"use strict";


// do not edit .js files directly - edit src/index.jst


  var envHasBigInt64Array = typeof BigInt64Array !== 'undefined';


module.exports = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }


    if ((a instanceof Map) && (b instanceof Map)) {
      if (a.size !== b.size) return false;
      for (i of a.entries())
        if (!b.has(i[0])) return false;
      for (i of a.entries())
        if (!equal(i[1], b.get(i[0]))) return false;
      return true;
    }

    if ((a instanceof Set) && (b instanceof Set)) {
      if (a.size !== b.size) return false;
      for (i of a.entries())
        if (!b.has(i[0])) return false;
      return true;
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (a[i] !== b[i]) return false;
      return true;
    }


    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      var key = keys[i];

      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a!==a && b!==b;
};


/***/ }),

/***/ 7284:
/***/ ((module) => {

/**
 * This library modifies the diff-patch-match library by Neil Fraser
 * by removing the patch and match functionality and certain advanced
 * options in the diff function. The original license is as follows:
 *
 * ===
 *
 * Diff Match and Patch
 *
 * Copyright 2006 Google Inc.
 * http://code.google.com/p/google-diff-match-patch/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */
var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;

/**
 * Find the differences between two texts.  Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {Int|Object} [cursor_pos] Edit position in text1 or object with more info
 * @param {boolean} [cleanup] Apply semantic cleanup before returning.
 * @return {Array} Array of diff tuples.
 */
function diff_main(text1, text2, cursor_pos, cleanup, _fix_unicode) {
  // Check for equality
  if (text1 === text2) {
    if (text1) {
      return [[DIFF_EQUAL, text1]];
    }
    return [];
  }

  if (cursor_pos != null) {
    var editdiff = find_cursor_edit_diff(text1, text2, cursor_pos);
    if (editdiff) {
      return editdiff;
    }
  }

  // Trim off common prefix (speedup).
  var commonlength = diff_commonPrefix(text1, text2);
  var commonprefix = text1.substring(0, commonlength);
  text1 = text1.substring(commonlength);
  text2 = text2.substring(commonlength);

  // Trim off common suffix (speedup).
  commonlength = diff_commonSuffix(text1, text2);
  var commonsuffix = text1.substring(text1.length - commonlength);
  text1 = text1.substring(0, text1.length - commonlength);
  text2 = text2.substring(0, text2.length - commonlength);

  // Compute the diff on the middle block.
  var diffs = diff_compute_(text1, text2);

  // Restore the prefix and suffix.
  if (commonprefix) {
    diffs.unshift([DIFF_EQUAL, commonprefix]);
  }
  if (commonsuffix) {
    diffs.push([DIFF_EQUAL, commonsuffix]);
  }
  diff_cleanupMerge(diffs, _fix_unicode);
  if (cleanup) {
    diff_cleanupSemantic(diffs);
  }
  return diffs;
}

/**
 * Find the differences between two texts.  Assumes that the texts do not
 * have any common prefix or suffix.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @return {Array} Array of diff tuples.
 */
function diff_compute_(text1, text2) {
  var diffs;

  if (!text1) {
    // Just add some text (speedup).
    return [[DIFF_INSERT, text2]];
  }

  if (!text2) {
    // Just delete some text (speedup).
    return [[DIFF_DELETE, text1]];
  }

  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  var i = longtext.indexOf(shorttext);
  if (i !== -1) {
    // Shorter text is inside the longer text (speedup).
    diffs = [
      [DIFF_INSERT, longtext.substring(0, i)],
      [DIFF_EQUAL, shorttext],
      [DIFF_INSERT, longtext.substring(i + shorttext.length)],
    ];
    // Swap insertions for deletions if diff is reversed.
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }

  if (shorttext.length === 1) {
    // Single character string.
    // After the previous speedup, the character can't be an equality.
    return [
      [DIFF_DELETE, text1],
      [DIFF_INSERT, text2],
    ];
  }

  // Check to see if the problem can be split in two.
  var hm = diff_halfMatch_(text1, text2);
  if (hm) {
    // A half-match was found, sort out the return data.
    var text1_a = hm[0];
    var text1_b = hm[1];
    var text2_a = hm[2];
    var text2_b = hm[3];
    var mid_common = hm[4];
    // Send both pairs off for separate processing.
    var diffs_a = diff_main(text1_a, text2_a);
    var diffs_b = diff_main(text1_b, text2_b);
    // Merge the results.
    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
  }

  return diff_bisect_(text1, text2);
}

/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @return {Array} Array of diff tuples.
 * @private
 */
function diff_bisect_(text1, text2) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  var max_d = Math.ceil((text1_length + text2_length) / 2);
  var v_offset = max_d;
  var v_length = 2 * max_d;
  var v1 = new Array(v_length);
  var v2 = new Array(v_length);
  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
  // integers and undefined.
  for (var x = 0; x < v_length; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  var delta = text1_length - text2_length;
  // If the total number of characters is odd, then the front path will collide
  // with the reverse path.
  var front = delta % 2 !== 0;
  // Offsets for start and end of k loop.
  // Prevents mapping of space beyond the grid.
  var k1start = 0;
  var k1end = 0;
  var k2start = 0;
  var k2end = 0;
  for (var d = 0; d < max_d; d++) {
    // Walk the front path one step.
    for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      var k1_offset = v_offset + k1;
      var x1;
      if (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }
      var y1 = x1 - k1;
      while (
        x1 < text1_length &&
        y1 < text2_length &&
        text1.charAt(x1) === text2.charAt(y1)
      ) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) {
        // Ran off the right of the graph.
        k1end += 2;
      } else if (y1 > text2_length) {
        // Ran off the bottom of the graph.
        k1start += 2;
      } else if (front) {
        var k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
          // Mirror x2 onto top-left coordinate system.
          var x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) {
            // Overlap detected.
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }

    // Walk the reverse path one step.
    for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2;
      if (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }
      var y2 = x2 - k2;
      while (
        x2 < text1_length &&
        y2 < text2_length &&
        text1.charAt(text1_length - x2 - 1) ===
          text2.charAt(text2_length - y2 - 1)
      ) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) {
        // Ran off the left of the graph.
        k2end += 2;
      } else if (y2 > text2_length) {
        // Ran off the top of the graph.
        k2start += 2;
      } else if (!front) {
        var k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
          var x1 = v1[k1_offset];
          var y1 = v_offset + x1 - k1_offset;
          // Mirror x2 onto top-left coordinate system.
          x2 = text1_length - x2;
          if (x1 >= x2) {
            // Overlap detected.
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }
  }
  // Diff took too long and hit the deadline or
  // number of diffs equals number of characters, no commonality at all.
  return [
    [DIFF_DELETE, text1],
    [DIFF_INSERT, text2],
  ];
}

/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} x Index of split point in text1.
 * @param {number} y Index of split point in text2.
 * @return {Array} Array of diff tuples.
 */
function diff_bisectSplit_(text1, text2, x, y) {
  var text1a = text1.substring(0, x);
  var text2a = text2.substring(0, y);
  var text1b = text1.substring(x);
  var text2b = text2.substring(y);

  // Compute both diffs serially.
  var diffs = diff_main(text1a, text2a);
  var diffsb = diff_main(text1b, text2b);

  return diffs.concat(diffsb);
}

/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */
function diff_commonPrefix(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerstart = 0;
  while (pointermin < pointermid) {
    if (
      text1.substring(pointerstart, pointermid) ==
      text2.substring(pointerstart, pointermid)
    ) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  if (is_surrogate_pair_start(text1.charCodeAt(pointermid - 1))) {
    pointermid--;
  }

  return pointermid;
}

/**
 * Determine if the suffix of one string is the prefix of another.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of the first
 *     string and the start of the second string.
 * @private
 */
function diff_commonOverlap_(text1, text2) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  // Eliminate the null case.
  if (text1_length == 0 || text2_length == 0) {
    return 0;
  }
  // Truncate the longer string.
  if (text1_length > text2_length) {
    text1 = text1.substring(text1_length - text2_length);
  } else if (text1_length < text2_length) {
    text2 = text2.substring(0, text1_length);
  }
  var text_length = Math.min(text1_length, text2_length);
  // Quick check for the worst case.
  if (text1 == text2) {
    return text_length;
  }

  // Start by looking for a single character match
  // and increase length until no match is found.
  // Performance analysis: http://neil.fraser.name/news/2010/11/04/
  var best = 0;
  var length = 1;
  while (true) {
    var pattern = text1.substring(text_length - length);
    var found = text2.indexOf(pattern);
    if (found == -1) {
      return best;
    }
    length += found;
    if (
      found == 0 ||
      text1.substring(text_length - length) == text2.substring(0, length)
    ) {
      best = length;
      length++;
    }
  }
}

/**
 * Determine the common suffix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 */
function diff_commonSuffix(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 || text1.slice(-1) !== text2.slice(-1)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerend = 0;
  while (pointermin < pointermid) {
    if (
      text1.substring(text1.length - pointermid, text1.length - pointerend) ==
      text2.substring(text2.length - pointermid, text2.length - pointerend)
    ) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  if (is_surrogate_pair_end(text1.charCodeAt(text1.length - pointermid))) {
    pointermid--;
  }

  return pointermid;
}

/**
 * Do the two texts share a substring which is at least half the length of the
 * longer text?
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {Array.<string>} Five element Array, containing the prefix of
 *     text1, the suffix of text1, the prefix of text2, the suffix of
 *     text2 and the common middle.  Or null if there was no match.
 */
function diff_halfMatch_(text1, text2) {
  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    return null; // Pointless.
  }

  /**
   * Does a substring of shorttext exist within longtext such that the substring
   * is at least half the length of longtext?
   * Closure, but does not reference any external variables.
   * @param {string} longtext Longer string.
   * @param {string} shorttext Shorter string.
   * @param {number} i Start index of quarter length substring within longtext.
   * @return {Array.<string>} Five element Array, containing the prefix of
   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
   *     of shorttext and the common middle.  Or null if there was no match.
   * @private
   */
  function diff_halfMatchI_(longtext, shorttext, i) {
    // Start with a 1/4 length substring at position i as a seed.
    var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    var j = -1;
    var best_common = "";
    var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
      var prefixLength = diff_commonPrefix(
        longtext.substring(i),
        shorttext.substring(j)
      );
      var suffixLength = diff_commonSuffix(
        longtext.substring(0, i),
        shorttext.substring(0, j)
      );
      if (best_common.length < suffixLength + prefixLength) {
        best_common =
          shorttext.substring(j - suffixLength, j) +
          shorttext.substring(j, j + prefixLength);
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }
    if (best_common.length * 2 >= longtext.length) {
      return [
        best_longtext_a,
        best_longtext_b,
        best_shorttext_a,
        best_shorttext_b,
        best_common,
      ];
    } else {
      return null;
    }
  }

  // First check if the second quarter is the seed for a half-match.
  var hm1 = diff_halfMatchI_(
    longtext,
    shorttext,
    Math.ceil(longtext.length / 4)
  );
  // Check again based on the third quarter.
  var hm2 = diff_halfMatchI_(
    longtext,
    shorttext,
    Math.ceil(longtext.length / 2)
  );
  var hm;
  if (!hm1 && !hm2) {
    return null;
  } else if (!hm2) {
    hm = hm1;
  } else if (!hm1) {
    hm = hm2;
  } else {
    // Both matched.  Select the longest.
    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
  }

  // A half-match was found, sort out the return data.
  var text1_a, text1_b, text2_a, text2_b;
  if (text1.length > text2.length) {
    text1_a = hm[0];
    text1_b = hm[1];
    text2_a = hm[2];
    text2_b = hm[3];
  } else {
    text2_a = hm[0];
    text2_b = hm[1];
    text1_a = hm[2];
    text1_b = hm[3];
  }
  var mid_common = hm[4];
  return [text1_a, text1_b, text2_a, text2_b, mid_common];
}

/**
 * Reduce the number of edits by eliminating semantically trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
function diff_cleanupSemantic(diffs) {
  var changes = false;
  var equalities = []; // Stack of indices where equalities are found.
  var equalitiesLength = 0; // Keeping our own length var is faster in JS.
  /** @type {?string} */
  var lastequality = null;
  // Always equal to diffs[equalities[equalitiesLength - 1]][1]
  var pointer = 0; // Index of current position.
  // Number of characters that changed prior to the equality.
  var length_insertions1 = 0;
  var length_deletions1 = 0;
  // Number of characters that changed after the equality.
  var length_insertions2 = 0;
  var length_deletions2 = 0;
  while (pointer < diffs.length) {
    if (diffs[pointer][0] == DIFF_EQUAL) {
      // Equality found.
      equalities[equalitiesLength++] = pointer;
      length_insertions1 = length_insertions2;
      length_deletions1 = length_deletions2;
      length_insertions2 = 0;
      length_deletions2 = 0;
      lastequality = diffs[pointer][1];
    } else {
      // An insertion or deletion.
      if (diffs[pointer][0] == DIFF_INSERT) {
        length_insertions2 += diffs[pointer][1].length;
      } else {
        length_deletions2 += diffs[pointer][1].length;
      }
      // Eliminate an equality that is smaller or equal to the edits on both
      // sides of it.
      if (
        lastequality &&
        lastequality.length <=
          Math.max(length_insertions1, length_deletions1) &&
        lastequality.length <= Math.max(length_insertions2, length_deletions2)
      ) {
        // Duplicate record.
        diffs.splice(equalities[equalitiesLength - 1], 0, [
          DIFF_DELETE,
          lastequality,
        ]);
        // Change second copy to insert.
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        // Throw away the equality we just deleted.
        equalitiesLength--;
        // Throw away the previous equality (it needs to be reevaluated).
        equalitiesLength--;
        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
        length_insertions1 = 0; // Reset the counters.
        length_deletions1 = 0;
        length_insertions2 = 0;
        length_deletions2 = 0;
        lastequality = null;
        changes = true;
      }
    }
    pointer++;
  }

  // Normalize the diff.
  if (changes) {
    diff_cleanupMerge(diffs);
  }
  diff_cleanupSemanticLossless(diffs);

  // Find any overlaps between deletions and insertions.
  // e.g: <del>abcxxx</del><ins>xxxdef</ins>
  //   -> <del>abc</del>xxx<ins>def</ins>
  // e.g: <del>xxxabc</del><ins>defxxx</ins>
  //   -> <ins>def</ins>xxx<del>abc</del>
  // Only extract an overlap if it is as big as the edit ahead or behind it.
  pointer = 1;
  while (pointer < diffs.length) {
    if (
      diffs[pointer - 1][0] == DIFF_DELETE &&
      diffs[pointer][0] == DIFF_INSERT
    ) {
      var deletion = diffs[pointer - 1][1];
      var insertion = diffs[pointer][1];
      var overlap_length1 = diff_commonOverlap_(deletion, insertion);
      var overlap_length2 = diff_commonOverlap_(insertion, deletion);
      if (overlap_length1 >= overlap_length2) {
        if (
          overlap_length1 >= deletion.length / 2 ||
          overlap_length1 >= insertion.length / 2
        ) {
          // Overlap found.  Insert an equality and trim the surrounding edits.
          diffs.splice(pointer, 0, [
            DIFF_EQUAL,
            insertion.substring(0, overlap_length1),
          ]);
          diffs[pointer - 1][1] = deletion.substring(
            0,
            deletion.length - overlap_length1
          );
          diffs[pointer + 1][1] = insertion.substring(overlap_length1);
          pointer++;
        }
      } else {
        if (
          overlap_length2 >= deletion.length / 2 ||
          overlap_length2 >= insertion.length / 2
        ) {
          // Reverse overlap found.
          // Insert an equality and swap and trim the surrounding edits.
          diffs.splice(pointer, 0, [
            DIFF_EQUAL,
            deletion.substring(0, overlap_length2),
          ]);
          diffs[pointer - 1][0] = DIFF_INSERT;
          diffs[pointer - 1][1] = insertion.substring(
            0,
            insertion.length - overlap_length2
          );
          diffs[pointer + 1][0] = DIFF_DELETE;
          diffs[pointer + 1][1] = deletion.substring(overlap_length2);
          pointer++;
        }
      }
      pointer++;
    }
    pointer++;
  }
}

var nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
var whitespaceRegex_ = /\s/;
var linebreakRegex_ = /[\r\n]/;
var blanklineEndRegex_ = /\n\r?\n$/;
var blanklineStartRegex_ = /^\r?\n\r?\n/;

/**
 * Look for single edits surrounded on both sides by equalities
 * which can be shifted sideways to align the edit to a word boundary.
 * e.g: The c<ins>at c</ins>ame. -> The <ins>cat </ins>came.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
function diff_cleanupSemanticLossless(diffs) {
  /**
   * Given two strings, compute a score representing whether the internal
   * boundary falls on logical boundaries.
   * Scores range from 6 (best) to 0 (worst).
   * Closure, but does not reference any external variables.
   * @param {string} one First string.
   * @param {string} two Second string.
   * @return {number} The score.
   * @private
   */
  function diff_cleanupSemanticScore_(one, two) {
    if (!one || !two) {
      // Edges are the best.
      return 6;
    }

    // Each port of this function behaves slightly differently due to
    // subtle differences in each language's definition of things like
    // 'whitespace'.  Since this function's purpose is largely cosmetic,
    // the choice has been made to use each language's native features
    // rather than force total conformity.
    var char1 = one.charAt(one.length - 1);
    var char2 = two.charAt(0);
    var nonAlphaNumeric1 = char1.match(nonAlphaNumericRegex_);
    var nonAlphaNumeric2 = char2.match(nonAlphaNumericRegex_);
    var whitespace1 = nonAlphaNumeric1 && char1.match(whitespaceRegex_);
    var whitespace2 = nonAlphaNumeric2 && char2.match(whitespaceRegex_);
    var lineBreak1 = whitespace1 && char1.match(linebreakRegex_);
    var lineBreak2 = whitespace2 && char2.match(linebreakRegex_);
    var blankLine1 = lineBreak1 && one.match(blanklineEndRegex_);
    var blankLine2 = lineBreak2 && two.match(blanklineStartRegex_);

    if (blankLine1 || blankLine2) {
      // Five points for blank lines.
      return 5;
    } else if (lineBreak1 || lineBreak2) {
      // Four points for line breaks.
      return 4;
    } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
      // Three points for end of sentences.
      return 3;
    } else if (whitespace1 || whitespace2) {
      // Two points for whitespace.
      return 2;
    } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
      // One point for non-alphanumeric.
      return 1;
    }
    return 0;
  }

  var pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (
      diffs[pointer - 1][0] == DIFF_EQUAL &&
      diffs[pointer + 1][0] == DIFF_EQUAL
    ) {
      // This is a single edit surrounded by equalities.
      var equality1 = diffs[pointer - 1][1];
      var edit = diffs[pointer][1];
      var equality2 = diffs[pointer + 1][1];

      // First, shift the edit as far left as possible.
      var commonOffset = diff_commonSuffix(equality1, edit);
      if (commonOffset) {
        var commonString = edit.substring(edit.length - commonOffset);
        equality1 = equality1.substring(0, equality1.length - commonOffset);
        edit = commonString + edit.substring(0, edit.length - commonOffset);
        equality2 = commonString + equality2;
      }

      // Second, step character by character right, looking for the best fit.
      var bestEquality1 = equality1;
      var bestEdit = edit;
      var bestEquality2 = equality2;
      var bestScore =
        diff_cleanupSemanticScore_(equality1, edit) +
        diff_cleanupSemanticScore_(edit, equality2);
      while (edit.charAt(0) === equality2.charAt(0)) {
        equality1 += edit.charAt(0);
        edit = edit.substring(1) + equality2.charAt(0);
        equality2 = equality2.substring(1);
        var score =
          diff_cleanupSemanticScore_(equality1, edit) +
          diff_cleanupSemanticScore_(edit, equality2);
        // The >= encourages trailing rather than leading whitespace on edits.
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }

      if (diffs[pointer - 1][1] != bestEquality1) {
        // We have an improvement, save it back to the diff.
        if (bestEquality1) {
          diffs[pointer - 1][1] = bestEquality1;
        } else {
          diffs.splice(pointer - 1, 1);
          pointer--;
        }
        diffs[pointer][1] = bestEdit;
        if (bestEquality2) {
          diffs[pointer + 1][1] = bestEquality2;
        } else {
          diffs.splice(pointer + 1, 1);
          pointer--;
        }
      }
    }
    pointer++;
  }
}

/**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {Array} diffs Array of diff tuples.
 * @param {boolean} fix_unicode Whether to normalize to a unicode-correct diff
 */
function diff_cleanupMerge(diffs, fix_unicode) {
  diffs.push([DIFF_EQUAL, ""]); // Add a dummy entry at the end.
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = "";
  var text_insert = "";
  var commonlength;
  while (pointer < diffs.length) {
    if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
      diffs.splice(pointer, 1);
      continue;
    }
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        var previous_equality = pointer - count_insert - count_delete - 1;
        if (fix_unicode) {
          // prevent splitting of unicode surrogate pairs.  when fix_unicode is true,
          // we assume that the old and new text in the diff are complete and correct
          // unicode-encoded JS strings, but the tuple boundaries may fall between
          // surrogate pairs.  we fix this by shaving off stray surrogates from the end
          // of the previous equality and the beginning of this equality.  this may create
          // empty equalities or a common prefix or suffix.  for example, if AB and AC are
          // emojis, `[[0, 'A'], [-1, 'BA'], [0, 'C']]` would turn into deleting 'ABAC' and
          // inserting 'AC', and then the common suffix 'AC' will be eliminated.  in this
          // particular case, both equalities go away, we absorb any previous inequalities,
          // and we keep scanning for the next equality before rewriting the tuples.
          if (
            previous_equality >= 0 &&
            ends_with_pair_start(diffs[previous_equality][1])
          ) {
            var stray = diffs[previous_equality][1].slice(-1);
            diffs[previous_equality][1] = diffs[previous_equality][1].slice(
              0,
              -1
            );
            text_delete = stray + text_delete;
            text_insert = stray + text_insert;
            if (!diffs[previous_equality][1]) {
              // emptied out previous equality, so delete it and include previous delete/insert
              diffs.splice(previous_equality, 1);
              pointer--;
              var k = previous_equality - 1;
              if (diffs[k] && diffs[k][0] === DIFF_INSERT) {
                count_insert++;
                text_insert = diffs[k][1] + text_insert;
                k--;
              }
              if (diffs[k] && diffs[k][0] === DIFF_DELETE) {
                count_delete++;
                text_delete = diffs[k][1] + text_delete;
                k--;
              }
              previous_equality = k;
            }
          }
          if (starts_with_pair_end(diffs[pointer][1])) {
            var stray = diffs[pointer][1].charAt(0);
            diffs[pointer][1] = diffs[pointer][1].slice(1);
            text_delete += stray;
            text_insert += stray;
          }
        }
        if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
          // for empty equality not at end, wait for next equality
          diffs.splice(pointer, 1);
          break;
        }
        if (text_delete.length > 0 || text_insert.length > 0) {
          // note that diff_commonPrefix and diff_commonSuffix are unicode-aware
          if (text_delete.length > 0 && text_insert.length > 0) {
            // Factor out any common prefixes.
            commonlength = diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if (previous_equality >= 0) {
                diffs[previous_equality][1] += text_insert.substring(
                  0,
                  commonlength
                );
              } else {
                diffs.splice(0, 0, [
                  DIFF_EQUAL,
                  text_insert.substring(0, commonlength),
                ]);
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            // Factor out any common suffixes.
            commonlength = diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] =
                text_insert.substring(text_insert.length - commonlength) +
                diffs[pointer][1];
              text_insert = text_insert.substring(
                0,
                text_insert.length - commonlength
              );
              text_delete = text_delete.substring(
                0,
                text_delete.length - commonlength
              );
            }
          }
          // Delete the offending records and add the merged ones.
          var n = count_insert + count_delete;
          if (text_delete.length === 0 && text_insert.length === 0) {
            diffs.splice(pointer - n, n);
            pointer = pointer - n;
          } else if (text_delete.length === 0) {
            diffs.splice(pointer - n, n, [DIFF_INSERT, text_insert]);
            pointer = pointer - n + 1;
          } else if (text_insert.length === 0) {
            diffs.splice(pointer - n, n, [DIFF_DELETE, text_delete]);
            pointer = pointer - n + 1;
          } else {
            diffs.splice(
              pointer - n,
              n,
              [DIFF_DELETE, text_delete],
              [DIFF_INSERT, text_insert]
            );
            pointer = pointer - n + 2;
          }
        }
        if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
          // Merge this equality with the previous one.
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = "";
        text_insert = "";
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === "") {
    diffs.pop(); // Remove the dummy entry at the end.
  }

  // Second pass: look for single edits surrounded on both sides by equalities
  // which can be shifted sideways to eliminate an equality.
  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  var changes = false;
  pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (
      diffs[pointer - 1][0] === DIFF_EQUAL &&
      diffs[pointer + 1][0] === DIFF_EQUAL
    ) {
      // This is a single edit surrounded by equalities.
      if (
        diffs[pointer][1].substring(
          diffs[pointer][1].length - diffs[pointer - 1][1].length
        ) === diffs[pointer - 1][1]
      ) {
        // Shift the edit over the previous equality.
        diffs[pointer][1] =
          diffs[pointer - 1][1] +
          diffs[pointer][1].substring(
            0,
            diffs[pointer][1].length - diffs[pointer - 1][1].length
          );
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (
        diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
        diffs[pointer + 1][1]
      ) {
        // Shift the edit over the next equality.
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] =
          diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
          diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  // If shifts were made, the diff needs reordering and another shift sweep.
  if (changes) {
    diff_cleanupMerge(diffs, fix_unicode);
  }
}

function is_surrogate_pair_start(charCode) {
  return charCode >= 0xd800 && charCode <= 0xdbff;
}

function is_surrogate_pair_end(charCode) {
  return charCode >= 0xdc00 && charCode <= 0xdfff;
}

function starts_with_pair_end(str) {
  return is_surrogate_pair_end(str.charCodeAt(0));
}

function ends_with_pair_start(str) {
  return is_surrogate_pair_start(str.charCodeAt(str.length - 1));
}

function remove_empty_tuples(tuples) {
  var ret = [];
  for (var i = 0; i < tuples.length; i++) {
    if (tuples[i][1].length > 0) {
      ret.push(tuples[i]);
    }
  }
  return ret;
}

function make_edit_splice(before, oldMiddle, newMiddle, after) {
  if (ends_with_pair_start(before) || starts_with_pair_end(after)) {
    return null;
  }
  return remove_empty_tuples([
    [DIFF_EQUAL, before],
    [DIFF_DELETE, oldMiddle],
    [DIFF_INSERT, newMiddle],
    [DIFF_EQUAL, after],
  ]);
}

function find_cursor_edit_diff(oldText, newText, cursor_pos) {
  // note: this runs after equality check has ruled out exact equality
  var oldRange =
    typeof cursor_pos === "number"
      ? { index: cursor_pos, length: 0 }
      : cursor_pos.oldRange;
  var newRange = typeof cursor_pos === "number" ? null : cursor_pos.newRange;
  // take into account the old and new selection to generate the best diff
  // possible for a text edit.  for example, a text change from "xxx" to "xx"
  // could be a delete or forwards-delete of any one of the x's, or the
  // result of selecting two of the x's and typing "x".
  var oldLength = oldText.length;
  var newLength = newText.length;
  if (oldRange.length === 0 && (newRange === null || newRange.length === 0)) {
    // see if we have an insert or delete before or after cursor
    var oldCursor = oldRange.index;
    var oldBefore = oldText.slice(0, oldCursor);
    var oldAfter = oldText.slice(oldCursor);
    var maybeNewCursor = newRange ? newRange.index : null;
    editBefore: {
      // is this an insert or delete right before oldCursor?
      var newCursor = oldCursor + newLength - oldLength;
      if (maybeNewCursor !== null && maybeNewCursor !== newCursor) {
        break editBefore;
      }
      if (newCursor < 0 || newCursor > newLength) {
        break editBefore;
      }
      var newBefore = newText.slice(0, newCursor);
      var newAfter = newText.slice(newCursor);
      if (newAfter !== oldAfter) {
        break editBefore;
      }
      var prefixLength = Math.min(oldCursor, newCursor);
      var oldPrefix = oldBefore.slice(0, prefixLength);
      var newPrefix = newBefore.slice(0, prefixLength);
      if (oldPrefix !== newPrefix) {
        break editBefore;
      }
      var oldMiddle = oldBefore.slice(prefixLength);
      var newMiddle = newBefore.slice(prefixLength);
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldAfter);
    }
    editAfter: {
      // is this an insert or delete right after oldCursor?
      if (maybeNewCursor !== null && maybeNewCursor !== oldCursor) {
        break editAfter;
      }
      var cursor = oldCursor;
      var newBefore = newText.slice(0, cursor);
      var newAfter = newText.slice(cursor);
      if (newBefore !== oldBefore) {
        break editAfter;
      }
      var suffixLength = Math.min(oldLength - cursor, newLength - cursor);
      var oldSuffix = oldAfter.slice(oldAfter.length - suffixLength);
      var newSuffix = newAfter.slice(newAfter.length - suffixLength);
      if (oldSuffix !== newSuffix) {
        break editAfter;
      }
      var oldMiddle = oldAfter.slice(0, oldAfter.length - suffixLength);
      var newMiddle = newAfter.slice(0, newAfter.length - suffixLength);
      return make_edit_splice(oldBefore, oldMiddle, newMiddle, oldSuffix);
    }
  }
  if (oldRange.length > 0 && newRange && newRange.length === 0) {
    replaceRange: {
      // see if diff could be a splice of the old selection range
      var oldPrefix = oldText.slice(0, oldRange.index);
      var oldSuffix = oldText.slice(oldRange.index + oldRange.length);
      var prefixLength = oldPrefix.length;
      var suffixLength = oldSuffix.length;
      if (newLength < prefixLength + suffixLength) {
        break replaceRange;
      }
      var newPrefix = newText.slice(0, prefixLength);
      var newSuffix = newText.slice(newLength - suffixLength);
      if (oldPrefix !== newPrefix || oldSuffix !== newSuffix) {
        break replaceRange;
      }
      var oldMiddle = oldText.slice(prefixLength, oldLength - suffixLength);
      var newMiddle = newText.slice(prefixLength, newLength - suffixLength);
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
    }
  }

  return null;
}

function diff(text1, text2, cursor_pos, cleanup) {
  // only pass fix_unicode=true at the top level, not when diff_main is
  // recursively invoked
  return diff_main(text1, text2, cursor_pos, cleanup, true);
}

diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;

module.exports = diff;


/***/ }),

/***/ 9739:
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, true, true);
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = cloneDeep;


/***/ }),

/***/ 6216:
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = isEqual;


/***/ }),

/***/ 6204:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const cloneDeep = __webpack_require__(9739);
const isEqual = __webpack_require__(6216);
var AttributeMap;
(function (AttributeMap) {
    function compose(a = {}, b = {}, keepNull = false) {
        if (typeof a !== 'object') {
            a = {};
        }
        if (typeof b !== 'object') {
            b = {};
        }
        let attributes = cloneDeep(b);
        if (!keepNull) {
            attributes = Object.keys(attributes).reduce((copy, key) => {
                if (attributes[key] != null) {
                    copy[key] = attributes[key];
                }
                return copy;
            }, {});
        }
        for (const key in a) {
            if (a[key] !== undefined && b[key] === undefined) {
                attributes[key] = a[key];
            }
        }
        return Object.keys(attributes).length > 0 ? attributes : undefined;
    }
    AttributeMap.compose = compose;
    function diff(a = {}, b = {}) {
        if (typeof a !== 'object') {
            a = {};
        }
        if (typeof b !== 'object') {
            b = {};
        }
        const attributes = Object.keys(a)
            .concat(Object.keys(b))
            .reduce((attrs, key) => {
            if (!isEqual(a[key], b[key])) {
                attrs[key] = b[key] === undefined ? null : b[key];
            }
            return attrs;
        }, {});
        return Object.keys(attributes).length > 0 ? attributes : undefined;
    }
    AttributeMap.diff = diff;
    function invert(attr = {}, base = {}) {
        attr = attr || {};
        const baseInverted = Object.keys(base).reduce((memo, key) => {
            if (base[key] !== attr[key] && attr[key] !== undefined) {
                memo[key] = base[key];
            }
            return memo;
        }, {});
        return Object.keys(attr).reduce((memo, key) => {
            if (attr[key] !== base[key] && base[key] === undefined) {
                memo[key] = null;
            }
            return memo;
        }, baseInverted);
    }
    AttributeMap.invert = invert;
    function transform(a, b, priority = false) {
        if (typeof a !== 'object') {
            return b;
        }
        if (typeof b !== 'object') {
            return undefined;
        }
        if (!priority) {
            return b; // b simply overwrites us without priority
        }
        const attributes = Object.keys(b).reduce((attrs, key) => {
            if (a[key] === undefined) {
                attrs[key] = b[key]; // null is a valid value
            }
            return attrs;
        }, {});
        return Object.keys(attributes).length > 0 ? attributes : undefined;
    }
    AttributeMap.transform = transform;
})(AttributeMap || (AttributeMap = {}));
exports["default"] = AttributeMap;


/***/ }),

/***/ 8802:
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttributeMap = exports.OpIterator = exports.Op = void 0;
const diff = __webpack_require__(7284);
const cloneDeep = __webpack_require__(9739);
const isEqual = __webpack_require__(6216);
const AttributeMap_1 = __webpack_require__(6204);
exports.AttributeMap = AttributeMap_1.default;
const Op_1 = __webpack_require__(2933);
exports.Op = Op_1.default;
const OpIterator_1 = __webpack_require__(8551);
exports.OpIterator = OpIterator_1.default;
const NULL_CHARACTER = String.fromCharCode(0); // Placeholder char for embed in diff()
const getEmbedTypeAndData = (a, b) => {
    if (typeof a !== 'object' || a === null) {
        throw new Error(`cannot retain a ${typeof a}`);
    }
    if (typeof b !== 'object' || b === null) {
        throw new Error(`cannot retain a ${typeof b}`);
    }
    const embedType = Object.keys(a)[0];
    if (!embedType || embedType !== Object.keys(b)[0]) {
        throw new Error(`embed types not matched: ${embedType} != ${Object.keys(b)[0]}`);
    }
    return [embedType, a[embedType], b[embedType]];
};
class Delta {
    constructor(ops) {
        // Assume we are given a well formed ops
        if (Array.isArray(ops)) {
            this.ops = ops;
        }
        else if (ops != null && Array.isArray(ops.ops)) {
            this.ops = ops.ops;
        }
        else {
            this.ops = [];
        }
    }
    static registerEmbed(embedType, handler) {
        this.handlers[embedType] = handler;
    }
    static unregisterEmbed(embedType) {
        delete this.handlers[embedType];
    }
    static getHandler(embedType) {
        const handler = this.handlers[embedType];
        if (!handler) {
            throw new Error(`no handlers for embed type "${embedType}"`);
        }
        return handler;
    }
    insert(arg, attributes) {
        const newOp = {};
        if (typeof arg === 'string' && arg.length === 0) {
            return this;
        }
        newOp.insert = arg;
        if (attributes != null &&
            typeof attributes === 'object' &&
            Object.keys(attributes).length > 0) {
            newOp.attributes = attributes;
        }
        return this.push(newOp);
    }
    delete(length) {
        if (length <= 0) {
            return this;
        }
        return this.push({ delete: length });
    }
    retain(length, attributes) {
        if (typeof length === 'number' && length <= 0) {
            return this;
        }
        const newOp = { retain: length };
        if (attributes != null &&
            typeof attributes === 'object' &&
            Object.keys(attributes).length > 0) {
            newOp.attributes = attributes;
        }
        return this.push(newOp);
    }
    push(newOp) {
        let index = this.ops.length;
        let lastOp = this.ops[index - 1];
        newOp = cloneDeep(newOp);
        if (typeof lastOp === 'object') {
            if (typeof newOp.delete === 'number' &&
                typeof lastOp.delete === 'number') {
                this.ops[index - 1] = { delete: lastOp.delete + newOp.delete };
                return this;
            }
            // Since it does not matter if we insert before or after deleting at the same index,
            // always prefer to insert first
            if (typeof lastOp.delete === 'number' && newOp.insert != null) {
                index -= 1;
                lastOp = this.ops[index - 1];
                if (typeof lastOp !== 'object') {
                    this.ops.unshift(newOp);
                    return this;
                }
            }
            if (isEqual(newOp.attributes, lastOp.attributes)) {
                if (typeof newOp.insert === 'string' &&
                    typeof lastOp.insert === 'string') {
                    this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
                    if (typeof newOp.attributes === 'object') {
                        this.ops[index - 1].attributes = newOp.attributes;
                    }
                    return this;
                }
                else if (typeof newOp.retain === 'number' &&
                    typeof lastOp.retain === 'number') {
                    this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
                    if (typeof newOp.attributes === 'object') {
                        this.ops[index - 1].attributes = newOp.attributes;
                    }
                    return this;
                }
            }
        }
        if (index === this.ops.length) {
            this.ops.push(newOp);
        }
        else {
            this.ops.splice(index, 0, newOp);
        }
        return this;
    }
    chop() {
        const lastOp = this.ops[this.ops.length - 1];
        if (lastOp && typeof lastOp.retain === 'number' && !lastOp.attributes) {
            this.ops.pop();
        }
        return this;
    }
    filter(predicate) {
        return this.ops.filter(predicate);
    }
    forEach(predicate) {
        this.ops.forEach(predicate);
    }
    map(predicate) {
        return this.ops.map(predicate);
    }
    partition(predicate) {
        const passed = [];
        const failed = [];
        this.forEach((op) => {
            const target = predicate(op) ? passed : failed;
            target.push(op);
        });
        return [passed, failed];
    }
    reduce(predicate, initialValue) {
        return this.ops.reduce(predicate, initialValue);
    }
    changeLength() {
        return this.reduce((length, elem) => {
            if (elem.insert) {
                return length + Op_1.default.length(elem);
            }
            else if (elem.delete) {
                return length - elem.delete;
            }
            return length;
        }, 0);
    }
    length() {
        return this.reduce((length, elem) => {
            return length + Op_1.default.length(elem);
        }, 0);
    }
    slice(start = 0, end = Infinity) {
        const ops = [];
        const iter = new OpIterator_1.default(this.ops);
        let index = 0;
        while (index < end && iter.hasNext()) {
            let nextOp;
            if (index < start) {
                nextOp = iter.next(start - index);
            }
            else {
                nextOp = iter.next(end - index);
                ops.push(nextOp);
            }
            index += Op_1.default.length(nextOp);
        }
        return new Delta(ops);
    }
    compose(other) {
        const thisIter = new OpIterator_1.default(this.ops);
        const otherIter = new OpIterator_1.default(other.ops);
        const ops = [];
        const firstOther = otherIter.peek();
        if (firstOther != null &&
            typeof firstOther.retain === 'number' &&
            firstOther.attributes == null) {
            let firstLeft = firstOther.retain;
            while (thisIter.peekType() === 'insert' &&
                thisIter.peekLength() <= firstLeft) {
                firstLeft -= thisIter.peekLength();
                ops.push(thisIter.next());
            }
            if (firstOther.retain - firstLeft > 0) {
                otherIter.next(firstOther.retain - firstLeft);
            }
        }
        const delta = new Delta(ops);
        while (thisIter.hasNext() || otherIter.hasNext()) {
            if (otherIter.peekType() === 'insert') {
                delta.push(otherIter.next());
            }
            else if (thisIter.peekType() === 'delete') {
                delta.push(thisIter.next());
            }
            else {
                const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
                const thisOp = thisIter.next(length);
                const otherOp = otherIter.next(length);
                if (otherOp.retain) {
                    const newOp = {};
                    if (typeof thisOp.retain === 'number') {
                        newOp.retain =
                            typeof otherOp.retain === 'number' ? length : otherOp.retain;
                    }
                    else {
                        if (typeof otherOp.retain === 'number') {
                            if (thisOp.retain == null) {
                                newOp.insert = thisOp.insert;
                            }
                            else {
                                newOp.retain = thisOp.retain;
                            }
                        }
                        else {
                            const action = thisOp.retain == null ? 'insert' : 'retain';
                            const [embedType, thisData, otherData] = getEmbedTypeAndData(thisOp[action], otherOp.retain);
                            const handler = Delta.getHandler(embedType);
                            newOp[action] = {
                                [embedType]: handler.compose(thisData, otherData, action === 'retain'),
                            };
                        }
                    }
                    // Preserve null when composing with a retain, otherwise remove it for inserts
                    const attributes = AttributeMap_1.default.compose(thisOp.attributes, otherOp.attributes, typeof thisOp.retain === 'number');
                    if (attributes) {
                        newOp.attributes = attributes;
                    }
                    delta.push(newOp);
                    // Optimization if rest of other is just retain
                    if (!otherIter.hasNext() &&
                        isEqual(delta.ops[delta.ops.length - 1], newOp)) {
                        const rest = new Delta(thisIter.rest());
                        return delta.concat(rest).chop();
                    }
                    // Other op should be delete, we could be an insert or retain
                    // Insert + delete cancels out
                }
                else if (typeof otherOp.delete === 'number' &&
                    (typeof thisOp.retain === 'number' ||
                        (typeof thisOp.retain === 'object' && thisOp.retain !== null))) {
                    delta.push(otherOp);
                }
            }
        }
        return delta.chop();
    }
    concat(other) {
        const delta = new Delta(this.ops.slice());
        if (other.ops.length > 0) {
            delta.push(other.ops[0]);
            delta.ops = delta.ops.concat(other.ops.slice(1));
        }
        return delta;
    }
    diff(other, cursor) {
        if (this.ops === other.ops) {
            return new Delta();
        }
        const strings = [this, other].map((delta) => {
            return delta
                .map((op) => {
                if (op.insert != null) {
                    return typeof op.insert === 'string' ? op.insert : NULL_CHARACTER;
                }
                const prep = delta === other ? 'on' : 'with';
                throw new Error('diff() called ' + prep + ' non-document');
            })
                .join('');
        });
        const retDelta = new Delta();
        const diffResult = diff(strings[0], strings[1], cursor, true);
        const thisIter = new OpIterator_1.default(this.ops);
        const otherIter = new OpIterator_1.default(other.ops);
        diffResult.forEach((component) => {
            let length = component[1].length;
            while (length > 0) {
                let opLength = 0;
                switch (component[0]) {
                    case diff.INSERT:
                        opLength = Math.min(otherIter.peekLength(), length);
                        retDelta.push(otherIter.next(opLength));
                        break;
                    case diff.DELETE:
                        opLength = Math.min(length, thisIter.peekLength());
                        thisIter.next(opLength);
                        retDelta.delete(opLength);
                        break;
                    case diff.EQUAL:
                        opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
                        const thisOp = thisIter.next(opLength);
                        const otherOp = otherIter.next(opLength);
                        if (isEqual(thisOp.insert, otherOp.insert)) {
                            retDelta.retain(opLength, AttributeMap_1.default.diff(thisOp.attributes, otherOp.attributes));
                        }
                        else {
                            retDelta.push(otherOp).delete(opLength);
                        }
                        break;
                }
                length -= opLength;
            }
        });
        return retDelta.chop();
    }
    eachLine(predicate, newline = '\n') {
        const iter = new OpIterator_1.default(this.ops);
        let line = new Delta();
        let i = 0;
        while (iter.hasNext()) {
            if (iter.peekType() !== 'insert') {
                return;
            }
            const thisOp = iter.peek();
            const start = Op_1.default.length(thisOp) - iter.peekLength();
            const index = typeof thisOp.insert === 'string'
                ? thisOp.insert.indexOf(newline, start) - start
                : -1;
            if (index < 0) {
                line.push(iter.next());
            }
            else if (index > 0) {
                line.push(iter.next(index));
            }
            else {
                if (predicate(line, iter.next(1).attributes || {}, i) === false) {
                    return;
                }
                i += 1;
                line = new Delta();
            }
        }
        if (line.length() > 0) {
            predicate(line, {}, i);
        }
    }
    invert(base) {
        const inverted = new Delta();
        this.reduce((baseIndex, op) => {
            if (op.insert) {
                inverted.delete(Op_1.default.length(op));
            }
            else if (typeof op.retain === 'number' && op.attributes == null) {
                inverted.retain(op.retain);
                return baseIndex + op.retain;
            }
            else if (op.delete || typeof op.retain === 'number') {
                const length = (op.delete || op.retain);
                const slice = base.slice(baseIndex, baseIndex + length);
                slice.forEach((baseOp) => {
                    if (op.delete) {
                        inverted.push(baseOp);
                    }
                    else if (op.retain && op.attributes) {
                        inverted.retain(Op_1.default.length(baseOp), AttributeMap_1.default.invert(op.attributes, baseOp.attributes));
                    }
                });
                return baseIndex + length;
            }
            else if (typeof op.retain === 'object' && op.retain !== null) {
                const slice = base.slice(baseIndex, baseIndex + 1);
                const baseOp = new OpIterator_1.default(slice.ops).next();
                const [embedType, opData, baseOpData] = getEmbedTypeAndData(op.retain, baseOp.insert);
                const handler = Delta.getHandler(embedType);
                inverted.retain({ [embedType]: handler.invert(opData, baseOpData) }, AttributeMap_1.default.invert(op.attributes, baseOp.attributes));
                return baseIndex + 1;
            }
            return baseIndex;
        }, 0);
        return inverted.chop();
    }
    transform(arg, priority = false) {
        priority = !!priority;
        if (typeof arg === 'number') {
            return this.transformPosition(arg, priority);
        }
        const other = arg;
        const thisIter = new OpIterator_1.default(this.ops);
        const otherIter = new OpIterator_1.default(other.ops);
        const delta = new Delta();
        while (thisIter.hasNext() || otherIter.hasNext()) {
            if (thisIter.peekType() === 'insert' &&
                (priority || otherIter.peekType() !== 'insert')) {
                delta.retain(Op_1.default.length(thisIter.next()));
            }
            else if (otherIter.peekType() === 'insert') {
                delta.push(otherIter.next());
            }
            else {
                const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
                const thisOp = thisIter.next(length);
                const otherOp = otherIter.next(length);
                if (thisOp.delete) {
                    // Our delete either makes their delete redundant or removes their retain
                    continue;
                }
                else if (otherOp.delete) {
                    delta.push(otherOp);
                }
                else {
                    const thisData = thisOp.retain;
                    const otherData = otherOp.retain;
                    let transformedData = typeof otherData === 'object' && otherData !== null
                        ? otherData
                        : length;
                    if (typeof thisData === 'object' &&
                        thisData !== null &&
                        typeof otherData === 'object' &&
                        otherData !== null) {
                        const embedType = Object.keys(thisData)[0];
                        if (embedType === Object.keys(otherData)[0]) {
                            const handler = Delta.getHandler(embedType);
                            if (handler) {
                                transformedData = {
                                    [embedType]: handler.transform(thisData[embedType], otherData[embedType], priority),
                                };
                            }
                        }
                    }
                    // We retain either their retain or insert
                    delta.retain(transformedData, AttributeMap_1.default.transform(thisOp.attributes, otherOp.attributes, priority));
                }
            }
        }
        return delta.chop();
    }
    transformPosition(index, priority = false) {
        priority = !!priority;
        const thisIter = new OpIterator_1.default(this.ops);
        let offset = 0;
        while (thisIter.hasNext() && offset <= index) {
            const length = thisIter.peekLength();
            const nextType = thisIter.peekType();
            thisIter.next();
            if (nextType === 'delete') {
                index -= Math.min(length, index - offset);
                continue;
            }
            else if (nextType === 'insert' && (offset < index || !priority)) {
                index += length;
            }
            offset += length;
        }
        return index;
    }
}
Delta.Op = Op_1.default;
Delta.OpIterator = OpIterator_1.default;
Delta.AttributeMap = AttributeMap_1.default;
Delta.handlers = {};
exports["default"] = Delta;
if (true) {
    module.exports = Delta;
    module.exports["default"] = Delta;
}


/***/ }),

/***/ 2933:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Op;
(function (Op) {
    function length(op) {
        if (typeof op.delete === 'number') {
            return op.delete;
        }
        else if (typeof op.retain === 'number') {
            return op.retain;
        }
        else if (typeof op.retain === 'object' && op.retain !== null) {
            return 1;
        }
        else {
            return typeof op.insert === 'string' ? op.insert.length : 1;
        }
    }
    Op.length = length;
})(Op || (Op = {}));
exports["default"] = Op;


/***/ }),

/***/ 8551:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Op_1 = __webpack_require__(2933);
class Iterator {
    constructor(ops) {
        this.ops = ops;
        this.index = 0;
        this.offset = 0;
    }
    hasNext() {
        return this.peekLength() < Infinity;
    }
    next(length) {
        if (!length) {
            length = Infinity;
        }
        const nextOp = this.ops[this.index];
        if (nextOp) {
            const offset = this.offset;
            const opLength = Op_1.default.length(nextOp);
            if (length >= opLength - offset) {
                length = opLength - offset;
                this.index += 1;
                this.offset = 0;
            }
            else {
                this.offset += length;
            }
            if (typeof nextOp.delete === 'number') {
                return { delete: length };
            }
            else {
                const retOp = {};
                if (nextOp.attributes) {
                    retOp.attributes = nextOp.attributes;
                }
                if (typeof nextOp.retain === 'number') {
                    retOp.retain = length;
                }
                else if (typeof nextOp.retain === 'object' &&
                    nextOp.retain !== null) {
                    // offset should === 0, length should === 1
                    retOp.retain = nextOp.retain;
                }
                else if (typeof nextOp.insert === 'string') {
                    retOp.insert = nextOp.insert.substr(offset, length);
                }
                else {
                    // offset should === 0, length should === 1
                    retOp.insert = nextOp.insert;
                }
                return retOp;
            }
        }
        else {
            return { retain: Infinity };
        }
    }
    peek() {
        return this.ops[this.index];
    }
    peekLength() {
        if (this.ops[this.index]) {
            // Should never return 0 if our index is being managed correctly
            return Op_1.default.length(this.ops[this.index]) - this.offset;
        }
        else {
            return Infinity;
        }
    }
    peekType() {
        const op = this.ops[this.index];
        if (op) {
            if (typeof op.delete === 'number') {
                return 'delete';
            }
            else if (typeof op.retain === 'number' ||
                (typeof op.retain === 'object' && op.retain !== null)) {
                return 'retain';
            }
            else {
                return 'insert';
            }
        }
        return 'retain';
    }
    rest() {
        if (!this.hasNext()) {
            return [];
        }
        else if (this.offset === 0) {
            return this.ops.slice(this.index);
        }
        else {
            const offset = this.offset;
            const index = this.index;
            const next = this.next();
            const rest = this.ops.slice(this.index);
            this.offset = offset;
            this.index = index;
            return [next].concat(rest);
        }
    }
}
exports["default"] = Iterator;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  EntityProvider: () => (/* reexport */ EntityProvider),
  __experimentalFetchLinkSuggestions: () => (/* reexport */ fetchLinkSuggestions),
  __experimentalFetchUrlData: () => (/* reexport */ _experimental_fetch_url_data),
  __experimentalUseEntityRecord: () => (/* reexport */ __experimentalUseEntityRecord),
  __experimentalUseEntityRecords: () => (/* reexport */ __experimentalUseEntityRecords),
  __experimentalUseResourcePermissions: () => (/* reexport */ __experimentalUseResourcePermissions),
  fetchBlockPatterns: () => (/* reexport */ fetchBlockPatterns),
  privateApis: () => (/* reexport */ privateApis),
  store: () => (/* binding */ store),
  useEntityBlockEditor: () => (/* reexport */ useEntityBlockEditor),
  useEntityId: () => (/* reexport */ useEntityId),
  useEntityProp: () => (/* reexport */ useEntityProp),
  useEntityRecord: () => (/* reexport */ useEntityRecord),
  useEntityRecords: () => (/* reexport */ useEntityRecords),
  useResourcePermissions: () => (/* reexport */ use_resource_permissions)
});

// NAMESPACE OBJECT: ./packages/core-data/build-module/private-selectors.js
var private_selectors_namespaceObject = {};
__webpack_require__.r(private_selectors_namespaceObject);
__webpack_require__.d(private_selectors_namespaceObject, {
  getBlockPatternsForPostType: () => (getBlockPatternsForPostType),
  getEntityRecordPermissions: () => (getEntityRecordPermissions),
  getEntityRecordsPermissions: () => (getEntityRecordsPermissions),
  getHomePage: () => (getHomePage),
  getNavigationFallbackId: () => (getNavigationFallbackId),
  getPostsPageId: () => (getPostsPageId),
  getRegisteredPostMeta: () => (getRegisteredPostMeta),
  getTemplateId: () => (getTemplateId),
  getUndoManager: () => (getUndoManager)
});

// NAMESPACE OBJECT: ./packages/core-data/build-module/selectors.js
var build_module_selectors_namespaceObject = {};
__webpack_require__.r(build_module_selectors_namespaceObject);
__webpack_require__.d(build_module_selectors_namespaceObject, {
  __experimentalGetCurrentGlobalStylesId: () => (__experimentalGetCurrentGlobalStylesId),
  __experimentalGetCurrentThemeBaseGlobalStyles: () => (__experimentalGetCurrentThemeBaseGlobalStyles),
  __experimentalGetCurrentThemeGlobalStylesVariations: () => (__experimentalGetCurrentThemeGlobalStylesVariations),
  __experimentalGetDirtyEntityRecords: () => (__experimentalGetDirtyEntityRecords),
  __experimentalGetEntitiesBeingSaved: () => (__experimentalGetEntitiesBeingSaved),
  __experimentalGetEntityRecordNoResolver: () => (__experimentalGetEntityRecordNoResolver),
  canUser: () => (canUser),
  canUserEditEntityRecord: () => (canUserEditEntityRecord),
  getAuthors: () => (getAuthors),
  getAutosave: () => (getAutosave),
  getAutosaves: () => (getAutosaves),
  getBlockPatternCategories: () => (getBlockPatternCategories),
  getBlockPatterns: () => (getBlockPatterns),
  getCurrentTheme: () => (getCurrentTheme),
  getCurrentThemeGlobalStylesRevisions: () => (getCurrentThemeGlobalStylesRevisions),
  getCurrentUser: () => (getCurrentUser),
  getDefaultTemplateId: () => (getDefaultTemplateId),
  getEditedEntityRecord: () => (getEditedEntityRecord),
  getEmbedPreview: () => (getEmbedPreview),
  getEntitiesByKind: () => (getEntitiesByKind),
  getEntitiesConfig: () => (getEntitiesConfig),
  getEntity: () => (getEntity),
  getEntityConfig: () => (getEntityConfig),
  getEntityRecord: () => (getEntityRecord),
  getEntityRecordEdits: () => (getEntityRecordEdits),
  getEntityRecordNonTransientEdits: () => (getEntityRecordNonTransientEdits),
  getEntityRecords: () => (getEntityRecords),
  getEntityRecordsTotalItems: () => (getEntityRecordsTotalItems),
  getEntityRecordsTotalPages: () => (getEntityRecordsTotalPages),
  getLastEntityDeleteError: () => (getLastEntityDeleteError),
  getLastEntitySaveError: () => (getLastEntitySaveError),
  getRawEntityRecord: () => (getRawEntityRecord),
  getRedoEdit: () => (getRedoEdit),
  getReferenceByDistinctEdits: () => (getReferenceByDistinctEdits),
  getRevision: () => (getRevision),
  getRevisions: () => (getRevisions),
  getThemeSupports: () => (getThemeSupports),
  getUndoEdit: () => (getUndoEdit),
  getUserPatternCategories: () => (getUserPatternCategories),
  getUserQueryResults: () => (getUserQueryResults),
  hasEditsForEntityRecord: () => (hasEditsForEntityRecord),
  hasEntityRecord: () => (hasEntityRecord),
  hasEntityRecords: () => (hasEntityRecords),
  hasFetchedAutosaves: () => (hasFetchedAutosaves),
  hasRedo: () => (hasRedo),
  hasUndo: () => (hasUndo),
  isAutosavingEntityRecord: () => (isAutosavingEntityRecord),
  isDeletingEntityRecord: () => (isDeletingEntityRecord),
  isPreviewEmbedFallback: () => (isPreviewEmbedFallback),
  isRequestingEmbedPreview: () => (isRequestingEmbedPreview),
  isSavingEntityRecord: () => (isSavingEntityRecord)
});

// NAMESPACE OBJECT: ./packages/core-data/build-module/actions.js
var build_module_actions_namespaceObject = {};
__webpack_require__.r(build_module_actions_namespaceObject);
__webpack_require__.d(build_module_actions_namespaceObject, {
  __experimentalBatch: () => (__experimentalBatch),
  __experimentalReceiveCurrentGlobalStylesId: () => (__experimentalReceiveCurrentGlobalStylesId),
  __experimentalReceiveThemeBaseGlobalStyles: () => (__experimentalReceiveThemeBaseGlobalStyles),
  __experimentalReceiveThemeGlobalStyleVariations: () => (__experimentalReceiveThemeGlobalStyleVariations),
  __experimentalSaveSpecifiedEntityEdits: () => (__experimentalSaveSpecifiedEntityEdits),
  __unstableCreateUndoLevel: () => (__unstableCreateUndoLevel),
  addEntities: () => (addEntities),
  deleteEntityRecord: () => (deleteEntityRecord),
  editEntityRecord: () => (editEntityRecord),
  receiveAutosaves: () => (receiveAutosaves),
  receiveCurrentTheme: () => (receiveCurrentTheme),
  receiveCurrentUser: () => (receiveCurrentUser),
  receiveDefaultTemplateId: () => (receiveDefaultTemplateId),
  receiveEmbedPreview: () => (receiveEmbedPreview),
  receiveEntityRecords: () => (receiveEntityRecords),
  receiveNavigationFallbackId: () => (receiveNavigationFallbackId),
  receiveRevisions: () => (receiveRevisions),
  receiveThemeGlobalStyleRevisions: () => (receiveThemeGlobalStyleRevisions),
  receiveThemeSupports: () => (receiveThemeSupports),
  receiveUploadPermissions: () => (receiveUploadPermissions),
  receiveUserPermission: () => (receiveUserPermission),
  receiveUserPermissions: () => (receiveUserPermissions),
  receiveUserQuery: () => (receiveUserQuery),
  redo: () => (redo),
  saveEditedEntityRecord: () => (saveEditedEntityRecord),
  saveEntityRecord: () => (saveEntityRecord),
  undo: () => (undo)
});

// NAMESPACE OBJECT: ./packages/core-data/build-module/private-actions.js
var private_actions_namespaceObject = {};
__webpack_require__.r(private_actions_namespaceObject);
__webpack_require__.d(private_actions_namespaceObject, {
  editMediaEntity: () => (editMediaEntity),
  receiveRegisteredPostMeta: () => (receiveRegisteredPostMeta)
});

// NAMESPACE OBJECT: ./packages/core-data/build-module/resolvers.js
var resolvers_namespaceObject = {};
__webpack_require__.r(resolvers_namespaceObject);
__webpack_require__.d(resolvers_namespaceObject, {
  __experimentalGetCurrentGlobalStylesId: () => (resolvers_experimentalGetCurrentGlobalStylesId),
  __experimentalGetCurrentThemeBaseGlobalStyles: () => (resolvers_experimentalGetCurrentThemeBaseGlobalStyles),
  __experimentalGetCurrentThemeGlobalStylesVariations: () => (resolvers_experimentalGetCurrentThemeGlobalStylesVariations),
  canUser: () => (resolvers_canUser),
  canUserEditEntityRecord: () => (resolvers_canUserEditEntityRecord),
  getAuthors: () => (resolvers_getAuthors),
  getAutosave: () => (resolvers_getAutosave),
  getAutosaves: () => (resolvers_getAutosaves),
  getBlockPatternCategories: () => (resolvers_getBlockPatternCategories),
  getBlockPatterns: () => (resolvers_getBlockPatterns),
  getCurrentTheme: () => (resolvers_getCurrentTheme),
  getCurrentThemeGlobalStylesRevisions: () => (resolvers_getCurrentThemeGlobalStylesRevisions),
  getCurrentUser: () => (resolvers_getCurrentUser),
  getDefaultTemplateId: () => (resolvers_getDefaultTemplateId),
  getEditedEntityRecord: () => (resolvers_getEditedEntityRecord),
  getEmbedPreview: () => (resolvers_getEmbedPreview),
  getEntitiesConfig: () => (resolvers_getEntitiesConfig),
  getEntityRecord: () => (resolvers_getEntityRecord),
  getEntityRecords: () => (resolvers_getEntityRecords),
  getEntityRecordsTotalItems: () => (resolvers_getEntityRecordsTotalItems),
  getEntityRecordsTotalPages: () => (resolvers_getEntityRecordsTotalPages),
  getNavigationFallbackId: () => (resolvers_getNavigationFallbackId),
  getRawEntityRecord: () => (resolvers_getRawEntityRecord),
  getRegisteredPostMeta: () => (resolvers_getRegisteredPostMeta),
  getRevision: () => (resolvers_getRevision),
  getRevisions: () => (resolvers_getRevisions),
  getThemeSupports: () => (resolvers_getThemeSupports),
  getUserPatternCategories: () => (resolvers_getUserPatternCategories)
});

;// external ["wp","data"]
const external_wp_data_namespaceObject = window["wp"]["data"];
// EXTERNAL MODULE: ./node_modules/fast-deep-equal/es6/index.js
var es6 = __webpack_require__(7734);
var es6_default = /*#__PURE__*/__webpack_require__.n(es6);
;// external ["wp","compose"]
const external_wp_compose_namespaceObject = window["wp"]["compose"];
;// external ["wp","isShallowEqual"]
const external_wp_isShallowEqual_namespaceObject = window["wp"]["isShallowEqual"];
var external_wp_isShallowEqual_default = /*#__PURE__*/__webpack_require__.n(external_wp_isShallowEqual_namespaceObject);
;// ./packages/undo-manager/build-module/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

/**
 * Represents a single change in history.
 */

/**
 * Represents changes for a single item.
 */

/**
 * Represents a record of history changes.
 */

/**
 * The undo manager interface.
 */

/**
 * Merge changes for a single item into a record of changes.
 *
 * @param changes1 Previous changes
 * @param changes2 Next changes
 *
 * @return Merged changes
 */
function mergeHistoryChanges(changes1, changes2) {
  const newChanges = {
    ...changes1
  };
  Object.entries(changes2).forEach(([key, value]) => {
    if (newChanges[key]) {
      newChanges[key] = {
        ...newChanges[key],
        to: value.to
      };
    } else {
      newChanges[key] = value;
    }
  });
  return newChanges;
}

/**
 * Adds history changes for a single item into a record of changes.
 *
 * @param record  The record to merge into.
 * @param changes The changes to merge.
 */
const addHistoryChangesIntoRecord = (record, changes) => {
  const existingChangesIndex = record?.findIndex(({
    id: recordIdentifier
  }) => {
    return typeof recordIdentifier === 'string' ? recordIdentifier === changes.id : external_wp_isShallowEqual_default()(recordIdentifier, changes.id);
  });
  const nextRecord = [...record];
  if (existingChangesIndex !== -1) {
    // If the edit is already in the stack leave the initial "from" value.
    nextRecord[existingChangesIndex] = {
      id: changes.id,
      changes: mergeHistoryChanges(nextRecord[existingChangesIndex].changes, changes.changes)
    };
  } else {
    nextRecord.push(changes);
  }
  return nextRecord;
};

/**
 * Creates an undo manager.
 *
 * @return Undo manager.
 */
function createUndoManager() {
  let history = [];
  let stagedRecord = [];
  let offset = 0;
  const dropPendingRedos = () => {
    history = history.slice(0, offset || undefined);
    offset = 0;
  };
  const appendStagedRecordToLatestHistoryRecord = () => {
    var _history$index;
    const index = history.length === 0 ? 0 : history.length - 1;
    let latestRecord = (_history$index = history[index]) !== null && _history$index !== void 0 ? _history$index : [];
    stagedRecord.forEach(changes => {
      latestRecord = addHistoryChangesIntoRecord(latestRecord, changes);
    });
    stagedRecord = [];
    history[index] = latestRecord;
  };

  /**
   * Checks whether a record is empty.
   * A record is considered empty if it the changes keep the same values.
   * Also updates to function values are ignored.
   *
   * @param record The record to check.
   * @return Whether the record is empty.
   */
  const isRecordEmpty = record => {
    const filteredRecord = record.filter(({
      changes
    }) => {
      return Object.values(changes).some(({
        from,
        to
      }) => typeof from !== 'function' && typeof to !== 'function' && !external_wp_isShallowEqual_default()(from, to));
    });
    return !filteredRecord.length;
  };
  return {
    addRecord(record, isStaged = false) {
      const isEmpty = !record || isRecordEmpty(record);
      if (isStaged) {
        if (isEmpty) {
          return;
        }
        record.forEach(changes => {
          stagedRecord = addHistoryChangesIntoRecord(stagedRecord, changes);
        });
      } else {
        dropPendingRedos();
        if (stagedRecord.length) {
          appendStagedRecordToLatestHistoryRecord();
        }
        if (isEmpty) {
          return;
        }
        history.push(record);
      }
    },
    undo() {
      if (stagedRecord.length) {
        dropPendingRedos();
        appendStagedRecordToLatestHistoryRecord();
      }
      const undoRecord = history[history.length - 1 + offset];
      if (!undoRecord) {
        return;
      }
      offset -= 1;
      return undoRecord;
    },
    redo() {
      const redoRecord = history[history.length + offset];
      if (!redoRecord) {
        return;
      }
      offset += 1;
      return redoRecord;
    },
    hasUndo() {
      return !!history[history.length - 1 + offset];
    },
    hasRedo() {
      return !!history[history.length + offset];
    }
  };
}

;// ./packages/core-data/build-module/utils/if-matching-action.js
/** @typedef {import('../types').AnyFunction} AnyFunction */

/**
 * A higher-order reducer creator which invokes the original reducer only if
 * the dispatching action matches the given predicate, **OR** if state is
 * initializing (undefined).
 *
 * @param {AnyFunction} isMatch Function predicate for allowing reducer call.
 *
 * @return {AnyFunction} Higher-order reducer.
 */
const ifMatchingAction = isMatch => reducer => (state, action) => {
  if (state === undefined || isMatch(action)) {
    return reducer(state, action);
  }
  return state;
};
/* harmony default export */ const if_matching_action = (ifMatchingAction);

;// ./packages/core-data/build-module/utils/replace-action.js
/** @typedef {import('../types').AnyFunction} AnyFunction */

/**
 * Higher-order reducer creator which substitutes the action object before
 * passing to the original reducer.
 *
 * @param {AnyFunction} replacer Function mapping original action to replacement.
 *
 * @return {AnyFunction} Higher-order reducer.
 */
const replaceAction = replacer => reducer => (state, action) => {
  return reducer(state, replacer(action));
};
/* harmony default export */ const replace_action = (replaceAction);

;// ./packages/core-data/build-module/utils/conservative-map-item.js
/**
 * External dependencies
 */


/**
 * Given the current and next item entity record, returns the minimally "modified"
 * result of the next item, preferring value references from the original item
 * if equal. If all values match, the original item is returned.
 *
 * @param {Object} item     Original item.
 * @param {Object} nextItem Next item.
 *
 * @return {Object} Minimally modified merged item.
 */
function conservativeMapItem(item, nextItem) {
  // Return next item in its entirety if there is no original item.
  if (!item) {
    return nextItem;
  }
  let hasChanges = false;
  const result = {};
  for (const key in nextItem) {
    if (es6_default()(item[key], nextItem[key])) {
      result[key] = item[key];
    } else {
      hasChanges = true;
      result[key] = nextItem[key];
    }
  }
  if (!hasChanges) {
    return item;
  }

  // Only at this point, backfill properties from the original item which
  // weren't explicitly set into the result above. This is an optimization
  // to allow `hasChanges` to return early.
  for (const key in item) {
    if (!result.hasOwnProperty(key)) {
      result[key] = item[key];
    }
  }
  return result;
}

;// ./packages/core-data/build-module/utils/on-sub-key.js
/** @typedef {import('../types').AnyFunction} AnyFunction */

/**
 * Higher-order reducer creator which creates a combined reducer object, keyed
 * by a property on the action object.
 *
 * @param {string} actionProperty Action property by which to key object.
 *
 * @return {AnyFunction} Higher-order reducer.
 */
const onSubKey = actionProperty => reducer => (state = {}, action) => {
  // Retrieve subkey from action. Do not track if undefined; useful for cases
  // where reducer is scoped by action shape.
  const key = action[actionProperty];
  if (key === undefined) {
    return state;
  }

  // Avoid updating state if unchanged. Note that this also accounts for a
  // reducer which returns undefined on a key which is not yet tracked.
  const nextKeyState = reducer(state[key], action);
  if (nextKeyState === state[key]) {
    return state;
  }
  return {
    ...state,
    [key]: nextKeyState
  };
};
/* harmony default export */ const on_sub_key = (onSubKey);

;// ./node_modules/tslib/tslib.es6.mjs
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}

/** @deprecated */
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}

/** @deprecated */
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
  function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
  function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
        }
        else s |= 1;
      }
      catch (e) {
        fail(e);
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError) throw env.error;
  }
  return next();
}

function __rewriteRelativeImportExtension(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) {
      return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
          return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
      });
  }
  return path;
}

/* harmony default export */ const tslib_es6 = ({
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __esDecorate,
  __runInitializers,
  __propKey,
  __setFunctionName,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
  __rewriteRelativeImportExtension,
});

;// ./node_modules/lower-case/dist.es2015/index.js
/**
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 */
var SUPPORTED_LOCALE = {
    tr: {
        regexp: /\u0130|\u0049|\u0049\u0307/g,
        map: {
            İ: "\u0069",
            I: "\u0131",
            İ: "\u0069",
        },
    },
    az: {
        regexp: /\u0130/g,
        map: {
            İ: "\u0069",
            I: "\u0131",
            İ: "\u0069",
        },
    },
    lt: {
        regexp: /\u0049|\u004A|\u012E|\u00CC|\u00CD|\u0128/g,
        map: {
            I: "\u0069\u0307",
            J: "\u006A\u0307",
            Į: "\u012F\u0307",
            Ì: "\u0069\u0307\u0300",
            Í: "\u0069\u0307\u0301",
            Ĩ: "\u0069\u0307\u0303",
        },
    },
};
/**
 * Localized lower case.
 */
function localeLowerCase(str, locale) {
    var lang = SUPPORTED_LOCALE[locale.toLowerCase()];
    if (lang)
        return lowerCase(str.replace(lang.regexp, function (m) { return lang.map[m]; }));
    return lowerCase(str);
}
/**
 * Lower case as a function.
 */
function lowerCase(str) {
    return str.toLowerCase();
}

;// ./node_modules/no-case/dist.es2015/index.js

// Support camel case ("camelCase" -> "camel Case" and "CAMELCase" -> "CAMEL Case").
var DEFAULT_SPLIT_REGEXP = [/([a-z0-9])([A-Z])/g, /([A-Z])([A-Z][a-z])/g];
// Remove all non-word characters.
var DEFAULT_STRIP_REGEXP = /[^A-Z0-9]+/gi;
/**
 * Normalize the string into something other libraries can manipulate easier.
 */
function noCase(input, options) {
    if (options === void 0) { options = {}; }
    var _a = options.splitRegexp, splitRegexp = _a === void 0 ? DEFAULT_SPLIT_REGEXP : _a, _b = options.stripRegexp, stripRegexp = _b === void 0 ? DEFAULT_STRIP_REGEXP : _b, _c = options.transform, transform = _c === void 0 ? lowerCase : _c, _d = options.delimiter, delimiter = _d === void 0 ? " " : _d;
    var result = replace(replace(input, splitRegexp, "$1\0$2"), stripRegexp, "\0");
    var start = 0;
    var end = result.length;
    // Trim the delimiter from around the output string.
    while (result.charAt(start) === "\0")
        start++;
    while (result.charAt(end - 1) === "\0")
        end--;
    // Transform each token independently.
    return result.slice(start, end).split("\0").map(transform).join(delimiter);
}
/**
 * Replace `re` in the input string with the replacement value.
 */
function replace(input, re, value) {
    if (re instanceof RegExp)
        return input.replace(re, value);
    return re.reduce(function (input, re) { return input.replace(re, value); }, input);
}

;// ./node_modules/upper-case-first/dist.es2015/index.js
/**
 * Upper case the first character of an input string.
 */
function upperCaseFirst(input) {
    return input.charAt(0).toUpperCase() + input.substr(1);
}

;// ./node_modules/capital-case/dist.es2015/index.js



function capitalCaseTransform(input) {
    return upperCaseFirst(input.toLowerCase());
}
function capitalCase(input, options) {
    if (options === void 0) { options = {}; }
    return noCase(input, __assign({ delimiter: " ", transform: capitalCaseTransform }, options));
}

;// ./node_modules/pascal-case/dist.es2015/index.js


function pascalCaseTransform(input, index) {
    var firstChar = input.charAt(0);
    var lowerChars = input.substr(1).toLowerCase();
    if (index > 0 && firstChar >= "0" && firstChar <= "9") {
        return "_" + firstChar + lowerChars;
    }
    return "" + firstChar.toUpperCase() + lowerChars;
}
function dist_es2015_pascalCaseTransformMerge(input) {
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}
function pascalCase(input, options) {
    if (options === void 0) { options = {}; }
    return noCase(input, __assign({ delimiter: "", transform: pascalCaseTransform }, options));
}

;// external ["wp","apiFetch"]
const external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_namespaceObject);
;// external ["wp","i18n"]
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// ./node_modules/lib0/array.js
/**
 * Utility module to work with Arrays.
 *
 * @module array
 */



/**
 * Return the last element of an array. The element must exist
 *
 * @template L
 * @param {ArrayLike<L>} arr
 * @return {L}
 */
const last = arr => arr[arr.length - 1]

/**
 * @template C
 * @return {Array<C>}
 */
const create = () => /** @type {Array<C>} */ ([])

/**
 * @template D
 * @param {Array<D>} a
 * @return {Array<D>}
 */
const copy = a => /** @type {Array<D>} */ (a.slice())

/**
 * Append elements from src to dest
 *
 * @template M
 * @param {Array<M>} dest
 * @param {Array<M>} src
 */
const appendTo = (dest, src) => {
  for (let i = 0; i < src.length; i++) {
    dest.push(src[i])
  }
}

/**
 * Transforms something array-like to an actual Array.
 *
 * @function
 * @template T
 * @param {ArrayLike<T>|Iterable<T>} arraylike
 * @return {T}
 */
const from = Array.from

/**
 * True iff condition holds on every element in the Array.
 *
 * @function
 * @template {ArrayLike<any>} ARR
 *
 * @param {ARR} arr
 * @param {ARR extends ArrayLike<infer S> ? ((value:S, index:number, arr:ARR) => boolean) : any} f
 * @return {boolean}
 */
const every = (arr, f) => {
  for (let i = 0; i < arr.length; i++) {
    if (!f(arr[i], i, arr)) {
      return false
    }
  }
  return true
}

/**
 * True iff condition holds on some element in the Array.
 *
 * @function
 * @template {ArrayLike<any>} ARR
 *
 * @param {ARR} arr
 * @param {ARR extends ArrayLike<infer S> ? ((value:S, index:number, arr:ARR) => boolean) : never} f
 * @return {boolean}
 */
const some = (arr, f) => {
  for (let i = 0; i < arr.length; i++) {
    if (f(arr[i], i, arr)) {
      return true
    }
  }
  return false
}

/**
 * @template ELEM
 *
 * @param {ArrayLike<ELEM>} a
 * @param {ArrayLike<ELEM>} b
 * @return {boolean}
 */
const equalFlat = (a, b) => a.length === b.length && every(a, (item, index) => item === b[index])

/**
 * @template ELEM
 * @param {Array<Array<ELEM>>} arr
 * @return {Array<ELEM>}
 */
const flatten = arr => fold(arr, /** @type {Array<ELEM>} */ ([]), (acc, val) => acc.concat(val))

/**
 * @template T
 * @param {number} len
 * @param {function(number, Array<T>):T} f
 * @return {Array<T>}
 */
const unfold = (len, f) => {
  const array = new Array(len)
  for (let i = 0; i < len; i++) {
    array[i] = f(i, array)
  }
  return array
}

/**
 * @template T
 * @template RESULT
 * @param {Array<T>} arr
 * @param {RESULT} seed
 * @param {function(RESULT, T, number):RESULT} folder
 */
const fold = (arr, seed, folder) => arr.reduce(folder, seed)

const isArray = Array.isArray

/**
 * @template T
 * @param {Array<T>} arr
 * @return {Array<T>}
 */
const unique = arr => from(set.from(arr))

/**
 * @template T
 * @template M
 * @param {ArrayLike<T>} arr
 * @param {function(T):M} mapper
 * @return {Array<T>}
 */
const uniqueBy = (arr, mapper) => {
  /**
   * @type {Set<M>}
   */
  const happened = set.create()
  /**
   * @type {Array<T>}
   */
  const result = []
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i]
    const mapped = mapper(el)
    if (!happened.has(mapped)) {
      happened.add(mapped)
      result.push(el)
    }
  }
  return result
}

/**
 * @template {ArrayLike<any>} ARR
 * @template {function(ARR extends ArrayLike<infer T> ? T : never, number, ARR):any} MAPPER
 * @param {ARR} arr
 * @param {MAPPER} mapper
 * @return {Array<MAPPER extends function(...any): infer M ? M : never>}
 */
const map = (arr, mapper) => {
  /**
   * @type {Array<any>}
   */
  const res = Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    res[i] = mapper(/** @type {any} */ (arr[i]), i, /** @type {any} */ (arr))
  }
  return /** @type {any} */ (res)
}

/**
 * This function bubble-sorts a single item to the correct position. The sort happens in-place and
 * might be useful to ensure that a single item is at the correct position in an otherwise sorted
 * array.
 *
 * @example
 *  const arr = [3, 2, 5]
 *  arr.sort((a, b) => a - b)
 *  arr // => [2, 3, 5]
 *  arr.splice(1, 0, 7)
 *  array.bubbleSortItem(arr, 1, (a, b) => a - b)
 *  arr // => [2, 3, 5, 7]
 *
 * @template T
 * @param {Array<T>} arr
 * @param {number} i
 * @param {(a:T,b:T) => number} compareFn
 */
const bubblesortItem = (arr, i, compareFn) => {
  const n = arr[i]
  let j = i
  // try to sort to the right
  while (j + 1 < arr.length && compareFn(n, arr[j + 1]) > 0) {
    arr[j] = arr[j + 1]
    arr[++j] = n
  }
  if (i === j && j > 0) { // no change yet
    // sort to the left
    while (j > 0 && compareFn(arr[j - 1], n) > 0) {
      arr[j] = arr[j - 1]
      arr[--j] = n
    }
  }
  return j
}

;// ./node_modules/lib0/object.js
/**
 * Utility functions for working with EcmaScript objects.
 *
 * @module object
 */

/**
 * @return {Object<string,any>} obj
 */
const object_create = () => Object.create(null)

/**
 * Object.assign
 */
const object_assign = Object.assign

/**
 * @param {Object<string,any>} obj
 */
const keys = Object.keys

/**
 * @template V
 * @param {{[key:string]: V}} obj
 * @return {Array<V>}
 */
const values = Object.values

/**
 * @template V
 * @param {{[k:string]:V}} obj
 * @param {function(V,string):any} f
 */
const forEach = (obj, f) => {
  for (const key in obj) {
    f(obj[key], key)
  }
}

/**
 * @todo implement mapToArray & map
 *
 * @template R
 * @param {Object<string,any>} obj
 * @param {function(any,string):R} f
 * @return {Array<R>}
 */
const object_map = (obj, f) => {
  const results = []
  for (const key in obj) {
    results.push(f(obj[key], key))
  }
  return results
}

/**
 * @deprecated use object.size instead
 * @param {Object<string,any>} obj
 * @return {number}
 */
const object_length = obj => keys(obj).length

/**
 * @param {Object<string,any>} obj
 * @return {number}
 */
const size = obj => keys(obj).length

/**
 * @template {{ [key:string|number|symbol]: any }} T
 * @param {T} obj
 * @param {(v:T[keyof T],k:keyof T)=>boolean} f
 * @return {boolean}
 */
const object_some = (obj, f) => {
  for (const key in obj) {
    if (f(obj[key], key)) {
      return true
    }
  }
  return false
}

/**
 * @param {Object|null|undefined} obj
 */
const isEmpty = obj => {
  // eslint-disable-next-line no-unreachable-loop
  for (const _k in obj) {
    return false
  }
  return true
}

/**
 * @template {{ [key:string|number|symbol]: any }} T
 * @param {T} obj
 * @param {(v:T[keyof T],k:keyof T)=>boolean} f
 * @return {boolean}
 */
const object_every = (obj, f) => {
  for (const key in obj) {
    if (!f(obj[key], key)) {
      return false
    }
  }
  return true
}

/**
 * Calls `Object.prototype.hasOwnProperty`.
 *
 * @param {any} obj
 * @param {string|number|symbol} key
 * @return {boolean}
 */
const hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

/**
 * @param {Object<string,any>} a
 * @param {Object<string,any>} b
 * @return {boolean}
 */
const object_equalFlat = (a, b) => a === b || (size(a) === size(b) && object_every(a, (val, key) => (val !== undefined || hasProperty(b, key)) && b[key] === val))

/**
 * Make an object immutable. This hurts performance and is usually not needed if you perform good
 * coding practices.
 */
const freeze = Object.freeze

/**
 * Make an object and all its children immutable.
 * This *really* hurts performance and is usually not needed if you perform good coding practices.
 *
 * @template {any} T
 * @param {T} o
 * @return {Readonly<T>}
 */
const deepFreeze = (o) => {
  for (const key in o) {
    const c = o[key]
    if (typeof c === 'object' || typeof c === 'function') {
      deepFreeze(o[key])
    }
  }
  return freeze(o)
}

/**
 * Get object property. Create T if property is undefined and set T on object.
 *
 * @function
 * @template {object} KV
 * @template {keyof KV} [K=keyof KV]
 * @param {KV} o
 * @param {K} key
 * @param {() => KV[K]} createT
 * @return {KV[K]}
 */
const setIfUndefined = (o, key, createT) => hasProperty(o, key) ? o[key] : (o[key] = createT())

;// ./node_modules/lib0/traits.js
const EqualityTraitSymbol = Symbol('Equality')

/**
 * @typedef {{ [EqualityTraitSymbol]:(other:EqualityTrait)=>boolean }} EqualityTrait
 */

;// ./node_modules/lib0/function.js
/**
 * Common functions and function call helpers.
 *
 * @module function
 */





/**
 * Calls all functions in `fs` with args. Only throws after all functions were called.
 *
 * @param {Array<function>} fs
 * @param {Array<any>} args
 */
const callAll = (fs, args, i = 0) => {
  try {
    for (; i < fs.length; i++) {
      fs[i](...args)
    }
  } finally {
    if (i < fs.length) {
      callAll(fs, args, i + 1)
    }
  }
}

const nop = () => {}

/**
 * @template T
 * @param {function():T} f
 * @return {T}
 */
const apply = f => f()

/**
 * @template A
 *
 * @param {A} a
 * @return {A}
 */
const id = a => a

/**
 * @template T
 *
 * @param {T} a
 * @param {T} b
 * @return {boolean}
 */
const equalityStrict = (a, b) => a === b

/**
 * @template T
 *
 * @param {Array<T>|object} a
 * @param {Array<T>|object} b
 * @return {boolean}
 */
const equalityFlat = (a, b) => a === b || (a != null && b != null && a.constructor === b.constructor && ((array.isArray(a) && array.equalFlat(a, /** @type {Array<T>} */ (b))) || (typeof a === 'object' && object.equalFlat(a, b))))

/* c8 ignore start */

/**
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
const equalityDeep = (a, b) => {
  if (a === b) {
    return true
  }
  if (a == null || b == null || a.constructor !== b.constructor) {
    return false
  }
  if (a[EqualityTraitSymbol] != null) {
    return a[EqualityTraitSymbol](b)
  }
  switch (a.constructor) {
    case ArrayBuffer:
      a = new Uint8Array(a)
      b = new Uint8Array(b)
    // eslint-disable-next-line no-fallthrough
    case Uint8Array: {
      if (a.byteLength !== b.byteLength) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false
        }
      }
      break
    }
    case Set: {
      if (a.size !== b.size) {
        return false
      }
      for (const value of a) {
        if (!b.has(value)) {
          return false
        }
      }
      break
    }
    case Map: {
      if (a.size !== b.size) {
        return false
      }
      for (const key of a.keys()) {
        if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
          return false
        }
      }
      break
    }
    case Object:
      if (object_length(a) !== object_length(b)) {
        return false
      }
      for (const key in a) {
        if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
          return false
        }
      }
      break
    case Array:
      if (a.length !== b.length) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (!equalityDeep(a[i], b[i])) {
          return false
        }
      }
      break
    default:
      return false
  }
  return true
}

/**
 * @template V
 * @template {V} OPTS
 *
 * @param {V} value
 * @param {Array<OPTS>} options
 */
// @ts-ignore
const isOneOf = (value, options) => options.includes(value)
/* c8 ignore stop */

const function_isArray = isArray

/**
 * @param {any} s
 * @return {s is String}
 */
const isString = (s) => s && s.constructor === String

/**
 * @param {any} n
 * @return {n is Number}
 */
const isNumber = n => n != null && n.constructor === Number

/**
 * @template {abstract new (...args: any) => any} TYPE
 * @param {any} n
 * @param {TYPE} T
 * @return {n is InstanceType<TYPE>}
 */
const is = (n, T) => n && n.constructor === T

/**
 * @template {abstract new (...args: any) => any} TYPE
 * @param {TYPE} T
 */
const isTemplate = (T) =>
  /**
   * @param {any} n
   * @return {n is InstanceType<TYPE>}
   **/
  n => n && n.constructor === T

;// external ["wp","blocks"]
const external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// external ["wp","hooks"]
const external_wp_hooks_namespaceObject = window["wp"]["hooks"];
;// external ["wp","sync"]
const external_wp_sync_namespaceObject = window["wp"]["sync"];
;// ./node_modules/uuid/dist/esm-browser/native.js
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
/* harmony default export */ const esm_browser_native = ({
  randomUUID
});
;// ./node_modules/uuid/dist/esm-browser/rng.js
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}
;// ./node_modules/uuid/dist/esm-browser/stringify.js

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const esm_browser_stringify = ((/* unused pure expression or super */ null && (stringify)));
;// ./node_modules/uuid/dist/esm-browser/v4.js




function v4(options, buf, offset) {
  if (esm_browser_native.randomUUID && !buf && !options) {
    return esm_browser_native.randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return unsafeStringify(rnds);
}

/* harmony default export */ const esm_browser_v4 = (v4);
;// ./node_modules/lib0/math.js
/**
 * Common Math expressions.
 *
 * @module math
 */

const floor = Math.floor
const ceil = Math.ceil
const abs = Math.abs
const imul = Math.imul
const round = Math.round
const log10 = Math.log10
const log2 = Math.log2
const log = Math.log
const sqrt = Math.sqrt

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The sum of a and b
 */
const add = (a, b) => a + b

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The smaller element of a and b
 */
const min = (a, b) => a < b ? a : b

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The bigger element of a and b
 */
const max = (a, b) => a > b ? a : b

const math_isNaN = Number.isNaN

const pow = Math.pow
/**
 * Base 10 exponential function. Returns the value of 10 raised to the power of pow.
 *
 * @param {number} exp
 * @return {number}
 */
const exp10 = exp => Math.pow(10, exp)

const sign = Math.sign

/**
 * @param {number} n
 * @return {boolean} Wether n is negative. This function also differentiates between -0 and +0
 */
const isNegativeZero = n => n !== 0 ? n < 0 : 1 / n < 0

// EXTERNAL MODULE: ./node_modules/quill-delta/dist/Delta.js
var Delta = __webpack_require__(8802);
var Delta_default = /*#__PURE__*/__webpack_require__.n(Delta);
;// external ["wp","richText"]
const external_wp_richText_namespaceObject = window["wp"]["richText"];
;// ./packages/core-data/build-module/utils/crdt-blocks.js
/**
 * External dependencies
 */





/**
 * WordPress dependencies
 */



// @ts-expect-error - This is a TypeScript file, and @wordpress/blocks doesn't have a tsconfig.json?


/**
 * Internal dependencies
 */

// The Y.Map type is not easy to work with. The generic type it accepts represents
// the possible values of the map, which are varied in our case. This type is
// accurate, but will require aggressive type narrowing when the map values are
// accessed -- or type casting with `as`.
// export type YBlock = Y.Map< Block[ keyof Block ] >;

const serializableBlocksCache = new WeakMap();
function makeBlockAttributesSerializable(attributes) {
  const newAttributes = {
    ...attributes
  };
  for (const [key, value] of Object.entries(attributes)) {
    if (value instanceof external_wp_richText_namespaceObject.RichTextData) {
      newAttributes[key] = value.valueOf();
    }
  }
  return newAttributes;
}
function makeBlocksSerializable(blocks) {
  return blocks.map(block => {
    const blockAsJson = block instanceof external_wp_sync_namespaceObject.Y.Map ? block.toJSON() : block;
    const {
      name,
      innerBlocks,
      attributes,
      ...rest
    } = blockAsJson;
    delete rest.validationIssues;
    delete rest.originalContent;
    // delete rest.isValid
    return {
      ...rest,
      name,
      attributes: makeBlockAttributesSerializable(attributes),
      innerBlocks: makeBlocksSerializable(innerBlocks)
    };
  });
}

/**
 * @param {any}   gblock
 * @param {Y.Map} yblock
 */
function areBlocksEqual(gblock, yblock) {
  const yblockAsJson = yblock.toJSON();

  // we must not sync clientId, as this can't be generated consistently and
  // hence will lead to merge conflicts.
  const overwrites = {
    innerBlocks: null,
    clientId: null
  };
  const res = equalityDeep(Object.assign({}, gblock, overwrites), Object.assign({}, yblockAsJson, overwrites));
  const inners = gblock.innerBlocks || [];
  const yinners = yblock.get('innerBlocks');
  return res && inners.length === yinners.length && inners.every((block, i) => areBlocksEqual(block, yinners.get(i)));
}
function createNewYAttributeMap(blockName, attributes) {
  return new external_wp_sync_namespaceObject.Y.Map(Object.entries(attributes).map(([attributeName, attributeValue]) => {
    return [attributeName, createNewYAttributeValue(blockName, attributeName, attributeValue)];
  }));
}
function createNewYAttributeValue(blockName, attributeName, attributeValue) {
  const isRichText = isRichTextAttribute(blockName, attributeName);
  if (isRichText) {
    var _attributeValue$toStr;
    return new external_wp_sync_namespaceObject.Y.Text((_attributeValue$toStr = attributeValue?.toString()) !== null && _attributeValue$toStr !== void 0 ? _attributeValue$toStr : '');
  }
  return attributeValue;
}
function createNewYBlock(block) {
  return new external_wp_sync_namespaceObject.Y.Map(Object.entries(block).map(([key, value]) => {
    switch (key) {
      case 'attributes':
        {
          return [key, createNewYAttributeMap(block.name, value)];
        }
      case 'innerBlocks':
        {
          const innerBlocks = new external_wp_sync_namespaceObject.Y.Array();

          // If not an array, set to empty Y.Array.
          if (!Array.isArray(value)) {
            return [key, innerBlocks];
          }
          innerBlocks.insert(0, value.map(innerBlock => createNewYBlock(innerBlock)));
          return [key, innerBlocks];
        }
      default:
        return [key, value];
    }
  }));
}

/**
 * Merge incoming block data into the local Y.Doc.
 * This function is called to sync local block changes to a shared Y.Doc.
 *
 * @param yblocks        The blocks in the local Y.Doc.
 * @param incomingBlocks Gutenberg blocks being synced.
 * @param lastSelection
 * @param _origin        The origin of the sync, either 'syncProvider' or 'gutenberg'.
 */
function mergeCrdtBlocks(yblocks,
// yblocks represent the blocks in the local Y.Doc
incomingBlocks,
// incomingBlocks represent JSON blocks being synced, either from a peer or from the local editor
lastSelection,
// Last cursor position, used for hinting the diff algorithm
_origin) {
  var _serializableBlocksCa, _blocksToSync$length;
  // Ensure we are working with serializable block data.
  if (!serializableBlocksCache.has(incomingBlocks)) {
    serializableBlocksCache.set(incomingBlocks, makeBlocksSerializable(incomingBlocks));
  }
  const allBlocks = (_serializableBlocksCa = serializableBlocksCache.get(incomingBlocks)) !== null && _serializableBlocksCa !== void 0 ? _serializableBlocksCa : [];

  // Ensure we skip blocks that we don't want to sync at the moment
  const blocksToSync = allBlocks.filter(block => shouldBlockBeSynced(block));

  // This is a rudimentary diff implementation similar to the y-prosemirror diffing
  // approach.
  // A better implementation would also diff the textual content and represent it
  // using a Y.Text type.
  // However, at this time it makes more sense to keep this algorithm generic to
  // support all kinds of block types.
  // Ideally, we ensure that block data structure have a consistent data format.
  // E.g.:
  //   - textual content (using rich-text formatting?) may always be stored under `block.text`
  //   - local information that shouldn't be shared (e.g. clientId or isDragging) is stored under `block.private`
  const numOfCommonEntries = min((_blocksToSync$length = blocksToSync.length) !== null && _blocksToSync$length !== void 0 ? _blocksToSync$length : 0, yblocks.length);
  let left = 0;
  let right = 0;

  // skip equal blocks from left
  for (; left < numOfCommonEntries && areBlocksEqual(blocksToSync[left], yblocks.get(left)); left++) {
    /* nop */
  }

  // skip equal blocks from right
  for (; right < numOfCommonEntries - left && areBlocksEqual(blocksToSync[blocksToSync.length - right - 1], yblocks.get(yblocks.length - right - 1)); right++) {
    /* nop */
  }
  const numOfUpdatesNeeded = numOfCommonEntries - left - right;
  const numOfInsertionsNeeded = max(0, blocksToSync.length - yblocks.length);
  const numOfDeletionsNeeded = max(0, yblocks.length - blocksToSync.length);

  // updates
  for (let i = 0; i < numOfUpdatesNeeded; i++, left++) {
    const block = blocksToSync[left];
    const yblock = yblocks.get(left);
    Object.entries(block).forEach(([key, value]) => {
      switch (key) {
        case 'attributes':
          {
            const currentAttributes = yblock.get(key);

            // If attributes are not set on the yblock, use the new values.
            if (!currentAttributes) {
              yblock.set(key, createNewYAttributeMap(block.name, value));
              break;
            }
            Object.entries(value).forEach(([attributeName, attributeValue]) => {
              if (equalityDeep(currentAttributes?.get(attributeName), attributeValue)) {
                return;
              }
              const isRichText = isRichTextAttribute(block.name, attributeName);
              if (isRichText && 'string' === typeof attributeValue) {
                // Rich text values are stored as persistent Y.Text instances.
                // Update the value with a delta in place.
                const blockYText = currentAttributes.get(attributeName);
                mergeRichTextUpdate(blockYText, attributeValue, lastSelection);
              } else {
                currentAttributes.set(attributeName, createNewYAttributeValue(block.name, attributeName, attributeValue));
              }
            });

            // Delete any attributes that are no longer present.
            currentAttributes.forEach((_attrValue, attrName) => {
              if (!value.hasOwnProperty(attrName)) {
                currentAttributes.delete(attrName);
              }
            });
            break;
          }
        case 'innerBlocks':
          {
            // Recursively merge innerBlocks
            const yInnerBlocks = yblock.get(key);
            mergeCrdtBlocks(yInnerBlocks, value !== null && value !== void 0 ? value : [], lastSelection, _origin);
            break;
          }
        default:
          if (!equalityDeep(block[key], yblock.get(key))) {
            yblock.set(key, value);
          }
      }
    });
    yblock.forEach((_v, k) => {
      if (!block.hasOwnProperty(k)) {
        yblock.delete(k);
      }
    });
  }

  // deletes
  yblocks.delete(left, numOfDeletionsNeeded);

  // inserts
  for (let i = 0; i < numOfInsertionsNeeded; i++, left++) {
    const newBlock = [createNewYBlock(blocksToSync[left])];
    yblocks.insert(left, newBlock);
  }

  // remove duplicate clientids
  const knownClientIds = new Set();
  for (let j = 0; j < yblocks.length; j++) {
    const yblock = yblocks.get(j);
    let clientId = yblock.get('clientId');
    if (knownClientIds.has(clientId)) {
      clientId = esm_browser_v4();
      yblock.set('clientId', clientId);
    }
    knownClientIds.add(clientId);
  }
}

/**
 * Determine if a block should be synced.
 *
 * Ex: A gallery block should not be synced until the images have been
 * uploaded to WordPress, and their url is available. Before that,
 * it's not possible to access the blobs on a client as those are
 * local.
 *
 * @param block The block to check.
 * @return True if the block should be synced, false otherwise.
 */
function shouldBlockBeSynced(block) {
  // Verify that the gallery block is ready to be synced.
  // This means that, all images have had their blobs converted to full URLs.
  // Checking for only the blobs ensures that blocks that have just been inserted work as well.
  if ('core/gallery' === block.name) {
    return !block.innerBlocks.some(innerBlock => innerBlock.attributes && innerBlock.attributes.blob);
  }

  // Allow all other blocks to be synced.
  return true;
}

// Cache rich-text attributes for all block types.
let cachedRichTextAttributes;

/**
 * Given a block name and attribute key, return true if the attribute is rich-text typed.
 *
 * @param blockName     The name of the block, e.g. 'core/paragraph'.
 * @param attributeName The name of the attribute to check, e.g. 'content'.
 * @return True if the attribute is rich-text typed, false otherwise.
 */
function isRichTextAttribute(blockName, attributeName) {
  var _cachedRichTextAttrib;
  if (!cachedRichTextAttributes) {
    // Parse the attributes for all blocks once.
    cachedRichTextAttributes = new Map();
    for (const blockType of (0,external_wp_blocks_namespaceObject.getBlockTypes)()) {
      const richTextAttributeMap = new Map();
      for (const [name, definition] of Object.entries((_blockType$attributes = blockType.attributes) !== null && _blockType$attributes !== void 0 ? _blockType$attributes : {})) {
        var _blockType$attributes;
        if ('rich-text' === definition.type) {
          richTextAttributeMap.set(name, true);
        }
      }
      cachedRichTextAttributes.set(blockType.name, richTextAttributeMap);
    }
  }
  return (_cachedRichTextAttrib = cachedRichTextAttributes.get(blockName)?.has(attributeName)) !== null && _cachedRichTextAttrib !== void 0 ? _cachedRichTextAttrib : false;
}
let localDoc = null;

/**
 * Given a Y.Text object and an updated string value, diff the new value and
 * apply the delta to the Y.Text.
 *
 * @param blockYText    The Y.Text to update.
 * @param updatedValue  The updated value.
 * @param lastSelection The last cursor position before this update, used to hint the diff algorithm.
 */
function mergeRichTextUpdate(blockYText, updatedValue, lastSelection) {
  const doc = blockYText.doc;
  if (!doc) {
    throw new Error('mergeCrdtBlocks: Y.Text is not attached to a Y.Doc');
  }
  if (!localDoc) {
    // Y.Text must be attached to a Y.Doc to be able to do operations on it.
    // Create a temporary Y.Text attached to a local Y.Doc for delta computation.
    localDoc = new external_wp_sync_namespaceObject.Y.Doc();
  }
  const localYText = localDoc.getText('temporary-text');
  localYText.delete(0, localYText.length);
  localYText.insert(0, updatedValue);
  const currentValueAsDelta = new (Delta_default())(blockYText.toDelta());
  const updatedValueAsDelta = new (Delta_default())(localYText.toDelta());
  const deltaDiff = currentValueAsDelta.diff(updatedValueAsDelta, lastSelection?.offset);
  blockYText.applyDelta(deltaDiff.ops);
}

;// ./packages/core-data/build-module/utils/crdt.js
/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */
// @ts-ignore No types available.




/**
 * Internal dependencies
 */

let lastSelection = null;

/**
 * Given a set of local changes to a post record, apply those changes to the
 * local Y.Doc.
 *
 * @param {CRDTDoc}       ydoc
 * @param {PostChanges}   changes
 * @param {Post}          rawRecord
 * @param {Type}          postType
 * @param {Set< string >} syncedProperties
 * @param {string}        origin
 * @return {void}
 */
function applyPostChangesToCRDTDoc(ydoc, changes, rawRecord, postType, syncedProperties, origin) {
  const ymap = ydoc.getMap(external_wp_sync_namespaceObject.CRDT_RECORD_MAP_KEY);
  Object.entries(changes).forEach(([key, newValue]) => {
    if (!syncedProperties.has(key)) {
      return;
    }

    // Cannot serialize function values, so cannot sync them.
    if ('function' === typeof newValue) {
      return;
    }

    // Set the value in the root document.
    function setValue(updatedValue) {
      ymap.set(key, updatedValue);
    }
    switch (key) {
      case 'blocks':
        {
          var _ref;
          let currentBlocks = ymap.get('blocks');

          // Initialize.
          if (!(currentBlocks instanceof external_wp_sync_namespaceObject.Y.Array)) {
            currentBlocks = new external_wp_sync_namespaceObject.Y.Array();
            setValue(currentBlocks);
          }

          // Block[] from local changes.
          const newBlocks = (_ref = newValue) !== null && _ref !== void 0 ? _ref : [];

          // Merge blocks does not need `setValue` because it is operating on a
          // Yjs type that is already in the Y.Doc.
          mergeCrdtBlocks(currentBlocks, newBlocks, lastSelection, origin);
          break;
        }
      case 'excerpt':
        {
          const currentValue = ymap.get('excerpt');
          const rawNewValue = getRawValue(newValue);
          mergeValue(currentValue, rawNewValue, setValue);
          break;
        }

      // Meta is overloaded term in Core; here, it refers to post meta.
      case 'meta':
        {
          let metaMap = ymap.get('meta');

          // Initialize.
          if (!(metaMap instanceof external_wp_sync_namespaceObject.Y.Map)) {
            metaMap = new external_wp_sync_namespaceObject.Y.Map();
            setValue(metaMap);
          }

          // Iterate over each meta property in the new value and merge it (if it
          // is a synced meta property).
          Object.entries(newValue !== null && newValue !== void 0 ? newValue : {}).forEach(([metaKey, metaValue]) => {
            if (!shouldSyncMetaForPostType(metaKey, postType)) {
              return;
            }
            mergeValue(metaMap.get(metaKey),
            // current value in CRDT
            metaValue,
            // new value from local changes
            updatedMetaValue => {
              metaMap.set(metaKey, updatedMetaValue);
            });
          });
          break;
        }
      case 'slug':
        {
          // Do not sync an empty slug. This indicates that the post is using
          // the default auto-generated slug.
          if (!newValue) {
            break;
          }
          const currentValue = ymap.get('slug');
          mergeValue(currentValue, newValue, setValue);
          break;
        }
      case 'status':
        {
          const currentValue = ymap.get('status');
          let newStatus = newValue;

          // Undefined status indicates that we want to reset to the current
          // persisted value.
          if (undefined === newStatus) {
            newStatus = rawRecord.status;
          }
          mergeValue(currentValue, newStatus, setValue);
          break;
        }
      case 'title':
        {
          const currentValue = ymap.get('title');

          // Copy logic from prePersistPostType to ensure that the "Auto
          // Draft" template title is not synced.
          let rawNewValue = getRawValue(newValue);
          if (!currentValue && 'Auto Draft' === rawNewValue) {
            rawNewValue = '';
          }
          mergeValue(currentValue, rawNewValue, setValue);
          break;
        }

      // Add support for additional data types here.

      default:
        {
          const currentValue = ymap.get(key);
          mergeValue(currentValue, newValue, setValue);
        }
    }
  });

  // Update the lastSelection for CRDT use
  if ('selection' in changes) {
    var _changes$selection$se;
    lastSelection = (_changes$selection$se = changes.selection?.selectionStart) !== null && _changes$selection$se !== void 0 ? _changes$selection$se : null;
  }
}

/**
 * Given a local Y.Doc that *may* contain changes from remote peers, compare
 * against the local record and determine if there are changes (edits) we want
 * to dispatch.
 *
 * @param {CRDTDoc}       ydoc
 * @param {Post}          record
 * @param {Type}          postType
 * @param {Set< string >} syncedProperties
 * @return {Partial<PostChanges>} The changes that should be applied to the local record.
 */
function getPostChangesFromCRDTDoc(ydoc, record, postType, syncedProperties) {
  const ymap = ydoc.getMap(external_wp_sync_namespaceObject.CRDT_RECORD_MAP_KEY);
  return Object.fromEntries(Object.entries(ymap.toJSON()).filter(([key, newValue]) => {
    if (!syncedProperties.has(key)) {
      return false;
    }
    const currentValue = record[key];
    switch (key) {
      case 'blocks':
        {
          // We don't need to add special equality checks for `blocks` here
          // since that is done by the store for us!
          return true;
        }
      case 'date':
        {
          // Do not sync an empty date if our current value is a "floating" date.
          // Borrowing logic from the isEditedPostDateFloating selector.
          const currentDateIsFloating = ['draft', 'auto-draft', 'pending'].includes(ymap.get('status')) && (null === currentValue || record.modified === currentValue);
          if (!newValue && currentDateIsFloating) {
            return false;
          }
          return haveValuesChanged(currentValue, newValue);
        }
      case 'meta':
        {
          const allowedMeta = Object.fromEntries(Object.entries(newValue !== null && newValue !== void 0 ? newValue : {}).filter(([metaKey]) => shouldSyncMetaForPostType(metaKey, postType)));

          // Merge the allowed meta changes with the current meta values since
          // not all meta properties are synced.
          const mergedValue = {
            ...currentValue,
            ...allowedMeta
          };
          return haveValuesChanged(currentValue, mergedValue);
        }
      case 'status':
        {
          // Do not sync an invalid status.
          if ('auto-draft' === newValue) {
            return false;
          }
          return haveValuesChanged(currentValue, newValue);
        }
      case 'excerpt':
      case 'title':
        {
          return haveValuesChanged(getRawValue(currentValue), newValue);
        }

      // Add support for additional data types here.

      default:
        {
          return haveValuesChanged(currentValue, newValue);
        }
    }
  }));
}
function getInitialPostObjectData(record, postType, syncedProperties) {
  // Mix in the parsed blocks.
  const blocks = (0,external_wp_blocks_namespaceObject.parse)(getRawValue(record.content));
  return Object.fromEntries(Object.entries({
    ...record,
    blocks
  })
  // Only allow properties in the synced properties set.
  .filter(([key]) => syncedProperties.has(key)).map(([key, value]) => {
    switch (key) {
      case 'content':
      case 'excerpt':
      case 'title':
        {
          return [key, getRawValue(value)];
        }
      case 'meta':
        {
          return [key, Object.fromEntries(Object.entries(value !== null && value !== void 0 ? value : {}).filter(([metaKey]) => shouldSyncMetaForPostType(metaKey, postType)))];
        }
    }
    return [key, value];
  }));
}

/**
 * Extract the raw string value from a property that may be a string or an object
 * with a `raw` property (`RenderedText`).
 *
 * @param {unknown} value The value to extract from.
 * @return {string|undefined} The raw string value, or undefined if it could not be determined.
 */
function getRawValue(value) {
  // Value may be a string property or a nested object with a `raw` property.
  if ('string' === typeof value) {
    return value;
  }
  if (value && 'object' === typeof value && 'raw' in value && 'string' === typeof value.raw) {
    return value.raw;
  }
  return undefined;
}
function haveValuesChanged(currentValue, newValue) {
  return !equalityDeep(currentValue, newValue);
}
function mergeValue(currentValue, newValue, setValue) {
  if (haveValuesChanged(currentValue, newValue)) {
    setValue(newValue);
  }
}

/**
 * Given a post type definition, return the set of properties that should be
 * synced for that post type.
 *
 * @param {Type} postType The post type definition.
 * @return {Set<string>} The set of properties that should be synced.
 */
function getSyncedPropertiesForPostType(postType) {
  const syncedProperties = new Set(['date', 'status', 'tags', 'template', 'slug', 'sticky']);
  Object.entries(postType.supports || {}).forEach(([feature, isSupported]) => {
    if (!isSupported) {
      return;
    }
    switch (feature) {
      case 'author':
        syncedProperties.add('author');
        break;
      case 'comments':
        syncedProperties.add('comment_status');
        break;
      case 'custom-fields':
        syncedProperties.add('meta');
        break;
      case 'editor':
        syncedProperties.add('blocks');
        break;
      case 'excerpt':
        syncedProperties.add('excerpt');
        break;
      case 'post-formats':
        syncedProperties.add('format');
        break;
      case 'thumbnail':
        syncedProperties.add('featured_media');
        break;
      case 'trackbacks':
        syncedProperties.add('ping_status');
        break;
      case 'title':
        syncedProperties.add('title');
        break;
    }
  });
  return syncedProperties;
}
const metaDecisionCache = new Map();

/**
 * Given a meta key and post type definition, return a decision on whether to
 * sync the meta property.
 *
 * @param {string} metaKey  The meta key.
 * @param {Type}   postType The post type definition.
 * @return {boolean} Whether to sync the meta property.
 */
function shouldSyncMetaForPostType(metaKey, postType) {
  if (!metaDecisionCache.has(postType.slug)) {
    metaDecisionCache.set(postType.slug, new Map());
  }
  const decisionMap = metaDecisionCache.get(postType.slug);
  if (decisionMap.has(metaKey)) {
    return decisionMap.get(metaKey);
  }

  /**
   * In order to be available to the sync module, meta properties must be
   * registered against the post type and made available via the REST API
   * (`'show_in_rest' => true`).
   *
   * Of the registered meta properties, by default we do not sync "hidden" meta
   * fields (leading underscore in the meta key). This filter allows third-party
   * code to override that behavior.
   *
   * @param {boolean} shouldSync   Whether to sync the meta property.
   * @param {string}  metaKey      Meta key.
   * @param {string}  postTypeSlug The post type slug.
   * @param {Type}    postType     The post type definition.
   * @return {boolean} The filtered list of meta properties to sync.
   */
  const shouldSync = Boolean((0,external_wp_hooks_namespaceObject.applyFilters)('sync.shouldSyncMeta', !metaKey.startsWith('_'), metaKey, postType.slug, postType));
  decisionMap.set(metaKey, shouldSync);
  return shouldSync;
}

;// ./packages/core-data/build-module/entities.js
/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */



/**
 * Internal dependencies
 */

const DEFAULT_ENTITY_KEY = 'id';
const POST_RAW_ATTRIBUTES = ['title', 'excerpt', 'content'];
const rootEntitiesConfig = [{
  label: (0,external_wp_i18n_namespaceObject.__)('Base'),
  kind: 'root',
  name: '__unstableBase',
  baseURL: '/',
  baseURLParams: {
    // Please also change the preload path when changing this.
    // @see lib/compat/wordpress-6.8/preload.php
    _fields: ['description', 'gmt_offset', 'home', 'name', 'site_icon', 'site_icon_url', 'site_logo', 'timezone_string', 'url', 'page_for_posts', 'page_on_front', 'show_on_front'].join(',')
  },
  // The entity doesn't support selecting multiple records.
  // The property is maintained for backward compatibility.
  plural: '__unstableBases'
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Post Type'),
  name: 'postType',
  kind: 'root',
  key: 'slug',
  baseURL: '/wp/v2/types',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'postTypes'
}, {
  name: 'media',
  kind: 'root',
  baseURL: '/wp/v2/media',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'mediaItems',
  label: (0,external_wp_i18n_namespaceObject.__)('Media'),
  rawAttributes: ['caption', 'title', 'description'],
  supportsPagination: true
}, {
  name: 'taxonomy',
  kind: 'root',
  key: 'slug',
  baseURL: '/wp/v2/taxonomies',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'taxonomies',
  label: (0,external_wp_i18n_namespaceObject.__)('Taxonomy')
}, {
  name: 'sidebar',
  kind: 'root',
  baseURL: '/wp/v2/sidebars',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'sidebars',
  transientEdits: {
    blocks: true
  },
  label: (0,external_wp_i18n_namespaceObject.__)('Widget areas')
}, {
  name: 'widget',
  kind: 'root',
  baseURL: '/wp/v2/widgets',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'widgets',
  transientEdits: {
    blocks: true
  },
  label: (0,external_wp_i18n_namespaceObject.__)('Widgets')
}, {
  name: 'widgetType',
  kind: 'root',
  baseURL: '/wp/v2/widget-types',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'widgetTypes',
  label: (0,external_wp_i18n_namespaceObject.__)('Widget types')
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('User'),
  name: 'user',
  kind: 'root',
  baseURL: '/wp/v2/users',
  getTitle: record => record?.name || record?.slug,
  baseURLParams: {
    context: 'edit'
  },
  plural: 'users',
  supportsPagination: true
}, {
  name: 'comment',
  kind: 'root',
  baseURL: '/wp/v2/comments',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'comments',
  label: (0,external_wp_i18n_namespaceObject.__)('Comment'),
  supportsPagination: true
}, {
  name: 'menu',
  kind: 'root',
  baseURL: '/wp/v2/menus',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'menus',
  label: (0,external_wp_i18n_namespaceObject.__)('Menu'),
  supportsPagination: true
}, {
  name: 'menuItem',
  kind: 'root',
  baseURL: '/wp/v2/menu-items',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'menuItems',
  label: (0,external_wp_i18n_namespaceObject.__)('Menu Item'),
  rawAttributes: ['title'],
  supportsPagination: true
}, {
  name: 'menuLocation',
  kind: 'root',
  baseURL: '/wp/v2/menu-locations',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'menuLocations',
  label: (0,external_wp_i18n_namespaceObject.__)('Menu Location'),
  key: 'name'
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Global Styles'),
  name: 'globalStyles',
  kind: 'root',
  baseURL: '/wp/v2/global-styles',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'globalStylesVariations',
  // Should be different from name.
  getTitle: () => (0,external_wp_i18n_namespaceObject.__)('Custom Styles'),
  getRevisionsUrl: (parentId, revisionId) => `/wp/v2/global-styles/${parentId}/revisions${revisionId ? '/' + revisionId : ''}`,
  supportsPagination: true
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Themes'),
  name: 'theme',
  kind: 'root',
  baseURL: '/wp/v2/themes',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'themes',
  key: 'stylesheet'
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Plugins'),
  name: 'plugin',
  kind: 'root',
  baseURL: '/wp/v2/plugins',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'plugins',
  key: 'plugin'
}, {
  label: (0,external_wp_i18n_namespaceObject.__)('Status'),
  name: 'status',
  kind: 'root',
  baseURL: '/wp/v2/statuses',
  baseURLParams: {
    context: 'edit'
  },
  plural: 'statuses',
  key: 'slug'
}];
const deprecatedEntities = {
  root: {
    media: {
      since: '6.9',
      alternative: {
        kind: 'postType',
        name: 'attachment'
      }
    }
  }
};
const additionalEntityConfigLoaders = [{
  kind: 'postType',
  loadEntities: loadPostTypeEntities
}, {
  kind: 'taxonomy',
  loadEntities: loadTaxonomyEntities
}, {
  kind: 'root',
  name: 'site',
  plural: 'sites',
  loadEntities: loadSiteEntity
}];

/**
 * Returns a function to be used to retrieve extra edits to apply before persisting a post type.
 *
 * @param {Object} persistedRecord Already persisted Post
 * @param {Object} edits           Edits.
 * @return {Object} Updated edits.
 */
const prePersistPostType = (persistedRecord, edits) => {
  const newEdits = {};
  if (persistedRecord?.status === 'auto-draft') {
    // Saving an auto-draft should create a draft by default.
    if (!edits.status && !newEdits.status) {
      newEdits.status = 'draft';
    }

    // Fix the auto-draft default title.
    if ((!edits.title || edits.title === 'Auto Draft') && !newEdits.title && (!persistedRecord?.title || persistedRecord?.title === 'Auto Draft')) {
      newEdits.title = '';
    }
  }
  return newEdits;
};

/**
 * Returns the list of post type entities.
 *
 * @return {Promise} Entities promise
 */
async function loadPostTypeEntities() {
  const postTypes = await external_wp_apiFetch_default()({
    path: '/wp/v2/types?context=edit'
  });
  return Object.entries(postTypes !== null && postTypes !== void 0 ? postTypes : {}).map(([name, postType]) => {
    var _postType$rest_namesp;
    const isTemplate = ['wp_template', 'wp_template_part'].includes(name);
    const namespace = (_postType$rest_namesp = postType?.rest_namespace) !== null && _postType$rest_namesp !== void 0 ? _postType$rest_namesp : 'wp/v2';
    const syncedProperties = getSyncedPropertiesForPostType(postType);
    return {
      kind: 'postType',
      baseURL: `/${namespace}/${postType.rest_base}`,
      baseURLParams: {
        context: 'edit'
      },
      name,
      label: postType.name,
      transientEdits: {
        blocks: true,
        selection: true
      },
      mergedEdits: {
        meta: true
      },
      rawAttributes: POST_RAW_ATTRIBUTES,
      getTitle: record => {
        var _record$slug;
        return record?.title?.rendered || record?.title || (isTemplate ? capitalCase((_record$slug = record.slug) !== null && _record$slug !== void 0 ? _record$slug : '') : String(record.id));
      },
      __unstablePrePersist: isTemplate ? undefined : prePersistPostType,
      __unstable_rest_base: postType.rest_base,
      syncConfig: {
        /**
         * Is syncing enabled for this entity?
         *
         * @type {boolean}
         */
        enabled: Boolean(postType.supports?.['collaborative-editing'] && postType.supports?.editor),
        /**
         * Apply changes from the local editor to the local CRDT document so
         * that those changes can be synced to other peers (via the provider).
         *
         * @param {import('@wordpress/sync').CRDTDoc}               crdtDoc
         * @param {Partial< import('@wordpress/sync').ObjectData >} changes
         * @param {import('@wordpress/sync').ObjectData}            record
         * @param {string}                                          origin
         * @return {void}
         */
        applyChangesToCRDTDoc: (crdtDoc, changes, record, origin) => {
          applyPostChangesToCRDTDoc(crdtDoc, changes, record, postType, syncedProperties, origin);
        },
        /**
         * Extract changes from a CRDT document that can be used to update the
         * local editor state.
         *
         * @param {import('@wordpress/sync').CRDTDoc}    crdtDoc
         * @param {import('@wordpress/sync').ObjectData} record
         * @return {Partial< import('@wordpress/sync').ObjectData >} Changes to record
         */
        getChangesFromCRDTDoc: (crdtDoc, record) => getPostChangesFromCRDTDoc(crdtDoc, record, postType, syncedProperties),
        /**
         * This initial object data represents the data that will be synced via
         * the CRDT document, which may differ from the entity record. There may
         * be properties that should not be synced, or properties that are
         * derived from the record.
         *
         * @param {import('@wordpress/sync').ObjectData} record
         * @return {import('@wordpress/sync').ObjectData} The initial data
         */
        getInitialObjectData: record => getInitialPostObjectData(record, postType, syncedProperties),
        /**
         * Get the immutable identifier for an entity record.
         *
         * @param {import('@wordpress/sync').ObjectData} record
         * @return {import('@wordpress/sync').ObjectID} The entity's ID
         */
        getObjectId: ({
          id
        }) => id,
        /**
         * The object type for the entity, used to scope CRDT documents.
         *
         * @type {import('@wordpress/sync').ObjectType}
         */
        objectType: `postType/${postType.slug}`,
        /**
         * Sync features supported by the entity. Since overall syncing support
         * is gated by the `enabled` property, we don't need to check for
         * "editor" support here.
         *
         * @type {Record< string, boolean >}
         */
        supports: {
          awareness: true,
          crdtPersistence: Boolean(postType.supports?.['custom-fields']),
          undo: true
        },
        /**
         * The properties that should be synced via the CRDT document.
         *
         * @type {Set< string >}
         */
        syncedProperties
      },
      supportsPagination: true,
      getRevisionsUrl: (parentId, revisionId) => `/${namespace}/${postType.rest_base}/${parentId}/revisions${revisionId ? '/' + revisionId : ''}`,
      revisionKey: isTemplate ? 'wp_id' : DEFAULT_ENTITY_KEY
    };
  });
}

/**
 * Returns the list of the taxonomies entities.
 *
 * @return {Promise} Entities promise
 */
async function loadTaxonomyEntities() {
  const taxonomies = await external_wp_apiFetch_default()({
    path: '/wp/v2/taxonomies?context=view'
  });
  return Object.entries(taxonomies !== null && taxonomies !== void 0 ? taxonomies : {}).map(([name, taxonomy]) => {
    var _taxonomy$rest_namesp;
    const namespace = (_taxonomy$rest_namesp = taxonomy?.rest_namespace) !== null && _taxonomy$rest_namesp !== void 0 ? _taxonomy$rest_namesp : 'wp/v2';
    return {
      kind: 'taxonomy',
      baseURL: `/${namespace}/${taxonomy.rest_base}`,
      baseURLParams: {
        context: 'edit'
      },
      name,
      label: taxonomy.name,
      getTitle: record => record?.name,
      supportsPagination: true
    };
  });
}

/**
 * Returns the Site entity.
 *
 * @return {Promise} Entity promise
 */
async function loadSiteEntity() {
  var _site$schema$properti;
  const entity = {
    label: (0,external_wp_i18n_namespaceObject.__)('Site'),
    name: 'site',
    kind: 'root',
    baseURL: '/wp/v2/settings',
    meta: {}
  };
  const site = await external_wp_apiFetch_default()({
    path: entity.baseURL,
    method: 'OPTIONS'
  });
  const labels = {};
  Object.entries((_site$schema$properti = site?.schema?.properties) !== null && _site$schema$properti !== void 0 ? _site$schema$properti : {}).forEach(([key, value]) => {
    // Ignore properties `title` and `type` keys.
    if (typeof value === 'object' && value.title) {
      labels[key] = value.title;
    }
  });
  return [{
    ...entity,
    meta: {
      labels
    }
  }];
}

/**
 * Returns the entity's getter method name given its kind and name or plural name.
 *
 * @example
 * ```js
 * const nameSingular = getMethodName( 'root', 'theme', 'get' );
 * // nameSingular is getRootTheme
 *
 * const namePlural = getMethodName( 'root', 'themes', 'set' );
 * // namePlural is setRootThemes
 * ```
 *
 * @param {string} kind   Entity kind.
 * @param {string} name   Entity name or plural name.
 * @param {string} prefix Function prefix.
 *
 * @return {string} Method name
 */
const getMethodName = (kind, name, prefix = 'get') => {
  const kindPrefix = kind === 'root' ? '' : pascalCase(kind);
  const suffix = pascalCase(name);
  return `${prefix}${kindPrefix}${suffix}`;
};

;// external ["wp","url"]
const external_wp_url_namespaceObject = window["wp"]["url"];
;// ./packages/core-data/build-module/utils/get-normalized-comma-separable.js
/**
 * Given a value which can be specified as one or the other of a comma-separated
 * string or an array, returns a value normalized to an array of strings, or
 * null if the value cannot be interpreted as either.
 *
 * @param {string|string[]|*} value
 *
 * @return {?(string[])} Normalized field value.
 */
function getNormalizedCommaSeparable(value) {
  if (typeof value === 'string') {
    return value.split(',');
  } else if (Array.isArray(value)) {
    return value;
  }
  return null;
}
/* harmony default export */ const get_normalized_comma_separable = (getNormalizedCommaSeparable);

;// ./packages/core-data/build-module/utils/with-weak-map-cache.js
/**
 * Given a function, returns an enhanced function which caches the result and
 * tracks in WeakMap. The result is only cached if the original function is
 * passed a valid object-like argument (requirement for WeakMap key).
 *
 * @param {Function} fn Original function.
 *
 * @return {Function} Enhanced caching function.
 */
function withWeakMapCache(fn) {
  const cache = new WeakMap();
  return key => {
    let value;
    if (cache.has(key)) {
      value = cache.get(key);
    } else {
      value = fn(key);

      // Can reach here if key is not valid for WeakMap, since `has`
      // will return false for invalid key. Since `set` will throw,
      // ensure that key is valid before setting into cache.
      if (key !== null && typeof key === 'object') {
        cache.set(key, value);
      }
    }
    return value;
  };
}
/* harmony default export */ const with_weak_map_cache = (withWeakMapCache);

;// ./packages/core-data/build-module/queried-data/get-query-parts.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */


/**
 * An object of properties describing a specific query.
 *
 * @typedef {Object} WPQueriedDataQueryParts
 *
 * @property {number}      page      The query page (1-based index, default 1).
 * @property {number}      perPage   Items per page for query (default 10).
 * @property {string}      stableKey An encoded stable string of all non-
 *                                   pagination, non-fields query parameters.
 * @property {?(string[])} fields    Target subset of fields to derive from
 *                                   item objects.
 * @property {?(number[])} include   Specific item IDs to include.
 * @property {string}      context   Scope under which the request is made;
 *                                   determines returned fields in response.
 */

/**
 * Given a query object, returns an object of parts, including pagination
 * details (`page` and `perPage`, or default values). All other properties are
 * encoded into a stable (idempotent) `stableKey` value.
 *
 * @param {Object} query Optional query object.
 *
 * @return {WPQueriedDataQueryParts} Query parts.
 */
function getQueryParts(query) {
  /**
   * @type {WPQueriedDataQueryParts}
   */
  const parts = {
    stableKey: '',
    page: 1,
    perPage: 10,
    fields: null,
    include: null,
    context: 'default'
  };

  // Ensure stable key by sorting keys. Also more efficient for iterating.
  const keys = Object.keys(query).sort();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let value = query[key];
    switch (key) {
      case 'page':
        parts[key] = Number(value);
        break;
      case 'per_page':
        parts.perPage = Number(value);
        break;
      case 'context':
        parts.context = value;
        break;
      default:
        // While in theory, we could exclude "_fields" from the stableKey
        // because two request with different fields have the same results
        // We're not able to ensure that because the server can decide to omit
        // fields from the response even if we explicitly asked for it.
        // Example: Asking for titles in posts without title support.
        if (key === '_fields') {
          var _getNormalizedCommaSe;
          parts.fields = (_getNormalizedCommaSe = get_normalized_comma_separable(value)) !== null && _getNormalizedCommaSe !== void 0 ? _getNormalizedCommaSe : [];
          // Make sure to normalize value for `stableKey`
          value = parts.fields.join();
        }

        // Two requests with different include values cannot have same results.
        if (key === 'include') {
          var _getNormalizedCommaSe2;
          if (typeof value === 'number') {
            value = value.toString();
          }
          parts.include = ((_getNormalizedCommaSe2 = get_normalized_comma_separable(value)) !== null && _getNormalizedCommaSe2 !== void 0 ? _getNormalizedCommaSe2 : []).map(Number);
          // Normalize value for `stableKey`.
          value = parts.include.join();
        }

        // While it could be any deterministic string, for simplicity's
        // sake mimic querystring encoding for stable key.
        //
        // TODO: For consistency with PHP implementation, addQueryArgs
        // should accept a key value pair, which may optimize its
        // implementation for our use here, vs. iterating an object
        // with only a single key.
        parts.stableKey += (parts.stableKey ? '&' : '') + (0,external_wp_url_namespaceObject.addQueryArgs)('', {
          [key]: value
        }).slice(1);
    }
  }
  return parts;
}
/* harmony default export */ const get_query_parts = (with_weak_map_cache(getQueryParts));

;// ./packages/core-data/build-module/queried-data/reducer.js
/**
 * WordPress dependencies
 */



/**
 * Internal dependencies
 */



function getContextFromAction(action) {
  const {
    query
  } = action;
  if (!query) {
    return 'default';
  }
  const queryParts = get_query_parts(query);
  return queryParts.context;
}

/**
 * Returns a merged array of item IDs, given details of the received paginated
 * items. The array is sparse-like with `undefined` entries where holes exist.
 *
 * @param {?Array<number>} itemIds     Original item IDs (default empty array).
 * @param {number[]}       nextItemIds Item IDs to merge.
 * @param {number}         page        Page of items merged.
 * @param {number}         perPage     Number of items per page.
 *
 * @return {number[]} Merged array of item IDs.
 */
function getMergedItemIds(itemIds, nextItemIds, page, perPage) {
  var _itemIds$length;
  const receivedAllIds = page === 1 && perPage === -1;
  if (receivedAllIds) {
    return nextItemIds;
  }
  const nextItemIdsStartIndex = (page - 1) * perPage;

  // If later page has already been received, default to the larger known
  // size of the existing array, else calculate as extending the existing.
  const size = Math.max((_itemIds$length = itemIds?.length) !== null && _itemIds$length !== void 0 ? _itemIds$length : 0, nextItemIdsStartIndex + nextItemIds.length);

  // Preallocate array since size is known.
  const mergedItemIds = new Array(size);
  for (let i = 0; i < size; i++) {
    // Preserve existing item ID except for subset of range of next items.
    // We need to check against the possible maximum upper boundary because
    // a page could receive fewer than what was previously stored.
    const isInNextItemsRange = i >= nextItemIdsStartIndex && i < nextItemIdsStartIndex + perPage;
    mergedItemIds[i] = isInNextItemsRange ? nextItemIds[i - nextItemIdsStartIndex] : itemIds?.[i];
  }
  return mergedItemIds;
}

/**
 * Helper function to filter out entities with certain IDs.
 * Entities are keyed by their ID.
 *
 * @param {Object} entities Entity objects, keyed by entity ID.
 * @param {Array}  ids      Entity IDs to filter out.
 *
 * @return {Object} Filtered entities.
 */
function removeEntitiesById(entities, ids) {
  return Object.fromEntries(Object.entries(entities).filter(([id]) => !ids.some(itemId => {
    if (Number.isInteger(itemId)) {
      return itemId === +id;
    }
    return itemId === id;
  })));
}

/**
 * Reducer tracking items state, keyed by ID. Items are assumed to be normal,
 * where identifiers are common across all queries.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Next state.
 */
function items(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_ITEMS':
      {
        const context = getContextFromAction(action);
        const key = action.key || DEFAULT_ENTITY_KEY;
        return {
          ...state,
          [context]: {
            ...state[context],
            ...action.items.reduce((accumulator, value) => {
              const itemId = value?.[key];
              accumulator[itemId] = conservativeMapItem(state?.[context]?.[itemId], value);
              return accumulator;
            }, {})
          }
        };
      }
    case 'REMOVE_ITEMS':
      return Object.fromEntries(Object.entries(state).map(([itemId, contextState]) => [itemId, removeEntitiesById(contextState, action.itemIds)]));
  }
  return state;
}

/**
 * Reducer tracking item completeness, keyed by ID. A complete item is one for
 * which all fields are known. This is used in supporting `_fields` queries,
 * where not all properties associated with an entity are necessarily returned.
 * In such cases, completeness is used as an indication of whether it would be
 * safe to use queried data for a non-`_fields`-limited request.
 *
 * @param {Object<string,Object<string,boolean>>} state  Current state.
 * @param {Object}                                action Dispatched action.
 *
 * @return {Object<string,Object<string,boolean>>} Next state.
 */
function itemIsComplete(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_ITEMS':
      {
        const context = getContextFromAction(action);
        const {
          query,
          key = DEFAULT_ENTITY_KEY
        } = action;

        // An item is considered complete if it is received without an associated
        // fields query. Ideally, this would be implemented in such a way where the
        // complete aggregate of all fields would satisfy completeness. Since the
        // fields are not consistent across all entities, this would require
        // introspection on the REST schema for each entity to know which fields
        // compose a complete item for that entity.
        const queryParts = query ? get_query_parts(query) : {};
        const isCompleteQuery = !query || !Array.isArray(queryParts.fields);
        return {
          ...state,
          [context]: {
            ...state[context],
            ...action.items.reduce((result, item) => {
              const itemId = item?.[key];

              // Defer to completeness if already assigned. Technically the
              // data may be outdated if receiving items for a field subset.
              result[itemId] = state?.[context]?.[itemId] || isCompleteQuery;
              return result;
            }, {})
          }
        };
      }
    case 'REMOVE_ITEMS':
      return Object.fromEntries(Object.entries(state).map(([itemId, contextState]) => [itemId, removeEntitiesById(contextState, action.itemIds)]));
  }
  return state;
}

/**
 * Reducer tracking queries state, keyed by stable query key. Each reducer
 * query object includes `itemIds` and `requestingPageByPerPage`.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Next state.
 */
const receiveQueries = (0,external_wp_compose_namespaceObject.compose)([
// Limit to matching action type so we don't attempt to replace action on
// an unhandled action.
if_matching_action(action => 'query' in action),
// Inject query parts into action for use both in `onSubKey` and reducer.
replace_action(action => {
  // `ifMatchingAction` still passes on initialization, where state is
  // undefined and a query is not assigned. Avoid attempting to parse
  // parts. `onSubKey` will omit by lack of `stableKey`.
  if (action.query) {
    return {
      ...action,
      ...get_query_parts(action.query)
    };
  }
  return action;
}), on_sub_key('context'),
// Queries shape is shared, but keyed by query `stableKey` part. Original
// reducer tracks only a single query object.
on_sub_key('stableKey')])((state = {}, action) => {
  const {
    type,
    page,
    perPage,
    key = DEFAULT_ENTITY_KEY
  } = action;
  if (type !== 'RECEIVE_ITEMS') {
    return state;
  }
  return {
    itemIds: getMergedItemIds(state?.itemIds || [], action.items.map(item => item?.[key]).filter(Boolean), page, perPage),
    meta: action.meta
  };
});

/**
 * Reducer tracking queries state.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Next state.
 */
const queries = (state = {}, action) => {
  switch (action.type) {
    case 'RECEIVE_ITEMS':
      return receiveQueries(state, action);
    case 'REMOVE_ITEMS':
      const removedItems = action.itemIds.reduce((result, itemId) => {
        result[itemId] = true;
        return result;
      }, {});
      return Object.fromEntries(Object.entries(state).map(([queryGroup, contextQueries]) => [queryGroup, Object.fromEntries(Object.entries(contextQueries).map(([query, queryItems]) => [query, {
        ...queryItems,
        itemIds: queryItems.itemIds.filter(queryId => !removedItems[queryId])
      }]))]));
    default:
      return state;
  }
};
/* harmony default export */ const reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  items,
  itemIsComplete,
  queries
}));

;// ./packages/core-data/build-module/reducer.js
/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */




/**
 * Internal dependencies
 */




/** @typedef {import('./types').AnyFunction} AnyFunction */

/**
 * Reducer managing authors state. Keyed by id.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
function users(state = {
  byId: {},
  queries: {}
}, action) {
  switch (action.type) {
    case 'RECEIVE_USER_QUERY':
      return {
        byId: {
          ...state.byId,
          // Key users by their ID.
          ...action.users.reduce((newUsers, user) => ({
            ...newUsers,
            [user.id]: user
          }), {})
        },
        queries: {
          ...state.queries,
          [action.queryID]: action.users.map(user => user.id)
        }
      };
  }
  return state;
}

/**
 * Reducer managing current user state.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
function currentUser(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_CURRENT_USER':
      return action.currentUser;
  }
  return state;
}

/**
 * Reducer managing the current theme.
 *
 * @param {string|undefined} state  Current state.
 * @param {Object}           action Dispatched action.
 *
 * @return {string|undefined} Updated state.
 */
function currentTheme(state = undefined, action) {
  switch (action.type) {
    case 'RECEIVE_CURRENT_THEME':
      return action.currentTheme.stylesheet;
  }
  return state;
}

/**
 * Reducer managing the current global styles id.
 *
 * @param {string|undefined} state  Current state.
 * @param {Object}           action Dispatched action.
 *
 * @return {string|undefined} Updated state.
 */
function currentGlobalStylesId(state = undefined, action) {
  switch (action.type) {
    case 'RECEIVE_CURRENT_GLOBAL_STYLES_ID':
      return action.id;
  }
  return state;
}

/**
 * Reducer managing the theme base global styles.
 *
 * @param {Record<string, object>} state  Current state.
 * @param {Object}                 action Dispatched action.
 *
 * @return {Record<string, object>} Updated state.
 */
function themeBaseGlobalStyles(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_THEME_GLOBAL_STYLES':
      return {
        ...state,
        [action.stylesheet]: action.globalStyles
      };
  }
  return state;
}

/**
 * Reducer managing the theme global styles variations.
 *
 * @param {Record<string, object>} state  Current state.
 * @param {Object}                 action Dispatched action.
 *
 * @return {Record<string, object>} Updated state.
 */
function themeGlobalStyleVariations(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_THEME_GLOBAL_STYLE_VARIATIONS':
      return {
        ...state,
        [action.stylesheet]: action.variations
      };
  }
  return state;
}
const withMultiEntityRecordEdits = reducer => (state, action) => {
  if (action.type === 'UNDO' || action.type === 'REDO') {
    const {
      record
    } = action;
    let newState = state;
    record.forEach(({
      id: {
        kind,
        name,
        recordId
      },
      changes
    }) => {
      newState = reducer(newState, {
        type: 'EDIT_ENTITY_RECORD',
        kind,
        name,
        recordId,
        edits: Object.entries(changes).reduce((acc, [key, value]) => {
          acc[key] = action.type === 'UNDO' ? value.from : value.to;
          return acc;
        }, {})
      });
    });
    return newState;
  }
  return reducer(state, action);
};

/**
 * Higher Order Reducer for a given entity config. It supports:
 *
 *  - Fetching
 *  - Editing
 *  - Saving
 *
 * @param {Object} entityConfig Entity config.
 *
 * @return {AnyFunction} Reducer.
 */
function entity(entityConfig) {
  return (0,external_wp_compose_namespaceObject.compose)([withMultiEntityRecordEdits,
  // Limit to matching action type so we don't attempt to replace action on
  // an unhandled action.
  if_matching_action(action => action.name && action.kind && action.name === entityConfig.name && action.kind === entityConfig.kind),
  // Inject the entity config into the action.
  replace_action(action => {
    return {
      key: entityConfig.key || DEFAULT_ENTITY_KEY,
      ...action
    };
  })])((0,external_wp_data_namespaceObject.combineReducers)({
    queriedData: reducer,
    edits: (state = {}, action) => {
      var _action$query$context;
      switch (action.type) {
        case 'RECEIVE_ITEMS':
          const context = (_action$query$context = action?.query?.context) !== null && _action$query$context !== void 0 ? _action$query$context : 'default';
          if (context !== 'default') {
            return state;
          }
          const nextState = {
            ...state
          };
          for (const record of action.items) {
            const recordId = record?.[action.key];
            const edits = nextState[recordId];
            if (!edits) {
              continue;
            }
            const nextEdits = Object.keys(edits).reduce((acc, key) => {
              var _record$key$raw;
              // If the edited value is still different to the persisted value,
              // keep the edited value in edits.
              if (
              // Edits are the "raw" attribute values, but records may have
              // objects with more properties, so we use `get` here for the
              // comparison.
              !es6_default()(edits[key], (_record$key$raw = record[key]?.raw) !== null && _record$key$raw !== void 0 ? _record$key$raw : record[key]) && (
              // Sometimes the server alters the sent value which means
              // we need to also remove the edits before the api request.
              !action.persistedEdits || !es6_default()(edits[key], action.persistedEdits[key]))) {
                acc[key] = edits[key];
              }
              return acc;
            }, {});
            if (Object.keys(nextEdits).length) {
              nextState[recordId] = nextEdits;
            } else {
              delete nextState[recordId];
            }
          }
          return nextState;
        case 'EDIT_ENTITY_RECORD':
          const nextEdits = {
            ...state[action.recordId],
            ...action.edits
          };
          Object.keys(nextEdits).forEach(key => {
            // Delete cleared edits so that the properties
            // are not considered dirty.
            if (nextEdits[key] === undefined) {
              delete nextEdits[key];
            }
          });
          return {
            ...state,
            [action.recordId]: nextEdits
          };
      }
      return state;
    },
    saving: (state = {}, action) => {
      switch (action.type) {
        case 'SAVE_ENTITY_RECORD_START':
        case 'SAVE_ENTITY_RECORD_FINISH':
          return {
            ...state,
            [action.recordId]: {
              pending: action.type === 'SAVE_ENTITY_RECORD_START',
              error: action.error,
              isAutosave: action.isAutosave
            }
          };
      }
      return state;
    },
    deleting: (state = {}, action) => {
      switch (action.type) {
        case 'DELETE_ENTITY_RECORD_START':
        case 'DELETE_ENTITY_RECORD_FINISH':
          return {
            ...state,
            [action.recordId]: {
              pending: action.type === 'DELETE_ENTITY_RECORD_START',
              error: action.error
            }
          };
      }
      return state;
    },
    revisions: (state = {}, action) => {
      // Use the same queriedDataReducer shape for revisions.
      if (action.type === 'RECEIVE_ITEM_REVISIONS') {
        const recordKey = action.recordKey;
        delete action.recordKey;
        const newState = reducer(state[recordKey], {
          ...action,
          type: 'RECEIVE_ITEMS'
        });
        return {
          ...state,
          [recordKey]: newState
        };
      }
      if (action.type === 'REMOVE_ITEMS') {
        return Object.fromEntries(Object.entries(state).filter(([id]) => !action.itemIds.some(itemId => {
          if (Number.isInteger(itemId)) {
            return itemId === +id;
          }
          return itemId === id;
        })));
      }
      return state;
    }
  }));
}

/**
 * Reducer keeping track of the registered entities.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
function entitiesConfig(state = rootEntitiesConfig, action) {
  switch (action.type) {
    case 'ADD_ENTITIES':
      return [...state, ...action.entities];
  }
  return state;
}

/**
 * Reducer keeping track of the registered entities config and data.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
const entities = (state = {}, action) => {
  const newConfig = entitiesConfig(state.config, action);

  // Generates a reducer for the entities nested by `kind` and `name`.
  // A config array with shape:
  // ```
  // [
  //   { kind: 'taxonomy', name: 'category' },
  //   { kind: 'taxonomy', name: 'post_tag' },
  //   { kind: 'postType', name: 'post' },
  //   { kind: 'postType', name: 'page' },
  // ]
  // ```
  // generates a reducer for state tree with shape:
  // ```
  // {
  //   taxonomy: {
  //     category,
  //     post_tag,
  //   },
  //   postType: {
  //     post,
  //     page,
  //   },
  // }
  // ```
  let entitiesDataReducer = state.reducer;
  if (!entitiesDataReducer || newConfig !== state.config) {
    const entitiesByKind = newConfig.reduce((acc, record) => {
      const {
        kind
      } = record;
      if (!acc[kind]) {
        acc[kind] = [];
      }
      acc[kind].push(record);
      return acc;
    }, {});
    entitiesDataReducer = (0,external_wp_data_namespaceObject.combineReducers)(Object.fromEntries(Object.entries(entitiesByKind).map(([kind, subEntities]) => {
      const kindReducer = (0,external_wp_data_namespaceObject.combineReducers)(Object.fromEntries(subEntities.map(entityConfig => [entityConfig.name, entity(entityConfig)])));
      return [kind, kindReducer];
    })));
  }
  const newData = entitiesDataReducer(state.records, action);
  if (newData === state.records && newConfig === state.config && entitiesDataReducer === state.reducer) {
    return state;
  }
  return {
    reducer: entitiesDataReducer,
    records: newData,
    config: newConfig
  };
};

/**
 * @type {UndoManager}
 */
function undoManager(state = createUndoManager()) {
  return state;
}
function editsReference(state = {}, action) {
  switch (action.type) {
    case 'EDIT_ENTITY_RECORD':
    case 'UNDO':
    case 'REDO':
      return {};
  }
  return state;
}

/**
 * Reducer managing embed preview data.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
function embedPreviews(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_EMBED_PREVIEW':
      const {
        url,
        preview
      } = action;
      return {
        ...state,
        [url]: preview
      };
  }
  return state;
}

/**
 * State which tracks whether the user can perform an action on a REST
 * resource.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
function userPermissions(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_USER_PERMISSION':
      return {
        ...state,
        [action.key]: action.isAllowed
      };
    case 'RECEIVE_USER_PERMISSIONS':
      return {
        ...state,
        ...action.permissions
      };
  }
  return state;
}

/**
 * Reducer returning autosaves keyed by their parent's post id.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
function autosaves(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_AUTOSAVES':
      const {
        postId,
        autosaves: autosavesData
      } = action;
      return {
        ...state,
        [postId]: autosavesData
      };
  }
  return state;
}
function blockPatterns(state = [], action) {
  switch (action.type) {
    case 'RECEIVE_BLOCK_PATTERNS':
      return action.patterns;
  }
  return state;
}
function blockPatternCategories(state = [], action) {
  switch (action.type) {
    case 'RECEIVE_BLOCK_PATTERN_CATEGORIES':
      return action.categories;
  }
  return state;
}
function userPatternCategories(state = [], action) {
  switch (action.type) {
    case 'RECEIVE_USER_PATTERN_CATEGORIES':
      return action.patternCategories;
  }
  return state;
}
function navigationFallbackId(state = null, action) {
  switch (action.type) {
    case 'RECEIVE_NAVIGATION_FALLBACK_ID':
      return action.fallbackId;
  }
  return state;
}

/**
 * Reducer managing the theme global styles revisions.
 *
 * @param {Record<string, object>} state  Current state.
 * @param {Object}                 action Dispatched action.
 *
 * @return {Record<string, object>} Updated state.
 */
function themeGlobalStyleRevisions(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_THEME_GLOBAL_STYLE_REVISIONS':
      return {
        ...state,
        [action.currentId]: action.revisions
      };
  }
  return state;
}

/**
 * Reducer managing the template lookup per query.
 *
 * @param {Record<string, string>} state  Current state.
 * @param {Object}                 action Dispatched action.
 *
 * @return {Record<string, string>} Updated state.
 */
function defaultTemplates(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_DEFAULT_TEMPLATE':
      return {
        ...state,
        [JSON.stringify(action.query)]: action.templateId
      };
  }
  return state;
}

/**
 * Reducer returning an object of registered post meta.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
function registeredPostMeta(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_REGISTERED_POST_META':
      return {
        ...state,
        [action.postType]: action.registeredPostMeta
      };
  }
  return state;
}
/* harmony default export */ const build_module_reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  users,
  currentTheme,
  currentGlobalStylesId,
  currentUser,
  themeGlobalStyleVariations,
  themeBaseGlobalStyles,
  themeGlobalStyleRevisions,
  entities,
  editsReference,
  undoManager,
  embedPreviews,
  userPermissions,
  autosaves,
  blockPatterns,
  blockPatternCategories,
  userPatternCategories,
  navigationFallbackId,
  defaultTemplates,
  registeredPostMeta
}));

;// external ["wp","deprecated"]
const external_wp_deprecated_namespaceObject = window["wp"]["deprecated"];
var external_wp_deprecated_default = /*#__PURE__*/__webpack_require__.n(external_wp_deprecated_namespaceObject);
;// ./packages/core-data/build-module/name.js
/**
 * The reducer key used by core data in store registration.
 * This is defined in a separate file to avoid cycle-dependency
 *
 * @type {string}
 */
const STORE_NAME = 'core';

// EXTERNAL MODULE: ./node_modules/equivalent-key-map/equivalent-key-map.js
var equivalent_key_map = __webpack_require__(3249);
var equivalent_key_map_default = /*#__PURE__*/__webpack_require__.n(equivalent_key_map);
;// ./packages/core-data/build-module/utils/set-nested-value.js
/**
 * Sets the value at path of object.
 * If a portion of path doesn’t exist, it’s created.
 * Arrays are created for missing index properties while objects are created
 * for all other missing properties.
 *
 * Path is specified as either:
 * - a string of properties, separated by dots, for example: "x.y".
 * - an array of properties, for example `[ 'x', 'y' ]`.
 *
 * This function intentionally mutates the input object.
 *
 * Inspired by _.set().
 *
 * @see https://lodash.com/docs/4.17.15#set
 *
 * @todo Needs to be deduplicated with its copy in `@wordpress/edit-site`.
 *
 * @param {Object}       object Object to modify
 * @param {Array|string} path   Path of the property to set.
 * @param {*}            value  Value to set.
 */
function setNestedValue(object, path, value) {
  if (!object || typeof object !== 'object') {
    return object;
  }
  const normalizedPath = Array.isArray(path) ? path : path.split('.');
  normalizedPath.reduce((acc, key, idx) => {
    if (acc[key] === undefined) {
      if (Number.isInteger(normalizedPath[idx + 1])) {
        acc[key] = [];
      } else {
        acc[key] = {};
      }
    }
    if (idx === normalizedPath.length - 1) {
      acc[key] = value;
    }
    return acc[key];
  }, object);
  return object;
}

;// ./packages/core-data/build-module/queried-data/selectors.js
/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */



/**
 * Cache of state keys to EquivalentKeyMap where the inner map tracks queries
 * to their resulting items set. WeakMap allows garbage collection on expired
 * state references.
 *
 * @type {WeakMap<Object,EquivalentKeyMap>}
 */
const queriedItemsCacheByState = new WeakMap();

/**
 * Returns items for a given query, or null if the items are not known.
 *
 * @param {Object}  state State object.
 * @param {?Object} query Optional query.
 *
 * @return {?Array} Query items.
 */
function getQueriedItemsUncached(state, query) {
  const {
    stableKey,
    page,
    perPage,
    include,
    fields,
    context
  } = get_query_parts(query);
  let itemIds;
  if (state.queries?.[context]?.[stableKey]) {
    itemIds = state.queries[context][stableKey].itemIds;
  }
  if (!itemIds) {
    return null;
  }
  const startOffset = perPage === -1 ? 0 : (page - 1) * perPage;
  const endOffset = perPage === -1 ? itemIds.length : Math.min(startOffset + perPage, itemIds.length);
  const items = [];
  for (let i = startOffset; i < endOffset; i++) {
    const itemId = itemIds[i];
    if (Array.isArray(include) && !include.includes(itemId)) {
      continue;
    }
    if (itemId === undefined) {
      continue;
    }
    // Having a target item ID doesn't guarantee that this object has been queried.
    if (!state.items[context]?.hasOwnProperty(itemId)) {
      return null;
    }
    const item = state.items[context][itemId];
    let filteredItem;
    if (Array.isArray(fields)) {
      filteredItem = {};
      for (let f = 0; f < fields.length; f++) {
        const field = fields[f].split('.');
        let value = item;
        field.forEach(fieldName => {
          value = value?.[fieldName];
        });
        setNestedValue(filteredItem, field, value);
      }
    } else {
      // If expecting a complete item, validate that completeness, or
      // otherwise abort.
      if (!state.itemIsComplete[context]?.[itemId]) {
        return null;
      }
      filteredItem = item;
    }
    items.push(filteredItem);
  }
  return items;
}

/**
 * Returns items for a given query, or null if the items are not known. Caches
 * result both per state (by reference) and per query (by deep equality).
 * The caching approach is intended to be durable to query objects which are
 * deeply but not referentially equal, since otherwise:
 *
 * `getQueriedItems( state, {} ) !== getQueriedItems( state, {} )`
 *
 * @param {Object}  state State object.
 * @param {?Object} query Optional query.
 *
 * @return {?Array} Query items.
 */
const getQueriedItems = (0,external_wp_data_namespaceObject.createSelector)((state, query = {}) => {
  let queriedItemsCache = queriedItemsCacheByState.get(state);
  if (queriedItemsCache) {
    const queriedItems = queriedItemsCache.get(query);
    if (queriedItems !== undefined) {
      return queriedItems;
    }
  } else {
    queriedItemsCache = new (equivalent_key_map_default())();
    queriedItemsCacheByState.set(state, queriedItemsCache);
  }
  const items = getQueriedItemsUncached(state, query);
  queriedItemsCache.set(query, items);
  return items;
});
function getQueriedTotalItems(state, query = {}) {
  var _state$queries$contex;
  const {
    stableKey,
    context
  } = get_query_parts(query);
  return (_state$queries$contex = state.queries?.[context]?.[stableKey]?.meta?.totalItems) !== null && _state$queries$contex !== void 0 ? _state$queries$contex : null;
}
function getQueriedTotalPages(state, query = {}) {
  var _state$queries$contex2;
  const {
    stableKey,
    context
  } = get_query_parts(query);
  return (_state$queries$contex2 = state.queries?.[context]?.[stableKey]?.meta?.totalPages) !== null && _state$queries$contex2 !== void 0 ? _state$queries$contex2 : null;
}

;// external ["wp","privateApis"]
const external_wp_privateApis_namespaceObject = window["wp"]["privateApis"];
;// ./packages/core-data/build-module/lock-unlock.js
/**
 * WordPress dependencies
 */

const {
  lock,
  unlock
} = (0,external_wp_privateApis_namespaceObject.__dangerousOptInToUnstableAPIsOnlyForCoreModules)('I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.', '@wordpress/core-data');

;// ./packages/core-data/build-module/utils/log-entity-deprecation.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

let loggedAlready = false;

/**
 * Logs a deprecation warning for an entity, if it's deprecated.
 *
 * @param kind                            The kind of the entity.
 * @param name                            The name of the entity.
 * @param functionName                    The name of the function that was called with a deprecated entity.
 * @param options                         The options for the deprecation warning.
 * @param options.alternativeFunctionName The name of the alternative function that should be used instead.
 * @param options.isShorthandSelector     Whether the function is a shorthand selector.
 */
function logEntityDeprecation(kind, name, functionName, {
  alternativeFunctionName,
  isShorthandSelector = false
} = {}) {
  const deprecation = deprecatedEntities[kind]?.[name];
  if (!deprecation) {
    return;
  }
  if (!loggedAlready) {
    const {
      alternative
    } = deprecation;
    const message = isShorthandSelector ? `'${functionName}'` : `The '${kind}', '${name}' entity (used via '${functionName}')`;
    let alternativeMessage = `the '${alternative.kind}', '${alternative.name}' entity`;
    if (alternativeFunctionName) {
      alternativeMessage += ` via the '${alternativeFunctionName}' function`;
    }
    external_wp_deprecated_default()(message, {
      ...deprecation,
      alternative: alternativeMessage
    });
  }

  // Only log an entity deprecation once per call stack,
  // else there's spurious logging when selections or actions call through to other selectors or actions.
  // Note: this won't prevent the deprecation warning being logged if a selector or action makes an async call
  // to another selector or action, but this is probably the best we can do.
  loggedAlready = true;
  // At the end of the call stack, reset the flag.
  setTimeout(() => {
    loggedAlready = false;
  }, 0);
}

;// ./packages/core-data/build-module/sync.js
/**
 * WordPress dependencies
 */


let syncProvider = null;

/**
 * Returns the current sync provider, filterable by external code.
 *
 * If no sync provider is set, it returns a fallback no-op sync provider to
 * remove the need for defensive checks in the code that uses it.
 *
 * @return The current sync provider.
 */
function getSyncProvider() {
  if (syncProvider) {
    return syncProvider;
  }
  const fallbackNoOpSyncProvider = new external_wp_sync_namespaceObject.SyncProvider();
  syncProvider = (0,external_wp_hooks_namespaceObject.applyFilters)('core.getSyncProvider', null);

  // If the filter does not produce a provider and the experimental flag is set,
  // get the WebRTC sync provider.
  if (!syncProvider && window.__experimentalEnableSync) {
    syncProvider = (0,external_wp_sync_namespaceObject.getWebRTCSyncProvider)();
  }

  // If no sync provider is set, use the fallback no-op sync provider.
  if (!syncProvider) {
    syncProvider = fallbackNoOpSyncProvider;
  }
  return syncProvider;
}

;// ./packages/core-data/build-module/private-selectors.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */





/**
 * Returns the previous edit from the current undo offset
 * for the entity records edits history, if any.
 *
 * @param state State tree.
 *
 * @return The undo manager.
 */
function getUndoManager(state) {
  var _getSyncProvider$getU;
  return (_getSyncProvider$getU = getSyncProvider().getUndoManager()) !== null && _getSyncProvider$getU !== void 0 ? _getSyncProvider$getU : state.undoManager;
}

/**
 * Retrieve the fallback Navigation.
 *
 * @param state Data state.
 * @return The ID for the fallback Navigation post.
 */
function getNavigationFallbackId(state) {
  return state.navigationFallbackId;
}
const getBlockPatternsForPostType = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)((state, postType) => select(STORE_NAME).getBlockPatterns().filter(({
  postTypes
}) => !postTypes || Array.isArray(postTypes) && postTypes.includes(postType)), () => [select(STORE_NAME).getBlockPatterns()]));

/**
 * Returns the entity records permissions for the given entity record ids.
 */
const getEntityRecordsPermissions = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, ids) => {
  const normalizedIds = Array.isArray(ids) ? ids : [ids];
  return normalizedIds.map(id => ({
    delete: select(STORE_NAME).canUser('delete', {
      kind,
      name,
      id
    }),
    update: select(STORE_NAME).canUser('update', {
      kind,
      name,
      id
    })
  }));
}, state => [state.userPermissions]));

/**
 * Returns the entity record permissions for the given entity record id.
 *
 * @param state Data state.
 * @param kind  Entity kind.
 * @param name  Entity name.
 * @param id    Entity record id.
 *
 * @return The entity record permissions.
 */
function getEntityRecordPermissions(state, kind, name, id) {
  logEntityDeprecation(kind, name, 'getEntityRecordPermissions');
  return getEntityRecordsPermissions(state, kind, name, id)[0];
}

/**
 * Returns the registered post meta fields for a given post type.
 *
 * @param state    Data state.
 * @param postType Post type.
 *
 * @return Registered post meta fields.
 */
function getRegisteredPostMeta(state, postType) {
  var _state$registeredPost;
  return (_state$registeredPost = state.registeredPostMeta?.[postType]) !== null && _state$registeredPost !== void 0 ? _state$registeredPost : {};
}
function normalizePageId(value) {
  if (!value || !['number', 'string'].includes(typeof value)) {
    return null;
  }

  // We also need to check if it's not zero (`'0'`).
  if (Number(value) === 0) {
    return null;
  }
  return value.toString();
}
const getHomePage = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (0,external_wp_data_namespaceObject.createSelector)(() => {
  const siteData = select(STORE_NAME).getEntityRecord('root', '__unstableBase');
  // Still resolving getEntityRecord.
  if (!siteData) {
    return null;
  }
  const homepageId = siteData?.show_on_front === 'page' ? normalizePageId(siteData.page_on_front) : null;
  if (homepageId) {
    return {
      postType: 'page',
      postId: homepageId
    };
  }
  const frontPageTemplateId = select(STORE_NAME).getDefaultTemplateId({
    slug: 'front-page'
  });
  // Still resolving getDefaultTemplateId.
  if (!frontPageTemplateId) {
    return null;
  }
  return {
    postType: 'wp_template',
    postId: frontPageTemplateId
  };
}, state => [getEntityRecord(state, 'root', '__unstableBase'), getDefaultTemplateId(state, {
  slug: 'front-page'
})]));
const getPostsPageId = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => () => {
  const siteData = select(STORE_NAME).getEntityRecord('root', '__unstableBase');
  return siteData?.show_on_front === 'page' ? normalizePageId(siteData.page_for_posts) : null;
});
const getTemplateId = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, postType, postId) => {
  const homepage = unlock(select(STORE_NAME)).getHomePage();
  if (!homepage) {
    return;
  }

  // For the front page, we always use the front page template if existing.
  if (postType === 'page' && postType === homepage?.postType && postId.toString() === homepage?.postId) {
    // The /lookup endpoint cannot currently handle a lookup
    // when a page is set as the front page, so specifically in
    // that case, we want to check if there is a front page
    // template, and instead of falling back to the home
    // template, we want to fall back to the page template.
    const templates = select(STORE_NAME).getEntityRecords('postType', 'wp_template', {
      per_page: -1
    });
    if (!templates) {
      return;
    }
    const id = templates.find(({
      slug
    }) => slug === 'front-page')?.id;
    if (id) {
      return id;
    }
    // If no front page template is found, continue with the
    // logic below (fetching the page template).
  }
  const editedEntity = select(STORE_NAME).getEditedEntityRecord('postType', postType, postId);
  if (!editedEntity) {
    return;
  }
  const postsPageId = unlock(select(STORE_NAME)).getPostsPageId();
  // Check if the current page is the posts page.
  if (postType === 'page' && postsPageId === postId.toString()) {
    return select(STORE_NAME).getDefaultTemplateId({
      slug: 'home'
    });
  }
  // First see if the post/page has an assigned template and fetch it.
  const currentTemplateSlug = editedEntity.template;
  if (currentTemplateSlug) {
    const currentTemplate = select(STORE_NAME).getEntityRecords('postType', 'wp_template', {
      per_page: -1
    })?.find(({
      slug
    }) => slug === currentTemplateSlug);
    if (currentTemplate) {
      return currentTemplate.id;
    }
  }
  // If no template is assigned, use the default template.
  let slugToCheck;
  // In `draft` status we might not have a slug available, so we use the `single`
  // post type templates slug(ex page, single-post, single-product etc..).
  // Pages do not need the `single` prefix in the slug to be prioritized
  // through template hierarchy.
  if (editedEntity.slug) {
    slugToCheck = postType === 'page' ? `${postType}-${editedEntity.slug}` : `single-${postType}-${editedEntity.slug}`;
  } else {
    slugToCheck = postType === 'page' ? 'page' : `single-${postType}`;
  }
  return select(STORE_NAME).getDefaultTemplateId({
    slug: slugToCheck
  });
});

;// ./packages/core-data/build-module/utils/is-numeric-id.js
/**
 * Checks argument to determine if it's a numeric ID.
 * For example, '123' is a numeric ID, but '123abc' is not.
 *
 * @param {any} id the argument to determine if it's a numeric ID.
 * @return {boolean} true if the string is a numeric ID, false otherwise.
 */
function isNumericID(id) {
  return /^\s*\d+\s*$/.test(id);
}

;// ./packages/core-data/build-module/utils/is-raw-attribute.js
/**
 * Checks whether the attribute is a "raw" attribute or not.
 *
 * @param {Object} entity    Entity record.
 * @param {string} attribute Attribute name.
 *
 * @return {boolean} Is the attribute raw
 */
function isRawAttribute(entity, attribute) {
  return (entity.rawAttributes || []).includes(attribute);
}

;// ./packages/core-data/build-module/utils/user-permissions.js
const ALLOWED_RESOURCE_ACTIONS = ['create', 'read', 'update', 'delete'];
function getUserPermissionsFromAllowHeader(allowedMethods) {
  const permissions = {};
  if (!allowedMethods) {
    return permissions;
  }
  const methods = {
    create: 'POST',
    read: 'GET',
    update: 'PUT',
    delete: 'DELETE'
  };
  for (const [actionName, methodName] of Object.entries(methods)) {
    permissions[actionName] = allowedMethods.includes(methodName);
  }
  return permissions;
}
function getUserPermissionCacheKey(action, resource, id) {
  const key = (typeof resource === 'object' ? [action, resource.kind, resource.name, resource.id] : [action, resource, id]).filter(Boolean).join('/');
  return key;
}

;// ./packages/core-data/build-module/selectors.js
/**
 * WordPress dependencies
 */




/**
 * Internal dependencies
 */







// This is an incomplete, high-level approximation of the State type.
// It makes the selectors slightly more safe, but is intended to evolve
// into a more detailed representation over time.
// See https://github.com/WordPress/gutenberg/pull/40025#discussion_r865410589 for more context.

/**
 * HTTP Query parameters sent with the API request to fetch the entity records.
 */

/**
 * Arguments for EntityRecord selectors.
 */

/**
 * Shared reference to an empty object for cases where it is important to avoid
 * returning a new object reference on every invocation, as in a connected or
 * other pure component which performs `shouldComponentUpdate` check on props.
 * This should be used as a last resort, since the normalized data should be
 * maintained by the reducer result in state.
 */
const EMPTY_OBJECT = {};

/**
 * Returns true if a request is in progress for embed preview data, or false
 * otherwise.
 *
 * @param state Data state.
 * @param url   URL the preview would be for.
 *
 * @return Whether a request is in progress for an embed preview.
 */
const isRequestingEmbedPreview = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, url) => {
  return select(STORE_NAME).isResolving('getEmbedPreview', [url]);
});

/**
 * Returns all available authors.
 *
 * @deprecated since 11.3. Callers should use `select( 'core' ).getUsers({ who: 'authors' })` instead.
 *
 * @param      state Data state.
 * @param      query Optional object of query parameters to
 *                   include with request. For valid query parameters see the [Users page](https://developer.wordpress.org/rest-api/reference/users/) in the REST API Handbook and see the arguments for [List Users](https://developer.wordpress.org/rest-api/reference/users/#list-users) and [Retrieve a User](https://developer.wordpress.org/rest-api/reference/users/#retrieve-a-user).
 * @return Authors list.
 */
function getAuthors(state, query) {
  external_wp_deprecated_default()("select( 'core' ).getAuthors()", {
    since: '5.9',
    alternative: "select( 'core' ).getUsers({ who: 'authors' })"
  });
  const path = (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/users/?who=authors&per_page=100', query);
  return getUserQueryResults(state, path);
}

/**
 * Returns the current user.
 *
 * @param state Data state.
 *
 * @return Current user object.
 */
function getCurrentUser(state) {
  return state.currentUser;
}

/**
 * Returns all the users returned by a query ID.
 *
 * @param state   Data state.
 * @param queryID Query ID.
 *
 * @return Users list.
 */
const getUserQueryResults = (0,external_wp_data_namespaceObject.createSelector)((state, queryID) => {
  var _state$users$queries$;
  const queryResults = (_state$users$queries$ = state.users.queries[queryID]) !== null && _state$users$queries$ !== void 0 ? _state$users$queries$ : [];
  return queryResults.map(id => state.users.byId[id]);
}, (state, queryID) => [state.users.queries[queryID], state.users.byId]);

/**
 * Returns the loaded entities for the given kind.
 *
 * @deprecated since WordPress 6.0. Use getEntitiesConfig instead
 * @param      state Data state.
 * @param      kind  Entity kind.
 *
 * @return Array of entities with config matching kind.
 */
function getEntitiesByKind(state, kind) {
  external_wp_deprecated_default()("wp.data.select( 'core' ).getEntitiesByKind()", {
    since: '6.0',
    alternative: "wp.data.select( 'core' ).getEntitiesConfig()"
  });
  return getEntitiesConfig(state, kind);
}

/**
 * Returns the loaded entities for the given kind.
 *
 * @param state Data state.
 * @param kind  Entity kind.
 *
 * @return Array of entities with config matching kind.
 */
const getEntitiesConfig = (0,external_wp_data_namespaceObject.createSelector)((state, kind) => state.entities.config.filter(entity => entity.kind === kind), /* eslint-disable @typescript-eslint/no-unused-vars */
(state, kind) => state.entities.config
/* eslint-enable @typescript-eslint/no-unused-vars */);
/**
 * Returns the entity config given its kind and name.
 *
 * @deprecated since WordPress 6.0. Use getEntityConfig instead
 * @param      state Data state.
 * @param      kind  Entity kind.
 * @param      name  Entity name.
 *
 * @return Entity config
 */
function getEntity(state, kind, name) {
  external_wp_deprecated_default()("wp.data.select( 'core' ).getEntity()", {
    since: '6.0',
    alternative: "wp.data.select( 'core' ).getEntityConfig()"
  });
  return getEntityConfig(state, kind, name);
}

/**
 * Returns the entity config given its kind and name.
 *
 * @param state Data state.
 * @param kind  Entity kind.
 * @param name  Entity name.
 *
 * @return Entity config
 */
function getEntityConfig(state, kind, name) {
  logEntityDeprecation(kind, name, 'getEntityConfig');
  return state.entities.config?.find(config => config.kind === kind && config.name === name);
}

/**
 * GetEntityRecord is declared as a *callable interface* with
 * two signatures to work around the fact that TypeScript doesn't
 * allow currying generic functions:
 *
 * ```ts
 * 		type CurriedState = F extends ( state: any, ...args: infer P ) => infer R
 * 			? ( ...args: P ) => R
 * 			: F;
 * 		type Selector = <K extends string | number>(
 *         state: any,
 *         kind: K,
 *         key: K extends string ? 'string value' : false
 *    ) => K;
 * 		type BadlyInferredSignature = CurriedState< Selector >
 *    // BadlyInferredSignature evaluates to:
 *    // (kind: string number, key: false | "string value") => string number
 * ```
 *
 * The signature without the state parameter shipped as CurriedSignature
 * is used in the return value of `select( coreStore )`.
 *
 * See https://github.com/WordPress/gutenberg/pull/41578 for more details.
 */

/**
 * Returns the Entity's record object by key. Returns `null` if the value is not
 * yet received, undefined if the value entity is known to not exist, or the
 * entity object if it exists and is received.
 *
 * @param state State tree
 * @param kind  Entity kind.
 * @param name  Entity name.
 * @param key   Optional record's key. If requesting a global record (e.g. site settings), the key can be omitted. If requesting a specific item, the key must always be included.
 * @param query Optional query. If requesting specific
 *              fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available "Retrieve a [Entity kind]".
 *
 * @return Record.
 */
const getEntityRecord = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, key, query) => {
  var _query$context, _getNormalizedCommaSe;
  logEntityDeprecation(kind, name, 'getEntityRecord');
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  if (!queriedState) {
    return undefined;
  }
  const context = (_query$context = query?.context) !== null && _query$context !== void 0 ? _query$context : 'default';
  if (!query || !query._fields) {
    // If expecting a complete item, validate that completeness.
    if (!queriedState.itemIsComplete[context]?.[key]) {
      return undefined;
    }
    return queriedState.items[context][key];
  }
  const item = queriedState.items[context]?.[key];
  if (!item) {
    return item;
  }
  const filteredItem = {};
  const fields = (_getNormalizedCommaSe = get_normalized_comma_separable(query._fields)) !== null && _getNormalizedCommaSe !== void 0 ? _getNormalizedCommaSe : [];
  for (let f = 0; f < fields.length; f++) {
    const field = fields[f].split('.');
    let value = item;
    field.forEach(fieldName => {
      value = value?.[fieldName];
    });
    setNestedValue(filteredItem, field, value);
  }
  return filteredItem;
}, (state, kind, name, recordId, query) => {
  var _query$context2;
  const context = (_query$context2 = query?.context) !== null && _query$context2 !== void 0 ? _query$context2 : 'default';
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  return [queriedState?.items[context]?.[recordId], queriedState?.itemIsComplete[context]?.[recordId]];
});

/**
 * Normalizes `recordKey`s that look like numeric IDs to numbers.
 *
 * @param args EntityRecordArgs the selector arguments.
 * @return EntityRecordArgs the normalized arguments.
 */
getEntityRecord.__unstableNormalizeArgs = args => {
  const newArgs = [...args];
  const recordKey = newArgs?.[2];

  // If recordKey looks to be a numeric ID then coerce to number.
  newArgs[2] = isNumericID(recordKey) ? Number(recordKey) : recordKey;
  return newArgs;
};

/**
 * Returns true if a record has been received for the given set of parameters, or false otherwise.
 *
 * Note: This action does not trigger a request for the entity record from the API
 * if it's not available in the local state.
 *
 * @param state State tree
 * @param kind  Entity kind.
 * @param name  Entity name.
 * @param key   Record's key.
 * @param query Optional query.
 *
 * @return Whether an entity record has been received.
 */
function hasEntityRecord(state, kind, name, key, query) {
  var _query$context3, _getNormalizedCommaSe2;
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  if (!queriedState) {
    return false;
  }
  const context = (_query$context3 = query?.context) !== null && _query$context3 !== void 0 ? _query$context3 : 'default';

  // If expecting a complete item, validate that completeness.
  if (!query || !query._fields) {
    return !!queriedState.itemIsComplete[context]?.[key];
  }
  const item = queriedState.items[context]?.[key];
  if (!item) {
    return false;
  }

  // When `query._fields` is provided, check that each requested field exists,
  // including any nested paths, on the item; return false if any part is missing.
  const fields = (_getNormalizedCommaSe2 = get_normalized_comma_separable(query._fields)) !== null && _getNormalizedCommaSe2 !== void 0 ? _getNormalizedCommaSe2 : [];
  for (let i = 0; i < fields.length; i++) {
    const path = fields[i].split('.');
    let value = item;
    for (let p = 0; p < path.length; p++) {
      const part = path[p];
      if (!value || !Object.hasOwn(value, part)) {
        return false;
      }
      value = value[part];
    }
  }
  return true;
}

/**
 * Returns the Entity's record object by key. Doesn't trigger a resolver nor requests the entity records from the API if the entity record isn't available in the local state.
 *
 * @param state State tree
 * @param kind  Entity kind.
 * @param name  Entity name.
 * @param key   Record's key
 *
 * @return Record.
 */
function __experimentalGetEntityRecordNoResolver(state, kind, name, key) {
  return getEntityRecord(state, kind, name, key);
}

/**
 * Returns the entity's record object by key,
 * with its attributes mapped to their raw values.
 *
 * @param state State tree.
 * @param kind  Entity kind.
 * @param name  Entity name.
 * @param key   Record's key.
 *
 * @return Object with the entity's raw attributes.
 */
const getRawEntityRecord = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, key) => {
  logEntityDeprecation(kind, name, 'getRawEntityRecord');
  const record = getEntityRecord(state, kind, name, key);
  return record && Object.keys(record).reduce((accumulator, _key) => {
    if (isRawAttribute(getEntityConfig(state, kind, name), _key)) {
      // Because edits are the "raw" attribute values,
      // we return those from record selectors to make rendering,
      // comparisons, and joins with edits easier.
      accumulator[_key] = record[_key]?.raw !== undefined ? record[_key]?.raw : record[_key];
    } else {
      accumulator[_key] = record[_key];
    }
    return accumulator;
  }, {});
}, (state, kind, name, recordId, query) => {
  var _query$context4;
  const context = (_query$context4 = query?.context) !== null && _query$context4 !== void 0 ? _query$context4 : 'default';
  return [state.entities.config, state.entities.records?.[kind]?.[name]?.queriedData?.items[context]?.[recordId], state.entities.records?.[kind]?.[name]?.queriedData?.itemIsComplete[context]?.[recordId]];
});

/**
 * Returns true if records have been received for the given set of parameters,
 * or false otherwise.
 *
 * @param state State tree
 * @param kind  Entity kind.
 * @param name  Entity name.
 * @param query Optional terms query. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for "List [Entity kind]s".
 *
 * @return  Whether entity records have been received.
 */
function hasEntityRecords(state, kind, name, query) {
  logEntityDeprecation(kind, name, 'hasEntityRecords');
  return Array.isArray(getEntityRecords(state, kind, name, query));
}

/**
 * GetEntityRecord is declared as a *callable interface* with
 * two signatures to work around the fact that TypeScript doesn't
 * allow currying generic functions.
 *
 * @see GetEntityRecord
 * @see https://github.com/WordPress/gutenberg/pull/41578
 */

/**
 * Returns the Entity's records.
 *
 * @param state State tree
 * @param kind  Entity kind.
 * @param name  Entity name.
 * @param query Optional terms query. If requesting specific
 *              fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for "List [Entity kind]s".
 *
 * @return Records.
 */
const getEntityRecords = (state, kind, name, query) => {
  logEntityDeprecation(kind, name, 'getEntityRecords');

  // Queried data state is prepopulated for all known entities. If this is not
  // assigned for the given parameters, then it is known to not exist.
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  if (!queriedState) {
    return null;
  }
  return getQueriedItems(queriedState, query);
};

/**
 * Returns the Entity's total available records for a given query (ignoring pagination).
 *
 * @param state State tree
 * @param kind  Entity kind.
 * @param name  Entity name.
 * @param query Optional terms query. If requesting specific
 *              fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for "List [Entity kind]s".
 *
 * @return number | null.
 */
const getEntityRecordsTotalItems = (state, kind, name, query) => {
  logEntityDeprecation(kind, name, 'getEntityRecordsTotalItems');

  // Queried data state is prepopulated for all known entities. If this is not
  // assigned for the given parameters, then it is known to not exist.
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  if (!queriedState) {
    return null;
  }
  return getQueriedTotalItems(queriedState, query);
};

/**
 * Returns the number of available pages for the given query.
 *
 * @param state State tree
 * @param kind  Entity kind.
 * @param name  Entity name.
 * @param query Optional terms query. If requesting specific
 *              fields, fields must always include the ID. For valid query parameters see the [Reference](https://developer.wordpress.org/rest-api/reference/) in the REST API Handbook and select the entity kind. Then see the arguments available for "List [Entity kind]s".
 *
 * @return number | null.
 */
const getEntityRecordsTotalPages = (state, kind, name, query) => {
  logEntityDeprecation(kind, name, 'getEntityRecordsTotalPages');

  // Queried data state is prepopulated for all known entities. If this is not
  // assigned for the given parameters, then it is known to not exist.
  const queriedState = state.entities.records?.[kind]?.[name]?.queriedData;
  if (!queriedState) {
    return null;
  }
  if (query?.per_page === -1) {
    return 1;
  }
  const totalItems = getQueriedTotalItems(queriedState, query);
  if (!totalItems) {
    return totalItems;
  }
  // If `per_page` is not set and the query relies on the defaults of the
  // REST endpoint, get the info from query's meta.
  if (!query?.per_page) {
    return getQueriedTotalPages(queriedState, query);
  }
  return Math.ceil(totalItems / query.per_page);
};
/**
 * Returns the list of dirty entity records.
 *
 * @param state State tree.
 *
 * @return The list of updated records
 */
const __experimentalGetDirtyEntityRecords = (0,external_wp_data_namespaceObject.createSelector)(state => {
  const {
    entities: {
      records
    }
  } = state;
  const dirtyRecords = [];
  Object.keys(records).forEach(kind => {
    Object.keys(records[kind]).forEach(name => {
      const primaryKeys = Object.keys(records[kind][name].edits).filter(primaryKey =>
      // The entity record must exist (not be deleted),
      // and it must have edits.
      getEntityRecord(state, kind, name, primaryKey) && hasEditsForEntityRecord(state, kind, name, primaryKey));
      if (primaryKeys.length) {
        const entityConfig = getEntityConfig(state, kind, name);
        primaryKeys.forEach(primaryKey => {
          const entityRecord = getEditedEntityRecord(state, kind, name, primaryKey);
          dirtyRecords.push({
            // We avoid using primaryKey because it's transformed into a string
            // when it's used as an object key.
            key: entityRecord ? entityRecord[entityConfig.key || DEFAULT_ENTITY_KEY] : undefined,
            title: entityConfig?.getTitle?.(entityRecord) || '',
            name,
            kind
          });
        });
      }
    });
  });
  return dirtyRecords;
}, state => [state.entities.records]);

/**
 * Returns the list of entities currently being saved.
 *
 * @param state State tree.
 *
 * @return The list of records being saved.
 */
const __experimentalGetEntitiesBeingSaved = (0,external_wp_data_namespaceObject.createSelector)(state => {
  const {
    entities: {
      records
    }
  } = state;
  const recordsBeingSaved = [];
  Object.keys(records).forEach(kind => {
    Object.keys(records[kind]).forEach(name => {
      const primaryKeys = Object.keys(records[kind][name].saving).filter(primaryKey => isSavingEntityRecord(state, kind, name, primaryKey));
      if (primaryKeys.length) {
        const entityConfig = getEntityConfig(state, kind, name);
        primaryKeys.forEach(primaryKey => {
          const entityRecord = getEditedEntityRecord(state, kind, name, primaryKey);
          recordsBeingSaved.push({
            // We avoid using primaryKey because it's transformed into a string
            // when it's used as an object key.
            key: entityRecord ? entityRecord[entityConfig.key || DEFAULT_ENTITY_KEY] : undefined,
            title: entityConfig?.getTitle?.(entityRecord) || '',
            name,
            kind
          });
        });
      }
    });
  });
  return recordsBeingSaved;
}, state => [state.entities.records]);

/**
 * Returns the specified entity record's edits.
 *
 * @param state    State tree.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record ID.
 *
 * @return The entity record's edits.
 */
function getEntityRecordEdits(state, kind, name, recordId) {
  logEntityDeprecation(kind, name, 'getEntityRecordEdits');
  return state.entities.records?.[kind]?.[name]?.edits?.[recordId];
}

/**
 * Returns the specified entity record's non transient edits.
 *
 * Transient edits don't create an undo level, and
 * are not considered for change detection.
 * They are defined in the entity's config.
 *
 * @param state    State tree.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record ID.
 *
 * @return The entity record's non transient edits.
 */
const getEntityRecordNonTransientEdits = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, recordId) => {
  logEntityDeprecation(kind, name, 'getEntityRecordNonTransientEdits');
  const {
    transientEdits
  } = getEntityConfig(state, kind, name) || {};
  const edits = getEntityRecordEdits(state, kind, name, recordId) || {};
  if (!transientEdits) {
    return edits;
  }
  return Object.keys(edits).reduce((acc, key) => {
    if (!transientEdits[key]) {
      acc[key] = edits[key];
    }
    return acc;
  }, {});
}, (state, kind, name, recordId) => [state.entities.config, state.entities.records?.[kind]?.[name]?.edits?.[recordId]]);

/**
 * Returns true if the specified entity record has edits,
 * and false otherwise.
 *
 * @param state    State tree.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record ID.
 *
 * @return Whether the entity record has edits or not.
 */
function hasEditsForEntityRecord(state, kind, name, recordId) {
  logEntityDeprecation(kind, name, 'hasEditsForEntityRecord');
  return isSavingEntityRecord(state, kind, name, recordId) || Object.keys(getEntityRecordNonTransientEdits(state, kind, name, recordId)).length > 0;
}

/**
 * Returns the specified entity record, merged with its edits.
 *
 * @param state    State tree.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record ID.
 *
 * @return The entity record, merged with its edits.
 */
const getEditedEntityRecord = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, recordId) => {
  logEntityDeprecation(kind, name, 'getEditedEntityRecord');
  const raw = getRawEntityRecord(state, kind, name, recordId);
  const edited = getEntityRecordEdits(state, kind, name, recordId);
  // Never return a non-falsy empty object. Unfortunately we can't return
  // undefined or null because we were previously returning an empty
  // object, so trying to read properties from the result would throw.
  // Using false here is a workaround to avoid breaking changes.
  if (!raw && !edited) {
    return false;
  }
  return {
    ...raw,
    ...edited
  };
}, (state, kind, name, recordId, query) => {
  var _query$context5;
  const context = (_query$context5 = query?.context) !== null && _query$context5 !== void 0 ? _query$context5 : 'default';
  return [state.entities.config, state.entities.records?.[kind]?.[name]?.queriedData.items[context]?.[recordId], state.entities.records?.[kind]?.[name]?.queriedData.itemIsComplete[context]?.[recordId], state.entities.records?.[kind]?.[name]?.edits?.[recordId]];
});

/**
 * Returns true if the specified entity record is autosaving, and false otherwise.
 *
 * @param state    State tree.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record ID.
 *
 * @return Whether the entity record is autosaving or not.
 */
function isAutosavingEntityRecord(state, kind, name, recordId) {
  var _state$entities$recor;
  logEntityDeprecation(kind, name, 'isAutosavingEntityRecord');
  const {
    pending,
    isAutosave
  } = (_state$entities$recor = state.entities.records?.[kind]?.[name]?.saving?.[recordId]) !== null && _state$entities$recor !== void 0 ? _state$entities$recor : {};
  return Boolean(pending && isAutosave);
}

/**
 * Returns true if the specified entity record is saving, and false otherwise.
 *
 * @param state    State tree.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record ID.
 *
 * @return Whether the entity record is saving or not.
 */
function isSavingEntityRecord(state, kind, name, recordId) {
  var _state$entities$recor2;
  logEntityDeprecation(kind, name, 'isSavingEntityRecord');
  return (_state$entities$recor2 = state.entities.records?.[kind]?.[name]?.saving?.[recordId]?.pending) !== null && _state$entities$recor2 !== void 0 ? _state$entities$recor2 : false;
}

/**
 * Returns true if the specified entity record is deleting, and false otherwise.
 *
 * @param state    State tree.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record ID.
 *
 * @return Whether the entity record is deleting or not.
 */
function isDeletingEntityRecord(state, kind, name, recordId) {
  var _state$entities$recor3;
  logEntityDeprecation(kind, name, 'isDeletingEntityRecord');
  return (_state$entities$recor3 = state.entities.records?.[kind]?.[name]?.deleting?.[recordId]?.pending) !== null && _state$entities$recor3 !== void 0 ? _state$entities$recor3 : false;
}

/**
 * Returns the specified entity record's last save error.
 *
 * @param state    State tree.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record ID.
 *
 * @return The entity record's save error.
 */
function getLastEntitySaveError(state, kind, name, recordId) {
  logEntityDeprecation(kind, name, 'getLastEntitySaveError');
  return state.entities.records?.[kind]?.[name]?.saving?.[recordId]?.error;
}

/**
 * Returns the specified entity record's last delete error.
 *
 * @param state    State tree.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record ID.
 *
 * @return The entity record's save error.
 */
function getLastEntityDeleteError(state, kind, name, recordId) {
  logEntityDeprecation(kind, name, 'getLastEntityDeleteError');
  return state.entities.records?.[kind]?.[name]?.deleting?.[recordId]?.error;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Returns the previous edit from the current undo offset
 * for the entity records edits history, if any.
 *
 * @deprecated since 6.3
 *
 * @param      state State tree.
 *
 * @return The edit.
 */
function getUndoEdit(state) {
  external_wp_deprecated_default()("select( 'core' ).getUndoEdit()", {
    since: '6.3'
  });
  return undefined;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Returns the next edit from the current undo offset
 * for the entity records edits history, if any.
 *
 * @deprecated since 6.3
 *
 * @param      state State tree.
 *
 * @return The edit.
 */
function getRedoEdit(state) {
  external_wp_deprecated_default()("select( 'core' ).getRedoEdit()", {
    since: '6.3'
  });
  return undefined;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Returns true if there is a previous edit from the current undo offset
 * for the entity records edits history, and false otherwise.
 *
 * @param state State tree.
 *
 * @return Whether there is a previous edit or not.
 */
function hasUndo(state) {
  return getUndoManager(state).hasUndo();
}

/**
 * Returns true if there is a next edit from the current undo offset
 * for the entity records edits history, and false otherwise.
 *
 * @param state State tree.
 *
 * @return Whether there is a next edit or not.
 */
function hasRedo(state) {
  return getUndoManager(state).hasRedo();
}

/**
 * Return the current theme.
 *
 * @param state Data state.
 *
 * @return The current theme.
 */
function getCurrentTheme(state) {
  if (!state.currentTheme) {
    return null;
  }
  return getEntityRecord(state, 'root', 'theme', state.currentTheme);
}

/**
 * Return the ID of the current global styles object.
 *
 * @param state Data state.
 *
 * @return The current global styles ID.
 */
function __experimentalGetCurrentGlobalStylesId(state) {
  return state.currentGlobalStylesId;
}

/**
 * Return theme supports data in the index.
 *
 * @param state Data state.
 *
 * @return Index data.
 */
function getThemeSupports(state) {
  var _getCurrentTheme$them;
  return (_getCurrentTheme$them = getCurrentTheme(state)?.theme_supports) !== null && _getCurrentTheme$them !== void 0 ? _getCurrentTheme$them : EMPTY_OBJECT;
}

/**
 * Returns the embed preview for the given URL.
 *
 * @param state Data state.
 * @param url   Embedded URL.
 *
 * @return Undefined if the preview has not been fetched, otherwise, the preview fetched from the embed preview API.
 */
function getEmbedPreview(state, url) {
  return state.embedPreviews[url];
}

/**
 * Determines if the returned preview is an oEmbed link fallback.
 *
 * WordPress can be configured to return a simple link to a URL if it is not embeddable.
 * We need to be able to determine if a URL is embeddable or not, based on what we
 * get back from the oEmbed preview API.
 *
 * @param state Data state.
 * @param url   Embedded URL.
 *
 * @return Is the preview for the URL an oEmbed link fallback.
 */
function isPreviewEmbedFallback(state, url) {
  const preview = state.embedPreviews[url];
  const oEmbedLinkCheck = '<a href="' + url + '">' + url + '</a>';
  if (!preview) {
    return false;
  }
  return preview.html === oEmbedLinkCheck;
}

/**
 * Returns whether the current user can perform the given action on the given
 * REST resource.
 *
 * Calling this may trigger an OPTIONS request to the REST API via the
 * `canUser()` resolver.
 *
 * https://developer.wordpress.org/rest-api/reference/
 *
 * @param state    Data state.
 * @param action   Action to check. One of: 'create', 'read', 'update', 'delete'.
 * @param resource Entity resource to check. Accepts entity object `{ kind: 'postType', name: 'attachment', id: 1 }`
 *                 or REST base as a string - `media`.
 * @param id       Optional ID of the rest resource to check.
 *
 * @return Whether or not the user can perform the action,
 *                             or `undefined` if the OPTIONS request is still being made.
 */
function canUser(state, action, resource, id) {
  const isEntity = typeof resource === 'object';
  if (isEntity && (!resource.kind || !resource.name)) {
    return false;
  }
  if (isEntity) {
    logEntityDeprecation(resource.kind, resource.name, 'canUser');
  }
  const key = getUserPermissionCacheKey(action, resource, id);
  return state.userPermissions[key];
}

/**
 * Returns whether the current user can edit the given entity.
 *
 * Calling this may trigger an OPTIONS request to the REST API via the
 * `canUser()` resolver.
 *
 * https://developer.wordpress.org/rest-api/reference/
 *
 * @param state    Data state.
 * @param kind     Entity kind.
 * @param name     Entity name.
 * @param recordId Record's id.
 * @return Whether or not the user can edit,
 * or `undefined` if the OPTIONS request is still being made.
 */
function canUserEditEntityRecord(state, kind, name, recordId) {
  external_wp_deprecated_default()(`wp.data.select( 'core' ).canUserEditEntityRecord()`, {
    since: '6.7',
    alternative: `wp.data.select( 'core' ).canUser( 'update', { kind, name, id } )`
  });
  return canUser(state, 'update', {
    kind,
    name,
    id: recordId
  });
}

/**
 * Returns the latest autosaves for the post.
 *
 * May return multiple autosaves since the backend stores one autosave per
 * author for each post.
 *
 * @param state    State tree.
 * @param postType The type of the parent post.
 * @param postId   The id of the parent post.
 *
 * @return An array of autosaves for the post, or undefined if there is none.
 */
function getAutosaves(state, postType, postId) {
  return state.autosaves[postId];
}

/**
 * Returns the autosave for the post and author.
 *
 * @param state    State tree.
 * @param postType The type of the parent post.
 * @param postId   The id of the parent post.
 * @param authorId The id of the author.
 *
 * @return The autosave for the post and author.
 */
function getAutosave(state, postType, postId, authorId) {
  if (authorId === undefined) {
    return;
  }
  const autosaves = state.autosaves[postId];
  return autosaves?.find(autosave => autosave.author === authorId);
}

/**
 * Returns true if the REST request for autosaves has completed.
 *
 * @param state    State tree.
 * @param postType The type of the parent post.
 * @param postId   The id of the parent post.
 *
 * @return True if the REST request was completed. False otherwise.
 */
const hasFetchedAutosaves = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, postType, postId) => {
  return select(STORE_NAME).hasFinishedResolution('getAutosaves', [postType, postId]);
});

/**
 * Returns a new reference when edited values have changed. This is useful in
 * inferring where an edit has been made between states by comparison of the
 * return values using strict equality.
 *
 * @example
 *
 * ```
 * const hasEditOccurred = (
 *    getReferenceByDistinctEdits( beforeState ) !==
 *    getReferenceByDistinctEdits( afterState )
 * );
 * ```
 *
 * @param state Editor state.
 *
 * @return A value whose reference will change only when an edit occurs.
 */
function getReferenceByDistinctEdits(state) {
  return state.editsReference;
}

/**
 * Retrieve the current theme's base global styles
 *
 * @param state Editor state.
 *
 * @return The Global Styles object.
 */
function __experimentalGetCurrentThemeBaseGlobalStyles(state) {
  const currentTheme = getCurrentTheme(state);
  if (!currentTheme) {
    return null;
  }
  return state.themeBaseGlobalStyles[currentTheme.stylesheet];
}

/**
 * Return the ID of the current global styles object.
 *
 * @param state Data state.
 *
 * @return The current global styles ID.
 */
function __experimentalGetCurrentThemeGlobalStylesVariations(state) {
  const currentTheme = getCurrentTheme(state);
  if (!currentTheme) {
    return null;
  }
  return state.themeGlobalStyleVariations[currentTheme.stylesheet];
}

/**
 * Retrieve the list of registered block patterns.
 *
 * @param state Data state.
 *
 * @return Block pattern list.
 */
function getBlockPatterns(state) {
  return state.blockPatterns;
}

/**
 * Retrieve the list of registered block pattern categories.
 *
 * @param state Data state.
 *
 * @return Block pattern category list.
 */
function getBlockPatternCategories(state) {
  return state.blockPatternCategories;
}

/**
 * Retrieve the registered user pattern categories.
 *
 * @param state Data state.
 *
 * @return User patterns category array.
 */

function getUserPatternCategories(state) {
  return state.userPatternCategories;
}

/**
 * Returns the revisions of the current global styles theme.
 *
 * @deprecated since WordPress 6.5.0. Callers should use `select( 'core' ).getRevisions( 'root', 'globalStyles', ${ recordKey } )` instead, where `recordKey` is the id of the global styles parent post.
 *
 * @param      state Data state.
 *
 * @return The current global styles.
 */
function getCurrentThemeGlobalStylesRevisions(state) {
  external_wp_deprecated_default()("select( 'core' ).getCurrentThemeGlobalStylesRevisions()", {
    since: '6.5.0',
    alternative: "select( 'core' ).getRevisions( 'root', 'globalStyles', ${ recordKey } )"
  });
  const currentGlobalStylesId = __experimentalGetCurrentGlobalStylesId(state);
  if (!currentGlobalStylesId) {
    return null;
  }
  return state.themeGlobalStyleRevisions[currentGlobalStylesId];
}

/**
 * Returns the default template use to render a given query.
 *
 * @param state Data state.
 * @param query Query.
 *
 * @return The default template id for the given query.
 */
function getDefaultTemplateId(state, query) {
  return state.defaultTemplates[JSON.stringify(query)];
}

/**
 * Returns an entity's revisions.
 *
 * @param state     State tree
 * @param kind      Entity kind.
 * @param name      Entity name.
 * @param recordKey The key of the entity record whose revisions you want to fetch.
 * @param query     Optional query. If requesting specific
 *                  fields, fields must always include the ID. For valid query parameters see revisions schema in [the REST API Handbook](https://developer.wordpress.org/rest-api/reference/). Then see the arguments available "Retrieve a [Entity kind]".
 *
 * @return Record.
 */
const getRevisions = (state, kind, name, recordKey, query) => {
  logEntityDeprecation(kind, name, 'getRevisions');
  const queriedStateRevisions = state.entities.records?.[kind]?.[name]?.revisions?.[recordKey];
  if (!queriedStateRevisions) {
    return null;
  }
  return getQueriedItems(queriedStateRevisions, query);
};

/**
 * Returns a single, specific revision of a parent entity.
 *
 * @param state       State tree
 * @param kind        Entity kind.
 * @param name        Entity name.
 * @param recordKey   The key of the entity record whose revisions you want to fetch.
 * @param revisionKey The revision's key.
 * @param query       Optional query. If requesting specific
 *                    fields, fields must always include the ID. For valid query parameters see revisions schema in [the REST API Handbook](https://developer.wordpress.org/rest-api/reference/). Then see the arguments available "Retrieve a [entity kind]".
 *
 * @return Record.
 */
const getRevision = (0,external_wp_data_namespaceObject.createSelector)((state, kind, name, recordKey, revisionKey, query) => {
  var _query$context6, _getNormalizedCommaSe3;
  logEntityDeprecation(kind, name, 'getRevision');
  const queriedState = state.entities.records?.[kind]?.[name]?.revisions?.[recordKey];
  if (!queriedState) {
    return undefined;
  }
  const context = (_query$context6 = query?.context) !== null && _query$context6 !== void 0 ? _query$context6 : 'default';
  if (!query || !query._fields) {
    // If expecting a complete item, validate that completeness.
    if (!queriedState.itemIsComplete[context]?.[revisionKey]) {
      return undefined;
    }
    return queriedState.items[context][revisionKey];
  }
  const item = queriedState.items[context]?.[revisionKey];
  if (!item) {
    return item;
  }
  const filteredItem = {};
  const fields = (_getNormalizedCommaSe3 = get_normalized_comma_separable(query._fields)) !== null && _getNormalizedCommaSe3 !== void 0 ? _getNormalizedCommaSe3 : [];
  for (let f = 0; f < fields.length; f++) {
    const field = fields[f].split('.');
    let value = item;
    field.forEach(fieldName => {
      value = value?.[fieldName];
    });
    setNestedValue(filteredItem, field, value);
  }
  return filteredItem;
}, (state, kind, name, recordKey, revisionKey, query) => {
  var _query$context7;
  const context = (_query$context7 = query?.context) !== null && _query$context7 !== void 0 ? _query$context7 : 'default';
  const queriedState = state.entities.records?.[kind]?.[name]?.revisions?.[recordKey];
  return [queriedState?.items?.[context]?.[revisionKey], queriedState?.itemIsComplete?.[context]?.[revisionKey]];
});

;// ./packages/core-data/build-module/utils/get-nested-value.js
/**
 * Helper util to return a value from a certain path of the object.
 * Path is specified as either:
 * - a string of properties, separated by dots, for example: "x.y".
 * - an array of properties, for example `[ 'x', 'y' ]`.
 * You can also specify a default value in case the result is nullish.
 *
 * @param {Object}       object       Input object.
 * @param {string|Array} path         Path to the object property.
 * @param {*}            defaultValue Default value if the value at the specified path is undefined.
 * @return {*} Value of the object property at the specified path.
 */
function getNestedValue(object, path, defaultValue) {
  if (!object || typeof object !== 'object' || typeof path !== 'string' && !Array.isArray(path)) {
    return object;
  }
  const normalizedPath = Array.isArray(path) ? path : path.split('.');
  let value = object;
  normalizedPath.forEach(fieldName => {
    value = value?.[fieldName];
  });
  return value !== undefined ? value : defaultValue;
}

;// ./packages/core-data/build-module/queried-data/actions.js
/**
 * Returns an action object used in signalling that items have been received.
 *
 * @param {Array}   items Items received.
 * @param {?Object} edits Optional edits to reset.
 * @param {?Object} meta  Meta information about pagination.
 *
 * @return {Object} Action object.
 */
function receiveItems(items, edits, meta) {
  return {
    type: 'RECEIVE_ITEMS',
    items: Array.isArray(items) ? items : [items],
    persistedEdits: edits,
    meta
  };
}

/**
 * Returns an action object used in signalling that entity records have been
 * deleted and they need to be removed from entities state.
 *
 * @param {string}              kind            Kind of the removed entities.
 * @param {string}              name            Name of the removed entities.
 * @param {Array|number|string} records         Record IDs of the removed entities.
 * @param {boolean}             invalidateCache Controls whether we want to invalidate the cache.
 * @return {Object} Action object.
 */
function removeItems(kind, name, records, invalidateCache = false) {
  return {
    type: 'REMOVE_ITEMS',
    itemIds: Array.isArray(records) ? records : [records],
    kind,
    name,
    invalidateCache
  };
}

/**
 * Returns an action object used in signalling that queried data has been
 * received.
 *
 * @param {Array}   items Queried items received.
 * @param {?Object} query Optional query object.
 * @param {?Object} edits Optional edits to reset.
 * @param {?Object} meta  Meta information about pagination.
 *
 * @return {Object} Action object.
 */
function receiveQueriedItems(items, query = {}, edits, meta) {
  return {
    ...receiveItems(items, edits, meta),
    query
  };
}

;// ./packages/core-data/build-module/batch/default-processor.js
/**
 * WordPress dependencies
 */


/**
 * Maximum number of requests to place in a single batch request. Obtained by
 * sending a preflight OPTIONS request to /batch/v1/.
 *
 * @type {number?}
 */
let maxItems = null;
function chunk(arr, chunkSize) {
  const tmp = [...arr];
  const cache = [];
  while (tmp.length) {
    cache.push(tmp.splice(0, chunkSize));
  }
  return cache;
}

/**
 * Default batch processor. Sends its input requests to /batch/v1.
 *
 * @param {Array} requests List of API requests to perform at once.
 *
 * @return {Promise} Promise that resolves to a list of objects containing
 *                   either `output` (if that request was successful) or `error`
 *                   (if not ).
 */
async function defaultProcessor(requests) {
  if (maxItems === null) {
    const preflightResponse = await external_wp_apiFetch_default()({
      path: '/batch/v1',
      method: 'OPTIONS'
    });
    maxItems = preflightResponse.endpoints[0].args.requests.maxItems;
  }
  const results = [];

  // @ts-ignore We would have crashed or never gotten to this point if we hadn't received the maxItems count.
  for (const batchRequests of chunk(requests, maxItems)) {
    const batchResponse = await external_wp_apiFetch_default()({
      path: '/batch/v1',
      method: 'POST',
      data: {
        validation: 'require-all-validate',
        requests: batchRequests.map(request => ({
          path: request.path,
          body: request.data,
          // Rename 'data' to 'body'.
          method: request.method,
          headers: request.headers
        }))
      }
    });
    let batchResults;
    if (batchResponse.failed) {
      batchResults = batchResponse.responses.map(response => ({
        error: response?.body
      }));
    } else {
      batchResults = batchResponse.responses.map(response => {
        const result = {};
        if (response.status >= 200 && response.status < 300) {
          result.output = response.body;
        } else {
          result.error = response.body;
        }
        return result;
      });
    }
    results.push(...batchResults);
  }
  return results;
}

;// ./packages/core-data/build-module/batch/create-batch.js
/**
 * Internal dependencies
 */


/**
 * Creates a batch, which can be used to combine multiple API requests into one
 * API request using the WordPress batch processing API (/v1/batch).
 *
 * ```
 * const batch = createBatch();
 * const dunePromise = batch.add( {
 *   path: '/v1/books',
 *   method: 'POST',
 *   data: { title: 'Dune' }
 * } );
 * const lotrPromise = batch.add( {
 *   path: '/v1/books',
 *   method: 'POST',
 *   data: { title: 'Lord of the Rings' }
 * } );
 * const isSuccess = await batch.run(); // Sends one POST to /v1/batch.
 * if ( isSuccess ) {
 *   console.log(
 *     'Saved two books:',
 *     await dunePromise,
 *     await lotrPromise
 *   );
 * }
 * ```
 *
 * @param {Function} [processor] Processor function. Can be used to replace the
 *                               default functionality which is to send an API
 *                               request to /v1/batch. Is given an array of
 *                               inputs and must return a promise that
 *                               resolves to an array of objects containing
 *                               either `output` or `error`.
 */
function createBatch(processor = defaultProcessor) {
  let lastId = 0;
  /** @type {Array<{ input: any; resolve: ( value: any ) => void; reject: ( error: any ) => void }>} */
  let queue = [];
  const pending = new ObservableSet();
  return {
    /**
     * Adds an input to the batch and returns a promise that is resolved or
     * rejected when the input is processed by `batch.run()`.
     *
     * You may also pass a thunk which allows inputs to be added
     * asynchronously.
     *
     * ```
     * // Both are allowed:
     * batch.add( { path: '/v1/books', ... } );
     * batch.add( ( add ) => add( { path: '/v1/books', ... } ) );
     * ```
     *
     * If a thunk is passed, `batch.run()` will pause until either:
     *
     * - The thunk calls its `add` argument, or;
     * - The thunk returns a promise and that promise resolves, or;
     * - The thunk returns a non-promise.
     *
     * @param {any|Function} inputOrThunk Input to add or thunk to execute.
     *
     * @return {Promise|any} If given an input, returns a promise that
     *                       is resolved or rejected when the batch is
     *                       processed. If given a thunk, returns the return
     *                       value of that thunk.
     */
    add(inputOrThunk) {
      const id = ++lastId;
      pending.add(id);
      const add = input => new Promise((resolve, reject) => {
        queue.push({
          input,
          resolve,
          reject
        });
        pending.delete(id);
      });
      if (typeof inputOrThunk === 'function') {
        return Promise.resolve(inputOrThunk(add)).finally(() => {
          pending.delete(id);
        });
      }
      return add(inputOrThunk);
    },
    /**
     * Runs the batch. This calls `batchProcessor` and resolves or rejects
     * all promises returned by `add()`.
     *
     * @return {Promise<boolean>} A promise that resolves to a boolean that is true
     *                   if the processor returned no errors.
     */
    async run() {
      if (pending.size) {
        await new Promise(resolve => {
          const unsubscribe = pending.subscribe(() => {
            if (!pending.size) {
              unsubscribe();
              resolve(undefined);
            }
          });
        });
      }
      let results;
      try {
        results = await processor(queue.map(({
          input
        }) => input));
        if (results.length !== queue.length) {
          throw new Error('run: Array returned by processor must be same size as input array.');
        }
      } catch (error) {
        for (const {
          reject
        } of queue) {
          reject(error);
        }
        throw error;
      }
      let isSuccess = true;
      results.forEach((result, key) => {
        const queueItem = queue[key];
        if (result?.error) {
          queueItem?.reject(result.error);
          isSuccess = false;
        } else {
          var _result$output;
          queueItem?.resolve((_result$output = result?.output) !== null && _result$output !== void 0 ? _result$output : result);
        }
      });
      queue = [];
      return isSuccess;
    }
  };
}
class ObservableSet {
  constructor(...args) {
    this.set = new Set(...args);
    this.subscribers = new Set();
  }
  get size() {
    return this.set.size;
  }
  add(value) {
    this.set.add(value);
    this.subscribers.forEach(subscriber => subscriber());
    return this;
  }
  delete(value) {
    const isSuccess = this.set.delete(value);
    this.subscribers.forEach(subscriber => subscriber());
    return isSuccess;
  }
  subscribe(subscriber) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }
}

;// ./packages/core-data/build-module/actions.js
/**
 * External dependencies
 */



/**
 * WordPress dependencies
 */




/**
 * Internal dependencies
 */








/**
 * Returns an action object used in signalling that authors have been received.
 * Ignored from documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {string}       queryID Query ID.
 * @param {Array|Object} users   Users received.
 *
 * @return {Object} Action object.
 */
function receiveUserQuery(queryID, users) {
  return {
    type: 'RECEIVE_USER_QUERY',
    users: Array.isArray(users) ? users : [users],
    queryID
  };
}

/**
 * Returns an action used in signalling that the current user has been received.
 * Ignored from documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {Object} currentUser Current user object.
 *
 * @return {Object} Action object.
 */
function receiveCurrentUser(currentUser) {
  return {
    type: 'RECEIVE_CURRENT_USER',
    currentUser
  };
}

/**
 * Returns an action object used in adding new entities.
 *
 * @param {Array} entities Entities received.
 *
 * @return {Object} Action object.
 */
function addEntities(entities) {
  return {
    type: 'ADD_ENTITIES',
    entities
  };
}

/**
 * Returns an action object used in signalling that entity records have been received.
 *
 * @param {string}       kind            Kind of the received entity record.
 * @param {string}       name            Name of the received entity record.
 * @param {Array|Object} records         Records received.
 * @param {?Object}      query           Query Object.
 * @param {?boolean}     invalidateCache Should invalidate query caches.
 * @param {?Object}      edits           Edits to reset.
 * @param {?Object}      meta            Meta information about pagination.
 * @return {Object} Action object.
 */
function receiveEntityRecords(kind, name, records, query, invalidateCache = false, edits, meta) {
  // Auto drafts should not have titles, but some plugins rely on them so we can't filter this
  // on the server.
  if (kind === 'postType') {
    records = (Array.isArray(records) ? records : [records]).map(record => record.status === 'auto-draft' ? {
      ...record,
      title: ''
    } : record);
  }
  let action;
  if (query) {
    action = receiveQueriedItems(records, query, edits, meta);
  } else {
    action = receiveItems(records, edits, meta);
  }
  return {
    ...action,
    kind,
    name,
    invalidateCache
  };
}

/**
 * Returns an action object used in signalling that the current theme has been received.
 * Ignored from documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {Object} currentTheme The current theme.
 *
 * @return {Object} Action object.
 */
function receiveCurrentTheme(currentTheme) {
  return {
    type: 'RECEIVE_CURRENT_THEME',
    currentTheme
  };
}

/**
 * Returns an action object used in signalling that the current global styles id has been received.
 * Ignored from documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {string} currentGlobalStylesId The current global styles id.
 *
 * @return {Object} Action object.
 */
function __experimentalReceiveCurrentGlobalStylesId(currentGlobalStylesId) {
  return {
    type: 'RECEIVE_CURRENT_GLOBAL_STYLES_ID',
    id: currentGlobalStylesId
  };
}

/**
 * Returns an action object used in signalling that the theme base global styles have been received
 * Ignored from documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {string} stylesheet   The theme's identifier
 * @param {Object} globalStyles The global styles object.
 *
 * @return {Object} Action object.
 */
function __experimentalReceiveThemeBaseGlobalStyles(stylesheet, globalStyles) {
  return {
    type: 'RECEIVE_THEME_GLOBAL_STYLES',
    stylesheet,
    globalStyles
  };
}

/**
 * Returns an action object used in signalling that the theme global styles variations have been received.
 * Ignored from documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {string} stylesheet The theme's identifier
 * @param {Array}  variations The global styles variations.
 *
 * @return {Object} Action object.
 */
function __experimentalReceiveThemeGlobalStyleVariations(stylesheet, variations) {
  return {
    type: 'RECEIVE_THEME_GLOBAL_STYLE_VARIATIONS',
    stylesheet,
    variations
  };
}

/**
 * Returns an action object used in signalling that the index has been received.
 *
 * @deprecated since WP 5.9, this is not useful anymore, use the selector directly.
 *
 * @return {Object} Action object.
 */
function receiveThemeSupports() {
  external_wp_deprecated_default()("wp.data.dispatch( 'core' ).receiveThemeSupports", {
    since: '5.9'
  });
  return {
    type: 'DO_NOTHING'
  };
}

/**
 * Returns an action object used in signalling that the theme global styles CPT post revisions have been received.
 * Ignored from documentation as it's internal to the data store.
 *
 * @deprecated since WordPress 6.5.0. Callers should use `dispatch( 'core' ).receiveRevision` instead.
 *
 * @ignore
 *
 * @param {number} currentId The post id.
 * @param {Array}  revisions The global styles revisions.
 *
 * @return {Object} Action object.
 */
function receiveThemeGlobalStyleRevisions(currentId, revisions) {
  external_wp_deprecated_default()("wp.data.dispatch( 'core' ).receiveThemeGlobalStyleRevisions()", {
    since: '6.5.0',
    alternative: "wp.data.dispatch( 'core' ).receiveRevisions"
  });
  return {
    type: 'RECEIVE_THEME_GLOBAL_STYLE_REVISIONS',
    currentId,
    revisions
  };
}

/**
 * Returns an action object used in signalling that the preview data for
 * a given URl has been received.
 * Ignored from documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {string} url     URL to preview the embed for.
 * @param {*}      preview Preview data.
 *
 * @return {Object} Action object.
 */
function receiveEmbedPreview(url, preview) {
  return {
    type: 'RECEIVE_EMBED_PREVIEW',
    url,
    preview
  };
}

/**
 * Action triggered to delete an entity record.
 *
 * @param {string}        kind                         Kind of the deleted entity.
 * @param {string}        name                         Name of the deleted entity.
 * @param {number|string} recordId                     Record ID of the deleted entity.
 * @param {?Object}       query                        Special query parameters for the
 *                                                     DELETE API call.
 * @param {Object}        [options]                    Delete options.
 * @param {Function}      [options.__unstableFetch]    Internal use only. Function to
 *                                                     call instead of `apiFetch()`.
 *                                                     Must return a promise.
 * @param {boolean}       [options.throwOnError=false] If false, this action suppresses all
 *                                                     the exceptions. Defaults to false.
 */
const deleteEntityRecord = (kind, name, recordId, query, {
  __unstableFetch = (external_wp_apiFetch_default()),
  throwOnError = false
} = {}) => async ({
  dispatch,
  resolveSelect
}) => {
  logEntityDeprecation(kind, name, 'deleteEntityRecord');
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  let error;
  let deletedRecord = false;
  if (!entityConfig) {
    return;
  }
  const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, ['entities', 'records', kind, name, recordId], {
    exclusive: true
  });
  try {
    dispatch({
      type: 'DELETE_ENTITY_RECORD_START',
      kind,
      name,
      recordId
    });
    let hasError = false;
    try {
      let path = `${entityConfig.baseURL}/${recordId}`;
      if (query) {
        path = (0,external_wp_url_namespaceObject.addQueryArgs)(path, query);
      }
      deletedRecord = await __unstableFetch({
        path,
        method: 'DELETE'
      });
      await dispatch(removeItems(kind, name, recordId, true));
    } catch (_error) {
      hasError = true;
      error = _error;
    }
    dispatch({
      type: 'DELETE_ENTITY_RECORD_FINISH',
      kind,
      name,
      recordId,
      error
    });
    if (hasError && throwOnError) {
      throw error;
    }
    return deletedRecord;
  } finally {
    dispatch.__unstableReleaseStoreLock(lock);
  }
};

/**
 * Returns an action object that triggers an
 * edit to an entity record.
 *
 * @param {string}        kind                 Kind of the edited entity record.
 * @param {string}        name                 Name of the edited entity record.
 * @param {number|string} recordId             Record ID of the edited entity record.
 * @param {Object}        edits                The edits.
 * @param {Object}        options              Options for the edit.
 * @param {boolean}       [options.undoIgnore] Whether to ignore the edit in undo history or not.
 *
 * @return {Object} Action object.
 */
const editEntityRecord = (kind, name, recordId, edits, options = {}) => ({
  select,
  dispatch
}) => {
  logEntityDeprecation(kind, name, 'editEntityRecord');
  const entityConfig = select.getEntityConfig(kind, name);
  if (!entityConfig) {
    throw new Error(`The entity being edited (${kind}, ${name}) does not have a loaded config.`);
  }
  const {
    mergedEdits = {}
  } = entityConfig;
  const record = select.getRawEntityRecord(kind, name, recordId);
  const editedRecord = select.getEditedEntityRecord(kind, name, recordId);
  const edit = {
    kind,
    name,
    recordId,
    // Clear edits when they are equal to their persisted counterparts
    // so that the property is not considered dirty.
    edits: Object.keys(edits).reduce((acc, key) => {
      const recordValue = record[key];
      const editedRecordValue = editedRecord[key];
      const value = mergedEdits[key] ? {
        ...editedRecordValue,
        ...edits[key]
      } : edits[key];
      acc[key] = es6_default()(recordValue, value) ? undefined : value;
      return acc;
    }, {})
  };
  if (window.__experimentalEnableSync && entityConfig.syncConfig) {
    if (true) {
      getSyncProvider().updateCRDTDoc(entityConfig.syncConfig, record, edit.edits, 'gutenberg');
    }
  }
  if (!options.undoIgnore) {
    select.getUndoManager().addRecord([{
      id: {
        kind,
        name,
        recordId
      },
      changes: Object.keys(edits).reduce((acc, key) => {
        acc[key] = {
          from: editedRecord[key],
          to: edits[key]
        };
        return acc;
      }, {})
    }], options.isCached);
  }
  dispatch({
    type: 'EDIT_ENTITY_RECORD',
    ...edit
  });
};

/**
 * Action triggered to undo the last edit to
 * an entity record, if any.
 */
const undo = () => ({
  select,
  dispatch
}) => {
  const undoRecord = select.getUndoManager().undo();
  if (!undoRecord) {
    return;
  }
  dispatch({
    type: 'UNDO',
    record: undoRecord
  });
};

/**
 * Action triggered to redo the last undone
 * edit to an entity record, if any.
 */
const redo = () => ({
  select,
  dispatch
}) => {
  const redoRecord = select.getUndoManager().redo();
  if (!redoRecord) {
    return;
  }
  dispatch({
    type: 'REDO',
    record: redoRecord
  });
};

/**
 * Forces the creation of a new undo level.
 *
 * @return {Object} Action object.
 */
const __unstableCreateUndoLevel = () => ({
  select
}) => {
  select.getUndoManager().addRecord();
};

/**
 * Action triggered to save an entity record.
 *
 * @param {string}   kind                         Kind of the received entity.
 * @param {string}   name                         Name of the received entity.
 * @param {Object}   record                       Record to be saved.
 * @param {Object}   options                      Saving options.
 * @param {boolean}  [options.isAutosave=false]   Whether this is an autosave.
 * @param {Function} [options.__unstableFetch]    Internal use only. Function to
 *                                                call instead of `apiFetch()`.
 *                                                Must return a promise.
 * @param {boolean}  [options.throwOnError=false] If false, this action suppresses all
 *                                                the exceptions. Defaults to false.
 */
const saveEntityRecord = (kind, name, record, {
  isAutosave = false,
  __unstableFetch = (external_wp_apiFetch_default()),
  throwOnError = false
} = {}) => async ({
  select,
  resolveSelect,
  dispatch
}) => {
  logEntityDeprecation(kind, name, 'saveEntityRecord');
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  if (!entityConfig) {
    return;
  }
  const entityIdKey = entityConfig.key || DEFAULT_ENTITY_KEY;
  const recordId = record[entityIdKey];
  const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, ['entities', 'records', kind, name, recordId || esm_browser_v4()], {
    exclusive: true
  });
  try {
    // Evaluate optimized edits.
    // (Function edits that should be evaluated on save to avoid expensive computations on every edit.)
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'function') {
        const evaluatedValue = value(select.getEditedEntityRecord(kind, name, recordId));
        dispatch.editEntityRecord(kind, name, recordId, {
          [key]: evaluatedValue
        }, {
          undoIgnore: true
        });
        record[key] = evaluatedValue;
      }
    }
    dispatch({
      type: 'SAVE_ENTITY_RECORD_START',
      kind,
      name,
      recordId,
      isAutosave
    });
    let updatedRecord;
    let error;
    let hasError = false;
    try {
      const path = `${entityConfig.baseURL}${recordId ? '/' + recordId : ''}`;
      const persistedRecord = select.getRawEntityRecord(kind, name, recordId);
      if (isAutosave) {
        // Most of this autosave logic is very specific to posts.
        // This is fine for now as it is the only supported autosave,
        // but ideally this should all be handled in the back end,
        // so the client just sends and receives objects.
        const currentUser = select.getCurrentUser();
        const currentUserId = currentUser ? currentUser.id : undefined;
        const autosavePost = await resolveSelect.getAutosave(persistedRecord.type, persistedRecord.id, currentUserId);
        // Autosaves need all expected fields to be present.
        // So we fallback to the previous autosave and then
        // to the actual persisted entity if the edits don't
        // have a value.
        let data = {
          ...persistedRecord,
          ...autosavePost,
          ...record
        };
        data = Object.keys(data).reduce((acc, key) => {
          if (['title', 'excerpt', 'content', 'meta'].includes(key)) {
            acc[key] = data[key];
          }
          return acc;
        }, {
          // Do not update the `status` if we have edited it when auto saving.
          // It's very important to let the user explicitly save this change,
          // because it can lead to unexpected results. An example would be to
          // have a draft post and change the status to publish.
          status: data.status === 'auto-draft' ? 'draft' : undefined
        });
        updatedRecord = await __unstableFetch({
          path: `${path}/autosaves`,
          method: 'POST',
          data
        });

        // An autosave may be processed by the server as a regular save
        // when its update is requested by the author and the post had
        // draft or auto-draft status.
        if (persistedRecord.id === updatedRecord.id) {
          let newRecord = {
            ...persistedRecord,
            ...data,
            ...updatedRecord
          };
          newRecord = Object.keys(newRecord).reduce((acc, key) => {
            // These properties are persisted in autosaves.
            if (['title', 'excerpt', 'content'].includes(key)) {
              acc[key] = newRecord[key];
            } else if (key === 'status') {
              // Status is only persisted in autosaves when going from
              // "auto-draft" to "draft".
              acc[key] = persistedRecord.status === 'auto-draft' && newRecord.status === 'draft' ? newRecord.status : persistedRecord.status;
            } else {
              // These properties are not persisted in autosaves.
              acc[key] = persistedRecord[key];
            }
            return acc;
          }, {});
          dispatch.receiveEntityRecords(kind, name, newRecord, undefined, true);
        } else {
          dispatch.receiveAutosaves(persistedRecord.id, updatedRecord);
        }
      } else {
        let edits = record;
        if (entityConfig.__unstablePrePersist) {
          edits = {
            ...edits,
            ...entityConfig.__unstablePrePersist(persistedRecord, edits)
          };
        }
        if (window.__experimentalEnableSync && entityConfig.syncConfig?.enabled) {
          // Allow sync provider to create meta for the entity before persisting.
          edits.meta = {
            ...edits.meta,
            ...(await getSyncProvider().createEntityMeta(entityConfig.syncConfig, {
              ...persistedRecord,
              ...edits
            }))
          };
        }
        updatedRecord = await __unstableFetch({
          path,
          method: recordId ? 'PUT' : 'POST',
          data: edits
        });
        dispatch.receiveEntityRecords(kind, name, updatedRecord, undefined, true, edits);
        if (window.__experimentalEnableSync && entityConfig.syncConfig?.enabled) {
          getSyncProvider().updateLastPersistedDate(entityConfig.syncConfig, persistedRecord);
        }
      }
    } catch (_error) {
      hasError = true;
      error = _error;
    }
    dispatch({
      type: 'SAVE_ENTITY_RECORD_FINISH',
      kind,
      name,
      recordId,
      error,
      isAutosave
    });
    if (hasError && throwOnError) {
      throw error;
    }
    return updatedRecord;
  } finally {
    dispatch.__unstableReleaseStoreLock(lock);
  }
};

/**
 * Runs multiple core-data actions at the same time using one API request.
 *
 * Example:
 *
 * ```
 * const [ savedRecord, updatedRecord, deletedRecord ] =
 *   await dispatch( 'core' ).__experimentalBatch( [
 *     ( { saveEntityRecord } ) => saveEntityRecord( 'root', 'widget', widget ),
 *     ( { saveEditedEntityRecord } ) => saveEntityRecord( 'root', 'widget', 123 ),
 *     ( { deleteEntityRecord } ) => deleteEntityRecord( 'root', 'widget', 123, null ),
 *   ] );
 * ```
 *
 * @param {Array} requests Array of functions which are invoked simultaneously.
 *                         Each function is passed an object containing
 *                         `saveEntityRecord`, `saveEditedEntityRecord`, and
 *                         `deleteEntityRecord`.
 *
 * @return {(thunkArgs: Object) => Promise} A promise that resolves to an array containing the return
 *                                          values of each function given in `requests`.
 */
const __experimentalBatch = requests => async ({
  dispatch
}) => {
  const batch = createBatch();
  const api = {
    saveEntityRecord(kind, name, record, options) {
      return batch.add(add => dispatch.saveEntityRecord(kind, name, record, {
        ...options,
        __unstableFetch: add
      }));
    },
    saveEditedEntityRecord(kind, name, recordId, options) {
      return batch.add(add => dispatch.saveEditedEntityRecord(kind, name, recordId, {
        ...options,
        __unstableFetch: add
      }));
    },
    deleteEntityRecord(kind, name, recordId, query, options) {
      return batch.add(add => dispatch.deleteEntityRecord(kind, name, recordId, query, {
        ...options,
        __unstableFetch: add
      }));
    }
  };
  const resultPromises = requests.map(request => request(api));
  const [, ...results] = await Promise.all([batch.run(), ...resultPromises]);
  return results;
};

/**
 * Action triggered to save an entity record's edits.
 *
 * @param {string}  kind     Kind of the entity.
 * @param {string}  name     Name of the entity.
 * @param {Object}  recordId ID of the record.
 * @param {Object=} options  Saving options.
 */
const saveEditedEntityRecord = (kind, name, recordId, options) => async ({
  select,
  dispatch,
  resolveSelect
}) => {
  logEntityDeprecation(kind, name, 'saveEditedEntityRecord');
  if (!select.hasEditsForEntityRecord(kind, name, recordId)) {
    return;
  }
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  if (!entityConfig) {
    return;
  }
  const entityIdKey = entityConfig.key || DEFAULT_ENTITY_KEY;
  const edits = select.getEntityRecordNonTransientEdits(kind, name, recordId);
  const record = {
    [entityIdKey]: recordId,
    ...edits
  };
  return await dispatch.saveEntityRecord(kind, name, record, options);
};

/**
 * Action triggered to save only specified properties for the entity.
 *
 * @param {string}        kind        Kind of the entity.
 * @param {string}        name        Name of the entity.
 * @param {number|string} recordId    ID of the record.
 * @param {Array}         itemsToSave List of entity properties or property paths to save.
 * @param {Object}        options     Saving options.
 */
const __experimentalSaveSpecifiedEntityEdits = (kind, name, recordId, itemsToSave, options) => async ({
  select,
  dispatch,
  resolveSelect
}) => {
  logEntityDeprecation(kind, name, '__experimentalSaveSpecifiedEntityEdits');
  if (!select.hasEditsForEntityRecord(kind, name, recordId)) {
    return;
  }
  const edits = select.getEntityRecordNonTransientEdits(kind, name, recordId);
  const editsToSave = {};
  for (const item of itemsToSave) {
    setNestedValue(editsToSave, item, getNestedValue(edits, item));
  }
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  const entityIdKey = entityConfig?.key || DEFAULT_ENTITY_KEY;

  // If a record key is provided then update the existing record.
  // This necessitates providing `recordKey` to saveEntityRecord as part of the
  // `record` argument (here called `editsToSave`) to stop that action creating
  // a new record and instead cause it to update the existing record.
  if (recordId) {
    editsToSave[entityIdKey] = recordId;
  }
  return await dispatch.saveEntityRecord(kind, name, editsToSave, options);
};

/**
 * Returns an action object used in signalling that Upload permissions have been received.
 *
 * @deprecated since WP 5.9, use receiveUserPermission instead.
 *
 * @param {boolean} hasUploadPermissions Does the user have permission to upload files?
 *
 * @return {Object} Action object.
 */
function receiveUploadPermissions(hasUploadPermissions) {
  external_wp_deprecated_default()("wp.data.dispatch( 'core' ).receiveUploadPermissions", {
    since: '5.9',
    alternative: 'receiveUserPermission'
  });
  return receiveUserPermission('create/media', hasUploadPermissions);
}

/**
 * Returns an action object used in signalling that the current user has
 * permission to perform an action on a REST resource.
 * Ignored from documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {string}  key       A key that represents the action and REST resource.
 * @param {boolean} isAllowed Whether or not the user can perform the action.
 *
 * @return {Object} Action object.
 */
function receiveUserPermission(key, isAllowed) {
  return {
    type: 'RECEIVE_USER_PERMISSION',
    key,
    isAllowed
  };
}

/**
 * Returns an action object used in signalling that the current user has
 * permission to perform an action on a REST resource. Ignored from
 * documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {Object<string, boolean>} permissions An object where keys represent
 *                                              actions and REST resources, and
 *                                              values indicate whether the user
 *                                              is allowed to perform the
 *                                              action.
 *
 * @return {Object} Action object.
 */
function receiveUserPermissions(permissions) {
  return {
    type: 'RECEIVE_USER_PERMISSIONS',
    permissions
  };
}

/**
 * Returns an action object used in signalling that the autosaves for a
 * post have been received.
 * Ignored from documentation as it's internal to the data store.
 *
 * @ignore
 *
 * @param {number}       postId    The id of the post that is parent to the autosave.
 * @param {Array|Object} autosaves An array of autosaves or singular autosave object.
 *
 * @return {Object} Action object.
 */
function receiveAutosaves(postId, autosaves) {
  return {
    type: 'RECEIVE_AUTOSAVES',
    postId,
    autosaves: Array.isArray(autosaves) ? autosaves : [autosaves]
  };
}

/**
 * Returns an action object signalling that the fallback Navigation
 * Menu id has been received.
 *
 * @param {integer} fallbackId the id of the fallback Navigation Menu
 * @return {Object} Action object.
 */
function receiveNavigationFallbackId(fallbackId) {
  return {
    type: 'RECEIVE_NAVIGATION_FALLBACK_ID',
    fallbackId
  };
}

/**
 * Returns an action object used to set the template for a given query.
 *
 * @param {Object} query      The lookup query.
 * @param {string} templateId The resolved template id.
 *
 * @return {Object} Action object.
 */
function receiveDefaultTemplateId(query, templateId) {
  return {
    type: 'RECEIVE_DEFAULT_TEMPLATE',
    query,
    templateId
  };
}

/**
 * Action triggered to receive revision items.
 *
 * @param {string}        kind            Kind of the received entity record revisions.
 * @param {string}        name            Name of the received entity record revisions.
 * @param {number|string} recordKey       The key of the entity record whose revisions you want to fetch.
 * @param {Array|Object}  records         Revisions received.
 * @param {?Object}       query           Query Object.
 * @param {?boolean}      invalidateCache Should invalidate query caches.
 * @param {?Object}       meta            Meta information about pagination.
 */
const receiveRevisions = (kind, name, recordKey, records, query, invalidateCache = false, meta) => async ({
  dispatch,
  resolveSelect
}) => {
  logEntityDeprecation(kind, name, 'receiveRevisions');
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  const key = entityConfig && entityConfig?.revisionKey ? entityConfig.revisionKey : DEFAULT_ENTITY_KEY;
  dispatch({
    type: 'RECEIVE_ITEM_REVISIONS',
    key,
    items: Array.isArray(records) ? records : [records],
    recordKey,
    meta,
    query,
    kind,
    name,
    invalidateCache
  });
};

;// ./packages/core-data/build-module/private-actions.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */


/**
 * Returns an action object used in signalling that the registered post meta
 * fields for a post type have been received.
 *
 * @param {string} postType           Post type slug.
 * @param {Object} registeredPostMeta Registered post meta.
 *
 * @return {Object} Action object.
 */
function receiveRegisteredPostMeta(postType, registeredPostMeta) {
  return {
    type: 'RECEIVE_REGISTERED_POST_META',
    postType,
    registeredPostMeta
  };
}

/**
 * @typedef {Object} Modifier
 * @property {string} [type] - The type of modifier.
 * @property {Object} [args] - The arguments of the modifier.
 */

/**
 * @typedef {Object} Edits
 * @property {string}     [src]       - The URL of the media item.
 * @property {Modifier[]} [modifiers] - The modifiers to apply to the media item.
 */

/**
 * Duplicates a media (attachment) entity record and, optionally, modifies it.
 *
 * @param {string}   recordId                Entity record ID.
 * @param {Edits}    edits                   Edits to apply to the record.
 * @param {Object}   options                 Options object.
 * @param {Function} options.__unstableFetch Custom fetch function.
 * @param {boolean}  options.throwOnError    Whether to throw an error if the request fails.
 *
 * @return {Promise} Promise resolving to the updated record.
 */
const editMediaEntity = (recordId, edits = {}, {
  __unstableFetch = (external_wp_apiFetch_default()),
  throwOnError = false
} = {}) => async ({
  dispatch,
  resolveSelect
}) => {
  if (!recordId) {
    return;
  }
  const kind = 'postType';
  const name = 'attachment';
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.kind === kind && config.name === name);
  if (!entityConfig) {
    return;
  }
  const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, ['entities', 'records', kind, name, recordId], {
    exclusive: true
  });
  let updatedRecord;
  let error;
  let hasError = false;
  try {
    dispatch({
      type: 'SAVE_ENTITY_RECORD_START',
      kind,
      name,
      recordId
    });
    try {
      const path = `${entityConfig.baseURL}/${recordId}/edit`;
      const newRecord = await __unstableFetch({
        path,
        method: 'POST',
        data: {
          ...edits
        }
      });
      if (newRecord) {
        dispatch.receiveEntityRecords(kind, name, [newRecord], undefined, true, undefined, undefined);
        updatedRecord = newRecord;
      }
    } catch (e) {
      error = e;
      hasError = true;
    }
    dispatch({
      type: 'SAVE_ENTITY_RECORD_FINISH',
      kind,
      name,
      recordId,
      error
    });
    if (hasError && throwOnError) {
      throw error;
    }
    return updatedRecord;
  } finally {
    dispatch.__unstableReleaseStoreLock(lock);
  }
};

;// ./node_modules/camel-case/dist.es2015/index.js


function camelCaseTransform(input, index) {
    if (index === 0)
        return input.toLowerCase();
    return pascalCaseTransform(input, index);
}
function camelCaseTransformMerge(input, index) {
    if (index === 0)
        return input.toLowerCase();
    return pascalCaseTransformMerge(input);
}
function camelCase(input, options) {
    if (options === void 0) { options = {}; }
    return pascalCase(input, __assign({ transform: camelCaseTransform }, options));
}

;// external ["wp","htmlEntities"]
const external_wp_htmlEntities_namespaceObject = window["wp"]["htmlEntities"];
;// ./packages/core-data/build-module/utils/forward-resolver.js
/**
 * Higher-order function which forward the resolution to another resolver with the same arguments.
 *
 * @param {string} resolverName forwarded resolver.
 *
 * @return {Function} Enhanced resolver.
 */
const forwardResolver = resolverName => (...args) => async ({
  resolveSelect
}) => {
  await resolveSelect[resolverName](...args);
};
/* harmony default export */ const forward_resolver = (forwardResolver);

;// ./packages/core-data/build-module/utils/receive-intermediate-results.js
const RECEIVE_INTERMEDIATE_RESULTS = Symbol('RECEIVE_INTERMEDIATE_RESULTS');

;// ./packages/core-data/build-module/fetch/__experimental-fetch-link-suggestions.js
/**
 * WordPress dependencies
 */




/**
 * Fetches link suggestions from the WordPress API.
 *
 * WordPress does not support searching multiple tables at once, e.g. posts and terms, so we
 * perform multiple queries at the same time and then merge the results together.
 *
 * @param search
 * @param searchOptions
 * @param editorSettings
 *
 * @example
 * ```js
 * import { __experimentalFetchLinkSuggestions as fetchLinkSuggestions } from '@wordpress/core-data';
 *
 * //...
 *
 * export function initialize( id, settings ) {
 *
 * settings.__experimentalFetchLinkSuggestions = (
 *     search,
 *     searchOptions
 * ) => fetchLinkSuggestions( search, searchOptions, settings );
 * ```
 */
async function fetchLinkSuggestions(search, searchOptions = {}, editorSettings = {}) {
  const searchOptionsToUse = searchOptions.isInitialSuggestions && searchOptions.initialSuggestionsSearchOptions ? {
    ...searchOptions,
    ...searchOptions.initialSuggestionsSearchOptions
  } : searchOptions;
  const {
    type,
    subtype,
    page,
    perPage = searchOptions.isInitialSuggestions ? 3 : 20
  } = searchOptionsToUse;
  const {
    disablePostFormats = false
  } = editorSettings;
  const queries = [];
  if (!type || type === 'post') {
    queries.push(external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/search', {
        search,
        page,
        per_page: perPage,
        type: 'post',
        subtype
      })
    }).then(results => {
      return results.map(result => {
        return {
          id: result.id,
          url: result.url,
          title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(result.title || '') || (0,external_wp_i18n_namespaceObject.__)('(no title)'),
          type: result.subtype || result.type,
          kind: 'post-type'
        };
      });
    }).catch(() => []) // Fail by returning no results.
    );
  }
  if (!type || type === 'term') {
    queries.push(external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/search', {
        search,
        page,
        per_page: perPage,
        type: 'term',
        subtype
      })
    }).then(results => {
      return results.map(result => {
        return {
          id: result.id,
          url: result.url,
          title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(result.title || '') || (0,external_wp_i18n_namespaceObject.__)('(no title)'),
          type: result.subtype || result.type,
          kind: 'taxonomy'
        };
      });
    }).catch(() => []) // Fail by returning no results.
    );
  }
  if (!disablePostFormats && (!type || type === 'post-format')) {
    queries.push(external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/search', {
        search,
        page,
        per_page: perPage,
        type: 'post-format',
        subtype
      })
    }).then(results => {
      return results.map(result => {
        return {
          id: result.id,
          url: result.url,
          title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(result.title || '') || (0,external_wp_i18n_namespaceObject.__)('(no title)'),
          type: result.subtype || result.type,
          kind: 'taxonomy'
        };
      });
    }).catch(() => []) // Fail by returning no results.
    );
  }
  if (!type || type === 'attachment') {
    queries.push(external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/media', {
        search,
        page,
        per_page: perPage
      })
    }).then(results => {
      return results.map(result => {
        return {
          id: result.id,
          url: result.source_url,
          title: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(result.title.rendered || '') || (0,external_wp_i18n_namespaceObject.__)('(no title)'),
          type: result.type,
          kind: 'media'
        };
      });
    }).catch(() => []) // Fail by returning no results.
    );
  }
  const responses = await Promise.all(queries);
  let results = responses.flat();
  results = results.filter(result => !!result.id);
  results = sortResults(results, search);
  results = results.slice(0, perPage);
  return results;
}

/**
 * Sort search results by relevance to the given query.
 *
 * Sorting is necessary as we're querying multiple endpoints and merging the results. For example
 * a taxonomy title might be more relevant than a post title, but by default taxonomy results will
 * be ordered after all the (potentially irrelevant) post results.
 *
 * We sort by scoring each result, where the score is the number of tokens in the title that are
 * also in the search query, divided by the total number of tokens in the title. This gives us a
 * score between 0 and 1, where 1 is a perfect match.
 *
 * @param results
 * @param search
 */
function sortResults(results, search) {
  const searchTokens = tokenize(search);
  const scores = {};
  for (const result of results) {
    if (result.title) {
      const titleTokens = tokenize(result.title);
      const exactMatchingTokens = titleTokens.filter(titleToken => searchTokens.some(searchToken => titleToken === searchToken));
      const subMatchingTokens = titleTokens.filter(titleToken => searchTokens.some(searchToken => titleToken !== searchToken && titleToken.includes(searchToken)));

      // The score is a combination of exact matches and sub-matches.
      // More weight is given to exact matches, as they are more relevant (e.g. "cat" vs "caterpillar").
      // Diving by the total number of tokens in the title normalizes the score and skews
      // the results towards shorter titles.
      const exactMatchScore = exactMatchingTokens.length / titleTokens.length * 10;
      const subMatchScore = subMatchingTokens.length / titleTokens.length;
      scores[result.id] = exactMatchScore + subMatchScore;
    } else {
      scores[result.id] = 0;
    }
  }
  return results.sort((a, b) => scores[b.id] - scores[a.id]);
}

/**
 * Turns text into an array of tokens, with whitespace and punctuation removed.
 *
 * For example, `"I'm having a ball."` becomes `[ "im", "having", "a", "ball" ]`.
 *
 * @param text
 */
function tokenize(text) {
  // \p{L} matches any kind of letter from any language.
  // \p{N} matches any kind of numeric character.
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

;// ./packages/core-data/build-module/fetch/__experimental-fetch-url-data.js
/**
 * WordPress dependencies
 */



/**
 * A simple in-memory cache for requests.
 * This avoids repeat HTTP requests which may be beneficial
 * for those wishing to preserve low-bandwidth.
 */
const CACHE = new Map();

/**
 * @typedef WPRemoteUrlData
 *
 * @property {string} title contents of the remote URL's `<title>` tag.
 */

/**
 * Fetches data about a remote URL.
 * eg: <title> tag, favicon...etc.
 *
 * @async
 * @param {string}  url     the URL to request details from.
 * @param {?Object} options any options to pass to the underlying fetch.
 * @example
 * ```js
 * import { __experimentalFetchUrlData as fetchUrlData } from '@wordpress/core-data';
 *
 * //...
 *
 * export function initialize( id, settings ) {
 *
 * settings.__experimentalFetchUrlData = (
 * url
 * ) => fetchUrlData( url );
 * ```
 * @return {Promise< WPRemoteUrlData[] >} Remote URL data.
 */
const fetchUrlData = async (url, options = {}) => {
  const endpoint = '/wp-block-editor/v1/url-details';
  const args = {
    url: (0,external_wp_url_namespaceObject.prependHTTP)(url)
  };
  if (!(0,external_wp_url_namespaceObject.isURL)(url)) {
    return Promise.reject(`${url} is not a valid URL.`);
  }

  // Test for "http" based URL as it is possible for valid
  // yet unusable URLs such as `tel:123456` to be passed.
  const protocol = (0,external_wp_url_namespaceObject.getProtocol)(url);
  if (!protocol || !(0,external_wp_url_namespaceObject.isValidProtocol)(protocol) || !protocol.startsWith('http') || !/^https?:\/\/[^\/\s]/i.test(url)) {
    return Promise.reject(`${url} does not have a valid protocol. URLs must be "http" based`);
  }
  if (CACHE.has(url)) {
    return CACHE.get(url);
  }
  return external_wp_apiFetch_default()({
    path: (0,external_wp_url_namespaceObject.addQueryArgs)(endpoint, args),
    ...options
  }).then(res => {
    CACHE.set(url, res);
    return res;
  });
};
/* harmony default export */ const _experimental_fetch_url_data = (fetchUrlData);

;// ./packages/core-data/build-module/fetch/index.js
/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */



async function fetchBlockPatterns() {
  const restPatterns = await external_wp_apiFetch_default()({
    path: '/wp/v2/block-patterns/patterns'
  });
  if (!restPatterns) {
    return [];
  }
  return restPatterns.map(pattern => Object.fromEntries(Object.entries(pattern).map(([key, value]) => [camelCase(key), value])));
}

;// ./packages/core-data/build-module/resolvers.js
/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */




/**
 * Internal dependencies
 */






/**
 * Requests authors from the REST API.
 *
 * @param {Object|undefined} query Optional object of query parameters to
 *                                 include with request.
 */
const resolvers_getAuthors = query => async ({
  dispatch
}) => {
  const path = (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/users/?who=authors&per_page=100', query);
  const users = await external_wp_apiFetch_default()({
    path
  });
  dispatch.receiveUserQuery(path, users);
};

/**
 * Requests the current user from the REST API.
 */
const resolvers_getCurrentUser = () => async ({
  dispatch
}) => {
  const currentUser = await external_wp_apiFetch_default()({
    path: '/wp/v2/users/me'
  });
  dispatch.receiveCurrentUser(currentUser);
};

/**
 * Requests an entity's record from the REST API.
 *
 * @param {string}           kind  Entity kind.
 * @param {string}           name  Entity name.
 * @param {number|string}    key   Record's key
 * @param {Object|undefined} query Optional object of query parameters to
 *                                 include with request. If requesting specific
 *                                 fields, fields must always include the ID.
 */
const resolvers_getEntityRecord = (kind, name, key = '', query) => async ({
  select,
  dispatch,
  registry,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.name === name && config.kind === kind);
  if (!entityConfig) {
    return;
  }
  const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, ['entities', 'records', kind, name, key], {
    exclusive: false
  });
  try {
    // Entity supports configs,
    if (query !== undefined && query._fields) {
      // If requesting specific fields, items and query association to said
      // records are stored by ID reference. Thus, fields must always include
      // the ID.
      query = {
        ...query,
        _fields: [...new Set([...(get_normalized_comma_separable(query._fields) || []), entityConfig.key || DEFAULT_ENTITY_KEY])].join()
      };
    }
    if (query !== undefined && query._fields) {
      // The resolution cache won't consider query as reusable based on the
      // fields, so it's tested here, prior to initiating the REST request,
      // and without causing `getEntityRecord` resolution to occur.
      const hasRecord = select.hasEntityRecord(kind, name, key, query);
      if (hasRecord) {
        return;
      }
    }
    const path = (0,external_wp_url_namespaceObject.addQueryArgs)(entityConfig.baseURL + (key ? '/' + key : ''), {
      ...entityConfig.baseURLParams,
      ...query
    });
    const response = await external_wp_apiFetch_default()({
      path,
      parse: false
    });
    const record = await response.json();
    const permissions = getUserPermissionsFromAllowHeader(response.headers?.get('allow'));
    const canUserResolutionsArgs = [];
    const receiveUserPermissionArgs = {};
    for (const action of ALLOWED_RESOURCE_ACTIONS) {
      receiveUserPermissionArgs[getUserPermissionCacheKey(action, {
        kind,
        name,
        id: key
      })] = permissions[action];
      canUserResolutionsArgs.push([action, {
        kind,
        name,
        id: key
      }]);
    }
    if (window.__experimentalEnableSync && entityConfig.syncConfig?.enabled && !query) {
      if (true) {
        await getSyncProvider().bootstrap(
        // Bootstrap syncing for the entity.
        entityConfig.syncConfig, record, {
          // Handle edits sourced from the sync provider.
          editRecord: edits => {
            if (!Object.keys(edits).length) {
              return;
            }
            dispatch({
              type: 'EDIT_ENTITY_RECORD',
              kind,
              name,
              recordId: key,
              edits,
              meta: {
                undo: undefined
              }
            });
          },
          // Get the current entity record.
          getEditedRecord: async () => await resolveSelect.getEditedEntityRecord(kind, name, key),
          // Refetch the persisted entity record.
          refetchPersistedRecord: () => {
            void (async () => {
              dispatch.receiveEntityRecords(kind, name, await external_wp_apiFetch_default()({
                path,
                parse: true
              }), query);
            })();
          }
        });
      }
    }
    registry.batch(() => {
      dispatch.receiveEntityRecords(kind, name, record, query);
      dispatch.receiveUserPermissions(receiveUserPermissionArgs);
      dispatch.finishResolutions('canUser', canUserResolutionsArgs);
    });
  } finally {
    dispatch.__unstableReleaseStoreLock(lock);
  }
};

/**
 * Requests an entity's record from the REST API.
 */
const resolvers_getRawEntityRecord = forward_resolver('getEntityRecord');

/**
 * Requests an entity's record from the REST API.
 */
const resolvers_getEditedEntityRecord = forward_resolver('getEntityRecord');

/**
 * Requests the entity's records from the REST API.
 *
 * @param {string}  kind  Entity kind.
 * @param {string}  name  Entity name.
 * @param {?Object} query Query Object. If requesting specific fields, fields
 *                        must always include the ID.
 */
const resolvers_getEntityRecords = (kind, name, query = {}) => async ({
  dispatch,
  registry,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.name === name && config.kind === kind);
  if (!entityConfig) {
    return;
  }
  const lock = await dispatch.__unstableAcquireStoreLock(STORE_NAME, ['entities', 'records', kind, name], {
    exclusive: false
  });

  // Keep a copy of the original query for later use in getResolutionsArgs.
  // The query object may be modified below (for example, when _fields is
  // specified), but we want to use the original query when marking
  // resolutions as finished.
  const rawQuery = {
    ...query
  };
  const key = entityConfig.key || DEFAULT_ENTITY_KEY;
  function getResolutionsArgs(records, recordsQuery) {
    const queryArgs = Object.fromEntries(Object.entries(recordsQuery).filter(([k, v]) => {
      return ['context', '_fields'].includes(k) && !!v;
    }));
    return records.filter(record => record?.[key]).map(record => [kind, name, record[key], Object.keys(queryArgs).length > 0 ? queryArgs : undefined]);
  }
  try {
    if (query._fields) {
      // If requesting specific fields, items and query association to said
      // records are stored by ID reference. Thus, fields must always include
      // the ID.
      query = {
        ...query,
        _fields: [...new Set([...(get_normalized_comma_separable(query._fields) || []), key])].join()
      };
    }
    const path = (0,external_wp_url_namespaceObject.addQueryArgs)(entityConfig.baseURL, {
      ...entityConfig.baseURLParams,
      ...query
    });
    let records = [],
      meta;
    if (entityConfig.supportsPagination && query.per_page !== -1) {
      const response = await external_wp_apiFetch_default()({
        path,
        parse: false
      });
      records = Object.values(await response.json());
      meta = {
        totalItems: parseInt(response.headers.get('X-WP-Total')),
        totalPages: parseInt(response.headers.get('X-WP-TotalPages'))
      };
    } else if (query.per_page === -1 && query[RECEIVE_INTERMEDIATE_RESULTS] === true) {
      let page = 1;
      let totalPages;
      do {
        const response = await external_wp_apiFetch_default()({
          path: (0,external_wp_url_namespaceObject.addQueryArgs)(path, {
            page,
            per_page: 100
          }),
          parse: false
        });
        const pageRecords = Object.values(await response.json());
        totalPages = parseInt(response.headers.get('X-WP-TotalPages'));
        if (!meta) {
          meta = {
            totalItems: parseInt(response.headers.get('X-WP-Total')),
            totalPages: 1
          };
        }
        records.push(...pageRecords);
        registry.batch(() => {
          dispatch.receiveEntityRecords(kind, name, records, query, false, undefined, meta);
          dispatch.finishResolutions('getEntityRecord', getResolutionsArgs(pageRecords, rawQuery));
        });
        page++;
      } while (page <= totalPages);
    } else {
      records = Object.values(await external_wp_apiFetch_default()({
        path
      }));
      meta = {
        totalItems: records.length,
        totalPages: 1
      };
    }

    // If we request fields but the result doesn't contain the fields,
    // explicitly set these fields as "undefined"
    // that way we consider the query "fulfilled".
    if (query._fields) {
      records = records.map(record => {
        query._fields.split(',').forEach(field => {
          if (!record.hasOwnProperty(field)) {
            record[field] = undefined;
          }
        });
        return record;
      });
    }
    registry.batch(() => {
      dispatch.receiveEntityRecords(kind, name, records, query, false, undefined, meta);
      const targetHints = records.filter(record => !!record?.[key] && !!record?._links?.self?.[0]?.targetHints?.allow).map(record => ({
        id: record[key],
        permissions: getUserPermissionsFromAllowHeader(record._links.self[0].targetHints.allow)
      }));
      const canUserResolutionsArgs = [];
      const receiveUserPermissionArgs = {};
      for (const targetHint of targetHints) {
        for (const action of ALLOWED_RESOURCE_ACTIONS) {
          canUserResolutionsArgs.push([action, {
            kind,
            name,
            id: targetHint.id
          }]);
          receiveUserPermissionArgs[getUserPermissionCacheKey(action, {
            kind,
            name,
            id: targetHint.id
          })] = targetHint.permissions[action];
        }
      }
      if (targetHints.length > 0) {
        dispatch.receiveUserPermissions(receiveUserPermissionArgs);
        dispatch.finishResolutions('canUser', canUserResolutionsArgs);
      }
      dispatch.finishResolutions('getEntityRecord', getResolutionsArgs(records, rawQuery));
      dispatch.__unstableReleaseStoreLock(lock);
    });
  } catch (e) {
    dispatch.__unstableReleaseStoreLock(lock);
  }
};
resolvers_getEntityRecords.shouldInvalidate = (action, kind, name) => {
  return (action.type === 'RECEIVE_ITEMS' || action.type === 'REMOVE_ITEMS') && action.invalidateCache && kind === action.kind && name === action.name;
};

/**
 * Requests the total number of entity records.
 */
const resolvers_getEntityRecordsTotalItems = forward_resolver('getEntityRecords');

/**
 * Requests the number of available pages for the given query.
 */
const resolvers_getEntityRecordsTotalPages = forward_resolver('getEntityRecords');

/**
 * Requests the current theme.
 */
const resolvers_getCurrentTheme = () => async ({
  dispatch,
  resolveSelect
}) => {
  const activeThemes = await resolveSelect.getEntityRecords('root', 'theme', {
    status: 'active'
  });
  dispatch.receiveCurrentTheme(activeThemes[0]);
};

/**
 * Requests theme supports data from the index.
 */
const resolvers_getThemeSupports = forward_resolver('getCurrentTheme');

/**
 * Requests a preview from the Embed API.
 *
 * @param {string} url URL to get the preview for.
 */
const resolvers_getEmbedPreview = url => async ({
  dispatch
}) => {
  try {
    const embedProxyResponse = await external_wp_apiFetch_default()({
      path: (0,external_wp_url_namespaceObject.addQueryArgs)('/oembed/1.0/proxy', {
        url
      })
    });
    dispatch.receiveEmbedPreview(url, embedProxyResponse);
  } catch (error) {
    // Embed API 404s if the URL cannot be embedded, so we have to catch the error from the apiRequest here.
    dispatch.receiveEmbedPreview(url, false);
  }
};

/**
 * Checks whether the current user can perform the given action on the given
 * REST resource.
 *
 * @param {string}        requestedAction Action to check. One of: 'create', 'read', 'update',
 *                                        'delete'.
 * @param {string|Object} resource        Entity resource to check. Accepts entity object `{ kind: 'postType', name: 'attachment', id: 1 }`
 *                                        or REST base as a string - `media`.
 * @param {?string}       id              ID of the rest resource to check.
 */
const resolvers_canUser = (requestedAction, resource, id) => async ({
  dispatch,
  registry,
  resolveSelect
}) => {
  if (!ALLOWED_RESOURCE_ACTIONS.includes(requestedAction)) {
    throw new Error(`'${requestedAction}' is not a valid action.`);
  }
  const {
    hasStartedResolution
  } = registry.select(STORE_NAME);

  // Prevent resolving the same resource twice.
  for (const relatedAction of ALLOWED_RESOURCE_ACTIONS) {
    if (relatedAction === requestedAction) {
      continue;
    }
    const isAlreadyResolving = hasStartedResolution('canUser', [relatedAction, resource, id]);
    if (isAlreadyResolving) {
      return;
    }
  }
  let resourcePath = null;
  if (typeof resource === 'object') {
    if (!resource.kind || !resource.name) {
      throw new Error('The entity resource object is not valid.');
    }
    const configs = await resolveSelect.getEntitiesConfig(resource.kind);
    const entityConfig = configs.find(config => config.name === resource.name && config.kind === resource.kind);
    if (!entityConfig) {
      return;
    }
    resourcePath = entityConfig.baseURL + (resource.id ? '/' + resource.id : '');
  } else {
    resourcePath = `/wp/v2/${resource}` + (id ? '/' + id : '');
  }
  let response;
  try {
    response = await external_wp_apiFetch_default()({
      path: resourcePath,
      method: 'OPTIONS',
      parse: false
    });
  } catch (error) {
    // Do nothing if our OPTIONS request comes back with an API error (4xx or
    // 5xx). The previously determined isAllowed value will remain in the store.
    return;
  }

  // Optional chaining operator is used here because the API requests don't
  // return the expected result in the React native version. Instead, API requests
  // only return the result, without including response properties like the headers.
  const permissions = getUserPermissionsFromAllowHeader(response.headers?.get('allow'));
  registry.batch(() => {
    for (const action of ALLOWED_RESOURCE_ACTIONS) {
      const key = getUserPermissionCacheKey(action, resource, id);
      dispatch.receiveUserPermission(key, permissions[action]);

      // Mark related action resolutions as finished.
      if (action !== requestedAction) {
        dispatch.finishResolution('canUser', [action, resource, id]);
      }
    }
  });
};

/**
 * Checks whether the current user can perform the given action on the given
 * REST resource.
 *
 * @param {string}        kind     Entity kind.
 * @param {string}        name     Entity name.
 * @param {number|string} recordId Record's id.
 */
const resolvers_canUserEditEntityRecord = (kind, name, recordId) => async ({
  dispatch
}) => {
  await dispatch(resolvers_canUser('update', {
    kind,
    name,
    id: recordId
  }));
};

/**
 * Request autosave data from the REST API.
 *
 * @param {string} postType The type of the parent post.
 * @param {number} postId   The id of the parent post.
 */
const resolvers_getAutosaves = (postType, postId) => async ({
  dispatch,
  resolveSelect
}) => {
  const {
    rest_base: restBase,
    rest_namespace: restNamespace = 'wp/v2',
    supports
  } = await resolveSelect.getPostType(postType);
  if (!supports?.autosave) {
    return;
  }
  const autosaves = await external_wp_apiFetch_default()({
    path: `/${restNamespace}/${restBase}/${postId}/autosaves?context=edit`
  });
  if (autosaves && autosaves.length) {
    dispatch.receiveAutosaves(postId, autosaves);
  }
};

/**
 * Request autosave data from the REST API.
 *
 * This resolver exists to ensure the underlying autosaves are fetched via
 * `getAutosaves` when a call to the `getAutosave` selector is made.
 *
 * @param {string} postType The type of the parent post.
 * @param {number} postId   The id of the parent post.
 */
const resolvers_getAutosave = (postType, postId) => async ({
  resolveSelect
}) => {
  await resolveSelect.getAutosaves(postType, postId);
};
const resolvers_experimentalGetCurrentGlobalStylesId = () => async ({
  dispatch,
  resolveSelect
}) => {
  const activeThemes = await resolveSelect.getEntityRecords('root', 'theme', {
    status: 'active'
  });
  const globalStylesURL = activeThemes?.[0]?._links?.['wp:user-global-styles']?.[0]?.href;
  if (!globalStylesURL) {
    return;
  }

  // Regex matches the ID at the end of a URL or immediately before
  // the query string.
  const matches = globalStylesURL.match(/\/(\d+)(?:\?|$)/);
  const id = matches ? Number(matches[1]) : null;
  if (id) {
    dispatch.__experimentalReceiveCurrentGlobalStylesId(id);
  }
};
const resolvers_experimentalGetCurrentThemeBaseGlobalStyles = () => async ({
  resolveSelect,
  dispatch
}) => {
  const currentTheme = await resolveSelect.getCurrentTheme();
  // Please adjust the preloaded requests if this changes!
  const themeGlobalStyles = await external_wp_apiFetch_default()({
    path: `/wp/v2/global-styles/themes/${currentTheme.stylesheet}?context=view`
  });
  dispatch.__experimentalReceiveThemeBaseGlobalStyles(currentTheme.stylesheet, themeGlobalStyles);
};
const resolvers_experimentalGetCurrentThemeGlobalStylesVariations = () => async ({
  resolveSelect,
  dispatch
}) => {
  const currentTheme = await resolveSelect.getCurrentTheme();
  // Please adjust the preloaded requests if this changes!
  const variations = await external_wp_apiFetch_default()({
    path: `/wp/v2/global-styles/themes/${currentTheme.stylesheet}/variations?context=view`
  });
  dispatch.__experimentalReceiveThemeGlobalStyleVariations(currentTheme.stylesheet, variations);
};

/**
 * Fetches and returns the revisions of the current global styles theme.
 */
const resolvers_getCurrentThemeGlobalStylesRevisions = () => async ({
  resolveSelect,
  dispatch
}) => {
  const globalStylesId = await resolveSelect.__experimentalGetCurrentGlobalStylesId();
  const record = globalStylesId ? await resolveSelect.getEntityRecord('root', 'globalStyles', globalStylesId) : undefined;
  const revisionsURL = record?._links?.['version-history']?.[0]?.href;
  if (revisionsURL) {
    const resetRevisions = await external_wp_apiFetch_default()({
      url: revisionsURL
    });
    const revisions = resetRevisions?.map(revision => Object.fromEntries(Object.entries(revision).map(([key, value]) => [camelCase(key), value])));
    dispatch.receiveThemeGlobalStyleRevisions(globalStylesId, revisions);
  }
};
resolvers_getCurrentThemeGlobalStylesRevisions.shouldInvalidate = action => {
  return action.type === 'SAVE_ENTITY_RECORD_FINISH' && action.kind === 'root' && !action.error && action.name === 'globalStyles';
};
const resolvers_getBlockPatterns = () => async ({
  dispatch
}) => {
  const patterns = await fetchBlockPatterns();
  dispatch({
    type: 'RECEIVE_BLOCK_PATTERNS',
    patterns
  });
};
const resolvers_getBlockPatternCategories = () => async ({
  dispatch
}) => {
  const categories = await external_wp_apiFetch_default()({
    path: '/wp/v2/block-patterns/categories'
  });
  dispatch({
    type: 'RECEIVE_BLOCK_PATTERN_CATEGORIES',
    categories
  });
};
const resolvers_getUserPatternCategories = () => async ({
  dispatch,
  resolveSelect
}) => {
  const patternCategories = await resolveSelect.getEntityRecords('taxonomy', 'wp_pattern_category', {
    per_page: -1,
    _fields: 'id,name,description,slug',
    context: 'view'
  });
  const mappedPatternCategories = patternCategories?.map(userCategory => ({
    ...userCategory,
    label: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(userCategory.name),
    name: userCategory.slug
  })) || [];
  dispatch({
    type: 'RECEIVE_USER_PATTERN_CATEGORIES',
    patternCategories: mappedPatternCategories
  });
};
const resolvers_getNavigationFallbackId = () => async ({
  dispatch,
  select,
  registry
}) => {
  const fallback = await external_wp_apiFetch_default()({
    path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp-block-editor/v1/navigation-fallback', {
      _embed: true
    })
  });
  const record = fallback?._embedded?.self;
  registry.batch(() => {
    dispatch.receiveNavigationFallbackId(fallback?.id);
    if (!record) {
      return;
    }

    // If the fallback is already in the store, don't invalidate navigation queries.
    // Otherwise, invalidate the cache for the scenario where there were no Navigation
    // posts in the state and the fallback created one.
    const existingFallbackEntityRecord = select.getEntityRecord('postType', 'wp_navigation', fallback.id);
    const invalidateNavigationQueries = !existingFallbackEntityRecord;
    dispatch.receiveEntityRecords('postType', 'wp_navigation', record, undefined, invalidateNavigationQueries);

    // Resolve to avoid further network requests.
    dispatch.finishResolution('getEntityRecord', ['postType', 'wp_navigation', fallback.id]);
  });
};
const resolvers_getDefaultTemplateId = query => async ({
  dispatch,
  registry,
  resolveSelect
}) => {
  const template = await external_wp_apiFetch_default()({
    path: (0,external_wp_url_namespaceObject.addQueryArgs)('/wp/v2/templates/lookup', query)
  });
  // Wait for the the entities config to be loaded, otherwise receiving
  // the template as an entity will not work.
  await resolveSelect.getEntitiesConfig('postType');
  // Endpoint may return an empty object if no template is found.
  if (template?.id) {
    registry.batch(() => {
      dispatch.receiveDefaultTemplateId(query, template.id);
      dispatch.receiveEntityRecords('postType', 'wp_template', [template]);
      // Avoid further network requests.
      dispatch.finishResolution('getEntityRecord', ['postType', 'wp_template', template.id]);
    });
  }
};

/**
 * Requests an entity's revisions from the REST API.
 *
 * @param {string}           kind      Entity kind.
 * @param {string}           name      Entity name.
 * @param {number|string}    recordKey The key of the entity record whose revisions you want to fetch.
 * @param {Object|undefined} query     Optional object of query parameters to
 *                                     include with request. If requesting specific
 *                                     fields, fields must always include the ID.
 */
const resolvers_getRevisions = (kind, name, recordKey, query = {}) => async ({
  dispatch,
  registry,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.name === name && config.kind === kind);
  if (!entityConfig) {
    return;
  }
  if (query._fields) {
    // If requesting specific fields, items and query association to said
    // records are stored by ID reference. Thus, fields must always include
    // the ID.
    query = {
      ...query,
      _fields: [...new Set([...(get_normalized_comma_separable(query._fields) || []), entityConfig.revisionKey || DEFAULT_ENTITY_KEY])].join()
    };
  }
  const path = (0,external_wp_url_namespaceObject.addQueryArgs)(entityConfig.getRevisionsUrl(recordKey), query);
  let records, response;
  const meta = {};
  const isPaginated = entityConfig.supportsPagination && query.per_page !== -1;
  try {
    response = await external_wp_apiFetch_default()({
      path,
      parse: !isPaginated
    });
  } catch (error) {
    // Do nothing if our request comes back with an API error.
    return;
  }
  if (response) {
    if (isPaginated) {
      records = Object.values(await response.json());
      meta.totalItems = parseInt(response.headers.get('X-WP-Total'));
    } else {
      records = Object.values(response);
    }

    // If we request fields but the result doesn't contain the fields,
    // explicitly set these fields as "undefined"
    // that way we consider the query "fulfilled".
    if (query._fields) {
      records = records.map(record => {
        query._fields.split(',').forEach(field => {
          if (!record.hasOwnProperty(field)) {
            record[field] = undefined;
          }
        });
        return record;
      });
    }
    registry.batch(() => {
      dispatch.receiveRevisions(kind, name, recordKey, records, query, false, meta);

      // When requesting all fields, the list of results can be used to
      // resolve the `getRevision` selector in addition to `getRevisions`.
      if (!query?._fields && !query.context) {
        const key = entityConfig.key || DEFAULT_ENTITY_KEY;
        const resolutionsArgs = records.filter(record => record[key]).map(record => [kind, name, recordKey, record[key]]);
        dispatch.finishResolutions('getRevision', resolutionsArgs);
      }
    });
  }
};

// Invalidate cache when a new revision is created.
resolvers_getRevisions.shouldInvalidate = (action, kind, name, recordKey) => action.type === 'SAVE_ENTITY_RECORD_FINISH' && name === action.name && kind === action.kind && !action.error && recordKey === action.recordId;

/**
 * Requests a specific Entity revision from the REST API.
 *
 * @param {string}           kind        Entity kind.
 * @param {string}           name        Entity name.
 * @param {number|string}    recordKey   The key of the entity record whose revisions you want to fetch.
 * @param {number|string}    revisionKey The revision's key.
 * @param {Object|undefined} query       Optional object of query parameters to
 *                                       include with request. If requesting specific
 *                                       fields, fields must always include the ID.
 */
const resolvers_getRevision = (kind, name, recordKey, revisionKey, query) => async ({
  dispatch,
  resolveSelect
}) => {
  const configs = await resolveSelect.getEntitiesConfig(kind);
  const entityConfig = configs.find(config => config.name === name && config.kind === kind);
  if (!entityConfig) {
    return;
  }
  if (query !== undefined && query._fields) {
    // If requesting specific fields, items and query association to said
    // records are stored by ID reference. Thus, fields must always include
    // the ID.
    query = {
      ...query,
      _fields: [...new Set([...(get_normalized_comma_separable(query._fields) || []), entityConfig.revisionKey || DEFAULT_ENTITY_KEY])].join()
    };
  }
  const path = (0,external_wp_url_namespaceObject.addQueryArgs)(entityConfig.getRevisionsUrl(recordKey, revisionKey), query);
  let record;
  try {
    record = await external_wp_apiFetch_default()({
      path
    });
  } catch (error) {
    // Do nothing if our request comes back with an API error.
    return;
  }
  if (record) {
    dispatch.receiveRevisions(kind, name, recordKey, record, query);
  }
};

/**
 * Requests a specific post type options from the REST API.
 *
 * @param {string} postType Post type slug.
 */
const resolvers_getRegisteredPostMeta = postType => async ({
  dispatch,
  resolveSelect
}) => {
  let options;
  try {
    const {
      rest_namespace: restNamespace = 'wp/v2',
      rest_base: restBase
    } = (await resolveSelect.getPostType(postType)) || {};
    options = await external_wp_apiFetch_default()({
      path: `${restNamespace}/${restBase}/?context=edit`,
      method: 'OPTIONS'
    });
  } catch (error) {
    // Do nothing if the request comes back with an API error.
    return;
  }
  if (options) {
    dispatch.receiveRegisteredPostMeta(postType, options?.schema?.properties?.meta?.properties);
  }
};

/**
 * Requests entity configs for the given kind from the REST API.
 *
 * @param {string} kind Entity kind.
 */
const resolvers_getEntitiesConfig = kind => async ({
  dispatch
}) => {
  const loader = additionalEntityConfigLoaders.find(l => l.kind === kind);
  if (!loader) {
    return;
  }
  try {
    const configs = await loader.loadEntities();
    if (!configs.length) {
      return;
    }
    dispatch.addEntities(configs);
  } catch {
    // Do nothing if the request comes back with an API error.
  }
};

;// ./packages/core-data/build-module/locks/utils.js
function deepCopyLocksTreePath(tree, path) {
  const newTree = {
    ...tree
  };
  let currentNode = newTree;
  for (const branchName of path) {
    currentNode.children = {
      ...currentNode.children,
      [branchName]: {
        locks: [],
        children: {},
        ...currentNode.children[branchName]
      }
    };
    currentNode = currentNode.children[branchName];
  }
  return newTree;
}
function getNode(tree, path) {
  let currentNode = tree;
  for (const branchName of path) {
    const nextNode = currentNode.children[branchName];
    if (!nextNode) {
      return null;
    }
    currentNode = nextNode;
  }
  return currentNode;
}
function* iteratePath(tree, path) {
  let currentNode = tree;
  yield currentNode;
  for (const branchName of path) {
    const nextNode = currentNode.children[branchName];
    if (!nextNode) {
      break;
    }
    yield nextNode;
    currentNode = nextNode;
  }
}
function* iterateDescendants(node) {
  const stack = Object.values(node.children);
  while (stack.length) {
    const childNode = stack.pop();
    yield childNode;
    stack.push(...Object.values(childNode.children));
  }
}
function hasConflictingLock({
  exclusive
}, locks) {
  if (exclusive && locks.length) {
    return true;
  }
  if (!exclusive && locks.filter(lock => lock.exclusive).length) {
    return true;
  }
  return false;
}

;// ./packages/core-data/build-module/locks/reducer.js
/**
 * Internal dependencies
 */

const DEFAULT_STATE = {
  requests: [],
  tree: {
    locks: [],
    children: {}
  }
};

/**
 * Reducer returning locks.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
function locks(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case 'ENQUEUE_LOCK_REQUEST':
      {
        const {
          request
        } = action;
        return {
          ...state,
          requests: [request, ...state.requests]
        };
      }
    case 'GRANT_LOCK_REQUEST':
      {
        const {
          lock,
          request
        } = action;
        const {
          store,
          path
        } = request;
        const storePath = [store, ...path];
        const newTree = deepCopyLocksTreePath(state.tree, storePath);
        const node = getNode(newTree, storePath);
        node.locks = [...node.locks, lock];
        return {
          ...state,
          requests: state.requests.filter(r => r !== request),
          tree: newTree
        };
      }
    case 'RELEASE_LOCK':
      {
        const {
          lock
        } = action;
        const storePath = [lock.store, ...lock.path];
        const newTree = deepCopyLocksTreePath(state.tree, storePath);
        const node = getNode(newTree, storePath);
        node.locks = node.locks.filter(l => l !== lock);
        return {
          ...state,
          tree: newTree
        };
      }
  }
  return state;
}

;// ./packages/core-data/build-module/locks/selectors.js
/**
 * Internal dependencies
 */

function getPendingLockRequests(state) {
  return state.requests;
}
function isLockAvailable(state, store, path, {
  exclusive
}) {
  const storePath = [store, ...path];
  const locks = state.tree;

  // Validate all parents and the node itself
  for (const node of iteratePath(locks, storePath)) {
    if (hasConflictingLock({
      exclusive
    }, node.locks)) {
      return false;
    }
  }

  // iteratePath terminates early if path is unreachable, let's
  // re-fetch the node and check it exists in the tree.
  const node = getNode(locks, storePath);
  if (!node) {
    return true;
  }

  // Validate all nested nodes
  for (const descendant of iterateDescendants(node)) {
    if (hasConflictingLock({
      exclusive
    }, descendant.locks)) {
      return false;
    }
  }
  return true;
}

;// ./packages/core-data/build-module/locks/engine.js
/**
 * Internal dependencies
 */


function createLocks() {
  let state = locks(undefined, {
    type: '@@INIT'
  });
  function processPendingLockRequests() {
    for (const request of getPendingLockRequests(state)) {
      const {
        store,
        path,
        exclusive,
        notifyAcquired
      } = request;
      if (isLockAvailable(state, store, path, {
        exclusive
      })) {
        const lock = {
          store,
          path,
          exclusive
        };
        state = locks(state, {
          type: 'GRANT_LOCK_REQUEST',
          lock,
          request
        });
        notifyAcquired(lock);
      }
    }
  }
  function acquire(store, path, exclusive) {
    return new Promise(resolve => {
      state = locks(state, {
        type: 'ENQUEUE_LOCK_REQUEST',
        request: {
          store,
          path,
          exclusive,
          notifyAcquired: resolve
        }
      });
      processPendingLockRequests();
    });
  }
  function release(lock) {
    state = locks(state, {
      type: 'RELEASE_LOCK',
      lock
    });
    processPendingLockRequests();
  }
  return {
    acquire,
    release
  };
}

;// ./packages/core-data/build-module/locks/actions.js
/**
 * Internal dependencies
 */

function createLocksActions() {
  const locks = createLocks();
  function __unstableAcquireStoreLock(store, path, {
    exclusive
  }) {
    return () => locks.acquire(store, path, exclusive);
  }
  function __unstableReleaseStoreLock(lock) {
    return () => locks.release(lock);
  }
  return {
    __unstableAcquireStoreLock,
    __unstableReleaseStoreLock
  };
}

;// ./packages/core-data/build-module/dynamic-entities.js
/**
 * Internal dependencies
 */

/**
 * A simple utility that pluralizes a string.
 * Converts:
 * - "post" to "posts"
 * - "taxonomy" to "taxonomies"
 * - "media" to "mediaItems"
 * - "status" to "statuses"
 *
 * It does not pluralize "GlobalStyles" due to lack of clarity about it at time of writing.
 */

/**
 * A simple utility that singularizes a string.
 *
 * Converts:
 * - "posts" to "post"
 * - "taxonomies" to "taxonomy"
 * - "mediaItems" to "media"
 * - "statuses" to "status"
 */

let dynamicActions;
let dynamicSelectors;

;// external ["wp","element"]
const external_wp_element_namespaceObject = window["wp"]["element"];
;// ./packages/core-data/build-module/entity-context.js
/**
 * WordPress dependencies
 */

const EntityContext = (0,external_wp_element_namespaceObject.createContext)({});
EntityContext.displayName = 'EntityContext';

;// external "ReactJSXRuntime"
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;// ./packages/core-data/build-module/entity-provider.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */


/**
 * Context provider component for providing
 * an entity for a specific entity.
 *
 * @param {Object} props          The component's props.
 * @param {string} props.kind     The entity kind.
 * @param {string} props.type     The entity name.
 * @param {number} props.id       The entity ID.
 * @param {*}      props.children The children to wrap.
 *
 * @return {Object} The provided children, wrapped with
 *                   the entity's context provider.
 */

function EntityProvider({
  kind,
  type: name,
  id,
  children
}) {
  const parent = (0,external_wp_element_namespaceObject.useContext)(EntityContext);
  const childContext = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    ...parent,
    [kind]: {
      ...parent?.[kind],
      [name]: id
    }
  }), [parent, kind, name, id]);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_namespaceObject.jsx)(EntityContext.Provider, {
    value: childContext,
    children: children
  });
}

;// ./node_modules/memize/dist/index.js
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

	function memoized(/* ...args */) {
		var node = head,
			len = arguments.length,
			args,
			i;

		searchCache: while (node) {
			// Perform a shallow equality test to confirm that whether the node
			// under test is a candidate for the arguments passed. Two arrays
			// are shallowly equal if their length matches and each entry is
			// strictly equal between the two sets. Avoid abstracting to a
			// function which could incur an arguments leaking deoptimization.

			// Check whether node arguments match arguments length
			if (node.args.length !== arguments.length) {
				node = node.next;
				continue;
			}

			// Check whether node arguments match arguments values
			for (i = 0; i < len; i++) {
				if (node.args[i] !== arguments[i]) {
					node = node.next;
					continue searchCache;
				}
			}

			// At this point we can assume we've found a match

			// Surface matched node to head if not already
			if (node !== head) {
				// As tail, shift to previous. Must only shift if not also
				// head, since if both head and tail, there is no previous.
				if (node === tail) {
					tail = node.prev;
				}

				// Adjust siblings to point to each other. If node was tail,
				// this also handles new tail's empty `next` assignment.
				/** @type {MemizeCacheNode} */ (node.prev).next = node.next;
				if (node.next) {
					node.next.prev = node.prev;
				}

				node.next = head;
				node.prev = null;
				/** @type {MemizeCacheNode} */ (head).prev = node;
				head = node;
			}

			// Return immediately
			return node.val;
		}

		// No cached value found. Continue to insertion phase:

		// Create a copy of arguments (avoid leaking deoptimization)
		args = new Array(len);
		for (i = 0; i < len; i++) {
			args[i] = arguments[i];
		}

		node = {
			args: args,

			// Generate the result from original function
			val: fn.apply(null, args),
		};

		// Don't need to check whether node is already head, since it would
		// have been returned above already if it was

		// Shift existing head down list
		if (head) {
			head.prev = node;
			node.next = head;
		} else {
			// If no head, follows that there's no tail (at initial or reset)
			tail = node;
		}

		// Trim tail if we're reached max size and are pending cache insertion
		if (size === /** @type {MemizeOptions} */ (options).maxSize) {
			tail = /** @type {MemizeCacheNode} */ (tail).prev;
			/** @type {MemizeCacheNode} */ (tail).next = null;
		} else {
			size++;
		}

		head = node;

		return node.val;
	}

	memoized.clear = function () {
		head = null;
		tail = null;
		size = 0;
	};

	// Ignore reason: There's not a clear solution to create an intersection of
	// the function with additional properties, where the goal is to retain the
	// function signature of the incoming argument and add control properties
	// on the return value.

	// @ts-ignore
	return memoized;
}



;// ./packages/core-data/build-module/hooks/memoize.js
/**
 * External dependencies
 */


// re-export due to restrictive esModuleInterop setting
/* harmony default export */ const memoize = (memize);

;// ./packages/core-data/build-module/hooks/constants.js
let Status = /*#__PURE__*/function (Status) {
  Status["Idle"] = "IDLE";
  Status["Resolving"] = "RESOLVING";
  Status["Error"] = "ERROR";
  Status["Success"] = "SUCCESS";
  return Status;
}({});

;// ./packages/core-data/build-module/hooks/use-query-select.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */


const META_SELECTORS = ['getIsResolving', 'hasStartedResolution', 'hasFinishedResolution', 'isResolving', 'getCachedResolvers'];
/**
 * Like useSelect, but the selectors return objects containing
 * both the original data AND the resolution info.
 *
 * @since 6.1.0 Introduced in WordPress core.
 * @private
 *
 * @param {Function} mapQuerySelect see useSelect
 * @param {Array}    deps           see useSelect
 *
 * @example
 * ```js
 * import { useQuerySelect } from '@wordpress/data';
 * import { store as coreDataStore } from '@wordpress/core-data';
 *
 * function PageTitleDisplay( { id } ) {
 *   const { data: page, isResolving } = useQuerySelect( ( query ) => {
 *     return query( coreDataStore ).getEntityRecord( 'postType', 'page', id )
 *   }, [ id ] );
 *
 *   if ( isResolving ) {
 *     return 'Loading...';
 *   }
 *
 *   return page.title;
 * }
 *
 * // Rendered in the application:
 * // <PageTitleDisplay id={ 10 } />
 * ```
 *
 * In the above example, when `PageTitleDisplay` is rendered into an
 * application, the page and the resolution details will be retrieved from
 * the store state using the `mapSelect` callback on `useQuerySelect`.
 *
 * If the id prop changes then any page in the state for that id is
 * retrieved. If the id prop doesn't change and other props are passed in
 * that do change, the title will not change because the dependency is just
 * the id.
 * @see useSelect
 *
 * @return {QuerySelectResponse} Queried data.
 */
function useQuerySelect(mapQuerySelect, deps) {
  return (0,external_wp_data_namespaceObject.useSelect)((select, registry) => {
    const resolve = store => enrichSelectors(select(store));
    return mapQuerySelect(resolve, registry);
  }, deps);
}
/**
 * Transform simple selectors into ones that return an object with the
 * original return value AND the resolution info.
 *
 * @param {Object} selectors Selectors to enrich
 * @return {EnrichedSelectors} Enriched selectors
 */
const enrichSelectors = memoize(selectors => {
  const resolvers = {};
  for (const selectorName in selectors) {
    if (META_SELECTORS.includes(selectorName)) {
      continue;
    }
    Object.defineProperty(resolvers, selectorName, {
      get: () => (...args) => {
        const data = selectors[selectorName](...args);
        const resolutionStatus = selectors.getResolutionState(selectorName, args)?.status;
        let status;
        switch (resolutionStatus) {
          case 'resolving':
            status = Status.Resolving;
            break;
          case 'finished':
            status = Status.Success;
            break;
          case 'error':
            status = Status.Error;
            break;
          case undefined:
            status = Status.Idle;
            break;
        }
        return {
          data,
          status,
          isResolving: status === Status.Resolving,
          hasStarted: status !== Status.Idle,
          hasResolved: status === Status.Success || status === Status.Error
        };
      }
    });
  }
  return resolvers;
});

;// ./packages/core-data/build-module/hooks/use-entity-record.js
/**
 * WordPress dependencies
 */




/**
 * Internal dependencies
 */


const use_entity_record_EMPTY_OBJECT = {};

/**
 * Resolves the specified entity record.
 *
 * @since 6.1.0 Introduced in WordPress core.
 *
 * @param    kind     Kind of the entity, e.g. `root` or a `postType`. See rootEntitiesConfig in ../entities.ts for a list of available kinds.
 * @param    name     Name of the entity, e.g. `plugin` or a `post`. See rootEntitiesConfig in ../entities.ts for a list of available names.
 * @param    recordId ID of the requested entity record.
 * @param    options  Optional hook options.
 * @example
 * ```js
 * import { useEntityRecord } from '@wordpress/core-data';
 *
 * function PageTitleDisplay( { id } ) {
 *   const { record, isResolving } = useEntityRecord( 'postType', 'page', id );
 *
 *   if ( isResolving ) {
 *     return 'Loading...';
 *   }
 *
 *   return record.title;
 * }
 *
 * // Rendered in the application:
 * // <PageTitleDisplay id={ 1 } />
 * ```
 *
 * In the above example, when `PageTitleDisplay` is rendered into an
 * application, the page and the resolution details will be retrieved from
 * the store state using `getEntityRecord()`, or resolved if missing.
 *
 * @example
 * ```js
 * import { useCallback } from 'react';
 * import { useDispatch } from '@wordpress/data';
 * import { __ } from '@wordpress/i18n';
 * import { TextControl } from '@wordpress/components';
 * import { store as noticeStore } from '@wordpress/notices';
 * import { useEntityRecord } from '@wordpress/core-data';
 *
 * function PageRenameForm( { id } ) {
 * 	const page = useEntityRecord( 'postType', 'page', id );
 * 	const { createSuccessNotice, createErrorNotice } =
 * 		useDispatch( noticeStore );
 *
 * 	const setTitle = useCallback( ( title ) => {
 * 		page.edit( { title } );
 * 	}, [ page.edit ] );
 *
 * 	if ( page.isResolving ) {
 * 		return 'Loading...';
 * 	}
 *
 * 	async function onRename( event ) {
 * 		event.preventDefault();
 * 		try {
 * 			await page.save();
 * 			createSuccessNotice( __( 'Page renamed.' ), {
 * 				type: 'snackbar',
 * 			} );
 * 		} catch ( error ) {
 * 			createErrorNotice( error.message, { type: 'snackbar' } );
 * 		}
 * 	}
 *
 * 	return (
 * 		<form onSubmit={ onRename }>
 * 			<TextControl
 *				__nextHasNoMarginBottom
 *				__next40pxDefaultSize
 * 				label={ __( 'Name' ) }
 * 				value={ page.editedRecord.title }
 * 				onChange={ setTitle }
 * 			/>
 * 			<button type="submit">{ __( 'Save' ) }</button>
 * 		</form>
 * 	);
 * }
 *
 * // Rendered in the application:
 * // <PageRenameForm id={ 1 } />
 * ```
 *
 * In the above example, updating and saving the page title is handled
 * via the `edit()` and `save()` mutation helpers provided by
 * `useEntityRecord()`;
 *
 * @return Entity record data.
 * @template RecordType
 */
function useEntityRecord(kind, name, recordId, options = {
  enabled: true
}) {
  const {
    editEntityRecord,
    saveEditedEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  const mutations = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    edit: (record, editOptions = {}) => editEntityRecord(kind, name, recordId, record, editOptions),
    save: (saveOptions = {}) => saveEditedEntityRecord(kind, name, recordId, {
      throwOnError: true,
      ...saveOptions
    })
  }), [editEntityRecord, kind, name, recordId, saveEditedEntityRecord]);
  const {
    editedRecord,
    hasEdits,
    edits
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (!options.enabled) {
      return {
        editedRecord: use_entity_record_EMPTY_OBJECT,
        hasEdits: false,
        edits: use_entity_record_EMPTY_OBJECT
      };
    }
    return {
      editedRecord: select(store).getEditedEntityRecord(kind, name, recordId),
      hasEdits: select(store).hasEditsForEntityRecord(kind, name, recordId),
      edits: select(store).getEntityRecordNonTransientEdits(kind, name, recordId)
    };
  }, [kind, name, recordId, options.enabled]);
  const {
    data: record,
    ...querySelectRest
  } = useQuerySelect(query => {
    if (!options.enabled) {
      return {
        data: null
      };
    }
    return query(store).getEntityRecord(kind, name, recordId);
  }, [kind, name, recordId, options.enabled]);
  return {
    record,
    editedRecord,
    hasEdits,
    edits,
    ...querySelectRest,
    ...mutations
  };
}
function __experimentalUseEntityRecord(kind, name, recordId, options) {
  external_wp_deprecated_default()(`wp.data.__experimentalUseEntityRecord`, {
    alternative: 'wp.data.useEntityRecord',
    since: '6.1'
  });
  return useEntityRecord(kind, name, recordId, options);
}

;// ./packages/core-data/build-module/hooks/use-entity-records.js
/**
 * WordPress dependencies
 */





/**
 * Internal dependencies
 */




const EMPTY_ARRAY = [];

/**
 * Resolves the specified entity records.
 *
 * @since 6.1.0 Introduced in WordPress core.
 *
 * @param    kind      Kind of the entity, e.g. `root` or a `postType`. See rootEntitiesConfig in ../entities.ts for a list of available kinds.
 * @param    name      Name of the entity, e.g. `plugin` or a `post`. See rootEntitiesConfig in ../entities.ts for a list of available names.
 * @param    queryArgs Optional HTTP query description for how to fetch the data, passed to the requested API endpoint.
 * @param    options   Optional hook options.
 * @example
 * ```js
 * import { useEntityRecords } from '@wordpress/core-data';
 *
 * function PageTitlesList() {
 *   const { records, isResolving } = useEntityRecords( 'postType', 'page' );
 *
 *   if ( isResolving ) {
 *     return 'Loading...';
 *   }
 *
 *   return (
 *     <ul>
 *       {records.map(( page ) => (
 *         <li>{ page.title }</li>
 *       ))}
 *     </ul>
 *   );
 * }
 *
 * // Rendered in the application:
 * // <PageTitlesList />
 * ```
 *
 * In the above example, when `PageTitlesList` is rendered into an
 * application, the list of records and the resolution details will be retrieved from
 * the store state using `getEntityRecords()`, or resolved if missing.
 *
 * @return Entity records data.
 * @template RecordType
 */
function useEntityRecords(kind, name, queryArgs = {}, options = {
  enabled: true
}) {
  // Serialize queryArgs to a string that can be safely used as a React dep.
  // We can't just pass queryArgs as one of the deps, because if it is passed
  // as an object literal, then it will be a different object on each call even
  // if the values remain the same.
  const queryAsString = (0,external_wp_url_namespaceObject.addQueryArgs)('', queryArgs);
  const {
    data: records,
    ...rest
  } = useQuerySelect(query => {
    if (!options.enabled) {
      return {
        // Avoiding returning a new reference on every execution.
        data: EMPTY_ARRAY
      };
    }
    return query(store).getEntityRecords(kind, name, queryArgs);
  }, [kind, name, queryAsString, options.enabled]);
  const {
    totalItems,
    totalPages
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (!options.enabled) {
      return {
        totalItems: null,
        totalPages: null
      };
    }
    return {
      totalItems: select(store).getEntityRecordsTotalItems(kind, name, queryArgs),
      totalPages: select(store).getEntityRecordsTotalPages(kind, name, queryArgs)
    };
  }, [kind, name, queryAsString, options.enabled]);
  return {
    records,
    totalItems,
    totalPages,
    ...rest
  };
}
function __experimentalUseEntityRecords(kind, name, queryArgs, options) {
  external_wp_deprecated_default()(`wp.data.__experimentalUseEntityRecords`, {
    alternative: 'wp.data.useEntityRecords',
    since: '6.1'
  });
  return useEntityRecords(kind, name, queryArgs, options);
}
function useEntityRecordsWithPermissions(kind, name, queryArgs = {}, options = {
  enabled: true
}) {
  const entityConfig = (0,external_wp_data_namespaceObject.useSelect)(select => select(store).getEntityConfig(kind, name), [kind, name]);
  const {
    records: data,
    ...ret
  } = useEntityRecords(kind, name, {
    ...queryArgs,
    // If _fields is provided, we need to include _links in the request for permission caching to work.
    ...(queryArgs._fields ? {
      _fields: [...new Set([...(get_normalized_comma_separable(queryArgs._fields) || []), '_links'])].join()
    } : {})
  }, options);
  const ids = (0,external_wp_element_namespaceObject.useMemo)(() => {
    var _data$map;
    return (_data$map = data?.map(
    // @ts-ignore
    record => {
      var _entityConfig$key;
      return record[(_entityConfig$key = entityConfig?.key) !== null && _entityConfig$key !== void 0 ? _entityConfig$key : 'id'];
    })) !== null && _data$map !== void 0 ? _data$map : [];
  }, [data, entityConfig?.key]);
  const permissions = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecordsPermissions
    } = unlock(select(store));
    return getEntityRecordsPermissions(kind, name, ids);
  }, [ids, kind, name]);
  const dataWithPermissions = (0,external_wp_element_namespaceObject.useMemo)(() => {
    var _data$map2;
    return (_data$map2 = data?.map((record, index) => ({
      // @ts-ignore
      ...record,
      permissions: permissions[index]
    }))) !== null && _data$map2 !== void 0 ? _data$map2 : [];
  }, [data, permissions]);
  return {
    records: dataWithPermissions,
    ...ret
  };
}

;// external ["wp","warning"]
const external_wp_warning_namespaceObject = window["wp"]["warning"];
;// ./packages/core-data/build-module/hooks/use-resource-permissions.js
/**
 * WordPress dependencies
 */



/**
 * Internal dependencies
 */




/**
 * Is the data resolved by now?
 */

/**
 * Resolves resource permissions.
 *
 * @since 6.1.0 Introduced in WordPress core.
 *
 * @param    resource Entity resource to check. Accepts entity object `{ kind: 'postType', name: 'attachment', id: 1 }`
 *                    or REST base as a string - `media`.
 * @param    id       Optional ID of the resource to check, e.g. 10. Note: This argument is discouraged
 *                    when using an entity object as a resource to check permissions and will be ignored.
 *
 * @example
 * ```js
 * import { useResourcePermissions } from '@wordpress/core-data';
 *
 * function PagesList() {
 *   const { canCreate, isResolving } = useResourcePermissions( { kind: 'postType', name: 'page' } );
 *
 *   if ( isResolving ) {
 *     return 'Loading ...';
 *   }
 *
 *   return (
 *     <div>
 *       {canCreate ? (<button>+ Create a new page</button>) : false}
 *       // ...
 *     </div>
 *   );
 * }
 *
 * // Rendered in the application:
 * // <PagesList />
 * ```
 *
 * @example
 * ```js
 * import { useResourcePermissions } from '@wordpress/core-data';
 *
 * function Page({ pageId }) {
 *   const {
 *     canCreate,
 *     canUpdate,
 *     canDelete,
 *     isResolving
 *   } = useResourcePermissions( { kind: 'postType', name: 'page', id: pageId } );
 *
 *   if ( isResolving ) {
 *     return 'Loading ...';
 *   }
 *
 *   return (
 *     <div>
 *       {canCreate ? (<button>+ Create a new page</button>) : false}
 *       {canUpdate ? (<button>Edit page</button>) : false}
 *       {canDelete ? (<button>Delete page</button>) : false}
 *       // ...
 *     </div>
 *   );
 * }
 *
 * // Rendered in the application:
 * // <Page pageId={ 15 } />
 * ```
 *
 * In the above example, when `PagesList` is rendered into an
 * application, the appropriate permissions and the resolution details will be retrieved from
 * the store state using `canUser()`, or resolved if missing.
 *
 * @return Entity records data.
 * @template IdType
 */
function useResourcePermissions(resource, id) {
  // Serialize `resource` to a string that can be safely used as a React dep.
  // We can't just pass `resource` as one of the deps, because if it is passed
  // as an object literal, then it will be a different object on each call even
  // if the values remain the same.
  const isEntity = typeof resource === 'object';
  const resourceAsString = isEntity ? JSON.stringify(resource) : resource;
  if (isEntity && typeof id !== 'undefined') {
     false ? 0 : void 0;
  }
  return useQuerySelect(resolve => {
    const hasId = isEntity ? !!resource.id : !!id;
    const {
      canUser
    } = resolve(store);
    const create = canUser('create', isEntity ? {
      kind: resource.kind,
      name: resource.name
    } : resource);
    if (!hasId) {
      const read = canUser('read', resource);
      const isResolving = create.isResolving || read.isResolving;
      const hasResolved = create.hasResolved && read.hasResolved;
      let status = Status.Idle;
      if (isResolving) {
        status = Status.Resolving;
      } else if (hasResolved) {
        status = Status.Success;
      }
      return {
        status,
        isResolving,
        hasResolved,
        canCreate: create.hasResolved && create.data,
        canRead: read.hasResolved && read.data
      };
    }
    const read = canUser('read', resource, id);
    const update = canUser('update', resource, id);
    const _delete = canUser('delete', resource, id);
    const isResolving = read.isResolving || create.isResolving || update.isResolving || _delete.isResolving;
    const hasResolved = read.hasResolved && create.hasResolved && update.hasResolved && _delete.hasResolved;
    let status = Status.Idle;
    if (isResolving) {
      status = Status.Resolving;
    } else if (hasResolved) {
      status = Status.Success;
    }
    return {
      status,
      isResolving,
      hasResolved,
      canRead: hasResolved && read.data,
      canCreate: hasResolved && create.data,
      canUpdate: hasResolved && update.data,
      canDelete: hasResolved && _delete.data
    };
  }, [resourceAsString, id]);
}
/* harmony default export */ const use_resource_permissions = (useResourcePermissions);
function __experimentalUseResourcePermissions(resource, id) {
  external_wp_deprecated_default()(`wp.data.__experimentalUseResourcePermissions`, {
    alternative: 'wp.data.useResourcePermissions',
    since: '6.1'
  });
  return useResourcePermissions(resource, id);
}

;// ./packages/core-data/build-module/hooks/use-entity-id.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */


/**
 * Hook that returns the ID for the nearest
 * provided entity of the specified type.
 *
 * @param {string} kind The entity kind.
 * @param {string} name The entity name.
 */
function useEntityId(kind, name) {
  const context = (0,external_wp_element_namespaceObject.useContext)(EntityContext);
  return context?.[kind]?.[name];
}

;// external ["wp","blockEditor"]
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// ./packages/core-data/build-module/footnotes/get-rich-text-values-cached.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */


// TODO: The following line should have been:
//
//   const unlockedApis = unlock( blockEditorPrivateApis );
//
// But there are hidden circular dependencies in RNMobile code, specifically in
// certain native components in the `components` package that depend on
// `block-editor`. What follows is a workaround that defers the `unlock` call
// to prevent native code from failing.
//
// Fix once https://github.com/WordPress/gutenberg/issues/52692 is closed.
let unlockedApis;
const cache = new WeakMap();
function getRichTextValuesCached(block) {
  if (!unlockedApis) {
    unlockedApis = unlock(external_wp_blockEditor_namespaceObject.privateApis);
  }
  if (!cache.has(block)) {
    const values = unlockedApis.getRichTextValues([block]);
    cache.set(block, values);
  }
  return cache.get(block);
}

;// ./packages/core-data/build-module/footnotes/get-footnotes-order.js
/**
 * Internal dependencies
 */

const get_footnotes_order_cache = new WeakMap();
function getBlockFootnotesOrder(block) {
  if (!get_footnotes_order_cache.has(block)) {
    const order = [];
    for (const value of getRichTextValuesCached(block)) {
      if (!value) {
        continue;
      }

      // replacements is a sparse array, use forEach to skip empty slots.
      value.replacements.forEach(({
        type,
        attributes
      }) => {
        if (type === 'core/footnote') {
          order.push(attributes['data-fn']);
        }
      });
    }
    get_footnotes_order_cache.set(block, order);
  }
  return get_footnotes_order_cache.get(block);
}
function getFootnotesOrder(blocks) {
  // We can only separate getting order from blocks at the root level. For
  // deeper inner blocks, this will not work since it's possible to have both
  // inner blocks and block attributes, so order needs to be computed from the
  // Edit functions as a whole.
  return blocks.flatMap(getBlockFootnotesOrder);
}

;// ./packages/core-data/build-module/footnotes/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

let oldFootnotes = {};
function updateFootnotesFromMeta(blocks, meta) {
  const output = {
    blocks
  };
  if (!meta) {
    return output;
  }

  // If meta.footnotes is empty, it means the meta is not registered.
  if (meta.footnotes === undefined) {
    return output;
  }
  const newOrder = getFootnotesOrder(blocks);
  const footnotes = meta.footnotes ? JSON.parse(meta.footnotes) : [];
  const currentOrder = footnotes.map(fn => fn.id);
  if (currentOrder.join('') === newOrder.join('')) {
    return output;
  }
  const newFootnotes = newOrder.map(fnId => footnotes.find(fn => fn.id === fnId) || oldFootnotes[fnId] || {
    id: fnId,
    content: ''
  });
  function updateAttributes(attributes) {
    // Only attempt to update attributes, if attributes is an object.
    if (!attributes || Array.isArray(attributes) || typeof attributes !== 'object') {
      return attributes;
    }
    attributes = {
      ...attributes
    };
    for (const key in attributes) {
      const value = attributes[key];
      if (Array.isArray(value)) {
        attributes[key] = value.map(updateAttributes);
        continue;
      }

      // To do, remove support for string values?
      if (typeof value !== 'string' && !(value instanceof external_wp_richText_namespaceObject.RichTextData)) {
        continue;
      }
      const richTextValue = typeof value === 'string' ? external_wp_richText_namespaceObject.RichTextData.fromHTMLString(value) : new external_wp_richText_namespaceObject.RichTextData(value);
      let hasFootnotes = false;
      richTextValue.replacements.forEach(replacement => {
        if (replacement.type === 'core/footnote') {
          const id = replacement.attributes['data-fn'];
          const index = newOrder.indexOf(id);
          // The innerHTML contains the count wrapped in a link.
          const countValue = (0,external_wp_richText_namespaceObject.create)({
            html: replacement.innerHTML
          });
          countValue.text = String(index + 1);
          countValue.formats = Array.from({
            length: countValue.text.length
          }, () => countValue.formats[0]);
          countValue.replacements = Array.from({
            length: countValue.text.length
          }, () => countValue.replacements[0]);
          replacement.innerHTML = (0,external_wp_richText_namespaceObject.toHTMLString)({
            value: countValue
          });
          hasFootnotes = true;
        }
      });
      if (hasFootnotes) {
        attributes[key] = typeof value === 'string' ? richTextValue.toHTMLString() : richTextValue;
      }
    }
    return attributes;
  }
  function updateBlocksAttributes(__blocks) {
    return __blocks.map(block => {
      return {
        ...block,
        attributes: updateAttributes(block.attributes),
        innerBlocks: updateBlocksAttributes(block.innerBlocks)
      };
    });
  }

  // We need to go through all block attributes deeply and update the
  // footnote anchor numbering (textContent) to match the new order.
  const newBlocks = updateBlocksAttributes(blocks);
  oldFootnotes = {
    ...oldFootnotes,
    ...footnotes.reduce((acc, fn) => {
      if (!newOrder.includes(fn.id)) {
        acc[fn.id] = fn;
      }
      return acc;
    }, {})
  };
  return {
    meta: {
      ...meta,
      footnotes: JSON.stringify(newFootnotes)
    },
    blocks: newBlocks
  };
}

;// ./packages/core-data/build-module/hooks/use-entity-block-editor.js
/**
 * WordPress dependencies
 */




/**
 * Internal dependencies
 */



const use_entity_block_editor_EMPTY_ARRAY = [];
const parsedBlocksCache = new WeakMap();

/**
 * Hook that returns block content getters and setters for
 * the nearest provided entity of the specified type.
 *
 * The return value has the shape `[ blocks, onInput, onChange ]`.
 * `onInput` is for block changes that don't create undo levels
 * or dirty the post, non-persistent changes, and `onChange` is for
 * persistent changes. They map directly to the props of a
 * `BlockEditorProvider` and are intended to be used with it,
 * or similar components or hooks.
 *
 * @param {string} kind         The entity kind.
 * @param {string} name         The entity name.
 * @param {Object} options
 * @param {string} [options.id] An entity ID to use instead of the context-provided one.
 *
 * @return {[unknown[], Function, Function]} The block array and setters.
 */
function useEntityBlockEditor(kind, name, {
  id: _id
} = {}) {
  const providerId = useEntityId(kind, name);
  const id = _id !== null && _id !== void 0 ? _id : providerId;
  const {
    getEntityRecord,
    getEntityRecordEdits
  } = (0,external_wp_data_namespaceObject.useSelect)(STORE_NAME);
  const {
    content,
    editedBlocks,
    meta
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    if (!id) {
      return {};
    }
    const {
      getEditedEntityRecord
    } = select(STORE_NAME);
    const editedRecord = getEditedEntityRecord(kind, name, id);
    return {
      editedBlocks: editedRecord.blocks,
      content: editedRecord.content,
      meta: editedRecord.meta
    };
  }, [kind, name, id]);
  const {
    __unstableCreateUndoLevel,
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(STORE_NAME);
  const blocks = (0,external_wp_element_namespaceObject.useMemo)(() => {
    if (!id) {
      return undefined;
    }
    if (editedBlocks) {
      return editedBlocks;
    }
    if (!content || typeof content !== 'string') {
      return use_entity_block_editor_EMPTY_ARRAY;
    }

    // If there's an edit, cache the parsed blocks by the edit.
    // If not, cache by the original entity record.
    const edits = getEntityRecordEdits(kind, name, id);
    const isUnedited = !edits || !Object.keys(edits).length;
    const cackeKey = isUnedited ? getEntityRecord(kind, name, id) : edits;
    let _blocks = parsedBlocksCache.get(cackeKey);
    if (!_blocks) {
      _blocks = (0,external_wp_blocks_namespaceObject.parse)(content);
      parsedBlocksCache.set(cackeKey, _blocks);
    }
    return _blocks;
  }, [kind, name, id, editedBlocks, content, getEntityRecord, getEntityRecordEdits]);
  const onChange = (0,external_wp_element_namespaceObject.useCallback)((newBlocks, options) => {
    const noChange = blocks === newBlocks;
    if (noChange) {
      return __unstableCreateUndoLevel(kind, name, id);
    }
    const {
      selection,
      ...rest
    } = options;

    // We create a new function here on every persistent edit
    // to make sure the edit makes the post dirty and creates
    // a new undo level.
    const edits = {
      selection,
      content: ({
        blocks: blocksForSerialization = []
      }) => (0,external_wp_blocks_namespaceObject.__unstableSerializeAndClean)(blocksForSerialization),
      ...updateFootnotesFromMeta(newBlocks, meta)
    };
    editEntityRecord(kind, name, id, edits, {
      isCached: false,
      ...rest
    });
  }, [kind, name, id, blocks, meta, __unstableCreateUndoLevel, editEntityRecord]);
  const onInput = (0,external_wp_element_namespaceObject.useCallback)((newBlocks, options) => {
    const {
      selection,
      ...rest
    } = options;
    const footnotesChanges = updateFootnotesFromMeta(newBlocks, meta);
    const edits = {
      selection,
      ...footnotesChanges
    };
    editEntityRecord(kind, name, id, edits, {
      isCached: true,
      ...rest
    });
  }, [kind, name, id, meta, editEntityRecord]);
  return [blocks, onInput, onChange];
}

;// ./packages/core-data/build-module/hooks/use-entity-prop.js
/**
 * WordPress dependencies
 */



/**
 * Internal dependencies
 */



/**
 * Hook that returns the value and a setter for the
 * specified property of the nearest provided
 * entity of the specified type.
 *
 * @param {string}        kind  The entity kind.
 * @param {string}        name  The entity name.
 * @param {string}        prop  The property name.
 * @param {number|string} [_id] An entity ID to use instead of the context-provided one.
 *
 * @return {[*, Function, *]} An array where the first item is the
 *                            property value, the second is the
 *                            setter and the third is the full value
 * 							  object from REST API containing more
 * 							  information like `raw`, `rendered` and
 * 							  `protected` props.
 */
function useEntityProp(kind, name, prop, _id) {
  const providerId = useEntityId(kind, name);
  const id = _id !== null && _id !== void 0 ? _id : providerId;
  const {
    value,
    fullValue
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getEntityRecord,
      getEditedEntityRecord
    } = select(STORE_NAME);
    const record = getEntityRecord(kind, name, id); // Trigger resolver.
    const editedRecord = getEditedEntityRecord(kind, name, id);
    return record && editedRecord ? {
      value: editedRecord[prop],
      fullValue: record[prop]
    } : {};
  }, [kind, name, id, prop]);
  const {
    editEntityRecord
  } = (0,external_wp_data_namespaceObject.useDispatch)(STORE_NAME);
  const setValue = (0,external_wp_element_namespaceObject.useCallback)(newValue => {
    editEntityRecord(kind, name, id, {
      [prop]: newValue
    });
  }, [editEntityRecord, kind, name, id, prop]);
  return [value, setValue, fullValue];
}

;// ./packages/core-data/build-module/hooks/index.js
/**
 * Internal dependencies
 */

/**
 * Utility type that adds permissions to any record type.
 */








;// ./packages/core-data/build-module/private-apis.js
/**
 * Internal dependencies
 */



const privateApis = {};
lock(privateApis, {
  useEntityRecordsWithPermissions: useEntityRecordsWithPermissions,
  RECEIVE_INTERMEDIATE_RESULTS: RECEIVE_INTERMEDIATE_RESULTS
});

;// ./packages/core-data/build-module/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */













// The entity selectors/resolvers and actions are shortcuts to their generic equivalents
// (getEntityRecord, getEntityRecords, updateEntityRecord, updateEntityRecords)
// Instead of getEntityRecord, the consumer could use more user-friendly named selector: getPostType, getTaxonomy...
// The "kind" and the "name" of the entity are combined to generate these shortcuts.
const build_module_entitiesConfig = [...rootEntitiesConfig, ...additionalEntityConfigLoaders.filter(config => !!config.name)];
const entitySelectors = build_module_entitiesConfig.reduce((result, entity) => {
  const {
    kind,
    name,
    plural
  } = entity;
  const getEntityRecordMethodName = getMethodName(kind, name);
  result[getEntityRecordMethodName] = (state, key, query) => {
    logEntityDeprecation(kind, name, getEntityRecordMethodName, {
      isShorthandSelector: true,
      alternativeFunctionName: 'getEntityRecord'
    });
    return getEntityRecord(state, kind, name, key, query);
  };
  if (plural) {
    const getEntityRecordsMethodName = getMethodName(kind, plural, 'get');
    result[getEntityRecordsMethodName] = (state, query) => {
      logEntityDeprecation(kind, name, getEntityRecordsMethodName, {
        isShorthandSelector: true,
        alternativeFunctionName: 'getEntityRecords'
      });
      return getEntityRecords(state, kind, name, query);
    };
  }
  return result;
}, {});
const entityResolvers = build_module_entitiesConfig.reduce((result, entity) => {
  const {
    kind,
    name,
    plural
  } = entity;
  const getEntityRecordMethodName = getMethodName(kind, name);
  result[getEntityRecordMethodName] = (key, query) => {
    logEntityDeprecation(kind, name, getEntityRecordMethodName, {
      isShorthandSelector: true,
      alternativeFunctionName: 'getEntityRecord'
    });
    return resolvers_getEntityRecord(kind, name, key, query);
  };
  if (plural) {
    const getEntityRecordsMethodName = getMethodName(kind, plural, 'get');
    result[getEntityRecordsMethodName] = (...args) => {
      logEntityDeprecation(kind, plural, getEntityRecordsMethodName, {
        isShorthandSelector: true,
        alternativeFunctionName: 'getEntityRecords'
      });
      return resolvers_getEntityRecords(kind, name, ...args);
    };
    result[getEntityRecordsMethodName].shouldInvalidate = action => resolvers_getEntityRecords.shouldInvalidate(action, kind, name);
  }
  return result;
}, {});
const entityActions = build_module_entitiesConfig.reduce((result, entity) => {
  const {
    kind,
    name
  } = entity;
  const saveEntityRecordMethodName = getMethodName(kind, name, 'save');
  result[saveEntityRecordMethodName] = (record, options) => {
    logEntityDeprecation(kind, name, saveEntityRecordMethodName, {
      isShorthandSelector: true,
      alternativeFunctionName: 'saveEntityRecord'
    });
    return saveEntityRecord(kind, name, record, options);
  };
  const deleteEntityRecordMethodName = getMethodName(kind, name, 'delete');
  result[deleteEntityRecordMethodName] = (key, query, options) => {
    logEntityDeprecation(kind, name, deleteEntityRecordMethodName, {
      isShorthandSelector: true,
      alternativeFunctionName: 'deleteEntityRecord'
    });
    return deleteEntityRecord(kind, name, key, query, options);
  };
  return result;
}, {});
const storeConfig = () => ({
  reducer: build_module_reducer,
  actions: {
    ...dynamicActions,
    ...build_module_actions_namespaceObject,
    ...entityActions,
    ...createLocksActions()
  },
  selectors: {
    ...dynamicSelectors,
    ...build_module_selectors_namespaceObject,
    ...entitySelectors
  },
  resolvers: {
    ...resolvers_namespaceObject,
    ...entityResolvers
  }
});

/**
 * Store definition for the code data namespace.
 *
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
 */
const store = (0,external_wp_data_namespaceObject.createReduxStore)(STORE_NAME, storeConfig());
unlock(store).registerPrivateSelectors(private_selectors_namespaceObject);
unlock(store).registerPrivateActions(private_actions_namespaceObject);
(0,external_wp_data_namespaceObject.register)(store); // Register store after unlocking private selectors to allow resolvers to use them.








})();

(window.wp = window.wp || {}).coreData = __webpack_exports__;
/******/ })()
;