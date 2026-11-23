(function(exports, _wordpress_i18n) {

"use strict";
// packages/keycodes/build-module/platform.mjs
/**
	* Return true if platform is MacOS.
	*
	* @param _window window object by default; used for DI testing.
	*
	* @return True if MacOS; false otherwise.
	*/
	function isAppleOS(_window) {
		if (!_window) {
			if (typeof window === "undefined") return false;
			_window = window;
		}
		const { platform } = _window.navigator;
		return platform.indexOf("Mac") !== -1 || ["iPad", "iPhone"].includes(platform);
	}

// packages/keycodes/build-module/with-ignore-ime-events.mjs
/**
	* A higher-order function that wraps a keyboard event handler to ensure it is not an IME event.
	*
	* In CJK languages, an IME (Input Method Editor) is used to input complex characters.
	* During an IME composition, keyboard events (e.g. Enter or Escape) can be fired
	* which are intended to control the IME and not the application.
	* These events should be ignored by any application logic.
	*
	* @param handler The keyboard event handler to execute after ensuring it was not an IME event.
	*
	* @return A wrapped version of the given event handler that ignores IME events.
	*/
	function withIgnoreIMEEvents(handler) {
		return (event) => {
			const { isComposing } = "nativeEvent" in event ? event.nativeEvent : event;
			if (isComposing || event.keyCode === 229) return;
			handler(event);
		};
	}

// packages/keycodes/build-module/index.mjs
/**
	* Note: The order of the modifier keys in many of the [foo]Shortcut()
	* functions in this file are intentional and should not be changed. They're
	* designed to fit with the standard menu keyboard shortcuts shown in the
	* user's platform.
	*
	* For example, on MacOS menu shortcuts will place Shift before Command, but
	* on Windows Control will usually come first. So don't provide your own
	* shortcut combos directly to keyboardShortcut().
	*/
	/**
	* Keycode for BACKSPACE key.
	*/
	const BACKSPACE = 8;
	/**
	* Keycode for TAB key.
	*/
	const TAB = 9;
	/**
	* Keycode for ENTER key.
	*/
	const ENTER = 13;
	/**
	* Keycode for ESCAPE key.
	*/
	const ESCAPE = 27;
	/**
	* Keycode for SPACE key.
	*/
	const SPACE = 32;
	/**
	* Keycode for PAGEUP key.
	*/
	const PAGEUP = 33;
	/**
	* Keycode for PAGEDOWN key.
	*/
	const PAGEDOWN = 34;
	/**
	* Keycode for END key.
	*/
	const END = 35;
	/**
	* Keycode for HOME key.
	*/
	const HOME = 36;
	/**
	* Keycode for LEFT key.
	*/
	const LEFT = 37;
	/**
	* Keycode for UP key.
	*/
	const UP = 38;
	/**
	* Keycode for RIGHT key.
	*/
	const RIGHT = 39;
	/**
	* Keycode for DOWN key.
	*/
	const DOWN = 40;
	/**
	* Keycode for DELETE key.
	*/
	const DELETE = 46;
	/**
	* Keycode for F10 key.
	*/
	const F10 = 121;
	/**
	* Keycode for ALT key.
	*/
	const ALT = "alt";
	/**
	* Keycode for CTRL key.
	*/
	const CTRL = "ctrl";
	/**
	* Keycode for COMMAND/META key.
	*/
	const COMMAND = "meta";
	/**
	* Keycode for SHIFT key.
	*/
	const SHIFT = "shift";
	/**
	* Keycode for ZERO key.
	*/
	const ZERO = 48;
	/**
	* Capitalise the first character of a string.
	* @param string String to capitalise.
	* @return Capitalised string.
	*/
	function capitaliseFirstCharacter(string) {
		return string.length < 2 ? string.toUpperCase() : string.charAt(0).toUpperCase() + string.slice(1);
	}
	/**
	* Map the values of an object with a specified callback and return the result object.
	*
	* @template T The object type
	* @template R The return type of the mapping function
	*
	* @param    object Object to map values of.
	* @param    mapFn  Mapping function to apply to each value.
	* @return Object with the same keys and transformed values.
	*/
	function mapValues(object, mapFn) {
		return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, mapFn(value)]));
	}
	/**
	* Object that contains functions that return the available modifier
	* depending on platform.
	*/
	const modifiers = {
		primary: (_isApple) => _isApple() ? [COMMAND] : [CTRL],
		primaryShift: (_isApple) => _isApple() ? [SHIFT, COMMAND] : [CTRL, SHIFT],
		primaryAlt: (_isApple) => _isApple() ? ["alt", COMMAND] : [CTRL, "alt"],
		secondary: (_isApple) => _isApple() ? [
			SHIFT,
			"alt",
			COMMAND
		] : [
			CTRL,
			SHIFT,
			"alt"
		],
		access: (_isApple) => _isApple() ? [CTRL, "alt"] : [SHIFT, "alt"],
		ctrl: () => [CTRL],
		alt: () => ["alt"],
		ctrlShift: () => [CTRL, SHIFT],
		shift: () => [SHIFT],
		shiftAlt: () => [SHIFT, "alt"],
		undefined: () => []
	};
	/**
	* An object that contains functions to get raw shortcuts.
	*
	* These are intended for use with the KeyboardShortcuts.
	*
	* @example
	* ```js
	* // Assuming macOS:
	* rawShortcut.primary( 'm' )
	* // "meta+m"
	* ```
	*/
	const rawShortcut = /* @__PURE__ */ mapValues(modifiers, (modifier) => {
		return (character, _isApple = isAppleOS) => {
			return [...modifier(_isApple), character.toLowerCase()].join("+");
		};
	});
	/**
	* An object that contains functions to get shortcuts in a format compatible
	* with the [`aria-keyshortcuts` HTML attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts).
	*
	* **Note**: The provided shortcut character strings (ie. not the modifiers) should follow
	* the values specified in the [UI Events KeyboardEvent key Values spec](https://www.w3.org/TR/uievents-key/) — for example, "Enter", "Tab", "ArrowRight", "PageDown",
	* "Escape", "Plus", or "F1". The spacebar key should be represented with the
	* "Space" string (an exception to the UI Events KeyboardEvent key Values spec).
	*
	* @see https://www.w3.org/TR/wai-aria-1.2/#aria-keyshortcuts
	* @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts
	* @see https://www.w3.org/TR/uievents-key/
	*
	* @example
	* ```js
	* // Assuming macOS:
	* ariaKeyShortcut.primary( 'm' )
	* // "Meta+M"
	*
	* ariaKeyShortcut.primaryAlt( 'm' )
	* // "Meta+Alt+M"
	*
	* // Assuming Windows:
	* ariaKeyShortcut.primary( 'm' )
	* // "Control+M"
	*
	* ariaKeyShortcut.primaryAlt( 'm' )
	* // "Control+Alt+M"
	*
	* ariaKeyShortcut.primaryShift( 'del' )
	* // "Control+Shift+Delete"
	* ```
	*/
	const ariaKeyShortcut = /* @__PURE__ */ mapValues(modifiers, (modifier) => {
		return (character, _isApple = isAppleOS) => {
			return [...modifier(_isApple).map((key) => key === "ctrl" ? "Control" : key).map((key) => capitaliseFirstCharacter(key)), capitaliseFirstCharacter(character)].join("+");
		};
	});
	/**
	* Return an array of the parts of a keyboard shortcut chord for display.
	*
	* @example
	* ```js
	* // Assuming macOS:
	* displayShortcutList.primary( 'm' );
	* // [ "⌘", "M" ]
	* ```
	*
	* Keyed map of functions to shortcut sequences.
	*/
	const displayShortcutList = /* @__PURE__ */ mapValues(modifiers, (modifier) => {
		return (character, _isApple = isAppleOS) => {
			const isApple = _isApple();
			const replacementKeyMap = {
				["alt"]: isApple ? "⌥" : "Alt",
				[CTRL]: isApple ? "⌃" : "Ctrl",
				[COMMAND]: "⌘",
				[SHIFT]: isApple ? "⇧" : "Shift"
			};
			return [...modifier(_isApple).reduce((accumulator, key) => {
				const replacementKey = replacementKeyMap[key] ?? key;
				if (isApple) return [...accumulator, replacementKey];
				return [
					...accumulator,
					replacementKey,
					"+"
				];
			}, []), capitaliseFirstCharacter(character)];
		};
	});
	/**
	* An object that contains functions to display shortcuts.
	*
	* @example
	* ```js
	* // Assuming macOS:
	* displayShortcut.primary( 'm' );
	* // "⌘M"
	* ```
	*
	* Keyed map of functions to display shortcuts.
	*/
	const displayShortcut = /* @__PURE__ */ mapValues(displayShortcutList, (shortcutList) => {
		return (character, _isApple = isAppleOS) => shortcutList(character, _isApple).join("");
	});
	/**
	* An object that contains functions to return an aria label for a keyboard
	* shortcut.
	*
	* @example
	* ```js
	* // Assuming macOS:
	* shortcutAriaLabel.primary( '.' );
	* // "Command + Period"
	* ```
	*
	* Keyed map of functions to shortcut ARIA labels.
	*/
	const shortcutAriaLabel = /* @__PURE__ */ mapValues(modifiers, (modifier) => {
		return (character, _isApple = isAppleOS) => {
			const isApple = _isApple();
			const replacementKeyMap = {
				[SHIFT]: "Shift",
				[COMMAND]: isApple ? "Command" : "Control",
				[CTRL]: "Control",
				["alt"]: isApple ? "Option" : "Alt",
				",": (0, _wordpress_i18n.__)("Comma"),
				".": (0, _wordpress_i18n.__)("Period"),
				"`": (0, _wordpress_i18n.__)("Backtick"),
				"~": (0, _wordpress_i18n.__)("Tilde")
			};
			return [...modifier(_isApple), character].map((key) => capitaliseFirstCharacter(replacementKeyMap[key] ?? key)).join(isApple ? " " : " + ");
		};
	});
	/**
	* An object that contains functions returning the three values used to
	* display and describe a keyboard shortcut: its display string, its
	* `aria-keyshortcuts` value and its plain-text label.
	*
	* The raw representation is not included; use `rawShortcut` for that.
	*
	* Use it in place of calling `displayShortcut`, `ariaKeyShortcut` and
	* `shortcutAriaLabel` separately, for example to build the `shortcut` prop of
	* the `@wordpress/ui` components.
	*
	* @example
	* ```js
	* // Assuming macOS:
	* keyboardShortcut.primaryShift( 'm' );
	* // {
	* //   displayShortcut: "⇧⌘M",
	* //   ariaKeyShortcut: "Shift+Meta+M",
	* //   label: "Shift Command M",
	* // }
	* ```
	*
	* Keyed map of functions to shortcut display values.
	*/
	const keyboardShortcut = /* @__PURE__ */ Object.fromEntries(Object.keys(modifiers).map((modifier) => [modifier, (character, _isApple = isAppleOS) => ({
		displayShortcut: displayShortcut[modifier](character, _isApple),
		ariaKeyShortcut: ariaKeyShortcut[modifier](character, _isApple),
		label: shortcutAriaLabel[modifier](character, _isApple)
	})]));
	/**
	* From a given KeyboardEvent, returns an array of active modifier constants for
	* the event.
	*
	* @param event Keyboard event.
	*
	* @return Active modifier constants.
	*/
	function getEventModifiers(event) {
		return [
			"alt",
			CTRL,
			COMMAND,
			SHIFT
		].filter((key) => event[`${key}Key`]);
	}
	/**
	* An object that contains functions to check if a keyboard event matches a
	* predefined shortcut combination.
	*
	* @example
	* ```js
	* // Assuming an event for ⌘M key press:
	* isKeyboardEvent.primary( event, 'm' );
	* // true
	* ```
	*
	* Keyed map of functions to match events.
	*/
	const isKeyboardEvent = /* @__PURE__ */ mapValues(modifiers, (getModifiers) => {
		return (event, character, _isApple = isAppleOS) => {
			const mods = getModifiers(_isApple);
			const eventMods = getEventModifiers(event);
			const replacementWithShiftKeyMap = {
				Comma: ",",
				Backslash: "\\",
				IntlRo: "\\",
				IntlYen: "\\"
			};
			const modsDiff = mods.filter((mod) => !eventMods.includes(mod));
			const eventModsDiff = eventMods.filter((mod) => !mods.includes(mod));
			if (modsDiff.length > 0 || eventModsDiff.length > 0) return false;
			let key = event.key.toLowerCase();
			if (!character) return mods.includes(key);
			if (event.altKey && character.length === 1) key = String.fromCharCode(event.keyCode).toLowerCase();
			if (event.shiftKey && character.length === 1 && replacementWithShiftKeyMap[event.code]) key = replacementWithShiftKeyMap[event.code];
			if (character === "del") character = "delete";
			return key === character.toLowerCase();
		};
	});

