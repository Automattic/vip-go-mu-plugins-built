(function(exports, _wordpress_data, _wordpress_i18n, _wordpress_blob, _wordpress_private_apis, _wordpress_element, _wordpress_compose, react_jsx_runtime) {

"use strict";
// \0rolldown/runtime.js
	var __defProp = Object.defineProperty;
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) {
			__defProp(target, name, {
				get: all[name],
				enumerable: true
			});
		}
		if (!no_symbols) {
			__defProp(target, Symbol.toStringTag, { value: "Module" });
		}
		return target;
	};

// packages/upload-media/build-module/store/types.mjs
	let Type = /* @__PURE__ */ function(Type) {
		Type["Unknown"] = "REDUX_UNKNOWN";
		Type["Add"] = "ADD_ITEM";
		Type["Prepare"] = "PREPARE_ITEM";
		Type["Cancel"] = "CANCEL_ITEM";
		Type["Remove"] = "REMOVE_ITEM";
		Type["RetryItem"] = "RETRY_ITEM";
		Type["ScheduleRetry"] = "SCHEDULE_RETRY";
		Type["PauseItem"] = "PAUSE_ITEM";
		Type["ResumeItem"] = "RESUME_ITEM";
		Type["PauseQueue"] = "PAUSE_QUEUE";
		Type["ResumeQueue"] = "RESUME_QUEUE";
		Type["OperationStart"] = "OPERATION_START";
		Type["OperationFinish"] = "OPERATION_FINISH";
		Type["AddOperations"] = "ADD_OPERATIONS";
		Type["CacheBlobUrl"] = "CACHE_BLOB_URL";
		Type["RevokeBlobUrls"] = "REVOKE_BLOB_URLS";
		Type["UpdateProgress"] = "UPDATE_PROGRESS";
		Type["AccumulateSubSize"] = "ACCUMULATE_SUB_SIZE";
		Type["UpdateSettings"] = "UPDATE_SETTINGS";
		return Type;
	}({});
	let ItemStatus = /* @__PURE__ */ function(ItemStatus) {
		ItemStatus["Queued"] = "QUEUED";
		ItemStatus["Processing"] = "PROCESSING";
		ItemStatus["Paused"] = "PAUSED";
		ItemStatus["PendingRetry"] = "PENDING_RETRY";
		ItemStatus["Uploaded"] = "UPLOADED";
		ItemStatus["Error"] = "ERROR";
		return ItemStatus;
	}({});
	let OperationType = /* @__PURE__ */ function(OperationType) {
		OperationType["Prepare"] = "PREPARE";
		OperationType["Upload"] = "UPLOAD";
		OperationType["ResizeCrop"] = "RESIZE_CROP";
		OperationType["Rotate"] = "ROTATE";
		OperationType["TranscodeImage"] = "TRANSCODE_IMAGE";
		OperationType["TranscodeGif"] = "TRANSCODE_GIF";
		OperationType["ThumbnailGeneration"] = "THUMBNAIL_GENERATION";
		OperationType["Finalize"] = "FINALIZE";
		OperationType["DetectUltraHdr"] = "DETECT_ULTRAHDR";
		return OperationType;
	}({});

// packages/upload-media/build-module/store/constants.mjs
	const STORE_NAME = "core/upload-media";
	/**
	* Default automatic retry behavior for failed uploads.
	*
	* Four total attempts (initial + 3 retries) with exponential backoff:
	* ~1s, then ~2s, capped at 30s. The jitter factor adds randomness to
	* the delay so simultaneous failures do not retry in lockstep.
	*/
	const DEFAULT_RETRY_SETTINGS = {
		maxRetryAttempts: 3,
		initialRetryDelayMs: 1e3,
		maxRetryDelayMs: 3e4,
		backoffMultiplier: 2,
		retryJitter: .1
	};
	/**
	* MIME types supported by client-side media processing.
	*
	* These are the image formats that can be processed using
	* WebAssembly-based vips in the browser.
	*/
	const CLIENT_SIDE_SUPPORTED_MIME_TYPES = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/avif"
	];
	/**
	* HEIC/HEIF MIME types.
	*
	* These formats use the HEVC codec which has patent/licensing restrictions.
	* Instead of shipping our own decoder, the client falls back to the browser's
	* native createImageBitmap() which leverages OS/browser-licensed HEVC codecs.
	*/
	const HEIC_MIME_TYPES = ["image/heic", "image/heif"];

// packages/upload-media/build-module/store/reducer.mjs
	const noop = () => {};
	const DEFAULT_STATE = {
		queue: [],
		queueStatus: "active",
		blobUrls: {},
		settings: {
			mediaUpload: noop,
			maxConcurrentUploads: 5,
			maxConcurrentImageProcessing: 2,
			retry: { ...DEFAULT_RETRY_SETTINGS }
		},
		failureCount: 0
	};
	function reducer(state = DEFAULT_STATE, action = { type: Type.Unknown }) {
		switch (action.type) {
			case Type.PauseQueue: return {
				...state,
				queueStatus: "paused"
			};
			case Type.ResumeQueue: return {
				...state,
				queueStatus: "active"
			};
			case Type.PauseItem: return {
				...state,
				queue: state.queue.map((item) => item.id === action.id ? {
					...item,
					status: ItemStatus.Paused
				} : item)
			};
			case Type.ResumeItem: return {
				...state,
				queue: state.queue.map((item) => item.id === action.id ? {
					...item,
					status: ItemStatus.Processing
				} : item)
			};
			case Type.Add: return {
				...state,
				queue: [...state.queue, action.item]
			};
			case Type.Cancel: {
				const cancelled = state.queue.find((item) => item.id === action.id);
				return {
					...state,
					failureCount: cancelled && !cancelled.parentId ? state.failureCount + 1 : state.failureCount,
					queue: state.queue.map((item) => item.id === action.id ? {
						...item,
						error: action.error
					} : item)
				};
			}
			case Type.RetryItem: return {
				...state,
				queue: state.queue.map((item) => item.id === action.id ? {
					...item,
					status: ItemStatus.Processing,
					error: void 0,
					retryCount: (item.retryCount ?? 0) + 1,
					abortController: new AbortController(),
					currentOperation: void 0
				} : item)
			};
			case Type.ScheduleRetry: return {
				...state,
				queue: state.queue.map((item) => item.id === action.id ? {
					...item,
					status: ItemStatus.PendingRetry,
					error: action.error,
					retryCount: action.retryCount,
					nextRetryTimestamp: action.nextRetryTimestamp
				} : item)
			};
			case Type.Remove: return {
				...state,
				queue: state.queue.filter((item) => item.id !== action.id)
			};
			case Type.OperationStart: return {
				...state,
				queue: state.queue.map((item) => item.id === action.id ? {
					...item,
					currentOperation: action.operation
				} : item)
			};
			case Type.AddOperations: return {
				...state,
				queue: state.queue.map((item) => {
					if (item.id !== action.id) return item;
					return {
						...item,
						operations: [...item.operations || [], ...action.operations]
					};
				})
			};
			case Type.OperationFinish: return {
				...state,
				queue: state.queue.map((item) => {
					if (item.id !== action.id) return item;
					const operations = item.operations ? item.operations.slice(1) : [];
					const attachment = item.attachment || action.item.attachment ? {
						...item.attachment,
						...action.item.attachment
					} : void 0;
					return {
						...item,
						currentOperation: void 0,
						operations,
						...action.item,
						attachment,
						additionalData: {
							...item.additionalData,
							...action.item.additionalData
						}
					};
				})
			};
			case Type.CacheBlobUrl: {
				const blobUrls = state.blobUrls[action.id] || [];
				return {
					...state,
					blobUrls: {
						...state.blobUrls,
						[action.id]: [...blobUrls, action.blobUrl]
					}
				};
			}
			case Type.RevokeBlobUrls: {
				const newBlobUrls = { ...state.blobUrls };
				delete newBlobUrls[action.id];
				return {
					...state,
					blobUrls: newBlobUrls
				};
			}
			case Type.UpdateProgress: return {
				...state,
				queue: state.queue.map((item) => item.id === action.id ? {
					...item,
					progress: action.progress
				} : item)
			};
			case Type.AccumulateSubSize: return {
				...state,
				queue: state.queue.map((item) => item.id === action.id ? {
					...item,
					subSizes: [...item.subSizes || [], action.subSize]
				} : item)
			};
			case Type.UpdateSettings: return {
				...state,
				settings: {
					...state.settings,
					...action.settings
				}
			};
		}
		return state;
	}

// packages/upload-media/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		getItems: () => getItems,
		getSettings: () => getSettings,
		isUploading: () => isUploading,
		isUploadingById: () => isUploadingById,
		isUploadingByUrl: () => isUploadingByUrl
	}, 1);
	/**
	* Returns all items currently being uploaded.
	*
	* @param state Upload state.
	*
	* @return Queue items.
	*/
	function getItems(state) {
		return state.queue;
	}
	/**
	* Determines whether any upload is currently in progress.
	*
	* @param state Upload state.
	*
	* @return Whether any upload is currently in progress.
	*/
	function isUploading(state) {
		return state.queue.length >= 1;
	}
	/**
	* Determines whether an upload is currently in progress given an attachment URL.
	*
	* @param state Upload state.
	* @param url   Attachment URL.
	*
	* @return Whether upload is currently in progress for the given attachment.
	*/
	function isUploadingByUrl(state, url) {
		return state.queue.some((item) => item.attachment?.url === url || item.sourceUrl === url);
	}
	/**
	* Determines whether an upload is currently in progress given an attachment ID.
	*
	* @param state        Upload state.
	* @param attachmentId Attachment ID.
	*
	* @return Whether upload is currently in progress for the given attachment.
	*/
	function isUploadingById(state, attachmentId) {
		return state.queue.some((item) => item.attachment?.id === attachmentId || item.sourceAttachmentId === attachmentId);
	}
	/**
	* Returns the media upload settings.
	*
	* @param state Upload state.
	*
	* @return Settings
	*/
	function getSettings(state) {
		return state.settings;
	}

// packages/upload-media/build-module/store/private-selectors.mjs
	var private_selectors_exports = /* @__PURE__ */ __exportAll({
		getActiveImageProcessingCount: () => getActiveImageProcessingCount,
		getActiveUploadCount: () => getActiveUploadCount,
		getActiveVideoProcessingCount: () => getActiveVideoProcessingCount,
		getAllItems: () => getAllItems,
		getBlobUrls: () => getBlobUrls,
		getFailedItems: () => getFailedItems,
		getFailureCount: () => getFailureCount,
		getItem: () => getItem,
		getItemProgress: () => getItemProgress,
		getPendingImageProcessing: () => getPendingImageProcessing,
		getPendingUploads: () => getPendingUploads,
		getPendingVideoProcessing: () => getPendingVideoProcessing,
		hasPendingItemsByParentId: () => hasPendingItemsByParentId,
		isBatchUploaded: () => isBatchUploaded,
		isPaused: () => isPaused
	}, 1);
	/**
	* Returns all items currently being uploaded.
	*
	* @param state Upload state.
	*
	* @return Queue items.
	*/
	function getAllItems(state) {
		return state.queue;
	}
	/**
	* Returns how many top-level items have been cancelled because they failed.
	*
	* Failed items are removed from the queue just like successful ones, so an
	* empty queue on its own says nothing about whether anything was uploaded.
	* This tally only ever grows: to learn how many items failed within a single
	* batch, read it when the batch starts and subtract that from its later value.
	*
	* @param state Upload state.
	*
	* @return Number of failed uploads since the editor loaded.
	*/
	function getFailureCount(state) {
		return state.failureCount;
	}
	/**
	* Returns a specific item given its unique ID.
	*
	* @param state Upload state.
	* @param id    Item ID.
	*
	* @return Queue item.
	*/
	function getItem(state, id) {
		return state.queue.find((item) => item.id === id);
	}
	/**
	* Determines whether a batch has been successfully uploaded, given its unique ID.
	*
	* @param state   Upload state.
	* @param batchId Batch ID.
	*
	* @return Whether a batch has been uploaded.
	*/
	function isBatchUploaded(state, batchId) {
		return state.queue.filter((item) => batchId === item.batchId).length === 0;
	}
	/**
	* Determines whether uploading is currently paused.
	*
	* @param state Upload state.
	*
	* @return Whether uploading is currently paused.
	*/
	function isPaused(state) {
		return state.queueStatus === "paused";
	}
	/**
	* Returns all cached blob URLs for a given item ID.
	*
	* @param state Upload state.
	* @param id    Item ID
	*
	* @return List of blob URLs.
	*/
	function getBlobUrls(state, id) {
		return state.blobUrls[id] || [];
	}
	/**
	* Returns the number of items currently uploading.
	*
	* @param state Upload state.
	*
	* @return Number of items currently uploading.
	*/
	function getActiveUploadCount(state) {
		return state.queue.filter((item) => item.currentOperation === OperationType.Upload).length;
	}
	/**
	* Returns items that are waiting for upload (next operation is Upload but not yet started).
	*
	* @param state Upload state.
	*
	* @return Items pending upload.
	*/
	function getPendingUploads(state) {
		return state.queue.filter((item) => {
			return (Array.isArray(item.operations?.[0]) ? item.operations[0][0] : item.operations?.[0]) === OperationType.Upload && item.currentOperation !== OperationType.Upload;
		});
	}
	/**
	* Returns the number of items currently performing image processing operations.
	*
	* This counts items whose current operation is ResizeCrop or Rotate,
	* used to enforce the image processing concurrency limit.
	*
	* @param state Upload state.
	*
	* @return Number of items currently processing images.
	*/
	function getActiveImageProcessingCount(state) {
		return state.queue.filter((item) => item.currentOperation === OperationType.ResizeCrop || item.currentOperation === OperationType.Rotate).length;
	}
	/**
	* Returns the number of items currently performing video processing operations.
	*
	* This counts items whose current operation is TranscodeGif,
	* used to enforce the video processing concurrency limit (1 at a time).
	*
	* @param state Upload state.
	*
	* @return Number of items currently processing video.
	*/
	function getActiveVideoProcessingCount(state) {
		return state.queue.filter((item) => item.currentOperation === OperationType.TranscodeGif).length;
	}
	/**
	* Returns items waiting for image processing (next operation is ResizeCrop
	* or Rotate but not yet started).
	*
	* @param state Upload state.
	*
	* @return Items pending image processing.
	*/
	function getPendingImageProcessing(state) {
		return state.queue.filter((item) => {
			const nextOperation = Array.isArray(item.operations?.[0]) ? item.operations[0][0] : item.operations?.[0];
			return (nextOperation === OperationType.ResizeCrop || nextOperation === OperationType.Rotate) && item.currentOperation !== OperationType.ResizeCrop && item.currentOperation !== OperationType.Rotate;
		});
	}
	/**
	* Returns items waiting for video processing (next operation is TranscodeGif
	* but not yet started).
	*
	* @param state Upload state.
	*
	* @return Items pending video processing.
	*/
	function getPendingVideoProcessing(state) {
		return state.queue.filter((item) => {
			return (Array.isArray(item.operations?.[0]) ? item.operations[0][0] : item.operations?.[0]) === OperationType.TranscodeGif && item.currentOperation !== OperationType.TranscodeGif;
		});
	}
	/**
	* Returns items that failed with an error.
	*
	* @param state Upload state.
	*
	* @return Failed items.
	*/
	function getFailedItems(state) {
		return state.queue.filter((item) => item.error !== void 0);
	}
	/**
	* Returns true if any child items with the given parentId exist in the queue.
	*
	* @param state    Upload state.
	* @param parentId Parent item ID.
	*
	* @return Whether any child items with the given parentId exist in the queue.
	*/
	function hasPendingItemsByParentId(state, parentId) {
		return state.queue.some((item) => item.parentId === parentId);
	}
	/**
	* Returns the progress of a specific item.
	*
	* @param state Upload state.
	* @param id    Item ID.
	*
	* @return Progress value (0-100), or undefined if item not found.
	*/
	function getItemProgress(state, id) {
		return state.queue.find((i) => i.id === id)?.progress;
	}

// node_modules/.store/uuid@14.0.2-ALlTd6-Rf9bZs703d7TIjQ/node_modules/uuid/dist/stringify.js
	const byteToHex = [];
	for (let i = 0; i < 256; ++i) byteToHex.push((i + 256).toString(16).slice(1));
	function unsafeStringify(arr, offset = 0) {
		return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
	}

// node_modules/.store/uuid@14.0.2-ALlTd6-Rf9bZs703d7TIjQ/node_modules/uuid/dist/rng.js
	const rnds8 = /* @__PURE__ */ new Uint8Array(16);
	function rng() {
		return crypto.getRandomValues(rnds8);
	}

// node_modules/.store/uuid@14.0.2-ALlTd6-Rf9bZs703d7TIjQ/node_modules/uuid/dist/v4.js
	function v4(options, buf, offset) {
		if (!buf && !options && crypto.randomUUID) return crypto.randomUUID();
		return _v4(options, buf, offset);
	}
	function _v4(options, buf, offset) {
		options = options || {};
		const rnds = options.random ?? options.rng?.() ?? rng();
		if (rnds.length < 16) throw new Error("Random bytes length must be >= 16");
		rnds[6] = rnds[6] & 15 | 64;
		rnds[8] = rnds[8] & 63 | 128;
		if (buf) {
			offset = offset || 0;
			if (offset < 0 || offset + 16 > buf.length) throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
			for (let i = 0; i < 16; ++i) buf[offset + i] = rnds[i];
			return buf;
		}
		return unsafeStringify(rnds);
	}

