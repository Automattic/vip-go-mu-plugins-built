<?php
/**
 * Who did something, in one shape.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

/**
 * The one description of an actor this plugin serves to a client.
 *
 * Three kinds of thing act on a post here — a person, an agent (an ability
 * acting on someone's behalf), and the site itself (cron, a deleted account) —
 * and a reader scanning a list wants one shape for all three, because they are
 * answers to one question. Ten shapes used to describe a person across the REST
 * layer, disagreeing about whether the name was `name`, `display_name`,
 * `author`, `author_name` or `label`, and about whether an avatar came along at
 * all. Each view then improvised around whichever one it got, which is why the
 * same person could be a picture-and-name in a table, a bare string in the
 * editor, and a broken-image icon in the calendar.
 *
 * The shape is:
 *
 *     array(
 *         'id'           => int,          // 0 for an agent with no impersonated user
 *         'type'         => string,       // 'user' or 'agent'
 *         'display_name' => string,
 *         'agent_actor'  => string|null,  // the ability id, for an agent
 *         'avatar'       => string|null,  // null for an agent; it has no picture
 *     )
 *
 * **`null` is a real answer, and it means the site itself.** An event no user
 * can be credited for has no one to link, credit or draw, so this returns null
 * rather than inventing a person to stand in. The word the reader sees for that
 * — "System" — is the view's to choose and the view's to translate; a server
 * that hard-codes it has made a presentation decision in the wrong place. The
 * plugin spells that absence eight different ways ("System", "Unknown",
 * "Unknown user", "?", "another user", "User #4", ""), which is what happens
 * when each caller answers the question for itself.
 *
 * The routes that serve an actor to a view have been moved onto this class;
 * several other callers have not, and still name the absence themselves —
 * `AssignmentManager::describe()`, `StatusManager`'s claim payload, the
 * `get-posts-by-status` and `get-stale-posts` abilities, the notification
 * dispatcher, and the "assigned to another user" transition error. Those are
 * strings inside a sentence or a notification rather than an actor being drawn,
 * so they are not blocked on this shape — but the eight spellings are not gone
 * yet, and this docblock is not the place to claim otherwise.
 *
 * Note what is deliberately NOT built here: the option lists behind a user
 * picker and the audit log's user filter stay `{ id, name }` and
 * `{ value, label }`. Those are choices in a control, not an actor being
 * credited — nothing draws an avatar for them — and forcing them onto this
 * shape would make every combobox pay for a Gravatar URL it never renders.
 */
final class Actor {

	/**
	 * Avatar size, in pixels, requested for every actor.
	 *
	 * One size for the whole plugin, chosen for the *largest* box it draws. The
	 * shared `<Avatar>` renders at 16px in a list (`2xs`) and 24px on a card or
	 * in a dialog (`sm`), so a 2× display wants 32 and 48 respectively; 48
	 * serves both, where 32 left every card avatar soft. Sending two URLs the
	 * way core's `avatar_urls` does would save a list a kilobyte and cost every
	 * consumer a more complicated actor, which is not a trade worth making for
	 * an image this small.
	 *
	 * Routes used to name this number one at a time, which is how a list could
	 * serve a sharper avatar than the detail view it linked to.
	 */
	private const AVATAR_SIZE = 48;

	/**
	 * Actors already built this request, keyed by user id.
	 *
	 * A list route describes one person once per row: the calendar serves up to
	 * 500 posts, a kanban board a column at a time, and a newsroom of twenty
	 * writes most of them. `get_userdata()` is already object-cached, but
	 * `get_avatar_url()` is not — it runs the `pre_get_avatar_data` and
	 * `get_avatar_data` filters on every call, and an install with a
	 * local-avatars plugin hooked there pays a lookup per row rather than per
	 * person.
	 *
	 * Scoped to the request, like the object cache it complements. A `null` is
	 * cached too: a post whose author is gone should not re-miss on every row.
	 *
	 * @var array<int, array|null>
	 */
	private static array $described = array();

