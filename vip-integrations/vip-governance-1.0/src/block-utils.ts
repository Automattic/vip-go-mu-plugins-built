import { applyFilters } from '@wordpress/hooks';

export { doesBlockNameMatchBlockWildcard, isBlockAllowedByBlockWildcards } from './block-matching';
import { isBlockAllowedByBlockWildcards } from './block-matching';
import { getNestedSetting } from './nested-settings-filter';

import type { BlockName, BlockSettings, GovernanceRules } from './types';

const DEFAULT_CORE_BLOCK_LIST: Readonly< Record< BlockName, readonly BlockName[] > > = {
	'core/list': [ 'core/list-item' ],
	'core/columns': [ 'core/column' ],
	'core/page-list': [ 'core/page-list-item' ],
	'core/navigation': [ 'core/navigation-link', 'core/navigation-submenu' ],
	'core/navigation-link': [ 'core/navigation-link', 'core/navigation-submenu', 'core/page-list' ],
	'core/quote': [ 'core/paragraph' ],
	'core/media-text': [ 'core/paragraph' ],
	'core/social-links': [ 'core/social-link' ],
	'core/comments-pagination': [
		'core/comments-pagination-previous',
		'core/comments-pagination-numbers',
		'core/comments-pagination-next',
	],
};

function getNestedAllowedBlocks(
	parentBlockNames: BlockName[],
	blockSettings?: BlockSettings
): BlockName[] {
	if ( ! blockSettings ) {
		return [];
	}

	const { value } = getNestedSetting( parentBlockNames, 'allowedBlocks', blockSettings );

	return Array.isArray( value ) && value.every( item => typeof item === 'string' ) ? value : [];
}

/** Determine whether a block can be inserted or edited at a hierarchy location. */
export function isBlockAllowedInHierarchy(
	blockName: BlockName,
	parentBlockNames: BlockName[],
	governanceRules: GovernanceRules
): boolean {
	const isInCascadingMode = applyFilters(
		'vip_governance__is_block_allowed_in_hierarchy',
		true,
		blockName,
		parentBlockNames,
		governanceRules
	) as boolean;

	const allowedBlocks =
		isInCascadingMode || parentBlockNames.length === 0 ? [ ...governanceRules.allowedBlocks ] : [];

	if ( parentBlockNames.length > 0 ) {
		const immediateParentDefaults = DEFAULT_CORE_BLOCK_LIST[ parentBlockNames[ 0 ] ];
		if ( immediateParentDefaults?.includes( blockName ) ) {
			return true;
		}

		allowedBlocks.push(
			...getNestedAllowedBlocks( parentBlockNames, governanceRules.blockSettings )
		);
	}

	return isBlockAllowedByBlockWildcards( blockName, allowedBlocks );
}
