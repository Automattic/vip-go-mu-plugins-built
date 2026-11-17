/**
 * Defines the structure of a Content Intelligence Permissions object.
 *
 * @since 3.16.0
 */
export interface ContentHelperPermissions {
	ExcerptSuggestions: boolean;
	SmartLinking: boolean;
	TitleSuggestions: boolean;
	TrafficBoost: boolean;
}

/**
 * Returns the current user's permissions for Content Intelligence.
 *
 * @since 3.16.0
 *
 * @return {ContentHelperPermissions} The current user's permissions.
 */
export function getContentHelperPermissions(): ContentHelperPermissions {
	const defaultPermissions: ContentHelperPermissions = {
		ExcerptSuggestions: false,
		SmartLinking: false,
		TitleSuggestions: false,
		TrafficBoost: false,
	};

	try {
		const permissions = JSON.parse( window.wpParselyContentHelperPermissions );

		if ( 'object' !== typeof permissions || null === permissions ) {
			return defaultPermissions;
		}

		return permissions;
	} catch ( e ) {
		return defaultPermissions;
	}
}
