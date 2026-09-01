<?php
/**
 * SEO Check ability - WordPress Abilities API compatible.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the SEO check.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_seo_check( ?array $input = null ) {
	$input   = $input ?? array();
	$content = '';
	$title   = '';
	$post    = null;

	// Get content from post or input.
	if ( ! empty( $input['post_id'] ) ) {
		$post = get_post( $input['post_id'] );
		if ( $post ) {
			$permission_error = require_post_edit_permission( (int) $input['post_id'] );
			if ( $permission_error ) {
				return $permission_error;
			}

			$content = $post->post_content;
			$title   = $post->post_title;
		}
	} elseif ( ! empty( $input['content'] ) ) {
		$content = $input['content'];
		$title   = $input['title'] ?? '';
	}

	if ( empty( $content ) ) {
		return new \WP_Error(
			'no_content',
			__( 'No content to analyze.', 'vip-workflows' )
		);
	}

	$issues      = array();
	$suggestions = array();
	$analysis    = array();
	$score       = 100;

	// Get plain text content.
	$plain_content = wp_strip_all_tags( $content );
	$word_count    = str_word_count( $plain_content );

	$analysis['word_count'] = $word_count;

	$settings = \VIPWorkflows\Abilities\AbilitySettings::get_instance()->get_options( 'vip-workflows/seo-check' );

	// Check 1: Content length.
	$min_words = $settings['min_words'] ?? 300;
	if ( $word_count < $min_words ) {
		$score   -= 15;
		$issues[] = array(
			'type'      => 'content_length',
			'check_key' => 'min_words',
			'message'   => sprintf(
			/* translators: 1: Current word count, 2: Minimum word count */
				__( 'Content is short (%1$d words). Aim for at least %2$d words for better SEO.', 'vip-workflows' ),
				$word_count,
				$min_words
			),
			'severity'  => 'warning',
		);
		$suggestions[] = array(
			'type'    => 'add_content',
			'message' => __( 'Expand the content with more details, examples, or related information.', 'vip-workflows' ),
		);
	}

	// Check 2: Title length.
	$title_length             = strlen( $title );
	$analysis['title_length'] = $title_length;

	if ( $title_length < 30 ) {
		$score   -= 10;
		$issues[] = array(
			'type'     => 'title_short',
			'message'  => __( 'Title is too short. Aim for 50-60 characters.', 'vip-workflows' ),
			'severity' => 'warning',
		);
	} elseif ( $title_length > 60 ) {
		$score   -= 5;
		$issues[] = array(
			'type'     => 'title_long',
			'message'  => __( 'Title may be truncated in search results (over 60 characters).', 'vip-workflows' ),
			'severity' => 'info',
		);
	}

	// Check 3: Headings structure.
	preg_match_all( '/<h([1-6])[^>]*>/i', $content, $headings );
	$heading_counts       = array_count_values( $headings[1] ?? array() );
	$analysis['headings'] = $heading_counts;

	if ( empty( $heading_counts ) ) {
		$score   -= 10;
		$issues[] = array(
			'type'     => 'no_headings',
			'message'  => __( 'No headings found. Use H2-H4 tags to structure content.', 'vip-workflows' ),
			'severity' => 'warning',
		);
		$suggestions[] = array(
			'type'    => 'add_headings',
			'message' => __( 'Break up content with descriptive headings (H2, H3).', 'vip-workflows' ),
		);
	}

	// Check 4: Images with alt text.
	preg_match_all( '/<img[^>]+>/i', $content, $images );
	$image_count        = count( $images[0] ?? array() );
	$images_without_alt = 0;

	foreach ( $images[0] ?? array() as $img ) {
		if ( ! preg_match( '/alt=["\'][^"\']+["\']/i', $img ) ) {
			$images_without_alt++;
		}
	}

	$analysis['image_count']        = $image_count;
	$analysis['images_without_alt'] = $images_without_alt;

	$min_images = $settings['min_images'] ?? 1;
	if ( $image_count < $min_images && $word_count > 300 ) {
		$score   -= 5;
		$issues[] = array(
			'type'      => 'no_images',
			'check_key' => 'min_images',
			'message'   => __( 'No images found. Adding relevant images can improve engagement.', 'vip-workflows' ),
			'severity'  => 'info',
		);
	}

	if ( $images_without_alt > 0 ) {
		$score   -= 5 * $images_without_alt;
		$issues[] = array(
			'type'      => 'missing_alt',
			'check_key' => 'min_images',
			'message'   => sprintf(
			/* translators: %d: Number of images missing alt text */
				__( '%d image(s) missing alt text. Alt text improves accessibility and SEO.', 'vip-workflows' ),
				$images_without_alt
			),
			'severity'  => 'warning',
		);
	}

	// Check 5: Internal links.
	preg_match_all( '/<a[^>]+href=["\']([^"\']+)["\']/i', $content, $links );
	$internal_links = 0;
	$external_links = 0;
	$site_url       = home_url();

	foreach ( $links[1] ?? array() as $href ) {
		if ( strpos( $href, $site_url ) === 0 || strpos( $href, '/' ) === 0 ) {
			$internal_links++;
		} else {
			$external_links++;
		}
	}

	$analysis['internal_links'] = $internal_links;
	$analysis['external_links'] = $external_links;

	if ( 0 === $internal_links && 300 < $word_count ) {
		$score        -= 5;
		$suggestions[] = array(
			'type'    => 'add_internal_links',
			'message' => __( 'Add internal links to related content on your site.', 'vip-workflows' ),
		);
	}

	// Check 6: Meta description (if post available).
	$check_meta = $settings['check_meta'] ?? true;
	if ( $check_meta && $post ) {
		$meta_desc = get_post_meta( $post->ID, '_yoast_wpseo_metadesc', true );
		$meta_desc = $meta_desc ? $meta_desc : get_post_meta( $post->ID, '_aioseop_description', true );
		$meta_desc = $meta_desc ? $meta_desc : $post->post_excerpt;

		$meta_length                         = strlen( $meta_desc );
		$analysis['meta_description_length'] = $meta_length;

		if ( empty( $meta_desc ) ) {
			$score   -= 10;
			$issues[] = array(
				'type'      => 'no_meta_description',
				'check_key' => 'check_meta',
				'message'   => __( 'No meta description set. This appears in search results.', 'vip-workflows' ),
				'severity'  => 'warning',
			);
		} elseif ( $meta_length < 120 ) {
			$score   -= 5;
			$issues[] = array(
				'type'      => 'meta_short',
				'check_key' => 'check_meta',
				'message'   => __( 'Meta description is short. Aim for 150-160 characters.', 'vip-workflows' ),
				'severity'  => 'info',
			);
		} elseif ( $meta_length > 160 ) {
			$score   -= 5;
			$issues[] = array(
				'type'      => 'meta_long',
				'check_key' => 'check_meta',
				'message'   => __( 'Meta description may be truncated (over 160 characters).', 'vip-workflows' ),
				'severity'  => 'info',
			);
		}
	}

	// Check 7: Focus keyword (if provided).
	$focus_keyword = $input['focus_keyword'] ?? '';
	if ( $focus_keyword ) {
		$keyword_in_title   = stripos( $title, $focus_keyword ) !== false;
		$keyword_in_content = substr_count( strtolower( $plain_content ), strtolower( $focus_keyword ) );
		$keyword_density    = $word_count > 0 ? ( $keyword_in_content / $word_count ) * 100 : 0;

		$analysis['focus_keyword']    = $focus_keyword;
		$analysis['keyword_in_title'] = $keyword_in_title;
		$analysis['keyword_count']    = $keyword_in_content;
		$analysis['keyword_density']  = round( $keyword_density, 2 );

		if ( ! $keyword_in_title ) {
			$score   -= 10;
			$issues[] = array(
				'type'     => 'keyword_not_in_title',
				'message'  => sprintf(
				/* translators: %s: Focus keyword */
					__( 'Focus keyword "%s" not found in title.', 'vip-workflows' ),
					$focus_keyword
				),
				'severity' => 'warning',
			);
		}

		if ( 0 === $keyword_in_content ) {
			$score   -= 15;
			$issues[] = array(
				'type'     => 'keyword_not_in_content',
				'message'  => sprintf(
				/* translators: %s: Focus keyword */
					__( 'Focus keyword "%s" not found in content.', 'vip-workflows' ),
					$focus_keyword
				),
				'severity' => 'error',
			);
		} elseif ( $keyword_density < 0.5 ) {
			$score   -= 5;
			$issues[] = array(
				'type'     => 'keyword_density_low',
				'message'  => __( 'Keyword density is low. Consider using the keyword more naturally.', 'vip-workflows' ),
				'severity' => 'info',
			);
		}
	}

	// Clamp score.
	$score = max( 0, min( 100, $score ) );

	// Generate summary.
	$issue_count = count( $issues );
	if ( $score >= 80 ) {
		$summary = __( 'Good SEO! Minor improvements possible.', 'vip-workflows' );
		$status  = 'pass';
	} elseif ( $score >= 50 ) {
		/* translators: %d: Number of issues */
		$summary = sprintf( __( 'SEO needs work. %d issues found.', 'vip-workflows' ), $issue_count );
		$status  = 'warning';
	} else {
		/* translators: %d: Number of issues */
		$summary = sprintf( __( 'Poor SEO score. Address %d issues to improve.', 'vip-workflows' ), $issue_count );
		$status  = 'fail';
	}

	return array(
		'score'       => $score,
		'status'      => $status,
		'summary'     => $summary,
		'analysis'    => $analysis,
		'issues'      => $issues,
		'suggestions' => $suggestions,
	);
}

