/**
 * IAPI store for the /clipisode-flow/{slug} guest-facing flow.
 *
 * This file is checked in as plain JS under assets/flow/ and is enqueued
 * directly by clipisode-flow.php. It is NOT an output of
 * `npm run build` (webpack only builds src/index.tsx → build/). Edits
 * here apply on the next request with no build step. If a fade or store
 * change does not show on staging, hard-reload (cache) or confirm the
 * deployed zip includes assets/flow/store.js — running wp-scripts build
 * alone will not copy this file.
 *
 *
 * Step 6 scope: state-driven screen transitions inside a single IAPI region.
 * All 10 screens are rendered server-side; only one is visible at a time.
 * state.screen names the active screen type (canonical underscore form, e.g.
 * "intro" or "warning_silent"). Sections compare their context.matches
 * against state.screen via the isActiveScreen getter; buttons set
 * state.screen to context.target via actions.goTo.
 *
 * Step 9 scope: Record/Upload triggers + Terms modal.
 *  - Record and Upload triggers are wired via the render_block magic-href
 *    rewrite in class-post-types.php, which turns <a href="#record"> /
 *    <a href="#upload"> into <label for="clipisode-{record|upload}-input">
 *    on the public flow. The native HTML label→input pairing opens the
 *    file picker on iOS Safari (which silently swallows programmatic
 *    .click() on a hidden file input dispatched through the synthetic
 *    delegated-click pipeline). recordVideo / uploadVideo actions are
 *    kept here as a fallback for any saved content that still routes
 *    through IAPI, but the primary path is native + no JS.
 *  - actions.handleFileChosen captures the picked File on a global so the
 *    upcoming upload XHR (Name screen) can read it without round-tripping
 *    through IAPI state (state has to be JSON-serialisable).
 *  - actions.openTerms / .closeTerms toggle state.termsOpen so the modal
 *    overlay rendered by the template binds with data-wp-bind--hidden.
 *
 * Step 10 scope: actual upload + Name + Success.
 *  - Upload survival across screen swap is free in our architecture: every
 *    screen is a sibling <section> inside a single IAPI region toggled by
 *    data-wp-bind--hidden, so there is no router unmount, no document
 *    teardown, and any XHR fired here lives on `window` until completion.
 *  - handleFileChosen now fires a real POST to clipisode/v1/invitation/
 *    upload as soon as the file is picked, in parallel with the screen
 *    flip to "name". xhr.upload.onprogress drives state.uploadPercent so
 *    the Name-screen progress bar advances while the user types.
 *  - submitReply gates on uploadStatus: if the upload is still running
 *    when the user taps Send we set state.pendingSubmit so the upload's
 *    own onload handler can fire submit once a media_id is in hand.
 *  - On submit success we set state.screen = 'success'. URL-level
 *    /done routing + localStorage cleanup come post-demo.
 *
 * Intro video playback model:
 *   Strict tap-to-play. The <video> ships paused with `muted` set;
 *   no autoplay attribute. The flow template's inline init script
 *   seeks to ~0.05s after loadedmetadata so most browsers paint a
 *   real first frame as a "poster." On the Android Chrome / GPU
 *   combinations where the seek doesn't trigger a frame paint we
 *   show the gradient + centre play button — also a clear UX. The
 *   compositing wrap (.clipisode-intro-video-wrap, isolation: isolate
 *   + transform: translateZ(0)) keeps the video's compositing layer
 *   strictly above the root's gradient on Android Chrome regardless
 *   of which surface mode the decoder picks.
 *
 *   Tapping the centre play target unmutes the element and calls
 *   .play() synchronously inside the user-gesture handler so iOS
 *   grants audio. Tap again to pause. No `loop` attribute and no
 *   muted autoplay — silent self-starting playback was reported as
 *   "the video loops" because guests reflexively re-tapped the play
 *   button after the first natural ending.
 *
 *   We deliberately do NOT bind data-wp-on--play / data-wp-on--pause
 *   on the video element. togglePlayback updates state.videoPlaying
 *   itself when the user taps, which is the only moment the play-
 *   button visibility actually needs to change. onIntroVideoEnded is
 *   still bound so the play button reappears if a guest watches the
 *   video to completion.
 */

