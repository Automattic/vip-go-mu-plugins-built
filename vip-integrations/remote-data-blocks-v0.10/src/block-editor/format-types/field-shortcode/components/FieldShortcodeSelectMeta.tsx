import { DropdownMenu, MenuGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRightSmall } from '@wordpress/icons';

import { FieldSelectionFromMetaFields } from '@/block-editor/format-types/field-shortcode/components/FieldShortcodeSelection';
import { useExistingRemoteData } from '@/block-editor/format-types/field-shortcode/hooks/useExistingRemoteData';
import { getBlocksConfig } from '@/utils/localized-block-data';

interface FieldShortcodeSelectMetaProps {
	onSelectField: ( data: FieldSelection, fieldValue: string ) => void;
}

export function FieldShortcodeSelectMeta( props: FieldShortcodeSelectMetaProps ) {
	const blockConfigs = getBlocksConfig();
	const remoteDatas: RemoteData[] = useExistingRemoteData();

	return remoteDatas.length > 0 ? (
		<DropdownMenu
			icon={ chevronRightSmall }
			label=""
			text={ __( 'Query metadata', 'remote-data-blocks' ) }
			popoverProps={ {
				className: 'remote-data-blocks-field-shortcode-dropdown remote-data-blocks-select-meta',
				placement: 'right-start',
				offset: 0,
			} }
		>
			{ () =>
				remoteDatas.map( remoteData => (
					<MenuGroup
						key={ remoteData.blockName }
						label={ blockConfigs[ remoteData.blockName ]?.settings.title ?? remoteData.blockName }
					>
						<FieldSelectionFromMetaFields
							onSelectField={ ( data, fieldValue ) =>
								props.onSelectField( { ...data, selectionPath: 'select_meta_tab' }, fieldValue )
							}
							remoteData={ remoteData }
						/>
					</MenuGroup>
				) )
			}
		</DropdownMenu>
	) : undefined;
}