/**
 * Permission callback for SEO check.
 *
 * @return bool
 */
function can_execute_seo_check(): bool {
	return current_user_can( 'edit_posts' );
}

/**
 * Register the SEO Check ability.
 *
 * Called on wp_abilities_api_init hook.
 *
 * @return void
 */
function register_seo_check(): void {
	wp_register_ability(
		'vip-workflows/seo-check',
		array(
			'label'               => __( 'SEO Check', 'vip-workflows' ),
			'description'         => __( 'Analyze content for SEO best practices including meta description, headings, keyword usage, and more.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'post_id'        => array(
						'type'        => 'integer',
						'description' => __( 'The post ID to analyze.', 'vip-workflows' ),
					),
					'content'        => array(
						'type'        => 'string',
						'description' => __( 'Raw content to analyze (alternative to post_id).', 'vip-workflows' ),
					),
					'title'          => array(
						'type'        => 'string',
						'description' => __( 'Post title (required if using content).', 'vip-workflows' ),
					),
					'focus_keyword'  => array(
						'type'        => 'string',
						'description' => __( 'Focus keyword to check for.', 'vip-workflows' ),
					),
					'min_words'      => array(
						'type'        => 'integer',
						'description' => __( 'Minimum word count.', 'vip-workflows' ),
					),
					'min_paragraphs' => array(
						'type'        => 'integer',
						'description' => __( 'Minimum paragraph count.', 'vip-workflows' ),
					),
					'min_images'     => array(
						'type'        => 'integer',
						'description' => __( 'Minimum image count.', 'vip-workflows' ),
					),
					'check_meta'     => array(
						'type'        => 'boolean',
						'description' => __( 'Check meta description.', 'vip-workflows' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'score', 'status', 'summary' ),
				'properties'           => array(
					'score'       => array(
						'type'        => 'number',
						'description' => __( 'SEO score from 0-100.', 'vip-workflows' ),
					),
					'status'      => array(
						'type'        => 'string',
						'enum'        => array( 'pass', 'warning', 'fail' ),
						'description' => __( 'Status: pass, warning, or fail.', 'vip-workflows' ),
					),
					'summary'     => array(
						'type'        => 'string',
						'description' => __( 'Summary message.', 'vip-workflows' ),
					),
					'issues'      => array(
						'type'        => 'array',
						'description' => __( 'List of issues found.', 'vip-workflows' ),
					),
					'suggestions' => array(
						'type'        => 'array',
						'description' => __( 'List of improvement suggestions.', 'vip-workflows' ),
					),
					'analysis'    => array(
						'type'        => 'object',
						'description' => __( 'Detailed analysis data.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_seo_check',
			'permission_callback' => __NAMESPACE__ . '\\can_execute_seo_check',
			'meta'                => array(
				'show_in_rest'        => true,
				'show_in_commands'    => true,
				'icon'                => 'search',
				'type'                => 'check',
				'supports'            => array( 'workflow' ),
				'transition_eligible' => true,
				'settings_schema'     => array(
					'min_words'      => array(
						'type'        => 'integer',
						'default'     => 300,
						'label'       => __( 'Minimum word count', 'vip-workflows' ),
						'minimum'     => 50,
						'maximum'     => 5000,
						'enforceable' => true,
					),
					'min_paragraphs' => array(
						'type'        => 'integer',
						'default'     => 3,
						'label'       => __( 'Minimum paragraph count', 'vip-workflows' ),
						'minimum'     => 1,
						'maximum'     => 50,
						'enforceable' => true,
					),
					'min_images'     => array(
						'type'        => 'integer',
						'default'     => 1,
						'label'       => __( 'Minimum image count', 'vip-workflows' ),
						'minimum'     => 0,
						'maximum'     => 20,
						'enforceable' => true,
					),
					'check_meta'     => array(
						'type'        => 'boolean',
						'default'     => true,
						'label'       => __( 'Check meta description', 'vip-workflows' ),
						'enforceable' => true,
					),
				),
				'annotations'         => array(
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				),
			),
		)
	);
}
