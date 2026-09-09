import apiFetch from '@wordpress/api-fetch';

import { initializeRulesViewer } from './rules-viewer';

initializeRulesViewer( { request: apiFetch } );
