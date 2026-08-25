/**
 * Internal dependencies
 */
import { BaseWordPressProvider } from '../common/providers/base-wordpress-provider';

/**
 * DashboardProvider class for the plugin's dashboard.
 *
 * Extends the BaseWordPressProvider to inherit WordPress REST API functionalities.
 *
 * @since 3.19.0
 */
export class DashboardProvider extends BaseWordPressProvider {
	/**
	 * The singleton instance of the DashboardProvider.
	 *
	 * @since 3.19.0
	 */
	protected static instance: DashboardProvider;

	/**
	 * Returns the singleton instance of the DashboardProvider.
	 *
	 * @since 3.19.0
	 *
	 * @return {DashboardProvider} The singleton instance.
	 */
	public static getInstance(): DashboardProvider {
		if ( ! DashboardProvider.instance ) {
			DashboardProvider.instance = new DashboardProvider();
		}
		return DashboardProvider.instance;
	}
}
