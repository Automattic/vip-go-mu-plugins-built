import { Button, Modal } from '@wordpress/components';
import { ModalProps } from '@wordpress/components/build-types/modal/types';

import { __ } from '@/utils/i18n';

export type BaseModalProps = Omit< ModalProps, 'onRequestClose' > & {
	children: JSX.Element;
	headerActions?: JSX.Element;
	headerImage?: string;
	onClose: () => void;
};

export function BaseModal( props: BaseModalProps ) {
	return (
		<Modal
			className={ `${ props.className } remote-data-blocks-modal` }
			headerActions={
				<>
					{ props.headerImage && (
						<img
							alt={ props.title }
							src={ props.headerImage }
							style={ { marginRight: '2em', objectFit: 'contain' } }
						/>
					) }
					{ props.headerActions }
				</>
			}
			onRequestClose={ props.onClose }
			size={ props.size ?? 'fill' }
			{ ...props }
		>
			{ props.children }
		</Modal>
	);
}

export interface ModalWithButtonTriggerProps extends BaseModalProps {
	buttonText: string;
	buttonVariant?: 'primary' | 'secondary' | 'tertiary' | 'link';
	isOpen: boolean;
	onOpen: () => void;
}

export function ModalWithButtonTrigger( props: ModalWithButtonTriggerProps ) {
	const { buttonText, buttonVariant = 'primary', isOpen, onOpen, ...modalProps } = props;

	return (
		<>
			<Button variant={ buttonVariant } onClick={ onOpen }>
				{ __( props.buttonText ) }
			</Button>

			{ isOpen && <BaseModal { ...modalProps } /> }
		</>
	);
}
