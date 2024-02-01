/**
 * WordPress dependencies
 */
import { Button, PanelRow } from '@wordpress/components';
import { dispatch, useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../@types/gutenberg/types';
import { Telemetry } from '../../../js/telemetry/telemetry';
import { PersonaProp, getPersonaLabel } from '../../common/components/persona-selector';
import { ToneProp, getToneLabel } from '../../common/components/tone-selector';
import { ContentHelperError } from '../../common/content-helper-error';
import { SidebarSettings } from '../editor-sidebar';
import { TitleSuggestionsSettings } from './component-settings';
import { TitleSuggestion } from './component-title-suggestion';
import { WriteTitleProvider } from './provider';
import { TitleStore, TitleType } from './store';

/**
 * Defines the props structure for TitleSuggestionsPanel.
 *
 * @since 3.13.0
 */
interface TitleSuggestionsPanelProps {
	initialPersona: PersonaProp;
	initialSettingsOpen: boolean;
	initialTone: ToneProp;
	onSettingChange: ( key: keyof SidebarSettings, value: string | boolean ) => void;
}

/**
 * Title Suggestions Panel.
 *
 * @since 3.12.0
 *
 * @param {TitleSuggestionsPanelProps} props The component's props.
 *
 * @return {JSX.Element} The Title Suggestions Panel.
 */
export const TitleSuggestionsPanel = ( {
	initialPersona, initialSettingsOpen, initialTone, onSettingChange,
}: TitleSuggestionsPanelProps ): JSX.Element => {
	const [ error, setError ] = useState<ContentHelperError>();
	const [ tone, setTone ] = useState<ToneProp>( initialTone );
	const [ persona, setPersona ] = useState<PersonaProp>( initialPersona );

	const {
		loading,
		titles,
		acceptedTitle,
		originalTitle,
	} = useSelect( ( select ) => {
		const { isLoading,
			getTitles,
			getAcceptedTitle,
			getOriginalTitle,
		} = select( TitleStore );

		return {
			acceptedTitle: getAcceptedTitle( TitleType.PostTitle ),
			loading: isLoading(),
			titles: getTitles( TitleType.PostTitle ),
			originalTitle: getOriginalTitle( TitleType.PostTitle ),
		};
	}, [] );

	const {
		setTitles,
		setLoading,
		setAcceptedTitle,
		setOriginalTitle,
	} = useDispatch( TitleStore );

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

		const provider = new WriteTitleProvider();

		try {
			const genTitles = await provider.generateTitles( content, 3, selectedTone, selectedPersona );
			await setTitles( titleType, genTitles );
		} catch ( err: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			setError( err );
		}

		await setLoading( false );
	};

	const generateOnClickHandler = async () => {
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

	const saveTitleOnClickHandler = async () => {
		// Save the original title.
		await setOriginalTitle( TitleType.PostTitle, currentPostTitle );

		// Set the post title to the accepted title.
		dispatch( 'core/editor' ).editPost( { title: acceptedTitle?.title } );

		// Pin the accepted title on the list of generated titles.
		if ( acceptedTitle ) {
			await dispatch( TitleStore ).pinTitle( TitleType.PostTitle, acceptedTitle );
			Telemetry.trackEvent( 'title_suggestions_accept_pressed', {
				old_title: currentPostTitle,
				new_title: acceptedTitle.title,
			} );
		}

		// Remove the accepted title
		await setAcceptedTitle( TitleType.PostTitle, undefined );
	};

	const parselyAISettings = <TitleSuggestionsSettings
		isLoading={ loading }
		isOpen={ initialSettingsOpen }
		onPersonaChange={ ( selectedPersona ) => {
			onSettingChange( 'TitleSuggestionsPersona', selectedPersona );
			setPersona( selectedPersona );
		} }
		onSettingChange={ onSettingChange }
		onToneChange={ ( selectedTone ) => {
			onSettingChange( 'TitleSuggestionsTone', selectedTone );
			setTone( selectedTone );
		} }
		persona={ initialPersona }
		tone={ initialTone }
	/>;

	const generateTitleButton: JSX.Element = (
		<div className="parsely-write-titles-generate-button">
			<Button
				variant={ titles.length > 0 ? 'secondary' : 'primary' }
				isBusy={ loading }
				onClick={ generateOnClickHandler }
			>
				{ loading && __( 'Generating Titles…', 'wp-parsely' ) }
				{ ! loading && titles.length > 0 && __( 'Generate More', 'wp-parsely' ) }
				{ ! loading && titles.length === 0 && __( 'Generate Titles', 'wp-parsely' ) }
			</Button>
		</div>
	);

	const titleSuggestionList: JSX.Element = (
		<div className="parsely-write-titles-title-suggestions-container">
			{ ( originalTitle !== undefined ) && (
				<TitleSuggestion title={ originalTitle } type={ TitleType.PostTitle } isOriginal={ true } />
			) }

			{ titles.map( ( title ) => (
				<TitleSuggestion
					key={ title.id }
					title={ title }
					type={ TitleType.PostTitle } // Specify that the title is a post title.
				/>
			) ) }
		</div>
	);

	const acceptedTitleElement: JSX.Element = (
		<div className="parsely-write-titles-accepted-title-container">
			<div className="parsely-write-titles-text">
				{ __(
					'Replace the current post title with the following?',
					'wp-parsely'
				) }
			</div>
			<div className="parsely-write-titles-accepted-title">{ acceptedTitle?.title }</div>
			<div className="parsely-write-titles-accepted-title-actions">
				<Button
					variant="secondary"
					onClick={ () => {
						setAcceptedTitle( TitleType.PostTitle, undefined );
						Telemetry.trackEvent( 'title_suggestions_cancel_pressed', {
							original_title: currentPostTitle,
							canceled_title: acceptedTitle?.title ?? '',
						} );
					} }
				>
					{ __( 'Cancel', 'wp-parsely' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ saveTitleOnClickHandler }
				>
					{ __( 'Replace', 'wp-parsely' ) }
				</Button>
			</div>
		</div>
	);

	if ( error ) {
		return ( error.Message() );
	}

	return (
		<PanelRow>
			<div className="parsely-write-titles-wrapper">
				{ 0 === titles.length && acceptedTitle === undefined && (
					<>
						<div className="parsely-write-titles-text">
							{ __(
								'Use Parse.ly AI to generate a title for your post.',
								'wp-parsely'
							) }
						</div>
						{ parselyAISettings }
						{ generateTitleButton }
					</>
				) }
				{ 0 < titles.length && acceptedTitle === undefined && (
					<>
						<div className="parsely-write-titles-text">
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
						</div>
						{ titleSuggestionList }
						{ parselyAISettings }
						{ generateTitleButton }
					</>
				) }
				{ acceptedTitle !== undefined && ( acceptedTitleElement ) }
			</div>
		</PanelRow>
	);
};

