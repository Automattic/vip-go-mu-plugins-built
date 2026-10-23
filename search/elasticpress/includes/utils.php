<?php
/**
 * ElasticPress utility functions
 *
 * @since  3.0
 * @package elasticpress
 */

namespace ElasticPress\Utils;

use ElasticPress\IndexHelper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Retrieve the EPIO subscription credentials.
 *
 * @since 2.5
 * @return array
 */
function get_epio_credentials() {
	if ( defined( 'EP_CREDENTIALS' ) && EP_CREDENTIALS ) {
		$raw_credentials = explode( ':', EP_CREDENTIALS );
		if ( is_array( $raw_credentials ) && 2 === count( $raw_credentials ) ) {
			$credentials = array(
				'username' => $raw_credentials[0],
				'token'    => $raw_credentials[1],
			);
		}
		$credentials = sanitize_credentials( $credentials );
	} elseif ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK && is_epio() ) {
		$credentials = sanitize_credentials( get_site_option( 'ep_credentials', false ) );
	} elseif ( is_epio() ) {
		$credentials = sanitize_credentials( get_option( 'ep_credentials', false ) );
	} else {
		$credentials = [
			'username' => '',
			'token'    => '',
		];
	}

	if ( ! is_array( $credentials ) ) {
		return [
			'username' => '',
			'token'    => '',
		];
	}

	return $credentials;
}

/**
 * Get shield credentials
 *
 * @since  3.0
 * @return string|bool
 */
function get_shield_credentials() {
	if ( defined( 'ES_SHIELD' ) && ES_SHIELD ) {
		return ES_SHIELD;
	} elseif ( is_epio() ) {
		$credentials = get_epio_credentials();

		return $credentials['username'] . ':' . $credentials['token'];
	}

	return false;
}

/**
 * Retrieve the appropriate index prefix. Will default to EP_INDEX_PREFIX constant if it exists
 * AKA Subscription ID.
 *
 * @since 2.5
 * @return string|bool
 */
function get_index_prefix() {
	if ( defined( 'EP_INDEX_PREFIX' ) && EP_INDEX_PREFIX ) {
		$prefix = EP_INDEX_PREFIX;
	} elseif ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK && is_epio() ) {
		$prefix = get_site_option( 'ep_prefix', false );
	} elseif ( is_epio() ) {
		$prefix = get_option( 'ep_prefix', false );

		if ( '-' !== substr( $prefix, - 1 ) ) {
			$prefix .= '-';
		}
	} else {
		$prefix = '';
	}

	/**
	 * Filter index prefix. Defaults to nothing
	 *
	 * @since  2.5
	 * @hook ep_index_prefix
	 * @param  {string} $prefix Current prefix
	 * @return  {string} New prefix
	 */
	return apply_filters( 'ep_index_prefix', $prefix );
}

/**
 * Check if the host is ElasticPress.io.
 *
 * @since  2.6
 * @return bool
 */
function is_epio() {
	// VIP: We're on VIP, so return false immediately.
	return false;
}

/**
 * Determine if we should index a blog/site
 *
 * @param  int $blog_id Blog/site id.
 * @since  3.2
 * @return boolean
 */
function is_site_indexable( $blog_id = null ) {
	if ( is_multisite() ) {
		$site = get_site( $blog_id );

		$is_indexable = get_blog_option( (int) $blog_id, 'ep_indexable', 'yes' );

		if ( 'no' === $is_indexable || $site['deleted'] || $site['archived'] || $site['spam'] ) {
			return false;
		}
	}

	return true;
}

/**
 * Sanitize EPIO credentials prior to storing them.
 *
 * @param array $credentials Array containing username and token.
 * @since  2.6
 * @return array
 */
function sanitize_credentials( $credentials ) {
	if ( ! is_array( $credentials ) ) {
		return [
			'username' => '',
			'token'    => '',
		];
	}

	return [
		'username' => ( isset( $credentials['username'] ) ) ? sanitize_text_field( $credentials['username'] ) : '',
		'token'    => ( isset( $credentials['token'] ) ) ? sanitize_text_field( $credentials['token'] ) : '',
	];
}

