declare module '@wordpress/block-editor' {
	export type BlockEditingMode = 'disabled' | 'contentOnly' | 'default';

	export const store: never;
	export function useBlockEditingMode( mode?: BlockEditingMode ): BlockEditingMode;
}
