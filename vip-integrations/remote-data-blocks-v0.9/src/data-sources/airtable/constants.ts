export const AIRTABLE_STRING_TYPES = Object.freeze(
	new Set( [
		'singleLineText',
		'multilineText',
		'email',
		'phoneNumber',
		'barcode',
		'singleSelect',
		'date',
		'dateTime',
		'lastModifiedTime',
		'createdTime',
		'multipleRecordLinks',
		'rollup',
		'externalSyncSource',
		'url',
	] )
);

export const AIRTABLE_NUMBER_TYPES = Object.freeze(
	new Set( [ 'number', 'autoNumber', 'rating', 'duration', 'count', 'percent' ] )
);

export const AIRTABLE_USER_TYPES = Object.freeze(
	new Set( [ 'createdBy', 'lastModifiedBy', 'singleCollaborator' ] )
);

export const SUPPORTED_AIRTABLE_TYPES = Object.freeze( [
	// String types
	'singleLineText',
	'multilineText',
	'email',
	'phoneNumber',
	'barcode',
	'singleSelect',
	'multipleSelects',
	'date',
	'dateTime',
	'lastModifiedTime',
	'createdTime',
	'multipleRecordLinks',
	'rollup',
	'externalSyncSource',
	'url',
	// Number types
	'number',
	'autoNumber',
	'rating',
	'duration',
	'count',
	'percent',
	// User types
	'createdBy',
	'lastModifiedBy',
	'singleCollaborator',
	// Markdown types
	'richText',
	// Other types
	'multipleCollaborators',
	'currency',
	'checkbox',
	'multipleAttachments',
	'formula',
	'lookup',
] );
