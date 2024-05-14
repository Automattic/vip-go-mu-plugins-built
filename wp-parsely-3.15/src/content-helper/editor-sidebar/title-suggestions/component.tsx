/**
 * WordPress dependencies
 */
import { Button, Notice, PanelRow } from '@wordpress/components';
import { dispatch, useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { external, Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../@types/gutenberg/types';
import { Telemetry } from '../../../js/telemetry/telemetry';
import { getPersonaLabel, PersonaProp } from '../../common/components/persona-selector';
import { getToneLabel, ToneProp } from '../../common/components/tone-selector';
import { ContentHelperError } from '../../common/content-helper-error';
import { SidebarSettings, useSettings } from '../../common/settings';
import { PinnedTitleSuggestions } from './component-pinned';
import { TitleSuggestionsSettings } from './component-settings';
import { TitleSuggestions } from './component-suggestions';
import { TitleSuggestion } from './component-title-suggestion';
import { TitleSuggestionsProvider } from './provider';
import { TitleStore, TitleType } from './store';
import './title-suggestions.scss';

/**
 * Title Suggestions Panel.
 *
 * @since 3.12.0
 *
 * @return {JSX.Element} The Title Suggestions Panel.
 */
export const TitleSuggestionsPanel = (): JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();

	const [ error, setError ] = useState<ContentHelperError>();
	const [ tone, setTone ] = useState<ToneProp>( settings.TitleSuggestions.Tone );
	const [ persona, setPersona ] = useState<PersonaProp>( settings.TitleSuggestions.Persona );

	const {
		loading,
		titles,
		pinnedTitles,
		allTitles,
		acceptedTitle,
		originalTitle,
	} = useSelect( ( select ) => {
		const { isLoading,
			getTitles,
			getAcceptedTitle,
			getOriginalTitle,
		} = select( TitleStore );

		// eslint-disable-next-line @typescript-eslint/no-shadow
		const allTitles = getTitles( TitleType.PostTitle );

		return {
			acceptedTitle: getAcceptedTitle( TitleType.PostTitle ),
			loading: isLoading(),
			titles: allTitles.filter( ( title ) => ! title.isPinned ),
			pinnedTitles: allTitles.filter( ( title ) => title.isPinned ),
			allTitles,
			originalTitle: getOriginalTitle( TitleType.PostTitle ),
		};
	}, [] );

	const {
		setTitles,
		setLoading,
		setAcceptedTitle,
		setOriginalTitle,
	} = useDispatch( TitleStore );

	const { createNotice } = useDispatch( 'core/notices' );

	const onSettingChange = ( key: keyof SidebarSettings[ 'TitleSuggestions' ], value: string | boolean ) => {
		setSettings( {
			TitleSuggestions: {
				...settings.TitleSuggestions,
				[ key ]: value,
			},
		} );
	};

	const currentPostContent = useSelect( ( select ) => {
		const { getEditedPostContent } = select( 'core/editor' ) as GutenbergFunction;
		return getEditedPostContent();
	}, [] );

	const currentPostTitle = useSelect( ( select ) => {
		const { getEditedPostAttribute } = select( 'core/editor' ) as GutenbergFunction;
		return getEditedPostAttribute( 'title' );
	}, [] );

	const generateTitles = async (
		titleType: TitleType,
		content: string,
		selectedTone: ToneProp,
		selectedPersona: PersonaProp,
	): Promise<void> => {
		await setLoading( true );

		const provider = TitleSuggestionsProvider.getInstance();

		try {
			const genTitles = await provider.generateTitles( content, 3, selectedTone, selectedPersona );
			await setTitles( titleType, genTitles );
		} catch ( err: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			setError( err );
			setTitles( titleType, [] );
		}

		await setLoading( false );
	};

	const generateOnClickHandler = async () => {
		setError( undefined );
		if ( false === loading ) {
			Telemetry.trackEvent( 'title_suggestions_generate_pressed', {
				request_more: titles.length > 0,
				total_titles: titles.length,
				total_pinned: titles.filter( ( title ) => title.isPinned ).length,
				tone,
				persona,
			} );

			// Generate titles based on the current post content.
			await generateTitles(
				TitleType.PostTitle,
				currentPostContent,
				tone,
				persona
			);
		}
	};

	/**
	 * Handles the accepted title changing, and applies the accepted title to
	 * the post.
	 *
	 * @since 3.14.0
	 */
	useEffect( () => {
		if ( ! acceptedTitle ) {
			return;
		}

		// Save the original title.
		setOriginalTitle( TitleType.PostTitle, currentPostTitle );

		// Set the post title to the accepted title.
		dispatch( 'core/editor' ).editPost( { title: acceptedTitle?.title } );

		// Pin the accepted title on the list of generated titles.
		if ( acceptedTitle ) {
			dispatch( TitleStore ).pinTitle( TitleType.PostTitle, acceptedTitle );
			Telemetry.trackEvent( 'title_suggestions_accept_pressed', {
				old_title: currentPostTitle,
				new_title: acceptedTitle.title,
			} );
		}

		// Remove the accepted title.
		setAcceptedTitle( TitleType.PostTitle, undefined );

		// Show snackbar notification.
		createNotice(
			'success',
			__( 'Title suggestion applied.', 'wp-parsely' ),
			{
				type: 'snackbar',
				className: 'parsely-title-suggestion-applied',
				explicitDismiss: true,
				actions: [
					{
						label: __( 'Undo', 'wp-parsely' ),
						onClick: () => {
							// Restore the original title.
							dispatch( 'core/editor' ).editPost( { title: currentPostTitle } );
							setOriginalTitle( TitleType.PostTitle, undefined );
						},
					},
				],
			}
		);
	}, [ acceptedTitle ] ); // eslint-disable-line react-hooks/exhaustive-deps

	/**
	 * Displays a snackbar notification when an error occurs.
	 *
	 * @since 3.14.0
	 */
	useEffect( () => {
		if ( undefined === error ) {
			return;
		}

		createNotice(
			'error',
			__( 'There was an error generating title suggestions.', 'wp-parsely' ),
			{
				type: 'snackbar',
				className: 'parsely-title-suggestion-error',
			}
		);
	}, [ error ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<PanelRow>
			<div className="wp-parsely-title-suggestions-wrapper">
				<div className="title-suggestions-header">
					{ allTitles.length > 0 ? (
						<span className="parsely-write-titles-text">
							{
								createInterpolateElement(
									// translators: %1$s is the tone, %2$s is the persona.
									__(
										"We've generated a few <tone/> titles based on the content of your post, written as a <persona/>.",
										'wp-parsely'
									),
									{
										tone: <strong>{ getToneLabel( tone ) }</strong>,
										persona: <strong>{ getPersonaLabel( persona ) }</strong>,
									}
								)
							}
						</span>
					) : (
						__(
							'Use Parse.ly AI to generate a title for your post.',
							'wp-parsely'
						)
					) }
					<Button
						href="https://docs.parse.ly/plugin-content-helper/#h-title-suggestions-beta"
						target="_blank"
						variant="link"
					>
						{ __( 'Learn more about Parse.ly AI', 'wp-parsely' ) }
						<Icon
							icon={ external }
							size={ 18 }
							className="parsely-external-link-icon"
						/>
					</Button>
				</div>
				{ error && (
					<Notice status="info" className="wp-parsely-content-helper-error">
						{ error.Message() }
					</Notice>
				) }
				{ ( originalTitle !== undefined ) && (
					<TitleSuggestion
						title={ originalTitle }
						type={ TitleType.PostTitle }
						isOriginal={ true } />
				) }
				{ 0 < allTitles.length && (
					<>
						{ pinnedTitles.length > 0 && (
							<PinnedTitleSuggestions
								pinnedTitles={ pinnedTitles }
								isOpen={ true }
							/>
						) }
						{ titles.length > 0 && (
							<TitleSuggestions
								suggestions={ titles }
								isOpen={ true }
								isLoading={ loading }
							/>
						) }
					</>
				) }
				<TitleSuggestionsSettings
					isLoading={ loading }
					onPersonaChange={ ( selectedPersona ) => {
						onSettingChange( 'Persona', selectedPersona );
						setPersona( selectedPersona );
					} }
					onSettingChange={ onSettingChange }
					onToneChange={ ( selectedTone ) => {
						onSettingChange( 'Tone', selectedTone );
						setTone( selectedTone );
					} }
					persona={ settings.TitleSuggestions.Persona }
					tone={ settings.TitleSuggestions.Tone }
				/>
				<div className="title-suggestions-generate">
					<Button
						variant="primary"
						isBusy={ loading }
						disabled={ loading || tone === 'custom' || persona === 'custom' }
						onClick={ generateOnClickHandler }
					>
						{ loading && __( 'Generating Titles…', 'wp-parsely' ) }
						{ ! loading && allTitles.length > 0 && __( 'Generate More', 'wp-parsely' ) }
						{ ! loading && allTitles.length === 0 && __( 'Generate Titles', 'wp-parsely' ) }
					</Button>
				</div>
			</div>
		</PanelRow>
	);
};

