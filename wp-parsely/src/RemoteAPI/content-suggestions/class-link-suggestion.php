<?php
/**
 * Link Suggestion class
 *
 * @package Parsely
 * @since   3.14.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI\ContentSuggestions;

/**
 * Link Suggestion class
 *
 * Represents a link suggestion returned by the Suggest Links API.
 *
 * @since 3.14.0
 */
class Link_Suggestion {
	/**
	 * The URL of the suggested link.
	 *
	 * @var string The URL of the suggested link.
	 */
	public $href;

	/**
	 * The title of the suggested link.
	 *
	 * @var string The title of the suggested link.
	 */
	public $title;

	/**
	 * The text of the suggested link.
	 *
	 * @var string The text of the suggested link.
	 */
	public $text;

	/**
	 * The offset/position for the suggested link.
	 *
	 * @var int The offset/position for the suggested link.
	 */
	public $offset;
}
