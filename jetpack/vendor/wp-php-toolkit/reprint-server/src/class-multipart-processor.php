<?php

namespace WordPress\Reprint\Server;

use InvalidArgumentException;
use LogicException;
use RuntimeException;

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol errors become CLI or authenticated API values, never HTML output.

/**
 * Incrementally processes the strict multipart/mixed format used by Reprint.
 *
 * The processor is independent of the transport which supplies its bytes. A
 * cURL response callback can append each received fragment, while an HTTP
 * endpoint can append bounded reads from php://input. In both cases the caller
 * drains tokens synchronously before appending another fragment:
 *
 *     $multipart->append_bytes($bytes);
 *     while ($multipart->next_token()) {
 *         if ($multipart->get_token_type() === MultipartProcessor::TOKEN_BODY) {
 *             fwrite($output, $multipart->get_current_body_piece());
 *         }
 *     }
 *
 * A part produces one PART_START token, zero or more BODY tokens, and one
 * PART_END token. PART_START exposes the complete normalized header map. BODY
 * exposes at most MAX_INPUT_FRAGMENT_BYTES and remains current only until
 * next_token() is called again. PART_END means every byte declared by
 * Content-Length was supplied; the following call validates the CRLF and next
 * boundary before it can expose another part.
 *
 * Reprint deliberately uses a narrower grammar than general Internet MIME.
 * Every part requires a decimal Content-Length, all syntax uses CRLF, header
 * names are unique, and the request or response begins with its first boundary
 * and ends with its closing boundary. Reprint has emitted this form since its
 * first multipart exporter. Requiring a length makes arbitrary file bytes
 * unambiguous: the processor never searches a binary body for a delimiter and
 * can distinguish truncation from a clean close.
 *
 * next_token() returns false both when more bytes are required and after the
 * closing boundary. paused_at_incomplete_input() and is_complete() distinguish
 * those states. Once the transport reaches EOF, finish_input() verifies that a
 * complete closing boundary was seen; incomplete syntax or body data throws.
 * The processor retains only one bounded input fragment, one bounded header
 * block, and one current body token. It never accumulates a complete part.
 */
final class MultipartProcessor {

    /** Token which exposes the normalized headers of a newly opened part. */
    public const TOKEN_PART_START = 'part-start';

    /** Token which exposes one bounded piece of the current part body. */
    public const TOKEN_BODY = 'body';

    /** Token which confirms that the current part's declared body is complete. */
    public const TOKEN_PART_END = 'part-end';

    /**
     * Maximum bytes accepted by one append_bytes() call or exposed as one body token.
     *
     * Pull drains every cURL fragment immediately and push reads php://input
     * using this ceiling. The shared limit prevents either caller from turning
     * a streamed part into an unbounded in-memory string.
     */
    public const MAX_INPUT_FRAGMENT_BYTES = 262144;

    /**
     * Maximum bytes accepted in a boundary parameter.
     *
     * RFC 2046 recommends boundaries no longer than 70 characters. This also
     * bounds the delimiter retained while syntax is split across input reads.
     */
    private const MAX_BOUNDARY_BYTES = 70;

    /**
     * Maximum bytes accepted in one boundary or physical header line.
     *
     * The count excludes CRLF. An unterminated line is rejected as soon as it
     * can no longer fit within this bound.
     */
    public const MAX_HEADER_LINE_BYTES = 8192;

    /**
     * Maximum aggregate bytes accepted for one part's headers, including CRLF.
     *
     * This bounds both ordinary header fields and folded continuation lines
     * before the processor exposes any body bytes.
     */
    private const MAX_HEADER_BYTES = 32768;

    /**
     * Maximum number of distinct headers accepted on one part.
     *
     * Duplicate names are rejected, so this is also the maximum number of
     * entries retained in $current_headers.
     */
    private const MAX_HEADERS = 32;

    /** Processor state which expects an opening or closing delimiter line. */
    private const STATE_BOUNDARY = 0;

    /** Processor state which accumulates the current part's bounded header block. */
    private const STATE_HEADERS = 1;

    /** Processor state which emits exactly the current part's declared body bytes. */
    private const STATE_BODY = 2;

    /** Processor state entered after a syntactically complete closing boundary. */
    private const STATE_COMPLETE = 3;

    /**
     * Complete delimiter token derived from the validated boundary parameter.
     *
     * The stored value includes the required leading `--` and is compared only
     * with CRLF-terminated syntax lines. Part bodies are framed by their
     * Content-Length and are never searched for this byte sequence.
     *
     * @var string
     */
    private $delimiter;

