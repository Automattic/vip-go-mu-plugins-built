import { __, sprintf } from '@wordpress/i18n';

import {
	GoogleDriveFile,
	GoogleDriveFileList,
	GoogleSheetIdName,
	GoogleSheetsValueRange,
	GoogleSheetWithFields,
	GoogleSpreadsheet,
	GoogleSpreadsheetFields,
} from '@/types/google';
import { SelectOption } from '@/types/input';

export class GoogleApi {
	private static SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4';
	private static DRIVE_BASE_URL = 'https://www.googleapis.com/drive/v3';

	constructor( private token: string | null ) {}

	private getAuthHeaders() {
		if ( ! this.token ) {
			throw new Error( 'No token provided' );
		}

		return {
			Authorization: `Bearer ${ this.token }`,
		};
	}

	private async fetchApi< T >( url: string, options: RequestInit = {} ): Promise< T > {
		const response = await fetch( url, {
			...options,
			headers: {
				...( options.headers ?? {} ),
				...this.getAuthHeaders(),
			},
		} );

		if ( ! response.ok ) {
			const errorText = `${ response.status } - ${ await response.text() }`;
			throw new Error( `[Google API] ${ sprintf( __( 'Error: %s' ), errorText ) }` );
		}

		return response.json() as Promise< T >;
	}

	private async getSpreadsheetList(): Promise< GoogleDriveFile[] > {
		const spreadsheetsMimeType = 'application/vnd.google-apps.spreadsheet';
		const query = `mimeType='${ spreadsheetsMimeType }'`;
		const url = `${ GoogleApi.DRIVE_BASE_URL }/files?q=${ encodeURIComponent( query ) }`;
		const result = await this.fetchApi< GoogleDriveFileList >( url );

		return result.files ?? [];
	}

	public async getSpreadsheetsOptions(): Promise< SelectOption[] > {
		const spreadsheets = await this.getSpreadsheetList();
		return spreadsheets.map( spreadsheet => ( {
			label: spreadsheet.name,
			value: spreadsheet.id,
		} ) );
	}

	public async getSpreadsheet( spreadsheetId: string ): Promise< GoogleSpreadsheet > {
		const url = `${ GoogleApi.SHEETS_BASE_URL }/spreadsheets/${ spreadsheetId }`;
		const result = await this.fetchApi< GoogleSpreadsheet >( url );
		return result;
	}

	private async getSheetValues(
		spreadsheetId: string,
		sheetTitle: string,
		cellRange: string
	): Promise< GoogleSheetsValueRange > {
		const range = encodeURIComponent( `${ sheetTitle }!${ cellRange }` );
		const url = `${ GoogleApi.SHEETS_BASE_URL }/spreadsheets/${ spreadsheetId }/values/${ range }`;
		const result = await this.fetchApi< GoogleSheetsValueRange >( url );
		return result;
	}

	public async getSheetFields( spreadsheetId: string, sheetTitle: string ): Promise< string[] > {
		const values = await this.getSheetValues( spreadsheetId, sheetTitle, 'A1:Z1' );
		if ( ! values?.values?.length ) {
			return [];
		}
		return values.values[ 0 ] ?? [];
	}

	/**
	 * Get all fields for all sheets in a spreadsheet.
	 *
	 * @param spreadsheetId - The ID of the spreadsheet.
	 * @returns A Map with sheet titles as keys and their corresponding fields as values.
	 */
	public async getSpreadsheetFields(
		spreadsheetId: string,
		sheets: GoogleSheetIdName[]
	): Promise< Map< string, string[] > > {
		const fields = await Promise.all(
			sheets.map( sheet => this.getSheetFields( spreadsheetId, sheet.name ) )
		);

		return new Map( sheets.map( ( sheet, index ) => [ sheet.name, fields.at( index ) ?? [] ] ) );
	}

	/**
	 * Get all sheets with their corresponding fields.
	 *
	 * @param spreadsheetId - The ID of the spreadsheet.
	 * @returns An object with sheet titles as keys and their corresponding fields as values.
	 */
	public async getSheetsWithFieldNames(
		spreadsheetId: string
	): Promise< GoogleSpreadsheetFields > {
		const spreadsheet = await this.getSpreadsheet( spreadsheetId );
		const sheets: GoogleSheetIdName[] = spreadsheet.sheets.map( sheet => ( {
			id: sheet.properties.sheetId,
			name: sheet.properties.title,
		} ) );

		const sheetFields = await this.getSpreadsheetFields( spreadsheetId, sheets );

		const sheetsWithFields = new Map< string, GoogleSheetWithFields >();
		sheets.forEach( sheet => {
			const fields = sheetFields.get( sheet.name ) ?? [];

			if ( fields.length ) {
				/**
				 * Only include sheets that have fields.
				 */
				sheetsWithFields.set( sheet.name, {
					...sheet,
					fields,
				} );
			}
		} );

		return sheetsWithFields;
	}
}
