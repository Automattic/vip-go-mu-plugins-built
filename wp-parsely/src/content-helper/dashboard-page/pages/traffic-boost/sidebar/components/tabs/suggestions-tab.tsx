/**
 * WordPress dependencies
 */
import { Button, Icon, PanelBody, PanelRow, Spinner } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, _n, sprintf } from '@wordpress/i18n';
import { error, reusableBlock } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { Loading as LoadingComponent } from '../../../../../../common/components/loading';
import { ContentHelperError, ContentHelperErrorCode } from '../../../../../../common/content-helper-error';
import { HydratedPost } from '../../../../../../common/providers/base-wordpress-provider';
import { TRAFFIC_BOOST_LOADING_MESSAGES, TrafficBoostLink, TrafficBoostProvider } from '../../../provider';
import { TrafficBoostStore } from '../../../store';
import { AddNewLinkButton } from '../add-new-link-button';
import { LinksList } from '../links-list/links-list';

/**
 * Component that renders the suggestions settings.
 *
 * Note: Not in use yet.
 *
 * @since 3.19.0
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SuggestionsSettings = (): React.JSX.Element => {
	return (
		<div className="traffic-boost-suggestions-settings">
			<PanelBody
				title={ __( 'Filters', 'wp-parsely' ) }
				initialOpen={ false }
			>
				<PanelRow>
					<div>
						<div>
							<p>{ __( 'Adjust parameters used to generate suggestions.', 'wp-parsely' ) }</p>
						</div>
					</div>
				</PanelRow>
			</PanelBody>
			<PanelBody
				title={ __( 'Advanced Settings', 'wp-parsely' ) }
				initialOpen={ false }
			>
				<PanelRow>
					<div>
						<div>
							{ __( 'Scope suggestions based on content attributes or Parse.ly smart tags.', 'wp-parsely' ) }
						</div>
					</div>
				</PanelRow>
			</PanelBody>
		</div>
	);
};

/**
 * Defines the props structure for GenerateButton.
 *
 * @since 3.19.0
 */
interface GenerateButtonProps {
	variant: 'primary' | 'secondary' | 'tertiary';
	isGeneratingSuggestions: boolean;
	handleGenerateSuggestions: () => void;
}

/**
 * Component that renders the generate button.
 *
 * @since 3.19.0
 *
 * @param {GenerateButtonProps} props The component's props.
 */
const GenerateButton = ( {
	variant,
	isGeneratingSuggestions,
	handleGenerateSuggestions,
}: GenerateButtonProps ): React.JSX.Element => (
	<Button
		icon={ reusableBlock }
		variant={ variant }
		isBusy={ isGeneratingSuggestions }
		disabled={ isGeneratingSuggestions }
		className="traffic-boost-add-suggestion"
		onClick={ handleGenerateSuggestions }
	>
		{ isGeneratingSuggestions ? __( 'Generating…', 'wp-parsely' ) : __( 'Generate', 'wp-parsely' ) }
	</Button>
);

/**
 * Defines the props structure for SuggestionsTab.
 *
 * @since 3.19.0
 */
interface SuggestionsTabProps {
	onSuggestionClick?: ( suggestion: TrafficBoostLink ) => void;
}

/**
 * Component that renders the suggestions tab.
 *
 * @since 3.19.0
 *
 * @param {SuggestionsTabProps} props The component's props.
 */
