/**
 * WordPress dependencies
 */
import { Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * TypewriterText component that animates text with a typewriter effect.
 *
 * @since 3.19.0
 *
 * @param {Object} props         The component's props.
 * @param {string} props.message The message to display with typewriter effect.
 */
const TypewriterText = ( { message }: { message: string } ): JSX.Element => {
	const [ displayText, setDisplayText ] = useState( '' );
	const [ currentIndex, setCurrentIndex ] = useState( 0 );
	const [ isTyping, setIsTyping ] = useState( true );

	useEffect( () => {
		// Reset when message changes
		setDisplayText( '' );
		setCurrentIndex( 0 );
		setIsTyping( true );
	}, [ message ] );

	useEffect( () => {
		if ( ! isTyping ) {
			return;
		}

		if ( currentIndex < message.length ) {
			// Still typing the message.
			const typingTimeout = setTimeout( () => {
				setDisplayText( ( prev ) => prev + message.charAt( currentIndex ) );
				setCurrentIndex( ( prev ) => prev + 1 );
			}, 50 ); // Typing speed.

			return () => clearTimeout( typingTimeout );
		}
	}, [ currentIndex, isTyping, message ] );

	return (
		<div className="wp-parsely-typewriter-text">
			{ displayText }
		</div>
	);
};

/**
 * Defines the props structure for Loading.
 *
 * @since 3.19.0
 */
type LoadingProps = {
	className?: string;
	loading?: boolean;
	showSpinner?: boolean;
    messages?: string[];
	randomOrder?: boolean;
	children?: React.ReactNode;
    typewriter: boolean;
};

/**
 * Loading component that displays a spinner and a message.
 *
 * @since 3.19.0
 *
 * @param {LoadingProps} props The component's props.
 */
export const Loading = ( {
	className = '',
	loading = true,
	showSpinner = true,
	randomOrder = false,
	messages = [ __( 'Loading…', 'wp-parsely' ) ],
	children,
	typewriter = false,
}: LoadingProps ): JSX.Element => {
	const [ currentMessage, setCurrentMessage ] = useState<string>( '' );
	const [ currentIndex, setCurrentIndex ] = useState( 0 );

	useEffect( () => {
		if ( ! loading ) {
			return;
		}

		if ( '' === currentMessage ) {
			setCurrentMessage( messages[ randomOrder ? Math.floor( Math.random() * messages.length ) : 0 ] );
		}

		const updateMessage = () => {
			if ( randomOrder ) {
				// Pick a random message different from the current one.
				let nextIndex;
				do {
					nextIndex = Math.floor( Math.random() * messages.length );
				} while ( messages.length > 1 && nextIndex === currentIndex );
				setCurrentIndex( nextIndex );
				setCurrentMessage( messages[ nextIndex ] );
			} else {
				// Move to next message sequentially.
				const nextIndex = ( currentIndex + 1 ) % messages.length;
				setCurrentIndex( nextIndex );
				setCurrentMessage( messages[ nextIndex ] );
			}
		};

		// Calculate pause duration based on message length (100ms per character).
		const pauseDuration = currentMessage.length * 100;

		const intervalId = setInterval( updateMessage, pauseDuration );

		return () => clearInterval( intervalId );
	}, [ loading, messages, currentIndex, currentMessage, randomOrder ] );

	return (
		<div className={ `wp-parsely-loading ${ className }` }>
			{ showSpinner && <Spinner /> }
			<div className="wp-parsely-loading-message">
				{ children ? children : (
					<>
						{ typewriter ? <TypewriterText message={ currentMessage } /> : currentMessage }
					</>
				) }
			</div>
		</div>
	);
};
