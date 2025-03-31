import { BaseControl, Icon, MenuItem, Spinner } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { check } from '@wordpress/icons';

import {
	DISPLAY_QUERY_KEY,
	TEXT_FIELD_TYPES,
} from '@/blocks/remote-data-container/config/constants';
import { useRemoteData } from '@/blocks/remote-data-container/hooks/useRemoteData';
import { getBlockAvailableBindings } from '@/utils/localized-block-data';
import { getRemoteDataResultValue } from '@/utils/remote-data';

interface FieldSelectionProps {
	fields: Record< string, { name: string; value: string } >;
	onSelectField: ( data: FieldSelection, fieldValue: string ) => void;
	selectedField?: string;
	remoteData: RemoteData;
	fieldType: 'field' | 'meta';
}

export function FieldSelection( props: FieldSelectionProps ) {
	return (
		<>
			{ Object.entries( props.fields ).map( ( [ fieldName, fieldDetails ], index ) => {
				const fieldSelection: FieldSelection = {
					action: 'add_field_shortcode',
					selectedField: fieldName,
					remoteData: props.remoteData,
					type: props.fieldType,
					selectionPath: 'select_new_tab',
				};

				return (
					<MenuItem
						className="remote-data-blocks-inline-field"
						key={ index }
						onClick={ evt => {
							evt.preventDefault();
							props.onSelectField( fieldSelection, fieldDetails.value );
						} }
						onKeyDown={ evt => {
							if ( evt.key.toLowerCase() === 'enter' ) {
								props.onSelectField( fieldSelection, fieldDetails.value );
							}
						} }
						suffix={
							props.selectedField === fieldName ? (
								<Icon
									icon={ check }
									size={ 24 }
									style={ {
										color: '#4ab866',
									} }
								/>
							) : undefined
						}
					>
						<BaseControl className="remote-data-blocks-inline-field-choice" __nextHasNoMarginBottom>
							<BaseControl.VisualLabel
								style={ {
									marginBottom: 0,
									whiteSpace: 'normal',
								} }
							>
								{ fieldDetails.name }:
							</BaseControl.VisualLabel>
							{ fieldDetails.value?.toString() }
						</BaseControl>
					</MenuItem>
				);
			} ) }
		</>
	);
}

type FieldSelectionWithFieldsProps = Omit< FieldSelectionProps, 'fields' | 'fieldType' >;

export function FieldSelectionFromAvailableBindings( props: FieldSelectionWithFieldsProps ) {
	const availableBindings = getBlockAvailableBindings( props.remoteData.blockName );

	const fields = Object.entries( availableBindings ).reduce< FieldSelectionProps[ 'fields' ] >(
		( acc, [ fieldName, binding ] ) => {
			const fieldValue = getRemoteDataResultValue( props.remoteData.results[ 0 ], fieldName );
			if ( ! fieldValue || ! TEXT_FIELD_TYPES.includes( binding.type ) ) {
				return acc;
			}

			return {
				...acc,
				[ fieldName ]: {
					name: binding.name,
					value: fieldValue,
				},
			};
		},
		{}
	);

	return <FieldSelection { ...props } fields={ fields } fieldType="field" />;
}

export function FieldSelectionFromMetaFields( props: FieldSelectionWithFieldsProps ) {
	const fields: FieldSelectionProps[ 'fields' ] = Object.fromEntries(
		Object.entries( props.remoteData.metadata ?? {} ).map( ( [ fieldName, metadatum ] ) => [
			fieldName,
			{
				name: metadatum.name,
				value: metadatum.value?.toString() ?? '',
			},
		] )
	);

	return <FieldSelection { ...props } fields={ fields } fieldType="meta" />;
}

interface FieldShortcodeSelectFieldProps {
	blockName: string;
	fieldType: 'field' | 'meta';
	onSelectField: ( data: FieldSelection, fieldValue: string ) => void;
	queryInputs: RemoteDataQueryInput[];
	selectedField?: string;
}

export function FieldShortcodeSelectField( props: FieldShortcodeSelectFieldProps ) {
	const { data, fetch, loading } = useRemoteData( {
		blockName: props.blockName,
		queryKey: DISPLAY_QUERY_KEY,
	} );

	useEffect( () => {
		if ( loading || data ) {
			return;
		}

		void fetch( props.queryInputs );
	}, [ loading, data ] );

	if ( ! data || loading ) {
		return <Spinner />;
	}

	const selectionProps: FieldSelectionWithFieldsProps = {
		onSelectField: props.onSelectField,
		remoteData: data,
		selectedField: props.selectedField,
	};

	if ( 'meta' === props.fieldType ) {
		return <FieldSelectionFromMetaFields { ...selectionProps } />;
	}

	return <FieldSelectionFromAvailableBindings { ...selectionProps } />;
}
