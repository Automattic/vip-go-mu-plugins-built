<?php
/**
 * Ingestion Post Record schema class.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

/**
 * Data class representing a post record for Salesforce Data Cloud ingestion.
 */
class Ingestion_Post_Record {
	/**
	 * Composite key: site_id_blog_id_post_id.
	 *
	 * @var string
	 */
	public $site_id_blog_id_post_id;

	/**
	 * VIP site ID (VIP_GO_APP_ID).
	 *
	 * @var string
	 */
	public $site_id;

	/**
	 * Composite key: site_id_blog_id.
	 *
	 * @var string
	 */
	public $site_id_blog_id;

	/**
	 * WordPress post ID.
	 *
	 * @var string
	 */
	public $post_id;

	/**
	 * WordPress blog ID (for multisite).
	 *
	 * @var string
	 */
	public $blog_id;

	/**
	 * Whether the post is published.
	 *
	 * @var bool
	 */
	public $published;

	/**
	 * Last published date in ISO 8601 format.
	 *
	 * @var string
	 */
	public $last_published_at;

	/**
	 * Last modified date in ISO 8601 format.
	 *
	 * @var string
	 */
	public $last_modified_at;

	/**
	 * Post title.
	 *
	 * @var string
	 */
	public $title;

	/**
	 * Post content.
	 *
	 * @var string
	 */
	public $content;

	/**
	 * Post excerpt.
	 *
	 * @var string
	 */
	public $excerpt;

	/**
	 * Comma-separated list of category names.
	 *
	 * @var string
	 */
	public $categories;

	/**
	 * Comma-separated list of tag names.
	 *
	 * @var string
	 */
	public $tags;

	/**
	 * Author display name.
	 *
	 * @var string
	 */
	public $author;

	/**
	 * Post permalink URL.
	 *
	 * @var string
	 */
	public $url;

	/**
	 * Post type (e.g., 'post', 'page').
	 *
	 * @var string
	 */
	public $post_type;

	/**
	 * Post status (e.g., 'publish', 'draft').
	 *
	 * @var string
	 */
	public $post_status;

	/**
	 * Constructor.
	 *
	 * @param array{
	 *     site_id: string,
	 *     blog_id: string,
	 *     post_id: string,
	 *     site_id_blog_id: string,
	 *     site_id_blog_id_post_id: string,
	 *     published: bool,
	 *     last_published_at: string,
	 *     last_modified_at: string,
	 *     title: string,
	 *     content: string,
	 *     excerpt: string,
	 *     categories: string,
	 *     tags: string,
	 *     author: string,
	 *     url: string,
	 *     post_type: string,
	 *     post_status: string
	 * } $data Record data.
	 */
	public function __construct( array $data ) {
		$this->site_id_blog_id_post_id = $data['site_id_blog_id_post_id'];
		$this->site_id                 = $data['site_id'];
		$this->site_id_blog_id         = $data['site_id_blog_id'];
		$this->post_id                 = $data['post_id'];
		$this->blog_id                 = $data['blog_id'];
		$this->published               = $data['published'];
		$this->last_published_at       = $data['last_published_at'];
		$this->last_modified_at        = $data['last_modified_at'];
		$this->title                   = $data['title'];
		$this->content                 = $data['content'];
		$this->excerpt                 = $data['excerpt'];
		$this->categories              = $data['categories'];
		$this->tags                    = $data['tags'];
		$this->author                  = $data['author'];
		$this->url                     = $data['url'];
		$this->post_type               = $data['post_type'];
		$this->post_status             = $data['post_status'];
	}

	/**
	 * Convert the record to an array for JSON serialization.
	 *
	 * @return array{
	 *     site_id: string,
	 *     blog_id: string,
	 *     post_id: string,
	 *     site_id_blog_id: string,
	 *     site_id_blog_id_post_id: string,
	 *     published: bool,
	 *     last_published_at: string,
	 *     last_modified_at: string,
	 *     title: string,
	 *     content: string,
	 *     excerpt: string,
	 *     categories: string,
	 *     tags: string,
	 *     author: string,
	 *     url: string,
	 *     post_type: string,
	 *     post_status: string
	 * } The record as an associative array.
	 */
	public function to_array() {
		return [
			'site_id_blog_id_post_id' => $this->site_id_blog_id_post_id,
			'site_id'                 => $this->site_id,
			'site_id_blog_id'         => $this->site_id_blog_id,
			'post_id'                 => $this->post_id,
			'blog_id'                 => $this->blog_id,
			'published'               => $this->published,
			'last_published_at'       => $this->last_published_at,
			'last_modified_at'        => $this->last_modified_at,
			'title'                   => $this->title,
			'content'                 => $this->content,
			'excerpt'                 => $this->excerpt,
			'categories'              => $this->categories,
			'tags'                    => $this->tags,
			'author'                  => $this->author,
			'url'                     => $this->url,
			'post_type'               => $this->post_type,
			'post_status'             => $this->post_status,
		];
	}
}
