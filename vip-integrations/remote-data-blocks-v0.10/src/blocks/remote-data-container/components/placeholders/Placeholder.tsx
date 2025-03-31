import { IconType, Placeholder as PlaceholderComponent } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';

import { ItemSelectQueryType } from '@/blocks/remote-data-container/components/placeholders/ItemSelectQueryType';

interface PlaceholderProps {
	blockConfig: BlockConfig;
	onSelect: ( data: RemoteDataQueryInput[] ) => void;
}

export function Placeholder( props: PlaceholderProps ) {
	const { blockConfig, onSelect } = props;
	const { instructions, loop, settings } = blockConfig;

	const iconElement: IconType = ( settings.icon as IconType ) ?? cloud;

	const defaultInstructions = loop
		? __( 'This block displays a list of items.' )
		: __( 'This block requires selection of one or more items for display.' );

	return (
		<PlaceholderComponent
			icon={ iconElement }
			label={ settings.title }
			instructions={ instructions ?? defaultInstructions }
		>
			<ItemSelectQueryType blockConfig={ blockConfig } onSelect={ onSelect } />
		</PlaceholderComponent>
	);
}
