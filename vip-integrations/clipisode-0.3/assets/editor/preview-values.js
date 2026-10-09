/**
 * Block-editor extension: token preview simulator.
 *
 * Starter HTML files in assets/themes/default/ contain placeholder
 * tokens like {topic_title}, {host_name}, {pct}, {network}. The
 * public renderer (clipisode-flow.php) substitutes them at request
 * time with real topic / host / percent values. In the block editor,
 * those tokens stay as literal {token} strings — which means authors
 * laying out screens are looking at "{topic_title}" (12 characters)
 * when guests will see something like "Cooking with Mom: Sunday
 * Sauce Stories" (44 characters). The preview wraps differently and
 * the editor stops being a useful WYSIWYG.
 *
 * This script swaps tokens for sample values from preview-values.json
 * (loaded via wp_localize_script as window.clipisodeThemePreviewValues)
 * inside the editor canvas, but only for blocks the author isn't
 * currently editing. The selected block keeps its raw {token} so the
 * author can see and edit the actual stored content. The moment they
 * select a different block, the previously-selected block flips back
 * to showing the sample value.
 *
 * Storage rule: nothing this script does is ever persisted to the
 * post. We only mutate the rendered DOM in the editor canvas. The
 * underlying RichText / block-attributes state still holds the raw
 * {token}, so when the author re-selects a block, Gutenberg's React
 * re-render restores the raw token automatically with no extra work
 * from us.
 *
 * Why pure-text mutation, not <span> wrappers (history note):
 *
 * The first cut wrapped each token in a <span class="clipisode-
 * preview-token"> so we could give the preview a CSS hook. That
 * worked visually but broke typing in RichText blocks (heading,
 * paragraph, button, list — almost every editable block). Inserting
 * an element into a RichText subtree desynced Gutenberg's internal
 * model from the DOM: the next keystroke landed at a stale cursor
 * offset, and `Q` typed in front of a previewed `{topic_title}`
 * produced the textbook corruption `Q{topic_title}{topic_title}`.
 *
 * Fix: never insert elements into a text node's parent. Mutate the
 * text node's nodeValue in place, with the original string stored
 * in a WeakMap so we can restore it. This keeps the DOM tree shape
 * identical to what Gutenberg expects, so RichText's diff/sync
 * stays sane. We also skip swapping any text node that lives inside
 * the document's currently-focused element (caught via
 * document.activeElement on the canvas iframe), independent of the
 * selection-store's state — typing fires before the store catches
 * up, and the focus check is the most reliable signal we have for
 * "the author is actively editing this right now."
 *
 * How the swap works:
 *
 * 1. Find the editor canvas iframe (Gutenberg renders the canvas in
 *    an iframe in WP 6.x). Fall back to the same-document body when
 *    the iframe isn't present.
 *
 * 2. MutationObserver on the canvas root. On every interesting
 *    mutation we re-walk affected text nodes and either swap them
 *    to their sample value or restore them to their original token,
 *    depending on whether their owning block is currently selected
 *    AND whether their parent is the actively-focused element.
 *
 * 3. Subscribe to core/block-editor's getSelectedBlockClientId.
 *    Selection events apply per-block, not per-subtree:
 *
 *      - The previously-selected block re-swaps its OWN text
 *        content. Nested children's text was already swapped.
 *
 *      - The newly-selected block restores its OWN swapped text
 *        nodes back to raw tokens. Nested children inside it keep
 *        their sample values — clicking a parent Group block
 *        doesn't un-preview every paragraph inside it.
 *
 * 4. PluginDocumentSettingPanel toggle "Preview sample values".
 *    Defaults to true. State persists in localStorage as
 *    `clipisode_preview_values_enabled`.
 *
 * Constraints / non-goals:
 *
 * - We only swap tokens in visible text content. Tokens inside
 *   element attributes are not touched.
 *
 * - We do not swap inside <code> or <pre>.
 *
 * - We do not swap inside an actively-focused contenteditable.
 *
 * - No-build. Plain IIFE + window.wp globals.
 */

