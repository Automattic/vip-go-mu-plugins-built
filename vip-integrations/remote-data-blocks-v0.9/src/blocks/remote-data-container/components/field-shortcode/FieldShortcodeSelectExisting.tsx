import { DropdownMenu, MenuGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRightSmall } from '@wordpress/icons';

import { FieldSelectionFromAvailableBindings } from '@/blocks/remote-data-container/components/field-shortcode/FieldShortcodeSelection';
import { useExistingRemoteData } from '@/blocks/remote-data-container/hooks/useExistingRemoteData';
import { getBlocksConfig } from '@/utils/localized-block-data';

interface FieldShortcodeSelectExistingProps {
	onSelectField: ( data: FieldSelection, fieldValue: string ) => void;
}

export function FieldShortcodeSelectExisting( props: FieldShortcodeSelectExistingProps ) {
	const blockConfigs = getBlocksConfig();
	const remoteDatas: RemoteData[] = useExistingRemoteData().filter(
		remoteData => ! remoteData.isCollection
	);

	return remoteDatas.length > 0 ? (
		<DropdownMenu
			icon={ chevronRightSmall }
			label=""
			text={ __( 'Existing items', 'remote-data-blocks' ) }
			popoverProps={ {
				className: 'remote-data-blocks-field-shortcode-dropdown remote-data-blocks-select-existing',
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
						<FieldSelectionFromAvailableBindings
							onSelectField={ ( data, fieldValue ) =>
								props.onSelectField( { ...data, selectionPath: 'select_existing_tab' }, fieldValue )
							}
							remoteData={ remoteData }
						/>
					</MenuGroup>
				) )
			}
		</DropdownMenu>
	) : undefined;
}
