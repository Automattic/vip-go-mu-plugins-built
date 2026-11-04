/**
 * Props for the PageBody component.
 *
 * @since 3.19.0
 */
type PageBodyProps = {
	className?: string;
	children: React.ReactNode;
}

/**
 * Page body component.
 *
 * Used to wrap the main content of a dashboard page.
 *
 * @since 3.19.0
 *
 * @param {PageBodyProps} props The component's props.
 */
export const PageBody = ( {
	className,
	children,
}: Readonly<PageBodyProps> ): React.JSX.Element => {
	return (
		<main
			className={ 'parsely-dashboard-page-body' + ( className ? ' ' + className : '' ) }
		>
			{ children }
		</main>
	);
};
