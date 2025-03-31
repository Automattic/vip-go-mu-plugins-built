import { CheckboxControl, SelectControl } from '@wordpress/components';

import {
	BUTTON_TEXT_FIELD_TYPES,
	BUTTON_URL_FIELD_TYPES,
	HTML_FIELD_TYPES,
	IMAGE_ALT_FIELD_TYPES,
	IMAGE_URL_FIELD_TYPES,
	TEXT_FIELD_TYPES,
} from '@/blocks/remote-data-container/config/constants';
import { sendTracksEvent } from '@/blocks/remote-data-container/utils/tracks';
import { getBlockDataSourceType } from '@/utils/localized-block-data';

interface BlockBindingFieldControlProps {
	availableBindings: AvailableBindings;
	fieldTypes: string[];
	label: string;
	target: string;
	updateFieldBinding: ( target: string, field: string ) => void;
	value: string;
}

export function BlockBindingFieldControl( props: BlockBindingFieldControlProps ) {
	const { availableBindings, fieldTypes, label, target, updateFieldBinding, value } = props;

	const options = Object.entries( availableBindings )
		.filter( ( [ _key, mapping ] ) => fieldTypes.includes( mapping.type ) )
		.map( ( [ key, mapping ] ) => {
			return { label: mapping.name, value: key };
		} );

	return (
		<SelectControl
			label={ label }
			name={ target }
			options={ [ { label: 'Select a field', value: '' }, ...options ] }
			onChange={ ( field: string ) => updateFieldBinding( target, field ) }
			value={ value }
		/>
	);
}

interface BlockBindingControlsProps {
	attributes: RemoteDataInnerBlockAttributes;
	availableBindings: AvailableBindings;
	blockName: string;
	remoteDataName: string;
	removeBinding: ( target: string ) => void;
	updateBinding: ( target: string, args: Omit< RemoteDataBlockBindingArgs, 'block' > ) => void;
}

export function BlockBindingControls( props: BlockBindingControlsProps ) {
	const { attributes, availableBindings, blockName, remoteDataName, removeBinding, updateBinding } =
		props;
	const contentArgs = attributes.metadata?.bindings?.content?.args;
	const contentField = contentArgs?.field ?? '';
	const imageAltField = attributes.metadata?.bindings?.alt?.args?.field ?? '';
	const imageUrlField = attributes.metadata?.bindings?.url?.args?.field ?? '';
	const buttonUrlField = attributes.metadata?.bindings?.url?.args?.field ?? '';
	const buttonTextField = attributes.metadata?.bindings?.text?.args?.field ?? '';

	function updateFieldBinding( target: string, field: string ): void {
		if ( ! field ) {
			removeBinding( target );
			sendTracksEvent( 'remote_data_container_actions', {
				action: 'remove_binding',
				data_source_type: getBlockDataSourceType( remoteDataName ),
				block_target_attribute: target,
			} );

			return;
		}

		const args = attributes.metadata?.bindings?.[ target ]?.args ?? {};
		updateBinding( target, { ...args, field } );
		sendTracksEvent( 'remote_data_container_actions', {
			action: 'update_binding',
			data_source_type: getBlockDataSourceType( remoteDataName ),
			remote_data_field: field,
			block_target_attribute: target,
		} );
	}

	function updateFieldLabel( showLabel: boolean ): void {
		if ( ! contentField ) {
			// Form input should be disabled in this state, but check anyway.
			return;
		}

		const label = showLabel
			? Object.entries( availableBindings ).find( ( [ key ] ) => key === contentField )?.[ 1 ]?.name
			: undefined;
		updateBinding( 'content', { ...contentArgs, field: contentField, label } );
		sendTracksEvent( 'remote_data_container_actions', {
			action: showLabel ? 'show_label' : 'hide_label',
			data_source_type: getBlockDataSourceType( remoteDataName ),
		} );
	}

	switch ( blockName ) {
		case 'core/heading':
		case 'core/paragraph':
			return (
				<>
					<BlockBindingFieldControl
						availableBindings={ availableBindings }
						fieldTypes={ TEXT_FIELD_TYPES }
						label="Content"
						target="content"
						updateFieldBinding={ updateFieldBinding }
						value={ contentField }
					/>
					<CheckboxControl
						checked={ Boolean( contentArgs?.label ) }
						disabled={ ! contentField }
						label="Show label"
						name="show_label"
						onChange={ updateFieldLabel }
					/>
				</>
			);

		case 'core/image':
			return (
				<>
					<BlockBindingFieldControl
						availableBindings={ availableBindings }
						fieldTypes={ IMAGE_URL_FIELD_TYPES }
						label="Image URL"
						target="url"
						updateFieldBinding={ updateFieldBinding }
						value={ imageUrlField }
					/>
					<BlockBindingFieldControl
						availableBindings={ availableBindings }
						fieldTypes={ IMAGE_ALT_FIELD_TYPES }
						label="Image alt text"
						target="alt"
						updateFieldBinding={ updateFieldBinding }
						value={ imageAltField }
					/>
				</>
			);
		case 'core/button':
			return (
				<>
					<BlockBindingFieldControl
						availableBindings={ availableBindings }
						fieldTypes={ BUTTON_URL_FIELD_TYPES }
						label="Button URL"
						target="url"
						updateFieldBinding={ updateFieldBinding }
						value={ buttonUrlField }
					/>
					<BlockBindingFieldControl
						availableBindings={ availableBindings }
						fieldTypes={ BUTTON_TEXT_FIELD_TYPES }
						label="Button Text"
						target="text"
						updateFieldBinding={ updateFieldBinding }
						value={ buttonTextField }
					/>
				</>
			);

		case 'remote-data-blocks/remote-html':
			return (
				<>
					<BlockBindingFieldControl
						availableBindings={ availableBindings }
						fieldTypes={ HTML_FIELD_TYPES }
						label="Raw HTML"
						target="content"
						updateFieldBinding={ updateFieldBinding }
						value={ contentField }
					/>
				</>
			);
	}

	return null;
}
