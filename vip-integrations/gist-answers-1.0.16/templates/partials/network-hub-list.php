<?php
/**
 * Network hub list template for the Gist Answers plugin admin menus.
 *
 * @package GistAnswers
 */

namespace GistAnswers;

use GistAnswers\Admin\NetworkMenu;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited -- These are not global variables; they are namespaced to GistAnswers within this template only.
$source     = strval( $source ?? '' );
$user_sites = is_array( $user_sites ?? null ) ? $user_sites : array();

$sortable_column = strval( $sortable_column ?? 'title' );
$sort_inverted   = boolval( $sort_inverted ?? false );

$selected_class = $sort_inverted ? 'gist-answers-network-hub-sortable-selected-inverted' : 'gist-answers-network-hub-sortable-selected';

$max_pages    = intval( $max_pages ?? 1 );
$current_page = intval( $current_page ?? 1 );

$search_term = strval( $search_term ?? '' );

// The status and content ingestion columns only apply to activated sites, so their headers are left blank without any.
$has_activated_site = false;

foreach ( $user_sites as $user_site ) {
	if ( is_object( $user_site ) && $user_site->has_valid_publisher() ) {
		$has_activated_site = true;
		break;
	}
}
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited

?>

<div class="gist-answers-network-hub-list-controls">
	<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/network-hub-search.php'; ?>

	<?php if ( $max_pages > 1 ) : ?>
		<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/network-hub-pagination.php'; ?>
	<?php endif; ?>

	<?php if ( $has_activated_site ) : ?>
		<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/refresh-statuses-button.php'; ?>
	<?php endif; ?>
</div><!-- .gist-answers-network-hub-list-controls -->

<?php if ( is_array( $user_sites ) && count( $user_sites ) > 0 ) : ?>
	<table class="gist-answers-network-hub-list" data-nonce="<?php echo esc_attr( wp_create_nonce( 'wp_rest' ) ); ?>">
		<thead>
			<tr>
				<th class="gist-answers-network-hub-sortable <?php echo 'title' === $sortable_column ? esc_attr( $selected_class ) : ''; ?>">
					<div onclick="window.gistAnswersAdmin.toggleNetworkHubSort('title', '<?php echo 'title' === $sortable_column && ! $sort_inverted ? 'desc' : 'asc'; ?>')">
						<?php esc_html_e( 'Site title', 'gist-answers' ); ?>
					</div>
				</th><!-- .gist-answers-network-hub-sortable -->

				<?php if ( $has_activated_site ) : ?>
					<?php if ( NetworkMenu::ALLOW_STATUS_SORT ) : ?>
						<th class="gist-answers-network-hub-sortable <?php echo 'status' === $sortable_column ? esc_attr( $selected_class ) : ''; ?>">
							<div onclick="window.gistAnswersAdmin.toggleNetworkHubSort('status', '<?php echo 'status' === $sortable_column && ! $sort_inverted ? 'desc' : 'asc'; ?>')">
								<?php esc_html_e( 'Status', 'gist-answers' ); ?>
							</div>
						</th><!-- .gist-answers-network-hub-sortable -->
					<?php else : ?>
						<th>
							<div><?php esc_html_e( 'Status', 'gist-answers' ); ?></div>
						</th>
					<?php endif; ?>

					<?php if ( NetworkMenu::ALLOW_INGESTION_SORT ) : ?>
						<th class="gist-answers-network-hub-sortable <?php echo 'ingestion' === $sortable_column ? esc_attr( $selected_class ) : ''; ?>">
							<div onclick="window.gistAnswersAdmin.toggleNetworkHubSort('ingestion', '<?php echo 'ingestion' === $sortable_column && ! $sort_inverted ? 'desc' : 'asc'; ?>')">
								<?php esc_html_e( 'Content ingestion', 'gist-answers' ); ?>

								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
								</svg>

								<?php $tooltip_content = __( 'Use the toggle to temporarily pause content ingestion. (New content won\'t be available for answers.)', 'gist-answers' ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable -- This is not a global variable; it is namespaced to GistAnswers within this template only, and is consumed by the svg-tooltip partial. ?>

								<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/svg-tooltip.php'; ?>
							</div>
						</th><!-- .gist-answers-network-hub-sortable -->
					<?php else : ?>
						<th>
							<div>
								<?php esc_html_e( 'Content ingestion', 'gist-answers' ); ?>

								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
								</svg>

								<?php $tooltip_content = __( 'Use the toggle to temporarily pause content ingestion. (New content won\'t be available for answers.)', 'gist-answers' ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable -- This is not a global variable; it is namespaced to GistAnswers within this template only, and is consumed by the svg-tooltip partial. ?>

								<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/svg-tooltip.php'; ?>
							</div>
						</th>
					<?php endif; ?>
				<?php else : ?>
					<th></th>
					<th></th>
				<?php endif; ?>

				<th></th>
			</tr>
		</thead>

		<tbody>
			<?php foreach ( $user_sites as $gist_site ) : // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound, WordPress.WP.GlobalVariablesOverride.Prohibited, VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable -- This is not a global variable; it is namespaced to GistAnswers within this template only, and is consumed by the admin-site-card partial. ?>
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/admin-site-card.php'; ?>
			<?php endforeach; ?>
		</tbody>
	</table><!-- .gist-answers-network-hub-list -->

	<script>
		document.addEventListener('DOMContentLoaded', function() {
			window.gistAnswersAdmin.loadSiteStatuses();
		});
	</script>
<?php else : ?>
	<div class="gist-answers-connection-wizard-warning">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
			<path d="M12 9v4"/>
			<path d="M12 17h.01"/>
		</svg>

		<span><?php esc_html_e( 'No sites were found matching your search criteria. Please try another search.', 'gist-answers' ); ?></span>
	</div><!-- .gist-answers-connection-wizard-warning -->
<?php endif; ?>
