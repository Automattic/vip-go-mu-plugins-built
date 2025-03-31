import { BlockConfiguration } from '@wordpress/blocks';

import {
	REMOTE_DATA_CONTEXT_KEY,
	SUPPORTED_CORE_BLOCKS,
} from '@/blocks/remote-data-container/config/constants';

export function addUsesContext(
	settings: BlockConfiguration< RemoteDataInnerBlockAttributes >,
	name: string
) {
	if ( ! SUPPORTED_CORE_BLOCKS.includes( name ) ) {
		return settings;
	}

	const { usesContext = [] } = settings;

	if ( ! usesContext?.includes( REMOTE_DATA_CONTEXT_KEY ) ) {
		return {
			...settings,
			usesContext: [ ...usesContext, REMOTE_DATA_CONTEXT_KEY ],
		};
	}

	return settings;
}
