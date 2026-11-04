/**
 * WordPress dependencies
 */
import { Button, Dropdown, SearchControl } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { HydratedPost } from '../../../../../common/providers/base-wordpress-provider';
import { PostsTable } from '../../../../components/posts-table/component';
import { TrafficBoostLink } from '../../provider';
import { TrafficBoostStore } from '../../store';

/**
 * Props for the AddNewLinkButton component.
 *
 * @since 3.19.0
 */
interface AddNewLinkButtonProps {
	onPostClick: ( post: HydratedPost ) => void;
	suggestions: TrafficBoostLink[];
	disabled: boolean;
}

/**
 * A button that opens a dropdown to allow the user to add a new link to the suggestions list.
 *
 * @since 3.19.0
 *
 * @param {AddNewLinkButtonProps} props The component's props.
 */
export const AddNewLinkButton = ( {
	disabled,
	onPostClick,
	suggestions,
}: AddNewLinkButtonProps ): React.JSX.Element => {
	const [ searchInput, setSearchInput ] = useState<string>( '' );
	const searchInputRef = useRef<HTMLInputElement>( null );
	const debouncedSetSearchInput = useDebounce( setSearchInput, 300 );
	const [ suggestionsPostIds, setSuggestionsPostIds ] = useState<number[]>( [] );

	const currentPost = useSelect( ( select ) => select( TrafficBoostStore ).getCurrentPost(), [] );

	/**
	 * Sets the post IDs of the suggestions so they can be excluded from the search.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		let postIds = [ currentPost?.id ?? 0 ];

		if ( suggestions.length > 0 ) {
			postIds = [ ...postIds, ...suggestions.map( ( suggestion ) => suggestion.targetPost.id ) ];
		}

		setSuggestionsPostIds( postIds );
	}, [ suggestions, currentPost ] );

	return (
		<Dropdown
			contentClassName="wp-parsely-traffic-boost-add-new-link-popover"
			onClose={ () => {
				setSearchInput( '' );
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					icon={ plus }
					variant="secondary"
					className="traffic-boost-add-suggestion"
					onClick={ onToggle }
					isPressed={ isOpen }
					disabled={ disabled }
				>
					{ __( 'Add Source Post', 'wp-parsely' ) }
				</Button>
			) }
			popoverProps={ { placement: 'bottom-start' } }
			renderContent={ ( { onClose } ) => (
				<>
					<div>
						{ __( 'Manually add a post where you would like Parse.ly to plant a link.', 'wp-parsely' ) }
					</div>
					<div>
						<SearchControl
							__nextHasNoMarginBottom
							ref={ searchInputRef }
							value={ searchInput }
							onChange={ debouncedSetSearchInput }
						/>
					</div>
					{ searchInput && (
						<PostsTable
							currentPage={ 1 }
							setCurrentPage={ () => {} }
							className="traffic-boost-add-link-table"
							query={ {
								status: 'publish',
								per_page: 5,
								search: searchInput,
								search_columns: [ 'post_title', 'post_excerpt' ],
								exclude: suggestionsPostIds,
								context: 'edit',
							} }
							hideHeader={ true }
							hidePagination={ true }
							compact={ true }
							noResultsMessage={ __( 'No posts found.', 'wp-parsely' ) }
							onPostClick={ ( post ) => {
								onPostClick( post );
								onClose();
							} }
						/>
					) }
				</>
			) }
		/>
	);
};
