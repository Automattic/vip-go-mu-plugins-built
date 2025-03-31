import { FormTokenField } from '@wordpress/components';
import { FormTokenFieldProps } from '@wordpress/components/build-types/form-token-field/types';
import { useEffect, useRef, useState } from '@wordpress/element';

type CustomFormFieldTokenProps = FormTokenFieldProps & {
	customHelpText?: string | null;
};

export const CustomFormFieldToken = ( props: CustomFormFieldTokenProps ) => {
	const [ isAbove, setIsAbove ] = useState( false );
	const inputRef = useRef( null );
	const { customHelpText, ...formTokenFieldProps } = props;

	const handlePosition = () => {
		if ( ! inputRef.current ) return;

		const { bottom, top } = ( inputRef.current as HTMLElement ).getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const dropdownHeight = 200;

		// Determine whether there is more space above or below
		setIsAbove( viewportHeight - bottom < dropdownHeight && top > dropdownHeight );
	};

	useEffect( () => {
		const handleResize = () => handlePosition(); // Ensures stable reference for cleanup

		handlePosition(); // Calculate position on mount
		window.addEventListener( 'resize', handleResize ); // Recalculate on window resize

		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [] );

	return (
		<div
			ref={ inputRef }
			className={ `form-token-field-wrapper ${ isAbove ? 'above' : 'below' }` }
			style={ { position: 'relative' } }
		>
			<FormTokenField { ...formTokenFieldProps } __experimentalShowHowTo={ ! customHelpText } />
			{ customHelpText && <p className="input-help-text">{ customHelpText }</p> }
		</div>
	);
};
