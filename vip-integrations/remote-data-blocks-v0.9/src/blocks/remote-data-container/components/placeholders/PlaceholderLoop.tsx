import { Button, Placeholder } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';

interface PlaceholderLoopProps {
	blockConfig: BlockConfig;
	onSelect: ( data: RemoteDataQueryInput ) => void;
}

export function PlaceholderLoop( props: PlaceholderLoopProps ) {
	const {
		blockConfig: {
			settings: { title },
		},
		onSelect,
	} = props;

	return (
		<Placeholder
			icon={ cloud }
			label={ title }
			instructions={ __( 'This block displays a list of items.' ) }
		>
			<Button onClick={ () => onSelect( {} ) } variant="primary">
				{ __( 'Load items' ) }
			</Button>
		</Placeholder>
	);
}