/**
 * Determine if ElasticPress is in the middle of an index
 *
 * @since  3.0
 * @return boolean
 */
function is_indexing() {
	/**
	 * Filter whether an index is occurring in dashboard or CLI
	 *
	 * @since  3.0
	 * @hook ep_is_indexing
	 * @param  {bool} $indexing True for indexing
	 * @return {bool} New indexing value
	 */
	return apply_filters( 'ep_is_indexing', ! empty( IndexHelper::factory()->get_index_meta() ) );
}

/**
 * Check if wpcli indexing is occurring
 *
 * @since  3.0
 * @return boolean
 */
function is_indexing_wpcli() {
	$index_meta = IndexHelper::factory()->get_index_meta();

	/**
	 * Filter whether a CLI sync is occurring
	 *
	 * @since  3.0
	 * @hook ep_is_indexing_wpcli
	 * @param  {bool} $indexing True for indexing
	 * @return {bool} New indexing value
	 */
	return apply_filters( 'ep_is_indexing_wpcli', ( ! empty( $index_meta ) && 'cli' === $index_meta['method'] ) );
}

/**
 * Retrieve the appropriate host. Will default to EP_HOST constant if it exists
 *
 * @since 2.1
 * @return string|bool
 */
function get_host() {

	if ( defined( 'EP_HOST' ) && EP_HOST ) {
		$host = EP_HOST;
	} else {
		$host = get_option( 'ep_host', false );
	}

	/**
	 * Filter ElasticPress host to use
	 *
	 * @since  2.1
	 * @hook ep_host
	 * @param  {string} $host Current EP host
	 * @return  {string} Host to use
	 */
	return apply_filters( 'ep_host', $host );
}

/**
 * Get a site. Wraps get_site for formatting purposes
 *
 * @param  int $site_id Site/blog id
 * @since 3.2
 * @return array
 */
function get_site( $site_id ) {
	$site = \get_site( $site_id );

	return [
		'blog_id'  => $site->blog_id,
		'domain'   => $site->domain,
		'path'     => $site->path,
		'site_id'  => $site->site_id,
		'deleted'  => $site->deleted,
		'archived' => $site->archived,
		'spam'     => $site->spam,
	];
}

/**
 * Wrapper function for get_sites - allows us to have one central place for the `ep_indexable_sites` filter
 *
 * @param int $limit The maximum amount of sites retrieved, Use 0 to return all sites.
 * @since  3.0
 * @return array
 */
function get_sites( $limit = 0 ) {

	if ( ! is_multisite() ) {
		return [];
	}

	/**
	 * Filter arguments to use to query for sites on network
	 *
	 * @since  2.1
	 * @hook ep_indexable_sites_args
	 * @param  {array} $args Array of args to query sites with. See WP_Site_Query
	 * @return {array} New arguments
	 */
	$args = apply_filters(
		'ep_indexable_sites_args',
		array(
			'limit'  => $limit,
			'number' => $limit,
		)
	);

	$site_objects = \get_sites( $args );
	$sites        = [];

	foreach ( $site_objects as $site ) {
		$sites[] = get_site( $site->blog_id );
	}

	/**
	 * Filter indexable sites
	 *
	 * @since  3.0
	 * @hook ep_indexable_sites
	 * @param  {array} $sites Current sites. Instances of WP_Site
	 * @return  {array} New array of sites
	 */
	return apply_filters( 'ep_indexable_sites', $sites );
}

/**
 * Whether plugin is network activated
 *
 * Determines whether plugin is network activated or just on the local site.
 *
 * @since 3.0
 * @param string $plugin the plugin base name.
 * @return bool True if network activated or false.
 */
function is_network_activated( $plugin ) {

	$plugins = get_site_option( 'active_sitewide_plugins' );

	if ( is_multisite() && isset( $plugins[ $plugin ] ) ) {
		return true;
	}

	return false;
}


