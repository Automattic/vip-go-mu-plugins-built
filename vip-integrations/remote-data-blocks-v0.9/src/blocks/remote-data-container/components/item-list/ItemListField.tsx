import { Button } from '@wordpress/components';

function createFieldSelection(
	field: string,
	item: RemoteDataResult,
	blockName: string,
	remoteData: RemoteData
): FieldSelection {
	return {
		action: 'add_field_shortcode',
		remoteData: {
			...remoteData,
			blockName,
			queryInput: {
				...item,
				field: {
					field,
					value: item[ field ],
				},
			},
			resultId: item.id?.toString() ?? '',
			results: [ item ],
		},
		selectedField: field,
		selectionPath: 'select_new_tab',
		type: 'field',
	};
}

interface ItemListFieldProps {
	blockName: string;
	field: string;
	item: RemoteDataResult;
	mediaField?: string;
	onSelect: ( data: RemoteDataQueryInput ) => void;
	onSelectField?: ( data: FieldSelection, fieldValue: string ) => void;
	remoteData?: RemoteData;
}

export function ItemListField( props: ItemListFieldProps ) {
	const { blockName, field, item, mediaField, onSelect, onSelectField, remoteData } = props;
	const value = item[ field ]?.toString() ?? '';

	if ( field === mediaField ) {
		return <img alt={ ( item.image_alt as string ) ?? '' } src={ value } />;
	}

	if ( onSelectField && remoteData ) {
		const queryInput: RemoteDataQueryInput = {
			...item,
			field: {
				field,
				value: item[ field ] as string,
			},
		};

		return (
			<Button
				onClick={ () => {
					onSelectField( createFieldSelection( field, item, blockName, remoteData ), value );
					onSelect( queryInput );
				} }
				variant="link"
			>
				{ value }
			</Button>
		);
	}

	return value;
}
