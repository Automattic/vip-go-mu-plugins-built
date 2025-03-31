import { SelectControl } from '@wordpress/components';
import { PluginDocumentSettingPanel } from '@wordpress/editor';

import { sendTracksEvent } from '@/blocks/remote-data-container/utils/tracks';
import { PATTERN_BLOCK_TYPE_POST_META_KEY } from '@/config/constants';
import { useEditedPostAttribute } from '@/hooks/useEditedPostAttribute';
import { usePostMeta } from '@/hooks/usePostMeta';
import { __ } from '@/utils/i18n';
import { getBlockDataSourceType, getBlocksConfig } from '@/utils/localized-block-data';

export function PatternEditorSettingsPanel() {
	const { postId, postType, isSynced } = useEditedPostAttribute( getEditedPostAttribute => ( {
		postId: getEditedPostAttribute< number >( 'id' ) ?? 0,
		postType: getEditedPostAttribute< string >( 'type' ) ?? '',
		isSynced: getEditedPostAttribute< string >( 'wp_pattern_sync_status' ) !== 'unsynced',
	} ) );
	const { postMeta, updatePostMeta } = usePostMeta( postId, postType );

	if ( ! postId || postType !== 'wp_block' ) {
		return null;
	}

	const blocksConfig = getBlocksConfig();
	const blockType = String( postMeta?.[ PATTERN_BLOCK_TYPE_POST_META_KEY ] ?? '' );

	function updateBlockTypes( blockName: string ): void {
		updatePostMeta( { ...postMeta, [ PATTERN_BLOCK_TYPE_POST_META_KEY ]: blockName } );
		sendTracksEvent( 'associate_block_type_to_pattern', {
			data_source_type: getBlockDataSourceType( blockName ),
			is_pattern_synced: isSynced,
		} );
	}

	const options = Object.entries( blocksConfig ).map( ( [ value, blockConfig ] ) => {
		return { label: blockConfig.settings.title, value };
	} );

	return (
		<PluginDocumentSettingPanel
			name="pattern-editor-settings-panel"
			title={ __( 'Remote Data Blocks' ) }
		>
			<>
				<p>{ __( 'Choose a Remote Data Block type that is associated with this pattern.' ) }</p>
				<SelectControl
					label={ __( 'Block type' ) }
					name="block-types"
					options={ [ { label: __( 'Select a block' ), value: '' }, ...options ] }
					onChange={ updateBlockTypes }
					value={ blockType }
				/>
			</>
		</PluginDocumentSettingPanel>
	);
}
