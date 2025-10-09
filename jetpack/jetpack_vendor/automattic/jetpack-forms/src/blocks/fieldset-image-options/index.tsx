/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import edit from './edit';
import icon from './icon';
import save from './save';

const name = 'fieldset-image-options';

const settings = {
	apiVersion: 3,
	title: __( 'Image Options', 'jetpack-forms' ),
	description: __( 'A list of image options for an image select field.', 'jetpack-forms' ),
	icon,
	parent: [ 'jetpack/field-image-select' ],
	allowedBlocks: [ 'jetpack/input-image-option' ],
	edit,
	save,
};

export default {
	name,
	settings,
};
