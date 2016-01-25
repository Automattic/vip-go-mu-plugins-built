<?php
/*
Sub Plugin Name: LiveBlog
Plugin URI: http://www.livefyre.com/
Description: Implements LiveBlog
Version: 0.1
Author: Livefyre, Inc.
Author URI: http://www.livefyre.com/
 */

//Disallow direct access to this file
if(!defined('LFAPPS__PLUGIN_PATH')) 
    die('Bye');

use Livefyre\Livefyre;

require_once LFAPPS__PLUGIN_PATH . 'libs/php/LFAPPS_View.php';

if ( ! class_exists( 'LFAPPS_Blog' ) ) {
    class LFAPPS_Blog {
        public static $default_package_version = '3.0.0';
        private static $initiated = false;
        
        public static function init() {
            if ( ! self::$initiated ) {
                self::$initiated = true;
                self::init_hooks();    
                self::set_default_options();
            }
        }
                
        /**
         * Initialise WP hooks
         */
        private static function init_hooks() {
            if(self::blog_active())
                add_shortcode('livefyre_liveblog', array('LFAPPS_Blog', 'init_shortcode'));
        }
        
        public static function set_default_options() {
            if(get_option('livefyre_apps-livefyre_blog_version', '') === '') {
                update_option('livefyre_apps-livefyre_blog_version', 'latest');
            }            
        }
        
        public static function init_shortcode($atts=array()) {
            if(!self::show_blog()) {
                return;
            }
            if(isset($atts['article_id'])) {
                $articleId = $atts['article_id'];
                $title = isset($pagename) ? $pagename : 'Comments (ID: ' . $atts['article_id'];
                global $wp;
                $url = add_query_arg( $_SERVER['QUERY_STRING'], '', home_url( $wp->request ) );
                $tags = array();
            } else {
                global $post;
                if(get_the_ID() !== false) {
                    $articleId = apply_filters('livefyre_article_id', get_the_ID());
                    $title = apply_filters('livefyre_collection_title', get_the_title(get_the_ID()));
                    $url = apply_filters('livefyre_collection_url', get_permalink(get_the_ID()));
                    $tags = array();
                    $posttags = get_the_tags( $post->ID );
                    if ( $posttags ) {
                        foreach( $posttags as $tag ) {
                            array_push( $tags, $tag->name );
                        }
                    }
                } else {
                    return;
                }
            }
            Livefyre_Apps::init_auth();
            $network = get_option('livefyre_apps-livefyre_domain_name', 'livefyre.com' );
            $network = ( $network == '' ? 'livefyre.com' : $network );

            $siteId = get_option('livefyre_apps-livefyre_site_id' );
            $siteKey = get_option('livefyre_apps-livefyre_site_key' );
            $network_key = get_option('livefyre_apps-livefyre_domain_key', '');

            $network = Livefyre::getNetwork($network, strlen($network_key) > 0 ? $network_key : null);            
            $site = $network->getSite($siteId, $siteKey);

            $collectionMetaToken = $site->buildCollectionMetaToken($title, $articleId, $url, array("tags"=>$tags, "type"=>"liveblog"));
            $checksum = $site->buildChecksum($title, $url, $tags, 'liveblog');
            $strings = apply_filters( 'livefyre_custom_blog_strings', null );
            $livefyre_element = 'livefyre-blog-'.$articleId;
            return LFAPPS_View::render_partial('script', 
                    compact('siteId', 'siteKey', 'network', 'articleId', 'collectionMetaToken', 'checksum', 'strings', 'livefyre_element'), 
                    'blog', true);   
        }
                
        /**
         * Check if comments are active and there are no issues stopping them from loading
         * @return boolean
         */
        public static function blog_active() {
            return ( Livefyre_Apps::active());
        }
        
        /**
         * Get the Livefyre.require package reference name and version
         * @return string
         */
        public static function get_package_reference() {
            $option_version = get_option('livefyre_apps-livefyre_blog_version');
            $available_versions = Livefyre_Apps::get_available_package_versions('fyre.conv'); 
            if(empty($available_versions)) {
                $available_versions = array(LFAPPS_Blog::$default_package_version);
            }
            $required_version = Livefyre_Apps::get_package_reference();
            if(is_null($required_version)) {
                if($option_version == 'latest') {
                    //get latest version
                    $latest_version = array_pop($available_versions);
                    if(strpos($latest_version, '.') !== false) {
                        $required_version = substr($latest_version, 0, strpos($latest_version, '.'));
                    } else {
                        $required_version = $latest_version;
                    }
                } else {
                    $required_version = $option_version;
                }
            }
            
            return 'fyre.conv#'.$required_version;
        }
        
        /*
         * Handles the toggles on the settings page that decide which post types should be shown.
         * Also prevents comments from appearing on non single items and previews.
         *
         */

        public static function show_blog() {

            global $post;
            /* Is this a post and is the settings checkbox on? */
            $display_posts = ( is_single() && get_option('livefyre_apps-livefyre_blog_display_post'));
            /* Is this a page and is the settings checkbox on? */
            $display_pages = ( is_page() && get_option('livefyre_apps-livefyre_blog_display_page'));
            /* Are comments open on this post/page? */
            $comments_open = ( $post->comment_status == 'open' );

            $display = $display_posts || $display_pages;
            $post_type = get_post_type();
            if ($post_type != 'post' && $post_type != 'page') {

                $post_type_name = 'livefyre_blog_display_' . $post_type;
                $display = ( get_option('livefyre_apps-'.$post_type_name, 'true') == 'true' );
                if($post_type === false) {
                    $display = true;
                }
            }
            return $display 
                && Livefyre_Apps::is_app_enabled('blog')
                && !is_preview();
        }
    }
}
?>