/**
 * Performant utility function for building a term tree.
 *
 * Tree will look like this:
 * [
 *      WP_Term(
 *          name
 *          slug
 *          children ->[
 *              WP_Term()
 *          ]
 *      ),
 *      WP_Term()
 * ]
 *
 * @param  array       $all_terms Pass get_terms() as this argument where terms are objects NOT arrays.
 * @param  string|bool $orderby   Can be count|name|false. This is how each tree branch will be ordered.
 * @param  string      $order     Can be asc|desc. This is the direction ordering will occur.
 * @param  bool        $flat      If false, a tree will be returned e.g. an array of top level terms
 *                                which children linked within each node. If true, the tree will be
 *                                "flattened".
 * @since  2.5
 * @return array
 */
function get_term_tree( $all_terms, $orderby = 'count', $order = 'desc', $flat = false ) {
	$terms_map    = [];
	$terms_tree   = [];
	$iteration_id = 0;

	while ( true ) {
		if ( empty( $all_terms ) ) {
			break;
		}

		foreach ( $all_terms as $key => $term ) {
			$iteration_id++;

			if ( ! isset( $term->children ) ) {
				$term->children = [];
			}

			if ( ! isset( $terms_map[ $term->term_id ] ) ) {
				$terms_map[ $term->term_id ] = $term;
			}

			$parent_term = get_term( $term->parent, $term->taxonomy );

			if ( empty( $term->parent ) || is_wp_error( $parent_term ) || ! $parent_term ) {
				$term->level = 0;

				if ( empty( $orderby ) ) {
					$terms_tree[] = $term;
				} elseif ( 'count' === $orderby ) {
					/**
					 * We add this weird number to get past terms with the same count
					 */
					$terms_tree[ ( ( $term->count * 10000000 ) + $iteration_id ) ] = $term;
				} elseif ( 'name' === $orderby ) {
					$terms_tree[ strtolower( $term->name ) ] = $term;
				}

				unset( $all_terms[ $key ] );
			} else {
				if ( ! empty( $terms_map[ $term->parent ] ) && isset( $terms_map[ $term->parent ]->level ) ) {

					if ( empty( $orderby ) ) {
						$terms_map[ $term->parent ]->children[] = $term;
					} elseif ( 'count' === $orderby ) {
						$terms_map[ $term->parent ]->children[ ( ( $term->count * 10000000 ) + $iteration_id ) ] = $term;
					} elseif ( 'name' === $orderby ) {
						$terms_map[ $term->parent ]->children[ $term->name ] = $term;
					}

					$parent_level = ( $terms_map[ $term->parent ]->level ) ? $terms_map[ $term->parent ]->level : 0;

					$term->level       = $parent_level + 1;
					$term->parent_term = $terms_map[ $term->parent ];

					unset( $all_terms[ $key ] );
				}
			}
		}
	}

	if ( ! empty( $orderby ) ) {
		if ( 'asc' === $order ) {
			ksort( $terms_tree );
		} else {
			krsort( $terms_tree );
		}

		foreach ( $terms_map as $term ) {
			if ( 'asc' === $order ) {
				ksort( $term->children );
			} else {
				krsort( $term->children );
			}

			$term->children = array_values( $term->children );
		}

		$terms_tree = array_values( $terms_tree );
	}

	if ( $flat ) {
		$flat_tree = [];

		foreach ( $terms_tree as $term ) {
			$flat_tree[] = $term;
			$to_process  = $term->children;
			while ( ! empty( $to_process ) ) {
				$term        = array_shift( $to_process );
				$flat_tree[] = $term;

				if ( ! empty( $term->children ) ) {
					$to_process = array_merge( $term->children, $to_process );
				}
			}
		}

		return $flat_tree;
	}

	return $terms_tree;
}

/**
 * Returns the defaiult language for ES mapping.
 *
 * @return string Default EP language.
 */
function get_language() {
	if ( defined( 'EP_IS_NETWORK' ) && EP_IS_NETWORK ) {
		$ep_language = get_site_option( 'ep_language' );
	} else {
		$ep_language = get_option( 'ep_language' );
	}

	$ep_language = ! empty( $ep_language ) ? $ep_language : get_locale();

	/**
	 * Filter the default language to use at index time
	 *
	 * @since  3.1
	 * @param {string} The current language.
	 * @hook ep_default_language
	 * @return  {string} New language
	 */
	return apply_filters( 'ep_default_language', $ep_language );
}

