import { Metric, Period } from '../../utils/constants';

/**
 * Defines the settings structure for the ContentHelperEditorSidebar component.
 *
 * @since 3.13.0
 * @since 3.14.0 Moved from `content-helper/editor-sidebar/editor-sidebar.tsx`.
 */
export interface SidebarSettings {
	InitialTabName: string;
	PerformanceStats: PerformanceStatsSettings;
	RelatedPosts: RelatedPostsSettings;
	SmartLinking: SmartLinkingSettings;
	TitleSuggestions: TitleSuggestionsSettings;
	ExcerptSuggestions: ExcerptSuggestionsSettings;
}

/**
 * Defines the settings structure for the PerformanceStats component.
 *
 * @since 3.14.0
 */
export interface PerformanceStatsSettings {
	Period: Period;
	VisiblePanels: string[];
	VisibleDataPoints: string[];
}

/**
 * Defines the settings structure for the TitleSuggestions component.
 *
 * @since 3.14.0
 */
export interface TitleSuggestionsSettings {
	Open: boolean;
	Persona: string;
	Tone: string;
}

/**
 * Defines the settings structure for the RelatedPosts component.
 *
 * @since 3.14.3
 */
export interface RelatedPostsSettings {
	Metric: Metric;
	Open: boolean;
	Period: Period;
}

/**
 * Defines the settings structure for the SmartLinking component.
 *
 * @since 3.14.3
 */
export interface SmartLinkingSettings {
	MaxLinks: number;
	Open: boolean;
}

/**
 * Defines the settings structure for the PostExcerptSuggestions component.
 *
 * @since 3.17.0
 * @since 3.24.0 Added the `Length` setting.
 * @since 3.24.0 Removed the `Open` setting, as the panel's collapsed state is
 *               now persisted by the block editor's own preferences store.
 */
export interface ExcerptSuggestionsSettings {
	Length: number;
	Persona: string;
	Tone: string;
}