	/**
	 * Describe a person by user id.
	 *
	 * The entry point for everything that credits a plain human — a post's
	 * author, an assignee, whoever claimed a post.
	 *
	 * @param  int|string|null $user_id User id. Accepts the string ids post meta hands back.
	 * @return array|null Actor, or null when no such user resolves.
	 */
	public static function from_user( $user_id ): ?array {
		$user_id = (int) $user_id;

		if ( ! $user_id ) {
			return null;
		}

		if ( array_key_exists( $user_id, self::$described ) ) {
			return self::$described[ $user_id ];
		}

		$user = get_userdata( $user_id );

		self::$described[ $user_id ] = $user ? array(
			'id'           => $user_id,
			'type'         => 'user',
			'display_name' => $user->display_name,
			'agent_actor'  => null,
			'avatar'       => get_avatar_url( $user_id, array( 'size' => self::AVATAR_SIZE ) ),
		) : null;

		return self::$described[ $user_id ];
	}

	/**
	 * Forget everything described so far.
	 *
	 * For tests, and for a long-lived process (WP-CLI, a cron worker) that
	 * changes a user and then describes them again in the same run.
	 *
	 * @return void
	 */
	public static function flush(): void {
		self::$described = array();
	}

	/**
	 * Describe the actor behind one workflow event.
	 *
	 * Both activity routes — the audit log and a post's history — serve the actor
	 * as an object rather than a name, so the view can draw an agent differently
	 * from a person. They used to build that object twice, and disagreed: one
	 * returned `null` for an event no user can be resolved for, the other an
	 * object reading "System".
	 *
	 * An agent's `agent_actor` lives inside `event_data` — the runner impersonates
	 * a capable human for the write, so `actor_id` alone would mis-credit them.
	 *
	 * @param  array $event Event in canonical shape (actor_id, actor_type, event_data).
	 * @return array|null Actor, or null when there is no one to credit.
	 */
	public static function from_event( array $event ): ?array {
		$actor_id    = (int) ( $event['actor_id'] ?? 0 );
		$actor_type  = $event['actor_type'] ?? 'user';
		$agent_actor = $event['event_data']['agent_actor'] ?? null;

		if ( 'agent' === $actor_type ) {
			return array(
				'id'           => $actor_id,
				'type'         => 'agent',
				'display_name' => self::name_for(
					array(
						'actor_id'    => $actor_id,
						'actor_type'  => 'agent',
						'agent_actor' => $agent_actor,
					)
				),
				'agent_actor'  => $agent_actor,
				// An agent has no avatar; its name is the ability's, which is the
				// distinction a reader needs.
				'avatar'       => null,
			);
		}

		return self::from_user( $actor_id );
	}

	/**
	 * Resolve a human-readable actor name for an audit-trail entry.
	 *
	 * The name on its own, for the places that genuinely only have room for one —
	 * a sentence an ability returns, a revision's author line. Anything drawing
	 * an actor in the interface should take the whole object instead, so it can
	 * mark an agent as one.
	 *
	 * Agent-driven entries (actor_type='agent') are credited to the acting
	 * ability, not the human the runner impersonated for the write. Falls back
	 * to the ability id, then a generic label, when no ability label resolves.
	 *
	 * @param  array $entry Transition-history entry (actor_id, actor_type, agent_actor).
	 * @return string
	 */
	public static function name_for( array $entry ): string {
		if ( 'agent' === ( $entry['actor_type'] ?? '' ) ) {
			$agent_actor = $entry['agent_actor'] ?? '';

			if ( '' !== $agent_actor && function_exists( 'wp_get_ability' ) ) {
				$ability = wp_get_ability( $agent_actor );
				if ( $ability ) {
					return $ability->get_label();
				}
			}

			return '' !== $agent_actor ? $agent_actor : __( 'Agent', 'vip-workflows' );
		}

		$user = get_userdata( (int) ( $entry['actor_id'] ?? 0 ) );
		return $user ? $user->display_name : __( 'System', 'vip-workflows' );
	}
}
