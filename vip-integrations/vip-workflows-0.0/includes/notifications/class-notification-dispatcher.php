<?php
/**
 * Notification Dispatcher.
 *
 * Central hub for routing workflow events to notification channels.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Notifications;

use VIPWorkflows\ModuleInterface;

/**
 * Routes events to configured notification channels.
 */
class NotificationDispatcher implements ModuleInterface {


	/**
	 * Option name for the event-to-channel routing configuration.
	 *
	 * Read by should_notify_channel() and written by NotificationsController,
	 * so the name lives here with the semantics rather than in the controller.
	 */
	public const ROUTING_OPTION = 'vip_workflows_notification_routing';

	/**
	 * Option name for debug/mirror mode.
	 */
	public const DEBUG_OPTION = 'vip_workflows_notification_debug';

	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'notifications';
	}

	/**
	 * Registered channel instances.
	 *
	 * @var array<string, NotificationChannel>
	 */
	private array $channels = array();

	/**
	 * Whether channels have been registered.
	 *
	 * @var bool
	 */
	private bool $channels_registered = false;

	/**
	 * Whether hooks have been initialized.
	 *
	 * @var bool
	 */
	private bool $hooks_initialized = false;

	/**
	 * Initialize the dispatcher (registers channels and hooks).
	 */
	public function init(): void {
		// Channel registration translates channel labels via __() (e.g. the
		// SlackChannel "Slack (Default)" placeholder). The dispatcher is
		// initialized on `plugins_loaded`, which is too early for WP's
		// just-in-time translation loading and emits a
		// Avoid a _load_textdomain_just_in_time() notice. Defer it to
		// `init`, which is also the correct hook for register_setting().
		// get_channels()/get_channel() still register lazily on first access.
		add_action( 'init', array( $this, 'register_channels' ) );
		$this->register_hooks();
	}

	/**
	 * Register notification channels.
	 */
	public function register_channels(): void {
		if ( $this->channels_registered ) {
			return;
		}

		// Register Slack destinations (supports multiple webhooks).
		$slack_channels = Channels\SlackChannel::create_channel_instances();
		foreach ( $slack_channels as $slack_channel ) {
			$this->register_channel( $slack_channel );
		}

		// Register other built-in channels.
		$this->register_channel( new Channels\EmailChannel() );

		// Allow plugins to register additional channels.
		do_action( 'vip_workflows_register_notification_channels', $this );

		// Register WordPress options for all channels.
		foreach ( $this->channels as $channel ) {
			$channel->register_option();
		}

		$this->channels_registered = true;
	}

	/**
	 * Register event hooks.
	 */
	private function register_hooks(): void {
		if ( $this->hooks_initialized ) {
			return;
		}

		// Async delivery handler.
		add_action( 'vip_workflows_send_notification', array( $this, 'handle_async_send' ), 10, 3 );

		// Listen for workflow events.
		add_action( 'vip_workflows_status_transition', array( $this, 'handle_status_transition' ), 10, 5 );

		// Go-live notifies via two complementary paths, exactly-once by
		// construction: workflow-driven publishes notify from the workflow stage
		// action above (where the new stage is correct by definition), and
		// core-driven publishes (cron future→publish, quick edit, REST, CLI)
		// notify here — suppressed while a workflow transition is mid-commit.
		add_action( 'transition_post_status', array( $this, 'handle_go_live' ), 10, 3 );

		$this->hooks_initialized = true;
	}

	/**
	 * Register a notification channel.
	 *
	 * @param  NotificationChannel $channel Channel instance.
	 * @return bool True if registered, false if duplicate.
	 */
	public function register_channel( NotificationChannel $channel ): bool {
		$id = $channel->get_id();

		if ( isset( $this->channels[ $id ] ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging.
			error_log(
				sprintf(
					'VIP Workflows: Channel "%s" already registered. Skipping duplicate from %s.',
					$id,
					get_class( $channel )
				)
			);
			return false;
		}

		$this->channels[ $id ] = $channel;
		return true;
	}

	/**
	 * Get all registered channels.
	 *
	 * @return array<string, NotificationChannel>
	 */
	public function get_channels(): array {
		$this->register_channels();
		return $this->channels;
	}

	/**
	 * Get a specific channel by ID.
	 *
	 * @param  string $id Channel ID.
	 * @return NotificationChannel|null
	 */
	public function get_channel( string $id ): ?NotificationChannel {
		$this->register_channels();
		return $this->channels[ $id ] ?? null;
	}

	/**
	 * Dispatch a notification to all enabled channels.
	 *
	 * @param string $event_type Event type (e.g., 'published').
	 * @param array  $data       Event data.
	 */
	public function dispatch( string $event_type, array $data ): void {
		foreach ( $this->channels as $channel ) {
			if ( ! $channel->is_configured() ) {
				continue;
			}

			$should_notify = $this->should_notify_channel( $event_type, $channel->get_id() );

			if ( ! $should_notify ) {
				continue;
			}

			if ( $this->is_rate_limited( $channel->get_id(), $event_type, $data ) ) {
				continue;
			}

			// Pre-set rate limit to prevent double-scheduling.
			$this->update_rate_limit( $channel->get_id(), $event_type, $data );

			if ( function_exists( 'as_enqueue_async_action' ) ) {
				as_enqueue_async_action(
					'vip_workflows_send_notification',
					array(
						'channel_id' => $channel->get_id(),
						'event_type' => $event_type,
						'data'       => $data,
					),
					'vip-workflows-notifications'
				);
			} else {
				$this->send_to_channel( $channel, $event_type, $data );
			}
		}
	}

	/**
	 * Send a notification to a specific channel (used by async handler and fallback).
	 *
	 * @param NotificationChannel $channel    Channel instance.
	 * @param string              $event_type Event type.
	 * @param array               $data       Event data.
	 */
	private function send_to_channel( NotificationChannel $channel, string $event_type, array $data ): void {
		$notification = $this->build_notification( $event_type, $data );
		$channel->send( $notification );
	}

	/**
	 * Handle async notification delivery via Action Scheduler.
	 *
	 * @param string $channel_id Channel ID.
	 * @param string $event_type Event type.
	 * @param array  $data       Event data.
	 */
	public function handle_async_send( string $channel_id, string $event_type, array $data ): void {
		$channel = $this->get_channel( $channel_id );
		if ( ! $channel || ! $channel->is_configured() ) {
			return;
		}

		$this->send_to_channel( $channel, $event_type, $data );
	}

	/**
	 * Check if a channel should receive notifications for an event.
	 *
	 * Routing is the only authority: an event reaches a channel when the routing
	 * option says so, or when debug mode is mirroring everything to it.
	 *
	 * @param  string $event_type Event type.
	 * @param  string $channel_id Channel ID.
	 * @return bool
	 */
	private function should_notify_channel( string $event_type, string $channel_id ): bool {
		// Check debug mode first (mirrors all events).
		$debug = get_option( self::DEBUG_OPTION, array() );
		if ( ! empty( $debug['enabled'] ) && ! empty( $debug['channels'] ) ) {
			if ( in_array( $channel_id, $debug['channels'], true ) ) {
				return true;
			}
		}

		// Check routing configuration.
		$routing = get_option( self::ROUTING_OPTION, array() );

		// Routing is the only answer. The per-channel `events` list this used to
		// fall back to was the other half of a two-authority split: the admin wrote
		// both, two of the three shipped channels could not persist theirs, and the
		// branch reading it was commented as legacy. Schema 2.20.0 seeds routing
		// from those lists, so a site configured through the old matrix arrives here
		// with the same answer it had before.
		return isset( $routing[ $event_type ] )
			&& in_array( $channel_id, $routing[ $event_type ], true );
	}

	/**
	 * Build a notification from event data.
	 *
	 * @param  string $event_type Event type.
	 * @param  array  $data       Event data.
	 * @return Notification
	 */
	private function build_notification( string $event_type, array $data ): Notification {
		$notification          = new Notification();
		$notification->type    = $event_type;
		$notification->data    = $data;
		$notification->post_id = (int) ( $data['post_id'] ?? 0 );

		$templates = array(
			'published' => array(
				'severity' => 'success',
				'title'    => __( 'Published', 'vip-workflows' ),
				/* translators: %1$s: post title, %2$s: author name. */
				'message'  => __( '"%1$s" published by %2$s', 'vip-workflows' ),
				'args'     => array( 'post_title', 'author_name' ),
				'color'    => '#00a32a',
				'icon'     => '✅',
			),
			'transition' => array(
				'severity' => 'info',
				'title'    => __( 'Stage Changed', 'vip-workflows' ),
				/* translators: %1$s: post title, %2$s: previous workflow status label, %3$s: new workflow status label. */
				'message'  => __( '"%1$s" moved from %2$s to %3$s', 'vip-workflows' ),
				'args'     => array( 'post_title', 'from_label', 'to_label' ),
				'color'    => '#2271b1',
				'icon'     => '📝',
			),
		);

		if ( isset( $templates[ $event_type ] ) ) {
			$template = $templates[ $event_type ];
			$args     = array_map( fn( $key ) => $data[ $key ] ?? '', $template['args'] );

			$notification->severity = $template['severity'];
			$notification->title    = $template['title'];
			$notification->message  = vsprintf( $template['message'], $args );
			$notification->color    = $template['color'];
			$notification->icon     = $template['icon'];
		} else {
			$notification->severity = 'info';
			$notification->title    = $event_type;
			$notification->message  = '';
			$notification->color    = '#666666';
			$notification->icon     = 'ℹ️';
		}

		return $notification;
	}

	/**
	 * Check if a notification is rate limited.
	 *
	 * @param  string $channel_id Channel ID.
	 * @param  string $event_type Event type.
	 * @param  array  $data       Event data.
	 * @return bool True if rate limited.
	 */
	private function is_rate_limited( string $channel_id, string $event_type, array $data ): bool {
		$post_id = $data['post_id'] ?? 0;
		$key     = "vip_notification_{$channel_id}_{$event_type}_{$post_id}";

		return (bool) get_transient( $key );
	}

	/**
	 * Update rate limit after sending.
	 *
	 * @param string $channel_id Channel ID.
	 * @param string $event_type Event type.
	 * @param array  $data       Event data.
	 */
	private function update_rate_limit( string $channel_id, string $event_type, array $data ): void {
		$post_id = $data['post_id'] ?? 0;
		$key     = "vip_notification_{$channel_id}_{$event_type}_{$post_id}";

		// Debounce window suppressing duplicate notifications for the same action.
		// A 1s window is effectively no rate limit — a repeated trigger could
		// flood a channel — so default to a real interval (60s), filterable for
		// tuning.
		$ttl = (int) apply_filters( 'vip_workflows_notification_rate_limit_ttl', 60 );
		set_transient( $key, time(), max( 1, $ttl ) );
	}

	// =========================================================================
	// Event Handlers
	// =========================================================================

	/**
	 * Handle workflow status transition event.
	 *
	 * Sends notifications configured on the specific transition in the sequence.
	 * Does NOT use the global event matrix - transitions are configured per-sequence.
	 *
	 * Go-live (workflow-driven path): a workflow stage change whose crossing
	 * committed `publish` from a non-publish status IS the go-live moment — it
	 * notifies from here, where the new stage is correct by definition. It
	 * routes `published` through the global event matrix AND marks the
	 * per-transition send as published, so the transition's own configured
	 * channels get the Published template (legacy parity, no admin routing
	 * needed). Core-driven publishes are handled by handle_go_live(), which
	 * suppresses itself while a workflow transition is mid-commit — emission is
	 * exactly-once by construction. A committed status of `future` (a scheduled
	 * gate publish) is not a go-live; cron's future→publish notifies later via
	 * the core path.
	 *
	 * @param int                              $post_id    Post ID.
	 * @param string                           $new_status New stage key (unprefixed).
	 * @param string                           $old_status Old stage key (unprefixed).
	 * @param \VIPWorkflows\Sequences\Sequence $sequence  Sequence.
	 * @param array                            $context    Transition context: 'cause'
	 *                                                     (workflow|core),
	 *                                                     'committed_status', and
	 *                                                     'previous_status'. Additive —
	 *                                                     legacy 4-arg emitters omit it.
	 */
	public function handle_status_transition( int $post_id, string $new_status, string $old_status, $sequence, array $context = array() ): void {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return;
		}

		// Cause stamp from the event contract: 'workflow' (edge traversal or
		// assignment seat) vs 'core' (checkpoint reseat after a core-driven
		// status change). previous_status defaults to committed_status for
		// legacy 4-arg emitters — the conservative "nothing crossed" reading.
		$cause            = (string) ( $context['cause'] ?? 'workflow' );
		$committed_status = (string) ( $context['committed_status'] ?? $post->post_status );
		$previous_status  = (string) ( $context['previous_status'] ?? $committed_status );

		$is_go_live = 'workflow' === $cause
			&& 'publish' === $committed_status
			&& 'publish' !== $previous_status;

		$author      = get_userdata( $post->post_author );
		$author_name = $author ? $author->display_name : __( 'Unknown', 'vip-workflows' );

		// Workflow-driven go-live routes through the global event matrix before
		// any per-transition config check: assignment seats and transitions
		// without configured channels still count as go-lives. Repeat go-lives
		// (publish → draft → publish) legitimately notify again; consumers filter
		// on previous_status.
		if ( $is_go_live ) {
			$this->dispatch(
				'published',
				array(
					'post_id'          => $post_id,
					'post_title'       => $post->post_title,
					'author_name'      => $author_name,
					'stage'            => $new_status,
					'previous_status'  => $previous_status,
					'committed_status' => $committed_status,
					'cause'            => $cause,
					'edit_url'         => get_edit_post_link( $post_id, 'raw' ),
					'view_url'         => get_permalink( $post_id ),
				)
			);
		}

		// Get the transition config from the sequence.
		$transition = $sequence->get_transition( $old_status, $new_status );
		if ( ! $transition || empty( $transition['notifications'] ) ) {
			return;
		}

		// Get status labels from sequence.
		$from_config = $sequence->get_status( $old_status );
		$to_config   = $sequence->get_status( $new_status );

		$data = array(
			'post_id'          => $post_id,
			'post_title'       => $post->post_title,
			'from_status'      => $old_status,
			'to_status'        => $new_status,
			// Live lookup, and no humanized key on the fallback: a notification body
			// reaching Slack or a webhook should not present "Status_3" as a name.
			'from_label'       => $from_config['label'] ?? $old_status,
			'to_label'         => $to_config['label'] ?? $new_status,
			'author_name'      => $author_name,
			'edit_url'         => get_edit_post_link( $post_id, 'raw' ),
			'view_url'         => get_permalink( $post_id ),
			'cause'            => $cause,
			'committed_status' => $committed_status,
			'previous_status'  => $previous_status,
		);

		// A go-live transition sends the Published template to its configured
		// channels (legacy parity); anything else is a plain stage change. A
		// channel that already received the matrix `published` dispatch above is
		// debounced by the rate limit — no double delivery.
		$this->send_transition_notifications( $post_id, $transition, $data, $is_go_live );
	}

	/**
	 * Handle a core post-status transition: notify once at real go-live.
	 *
	 * The core-driven half of the go-live split: fires for any `!== 'publish'`
	 * → `'publish'` transition on a workflow-managed post that is NOT mid
	 * workflow-transition — cron's `future` → `publish`, quick edit, REST, CLI.
	 * Workflow-driven publishes are suppressed here (the stage meta is not
	 * written yet when core fires this hook mid-commit) and notify from
	 * handle_status_transition() instead. Routed through the global event
	 * matrix as `published` (a system event, not a per-transition one).
	 *
	 * @param string   $new_status New core post status.
	 * @param string   $old_status Old core post status.
	 * @param \WP_Post $post       Post object.
	 */
	public function handle_go_live( string $new_status, string $old_status, $post ): void {
		if ( 'publish' !== $new_status || 'publish' === $old_status ) {
			return;
		}

		// A workflow transition is mid-commit: its stage meta is not written yet
		// and the workflow path notifies at the correct moment with the correct
		// stage. Suppress this fire so go-live stays exactly-once.
		if ( \VIPWorkflows\Workflow\StatusManager::is_transition_in_progress( $post->ID ) ) {
			return;
		}

		// Only workflow-managed posts notify here.
		if ( ! get_post_meta( $post->ID, \VIPWorkflows\Workflow\StatusManager::SEQUENCE_META_KEY, true ) ) {
			return;
		}

		$author = get_userdata( $post->post_author );

		$this->dispatch(
			'published',
			array(
				'post_id'          => $post->ID,
				'post_title'       => $post->post_title,
				'author_name'      => $author ? $author->display_name : __( 'Unknown', 'vip-workflows' ),
				// The checkpoint reseat (StatusManager, core-service init order)
				// has already run by the time this fires, so the stage meta read
				// here is the post's correct, current stage.
				'stage'            => (string) get_post_meta( $post->ID, \VIPWorkflows\Workflow\StatusManager::STAGE_META_KEY, true ),
				'previous_status'  => $old_status,
				'committed_status' => 'publish',
				'cause'            => 'core',
				'edit_url'         => get_edit_post_link( $post->ID, 'raw' ),
				'view_url'         => get_permalink( $post->ID ),
			)
		);
	}

	/**
	 * Send transition notifications configured in sequence.
	 *
	 * @param int   $post_id      Post ID.
	 * @param array $transition   Transition config from sequence.
	 * @param array $data         Event data.
	 * @param bool  $is_published Whether this is a publish transition.
	 */
	public function send_transition_notifications( int $post_id, array $transition, array $data, bool $is_published ): void {
		$notifications = $transition['notifications'] ?? array();
		if ( empty( $notifications ) ) {
			return;
		}

		$event_type = $is_published ? 'published' : 'transition';

		foreach ( $notifications as $channel_id ) {
			$channel = $this->get_channel( $channel_id );
			if ( ! $channel || ! $channel->is_configured() ) {
				continue;
			}

			// Skip if rate limited.
			if ( $this->is_rate_limited( $channel_id, $event_type, $data ) ) {
				continue;
			}

			$notification = $this->build_notification( $event_type, $data );
			$sent = $channel->send( $notification );

			if ( $sent ) {
				$this->update_rate_limit( $channel_id, $event_type, $data );
			}
		}
	}

	// =========================================================================
	// Static Helpers
	// =========================================================================

	/**
	 * Get system event types (for global event matrix).
	 * These are monitoring events not tied to specific transitions.
	 *
	 * @return array<string, string> Event ID => Label.
	 */
	public static function get_event_types(): array {
		// These ids ARE the ids dispatch() fires and build_notification() keys its
		// templates on. They are the routing option's keys, so any divergence here
		// is silent: should_notify_channel() is a plain isset() lookup, and a row
		// the admin ticks under an id nothing emits simply never matches.
		$events = array(
			// Go-live is a system event (core transition_post_status), not a
			// per-transition one, so it routes through the global matrix.
			'published'    => __( 'Published', 'vip-workflows' ),
		);

		return apply_filters( 'vip_workflows_notification_events', $events );
	}
}
