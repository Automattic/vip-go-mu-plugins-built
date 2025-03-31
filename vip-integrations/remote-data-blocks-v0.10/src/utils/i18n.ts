import { __ as unwrappedTranslate } from '@wordpress/i18n';

import { TEXT_DOMAIN } from '@/config/constants';

export function __( text: string ): string {
	return unwrappedTranslate( text, TEXT_DOMAIN );
}
