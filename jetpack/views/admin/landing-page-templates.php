<?php
	$modules = 	array('Appearance', 'Developers', 'Mobile', 'Other', 'Photos and Videos', 'Social', 'WordPress.com Stats', 'Writing' );
?>
<script id="tmpl-category" type="text/html">
	<?php foreach( $modules as $module ){
		$translated_module = Jetpack::translate_module_tag( $module );
		$module_slug = strtolower ( str_replace( array( ' ', '.' ) , array( '-', '' ) , $translated_module ) ); ?>
		<div class="cat category-<?php echo esc_attr( $module_slug  ); ?> "><h3><?php echo esc_html( $translated_module ); ?></h3><div class="clear"></div></div>
	<?php } ?>
</script>
<script id="tmpl-modalLoading" type="text/html">
	<div class="loading"><span><?php esc_html_e( 'loading&hellip;', 'jetpack' ); ?></span></div>
</script>
<script id="tmpl-mod" type="text/html">
	<div href="{{ data.url }}" tabindex="0" data-index="{{ data.index }}" data-name="{{ data.name }}" class="module{{ ( data.new ) ? ' new' : '' }}{{ data.activated ? ' active' : '' }}">
		<h3 class="icon {{ data.module }}">{{{ data.name }}}<# if ( ! data.free ) { #><span class="paid"><?php echo esc_html_x( 'Paid', 'As in Premium. Premium module description', 'jetpack' ); ?></span><# } #></h3>
		<p>{{{ data.short_description }}}</p>
	</div>
</script>
<script id="tmpl-modconfig" type="text/html">
	<tr class="configs{{ ( data.active ) ? ' active' : '' }}">
		<td class="sm"><input type="checkbox"></td>
		<td><a href="{{ data.url }}" data-name="{{ data.name }}">{{{ data.name }}}</a></td>
		<td class="med"><a href="{{ data.url }}" data-name="{{{ data.name }}}"><span class="genericon genericon-help" title="<?php esc_attr_e( 'Learn more', 'jetpack' ); ?>"></span></a><# if ( data.hasConfig ) { #><a href="{{ data.url }}" data-name="{{ data.name }}"><span class="genericon genericon-cog" title="<?php esc_attr_e( 'Configure', 'jetpack' ); ?>"></span></a><# } #></td>
	</tr>
</script>
<script id="tmpl-mod-recommended" type="text/html">
	<div href="{{ data.url }}" tabindex="0" data-index="{{ data.index }}" data-name="{{ data.name }}" class="module{{ data.activated ? ' active' : '' }}">
		<h3 class="icon press {{ data.module }}">{{{ data.name }}}</h3>
		<p>{{{ data.short_description }}}</p>
		<?php if ( current_user_can( 'jetpack_manage_modules' ) ) : ?>
		<# if ( data.activated && data.configurable ) { #>
			<span class='configure'><a class="button alignright" href="{{ data.configure_url }}" data-name="{{ data.name }}" title="<?php esc_attr_e( 'Configure', 'jetpack' ); ?>"><?php _e( 'Configure', 'jetpack' ); ?></a></span>
		<# } else if ( !data.activated && data.available ) { #>
			<span class='activate'><a class="button-primary alignright{{ data.configurable ? ' configurable' : ' notconfigurable' }}" href="<?php echo admin_url( 'admin.php' ); ?>?page=jetpack&#038;action=activate&#038;module={{{ data.module }}}&#038;_wpnonce={{{ data.activate_nonce }}}"><?php _e( 'Activate', 'jetpack' ); ?></a></span>
		<# } #>
		<?php endif; ?>
	</div>
</script>
<script id="tmpl-mod-jumpstart" type="text/html">
	<div class="j-col j-lrg-4 jp-jumpstart {{ ( data.activated ) ? 'active' : '' }}">
		<strong>{{{ data.name }}}</strong>
		<# if ( data.activated ) { #>
			<span class="jp-config-status"><?php esc_html_e( 'Activated', 'jetpack' ); ?></span>
		<# } #>
		<small>{{{ data.jumpstart_desc }}}</small>
	</div>
</script>
