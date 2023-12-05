/**
 * WordPress dependencies
 */
import { ComboboxControl, SelectControl } from '@wordpress/components';
import { ComboboxControlOption } from '@wordpress/components/build-types/combobox-control/types';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PostFilter, PostFilterType } from '../../common/utils/constants';
import { SidebarPostData } from '../editor-sidebar';

/**
 * Defines the props structure for FilterControls.
 *
 * @since 3.11.0
 */
interface FilterControlsProps {
	filter: PostFilter;
	label?: string;
	onFilterTypeChange: ( selection: string ) => void;
	onFilterValueChange: ( selection: string | null | undefined ) => void;
	postData: SidebarPostData;
}

/**
 * Defines the props structure for FilterTypeSelect.
 *
 * @since 3.11.0
 */
interface FilterTypeSelectProps extends Omit<FilterControlsProps, 'onFilterValueChange'> {}

/**
 * Defines the props structure for FilterValueSelect.
 *
 * @since 3.11.0
 */
interface FilterValueSelectProps extends Omit<FilterControlsProps, 'onFilterTypeChange'> {}

/**
 * Returns the FilterSelectionControls component.
 *
 * @since 3.11.0
 *
 * @param {FilterControlsProps} props The component's props.
 *
 * @return {JSX.Element} The FilterSelectionControls component.
 */
export const FilterSelectionControls = ( {
	filter, label, onFilterTypeChange, onFilterValueChange, postData,
}: Readonly<FilterControlsProps> ): JSX.Element => {
	/**
	 * Returns whether the filter type SelectControl should be displayed.
	 *
	 * @since 3.11.0
	 *
	 * @return {boolean} Whether to display the filter type SelectControl.
	 */
	const shouldDisplayFilterTypes = (): boolean => {
		if (
			( postData.tags.length >= 1 && postData.categories.length >= 1 ) ||
			( postData.tags.length >= 1 && postData.authors.length >= 1 ) ||
			( postData.categories.length >= 1 && postData.authors.length >= 1 )
		) {
			return true;
		}

		return false;
	};

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

	const displayLabelOnFilterValue = shouldDisplayFilterValues() &&
		! shouldDisplayFilterTypes();

	return (
		<>
			{ shouldDisplayFilterTypes() &&
				<FilterTypeSelectControl
					filter={ filter }
					label={ ! displayLabelOnFilterValue ? label : undefined }
					onFilterTypeChange={ onFilterTypeChange }
					postData={ postData }
				/>
			}
			{ shouldDisplayFilterValues() &&
				<FilterValueComboboxControl
					filter={ filter }
					label={ displayLabelOnFilterValue ? label : undefined }
					onFilterValueChange={ onFilterValueChange }
					postData={ postData }
				/>
			}
		</>
	);
};

/**
 * Returns a SelectControl containing the available filter types.
 *
 * Filter types for which there is no data will not be displayed.
 *
 * @since 3.11.0
 *
 * @param {FilterTypeSelectProps} props The component's props.
 *
 * @return {JSX.Element} The resulting SelectControl.
 */
const FilterTypeSelectControl = ( {
	filter, label, onFilterTypeChange, postData,
}: Readonly<FilterTypeSelectProps> ): JSX.Element => {
	return (
		<SelectControl
			label={ label }
			onChange={ ( selection ) => onFilterTypeChange( selection ) }
			value={ filter.type }
		>
			{ postData.tags.length >= 1 &&
				<option value={ PostFilterType.Tag }>
					{ __( 'Tag', 'wp-parsely' ) }
				</option>
			}
			{ postData.categories.length >= 1 &&
				<option value={ PostFilterType.Section }>
					{ __( 'Section', 'wp-parsely' ) }
				</option>
			}
			{ postData.authors.length >= 1 &&
				<option value={ PostFilterType.Author }>
					{ __( 'Author', 'wp-parsely' ) }
				</option>
			}
		</SelectControl>
	);
};

/**
 * Returns a ComboBox control containing the available filter values for the
 * selected filter type.
 *
 * @since 3.11.0
 *
 * @param {FilterValueSelectProps} props The component's props.
 *
 * @return {JSX.Element} The resulting ComboboxControl.
 */
const FilterValueComboboxControl = ( {
	filter, label, onFilterValueChange, postData,
}: Readonly<FilterValueSelectProps> ): JSX.Element => {
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
		<ComboboxControl
			label={ label }
			onChange={ ( selection ) => onFilterValueChange( selection ) }
			options={ getOptions() }
			value={ filter.value }
		/>
	);
};
