import { ButtonGroup, Button } from '@wordpress/components';

import { InputModal } from '../modals/InputModal';
import { InputPopover } from '../popovers/InputPopover';
import { DataViewsModal } from '@/blocks/remote-data-container/components/modals/DataViewsModal';

interface ItemSelectQueryTypeProps {
	blockConfig: BlockConfig;
	onSelect: ( data: RemoteDataQueryInput[] ) => void;
}

export function ItemSelectQueryType( props: ItemSelectQueryTypeProps ) {
	const {
		blockConfig: { name: blockName, selectors },
		onSelect,
	} = props;

	return (
		<ButtonGroup className="remote-data-blocks-button-group">
			{ selectors.map( selector => {
				const title = selector.name;
				const selectorProps = {
					blockName,
					headerImage: selector.image_url,
					inputVariables: selector.inputs,
					onSelect,
					queryKey: selector.query_key,
					title,
				};

				switch ( selector.type ) {
					case 'search':
					case 'list':
						return (
							<DataViewsModal
								className="rdb-editor_dataviews-modal-item-select"
								key={ title }
								{ ...selectorProps }
							/>
						);
					case 'collection':
						return (
							<Button key={ title } onClick={ () => onSelect( [ {} ] ) } variant="primary">
								{ selector.name }
							</Button>
						);
					case 'input':
						if ( selector.inputs.length === 1 && selector.inputs[ 0 ] ) {
							return (
								<InputPopover
									key={ title }
									input={ selector.inputs[ 0 ] }
									{ ...selectorProps }
									title={ selector.inputs[ 0 ].name ?? selector.name }
								/>
							);
						}
						return <InputModal key={ title } inputs={ selector.inputs } { ...selectorProps } />;
				}

				return null;
			} ) }
		</ButtonGroup>
	);
}
