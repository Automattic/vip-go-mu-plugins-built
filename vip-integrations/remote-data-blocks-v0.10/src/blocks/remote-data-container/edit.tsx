import { BlockPattern, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { Spinner } from '@wordpress/components';
import { useState } from '@wordpress/element';

import { QueryInputsPanel } from './components/panels/QueryInputsPanel';
import { InnerBlocks } from '@/blocks/remote-data-container/components/InnerBlocks';
import { DataPanel } from '@/blocks/remote-data-container/components/panels/DataPanel';
import { OverridesPanel } from '@/blocks/remote-data-container/components/panels/OverridesPanel';
import { PatternSelection } from '@/blocks/remote-data-container/components/pattern-selection/PatternSelection';
import { Placeholder } from '@/blocks/remote-data-container/components/placeholders/Placeholder';
import {
	CONTAINER_CLASS_NAME,
	DISPLAY_QUERY_KEY,
} from '@/blocks/remote-data-container/config/constants';
import { usePatterns } from '@/blocks/remote-data-container/hooks/usePatterns';
import { useRemoteData } from '@/blocks/remote-data-container/hooks/useRemoteData';
import { hasRemoteDataChanged } from '@/utils/block-binding';
import { getBlockConfig } from '@/utils/localized-block-data';
import './editor.scss';
import { migrateRemoteData } from '@/utils/remote-data';

export function Edit( props: BlockEditProps< RemoteDataBlockAttributes > ) {
	const blockName = props.name;
	const blockConfig = getBlockConfig( blockName );

	if ( ! blockConfig ) {
		throw new Error( `Block configuration not found for block: ${ blockName }` );
	}

	const rootClientId = props.clientId;
	const blockProps = useBlockProps( { className: CONTAINER_CLASS_NAME } );
	const remoteDataAttribute = migrateRemoteData( props.attributes.remoteData );

	const {
		getInnerBlocks,
		getSupportedPatterns,
		innerBlocksPattern,
		insertPatternBlocks,
		resetInnerBlocks,
	} = usePatterns( blockName, rootClientId );

	const { data, fetch, loading, reset } = useRemoteData( {
		blockName,
		externallyManagedRemoteData: remoteDataAttribute,
		externallyManagedUpdateRemoteData: updateRemoteData,
		queryKey: DISPLAY_QUERY_KEY,
	} );

	const [ showPatternSelection, setShowPatternSelection ] = useState< boolean >( false );

	function refreshRemoteData(): void {
		void fetch( remoteDataAttribute?.queryInputs ?? [ {} ] );
	}

	function resetPatternSelection(): void {
		resetInnerBlocks();
		setShowPatternSelection( false );
	}

	function resetRemoteData(): void {
		reset();
		resetPatternSelection();
	}

	function onSelectPattern( pattern: BlockPattern ): void {
		insertPatternBlocks( pattern );
		setShowPatternSelection( false );
	}
	function onSelectRemoteData( inputs: RemoteDataQueryInput[] ): void {
		void fetch( inputs ).then( () => {
			if ( innerBlocksPattern ) {
				insertPatternBlocks( innerBlocksPattern );
				return;
			}

			setShowPatternSelection( true );
		} );
	}

	function updateRemoteData( remoteData?: RemoteData ): void {
		if ( hasRemoteDataChanged( remoteDataAttribute, remoteData ) ) {
			props.setAttributes( { remoteData } );
		}
	}

	function onUpdateQueryInputs( inputs: RemoteDataQueryInput[] ): void {
		if ( ! remoteDataAttribute ) return;

		updateRemoteData( {
			...remoteDataAttribute,
			queryInputs: inputs,
		} );
		refreshRemoteData();
	}

	// No remote data has been selected yet, show a placeholder.
	if ( ! data ) {
		return (
			<div { ...blockProps }>
				<Placeholder blockConfig={ blockConfig } onSelect={ onSelectRemoteData } />
			</div>
		);
	}

	if ( showPatternSelection ) {
		const supportedPatterns = getSupportedPatterns( data.results[ 0 ] );

		return (
			<div { ...blockProps }>
				<PatternSelection
					blockName={ blockName }
					onCancel={ resetPatternSelection }
					onSelectPattern={ onSelectPattern }
					supportedPatterns={ supportedPatterns }
				/>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<OverridesPanel
					blockConfig={ blockConfig }
					remoteData={ data }
					updateRemoteData={ updateRemoteData }
				/>
				<DataPanel
					refreshRemoteData={ refreshRemoteData }
					remoteData={ data }
					resetRemoteData={ resetRemoteData }
				/>
				<QueryInputsPanel
					queryInputs={ migrateRemoteData( props.attributes.remoteData )?.queryInputs ?? [] }
					onUpdateQueryInputs={ onUpdateQueryInputs }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ loading && (
					<div className="remote-data-blocks-loading-overlay">
						<Spinner
							style={ {
								height: '50px',
								width: '50px',
							} }
						/>
					</div>
				) }
				<InnerBlocks
					blockConfig={ blockConfig }
					getInnerBlocks={ getInnerBlocks }
					remoteData={ data }
				/>
			</div>
		</>
	);
}
