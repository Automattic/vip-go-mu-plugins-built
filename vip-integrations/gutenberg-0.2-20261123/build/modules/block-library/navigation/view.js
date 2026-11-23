import { getContext, getElement, store, withSyncEvent } from "@wordpress/interactivity";

// packages/block-library/build-module/navigation/view.mjs
const focusableSelectors = [
	"a[href]",
	"input:not([disabled]):not([type=\"hidden\"]):not([aria-hidden])",
	"select:not([disabled]):not([aria-hidden])",
	"textarea:not([disabled]):not([aria-hidden])",
	"button:not([disabled]):not([aria-hidden])",
	"[contenteditable]",
	"[tabindex]:not([tabindex^=\"-\"])"
];
/**
* Gets all visible focusable elements within a container.
* Filters out elements that are hidden.
*
* @param {HTMLElement} ref - The container element to search within
* @return {HTMLElement[]} Array of visible focusable elements
*/
function getFocusableElements(ref) {
	const focusableElements = ref.querySelectorAll(focusableSelectors);
	return Array.from(focusableElements).filter((element) => {
		if (typeof element.checkVisibility === "function") return element.checkVisibility({
			checkOpacity: false,
			checkVisibilityCSS: true
		});
		return element.offsetParent !== null;
	});
}
document.addEventListener("click", () => {});
const FADE_OUT_BUFFER_MS = 100;
function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
/**
* Returns the length of the overlay's animation in milliseconds, or 0 when the
* overlay has no animation, e.g. when a theme sets `animation: none`. The
* fade-out uses the same duration as the fade-in.
*
* @param {Element} modal The overlay element.
* @return {number} The animation duration in milliseconds.
*/
function getOverlayAnimationDuration(modal) {
	const { animationName, animationDuration } = window.getComputedStyle(modal);
	if (animationName === "none") return 0;
	return Math.max(...animationDuration.split(",").map((duration) => {
		const value = parseFloat(duration);
		return duration.trim().endsWith("ms") ? value : value * 1e3;
	}));
}
/**
* Ends the overlay fade-out: stops displaying the overlay and releases the
* page scroll lock.
*
* @param {Object} ctx The navigation overlay context.
*/
function finishClosingOverlay(ctx) {
	clearTimeout(ctx.closingTimeout);
	ctx.closingTimeout = null;
	ctx.isClosing = false;
	document.documentElement.classList.remove("has-modal-open");
}
const { state, actions } = store("core/navigation", {
	state: {
		get roleAttribute() {
			return getContext().type === "overlay" && state.isMenuOpen ? "dialog" : null;
		},
		get ariaModal() {
			return getContext().type === "overlay" && state.isMenuOpen ? "true" : null;
		},
		get ariaLabel() {
			const ctx = getContext();
			return ctx.type === "overlay" && state.isMenuOpen ? ctx.ariaLabel : null;
		},
		get isMenuOpen() {
			return Object.values(state.menuOpenedBy).filter(Boolean).length > 0;
		},
		get isMenuClosing() {
			return !!getContext().isClosing;
		},
		get isMenuVisible() {
			return state.isMenuOpen || state.isMenuClosing;
		},
		get menuOpenedBy() {
			const ctx = getContext();
			return ctx.type === "overlay" ? ctx.overlayOpenedBy : ctx.submenuOpenedBy;
		},
		get isSubmenuOpen() {
			const ctx = getContext();
			return !ctx.hasCustomOverlay && Object.values(ctx.overlayOpenedBy || {}).filter(Boolean).length > 0 || state.isMenuOpen;
		}
	},
	actions: {
		openMenuOnHover(event) {
			if (event?.pointerType === "touch") return;
			const { type } = getContext();
			if (type === "submenu") actions.openMenu("hover");
		},
		closeMenuOnHover(event) {
			if (event?.pointerType === "touch") return;
			const { type } = getContext();
			if (type === "submenu") actions.closeMenu("hover");
		},
		openMenuOnClick() {
			const ctx = getContext();
			const { ref } = getElement();
			ctx.previousFocus = ref;
			actions.openMenu("click");
		},
		closeMenuOnClick() {
			actions.closeMenu("click");
			actions.closeMenu("focus");
		},
		openMenuOnFocus() {
			actions.openMenu("focus");
		},
		toggleMenuOnClick() {
			const ctx = getContext();
			const { ref } = getElement();
			if (window.document.activeElement !== ref) ref.focus();
			const { menuOpenedBy } = state;
			if (menuOpenedBy.click || menuOpenedBy.focus) {
				actions.closeMenu("click");
				actions.closeMenu("focus");
				actions.closeMenu("hover");
			} else {
				ctx.previousFocus = ref;
				actions.openMenu("click");
			}
		},
		handleMenuKeydown: withSyncEvent((event) => {
			const { type, firstFocusableElement, lastFocusableElement } = getContext();
			if (state.menuOpenedBy.click) {
				if (event.key === "Escape") {
					event.stopPropagation();
					actions.closeMenu("click");
					actions.closeMenu("focus");
					return;
				}
				if (type === "overlay" && event.key === "Tab") {
					if (event.shiftKey && window.document.activeElement === firstFocusableElement) {
						event.preventDefault();
						lastFocusableElement.focus();
					} else if (!event.shiftKey && window.document.activeElement === lastFocusableElement) {
						event.preventDefault();
						firstFocusableElement.focus();
					}
				}
			}
		}),
		handleMenuFocusout: withSyncEvent((event) => {
			const { modal, type } = getContext();
			if (event.relatedTarget === null || !modal?.contains(event.relatedTarget) && event.target !== window.document.activeElement && type === "submenu") {
				actions.closeMenu("click");
				actions.closeMenu("focus");
			}
		}),
		openMenu(menuOpenedOn = "click") {
			const ctx = getContext();
			const { type } = ctx;
			state.menuOpenedBy[menuOpenedOn] = true;
			if (ctx.isClosing) finishClosingOverlay(ctx);
			if (type === "overlay") document.documentElement.classList.add("has-modal-open");
		},
		closeMenu(menuClosedOn = "click") {
			const ctx = getContext();
			state.menuOpenedBy[menuClosedOn] = false;
			if (!state.isMenuOpen) {
				if (ctx.modal?.contains(window.document.activeElement)) ctx.previousFocus?.focus();
				const modal = ctx.modal;
				ctx.modal = null;
				ctx.previousFocus = null;
				if (ctx.type === "overlay") {
					if (ctx.isClosing) return;
					const animationDuration = modal && !prefersReducedMotion() ? getOverlayAnimationDuration(modal) : 0;
					if (animationDuration) {
						ctx.isClosing = true;
						ctx.closingTimeout = setTimeout(() => finishClosingOverlay(ctx), animationDuration + FADE_OUT_BUFFER_MS);
					} else document.documentElement.classList.remove("has-modal-open");
				}
			}
		},
		handleOverlayAnimationEnd(event) {
			const ctx = getContext();
			if (ctx.isClosing && event.target === event.currentTarget && event.animationName === "overlay-menu__fade-out-animation") finishClosingOverlay(ctx);
		}
	},
	callbacks: {
		initMenu() {
			const ctx = getContext();
			const { ref } = getElement();
			if (state.isMenuOpen) {
				const focusableElements = getFocusableElements(ref);
				ctx.modal = ref;
				ctx.firstFocusableElement = focusableElements[0];
				ctx.lastFocusableElement = focusableElements[focusableElements.length - 1];
			}
		},
		focusFirstElement() {
			const { ref } = getElement();
			if (state.isMenuOpen) getFocusableElements(ref)?.[0]?.focus();
		}
	}
}, { lock: true });

//# sourceMappingURL=view.js.map