/**
 * WordPress dependencies
 */
import { Button, ButtonGroup } from '@wordpress/components';
import { dispatch, useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { check, closeSmall, pin, undo } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../@types/gutenberg/types';
import { Telemetry } from '../../../js/telemetry/telemetry';
import { Title, TitleStore, TitleType } from './store';

/**
 * Defines the props structure for TitleSuggestion.
 *
 * @since 3.12.0
 */
interface TitleSuggestionProps {
	title: Title,
	type: TitleType,
	isOriginal?: boolean,
}

/**
 * Renders a single title suggestion.
 *
 * @since 3.12.0
 *
 * @param {TitleSuggestionProps} props The component's props.
 *
 * @return {JSX.Element} The title suggestion JSX Element.
 */
export const TitleSuggestion = (
	props: Readonly<TitleSuggestionProps>
): JSX.Element => {
	const {
		removeTitle,
		setAcceptedTitle,
		pinTitle,
		unpinTitle,
		setOriginalTitle,
	} = useDispatch( TitleStore );

	const isPinned = useSelect(
		( select ) => {
			return select( TitleStore ).isPinned( props.type, props.title );
		},
		[ props.title, props.type ] );

	const currentPostTitle = useSelect( ( select ) => {
		const { getEditedPostAttribute } = select( 'core/editor' ) as GutenbergFunction;
		return getEditedPostAttribute( 'title' );
	}, [] );

	// Flag if the current title has been accepted and applied to the post.
	const titleInUse = currentPostTitle === props.title.title;

	const onClickAccept = async () => {
		Telemetry.trackEvent( 'title_suggestion_applied', {
			title: props.title.title,
			type: props.type,
		} );
		await setAcceptedTitle( props.type, props.title );
	};

	const onClickPin = async () => {
		Telemetry.trackEvent( 'title_suggestion_pinned', {
			pinned: ! isPinned,
			type: props.type,
			title: props.title.title,
		} );
		if ( isPinned ) {
			await unpinTitle( props.type, props.title );
		} else {
			await pinTitle( props.type, props.title );
		}
	};

	const onClickRemove = async () => {
		Telemetry.trackEvent( 'title_suggestion_removed', {
			type: props.type,
			title: props.title.title,
		} );
		await removeTitle( props.type, props.title );
	};

	const onClickRestore = async () => {
		Telemetry.trackEvent( 'title_suggestion_restored', {
			type: props.type,
			restored_title: props.title.title,
			accepted_title: currentPostTitle,
		} );

		// Set current post title to the original title.
		dispatch( 'core/editor' ).editPost( { title: props.title.title } );

		// Unset the original title prop by setting it to undefined.
		await setOriginalTitle( props.type, undefined );
	};

	return (
		<>
			<div className={ `parsely-write-titles-title-suggestion	${ titleInUse && 'title-in-use' } ${ props.isOriginal && 'original-title' }` }>
				<div className="parsely-write-titles-suggested-title">{ props.title.title }</div>
				<div className="parsely-write-titles-suggested-title-actions">
					{ ( ! props.isOriginal ) ? (
						<ButtonGroup>
							<Button size="small"
								iconSize={ 15 }
								variant="primary"
								icon={ check }
								label={ __( 'Accept Title', 'wp-parsely' ) }
								onClick={ onClickAccept } />
							<Button size="small"
								iconSize={ 15 }
								className={ isPinned ? 'is-pinned' : '' }
								variant="secondary"
								icon={ pin }
								label={ __( 'Pin Title', 'wp-parsely' ) }
								onClick={ onClickPin }	/>
							{ ! isPinned &&
								<Button size="small"
									iconSize={ 15 }
									variant="secondary"
									icon={ closeSmall }
									label={ __( 'Remove Title', 'wp-parsely' ) }
									onClick={ onClickRemove }
								/>
							}
						</ButtonGroup>
					) : (
						<ButtonGroup>
							<Button size="small"
								iconSize={ 15 }
								variant="primary"
								icon={ undo }
								label={ __( 'Restore Title', 'wp-parsely' ) }
								onClick={ onClickRestore } />
						</ButtonGroup>
					) }
				</div>
			</div>
		</>
	);
};
