<?php
/**
 * Mutable state for one HTML-to-Markdown output stream.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Holds conversion state for one document or one table cell.
 */
final class Markdown_Conversion_Context {
	public string $output                         = '';
	public bool $at_line_start                    = true;
	public bool $in_pre                           = false;
	public ?string $pre_code                      = null;
	public ?string $pre_language                  = null;
	public ?Markdown_Inline_Buffer $inline_buffer = null;

	/** @var array<int, array<string, mixed>> Open block containers, in HTML nesting order. */
	public array $block_frames = array();

	/** @var array<int, array<string, mixed>> */
	public array $media_stack = array();
}
