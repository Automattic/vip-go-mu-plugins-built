/**
 * WordPress dependencies
 */
import {
	Button,
	ExternalLink,
	Notice,
	Spinner,
	TextareaControl,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { PostTypeSupportCheck, store as editorStore } from '@wordpress/editor';
import { useEffect, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { count } from '@wordpress/wordcount';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../@types/gutenberg/types';
import { Telemetry } from '../../../js/telemetry/telemetry';
import { BetaBadge } from '../../common/components/beta-badge';
import { ContentHelperError } from '../../common/content-helper-error';
import { LeafIcon } from '../../common/icons/leaf-icon';
import { ExcerptGeneratorProvider } from '../provider';

/**
 * The PostExcerptGenerator component displays the excerpt textarea and the Parse.ly AI controls.
 *
 * @since 3.13.0
 */
const PostExcerptGenerator = () => {
	const [ isLoading, setLoading ] = useState<boolean>( false );
	const [ generatedExcerpt, setGeneratedExcerpt ] = useState<string>( '' );
	const [ error, setError ] = useState<ContentHelperError>();

	const { editPost } = useDispatch( editorStore );
	const excerptGeneratorProvider = new ExcerptGeneratorProvider();

	// Get the current excerpt, post content, and post title.
	const { excerpt, postContent, postTitle } = useSelect( ( select ) => {
		const { getEditedPostAttribute, getEditedPostContent } = select( editorStore ) as GutenbergFunction;

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

	const hasGeneratedExcerpt = generatedExcerpt.length > 0;
	const wordCount = count( generatedExcerpt || excerpt, 'words', {} );
	const wordCountString = sprintf(
		// Translators: %1$s the number of words in the excerpt.
		_n( '%1$s word', '%1$s words', wordCount, 'wp-parsely' ),
		wordCount
	);

	// Scroll the textarea to the top when the generated excerpt changes.
	useEffect( () => {
		const textarea = document.querySelector( '.editor-post-excerpt textarea' );
		if ( textarea ) {
			textarea.scrollTop = 0;
		}
	}, [ generatedExcerpt ] );

	/**
	 * Generates an excerpt using the Parse.ly AI.
	 *
	 * @since 3.13.0
	 */
	const generateExcerpt = async () => {
		setLoading( true );
		setError( undefined );

		try {
			Telemetry.trackEvent( 'excerpt_generator_pressed' );
			const requestedExcerpt = await excerptGeneratorProvider.generateExcerpt( postTitle, postContent );
			setGeneratedExcerpt( requestedExcerpt );
		} catch ( err: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			setError( err );
		} finally {
			setLoading( false );
		}
	};

	/**
	 * Accepts the generated excerpt and updates the post.
	 *
	 * @since 3.13.0
	 */
	const acceptGeneratedExcerpt = async () => {
		await editPost( { excerpt: generatedExcerpt } );
		setGeneratedExcerpt( '' );
		Telemetry.trackEvent( 'excerpt_generator_accepted' );
	};

	/**
	 * Discards the generated excerpt.
	 *
	 * @since 3.13.0
	 */
	const discardGeneratedExcerpt = async () => {
		setGeneratedExcerpt( '' );
		Telemetry.trackEvent( 'excerpt_generator_discarded' );
	};

	/**
	 * Returns the value for the excerpt textarea.
	 *
	 * @since 3.13.0
	 */
	const getExcerptTextareaValue = (): string => {
		if ( hasGeneratedExcerpt ) {
			return generatedExcerpt;
		}

		return excerpt;
	};

	return (
		<div className="editor-post-excerpt" >
			<div style={ { position: 'relative' } }>
				{ isLoading && (
					<div className={ 'editor-post-excerpt__spinner' + ( wordCount > 0 ? ' has-word-count' : '' ) }>
						<Spinner />
					</div>
				) }
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Write an excerpt (optional)', 'wp-parsely' ) }
					className="editor-post-excerpt__textarea"
					onChange={ ( value ) => editPost( { excerpt: value } ) }
					disabled={ isLoading || hasGeneratedExcerpt }
					value={ getExcerptTextareaValue() }
					help={ wordCount ? wordCountString : null }
				/>
			</div>
			<ExternalLink
				href={ __(
					'https://wordpress.org/documentation/article/page-post-settings-sidebar/#excerpt',
					'wp-parsely',
				) }
			>
				{ __( 'Learn more about manual excerpts', 'wp-parsely' ) }
			</ExternalLink>

			<div className="wp-parsely-excerpt-generator">
				<div className="wp-parsely-excerpt-generator-header">
					<LeafIcon size={ 20 } />
					<div className="wp-parsely-excerpt-generator-header-label">
						{ __( 'Parse.ly AI', 'wp-parsely' ) }
					</div>
					<BetaBadge />
				</div>
				{ error && (
					<Notice
						status="info"
						isDismissible={ false }
						className="wp-parsely-excerpt-generator-error"
					>
						{ error.Message() }
					</Notice>
				) }
				<div className="wp-parsely-excerpt-generator-controls">
					{ hasGeneratedExcerpt ? (
						<>
							<Button
								variant="secondary"
								onClick={ acceptGeneratedExcerpt }
							>
								{ __( 'Accept', 'wp-parsely' ) }
							</Button>
							<Button
								isDestructive={ true }
								variant="secondary"
								onClick={ discardGeneratedExcerpt }
							>
								{ __( 'Discard', 'wp-parsely' ) }
							</Button>
						</>
					) : (
						<Button
							onClick={ generateExcerpt }
							variant="primary"
							isBusy={ isLoading }
							disabled={ isLoading }
						>
							{ isLoading ? __( 'Generating…', 'wp-parsely' )
								: __( 'Generate Excerpt', 'wp-parsely' ) }
						</Button>
					) }
				</div>
			</div>
		</div>
	);
};

/**
 * The ExcerptPanel component verifies that the current post type supports excerpts,
 * and then renders the PostExcerptGenerator component.
 *
 * @since 3.13.0
 */
export const ExcerptPanel = () => {
	return (
		<PostTypeSupportCheck supportKeys="excerpt">
			<PluginDocumentSettingPanel
				name="parsely-post-excerpt"
				title="Excerpt"
			>
				<PostExcerptGenerator />
			</PluginDocumentSettingPanel>
		</PostTypeSupportCheck>
	);
};
