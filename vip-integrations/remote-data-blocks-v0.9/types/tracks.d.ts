interface TracksGlobalProperties {
	plugin_version: string;

	// "Tracks" library properties.
	hosting_provider: string;
	is_vip_user: boolean;
	is_multisite: boolean;
	vip_env: string;
	vip_org: number;
	wp_version: string;
	_ui: string; // User ID
	_ut: string; // User Type
}
