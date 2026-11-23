(function(exports) {

"use strict";
// packages/wordcount/build-module/defaultSettings.mjs
/**
	* Default settings for word counting operations.
	*/
	const defaultSettings = {
		HTMLRegExp: /<\/?[a-z][^>]*?>/gi,
		HTMLcommentRegExp: /<!--[\s\S]*?-->/g,
		spaceRegExp: /&nbsp;|&#160;/gi,
		HTMLEntityRegExp: /&\S+?;/g,
		connectorRegExp: /--|\u2014/g,
		removeRegExp: new RegExp([
			"[",
			"!-/:-@[-`{-~",
			"-¿×÷",
			" -⯿",
			"⸀-⹿",
			"]"
		].join(""), "g"),
		astralRegExp: /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
		wordsRegExp: /\S\s+/g,
		characters_excluding_spacesRegExp: /\S/g,
		characters_including_spacesRegExp: /[^\f\n\r\t\v\u00AD\u2028\u2029]/g,
		l10n: { type: "words" }
	};

// packages/wordcount/build-module/stripTags.mjs
/**
	* Replaces items matched in the regex with new line
	*
	* @param settings The main settings object containing regular expressions
	* @param text     The string being counted.
	* @return The manipulated text.
	*/
	function stripTags(settings, text) {
		return text.replace(settings.HTMLRegExp, "\n");
	}

// packages/wordcount/build-module/transposeAstralsToCountableChar.mjs
/**
	* Replaces items matched in the regex with a single character.
	*
	* @param settings The main settings object containing regular expressions
	* @param text     The string being counted.
	* @return The manipulated text.
	*/
	function transposeAstralsToCountableChar(settings, text) {
		return text.replace(settings.astralRegExp, "a");
	}

// packages/wordcount/build-module/stripHTMLEntities.mjs
/**
	* Removes items matched in the regex.
	*
	* @param settings The main settings object containing regular expressions
	* @param text     The string being counted.
	* @return The manipulated text.
	*/
	function stripHTMLEntities(settings, text) {
		return text.replace(settings.HTMLEntityRegExp, "");
	}

// packages/wordcount/build-module/stripConnectors.mjs
/**
	* Replaces items matched in the regex with spaces.
	*
	* @param settings The main settings object containing regular expressions
	* @param text     The string being counted.
	* @return The manipulated text.
	*/
	function stripConnectors(settings, text) {
		return text.replace(settings.connectorRegExp, " ");
	}

// packages/wordcount/build-module/stripRemovables.mjs
/**
	* Replaces items matched in the regex with spaces.
	*
	* @param settings The main settings object containing regular expressions
	* @param text     The string being counted.
	* @return The manipulated text.
	*/
	function stripRemovables(settings, text) {
		return text.replace(settings.removeRegExp, "");
	}

// packages/wordcount/build-module/stripHTMLComments.mjs
/**
	* Replaces items matched in the regex with new line.
	*
	* @param settings The main settings object containing regular expressions
	* @param text     The string being counted.
	* @return The manipulated text.
	*/
	function stripHTMLComments(settings, text) {
		return text.replace(settings.HTMLcommentRegExp, "");
	}

// packages/wordcount/build-module/stripShortcodes.mjs
/**
	* Replaces items matched in the regex with a new line.
	*
	* @param settings The main settings object containing regular expressions
	* @param text     The string being counted.
	* @return The manipulated text.
	*/
	function stripShortcodes(settings, text) {
		if (settings.shortcodesRegExp) return text.replace(settings.shortcodesRegExp, "\n");
		return text;
	}

// packages/wordcount/build-module/stripSpaces.mjs
/**
	* Replaces items matched in the regex with spaces.
	*
	* @param settings The main settings object containing regular expressions
	* @param text     The string being counted.
	* @return The manipulated text.
	*/
	function stripSpaces(settings, text) {
		return text.replace(settings.spaceRegExp, " ");
	}

// packages/wordcount/build-module/transposeHTMLEntitiesToCountableChars.mjs
/**
	* Replaces items matched in the regex with a single character.
	*
	* @param settings The main settings object containing regular expressions
	* @param text     The string being counted.
	* @return The manipulated text.
	*/
	function transposeHTMLEntitiesToCountableChars(settings, text) {
		return text.replace(settings.HTMLEntityRegExp, "a");
	}

// packages/wordcount/build-module/index.mjs
/**
	* Private function to manage the settings.
	*
	* @param type         The type of count to be done.
	* @param userSettings Custom settings for the count.
	* @return The combined settings object to be used.
	*/
	function loadSettings(type = "words", userSettings = {}) {
		const settings = {
			...defaultSettings,
			...userSettings,
			type,
			shortcodes: []
		};
		settings.shortcodes = settings.l10n?.shortcodes ?? [];
		if (settings.shortcodes && settings.shortcodes.length) settings.shortcodesRegExp = new RegExp("\\[\\/?(?:" + settings.shortcodes.join("|") + ")[^\\]]*?\\]", "g");
		if (settings.type !== "characters_excluding_spaces" && settings.type !== "characters_including_spaces") settings.type = "words";
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
		text = [
			stripTags.bind(null, settings),
			stripHTMLComments.bind(null, settings),
			stripShortcodes.bind(null, settings),
			stripSpaces.bind(null, settings),
			stripHTMLEntities.bind(null, settings),
			stripConnectors.bind(null, settings),
			stripRemovables.bind(null, settings)
		].reduce((result, fn) => fn(result), text);
		text = text + "\n";
		return text.match(regex)?.length ?? 0;
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
		text = [
			stripTags.bind(null, settings),
			stripHTMLComments.bind(null, settings),
			stripShortcodes.bind(null, settings),
			transposeAstralsToCountableChar.bind(null, settings),
			stripSpaces.bind(null, settings),
			transposeHTMLEntitiesToCountableChars.bind(null, settings)
		].reduce((result, fn) => fn(result), text);
		text = text + "\n";
		return text.match(regex)?.length ?? 0;
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
			case "words":
				matchRegExp = settings.wordsRegExp;
				return countWords(text, matchRegExp, settings);
			case "characters_including_spaces":
				matchRegExp = settings.characters_including_spacesRegExp;
				return countCharacters(text, matchRegExp, settings);
			case "characters_excluding_spaces":
				matchRegExp = settings.characters_excluding_spacesRegExp;
				return countCharacters(text, matchRegExp, settings);
			default: return 0;
		}
	}

exports.count = count;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).wordcount = exports;
return exports;
})({});
//# sourceMappingURL=index.js.map