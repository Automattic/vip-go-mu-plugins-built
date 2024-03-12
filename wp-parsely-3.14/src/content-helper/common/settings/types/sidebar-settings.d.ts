import { Metric, Period } from '../../utils/constants';

/**
 * Defines the settings structure for the ContentHelperEditorSidebar component.
 *
 * @since 3.13.0
 * @since 3.14.0 Moved from `content-helper/editor-sidebar/editor-sidebar.tsx`.
 */
export interface SidebarSettings {
	InitialTabName: string;
	PerformanceStatsSettings: PerformanceStatsSettings;
	RelatedPostsFilterBy: string;
	RelatedPostsFilterValue: string;
	RelatedPostsMetric: Metric;
	RelatedPostsOpen: boolean;
	RelatedPostsPeriod: Period;
	SmartLinkingMaxLinks: number;
	SmartLinkingMaxLinkWords: number;
	SmartLinkingOpen: boolean;
	TitleSuggestionsSettings: TitleSuggestionsSettings;
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
