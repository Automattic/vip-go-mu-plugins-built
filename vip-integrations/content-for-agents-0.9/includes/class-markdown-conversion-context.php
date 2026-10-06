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
	public string $output        = '';
	public bool $at_line_start   = true;
	public int $blockquote_depth = 0;
	public bool $in_pre          = false;
	public ?string $pre_code     = null;
	public ?string $inline_code  = null;

	/** @var array<int, array{string, string|null}> */
	public array $inline_code_parts = array();

	public ?string $inline_code_link = null;

	/** @var array<int, array{href: string, open: bool}> */
	public array $link_stack = array();

	public ?int $last_link_end                  = null;
	public ?int $last_link_start                = null;
	public ?int $last_link_suffix_start         = null;
	public ?string $last_closed_emphasis_marker = null;
	public ?int $last_closed_emphasis_start     = null;
	public ?int $last_closed_emphasis_end       = null;

	/** @var array<int, array<string, mixed>> */
	public array $list_stack = array();

	/** @var array<int, array<string, mixed>> */
	public array $media_stack = array();

	/** @var array<int, array{marker: string, emitted: bool, start: int|null, redundant: bool, html: bool}> */
	public array $emphasis_stack = array();
}
