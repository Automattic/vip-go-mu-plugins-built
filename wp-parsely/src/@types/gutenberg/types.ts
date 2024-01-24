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
}
