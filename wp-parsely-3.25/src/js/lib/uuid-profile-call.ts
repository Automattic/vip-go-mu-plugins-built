import { PUBLIC_API_BASE_URL } from '../../content-helper/common/utils/constants';

// Only enqueuing the action if the site has a defined Site ID.
if ( typeof window.wpParselySiteId !== 'undefined' ) {
	window.wpParselyHooks?.addAction( 'wpParselyOnLoad', 'wpParsely', uuidProfileCall );
}

async function uuidProfileCall() {
	const uuid = window.PARSELY?.config?.parsely_site_uuid;

	if ( ! ( window.wpParselySiteId && uuid ) ) {
		return;
	}

	const url = `${ PUBLIC_API_BASE_URL }/profile?apikey=${ encodeURIComponent(
		window.wpParselySiteId
	) }&uuid=${ encodeURIComponent( uuid ) }&url=${ encodeURIComponent( window.location.href ) }`;

	return fetch( url );
}