    /**
     * Bytes not yet consumed by the current processor state.
     *
     * The caller may append only after next_token() pauses, so this contains at
     * most one bounded fragment plus a small split syntax tail.
     *
     * @var string
     */
    private $buffer = '';

    /**
     * Grammar state describing which multipart construct must be consumed next.
     *
     * It advances from a boundary to headers to the declared body, then returns
     * to a boundary until the closing delimiter makes the processor complete.
     *
     * @var int One of the STATE_* constants.
     */
    private $state = self::STATE_BOUNDARY;

    /**
     * Whether the next delimiter must be preceded by the completed body's CRLF.
     *
     * The opening boundary starts at byte zero; every later boundary follows
     * exactly the number of body bytes declared by Content-Length and a CRLF.
     *
     * @var bool
     */
    private $requires_part_terminator = false;

    /**
     * Whether the transport has declared that no more bytes can arrive.
     *
     * This becomes true only through finish_input(), after the caller has
     * drained every token available from the final input fragment.
     *
     * @var bool
     */
    private $input_finished = false;

    /**
     * Whether next_token() needs another input fragment to make progress.
     *
     * append_bytes() is permitted only in this state, which prevents callers
     * from accumulating several unread transport fragments in $buffer.
     *
     * @var bool
     */
    private $paused_at_incomplete_input = true;

    /**
     * Token exposed by the most recent successful next_token() call.
     *
     * Null means the processor is between tokens, paused for another fragment,
     * or complete. Token and value getters reject access in that state so a
     * caller cannot accidentally reuse information from an earlier part.
     *
     * @var string|null One of the TOKEN_* constants when a token is current.
     */
    private $current_token_type = null;

    /**
     * Lowercase, unique headers belonging to the current part.
     *
     * The map is available on PART_START, BODY, and PART_END tokens. It is
     * replaced only after the next opening boundary has been validated.
     *
     * @var array<string,string>
     */
    private $current_headers = [];

    /**
     * Body bytes exposed by the current TOKEN_BODY token.
     *
     * This contains at most one bounded input fragment and is cleared before
     * the processor advances. Callers therefore consume or hand off each piece
     * without the processor retaining the complete part body.
     *
     * @var string
     */
    private $current_body_piece = '';

    /**
     * Aggregate physical header bytes consumed for the current part.
     *
     * The count includes each line's CRLF, including folded continuations and
     * the empty line ending the block. It enforces a whole-header ceiling in
     * addition to the limit on any single physical line.
     *
     * @var int
     */
    private $current_header_bytes = 0;

    /**
     * Normalized name of the header field currently being unfolded.
     *
     * A field stays pending until another header or the empty terminator line
     * arrives, because intervening continuation lines belong to the same
     * logical value. Null means no field has begun for the current part.
     *
     * @var string|null
     */
    private $pending_header_name = null;

    /**
     * Physical value bytes accumulated for $pending_header_name.
     *
     * Leading whitespace after the colon is removed only when the completed
     * field is stored. Continuation-line whitespace remains intact while their
     * separating CRLF bytes are omitted according to MIME unfolding.
     *
     * @var string
     */
    private $pending_header_value = '';

    /**
     * Number of declared body bytes not yet exposed through TOKEN_BODY.
     *
     * It is initialized from the validated decimal Content-Length and reduced
     * by exactly each emitted piece. Reaching zero emits TOKEN_PART_END before
     * the following CRLF and boundary are parsed.
     *
     * @var int
     */
    private $remaining_body_bytes = 0;

    /**
     * Creates a processor positioned before the opening multipart boundary.
     *
     * @param string $boundary MIME boundary token without the leading `--`.
     *
     * @throws InvalidArgumentException If the boundary is empty, overlong, or
     *     contains bytes which cannot appear safely in a delimiter line.
     */
    public function __construct(string $boundary) {
        self::validate_boundary($boundary);
        $this->delimiter = '--' . $boundary;
    }

