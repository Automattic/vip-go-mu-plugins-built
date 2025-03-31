import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface DataSourceFormActionsProps {
	onSave: () => Promise< void >;
	isSaveDisabled: boolean;
}

export const DataSourceFormActions = ( { onSave, isSaveDisabled }: DataSourceFormActionsProps ) => {
	return (
		<Button variant="primary" onClick={ () => void onSave() } disabled={ isSaveDisabled }>
			{ __( 'Save', 'remote-data-blocks' ) }
		</Button>
	);
};
