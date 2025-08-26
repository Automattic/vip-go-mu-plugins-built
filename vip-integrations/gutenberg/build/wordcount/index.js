/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
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
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  count: () => (/* binding */ count)
});

;// ./packages/wordcount/build-module/defaultSettings.js
/**
 * Internal dependencies
 */

/**
 * Default settings for word counting operations.
 */
const defaultSettings = {
  HTMLRegExp: /<\/?[a-z][^>]*?>/gi,
  HTMLcommentRegExp: /<!--[\s\S]*?-->/g,
  spaceRegExp: /&nbsp;|&#160;/gi,
  HTMLEntityRegExp: /&\S+?;/g,
  // \u2014 = em-dash.
  connectorRegExp: /--|\u2014/g,
  // Characters to be removed from input text.
  removeRegExp: new RegExp(['[',
  // Basic Latin (extract)
  '\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E',
  // Latin-1 Supplement (extract)
  '\u0080-\u00BF\u00D7\u00F7',
  /*
   * The following range consists of:
   * General Punctuation
   * Superscripts and Subscripts
   * Currency Symbols
   * Combining Diacritical Marks for Symbols
   * Letterlike Symbols
   * Number Forms
   * Arrows
   * Mathematical Operators
   * Miscellaneous Technical
   * Control Pictures
   * Optical Character Recognition
   * Enclosed Alphanumerics
   * Box Drawing
   * Block Elements
   * Geometric Shapes
   * Miscellaneous Symbols
   * Dingbats
   * Miscellaneous Mathematical Symbols-A
   * Supplemental Arrows-A
   * Braille Patterns
   * Supplemental Arrows-B
   * Miscellaneous Mathematical Symbols-B
   * Supplemental Mathematical Operators
   * Miscellaneous Symbols and Arrows
   */
  '\u2000-\u2BFF',
  // Supplemental Punctuation.
  '\u2E00-\u2E7F', ']'].join(''), 'g'),
  // Remove UTF-16 surrogate points, see https://en.wikipedia.org/wiki/UTF-16#U.2BD800_to_U.2BDFFF
  astralRegExp: /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
  wordsRegExp: /\S\s+/g,
  characters_excluding_spacesRegExp: /\S/g,
  /*
   * Match anything that is not a formatting character, excluding:
   * \f = form feed
   * \n = new line
   * \r = carriage return
   * \t = tab
   * \v = vertical tab
   * \u00AD = soft hyphen
   * \u2028 = line separator
   * \u2029 = paragraph separator
   */
  characters_including_spacesRegExp: /[^\f\n\r\t\v\u00AD\u2028\u2029]/g,
  l10n: {
    type: 'words'
  }
};

;// ./packages/wordcount/build-module/stripTags.js
/**
 * Internal dependencies
 */

/**
 * Replaces items matched in the regex with new line
 *
 * @param settings The main settings object containing regular expressions
 * @param text     The string being counted.
 * @return The manipulated text.
 */
function stripTags(settings, text) {
  return text.replace(settings.HTMLRegExp, '\n');
}

;// ./packages/wordcount/build-module/transposeAstralsToCountableChar.js
/**
 * Internal dependencies
 */

/**
 * Replaces items matched in the regex with a single character.
 *
 * @param settings The main settings object containing regular expressions
 * @param text     The string being counted.
 * @return The manipulated text.
 */
function transposeAstralsToCountableChar(settings, text) {
  return text.replace(settings.astralRegExp, 'a');
}

;// ./packages/wordcount/build-module/stripHTMLEntities.js
/**
 * Internal dependencies
 */

/**
 * Removes items matched in the regex.
 *
 * @param settings The main settings object containing regular expressions
 * @param text     The string being counted.
 * @return The manipulated text.
 */
function stripHTMLEntities(settings, text) {
  return text.replace(settings.HTMLEntityRegExp, '');
}

;// ./packages/wordcount/build-module/stripConnectors.js
/**
 * Internal dependencies
 */

/**
 * Replaces items matched in the regex with spaces.
 *
 * @param settings The main settings object containing regular expressions
 * @param text     The string being counted.
 * @return The manipulated text.
 */
function stripConnectors(settings, text) {
  return text.replace(settings.connectorRegExp, ' ');
}

;// ./packages/wordcount/build-module/stripRemovables.js
/**
 * Internal dependencies
 */

/**
 * Replaces items matched in the regex with spaces.
 *
 * @param settings The main settings object containing regular expressions
 * @param text     The string being counted.
 * @return The manipulated text.
 */
function stripRemovables(settings, text) {
  return text.replace(settings.removeRegExp, '');
}

;// ./packages/wordcount/build-module/stripHTMLComments.js
/**
 * Internal dependencies
 */

/**
 * Replaces items matched in the regex with new line.
 *
 * @param settings The main settings object containing regular expressions
 * @param text     The string being counted.
 * @return The manipulated text.
 */
function stripHTMLComments(settings, text) {
  return text.replace(settings.HTMLcommentRegExp, '');
}