// packages/upload-media/build-module/store/utils/retry.mjs
/**
	* Calculates the delay before the next retry attempt using exponential backoff with jitter.
	*
	* The formula is: min(initialDelay * multiplier^(attempt-1), maxDelay) * (1 +/- jitter)
	*
	* @param options - Configuration for the retry delay calculation.
	* @return The delay in milliseconds before the next retry.
	*
	* @example
	* // With defaults: attempt 1 = ~1000ms, attempt 2 = ~2000ms, attempt 3 = ~4000ms
	* calculateRetryDelay({
	*   attempt: 1,
	*   initialDelay: 1000,
	*   maxDelay: 30000,
	*   multiplier: 2,
	*   jitter: 0.1,
	* });
	*/
	function calculateRetryDelay(options) {
		const { attempt, initialDelay, maxDelay, multiplier, jitter } = options;
		const exponentialDelay = initialDelay * Math.pow(multiplier, attempt - 1);
		const cappedDelay = Math.min(exponentialDelay, maxDelay);
		const jitterFactor = 1 + (Math.random() * 2 - 1) * jitter;
		return Math.floor(cappedDelay * jitterFactor);
	}
	/**
	* Patterns in error messages that indicate a transient/retryable condition.
	*
	* The upload path rejects with plain `Error` instances from `fetch` and
	* `@wordpress/api-fetch`, so message matching is the most reliable signal.
	* Covers Chrome (`Failed to fetch`), Safari (`Load failed`), Node DNS/TCP
	* failures, and the localized `apiFetch` `fetch_error` message.
	*/
	const RETRYABLE_MESSAGE_PATTERNS = [
		/network/i,
		/timeout/i,
		/ECONNRESET/i,
		/fetch failed/i,
		/connection/i,
		/socket/i,
		/ETIMEDOUT/i,
		/ENOTFOUND/i,
		/Could not get a valid response/i,
		/Failed to fetch/i,
		/Load failed/i
	];
	/**
	* Determines whether an upload error should trigger an automatic retry.
	*
	* Returns `false` once the retry budget is exhausted, otherwise returns
	* `true` if the error message looks transient (see `RETRYABLE_MESSAGE_PATTERNS`).
	*
	* Accepts both `Error` instances and plain strings: the editor's media-upload
	* wrapper forwards only the error *message* (a string) to the queue, so the
	* upload path frequently rejects with a string rather than an `Error`.
	*
	* @param error      The error that occurred, or its message.
	* @param retryCount The number of retries already attempted.
	* @param maxRetries The maximum number of retries allowed.
	* @return Whether the error should be retried.
	*/
	function shouldRetryError(error, retryCount, maxRetries) {
		if (retryCount >= maxRetries) return false;
		const message = typeof error === "string" ? error : error?.message || "";
		return RETRYABLE_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));
	}
	/**
	* Module-level storage for retry timer IDs.
	*
	* Timer references are kept outside Redux state because they are
	* non-serializable and only needed for cleanup on cancellation.
	*/
	const retryTimers = /* @__PURE__ */ new Map();
	/**
	* Clears any pending retry timer for the given item.
	*
	* @param id Item ID.
	*/
	function clearRetryTimer(id) {
		const pendingTimer = retryTimers.get(id);
		if (pendingTimer !== void 0) {
			clearTimeout(pendingTimer);
			retryTimers.delete(id);
		}
	}

// packages/upload-media/build-module/feature-detection.mjs
/**
	* Cached result of feature detection.
	*/
	let cachedResult = null;
	/**
	* Detects whether the browser supports client-side media processing.
	*
	* Checks (in order of evaluation):
	* 1. WebAssembly support (required for wasm-vips).
	* 2. SharedArrayBuffer support (required for WASM threading; relies on
	*    cross-origin isolation headers being set).
	* 3. Web Worker support (baseline requirement for the processing worker).
	* 4. Device memory: disables on devices reporting ≤ 2 GB of RAM.
	* 5. Hardware concurrency: disables on devices reporting fewer than 2 CPU cores.
	* 6. Network conditions: disables when the data saver flag is on, or when the
	*    connection's effective type is `slow-2g` or `2g`.
	* 7. CSP compatibility for blob URL workers: a probe Worker is created from a
	*    blob: URL to confirm the site's Content Security Policy permits inline
	*    worker creation (`worker-src` must allow `blob:`).
	*
	* Results are cached after the first call. Use `clearFeatureDetectionCache()` to reset.
	*
	* @return Feature detection result with supported status and reason if not supported.
	*/
	function detectClientSideMediaSupport() {
		if (cachedResult !== null) return cachedResult;
		if (typeof WebAssembly === "undefined") {
			cachedResult = {
				supported: false,
				reason: "WebAssembly is not supported in this browser."
			};
			return cachedResult;
		}
		if (typeof SharedArrayBuffer === "undefined") {
			cachedResult = {
				supported: false,
				reason: "SharedArrayBuffer is not available. This may be due to missing cross-origin isolation headers."
			};
			return cachedResult;
		}
		if (typeof Worker === "undefined") {
			cachedResult = {
				supported: false,
				reason: "Web Workers are not supported in this browser."
			};
			return cachedResult;
		}
		if (typeof navigator !== "undefined" && "deviceMemory" in navigator && navigator.deviceMemory <= 2) {
			cachedResult = {
				supported: false,
				reason: "Device has insufficient memory for client-side media processing."
			};
			return cachedResult;
		}
		if (typeof navigator !== "undefined" && "hardwareConcurrency" in navigator && navigator.hardwareConcurrency < 2) {
			cachedResult = {
				supported: false,
				reason: "Device has insufficient CPU cores for client-side media processing."
			};
			return cachedResult;
		}
		if (typeof navigator !== "undefined") {
			const connection = navigator.connection;
			if (connection) {
				if (connection.saveData) {
					cachedResult = {
						supported: false,
						reason: "Data saver mode is enabled."
					};
					return cachedResult;
				}
				if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
					cachedResult = {
						supported: false,
						reason: "Network connection is too slow for client-side media processing."
					};
					return cachedResult;
				}
			}
		}
		if (typeof window !== "undefined") try {
			const testBlob = new Blob([""], { type: "application/javascript" });
			const testUrl = URL.createObjectURL(testBlob);
			try {
				new Worker(testUrl).terminate();
			} finally {
				URL.revokeObjectURL(testUrl);
			}
		} catch {
			cachedResult = {
				supported: false,
				reason: "The site's Content Security Policy (CSP) does not allow blob: workers. The worker-src directive must include blob: to enable client-side media processing."
			};
			return cachedResult;
		}
		cachedResult = { supported: true };
		return cachedResult;
	}
	/**
	* Returns whether client-side media processing is supported.
	*
	* This is a convenience function that returns just the boolean result.
	*
	* @return Whether client-side media processing is supported.
	*/
	function isClientSideMediaSupported() {
		return detectClientSideMediaSupport().supported;
	}
	/**
	* Detects whether the browser can decode HEIC images via canvas APIs.
	*
	* This checks for createImageBitmap and OffscreenCanvas support,
	* which are sufficient to convert HEIC to JPEG without VIPS/WASM.
	* Safari supports both APIs and can natively decode HEIC via
	* createImageBitmap(), leveraging macOS platform codecs.
	*
	* @return Whether HEIC canvas-based processing is supported.
	*/
	function isHeicCanvasSupported() {
		return typeof createImageBitmap !== "undefined" && typeof OffscreenCanvas !== "undefined";
	}
	/**
	* Clears the cached feature detection result.
	*
	* This is primarily useful for testing purposes.
	*/
	function clearFeatureDetectionCache() {
		cachedResult = null;
	}
	/**
	* Estimated bytes of WASM memory required per decoded pixel.
	*
	* A decoded image needs roughly width * height * 4 bytes (RGBA) in memory,
	* plus additional working buffers while vips processes and re-encodes it.
	* Four bytes per pixel is a deliberately conservative lower bound.
	*/
	const BYTES_PER_PIXEL = 4;
	/**
	* Memory budget (in bytes) for processing interlaced images client-side.
	*
	* wasm-vips can grow its WASM memory up to 2 GiB, but growth can fail on
	* memory-constrained devices. Progressive JPEGs and Adam7-interlaced PNGs
	* cannot be decoded with shrink-on-load, so the entire image must be buffered
	* at once. A tighter ~0.75 GiB budget leaves headroom for the encode step and
	* avoids the out-of-memory failures these images hit.
	*/
	const INTERLACED_MEMORY_BUDGET = 805306368;
	/**
	* Memory budget (in bytes) for processing non-interlaced images client-side.
	*
	* Baseline images can be shrunk during decode, so vips needs far less peak
	* memory. A generous ~1.5 GiB budget acts as a backstop against extreme sizes
	* while leaving the vast majority of real-world uploads on the client.
	*/
	const BASELINE_MEMORY_BUDGET = 1610612736;
	/**
	* Determines whether an image is too large to process client-side.
	*
	* Very large images, especially interlaced/progressive ones, can exceed the
	* 2 GiB wasm-vips memory ceiling and fail to process. Such images are better
	* handled by the server, which has no comparable per-image memory ceiling.
	*
	* @param dimensions The image's parsed dimensions and interlacing.
	* @return Whether the image's estimated memory use exceeds the client budget.
	*/
	function exceedsClientProcessingMemory(dimensions) {
		const { width, height, interlaced } = dimensions;
		return width * height * BYTES_PER_PIXEL > (interlaced ? INTERLACED_MEMORY_BUDGET : BASELINE_MEMORY_BUDGET);
	}

// packages/upload-media/build-module/image-file.mjs
/**
	* ImageFile class.
	*
	* Small wrapper around the `File` class to hold
	* information about current dimensions and original
	* dimensions, in case the image was resized.
	*/
	var ImageFile = class extends File {
		width = 0;
		height = 0;
		originalWidth = 0;
		originalHeight = 0;
		get wasResized() {
			return (this.originalWidth || 0) > this.width || (this.originalHeight || 0) > this.height;
		}
		constructor(file, width, height, originalWidth, originalHeight) {
			super([file], file.name, {
				type: file.type,
				lastModified: file.lastModified
			});
			this.width = width;
			this.height = height;
			this.originalWidth = originalWidth;
			this.originalHeight = originalHeight;
		}
	};

// packages/upload-media/build-module/utils.mjs
/**
	* Converts a Blob to a File with a default name like "image.png".
	*
	* If it is already a File object, it is returned unchanged.
	*
	* Handles cross-realm File objects (e.g., from iframes) that have a `name`
	* property but fail `instanceof File` checks because the File constructor
	* differs between browsing contexts.
	*
	* @param fileOrBlob Blob object.
	* @return File object.
	*/
	function convertBlobToFile(fileOrBlob) {
		if (fileOrBlob instanceof File) return fileOrBlob;
		if ("name" in fileOrBlob && typeof fileOrBlob.name === "string") return new File([fileOrBlob], fileOrBlob.name, {
			type: fileOrBlob.type,
			lastModified: fileOrBlob.lastModified
		});
		const ext = fileOrBlob.type.split("/")[1];
		const mediaType = "application/pdf" === fileOrBlob.type ? "document" : fileOrBlob.type.split("/")[0];
		return new File([fileOrBlob], `${mediaType}.${ext}`, { type: fileOrBlob.type });
	}
	/**
	* Renames a given file and returns a new file.
	*
	* Copies over the last modified time.
	*
	* @param file File object.
	* @param name File name.
	* @return Renamed file object.
	*/
	function renameFile(file, name) {
		return new File([file], name, {
			type: file.type,
			lastModified: file.lastModified
		});
	}
	/**
	* Clones a given file object.
	*
	* @param file File object.
	* @return New file object.
	*/
	function cloneFile(file) {
		return renameFile(file, file.name);
	}
	/**
	* Returns file basename without extension.
	*
	* For example, turns "my-awesome-file.jpeg" into "my-awesome-file".
	*
	* @param name File name.
	* @return File basename.
	*/
	function getFileBasename(name) {
		return name.includes(".") ? name.split(".").slice(0, -1).join(".") : name;
	}
	/**
	* Detects whether a file buffer contains an animated GIF.
	*
	* Performs binary analysis of the GIF file structure:
	* 1. Checks for the GIF magic bytes ("GIF8")
	* 2. Counts frame blocks by scanning for Graphic Control Extension headers
	*    (Block Terminator 0x00 + Extension Introducer 0x21 + Graphic Control Label 0xF9)
	* 3. Returns true if more than 1 frame is found
	*
	* This is a deliberately cheap heuristic, not a full GIF parser. It scans
	* the raw bytes for the Graphic Control Extension marker rather than walking
	* the block structure, which has two known limitations:
	*
	* - False positives: the 0x00 0x21 0xF9 byte sequence can occur coincidentally
	*   inside LZW-compressed image data, so a single-frame GIF may be reported as
	*   animated.
	* - False negatives: Graphic Control Extension blocks are optional per the GIF
	*   spec, so an animated GIF that omits them is reported as static.
	*
	* Both outcomes are non-destructive: the worker's ImageDecoder frame count is
	* the authoritative source, so a misdetected static GIF still encodes to an
	* accurate (1-frame) video, and a misdetected animated GIF simply falls back
	* to the normal image upload pipeline. A full structural parse is intentionally
	* avoided here to keep this off the hot path of every GIF upload.
	*
	* Based on the GIF specification:
	*
	* @see http://www.matthewflickinger.com/lab/whatsinagif/
	*
	* @param buffer File ArrayBuffer.
	* @return Whether the buffer contains an animated GIF.
	*/
	function isAnimatedGif(buffer) {
		const view = new Uint8Array(buffer);
		if (view.length < 4 || view[0] !== 71 || view[1] !== 73 || view[2] !== 70 || view[3] !== 56) return false;
		let frameCount = 0;
		for (let i = 0; i < view.length - 2; i++) if (view[i] === 0 && view[i + 1] === 33 && view[i + 2] === 249) {
			frameCount++;
			if (frameCount > 1) return true;
		}
		return false;
	}
	/**
	* Brands that identify a HEIC/HEIF image, as registered with the MP4RA.
	*
	* `mif1` and `msf1` are the generic HEIF brands, which AVIF files carry as a
	* compatible brand too, so the AVIF brands have to be ruled out before these
	* are consulted.
	*/
	const HEIC_BRANDS = [
		"heic",
		"heix",
		"heim",
		"heis",
		"hevc",
		"hevx",
		"hevm",
		"hevs",
		"mif1",
		"msf1"
	];
	/**
	* Brands that identify an AVIF image, which shares the HEIF container.
	*/
	const AVIF_BRANDS = ["avif", "avis"];
	/**
	* Detects whether a file buffer contains a HEIC/HEIF image.
	*
	* Reads the ISOBMFF File Type Box, which every HEIF-family file opens with:
	*
	* 1. Checks for the `ftyp` marker at offset 4.
	* 2. Collects the brands the box declares — the major brand at offset 8, then
	*    the compatible brands from offset 16 up to the box size, four ASCII
	*    characters each.
	* 3. Returns true when a HEIC/HEIF brand is present and no AVIF brand is.
	*
	* The browser derives `File.type` from the file extension alone, so this is the
	* only way to recognize a HEIC photo that was saved as `.jpg` or `.png`, or one
	* the operating system could not identify at all (`File.type === ''`).
	*
	* Only the File Type Box is read, so a file can declare a HEIF brand here and
	* still turn out to be undecodable. That is harmless: it means the file reaches
	* the HEIC conversion path, where a real decode is attempted and any failure
	* surfaces as an ordinary decode error.
	*
	* Based on ISO/IEC 14496-12 (ISOBMFF) and ISO/IEC 23008-12 (HEIF):
	*
	* @see https://mp4ra.org/registered-types/brands
	*
	* @param buffer File ArrayBuffer. The first `FILE_TYPE_BOX_BYTES` bytes suffice.
	* @return Whether the buffer contains a HEIC/HEIF image.
	*/
	function isHeicBuffer(buffer) {
		const view = new Uint8Array(buffer);
		const readBrand = (offset) => String.fromCharCode(...view.subarray(offset, offset + 4));
		if (view.length < 12 || readBrand(4) !== "ftyp") return false;
		const boxEnd = Math.min(view.length, new DataView(buffer).getUint32(0));
		const brands = [readBrand(8)];
		for (let offset = 16; offset + 4 <= boxEnd; offset += 4) brands.push(readBrand(offset));
		if (brands.some((brand) => AVIF_BRANDS.includes(brand))) return false;
		return brands.some((brand) => HEIC_BRANDS.includes(brand));
	}
	/**
	* Detects whether a file is a HEIC/HEIF image, whatever its name claims.
	*
	* A browser derives `File.type` from the file extension alone, so a HEIC photo
	* saved as `.jpg` or `.png` announces itself as a JPEG or PNG, and one the
	* operating system cannot identify announces nothing at all. Both are settled
	* here by reading the file's own header.
	*
	* Only files that could plausibly be images are read, so an ISOBMFF video is
	* never mistaken for a still and no non-image upload pays for the read.
	*
	* @param file File to inspect.
	* @return Whether the file is a HEIC/HEIF image.
	*/
	async function isHeicFile(file) {
		if (HEIC_MIME_TYPES.includes(file.type)) return true;
		if (file.type && !file.type.startsWith("image/")) return false;
		try {
			return isHeicBuffer(await file.slice(0, 64).arrayBuffer());
		} catch {
			return false;
		}
	}