/**
 * Returns the status of an ongoing index operation.
 *
 * Returns the status of an ongoing index operation in array with the following fields:
 * indexing | boolean | True if index operation is ongoing or false
 * method | string | 'cli', 'web' or 'none'
 * items_indexed | integer | Total number of items indexed
 * total_items | integer | Total number of items indexed or -1 if not yet determined
 * slug | string | The slug of the indexable
 *
 * @since  3.5.2
 * @return array|boolean
 */
function get_indexing_status() {

	$index_status = false;

	$index_meta = IndexHelper::factory()->get_index_meta();

	if ( ! empty( $index_meta ) ) {
		$index_status = $index_meta;

		$index_status['indexing'] = true;

		if ( ! empty( $index_meta['current_sync_item'] ) ) {
			$index_status['items_indexed'] = $index_meta['current_sync_item']['synced'];
			$index_status['url']           = $index_meta['current_sync_item']['url'] ?? ''; // Global indexables won't have a url.
			$index_status['total_items']   = $index_meta['current_sync_item']['total'];
			$index_status['slug']          = $index_meta['current_sync_item']['indexable'];
		}

		// Change method name for retrocompatibility.
		// `dashboard` is used mainly because hooks names depend on that.
		if ( ! empty( $index_status['method'] ) && 'dashboard' === $index_status['method'] ) {
			$index_status['method'] = 'web';
		}

		if ( ! empty( $index_status['method'] ) && 'web' === $index_status['method'] ) {
			$should_interrupt_sync = filter_var(
				get_transient( 'ep_sync_interrupted' ),
				FILTER_VALIDATE_BOOLEAN
			);

			$index_status['should_interrupt_sync'] = $should_interrupt_sync;
		}
	}

	return $index_status;

}

/**
 * Use the correct update option function depending on the context (multisite or not)
 *
 * @since 3.6.0
 * @param string $option   Name of the option to update.
 * @param mixed  $value    Option value.
 * @param mixed  $autoload Whether to load the option when WordPress starts up.
 * @return bool
 */
function update_option( $option, $value, $autoload = null ) {
	// VIP: Each site should have its own option
	return \update_option( $option, $value, $autoload );
}

/**
 * Use the correct get option function depending on the context (multisite or not)
 *
 * @since 3.6.0
 * @param string $option        Name of the option to get.
 * @param mixed  $default_value Default value.
 * @return bool
 */
function get_option( $option, $default_value = false ) {
	// VIP: Each site should have its own option.
	return \get_option( $option, $default_value );
}

/**
 * Use the correct delete option function depending on the context (multisite or not)
 *
 * @since 3.6.0
 * @param string $option Name of the option to delete.
 * @return bool
 */
function delete_option( $option ) {
	// VIP: Each site should have its own option
	return \delete_option( $option );
}

/**
 * Check if queries for the current request are going to be integrated with
 * ElasticPress.
 *
 * Public requests and REST API requests are integrated by default, but admin
 * requests will only be integrated in if the `ep_admin_wp_query_integration`
 * filter returns `true`, and and admin-ajax.php requests will only be
 * integrated if the `ep_ajax_wp_query_integration` filter returns `true`.
 *
 * If specific types of requests are passed, true will only be returned if the
 * current request also matches one of the passed types.
 *
 * This function is used by features to determine whether they should hook into
 * the current request.
 *
 * @param string   $context Slug of the feature that is performing the check.
 *                          Passed to the `ep_is_integrated_request` filter.
 * @param string[] $types   Which types of request to check. Any of 'admin',
 *                          'ajax', 'public', and 'rest'. Defaults to all
 *                          types.
 * @return bool Whether the current request supports ElasticPress integration
 *              and is of a given type.
 *
 * @since 3.6.0
 */
