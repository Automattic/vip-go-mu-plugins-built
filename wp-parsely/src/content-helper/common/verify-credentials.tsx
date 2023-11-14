/**
 * Internal dependencies
 */
import {
	ContentHelperErrorMessageProps,
	EmptyCredentialsMessage,
} from './content-helper-error-message';

/**
 * Defines the props structure for VerifyCredentials.
 *
 * @since 3.9.0
 */
interface VerifyCredentialsProps {
	children: JSX.Element|JSX.Element[];
}

/**
 * Returns the passed children or an error message JSX Element if credentials
 * are empty.
 *
 * @since 3.9.0
 *
 * @param {VerifyCredentialsProps}              props             The component's props.
 * @param {ContentHelperErrorMessageProps|null} errorMessageProps The error message's props.
 *
 * @return {JSX.Element} The passed JSX Element or the error message JSX Element.
 */
export const VerifyCredentials = (
	{ children }: VerifyCredentialsProps,
	errorMessageProps: ContentHelperErrorMessageProps|null = null
): JSX.Element => {
	if ( window.wpParselyEmptyCredentialsMessage ) {
		return <EmptyCredentialsMessage { ...errorMessageProps } />;
	}

	return <>{ children }</>;
};
