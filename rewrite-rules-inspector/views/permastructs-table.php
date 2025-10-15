<?php
/**
 * Permastructs Table Template
 *
 * @package automattic\rewrite-rules-inspector
 * @since 1.5.0
 *
 * @var array $permastructs Array of permastruct data.
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<h2 id="permastructs-section">
	<?php esc_html_e( 'Permastructs', 'rewrite-rules-inspector' ); ?>
</h2>

<p>
	<?php
	/* translators: %d: Count of permastructs */
	printf( esc_html__( 'A listing of all %d permastructs that WordPress is aware of.', 'rewrite-rules-inspector' ), count( $permastructs ) );
	?>
</p>

<div class="permastructs-table-wrapper">
	<table class="wp-list-table widefat fixed striped permastructs-table" role="table" aria-label="<?php esc_attr_e( 'WordPress Permastructs', 'rewrite-rules-inspector' ); ?>">
		<thead>
			<tr>
				<th scope="col" class="manage-column column-name column-primary" role="columnheader">
					<?php esc_html_e( 'Name', 'rewrite-rules-inspector' ); ?>
				</th>
				<th scope="col" class="manage-column column-structure" role="columnheader">
					<?php esc_html_e( 'Structure', 'rewrite-rules-inspector' ); ?>
				</th>
				<th scope="col" class="manage-column column-description" role="columnheader">
					<?php esc_html_e( 'Description', 'rewrite-rules-inspector' ); ?>
				</th>
			</tr>
		</thead>
		<tbody id="the-list">
			<?php foreach ( $permastructs as $permastruct ) : ?>
				<tr role="row">
					<td class="name column-name column-primary" role="cell">
						<strong><?php echo esc_html( $permastruct['name'] ); ?></strong>
					</td>
					<td class="structure column-structure" role="cell">
						<code class="permastruct-structure" aria-label="<?php esc_attr_e( 'Permastruct structure', 'rewrite-rules-inspector' ); ?>"><?php echo esc_html( $permastruct['structure'] ); ?></code>
					</td>
					<td class="description column-description" role="cell">
						<?php echo esc_html( $permastruct['description'] ); ?>
					</td>
				</tr>
			<?php endforeach; ?>
		</tbody>
		<tfoot>
			<tr>
				<th scope="col" class="manage-column column-name column-primary" role="columnheader">
					<?php esc_html_e( 'Name', 'rewrite-rules-inspector' ); ?>
				</th>
				<th scope="col" class="manage-column column-structure" role="columnheader">
					<?php esc_html_e( 'Structure', 'rewrite-rules-inspector' ); ?>
				</th>
				<th scope="col" class="manage-column column-description" role="columnheader">
					<?php esc_html_e( 'Description', 'rewrite-rules-inspector' ); ?>
				</th>
			</tr>
		</tfoot>
	</table>
</div>