function is_integrated_request( $context, $types = [] ) {
	if ( empty( $types ) ) {
		$types = [ 'admin', 'ajax', 'public', 'rest' ];
	}

	$is_admin_request             = is_admin();
	$is_ajax_request              = defined( 'DOING_AJAX' ) && DOING_AJAX;
	$is_rest_request              = defined( 'REST_REQUEST' ) && REST_REQUEST;
	$is_integrated_admin_request  = false;
	$is_integrated_ajax_request   = false;
	$is_integrated_public_request = false;
	$is_integrated_rest_request   = false;

	if ( $is_admin_request && ! $is_ajax_request && in_array( 'admin', $types, true ) ) {

		/**
		 * Filter whether to integrate with admin queries.
		 *
		 * @hook ep_admin_wp_query_integration
		 * @param bool $integrate True to integrate.
		 * @return bool New value.
		 */
		$is_integrated_admin_request = apply_filters( 'ep_admin_wp_query_integration', false );
	}

	if ( $is_ajax_request && in_array( 'ajax', $types, true ) ) {

		/**
		 * Filter to integrate with admin ajax queries.
		 *
		 * @hook ep_ajax_wp_query_integration
		 * @param bool $integrate True to integrate.
		 * @return bool New value.
		 */
		$is_integrated_ajax_request = apply_filters( 'ep_ajax_wp_query_integration', false );
	}

	if ( $is_rest_request && in_array( 'rest', $types, true ) ) {
		$is_integrated_rest_request = true;
	}

	if ( ! $is_admin_request && ! $is_ajax_request && ! $is_rest_request && in_array( 'public', $types, true ) ) {
		$is_integrated_public_request = true;
	}

	/**
	 * Is the current request any of the supported requests.
	 */
	$is_integrated = (
		$is_integrated_admin_request ||
		$is_integrated_ajax_request ||
		$is_integrated_public_request ||
		$is_integrated_rest_request
	);

	/**
	 * Filter whether the queries for the current request should be integrated.
	 *
	 * @hook ep_is_integrated_request
	 * @param bool   $is_integrated Whether queries for the request will be
	 *                              integrated.
	 * @param string $context       Context for the original check. Usually the
	 *                              slug of the feature doing the check.
	 * @param array  $types         Which requests types are being checked.
	 * @return bool Whether queries for the request will be integrated.
	 *
	 * @since 3.6.2
	 */
	return apply_filters( 'ep_is_integrated_request', $is_integrated, $context, $types );
}

/**
 * Get asset info from extracted asset files
 *
 * @param string $slug Asset slug as defined in build/webpack configuration
 * @param string $attribute Optional attribute to get. Can be version or dependencies
 * @return string|array
 */
function get_asset_info( $slug, $attribute = null ) {
	if ( file_exists( EP_PATH . 'dist/js/' . $slug . '.min.asset.php' ) ) {
		$asset = require EP_PATH . 'dist/js/' . $slug . '.min.asset.php';
	} elseif ( file_exists( EP_PATH . 'dist/css/' . $slug . '.min.asset.php' ) ) {
		$asset = require EP_PATH . 'dist/css/' . $slug . '.min.asset.php';
	} else {
		return null;
	}

	if ( ! empty( $attribute ) && isset( $asset[ $attribute ] ) ) {
		return $asset[ $attribute ];
	}

	return $asset;
}

/**
 * Get the IDs of the objects attached to one or more terms of a taxonomy.
 *
 * Runs the same query as get_objects_in_term(), paginated by object ID, so terms with many
 * objects do not load every relationship row (and cache the full list) in memory at once.
 *
 * @since 5.4.0
 * @param int[]  $term_ids Term IDs.
 * @param string $taxonomy Taxonomy name.
 * @param int    $limit    Maximum number of object IDs to return, or 0 for all of them. When several
 *                         terms are queried, the IDs returned up to the limit are not necessarily the lowest.
 * @return int[] Object IDs in ascending order, without duplicates.
 */