import * as interactivity from '@wordpress/interactivity';

const { store, getContext } = interactivity;

// Plain-function helpers extracted so:
//
//   - The upload's onload handler can fire submit on the user's behalf
//     when state.pendingSubmit was set during an in-flight upload.
//   - submitReply can re-fire the upload (with the cached File on
//     window.__clipisodeReplyFile) when the guest taps Send / Try again
//     after a network failure, so they don't have to re-record.
//
// Keeping the helpers outside the store object means handleFileChosen,
// submitReply, and the upload's own onload can all call them without
// going through `actions.x` reflection (the actions proxy isn't bound
// until store() returns, which the upload onload may race with on slow
// initial paints).
//
// `state` is a closure capture from store(), set immediately after
// store() returns. Declared with `let` so the helpers see the live proxy.
let state;

// Pause the intro video before navigating away from the intro screen.
// .clipisode-flow-screen now uses opacity + visibility for the 300ms
// crossfade instead of [hidden] (display:none). visibility: hidden does
// NOT pause an HTMLMediaElement — Chrome/Safari will keep the audio
// stream playing under a faded-out screen, which is exactly the bug the
// host reported on every release of the legacy invitation page. We pause
// from goTo and handleFileChosen, which are the only paths that move
// state.screen away from "intro." The element + state are reset together
// so the centre play button reappears if the guest later navigates back.
function pauseIntroVideo() {
	const v = document.querySelector( '.clipisode-intro-video' );
	if ( v && ! v.paused ) {
		try {
			v.pause();
		} catch ( e ) {
			/* noop */
		}
	}
	if ( state ) {
		state.videoPlaying = false;
	}
}

// Fires (or re-fires) the upload XHR. The same code path is used by
// handleFileChosen for the first try and by submitReply for retries
// after a network failure. We expose the in-flight XHR on
// window.__clipisodeReplyXhr so a subsequent retry can abort the
// previous attempt cleanly (otherwise stacking retries can race).
function fireUpload( file ) {
	if ( ! state || ! file ) {
		return;
	}

	if ( window.__clipisodeReplyXhr ) {
		try {
			window.__clipisodeReplyXhr.abort();
		} catch ( err ) {
			/* aborting an already-completed XHR throws on some browsers */
		}
	}

	state.replyMediaId = 0;
	state.uploadPercent = 0;
	state.uploadStatus = 'uploading';
	state.uploadError = '';

	const xhr = new XMLHttpRequest();
	xhr.open( 'POST', ( state.restUrl || '' ) + 'invitation/upload' );
	xhr.upload.onprogress = ( e ) => {
		if ( e.lengthComputable && e.total > 0 ) {
			state.uploadPercent = Math.round( ( e.loaded / e.total ) * 100 );
		}
	};
	xhr.onload = () => {
		if ( xhr.status >= 200 && xhr.status < 300 ) {
			let data = null;
			try {
				data = JSON.parse( xhr.responseText || '{}' );
			} catch ( err ) {
				state.uploadStatus = 'error';
				state.uploadError =
					'Upload server returned an unexpected response.';
				return;
			}
			state.replyMediaId = ( data && ( data.id || data.media_id ) ) || 0;
			state.uploadStatus = 'done';
			state.uploadPercent = 100;
			if ( state.pendingSubmit ) {
				fireSubmit();
			}
		} else {
			let msg = `Upload failed (${ xhr.status }).`;
			try {
				const data = JSON.parse( xhr.responseText || '{}' );
				if ( data && data.message ) {
					msg = data.message;
				}
			} catch ( err ) {
				/* keep status-code message */
			}
			state.uploadStatus = 'error';
			state.uploadError = msg;
		}
	};
	xhr.onerror = () => {
		state.uploadStatus = 'error';
		state.uploadError =
			'Network error while uploading. Check your connection and try again.';
	};
	xhr.onabort = () => {
		// Aborts triggered by a deliberate retry leave uploadStatus
		// in 'uploading' (set just below by the next fireUpload call).
		// Aborts triggered any other way are treated as a cancellation.
		if ( state.uploadStatus === 'uploading' ) {
			state.uploadStatus = 'error';
			state.uploadError = 'Upload was cancelled.';
		}
	};

	const fd = new FormData();
	fd.append( 'video', file );
	fd.append( 'slug', state.slug || '' );
	fd.append( '_clipisode_nonce', state.uploadNonce || '' );
	xhr.send( fd );
	window.__clipisodeReplyXhr = xhr;
}