// packages/upload-media/build-module/store/utils/index.mjs
/**
	* Cached dynamic import promise for `@wordpress/vips/worker`.
	*
	* The module contains ~10MB of inlined WASM code. By using a dynamic import,
	* the WASM is only loaded when vips functions are actually called at image
	* processing time, rather than at module parse time.
	*
	* The promise is cached so the module is only resolved once.
	*/
	let vipsModulePromise;
	/**
	* The resolved module reference, available synchronously after the first
	* load completes. Used by terminateVipsWorker() and vipsCancelOperations().
	*/
	let vipsModule;
	/**
	* Lazily loads and caches the `@wordpress/vips/worker` module.
	*
	* @return The vips worker module.
	*/
	function loadVipsModule() {
		if (!vipsModulePromise) vipsModulePromise = import("@wordpress/vips/worker").then((mod) => {
			vipsModule = mod;
			return mod;
		});
		return vipsModulePromise;
	}
	/**
	* Converts an image to a different format using vips in a web worker.
	*
	* @param id      Queue item ID.
	* @param file    File object.
	* @param type    Output mime type.
	* @param options Conversion options.
	* @return Converted file.
	*/
	async function vipsConvertImageFormat(id, file, type, options = {}) {
		const { vipsConvertImageFormat: convertImageFormat } = await loadVipsModule();
		const buffer = await convertImageFormat(id, await file.arrayBuffer(), file.type, type, options);
		const ext = type.split("/")[1];
		const fileName = `${getFileBasename(file.name)}.${ext}`;
		return new File([new Blob([buffer])], fileName, { type });
	}
	/**
	* Encodes a decoded canvas as a JPEG using vips in a web worker, copying the
	* EXIF block from the source file the canvas was decoded from.
	*
	* Declines with null when the image is too large to hold in wasm-vips memory.
	* The raw pixels can't be shrunk on load, so the tighter interlaced budget
	* applies.
	*
	* @param id      Queue item ID.
	* @param canvas  Canvas holding the decoded, upright image.
	* @param source  The image file the canvas was decoded from.
	* @param quality JPEG quality (0-1).
	* @return JPEG data, or null if the image is too large.
	*/
	async function vipsEncodeCanvasAsJpeg(id, canvas, source, quality) {
		const { width, height } = canvas;
		if (exceedsClientProcessingMemory({
			width,
			height,
			interlaced: true
		})) return null;
		const { vipsEncodePixelsAsJpeg: encodePixelsAsJpeg } = await loadVipsModule();
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Could not get canvas 2d context");
		const pixels = ctx.getImageData(0, 0, width, height).data.buffer;
		const buffer = await encodePixelsAsJpeg(id, pixels, width, height, {
			quality,
			metadataSource: await source.arrayBuffer()
		});
		return new Blob([buffer], { type: "image/jpeg" });
	}
	/**
	* Checks whether an image has transparency using vips in a web worker.
	*
	* @param url Image URL.
	* @return Whether the image has transparency.
	*/
	async function vipsHasTransparency(url) {
		const { vipsHasTransparency: hasTransparency } = await loadVipsModule();
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
		return hasTransparency(await response.arrayBuffer());
	}
	/**
	* Probes a JPEG buffer for UltraHDR (ISO 21496-1 gain map) support using vips
	* in a web worker.
	*
	* @param buffer Image buffer to probe.
	* @return UltraHDR info if the buffer is a valid UltraHDR JPEG, otherwise null.
	*/
	async function vipsGetUltraHdrInfo(buffer) {
		const { vipsGetUltraHdrInfo: getUltraHdrInfo } = await loadVipsModule();
		return getUltraHdrInfo(buffer);
	}
	/**
	* Resizes an image using vips in a web worker.
	*
	* UltraHDR JPEGs are auto-detected by libvips and their gain map is
	* preserved through the resize.
	*
	* @param id      Queue item ID.
	* @param file    File object.
	* @param resize  Resize options (width, height, crop).
	* @param options Additional resize options.
	* @return Resized ImageFile with dimension metadata.
	*/
	async function vipsResizeImage(id, file, resize, options = {}) {
		const { smartCrop = false, addSuffix = false, signal, scaledSuffix, quality, stripMeta, maxBitdepth, preserveAnimation } = options;
		if (signal?.aborted) throw new Error("Operation aborted");
		const { vipsResizeImage: resizeImage } = await loadVipsModule();
		const { buffer, width, height, originalWidth, originalHeight } = await resizeImage(id, await file.arrayBuffer(), file.type, resize, {
			smartCrop,
			quality,
			stripMeta,
			maxBitdepth,
			preserveAnimation
		});
		let fileName = file.name;
		if (originalWidth > width || originalHeight > height) {
			const basename = getFileBasename(file.name);
			if (scaledSuffix) fileName = file.name.replace(basename, `${basename}-scaled`);
			else if (addSuffix) fileName = file.name.replace(basename, `${basename}-${width}x${height}`);
		}
		return new ImageFile(new File([new Blob([buffer], { type: file.type })], fileName, { type: file.type }), width, height, originalWidth, originalHeight);
	}
	/**
	* Rotates an image based on EXIF orientation using vips in a web worker.
	*
	* This applies the correct rotation/flip transformation based on the EXIF
	* orientation value (1-8), and adds a '-rotated' suffix to the filename.
	* This matches WordPress core's behavior when rotating images based on EXIF.
	*
	* @param id          Queue item ID.
	* @param file        File object.
	* @param orientation EXIF orientation value (1-8).
	* @param signal      Optional abort signal to cancel the operation.
	* @return Rotated ImageFile with updated dimensions.
	*/
	async function vipsRotateImage(id, file, orientation, signal) {
		if (signal?.aborted) throw new Error("Operation aborted");
		if (orientation === 1) return file;
		const { vipsRotateImage: rotateImage } = await loadVipsModule();
		const { buffer, width, height } = await rotateImage(id, await file.arrayBuffer(), file.type, orientation);
		const basename = getFileBasename(file.name);
		const fileName = file.name.replace(basename, `${basename}-rotated`);
		return new ImageFile(new File([new Blob([buffer], { type: file.type })], fileName, { type: file.type }), width, height);
	}
	/**
	* Cancels all ongoing image operations for the given item.
	*
	* If the vips module has not been loaded yet, there can be no active
	* operations to cancel.
	*
	* @param id Queue item ID to cancel operations for.
	* @return Whether any operation was cancelled.
	*/
	async function vipsCancelOperations(id) {
		if (!vipsModule) return false;
		return vipsModule.vipsCancelOperations(id);
	}
	/**
	* Terminates the vips worker if it has been loaded.
	*
	* If the vips module has not been loaded yet (i.e., no image processing
	* has occurred), this is a no-op since there is no worker to terminate.
	*
	* The worker itself is recreated lazily by `getWorkerAPI()` inside
	* `@wordpress/vips/worker` on the next vips call — the module reference
	* cached here can keep pointing at the same module since re-importing
	* returns the same instance from the JS module cache.
	*/
	function terminateVipsWorker() {
		if (vipsModule) vipsModule.terminateVipsWorker();
	}
	/**
	* Tracks the number of completed vips image processing operations across
	* both the success path (`finishOperation`) and the failure path
	* (`cancelItem`). Used to periodically recycle the WASM worker to reclaim
	* memory, since WASM linear memory can only grow and never shrink.
	*/
	let completedVipsOperations = 0;
	/**
	* Maximum number of vips operations before recycling the worker.
	* Each operation can consume 50-100MB+ of WASM memory for large images.
	* The threshold is unchanged now that wasm-vips memory can grow to 2 GiB: a
	* grown heap is only handed back when the worker is recycled, so a lower
	* ceiling on accumulation still matters.
	*/
	const MAX_VIPS_OPS_BEFORE_RECYCLE = 50;
	/**
	* Records that a vips operation has completed and recycles the worker if
	* the threshold has been reached and no other vips operations are in
	* flight. Call this from both success and failure paths so that a burst
	* of failures can't bypass the recycle budget.
	*
	* @param activeImageProcessingCount Number of vips operations currently
	*                                   in flight. Recycling is deferred while
	*                                   any are running so an in-flight worker
	*                                   isn't killed mid-operation.
	*/
	function maybeRecycleVipsWorker(activeImageProcessingCount) {
		completedVipsOperations++;
		if (completedVipsOperations >= MAX_VIPS_OPS_BEFORE_RECYCLE && activeImageProcessingCount === 0) {
			terminateVipsWorker();
			completedVipsOperations = 0;
		}
	}

// packages/upload-media/build-module/store/utils/video-conversion.mjs
/**
	* Message prefix used by `@wordpress/video-conversion` to flag an
	* unsupported-but-graceful conversion outcome (no WebCodecs, unsupported
	* codec). This MUST mirror the package's exported `UNSUPPORTED_ERROR_PREFIX`.
	*
	* It is duplicated here rather than imported because the only path that
	* carries the constant (`@wordpress/video-conversion`) statically pulls the
	* heavy encoder library into the main bundle, defeating the lazy worker
	* load. The worker RPC layer (comctx) also serializes a thrown error to its
	* `message` string only, so the cross-boundary contract is inherently a
	* message prefix. `isUnsupportedConversionError` is unit-tested against the
	* exact strings the worker throws to catch any drift.
	*/
	const UNSUPPORTED_ERROR_PREFIX = "Unsupported";
	/**
	* Message prefix used by `@wordpress/video-conversion` for GIFs skipped
	* because they exceed the total-pixel budget. This MUST mirror the
	* package's exported `SIZE_LIMIT_ERROR_PREFIX`; it is duplicated here for
	* the same bundle-size reason as UNSUPPORTED_ERROR_PREFIX above.
	*/
	const SIZE_LIMIT_ERROR_PREFIX = `${UNSUPPORTED_ERROR_PREFIX}: GIF exceeds maximum conversion size`;
	/**
	* Message prefix for conversions abandoned by the timeout in
	* `convertGifToVideo` below. Thrown and detected on the main thread, but
	* kept as a message-prefix contract for consistency with the other
	* conversion outcomes.
	*/
	const CONVERSION_TIMEOUT_ERROR_PREFIX = "GIF to video conversion timed out";
	/**
	* Default time in milliseconds a GIF-to-video conversion may run before it
	* is abandoned and only the original GIF is kept.
	*
	* Beyond ~30 seconds the companion video stops being worth the CPU churn:
	*/
	const DEFAULT_CONVERSION_TIMEOUT = 3e4;
	/**
	* Whether an error from GIF-to-video conversion represents an
	* unsupported-but-graceful outcome (caller should fall back to uploading the
	* original GIF) rather than a hard failure.
	*
	* @param error Error thrown by `convertGifToVideo`.
	* @return Whether the error is a graceful "unsupported" outcome.
	*/
	function isUnsupportedConversionError(error) {
		return error instanceof Error && error.message.startsWith(UNSUPPORTED_ERROR_PREFIX);
	}
	/**
	* Whether an error from GIF-to-video conversion means the GIF was skipped
	* for exceeding the total-pixel budget. Such errors are also "unsupported"
	* (graceful) outcomes; this narrower check exists so callers can log why
	* no companion video was produced.
	*
	* @param error Error thrown by `convertGifToVideo`.
	* @return Whether the error is a size-limit skip.
	*/
	function isSizeLimitConversionError(error) {
		return error instanceof Error && error.message.startsWith(SIZE_LIMIT_ERROR_PREFIX);
	}
	/**
	* Whether an error from GIF-to-video conversion means the conversion was
	* abandoned because it exceeded the allowed time.
	*
	* @param error Error thrown by `convertGifToVideo`.
	* @return Whether the error is a conversion timeout.
	*/
	function isConversionTimeoutError(error) {
		return error instanceof Error && error.message.startsWith(CONVERSION_TIMEOUT_ERROR_PREFIX);
	}
	/**
	* Cached dynamic import promise for `@wordpress/video-conversion/worker`.
	*
	* Using a dynamic import keeps the worker module out of the main bundle; it
	* is fetched only when GIF-to-video conversion is actually triggered.
	*/
	let videoConversionModulePromise;
	/**
	* The resolved module reference, available synchronously after first load.
	*/
	let videoConversionModule;
	/**
	* Lazily loads and caches the `@wordpress/video-conversion/worker` module.
	*
	* @return The video conversion worker module.
	*/
	function loadVideoConversionModule() {
		if (!videoConversionModulePromise) videoConversionModulePromise = import("@wordpress/video-conversion/worker").then((mod) => {
			videoConversionModule = mod;
			return mod;
		}).catch((error) => {
			videoConversionModulePromise = void 0;
			throw error;
		});
		return videoConversionModulePromise;
	}
	/**
	* Converts an animated GIF to a video file using the video conversion worker.
	*
	* The timeout only covers the conversion itself, not the initial lazy load
	* of the worker module (which has its own retry handling). On timeout the
	* worker-side operation is cancelled so it stops churning, and the returned
	* promise rejects with an error recognized by `isConversionTimeoutError`.
	*
	* @param id                     Queue item ID.
	* @param file                   GIF file object.
	* @param outputMimeType         Output MIME type ('video/mp4' or 'video/webm').
	* @param options                Conversion options.
	* @param options.maxDimensions  Maximum dimension for downscaling.
	* @param options.timeout        Milliseconds before the conversion is
	*                               abandoned. `0` disables the timeout.
	* @param options.maxTotalPixels Budget for total decoded pixels
	*                               (width × height × frame count). `0` disables.
	* @return Converted video file.
	*/
	async function convertGifToVideo(id, file, outputMimeType, { maxDimensions, timeout = DEFAULT_CONVERSION_TIMEOUT, maxTotalPixels } = {}) {
		const mod = await loadVideoConversionModule();
		const conversion = mod.convertGifToVideo(id, file, outputMimeType, maxDimensions, maxTotalPixels);
		let buffer;
		if (timeout > 0) {
			let timer;
			try {
				buffer = await Promise.race([conversion, new Promise((_, reject) => {
					timer = setTimeout(() => {
						reject(/* @__PURE__ */ new Error(`${CONVERSION_TIMEOUT_ERROR_PREFIX} after ${timeout}ms`));
					}, timeout);
				})]);
			} catch (error) {
				if (isConversionTimeoutError(error)) {
					conversion.catch(() => {});
					mod.cancelGifToVideoOperations(id).catch(() => {});
				}
				throw error;
			} finally {
				clearTimeout(timer);
			}
		} else buffer = await conversion;
		const ext = outputMimeType === "video/webm" ? "webm" : "mp4";
		const fileName = `${getFileBasename(file.name)}.${ext}`;
		return new File([new Blob([buffer], { type: outputMimeType })], fileName, { type: outputMimeType });
	}
	/**
	* Cancels all ongoing GIF-to-video conversions for the given item.
	*
	* @param id Queue item ID to cancel operations for.
	* @return Whether any operation was cancelled.
	*/
	async function cancelGifToVideoOperations(id) {
		const mod = videoConversionModule ?? (videoConversionModulePromise ? await videoConversionModulePromise.catch(() => void 0) : void 0);
		if (!mod) return false;
		return mod.cancelGifToVideoOperations(id);
	}
	/**
	* Terminates the video conversion worker if it has been loaded.
	*/
	function terminateVideoConversionWorker() {
		if (videoConversionModule) {
			videoConversionModule.terminateVideoConversionWorker();
			return;
		}
		if (videoConversionModulePromise) videoConversionModulePromise.then((mod) => mod.terminateVideoConversionWorker()).catch(() => {});
	}

// packages/upload-media/build-module/store/utils/debug-logger.mjs
/**
	* Debug logger for client-side media processing.
	*
	* Provides diagnostic logging via `console.debug` and performance
	* measurement via the User Timings API. Both are only emitted when
	* SCRIPT_DEBUG is true, so there is no overhead in production builds.
	*/
	function isDebugEnabled() {
		return true;
	}
	/**
	* Logs a diagnostic message visible in the browser console.
	*
	* Unlike `@wordpress/warning`, this does not throw a caught `Error`, so it
	* won't trip the debugger for developers who pause on caught exceptions.
	* Use it for non-error lifecycle diagnostics (cancellations, batch
	* completion). Only emits when SCRIPT_DEBUG is true.
	*
	* @param message Message to log.
	* @param args    Additional values to log.
	*/
	function debug(message, ...args) {
		if (!isDebugEnabled()) return;
		console.debug(`[upload-media] ${message}`, ...args);
	}
	/**
	* Records a performance measure visible in DevTools Performance panel.
	*
	* Uses the User Timings API (performance.measure) to create entries
	* under a custom "Upload Media" track in DevTools. Only emits when
	* SCRIPT_DEBUG is true, so there's no overhead in production builds.
	*
	* @param options             Measure options.
	* @param options.measureName Name for the performance measure entry.
	* @param options.startTime   Start time from performance.now().
	* @param options.endTime     End time from performance.now(). Defaults to current time.
	* @param options.tooltipText Tooltip text shown in DevTools.
	* @param options.properties  Key-value pairs shown in DevTools detail view.
	*/
	function measure(options) {
		if (!isDebugEnabled()) return;
		const { measureName, startTime, endTime = performance.now(), tooltipText, properties } = options;
		const detail = { devtools: {
			dataType: "track-entry",
			track: "Upload Media",
			tooltipText,
			properties: properties?.map(([key, value]) => ({
				key,
				value
			}))
		} };
		try {
			performance.measure(measureName, {
				start: startTime,
				end: endTime,
				detail
			});
		} catch {}
	}

// packages/upload-media/build-module/upload-error.mjs
/**
	* Error codes for upload operations.
	*
	* These codes categorize the different types of failures that can occur
	* during the upload process, enabling user-friendly error messages.
	*/
	let ErrorCode = /* @__PURE__ */ function(ErrorCode) {
		ErrorCode["EMPTY_FILE"] = "EMPTY_FILE";
		ErrorCode["SIZE_ABOVE_LIMIT"] = "SIZE_ABOVE_LIMIT";
		ErrorCode["MIME_TYPE_NOT_SUPPORTED"] = "MIME_TYPE_NOT_SUPPORTED";
		ErrorCode["MIME_TYPE_NOT_ALLOWED_FOR_USER"] = "MIME_TYPE_NOT_ALLOWED_FOR_USER";
		ErrorCode["HEIC_DECODE_ERROR"] = "HEIC_DECODE_ERROR";
		ErrorCode["IMAGE_TRANSCODING_ERROR"] = "IMAGE_TRANSCODING_ERROR";
		ErrorCode["IMAGE_ROTATION_ERROR"] = "IMAGE_ROTATION_ERROR";
		ErrorCode["MEDIA_TRANSCODING_ERROR"] = "MEDIA_TRANSCODING_ERROR";
		ErrorCode["GIF_TRANSCODING_ERROR"] = "GIF_TRANSCODING_ERROR";
		ErrorCode["MEDIA_FINALIZE_ERROR"] = "MEDIA_FINALIZE_ERROR";
		ErrorCode["GENERAL"] = "GENERAL";
		return ErrorCode;
	}({});
	/**
	* MediaError class.
	*
	* Small wrapper around the `Error` class
	* to hold an error code and a reference to a file object.
	*/
	var UploadError = class extends Error {
		code;
		file;
		constructor({ code, message, file, cause }) {
			super(message, { cause });
			Object.setPrototypeOf(this, new.target.prototype);
			this.code = code;
			this.file = file;
		}
	};

// packages/upload-media/build-module/validate-mime-type.mjs
/**
	* Verifies if the caller (e.g. a block) supports this mime type.
	*
	* @param file         File object.
	* @param allowedTypes List of allowed mime types.
	*/
	function validateMimeType(file, allowedTypes) {
		if (!allowedTypes) return;
		const isAllowedType = allowedTypes.some((allowedType) => {
			if (allowedType.includes("/")) return allowedType === file.type;
			return file.type.startsWith(`${allowedType}/`);
		});
		if (file.type && !isAllowedType) throw new UploadError({
			code: ErrorCode.MIME_TYPE_NOT_SUPPORTED,
			message: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s: Sorry, this file type is not supported here."), file.name),
			file
		});
	}

