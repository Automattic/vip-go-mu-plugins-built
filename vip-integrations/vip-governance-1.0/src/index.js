import { store as blockEditorStore } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { store as noticeStore } from '@wordpress/notices';

import { setupBlockLocking } from './block-locking';
import { doesBlockNameMatchBlockWildcard, isBlockAllowedInHierarchy } from './block-utils';
import { getNestedSetting, getNestedSettingPaths } from './nested-governance-loader';

function setup() {
	if ( VIP_GOVERNANCE.error ) {
		dispatch( noticeStore ).createErrorNotice( VIP_GOVERNANCE.error, {
			id: 'wpcomvip-governance-error',
			isDismissible: true,
			actions: [
				{
					label: __( 'Open governance settings' ),
					url: VIP_GOVERNANCE.urlSettingsPage,
				},
			],
		} );

		return;
	}

	const governanceRules = VIP_GOVERNANCE.governanceRules;

	addFilter(
		'blockEditor.__unstableCanInsertBlockType',
		`wpcomvip-governance/block-insertion`,
		( canInsert, blockType, rootClientId, { getBlock } ) => {
			if ( canInsert === false ) {
				return canInsert;
			}

			let parentBlockNames = [];

			if ( rootClientId ) {
				// This block has parents. Build a list of parentBlockNames
				const { getBlockParents, getBlockName } = select( blockEditorStore );
				const parentBlock = getBlock( rootClientId );
				const ancestorClientIds = getBlockParents( rootClientId, true );

				parentBlockNames = [ parentBlock.clientId, ...ancestorClientIds ].map( parentClientId =>
					getBlockName( parentClientId )
				);
			}

			const isAllowed = isBlockAllowedInHierarchy(
				blockType.name,
				parentBlockNames,
				governanceRules
			);

			/**
			 * Change what blocks are allowed to be inserted in the block editor.
			 *
			 * @param {bool}     isAllowed        Whether or not the block will be allowed.
			 * @param {string}   blockName        The name of the block to be inserted.
			 * @param {string[]} parentBlockNames An array of zero or more parent block names,
			 *                                    starting with the most recent parent ancestor.
			 * @param {Object}   governanceRules  An object containing the full set of governance
			 *                                    rules for the current user.
			 */
			return applyFilters(
				'vip_governance__is_block_allowed_for_insertion',
				isAllowed,
				blockType.name,
				parentBlockNames,
				governanceRules
			);
		}
	);

	const nestedSettings = VIP_GOVERNANCE.nestedSettings;
	const nestedSettingPaths = getNestedSettingPaths( nestedSettings );

	const nestedWildcardPaths = {};
	const nestedNonWildcardPaths = {};

	for ( const blockName in nestedSettingPaths ) {
		if ( blockName.indexOf( '*' ) === -1 ) {
			// eslint-disable-next-line security/detect-object-injection
			nestedNonWildcardPaths[ blockName ] = nestedSettingPaths[ blockName ];
		} else {
			// eslint-disable-next-line security/detect-object-injection
			nestedWildcardPaths[ blockName ] = nestedSettingPaths[ blockName ];
		}
	}

	addFilter(
		'blockEditor.useSetting.before',
		`wpcomvip-governance/nested-block-settings`,
		( result, path, clientId, blockName ) => {
			if ( ! blockName ) {
				return result;
			}

			// Test if the blockName is in the nestedNonWildcardPaths.
			if (
				// eslint-disable-next-line security/detect-object-injection
				nestedNonWildcardPaths[ blockName ] !== undefined &&
				// eslint-disable-next-line security/detect-object-injection
				nestedNonWildcardPaths[ blockName ][ path ] === true
			) {
				const blockNamePath = [
					clientId,
					...select( blockEditorStore ).getBlockParents( clientId, /* ascending */ true ),
				]
					.map( candidateId => select( blockEditorStore ).getBlockName( candidateId ) )
					.reverse();
				( { value: result } = getNestedSetting( blockNamePath, path, nestedSettings ) );

				// This is necessary because the nestedSettingPaths are flattened, so a child's path could match the parent's path.
				return result && result.theme ? result.theme : result;
				// Test if the blockName is in the nestedWildcardPaths.
			} else if ( nestedWildcardPaths.length !== 0 ) {
				for ( const nestedBlockName in nestedWildcardPaths ) {
					if (
						doesBlockNameMatchBlockWildcard( blockName, nestedBlockName ) &&
						// eslint-disable-next-line security/detect-object-injection
						nestedWildcardPaths[ nestedBlockName ][ path ] === true
					) {
						const blockNamePath = [
							clientId,
							...select( blockEditorStore ).getBlockParents( clientId, /* ascending */ true ),
						]
							.map( candidateId => select( blockEditorStore ).getBlockName( candidateId ) )
							.reverse();

						// Replace the original block name with the matched wildcard block name, for easier lookup.
						// This will be at the end of the blockNamePath array.
						if ( nestedBlockName.indexOf( '*' ) !== -1 ) {
							blockNamePath[ blockNamePath.length - 1 ] = nestedBlockName;
						}

						( { value: result } = getNestedSetting( blockNamePath, path, nestedSettings ) );

						// This is necessary because the nestedSettingPaths are flattened, so a child's path could match the parent's path.
						return result && result.theme ? result.theme : result;
					}
				}
			}

			return result;
		}
	);

	// Block locking
	if ( governanceRules?.allowedBlocks ) {
		setupBlockLocking( governanceRules );
	}
}

setup();
