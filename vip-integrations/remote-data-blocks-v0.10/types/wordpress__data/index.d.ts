import type { StoreDescriptor } from '@wordpress/data/build-types/types';

declare module '@wordpress/data' {
	function useDispatch< StoreActions >(
		store: string | StoreDescriptor,
		dependencies?: unknown[]
	): StoreActions;

	function useSelect< StoreSelectors, ReturnType = any >(
		mapFn: ( select: ( store: string | StoreDescriptor ) => StoreSelectors ) => ReturnType,
		dependencies?: unknown[]
	): ReturnType;

	function useSelect< StoreSelectors >(
		store: string | StoreDescriptor,
		dependencies?: unknown[]
	): StoreSelectors;
}