    /**
     * Returns the validated boundary from a multipart/mixed Content-Type value.
     *
     * Media types and parameter names are matched case-insensitively. Both the
     * token and quoted forms emitted by HTTP implementations are accepted:
     *
     *     multipart/mixed; boundary=reprint-0123
     *     Multipart/Mixed; boundary="reprint-0123"
     *
     * The returned value excludes the delimiter's leading `--`. A missing,
     * empty, repeated, overlong, or unsafe boundary is rejected before any body
     * bytes are accepted.
     *
     * @param string $content_type Complete Content-Type header value.
     * @return string Validated MIME boundary token.
     *
     * @throws InvalidArgumentException If the media type or boundary is invalid.
     */
    public static function boundary_from_content_type(string $content_type): string {
        $segments = explode(';', $content_type);
        $media_type = strtolower(trim( (string) array_shift($segments)));
        if ($media_type !== 'multipart/mixed') {
            throw new InvalidArgumentException(
                'Expected Content-Type multipart/mixed; received ' . self::describe_bytes($content_type) . '.'
            );
        }

        $boundary = null;
        foreach ($segments as $segment) {
            $equals = strpos($segment, '=');
            if ($equals === false || strtolower(trim(substr($segment, 0, $equals))) !== 'boundary') {
                continue;
            }
            if ($boundary !== null) {
                throw new InvalidArgumentException('Multipart Content-Type contains more than one boundary parameter.');
            }
            $value = trim(substr($segment, $equals + 1));
            if (strlen($value) >= 2 && $value[0] === '"' && substr($value, -1) === '"') {
                $value = substr($value, 1, -1);
            }
            $boundary = $value;
        }

        if (!is_string($boundary) || $boundary === '') {
            throw new InvalidArgumentException('Multipart Content-Type requires a non-empty boundary parameter.');
        }
        self::validate_boundary($boundary);
        return $boundary;
    }

    /**
     * Appends one bounded transport fragment after the processor requests input.
     *
     * Call next_token() until it returns false before appending the next
     * fragment. This obligation keeps unread network or request-body fragments
     * from accumulating in memory.
     *
     * @param string $bytes Next raw multipart bytes from the transport.
     *
     * @throws LogicException If unread tokens remain, input already ended, or
     *     the closing boundary was already consumed.
     * @throws InvalidArgumentException If the fragment exceeds
     *     MAX_INPUT_FRAGMENT_BYTES.
     */
    public function append_bytes(string $bytes): void {
        if ($this->input_finished) {
            throw new LogicException('Cannot append multipart bytes after finish_input().');
        }
        if ($this->state === self::STATE_COMPLETE) {
            throw new LogicException('Cannot append multipart bytes after the closing boundary.');
        }
        if (!$this->paused_at_incomplete_input || $this->current_token_type !== null) {
            throw new LogicException('Call next_token() until the multipart processor requests more input before appending bytes.');
        }
        $fragment_bytes = strlen($bytes);
        if ($fragment_bytes > self::MAX_INPUT_FRAGMENT_BYTES) {
            throw new InvalidArgumentException(
                'Multipart input fragment contains ' . $fragment_bytes . ' bytes; the maximum is '
                . self::MAX_INPUT_FRAGMENT_BYTES . ' bytes.'
            );
        }
        $this->buffer .= $bytes;
        $this->paused_at_incomplete_input = false;
    }

    /**
     * Advances to the next part-start, body, or part-end token.
     *
     * True means the token getters describe one current token. False means
     * either append_bytes() must supply another fragment or the closing
     * boundary is complete; inspect paused_at_incomplete_input() and
     * is_complete() to distinguish those states.
     *
     * @return bool True when a token is current, false when paused or complete.
     *
     * @throws InvalidArgumentException If multipart syntax or headers are invalid.
     */
    public function next_token(): bool {
        $this->current_token_type = null;
        $this->current_body_piece = '';
        $this->paused_at_incomplete_input = false;

        while (true) {
            if ($this->state === self::STATE_COMPLETE) {
                return false;
            }

            if ($this->state === self::STATE_BOUNDARY) {
                if (!$this->parse_boundary()) {
                    $this->paused_at_incomplete_input = true;
                    return false;
                }
                continue;
            }

            if ($this->state === self::STATE_HEADERS) {
                if (!$this->parse_headers()) {
                    $this->paused_at_incomplete_input = true;
                    return false;
                }
                return true;
            }

            if ($this->remaining_body_bytes === 0) {
                $this->state = self::STATE_BOUNDARY;
                $this->requires_part_terminator = true;
                $this->current_token_type = self::TOKEN_PART_END;
                return true;
            }
            if ($this->buffer === '') {
                $this->paused_at_incomplete_input = true;
                return false;
            }

            $body_bytes = min(
                $this->remaining_body_bytes,
                strlen($this->buffer),
                self::MAX_INPUT_FRAGMENT_BYTES
            );
            $this->current_body_piece = substr($this->buffer, 0, $body_bytes);
            $this->buffer = (string) substr($this->buffer, $body_bytes);
            $this->remaining_body_bytes -= $body_bytes;
            $this->current_token_type = self::TOKEN_BODY;
            return true;
        }
    }

