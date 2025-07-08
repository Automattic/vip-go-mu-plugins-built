/**
 * Describes an integration (plugin or service) available for Jetpack Forms.
 */
export interface Integration {
	/** The type of integration: 'plugin' or 'service'. */
	type: 'plugin' | 'service';
	/** The unique slug for the integration. */
	slug: string;
	/** The unique identifier for the integration. */
	id: string;
	/** The plugin file path, if applicable. */
	pluginFile?: string | null;
	/** Whether the integration is installed. */
	isInstalled: boolean;
	/** Whether the integration is active. */
	isActive: boolean;
	/** Whether the integration is connected. */
	isConnected: boolean;
	/** Whether the integration needs connection. */
	needsConnection: boolean;
	/** The version of the integration, if available. */
	version?: string | null;
	/** The URL to the integration's settings page, if available. */
	settingsUrl?: string | null;
	/** Additional details about the integration. */
	details: Record< string, unknown >;
}

/**
 * Props for integration cards in the Jetpack Forms dashboard and integrations modal.
 */
export interface SingleIntegrationCardProps {
	/** Whether the card is expanded. */
	isExpanded: boolean;
	/** Function to toggle the card's expanded state. */
	onToggle: () => void;
	/** The integration data for the card. */
	data?: Integration;
	/** Function to refresh the integration status. */
	refreshStatus: () => void;
	borderBottom?: boolean;
}

/**
 * Represents a reusable form pattern for the Jetpack Forms dashboard.
 */
export type Pattern = {
	/** The URL of the pattern's preview image. */
	image: string;
	/** The display name of the pattern. */
	title: string;
	/** Whether this pattern is recommended for most users. */
	recommended?: boolean;
	/** The unique code identifier for the pattern. */
	code: string;
	/** A short description of the pattern's purpose. */
	description: string;
};

/**
 * Represents a form response.
 */
export interface FormResponse {
	/** The unique identifier for the response. */
	id: number;
	/** The status of the response. */
	status: 'publish' | 'spam' | 'trash';
	/** The date and time the response was created. */
	date: string;
	/** The date and time the response was created in GMT. */
	date_gmt: string;
	/** The name of the response author. */
	author_name: string;
	/** The email of the response author. */
	author_email: string;
	/** The URL of the response author. */
	author_url: string;
	/** The avatar of the response author. */
	author_avatar: string;
	/** The IP address of the response author. */
	ip: string;
	/** The title of the form that the response was submitted to. */
	entry_title: string;
	/** The permalink of the form that the response was submitted to. */
	entry_permalink: string;
	/** Whether the response has a file attached. */
	has_file: boolean;
	/** The fields of the response. */
	fields: Record< string, unknown >;
}

/**
 * Default URLs for Jetpack Forms blocks, such as responses and spam responses.
 */
export interface JPFormsBlocksDefaults {
	/** The URL for form responses. */
	formsResponsesUrl?: string;
	/** The URL for spam form responses. */
	formsResponsesSpamUrl?: string;
}

/**
 * Augments the global Window interface to include Jetpack Forms block defaults.
 */
declare global {
	interface Window {
		/** Optional Jetpack Forms block defaults on the window object. */
		jpFormsBlocks?: {
			defaults?: JPFormsBlocksDefaults;
		};
		jetpackAnalytics?: {
			tracks?: {
				recordEvent: ( event: string, props?: Record< string, unknown > ) => void;
			};
		};
	}
}

/**
 * Represents the data passed to IntegrationCard and IntegrationCardHeader components.
 * This type extends Integration and includes additional UI and state fields used by cards.
 */
export type IntegrationCardData = Partial< Integration > & {
	/** Whether to show the header toggle. */
	showHeaderToggle?: boolean;
	/** The value of the header toggle (on/off). */
	headerToggleValue?: boolean;
	/** Whether the header toggle is enabled. */
	isHeaderToggleEnabled?: boolean;
	/** Handler for header toggle changes. */
	onHeaderToggleChange?: ( value: boolean ) => void;
	/** Tooltip to show when the toggle is disabled. */
	toggleDisabledTooltip?: string;
	/** Badge or element to show in the header for setup state. */
	setupBadge?: React.ReactNode;
	/** Function to refresh the integration status. */
	refreshStatus?: () => void;
	/** Event name for tracking analytics. */
	trackEventName?: string;
	/** Message to show when the integration is not installed. */
	notInstalledMessage?: React.ReactNode;
	/** Message to show when the integration is not activated. */
	notActivatedMessage?: React.ReactNode;
	/** Whether the card is in a loading state. */
	isLoading?: boolean;
};
