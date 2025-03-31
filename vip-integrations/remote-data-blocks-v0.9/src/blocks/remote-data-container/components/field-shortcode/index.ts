import { WPFormat } from '@wordpress/rich-text';

export const formatName = 'remote-data-blocks/inline-field';

export const formatTypeSettings: WPFormat = {
	attributes: {
		'data-query': 'data-query',
	},
	className: null,
	contentEditable: false,
	edit: () => null, // avoid circular import
	interactive: true,
	name: formatName,
	object: false,
	tagName: 'remote-data-blocks-inline-field',
	title: 'Field Shortcode',
} as WPFormat;
