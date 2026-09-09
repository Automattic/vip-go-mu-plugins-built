import { store as blockEditorStore, useBlockEditingMode } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createContext, useContext } from '@wordpress/element';
import { addFilter, applyFilters } from '@wordpress/hooks';

import { isBlockAllowedInHierarchy } from './block-utils';

import type { BlockEditorSelectors, BlockName, ClientId, GovernanceRules } from './types';
import type { ComponentType } from 'react';

const LOCKED_BLOCK_STYLES = {
	opacity: 0.6,
	backgroundColor: '#eee',
	border: '2px dashed #999',
};

const GovernanceLockContext = createContext( false );

export interface BlockEditProps {
	clientId: ClientId;
	name: BlockName;
	[ key: string ]: unknown;
}

type BlockEditComponent = ComponentType< BlockEditProps >;

/** Create the governed block editor wrapper. Exported for focused integration tests. */
export function createGovernedBlockEdit(
	BlockEdit: BlockEditComponent,
	governanceRules: GovernanceRules
): BlockEditComponent {
	return function GovernedBlockEdit( props: BlockEditProps ) {
		const { name: blockName, clientId } = props;
		const isParentLocked = useContext( GovernanceLockContext );
		const parentBlockNames = useSelect(
			selectStore => {
				const { getBlockParents, getBlockName } = selectStore(
					blockEditorStore
				) as BlockEditorSelectors;
				return getBlockParents( clientId, true )
					.map( getBlockName )
					.filter( ( name ): name is BlockName => name !== undefined );
			},
			[ clientId ]
		);
		const isAllowed = isBlockAllowedForEditing(
			blockName,
			parentBlockNames,
			governanceRules,
			isParentLocked
		);

		useBlockEditingMode( isAllowed ? undefined : 'disabled' );

		if ( isAllowed ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<GovernanceLockContext.Provider value>
				<Disabled>
					<div style={ LOCKED_BLOCK_STYLES }>
						<BlockEdit { ...props } />
					</div>
				</Disabled>
			</GovernanceLockContext.Provider>
		);
	};
}

/** Register governance-driven editing restrictions with Gutenberg. */
export function setupBlockLocking( governanceRules: GovernanceRules ): void {
	addFilter(
		'editor.BlockEdit',
		'wpcomvip-governance/with-disabled-blocks',
		( BlockEdit: BlockEditComponent ) => createGovernedBlockEdit( BlockEdit, governanceRules )
	);
}

/** Determine whether a block should remain editable. */
export function isBlockAllowedForEditing(
	blockName: BlockName,
	parentBlockNames: BlockName[],
	governanceRules: GovernanceRules,
	isParentLocked: boolean
): boolean {
	if ( isParentLocked ) {
		return true;
	}

	const isAllowed = isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules );

	return applyFilters(
		'vip_governance__is_block_allowed_for_editing',
		isAllowed,
		blockName,
		parentBlockNames,
		governanceRules
	) as boolean;
}
