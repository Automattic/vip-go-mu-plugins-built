import { store as blockEditorStore } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { store as noticeStore } from '@wordpress/notices';

import { setupBlockLocking } from './block-locking';
import { isBlockAllowedInHierarchy } from './block-utils';
import { createNestedSettingRules, resolveNestedSetting } from './nested-settings-filter';

import type {
	BlockEditorInsertionSelectors,
	BlockEditorSelectors,
	BlockName,
	BlockType,
	ClientId,
	GovernanceRuntimeConfig,
} from './types';

type InsertionFilterSelectors = Pick< BlockEditorInsertionSelectors, 'getBlock' >;

/** Register editor governance filters from the server-localized configuration. */
export function setupGovernance( config: GovernanceRuntimeConfig ): void {
	if ( config.error ) {
		void dispatch( noticeStore ).createErrorNotice( config.error, {
			id: 'wpcomvip-governance-error',
			isDismissible: true,
			actions: [
				{
					label: __( 'Open governance settings', 'vip-governance' ),
					url: config.urlSettingsPage,
				},
			],
		} );
		return;
	}

	const { governanceRules } = config;
	const { getBlockParents, getBlockName } = select( blockEditorStore ) as BlockEditorSelectors;

	addFilter(
		'blockEditor.__unstableCanInsertBlockType',
		'wpcomvip-governance/block-insertion',
		(
			canInsert: boolean,
			blockType: BlockType,
			rootClientId: ClientId | undefined,
			{ getBlock }: InsertionFilterSelectors
		): boolean => {
			if ( canInsert === false ) {
				return false;
			}

			let parentBlockNames: BlockName[] = [];
			if ( rootClientId ) {
				const parentBlock = getBlock( rootClientId );
				const ancestorNames = getBlockParents( rootClientId, true )
					.map( getBlockName )
					.filter( ( name ): name is BlockName => name !== undefined );
				const immediateParentName = parentBlock?.name ?? getBlockName( rootClientId );

				parentBlockNames = immediateParentName
					? [ immediateParentName, ...ancestorNames ]
					: ancestorNames;
			}

			const isAllowed = isBlockAllowedInHierarchy(
				blockType.name,
				parentBlockNames,
				governanceRules
			);

			return applyFilters(
				'vip_governance__is_block_allowed_for_insertion',
				isAllowed,
				blockType.name,
				parentBlockNames,
				governanceRules
			) as boolean;
		}
	);

	const nestedSettingRules = createNestedSettingRules( config.nestedSettings );
	addFilter(
		'blockEditor.useSetting.before',
		'wpcomvip-governance/nested-block-settings',
		( defaultValue: unknown, path: string, clientId: ClientId, blockName?: BlockName ): unknown => {
			if ( ! blockName ) {
				return defaultValue;
			}

			return resolveNestedSetting( {
				clientId,
				currentBlockName: blockName,
				defaultValue,
				getBlockName,
				getBlockParents,
				path,
				rules: nestedSettingRules,
			} );
		}
	);

	if ( governanceRules.allowedBlocks ) {
		setupBlockLocking( governanceRules );
	}
}
