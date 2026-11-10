import { getConfig, getContext, getElement, splitTask, store, withScope, withSyncEvent } from "@wordpress/interactivity";

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

// packages/block-library/build-module/image/view.mjs
/**
* Tracks whether user is touching screen; used to differentiate behavior for
* touch and mouse input.
*
* @type {boolean}
*/
let isTouching = false;
/**
* Tracks the last time the screen was touched; used to differentiate behavior
* for touch and mouse input.
*
* @type {number}
*/
let lastTouchTime = 0;
const touchStartEvent = {
	startX: 0,
	startY: 0,
	startTime: 0
};
/**
* Elements made inert while the lightbox is open, so only those are restored
* when it closes.
*
* @type {Element[]}
*/
let inertElements = [];
/**
* Per-gesture state for the in-progress horizontal drag on the lightbox.
*
* `direction` is null until the gesture exceeds a small disambiguation
* threshold, then latches to 'horizontal' or 'vertical' for the rest of it;
* vertical gestures bypass the drag-tracking path so native scroll suppression
* keeps working unchanged.
*/
const touchDrag = {
	isDragging: false,
	direction: null,
	slideEls: [],
	animations: [],
	settle: null
};
const SLIDE_DURATION_MS = 220;
const FADE_DURATION_MS = 300;
const SLIDE_EASING = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const DIRECTION_LATCH_THRESHOLD_PX = 10;
const HORIZONTAL_DOMINANCE_RATIO = 1.5;
const COMMIT_DISTANCE_RATIO = .2;
const FLICK_DISTANCE_PX = 50;
const FLICK_MAX_DURATION_MS = 300;
/**
* How far a committed swipe travels before the image is swapped.
*
* The enlarged image is centred in the viewport, so one viewport width is one
* slide. Naming it keeps the commit distance and the commit threshold in step,
* and marks the single place that would change if the images were ever laid
* out as a strip rather than one at a time.
*
* @return {number} The slide pitch in pixels.
*/
function getSlidePitch() {
	return window.innerWidth;
}
/**
* The transform that places a slide at a given horizontal offset from rest.
*
* Mirrors the `transform` the stylesheet gives `.lightbox-image-container`, so
* an animation can start and end on values the element would hold on its own.
*
* @param {number} offset Offset from the resting position, in pixels.
* @return {string} A CSS transform value.
*/
function slideTransform(offset) {
	return `translate(calc(-50% + ${offset}px), -50%)`;
}
/**
* Places the slides at a horizontal offset from rest.
*
* @param {Element[]} els    The slide elements.
* @param {number}    offset Offset in pixels; 0 returns them to rest.
*/
function setDragOffset(els, offset) {
	els.forEach((el) => {
		if (offset) el.style.setProperty("--wp--lightbox-drag-offset", `${offset}px`);
		else el.style.removeProperty("--wp--lightbox-drag-offset");
	});
}
/**
* Stops whatever the gesture is animating.
*
* Cancelling drops a `fill`, so the slides fall back to the transform the
* stylesheet gives them, which reads the offset set by `setDragOffset()`.
*/
function stopDragAnimations() {
	touchDrag.animations.forEach((animation) => animation.cancel());
	touchDrag.animations = [];
}
/**
* Clears the per-gesture drag state.
*
* A committed swipe still animating is left alone: it is started as a gesture
* ends and holds its own references. `touchDrag.settle` deals with that side.
*/
function resetTouchDrag() {
	touchDrag.isDragging = false;
	touchDrag.direction = null;
	touchDrag.slideEls = [];
}
/**
* Resolves once an image is ready to be painted.
*
* @param {HTMLImageElement|null} img The image to wait for.
* @return {Promise<void>} Resolves when the image is decoded or has failed.
*/
async function waitForImage(img) {
	await splitTask();
	try {
		await img?.decode();
	} catch {}
}
const focusableSelectors = [".wp-lightbox-close-button", ".wp-lightbox-navigation-button"];
/**
* Returns the appropriate src URL for an image.
*
* @param {string} uploadedSrc - Full size image src.
* @return {string} The source URL.
*/
function getImageSrc({ uploadedSrc }) {
	return uploadedSrc || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
}
/**
* Returns the appropriate srcset for an image.
*
* @param {string} lightboxSrcset - Image srcset.
* @return {string} The srcset value.
*/
function getImageSrcset({ lightboxSrcset }) {
	return lightboxSrcset || "";
}
/**
* Returns the metadata of the image with the passed ID. The ID comes from the
* context, so only own properties of `state.metadata` are returned, never an
* inherited one.
*
* @param {string} imageId Image ID.
* @return {Object|undefined} The image metadata, if it exists.
*/
function getImageMetadata(imageId) {
	const metadata = state.metadata[imageId];
	return Object.hasOwn(state.metadata, imageId) ? metadata : void 0;
}
const { state, actions, callbacks } = store("core/image", {
	state: {
		selectedImageId: null,
		selectedGalleryId: null,
		preloadTimers: /* @__PURE__ */ new Map(),
		preloadedImageIds: /* @__PURE__ */ new Set(),
		get galleryImages() {
			if (!state.selectedGalleryId) return [state.selectedImageId];
			return Object.entries(state.metadata).filter(([, value]) => value.galleryId === state.selectedGalleryId).sort(([, a], [, b]) => {
				return (a.order ?? 0) - (b.order ?? 0);
			}).map(([key]) => key);
		},
		get selectedImageIndex() {
			return state.galleryImages.findIndex((id) => id === state.selectedImageId);
		},
		get selectedImage() {
			return getImageMetadata(state.selectedImageId);
		},
		get hasNavigationIcon() {
			const { navigationButtonType } = state.selectedImage;
			return navigationButtonType === "icon" || navigationButtonType === "both";
		},
		get hasNavigationText() {
			const { navigationButtonType } = state.selectedImage;
			return navigationButtonType === "text" || navigationButtonType === "both";
		},
		get thisImage() {
			const { imageId } = getContext();
			return getImageMetadata(imageId);
		},
		get hasNavigation() {
			return state.galleryImages.length > 1;
		},
		get hasNextImage() {
			return state.selectedImageIndex + 1 < state.galleryImages.length;
		},
		get hasPreviousImage() {
			return state.selectedImageIndex - 1 >= 0;
		},
		get overlayOpened() {
			return state.selectedImageId !== null;
		},
		get roleAttribute() {
			return state.overlayOpened ? "dialog" : null;
		},
		get ariaModal() {
			return state.overlayOpened ? "true" : null;
		},
		get ariaLabel() {
			return state.selectedImage.customAriaLabel || getConfig().defaultAriaLabel;
		},
		get closeButtonAriaLabel() {
			return state.hasNavigationText ? void 0 : getConfig().closeButtonText;
		},
		get prevButtonAriaLabel() {
			return state.hasNavigationText ? void 0 : getConfig().prevButtonText;
		},
		get nextButtonAriaLabel() {
			return state.hasNavigationText ? void 0 : getConfig().nextButtonText;
		},
		get enlargedSrc() {
			return getImageSrc(state.selectedImage);
		},
		get enlargedSrcset() {
			return getImageSrcset(state.selectedImage);
		},
		get figureStyles() {
			return state.overlayOpened && `${state.selectedImage.figureStyles?.replace(/margin[^;]*;?/g, "")};`;
		},
		get imgStyles() {
			return state.overlayOpened && `${state.selectedImage.imgStyles?.replace(/;$/, "")}; object-fit:cover;`;
		},
		get isContentHidden() {
			const ctx = getContext();
			return state.overlayEnabled && state.selectedImageId === ctx.imageId;
		},
		get isContentVisible() {
			const ctx = getContext();
			return !state.overlayEnabled && state.selectedImageId === ctx.imageId;
		}
	},
	actions: {
		showLightbox() {
			const { imageId } = getContext();
			if (!getImageMetadata(imageId)?.imageRef?.complete) return;
			state.scrollTopReset = document.documentElement.scrollTop;
			state.scrollLeftReset = document.documentElement.scrollLeft;
			state.selectedImageId = imageId;
			const { galleryId } = getContext("core/gallery") || {};
			state.selectedGalleryId = galleryId || null;
			state.overlayEnabled = true;
			callbacks.setOverlayStyles();
		},
		hideLightbox() {
			if (state.overlayEnabled) {
				state.overlayEnabled = false;
				setTimeout(function() {
					state.selectedImage.buttonRef.focus({ preventScroll: true });
					state.selectedImageId = null;
					state.selectedGalleryId = null;
				}, 450);
			}
		},
		showPreviousImage: withSyncEvent((event) => {
			event.stopPropagation();
			const nextIndex = state.hasPreviousImage ? state.selectedImageIndex - 1 : state.galleryImages.length - 1;
			state.selectedImageId = state.galleryImages[nextIndex];
			callbacks.setOverlayStyles();
		}),
		showNextImage: withSyncEvent((event) => {
			event.stopPropagation();
			const nextIndex = state.hasNextImage ? state.selectedImageIndex + 1 : 0;
			state.selectedImageId = state.galleryImages[nextIndex];
			callbacks.setOverlayStyles();
		}),
		handleKeydown: withSyncEvent((event) => {
			if (state.overlayEnabled) {
				if (event.key === "Escape") actions.hideLightbox();
				else if (event.key === "ArrowLeft") actions.showPreviousImage(event);
				else if (event.key === "ArrowRight") actions.showNextImage(event);
				else if (event.key === "Tab") {
					const focusableElements = Array.from(document.querySelectorAll(focusableSelectors));
					const firstFocusableElement = focusableElements[0];
					const lastFocusableElement = focusableElements[focusableElements.length - 1];
					if (event.shiftKey && event.target === firstFocusableElement) {
						event.preventDefault();
						lastFocusableElement.focus();
					} else if (!event.shiftKey && event.target === lastFocusableElement) {
						event.preventDefault();
						firstFocusableElement.focus();
					}
				}
			}
		}),
		handleTouchMove: withSyncEvent((event) => {
			if (!state.overlayEnabled) return;
			event.preventDefault();
			const t = event.touches && event.touches[0];
			if (!t || !state.hasNavigation) return;
			const deltaX = t.clientX - touchStartEvent.startX;
			const deltaY = t.clientY - touchStartEvent.startY;
			const absDeltaX = Math.abs(deltaX);
			const absDeltaY = Math.abs(deltaY);
			if (!touchDrag.direction && (absDeltaX > DIRECTION_LATCH_THRESHOLD_PX || absDeltaY > DIRECTION_LATCH_THRESHOLD_PX)) {
				touchDrag.direction = absDeltaX > absDeltaY ? "horizontal" : "vertical";
				touchDrag.slideEls = Array.from(event.currentTarget.querySelectorAll(".lightbox-image-container"));
			}
			if (touchDrag.direction === "horizontal" && touchDrag.slideEls.length) {
				touchDrag.isDragging = true;
				setDragOffset(touchDrag.slideEls, deltaX);
			}
		}),
		handleTouchStart(event) {
			isTouching = true;
			if (event.touches?.length > 1) return;
			const t = event.touches && event.touches[0];
			if (t) {
				touchStartEvent.startX = t.clientX;
				touchStartEvent.startY = t.clientY;
				touchStartEvent.startTime = Date.now();
			}
			touchDrag.settle?.();
			stopDragAnimations();
			resetTouchDrag();
		},
		handleTouchCancel() {
			stopDragAnimations();
			setDragOffset(touchDrag.slideEls, 0);
			resetTouchDrag();
			lastTouchTime = Date.now();
			isTouching = false;
		},
		handleTouchEnd: withSyncEvent((event) => {
			if (event.touches?.length) return;
			const touchEndEvent = event.changedTouches && event.changedTouches[0] || event.touches && event.touches[0];
			const now = Date.now();
			if (touchEndEvent && state.overlayEnabled && touchDrag.isDragging) {
				event.preventDefault();
				const deltaX = touchEndEvent.clientX - touchStartEvent.startX;
				const deltaY = touchEndEvent.clientY - touchStartEvent.startY;
				const absDeltaX = Math.abs(deltaX);
				const absDeltaY = Math.abs(deltaY);
				const elapsedMs = now - touchStartEvent.startTime;
				const slidePitch = getSlidePitch();
				const isHorizontalDominant = absDeltaX > absDeltaY * HORIZONTAL_DOMINANCE_RATIO;
				const pastDistanceThreshold = absDeltaX > slidePitch * COMMIT_DISTANCE_RATIO;
				const shouldCommit = isHorizontalDominant && (pastDistanceThreshold || absDeltaX > FLICK_DISTANCE_PX && elapsedMs < FLICK_MAX_DURATION_MS);
				const showsNextImage = deltaX < 0;
				const slideEls = touchDrag.slideEls;
				const reducedMotion = prefersReducedMotion();
				const committedOffset = showsNextImage ? -slidePitch : slidePitch;
				const endOffset = shouldCommit ? committedOffset : 0;
				const settle = () => {
					if (touchDrag.settle !== settle) return;
					touchDrag.settle = null;
					stopDragAnimations();
					setDragOffset(slideEls, 0);
					if (!shouldCommit) return;
					if (showsNextImage) actions.showNextImage(event);
					else actions.showPreviousImage(event);
					if (reducedMotion) return;
					const hold = slideEls.map((el) => el.animate([{ opacity: 0 }, { opacity: 0 }], { fill: "forwards" }));
					touchDrag.animations = hold;
					const enlargedEl = slideEls[slideEls.length - 1];
					waitForImage(enlargedEl.querySelector("img")).then(() => {
						if (touchDrag.animations !== hold) return;
						stopDragAnimations();
						touchDrag.animations = slideEls.map((el) => el.animate([{ opacity: 0 }, { opacity: el === enlargedEl ? 1 : 0 }], {
							duration: FADE_DURATION_MS,
							easing: "ease-out"
						}));
					});
				};
				touchDrag.settle = settle;
				if (reducedMotion) settle();
				else {
					touchDrag.animations = slideEls.map((el) => el.animate([{ transform: slideTransform(deltaX) }, { transform: slideTransform(endOffset) }], {
						duration: SLIDE_DURATION_MS,
						easing: SLIDE_EASING,
						fill: "forwards"
					}));
					touchDrag.animations[0].onfinish = withScope(settle);
				}
			}
			lastTouchTime = now;
			isTouching = false;
			resetTouchDrag();
		}),
		handleScroll() {
			if (state.overlayOpened) {
				if (!isTouching && Date.now() - lastTouchTime > 450) window.scrollTo(state.scrollLeftReset, state.scrollTopReset);
			}
		},
		preloadImage() {
			const { imageId } = getContext();
			if (state.preloadedImageIds.has(imageId)) return;
			const imageMetadata = getImageMetadata(imageId);
			if (!imageMetadata) return;
			const imageLink = document.createElement("link");
			imageLink.rel = "preload";
			imageLink.as = "image";
			imageLink.href = getImageSrc(imageMetadata);
			const srcset = getImageSrcset(imageMetadata);
			if (srcset) {
				imageLink.setAttribute("imagesrcset", srcset);
				imageLink.setAttribute("imagesizes", "100vw");
			}
			document.head.appendChild(imageLink);
			state.preloadedImageIds.add(imageId);
		},
		preloadImageWithDelay() {
			const { imageId } = getContext();
			actions.cancelPreload();
			const timerId = setTimeout(withScope(() => {
				actions.preloadImage();
				state.preloadTimers.delete(imageId);
			}), 200);
			state.preloadTimers.set(imageId, timerId);
		},
		cancelPreload() {
			const { imageId } = getContext();
			if (state.preloadTimers.has(imageId)) {
				clearTimeout(state.preloadTimers.get(imageId));
				state.preloadTimers.delete(imageId);
			}
		}
	},
	callbacks: {
		setOverlayStyles() {
			if (!state.overlayEnabled) return;
			let { naturalWidth, naturalHeight, offsetWidth: originalWidth, offsetHeight: originalHeight } = state.selectedImage.imageRef;
			let { x: screenPosX, y: screenPosY } = state.selectedImage.imageRef.getBoundingClientRect();
			const naturalRatio = naturalWidth / naturalHeight;
			const originalRatio = originalWidth / originalHeight;
			if (state.selectedImage.scaleAttr === "contain") {
				if (naturalRatio > originalRatio) {
					const heightWithoutSpace = originalWidth / naturalRatio;
					screenPosY += (originalHeight - heightWithoutSpace) / 2;
					originalHeight = heightWithoutSpace;
				} else {
					const widthWithoutSpace = originalHeight * naturalRatio;
					screenPosX += (originalWidth - widthWithoutSpace) / 2;
					originalWidth = widthWithoutSpace;
				}
			}
			const imgMaxWidth = parseFloat(state.selectedImage.targetWidth && state.selectedImage.targetWidth !== "none" ? state.selectedImage.targetWidth : naturalWidth);
			const imgMaxHeight = parseFloat(state.selectedImage.targetHeight && state.selectedImage.targetHeight !== "none" ? state.selectedImage.targetHeight : naturalHeight);
			const fullSizeRatio = imgMaxWidth / imgMaxHeight;
			let containerWidth = imgMaxWidth;
			let containerHeight = imgMaxHeight;
			if (originalWidth > containerWidth || originalHeight > containerHeight) {
				containerWidth = originalWidth;
				containerHeight = originalHeight;
			}
			let horizontalPadding = 0;
			let verticalPadding = 160;
			if (480 < window.innerWidth) {
				horizontalPadding = 80;
				verticalPadding = 160;
			}
			if (960 < window.innerWidth) {
				horizontalPadding = state.hasNavigation ? 320 : 80;
				verticalPadding = 80;
			}
			const targetMaxWidth = Math.min(window.innerWidth - horizontalPadding, containerWidth);
			const targetMaxHeight = Math.min(window.innerHeight - verticalPadding, containerHeight);
			if (fullSizeRatio > targetMaxWidth / targetMaxHeight) {
				containerWidth = targetMaxWidth;
				containerHeight = containerWidth / fullSizeRatio;
			} else {
				containerHeight = targetMaxHeight;
				containerWidth = containerHeight * fullSizeRatio;
			}
			const hasCroppedSource = naturalRatio.toFixed(2) !== fullSizeRatio.toFixed(2);
			const sourceRatio = hasCroppedSource ? naturalRatio : fullSizeRatio;
			const containerScale = Math.max(originalWidth / containerWidth, originalHeight / containerHeight, originalWidth / (containerHeight * sourceRatio), originalHeight * sourceRatio / containerWidth);
			const thumbnailWidth = originalWidth / containerScale;
			const thumbnailHeight = originalHeight / containerScale;
			const cropX = (containerWidth - thumbnailWidth) / 2;
			const cropY = (containerHeight - thumbnailHeight) / 2;
			screenPosX -= cropX * containerScale;
			screenPosY -= cropY * containerScale;
			state.overlayStyles = `
					--wp--lightbox-initial-top-position: ${screenPosY}px;
					--wp--lightbox-initial-left-position: ${screenPosX}px;
					--wp--lightbox-container-width: ${containerWidth + 1}px;
					--wp--lightbox-container-height: ${containerHeight + 1}px;
					--wp--lightbox-image-width: ${containerWidth}px;
					--wp--lightbox-image-height: ${containerHeight}px;
					--wp--lightbox-initial-clip: inset(${cropY}px ${cropX}px);
					--wp--lightbox-thumbnail-width: ${hasCroppedSource ? thumbnailWidth : containerWidth}px;
					--wp--lightbox-thumbnail-height: ${hasCroppedSource ? thumbnailHeight : containerHeight}px;
					--wp--lightbox-scale: ${containerScale};
					--wp--lightbox-scrollbar-width: ${window.innerWidth - document.documentElement.clientWidth}px;
				`;
		},
		setButtonStyles() {
			const { ref } = getElement();
			if (!ref) return;
			const { imageId } = getContext();
			const imageMetadata = getImageMetadata(imageId);
			if (!imageMetadata) return;
			imageMetadata.imageRef = ref;
			imageMetadata.currentSrc = ref.currentSrc;
			const { naturalWidth, naturalHeight, offsetWidth, offsetHeight } = ref;
			if (naturalWidth === 0 || naturalHeight === 0) return;
			const container = ref.closest(".wp-lightbox-container");
			if (!container) return;
			const containerWidth = container.clientWidth;
			let containerHeight = container.clientHeight;
			const caption = container.querySelector("figcaption");
			if (caption) {
				const captionComputedStyle = window.getComputedStyle(caption);
				if (!["absolute", "fixed"].includes(captionComputedStyle.position)) containerHeight = containerHeight - caption.offsetHeight - parseFloat(captionComputedStyle.marginTop) - parseFloat(captionComputedStyle.marginBottom);
			}
			const buttonOffsetTop = containerHeight - offsetHeight;
			const buttonOffsetRight = containerWidth - offsetWidth;
			let buttonTop = buttonOffsetTop + 16;
			let buttonRight = buttonOffsetRight + 16;
			if (imageMetadata.scaleAttr === "contain") {
				const naturalRatio = naturalWidth / naturalHeight;
				if (naturalRatio >= offsetWidth / offsetHeight) {
					buttonTop = (offsetHeight - offsetWidth / naturalRatio) / 2 + buttonOffsetTop + 16;
					buttonRight = buttonOffsetRight + 16;
				} else {
					const referenceWidth = offsetHeight * naturalRatio;
					buttonTop = buttonOffsetTop + 16;
					buttonRight = (offsetWidth - referenceWidth) / 2 + buttonOffsetRight + 16;
				}
			}
			imageMetadata.buttonTop = buttonTop;
			imageMetadata.buttonRight = buttonRight;
		},
		setOverlayFocus() {
			if (state.overlayEnabled) {
				const { ref } = getElement();
				ref.focus();
			}
		},
		setInertElements() {
			if (!state.overlayEnabled) {
				inertElements.forEach((el) => el.removeAttribute("inert"));
				inertElements = [];
				return;
			}
			const { ref } = getElement();
			let node = ref;
			while (node && node !== document.body && node.parentElement) {
				for (const sibling of node.parentElement.children) if (sibling !== node && !sibling.hasAttribute("inert")) {
					sibling.setAttribute("inert", "");
					inertElements.push(sibling);
				}
				node = node.parentElement;
			}
		},
		initTriggerButton() {
			const { imageId } = getContext();
			const { ref } = getElement();
			const imageMetadata = getImageMetadata(imageId);
			if (imageMetadata) imageMetadata.buttonRef = ref;
		}
	}
}, { lock: true });

//# sourceMappingURL=view.js.map