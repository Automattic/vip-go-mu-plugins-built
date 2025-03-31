import { registerFormatType } from '@wordpress/rich-text';

import { FieldShortcodeButton } from '@/block-editor/format-types/field-shortcode/components/FieldShortcodeButton';
import { formatTypeSettings } from '@/block-editor/format-types/field-shortcode/settings';

// Register the field shortcode format type.
registerFormatType( 'remote-data-blocks/field-shortcode', {
	...formatTypeSettings,
	edit: FieldShortcodeButton,
} );
