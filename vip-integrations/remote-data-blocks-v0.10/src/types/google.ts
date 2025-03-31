import { NumberIdName } from '@/types/common';

// Google Drive
export interface GoogleDriveFile {
	kind: 'drive#file';
	mimeType: string;
	id: string;
	name: string;
}

export interface GoogleDriveFileList {
	kind: 'drive#fileList';
	incompleteSearch: boolean;
	files: GoogleDriveFile[];
}

// Spreadsheet related interfaces and types

export interface GoogleSpreadsheet {
	spreadsheetId: string;
	properties: GoogleSpreadsheetProperties;
	sheets: GoogleSheet[];
	spreadsheetUrl: string;
}

interface GoogleSpreadsheetProperties {
	title: string;
	locale: string;
	timeZone: string;
	autoRecalc?: RecalculationInterval;
	defaultFormat?: Record< string, unknown >;
	iterativeCalculationSettings?: Record< string, unknown >;
	spreadsheetTheme?: Record< string, unknown >;
}

type RecalculationInterval = 'RECALCULATION_INTERVAL_UNSPECIFIED' | 'ON_CHANGE' | 'MINUTE' | 'HOUR';

// Sheet related interfaces

interface GoogleSheet {
	properties: GoogleSheetProperties;
}

interface GoogleSheetProperties {
	sheetId: number;
	title: string;
	index: number;
	sheetType: SheetType;
	gridProperties?: GridProperties;
	hidden?: boolean;
	tabColor?: Record< string, unknown >;
	rightToLeft?: boolean;
	dataSourceSheetProperties?: Record< string, unknown >;
}

type SheetType = 'SHEET_TYPE_UNSPECIFIED' | 'GRID' | 'OBJECT' | 'DATA_SOURCE';

interface GridProperties {
	rowCount: number;
	columnCount: number;
	frozenRowCount?: number;
	frozenColumnCount?: number;
	hideGridlines?: boolean;
	rowGroupControlAfter?: boolean;
	columnGroupControlAfter?: boolean;
}

export type GoogleSheetsValues = string[];

export interface GoogleSheetsValueRange {
	range: string;
	majorDimension: 'ROWS' | 'COLUMNS' | 'DIMENSION_UNSPECIFIED';
	values: GoogleSheetsValues[];
}

// Derived Google Sheet types

export type GoogleSheetIdName = NumberIdName;

export type GoogleSheetWithFields = GoogleSheetIdName & {
	fields: string[];
};

export type GoogleSpreadsheetFields = Map< string, GoogleSheetWithFields >;

// Service Account
export interface GoogleServiceAccountKey {
	[ key: string ]: string;
	type: 'service_account';
	project_id: string;
	private_key: string;
	client_email: string;
	token_uri: string;
}

export type GoogleCredentials = GoogleServiceAccountKey;
