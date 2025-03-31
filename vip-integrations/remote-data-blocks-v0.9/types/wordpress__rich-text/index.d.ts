import { RichTextValue } from '@wordpress/rich-text';
import type { RichTextFormat as RichTextFormatFromDocBlock } from '@wordpress/rich-text/build-types/insert-object';
import type { WPFormat as WPFormatFromDocBlock } from '@wordpress/rich-text/build-types/register-format-type';

/**
 * The types provided by @wordpress/rich-text rely on incomplete docblocks.
 */

declare module '@wordpress/rich-text' {
	interface RichTextFormat extends RichTextFormatFromDocBlock {
		attributes: Record< string, string >;
		innerHTML: string;
	}

	interface WPFormat extends WPFormatFromDocBlock {
		attributes: Record< string, string >;
		contentEditable: boolean;
		object: boolean;
	}

	interface WPFormatEditProps {
		activeObjectAttributes: Record< string, string >;
		contentRef: React.MutableRefObject< HTMLElement >;
		isObjectActive: boolean;
		onChange: ( value: RichTextValue ) => void;
		onFocus: () => void;
		value: RichTextValue;
	}

	function insertObject( value: RichTextValue, format: RichTextFormat ): RichTextValue;
}