( function ( wp, previewValues ) {
	if ( ! wp || ! wp.element || ! wp.data || ! wp.plugins || ! wp.editPost ) {
		return;
	}

	var SAMPLES = previewValues || {};
	var TOKEN_KEYS = Object.keys( SAMPLES );
	if ( TOKEN_KEYS.length === 0 ) {
		return;
	}

	// Build a single regex that matches any known token. We match the
	// exact set of declared keys (not /\{[a-z_]+\}/) so an unknown
	// token in markup stays as a raw {something} — which is the
	// "missing sample is visible and reportable" failure mode.
	var TOKEN_RE = new RegExp(
		'\\{(' + TOKEN_KEYS.map( function ( k ) { return k.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ); } ).join( '|' ) + ')\\}',
		'g'
	);

	var STORAGE_KEY = 'clipisode_preview_values_enabled';

	var enabled = readEnabled();
	var selectedClientId = null;
	// Pause flag so our own DOM writes don't recurse through the
	// MutationObserver callback.
	var pauseObserver = false;

	// WeakMap from text-node -> original (pre-swap) nodeValue. Lets
	// us restore the raw {token} string verbatim without keeping any
	// markup attribute on the DOM. The map's keys are weak so swapped
	// nodes that get garbage-collected (e.g. when Gutenberg
	// re-renders a block) are released automatically.
	var ORIGINALS = new WeakMap();

	function readEnabled() {
		try {
			var v = window.localStorage.getItem( STORAGE_KEY );
			if ( v === null ) {
				return true;
			}
			return v === '1';
		} catch ( e ) {
			return true;
		}
	}

	function writeEnabled( value ) {
		try {
			window.localStorage.setItem( STORAGE_KEY, value ? '1' : '0' );
		} catch ( e ) {
			// localStorage may be disabled; the toggle still works
			// in-session, it just won't survive a reload.
		}
	}

	/**
	 * Resolves the canvas root we observe and mutate. Modern Gutenberg
	 * renders the editor inside an iframe with name="editor-canvas";
	 * we want its contentDocument.body. If the iframe isn't there
	 * we fall back to the parent document body, which works for any
	 * non-iframed editor surface (block-based widget editor, older
	 * post editors).
	 */
	function getCanvasRoot() {
		var iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
		if ( iframe && iframe.contentDocument && iframe.contentDocument.body ) {
			return iframe.contentDocument.body;
		}
		var direct = document.querySelector( '.editor-styles-wrapper' );
		if ( direct ) {
			return direct;
		}
		return null;
	}

	/**
	 * Returns the document the canvas root lives in. We need this
	 * because the canvas may be inside an iframe, and document-level
	 * concepts like activeElement are per-document. Calling
	 * document.activeElement on the parent doc returns the iframe
	 * element itself, never the focused contenteditable inside it.
	 */
	function getCanvasDocument() {
		var root = getCanvasRoot();
		return root ? ( root.ownerDocument || document ) : null;
	}

	/**
	 * Returns true when the given node's parent (or any ancestor up
	 * to root) is the currently-focused element in the canvas
	 * document. This catches the "user is typing right now" case
	 * even when wp.data hasn't propagated the selection update yet.
	 *
	 * We test against the activeElement itself OR its ancestor chain,
	 * because a nested element inside a contenteditable host (e.g.
	 * <strong> inside an <h1 contenteditable>) will have activeElement
	 * be the <h1>, not the <strong>.
	 */
	function isInsideFocusedEditable( node ) {
		var doc = getCanvasDocument();
		if ( ! doc ) {
			return false;
		}
		var active = doc.activeElement;
		if ( ! active || active === doc.body ) {
			return false;
		}
		// activeElement must itself be a contenteditable host, not
		// just the body. Block-editor canvas: when a block is being
		// typed in, activeElement is the block's contenteditable.
		if ( active.getAttribute && active.getAttribute( 'contenteditable' ) !== 'true' ) {
			return false;
		}
		var el = node.nodeType === 1 ? node : node.parentNode;
		while ( el ) {
			if ( el === active ) {
				return true;
			}
			el = el.parentNode;
		}
		return false;
	}

	/**
	 * Returns the closest .block-editor-block-list__block ancestor
	 * (including the node itself if it's a block element). Used to
	 * find which block a text node *directly* belongs to, so we can
	 * skip swapping only inside the leaf block the author has
	 * selected — not inside every descendant of an ancestor block.
	 */
	function closestBlockElement( node ) {
		var el = node.nodeType === 1 ? node : node.parentNode;
		while ( el && el.nodeType === 1 ) {
			if ( el.classList && el.classList.contains( 'block-editor-block-list__block' ) ) {
				return el;
			}
			el = el.parentNode;
		}
		return null;
	}

	/**
	 * Walks text nodes inside `root`, calling visitor(textNode) on
	 * each accepted node. Acceptance rules:
	 *
	 *   - Skip text nodes inside <code> or <pre> (probably docs).
	 *   - Skip text nodes inside the currently-focused contenteditable
	 *     (catches the typing race even when the selection store is
	 *     stale — see isInsideFocusedEditable rationale).
	 *   - If selectedClientIdToSkip is set, skip text nodes whose
	 *     CLOSEST owning block matches it. Nested children of the
	 *     selected block are still walked.
	 *   - Only consider text nodes that either contain a `{` (could
	 *     be a token to swap) OR have an entry in ORIGINALS (already
	 *     swapped, may need restoring or rewalking).
	 */
	function walkTextNodes( root, selectedClientIdToSkip, visitor ) {
		if ( ! root ) {
			return;
		}
		var doc = root.ownerDocument || document;
		var walker = doc.createTreeWalker(
			root,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: function ( node ) {
					var parent = node.parentNode;
					if ( ! parent || parent.nodeType !== 1 ) {
						return NodeFilter.FILTER_REJECT;
					}
					var codeAncestor = parent.closest && parent.closest( 'code, pre' );
					if ( codeAncestor ) {
						return NodeFilter.FILTER_REJECT;
					}
					if ( isInsideFocusedEditable( node ) ) {
						return NodeFilter.FILTER_REJECT;
					}
					if ( selectedClientIdToSkip ) {
						var ownBlock = closestBlockElement( node );
						if ( ownBlock && ownBlock.getAttribute( 'data-block' ) === selectedClientIdToSkip ) {
							return NodeFilter.FILTER_REJECT;
						}
					}
					var hasBrace = node.nodeValue && node.nodeValue.indexOf( '{' ) !== -1;
					var alreadySwapped = ORIGINALS.has( node );
					if ( ! hasBrace && ! alreadySwapped ) {
						return NodeFilter.FILTER_REJECT;
					}
					return NodeFilter.FILTER_ACCEPT;
				},
			},
			false
		);
		var node;
		var batch = [];
		while ( ( node = walker.nextNode() ) ) {
			batch.push( node );
		}
		batch.forEach( visitor );
	}

	/**
	 * Replaces {token} substrings in a text node's nodeValue with
	 * sample values, in-place. Records the original text in
	 * ORIGINALS so we can restore it later.
	 *
	 * NO element is inserted. The text node's identity is preserved.
	 * This is the pure-text replacement strategy that keeps Gutenberg
	 * RichText's model in sync with the DOM (see file-top history
	 * comment for why the earlier <span>-wrapping approach broke).
	 */
	function swapTokensInTextNode( textNode ) {
		var text = textNode.nodeValue;
		if ( ! text ) {
			return;
		}
		// Already swapped: the current nodeValue is the SAMPLE-form
		// of the original. Re-running would no-op (no `{` in the
		// sample) and corrupt ORIGINALS. Bail.
		if ( ORIGINALS.has( textNode ) ) {
			return;
		}
		TOKEN_RE.lastIndex = 0;
		if ( ! TOKEN_RE.test( text ) ) {
			return;
		}
		TOKEN_RE.lastIndex = 0;
		var swapped = text.replace( TOKEN_RE, function ( whole, key ) {
			var sample = SAMPLES[ key ];
			if ( typeof sample !== 'string' ) {
				return whole;
			}
			return sample;
		} );
		if ( swapped === text ) {
			return;
		}
		ORIGINALS.set( textNode, text );
		textNode.nodeValue = swapped;
	}

	/**
	 * Restores a single text node's original (pre-swap) nodeValue if
	 * it has an ORIGINALS entry; no-op otherwise.
	 */
	function restoreTextNode( textNode ) {
		if ( ! ORIGINALS.has( textNode ) ) {
			return;
		}
		var original = ORIGINALS.get( textNode );
		ORIGINALS.delete( textNode );
		// Guard against re-entry: only write if the value actually
		// changed.
		if ( textNode.nodeValue !== original ) {
			textNode.nodeValue = original;
		}
	}

	/**
	 * Restores every text node we've swapped inside `scope` (or the
	 * whole canvas if `scope` is omitted). When `ownBlockOnly` is
	 * true and `scope` is a block element, only restores text nodes
	 * whose CLOSEST block ancestor is `scope` itself — nested child
	 * blocks are left alone.
	 */
	function restoreTokens( scope, ownBlockOnly ) {
		var root = scope || getCanvasRoot();
		if ( ! root ) {
			return;
		}
		var selectedBlockEl = ownBlockOnly && root && root.classList && root.classList.contains( 'block-editor-block-list__block' )
			? root
			: null;
		var doc = root.ownerDocument || document;
		var walker = doc.createTreeWalker(
			root,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: function ( node ) {
					if ( ! ORIGINALS.has( node ) ) {
						return NodeFilter.FILTER_REJECT;
					}
					if ( selectedBlockEl ) {
						var owning = closestBlockElement( node );
						if ( owning !== selectedBlockEl ) {
							return NodeFilter.FILTER_REJECT;
						}
					}
					return NodeFilter.FILTER_ACCEPT;
				},
			},
			false
		);
		var batch = [];
		var node;
		while ( ( node = walker.nextNode() ) ) {
			batch.push( node );
		}
		batch.forEach( restoreTextNode );
	}

	/**
	 * Returns the .block-editor-block-list__block element matching
	 * the given client id, or null.
	 */
	function blockElementForClientId( clientId ) {
		if ( ! clientId ) {
			return null;
		}
		var root = getCanvasRoot();
		if ( ! root ) {
			return null;
		}
		var doc = root.ownerDocument || document;
		return doc.querySelector(
			'.block-editor-block-list__block[data-block="' + clientId + '"]'
		);
	}

	/**
	 * Performs a full pass: swaps tokens everywhere except the
	 * actively-focused contenteditable and the selected block's own
	 * text. Used on bootstrap, on enable, and as the recovery path
	 * after large editor re-renders.
	 */
	function fullPass() {
		if ( ! enabled ) {
			return;
		}
		var root = getCanvasRoot();
		if ( ! root ) {
			return;
		}
		pauseObserver = true;
		try {
			walkTextNodes( root, selectedClientId, swapTokensInTextNode );
		} finally {
			pauseObserver = false;
		}
	}

	/**
	 * MutationObserver callback.
	 *
	 * Heuristic: any childList change with non-our additions, or any
	 * characterData change, triggers a fullPass. The fullPass already
	 * skips actively-focused editables, so typing inside a previewed
	 * block won't re-swap the text under the cursor.
	 */
	function onMutations( mutations ) {
		if ( pauseObserver || ! enabled ) {
			return;
		}
		var hasInterestingChange = false;
		for ( var i = 0; i < mutations.length; i++ ) {
			var m = mutations[ i ];
			if ( m.type === 'childList' && m.addedNodes && m.addedNodes.length > 0 ) {
				hasInterestingChange = true;
				break;
			}
			if ( m.type === 'characterData' ) {
				hasInterestingChange = true;
				break;
			}
		}
		if ( ! hasInterestingChange ) {
			return;
		}
		fullPass();
	}

	/**
	 * Installs the MutationObserver on the canvas root. Returns a
	 * disconnect function. Re-installs if the canvas iframe gets
	 * swapped out (Gutenberg occasionally rebuilds the canvas).
	 */
	function startObserver() {
		var observer = null;
		var attached = null;

		function attach() {
			var root = getCanvasRoot();
			if ( ! root || root === attached ) {
				return;
			}
			if ( observer ) {
				observer.disconnect();
			}
			attached = root;
			observer = new ( root.ownerDocument.defaultView || window ).MutationObserver( onMutations );
			observer.observe( root, {
				subtree: true,
				childList: true,
				characterData: true,
			} );
			fullPass();
		}

		attach();
		var interval = window.setInterval( function () {
			var root = getCanvasRoot();
			if ( root && root !== attached ) {
				attach();
			}
		}, 500 );

		return function () {
			window.clearInterval( interval );
			if ( observer ) {
				observer.disconnect();
			}
		};
	}

	/**
	 * Subscribes to the editor's selection store. We restore raw
	 * tokens on the newly-selected block (so authors see what's
	 * stored when they click in) and re-swap the previously-selected
	 * block's tokens (so the deselected block flips back to preview).
	 *
	 * The closest-block rule means we only flip preview state for the
	 * blocks' own text content, never their descendants'. Selecting
	 * a parent Group block restores tokens in the Group's own text,
	 * not in its nested paragraphs.
	 */
	function startSelectionWatcher() {
		var unsubscribe = wp.data.subscribe( function () {
			var nextId = wp.data.select( 'core/block-editor' ).getSelectedBlockClientId();
			if ( nextId === selectedClientId ) {
				return;
			}
			var prevId = selectedClientId;
			selectedClientId = nextId || null;
			if ( ! enabled ) {
				return;
			}
			pauseObserver = true;
			try {
				if ( prevId ) {
					var prevEl = blockElementForClientId( prevId );
					if ( prevEl ) {
						walkTextNodes(
							prevEl,
							null,
							swapTokensInTextNode
						);
					}
				}
				if ( selectedClientId ) {
					var nextEl = blockElementForClientId( selectedClientId );
					if ( nextEl ) {
						restoreTokens( nextEl, true );
					}
				}
			} finally {
				pauseObserver = false;
			}
		} );
		return unsubscribe;
	}

	function setEnabled( next ) {
		if ( next === enabled ) {
			return;
		}
		enabled = next;
		writeEnabled( enabled );
		if ( enabled ) {
			fullPass();
		} else {
			pauseObserver = true;
			try {
				restoreTokens();
			} finally {
				pauseObserver = false;
			}
		}
	}

	/**
	 * Renders the toggle in the document sidebar.
	 */
	var el = wp.element.createElement;
	var useState = wp.element.useState;
	var useEffect = wp.element.useEffect;
	var ToggleControl = wp.components.ToggleControl;
	var PluginDocumentSettingPanel =
		wp.editPost && wp.editPost.PluginDocumentSettingPanel;
	var registerPlugin = wp.plugins.registerPlugin;
	var __ = wp.i18n && wp.i18n.__ ? wp.i18n.__ : function ( s ) { return s; };

	function PreviewValuesPanel() {
		var state = useState( enabled );
		var checked = state[ 0 ];
		var setChecked = state[ 1 ];

		useEffect( function () {
			setChecked( enabled );
		}, [] );

		function onChange( next ) {
			setChecked( next );
			setEnabled( next );
		}

		return el(
			PluginDocumentSettingPanel,
			{
				name: 'clipisode-preview-values',
				title: __( 'Preview sample values', 'clipisode' ),
				className: 'clipisode-preview-values-panel',
			},
			el( ToggleControl, {
				label: __( 'Show sample values for placeholders', 'clipisode' ),
				help: checked
					? __(
						'Tokens like {topic_title} are shown using sample values from preview-values.json. The selected block always shows raw tokens so you can edit them.',
						'clipisode'
					)
					: __(
						'Showing raw tokens (e.g. {topic_title}) everywhere. Toggle on to preview realistic-length copy in the canvas.',
						'clipisode'
					),
				checked: checked,
				onChange: onChange,
			} )
		);
	}

	if ( PluginDocumentSettingPanel && registerPlugin ) {
		registerPlugin( 'clipisode-preview-values', {
			render: PreviewValuesPanel,
		} );
	}

	startObserver();
	startSelectionWatcher();
} )( window.wp, window.clipisodeThemePreviewValues );
