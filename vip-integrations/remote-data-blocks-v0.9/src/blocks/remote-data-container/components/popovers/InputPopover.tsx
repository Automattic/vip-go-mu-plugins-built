import {
	Button,
	Popover,
	__experimentalInputControl as InputControl,
	ExternalLink,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { keyboardReturn } from '@wordpress/icons';

import { useModalState } from '@/blocks/remote-data-container/hooks/useModalState';
import { sendTracksEvent } from '@/blocks/remote-data-container/utils/tracks';
import { __ } from '@/utils/i18n';
import { getBlockDataSourceType } from '@/utils/localized-block-data';

import './style.scss';

interface InputPopoverProps {
	blockName: string;
	headerImage?: string;
	input: InputVariable;
	onSelect: ( data: RemoteDataQueryInput ) => void;
	title: string;
}

export function InputPopover( props: InputPopoverProps ) {
	const { input, onSelect } = props;

	const dataSourceType = getBlockDataSourceType( props.blockName );

	const initialInputState = { [ input.slug ]: '' };

	const [ inputState, setInputState ] = useState< Record< string, string > >( initialInputState );
	const { close, isOpen, open } = useModalState();

	function onChange( field: string, value: string ): void {
		setInputState( { ...inputState, [ field ]: value } );
	}

	function onSelectItem(): void {
		onSelect( inputState );
		close();
		sendTracksEvent( 'add_block', {
			action: 'select_item',
			selected_option: 'manual_input',
			data_source_type: getBlockDataSourceType( props.blockName ),
		} );
	}

	function getDataSourceLabels( sourceType: string ): {
		buttonText: string;
		helpText?: JSX.Element;
	} {
		switch ( sourceType ) {
			case 'airtable':
				return {
					buttonText: __( 'Enter record ID' ),
					helpText: (
						<ExternalLink href="https://support.airtable.com/docs/finding-airtable-ids#finding-record-ids">
							{ __( 'How do I get the Record ID?' ) }
						</ExternalLink>
					),
				};
			default:
				return {
					buttonText: __( 'Provide manual input' ),
				};
		}
	}

	return (
		<>
			<Button variant="secondary" onClick={ open }>
				{ getDataSourceLabels( dataSourceType ).buttonText }
			</Button>
			{ isOpen && (
				<Popover onClose={ close } offset={ 16 } position="bottom right">
					<form
						className="remote-data-blocks-edit__input-popover-form"
						onSubmit={ event => {
							event.preventDefault();
							onSelectItem();
						} }
					>
						<InputControl
							className="remote-data-blocks-edit__input"
							label={ input.name }
							required={ input.required }
							value={ inputState[ input.slug ] ?? '' }
							onChange={ ( value: string | undefined ) => onChange( input.slug, value ?? '' ) }
							help={ getDataSourceLabels( dataSourceType ).helpText }
							suffix={ <Button icon={ keyboardReturn } label={ __( 'Save' ) } type="submit" /> }
						/>
					</form>
				</Popover>
			) }
		</>
	);
}
