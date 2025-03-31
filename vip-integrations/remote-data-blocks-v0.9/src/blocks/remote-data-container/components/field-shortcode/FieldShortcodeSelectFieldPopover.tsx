import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	__experimentalHeading as Heading,
	Popover,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { WPFormat, useAnchor } from '@wordpress/rich-text';

import { FieldShortcodeSelectField } from '@/blocks/remote-data-container/components/field-shortcode/FieldShortcodeSelection';

interface FieldShortcodeSelectFieldPopoverProps {
	contentRef: React.RefObject< HTMLElement >;
	fieldSelection: FieldSelection;
	formatTypeSettings: WPFormat;
	onSelectField: ( data: FieldSelection, fieldValue: string ) => void;
	onClose: () => void;
	resetField: ( blockName?: string ) => void;
}

export function FieldShortcodeSelectFieldPopover( props: FieldShortcodeSelectFieldPopoverProps ) {
	const popoverAnchor = useAnchor( {
		editableContentElement: props.contentRef.current,
		settings: props.formatTypeSettings,
	} );
	const { remoteData, selectedField, type } = props.fieldSelection;

	return (
		<Popover
			placement="bottom-start"
			anchor={ popoverAnchor }
			className="block-editor-format-toolbar__image-popover"
			noArrow={ false }
			offset={ 8 }
			onClose={ props.onClose }
			// Focus the first element (the field-name combobox) if it's empty when the popover is opened.
			focusOnMount="firstElement"
		>
			<Card style={ { width: '24rem' } }>
				<CardHeader>
					<Heading level={ 4 }>{ __( 'Select a field to bind', 'remote-data-blocks' ) }</Heading>
				</CardHeader>
				<CardBody>
					<FieldShortcodeSelectField
						blockName={ remoteData?.blockName ?? 'Remote Data Block' }
						fieldType={ type ?? 'field' }
						onSelectField={ ( data, fieldValue ) =>
							props.onSelectField( { ...data, action: 'update_field_shortcode' }, fieldValue )
						}
						queryInput={ remoteData?.queryInput ?? {} }
						selectedField={ selectedField }
					/>
				</CardBody>
				<CardFooter>
					<Button onClick={ () => props.resetField( remoteData?.blockName ) } isDestructive>
						{ __( 'Reset field', 'remote-data-blocks' ) }
					</Button>
				</CardFooter>
			</Card>
		</Popover>
	);
}
