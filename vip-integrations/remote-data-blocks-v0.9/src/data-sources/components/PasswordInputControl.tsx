import { Button, __experimentalInputControl as InputControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { seen, unseen } from '@wordpress/icons';
import { ComponentPropsWithoutRef } from 'react';

type PasswordInputControlProps = ComponentPropsWithoutRef< typeof InputControl >;

const PasswordInputControl = ( { ...props }: PasswordInputControlProps ) => {
	const [ visible, setVisible ] = useState( false );

	return (
		<InputControl
			autoComplete="off"
			// prevent 1password suggestions since they ignore autocomplete
			data-1p-ignore
			className="password-input-control"
			type={ visible ? 'text' : 'password' }
			suffix={
				<Button
					icon={ visible ? unseen : seen }
					label={
						visible
							? __( 'Hide password', 'remote-data-blocks' )
							: __( 'Show password', 'remote-data-blocks' )
					}
					onClick={ () => setVisible( ! visible ) }
				/>
			}
			__next40pxDefaultSize
			{ ...props }
		/>
	);
};

export default PasswordInputControl;