function fireSubmit() {
	if ( ! state ) {
		return;
	}
	if (
		state.submitStatus === 'submitting' ||
		state.submitStatus === 'done'
	) {
		return;
	}
	const name = ( state.replyName || '' ).trim();
	if ( name === '' ) {
		state.submitError = 'Please enter your name.';
		state.submitStatus = 'idle';
		return;
	}
	if ( state.uploadStatus === 'error' ) {
		state.submitError =
			state.uploadError || 'Upload failed. Please try again.';
		state.submitStatus = 'idle';
		return;
	}
	state.pendingSubmit = false;
	state.submitStatus = 'submitting';
	state.submitError = '';

	const body = new URLSearchParams( {
		slug: state.slug || '',
		_clipisode_nonce: state.uploadNonce || '',
		name,
		social_handle: state.showHandleFields
			? ( state.replyHandle || '' ).trim()
			: '',
		social_network: state.showHandleFields ? ( state.socialNetwork || '' ) : '',
		media_id: String( state.replyMediaId || 0 ),
	} ).toString();

	fetch( ( state.restUrl || '' ) + 'invitation/submit', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body,
	} )
		.then( ( r ) => {
			if ( ! r.ok ) {
				return r
					.json()
					.catch( () => ( {} ) )
					.then( ( j ) => {
						throw new Error( j.message || `HTTP ${ r.status }` );
					} );
			}
			return r.json();
		} )
		.then( () => {
			state.submitStatus = 'done';
			state.submitError = '';
			state.screen = state.hasEmailScreen ? 'email' : 'success';
		} )
		.catch( ( err ) => {
			state.submitStatus = 'error';
			state.submitError =
				( err && err.message ) || 'Could not send your reply.';
		} );
}

