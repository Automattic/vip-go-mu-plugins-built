import { applyFilters } from '@wordpress/hooks';
import { getNestedSetting } from './nested-governance-loader';

// The list of default core blocks that should be allowed to be inserted, in order to make life easier.
const DEFAULT_CORE_BLOCK_LIST = {
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

/**
 * Given a block name, a parent list and a set of governance rules, determine if
 * the block can be inserted.
 *
 * By default, will return if the block is allowed to be inserted at the root level
 * per the user's rules. If a parent block contains a rule for allowedBlocks,
 * the function will return if the block is allowed as a child of that parent.
 *
 * Rules declared in allowedBlocks will override root level rules when the block
 * is currently a child of the parent with allowedBlocks.
 *
 * @param {string}   blockName        The current block's name.
 * @param {string[]} parentBlockNames A list of zero or more parent block names,
 *                                    starting with the most recent parent ancestor.
 * @param {Object}   governanceRules  An object containing the full set of governance
 *                                    rules for the current user.
 * @returns True if the block is allowed in set of parent blocks, or false otherwise.
 */
export function isBlockAllowedInHierarchy( blockName, parentBlockNames, governanceRules ) {
	// Filter to decide if the mode should be cascading or restrictive, where true is cascading and false is restrictive.
	const isInCascadingMode = applyFilters(
		'vip_governance__is_block_allowed_in_hierarchy',
		true,
		blockName,
		parentBlockNames,
		governanceRules
	);

	// Build the blocks that are allowed using the root level blocks for cascading mode or if no parent has been past, or empty otherwise.
	const blocksAllowedToBeInserted =
		isInCascadingMode || parentBlockNames.length === 0 ? [ ...governanceRules.allowedBlocks ] : [];

	// Only execute this if we are determining the block under a parent.
	if ( parentBlockNames.length > 0 ) {
		// Shortcircuit the parent-child hierarchy for some core blocks
		if (
			DEFAULT_CORE_BLOCK_LIST[ parentBlockNames[ 0 ] ] &&
			DEFAULT_CORE_BLOCK_LIST[ parentBlockNames[ 0 ] ].includes( blockName )
		) {
			return true;
		}

		// Only do a search if there are block settings to search through.
		if ( governanceRules.blockSettings ) {
			// Get the child block's parent block settings at whatever depth its located at.
			const nestedSetting = getNestedSetting(
				parentBlockNames.reverse(),
				'allowedBlocks',
				governanceRules.blockSettings
			);

			// If we found the allowedBlocks for the parent block, add that to the array of blocks that can be inserted.
			if ( nestedSetting && nestedSetting.value ) {
				blocksAllowedToBeInserted.push( ...nestedSetting.value );
			}
		}
	}

	// Check if the block is allowed using the array of blocks that can be inserted.
	return isBlockAllowedByBlockRegexes( blockName, blocksAllowedToBeInserted );
}

/**
 * Matches a block name to a list of block regex rules.
 * For regex rules, see doesBlockNameMatchBlockRegex().
 *
 * @param {string} blockName
 * @param {string[]} rules
 * @returns True if the block name matches any of the rules, false otherwise.
 */
export function isBlockAllowedByBlockRegexes( blockName, rules ) {
	return rules.some( rule => doesBlockNameMatchBlockRegex( blockName, rule ) );
}

/**
 * Matches a rule to a block name, with the following cases being possible:
 *
 * 1. ['*'] - matches all blocks
 * 2. '*' can be located somewhere else alongside a string, e.g. 'core/*' - matches all core blocks
 * 3. ['core/paragraph'] - matches only the core/paragraph block
 *
 * @param {string} blockName
 * @param {string} rule
 * @returns True if the block name matches the rule, or false otherwise
 */
export function doesBlockNameMatchBlockRegex( blockName, rule ) {
	if ( rule.includes( '*' ) ) {
		// eslint-disable-next-line security/detect-non-literal-regexp
		return blockName.match( new RegExp( rule.replace( '*', '.*' ) ) );
	}

	return rule === blockName;
}
