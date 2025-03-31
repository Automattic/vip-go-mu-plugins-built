declare module '@wordpress/server-side-render' {
	function ServerSideRender< T extends object >( props: {
		attributes: T;
		block: string;
	} ): JSX.Element;

	// default export
	export = ServerSideRender;
}
