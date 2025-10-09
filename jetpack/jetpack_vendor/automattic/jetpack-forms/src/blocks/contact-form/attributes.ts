/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export default {
	subject: {
		type: 'string',
		default: window.jpFormsBlocks?.defaults?.subject || '',
	},
	to: {
		type: 'string',
		default: window.jpFormsBlocks?.defaults?.to || '',
	},
	customThankyou: {
		type: 'string',
		default: '',
	},
	customThankyouHeading: {
		type: 'string',
		default: __( 'Your message has been sent', 'jetpack-forms' ),
	},
	customThankyouMessage: {
		type: 'string',
		default: '',
	},
	customThankyouRedirect: {
		type: 'string',
		default: '',
	},
	jetpackCRM: {
		type: 'boolean',
	},
	formTitle: {
		type: 'string',
		default: '',
	},
	variationName: {
		type: 'string',
		default: '',
	},
	salesforceData: {
		type: 'object',
		default: {
			organizationId: '',
		},
	},
	mailpoet: {
		type: 'object',
		default: {
			listId: null,
			listName: null,
		},
	},
	saveResponses: {
		type: 'boolean',
		default: true,
	},
	emailNotifications: {
		type: 'boolean',
		default: true,
	},
	disableGoBack: {
		type: 'boolean',
		default: false,
	},
};
