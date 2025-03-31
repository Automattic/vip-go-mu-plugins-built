import { SEARCH_INPUT_VARIABLE_TYPE } from '@/blocks/remote-data-container/config/constants';
import { useDebouncedState } from '@/hooks/useDebouncedState';

interface UseSearchVariables {
	hasSearchInput: boolean;
	searchInput: string;
	searchQueryInput: RemoteDataQueryInput;
	setSearchInput: ( searchInput: string ) => void;
	supportsSearch: boolean;
}

interface UseSearchVariablesInput {
	initialSearchInput?: string;
	inputVariables: InputVariable[];
	searchInputDelayInMs?: number;
}

export function useSearchVariables( {
	initialSearchInput = '',
	inputVariables,
	searchInputDelayInMs = 500,
}: UseSearchVariablesInput ): UseSearchVariables {
	const [ searchInput, setSearchInput ] = useDebouncedState< string >(
		searchInputDelayInMs,
		initialSearchInput
	);

	const inputVariable = inputVariables?.find( input => input.type === SEARCH_INPUT_VARIABLE_TYPE );
	const supportsSearch = Boolean( inputVariable );
	const searchAllowsEmptyInput = supportsSearch && ! inputVariable?.required;
	const hasSearchInput = supportsSearch && Boolean( searchInput || searchAllowsEmptyInput );

	return {
		hasSearchInput,
		searchInput,
		searchQueryInput: supportsSearch
			? { [ inputVariable?.slug ?? '' ]: hasSearchInput ? searchInput : null }
			: {},
		setSearchInput: supportsSearch ? setSearchInput : () => {},
		supportsSearch,
	};
}
