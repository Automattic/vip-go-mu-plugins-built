<?php
if($display_template) {
    echo '<div id="'. esc_attr($livefyre_element).'"></div>';
}
?>
<script type="text/javascript">
    var networkConfigChat = {
        <?php echo isset( $strings ) ? 'strings: ' . json_encode($strings) . ',' : ''; ?>
        network: "<?php echo esc_js($network->getName()); ?>"
    };
    var convConfigChat<?php echo esc_js($articleId); ?> = {
        siteId: "<?php echo esc_js($siteId); ?>",
        articleId: "<?php echo esc_js($articleId); ?>",
        el: "<?php echo esc_js($livefyre_element); ?>",
        collectionMeta: "<?php echo esc_js($collectionMetaToken); ?>",
        checksum: "<?php echo esc_js($checksum); ?>"
    };
    
    if(typeof(liveChatConfig) !== 'undefined') {
        convConfigChat<?php echo esc_js($articleId); ?> = Livefyre.LFAPPS.lfExtend(liveChatConfig, convConfigChat<?php echo esc_js($articleId); ?>);
    }

    Livefyre.require(['<?php echo LFAPPS_Chat::get_package_reference(); ?>'], function(ConvChat) {
        load_livefyre_auth();
        new ConvChat(networkConfigChat, [convConfigChat<?php echo esc_js($articleId); ?>], function(chatWidget) {
            if(typeof chatWidget !== "undefined") {
                var livechatListeners = Livefyre.LFAPPS.getAppEventListeners('livechat');
                if(livechatListeners.length > 0) {
                    for(var i=0; i<livechatListeners; i++)) {
                        var livechatListener = livechatListeners[i];
                        chatWidget.on(livechatListener.eventName, livechatListener.callback);
                    }
                }
            }
        });
    });
</script>