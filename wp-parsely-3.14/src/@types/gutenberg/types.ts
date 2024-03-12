// eslint-disable-next-line import/named
import { BlockInstance } from '@wordpress/blocks';

/**
 * Defines typings for some non-exported Gutenberg functions to avoid
 * intellisense errors in function calls.
 *
 * This can be removed once Gutenberg provides typings for these functions.
 *
 * @since 3.12.0
 */
export interface GutenbergFunction {
	getEditedPostAttribute( attribute: string ): string;
	getEditedPostContent(): string;
	getSelectedBlock(): BlockInstance | null;
	getBlock( clientId: string ): BlockInstance | null;
	getBlocks(): BlockInstance[];
	getPermalink(): string | null;
}

