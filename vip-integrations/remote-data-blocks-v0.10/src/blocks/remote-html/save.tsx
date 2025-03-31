import { BlockSaveProps } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';

interface RemoteDataHTMLSaveAttributes {
	content?: string | StringSeriablizable;
	saveContent?: string | StringSeriablizable;
}

export function Save( props: BlockSaveProps< RemoteDataHTMLSaveAttributes > ) {
	const { attributes } = props;

	const content = attributes?.saveContent ?? attributes?.content ?? '';

	return <RawHTML>{ content?.toString() }</RawHTML>;
}
