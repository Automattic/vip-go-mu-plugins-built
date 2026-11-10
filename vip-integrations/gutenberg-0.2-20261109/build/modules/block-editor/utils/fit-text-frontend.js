import { getContext, getElement, store } from "@wordpress/interactivity";

// packages/block-editor/build-module/utils/fit-text-utils.mjs
/**
* Find optimal font size using simple binary search between 0-2400px.
*
* @param textElement   The text element
* @param applyFontSize Function that receives font size in pixels
* @return Optimal font size
*/
function findOptimalFontSize(textElement, applyFontSize) {
	const alreadyHasScrollableHeight = textElement.scrollHeight > textElement.clientHeight;
	let minSize = 0;
	let maxSize = 2400;
	let bestSize = minSize;
	const computedStyle = window.getComputedStyle(textElement);
	let paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
	let paddingRight = parseFloat(computedStyle.paddingRight) || 0;
	const range = document.createRange();
	range.selectNodeContents(textElement);
	let referenceElement = textElement;
	const parentElement = textElement.parentElement;
	if (parentElement) {
		const parentElementComputedStyle = window.getComputedStyle(parentElement);
		if (parentElementComputedStyle?.display === "flex") {
			referenceElement = parentElement;
			paddingLeft += parseFloat(parentElementComputedStyle.paddingLeft) || 0;
			paddingRight += parseFloat(parentElementComputedStyle.paddingRight) || 0;
		}
	}
	let maxclientHeight = referenceElement.clientHeight;
	while (minSize <= maxSize) {
		const midSize = Math.floor((minSize + maxSize) / 2);
		applyFontSize(midSize);
		const textWidth = range.getBoundingClientRect().width;
		const fitsWidth = textElement.scrollWidth <= referenceElement.clientWidth && textWidth <= referenceElement.clientWidth - paddingLeft - paddingRight;
		const fitsHeight = alreadyHasScrollableHeight || textElement.scrollHeight <= referenceElement.clientHeight || textElement.scrollHeight <= maxclientHeight;
		if (referenceElement.clientHeight > maxclientHeight) maxclientHeight = referenceElement.clientHeight;
		if (fitsWidth && fitsHeight) {
			bestSize = midSize;
			minSize = midSize + 1;
		} else maxSize = midSize - 1;
	}
	range.detach();
	return bestSize;
}
/**
* Complete fit text optimization for a single text element.
* Handles the full flow using callbacks for font size application.
*
* @param textElement   The text element (paragraph, heading, etc.)
* @param applyFontSize Function that receives font size in pixels (0 to clear, >0 to apply)
*/
function optimizeFitText(textElement, applyFontSize) {
	if (!textElement) return;
	applyFontSize(0);
	const optimalSize = findOptimalFontSize(textElement, applyFontSize);
	applyFontSize(optimalSize);
	return optimalSize;
}

// packages/block-editor/build-module/utils/fit-text-frontend.mjs
/**
* Frontend fit text functionality.
* Automatically detects and initializes fit text on blocks with the has-fit-text class.
* Supports both initial page load and Interactivity API client-side navigation.
*/
store("core/fit-text", { callbacks: { init() {
	const context = getContext();
	const { ref } = getElement();
	const applyFontSize = (fontSize) => {
		if (!ref) return;
		if (fontSize === 0) ref.style.fontSize = "";
		else ref.style.fontSize = `${fontSize}px`;
	};
	context.fontSize = optimizeFitText(ref, applyFontSize);
	if (window.ResizeObserver && ref?.parentElement) {
		const resizeObserver = new window.ResizeObserver(() => {
			context.fontSize = optimizeFitText(ref, applyFontSize);
		});
		resizeObserver.observe(ref.parentElement);
		resizeObserver.observe(ref);
		return () => {
			if (resizeObserver) resizeObserver.disconnect();
		};
	}
} } });

//# sourceMappingURL=fit-text-frontend.js.map