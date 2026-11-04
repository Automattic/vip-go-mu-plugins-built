/**
 * WordPress dependencies
 */
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';

/**
 * @typedef {import('@wordpress/element').RefObject} RefObject
 * @typedef {import('@wordpress/element').LegacyRef} LegacyRef
 */

export const DRAG_MARGIN_PX = 8;

/**
 * Represents the position and dimensions of a draggable item.
 *
 * This is a subset of DOMRect, containing only the properties we need
 * to avoid calculating additional parameters like top, left, right, bottom.
 */
interface ItemRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Properties passed to the onDrag callback function during drag operations.
 */
export interface OnDragProps {
	// The total accumulated delta movement from the start of the drag.
	totalDelta: { x: number; y: number };
	// The original position and dimensions of the item before dragging.
	originalItemRect: ItemRect;
	// The bounding rectangle of the iframe containing the draggable item.
	iframeRect: DOMRect;
}

/**
 * Configuration properties for the useDraggable hook.
 */
export interface UseDraggableProps {
	// Callback function called during drag operations to calculate new position.
	onDrag: ( props: OnDragProps ) => { x: number; y: number };
	// Reference to the iframe element containing the draggable item.
	iframeRef: React.RefObject<HTMLIFrameElement>;
	// CSS selector for the drag handle element within the draggable item.
	dragHandleSelector: string;
}

/**
 * Custom hook that makes an element draggable within an iframe.
 *
 * onDrag will be called with the drag delta of the original item, and will
 * update the visible position on return.
 *
 * @param {UseDraggableProps}            props                    Configuration object for the draggable behavior.
 * @param {Function}                     props.onDrag             Callback function that receives current drag information
 *                                                                and returns new position.
 * @param {RefObject<HTMLIFrameElement>} props.iframeRef          Reference to the iframe containing the draggable element.
 * @param {string}                       props.dragHandleSelector CSS selector for the element that triggers dragging.
 *
 * @return {[LegacyRef<HTMLDivElement>, boolean]} A tuple containing a ref to attach to the draggable element, and a
 *                                                boolean indicating whether the element is currently being dragged.
 */
