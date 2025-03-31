export interface AirtableBase {
	id: string;
	name: string;
	permissionLevel: 'none' | 'read' | 'comment' | 'edit' | 'create';
}

export interface AirtableBasesResult {
	offset?: string;
	bases: AirtableBase[];
}

export interface AirtableBaseSchema {
	tables: AirtableTable[];
}

export interface AirtableTable {
	id: string;
	name: string;
	primaryFieldId: string;
	fields: AirtableField[];
	views: AirtableView[];
	description: string | null;
	createTime: string;
	syncStatus: 'complete' | 'pending';
}

/**
 * Represents an Airtable field configuration.
 * @see https://airtable.com/developers/web/api/model/table-model#fields
 */
export interface AirtableField {
	id: string;
	name: string;
	type: string;
	description: string | null;
	options?: {
		choices?: Array< {
			id: string;
			name: string;
			color?: string;
		} >;
		precision?: number;
		symbol?: string;
		format?: string;
		foreignTableId?: string;
		relationship?: 'many' | 'one';
		symmetricColumnId?: string;
		result?: {
			type: string;
			options?: {
				precision?: number;
				symbol?: string;
				format?: string;
			};
		};
	};
}

interface AirtableView {
	id: string;
	name: string;
	type: 'grid' | 'form' | 'calendar' | 'gallery' | 'kanban' | 'timeline' | 'block';
}

export interface AirtableApiArgs {
	token: string;
}

export interface AirtableBaseOption {
	id: string;
	name: string;
}