    /**
     * Verifies that the exhausted transport ended after a closing boundary.
     *
     * The caller must first drain next_token() until it returns false. A clean
     * close makes this method idempotent. EOF in a body, header, delimiter, or
     * the CRLF between a body and its boundary is reported as truncation.
     *
     * @throws LogicException If a current token or unread fragment remains.
     * @throws RuntimeException If EOF arrived before the multipart close.
     */
    public function finish_input(): void {
        if ($this->input_finished) {
            return;
        }
        $has_unread_fragment = !$this->paused_at_incomplete_input && $this->state !== self::STATE_COMPLETE;
        if ($this->current_token_type !== null || $has_unread_fragment) {
            throw new LogicException('Call next_token() until it stops before finishing multipart input.');
        }
        $this->input_finished = true;
        if ($this->state === self::STATE_COMPLETE) {
            return;
        }
        if ($this->state === self::STATE_BODY) {
            throw new RuntimeException(
                'The multipart body ended before its declared Content-Length; '
                . $this->remaining_body_bytes . ' bytes remain.'
            );
        }
        if ($this->state === self::STATE_HEADERS) {
            throw new RuntimeException(
                'The multipart body ended while reading a part header block with '
                . strlen($this->buffer) . ' buffered bytes.'
            );
        }
        if ($this->requires_part_terminator) {
            throw new RuntimeException(
                'The multipart body ended before the CRLF and boundary following a part body; '
                . strlen($this->buffer) . ' separator bytes were available.'
            );
        }
        throw new RuntimeException(
            'The multipart body ended before its closing boundary with '
            . strlen($this->buffer) . ' buffered bytes.'
        );
    }

    /**
     * Indicates whether next_token() stopped because it needs another fragment.
     *
     * @return bool True when append_bytes() may supply more input.
     */
    public function paused_at_incomplete_input(): bool {
        return $this->paused_at_incomplete_input && !$this->input_finished;
    }

    /**
     * Indicates whether a syntactically complete closing boundary was consumed.
     *
     * @return bool True after the multipart message has cleanly closed.
     */
    public function is_complete(): bool {
        return $this->state === self::STATE_COMPLETE;
    }

    /**
     * Returns the type of the token exposed by the latest successful next_token().
     *
     * @return string One of the TOKEN_* constants.
     *
     * @throws LogicException If no token is current.
     */
    public function get_token_type(): string {
        if ($this->current_token_type === null) {
            throw new LogicException('No multipart token is current; call next_token() first.');
        }
        return $this->current_token_type;
    }

    /**
     * Returns the normalized headers belonging to the current part token.
     *
     * Header names are lowercase and unique. Folded physical lines have their
     * CRLF removed; leading whitespace after a colon is discarded while
     * continuation whitespace and trailing value whitespace are preserved.
     *
     * @return array<string,string> Current part headers by lowercase name.
     *
     * @throws LogicException If no part token is current.
     */
    public function get_current_headers(): array {
        if ($this->current_token_type === null) {
            throw new LogicException('No multipart part token is current; call next_token() first.');
        }
        return $this->current_headers;
    }

    /**
     * Returns the bytes exposed by the current body token.
     *
     * The returned string is replaced on the next next_token() call. Callers
     * should write or otherwise consume it before advancing.
     *
     * @return string Non-empty bounded body fragment.
     *
     * @throws LogicException If the current token is not TOKEN_BODY.
     */
    public function get_current_body_piece(): string {
        if ($this->current_token_type !== self::TOKEN_BODY) {
            throw new LogicException('The current multipart token does not contain body bytes.');
        }
        return $this->current_body_piece;
    }