function get_term_object_ids( array $term_ids, string $taxonomy, int $limit = 0 ): array {
	global $wpdb;

	$term_ids = array_values( array_unique( array_map( 'absint', $term_ids ) ) );
	if ( empty( $term_ids ) ) {
		return [];
	}

	/**
	 * Filter the number of object IDs fetched per query when getting a term's object IDs
	 *
	 * @hook ep_term_object_ids_chunk_size
	 * @param  {int}    $chunk_size Number of object IDs fetched per query
	 * @param  {int}    $term_id    Term ID (the first one, when getting the objects of several terms)
	 * @param  {string} $taxonomy   Term taxonomy
	 * @since  5.4.0
	 * @return {int} New chunk size
	 */
	$chunk_size = max( 1, (int) apply_filters( 'ep_term_object_ids_chunk_size', 10000, $term_ids[0], $taxonomy ) );

	$batches = [ $term_ids ];

	/*
	 * A query across several terms can't follow the index order, so each page sorts all of the
	 * batch's remaining rows. Group the terms into batches of about one page, using their counts.
	 * The counts only affect the grouping: a batch with more objects than expected (counts only
	 * include published objects, and can be stale) is still fetched in full, with more pages.
	 * Batches are also capped at 100 terms, which bounds that worst case.
	 */
	if ( count( $term_ids ) > 1 ) {
		$placeholders = implode( ', ', array_fill( 0, count( $term_ids ), '%d' ) );
		$counts       = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				"SELECT term_id, count FROM {$wpdb->term_taxonomy} WHERE term_id IN ( {$placeholders} ) AND taxonomy = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				array_merge( $term_ids, [ $taxonomy ] )
			),
			OBJECT_K
		);

		$batches      = [];
		$batch        = [];
		$object_count = 0;

		foreach ( $term_ids as $term_id ) {
			// Not a term of this taxonomy, so it has no objects.
			if ( ! isset( $counts[ $term_id ] ) ) {
				continue;
			}

			$term_count = (int) $counts[ $term_id ]->count;

			if ( ! empty( $batch ) && ( $object_count + $term_count > $chunk_size || count( $batch ) >= 100 ) ) {
				$batches[]    = $batch;
				$batch        = [];
				$object_count = 0;
			}

			$batch[]       = $term_id;
			$object_count += $term_count;
		}

		if ( ! empty( $batch ) ) {
			$batches[] = $batch;
		}
	}

	// Batches are sorted separately and can share objects. Sort and drop the repeats in place,
	// without a second copy of the list.
	$deduplicate       = count( $batches ) > 1;
	$remove_duplicates = static function ( array &$ids ) {
		sort( $ids );

		$count = count( $ids );
		$write = 0;
		for ( $read = 0; $read < $count; $read++ ) {
			if ( 0 === $write || $ids[ $read ] !== $ids[ $write - 1 ] ) {
				$ids[ $write ] = $ids[ $read ];
				++$write;
			}
		}

		for ( $i = $write; $i < $count; $i++ ) {
			array_pop( $ids );
		}
	};

	$object_ids = [];

	foreach ( $batches as $batch ) {
		// An object attached to several terms of the batch would be returned once per term.
		$distinct     = count( $batch ) > 1 ? 'DISTINCT ' : '';
		$placeholders = implode( ', ', array_fill( 0, count( $batch ), '%d' ) );
		$last_id      = 0;

		do {
			$page_size = $limit ? min( $chunk_size, $limit - count( $object_ids ) ) : $chunk_size;

			// $distinct and $placeholders are fixed strings; every value goes through prepare().
			// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber
			$chunk = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
				$wpdb->prepare(
					"SELECT {$distinct}tr.object_id FROM {$wpdb->term_relationships} AS tr
					INNER JOIN {$wpdb->term_taxonomy} AS tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
					WHERE tt.term_id IN ( {$placeholders} ) AND tt.taxonomy = %s AND tr.object_id > %d
					ORDER BY tr.object_id ASC LIMIT %d",
					array_merge( $batch, [ $taxonomy, $last_id, $page_size ] )
				)
			);
			// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber

			foreach ( $chunk as $object_id ) {
				$object_ids[] = (int) $object_id;
			}

			$chunk_count = count( $chunk );
			$last_id     = (int) end( $chunk );

			if ( $limit && count( $object_ids ) >= $limit ) {
				// Repeats from earlier batches don't count towards the limit.
				if ( $deduplicate ) {
					$remove_duplicates( $object_ids );
				}

				if ( count( $object_ids ) >= $limit ) {
					break 2;
				}
			}
		} while ( $chunk_count === $page_size );
	}

	if ( $deduplicate ) {
		$remove_duplicates( $object_ids );
	}

	return $object_ids;
}
