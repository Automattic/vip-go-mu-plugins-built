/**
 * External dependencies
 */
import jetpackAnalytics from '@automattic/jetpack-analytics';
import { useBreakpointMatch } from '@automattic/jetpack-components';
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useEntityRecords } from '@wordpress/core-data';
import { __, _x, sprintf } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Returns a formatted tab label with count.
 *
 * @param {string} label - The label for the tab.
 * @param {number} count - The count to display.
 * @return {string} The formatted label.
 */
function getTabLabel( label: string, count: number ): string {
	/* translators: 1: Tab label, 2: Count */
	return sprintf( __( '%1$s (%2$s)', 'jetpack-forms' ), label, count || 0 );
}

type InboxStatusToggleProps = {
	currentQuery: Record< string, unknown >;
};

/**
 * Renders the status toggle for the inbox view.
 *
 * @param {InboxStatusToggleProps} props - The component props.
 * @return {JSX.Element} The status toggle component.
 */
export default function InboxStatusToggle( { currentQuery }: InboxStatusToggleProps ): JSX.Element {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const status = searchParams.get( 'status' ) || 'inbox';
	const queryBase = { search: '', page: 1, ...currentQuery, per_page: 1, _fields: 'id' };
	const [ isSm ] = useBreakpointMatch( 'sm' );
	const { totalItems: totalItemsInbox } = useEntityRecords( 'postType', 'feedback', {
		...queryBase,
		status: 'publish,draft',
	} );

	const { totalItems: totalItemsSpam } = useEntityRecords( 'postType', 'feedback', {
		...queryBase,
		status: 'spam',
	} );

	const { totalItems: totalItemsTrash } = useEntityRecords( 'postType', 'feedback', {
		...queryBase,
		status: 'trash',
	} );

	const statusTabs = [
		{ label: getTabLabel( __( 'Inbox', 'jetpack-forms' ), totalItemsInbox ), value: 'inbox' },
		{ label: getTabLabel( __( 'Spam', 'jetpack-forms' ), totalItemsSpam ), value: 'spam' },
		{
			label: getTabLabel( _x( 'Trash', 'noun', 'jetpack-forms' ), totalItemsTrash ),
			value: 'trash',
		},
	];

	const handleChange = useCallback(
		( newStatus: string ) => {
			jetpackAnalytics.tracks.recordEvent( 'jetpack_forms_inbox_status_change', {
				status: newStatus,
				viewport: isSm ? 'mobile' : 'desktop',
				previous_status: status,
			} );

			setSearchParams( prev => {
				const params = new URLSearchParams( prev );
				params.set( 'status', newStatus );

				return params;
			} );
		},
		[ setSearchParams, status, isSm ]
	);

	return (
		<ToggleGroupControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			hideLabelFromVision
			isAdaptiveWidth={ true }
			isBlock
			key={ `${ totalItemsInbox ?? 0 }-${ totalItemsSpam ?? 0 }-${ totalItemsTrash ?? 0 }` }
			label={ __( 'Form responses type', 'jetpack-forms' ) }
			onChange={ handleChange }
			value={ status }
		>
			{ statusTabs.map( option => (
				<ToggleGroupControlOption
					key={ option.value }
					value={ option.value }
					label={ option.label }
				/>
			) ) }
		</ToggleGroupControl>
	);
}
