/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalHeading as Heading,
	Modal,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	check,
	pin,
	reset,
	trash,
	undo,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { dispatchCoreEditor, GutenbergFunction } from '../../../@types/gutenberg/types';
import { Telemetry } from '../../../js/telemetry/telemetry';
import { VerticalDivider } from '../../common/components/vertical-divider/component';
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
 * @return {import('react').JSX.Element} The title suggestion JSX Element.
 */
export const TitleSuggestion = (
	props: Readonly<TitleSuggestionProps>
): React.JSX.Element => {
	const [ isModalOpen, setIsModalOpen ] = useState<boolean>( false );
	const openModal = () => setIsModalOpen( true );
	const closeModal = () => setIsModalOpen( false );

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

	/**
	 * Handles the click event for the Apply button.
	 *
	 * @since 3.14.0
	 */
	const onClickApply = () => {
		if ( titleInUse ) {
			return;
		}

		openModal();
	};

	/**
	 * Handles the click event for the Replace button.
	 *
	 * @since 3.14.0
	 */
	const onClickReplace = async () => {
		if ( titleInUse ) {
			return;
		}

		Telemetry.trackEvent( 'title_suggestion_applied', {
			title: props.title.title,
			type: props.type,
		} );
		await setAcceptedTitle( props.type, props.title );

		closeModal();
	};

	/**
	 * Handles the click event for the Pin button.
	 *
	 * @since 3.14.0
	 */
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

	/**
	 * Handles the click event for the Remove button.
	 *
	 * @since 3.14.0
	 */
	const onClickRemove = async () => {
		Telemetry.trackEvent( 'title_suggestion_removed', {
			type: props.type,
			title: props.title.title,
		} );
		await removeTitle( props.type, props.title );
	};

	/**
	 * Handles the click event for the Restore button.
	 *
	 * @since 3.14.0
	 */
	const onClickRestore = async () => {
		Telemetry.trackEvent( 'title_suggestion_restored', {
			type: props.type,
			restored_title: props.title.title,
			accepted_title: currentPostTitle,
		} );

		// Set current post title to the original title.
		dispatchCoreEditor.editPost( { title: props.title.title } );

		// Unset the original title prop by setting it to undefined.
		await setOriginalTitle( props.type, undefined );
	};

	return (
		<>
			<div
				className={
					'wp-parsely-title-suggestion' +
					( titleInUse ? ' title-in-use' : '' ) +
					( props.isOriginal ? ' original-title' : '' ) +
					( isPinned ? ' pinned-title' : '' )
				}
			>
				<div className="suggested-title">
					{ props.isOriginal && (
						<Heading className="suggested-title-original" level={ 3 }>
							{ __( 'Original', 'wp-parsely' ) }
						</Heading>
					) }
					{ props.title.title }
				</div>
				<div className="suggested-title-actions">
					<div className="suggested-title-actions-container">
						{ props.isOriginal && (
							<Button onClick={ onClickRestore } icon={ undo } label={ __( 'Restore', 'wp-parsely' ) } />
						) }
						{ ! props.isOriginal && (
							<>
								<div className="suggested-title-actions-left">
									<Button
										onClick={ onClickApply }
										disabled={ titleInUse }
										icon={ check }
										label={ titleInUse ? __( 'Applied', 'wp-parsely' ) : __( 'Apply', 'wp-parsely' ) }
									/>
									{ ! isPinned && (
										<Button
											onClick={ onClickRemove }
											icon={ trash }
											label={ __( 'Remove', 'wp-parsely' ) }
										/>
									) }
								</div>
								<VerticalDivider />
								<div className="suggested-title-actions-right">
									{ isPinned ? (
										<Button onClick={ onClickPin } icon={ reset } label={ __( 'Unpin', 'wp-parsely' ) } />
									) : (
										<Button onClick={ onClickPin } icon={ pin } label={ __( 'Pin', 'wp-parsely' ) } />
									) }
								</div>
							</>
						) }
					</div>
				</div>
			</div>
			{ isModalOpen && (
				<Modal title={ __( 'Replace Title?', 'wp-parsely' ) } onRequestClose={ closeModal }>
					<div className="wp-parsely-suggested-title-modal">
						<h2>{ props.title.title }</h2>
						{ __(
							"You'll still be able to restore your original title until you exit the editor.",
							'wp-parsely',
						) }
						<div className="suggested-title-modal-actions">
							<Button onClick={ closeModal } variant="secondary">
								{ __( 'Cancel', 'wp-parsely' ) }
							</Button>
							<Button onClick={ onClickReplace } variant="primary">
								{ __( 'Replace', 'wp-parsely' ) }
							</Button>
						</div>
					</div>
				</Modal>
			) }
		</>
	);
};