// packages/upload-media/build-module/get-mime-types-array.mjs
/**
	* Browsers may use unexpected mime types, and they differ from browser to browser.
	* This function computes a flexible array of mime types from the mime type structured provided by the server.
	* Converts { jpg|jpeg|jpe: "image/jpeg" } into [ "image/jpeg", "image/jpg", "image/jpeg", "image/jpe" ]
	*
	* @param {?Object} wpMimeTypesObject Mime type object received from the server.
	*                                    Extensions are keys separated by '|' and values are mime types associated with an extension.
	*
	* @return An array of mime types or null
	*/
	function getMimeTypesArray(wpMimeTypesObject) {
		if (!wpMimeTypesObject) return null;
		return Object.entries(wpMimeTypesObject).flatMap(([extensionsString, mime]) => {
			const [type] = mime.split("/");
			return [mime, ...extensionsString.split("|").map((extension) => `${type}/${extension}`)];
		});
	}

// packages/upload-media/build-module/validate-mime-type-for-user.mjs
/**
	* Verifies if the user is allowed to upload this mime type.
	*
	* @param file               File object.
	* @param wpAllowedMimeTypes List of allowed mime types and file extensions.
	*/
	function validateMimeTypeForUser(file, wpAllowedMimeTypes) {
		const allowedMimeTypesForUser = getMimeTypesArray(wpAllowedMimeTypes);
		if (!allowedMimeTypesForUser) return;
		const isAllowedMimeTypeForUser = allowedMimeTypesForUser.includes(file.type);
		if (file.type && !isAllowedMimeTypeForUser) throw new UploadError({
			code: ErrorCode.MIME_TYPE_NOT_ALLOWED_FOR_USER,
			message: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s: Sorry, you are not allowed to upload this file type."), file.name),
			file
		});
	}

// packages/upload-media/build-module/validate-file-size.mjs
/**
	* Verifies whether the file is within the file upload size limits for the site.
	*
	* @param file              File object.
	* @param maxUploadFileSize Maximum upload size in bytes allowed for the site.
	*/
	function validateFileSize(file, maxUploadFileSize) {
		if (file.size <= 0) throw new UploadError({
			code: ErrorCode.EMPTY_FILE,
			message: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s: This file is empty."), file.name),
			file
		});
		if (maxUploadFileSize && file.size > maxUploadFileSize) throw new UploadError({
			code: ErrorCode.SIZE_ABOVE_LIMIT,
			message: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s: This file exceeds the maximum upload size for this site."), file.name),
			file
		});
	}

// packages/upload-media/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		addItems: () => addItems,
		cancelItem: () => cancelItem,
		executeRetry: () => executeRetry,
		retryItem: () => retryItem,
		scheduleRetry: () => scheduleRetry
	}, 1);
	/**
	* Adds a new item to the upload queue.
	*
	* @param $0
	* @param $0.files            Files
	* @param [$0.onChange]       Function called each time a file or a temporary representation of the file is available.
	* @param [$0.onSuccess]      Function called after the file is uploaded.
	* @param [$0.onBatchSuccess] Function called after a batch of files is uploaded.
	* @param [$0.onError]        Function called when an error happens.
	* @param [$0.additionalData] Additional data to include in the request.
	* @param [$0.allowedTypes]   Array with the types of media that can be uploaded, if unset all types are allowed.
	*/
	function addItems({ files, onChange, onSuccess, onError, onBatchSuccess, additionalData, allowedTypes }) {
		return async ({ select, dispatch }) => {
			const batchId = v4();
			for (const file of files) {
				try {
					validateMimeType(file, allowedTypes);
					validateMimeTypeForUser(file, select.getSettings().allowedMimeTypes);
				} catch (error) {
					onError?.(error);
					continue;
				}
				try {
					validateFileSize(file, select.getSettings().maxUploadFileSize);
				} catch (error) {
					onError?.(error);
					continue;
				}
				dispatch.addItem({
					file,
					batchId,
					onChange,
					onSuccess,
					onBatchSuccess,
					onError,
					additionalData
				});
			}
		};
	}
	/**
	* Cancels an item in the queue based on an error.
	*
	* If the error is retryable and the item hasn't exceeded the maximum
	* retry attempts, it will be scheduled for automatic retry instead
	* of being cancelled.
	*
	* @param id     Item ID.
	* @param error  Error instance.
	* @param silent Whether to cancel the item silently,
	*               without invoking its `onError` callback.
	*/
	function cancelItem(id, error, silent = false) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			clearRetryTimer(id);
			if (!silent && error && !item.parentId && !item.attachment?.id) {
				const retrySettings = select.getSettings().retry;
				if (retrySettings) {
					const retryCount = item.retryCount ?? 0;
					const maxRetries = retrySettings.maxRetryAttempts;
					if (shouldRetryError(error, retryCount, maxRetries)) {
						dispatch.scheduleRetry(id, error);
						return;
					}
				}
			}
			item.abortController?.abort();
			vipsCancelOperations(id).catch(() => {});
			cancelGifToVideoOperations(id).catch(() => {});
			if (!silent) {
				const { onError } = item;
				onError?.(error ?? /* @__PURE__ */ new Error("Upload cancelled"));
				if (!onError && error && !item.parentId) console.error("Upload cancelled", error);
			} else debug(`Item cancelled: ${item.file.name} (item ${id}): ${error instanceof Error ? error.message : error}`);
			const { currentOperation, parentId, batchId } = item;
			dispatch({
				type: Type.Cancel,
				id,
				error
			});
			dispatch.removeItem(id);
			dispatch.revokeBlobUrls(id);
			if (currentOperation === OperationType.ResizeCrop || currentOperation === OperationType.Rotate) for (const pending of select.getPendingImageProcessing()) dispatch.processItem(pending.id);
			if (currentOperation === OperationType.Upload) for (const pending of select.getPendingUploads()) dispatch.processItem(pending.id);
			if (currentOperation === OperationType.TranscodeGif) for (const pending of select.getPendingVideoProcessing()) dispatch.processItem(pending.id);
			if (currentOperation === OperationType.ResizeCrop || currentOperation === OperationType.Rotate || currentOperation === OperationType.TranscodeImage) maybeRecycleVipsWorker(select.getActiveImageProcessingCount());
			if (parentId) {
				const parentItem = select.getItem(parentId);
				if (parentItem) {
					const isOptionalCompanion = item.additionalData?.image_size === "animated_video" || item.additionalData?.image_size === "animated_video_poster";
					if (select.hasPendingItemsByParentId(parentId)) {
						if (parentItem.operations && parentItem.operations.length > 0) dispatch.processItem(parentId);
					} else if (parentItem.subSizes && parentItem.subSizes.length > 0 || isOptionalCompanion) {
						if (parentItem.operations && parentItem.operations.length > 0) dispatch.processItem(parentId);
					} else {
						const parentAttachmentId = parentItem.attachment?.id;
						const { mediaDelete } = select.getSettings();
						if (parentAttachmentId && mediaDelete) mediaDelete(parentAttachmentId).catch(() => {});
						await dispatch.cancelItem(parentId, new UploadError({
							code: error instanceof UploadError && error.code || ErrorCode.GENERAL,
							message: error?.message || (0, _wordpress_i18n.__)("The image could not be uploaded."),
							file: parentItem.file,
							cause: error instanceof Error ? error : void 0
						}));
					}
				}
			}
			if (batchId && select.isBatchUploaded(batchId)) {
				debug(`Batch completed: ${batchId}`);
				item.onBatchSuccess?.();
			}
		};
	}
	/**
	* Retries a failed item in the queue.
	*
	* @param id Item ID.
	*/
	function retryItem(id) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			if (!item.error) return;
			dispatch({
				type: Type.RetryItem,
				id
			});
			dispatch.processItem(id);
		};
	}
	/**
	* Schedules an automatic retry for a failed item.
	*
	* Uses exponential backoff with jitter to determine the retry delay.
	* The item will be placed in PendingRetry status and automatically
	* retried after the calculated delay.
	*
	* @param id    Item ID.
	* @param error The error that caused the failure.
	*/
	function scheduleRetry(id, error) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			const retrySettings = select.getSettings().retry;
			if (!retrySettings) return;
			const currentRetryCount = item.retryCount ?? 0;
			const delay = calculateRetryDelay({
				attempt: currentRetryCount + 1,
				initialDelay: retrySettings.initialRetryDelayMs,
				maxDelay: retrySettings.maxRetryDelayMs,
				multiplier: retrySettings.backoffMultiplier,
				jitter: retrySettings.retryJitter
			});
			const timerId = setTimeout(() => {
				retryTimers.delete(id);
				dispatch.executeRetry(id);
			}, delay);
			retryTimers.set(id, timerId);
			dispatch({
				type: Type.ScheduleRetry,
				id,
				error,
				retryCount: currentRetryCount,
				nextRetryTimestamp: Date.now() + delay
			});
		};
	}
	/**
	* Executes a scheduled retry for an item.
	*
	* This is called by the timer set in scheduleRetry.
	* It verifies the item is still in PendingRetry status before
	* proceeding with the retry.
	*
	* @param id Item ID.
	*/
	function executeRetry(id) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item || item.status !== ItemStatus.PendingRetry) return;
			if (select.isPaused()) return;
			dispatch({
				type: Type.RetryItem,
				id
			});
			dispatch.processItem(id);
		};
	}

