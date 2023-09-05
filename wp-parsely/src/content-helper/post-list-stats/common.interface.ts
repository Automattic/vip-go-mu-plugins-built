export interface ParselyAPIError {
	error: ParselyAPIErrorInfo | null;
}

export interface ParselyAPIErrorInfo {
	code: number;
	message: string;
	htmlMessage: string;
}
