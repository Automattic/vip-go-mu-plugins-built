// packages/interactivity-router/build-module/full-page.mjs
const isValidLink = (ref) => ref && ref instanceof window.HTMLAnchorElement && ref.href && (!ref.target || ref.target === "_self") && ref.origin === window.location.origin && !ref.pathname.startsWith("/wp-admin") && !ref.pathname.startsWith("/wp-login.php") && !ref.getAttribute("href").startsWith("#") && !new URL(ref.href).searchParams.has("_wpnonce");
const isValidEvent = (event) => event && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.defaultPrevented;
document.addEventListener("click", async (event) => {
	const ref = event.target.closest("a");
	if (isValidLink(ref) && isValidEvent(event)) {
		event.preventDefault();
		const { actions } = await import("@wordpress/interactivity-router");
		actions.navigate(ref.href);
	}
});
document.addEventListener("mouseenter", async (event) => {
	if (event.target?.nodeName === "A") {
		const ref = event.target.closest("a");
		if (isValidLink(ref) && isValidEvent(event)) {
			const { actions } = await import("@wordpress/interactivity-router");
			actions.prefetch(ref.href);
		}
	}
}, true);

//# sourceMappingURL=full-page.js.map