// packages/upload-media/build-module/heic-parser.mjs
	var Reader = class {
		view;
		buffer;
		pos;
		constructor(buffer, offset = 0) {
			this.buffer = buffer;
			this.view = new DataView(buffer);
			this.pos = offset;
		}
		u8() {
			const v = this.view.getUint8(this.pos);
			this.pos += 1;
			return v;
		}
		u16() {
			const v = this.view.getUint16(this.pos);
			this.pos += 2;
			return v;
		}
		u32() {
			const v = this.view.getUint32(this.pos);
			this.pos += 4;
			return v;
		}
		u64() {
			const hi = this.view.getUint32(this.pos);
			const lo = this.view.getUint32(this.pos + 4);
			this.pos += 8;
			return hi * 4294967296 + lo;
		}
		/**
		* Read a variable-width unsigned integer (0, 4 or 8 bytes).
		*
		* @param size Byte width to read (0, 4, or 8).
		*/
		uN(size) {
			if (size === 0) return 0;
			if (size === 4) return this.u32();
			if (size === 8) return this.u64();
			throw new Error(`Unsupported uint size: ${size}`);
		}
		str(len) {
			let s = "";
			for (let i = 0; i < len; i++) s += String.fromCharCode(this.view.getUint8(this.pos + i));
			this.pos += len;
			return s;
		}
		bytes(len) {
			const b = new Uint8Array(this.buffer, this.pos, len);
			this.pos += len;
			return new Uint8Array(b);
		}
	};
	function readBox(r) {
		if (r.pos + 8 > r.view.byteLength) return null;
		const offset = r.pos;
		let size = r.u32();
		const type = r.str(4);
		let headerSize = 8;
		if (size === 1) {
			size = r.u64();
			headerSize = 16;
		} else if (size === 0) size = r.view.byteLength - offset;
		return {
			type,
			offset,
			size,
			headerSize
		};
	}
	function findBoxes(r, start, end) {
		const boxes = [];
		r.pos = start;
		while (r.pos < end) {
			const box = readBox(r);
			if (!box || box.size < 8) break;
			boxes.push(box);
			r.pos = box.offset + box.size;
		}
		return boxes;
	}
	function findBox(r, start, end, type) {
		r.pos = start;
		while (r.pos < end) {
			const box = readBox(r);
			if (!box || box.size < 8) break;
			if (box.type === type) return box;
			r.pos = box.offset + box.size;
		}
	}
	/**
	* Parse Primary Item Box → primary item ID.
	*
	* @param r   Binary reader.
	* @param box BoxInfo for the pitm box.
	*/
	function parsePitm(r, box) {
		r.pos = box.offset + box.headerSize;
		const version = r.u8();
		r.pos += 3;
		return version === 0 ? r.u16() : r.u32();
	}
	/**
	* Parse Item Location Box → map of item ID to data extents.
	*
	* @param r   Binary reader.
	* @param box BoxInfo for the iloc box.
	*/
	function parseIloc(r, box) {
		r.pos = box.offset + box.headerSize;
		const version = r.u8();
		r.pos += 3;
		const byte1 = r.u8();
		const offsetSize = byte1 >> 4 & 15;
		const lengthSize = byte1 & 15;
		const byte2 = r.u8();
		const baseOffsetSize = byte2 >> 4 & 15;
		const indexSize = version >= 1 ? byte2 & 15 : 0;
		const itemCount = version < 2 ? r.u16() : r.u32();
		const items = /* @__PURE__ */ new Map();
		for (let i = 0; i < itemCount; i++) {
			const itemId = version < 2 ? r.u16() : r.u32();
			let constructionMethod = 0;
			if (version === 1 || version === 2) constructionMethod = r.u16() & 15;
			r.u16();
			const baseOffset = r.uN(baseOffsetSize);
			const extentCount = r.u16();
			const extents = [];
			for (let j = 0; j < extentCount; j++) {
				if (version >= 1) r.uN(indexSize);
				const extOffset = r.uN(offsetSize);
				const extLength = r.uN(lengthSize);
				extents.push({
					offset: baseOffset + extOffset,
					length: extLength
				});
			}
			items.set(itemId, {
				constructionMethod,
				extents
			});
		}
		return items;
	}
	/**
	* Parse Item Property Association Box → map of item ID to 1-based property indices.
	*
	* @param r   Binary reader.
	* @param box BoxInfo for the ipma box.
	*/
	function parseIpma(r, box) {
		r.pos = box.offset + box.headerSize;
		const vf = r.u32();
		const version = vf >>> 24;
		const largeIndex = (vf & 1) !== 0;
		const entryCount = r.u32();
		const associations = /* @__PURE__ */ new Map();
		for (let i = 0; i < entryCount; i++) {
			const itemId = version < 1 ? r.u16() : r.u32();
			const assocCount = r.u8();
			const indices = [];
			for (let j = 0; j < assocCount; j++) if (largeIndex) indices.push(r.u16() & 32767);
			else indices.push(r.u8() & 127);
			associations.set(itemId, indices);
		}
		return associations;
	}
	/**
	* Parse Image Spatial Extents → width & height.
	*
	* @param r   Binary reader.
	* @param box BoxInfo for the ispe box.
	*/
	function parseIspe(r, box) {
		r.pos = box.offset + box.headerSize + 4;
		return {
			width: r.u32(),
			height: r.u32()
		};
	}
	/**
	* Parse Image Rotation box → rotation angle in degrees CCW.
	*
	* Format: 1 byte with reserved (6 bits) + angle (2 bits).
	* angle * 90 = rotation in degrees counter-clockwise.
	*
	* @param r   Binary reader.
	* @param box BoxInfo for the irot box.
	*/
	function parseIrot(r, box) {
		r.pos = box.offset + box.headerSize;
		return (r.u8() & 3) * 90;
	}
	/**
	* Parse Item Info Box → map of item ID to item type (4-char code).
	*
	* @param r   Binary reader.
	* @param box BoxInfo for the iinf box.
	*/
	function parseIinf(r, box) {
		r.pos = box.offset + box.headerSize;
		const version = r.u8();
		r.pos += 3;
		const entryCount = version === 0 ? r.u16() : r.u32();
		const itemTypes = /* @__PURE__ */ new Map();
		const entriesStart = r.pos;
		const infeBoxes = findBoxes(r, entriesStart, box.offset + box.size);
		for (let i = 0; i < Math.min(entryCount, infeBoxes.length); i++) {
			const infe = infeBoxes[i];
			if (infe.type !== "infe") continue;
			r.pos = infe.offset + infe.headerSize;
			const infeVersion = r.u8();
			r.pos += 3;
			if (infeVersion >= 2) {
				const itemId = infeVersion === 2 ? r.u16() : r.u32();
				r.u16();
				const itemType = r.str(4);
				itemTypes.set(itemId, itemType);
			}
		}
		return itemTypes;
	}
	/**
	* Parse Item Reference Box → map of (fromItemId) to array of referenced item IDs,
	* filtered by reference type.
	*
	* @param r       Binary reader.
	* @param box     BoxInfo for the iref box.
	* @param refType Reference type to filter (e.g. 'dimg').
	*/
	function parseIref(r, box, refType) {
		r.pos = box.offset + box.headerSize;
		const version = r.u8();
		r.pos += 3;
		const refs = /* @__PURE__ */ new Map();
		const boxEnd = box.offset + box.size;
		while (r.pos < boxEnd) {
			const refBox = readBox(r);
			if (!refBox || refBox.size < 8) break;
			r.pos = refBox.offset + refBox.headerSize;
			const fromId = version === 0 ? r.u16() : r.u32();
			const refCount = r.u16();
			const toIds = [];
			for (let i = 0; i < refCount; i++) toIds.push(version === 0 ? r.u16() : r.u32());
			if (refBox.type === refType) refs.set(fromId, toIds);
			r.pos = refBox.offset + refBox.size;
		}
		return refs;
	}
	/**
	* Reverse all 32 bits of a number.
	*
	* @param n 32-bit unsigned integer.
	*/
	function reverseBits32(n) {
		n = n >>> 1 & 1431655765 | (n & 1431655765) << 1;
		n = n >>> 2 & 858993459 | (n & 858993459) << 2;
		n = n >>> 4 & 252645135 | (n & 252645135) << 4;
		n = n >>> 8 & 16711935 | (n & 16711935) << 8;
		n = n >>> 16 | n << 16;
		return n >>> 0;
	}
	/**
	* Build an HEVC codec string from an HEVCDecoderConfigurationRecord.
	*
	* Format: hvc1.{profile}.{compat}.{tier}{level}[.{constraints}]
	* See ISO 14496-15 Annex E and W3C WebCodecs HEVC Codec Registration.
	*
	* @param r            Binary reader.
	* @param recordOffset Byte offset of the HEVCDecoderConfigurationRecord.
	*/
	function buildCodecString(r, recordOffset) {
		r.pos = recordOffset;
		r.u8();
		const byte1 = r.u8();
		const profileSpace = byte1 >> 6 & 3;
		const tierFlag = byte1 >> 5 & 1;
		const profileIdc = byte1 & 31;
		const compatFlags = r.u32();
		const constraintBytes = r.bytes(6);
		const levelIdc = r.u8();
		const spacePrefix = profileSpace > 0 ? String.fromCharCode(64 + profileSpace) : "";
		const compatHex = reverseBits32(compatFlags).toString(16).toUpperCase();
		const tierChar = tierFlag ? "H" : "L";
		let lastNonZero = -1;
		for (let i = 5; i >= 0; i--) if (constraintBytes[i] !== 0) {
			lastNonZero = i;
			break;
		}
		let constraintStr = "";
		if (lastNonZero >= 0) {
			const parts = [];
			for (let i = 0; i <= lastNonZero; i++) parts.push(constraintBytes[i].toString(16).toUpperCase());
			constraintStr = "." + parts.join(".");
		}
		return `hvc1.${spacePrefix}${profileIdc}.${compatHex}.${tierChar}${levelIdc}${constraintStr}`;
	}
	/**
	* Read item data by concatenating all extents for a given item location.
	*
	* For construction_method 0, offsets are absolute file positions.
	* For construction_method 1, offsets are relative to the idat box data.
	*
	* @param buffer     File ArrayBuffer.
	* @param loc        Item location with extents.
	* @param idatOffset Byte offset of the idat box's data within the file.
	*/
	function readItemData(buffer, loc, idatOffset) {
		const baseOffset = loc.constructionMethod === 1 ? idatOffset : 0;
		for (const ext of loc.extents) if (baseOffset + ext.offset + ext.length > buffer.byteLength) throw new Error("HEIC item data extends past the end of the file");
		if (loc.extents.length === 1) {
			const ext = loc.extents[0];
			const start = baseOffset + ext.offset;
			return new Uint8Array(buffer.slice(start, start + ext.length));
		}
		let totalLength = 0;
		for (const ext of loc.extents) totalLength += ext.length;
		const data = new Uint8Array(totalLength);
		let pos = 0;
		for (const ext of loc.extents) {
			const start = baseOffset + ext.offset;
			data.set(new Uint8Array(buffer.slice(start, start + ext.length)), pos);
			pos += ext.length;
		}
		return data;
	}
	/**
	* Find hvcC, ispe, and irot property boxes for a given item.
	*
	* @param propIndices 1-based property indices from ipma.
	* @param properties  All property boxes from ipco.
	*/
	function findHvcProperties(propIndices, properties) {
		let hvcCBox;
		let ispeBox;
		let irotBox;
		for (const idx of propIndices) {
			if (idx < 1 || idx > properties.length) continue;
			const prop = properties[idx - 1];
			if (prop.type === "hvcC" && !hvcCBox) hvcCBox = prop;
			if (prop.type === "ispe" && !ispeBox) ispeBox = prop;
			if (prop.type === "irot" && !irotBox) irotBox = prop;
		}
		if (!hvcCBox) throw new Error("No HEVC configuration (hvcC) found");
		if (!ispeBox) throw new Error("No image dimensions (ispe) found");
		return {
			hvcCBox,
			ispeBox,
			irotBox
		};
	}
	/**
	* Parse a HEIC file and extract the data needed for VideoDecoder.
	*
	* Handles both single-image HEIC files and grid/tiled images (the common
	* iPhone format where the full image is split into multiple HEVC tiles).
	*
	* @param buffer Raw HEIC file contents.
	* @return Parsed image data including codec config and HEVC tile data.
	* @throws If the file is not a valid HEIC or lacks required boxes.
	*/
	function parseHeic(buffer) {
		const r = new Reader(buffer);
		const fileEnd = buffer.byteLength;
		const metaBox = findBox(r, 0, fileEnd, "meta");
		if (!metaBox) throw new Error("No meta box found in HEIC file");
		const children = findBoxes(r, metaBox.offset + metaBox.headerSize + 4, metaBox.offset + metaBox.size);
		const pitmBox = children.find((b) => b.type === "pitm");
		const ilocBox = children.find((b) => b.type === "iloc");
		const iprpBox = children.find((b) => b.type === "iprp");
		const iinfBox = children.find((b) => b.type === "iinf");
		const irefBox = children.find((b) => b.type === "iref");
		const idatBox = children.find((b) => b.type === "idat");
		const idatOffset = idatBox ? idatBox.offset + idatBox.headerSize : 0;
		if (!pitmBox || !ilocBox || !iprpBox) throw new Error("Missing required boxes (pitm, iloc, iprp) in HEIC");
		const primaryId = parsePitm(r, pitmBox);
		const locations = parseIloc(r, ilocBox);
		const iprpChildren = findBoxes(r, iprpBox.offset + iprpBox.headerSize, iprpBox.offset + iprpBox.size);
		const ipcoBox = iprpChildren.find((b) => b.type === "ipco");
		const ipmaBox = iprpChildren.find((b) => b.type === "ipma");
		if (!ipcoBox || !ipmaBox) throw new Error("Missing ipco or ipma in HEIC properties");
		const allAssoc = parseIpma(r, ipmaBox);
		const properties = findBoxes(r, ipcoBox.offset + ipcoBox.headerSize, ipcoBox.offset + ipcoBox.size);
		let primaryItemType = "hvc1";
		if (iinfBox) {
			const t = parseIinf(r, iinfBox).get(primaryId);
			if (t) primaryItemType = t;
		}
		if (primaryItemType === "grid") return parseGridImage(r, buffer, primaryId, locations, allAssoc, properties, irefBox, idatOffset);
		const primaryLoc = locations.get(primaryId);
		if (!primaryLoc || primaryLoc.extents.length === 0) throw new Error(`No location data for primary item ${primaryId}`);
		const primaryPropIndices = allAssoc.get(primaryId);
		if (!primaryPropIndices || primaryPropIndices.length === 0) throw new Error("No property associations for primary item");
		const { hvcCBox, ispeBox, irotBox } = findHvcProperties(primaryPropIndices, properties);
		const hvcCDataStart = hvcCBox.offset + hvcCBox.headerSize;
		const hvcCDataSize = hvcCBox.size - hvcCBox.headerSize;
		const description = new Uint8Array(buffer.slice(hvcCDataStart, hvcCDataStart + hvcCDataSize));
		const codecString = buildCodecString(r, hvcCDataStart);
		const { width, height } = parseIspe(r, ispeBox);
		const rotation = irotBox ? parseIrot(r, irotBox) : 0;
		return {
			codecString,
			description,
			tiles: [{
				data: readItemData(buffer, primaryLoc, idatOffset),
				x: 0,
				y: 0
			}],
			tileWidth: width,
			tileHeight: height,
			outputWidth: width,
			outputHeight: height,
			rotation,
			exifOrientation: rotation === 0 ? getUnappliedExifOrientation(buffer) : 1
		};
	}
	/**
	* Parse a grid/tiled HEIC image.
	*
	* @param r          Binary reader.
	* @param buffer     File ArrayBuffer.
	* @param gridItemId The grid item's ID.
	* @param locations  Parsed iloc data.
	* @param allAssoc   Parsed ipma data.
	* @param properties ipco property boxes.
	* @param irefBox    iref box (required for grid).
	* @param idatOffset Byte offset of idat box data (for construction_method 1).
	*/
	function parseGridImage(r, buffer, gridItemId, locations, allAssoc, properties, irefBox, idatOffset) {
		const gridLoc = locations.get(gridItemId);
		if (!gridLoc || gridLoc.extents.length === 0) throw new Error("No location data for grid item");
		const gridData = readItemData(buffer, gridLoc, idatOffset);
		const largeFields = gridData.length > 1 && (gridData[1] & 1) !== 0;
		const minGridSize = largeFields ? 12 : 8;
		if (gridData.length < minGridSize) throw new Error(`Grid descriptor too short: ${gridData.length} bytes`);
		const rows = gridData[2] + 1;
		const columns = gridData[3] + 1;
		const gv = new DataView(gridData.buffer, gridData.byteOffset);
		let outputWidth;
		let outputHeight;
		if (largeFields) {
			outputWidth = gv.getUint32(4);
			outputHeight = gv.getUint32(8);
		} else {
			outputWidth = gv.getUint16(4);
			outputHeight = gv.getUint16(6);
		}
		if (!irefBox) throw new Error("Grid image requires iref box");
		const tileItemIds = parseIref(r, irefBox, "dimg").get(gridItemId);
		if (!tileItemIds || tileItemIds.length === 0) throw new Error("No tile references found for grid item");
		const expectedTiles = rows * columns;
		if (tileItemIds.length < expectedTiles) throw new Error(`Grid expects ${expectedTiles} tiles but found ${tileItemIds.length}`);
		const firstTileProps = allAssoc.get(tileItemIds[0]);
		if (!firstTileProps || firstTileProps.length === 0) throw new Error("No property associations for tile item");
		const { hvcCBox, ispeBox } = findHvcProperties(firstTileProps, properties);
		const gridProps = allAssoc.get(gridItemId) || [];
		let irotBox;
		for (const idx of gridProps) if (idx >= 1 && idx <= properties.length) {
			const prop = properties[idx - 1];
			if (prop.type === "irot") {
				irotBox = prop;
				break;
			}
		}
		const hvcCDataStart = hvcCBox.offset + hvcCBox.headerSize;
		const hvcCDataSize = hvcCBox.size - hvcCBox.headerSize;
		const description = new Uint8Array(buffer.slice(hvcCDataStart, hvcCDataStart + hvcCDataSize));
		const codecString = buildCodecString(r, hvcCDataStart);
		const { width: tileWidth, height: tileHeight } = parseIspe(r, ispeBox);
		const tiles = [];
		for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
			const tileId = tileItemIds[row * columns + col];
			const tileLoc = locations.get(tileId);
			if (!tileLoc || tileLoc.extents.length === 0) throw new Error(`No location data for tile item ${tileId}`);
			tiles.push({
				data: readItemData(buffer, tileLoc, idatOffset),
				x: col * tileWidth,
				y: row * tileHeight
			});
		}
		const rotation = irotBox ? parseIrot(r, irotBox) : 0;
		return {
			codecString,
			description,
			tiles,
			tileWidth,
			tileHeight,
			outputWidth,
			outputHeight,
			rotation,
			exifOrientation: rotation === 0 ? getUnappliedExifOrientation(buffer) : 1
		};
	}
	/**
	* Read the EXIF Orientation tag from a raw EXIF/TIFF payload.
	*
	* The payload is the body of an ISOBMFF `Exif` item: a 4-byte
	* `exif_tiff_header_offset` followed by a TIFF block. Some encoders omit the
	* offset prefix and start with the TIFF byte-order marker directly, so both
	* layouts are handled.
	*
	* @param payload EXIF item body.
	* @return Orientation value (1-8), or 1 when absent/unparseable.
	*/
	function readTiffOrientation(payload) {
		if (payload.length < 8) return 1;
		const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
		let tiffStart = 0;
		const firstWord = view.getUint16(0);
		if (firstWord !== 18761 && firstWord !== 19789) tiffStart = view.getUint32(0) + 4;
		if (tiffStart + 8 > payload.length) return 1;
		const byteOrder = view.getUint16(tiffStart);
		let little;
		if (byteOrder === 18761) little = true;
		else if (byteOrder === 19789) little = false;
		else return 1;
		const ifd0 = tiffStart + view.getUint32(tiffStart + 4, little);
		if (ifd0 + 2 > payload.length) return 1;
		const entryCount = view.getUint16(ifd0, little);
		for (let i = 0; i < entryCount; i++) {
			const entry = ifd0 + 2 + i * 12;
			if (entry + 12 > payload.length) break;
			if (view.getUint16(entry, little) === 274) {
				const value = view.getUint16(entry + 8, little);
				return value >= 1 && value <= 8 ? value : 1;
			}
		}
		return 1;
	}
	/**
	* Locate the `meta` box and its child boxes for an ISOBMFF (HEIF/AVIF) file.
	*
	* @param r Binary reader.
	* @return The meta box plus its parsed child boxes, or null if absent.
	*/
	function findMeta(r) {
		const metaBox = findBox(r, 0, r.view.byteLength, "meta");
		if (!metaBox) return null;
		return {
			box: metaBox,
			children: findBoxes(r, metaBox.offset + metaBox.headerSize + 4, metaBox.offset + metaBox.size)
		};
	}
	/**
	* Extract the EXIF orientation from an ISOBMFF (HEIF/AVIF) container.
	*
	* AVIF and HEIF store EXIF metadata as an `Exif` item inside the `meta` box.
	* Neither WordPress's server-side `exif_read_data()` nor libheif applies this
	* orientation, so it is read here for client-side rotation.
	*
	* @param buffer Raw file contents.
	* @return EXIF orientation (1-8), or 1 when absent/unparseable.
	*/
	function parseExifOrientation(buffer) {
		try {
			const r = new Reader(buffer);
			const meta = findMeta(r);
			if (!meta) return 1;
			const iinfBox = meta.children.find((b) => b.type === "iinf");
			const ilocBox = meta.children.find((b) => b.type === "iloc");
			if (!iinfBox || !ilocBox) return 1;
			const itemTypes = parseIinf(r, iinfBox);
			let exifItemId;
			for (const [id, type] of itemTypes) if (type === "Exif") {
				exifItemId = id;
				break;
			}
			if (exifItemId === void 0) return 1;
			const loc = parseIloc(r, ilocBox).get(exifItemId);
			if (!loc || loc.extents.length === 0) return 1;
			const idatBox = meta.children.find((b) => b.type === "idat");
			return readTiffOrientation(readItemData(buffer, loc, idatBox ? idatBox.offset + idatBox.headerSize : 0));
		} catch {
			return 1;
		}
	}
	/**
	* Whether an ISOBMFF (HEIF/AVIF) file carries a native `irot`/`imir` transform.
	*
	* libheif/libvips apply these on decode, so when one is present the EXIF
	* orientation must NOT be applied again to avoid double-rotation.
	*
	* @param r Binary reader.
	* @return True if an `irot` or `imir` property box is present.
	*/
	function hasNativeTransform(r) {
		const meta = findMeta(r);
		if (!meta) return false;
		const iprp = meta.children.find((b) => b.type === "iprp");
		if (!iprp) return false;
		const ipco = findBox(r, iprp.offset + iprp.headerSize, iprp.offset + iprp.size, "ipco");
		if (!ipco) return false;
		const start = ipco.offset + ipco.headerSize;
		const end = ipco.offset + ipco.size;
		return Boolean(findBox(r, start, end, "irot") || findBox(r, start, end, "imir"));
	}
	/**
	* Get the EXIF orientation that neither the server nor libheif/libvips will
	* apply automatically for an ISOBMFF (HEIF/AVIF) image.
	*
	* Returns 1 (no correction needed) when the file has a native `irot`/`imir`
	* transform, because libheif already rotates it on decode. Otherwise returns
	* the EXIF Orientation tag so the caller can rotate explicitly.
	*
	* @param buffer Raw file contents.
	* @return EXIF orientation (1-8) requiring explicit rotation, or 1.
	*/
	function getUnappliedExifOrientation(buffer) {
		try {
			if (hasNativeTransform(new Reader(buffer))) return 1;
		} catch {
			return 1;
		}
		return parseExifOrientation(buffer);
	}

