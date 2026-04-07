/**
 * Props for the PageHeader component.
 *
 * @since 3.19.0
 */
type PageHeaderProps = {
	className?: string;
	children: React.ReactNode;
}

/**
 * Page header component.
 *
 * Used to wrap the header content of a dashboard page.
 *
 * @since 3.19.0
 *
 * @param {PageHeaderProps} props The component's props.
 */
export const PageHeader = ( {
	className,
	children,
}: Readonly<PageHeaderProps> ): React.JSX.Element => {
	return (
		<header
			className={ 'parsely-dashboard-page-header' + ( className ? ' ' + className : '' ) }
		>
			{ children }
		</header>
	);
};
