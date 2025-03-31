import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { DropdownMenuProps } from '@wordpress/components/build-types/dropdown-menu/types';
import { __ } from '@wordpress/i18n';
import { chevronRightSmall } from '@wordpress/icons';

import { DataViewsModal } from '../modals/DataViewsModal';
import { getBlocksConfig } from '@/utils/localized-block-data';

type FieldShortcodeSelectNewProps = Omit< DropdownMenuProps, 'label' > & {
	onSelectField: ( data: FieldSelection, fieldValue: string ) => void;
	label?: string;
};

export function FieldShortcodeSelectNew( props: FieldShortcodeSelectNewProps ) {
	const { onSelectField, ...restProps } = props;
	const blockConfigs = getBlocksConfig();
	const nonLoopBlocks = Object.values( blockConfigs ).filter( ( { loop } ) => ! loop );
	const blocksByType = nonLoopBlocks.reduce<
		Record< string, Array< BlocksConfig[ keyof BlocksConfig ] > >
	>( ( source, blockConfig ) => {
		const type = blockConfig.dataSourceType;
		if ( ! source[ type ] ) {
			source[ type ] = [];
		}
		source[ type ].push( blockConfig );
		return source;
	}, {} );

	return (
		<DropdownMenu
			icon={ chevronRightSmall }
			label=""
			text={ __( 'Select an item', 'remote-data-blocks' ) }
			popoverProps={ {
				className: 'remote-data-blocks-field-shortcode-dropdown remote-data-blocks-select-new',
				placement: 'right-start',
				offset: 0,
			} }
			{ ...restProps }
		>
			{ () =>
				Object.entries( blocksByType ).map( ( [ dataSourceType, configs ] ) => (
					<MenuGroup key={ dataSourceType } label={ dataSourceType }>
						{ configs.map( blockConfig => {
							// For now, we will use the first compatible selector, but this
							// should be improved.
							const compatibleSelector = blockConfig.selectors.find( selector =>
								[ 'list', 'search' ].includes( selector.type )
							);

							if ( ! compatibleSelector ) {
								return null;
							}

							return (
								<DataViewsModal
									key={ blockConfig.name }
									blockName={ blockConfig.name }
									headerImage={ compatibleSelector.image_url }
									onSelectField={ onSelectField }
									queryKey={ compatibleSelector.query_key }
									renderTrigger={ ( { onClick } ) => (
										<MenuItem onClick={ onClick }>
											{ blockConfig.settings?.title ?? blockConfig.name }
										</MenuItem>
									) }
								/>
							);
						} ) }
					</MenuGroup>
				) )
			}
		</DropdownMenu>
	);
}
