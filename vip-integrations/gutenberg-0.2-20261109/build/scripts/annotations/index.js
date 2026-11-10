(function(exports, _wordpress_rich_text, _wordpress_i18n, _wordpress_hooks, _wordpress_data) {

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

// packages/annotations/build-module/store/constants.mjs
/**
	* The identifier for the data store.
	*/
	const STORE_NAME = "core/annotations";

// packages/annotations/build-module/format/annotation.mjs
	const FORMAT_NAME = "core/annotation";
	const ANNOTATION_ATTRIBUTE_PREFIX = "annotation-text-";
	/**
	* Applies given annotations to the given record.
	*
	* @param record      The record to apply annotations to.
	* @param annotations The annotation to apply.
	* @return A record with the annotations applied.
	*/
	function applyAnnotations(record, annotations = []) {
		annotations.forEach((annotation) => {
			let { start, end } = annotation;
			if (typeof start !== "number" || typeof end !== "number") return;
			if (start > record.text.length) start = record.text.length;
			if (end > record.text.length) end = record.text.length;
			const className = ANNOTATION_ATTRIBUTE_PREFIX + annotation.source;
			const id = ANNOTATION_ATTRIBUTE_PREFIX + annotation.id;
			record = (0, _wordpress_rich_text.applyFormat)(record, {
				type: FORMAT_NAME,
				attributes: {
					className,
					id
				}
			}, start, end);
		});
		return record;
	}
	/**
	* Retrieves the positions of annotations inside an array of formats.
	*
	* @param formats Formats with annotations in there.
	* @return ID keyed positions of annotations.
	*/
	function retrieveAnnotationPositions(formats) {
		const positions = {};
		formats.forEach((characterFormats, i) => {
			characterFormats = characterFormats || [];
			characterFormats = characterFormats.filter((format) => format.type === FORMAT_NAME);
			characterFormats.forEach((format) => {
				let { id } = format.attributes;
				id = id.replace(ANNOTATION_ATTRIBUTE_PREFIX, "");
				if (!positions.hasOwnProperty(id)) positions[id] = { start: i };
				positions[id].end = i + 1;
			});
		});
		return positions;
	}
	/**
	* Updates annotations in the state based on positions retrieved from RichText.
	*
	* @param annotations                   The annotations that are currently applied.
	* @param positions                     The current positions of the given annotations.
	* @param actions
	* @param actions.removeAnnotation      Function to remove an annotation from the state.
	* @param actions.updateAnnotationRange Function to update an annotation range in the state.
	*/
	function updateAnnotationsWithPositions(annotations, positions, { removeAnnotation, updateAnnotationRange }) {
		annotations.forEach((currentAnnotation) => {
			const position = positions[currentAnnotation.id];
			if (!position) {
				removeAnnotation(currentAnnotation.id);
				return;
			}
			const { start, end } = currentAnnotation;
			if (typeof start === "number" && typeof end === "number" && (start !== position.start || end !== (position.end ?? position.start))) updateAnnotationRange(currentAnnotation.id, position.start, position.end ?? position.start);
		});
	}
	const annotation = {
		name: FORMAT_NAME,
		title: (0, _wordpress_i18n.__)("Annotation"),
		tagName: "mark",
		className: "annotation-text",
		attributes: {
			className: "class",
			id: "id"
		},
		interactive: false,
		object: false,
		edit: () => {
			return null;
		},
		__experimentalGetPropsForEditableTreePreparation: (select, { richTextIdentifier, blockClientId }) => {
			return { annotations: select(STORE_NAME).__experimentalGetAnnotationsForRichText(blockClientId, richTextIdentifier) };
		},
		__experimentalCreatePrepareEditableTree: ({ annotations }) => {
			return (formats, text) => {
				if (annotations.length === 0) return formats;
				let record = {
					formats,
					text,
					replacements: [],
					start: 0,
					end: 0
				};
				record = applyAnnotations(record, annotations);
				return record.formats;
			};
		},
		__experimentalGetPropsForEditableTreeChangeHandler: (dispatch) => {
			return {
				removeAnnotation: dispatch(STORE_NAME).__experimentalRemoveAnnotation,
				updateAnnotationRange: dispatch(STORE_NAME).__experimentalUpdateAnnotationRange
			};
		},
		__experimentalCreateOnChangeEditableValue: (props) => {
			return (formats) => {
				const positions = retrieveAnnotationPositions(formats);
				const { removeAnnotation, updateAnnotationRange, annotations } = props;
				updateAnnotationsWithPositions(annotations, positions, {
					removeAnnotation,
					updateAnnotationRange
				});
			};
		}
	};

// packages/annotations/build-module/format/index.mjs
	const { name, ...settings } = annotation;
	(0, _wordpress_rich_text.registerFormatType)(name, settings);

// packages/annotations/build-module/store/reducer.mjs
/**
	* Filters an array based on the predicate, but keeps the reference the same if
	* the array hasn't changed.
	*
	* @param collection The collection to filter.
	* @param predicate  Function that determines if the item should stay
	*                   in the array.
	* @return Filtered array.
	*/
	function filterWithReference(collection, predicate) {
		const filteredCollection = collection.filter(predicate);
		return collection.length === filteredCollection.length ? collection : filteredCollection;
	}
	/**
	* Creates a new object with the same keys, but with `callback()` called as
	* a transformer function on each of the values.
	*
	* @param obj      The object to transform.
	* @param callback The function to transform each object value.
	* @return Transformed object.
	*/
	const mapValues = (obj, callback) => Object.entries(obj).reduce((acc, [key, value]) => {
		if (value === void 0) return acc;
		return {
			...acc,
			[key]: callback(value)
		};
	}, {});
	/**
	* Verifies whether the given annotations is a valid annotation.
	*
	* @param annotation       The annotation to verify.
	* @param annotation.range The range property of the annotation.
	* @return Whether the given annotation is valid.
	*/
	function isValidAnnotationRange(annotation) {
		return Boolean(annotation.range && typeof annotation.range.start === "number" && typeof annotation.range.end === "number" && annotation.range.start <= annotation.range.end);
	}
	/**
	* Reducer managing annotations.
	*
	* @param state  The annotations currently shown in the editor.
	* @param action Dispatched action.
	* @return Updated state.
	*/
	function annotations(state = {}, action) {
		switch (action.type) {
			case "ANNOTATION_ADD":
				const blockClientId = action.blockClientId;
				const newAnnotation = {
					id: action.id,
					blockClientId,
					richTextIdentifier: action.richTextIdentifier,
					source: action.source,
					selector: action.selector,
					range: action.range
				};
				if (newAnnotation.selector === "range" && !isValidAnnotationRange(newAnnotation)) return state;
				const previousAnnotationsForBlock = state?.[blockClientId] ?? [];
				return {
					...state,
					[blockClientId]: [...previousAnnotationsForBlock, newAnnotation]
				};
			case "ANNOTATION_REMOVE": return mapValues(state, (annotationsForBlock) => {
				return filterWithReference(annotationsForBlock, (annotation) => {
					return annotation.id !== action.annotationId;
				});
			});
			case "ANNOTATION_UPDATE_RANGE": return mapValues(state, (annotationsForBlock) => {
				let hasChangedRange = false;
				const newAnnotations = annotationsForBlock.map((annotation) => {
					if (annotation.id === action.annotationId) {
						hasChangedRange = true;
						return {
							...annotation,
							range: {
								start: action.start,
								end: action.end
							}
						};
					}
					return annotation;
				});
				return hasChangedRange ? newAnnotations : annotationsForBlock;
			});
			case "ANNOTATION_REMOVE_SOURCE": return mapValues(state, (annotationsForBlock) => {
				return filterWithReference(annotationsForBlock, (annotation) => {
					return annotation.source !== action.source;
				});
			});
		}
		return state;
	}

// packages/annotations/build-module/store/selectors.mjs
	var selectors_exports = /* @__PURE__ */ __exportAll({
		__experimentalGetAllAnnotationsForBlock: () => __experimentalGetAllAnnotationsForBlock,
		__experimentalGetAnnotations: () => __experimentalGetAnnotations,
		__experimentalGetAnnotationsForBlock: () => __experimentalGetAnnotationsForBlock,
		__experimentalGetAnnotationsForRichText: () => __experimentalGetAnnotationsForRichText
	}, 1);
	/**
	* Shared reference to an empty array for cases where it is important to avoid
	* returning a new array reference on every invocation, as in a connected or
	* other pure component which performs `shouldComponentUpdate` check on props.
	* This should be used as a last resort, since the normalized data should be
	* maintained by the reducer result in state.
	*/
	const EMPTY_ARRAY = [];
	/**
	* Returns the annotations for a specific client ID.
	*
	* @param state         Editor state.
	* @param blockClientId The ID of the block to get the annotations for.
	* @return The annotations applicable to this block.
	*/
	const __experimentalGetAnnotationsForBlock = (0, _wordpress_data.createSelector)((state, blockClientId) => {
		return (state?.[blockClientId] ?? []).filter((annotation) => {
			return annotation.selector === "block";
		});
	}, (state, blockClientId) => [state?.[blockClientId] ?? EMPTY_ARRAY]);
	function __experimentalGetAllAnnotationsForBlock(state, blockClientId) {
		return state?.[blockClientId] ?? EMPTY_ARRAY;
	}
	/**
	* Returns the annotations that apply to the given RichText instance.
	*
	* Both a blockClientId and a richTextIdentifier are required. This is because
	* a block might have multiple `RichText` components. This does mean that every
	* block needs to implement annotations itself.
	*
	* @param state              Editor state.
	* @param blockClientId      The client ID for the block.
	* @param richTextIdentifier Unique identifier that identifies the given RichText.
	* @return All the annotations relevant for the `RichText`.
	*/
	const __experimentalGetAnnotationsForRichText = (0, _wordpress_data.createSelector)((state, blockClientId, richTextIdentifier) => {
		return (state?.[blockClientId] ?? []).filter((annotation) => {
			return annotation.selector === "range" && richTextIdentifier === annotation.richTextIdentifier;
		}).map((annotation) => {
			const { range, ...other } = annotation;
			return {
				...range,
				...other
			};
		});
	}, (state, blockClientId) => [state?.[blockClientId] ?? EMPTY_ARRAY]);
	/**
	* Returns all annotations in the editor state.
	*
	* @param state Editor state.
	* @return All annotations currently applied.
	*/
	function __experimentalGetAnnotations(state) {
		return Object.values(state).filter((arr) => Boolean(arr)).flat();
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

// packages/annotations/build-module/store/actions.mjs
	var actions_exports = /* @__PURE__ */ __exportAll({
		__experimentalAddAnnotation: () => __experimentalAddAnnotation,
		__experimentalRemoveAnnotation: () => __experimentalRemoveAnnotation,
		__experimentalRemoveAnnotationsBySource: () => __experimentalRemoveAnnotationsBySource,
		__experimentalUpdateAnnotationRange: () => __experimentalUpdateAnnotationRange
	}, 1);
	/**
	* Adds an annotation to a block.
	*
	* The `block` attribute refers to a block ID that needs to be annotated.
	* `isBlockAnnotation` controls whether or not the annotation is a block
	* annotation. The `source` is the source of the annotation, this will be used
	* to identify groups of annotations.
	*
	* The `range` property is only relevant if the selector is 'range'.
	*
	* @param annotation                    The annotation to add.
	* @param annotation.blockClientId      The blockClientId to add the annotation to.
	* @param annotation.richTextIdentifier Identifier for the RichText instance the annotation applies to.
	* @param annotation.range              The range at which to apply this annotation.
	* @param annotation.selector           The way to apply this annotation.
	* @param annotation.source             The source that added the annotation.
	* @param annotation.id                 The ID the annotation should have. Generates a UUID by default.
	* @return Action object.
	*/
	function __experimentalAddAnnotation({ blockClientId, richTextIdentifier = null, range = null, selector = "range", source = "default", id = v4() }) {
		const action = {
			type: "ANNOTATION_ADD",
			id,
			blockClientId,
			richTextIdentifier,
			source,
			selector
		};
		if (selector === "range" && range !== null) action.range = range;
		return action;
	}
	/**
	* Removes an annotation with a specific ID.
	*
	* @param annotationId The annotation to remove.
	* @return Action object.
	*/
	function __experimentalRemoveAnnotation(annotationId) {
		return {
			type: "ANNOTATION_REMOVE",
			annotationId
		};
	}
	/**
	* Updates the range of an annotation.
	*
	* @param annotationId ID of the annotation to update.
	* @param start        The start of the new range.
	* @param end          The end of the new range.
	* @return Action object.
	*/
	function __experimentalUpdateAnnotationRange(annotationId, start, end) {
		return {
			type: "ANNOTATION_UPDATE_RANGE",
			annotationId,
			start,
			end
		};
	}
	/**
	* Removes all annotations of a specific source.
	*
	* @param source The source to remove.
	* @return Action object.
	*/
	function __experimentalRemoveAnnotationsBySource(source) {
		return {
			type: "ANNOTATION_REMOVE_SOURCE",
			source
		};
	}

// packages/annotations/build-module/store/index.mjs
/**
	* Store definition for the annotations namespace.
	*
	* @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
	*/
	const store = (0, _wordpress_data.createReduxStore)(STORE_NAME, {
		reducer: annotations,
		selectors: selectors_exports,
		actions: actions_exports
	});
	(0, _wordpress_data.register)(store);

// packages/annotations/build-module/block/index.mjs
/**
	* Adds annotation className to the block-list-block component.
	*
	* @param OriginalComponent The original BlockListBlock component.
	* @return The enhanced component.
	*/
	const addAnnotationClassName = (OriginalComponent) => {
		return (0, _wordpress_data.withSelect)((select, ownProps) => {
			const { clientId, className } = ownProps;
			return { className: select(store).__experimentalGetAnnotationsForBlock(clientId).map((annotation) => {
				return "is-annotated-by-" + annotation.source;
			}).concat(className || "").filter(Boolean).join(" ") };
		})(OriginalComponent);
	};
	(0, _wordpress_hooks.addFilter)("editor.BlockListBlock", "core/annotations", addAnnotationClassName);

exports.store = store;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).annotations = exports;
return exports;
})({}, window.wp.richText, window.wp.i18n, window.wp.hooks, window.wp.data);
//# sourceMappingURL=index.js.map