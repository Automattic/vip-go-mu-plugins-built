import {
	AIRTABLE_STRING_TYPES,
	AIRTABLE_NUMBER_TYPES,
	AIRTABLE_USER_TYPES,
} from '@/data-sources/airtable/constants';
import { AirtableField } from '@/data-sources/airtable/types';
import { DataSourceQueryMappingValue } from '@/data-sources/types';

const getAirtableFieldOutputQueryMappingValue = (
	field: AirtableField
): DataSourceQueryMappingValue => {
	const baseField = {
		path: `$.fields["${ field.name }"]`,
		name: field.name,
		key: field.name,
	};

	if ( AIRTABLE_STRING_TYPES.has( field.type ) ) {
		return { ...baseField, type: 'string' };
	}

	if ( AIRTABLE_NUMBER_TYPES.has( field.type ) ) {
		return { ...baseField, type: 'number' };
	}

	if ( AIRTABLE_USER_TYPES.has( field.type ) ) {
		return { ...baseField, path: `$.fields["${ field.name }"].name`, type: 'string' };
	}

	switch ( field.type ) {
		case 'richText':
			return { ...baseField, type: 'markdown' };

		case 'currency':
			return {
				...baseField,
				type: 'currency_in_current_locale',
				// Symbol is not enough information for proper currency formatting that
				// respects the user's locale. We will table proper formatting until
				// we understand use cases better.
				// prefix: field.options?.symbol,
			};

		case 'checkbox':
			return { ...baseField, type: 'boolean' };

		case 'multipleSelects':
			return {
				...baseField,
				path: `$.fields["${ field.name }"][*]`,
				type: 'string',
			};

		case 'multipleRecordLinks':
			return {
				...baseField,
				path: `$.fields["${ field.name }"][*].id`,
				type: 'string',
			};

		case 'multipleAttachments':
			return {
				...baseField,
				path: `$.fields["${ field.name }"][0].url`,
				type: 'image_url',
			};

		case 'multipleCollaborators':
			return {
				...baseField,
				path: `$.fields["${ field.name }"][*].name`,
				type: 'string',
			};

		case 'formula':
		case 'lookup':
			if ( field.options?.result?.type ) {
				return getAirtableFieldOutputQueryMappingValue( {
					...field,
					type: field.options.result.type,
				} );
			}
			return { ...baseField, type: 'string' };

		default:
			return { ...baseField, type: 'string' };
	}
};

export const getAirtableOutputQueryMappingValues = (
	fields: AirtableField[]
): DataSourceQueryMappingValue[] => {
	return fields.map( field => getAirtableFieldOutputQueryMappingValue( field ) );
};
