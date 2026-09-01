<?php
/**
 * Notification data object.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Notifications;

/**
 * Represents a notification to be sent.
 */
class Notification {


	/**
	 * Event type (e.g., 'published', 'transition').
	 *
	 * @var string
	 */
	public string $type = '';

	/**
	 * Severity level (info, warning, critical, success).
	 *
	 * @var string
	 */
	public string $severity = 'info';

	/**
	 * Notification title/headline.
	 *
	 * @var string
	 */
	public string $title = '';

	/**
	 * Main message body.
	 *
	 * @var string
	 */
	public string $message = '';

	/**
	 * Brand color for the notification.
	 *
	 * @var string
	 */
	public string $color = '#2271b1';

	/**
	 * Icon emoji or URL.
	 *
	 * @var string
	 */
	public string $icon = '';

	/**
	 * Raw event data.
	 *
	 * @var array
	 */
	public array $data = array();

	/**
	 * Related post ID, if any.
	 *
	 * @var int
	 */
	public int $post_id = 0;

	/**
	 * Get a data value with fallback.
	 *
	 * @param  string $key     Data key.
	 * @param  mixed  $default Default value.
	 * @return mixed
	 */
	public function get( string $key, $default = null ) {
		return $this->data[ $key ] ?? $default;
	}

	/**
	 * Get the post URL (edit or view).
	 *
	 * @param  string $type 'edit' or 'view'.
	 * @return string
	 */
	public function get_post_url( string $type = 'edit' ): string {
		if ( 'view' === $type ) {
			return $this->get( 'view_url', '' );
		}
		return $this->get( 'edit_url', '' );
	}

	/**
	 * Get fields for structured display.
	 *
	 * @return array Array of ['title' => ..., 'value' => ..., 'short' => bool]
	 */
	public function get_fields(): array {
		$fields = array();

		$post_title = $this->get( 'post_title' );
		if ( $post_title ) {
			$url = $this->get_post_url();
			$fields[] = array(
				'title' => __( 'Post', 'vip-workflows' ),
				'value' => $url ? "<{$url}|{$post_title}>" : $post_title,
				'short' => true,
			);
		}

		$sequence = $this->get( 'sequence' );
		if ( $sequence ) {
			$fields[] = array(
				'title' => __( 'Workflow', 'vip-workflows' ),
				'value' => $sequence,
				'short' => true,
			);
		}

		$status_label = $this->get( 'status_label' );
		if ( $status_label ) {
			$fields[] = array(
				'title' => __( 'Stage', 'vip-workflows' ),
				'value' => $status_label,
				'short' => true,
			);
		}

		$author = $this->get( 'author_name' );
		if ( $author ) {
			$fields[] = array(
				'title' => __( 'Author', 'vip-workflows' ),
				'value' => $author,
				'short' => true,
			);
		}

		return $fields;
	}
}
