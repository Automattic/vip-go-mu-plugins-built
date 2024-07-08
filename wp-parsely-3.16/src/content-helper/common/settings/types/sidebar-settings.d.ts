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
	FilterBy: string;
	FilterValue: string;
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
