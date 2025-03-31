import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { copy } from '@wordpress/icons';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import coy from 'react-syntax-highlighter/dist/esm/styles/prism/coy';

import { useDataSources } from '../hooks/useDataSources';

SyntaxHighlighter.registerLanguage( 'php', php );

const CodeSnippet = ( { code }: { code: string } ) => {
	const { showSnackbar } = useDataSources();

	const handleCopy = () => {
		navigator.clipboard
			.writeText( code )
			.then( () => {
				showSnackbar( 'success', __( 'Code copied to clipboard!', 'remote-data-blocks' ) );
			} )
			.catch( () => {
				showSnackbar( 'error', __( 'Failed to copy code', 'remote-data-blocks' ) );
			} );
	};

	return (
		<div
			style={ {
				position: 'relative',
				marginBottom: '1rem',
				padding: '16px',
			} }
		>
			<Button
				onClick={ handleCopy }
				icon={ copy }
				variant="tertiary"
				style={ {
					position: 'absolute',
					top: '8px',
					right: '8px',
					zIndex: '11',
					background: '#fff',
				} }
			>
				{ __( 'Copy' ) }
			</Button>
			<SyntaxHighlighter language="php" style={ coy } showLineNumbers>
				{ code }
			</SyntaxHighlighter>
		</div>
	);
};

export default CodeSnippet;