const SuggestionsTab = ( {
	onSuggestionClick,
}: SuggestionsTabProps ): React.JSX.Element => {
	const trafficBoostProvider = TrafficBoostProvider.getInstance();

	const {
		currentPost,
		selectedLink,
		suggestions,
		inboundLinks,
		settings,
		isGeneratingSuggestions,
		isLoadingSuggestions,
		suggestionsToGenerate,
	} = useSelect( ( select ) => ( {
		currentPost: select( TrafficBoostStore ).getCurrentPost(),
		selectedLink: select( TrafficBoostStore ).getSelectedLink(),
		suggestions: select( TrafficBoostStore ).getSuggestions(),
		inboundLinks: select( TrafficBoostStore ).getInboundLinks(),
		isGeneratingSuggestions: select( TrafficBoostStore ).isGeneratingSuggestions(),
		isLoadingSuggestions: select( TrafficBoostStore ).isLoadingSuggestions(),
		settings: select( TrafficBoostStore ).getSettings(),
		suggestionsToGenerate: select( TrafficBoostStore ).getSuggestionsToGenerate(),
	} ), [] );

	const {
		setSelectedLink,
		addSuggestion,
		setSuggestions,
		updateSuggestion,
		setIsGeneratingSuggestions,
		setIsGenerating,
		removeSuggestion,
		setSuggestionsToGenerate,
	} = useDispatch( TrafficBoostStore );

	const { createSuccessNotice, createErrorNotice } = useDispatch( 'core/notices' );

	/**
	 * Adds a Traffic Boost link suggestion to the current post.
	 *
	 * @since 3.19.0
	 *
	 * @param {HydratedPost} post The post that will be added to the suggestion list.
	 */
	const addTrafficBoostLink = async ( post: HydratedPost ) => {
		if ( ! currentPost ) {
			return;
		}

		const previousSelectedLink = selectedLink;

		const trafficBoostLink = trafficBoostProvider.createSuggestion( post );
		await addSuggestion( trafficBoostLink );
		await setIsGenerating( trafficBoostLink, true );

		try {
			const updatedLink = await trafficBoostProvider.generateSuggestionForPost(
				currentPost,
				post,
				trafficBoostLink
			);

			await updateSuggestion( updatedLink, trafficBoostLink.uid );
			setIsGenerating( trafficBoostLink, false );
		} catch ( err: unknown ) {
			let errorMessage = __( 'Failed to find a link placement.', 'wp-parsely' );
			if ( err instanceof ContentHelperError && err.message && err.code !== ContentHelperErrorCode.UnknownError ) {
				errorMessage += ` ${ err.message }`;
			}

			// Create an error snackbar.
			createErrorNotice( errorMessage, {
				type: 'snackbar',
				icon: <Icon icon={ error } />,
			} );

			setIsGenerating( trafficBoostLink, false );
			removeSuggestion( trafficBoostLink );
			setSelectedLink( previousSelectedLink );
		}
	};

	/**
	 * Handles the generation of suggestions.
	 *
	 * @since 3.19.0
	 */
	const handleGenerateSuggestions = async () => {
		if ( ! currentPost ) {
			return;
		}

		try {
			setIsGeneratingSuggestions( true );

			// Get the existing inbound links permalinks.
			const existingInboundLinksPermalinks = inboundLinks.map(
				( inboundLink ) => [
					inboundLink.smartLink?.post_data?.parsely_canonical_url,
					inboundLink.smartLink?.post_data?.permalink,
				]
			).flat().filter( ( url ) => url !== undefined );

			// Clear the suggestions list.
			setSuggestions( [] );
			setSuggestionsToGenerate( settings.maxItems );

			// Generate the suggestions in batches.
			await trafficBoostProvider.generateBatchSuggestions(
				currentPost.id,
				settings.maxItems,
				{
					urlExclusionList: existingInboundLinksPermalinks,
					discardPrevious: true,
					save: true,
					onNewSuggestions: ( newSuggestions, isFirstIteration ) => {
						// Update the suggestions list.
						setSuggestions( newSuggestions, false );

						if ( isFirstIteration ) {
							// Change the active link to the first suggestion.
							setSelectedLink( newSuggestions[ 0 ] );
						}

						// Update the remaining suggestions count
						setSuggestionsToGenerate( ( previousCount ) => Math.max( 0, previousCount - newSuggestions.length ) );
					},
				}
			);

			// Show a snackbar success message.
			createSuccessNotice(
				__( 'Finished generating suggestions.', 'wp-parsely' ),
				{
					type: 'snackbar',
					icon: <Icon icon={ reusableBlock } />,
				}
			);

			setIsGeneratingSuggestions( false );
		} catch ( err ) {
			let errorMessage = __( 'Failed to generate suggestions.', 'wp-parsely' );
			if ( err instanceof ContentHelperError && err.message && err.code !== ContentHelperErrorCode.UnknownError ) {
				errorMessage += ` ${ err.message }`;
			}

			// Create an error snackbar.
			createErrorNotice( errorMessage, {
				type: 'snackbar',
				icon: <Icon icon={ error } />,
			} );

			setIsGeneratingSuggestions( false );
		}
	};

	if ( isLoadingSuggestions && isGeneratingSuggestions ) {
		return (
			<div className="traffic-boost-suggestions-loading-generating">
				<LoadingComponent
					messages={ TRAFFIC_BOOST_LOADING_MESSAGES }
					typewriter={ true }
					randomOrder={ false }
				/>
			</div>
		);
	}

	return (
		<>
			<LinksList
				isLoading={ isLoadingSuggestions }
				links={ suggestions }
				useScrollbar={ true }
				onClick={ onSuggestionClick }
				activeLink={ selectedLink?.isSuggestion ? selectedLink : null }
				renderEmptyState={ () => {
					if ( isGeneratingSuggestions ) {
						return (
							<div className="traffic-boost-suggestions-loading-generating">
								<LoadingComponent
									messages={ TRAFFIC_BOOST_LOADING_MESSAGES }
									typewriter={ true }
									randomOrder={ false }
								/>
							</div>
						);
					}

					return (
						<div className="traffic-boost-suggestions-empty-state">
							<p>{ __( 'This post has no suggestions. Do you want to generate some?', 'wp-parsely' ) }</p>
							<GenerateButton
								variant="primary"
								isGeneratingSuggestions={ isGeneratingSuggestions }
								handleGenerateSuggestions={ handleGenerateSuggestions }
							/>
						</div>
					);
				} }
			>
				{ ! isLoadingSuggestions && ! isGeneratingSuggestions && (
					<AddNewLinkButton
						disabled={ isGeneratingSuggestions }
						suggestions={ suggestions }
						onPostClick={ addTrafficBoostLink }
					/>
				) }
				{ isGeneratingSuggestions && suggestions.length > 0 && (
					<div className="traffic-boost-suggestions-generating-footer">
						<Spinner />
						<span>
							{ sprintf(
								/* translators: %d: number of suggestions generated */
								_n( 'Generating %d last suggestion…', 'Generating %d more suggestions…', suggestionsToGenerate, 'wp-parsely' ),
								suggestionsToGenerate
							) }
						</span>
					</div>
				) }
			</LinksList>
		</>
	);
};

export default SuggestionsTab;
