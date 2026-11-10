import { getElement, store } from "@wordpress/interactivity";

// packages/block-library/build-module/utils/reduced-motion.mjs
/**
* Whether the user has asked their operating system to reduce motion.
*
* This is the counterpart to the `useReducedMotion` hook in
* `@wordpress/compose`, for block view scripts, which run outside React. It
* reads the preference once; callers that need to react to it changing should
* watch the media query themselves.
*
* @return {boolean} Whether reduced motion is preferred.
*/
function prefersReducedMotion() {
	return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

// packages/block-library/build-module/video/view.mjs
store("core/video", { callbacks: { stopAutoplay() {
	if (!prefersReducedMotion()) return;
	const { ref } = getElement();
	ref.autoplay = false;
	ref.pause();
} } }, { lock: true });

//# sourceMappingURL=view.js.map