    /**
     * Consumes one exact opening or closing delimiter line when available.
     *
     * @return bool True after a complete delimiter transition, false when its
     *     bytes are split across the next input fragment.
     *
     * @throws InvalidArgumentException If the separator or delimiter is invalid.
     */
    private function parse_boundary(): bool {
        if ($this->requires_part_terminator) {
            if (strlen($this->buffer) < 2) {
                return false;
            }
            $separator = substr($this->buffer, 0, 2);
            if ($separator !== "\r\n") {
                throw new InvalidArgumentException(
                    'A multipart part body must be followed by CRLF before its boundary; received '
                    . self::describe_bytes($separator) . '.'
                );
            }
            $this->buffer = (string) substr($this->buffer, 2);
            $this->requires_part_terminator = false;
        }

        $boundary_line = $this->read_syntax_line('the multipart boundary');
        if ($boundary_line === null) {
            return false;
        }
        if ($boundary_line === $this->delimiter . '--') {
            if ($this->buffer !== '') {
                throw new InvalidArgumentException(
                    'Multipart data contains ' . strlen($this->buffer) . ' bytes after the closing boundary.'
                );
            }
            $this->state = self::STATE_COMPLETE;
            $this->current_headers = [];
            return true;
        }
        if ($boundary_line !== $this->delimiter) {
            throw new InvalidArgumentException(
                'Expected multipart boundary "' . $this->delimiter . '"; received '
                . self::describe_bytes($boundary_line) . '.'
            );
        }

        $this->state = self::STATE_HEADERS;
        $this->current_headers = [];
        $this->current_header_bytes = 0;
        $this->pending_header_name = null;
        $this->pending_header_value = '';
        return true;
    }

    /**
     * Consumes header lines until one complete normalized header map is ready.
     *
     * @return bool True after exposing TOKEN_PART_START, false when the next
     *     physical header line is split across input fragments.
     *
     * @throws InvalidArgumentException If a line, field, duplicate, aggregate,
     *     or required Content-Length violates the Reprint grammar.
     */
    private function parse_headers(): bool {
        while (true) {
            $line = $this->read_syntax_line('a multipart part header');
            if ($line === null) {
                return false;
            }
            $this->current_header_bytes += strlen($line) + 2;
            if ($this->current_header_bytes > self::MAX_HEADER_BYTES) {
                throw new InvalidArgumentException(
                    'Multipart part headers exceed ' . self::MAX_HEADER_BYTES . ' bytes; received '
                    . $this->current_header_bytes . ' bytes.'
                );
            }

            if ($line !== '' && ( $line[0] === ' ' || $line[0] === "\t" )) {
                if ($this->pending_header_name === null) {
                    throw new InvalidArgumentException('Multipart part header continuation has no preceding header field.');
                }
                // MIME unfolding removes the physical CRLF but preserves the
                // continuation's whitespace as part of the logical value.
                $this->pending_header_value .= $line;
                continue;
            }

            $this->store_pending_header();
            if ($line === '') {
                $content_length = $this->current_headers['content-length'] ?? null;
                if (!is_string($content_length) || !preg_match('/^(?:0|[1-9][0-9]*)$/D', $content_length)) {
                    $received_content_length = is_string($content_length)
                        ? self::describe_bytes($content_length)
                        : 'no Content-Length header';
                    throw new InvalidArgumentException(
                        'Every Reprint multipart part requires a non-negative integer Content-Length; received '
                        . $received_content_length . '.'
                    );
                }
                $maximum_integer = (string) PHP_INT_MAX;
                if (strlen($content_length) > strlen($maximum_integer)
                    || ( strlen($content_length) === strlen($maximum_integer)
                        && strcmp($content_length, $maximum_integer) > 0 )) {
                    throw new InvalidArgumentException(
                        'Multipart part Content-Length exceeds this runtime\'s integer range: ' . $content_length . '.'
                    );
                }
                $this->remaining_body_bytes = (int) $content_length;
                $this->state = self::STATE_BODY;
                $this->current_token_type = self::TOKEN_PART_START;
                return true;
            }

            $colon = strpos($line, ':');
            if ($colon === false || $colon === 0) {
                throw new InvalidArgumentException(
                    'Malformed multipart part header ' . self::describe_bytes($line) . '.'
                );
            }
            $name = substr($line, 0, $colon);
            if (!preg_match('/^[!#$%&\'\*+\-.^_`|~0-9A-Za-z]+$/D', $name)) {
                throw new InvalidArgumentException(
                    'Multipart part has invalid header name ' . self::describe_bytes($name) . '.'
                );
            }
            $this->pending_header_name = strtolower($name);
            $this->pending_header_value = substr($line, $colon + 1);
        }
    }

