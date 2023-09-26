/**
 * Defines the props structure for FilterSelect.
 *
 * @since 3.10.0
 */
interface FilterSelectProps {
	defaultValue?: string;
	items: [value: string, label: string][];
	onChange: ( event: React.ChangeEvent<HTMLSelectElement> ) => void;
}

/**
 * Returns a select element according to the passed props.
 *
 * @since 3.10.0
 *
 * @param {FilterSelectProps} props The component's props.
 *
 * @return {JSX.Element} The JSX Element.
 */
export const Select = (
	{ defaultValue, items, onChange }: FilterSelectProps
): JSX.Element => {
	return (
		<select onChange={ onChange } value={ defaultValue }>
			{ items.map( ( item ) => (
				<option
					key={ item[ 0 ] }
					value={ item[ 0 ] }>{ item[ 1 ] }
				</option>
			) ) }
		</select>
	);
};
