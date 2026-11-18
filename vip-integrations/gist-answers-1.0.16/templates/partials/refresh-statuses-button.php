<?php
/**
 * Refresh button for the site statuses, for the Gist Answers plugin admin menus.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>

<button
	type="button"
	class="gist-answers-network-hub-refresh"
	title="<?php esc_attr_e( 'Refresh ingestion status', 'gist-answers' ); ?>"
	aria-label="<?php esc_attr_e( 'Refresh ingestion status', 'gist-answers' ); ?>"
	onclick="window.gistAnswersAdmin.refreshSiteStatuses(this)"
>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
		<path d="M21 3v5h-5"/>
		<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
		<path d="M8 16H3v5"/>
	</svg>
</button>
