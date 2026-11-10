import { store } from "@wordpress/interactivity";

// packages/block-library/build-module/file/utils/index.mjs
/**
* Uses a combination of user agent matching and feature detection to determine whether
* the current browser supports rendering PDFs inline.
*
* @return {boolean} Whether or not the browser supports inline PDFs.
*/
const browserSupportsPdfs = () => {
	if (window.navigator.pdfViewerEnabled) return true;
	if (window.navigator.userAgent.indexOf("Mobi") > -1) return false;
	if (window.navigator.userAgent.indexOf("Android") > -1) return false;
	if (window.navigator.userAgent.indexOf("Macintosh") > -1 && window.navigator.maxTouchPoints && window.navigator.maxTouchPoints > 2) return false;
	if (!!(window.ActiveXObject || "ActiveXObject" in window) && !(createActiveXObject("AcroPDF.PDF") || createActiveXObject("PDF.PdfCtrl"))) return false;
	return true;
};
/**
* Helper function for creating ActiveX objects, catching any errors that are thrown
* when it's generated.
*
* @param {string} type The name of the ActiveX object to create.
* @return {window.ActiveXObject|undefined} The generated ActiveXObject, or null if it failed.
*/
const createActiveXObject = (type) => {
	let ax;
	try {
		ax = new window.ActiveXObject(type);
	} catch {
		ax = void 0;
	}
	return ax;
};

// packages/block-library/build-module/file/view.mjs
store("core/file", { state: { get hasPdfPreview() {
	return browserSupportsPdfs();
} } }, { lock: true });

//# sourceMappingURL=view.js.map