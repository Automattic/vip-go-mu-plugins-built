/**
 * Props for the PageContainerProps component.
 *
 * @since 3.19.0
 */
type PageContainerProps = {
	className?: string;
	name: string
	children: React.ReactNode;
	backgroundColor?: string;
	style?: React.CSSProperties;
}

/**
 * Page container component.
 *
 * Used to wrap the main content of a dashboard page, including the
 * header and body.
 *
 * @since 3.19.0
 *
 * @param {PageContainerProps} props The component's props.
 */
export const PageContainer = ( {
	className,
	name,
	children,
	backgroundColor,
	style,
}: Readonly<PageContainerProps> ): React.JSX.Element => {
	return (
		<div
			className={
				'parsely-menu-page parsely-menu-page-' + name +
				( className ? ' ' + className : '' )
			}
			style={ {
				...( backgroundColor ? { backgroundColor } : {} ),
				...style,
			} }
		>
			{ children }
		</div>
	);
};