const storeApi = store( 'clipisode/flow', {
	state: {
		// Generic active-screen check. Each <section> sets data-wp-context
		// '{"matches":"intro"}' so this getter returns true for exactly one
		// section at a time without needing a getter per screen type.
		get isActiveScreen() {
			const ctx = getContext();
			const matches = ctx?.matches;
			if ( ! matches ) {
				return false;
			}
			if ( matches === state.screen ) {
				return true;
			}
			// Email is an overlay on top of Name. When state.screen is
			// "email", keep the Name screen mounted and visible underneath.
			if ( state.screen === 'email' && matches === 'name' ) {
				return true;
			}
			return false;
		},
		// ---- Name-screen view-model getters ----
		// Each one is a thin derivation over the upload/submit/replyName
		// fields so the form's data-wp-bind directives can stay declarative
		// (data-wp-bind--hidden="!state.showProgress" rather than computing
		// the boolean inline in markup).
		get showFileInfo() {
			return ( state.replyFileName || '' ) !== '';
		},
		get showProgress() {
			return (
				state.uploadStatus === 'uploading' ||
				state.uploadStatus === 'done'
			);
		},
		get uploadPercentCss() {
			const n = Math.max( 0, Math.min( 100, state.uploadPercent | 0 ) );
			return `${ n }%`;
		},
		get uploadProgressLabel() {
			if ( state.uploadStatus === 'done' ) {
				return 'Upload complete';
			}
			if ( state.uploadStatus === 'uploading' ) {
				const n = Math.max(
					0,
					Math.min( 100, state.uploadPercent | 0 )
				);
				const raw = String(
					state.uploadProgressTemplate ||
						'Uploading… {pct}%'
				);
				if ( raw.includes( '{pct}' ) ) {
					return raw.replace( /\{pct\}/g, String( n ) );
				}
				return `${ raw } ${ n }%`;
			}
			return '';
		},
		// canSubmit drives the submit button's `disabled` attribute.
		// We deliberately keep the button enabled in two cases that
		// might look "wait, why isn't this disabled?":
		//   - uploadStatus === 'error':  tapping Send retries the
		//     upload using the cached File and queues submit. The
		//     button label flips to "Try again" so the action is
		//     telegraphed clearly.
		//   - submitStatus === 'pending': we want the guest to be
		//     able to re-tap if they think the first tap didn't
		//     register. The pending tap is idempotent (just keeps
		//     pendingSubmit set), so re-taps are harmless.
		get canSubmit() {
			if ( state.submitStatus === 'submitting' ) {
				return false;
			}
			if ( state.submitStatus === 'done' ) {
				return false;
			}
			if ( ( state.replyName || '' ).trim() === '' ) {
				return false;
			}
			return true;
		},
		// Drives data-wp-class--is-pending on the submit button so the
		// CSS pulse animation kicks in while we're waiting on the
		// upload. Separate getter from canSubmit so the visual
		// affordance is decoupled from the disabled-state logic.
		get isSubmitPending() {
			return state.submitStatus === 'pending';
		},
		// Submit-button label (Pattern B: one editor-authored core/button
		// for the IDLE label, four sidebar-edited alternates for the
		// non-idle states). Server-side seeds state.labels from the
		// rendered name screen at template time — see clipisode-flow.php
		// — so authors can rewrite each label per language without
		// touching JS. We fall back to English defaults only if the
		// server didn't populate a label for some reason.
		get submitButtonLabel() {
			const lbl = state.labels || {};
			if ( state.submitStatus === 'submitting' ) {
				return lbl.submitting || 'Sending…';
			}
			if ( state.submitStatus === 'done' ) {
				return lbl.done || 'Sent';
			}
			if ( state.submitStatus === 'pending' ) {
				return lbl.pending || 'Waiting for upload…';
			}
			if ( state.uploadStatus === 'error' ) {
				return lbl.error || 'Try again';
			}
			return lbl.idle || 'Save my reply';
		},
		get errorMessage() {
			// Suppress upload-error message while we're actively
			// retrying — pending state already communicates "we heard
			// your tap, working on it" and a stale error string under
			// that label is just noisy.
			if (
				state.submitStatus === 'pending' &&
				state.uploadStatus === 'uploading'
			) {
				return '';
			}
			return state.submitError || state.uploadError || '';
		},
		get showError() {
			if (
				state.submitStatus === 'pending' &&
				state.uploadStatus === 'uploading'
			) {
				return false;
			}
			return ( state.submitError || state.uploadError || '' ) !== '';
		},
		get showHandleFields() {
			if ( ! state.handleEnabled ) {
				return false;
			}
			return state.socialNetwork === 'instagram' || state.socialNetwork === 'x';
		},
		get showEmailError() {
			return ( state.emailError || '' ) !== '';
		},
	},
	actions: {
		// Generic screen-jump. Triggering element sets data-wp-context
		// '{"target":"name"}' so the same action handles all 10 buttons.
		// core/button CTA is often an <a href="#"> — always prevent navigation.
		goTo( event ) {
			if ( event && typeof event.preventDefault === 'function' ) {
				event.preventDefault();
			}
			const ctx = getContext();
			if ( ctx?.target ) {
				pauseIntroVideo();
				state.screen = ctx.target;
			}
		},
		// Intro play toggle. The <video> renders paused with `muted`
		// set; the inline init script in clipisode-flow.php has already
		// seeked it to ~0.05s so a still first frame is showing. On
		// tap we unmute and call .play() synchronously inside the
		// click handler so iOS Safari grants audio under the active
		// user gesture. On a second tap we just pause; the seek and
		// muted state stay where the user left them so the next tap
		// resumes from the same position with sound.
		//
		// .play() returns a Promise on every modern browser; rejection
		// means the platform blocked playback (silent-mode, low-power,
		// data-saver), so we re-mute and revert state rather than
		// leaving the play icon hidden over a dead element.
		togglePlayback( event ) {
			if ( event && typeof event.preventDefault === 'function' ) {
				event.preventDefault();
			}
			if ( event && typeof event.stopPropagation === 'function' ) {
				event.stopPropagation();
			}
			const v = document.querySelector( '.clipisode-intro-video' );
			if ( ! v ) {
				state.videoPlaying = ! state.videoPlaying;
				return;
			}
			if ( ! v.paused ) {
				v.pause();
				state.videoPlaying = false;
				return;
			}
			v.muted = false;
			state.videoPlaying = true;
			const p = v.play();
			if ( p && typeof p.catch === 'function' ) {
				p.catch( () => {
					v.muted = true;
					state.videoPlaying = false;
				} );
			}
		},
		onIntroVideoPlay() {
			state.videoPlaying = true;
		},
		onIntroVideoPause() {
			state.videoPlaying = false;
		},
		onIntroVideoEnded() {
			state.videoPlaying = false;
		},
		// Fallback Record action. Primary trigger on the public flow is a
		// <label for="clipisode-record-input"> produced by the magic-href
		// rewrite, which opens the camera natively without JS. This
		// action is only here in case some future screen wires Record
		// through IAPI directly (e.g. a "re-record" button on Name) or
		// some saved content somehow bypassed the rewrite. Same caveat
		// as before applies — programmatic .click() on a hidden file
		// input is unreliable on iOS Safari, so prefer the label path.
		recordVideo( event ) {
			if ( event && typeof event.preventDefault === 'function' ) {
				event.preventDefault();
			}
			const input = document.getElementById( 'clipisode-record-input' );
			if ( input ) {
				input.click();
			}
		},
		// Fallback Upload action. See recordVideo() docblock — same
		// reasoning, just the upload-side input.
		uploadVideo( event ) {
			if ( event && typeof event.preventDefault === 'function' ) {
				event.preventDefault();
			}
			const input = document.getElementById( 'clipisode-upload-input' );
			if ( input ) {
				input.click();
			}
		},
		// Fires from the file inputs' change events. Two jobs:
		//   1. Stash the File on a global so the rest of the flow has a
		//      live reference — the IAPI store is JSON-only and File
		//      isn't serialisable, so we can't put the actual bytes in
		//      state. Also echo a few safe metadata fields into state
		//      so the Name screen can show "Replying with <name>".
		//   2. Hand the File to fireUpload(), which does the real XHR
		//      work (progress, success, retry, abort). Same helper is
		//      used by submitReply when the guest taps "Try again"
		//      after a network failure, so the retry path doesn't have
		//      to re-record — we just re-send the cached bytes.
		//
		// We stamp data-clipisode-iapi-handled on the input so the
		// inline pre-IAPI fallback in clipisode-flow.php skips its own
		// transition (it's only there for the IAPI-dead case).
		handleFileChosen( event ) {
			const input = event && event.target;
			const file = input && input.files && input.files[ 0 ];
			if ( ! file ) {
				return;
			}
			if ( input ) {
				input.setAttribute( 'data-clipisode-iapi-handled', '1' );
			}
			window.__clipisodeReplyFile = file;
			state.replyFileName = file.name;
			state.replyFileSize = file.size;
			state.replyFileType = file.type;
			pauseIntroVideo();
			state.screen = 'name';

			fireUpload( file );
		},
		// Mirrors the input element's value into state.replyName on
		// every keystroke. We don't trim here — trimming on input would
		// fight the user's spacebar; submitReply / canSubmit handle
		// the trimmed comparison.
		//
		// Cancel-pending-on-edit: if the guest taps Send while the
		// upload is still running, then resumes typing in the name
		// field, that's a clear "wait, I want to change something"
		// signal. We reset submitStatus + pendingSubmit + submitError
		// so the button stops pulsing, the label flips back to "Send",
		// and the next Send tap is a fresh decision rather than a
		// holdover from the earlier tap. The upload itself keeps
		// running in the background so they don't lose progress.
		onNameInput( event ) {
			const t = event && event.target;
			if ( t ) {
				state.replyName = t.value || '';
			}
			if ( state.submitStatus === 'pending' ) {
				state.submitStatus = 'idle';
				state.pendingSubmit = false;
			}
			if ( state.submitError ) {
				state.submitError = '';
			}
		},
		onHandleInput( event ) {
			const t = event && event.target;
			if ( t ) {
				state.replyHandle = t.value || '';
			}
		},
		onEmailInput( event ) {
			const t = event && event.target;
			if ( t ) {
				state.replyEmail = t.value || '';
			}
			if ( state.emailError ) {
				state.emailError = '';
			}
		},
		// Submit handler shared by both the form's submit event and the
		// button's click. We always preventDefault so neither path ever
		// triggers a real navigation. Three branches:
		//
		//   - upload still running:    flip submitStatus to 'pending'
		//                              and pendingSubmit to true. The
		//                              upload's onload handler fires
		//                              fireSubmit when a media_id is
		//                              in hand. The Name screen's
		//                              submit button label and pulse
		//                              animation key off both flags so
		//                              the guest gets unmistakable
		//                              "I heard you, hold on" feedback.
		//   - upload errored:          re-fire the upload using the
		//                              cached File on
		//                              window.__clipisodeReplyFile,
		//                              and queue submit as above. This
		//                              is the "Try again" branch, the
		//                              one a guest who just poured
		//                              their heart into a video really
		//                              cares about — they should never
		//                              have to re-record on a network
		//                              hiccup.
		//   - upload done:             fire submit immediately.
		submitReply( event ) {
			if ( event && typeof event.preventDefault === 'function' ) {
				event.preventDefault();
			}
			if ( ( state.replyName || '' ).trim() === '' ) {
				state.submitError = 'Please enter your name.';
				return;
			}
			state.submitError = '';

			if ( state.uploadStatus === 'uploading' ) {
				state.pendingSubmit = true;
				state.submitStatus = 'pending';
				return;
			}
			if ( state.uploadStatus === 'error' ) {
				const file = window.__clipisodeReplyFile;
				if ( ! file ) {
					state.submitError =
						'Your video is no longer available. Tap Record or Upload to choose another.';
					return;
				}
				state.pendingSubmit = true;
				state.submitStatus = 'pending';
				fireUpload( file );
				return;
			}
			fireSubmit();
		},
		submitEmail( event ) {
			if ( event && typeof event.preventDefault === 'function' ) {
				event.preventDefault();
			}
			const email = ( state.replyEmail || '' ).trim();
			if ( email === '' ) {
				state.emailError = 'Please enter your email or tap Skip.';
				return;
			}
			const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email );
			if ( ! valid ) {
				state.emailError = 'Please enter a valid email address.';
				return;
			}
			state.emailError = '';
			state.screen = 'success';
		},
		skipEmail( event ) {
			if ( event && typeof event.preventDefault === 'function' ) {
				event.preventDefault();
			}
			state.emailError = '';
			state.screen = 'success';
		},
		openTerms( event ) {
			if ( event && typeof event.preventDefault === 'function' ) {
				event.preventDefault();
			}
			state.termsOpen = true;
		},
		closeTerms( event ) {
			if ( event && typeof event.preventDefault === 'function' ) {
				event.preventDefault();
			}
			state.termsOpen = false;
		},
	},
	callbacks: {
		init() {
			state.visited = ( state.visited || 0 ) + 1;
			state.path = window.location.pathname;
		},
	},
} );

state = storeApi.state;
