/**
 * WordPress dependencies
 */
// @ts-ignore InspectorPopoverHeader is exported at runtime, but is missing from the package types.
import { __experimentalInspectorPopoverHeader as InspectorPopoverHeader } from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	Dropdown,
	Flex,
	Notice,
	TextareaControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { select as wpSelect, subscribe, useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { count } from '@wordpress/wordcount';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../../js/telemetry/telemetry';
import {
	ContentHelperError,
	ContentHelperErrorCode,
} from '../../common/content-helper-error';
import { AiIcon } from '../../common/icons/ai-icon';
import {
	ExcerptSuggestionsSettings as ExcerptSuggestionsSettingsType,
	SidebarSettings,
	useSettings,
} from '../../common/settings';
import { DEFAULT_PERSONA, DEFAULT_TONE } from '../../common/utils/constants';
import { forGeneration } from '../../common/utils/defaults';
import { ExcerptSuggestionsSettings } from './component-panel-settings';
import { ExcerptSuggestionsProvider } from './provider';

/**
 * The ID of the snackbar notice shown after generating an excerpt.
 *
 * Reusing the same ID replaces the previous notice instead of stacking.
 *
 * @since 3.24.0
 */
const GENERATED_NOTICE_ID = 'wp-parsely-excerpt-generated';

/**
 * Describes an applied generation, kept for attributing an accepted/discarded
 * telemetry event at save time.
 *
 * @since 3.24.0
 */
interface PendingGeneration {
	generated: string;
	postId: string | number | null;
	previous: string;
	saveCycle: number;
}

/**
 * The last applied generation. Module-scoped so the attribution survives
 * collapsing the panel, which unmounts the component.
 *
 * @since 3.24.0
 */
let pendingGeneration: PendingGeneration | null = null;

/**
 * Whether a generation request is in flight. Module-scoped, as the component
 * unmounts (losing its `isLoading` state) when the panel is collapsed.
 *
 * @since 3.24.0
 */
let isGenerating = false;

/**
 * Setters of the mounted panels, notified whenever `isGenerating` changes.
 *
 * A request outlives the panel that started it, so a panel mounting mid-request
 * must be told when that request finishes.
 *
 * @since 3.24.0
 */
const generatingListeners = new Set<( value: boolean ) => void>();

/**
 * Sets whether a generation request is in flight.
 *
 * @since 3.24.0
 *
 * @param {boolean} value Whether a request is in flight.
 */
const setGenerating = ( value: boolean ): void => {
	isGenerating = value;
	generatingListeners.forEach( ( listener ) => listener( value ) );
};

/**
 * The active save subscription, and the last observed saving state.
 *
 * @since 3.24.0
 */
let unsubscribeFromSaves: ( () => void ) | null = null;
let wasSaving = false;

/**
 * Counter of started non-autosave saves, so a generation is only attributed
 * to a save that started after it. A save already in flight when a generation
 * completes must not consume the generation's outcome.
 *
 * @since 3.24.0
 */
let saveCycle = 0;

/**
 * Stops watching for post saves and forgets any pending generation.
 *
 * @since 3.24.0
 */
const stopWatchingSaves = (): void => {
	unsubscribeFromSaves?.();
	unsubscribeFromSaves = null;
	pendingGeneration = null;
	wasSaving = false;
};

/**
 * Starts watching for post saves, attributing the pending generation's
 * outcome once a non-autosave save succeeds.
 *
 * With no explicit Accept button, the outcome is inferred at save time: a
 * generated excerpt still intact when the user saves counts as accepted, while
 * one reverted through the editor history or cleared counts as discarded.
 * Anything else is left unreported.
 *
 * Preview and trash saves are ignored, as neither expresses an outcome. The
 * subscription is torn down as soon as the generation is attributed or can no
 * longer be attributed. Its editor store argument is ignored before WP 6.2,
 * where the listener runs on every store change instead.
 *
 * @since 3.24.0
 */
const watchSavesForGenerationOutcome = (): void => {
	if ( unsubscribeFromSaves ) {
		return;
	}

	/**
	 * Returns whether the editor is performing a save that expresses an
	 * outcome for a generated excerpt.
	 *
	 * Autosaves, preview saves and the save that follows trashing a post do
	 * not, as none of them reflects a decision about the excerpt.
	 *
	 * @since 3.24.0
	 *
	 * @return {boolean} Whether such a save is in progress.
	 */
	const isOutcomeSave = (): boolean => {
		const editor = wpSelect( editorStore );

		return editor.isSavingPost() &&
			! editor.isAutosavingPost() &&
			! editor.isPreviewingPost() &&
			! editor.isDeletingPost();
	};

	// Seed from the current state, counting any save already in flight, so
	// the generation is not attributed to it.
	wasSaving = isOutcomeSave();
	if ( wasSaving ) {
		saveCycle++;
	}

	unsubscribeFromSaves = subscribe( () => {
		const editor = wpSelect( editorStore );
		const isSaving = isOutcomeSave();

		if ( isSaving && ! wasSaving ) {
			saveCycle++;
		}

		// The edited post changed, so the outcome can no longer be observed.
		if ( pendingGeneration &&
			pendingGeneration.postId !== editor.getCurrentPostId()
		) {
			stopWatchingSaves();
			return;
		}

		if ( wasSaving && ! isSaving && pendingGeneration &&
			pendingGeneration.saveCycle < saveCycle &&
			editor.didPostSaveRequestSucceed()
		) {
			const { generated, previous } = pendingGeneration;
			const savedExcerpt = editor.getEditedPostAttribute( 'excerpt' ) ?? '';

			stopWatchingSaves();

			// A saved excerpt matching neither was either rewritten by the
			// author or altered by the server on save. Leave it unreported:
			// under-counting beats counting a rejection as an acceptance.
			if ( savedExcerpt === generated ) {
				Telemetry.trackEvent( 'excerpt_generator_accepted', { modified: false } );
			} else if ( savedExcerpt === previous || '' === savedExcerpt ) {
				Telemetry.trackEvent( 'excerpt_generator_discarded', { via: 'editor_undo' } );
			}

			return;
		}

		wasSaving = isSaving;
	}, editorStore );
};

/**
 * The PostExcerptSuggestions component displays the excerpt textarea and the Parse.ly AI controls.
 *
 * Generated excerpts are applied immediately and announced with a snackbar
 * offering Undo, mirroring how core applies one-shot changes such as pushing
 * block styles to Global Styles. The generation settings are progressively
 * disclosed through a settings popover.
 *
 * @since 3.13.0
 * @since 3.17.0 Renamed from `PostExcerptSuggestions`.
 * @since 3.24.0 Replaced the review flow with apply + snackbar Undo.
 *
 * @return {import('react').JSX.Element} The PostExcerptSuggestions component.
 */
export const PostExcerptSuggestions = (): React.JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();

	const [ error, setError ] = useState<ContentHelperError>();
	const [ generationCount, setGenerationCount ] = useState<number>( 0 );
	const [ isLoading, setLoading ] = useState<boolean>( isGenerating );
	const [ popoverAnchor, setPopoverAnchor ] = useState<HTMLElement | null>( null );

	// Track the shared generation state, as a request started by a previous
	// panel can still be in flight.
	useEffect( () => {
		generatingListeners.add( setLoading );
		setLoading( isGenerating );

		return () => {
			generatingListeners.delete( setLoading );
		};
	}, [] );

	const popoverTitle = __( 'Excerpt Suggestions settings', 'wp-parsely' );
	const helpId = `wp-parsely-excerpt-generate-help-${ useInstanceId( PostExcerptSuggestions ) }`;

	// Anchor the settings popover to the entire actions row, so it aligns to
	// the left of the sidebar like the core document sidebar popovers.
	const popoverProps = useMemo( () => ( {
		'aria-label': popoverTitle,
		anchor: popoverAnchor,
		headerTitle: popoverTitle,
		placement: 'left-start' as const,
		offset: 36,
		shift: true,
	} ), [ popoverAnchor, popoverTitle ] );

	const { editPost } = useDispatch( editorStore );
	const { createSuccessNotice } = useDispatch( noticesStore );

	// Closing the popover flushes every pending setting in one commit, with no
	// re-render in between, so `settings` is stale for all but the first flush.
	const settingsRef = useRef( settings );
	useEffect( () => {
		settingsRef.current = settings;
	} );

	/**
	 * Handles changes to the excerpt suggestions settings.
	 *
	 * @since 3.17.0
	 * @since 3.24.0 Merges into the latest settings rather than the rendered ones.
	 *
	 * @param {keyof ExcerptSuggestionsSettingsType} key   The setting key that changed.
	 * @param {string|boolean|number}                value The new value of the setting.
	 */
	const onSettingChange = (
		key: keyof ExcerptSuggestionsSettingsType,
		value: string | boolean | number
	) => {
		const excerptSuggestions = {
			...settingsRef.current.ExcerptSuggestions,
			[ key ]: value,
		};

		settingsRef.current = {
			...settingsRef.current,
			ExcerptSuggestions: excerptSuggestions,
		};

		setSettings( { ExcerptSuggestions: excerptSuggestions } );
	};

	// Get the current excerpt, post content, and post title.
	const { excerpt, postContent, postTitle } = useSelect( ( select ) => {
		const { getEditedPostAttribute, getEditedPostContent } = select( editorStore );

		let content = getEditedPostContent();
		if ( ! content ) {
			content = '';
		}

		const document = new window.DOMParser().parseFromString( content, 'text/html' );
		const documentRawText = ( document.body.textContent ?? document.body.innerText ) || '';

		// Keep only one break line (\n) between blocks.
		content = documentRawText.replace( /\n{2,}/g, '\n' ).trim();

		return {
			excerpt: getEditedPostAttribute( 'excerpt' ) ?? '',
			postContent: content,
			postTitle: getEditedPostAttribute( 'title' ),
		};
	}, [] );

	const wordCountString = useMemo( (): string => {
		const wordCount = count( excerpt, 'words', {} );

		if ( 0 === wordCount ) {
			return '';
		}

		return sprintf(
			// Translators: %1$s the number of words in the excerpt.
			_n( '%1$s word', '%1$s words', wordCount, 'wp-parsely' ),
			wordCount
		);
	}, [ excerpt ] );

	// Scroll the textarea to the top when a new excerpt is generated.
	useEffect( () => {
		if ( 0 === generationCount ) {
			return;
		}

		const textarea = document.querySelector( '.editor-post-excerpt textarea' );
		if ( textarea ) {
			textarea.scrollTop = 0;
		}
	}, [ generationCount ] );

	/**
	 * Generates an excerpt using Parse.ly AI, applies it to the post, and
	 * shows a snackbar notice offering Undo.
	 *
	 * @since 3.13.0
	 * @since 3.24.0 Applies the excerpt immediately instead of entering a review state.
	 */
	const generateExcerpt = async () => {
		// The panel unmounts when collapsed, so guard against a second request
		// being started while the first one is still in flight.
		if ( isGenerating ) {
			return;
		}

		setGenerating( true );
		setError( undefined );

		try {
			Telemetry.trackEvent( 'excerpt_generator_pressed' );
			// Read imperatively to avoid capturing a stale excerpt in the Undo closure.
			const editor = wpSelect( editorStore );
			const postId = editor.getCurrentPostId();
			// Attribute the outcome to the excerpt that was in the post before
			// any generation, so Undo restores the author's own text.
			const previousExcerpt = pendingGeneration?.postId === postId
				? pendingGeneration.previous
				: editor.getEditedPostAttribute( 'excerpt' ) ?? '';
			const excerptSettings = settings.ExcerptSuggestions;
			const requestedExcerpt = await ExcerptSuggestionsProvider
				.getInstance()
				.generateExcerpt(
					postTitle,
					postContent,
					forGeneration( excerptSettings.Persona, 'excerptSuggestions', 'persona', DEFAULT_PERSONA ),
					forGeneration( excerptSettings.Tone, 'excerptSuggestions', 'tone', DEFAULT_TONE ),
					excerptSettings.Length
				);

			// `editPost` always targets the current post, so discard a response
			// that arrives after the editor moved on to another one.
			if ( editor.getCurrentPostId() !== postId ) {
				return;
			}

			editPost( { excerpt: requestedExcerpt } );
			setGenerationCount( ( prev ) => prev + 1 );

			// Start watching before recording the generation, so an
			// already-in-flight save is counted into the current cycle.
			watchSavesForGenerationOutcome();
			pendingGeneration = {
				generated: requestedExcerpt,
				postId,
				previous: previousExcerpt,
				saveCycle,
			};

			createSuccessNotice(
				__( 'Excerpt generated.', 'wp-parsely' ),
				{
					type: 'snackbar',
					id: GENERATED_NOTICE_ID,
					actions: [
						{
							label: __( 'Undo', 'wp-parsely' ),
							onClick: () => {
								// The notice outlives the generation, so only
								// act while it is still the pending one.
								if ( pendingGeneration?.postId !== postId ) {
									return;
								}

								stopWatchingSaves();
								editPost( { excerpt: previousExcerpt } );
								Telemetry.trackEvent( 'excerpt_generator_discarded', { via: 'snackbar' } );
							},
						},
					],
				}
			);
		} catch ( err: unknown ) {
			if ( err instanceof ContentHelperError ) {
				setError( err );
			} else {
				setError( new ContentHelperError( __( 'An unknown error occurred.', 'wp-parsely' ), ContentHelperErrorCode.UnknownError ) );
				console.error( err ); // eslint-disable-line no-console
			}
		} finally {
			setGenerating( false );
		}
	};

	// A single string child, as Button only detects a text label when it is one
	// (or when the first child of an array is truthy). Without it, the button
	// gets the icon-only padding.
	let generateLabel: string = __( 'Generate', 'wp-parsely' );
	if ( isLoading ) {
		generateLabel = __( 'Generating…', 'wp-parsely' );
	} else if ( generationCount > 0 ) {
		generateLabel = __( 'Regenerate', 'wp-parsely' );
	}

	return (
		<VStack className="wp-parsely-excerpt-suggestions" spacing={ 4 }>
			{ error && (
				<Notice
					className="wp-parsely-content-helper-error"
					onRemove={ () => setError( undefined ) }
					status="info"
				>
					{ error.Message() }
				</Notice>
			) }

			<div className="editor-post-excerpt">
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Write an excerpt (optional)', 'wp-parsely' ) }
					className="editor-post-excerpt__textarea"
					onChange={ ( value ) => editPost( { excerpt: value } ) }
					value={ excerpt }
					help={ wordCountString ? wordCountString : null }
					disabled={ isLoading }
				/>
			</div>

			<BaseControl
				__nextHasNoMarginBottom
				id={ helpId }
				help={ ! postContent
					? __( 'Add content to generate an excerpt.', 'wp-parsely' )
					: null
				}
			>
				<Flex justify="flex-start" gap={ 2 } wrap ref={ setPopoverAnchor }>
					{ /* Focusable while disabled, so the help text is announced and focus
					     is kept. `accessibleWhenDisabled` supersedes it, but needs WP 6.3. */ }
					<Button
						__next40pxDefaultSize
						__experimentalIsFocusable
						aria-describedby={ ! postContent ? `${ helpId }__help` : undefined }
						variant="secondary"
						icon={ AiIcon }
						onClick={ generateExcerpt }
						isBusy={ isLoading }
						disabled={ isLoading || ! postContent }
					>
						{ generateLabel }
					</Button>
					<Dropdown
						contentClassName="editor-post-excerpt__dropdown__content"
						popoverProps={ popoverProps }
						renderToggle={ ( { isOpen, onToggle } ) => (
							<Button
								__next40pxDefaultSize
								variant="tertiary"
								onClick={ onToggle }
								aria-expanded={ isOpen }
								aria-haspopup="dialog"
								aria-label={ popoverTitle }
							>
								{ __( 'Settings', 'wp-parsely' ) }
							</Button>
						) }
						renderContent={ ( { onClose } ) => (
							<>
								<InspectorPopoverHeader
									title={ popoverTitle }
									onClose={ onClose }
								/>
								<ExcerptSuggestionsSettings
									isLoading={ isLoading }
									length={ settings.ExcerptSuggestions.Length }
									onLengthChange={ ( length ) => onSettingChange( 'Length', length ) }
									onPersonaChange={ ( persona ) => onSettingChange( 'Persona', persona ) }
									onToneChange={ ( tone ) => onSettingChange( 'Tone', tone ) }
									persona={ settings.ExcerptSuggestions.Persona }
									tone={ settings.ExcerptSuggestions.Tone }
								/>
							</>
						) }
					/>
				</Flex>
			</BaseControl>
		</VStack>
	);
};
