import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews/wp';

/**
 * This file creates a global variable that provides DataViews so that it doesn't
 * have to be bundled multiple times for each block / script that uses it.
 *
 * More ideally, we would dynamically import() this module and avoid polluting
 * the global namespace, but our wrestling with Webpack was unsuccessful.
 * Improvements welcome!
 */
window.LockedPrivateDataViews = {
	filterSortAndPaginate,
	DataViews,
};