// packages/upload-media/build-module/heic-support.mjs
/**
	* Detects the browser family of the current environment.
	*
	* Prefers the User-Agent Client Hints API and falls back to the user agent
	* string, which is still the only signal Firefox and Safari expose.
	*
	* @return The browser family, or `null` when it cannot be determined.
	*/
	function detectBrowserFamily() {
		if (typeof navigator === "undefined") return null;
		const brands = navigator.userAgentData?.brands;
		if (brands?.length) {
			if (brands.some(({ brand }) => /Chromium/i.test(brand))) return "chromium";
		}
		const userAgent = navigator.userAgent || "";
		if (/Firefox|FxiOS/i.test(userAgent)) return "firefox";
		if (/Chrome|Chromium|CriOS|Edg|OPR/i.test(userAgent)) return "chromium";
		if (/Safari/i.test(userAgent)) return "safari";
		return null;
	}
	/**
	* Detects the operating system of the current environment.
	*
	* @return The platform bucket relevant to HEIC decoding.
	*/
	function detectPlatform() {
		if (typeof navigator === "undefined") return "other";
		const platform = navigator.userAgentData?.platform || navigator.userAgent || "";
		if (/iPhone|iPad|iPod|iOS/i.test(platform)) return "other";
		if (/macOS|Mac OS X|Macintosh/i.test(platform)) return "macos";
		if (/Windows/i.test(platform)) return "windows";
		if (/Android|CrOS|Chrome OS/i.test(platform)) return "other";
		if (/Linux|X11/i.test(platform)) return "linux";
		return "other";
	}
	/**
	* Returns the display name of the current browser.
	*
	* @return The browser name, or `null` when it cannot be determined.
	*/
	function getBrowserName() {
		if (detectBrowserFamily() === "chromium") {
			const brands = navigator.userAgentData?.brands ?? [];
			const userAgent = navigator.userAgent || "";
			if (brands.some(({ brand }) => /Edge/i.test(brand)) || /Edg\//i.test(userAgent)) return "Edge";
			if (brands.some(({ brand }) => /Opera/i.test(brand)) || /OPR\//i.test(userAgent)) return "Opera";
			return "Chrome";
		}
		switch (detectBrowserFamily()) {
			case "firefox": return "Firefox";
			case "safari": return "Safari";
			default: return null;
		}
	}
	/**
	* Returns advice on how to get a HEIC image uploaded on the current platform.
	*
	* HEIC decoding depends on codecs provided by the operating system, so which
	* browsers work varies by platform. The browser that just failed is left out of
	* the suggestions, and every variant ends with the JPEG fallback, which works
	* everywhere.
	*
	* @return A localized, browser- and platform-specific sentence.
	*/
	function getHeicConversionAdvice() {
		const platform = detectPlatform();
		const family = detectBrowserFamily();
		if (platform === "macos") {
			if (family === "chromium") return (0, _wordpress_i18n.__)("Safari usually can, or you can upload a JPEG instead.");
			if (family !== "safari") return (0, _wordpress_i18n.__)("Safari or Chrome usually can, or you can upload a JPEG instead.");
		}
		if (platform === "windows" && family === "firefox") return (0, _wordpress_i18n.__)("Chrome or Edge might, or you can upload a JPEG instead.");
		return (0, _wordpress_i18n.__)("You can upload a JPEG instead.");
	}
	/**
	* Builds the message shown when a HEIC image cannot be converted.
	*
	* Explains why the conversion failed in terms of the current browser and
	* operating system, then hands off to the advice for that combination.
	*
	* @return A localized, browser- and platform-specific error message.
	*/
	function getHeicUnsupportedMessage() {
		const platform = detectPlatform();
		const family = detectBrowserFamily();
		const browserName = getBrowserName();
		let cause;
		if (platform === "linux") cause = (0, _wordpress_i18n.__)("HEIC photos can't be decoded on Linux, so unfortunately we couldn't convert this one.");
		else if (family === "firefox") cause = (0, _wordpress_i18n.__)("Firefox can't read HEIC photos, so we couldn't convert this one.");
		else if (browserName && platform === "windows") cause = (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s couldn't decode HEIC on this PC, so we couldn't convert this one."), browserName);
		else if (browserName && platform === "macos") cause = (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s couldn't decode HEIC on this Mac, so we couldn't convert this one."), browserName);
		else if (browserName) cause = (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("%s couldn't decode HEIC on this device, so we couldn't convert this one."), browserName);
		else cause = (0, _wordpress_i18n.__)("This browser can't read HEIC photos, so we couldn't convert this one.");
		return `${cause} ${getHeicConversionAdvice()}`;
	}

// packages/upload-media/build-module/canvas-utils.mjs
/**
	* How long an `ImageDecoder` decode may run before it is abandoned.
	*
	* `ImageDecoder.isTypeSupported()` can report HEIC support from the container
	* format alone. When the platform codec behind it is missing, `decode()` never
	* settles rather than rejecting, and nothing downstream would ever run. The
	* ceiling is generous because it applies to every decode, not only a stalled
	* one: a large photo on slow hardware has to finish well inside it, or a file
	* the browser was decoding fine is abandoned and reported as undecodable.
	*/
	const IMAGE_DECODER_TIMEOUT = 15e3;
	/**
	* Raised when no decoding strategy could be used at all.
	*
	* Separates "nothing here can decode HEIC" from a file that is damaged: only
	* the former says anything about the browser's codecs, and the caller words
	* the two differently. Any other error thrown by `canvasConvertToJpeg()`
	* means the file itself could not be decoded.
	*/
	var HeicUnsupportedError = class extends Error {};
	/**
	* Converts an image file to JPEG using the browser's native decoder and canvas.
	*
	* Tries three decoding strategies:
	* 1. createImageBitmap() + OffscreenCanvas (works in Safari, future Chrome).
	* 2. WebCodecs ImageDecoder API (uses platform codecs; may work in future
	*    Chrome if HEIC is added to its image decoder pipeline).
	* 3. HEIC container parsing + WebCodecs VideoDecoder (Chrome 107+ on macOS).
	*    Parses the HEIC/ISOBMFF container to extract the HEVC bitstream, then
	*    decodes it using Chrome's platform HEVC video decoder (hardware-
	*    accelerated via macOS VideoToolbox).
	*
	* This avoids shipping our own HEVC decoder, sidestepping patent/licensing concerns.
	*
	* The decoded pixels are handed to `encode` when given, which lets a caller
	* produce the JPEG with vips and carry the source file's metadata over; the
	* canvas's own encoder is the fallback and produces a JPEG without metadata.
	*
	* @param file    Source image file (e.g., HEIC/HEIF).
	* @param quality JPEG quality (0-1). Default 0.82.
	* @param encode  Optional JPEG encoder for the decoded pixels.
	* @return JPEG File object.
	*/
	async function canvasConvertToJpeg(file, quality = .82, encode) {
		const jpegBlob = await encodeCanvas(await decodeToCanvas(file), quality, encode);
		return new File([jpegBlob], `${getFileBasename(file.name)}.jpg`, { type: "image/jpeg" });
	}
	/**
	* Encodes a canvas as a JPEG, preferring the given encoder.
	*
	* @param canvas  Canvas holding the decoded, upright image.
	* @param quality JPEG quality (0-1).
	* @param encode  Optional JPEG encoder.
	* @return JPEG data.
	*/
	async function encodeCanvas(canvas, quality, encode) {
		if (encode) try {
			const encoded = await encode(canvas, quality);
			if (encoded) return encoded;
		} catch {}
		return canvas.convertToBlob({
			type: "image/jpeg",
			quality
		});
	}
	/**
	* Decodes an image file into an upright canvas, trying each strategy in turn.
	*
	* @param file Source image file (e.g., HEIC/HEIF).
	* @return Canvas holding the decoded image.
	*/
	async function decodeToCanvas(file) {
		try {
			const bitmap = await createImageBitmap(file);
			try {
				const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("Could not get canvas 2d context");
				ctx.drawImage(bitmap, 0, 0);
				return canvas;
			} finally {
				bitmap.close();
			}
		} catch {}
		if (typeof ImageDecoder !== "undefined") {
			if (await ImageDecoder.isTypeSupported(file.type)) {
				const decoder = new ImageDecoder({
					type: file.type,
					data: file.stream()
				});
				let videoFrame;
				let timeoutId;
				let timedOut = false;
				try {
					videoFrame = (await Promise.race([decoder.decode(), new Promise((_resolve, reject) => {
						timeoutId = setTimeout(() => {
							timedOut = true;
							decoder.close();
							reject(/* @__PURE__ */ new Error("ImageDecoder decode timed out"));
						}, IMAGE_DECODER_TIMEOUT);
					})])).image;
				} catch (error) {
					if (!timedOut) throw error;
				} finally {
					clearTimeout(timeoutId);
					if (!timedOut) decoder.close();
				}
				if (videoFrame) try {
					const canvas = new OffscreenCanvas(videoFrame.displayWidth, videoFrame.displayHeight);
					const ctx = canvas.getContext("2d");
					if (!ctx) throw new Error("Could not get canvas 2d context");
					ctx.drawImage(videoFrame, 0, 0);
					return canvas;
				} finally {
					videoFrame.close();
				}
			}
		}
		let heicData;
		try {
			heicData = parseHeic(await file.arrayBuffer());
		} catch (error) {
			throw new Error("The HEIC file could not be parsed", { cause: error });
		}
		if (typeof VideoDecoder !== "undefined") {
			let supported = false;
			try {
				supported = (await VideoDecoder.isConfigSupported({ codec: heicData.codecString })).supported === true;
			} catch {}
			if (supported) {
				const canvas = new OffscreenCanvas(heicData.outputWidth, heicData.outputHeight);
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("Could not get canvas 2d context");
				for (const tile of heicData.tiles) {
					const frame = await decodeHevcFrame(heicData.codecString, heicData.description, heicData.tileWidth, heicData.tileHeight, tile.data);
					try {
						ctx.drawImage(frame, tile.x, tile.y);
					} finally {
						frame.close();
					}
				}
				return heicData.rotation !== 0 ? applyRotation(canvas, heicData.rotation) : applyExifOrientation(canvas, heicData.exifOrientation);
			}
		}
		throw new HeicUnsupportedError(getHeicUnsupportedMessage());
	}
	/**
	* Apply ISOBMFF irot rotation to a canvas.
	*
	* Returns the original canvas if no rotation is needed, or a new
	* OffscreenCanvas with the rotation applied.
	*
	* @param source   Source canvas with the decoded image.
	* @param rotation Rotation angle in degrees counter-clockwise (0, 90, 180, 270).
	* @return Canvas with rotation applied.
	*/
	function applyRotation(source, rotation) {
		if (rotation === 0) return source;
		const swap = rotation === 90 || rotation === 270;
		const w = swap ? source.height : source.width;
		const h = swap ? source.width : source.height;
		const rotated = new OffscreenCanvas(w, h);
		const ctx = rotated.getContext("2d");
		if (!ctx) return source;
		ctx.translate(w / 2, h / 2);
		ctx.rotate(-rotation * Math.PI / 180);
		ctx.drawImage(source, -source.width / 2, -source.height / 2);
		return rotated;
	}
	/**
	* Apply an EXIF orientation (1-8) to a canvas.
	*
	* Returns the original canvas for orientation 1, or a new OffscreenCanvas with
	* the rotation/flip applied. Orientations 5-8 swap width and height.
	*
	* @param source      Source canvas with the decoded image.
	* @param orientation EXIF orientation value (1-8).
	* @return Canvas with the orientation applied.
	*/
	function applyExifOrientation(source, orientation) {
		if (orientation <= 1 || orientation > 8) return source;
		const { width: sw, height: sh } = source;
		const swap = orientation >= 5;
		const out = new OffscreenCanvas(swap ? sh : sw, swap ? sw : sh);
		const ctx = out.getContext("2d");
		if (!ctx) return source;
		switch (orientation) {
			case 2:
				ctx.transform(-1, 0, 0, 1, sw, 0);
				break;
			case 3:
				ctx.transform(-1, 0, 0, -1, sw, sh);
				break;
			case 4:
				ctx.transform(1, 0, 0, -1, 0, sh);
				break;
			case 5:
				ctx.transform(0, 1, 1, 0, 0, 0);
				break;
			case 6:
				ctx.transform(0, 1, -1, 0, sh, 0);
				break;
			case 7:
				ctx.transform(0, -1, -1, 0, sh, sw);
				break;
			case 8: ctx.transform(0, -1, 1, 0, 0, sw);
		}
		ctx.drawImage(source, 0, 0);
		return out;
	}
	/**
	* Decode a single HEVC key frame using the WebCodecs VideoDecoder API.
	*
	* @param codec       HEVC codec string (e.g. 'hvc1.1.6.L93.B0').
	* @param description HEVCDecoderConfigurationRecord bytes.
	* @param width       Coded width of the frame.
	* @param height      Coded height of the frame.
	* @param data        Raw HEVC bitstream (IDR frame).
	* @return Decoded VideoFrame. Caller must call frame.close().
	*/
	function decodeHevcFrame(codec, description, width, height, data) {
		return new Promise((resolve, reject) => {
			const decoder = new VideoDecoder({
				output: (frame) => {
					decoder.close();
					resolve(frame);
				},
				error: (e) => {
					if (decoder.state !== "closed") decoder.close();
					reject(e);
				}
			});
			decoder.configure({
				codec,
				codedWidth: width,
				codedHeight: height,
				description
			});
			decoder.decode(new EncodedVideoChunk({
				type: "key",
				timestamp: 0,
				data
			}));
			decoder.flush().catch((e) => {
				if (decoder.state !== "closed") decoder.close();
				reject(e);
			});
		});
	}

// packages/upload-media/build-module/get-image-dimensions.mjs
/**
	* Maximum number of bytes to read from the start of a file when probing for
	* dimensions. Generous enough to skip past large EXIF/ICC segments that can
	* precede a JPEG's frame header, while avoiding reading huge files in full.
	*/
	const MAX_HEADER_BYTES = 524288;
	/**
	* Parses dimensions and interlacing from a JPEG file header.
	*
	* Walks the JPEG marker segments until the Start Of Frame (SOFn) marker, which
	* carries the image dimensions. Progressive DCT frames (SOF2/6/10/14) are
	* reported as interlaced.
	*
	* @param view DataView over the file header bytes.
	* @return Parsed dimensions, or null if they could not be determined.
	*/
	function parseJpeg(view) {
		let offset = 2;
		while (offset < view.byteLength) {
			if (view.getUint8(offset) !== 255) return null;
			while (offset < view.byteLength && view.getUint8(offset) === 255) offset++;
			if (offset >= view.byteLength) return null;
			const marker = view.getUint8(offset);
			offset++;
			if (marker === 1 || marker >= 208 && marker <= 217) continue;
			if (marker === 218) return null;
			if (offset + 2 > view.byteLength) return null;
			const segmentLength = view.getUint16(offset);
			if (segmentLength < 2) return null;
			if (marker >= 192 && marker <= 207 && marker !== 196 && marker !== 200 && marker !== 204) {
				if (offset + 7 > view.byteLength) return null;
				const height = view.getUint16(offset + 3);
				return {
					width: view.getUint16(offset + 5),
					height,
					interlaced: marker === 194 || marker === 198 || marker === 202 || marker === 206
				};
			}
			offset += segmentLength;
		}
		return null;
	}
	/**
	* Parses dimensions and interlacing from a PNG file header.
	*
	* Reads the IHDR chunk, which is always the first chunk and contains the
	* dimensions and the interlace method (0 = none, 1 = Adam7).
	*
	* @param view DataView over the file header bytes.
	* @return Parsed dimensions, or null if they could not be determined.
	*/
	function parsePng(view) {
		if (view.byteLength < 29) return null;
		if (!(view.getUint8(12) === 73 && view.getUint8(13) === 72 && view.getUint8(14) === 68 && view.getUint8(15) === 82)) return null;
		return {
			width: view.getUint32(16),
			height: view.getUint32(20),
			interlaced: view.getUint8(28) !== 0
		};
	}
	/**
	* Reads an image's dimensions and interlacing from its header bytes.
	*
	* Only the leading bytes of the file are read, so this is cheap even for very
	* large images and never fully decodes the pixel data. Currently supports JPEG
	* and PNG, the formats most commonly affected by client-side memory limits;
	* other formats return null (treated as unknown).
	*
	* @param file The image file to inspect.
	* @return The parsed dimensions, or null if they could not be determined.
	*/
	async function getImageDimensions(file) {
		try {
			const headerBytes = Math.min(file.size, MAX_HEADER_BYTES);
			const buffer = await file.slice(0, headerBytes).arrayBuffer();
			const view = new DataView(buffer);
			if (view.byteLength >= 3 && view.getUint16(0) === 65496) return parseJpeg(view);
			if (view.byteLength >= 8 && view.getUint32(0) === 2303741511 && view.getUint32(4) === 218765834) return parsePng(view);
			return null;
		} catch {
			return null;
		}
	}

// packages/upload-media/build-module/stub-file.mjs
	var StubFile = class extends File {
		constructor(fileName = "stub-file") {
			super([], fileName);
		}
	};

// packages/upload-media/build-module/store/private-actions.mjs
	var private_actions_exports = /* @__PURE__ */ __exportAll({
		addItem: () => addItem,
		addSideloadItem: () => addSideloadItem,
		detectUltraHdr: () => detectUltraHdr,
		finalizeItem: () => finalizeItem,
		finishOperation: () => finishOperation,
		generateThumbnails: () => generateThumbnails,
		getTranscodeImageOperation: () => getTranscodeImageOperation,
		pauseItem: () => pauseItem,
		pauseQueue: () => pauseQueue,
		prepareItem: () => prepareItem,
		processItem: () => processItem,
		removeItem: () => removeItem,
		resizeCropItem: () => resizeCropItem,
		resumeQueue: () => resumeQueue,
		revokeBlobUrls: () => revokeBlobUrls,
		rotateItem: () => rotateItem,
		sideloadItem: () => sideloadItem,
		transcodeGifItem: () => transcodeGifItem,
		transcodeImageItem: () => transcodeImageItem,
		updateItemProgress: () => updateItemProgress,
		updateSettings: () => updateSettings,
		uploadItem: () => uploadItem
	}, 1);
	const DEFAULT_OUTPUT_QUALITY = .82;
	/**
	* Tracks parent item IDs whose source file is an UltraHDR JPEG so that
	* sub-size resize operations can route through libvips's uhdrload/uhdrsave
	* to preserve the gain map. Entries are cleared in `removeItem` when the
	* parent item leaves the queue, covering both successful completion and
	* cancellation.
	*/
	const ultraHdrItems = /* @__PURE__ */ new Set();
	/**
	* Adds a new item to the upload queue.
	*
	* @param $0
	* @param $0.file                 File
	* @param [$0.batchId]            Batch ID.
	* @param [$0.onChange]           Function called each time a file or a temporary representation of the file is available.
	* @param [$0.onSuccess]          Function called after the file is uploaded.
	* @param [$0.onBatchSuccess]     Function called after a batch of files is uploaded.
	* @param [$0.onError]            Function called when an error happens.
	* @param [$0.additionalData]     Additional data to include in the request.
	* @param [$0.sourceUrl]          Source URL. Used when importing a file from a URL or optimizing an existing file.
	* @param [$0.sourceAttachmentId] Source attachment ID. Used when optimizing an existing file for example.
	* @param [$0.abortController]    Abort controller for upload cancellation.
	* @param [$0.operations]         List of operations to perform. Defaults to automatically determined list, based on the file.
	*/
	function addItem({ file: fileOrBlob, batchId, onChange, onSuccess, onBatchSuccess, onError, additionalData = {}, sourceUrl, sourceAttachmentId, abortController, operations }) {
		return async ({ dispatch }) => {
			const itemId = v4();
			const file = convertBlobToFile(fileOrBlob);
			let blobUrl;
			if (!(file instanceof StubFile)) {
				blobUrl = (0, _wordpress_blob.createBlobURL)(file);
				dispatch({
					type: Type.CacheBlobUrl,
					id: itemId,
					blobUrl
				});
			}
			dispatch({
				type: Type.Add,
				item: {
					id: itemId,
					batchId,
					status: ItemStatus.Processing,
					sourceFile: cloneFile(file),
					file,
					attachment: { url: blobUrl },
					additionalData: {
						generate_sub_sizes: false,
						...additionalData
					},
					onChange,
					onSuccess,
					onBatchSuccess,
					onError,
					sourceUrl,
					sourceAttachmentId,
					abortController: abortController || new AbortController(),
					operations: Array.isArray(operations) ? operations : [OperationType.Prepare]
				}
			});
			dispatch.processItem(itemId);
		};
	}
	/**
	* Adds a new item to the upload queue for sideloading.
	*
	* This is typically a client-side generated thumbnail.
	*
	* @param $0
	* @param $0.file             File
	* @param [$0.batchId]        Batch ID.
	* @param [$0.parentId]       Parent ID.
	* @param [$0.onChange]       Function called each time a file or a temporary representation of the file is available.
	* @param [$0.additionalData] Additional data to include in the request.
	* @param [$0.operations]     List of operations to perform. Defaults to automatically determined list, based on the file.
	*/
	function addSideloadItem({ file, onChange, additionalData, operations, batchId, parentId }) {
		return ({ dispatch }) => {
			const itemId = v4();
			dispatch({
				type: Type.Add,
				item: {
					id: itemId,
					batchId,
					status: ItemStatus.Processing,
					sourceFile: cloneFile(file),
					file,
					onChange,
					additionalData: { ...additionalData },
					parentId,
					operations: Array.isArray(operations) ? operations : [OperationType.Prepare],
					abortController: new AbortController()
				}
			});
			dispatch.processItem(itemId);
		};
	}
	/**
	* Processes a single item in the queue.
	*
	* Runs the next operation in line and invokes any callbacks.
	*
	* @param id Item ID.
	*/
	function processItem(id) {
		return async ({ select, dispatch }) => {
			if (select.isPaused()) return;
			const item = select.getItem(id);
			if (!item) return;
			if (item.currentOperation) return;
			const { attachment, onChange, onSuccess, onBatchSuccess, batchId, parentId } = item;
			const operation = Array.isArray(item.operations?.[0]) ? item.operations[0][0] : item.operations?.[0];
			const operationArgs = Array.isArray(item.operations?.[0]) ? item.operations[0][1] : void 0;
			if (operation === OperationType.Upload) {
				const settings = select.getSettings();
				if (select.getActiveUploadCount() >= settings.maxConcurrentUploads) return;
			}
			if (operation === OperationType.ResizeCrop || operation === OperationType.Rotate) {
				const settings = select.getSettings();
				if (select.getActiveImageProcessingCount() >= settings.maxConcurrentImageProcessing) return;
			}
			if (operation === OperationType.TranscodeGif) {
				if (select.getActiveVideoProcessingCount() >= 1) return;
			}
			if (attachment) {
				if (!(attachment.url && /\.hei[cf]$/i.test(attachment.url))) onChange?.([attachment]);
			}
			if (!operation) {
				if (parentId || !parentId && !select.hasPendingItemsByParentId(id)) {
					if (attachment) onSuccess?.([attachment]);
					dispatch.removeItem(id);
					dispatch.revokeBlobUrls(id);
					if (batchId && select.isBatchUploaded(batchId)) onBatchSuccess?.();
				}
				if (parentId && batchId && select.isBatchUploaded(batchId)) {
					const parentItem = select.getItem(parentId);
					if (!parentItem) return;
					if (parentItem.operations && parentItem.operations.length > 0) {
						dispatch.processItem(parentId);
						return;
					}
					if (attachment) parentItem.onSuccess?.([attachment]);
					dispatch.removeItem(parentId);
					dispatch.revokeBlobUrls(parentId);
					if (parentItem.batchId && select.isBatchUploaded(parentItem.batchId)) parentItem.onBatchSuccess?.();
				}
				return;
			}
			if (operation === OperationType.Finalize && select.hasPendingItemsByParentId(id)) return;
			dispatch({
				type: Type.OperationStart,
				id,
				operation
			});
			debug(`Starting operation ${operation} for ${item.file.name} (item ${item.id})`);
			switch (operation) {
				case OperationType.Prepare:
					dispatch.prepareItem(item.id);
					break;
				case OperationType.ResizeCrop:
					dispatch.resizeCropItem(item.id, operationArgs);
					break;
				case OperationType.Rotate:
					dispatch.rotateItem(item.id, operationArgs);
					break;
				case OperationType.TranscodeImage:
					dispatch.transcodeImageItem(item.id, operationArgs);
					break;
				case OperationType.TranscodeGif:
					dispatch.transcodeGifItem(item.id, operationArgs);
					break;
				case OperationType.Upload:
					if (item.parentId) dispatch.sideloadItem(id);
					else dispatch.uploadItem(id);
					break;
				case OperationType.ThumbnailGeneration:
					dispatch.generateThumbnails(id);
					break;
				case OperationType.Finalize:
					dispatch.finalizeItem(id);
					break;
				case OperationType.DetectUltraHdr: dispatch.detectUltraHdr(id);
			}
		};
	}
	/**
	* Returns an action object that pauses all processing in the queue.
	*
	* Useful for testing purposes.
	*
	* @return Action object.
	*/
	function pauseQueue() {
		return { type: Type.PauseQueue };
	}
	/**
	* Resumes all processing in the queue.
	*
	* Dispatches an action object for resuming the queue itself,
	* and triggers processing for each remaining item in the queue individually.
	*/
	function resumeQueue() {
		return async ({ select, dispatch }) => {
			dispatch({ type: Type.ResumeQueue });
			for (const item of select.getAllItems()) if (item.status === ItemStatus.PendingRetry) dispatch.executeRetry(item.id);
			else dispatch.processItem(item.id);
		};
	}
	/**
	* Pauses a specific item in the queue.
	*
	* @param id Item ID.
	*/
	function pauseItem(id) {
		return async ({ dispatch }) => {
			dispatch({
				type: Type.PauseItem,
				id
			});
		};
	}
	/**
	* Removes a specific item from the queue.
	*
	* @param id Item ID.
	*/
	function removeItem(id) {
		return async ({ select, dispatch }) => {
			if (!select.getItem(id)) return;
			ultraHdrItems.delete(id);
			clearRetryTimer(id);
			dispatch({
				type: Type.Remove,
				id
			});
			if (select.getAllItems().length === 0) {
				terminateVipsWorker();
				terminateVideoConversionWorker();
			}
		};
	}
	/**
	* Finishes an operation for a given item ID and immediately triggers processing the next one.
	*
	* @param id      Item ID.
	* @param updates Updated item data.
	*/
	function finishOperation(id, updates) {
		return async ({ select, dispatch }) => {
			const previousOperation = select.getItem(id)?.currentOperation;
			dispatch({
				type: Type.OperationFinish,
				id,
				item: updates
			});
			dispatch.processItem(id);
			if (previousOperation === OperationType.Upload) {
				const pendingUploads = select.getPendingUploads();
				for (const pendingItem of pendingUploads) dispatch.processItem(pendingItem.id);
			}
			if (previousOperation === OperationType.ResizeCrop || previousOperation === OperationType.Rotate) {
				const pendingItems = select.getPendingImageProcessing();
				for (const pendingItem of pendingItems) dispatch.processItem(pendingItem.id);
			}
			if (previousOperation === OperationType.TranscodeGif) {
				const pendingItems = select.getPendingVideoProcessing();
				for (const pendingItem of pendingItems) dispatch.processItem(pendingItem.id);
			}
			if (previousOperation === OperationType.ResizeCrop || previousOperation === OperationType.Rotate || previousOperation === OperationType.TranscodeImage) maybeRecycleVipsWorker(select.getActiveImageProcessingCount());
		};
	}
	const VALID_IMAGE_FORMATS = [
		"jpeg",
		"webp",
		"avif",
		"png",
		"gif"
	];
	/**
	* Checks if a format string is a valid ImageFormat.
	*
	* @param format The format string to validate.
	* @return Whether the format is valid.
	*/
	function isValidImageFormat(format) {
		return VALID_IMAGE_FORMATS.includes(format);
	}
	/**
	* Determines if an image should be transcoded to a different format.
	*
	* Handles PNG to JPEG conversion carefully by checking for transparency
	* to preserve the alpha channel when needed.
	*
	* @param file           The image file.
	* @param outputMimeType The target output MIME type.
	* @param interlaced     Whether to use interlaced encoding.
	* @param quality        Re-encode quality (0-1). Defaults to DEFAULT_OUTPUT_QUALITY.
	* @return The transcode operation tuple if transcoding is needed, null otherwise.
	*/
	async function getTranscodeImageOperation(file, outputMimeType, interlaced = false, quality = DEFAULT_OUTPUT_QUALITY) {
		if (file.type === "image/png" && outputMimeType === "image/jpeg") {
			const blobUrl = (0, _wordpress_blob.createBlobURL)(file);
			try {
				if (await vipsHasTransparency(blobUrl)) return null;
			} catch {
				return null;
			} finally {
				(0, _wordpress_blob.revokeBlobURL)(blobUrl);
			}
		}
		const formatPart = outputMimeType.split("/")[1];
		if (!isValidImageFormat(formatPart)) return null;
		return [OperationType.TranscodeImage, {
			outputFormat: formatPart,
			outputQuality: quality,
			interlaced
		}];
	}
	/**
	* Prepares an item for initial processing.
	*
	* Determines the list of operations to perform for a given image,
	* depending on its media type.
	*
	* For example, HEIF images first need to be converted, resized,
	* compressed, and then uploaded.
	*
	* Or videos need to be compressed, and then need poster generation
	* before upload.
	*
	* UltraHDR JPEG images are detected and uploaded unmodified — they are
	* already backwards compatible (SDR displays use the embedded base image).
	*
	* @param id Item ID.
	*/
	function prepareItem(id) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			const { file } = item;
			const operations = [];
			const settings = select.getSettings();
			if (file.type === "image/gif" && settings.gifConvert !== false && typeof ImageDecoder !== "undefined" && typeof VideoEncoder !== "undefined") {
				let isAnimated = false;
				try {
					isAnimated = isAnimatedGif(await file.arrayBuffer());
				} catch {
					isAnimated = false;
				}
				if (isAnimated) {
					let hasTransparency = false;
					const blobUrl = (0, _wordpress_blob.createBlobURL)(file);
					try {
						hasTransparency = await vipsHasTransparency(blobUrl);
					} catch {
						hasTransparency = true;
					} finally {
						(0, _wordpress_blob.revokeBlobURL)(blobUrl);
					}
					if (!hasTransparency) {
						operations.push(OperationType.Upload, OperationType.ThumbnailGeneration, OperationType.Finalize);
						dispatch({
							type: Type.AddOperations,
							id,
							operations
						});
						dispatch.finishOperation(id, { animatedGifFile: item.file });
						return;
					}
				}
			}
			let heicJpeg = null;
			const isHeic = await isHeicFile(file);
			const isMisnamedHeic = isHeic && !HEIC_MIME_TYPES.includes(file.type);
			const isImage = file.type.startsWith("image/") || isHeic;
			const isVipsSupported = !isHeic && CLIENT_SIDE_SUPPORTED_MIME_TYPES.includes(file.type);
			const heicFile = isMisnamedHeic ? new File([file], `${getFileBasename(file.name)}.heic`, {
				type: HEIC_MIME_TYPES[0],
				lastModified: file.lastModified
			}) : file;
			let tooLargeForClient = false;
			if (isImage && isVipsSupported) {
				const dimensions = await getImageDimensions(file);
				if (dimensions && exceedsClientProcessingMemory(dimensions)) tooLargeForClient = true;
			}
			if (file.type === "image/jpeg" && !isHeic && !tooLargeForClient) operations.push(OperationType.DetectUltraHdr);
			if (isImage && isVipsSupported && !tooLargeForClient) operations.push(OperationType.Upload, OperationType.ThumbnailGeneration, OperationType.Finalize);
			else if (isImage && isHeic) {
				const encode = isClientSideMediaSupported() ? (canvas, quality) => vipsEncodeCanvasAsJpeg(id, canvas, heicFile, quality) : void 0;
				try {
					heicJpeg = await canvasConvertToJpeg(heicFile, settings.imageQuality ?? DEFAULT_OUTPUT_QUALITY, encode);
				} catch (error) {
					const unsupported = error instanceof HeicUnsupportedError;
					dispatch.cancelItem(id, new UploadError({
						code: unsupported ? ErrorCode.HEIC_DECODE_ERROR : ErrorCode.IMAGE_TRANSCODING_ERROR,
						message: unsupported ? getHeicUnsupportedMessage() : (0, _wordpress_i18n.__)("This HEIC image could not be converted. Try converting it to JPEG before uploading."),
						file,
						cause: error instanceof Error ? error : void 0
					}));
					return;
				}
				operations.push(OperationType.Upload, OperationType.ThumbnailGeneration, OperationType.Finalize);
			} else operations.push(OperationType.Upload);
			dispatch({
				type: Type.AddOperations,
				id,
				operations
			});
			let updates;
			if (isHeic && heicJpeg) {
				const vipsAvailable = isClientSideMediaSupported();
				updates = {
					file: heicJpeg,
					sourceFile: heicJpeg,
					originalHeicFile: heicFile,
					additionalData: {
						...item.additionalData,
						generate_sub_sizes: !vipsAvailable,
						convert_format: true
					}
				};
			} else if (!isVipsSupported || !isImage || tooLargeForClient) updates = { additionalData: {
				...item.additionalData,
				generate_sub_sizes: true,
				convert_format: true
			} };
			else updates = { additionalData: {
				...item.additionalData,
				generate_sub_sizes: false
			} };
			dispatch.finishOperation(id, updates);
		};
	}
	/**
	* Detects whether a JPEG is an UltraHDR image and records the parent item
	* ID so that downstream resize operations route through libvips's
	* uhdrload/uhdrsave pipeline (which preserves the gain map).
	*
	* @param id Item ID.
	*/
	function detectUltraHdr(id) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			let info;
			try {
				const buffer = await item.file.arrayBuffer();
				info = await vipsGetUltraHdrInfo(buffer);
			} catch {}
			if (info) ultraHdrItems.add(id);
			dispatch.finishOperation(id, {});
		};
	}
	/**
	* Uploads an item to the server.
	*
	* @param id Item ID.
	*/
	function uploadItem(id) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			const startTime = performance.now();
			let finished = false;
			const finishUpload = (attachment) => {
				if (finished) return;
				finished = true;
				measure({
					measureName: `Upload ${item.file.name}`,
					startTime,
					tooltipText: item.file.name,
					properties: [["Item ID", item.id], ["File name", item.file.name]]
				});
				dispatch.finishOperation(id, { attachment });
			};
			select.getSettings().mediaUpload({
				filesList: [item.file],
				additionalData: item.additionalData,
				signal: item.abortController?.signal,
				isTransportOnly: true,
				onFileChange: ([attachment]) => {
					if (attachment && !(0, _wordpress_blob.isBlobURL)(attachment.url)) finishUpload(attachment);
				},
				onSuccess: ([attachment]) => {
					finishUpload(attachment);
				},
				onError: (error) => {
					dispatch.cancelItem(id, error);
				}
			});
		};
	}
	/**
	* Sideloads an item to the server.
	*
	* @param id Item ID.
	*/
	function sideloadItem(id) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			const { post, ...additionalData } = item.additionalData;
			const mediaSideload = select.getSettings().mediaSideload;
			if (!mediaSideload) {
				dispatch.finishOperation(id, {});
				return;
			}
			const startTime = performance.now();
			mediaSideload({
				file: item.file,
				attachmentId: post,
				additionalData,
				signal: item.abortController?.signal,
				onSuccess: (subSize) => {
					measure({
						measureName: `Sideload ${item.file.name}`,
						startTime,
						tooltipText: item.file.name,
						properties: [["Item ID", item.id], ["File name", item.file.name]]
					});
					if (item.parentId) dispatch({
						type: Type.AccumulateSubSize,
						id: item.parentId,
						subSize
					});
					dispatch.finishOperation(id, {});
				},
				onError: (error) => {
					dispatch.cancelItem(id, error);
				}
			});
		};
	}
	/**
	* Resizes and crops an existing image item.
	*
	* @param id     Item ID.
	* @param [args] Additional arguments for the operation.
	*/
	function resizeCropItem(id, args) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			if (!args?.resize) {
				dispatch.finishOperation(id, { file: item.file });
				return;
			}
			const startTime = performance.now();
			const addSuffix = Boolean(item.parentId);
			const scaledSuffix = Boolean(args.isThresholdResize);
			const { imageStripMeta, imageMaxBitDepth, generateAnimatedImageSubsizes } = select.getSettings();
			try {
				const file = await vipsResizeImage(item.id, item.file, args.resize, {
					smartCrop: false,
					addSuffix,
					signal: item.abortController?.signal,
					scaledSuffix,
					quality: args.quality,
					stripMeta: imageStripMeta,
					maxBitdepth: imageMaxBitDepth,
					preserveAnimation: false !== generateAnimatedImageSubsizes
				});
				measure({
					measureName: `ResizeCrop ${item.file.name}`,
					startTime,
					tooltipText: item.file.name,
					properties: [["Item ID", item.id], ["File name", item.file.name]]
				});
				const blobUrl = (0, _wordpress_blob.createBlobURL)(file);
				dispatch({
					type: Type.CacheBlobUrl,
					id,
					blobUrl
				});
				dispatch.finishOperation(id, {
					file,
					attachment: { url: blobUrl }
				});
			} catch (error) {
				dispatch.cancelItem(id, new UploadError({
					code: ErrorCode.IMAGE_TRANSCODING_ERROR,
					message: (0, _wordpress_i18n.__)("The web server cannot generate responsive image sizes for this image. Convert it to JPEG or PNG before uploading."),
					file: item.file,
					cause: error instanceof Error ? error : void 0
				}));
			}
		};
	}
	/**
	* Rotates an image based on EXIF orientation.
	*
	* This is used for images that need rotation but don't need resizing
	* (i.e., smaller than the big image size threshold).
	* Matches WordPress core's behavior of creating a '-rotated' version.
	*
	* @param id     Item ID.
	* @param [args] Rotation arguments including EXIF orientation value.
	*/
	function rotateItem(id, args) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			if (!args?.orientation || args.orientation === 1) {
				dispatch.finishOperation(id, { file: item.file });
				return;
			}
			const startTime = performance.now();
			try {
				const file = await vipsRotateImage(item.id, item.file, args.orientation, item.abortController?.signal);
				measure({
					measureName: `Rotate ${item.file.name}`,
					startTime,
					tooltipText: item.file.name,
					properties: [["Item ID", item.id], ["File name", item.file.name]]
				});
				const blobUrl = (0, _wordpress_blob.createBlobURL)(file);
				dispatch({
					type: Type.CacheBlobUrl,
					id,
					blobUrl
				});
				dispatch.finishOperation(id, {
					file,
					attachment: { url: blobUrl }
				});
			} catch (error) {
				dispatch.cancelItem(id, new UploadError({
					code: ErrorCode.IMAGE_ROTATION_ERROR,
					message: (0, _wordpress_i18n.__)("The web server cannot generate responsive image sizes for this image. Convert it to JPEG or PNG before uploading."),
					file: item.file,
					cause: error instanceof Error ? error : void 0
				}));
			}
		};
	}
	/**
	* Transcodes an image to a different format.
	*
	* This operation converts images between formats (e.g., PNG to WebP, JPEG to AVIF)
	* based on the WordPress image_editor_output_format filter settings.
	*
	* @param id     Item ID.
	* @param [args] Transcode arguments including output format, quality, and interlace settings.
	*/
	function transcodeImageItem(id, args) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			if (!args?.outputFormat) {
				dispatch.finishOperation(id, { file: item.file });
				return;
			}
			const startTime = performance.now();
			const outputMimeType = `image/${args.outputFormat}`;
			const quality = args.outputQuality ?? DEFAULT_OUTPUT_QUALITY;
			const interlaced = args.interlaced ?? false;
			const { imageStripMeta, imageMaxBitDepth } = select.getSettings();
			try {
				const file = await vipsConvertImageFormat(item.id, item.file, outputMimeType, {
					quality,
					interlaced,
					stripMeta: imageStripMeta,
					maxBitdepth: imageMaxBitDepth
				});
				measure({
					measureName: `Transcode ${item.file.name}`,
					startTime,
					tooltipText: item.file.name,
					properties: [["Item ID", item.id], ["File name", item.file.name]]
				});
				const blobUrl = (0, _wordpress_blob.createBlobURL)(file);
				dispatch({
					type: Type.CacheBlobUrl,
					id,
					blobUrl
				});
				dispatch.finishOperation(id, {
					file,
					attachment: { url: blobUrl }
				});
			} catch (error) {
				dispatch.cancelItem(id, new UploadError({
					code: ErrorCode.MEDIA_TRANSCODING_ERROR,
					message: "Image could not be transcoded to the target format",
					file: item.file,
					cause: error instanceof Error ? error : void 0
				}));
			}
		};
	}
	/**
	* Converts an animated GIF to a video file (MP4 or WebM).
	*
	* Runs inside a sideload item whose parent is the GIF's image attachment
	* (see generateThumbnails). The next Upload op then sideloads the
	* transcoded video as a companion of that attachment under the
	* `animated_video` image size; the GIF stays the primary attachment and
	* the editor block stays `core/image`.
	*
	* @param id     Item ID.
	* @param [args] Transcode arguments including output format.
	*/
	function transcodeGifItem(id, args) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			const outputMimeType = `video/${args?.outputFormat ?? "mp4"}`;
			const gifFile = item.file;
			try {
				const file = await convertGifToVideo(item.id, gifFile, outputMimeType, {
					timeout: args?.timeout,
					maxTotalPixels: args?.maxTotalPixels
				});
				dispatch.finishOperation(id, { file });
				dispatch.addSideloadItem({
					file: gifFile,
					batchId: v4(),
					parentId: item.parentId,
					additionalData: {
						post: item.additionalData?.post,
						image_size: "animated_video_poster",
						convert_format: false
					},
					operations: [[OperationType.TranscodeImage, {
						outputFormat: "jpeg",
						outputQuality: DEFAULT_OUTPUT_QUALITY,
						interlaced: false
					}], OperationType.Upload]
				});
			} catch (error) {
				if (isUnsupportedConversionError(error)) {
					if (isSizeLimitConversionError(error)) debug(`Skipping GIF to video conversion: ${error instanceof Error ? error.message : error}`);
					dispatch.cancelItem(id, /* @__PURE__ */ new Error("Animated GIF conversion unsupported"), true);
					return;
				}
				if (isConversionTimeoutError(error)) {
					debug(`GIF to video conversion timed out; keeping the original GIF only: ${error instanceof Error ? error.message : error}`);
					dispatch.cancelItem(id, /* @__PURE__ */ new Error("Animated GIF conversion timed out"), true);
					return;
				}
				console.error("[video-conversion] GIF to video conversion failed:", error);
				dispatch.cancelItem(id, new UploadError({
					code: ErrorCode.GIF_TRANSCODING_ERROR,
					message: "Animated GIF could not be converted to video",
					file: item.file,
					cause: error instanceof Error ? error : void 0
				}), true);
			}
		};
	}
	/**
	* Adds thumbnail versions to the queue for sideloading.
	*
	* Also handles image rotation for images that need EXIF-based rotation
	* but weren't scaled down (and thus weren't auto-rotated by vips).
	*
	* @param id Item ID.
	*/
	function generateThumbnails(id) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			if (!item.attachment) {
				dispatch.finishOperation(id, {});
				return;
			}
			const attachment = item.attachment;
			const settings = select.getSettings();
			if (item.originalHeicFile && attachment.id) dispatch.addSideloadItem({
				file: item.originalHeicFile,
				batchId: v4(),
				parentId: item.id,
				additionalData: {
					post: attachment.id,
					image_size: "source_original",
					convert_format: false
				},
				operations: [OperationType.Upload]
			});
			if (item.animatedGifFile && attachment.id) {
				const outputFormat = settings.videoOutputFormat === "video/webm" ? "webm" : "mp4";
				dispatch.addSideloadItem({
					file: item.animatedGifFile,
					batchId: v4(),
					parentId: item.id,
					additionalData: {
						post: attachment.id,
						image_size: "animated_video",
						convert_format: false
					},
					operations: [[OperationType.TranscodeGif, { outputFormat }], OperationType.Upload]
				});
			}
			let exifOrientation = attachment.exif_orientation || 1;
			const sourceType = item.sourceFile.type;
			const isHeifFamily = sourceType === "image/avif" || sourceType === "image/heif";
			let needsClientRotation = false;
			if (isHeifFamily) {
				exifOrientation = getUnappliedExifOrientation(await item.sourceFile.arrayBuffer());
				needsClientRotation = exifOrientation !== 1;
			}
			let rotatedSource;
			{
				const needsRotation = exifOrientation !== 1 && !item.file.name.includes("-scaled");
				if ((needsRotation || needsClientRotation) && attachment.id) try {
					rotatedSource = await vipsRotateImage(item.id, item.sourceFile, exifOrientation, item.abortController?.signal);
				} catch {
					console.warn("Failed to rotate image, continuing with thumbnails");
				}
				if (needsRotation && rotatedSource && attachment.id) dispatch.addSideloadItem({
					file: rotatedSource,
					batchId: v4(),
					parentId: item.id,
					additionalData: {
						post: attachment.id,
						image_size: "original",
						convert_format: false
					},
					operations: [OperationType.Upload]
				});
			}
			if (!item.parentId && attachment.missing_image_sizes && attachment.missing_image_sizes.length > 0) {
				const allImageSizes = settings.allImageSizes || {};
				const sizesToGenerate = attachment.missing_image_sizes;
				const thumbnailSource = needsClientRotation && rotatedSource ? rotatedSource : item.sourceFile;
				const file = attachment.filename ? renameFile(thumbnailSource, attachment.filename) : thumbnailSource;
				const batchId = v4();
				const isUltraHdr = ultraHdrItems.has(item.id);
				const outputMimeType = attachment.image_output_format;
				const interlaced = attachment.image_save_progressive ?? false;
				const imageQuality = attachment.image_quality;
				const fallbackQuality = settings.imageQuality ?? DEFAULT_OUTPUT_QUALITY;
				const defaultQuality = typeof imageQuality?.default === "number" ? imageQuality.default / 100 : fallbackQuality;
				const qualityForSize = (sizeName) => {
					const sized = imageQuality?.sizes?.[sizeName];
					if (typeof sized === "number") return sized / 100;
					return defaultQuality;
				};
				let thumbnailTranscodeOperation = null;
				if (!isUltraHdr && outputMimeType) thumbnailTranscodeOperation = await getTranscodeImageOperation(thumbnailSource, outputMimeType, interlaced, defaultQuality);
				const dimensionGroups = /* @__PURE__ */ new Map();
				for (const name of sizesToGenerate) {
					const imageSize = allImageSizes[name];
					if (!imageSize) {
						console.warn(`Image size "${name}" not found in configuration`);
						continue;
					}
					const key = `${imageSize.width}x${imageSize.height}x${imageSize.crop}`;
					const group = dimensionGroups.get(key);
					if (group) group.push(name);
					else dimensionGroups.set(key, [name]);
				}
				for (const [, names] of dimensionGroups) {
					const imageSize = allImageSizes[names[0]];
					const sizeQuality = qualityForSize(names[0]);
					const thumbnailOperations = [[OperationType.ResizeCrop, {
						resize: imageSize,
						quality: sizeQuality
					}]];
					if (!isUltraHdr && thumbnailTranscodeOperation) thumbnailOperations.push([thumbnailTranscodeOperation[0], {
						...thumbnailTranscodeOperation[1],
						outputQuality: sizeQuality
					}]);
					thumbnailOperations.push(OperationType.Upload);
					const imageSizeParam = names.length === 1 ? names[0] : names;
					dispatch.addSideloadItem({
						file,
						batchId,
						parentId: item.id,
						additionalData: {
							post: attachment.id,
							image_size: imageSizeParam,
							convert_format: false
						},
						operations: thumbnailOperations
					});
				}
				{
					const { bigImageSizeThreshold } = settings;
					if (bigImageSizeThreshold && attachment.id) {
						let needsScaling = false;
						try {
							const bitmap = await createImageBitmap(thumbnailSource);
							needsScaling = bitmap.width > bigImageSizeThreshold || bitmap.height > bigImageSizeThreshold;
							bitmap.close();
						} catch (err) {
							console.warn("Could not determine whether the image exceeds the big image size threshold; skipping the scaled version.", err);
						}
						if (needsScaling) {
							const sourceForScaled = attachment.filename ? renameFile(thumbnailSource, attachment.filename) : thumbnailSource;
							const scaledOperations = [[OperationType.ResizeCrop, {
								resize: {
									width: bigImageSizeThreshold,
									height: bigImageSizeThreshold
								},
								isThresholdResize: true,
								quality: defaultQuality
							}]];
							if (!isUltraHdr && thumbnailTranscodeOperation) scaledOperations.push(thumbnailTranscodeOperation);
							scaledOperations.push(OperationType.Upload);
							dispatch.addSideloadItem({
								file: sourceForScaled,
								batchId,
								parentId: item.id,
								additionalData: {
									post: attachment.id,
									image_size: "scaled",
									convert_format: false
								},
								operations: scaledOperations
							});
						}
					}
				}
			}
			dispatch.finishOperation(id, {});
		};
	}
	/**
	* Finalizes an uploaded item by calling the server's finalize endpoint.
	*
	* This triggers the wp_generate_attachment_metadata filter so that PHP
	* plugins can process the attachment after all client-side operations
	* (including thumbnail sideloads) are complete.
	*
	* @param id Item ID.
	*/
	function finalizeItem(id) {
		return async ({ select, dispatch }) => {
			const item = select.getItem(id);
			if (!item) return;
			const attachment = item.attachment;
			const { mediaFinalize } = select.getSettings();
			const updates = {};
			if (attachment?.id && mediaFinalize) try {
				const updatedAttachment = await mediaFinalize(attachment.id, item.subSizes || []);
				if (updatedAttachment) updates.attachment = updatedAttachment;
			} catch (error) {
				console.warn("Media finalization failed:", error);
				dispatch.cancelItem(id, new UploadError({
					code: ErrorCode.MEDIA_FINALIZE_ERROR,
					message: (0, _wordpress_i18n.__)("Could not finalize the upload."),
					file: item.file
				}));
				return;
			}
			dispatch.finishOperation(id, updates);
		};
	}
	/**
	* Revokes all blob URLs for a given item, freeing up memory.
	*
	* @param id Item ID.
	*/
	function revokeBlobUrls(id) {
		return async ({ select, dispatch }) => {
			const blobUrls = select.getBlobUrls(id);
			for (const blobUrl of blobUrls) (0, _wordpress_blob.revokeBlobURL)(blobUrl);
			dispatch({
				type: Type.RevokeBlobUrls,
				id
			});
		};
	}
	/**
	* Updates the progress of an item.
	*
	* @param id       Item ID.
	* @param progress Progress value (0-100).
	*/
	function updateItemProgress(id, progress) {
		return async ({ dispatch }) => {
			dispatch({
				type: Type.UpdateProgress,
				id,
				progress
			});
		};
	}
	/**
	* Returns an action object that updates the store settings.
	*
	* Useful for testing purposes.
	*
	* @param settings
	* @return Action object.
	*/
	function updateSettings(settings) {
		return {
			type: Type.UpdateSettings,
			settings
		};
	}

