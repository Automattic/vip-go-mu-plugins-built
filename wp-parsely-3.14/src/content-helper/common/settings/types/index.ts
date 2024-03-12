/**
 * Import the settings types.
 */
import type {
	SidebarSettings,
	TitleSuggestionsSettings,
	PerformanceStatsSettings,
} from './sidebar-settings';
import type { TopPostsSettings } from './top-posts-settings';

/**
 * Export the settings types.
 */
export type {
	SidebarSettings,
	TitleSuggestionsSettings, // Part of SidebarSettings type.
	PerformanceStatsSettings, // Part of SidebarSettings type.
	TopPostsSettings,
};

// Generic type for settings.
export type Settings = SidebarSettings | TopPostsSettings;

