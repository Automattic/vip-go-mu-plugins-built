interface InnerBlockContext {
	index: number;
}

interface RemoteDataPagination {
	cursorNext?: string;
	cursorPrevious?: string;
	hasNextPage?: boolean;
	perPage?: number;
	totalItems?: number;
}

interface RemoteDataResultFields {
	name: string;
	type: string;
	value: unknown;
}

type RemoteDataQueryInput = Record< string, unknown >;

// This interface mirrors the schema of RemoteDataBlockAttribute.
interface RemoteData {
	blockName: string;
	enabledOverrides?: string[];
	metadata: Record< string, RemoteDataResultFields >;
	pagination?: RemoteDataPagination;
	/** @deprecated */
	queryInput?: RemoteDataQueryInput;
	queryInputs: RemoteDataQueryInput[];
	queryKey?: string;
	resultId: string;
	results: RemoteDataApiResult[];
}

interface RemoteDataBlockAttributes {
	remoteData?: RemoteData;
}

interface FieldSelection {
	action: 'add_field_shortcode' | 'update_field_shortcode' | 'reset_field_shortcode';
	remoteData?: Pick< RemoteData, 'blockName' | 'metadata' | 'queryInputs' | 'queryKey' >;
	selectedField: string;
	selectionPath: 'select_new_tab' | 'select_existing_tab' | 'select_meta_tab' | 'popover';
	type: 'field' | 'meta';
}

interface MetaFieldSelection extends FieldSelection {
	selectedField: 'last_updated' | 'total_count';
}

interface RemoteDataBlockBindingArgs {
	block: string;
	field: string;
	label?: string;
}

interface RemoteDataBlockBinding {
	source: string;
	args: RemoteDataBlockBindingArgs;
}

interface StringSeriablizable {
	toString(): string;
}

interface RemoteDataInnerBlockAttributes {
	alt?: string | StringSeriablizable;
	className?: string;
	content?: string | StringSeriablizable;
	index?: number;
	metadata?: {
		bindings?: Record< string, RemoteDataBlockBinding >;
		name?: string;
	};
	url?: string | StringSeriablizable;
}

interface RemoteDataApiRequest {
	block_name: string;
	query_inputs: RemoteDataQueryInput[];
	query_key: string;
}

interface RemoteDataApiResult {
	result: Record< string, RemoteDataResultFields >;
	uuid: string;
}

interface RemoteDataApiResponseBody {
	block_name: string;
	metadata: Record< string, RemoteDataResultFields >;
	pagination?: {
		cursor_next?: string;
		cursor_previous?: string;
		has_next_page?: boolean;
		total_items?: number;
	};
	query_inputs: RemoteDataQueryInput[];
	query_key: string;
	result_id: string;
	results: RemoteDataApiResult[];
}

interface RemoteDataApiResponse {
	body?: RemoteDataApiResponseBody;
	status?: number;
}
