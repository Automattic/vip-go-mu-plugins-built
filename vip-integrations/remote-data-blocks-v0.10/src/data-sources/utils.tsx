import CheckIcon from '@/settings/icons/CheckIcon';
import ErrorIcon from '@/settings/icons/ErrorIcon';

export function getConnectionMessage(
	status: 'success' | 'error' | null,
	message: string
): JSX.Element {
	const StatusIcon = () => {
		if ( status === 'success' ) {
			return <CheckIcon />;
		}

		if ( status === 'error' ) {
			return <ErrorIcon />;
		}

		return null;
	};

	return (
		<span className={ status ? `status-message is-${ status }` : '' }>
			{ status && (
				<span className="status-icon">
					<StatusIcon />
				</span>
			) }
			{ message }
		</span>
	);
}