// packages/upload-media/build-module/lock-unlock.mjs
	const { lock, unlock } = (0, _wordpress_private_apis.__dangerousOptInToUnstableAPIsOnlyForCoreModules)("I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.", "@wordpress/upload-media");

// packages/upload-media/build-module/store/index.mjs
/**
	* Media upload data store configuration.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#registerStore
	*/
	const storeConfig = {
		reducer,
		selectors: selectors_exports,
		actions: actions_exports
	};
	/**
	* Store definition for the media upload namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*/
	const store = (0, _wordpress_data.createReduxStore)(STORE_NAME, {
		reducer,
		selectors: selectors_exports,
		actions: actions_exports
	});
	if (!(0, _wordpress_data.select)(store)) (0, _wordpress_data.register)(store);
	unlock(store).registerPrivateActions(private_actions_exports);
	unlock(store).registerPrivateSelectors(private_selectors_exports);

// packages/upload-media/build-module/components/provider/with-registry-provider.mjs
	function getSubRegistry(subRegistries, registry, useSubRegistry) {
		if (!useSubRegistry) return registry;
		let subRegistry = subRegistries.get(registry);
		if (!subRegistry) {
			subRegistry = (0, _wordpress_data.createRegistry)({}, registry);
			subRegistry.registerStore(STORE_NAME, storeConfig);
			subRegistries.set(registry, subRegistry);
		}
		return subRegistry;
	}
	const withRegistryProvider = (0, _wordpress_compose.createHigherOrderComponent)((WrappedComponent) => ({ useSubRegistry = true, ...props }) => {
		const registry = (0, _wordpress_data.useRegistry)();
		const [subRegistries] = (0, _wordpress_element.useState)(() => /* @__PURE__ */ new WeakMap());
		const subRegistry = getSubRegistry(subRegistries, registry, useSubRegistry);
		if (subRegistry === registry) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WrappedComponent, {
			registry,
			...props
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_wordpress_data.RegistryProvider, {
			value: subRegistry,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WrappedComponent, {
				registry: subRegistry,
				...props
			})
		});
	}, "withRegistryProvider");

