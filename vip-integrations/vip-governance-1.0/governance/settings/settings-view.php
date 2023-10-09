<?php
/**
 * The settings view
 * 
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

defined( 'ABSPATH' ) || die();

$is_governance_error        = false !== $governance_error;
$governance_rules_formatted = join("\n", array_map(function ( $line ) {
	return sprintf( '<code>%s</code>', esc_html( $line ) );
}, explode( "\n", trim( $governance_rules_json ) )));

?>

<div class="wrap">
	<h1><?php esc_html_e( 'WordPress VIP Block Governance' ); ?></h1>

	<form action="options.php" method="post">
		<?php
		settings_fields( Settings::OPTIONS_KEY );
		do_settings_sections( Settings::MENU_SLUG );
		submit_button();
		?>
	</form>

	<hr/>

	<?php /* translators: %s: A ✅ or ❌ emoji */ ?>
	<h2><?php printf( esc_html__( '%s Governance Rules Validation' ), $is_governance_error ? '❌' : '✅' ); ?></h2>

	<div class="governance-rules <?php echo $is_governance_error ? 'with-errors' : ''; ?>">
		<div class="governance-rules-validation">
			<?php if ( $is_governance_error ) { ?>
			<p class="validation-errors"><?php esc_html_e( 'Failed to load:' ); ?></p>
			<pre><?php echo esc_html( $governance_error ); ?></pre>
			<?php } else { ?>
			<p><?php esc_html_e( 'Rules loaded successfully.' ); ?></p>
			<?php } ?>
		</div>

		<div class="governance-rules-json">
			<?php if ( $is_governance_error ) { ?>
			<p><?php esc_html_e( 'From governance rules:' ); ?></p>
			<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Lines are individually escaped ?>
			<pre><?php echo $governance_rules_formatted; ?></pre>
			<?php } else { ?>
			<details>
				<summary><?php esc_html_e( 'Click to expand governance rules' ); ?></summary>

				<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Lines are individually escaped ?>
				<pre><?php echo $governance_rules_formatted; ?></pre>
			</details>
			<?php } ?>
		</div>
	</div>

	<?php if ( ! $is_governance_error ) { ?>
	<hr/>
		<div class="combined-governance-rules">
			<h2><?php esc_html_e( 'View Governance Rules For A Rule Type' ); ?></h2>
			<p class="description">Rules for a type like roles work by combining the type's governance rules with default rules. Use this tool to view rules using the role/post type and debug permissions issues.</p>
			<select name="user-role-selector" id="user-role-selector" style="margin: 1rem 0 0.5rem">
				<option value="">All Roles</option>
				<?php foreach ( $user_roles_available as $user_role_available ) { ?>
					<option value="<?php echo esc_attr( $user_role_available ); ?>"><?php echo esc_html( $user_role_available ); ?></option>
				<?php } ?>
			</select>

			<select name="post-type-selector" id="post-type-selector" style="margin: 1rem 0 0.5rem">
				<option value="">All Post Types</option>
				<?php foreach ( $post_types_available as $post_type_available ) { ?>
					<option value="<?php echo esc_attr( $post_type_available ); ?>"><?php echo esc_html( $post_type_available ); ?></option>
				<?php } ?>
			</select>

			<button class="button button-primary view-rules-button" id="view-rules-button" style="margin: 1rem 0 0.5rem 0.5rem; display: none">View Rules</button>

			<span class="spinner vip-governance-query-spinner" style="float: none; margin-top: 0.5rem"></span>
			<pre class="combined-governance-rules-json" id="json" style="margin: 1rem 0" hidden></pre>
		</div>
	<?php } ?>

	<hr/>

	<h2><?php esc_html_e( 'Debug Information' ); ?></h2>
	<p>
		<?php
			/* translators: %s: Plugin version number */
			printf( esc_html__( 'Plugin Version: %s' ), esc_html( WPCOMVIP__GOVERNANCE__PLUGIN_VERSION ) );
		?>
	</p>
</div>
