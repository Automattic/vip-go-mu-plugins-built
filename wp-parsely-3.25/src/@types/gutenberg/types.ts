// eslint-disable-next-line import/named
import { BlockInstance } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';

/**
 * Defines typings for core/block-editor functions, to avoid intellisense errors
 * in function calls.
 *
 * This can be removed once Gutenberg provides typings for these functions.
 *
 * @since 3.12.0
 */
export interface GutenbergFunction {
	getBlock: ( clientId: string ) => BlockInstance | null;
	getBlockParents: ( clientId: string ) => string[];
	getBlocks: () => BlockInstance[];
	getCurrentPostAttribute: ( attribute: string ) => string;
	getCurrentPostId: () => number | undefined;
	getEditedPostAttribute: ( attribute: string ) => string;
	getEditedPostContent: () => string;
	getPermalink: () => string | null;
	getSelectedBlock: () => BlockInstance | null;
	hasMetaBoxes: () => boolean;
	isAutosavingPost: () => boolean;
	isSavingPost: () => boolean;
	removeEditorPanel: ( panelName: string ) => void;
	selectBlock: ( clientId: string, initialPosition?: number ) => void;
	updateBlockAttributes: ( clientId: string, attributes: Record<string, unknown> ) => void;
}

/**
 * Defines typings for core/editor functions, to avoid intellisense errors in
 * function calls.
 *
 * This can be removed once Gutenberg provides typings for these functions.
 *
 * @since 3.17.0 Moved from the GutenbergFunction interface.
 */
export interface GutenbergCoreEditorFunction {
	editPost: ( edits: Record<string, unknown> ) => void;
	lockPostAutosaving: ( lockName: string ) => void;
	lockPostSaving: ( lockName: string ) => void;
	unlockPostAutosaving: ( lockName: string ) => void;
	unlockPostSaving: ( lockName: string ) => void;
}

/**
 * Alias for dispatch( 'core/block-editor' ) calls that prevents intellisense
 * errors.
 *
 * @since 3.16.0
 */
export const dispatchCoreBlockEditor = dispatch( 'core/block-editor' ) as GutenbergFunction;

/**
 * Alias for dispatch( 'core/editor' ) calls that prevents intellisense errors.
 *
 * @since 3.16.0
 */
export const dispatchCoreEditor = dispatch( 'core/editor' ) as unknown as GutenbergCoreEditorFunction;

/**
 * Alias for dispatch( 'core/edit-post' ) calls that prevents intellisense
 * errors.
 *
 * @since 3.16.0
 */
export const dispatchCoreEditPost = dispatch( 'core/edit-post' );