// packages/upload-media/build-module/components/provider/index.mjs
	const MediaUploadProvider = withRegistryProvider((props) => {
		const { children, settings } = props;
		const { updateSettings } = unlock((0, _wordpress_data.useDispatch)(store));
		(0, _wordpress_element.useEffect)(() => {
			updateSettings(settings);
		}, [settings, updateSettings]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children });
	});

// packages/upload-media/build-module/error-messages.mjs
/**
	* User-friendly error messages for upload failures.
	*
	* Provides localized, human-readable messages for all error codes
	* with actionable guidance for users.
	*/
	/**
	* Gets a user-friendly error message configuration for an error code.
	*
	* @param code     The error code from UploadError.
	* @param fileName The name of the file that failed to upload.
	* @return Error message configuration with title, description, and action.
	*/
	function getErrorMessage(code, fileName) {
		return {
			[ErrorCode.EMPTY_FILE]: {
				title: (0, _wordpress_i18n.__)("Empty file"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("\"%s\" is empty."), fileName),
				action: (0, _wordpress_i18n.__)("Please choose a different file.")
			},
			[ErrorCode.SIZE_ABOVE_LIMIT]: {
				title: (0, _wordpress_i18n.__)("File too large"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("\"%s\" exceeds the maximum upload size."), fileName),
				action: (0, _wordpress_i18n.__)("Please reduce the file size and try again.")
			},
			[ErrorCode.MIME_TYPE_NOT_SUPPORTED]: {
				title: (0, _wordpress_i18n.__)("Unsupported file type"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("\"%s\" is not a supported file type."), fileName),
				action: (0, _wordpress_i18n.__)("Please upload a different file format.")
			},
			[ErrorCode.MIME_TYPE_NOT_ALLOWED_FOR_USER]: {
				title: (0, _wordpress_i18n.__)("File type not allowed"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("You are not allowed to upload \"%s\"."), fileName),
				action: (0, _wordpress_i18n.__)("Please contact your site administrator.")
			},
			[ErrorCode.HEIC_DECODE_ERROR]: {
				title: (0, _wordpress_i18n.__)("HEIC decode failed"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Failed to decode HEIC file \"%s\"."), fileName),
				action: getHeicConversionAdvice()
			},
			[ErrorCode.IMAGE_TRANSCODING_ERROR]: {
				title: (0, _wordpress_i18n.__)("Image processing failed"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Failed to process \"%s\"."), fileName),
				action: (0, _wordpress_i18n.__)("The image may be corrupted. Try a different file.")
			},
			[ErrorCode.IMAGE_ROTATION_ERROR]: {
				title: (0, _wordpress_i18n.__)("Image rotation failed"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Failed to rotate \"%s\"."), fileName),
				action: (0, _wordpress_i18n.__)("The image may be corrupted. Try a different file.")
			},
			[ErrorCode.MEDIA_TRANSCODING_ERROR]: {
				title: (0, _wordpress_i18n.__)("Media processing failed"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Failed to convert \"%s\" to the target format."), fileName),
				action: (0, _wordpress_i18n.__)("The file may be corrupted. Try a different file.")
			},
			[ErrorCode.MEDIA_FINALIZE_ERROR]: {
				title: (0, _wordpress_i18n.__)("Upload failed"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Could not finalize the upload of \"%s\"."), fileName),
				action: (0, _wordpress_i18n.__)("Please try again.")
			},
			[ErrorCode.GENERAL]: {
				title: (0, _wordpress_i18n.__)("Upload failed"),
				description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Failed to upload \"%s\"."), fileName),
				action: (0, _wordpress_i18n.__)("Please try again.")
			}
		}[code] || {
			title: (0, _wordpress_i18n.__)("Upload failed"),
			description: (0, _wordpress_i18n.sprintf)((0, _wordpress_i18n.__)("Failed to upload \"%s\"."), fileName),
			action: (0, _wordpress_i18n.__)("Please try again.")
		};
	}

exports.ErrorCode = ErrorCode;
exports.MediaUploadProvider = MediaUploadProvider;
exports.UploadError = UploadError;
exports.clearFeatureDetectionCache = clearFeatureDetectionCache;
exports.detectClientSideMediaSupport = detectClientSideMediaSupport;
exports.getErrorMessage = getErrorMessage;
exports.getHeicConversionAdvice = getHeicConversionAdvice;
exports.getHeicUnsupportedMessage = getHeicUnsupportedMessage;
exports.isClientSideMediaSupported = isClientSideMediaSupported;
exports.isHeicCanvasSupported = isHeicCanvasSupported;
exports.isHeicFile = isHeicFile;
exports.store = store;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).uploadMedia = exports;
return exports;
})({}, window.wp.data, window.wp.i18n, window.wp.blob, window.wp.privateApis, window.wp.element, window.wp.compose, window.ReactJSXRuntime);
//# sourceMappingURL=index.js.map