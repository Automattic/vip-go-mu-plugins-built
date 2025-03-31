import { PlaceholderLoop } from '@/blocks/remote-data-container/components/placeholders/PlaceholderLoop';
import { PlaceholderSingle } from '@/blocks/remote-data-container/components/placeholders/PlaceholderSingle';

export interface PlaceholderProps {
	blockConfig: BlockConfig;
	onSelect: ( input: RemoteDataQueryInput ) => void;
}

export function Placeholder( props: PlaceholderProps ) {
	const { loop } = props.blockConfig;

	if ( loop ) {
		return <PlaceholderLoop { ...props } />;
	}

	return <PlaceholderSingle { ...props } />;
}
