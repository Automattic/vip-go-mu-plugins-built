<div id="lfapps-general-metabox-holder" class="metabox-holder clearfix">
    <?php wp_nonce_field('closedpostboxes', 'closedpostboxesnonce', false);
    wp_nonce_field('meta-box-order', 'meta-box-order-nonce', false);
    ?>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            jQuery('.if-js-closed').removeClass('if-js-closed').addClass('closed');
            if (typeof postboxes !== 'undefined')
                postboxes.add_postbox_toggles('plugins_page_livefyre_chat');
        });
    </script>    
    
    <div class="postbox-container postbox-large">
        <div id="normal-sortables" class="meta-box-sortables ui-sortable">
            <div id="referrers" class="postbox ">
                <div class="handlediv" title="Click to toggle"><br></div>
                <h3 class="hndle"><span><?php esc_html_e('Chat Settings', 'lfapps-chat'); ?></span></h3>
                <form name="livefyre_chat_general" id="livefyre_chat_general" action="options.php" method="POST">
                    <?php settings_fields('livefyre_apps_settings_chat'); ?>
                    <div class='inside'>
                        <table cellspacing="0" class="lfapps-form-table">
                            <tr>
                                <th align="left" scope="row">
                                    <?php esc_html_e('Enable Chat on', 'lfapps-chat'); ?>
                                </th>
                                <td align="left" valign="top">
                                    <?php
                                    $excludes = array( '_builtin' => false );
                                    $post_types = get_post_types( $args = $excludes );
                                    $post_types = array_merge(array('post'=>'post', 'page'=>'page'), $post_types);
                                    $used_types = LFAPPS_Chat_Admin::get_comments_display_post_types();
                                    
                                    foreach ($post_types as $post_type ) {
                                        $post_type_name = 'livefyre_chat_display_' .$post_type;
                                        $checked = '';
                                        if(get_option('livefyre_apps-'.$post_type_name)) {
                                            $checked = 'checked';
                                        } 
                                        $post_type_name_comments = 'livefyre_apps-livefyre_display_' .$post_type;
                                        $disabled = false;
                                        if(isset($used_types[$post_type_name_comments])) {
                                            $disabled = true;
                                        }
                                        ?>
                                        <input <?php echo $disabled ? 'disabled' : ''; ?> type="checkbox" id="<?php echo esc_attr('livefyre_apps-'.$post_type_name); ?>" name="<?php echo esc_attr('livefyre_apps-'.$post_type_name); ?>" value="true" <?php echo $checked; ?>/>
                                        <label for="<?php echo esc_attr('livefyre_apps-'.$post_type_name); ?>"><?php echo esc_html_e($post_type, 'lfapps-chat'); ?><?php echo $disabled ? ' <small><em>(Comments enabled.)</em></small>' : ''; ?></label><br/>
                                        <?php
                                    }
                                    ?>
                                </td>
                            </tr>
                            <tr>
                                <td colspan='2'>
                                    <?php esc_html_e('(Select the types of posts on which you wish to enable Chat. Note: Only Chat or Comments may be enabled for each of these options.)', 'lfapps-chat'); ?>
                                </td>
                            </tr>
                            <tr>
                                <td colspan='2'>
                                    <br />
                                    <strong>Comments Configuration Options:</strong>
                                    <p>There are multiple other configuration options available for Chat and you can specify them by
                                    declaring "liveChatConfig" variable in your theme header. For example:</p>
                                    <blockquote class="code">
                                    <?php echo esc_html("<script>
                                         var liveChatConfig = { disableAvatars: true; }
                                         </script>"); ?>                                            
                                    </blockquote>
                                    <p><a target="_blank" href="http://answers.livefyre.com/developers/app-integrations/chat/#convConfigObject">Click here</a> for a full explanation of Chat options.</p>
                                    <strong>Chat String Customizations:</strong>
                                    <p>String customizations are possible as well through applying WordPress filters. Information on how to implement this is <a target="_blank" href="http://answers.livefyre.com/developers/cms-plugins/wordpress/">found here</a>.</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div id="major-publishing-actions">									
                        <div id="publishing-action">
                            <?php submit_button(); ?>
                        </div>
                        <div class="clear"></div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="postbox-container postbox-large">
        <div id="normal-sortables" class="meta-box-sortables ui-sortable">
            <div id="referrers" class="postbox ">
                <div class="handlediv" title="Click to toggle"><br></div>
                <h3 class="hndle"><span><?php esc_html_e('Chat Status', 'lfapps-chat'); ?></span></h3>
                <div class="inside">
                    <div class='lfcomments-status-row clearfix'>
                        <div class='lfcomments-status-box'>
                            <?php $conflicting_plugins = LFAPPS_Chat_Admin::get_conflicting_plugins(); ?>
                            <h4><?php esc_html_e('Conflicting Plugins', 'lfapps-chat'); ?> (<?php echo esc_html(count($conflicting_plugins)); ?>)</h4>
                            <?php if(count($conflicting_plugins) > 0): ?>
                            <ul>
                                <?php foreach($conflicting_plugins as $plugin): ?>
                                <li><?php echo esc_html($plugin); ?></li>
                                <?php endforeach; ?>
                            </ul>
                            <?php else: ?>
                            <p><?php esc_html_e('There are no conflicting plugins', 'lfapps-chat'); ?></p>
                            <?php endif; ?>
                        </div>
                        <div class='lfcomments-status-box'>
                            <?php
                            $posts_with_closed_comments = LFAPPS_Chat_Admin::select_nc_posts('post');
                            $pages_with_closed_comments = LFAPPS_Chat_Admin::select_nc_posts('page');
                            
                            $count_posts_with_closed_comments = count($posts_with_closed_comments) + count($pages_with_closed_comments);
                            ?>
                            <h4><?php esc_html_e('Allow Comments/Chat Status', 'lfapps-chat'); ?> (<?php echo esc_html($count_posts_with_closed_comments); ?>)</h4>
                            <?php if($count_posts_with_closed_comments > 0): ?>
                                <p class="info">We've automagically found that you do not have the "Allow Comments" box in WordPress checked on the posts and pages listed below, which means that the Livefyre widget will not be present on them. 
                                To be sure that the Chat widget is visible on these posts or pages, simply click on the "enable" button next to each.</p>
                                <p class="info">If you'd like to simply close commenting on any post or page with the Livefyre widget still present, you can do so from your Livefyre admin panel by clicking the "Livefyre Admin" link to the right, 
                                clicking "Conversations", and then clicking "Stream Settings."</p>
                                <?php if(count($posts_with_closed_comments) > 0): ?>
                                <span><strong><?php echo esc_html_e('Posts'); ?></strong></span>
                                <ul>
                                    <?php foreach ( $posts_with_closed_comments as $ncpost ): ?>
                                        <li>ID: <span><?php echo esc_html($ncpost->ID); ?></span>  Title:</span> <span><a href="<?php echo get_permalink($ncpost->ID); ?>"><?php echo esc_html($ncpost->post_title); ?></a></span>
                                        <a href="<?php echo esc_url(Livefyre_Apps_Admin::get_page_url('livefyre_apps_chat')); ?>&allow_comments_id=<?php echo esc_attr($ncpost->ID); ?>" class="lfcomments-allow-btn">Enable</a></li>
                                    <?php endforeach; ?>
                                </ul>
                                <?php endif; ?>
                                <?php if(count($pages_with_closed_comments) > 0): ?>
                                <span><strong><?php echo esc_html_e('Pages'); ?></strong></span>
                                <ul>
                                    <?php foreach ( $pages_with_closed_comments as $ncpost ): ?>
                                        <li>ID: <span><?php echo esc_html($ncpost->ID); ?></span>  Title:</span> <span><a href="<?php echo get_permalink($ncpost->ID); ?>"><?php echo esc_html($ncpost->post_title); ?></a></span>
                                        <a href="<?php echo esc_url(Livefyre_Apps_Admin::get_page_url('livefyre_apps_chat')); ?>&allow_comments_id=<?php echo esc_attr($ncpost->ID); ?>" class="lfcomments-allow-btn">Enable</a></li>
                                    <?php endforeach; ?>
                                </ul>
                                <?php endif; ?>
                            <?php else: ?>
                            <p><?php esc_html_e('There are no posts with comments/chat not allowed', 'lfapps-chat'); ?></p>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="postbox-container postbox-large">
        <div id="normal-sortables" class="meta-box-sortables ui-sortable">
            <div id="referrers" class="postbox ">
                <div class="handlediv" title="Click to toggle"><br></div>
                <h3 class="hndle"><span><?php esc_html_e('Chat Shortcode', 'lfapps-chat'); ?></span></h3>
                <div class='inside'>
                    <p>Chat can also be activated by placing a shortcode inside your content.</p>
                    <p>The shortcode usage is pretty simple. Let's say we wish to generate a Chat stream inside post content. We could enter something like this
                        inside the content editor:</p>
                    <p class='code'>[livefyre_livechat]</p>
                    <p>Chat streams are separated by the "Article ID" and if not specified it will use the current post ID. You can define the "Article ID"
                        manually like this:</p>
                    <p class='code'>[livefyre_livechat article_id="123"]</p>
                </div> 
            </div>
        </div>
    </div>            
</div>