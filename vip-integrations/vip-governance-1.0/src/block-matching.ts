import type { BlockName } from './types';

type BlockRuleMatch = boolean | RegExpMatchArray | null;

/** Match a block name using the plugin's legacy wildcard semantics. */
export function doesBlockNameMatchBlockWildcard(
	blockName: BlockName,
	rule: string
): BlockRuleMatch {
	if ( rule.includes( '*' ) ) {
		// Keep compatibility with existing rules: only the first wildcard is expanded,
		// other regular-expression syntax remains active, and matching is not anchored.
		// eslint-disable-next-line security/detect-non-literal-regexp
		return blockName.match( new RegExp( rule.replace( '*', '.*' ) ) );
	}

	return rule === blockName;
}

/** Return whether a block name matches at least one rule. */
export function isBlockAllowedByBlockWildcards(
	blockName: BlockName,
	rules: readonly string[]
): boolean {
	return rules.some( rule => doesBlockNameMatchBlockWildcard( blockName, rule ) );
}
