/**
 * WordPress dependencies
 */
import {
	ComboboxControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { ComboboxControlOption } from '@wordpress/components/build-types/combobox-control/types';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PostFilter, PostFilterType } from '../../common/utils/constants';
import { SidebarPostData } from '../editor-sidebar';

/**
 * Defines the props structure for FilterTypes.
 *
 * @since 3.14.0
 */
type FilterTypesProps = {
	filter: PostFilter;
	label?: string;
	onFilterTypeChange: ( selection: string ) => void;
	postData: SidebarPostData;
};

/**
 * Returns the filter types ToggleGroupControl component.
 *
 * @since 3.14.0
 *
 * @param {FilterTypesProps} props The component's props.
 */
const FilterTypes = (
	{ filter, label, postData, ...props }: Readonly<FilterTypesProps>
): JSX.Element => {
	return (
		<div className="related-posts-filter-types">
			<ToggleGroupControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ label ? label : __( 'Filter by', 'wp-parsely' ) }
				value={ filter.type }
				onChange={ ( value ) => props.onFilterTypeChange( value as string ) }
				isBlock
			>
				{ postData.tags.length >= 1 && (
					<ToggleGroupControlOption
						value={ PostFilterType.Tag }
						label={ __( 'Tag', 'wp-parsely' ) } />
				) }
				{ postData.categories.length >= 1 && (
					<ToggleGroupControlOption
						value={ PostFilterType.Section }
						label={ __( 'Section', 'wp-parsely' ) }
					/>
				) }
				<ToggleGroupControlOption
					value={ PostFilterType.Author }
					label={ __( 'Author', 'wp-parsely' ) }
				/>
			</ToggleGroupControl>
		</div>
	);
};

/**
 * Defines the props structure for FilterValues.
 *
 * @since 3.14.0
 */
type FilterValuesProps = {
	filter: PostFilter;
	label?: string;
	onFilterValueChange: ( selection: string | null | undefined ) => void;
	postData: SidebarPostData;
}

/**
 * Returns the filter values ComboboxControl component.
 *
 * @since 3.14.0
 *
 * @param {FilterValuesProps} props The component's props.
 */
const FilterValues = ( {
	filter,
	postData,
	...props
}: Readonly<FilterValuesProps> ): JSX.Element => {
	/**
	 * Returns the options that will populate the ComboboxControl.
	 *
	 * @since 3.11.0
	 *
	 * @return {ComboboxControlOption[]} The resulting ComboboxControl options.
	 */
	const getOptions = (): ComboboxControlOption[] => {
		if ( PostFilterType.Tag === filter.type ) {
			return postData.tags.map( ( tag: string ) => ( {
				value: tag, label: tag,
			} ) );
		}

		if ( PostFilterType.Section === filter.type ) {
			return postData.categories.map( ( section: string ) => ( {
				value: section, label: section,
			} ) );
		}

		if ( PostFilterType.Author === filter.type ) {
			return postData.authors.map( ( author: string ) => ( {
				value: author, label: author,
			} ) );
		}

		return [];
	};

	return (
		<div className="related-posts-filter-values">
			<ComboboxControl
				allowReset={ true }
				onChange={ ( selection ) => props.onFilterValueChange( selection ) }
				options={ getOptions() }
				value={ filter.value }
			/>
		</div>
	);
};

/**
 * Defines the props structure for FilterControls.
 *
 * @since 3.14.0
 */
type FilterControlsProps = {
	filter: PostFilter;
	label?: string;
	onFilterTypeChange: ( selection: string ) => void;
	onFilterValueChange: ( selection: string | null | undefined ) => void;
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
	filter,
	postData,
	label,
	...props
}: Readonly<FilterControlsProps> ): JSX.Element => {
	/**
	 * Returns whether the filter values ComboboxControl should be displayed.
	 *
	 * @since 3.11.0
	 *
	 * @return {boolean} Whether to display the filter values ComboboxControl.
	 */
	const shouldDisplayFilterValues = (): boolean => {
		if (
			( PostFilterType.Tag === filter.type && postData.tags.length > 1 ) ||
			( PostFilterType.Section === filter.type && postData.categories.length > 1 ) ||
			( PostFilterType.Author === filter.type && postData.authors.length > 1 )
		) {
			return true;
		}

		return false;
	};

	return (
		<>
			<FilterTypes
				filter={ filter }
				label={ label }
				onFilterTypeChange={ props.onFilterTypeChange }
				postData={ postData }
			/>
			{ shouldDisplayFilterValues() &&
				<FilterValues
					filter={ filter }
					onFilterValueChange={ props.onFilterValueChange }
					postData={ postData }
				/>
			}
		</>
	);
};
