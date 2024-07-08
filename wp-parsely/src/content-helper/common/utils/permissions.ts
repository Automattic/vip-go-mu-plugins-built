/**
 * Defines the structure of a Content Helper Permissions object.
 *
 * @since 3.16.0
 */
export interface ContentHelperPermissions {
	SmartLinking: boolean;
	TitleSuggestions: boolean;
}

/**
 * Returns the current user's permissions for the Content Helper.
 *
 * @since 3.16.0
 *
 * @return {ContentHelperPermissions} The current user's permissions.
 */
export function getContentHelperPermissions(): ContentHelperPermissions {
	const defaultPermissions: ContentHelperPermissions = {
		SmartLinking: false,
		TitleSuggestions: false,
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
