/**
 * Block-editor extension: an "alternate labels" sidebar panel for the
 * Name screen's submit button.
 *
 * What we do NOT do anymore. The first cut of this file registered
 * four custom string attributes on core/button (clipisodePendingLabel
 * etc.) and persisted them as data-* on the saved markup via
 * blocks.getSaveContent.extraProps. That broke the editor with
 * "Block contains unexpected or invalid content." every time the post
 * loaded — WordPress's block validator re-serialises a parsed block
 * via its registered save() function and compares the result to the
 * stored markup; even a one-character difference in attribute order
 * or encoding triggers the recovery prompt. Adding extra props to a
 * static core block is exactly the kind of change WP cannot round-trip
 * reliably across versions.
 *
 * What we do instead. The button block stays 100% vanilla. The four
 * alternate labels live on the Name screen POST as registered post
 * meta (see SUBMIT_LABEL_META_KEYS in class-post-types.php). When the
 * author selects the marker-classed button in the canvas, this file
 * adds a sidebar PanelBody whose TextControls are bound to that post
 * meta via @wordpress/core-data's useEntityProp hook. Saving the post
 * (which the editor does anyway) persists the meta. The public flow
 * reads the meta server-side and seeds it into IAPI state.
 *
 * Why InspectorControls when meta could also live in a
 * PluginDocumentSettingPanel: the user explicitly asked for the
 * "fields appear in the sidebar when the button is selected" pattern
 * (Pattern B in the design notes). Keeping the panel block-scoped
 * matches the muscle memory of editing the visible label in the
 * canvas — same selection, same place, related fields all together.
 *
 * No-build. Same constraint as the previous version: this script
 * ships as static .js, so we use plain IIFE + window.wp globals
 * (wp.hooks / wp.element / wp.blockEditor / wp.components / wp.compose
 * / wp.coreData / wp.data / wp.i18n) without any JSX or webpack
 * pipeline.
 *
 * @param {Object} wp The WordPress global, expected to expose hooks,
 *                    element, blockEditor, components, compose,
 *                    coreData, data, and i18n packages.
 */
