/**
 * WordPress dependencies
 */
import {
	transformStyles,
	store as blockEditorStore,
	EditorStyle,
	BlockEditorStoreSelectors,
	useBlockProps,
} from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { SandBox, Placeholder } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

import { __ } from '@/utils/i18n';

import './editor.scss';

/**
 * This block is based on the official core/html block from Gutenberg.
 * The main difference is that this block binds to HTML from remote data block context instead of user input.
 */

// Default styles used to unset some of the styles
// that might be inherited from the editor style.
const DEFAULT_STYLES = `
	html,body,:root {
		margin: 0 !important;
		padding: 0 !important;
		overflow: visible !important;
		min-height: auto !important;
	}
`;

interface RemoteHtmlAttributes extends RemoteDataInnerBlockAttributes {
	saveContent?: string;
}

export function Edit( props: BlockEditProps< RemoteHtmlAttributes > ): JSX.Element {
	const { attributes, setAttributes, isSelected } = props;
	const blockProps = useBlockProps();

	// HACK:
	// The remote data binding passes merged remote attributes into the Edit component,
	// but the Save component does not receive the same augmented attributes. In order to
	// persist fallback content during save, we need to store the content in an attribute
	// (saveContent) and call setAttributes to expose it to Save.
	//
	// This should be removed once we replace mergedAttributes/getMismatchedAttributes()
	// with a getValues() implementation.
	const { content } = attributes;
	useEffect( () => {
		if ( content !== undefined ) {
			setAttributes( { saveContent: content.toString() } );
		}
	}, [ content, setAttributes ] );

	const settingStyles = useSelect< BlockEditorStoreSelectors, EditorStyle[] >(
		select => select( blockEditorStore ).getSettings().styles,
		[]
	);

	const styles = [
		DEFAULT_STYLES,
		...transformStyles( ( settingStyles ?? [] ).filter( ( style: EditorStyle ) => style.css ) ),
	];

	const hasBindings = attributes?.metadata?.bindings?.content !== undefined;

	const contentString = content?.toString() ?? '';
	const hasContent = contentString.length > 0;

	if ( ! hasBindings && ! hasContent ) {
		return (
			<div { ...blockProps }>
				<PlaceholderInstructions />
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			<SandBox
				html={ contentString }
				styles={ styles }
				title={ __( 'Remote Data Block HTML Preview' ) }
				tabIndex={ -1 }
			/>
			{
				/**
				 * When content is rendered in a Sandbox, clicks on the block's content are consumed
				 * by the inner DOM and are not registered in the editor. Adding an invisible overlay
				 * allows this block to be selected in the editor when clicked.
				 */
				! isSelected && <div className="remote-data-block-html-overlay"></div>
			}
		</div>
	);
}

const PlaceholderInstructions = () => {
	return (
		<Placeholder
			label={ __( 'Remote HTML' ) }
			instructions={ __(
				'This block only works when placed inside a remote data block container and bound to an attribute. This block will be ignored as currently configured.'
			) }
		/>
	);
};
