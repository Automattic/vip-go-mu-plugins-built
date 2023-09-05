/**
 * Gets edit url of the post.
 *
 * @param {number} postId ID of the post.
 *
 * @return {string} Edit url of the post.
 */
export function getPostEditUrl( postId: number ): string {
	return `/wp-admin/post.php?post=${ postId }&action=edit`;
}
