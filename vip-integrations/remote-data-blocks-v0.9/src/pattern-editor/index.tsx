import { registerPlugin } from '@wordpress/plugins';

import { PatternEditorSettingsPanel } from '@/pattern-editor/components/PatternEditorSettingsPanel';

registerPlugin( 'remote-data-blocks-settings', {
	render: PatternEditorSettingsPanel,
	icon: 'admin-settings',
} );
