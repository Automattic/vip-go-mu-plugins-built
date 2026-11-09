<?php
/**
 * Whether more than one editor is open on a post.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

/**
 * Answers one question for the stage agent: is anyone else in this post?
 *
 * A stage agent writes the post on the server. With real-time collaboration
 * on, the people in the editor share a live document that never hears about
 * that write, so whichever copy saves last wins: the agent's changes vanish
 * while the room stays open, and the room's edits vanish when the agent's
 * saved version is reloaded. The editor panel reloads onto the agent's version
 * when the run finishes, which only works if nobody else keeps the room open,
 * so agent stages wait until the post has one editor.
 *
 * WordPress itself cannot answer this — a post lock records one user, and
 * under collaboration it is shared — so the count comes from the collaboration
 * provider. VIP Real-Time Collaboration has every editor with a connected
 * room report the post on the heartbeat, and counts the users whose report is
 * recent. It counts people actively editing, not tabs, and an editor whose
 * tab is in the background or idle drops out of the count within half a
 * minute. Without it the count is 0 and nothing is held.
 */
class CoEditing {

	/**
	 * Number of users editing the post right now, as far as the collaboration
	 * provider knows. 0 when nothing reports.
	 *
	 * @param int $post_id Post ID.
	 * @return int
	 */
	public static function editing_users( int $post_id ): int {
		return class_exists( '\VIPRealTimeCollaboration\Presence\RoomPresence' )
			? (int) \VIPRealTimeCollaboration\Presence\RoomPresence::count_users( $post_id )
			: 0;
	}

	/**
	 * Whether more than one editor is open on the post.
	 *
	 * @param int $post_id Post ID.
	 * @return bool
	 */
	public static function is_shared( int $post_id ): bool {
		return self::editing_users( $post_id ) > 1;
	}
}
