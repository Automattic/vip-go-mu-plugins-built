/**
 * WordPress dependencies
 */
import {
	ComboboxControl,
	FormTokenField,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '@wordpress/i18n';
import { PostFilters, PostFilterType } from '../../common/utils/constants';
import { SidebarPostData, SidebarPostDataCategory } from '../editor-sidebar';

/**
 * Defines the props structure for FilterControls.
 *
 * @since 3.14.0
 */
type FilterControlsProps = {
	filters: PostFilters;
	label?: string;
	onFiltersChange: ( selection: string | null | undefined, type:PostFilterType ) => void;
	postData: SidebarPostData;
}

/**
 * Returns the filter settings component.
 *
 * @since 3.14.0
 *
 * @param {FilterControlsProps} props The component's props.
 */
export const RelatedPostsFilterSettings = ( {
	filters,
	postData,
	...props
}: Readonly<FilterControlsProps> ): React.JSX.Element | null => {
	if ( 0 === postData.authors.length &&
			0 === postData.categories.length &&
			0 === postData.tags.length
	) {
		return null;
	}

	const authorOptions = postData.authors.map( ( author: string ) => ( {
		value: author, label: author,
	} ) );

	let categoryOptions: { value: string, label: string }[] = [];

	if ( true !== window.wpParselyUseCategorySlugsInSearches ) {
		// Default behavior: Use section names to search.
		categoryOptions = postData.categories.map( ( category: SidebarPostDataCategory ) => ( {
			value: category.name, label: category.name,
		} ) );
	} else {
		// Overridden behavior: Use section slugs to search.
		categoryOptions = postData.categories.map( ( category: SidebarPostDataCategory ) => ( {
			value: category.slug, label: category.name,
		} ) );
	}

	return (
		<div className="related-posts-filter-settings">
			{ postData.authors.length >= 1 && (
				<ComboboxControl
					__next40pxDefaultSize
					allowReset={ true }
					placeholder={ __( 'Author', 'wp-parsely' ) }
					onChange={ ( selection ) => props.onFiltersChange(
						selection, PostFilterType.Author
					) }
					options={ authorOptions }
					value={ filters.author }
				/>
			) }
			{ postData.categories.length >= 1 && (
				<ComboboxControl
					__next40pxDefaultSize
					allowReset={ true }
					placeholder={ __( 'Section', 'wp-parsely' ) }
					onChange={ ( selection ) => props.onFiltersChange(
						selection, PostFilterType.Section
					) }
					options={ categoryOptions }
					value={ filters.section }
				/>
			) }
			{ postData.tags.length >= 1 && (
				<FormTokenField
					__experimentalShowHowTo={ false } // Hide help text.
					__next40pxDefaultSize
					label={ '' } // Hide label.
					placeholder={ __( 'Tags', 'wp-parsely' ) }
					onChange={ ( selection ) => props.onFiltersChange(
						selection.toString(), PostFilterType.Tag
					) }
					value={ filters.tags }
					suggestions={ postData.tags }
					maxLength={ 5 }
				/>
			) }
		</div>
	);
};
