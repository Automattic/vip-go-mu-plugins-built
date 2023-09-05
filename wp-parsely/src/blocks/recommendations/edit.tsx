/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { LeafIcon } from '../../content-helper/common/icons/leaf-icon';
import json from './block.json';
import { ParselyRecommendations } from './components/parsely-recommendations';
import { ParselyRecommendationsInspectorControls } from './components/parsely-recommendations-inspector-controls';
import './editor.scss';
import { RecommendationsAttributes } from './models/RecommendationsAttributes';
import { RecommendationsStore } from './recommendations-store';
import './style.scss';

interface ParselyRecommendationsEditProps {
	clientId: string;
	attributes: RecommendationsAttributes;
	setAttributes: ( attr: Partial<RecommendationsAttributes> ) => void
}

const { name, attributes } = json;

export const ParselyRecommendationsEdit = ( editProps: ParselyRecommendationsEditProps ) => (
	<div { ...useBlockProps() }>
		<RecommendationsStore clientId={ editProps.clientId }>
			<ParselyRecommendationsInspectorControls { ...editProps } />
			<ParselyRecommendations { ...editProps.attributes } isEditMode={ true } />
		</RecommendationsStore>
	</div>
);

// @ts-ignore
registerBlockType( name, {
	apiVersion: 2,
	icon: LeafIcon,
	category: 'widgets',
	edit: ParselyRecommendationsEdit,
	example: {
		attributes: {
			preview: true,
		},
	},
	attributes: {
		...attributes,
		title: {
			type: 'string',
			default: __( 'Related Content', 'wp-parsely' ),
		},
	},
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/legacy-widget' ],
				// @ts-ignore
				isMatch: ( { idBase, instance } ) => {
					if ( ! instance?.raw ) {
						// Can't transform if raw instance is not shown in REST API.
						return false;
					}
					return idBase === 'Parsely_Recommended_Widget';
				},
				// @ts-ignore
				transform: ( { instance } ) => {
					return createBlock( 'wp-parsely/recommendations', {
						name: instance.raw.name,
					} );
				},
			},
		],
	},
} );
