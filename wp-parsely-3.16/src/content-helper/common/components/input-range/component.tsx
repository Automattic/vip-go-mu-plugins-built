/**
 * WordPress dependencies
 */
import {
	__experimentalHeading as Heading,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	__experimentalNumberControl as NumberControl,
	RangeControl,
} from '@wordpress/components';

/**
 * Defines the props structure for InputRange.
 *
 * @since 3.14.0
 */
type InputRangeProps = {
	value: number;
	onChange: ( value: number | undefined ) => void;
	max: number;
	min: number;
	suffix: string;
	label: string;
	initialPosition: number;
	disabled: boolean;
	className?: string;
	size?: 'small' | 'default' | 'compact' | '__unstable-large',
};

/**
 * Component that renders a hybrid input range control.
 * On one side you have the number control and on the other side the range control.
 *
 * @since 3.14.0
 *
 * @param {InputRangeProps} props The component's props.
 */
export const InputRange = ( {
	value,
	onChange,
	max,
	min,
	suffix,
	size,
	label,
	initialPosition,
	disabled,
	className,
}: Readonly<InputRangeProps> ): React.JSX.Element => {
	return (
		<div className={ `parsely-inputrange-control ${ className ? className : '' }` }>
			<Heading className={ 'parsely-inputrange-control__label' } level={ 3 }>{ label }</Heading>
			<div className={ 'parsely-inputrange-control__controls' }>
				<NumberControl
					disabled={ disabled }
					value={ value }
					suffix={ <InputControlSuffixWrapper>{ suffix }</InputControlSuffixWrapper> }
					size={ size ?? '__unstable-large' }
					min={ min }
					max={ max }
					onChange={ ( newValue ) => {
						const numericValue = parseInt( newValue as string, 10 );
						if ( isNaN( numericValue ) ) {
							return;
						}
						onChange( numericValue );
					} }
				/>
				<RangeControl
					disabled={ disabled }
					value={ value }
					showTooltip={ false }
					initialPosition={ initialPosition }
					onChange={ ( newValue ) => {
						onChange( newValue );
					} }
					withInputField={ false }
					min={ min }
					max={ max }
				/>
			</div>
		</div>
	);
};
