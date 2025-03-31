import { Button } from '@wordpress/components';

import {
	createQueryInputsFromRemoteDataResults,
	getFirstRemoteDataResultValueByType,
	getRemoteDataResultValue,
} from '@/utils/remote-data';

function createFieldSelection(
	field: string,
	item: RemoteDataApiResult,
	blockName: string
): FieldSelection {
	return {
		action: 'add_field_shortcode',
		remoteData: {
			blockName,
			queryInputs: createQueryInputsFromRemoteDataResults( [ item ] ),
			metadata: {},
		},
		selectedField: field,
		selectionPath: 'select_new_tab',
		type: 'field',
	};
}

interface ItemListFieldProps {
	blockName: string;
	field: string;
	item: RemoteDataApiResult;
	mediaField?: string;
	onSelectField?: ( data: FieldSelection, fieldValue: string ) => void;
}

export function ItemListField( props: ItemListFieldProps ) {
	const { blockName, field, item, mediaField, onSelectField } = props;
	const value = getRemoteDataResultValue( item, field );

	if ( field === mediaField ) {
		const imgAlt = getFirstRemoteDataResultValueByType( item, 'image_alt' );
		return <img alt={ imgAlt } src={ value } />;
	}

	if ( onSelectField ) {
		return (
			<Button
				onClick={ () => {
					onSelectField( createFieldSelection( field, item, blockName ), value );
				} }
				variant="link"
			>
				{ value }
			</Button>
		);
	}

	return value;
}
