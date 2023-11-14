/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	PanelRow,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { RecommendationsAttributes } from '../models/RecommendationsAttributes';

interface ParselyRecommendationsInspectorControlsProps {
	attributes: RecommendationsAttributes,
	setAttributes: ( attr: Partial<RecommendationsAttributes> ) => void,
}

export const ParselyRecommendationsInspectorControls = ( {
	attributes: { imagestyle, limit, openlinksinnewtab, showimages, sort, title },
	setAttributes,
} : ParselyRecommendationsInspectorControlsProps ) => {
	function setImageStyle( value: string ): void {
		setAttributes( {
			imagestyle: value === 'original' ? 'original' : 'thumbnail',
		} );
	}

	return <InspectorControls>
		<PanelBody title="Settings" initialOpen={ true }>
			<PanelRow>
				<TextControl
					label={ __( 'Title', 'wp-parsely' ) }
					value={ title }
					onChange={ ( value: string ): void => setAttributes( { title: value } ) }
				/>
			</PanelRow>
			<PanelRow>
				<RangeControl
					label={ __( 'Maximum Results', 'wp-parsely' ) }
					min={ 1 }
					max={ 25 }
					onChange={ ( value: number | undefined ): void => setAttributes( { limit: value } ) }
					value={ limit }
				/>
			</PanelRow>
			<PanelRow>
				<ToggleControl
					label={ __( 'Open Links in New Tab', 'wp-parsely' ) }
					checked={ openlinksinnewtab }
					onChange={ (): void => setAttributes( { openlinksinnewtab: ! openlinksinnewtab } ) }
				/>
			</PanelRow>
			<PanelRow>
				<ToggleControl
					label={ __( 'Show Images', 'wp-parsely' ) }
					help={
						showimages
							? __( 'Showing images', 'wp-parsely' )
							: __( 'Not showing images', 'wp-parsely' )
					}
					checked={ showimages }
					onChange={ (): void => setAttributes( { showimages: ! showimages } ) }
				/>
			</PanelRow>
			{ showimages && (
				<PanelRow>
					<RadioControl
						label={ __( 'Image style', 'wp-parsely' ) }
						selected={ imagestyle }
						options={ [
							{ label: __( 'Original image', 'wp-parsely' ), value: 'original' },
							{ label: __( 'Thumbnail from Parse.ly', 'wp-parsely' ), value: 'thumbnail' },
						] }
						onChange={ setImageStyle }
					/>
				</PanelRow>
			) }
			<PanelRow>
				<SelectControl
					label={ __( 'Sort Recommendations', 'wp-parsely' ) }
					value={ sort }
					options={ [
						{
							label: __( 'Score', 'wp-parsely' ),
							value: 'score',
						},
						{
							label: __( 'Publication Date', 'wp-parsely' ),
							value: 'pub_date',
						},
					] }
					onChange={ ( value: string ): void => setAttributes( { sort: value } ) }
				/>
			</PanelRow>
		</PanelBody>
	</InspectorControls>;
};
