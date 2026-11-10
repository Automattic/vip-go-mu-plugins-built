import { getContext, getElement, store, withSyncEvent } from "@wordpress/interactivity";

// packages/block-library/build-module/query/view.mjs
const isValidLink = (ref) => ref && ref instanceof window.HTMLAnchorElement && ref.href && (!ref.target || ref.target === "_self") && ref.origin === window.location.origin;
const isValidEvent = (event) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.defaultPrevented;
store("core/query", {
	actions: {
		navigate: withSyncEvent(function* (event) {
			const ctx = getContext();
			const { ref } = getElement();
			const queryRef = ref.closest(".wp-block-query[data-wp-router-region]");
			if (isValidLink(ref) && isValidEvent(event)) {
				event.preventDefault();
				const { actions } = yield import("@wordpress/interactivity-router");
				yield actions.navigate(ref.href);
				ctx.url = ref.href;
				queryRef.querySelector(`.wp-block-post-template a[href]`)?.focus();
			}
		}),
		*prefetch() {
			const { ref } = getElement();
			if (isValidLink(ref)) {
				const { actions } = yield import("@wordpress/interactivity-router");
				yield actions.prefetch(ref.href);
			}
		}
	},
	callbacks: { *prefetch() {
		const { url } = getContext();
		const { ref } = getElement();
		if (url && isValidLink(ref)) {
			const { actions } = yield import("@wordpress/interactivity-router");
			yield actions.prefetch(ref.href);
		}
	} }
}, { lock: true });

//# sourceMappingURL=view.js.map