;// ./packages/wordcount/build-module/stripShortcodes.js
/**
 * Internal dependencies
 */

/**
 * Replaces items matched in the regex with a new line.
 *
 * @param settings The main settings object containing regular expressions
 * @param text     The string being counted.
 * @return The manipulated text.
 */
function stripShortcodes(settings, text) {
  if (settings.shortcodesRegExp) {
    return text.replace(settings.shortcodesRegExp, '\n');
  }
  return text;
}

;// ./packages/wordcount/build-module/stripSpaces.js
/**
 * Internal dependencies
 */

/**
 * Replaces items matched in the regex with spaces.
 *
 * @param settings The main settings object containing regular expressions
 * @param text     The string being counted.
 * @return The manipulated text.
 */
function stripSpaces(settings, text) {
  return text.replace(settings.spaceRegExp, ' ');
}

;// ./packages/wordcount/build-module/transposeHTMLEntitiesToCountableChars.js
/**
 * Internal dependencies
 */

/**
 * Replaces items matched in the regex with a single character.
 *
 * @param settings The main settings object containing regular expressions
 * @param text     The string being counted.
 * @return The manipulated text.
 */
function transposeHTMLEntitiesToCountableChars(settings, text) {
  return text.replace(settings.HTMLEntityRegExp, 'a');
}

;// ./packages/wordcount/build-module/index.js
/**
 * Internal dependencies
 */










/**
 * Private function to manage the settings.
 *
 * @param type         The type of count to be done.
 * @param userSettings Custom settings for the count.
 * @return The combined settings object to be used.
 */
function loadSettings(type = 'words', userSettings = {}) {
  var _settings$l10n$shortc;
  const mergedSettings = {
    ...defaultSettings,
    ...userSettings
  };
  const settings = {
    ...mergedSettings,
    type,
    shortcodes: []
  };
  settings.shortcodes = (_settings$l10n$shortc = settings.l10n?.shortcodes) !== null && _settings$l10n$shortc !== void 0 ? _settings$l10n$shortc : [];
  if (settings.shortcodes && settings.shortcodes.length) {
    settings.shortcodesRegExp = new RegExp('\\[\\/?(?:' + settings.shortcodes.join('|') + ')[^\\]]*?\\]', 'g');
  }
  if (settings.type !== 'characters_excluding_spaces' && settings.type !== 'characters_including_spaces') {
    settings.type = 'words';
  }
  return settings;
}

/**
 * Count the words in text
 *
 * @param text     The text being processed
 * @param regex    The regular expression pattern being matched
 * @param settings Settings object containing regular expressions for each strip function
 * @return Count of words.
 */
function countWords(text, regex, settings) {
  var _text$match$length;
  text = [stripTags.bind(null, settings), stripHTMLComments.bind(null, settings), stripShortcodes.bind(null, settings), stripSpaces.bind(null, settings), stripHTMLEntities.bind(null, settings), stripConnectors.bind(null, settings), stripRemovables.bind(null, settings)].reduce((result, fn) => fn(result), text);
  text = text + '\n';
  return (_text$match$length = text.match(regex)?.length) !== null && _text$match$length !== void 0 ? _text$match$length : 0;
}

/**
 * Count the characters in text
 *
 * @param text     The text being processed
 * @param regex    The regular expression pattern being matched
 * @param settings Settings object containing regular expressions for each strip function
 * @return Count of characters.
 */
function countCharacters(text, regex, settings) {
  var _text$match$length2;
  text = [stripTags.bind(null, settings), stripHTMLComments.bind(null, settings), stripShortcodes.bind(null, settings), transposeAstralsToCountableChar.bind(null, settings), stripSpaces.bind(null, settings), transposeHTMLEntitiesToCountableChars.bind(null, settings)].reduce((result, fn) => fn(result), text);
  text = text + '\n';
  return (_text$match$length2 = text.match(regex)?.length) !== null && _text$match$length2 !== void 0 ? _text$match$length2 : 0;
}

/**
 * Count some words.
 *
 * @param text         The text being processed
 * @param type         The type of count. Accepts 'words', 'characters_excluding_spaces', or 'characters_including_spaces'.
 * @param userSettings Custom settings object.
 *
 * @example
 * ```ts
 * import { count } from '@wordpress/wordcount';
 * const numberOfWords = count( 'Words to count', 'words', {} )
 * ```
 *
 * @return The word or character count.
 */
function count(text, type, userSettings) {
  const settings = loadSettings(type, userSettings);
  let matchRegExp;
  switch (settings.type) {
    case 'words':
      matchRegExp = settings.wordsRegExp;
      return countWords(text, matchRegExp, settings);
    case 'characters_including_spaces':
      matchRegExp = settings.characters_including_spacesRegExp;
      return countCharacters(text, matchRegExp, settings);
    case 'characters_excluding_spaces':
      matchRegExp = settings.characters_excluding_spacesRegExp;
      return countCharacters(text, matchRegExp, settings);
    default:
      return 0;
  }
}

// Export types for external usage


(window.wp = window.wp || {}).wordcount = __webpack_exports__;
/******/ })()
;