export const useDraggable = (
	{ onDrag, iframeRef, dragHandleSelector }: UseDraggableProps
): [ React.LegacyRef<HTMLDivElement>, boolean ] => {
	const [ pressed, setPressed ] = useState( false );

	// Avoid storing positions in useState, as it will cause the component to
	// re-render on every state change.
	const totalDelta = useRef( { x: 0, y: 0 } );
	const positionDelta = useRef( { x: 0, y: 0 } );
	const iframeRect = useRef<DOMRect | null>( null );
	const originalItemRect = useRef<ItemRect | null>( null );
	const ref = useRef<HTMLDivElement | null>( null );
	const startPosition = useRef<{ x: number; y: number } | null>( null );
	const startTotalDelta = useRef<{ x: number; y: number }>( { x: 0, y: 0 } );

	const unsubscribe = useRef<( () => void ) | null>( null );
	const externalRef = useCallback( ( elem: HTMLDivElement | null ) => {
		ref.current = elem;

		if ( unsubscribe.current ) {
			unsubscribe.current();
		}

		if ( ! elem ) {
			return;
		}

		const handleMouseDown = ( e: MouseEvent ) => {
			// Only start dragging if the click was on the drag handle.
			const target = e.target as Element;
			if ( ! target.closest( dragHandleSelector ) ) {
				return;
			}

			e.preventDefault();

			const iframeDocument = iframeRef.current?.contentDocument ?? iframeRef.current?.contentWindow?.document;
			if ( iframeDocument ) {
				iframeRect.current = iframeDocument.documentElement.getBoundingClientRect();
			}

			originalItemRect.current = ref.current?.getBoundingClientRect() ?? null;

			// Store the starting mouse position within the iframe, used for offset calculations.
			startPosition.current = { x: e.clientX, y: e.clientY };

			// Store the current total delta at the start of the drag, used for offset calculations.
			startTotalDelta.current = { x: totalDelta.current.x, y: totalDelta.current.y };

			// If the item already has a transform from being dragged, we need to adjust
			// the originalItemRect to the item's position without any transformations to
			// avoid an offset on drag. Undo the transformations that already exist on the
			// item and store the result in originalItemRect.
			const transform = ref.current?.style.transform;
			if ( transform && originalItemRect.current ) {
				const matrix = new DOMMatrix( transform );
				originalItemRect.current = {
					x: originalItemRect.current.x - matrix.e,
					y: originalItemRect.current.y - matrix.f,
					width: originalItemRect.current.width,
					height: originalItemRect.current.height,
				};
			}

			setPressed( true );
		};

		elem.addEventListener( 'mousedown', handleMouseDown );

		unsubscribe.current = () => {
			elem.removeEventListener( 'mousedown', handleMouseDown );
		};
	}, [ iframeRef, dragHandleSelector ] );

	useEffect( () => {
		if ( ! pressed ) {
			return;
		}

		const iframeDocument = iframeRef.current?.contentDocument ?? iframeRef.current?.contentWindow?.document;
		if ( ! iframeDocument ) {
			return;
		}

		const handleMouseMove = throttleToAnimationFrames( ( event: MouseEvent ) => {
			if ( ! ref.current || ! iframeRect.current || ! originalItemRect.current || ! startPosition.current ) {
				return;
			}

			// Calculate total delta using absolute positions instead of event movementX
			// and movementY, which don't work properly in Safari within an iframe.
			const currentMouseDelta = {
				x: event.clientX - startPosition.current.x,
				y: event.clientY - startPosition.current.y,
			};

			totalDelta.current = {
				x: startTotalDelta.current.x + currentMouseDelta.x,
				y: startTotalDelta.current.y + currentMouseDelta.y,
			};

			positionDelta.current = onDrag( {
				totalDelta: { x: totalDelta.current.x, y: totalDelta.current.y },
				originalItemRect: originalItemRect.current,
				iframeRect: iframeRect.current,
			} );

			ref.current.style.transform = `translate(${ positionDelta.current.x }px, ${ positionDelta.current.y }px)`;
		} );

		const handleMouseUp = () => {
			// After the drag ends, reset total delta to match the current position.
			totalDelta.current = positionDelta.current;
			setPressed( false );
		};

		iframeDocument.addEventListener( 'mousemove', handleMouseMove );
		iframeDocument.addEventListener( 'mouseup', handleMouseUp );

		return () => {
			handleMouseMove.cancel();
			iframeDocument.removeEventListener( 'mousemove', handleMouseMove );
			iframeDocument.removeEventListener( 'mouseup', handleMouseUp );
		};
	}, [ pressed, onDrag, iframeRef ] );

	return [ externalRef, pressed ];
};

/**
 * Throttles function calls to animation frames for smooth rendering.
 *
 * This utility function ensures that the provided function is called at most
 * once per animation frame, preventing excessive executions during rapid events
 * like mouse movements.
 *
 * @template Args The type of arguments the function accepts.
 * @template Return The return type of the function.
 * @param {Function} f The function to throttle.
 *
 * @return {Function & { cancel: Function }} An object with a throttled wrap of the function
 *                                           and a cancel method to cancel pending calls.
 */
const throttleToAnimationFrames = <Args extends readonly unknown[], Return>(
	f: ( ...args: Args ) => Return
) => {
	let token: number|null = null;
	let lastArgs: Args|null = null;

	const invoke = () => {
		if ( lastArgs !== null ) {
			f( ...lastArgs );
		}

		token = null;
	};

	const result = ( ...args: Args ) => {
		lastArgs = args;
		if ( ! token ) {
			token = requestAnimationFrame( invoke );
		}
	};

	result.cancel = () => token && cancelAnimationFrame( token );
	return result;
};
