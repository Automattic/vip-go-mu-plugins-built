/**
 * Import the settings types.
 */
import type {
	ExcerptSuggestionsSettings,
	PerformanceStatsSettings,
	RelatedPostsSettings,
	SidebarSettings,
	SmartLinkingSettings,
	TitleSuggestionsSettings,
} from './sidebar-settings';
import type { TopPostsSettings } from './top-posts-settings';
import type { TrafficBoostSettings } from './traffic-boost-settings';

/**
 * Export the settings types.
 */
export type {
	ExcerptSuggestionsSettings, // Part of SidebarSettings type.
	PerformanceStatsSettings, // Part of SidebarSettings type.
	RelatedPostsSettings, // Part of SidebarSettings type.
	SidebarSettings,
	SmartLinkingSettings, // Part of SidebarSettings type.
	TitleSuggestionsSettings, // Part of SidebarSettings type.
	TopPostsSettings,
	TrafficBoostSettings,
};

// Generic type for settings.
export type Settings = SidebarSettings | TopPostsSettings | TrafficBoostSettings;
