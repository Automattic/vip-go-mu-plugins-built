/**
 * WordPress dependencies
 */
import { Disabled } from '@wordpress/components';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { isBlockAllowedInHierarchy } from './block-utils';

export function setupBlockLocking( governanceRules ) {
	const withDisabledBlocks = createHigherOrderComponent( BlockEdit => {
		return props => {
			const { name: blockName, clientId } = props;

			const { getBlockParents, getBlockName } = select( blockEditorStore );
			const parentClientIds = getBlockParents(clientId, true);

			const isParentLocked = parentClientIds.some( parentClientId => isBlockLocked(parentClientId) );

			if ( isParentLocked ) {
				// To avoid layout issues, only disable the outermost locked block
				return <BlockEdit { ...props } />;
			}

			const parentBlockNames = parentClientIds.map( parentClientId =>
				getBlockName( parentClientId )
			);

			let isAllowed = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

			/**
			 * Change what blocks are allowed to be edited in the block editor.
			 *
			 * @param {bool}     isAllowed        Whether or not the block will be allowed.
			 * @param {string}   blockName        The name of the block to be edited.
			 * @param {string[]} parentBlockNames An array of zero or more parent block names,
			 *                                    starting with the most recent parent ancestor.
			 * @param {Object}   governanceRules  An object containing the full set of governance
			 *                                    rules for the current user.
			 */
			isAllowed = applyFilters(
				'vip_governance__is_block_allowed_for_editing',
				isAllowed,
				blockName,
				parentBlockNames,
				governanceRules
			);

			if ( isAllowed ) {
				return <BlockEdit { ...props } />;
			} else {

				// Only available on WP 6.4 and above, so this guards against that.
				if ( wp?.blockEditor?.useBlockEditingMode ) {
					const { useBlockEditingMode } = wp.blockEditor;
					useBlockEditingMode( 'disabled' );
				}

				// Mark block as locked so that children can detect they're within an existing locked block
				setBlockLocked( clientId );

				return <>
					<Disabled>
						<div style={ { opacity: 0.6, backgroundColor: '#eee', border: '2px dashed #999' } }>
							<BlockEdit { ...props } />
						</div>
					</Disabled>
				</>;
			}
		};
	}, 'withDisabledBlocks' );

	addFilter( 'editor.BlockEdit', 'wpcomvip-governance/with-disabled-blocks', withDisabledBlocks );
}

/**
 * In-memory map of block clientIds that have been marked as locked.
 *
 * This replaces using props.setAttributes() to set lock status, as this caused an
 * "unsaved changes" warning to appear in the editor when block locking was in use.
 */
const lockedBlockMap = {};

/**
 * Marks a block as locked via the block's clientId.
 *
 * @param {string} clientId Block clientId in editor
 * @returns {void}
 */
function setBlockLocked( clientId ) {
	lockedBlockMap[clientId] = true;
}

/**
 * Returns true if a block has previously been marked as locked, false otherwise.
 *
 * @param {string} clientId Block clientId in editor
 * @returns {boolean}
 */
function isBlockLocked( clientId ) {
	return clientId in lockedBlockMap;
}