( function ( wp ) {
	if (
		! wp ||
		! wp.hooks ||
		! wp.element ||
		! wp.blockEditor ||
		! wp.components ||
		! wp.compose ||
		! wp.coreData ||
		! wp.data
	) {
		return;
	}

	const addFilter = wp.hooks.addFilter;
	const Fragment = wp.element.Fragment;
	const createElement = wp.element.createElement;
	const InspectorControls = wp.blockEditor.InspectorControls;
	const PanelBody = wp.components.PanelBody;
	const TextControl = wp.components.TextControl;
	const createHigherOrderComponent = wp.compose.createHigherOrderComponent;
	const useEntityProp = wp.coreData.useEntityProp;
	const useSelect = wp.data.useSelect;
	const __ =
		wp.i18n && wp.i18n.__
			? wp.i18n.__
			: function ( s ) {
					return s;
			  };

	/**
	 * Marker class on the button that opts in. The plain core/button is
	 * unaffected; only buttons that the theme template ships with this
	 * class (or that the author manually adds it to) get the extra
	 * panel. Lets us scope the change without registering a brand new
	 * block type — and without touching the button's attribute
	 * definition, which is what was triggering block-validation
	 * failures before.
	 */
	const MARKER_CLASS = 'clipisode-name-submit';

	function hasMarkerClass( attrs ) {
		if ( ! attrs || ! attrs.className ) {
			return false;
		}
		return attrs.className.split( ' ' ).indexOf( MARKER_CLASS ) !== -1;
	}

	/**
	 * Mirror of SUBMIT_LABEL_META_KEYS in class-post-types.php. Keeping
	 * this list in lock-step with PHP is the one place where editor and
	 * server have to agree; everything else flows from the meta keys.
	 */
	const META_KEYS = {
		pending: 'clipisode_label_pending',
		submitting: 'clipisode_label_submitting',
		error: 'clipisode_label_error',
		done: 'clipisode_label_done',
	};

	/**
	 * The actual sidebar panel. Inlined as a function component so it
	 * can use hooks (useSelect for the post type, useEntityProp for the
	 * meta read/write) — HOCs that wrap BlockEdit don't have hook
	 * access at the top level.
	 *
	 * Falls back gracefully when the post isn't a clipisode_screen
	 * (e.g. the same Name button copy/pasted into a regular post): the
	 * panel still renders but the meta read returns undefined, the
	 * controls show their placeholder text, and onChange is a no-op
	 * because setMeta would write to an unregistered key.
	 */
	function SubmitLabelsPanel() {
		const postType = useSelect( function ( select ) {
			return select( 'core/editor' ).getCurrentPostType();
		}, [] );

		const entityArgs = [ 'postType', postType, 'meta' ];
		const entityResult = useEntityProp.apply( null, entityArgs );
		const meta = entityResult && entityResult[ 0 ] ? entityResult[ 0 ] : {};
		const setMeta =
			entityResult && entityResult[ 1 ]
				? entityResult[ 1 ]
				: function () {};

		function update( key, value ) {
			const patch = {};
			patch[ key ] = value;
			setMeta( Object.assign( {}, meta, patch ) );
		}

		return createElement(
			InspectorControls,
			null,
			createElement(
				PanelBody,
				{
					title: __(
						'Submit button — alternate labels',
						'clipisode'
					),
					initialOpen: true,
				},
				createElement(
					'p',
					{ style: { marginTop: 0, fontSize: 12, color: '#555' } },
					__(
						'The button text above is the default label. The fields below appear in its place at specific moments. Translate every field for each language you support.',
						'clipisode'
					)
				),
				createElement( TextControl, {
					label: __(
						'While the upload is still finishing',
						'clipisode'
					),
					help: __(
						'Shown after the guest hits Send if their reply has not finished uploading yet. Example: "Waiting for upload…".',
						'clipisode'
					),
					value: meta[ META_KEYS.pending ] || '',
					onChange( v ) {
						update( META_KEYS.pending, v );
					},
					placeholder: __( 'Waiting for upload…', 'clipisode' ),
				} ),
				createElement( TextControl, {
					label: __(
						'While the reply is being submitted',
						'clipisode'
					),
					help: __(
						'Shown for a few moments while the reply record is created on the server. Example: "Sending…".',
						'clipisode'
					),
					value: meta[ META_KEYS.submitting ] || '',
					onChange( v ) {
						update( META_KEYS.submitting, v );
					},
					placeholder: __( 'Sending…', 'clipisode' ),
				} ),
				createElement( TextControl, {
					label: __( 'After a network error', 'clipisode' ),
					help: __(
						'Shown when the upload or submit fails. Tapping retries. Example: "Try again".',
						'clipisode'
					),
					value: meta[ META_KEYS.error ] || '',
					onChange( v ) {
						update( META_KEYS.error, v );
					},
					placeholder: __( 'Try again', 'clipisode' ),
				} ),
				createElement( TextControl, {
					label: __( 'After a successful send', 'clipisode' ),
					help: __(
						'Shown briefly before the success screen takes over. Example: "Sent".',
						'clipisode'
					),
					value: meta[ META_KEYS.done ] || '',
					onChange( v ) {
						update( META_KEYS.done, v );
					},
					placeholder: __( 'Sent', 'clipisode' ),
				} )
			)
		);
	}

	/**
	 * HOC: only render the panel when a core/button with the marker
	 * class is selected. Wrapping BlockEdit (rather than registering a
	 * standalone PluginDocumentSettingPanel) means the panel appears
	 * exactly when the author has the button selected — same place
	 * they're already editing the visible label — and disappears the
	 * moment they click away, which keeps the document sidebar clean.
	 */
	const withSubmitInspector = createHigherOrderComponent( function (
		BlockEdit
	) {
		return function ( props ) {
			if (
				props.name !== 'core/button' ||
				! hasMarkerClass( props.attributes )
			) {
				return createElement( BlockEdit, props );
			}
			return createElement(
				Fragment,
				null,
				createElement( BlockEdit, props ),
				createElement( SubmitLabelsPanel, null )
			);
		};
	}, 'withClipisodeSubmitInspector' );
	addFilter(
		'editor.BlockEdit',
		'clipisode/name-submit-labels-inspector',
		withSubmitInspector
	);
} )( window.wp );
