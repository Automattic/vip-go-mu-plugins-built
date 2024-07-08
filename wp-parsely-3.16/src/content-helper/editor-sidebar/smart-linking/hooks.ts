/**
 * WordPress dependencies
 */
import { useRef, useState, useEffect } from '@wordpress/element';
import { dispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../@types/gutenberg/types';
import { SmartLinkingProvider } from './provider';
import { SmartLinkingStore as store } from './store';
import { validateAndFixSmartLinksInPost } from './utils';

/**
 * Handles the smart links validation process, which will validate the smart links before saving the post.
 *
 * This hook is used to validate the smart links before saving the post. It will validate the smart links before
 * saving the post, and then save the post after the smart links have been validated. This is necessary because
 * the validation process may change the post content, and those changes are not reflected in the post saving process.
 *
 * This is a fallback for the validation step in the LinkMonitor component. If for some reason the validation step
 * is not triggered, this hook will fix the smart links before saving the post.
 *
 * @since 3.16.0
 *
 * @param {Function} setValidationComplete The function to set the validation completion state.
 *
 * @return {boolean} Whether the post is saved.
 */
export const useSmartLinksValidation = ( setValidationComplete: ( value: boolean ) => void ): boolean => {
	const [ isPostSaved, setIsPostSaved ] = useState( false );
	const [ didAnyFixes, setDidAnyFixes ] = useState( false );
	const isPostSavingInProgress = useRef( false );
	const hasValidatedLinks = useRef( false );

	const { isSavingPost, isAutosavingPost } = useSelect( ( selectFn ) => {
		const coreEditorSelect = selectFn( 'core/editor' ) as GutenbergFunction;
		return {
			isSavingPost: coreEditorSelect.isSavingPost(),
			isAutosavingPost: coreEditorSelect.isAutosavingPost(),
		};
	}, [] );

	/**
	 * Handles the before save action, which will validate the smart links before saving the post.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		if ( isSavingPost && ! hasValidatedLinks.current ) {
			( async () => {
				const validationFixed = await validateAndFixSmartLinksInPost();
				setDidAnyFixes( validationFixed );
				hasValidatedLinks.current = true;
				setValidationComplete( true );
			} )();
		} else {
			hasValidatedLinks.current = false;
			setValidationComplete( false );
		}
	}, [ isSavingPost, setValidationComplete ] );

	/**
	 * Handles the post saving state tracking.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		if ( ( isSavingPost || isAutosavingPost ) && ! isPostSavingInProgress.current ) {
			setIsPostSaved( false );
			isPostSavingInProgress.current = true;
		} else if ( ! ( isSavingPost || isAutosavingPost ) && isPostSavingInProgress.current ) {
			setIsPostSaved( true );
			isPostSavingInProgress.current = false;
		}
	}, [ isSavingPost, isAutosavingPost ] );

	/**
	 * Handles the post saving action, which will save the post after the smart links have been validated.
	 * This is necessary because the validation process may change the post content, and those changes are not
	 * reflected in the post saving process.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		if ( isPostSaved && hasValidatedLinks.current && didAnyFixes ) {
			( async () => {
				await dispatch( editorStore ).savePost();
				hasValidatedLinks.current = false;
			} )();
		}
	}, [ didAnyFixes, isPostSaved ] );

	return isPostSaved;
};

/**
 * Handles the smart links saving process, which will save the smart links after the post has been saved.
 *
 * This hook is used to save the smart links after the post has been saved. It will save the smart links to
 * the database, using the SmartLinkingProvider, after the post has been saved.
 *
 * This hook will not save the smart links if the post is being autosaved.
 *
 * @since 3.16.0
 *
 * @param {boolean} validationCompleted Whether the validation process has been completed.
 */
export const useSaveSmartLinksOnPostSave = (
	validationCompleted: boolean,
): void => {
	const { isSavingPost, isAutosavingPost } = useSelect( ( selectFn ) => {
		const coreEditorSelect = selectFn( 'core/editor' ) as GutenbergFunction;
		return {
			isSavingPost: coreEditorSelect.isSavingPost(),
			isAutosavingPost: coreEditorSelect.isAutosavingPost(),
		};
	}, [] );

	const { postId } = useSelect( ( selectFn ) => {
		const { getCurrentPostId } = selectFn( 'core/editor' ) as GutenbergFunction;
		return {
			postId: getCurrentPostId(),
		};
	}, [] );

	const { getSmartLinks } = useSelect( ( selectFn ) => {
		return {
			getSmartLinks: selectFn( store ).getSmartLinks,
		};
	}, [] );

	useEffect( () => {
		if ( isSavingPost && ! isAutosavingPost && postId && validationCompleted ) {
			SmartLinkingProvider.getInstance().setSmartLinks( postId, getSmartLinks() ).catch( () => {
				// eslint-disable-next-line no-console
				console.error( 'WP Parse.ly: Failed to save smart links on post save.' );
			} );
		}
	}, [ getSmartLinks, isAutosavingPost, isSavingPost, postId, validationCompleted ] );
};
