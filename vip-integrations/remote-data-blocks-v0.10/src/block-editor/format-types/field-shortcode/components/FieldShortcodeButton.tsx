import { BlockControls } from '@wordpress/block-editor';
import { ToolbarDropdownMenu, ToolbarGroup } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { RichTextFormat, insertObject, WPFormatEditProps } from '@wordpress/rich-text';

import { FieldShortcodeSelectExisting } from '@/block-editor/format-types/field-shortcode/components/FieldShortcodeSelectExisting';
import { FieldShortcodeSelectFieldPopover } from '@/block-editor/format-types/field-shortcode/components/FieldShortcodeSelectFieldPopover';
import { FieldShortcodeSelectMeta } from '@/block-editor/format-types/field-shortcode/components/FieldShortcodeSelectMeta';
import { FieldShortcodeSelectNew } from '@/block-editor/format-types/field-shortcode/components/FieldShortcodeSelectNew';
import { useExistingRemoteData } from '@/block-editor/format-types/field-shortcode/hooks/useExistingRemoteData';
import {
	formatName,
	formatTypeSettings,
} from '@/block-editor/format-types/field-shortcode/settings';
import { sendTracksEvent } from '@/blocks/remote-data-container/utils/tracks';
import { getBlockDataSourceType } from '@/utils/localized-block-data';
import '@/block-editor/format-types/field-shortcode/components/FieldShortcode.scss';

function parseDataQuery( dataQuery?: string ): FieldSelection | null {
	if ( ! dataQuery ) {
		return null;
	}

	try {
		return JSON.parse( dataQuery ) as FieldSelection;
	} catch ( _err ) {
		return null;
	}
}

export function FieldShortcodeButton( props: WPFormatEditProps ) {
	const { onChange, onFocus, value, isObjectActive, activeObjectAttributes, contentRef } = props;
	const fieldSelection = parseDataQuery( activeObjectAttributes?.[ 'data-query' ] );
	const [ showUI, setShowUI ] = useState< boolean >( false );

	useEffect( () => {
		if ( isObjectActive ) {
			setShowUI( true );
		}
	}, [ isObjectActive ] );

	const updateOrInsertField = ( data: FieldSelection | null, fieldValue: string ) => {
		// Only serialize a subset of necessary data.
		const serializedData: Partial< FieldSelection > = {
			remoteData: data?.remoteData,
			selectedField: data?.selectedField,
			type: data?.type,
		};

		const format: RichTextFormat = {
			attributes: {
				...activeObjectAttributes,
				'data-query': data ? JSON.stringify( serializedData ) : '',
			},
			innerHTML: fieldValue,
			type: formatName,
		};

		onChange(
			Object.keys( activeObjectAttributes ).length
				? {
						...value,
						replacements: value.replacements.map( ( replacement, index ) =>
							index === value.start ? format : replacement
						),
				  }
				: insertObject( value, format )
		);
	};

	const onSelectField = ( data: FieldSelection, fieldValue: string ) => {
		updateOrInsertField( data, fieldValue );
		setShowUI( false );
		onFocus();
		sendTracksEvent( 'field_shortcode', {
			action: data.action,
			data_source_type: getBlockDataSourceType( data.remoteData?.blockName ),
			selection_path: data.selectionPath,
		} );
	};

	const resetField = ( blockName?: string ): void => {
		updateOrInsertField( null, 'Unbound field' );
		sendTracksEvent( 'field_shortcode', {
			action: 'reset_field_shortcode',
			data_source_type: getBlockDataSourceType( blockName ),
		} );
	};

	const remoteData = useExistingRemoteData();

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					{ remoteData.length > 0 ? (
						<ToolbarDropdownMenu
							className="remote-data-blocks-select-new"
							icon="shortcode"
							label={ __( 'Select block bindings', 'remote-data-blocks' ) }
							popoverProps={ { className: 'rdb-field-shortcode_dropdown', offset: 8 } }
						>
							{ () => (
								<ToolbarGroup>
									<FieldShortcodeSelectNew onSelectField={ onSelectField } />
									<FieldShortcodeSelectExisting
										onSelectField={ onSelectField }
										remoteData={ remoteData }
									/>
									<FieldShortcodeSelectMeta onSelectField={ onSelectField } />
								</ToolbarGroup>
							) }
						</ToolbarDropdownMenu>
					) : (
						<FieldShortcodeSelectNew
							onSelectField={ onSelectField }
							icon="shortcode"
							label={ __( 'Select block bindings', 'remote-data-blocks' ) }
							popoverProps={ { offset: 8, placement: 'bottom-start' } }
							text={ undefined }
						/>
					) }
				</ToolbarGroup>
			</BlockControls>

			{ showUI && fieldSelection && (
				<FieldShortcodeSelectFieldPopover
					contentRef={ contentRef }
					fieldSelection={ fieldSelection }
					formatTypeSettings={ formatTypeSettings }
					onClose={ () => {
						setShowUI( false );
						onFocus();
					} }
					onSelectField={ ( data, fieldValue ) =>
						onSelectField( { ...data, selectionPath: 'popover' }, fieldValue )
					}
					resetField={ resetField }
				/>
			) }
		</>
	);
}
