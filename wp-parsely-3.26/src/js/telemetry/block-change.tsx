/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import { BlockInstance } from '@wordpress/blocks';
import { select, subscribe } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * External dependencies
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import debounce from 'lodash/debounce';
import { isEditorReady } from '../../content-helper/common/utils/functions';

/**
 * Internal dependencies
 */
import { Telemetry } from './telemetry';

/**
 * BlockChangeMonitor is a React component that monitors changes in the WordPress block editor.
 * It tracks the addition and removal of blocks that start with the 'wp-parsely/' prefix.
 * This component does not render anything.
 *
 * @since 3.12.0
 *
 * @return {null} This component does not render anything.
 */
export const BlockChangeMonitor = (): null => {
	/**
	 * The prefix of the blocks to monitor.
	 *
	 * @since 3.12.0
	 */
	const parselyBlockPrefix: string = 'wp-parsely/';

	/**
	 * This useEffect hook is used to monitor changes in the WordPress block editor.
	 * It delays the initialization to avoid reacting to the initial block load.
	 * It subscribes to changes in the block editor when the component is mounted.
	 * When the block editor changes, it checks if blocks have been added or removed by comparing the current
	 * list of blocks with the previous one.
	 * If a block has been added or removed, it sends a telemetry event to the server.
	 * When the component is unmounted, it clears the initialization timeout.
	 *
	 * @since 3.12.0
	 * @since 3.14.0 Improved detection by comparing current and previous block states directly.
	 */
	useEffect( () => {
		// Debounce interval to save CPU cycles with the frequent editor updates.
		const debounceInterval = 1000; // In milliseconds.

		let unsubscribe: () => void;
		const initialize = () => {
			let previousBlocks = select( 'core/block-editor' ).getBlocks();

			/**
			 * Checks if blocks have been added or removed and sends telemetry events accordingly.
			 *
			 * @since 3.14.0
			 */
			const checkBlocks = () => {
				const currentBlocks: BlockInstance[] = select(
					'core/block-editor'
				).getBlocks();
				const currentBlockIds = currentBlocks.map( ( block ) => block.clientId );
				const previousBlockIds = previousBlocks.map(
					( block: BlockInstance ) => block.clientId
				);

				// Find added blocks.
				const addedBlocks = currentBlocks.filter(
					( block ) => ! previousBlockIds.includes( block.clientId ),
				);
				addedBlocks.forEach( ( block ) => {
					if ( block.name.startsWith( parselyBlockPrefix ) ) {
						Telemetry.trackEvent( 'block_added', { block: block.name } );
					}
				} );

				// Find removed blocks.
				const removedBlockIds = previousBlockIds.filter(
					( id: string ) => ! currentBlockIds.includes( id )
				);
				removedBlockIds.forEach( ( id: string ) => {
					const removedBlock = previousBlocks.find(
						( block: BlockInstance ) => block.clientId === id
					);
					if ( removedBlock && removedBlock.name.startsWith( parselyBlockPrefix ) ) {
						Telemetry.trackEvent( 'block_removed', { block: removedBlock.name } );
					}
				} );

				// Update the previousBlocks for the next check.
				previousBlocks = currentBlocks;
			};

			// Debounce the checkBlocks function to save CPU cycles with the frequent editor updates.
			const debouncedCheckBlocks = debounce( checkBlocks, debounceInterval );
			unsubscribe = subscribe( debouncedCheckBlocks, 'core/block-editor' );
			return unsubscribe;
		};

		// Initialize the block change monitor when the editor is ready.
		isEditorReady().then( initialize );

		return () => {
			if ( unsubscribe ) {
				unsubscribe();
			}
		};
	}, [] );

	return null; // This component does not render anything.
};
