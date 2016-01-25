<div id="lfapps-general-metabox-holder" class="metabox-holder clearfix">
    <?php
    wp_nonce_field('closedpostboxes', 'closedpostboxesnonce', false);
    wp_nonce_field('meta-box-order', 'meta-box-order-nonce', false);
    ?>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            jQuery('.if-js-closed').removeClass('if-js-closed').addClass('closed');
            if (typeof postboxes !== 'undefined')
                postboxes.add_postbox_toggles('plugins_page_livefyre_blog');
        });
    </script>    
    <div class="postbox-container postbox-large">
        <div id="normal-sortables" class="meta-box-sortables ui-sortable">
            <div id="referrers" class="postbox ">
                <div class="handlediv" title="Click to toggle"><br></div>
                <h3 class="hndle"><span><?php esc_html_e('Live Blog Settings', 'lfapps-blog'); ?></span></h3>
                <form name="livefyre_comments_blog" id="livefyre_blog_general" action="options.php" method="POST">
                    <?php settings_fields('livefyre_apps_settings_blog'); ?>
                    <div class='inside'>
                        <table cellspacing="0" class="lfapps-form-table">
                            <tr>
                                <th align="left" scope="row" style="width: 40%">
                                    <?php esc_html_e('Enable Live Blog on', 'lfapps-blog'); ?>
                                    <span class="info"><?php esc_html_e('(Select the types of posts on which you wish to enable the Live Blog Shortcode)', 'lfapps-blog'); ?></span>
                                </th>
                                <td align="left" valign="top">
                                    <?php
                                    $excludes = array( '_builtin' => false );
                                    $post_types = get_post_types( $args = $excludes );
                                    $post_types = array_merge(array('post'=>'post', 'page'=>'page'), $post_types);
                                    
                                    foreach ($post_types as $post_type ) {
                                        $post_type_name = 'livefyre_blog_display_' .$post_type;
                                        $checked = '';
                                        if(get_option('livefyre_apps-'.$post_type_name)) {
                                            $checked = 'checked';
                                        } 
                                        ?>
                                        <input type="checkbox" id="<?php echo esc_attr('livefyre_apps-'.$post_type_name); ?>" name="<?php echo esc_attr('livefyre_apps-'.$post_type_name); ?>" value="true" <?php echo $checked; ?>/>
                                        <label for="<?php echo esc_attr('livefyre_apps-'.$post_type_name); ?>"><?php echo esc_html_e($post_type, 'lfapps-blog'); ?></label><br/>
                                        <?php
                                    }
                                    ?>
                                    
                                </td>
                            </tr>
                            <tr>                               
                                <?php
                                $available_versions = Livefyre_Apps::get_available_package_versions('fyre.conv');
                                if (empty($available_versions)) {
                                    $available_versions = array(LFAPPS_Blog::$default_package_version);
                                }
                                $available_versions['latest'] = 'latest';
                                $available_versions = array_reverse($available_versions);
                                ?>
                                <th align="left" scope="row" style="width: 40%">
                                    <?php esc_html_e('Package version', 'lfapps-blog'); ?><br/>
                                    <span class="info"><?php esc_html_e('(If necessary you can revert back to an older version if available)', 'lfapps-blog'); ?></span>
                                </th>
                                <td align="left" valign="top">
                                    <select name="livefyre_apps-livefyre_blog_version">
                                        <?php foreach ($available_versions as $available_version): ?>
                                            <?php $selected_version = get_option('livefyre_apps-livefyre_blog_version', 'latest') == $available_version ? 'selected="selected"' : ''; ?>
                                            <option value="<?php echo esc_attr($available_version); ?>" <?php echo esc_html($selected_version); ?>>
                                                <?php echo ucfirst(esc_html($available_version)); ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </td>
                            </tr>   
                            <tr>
                                <td colspan='2'>
                                    <strong>Liveblog Configuration Options::</strong>
                                    <p>There multiple configuration options available for LiveBlog and you can specify them by
                                        declaring "liveBlogConfig" variable in your theme header. For example:</p>
                                    <blockquote class="code">
                                        <?php echo esc_html("<script>
                                          var liveBlogConfig = { readOnly: true; }
                                          </script>"); ?>                                           
                                    </blockquote>
                                    <p><a target="_blank" href="http://answers.livefyre.com/developers/app-integrations/live-blog/#convConfigObject">Click here</a> for a full explanation of Live Blog options.</p>
                                    <strong>Live Blog Customizations:</strong>
                                    <p>Additional customizations are possible through applying WordPress filters. Information on how to implement these are <a target="_blank" href="http://answers.livefyre.com/developers/cms-plugins/wordpress/">found here</a>.</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div id="major-publishing-actions">									
                        <div id="publishing-action">
                            <?php @submit_button(); ?>
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
                <h3 class="hndle"><span><?php esc_html_e('Live Blog Shortcode', 'lfapps-blog'); ?></span></h3>
                <div class='inside'>
                    <p>To activate Live Blog, you must add a shortcode to your content.</p>
                    <p>The shortcode usage is pretty simple. Let's say we wish to generate a Live Blog inside post content. We could enter something like this
                        inside the content editor:</p>
                    <p class='code'>[livefyre_liveblog]</p>
                    <p>Live Blog streams are separated by the "Article ID" and if not specified it will use the current post ID. You can define the "Article ID"
                        manually like this:</p>
                    <p class='code'>[livefyre_liveblog article_id="123"]</p>
                </div> 
            </div>
        </div>
    </div>     
</div>