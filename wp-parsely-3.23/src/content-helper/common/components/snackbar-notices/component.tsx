/**
 * External dependencies
 */
import type { MouseEventHandler } from 'react';

/**
 * WordPress dependencies
 */
import { SnackbarList } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { WPNotice } from '@wordpress/notices/build-types/store/selectors';

interface SnackbarNoticesProps {
	className?: string; // Additional class name to be added to the base class.
}

/**
 * Component that manages and displays snackbar notices from WordPress notices
 * store.
 *
 * @since 3.19.0
 *
 * @param {SnackbarNoticesProps} props The component's props.
 */
export const SnackbarNotices = ( { className }: SnackbarNoticesProps ): JSX.Element => {
	// Get snackbar notices from the store.
	const notices = useSelect(
		( select ) => select( noticesStore )
			.getNotices()
			.filter( ( notice: WPNotice ) => notice.type === 'snackbar' )
			.map( ( notice: WPNotice ) => ( {
				...notice,
				actions: notice.actions?.map( ( action ) => ( {
					...action,
					// Convert null to undefined for optional properties.
					url: action.url ?? undefined,
					onClick: action.onClick as MouseEventHandler<HTMLButtonElement> ?? undefined,
				} ) ),
			} ) ),
		[]
	);

	// Get the removeNotice dispatch function.
	const { removeNotice } = useDispatch( noticesStore );

	const classes = [ 'wp-parsely-snackbar-notices' ];
	if ( className ) {
		classes.push( className );
	}

	return (
		<div className={ classes.join( ' ' ) }>
			<SnackbarList
				notices={ notices }
				onRemove={ ( id ) => removeNotice( id ) }
			/>
		</div>
	);
};
