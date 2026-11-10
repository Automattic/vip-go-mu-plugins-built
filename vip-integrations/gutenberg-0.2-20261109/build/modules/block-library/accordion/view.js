import { getContext, store } from "@wordpress/interactivity";

// packages/block-library/build-module/accordion/view.mjs
let hashHandled = false;
const { actions } = store("core/accordion", {
	state: {
		get isOpen() {
			const { id, accordionItems } = getContext();
			const accordionItem = accordionItems.find((item) => item.id === id);
			return accordionItem ? accordionItem.isOpen : false;
		},
		get isHidden() {
			const { id, accordionItems } = getContext();
			return accordionItems.find((item) => item.id === id)?.isOpen ? null : "until-found";
		}
	},
	actions: {
		toggle: () => {
			const { id, autoclose, accordionItems } = getContext();
			const accordionItem = accordionItems.find((item) => item.id === id);
			if (autoclose) accordionItems.forEach((item) => {
				item.isOpen = item.id === id ? !accordionItem.isOpen : false;
			});
			else accordionItem.isOpen = !accordionItem.isOpen;
		},
		openPanelByHash: () => {
			if (hashHandled) return;
			const { id, accordionItems, autoclose } = getContext();
			const targetElement = document.querySelector(":target");
			if (!targetElement) return;
			const panelElement = window.document.querySelector(".wp-block-accordion-panel[aria-labelledby=\"" + id + "\"]");
			if (!panelElement || !panelElement.contains(targetElement)) return;
			hashHandled = true;
			if (autoclose) accordionItems.forEach((item) => {
				item.isOpen = item.id === id;
			});
			else {
				const targetItem = accordionItems.find((item) => item.id === id);
				if (targetItem) targetItem.isOpen = true;
			}
			window.setTimeout(() => {
				targetElement.scrollIntoView();
			}, 0);
		},
		handleBeforeMatch: () => {
			const { id, autoclose, accordionItems } = getContext();
			const accordionItem = accordionItems.find((item) => item.id === id);
			if (accordionItem) {
				if (autoclose) accordionItems.forEach((item) => {
					item.isOpen = item.id === id;
				});
				else accordionItem.isOpen = true;
			}
		}
	},
	callbacks: {
		initAccordionItems: () => {
			const { id, openByDefault, accordionItems } = getContext();
			accordionItems.push({
				id,
				isOpen: openByDefault
			});
			actions.openPanelByHash();
		},
		hashChange: () => {
			hashHandled = false;
			actions.openPanelByHash();
		}
	}
}, { lock: true });

//# sourceMappingURL=view.js.map