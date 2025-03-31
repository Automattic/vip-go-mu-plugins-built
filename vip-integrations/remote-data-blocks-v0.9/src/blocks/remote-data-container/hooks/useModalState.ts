import { useState } from '@wordpress/element';

export function useModalState( onOpen?: () => void, onClose?: () => void ) {
	const [ isOpen, setIsOpen ] = useState< boolean >( false );

	function close(): void {
		onClose?.();
		setIsOpen( false );
	}

	function open(): void {
		onOpen?.();
		setIsOpen( true );
	}

	return {
		close,
		isOpen,
		open,
	};
}