exports.ALT = ALT;
exports.BACKSPACE = BACKSPACE;
exports.COMMAND = COMMAND;
exports.CTRL = CTRL;
exports.DELETE = DELETE;
exports.DOWN = DOWN;
exports.END = END;
exports.ENTER = ENTER;
exports.ESCAPE = ESCAPE;
exports.F10 = F10;
exports.HOME = HOME;
exports.LEFT = LEFT;
exports.PAGEDOWN = PAGEDOWN;
exports.PAGEUP = PAGEUP;
exports.RIGHT = RIGHT;
exports.SHIFT = SHIFT;
exports.SPACE = SPACE;
exports.TAB = TAB;
exports.UP = UP;
exports.ZERO = ZERO;
exports.ariaKeyShortcut = ariaKeyShortcut;
exports.displayShortcut = displayShortcut;
exports.displayShortcutList = displayShortcutList;
exports.isAppleOS = isAppleOS;
exports.isKeyboardEvent = isKeyboardEvent;
exports.keyboardShortcut = keyboardShortcut;
exports.modifiers = modifiers;
exports.rawShortcut = rawShortcut;
exports.shortcutAriaLabel = shortcutAriaLabel;
exports.withIgnoreIMEEvents = withIgnoreIMEEvents;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).keycodes = exports;
return exports;
})({}, window.wp.i18n);
//# sourceMappingURL=index.js.map