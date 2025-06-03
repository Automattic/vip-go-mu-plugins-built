/**
 * External dependencies
 */
import jetpackAnalytics from '@automattic/jetpack-analytics';
import { useBreakpointMatch } from '@automattic/jetpack-components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useState, useCallback, useEffect } from '@wordpress/element';
/**
 * Internal dependencies
 */
import { config } from '..';
import { store as dashboardStore } from '../store';

type ExportHookReturn = {
	showExportModal: boolean;
	openModal: () => void;
	closeModal: () => void;
	autoConnectGdrive: boolean;
	userCanExport: boolean;
	onExport: ( action: string, nonceName: string ) => Promise< Response >;
};

/**
 * Hook to handle the export of form responses.
 *
 * @return {ExportHookReturn} The export modal state and actions.
 */
export default function useExportResponses(): ExportHookReturn {
	const [ isSm ] = useBreakpointMatch( 'sm' );
	const [ showExportModal, setShowExportModal ] = useState( false );
	const closeModal = useCallback( () => setShowExportModal( false ), [ setShowExportModal ] );
	const [ autoConnectGdrive, setAutoConnectGdrive ] = useState( false );

	const openModal = useCallback( () => {
		setShowExportModal( true );

		jetpackAnalytics.tracks.recordEvent( 'jetpack_forms_export_responses_modal_open', {
			viewport: isSm ? 'mobile' : 'desktop',
		} );
	}, [ isSm ] );

	const userCanExport = useSelect(
		select => select( coreStore ).canUser( 'update', 'settings' ),
		[]
	);

	const { selected, currentQuery } = useSelect( select => {
		const { getSelectedResponsesFromCurrentDataset, getCurrentQuery } = select( dashboardStore );

		return { selected: getSelectedResponsesFromCurrentDataset(), currentQuery: getCurrentQuery() };
	}, [] );

	const onExport = useCallback(
		( action: string, nonceName: string ) => {
			const data = new FormData();
			data.append( 'action', action );
			data.append( nonceName, config( 'exportNonce' ) );
			selected.forEach( ( id: string ) => data.append( 'selected[]', id ) );
			data.append( 'post', currentQuery.parent || 'all' );
			data.append( 'search', currentQuery.search || '' );
			data.append( 'status', currentQuery.status );

			if ( currentQuery.before && currentQuery.after ) {
				data.append( 'before', currentQuery.before );
				data.append( 'after', currentQuery.after );
			}

			return fetch( window.ajaxurl, { method: 'POST', body: data } );
		},
		[ currentQuery, selected ]
	);

	useEffect( () => {
		const url = new URL( window.location.href );

		if ( url.searchParams.get( 'connect-gdrive' ) === 'true' ) {
			setAutoConnectGdrive( true );
			openModal();

			// Update the URL to remove the query param
			url.searchParams.delete( 'connect-gdrive' );
			window.history.replaceState( {}, '', url );
		}
	}, [ openModal ] );

	return {
		showExportModal,
		openModal,
		closeModal,
		autoConnectGdrive,
		userCanExport,
		onExport,
	};
}