    /**
     * Moves the pending physical field into the unique normalized map.
     *
     * A field remains pending while continuation lines arrive. It is stored
     * only when the next field or the header-block terminator is complete, so
     * continuation lines do not consume the distinct-header count.
     *
     * @throws InvalidArgumentException If the field repeats a name or exceeds
     *     the maximum distinct-header count.
     */
    private function store_pending_header(): void {
        if ($this->pending_header_name === null) {
            return;
        }
        $current_header_count = count($this->current_headers);
        if ($current_header_count >= self::MAX_HEADERS) {
            $received_header_count = $current_header_count + 1;
            throw new InvalidArgumentException(
                'Multipart part has more than ' . self::MAX_HEADERS . ' headers; received '
                . $received_header_count . '.'
            );
        }
        if (isset($this->current_headers[$this->pending_header_name])) {
            throw new InvalidArgumentException(
                'Multipart part repeats header ' . json_encode($this->pending_header_name) . '.'
            );
        }
        $this->current_headers[$this->pending_header_name] = ltrim($this->pending_header_value, " \t");
        $this->pending_header_name = null;
        $this->pending_header_value = '';
    }

    /**
     * Removes one required CRLF-terminated syntax line from the input buffer.
     *
     * @param string $description Human-readable construct named in failures.
     * @return string|null Line without CRLF, or null when the line is incomplete.
     *
     * @throws InvalidArgumentException If LF is bare or the physical line
     *     exceeds the fixed line limit before its CRLF arrives.
     */
    private function read_syntax_line(string $description): ?string {
        $line_feed = strpos($this->buffer, "\n");
        if ($line_feed === false) {
            if (strlen($this->buffer) > self::MAX_HEADER_LINE_BYTES + 1) {
                throw new InvalidArgumentException(
                    'Multipart ' . $description . ' exceeds ' . self::MAX_HEADER_LINE_BYTES
                    . ' bytes or is missing CRLF; buffered ' . strlen($this->buffer) . ' bytes.'
                );
            }
            return null;
        }
        if ($line_feed === 0 || $this->buffer[$line_feed - 1] !== "\r") {
            throw new InvalidArgumentException('Multipart ' . $description . ' must end with CRLF, not bare LF.');
        }
        $line_bytes = $line_feed - 1;
        if ($line_bytes > self::MAX_HEADER_LINE_BYTES) {
            throw new InvalidArgumentException(
                'Multipart ' . $description . ' exceeds ' . self::MAX_HEADER_LINE_BYTES
                . ' bytes; received ' . $line_bytes . ' bytes.'
            );
        }
        $line = substr($this->buffer, 0, $line_bytes);
        $this->buffer = (string) substr($this->buffer, $line_feed + 1);
        return $line;
    }

    /**
     * Validates a boundary before it is interpolated into delimiter lines.
     *
     * The accepted punctuation is MIME's bcharsnospace set. Spaces are
     * deliberately excluded even in a quoted parameter because Reprint never
     * emits them and the narrower set makes line interpretation unambiguous.
     *
     * @param string $boundary Boundary token without leading `--`.
     *
     * @throws InvalidArgumentException If the token is empty, overlong, or unsafe.
     */
    private static function validate_boundary(string $boundary): void {
        if ($boundary === '' || strlen($boundary) > self::MAX_BOUNDARY_BYTES) {
            throw new InvalidArgumentException(
                'Multipart boundary must contain between 1 and ' . self::MAX_BOUNDARY_BYTES
                . ' bytes; received ' . strlen($boundary) . ' bytes.'
            );
        }
        if (!preg_match("/^[0-9A-Za-z'()+_,.\\/:=?-]+$/D", $boundary)) {
            throw new InvalidArgumentException(
                'Multipart boundary contains unsupported characters: ' . self::describe_bytes($boundary) . '.'
            );
        }
    }

    /**
     * Formats arbitrary protocol bytes without assuming they are valid UTF-8.
     *
     * JSON keeps ordinary header values readable. Hexadecimal remains lossless
     * when malformed input contains bytes which json_encode() cannot represent.
     *
     * @param string $bytes Raw value observed on the multipart wire.
     * @return string Quoted JSON text or a hexadecimal byte string.
     */
    private static function describe_bytes(string $bytes): string {
        $json = json_encode($bytes);
        return $json === false ? '0x' . bin2hex($bytes) : $json;
    }
}

if (!class_exists('Site_Export_Multipart_Processor', false)) {
    class_alias(MultipartProcessor::class, 'Site_Export_Multipart_Processor');
}
