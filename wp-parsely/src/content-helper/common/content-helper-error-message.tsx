/**
 * Defines the props structure for ContentHelperErrorMessage.
 *
 * @since 3.9.0
 */
export interface ContentHelperErrorMessageProps {
	children?: string;
	className?: string;
	testId?: string
}

/**
 * Returns an error message JSX Element that can contain HTML.
 *
 * Warning: Any HTML passed to this function must be sanitized.
 *
 * @since 3.9.0
 *
 * @param {ContentHelperErrorMessageProps} props The error message's props.
 *
 * @return {JSX.Element} The error message JSX Element.
 */
export const ContentHelperErrorMessage = (
	props: ContentHelperErrorMessageProps|null = null
): JSX.Element => {
	let innerHtml = '';
	if ( props?.children ) {
		innerHtml = props.children;
	}

	let classNames = 'content-helper-error-message';
	if ( props?.className ) {
		classNames += ' ' + props.className;
	}

	return (
		<div className={ classNames }
			data-testid={ props?.testId }
			dangerouslySetInnerHTML={ { __html: innerHtml } }
		/>
	);
};

/**
 * Returns a customized error message JSX Element for when credentials are
 * empty.
 *
 * @since 3.9.0
 *
 * @param {ContentHelperErrorMessageProps|null} props The error message's props.
 *
 * @return {JSX.Element} The error message JSX Element.
 */
export const EmptyCredentialsMessage = (
	props: ContentHelperErrorMessageProps|null = null
): JSX.Element => {
	return (
		<ContentHelperErrorMessage
			className={ props?.className }
			testId="empty-credentials-message">
			{ window.wpParselyEmptyCredentialsMessage }
		</ContentHelperErrorMessage>
	);
};
